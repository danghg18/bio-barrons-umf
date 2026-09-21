/* Shared presentation for the testing overview and personal analytics. */
(function () {
  'use strict';
  const analytics = window.BBQuizAnalytics;
  if (!analytics) return;
  const isReport = document.body.classList.contains('bm-analytics');
  const index = window.BB_QUIZ_INDEX || [];
  const integer = new Intl.NumberFormat('ro-RO');
  const percent = new Intl.NumberFormat('ro-RO', {maximumFractionDigits:1});
  const shortDate = new Intl.DateTimeFormat('ro-RO', {day:'numeric', month:'short'});
  const longDate = new Intl.DateTimeFormat('ro-RO', {day:'numeric', month:'long', year:'numeric'});
  const dateTime = new Intl.DateTimeFormat('ro-RO', {day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
  let report;
  let catalogFilter = 'available';
  let historyPage = 0;
  let requestId = 0;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const pct = value => Number.isFinite(value) ? percent.format(value) + '%' : '—';
  const number = value => integer.format(value || 0);
  const dayDate = value => new Date(value + 'T12:00:00');
  const byId = id => document.getElementById(id);

  function put(id, html) {
    const root = byId(id);
    if (!root) return;
    const focusedId = root.contains(document.activeElement) && document.activeElement.id;
    root.innerHTML = html;
    if (focusedId) byId(focusedId)?.focus({preventScroll:true});
  }

  function chart(id, days, kind, compact) { window.BBAnalyticsCharts.render(id, days, kind, compact); }
  let selectedTopic = null;
  let reviewMode = 'unresolved';
  function tooltip(title, rows) { return `data-tooltip-title="${escape(title)}" data-tooltip-rows="${escape(JSON.stringify(rows))}"`; }

  function currentProgress(current) {
    const value = current.total ? Math.round(current.verified / current.total * 100) : 0;
    return `<span class="analytics-progress-label"><strong>${number(current.verified)}</strong> / ${number(current.total)} verificate</span><progress class="analytics-progress" value="${current.verified}" max="${current.total || 1}" aria-label="Progres actual: ${value}%">${value}%</progress>`;
  }

  function applyCatalogFilter() {
    document.querySelectorAll('.testing-chapter-row').forEach(row => {
      row.hidden = catalogFilter === 'available' && row.classList.contains('is-unavailable');
    });
    document.querySelectorAll('.testing-category').forEach(group => {
      group.hidden = !group.querySelector('.testing-chapter-row:not([hidden])');
    });
    document.querySelectorAll('[data-catalog-filter]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.catalogFilter === catalogFilter));
    });
    const filters = document.querySelector('.testing-catalog-filter');
    if (filters) filters.hidden = false;
  }

  function renderCatalog(data, lifetime) {
    const groups = new Map();
    CHAPTERS.forEach(chapter => {
      if (!groups.has(chapter.cat)) groups.set(chapter.cat, []);
      groups.get(chapter.cat).push(chapter);
    });
    let groupNumber = 0;
    const html = [...groups].map(([category, chapters]) => {
      groupNumber++;
      const rows = chapters.map(chapter => {
        const quiz = lifetime.quizzes.find(row => row.chapterNum === chapter.num);
        const content = `<span class="lab-item-num">${String(chapter.num).padStart(2,'0')}</span><span class="testing-chapter-name"><span class="lab-item-title">${escape(chapter.name)}</span><span class="lab-item-tags">${quiz ? number(quiz.questions.length) + ' de grile' : 'Test în pregătire'}</span></span>`;
        if (!quiz) return `<div class="testing-chapter-row is-unavailable"><button type="button" class="lab-item lab-item-soon" data-chapter="${chapter.num}" disabled>${content}<span class="testing-start">În curând</span></button></div>`;
        const practice = quiz.mistakeIds.length ? `<a class="testing-practice-link" id="testing-practice-${chapter.num}" href="${escape(quiz.url)}?mod=greseli" aria-label="Exersează greșelile: ${escape(chapter.name)} (${quiz.mistakeIds.length})">Exersează greșelile <span>${number(quiz.mistakeIds.length)}</span></a>` : '';
        const unstarted = !quiz.summary.solved && !quiz.current.verified;
        const progress = unstarted ? '<span class="testing-unstarted">Neînceput</span>' : currentProgress(quiz.current);
        return `<div class="testing-chapter-row${unstarted ? ' is-unstarted' : ''}"><a class="lab-item lab-item-done" id="testing-quiz-${chapter.num}" data-chapter="${chapter.num}" href="${escape(quiz.url)}">${content}<span class="testing-start">Rezolvă <span aria-hidden="true">↗</span></span></a><div class="testing-row-progress">${progress}</div><a class="testing-stats-link" id="testing-stats-${chapter.num}" href="statistici.html?capitol=${chapter.num}" aria-label="Statistici: ${escape(chapter.name)}">Statistici <span aria-hidden="true">→</span></a>${practice}</div>`;
      }).join('');
      return `<section class="testing-category" aria-labelledby="testing-category-${groupNumber}"><div class="testing-category-head"><span>${String(groupNumber).padStart(2,'0')}</span><h3 id="testing-category-${groupNumber}">${escape(category)}</h3></div>${rows}</section>`;
    }).join('');
    const catalog = document.querySelector('#lab-testing-catalog .lab-bento-grid');
    if (catalog) { catalog.id = 'testing-categories'; put('testing-categories', html); }
    applyCatalogFilter();
    const totalQuestions = lifetime.quizzes.reduce((total, quiz) => total + quiz.questions.length, 0);
    const completed = lifetime.summary.distinct;
    put('testing-preview-summary', `<div class="testing-progress-count"><strong>${number(completed)}</strong><span>din ${number(totalQuestions)} grile diferite parcurse</span></div><progress class="analytics-progress" value="${completed}" max="${totalQuestions || 1}" aria-label="${number(completed)} din ${number(totalQuestions)} grile diferite parcurse"></progress>`);
    chart('testing-activity', data.daily, 'activity', true);
    byId('lab-testing-count').textContent = index.length + ' capitole disponibile';
  }

  let lifetimeReport, mistakePage = 0, allTopics = false, lastOwner = null, clearOwner = null;
  const reportOwner = () => window.BBUserStorage?.owner() || 'guest';
  const pageSize = 5;
  const arrow = '<span class="statistics-button-icon" aria-hidden="true"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 15 15 5M5 5h10v10"/></svg></span>';
  const primaryLink = (label, href, id = '') => `<a ${id ? `id="${id}"` : ''} class="statistics-button" href="${escape(href)}">${escape(label)}${arrow}</a>`;
  const runTitle = run => run?.number ? 'Parcurgerea ' + number(run.number) : 'Parcurgere anterioară';
  const fullRuns = data => (data?.runs || []).filter(run => run.mode !== 'mistakes');
  function currentRun(quiz) {
    return fullRuns(lifetimeReport).find(run => run.id === quiz.activeRunId || (run.storageKey === quiz.storageKey && run.isCurrent));
  }
  function practiceUrl(run) { return run.quizUrl + '?mod=greseli&parcurgere=' + encodeURIComponent(run.id); }
  function getFilters() {
    if (!isReport) return {chapterNum:null, days:30};
    const params = new URLSearchParams(location.search), chapter = Number(params.get('capitol')), days = params.get('perioada') || 'all';
    return {chapterNum:index.some(q => q.chapterNum === chapter) ? chapter : null, days:days === 'all' ? 'all' : days === '7' ? 7 : 30};
  }
  function activeTab() {
    const value = new URLSearchParams(location.search).get('fila');
    return ['greseli','istoric'].includes(value) ? value : location.hash === '#analytics-mistakes' ? 'greseli' : 'rezumat';
  }
  function closeClear() {
    if (!isReport) return;
    clearOwner = null;
    byId('analytics-clear-confirmation').hidden = true; byId('analytics-clear-start').hidden = false;
  }
  function navigateTab(tab, focus = false) {
    const url = new URL(location.href);
    if (tab === 'rezumat') url.searchParams.delete('fila'); else url.searchParams.set('fila', tab);
    url.hash = '';
    history.pushState(null, '', url); closeClear(); applyTabs();
    if (focus) byId('analytics-tab-' + tab).focus({preventScroll:true});
  }
  function applyTabs() {
    const selected = activeTab();
    document.querySelectorAll('[data-analytics-tab]').forEach(button => {
      const active = button.dataset.analyticsTab === selected;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      byId('analytics-panel-' + button.dataset.analyticsTab).hidden = !active;
    });
    byId(selected === 'istoric' ? 'analytics-period-history' : 'analytics-period-summary').append(byId('analytics-period-field'));
    window.BBAnalyticsCharts.hide();
    if (report) renderVisibleCharts();
  }
  function setFilters() {
    const url = new URL(location.href), chapter = byId('analytics-chapter').value;
    if (chapter === 'all') url.searchParams.delete('capitol'); else url.searchParams.set('capitol', chapter);
    url.searchParams.set('perioada', byId('analytics-period').value);
    history.pushState(null, '', url); historyPage = 0; mistakePage = 0; selectedTopic = null; allTopics = false;
    closeClear(); refresh();
  }
  function renderSummary() {
    const quizzes = lifetimeReport.quizzes, single = quizzes.length === 1 && getFilters().chapterNum !== null;
    const quiz = single ? quizzes[0] : null, run = quiz && currentRun(quiz);
    const current = quizzes.reduce((all, q) => ({verified:all.verified + q.current.verified, correct:all.correct + q.current.correct, total:all.total + q.current.total}), {verified:0,correct:0,total:0});
    // A run owns the original score. Corrections never replace these values.
    const baseline = run || current;
    const verified = run ? run.verified : current.verified, total = run ? run.total : current.total;
    const correct = baseline.correct, wrong = verified - correct;
    const initialAccuracy = verified ? correct / verified * 100 : null;
    const correction = run?.correction;
    const hasCorrections = !!correction?.roundCount;
    const hasHistory = lifetimeReport.summary.solved > 0 || lifetimeReport.runs.length > 0;
    byId('analytics-onboarding').hidden = hasHistory || verified > 0;
    byId('analytics-metrics').hidden = !hasHistory && !verified;
    byId('analytics-evolution').hidden = !hasHistory;
    if (!hasHistory && !verified) {
      put('analytics-onboarding', `<span class="statistics-tag">Un pas la un moment dat</span><h2>Începe prima parcurgere.</h2><p>Rezolvă capitolul, apoi corectează greșelile. Vei vedea atât rezultatul inițial, cât și progresul după corectare.</p>${primaryLink('Rezolvă prima grilă', quiz?.url || 'testare.html#lab-testing-catalog')}`);
    }
    const title = run?.number ? runTitle(run) : single ? 'Parcurgerea curentă' : 'Parcurgerile curente';
    const after = hasCorrections ? pct(correction.accuracy) : verified === total && !wrong && total ? '100%' : '—';
    const afterNote = hasCorrections ? `${number(correction.roundCount)} ${correction.roundCount === 1 ? 'rundă' : 'runde'} de corectare · ${number(correction.remaining)} ${correction.remaining === 1 ? 'greșeală rămasă' : 'greșeli rămase'}` : verified === total && !wrong && total ? 'Toate corecte din prima' : 'După testul complet, corectezi greșelile.';
    put('analytics-metrics', `<div class="statistics-frame"><div class="statistics-hero"><div class="statistics-hero-copy"><span class="statistics-tag">${single ? 'Capitolul ' + quiz.chapterNum : 'Privire de ansamblu'}</span><h2>${title}</h2><p class="statistics-hero-name">${single ? escape(quiz.name) : 'Câte un capitol, până la toate corecte.'}</p><div class="statistics-progress-copy"><strong data-current-progress>${number(verified)} <span>din ${number(total)} grile</span></strong><span>${total ? number(Math.round(verified / total * 100)) : '0'}% parcurse</span></div><progress class="statistics-progress" value="${verified}" max="${total || 1}" aria-label="${number(verified)} din ${number(total)} grile verificate"></progress></div><div class="statistics-scores"><div class="statistics-initial"><span>${verified === total ? 'Rezultatul inițial' : 'Rezultatul inițial · în curs'}</span><strong data-current-initial>${pct(initialAccuracy)}</strong><p>${number(correct)} corecte <span>· ${number(wrong)} greșite</span></p></div><div class="statistics-corrected"><span>După corectare</span><strong data-current-corrected>${single ? after : '—'}</strong><p>${single ? afterNote : 'Alege un capitol pentru detalii.'}</p></div></div><div id="analytics-next-step" class="statistics-next-step"></div></div></div>`);
    if (run?.correction?.canPractice) {
      put('analytics-next-step', `${primaryLink(correction.roundCount ? 'Continuă corectarea' : 'Corectează greșelile', practiceUrl(run), 'analytics-continue')}<button type="button" class="statistics-text-action" data-open-tab="greseli">Vezi greșelile</button>`);
    } else if (single && !run && total && verified === total && wrong) {
      put('analytics-next-step', primaryLink('Corectează greșelile', quiz.url + '?mod=greseli', 'analytics-continue'));
    } else {
      const label = single && verified === total ? (wrong && !correction?.complete ? 'Deschide parcurgerea' : 'Înapoi la grile') : verified ? 'Continuă grilele' : 'Începe grilele';
      put('analytics-next-step', primaryLink(label, quiz?.url || 'testare.html#lab-testing-catalog', 'analytics-continue'));
    }
    renderComparison();
  }
  function renderComparison() {
    const root = byId('analytics-comparison'); root.hidden = getFilters().chapterNum !== null;
    if (root.hidden) { put(root.id, ''); return; }
    put(root.id, `<h2 class="statistics-list-heading">Capitolele tale</h2><div class="statistics-chapter-list">${lifetimeReport.quizzes.map(q => `<a class="statistics-chapter" href="statistici.html?capitol=${q.chapterNum}"><span class="statistics-chapter-number">${String(q.chapterNum).padStart(2,'0')}</span><span><strong>${escape(q.name)}</strong><small>${number(q.current.verified)} din ${number(q.current.total)} grile parcurse</small></span><span class="statistics-chapter-result">${q.current.verified ? pct(q.current.correct / q.current.verified * 100) : 'Neînceput'}<small>${q.current.verified ? 'inițial' : ''}</small></span>${arrow}</a>`).join('')}</div>`);
  }
  function currentMistakes() {
    const items = [];
    for (const quiz of lifetimeReport.quizzes) {
      const run = currentRun(quiz);
      const corrected = new Set(run?.correction?.correctedIds || []);
      const savedWrong = new Set(quiz.current.wrongIds || []);
      for (const q of quiz.questions) {
        const answer = run?.answers[q.id];
        if (run ? !answer?.verified || answer.correct : !savedWrong.has(q.id)) continue;
        const topic = quiz.topics?.find(t => t.id === q.topicId);
        items.push({id:q.id, number:q.number, chapterNum:quiz.chapterNum, chapterName:quiz.name, quizUrl:quiz.url, topicId:q.topicId, topicLabel:topic?.label || 'Recapitulare', lessonUrl:topic?.lessonUrl, resolved:corrected.has(q.id), run});
      }
    }
    return items;
  }
  function topicKey(item) { return item.chapterNum + ':' + (item.topicId || ''); }
  function renderMistakes() {
    const all = currentMistakes(), chosen = all.filter(item => reviewMode === 'all' || (reviewMode === 'resolved' ? item.resolved : !item.resolved));
    const topics = new Map();
    chosen.forEach(item => { const key = topicKey(item); if (!topics.has(key)) topics.set(key, {...item, key, count:0}); topics.get(key).count++; });
    const rows = [...topics.values()].sort((a,b) => b.count - a.count || a.topicLabel.localeCompare(b.topicLabel, 'ro'));
    if (selectedTopic && !topics.has(selectedTopic)) selectedTopic = null;
    const visibleTopics = allTopics ? rows : rows.slice(0,3);
    put('analytics-topics', rows.length ? `<div class="statistics-topic-list">${visibleTopics.map(t => `<div class="statistics-topic"><button type="button" data-topic-select="${escape(t.key)}" aria-pressed="${t.key === selectedTopic}"><span>${escape(t.topicLabel)}${getFilters().chapterNum === null ? `<small>${escape(t.chapterName)}</small>` : ''}</span><strong>${number(t.count)} ${reviewMode === 'resolved' ? 'corectate' : 'grile'}</strong></button>${t.lessonUrl ? `<a class="analytics-topic-lesson" href="${escape(t.lessonUrl)}" aria-label="Revezi lecția: ${escape(t.topicLabel)}">Lecție ${arrow}</a>` : ''}</div>`).join('')}</div>${rows.length > 3 ? `<button class="statistics-text-action" type="button" data-all-topics>${allTopics ? 'Arată mai puține' : 'Vezi toate subiectele (' + rows.length + ')'}</button>` : ''}${selectedTopic ? '<button type="button" class="statistics-text-action" data-clear-topic>Toate subiectele</button>' : ''}` : '');
    const filtered = chosen.filter(item => !selectedTopic || topicKey(item) === selectedTopic);
    mistakePage = Math.min(mistakePage, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
    byId('analytics-mistakes-context').textContent = reviewMode === 'resolved' ? 'Greșeli corectate în aceeași parcurgere.' : reviewMode === 'all' ? 'Rezultatul inițial rămâne păstrat.' : 'Din parcurgerea curentă, după corectări.';
    put('analytics-mistakes', filtered.length ? `<ol class="statistics-mistake-list">${filtered.slice(mistakePage * pageSize, (mistakePage + 1) * pageSize).map(item => `<li><span class="statistics-question-number">${item.number}</span><div><strong>Grila ${item.number}</strong><span>${escape(item.topicLabel)}${getFilters().chapterNum === null ? ' · ' + escape(item.chapterName) : ''}</span></div><span class="statistics-result-tag ${item.resolved ? 'is-correct' : ''}">${item.resolved ? 'Corectată' : 'De corectat'}</span><a class="statistics-question-link" href="${escape(item.quizUrl)}#grila-${item.number}" aria-label="Revezi grila ${item.number}">${arrow}</a></li>`).join('')}</ol>` : `<div class="statistics-empty"><h3>${all.length ? 'Nicio grilă în această selecție.' : 'Nicio greșeală de afișat.'}</h3><p>${all.length ? 'Poți alege alt subiect sau alt filtru.' : 'Rezultatele apar pe măsură ce rezolvi capitolul. Corectarea începe după testul complet.'}</p></div>`);
    put('analytics-mistakes-pages', pagination(filtered.length, mistakePage, 'mistakes'));
  }
  function pagination(total, page, type) {
    if (total <= pageSize) return '';
    return `<button type="button" class="analytics-text-button" data-${type}-step="-1" aria-label="Pagina anterioară ${type === 'history' ? 'a istoricului' : 'a greșelilor'}" ${page === 0 ? 'disabled' : ''}>Înapoi</button><span>${page + 1} / ${Math.ceil(total / pageSize)}</span><button type="button" class="analytics-text-button" data-${type}-step="1" aria-label="Pagina următoare ${type === 'history' ? 'a istoricului' : 'a greșelilor'}" ${(page + 1) * pageSize >= total ? 'disabled' : ''}>Înainte</button>`;
  }
  function questionChips(run, ids, label) {
    const questions = new Map(index.find(q => q.chapterNum === run.chapterNum)?.questions.map(q => [q.id,q]) || []);
    const chips = ids.map(id => { const q = questions.get(id); return q ? `<a href="${escape(run.quizUrl)}#grila-${q.number}" aria-label="${escape(label)}: grila ${q.number}">${q.number}</a>` : ''; });
    return `<div class="statistics-question-chips">${chips.slice(0,10).join('')}</div>${chips.length > 10 ? `<details class="statistics-more-questions"><summary>Încă ${chips.length - 10} grile</summary><div class="statistics-question-chips">${chips.slice(10).join('')}</div></details>` : ''}`;
  }
  function runDetails(run) {
    const quiz = index.find(q => q.chapterNum === run.chapterNum);
    const wrongIds = Object.keys(run.answers).filter(id => run.answers[id].verified && !run.answers[id].correct);
    const topicCounts = new Map();
    wrongIds.forEach(id => { const q = quiz?.questions.find(item => item.id === id); const topic = quiz?.topics?.find(t => t.id === q?.topicId); if (topic) { if (!topicCounts.has(topic.id)) topicCounts.set(topic.id, {...topic,count:0}); topicCounts.get(topic.id).count++; } });
    const topics = [...topicCounts.values()].sort((a,b) => b.count - a.count);
    const correction = run.correction;
    const rounds = correction?.rounds || [];
    return `<div class="analytics-run-detail statistics-run-detail"><div class="statistics-run-breakdown"><section><h3>Rezultatul inițial</h3><p><strong>${pct(run.accuracy)} corecte</strong> · ${pct(run.verified ? run.wrong / run.verified * 100 : null)} greșite</p><p>${number(run.correct)} corecte · ${number(run.wrong)} greșite · ${number(run.total - run.verified)} nerezolvate</p>${wrongIds.length ? `<h4>Grile greșite inițial</h4>${questionChips(run, wrongIds, 'Greșită inițial')}` : '<p>Toate grilele verificate sunt corecte.</p>'}</section><section><h3>Unde ai greșit</h3>${topics.length ? `<ul class="statistics-run-topics">${topics.slice(0,3).map(t => `<li><a href="${escape(t.lessonUrl)}">${escape(t.label)}</a><span>${t.count} grile</span></li>`).join('')}</ul>${topics.length > 3 ? `<details class="statistics-more-questions"><summary>Vezi toate subiectele</summary><ul class="statistics-run-topics">${topics.slice(3).map(t => `<li><a href="${escape(t.lessonUrl)}">${escape(t.label)}</a><span>${t.count} grile</span></li>`).join('')}</ul></details>` : ''}` : '<p>Niciun subiect de revăzut.</p>'}</section></div><section class="statistics-rounds"><h3>Corectarea greșelilor</h3>${rounds.length ? `<p><strong>${number(correction.corrected)} din ${number(wrongIds.length)} greșeli corectate</strong> · ${number(correction.remaining)} rămase.</p><ol>${rounds.map(round => `<li class="analytics-correction-round"><span>Runda ${number(round.roundNumber || rounds.indexOf(round) + 1)}</span><strong>${number(round.correct)} din ${number(round.total)} corectate</strong><small>${round.verified < round.total ? 'În curs · ' + number(round.verified) + '/' + number(round.total) : number(round.wrong) + ' rămase greșite'}</small></li>`).join('')}</ol>${correction.remaining ? `<h4>Încă de corectat</h4>${questionChips(run, correction.remainingIds, 'Încă greșită')}` : '<p class="statistics-success">Toate corecte, în ' + number(correction.roundCount) + (correction.roundCount === 1 ? ' rundă de corectare.</p>' : ' runde de corectare.</p>')}` : `<p>${!run.initialComplete ? 'Disponibilă după ce verifici toate grilele capitolului.' : wrongIds.length ? 'Nu ai început corectarea acestei parcurgeri.' : 'Toate corecte din prima.'}</p>`}${correction?.canPractice ? primaryLink(rounds.length ? 'Continuă corectarea' : 'Corectează greșelile', practiceUrl(run)) : ''}</section>${run.startedAt ? `<p class="statistics-run-date">Începută pe ${escape(longDate.format(new Date(run.startedAt)))}</p>` : ''}</div>`;
  }
  function runRow(run) {
    const correction = run.correction, after = correction?.roundCount ? pct(correction.accuracy) : run.initialComplete && !run.wrong ? '100%' : '—';
    const state = run.isCurrent ? run.initialComplete ? correction?.remaining ? 'De corectat' : 'Toate corecte' : 'În curs' : run.initialComplete ? 'Încheiată' : 'Neterminată';
    return `<details class="analytics-run statistics-run" data-run-id="${escape(run.id)}"><summary><span class="statistics-run-name"><strong>${runTitle(run)}</strong><small>${getFilters().chapterNum === null ? escape(run.chapterName) + ' · ' : ''}${number(run.verified)} / ${number(run.total)} grile <span class="statistics-run-status">${state}</span></small></span><span class="statistics-run-score"><small>Inițial</small><strong data-run-initial>${pct(run.accuracy)}</strong></span><span class="statistics-run-score is-corrected"><small>După corectare</small><strong data-run-corrected>${after}</strong><small>${correction?.roundCount ? number(correction.roundCount) + (correction.roundCount === 1 ? ' rundă de corectare' : ' runde de corectare') : run.initialComplete && !run.wrong ? 'Din prima' : 'Neîncepută'}</small></span><span class="statistics-run-toggle" aria-hidden="true">+</span></summary>${runDetails(run)}</details>`;
  }
  function legacyResults() {
    const unknown = fullRuns(report).filter(run => !run.number), unlinked = report.runs.filter(run => run.mode === 'mistakes' && !run.sourceRunId);
    const old = report.legacyHistory || [], saved = getFilters().days === 'all' ? report.savedResults : [];
    if (!unknown.length && !unlinked.length && !old.length && !saved.length) return '';
    const groups = new Map();
    [...old,...saved].forEach(item => { if (!groups.has(item.chapterNum)) groups.set(item.chapterNum,{...item, items:[]}); groups.get(item.chapterNum).items.push(item); });
    return `<details class="analytics-legacy statistics-disclosure"><summary>Rezultate anterioare</summary><p>Rezultate păstrate înainte de numerotarea parcurgerilor. Nu le atribuim unei parcurgeri necunoscute.</p>${unknown.map(runRow).join('')}${unlinked.length ? `<p>${number(unlinked.length)} teste de greșeli anterioare, fără o parcurgere asociată.</p><div class="statistics-legacy-practice">${unlinked.map(run => `<p><strong>${escape(run.chapterName)}</strong> · ${number(run.correct)}/${number(run.verified)} corecte · ${pct(run.accuracy)}</p>`).join('')}</div>` : ''}${[...groups.values()].map(group => `<details class="statistics-legacy-chapter"><summary>${escape(group.chapterName)} · ${number(group.items.length)} rezultate</summary><p>${number(group.items.filter(e => e.correct).length)} corecte · ${number(group.items.filter(e => !e.correct).length)} greșite${group.items.some(e => !e.at) ? ' · Unele rezultate nu au dată.' : ''}</p>${questionChips({chapterNum:group.chapterNum,quizUrl:group.quizUrl},[...new Set(group.items.map(e => e.questionId))],'Rezultat anterior')}</details>`).join('')}</details>`;
  }
  function renderHistory() {
    const open = new Set([...byId('analytics-history').querySelectorAll('[data-run-id][open]')].map(el => el.dataset.runId));
    const runs = fullRuns(report).filter(run => run.number).sort((a,b) => a.chapterNum - b.chapterNum || a.number - b.number);
    historyPage = Math.min(historyPage, Math.max(0,Math.ceil(runs.length / pageSize) - 1));
    byId('analytics-history-count').textContent = runs.length ? `${number(runs.length)} ${runs.length === 1 ? 'parcurgere' : 'parcurgeri'} · rezultatul inițial și corectările, împreună` : 'Fiecare test complet și corectările lui.';
    put('analytics-history', (runs.length ? runs.slice(historyPage * pageSize,(historyPage + 1) * pageSize).map(runRow).join('') : `<div class="statistics-empty"><h3>Nicio parcurgere în perioada aleasă.</h3><p>${getFilters().days === 'all' ? 'Începe un capitol pentru a-ți păstra rezultatul inițial și corectările.' : 'Alege „Tot istoricul” pentru a vedea parcurgerile mai vechi.'}</p></div>`) + legacyResults());
    byId('analytics-history').querySelectorAll('[data-run-id]').forEach(el => { if (open.has(el.dataset.runId)) el.open = true; });
    put('analytics-history-pages', pagination(runs.length,historyPage,'history'));
    const t = report.summary;
    put('analytics-history-totals', `<p class="statistics-history-totals"><strong data-metric="attempts">${number(t.solved)}</strong> rezolvări înregistrate · <span data-metric="correct">${number(t.correct)}</span> corecte · <span data-metric="wrong">${number(t.solved - t.correct)}</span> greșite · <span data-metric="accuracy">${pct(t.accuracy)}</span> corecte.</p><p>Acest total include și rundele de corectare. Rezultatele inițiale sunt păstrate separat, mai sus.</p>`);
    byId('analytics-filter-status').textContent = getFilters().days === 'all' ? 'Tot istoricul' : 'Ultimele ' + getFilters().days + ' zile';
    const saved = report.savedResults.length;
    byId('analytics-saved-note').hidden = !saved;
    put('analytics-saved-note', saved ? `${number(saved)} grile au răspunsuri salvate fără dată. Sunt incluse în tot istoricul, fără puncte inventate în grafic.` : '');
    byId('analytics-tracking-note').textContent = report.trackingSince ? 'Istoric local înregistrat din ' + longDate.format(new Date(report.trackingSince)) + '. Reluarea testului nu șterge rezultatele.' : 'Istoricul datat se păstrează în acest browser.';
  }
  function renderVisibleCharts() {
    window.BBAnalyticsCharts.clear('analytics-accuracy'); window.BBAnalyticsCharts.clear('analytics-activity');
    if (activeTab() === 'rezumat') {
      const days = window.BBAnalyticsCharts.groupDays(report.daily).days;
      if (days.length > 1) { byId('accuracy-title').textContent = 'Evoluția rezultatelor'; chart('analytics-accuracy',report.daily,'accuracy',true); }
      else if (days.length === 1) { byId('accuracy-title').textContent = 'Rezultatul zilei'; const d = days[0]; put('analytics-accuracy', `<div class="analytics-day-result"><strong>${pct(d.accuracy)}</strong><div><span>${number(d.correct)} din ${number(d.attempts)} răspunsuri corecte</span><small>${escape(shortDate.format(dayDate(d.date)))}</small></div></div>`); }
      else { byId('accuracy-title').textContent = 'Evoluția rezultatelor'; put('analytics-accuracy', '<p class="statistics-empty-chart">Nicio rezolvare datată în această perioadă. Rezultatele salvate rămân în istoric.</p>'); }
    }
    if (activeTab() === 'istoric' && byId('analytics-activity-details').open) chart('analytics-activity',report.daily,'activity',true);
  }
  async function refresh() {
    const ownRequest = ++requestId, expectedOwner = reportOwner(); document.body.dataset.analyticsReady = 'false';
    if (lastOwner !== expectedOwner) {
      historyPage = 0; mistakePage = 0; selectedTopic = null; allTopics = false; reviewMode = 'unresolved';
      if (isReport) {
        byId('analytics-report-content').hidden = true; closeClear();
        byId('analytics-review-mode').value = reviewMode; byId('analytics-clear-status').textContent = '';
        byId('analytics-clear-confirm').disabled = false;
        document.querySelectorAll('.statistics-disclosure[open], .statistics-run[open]').forEach(node => { node.open = false; });
        window.BBAnalyticsCharts.clear('analytics-accuracy'); window.BBAnalyticsCharts.clear('analytics-activity');
      }
      report = null; lifetimeReport = null; lastOwner = expectedOwner;
    }
    try {
      const filters = getFilters();
      const [data,lifetime] = await Promise.all([analytics.getReport(filters),analytics.getReport({chapterNum:filters.chapterNum,days:'all'})]);
      if (ownRequest !== requestId || reportOwner() !== expectedOwner) return;
      report = data; lifetimeReport = lifetime;
      const note = byId('analytics-storage-note'); note.hidden = data.canPersist;
      note.textContent = 'Salvarea locală nu este disponibilă. Datele noi pot fi pierdute când închizi pagina.';
      if (!isReport) { renderCatalog(data,lifetime); return; }
      byId('analytics-chapter').value = filters.chapterNum === null ? 'all' : String(filters.chapterNum);
      byId('analytics-period').value = String(filters.days);
      renderSummary(); renderMistakes(); renderHistory(); byId('analytics-report-content').hidden = false; applyTabs();
    } catch {
      if (ownRequest !== requestId || reportOwner() !== expectedOwner) return;
      const note = byId('analytics-storage-note'); note.hidden = false;
      note.textContent = 'Statisticile nu au putut fi încărcate. Reîncarcă pagina pentru a încerca din nou. Grilele rămân disponibile din Testare.';
    } finally { if (ownRequest === requestId) document.body.dataset.analyticsReady = 'true'; }
  }
  if (isReport) {
    byId('analytics-chapter').insertAdjacentHTML('beforeend',index.map(q => `<option value="${q.chapterNum}">${escape(q.name)}</option>`).join(''));
    byId('analytics-chapter').addEventListener('change',setFilters); byId('analytics-period').addEventListener('change',setFilters);
    document.querySelector('.analytics-filters').addEventListener('submit',event => event.preventDefault());
    document.querySelector('.statistics-tabs').addEventListener('click',event => { const tab = event.target.closest('[data-analytics-tab]'); if (tab) navigateTab(tab.dataset.analyticsTab); });
    document.querySelector('.statistics-tabs').addEventListener('keydown',event => {
      const tabs = [...document.querySelectorAll('[data-analytics-tab]')], current = tabs.indexOf(event.target); let next = current;
      if (event.key === 'ArrowRight') next = (current + 1) % tabs.length; else if (event.key === 'ArrowLeft') next = (current + tabs.length - 1) % tabs.length; else if (event.key === 'Home') next = 0; else if (event.key === 'End') next = tabs.length - 1; else return;
      event.preventDefault(); navigateTab(tabs[next].dataset.analyticsTab,true);
    });
    byId('analytics-review-mode').addEventListener('change',event => { reviewMode = event.target.value; mistakePage = 0; renderMistakes(); });
    byId('main-content').addEventListener('click',event => {
      const open = event.target.closest('[data-open-tab]'); if (open) { navigateTab(open.dataset.openTab,true); return; }
      const topic = event.target.closest('[data-topic-select]');
      if (topic) { selectedTopic = selectedTopic === topic.dataset.topicSelect ? null : topic.dataset.topicSelect; mistakePage = 0; renderMistakes(); byId('analytics-topics').querySelector(`[data-topic-select="${CSS.escape(topic.dataset.topicSelect)}"]`)?.focus({preventScroll:true}); return; }
      if (event.target.closest('[data-clear-topic]')) { selectedTopic = null; mistakePage = 0; renderMistakes(); }
      if (event.target.closest('[data-all-topics]')) { allTopics = !allTopics; renderMistakes(); }
      const historyStep = event.target.closest('[data-history-step]'), mistakesStep = event.target.closest('[data-mistakes-step]');
      if (historyStep) { historyPage += Number(historyStep.dataset.historyStep); renderHistory(); byId('analytics-history').scrollIntoView({block:'start'}); }
      if (mistakesStep) { mistakePage += Number(mistakesStep.dataset.mistakesStep); renderMistakes(); byId('analytics-mistakes').scrollIntoView({block:'start'}); }
    });
    byId('analytics-activity-details').addEventListener('toggle',() => { if (report) renderVisibleCharts(); });
    window.addEventListener('popstate',() => { historyPage = 0; mistakePage = 0; selectedTopic = null; closeClear(); refresh(); });
    window.addEventListener('hashchange',applyTabs);
    byId('analytics-clear-start').addEventListener('click',() => {
      clearOwner = reportOwner();
      const chapter = index.find(q => q.chapterNum === getFilters().chapterNum);
      byId('analytics-clear-description').textContent = `Ștergi definitiv istoricul ${chapter ? 'pentru „' + chapter.name + '”' : 'pentru toate capitolele'}, inclusiv parcurgerile și corectările? Răspunsurile curente rămân salvate.`;
      byId('analytics-clear-confirmation').hidden = false; byId('analytics-clear-start').hidden = true; byId('analytics-clear-cancel').focus();
    });
    byId('analytics-clear-cancel').addEventListener('click',() => { closeClear(); byId('analytics-clear-start').focus(); });
    byId('analytics-clear-confirm').addEventListener('click',async () => {
      if (!clearOwner || clearOwner !== reportOwner() || byId('analytics-clear-confirmation').hidden) { closeClear(); return; }
      const expectedOwner = clearOwner, button = byId('analytics-clear-confirm'); button.disabled = true;
      try {
        await analytics.clearHistory(getFilters().chapterNum);
        if (reportOwner() !== expectedOwner) return;
        historyPage = 0; closeClear(); byId('analytics-clear-status').textContent = 'Istoricul a fost șters. Răspunsurile curente sunt păstrate.'; await refresh();
      } catch { if (reportOwner() === expectedOwner) byId('analytics-clear-status').textContent = 'Istoricul nu a putut fi șters. Încearcă din nou.'; }
      finally { if (reportOwner() === expectedOwner) button.disabled = false; }
    });
    applyTabs();
  } else document.querySelector('.testing-catalog-filter')?.addEventListener('click',event => {
    const button = event.target.closest('[data-catalog-filter]'); if (!button) return;
    catalogFilter = button.dataset.catalogFilter; applyCatalogFilter();
  });
  analytics.subscribe(refresh);
  window.addEventListener('pageshow',event => { if (event.persisted) refresh(); });
  refresh();
}());
