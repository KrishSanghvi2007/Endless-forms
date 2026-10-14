/* E5 self-test: v2/01_widgets.js (LiveGraph, Predict, GenePoolLens, Invasion, Ledger, Pin, Evidence, Chips, PedigreeView,
   DemeMap, PriceBars, TreeView, SceneLab).
     node tests/selftest_e5.js [BUILD.html]   runs the suite on BUILD, or on a private build of source/ plus the fixture below
     node tests/selftest_e5.js --build-only   prints the path of that private build (tests/selftest_e5.py uses it)
   The fixture chapter 'e5fix' is never copied into source/v2: it lives only in the private copy. Exit 1 on any failure. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const SRC = path.join(__dirname, '..');
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, m + ' (' + a + ' vs ' + b + ')');

/* ---------- the fixture: a three-level v2 chapter whose sim opens one prediction at a time (pq, y on a trace, tri) ---------- */
const FIXTURE = String.raw`
const CH_E5FIX_V2 = {
  id: 'e5fix', v2: true, role: 'investigator', place: 'lab',
  intro: { goal: 'Place each prediction on the live graph.' },
  content: {
    firstWords: 'Drag the diamond on the graph, then tap it to commit.',
    hud: { ask: 'Predict on the graph. Tap the diamond to commit.', wait: 'Watch the share change.' },
    whispers: { hit: 'Inside the band.', miss: 'Outside the band.' },
    labels: { share: 'share' }, panels: [], interesting: { flat: 'Every mark missed the band.' }, levers: { none: 'No change' },
    take: 'A prediction is a mark on the graph, scored by distance.', body: 'Each mark was scored against the expected value, not the realised run.',
    law: { title: 'Marks, not choices' }, boss: { inverts: 'The triangle asks for three shares at once.' },
    stars: { discover: 'Commit three marks.', predict: 'Two marks inside the band.', transfer: 'Finish the triangle level.' },
    model: [{ level: 0, simulated: 'A share that wanders a little each round.', simplification: 'No genetics at all.', params: [{ name: 'step', value: 0.05, tag: 'designed' }], cannot: 'Anything real.', nature: 'A test fixture only.', contested: false, refs: ['e5'] }],
    why: { real: ['This is a test fixture.'], maths: ['The expected share is the current share.'] }
  },
  P: { step: { v: 0.05, tag: 'designed', min: 0, max: 0.2, label: 'step' } },
  levels: [{ name: 'Bar', adds: 'the allele bar', codes: ['T1'], minutes: 1 }, { name: 'Trace', adds: 'a time trace', codes: ['T1'], minutes: 1 }, { name: 'Triangle', adds: 'three shares', codes: ['T1'], minutes: 1 }],
  keys: { P: 'predict', C: 'commit' }, untimed: true,
  teacher: { prompts: ['Where will the share go?', 'Why there?', 'What does the model leave out?'], pool: 'trace' },
  encodings: [{ k: 'A', rgb: [47, 95, 208], channels: ['colour', 'letter'] }, { k: 'a', rgb: [232, 180, 22], channels: ['colour', 'letter'] }],
  starTraits: [],
  KINDS: ['pq', 'y', 'tri'],
  sim: {
    dt: 1 / 30, s: null,
    reset(level) { this.s = { level, t: 0, p: 0.5, f: [0.25, 0.5, 0.25], hist: [0.5], trail: [[0.25, 0.5, 0.25]], ask: null, asks: [], pred: {}, expect: {}, log: [] }; },
    step(dt) {
      const s = this.s; s.t += dt;
      if (!s.ask && s.asks.length < 3 && s.t > 0.4) { const id = 'k' + s.level + '_' + s.asks.length; s.ask = { id, kind: CH_E5FIX_V2.KINDS[s.level], tol: 0.1 }; s.asks.push(id); s.expect[id] = s.level === 2 ? s.f.slice() : s.p; }
      if (s.ask && s.pred[s.ask.id] != null) {
        s.ask = null; s.t = 0; const st = CH_E5FIX_V2.P.step.v; s.p = Math.min(0.98, Math.max(0.02, s.p + (R() - 0.5) * 2 * st));
        const q = 1 - s.p; s.f = [s.p * s.p, 2 * s.p * q, q * q]; s.hist.push(s.p); s.trail.push(s.f.slice()); return [{ k: 'moved' }];
      }
      return [];
    },
    act(a) { const s = this.s; if (a.k === 'predict' && s.ask && a.id === s.ask.id) { s.pred[a.id] = a.v; return [{ k: 'committed', id: a.id }]; } return []; },
    result() { const s = this.s; if (s.asks.length < 3 || s.ask) return null; const st = CH_E5FIX_V2.stars, n = s.level; return { mask: (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0), outcome: { p: s.p }, interesting: null }; },
    snapshot() { return JSON.stringify({ s: this.s, rs: R.state() }); },
    restore(str) { const o = JSON.parse(str); this.s = o.s; R.restore(o.rs); },
    actions() { const s = this.s, out = []; if (!s.ask) return out; for (let v = 0; v <= 10; v++) out.push({ k: 'predict', id: s.ask.id, v: s.ask.kind === 'tri' ? [v / 10, (10 - v) / 20, (10 - v) / 20] : v / 10 }); return out; },
    bots: { alwaysA(s, acts) { return acts[0] || null; }, alwaysB(s, acts) { return acts[acts.length - 1] || null; }, greedy(s, acts) { return acts[5] || null; }, threshold(s, acts) { return acts[3] || null; } }
  },
  stars: {
    err: (a, b) => Array.isArray(a) ? Math.sqrt(((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2])) / 2) : Math.abs(a - b),
    discover: s => s.asks.length >= 3,
    predict: s => s.asks.filter(id => s.pred[id] != null && CH_E5FIX_V2.stars.err(s.pred[id], s.expect[id]) <= 0.1).length >= 2,
    transfer: (s, n) => n === 2 && s.asks.length >= 3
  },
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    this.level = n; this._asking = null; this._ended = false; Sim.start(this, n, o);
    Dock.set([{ id: 'commit', label: 'Commit', key: 'C', fn: () => Predict.commit() }]);
    HUD.say(this.content.firstWords, '');
  },
  update(dt) {
    const ev = Sim.run(this, dt), s = this.sim.s;
    if (s.ask && this._asking !== s.ask.id) {
      this._asking = s.ask.id; const ask = s.ask;
      Predict.ask({ id: ask.id, chart: 0, kind: ask.kind, axis: { lo: 0, hi: 1 }, start: ask.kind === 'tri' ? [1 / 3, 1 / 3, 1 / 3] : 0.5, tol: ask.tol, soft: Save.d.ui && Save.d.ui.unt ? null : 6,
        onCommit: r => { const out = Predict.reveal(r.id, this.sim.s.expect[r.id], ask.tol); Whisper.say(out && out.hit ? this.content.whispers.hit : this.content.whispers.miss, 'pr'); } });
      HUD.say(this.content.hud.ask, s.asks.length + ' of 3');
    }
    if (ev.length) { HUD.say(this.content.hud.wait, s.asks.length + ' of 3'); Fx.pop('+1', Stage.w / 2, Stage.h / 2, 1); }
    const r = this.sim.result();
    if (r && !this._ended) { this._ended = true; End.show(this, { level: this.level, mask: r.mask, final: this.level === this.levels.length - 1, chart: this.notes().charts[0] }); }
  },
  draw(c, w, h) {
    const s = this.sim.s; c.fillStyle = Pal.place('lab').ground; c.fillRect(0, 0, w, h);
    const n = 20, k = Math.round(s.p * n), r = Math.max(10, Math.min(w, h) / 24);
    for (let i = 0; i < n; i++) Pal.token(c, w / 2 + (i % 10 - 4.5) * r * 2.2, h / 2 + (Math.floor(i / 10) - 0.5) * r * 2.2, r, i < k ? 0 : 1);
    Lbl.put('share', this.content.labels.share, w / 2, h / 2 - r * 4);
  },
  notes() {
    const s = this.sim.s, q = 1 - s.p;
    const pq = { type: 'pq', title: 'Gene pool', p: s.p, n: 40, frame: 'designed' };
    const tr = { type: 'trace', title: 'A share', x: { lo: 0, hi: 4, label: 'round' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: s.hist, ink: 'A', label: 'A' }], ghost: [{ d: s.hist.map(() => 0.5), label: 'start' }], frame: 'designed' };
    const tri = { type: 'tri', title: 'Genotypes', variant: 'hw', pts: [{ f: s.f, kind: 'dusk' }], trail: s.trail, frame: 'designed' };
    return { stats: [['A share', Math.round(s.p * 100) + '%', ''], ['a share', Math.round(q * 100) + '%', '']], charts: s.level === 0 ? [pq, tr] : s.level === 1 ? [tr, pq] : [tri, pq] };
  }
};
V2.push(CH_E5FIX_V2);
PLAN_ADD.push({ sec: 'Dev', entry: ['e5fix', 'Widget fixture', 'Predict on the graph'] });
`;

