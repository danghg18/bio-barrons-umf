/* One persisted format and sanitizer for lesson and notebook editors. */
(function () {
  'use strict';
  const prefix = '<!--bb-note-rich:v1-->';
  const colors = ['yellow','sage','rose','blue'];
  function clean(html) {
    const source = document.createElement('template'); source.innerHTML = html;
    const result = document.createElement('div');
    function copy(parent, target) {
      for (const node of parent.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) { target.append(document.createTextNode(node.textContent)); continue; }
        if (node.nodeType !== Node.ELEMENT_NODE || node.hasAttribute('data-note-control') || /^(SCRIPT|STYLE|IFRAME|OBJECT|SVG|MATH|IMG|VIDEO|AUDIO|INPUT|BUTTON)$/.test(node.tagName)) continue;
        if (node.tagName === 'FIGURE' && window.BBNoteMedia.validId(node.dataset.bbImage)) {
          const figure = document.createElement('figure'); figure.dataset.bbImage = node.dataset.bbImage;
          if (['left','right','block'].includes(node.dataset.bbAlign)) figure.dataset.bbAlign = node.dataset.bbAlign;
          if (/^\d{2,4}$/.test(node.dataset.bbWidth || '')) {
            const width = Math.max(120, Math.min(1600, Number(node.dataset.bbWidth)));
            figure.dataset.bbWidth = String(width); figure.style.width = width + 'px';
          }
          const caption = document.createElement('figcaption'); caption.textContent = node.querySelector('figcaption')?.textContent || '';
          figure.append(caption); target.append(figure); continue;
        }
        if (node.tagName === 'ASIDE' && colors.includes(node.dataset.bbSticky)) {
          const aside = document.createElement('aside'); aside.dataset.bbSticky = node.dataset.bbSticky;
          if (['left','right','block'].includes(node.dataset.bbAlign)) aside.dataset.bbAlign = node.dataset.bbAlign;
          const text = document.createElement('div'); text.className = 'bb-sticky-text';
          const body = node.querySelector('.bb-sticky-text'); copy(body || node, text); aside.append(text); target.append(aside); continue;
        }
        const tag = node.tagName.toLowerCase();
        const el = document.createElement(['div','p','br','b','i','u','strong','em'].includes(tag) ? tag : 'span');
        const color = node.style.color || (tag === 'font' ? node.getAttribute('color') : '');
        if (color && CSS.supports('color', color)) el.style.color = color;
        const background = node.style.backgroundColor;
        if (background && CSS.supports('color', background)) el.style.backgroundColor = background;
        copy(node, el); target.append(el);
      }
    }
    copy(source.content, result); return result.innerHTML;
  }
  function render(target, body) { if (body.startsWith(prefix)) target.innerHTML = clean(body.slice(prefix.length)); else target.textContent = body; }
  function serialize(target) { return target.querySelector('[style],b,i,u,strong,em,[data-bb-image],[data-bb-sticky]') ? prefix + clean(target.innerHTML) : target.innerText; }
  function hasContent(target) { return !!(target.textContent.trim() || target.querySelector('[data-bb-image],[data-bb-sticky]')); }
  window.BBNotesContent = {prefix, clean, render, serialize, hasContent, colors};
}());
