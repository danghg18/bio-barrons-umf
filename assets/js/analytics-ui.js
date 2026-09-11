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

  function chart(id, days, kind, compact) {
    const isAccuracy = kind === 'accuracy';
    const hasData = days.some(day => day.attempts > 0);
    const width = Math.max(560, days.length * 11);
    const height = compact ? 180 : 220;
    const left = 48, right = 14, top = 16, bottom = 32;
    const innerWidth = width - left - right;
    const innerHeight = height - top - bottom;
    const max = isAccuracy ? 100 : Math.max(4, Math.ceil(Math.max(0, ...days.map(day => day.attempts)) / 4) * 4);
    const step = innerWidth / Math.max(1, days.length);
    const x = i => left + step * (i + .5);
    const y = n => top + innerHeight * (1 - n / max);
    const longSeries = days.length > 60;
    const description = isAccuracy ? 'Corectitudinea răspunsurilor, pe zile' : 'Numărul de încercări verificate, pe zile';
    let svg = `<svg class="analytics-chart${longSeries ? ' is-long' : ''}" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${id}-title ${id}-description"><title id="${id}-title">${description}</title><desc id="${id}-description">${hasData ? 'Valorile sunt disponibile și în tabelul de sub grafic.' : 'Nu există încercări în această perioadă.'}</desc>`;
    for (let tick = 0; tick <= 4; tick++) {
      const value = max * tick / 4;
      svg += `<line class="chart-gridline" x1="${left}" x2="${width-right}" y1="${y(value)}" y2="${y(value)}"/><text class="chart-axis" x="${left-9}" y="${y(value)+4}" text-anchor="end">${number(value)}${isAccuracy ? '%' : ''}</text>`;
    }
    if (isAccuracy) {
      let points = [];
      function flush() {
        if (points.length > 1) svg += `<polyline class="chart-line" points="${points.join(' ')}"/>`;
        points = [];
      }
      days.forEach((day, i) => {
        if (day.attempts && Number.isFinite(day.accuracy)) points.push(`${x(i)},${y(day.accuracy)}`);
        else flush();
      });
      flush();
    }
    days.forEach((day, i) => {
      const label = `${longDate.format(dayDate(day.date))}: ${number(day.attempts)} încercări, ${number(day.correct)} corecte${day.attempts ? ', ' + pct(day.accuracy) : ''}`;
      if (day.attempts) {
        svg += `<g class="chart-point" tabindex="0" role="img" aria-label="${escape(label)}" data-chart-point="${escape(label)}" data-chart-output="${id}-readout"><title>${escape(label)}</title>`;
        if (isAccuracy && Number.isFinite(day.accuracy)) svg += `<circle class="chart-dot" cx="${x(i)}" cy="${y(day.accuracy)}" r="4.5"/>`;
        else if (!isAccuracy) svg += `<rect class="chart-bar" x="${x(i)-step*.33}" y="${y(day.attempts)}" width="${step*.66}" height="${innerHeight-(y(day.attempts)-top)}" rx="2"/>`;
        svg += '</g>';
      }
      if (i === 0 || i === days.length-1 || (i % Math.max(1, Math.ceil(days.length / 4)) === 0 && i < days.length-3)) svg += `<text class="chart-axis" x="${x(i)}" y="${height-9}" text-anchor="${i===0?'start':i===days.length-1?'end':'middle'}">${escape(shortDate.format(dayDate(day.date)))}</text>`;
    });
    svg += '</svg>';
    const table = `<details class="chart-data"><summary>Datele graficului<span aria-hidden="true"> +</span></summary><div class="analytics-table-scroll" role="region" aria-label="${description}" tabindex="0"><table><caption class="analytics-sr-only">${description}</caption><thead><tr><th scope="col">Data</th><th scope="col">Încercări</th><th scope="col">Corecte</th><th scope="col">Corectitudine</th></tr></thead><tbody>${days.map(day=>`<tr><th scope="row">${escape(longDate.format(dayDate(day.date)))}</th><td>${number(day.attempts)}</td><td>${number(day.correct)}</td><td>${pct(day.accuracy)}</td></tr>`).join('')}</tbody></table></div></details>`;
    put(id, `<div class="chart-stage"><div class="chart-scroll">${svg}</div>${hasData ? '' : '<div class="chart-empty"><strong>Progresul începe cu o grilă.</strong><span>Prima verificare va apărea aici.</span></div>'}</div>${hasData ? `<p class="chart-readout" id="${id}-readout" aria-live="polite">${isAccuracy ? 'Zilele fără încercări nu au un procent de corectitudine.' : 'Explorează barele pentru detalii despre fiecare zi.'}</p>` : ''}${table}`);
  }

  function currentProgress(current) {
    const value = current.total ? Math.round(current.verified / current.total * 100) : 0;
    return `<span class="analytics-progress-label"><strong>${number(current.verified)}</strong> / ${number(current.total)} verificate</span><progress class="analytics-progress" value="${current.verified}" max="${current.total || 1}" aria-label="Progres actual: ${value}%">${value}%</progress>`;
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
        return `<div class="testing-chapter-row"><a class="lab-item lab-item-done" id="testing-quiz-${chapter.num}" data-chapter="${chapter.num}" href="${escape(quiz.url)}">${content}<span class="testing-start">Rezolvă <span aria-hidden="true">↗</span></span></a><div class="testing-row-progress">${currentProgress(quiz.current)}</div><div class="testing-row-first"><strong>${pct(quiz.firstAccuracy)}</strong><span>Prima încercare${quiz.firstAttempts ? ' · ' + number(quiz.firstAttempts) + ' grile' : ' · fără date'}</span></div><a class="testing-stats-link" id="testing-stats-${chapter.num}" href="statistici.html?capitol=${chapter.num}" aria-label="Statistici: ${escape(chapter.name)}">Statistici <span aria-hidden="true">→</span></a></div>`;
      }).join('');
      return `<section class="testing-category" aria-labelledby="testing-category-${groupNumber}"><div class="testing-category-head"><span>${String(groupNumber).padStart(2,'0')}</span><h3 id="testing-category-${groupNumber}">${escape(category)}</h3></div>${rows}</section>`;
    }).join('');
    const catalog = document.querySelector('#lab-testing-catalog .lab-bento-grid');
    if (catalog) { catalog.id = 'testing-categories'; put('testing-categories', html); }
    put('testing-preview-summary', `<strong>${number(data.totals.attempts)}</strong><span>încercări în ultimele 30 de zile<br><b>${number(data.totals.distinct)}</b> grile distincte parcurse</span>`);
    chart('testing-activity', data.daily, 'activity', true);
    byId('lab-testing-count').textContent = index.length + ' capitole disponibile';
  }

  function renderMetrics(data) {
    const total = data.totals;
    const metrics = [
      ['distinct', number(total.distinct), 'Grile parcurse', 'Întrebări distincte în perioada aleasă'],
      ['attempts', number(total.attempts), 'Încercări', 'Include verificările după reluare'],
      ['firstAccuracy', pct(total.firstAccuracy), 'Prima încercare', `${number(total.firstCorrect)} corecte din ${number(total.firstAttempts)} grile cu prima încercare cunoscută`],
      ['accuracy', pct(total.accuracy), 'Corectitudine generală', `${number(total.correct)} corecte din ${number(total.attempts)} încercări`]
    ];
    put('analytics-metrics', metrics.map(([key,value,label,note]) => `<div class="analytics-metric"><span>${label}</span><strong data-metric="${key}">${value}</strong><p>${note}</p></div>`).join(''));
  }

  function renderComparison(data) {
    put('analytics-comparison', `<div class="analytics-table-scroll" role="region" aria-label="Comparația capitolelor" tabindex="0"><table class="analytics-comparison-table"><caption class="analytics-sr-only">Progres actual și rezultatele capitolelor în perioada selectată</caption><thead><tr><th scope="col">Capitol</th><th scope="col">Progres actual</th><th scope="col">Prima încercare</th><th scope="col">Rezultate în perioadă</th><th scope="col"><span class="analytics-sr-only">Acțiune</span></th></tr></thead><tbody>${data.quizzes.map(quiz => `<tr><th scope="row"><span class="analytics-chapter-number">${String(quiz.chapterNum).padStart(2,'0')}</span><a href="statistici.html?capitol=${quiz.chapterNum}&perioada=${getFilters().days}">${escape(quiz.name)}</a></th><td>${currentProgress(quiz.current)}<small>${number(quiz.current.correct)} corecte în răspunsurile salvate</small></td><td><strong>${pct(quiz.firstAccuracy)}</strong><small>${number(quiz.firstAttempts)} grile cu prima încercare cunoscută</small></td><td><strong>${pct(quiz.accuracy)}</strong><small>${number(quiz.correct)} corecte / ${number(quiz.attempts)} încercări</small></td><td><a class="analytics-row-link" href="${escape(quiz.url)}" aria-label="Rezolvă: ${escape(quiz.name)}">Rezolvă ↗</a></td></tr>`).join('')}</tbody></table></div>`);
  }

  function renderMistakes(data) {
    if (!data.mistakes.length) {
      put('analytics-mistakes', `<div class="analytics-empty"><span aria-hidden="true">${data.totals.attempts ? '✓' : '·'}</span><div><strong>${data.totals.attempts ? 'Nicio greșeală în perioada aleasă.' : 'Întrebările de revizuit vor apărea aici.'}</strong><p>${data.totals.attempts ? 'Poți continua cu întrebările rămase.' : 'După ce rezolvi grile, vei vedea ce merită repetat.'}</p></div></div>`);
      return;
    }
    put('analytics-mistakes', `<ol class="analytics-review-list">${data.mistakes.map(item=>`<li><span class="analytics-review-number">${item.number}</span><div><strong>Grila ${item.number}</strong><span>${escape(item.chapterName)}</span></div><p><strong>${number(item.wrong)} ${item.wrong===1?'greșeală':'greșeli'}</strong><span>din ${number(item.attempts)} încercări</span></p><a href="${escape(item.quizUrl)}#grila-${item.number}" aria-label="Revezi grila ${item.number}: ${escape(item.chapterName)}">Revezi <span aria-hidden="true">↗</span></a></li>`).join('')}</ol>`);
  }

  function renderHistory() {
    const total = report.history.length;
    const pageCount = Math.max(1, Math.ceil(total / 20));
    historyPage = Math.min(historyPage, pageCount-1);
    byId('analytics-history-count').textContent = number(total) + ' încercări';
    if (!total) {
      put('analytics-history', '<div class="analytics-empty"><span aria-hidden="true">↗</span><div><strong>Nicio încercare în perioada aleasă.</strong><p>Verifică un răspuns pentru a începe istoricul rezultatelor.</p></div><a href="testare.html#lab-testing-catalog">Alege un capitol →</a></div>');
      put('analytics-history-pages', '');
      return;
    }
    put('analytics-history', `<div class="analytics-table-scroll" role="region" aria-label="Istoricul verificărilor" tabindex="0"><table><caption class="analytics-sr-only">Încercări recente, pagina ${historyPage+1}</caption><thead><tr><th scope="col">Data verificării</th><th scope="col">Capitol</th><th scope="col">Grilă</th><th scope="col">Rezultat</th></tr></thead><tbody>${report.history.slice(historyPage*20, historyPage*20+20).map(item=>`<tr><td><time datetime="${escape(item.at)}">${escape(dateTime.format(new Date(item.at)))}</time></td><th scope="row">${escape(item.chapterName)}</th><td><a class="analytics-row-link" href="${escape(item.quizUrl)}#grila-${item.number}">Grila ${item.number} ↗</a></td><td><span class="analytics-result ${item.correct?'is-correct':'is-wrong'}">${item.correct?'✓ Corectă':'× Greșită'}</span></td></tr>`).join('')}</tbody></table></div>`);
    put('analytics-history-pages', `<button id="history-prev" type="button" class="analytics-text-button" data-history-step="-1" aria-label="Pagina anterioară a istoricului" ${historyPage===0?'disabled':''}>← Înapoi</button><span role="status">Pagina ${historyPage+1} din ${pageCount}</span><button id="history-next" type="button" class="analytics-text-button" data-history-step="1" aria-label="Pagina următoare a istoricului" ${historyPage===pageCount-1?'disabled':''}>Înainte →</button>`);
  }

  function getFilters() {
    if (!isReport) return {chapterNum:null, days:30};
    const params = new URLSearchParams(location.search);
    const chapterNum = Number(params.get('capitol'));
    const days = params.get('perioada') || '30';
    return {chapterNum:index.some(quiz=>quiz.chapterNum===chapterNum)?chapterNum:null, days:days==='all'?'all':days==='7'?7:30};
  }

  function syncFilters() {
    const filters = getFilters();
    byId('analytics-chapter').value = filters.chapterNum === null ? 'all' : String(filters.chapterNum);
    byId('analytics-period').value = String(filters.days);
    return filters;
  }

  function setFilters() {
    const url = new URL(location.href);
    const chapter = byId('analytics-chapter').value;
    if (chapter === 'all') url.searchParams.delete('capitol');
    else url.searchParams.set('capitol', chapter);
    url.searchParams.set('perioada', byId('analytics-period').value);
    history.pushState(null, '', url);
    historyPage = 0;
    closeClear();
    refresh();
  }

  function closeClear() {
    if (!isReport) return;
    byId('analytics-clear-confirmation').hidden = true;
    byId('analytics-clear-start').hidden = false;
  }

  async function refresh() {
    const ownRequest = ++requestId;
    document.body.dataset.analyticsReady = 'false';
    try {
      const filters = isReport ? syncFilters() : getFilters();
      const [data, lifetime] = await Promise.all([
        analytics.getReport(filters),
        isReport ? Promise.resolve(null) : analytics.getReport({chapterNum:null, days:'all'})
      ]);
      if (ownRequest !== requestId) return;
      report = data;
      const note = byId('analytics-storage-note');
      note.hidden = data.canPersist;
      note.textContent = 'Salvarea locală nu este disponibilă. Poți continua să exersezi, dar datele noi pot fi pierdute când închizi pagina.';
      if (isReport) {
        renderMetrics(data);
        chart('analytics-activity', data.daily, 'activity', false);
        chart('analytics-accuracy', data.daily, 'accuracy', false);
        renderComparison(data);
        renderMistakes(data);
        renderHistory();
        byId('analytics-filter-status').textContent = `${number(data.totals.attempts)} încercări · ${filters.days==='all'?'tot istoricul':'ultimele '+filters.days+' zile'}`;
        byId('analytics-tracking-note').textContent = data.trackingSince ? 'Istoricul este urmărit din ' + longDate.format(new Date(data.trackingSince)) + '. Datele rămân pe acest dispozitiv, în browserul folosit.' : 'Istoricul începe cu primele verificări înregistrate. Datele rămân pe acest dispozitiv, în browserul folosit.';
      } else renderCatalog(data, lifetime);
    } catch {
      const note = byId('analytics-storage-note');
      note.hidden = false;
      note.textContent = 'Statisticile nu au putut fi încărcate. Reîncarcă pagina pentru a încerca din nou. Grilele rămân disponibile din Testare.';
    } finally {
      if (ownRequest === requestId) document.body.dataset.analyticsReady = 'true';
    }
  }

  document.addEventListener('focusin', showPoint);
  document.addEventListener('pointerover', showPoint);
  function showPoint(event) {
    const point = event.target.closest('[data-chart-point]');
    if (point) byId(point.dataset.chartOutput).textContent = point.dataset.chartPoint;
  }

  if (isReport) {
    byId('analytics-chapter').insertAdjacentHTML('beforeend', index.map(quiz=>`<option value="${quiz.chapterNum}">${escape(quiz.name)}</option>`).join(''));
    byId('analytics-chapter').addEventListener('change', setFilters);
    byId('analytics-period').addEventListener('change', setFilters);
    document.querySelector('.analytics-filters').addEventListener('submit', event=>event.preventDefault());
    window.addEventListener('popstate', ()=>{historyPage=0;closeClear();refresh();});
    byId('analytics-history-pages').addEventListener('click', event=>{
      const button = event.target.closest('[data-history-step]');
      if (!button) return;
      historyPage += Number(button.dataset.historyStep);
      renderHistory();
      byId('analytics-history-pages').querySelector('button:not(:disabled)')?.focus({preventScroll:true});
    });
    byId('analytics-clear-start').addEventListener('click', ()=>{
      const chapter = getFilters().chapterNum;
      const title = index.find(quiz=>quiz.chapterNum===chapter)?.name;
      byId('analytics-clear-description').textContent = `Ștergi definitiv întregul istoric ${title?'pentru „'+title+'”':'pentru toate capitolele'}, inclusiv încercările din afara perioadei selectate? Răspunsurile curente rămân salvate.`;
      byId('analytics-clear-confirmation').hidden = false;
      byId('analytics-clear-start').hidden = true;
      byId('analytics-clear-cancel').focus();
    });
    byId('analytics-clear-cancel').addEventListener('click', ()=>{closeClear();byId('analytics-clear-start').focus();});
    byId('analytics-clear-confirm').addEventListener('click', async ()=>{
      const button = byId('analytics-clear-confirm');
      button.disabled = true;
      try {
        await analytics.clearHistory(getFilters().chapterNum);
        historyPage = 0;
        closeClear();
        byId('analytics-clear-start').focus();
        byId('analytics-clear-status').textContent = 'Istoricul selectat a fost șters. Răspunsurile curente au fost păstrate.';
        await refresh();
      } catch { byId('analytics-clear-status').textContent = 'Istoricul nu a putut fi șters. Încearcă din nou.'; }
      finally { button.disabled = false; }
    });
  }
  analytics.subscribe(refresh);
  window.addEventListener('pageshow', event=>{if(event.persisted)refresh();});
  refresh();
}());