function privateBuild() {
  const tmp = fs.mkdtempSync(path.join(process.env.E5_TMP || os.tmpdir(), 'e5-')), dst = path.join(tmp, 'src');
  fs.mkdirSync(path.join(dst, 'v2'), { recursive: true });
  for (const f of fs.readdirSync(SRC)) if (/\.(js|html|py)$/.test(f) && fs.statSync(path.join(SRC, f)).isFile()) fs.copyFileSync(path.join(SRC, f), path.join(dst, f));
  for (const f of fs.readdirSync(path.join(SRC, 'v2'))) if (/\.js$/.test(f)) fs.copyFileSync(path.join(SRC, 'v2', f), path.join(dst, 'v2', f));
  fs.writeFileSync(path.join(dst, 'v2', 'e5fixture.js'), FIXTURE);
  const out = path.join(tmp, 'e5test.html');
  cp.execFileSync('python3', ['build.py', out], { cwd: dst, env: Object.assign({}, process.env, { V2_ONLY: process.env.E5_V2_ONLY || '0*,01_widgets.js,e5fixture.js,zz_*' }), stdio: 'pipe' });
  return out;
}

if (process.argv[2] === '--build-only') { console.log(privateBuild()); process.exit(0); }
const HTML = process.argv[2] ? path.resolve(process.argv[2]) : privateBuild();
const { load } = require('./vmgame');
const G = load(HTML, { vw: 390, vh: 780 }), TB = G.TB, W = G.window, D = G.document;
const { LiveGraph, Predict, GenePoolLens, Invasion, Ledger, Pin, Evidence, Chips, PedigreeView, DemeMap, PriceBars, TreeView, SceneLab, Hooks, App, REG, R, seed } = TB;
const canvas = (w, h) => { const cv = D.createElement('canvas'); cv.style.width = (w || 300) + 'px'; cv.style.height = (h || 120) + 'px'; D.body.appendChild(cv); return cv; };

/* ---------- 0. load, exports, hooks ---------- */
ok(G.errors.length === 0 && !G.errorBox(), 'build loads with no error');
for (const k of ['LiveGraph', 'Predict', 'GenePoolLens', 'Invasion', 'Ledger', 'Pin', 'Evidence', 'Chips', 'PedigreeView', 'DemeMap', 'PriceBars', 'TreeView', 'SceneLab']) ok(TB[k], 'TB.' + k + ' exported');
ok(typeof Hooks.chart === 'function', 'Hooks.chart is set at load');
ok(Hooks.key.length >= 1 && Hooks.frame.length >= 1, 'key and frame hooks registered');

