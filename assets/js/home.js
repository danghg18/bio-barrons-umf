/* ── CANONICAL CATALOG STATE ── */
function syncChapterCatalog(){
  const byNumber=new Map(CHAPTERS.map(chapter=>[Number(chapter.num),chapter]));
  document.querySelectorAll('.lab-home-catalog .lab-item').forEach(function(item){
    const number=Number(item.querySelector('.lab-item-num')?.textContent.trim());
    const chapter=byNumber.get(number);
    if(!chapter){item.remove();return;}
    const title=item.querySelector('.lab-item-title');
    const icon=item.querySelector('.lab-item-emoji');
    if(title)title.textContent=chapter.name;
    if(icon)icon.textContent=chapter.icon;
    if(chapter.done&&chapter.url&&item.tagName==='BUTTON'){
      const link=document.createElement('a');
      link.className=item.className.replace('lab-item-soon','lab-item-done');
      link.href=chapter.url;
      while(item.firstChild)link.appendChild(item.firstChild);
      const status=link.querySelector('.lab-item-soon-mark');
      if(status){status.className='lab-item-done-mark';status.textContent='Disponibil';}
      item.replaceWith(link);
    }else if(!chapter.done){
      const status=item.querySelector('.lab-item-soon-mark');
      if(status)status.textContent='În pregătire';
    }
  });
  document.querySelectorAll('.lab-home-catalog .lab-bento-cat').forEach(function(group){
    const numbers = new Set(Array.from(group.querySelectorAll('.lab-item-num'), node => Number(node.textContent.trim())));
    const records = CHAPTERS.filter(chapter => numbers.has(Number(chapter.num)));
    const label=group.querySelector('.lab-bento-cat-ring-inner');
    if(!records.length)return;
    const done=records.filter(chapter=>chapter.done&&chapter.url).length;
    if(label)label.textContent=done+' din '+records.length+' lecții disponibile';
  });
}

const LESSON_SECTIONS=new Map();

function loadLessonSections(chapter){
  if(LESSON_SECTIONS.has(chapter.num))return LESSON_SECTIONS.get(chapter.num);
  const request=fetch(chapter.url).then(function(response){
    if(!response.ok)throw new Error('Lecția nu a putut fi încărcată.');
    return response.text();
  }).then(function(html){
    const doc=new DOMParser().parseFromString(html,'text/html');
    return Array.from(doc.querySelectorAll('.page-section:not([data-curriculum-excluded])')).map(function(section){
      const heading=section.querySelector('h1, h2, h3');
      return {
        id:section.id.replace(/^page-/,''),
        title:heading?heading.textContent.replace(/\s+/g,' ').trim():'',
        isHome:section.classList.contains('chapter-home')
      };
    }).filter(function(section){return section.id;});
  }).catch(function(){return [];});
  LESSON_SECTIONS.set(chapter.num,request);
  return request;
}

function ensureProgressStatus(item){
  let statuses=item.querySelector('.lab-item-statuses');
  if(statuses)return statuses;
  statuses=document.createElement('span');
  statuses.className='lab-item-statuses';
  const availability=item.querySelector('.lab-item-done-mark');
  if(availability){
    availability.replaceWith(statuses);
    availability.classList.add('lab-item-availability');
    statuses.appendChild(availability);
  }
  const progress=document.createElement('span');
  progress.className='lab-item-progress';
  statuses.appendChild(progress);
  return statuses;
}

async function syncStudyProgress(){
  if(!window.BBStudyState)return;
  await Promise.all(CHAPTERS.filter(function(chapter){return chapter.done&&chapter.url;}).map(async function(chapter){
    const item=Array.from(document.querySelectorAll('.lab-bento-items .lab-item')).find(function(candidate){
      return Number(candidate.querySelector('.lab-item-num')?.textContent.trim())===chapter.num;
    });
    if(!item)return;
    const sections=await loadLessonSections(chapter);
    const progress=window.BBStudyState.getLessonProgress(chapter.num,sections.filter(function(section){
      return !section.isHome;
    }).map(function(section){return section.id;}));
    const statuses=ensureProgressStatus(item);
    const label=statuses.querySelector('.lab-item-progress');
    if(!label)return;
    if(progress.isComplete){
      label.textContent='Completă';
      label.className='lab-item-progress is-complete';
    }else if(progress.completed>0){
      label.textContent='În progres · '+progress.completed+'/'+progress.total;
      label.className='lab-item-progress';
    }else{
      label.textContent='';
      label.className='lab-item-progress';
    }
  }));
}

