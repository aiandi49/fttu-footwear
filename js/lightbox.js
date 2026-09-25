/* F.T.T.U — full-screen image viewer, shared by the showroom and the guide.
   Lightbox.open(items, startIndex)  items: [{ src, title, caption, alt }]
   Swipe, arrow keys, Esc and the on-screen buttons all work. */
(function (global) {
  var el, img, titleEl, capEl, countEl, prevBtn, nextBtn, closeBtn, items = [], i = 0, lastFocus = null, startX = null, startY = null;

  function build() {
    el = document.createElement('div');
    el.className = 'lb';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', 'Image viewer');
    el.hidden = true;
    el.innerHTML =
      '<div class="lb-top"><span class="lb-count" aria-live="polite"></span>' +
      '<button type="button" class="lb-btn lb-close" aria-label="Close viewer">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="lb-stage"><img class="lb-img" alt="" decoding="async"></div>' +
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
      '<button type="button" class="lb-btn lb-next" aria-label="Next image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></button>' +
      '<div class="lb-cap"><strong class="lb-title"></strong><span class="lb-caption"></span></div>';
    document.body.appendChild(el);
    img = el.querySelector('.lb-img');
    titleEl = el.querySelector('.lb-title');
    capEl = el.querySelector('.lb-caption');
    countEl = el.querySelector('.lb-count');
    prevBtn = el.querySelector('.lb-prev');
    nextBtn = el.querySelector('.lb-next');
    closeBtn = el.querySelector('.lb-close');
    prevBtn.addEventListener('click', function () { go(-1); });
    nextBtn.addEventListener('click', function () { go(1); });
    closeBtn.addEventListener('click', close);
    el.querySelector('.lb-stage').addEventListener('click', function (e) { if (e.target === e.currentTarget) close(); });
    el.addEventListener('pointerdown', function (e) { startX = e.clientX; startY = e.clientY; });
    el.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX, dy = e.clientY - startY; startX = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    });
    document.addEventListener('keydown', function (e) {
      if (el.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') { // keep focus inside the viewer
        var f = [closeBtn, prevBtn, nextBtn].filter(function (b) { return !b.hidden; });
        var k = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
  }

  function show() {
    var it = items[i];
    img.src = it.src;
    img.alt = it.alt || it.title || '';
    titleEl.textContent = it.title || '';
    capEl.textContent = it.caption || '';
    countEl.textContent = (i + 1) + ' / ' + items.length;
    var many = items.length > 1;
    prevBtn.hidden = !many; nextBtn.hidden = !many;
    [i + 1, i - 1].forEach(function (n) { // warm up the neighbours
      var k = (n + items.length) % items.length;
      if (items[k]) { var p = new Image(); p.src = items[k].src; }
    });
  }
  function go(step) { if (items.length < 2) return; i = (i + step + items.length) % items.length; show(); }
  function open(list, start) {
    if (!el) build();
    items = list || []; if (!items.length) return;
    i = Math.max(0, Math.min(start || 0, items.length - 1));
    lastFocus = document.activeElement;
    el.hidden = false;
    document.documentElement.classList.add('lb-open');
    show();
    closeBtn.focus({ preventScroll: true });
  }
  function close() {
    el.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  global.Lightbox = { open: open, close: close };
})(window);
