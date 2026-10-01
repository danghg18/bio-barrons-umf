/* Persistent lesson annotations. BBUserStorage owns identity and synchronization.
 * Search markers and personal note editors are deliberately outside this model. */
(function () {
  'use strict';
  if (window.BBLessonHighlights) return;
  const filename = decodeURIComponent(location.pathname.split('/').pop());
  const chapter = typeof CHAPTERS === 'undefined' ? null : CHAPTERS.find(item => item.done && item.url === filename);
  if (!chapter || !window.BBUserStorage) return;
  const PREFIX = 'bb.highlight.v1:', CLEAR = 'bb.highlight-clear.v1:';
  const COLORS = ['yellow', 'green', 'blue', 'pink', 'orange', 'violet'];
  const EXCLUDE = 'script,style,nav,button,input,textarea,select,svg,[contenteditable],.bb-note-panel,.bb-note-editor,.bb-highlight-tools,[data-curriculum-excluded]';
  let installed = false, writing = false, selectedId = null, lastSignature = '', lastOwner = null;
  let status, warning, popup, originalFocus;
  const uid = () => window.crypto?.randomUUID?.() || Date.now().toString(36) + '-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  const store = () => window.BBUserStorage;
  const snapshot = () => store().snapshot().values || {};
  const annotations = values => Object.entries(values).filter(([key, value]) => key.startsWith(PREFIX) && value?.version === 1 && value.id && key === PREFIX + value.id);
  const barriers = (values, num) => Object.entries(values).filter(([key, value]) => key.startsWith(CLEAR) && value?.version === 1 && value.id && key === CLEAR + value.id && (value.chapterNum === null || Number(value.chapterNum) === Number(num))).map(([, value]) => value.id).sort();
  const active = (record, values) => !record.deleted && barriers(values, record.chapterNum).every(id => Array.isArray(record.clearIds) && record.clearIds.includes(id));
  const signature = values => JSON.stringify(Object.entries(values).filter(([key]) => key.startsWith(PREFIX) || key.startsWith(CLEAR)).sort(([a], [b]) => a.localeCompare(b)));
  function textIndex(section) {
    const nodes = [], walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT, {acceptNode(node) {
      return !node.parentElement || node.parentElement.closest(EXCLUDE) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
    }});
    let text = '';
    while (walker.nextNode()) { const node = walker.currentNode; nodes.push({node, start:text.length, end:text.length + node.length}); text += node.data; }
    return {text, nodes};
  }
  function digest(text) {
    let a = 2166136261, b = 5381;
    for (let i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b, 33) ^ text.charCodeAt(i); }
    return text.length + ':' + (a >>> 0).toString(16) + ':' + (b >>> 0).toString(16);
  }
  function structuralPath(node, section) {
    let element = node.parentElement; const path = [];
    while (element && element !== section) {
      if (!element.matches('mark,.search-found,[data-bb-search]')) {
        const siblings = Array.from(element.parentElement?.children || []).filter(item => !item.matches('mark,.search-found,[data-bb-search]'));
        path.unshift(element.tagName.toLowerCase() + ':' + siblings.indexOf(element));
      }
      element = element.parentElement;
    }
    return path.join('/');
  }
  function locate(anchor, index) {
    if (!anchor || typeof anchor.quote !== 'string' || !anchor.quote.trim()) return null;
    const {text} = index, quote = anchor.quote;
    // Positions are authoritative only when all eligible section text is unchanged.
    if (anchor.sectionDigest === digest(text) && text.slice(anchor.start, anchor.end) === quote) return {start:anchor.start, end:anchor.end};
    const candidates = [];
    let offset = text.indexOf(quote);
    while (offset !== -1) {
      const end = offset + quote.length;
      const prefix = text.slice(Math.max(0, offset - 48), offset), suffix = text.slice(end, end + 48);
      if (prefix === anchor.prefix && suffix === anchor.suffix) candidates.push({start:offset, end});
      if (candidates.length > 1) return null;
      offset = text.indexOf(quote, offset + 1);
    }
    return candidates.length === 1 ? candidates[0] : null;
  }
  function paint(record, section, position) {
    const pieces = textIndex(section).nodes.filter(piece => piece.end > position.start && piece.start < position.end);
    // Keep inline markup and search wrappers in place, including cross-node ranges.
    pieces.reverse().forEach(piece => {
      const range = document.createRange();
      range.setStart(piece.node, Math.max(0, position.start - piece.start));
      range.setEnd(piece.node, Math.min(piece.node.length, position.end - piece.start));
      const mark = document.createElement('mark');
      mark.className = 'hl'; mark.dataset.highlightId = record.id;
      mark.dataset.highlightColor = COLORS.includes(record.color) ? record.color : 'yellow';
      mark.setAttribute('role', 'button'); mark.setAttribute('aria-label', 'Evidențiere: ' + record.anchor.quote + '. Opțiuni de ștergere.');
      mark.tabIndex = piece === pieces[pieces.length - 1] ? 0 : -1;
      range.surroundContents(mark);
    });
  }
  function removeMarks() {
    document.querySelectorAll('mark[data-highlight-id]').forEach(mark => {
      if (!mark.closest('.page-section') || mark.closest(EXCLUDE)) return;
      const parent = mark.parentNode; mark.replaceWith(...mark.childNodes); parent.normalize();
    });
  }
  function updateStatus(unresolved, count) {
    const persistence = store().canPersist() ? '' : ' Stocarea locală nu este disponibilă; păstrează această pagină deschisă și exportă datele contului.';
    if (status) status.textContent = count + (count === 1 ? ' evidențiere în lecție' : ' evidențieri în lecție');
    if (warning) {
      warning.hidden = !unresolved && !persistence;
      warning.textContent = (unresolved ? unresolved + (unresolved === 1 ? ' evidențiere nu mai poate fi localizată' : ' evidențieri nu mai pot fi localizate') + ' în textul actual. Înregistrările sunt păstrate; nu au fost mutate la alt pasaj.' : '') + persistence;
    }
  }
  function restore() {
    if (!installed) return;
    const values = snapshot(), records = annotations(values).map(([, value]) => value).filter(record => Number(record.chapterNum) === chapter.num && active(record, values));
    closePopup(false); removeMarks();
    let unresolved = 0;
    records.forEach(record => {
      const section = document.getElementById(record.sectionId);
      if (!section?.matches('.page-section') || section.closest(EXCLUDE)) { unresolved++; return; }
      const position = locate(record.anchor, textIndex(section));
      if (!position) { unresolved++; return; }
      paint(record, section, position);
    });
    lastSignature = signature(values); lastOwner = store().owner();
    updateStatus(unresolved, records.length);
  }
  function changed() {
    if (writing || !installed) return;
    if (store().owner() !== lastOwner || signature(snapshot()) !== lastSignature) restore();
  }
  function persist(key, value) {
    writing = true;
    let result;
    try { result = store().set(key, value); } finally { writing = false; }
    return result !== false;
  }
  function saveRange(range) {
    const element = node => node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    const startElement = element(range.startContainer), endElement = element(range.endContainer);
    const section = startElement?.closest('.page-section');
    if (!section || endElement?.closest('.page-section') !== section || startElement.closest(EXCLUDE) || endElement.closest(EXCLUDE)) return false;
    // Do not nest personal marks or accidentally annotate controls between endpoints.
    for (const node of section.querySelectorAll(EXCLUDE + ',mark[data-highlight-id]')) {
      if (range.intersectsNode(node)) return false;
    }
    const index = textIndex(section);
    const points = index.nodes.filter(piece => range.intersectsNode(piece.node));
    if (!points.length) return false;
    const first = points[0], last = points[points.length - 1];
    const start = first.start + (range.startContainer === first.node ? range.startOffset : 0);
    const end = last.start + (range.endContainer === last.node ? range.endOffset : last.node.length);
    const quote = index.text.slice(start, end);
    if (!quote.trim()) return false;
    const values = snapshot(), id = uid();
    const record = {version:1, id, chapterNum:chapter.num, sectionId:section.id, color:COLORS.includes(document.body.dataset.highlightColor) ? document.body.dataset.highlightColor : 'yellow', createdAt:new Date().toISOString(), clearIds:barriers(values, chapter.num), anchor:{quote, prefix:index.text.slice(Math.max(0, start - 48), start), suffix:index.text.slice(end, end + 48), start, end, sectionDigest:digest(index.text), startPath:structuralPath(first.node, section), endPath:structuralPath(last.node, section)}};
    if (!persist(PREFIX + id, record)) return false;
    paint(record, section, {start, end});
    lastSignature = signature(snapshot()); lastOwner = store().owner();
    const current = snapshot();
    const records = annotations(current).map(([, item]) => item).filter(item => Number(item.chapterNum) === chapter.num && active(item, current));
    const unresolved = records.filter(item => !document.querySelector('mark[data-highlight-id="' + CSS.escape(item.id) + '"]')).length;
    updateStatus(unresolved, records.length);
    return true;
  }
  function removeHighlight(id) {
    const record = store().get(PREFIX + id);
    if (!record || record.deleted) return false;
    if (!persist(PREFIX + id, {...record, deleted:true, deletedAt:new Date().toISOString()})) return false;
    restore(); return true;
  }
  function clearHighlights(chapterNum) {
    const values = snapshot(), id = uid();
    // Every clear is immutable. Unknown offline records must acknowledge all
    // applicable barriers before they can appear again; clocks are irrelevant.
    if (!persist(CLEAR + id, {version:1, id, chapterNum, createdAt:new Date().toISOString()})) return false;
    annotations(values).forEach(([key, record]) => {
      if (!record.deleted && (chapterNum === null || Number(record.chapterNum) === Number(chapterNum))) persist(key, {...record, deleted:true, deletedAt:new Date().toISOString()});
    });
    restore(); return true;
  }
  function closePopup(focus = true) {
    if (popup) popup.hidden = true;
    selectedId = null;
    if (focus && originalFocus?.isConnected) originalFocus.focus();
  }
  function openPopup(mark) {
    const record = store().get(PREFIX + mark.dataset.highlightId);
    if (!record || record.deleted) return;
    selectedId = record.id; originalFocus = mark;
    popup.querySelector('p').textContent = record.anchor.quote;
    popup.hidden = false;
    popup.querySelector('button').focus();
  }
  function init(palette) {
    if (installed || !palette) return;
    installed = true;
    const controls = document.createElement('div'); controls.className = 'bb-highlight-tools bb-highlight-management';
    status = document.createElement('p'); status.id = 'bb-highlight-status'; status.setAttribute('role', 'status'); controls.append(status);
    const manage = document.createElement('details'); manage.className = 'bb-highlight-manage';
    manage.innerHTML = '<summary>Șterge evidențieri<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 8 3 3 3-3"/></svg></summary><div class="bb-highlight-actions"><p>Poți șterge un singur pasaj apăsând pe el.</p></div>';
    const actions = manage.querySelector('.bb-highlight-actions');
    [{label:'Șterge evidențierile din această lecție', text:'Din această lecție', chapterNum:chapter.num, scope:'lecția „' + chapter.name + '”'}, {label:'Șterge evidențierile din toate lecțiile', text:'Din toate lecțiile', chapterNum:null, scope:'toate lecțiile'}].forEach(action => {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = action.text; button.setAttribute('aria-label', action.label);
      button.addEventListener('click', () => {
        if (window.confirm('Ștergi toate evidențierile pasajelor din ' + action.scope + '? Ștergerea se aplică și evidențierilor încă nesincronizate de pe alte dispozitive. Nu se șterg notițele, evidențierile din editorul de notițe, progresul sau răspunsurile.')) clearHighlights(action.chapterNum);
      }); actions.append(button);
    });
    controls.append(manage);
    palette.append(controls);
    warning = document.createElement('p'); warning.className = 'bb-highlight-warning'; warning.setAttribute('role', 'status'); warning.hidden = true;
    document.querySelector('main')?.prepend(warning);
    popup = document.createElement('div'); popup.className = 'bb-highlight-popover bb-highlight-tools'; popup.hidden = true;
    popup.setAttribute('role', 'dialog'); popup.setAttribute('aria-label', 'Evidențiere selectată');
    const heading = document.createElement('div'); heading.className = 'bb-highlight-popover-head';
    heading.innerHTML = '<strong>Pasaj evidențiat</strong>';
    const quote = document.createElement('p'), remove = document.createElement('button'), close = document.createElement('button');
    remove.type = close.type = 'button'; remove.textContent = 'Șterge evidențierea'; remove.setAttribute('aria-label','Șterge această evidențiere');
    close.className = 'bb-highlight-close'; close.setAttribute('aria-label','Închide');
    close.innerHTML = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="m6 6 8 8M14 6l-8 8"/></svg>';
    remove.addEventListener('click', () => { const id = selectedId; if (id) removeHighlight(id); document.getElementById('nav-hl-btn')?.focus(); });
    close.addEventListener('click', () => closePopup()); heading.append(close); popup.append(heading, quote, remove); document.body.append(popup);
    document.addEventListener('click', event => {
      const mark = event.target.closest?.('mark[data-highlight-id]');
      if (mark && !mark.closest(EXCLUDE) && window.getSelection()?.isCollapsed) openPopup(mark);
      else if (!popup.hidden && !popup.contains(event.target)) closePopup(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !popup.hidden) { event.preventDefault(); closePopup(); }
      const mark = event.target.closest?.('mark[data-highlight-id]');
      if (mark && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openPopup(mark); }
    });
    function selection(event) {
      if (!document.body.classList.contains('hl-mode') || event.target.closest?.(EXCLUDE)) return;
      const owner = store().owner();
      window.setTimeout(() => {
        if (store().owner() !== owner || !document.body.classList.contains('hl-mode')) return;
        const selected = window.getSelection();
        if (!selected || selected.isCollapsed || !selected.rangeCount) return;
        if (saveRange(selected.getRangeAt(0))) selected.removeAllRanges();
      }, event.type === 'touchend' ? 60 : 0);
    }
    document.addEventListener('mouseup', selection);
    document.addEventListener('touchend', selection);
    document.addEventListener('keyup', event => { if (event.key === 'Shift') selection(event); });
    document.addEventListener('bb:cache-change', changed);
    document.addEventListener('bb:cache-write', changed);
    document.addEventListener('bb:cache-owner-change', changed);
    restore();
  }
  window.BBLessonHighlights = {init, restore, saveRange, removeHighlight, clearHighlights};
}());
