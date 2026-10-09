(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll-Fortschritt
  var bar = document.createElement('div');
  bar.className = 'fx-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