/* ---------- 1. LiveGraph: every type draws, maps, tables and signs without touching R() ---------- */
const SPECS = {
  trace: { type: 'trace', title: 'a share', x: { lo: 1, hi: 8, label: 'generation' }, y: { lo: 0, hi: 1, fmt: 'pct', label: 'a' }, series: [{ d: [0.2, 0.3, 0.35, 0.5], ink: 'a', label: 'a share' }, { d: [0.5, 0.45, null, 0.4], ink: 'A', label: 'A', you: true }], fan: [[0.2, 0.25, 0.3], [0.2, 0.15, 0.2]], ghost: [{ d: [0.2, 0.2, 0.2, 0.2, 0.2], label: 'neutral' }], marks: [3], target: { lo: 0.4, hi: 0.6 }, frame: 'designed' },
  dots: { type: 'dots', title: 'Wing tone', x: { lo: 0, hi: 1, label: 'tone' }, bins: 12, groups: [{ v: [0.1, 0.2, 0.2, 0.8], style: 'hollow', label: 'eaten' }, { v: [0.5, 0.55, 0.6, 0.62], style: 'solid', label: 'spared' }, { v: [0.4, 0.5], style: 'hatched', label: 'young' }], arrows: { S: [0.4, 0.55], R: [0.4, 0.48] }, marker: { v: 0.45, label: 'mean' }, ghost: 0.5, frame: 'real', source: 'test' },
  pq: { type: 'pq', title: 'Gene pool', p: 0.62, n: 80, ghost: 0.55, target: { lo: 0.5, hi: 0.7 }, frame: 'designed' },
  pq4: { type: 'pq', title: 'Alleles', parts: [{ v: 3, allele: 0 }, { v: 2, allele: 1 }, { v: 1, allele: 2 }, { v: 1, allele: 5 }], n: 70 },
  tri: { type: 'tri', title: 'Genotypes', variant: 'hw', pts: [{ f: [0.25, 0.5, 0.25], kind: 'dawn' }, { f: [0.5, 0.2, 0.3], kind: 'dusk', label: 'dusk' }, { f: [0.3, 0.4, 0.3], kind: 'you' }, { f: [0.1, 0.3, 0.6], kind: 'ghost' }], trail: [[0.3, 0.3, 0.4], [0.25, 0.5, 0.25]] },
  simplex: { type: 'tri', title: 'Morphs', variant: 'simplex', corners: ['O', 'B', 'Y'], pts: [{ f: [0.2, 0.5, 0.3], kind: 'dusk' }] },
  scatter: { type: 'scatter', title: 'Diet', x: { label: 'available' }, y: { label: 'eaten' }, series: [{ pts: [[0.1, 0.2], [0.3, 0.25], [0.6, 0.7]], shape: 'disc', ink: 'A', label: 'A' }, { pts: [[0.2, 0.1], [0.5, 0.4]], shape: 'square', label: 'B' }, { pts: [[0.4, 0.6]], shape: 'tri', label: 'C' }], ref: 'diag', fit: [[0, 0.05], [1, 0.9]], you: { x: 0.5, y: 0.5 } },
  dense: { type: 'scatter', title: 'Many', series: [{ pts: Array.from({ length: 700 }, (_, i) => [(i * 37 % 101) / 101, (i * 53 % 97) / 97]) }], ref: 'mean' },
  xhud: { type: 'xhud', title: 'X copies', female: [0.3, 0.5, 0.2], pf: 0.55, pm: 0.25, trail: [[0.7, 0.1], [0.4, 0.7], [0.55, 0.4]] },
  deme: { type: 'deme', title: 'Islands', demes: [{ x: 0.1, y: 0.2, p: 0.8, N: 100, label: 'west' }, { x: 0.9, y: 0.3, p: 0.2, N: 50, label: 'east' }, { x: 0.5, y: 0.9, p: 0.5, N: 80 }], links: [{ a: 0, b: 1, m: 0.05 }, { a: 1, b: 0, m: 0.01 }, { a: 2, b: 0, m: 0.02 }] },
  price: { type: 'price', title: 'Two levels', between: 0.04, within: -0.03, total: 0.01 },
  tree: { type: 'tree', title: 'Tree', nodes: [{ id: 'r' }, { id: 'x', parent: 'r' }, { id: 'A', parent: 'x', label: 'Ape' }, { id: 'B', parent: 'x', label: 'Bat' }, { id: 'C', parent: 'r', label: 'Cod' }], spin: ['x'] },
  genome: { type: 'genome', title: 'Scan', chroms: [{ lo: 0, hi: 100, label: '1' }, { lo: 100, hi: 180, label: '2' }, { lo: 180, hi: 240, label: '3' }], pts: Array.from({ length: 2400 }, (_, i) => [i / 10, (i * 7919 % 1000) / 200 + (Math.abs(i - 1300) < 20 ? 6 : 0)]), thr: { v: 7.3, label: '5×10⁻⁸' }, truth: [130], prev: [[10, 2], [150, 4]] }
};
{
  const s0 = R.state();
  for (const th of ['dusk', 'paper', 'projector']) for (const k in SPECS) {
    const cv = canvas(k === 'tri' ? 240 : 300, k === 'pq' ? 78 : 140), e0 = LiveGraph.errors.length;
    LiveGraph.draw(cv, SPECS[k], th);
    ok(LiveGraph.errors.length === e0, 'LiveGraph.draw ' + k + ' (' + th + ') does not throw' + (LiveGraph.errors.length > e0 ? ': ' + LiveGraph.errors[LiveGraph.errors.length - 1].split('\n')[0] : ''));
    ok(cv._lg && cv._lg.G && cv._lg.spec === SPECS[k], 'draw ' + k + ' stores its geometry');
    if (th === 'dusk') {
      const t = LiveGraph.table(SPECS[k]); ok(/^<table class="lg-data"><caption>/.test(t) && /<tr>/.test(t), 'table twin for ' + k);
      ok(String(cv.getAttribute('aria-label') || '').indexOf(SPECS[k].title) === 0, 'aria label for ' + k);
    }
  }
  ok(R.state() === s0, 'LiveGraph draws, tables and maps never call R()');
  const tiny = canvas(180, 78); for (const k in SPECS) { LiveGraph.draw(tiny, SPECS[k], 'dusk'); } ok(LiveGraph.errors.length === 0, 'every type draws on a 180 × 78 phone strip chart');
  const odd = canvas(200, 100); LiveGraph.draw(odd, { type: 'trace', series: [] }, 'dusk'); LiveGraph.draw(odd, { type: 'dots', groups: [] }); LiveGraph.draw(odd, { type: 'pq' }); LiveGraph.draw(odd, { type: 'tri' }); LiveGraph.draw(odd, { type: 'scatter' }); LiveGraph.draw(odd, { type: 'nosuch', title: 'Later' });
  LiveGraph.draw(odd, { type: 'trace', series: [{ d: [NaN, Infinity, null, 0.5] }] }); LiveGraph.draw(odd, { type: 'deme' }); LiveGraph.draw(odd, { type: 'tree', nodes: [] }); LiveGraph.draw(odd, { type: 'genome' }); LiveGraph.draw(odd, { type: 'xhud' });
  ok(LiveGraph.errors.length === 0, 'empty, NaN and unknown specs draw without throwing');
  ok(LiveGraph.table({ type: 'pq', title: '<b>x</b>&', p: 0.5 }).indexOf('&lt;b&gt;x&lt;/b&gt;&amp;') > 0, 'table escapes HTML');
  ok(LiveGraph.table({ type: 'nosuch' }) === '' && LiveGraph.table({ type: 'trace', series: [] }) === '', 'no table for an unknown or empty spec');
  // map: the same geometry as draw, and its inverses
  const cv = canvas(300, 140), m = LiveGraph.map(cv, SPECS.trace); LiveGraph.draw(cv, SPECS.trace, 'dusk');
  ok(m && m.plot && Math.abs(m.plot.w - cv._lg.G.plot.w) < 1e-9 && Math.abs(m.plot.h - cv._lg.G.plot.h) < 1e-9, 'map gives the plot that draw used');
  near(m.ix(m.X(0.37 * 7 + 1)), 0.37 * 7 + 1, 1e-9, 'trace X/ix round trip'); near(m.iy(m.Y(0.42)), 0.42, 1e-9, 'trace Y/iy round trip');
  ok(m.nextX === 5, 'trace nextX is one step past the last realised point (x.lo 1, 4 points)');
  const mt = LiveGraph.map(canvas(240, 200), SPECS.tri), f = [0.2, 0.3, 0.5], xy = mt.P(f), back = mt.inv(xy[0], xy[1]);
  ok(Math.abs(back[0] - 0.2) + Math.abs(back[1] - 0.3) + Math.abs(back[2] - 0.5) < 1e-9, 'tri P/inv round trip');
  const A = mt.P([1, 0, 0]), Bc = mt.P([0, 1, 0]), C = mt.P([0, 0, 1]); ok(A[1] === C[1] && Bc[1] < A[1] && Math.abs((A[0] + C[0]) / 2 - Bc[0]) < 1e-9, 'tri corners: AA left, Aa top, aa right');
  const hw = mt.P([0.25, 0.5, 0.25]); near(hw[0], (A[0] + C[0]) / 2, 1e-9, 'HW point p = 0.5 sits mid-way across');
  const outside = mt.inv(A[0] - 50, A[1] + 30); ok(outside.every(v => v >= 0) && Math.abs(outside[0] + outside[1] + outside[2] - 1) < 1e-12, 'tri inv clamps outside points onto the simplex');
  const mp = LiveGraph.map(canvas(300, 78), SPECS.pq); ok(mp.bar && Math.abs(mp.ix(mp.X(0.3)) - 0.3) < 1e-9, 'pq bar mapping');
  // sig
  const a = JSON.parse(JSON.stringify(SPECS.trace)), b = JSON.parse(JSON.stringify(SPECS.trace)); b.fmt = () => 1;
  ok(LiveGraph.sig(a) === LiveGraph.sig(b), 'sig ignores functions and is stable for equal data');
  b.series[0].d.push(0.6); ok(LiveGraph.sig(a) !== LiveGraph.sig(b), 'sig changes when data change');
  const c2 = JSON.parse(JSON.stringify(SPECS.trace)); c2.series[0].d[1] = 0.3000001; ok(LiveGraph.sig(a) !== LiveGraph.sig(c2), 'sig sees a tiny change');
  const v0 = LiveGraph.sig(a); Predict.ver++; ok(LiveGraph.sig(a) !== v0, 'sig follows the Predict state');
  ok(LiveGraph.sig({ type: 'pq', d: new Float32Array([1, 2]) }) !== LiveGraph.sig({ type: 'pq', d: new Float32Array([1, 3]) }), 'sig reads typed arrays');
}

