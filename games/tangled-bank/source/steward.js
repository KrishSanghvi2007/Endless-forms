/* ================= STEWARD MODE: the player is the environment ================= */
const last = a => a.length ? a[a.length - 1] : null;
const pctN = v => v == null ? '—' : pct(v);
const sgn3 = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(3);
const COL = { dark: { a: '#8aa0b8', b: '#46a19a', c: '#cf9a33' }, paper: { a: '#4f6478', b: '#2f7f7a', c: '#8a5d10' } };

const Steward = {
  sync: false, speeds: [0, 1, 4, 16],
  start(ch) {
    this.ch = ch; this.S = ch.init(); this.S.gen = 0; this.S.anim = 0; this.acc = 0; this.got = {}; this.done = false; this.free = false; this.tab = 0; this.lastRef = 0; this.dirty = true;
    this.panel(); ch.sync(this.S); this.setSpeed(1); this.refresh();
  },
  setSpeed(i) { this.speed = i; document.querySelectorAll('#speed button').forEach(b => b.classList.toggle('on', +b.dataset.s === i)); },
  update(dt) {
    const ch = this.ch, S = this.S;
    if (this.speed > 0 && !this.done) {
      this.acc += dt * this.speeds[this.speed]; let n = 0;
      while (this.acc >= ch.period && n < 30) { this.acc -= ch.period; this.step(); n++; if (this.done) break; }
      if (n >= 30) this.acc = 0;
    }
    S.anim += dt; ch.animate(S, dt, this.speed);
  },
  step() { const ch = this.ch, S = this.S; ch.step(S); S.gen++; ch.record(S); ch.sync(S); this.check(); this.dirty = true; },
  check() {
    const S = this.S;
    for (const o of this.ch.objectives) {
      if (!this.got[o.id] && o.test(S)) {
        this.got[o.id] = S.gen; Save.star(this.ch.id, Object.keys(this.got).length);
        if (!this.sync) { Snd.star(); toast('<b>★</b> ' + o.short); this.markObjs(); }
      }
    }
    const n = Object.keys(this.got).length;
    if (!this.free && (n === this.ch.objectives.length || S.gen >= this.ch.maxGen)) this.finish();
  },
  finish() {
    this.done = true; this.setSpeed(0); if (this.sync) return;
    const ch = this.ch, n = Object.keys(this.got).length; if (n) Snd.star(); else Snd.chime();
    this.refresh();
    const next = CHAPTERS[CHAPTERS.indexOf(ch) + 1];
    const btns = [{ t: 'Keep experimenting', fn: () => { Cards.close(); this.done = false; this.free = true; this.setSpeed(1); } }, { t: 'Notebook', fn: () => App.exit() }];
    if (next) btns.push({ t: 'Next: ' + next.title, primary: true, fn: () => { Cards.close(); App.open(next); } });
    else btns.push({ t: 'Play again', primary: true, fn: () => { Cards.close(); App.play(ch); } });
    Cards.open({
      cls: 'end',
      html: '<h3>' + (n === ch.objectives.length ? 'Chapter complete' : 'Time is up') + '</h3><div class="stars">' + starStr(n) + '</div>' + (ch.tabs[0].legendP || '') + '<canvas></canvas><p class="cap">' + ch.chartCap + '</p><h4>What happened</h4><p>' + ch.what(this.S) + '</p><h4>The real thing</h4><p class="basis">' + ch.intro.real + '</p>',
      buttons: btns, onOpen: box => ch.tabs[0].draw(box.querySelector('canvas'), this.S, 'paper')
    });
  },
  draw() { this.ch.draw(Stage.ctx, this.S, Stage.w, Stage.h); const now = performance.now(); if (this.dirty && now - this.lastRef > 160) this.refresh(); },
  refresh() {
    this.dirty = false; this.lastRef = performance.now();
    $('bar-gen').textContent = this.ch.unit(this.S.gen);
    const cv = $('s-chart'); if (cv) this.ch.tabs[this.tab].draw(cv, this.S, 'dark');
    const rd = $('s-read'); if (rd) rd.innerHTML = this.ch.readout(this.S);
    if (this.ch.refreshLevers) this.ch.refreshLevers(this.S);
  },
  panel() {
    const ch = this.ch;
    let h = '<ul class="objs" id="s-objs">' + ch.objectives.map(o => '<li data-o="' + o.id + '"><span class="s">☆</span><span>' + o.text + '</span></li>').join('') + '</ul>';
    h += '<div class="levers" id="s-lev">' + ch.leversHTML(this.S) + '</div>';
    h += '<div class="read" id="s-read"></div>';
    h += '<div class="tabs" id="s-tabs">' + ch.tabs.map((t, i) => '<button data-t="' + i + '"' + (i === 0 ? ' class="on"' : '') + '>' + t.label + '</button>').join('') + '</div><canvas class="chart" id="s-chart"></canvas><div class="legend" id="s-leg">' + (ch.tabs[0].legend || '') + '</div>';
    $('panel').innerHTML = h; ch.bind(this.S);
    $('s-tabs').querySelectorAll('button').forEach(b => b.onclick = () => { this.tab = +b.dataset.t; $('s-tabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); $('s-leg').innerHTML = ch.tabs[this.tab].legend || ''; Snd.click(); this.refresh(); });
  },
  markObjs() { document.querySelectorAll('#s-objs li').forEach(li => { const g = !!this.got[li.dataset.o]; li.classList.toggle('got', g); li.querySelector('.s').textContent = g ? '★' : '☆'; }); },
  tap(x, y) { if (this.ch.tap) this.ch.tap(this.S, x, y); },
  onResize() { this.dirty = true; }
};
const legend = (items) => items.map(([c, t]) => '<span><i style="background:' + c + '"></i>' + t + '</span>').join('');

/* ---------- Chapter IV: guppies, Endler's transplant ---------- */
function drawGuppy(c, x, y, hd, f, s) {
  c.save(); c.translate(x, y); c.rotate(hd); c.scale(s, s);
  if (f.sex === 'm') {
    const C = f.col;
    c.fillStyle = css(mix([168, 174, 166], [240, 116, 44], C), 0.92); c.beginPath(); c.moveTo(-3.4, 0); c.lineTo(-9, -3.4 - C * 1.4); c.lineTo(-9, 3.4 + C * 1.4); c.closePath(); c.fill();
    c.fillStyle = '#c3c8ba'; c.beginPath(); c.ellipse(0, 0, 4.4, 1.7, 0, 0, TAU); c.fill();
    const n = Math.round(C * 6), cols = ['#f07a2c', '#1c1a1a', '#4aa6e6'];
    for (let i = 0; i < n; i++) { c.fillStyle = cols[i % 3]; c.beginPath(); c.arc(2 - i * 1.05, i % 2 ? 0.55 : -0.55, 0.55 + C * 0.45, 0, TAU); c.fill(); }
  } else {
    c.fillStyle = 'rgba(160,164,140,.8)'; c.beginPath(); c.moveTo(-4.4, 0); c.lineTo(-8.2, -2.2); c.lineTo(-8.2, 2.2); c.closePath(); c.fill();
    c.fillStyle = '#8f9477'; c.beginPath(); c.ellipse(0, 0, 5.4, 2.2, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(40,36,30,.55)'; c.beginPath(); c.ellipse(-1, 0.6, 1.2, 0.8, 0, 0, TAU); c.fill();
  }
  c.fillStyle = '#111'; c.beginPath(); c.arc(f.sex === 'm' ? 3.3 : 4.2, -0.4, 0.45, 0, TAU); c.fill();
  c.restore();
}
function drawCichlid(c, x, y, hd, s) {
  c.save(); c.translate(x, y); c.rotate(hd); c.scale(s, s);
  c.fillStyle = '#34402b'; c.beginPath(); c.moveTo(-10, 0); c.lineTo(-16, -4.5); c.lineTo(-16, 4.5); c.closePath(); c.fill();
  c.fillStyle = '#46553a'; c.beginPath(); c.ellipse(0, 0, 12, 3.6, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(20,24,16,.6)'; c.lineWidth = 1; for (let i = -6; i <= 6; i += 4) { c.beginPath(); c.moveTo(i, -3); c.lineTo(i - 1, 3); c.stroke(); }
  c.fillStyle = '#d8c060'; c.beginPath(); c.arc(8.5, -1, 1.2, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(8.7, -1, 0.6, 0, TAU); c.fill();
  c.restore();
}
function wander(a, dt, sp, lim) {
  a.h += (R() - .5) * dt * 4; a.u += Math.cos(a.h) * sp * dt; a.v += Math.sin(a.h) * sp * dt;
  if (a.u * a.u + a.v * a.v > lim) { a.h = Math.atan2(-a.v, -a.u) + (R() - .5) * 0.9; const k = Math.sqrt(lim / (a.u * a.u + a.v * a.v)); a.u *= k; a.v *= k; }
}

const CH_ARIPO = {
  id: 'aripo', mode: 'steward', num: 'IV', title: 'Streams of Aripo', concept: 'Sexual selection',
  intro: {
    premise: 'In Trinidad’s Northern Range, guppies below the waterfalls share their pools with pike cichlids. Above the falls, only a small killifish hunts them. Female guppies prefer colourful males. So do pike cichlids.',
    part: 'Carry guppies over the falls, move the predators, and set the pace. Each tick is a generation; male colour and female preference are both heritable.',
    goal: 'Three experiments, one star each. They’re listed under the stream.',
    basis: 'John Endler’s guppy transplants on the Aripo River (1980).',
    real: 'Endler (1980) moved guppies from a pike-cichlid pool on the Aripo River to a stretch above a waterfall that had none. About two years later — roughly fifteen generations — the transplanted males carried more and larger colour spots. Reznick and colleagues later showed that the same transplants change life histories too: guppies released from pike cichlids evolved to mature later and larger. Where the preference itself came from is its own story: female guppies’ taste for orange may have begun as a bias for orange fruit (Rodd et al. 2002), which is why here it never quite drops to zero.'
  },
  period: 1.4, maxGen: 160, A: 2.7, BIAS: 0.3, BP: 5.2, BW: 0.35, K: [120, 90],
  traits: [{ k: 'col', n: 8, m0: 0.2, s0: 0.1, mu: 0.04, msd: 0.05, ve: 0.03 }, { k: 'pref', n: 6, m0: 0.5, s0: 0.1, mu: 0.03, msd: 0.05, ve: 0.03 }],
  unit: g => 'gen ' + g,
  init() {
    const lay = Gen.layout(this.traits.map(s => Object.assign({}, s)));
    const S = { lay, pools: [{ pred: true, fish: [] }, { pred: false, fish: [] }], moved: null, hist: { c0: [], c1: [], p0: [], p1: [] }, flags: {}, cich: [[], []] };
    for (let i = 0; i < this.K[0]; i++) S.pools[0].fish.push(this.mk(S, Gen.genome(lay), i % 2 ? 'm' : 'f', null));
    for (let i = 0; i < 30; i++) this.step(S);
    this.record(S); this.syncCich(S); return S;
  },
  mk(S, g, sex, mom) { const f = { g, sex, col: Gen.ph(S.lay, g, 'col'), pref: Gen.ph(S.lay, g, 'pref') }; if (mom && mom.a) f.a = { u: clamp(mom.a.u + (R() - .5) * .3, -.9, .9), v: clamp(mom.a.v + (R() - .5) * .3, -.9, .9), h: R() * TAU }; return f; },
  step(S) {
    for (let j = 0; j < 2; j++) {
      const P = S.pools[j]; if (!P.fish.length) continue;
      const b = P.pred ? this.BP : this.BW, males = [], fem = [];
      for (const f of P.fish) { if (f.sex === 'm') { if (R() < 0.9 * Math.exp(-b * f.col * f.col)) males.push(f); } else if (R() < (P.pred ? 0.75 : 0.9)) fem.push(f); }
      if (!males.length) { let best = null; for (const f of P.fish) if (f.sex === 'm' && (!best || f.col < best.col)) best = f; if (best) males.push(best); } // the drabbest male hides and survives
      if (!males.length || !fem.length) { P.fish = []; continue; }
      let mc = 0; for (const m of males) mc += m.col; mc /= males.length;
      const kids = [];
      for (const f of fem) { const w = males.map(m => Math.exp(this.A * (this.BIAS + f.pref) * (m.col - mc))); const k = poisson(4.0); for (let i = 0; i < k; i++) kids.push([Gen.mate(S.lay, f.g, males[wpick(w)].g), f]); }
      shuffle(kids); P.fish = kids.slice(0, this.K[j]).map(([g, mom]) => this.mk(S, g, R() < 0.5 ? 'm' : 'f', mom));
    }
  },
  mcol(P) { const m = P.fish.filter(f => f.sex === 'm'); return m.length ? mean(m.map(f => f.col)) : null; },
  fpref(P) { const f = P.fish.filter(f => f.sex === 'f'); return f.length ? mean(f.map(x => x.pref)) : null; },
  record(S) { const h = S.hist, c1 = this.mcol(S.pools[1]); h.c0.push(this.mcol(S.pools[0])); h.c1.push(c1); h.p0.push(this.fpref(S.pools[0])); h.p1.push(this.fpref(S.pools[1])); if (c1 != null && c1 >= 0.55) S.flags.upHigh = true; },
  objectives: [
    { id: 'endler', text: 'Endler’s transplant: males above the falls reach 55% colour while those below stay under 35%.', short: 'Endler’s result, reproduced.', test: S => { const c0 = last(S.hist.c0), c1 = last(S.hist.c1); return S.moved != null && c1 != null && c0 != null && c1 >= 0.55 && c0 <= 0.35; } },
    { id: 'release', text: 'Take the pike cichlids out of the lower pool and let its males pass 50%.', short: 'Released from predators, the lower pool brightened.', test: S => !S.pools[0].pred && last(S.hist.c0) != null && last(S.hist.c0) >= 0.5 },
    { id: 'reverse', text: 'Once males above the falls are bright, add pike cichlids there and drive them back under 30%.', short: 'Predators pulled colour back down.', test: S => S.flags.upHigh && S.pools[1].pred && last(S.hist.c1) != null && last(S.hist.c1) <= 0.3 }
  ],
  leversHTML() {
    return '<div class="lrow"><button class="btn" id="l-move">Carry 30 guppies above the falls</button></div>' +
      '<div class="lrow"><label for="l-p0">Pike cichlids below the falls</label><button class="tog" id="l-p0" aria-pressed="true">On</button></div>' +
      '<div class="lrow"><label for="l-p1">Pike cichlids above the falls</label><button class="tog" id="l-p1" aria-pressed="false">Off</button></div>';
  },
  bind(S) {
    $('l-move').onclick = () => { this.transplant(S); Steward.refresh(); };
    for (const j of [0, 1]) $('l-p' + j).onclick = () => { S.pools[j].pred = !S.pools[j].pred; this.syncCich(S); Snd.click(); this.refreshLevers(S); };
    this.refreshLevers(S);
  },
  refreshLevers(S) {
    const b = $('l-move'); if (b) { b.disabled = S.moved != null || S.pools[0].fish.length < 40; b.textContent = S.moved != null ? 'Carried over the falls at generation ' + S.moved : 'Carry 30 guppies above the falls'; }
    for (const j of [0, 1]) { const t = $('l-p' + j); if (t) { t.setAttribute('aria-pressed', S.pools[j].pred ? 'true' : 'false'); t.textContent = S.pools[j].pred ? 'On' : 'Off'; } }
  },
  transplant(S) {
    if (S.moved != null) return;
    const P = S.pools[0], ms = shuffle(P.fish.filter(f => f.sex === 'm')).slice(0, 15), fs = shuffle(P.fish.filter(f => f.sex === 'f')).slice(0, 15), mv = ms.concat(fs);
    P.fish = P.fish.filter(f => mv.indexOf(f) < 0);
    for (const f of mv) { f.a = { u: (R() - .5) * .6, v: (R() - .5) * .6, h: R() * TAU }; S.pools[1].fish.push(f); }
    S.moved = S.gen; if (!Steward.sync) { toast('Thirty guppies carried over the falls.'); Snd.chime(); }
  },
  syncCich(S) { for (const j of [0, 1]) { const want = S.pools[j].pred ? 2 : 0, a = S.cich[j]; while (a.length < want) a.push({ u: (R() - .5), v: (R() - .5) * .8, h: R() * TAU, dart: 0 }); a.length = want; } },
  sync(S) { for (const P of S.pools) for (const f of P.fish) if (!f.a) f.a = { u: (R() * 2 - 1) * .7, v: (R() * 2 - 1) * .7, h: R() * TAU }; },
  animate(S, dt) {
    for (const P of S.pools) for (const f of P.fish) if (f.a) wander(f.a, dt, f.sex === 'm' ? 0.24 : 0.17, 0.66);
    S.pools.forEach((P, j) => { for (const k of S.cich[j]) { k.dart = Math.max(0, k.dart - dt); if (k.dart <= 0 && R() < dt * 0.25) k.dart = 0.6; wander(k, dt, k.dart > 0 ? 0.55 : 0.09, 0.5); } });
  },
  geom(w, h) { return { P: [{ cx: w * 0.39, cy: h * 0.69, rx: w * 0.33, ry: h * 0.2 }, { cx: w * 0.64, cy: h * 0.27, rx: w * 0.31, ry: h * 0.18 }], fall: { x: w * 0.555, y: h * 0.475 } }; },
  bgFor(w, h, G) {
    const k = Math.round(w) + 'x' + Math.round(h) + '@' + Stage.dpr; if (this._bk === k) return this._bg;
    const d = Math.min(2, Stage.dpr), cv = mkCanvas(w * d, h * d), c = cv.getContext('2d'); c.scale(d, d); const r = rng(31);
    c.fillStyle = '#1f2c1d'; c.fillRect(0, 0, w, h);
    const lp = [[46, 64, 36], [58, 78, 40], [70, 62, 40], [36, 50, 30], [84, 90, 48]];
    for (let i = 0; i < w * h / 55; i++) { const x = r() * w, y = r() * h; c.fillStyle = css(lp[(r() * lp.length) | 0], 0.75); c.beginPath(); c.ellipse(x, y, 2 + r() * 6, 1 + r() * 2.6, r() * TAU, 0, TAU); c.fill(); }
    const a = { x: G.P[0].cx + G.P[0].rx * 0.52, y: G.P[0].cy - G.P[0].ry * 0.78 }, b = { x: G.P[1].cx - G.P[1].rx * 0.55, y: G.P[1].cy + G.P[1].ry * 0.72 };
    const chan = () => { c.beginPath(); c.moveTo(a.x, a.y); c.quadraticCurveTo(G.fall.x + 8, G.fall.y + 4, b.x, b.y); };
    c.lineCap = 'round'; c.strokeStyle = '#5b5846'; c.lineWidth = Math.min(w, h) * 0.11; chan(); c.stroke(); c.strokeStyle = '#285c60'; c.lineWidth = Math.min(w, h) * 0.06; chan(); c.stroke();
    for (const g of G.P) {
      c.fillStyle = '#5c5947'; c.beginPath(); c.ellipse(g.cx, g.cy, g.rx * 1.07, g.ry * 1.12, 0, 0, TAU); c.fill();
      for (let i = 0; i < 70; i++) { const t = r() * TAU, rr = 1.03 + r() * 0.06; c.fillStyle = css([90 + r() * 50, 86 + r() * 40, 70 + r() * 30]); c.beginPath(); c.ellipse(g.cx + Math.cos(t) * g.rx * rr, g.cy + Math.sin(t) * g.ry * rr, 1.5 + r() * 2.5, 1.2 + r() * 1.8, r() * 3, 0, TAU); c.fill(); }
      const gr = c.createRadialGradient(g.cx, g.cy - g.ry * 0.3, g.ry * 0.1, g.cx, g.cy, g.rx); gr.addColorStop(0, '#3d8783'); gr.addColorStop(1, '#1b474d');
      c.fillStyle = gr; c.beginPath(); c.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, TAU); c.fill();
      for (let i = 0; i < 26; i++) { c.fillStyle = 'rgba(20,50,50,.35)'; c.beginPath(); c.ellipse(g.cx + (r() - .5) * g.rx * 1.5, g.cy + (r() - .5) * g.ry * 1.4, 2 + r() * 4, 1.5 + r() * 2.5, r() * 3, 0, TAU); c.fill(); }
    }
    for (let i = 0; i < 8; i++) { c.fillStyle = css([112 + r() * 40, 108 + r() * 30, 92 + r() * 20]); c.beginPath(); c.ellipse(G.fall.x + (i - 3.5) * 6.5, G.fall.y + (i - 3.5) * 2.2 + (r() - .5) * 3, 4 + r() * 3, 3 + r() * 2, r(), 0, TAU); c.fill(); }
    c.font = 'italic 13px ' + getComputedStyle(document.body).getPropertyValue('--fb'); c.fillStyle = 'rgba(232,223,201,.78)'; c.textAlign = 'left';
    c.fillText('above the falls', Math.max(8, G.P[1].cx - G.P[1].rx * 1.02), Math.max(15, G.P[1].cy - G.P[1].ry * 1.14 - 6));
    c.textAlign = 'left'; c.fillText('below the falls', Math.max(8, G.P[0].cx - G.P[0].rx * 0.95), Math.min(h - 6, G.P[0].cy + G.P[0].ry * 1.12 + 15));
    this._bk = k; this._bg = cv; return cv;
  },
  draw(c, S, w, h) {
    const G = this.geom(w, h), s = clamp(Math.min(w, h) / 330, 0.9, 1.5); c.drawImage(this.bgFor(w, h, G), 0, 0, w, h);
    const t = S.anim; c.save(); c.strokeStyle = 'rgba(240,245,240,.8)'; c.lineWidth = 1.1;
    for (let i = 0; i < 6; i++) { c.globalAlpha = 0.25 + 0.25 * Math.sin(t * 7 + i * 1.7); const yy = G.fall.y - 6 + ((t * 26 + i * 5) % 12); c.beginPath(); c.arc(G.fall.x + (i - 2.5) * 5, yy, 2.5 + (i % 2), 0, Math.PI); c.stroke(); }
    c.restore();
    S.pools.forEach((P, j) => {
      const g = G.P[j];
      for (const f of P.fish) { if (!f.a) continue; drawGuppy(c, g.cx + f.a.u * g.rx, g.cy + f.a.v * g.ry, Math.atan2(Math.sin(f.a.h) * g.ry, Math.cos(f.a.h) * g.rx), f, s); }
      for (const k of S.cich[j]) drawCichlid(c, g.cx + k.u * g.rx, g.cy + k.v * g.ry, Math.atan2(Math.sin(k.h) * g.ry, Math.cos(k.h) * g.rx), s);
    });
  },
  tabs: [
    { label: 'Male colour', legend: legend([['#8aa0b8', 'below the falls'], ['#46a19a', 'above the falls']]), legendP: '<div class="leg"><span><i style="background:#4f6478"></i>below the falls</span><span><i style="background:#2f7f7a"></i>above the falls</span></div>', draw(cv, S, th) { const k = COL[th]; lineChart(cv, { theme: th, series: [{ d: S.hist.c0, c: k.a }, { d: S.hist.c1, c: k.b }], y0: 0, y1: 1, refs: [{ v: 0.55, label: '55%' }, { v: 0.35 }], fy: v => pct(v), xl: 'gen ' + (S.hist.c0.length - 1) }); } },
    { label: 'Female preference', legend: legend([['#8aa0b8', 'below the falls'], ['#46a19a', 'above the falls']]), draw(cv, S, th) { const k = COL[th]; lineChart(cv, { theme: th, series: [{ d: S.hist.p0, c: k.a }, { d: S.hist.p1, c: k.b }], y0: 0, y1: 1, fy: v => pct(v), xl: 'gen ' + (S.hist.p0.length - 1) }); } }
  ],
  readout(S) {
    const P0 = S.pools[0], P1 = S.pools[1];
    return 'Below the falls: <b>' + P0.fish.length + '</b> guppies, male colour <b>' + pctN(last(S.hist.c0)) + '</b>, female preference ' + pctN(last(S.hist.p0)) + '.<br>' +
      (P1.fish.length ? 'Above the falls: <b>' + P1.fish.length + '</b> guppies, male colour <b>' + pctN(last(S.hist.c1)) + '</b>, female preference ' + pctN(last(S.hist.p1)) + '.' : 'Above the falls: no guppies yet.');
  },
  chartCap: 'Average male colour, the share of body covered in spots.',
  what(S) {
    const c0 = last(S.hist.c0), c1 = last(S.hist.c1), p0 = last(S.hist.p0), p1 = last(S.hist.p1);
    let s = 'Male colour settles where two selectors balance: females reward it, pike cichlids punish it. ';
    if (S.moved != null && c1 != null) s += 'Above the falls males ended at ' + pct(c1) + ' colour, below at ' + pctN(c0) + '. ';
    if (p1 != null && p0 != null) s += 'Female preference drifted too — ' + pct(p0) + ' below, ' + pct(p1) + ' above — because choosy females end up carrying the genes of the colourful males they pick, so preference rides along with the trait it prefers. That coupling is the engine of Fisher’s runaway.';
    return s;
  }
};

/* ---------- Chapter V: the slow island (Y-model trade-off, mutation accumulation) ---------- */
function drawBeast(c, x, y, hd, age, s) {
  const k = (age < 1 ? 0.7 : 1) * s, fur = mix([112, 96, 80], [224, 218, 206], clamp((age - 1) / 5, 0, 1));
  c.save(); c.translate(x, y); c.rotate(hd); c.scale(k, k);
  c.strokeStyle = 'rgba(214,170,160,.8)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(-3.8, 0); c.quadraticCurveTo(-7, 2.2, -9, 0.5); c.stroke();
  c.fillStyle = css(fur); c.beginPath(); c.ellipse(0, 0, 4.2, 2.7, 0, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(4.2, 0, 2.1, 1.6, 0, 0, TAU); c.fill();
  c.fillStyle = '#e8c9c0'; c.beginPath(); c.arc(6.1, 0, 0.6, 0, TAU); c.fill();
  c.fillStyle = '#111'; c.beginPath(); c.arc(4.7, -0.8, 0.45, 0, TAU); c.fill();
  c.restore();
}
function drawFox(c, x, y, hd, s) {
  c.save(); c.translate(x, y); c.rotate(hd); c.scale(s, s);
  c.fillStyle = '#b8612a'; c.beginPath(); c.ellipse(-8, 1, 4.5, 2, 0.3, 0, TAU); c.fill(); c.fillStyle = '#efe6d6'; c.beginPath(); c.arc(-11.5, 2, 1.3, 0, TAU); c.fill();
  c.fillStyle = '#c96b2e'; c.beginPath(); c.ellipse(0, 0, 6.2, 2.9, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(4.5, -2); c.lineTo(10, 0); c.lineTo(4.5, 2); c.closePath(); c.fill();
  c.fillStyle = '#2a1a12'; c.beginPath(); c.moveTo(5, -2.2); c.lineTo(6.6, -4.2); c.lineTo(7, -1.6); c.fill(); c.beginPath(); c.moveTo(5, 2.2); c.lineTo(6.6, 4.2); c.lineTo(7, 1.6); c.fill();
  c.restore();
}
const CH_ISLAND = {
  id: 'island', mode: 'steward', num: 'V', title: 'The Slow Island', concept: 'Ageing and life history',
  intro: {
    premise: 'Every body splits a budget: breed now, or maintain itself for later. Where foxes kill you young anyway, maintenance is wasted — so mainland animals breed hard and wear out fast.',
    part: 'Found an island colony out of the foxes’ reach, then run the years at speed. Grey fur marks the old. Nobody chooses anything; the animals that leave more descendants set the pace of life.',
    goal: 'Three experiments, one star each.',
    basis: 'Steven Austad’s island opossums (1993).',
    real: 'Austad (1993) compared Virginia opossums on Sapelo Island, cut off from mainland predators for several thousand years, with mainland opossums. The island animals had smaller litters, lived longer, and their tail-tendon collagen stiffened more slowly with age — slower ageing, evolved. The logic is Medawar’s and Williams’s: where outside dangers cut lives short, selection is blind to what happens late in life.'
  },
  period: 0.9, maxGen: 1500, AMAX: 14, F: 4.0, C: 1.0, AL: 0.03, B0: 0.08, B1: 0.5, SD: 0.012, ME: 0.45, K: [170, 110],
  LATE0: [0.05, 0.1, 0.2, 0.4, 0.8, 1.5, 2.5, 3.5, 4.5, 5.5, 6, 6.5, 7, 7],
  fec(e) { return this.F * 1.3 * e / (e + 0.3); },
  traits: [{ k: 'eff', n: 8, m0: 0.45, s0: 0.06, mu: 0.04, msd: 0.04, ve: 0.02, lo: 0.02, hi: 0.98 }, { k: 'late', n: 14, kind: 'count', u: 0.012, cap: 8 }],
  unit: g => 'year ' + g,
  init() {
    const specs = this.traits.map(s => Object.assign({}, s)); specs[1].c0f = i => this.LATE0[i] / 2;
    const lay = Gen.layout(specs);
    const S = { lay, pops: [{ ind: [], fox: true }, { ind: [], fox: false, founded: null }], hist: { L0: [], L1: [], e0: [], e1: [], m0: [], m1: [] }, flags: {}, ghosts: [], foxes: [[], []], st: [null, null] };
    for (let i = 0; i < this.K[0]; i++) S.pops[0].ind.push(this.mk(S, Gen.genome(lay), (R() * 3) | 0));
    for (let y = 0; y < 300; y++) this.step(S);
    this.record(S); this.syncFox(S); return S;
  },
  mk(S, g, age) {
    const e = Gen.ph(S.lay, g, 'eff'), s = new Float32Array(this.AMAX + 1), beta = this.B0 + this.B1 * e; let lat = 0;
    for (let a = 0; a <= this.AMAX; a++) { let v = Math.exp(-this.AL * Math.exp(beta * a)); if (a >= 1) { v *= 1 - this.C * e * e; const k = Gen.cnt(S.lay, g, 'late', a - 1); v *= Math.pow(1 - this.SD, k); if (a >= 5) lat += k; } s[a] = v; }
    let l = 1, L = this.AMAX + 1; for (let a = 0; a <= this.AMAX; a++) { const nl = l * s[a]; if (nl < 0.5) { L = a + (l - 0.5) / (l - nl); break; } l = nl; }
    return { g, age: age || 0, eff: e, s, life: L, late: lat / 10 };
  },
  step(S) {
    for (let j = 0; j < 2; j++) {
      const P = S.pops[j]; if (!P.ind.length) continue;
      const me = P.fox ? this.ME : 0, ad = P.ind.filter(x => x.age >= 1), kids = [];
      if (ad.length >= 2) { const w = ad.map(x => this.fec(x.eff)); for (const m of ad) { const k = poisson(this.fec(m.eff)); for (let i = 0; i < k; i++) { let d = ad[wpick(w)], t = 0; while (d === m && t++ < 4) d = ad[wpick(w)]; kids.push([m, d]); } } }
      const room = Math.max(0, this.K[j] - P.ind.length), pk = kids.length ? Math.min(0.9, room / kids.length) : 0, next = P.ind.slice();
      for (const [m, d] of kids) if (R() < pk) { const x = this.mk(S, Gen.mate(S.lay, m.g, d.g), 0); if (m.a) x.a = { x: m.a.x + (R() - .5) * .03, y: m.a.y + (R() - .5) * .03, h: R() * TAU }; next.push(x); }
      const out = [];
      for (const x of next) { if (x.age < this.AMAX && R() < x.s[x.age] * (1 - me)) { x.age++; out.push(x); } else if (x.a && S.ghosts.length < 50 && !Steward.sync && Steward.speed <= 2) S.ghosts.push({ x: x.a.x, y: x.a.y, t: 1 }); }
      P.ind = out;
    }
  },
  stats(P) { if (!P.ind.length) return null; return { L: mean(P.ind.map(x => x.life)), e: mean(P.ind.map(x => x.eff)), m: mean(P.ind.map(x => x.late)), n: P.ind.length }; },
  record(S) {
    const a = this.stats(S.pops[0]), b = S.pops[1].founded != null ? this.stats(S.pops[1]) : null, h = S.hist;
    h.L0.push(a ? a.L : null); h.e0.push(a ? a.e : null); h.m0.push(a ? a.m : null); h.L1.push(b ? b.L : null); h.e1.push(b ? b.e : null); h.m1.push(b ? b.m : null);
    S.st = [a, b]; if (a && b && b.L >= 1.5 * a.L) S.flags.austad = true;
  },
  objectives: [
    { id: 'austad', text: 'Austad’s result: island animals’ protected lifespan reaches 1.5 × the mainland’s.', short: 'Slower ageing evolved on the island.', test: S => { const [a, b] = S.st; return !!(a && b && b.L >= 1.5 * a.L); } },
    { id: 'shadow', text: 'Shift the trade-off: island animals put less than 70% of the mainland’s effort into each year’s breeding.', short: 'The Y-model trade-off shifted.', test: S => { const [a, b] = S.st; return !!(a && b && b.e <= 0.7 * a.e); } },
    { id: 'reverse', text: 'Once ageing has slowed, let foxes onto the island and watch its animals age fast again (under 1.15 ×).', short: 'Foxes brought fast ageing back.', test: S => { const [a, b] = S.st; return !!(S.flags.austad && S.pops[1].fox && a && b && b.L <= 1.15 * a.L); } }
  ],
  leversHTML() {
    return '<div class="lrow"><button class="btn" id="l-found">Found an island colony (20 animals)</button></div>' +
      '<div class="lrow"><label for="l-fox">Foxes on the island</label><button class="tog" id="l-fox" aria-pressed="false">Off</button></div>';
  },
  bind(S) {
    $('l-found').onclick = () => { this.found(S); Steward.refresh(); };
    $('l-fox').onclick = () => { S.pops[1].fox = !S.pops[1].fox; this.syncFox(S); Snd.click(); this.refreshLevers(S); };
    this.refreshLevers(S);
  },
  refreshLevers(S) {
    const b = $('l-found'), P = S.pops[1]; if (b) { b.disabled = P.ind.length > 0; b.textContent = P.ind.length > 0 ? 'Island colony founded in year ' + P.founded : P.founded != null ? 'The colony died out. Found another (20 animals)' : 'Found an island colony (20 animals)'; }
    const t = $('l-fox'); if (t) { t.setAttribute('aria-pressed', P.fox ? 'true' : 'false'); t.textContent = P.fox ? 'On' : 'Off'; }
  },
  found(S) {
    const M = S.pops[0], I = S.pops[1]; if (I.ind.length) return;
    const ads = shuffle(M.ind.filter(x => x.age >= 1)).slice(0, 20); M.ind = M.ind.filter(x => ads.indexOf(x) < 0);
    for (const x of ads) { x.a = this.rpt(1); I.ind.push(x); }
    I.founded = S.gen; if (!Steward.sync) { toast('Twenty animals rafted to the island.'); Snd.chime(); }
    this.record(S); S.hist.L1.pop(); S.hist.e1.pop(); S.hist.m1.pop(); S.hist.L0.pop(); S.hist.e0.pop(); S.hist.m0.pop();
  },
  inR(j, x, y) { return j === 0 ? (x > 0.04 && x < 0.44 && y > 0.05 && y < 0.95) : (((x - 0.79) / 0.14) ** 2 + ((y - 0.5) / 0.3) ** 2 < 1); },
  rpt(j) { for (let t = 0; t < 50; t++) { const x = j === 0 ? 0.05 + R() * 0.38 : 0.65 + R() * 0.28, y = 0.06 + R() * 0.88; if (this.inR(j, x, y)) return { x, y, h: R() * TAU }; } return j ? { x: 0.79, y: 0.5, h: 0 } : { x: 0.25, y: 0.5, h: 0 }; },
  syncFox(S) { S.pops.forEach((P, j) => { const want = P.fox ? 2 : 0, a = S.foxes[j]; while (a.length < want) a.push(this.rpt(j)); a.length = want; }); },
  sync(S) { S.pops.forEach((P, j) => { for (const x of P.ind) if (!x.a || !this.inR(j, x.a.x, x.a.y)) x.a = this.rpt(j); }); },
  animate(S, dt) {
    const mv = (a, j, sp) => { a.h += (R() - .5) * dt * 3; const nx = a.x + Math.cos(a.h) * sp * dt, ny = a.y + Math.sin(a.h) * sp * dt; if (this.inR(j, nx, ny)) { a.x = nx; a.y = ny; } else a.h += Math.PI * (0.6 + R() * 0.8); };
    S.pops.forEach((P, j) => { for (const x of P.ind) if (x.a) mv(x.a, j, x.age < 1 ? 0.03 : 0.022); for (const f of S.foxes[j]) mv(f, j, 0.045); });
    S.ghosts = S.ghosts.filter(g => (g.t -= dt * 0.8) > 0);
  },
  bgFor(w, h) {
    const k = Math.round(w) + 'x' + Math.round(h) + '@' + Stage.dpr; if (this._bk === k) return this._bg;
    const d = Math.min(2, Stage.dpr), cv = mkCanvas(w * d, h * d), c = cv.getContext('2d'); c.scale(d, d); const r = rng(77);
    const sea = c.createLinearGradient(0, 0, w, 0); sea.addColorStop(0, '#1d4655'); sea.addColorStop(1, '#173a48'); c.fillStyle = sea; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(200,225,230,.12)'; c.lineWidth = 1; for (let i = 0; i < 40; i++) { const x = w * (0.5 + r() * 0.5), y = r() * h; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 6, y - 2, x + 12, y); c.stroke(); }
    const coast = t => w * (0.47 + 0.02 * Math.sin(t * 9) + 0.012 * Math.sin(t * 23 + 1));
    c.fillStyle = '#c9b98e'; c.beginPath(); c.moveTo(0, 0); for (let i = 0; i <= 60; i++) { const t = i / 60; c.lineTo(coast(t) + 5, t * h); } c.lineTo(0, h); c.closePath(); c.fill();
    c.fillStyle = '#3d5a2e'; c.beginPath(); c.moveTo(0, 0); for (let i = 0; i <= 60; i++) { const t = i / 60; c.lineTo(coast(t), t * h); } c.lineTo(0, h); c.closePath(); c.fill();
    c.fillStyle = '#c9b98e'; c.beginPath(); c.ellipse(w * 0.79, h * 0.5, w * 0.155, h * 0.325, 0, 0, TAU); c.fill();
    c.fillStyle = '#46652f'; c.beginPath(); c.ellipse(w * 0.79, h * 0.5, w * 0.142, h * 0.305, 0, 0, TAU); c.fill();
    const tuft = (x, y) => { c.fillStyle = css([50 + r() * 30, 80 + r() * 30, 40 + r() * 20], 0.7); c.beginPath(); c.ellipse(x, y, 1.5 + r() * 3, 1 + r() * 1.5, r() * 3, 0, TAU); c.fill(); };
    for (let i = 0; i < w * h / 40; i++) { const x = r() * w, y = r() * h; if (this.inR(0, x / w, y / h) || this.inR(1, x / w, y / h)) tuft(x, y); }
    for (let i = 0; i < 14; i++) { const p = i < 9 ? this.rpt(0) : this.rpt(1); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.arc(p.x * w + 2, p.y * h + 2, 7, 0, TAU); c.fill(); c.fillStyle = css([34 + r() * 20, 64 + r() * 20, 36]); c.beginPath(); c.arc(p.x * w, p.y * h, 7 + r() * 3, 0, TAU); c.fill(); }
    c.font = 'italic 13px ' + getComputedStyle(document.body).getPropertyValue('--fb'); c.fillStyle = 'rgba(232,223,201,.8)'; c.textAlign = 'left'; c.fillText('mainland', 10, 18); c.textAlign = 'center'; c.fillText('island', w * 0.79, h * 0.5 - h * 0.325 - 6 > 12 ? h * 0.5 - h * 0.325 - 6 : 14);
    this._bk = k; this._bg = cv; return cv;
  },
  draw(c, S, w, h) {
    c.drawImage(this.bgFor(w, h), 0, 0, w, h); const s = clamp(Math.min(w, h) / 330, 0.9, 1.4);
    for (const g of S.ghosts) { c.strokeStyle = 'rgba(232,223,201,' + (0.5 * g.t) + ')'; c.lineWidth = 1; const x = g.x * w, y = g.y * h; c.beginPath(); c.moveTo(x - 3, y - 3); c.lineTo(x + 3, y + 3); c.moveTo(x + 3, y - 3); c.lineTo(x - 3, y + 3); c.stroke(); }
    S.pops.forEach((P, j) => { for (const x of P.ind) if (x.a) drawBeast(c, x.a.x * w, x.a.y * h, x.a.h, x.age, s); for (const f of S.foxes[j]) drawFox(c, f.x * w, f.y * h, f.h, s); });
  },
  meanS(P) { const s = new Float32Array(this.AMAX + 1); if (!P.ind.length) return s; for (const x of P.ind) for (let a = 0; a <= this.AMAX; a++) s[a] += x.s[a]; for (let a = 0; a <= this.AMAX; a++) s[a] /= P.ind.length; return s; },
  lx(s, me) { const l = [1]; for (let a = 0; a < this.AMAX; a++) l.push(l[a] * s[a] * (1 - me)); return l; },
  fos(P) {
    const me = P.fox ? this.ME : 0, l = this.lx(this.meanS(P), me), e = mean(P.ind.map(x => x.eff));
    const fe = this.fec(e); let tot = 0; for (let a = 1; a < l.length; a++) tot += l[a] * fe;
    const out = []; for (let a = 0; a < l.length; a++) { let s2 = 0; for (let x = a + 1; x < l.length; x++) s2 += l[x] * fe; out.push(tot > 0 ? s2 / tot : 0); } return out;
  },
  tabs: [
    { label: 'Lifespan', legend: legend([['#8aa0b8', 'mainland'], ['#46a19a', 'island']]), legendP: '<div class="leg"><span><i style="background:#4f6478"></i>mainland</span><span><i style="background:#2f7f7a"></i>island</span></div>', draw(cv, S, th) { const k = COL[th]; const mx = Math.max(6, ...S.hist.L1.filter(v => v != null).map(v => Math.ceil(v + 0.5)), ...S.hist.L0.filter(v => v != null).map(v => Math.ceil(v + 0.5))); lineChart(cv, { theme: th, series: [{ d: S.hist.L0, c: k.a }, { d: S.hist.L1, c: k.b }], y0: 0, y1: mx, fy: v => v.toFixed(0) + ' y', x0l: 'year 0', xl: 'year ' + (S.hist.L0.length - 1) }); } },
    { label: 'Survival', legend: legend([['#8aa0b8', 'mainland'], ['#46a19a', 'island']]) + '<span>protected from predators, by age</span>', draw(cv, S, th) { const k = COL[th], me = CH_ISLAND; const ser = [{ d: me.lx(me.meanS(S.pops[0]), 0), c: k.a }]; if (S.pops[1].ind.length) ser.push({ d: me.lx(me.meanS(S.pops[1]), 0), c: k.b }); lineChart(cv, { theme: th, series: ser, y0: 0, y1: 1, fy: v => pct(v), x0l: 'age 0', xl: 'age ' + me.AMAX }); } },
    { label: 'Force of selection', legend: legend([['#8aa0b8', 'mainland'], ['#46a19a', 'island']]) + '<span>share of lifetime breeding still ahead</span>', draw(cv, S, th) { const k = COL[th], me = CH_ISLAND; const ser = [{ d: me.fos(S.pops[0]), c: k.a }]; if (S.pops[1].ind.length) ser.push({ d: me.fos(S.pops[1]), c: k.b }); lineChart(cv, { theme: th, series: ser, y0: 0, y1: 1, fy: v => pct(v), x0l: 'age 0', xl: 'age ' + me.AMAX }); } },
    { label: 'Late mutations', legend: legend([['#8aa0b8', 'mainland'], ['#46a19a', 'island']]) + '<span>copies per age, ages 5 and up</span>', draw(cv, S, th) { const k = COL[th]; const mx = Math.max(4, Math.ceil(Math.max(...S.hist.m0.filter(v => v != null)) + 1)); lineChart(cv, { theme: th, series: [{ d: S.hist.m0, c: k.a }, { d: S.hist.m1, c: k.b }], y0: 0, y1: mx, fy: v => v.toFixed(0), x0l: 'year 0', xl: 'year ' + (S.hist.m0.length - 1) }); } }
  ],
  readout(S) {
    const [a, b] = S.st; let s = '';
    if (a) s += 'Mainland: <b>' + a.n + '</b> animals, reproductive effort <b>' + a.e.toFixed(2) + '</b>, protected lifespan <b>' + a.L.toFixed(1) + ' y</b>.';
    const I = S.pops[1];
    if (b) s += '<br>Island: <b>' + b.n + '</b> animals, effort <b>' + b.e.toFixed(2) + '</b>, lifespan <b>' + b.L.toFixed(1) + ' y</b> — <b>' + (b.L / a.L).toFixed(2) + ' ×</b> the mainland.';
    else s += '<br>Island: ' + (I.founded != null ? 'the colony has died out.' : 'empty. No foxes can reach it.');
    return s;
  },
  chartCap: 'Protected lifespan: the median age at death if predators were removed, from each animal’s genes.',
  what(S) {
    const [a, b] = S.st;
    let s = 'Two things changed, at different speeds. The Y-model trade-off moved first: freed from foxes, island animals that put less into each year’s breeding and more into maintenance left more descendants over their longer lives. ';
    if (a && b) s += 'Reproductive effort ended at ' + a.e.toFixed(2) + ' on the mainland and ' + b.e.toFixed(2) + ' on the island; protected lifespan at ' + a.L.toFixed(1) + ' and ' + b.L.toFixed(1) + ' years. ';
    s += (a && b && b.m < a.m * 0.95) ? 'Late-acting mutations tell the slower half of the story: the island now carries fewer (' + b.m.toFixed(1) + ' against ' + a.m.toFixed(1) + ' copies per late age), because once animals live long enough for those mutations to bite, selection starts to see them. ' : 'Late-acting mutations tell the slower half of the story, and it is still unfinished: they bite only after age five, and until enough island animals live that long, selection barely sees them — the shadow Medawar described (' + (b ? b.m.toFixed(1) : '—') + ' copies per late age on the island, ' + (a ? a.m.toFixed(1) : '—') + ' on the mainland). ';
    s += 'One caveat: this works because crowding kills newborns here. If crowding instead raised death rates equally at every age, extra age-independent predation would cancel out and leave ageing unchanged (Abrams 1993).';
    return s;
  }
};

/* ---------- Chapter VI: the commons (haystack model, Price equation) ---------- */
const CH_COMMONS = {
  id: 'commons', mode: 'steward', num: 'VI', title: 'The Commons', concept: 'Levels of selection',
  intro: {
    premise: 'Cooperators make sugar that feeds their whole pond; cheats eat it and make none. In any single pond, cheats out-breed cooperators. Yet ponds of cooperators out-produce ponds of cheats, and fill up.',
    part: 'Set the rain (how much the ponds mix each generation), choose how many founders seed each pond, and call floods that pool everyone and reseed the ponds from scratch.',
    goal: 'Three experiments, one star each.',
    basis: 'Maynard Smith’s haystack model (1964) and George Price’s equation (1970, 1972).',
    real: 'John Maynard Smith’s haystack model (1964) asked when cooperation could spread among mice breeding in isolated haystacks that were periodically cleared. George Price’s equation (1970, 1972) splits any evolutionary change into a between-group and a within-group term — the two bars under the ponds. Michael Wade (1976) ran group selection for real on laboratory flour beetles, and found it could be strong.'
  },
  period: 1.3, maxGen: 260, NP: 12, BASE: 1.6, B: 1.0, COST: 0.3, CAP0: 3, CAP1: 25, MUT: 0.003,
  unit: g => 'gen ' + g,
  init() {
    const S = { ponds: [], rain: 0.30, founders: 4, hist: { p: [], cb: [], cw: [] }, floods: [], cum: { bet: 0, wit: 0 }, last: { bet: 0, wit: 0 }, streak: 0, flags: {}, floodT: 0, floodAt: -9 };
    for (let j = 0; j < this.NP; j++) { const P = { ind: [] }; for (let i = 0; i < 10; i++) P.ind.push({ c: R() < 0.3 ? 1 : 0 }); S.ponds.push(P); }
    const rb = rng(5); this.blobs = []; for (let j = 0; j < this.NP; j++) { const hs = []; for (let k = 2; k <= 5; k++) hs.push({ k, a: (rb() * 0.09) / (k - 1), p: rb() * TAU }); this.blobs.push(hs); }
    this.record(S); return S;
  },
  gp(S) { let n = 0, c = 0; for (const P of S.ponds) for (const i of P.ind) { n++; c += i.c; } return n ? c / n : 0; },
  step(S) {
    const pre = S.ponds.map(P => { const n = P.ind.length; let c = 0; for (const i of P.ind) c += i.c; return { n, x: n ? c / n : 0 }; });
    const offs = [];
    for (let j = 0; j < this.NP; j++) {
      const P = S.ponds[j], x = pre[j].x, kids = [];
      for (const i of P.ind) { const k = poisson(this.BASE * (1 + this.B * x) * (i.c ? 1 - this.COST : 1)); for (let q = 0; q < k; q++) { let c = i.c; if (R() < this.MUT) c = 1 - c; kids.push({ c, a: i.a ? { u: clamp(i.a.u + (R() - .5) * .25, -.9, .9), v: clamp(i.a.v + (R() - .5) * .25, -.9, .9), h: R() * TAU } : null }); } }
      shuffle(kids); offs.push(kids.slice(0, Math.round(this.CAP0 + this.CAP1 * x)));
    }
    let N = 0, Np = 0, sx = 0; for (let j = 0; j < this.NP; j++) { N += pre[j].n; Np += offs[j].length; sx += pre[j].n * pre[j].x; }
    if (N > 0 && Np > 0) {
      const p = sx / N, wb = Np / N; let bet = 0, wit = 0;
      for (let j = 0; j < this.NP; j++) { const n = pre[j].n; if (!n) continue; const w = offs[j].length / n; let xp = pre[j].x; if (offs[j].length) { let c = 0; for (const i of offs[j]) c += i.c; xp = c / offs[j].length; } bet += n * (w - wb) * (pre[j].x - p); wit += n * w * (xp - pre[j].x); }
      S.last = { bet: bet / (N * wb), wit: wit / (N * wb) }; S.cum.bet += S.last.bet; S.cum.wit += S.last.wit;
    } else S.last = { bet: 0, wit: 0 };
    const next = offs.map(() => []);
    for (let j = 0; j < this.NP; j++) for (const i of offs[j]) { if (R() < S.rain) { let k = (R() * (this.NP - 1)) | 0; if (k >= j) k++; i.a = null; next[k].push(i); } else next[j].push(i); }
    S.ponds.forEach((P, j) => P.ind = next[j]);
  },
  flood(S) {
    if (S.gen - S.floodAt < 1) return;
    const pool = []; for (const P of S.ponds) for (const i of P.ind) pool.push(i); shuffle(pool);
    const F = S.founders; S.ponds.forEach((P, j) => { P.ind = pool.slice(j * F, (j + 1) * F).map(i => ({ c: i.c })); });
    S.floodAt = S.gen; S.floods.push(S.gen); S.floodT = 1.6; S.flags.flooded = true;
    if (!Steward.sync) { Snd.flood(); }
    this.sync(S); S.hist.p[S.hist.p.length - 1] = this.gp(S);
  },
  record(S) {
    const p = this.gp(S); S.hist.p.push(p); S.hist.cb.push(S.cum.bet); S.hist.cw.push(S.cum.wit);
    S.streak = p >= 0.75 ? S.streak + 1 : 0; if (S.streak >= 5) S.flags.held = true;
  },
  objectives: [
    { id: 'hold', text: 'Cooperators hold 75% of the population for five generations in a row.', short: 'Cooperation held.', test: S => S.streak >= 5 },
    { id: 'ninety', text: 'Push cooperators past 90%.', short: 'Cooperators past 90%.', test: S => last(S.hist.p) >= 0.9 },
    { id: 'tragedy', text: 'After cooperation has held, turn the rain up and let cheats retake the majority: the tragedy of the commons.', short: 'The commons collapsed.', test: S => !!(S.flags.held && last(S.hist.p) < 0.5 && S.rain >= 0.15) }
  ],
  leversHTML(S) {
    return '<div class="lrow"><label for="l-rain">Rain: share of each pond that drifts to another <output id="o-rain">30%</output></label><input type="range" id="l-rain" min="0" max="40" step="1" value="30"></div>' +
      '<div class="lrow"><label for="l-fnd">Founders per pond after a flood <output id="o-fnd">4</output></label><input type="range" id="l-fnd" min="2" max="12" step="1" value="4"></div>' +
      '<div class="lrow"><button class="btn" id="l-flood">Flood: pool everyone, reseed the ponds</button></div><div class="price" id="s-price"></div>';
  },
  bind(S) {
    const rn = $('l-rain'), fd = $('l-fnd');
    rn.oninput = () => { S.rain = +rn.value / 100; $('o-rain').textContent = rn.value + '%'; };
    fd.oninput = () => { S.founders = +fd.value; $('o-fnd').textContent = fd.value; };
    $('l-flood').onclick = () => { this.flood(S); Steward.dirty = true; this.refreshLevers(S); };
    this.refreshLevers(S);
  },
  refreshLevers(S) {
    const b = $('l-flood'); if (b) b.disabled = S.gen - S.floodAt < 1;
    const pr = $('s-price'); if (!pr) return;
    const row = (lab, v) => { const w = clamp(Math.abs(v) / 0.08, 0, 1) * 50; const st = v >= 0 ? 'left:50%;width:' + w + '%;background:var(--teal)' : 'right:50%;width:' + w + '%;background:var(--carmine)'; return '<div class="prow"><span>' + lab + '</span><div class="pbar"><i style="' + st + '"></i></div><span class="pv">' + sgn3(v) + '</span></div>'; };
    pr.innerHTML = row('Between ponds', S.last.bet) + row('Within ponds', S.last.wit);
  },
  sync(S) { for (const P of S.ponds) for (const i of P.ind) if (!i.a) { const t = R() * TAU, rr = Math.sqrt(R()) * 0.8; i.a = { u: Math.cos(t) * rr, v: Math.sin(t) * rr, h: R() * TAU }; } },
  animate(S, dt) { for (const P of S.ponds) for (const i of P.ind) if (i.a) wander(i.a, dt, 0.28, 0.62); if (S.floodT > 0) S.floodT = Math.max(0, S.floodT - dt); },
  geom(w, h) { const cols = 3, rows = 4, cw = w / cols, chh = h / rows, r = Math.min(cw, chh) * 0.40, rr = rng(8), out = []; for (let j = 0; j < this.NP; j++) { const col = j % 3, row = (j / 3) | 0; out.push({ cx: cw * (col + 0.5) + (rr() - .5) * cw * 0.1, cy: chh * (row + 0.5) + (rr() - .5) * chh * 0.1, r }); } return out; },
  blob(c, g, j, sc) { const hs = this.blobs[j]; c.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40 * TAU; let k = 1; for (const q of hs) k += q.a * Math.cos(q.k * t + q.p); const x = g.cx + Math.cos(t) * g.r * sc * k, y = g.cy + Math.sin(t) * g.r * sc * k; if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.closePath(); },
  bgFor(w, h, G) {
    const k = Math.round(w) + 'x' + Math.round(h) + '@' + Stage.dpr; if (this._bk === k) return this._bg;
    const d = Math.min(2, Stage.dpr), cv = mkCanvas(w * d, h * d), c = cv.getContext('2d'); c.scale(d, d); const r = rng(12);
    c.fillStyle = '#26351f'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < w * h / 45; i++) { c.fillStyle = css([44 + r() * 30, 64 + r() * 30, 34 + r() * 16], 0.6); c.beginPath(); c.ellipse(r() * w, r() * h, 1.5 + r() * 3.5, 0.8 + r() * 1.4, r() * 3, 0, TAU); c.fill(); }
    G.forEach((g, j) => { c.fillStyle = '#5a5140'; this.blob(c, g, j, 1.1); c.fill(); c.fillStyle = '#7a6c50'; this.blob(c, g, j, 1.04); c.fill(); });
    this._bk = k; this._bg = cv; return cv;
  },
  draw(c, S, w, h) {
    const G = this.geom(w, h), t = S.anim; c.drawImage(this.bgFor(w, h, G), 0, 0, w, h);
    if (S.rain > 0) { c.strokeStyle = 'rgba(110,170,180,' + Math.min(0.5, S.rain * 1.6) + ')'; c.lineWidth = 2; c.setLineDash([3, 5]); c.lineDashOffset = -t * 12; for (let j = 0; j < this.NP; j++) { const a = G[j]; for (const k of [j + 1, j + 3]) { if (k >= this.NP || (k === j + 1 && j % 3 === 2)) continue; const b = G[k]; c.beginPath(); c.moveTo(a.cx, a.cy); c.lineTo(b.cx, b.cy); c.stroke(); } } c.setLineDash([]); }
    const s = clamp(Math.min(w, h) / 330, 0.9, 1.4);
    S.ponds.forEach((P, j) => {
      const g = G[j], n = P.ind.length; let cc = 0; for (const i of P.ind) cc += i.c; const x = n ? cc / n : 0;
      c.fillStyle = css(mix([86, 76, 46], [48, 122, 108], x)); this.blob(c, g, j, 1); c.fill();
      const motes = Math.min(14, Math.round(cc * 0.5)); c.fillStyle = 'rgba(236,200,90,.75)';
      for (let m = 0; m < motes; m++) { const a = m * 2.39996 + t * 0.3 * (m % 2 ? 1 : -1), rr = g.r * 0.72 * Math.sqrt((m + 0.5) / 14); c.beginPath(); c.arc(g.cx + Math.cos(a) * rr, g.cy + Math.sin(a) * rr, 1.1 * s, 0, TAU); c.fill(); }
      for (const i of P.ind) {
        if (!i.a) continue; const px = g.cx + i.a.u * g.r * 0.95, py = g.cy + i.a.v * g.r * 0.95;
        if (i.c) { c.fillStyle = 'rgba(120,230,210,.22)'; c.beginPath(); c.arc(px, py, 4.4 * s, 0, TAU); c.fill(); c.fillStyle = '#7fd8c8'; c.beginPath(); c.arc(px, py, 2.4 * s, 0, TAU); c.fill(); }
        else { c.fillStyle = '#d4566a'; c.beginPath(); c.arc(px, py, 2.6 * s, i.a.h + 0.6, i.a.h - 0.6 + TAU); c.lineTo(px, py); c.closePath(); c.fill(); }
      }
    });
    if (S.rain > 0) { c.strokeStyle = 'rgba(200,220,230,.22)'; c.lineWidth = 1; const n = Math.round(S.rain * 150); for (let i = 0; i < n; i++) { const x = ((i * 73.13 + t * 30) % (w + 20)) - 10, y = ((i * 41.7 + t * 240 + i * i * 3.1) % (h + 20)) - 10; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 9); c.stroke(); } }
    if (S.floodT > 0) { const k = Math.sin(Math.PI * (1 - S.floodT / 1.6)); c.fillStyle = 'rgba(60,110,140,' + (0.6 * k) + ')'; c.fillRect(0, 0, w, h); }
  },
  tabs: [
    { label: 'Cooperators', legend: legend([['#46a19a', 'share of cooperators']]) + '<span>ticks mark floods</span>', legendP: '', draw(cv, S, th) { const k = COL[th]; lineChart(cv, { theme: th, series: [{ d: S.hist.p, c: k.b }], y0: 0, y1: 1, refs: [{ v: 0.75, label: '75%' }, { v: 0.9, label: '90%' }], marks: S.floods, fy: v => pct(v), xl: 'gen ' + (S.hist.p.length - 1) }); } },
    { label: 'Price terms, summed', legend: legend([['#46a19a', 'between ponds'], ['#cf9a33', 'within ponds']]), draw(cv, S, th) { const k = COL[th], all = S.hist.cb.concat(S.hist.cw), m = Math.max(0.2, ...all.map(Math.abs)); lineChart(cv, { theme: th, series: [{ d: S.hist.cb, c: k.b }, { d: S.hist.cw, c: k.c }], y0: -m, y1: m, refs: [{ v: 0 }], fy: v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1), xl: 'gen ' + (S.hist.cb.length - 1) }); } }
  ],
  readout(S) {
    const p = last(S.hist.p); let occ = 0; for (const P of S.ponds) if (P.ind.length) occ++;
    return 'Cooperators <b>' + pct(p) + '</b> across <b>' + occ + '</b> occupied ponds' + (S.streak > 0 ? ', at or above 75% for ' + S.streak + ' generation' + (S.streak > 1 ? 's' : '') : '') + '. The bars split last generation’s change the way Price did.';
  },
  chartCap: 'Share of cooperators; ticks mark floods.',
  what(S) {
    let s = 'Summed over the run, selection between ponds moved the cooperator share by ' + sgn3(S.cum.bet) + ' and selection within ponds by ' + sgn3(S.cum.wit) + '. Price’s equation guarantees the two add up to the whole change (plus mutation, which sits inside the within-pond term). ';
    s += S.flags.flooded ? 'Floods with few founders made ponds differ from one another by chance, and between-group selection can only act on differences between groups. Rain erases those differences, handing the advantage back to the cheat next door. ' : 'Without floods, ponds never got the chance to differ much, so between-group selection had little to work with. ';
    s += 'Few founders per pond is the same thing as high relatedness among pondmates: this is kin selection and group selection doing the same arithmetic in two notations.';
    return s;
  }
};
