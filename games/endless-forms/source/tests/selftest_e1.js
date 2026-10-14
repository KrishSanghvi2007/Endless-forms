/* E1 self-test: core.js (R.state, Det, Gen extensions, Save v2, Events).
   node tests/selftest_e1.js          loads source/core.js alone in a Node vm (fresh context per scenario)
   Exit 1 on any failure. No browser needed; the browser-side gates (IndexedDB, iframe) live in selftest_e1_browser.py. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const SRC = path.join(__dirname, '..');
const CORE = fs.readFileSync(path.join(SRC, 'core.js'), 'utf8');

let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL', m); } };
const canon = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) ? Object.fromEntries(Object.keys(x).sort().map(q => [q, x[q]])) : x);
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, m + ' (' + a + ' vs ' + b + ')');

// A fresh core.js in its own context. env: {ls: Map-backed localStorage | 'throw', search, window, App}
function boot(env = {}) {
  const store = env.store || new Map();
  const ls = env.ls === 'throw' ? undefined : { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => { store.set(k, String(v)); }, removeItem: k => { store.delete(k); } };
  const ctx = { console, performance: { now: () => env.now ? env.now() : 1234.4 }, location: { search: env.search || '' } };
  if (ls) ctx.localStorage = ls;
  else Object.defineProperty(ctx, 'localStorage', { get() { throw new Error('SecurityError'); } });
  if (env.window) ctx.window = env.window;
  if (env.App) ctx.App = env.App;
  vm.createContext(ctx);
  vm.runInContext("(function(){'use strict';\n" + CORE + "\nthis.E = {Det, Gen, Save, Events, R, seed, gauss, poisson, TAU, clamp};\n}).call(this);", ctx);
  ctx.E.store = store;
  return ctx.E;
}

/* ---------- 1. R.state / restore ---------- */
{
  const E = boot(); E.seed(99); E.R(); const s = E.R.state(), a = [E.R(), E.R(), E.R()];
  E.R.restore(s); const b = [E.R(), E.R(), E.R()];
  ok(a.join() === b.join(), 'R.restore replays the same draws');
  ok(Number.isInteger(s) && s === (s | 0), 'R.state is an int32');
}