/* ---------- 2. Predict: maths ---------- */
{
  near(Predict.err('y', 0.3, 0.42), 0.12, 1e-12, 'err: absolute distance');
  near(Predict.err('tri', [1, 0, 0], [0, 1, 0]), 1, 1e-12, 'err tri: corner to corner = 1 (unit-side simplex)');
  near(Predict.err('tri', [0.25, 0.5, 0.25], [0.25, 0.5, 0.25]), 0, 1e-12, 'err tri: same point = 0');
  const U = LiveGraph.map(canvas(400, 380), SPECS.tri), p1 = U.P([0.6, 0.1, 0.3]), p2 = U.P([0.2, 0.5, 0.3]);
  near(Predict.err('tri', [0.6, 0.1, 0.3], [0.2, 0.5, 0.3]), Math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2) / U.size, 1e-9, 'err tri equals planar distance / side');
  ok(Predict.score([{ err: 0.05, tol: 0.08 }, { err: 0.07, tol: 0.08 }, { err: 0.2, tol: 0.08 }]) === true, 'score: 2 of 3 within tolerance');
  ok(Predict.score([{ err: 0.05, tol: 0.08 }, { err: 0.2, tol: 0.08 }]) === false, 'score: 1 of 2 is not enough');
  ok(Predict.score([{ err: 0.05, tol: 0.08 }], 1) === true && Predict.score([], 1) === false && Predict.score([null, { err: 0 }], 1) === false, 'score: need, nulls, missing tol');
}

