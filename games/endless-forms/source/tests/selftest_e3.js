/* E3 self-test: v2/00_wf.js (WF), v2/00_tokens.js (Pal), v2/00_cvd.js (CVD), v2/00_fx.js (Fx, Txt, Lbl, Live, Layer, Ghost, Snd2).
   node tests/selftest_e3.js      loads core.js and the four E3 files in a Node vm with small stubs for the ui.js names they use.
   Exit 1 on any failure. The DOM and live-loop gates (whisper, ghost dismissal, theme adapter, CVD filter, golden) are in selftest_e3.py. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..'), rd = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const FILES = ['v2/00_cvd.js', 'v2/00_fx.js', 'v2/00_tokens.js', 'v2/00_wf.js'];
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, m + ' (' + a + ' vs ' + b + ', tol ' + tol + ')');

// a recording 2D context: every method is a no-op that logs its name; fillText logs its text and the font
function mockCtx() {
  const calls = [], ctx = { calls, font: '', canvas: { width: 100, height: 100 } };
  return new Proxy(ctx, {
    get(t, k) {
      if (k in t) return t[k];
      if (k === 'measureText') return s => ({ width: String(s).length * 7 });
      if (k === 'createRadialGradient' || k === 'createLinearGradient') return () => ({ addColorStop() { } });
      return (...a) => { calls.push(k === 'fillText' ? ['fillText', a[0], t.font] : [k]); };
    },
    set(t, k, v) { t[k] = v; return true; }
  });
}
function boot(o = {}) {
  const timers = [];
  const ctx = {
    console, Math, performance: { now: () => ctx.__t }, __t: 1000,
    setTimeout: (fn, ms) => { timers.push({ at: ctx.__t + (ms || 0), fn }); return timers.length; }, clearTimeout: () => { },
    location: { search: o.search || '', protocol: 'http:' },
    document: { createElement: () => ({ width: 0, height: 0, getContext: () => mockCtx() }), getElementById: () => null, body: null, head: null }
  };
  vm.createContext(ctx);
  const stubs = `
    const EXPORT = {}; const Hooks = { pre: [], frame: [], dt: [], play: [], exit: [], key: [] };
    const Url = { v1: ${!!o.v1}, dev: false, calm: false, projector: false, theme: null, cvd: null };
    const App = { ch: null, scr: 'menu', seed: 7 };
    const isV2 = ch => !!ch && ch.v2 === true;
    Stage.w = 390; Stage.h = 548; Stage.layout = 'phone'; Object.defineProperty(Stage, 'u', { get() { return Math.min(this.w, 1.2 * this.h); } });
    Cards.isOpen = () => false; const Teacher = { on: false };
    function rrect(c, x, y, w, h, r) { c.beginPath(); }
    function applyTheme(t) { }
    function showErr(e) { throw e; }
    const keyName = k => String(k);`;
  const src = FILES.map(rd).join('\n');
  vm.runInContext("(function(){'use strict';\n" + rd('core.js') + stubs + '\n' + src +
    "\nthis.E = {Det, R, seed, rng, Save, Events, App, Stage, Hooks, EXPORT, WF, Pal, CVD, Fx, Txt, Lbl, Live, Layer, Ghost, Snd2, Whisper, getToast: () => toast};\n}).call(this);", ctx);
  const E = ctx.E; E.ctx = ctx; E.timers = timers;
  E.tick = ms => { ctx.__t += ms; for (let i = 0; i < timers.length; i++) if (timers[i] && timers[i].at <= ctx.__t) { const t = timers[i]; timers[i] = null; t.fn(); } };
  E.Save.d = E.Save._fresh();
  return E;
}
const E0 = boot();

/* ---------- 1. WF: draw counts, the spec's exact order, distributions, ghosts ---------- */
{
  const { WF, R, seed, Det } = E0;
  const draws = f => { const s0 = R.state(); f(); const s1 = R.state(); seed(1); let n = 0; R.restore(s0); while (R.state() !== s1 && n < 1e6) { R(); n++; } return n; };
  seed(5); ok(draws(() => WF.binom(10, 0)) === 0 && WF.binom(10, 0) === 0, 'binom p = 0: 0, no draw');
  ok(draws(() => WF.binom(10, 1)) === 0 && WF.binom(10, 1) === 10, 'binom p = 1: n, no draw');
  ok(draws(() => WF.binom(0, 0.3)) === 0 && WF.binom(0, 0.3) === 0, 'binom n = 0: 0, no draw');
  ok(draws(() => WF.binom(20, 0.3)) === 1, 'binom n·p < 30: one draw');
  ok(draws(() => WF.binom(1000, 0.4)) === 2, 'binom n·p ≥ 30: two draws (normal approximation)');
  // reference: the spec text, literally
  const ref = (n, p) => {
    if (p <= 0) return 0; if (p >= 1) return n; if (p > 0.5) return n - ref(n, 1 - p);
    const q = 1 - p;
    if (n * p < 30) { const u = R(); let f = 1; for (let i = 0; i < n; i++) f *= q; f = WF._powi(q, n); let k = 0, c = f; while (u > c && k < n) { f *= (n - k) / (k + 1) * p / q; k++; c += f; } return k; }
    return Math.min(n, Math.max(0, Math.floor(n * p + 0.5 + Math.sqrt(n * p * q) * Det.gauss())));
  };
  let same = true; const cases = [[1, 0.5], [5, 0.3], [20, 0.71], [57, 0.5], [100, 0.2], [400, 0.05], [10000, 0.001], [3000, 0.6], [77, 0.99]];
  for (const [n, p] of cases) { seed(11); const a = []; for (let i = 0; i < 300; i++) a.push(WF.binom(n, p)); seed(11); for (let i = 0; i < 300; i++) if (ref(n, p) !== a[i]) same = false; }
  ok(same, 'binom matches the API_v2 §5.4 algorithm draw for draw');
  ok(WF._powi(0.9, 13) === WF._powi(0.9, 13) && Math.abs(WF._powi(0.9, 13) - Math.pow(0.9, 13)) < 1e-15, 'powi by squaring');
  const mv = (n, p, N) => { let s = 0, s2 = 0; for (let i = 0; i < N; i++) { const x = WF.binom(n, p); s += x; s2 += x * x; } const m = s / N; return [m, s2 / N - m * m]; };
  seed(3); let [m, v] = mv(20, 0.3, 40000); near(m, 6, 0.04, 'binom(20, .3) mean'); near(v, 4.2, 0.12, 'binom(20, .3) variance');
  seed(4); [m, v] = mv(1000, 0.4, 20000); near(m, 400, 0.4, 'binom(1000, .4) mean'); near(v, 240, 10, 'binom(1000, .4) variance');
  seed(6); [m, v] = mv(30, 0.8, 40000); near(m, 24, 0.04, 'binom(30, .8) mean (p > ½ by symmetry)');
  // exact pmf for a small case
  { seed(8); const n = 5, p = 0.3, N = 60000, h = new Array(n + 1).fill(0); for (let i = 0; i < N; i++) h[WF.binom(n, p)]++;
    const C = [1, 5, 10, 10, 5, 1]; let worst = 0; for (let k = 0; k <= n; k++) worst = Math.max(worst, Math.abs(h[k] / N - C[k] * Math.pow(p, k) * Math.pow(1 - p, n - k))); ok(worst < 0.006, 'binom(5, .3) pmf within 0.006 (' + worst.toFixed(4) + ')'); }
  // multinom
  { seed(9); let okSum = true, zero = true; const acc = [0, 0, 0, 0];
    for (let i = 0; i < 5000; i++) { const x = WF.multinom(50, [1, 0, 3, 6]); if (x[0] + x[1] + x[2] + x[3] !== 50) okSum = false; if (x[1]) zero = false; for (let k = 0; k < 4; k++) acc[k] += x[k]; }
    ok(okSum && zero, 'multinom sums to n; a zero weight gets nothing'); near(acc[3] / 5000, 30, 0.2, 'multinom mean of the last type'); near(acc[0] / 5000, 5, 0.1, 'multinom mean of the first type');
    seed(10); const a = WF.multinom(40, [0.2, 0.3, 0.5]); seed(10); const b0 = WF.binom(40, 0.2), b1 = WF.binom(40 - b0, 0.3 / 0.8);
    ok(a[0] === b0 && a[1] === b1 && a[2] === 40 - b0 - b1, 'multinom = conditional binomials in index order');
    ok(WF.multinom(10, [0, 0, 1])[2] === 10 && WF.multinom(10, [1, 0, 0])[0] === 10 && WF.multinom(0, [1, 2]).every(x => x === 0), 'multinom edge weights');
  }
  // hyper, sample
  { seed(12); let s = 0; const N = 30000; for (let i = 0; i < N; i++) s += WF.hyper(50, 20, 10); near(s / N, 4, 0.03, 'hyper(50, 20, 10) mean');
    ok(draws(() => WF.hyper(50, 20, 10)) === 10, 'hyper: one draw per item drawn'); ok(WF.hyper(10, 0, 5) === 0 && WF.hyper(10, 10, 5) === 5, 'hyper edges');
    seed(13); const cnt = new Array(10).fill(0); let distinct = true;
    for (let i = 0; i < 20000; i++) { const x = WF.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3); if (new Set(x).size !== 3) distinct = false; x.forEach(j => cnt[j]++); }
    ok(distinct, 'sample: k distinct items'); ok(cnt.every(c => Math.abs(c / 20000 - 0.3) < 0.015), 'sample: each item chosen with probability k/m');
  }
  // step: neutral, mutation, matrix, extinction, determinism
  { seed(14); let acc = 0; for (let i = 0; i < 4000; i++) acc += WF.step([30, 70], [1, 1], 100)[0]; near(acc / 4000, 30, 0.3, 'step: neutral expectation');
    seed(15); acc = 0; for (let i = 0; i < 4000; i++) acc += WF.step([30, 70], [2, 1], 100)[0]; near(acc / 4000, 100 * 60 / 130, 0.3, 'step: selection weights');
    seed(16); acc = 0; for (let i = 0; i < 4000; i++) acc += WF.step([100, 0], [1, 1], 100, { mu: 0.1 })[1]; near(acc / 4000, 10, 0.2, 'step: mutation to the other type');
    seed(17); acc = 0; for (let i = 0; i < 4000; i++) acc += WF.step([100, 0], null, 100, { M: [[0.8, 0.2], [0, 1]] })[1]; near(acc / 4000, 20, 0.25, 'step: mutation matrix');
    ok(WF.step([0, 0], [1, 1], 10).every(x => x === 0) && WF.step([5, 5], [0, 0], 10).every(x => x === 0), 'step: nobody left reproduces nothing');
    seed(18); const r1 = WF.run([5, 5], [1, 1.1], 10, 30); seed(18); const r2 = WF.run([5, 5], [1, 1.1], 10, 30);
    ok(r1.length === 31 && JSON.stringify(r1.map(a => Array.from(a))) === JSON.stringify(r2.map(a => Array.from(a))), 'run: gens + 1 rows, deterministic');
    seed(19); const r3 = WF.run([5, 5], (x, g) => [1, 1 + 0.01 * g], 10, 5); ok(r3.length === 6, 'run: weights as a function of (x, gen)');
    seed(20); const r4 = WF.run([1, 9], [1, 1], 10, 1000, { stop: c => c[0] === 0 || c[1] === 0 }); ok(r4.length < 1001, 'run: o.stop ends early');
  }
  // neutral fixation = start share; absorption time ≈ 1.39 N; Kimura with selection; heterozygosity decay
  { seed(21); let fix = 0, T = 0; const R_ = 6000;
    for (let i = 0; i < R_; i++) { let c = Int32Array.from([5, 15]), t = 0; while (c[0] > 0 && c[0] < 20) { c = WF.step(c, [1, 1], 20); t++; } if (c[0] === 20) fix++; }
    near(fix / R_, 0.25, 0.02, 'neutral fixation probability = start share');
    seed(22); for (let i = 0; i < R_; i++) { let c = Int32Array.from([10, 10]), t = 0; while (c[0] > 0 && c[0] < 20) { c = WF.step(c, [1, 1], 20); t++; } T += t; }
    near(T / R_ / WF.ghost.absorb(0.5, 20), 1, 0.06, 'mean absorption time ≈ −2N(p ln p + q ln q) (1.39 N)');
    seed(23); fix = 0; const R2 = 20000; for (let i = 0; i < R2; i++) { let c = Int32Array.from([1, 99]); while (c[0] > 0 && c[0] < 100) c = WF.step(c, [1.05, 1], 100); if (c[0] === 100) fix++; }
    near(fix / R2, WF.ghost.kimura(0.01, 100, 0.05), 0.01, 'one new beneficial copy fixes with ≈ Kimura (≈ 2s)');
    seed(24); let H = 0; for (let i = 0; i < 20000; i++) { const r = WF.run([5, 5], [1, 1], 10, 5); const p = r[5][0] / 10; H += 2 * p * (1 - p); }
    near(H / 20000, WF.ghost.decay(0.5, 10, 5), 0.008, 'heterozygosity decays as H0(1 − 1/N)^t');
    ok(WF.ghost.kimura(0.3, 50, 0) === 0.3 && WF.ghost.neutral(0.2) === 0.2 && WF.ghost.kimura(0.5, 50, -1) < 1e-20 && WF.ghost.kimura(0.5, 50, -10) === 0, 'ghost edge cases');
    near(WF.ghost.kimura(1 / 200, 100, 0.01, 2), (1 - Math.exp(-0.02)) / (1 - Math.exp(-4)), 1e-12, 'kimura diploid: S = 4Ns');
  }
  ok(WF.freqs([1, 3]).join() === '0.25,0.75' && WF.freqs([0, 0]).join() === '0,0', 'freqs');
  const src = rd('v2/00_wf.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''), head = src.slice(0, src.indexOf('ghost: {'));
  ok(!/Math\.(exp|log|pow|sin|cos|tan|atan2|expm1|random)\b/.test(head), 'WF: no transcendental Math or Math.random outside WF.ghost');
}

/* ---------- 2. Pal: tokens, places, tokens drawn, D4's measured claims ---------- */
{
  const E = boot(), { Pal } = E;
  ok(Pal.theme === 'dusk' && Pal.A === '#6B97FF' && Pal.a === '#F2C94C' && Pal.line('a') === '#F2C94C', 'Dusk fills; line = fill in Dusk');
  Pal.setTheme('paper', true); ok(Pal.A === '#2F5FD0' && Pal.line('a') === '#AD7B00' && Pal.line('mut') === '#0A9662' && Pal.ground === '#F4EEDD', 'Paper fills and line column');
  Pal.setTheme('projector', true); ok(Pal.ground === '#FFFDF6' && Pal.text === '#1B1612', 'Projector ground and text'); Pal.setTheme('dusk', true);
  ok(Pal.place('wood').ground === Pal.mix('#8F9A7E', '#000000', 0.12) && Pal.place('wood').raw === '#8F9A7E', 'Dusk dims painted grounds ×0.88');
  ok(Pal.place('lab').ground === '#F4EEDD' && Pal.place('beetle').lava && Pal.place('nowhere').id === 'lab', 'plates not dimmed; lava; unknown → lab');
  ok(Pal.places().length === 18, '16 places and 2 layers');
  for (const r of Pal.ROLES) ok(Pal.contrast(Pal.INK.dusk[r], '#152120') >= 5.15, 'Dusk ink ' + r + ' ≥ 5.2:1 (rounded) on the cabinet (D4 §2.1)');
  ok(Pal.contrast(Pal.INK.dusk.text, Pal.INK.dusk.ground) >= 12.4 && Pal.contrast(Pal.INK.paper.text, Pal.INK.paper.ground) >= 13.6, 'text 12.5:1 Dusk, 13.7:1 Paper (D4 §2.3)');
  for (const id of Pal.places()) { const g = Pal.place(id).raw; ok(Math.max(Pal.contrast(g, '#1B1612'), Pal.contrast(g, '#F4EEDD')) >= 4.0, 'ground ' + id + ' ≥ 4:1 against ink or paper outline'); }
  ok(Pal.contrast('#000000', '#FFFFFF') > 20.9, 'contrast black/white = 21');
  const al = [...Array(12).keys()].map(i => Pal.allele(i));
  ok(al.map(a => a.letter).join('') === 'ABCDEFGHIJKL' && al[4].overlay === 'stripe' && al[9].overlay === 'dots' && al[2].fill === Pal.paper && al[3].fill === Pal.ink, 'allele(0..11): four fills × three overlays, letters A–L');
  ok(al[0].text === '#1B1612' && String(al[1]) === Pal.a, 'Dusk blue takes an ink letter; an allele stringifies to its fill'); Pal.setTheme('paper', true); ok(Pal.allele(0).text === '#FFFFFF', 'Paper blue takes a white letter'); Pal.setTheme('dusk', true);
  ok(Pal.nearest(Pal.place('pond').ground) === 'pond' && Pal.nearest('#eef0e2', { text: '#27351F', hue: true }) === 'lab', 'nearest place (OKLab)');
  ok(Pal.nearest('#0d1a2a', { hue: true }) === 'outer' && Pal.nearest('#0c2a1e', { hue: true }) === 'pond' && Pal.nearest('#241a1c', { hue: true }) === 'warren', 'legacy adapter matches dark cabinets by hue (navy → Outer Islands, green → Pond, maroon → Warren)');
  const c = mockCtx(); Pal.token(c, 10, 10, 9, 0); ok(c.calls.some(x => x[0] === 'fillText' && x[1] === 'A'), 'token r ≥ 7 draws its letter A');
  const c2 = mockCtx(); Pal.token(c2, 10, 10, 5, 1); ok(!c2.calls.some(x => x[0] === 'fillText'), 'token under 14 px: no letter');
  const c3 = mockCtx(); Pal.genotype(c3, 10, 10, 12, 0, 1); ok(c3.calls.filter(x => x[0] === 'fillText').map(x => x[1]).join('') === 'Aa', 'genotype Aa: blue left A, amber right a');
  const c4 = mockCtx(); Pal.genotype(c4, 10, 10, 12, 1, -1, { bar: 'Y' }); ok(c4.calls.filter(x => x[0] === 'fillText').map(x => x[1]).join('') === 'aY' && c4.calls.some(x => x[0] === 'fillRect'), 'one-copy token: bar with Y');
  const css = Pal.css(); ok(/--v-A:#6B97FF/.test(css) && /\[data-theme=paper\]\{[^}]*--v-A:#2F5FD0/.test(css) && /--v-place-wood:/.test(css) && /--v-line-a:#AD7B00/.test(css), 'CSS: --v- tokens per theme, places, line inks');
  ok(Pal.rgb('rgb(39,53,31)').join() === '39,53,31' && Pal.rgb('#abc').join() === '170,187,204' && Pal.hex([255, 0, 16]) === '#FF0010', 'colour parsing');
}

/* ---------- 3. CVD: atan2, CIEDE2000 (Sharma 2005), simulation, lints ---------- */
{
  const { CVD, Pal } = boot();
  let worst = 0; const lcg = (() => { let s = 99; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; })();
  for (let i = 0; i < 20000; i++) { const y = (lcg() - 0.5) * 200, x = (lcg() - 0.5) * 200; worst = Math.max(worst, Math.abs(CVD._atan2(y, x) - Math.atan2(y, x))); }
  ok(worst < 1e-14, 'atan2 within 1e-14 of Math.atan2 (' + worst.toExponential(2) + ')');
  ok(CVD._atan2(0, -1) === Math.PI && CVD._atan2(1, 0) === Math.PI / 2 && CVD._atan2(0, 0) === 0, 'atan2 axes');
  const S = [[[50, 2.6772, -79.7751], [50, 0, -82.7485], 2.0425], [[50, 3.1571, -77.2803], [50, 0, -82.7485], 2.8615], [[50, 0, 0], [50, -1, 2], 2.3669],
    [[50, 2.49, -0.001], [50, -2.49, 0.0009], 7.1792], [[50, 2.5, 0], [73, 25, -18], 27.1492], [[50, 2.5, 0], [61, -5, 29], 22.8977],
    [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644], [[63.0109, -31.0961, -5.8663], [62.8187, -29.7946, -4.0864], 1.263],
    [[22.7233, 20.0904, -46.694], [23.0331, 14.973, -42.5619], 2.0373], [[90.9257, -0.5406, -0.9208], [88.6381, -0.8985, -0.7239], 1.5381], [[2.0776, 0.0795, -1.135], [0.9033, -0.0636, -0.5514], 0.9082]];
  let bad = 0; for (const [a, b, d] of S) if (Math.abs(CVD._de(a, b) - d) > 1e-4) { bad++; console.log('  de2000', a, b, CVD._de(a, b), d); }
  ok(bad === 0, 'CIEDE2000 matches Sharma, Wu & Dalal (2005) test pairs to 1e-4');
  ok(CVD.dE('#808080', '#808080') === 0, 'dE of identical colours');
  for (const k of ['deut', 'prot', 'trit']) { const g = CVD.sim([128, 128, 128], k); ok(g.every(v => Math.abs(v - 128) < 0.6), k + ' keeps greys grey'); }
  const m = CVD.sim([200, 60, 30], 'mono'); ok(Math.abs(m[0] - m[1]) < 1e-9 && Math.abs(m[1] - m[2]) < 1e-9, 'mono: equal channels');
  const d = CVD.sim([255, 0, 0], 'deut'); ok(d[0] > 150 && d[0] < 175 && d[1] > 135 && d[1] < 160 && d[2] < 5, 'deuteranopia turns red to olive (' + d.map(Math.round) + ')');
  const inks = Pal.ROLES.map(r => ({ k: r, rgb: Pal.rgb(Pal.INK.paper[r]), channels: ['colour'] }));
  const f = CVD.pairs(inks); ok(f.length === 0, 'Paper fills: all 15 pairs ≥ 8 under normal, deut, prot, trit (' + JSON.stringify(f.slice(0, 3)) + ')');
  const throats = [{ k: 'O', rgb: Pal.rgb('#D98E4A'), channels: ['colour'] }, { k: 'Y', rgb: Pal.rgb('#B8AE66'), channels: ['colour'] }];
  ok(CVD.pairs(throats).some(x => x.kind === 'deut'), 'lizard throats by colour alone fail under deuteranopia (D4 §2.2 rule 3)');
  throats.forEach(t => t.channels.push('pattern')); ok(CVD.pairs(throats).length === 0, 'a shared pattern channel separates them');
  ok(CVD.hue({ starTraits: ['tone', 'hue'], encodings: [{ k: 'tone', channels: ['luminance'] }, { k: 'hue', channels: ['colour'] }] }).join() === 'hue', 'hue lint flags a hue-only star trait');
  ok(CVD.gamut([Pal.INK.dusk.A]).length > 0 && CVD.gamut(['#8F9A7E']).length === 0, 'gamut lint: an ink-coloured paint flagged, bark not');
  const ag = CVD.agree('#3A3A30', '#B8B8A0'); ok(ag > 0.9, 'moth–bark luminance contrast agrees across deuteranopia (' + ag.toFixed(2) + ')');
  ok(CVD.apply('deut') === null, 'apply without a DOM is a no-op');
}

/* ---------- 4. Fx, Txt, Lbl, Live, Layer, Ghost, Snd2 (no DOM) ---------- */
{
  const E = boot(), { Fx, Txt, Lbl, Live, App, Save, R, seed, Stage, Snd2, Ghost } = E;
  ok(Txt.f('{n} of {m} eaten', { n: 3, m: 10 }) === '3 of 10 eaten' && Txt.f('{p}', { p: 0.1 + 0.2 }) === '0.3', 'Txt.f fills and rounds');
  ok(Txt.f('{x} left', {}) === '{x} left' && Txt.warnings.length === 1, 'Txt.f keeps a missing placeholder and warns');
  ok(Txt.words('{n} of {m} eaten') === 4 && Txt.words('<b>Two</b> words — here') === 3 && Txt.words('') === 0, 'Txt.words: a placeholder is one word; dashes are not words');
  // easing
  const sp = [...Array(201).keys()].map(i => Fx.EASE.spring(i / 200)), mx = Math.max(...sp);
  ok(sp[0] === 0 && Math.abs(sp[200] - 1) < 1e-12 && mx <= 1.12, 'spring ease: 0 → 1, overshoot ≤ 12% (' + mx.toFixed(4) + ')');
  ok([0.1, 0.5, 0.9].every(t => Fx.EASE.out(t) > t) && Fx.EASE.inout(0.5) === 0.5, 'out and in-out cubic');
  // tween
  const o = { x: 0, y: 5 }; let done = 0; Fx.tween(o, { x: 10 }, 100, 'linear', () => done++); Fx.update(0.05); near(o.x, 5, 1e-9, 'tween halfway'); Fx.update(0.06);
  ok(o.x === 10 && done === 1 && o.y === 5, 'tween ends exactly and calls done once');
  const o2 = { x: 0 }; Fx.tween(o2, { x: 10 }, 100); Fx.tween(o2, { x: -10 }, 100, 'linear'); Fx.update(0.2); ok(o2.x === -10, 'a newer tween takes the property over');
  const h = Fx.tween(o2, { x: 50 }, 100); h.cancel(); Fx.update(0.2); ok(o2.x === -10, 'cancel');
  // no R() anywhere in the juice path
  seed(31); const s0 = R.state();
  App.ch = { v2: true }; App.scr = 'play';
  Fx.burst('dust', 10, 10, 8); Fx.burst('scale', 1, 1); Fx.pop('+1', 5, 5, 1); Fx.ring(1, 1, 10); Fx.shake(); Fx.tier(2); Fx.flash(); Fx.update(0.1); Fx.draw(mockCtx()); Lbl.put('x', 'hi', 1, 1, { c: mockCtx() });
  ok(R.state() === s0, 'Fx, Lbl never call R()');
  // caps and the governor
  Fx.clear(true); for (let i = 0; i < 40; i++) Fx.burst('spark', 0, 0, 8); ok(Fx.count === 150, 'particle pool capped at 150 on a phone');
  Stage.layout = 'desktop'; for (let i = 0; i < 40; i++) Fx.burst('spark', 0, 0, 8); ok(Fx.count === 300, '300 on desktop'); Stage.layout = 'phone';
  for (let i = 0; i < 29; i++) Fx.govern(25); ok(Fx.gov === 0, 'governor waits for 30 slow frames'); Fx.govern(10); for (let i = 0; i < 30; i++) Fx.govern(25); ok(Fx.gov === 1 && Fx.cap() === 75, 'level 1 halves particles');
  for (let i = 0; i < 30; i++) Fx.govern(25); ok(Fx.gov === 2 && !Fx.squash, 'level 2 drops squash');
  ok(!Fx.calm, 'not Calm yet'); for (let i = 0; i < 30; i++) Fx.govern(25); ok(Fx.gov === 3 && Fx.calm, 'level 3 enters Calm');
}
{
  const E = boot(), { Fx, App, Save, Lbl, Live, Ghost, Snd2, Layer } = E;
  App.ch = { v2: true }; App.scr = 'play';
  // tiers and rate limits
  ok(Fx.tier(1) === 160 && Fx.tier(2) === 600 && Fx.tier(3) === 1200 && Fx.tier(3) === 300, 'tiers 160/600/1200; a second T3 within 3 s plays 300');
  E.tick(3100); ok(Fx.tier(3) === 1200, 'T3 again after 3 s');
  ok(Fx.shake() === true && Fx.shake() === false, 'shake at most once per 600 ms'); E.tick(700); ok(Fx.shake() === true, 'shake after 600 ms');
  ok(Fx.flash() && Fx.flash() && !Fx.flash() && Fx.flash({ edge: true }), 'no more than two bright flashes a second; edge darkening is not a flash');
  // hit-stop through the dt hook
  Fx.hitstop(50); ok(Fx._dt(0.04) === 0 && Fx._dt(0.04) === 0 && Fx._dt(0.04) === 0.04, 'hit-stop returns dt 0 for 50 ms');
  // Calm
  Save.d.ui.calm = 1; ok(Fx.calm && Fx.shake() === false, 'Calm: no shake'); const o = { x: 0 }; Fx.tween(o, { x: 1 }, 1000); Fx.update(0.121); ok(o.x === 1, 'Calm: tweens become 120 ms');
  ok(Fx.tier(2) === 300 && Fx.tier(1) === 160, 'Calm: T2 300 ms'); Save.d.ui.calm = 0;
  // pops merge
  Fx.clear(true); Fx.pop('+1', 50, 50, 1); Fx.pop('+1', 52, 50, 1); Fx.pop('+2', 50, 52, 1); const dc = mockCtx(); Fx.draw(dc);
  ok(dc.calls.filter(x => x[0] === 'fillText').map(x => x[1]).join() === '+4', 'pops within 150 ms merge (+1 +1 +2 → +4)');
  ok(/700 16px/.test(dc.calls.find(x => x[0] === 'fillText')[2]), 'pop is 16 px mono bold');
  // legacy chapters: every hook is a pass-through
  App.ch = { id: 'lichen' }; Fx.burst('dust', 1, 1); Fx.hitstop(100); const lc = mockCtx();
  ok(Fx._dt(0.04) === 0.04, 'legacy: dt untouched even during a hit-stop'); Fx.pre(lc); Fx._frame(0.04, lc); ok(lc.calls.length === 0, 'legacy: the frame hooks draw nothing');
  App.ch = { v2: true }; Fx.clear(true);
  // epoch: a new level keeps what its start() made
  Fx.burst('dust', 0, 0, 4); Fx._frame(0.016, mockCtx()); Fx.burst('egg', 0, 0, 2); Fx._play({}); ok(Fx.count === 2, 'Hooks.play clears effects made before this level, keeps its own');
  Fx._exit(); ok(Fx.count === 0, 'Hooks.exit clears everything');
  // Lbl
  const lc2 = mockCtx(); Lbl.put('a', 'tiny', 0, 0, { c: lc2, size: 10 }); Lbl.put('b', 'one two three four', 0, 0, { c: lc2 });
  ok(Lbl.warnings.length === 2 && /size 10/.test(Lbl.warnings[0].why) && /over 3/.test(Lbl.warnings[1].why), 'Lbl warns under 12 px and over 3 words');
  ok(/600 12px/.test(lc2.calls.find(x => x[0] === 'fillText')[2]), 'Lbl draws an under-size label at 12 px');
  E.Stage.layout = 'projector'; const lc3 = mockCtx(); Lbl.put('c', 'Big', 0, 0, { c: lc3 }); ok(/ 22px/.test(lc3.calls.find(x => x[0] === 'fillText')[2]), 'projector: 14 px labels → 22 px'); E.Stage.layout = 'phone';
  ok(Lbl.list.length === 3, 'Lbl.list records the frame’s labels'); Fx.pre(mockCtx()); ok(Lbl.list.length === 0, 'Fx.pre clears it each frame');
  // Live: ≤ 1 line per 3 s, newest pending wins
  Live.say('one'); Live.say('two'); Live.say('three'); ok(Live.log.length === 1 && Live.log[0].text === 'one', 'Live: first line at once'); E.tick(3001); ok(Live.log.length === 2 && Live.log[1].text === 'three', 'Live: the newest pending line after 3 s');
  // Ghost: once per verb per profile, inert in teacher mode
  Save.d.ui.verbs = 0; const g = Ghost.show({ verb: 'drag', at: () => [10, 10], to: () => [90, 10] }); ok(g.shown && Ghost.active && (Save.d.ui.verbs & 2), 'Ghost shows and sets the drag bit');
  ok(!Ghost.show({ verb: 'drag', at: () => [1, 1] }).shown, 'a shown verb is not demonstrated again'); ok(Ghost.show({ verb: 'drag', at: () => [1, 1], force: true }).shown, 'unless forced (the ? replay)');
  let u = false; Ghost.show({ verb: 'tap', at: () => [5, 5], until: () => u, force: true }); u = true; Ghost._draw(mockCtx(), 0.016); ok(!Ghost.active, 'until() hides it');
  // Layer
  const L = Layer(100, 50); ok(L.w === 100 && L.h === 50 && L.cv, 'Layer has a canvas');
  // Snd2: unknown names warn; a sound without a visual is reported
  ok(Snd2.play('nope') === false && /unknown/.test(Snd2.warnings[0]), 'unknown sound warns');
  Snd2.play('tick'); E.tick(300); Snd2._check(); ok(Snd2.warnings.some(w => /no visual twin: tick/.test(w)), 'a sound with no visual twin is reported');
  const n = Snd2.warnings.length; Snd2.play('scale', { x: 5, y: 5 }); E.tick(300); Snd2._check(); ok(Snd2.warnings.length === n && Fx.count === 6, 'with {x, y} the twin (six scale flakes) is drawn');
  Snd2.play('peep'); Fx.ring(1, 1, 5); E.tick(300); Snd2._check(); ok(Snd2.warnings.length === n, 'an Fx call within 250 ms counts as the twin');
  ok(Snd2.names.length === 12, 'twelve voices (D4 §5.2)');
}
{
  const E = boot({ v1: true }); let calls = 0;
  ok(typeof E.getToast() === 'function' && E.getToast().toString().indexOf('Whisper') < 0, '?v1=1: toast stays the legacy function');
  const E2 = boot(); ok(E2.getToast().toString().indexOf('Whisper') >= 0, 'otherwise toast is rebound to the whisper');
}
/* ---------- 5. source rules ---------- */
{
  for (const f of ['v2/00_fx.js', 'v2/00_tokens.js', 'v2/00_cvd.js']) {
    const s = rd(f).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    ok(!/Math\.(exp|log|pow|sin|cos|tan|atan2|expm1|random)\b/.test(s), f + ': no Math.exp/log/pow/sin/cos/random');
    ok(!/[^.\w]R\(\)/.test(s), f + ': never calls R()');
  }
  const fx = rd('v2/00_fx.js'), tk = rd('v2/00_tokens.js');
  ok((fx.match(/fillText\(/g) || []).length === 1 && (tk.match(/fillText\(/g) || []).length === 1 && !/fillText\(/.test(rd('v2/00_cvd.js') + rd('v2/00_wf.js')), 'one sanctioned fillText each in 00_fx (fxText) and 00_tokens (token glyphs)');
}
console.log('selftest_e3: ' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
