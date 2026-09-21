/* Responsive SVG charts and a shared, pointer/keyboard/touch tooltip. */
(function () {
  'use strict';
  const number = new Intl.NumberFormat('ro-RO');
  const percentage = new Intl.NumberFormat('ro-RO', {maximumFractionDigits:1});
  const shortDate = new Intl.DateTimeFormat('ro-RO',{day:'numeric',month:'short'});
  const date = value => new Date(value+'T12:00:00');
  const escape = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct = value => Number.isFinite(value)?percentage.format(value)+'%':'—';
  const charts = new Map();
  const tooltip = document.createElement('div');
  tooltip.id='analytics-tooltip';tooltip.className='analytics-tooltip';tooltip.role='tooltip';tooltip.hidden=true;
  document.body.append(tooltip);
  let trigger=null, activeChart=null;
  function hide() { tooltip.hidden=true; if(trigger)trigger.removeAttribute('aria-describedby');trigger=null; }
  function show(element,title,rows,x,y) {
    if(trigger && trigger!==element)trigger.removeAttribute('aria-describedby');
    trigger=element;trigger.setAttribute('aria-describedby',tooltip.id);
    tooltip.innerHTML=`<strong>${escape(title)}</strong>${rows.map(([label,value])=>`<span><span>${escape(label)}</span><b>${escape(value)}</b></span>`).join('')}`;
    tooltip.hidden=false;
    const box=tooltip.getBoundingClientRect();
    const left=Math.max(8,Math.min(innerWidth-box.width-8,x-box.width/2));
    const top=y-box.height-14>=8?y-box.height-14:Math.max(8,Math.min(innerHeight-box.height-8,y+18));
    tooltip.style.left=left+'px';tooltip.style.top=top+'px';
  }
  function groupDays(days) {
    const interval=days.length>730?'month':days.length>90?'week':'day';
    if(interval==='day')return {interval,days:days.filter(day=>day.attempts>0).map(day=>({...day,endDate:day.date}))};
    const buckets=new Map();
    for(const day of days){if(!day.attempts)continue;const d=date(day.date);if(interval==='month')d.setDate(1);else d.setDate(d.getDate()-((d.getDay()+6)%7));
      const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if(!buckets.has(key))buckets.set(key,{date:day.date,endDate:day.date,attempts:0,correct:0,accuracy:null});
      const b=buckets.get(key);b.endDate=day.date;b.attempts+=day.attempts;b.correct+=day.correct;
    }
    return {interval,days:[...buckets.values()].map(b=>({...b,accuracy:b.attempts?100*b.correct/b.attempts:null}))};
  }
  function pointDetails(state,index) {
    const point=state.points[index];if(!point)return;
    activeChart=state;
    const d=point.day;
    const title=shortDate.format(date(d.date))+(d.endDate!==d.date?' – '+shortDate.format(date(d.endDate)):'');
    const bounds=state.svg.getBoundingClientRect();
    const node=state.svg.querySelector(`[data-series-index="${index}"]`);
    show(node,title,[['Grile',number.format(d.attempts)],['Corecte',number.format(d.correct)+' · '+pct(d.accuracy)],['Greșite',number.format(d.attempts-d.correct)]],bounds.left+point.x/state.width*bounds.width,bounds.top+point.y/state.height*bounds.height);
    state.svg.querySelectorAll('[data-series-index]').forEach(e=>e.classList.toggle('is-highlighted',e===node));
  }
  function render(id,source,kind,compact=false) {
    const root=document.getElementById(id);if(!root)return;
    const grouped=groupDays(source),days=grouped.days;
    if(!days.length){
      if(root.contains(trigger))hide();
      root.innerHTML='<div class="chart-no-data"><strong>Progresul începe cu o grilă.</strong><span>Prima verificare va apărea aici.</span></div>';
      charts.set(id,{id,root,source,kind,compact});
      return;
    }
    const width=Math.max(280,Math.round(root.clientWidth||560));const height=compact||days.length===1?150:width<500?245:300;
    const left=kind==='accuracy'?44:34,right=14,top=18,bottom=32,iw=width-left-right,ih=height-top-bottom;
    const max=kind==='accuracy'?100:Math.max(4,Math.ceil(Math.max(0,...days.map(d=>d.attempts))/4)*4);
    const step=iw/Math.max(days.length,1);const pad=Math.min(step/2,16);
    // Each slot is a recorded observation, not an unpractised calendar day.
    const x=i=>days.length===1?left+iw/2:left+pad+i/(days.length-1)*(iw-pad*2);
    const y=value=>top+ih*(1-value/max);
    const title=kind==='accuracy'?'Procentul grilelor corecte':'Grile rezolvate';
    const description=grouped.interval==='day'?'Zile cu activitate':grouped.interval==='week'?'Săptămâni cu activitate':'Luni cu activitate';
    let svg=`<svg class="analytics-chart" viewBox="0 0 ${width} ${height}" role="group" aria-label="${title}, ${description.toLowerCase()}. Folosește săgețile pentru a explora valorile.">`;
    for(let i=0;i<=4;i++){const value=max*i/4;svg+=`<line class="chart-gridline" x1="${left}" x2="${width-right}" y1="${y(value)}" y2="${y(value)}"/><text class="chart-axis" x="${left-8}" y="${y(value)+4}" text-anchor="end">${number.format(value)}${kind==='accuracy'?'%':''}</text>`;}
    const points=days.map((d,i)=>({day:d,x:x(i),y:y(kind==='accuracy'?d.accuracy:d.attempts)}));
    if(kind==='accuracy' && points.length>1)svg+=`<polyline class="chart-line" points="${points.map(p=>p.x+','+p.y).join(' ')}"/>`;
    points.forEach((p,i)=>{const d=p.day;const label=`${shortDate.format(date(d.date))}: ${d.attempts} grile rezolvate, ${d.correct} corecte, ${pct(d.accuracy)}`;
      svg+=`<g class="chart-point" data-series-index="${i}" tabindex="${i===0?0:-1}" role="img" aria-label="${escape(label)}">`;
      if(kind==='accuracy')svg+=`<circle class="chart-hit" cx="${p.x}" cy="${p.y}" r="14"/><circle class="chart-dot" cx="${p.x}" cy="${p.y}" r="4.5"/>`;
      else {const w=Math.max(2,Math.min(30,step*.62));const wrong=d.attempts-d.correct;svg+=`<rect class="chart-hit" x="${p.x-w/2}" y="${top}" width="${w}" height="${ih}"/><rect class="chart-bar" x="${p.x-w/2}" y="${y(d.correct)}" width="${w}" height="${ih*d.correct/max}" rx="2"/><rect class="chart-bar-wrong" x="${p.x-w/2}" y="${y(d.attempts)}" width="${w}" height="${ih*wrong/max}" rx="2"/>`;}
      svg+='</g>';
    });
    const ticks=[...new Set([0,Math.floor((days.length-1)/2),days.length-1])].filter(i=>i>=0);
    ticks.forEach(i=>{svg+=`<text class="chart-axis" x="${x(i)}" y="${height-8}" text-anchor="${days.length===1?'middle':i===0?'start':i===days.length-1?'end':'middle'}">${escape(shortDate.format(date(days[i].date)))}</text>`;});svg+='</svg>';
    const table=`<details class="chart-data"><summary>Datele graficului · ${description.toLowerCase()}</summary><div class="analytics-table-scroll" tabindex="0"><table><caption class="analytics-sr-only">${title}</caption><thead><tr><th>Perioada</th><th>Grile rezolvate</th><th>Corecte</th><th>Greșite</th><th>Procent corect</th></tr></thead><tbody>${days.map(d=>`<tr><th>${escape(d.date)}${d.date!==d.endDate?' – '+escape(d.endDate):''}</th><td>${number.format(d.attempts)}</td><td>${number.format(d.correct)}</td><td>${number.format(d.attempts-d.correct)}</td><td>${pct(d.accuracy)}</td></tr>`).join('')}</tbody></table></div></details>`;
    const open=root.querySelector('details')?.open;
    if(root.contains(trigger))hide();
    root.innerHTML=`<div class="chart-stage">${svg}</div>${table}`;
    if(open)root.querySelector('details').open=true;
    const state={root,svg:root.querySelector('svg'),width,height,points,source,kind,compact,id};charts.set(id,state);
    state.svg.addEventListener('pointermove',event=>{const r=state.svg.getBoundingClientRect();const value=(event.clientX-r.left)*width/r.width;let nearest=0;points.forEach((p,i)=>{if(Math.abs(p.x-value)<Math.abs(points[nearest].x-value))nearest=i;});pointDetails(state,nearest);});
    state.svg.addEventListener('focusin',event=>{const p=event.target.closest('[data-series-index]');if(p)pointDetails(state,Number(p.dataset.seriesIndex));});
    state.svg.addEventListener('click',event=>{const p=event.target.closest('[data-series-index]');if(p)pointDetails(state,Number(p.dataset.seriesIndex));});
    state.svg.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch')hide();});
    state.svg.addEventListener('keydown',event=>{const p=event.target.closest('[data-series-index]');if(!p)return;let next=Number(p.dataset.seriesIndex);if(event.key==='ArrowRight'||event.key==='ArrowDown')next++;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next--;else if(event.key==='Home')next=0;else if(event.key==='End')next=points.length-1;else return;event.preventDefault();next=Math.max(0,Math.min(points.length-1,next));p.tabIndex=-1;const node=state.svg.querySelector(`[data-series-index="${next}"]`);node.tabIndex=0;node.focus();});
  }
  document.addEventListener('keydown',event=>{if(event.key==='Escape')hide();});
  document.addEventListener('focusin',event=>{if(trigger && !event.target.closest('[data-series-index],[data-tooltip-title]'))hide();});
  document.addEventListener('pointerdown',event=>{if(!event.target.closest('.analytics-chart,[data-tooltip-title]'))hide();});
  document.addEventListener('scroll',()=>{
    if(!trigger || tooltip.hidden)return;
    const node=trigger;
    requestAnimationFrame(()=>{
      if(trigger!==node)return;
      const b=node.getBoundingClientRect();
      if(b.bottom<0 || b.top>innerHeight){hide();return;}
      if(node.hasAttribute('data-series-index') && activeChart)pointDetails(activeChart,Number(node.dataset.seriesIndex));
      else showGeneric({target:node});
    });
  },true);
  function showGeneric(event){const node=event.target.closest('[data-tooltip-title]');if(!node)return;const b=node.getBoundingClientRect();show(node,node.dataset.tooltipTitle,JSON.parse(node.dataset.tooltipRows||'[]'),b.left+b.width/2,b.top);}
  document.addEventListener('pointerover',showGeneric);document.addEventListener('focusin',showGeneric);
  document.addEventListener('pointerout',event=>{if(event.target.closest('[data-tooltip-title]')&&!event.relatedTarget?.closest('[data-tooltip-title]'))hide();});
  let resizeFrame;window.addEventListener('resize',()=>{hide();cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{for(const state of charts.values())render(state.id,state.source,state.kind,state.compact);});});
  // Report panels can replace a chart with a one-day result or hide it entirely.
  // Unregister it so a later resize cannot resurrect the previous series.
  function clear(id) {
    const root=document.getElementById(id);
    if(root?.contains(trigger))hide();
    charts.delete(id);
    if(root)root.replaceChildren();
  }
  window.BBAnalyticsCharts={render,hide,groupDays,clear};
}());
