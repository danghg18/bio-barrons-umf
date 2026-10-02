(function () {
  'use strict';
  const data = window.BIOMED_HOME_DATA;
  const question = data.question;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const captions = ['Înțelegi în context.', 'Îți verifici înțelegerea.', 'Transformi greșeala în înțelegere.'];
  let activeStep = 0;
  let storyTrigger = null;
  let storyTimeline = null;

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
  }

  $$('[data-chapter-count]').forEach(element => { element.textContent = data.chapters.length; });
  $$('[data-question-prompt]').forEach(element => { element.textContent = question.prompt; });
  question.options.forEach(option => {
    const row = node('div', 'illustrative-option' + (['B', 'C'].includes(option.letter) ? ' is-selected' : ''));
    row.append(node('span', '', option.letter), node('span', '', option.text));
    $('#story-options').append(row);
  });
  const example = question.options.find(option => option.letter === 'E');
  $('#story-answer-text').textContent = example.text;
  $('#story-answer-why').textContent = example.why;

  const scenes = $$('[data-scene]');
  const stepButtons = $$('[data-step]');
  const progressTrack = $('.scene-progress');
  const progressFill = progressTrack.querySelector('span');
  function updateStoryProgress(progress) {
    progressFill.style.transform = `scaleX(${progress})`;
    const value = String(Math.round(progress * 100));
    if (progressTrack.getAttribute('aria-valuenow') !== value) progressTrack.setAttribute('aria-valuenow', value);
  }
  function updateStep(index, allVisible = false) {
    activeStep = index;
    stepButtons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
    });
    scenes.forEach((scene, i) => {
      scene.inert = !allVisible && i !== index;
      scene.setAttribute('aria-hidden', String(!allVisible && i !== index));
    });
    $$('[data-screen-tab]').forEach((tab, i) => tab.classList.toggle('is-active', i === index));
    $('#scene-caption').textContent = captions[index];
    if (!document.body.classList.contains('scroll-story')) updateStoryProgress((index + 1) / 3);
  }

  function showStep(index, instant = false) {
    const old = activeStep;
    updateStep(index, motionPreference.matches);
    if (motionPreference.matches) return;
    if (window.gsap && !instant) {
      gsap.to(scenes.filter((_, i) => i !== index), {autoAlpha: 0, y: -10, duration: .17, overwrite: true});
      gsap.fromTo(scenes[index], {autoAlpha: old === index ? 1 : 0, y: old === index ? 0 : 12}, {autoAlpha: 1, y: 0, duration: .32, ease: 'power3.out', overwrite: true});
    } else {
      scenes.forEach((scene, i) => {
        scene.style.visibility = i === index ? 'visible' : 'hidden';
        scene.style.opacity = i === index ? '1' : '0';
        scene.style.transform = 'none';
      });
    }
  }

  function goToStep(index) {
    if (storyTrigger) {
      const positions = [.12, .50, .86];
      window.scrollTo({top: storyTrigger.start + (storyTrigger.end - storyTrigger.start) * positions[index], behavior: motionPreference.matches ? 'instant' : 'smooth'});
    } else showStep(index);
  }
  stepButtons.forEach((button, index) => {
    button.addEventListener('click', () => goToStep(index));
    button.addEventListener('keydown', event => {
      const key = event.key;
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(key)) return;
      event.preventDefault();
      const next = key === 'Home' ? 0 : key === 'End' ? 2 : (index + (['ArrowDown', 'ArrowRight'].includes(key) ? 1 : 2)) % 3;
      stepButtons[next].focus();
      goToStep(next);
    });
  });
  $$('[data-story-select]').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    goToStep(Number(link.dataset.storySelect));
    if (!storyTrigger) $('#method').scrollIntoView({behavior: motionPreference.matches ? 'instant' : 'smooth'});
  }));

  const form = $('#demo-quiz');
  const optionRows = new Map();
  question.options.forEach(option => {
    const label = node('label', 'quiz-option');
    const input = node('input');
    input.type = 'checkbox'; input.name = 'answer'; input.value = option.letter;
    input.setAttribute('aria-describedby', 'quiz-instruction');
    const text = node('span', 'option-copy', option.text);
    label.append(input, node('span', 'option-letter', option.letter), text);
    $('#quiz-options').append(label);
    optionRows.set(option.letter, {label, input, text});
  });
  function getSelected() { return [...optionRows].filter(([, row]) => row.input.checked).map(([letter]) => letter); }
  form.addEventListener('change', () => {
    const count = getSelected().length;
    $('#selected-count').textContent = count === 1 ? '1 selectată' : `${count} selectate`;
    $('#quiz-error').hidden = true;
  });

  const bar = $('.result-tabs');
  const pill = bar.querySelector('.t-tabs-pill');
  const explanationTabs = question.options.map(option => {
    const button = node('button', 't-tab', option.letter);
    button.type = 'button'; button.role = 'tab'; button.id = `answer-tab-${option.letter}`;
    button.setAttribute('aria-controls', 'result-explanation');
    button.setAttribute('aria-label', `Varianta ${option.letter}`);
    button.setAttribute('aria-selected', 'false'); button.tabIndex = -1;
    bar.append(button); return button;
  });
  function moveTo(tab, animate) {
    if (!animate) {
      const prev = pill.style.transition;
      pill.style.transition = 'none';
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
      void pill.offsetWidth;
      pill.style.transition = prev;
    } else {
      pill.style.transform = `translateX(${tab.offsetLeft}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
    }
  }
  let activeAnswer = 'A';
  function explain(letter, animate = true) {
    activeAnswer = letter;
    const option = question.options.find(o => o.letter === letter);
    const target = explanationTabs.find(tab => tab.textContent === letter);
    explanationTabs.forEach(tab => {
      const selected = tab === target;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    });
    const panel = $('#result-explanation');
    panel.setAttribute('aria-labelledby', target.id);
    panel.replaceChildren(node('h4', '', option.text), node('span', 'result-status ' + (question.correct.includes(letter) ? 'correct' : 'incorrect'), question.correct.includes(letter) ? 'Variantă corectă' : 'Variantă greșită'), node('p', '', option.why));
    moveTo(target, animate);
  }
  explanationTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => explain(question.options[index].letter));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 4 : (index + (event.key === 'ArrowRight' ? 1 : 4)) % 5;
      explanationTabs[next].focus(); explain(question.options[next].letter);
    });
  });
  window.addEventListener('resize', () => {
    if (!$('#quiz-result').hidden) moveTo(explanationTabs.find(tab => tab.textContent === activeAnswer), false);
  });
  let checked = false;
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (checked) return;
    const selected = getSelected();
    if (!selected.length) { $('#quiz-error').hidden = false; optionRows.get('A').input.focus(); return; }
    checked = true;
    const result = window.BioMedHomeQuiz.score(selected, question.correct);
    const messages = {correct: 'Corect ales', missed: 'Corect, dar omis', extra: 'Selectat în plus'};
    optionRows.forEach((row, letter) => {
      row.input.disabled = true;
      const status = result.states[letter];
      if (status !== 'neutral') {
        row.label.classList.add('is-' + status);
        row.text.append(node('span', 'option-feedback', messages[status]));
      }
    });
    $('.quiz-footer').hidden = true;
    $('#quiz-error').hidden = true;
    $('#quiz-result').hidden = false;
    $('#result-label').textContent = 'Răspuns verificat';
    $('#result-title').textContent = result.exact ? 'Exact. Ai făcut legătura.' : 'Hai să lămurim răspunsul.';
    $('#result-summary').textContent = `Ai ales ${selected.join(', ')}. Răspunsul corect: ${question.correct.join(', ')}.`;
    const firstIssue = question.options.find(o => ['missed', 'extra'].includes(result.states[o.letter]));
    explain(firstIssue ? firstIssue.letter : question.correct[0], false);
    $('#result-title').focus({preventScroll: true});
    $('#quiz-result').scrollIntoView({behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'nearest'});
    if (window.gsap && !motionPreference.matches) gsap.fromTo($('#quiz-result'), {y: 8, opacity: .45}, {y: 0, opacity: 1, duration: .28, ease: 'power3.out'});
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
  $('#retry').addEventListener('click', () => {
    checked = false; form.reset();
    optionRows.forEach(row => { row.input.disabled = false; row.label.className = 'quiz-option'; row.text.querySelector('.option-feedback')?.remove(); });
    $('#quiz-result').hidden = true; $('.quiz-footer').hidden = false;
    $('#selected-count').textContent = '0 selectate';
    optionRows.get('A').input.focus({preventScroll: true});
    form.scrollIntoView({behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'nearest'});
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });

  $$('.t-acc').forEach(acc => {
    const head = acc.querySelector('.t-acc-head');
    const panel = acc.querySelector('.t-acc-panel');
    head.addEventListener('click', () => {
      const open = acc.getAttribute('data-open') === 'true';
      acc.setAttribute('data-open', String(!open));
      head.setAttribute('aria-expanded', String(!open));
      panel.inert = open;
    });
  });

  document.body.classList.add('js-ready');
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({phones: '(min-width:1180px) and (min-height:900px)', desktop: '(min-width:980px) and (min-height:700px)', compact: '(min-width:641px) and (min-height:560px)', mobile: '(max-width:640px), (max-height:559px)', reduce: '(prefers-reduced-motion:reduce)'}, context => {
      const {phones, desktop, compact, reduce} = context.conditions;
      storyTrigger = null; storyTimeline = null;
      if (reduce) {
        scenes.forEach(scene => { scene.style.removeProperty('opacity'); scene.style.removeProperty('visibility'); scene.style.removeProperty('transform'); });
        updateStep(0, true);
        return;
      }
      gsap.set(scenes, {autoAlpha: 0, y: 0});
      gsap.set(scenes[0], {autoAlpha: 1});
      updateStep(0);
      gsap.from('.hero-copy > *', {y: 30, opacity: 0, duration: .8, stagger: .09, ease: 'power2.out'});
      $$('.ambient').forEach((blob, index) => {
        const float = gsap.fromTo(blob, {y: -10}, {y: 10, duration: 3, delay: index % 2 * .6, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true});
        ScrollTrigger.create({trigger: blob.parentElement, start: 'top bottom', end: 'bottom top', onToggle: self => self.isActive ? float.play() : float.pause(), onRefresh: self => self.isActive ? float.play() : float.pause()});
      });
      $$('.situations .section-heading, .scenario, .try-intro, .quiz-surface, .included, .pricing-intro, .plan, .testimonials .section-heading, .diary-note, .faq, .closing > :not(.ambient)').forEach(element => {
        gsap.from(element, {y: 30, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: {trigger: element, start: 'top 94%', once: true}});
      });
      if (desktop || compact) {
        document.body.classList.add('scroll-story');
        document.body.classList.toggle('story-compact', !desktop);
        document.body.classList.toggle('phone-story', phones);
        // Keep the heading, steps and preview together throughout all three
        // scenes. Only the child preview animates inside the pinned section.
        const motionTarget = '.product-wrap';
        gsap.set(motionTarget, {scale: .96, y: 10});
        storyTimeline = gsap.timeline({defaults: {ease: 'none'},
          onUpdate() { const progress = this.progress(); updateStoryProgress(progress); const index = progress < .34 ? 0 : progress < .68 ? 1 : 2; if (index !== activeStep) updateStep(index); },
          scrollTrigger: {
            id: 'biomed-story', trigger: '.method-layout', start: desktop ? 'top 32px' : 'top 24px', end: () => '+=' + Math.round(innerHeight * 5.4), pin: true, scrub: .45, anticipatePin: 1, invalidateOnRefresh: true,
            onToggle: self => document.body.classList.toggle('story-running', self.isActive)
          }
        });
        storyTimeline.to(motionTarget, {scale: 1, y: 0, duration: .12}, 0);
        if (phones) {
          gsap.set(scenes, {autoAlpha: .62, y: i => [24, 0, 56][i], rotation: i => [-2, 0, 2][i]});
          gsap.set(scenes[0], {autoAlpha: 1});
          storyTimeline.to(scenes[0], {autoAlpha: .62, y: 48, duration: .08}, .30)
            .to(scenes[1], {autoAlpha: 1, y: -8, duration: .08}, .30)
            .to(scenes[1], {autoAlpha: .62, y: 0, duration: .08}, .64)
            .to(scenes[2], {autoAlpha: 1, y: 24, duration: .08}, .64);
        } else {
          storyTimeline.to(scenes[0], {autoAlpha: 0, y: -20, duration: .04}, .30)
            .fromTo(scenes[1], {autoAlpha: 0, y: 20}, {autoAlpha: 1, y: 0, duration: .04}, .34)
            .to(scenes[1], {autoAlpha: 0, y: -20, duration: .04}, .64)
            .fromTo(scenes[2], {autoAlpha: 0, y: 20}, {autoAlpha: 1, y: 0, duration: .04}, .68);
        }
        // Keep the explanation fully visible before releasing the pin.
        storyTimeline.to({}, {duration: .28}, .72);
        storyTrigger = storyTimeline.scrollTrigger;
        updateStoryProgress(storyTimeline.progress());
      }
      return () => { storyTrigger = null; storyTimeline = null; document.body.classList.remove('scroll-story', 'story-compact', 'phone-story', 'story-running'); };
    });
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh(), {once: true});
  } else {
    const fallback = () => {
      if (motionPreference.matches) { scenes.forEach(scene => { scene.style.visibility = 'visible'; scene.style.opacity = '1'; }); updateStep(0, true); }
      else showStep(activeStep, true);
    };
    fallback(); motionPreference.addEventListener('change', fallback);
  }
})();
