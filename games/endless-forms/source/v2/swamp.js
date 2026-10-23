/* ================= v2/swamp.js: Gene Swamping (Act 4; D3 §5.5, D5 §4 item 16) =================
   Migration against selection on black basalt lava and pale sand dunes, with rock pocket mice (Chaetodipus intermedius):
   dark coats from a dominant Mc1r allele D (Nachman et al. 2003). Role: the selective agent (an owl), then the environment
   (owl roosts), then the island keeper laying ferry routes from a budget (D1 G1 roles 1 and 3).
     L1 One ferry              you hunt on a young lava isle; each dawn a ferry lands pale migrants from the sand isle. Your first
                               two nights set your catch rate s; three rounds at m = 0.02, 0.1 and then above s. Before round three
                               comes the chapter's one prediction: drag the ferry size that would swamp the lava. For a favoured
                               dominant allele and pale migrants the threshold is exactly m = s (Haldane 1930).
     L2 The cline              a coast where lava meets dunes; you place four owl roosts (selection acts where they are); a
                               caliper measures the cline. Then a second owl per roost and shorter dispersal play by themselves,
                               with the key line width ∝ σ ÷ √s (Slatkin 1973).
     L3 Five isles             a neutral marker on five isles of 50 mice; no ferries, then up to five routes. F_ST climbs by
                               drift and settles near 1 ÷ (1 + 4Nm) with Nm migrants a generation (Wright 1931).
     L4 Three ferries (boss)   keep all five isles locally adapted and the marker variable for 100 generations with three ferry
                               routes (L3's verb). Only lava-to-lava and sand-to-sand links win: on a lava–sand link m = 0.3 > s = 0.25.
   Simplified 22 Oct 2026 (D6 decision 9): one prediction in the chapter; L2's longshore current and every other ask are gone.
   Code shape (API_v2 §9): a headless sim (plain JSON; R(), Det, WF only; a run is (seed, level, actions)); all words in SW_TEXT;
   the view juices from Sim.run's events only. Stars and asks read deterministic recursions for the parameters in force, never the
   realised run. Load rule: top-level code touches only legacy objects and lower-numbered v2 files (LiveGraph, wg* helpers);
   engine calls at run time sit behind typeof guards. Under ?v1=1 the learning-layer rewrites at the foot are skipped. */

/* ---------- all words (API_v2 §9.2); tests/lint_text.js checks every budget ---------- */
const SW_TEXT = {
  intro: {   // the opening card (D6 addendum 8)
    game: 'You are a barn owl over volcanic islands at night. Pocket mice live on black lava and on pale sand, and little ferries link the isles.',
    biology: 'Owls catch mice that stand out, so dark coats win on lava. Migrants bring pale coats back, and gene flow can swamp local adaptation.',
    how: 'Tap mice crossing the rock to strike; later, drag owl roosts and ferry routes between isles. Once, you drag a bar to predict.'
  },
  firstWords: 'Night on a young lava isle. Tap a mouse as it crosses the rock to strike.',
  hud: {
    hunt: 'Strike mice crossing the open rock. Four mice feed the owlets tonight.',
    huntU: 'Untimed: each mouse waits in the open. Strike, or tap Let go.',
    dawn: 'Dawn. The ferry lands pale migrants from the sand isle.',
    lapse: 'Nights pass. Owls across the isle hunt as you did.',
    keyHold: 'm = {m} < s = {s}: owls outpace the ferry, so dark coats win.',
    keySwamp: 'm = {m} ≥ s = {s}: the ferry outpaces owls; pale coats swamp.',
    askTh: 'Owls s = {s}. Drag the ferry bar to the size that swamps the lava.',
    gap: 'A new year on the same young isle.',
    build: 'Drag the four owl roosts along the coast. Owls catch mice that stand out.',
    measure: 'The caliper spans the cline, from 80% to 20% dark.',
    owls: 'Owls doubled: s × 2. Width ∝ σ ÷ √s, so it shrinks by √2.',
    wet: 'Wet year: young settle half as far. Width ∝ σ ÷ √s, so it halves.',
    drift: 'No ferries yet. Each isle of 50 mice drifts on its own.',
    lay: 'Drag ferry routes from the harbour or between isles. Five at most.',
    flow: 'F_ST ≈ 1 ÷ (1 + 4Nm): one migrant a generation gives about 0.2.',
    plan: 'Drag up to three ferries between isles. Keep every coat matched and every marker variable.',
    run: 'Ferries swap m = 0.3; owls remove s = 0.25. Lava–sand links: m > s.',
    auto: 'What if? The rest runs by itself.',
    over: 'Done.'
  },
  whispers: {
    drag: 'Drag the ferry bar first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No prediction this time.',
    busy: 'The owl is still climbing.', miss: 'Only bare rock.', escape: 'It slipped into a crack.', fed: 'The owlets are fed.',
    hungry: 'The owlets went short tonight.', budget: 'Ferries all used. Tap a route to lift.',
    nocline: 'No cline yet: put owls on both sides.', lost: 'An isle lost the marker.',
  },
  labels: {
    lock: 'Lock in', letgo: 'Let go', endN: 'End night', measure: 'Measure', sail: 'Sail',
    night: 'Night {n}', round: 'Ferry m = {m}', isle: 'island', dark: '{p}% dark', sand: 'sand isle', ferryL: 'ferry', lava: 'lava', dunes: 'dunes',
    harbour: 'harbour', mainland: 'mainland dunes', w: '{w} km', fst: 'F_ST {f}', xn: 'Selection ×N', ff: 'Tap: faster', catch: '+1',
    roost: 'roost', owls2: 'Owls doubled', wet: 'A wet year', edge: 'lava edge', L1: 'Lava 1', L2: 'Lava 2', S1: 'Sand 1', S2: 'Sand 2', S3: 'Sand 3',
    ok: 'held', bad: 'swamped', drifted: 'drifted', poly: 'variable', fixed: 'lost', strikes: '{n} strikes', fedN: 'owlets {a}/{b}', gen: 'gen {n}', yr: 'year {n}',
    ferries: '{n}/{b} ferries'
  },
  interesting: {
    hungry: 'Your owlets went short on many nights. Dark mice on dark rock are hard to see, so a darkening isle starves owls.',
    lopsided: 'Your roosts sat mostly on one side. Where no owl hunts, the wrong coat costs nothing, and the cline slides.',
    wide: 'The cline stayed broad. Owls near the lava edge set its width; roosts far away hardly matter.',
    allLost: 'With no ferries, every isle drifted alone and some lost the marker for good.',
    fewRoutes: 'Isles without a ferry kept drifting apart. One migrant a generation is enough to hold them together.',
    mixed: 'A ferry linked lava to sand. Pale and dark migrants swamped both sides, so neither isle stayed matched.',
    alone: 'An isle sailed alone. Owls kept it matched, but drift wore its marker down.'
  },
  live: {
    catch: 'Caught a {k} mouse.', dawn: 'Dawn of night {n}: {d}% dark.', gen: 'Generation {n}. F_ST {f}.', width: 'Cline width {w} km.',
    ask: 'Prediction open. Press P, then the arrows.'
  },
  data: {
    dark: ['Dark share at dawn', '{d}%', 'Night {n}, round {r}.'],
    ms: ['Ferry and owls', 'm {m}, s {s}', 'The ferry lands pale coats; owls remove them.'],
    fed: ['Owlets fed', '{a} of {b} nights', 'Four mice a night feed them.'],
    width: ['Cline width', '{w} km', '80% to 20% dark.'],
    centre: ['Cline centre', '{c} km', 'The lava edge is at 30 km.'],
    fst: ['F_ST', '{f}', 'Neutral marker, generation {g}.'],
    routes: ['Ferries', '{n}', 'Each carries about one mouse a generation.'],
    held: ['Isles held', '{n} of 5', 'Matched and still variable.'],
    titles: { dark: 'Dark share on the lava', ms: 'Ferry against owls', cline: 'Dark share along the coast', width: 'Cline width', fst: 'F_ST between isles', map: 'The isles', fst2: 'F_ST: marker and colour' },
    ax: { night: 'night', share: 'dark', km: 'km along the coast', w: 'width (km)', gen: 'generation', f: 'F_ST', rate: 'per generation' },
    lines: { exp: 'expected', mr: 'm {m}', you: 'this round', past: 'earlier', m: 'ferry m', s: 'owls s', w0: '1 owl', w1: '2 owls', w2: 'short hops', marker: 'marker', colour: 'colour gene', theory: '1 ÷ (1 + 4Nm)' }
  },
  levers: { noferry: 'No ferry', weak: 'Half the owls', oneside: 'Lava roosts only', wide: 'Mice roam twice', none: 'No ferries', big: 'Bigger isles', mixed: 'Nearest isles', nofer: 'No ferries' },
  whatifBody: {
    noferry: 'Round two again with no ferry. Night 10 dawned {d}% dark; the model expects {e}%. With m = {m} it expected {e2}%.',
    weak: 'Round two again with owls at s = {s}. Night 10 dawned {d}% dark; the model expects {e}%. Ferry m = {m}: {why}',
    weakSw: 'm now matches or beats s, so the dark coat is swamped.',
    weakOk: 'm is still below s, so dark coats hold on.',
    lastSw: 'Only the last ferry reached s, and it swamped the lava.',
    twoSw: 'From the second ferry on, m reached s, and the lava stayed pale.',
    oneside: 'Roosts on the lava only. Pale mice die there, but nothing removes dark ones on the sand. The centre moved to {c} km; width {w} km.',
    wide: 'Mice now roam twice as far. The cline widened from {w0} to {w} km, close to double: width grows with σ.',
    none: 'No ferries for the last 150 generations. F_ST reached {f}; the model expects {e}. The isles kept drifting apart.',
    big: 'Isles of 200 mice with your ferries: Nm is four times larger. F_ST reached {f}; the model expects {e}.',
    mixed: 'Ferries to the nearest isles, lava with sand. Isles held: {n} of 5. Gene flow between unlike habitats swamped adaptation.',
    nofer: 'No ferries at all. Every isle stayed matched, but marker variation is expected to fall to {h}% of its start.'
  },
  take: 'Gene flow can swamp local adaptation, or keep variation alive. Which depends on whom it links.',
  body: 'Your ferries held {n} of 5 isles. Linking like with like spreads variation without carrying the wrong coat. Linking lava with sand swamps both.',
  law: { title: 'Migration against selection' },
  boss: { inverts: 'Gene flow both helps and harms: it depends on which isles it links.' },
  stars: {
    discover: 'Earn Discover in two of the first three levels.',
    predict: 'Predict the ferry size that swamps the lava.',
    transfer: 'Hold all five isles with three ferries.'
  },
  levelStars: [
    { discover: 'Feed the owlets on three of four nights.', predict: 'Drag the ferry bar to within 0.05 of the swamping size.' },
    { discover: 'Build a sharp cline centred on the lava edge.' },
    { discover: 'Lay ferries that hold F_ST below 0.3.' },
    { transfer: 'Hold all five isles: matched coats and a variable marker.' }
  ],
  levelTake: [
    'Local adaptation holds while migration m stays below selection s. Once m reaches s, the migrants win.',
    'A cline is as wide as dispersal over the root of selection: width ∝ σ ÷ √s.',
    'Drift splits small isles apart; about one migrant a generation holds them together.'
  ],
  levelBody: [
    'Your owls had s = {s}. Night 10 dawned {a}%, {b}% and {c}% dark with ferry m = {m1}, {m2} and {m3}. {k}',
    'Your first cline was {w0} km wide. Two owls per roost gave {w1} km, {r}× narrower (√2 = 1.41). Short hops gave {w2} km.',
    'With no ferries F_ST reached {f1}; the model expected {e1}. With your ferries it reached {f2}; the model expects {e2}.'
  ],
  model: [
    { level: 0, simulated: 'A lava isle of 200 mice. One gene sets coat colour; the dark allele D is dominant. Each dawn the ferry lands pale migrants.',
      simplification: 'You hunt one clearing; owls across the isle take pale and dark mice at your rates. After round one, owls hunt at your s.',
      params: [{ name: 'migration m', value: '0.02, 0.1, then above s', tag: 'designed' }, { name: 'selection s', value: 'your catch rate, 0.1 to 0.5', tag: 'xN', real: 'unknown; strong enough to beat local gene flow' }, { name: 'isle size N', value: 200, tag: 'designed' }, { name: 'nights per round', value: 10, tag: 'designed' }],
      cannot: 'Habitat choice by mice or other predators. Owls see colour here; in owl trials with oldfield mice, mismatched mice were caught more often.',
      nature: 'Pocket mice on the Pinacate lava in Arizona are mostly dark; mice on nearby pale rock are light. On New Mexico lava, other genes make dark coats.',
      contested: false, refs: ['nachman2003', 'hoekstra2003', 'haldane1930', 'hoekstra2004', 'kaufman1974'] },
    { level: 1, simulated: 'A coast of 60 one-kilometre patches, lava then dunes. Owls near each roost remove mismatched mice. Young mice settle near where they were born.',
      simplification: 'The colour gene acts additively here, so the cline is symmetric. Patches are large, so drift is ignored; a trickle of mutation keeps both coats.',
      params: [{ name: 'dispersal σ', value: '3 km, then 1.5 km', tag: 'designed' }, { name: 'selection per owl', value: 0.05, tag: 'xN', real: 'unknown for these mice' }, { name: 'roost reach', value: '12 km', tag: 'designed' }],
      cannot: 'Mice that prefer matching rock, or patchy habitat along the coast.',
      nature: 'Beach mice in Florida are palest on coastal sand. Inland, on darker soils, coats grow darker: a classic cline.',
      contested: false, refs: ['slatkin1973', 'endler1977', 'mullen2008'] },
    { level: 2, simulated: 'Five isles of 50 mice and a neutral marker with two alleles. Each ferry carries about one mouse each way every generation.',
      simplification: 'Generations do not overlap; every mouse breeds at random within its isle. The mainland is huge and never drifts.',
      params: [{ name: 'isle size N', value: 50, tag: 'designed' }, { name: 'migrants per ferry', value: 'about 1 a generation', tag: 'designed' }, { name: 'generations', value: 250, tag: 'designed' }],
      cannot: 'Unequal isle sizes, extinction and recolonisation, or mutation.',
      nature: 'In pocket mice, F_ST between lava and pale sites is low for neutral genes but high at Mc1r. Gene flow mixes the genome; selection holds the colour gene apart.',
      contested: false, refs: ['wright1931', 'whitlock1999', 'hoekstra2004'] },
    { level: 3, simulated: 'The five isles again, now with owls on every isle and the colour gene too. Up to three ferries, each linking two isles.',
      simplification: 'A ferry swaps 30% of the mice at each end every generation. Owls remove mismatched coats at s = 0.25.',
      params: [{ name: 'selection s', value: 0.25, tag: 'xN', real: 'unknown' }, { name: 'ferry migration', value: '0.3 a generation', tag: 'designed' }, { name: 'isle size N', value: 50, tag: 'designed' }, { name: 'generations', value: 100, tag: 'designed' }],
      cannot: 'Ferries that run one way, or mice that choose matching rock.',
      nature: 'Conservation managers face this choice. Corridors can rescue small populations from drift. Links between unlike habitats can swamp local adaptation.',
      contested: false, refs: ['lenormand2002', 'frankham2015'] }
  ],
  why: {
    real: ['Rock pocket mice on lava flows are dark; mice on pale rock are light. They meet and mix. Neutral genes differ little between sites, but Mc1r differs sharply.'],
    maths: ['Linked isles share alleles. Same-habitat links keep variation without carrying the wrong coat; unlike links bring migrants that selection must keep removing.']
  },
  levelWhy: [
    { real: ['Hopi Hoekstra and colleagues found dark and light pocket mice exchanging migrants between lava and pale rock. Colour still matched the rock, so selection must outpace migration.'],
      maths: ['Pale migrants arrive at rate m; owls remove pale mice at rate s. Pale copies settle where q² = m(1 − s) ÷ (s(1 − m)). That reaches 1 exactly when m = s.'] },
    { real: ['Montgomery Slatkin showed that a cline’s width grows with dispersal and shrinks with the square root of selection. Narrow clines mean strong selection or short dispersal.'],
      maths: ['Width scales as σ ÷ √s. Doubling s narrows the cline by √2, about 29%. Halving σ halves it.'] },
    { real: ['Sewall Wright’s island model links F_ST to migration. About one migrant a generation keeps isles from drifting far apart, whatever their size.'],
      maths: ['At balance, F_ST ≈ 1 ÷ (1 + 4Nm), with N mice and m the migrant share. Nm = 1 gives about 0.2.'] }
  ]
};
/* ---------- tunables and timings ---------- */
const SWP_C = {
  dt: 1 / 30, N1: 200, d0: 0.2, night: 14, lam: 2, cross: 1.35, busy: 0.85, maxOpen: 3, catchP: [0.95, 0.55], untE: 22, untS: 10, feed: 4,
  dawnT: 1.5, lapseT: 0.32, bannerT: 1.2, gapT: 1.3, askMax: 30,
  ND: 60, E: 30, R: 12, sig0: 3, buildMax: 45, holdT: 2.6, thTol: 0.05, thHi: 0.8,
  Ni: 50, gps: 12, fGens: [100, 250], layMax: 60, sB: 0.25, mF: 0.3, bossG: 100, planMax: 75, bossGps: 10, bossMax: 3
};
const SW_ISLES = [[0.17, 0.28, 1], [0.83, 0.28, 1], [0.5, 0.16, 0], [0.72, 0.62, 0], [0.28, 0.62, 0]];   // [x, y, lava?]: two lava isles far apart, three sand isles

