/* E6 self-test: v2/02_hunt_ext.js (Hunt extensions), v2/01_rig.js (Rig and the rigs), v2/01_scenes.js (Petri, Strata).
     node tests/selftest_e6.js [BUILD.html]   runs the suite on BUILD, or on a private build of source/ plus the fixture below
     node tests/selftest_e6.js --build-only   prints the path of that private build (tests/selftest_e6.py uses it)
   The fixture chapter 'e6fix' (a three-level v2 Hunt chapter that switches on every extension) lives only in the private
   copy, never in source/v2. Legacy pass-through is checked against a second private build without 02_hunt_ext.js.
   Exit 1 on any failure. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const SRC = path.join(__dirname, '..');
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, m + ' (' + a + ' vs ' + b + ')');

const FIXTURE = String.raw`
const CH_E6FIX_V2 = {
  id: 'e6fix', v2: true, mode: 'hunt', role: 'environment', place: 'wood',
  intro: { goal: 'Eat the moths you can see.' },
  content: {
    firstWords: 'Tap a moth to eat it. Your four chicks need fifteen a morning.',
    hud: { hunt: '{n} of {m} eaten.' }, whispers: {}, labels: {}, panels: [], interesting: { none: 'Nothing moved this time.' }, levers: {},
    take: 'Selection keeps what the predator misses.', body: 'A fixture for the Hunt extensions.', law: { title: 'Hunt fixture' }, boss: { inverts: 'Two species at once.' },
    stars: { discover: 'Feed every chick.', predict: 'One mark inside the band.', transfer: 'Finish the last level.' },
    model: [{ level: 0, simulated: 'Moths with an additive tone.', simplification: 'A fixture only.', params: [{ name: 'N', value: 30, tag: 'designed' }], cannot: 'Anything real.', nature: 'A test fixture.', contested: false, refs: ['e6'] }],
    why: { real: ['A test fixture.'], maths: ['R = h²S, roughly.'] }
  },
  levels: [{ name: 'Too many moths', adds: 'overproduction', codes: ['A0'], minutes: 2 }, { name: 'Four trunks', adds: 'the search image', codes: ['A0'], minutes: 2 }, { name: 'Two species', adds: 'a second species', codes: ['A0'], minutes: 2 }],
  traits: [{ k: 'tone', n: 4, m0: 0.3, s0: 0.12, mu: 0.02, msd: 0.04, ve: 0.03 }, { k: 'A', n: 1, kind: 'dom', p0: 0.25, mu: 0 }, { k: 'B', n: 1, kind: 'dom', p0: 0.3, mu: 0 }],
  N: 30, cap: 15, roundTime: 12, missCost: 0.5, maxGen: 3, rig: 'moth', models: 0, bitterCost: 3,
  startLevel(n, o, H) {
    this.N = n === 1 ? 120 : 30; this.cap = 15; this.maxGen = 3;
    this.overproduce = n === 0 ? { eggs: 300, K: 30 } : null;
    this.bag = n === 0 ? { need: 15, chicks: 4 } : null;
    this.predict = n === 0 ? { kind: 'x', tol: 0.05, from: 1, axis: { lo: 0, hi: 1 } } : null;
    this.trunks = n === 1 ? { n: 4, hunted: 0, ghost: { jays: 3, bmin: 0.5, bmax: 3, d: { band: 1, mottle: 0.9, speck: 0.8 } } } : null;
    this.searchImage = n === 1 ? { streak: 0.4, switchCost: 0.6, glintAfter: 2 } : null;
    this.lens = n === 1 ? { k: 'A', blocksTaps: true } : null;
    this.migrants = n === 1 ? { m: 2 / 120, from: Hn => Gen.genome(Hn.lay, { A: { p: 0 }, B: { p: 0 } }) } : null;
    this.species = n === 2 ? [{ key: 'bitter', N: 8, traits: [{ k: 'tone', n: 2, m0: 0.1, s0: 0.05, mu: 0, msd: 0, ve: 0 }], toxic: true, cost: 2, phen: (lay, g) => ({ tone: Gen.ph(lay, g, 'tone'), hue: 0.1, mot: 0.1, morph: 'band' }) }] : null;
    this.modelCount = n === 2 ? Hn => 2 + Hn.gen : null;
    this.toxicity = n === 2 ? (Hn, it) => (it.kind === 'model' ? { s: 1.5, starve: 0 } : 2) : null;
    this.detectRule = n === 2 ? { label: 'Contrast', min: 0, max: 1, step: 0.05, v: 0.3 } : null;
    this.barks = n === 2 ? [{ tex: (w, h, d, sv) => barkTex(w, h, d, sv, false) }, { tex: (w, h, d, sv) => barkTex(w, h, d, sv, true), mask: { scale: 3, cut: 0.5 } }] : null;
  },
  phen(lay, g) { return { tone: Gen.ph(lay, g, 'tone'), hue: 0.5, mot: 0.3, morph: Gen.dom(lay, g, 'A') ? 'band' : Gen.dom(lay, g, 'B') ? 'mottle' : 'speck' }; },
  modelPh() { return { tone: 0.1, hue: 0.1, mot: 0.1, morph: 'band', model: true }; },
  morph(ph) { return ph.morph; },
  match(ph, bark) { return HuntX.camo(ph, { T: bark ? 0.15 : 0.8, H: 0.5, M: 0.3 }); },
  focus: { get: ph => ph.tone }, focusName: 'tone',
  objective(H) { let v = 0; for (const x of H.pop) v += this.match(x.ph, 0); v /= Math.max(1, H.pop.length); return { label: 'Camouflage', value: v, goal: 0.99, done: false, text: '' }; },
  expect(H, rec) { return rec.mAll + 0.8 * rec.S; },
  stars: { discover: H => !!H.bag && H.bag.total === 0, predict: H => H.preds.some(p => p.hit), transfer: (H, n) => n === 2 },
  keys: { Enter: 'eat', ArrowLeft: 'move' }, untimed: { looks: 20 },
  encodings: [], starTraits: []
};
V2.push(CH_E6FIX_V2);
PLAN_ADD.push({ sec: 'Dev', entry: ['e6fix', 'Hunt fixture', 'Hunt extensions'] });
`;

function privateBuild(noExt) {
  const tmp = fs.mkdtempSync(path.join(process.env.E6_TMP || os.tmpdir(), 'e6-')), dst = path.join(tmp, 'src');
  fs.mkdirSync(path.join(dst, 'v2'), { recursive: true });
  for (const f of fs.readdirSync(SRC)) if (/\.(js|html|py)$/.test(f) && fs.statSync(path.join(SRC, f)).isFile()) fs.copyFileSync(path.join(SRC, f), path.join(dst, f));
  for (const f of fs.readdirSync(path.join(SRC, 'v2'))) if (/\.js$/.test(f)) fs.copyFileSync(path.join(SRC, 'v2', f), path.join(dst, 'v2', f));
  if (!noExt) fs.writeFileSync(path.join(dst, 'v2', 'e6fixture.js'), FIXTURE);
  const out = path.join(tmp, noExt ? 'e6base.html' : 'e6test.html');
  cp.execFileSync('python3', ['build.py', out], { cwd: dst, env: Object.assign({}, process.env, { V2_ONLY: noExt ? '00_*,01_*,zz_*' : process.env.E6_V2_ONLY || '0*,e6fixture.js,zz_*' }), stdio: 'pipe' });
  return out;
}
if (process.argv[2] === '--build-only') { console.log(privateBuild()); process.exit(0); }
const HTML = process.argv[2] ? path.resolve(process.argv[2]) : privateBuild();
const { load } = require('./vmgame');
const G = load(HTML, { vw: 390, vh: 780 }), TB = G.TB, D = G.document;
if (TB.Intro) TB.Intro.off = true;   // these checks drive levels directly; the opening description card (D6 decision 8) is tested in selftest_e4
const { Rig, Petri, Strata, HuntX, Hunt, App, REG, R, seed, Save, Stage, Predict, Pin, Sim, CVD, Hooks } = TB;
const hashPop = pop => { let h = 2166136261; for (const x of pop) for (const v of x.g) { const s = String(v); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } } return (h >>> 0).toString(16); };
const itemXY = it => [it.x * Stage.w, it.y * Stage.h];
const tapItem = it => { const [x, y] = itemXY(it); Hunt.down(x, y); Hunt.up(x, y); };
const liveItems = (k) => Hunt.items.filter(it => it.alive && (!k || it.kind === k));

/* ---------- 0. load ---------- */
ok(G.errors.length === 0 && !G.errorBox(), 'build loads with no error ' + G.errors.slice(0, 2).join(' | '));
for (const k of ['Rig', 'Petri', 'Strata', 'HuntX']) ok(TB[k], 'TB.' + k + ' exported');