/* ---------- 2. Det accuracy, special values, determinism ---------- */
{
  const { Det } = boot();
  const rel = (x, y) => (x === y ? 0 : Math.abs(x - y) / Math.max(Math.abs(y), 1e-300));
  let worst = { exp: 0, log: 0, sin: 0, cos: 0, pow: 0 };
  const lcg = (() => { let s = 12345; return () => (s = (s * 1103515245 + 12345) % 2147483648) / 2147483648; })();
  for (let i = 0; i < 20000; i++) {
    const x = (lcg() - 0.5) * 1400; worst.exp = Math.max(worst.exp, rel(Det.exp(x), Math.exp(x)));
    const y = Math.exp((lcg() - 0.5) * 1400); worst.log = Math.max(worst.log, rel(Det.log(y), Math.log(y)));
    const z = (lcg() - 0.5) * 2e5;
    // compare away from zeros, where Math itself is only accurate to an absolute 1e-16
    if (Math.abs(Math.sin(z)) > 1e-3) worst.sin = Math.max(worst.sin, rel(Det.sin(z), Math.sin(z)));
    if (Math.abs(Math.cos(z)) > 1e-3) worst.cos = Math.max(worst.cos, rel(Det.cos(z), Math.cos(z)));
    const u = lcg() * 8, v = (lcg() - 0.5) * 20; worst.pow = Math.max(worst.pow, rel(Det.pow(u, v), Math.pow(u, v)));
    const t = lcg() * Math.PI * 2; worst.cos = Math.max(worst.cos, Math.abs(Det.cos(t) - Math.cos(t)) > 2e-16 ? rel(Det.cos(t), Math.cos(t)) : 0);
  }
  for (let i = 1; i <= 64; i++) worst.pow = Math.max(worst.pow, rel(Det.pow(1.0137, i), Math.pow(1.0137, i)), rel(Det.pow(-0.93, -i), Math.pow(-0.93, -i)));
  for (const k in worst) ok(worst[k] <= 1e-14, 'Det.' + k + ' relative error ' + worst[k].toExponential(2) + ' ≤ 1e-14');
  // tiny and subnormal
  ok(rel(Det.log(5e-324), Math.log(5e-324)) < 1e-14, 'Det.log subnormal');
  ok(rel(Det.log(1 + 1e-12), Math.log(1 + 1e-12)) < 1e-12, 'Det.log near 1');
  ok(rel(Det.exp(-740), Math.exp(-740)) < 1e-2, 'Det.exp into the subnormals');
  ok(isFinite(Det.exp(709.782712893384)) && Det.exp(709.7827128933841) === Infinity, 'Det.exp overflow edge');
  ok(Det.exp(-746) === 0 && Det.exp(-Infinity) === 0 && Det.exp(Infinity) === Infinity && isNaN(Det.exp(NaN)), 'Det.exp specials');
  ok(isNaN(Det.log(-1)) && Det.log(0) === -Infinity && Det.log(Infinity) === Infinity && Det.log(1) === 0, 'Det.log specials');
  ok(Object.is(Det.sin(-0), -0) && Det.cos(0) === 1 && isNaN(Det.sin(Infinity)) && isNaN(Det.cos(NaN)), 'Det.sin/cos specials');
  ok(Det.pow(2, 10) === 1024 && Det.pow(-2, 3) === -8 && isNaN(Det.pow(-2, 0.5)) && Det.pow(0, -1) === Infinity && Det.pow(5, 0) === 1, 'Det.pow specials');
  ok(rel(Det.pow(-1.5, 71), Math.pow(-1.5, 71)) < 1e-13 && Det.pow(-1.5, 71) < 0, 'Det.pow negative base, large odd integer');
  // Regression fingerprint of the exact bits (FNV-1a over 3,000 outputs). A change means Det's bits changed:
  // every engine must agree with this, and saved replays depend on it.
  const F = new Float64Array(1), U = new Uint32Array(F.buffer); let h = 0x811c9dc5;
  const feed = v => { F[0] = v; for (const w of [U[0], U[1]]) for (let k = 0; k < 4; k++) { h ^= (w >>> (8 * k)) & 255; h = Math.imul(h, 0x01000193); } };
  for (let i = 0; i < 600; i++) { const x = (i - 300) * 1.37 + 0.123; feed(Det.exp(x / 3)); feed(Det.log(Math.abs(x) + 1e-3)); feed(Det.sin(x * 11)); feed(Det.cos(x * 11)); feed(Det.pow(Math.abs(x) / 50 + 0.01, (i % 37) / 7 - 2)); }
  const fp = (h >>> 0).toString(16);
  const EXPECT = '811a6df1';   // also reproduced by an independent CPython port of Det (docs/changes/wave2/engine_E1.md)
  ok(fp === EXPECT, 'Det bit fingerprint ' + fp + (fp === EXPECT ? '' : ' (expected ' + EXPECT + ')'));
}

/* ---------- 3. Det.gauss / Det.poisson draw exactly like the legacy versions ---------- */
{
  const E = boot();
  for (const l of [0, 0.3, 4, 29.9, 31, 200, undefined]) {
    E.seed(7); const a = []; for (let i = 0; i < 400; i++) a.push(E.poisson(l)); const sa = E.R.state();
    E.seed(7); const b = []; for (let i = 0; i < 400; i++) b.push(E.Det.poisson(l)); const sb = E.R.state();
    ok(sa === sb && a.join() === b.join(), 'Det.poisson(' + l + ') same draws and values as poisson');
  }
  E.seed(11); const g1 = []; for (let i = 0; i < 2000; i++) g1.push(E.gauss()); const s1 = E.R.state();
  E.seed(11); const g2 = []; for (let i = 0; i < 2000; i++) g2.push(E.Det.gauss()); const s2 = E.R.state();
  let md = 0; for (let i = 0; i < g1.length; i++) md = Math.max(md, Math.abs(g1[i] - g2[i]));
  ok(s1 === s2, 'Det.gauss draws the same R() as gauss');
  ok(md < 1e-13, 'Det.gauss values match gauss to ' + md.toExponential(1));
}

