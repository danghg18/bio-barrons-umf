/* ── CANONICAL CATALOG STATE ── */
function syncChapterCatalog(){
  const byNumber=new Map(CHAPTERS.map(chapter=>[String(chapter.num),chapter]));
  document.querySelectorAll('.lab-bento-items .lab-item').forEach(function(item){
    const number=item.querySelector('.lab-item-num')?.textContent.trim();
    const chapter=byNumber.get(number);
    if(!chapter)return;
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
    }
  });
  document.querySelectorAll('.lab-bento-cat').forEach(function(group){
    const numbers = new Set(Array.from(group.querySelectorAll('.lab-item-num'), node => Number(node.textContent.trim())));
    const records = CHAPTERS.filter(chapter => numbers.has(Number(chapter.num)));
    const label=group.querySelector('.lab-bento-cat-ring-inner');
    if(!records.length)return;
    const done=records.filter(chapter=>chapter.done&&chapter.url).length;
    if(label)label.textContent=done+' din '+records.length+' lecții disponibile';
  });
}
syncChapterCatalog();
document.querySelectorAll('.lab-item-done-mark').forEach(function (status) { status.textContent = 'Disponibil'; });

/* ── COMMAND PALETTE DATA ── */
const SEARCHABLE_CHAPTERS = CHAPTERS.filter(c => c.done && c.url);
const SEARCH_INDEX = {
  ready: false,
  loading: null,
  entries: []
};

function escapeHtml(value){
  return String(value).replace(/[&<>"']/g, function(ch){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];
  });
}

function normalizeText(value){
  return String(value || '').replace(/\s+/g,' ').trim();
}

function normalizeSearchValue(value){
  const text=String(value || '');
  try{return text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
  catch(error){return text.toLowerCase();}
}

function getNodeSnippet(text, idx, len){
  const clean = normalizeText(text);
  if(!clean) return '';
  const lower = clean.toLowerCase();
  const needle = normalizeText(text.slice(idx, idx + len)) || clean.slice(idx, idx + len);
  const matchAt = lower.indexOf(needle.toLowerCase());
  const start = Math.max(0, (matchAt >= 0 ? matchAt : idx) - 45);
  const end = Math.min(clean.length, (matchAt >= 0 ? matchAt : idx) + len + 75);
  const prefix = start > 0 ? '…' : '';
  const suffix = end < clean.length ? '…' : '';
  return prefix + clean.slice(start, end) + suffix;
}

function buildChapterSearchEntries(chapter, html){
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const entries = [];
  doc.querySelectorAll('.page-section').forEach(function(section){
    const sectionId = section.id.replace(/^page-/, '');
    const sectionTitleNode = section.querySelector('h1,h2,h3');
    const sectionTitle = normalizeText(sectionTitleNode ? sectionTitleNode.textContent : chapter.name) || chapter.name;
    const walker = doc.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const tn = walker.currentNode;
      const parent = tn.parentNode;
      if (!parent || !parent.closest) continue;
      if (parent.closest('script,style,nav,button')) continue;
      const raw = String(tn.textContent || '');
      if (!normalizeText(raw)) continue;
      entries.push({
        chapterNum: chapter.num,
        chapterName: chapter.name,
        chapterCat: chapter.cat,
        chapterColor: chapter.color,
        chapterColorLight: chapter.colorLight,
        chapterIcon: chapter.icon,
        url: chapter.url,
        sectionId: sectionId,
        sectionTitle: sectionTitle,
        rawText: raw
      });
    }
  });
  return entries;
}

async function ensureSearchIndex(){
  if (SEARCH_INDEX.ready) return SEARCH_INDEX.entries;
  if (SEARCH_INDEX.loading) return SEARCH_INDEX.loading;
  SEARCH_INDEX.loading = Promise.all(SEARCHABLE_CHAPTERS.map(async function(chapter){
    const res = await fetch(chapter.url);
    const html = await res.text();
    return buildChapterSearchEntries(chapter, html);
  })).then(function(groups){
    SEARCH_INDEX.entries = groups.flat();
    SEARCH_INDEX.ready = true;
    return SEARCH_INDEX.entries;
  }).catch(function(){
    SEARCH_INDEX.entries = [];
    SEARCH_INDEX.ready = false;
    return [];
  }).finally(function(){
    SEARCH_INDEX.loading = null;
  });
  return SEARCH_INDEX.loading;
}