/* ---------- 3. Predict in a live v2 chapter (the fixture): pointer, keys, Dock commit, soft timer, Sim log, overlay, band ---------- */
const fix = REG.e5fix;
if (!fix) ok(false, 'fixture e5fix registered (run without a BUILD argument)');
else {
  const Strip = TB.Strip, unt = TB.Save.d.ui; unt.unt = 0;
  App.playLevel(fix, 0, { seed: 11 }); G.advance(800);
  ok(App.ch === fix && fix.sim.s.ask && Predict.cur && Predict.cur.id === fix.sim.s.ask.id, 'the fixture opens a pq ask and Predict.ask follows it');
  ok(Hooks.chartPointer === Predict._ptrFn, 'Predict owns Hooks.chartPointer while the ask is open');
  Strip.redraw(); const cv = Strip.canvas(0); ok(cv && cv._lg && cv._lg.G.bar, 'the strip drew chart 0 through LiveGraph');
  const ov = Predict.overlay(0); ok(ov && ov.active && ov.v === 0.5 && !ov.committed, 'overlay: active at the start value');
  const G0 = cv._lg.G, bx = f => G0.bar.x + f * G0.bar.w, by = G0.bar.y + G0.bar.h / 2;
  Hooks.chartPointer(0, 'down', bx(0.2), by, cv); Hooks.chartPointer(0, 'up', bx(0.2), by, cv);
  near(Predict.cur.v, 0.2, 1e-9, 'a tap off the ghost moves it there');
  ok(Predict.cur && Predict.cur.active, 'a tap that moves the ghost does not commit');
  Hooks.chartPointer(0, 'down', bx(0.2), by, cv); Hooks.chartPointer(0, 'move', bx(0.35), by, cv); Hooks.chartPointer(0, 'move', bx(0.71), by, cv); Hooks.chartPointer(0, 'up', bx(0.71), by, cv);
  near(Predict.cur.v, 0.71, 1e-9, 'dragging the ghost moves it; release does not commit');
  Hooks.chartPointer(1, 'down', 10, 10, Strip.canvas(1)); near(Predict.cur.v, 0.71, 1e-9, 'pointers on another chart are ignored');
  const id0 = Predict.cur.id;
  Hooks.chartPointer(0, 'down', bx(0.71) + 3, by, cv); Hooks.chartPointer(0, 'up', bx(0.71) + 3, by, cv);
  ok(!Predict.cur && fix.sim.s.pred[id0] === 0.71, 'tapping the ghost commits: sim.s.pred holds the value');
  const log = TB.Sim ? TB.Sim.log(fix) : fix.sim.s.log; ok(log.some(e => e[1] && e[1].k === 'predict' && e[1].id === id0 && e[1].v === 0.71), 'the commit is in the Sim action log');
  const ev = TB.Events.log.filter(e => e.type === 'predict' && e.id === id0); ok(ev.length >= 1 && ev[0].value === 0.71 && ev[0].kind === 'pq', 'Events: predict on commit');
  ok(ev.some(e => e.reveal && e.expect === 0.5 && Math.abs(e.err - 0.21) < 1e-9 && e.hit === false), 'Events: predict on reveal with expect, err, hit');
  const o0 = Predict.overlay(0); ok(o0.committed && !o0.active && o0.expect === 0.5 && Math.abs(o0.band[0] - 0.4) < 1e-9 && Math.abs(o0.band[1] - 0.6) < 1e-9, 'reveal: the band sits on the expectation');
  ok(Hooks.chartPointer !== Predict._ptrFn, 'Predict lets go of Hooks.chartPointer after the commit');
  G.advance(500); ok(Predict.overlay(0).hatch === 1, 'the band hatch-in finishes within 500 ms');
  // keyboard: P focuses, arrows move, Enter commits
  G.advance(800); ok(Predict.cur && Predict.cur.active, 'second ask open');
  const key = (k, sh) => TB.Keys.down({ key: k, shiftKey: !!sh, target: { tagName: 'CANVAS' }, preventDefault() { } });
  key('ArrowRight'); near(Predict.cur.v, 0.5, 1e-12, 'arrows do nothing before P');
  key('p'); ok(Predict.cur.focus, 'P focuses the ghost'); key('ArrowRight'); key('ArrowRight', true); near(Predict.cur.v, 0.5 + 0.02 + 0.1, 1e-9, 'arrows step 1/50 of the axis, Shift 5×');
  key('ArrowLeft'); key('Escape'); ok(!Predict.cur.focus, 'Escape leaves the ghost');
  const id1 = Predict.cur.id; key('p'); key('Enter'); ok(fix.sim.s.pred[id1] != null && Math.abs(fix.sim.s.pred[id1] - 0.6) < 1e-9, 'Enter commits the keyboard value');
  // Dock commit (Predict.commit) on the third ask
  G.advance(800); const id2 = Predict.cur && Predict.cur.id; key('c');
  ok(id2 && fix.sim.s.pred[id2] === 0.5, 'Predict.commit() from a Dock button commits the current ghost');
  G.advance(400); const card = D.querySelector('#cards .card'); ok(card && /lvl|end/.test(card.className), 'the level card opens after three predictions');
  // level 2 (trace, kind y) with the soft timer: no input → commits after 6 s, not before
  App.playLevel(fix, 1, { seed: 3 }); G.advance(800);
  ok(Object.keys(Predict._by).length === 1 && Predict.cur && Predict.cur.kind === 'y', 'a new level clears the old overlays and opens a y ask');
  const idy = Predict.cur.id; G.advance(5000); ok(Predict.cur && Predict.cur.id === idy && fix.sim.s.pred[idy] == null, 'the soft timer has not committed after 5 s');
  G.advance(1400); ok(fix.sim.s.pred[idy] === 0.5, 'the soft timer commits the current ghost at 6 s');
  G.advance(800); Strip.redraw(); const cvy = Strip.canvas(0), Gy = cvy._lg.G, r1 = Predict.cur;
  Hooks.chartPointer(0, 'down', Gy.plot.x + 20, Gy.Y(0.8), cvy); ok(Math.abs(r1.v - 0.8) < 1e-9, 'kind y: a tap sets the value from the y axis');
  const t0 = r1.left; G.advance(4000); ok(r1.active, 'the soft timer never commits while the pointer is down');
  Hooks.chartPointer(0, 'up', Gy.plot.x + 20, Gy.Y(0.8), cvy); ok(r1.left >= 2 - 1e-9 && t0 >= 2, 'a move leaves at least 2 s on the timer');
  // untimed: soft is null whatever the chapter passes
  unt.unt = 1; App.playLevel(fix, 2, { seed: 4 }); G.advance(800);
  ok(Predict.cur && Predict.cur.kind === 'tri' && Predict.cur.soft === null, 'untimed mode: no soft timer');
  G.advance(15000); ok(Predict.cur && Predict.cur.active, 'untimed: still open after 15 s');
  Strip.redraw(); const cvt = Strip.canvas(0), Gt = cvt._lg.G, target = Gt.P([0.5, 0.2, 0.3]);
  Hooks.chartPointer(0, 'down', target[0], target[1], cvt); Hooks.chartPointer(0, 'up', target[0], target[1], cvt);
  const vt = Predict.cur.v; ok(Math.abs(vt[0] - 0.5) + Math.abs(vt[1] - 0.2) + Math.abs(vt[2] - 0.3) < 1e-6, 'kind tri: a tap sets barycentric shares');
  key('p'); key('ArrowUp'); ok(Predict.cur.v[1] > 0.2, 'tri: ArrowUp moves toward the top corner');
  key('Enter'); const idt = Object.keys(fix.sim.s.pred).pop(); ok(Array.isArray(fix.sim.s.pred[idt]) && fix.sim.s.pred[idt].length === 3, 'tri commit stores [a, b, c]');
  unt.unt = 0;
  // cancel and exit
  G.advance(800); const h = Predict.cur; ok(h, 'next tri ask'); Predict.cancel(); ok(!Predict.cur && Predict.overlay(0) == null && Hooks.chartPointer !== Predict._ptrFn, 'cancel closes the ask without a commit');
  App.exit(); ok(Object.keys(Predict._by).length === 0 && !Predict.cur, 'exit clears every overlay');
  ok(G.errors.length === 0 && !G.errorBox() && LiveGraph.errors.length === 0, 'no errors in the fixture run' + (G.errorBox() ? ': ' + G.errorBox().slice(0, 200) : ''));
}

/* ---------- 4. legacy isolation: hooks are no-ops for a legacy chapter ---------- */
{
  App.playLevel(REG.casino, 0); G.advance(200);
  const r0 = TB.R.state(), handled = Hooks.key.map(fn => fn({ key: 'p', target: {}, preventDefault() { } }));
  ok(handled.every(x => !x), 'no key hook claims P in a legacy chapter');
  ok(Hooks.chartPointer == null || Hooks.chartPointer !== Predict._ptrFn, 'no chart pointer hook in a legacy chapter');
  ok(TB.R.state() === r0, 'hooks drew no R() in a legacy chapter');
  App.exit();
}

