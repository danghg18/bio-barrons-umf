/* The same editor owns formatting and autosave in lessons and notebooks. */
(function () {
  'use strict';
  const icon = path => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="' + path + '"/></svg>';
  function mount(panel, options) {
    const content = window.BBNotesContent, events = new AbortController();
    const id = options.idPrefix || 'bb-note';
    panel.innerHTML = '<div class="bb-notes-toolbar" role="group" aria-label="Formatarea notiței"></div><div id="bb-note-body" class="bb-note-body" contenteditable="true" tabindex="0" role="textbox" aria-multiline="true" aria-label="Notița ta pentru această secțiune" data-placeholder="Idei de reținut, conexiuni, întrebări…" aria-describedby="bb-note-status"></div><p id="bb-note-status" class="bb-note-status" role="status" aria-live="polite"></p>';
    const editor = panel.querySelector('#bb-note-body'), toolbar = panel.querySelector('.bb-notes-toolbar'), status = panel.querySelector('#bb-note-status');
    editor.id = id + '-body'; status.id = id + '-status';
    editor.setAttribute('aria-describedby', status.id);
    if (options.headingId) editor.setAttribute('aria-labelledby', options.headingId);
    function activate() {
      if (options.toolbarHost && toolbar.parentNode !== options.toolbarHost) options.toolbarHost.replaceChildren(toolbar);
      options.onActivate?.(controller);
    }
    let section = options.section, currentOwner = null, savedBody = '', savedRange = null, highlightColor = 'transparent', generation = 0, disposed = false;
    const signedIn = () => !!window.BBAuth.getState().user && window.BBAuth.getState().user.id === window.BBUserStorage.owner();
    const key = () => 'note:' + options.chapter.num + ':' + section;
    const textColors = [['#20262d','Negru'],['#b42332','Roșu'],['#2459a6','Albastru'],['#256b45','Verde'],['#7945a1','Violet']];
    const highlights = [['#fff0a3','Galben'],['#c9efd2','Verde'],['#cce8ff','Albastru'],['#f6cee5','Roz'],['transparent','Fără evidențiere']];
    function button(label, path, action) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'bb-note-tool'; b.title = label; b.setAttribute('aria-label', label); b.innerHTML = icon(path); b.addEventListener('click', action); return b;
    }
    function updateStatus() {
      if (!signedIn()) { status.textContent = ''; return; }
      if (!window.BBUserStorage.canPersist()) { status.textContent = 'Stocare locală indisponibilă. Păstrează pagina deschisă și exportă copia din cont.'; return; }
      if (!navigator.onLine) { status.textContent = 'Salvat pe dispozitiv. Se sincronizează la reconectare.'; return; }
      const sync = window.BBCloudSync?.getState();
      if (sync?.status === 'error') status.textContent = 'Salvat pe dispozitiv. Sincronizarea a eșuat; reîncearcă din meniul contului.';
      else status.textContent = '';
    }
    const objectSelector = 'figure[data-bb-image],aside[data-bb-sticky]';
    let selectedObject = null, drag = null, resize = null, dragFrame = 0, composing = false, deferredLoad = false;
    function chooseObject(node) {
      editor.querySelectorAll('.bb-object-selected').forEach(item => item.classList.toggle('bb-object-selected', item === node));
      node?.classList.add('bb-object-selected');
      selectedObject = node;
    }
    function objectPalette(node) {
      const opening = node.querySelector('.bb-sticky-palette').hidden;
      closePalettes();
      const palette = node.querySelector('.bb-sticky-palette');
      palette.hidden = !opening; node.querySelector('.bb-sticky-color').setAttribute('aria-expanded', String(opening));
    }
    function validate(body, host = editor) {
      if (body.length > 20000) { status.textContent = 'Limita notiței a fost atinsă. Scurtează textul sau elimină o parte din formatare.'; return false; }
      if (host.querySelectorAll('[data-bb-image]').length > 12) { status.textContent = 'Poți adăuga maximum 12 imagini într-o notiță.'; return false; }
      return true;
    }
    function topChild(node, host = editor) {
      while (node && node.parentNode !== host) node = node.parentNode;
      return node;
    }
    function receive(node, before, align, fromOwner) {
      if (!node?.matches('aside[data-bb-sticky]') || disposed || !signedIn() || currentOwner !== fromOwner || !window.BBUserStorage.canPersist()) return false;
      const clean = document.createElement('div'); clean.innerHTML = content.clean(node.outerHTML);
      const copy = clean.firstElementChild; if (!copy) return false;
      copy.dataset.bbAlign = align;
      editor.insertBefore(copy, before);
      const body = content.serialize(editor);
      if (!validate(body)) { copy.remove(); return false; }
      const ok = save();
      if (!ok) { copy.remove(); return false; }
      decorate(); chooseObject(copy);
      // If durable storage failed, leave the source intact for recovery.
      return window.BBUserStorage.canPersist();
    }
    function moveObject(node, target, before, align = node.dataset.bbAlign || 'block') {
      if (!node?.isConnected || !node.matches('aside[data-bb-sticky]') || !signedIn() || disposed || currentOwner !== window.BBUserStorage.owner()) return false;
      if (before === node) before = node.nextSibling;
      if (target === controller) {
        const previousParent = node.parentNode, next = node.nextSibling, previousAlign = node.dataset.bbAlign;
        editor.insertBefore(node, before); node.dataset.bbAlign = align;
        if (!validate(content.serialize(editor))) {
          previousParent.insertBefore(node, next); if (previousAlign) node.dataset.bbAlign = previousAlign; else delete node.dataset.bbAlign;
          return false;
        }
        closePalettes(); save(); chooseObject(node); node.querySelector('.bb-object-move')?.focus({preventScroll:true}); return true;
      }
      if (!target.receive(node, before, align, currentOwner)) {
        status.textContent = 'Obiectul a rămas aici. Verifică spațiul disponibil și limita secțiunii de destinație.'; return false;
      }
      node.remove(); savedRange = null; closePalettes(); save(); target.activate(); return true;
    }
    function movementMenu(node) {
      const menu = node.querySelector('.bb-object-menu'), opening = menu.hidden; closePalettes();
      if (!opening) return;
      menu.replaceChildren(); menu.hidden = false;
      node.querySelector('.bb-object-move').setAttribute('aria-expanded', 'true');
      const row = document.createElement('div'); row.className = 'bb-object-align';
      [['left','În stânga','M4 4v16M8 5h12v6H8zM8 15h12M8 19h12'],['right','În dreapta','M20 4v16M4 5h12v6H4zM4 15h12M4 19h12'],['block','Pe rând separat','M4 4h16M4 8h16v8H4zM4 20h16']].forEach(([align,label,path]) => row.append(button(label,path,() => moveObject(node,controller,node.nextSibling,align))));
      const up = button('Mută mai sus','m6 14 6-6 6 6',() => { if (node.previousSibling) moveObject(node,controller,node.previousSibling); });
      const down = button('Mută mai jos','m6 10 6 6 6-6',() => { if (node.nextSibling) moveObject(node,controller,node.nextSibling.nextSibling); });
      up.disabled = !node.previousSibling; down.disabled = !node.nextSibling; row.append(up,down);
      menu.append(row);
      const peers = options.peers?.() || [];
      if (peers.length > 1) {
        const label = document.createElement('label'); label.textContent = 'Mută la subtitlul';
        const select = document.createElement('select'); select.className = 'bb-object-destination';
        peers.filter(item => item.controller !== controller).forEach(item => { const option = document.createElement('option'); option.value = item.controller.section(); option.textContent = item.title; select.append(option); });
        label.append(select); menu.append(label);
        const move = document.createElement('button'); move.type = 'button'; move.className = 'bb-object-transfer'; move.textContent = 'Mută în secțiune';
        move.addEventListener('click', () => {
          const target = peers.find(item => item.controller.section() === select.value)?.controller;
          if (target && moveObject(node,target,null)) { target.editor.scrollIntoView({block:'center'}); target.editor.querySelector('.bb-object-selected .bb-object-move')?.focus({preventScroll:true}); }
        }); menu.append(move);
      }
      node.querySelector('.bb-object-move').focus({preventScroll:true});
      menu.classList.remove('bb-menu-above');
      const bounds = menu.getBoundingClientRect();
      if (bounds.bottom > innerHeight - 12 && node.querySelector('.bb-object-controls').getBoundingClientRect().top > bounds.height + 80) menu.classList.add('bb-menu-above');
    }
    function dragTarget(x,y) {
      const candidates = options.peers?.().map(item => item.controller) || [controller];
      for (const target of candidates) {
        const box = target.editor.getBoundingClientRect();
        if (x < box.left - 20 || x > box.right + 20 || y < box.top - 32 || y > box.bottom + 32) continue;
        const children = [...target.editor.childNodes].filter(node => node !== drag.node && !(node.nodeType === 1 && node.hasAttribute('data-note-control')));
        const rect = node => { if (node.nodeType === 1) return node.getBoundingClientRect(); const range = document.createRange(); range.selectNode(node); return range.getBoundingClientRect(); };
        const before = children.find(node => y < rect(node).top + rect(node).height / 2) || null;
        const align = x < box.left + box.width * .4 ? 'left' : x > box.right - box.width * .4 ? 'right' : 'block';
        return {target, before, align, box, top:before ? rect(before).top : box.bottom};
      }
      return null;
    }
    function updateDrag() {
      if (!drag?.started) return;
      const scrolling = drag.y < 100 ? -14 : drag.y > innerHeight - 90 ? 14 : 0;
      if (scrolling) window.scrollBy(0,scrolling);
      drag.destination = dragTarget(drag.x,drag.y);
      const dest = drag.destination; drag.preview.hidden = !dest;
      if (dest) {
        Object.assign(drag.preview.style,{left:dest.box.left + 'px',top:Math.max(72,Math.min(innerHeight - 20,dest.top)) + 'px',width:dest.box.width + 'px'});
        drag.preview.textContent = dest.align === 'left' ? 'În stânga · textul ocolește' : dest.align === 'right' ? 'În dreapta · textul ocolește' : 'Pe rând separat';
      }
      dragFrame = requestAnimationFrame(updateDrag);
    }
    function cancelDrag() {
      cancelAnimationFrame(dragFrame);
      if (drag) { drag.preview.remove(); drag.node.classList.remove('bb-object-dragging'); }
      drag = null;
    }
    function imageLimit() {
      const style = getComputedStyle(editor);
      return Math.max(120, Math.min(1600, editor.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)));
    }
    function imageSize(node) {
      const handle = node.querySelector('.bb-image-resize'); if (!handle) return;
      const width = Math.round(node.getBoundingClientRect().width);
      handle.setAttribute('aria-valuemin','120'); handle.setAttribute('aria-valuemax',String(Math.round(imageLimit())));
      handle.setAttribute('aria-valuenow',String(width)); handle.setAttribute('aria-valuetext',width + ' pixeli');
    }
    function setImageWidth(node, width) {
      const size = Math.round(Math.max(120, Math.min(imageLimit(), width)));
      node.dataset.bbWidth = String(size); node.style.width = size + 'px'; imageSize(node);
    }
    function cancelResize() {
      if (!resize) return;
      const {node,previousWidth,previousStyle} = resize;
      if (previousWidth) node.dataset.bbWidth = previousWidth; else delete node.dataset.bbWidth;
      node.style.width = previousStyle; node.classList.remove('bb-image-resizing'); resize = null; imageSize(node);
    }
    function resizeImage(event) {
      if (!resize || resize.pointerId !== event.pointerId) return;
      const {node,x,y,width,ratio,direction} = resize;
      setImageWidth(node,width + ((event.clientX-x)*direction + (event.clientY-y)/ratio)/(1 + 1/(ratio*ratio)));
    }
    function addResize(node) {
      const handle = document.createElement('div'); handle.className = 'bb-image-resize'; handle.dataset.noteControl = '';
      handle.tabIndex = 0; handle.setAttribute('role','slider'); handle.setAttribute('aria-label','Dimensiunea imaginii');
      handle.title = 'Trage colțul pentru redimensionare · tastele săgeți ajustează dimensiunea';
      handle.innerHTML = icon('M8 16 16 8M8 11v5h5M11 8h5v5');
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0 || !signedIn()) return;
        event.preventDefault(); event.stopPropagation(); cancelDrag(); cancelResize(); activate(); chooseObject(node); closePalettes();
        const box = node.querySelector('img')?.getBoundingClientRect(); if (!box?.width || !box.height) return;
        resize = {node,pointerId:event.pointerId,x:event.clientX,y:event.clientY,width:box.width,ratio:box.width/box.height,direction:getComputedStyle(node).float === 'right' ? -1 : 1,previousWidth:node.dataset.bbWidth,previousStyle:node.style.width};
        node.classList.add('bb-image-resizing'); handle.setPointerCapture(event.pointerId); handle.focus({preventScroll:true});
      });
      handle.addEventListener('pointermove',resizeImage);
      handle.addEventListener('pointerup', event => {
        if (!resize || resize.pointerId !== event.pointerId) return;
        resizeImage(event); resize = null; node.classList.remove('bb-image-resizing'); save();
      });
      handle.addEventListener('pointercancel',cancelResize); handle.addEventListener('lostpointercapture',cancelResize);
      handle.addEventListener('keydown', event => {
        if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        const width = node.getBoundingClientRect().width, step = event.shiftKey ? 40 : 10;
        setImageWidth(node,event.key === 'Home' ? 120 : event.key === 'End' ? imageLimit() : width + (['ArrowLeft','ArrowDown'].includes(event.key) ? -step : step));
        save();
      });
      handle.addEventListener('focus', () => imageSize(node));
      node.append(handle); imageSize(node);
    }
    function decorate() {
      editor.querySelectorAll(objectSelector).forEach(node => {
        node.contentEditable = 'false';
        const sticky = node.matches('aside'), text = node.querySelector(sticky ? '.bb-sticky-text' : 'figcaption');
        text.contentEditable = 'true'; text.setAttribute('role','textbox'); text.setAttribute('aria-label',sticky ? 'Text sticky note' : 'Descrierea imaginii'); text.dataset.placeholder = sticky ? 'Un lucru de reținut…' : 'Adaugă o descriere…';
        if (node.querySelector('.bb-object-controls')) return;
        const controls = document.createElement('div'); controls.className = 'bb-object-controls'; controls.dataset.noteControl = '';
        if (sticky) {
          const move = button('Mută obiectul','M8 5h2m4 0h2M8 12h2m4 0h2M8 19h2m4 0h2', () => { if (move.dataset.dragged) { delete move.dataset.dragged; return; } chooseObject(node); movementMenu(node); });
          move.classList.add('bb-object-move'); move.setAttribute('aria-expanded','false'); move.title = 'Trage pentru a muta sau apasă pentru opțiuni';
          node.addEventListener('pointerdown', event => {
            if (event.button !== 0 || !signedIn() || !move.contains(event.target)) return;
            cancelDrag(); cancelResize(); delete move.dataset.dragged;
            event.preventDefault(); event.stopPropagation(); activate(); chooseObject(node); move.focus({preventScroll:true});
            const preview = document.createElement('div'); preview.className = 'bb-object-drop-preview'; preview.hidden = true; document.body.append(preview);
            drag = {node,preview,pointerId:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,started:false};
            move.setPointerCapture(event.pointerId);
          });
          node.addEventListener('pointermove', event => {
            if (!drag || drag.node !== node || drag.pointerId !== event.pointerId) return; drag.x = event.clientX; drag.y = event.clientY;
            if (!drag.started && Math.hypot(drag.x-drag.startX,drag.y-drag.startY) > 6) { drag.started = true; closePalettes(); node.classList.add('bb-object-dragging'); updateDrag(); }
          });
          node.addEventListener('pointerup', event => {
            if (!drag || drag.node !== node || drag.pointerId !== event.pointerId) return;
            const {started} = drag, destination = started ? dragTarget(event.clientX,event.clientY) : null;
            cancelDrag();
            if (started) { move.dataset.dragged = 'true'; if (destination) moveObject(node,destination.target,destination.before,destination.align); }
          });
          node.addEventListener('pointercancel', cancelDrag); node.addEventListener('lostpointercapture', cancelDrag); controls.append(move);
        }
        if (!sticky) addResize(node);
        if (sticky) {
          const color = button('Culoarea bilețelului','M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h3a5 5 0 0 0 5-5c0-3-5-5-9-5Z', () => objectPalette(node));
          color.classList.add('bb-sticky-color'); color.setAttribute('aria-expanded','false'); controls.append(color);
          const palette = document.createElement('div'); palette.className = 'bb-note-palette bb-sticky-palette'; palette.hidden = true;
          stickySwatches(palette, chosen => { node.dataset.bbSticky = chosen; closePalettes(); save(); text.focus({preventScroll:true}); }); controls.append(palette);
        }
        controls.append(button(sticky ? 'Șterge sticky note' : 'Elimină imaginea','m6 6 12 12M18 6 6 18', () => { node.remove(); save(); editor.focus({preventScroll:true}); }));
        if (sticky) {
          const menu = document.createElement('div'); menu.className = 'bb-object-menu'; menu.hidden = true; controls.append(menu);
        }
        node.prepend(controls);
      });
      void window.BBNoteMedia.render(editor);
    }
    function renderBody(body) { content.render(editor, body); decorate(); }
    function save() {
      if (disposed || !signedIn() || currentOwner !== window.BBUserStorage.owner()) return;
      const body = content.serialize(editor);
      if (body.length > 20000) { renderBody(savedBody); savedRange = null; status.textContent = 'Limita notiței a fost atinsă. Scurtează textul sau elimină o parte din formatare.'; return false; }
      if (body === savedBody) { updateStatus(); return true; }
      savedBody = body;
      const previous = window.BBUserStorage.get(key()), now = new Date().toISOString();
      const ok = window.BBUserStorage.set(key(), {chapter_num:options.chapter.num, section_id:section, body, created_at:previous?.created_at || now, updated_at:now});
      updateStatus(); if (!ok) status.textContent = 'Contul s-a schimbat într-o altă filă. Redeschide notițele după autentificare.';
      return ok;
    }
    function load(force = false) {
      const owner = window.BBUserStorage.owner(), changed = owner !== currentOwner;
      if (changed) { currentOwner = owner; generation++; }
      const authenticated = signedIn(); editor.contentEditable = String(authenticated);
      const body = authenticated ? window.BBUserStorage.get(key())?.body || '' : '';
      if (composing && !changed && !force) { deferredLoad = true; return; }
      if (changed || force || body !== savedBody) { cancelDrag(); cancelResize(); savedBody = body; renderBody(body); savedRange = null; closePalettes(); }
      updateStatus();
    }
    function rememberSelection() {
      const selection = window.getSelection();
      if (selection?.rangeCount && editor.contains(selection.anchorNode) && editor.contains(selection.focusNode)) savedRange = selection.getRangeAt(0).cloneRange();
    }
    function applyColor(command, color) {
      // Focus can replace the live selection, especially on touch devices.
      const range = savedRange?.cloneRange();
      editor.focus();
      if (range && editor.contains(range.commonAncestorContainer)) {
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      }
      document.execCommand('styleWithCSS', false, true);
      document.execCommand(command, false, color);
      rememberSelection(); save();
    }
    function highlightSelection() {
      rememberSelection();
      const selection = window.getSelection();
      if (!options.isOpen() || !signedIn() || highlightColor === 'transparent' || !selection?.toString().trim() ||
          !editor.contains(selection.anchorNode) || !editor.contains(selection.focusNode)) return;
      applyColor('hiliteColor', highlightColor);
      selection.collapseToEnd();
      // The marker applies to selected passages, not subsequent typing.
      document.execCommand('hiliteColor', false, 'transparent');
      rememberSelection();
    }
    function closePalettes() {
      [toolbar, editor].forEach(host => {
        host.querySelectorAll('.bb-note-palette,.bb-object-menu').forEach(node => { node.hidden = true; });
        host.querySelectorAll('[aria-expanded]').forEach(node => node.setAttribute('aria-expanded', 'false'));
      });
    }
    function addPalette(name, label, icon, colors, command) {
      const group = document.createElement('div'); group.className = 'bb-note-color-group';
      const trigger = document.createElement('button');
      trigger.type = 'button'; trigger.className = 'bb-note-tool'; trigger.setAttribute('aria-label', label);
      trigger.title = label; trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', id + '-' + name);
      trigger.innerHTML = icon;
      if (command === 'hiliteColor') trigger.setAttribute('aria-pressed', 'false');
      const palette = document.createElement('div'); palette.id = id + '-' + name; palette.className = 'bb-note-palette'; palette.hidden = true;
      palette.setAttribute('role', 'group'); palette.setAttribute('aria-label', label);
      for (const [color, colorName] of colors) {
        const swatch = document.createElement('button'); swatch.type = 'button'; swatch.className = 'bb-note-swatch';
        swatch.style.setProperty('--note-swatch', color); swatch.setAttribute('aria-label', colorName); swatch.title = colorName;
        if (color === 'transparent') swatch.textContent = '×';
        swatch.addEventListener('click', () => {
          if (command === 'hiliteColor') {
            highlightColor = color;
            trigger.setAttribute('aria-pressed', String(color !== 'transparent'));
            trigger.title = color === 'transparent' ? label : 'Evidențiator activ: selectează textul';
            palette.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === swatch)));
            if (savedRange && !savedRange.collapsed) applyColor(command, color);
          } else applyColor(command, color);
          closePalettes();
        });
        palette.append(swatch);
      }
      trigger.addEventListener('click', () => { const opening = palette.hidden; closePalettes(); palette.hidden = !opening; trigger.setAttribute('aria-expanded', String(opening)); });
      group.append(trigger, palette); toolbar.append(group);
    }
    addPalette('text-colors', 'Culoarea textului', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m6 17 6-13 6 13M8 13h8M4 21h16"/></svg>', textColors, 'foreColor');
    addPalette('highlights', 'Evidențiere', '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m9 14 7-10 5 4-8 9-4-3ZM9 14l-4 3 4 3 4-3M3 22h15"/></svg>', highlights, 'hiliteColor');
    toolbar.addEventListener('pointerdown', event => { rememberSelection(); event.preventDefault(); });
    document.addEventListener('selectionchange', rememberSelection, {signal:events.signal});
    panel.addEventListener('click', event => { if (!toolbar.contains(event.target) && !event.target.closest('[data-note-control]')) closePalettes(); });
    toolbar.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const trigger = toolbar.querySelector('[aria-expanded="true"]');
      if (trigger) { event.preventDefault(); event.stopPropagation(); closePalettes(); trigger.focus(); }
    });
    const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/*'; file.className = 'bb-note-image-input'; file.hidden = true; toolbar.append(file);
    toolbar.append(button('Adaugă imagine', 'M3 3h18v18H3zM3 16l5-5 4 4 3-3 6 6M15 7h.01', () => file.click()));
    function insertionRange() {
      rememberSelection();
      return savedRange && editor.contains(savedRange.commonAncestorContainer) ? savedRange.cloneRange() : null;
    }
    function insertBlock(node, range = insertionRange()) {
      node.dataset.bbAlign = 'right';
      if (range && editor.contains(range.commonAncestorContainer)) {
        range.collapse(true);
        const embedded = (range.startContainer.nodeType === 1 ? range.startContainer : range.startContainer.parentElement)?.closest(objectSelector);
        if (embedded) editor.insertBefore(node, topChild(embedded).nextSibling);
        else if (range.startContainer === editor) range.insertNode(node);
        else {
          const top = topChild(range.startContainer);
          const tail = range.cloneRange(); tail.setEndAfter(top);
          const rest = tail.extractContents(); editor.insertBefore(node, top.nextSibling); node.after(rest);
        }
      } else editor.append(node);
      if (!node.nextSibling) { const paragraph = document.createElement('div'); paragraph.append(document.createElement('br')); editor.append(paragraph); }
      decorate();
      if (!validate(content.serialize(editor))) { node.remove(); return false; }
      save(); chooseObject(node); return true;
    }
    function stickySwatches(palette, choose) {
      const labels = {yellow:'galben',sage:'verde',rose:'roz',blue:'albastru'};
      content.colors.forEach(color => {
        const swatch = button('Sticky note ' + labels[color], '', () => choose(color));
        swatch.className = 'bb-note-swatch'; swatch.dataset.color = color; palette.append(swatch);
      });
    }
    const stickyGroup = document.createElement('div'); stickyGroup.className = 'bb-note-color-group';
    const stickyPalette = document.createElement('div'); stickyPalette.className = 'bb-note-palette bb-sticky-palette'; stickyPalette.hidden = true; stickyPalette.id = id + '-sticky-colors';
    const stickyTrigger = button('Adaugă sticky note','M4 3h16v12l-5 6H4zM15 21v-6h5', () => {
      const opening = stickyPalette.hidden; closePalettes(); stickyPalette.hidden = !opening; stickyTrigger.setAttribute('aria-expanded',String(opening));
    }); stickyTrigger.setAttribute('aria-expanded','false'); stickyTrigger.setAttribute('aria-controls',stickyPalette.id);
    stickySwatches(stickyPalette, color => {
      const range = insertionRange(); closePalettes();
      const sticky = document.createElement('aside'); sticky.dataset.bbSticky = color;
      const text = document.createElement('div'); text.className = 'bb-sticky-text'; sticky.append(text);
      if (insertBlock(sticky,range)) text.focus({preventScroll:true});
    });
    stickyGroup.append(stickyTrigger,stickyPalette); toolbar.append(stickyGroup);
    async function addImage(image) {
      const id = currentOwner, startKey = key(), token = generation, range = insertionRange();
      if (!signedIn()) return;
      const active = () => !disposed && signedIn() && currentOwner === id && window.BBUserStorage.owner() === id && key() === startKey && generation === token;
      if (editor.querySelectorAll('[data-bb-image]').length >= 12) { status.textContent='Poți adăuga maximum 12 imagini într-o notiță.'; return; }
      status.textContent = 'Se pregătește imaginea…';
      try {
        const imageId = await window.BBNoteMedia.add(image, id);
        if (!active()) return;
        const figure = document.createElement('figure'); figure.dataset.bbImage = imageId; figure.append(document.createElement('figcaption')); insertBlock(figure,range);
      } catch (error) { if (active()) status.textContent = error.message; }
    }
    file.addEventListener('change', () => { const image = file.files[0]; file.value = ''; if (image) void addImage(image); });
    editor.addEventListener('paste', event => {
      event.preventDefault(); const image = [...(event.clipboardData.files || [])].find(item => item.type.startsWith('image/'));
      if (image) void addImage(image); else document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    });
    editor.addEventListener('dragover', event => event.preventDefault());
    editor.addEventListener('dragstart', event => { if (event.target.closest('figure[data-bb-image]')) event.preventDefault(); });
    editor.addEventListener('drop', event => { event.preventDefault(); const image = event.dataTransfer.files[0]; if (image) void addImage(image); });
    ['mouseup','touchend'].forEach(type => editor.addEventListener(type, event => { rememberSelection(); event.stopPropagation(); if (type === 'touchend') setTimeout(() => { if (!disposed) highlightSelection(); },60); else highlightSelection(); }));
    editor.addEventListener('keyup', event => { if (event.key === 'Shift') highlightSelection(); });
    editor.addEventListener('input', save);
    editor.addEventListener('compositionstart', () => { composing = true; });
    editor.addEventListener('compositionend', () => { composing = false; save(); if (deferredLoad) { deferredLoad = false; load(); } });
    editor.addEventListener('click', event => { const node = event.target.closest(objectSelector); chooseObject(node); });
    panel.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      if (drag || resize || editor.querySelector('[aria-expanded="true"]')) {
        event.preventDefault(); event.stopPropagation(); cancelDrag(); cancelResize(); closePalettes(); selectedObject?.querySelector('.bb-object-move')?.focus({preventScroll:true});
      }
    });
    panel.addEventListener('focusin', activate);
    ['bb:auth-change','bb:cache-owner-change','bb:cache-change','bb:cache-write'].forEach(type => document.addEventListener(type, () => load(), {signal:events.signal}));
    document.addEventListener('bb:sync-change', updateStatus, {signal:events.signal});
    window.addEventListener('online', updateStatus, {signal:events.signal}); window.addEventListener('offline', updateStatus, {signal:events.signal});
    window.addEventListener('blur', () => { cancelDrag(); cancelResize(); }, {signal:events.signal});
    load(true);
    const controller = {editor, load, closePalettes, activate, receive, section:() => section, setSection(next) { if (next !== section) { section = next; generation++; load(true); } }, destroy() { disposed = true; generation++; cancelDrag(); cancelResize(); events.abort(); toolbar.remove(); panel.replaceChildren(); }};
    if (options.toolbarHost) toolbar.remove();
    return controller;
  }
  window.BBNoteEditor = {mount};
}());