let continueGeneration = 0;
async function syncContinueCard(){
  const generation = ++continueGeneration;
  const card=document.getElementById('lab-continue');
  if(!card||!window.BBStudyState)return;
  const state=window.BBStudyState.getState();
  const visit=state&&state.lastVisited;
  const chapter=visit&&CHAPTERS.find(function(entry){return entry.num===Number(visit.chapterNum)&&entry.done&&entry.url;});
  if(!chapter||typeof visit.sectionId!=='string'||!visit.sectionId){card.hidden=true;return;}
  const sections=await loadLessonSections(chapter);
  if (generation !== continueGeneration) return;
  const section=sections.find(function(entry){return entry.id===visit.sectionId;});
  if(!section){card.hidden=true;return;}
  const link=document.getElementById('lab-continue-link');
  const title=document.getElementById('lab-continue-title');
  const sectionLabel=document.getElementById('lab-continue-section');
  link.href=chapter.url+'#'+encodeURIComponent(section.id);
  title.textContent=chapter.name;
  sectionLabel.textContent=section.title||'Secțiunea reluată';
  card.hidden=false;
}

function syncStudyHomepage(){
  syncStudyProgress();
  syncContinueCard();
}

function quizSummary(title){
  const range=String(title||'').match(/(\d+)\s*[–-]\s*(\d+)/);
  if(!range)return String(title||'Grile');
  const first=Number(range[1]);
  const last=Number(range[2]);
  const count=Math.max(0,last-first+1);
  return count+' de grile · întrebările '+first+'–'+last;
}

function syncTestingCatalog(){
  const catalog=document.getElementById('lab-testing-catalog');
  const count=document.getElementById('lab-testing-count');
  if(!catalog)return;
  const byNumber=new Map(CHAPTERS.map(chapter=>[String(chapter.num),chapter]));
  const quizzes=[];
  CHAPTERS.forEach(function(chapter){
    (chapter.resources||[]).filter(resource=>resource.kind==='quiz').forEach(function(resource){
      quizzes.push({chapter:chapter,resource:resource});
    });
  });
  catalog.querySelectorAll('.lab-item[data-chapter]').forEach(function(original){
    const chapter=byNumber.get(original.dataset.chapter);
    if(!chapter)return;
    const resource=(chapter.resources||[]).find(item=>item.kind==='quiz');
    let item=original;
    if(resource&&original.tagName==='BUTTON'){
      const link=document.createElement('a');
      link.className=original.className.replace('lab-item-soon','lab-item-done');
      link.dataset.chapter=original.dataset.chapter;
      link.href=resource.url;
      while(original.firstChild)link.appendChild(original.firstChild);
      original.replaceWith(link);
      item=link;
    }
    const title=item.querySelector('.lab-item-title');
    const detail=item.querySelector('.lab-item-tags');
    const status=item.querySelector('.lab-item-done-mark,.lab-item-soon-mark');
    if(title)title.textContent=chapter.name;
    if(resource){
      item.classList.remove('lab-item-soon');
      item.classList.add('lab-item-done');
      if(detail)detail.textContent=quizSummary(resource.title);
      if(status){status.className='lab-item-done-mark';status.textContent='Rezolvă';}
    }else{
      if(detail)detail.textContent='Test în pregătire';
      if(status){status.className='lab-item-soon-mark';status.textContent='În curând';}
    }
  });
  catalog.querySelectorAll('.lab-bento-cat').forEach(function(group){
    const numbers=new Set(Array.from(group.querySelectorAll('.lab-item[data-chapter]'),item=>Number(item.dataset.chapter)));
    const available=quizzes.filter(entry=>numbers.has(Number(entry.chapter.num))).length;
    const label=group.querySelector('.lab-bento-cat-ring-inner');
    if(label)label.textContent=available+' din '+numbers.size+' '+(numbers.size===1?'test disponibil':'teste disponibile');
  });
  if(count)count.textContent=quizzes.length+' '+(quizzes.length===1?'test disponibil':'teste disponibile');
}

