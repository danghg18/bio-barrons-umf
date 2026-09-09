/* Intro-only presentation adapter. Navigation, search and preferences remain shared. */
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var context = document.getElementById('academic-current-section');
    function updateContext() {
      var active = document.querySelector('#sidenav a.active');
      if (active) context.textContent = active.textContent.replace(/^\s*[—\d.]+\s*/, '').trim();
    }
    document.addEventListener('bb:lesson-section-change', updateContext);
    updateContext();
    var button = document.getElementById('nav-hl-btn');
    var palette = document.getElementById('bb-highlighter-palette');
    var originalParent = button.parentElement;
    var wrapper = document.createElement('div');
    wrapper.className = 'academic-highlighter';
    wrapper.append(button, palette);
    var actions = document.querySelector('.lab-topbar-actions');
    var media = window.matchMedia('(max-width: 1024px)');
    function placeTools() {
      if (media.matches) originalParent.appendChild(wrapper);
      else actions.insertBefore(wrapper, actions.querySelector('.lab-topbar-back'));
    }
    media.addEventListener('change', placeTools);
    placeTools();
  });
})();
