/* Retire the old theme preference without touching study or quiz storage. */
(function () {
  document.documentElement.style.colorScheme = 'light';
  if (document.body) document.body.classList.remove('dark');
  try { localStorage.removeItem('darkMode'); } catch (error) {}
  document.addEventListener('DOMContentLoaded', function () {
    document.body.classList.remove('dark');
  }, { once: true });
})();