/* ---------- 1. Rig ---------- */
{
  const SP = Rig.species(), want = ['moth', 'beetle', 'crab', 'stickleback', 'lizard', 'warbler', 'dungfly', 'fowl', 'squirrel', 'tit', 'chick', 'artemia', 'isopod', 'lobster', 'mantis', 'fossil'];
  for (const s of want) ok(SP.indexOf(s) >= 0, 'rig defined: ' + s);
  const PH = { moth: [{ tone: 0.3 }, { tone: 0.7, morph: 'band' }, { tone: 0.7, morph: 'mottle' }, { tone: 0.7, morph: 'speck' }, { carb: true }, { tone: 0.5, cg: [0, 1] }], beetle: [{ a: [0, 0] }, { a: [0, 1], dark: 0.3 }, { a: [1, -1] }],
    crab: [{ claw: 'up', ink: 'A' }, { claw: 'down', lum: 0.2 }], stickleback: [{ pelvis: 0, plates: 0 }, { pelvis: 1, plates: 1, red: true }], lizard: [{ morph: 'O' }, { morph: 'B' }, { morph: 'Y' }],
    warbler: [{}, { carry: true, ring: 3 }, { chick: true, gape: true }], dungfly: [{ sex: 'm', size: 1 }, { sex: 'f', size: 0 }], fowl: [{ sex: 'm', comb: 1 }, { sex: 'f' }],
    squirrel: [{ pose: 'up', blaze: 'stripe', call: true }, { pose: 'down', blaze: 'spot', age: 0.3 }], tit: [{ stripe: 0 }, { stripe: 1, carry: true }], chick: [{ fed: 0, gape: true }, { fed: 1 }],
    artemia: [{}], isopod: [{}], lobster: [{}, { maxi: 1 }], mantis: [{}], fossil: ['ammonite', 'trilobite', 'clam', 'brachiopod', 'fish', 'leaf', 'tooth', 'bone', 'worm', 'beetle', 'feather'].map(kind => ({ kind, wear: 0.5 })) };
  const s0 = R.state();
  for (const sp of want) for (const ph of PH[sp]) for (const genes of [false, true]) {
    let cv = null, err = null; try { cv = Rig.bake(sp, ph, 2, { size: 40, genes, letters: true }); } catch (e) { err = e; }
    ok(!err && cv && cv.cw > 0 && cv.ch > 0 && cv.width > 0, 'bake ' + sp + ' ' + JSON.stringify(ph) + (genes ? ' genes' : '') + (err ? ' → ' + err.message : ''));
    const rc = Rig.recipe(sp, ph, { genes }); ok(rc.w > 0 && rc.h > 0 && isFinite(rc.w) && isFinite(rc.h), 'recipe box ' + sp);
  }
  ok(R.state() === s0, 'rigs draw no R()');
  const a = Rig.bake('moth', { tone: 0.5001, hue: 0.5, mot: 0.3 }, 2, { size: 38 }), b = Rig.bake('moth', { tone: 0.5004, hue: 0.5, mot: 0.3 }, 2, { size: 38 });
  ok(a === b, 'bake cache: quantised phenotypes share a canvas');
  ok(Rig.bake('moth', { tone: 0.2, hue: 0.5, mot: 0.3 }, 2, { size: 38 }) !== a, 'a different tone bakes anew');
  ok(Rig.bake('beetle', { a: [0, 1] }, 1, { size: 30, genes: true }) !== Rig.bake('beetle', { a: [0, 1] }, 1, { size: 30 }), 'GENES look is its own cache entry');
  const u = Stage.u >= 100 ? Stage.u : 390; near(Rig.size('hero'), Math.round(0.12 * u), 0.5, 'Rig.size hero = 0.12u'); near(Rig.size('actor'), Math.round(0.07 * u), 0.5, 'Rig.size actor = 0.07u'); near(Rig.size('crowd'), Math.round(0.03 * u), 0.5, 'Rig.size crowd = 0.03u');
  const cv = D.createElement('canvas'), c = cv.getContext('2d');
  const r1 = Rig.draw(c, 'squirrel', { pose: 'up', blaze: 'chevron' }, 100, 100, { size: 48, id: 7, rot: 0.2, halo: true, state: 'idle', t: 1 });
  ok(r1 && r1.anchors && r1.anchors.ear && isFinite(r1.anchors.ear[0]), 'draw returns transformed anchors (ear tag)');
  const j1 = Rig.draw(c, 'moth', { tone: 0.5 }, 0, 0, { id: 11, size: 38 }), j2 = Rig.draw(c, 'moth', { tone: 0.5 }, 0, 0, { id: 11, size: 38 }), j3 = Rig.draw(c, 'moth', { tone: 0.5 }, 0, 0, { id: 12, size: 38 });
  ok(j1.r === j2.r && j1.r !== j3.r, 'id jitter is seeded by id (same id, same size; another id differs)');
  ok(Rig.draw(c, 'moth', { tone: 0.5 }, 5, 5, { state: 'gone', size: 30 }).r === 15, "state 'gone' draws the ghost ring");
  for (const s of want) { const row = Rig.row(s); ok(row && row.scene && row.squint && row.channels && row.channels.length >= 1 && /hero|actor|crowd/.test(row.tier), 'D4 row for ' + s); ok(row.channels.length <= 3, s + ': at most three channels vary (D4 §4.1 rule 2)'); }
  if (CVD && CVD.gamut) { const P = Rig.paints(); for (const s in P) { const bad = CVD.gamut(P[s]); ok(!bad.length, 'natural paint ≥ ΔE 8 from every data ink: ' + s + (bad.length ? ' ' + JSON.stringify(bad.slice(0, 3)) : '')); } }
  { for (let i = 0; i < 1200; i++) Rig.bake('fossil', { kind: 'ammonite', lum: (i % 5) / 4 }, 1 + (i % 4) / 4, { size: 30 + (i % 300) }); ok(Rig.cached <= 900 && Rig.pixels <= 12e6, 'bake cache stays within 900 canvases and 12 M pixels (' + Rig.cached + ', ' + Rig.pixels + ')'); }
  let gnd = null; try { gnd = Rig.ground('rocks', 200, 120, 1, 3); } catch (e) { } ok(gnd && gnd.cv && gnd.cv.width === 200, 'Rig.ground rocks bakes');
  let threw = false; try { Rig.def('bad', {}); } catch (e) { threw = true; } ok(threw, 'Rig.def rejects a rig without recipe or paint');
}