syncChapterCatalog();
syncTestingCatalog();
document.querySelectorAll('.lab-home-catalog .lab-item-done-mark').forEach(function (status) { status.textContent = 'Disponibil'; });
syncStudyHomepage();
if(window.BBStudyState&&typeof window.BBStudyState.subscribe==='function')window.BBStudyState.subscribe(syncStudyHomepage);

/* ── SEARCH IN PUBLISHED LESSONS ── */
const SEARCHABLE_CHAPTERS = CHAPTERS.filter(c => c.done && c.url);
const SEARCH_INDEX = { ready: false, loading: null, entries: [], chapters: new Map(), failed: [] };
let paletteRenderId = 0;
let paletteResults = [];
const paletteChapterLimits = new Map();

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
function normalizeText(value){
  return String(value || '').replace(/\s+/g,' ').trim();
}
function buildChapterSearchEntries(chapter, html){
  const doc = new DOMParser().parseFromString(html, 'text/html');
  if(!doc.querySelector('.page-section')) throw new Error('Lecția nu conține secțiuni.');
  return window.BBSearchText.index(doc).map(run => {
    const title = run.section.querySelector('h1,h2,h3');
    return Object.assign(run, { chapter, sectionTitle: normalizeText(title ? title.textContent : chapter.name) });
  });
}
async function ensureSearchIndex(){
  if(SEARCH_INDEX.ready) return SEARCH_INDEX.entries;
  if(SEARCH_INDEX.loading) return SEARCH_INDEX.loading;
  SEARCH_INDEX.loading = (async () => {
    const pending = SEARCHABLE_CHAPTERS.filter(chapter => !SEARCH_INDEX.chapters.has(chapter.url));
    const outcomes = await Promise.allSettled(pending.map(async chapter => {
      const response = await fetch(chapter.url, { signal: AbortSignal.timeout(12000) });
      if(!response.ok) throw new Error('HTTP ' + response.status);
      SEARCH_INDEX.chapters.set(chapter.url, buildChapterSearchEntries(chapter, await response.text()));
    }));
    SEARCH_INDEX.failed = pending.filter((chapter, i) => outcomes[i].status === 'rejected');
    SEARCH_INDEX.entries = SEARCHABLE_CHAPTERS.flatMap(chapter => SEARCH_INDEX.chapters.get(chapter.url) || []);
    SEARCH_INDEX.ready = true;
    return SEARCH_INDEX.entries;
  })().finally(() => { SEARCH_INDEX.loading = null; });
  return SEARCH_INDEX.loading;
}
function getMatchSnippet(match){
  const text = match.run.text;
  // Include every matched term, abbreviating long gaps between them.
  const windows = [];
  match.ranges.forEach(range => {
    const next = { start: Math.max(0, range.start - 45), end: Math.min(text.length, range.end + 65) };
    const previous = windows[windows.length - 1];
    if(previous && next.start <= previous.end) previous.end = Math.max(previous.end, next.end);
    else windows.push(next);
  });
  return windows.map(window => {
    let html = window.start ? '…' : '';
    let position = window.start;
    match.ranges.filter(range => range.start < window.end && range.end > window.start).forEach(range => {
      html += escapeHtml(text.slice(position, range.start)) + '<mark>' + escapeHtml(text.slice(range.start, range.end)) + '</mark>';
      position = range.end;
    });
    return html + escapeHtml(text.slice(position, window.end)) + (window.end < text.length ? '…' : '');
  }).join(' ');
}
function findTextMatches(query){
  const counters = new Map();
  return window.BBSearchText.find(SEARCH_INDEX.entries, query).map(match => {
    const entry = match.run;
    const key = entry.chapter.url + '::' + entry.sectionId;
    const hit = counters.get(key) || 0;
    counters.set(key, hit + 1);
    return { chapter: entry.chapter, sectionId: entry.sectionId, sectionTitle: entry.sectionTitle,
      hit, snippet: getMatchSnippet(match) };
  });
}
function renderChapterItems(url){
  const results = paletteResults.filter(result => result.chapter.url === url);
  const limit = paletteChapterLimits.get(url) || 5;
  const query = document.getElementById('palette-input').value.trim();
  let html = results.slice(0, limit).map(result =>
    '<button type="button" class="lab-palette-item" data-url="' + result.chapter.url + '" data-query="' + escapeHtml(query) +
    '" data-section-id="' + escapeHtml(result.sectionId) + '" data-hit="' + result.hit + '" data-done="true"><div>' +
    '<div class="lab-palette-sub">' + escapeHtml(result.sectionTitle) + '</div>' +
    '<span class="lab-palette-match">' + result.snippet + '</span></div><svg class="lab-palette-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>'
  ).join('');
  if(results.length > limit) html += '<button type="button" class="lab-palette-more" data-more="' + url + '">Arată încă ' + Math.min(5, results.length - limit) + ' rezultate <span>(' + (results.length - limit) + ' rămase)</span></button>';
  return html;
}
function bindPaletteActions(root){
  root = root || document.getElementById('palette-list');
  root.querySelectorAll('[data-url]').forEach(button => {
    button.addEventListener('click', () => {
      if(button.dataset.hit !== undefined){
        goToSearchResult(button.dataset.url, button.dataset.query, button.dataset.sectionId, button.dataset.hit);
      } else goToChapter(button.dataset.url);
    });
  });
  root.querySelectorAll('[data-more]').forEach(button => button.addEventListener('click', () => {
    const url = button.dataset.more;
    const limit = paletteChapterLimits.get(url) || 5;
    paletteChapterLimits.set(url, limit + 5);
    const body = button.closest('.lab-palette-chapter-body');
    body.innerHTML = renderChapterItems(url);
    bindPaletteActions(body);
    body.querySelectorAll('[data-hit]')[limit]?.focus();
  }));
}
function renderPaletteResults(){
  const list = document.getElementById('palette-list');
  const query = document.getElementById('palette-input').value.trim();
  const counts = new Map();
  paletteResults.forEach(result => counts.set(result.chapter.url, (counts.get(result.chapter.url) || 0) + 1));
  let html = '';
  if(SEARCH_INDEX.failed.length){
    html += '<div class="lab-palette-notice">' + (SEARCH_INDEX.entries.length ? 'Unele lecții nu s-au încărcat. Rezultatele sunt parțiale.' : 'Lecțiile nu s-au putut încărca. Verifică conexiunea.') +
      ' <button type="button" id="palette-retry">Reîncearcă</button></div>';
  }
  if(paletteResults.length){
    html += '<div class="lab-palette-tools"><span role="status">' + paletteResults.length + (paletteResults.length === 1 ? ' rezultat în ' : ' rezultate în ') + counts.size +
      (counts.size === 1 ? ' capitol' : ' capitole') + '</span><span>Deschide un capitol pentru a vedea pasajele.</span></div>';
    SEARCHABLE_CHAPTERS.filter(chapter => counts.has(chapter.url)).forEach(chapter => {
      const count = counts.get(chapter.url);
      html += '<details class="lab-palette-chapter" data-chapter="' + chapter.url + '" name="palette-chapters"><summary>' +
        '<span class="lab-palette-chapter-name"><span class="lab-palette-chapter-num">' + String(chapter.num).padStart(2, '0') + '</span>' + escapeHtml(chapter.name) + '</span>' +
        '<span class="lab-palette-chapter-count">' + count + '<span class="lab-palette-count-label">' + (count === 1 ? ' rezultat' : ' rezultate') + '</span></span>' +
        '<svg class="lab-palette-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
        '</summary><div class="lab-palette-chapter-body">' + renderChapterItems(chapter.url) + '</div></details>';
    });
  } else if(query){
    html += '<div class="lab-palette-empty">Niciun pasaj pentru <strong>„' + escapeHtml(query) + '”</strong> în lecțiile încărcate.<br>Încearcă alți termeni sau o expresie mai scurtă.</div>';
  } else {
    html += '<div class="lab-palette-hint">Caută unul sau mai multe cuvinte, cu sau fără diacritice.</div>';
    html += SEARCHABLE_CHAPTERS.map(chapter => '<button type="button" class="lab-palette-item" data-url="' + chapter.url + '" data-done="true"><div><div class="lab-palette-title">' +
      escapeHtml(chapter.name) + '</div><div class="lab-palette-sub">Cap. ' + String(chapter.num).padStart(2, '0') + ' · ' + escapeHtml(chapter.cat) + '</div></div></button>').join('');
  }
  list.innerHTML = html;
  bindPaletteActions();
  list.querySelectorAll('details').forEach(group => group.addEventListener('toggle', () => {
    if(group.open) list.querySelectorAll('details[open]').forEach(other => { if(other !== group) other.open = false; });
  }));
  const retry = document.getElementById('palette-retry');
  if(retry) retry.addEventListener('click', () => {
    SEARCH_INDEX.ready = false;
    renderPaletteItems(document.getElementById('palette-input').value);
  });
}
async function renderPaletteItems(query){
  const renderId = ++paletteRenderId;
  paletteChapterLimits.clear();
  if(query.trim()){
    if(!SEARCH_INDEX.ready) document.getElementById('palette-list').innerHTML = '<div class="lab-palette-empty" role="status">Caut în textul lecțiilor…</div>';
    await ensureSearchIndex();
    if(renderId !== paletteRenderId) return;
  }
  paletteResults = findTextMatches(query);
  renderPaletteResults();
  document.getElementById('palette-list').scrollTop = 0;
}

