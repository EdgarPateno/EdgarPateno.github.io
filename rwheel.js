/* ── REVIEW WHEEL ──
   Turns the plain review list into a 3D rolling drum: one turn every 60s,
   front card lit, back cards faded (opacity only, never aria-hidden).
   Pauses on mouse hover, keyboard focus, the pause button (WCAG 2.2.2),
   an expanded card, or while off-screen. Click / tap / Enter expands the
   front card to its full text; Esc, a second tap or a tap outside collapses
   it. Arrow / Page keys step one card. prefers-reduced-motion (also when it
   changes live) leaves the static scrollable list. */
(function () {
  var wrap = document.querySelector('[data-rwheel]');
  if (!wrap) return;
  var view = wrap.querySelector('[data-rwheel-view]');
  var drum = wrap.querySelector('[data-rwheel-drum]');
  var hint = wrap.querySelector('[data-rwheel-hint]');
  var btn = wrap.querySelector('[data-rwheel-toggle]');
  if (!view || !drum) return;
  var cards = Array.prototype.slice.call(drum.children);
  var n = cards.length;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)');
  var live = null;

  function setHint(on) {
    if (!hint) return;
    hint.textContent = on ? (FINE.matches ? wrap.dataset.hintMouse : wrap.dataset.hintTouch) : wrap.dataset.hintStatic;
  }
  function start() {
    if (live || n < 3 || RM.matches) { if (!live) setHint(false); return; }
    live = build();
  }
  function stop() {
    if (live) { live.destroy(); live = null; }
    setHint(false);
  }
  if (RM.addEventListener) RM.addEventListener('change', function () { if (RM.matches) stop(); else start(); });
  start();

  function build() {
    /* a short list is repeated so the drum stays dense; the copies are
       hidden from screen readers, which read each original once */
    var clones = [];
    while (cards.length + clones.length < 10) {
      cards.forEach(function (c) {
        var k = c.cloneNode(true);
        k.setAttribute('aria-hidden', 'true');
        drum.appendChild(k);
        clones.push(k);
      });
    }
    var all = cards.concat(clones);
    var N = all.length;
    var ac = new AbortController();
    var sig = { signal: ac.signal };
    var step = 360 / N;
    var speed = 360 / 60;            /* degrees per second */
    var h = 200, r = 0, ang = 0, last = 0, raf = 0;
    var visible = !('IntersectionObserver' in window);
    var hover = false, kbFocus = false, user = false, expanded = null;
    var ops = all.map(function () { return -1; });
    var more = all.map(function (c) {
      var m = document.createElement('span');
      m.className = 'rwheel__more';
      m.setAttribute('aria-hidden', 'true');
      m.textContent = 'Read more';
      c.appendChild(m);
      return m;
    });

    wrap.classList.add('is-live');
    if (btn) { btn.hidden = false; btn.setAttribute('aria-pressed', 'false'); }
    setHint(true);

    function paused() { return hover || kbFocus || user || !!expanded; }
    function base(i) { return 'rotateX(' + (-i * step) + 'deg) translateZ(' + r + 'px)'; }
    function lift(i) { return base(i) + ' translateY(calc((' + h + 'px - 100%) / 2))'; }

    function layout() {
      h = window.innerWidth <= 640 ? 210 : 200;
      /* radius so neighbouring cards meet with a small gap */
      r = Math.round((h / 2 + 8) / Math.tan(Math.PI / N));
      all.forEach(function (c, i) {
        c.style.setProperty('--qh', h + 'px');
        c.style.transform = c === expanded ? lift(i) : base(i);
        var q = c.querySelector('q');
        c.classList.toggle('is-clamped', !!q && q.scrollHeight > q.clientHeight + 1);
      });
    }
    function apply() {
      drum.style.transform = 'translateZ(' + (-r) + 'px) rotateX(' + ang.toFixed(3) + 'deg)';
      all.forEach(function (c, i) {
        var a = ((((ang - i * step) % 360) + 540) % 360) - 180;
        var k = Math.cos(a * Math.PI / 180);
        var o = c === expanded ? 1 : (k <= 0 ? 0 : 0.15 + 0.85 * k * k);
        /* only write when it moves by more than 0.02 */
        if (Math.abs(o - ops[i]) > 0.02 || (o === 0 && ops[i] !== 0) || (o === 1 && ops[i] !== 1)) {
          c.style.opacity = o.toFixed(3);
          ops[i] = o;
        }
      });
    }
    function frame(t) {
      raf = 0;
      var dt = last ? Math.min(64, t - last) : 0;
      last = t;
      if (!paused()) ang = (ang + speed * dt / 1000) % 360;
      apply();
      if (visible && !paused()) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() {
      if (!raf && visible && !paused()) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function frontIndex() { return ((Math.round(ang / step) % N) + N) % N; }
    function goTo(i, smooth) {
      ang = (((i * step) % 360) + 360) % 360;
      if (smooth) {
        drum.style.transition = 'transform .35s cubic-bezier(.2,.7,.2,1)';
        setTimeout(function () { drum.style.transition = ''; }, 380);
      }
      apply();
    }
    function setUser(v) {
      user = v;
      if (!user) { hover = false; kbFocus = false; }
      if (btn) btn.setAttribute('aria-pressed', String(user));
      kick();
    }
    function expand() {
      if (expanded) return;
      var i = frontIndex();
      goTo(i, false);
      expanded = all[i];
      expanded.classList.add('is-expanded');
      wrap.classList.add('is-expanded');
      expanded.style.transform = lift(i);
      apply();
    }
    function collapse() {
      if (!expanded) return;
      var i = all.indexOf(expanded);
      expanded.classList.remove('is-expanded');
      expanded.style.transform = base(i);
      expanded = null;
      wrap.classList.remove('is-expanded');
      apply();
      kick();
    }

    layout();
    apply();

    wrap.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true; }, sig);
    wrap.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hover = false; kick(); } }, sig);
    function isKbFocus(el) { try { return el.matches(':focus-visible'); } catch (err) { return false; } }
    view.addEventListener('focusin', function (e) { if (e.target === view && isKbFocus(e.target)) kbFocus = true; }, sig);
    view.addEventListener('focusout', function () { kbFocus = false; kick(); }, sig);
    view.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.rwheel__card')) return;
      if (expanded) collapse(); else expand();
    }, sig);
    view.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'Enter' || k === ' ') { e.preventDefault(); if (expanded) collapse(); else expand(); return; }
      if (k === 'Escape' && expanded) { e.preventDefault(); collapse(); return; }
      if (k === 'ArrowDown' || k === 'PageDown' || k === 'ArrowUp' || k === 'PageUp') {
        e.preventDefault();
        if (expanded) collapse();
        goTo(frontIndex() + (k === 'ArrowDown' || k === 'PageDown' ? 1 : -1), true);
      }
    }, sig);
    document.addEventListener('pointerdown', function (e) {
      if (expanded && !wrap.contains(e.target)) collapse();
    }, { capture: true, signal: ac.signal });
    if (btn) btn.addEventListener('click', function () { setUser(!user); }, sig);

    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible = e.isIntersecting; if (visible) kick(); });
      }, { rootMargin: '50px 0px' });
      io.observe(wrap);
    } else kick();

    /* re-measure on width changes only (mobile URL bar resizes height) */
    var lastW = window.innerWidth, rt = 0;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;
      lastW = window.innerWidth;
      clearTimeout(rt);
      rt = setTimeout(function () { layout(); apply(); setHint(true); }, 150);
    }, sig);

    return {
      destroy: function () {
        ac.abort();
        clearTimeout(rt);
        if (io) io.disconnect();
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        collapse();
        more.forEach(function (m) { m.remove(); });
        clones.forEach(function (k) { k.remove(); });
        wrap.classList.remove('is-live', 'is-expanded');
        drum.style.transform = '';
        drum.style.transition = '';
        cards.forEach(function (c) {
          c.style.transform = '';
          c.style.opacity = '';
          c.style.removeProperty('--qh');
          c.classList.remove('is-clamped');
        });
        if (btn) btn.hidden = true;
      }
    };
  }
})();