/* ---------- 2. scenes ---------- */
{
  const cv = D.createElement('canvas'), c = cv.getContext('2d'), s0 = R.state();
  const cols = []; for (let i = 0; i < 40; i++) cols.push({ x: Math.cos(i) * 0.7, y: Math.sin(i * 1.3) * 0.7, variant: i % 7 === 0 });
  const pl = Petri.plate(c, 100, 100, 50, { colonies: cols, count: true, jackpot: true, drug: true, label: 'g 12' }); ok(pl && pl.r === 50, 'Petri.plate');
  const gr = Petri.grid(c, { x: 0, y: 0, w: 300, h: 240 }, Array.from({ length: 23 }, (_, i) => ({ colonies: cols.slice(0, i), jackpot: i === 5 }))); ok(gr.length === 20, 'Petri.grid caps at 20 plates (' + gr.length + ')');
  ok(gr.every(p => p.r >= 14), 'grid plates ≥ 28 px across');
  const vv = Petri.velvet({ x: 100, y: 100, r: 50, colonies: cols }, [{ x: 220, y: 100, r: 40 }, { x: 320, y: 100, r: 40, keep: q => true }]);
  ok(vv.links.length === cols.filter(q => q.variant).length + cols.length, 'velvet links: variants on the drug plate, all on the plain one (' + vv.links.length + ')');
  vv.draw(c); ok(typeof vv.done === 'boolean', 'velvet handle draws');
  const fl = Petri.flask(c, 50, 50, { turbidity: 3, label: 'g 31,000' }); ok(fl.r > 0, 'Petri.flask'); ok(Petri.rack(c, { x: 0, y: 0, w: 188, h: 150 }, Array.from({ length: 12 }, (_, i) => ({ turbidity: i % 6 }))).length === 12, 'Petri.rack 4 × 3');
  const sec = Strata.section(c, { x: 10, y: 10, w: 300, h: 300 }, { layers: [{ thick: 2, pattern: 'sand' }, { thick: 1, pattern: 'ash', fossils: [{ x: 0.3, kind: 'ammonite' }] }, { thick: 3, pattern: 'shale' }, { thick: 1, pattern: 'limestone' }, { thick: 1, pattern: 'silt' }], erosion: [{ layer: 2, amp: 0.6 }] });
  ok(sec.length === 5 && Math.abs(sec[0].y1 - 310) < 1e-9 && Math.abs(sec[4].y0 - 10) < 1e-6, 'Strata.section fills the rect bottom to top');
  ok(Strata.zircon(c, 100, 100, { parents: 10, label: '½ left' }).length === 20, 'Strata.zircon: 20 atoms');
  const rl = Strata.ruler(c, { x: 0, y: 0, w: 700, h: 60 }, { decades: [3, 10], marks: [{ t: 4e9, kind: 'you', label: 'you' }, { t: 6.6e7, kind: 'truth' }], window: [1e8, 1e7] });
  let mono = true, inv = true; for (let e = 3; e < 10; e++) for (let k = 1; k <= 9; k++) { const t = k * Math.pow(10, e), t2 = t * 1.05; if (!(rl.X(t2) <= rl.X(t))) mono = false; if (Math.abs(rl.T(rl.X(t)) - t) > t * 1e-9) inv = false; }
  ok(mono, 'ruler: older is further left'); ok(inv, 'ruler: T(X(t)) = t'); ok(rl.X(1e10) < rl.X(1e3), 'ruler spans the decades');
  ok(Strata.range(c, { x: 60, y: 0, w: 300, h: 100, lo: 0, hi: 500 }, [{ label: 'trilobites', found: [480, 260], inferred: [260, 252] }, { label: 'ammonites', found: [400, 70], inferred: [70, 66] }]).length === 2, 'Strata.range');
  ok(R.state() === s0, 'scenes draw no R()');
}