let paletteReturnFocus=null;
let palettePreviousOverflow='';
function openPalette(){
  const palette=document.getElementById('palette');
  if(palette.style.display!=='none'){document.getElementById('palette-input').focus();return;}
  paletteReturnFocus=document.activeElement;
  palette.style.display='block';
  document.getElementById('search-btn').setAttribute('aria-expanded','true');
  document.querySelector('.lab').inert=true;
  palettePreviousOverflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  document.getElementById('palette-input').value='';
  renderPaletteItems('');
  ensureSearchIndex();
  setTimeout(()=>document.getElementById('palette-input').focus(),50);
}
function closePalette(){
  ++paletteRenderId;
  document.getElementById('palette').style.display='none';
  document.getElementById('search-btn').setAttribute('aria-expanded','false');
  document.querySelector('.lab').inert=false;
  document.body.style.overflow=palettePreviousOverflow;
  if(paletteReturnFocus&&typeof paletteReturnFocus.focus==='function') paletteReturnFocus.focus();
}
function filterPalette(v){renderPaletteItems(v);}
function goToSearchResult(url, query, sectionId, hit){
  const params = new URLSearchParams();
  if(query) params.set('q', query);
  if(sectionId) params.set('section', sectionId);
  if(hit !== undefined) params.set('hit', hit);
  window.location.href = (params.toString() ? url + '?' + params.toString() : url) + (sectionId ? '#' + encodeURIComponent(sectionId) : '');
}
function goToChapter(url){
  var q=(document.getElementById('palette-input').value||'').trim();
  window.location.href=q?url+'?q='+encodeURIComponent(q):url;
}
document.getElementById('search-btn').onclick=openPalette;
document.addEventListener('keydown',function(e){
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){e.preventDefault();openPalette();}
  if(e.key==='Escape'&&document.getElementById('palette').style.display!=='none'){closePalette();}
  if(e.key==='Enter'&&document.getElementById('palette').style.display!=='none'&&document.activeElement===document.getElementById('palette-input')){
    const group=document.querySelector('#palette-list details');
    if(group){e.preventDefault();group.open=true;group.querySelector('[data-hit]')?.focus();}
    else {
      const first=document.querySelector('#palette-list [data-url][data-done="true"]');
      if(first){e.preventDefault();first.click();}
    }
  }
  if(e.key==='Tab'&&document.getElementById('palette').style.display!=='none'){
    const focusable=Array.from(document.querySelectorAll('#palette input,#palette summary,#palette button:not([disabled])')).filter(el=>el.offsetParent!==null&&!el.closest('details:not([open]) .lab-palette-chapter-body'));
    if(!focusable.length)return;
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});
