(function () {
  'use strict';
  const root = document.getElementById('simulation-builder'); if (!root) return;
  const core=window.BBSimulationCore, store=window.BBSimulationStore, ui=window.BBSimulationUI, storage=window.BBUserStorage;
  const $=id=>document.getElementById(id), entries=(window.BB_QUIZ_INDEX || []).filter(entry=>entry.bankUrl);
  let allocation=[], historyLimit=5, busy=false, failedRun=null;
  $('sim-chapter-list').innerHTML=entries.map(entry=>'<label class="sim-chapter-row"><input type="checkbox" name="simulation-chapter" value="'+entry.chapterNum+'" aria-label="'+ui.html(entry.name)+'"><span>'+ui.html(entry.name)+'<small>'+entry.questions.length+' grile disponibile</small></span><span class="sim-allocation" data-allocation="'+entry.chapterNum+'"></span></label>').join('');
  const chosen=()=>[...root.querySelectorAll('[name="simulation-chapter"]:checked')].map(input=>Number(input.value));
  function configure() {
    const ids=chosen(), chapters=entries.filter(entry=>ids.includes(entry.chapterNum));
    $('sim-selection-count').textContent=ids.length ? ids.length+' '+(ids.length===1?'capitol selectat':'capitole selectate') : 'Niciun capitol selectat';
    $('sim-select-all').textContent=ids.length===entries.length?'Deselectează toate':'Selectează toate';
    $('sim-duration-wrap').hidden=!$('sim-timed').checked;
    try {allocation=core.allocate(chapters);$('sim-allocation-summary').textContent='35 de întrebări · repartizate între capitolele alese';}
    catch(error){allocation=[];$('sim-allocation-summary').textContent=ids.length?error.message:'Bifează cel puțin un capitol.';}
    root.querySelectorAll('[data-allocation]').forEach(node=>{const count=allocation.find(item=>item.chapterNum===Number(node.dataset.allocation))?.count;node.textContent=count?count+' '+(count===1?'întrebare':'întrebări'):'';});
    $('sim-start').disabled=busy || !allocation.length;
  }
  function history() {
    const runs=store.list();$('sim-history-count').textContent=runs.length?'('+runs.length+')':'';
    $('sim-history-list').innerHTML=runs.slice(0,historyLimit).map(run=>{
      const names=[...new Set(run.questions.map(q=>q.chapterName))].join(', ');
      const expired=run.status==='active' && run.deadline!==null && Date.now()>=run.deadline;
      const state=run.status==='completed'?'Nota '+ui.number(run.result.grade):expired?'Timp expirat':'În desfășurare';
      return '<div class="sim-history-entry"><a class="sim-history-row" href="simulare.html?test='+encodeURIComponent(run.id)+'"><span><strong>'+new Date(run.startedAt).toLocaleString('ro-RO',{dateStyle:'medium',timeStyle:'short'})+'</strong><small>'+ui.html(names)+'</small></span><span>'+state+'<small>'+(run.status==='completed'||expired?'Vezi rezultatul':'Continuă testul')+' <span aria-hidden="true">↗</span></small></span></a><button type="button" class="sim-link-button" data-delete-simulation="'+ui.html(run.id)+'" aria-label="Șterge simularea din '+ui.html(new Date(run.startedAt).toLocaleString('ro-RO'))+'">Șterge</button></div>';
    }).join('') || '<p>Nu ai încă simulări. Prima va apărea aici.</p>';
    $('sim-history-more').hidden=runs.length<=historyLimit;
  }
  $('sim-history-list').addEventListener('click',async event=>{
    const button=event.target.closest('[data-delete-simulation]');
    if(!button)return;
    const owner=storage.owner();
    if(!window.confirm('Ștergi această simulare și răspunsurile ei din cont și de pe dispozitivele sincronizate? Celelalte simulări, grilele, statisticile și notițele rămân neschimbate.'))return;
    try {await store.remove(button.dataset.deleteSimulation,owner);history();}
    catch(error){$('sim-builder-error').hidden=false;$('sim-builder-error').textContent=error.message;}
  });
  $('simulation-form').addEventListener('change',configure);
  $('sim-select-all').addEventListener('click',()=>{const all=chosen().length===entries.length;root.querySelectorAll('[name="simulation-chapter"]').forEach(input=>input.checked=!all);configure();});
  $('sim-history-more').addEventListener('click',()=>{historyLimit+=5;history();});
  $('simulation-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy || !allocation.length)return;
    busy=true;const owner=storage.owner(), ids=chosen(), selectedAllocation=allocation, minutes=$('sim-timed').checked?Number($('sim-duration').value):0;
    $('sim-start').disabled=true;$('sim-start').setAttribute('aria-busy','true');$('sim-start').firstChild.textContent='Se pregătește simularea… ';$('sim-builder-error').hidden=true;
    try {
      failedRun=await ui.start(ids,minutes,selectedAllocation,owner);
      if (!storage.canPersist()) { $('sim-builder-export').hidden=false;throw new Error('Testul nu a putut fi salvat permanent. Eliberează spațiu în browser sau exportă testul și încearcă din nou.'); }
      location.href='simulare.html?test='+encodeURIComponent(failedRun.id);
    } catch(error) { if(owner===storage.owner()){$('sim-builder-error').textContent=error.message;$('sim-builder-error').hidden=false;} }
    finally {busy=false;$('sim-start').removeAttribute('aria-busy');$('sim-start').firstChild.textContent='Începe simularea ';$('sim-start').disabled=!allocation.length;history();}
  });
  $('sim-builder-export').addEventListener('click',()=>ui.exportRun(failedRun));
  document.addEventListener('bb:cache-owner-change',()=>{failedRun=null;$('sim-builder-export').hidden=true;$('sim-builder-error').hidden=true;history();});
  document.addEventListener('bb:cache-change',history);
  document.addEventListener('bb:simulation-change',history);
  function openHistory() {if(location.hash==='#simulation-history')$('simulation-history').open=true;}
  window.addEventListener('hashchange',openHistory);openHistory();
  configure();history();window.BBAuth?.ready.then(history);
}());