/* ---------- 3. legacy pass-through: Lichen played the same with and without 02_hunt_ext.js ---------- */
const legacyRun = (TBx, gens) => {
  const H = TBx.Hunt; TBx.seed(7); TBx.App.play(TBx.REG.lichen); H.sync = true;
  for (let g = 0; g < gens; g++) { let guard = 0; while (H.state !== 'done' && H.gen === g + 1 && guard++ < 40) { if (H.state === 'dawn') { H.tap(1, 1); continue; } const it = H.items.find(q => q.alive); if (!it) break; H.tap(it.x * TBx.Stage.w, it.y * TBx.Stage.h); } }
  H.sync = false; const keys = Object.keys(H).sort().join(','); TBx.App.exit(); return { pop: hashPop(H.pop), gen: H.gen, total: H.total, keys };
};
{
  ok(Hunt.down === undefined && Hunt.onKey === undefined, 'no pointer or key handlers on Hunt outside a v2 chapter');
  const a = legacyRun(TB, 6);
  const G0 = load(privateBuild(true), { vw: 390, vh: 780 }), b = legacyRun(G0.TB, 6);
  ok(a.pop === b.pop && a.gen === b.gen && a.total === b.total, 'legacy Lichen: same population after 6 generations with and without the extensions (' + a.pop + ' / ' + b.pop + ')');
  ok(a.keys === b.keys, 'legacy Hunt state keys unchanged');
  TB.seed(3); App.play(REG.lichen); ok(Hunt.down === undefined && !('x' in Hunt) && !('bag' in Hunt), 'legacy chapter: getters undefined, no v2 state on Hunt'); App.exit();
}

