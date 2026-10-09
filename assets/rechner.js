(function () {
  var root = document.getElementById('rechner');
  if (!root) return;
  var P = JSON.parse(root.getAttribute('data-paket'));
  var EX = [
    { id: 'tier', label: 'Tierhaare, Hundehaare etc.', short: 'Tierhaare', min: 50, max: 100 },
    { id: 'spezial', label: 'Schimmel, Erbrochenes, Milch, Nikotin, Baustellenfahrzeug', short: 'Spezialverschmutzung', min: 50, max: 100 },
    { id: 'lack', label: 'Lackreinigung (Baumharz, intensive Insektenreinigung)', short: 'Lackreinigung', anfrage: true },
    { id: 'motor', label: 'Motorreinigung', short: 'Motorreinigung', min: 50, max: 50 },
    { id: 'hb5', label: 'Hol- & Bringservice – bis 5 km', short: 'Hol & Bring bis 5 km', min: 40, max: 40, group: 'hb' },
    { id: 'hb10', label: 'Hol- & Bringservice – bis 10 km', short: 'Hol & Bring bis 10 km', min: 55, max: 55, group: 'hb' },
    { id: 'hb15', label: 'Hol- & Bringservice – bis 15 km', short: 'Hol & Bring bis 15 km', min: 65, max: 65, group: 'hb' },
    { id: 'kratzer', label: 'Tiefkratzerentfernung + Lackierung', short: 'Tiefkratzer + Lackierung', anfrage: true }
  ];
  var state = { veh: 'PKW', sel: {} };

  function fmt(a, b) { return a === b ? a + ' €' : a + ' – ' + b + ' €'; }
  function priceOf(x) { return x.anfrage ? 'auf Anfrage' : fmt(x.min, x.max); }
  function isFrom(v) { return !!(P.from && P.from[v]); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var vehRow = root.querySelector('[data-veh]');
  var optBox = root.querySelector('[data-opts]');
  var countEl = root.querySelector('[data-count]');
  var lines = root.querySelector('[data-lines]');
  var totalEl = root.querySelector('[data-total]');
  var anfrageEl = root.querySelector('[data-anfrage]');
  var bookEl = root.querySelector('[data-book]');

  ['PKW', 'SUV', 'VAN'].forEach(function (v) {
    var b = el('button', 'veh');
    b.type = 'button';
    b.appendChild(el('span', 'veh-l', v));
    b.appendChild(el('span', 'veh-p', (isFrom(v) ? 'ab ' : '') + P.prices[v] + ' €'));
    b.addEventListener('click', function () { state.veh = v; render(); });
    b.setAttribute('data-v', v);
    vehRow.appendChild(b);
  });

  EX.forEach(function (x) {
    var l = el('label', 'opt');
    var i = document.createElement('input');
    i.type = 'checkbox';
    i.addEventListener('change', function () {
      if (state.sel[x.id]) { delete state.sel[x.id]; }
      else {
        if (x.group) EX.forEach(function (o) { if (o.group === x.group) delete state.sel[o.id]; });
        state.sel[x.id] = true;
      }
      render();
    });
    l.appendChild(i);
    l.appendChild(el('span', null, x.label));
    l.appendChild(el('span', 'opt-price', priceOf(x)));
    l.setAttribute('data-x', x.id);
    optBox.appendChild(l);
  });

  function render() {
    var veh = state.veh, from = isFrom(veh), base = P.prices[veh];
    vehRow.querySelectorAll('.veh').forEach(function (b) {
      var on = b.getAttribute('data-v') === veh;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    optBox.querySelectorAll('.opt').forEach(function (l) {
      var on = !!state.sel[l.getAttribute('data-x')];
      l.classList.toggle('on', on);
      l.querySelector('input').checked = on;
    });
    var picked = EX.filter(function (x) { return state.sel[x.id]; });
    var min = base, max = base, anfrage = false;
    picked.forEach(function (x) { if (x.anfrage) anfrage = true; else { min += x.min; max += x.max; } });
    var total = from ? 'ab ' + min + ' €' : fmt(min, max);

    countEl.textContent = picked.length ? picked.length + ' gewählt' : EX.length + ' Optionen';
    lines.innerHTML = '';
    function addLine(a, b) {
      var d = el('div', 'sum-line');
      d.appendChild(el('span', null, a));
      d.appendChild(el('strong', null, b));
      lines.appendChild(d);
    }
    addLine('Paket ' + P.name + ' · ' + veh, (from ? 'ab ' : '') + base + ' €');
    picked.forEach(function (x) { addLine(x.short, priceOf(x)); });
    if (totalEl.textContent && totalEl.textContent !== total) {
      totalEl.classList.remove('pop');
      void totalEl.offsetWidth;
      totalEl.classList.add('pop');
    }
    totalEl.textContent = total;
    anfrageEl.hidden = !anfrage;

    var parts = ['Paket: ' + P.name, 'Fahrzeug: ' + veh];
    if (picked.length) parts.push('Extras: ' + picked.map(function (x) { return x.short + ' (' + priceOf(x) + ')'; }).join(', '));
    parts.push('Richtpreis: ' + total + (anfrage ? ' + Positionen auf Anfrage' : '') + ' (Website-Rechner)');
    bookEl.href = 'https://cal.eu/adlerwash/' + P.slug + '?notes=' + encodeURIComponent(parts.join(' | '));
  }
  render();
})();