/* ---------- 4. Gen: legacy layouts untouched, x layouts reproduce the legacy draws ---------- */
{
  const E = boot(), G = E.Gen;
  const specs = () => [{ k: 'tone', n: 6, m0: 0.5, s0: 0.15, mu: 0.05, msd: 0.04, ve: 0.05 }, { k: 'carb', kind: 'dom', n: 1, p0: 0.3, mu: 0.01, back: 0.02 },
    { k: 'load', kind: 'count', n: 3, c0: 0.8, u: 0.4, cap: 9 }, { k: 'hue', n: 2, m0: 0.4, s0: 0.1, mu: 0.1, msd: 0.05 }];
  const leg = G.layout(specs());
  ok(Object.keys(leg).join() === 'specs,T,L' && !leg.x, 'legacy layout is exactly {specs, T, L}');
  const run = (lay, sd) => {
    E.seed(sd); const pop = []; for (let i = 0; i < 60; i++) pop.push(G.genome(lay, i % 3 ? null : { carb: { p: 0.9 }, tone: { m: 0.2 } }));
    for (let gen = 0; gen < 5; gen++) { const k = []; for (let i = 0; i < 60; i++) k.push(G.mate(lay, pop[(E.R() * 60) | 0], pop[(E.R() * 60) | 0])); pop.splice(0, 60, ...k); }
    const ph = pop.map(g => G.ph(lay, g, 'tone'));
    return { pop, ph, st: E.R.state(), f: G.freq(lay, pop.map(g => ({ g })), 'carb') };
  };
  const A = run(G.layout(specs()), 5);
  const B = run(G.layout(specs().map(s => Object.assign(s, { track: true }))), 5);   // x layout, legacy maths
  const C = run(G.layout(specs().map(s => Object.assign(s, { det: true }))), 5);     // x layout, Det maths
  ok(B.st === A.st && B.pop.every((g, i) => g.join() === A.pop[i].join()) && B.ph.join() === A.ph.join(), 'x layout without det is bit-identical to legacy (genome, mate, ph)');
  ok(C.st === A.st, 'det layout draws the same R() sequence as legacy');
  let md = 0; C.pop.forEach((g, i) => g.forEach((v, j) => { md = Math.max(md, Math.abs(v - A.pop[i][j])); })); C.ph.forEach((v, i) => { md = Math.max(md, Math.abs(v - A.ph[i])); });
  ok(md < 1e-6, 'det layout values equal legacy up to float32 rounding (' + md.toExponential(1) + ')');
  ok(C.f === A.f, 'freq unchanged on a det layout');
  const lx = G.layout(specs().map(s => Object.assign(s, { det: true })));
  ok(lx.x === true && lx.det === true && lx.nextId === 1 && lx.sexed === false, 'x layout flags');
}