/* ---------- 5. Chips: proper scoring ---------- */
{
  const bet = Chips.create({ bins: [{ lo: 0, hi: 0.25, label: 'low' }, { lo: 0.25, hi: 0.75 }, { lo: 0.75, hi: 1, label: 'high' }], chips: 10, odds: [0.2, 0.6, 0.2] });
  for (let i = 0; i < 6; i++) bet.add(1); bet.add(0); bet.add(0); bet.add(2); bet.add(2); ok(!bet.add(1) && bet.left === 0, 'no chips beyond the stake');
  ok(bet.remove(2) && !bet.remove(5) && bet.left === 1, 'remove returns a chip; bad bins refused');
  bet.add(2); const q = bet.dist(); ok(q.join() === '0.2,0.6,0.2', 'dist = chips per bin / stake');
  near(Chips.score([0.2, 0.6, 0.2], 1), 2 * 0.6 - (0.04 + 0.36 + 0.04), 1e-12, 'score formula');
  near(Chips.score([0, 1, 0], 1), 1, 1e-12, 'a sure, right bet scores 1'); near(Chips.score([1, 0, 0], 1), -1, 1e-12, 'a sure, wrong bet scores −1');
  const p = [0.1, 0.7, 0.2], best = Chips.expected(p, p); let proper = true; const rnd = TB.rng ? null : null;
  let s = 12345; const rr = () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648;
  for (let t = 0; t < 2000; t++) { const a = rr(), b = rr() * (1 - a), qq = [a, b, 1 - a - b]; if (Chips.expected(qq, p) > best + 1e-12) proper = false; }
  ok(proper, 'quadratic score is proper: betting the true distribution maximises the expected score');
  const cv = canvas(300, 160), c = cv.getContext('2d'); bet.draw(c, { x: 0, y: 0, w: 300, h: 160 }); ok(bet.hit(150, 80) === 1 && bet.hit(10, 80) === 0 && bet.hit(299, 159) === 2 && bet.hit(400, 10) === -1, 'hit by column');
  bet.cursor = 0; ok(bet.key('ArrowRight') && bet.cursor === 1 && bet.key('ArrowLeft') && bet.key('ArrowLeft') && bet.cursor === 2, 'arrows move the cursor (wrapping)');
  bet.key('ArrowDown'); ok(bet.n[2] === 1 && bet.key('+') && bet.n[2] === 2 && !bet.key('x'), 'keys add and remove chips');
}

/* ---------- 6. PedigreeView: exact r, paths, layout, tags, keys ---------- */
{
  // grandparents G1 × G2 → M (f) and U (m); M × F → S1 (f), S2 (m); U × W → C (cousin); M × F2 → H (half-sib); S2 × C → I (inbred)
  const nodes = [{ id: 'G1', sex: 'm' }, { id: 'G2', sex: 'f' }, { id: 'M', sex: 'f', parents: ['G2', 'G1'] }, { id: 'U', sex: 'm', parents: ['G2', 'G1'] }, { id: 'F', sex: 'm' }, { id: 'W', sex: 'f' }, { id: 'F2', sex: 'm', blaze: 'chevron' },
    { id: 'S1', sex: 'f', parents: ['M', 'F'], pheno: 'carrier', blaze: 'stripe' }, { id: 'S2', sex: 'm', parents: ['M', 'F'], pheno: 'affected' }, { id: 'C', sex: 'f', parents: ['W', 'U'] }, { id: 'H', sex: 'u', parents: ['M', 'F2'], dead: true }, { id: 'I', sex: 'f', parents: ['C', 'S2'], geno: [0, 1] }];
  const pv = PedigreeView.create({ nodes });
  near(pv.r('S1', 'S2'), 0.5, 0, 'full sibs r = 1/2'); near(pv.r('S1', 'H'), 0.25, 0, 'maternal half-sibs r = 1/4 (multiple paternity)');
  near(pv.r('S1', 'C'), 0.125, 0, 'first cousins r = 1/8'); near(pv.r('M', 'S1'), 0.5, 0, 'parent–offspring r = 1/2'); near(pv.r('S1', 'U'), 0.25, 0, 'aunt/uncle r = 1/4');
  near(pv.r('F', 'W'), 0, 0, 'unrelated founders r = 0'); near(pv.r('G1', 'S2'), 0.25, 0, 'grandparent r = 1/4'); near(pv.r('S1', 'S1'), 1, 1e-12, 'r(a, a) = 1');
  near(pv.F('I'), 1 / 16, 1e-15, 'child of first cousins: F = 1/16'); near(pv.kin('I', 'I'), (1 + 1 / 16) / 2, 1e-15, 'φ(I, I) = (1 + F)/2');
  near(pv.r('I', 'S2'), 2 * pv.kin('I', 'S2') / Math.sqrt(1 + 1 / 16), 1e-12, "Wright's r for an inbred individual");
  ok(PedigreeView.frac(pv.r('S1', 'C')) === '1/8' && PedigreeView.frac(0) === '0' && PedigreeView.frac(1) === '1', 'frac writes dyadic r as a fraction');
  const pth = pv.path('S1', 'C'); ok(pth.length === 5 && pth[0] === 'S1' && pth[4] === 'C' && ['G1', 'G2'].indexOf(pth[2]) >= 0, 'path S1 → grandparent → C (4 steps)');
  ok(pv.path('S1', 'S2').length === 3 && pv.path('M', 'S1').join() === 'M,S1' && pv.path('F', 'W').length === 0 && pv.path('S1', 'S1').join() === 'S1', 'paths: sibs via a parent; parent direct; unrelated empty');
  pv.layout({ x: 0, y: 0, w: 380, h: 300 }); const P = pv.pos;
  ok(nodes.every(n => P[n.id] && P[n.id].x > 0 && P[n.id].x < 380 && P[n.id].y > 0 && P[n.id].y < 300), 'every node placed inside the rect');
  ok(P.G1.y < P.M.y && P.M.y < P.S1.y && P.S1.y < P.I.y, 'generations top to bottom'); ok(P.F.y === P.M.y && P.W.y === P.U.y && P.F2.y === P.M.y, 'partners from outside join their mates’ row');
  ok(Math.abs(P.F.x - P.M.x) <= (380 / 4) + 1, 'a partner from outside sits next to its mate ' + JSON.stringify(P)); ok(pv.s >= 14 && pv.s <= 28, 'node size 14–28 px');
  ok(pv.hit(P.S1.x + 3, P.S1.y - 2) === 'S1' && pv.hit(-50, -50) === null, 'hit');
  const t1 = pv.tap(P.C.x, P.C.y); ok(t1 && t1.menu && pv.menu === 'C', 'tap opens the tag menu'); const t2 = pv.tap(P.C.x + PedigreeView.OX[2], P.C.y + PedigreeView.OY[2]); ok(t2 && t2.tag === '1/8' && pv.tags.C === '1/8' && pv.menu == null, 'tap a menu item tags the node');
  pv.focus = 'S1'; ok(pv.key('ArrowRight') && pv.focus !== 'S1', 'arrows walk the nodes'); ok(pv.key('Enter') && pv.menu === pv.focus && pv.key('2') && pv.tags[pv.focus] === '1/4', 'Enter then 2 tags ¼'); pv.tag('S1', null); ok(!('S1' in pv.tags), 'tag(id, null) removes it');
  pv.show('S1', 'C'); ok(pv.hl.length === 5, 'show highlights the path'); const cv = canvas(380, 300), c = cv.getContext('2d'); pv.untagged = true; pv.menu = 'I'; pv.draw(c); pv.draw(c, { theme: 'paper' }); ok(true, 'draw with tags, blazes, dead, genotype, menu and path');
}

