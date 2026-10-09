(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sportwagen auf der Fahrbahn oben
  var road = document.createElement('div');
  road.className = 'fx-road';
  road.setAttribute('aria-hidden', 'true');
  var wheel = function (cx) {
    var spokes = [0, 72, 144, 216, 288].map(function (a) {
      var r = a * Math.PI / 180;
      return 'M' + cx + ' 32L' + (cx + 4.4 * Math.cos(r)).toFixed(2) + ' ' + (32 + 4.4 * Math.sin(r)).toFixed(2);
    }).join('');
    return '<g class="w" data-cx="' + cx + '"><circle cx="' + cx + '" cy="32" r="8.4" fill="#0E0E0E"/>' +
      '<circle cx="' + cx + '" cy="32" r="5.2" fill="#2A2A2A" stroke="#C9A24A" stroke-width="1.4"/>' +
      '<path d="' + spokes + '" stroke="#C9A24A" stroke-width="1.4" stroke-linecap="round"/></g>';
  };
  road.innerHTML =
    '<div class="fx-road-line"></div><div class="fx-road-fill"></div>' +
    '<div class="fx-car"><div class="fx-speed"><i></i><i></i><i></i></div>' +
    '<svg viewBox="0 0 120 41" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M8 20.8V22.6" stroke="#141414" stroke-width="1.6"/>' +
    '<path d="M3 27C3 24 6 22 14 21L30 19C40 13 52 10 64 10C74 10 82 13 92 18L108 21C114 22 117 24 117 27V29C117 31 115 32 113 32H103A10 10 0 0 0 83 32H39A10 10 0 0 0 19 32H7C4 32 3 30 3 28Z" fill="#C9A24A" stroke="#7A5B17" stroke-width="1.2"/>' +
    '<path d="M38 18C45 13.5 55 12 64 12C71 12 77 14 84 18Z" fill="#141414"/>' +
    '<path d="M63 12V18" stroke="#C9A24A" stroke-width="1.4"/>' +
    '<path d="M2.5 19.2H13.5V21H2.5Z" fill="#141414"/>' +
    '<path d="M69 23.5H80L78 26.5H71Z" fill="#141414" opacity=".75"/>' +
    '<path d="M8 25.5H112" stroke="#E7CB86" stroke-width="1" opacity=".85"/>' +
    '<path d="M110 22.6L116.5 24.6V25.8L110 24.4Z" fill="#FFF7DE"/>' +
    '<rect x="3.5" y="23.2" width="4" height="2.2" rx="1.1" fill="#B3261E"/>' +
    wheel(29) + wheel(93) + '</svg></div>';
  document.body.appendChild(road);
  var car = road.querySelector('.fx-car'), fill = road.querySelector('.fx-road-fill');
  var wheels = road.querySelectorAll('.w');
  var lastX = -90, lastY = window.scrollY, stopT = null, introDone = false;

  function carX(p) { return p * (window.innerWidth - car.offsetWidth); }
  function spin(x) {
    var a = (x / (Math.PI * 16.8)) * 360 * (120 / (car.offsetWidth || 72));
    wheels.forEach(function (w) { var c = w.getAttribute('data-cx'); w.setAttribute('transform', 'rotate(' + a.toFixed(1) + ' ' + c + ' 32)'); });
  }
  function progress() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    return h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
  }
  function place(x) {
    car.style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    spin(x);
    lastX = x;
  }
  function onScroll() {
    var p = progress();
    fill.style.transform = 'scaleX(' + p + ')';
    if (!introDone) return;
    var y = window.scrollY;
    if (y !== lastY) car.classList.toggle('back', y < lastY);
    lastY = y;
    car.classList.add('moving');
    clearTimeout(stopT);
    stopT = setTimeout(function () { car.classList.remove('moving'); }, 180);
    place(carX(p));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { if (introDone) place(carX(progress())); });
  onScroll();

  // Einfahrt: einmal quer über die Navigation, dann von links auf die Scroll-Position
  function tween(from, to, dur, ease, done) {
    var t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      place(from + (to - from) * ease(k));
      if (k < 1) requestAnimationFrame(step); else if (done) done();
    }
    requestAnimationFrame(step);
  }
  var inOut = function (k) { return k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; };
  var outCubic = function (k) { return 1 - Math.pow(1 - k, 3); };
  function intro() {
    if (reduce) { introDone = true; place(carX(progress())); return; }
    var off = -car.offsetWidth - 40;
    car.classList.add('moving');
    tween(off, window.innerWidth + 40, 2200, inOut, function () {
      tween(off, carX(progress()), 1000, outCubic, function () {
        car.classList.remove('moving');
        introDone = true;
        onScroll();
        car.classList.remove('moving');
      });
    });
  }
  place(-car.offsetWidth - 40);
  setTimeout(intro, 500);

  // Sterne einzeln funkeln lassen
  document.querySelectorAll('span[aria-hidden="true"]').forEach(function (s) {
    if (!/^★+$/.test(s.textContent.trim())) return;
    var n = s.textContent.trim().length;
    s.textContent = '';
    for (var i = 0; i < n; i++) {
      var e = document.createElement('span');
      e.className = 'fx-star';
      e.style.animationDelay = (i * 0.18) + 's';
      e.textContent = '★';
      s.appendChild(e);
    }
  });

  if (reduce || !('IntersectionObserver' in window)) return;

  // Elemente, die beim Scrollen einblenden
  var groups = [
    'section h2', 'section .eyebrow', '.pk', '.price', '.other', '.info > div', '.steps > div',
    '.checks li', 'details', '.cfg > *', '.ptable', '#bewertungen .wrap > *', '#kontakt .wrap > div',
    '#ueber-uns .split > div > *'
  ];
  var wipes = ['.gallery img', '.split > img.cover', '.split > video', '#ueber-uns img.cover'];

  var vh = window.innerHeight;
  var targets = [];
  function prep(el, wipe) {
    if (el.closest('.hero') || el.closest('.sub-hero') || el.dataset.fx) return;
    if (el.getBoundingClientRect().top < vh * 0.92) return; // schon sichtbar: nicht verstecken
    el.dataset.fx = '1';
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.dataset.fx; });
    el.style.setProperty('--d', Math.min(sibs.length - 1, 6) * 0.09 + 's');
    if (wipe) el.classList.add('fx-wipe');
    el.classList.add('fx-pre');
    targets.push(el);
  }
  wipes.forEach(function (s) { document.querySelectorAll(s).forEach(function (el) { prep(el, true); }); });
  groups.forEach(function (s) { document.querySelectorAll(s).forEach(function (el) { prep(el, false); }); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('fx-in');
      en.target.classList.remove('fx-pre');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });

  // Zahlen hochzählen (15+, 4,9, 100 %)
  function countUp(el) {
    var node = el.firstChild;
    if (!node || node.nodeType !== 3) return;
    var m = node.nodeValue.match(/^(\d+)(?:,(\d))?(.*)$/);
    if (!m) return;
    var target = parseFloat(m[1] + (m[2] ? '.' + m[2] : ''));
    var dec = m[2] ? 1 : 0, rest = m[3], t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = (target * e).toFixed(dec).replace('.', ',') + rest;
      if (p < 1) requestAnimationFrame(step);
    }
    node.nodeValue = (0).toFixed(dec).replace('.', ',') + rest;
    requestAnimationFrame(step);
  }
  var counters = [];
  document.querySelectorAll('#ueber-uns strong, #bewertungen span').forEach(function (el) {
    var f = el.firstChild;
    if (f && f.nodeType === 3 && /^\d+(,\d)?(\+| %| )?\s*$/.test(f.nodeValue)) counters.push(el);
  });
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      countUp(en.target);
      cio.unobserve(en.target);
    });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { cio.observe(el); });
})();
