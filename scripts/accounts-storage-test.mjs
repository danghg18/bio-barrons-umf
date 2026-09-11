import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const code = await readFile(new URL('../assets/js/user-storage.js', import.meta.url), 'utf8');
const study = section => ({version:1, lessons:{}, lastVisited:{chapterNum:1, sectionId:section}});
let assertions = 0;
function equal(actual, expected, label) { assert.deepEqual(JSON.parse(JSON.stringify(actual)), expected, label); assertions++; }
function browser(disk = new Map(), options = {}) {
  const win = Object.assign(new EventTarget(), {BB_QUIZ_INDEX:[{storageKey:'bb.quiz.celula.v1'}]});
  win.localStorage = {
    get length() { return disk.size; },
    key:index => [...disk.keys()][index] ?? null,
    getItem(key) { if (options.readDenied) throw Error('Denied'); return disk.get(key) ?? null; },
    setItem(key, value) { options.beforeWrite?.(key, value); if (options.writeDenied) throw Error('QuotaExceeded'); disk.set(key, value); },
    removeItem(key) { if (options.writeDenied) throw Error('QuotaExceeded'); disk.delete(key); }
  };
  vm.runInNewContext(code, {window:win, document:new EventTarget(), CustomEvent});
  return Object.assign(win, {adapter:win.BBUserStorage});
}
function notify(win, key, newValue) {
  const event = new Event('storage'); Object.assign(event, {key, newValue}); win.dispatchEvent(event);
}
{
  const disk = new Map([['bb.study.v1', JSON.stringify(study('guest'))]]);
  const a = browser(disk);
  equal(a.adapter.get('bb.study.v1'), study('guest'), 'Existing raw guest state is imported');
  a.adapter.activate('alice');
  a.adapter.hydrate({});
  const first = a.adapter.snapshot();
  assert.ok(first.pending['bb.study.v1']); assertions++;
  a.adapter.set('note:1:home', {chapter_num:1, section_id:'home', body:'Alice private'});
  a.adapter.set('bb.study.v1', study('alice'));
  const beforeBoot = disk.get('bb.cache-owner.v1');
  const b = browser(disk);
  equal(disk.get('bb.cache-owner.v1'), beforeBoot, 'Another page boot preserves active owner');
  equal(b.adapter.owner(), 'guest', 'New page keeps private data quarantined until auth');
  equal(b.adapter.get('note:1:home'), null, 'Quarantine cannot read last account note');
  b.adapter.activate('alice');
  equal(b.adapter.get('bb.study.v1'), study('alice'), 'Restored session uses account cache');
  equal(b.adapter.get('note:1:home').body, 'Alice private', 'Notes discovered from per-record storage across reload');
  equal(Object.keys(b.adapter.snapshot().pending).sort(), ['bb.study.v1', 'note:1:home'], 'Offline pending outbox survives reload');
  b.adapter.activate('bob');
  equal(b.adapter.get('bb.study.v1'), null, 'Second account never imports first account or already claimed guest progress');
  equal(b.adapter.get('note:1:home'), null, 'Second account has separate notes');
  a.BBAuth = {getState:() => ({user:{id:'alice'}})};
  notify(a, 'bb.cache-owner.v1', 'bob');
  equal(a.adapter.owner(), 'guest', 'Other account switch quarantines stale tab');
  equal(a.adapter.set('bb.study.v1', study('leak')), false, 'Stale tab write is rejected');
  b.adapter.activate('alice');
  notify(a, 'bb.cache-owner.v1', 'alice');
  equal(a.adapter.owner(), 'alice', 'Matching verified account restores existing tab');
  equal(a.adapter.get('note:1:home').body, 'Alice private', 'Original private data preserved through switch');
  b.adapter.activate('guest');
  equal(a.adapter.hydrate({'bb.study.v1':study('private-late-response')}), false, 'Stale account hydration rejected before queued identity event arrives');
  equal(JSON.parse(disk.get('bb.study.v1')), study('guest'), 'Late response cannot write private data into guest mirrors');
  equal(b.adapter.get('bb.study.v1'), study('guest'), 'Logout restores original guest cache');
  equal(b.adapter.get('note:1:home'), null, 'Logout hides account notes');
}
console.log('PASS storage: guest migration once, private cache isolation, cross-tab boot/switch/logout, offline reload');
{
  const disk = new Map();
  const options = {};
  const a = browser(disk, options); a.adapter.activate('alice');
  const b = browser(disk); b.adapter.activate('alice');
  let interleaved = false;
  options.beforeWrite = key => {
    if (interleaved || !key.startsWith('bb.user-')) return;
    interleaved = true;
    b.adapter.set('note:2:cell', {chapter_num:2, section_id:'cell', body:'Tab B'});
  };
  a.adapter.set('note:1:home', {chapter_num:1, section_id:'home', body:'Tab A'});
  equal(interleaved, true, 'Writes were interleaved inside storage mutation');
  equal(a.adapter.get('note:1:home').body, 'Tab A', 'First concurrent record preserved');
  equal(a.adapter.get('note:2:cell').body, 'Tab B', 'Unrelated concurrent record preserved');
  equal(Object.keys(a.adapter.snapshot().pending).sort(), ['note:1:home', 'note:2:cell'], 'Both pending revisions survive interleaving');
  options.beforeWrite = undefined;
  a.adapter.set('bb.study.v1', study('new'));
  notify(b, 'bb.study.v1', JSON.stringify(study('stale-event')));
  equal(b.adapter.get('bb.study.v1'), study('new'), 'Delayed mirror event never rolls back canonical data');
  const oldRevision = a.adapter.snapshot().pending['bb.study.v1'];
  let ackInterleaved = false;
  options.beforeWrite = key => {
    if (ackInterleaved || !key.startsWith('bb.user-ack.v1:')) return;
    ackInterleaved = true; b.adapter.set('bb.study.v1', study('newer-during-ack'));
  };
  a.adapter.acknowledge('bb.study.v1', oldRevision);
  equal(ackInterleaved, true, 'New edit interleaved with acknowledgement');
  equal(a.adapter.get('bb.study.v1'), study('newer-during-ack'), 'Acknowledgement cannot overwrite newer edit');
  assert.ok(a.adapter.snapshot().pending['bb.study.v1']); assertions++;
  options.beforeWrite = undefined;
  a.adapter.acknowledge('bb.study.v1', a.adapter.snapshot().pending['bb.study.v1']);
  equal(a.adapter.snapshot().pending['bb.study.v1'] ?? null, null, 'Current acknowledgement clears pending logically');
  a.adapter.set('bb.study.v1', study('dirty'));
  for (let i = 0; i < 4; i++) a.adapter.hydrate({'bb.study.v1':study('cloud')});
  equal(a.adapter.snapshot().backups.filter(item => item.key === 'bb.study.v1').length, 1, 'Repeated identical conflicts create one backup');
  equal(a.adapter.get('bb.study.v1'), study('dirty'), 'Dirty local record survives cloud hydration');
}
console.log('PASS storage: concurrent distinct records, delayed events, acknowledgement race, conflict deduplication');
{
  const disk = new Map(); const options = {};
  const a = browser(disk, options); a.adapter.activate('alice');
  a.adapter.set('note:9:existing', {chapter_num:9, section_id:'existing', body:'Persisted before quota'});
  // A new tab has not read this note yet when the next write fails.
  const b = browser(disk, options); b.adapter.activate('alice');
  options.writeDenied = true;
  b.adapter.set('bb.study.v1', study('quota-draft'));
  equal(b.adapter.get('bb.study.v1'), study('quota-draft'), 'Readable stale disk cannot replace unsaved memory draft');
  equal(b.adapter.get('note:9:existing').body, 'Persisted before quota', 'Previously unread persisted records remain accessible after quota failure');
  assert.ok(b.adapter.snapshot().pending['bb.study.v1']); assertions++;
  equal(b.adapter.canPersist(), false, 'Persistence failure exposed');
  b.adapter.authStorage.setItem('test.auth', 'session-memory');
  equal(b.adapter.authStorage.getItem('test.auth'), 'session-memory', 'Auth storage retains failed-write session in memory');
  b.adapter.authStorage.removeItem('test.auth');
  equal(b.adapter.authStorage.getItem('test.auth'), null, 'Auth memory removal is a tombstone');
  const unavailable = browser(new Map(), {readDenied:true, writeDenied:true});
  unavailable.adapter.set('bb.study.v1', study('memory-only'));
  equal(unavailable.adapter.get('bb.study.v1'), study('memory-only'), 'All-storage-denied mode remains usable');
}
console.log('PASS storage: write-only quota failure, readable old records, auth memory fallback, storage denied');
{
  const disk = new Map([
    ['bb.cache-owner.v1', 'alice'],
    ['bb.user-cache.v1:alice', JSON.stringify({values:{'bb.study.v1':study('legacy'), 'note:1:home':{chapter_num:1,section_id:'home',body:'Legacy note'}}, pending:{'bb.study.v1':'legacy-revision'}, backups:[], imported:true})]
  ]);
  const a = browser(disk); a.adapter.activate('alice');
  equal(a.adapter.get('bb.study.v1'), study('legacy'), 'Existing whole-vault cache remains readable');
  equal(a.adapter.snapshot().pending['bb.study.v1'], 'legacy-revision', 'Existing pending revision retained');
  a.adapter.set('bb.study.v1', study('modern'));
  equal(a.adapter.get('note:1:home').body, 'Legacy note', 'Updating one migrated record preserves other old records');
  equal(a.adapter.get('bb.study.v1'), study('modern'), 'Per-record value overrides its old fallback');
}
console.log(`PASS accounts storage: ${assertions} assertions.`);