/* ---------- 5. Gen ext 2: multi-allele ---------- */
{
  const E = boot(), G = E.Gen;
  const lay = G.layout([{ k: 'blood', kind: 'multi', alleles: 3, p0: [0.6, 0.3, 0.1], dom: [1, 2, 0], mu: 0, det: true }]);
  ok(lay.T.blood.n === 1, 'multi defaults to n = 1');
  E.seed(3); const s0 = E.R.state(); const g = G.genome(lay); E.seed(3); E.R(); E.R(); ok(E.R.state() !== s0 && (() => { E.seed(3); G.genome(lay); const a = E.R.state(); E.seed(3); E.R(); E.R(); return a === E.R.state(); })(), 'multi genome: one R() per copy');
  E.seed(4); const pop = []; for (let i = 0; i < 20000; i++) pop.push(G.genome(lay));
  const f = G.mfreq(lay, pop, 'blood');
  near(f[0], 0.6, 0.01, 'multi p0 share 0'); near(f[2], 0.1, 0.01, 'multi p0 share 2');
  ok(Math.abs(f[0] + f[1] + f[2] - 1) < 1e-12, 'mfreq sums to 1');
  const g12 = new Float32Array([1, 2]), g20 = new Float32Array([2, 0]), g00 = new Float32Array([0, 0]);
  ok(G.mph(lay, g12, 'blood') === 1 && G.mph(lay, g20, 'blood') === 2 && G.mph(lay, g00, 'blood') === 0, 'mph follows the dom order');
  const lc = G.layout([{ k: 'abo', kind: 'multi', alleles: 3, codom: true }]);
  ok(G.mph(lc, new Float32Array([2, 0]), 'abo') === '0/2', 'mph codominant pair is sorted');
  ok(G.ph(lay, g12, 'blood') === 1, 'ph on a multi trait gives the class');
  // mating draws: mu = 0 → one R() per transmitted copy
  E.seed(9); G.mate(lay, g12, g20); const a = E.R.state(); E.seed(9); E.R(); E.R(); ok(a === E.R.state(), 'multi mate with mu 0: one R() per copy');
  // mutation: mu = 1 → every copy changes to another allele
  const lm = G.layout([{ k: 'b', kind: 'multi', alleles: 4, mu: 1 }]); E.seed(2); let changed = 0;
  for (let i = 0; i < 500; i++) { const c = G.mate(lm, g00, g00); if (c[0] !== 0 && c[1] !== 0 && c[0] < 4 && c[1] < 4 && c[0] === Math.floor(c[0])) changed++; }
  ok(changed === 500, 'multi mutation always moves to another valid allele');
}

/* ---------- 6. Gen ext 3: X-linked and haplodiploid ---------- */
{
  const E = boot(), G = E.Gen;
  const lay = G.layout([{ k: 'eye', kind: 'multi', alleles: 2, ploidy: 'X' }, { k: 'size', n: 2, m0: 0.5, s0: 0.1, mu: 0, msd: 0, det: true }]);
  ok(lay.sexed && lay.det, 'X layout is sexed');
  let threw = false; try { G.genome(lay); } catch (e) { threw = true; } ok(threw, 'genome needs o.sex on a sexed layout');
  E.seed(1); const male = G.genome(lay, null, { sex: 'm' }), fem = G.genome(lay, null, { sex: 'f' });
  ok(male[lay.L] === -1 && male.sex === 'm' && fem[lay.L] !== -1 && fem.sex === 'f', 'a male has copy 2 = −1 at an X locus');
  const mom = new Float32Array(2 * lay.L), dad = new Float32Array(2 * lay.L); mom[0] = 0; mom[lay.L] = 1; dad[0] = 1; dad[lay.L] = -1;
  let sonOk = true, dauOk = true;
  for (let i = 0; i < 200; i++) {
    const son = G.mateX(lay, mom, dad, 'm'), dau = G.mate(lay, mom, dad, { sex: 'f' });
    if (son[lay.L] !== -1 || (son[0] !== 0 && son[0] !== 1)) sonOk = false;
    if (dau[lay.L] !== 1) dauOk = false;   // a daughter always carries her father's X
  }
  ok(sonOk, 'a son carries a maternal X and −1'); ok(dauOk, 'a daughter carries her father\'s copy');
  // draw count: daughter: 1 R() for the maternal X, none for the paternal X, 2 per autosomal locus and parent (mu 0 still draws R() < mu, as legacy)
  E.seed(5); G.mate(lay, mom, dad, { sex: 'f' }); const s1 = E.R.state(); E.seed(5); for (let i = 0; i < 9; i++) E.R(); ok(s1 === E.R.state(), 'no R() for a transmission from a single real copy');
  const pop = [{ g: male }, { g: fem }]; const q = G.freq(lay, pop, 'eye'), n = (male[0] + fem[0] + fem[lay.L]) / 3;
  ok(Math.abs(q - n) < 1e-12, 'freq counts present copies only on an X trait');
  const mf = G.mfreq(lay, pop, 'eye'); ok(Math.abs(mf[1] - n) < 1e-7, 'mfreq skips absent copies');
  const lh = G.layout([{ k: 'w', kind: 'dom', n: 1, p0: 0.5, ploidy: 'hap', mu: 0 }, { k: 'c', kind: 'multi', alleles: 3, ploidy: 'hap' }]);
  E.seed(8); const queen = G.genome(lh, null, { sex: 'f' }), drone = G.hap(lh, queen);
  ok(drone.sex === 'm' && drone[lh.L] === -1 && drone[lh.L + 1] === -1, 'Gen.hap: a haploid son');
  const worker = G.mate(lh, queen, drone, { sex: 'f' }); ok(worker[lh.L] === drone[0] && worker[lh.L + 1] === drone[1], 'a haploid father passes his only copy');
  let t2 = false; try { G.hap(lay, fem); } catch (e) { t2 = true; } ok(t2, 'Gen.hap refuses an autosomal trait');
}