/* ---------- 4. level 0: bag, overproduction, prediction, pins, the in-canvas dusk ---------- */
const play = (n, sd) => { App.playLevel(REG.e6fix, n, { seed: sd }); G.frames(2); return Hunt; };
const huntMorning = (H, k) => { let guard = 0; while (H.state !== 'dusk' && H.state !== 'done' && guard++ < 80) { const it = liveItems('prey')[0]; if (!it || (k != null && H.eaten >= k)) break; tapItem(it); } };
const toDawn = (H, onAsk) => { let guard = 0; const g = H.gen; while (H.gen === g && H.state !== 'done' && guard++ < 400) { if (H.x && H.x.dk && H.x.dk.phase === 'ask' && onAsk) onAsk(H); G.advance(40); } };
{
  const H = play(0, 101), X = H.x, ch = REG.e6fix;
  ok(H.ch === ch && X && X.level === 0 && ch.level === 0, 'v2 start: level 0');
  ok(H.lay.det === true && H.lay.specs.every(s => s.det === true), 'det: true on every trait spec');
  ok(H.quick === false && H._pAsked === true, 'quick off, ch99 Lichen card disarmed');
  ok(H.pop.length === 30 && H.pop.every(p => typeof p.id === 'number'), 'every individual has an id');
  ok(typeof Hunt.down === 'function' && typeof Hunt.onKey === 'function', 'pointer and key handlers exist for a v2 chapter');
  ok(H.bag && H.bag.fed.length === 4, 'bag: four chicks');
  ok(D.getElementById('hud').textContent.indexOf('Tap a moth') >= 0, 'HUD shows firstWords before the first action');
  ok(H.state === 'dawn' || H.state === 'hunt', 'morning begins');
  const first = liveItems('prey')[0]; tapItem(first);
  ok(H.eaten === 1 && H.bag.fed[0] === 1 && !first.alive && first.ind.eaten, 'a tap at dawn counts: eaten, chick fed');
  ok(Sim.log(ch).some(e => e[1].k === 'tap'), 'taps are logged through Sim.act');
  ok(H.x.fx.length === 1 && H.x.fx[0].k === 'shadow', 'beak shadow queued');
  G.advance(120); ok(H.x.fx.length === 0 || H.x.fx[0].done, 'the shadow gives way to the puffs within 90 ms');
  // a long press pins and does not eat
  const pv = liveItems('prey')[0], [px, py] = itemXY(pv); Hunt.down(px, py); G.advance(520); Hunt.up(px, py);
  ok(pv.alive && Pin.isPinned(pv.ind.id), 'a 450 ms hold pins the moth and does not eat it');
  ok(H.eaten === 1, 'pinning costs no catch');
  // a miss costs half a second
  const t0 = H.time; H.tap(2, Stage.h - 2); ok(Math.abs((t0 - H.time) - 0.5) < 1e-9 || H.time < t0, 'a miss costs time');
  huntMorning(H, 10);
  ok(H.eaten === 10 && H.state === 'hunt', 'ten eaten');
  H.time = 0.01; G.advance(80);
  ok(H.state === 'dusk', 'the clock ends the morning');
  ok(H.bag.starved === 2 && H.bag.total === 2, 'a shortfall of 5 starves ⌈5 ÷ 3.75⌉ = 2 chicks (' + H.bag.starved + ')');
  G.advance(760);
  ok(H.x.dk && H.x.dk.phase === 'eggs' && H.x.brood && H.x.brood.E === 300 && H.x.brood.K === 30, 'dusk opens on the egg tray: 300 eggs, cull to 30');
  ok(H.x.eggs && H.x.eggs.slots.length === 300 && H.x.eggs.per === 1, 'tray: one dot per egg');
  ok(H.x.eggs.slots.filter(s => s.keep).length === 30, 'tray: 30 dots survive the cull');
  ok(H.x.brood.mom.every(m => m >= 0) && new Set(H.x.brood.mom).size <= H.pop.filter(p => !p.eaten).length, 'every egg has a surviving mother');
  let sawAsk = false, rs = null;
  toDawn(H, h => { if (!sawAsk) { sawAsk = true; rs = R.state(); ok(D.getElementById('dock').textContent.indexOf('Lock in') >= 0, 'Lock in on the dock while the prediction is open'); Predict.commit(); } });
  ok(sawAsk, 'a prediction was asked at dusk');
  ok(H.gen === 2 && H.pop.length === 30, 'next generation: K = 30 young');
  ok(H.pop.every(p => Array.isArray(p.pa) && p.pa.length === 2), 'young carry their parents\' ids');
  ok(H.preds.length === 1 && H.preds[0].err != null && H.preds[0].tol === 0.05, 'the prediction was scored against the expectation (' + JSON.stringify(H.preds[0]) + ')');
  const rec = H.hist[0]; near(H.preds[0].expect, rec.mAll + 0.8 * rec.S, 1e-12, 'expectation from ch.expect at commit time');
  ok(rec.starved === 2 && rec.R != null, 'the record carries starved chicks and R');
  const notes = H.notes(); ok(notes.charts[0].type === 'dots' && notes.charts[0].groups.length === 3 && notes.charts[0].arrows.R, 'default notes: eaten, spared, young with S and R');
  // play out the level: the v2 level card appears
  for (let g = 0; g < 3 && H.state !== 'done'; g++) { huntMorning(H); toDawn(H, () => Predict.commit()); }
  ok(H.state === 'done', 'the level ends after maxGen');
  const card = D.querySelector('.card'); ok(card && /lvl|end/.test(card.className) && card.dataset.stars != null, 'v2 level card opens (' + (card && card.className) + ')');
  ok(Save.d.lv.e6fix && Save.d.lv.e6fix[0] != null, 'Save.star2 recorded level 0');
  TB.Cards.close();
}

