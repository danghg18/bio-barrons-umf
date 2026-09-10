// ════ SUB-NAV ════
const SUB_NAVS = {
  testiculele: [
    {h:'intro', l:'22.1 Introducere'},
    {h:'testiculele', l:'22.2 Testiculele'},
    {h:'scrot', l:'Scrotul'},
    {h:'dezvoltare', l:'Dezvoltarea testiculelor'},
    {h:'spermatogeneza', l:'Spermatogeneza'},
    {h:'spermatozoizi', l:'Spermatozoizii'},
  ],
  ducte: [
    {h:'cai-ducte', l:'Căile sistemului reproducător'},
    {h:'organe-anexe', l:'Organe Anexe'},
  ],
  hormoni: [
    {h:'hormoni-masculini', l:'Hormonii masculini'},
    {h:'testosteron', l:'Testosteronul'},
  ],
};

// ════ NAVIGATION ════
function goto(sec, anchor) {
  if (!document.getElementById('page-' + sec)) sec = 'home';
  document.querySelectorAll('.page-section').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('#sidenav a').forEach(a => a.classList.remove('active'));
  document.querySelectorAll('.lab-nav a').forEach(a => a.classList.remove('active'));
  const page = document.getElementById('page-' + sec);
  if (page) page.classList.add('active');
  const topNav = document.querySelectorAll('.lab-nav a');
  if (sec === 'home' && topNav[0]) topNav[0].classList.add('active');
  const navLinks = document.querySelectorAll('#sidenav a[onclick]');
  navLinks.forEach(a=>{ if(a.getAttribute('onclick')===`goto('${sec}')`) a.classList.add('active'); });
  const subNav = document.getElementById('sub-nav');
  const subLabel = document.getElementById('sub-nav-label');
  if (SUB_NAVS[sec]) {
    subLabel.style.display = 'block';
    subNav.innerHTML = SUB_NAVS[sec].map(n => `<a class="sub" href="#${n.h}" onclick="scrollToAnchor('${n.h}')">${n.l}</a>`).join('');
  } else {
    subLabel.style.display = 'none';
    subNav.innerHTML = '';
  }
  window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  closeNav();
  const nextUrl = sec === 'home' ? location.pathname + location.search : '#' + sec;
  if ((sec === 'home' && location.hash) || (sec !== 'home' && location.hash.slice(1) !== sec)) {
    history.replaceState(null, '', nextUrl);
  }
}

function scrollToAnchor(id) {
  const el = document.getElementById(id);
  if (el) setTimeout(() => el.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}), 50);
}

window.addEventListener('scroll',()=>{ document.getElementById('top').style.display=window.scrollY>300?'flex':'none'; });

// ════ ACCORDION ════
function tog(h){ h.classList.toggle('open'); h.nextElementSibling.classList.toggle('show'); }

// ════ HIGHLIGHTER ════
let hlMode = false;
function toggleHighlighter() {
  hlMode = !hlMode;
  document.body.classList.toggle('hl-mode', hlMode);
  const hlBtn = document.getElementById('hl-btn');
  const navHlBtn = document.getElementById('nav-hl-btn');
  const navHlLabel = document.getElementById('nav-hl-label');
  if (hlBtn) hlBtn.classList.toggle('active', hlMode);
  if (navHlBtn) {
    navHlBtn.classList.toggle('hl-on', hlMode);
    if(navHlLabel) navHlLabel.textContent = hlMode ? 'Evidențiator ON' : 'Evidențiator';
  }
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

document.addEventListener('mouseup', function(e){
  if (!hlMode) return;
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
  const range = sel.getRangeAt(0);
  if (!range || range.collapsed) return;
  sel.removeAllRanges();
  applyHighlight(range);
});

// ════ NAV MOBILE ════
function closeNav(){
  const nav = document.getElementById('sidenav');
  const overlay = document.getElementById('nav-overlay');
  nav.classList.remove('open');
  overlay.classList.remove('open');
}
document.getElementById('sidenav').querySelectorAll('a').forEach(function(a){
  a.addEventListener('click', function(){
    if(window.innerWidth <= 1024) closeNav();
  });
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
