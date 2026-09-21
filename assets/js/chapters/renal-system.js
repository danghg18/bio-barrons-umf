// ════ PAGE NAVIGATION ════
const SUB_NAVS = {
  rinichii: [{h:'intro',l:'Introducere'},{h:'caract',l:'Rinichii'},{h:'nefron-intro',l:'Nefronul'}],
  nefron: [{h:'struct-nefron',l:'Structura nefronului'},{h:'filtrare',l:'Filtrarea'},{h:'reabsorbtie',l:'Reabsorbția'},{h:'secretie',l:'Secreția tubulară'}],
  hormoni: [{h:'activitate-hormonala',l:'Activitatea hormonală'},{h:'urina',l:'Urina'}],
  anexe: [{h:'uretere',l:'Uretere'},{h:'vezica',l:'Vezica urinară'},{h:'uretra',l:'Uretra'},{h:'alte-organe',l:'Alte organe excretorii'}],
  mindmap: [{h:'flowchart-section',l:'Procesele formării urinei'}]
};

function goto(sec, anchor) {
  if (!document.getElementById('page-' + sec)) sec = 'home';
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#sidenav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.lab-nav a').forEach(a => a.classList.remove('active'));
  const page = document.getElementById('page-' + sec);
  if (page) page.classList.add('active');
  const topNav = document.querySelectorAll('.lab-nav a');
  if (sec === 'home' && topNav[0]) topNav[0].classList.add('active');
  // Update nav active
  const navLinks = document.querySelectorAll('#sidenav a[onclick]');
  navLinks.forEach(a=>{ if(a.getAttribute('onclick')===`goto('${sec}')`) a.classList.add('active'); });
  // Sub-nav
  const subNav = document.getElementById('sub-nav');
  const subLabel = document.getElementById('sub-nav-label');
  if (SUB_NAVS[sec]) {
    subLabel.style.display = 'block';
    subNav.innerHTML = SUB_NAVS[sec].map(n => `<a class="sub" href="#${n.h}" onclick="scrollToAnchor('${n.h}')">${n.l}</a>`).join('');
  } else {
    subLabel.style.display = 'none';
    subNav.innerHTML = '';
  }
  if (typeof closeNav === 'function') closeNav();
  const nextUrl = sec === 'home' ? location.pathname + location.search : '#' + sec;
  if ((sec === 'home' && location.hash) || (sec !== 'home' && location.hash.slice(1) !== sec)) {
    history.replaceState(null, '', nextUrl);
  }
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function scrollToAnchor(id) {
  const el = document.getElementById(id);
  if (el) setTimeout(() => el.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}), 50);
}

// Back-to-top
window.addEventListener('scroll',()=>{ document.getElementById('top').style.display=window.scrollY>300?'flex':'none'; });

// ════ ACCORDION ════
function tog(h){ h.classList.toggle('open'); h.nextElementSibling.classList.toggle('show'); }
document.querySelectorAll('.acc-head.open').forEach(h=>h.nextElementSibling.classList.add('show'));

function showToast(msg){
  const t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2500);
}

// ════ HIGHLIGHTER ════
let hlMode = false;

function toggleHighlighter() {
  hlMode = !hlMode;
  document.body.classList.toggle('hl-mode', hlMode);
  var navBtn = document.getElementById('nav-hl-btn');
  var navLbl = document.getElementById('nav-hl-label');
  if(navBtn) navBtn.classList.toggle('hl-on', hlMode);
  if(navLbl) navLbl.textContent = hlMode ? 'Evidențiator ON' : 'Evidențiator';
  showToast(hlMode ? '🖊 Evidențiator activat – selectează text!' : 'Evidențiator dezactivat');
}

function applyHighlight(range) {
  const ancestor = range.commonAncestorContainer;
  const root = ancestor.nodeType === 3 ? ancestor.parentNode : ancestor;
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    if (range.intersectsNode(walker.currentNode)) textNodes.push(walker.currentNode);
  }
  textNodes.forEach(function(tn) {
    if (tn.parentNode && tn.parentNode.classList && tn.parentNode.classList.contains('hl')) return;
    let start = 0, end = tn.length;
    if (tn === range.startContainer) start = range.startOffset;
    if (tn === range.endContainer) end = range.endOffset;
    if (start >= end) return;
    const nr = document.createRange();
    nr.setStart(tn, start);
    nr.setEnd(tn, end);
    const mark = document.createElement('mark');
    mark.className = 'hl';
    nr.surroundContents(mark);
  });
}