/* ---------- 5. determinism: the dusk's timing never moves R(), nor does the viewport ---------- */
{
  const G2 = load(HTML, { vw: 1280, vh: 720 }), T2 = G2.TB; if (T2.Intro) T2.Intro.off = true; T2.App.playLevel(T2.REG.e6fix, 0, { seed: 202 }); G2.frames(2);
  const H2 = T2.Hunt; let g2 = 0; while (H2.state !== 'dusk' && g2++ < 80) { const it = H2.items.find(q => q.alive && q.kind === 'prey'); if (!it) break; H2.tap(it.x * T2.Stage.w, it.y * T2.Stage.h); }
  let n2 = 0; while (H2.gen === 1 && n2++ < 400) { if (H2.x.dk && H2.x.dk.phase === 'ask') T2.Predict.commit(); G2.advance(40); }
  const wide = hashPop(H2.pop);
  const run = wait => { const H = play(0, 202); huntMorning(H); let n = 0; toDawn(H, () => { if (n++ >= wait) Predict.commit(); }); return hashPop(H.pop); };
  const a = run(0), b = run(60), c = run(0);
  ok(a === c, 'same seed and taps → same young'); ok(a === b, 'committing late does not change the young');
  ok(a === wide, 'a 1280 × 720 run with the same taps breeds the same young as 390 × 780');
  App.exit();
}