function findTextMatches(query){
  const needle = normalizeSearchValue(query.trim());
  if (!needle) return [];
  const results = [];
  const hitCounters = Object.create(null);
  SEARCH_INDEX.entries.forEach(function(entry){
    const text = String(entry.rawText || '');
    const lower = normalizeSearchValue(text);
    let from = 0;
    const counterKey = entry.url + '::' + entry.sectionId;
    if (!(counterKey in hitCounters)) hitCounters[counterKey] = 0;
    while (from < lower.length) {
      const idx = lower.indexOf(needle, from);
      if (idx === -1) break;
      const snippet = getNodeSnippet(text, idx, needle.length);
      results.push({
        type: 'match',
        url: entry.url,
        chapterNum: entry.chapterNum,
        chapterName: entry.chapterName,
        chapterCat: entry.chapterCat,
        chapterColor: entry.chapterColor,
        chapterColorLight: entry.chapterColorLight,
        chapterIcon: entry.chapterIcon,
        sectionId: entry.sectionId,
        sectionTitle: entry.sectionTitle,
        hit: hitCounters[counterKey],
        snippet: snippet
      });
      hitCounters[counterKey] += 1;
      from = idx + Math.max(1, needle.length);
      if (results.length >= 30) return results;
    }
  });
  return results.slice(0, 30);
}

function chapterFallbackResults(needle){
  return needle
    ? CHAPTERS.filter(c => normalizeSearchValue(c.num+' '+c.name+' '+c.cat+' '+(c.kw||'')).includes(needle)).slice(0,10)
    : CHAPTERS.filter(c=>c.done).concat(CHAPTERS.filter(c=>!c.done)).slice(0,8);
}

function bindPaletteActions(){
  document.querySelectorAll('#palette-list [data-url]').forEach(function(btn){
    btn.addEventListener('click', function(){
      if (btn.dataset.url && btn.dataset.done === 'true') {
        if (btn.dataset.hit !== undefined && btn.dataset.sectionId) {
          goToSearchResult(btn.dataset.url, btn.dataset.query || '', btn.dataset.sectionId, btn.dataset.hit);
          return;
        }
        goToChapter(btn.dataset.url);
      }
    });
  });
}

async function renderPaletteItems(q){
  const list=document.getElementById('palette-list');
  const needle=normalizeSearchValue(q.trim());
  if(needle){
    if(!SEARCH_INDEX.ready && SEARCH_INDEX.loading){
      list.innerHTML='<div class="lab-palette-empty">Caut în textul capitolelor…</div>';
    }
    await ensureSearchIndex();
    if(q !== document.getElementById('palette-input').value) return;
    const textResults = findTextMatches(needle);
    if(textResults.length){
      list.innerHTML=textResults.map(function(r){
        const safeNeedle = escapeHtml(q.trim());
        const safeSnippet = escapeHtml(r.snippet).replace(new RegExp(escapeRegExp(safeNeedle), 'ig'), '<strong>$&</strong>');
        return `
    <button class="lab-palette-item" data-url="${r.url}" data-query="${escapeHtml(q.trim())}" data-section-id="${r.sectionId}" data-hit="${r.hit}" data-done="true">
      <span class="lab-palette-emoji">${r.chapterIcon}</span>
      <div>
        <div class="lab-palette-title">Cap. ${String(r.chapterNum).padStart(2,'0')} · ${r.chapterName}</div>
        <div class="lab-palette-sub">${r.sectionTitle}</div>
        <span class="lab-palette-match">${safeSnippet}</span>
      </div>
      <span class="lab-palette-tag" style="color:${r.chapterColor};background:${r.chapterColorLight}">Text</span>
    </button>`;
      }).join('');
      bindPaletteActions();
      return;
    }
  }
  const results = chapterFallbackResults(needle);
  if(!results.length){list.innerHTML='<div class="lab-palette-empty">Nicio potrivire. Încearcă "nefron", "ADH", "inimă"…</div>';return;}
  list.innerHTML=results.map(c=>`
    <button class="lab-palette-item" data-url="${c.url||''}" data-done="${c.done?'true':'false'}" ${!c.done?'disabled aria-disabled="true"':''} style="${!c.done?'cursor:default;opacity:.6':''}">
      <span class="lab-palette-emoji">${c.icon}</span>
      <div>
        <div class="lab-palette-title">Cap. ${String(c.num).padStart(2,'0')} · ${c.name}</div>
        <div class="lab-palette-sub">${c.cat}</div>
      </div>
      <span class="lab-palette-tag" style="color:${c.color};background:${c.colorLight}">${c.done?'Disponibil':'În curând'}</span>
    </button>`).join('');
  bindPaletteActions();
}

function escapeRegExp(value){
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let paletteReturnFocus=null;
let palettePreviousOverflow='';
function openPalette(){
  const palette=document.getElementById('palette');
  if(palette.style.display==='none') paletteReturnFocus=document.activeElement;
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
  window.location.href = params.toString() ? url + '?' + params.toString() : url;
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
    const first=document.querySelector('#palette-list [data-url][data-done="true"]');
    if(first){e.preventDefault();first.click();}
  }
  if(e.key==='Tab'&&document.getElementById('palette').style.display!=='none'){
    const focusable=Array.from(document.querySelectorAll('#palette input,#palette button:not([disabled])')).filter(el=>el.offsetParent!==null);
    if(!focusable.length)return;
    const first=focusable[0];
    const last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});

/* ── SERVICE WORKER ── */
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
}