/* ---------- 7. Gen ext 5: tracking, clone, pack/unpack; ext 1 and 4 reserved ---------- */
{
  const E = boot(), G = E.Gen;
  const lay = G.layout([{ k: 'a', kind: 'dom', n: 2, p0: 0.5, mu: 0, track: true }, { k: 't', n: 1, m0: 0.5, s0: 0.1, mu: 0.5, msd: 0.1, det: true }]);
  E.seed(1); const f1 = G.genome(lay), f2 = G.genome(lay);
  ok(f1.id === 1 && f2.id === 2 && f1.pa.join() === '0,0' && f1.lin[0] === 2 && f1.lin[lay.L] === 3, 'founders get ids and lineages');
  const kid = G.mate(lay, f1, f2);
  ok(kid.id === 3 && kid.pa.join() === '1,2', 'offspring record their parents');
  ok([2, 3].includes(kid.lin[0]) && [4, 5].includes(kid.lin[lay.L]), 'lineages follow the transmitted copies');
  ok((kid.lin[0] === 2) === (kid[0] === f1[0]) || f1[0] === f1[lay.L], 'lineage matches the copy taken');
  const cl = G.clone(lay, kid); ok(cl.id === 4 && cl.pa.join() === '3,0' && cl.lin.join() === kid.lin.join(), 'clone: new id, pa = [id, 0], same lineages');
  const p = G.pack(lay, kid), js = JSON.parse(JSON.stringify(p)), lay2 = G.layout([{ k: 'a', kind: 'dom', n: 2, p0: 0.5, mu: 0, track: true }, { k: 't', n: 1, m0: 0.5, s0: 0.1, det: true }]);
  const back = G.unpack(lay2, js);
  ok(back.join() === kid.join() && back.id === 3 && back.pa.join() === '1,2' && back.lin.join() === kid.lin.join(), 'pack → JSON → unpack is exact');
  ok(lay2.nextId === 4, 'unpack moves nextId past the ids it restores');
  ok(G.allele(lay, kid, 'a', 1).join() === [kid[1], kid[lay.L + 1]].join(), 'allele(lay, g, k, i)');
  const ll = G.layout([{ k: 'x', n: 2, m0: 0, s0: 0.1, link: { chr: 1, cM: [10] } }]); let t1 = false; try { G.mate(ll, G.genome(ll), G.genome(ll)); } catch (e) { t1 = /link: not yet/.test(e.message); } ok(t1, 'ext link throws "not yet" in mate');
  const lf = G.layout([{ k: 'x', n: 1, m0: 0, s0: 0.1, fx: [{ k: 'y', w: 1 }] }]); let t3 = false; try { G.mate(lf, G.genome(lf), G.genome(lf)); } catch (e) { t3 = /fx: not yet/.test(e.message); } ok(t3, 'ext fx throws "not yet" in mate');
  let t4 = false; try { G.layout([{ k: 'x', n: 1, ploidy: 4 }]); } catch (e) { t4 = true; } ok(t4, 'ploidy 4 is not yet');
}