/* ---------- 6. level 1: trunks, ghost jays, search image, lens, migrants ---------- */
{
  const H = play(1, 303), X = H.x;
  ok(H.pop.length === 120 && X.trunk === 0, '120 moths, trunk 1 hunted');
  ok(liveItems('prey').length === 30 && H.pop.filter(p => p.trunk === 0).length === 30, 'an equal share (30) on the hunted trunk');
  ok(H.lens && H.lens.mode === 'look', 'gene-pool lens, LOOK');
  H.lens.set('genes'); const e0 = H.eaten; tapItem(liveItems('prey')[0]); ok(H.eaten === e0, 'lens blocks taps while not LOOK'); H.lens.set('look');
  const q = H.lens.q(); ok(q >= 0 && q <= 1, 'lens q in range');
  // search image: same morph refunds, a switch costs
  const byM = m => liveItems('prey').find(it => REG.e6fix.morph(it.ind.ph) === m);
  const ms = [...new Set(liveItems('prey').map(it => REG.e6fix.morph(it.ind.ph)))];
  H.state = 'hunt'; let it = byM(ms[0]); tapItem(it); const tA = H.time; it = byM(ms[0]); if (it) { tapItem(it); ok(H.time > tA - 0.001, 'same look again refunds time (' + tA + ' → ' + H.time + ')'); }
  if (ms.length > 1) { const tB = H.time; tapItem(byM(ms[1])); ok(H.time < tB - 0.5, 'switching look costs time'); ok(X.veil > 0, 'refocus veil'); }
  G.advance(2200); ok(X.glint && X.glint.alive, 'glint after 2 s without a catch');
  huntMorning(H); ok(H.state === 'dusk', 'morning over');
  ok(H.ghostB >= 0.5 && H.ghostB <= 3, 'fitted b clamped to [0.5, 3] (' + H.ghostB + ')');
  ok(X.jays && X.jays.length === 3 && X.jays.every(j => j.got.length === H.eaten), 'three ghost jays each take the same catch on the other trunks');
  ok(H.pop.filter(p => p.eaten).length === H.eaten * 4, 'all four trunks were hunted (' + H.pop.filter(p => p.eaten).length + ')');
  toDawn(H); ok(H.gen === 2 && H.pop.length === 120, 'gen 2');
  ok(X.migrants === 2 && H.pop.filter(p => p.mig).length === 2, 'two migrants at dawn (m = 2/120)');
  App.exit();
}

/* ---------- 7. the ghost-jay fit recovers b ---------- */
{
  const H = { ch: { trunks: { ghost: { d: { a: 1, b: 0.9, c: 0.8 } } } } };
  let s = 12345; const rnd = () => { s = Math.imul(s ^ s >>> 15, 0x2c1b3c6d) + 0x6D2B79F5 | 0; return ((s ^ s >>> 14) >>> 0) / 4294967296; };
  for (const bt of [0.7, 1.6, 2.4]) {
    const mornings = [];
    for (let m = 0; m < 30; m++) {
      const avail = { a: 18, b: 7, c: 5 }, catches = [];
      for (let k = 0; k < 15; k++) { const keys = Object.keys(avail).filter(z => avail[z] > 0), tot = keys.reduce((t, z) => t + avail[z], 0), w = keys.map(z => H.ch.trunks.ghost.d[z] * Math.pow(avail[z] / tot, bt)), sw = w.reduce((a, b) => a + b, 0); let u = rnd() * sw, j = 0; for (; j < keys.length - 1; j++) { u -= w[j]; if (u < 0) break; } catches.push({ m: keys[j], avail: Object.assign({}, avail) }); avail[keys[j]]--; }
      mornings.push({ catches });
    }
    const fit = HuntX.fitB(H, mornings, 0.5, 3); near(fit, bt, 0.35, 'maximum-likelihood b recovers ' + bt);
  }
  ok(HuntX.fitB(H, [{ catches: [{ m: 'a', avail: { a: 10 } }] }], 0.5, 3) === 1, 'one morph only: flat likelihood → b = 1');
}

