import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context = {window:{}};
vm.createContext(context);
vm.runInContext(await readFile(new URL('../assets/js/search-text.js', import.meta.url),'utf8'), context);
try { vm.runInContext(await readFile(new URL('../assets/js/glossary-search.js', import.meta.url),'utf8'), context); } catch(error) { if(error.code !== 'ENOENT') throw error; }
assert.ok(context.window.BBGlossarySearch, 'Glossary search must expose exact and normal search');
const search = context.window.BBGlossarySearch;
const entries = [
 {id:'a',term:'venule',definition:'Vene mici.'},
 {id:'b',term:'ventriculi cerebrali',definition:'Cavități pline cu lichid cefalorahidian, la nivel cerebral.'},
 {id:'c',term:'venă',definition:'Un termen cu diacritice.'},
 {id:'d',term:'acid dezoxiribonucleic (ADN)',definition:'Acid nucleic ce conține informația ereditară.'},
 {id:'e',term:'alt termen',definition:'Procent 10% și semne a+b [x].'},
 {id:'f',term:'vene',definition:'Vase ce aduc sângele la inimă.'},
];
const ids = (q,o) => Array.from(search.find(entries,q,o), e => e.id);
assert.deepEqual(ids(' VENA ', {exact:true}), ['c'], 'Exact matching folds case, diacritics and spaces');
assert.deepEqual(ids('ven', {exact:true}), [], 'Exact search excludes prefixes and definition-only matches');
assert.deepEqual(ids('vene', {}), ['f','a'], 'Exact headword precedes definition matches');
assert.deepEqual(ids('ventriculi  cerebrali', {exact:true}), ['b']);
assert.deepEqual(ids('lichid cerebral', {}), ['b'], 'All query words must occur within one entry');
assert.deepEqual(ids('lichid inimă', {}), []);
assert.deepEqual(ids('10%', {}), ['e'], 'Literal percent is searchable');
assert.deepEqual(ids('a+b [x]', {}), ['e'], 'Search input is not interpreted as a regex');
assert.deepEqual(ids('ADN', {exact:true}), [], 'Exact requires full printed headword');
assert.deepEqual(ids('ADN', {}), ['d']);
assert.deepEqual(ids('', {letter:'V'}), ['a','b','c','f']);
assert.deepEqual(ids('vene', {letter:'A'}), [], 'Letter filter intersects query');
assert.deepEqual(ids('   ', {exact:true}), ['a','b','c','d','e','f']);
assert.deepEqual(Array.from(search.ranges('Țesut și țesut', 'tesut'), r => Array.from(r)), [[0,5],[9,14]], 'Highlights preserve Romanian character offsets');
assert.deepEqual(Array.from(search.ranges('a+b [x]', '[x]'), r => Array.from(r)), [[4,7]]);
console.log('Glossary search: exact/normal, ranking, multiword, diacritics, literal symbols, alphabet and highlight offsets passed.');
