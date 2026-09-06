(function () {
  'use strict';

  /* ── STICKY NAV ── */
  var nav = document.getElementById('nav');
  if (nav) {
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── HAMBURGER / MOBILE MENU ── */
  var burger = document.querySelector('.nav__hamburger');
  var mobileMenu = document.querySelector('.nav__mobile');
  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      mobileMenu.classList.toggle('open', !open);
    });
    mobileMenu.querySelectorAll('.nav__link').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
      });
    });
    /* close on outside click */
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) {
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('open');
      }
    });
  }

  /* ── ACTIVE NAV LINK ── */
  var page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link').forEach(function (a) {
    if (a.getAttribute('href') === page) {
      a.classList.add('active');
    }
  });

  /* ── FADE-IN ON SCROLL ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('vis');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fi').forEach(function (el) {
      io.observe(el);
    });
  } else {
    /* fallback: show all immediately */
    document.querySelectorAll('.fi').forEach(function (el) {
      el.classList.add('vis');
    });
  }

  /* ── HERO STAT COUNTER ── */
  function animateCounter(el) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var original = el.textContent.trim();
    var match = original.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
    if (!match) return;
    var prefix = match[1], target = parseInt(match[2], 10), suffix = match[3];
    var duration = 1600, startTime = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / duration, 1);
      el.textContent = prefix + Math.round(ease(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = original;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.hero__stat-num').forEach(function (el) { cio.observe(el); });
  }

  /* ── MARQUEE SIZING ──────────────────────────────────────────
     Each track ships two identical halves and animates translateX(-50%).
     That only looks seamless if ONE half is at least as wide as its
     container — otherwise the content runs out mid-scroll, leaves a blank
     strip, and visibly snaps back at the wrap.

     A fixed number of copies can't satisfy that at every screen width, so
     clone the canonical set until one half covers the container, then
     mirror it. Re-runs on resize.                                        */
  function primeMarquee(track) {
    if (!track || !track.parentElement) return;

    /* Cache the canonical set once — the markup ships it twice. */
    if (!track.__set) {
      var kids = Array.prototype.slice.call(track.children);
      if (!kids.length) return;
      track.__set = kids.slice(0, Math.ceil(kids.length / 2))
                        .map(function (n) { return n.cloneNode(true); });
    }
    var set = track.__set;
    if (!set.length) return;

    var need = track.parentElement.clientWidth;
    if (!need) return;

    track.textContent = '';
    var perHalf = 0;
    do {
      set.forEach(function (n) { track.appendChild(n.cloneNode(true)); });
      perHalf++;
    } while (track.offsetWidth < need && perHalf < 20);

    /* Mirror so the shift lands exactly on the duplicate. */
    for (var i = 0; i < perHalf; i++) {
      set.forEach(function (n) { track.appendChild(n.cloneNode(true)); });
    }

    /* Publish the exact distance between duplicate starts, so the animation
       translates by that rather than by a percentage of the border box. */
    var first = track.children[0];
    var twin  = track.children[perHalf * set.length];
    if (first && twin) {
      var shift = twin.getBoundingClientRect().left - first.getBoundingClientRect().left;
      if (shift > 0) {
        track.style.setProperty('--marquee-shift', shift + 'px');

        /* Derive the duration from the distance so the on-screen speed stays
           constant. Cloning changes how far the track travels, so a fixed
           duration would make the marquee faster on wider screens. */
        var speed = parseFloat(getComputedStyle(track).getPropertyValue('--marquee-speed')) || 26;
        var duration = shift / speed;

        /* Restart so the keyframe picks up the new shift. */
        track.style.animation = 'none';
        void track.offsetWidth;
        track.style.animation = '';
        track.style.animationDuration = duration.toFixed(2) + 's';
      }
    }
  }

  var marqueeTracks = document.querySelectorAll('.proof-strip__track, .marquee__track');
  if (marqueeTracks.length) {
    var primeAll = function () { marqueeTracks.forEach(primeMarquee); };
    primeAll();

    /* Re-measure once the webfont actually applies. The font stylesheet is
       loaded async (rel=preload flipped to stylesheet onload), so
       document.fonts.ready can resolve BEFORE the @font-face is registered —
       it reports "loaded" while text is still in the fallback face, and every
       width measured then is wrong by ~90px.

       So watch an off-screen probe instead: when the real face applies, the
       probe's width changes and we re-prime. Self-correcting for any cause of
       reflow, and the probe is never touched by primeMarquee, so no recursion. */
    if (window.ResizeObserver) {
      var probe = document.createElement('span');
      probe.setAttribute('aria-hidden', 'true');
      probe.textContent = 'AVXWavxg0123456789';
      probe.style.cssText = 'position:absolute;left:-9999px;top:0;' +
                            'white-space:nowrap;font-size:2rem;pointer-events:none;';
      document.body.appendChild(probe);
      new ResizeObserver(primeAll).observe(probe);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(primeAll);
    window.addEventListener('load', primeAll);

    var lastW = window.innerWidth;
    var resizeTimer;
    window.addEventListener('resize', function () {
      if (window.innerWidth === lastW) return;   /* ignore mobile URL-bar height changes */
      lastW = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(primeAll, 200);
    }, { passive: true });
  }

  /* ── FORM VALIDATION + SUBMIT ── */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function fieldValid(field) {
    var val = field.value.trim();
    if (!val) return false;
    if (field.type === 'email' && !EMAIL_RE.test(val)) return false;
    return true;
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var sending = false;
    var successEl = form.dataset.success ? document.getElementById(form.dataset.success) : null;
    var failEl    = form.dataset.fail    ? document.getElementById(form.dataset.fail)    : null;
    var submitBtn = form.querySelector('[type="submit"]');
    var btnLabel  = submitBtn ? submitBtn.textContent : '';

    function showFail() {
      if (failEl) {
        failEl.hidden = false;
        failEl.scrollIntoView({ block: 'nearest' });
      }
    }
    function hideFail() { if (failEl) failEl.hidden = true; }

    form.addEventListener('submit', function (e) {
      /* No fetch support: let the browser POST natively to the form action. */
      if (typeof window.fetch !== 'function' || !form.getAttribute('action')) return;

      e.preventDefault();
      if (sending) return;
      hideFail();

      /* Honeypot — a filled hidden field means a bot. Fake success, send nothing. */
      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) {
        form.style.display = 'none';
        if (successEl) successEl.style.display = 'block';
        return;
      }

      var valid = true;
      var firstBad = null;
      form.querySelectorAll('[required]').forEach(function (field) {
        var grp = field.closest('.form__group');
        if (!fieldValid(field)) {
          valid = false;
          if (!firstBad) firstBad = field;
          if (grp) grp.classList.add('error');
        } else if (grp) {
          grp.classList.remove('error');
        }
      });

      if (!valid) {
        if (firstBad) firstBad.focus();
        return;
      }

      sending = true;
      if (submitBtn) {
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.textContent = 'Sending…';
      }

      fetch(form.getAttribute('action'), {
        method: (form.getAttribute('method') || 'POST').toUpperCase(),
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.style.display = 'none';
          if (successEl) {
            successEl.style.display = 'block';
            successEl.scrollIntoView({ block: 'nearest' });
          }
        })
        .catch(function () {
          showFail();
        })
        .then(function () {
          sending = false;
          if (submitBtn) {
            submitBtn.removeAttribute('aria-busy');
            submitBtn.textContent = btnLabel;
          }
        });
    });

    form.querySelectorAll('input,textarea,select').forEach(function (f) {
      f.addEventListener('input', function () {
        var grp = f.closest('.form__group');
        if (grp) grp.classList.remove('error');
        hideFail();
      });
    });
  });

})();
