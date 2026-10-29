/* script.js: the small bits of motion on the page.
   1. A paint stroke follows the brush cursor and slowly fades away.
   2. The mouse wheel scrolls the project stamps sideways. */

// 1. Paint trail (mouse and trackpad only; skipped for touch screens and reduced motion)
(function () {
  var canDraw = window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canDraw) return;

  var colors = ['#ff5b3a', '#ffc83d', '#5fa8ff', '#ff8fb3'];
  var colorIndex = 0;
  var canvas = document.createElement('canvas');
  canvas.className = 'paint';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  function resize() {
    var ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }
  resize();
  window.addEventListener('resize', resize);

  var last = null;
  var width = 10;
  var lastMove = 0;

  document.addEventListener('pointermove', function (e) {
    var now = performance.now();
    // A pause starts a new stroke in the next color
    if (now - lastMove > 400) {
      last = null;
      colorIndex = (colorIndex + 1) % colors.length;
    }
    lastMove = now;
    var point = { x: e.clientX, y: e.clientY };
    if (last) {
      var distance = Math.hypot(point.x - last.x, point.y - last.y);
      // Slow strokes are thick, fast strokes are thin, like a real brush
      var target = Math.max(4, 18 - distance * 0.35);
      width += (target - width) * 0.3;
      ctx.strokeStyle = colors[colorIndex];
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }
    last = point;
  });
  document.addEventListener('pointerleave', function () { last = null; });

  // Fade the paint a little every frame, then wipe the faint leftovers once the brush rests
  function fade() {
    if (performance.now() - lastMove > 2500) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      requestAnimationFrame(fade);
      return;
    }
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.globalAlpha = 0.035;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    requestAnimationFrame(fade);
  }
  requestAnimationFrame(fade);
})();

// 2. Scroll the project stamps sideways with a normal mouse wheel
(function () {
  var strip = document.querySelector('.projects__grid');
  if (!strip) return;
  strip.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // trackpad already scrolls sideways
    var atStart = strip.scrollLeft <= 0 && e.deltaY < 0;
    var atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 1 && e.deltaY > 0;
    if (atStart || atEnd) return; // let the page keep scrolling
    e.preventDefault();
    strip.scrollLeft += e.deltaY;
  }, { passive: false });
})();
