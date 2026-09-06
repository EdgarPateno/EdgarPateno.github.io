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
