import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const local = new Map();
const ctx = {window:{}, document:new EventTarget(), CustomEvent, Event, setTimeout, clearTimeout, structuredClone, console};
ctx.window = Object.assign(new EventTarget(), {setTimeout,clearTimeout,localStorage:{getItem:key=>local.get(key)||null,setItem:(key,value)=>local.set(key,value),removeItem:key=>local.delete(key)}});
vm.createContext(ctx);
for (const file of ['user-storage','study-state']) {
  try { vm.runInContext(await readFile(new URL('../assets/js/'+file+'.js',import.meta.url),'utf8'),ctx); } catch(e) { if(e.code!=='ENOENT') throw e; }
}
assert.ok(ctx.window.BBUserStorage, 'Owner-scoped local-first storage must exist');
ctx.window.BBStudyState.completeSection(11,'sistem-nervos-central');
assert.equal(ctx.window.BBUserStorage.get('bb.study.v1').lessons[11].completedSections[0],'sistem-nervos-central');
console.log('PASS local-first study adapter');
