import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),ctx={window:{}};
vm.runInNewContext(await readFile(new URL('assets/js/quiz-index.js',root),'utf8'),ctx);
for(const entry of ctx.window.BB_QUIZ_INDEX){
 assert.ok(entry.bankUrl,`Chapter ${entry.chapterNum} exposes a generated simulation bank`);
 const bank=JSON.parse(await readFile(new URL(entry.bankUrl,root),'utf8'));
 const html=await readFile(new URL(entry.url,root),'utf8');
 const dataPath=html.match(/src="([^"?]*grile-[^"?]+-data.js)/)[1];const source={window:{}};
 vm.runInNewContext(await readFile(new URL(dataPath,root),'utf8'),source);
 const quiz=source.window.BB_QUIZ||source.window.BB_NERVOUS_QUIZ;
 assert.deepEqual(bank.questions,JSON.parse(JSON.stringify(quiz.questions)),'All text, source numbers and explanations preserved');
 assert.equal(bank.storageKey,entry.storageKey);assert.equal(bank.chapterNum,entry.chapterNum);
}
console.log('Simulation banks exactly preserve all registered authored datasets.');
