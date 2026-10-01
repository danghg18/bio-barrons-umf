(function () {
  'use strict';
  const core=window.BBSimulationCore, store=window.BBSimulationStore, ui=window.BBSimulationUI, storage=window.BBUserStorage;
  const $=id=>document.getElementById(id), id=new URLSearchParams(location.search).get('test');
  let run=null, owner=storage.owner(), epoch=0, nextRevision=0, queue=Promise.resolve(), finishing=false;
  let current=1, page=0;
  function message(text) {$('sim-error').textContent=text;$('sim-error').hidden=!text;}
  function persistence() {$('sim-storage-error').hidden=!run || storage.canPersist();}
  function setPosition() {
    const match=location.hash.match(/^#intrebarea-(\d+)$/), value=Number(match?.[1]);
    current=Number.isInteger(value) && value>=1 && value<=35?value:1;page=Math.floor((current-1)/10);
  }
  function controls() {
    if(!run)return;
    const done=run.status==='completed', answered=run.answers.filter(answer=>answer.length).length;
    $('sim-progress').textContent=answered+' / 35 completate';
    $('sim-submit').hidden=done;$('sim-submit').disabled=finishing;
    $('sim-map').innerHTML=run.questions.map((question,index)=>{
      const value=index+1, filled=run.answers[index].length>0;
      return '<a href="#intrebarea-'+value+'" class="'+(filled?'is-answered ':'')+(value===current?'is-current':'')+'" '+(value===current?'aria-current="step" ':'')+'aria-label="Întrebarea '+value+(filled?', completată':', necompletată')+'">'+value+'</a>';
    }).join('');
    const end=done?run.completedAt:Date.now();
    $('sim-timer').textContent=!done && run.deadline!==null?'Rămas '+ui.duration(run.deadline-Date.now()):'Timp '+ui.duration(end-run.startedAt);
    $('sim-timer').classList.toggle('is-urgent',!done && run.deadline!==null && run.deadline-Date.now()<=300000);
  }
  function renderQuestions() {
    if(!run)return;
    const done=run.status==='completed';
    $('sim-instruction').textContent=done?'Revizuirea testului: verde = selectată corect, galben = răspuns corect omis, roșu = selectată în plus.':'Bifează variantele alese. Poți reveni la orice întrebare înainte de predare.';
    $('sim-questions').innerHTML=run.questions.slice(page*10,page*10+10).map((question,offset)=>{
      const index=page*10+offset, selected=run.answers[index];
      const options=question.options.map(option=>{
        const checked=selected.includes(option.letter), correct=question.correct.includes(option.letter);
        const state=done?(correct?(checked?'Selectată corect':'Răspuns corect omis'):(checked?'Selectată în plus':'Neselectată corect')):'';
        const className=done?(correct?(checked?'is-correct':'is-missed'):(checked?'is-extra':'')):'';
        const description='sim-option-'+index+'-'+option.letter;
        return '<div class="sim-option-wrap '+className+'"><label class="sim-option"><input type="checkbox" data-index="'+index+'" value="'+option.letter+'" '+(checked?'checked ':'')+(done||finishing?'disabled ':'')+(done?'aria-describedby="'+description+'" ':'')+'><span class="sim-letter" aria-hidden="true">'+option.letter+'</span><span>'+ui.html(option.text)+'</span></label>'+(done?'<div class="sim-explanation" id="'+description+'"><strong>'+state+'</strong>'+(option.why?'<p>'+ui.html(option.why)+'</p>':'')+(option.added?'<p>'+ui.html(option.added)+'</p>':'')+'</div>':'')+'</div>';
      }).join('');
      return '<article class="sim-question" id="intrebarea-'+(index+1)+'" tabindex="-1"><div class="sim-question-head"><span>Întrebarea '+(index+1)+'</span><span>'+ui.html(question.chapterName)+'</span></div><fieldset><legend>'+ui.html(question.prompt)+'</legend><div class="sim-options">'+options+'</div></fieldset>'+(done?'<p class="sim-question-score">'+ui.number(run.result.scores[index],2)+' / 1 punct · Barem: '+ui.html(question.correct.join(', '))+' · Ai ales: '+ui.html(selected.join(', ')||'niciun răspuns')+'</p><a class="sim-source" href="'+ui.html(question.sourceUrl)+'#grila-'+question.number+'">Grila '+(question.sourceNumber || question.number)+' din capitol</a>':'')+'</article>';
    }).join('');
    $('sim-pagination').innerHTML=Array.from({length:4},(_,index)=>'<a class="sim-secondary" href="#intrebarea-'+(index*10+1)+'" '+(index===page?'aria-current="page"':'')+'>'+ (index*10+1)+'–'+Math.min(35,index*10+10)+'</a>').join('');
    controls();
  }
  function renderResult() {
    const done=run?.status==='completed';$('sim-result').hidden=!done;
    if(!done){$('sim-result').replaceChildren();return;}
    const result=run.result;
    $('sim-result').innerHTML='<div class="sim-grade-block"><div><p class="sim-kicker">Test predat</p><h2 id="sim-result-title">Nota de antrenament — Biologie</h2><p>Reguli din 2023 · Ponderi egale · Formula detaliată pentru 2026 neconfirmată</p></div><div class="sim-grade">'+ui.number(result.grade)+'<span>din 10</span></div></div><div class="sim-result-facts"><span><strong>'+ui.number(result.points)+'</strong> din 35 de puncte</span><span><strong>'+ui.duration(run.completedAt-run.startedAt)+'</strong> timp de lucru</span><span><strong>'+result.full+'</strong> integral</span><span><strong>'+result.partial+'</strong> parțial</span><span><strong>'+result.zero+'</strong> cu zero</span></div><div class="sim-result-actions"><button id="sim-repeat" type="button" class="sim-primary">Test nou cu aceleași capitole</button><a href="testare.html#simulation-history" class="sim-secondary">Istoricul simulărilor</a><button id="sim-result-export" type="button" class="sim-link-button">Exportă rezultatul</button></div>';
    $('sim-result-export').addEventListener('click',()=>ui.exportRun(run));
    $('sim-repeat').addEventListener('click',async()=>{
      const ticket=epoch, previous=run, button=$('sim-repeat');button.disabled=true;message('');
      try{
        const next=await ui.start(previous.allocation.map(item=>item.chapterNum),previous.minutes,null,owner);
        if(ticket!==epoch)return;
        if(!storage.canPersist())throw new Error('Testul nou nu poate fi salvat permanent. Eliberează spațiu în browser și încearcă din nou.');
        location.href='simulare.html?test='+encodeURIComponent(next.id);
      }catch(error){if(ticket===epoch){message(error.message);button.disabled=false;}}
    });
  }
  function refresh() {
    epoch++;owner=storage.owner();run=id?store.get(id):null;finishing=false;
    $('sim-confirm').close();message('');
    $('sim-workspace').hidden=!run;$('sim-unavailable').hidden=!!run;
    if(!run){$('sim-questions').replaceChildren();$('sim-map').replaceChildren();$('sim-subtitle').textContent='';renderResult();persistence();return;}
    nextRevision=run.revision;setPosition();
    const names=[...new Set(run.questions.map(question=>question.chapterName))];
    $('sim-subtitle').textContent='35 de întrebări · '+names.join(' · ');
    renderResult();renderQuestions();persistence();tick();
    if(run.syncConflicts?.length)message('Au existat modificări concurente pe două dispozitive. Sunt afișate răspunsurile sincronizate; variantele sunt păstrate în exportul simulării. Poți verifica răspunsurile înainte de predare.');
  }
  function edit(operation) {
    if(!run || run.status==='completed')return;
    const ticket=epoch, expected=nextRevision++, expectedOwner=owner;
    queue=queue.then(async()=>{
      if(ticket!==epoch)return;
      try{
        const updated=await store.update(id,expected,expectedOwner,operation);
        if(ticket!==epoch)return;
        run=updated;
        if(run.status==='completed'){
          finishing=false;$('sim-confirm').close();renderResult();renderQuestions();$('sim-result').focus();
        } else controls();
        persistence();
      }catch(error){
        if(ticket!==epoch)return;
        refresh();message(error.message);
      }
    });
  }
  function finish() {
    if(!run || run.status!=='active' || finishing)return;
    finishing=true;$('sim-submit').disabled=true;$('sim-confirm-submit').disabled=true;
    $('sim-questions').querySelectorAll('input').forEach(input=>input.disabled=true);
    edit({type:'finish'});
  }
  function tick() {
    if(!run)return;
    const done=run.status==='completed', now=Date.now();
    $('sim-timer').textContent=!done && run.deadline!==null?'Rămas '+ui.duration(run.deadline-now):'Timp '+ui.duration((done?run.completedAt:now)-run.startedAt);
    $('sim-timer').classList.toggle('is-urgent',!done && run.deadline!==null && run.deadline-now<=300000);
    if(!done && run.deadline!==null && now>=run.deadline)finish();
  }
  $('sim-questions').addEventListener('change',event=>{
    const input=event.target.closest('input[data-index]');if(!input || finishing)return;
    const index=Number(input.dataset.index), selected=[...input.closest('fieldset').querySelectorAll('input:checked')].map(node=>node.value);
    edit({type:'answer',index,selected});
  });
  $('sim-submit').addEventListener('click',async()=>{
    await queue;if(!run || run.status==='completed' || finishing)return;
    const unanswered=run.answers.filter(answer=>!answer.length).length;
    $('sim-confirm-copy').textContent=unanswered?'Ai '+unanswered+' '+(unanswered===1?'întrebare fără răspuns. Aceasta primește':'întrebări fără răspuns. Acestea primesc')+' zero puncte.':'Ai răspuns la toate cele 35 de întrebări.';
    $('sim-confirm-submit').disabled=false;$('sim-confirm').showModal();
  });
  $('sim-cancel').addEventListener('click',()=>$('sim-confirm').close());
  $('sim-confirm-submit').addEventListener('click',finish);
  $('sim-export').addEventListener('click',()=>ui.exportRun(run));
  window.addEventListener('hashchange',async()=>{
    await queue;if(!run)return;setPosition();renderQuestions();
    $('intrebarea-'+current)?.focus();
  });
  document.addEventListener('bb:cache-owner-change',refresh);
  document.addEventListener('bb:cache-change',()=>{
    const latest=id?store.get(id):null;
    if(JSON.stringify(latest)!==JSON.stringify(run) || storage.owner()!==owner){refresh();if(run)message(run.syncConflicts?.length ? 'Modificări concurente: verifică răspunsurile afișate. Variantele sunt păstrate în exportul simulării.' : 'Testul a fost actualizat pe alt dispozitiv sau în altă filă. Sunt afișate răspunsurile salvate.');}
  });
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')tick();});
  window.addEventListener('pageshow',()=>{if(run)refresh();});
  window.addEventListener('beforeunload',event=>{if(run && !storage.canPersist()){event.preventDefault();event.returnValue='';}});
  setInterval(tick,1000);
  if(window.BBAuth)window.BBAuth.ready.then(refresh);else refresh();
}());
