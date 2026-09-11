/* Quiz range routes retain their public hashes; numbered links resolve a question's range. */
const pages = Array.from(document.querySelectorAll('.page-section[id^="page-"]'), section => section.id.slice(5));
const quizDefaultRoute = document.querySelector('.page-section.active').id.slice(5);
function closeNav() {
  document.getElementById('sidenav').classList.remove('open');
  document.getElementById('nav-overlay').classList.remove('open');
}
function quizRouteFor(target) {
  if (pages.includes(target)) return target;
  const question = /^grila-\d+$/.test(target) && document.getElementById(target);
  return question ? question.closest('.page-section').id.slice(5) : quizDefaultRoute;
}
function quizNavigate(target, updateHash, focusDestination = true) {
  const route = quizRouteFor(target);
  const question = /^grila-\d+$/.test(target) && document.getElementById(target);
  document.querySelectorAll('.page-section').forEach(section => section.classList.toggle('active', section.id === 'page-' + route));
  document.querySelectorAll('.quiz-question-map a').forEach(link => {
    link.classList.toggle('is-current-range', link.dataset.range === route);
    const current = link.hash === '#' + target;
    if (current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  window.closeNav();
  if (updateHash && location.hash.slice(1) !== target) history.replaceState(null, '', '#' + (question ? target : route));
  document.dispatchEvent(new CustomEvent('bb:lesson-section-change', {detail: {route, section: document.getElementById('page-' + route), source: 'quiz'}}));
  const focusTarget = question || document.querySelector('#page-' + route + ' h1');
  if (focusDestination && focusTarget) {
    focusTarget.setAttribute('tabindex', '-1');
    focusTarget.focus({preventScroll: true});
  }
  if (question) question.scrollIntoView({block: 'start', behavior: 'instant'});
  else window.scrollTo({top: 0, behavior: 'instant'});
}
// Shared search owns programmatic focus; native links and hash changes focus their destination.
function goto(page) { quizNavigate(page, true, false); }
function handleHash() {
  let target;
  try { target = decodeURIComponent(location.hash.slice(1)); } catch (_) { target = ''; }
  quizNavigate(target || quizDefaultRoute, false);
}
addEventListener('scroll', () => { document.getElementById('top').style.display = scrollY > 500 ? 'flex' : 'none'; });
/* The player renders cards on DOMContentLoaded; run after those listeners. */
addEventListener('DOMContentLoaded', () => setTimeout(handleHash, 0));
addEventListener('hashchange', handleHash);
document.addEventListener('click', event => {
  const link = event.target.closest('.quiz-question-map a, .quiz-page-nav a');
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.hash && link.pathname === location.pathname) {
    // Reveal the destination before the native fragment action and keep native history.
    quizNavigate(link.hash.slice(1), false);
  }
});
