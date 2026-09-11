import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// Stale SELECTs and late upserts must preserve another tab's acknowledged edit.
// All storage, locks, and requests below are in memory; no real account is used.
const source = await Promise.all(['user-storage', 'cloud-sync'].map(name =>
  readFile(new URL('../assets/js/' + name + '.js', import.meta.url), 'utf8')));
async function runScenario(useLocks, race = 'read') {
  const disk = new Map();
  const locks = new Map();
  const owner = 'test-owner';
  const before = {version:1, lessons:{}, lastVisited:null};
  const after = {version:1, lessons:{1:{completedSections:['home'], updatedAt:'2026-09-11T12:00:00Z'}}, lastVisited:null};
  let remote = structuredClone(before);
  let releaseRead;
  const delayedRead = new Promise(resolve => { releaseRead = resolve; });
  let readStarted = false;
  let writeStarted = false;
  let writes = 0;
  const timers = new Map();
  let nextTimer = 0;

  function requestLock(name, callback) {
    const previous = locks.get(name) || Promise.resolve();
    const next = previous.catch(() => {}).then(callback);
    locks.set(name, next.catch(() => {}));
    return next;
  }

  function browser(delayFirstRead = false) {
    const document = new EventTarget();
    const window = Object.assign(new EventTarget(), {
      BB_QUIZ_INDEX:[],
      localStorage:{
        get length() { return disk.size; },
        key:index => [...disk.keys()][index] ?? null,
        getItem:key => disk.get(key) ?? null,
        setItem:(key, value) => disk.set(key, value),
        removeItem:key => disk.delete(key)
      }
    });
    let delay = delayFirstRead;
    const client = {from:table => ({
      select:() => ({eq:async (_column, id) => {
        assert.equal(id, owner);
        const data = table === 'study_state'
          ? [{user_id:owner, version:1, state:structuredClone(remote)}] : [];
        if (table === 'study_state' && delay && race === 'read') {
          delay = false;
          readStarted = true;
          await delayedRead;
        }
        return {data, error:null};
      }}),
      upsert:async row => {
        assert.equal(table, 'study_state');
        assert.equal(row.user_id, owner);
        if (delay && race === 'write') {
          delay = false;
          writeStarted = true;
          await delayedRead;
        }
        remote = structuredClone(row.state);
        writes++;
        return {error:null};
      }
    })};
    // Controlled timers let the final settle drive any required repair flush.
    const context = vm.createContext({window, document, CustomEvent,
      navigator:{onLine:true, ...(useLocks ? {locks:{request:requestLock}} : {})},
      setTimeout:callback => { const id = ++nextTimer; timers.set(id, callback); return id; },
      clearTimeout:id => timers.delete(id)});
    vm.runInContext(source[0], context);
    window.BBUserStorage.activate(owner);
    window.BBAuth = {ready:Promise.resolve(), getState:() => ({user:{id:owner}, configured:true})};
    window.BBSupabase = {get:() => client};
    vm.runInContext(source[1], context);
    return window;
  }

  async function settleUntil(predicate, label) {
    for (let i = 0; i < 100; i++) {
      if (predicate()) return;
      const scheduled = [...timers.values()];
      timers.clear();
      scheduled.forEach(callback => callback());
      await new Promise(resolve => setImmediate(resolve));
    }
    assert.fail(label);
  }

  const b = browser();
  await settleUntil(() => b.BBCloudSync.getState().status === 'synced', 'Tab B should hydrate first');
  const a = browser(true);
  let firstSync;
  if (race === 'read') {
    await settleUntil(() => readStarted, 'Tab A should start its delayed SELECT');
  } else {
    await settleUntil(() => a.BBCloudSync.getState().status === 'synced', 'Tab A should hydrate before editing');
    a.BBUserStorage.set('bb.study.v1', {...before, lastVisited:{chapterNum:1, sectionId:'intro'}});
    firstSync = a.BBCloudSync.retry();
    await settleUntil(() => writeStarted, 'Tab A should start its delayed upsert');
  }
  b.BBUserStorage.set('bb.study.v1', after);
  let secondFinished = false;
  const secondSync = b.BBCloudSync.retry().then(() => { secondFinished = true; });
  // With either bug, B writes/acks while A waits for an old read or write. With
  // full-cycle locking, B waits behind A and its pending revision stays protected.
  for (let i = 0; i < 20 && !secondFinished; i++) {
    await new Promise(resolve => setImmediate(resolve));
  }
  releaseRead();
  await secondSync;
  await firstSync;
  await settleUntil(() => a.BBCloudSync.getState().status === 'synced', 'Tab A should finish synchronization');
  assert.deepEqual(JSON.parse(JSON.stringify(a.BBUserStorage.get('bb.study.v1'))), after,
    'A delayed operation must not roll back a newer state written and acknowledged in another tab');
  assert.deepEqual(remote, after, 'The final cloud state preserves the completed section');
  assert.equal(Object.keys(a.BBUserStorage.snapshot().pending).length, 0, 'The latest revision is acknowledged');
  assert.ok(writes > 0, 'The regression must exercise an actual mocked cloud upsert');
  console.log('PASS accounts sync race (' + (useLocks ? 'Web Locks' : 'no Web Locks') + ', delayed ' + race + '): another tab write/ack preserves latest progress.');
}

await runScenario(true);
await runScenario(false);
await runScenario(true, 'write');
await runScenario(false, 'write');