const CH_SWAMP_V2 = {
  id: 'swamp', v2: true, role: 'environment', place: 'beetle',
  accent: '#7A6FC0',   // owl-night indigo: the chapter's chrome tint and intro card (D6 addendum 7); the scene paints basalt black, ochre sand and night indigo
  intro: { goal: 'Hunt, roost and ferry: see when migrants swamp local adaptation.' },
  content: SW_TEXT, C: SWP_C,   // C: the timings and model constants, exposed for the oracle
  P: {
    N1: { v: 200, tag: 'designed', min: 50, max: 1000, label: 'lava isle mice' },
    sr: { v: 0.05, tag: 'xN', min: 0.005, max: 0.1, real: 'unknown for these mice', label: 'selection per owl' },
    Ni: { v: 50, tag: 'designed', min: 20, max: 400, label: 'mice per small isle' },
    sB: { v: 0.25, tag: 'xN', min: 0.05, max: 0.6, real: 'unknown', label: 'owl selection, boss' },
    mF: { v: 0.3, tag: 'designed', min: 0.01, max: 0.5, label: 'ferry migration, boss' }
  },
  levels: [
    { name: 'One ferry', adds: 'migration rate', codes: ['M1'], minutes: 5 },
    { name: 'The cline', adds: 'dispersal distance', codes: ['M2'], minutes: 3 },
    { name: 'Five isles', adds: 'drift between isles', codes: ['M3'], minutes: 3 },
    { name: 'Three ferries', adds: 'whom gene flow links', codes: ['M4'], minutes: 3 }
  ],
  keys: { Space: 'strike or continue', ArrowRight: 'next target or roost', ArrowLeft: 'move roost', '0-5': 'isle or roost', Enter: 'measure or sail', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why are lava mice dark when pale migrants keep arriving?', 'Is gene flow good or bad for a population? Give a case for each.', 'This model lets owls see only colour. What would mice that pick matching rock change?'], pool: 'trace' },
  starTraits: ['dark'],
  encodings: [   // coat luminance carries the selected trait; isles by position and shape; ferries by label and dash, never hue
    { k: 'dark', rgb: [44, 38, 34], channels: ['luminance', 'shape'] }, { k: 'pale', rgb: [216, 188, 134], channels: ['luminance', 'shape'] },
    { k: 'lava', rgb: [30, 29, 34], channels: ['luminance', 'shape', 'position'] }, { k: 'sand', rgb: [210, 165, 94], channels: ['luminance', 'pattern', 'position', 'shape'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: SWP_C.dt, s: null, _k: {},
    P() { return CH_SWAMP_V2.P; },
    reset(level, o) {
      o = o || {}; const n = Math.max(0, Math.min(3, level | 0));
      if (o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.lever(o.thaw.lever); return; }
      this.s = { level: n, phase: 'banner', t: 0, unt: false, whatif: null, auto: false, asks: [], pred: {}, exp: {}, tol: {}, hits: {}, cnt: {}, ask: null, resume: null, acc: 0, log: [] };
      const s = this.s;
      if (n === 0) { s.N = this.P().N1.v; s.sY = null; s.rd = []; s.hunts = []; s.mid = 0; s.h = null; this.startRound(s, 0, []); }
      else if (n === 1) { s.p = new Array(SWP_C.ND).fill(0.5); s.roosts = [36, 42, 48, 54]; s.owls = 1; s.sig = SWP_C.sig0; s.ws = []; s.moved = 0; s.sw = 0; s.phase = 'build'; s.disc = false; s.tl = 0; }
      else if (n === 2) { s.N = this.P().Ni.v; s.p = [0.5, 0.5, 0.5, 0.5, 0.5]; s.routes = []; s.gen = 0; s.f = this.zf(); s.F = [0]; s.FE = [0]; s.phase = 'banner'; s.lost = 0; s.e1 = this.expF(this.zf(), [], s.N, SWP_C.fGens[0]); }
      else { s.N = this.P().Ni.v; s.p = [0.5, 0.5, 0.5, 0.5, 0.5]; s.pD = [0.55, 0.55, 0, 0, 0]; s.routes = []; s.gen = 0; s.f = this.zf(); s.Fn = [0]; s.Fc = [this.fstVar(s.pD)]; s.En = [0]; s.Ec = [s.Fc[0]]; s.phase = 'plan'; }
    },
    zf() { return [0, 1, 2, 3, 4].map(() => [0, 0, 0, 0, 0]); },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt;
      if (s.phase === 'ask') { if (!s.unt && !s.auto && s.t >= SWP_C.askMax) this.commit(s, ev, s.ask.id, null); return ev; }
      if (s.level === 0) this.isleStep(s, ev); else if (s.level === 1) this.coastStep(s, ev); else if (s.level === 2) this.islesStep(s, ev); else this.bossStep(s, ev);
      return ev;
    },

    /* ---------- L1: the lava isle. Dawn ferry (pale dd migrants), the owl's night, random mating ---------- */
    p0() { return 1 - Math.sqrt(1 - SWP_C.d0); },
    dawnDark(p, f) { const q = 1 - p; return (1 - f) * (1 - q * q); },                    // dark share after the ferry lands
    selP(p, f, wD, wd) { const q = 1 - p, DD = (1 - f) * p * p, Dd = (1 - f) * 2 * p * q, dd = (1 - f) * q * q + f, W = wD * (DD + Dd) + wd * dd; return W > 0 ? wD * (DD + Dd / 2) / W : p; },
    exp10(p, k, sY, m) { for (let n = k + 1; n <= 9; n++) p = this.selP(p, m, 1, 1 - sY); return this.dawnDark(p, m); },   // after night k: dawn of night 10, deterministic
    eqDark(sY, m) { if (m >= sY) return 0; const q2 = m * (1 - sY) / (sY * (1 - m)); return this.dawnDark(1 - Math.sqrt(q2), m); },
    mBig(sY) { return Math.max(0.3, Math.ceil(1.3 * sY * 20 - 1e-9) / 20); },
    mOf(s, r) { if (s.mOver != null) return s.mOver; return r === 0 ? 0.02 : r === 1 ? 0.1 : this.mBig(s.sY == null ? 0.3 : s.sY); },
    hands(s, n) { return !s.auto && ((s.r === 0 && (n === 1 || n === 2 || n === 10)) || (s.r === 2 && n === 10)); },   // four hands-on nights: s is measured on the first two
    startRound(s, r, ev) { s.r = r; s.m = this.mOf(s, r); s.p = this.p0(); s.n = 0; s.rd[r] = { m: s.m, d: [], dark0: SWP_C.d0 }; s.phase = 'banner'; s.t = 0; ev.push({ k: 'round', r, m: s.m }); },
    nextNight(s, ev) {
      s.n++; const k = WF.binom(s.N, s.m), f = k / s.N; s.f = f; const d = this.dawnDark(s.p, f); s.dark = d; s.rd[s.r].d.push(Math.round(d * 1e4) / 1e4);
      s.phase = 'dawn'; s.t = 0; ev.push({ k: 'dawn', n: s.n, mig: k, d, lapse: !this.hands(s, s.n) });
      if (s.n === 10 && s.r === 2 && s.exp.th != null) ev.push({ k: 'reveal', id: 'th' });
    },
    isleStep(s, ev) {
      if (s.phase === 'banner') { if (s.t >= (s.auto ? 0.3 : SWP_C.bannerT)) this.nextNight(s, ev); return; }
      if (s.phase === 'gap') { if (s.t >= SWP_C.gapT) { if (s.r === 1 && !s.auto && s.exp.th == null) this.openAsk(s, ev, 'th', 'y', 0, SWP_C.thHi, SWP_C.thTol, s.m, s.sY, 'gap', Math.abs(s.sY - s.m) > SWP_C.thTol, 1, 0.5); else this.startRound(s, s.r + 1, ev); } return; }   // the chapter's one prediction: the ferry size that swamps (m = s)
      if (s.phase === 'dawn') {
        const lapse = !this.hands(s, s.n); if (s.t < (lapse ? (s.auto ? 0.2 : SWP_C.lapseT) : SWP_C.dawnT)) return;
        if (lapse) { if (s.auto && s.n === 10) { s.phase = 'over'; ev.push({ k: 'over' }); return; } this.breed(s, 1, 1 - (s.sW != null ? s.sW : s.sY)); ev.push({ k: 'lapse', n: s.n }); this.afterNight(s, ev); return; }
        s.phase = 'hunt'; s.t = 0; s.h = { t: 0, mice: [], busy: 0, em: [0, 0], ca: [0, 0], n: 0, strikes: 0, fed: 0, cd: 0.6 }; ev.push({ k: 'hunt', n: s.n }); return;
      }
      if (s.phase === 'hunt') this.huntStep(s, ev);
    },
    breed(s, wD, wd) { const ps = this.selP(s.p, s.f, wD, wd); s.p = WF.binom(2 * s.N, ps) / (2 * s.N); },
    huntStep(s, ev) {
      const h = s.h, dt = this.dt; h.t += dt; if (h.busy > 0) h.busy--;
      for (const mo of h.mice) { if (s.unt && !mo.go && mo.u >= 0.5) continue; mo.u += dt / SWP_C.cross; }
      const gone = h.mice.filter(mo => mo.u >= 1); if (gone.length) { h.mice = h.mice.filter(mo => mo.u < 1); for (const mo of gone) ev.push({ k: 'gone', id: mo.id }); }
      if (s.unt) {
        if (!h.mice.length && h.n < SWP_C.untE && h.strikes < SWP_C.untS) { h.cd -= dt; if (h.cd <= 0) { this.emerge(s, ev); h.cd = 0.5; } }
        if (!h.mice.length && (h.n >= SWP_C.untE || h.strikes >= SWP_C.untS) && h.busy === 0) this.endHunt(s, ev);
        return;
      }
      if (h.t < SWP_C.night - SWP_C.cross && h.mice.length < SWP_C.maxOpen && R() < SWP_C.lam * dt) this.emerge(s, ev);
      if (h.t >= SWP_C.night && !h.mice.length && h.busy === 0) this.endHunt(s, ev);
    },
    emerge(s, ev) { const h = s.h, dark = R() < s.dark, mo = { id: ++s.mid, dark, u: 0 }; h.mice.push(mo); h.em[dark ? 1 : 0]++; h.n++; ev.push({ k: 'emerge', id: mo.id, dark }); },
    strike(s, ev, a) {
      const h = s.h; if (!h || s.phase !== 'hunt') return;
      if (h.busy > 0) { ev.push({ k: 'busy' }); return; }
      if (s.unt && h.strikes >= SWP_C.untS) return;
      h.strikes++; h.busy = Math.round(SWP_C.busy / this.dt);
      const mo = a.id ? h.mice.find(q => q.id === a.id) : null;
      if (!mo) { ev.push({ k: 'miss', x: a.x, y: a.y }); return; }
      if (R() < SWP_C.catchP[mo.dark ? 1 : 0]) { h.mice = h.mice.filter(q => q !== mo); h.ca[mo.dark ? 1 : 0]++; h.fed++; ev.push({ k: 'catch', id: mo.id, dark: mo.dark, u: mo.u, fed: h.fed }); }
      else { mo.u = 1; mo.go = true; h.mice = h.mice.filter(q => q !== mo); ev.push({ k: 'escape', id: mo.id, dark: mo.dark, u: mo.u }); }
    },
    rate(c, e) { return e > 0 ? c / e : 0; },
    endHunt(s, ev) {
      const h = s.h, cp = this.rate(h.ca[0], h.em[0]), cd = this.rate(h.ca[1], h.em[1]);
      this.breed(s, 1 - cd, 1 - cp); s.hunts.push({ r: s.r, n: s.n, em: h.em.slice(), ca: h.ca.slice(), fed: h.fed, strikes: h.strikes });
      ev.push({ k: 'nightend', fed: h.fed, ok: h.fed >= SWP_C.feed }); s.h = null;
      if (s.r === 0 && s.n === 2) { const H = s.hunts.filter(x => x.r === 0), ep = H.reduce((a, x) => a + x.em[0], 0), ed = H.reduce((a, x) => a + x.em[1], 0), kp = H.reduce((a, x) => a + x.ca[0], 0), kd = H.reduce((a, x) => a + x.ca[1], 0);
        const c1 = this.rate(kp, ep), c2 = Math.min(0.95, this.rate(kd, ed)), raw = 1 - (1 - c1) / (1 - c2); s.sY = Math.max(0.1, Math.min(0.5, Math.round(raw * 100) / 100)); s.sRaw = Math.round(raw * 1000) / 1000; ev.push({ k: 'sY', s: s.sY }); }
      this.afterNight(s, ev);
    },
    afterNight(s, ev) {
      if (s.n >= 10) { if (s.r < 2 && !s.auto) { s.phase = 'gap'; s.t = 0; ev.push({ k: 'endround', r: s.r }); } else { s.phase = 'over'; ev.push({ k: 'over' }); } return; }
      this.nextNight(s, ev);
    },

    /* ---------- L2: the coast. Haploid additive colour gene on 60 patches; owls near roosts; dispersal; a longshore current ---------- */
    kern(sig) { const key = String(sig); if (this._k[key]) return this._k[key]; const R0 = Math.ceil(3.5 * sig), k = []; let t = 0; for (let d = -R0; d <= R0; d++) { const w = Det.exp(-d * d / (2 * sig * sig)); k.push([d, w]); t += w; } return (this._k[key] = k.map(q => [q[0], q[1] / t])); },
    sprof(roosts, owls) { const C = SWP_C, sr = this.P().sr.v, out = new Array(C.ND).fill(0); for (const r of roosts) for (let i = 0; i < C.ND; i++) { const d = Math.abs(i + 0.5 - r), w = d <= C.R - 2 ? 1 : d >= C.R + 2 ? 0 : (C.R + 2 - d) / 4; out[i] += owls * sr * w; } return out; },
    gen2(p, sp, sig) {
      const C = SWP_C, N = C.ND, k = this.kern(sig), ps = new Array(N), np = new Array(N).fill(0);
      for (let i = 0; i < N; i++) { const si = Math.min(0.9, sp[i]), x = p[i]; ps[i] = i < C.E ? x / (1 - si * (1 - x)) : x * (1 - si) / (1 - si * x); }
      for (let i = 0; i < N; i++) for (const [d, w] of k) { let j = i + d; if (j < 0) j = -j - 1; if (j >= N) j = 2 * N - j - 1; np[j] += ps[i] * w; }
      const out = np;
      for (let i = 0; i < N; i++) out[i] = Math.max(0.001, Math.min(0.999, out[i]));   // a trickle of new mutations: neither coat quite vanishes
      return out;
    },
    equil(p, roosts, owls, sig) { const sp = this.sprof(roosts, owls); let q = p.slice(); for (let t = 0; t < 4000; t++) { const nq = this.gen2(q, sp, sig); let d = 0; for (let i = 0; i < nq.length; i++) d = Math.max(d, Math.abs(nq[i] - q[i])); q = nq; if (d < 1e-7) break; } return q; },
    measure(p) {   // width: km between the 80% and 20% dark crossings; centre: the 50% crossing (p falls from lava to sand)
      const N = p.length, cross = v => { for (let i = 0; i < N - 1; i++) { const a = p[i], b = p[i + 1]; if ((a - v) * (b - v) <= 0 && a !== b) return i + 0.5 + (a - v) / (a - b); } return null; };
      const a = cross(0.8), b = cross(0.2), c = cross(0.5), r3 = x => Math.round(x * 1000) / 1000;
      return { w: a != null && b != null ? r3(Math.abs(b - a)) : 60, c: c != null ? r3(c) : (p[0] >= 0.5 ? 60 : 0), a: a == null ? null : r3(a), b: b == null ? null : r3(b) };
    },
    coastStep(s, ev) {
      const C = SWP_C;
      if (s.phase === 'build' || s.phase === 'relax') {
        const sp = this.sprof(s.roosts, s.owls), G = s.phase === 'relax' ? 4 : 2; let d = 0;
        for (let g = 0; g < G; g++) { const nq = this.gen2(s.p, sp, s.sig); for (let i = 0; i < nq.length; i++) d = Math.max(d, Math.abs(nq[i] - s.p[i])); s.p = nq; }
        s.sw += this.dt; if (s.sw >= 0.25) { s.sw = 0; this.swoop(s, ev, sp); }
        if (s.phase === 'build') { s.tl += this.dt; if (s.tl >= C.buildMax || s.auto) this.doMeasure(s, ev); }
        else if ((d < 2e-5 && s.t >= 1.2) || s.t >= 6) this.relaxed(s, ev);
        return;
      }
      if (s.phase === 'measured' && s.t >= 1.5) this.nextCoast(s, ev);
      if (s.phase === 'hold' && s.t >= SWP_C.holdT) this.nextCoast(s, ev);
    },
    swoop(s, ev, sp) {   // one roost swoops each quarter second, in turn, on the most mismatched patch in reach (view juice only; no R())
      const C = SWP_C, i = s.swi = ((s.swi || 0) + 1) % s.roosts.length, r = s.roosts[i]; let best = -1, bv = 0.02;
      for (let d = 0; d < C.ND; d++) { if (Math.abs(d + 0.5 - r) > C.R) continue; const mis = d < C.E ? 1 - s.p[d] : s.p[d], v = mis * sp[d]; if (v > bv) { bv = v; best = d; } }
      if (best >= 0) ev.push({ k: 'swoop', r: i, d: best, dark: best >= C.E });
    },
    doMeasure(s, ev) {
      s.p = this.equil(s.p, s.roosts, s.owls, s.sig); const m = this.measure(s.p); s.ws.push({ w: m.w, c: m.c, st: 0 });
      if (!s.auto) s.disc = Math.abs(m.c - SWP_C.E) <= 3 && m.w <= 20 && s.p[8] >= 0.8 && s.p[52] <= 0.2;
      s.phase = 'measured'; s.t = 0; ev.push({ k: 'measured', w: m.w, c: m.c });
    },
    nextCoast(s, ev) {   // after Measure the two changes play by themselves, each with its key line (D6 decision 9: no asks here)
      const st = s.ws.length;
      if (s.auto || st >= 3) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
      if (st === 1) s.owls = 2; else s.sig = SWP_C.sig0 / 2;
      s.phase = 'relax'; s.t = 0; ev.push({ k: 'change', st });
    },
    relaxed(s, ev) {
      s.p = this.equil(s.p, s.roosts, s.owls, s.sig); const m = this.measure(s.p), st = s.ws.length; s.ws.push({ w: m.w, c: m.c, st });
      s.phase = 'hold'; s.t = 0; ev.push({ k: 'measured', w: m.w, c: m.c });
    },

    /* ---------- L3: five isles, a neutral marker, ferry routes; drift then migration each generation ---------- */
    Mrow(s, routes, N) {   // M[i] over [isles 0–4, mainland 5]: share of isle i's genes from each source after migration
      const M = [0, 1, 2, 3, 4].map(i => { const r = [0, 0, 0, 0, 0, 0]; r[i] = 1; return r; }), m = 1 / N;
      for (const [a, b] of routes) { if (a < 0) { M[b][b] -= m; M[b][5] += m; } else { M[a][a] -= m; M[a][b] += m; M[b][b] -= m; M[b][a] += m; } }
      return M;
    },
    fstep(f, M, N) {   // identity by descent relative to the founding pool: drift (within isles) then migration; the mainland never drifts (f = 0)
      const g = f.map((r, i) => r.map((v, j) => i === j ? 1 / (2 * N) + (1 - 1 / (2 * N)) * v : v)), nf = this.zf();
      for (let i = 0; i < 5; i++) for (let j = i; j < 5; j++) { let a = 0; for (let k = 0; k < 5; k++) { const mk = M[i][k]; if (!mk) continue; for (let l = 0; l < 5; l++) a += mk * M[j][l] * g[k][l]; } nf[i][j] = nf[j][i] = a; }
      return nf;
    },
    fstE(f) { let w = 0, b = 0; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { if (i === j) w += f[i][i] / 5; else b += f[i][j] / 20; } return b < 1 ? (w - b) / (1 - b) : 0; },
    fstHat(p) { const n = p.length, m = p.reduce((a, x) => a + x, 0) / n; let v = 0; for (const x of p) v += (x - m) * (x - m); v /= n - 1; const den = m * (1 - m) + v / n; return den > 1e-9 ? Math.min(1, v / den) : 0; },
    fstVar(p) { const n = p.length, m = p.reduce((a, x) => a + x, 0) / n; let v = 0; for (const x of p) v += (x - m) * (x - m); v /= n; const den = m * (1 - m); return den > 1e-9 ? Math.min(1, v / den) : 0; },
    expF(f, routes, N, gens) { const M = this.Mrow(this.s, routes, N); let q = f; for (let t = 0; t < gens; t++) q = this.fstep(q, M, N); return this.fstE(q); },
    gen3(s) {
      const N = s.N, M = this.Mrow(s, s.routes, N), lost0 = s.p.filter(x => x <= 0 || x >= 1).length;
      const d = s.p.map(x => WF.binom(2 * N, x) / (2 * N));
      s.p = [0, 1, 2, 3, 4].map(i => { let a = M[i][5] * 0.5; for (let k = 0; k < 5; k++) a += M[i][k] * d[k]; return Math.round(a * 1e9) / 1e9; });
      s.f = this.fstep(s.f, M, N); s.gen++; s.F.push(Math.round(this.fstHat(s.p) * 1e4) / 1e4); s.FE.push(Math.round(this.fstE(s.f) * 1e4) / 1e4);
      return s.p.filter(x => x <= 0 || x >= 1).length > lost0;
    },
    islesStep(s, ev) {
      if (s.phase === 'banner') { if (s.t >= (s.auto ? 0.1 : SWP_C.bannerT)) { s.phase = s.auto ? 'flow' : 'drift'; s.t = 0; s.acc = 0; } return; }
      if (s.phase === 'drift' || s.phase === 'flow') {
        s.acc += this.dt * SWP_C.gps * (s.auto ? 3 : 1);
        while (s.acc >= 1) {
          s.acc -= 1; if (this.gen3(s)) { s.lost++; ev.push({ k: 'lost' }); }
          if (s.gen % 5 === 0) ev.push({ k: 'gen', g: s.gen });
          if (s.phase === 'drift' && s.gen >= SWP_C.fGens[0]) { s.snap100 = { p: s.p.slice(), f: s.f.map(r => r.slice()), F: s.F.slice(), FE: s.FE.slice() }; s.phase = 'lay'; s.t = 0; s.acc = 0; ev.push({ k: 'lay' }); return; }
          if (s.phase === 'flow' && s.gen >= SWP_C.fGens[1]) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
        }
        return;
      }
      if (s.phase === 'lay' && s.t >= SWP_C.layMax) this.sail3(s, ev);
    },
    route(s, ev, a, b) {   // L3 (from the harbour, -1, or between isles; five at most) and the boss (between isles; three at most)
      const boss = s.level === 3; if (s.phase !== (boss ? 'plan' : 'lay')) return; a = a | 0; b = b | 0; if (a > b) { const t = a; a = b; b = t; }
      if (a === b || b < 0 || b > 4 || a < (boss ? 0 : -1) || a > 4) return;
      const i = s.routes.findIndex(r => r[0] === a && r[1] === b);
      if (i >= 0) { s.routes.splice(i, 1); ev.push({ k: 'unroute', a, b }); return; }
      if (s.routes.length >= (boss ? SWP_C.bossMax : 5)) { ev.push({ k: 'budget' }); return; }
      s.routes.push([a, b]); ev.push({ k: 'route', a, b });
    },
    sail3(s, ev) { if (s.phase !== 'lay') return; s.e2 = this.expF(s.f, s.routes, s.N, SWP_C.fGens[1] - SWP_C.fGens[0]); s.phase = 'flow'; s.t = 0; s.acc = 0; ev.push({ k: 'sail' }); },

    /* ---------- L4: the boss. Colour gene under owls on every isle, the neutral marker, two ferries ---------- */
    Mfer(fer, mF) { const M = [0, 1, 2, 3, 4].map(i => { const r = [0, 0, 0, 0, 0]; r[i] = 1; return r; }); for (const f of fer) { if (f.length < 2) continue; for (const i of f) { M[i][i] -= mF; for (const j of f) if (j !== i) M[i][j] += mF / (f.length - 1); } } return M; },
    selIsle(pD, M, i, s0) {   // migrants arrive as adults carrying their isle's HW genotypes; owls remove mismatched coats; then random mating
      let DD = 0, Dd = 0, dd = 0; for (let j = 0; j < 5; j++) { const w = M[i][j]; if (!w) continue; const p = pD[j], q = 1 - p; DD += w * p * p; Dd += w * 2 * p * q; dd += w * q * q; }
      const lava = SW_ISLES[i][2], wD = lava ? 1 : 1 - s0, wd = lava ? 1 - s0 : 1, W = wD * (DD + Dd) + wd * dd; return W > 0 ? wD * (DD + Dd / 2) / W : pD[i];
    },
    expPlan(fer, gens) {
      const P = this.P(), N = P.Ni.v, M = this.Mfer(fer, P.mF.v); let pD = [0.55, 0.55, 0, 0, 0], f = this.zf();
      const M6 = M.map(r => r.concat([0]));
      for (let t = 0; t < gens; t++) { pD = [0, 1, 2, 3, 4].map(i => this.selIsle(pD, M, i, P.sB.v)); f = this.fstep(f, M6, N); }
      const dark = pD.map(p => 1 - (1 - p) * (1 - p)), H = f.map((r, i) => 1 - r[i]);
      const match = i => SW_ISLES[i][2] ? dark[i] >= 0.75 : dark[i] <= 0.25, okI = i => match(i) && H[i] >= 0.5;
      return { dark: dark.map(x => Math.round(x * 1000) / 1000), H: H.map(x => Math.round(x * 1000) / 1000), fc: Math.round(this.fstVar(pD) * 1e4) / 1e4, held: [0, 1, 2, 3, 4].filter(okI).length, ok: [0, 1, 2, 3, 4].map(okI),
        why: [0, 1, 2, 3, 4].map(i => okI(i) ? 'ok' : !match(i) ? 'bad' : 'drifted') };   // why an isle failed: swamped coat, or a marker worn down by drift
    },
    gen4(s) {
      const P = this.P(), N = s.N, M = this.Mfer(s.routes, P.mF.v), M6 = M.map(r => r.concat([0]));
      const ps = [0, 1, 2, 3, 4].map(i => this.selIsle(s.pD, M, i, P.sB.v)); s.pD = ps.map(x => WF.binom(2 * N, x) / (2 * N));
      const d = s.p.map(x => WF.binom(2 * N, x) / (2 * N)); s.p = [0, 1, 2, 3, 4].map(i => { let a = 0; for (let k = 0; k < 5; k++) a += M[i][k] * d[k]; return Math.round(a * 1e9) / 1e9; });
      s.f = this.fstep(s.f, M6, N); s.gen++;
      s.Fn.push(Math.round(this.fstHat(s.p) * 1e4) / 1e4); s.Fc.push(Math.round(this.fstVar(s.pD) * 1e4) / 1e4); s.En.push(Math.round(this.fstE(s.f) * 1e4) / 1e4);
      s.eD = [0, 1, 2, 3, 4].map(i => this.selIsle(s.eD, M, i, P.sB.v)); s.Ec.push(Math.round(this.fstVar(s.eD) * 1e4) / 1e4);
    },
    bossStep(s, ev) {
      if (s.phase === 'plan') { if (s.t >= SWP_C.planMax || s.auto) this.sail4(s, ev); return; }
      if (s.phase === 'run') {
        s.acc += this.dt * SWP_C.bossGps * (s.auto ? 3 : 1);
        while (s.acc >= 1) { s.acc -= 1; this.gen4(s); if (s.gen % 5 === 0) ev.push({ k: 'gen', g: s.gen }); if (s.gen >= SWP_C.bossG) { s.phase = 'over'; ev.push({ k: 'over' }); return; } }
      }
    },
    sail4(s, ev) { if (s.phase !== 'plan') return; s.ex = this.expPlan(s.routes, SWP_C.bossG); s.eD = s.pD.slice(); s.phase = 'run'; s.t = 0; s.acc = 0; ev.push({ k: 'sail' }); },

    /* ---------- predictions: the sim opens the ask; the expectation is the model's, never the realised run ---------- */
    openAsk(s, ev, id, kind, lo, hi, tol, start, expect, resume, counts, chart, at) {
      s.ask = { id, kind, lo, hi, tol, start, chart: chart || 0, at: at == null ? (s.level === 0 ? 10 : null) : at }; s.exp[id] = expect; s.tol[id] = tol; s.cnt[id] = !!counts;
      s.asks.push(id); s.resume = resume; s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id });
    },
    commit(s, ev, id, v) {
      if (!s.ask || s.ask.id !== id) return; const A = s.ask, e = s.exp[id]; let hit = false;
      if (v != null && isFinite(+v)) { v = Math.max(A.lo, Math.min(A.hi, +v)); hit = Math.abs(v - e) <= A.tol; } else v = null;
      s.pred[id] = v; s.hits[id] = hit; s.ask = null; s.t = 0; ev.push({ k: 'commit', id });
      const r = s.resume; s.resume = null;
      if (s.level === 0) { this.startRound(s, s.r + 1, ev); return; }
      s.phase = r; s.acc = 0;
    },
    /* ---------- What if? (D1 G9): the finished level is frozen; one lever reruns its main part by itself ---------- */
    lever(k) {
      const s = this.s; s.whatif = k; s.ask = null; s.t = 0; s.auto = true; s.acc = 0; const n = s.level;
      if (n === 0) { s.sW = k === 'weak' ? Math.round(s.sY * 50) / 100 : s.sY; s.mOver = k === 'noferry' ? 0 : 0.1; s.mine = s.rd[1] ? s.rd[1].d[9] : null; s.rd.length = 1; this.startRound(s, 1, []); }
      else if (n === 1) { s.w0 = s.ws[0] ? s.ws[0].w : null; s.p = new Array(SWP_C.ND).fill(0.5); s.owls = 1; s.sig = k === 'wide' ? 2 * SWP_C.sig0 : SWP_C.sig0; if (k === 'oneside') s.roosts = [6, 12, 18, 24]; s.ws = []; s.phase = 'build'; s.tl = 0; }
      else if (n === 2) { const b = s.snap100; if (k === 'none') s.routes = []; if (k === 'big') s.N = 4 * s.N; s.p = b.p.slice(); s.f = b.f.map(r => r.slice()); s.F = b.F.slice(); s.FE = b.FE.slice(); s.gen = SWP_C.fGens[0]; s.wiE = this.expF(s.f, s.routes, s.N, SWP_C.fGens[1] - SWP_C.fGens[0]); s.phase = 'flow'; }
      else { s.routes = k === 'mixed' ? [[0, 4], [1, 3], [2, 3]] : []; s.p = [0.5, 0.5, 0.5, 0.5, 0.5]; s.pD = [0.55, 0.55, 0, 0, 0]; s.gen = 0; s.f = this.zf(); s.Fn = [0]; s.Fc = [this.fstVar(s.pD)]; s.En = [0]; s.Ec = [s.Fc[0]]; s.phase = 'plan'; }
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      if (a.k === 'unt') { s.unt = !!a.on; ev.push({ k: 'unt', on: s.unt }); return ev; }
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id) this.commit(s, ev, a.id, a.moved === false ? null : a.v); return ev; }
      if (s.auto || s.phase === 'ask') return ev;
      if (s.level === 0) {
        if (a.k === 'strike') this.strike(s, ev, a);
        else if (a.k === 'letgo' && s.phase === 'hunt' && s.unt) { const mo = s.h.mice.find(q => !q.go); if (mo) { mo.go = true; ev.push({ k: 'letgo', id: mo.id }); } }
        else if (a.k === 'endnight' && s.phase === 'hunt' && s.unt && !s.h.mice.length) this.endHunt(s, ev);
      } else if (s.level === 1) {
        if (a.k === 'roost' && s.phase === 'build') { const i = a.i | 0; if (i >= 0 && i < 4) { s.roosts[i] = Math.round(Math.max(0.5, Math.min(59.5, +a.x || 0)) * 10) / 10; s.moved++; ev.push({ k: 'roost', i, x: s.roosts[i] }); } }
        else if (a.k === 'measure' && s.phase === 'build') { const key = s.roosts.join(','); if (this._nc !== key) { this._ncW = this.measure(this.equil(s.p, s.roosts, s.owls, s.sig, 0)).w; this._nc = key; } if (this._ncW >= 60) ev.push({ k: 'nocline' }); else this.doMeasure(s, ev); }   // the check is a pure function of the roosts, so a cache is safe
      } else if (s.level === 2) {
        if (a.k === 'route') this.route(s, ev, a.a, a.b); else if (a.k === 'sail') this.sail3(s, ev);
      } else {
        if (a.k === 'route') this.route(s, ev, a.a, a.b); else if (a.k === 'sail') this.sail4(s, ev);
      }
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_SWAMP_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, interesting: this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons §1.5)
      if (s.whatif) return null; const n = s.level, st = CH_SWAMP_V2.stars;
      if (n === 0) { const ok = s.hunts.filter(h => h.fed >= SWP_C.feed).length; return ok < 3 ? 'hungry' : null; }
      if (n === 1) { if (st.discover(s, 1)) return null; const lava = s.roosts.filter(r => r < SWP_C.E).length; return lava === 0 || lava === 4 ? 'lopsided' : 'wide'; }
      if (n === 2) { if (st.discover(s, 2)) return null; return s.routes.length ? 'fewRoutes' : 'allLost'; }
      if (st.transfer(s, 3) || !s.ex) return null;
      const mixed = s.routes.some(r => SW_ISLES[r[0]][2] !== SW_ISLES[r[1]][2]); return mixed ? 'mixed' : 'alone';
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) { const A = s.ask, n = 50; for (let k = 0; k <= n; k++) out.push({ k: 'predict', id: A.id, v: Math.round((A.lo + (A.hi - A.lo) * k / n) * 1e4) / 1e4 }); return out; }
      if (s.auto) return out;
      if (s.level === 0 && s.phase === 'hunt' && s.h) { for (const mo of s.h.mice) if (mo.u > 0.1 && mo.u < 0.9) out.push({ k: 'strike', id: mo.id }); if (s.unt) { out.push({ k: 'letgo' }); if (!s.h.mice.length) out.push({ k: 'endnight' }); } }
      else if (s.level === 1 && s.phase === 'build') { for (let i = 0; i < 4; i++) for (const x of [6, 18, 26, 34, 42, 54]) out.push({ k: 'roost', i, x }); out.push({ k: 'measure' }); }
      else if (s.level === 2 && s.phase === 'lay') { for (let a = -1; a < 5; a++) for (let b = a + 1; b < 5; b++) if (b >= 0) out.push({ k: 'route', a, b }); out.push({ k: 'sail' }); }
      else if (s.level === 3 && s.phase === 'plan') { for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) out.push({ k: 'route', a, b }); out.push({ k: 'sail' }); }
      return out;
    },
    /* bots (tests/bots.js): (s, acts, rnd) → action | null; 'random' is generic. No bot may earn three stars in a level, nor across the unit. */
    bots: {
      alwaysA(s, acts) { return CH_SWAMP_V2.sim.bot(s, acts, 'pale', 'good', 'hub', 'win', 'lo'); },     // strike pale mice, good roosts, hub ferries, the winning plan; predictions low
      alwaysB(s, acts) { return CH_SWAMP_V2.sim.bot(s, acts, 'none', 'stay', 'none', 'none', 'hi'); },  // never strike, never move, no ferries; predictions high
      greedy(s, acts) { return CH_SWAMP_V2.sim.bot(s, acts, 'any', 'now', 'hub', 'near', 'mid'); },     // strike anything at once, measure at once, nearest-isle ferries
      threshold(s, acts) { return CH_SWAMP_V2.sim.bot(s, acts, 'pale', 'good', 'hub', 'win', 'mid'); }, // the right moves everywhere, predictions at mid-axis
      lazy(s, acts) { return CH_SWAMP_V2.sim.bot(s, acts, 'pale', 'good', 'hub', 'win', 'still'); },    // never moves a prediction
      chain(s, acts) { return CH_SWAMP_V2.sim.bot(s, acts, 'pale', 'lava', 'chain', 'mixed', 'now'); }, // roosts on lava only, isle chain, mixed ferries; predicts "no change"
      expert(s, acts) { return CH_SWAMP_V2.sim.bot(s, acts, 'pale', 'good', 'hub', 'win', 'exact'); }   // test policy: reads s.exp (never in a sweep)
    },
    bot(s, acts, hunt, roost, routes, plan, pred) {
      if (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt && !s.unt) return { k: 'unt', on: true };
      if (s.ask) {
        const A = s.ask, P = acts.filter(a => a.k === 'predict'), near = v => P.reduce((b, a) => (Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b));
        if (pred === 'still') return { k: 'predict', id: A.id, v: A.start, moved: false };
        if (pred === 'exact') return { k: 'predict', id: A.id, v: s.exp[A.id] };
        if (pred === 'now') return { k: 'predict', id: A.id, v: A.start };
        return near(pred === 'lo' ? A.lo : pred === 'hi' ? A.hi : (A.lo + A.hi) / 2);
      }
      if (s.level === 0 && s.phase === 'hunt' && s.h) {
        if (s.h.busy > 0) return null; const open = s.h.mice.filter(mo => mo.u > 0.15 && mo.u < 0.85);
        if (hunt === 'pale') { const mo = open.find(q => !q.dark); if (mo) return { k: 'strike', id: mo.id }; }
        else if (hunt === 'any' && open.length) return { k: 'strike', id: open[0].id };
        if (s.unt) { if (s.h.mice.length) return { k: 'letgo' }; return s.h.n >= SWP_C.untE || s.h.strikes >= SWP_C.untS ? { k: 'endnight' } : null; }
        return null;
      }
      if (s.level === 1 && s.phase === 'build') {
        const want = roost === 'good' ? [20, 27, 33, 40] : roost === 'lava' ? [6, 12, 18, 24] : null;
        if (roost === 'now') return { k: 'measure' };
        if (want) { for (let i = 0; i < 4; i++) if (Math.abs(s.roosts[i] - want[i]) > 0.01) return { k: 'roost', i, x: want[i] }; if (s.tl > 4) return { k: 'measure' }; }
        return null;
      }
      if (s.level === 2 && s.phase === 'lay') {
        const want = routes === 'hub' ? [[-1, 0], [-1, 1], [-1, 2], [-1, 3], [-1, 4]] : routes === 'chain' ? [[0, 2], [1, 2], [1, 3], [3, 4], [0, 4]] : [];
        for (const [a, b] of want) if (!s.routes.some(r => r[0] === a && r[1] === b)) return { k: 'route', a, b };
        return routes === 'none' ? null : { k: 'sail' };
      }
      if (s.level === 3 && s.phase === 'plan') {
        const want = plan === 'win' ? [[0, 1], [2, 3], [3, 4]] : plan === 'near' ? [[0, 4], [1, 3], [2, 3]] : plan === 'mixed' ? [[0, 2], [1, 2], [3, 4]] : null; if (!want) return null;
        for (const [a, b] of want) if (!s.routes.some(r => r[0] === a && r[1] === b)) return { k: 'route', a, b };
        return { k: 'sail' };
      }
      return null;
    }
  },

  /* ---------- stars, against the expectation for the parameters in force (never the realised run of luck) ---------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false;
      if (n === 0) return s.phase === 'over' && s.rd.length === 3 && s.hunts.filter(h => h.fed >= SWP_C.feed).length >= 3;
      if (n === 1) return !!s.disc;
      if (n === 2) return s.e2 != null && s.e2 <= 0.3 && s.routes.length > 0;
      return false;
    },
    predict: (s, n) => !s.whatif && n === 0 && !!s.cnt.th && !!s.hits.th,   // the chapter's one prediction (D6 decision 9)
    transfer: (s, n) => !s.whatif && n === 3 && !!(s.ex && s.ex.held === 5)
  },
  unitStars(lv) {   // Discover = two of L1–L3; Predict = L1's one prediction; Transfer = the boss
    const m = i => lv[i] | 0; let d = 0; for (let i = 0; i < 3; i++) if (m(i) & 1) d++;
    return (d >= 2 ? 1 : 0) | (m(0) & 2 ? 2 : 0) | (m(3) & 4 ? 4 : 0);
  },
  /* result code (30 bits) on assignment links: 0–2 level, 3–5 mask, 6–13 a level number (L1 s ×100, L2 first width ×4, L3 final F_ST ×100,
     L4 isles held), 14–20 L1's prediction ×100 of its axis span (127 = none), 21–27 routes laid (L3, L4) */
  resultBits(s, level) {
    if (!s) return 0; const n = Math.max(0, Math.min(3, level | 0)), st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(v)));
    const x = n === 0 ? 100 * (s.sY || 0) : n === 1 ? 4 * ((s.ws && s.ws[0]) ? s.ws[0].w : 0) : n === 2 ? 100 * (s.F ? s.F[s.F.length - 1] : 0) : (s.ex ? s.ex.held : 0);
    const pv = id => { const v = s.pred[id]; return v == null ? 127 : c(100 * v / SWP_C.thHi, 126); };
    return (n | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 3 | c(x, 255) << 6 | pv('th') << 14 | c(s.routes ? s.routes.length : 0, 127) << 21) >>> 0;
  },
  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = false; this._asking = null; this._hudSig = ''; this._dockSig = '';
    this.v = { t: 0, ff: false, hold: -1, fold: 0, said: {}, banner: null, anims: [], swoop: null, ferry: null, fx: 0, sel: 0, drag: null, tgt: 0, owlets: [0, 0, 0], cal: null, boats: 0, flash: 0, thaw: !!o.thaw, dawnK: 0 };
    Sim.start(this, n, o);
    const ui = Save.d && Save.d.ui;
    if (!o.thaw && !o.replay && ui && ui.unt) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = this.levels[n] && this.levels[n].name, s = this.sim.s;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => this.banner(o.thaw ? this.content.levers[s.whatif] || name : name, Math.max(1000, ms + 400)));
    this.v.ghost0 = !o.thaw;
  },
  banner(text, ms) { this.v.banner = { text, t: 0, ms: ms || 1100 }; },
  phoneStrip() { return typeof Strip !== 'undefined' && !!Strip.isOpen && typeof Strip.phone === 'function' && Strip.phone(); },
  hudH() {
    const z = (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56, v = this.v || {}, now = v.t || 0;
    if (v.hh != null && now - (v.hhT || 0) < 0.5) return v.hh;
    let h = z; try { const el = document.getElementById('hud'), cv = Stage.cv; if (el && cv && el.getBoundingClientRect) { const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect(); if (a.height > 0) h = Math.max(z, Math.min(Stage.h * 0.3, a.bottom - b.top)); } } catch (e) { }
    if (this.v) { this.v.hh = h; this.v.hhT = now; } return h;
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'sw-' + k); },
  f2(x) { return (Math.round(x * 100) / 100).toFixed(2); },
  pc(x) { return Math.round(100 * x); },

  /* ---------- the frame ---------- */
  update(dt) {
    const v = this.v;
    for (const e of Sim.run(this, 0)) this.juice(e);
    if (v.hold >= 0) { v.hold += dt; if (!this.phoneStrip() || v.hold > 1.2) v.hold = -1; }
    const s0 = this.sim.s, fast = /lapse|drift|flow|run/.test(s0.phase) || (s0.level === 0 && s0.phase === 'dawn' && !this.sim.hands(s0, s0.n));
    const ev = Sim.run(this, v.hold >= 0 ? 0 : dt * (v.ff && fast ? 3 : 1)), s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.flash = Math.max(0, v.flash - dt);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    v.anims = v.anims.filter(a => (a.t += dt) < a.d);
    if (v.swoop) { v.swoop.t += dt; if (v.swoop.t > SWP_C.busy) v.swoop = null; }
    if (v.ferry) { v.ferry.t += dt; if (v.ferry.t > v.ferry.d) v.ferry = null; }
    for (let i = 0; i < 3; i++) v.owlets[i] = Math.max(0, v.owlets[i] - dt);
    if (v.ghost0 && !v.banner) { v.ghost0 = false; this.teach(); }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; v.fold = 1; }
    if (v.fold && v.hold < 0) { v.fold = 0; if (typeof Predict !== 'undefined' && Predict.fold) Predict.fold(); }
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; v.ff = false; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; v.endT = 0; return; } v.endT += dt; if (v.endT < 1.1 && !s.auto) return; this._ended = true; this.finish(r); }
  },
  teach() {   // the ghost hand, within 3 s, on the verb the level adds (a known verb is skipped by Ghost itself)
    if (typeof Ghost === 'undefined') return; const n = this.level, s = this.sim.s;
    if (n === 0) Ghost.show({ verb: 'tap', key: ' ', at: () => { const m = this.openMice()[0]; return m ? [m.x, m.y] : [Stage.w * 0.55, Stage.h * 0.62]; }, until: () => this.sim.s.hunts.length > 0 || (this.sim.s.h && this.sim.s.h.strikes > 0) });
    else if (n === 1) Ghost.show({ verb: 'drag', key: 'ArrowLeft', at: () => { const P = this.pos(); return [P.X(s.roosts[0]), P.postY]; }, to: () => { const P = this.pos(); return [P.X(24), P.postY]; }, until: () => this.sim.s.moved > 0 });
    else if (n === 2) Ghost.show({ verb: 'drag', key: '1', at: () => { const P = this.pos(); return P.node(-1); }, to: () => { const P = this.pos(); return P.node(4); }, until: () => this.sim.s.routes.length > 0 });
    else Ghost.show({ verb: 'drag', key: '4', at: () => this.pos().node(4), to: () => this.pos().node(3), until: () => this.sim.s.routes.length > 0 });   // the L3 verb again, so Ghost usually skips it
  },
  hud() {
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; if (typeof HUD === 'undefined') return;
    let t = C.over, num = '';
    if (s.auto) t = C.auto;
    else if (s.phase === 'ask') t = Txt.f(C.askTh, { s: this.f2(s.sY || 0) });
    else if (s.level === 0) {   // the key number (D6 decision 9): once s is known, every time-lapse names m against s, with its meaning
      const key = s.sY != null && (s.phase === 'dawn' || s.phase === 'banner') && !this.sim.hands(s, s.n) ? Txt.f(s.m >= s.sY ? C.keySwamp : C.keyHold, { m: this.f2(s.m), s: this.f2(s.sY) }) : null;
      t = s.phase === 'hunt' ? (s.n === 1 && s.r === 0 && !s.hunts.length ? this.content.firstWords : s.unt ? C.huntU : C.hunt) : s.phase === 'gap' ? C.gap : key || (s.phase === 'dawn' && this.sim.hands(s, s.n) ? C.dawn : C.lapse);
    }
    else if (s.level === 1) t = s.phase === 'build' ? C.build : s.ws.length === 1 && s.phase !== 'relax' ? C.measure : s.sig < SWP_C.sig0 ? C.wet : C.owls;
    else if (s.level === 2) t = s.phase === 'lay' ? C.lay : s.phase === 'flow' ? C.flow : C.drift;
    else t = s.phase === 'plan' ? C.plan : C.run;
    if (s.phase === 'over' && !s.auto) t = C.over;
    if (s.level === 0) num = s.phase === 'hunt' && s.h ? Txt.f(L.fedN, { a: Math.min(s.h.fed, SWP_C.feed), b: SWP_C.feed }) : Txt.f(L.dark, { p: this.pc(s.dark || SWP_C.d0) });
    else if (s.level === 1) { const m = this.sim.measure(s.p); num = Txt.f(L.w, { w: m.w >= 60 ? '—' : m.w.toFixed(1) }); }
    else if (s.level === 2) num = Txt.f(L.fst, { f: this.f2(s.F[s.F.length - 1]) });
    else num = Txt.f(L.gen, { n: s.gen });
    const sig = t + num; if (sig !== this._hudSig) { this._hudSig = sig; HUD.say(t, num); }
    const bar = typeof document !== 'undefined' && document.getElementById ? document.getElementById('bar-gen') : null;
    if (bar) { const lab = s.level === 0 ? Txt.f(L.round, { m: this.f2(s.m) }) + ' · ' + Txt.f(L.night, { n: Math.max(1, s.n) }) : s.level === 1 ? '' : Txt.f(L.gen, { n: s.gen || 0 }); if (bar.textContent !== lab) bar.textContent = lab; }
  },
  dock() {
    if (typeof Dock === 'undefined') return; const s = this.sim.s, L = this.content.labels;
    const sig = s.level + s.phase + (s.unt ? 'u' : '') + (s.ask ? s.ask.id : '') + (s.auto ? 'a' : '') + (s.routes ? s.routes.length : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'sw-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (s.auto || s.phase === 'over') { Dock.set([]); return; }
    if (s.level === 0 && s.phase === 'hunt' && s.unt) { Dock.set([{ id: 'sw-let', label: L.letgo, key: 'n', fn: () => Sim.act(this, { k: 'letgo' }) }, { id: 'sw-end', label: L.endN, key: 'Enter', fn: () => Sim.act(this, { k: 'endnight' }) }]); return; }
    if (s.level === 1 && s.phase === 'build') { Dock.set([{ id: 'sw-meas', label: L.measure, key: 'Enter', primary: true, fn: () => Sim.act(this, { k: 'measure' }) }]); return; }
    if ((s.level === 2 && s.phase === 'lay') || (s.level === 3 && s.phase === 'plan')) { Dock.set([{ id: 'sw-sail', label: L.sail, key: 'Enter', primary: s.routes.length > 0, fn: () => Sim.act(this, { k: 'sail' }) }]); return; }
    Dock.set([]);
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    Predict.ask({ id: A.id, chart: A.chart, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.start, at: A.at == null ? undefined : A.at, tol: A.tol, soft: s.unt ? null : 24, needMove: true, linger: 900,
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null, moved: false }), say: this.content.live.ask });
    if (typeof Live !== 'undefined') Live.say(this.content.live.ask);
    this._dockSig = ''; this.dock();
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(s.ask.chart); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
  reveal(id) {
    const s = this.sim.s; if (typeof Predict === 'undefined' || s.exp[id] == null) return;
    Predict.reveal(id, s.exp[id], s.tol[id]); this.whisper(s.pred[id] == null ? 'none' : s.hits[id] ? 'hit' : 'out');
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
  },

  /* ---------- the level card ---------- */
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, o = { level: n, mask: r.mask, final: n === 3, interesting: r.interesting }, V = this.bodyVars();
    if (s.whatif) { const k = s.whatif; o.body = Txt.f(C.whatifBody[k], V); o.take = null; o.interesting = null; }
    else if (n < 3) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    if (!s.whatif && typeof Freezer !== 'undefined') { Freezer.put(this.id, 1, this.sim.snapshot(), { force: true }); o.whatIf = { gen: 1, levers: [['noferry', 'weak'], ['oneside', 'wide'], ['none', 'big'], ['mixed', 'nofer']][n] }; }
    o.why = n < 3 ? C.levelWhy[n] : C.why;
    const spec = this.cardSpec(); if (spec && typeof LiveGraph !== 'undefined') { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  bodyVars() {
    const s = this.sim.s, sim = this.sim, n = this.level, pc = x => this.pc(x || 0), f2 = x => this.f2(x || 0);
    if (n === 0) {
      if (s.whatif) { const d = s.rd[1] && s.rd[1].d[9] != null ? s.rd[1].d[9] : 0, p0 = sim.p0();
        return { d: pc(d), e: pc(sim.exp10(p0, 0, s.sW, s.mOver)), e2: pc(sim.exp10(p0, 0, s.sY, 0.1)), m: f2(s.mOver), s: f2(s.sW), why: s.mOver >= s.sW ? this.content.whatifBody.weakSw : this.content.whatifBody.weakOk }; }
      const R0 = s.rd, d10 = i => R0[i] && R0[i].d[9] != null ? pc(R0[i].d[9]) : 0, W = this.content.whatifBody;   // round three's m always reaches s; round two's does only if s ≤ 0.1
      return { s: f2(s.sY), a: d10(0), b: d10(1), c: d10(2), m1: f2(R0[0] && R0[0].m), m2: f2(R0[1] && R0[1].m), m3: f2(R0[2] && R0[2].m), k: R0[1] && R0[1].m >= s.sY ? W.twoSw : W.lastSw };
    }
    if (n === 1) { const w = i => s.ws[i] ? s.ws[i].w.toFixed(1) : '—', last = s.ws[s.ws.length - 1] || { c: 30, w: 0 }, r = s.ws[0] && s.ws[1] && s.ws[1].w > 0 ? (s.ws[0].w / s.ws[1].w).toFixed(2) : '—';
      return { w0: s.w0 != null ? s.w0.toFixed(1) : w(0), w1: w(1), w2: w(2), r, c: last.c.toFixed(1), w: last.w.toFixed(1) }; }
    if (n === 2) { const F = s.F; return { f1: f2(F[100]), e1: f2(s.e1), f2: f2(F[F.length - 1]), e2: f2(s.whatif ? s.wiE : s.e2), f: f2(F[F.length - 1]), e: f2(s.wiE) }; }
    const ex = s.ex || { held: 0, H: [1] }; return { n: ex.held, h: Math.round(100 * Math.min.apply(null, ex.H)) };
  },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, S2 = typeof Snd2 !== 'undefined' ? Snd2 : null, L = this.content.labels, P = this.pos();
    const snd = (k, x, y) => { if (S2) S2.play(k, { x, y }); }, live = (k, o) => { if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live[k], o || {})); };
    const redraw = () => { if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); };
    switch (e.k) {
      case 'round': if (e.r > 0 || v.thaw) this.banner(Txt.f(L.round, { m: this.f2(e.m) }), 1300); return;
      case 'dawn': {
        v.ferry = { t: 0, d: e.lapse ? 0.3 : 1.3, k: e.mig, lapse: e.lapse }; v.dawnK = e.mig;
        if (!e.lapse) { snd('tock', P.dock[0], P.dock[1]); if (F && e.mig > 0) F.pop('+' + e.mig, P.dock[0], P.dock[1] - 22, 0); live('dawn', { n: e.n, d: this.pc(e.d) }); }
        else if (F) F.ring(P.dock[0], P.dock[1], 12, { ms: 200 });
        redraw(); return;
      }
      case 'lapse': v.flash = 0.18; return;
      case 'hunt': if (e.n === 10 && F) F.tier(2, () => this.banner(Txt.f(L.night, { n: 10 }), 900)); return;
      case 'emerge': { const m = this.mouseXY(e.id, 0); if (F && m) F.ring(m.x, m.y, e.dark ? 10 : 14, { ms: 160 }); snd('tick', m ? m.x : 0, m ? m.y : 0); return; }
      case 'gone': return;
      case 'busy': this.whisper('busy'); return;
      case 'miss': { const x = (e.x || 0.5) * P.W, y = (e.y || 0.6) * P.H; v.swoop = { t: 0, x, y, got: null }; if (F) { F.tier(1); F.burst('dust', x, y, 5, { ink: '#6B6670' }); } snd('swish', x, y); if (!v.said.miss) { v.said.miss = 1; this.whisper('miss'); } return; }
      case 'catch': case 'escape': {
        const m = this.mouseXY(e.id, e.u) || { x: P.W / 2, y: P.H * 0.6 }; v.swoop = { t: 0, x: m.x, y: m.y, got: e.k === 'catch' ? (e.dark ? 1 : 0) : null };
        if (e.k === 'catch') { if (F) { F.tier(1); F.burst('scale', m.x, m.y, 7, { ink: e.dark ? '#3A332D' : '#D8BC86' }); F.pop(L.catch, m.x, m.y - 20, 1); F.hitstop(40); } snd('crack', m.x, m.y); v.owlets[(e.fed - 1) % 3] = 0.5; live('catch', { k: e.dark ? 'dark' : 'pale' }); }
        else { if (F) F.burst('dust', m.x, m.y, 6, { ink: '#56546A' }); snd('swish', m.x, m.y); this.whisper('escape'); }
        return;
      }
      case 'letgo': return;
      case 'nightend': this.whisper(e.ok ? 'fed' : 'hungry'); if (F && e.ok) F.tier(2, () => F.ring(P.nest[0], P.nest[1], 34, { ms: 600 })); snd(e.ok ? 'peep' : 'dusk', P.nest[0], P.nest[1]); redraw(); return;
      case 'sY': if (F) F.tier(3, () => this.banner('s = ' + this.f2(e.s), 1400)); redraw(); return;
      case 'endround': redraw(); return;
      case 'reveal': this.reveal(e.id); return;
      case 'change': if (F) F.tier(2, () => this.banner(e.st === 1 ? this.content.labels.owls2 : this.content.labels.wet, 1300)); redraw(); return;
      case 'sail': redraw(); return;
      case 'ask': return;
      case 'commit': if (this.phoneStrip()) v.hold = 0; return;
      case 'roost': { const x = P.X(e.x); if (F) F.burst('dust', x, P.landY, 4, { ink: '#8C7A5A' }); return; }
      case 'swoop': { const x0 = P.X(s.roosts[e.r]), x1 = P.X(e.d + 0.5); v.anims.push({ k: 'swoop', x0, x1, dark: e.dark, t: 0, d: 0.55 }); if (F && Math.abs(x1 - x0) < P.W) Fx.burst('dust', x1, P.landY + 6, 2, { ink: e.dark ? '#3A332D' : '#D8BC86' }); return; }
      case 'measured': { const m = this.sim.measure(s.p); v.cal = v.cal || { a: m.a || 0, b: m.b || 60 }; if (F) F.tier(2, () => F.ring(P.X(m.c), P.calY, 26, { ms: 500 })); snd('scale', P.X(m.c), P.calY); live('width', { w: m.w.toFixed(1) }); redraw(); return; }
      case 'route': case 'unroute': { const a = P.node(e.a), b = P.node(e.b); if (F) { F.tier(1); F.burst('droplet', (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, e.k === 'route' ? 6 : 3, { ink: '#9CA6D8' }); } snd(e.k === 'route' ? 'pour' : 'swish', b[0], b[1]); redraw(); return; }
      case 'budget': this.whisper('budget'); return;
      case 'nocline': this.whisper('nocline'); return;
      case 'lay': this.teach(); redraw(); return;
      case 'lost': if (!v.said.lost) { v.said.lost = 1; this.whisper('lost'); } return;
      case 'gen': if (e.g % 25 === 0) { snd('tick', 30, P.H - 26); live('gen', { n: e.g, f: this.f2(s.level === 2 ? s.F[s.F.length - 1] : s.Fn[s.Fn.length - 1]) }); } redraw(); return;
      case 'unt': this._dockSig = ''; return;
      case 'over': if (s.level === 3 && s.ex && F) F.tier(3, () => F.ring(P.W / 2, P.H / 2, 60, { ms: 900 })); snd('interesting', P.W / 2, P.H / 2); return;
    }
  },
  hash(v) { let h = 2166136261; const t = String(v); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h ^ h >>> 13) >>> 0; },

  /* ---------- input ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, P = this.pos();
    if (/lapse|drift|flow|run/.test(s.phase) || (s.level === 0 && (s.phase === 'dawn' || s.phase === 'banner'))) { v.ff = true; return; }
    if (s.auto || s.phase === 'ask' || s.phase === 'over') return;
    if (s.level === 0 && s.phase === 'hunt') {
      const ms = this.openMice(), r = Math.max(34, P.u * 0.09); let best = null, bd = r * r;
      for (const m of ms) { const d = (m.x - x) * (m.x - x) + (m.y - y) * (m.y - y); if (d < bd) { bd = d; best = m; } }
      Sim.act(this, best ? { k: 'strike', id: best.id } : { k: 'strike', id: 0, x: Math.round(x / P.W * 1000) / 1000, y: Math.round(y / P.H * 1000) / 1000 }); return;
    }
    if (s.level === 1 && s.phase === 'build') {
      let bi = -1, bd = Math.max(30, P.u * 0.07); for (let i = 0; i < 4; i++) { const d = Math.abs(P.X(s.roosts[i]) - x); if (d < bd && y > P.top && y < P.seaY) { bd = d; bi = i; } }
      if (bi >= 0) { v.sel = bi; v.drag = { i: bi, x0: x }; return; }
      if (y > P.top + 20 && y < P.seaY + 20) Sim.act(this, { k: 'roost', i: v.sel, x: Math.round(P.K(x) * 10) / 10 }); return;
    }
    if ((s.level === 2 && s.phase === 'lay') || (s.level === 3 && s.phase === 'plan')) {   // one verb for both: drag a ferry route (tap-tap works too)
      const nd = this.nodeAt(x, y, s.level === 2); if (nd != null) { v.drag = { a: nd, x, y }; return; }
      const ri = this.routeAt(x, y); if (ri >= 0) { const r = s.routes[ri]; Sim.act(this, { k: 'route', a: r[0], b: r[1] }); } return;
    }
  },
  move(x, y) {
    const s = this.sim.s, v = this.v; if (!v.drag) return; const P = this.pos();
    if (s.level === 1 && s.phase === 'build' && v.drag.i != null) { const k = Math.round(P.K(x) * 10) / 10; if (Math.abs(k - s.roosts[v.drag.i]) >= 0.3) Sim.act(this, { k: 'roost', i: v.drag.i, x: k }); }
    if (s.level >= 2) { v.drag.x = x; v.drag.y = y; }
  },
  up(x, y) {
    const s = this.sim.s, v = this.v, d = v.drag; v.drag = null; if (!d) return;
    if ((s.level === 2 && s.phase === 'lay') || (s.level === 3 && s.phase === 'plan')) {
      const nd = this.nodeAt(x, y, s.level === 2);
      if (nd != null && nd !== d.a) Sim.act(this, { k: 'route', a: d.a, b: nd });
      else if (nd === d.a) { if (v.pick != null && v.pick !== nd) { Sim.act(this, { k: 'route', a: v.pick, b: nd }); v.pick = null; } else v.pick = nd; }   // tap, then tap: the tap alternative to the drag
    }
  },
  onKey(k) {
    const s = this.sim.s, v = this.v;
    if (k === ' ' && (/lapse|drift|flow|run/.test(s.phase) || (s.level === 0 && s.phase === 'dawn'))) { v.ff = true; return; }
    if (s.ask || s.auto) return;
    if (s.level === 0 && s.phase === 'hunt') {
      const ms = this.openMice(); if (k === 'ArrowRight' && ms.length) { v.tgt = (v.tgt + 1) % ms.length; return; }
      if (k === ' ') { const m = ms[Math.min(v.tgt, ms.length - 1)]; Sim.act(this, m ? { k: 'strike', id: m.id } : { k: 'strike', id: 0, x: 0.5, y: 0.6 }); v.tgt = 0; }
      return;
    }
    if (s.level === 1 && s.phase === 'build') { if (/^[1-4]$/.test(k)) v.sel = +k - 1; else if (k === 'ArrowLeft' || k === 'ArrowRight') Sim.act(this, { k: 'roost', i: v.sel, x: s.roosts[v.sel] + (k === 'ArrowLeft' ? -1 : 1) }); return; }
    if (((s.level === 2 && s.phase === 'lay' && /^[0-5]$/.test(k)) || (s.level === 3 && s.phase === 'plan' && /^[1-5]$/.test(k)))) { const nd = +k - 1; if (v.pick != null && v.pick !== nd) { Sim.act(this, { k: 'route', a: v.pick, b: nd }); v.pick = null; } else v.pick = nd; }
  },
  teacherStep() { this.v.ff = true; },

  /* ---------- geometry (canvas px), recomputed per call ---------- */
  pos() {
    const W = Stage.w, H = Stage.h, u = Stage.u || Math.min(W, 1.2 * H), top = this.hudH() + 6, H2 = H - top, s = this.sim.s, n = s ? s.level : 0, P = { W, H, u, top };
    if (n === 0) {
      P.hy = top + H2 * 0.16; P.sea1 = P.hy + H2 * 0.07; P.y0 = P.sea1; P.y1 = H - 40; const ch = P.y1 - P.y0;
      P.perch = [Math.max(46, W * 0.12), P.y0 + ch * 0.13]; P.nest = [Math.max(40, W * 0.1), P.y0 + ch * 0.36]; P.dock = [W * 0.9, P.sea1 - 3];
      P.cr = [[0.3, 0.2], [0.58, 0.12], [0.88, 0.24], [0.36, 0.58], [0.68, 0.48], [0.93, 0.7], [0.52, 0.9], [0.24, 0.86]].map(q => [W * q[0], P.y0 + ch * (0.08 + 0.86 * q[1])]);
      P.ms = Math.max(24, Math.min(50, u * 0.08));
    } else if (n === 1) {
      P.x0 = 10; P.X = km => P.x0 + km / 60 * (W - 2 * P.x0); P.K = x => Math.max(0, Math.min(60, (x - P.x0) / (W - 2 * P.x0) * 60));
      P.landTop = top + H2 * 0.44; P.seaY = top + H2 * 0.8; P.landY = P.landTop + (P.seaY - P.landTop) * 0.4; P.osz = Math.max(22, Math.min(42, u * 0.07)); P.postY = P.landTop - Math.max(40, H2 * 0.1);
      P.calY = Math.max(top + 34, P.postY - P.osz * 1.1 - 22); P.ms = Math.max(12, Math.min(22, W / 60 * 2.2)); P.rows = H2 > 560 ? 5 : 4;
    } else {
      const yb = H - (n === 2 ? 70 : 34), yt = top + 12; P.ir = Math.max(24, Math.min(58, u * 0.085));
      P.node = i => i < 0 ? [W * 0.5, H - 30] : [W * (0.1 + 0.8 * SW_ISLES[i][0]), yt + P.ir + (yb - yt - 2 * P.ir - 26) * SW_ISLES[i][1] / 0.62];
    }
    return P;
  },
  path(id, P) { const h = this.hash('m' + id), K = P.cr.length, a = h % K, b = (a + 1 + ((h >>> 4) % (K - 1))) % K, A = P.cr[a], B = P.cr[b], mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2, dx = B[0] - A[0], dy = B[1] - A[1], bend = ((h >>> 9) % 100 / 100 - 0.5) * 0.6; return { A, B, C: [mx - dy * bend, my + dx * bend] }; },
  mouseXY(id, u) {
    const P = this.pos(); if (!P.cr) return null; const q = this.path(id, P), t = Math.max(0, Math.min(1, u)), a = (1 - t) * (1 - t), b = 2 * t * (1 - t), c = t * t;
    const x = a * q.A[0] + b * q.C[0] + c * q.B[0], y = a * q.A[1] + b * q.C[1] + c * q.B[1] - Math.abs(Det.sin(t * Math.PI * 7)) * P.ms * 0.12;
    const dx = 2 * (1 - t) * (q.C[0] - q.A[0]) + 2 * t * (q.B[0] - q.C[0]); return { x, y, dir: dx >= 0 ? 1 : -1 };
  },
  openMice() { const s = this.sim.s; if (s.level !== 0 || !s.h) return []; const out = []; for (const mo of s.h.mice) { const m = this.mouseXY(mo.id, mo.u); if (m) out.push(Object.assign(m, { id: mo.id, dark: mo.dark })); } return out; },
  nodeAt(x, y, harb) { const P = this.pos(); let best = null, bd = 1e9; for (let i = harb ? -1 : 0; i < 5; i++) { const q = P.node(i), d = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y), r = i < 0 ? 34 : P.ir * 1.15; if (d < r * r && d < bd) { bd = d; best = i; } } return best; },
  routeAt(x, y) { const P = this.pos(), s = this.sim.s; let bi = -1, bd = 22 * 22; s.routes.forEach((r, i) => { const a = P.node(r[0]), b = P.node(r[1]), mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, d = (mx - x) * (mx - x) + (my - y) * (my - y); if (d < bd) { bd = d; bi = i; } }); return bi; },

  /* ---------- sprites and props (baked once per size; never in the frame loop) ---------- */
  bake(key, w, h, fn) {
    const v = this.v, sz = Math.round(w) + 'x' + Math.round(h); if (v.bgk !== sz) { v.bgk = sz; v.bgs = {}; } if (v.bgs[key]) return v.bgs[key];
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, cv = mkCanvas(Math.round(w * d), Math.round(h * d)), c = cv.getContext('2d'); c.scale(d, d); fn(c, w, h); v.bgs[key] = cv; return cv;
  },
  mouseSpr(dark, len, dir) {   // a pocket mouse in natural paint: long tufted tail, big hind feet; the dark coat keeps a moonlit eye-shine
    this._spr = this._spr || {}; const L = Math.round(len), key = (dark ? 'd' : 'p') + L + (dir > 0 ? 'r' : 'l'); if (this._spr[key]) return this._spr[key];
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, W0 = L * 2.1, H0 = L * 0.9, cv = mkCanvas(Math.ceil(W0 * d), Math.ceil(H0 * d)), c = cv.getContext('2d'); c.scale(d, d);
    c.translate(W0 / 2, H0 * 0.62); if (dir < 0) c.scale(-1, 1);
    const body = dark ? '#2B2420' : '#D9BD87', belly = dark ? '#3D342C' : '#F2E6C8', line = dark ? '#5A5148' : '#7E6440';
    c.strokeStyle = dark ? '#3A322B' : '#B59661'; c.lineWidth = Math.max(1, L * 0.07); c.lineCap = 'round'; c.beginPath(); c.moveTo(-L * 0.42, 0); c.quadraticCurveTo(-L * 0.85, -L * 0.05, -L * 1.0, -L * 0.3); c.stroke();
    c.fillStyle = c.strokeStyle; c.beginPath(); c.ellipse(-L * 1.0, -L * 0.32, L * 0.07, L * 0.05, 0, 0, TAU); c.fill();
    c.fillStyle = belly; c.beginPath(); c.ellipse(0, L * 0.05, L * 0.42, L * 0.2, 0, 0, TAU); c.fill();
    c.fillStyle = body; c.beginPath(); c.ellipse(-L * 0.02, -L * 0.04, L * 0.44, L * 0.24, 0, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(L * 0.38, -L * 0.08, L * 0.2, L * 0.15, 0, 0, TAU); c.fill();
    c.beginPath(); c.arc(L * 0.3, -L * 0.24, L * 0.09, 0, TAU); c.fill(); c.lineWidth = 1; c.strokeStyle = line; c.stroke();
    c.fillStyle = dark ? '#F2EBDC' : '#1B1612'; c.beginPath(); c.arc(L * 0.44, -L * 0.12, Math.max(1, L * 0.045), 0, TAU); c.fill();
    c.fillStyle = belly; c.beginPath(); c.ellipse(-L * 0.18, L * 0.18, L * 0.14, L * 0.05, 0, 0, TAU); c.fill();
    this._spr[key] = cv; cv.cw = W0; cv.ch = H0; return cv;
  },
  drawMouse(c, x, y, dark, len, dir, a) { const sp = this.mouseSpr(dark, len, dir); if (a != null) { c.save(); c.globalAlpha *= a; } c.drawImage(sp, x - sp.cw / 2, y - sp.ch * 0.62, sp.cw, sp.ch); if (a != null) c.restore(); },
  owl(c, x, y, sz, o) {   // a barn owl: buff back, white heart face, dark eyes; o: {wings 0..1, flip, prey: 0 pale | 1 dark | null}
    o = o || {}; const w = o.wings || 0; c.save(); c.translate(x, y); if (o.flip) c.scale(-1, 1);
    if (w > 0.02) { c.fillStyle = '#B98B50'; for (const g of [-1, 1]) { c.beginPath(); c.ellipse(g * sz * (0.35 + 0.45 * w), -sz * 0.05 - w * sz * 0.1, sz * (0.25 + 0.5 * w), sz * 0.2, g * (0.3 - 0.5 * w), 0, TAU); c.fill(); c.fillStyle = '#E7DCC6'; c.beginPath(); c.ellipse(g * sz * (0.3 + 0.4 * w), sz * 0.02, sz * (0.18 + 0.36 * w), sz * 0.1, g * 0.2, 0, TAU); c.fill(); c.fillStyle = '#B98B50'; } }
    c.fillStyle = '#C79A5B'; c.beginPath(); c.ellipse(0, 0, sz * 0.32, sz * 0.42, 0, 0, TAU); c.fill();
    c.fillStyle = '#F1E7D3'; c.beginPath(); c.ellipse(0, sz * 0.1, sz * 0.24, sz * 0.3, 0, 0, TAU); c.fill();
    c.fillStyle = '#C79A5B'; c.beginPath(); c.arc(0, -sz * 0.38, sz * 0.27, 0, TAU); c.fill();
    c.fillStyle = '#F4EEE2'; c.beginPath(); c.moveTo(0, -sz * 0.2); c.bezierCurveTo(-sz * 0.34, -sz * 0.3, -sz * 0.26, -sz * 0.62, 0, -sz * 0.5); c.bezierCurveTo(sz * 0.26, -sz * 0.62, sz * 0.34, -sz * 0.3, 0, -sz * 0.2); c.fill();
    c.lineWidth = 1.2; c.strokeStyle = '#A9814C'; c.stroke();
    c.fillStyle = '#17110D'; for (const g of [-1, 1]) { c.beginPath(); c.arc(g * sz * 0.09, -sz * 0.4, sz * 0.045, 0, TAU); c.fill(); }
    c.fillStyle = '#D9C3A0'; c.beginPath(); c.moveTo(-sz * 0.025, -sz * 0.34); c.lineTo(sz * 0.025, -sz * 0.34); c.lineTo(0, -sz * 0.27); c.fill();
    c.fillStyle = '#9C8F86'; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(-sz * 0.14 + i * sz * 0.07, sz * 0.02 + (i % 2) * sz * 0.05, 1.2, 0, TAU); c.fill(); }
    c.restore();
    if (o.prey != null) this.drawMouse(c, x, y + sz * 0.42, o.prey === 1, sz * 0.5, o.flip ? -1 : 1);
  },
  starfield(c, w, top, bot, seed, n) { const r = rng(seed); for (let i = 0; i < n; i++) { const a = 0.25 + 0.6 * r(); c.fillStyle = 'rgba(236,232,250,' + a.toFixed(2) + ')'; c.fillRect(r() * w, top + r() * (bot - top), r() < 0.15 ? 2 : 1, r() < 0.15 ? 2 : 1); } },
  moon(c, x, y, r) { const g = c.createRadialGradient(x, y, r * 0.5, x, y, r * 5); g.addColorStop(0, 'rgba(240,236,214,0.35)'); g.addColorStop(1, 'rgba(240,236,214,0)'); c.fillStyle = g; c.fillRect(x - r * 5, y - r * 5, r * 10, r * 10); c.fillStyle = '#F1EBD6'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = 'rgba(190,184,160,0.5)'; c.beginPath(); c.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, TAU); c.arc(x + r * 0.35, y + r * 0.3, r * 0.15, 0, TAU); c.fill(); },
  sky(c, w, y0, y1) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#0D1130'); g.addColorStop(1, '#2C3470'); c.fillStyle = g; c.fillRect(0, 0, w, y1); },
  basalt(c, x, y, w, h, seed) {   // old pahoehoe basalt: ropy ridges, glassy moonlit rims, cracks
    const r = rng(seed); c.fillStyle = '#1C1B21'; c.fillRect(x, y, w, h);
    for (let i = 0; i < w * h / 500; i++) { c.fillStyle = r() < 0.5 ? '#201F26' : '#23222A'; c.beginPath(); c.ellipse(x + r() * w, y + r() * h, 5 + r() * 14, 3 + r() * 7, r() * 3, 0, TAU); c.fill(); }
    c.lineCap = 'round'; for (let i = 0; i < w * h / 2200; i++) { const cx = x + r() * w, cy = y + r() * h, rr = 10 + r() * 30; c.strokeStyle = 'rgba(86,84,106,' + (0.25 + 0.3 * r()).toFixed(2) + ')'; c.lineWidth = 1 + r(); c.beginPath(); c.arc(cx, cy, rr, Math.PI * (1.1 + 0.2 * r()), Math.PI * (1.7 + 0.2 * r())); c.stroke(); }
    c.strokeStyle = '#0D0C10'; c.lineWidth = 1.4; for (let i = 0; i < w * h / 6000; i++) { let px = x + r() * w, py = y + r() * h; c.beginPath(); c.moveTo(px, py); for (let j = 0; j < 4; j++) { px += (r() - 0.5) * 30; py += (r() - 0.3) * 16; c.lineTo(px, py); } c.stroke(); }
    for (let i = 0; i < w * h / 500; i++) { c.fillStyle = 'rgba(150,148,176,' + (0.08 + 0.18 * r()).toFixed(2) + ')'; c.fillRect(x + r() * w, y + r() * h, 1, 1); }
  },
  dunes(c, x, y, w, h, seed) {   // pale sand in moonlight: soft ripples and crests
    const r = rng(seed), g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#BC9358'); g.addColorStop(1, '#A57E47'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.lineWidth = 1; for (let i = 0; i < h / 5; i++) { const yy = y + r() * h, xx = x + r() * w, L = 20 + r() * 60; c.strokeStyle = r() < 0.5 ? 'rgba(232,206,150,0.35)' : 'rgba(120,88,46,0.3)'; c.beginPath(); c.moveTo(xx, yy); c.quadraticCurveTo(xx + L / 2, yy - 3, xx + L, yy); c.stroke(); }
  },
  shrub(c, x, y, sz, r) { c.fillStyle = '#2C3124'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(x + (r() - 0.5) * sz, y - r() * sz * 0.5, sz * 0.25, sz * 0.18, 0, 0, TAU); c.fill(); } c.strokeStyle = '#3B3A2C'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * sz * 1.2, y - sz * (0.4 + 0.4 * r())); c.stroke(); } },

  /* ---------- drawing ---------- */
  draw(c, w, h) {
    const s = this.sim.s; if (!s) return;
    if (s.level === 0) this.drawIsle(c, w, h); else if (s.level === 1) this.drawCoast(c, w, h); else this.drawMap(c, w, h);
    const v = this.v; if (typeof Lbl === 'undefined') return;
    if (v.banner) { const b = v.banner, a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; Lbl.put('sw-banner', b.text, w / 2, this.hudH() + 34, { size: 20, c, weight: 700 }); c.restore(); }
    if ((/lapse|drift|flow|run/.test(s.phase)) && !v.ff && !s.auto) Lbl.put('sw-ff', this.content.labels.ff, w - 12, h - 16, { align: 'right', size: 12, c });
  },
  drawIsle(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), L = this.content.labels;
    const bg = this.bake('isle', w, h, (g) => {
      this.sky(g, w, P.top, P.hy); this.starfield(g, w, 0, P.hy - 6, 11, Math.round(w * P.hy / 900)); this.moon(g, w * 0.2, P.top + (P.hy - P.top) * 0.4, Math.max(8, P.u * 0.026));
      const sg = g.createLinearGradient(0, P.hy, 0, P.sea1); sg.addColorStop(0, '#222B5E'); sg.addColorStop(1, '#1A2150'); g.fillStyle = sg; g.fillRect(0, P.hy, w, P.sea1 - P.hy + 2);
      g.strokeStyle = 'rgba(160,168,214,0.35)'; g.lineWidth = 1; const r = rng(4); for (let i = 0; i < w / 14; i++) { const x = r() * w, y = P.hy + 3 + r() * (P.sea1 - P.hy - 4); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 + r() * 10, y); g.stroke(); }
      const ix = w * 0.76, iw = w * 0.36; g.fillStyle = '#A88452'; g.beginPath(); g.moveTo(ix - iw / 2, P.hy + 1); g.quadraticCurveTo(ix - iw * 0.25, P.hy - 12, ix - iw * 0.05, P.hy - 7); g.quadraticCurveTo(ix + iw * 0.15, P.hy - 15, ix + iw / 2, P.hy + 1); g.fill();
      g.fillStyle = 'rgba(214,186,128,0.6)'; g.beginPath(); g.moveTo(ix - iw * 0.3, P.hy - 3); g.quadraticCurveTo(ix - iw * 0.12, P.hy - 11, ix + iw * 0.05, P.hy - 6); g.lineTo(ix - iw * 0.3, P.hy - 1); g.fill();
      this.basalt(g, 0, P.y0, w, h - P.y0, 7);
      g.fillStyle = '#121116'; g.beginPath(); g.moveTo(0, P.y0 + 4); for (let x = 0; x <= w; x += 18) g.lineTo(x, P.y0 + 2 + (x * 7 % 9)); g.lineTo(w, P.y0 - 2); g.lineTo(0, P.y0 - 2); g.fill();
      for (const q of P.cr) { g.fillStyle = '#08070A'; g.beginPath(); g.ellipse(q[0], q[1], P.ms * 0.42, P.ms * 0.2, 0, 0, TAU); g.fill(); g.strokeStyle = 'rgba(120,118,146,0.5)'; g.lineWidth = 1; g.beginPath(); g.ellipse(q[0], q[1] - 1, P.ms * 0.46, P.ms * 0.23, 0, Math.PI, TAU); g.stroke(); }
      const r2 = rng(19); for (let i = 0; i < 4; i++) this.shrub(g, w * (0.2 + 0.75 * r2()), P.y0 + (P.y1 - P.y0) * (0.1 + 0.85 * r2()), P.ms * 1.1, r2);
      g.strokeStyle = '#2A231C'; g.lineWidth = Math.max(3, P.u * 0.012); g.lineCap = 'round'; const [px, py] = P.perch; g.beginPath(); g.moveTo(px - 8, P.y1); g.lineTo(px - 4, py + P.ms * 0.4); g.lineTo(px + 18, py + P.ms * 0.1); g.stroke(); g.lineWidth = 2; g.beginPath(); g.moveTo(px - 5, py + P.ms * 0.9); g.lineTo(px - 24, py + P.ms * 0.3); g.stroke();
      g.fillStyle = '#0B0A0D'; g.beginPath(); g.ellipse(P.nest[0], P.nest[1] + 4, P.ms * 0.95, P.ms * 0.42, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(20,18,26,0.92)'; g.fillRect(0, P.y1 + 2, w, h - P.y1);
    });
    c.drawImage(bg, 0, 0, w, h);
    if (s.phase === 'dawn' || s.phase === 'banner' || v.flash > 0) {   // dawn: a rose band rises over the sea, then night returns
      const k = s.phase === 'dawn' ? Math.min(1, s.t / 0.35) * (this.sim.hands(s, s.n) ? 1 : 0.6) : v.flash * 3; if (k > 0) { const g = c.createLinearGradient(0, P.top, 0, P.sea1); g.addColorStop(0, 'rgba(120,96,150,0)'); g.addColorStop(1, 'rgba(232,160,138,' + (0.45 * k).toFixed(3) + ')'); c.fillStyle = g; c.fillRect(0, 0, w, P.sea1); }
    }
    const fy = P.hy + (P.sea1 - P.hy) * 0.45;   // the ferry: from the sand isle to the dock at dawn
    if (v.ferry) { const f = Math.min(1, v.ferry.t / (v.ferry.d * 0.7)), x = w * 0.66 + (P.dock[0] - w * 0.66) * f, y = fy + (P.dock[1] - fy) * f; this.boat(c, x, y, Math.max(16, P.u * 0.05), 1, v.ferry.k);
      if (!v.ferry.lapse && f >= 1) { const k = Math.min(v.ferry.k, 8), g = (v.ferry.t - v.ferry.d * 0.7) / (v.ferry.d * 0.3); for (let i = 0; i < k; i++) { const gg = Math.max(0, Math.min(1, g * 1.4 - i * 0.12)); if (gg > 0 && gg < 1) this.drawMouse(c, P.dock[0] - 6 - gg * w * 0.18, P.dock[1] + 10 + gg * 14 + (i % 3) * 3, false, P.ms * 0.7, -1, 1 - gg * 0.5); } } }
    else this.boat(c, w * 0.66, fy, Math.max(14, P.u * 0.04), 0.7, 0);
    for (const m of this.openMice()) { this.drawMouse(c, m.x, m.y, m.dark, P.ms, m.dir); if (this.v.tgt != null && typeof Fx !== 'undefined' && Fx.lastInput === 'key') { const ms = this.openMice(); if (ms[Math.min(v.tgt, ms.length - 1)] === m || ms[Math.min(v.tgt, ms.length - 1)].id === m.id) { c.setLineDash([3, 3]); c.strokeStyle = '#E8DFC9'; c.lineWidth = 1.5; c.beginPath(); c.arc(m.x, m.y, P.ms * 0.8, 0, TAU); c.stroke(); c.setLineDash([]); } } }
    const osz = Math.max(30, P.u * 0.095), [px, py] = P.perch;
    if (v.swoop) { const k = v.swoop.t / SWP_C.busy, out = k < 0.4, f = out ? k / 0.4 : 1 - (k - 0.4) / 0.6, x = px + (v.swoop.x - px) * f, y = py + (v.swoop.y - osz * 0.3 - py) * f - Det.sin(Math.PI * f) * osz * 0.6; this.owl(c, x, y, osz, { wings: 0.4 + 0.6 * Math.abs(Det.sin(v.t * 18)), flip: v.swoop.x < px, prey: out ? null : v.swoop.got }); }
    else this.owl(c, px + 6, py, osz, { wings: 0 });
    for (let i = 0; i < 3; i++) {   // three downy owlets in the crack: pale heart faces; a fed one bobs
      const x = P.nest[0] - P.ms * 0.62 + i * P.ms * 0.62, y = P.nest[1] - (v.owlets[i] > 0 ? 6 * Det.sin(Math.PI * v.owlets[i] / 0.5) : 0), r = P.ms * 0.3;
      c.fillStyle = '#E4D9C4'; c.beginPath(); c.ellipse(x, y + r * 0.35, r * 0.95, r * 0.8, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x, y - r * 0.35, r * 0.7, 0, TAU); c.fill();
      c.fillStyle = '#F8F3EA'; c.beginPath(); c.moveTo(x, y - r * 0.05); c.bezierCurveTo(x - r * 0.75, y - r * 0.2, x - r * 0.5, y - r * 0.95, x, y - r * 0.7); c.bezierCurveTo(x + r * 0.5, y - r * 0.95, x + r * 0.75, y - r * 0.2, x, y - r * 0.05); c.fill();
      c.fillStyle = '#17110D'; c.beginPath(); c.arc(x - r * 0.22, y - r * 0.42, Math.max(1.3, r * 0.1), 0, TAU); c.arc(x + r * 0.22, y - r * 0.42, Math.max(1.3, r * 0.1), 0, TAU); c.fill();
      c.fillStyle = '#C9B48E'; c.beginPath(); c.moveTo(x - 1.5, y - r * 0.3); c.lineTo(x + 1.5, y - r * 0.3); c.lineTo(x, y - r * 0.12); c.fill();
    }
    if (s.h) { const fed = Math.min(SWP_C.feed, s.h.fed); for (let i = 0; i < SWP_C.feed; i++) { c.beginPath(); c.arc(P.nest[0] - 13 + i * 9, P.nest[1] + P.ms * 0.62, 3, 0, TAU); if (i < fed) { c.fillStyle = '#E8DFC9'; c.fill(); } else { c.lineWidth = 1; c.strokeStyle = 'rgba(232,223,201,0.6)'; c.stroke(); } } }
    const n0 = 20, dk = Math.round(n0 * (s.dark != null ? s.dark : SWP_C.d0)), cy = P.y1 + 21, step = (w - 30 - 90) / n0;   // the isle's census strip: 20 mice, each 5% of the isle, at the true dark share
    for (let i = 0; i < n0; i++) this.drawMouse(c, 22 + i * step, cy, i < dk, Math.max(12, Math.min(26, step * 0.95)), 1);
    if (typeof Lbl !== 'undefined') { Lbl.put('sw-cen', Txt.f(L.dark, { p: this.pc(s.dark != null ? s.dark : SWP_C.d0) }), w - 8, cy, { align: 'right', size: 12, c, mono: true }); Lbl.put('sw-sand', L.sand, w * 0.76, P.hy - 26, { size: 12, c, pill: false, ink: '#E8DFC9' }); }
  },
  boat(c, x, y, sz, a, k) {   // the little ferry: a hull, a cabin, a lamp; pale passengers on deck
    c.save(); c.globalAlpha *= a; c.fillStyle = '#3A3550'; c.beginPath(); c.moveTo(x - sz, y); c.lineTo(x + sz, y); c.lineTo(x + sz * 0.75, y + sz * 0.38); c.lineTo(x - sz * 0.8, y + sz * 0.38); c.fill();
    c.fillStyle = '#C9C2DE'; c.fillRect(x - sz * 0.35, y - sz * 0.45, sz * 0.6, sz * 0.45); c.fillStyle = '#F4D58A'; c.beginPath(); c.arc(x + sz * 0.55, y - sz * 0.15, 2, 0, TAU); c.fill();
    for (let i = 0; i < Math.min(3, k || 0); i++) { c.fillStyle = '#D9BD87'; c.beginPath(); c.ellipse(x - sz * 0.7 + i * sz * 0.2, y - 3, 3, 2, 0, 0, TAU); c.fill(); }
    c.restore();
  },
  drawCoast(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), L = this.content.labels, E = SWP_C.E, xE = P.X(E);
    const bg = this.bake('coast', w, h, (g) => {
      this.sky(g, w, P.top, P.landY); this.starfield(g, w, 0, P.landY - 40, 23, Math.round(w * P.landY / 900)); this.moon(g, w * 0.82, P.top + (P.calY - P.top) + 40, Math.max(8, P.u * 0.024));
      const sg = g.createLinearGradient(0, P.seaY, 0, h); sg.addColorStop(0, '#20295C'); sg.addColorStop(1, '#141A40'); g.fillStyle = sg; g.fillRect(0, P.seaY, w, h - P.seaY);
      const r = rng(8); g.strokeStyle = 'rgba(160,168,214,0.3)'; for (let i = 0; i < w / 10; i++) { const x = r() * w, y = P.seaY + 6 + r() * (h - P.seaY - 8); g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3 + r() * 9, y); g.stroke(); }
      const top = P.landTop;   // lava: a jagged black flow; dunes: smooth ochre crests
      g.save(); g.beginPath(); g.moveTo(0, P.seaY); for (let x = 0; x <= xE; x += 7) g.lineTo(x, top - 8 - (this.hash('l' + x) % 14)); g.lineTo(xE, P.seaY); g.closePath(); g.clip(); this.basalt(g, 0, top - 30, xE, P.seaY - top + 30, 12); g.restore();
      g.save(); g.beginPath(); g.moveTo(xE, P.seaY); g.lineTo(xE, top); for (let x = xE; x <= w + 10; x += 6) g.lineTo(x, top - 6 - 10 * (0.5 + 0.5 * Det.sin(x / 37)) * (0.5 + 0.5 * Det.sin(x / 91))); g.lineTo(w, P.seaY); g.closePath(); g.clip(); this.dunes(g, xE, top - 30, w - xE, P.seaY - top + 30, 13); g.restore();
      g.fillStyle = 'rgba(232,223,201,0.10)'; g.fillRect(0, P.seaY - 3, w, 3);
    });
    c.drawImage(bg, 0, 0, w, h);
    const sp = this.sim.sprof(s.roosts, s.owls);   // while you place roosts, the owls' reach shows as a faint moonlit wash
    if (s.phase === 'build') for (let i = 0; i < SWP_C.ND; i++) if (sp[i] > 0) { c.fillStyle = 'rgba(214,220,255,' + Math.min(0.08, sp[i] * 0.5).toFixed(3) + ')'; c.fillRect(P.X(i), P.landTop - 4, P.X(i + 1) - P.X(i) + 0.5, P.seaY - P.landTop); }
    const rows = P.rows, band = P.seaY - P.landTop - 18;   // the mice: each patch shows its true dark share, a few deep
    for (let j = 0; j < rows; j++) for (let i = 0; i < SWP_C.ND; i++) { const hh = this.hash('c' + i + ':' + j), dark = (hh % 1000) / 1000 < s.p[i], x = P.X(i + 0.1 + 0.8 * ((hh >>> 10) % 100) / 100), y = P.landTop + 12 + band * (j + 0.2 + 0.6 * ((hh >>> 17) % 100) / 100) / rows; this.drawMouse(c, x, y, dark, P.ms, (hh & 1) ? 1 : -1); }
    const osz = P.osz;
    for (let i = 0; i < 4; i++) { const x = P.X(s.roosts[i]); c.strokeStyle = '#2A231C'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, P.landTop + 10); c.lineTo(x, P.postY + osz * 0.35); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(x, P.postY + osz * 0.6); c.lineTo(x + 10, P.postY + osz * 0.3); c.stroke();
      const busy = v.anims.some(a => a.k === 'swoop' && Math.abs(a.x0 - x) < 1 && a.t < a.d * 0.8);
      if (!busy) { this.owl(c, x, P.postY, osz, { wings: 0 }); if (s.owls > 1) this.owl(c, x + osz * 0.5, P.postY + osz * 0.12, osz * 0.8, { wings: 0, flip: true }); }
      if (s.phase === 'build' && v.sel === i && typeof Fx !== 'undefined' && Fx.lastInput === 'key') { c.setLineDash([3, 3]); c.strokeStyle = '#E8DFC9'; c.beginPath(); c.arc(x, P.postY - osz * 0.2, osz * 0.75, 0, TAU); c.stroke(); c.setLineDash([]); } }
    for (const a of v.anims) if (a.k === 'swoop') { const k = a.t / a.d, f = k < 0.5 ? k / 0.5 : 1 - (k - 0.5) / 0.5, x = a.x0 + (a.x1 - a.x0) * f, y = P.postY + (P.landY - 10 - P.postY) * f - Det.sin(Math.PI * f) * osz * 0.4; this.owl(c, x, y, osz * 0.9, { wings: 0.5 + 0.5 * Math.abs(Det.sin(v.t * 16)), flip: a.x1 < a.x0, prey: k >= 0.5 ? (a.dark ? 1 : 0) : null }); }
    const m = this.sim.measure(s.p);   // the caliper: brass jaws clamp the 80% and 20% points
    if (m.a != null && m.b != null && s.phase !== 'build') {
      const cal = v.cal || (v.cal = { a: m.a, b: m.b }); cal.a += (m.a - cal.a) * 0.15; cal.b += (m.b - cal.b) * 0.15;
      const xa = P.X(Math.min(cal.a, cal.b)), xb = P.X(Math.max(cal.a, cal.b)), y = P.calY;
      c.fillStyle = '#B08A3E'; c.fillRect(xa - 6, y - 4, xb - xa + 12, 8); c.strokeStyle = '#5E4518'; c.lineWidth = 1; c.strokeRect(xa - 6, y - 4, xb - xa + 12, 8);
      for (const x of [xa, xb]) { c.fillStyle = '#C9A24E'; c.beginPath(); c.moveTo(x - 4, y - 6); c.lineTo(x + 4, y - 6); c.lineTo(x + 1.5, P.landTop - 2); c.lineTo(x - 1.5, P.landTop - 2); c.fill(); c.stroke(); }
      if (typeof Lbl !== 'undefined') Lbl.put('sw-cal', Txt.f(L.w, { w: Math.abs(cal.b - cal.a).toFixed(1) }), (xa + xb) / 2, y - 16, { size: 13, c, mono: true });
    }
    if (typeof Lbl !== 'undefined') { Lbl.put('sw-edge', L.edge, xE, P.seaY + 14, { size: 12, c }); Lbl.put('sw-lv', L.lava, P.X(8), P.seaY + 14, { size: 12, c, pill: false, ink: '#E8DFC9' }); Lbl.put('sw-dn', L.dunes, P.X(52), P.seaY + 14, { size: 12, c, pill: false, ink: '#E8DFC9' }); }
  },
  drawMap(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), L = this.content.labels, n = s.level, A = typeof Pal !== 'undefined' ? Pal.A : '#6B97FF', B = typeof Pal !== 'undefined' ? Pal.a : '#F2C94C';
    const bg = this.bake('map' + n, w, h, (g) => {
      const sg = g.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, '#11163A'); sg.addColorStop(1, '#232C62'); g.fillStyle = sg; g.fillRect(0, 0, w, h);
      const r = rng(31); g.strokeStyle = 'rgba(150,158,206,0.22)'; g.lineWidth = 1; for (let i = 0; i < w * h / 2500; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 4 + r() * 8, y); g.stroke(); }
      const my = h - (n === 2 ? 52 : 18); g.save(); g.beginPath(); g.moveTo(0, h); g.lineTo(0, my); for (let x = 0; x <= w; x += 8) g.lineTo(x, my - 6 * Det.sin(x / 41) - 3 * Det.sin(x / 13)); g.lineTo(w, h); g.closePath(); g.clip(); this.dunes(g, 0, my - 12, w, h - my + 12, 37); g.restore();
      if (n === 2) { const [hx, hy] = P.node(-1); g.strokeStyle = '#4A3A2A'; g.lineWidth = 4; g.beginPath(); g.moveTo(hx, hy + 12); g.lineTo(hx, hy - 16); g.stroke(); g.fillStyle = '#F4D58A'; g.beginPath(); g.arc(hx, hy - 20, 4, 0, TAU); g.fill(); const lg = g.createRadialGradient(hx, hy - 20, 2, hx, hy - 20, 30); lg.addColorStop(0, 'rgba(244,213,138,0.4)'); lg.addColorStop(1, 'rgba(244,213,138,0)'); g.fillStyle = lg; g.fillRect(hx - 30, hy - 50, 60, 60); }
      for (let i = 0; i < 5; i++) { const [x, y] = P.node(i), R0 = P.ir, rr = rng(50 + i); g.save(); g.beginPath(); for (let k = 0; k <= 14; k++) { const a = k / 14 * TAU, q = R0 * (SW_ISLES[i][2] ? 0.8 + 0.3 * rr() : 0.92 + 0.12 * rr()); if (k) g.lineTo(x + Det.cos(a) * q, y + Det.sin(a) * q * 0.72); else g.moveTo(x + Det.cos(a) * q, y + Det.sin(a) * q * 0.72); } g.closePath();
        g.fillStyle = 'rgba(200,206,240,0.18)'; g.lineWidth = 4; g.strokeStyle = 'rgba(200,206,240,0.15)'; g.stroke(); g.clip(); if (SW_ISLES[i][2]) this.basalt(g, x - R0 * 1.2, y - R0, R0 * 2.4, R0 * 2, 60 + i); else this.dunes(g, x - R0 * 1.2, y - R0, R0 * 2.4, R0 * 2, 60 + i); g.restore(); }
    });
    c.drawImage(bg, 0, 0, w, h);
    const t = typeof Fx !== 'undefined' && Fx.calm ? 0 : v.t, ferryLine = (pts, dash, lab) => {   // a ferry route: dashed wake; a boat runs it back and forth
      c.setLineDash(dash); c.lineWidth = 2.5; c.strokeStyle = 'rgba(214,220,255,0.75)'; c.beginPath(); pts.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.setLineDash([]);
      if (pts.length < 2) return; const segs = pts.length - 1, ph = (t * 0.18 + this.hash(lab) % 100 / 100) % 2, f = ph < 1 ? ph : 2 - ph, k = Math.min(segs - 1, Math.floor(f * segs)), ff = f * segs - k, a = pts[k], b = pts[k + 1];
      this.boat(c, a[0] + (b[0] - a[0]) * ff, a[1] + (b[1] - a[1]) * ff, Math.max(10, P.u * 0.028), 1, 1);
    };
    { for (const [a, b] of s.routes) ferryLine([P.node(a), P.node(b)], [7, 5], 'r' + a + b); if (v.drag && v.drag.a != null) { const a = P.node(v.drag.a); c.setLineDash([4, 4]); c.strokeStyle = '#E8DFC9'; c.lineWidth = 2; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(v.drag.x, v.drag.y); c.stroke(); c.setLineDash([]); } if (v.pick != null) { const a = P.node(v.pick); c.setLineDash([3, 3]); c.strokeStyle = '#E8DFC9'; c.beginPath(); c.arc(a[0], a[1], (v.pick < 0 ? 20 : P.ir * 1.15), 0, TAU); c.stroke(); c.setLineDash([]); } }
    const mc = Math.max(5, Math.min(9, Math.round(P.ir / 6)));
    for (let i = 0; i < 5; i++) {
      const [x, y] = P.node(i), lava = SW_ISLES[i][2], dk = n === 3 ? 1 - (1 - s.pD[i]) * (1 - s.pD[i]) : lava ? 0.85 : 0.04, nd = Math.round(mc * dk);
      for (let j = 0; j < mc; j++) { const hh = this.hash('i' + i + ':' + j), a = (hh % 360) / 360 * TAU, rr = P.ir * (0.15 + 0.5 * ((hh >>> 9) % 100) / 100); this.drawMouse(c, x + Det.cos(a) * rr, y + Det.sin(a) * rr * 0.6, j < nd, Math.max(9, P.ir * 0.32), (hh & 1) ? 1 : -1); }
      if (n === 3) this.owl(c, x + P.ir * 0.82, y - P.ir * 0.42, Math.max(14, P.ir * 0.42), { wings: 0 });   // owls hunt on every isle
      const bw = P.ir * 1.5, bh = 9, bx = x - bw / 2, by = y + P.ir * 0.72 + 4, p = s.p[i];   // the neutral marker as an allele read-out (data inks allowed here, D6 addendum 7)
      c.fillStyle = A; c.fillRect(bx, by, bw * p, bh); c.fillStyle = B; c.fillRect(bx + bw * p, by, bw * (1 - p), bh); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.strokeRect(bx, by, bw, bh);
      if (typeof Lbl !== 'undefined') {
        Lbl.put('sw-n' + i, L[['L1', 'L2', 'S1', 'S2', 'S3'][i]], x, y - P.ir * 0.72 - 10, { size: 12, c });
        if (p <= 0 || p >= 1) Lbl.put('sw-x' + i, L.fixed, x, by + bh + 10, { size: 12, c });
        if (n === 3 && s.phase === 'over' && s.ex && !s.whatif) Lbl.put('sw-ok' + i, L[s.ex.why ? s.ex.why[i] : s.ex.ok[i] ? 'ok' : 'bad'], x, by + bh + 10, { size: 12, c, ink: '#1B1612' });
      }
    }
    if (typeof Lbl !== 'undefined') { if (n === 2) { const [hx, hy] = P.node(-1); Lbl.put('sw-hb', L.harbour, hx + 44, hy - 4, { size: 12, c }); } if (s.phase === 'lay' || s.phase === 'plan') Lbl.put('sw-fb', Txt.f(L.ferries, { n: s.routes.length, b: n === 2 ? 5 : SWP_C.bossMax }), w - 12, h - 14, { align: 'right', size: 12, c }); }
    const F = n === 2 ? s.F[s.F.length - 1] : s.Fn[s.Fn.length - 1], gw = Math.min(150, w * 0.3), gx = 12, gy = n === 2 ? h - 22 : h - 12;   // the F_ST gauge, low on the left (clear of the isles)
    c.fillStyle = 'rgba(20,18,26,0.7)'; c.fillRect(gx - 4, gy - 22, gw + 8, 28); c.fillStyle = 'rgba(232,223,201,0.25)'; c.fillRect(gx, gy - 4, gw, 8); c.fillStyle = '#E8DFC9'; c.fillRect(gx, gy - 4, gw * F, 8); c.strokeStyle = '#E8DFC9'; c.lineWidth = 1; c.strokeRect(gx, gy - 4, gw, 8);
    if (typeof Lbl !== 'undefined') Lbl.put('sw-fst', Txt.f(L.fst, { f: this.f2(F) }), gx, gy - 14, { align: 'left', size: 12, c, mono: true, pill: false });
  },

  /* ---------- the live strip (notes() is the LiveGraph data provider) ---------- */
  notes() {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    const D = this.content.data, n = s.level, stats = [], row = (d, vars) => stats.push([d[0], Txt.f(d[1], vars), d[2] ? Txt.f(d[2], vars) : '']);
    if (n === 0) { row(D.dark, { d: this.pc(s.dark != null ? s.dark : SWP_C.d0), n: Math.max(1, s.n), r: s.r + 1 }); row(D.ms, { m: this.f2(s.m), s: s.sY == null ? '?' : this.f2(s.sY) }); row(D.fed, { a: s.hunts.filter(h => h.fed >= SWP_C.feed).length, b: s.hunts.length }); return { stats, charts: [this.darkSpec(), this.msSpec()] }; }
    if (n === 1) { const m = this.sim.measure(s.p); row(D.width, { w: m.w.toFixed(1) }); row(D.centre, { c: m.c.toFixed(1) }); return { stats, charts: [this.clineSpec(), this.widthSpec()] }; }
    if (n === 2) { row(D.fst, { f: this.f2(s.F[s.F.length - 1]), g: s.gen }); row(D.routes, { n: s.routes.length }); return { stats, charts: [this.fstSpec(), this.mapSpec()] }; }
    row(D.fst, { f: this.f2(s.Fn[s.Fn.length - 1]), g: s.gen }); if (s.ex) row(D.held, { n: s.ex.held });
    return { stats, charts: [this.fst2Spec(), this.mapSpec()] };
  },
  darkSpec() {   // dark share at dawn by night, one curve per round labelled with its ferry m: this round solid, earlier rounds faint
    const s = this.sim.s, D = this.content.data, series = [];
    s.rd.forEach((R0, r) => { const pts = [[0, R0.dark0]].concat(R0.d.map((d, i) => [i + 1, d])); series.push({ pts, w: r === s.r ? 3 : 1.5, faint: r !== s.r, label: Txt.f(D.lines.mr, { m: this.f2(R0.m) }) }); });
    return { type: 'sw_xy', title: D.titles.dark, x: { lo: 0, hi: 10, label: D.ax.night, fmt: 'int' }, y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed', series, lines: [] };
  },
  msSpec() { const s = this.sim.s, D = this.content.data, bars = [{ x: 0.5, y: s.m, label: D.lines.m }]; if (s.sY != null) bars.push({ x: 1.5, y: s.sY, label: D.lines.s }); return { type: 'sw_xy', title: D.titles.ms, fold: false, x: { lo: 0, hi: 2 }, y: { lo: 0, hi: SWP_C.thHi, label: D.ax.rate }, frame: 'designed', noX: true, bars, series: [], lines: [] }; },
  clineSpec() {
    const s = this.sim.s, D = this.content.data, sim = this.sim, lines = [];
    return { type: 'sw_xy', title: D.titles.cline, x: { lo: 0, hi: 60, label: D.ax.km }, y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed', series: [{ pts: s.p.map((p, i) => [i + 0.5, p]), w: 3 }], lines, vlines: [{ x: SWP_C.E, dash: true }] };
  },
  widthSpec() { const s = this.sim.s, D = this.content.data, labs = [D.lines.w0, D.lines.w1, D.lines.w2], dots = s.ws.slice(0, 3).map((q, i) => ({ x: Math.min(30, q.w), y: 2.5 - i, label: labs[i] })); return { type: 'sw_xy', title: D.titles.width, fold: false, x: { lo: 0, hi: 30, label: D.ax.w }, y: { lo: 0, hi: 3 }, noY: true, frame: 'designed', dots, series: [], lines: [] }; },
  fstSpec() {
    const s = this.sim.s, D = this.content.data, lines = [], G = SWP_C.fGens;
    if (s.gen >= G[0]) lines.push({ pts: s.FE.slice(0, G[0] + 1).map((f, i) => [i, f]).filter((q, i) => i % 2 === 0), label: s.gen >= G[1] ? null : D.lines.exp });   // the model's expectation, shown once each phase is over
    if (s.gen >= G[1]) lines.push({ pts: s.FE.slice(G[0]).map((f, i) => [G[0] + i, f]).filter((q, i) => i % 2 === 0), label: D.lines.exp });
    return { type: 'sw_xy', title: D.titles.fst, x: { lo: 0, hi: G[1], label: D.ax.gen }, y: { lo: 0, hi: 1, label: D.ax.f }, frame: 'designed', series: [{ pts: s.F.map((f, i) => [i, f]), w: 2.5 }], lines, vlines: [{ x: G[0], dash: true }] };
  },
  fst2Spec() {
    const s = this.sim.s, D = this.content.data, lines = [], done = s.gen >= SWP_C.bossG;
    if (done) lines.push({ pts: s.Ec.map((f, i) => [i, f]), label: D.lines.exp });
    return { type: 'sw_xy', title: D.titles.fst2, x: { lo: 0, hi: SWP_C.bossG, label: D.ax.gen }, y: { lo: 0, hi: 1, label: D.ax.f }, frame: 'designed', series: [{ pts: s.Fc.map((f, i) => [i, f]), w: 3, label: D.lines.colour }, { pts: s.Fn.map((f, i) => [i, f]), w: 1.5, faint: true, label: D.lines.marker }], lines };
  },
  mapSpec() {
    const s = this.sim.s, D = this.content.data, L = this.content.labels, names = ['L1', 'L2', 'S1', 'S2', 'S3'].map(k => L[k]), links = [];
    if (s.level === 2) for (const [a, b] of s.routes) if (a >= 0) links.push({ a, b, m: 1 }, { a: b, b: a, m: 1 });
    if (s.level === 3) for (const [a, b] of s.routes) links.push({ a, b, m: 1 }, { a: b, b: a, m: 1 });
    return { type: 'deme', title: D.titles.map, fold: false, mode: 'map', demes: [0, 1, 2, 3, 4].map(i => ({ x: SW_ISLES[i][0], y: SW_ISLES[i][1] / 0.62, p: Math.round(s.p[i] * 100) / 100, N: s.N, label: names[i] })), links };
  },
  cardSpec() { const n = this.level; return n === 0 ? this.darkSpec() : n === 1 ? this.clineSpec() : n === 2 ? this.fstSpec() : this.fst2Spec(); }
};
V2.push(CH_SWAMP_V2);

/* ---------- sw_xy: one XY chart for the unit: realised solid, expected dashed, bars, dots and reference lines ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.sw_xy) LiveGraph.T.sw_xy = {
  lay(w, h, spec, T, c) { const labels = (spec.lines || []).map(l => l.label).concat((spec.series || []).map(l => l.label), (spec.dots || []).map(d => d.label)); return wgXY(w, h, spec, T, c, { xlo: spec.x.lo, xhi: spec.x.hi, ylo: spec.y.lo, yhi: spec.y.hi, labels }); },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, ends = [], path = pts => { c.beginPath(); pts.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); };
    wgAxes(c, G, spec, T, { noY: !!spec.noY, noX: !!spec.noX });
    for (const b of spec.bars || []) { const x0 = G.X(b.x - 0.3), x1 = G.X(b.x + 0.3), y = G.Y(b.y), yb = G.Y(spec.y.lo); c.fillStyle = wgRgba(I.text, 0.75); c.fillRect(x0, y, x1 - x0, yb - y); if (!T.compact) { wgText(c, b.label, (x0 + x1) / 2, p.y + p.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 }); wgText(c, wgFmt(null, Math.round(b.y * 100) / 100), (x0 + x1) / 2, y - 2 - G.tk / 2, G.tk, I.text, { align: 'center' }); } }
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip(); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const l of spec.vlines || []) { const x = G.X(l.x); c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.45); c.setLineDash(l.dash ? [2, 3] : []); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); }
    for (const l of spec.lines || []) { if (!l.pts || l.pts.length < 2) continue; c.setLineDash(l.thin ? [2, 4] : [6, 4]); c.lineWidth = (l.thin ? 1.5 : 2) * T.k; c.strokeStyle = I.text; path(l.pts); c.stroke(); const q = l.pts[l.pts.length - 1]; if (l.label) ends.push({ y: G.Y(q[1]), text: l.label, col: I.text, dash: true }); }
    c.setLineDash([]);
    for (const sr of spec.series || []) { if (!sr.pts || !sr.pts.length) continue; c.lineWidth = (sr.w || 2) * T.k; c.strokeStyle = sr.faint ? wgRgba(I.text, 0.4) : I.text; path(sr.pts); c.stroke(); const q = sr.pts[sr.pts.length - 1]; if (!sr.faint) wgMark(c, 'ink', G.X(q[0]), G.Y(q[1]), 3.5 * T.k, I.text, I.surface); if (sr.label) ends.push({ y: G.Y(q[1]), text: sr.label, col: sr.faint ? wgRgba(I.text, 0.6) : I.text, role: 'ink' }); }
    for (const d of spec.dots || []) { const x = G.X(d.x), y = G.Y(d.y), r = 4.5 * T.k; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = I.text; c.fill(); c.lineWidth = 1; c.strokeStyle = I.surface; c.stroke(); if (d.label) ends.push({ y, text: d.label, col: I.text, role: 'ink' }); }
    c.restore();
    wgEnds(c, G, ends, T);
  },
  rows(spec) {
    const fx = spec.x && spec.x.fmt, fy = spec.y && spec.y.fmt, out = [];
    for (const sr of spec.series || []) for (const q of (sr.pts || []).filter((q0, i, a) => a.length < 40 || i % 5 === 0)) out.push([sr.label || 'realised', wgFmt(fx, q[0]), wgFmt(fy, q[1])]);
    for (const l of spec.lines || []) for (const q of (l.pts || []).filter((q0, i, a) => a.length < 40 || i % 5 === 0)) out.push([(l.label || 'expected') + ' (expected)', wgFmt(fx, q[0]), wgFmt(fy, q[1])]);
    for (const b of spec.bars || []) out.push([b.label, '', wgFmt(null, b.y)]);
    for (const d of spec.dots || []) out.push([d.label || 'point', wgFmt(fx, d.x), '']);
    return { head: ['series', (spec.x && spec.x.label) || 'x', (spec.y && spec.y.label) || 'y'], rows: out };
  },
  say(spec) { const sr = (spec.series || [])[0], q = sr && sr.pts && sr.pts[sr.pts.length - 1]; return (spec.title || '') + (q ? ': ' + wgFmt(spec.y && spec.y.fmt, q[1]) : ''); }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.swamp = SW_TEXT.take;
  MODEL.swamp = 'Pocket mice on lava and sand isles: owls remove mismatched coats; a ferry brings migrants. Swamping once m reaches s; clines of width σ ÷ √s; F_ST near 1 ÷ (1 + 4Nm).';
  RECALL.swamp = { q: 'Pale migrants land on a lava isle at rate m. Owls remove pale mice at rate s. When are dark coats swamped?', opts: [['ms', 'When m reaches s'], ['any', 'With any migration at all'], ['never', 'Never, if owls hunt']], ans: 'ms', why: 'Selection removes pale copies at rate about s; migrants add them at rate m. Dark coats hold only while m stays below s.' };
  BRIDGE.swamp = 'In the Black Country one pale migrant a generation kept the old coat alive. Here migrants arrive by the boatload.';
}