/* ---------- 8. Save v2 ---------- */
{
  // first run imports the legacy record, never deletes it
  const store = new Map([['endlessforms_v1', JSON.stringify({ stars: { lichen: 3, soot: 1, mendel: 0 }, quick: true, snd: false, done: { lichen: 1 }, opens: 7 })]]);
  const E = boot({ store }), S = E.Save; S.load();
  ok(S.k === 'ef_v2' && S.adapter.kind === 'local' && S.adapter.idb === false, 'v2 key, localStorage adapter');
  ok(S.d.stars.lichen === 3 && S.d.stars.soot === 1 && !('mendel' in S.d.stars) && S.d.quick === true && S.d.snd === false && S.d.done.lichen === 1 && S.d.opens === 7, 'first run imports stars, quick, snd, done, opens');
  ok(store.has('endlessforms_v1') && store.has('ef_v2'), 'legacy key kept, v2 key written');
  ok(S.d.schema === 2 && S.d.ui.th === 'dusk' && S.d.ui.calm === 0 && typeof S.d.rev === 'object', 'v2 defaults');
  S.migrate('lichen'); ok(S.d.v1stars.lichen === 3 && S.d.stars.lichen === 0, 'migrate moves the legacy best to v1stars');
  S.d.stars.lichen = 2; S.migrate('lichen'); ok(S.d.v1stars.lichen === 3 && S.d.stars.lichen === 2, 'migrate runs once per id');
  ok(S.star2('lichen', 0, 1) === 1 && S.star2('lichen', 2, 2) === 2 && S.star2('lichen', 2, 1) === 2, 'star2 → popcount of the unit mask');
  ok(S.d.lv.lichen.join() === '1,0,3' && S.d.s2.lichen === 3, 'star2 accumulates level and unit masks');
  ok(S.star2('soot', 1, 4) === 1 && S.d.v1stars.soot === 1, 'star2 migrates first (deep links skip App.open)');
  S.d.ui.calm = 1; S.d.rev.A1 = 2; S.d.rev.B3 = 2; S.d.rev.C2 = 1; S.d.custom = { a: 1 }; S.d.done.casino = 1; S.save();
  const E2 = boot({ store }), S2 = E2.Save; S2.load();
  ok(canon(S2.d) === canon(S.d), 'save → load round trip of the whole record');
  // legacy chapters keep using stars directly
  S2.star('casino', 2); ok(S2.d.stars.casino === 2, 'legacy star() unchanged');
  // save code round trip into an empty browser
  const code = S2.code(); ok(/^[A-Za-z0-9_-]+$/.test(code), 'save code is base64url');
  const E3 = boot(), S3 = E3.Save; S3.load(); let fired = 0; S3.onLoad(() => fired++);
  ok(fired === 1, 'onLoad calls back at once after load');
  ok(S3.fromCode(code.slice(0, 20) + '\n ' + code.slice(20)) && canon(S3.d) === canon(S2.d) && fired === 2, 'fromCode restores the record and calls onLoad');
  ok(!S3.fromCode('not a code!') && !S3.fromCode(S3._b64e(S3._utf8e('[1,2]'))), 'fromCode rejects junk');
  ok(S3.fromCode(S3._b64e(S3._utf8e(JSON.stringify({ stars: { tree: 2 }, opens: 3 })))) && S3.d.stars.tree === 2, 'fromCode accepts a legacy record');
  // resident snapshots
  const snap = { N: 120, gen: 214, seed: 0xDEADBEEF, freqs: [0.8, 0.1, 0.1, 0, 1], tone: [0.31, 0.12], pins: [{ id: 77, bytes: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 255]) }, { id: 70000, bytes: [9] }] };
  const b64 = S3.res.put('wood', snap), r = S3.res.get('wood');
  ok(S3._b64d(b64).length <= 96 && b64.length <= 128, 'snapshot ≤ 96 bytes, ≤ 128 chars (' + S3._b64d(b64).length + ' bytes)');
  ok(r.N === 120 && r.gen === 214 && r.seed === 0xDEADBEEF && r.freqs.length === 5 && Math.abs(r.freqs[0] - 0.8) <= 0.5 / 255 && Math.abs(r.tone[1] - 0.12) <= 0.5 / 255, 'snapshot fields round trip (quantised)');
  ok(r.pins[0].id === 77 && r.pins[0].bytes.join() === '1,2,3,4,5,6,7,255' && r.pins[1].id === (70000 & 65535) && r.pins[1].bytes.join() === '9,0,0,0,0,0,0,0', 'snapshot pins round trip');
  const big = S3._resEnc({ N: 1e6, gen: -5, seed: -1, freqs: new Array(30).fill(0.5), tone: [2, -1], pins: new Array(9).fill({ id: 1, bytes: new Uint8Array(8) }) });
  ok(S3._b64d(big).length === 69 && big.length <= 92, 'snapshot clamps to nf ≤ 16, np ≤ 4 (max 69 bytes)');
  const rb = S3._resDec(big); ok(rb.N === 65535 && rb.gen === 0 && rb.seed === 0xFFFFFFFF && rb.tone.join() === '1,0', 'snapshot clamps out-of-range values');
  ok(S3.res.get('nowhere') === null, 'missing snapshot → null');
  // worst-case size: 60 units migrated with 6 levels, legacy stars, done, 16 full snapshots, 100 review codes, every ui field set
  const W = boot().Save; W.load();
  const ids = []; for (let i = 0; i < 60; i++) ids.push('unit' + String.fromCharCode(97 + i % 26) + (i > 25 ? 'x' : ''));
  for (const id of ids) { W.d.stars[id] = 3; for (let l = 0; l < 6; l++) W.star2(id, l, 7); W.d.done[id] = 1; }
  for (let p = 0; p < 16; p++) W.d.res['place' + p] = big;
  for (let c = 0; c < 100; c++) W.d.rev[String.fromCharCode(65 + c % 26) + (c / 26 | 0)] = c % 5;
  Object.assign(W.d.ui, { th: 'paper', calm: 1, read: 1, hap: 1, lh: 1, verbs: 255, unt: 1, real: 1 }); W.d.quick = true; W.d.snd = false; W.d.opens = 9999;
  ok(W.size() <= 3500, 'worst-case save ' + W.size() + ' ≤ 3,500 characters');
  // ?v1=1: legacy key and legacy shape
  const vs = new Map([['ef_v2', 'x'], ['endlessforms_v1', JSON.stringify({ stars: { lichen: 2 }, opens: 1 })]]);
  const V = boot({ store: vs, search: '?v1=1' }).Save; V.load();
  ok(V.k === 'endlessforms_v1' && V.d.stars.lichen === 2 && V.d.opens === 1 && V.d.ui.th === 'dusk', '?v1=1 reads the legacy key (v2 defaults still in memory)');
  V.d.done.soot = 1; V.save(); const w1 = JSON.parse(vs.get('endlessforms_v1'));
  ok(w1.done.soot === 1 && w1.stars.lichen === 2 && !('ui' in w1) && !('schema' in w1) && vs.get('ef_v2') === 'x', '?v1=1 writes the legacy shape to the legacy key only');
  // localStorage throws: memory adapter, never throws, code still works
  const M = boot({ ls: 'throw' }).Save; M.load();
  ok(M.adapter.kind === 'memory', 'memory adapter when localStorage throws');
  M.star2('lichen', 0, 7); ok(M.d.stars.lichen === 3 && M.code().length > 10, 'memory adapter keeps working, with a save code');
  // corrupt stored data does not crash
  const C = boot({ store: new Map([['ef_v2', '{oops']]) }).Save; C.load(); ok(C.d.schema === 2, 'corrupt save → fresh defaults');
}

