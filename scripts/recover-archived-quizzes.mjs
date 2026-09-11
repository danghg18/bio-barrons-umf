// One-time, reproducible content recovery. Does not restore the old UI/controllers.
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';

const revision = '810246f';
const specs = [
  {num:1, slug:'introducere', file:'grile_introducere_anatomie_fiziologie.html', source:'assets/js/grile-introducere.js', prefix:'ia-', title:'Introducere în anatomie și fiziologie', lesson:'introducere_anatomie_fiziologie.html'},
  {num:20, slug:'sistemul-urinar', file:'grile_sistemul_urinar.html', source:'grile_sistemul_urinar.html', prefix:'ur-', title:'Sistemul urinar', lesson:'sistemul_renal_complet.html'},
  {num:22, slug:'reproducator-masculin', file:'grile_sistemul_reproducator_masculin.html', source:'grile_sistemul_reproducator_masculin.html', prefix:'rm-', title:'Sistemul reproducător masculin', lesson:'sistemul_reproducator_masculin.html'},
  {num:23, slug:'reproducator-feminin', file:'grile_sistemul_reproducator_feminin.html', source:'assets/js/grile-feminin.js', prefix:'rf-', title:'Sistemul reproducător feminin', lesson:'sistemul_reproducator_feminin.html'}
];
const template = readFileSync('grile_organele_de_simt.html','utf8');
const fixtures = [];
for (const spec of specs) {
  const source = execFileSync('git',['show',revision+':'+spec.source],{encoding:'utf8'});
  let questions;
  if (spec.num === 1) {
    const start = source.indexOf('const RAW_QUESTIONS=');
    questions = vm.runInNewContext(source.slice(start,source.indexOf('let quizState='))+'; QUESTIONS',{}, {timeout:1000});
  } else if (spec.num === 23) {
    const start = source.indexOf('const QUESTIONS=');
    questions = vm.runInNewContext(source.slice(start,source.indexOf('const ANALYSIS_KEY='))+'; QUESTIONS.map(q=>({...q, explanations:EXPLANATIONS[q.id], basis:REASONS[q.id]}))',{}, {timeout:1000});
  } else {
    const match = /const QUESTIONS\s*=\s*\[/.exec(source);
    const start = match.index + match[0].length - 1;
    questions = vm.runInNewContext('('+source.slice(start,source.indexOf('];',start)+1)+')',{}, {timeout:1000});
  }
  const ranges = Array.from({length:Math.ceil(questions.length/10)},(_,i)=>{
    const start=i*10+1,end=Math.min(start+9,questions.length);
    return {id:`grile-${start}-${end}`,start,end};
  });
  const dataset = {
    version:1, storageKey:`bb.quiz.${spec.slug}.v1`,
    title:`Grile · ${spec.title}`, firstNumber:1, questionCount:questions.length, idPrefix:spec.prefix,
    recoveredFrom:{revision, path:spec.source}, ranges,
    questions:questions.map(q=>({
      id:spec.prefix+String(q.id).padStart(3,'0'), number:q.id, sourceNumber:q.id,
      ...(q.original ? {originalNumber:q.original} : {}),
      topic:q.topic, ...(q.lessonSection ? {lessonSection:q.lessonSection,lessonPage:q.lessonPage} : {}),
      ...(q.basis ? {basis:q.basis} : {}), ...(q.askIncorrect ? {asksFalse:true} : {}),
      prompt:q.text, correct:[...q.correct].sort(),
      options:(Array.isArray(q.options)?q.options:Object.entries(q.options).map(([letter,text])=>({letter,text}))).map(option=>{
        const explanation=q.explanations?.[option.letter];
        if (!explanation?.text) throw new Error(`Missing archived explanation: ${spec.slug} ${q.id}${option.letter}`);
        return {...option, why:explanation.text, ...(explanation.added ? {added:explanation.added} : {})};
      })
    }))
  };
  const dataFile=`assets/js/grile-${spec.slug}-data.js`;
  writeFileSync(dataFile,`// Recovered verbatim from ${revision}:${spec.source}.\nwindow.BB_QUIZ = ${JSON.stringify(dataset,null,2)};\n`);
  let html=template.replaceAll('grile_organele_de_simt.html',spec.file)
    .replaceAll('organele_de_simt.html',spec.lesson)
    .replaceAll('Organele de simț',spec.title).replaceAll('organele de simț',spec.title)
    .replaceAll('Capitol 12',`Capitol ${spec.num}`)
    .replaceAll('100',String(questions.length))
    .replace('assets/js/grile-organe-de-simt-data.js?v=20260909-editorial1',dataFile+'?v=20260910-recovery1');
  const links=ranges.map((r,i)=>`    <a class="quiz-nav-link${i===0?' active':''}" href="#${r.id}" onclick="goto('${r.id}')"><span>Grilele ${r.start}–${r.end}</span><span class="quiz-nav-count" data-range-progress="${r.id}">0/${r.end-r.start+1}</span></a>`).join('\n');
  html=html.replace(/    <a class="quiz-nav-link[\s\S]*?(?=    <div class="quiz-sidebar-summary")/,links+'\n');
  html=html.replace(/    <div class="page-section active"[\s\S]*?(?=  <\/main>)/,ranges.map((r,i)=>`    <div class="page-section${i===0?' active':''}" id="page-${r.id}"></div>`).join('\n')+'\n');
  writeFileSync(spec.file,html);
  fixtures.push({...spec,dataFile,count:questions.length,sha256:createHash('sha256').update(JSON.stringify(dataset.questions)).digest('hex')});
  console.log(`${spec.title}: ${questions.length} questions recovered`);
}
writeFileSync('tests/recovered-quizzes.json',JSON.stringify({revision,quizzes:fixtures},null,2)+'\n');