/* ---------- 7. Invasion: WF lineages ---------- */
{
  const rules = [{ id: 'hawk', label: 'Hawk' }, { id: 'dove', label: 'Dove' }];
  seed(77); const a = Invasion.create({ rules, you: 0, N: 200, gens: 30, start: [20, 180] }); a.run();
  seed(77); const b = Invasion.create({ rules, you: 0, N: 200, gens: 30, start: [20, 180] }); b.run();
  ok(a.done && a.hist.length === 31 && a.hist.every(r => r[0] + r[1] === 200), 'run: 30 generations, N kept');
  ok(JSON.stringify(a.hist) === JSON.stringify(b.hist), 'same seed, same lineage history');
  let m = 0; const R0 = 400; for (let k = 0; k < R0; k++) { seed(1000 + k); const n = Invasion.create({ rules, N: 100, gens: 10, start: [30, 70] }); n.run(); m += n.share(0); }
  near(m / R0, 0.3, 0.03, 'neutral lineage: mean share stays at its start (martingale)');
  seed(5); const s = Invasion.create({ rules, you: 0, N: 200, gens: 60, start: [20, 180], w: x => [1.3, 1] }); s.run(); ok(s.share(0) > 0.95, 'strong advantage: your rule takes over');
  seed(6); const f = Invasion.create({ rules, you: 0, N: 200, gens: 200, start: [100, 100], w: x => [x[0] < 0.4 ? 1.2 : 0.8, x[0] < 0.4 ? 0.8 : 1.2] }); f.run(); near(f.share(0), 0.4, 0.12, 'negative frequency dependence holds a mix near 0.4');
  const sp = a.spec({ title: 'Your rule' }); ok(sp.type === 'trace' && sp.series[0].you && sp.series[0].d.length === 31 && sp.ghost[0].d.every(v => v === 0.1), 'spec: your share solid, start share dashed');
  const saved = JSON.parse(JSON.stringify(a.save())), c2 = Invasion.create({ rules, from: saved, gens: 30 }); ok(c2.gen === 30 && c2.done && c2.counts.join() === a.counts.join(), 'save → create({from}) restores');
  seed(9); const ran = Invasion.run({ rules: [{ id: 'a' }, { id: 'b' }, { id: 'c', letter: 'C' }], you: 2, N: 150, gens: 5, payoff: () => [1, 1, 1.2] }); ok(ran.done && ran.hist.length === 6, 'Invasion.run (D5 name) with payoff and 3 rules');
  const cv = canvas(360, 120), cc = cv.getContext('2d'); a.draw(cc, { x: 0, y: 10, w: 360, h: 100 }); ran.draw(cc, { x: 0, y: 10, w: 360, h: 100 }); Invasion.create({ rules, N: 1000, start: [400, 600] }).draw(cc, { x: 0, y: 0, w: 360, h: 100 }); ok(true, 'draw two and three rules, and N > 200');
}