/* ---------- 8. level 2: species, models, toxicity, barks, the bird's rule ---------- */
{
  const H = play(2, 404), X = H.x;
  ok(X.sp.length === 1 && X.sp[0].pop.length === 8, 'a second species of 8');
  ok(liveItems('toxic').length === 8 && liveItems('model').length === 3, 'items: 8 toxic, 3 models (2 + gen)');
  ok(H.barkAt(10, 10) === 0 || H.barkAt(10, 10) === 1, 'barkAt gives a bark index');
  let k0 = 0, k1 = 0; for (let i = 0; i < 400; i++) { const v = HuntX.barkAtN(H, (i % 20) / 20, Math.floor(i / 20) / 20); if (v) k1++; else k0++; } ok(k0 > 20 && k1 > 20, 'both barks cover part of the stage (' + k0 + ' / ' + k1 + ')');
  H.state = 'hunt'; const t0 = H.time, tox = liveItems('toxic')[0]; tapItem(tox); ok(H.bitter === 1 && Math.abs(t0 - H.time - 2) < 1e-9 && tox.flee > 0 && !tox.ind.eaten, 'a toxic insect costs 2 s and staggers off alive');
  const t1 = H.time, md = liveItems('model')[0]; tapItem(md); ok(Math.abs(t1 - H.time - 1.5) < 1e-9, 'toxicity(Hn) sets the model cost (1.5 s)');
  ok(D.getElementById('dock').textContent.indexOf('Bird rule') >= 0, 'bird-rule toggle on the dock');
  X.auto = true; X.ruleV = 0; const e0 = H.eaten + H.bitter; G.advance(1400); ok(H.eaten + H.bitter > e0, 'the bird hunts by the rule (' + (H.eaten + H.bitter - e0) + ' taken)');
  X.ruleV = 1.01; const e1 = H.eaten + H.bitter; G.advance(1400); ok(H.eaten + H.bitter === e1, 'above every moth\'s contrast, the bird takes nothing');
  ok(Sim.log(REG.e6fix).some(e => e[1].k === 'auto'), 'auto catches are logged');
  X.auto = false; huntMorning(H); toDawn(H);
  ok(H.gen === 2 && X.sp[0].pop.length === 8, 'the second species bred from its own survivors');
  App.exit();
}

/* ---------- 9. untimed looks and the keyboard ---------- */
{
  Save.d.ui.unt = 1; const H = play(1, 505), X = H.x;
  ok(X.looks === 20, 'untimed: 20 looks (' + X.looks + ')');
  ok(/looks/.test(D.getElementById('hud').textContent), 'HUD counts looks');
  const tm = H.time; G.advance(3000); ok(H.time === tm && H.state !== 'dusk', 'no clock in untimed mode');
  Hunt.onKey('ArrowRight', {}); ok(X.focus && X.focus.alive, 'arrow keys focus a moth'); const f = X.focus; Hunt.onKey('ArrowLeft', {});
  { const fo = X.focus; Hunt.onKey('Enter', { shiftKey: true }); ok(fo && fo.alive && Pin.isPinned(fo.ind.id) && H.eaten === 0, 'Shift+Enter pins the focused moth without eating it'); }
  Hunt.onKey('Enter', {}); ok(!X.focus || X.focus !== f || H.eaten >= 1, 'Enter eats the focused moth');
  const eaten = H.eaten; ok(eaten >= 1 && X.looks <= 19, 'a key catch spends a look (' + X.looks + ')');
  let guard = 0; while (H.state === 'hunt' && guard++ < 40) H.tap(1, Stage.h - 1);
  ok(H.state === 'dusk', 'the morning ends when the looks run out');
  Save.d.ui.unt = 0; App.exit();
}

/* ---------- 10. words and warnings ---------- */
{
  const W = HuntX.WORDS, cnt = s => TB.Txt ? TB.Txt.words(s) : String(s).replace(/\{\w+\}/g, 'X').split(/\s+/).filter(w => /[0-9A-Za-z]/.test(w)).length;
  for (const k in W.hud) ok(cnt(W.hud[k]) <= 15, 'HUD default ≤ 15 words: ' + k);
  for (const k in W.whispers) ok(cnt(W.whispers[k]) <= 8, 'whisper default ≤ 8 words: ' + k);
  for (const k in W.labels) ok(cnt(W.labels[k]) <= 3, 'label default ≤ 3 words: ' + k);
  const L = TB.Lbl ? TB.Lbl.warnings : []; ok(!L.length, 'no Lbl warnings ' + JSON.stringify(L.slice(0, 3)));
  const T = TB.Txt ? TB.Txt.warnings : []; ok(!T.length, 'no Txt warnings ' + JSON.stringify(T.slice(0, 3)));
  ok(G.errors.length === 0 && !G.errorBox(), 'no errors during the suite ' + (G.errorBox() || '') + G.errors.slice(0, 2).join(' | '));
}

console.log((fails ? 'FAILED' : 'PASS') + ': ' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
