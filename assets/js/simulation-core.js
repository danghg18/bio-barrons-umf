/* Pure sampling and training scores. The 2023 concordance table is retained.
 * Official 2026 guide/regulation checked 2026-09-30 do not specify the detailed
 * scoring table or grade conversion. This remains biology-only training; equal
 * question weights and normalization to 10 are BioMed choices. See docs/simulation-scoring-sources.md.
 * Keep SCORING unchanged: no formula change, no historical result migration. */
(function () {
  'use strict';
  const COUNT = 35;
  const SCORING = 'umf-cluj-2023-equal-weights-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const normalize = values => [...new Set((Array.isArray(values) ? values : []).filter(x => /^[A-E]$/.test(x)))].sort();
  function scoreQuestion(correct, selected) {
    const key = normalize(correct), answer = normalize(selected);
    if (!answer.length) return 0;
    const matches = [...'ABCDE'].filter(letter => key.includes(letter) === answer.includes(letter)).length;
    if (matches === 5) return 1;
    if (key.length >= 2 && matches === 4) return .5;
    if (key.length >= 3 && matches === 3) return .25;
    return 0;
  }
  function shuffle(values, random = Math.random) {
    const result = values.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function allocate(chapters, random = Math.random) {
    if (!chapters.length || chapters.reduce((sum, chapter) => sum + chapter.questions.length, 0) < COUNT) {
      throw new Error('Alege capitole care conțin împreună cel puțin 35 de întrebări.');
    }
    const allocation = chapters.map(chapter => ({chapterNum:chapter.chapterNum, count:0, capacity:chapter.questions.length}));
    let remaining = COUNT;
    while (remaining) {
      for (const item of shuffle(allocation.filter(item => item.count < item.capacity), random)) {
        if (!remaining) break;
        item.count++; remaining--;
      }
    }
    return allocation.map(({chapterNum, count}) => ({chapterNum, count}));
  }
  function create(banks, allocation, minutes, now, id, random = Math.random) {
    if (![0,60,90,120].includes(minutes)) throw new Error('Durata testului nu este validă.');
    const selected = [];
    for (const item of allocation) {
      const bank = banks.find(bank => bank.chapterNum === item.chapterNum);
      if (!bank || !Number.isInteger(item.count) || item.count < 0 || item.count > bank.questions.length) throw new Error('Capitolele s-au schimbat. Alege-le din nou.');
      shuffle(bank.questions, random).slice(0,item.count).forEach(question => selected.push({
        ...clone(question), chapterNum:bank.chapterNum, chapterName:bank.name || '', sourceKey:bank.storageKey || String(bank.chapterNum), sourceUrl:bank.url || '', sourceVersion:bank.version || 1
      }));
    }
    if (selected.length !== COUNT || new Set(selected.map(q => q.sourceKey + ':' + q.id)).size !== COUNT) throw new Error('Nu s-au putut genera 35 de întrebări distincte.');
    return {version:1, scoringVersion:SCORING, id, revision:0, status:'active', startedAt:now,
      deadline:minutes ? now + minutes * 60000 : null, minutes, allocation:clone(allocation),
      questions:shuffle(selected,random), answers:Array.from({length:COUNT},()=>[]), completedAt:null, result:null};
  }
  function result(run) {
    const scores = run.questions.map((question,index) => scoreQuestion(question.correct,run.answers[index]));
    const points = scores.reduce((sum,score) => sum + score,0);
    return {scores,points,grade:10 * points / COUNT,full:scores.filter(x=>x===1).length,
      partial:scores.filter(x=>x>0 && x<1).length,zero:scores.filter(x=>x===0).length};
  }
  window.BBSimulationCore = {COUNT,SCORING,normalize,scoreQuestion,allocate,create,result};
}());