document.addEventListener('mouseup', function(e) {
  if (!hlMode) return;
  if (e.target.closest('button, input, select, textarea, nav, #hl-btn')) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.toString().trim() === '') return;
  const range = sel.getRangeAt(0);
  sel.removeAllRanges();
  applyHighlight(range);
});

var lessonSearchState = {
  term: '',
  matches: [],
  currentIndex: -1,
  isOpen: false
};

function unwrapSearchHighlights() {
  window.BBLessonSearchText.clear();
}

function clearLessonSearch(resetInput) {
  unwrapSearchHighlights();
  lessonSearchState.term = '';
  lessonSearchState.matches = [];
  lessonSearchState.currentIndex = -1;
  updateLessonSearchUi();
  if (resetInput) document.getElementById('lesson-search-input').value = '';
}

function setLessonSearchOpen(isOpen, shouldFocus) {
  var root = document.getElementById('lesson-search');
  var input = document.getElementById('lesson-search-input');
  if (!root || !input) return;
  lessonSearchState.isOpen = !!isOpen;
  root.classList.toggle('open', !!isOpen);
  if (isOpen) closeNav();
  if (isOpen && shouldFocus !== false) {
    setTimeout(function() {
      input.focus();
      input.select();
    }, 40);
  }
}

function openLessonSearch() {
  setLessonSearchOpen(true, true);
}

function collectSearchMatches(term) {
  return window.BBLessonSearchText.collect(term, { fullSectionId: true });
}

function highlightLessonMatches(matches) {
  window.BBLessonSearchText.render(matches);
}

function updateLessonSearchUi() {
  var count = document.getElementById('lesson-search-count');
  var prevBtn = document.getElementById('lesson-search-prev');
  var nextBtn = document.getElementById('lesson-search-next');
  var total = lessonSearchState.matches.length;
  var current = total ? lessonSearchState.currentIndex + 1 : 0;
  count.textContent = current + ' / ' + total;
  prevBtn.disabled = total < 2;
  nextBtn.disabled = total < 2;
}

function goToLessonSearchResult(index) {
  if (!lessonSearchState.matches.length) {
    updateLessonSearchUi();
    return;
  }
  var total = lessonSearchState.matches.length;
  var normalized = ((index % total) + total) % total;
  if (lessonSearchState.currentIndex >= 0) {
    var currentMatch = lessonSearchState.matches[lessonSearchState.currentIndex];
    window.BBLessonSearchText.setCurrent(currentMatch, false);
  }
  lessonSearchState.currentIndex = normalized;
  var target = lessonSearchState.matches[normalized];
  if (target.element) {
    window.BBLessonSearchText.setCurrent(target, true);
    var targetSection = target.sectionId.replace(/^page-/, '');
    var activeSection = document.querySelector('.page-section.active');
    var activeSectionId = activeSection ? activeSection.id.replace(/^page-/, '') : '';
    if (activeSectionId !== targetSection) {
      goto(targetSection);
    }
    requestAnimationFrame(function() {
      target.element.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth', block:'center'});
    });
  }
  updateLessonSearchUi();
}

function performLessonSearch(term, preferredSectionId, preferredHit) {
  var cleanTerm = String(term || '').trim();
  if (!cleanTerm) {
    clearLessonSearch(false);
    return;
  }
  unwrapSearchHighlights();
  var matches = collectSearchMatches(cleanTerm);
  lessonSearchState.term = cleanTerm;
  lessonSearchState.matches = matches;
  lessonSearchState.currentIndex = -1;
  if (!matches.length) {
    updateLessonSearchUi();
    return;
  }
  highlightLessonMatches(matches);
  var targetIndex = 0;
  if (preferredSectionId) {
    var normalizedSectionId = preferredSectionId.indexOf('page-') === 0 ? preferredSectionId : 'page-' + preferredSectionId;
    var wantedHit = Number(preferredHit);
    var sectionMatches = matches.filter(function(match) { return match.sectionId === normalizedSectionId; });
    if (sectionMatches.length) {
      if (Number.isFinite(wantedHit) && sectionMatches[wantedHit]) {
        targetIndex = sectionMatches[wantedHit].index;
      } else {
        targetIndex = sectionMatches[0].index;
      }
    }
  }
  goToLessonSearchResult(targetIndex);
}

