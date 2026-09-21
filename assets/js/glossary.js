(function () {
  'use strict';
  const data = window.BB_GLOSSARY;
  const search = window.BBGlossarySearch;
  const root = document.getElementById('glossary-results');
  if (!root) return;
  const count = document.getElementById('glossary-count');
  if (!data || !search) {
    count.textContent = 'Glosarul nu s-a încărcat. Reîncarcă pagina pentru a încerca din nou.';
    return;
  }
  const input = document.getElementById('glossary-query');
  const exact = document.getElementById('glossary-exact');
  const clear = document.getElementById('glossary-clear');
  const alphabet = document.getElementById('glossary-alphabet');
  const empty = document.getElementById('glossary-empty');
  const more = document.getElementById('glossary-more');
  const shown = document.getElementById('glossary-shown');
  const params = new URLSearchParams(location.search);
  const pageSize = 25;
  let letter = /^[A-Z]$/.test(params.get('letter') || '') ? params.get('letter') : '';
  let visible = pageSize;
  let results = [];
  input.value = params.get('q') || '';
  exact.checked = params.get('exact') === '1';

  function updateUrl(clearHash) {
    const url = new URL(location.href);
    for (const [name, value] of [['q',input.value],['exact',exact.checked ? '1' : ''],['letter',letter]]) {
      if (value) url.searchParams.set(name,value);
      else url.searchParams.delete(name);
    }
    if (clearHash) url.hash = '';
    // Preserve the navigation context marker used by the return button.
    history.replaceState(history.state, '', url);
  }
  function appendHighlighted(parent, text) {
    let previous = 0;
    search.ranges(text, input.value).forEach(([start,end]) => {
      parent.append(document.createTextNode(text.slice(previous,start)));
      const mark = document.createElement('mark');
      mark.textContent = text.slice(start,end);
      parent.append(mark);
      previous = end;
    });
    parent.append(document.createTextNode(text.slice(previous)));
  }
  function entryElement(entry) {
    const article = document.createElement('article');
    article.className = 'glossary-entry';
    article.id = 'termen-' + entry.id;
    article.tabIndex = -1;
    const heading = document.createElement('h2');
    const link = document.createElement('a');
    link.className = 'glossary-permalink';
    link.href = '#' + article.id;
    link.title = 'Link către termen';
    appendHighlighted(link,entry.term);
    heading.append(link);
    const definition = document.createElement('p');
    definition.className = 'glossary-definition';
    appendHighlighted(definition,entry.definition);
    const source = document.createElement('p');
    source.className = 'glossary-source';
    source.textContent = 'p. ' + entry.sourcePage;
    source.setAttribute('aria-label','Pagina ' + entry.sourcePage + ' din manual');
    article.append(heading,definition,source);
    return article;
  }
  function render(reset = true) {
    if (reset) visible = pageSize;
    results = search.find(data.entries, input.value, {exact:exact.checked,letter});
    const fragment = document.createDocumentFragment();
    results.slice(0,visible).forEach(entry => fragment.append(entryElement(entry)));
    root.replaceChildren(fragment);
    count.textContent = input.value.trim() || letter
      ? results.length + (results.length === 1 ? ' termen găsit' : ' termeni găsiți')
      : data.entries.length + ' termeni în glosar';
    shown.textContent = results.length ? 'Afișați ' + Math.min(visible,results.length) + ' din ' + results.length : '';
    clear.hidden = !input.value;
    empty.hidden = results.length !== 0;
    more.hidden = visible >= results.length;
    alphabet.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.letter === letter)));
  }
  function change() { updateUrl(true); render(); }
  function restoreHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch (_) { return; }
    const entry = data.entries.find(item => 'termen-' + item.id === id);
    if (!entry) return;
    if (!document.getElementById(id)) {
      input.value = entry.term;
      exact.checked = true;
      letter = '';
      updateUrl(false);
      render();
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({block:'start',behavior:'instant'});
      target.focus({preventScroll:true});
    }
  }
  const initials = new Set(data.entries.map(entry => search.normalize(entry.term)[0]));
  for (const value of ['', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ']) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.letter = value;
    button.textContent = value || 'Toate';
    button.setAttribute('aria-label',value ? 'Litera ' + value : 'Toate literele');
    button.disabled = !!value && !initials.has(value.toLowerCase());
    button.addEventListener('click',() => { letter = value; change(); });
    alphabet.append(button);
  }
  input.addEventListener('input',change);
  exact.addEventListener('change',change);
  document.getElementById('glossary-form').addEventListener('submit',event => { event.preventDefault(); change(); });
  clear.addEventListener('click',() => { input.value=''; change(); input.focus(); });
  document.getElementById('glossary-reset').addEventListener('click',() => {
    input.value=''; exact.checked=false; letter=''; change(); input.focus();
  });
  more.addEventListener('click',() => {
    const next = results[visible];
    visible += pageSize;
    render(false);
    // Keep keyboard users beside the newly revealed content.
    if (next) document.getElementById('termen-' + next.id)?.focus({preventScroll:true});
  });
  root.addEventListener('click',event => {
    const link = event.target.closest('a.glossary-permalink');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    history.replaceState(history.state,'',link.href);
    restoreHash();
  });
  window.addEventListener('hashchange',restoreHash);
  window.addEventListener('beforeprint',() => {
    visible = results.length;
    render(false);
  });
  render();
  // Fonts can move a term after the initial scroll to a direct link.
  Promise.resolve(document.fonts?.ready).then(restoreHash);
  window.BBGlossaryNavigation?.init();
})();