/* ---------- 8. Ledger, Pin, GenePoolLens, Evidence, DemeMap, PriceBars, TreeView ---------- */
{
  const L = Ledger.create({ n: 4 }); for (let i = 0; i < 6; i++) L.push({ glyph: 'B', good: i % 2 === 0, t: i }); ok(L.items.length === 4 && L.items[0].t === 2, 'Ledger keeps the last n');
  ok(L.age(L.items[0], 5) === 3 && L.age(L.items[3], 5) === 0 && L.age(L.items[0]) === 0, 'Ledger age: fresh 0, ≥ 3 old');
  const box = L.draw(canvas(200, 40).getContext('2d'), 0, 0, { gen: 5 }); ok(box.w === 4 * 28 + 3 * 4 && box.h === 28, 'Ledger tiles 28 px with 4 px gaps');
  Pin.clear(); Pin.press({ id: 7, ph: { tone: 0.3 } }, 10, 10); Pin.update(0.3); ok(!Pin.isPinned(7), 'Pin: not pinned before 450 ms'); Pin.update(0.2); ok(Pin.isPinned(7) && Pin.list[0].ph.tone === 0.3, 'Pin: pinned after 450 ms, look kept'); Pin.release();
  Pin.press({ id: 8 }, 0, 0); Pin.update(0.2); ok(!Pin.release() && !Pin.isPinned(8), 'Pin: an early release does not pin');
  for (const id of [1, 2, 3, 4]) { Pin.press({ id }, 0, 0); Pin.update(0.5); Pin.release(); } ok(Pin.list.length === 4 && !Pin.isPinned(7) && Pin.isPinned(4), 'Pin: at most 4, the oldest goes');
  Pin.press({ id: 4 }, 0, 0); Pin.update(0.5); Pin.release(); ok(!Pin.isPinned(4), 'Pin: holding a pinned one unpins it');
  Pin.draw(canvas().getContext('2d'), id => [id * 10, 20, 15], id => [[0, 0], [30, 40]]); Pin.clear(); ok(Pin.list.length === 0, 'Pin.clear');
  const items = [{ x: 10, y: 10, r: 14, a: [0, 1] }, { x: 40, y: 10, r: 14, a: [1, 1] }, { x: 70, y: 10, r: 14, a: [0, -1] }, { x: 90, y: 10, r: 5, a: [1, 0] }];
  const lens = GenePoolLens.create({ items: () => items, jar: { x: 0, y: 60, w: 200, h: 80 }, letters: ['A', 'a'], blocksTaps: true });
  near(lens.q(), 4 / 7, 1e-12, 'lens.q: share of copy 1, absent copies skipped'); ok(lens.counts().join() === '3,4', 'lens.counts');
  ok(lens.mode === 'look' && !lens.blocks(), 'lens starts in LOOK and does not block taps'); lens.cycle(); ok(lens.mode === 'genes' && lens.blocks(), 'cycle → GENES, which blocks taps when asked');
  const el = GenePoolLens.control(lens); ok(el.children.length === 3 && el.children[1].getAttribute('aria-checked') === 'true', 'control: three segments, GENES checked');
  lens.set('jars'); ok(el.children[2].getAttribute('aria-checked') === 'true', 'control follows set()'); el.children[0].listeners.click[0](); ok(lens.mode === 'look', 'clicking a segment sets the mode');
  const lc = canvas(240, 160).getContext('2d'); for (const md of ['genes', 'jars']) { lens.set(md); lens.draw(lc); } ok(true, 'lens draws GENES and JARS');
  const ev = Evidence.create({ budget: 10, truth: 'pale', hypotheses: [{ id: 'pale', label: 'Pale survive' }, { id: 'none', label: 'No difference' }],
    instruments: [{ id: 'trap', name: 'Moth trap', cost: 3, sample: n => Array.from({ length: 10 }, (_, i) => i + n) }, { id: 'site', name: 'Rest sites', cost: 6, sample: () => ({ n: 5 }) }],
    power: b => Math.min(1, b.length * 0.3), posterior: b => ({ pale: 0.5 + 0.1 * b.length, none: 0.5 - 0.1 * b.length }) });
  const d1 = ev.buy('trap'); ok(d1 && d1.length === 10 && d1[0] === 1 && ev.left === 7, 'Evidence.buy spends the budget and returns data');
  ev.buy('trap'); ok(ev.left === 4 && ev.count('trap') === 2 && ev.buy('site') === null && ev.left === 4, 'cannot overspend');
  ok(Math.abs(ev.power() - 0.6) < 1e-12 && ev.n() === 20, 'power meter and n from the purchases');
  const host = D.createElement('div'); D.body.appendChild(host); ev.mount(host); ok(host.querySelectorAll('button').length >= 2 + 2 + 5 + 1, 'mount renders tiles, hypotheses, five confidence detents, Conclude');
  const res = ev.conclude('pale', 0.8); near(res.brier, 2 * 0.2 * 0.2, 1e-12, 'Brier for 80% on the truth (two hypotheses)'); near(res.ghost.brier, 2 * 0.3 * 0.3, 1e-12, 'ghost Brier from the posterior'); ok(res.hit, 'hit');
  ok(ev.conclude('none', 0.9) === null, 'one conclusion only'); near(Evidence.snap(0.73), 0.7, 0, 'confidence snaps to the five detents'); near(Evidence.snap(95), 0.9, 0, 'percent input snaps');
  near(Evidence.brier(Evidence.probs(['a', 'b', 'c'], 'b', 0.6), 'a', ['a', 'b', 'c']), 0.2 * 0.2 + 0.6 * 0.6 + 0.8 * 0.8, 1e-12, 'Brier, three hypotheses, wrong call');
  const dm = DemeMap.draw(canvas(300, 200).getContext('2d'), { x: 0, y: 0, w: 300, h: 200 }, SPECS.deme); ok(DemeMap.hit(dm.pts[1].x + 2, dm.pts[1].y) === 1 && DemeMap.hit(-40, -40) === -1, 'DemeMap.hit');
  ok(dm.pts.every(p => p.r >= 7 && p.r <= 28), 'deme discs at most 56 px across');
  PriceBars.draw(canvas(200, 120).getContext('2d'), { x: 0, y: 0, w: 200, h: 120 }, { between: 0.3, within: -0.1, total: 0.2 }); ok(true, 'PriceBars draws negative and positive bars');
  const tv = TreeView.create({ nodes: [{ id: 'r' }, { id: 'x', parent: 'r', t: 1 }, { id: 'A', parent: 'x', t: 1, label: 'A' }, { id: 'B', parent: 'x', t: 2, label: 'B' }, { id: 'C', parent: 'r', t: 3, label: 'C' }] });
  tv.layout({ x: 0, y: 0, w: 300, h: 150 }); ok(tv.tips.join() === 'A,B,C', 'tips in drawing order'); tv.spin('x').layout({ x: 0, y: 0, w: 300, h: 150 }); ok(tv.tips.join() === 'B,A,C', 'spin reverses one node');
  ok(tv.steps({ A: 0, B: 1, C: 1 }) === 1 && tv.steps({ A: 0, B: 0, C: 0 }) === 0, 'Fitch steps');
  tv.reroot('A').layout({ x: 0, y: 0, w: 300, h: 150 }); ok(tv.kids(tv.root).length === 2 && tv.kids(tv.root).indexOf('A') >= 0 && tv.tips.length === 3, 'reroot on the branch above A');
  tv.reroot('C').layout({ x: 0, y: 0, w: 300, h: 150 }); ok(tv.kids(tv.root).indexOf('C') >= 0 && Object.keys(tv.info).filter(k => k === '__root').length === 1 && tv.tips.length === 3, 'a second reroot removes the first virtual root');
  ok(tv.steps({ A: 0, B: 1, C: 1 }) === 1, 'steps do not depend on the root');
  const tc = canvas(300, 150).getContext('2d'); tv.draw(tc, { x: 0, y: 0, w: 300, h: 150 }); const hp = tv.pos.C; ok(tv.hit(hp.x, hp.y) === 'C', 'TreeView.hit');
  const tn = TreeView.create({ nodes: [{ id: 1 }, { id: 2, parent: 1 }, { id: 3, parent: 1 }] }); tn.layout({ x: 0, y: 0, w: 100, h: 100 }); ok(tn.tips.join() === '2,3' && tn.hit(tn.pos[2].x, tn.pos[2].y) === 2, 'numeric ids keep their type');
}

/* ---------- 9. SceneLab (dev): panel, sliders, level chips ---------- */
{
  ok(SceneLab.open('nosuch') === false, 'SceneLab refuses an unknown unit');
  if (fix) {
    ok(SceneLab.open('e5fix') && App.ch === fix, 'SceneLab.open plays the unit'); const panel = D.getElementById('scenelab');
    ok(panel && panel.querySelectorAll('input').length >= 2 && panel.querySelectorAll('.sl-lv').length === 3, 'panel: a slider per P entry, seed box, level chips');
    const sl = panel.querySelector('input'); sl.value = '0.1'; sl.onchange(); ok(fix.P.step.v === 0.1 && App.ch === fix, 'a slider writes ch.P and restarts');
    const s0 = App.seed; panel.querySelectorAll('.sl-lv')[1].onclick(); ok(fix.level === 1 && App.seed === s0, 'a level chip restarts that level with the same seed');
    fix.P.step.v = 0.05; SceneLab.close(); ok(!D.getElementById('scenelab'), 'close removes the panel'); App.exit();
  }
}

/* ---------- 10. source rules ---------- */
{
  const src = fs.readFileSync(path.join(SRC, 'v2', '01_widgets.js'), 'utf8'), code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  ok(!/\bMath\.(exp|log|pow|sin|cos|tan|atan2|random|cbrt|hypot)\b/.test(code), 'no transcendental Math or Math.random in 01_widgets.js');
  ok(!/\bR\(\)/.test(code), 'no direct R() in 01_widgets.js (Invasion draws through WF)');
  ok(!/^(const|let|var|function|class)\s+(URL|Map|Set|Node|Event)\b/m.test(code), 'no shadowed globals');
  const top = code.split('\n').filter(l => /^(Hooks|Object\.assign|if|const|let|LiveGraph\.T|Predict\._ptrFn)/.test(l));
  ok(top.every(l => !/^\s*(Sim|Strip\.|Replay|Rig|Petri)\b/.test(l)), 'top-level code touches only legacy objects and 00_ files');
}

console.log((fails ? 'FAIL' : 'PASS') + ': selftest_e5 ' + passes + ' passed, ' + fails + ' failed (' + path.basename(HTML) + ')');
process.exit(fails ? 1 : 0);