/* ---------- 9. Save over SCORM 1.2 and 2004 ---------- */
for (const v of ['1.2', '2004']) {
  const data = { 'cmi.suspend_data': '' }, calls = [];
  const api = v === '1.2'
    ? { LMSInitialize: () => 'true', LMSGetValue: k => data[k] || '', LMSSetValue: (k, s) => { data[k] = s; calls.push(k); return 'true'; }, LMSCommit: () => 'true', LMSFinish: () => 'true', LMSGetLastError: () => '0' }
    : { Initialize: () => 'false', GetLastError: () => '103', GetValue: k => data[k] || '', SetValue: (k, s) => { data[k] = s; calls.push(k); return 'true'; }, Commit: () => 'true', Terminate: () => 'true' };
  const top = v === '1.2' ? { API: api } : { API_1484_11: api }; top.parent = top;
  const mid = { parent: top }, win = { parent: mid, addEventListener() { } };
  const store = new Map([['endlessforms_v1', JSON.stringify({ stars: { lichen: 3 } })]]);
  const S = boot({ window: win, store }).Save; S.load();
  ok(S.adapter.kind === 'scorm', 'SCORM ' + v + ' adapter found two frames up');
  ok(!S.d.stars.lichen, 'SCORM: no import from this browser\'s legacy save (the LMS is authoritative)');
  ok(calls.includes(v === '1.2' ? 'cmi.core.exit' : 'cmi.exit'), 'SCORM ' + v + ' sets exit = suspend');
  S.star2('census', 0, 3); ok(JSON.parse(data['cmi.suspend_data']).u.census === '0.3', 'SCORM ' + v + ' writes suspend_data');
  const S2 = boot({ window: win }).Save; S2.load(); ok(S2.d.stars.census === 2, 'SCORM ' + v + ' resumes from suspend_data');
}