function searchAndScrollTo(term, preferredSectionId, preferredHit) {
  var input = document.getElementById('lesson-search-input');
  setLessonSearchOpen(true, false);
  if (input) input.value = term;
  performLessonSearch(term, preferredSectionId, preferredHit);
}

function openLessonSearchPanel() {
  setLessonSearchOpen(true, true);
}

function setupLessonSearch() {
  var root = document.getElementById('lesson-search');
  var input = document.getElementById('lesson-search-input');
  var prevBtn = document.getElementById('lesson-search-prev');
  var nextBtn = document.getElementById('lesson-search-next');
  var closeBtn = document.getElementById('lesson-search-close');
  if (!root || !input || !prevBtn || !nextBtn || !closeBtn) return;

  input.addEventListener('input', function() {
    performLessonSearch(input.value);
  });
  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      goToLessonSearchResult(lessonSearchState.currentIndex + (e.shiftKey ? -1 : 1));
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      clearLessonSearch(true);
      setLessonSearchOpen(false, false);
    }
  });
  prevBtn.addEventListener('click', function() {
    goToLessonSearchResult(lessonSearchState.currentIndex - 1);
  });
  nextBtn.addEventListener('click', function() {
    goToLessonSearchResult(lessonSearchState.currentIndex + 1);
  });
  closeBtn.addEventListener('click', function() {
    clearLessonSearch(true);
    setLessonSearchOpen(false, false);
  });
  document.addEventListener('click', function(e) {
    if (!lessonSearchState.isOpen) return;
    if (!root.contains(e.target)) {
      clearLessonSearch(true);
      setLessonSearchOpen(false, false);
    }
  });
  document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setLessonSearchOpen(true, true);
      return;
    }
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement.isContentEditable) return;
      e.preventDefault();
      setLessonSearchOpen(true, true);
    }
  });
  updateLessonSearchUi();
}

// ════ INIT ════
(function(){
  var p = new URLSearchParams(window.location.search);
  var initialSection = p.get('goto') || window.location.hash.slice(1) || 'home';
  goto(document.getElementById('page-' + initialSection) ? initialSection : 'home');
  // chapter-redesign.js publishes the shared text matcher later in the page.
  // Keep the initial route immediate, but bind/restore search after scripts load.
  function initSearch() {
    setupLessonSearch();
    var q = p.get('q');
    if (q) searchAndScrollTo(q, p.get('section'), p.get('hit'));
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch, { once: true });
  } else {
    initSearch();
  }
})();

// ── NAV MOBILE TOGGLE ──
function closeNav(){
  var nav = document.getElementById('sidenav');
  var overlay = document.getElementById('nav-overlay');
  nav.classList.remove('open');
  overlay.classList.remove('open');
}
// Close nav when a menu item is clicked on mobile
document.getElementById('sidenav').querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){
    if(window.innerWidth <= 1024) closeNav();
  });
});

// ── SERVICE WORKER ──
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').catch(function(){});
  });
}

// ════ SETTINGS FAB ════
function toggleSettingsFab(){
  var panel = document.getElementById('settings-panel');
  if(panel) panel.classList.toggle('open');
}
function updateFabStates(){
  var hl = document.getElementById('sfab-hl');
  if(hl) hl.classList.toggle('on', typeof hlMode !== 'undefined' && hlMode);
}
document.addEventListener('click', function(e){
  var panel = document.getElementById('settings-panel');
  var fab   = document.getElementById('settings-fab');
  if(panel && panel.classList.contains('open') && fab && !panel.contains(e.target) && !fab.contains(e.target)){
    panel.classList.remove('open');
  }
});
(function(){
  var origHl = window.toggleHighlighter;
  if(typeof origHl === 'function'){
    window.toggleHighlighter = function(){ origHl(); updateFabStates(); };
  }
  document.addEventListener('DOMContentLoaded', function(){ updateFabStates(); });
})();
