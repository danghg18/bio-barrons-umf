(function () {
  'use strict';

  function setupQuestionDemo() {
    const form = document.getElementById('pilot-demo-question');
    const question = window.BB_NERVOUS_QUIZ?.questions.find(item => item.id === 'sn-058');
    if (!form || !question) return;
    const legend = form.querySelector('legend');
    legend.textContent = question.prompt;
    const options = form.querySelector('.pilot-demo-options');
    question.options.forEach(option => {
      const label = document.createElement('label');
      label.className = 'pilot-demo-option';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'demo-answer';
      input.value = option.letter;
      const text = document.createElement('span');
      text.textContent = option.letter + '. ' + option.text;
      label.append(input, text);
      options.append(label);
    });
    const feedback = document.getElementById('pilot-demo-feedback');
    const check = document.getElementById('pilot-demo-check');
    let checked = false;
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (checked) {
        form.reset();
        options.querySelectorAll('label').forEach(label => { label.className = 'pilot-demo-option'; });
        options.querySelectorAll('input').forEach(input => { input.disabled = false; });
        feedback.hidden = true;
        check.textContent = 'Verifică';
        checked = false;
        return;
      }
      const selected = [...options.querySelectorAll('input:checked')].map(input => input.value);
      feedback.hidden = false;
      if (!selected.length) {
        feedback.textContent = 'Alege cel puțin un răspuns.';
        return;
      }
      const correct = selected.length === question.correct.length && selected.every(letter => question.correct.includes(letter));
      const explanations = [];
      options.querySelectorAll('input').forEach(input => {
        const isCorrect = question.correct.includes(input.value);
        input.closest('label').classList.add(isCorrect ? (input.checked ? 'is-correct' : 'is-missed') : input.checked ? 'is-extra' : 'is-neutral');
        if (input.checked && !isCorrect) {
          const explanation = question.options.find(option => option.letter === input.value)?.why;
          if (explanation) explanations.push(explanation);
        }
        input.disabled = true;
      });
      const answerList = new Intl.ListFormat('ro', {type:'conjunction'}).format(question.correct);
      feedback.textContent = correct ? 'Corect. Răspunsurile sunt ' + answerList + '.' : 'Răspunsurile corecte sunt ' + answerList + '. ' + explanations.join(' ');
      check.textContent = 'Încearcă din nou';
      checked = true;
    });
  }

  function setupLesson() {
    const topbar = document.querySelector('.lab-topbar-inner');
    const actions = topbar?.querySelector('.lab-topbar-actions');
    const nav = document.getElementById('sidenav');
    const settings = document.getElementById('bb-sidebar-settings');
    const panel = document.getElementById('bb-sidebar-settings-panel');
    if (!nav || !settings || !panel || !actions) return;
    actions.append(settings);
    const toggle = settings.querySelector('.bb-settings-toggle');
    toggle.setAttribute('aria-label', 'Setări de lectură');
    toggle.setAttribute('title', 'Setări de lectură');
    toggle.addEventListener('click', () => {
      if (nav.classList.contains('open')) window.closeNav?.();
    }, true);
    const control = document.createElement('div');
    control.className = 'pilot-reading-control';
    control.innerHTML = '<span id="pilot-reading-label">Mărimea textului</span><div class="pilot-size-options" role="group" aria-labelledby="pilot-reading-label"><button type="button" data-reading-size="small" aria-label="Text mic">A−</button><button type="button" data-reading-size="normal" aria-label="Text normal">A</button><button type="button" data-reading-size="large" aria-label="Text mare">A+</button></div>';
    panel.prepend(control);
    function setSize(value) {
      if (!['small', 'normal', 'large'].includes(value)) value = 'normal';
      document.body.dataset.readingSize = value;
      control.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.readingSize === value)));
      try { localStorage.setItem('bb.reading.size.v1', value); } catch { /* Reading remains usable without storage. */ }
    }
    let savedSize = 'normal';
    try { savedSize = localStorage.getItem('bb.reading.size.v1'); } catch { /* Private browsing. */ }
    setSize(savedSize);
    control.addEventListener('click', event => {
      const button = event.target.closest('[data-reading-size]');
      if (button) setSize(button.dataset.readingSize);
    });
    document.addEventListener('click', event => {
      if (!panel.hidden && !settings.contains(event.target)) toggle.click();
    });
    const groups = [];
    // Legacy chapters own their anchor list. Reposition it rather than generating a second one.
    const legacyContents = nav.querySelector('#sub-nav');
    if (legacyContents) {
      legacyContents.classList.add('bm-legacy-subtopics');
      const label = nav.querySelector('#sub-nav-label');
      if (label) label.hidden = true;
      legacyContents.addEventListener('click', event => {
        const link = event.target.closest('a[href^="#"]');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const target = document.getElementById(link.hash.slice(1));
        if (matchMedia('(max-width:1024px)').matches) window.closeNav?.();
        if (target) {
          target.tabIndex = -1;
          target.focus({preventScroll:true});
        }
      });
    }
    const routeLinks = Array.from(nav.querySelectorAll(':scope > a[href^="#"], :scope > .nav-group > a[href^="#"]'));
    routeLinks.filter(() => !legacyContents && !document.body.classList.contains('bm-quiz')).forEach(link => {
      const route = decodeURIComponent(link.hash.slice(1));
      const section = document.getElementById('page-' + route);
      if (!section) return;
      const list = document.createElement('div');
      list.className = 'pilot-subtopics';
      list.setAttribute('aria-label', 'Subiecte: ' + link.textContent.trim());
      const headings = Array.from(section.querySelectorAll('h2.section, .sec-head > h2'));
      if (!headings.length) return;
      headings.forEach(heading => {
        const button = document.createElement('button');
        button.type = 'button';
        // Read authored headings without adding or changing educational prose.
        const copy = heading.cloneNode(true);
        copy.querySelector('.sec-num')?.remove();
        button.textContent = copy.textContent.trim();
        heading.tabIndex = -1;
        button.addEventListener('click', () => {
          if (matchMedia('(max-width:1024px)').matches) window.closeNav?.();
          const top = scrollY + heading.getBoundingClientRect().top - 92;
          window.scrollTo({top, behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'});
          heading.focus({preventScroll:true});
        });
        list.append(button);
      });
      link.after(list);
      groups.push({section, list, headings});
    });
    function updateContents() {
      if (legacyContents) {
        const active = document.querySelector('.page-section.active');
        const link = routeLinks.find(item => item.hash.slice(1) === active?.id.replace(/^page-/, ''));
        if (link) link.after(legacyContents);
        legacyContents.hidden = !legacyContents.children.length;
        const links = Array.from(legacyContents.querySelectorAll('a[href^="#"]'));
        let current = 0;
        links.forEach((item,index) => {
          const target = document.getElementById(item.hash.slice(1));
          if (target && target.getBoundingClientRect().top <= 150) current = index;
        });
        links.forEach((item,index) => {
          if (index === current) item.setAttribute('aria-current', 'location');
          else item.removeAttribute('aria-current');
        });
      }
      groups.forEach(({section,list,headings}) => {
        const active = section.classList.contains('active');
        list.hidden = !active;
        if (!active) return;
        let current = 0;
        headings.forEach((heading,index) => {if(heading.getBoundingClientRect().top <= 150) current=index;});
        Array.from(list.children).forEach((button,index) => {
          if(index===current) button.setAttribute('aria-current','location');
          else button.removeAttribute('aria-current');
        });
      });
    }
    let frame;
    window.addEventListener('scroll', () => {
      if(frame) return;
      frame = requestAnimationFrame(() => {frame=0;updateContents();});
    }, {passive:true});
    document.addEventListener('bb:lesson-section-change', updateContents);
    updateContents();
  }

  function init() {
    if (document.body.classList.contains('bm-home')) {
      setupQuestionDemo();
    }
    if (document.body.classList.contains('bm-reader')) setupLesson();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