/* ---------- 10. Events ---------- */
{
  let now = 100;
  const App = { ch: { id: 'lichen', level: 2 }, seed: 42 };
  const E = boot({ App, now: () => now }), V = E.Events;
  const seen = []; const off = V.on('act', r => seen.push(r)), offAll = V.on('*', () => seen.push('*'));
  const r = V.emit('act', { a: { k: 'tap', x: 3 } });
  ok(r.t === 100 && r.type === 'act' && r.unit === 'lichen' && r.level === 2 && r.seed === 42 && r.a.k === 'tap', 'emit stamps t, unit, level, seed');
  ok(seen.length === 2 && seen[0] === r && seen[1] === '*', 'on(type) and on(*) listeners');
  off(); V.emit('act', {}); ok(seen.length === 3, 'off() removes a listener');
  offAll();
  ok(V.emit('fx', { k: 'pop' }) === null && V.log.length === 2, "'fx' is ignored unless debug");
  V.debug = true; now = 250; V.emit('fx', { k: 'pop' }); now = 300; V.emit('act', { a: 'x' }); now = 420; V.emit('fx', { k: 'ring' }); V.emit('act', {});
  ok(JSON.stringify(V.lat()) === '[150,150,120,null]', 'lat(): act → next fx');
  V.emit('predict', { id: 'q1', v: 0.5, note: 'say "hi", ok\nnext' });
  const csv = V.csv(), lines = csv.trim().split('\n');
  ok(lines[0] === 't,type,unit,level,seed,data', 'csv header');
  ok(lines[1] === '100,act,lichen,2,42,"{""a"":{""k"":""tap"",""x"":3}}"', 'csv row with quoted JSON data');
  ok(csv.includes('""say \\""hi\\"", ok\\nnext""'), 'csv escapes quotes, commas and newlines');
  App.ch = null; const r2 = V.emit('open', { level: 0 }); ok(r2.unit === null && r2.level === 0 && r2.seed === 42, 'data overrides the stamped fields; no chapter → unit null');
  for (let i = 0; i < 6000; i++) V.emit('act', { i }); ok(V.log.length === 5000 && V.log[4999].i === 5999, 'ring buffer of 5000');
  V.clear(); ok(V.log.length === 0 && V.csv() === 't,type,unit,level,seed,data\n', 'clear()');
  const E0 = boot(); const r0 = E0.Events.emit('open', {}); ok(r0.unit === null && r0.seed === null, 'emit works without App (Node)');
}

console.log((fails ? 'FAILED ' : 'ok ') + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
