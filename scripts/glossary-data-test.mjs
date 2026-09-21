import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context={window:{}};
vm.runInNewContext(await readFile(new URL('../assets/js/glossary-data.js',import.meta.url),'utf8'),context);
const data=context.window.BB_GLOSSARY.entries;
// Independent page inventory from two visual passes over the supplied scan.
const inventory=[
 [579,40,'abdomen','artere'],[580,47,'arteriole','ciclu cardiac'],[581,42,'ciclu Krebs','diencefal'],
 [582,43,'difuziune','fecundare'],[583,41,'făt','glande paratiroide'],[584,36,'glande sudoripare','imunitate mediată celular'],
 [585,42,'imunoglobulină','menopauză'],[586,40,'menstruație','nod atrioventricular'],[587,45,'nod sinoatrial','posterior'],
 [588,42,'potențial de acțiune','sistem nervos simpatic'],[589,38,'somatotrop','valve semilunare'],[590,15,'vas deferens','zigot']
];
assert.equal(data.length,471,'No source entry may be omitted');
assert.equal(new Set(data.map(entry=>entry.id)).size,471,'Permalinks must be unique');
for(const [page,count,first,last] of inventory){
 const rows=data.filter(entry=>entry.sourcePage===page);assert.equal(rows.length,count,`Page ${page} entry inventory`);
 assert.equal(rows[0].term,first);assert.equal(rows.at(-1).term,last);
}
for(const entry of data){assert.match(entry.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);assert.ok(entry.term.trim()&&entry.definition.trim());assert.ok(entry.sourcePage>=579&&entry.sourcePage<=590);}
const definition=term=>data.find(entry=>entry.term===term)?.definition;
assert.equal(definition('abdomen'),'Zona dintre diafragmă și pelvis.');
assert.equal(definition('zigot'),'Ovul fecundat.');
assert.match(definition('imunitate mediată celular'),/microorganisme, sau celulele străine, și eliberează substanțe chimice ce reglează răspunsul imun\.$/,'Definition must retain its continuation on the next page');
console.log('Glossary data: 471 unique entries, all 12 audited page inventories and cross-page continuation passed.');
