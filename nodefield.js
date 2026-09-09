/**
 * NodeField — interactive particle network background.
 *
 * Vanilla port of the component built for 10thhub. A field of nodes drifts
 * across the viewport; any two within LINK_DIST are joined by a hairline whose
 * opacity falls off with distance, so the mesh continuously forms and
 * dissolves. The pointer pushes nodes away inside INFLUENCE and they ease back
 * onto their drift once it leaves.
 *
 * LIGHT-THEME TUNING. The original renders light lines on a deep blue ground.
 * Dark lines on white read far heavier at the same alpha, so the values here
 * are roughly a third of the original and the palette comes from the brand
 * green via CSS custom properties (--nf-line / --nf-node in style.css), not
 * from hardcoded colours in this file.
 *
 * PLACEMENT. The canvas is `position: fixed; z-index: -1; pointer-events: none`
 * and is prepended to <body>. For a negative z-index layer to be visible at
 * all, the page background has to sit on <html> rather than <body> — style.css
 * does that. Sections that set their own background (`.section--dark`,
 * `.section--surface`, cards) stay opaque and mask the field; the plain
 * `.section` blocks and the hero are transparent and let it through. That
 * alternation is deliberate: the network reads in the open areas and gets out
 * of the way behind the solid bands.
 *
 * The canvas never receives events (pointer-events: none, and the pointer is
 * tracked on window), so it cannot intercept a click anywhere on the site.
 *
 * Cost control:
 *   - node count scales with viewport area, capped hard on small screens
 *   - devicePixelRatio clamped to 2
 *   - the rAF loop stops entirely while the tab is hidden
 *   - resize is debounced (it reallocates the node array + backing store)
 *   - prefers-reduced-motion paints ONE static frame and starts no loop
 */
(function () {
  'use strict';

  var LINK_DIST = 148;   /* max px between two nodes for a line */
  var INFLUENCE = 170;   /* px radius in which the pointer pushes */
  var REPEL = 0.9;       /* how hard it pushes */
  var RETURN = 0.035;    /* how fast a pushed node eases back to its drift */
  var AREA_PER_NODE = 15000;

  /* Light theme: roughly a third of the original alphas, or the mesh
     overpowers body copy sitting on top of it. Both numbers are contrast
     limits, not taste:
       LINE 0.16 -> a line behind --muted #5E625E leaves 5.01:1 (AA needs 4.5)
       NODE 0.20 -> a dot landing directly behind --muted leaves 4.52:1
     At the original 0.42 a dot dropped muted text to 3.07:1. Raise either of
     these and re-check against --muted, which is the tightest text on the
     site (6.2:1 on plain white). */
  var LINE_ALPHA = 0.16;
  var NODE_ALPHA = 0.20;

  var canvas = document.createElement('canvas');
  canvas.className = 'node-field';
  canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext && canvas.getContext('2d', { alpha: true });
  if (!ctx) return; /* no 2d context: leave the page exactly as it was */
  document.body.insertBefore(canvas, document.body.firstChild);

  var reduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var nodes = [];
  var w = 0;
  var h = 0;
  var raf = 0;
  var resizeTimer = 0;
  var lineRGB = '16, 138, 0';
  var nodeRGB = '10, 107, 0';

  var pointer = { x: -9999, y: -9999, active: false };

  /* Palette lives in CSS so the two themes stay in one place. Values are
     expected as bare "r, g, b" triples. */
  function readPalette() {
    var cs = getComputedStyle(document.documentElement);
    var l = (cs.getPropertyValue('--nf-line') || '').trim();
    var n = (cs.getPropertyValue('--nf-node') || '').trim();
    if (l) lineRGB = l;
    if (n) nodeRGB = n;
  }

  function build() {
    w = window.innerWidth;
    h = window.innerHeight;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); /* draw in CSS px */

    var target = Math.round((w * h) / AREA_PER_NODE);
    /* The pair loop is O(n^2), and on a narrow screen extra nodes just read as
       noise at that mesh scale. */
    var max = w < 640 ? 46 : w < 1024 ? 80 : 140;
    var count = Math.max(24, Math.min(target, max));

    nodes = [];
    for (var i = 0; i < count; i++) {
      var angle = Math.random() * Math.PI * 2;
      var speed = 0.09 + Math.random() * 0.16;
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        bvx: Math.cos(angle) * speed, /* permanent drift */
        bvy: Math.sin(angle) * speed,
        r: 0.9 + Math.random() * 1.5
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* Lines first, so each dot sits on top of its own connections. */
    ctx.lineWidth = 1;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j];
        var dx = a.x - b.x;
        var dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > LINK_DIST * LINK_DIST) continue; /* squared compare, no sqrt */
        var d = Math.sqrt(d2);
        /* Fade with distance so the mesh dissolves instead of popping when a
           link crosses the threshold. */
        var alpha = (1 - d / LINK_DIST) * LINE_ALPHA;
        ctx.strokeStyle = 'rgba(' + lineRGB + ', ' + alpha + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    ctx.fillStyle = 'rgba(' + nodeRGB + ', ' + NODE_ALPHA + ')';
    for (var k = 0; k < nodes.length; k++) {
      var n = nodes[k];
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];

      if (pointer.active) {
        var dx = n.x - pointer.x;
        var dy = n.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < INFLUENCE * INFLUENCE && d2 > 0.01) {
          var d = Math.sqrt(d2);
          /* Linear falloff, strongest at the cursor. Dividing by d turns the
             offset into a unit direction before scaling by force. */
          var force = (1 - d / INFLUENCE) * REPEL;
          n.vx += (dx / d) * force;
          n.vy += (dy / d) * force;
        }
      }

      /* Ease back onto the permanent drift — this is what makes the field
         settle after the pointer leaves rather than accelerate away. */
      n.vx += (n.bvx - n.vx) * RETURN;
      n.vy += (n.bvy - n.vy) * RETURN;

      n.x += n.vx;
      n.y += n.vy;

      /* Wrap with a margin so a node re-enters mid-link instead of at the
         very edge. */
      var m = LINK_DIST;
      if (n.x < -m) n.x = w + m;
      else if (n.x > w + m) n.x = -m;
      if (n.y < -m) n.y = h + m;
      else if (n.y > h + m) n.y = -m;
    }
    draw();
    raf = window.requestAnimationFrame(step);
  }

  function start() {
    if (raf || reduced) return;
    raf = window.requestAnimationFrame(step);
  }
  function stop() {
    if (!raf) return;
    window.cancelAnimationFrame(raf);
    raf = 0;
  }

  function onPointerMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  }
  function onPointerLeave() {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
  }
  function onTouchMove(e) {
    var t = e.touches && e.touches[0];
    if (!t) return;
    pointer.x = t.clientX;
    pointer.y = t.clientY;
    pointer.active = true;
  }
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      build();
      draw();
    }, 180);
  }
  function onVisibility() {
    if (document.hidden) stop();
    else start();
  }

  readPalette();
  build();
  draw();
  canvas.setAttribute('data-ready', 'true');

  window.addEventListener('resize', onResize, { passive: true });

  if (reduced) return; /* one composed still frame, no loop, no pointer */

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('touchend', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);
  start();
})();
