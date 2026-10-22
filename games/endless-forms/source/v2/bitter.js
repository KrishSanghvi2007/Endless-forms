/* ================= v2/bitter.js: Bitter Wings (CH_BITTER_V2; D1 §3.2, D5 §4 item 6, D6) =================
   World (D6 addendum 7): a Neotropical forest edge. The player is a rufous-tailed jacamar feeding four downy chicks in
   a bank burrow (role: selective environment; jacamars taste and release Heliconius, then reject them on sight: Chai
   1986). Tap a butterfly to eat it. A Heliconius-style model (black, red band, yellow bar) is bitter: the retch costs seconds (the felt cost, D0) and flips a tile into the taste ledger, the
   bird's memory (D1 Ledger; tiles fade over two mornings). What you spare breeds at dusk.
   D6 decision 9 (simple beats clever): four levels, one verb (tap to eat), one prediction (L3's meeting point).
     L1 Bitter lessons    8 models; 24 palewings (Dismorphia-like whites, Bates's own mimics) start cream. Sparing what looks bitter makes palewings look bitter.
     L2 Too many liars    the models' passion vine wilts: models 12 → 1, then back to 12. The HUD shows the key number every
                          day: k mimics per model against C, the retch cost in meals. Tasting pays when k > C.
     L3 Two poisons       bitterwings and sourwings, both defended; four young birds each taste one of every look they
                          have not learned (Müller 1879). Each look loses about the same count, so the rarer pays a bigger share
                          (n ÷ N) and converges on the commoner (advergence), by a large-effect allele first (Turner's two steps).
     L4 The first warning (boss) a rare bright colour on a defended green shield bug, on two river islands: eggs scattered on A,
                          sibling clusters on B. Rare and scattered, bright is tasted out; clustered, one taste spares
                          the siblings (Alatalo & Mappes 1996). Inverts L1–L2: for a warning colour, rare is bad.
   Internally each level runs a model kind (BWK.KIND: 0, 1, 3, 4; s.kd), so the old "Deadly models" kind 2 is simply gone.
   The prediction is scored against the model's expectation for the parameters in force (D1 G10), never the realised
   run. A run is (seed, level, actions); the view juices from Sim.run's events only. Not a Hunt-mode chapter: Hunt has
   no replay, Freezer or bot sweep (lessons_batch1 §0 rule 1). Load rule: top level touches legacy objects only; every
   engine call is behind a typeof guard or inside a function. */

/* ---------- constants and pure helpers (Det-safe: + − × ÷, Math.sqrt and Det only) ---------- */
const BWK = {
  T: { dawn: 1.2, dusk: 2.4, duskF: 0.8, post: 0.6, askMax: 40, handle: 0.25, miss: 0.3, autoDt: 0.45, autoF: 0.12 },
  N: 24, QUOTA: 12, CHICKS: 4, TIME: 12, LOOKS: 18, WARN: 0.6, HALO: 0.15, FADE: [1, 0.6, 0.3, 0], MAXLED: 10,
  BOX: { x0: 26, x1: 364, y0: 128, y1: 438 },   BAND: 96,                       // the leaf, in the fixed virtual 390 × 540 stage
  // D6 decision 9: four levels. KIND maps the level number to its model (the old "Deadly models" kind 2 is cut); s.kd holds the kind
  KIND: [0, 1, 3, 4],
  LV: [
    { gens: 6, models: [8], cost: 3, m0: 0.12, s0: 0.10, ask: {} },
    { gens: 9, models: [12, 8, 5, 3, 1, 1, 3, 8, 12], costs: [2, 2.5, 3, 3.5, 4], grubs: 6, m0: 0.62, s0: 0.17, ask: {} },
    null,
    { gens: 8, common: 24, rare: 8, grubs: 12, quota: 8, cost: 1.5, young: 4, enc: 0.5, gw: 0.12, jump: 0.7, ask: { 1: 'p4' } },   // the chapter's one prediction (D6 decision 9)
    { gens: 6, N: 40, terr: 8, n0: 8, dB: 0.95, dG: 0.42, brood: 6, grubs: 6, quota: 8, cost: 1.5, ask: {} }
  ],
  PRED: [null, null, null, 'p4', null], TOL: { p4: 0.06 },
  AXIS: { p4: [0, 1] }, STEP: { p4: 0.02 },
  ISL: [{ y0: 128, y1: 268 }, { y0: 300, y1: 440 }],                   // L5: island A above, island B below (virtual stage)
  lay: {}
};
function bwLay(kind) {
  const L = BWK.lay; if (L[kind]) return L[kind];
  if (kind === 'pale') L.pale = Gen.layout([{ k: 'r', n: 6, m0: 0.12, s0: 0.10, mu: 0.05, msd: 0.05, ve: 0.035, det: true }]);
  if (kind === 'two') L.two = Gen.layout([{ k: 'pt', n: 4, m0: 0.5, s0: 0.035, mu: 0.06, msd: 0.025, ve: 0.012, det: true }, { k: 'jp', kind: 'dom', n: 1, p0: 0, mu: 0, det: true }]);
  if (kind === 'isl') L.isl = Gen.layout([{ k: 'br', kind: 'dom', n: 1, p0: 0, mu: 0, det: true }]);
  return L[kind];
}
const bwMean = a => { if (!a.length) return 0; let t = 0; for (const v of a) t += v; return t / a.length; };
const bwFed = s => s.need > 0 ? s.fed / s.need : 0;
function bwGauss(rnd) { let u = 0; while (u === 0) u = rnd(); return Math.sqrt(-2 * Det.log(u)) * Det.cos(TAU * rnd()); }   // Box–Muller on a private PRNG
function bwShuffle(a, rnd) { for (let i = a.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
// L5: one dusk of young birds on an island, on any PRNG; tasting kills (D1 L4–L5). → {kill: [i…], spare: [i…], spared}
function bwYoung5(bugs, terr, dB, dG, rnd) {
  const kill = [], spare = [];
  for (let b = 0; b < terr; b++) {
    let learned = false; const mine = []; bugs.forEach((x, i) => { if (!x.st && x.ter === b) mine.push(i); });
    bwShuffle(mine, rnd);
    for (const i of mine) { const br = bugs[i].br; if (rnd() > (br ? dB : dG)) continue; if (br) { if (learned) { spare.push(i); continue; } learned = true; } kill.push(i); }
  }
  for (const i of kill) bugs[i].st = 3;
  return { kill, spare };
}

/* ---------- all words (API_v2 §9.2; D4 budgets; British spelling) ---------- */
const BW_C = {
  firstWords: 'You are a jacamar with four hungry chicks. Tap a butterfly to eat it. Some taste bitter.',
  hud: {
    hunt: 'Feed the chicks: {n} more meals.', huntU: 'Feed the chicks: {n} more meals. Each tap spends a look.',
    l2: 'The models’ passion vine is wilting. Fewer bitter butterflies each day.',
    l4: 'Two bitter species, two patterns. Dragonflies are safe food.', l5: 'Two river islands. A few bitter bugs wear a bright new colour.',
    // the key number (D6 decision 9), shown plainly with its one-line meaning
    dusk1: 'Dusk. Spared palewings average {m}% warning look. Their young inherit it.',
    kc: 'Today k = {k} mimics per model, C = {c}: {v}.', pays: 'k > C, tasting pays', spare: 'k ≤ C, sparing pays',
    dusk4: 'Young birds ate {kb} of {nb} bitterwings, {ks} of {ns} sourwings: n ÷ N.',
    dusk5: 'Bright: island A {a}%, island B {b}%. After one taste, a bird spares the siblings.',
    learn5: 'Taste one bright bug to learn it, then spare the rest. Dragonflies are food.',
    dusk: 'Dusk. The butterflies you spared lay eggs on the vines.', post: 'The young hatch.', wait: 'The season is over.',
    ask4: 'The rarer pays more per head. Where will the two patterns meet? Drag the marker.',
    whatif: 'What if: {lever}? The bird hunts for you.'
  },
  whispers: {
    miss: 'Only leaves there.', bitter: 'Bleugh! Bitter. You retch.', tasty: 'Tasty. It only looked bitter.', fed: 'All four chicks fed.',
    hungry: 'A chick went hungry.', busy: 'Still retching.', ring: 'You remember: those looks taste bitter.', crack: 'Your memory says: mostly tasty now.',
    kill: 'Tasting kills it.', spared: 'A young bird spared the siblings.',
    drag: 'Drag the marker first.', timeup: 'Time up: your marker stayed put.', idle: 'Tap a butterfly to eat it.',
    auto: 'The bird hunts for you.', manual: 'You hunt again.', grub: 'Dragonflies are safe food.'
  },
  labels: {
    gen: 'Generation {g}', day: 'Day {g}', retch: 'Retch {c} s', models: '{m} models', model1: '1 model', kc: 'k={k}, C={c}',
    you: 'you', young: 'Young birds', A: 'Island A', B: 'Island B', scat: 'eggs scattered', clus: 'sibling clusters',
    xn: 'selection ×N', hc: 'history compressed', spots: 'spots', band: 'band', cream: 'cream', warn: 'warning',
    memory: 'Taste memory', auto: 'Auto', lock: 'Lock in', skip: 'Skip', rest: 'Rest', spared: 'spared'
  },
  panels: [
    { id: 'breakeven', text: 'A warning look is worth tasting when the meal you might win outweighs the retch you might suffer. Say a retch wastes three seconds, about three meals at this pace. Then tasting pays once more than three mimics share each model. Below that, sparing warning looks is wiser, and mimics are protected.' }
  ],
  interesting: {
    flat: 'Palewing looks changed little. You ate warning looks as often as pale ones, so looking bitter gave no edge.',
    flat_idle: 'You ate few insects, so there was little selection. Palewing looks changed little.',
    short1: 'The chicks went short. Pale palewings are safe food; black-and-red ones may be bitter.',
    short2: 'The chicks went short. When models are scarce, a warning look is probably a tasty mimic.',
    nobluff: 'You never tasted a warning look while models were scarce. The bluff was there to call.',
    lost4: 'The big-jump allele was lost by chance. Without it, the rarer species could not cross the gap in small steps.',
    both4: 'Both species moved this time. Chance and your own tastes can push the commoner too.',
    short4: 'The chicks went short. Dragonflies are safe food; warning butterflies only cost you retches.',
    b_lost: 'Bright was lost on island B by chance, though young birds spared siblings. New warning colours often vanish while rare.',
    a_kept: 'Bright survived on island A this time: a few bright bugs shared a territory. Rare and scattered usually means lost.',
    short5: 'The chicks went short. Dragonflies are safe food on both islands.',
    nolearn5: 'Young birds spared siblings on island B. Learn bright as they do: one bright taste, then spare the rest.',
    w_nomodels: 'With no models, nothing made warning looks worth sparing. Palewings did not come to look bitter.',
    w_noinherit: 'Same choices, but looks were not inherited. The young started from scratch, so nothing accumulated.',
    w_manymodels: 'With models common all season, tasting never paid. The mimics kept their edge.',
    w_cheap: 'With a cheap retch, tasting paid even when models were common. The mimics’ edge was gone early.',
    w_nojump: 'Without the big jump, intermediates fell outside every memory and were tasted. Convergence stalled.',
    w_inside: 'Starting close, small steps landed within the commoner’s generalisation, so the rarer pattern crept towards it.',
    w_scatterB: 'Scattered on island B too, each bright bug was a new lesson for some young bird. Bright faded.',
    w_clusterA: 'Clustered on island A, one taste spared the siblings. Bright held on or spread.',
    w_gone: 'Bright was already gone from island A, so clustering could not bring it back.',
    w_chance: 'This rerun went against the usual trend. In populations this small, chance is strong. Try it again.'
  },
  levers: { nomodels: 'No models', noinherit: 'No inheritance', manymodels: 'Models stay', cheap: 'Cheap retch',
    nojump: 'No big jump', inside: 'Start closer', scatterB: 'Scatter B', clusterA: 'Cluster A' },
  take: 'Mimics borrow protection that models pay for; two defended species share the cost, and the rarer converges.',
  body: 'Your hesitation was the selection. Palewings that looked bitter were spared, so mimicry spread. It paid only while k, mimics per model, stayed below C, the cost of a retch. Two defended species shared the lessons, and the rarer one moved. A new warning colour survives where siblings cluster.',
  levelTake: [
    'You spared what looked bitter, so palewings that looked like models left more young.',
    'Mimics do best when rare relative to models. Once k > C, tasting paid and their edge collapsed.',
    'Two defended species share the cost of every lesson. The rarer one converged on the commoner.'],
  law: { title: 'Rare mimics, common models' },
  boss: { inverts: 'Rare mimics thrive among common models; a rare new warning colour dies unless siblings cluster.' },
  stars: { discover: 'Feed your chicks and call the bluff once k > C.', predict: 'Place the meeting point inside its band.', transfer: 'On the islands, learn bright from one taste; it outlasts A on clustered B.' },
  levelStars: [   // each level's own stars (D6 decision 9: no star needs a removed step)
    { discover: 'Feed your chicks while palewings come to look bitter.' },
    { discover: 'Feed your chicks and taste warning looks once k > C.' },
    { discover: 'Feed your chicks while the rarer pattern moves.', predict: 'Place the meeting point inside the band.' },
    { discover: 'Feed your chicks and see young birds spare siblings.', transfer: 'Taste exactly one bright bug, then spare them; bright outlasts A on B.' }],
  model: [
    { level: 0, simulated: 'You hunt 24 palewings and 8 bitter models at one forest edge for 6 generations. Palewings you spare pair at random; 24 young hatch. Look is one inherited trait, cream to black-and-red.',
      simplification: 'Models never change. You are the only predator. A retch wastes 3 s. The morning asks a meal a second, so a retch costs about 3 meals.',
      params: [{ name: 'palewings', value: '24', tag: 'designed' }, { name: 'eaten each morning', value: 'up to 12 of 24, half', tag: 'xN', real: 'a few per cent a day' },
        { name: 'heritability of look', value: 'about 0.85', tag: 'designed' }, { name: 'retch', value: '3 s', tag: 'designed' }, { name: 'generations', value: '6', tag: 'xN', real: 'dozens to thousands' }],
      cannot: 'How the first faint resemblance arose, or mimics whose looks differ in many separate traits.',
      nature: 'Bates (1862) found tasty Amazon whites that look like distasteful butterflies. Rufous-tailed jacamars taste and release such models, then reject them on sight (Chai 1986).',
      contested: false, refs: ['bates1862', 'brower1969', 'chai1986'] },
    { level: 1, simulated: 'The same forest edge. The models’ passion vine wilts, so models fall from 12 to 1 and return to 12. Your scatter compares good and poor mimics each day.',
      simplification: 'Break-even: tasting a warning look pays when k, mimics per model, exceeds C, the retch cost in meals. C (2–4 s) varies by seed. A deadlier model raises C.',
      params: [{ name: 'models', value: '12, 8, 5, 3, 1, 1, 3, 8, 12', tag: 'designed' }, { name: 'retch', value: '2–4 s by seed, so 2–4 meals', tag: 'designed' },
        { name: 'mimics', value: '24, most look warning-coloured', tag: 'designed' }, { name: 'eaten each morning', value: 'up to half', tag: 'xN', real: 'a few per cent a day' }],
      cannot: 'Several predator species with different tastes and memories.',
      nature: 'Great tits were tested with artificial prey. Mimics were protected best when models were common and very distasteful (Lindström et al. 1997).',
      contested: false, refs: ['lindstrom1997', 'ruxton2004'] },
    { level: 2, simulated: 'Bitterwings (red band) and sourwings (yellow spots), both defended. Four young jacamars each taste one of every look they have not learned; tasting kills.',
      simplification: 'Pattern is one line from spots to band. A large-effect allele jumps most of the way; small genes refine it. Young jacamars generalise over about ±0.12. Real Heliconius often survive a taste.',
      params: [{ name: 'commoner : rarer', value: '24 : 8', tag: 'designed' }, { name: 'large-effect allele', value: '2 copies in each species; moves 92% of the gap', tag: 'designed' },
        { name: 'young birds', value: '4 a dusk', tag: 'designed' }, { name: 'generations', value: '8', tag: 'xN', real: 'many more' }],
      cannot: 'Linked genes and supergenes in detail; The Tangled Pairs takes that up.',
      nature: 'Heliconius erato and H. melpomene match each other race by race across the Amazon (Müller 1879). One gene, optix, switches their red bands (Reed et al. 2011).',
      contested: false, refs: ['muller1879', 'mallet1999', 'turner1977', 'balogh2005', 'reed2011', 'joron2011'] },
    { level: 3, simulated: 'Two river islands of 40 green, defended shield bugs. A dominant allele makes a bug bright. Eight young birds per island each learn for themselves; tasting kills.',
      simplification: 'Young birds find bright bugs far more often than green ones. After one bright taste, a bird spares bright bugs for the rest of its dusk.',
      params: [{ name: 'bright at start', value: '8 of 40', tag: 'designed' }, { name: 'found per dusk', value: 'bright 95%, green 42%', tag: 'xN', real: 'far lower' },
        { name: 'brood', value: '6 eggs on B', tag: 'designed' }, { name: 'generations', value: '6', tag: 'xN', real: 'many more' }],
      cannot: 'Bright bugs that survive a taste, or predators that are wary of anything new.',
      nature: 'Jacamars attack novel colour forms of Heliconius more often (Langham 2004). Aggregated novel prey are learned faster (Alatalo & Mappes 1996), but warning colours often came before grouping (Sillén-Tullberg 1988).',
      contested: false, refs: ['langham2004', 'alatalo1996', 'lindstrom2001', 'sillentullberg1988', 'gittleman1980'] }
  ],
  why: {
    real: ['Mimicry rings in Amazon butterflies are textbook evolution. A jacamar that tastes a bitter Heliconius avoids its look afterwards, so tasty look-alikes are spared. Selection measured in a Heliconius hybrid zone was strong (Mallet & Barton 1989).',
      'Müllerian mimics share the cost of teaching predators, so the rarer partner gains most by converging. Large-effect genes often make the first jump. In Heliconius numata, one supergene switches whole wing patterns (Joron et al. 2011).'],
    maths: ['Odds that a warning look is tasty = mimics per model, k. A retch costs C meals. Tasting pays when k × 1 > C, so the break-even is k = C. A deadlier model raises C, so protection lasts longer.',
      'Say n young birds each taste one of every look they do not know. Each look then loses about n insects. Shared by N insects, the cost per insect is n ÷ N.']
  }
};

// D6 addendum 8: the opening card (00_entry draws it); each part ≤ 35 words. Addendum 7: this chapter's own accent (Heliconius red)
BW_C.intro = {
  game: 'You are a jacamar at a rainforest edge, feeding four chicks on butterflies. Some butterflies are bitter, and a bitter mouthful costs you seconds.',
  biology: 'Tasty butterflies that look like bitter ones are spared, so the disguise spreads. It pays only while bitter models are common, and two bitter species come to share one look.',
  how: 'Tap butterflies to feed the chicks in time; a bitter one costs seconds. Once, you drag a marker to predict.'
};
const BW_ACCENT = '#E2483A';
const CH_BITTER_V2 = {
  id: 'bitter', v2: true, role: 'environment', place: 'pond', accent: BW_ACCENT, plan: ['Bitter Wings', 'Mimicry and warning colours'],   // place: the nearest deep-green ground until a 'forest' place exists (engine request)
  intro: { goal: 'Feed your chicks; watch mimicry rise, collapse and converge.' },   // (legacy goal line; the card text is BW_C.intro)
  content: BW_C,
  P: {
    quota: { v: 12, tag: 'designed', min: 6, max: 18, label: 'meals a morning' },
    time: { v: 12, tag: 'designed', min: 8, max: 20, label: 'seconds a morning' },
    retch: { v: 3, tag: 'designed', min: 1, max: 8, label: 'retch seconds (L1)' },
    gens: { v: 6, tag: 'xN', min: 4, max: 10, real: 'dozens to thousands', label: 'generations (L1)' }
  },
  levels: [
    { name: 'Bitter lessons', adds: 'a warning-coloured model', codes: ['F1', 'B1'], minutes: 3 },
    { name: 'Too many liars', adds: 'falling model numbers', codes: ['F1', 'F2'], minutes: 4 },
    { name: 'Two poisons', adds: 'a second defended species', codes: ['F4'], minutes: 4 },
    { name: 'The first warning', adds: 'clustered siblings', codes: ['F5'], minutes: 4 }
  ],
  keys: { ArrowLeft: 'move the beak', ArrowRight: 'move the beak', ArrowUp: 'move the beak', ArrowDown: 'move the beak', Space: 'peck', A: 'auto hunt', E: 'rest (untimed)', P: 'predict', Enter: 'lock in or skip' },
  untimed: true,
  teacher: { prompts: ['Why did palewings come to look bitter, though no palewing changed its own look?', 'Why does the rarer of two defended species do the moving?', 'This jacamar weighs each taste perfectly. What would a real, forgetful bird change?'], pool: 'trace' },
  // look is luminance (cream to black) plus a red band and a yellow bar; the two defended species differ in pattern (spots, band) and luminance;
  // palewings and models share a butterfly shape (Batesian), dragonflies and island bugs differ in shape
  encodings: [{ k: 'look', rgb: [120, 104, 92], channels: ['luminance', 'pattern', 'shape'] }, { k: 'cream', rgb: [242, 236, 214], channels: ['luminance', 'shape'] }, { k: 'warning', rgb: [24, 18, 20], channels: ['luminance', 'pattern', 'shape'] },
    { k: 'spots', rgb: [242, 200, 58], channels: ['pattern', 'luminance', 'shape'] }, { k: 'band', rgb: [214, 44, 38], channels: ['pattern', 'shape'] },
    { k: 'green', rgb: [96, 130, 60], channels: ['luminance', 'shape'] }, { k: 'bright', rgb: [244, 205, 80], channels: ['luminance', 'pattern', 'shape'] }],
  starTraits: ['look'],

  /* ---------- headless simulation (API_v2 §9.3): R(), Det, Gen only ---------- */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {};
      if (o.thaw) { this.restore(o.thaw.snap); const t = this.s; t.log = []; t.thawed = true; t.thawGen = t.gen; t.auto = true; this.lever(o.thaw.lever); t.th0 = this.metric(t); return; }
      const kd = BWK.KIND[level | 0] != null ? BWK.KIND[level | 0] : 0, L = BWK.LV[kd], K = BWK;
      this.s = { level, kd, gen: 1, gens: L.gens, phase: 'dawn', t: 0, unt: !!(o.untimed != null ? o.untimed : (Save.d && Save.d.ui && Save.d.ui.unt)),
        quota: L.quota || K.QUOTA, eaten: 0, fed: 0, need: 0, hungry: 0, busy: 0, stun: 0, time: K.TIME, time0: K.TIME, looks: K.LOOKS, cost: L.cost || 3,
        led: [], ins: [], hist: [], asks: [], ask: null, pred: {}, exp: {}, hit: {}, cnt: {}, nextId: 1, log: [], thawed: false, auto: false, autoT: 0, lever: null,
        bitN: 0, warnN: 0, bluff: 0, tastes: 0, eatenAll: 0, spareB: 0, brT: 0 };
      const s = this.s;
      if (kd <= 1) {
        if (kd === 1) s.cost = L.costs[(R() * L.costs.length) | 0];   // the break-even k = C moves with the retch cost
        const lay = bwLay('pale');
        for (let i = 0; i < K.N; i++) s.ins.push(this.mk('p', Gen.genome(lay, { r: { m: L.m0, s: L.s0 } })));
        s.r0 = bwMean(s.ins.map(x => x.v));
      } else if (kd === 3) {
        const lay = bwLay('two'), cb = R() < 0.5;   // which species is the commoner varies by seed, so "always the band end" is a coin toss
        s.common = cb ? 'b' : 's'; { const g = 0.36 + 0.12 * R(), c = 0.08 + g / 2 + (0.84 - g) * R(); s.base = { b: c + g / 2, s: c - g / 2 }; }   // and where the pair sits on the line (0.36–0.48 apart, never at an end)
        s.jump = Math.round(0.92 * (s.base.b - s.base.s) * 1000) / 1000;   // the large-effect allele moves a pattern most of the way to the other (modifiers refine it)
        const add = (sp, n, carriers) => { const m = s.base[sp]; for (let i = 0; i < n; i++) { const g = Gen.genome(lay, { pt: { m, s: 0.035 } }); if (i < carriers) g[lay.T.jp.off] = 1; s.ins.push(this.mk(sp, g)); } };
        add(s.common, L.common, 2); add(s.common === 'b' ? 's' : 'b', L.rare, 2);   // the jump at 2 of 48 and 2 of 16 copies (history compressed)
        s.m0 = { b: this.spMean('b'), s: this.spMean('s') };
      } else {
        const lay = bwLay('isl'); s.isl = [];
        for (let k = 0; k < 2; k++) {   // A scattered, B laid in sibling clusters (its bright founders are one brood)
          const bugs = [];
          for (let i = 0; i < L.N; i++) { const g = Gen.genome(lay, { br: { p: 0 } }); const br = i < L.n0; if (br) g[0] = 1; bugs.push({ g, br, ter: (R() * L.terr) | 0, fam: 0, st: 0 }); }
          if (k > 0) {   // B: siblings share a territory; the bright founders are siblings too
            let bs = L.n0, fam = 1;   // the mutant's first brood sits together
            const ts = bwShuffle(Array.from({ length: L.terr }, (_, q) => q), R);   // founder broods laid apart, one territory each
            for (let i = 0, q = 0; i < L.n0; i += bs, q++) { const t = ts[q % L.terr]; for (let j = i; j < Math.min(L.n0, i + bs); j++) { bugs[j].ter = t; bugs[j].fam = fam; } fam++; }
            bs = L.brood;
            for (let i = L.n0; i < L.N; i += bs) { const t = (R() * L.terr) | 0; for (let j = i; j < Math.min(L.N, i + bs); j++) { bugs[j].ter = t; bugs[j].fam = fam; } fam++; }
          }
          s.isl.push({ bugs, hist: [this.share(bugs)], spare: 0 });
        }
        this.islIns();
      }
      this.dawn();
      if (o.lever) this.lever(o.lever);
    },
    mk(k, g) {
      const s = this.s, x = { id: s.nextId++, k, g: g || null, v: 0, st: 0, x: 0, y: 0, a: 0 };
      if (k === 'p') x.v = Gen.ph(bwLay('pale'), g, 'r');
      else if (k === 'b' || k === 's') { const lay = bwLay('two'), j = Gen.dom(lay, g, 'jp'); x.v = clamp(Gen.ph(lay, g, 'pt') + (j ? (k === 's' ? 1 : -1) * (s.jump || BWK.LV[3].jump) : 0), 0, 1); }
      else if (k === 'm') x.v = 0.96 + 0.04 * R();
      return x;
    },
    share(bugs) { let b = 0; for (const x of bugs) if (x.br) b++; return bugs.length ? b / bugs.length : 0; },
    spMean(sp, list) { return bwMean((list || this.s.ins).filter(x => x.k === sp && x.st !== 1 && x.st !== 3).map(x => x.v)); },
    islIns() {   // the boss: the leaf shows islands A and B; bug ids stay stable through the morning
      const s = this.s, L = BWK.LV[4]; s.ins = [];
      for (let k = 0; k < 2; k++) s.isl[k].bugs.forEach((b, j) => { const x = this.mk('g', null); x.br = b.br; x.v = b.br ? 1 : 0; x.isl = k; x.j = j; x.ter = b.ter; x.fam = b.fam; s.ins.push(x); });
      for (let k = 0; k < 2; k++) for (let i = 0; i < L.grubs; i++) { const x = this.mk('u', null); x.isl = k; x.ter = (R() * L.terr) | 0; s.ins.push(x); }
    },
    /* the day: models, costs, placement */
    dawn() {
      const s = this.s, n = s.kd, L = BWK.LV[n], K = BWK;
      s.led = s.led.filter(t => s.gen - t.g < 4);   // tiles fade over two mornings; a dashed tile is dropped at age 4
      if (n <= 1) {
        s.ins = s.ins.filter(x => x.k === 'p');
        let m = n === 0 ? (s.noModels ? 0 : L.models[0]) : (s.manyModels ? 12 : L.models[Math.min(s.gen - 1, L.models.length - 1)]);
        for (let i = 0; i < m; i++) s.ins.push(this.mk('m', null));
        for (let i = 0; i < (L.grubs || 0); i++) s.ins.push(this.mk('u', null));   // grubs: safe food from L2 on, so a skipped warning look is not a lost meal
        if (n === 1 && s.cheap) s.cost = 1;
        s.models = m;
      } else if (n === 3) { s.ins = s.ins.filter(x => x.k !== 'u'); for (let i = 0; i < L.grubs; i++) s.ins.push(this.mk('u', null)); }
      for (const x of s.ins) x.st = 0;
      this.place();
      s.eaten = 0; s.pen = 0; s.busy = 0; s.stun = 0; s.time = s.time0; s.looks = K.LOOKS; s.mBit = 0; s.mWarn = 0; s.mTaste = 0;
      const pale = s.ins.filter(x => x.k === 'p'), warn = pale.filter(x => x.v >= K.WARN).length;
      const rec = { gen: s.gen, models: s.models || 0, cost: s.cost, k: s.models ? warn / s.models : null, warn,
        mean: pale.length ? bwMean(pale.map(x => x.v)) : null, vals: pale.map(x => Math.round(x.v * 1000) / 1000), adv: null, dusk: null };
      if (n === 3) { rec.mb = this.spMean('b'); rec.ms = this.spMean('s'); }
      if (n === 4) rec.sh = s.isl.map(I => I.hist[I.hist.length - 1]);
      s.hist.push(rec); s.phase = 'dawn'; s.t = 0;
    },
    place() {   // positions in the fixed virtual 390 × 540 stage; L5 places by island and territory (siblings sit together)
      const s = this.s, B = BWK.BOX, pts = [];
      const spot = (x0, x1, y0, y1, minD, near) => {
        let best = null, bd = -1;
        for (let t = 0; t < 30; t++) {
          const p = near ? [clamp(near[0] + (R() - 0.5) * 46, x0, x1), clamp(near[1] + (R() - 0.5) * 34, y0, y1)] : [x0 + R() * (x1 - x0), y0 + R() * (y1 - y0)]; let dm = 1e9;
          for (const q of pts) { const dx = q[0] - p[0], dy = q[1] - p[1], d = dx * dx + dy * dy; if (d < dm) dm = d; }
          if (dm > minD * minD) { best = p; break; } if (dm > bd) { bd = dm; best = p; }
        }
        pts.push(best); return best;
      };
      if (s.kd < 4) {
        const n = s.ins.length, minD = Math.min(42, Math.sqrt((B.x1 - B.x0) * (B.y1 - B.y0) / n) * 0.66);
        for (const x of s.ins) { const p = spot(B.x0, B.x1, B.y0, B.y1, minD); x.x = p[0]; x.y = p[1]; x.a = (R() - 0.5) * 0.9; }
        return;
      }
      const cols = 4, cw = (B.x1 - B.x0) / cols, fams = {};
      for (const x of s.ins) {
        const I = BWK.ISL[x.isl], ch = (I.y1 - I.y0) / 2, cx = x.ter % cols, cy = Math.floor(x.ter / cols) % 2;
        const x0 = B.x0 + cx * cw + 6, x1 = x0 + cw - 12, y0 = I.y0 + cy * ch + 6, y1 = y0 + ch - 12, key = x.isl + ':' + x.fam;
        const near = x.k === 'g' && x.fam && x.isl === 1 ? fams[key] : null;
        const p = spot(x0, x1, y0, y1, near ? 17 : 22, near); if (x.k === 'g' && x.fam && x.isl === 1 && !fams[key]) fams[key] = p;
        x.x = p[0]; x.y = p[1]; x.a = (R() - 0.5) * 0.9;
      }
    },
    lever(k) {
      const s = this.s; s.lever = k || null; if (!k) return;
      if (k === 'nomodels') s.noModels = true;
      if (k === 'noinherit') s.noinherit = true;
      if (k === 'manymodels') s.manyModels = true;
      if (k === 'cheap') s.cheap = true;
      if (k === 'nojump' || k === 'inside') {
        const lay = bwLay('two'), o = lay.T.jp.off, rare = s.common === 'b' ? 's' : 'b', cm = bwMean(s.ins.filter(x => x.k === s.common).map(x => Gen.add(lay, x.g, 'pt')));   // the commoner's look without the jump
        for (const x of s.ins) if (x.g && (x.k === 'b' || x.k === 's')) {
          x.g[o] = 0; x.g[lay.L + o] = 0;
          if (k === 'inside' && x.k === rare) { const d = (cm + (rare === 's' ? -0.09 : 0.09)) - Gen.add(lay, x.g, 'pt'), pt = lay.T.pt; for (let i = 0; i < pt.n; i++) { x.g[pt.off + i] += d / (2 * pt.n); x.g[lay.L + pt.off + i] += d / (2 * pt.n); } }
          x.v = clamp(Gen.add(lay, x.g, 'pt'), 0, 1);
        }
      }
      if (k === 'scatterB') s.scatterB = true;
      if (k === 'clusterA') s.clusterA = true;
      if (s.kd <= 3 && s.phase === 'dawn') { s.hist.pop(); this.dawn(); }   // re-read the frozen dawn under the new rule
    },
    /* the morning */
    step(dt) {
      const s = this.s, K = BWK, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; const fast = s.thawed;
      if (s.phase === 'dawn') { if (s.t >= (fast ? 0.4 : K.T.dawn)) this.toHunt(ev); }
      else if (s.phase === 'hunt') {
        if (s.busy > 0) { s.busy = Math.max(0, s.busy - dt); if (s.busy === 0 && s.stun) { s.stun = 0; ev.push({ k: 'unstun' }); } }
        if (!s.unt) s.time -= dt;
        if (s.auto && s.busy <= 0) { s.autoT += dt; if (s.autoT >= (fast ? K.T.autoF : K.T.autoDt)) { s.autoT = 0; const i = this.autoPick(); if (i >= 0) this.eat(i, ev); else if (s.unt || fast) { this.endMorning(ev); return ev; } } }   // nothing worth eating: the auto bird rests
        const left = s.ins.some(x => !x.st && (x.k === 'p' || x.k === 'u'));
        if (s.time <= 0 || s.eaten >= s.quota || (s.unt && s.looks <= 0) || !left) this.endMorning(ev);
      }
      else if (s.phase === 'dusk') { if (s.t >= (fast ? K.T.duskF : K.T.dusk)) this.afterDusk(ev); }
      else if (s.phase === 'ask') { if (!s.unt && s.t >= K.T.askMax) this.commit(s.ask.id, null, ev); }
      else if (s.phase === 'post') { if (s.t >= (fast ? 0.2 : K.T.post)) this.breedOrEnd(ev); }
      return ev;
    },
    toHunt(ev) { const s = this.s; s.phase = 'hunt'; s.t = 0; s.autoT = 0; ev.push({ k: 'hunt', gen: s.gen }); },
    weights() { const s = this.s, w = { b: 0, t: 0 }; for (const t of s.led) { const f = BWK.FADE[Math.min(3, s.gen - t.g)] || 0; if (t.b) w.b += f; else w.t += f; } return w; },
    inHalo(v) { const s = this.s; return s.led.some(t => t.b && (BWK.FADE[Math.min(3, s.gen - t.g)] || 0) > 0 && Math.abs(t.v - v) <= BWK.HALO); },
    eat(i, ev) {
      const s = this.s, x = s.ins[i], K = BWK; if (!x || x.st) return;
      const bitter = x.k === 'm' || x.k === 'b' || x.k === 's' || x.k === 'g', warnLook = x.k !== 'u' && (x.k !== 'p' || x.v >= K.WARN);
      if (bitter) {
        x.st = s.kd <= 1 ? 2 : 1;   // a model staggers off alive; from Two poisons on, tasting kills (D1)
        if (x.k === 'g' && x.br) s.brT++;   // the boss: bright bugs you tasted (a learning bird needs one)
        const c = s.cost, stun = Math.min(1, c * 0.4); s.busy = stun; s.stun = 1;
        if (s.unt) s.looks -= c; else s.time -= c - stun;
        s.bitN++; s.mBit++; s.tastes++; s.mTaste++;
        const cue = this.ledger(x, 1);
        ev.push({ k: 'bitter', i, x: x.x, y: x.y, cost: c, kills: s.kd >= 3 }); if (cue) ev.push({ k: cue });
      } else {
        x.st = 1; s.eaten++; s.eatenAll++; s.busy = K.T.handle; if (s.unt) s.looks -= 1;
        if (x.k === 'p' && warnLook) {
          s.warnN++; s.mWarn++; s.tastes++; s.mTaste++;
          if (s.kd === 1 && s.hist[s.hist.length - 1].k > s.cost) s.bluff++;
          const cue = this.ledger(x, 0); if (cue) ev.push({ k: cue });
        }
        ev.push({ k: 'eat', i, x: x.x, y: x.y, chick: (s.eaten - 1) % K.CHICKS, n: s.eaten, warn: warnLook && x.k === 'p' });
        if (s.eaten === s.quota) ev.push({ k: 'fed' });
      }
    },
    ledger(x, b) {
      const s = this.s, w0 = this.weights();
      s.led.push({ v: Math.round(x.v * 1000) / 1000, b, g: s.gen, k: x.k, br: x.br ? 1 : 0 }); while (s.led.length > BWK.MAXLED) s.led.shift();
      const w1 = this.weights();
      if (s.kd <= 1 && w0.b < 2.5 && w1.b >= 2.5) return 'ring';           // memory holds about three bitter tastes: the avoid-ring appears
      if (s.kd <= 1 && w1.b >= 2.5 && w0.t <= w0.b && w1.t > w1.b) return 'crack';   // tasty tastes now outnumber bitter: the ring cracks
      return null;
    },
    // the auto bird (What if? reruns and the Auto button): cream first; a warning look only when the ledger's odds beat the retch cost
    autoPick() {
      const s = this.s, K = BWK, alive = []; s.ins.forEach((x, i) => { if (!x.st) alive.push(i); }); if (!alive.length) return -1;
      if (s.kd >= 3) {   // grubs are food; warning insects only to keep learning (one taste of a look you have no memory of), and only when no grub is left
        const g = alive.filter(i => s.ins[i].k === 'u'); if (g.length) return g[0];
        const un = alive.filter(i => !this.inHalo(s.ins[i].v)); return un.length && s.mTaste < 2 ? un[0] : -1;
      }
      const cream = alive.filter(i => s.ins[i].k === 'u' || (s.ins[i].k === 'p' && s.ins[i].v < K.WARN)).sort((a, b) => s.ins[a].v - s.ins[b].v);
      const w = this.weights(), odds = (w.t + 1) / (w.b + 1), worth = odds > s.cost;
      const warn = alive.filter(i => s.ins[i].k === 'm' || s.ins[i].v >= K.WARN).sort((a, b) => s.ins[b].v - s.ins[a].v);   // warning colours are the easiest to spot
      if (worth && warn.length) return warn[0];
      if (cream.length) return cream[0];
      if (warn.length && w.b + w.t < 3 && s.mTaste < 3) return warn[warn.length - 1];   // little memory: taste to learn
      return -1;
    },
    endMorning(ev) {
      const s = this.s, n = s.kd, K = BWK, rec = s.hist[s.hist.length - 1];
      const got = Math.min(s.eaten, s.quota);
      s.fed += got; s.need += s.quota; s.hungry = Math.ceil((s.quota - got) / (s.quota / K.CHICKS) - 1e-9);
      const d = { eaten: s.eaten, bit: s.mBit, warn: s.mWarn, got };
      if (n <= 1) {   // the mimics' edge today: survival of the better-looking half minus the poorer half
        const pale = s.ins.filter(x => x.k === 'p'), vs = pale.map(x => x.v).sort((a, b) => a - b), med = vs.length ? vs[vs.length >> 1] : 0.5;
        let gn = 0, gs = 0, pn = 0, ps = 0; for (const x of pale) { if (x.v >= med) { gn++; if (!x.st) gs++; } else { pn++; if (!x.st) ps++; } }
        rec.adv = (gn ? gs / gn : 0) - (pn ? ps / pn : 0);
        const sv = pale.filter(x => !x.st); d.mean = sv.length ? bwMean(sv.map(x => x.v)) : rec.mean; d.vals = pale.map(x => x.st ? -1 : 1);
      } else if (n === 3) {
        const yb = this.young4(); d.yk = yb.kill.length; d.ys = yb.spare; d.order = yb.kill; d.mouth = s.mBit + yb.kill.length;
        d.kb = yb.kill.filter(i => s.ins[i].k === 'b').length; d.ks = yb.kill.length - d.kb;   // the key number: each species loses about the same count, so the rarer loses a bigger share
      } else {
        d.y = []; for (let k = 0; k < 2; k++) {
          const I = s.isl[k]; s.ins.forEach(x => { if (x.isl === k && x.k === 'g' && x.st === 1) I.bugs[x.j].st = 1; });
          const r = bwYoung5(I.bugs, BWK.LV[4].terr, BWK.LV[4].dB, BWK.LV[4].dG, R); I.spare += r.spare.length; if (k === 1) s.spareB += r.spare.length;
          const idx = j => s.ins.findIndex(x => x.isl === k && x.j === j); d.y.push({ kill: r.kill.map(idx), spare: r.spare.map(idx) }); for (const j of r.kill) { const q = idx(j); if (q >= 0) s.ins[q].st = 3; }
        }
      }
      rec.dusk = d; s.phase = 'dusk'; s.t = 0; s.auto = s.thawed ? true : s.auto;
      ev.push({ k: 'dusk', hungry: s.hungry, eaten: s.eaten, got });
    },
    young4() {   // L4: four young birds; each tastes the first of every look it has not learned (within ±HALO), and spares the rest
      const s = this.s, L = BWK.LV[3], kill = []; let spare = 0;
      for (let b = 0; b < L.young; b++) {
        const mem = [], ord = []; s.ins.forEach((x, i) => { if (!x.st && (x.k === 'b' || x.k === 's')) ord.push(i); }); bwShuffle(ord, R);
        for (const i of ord) {   // generalisation fades with distance from a look already tasted: spared with chance e^(−(d/w)²)
          const x = s.ins[i]; if (R() > L.enc) continue;
          let g = 0; for (const v of mem) { const d = (v - x.v) / L.gw, e = Det.exp(-d * d); if (e > g) g = e; }
          if (g > 0.01 && R() < g) { spare++; continue; } x.st = 3; kill.push(i); mem.push(x.v);
        }
      }
      return { kill, spare };
    },
    afterDusk(ev) {
      const s = this.s, id = BWK.LV[s.kd].ask[s.gen];   // only Two poisons asks (once, after its first dusk)
      if (id && !s.thawed && !s.pred.hasOwnProperty(id)) {
        const ax = BWK.AXIS[id]; s.ask = { id, kind: 'y', lo: ax[0], hi: ax[1], tol: BWK.TOL[id], gen: s.gen };
        s.asks.push(id); s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id }); return;
      }
      s.phase = 'post'; s.t = 0;
    },
    commit(id, v, ev) {
      const s = this.s, A = s.ask; if (!A || A.id !== id) return;
      const e = this.expect(id), cur = this.current(id);
      s.pred[id] = v == null ? null : +v; s.exp[id] = e;
      s.cnt[id] = Math.abs(e - cur) > A.tol;   // counts only when "meet halfway" (the misconception, shown at the ask) would miss
      s.hit[id] = v != null && Math.abs(+v - e) <= A.tol + 1e-9;
      s.ask = null; s.phase = 'post'; s.t = 0;
      ev.push({ k: 'pred', id, hit: s.hit[id], exp: e, tol: A.tol, counted: s.cnt[id] });
    },
    current(id) {   // "no change": the value the player can read off the screen at the ask
      const s = this.s, r = s.hist[s.hist.length - 1];
      return (r.mb + r.ms) / 2;   // p4: "meet halfway"
    },
    /* the expectation for an ask (D1 G10): from the model at the parameters in force, never the realised run */
    expect(id) {
      const s = this.s;
      const v = s.ins.filter(x => x.k === s.common && !x.st).map(x => x.v).sort((a, b) => a - b); return v.length ? v[v.length >> 1] : 0.5;   // p4: the rarer converges on the commoner's typical look
    },
    breed5(bugs, brood, clustered, rnd) {   // broods of `brood` eggs from random survivor pairs; clustered broods share a territory
      const L = BWK.LV[4], sv = bugs.filter(b => !b.st), par = sv.length >= 2 ? sv : bugs, out = []; let fam = 2;
      while (out.length < L.N) {
        const a = par[(rnd() * par.length) | 0]; let b = par[(rnd() * par.length) | 0]; for (let t = 0; t < 6 && b === a; t++) b = par[(rnd() * par.length) | 0];
        const t0 = (rnd() * L.terr) | 0;
        for (let k = 0; k < brood && out.length < L.N; k++) { const g = [a.g[rnd() < 0.5 ? 0 : 1], b.g[rnd() < 0.5 ? 0 : 1]]; out.push({ g, br: g[0] > 0.5 || g[1] > 0.5, ter: clustered ? t0 : (rnd() * L.terr) | 0, fam: clustered ? fam : 0, st: 0 }); }
        fam++;
      }
      return out;
    },
    breedOrEnd(ev) {
      const s = this.s;
      if (s.gen >= s.gens) { s.phase = 'over'; s.t = 0; ev.push({ k: 'over' }); return; }
      this.breed(ev);
    },
    breed(ev) {
      const s = this.s, n = s.kd, K = BWK;
      const pick = par => { const a = par[(R() * par.length) | 0]; let b = par[(R() * par.length) | 0]; for (let t = 0; t < 6 && b === a; t++) b = par[(R() * par.length) | 0]; return [a, b]; };
      if (n <= 1) {
        const lay = bwLay('pale'), L = BWK.LV[n], pale = s.ins.filter(x => x.k === 'p'), sv = pale.filter(x => !x.st), par = sv.length >= 2 ? sv : pale, kids = [];
        for (let i = 0; i < K.N; i++) { const [a, b] = pick(par); kids.push(this.mk('p', s.noinherit ? Gen.genome(lay, { r: { m: L.m0, s: L.s0 } }) : Gen.mate(lay, a.g, b.g))); }
        s.ins = kids;
      } else if (n === 3) {
        const lay = bwLay('two'), L = BWK.LV[3], kids = [];
        for (const sp of ['b', 's']) {
          const all = s.ins.filter(x => x.k === sp), sv = all.filter(x => !x.st), par = sv.length >= 2 ? sv : all, N = sp === s.common ? L.common : L.rare;
          for (let i = 0; i < N; i++) { const [a, b] = pick(par); kids.push(this.mk(sp, Gen.mate(lay, a.g, b.g))); }
        }
        s.ins = kids;
      } else {
        for (let k = 0; k < 2; k++) {
          const I = s.isl[k], clustered = k === 0 ? !!s.clusterA : !s.scatterB;
          I.bugs = this.breed5(I.bugs, BWK.LV[4].brood, clustered, R); I.hist.push(this.share(I.bugs));
        }
        this.islIns();
      }
      s.gen++; this.dawn();
      ev.push({ k: 'bred', gen: s.gen });
    },
    act(a) {
      const s = this.s, ev = []; if (!a || !s) return ev;
      if (a.k === 'tap') {
        if (s.phase === 'dawn') this.toHunt(ev);
        if (s.phase !== 'hunt') return ev;
        if (s.busy > 0) { ev.push({ k: 'busy', stun: !!s.stun }); return ev; }
        const i = a.i | 0, x = s.ins[i];
        if (i >= 0 && x && !x.st) this.eat(i, ev);
        else { if (s.unt) s.looks -= 1; else s.time -= BWK.T.miss; ev.push({ k: 'miss' }); }
      } else if (a.k === 'skip') { if (s.phase === 'dusk') s.t = 99; else if (s.phase === 'dawn') this.toHunt(ev); }
      else if (a.k === 'rest' && s.phase === 'hunt' && s.unt) this.endMorning(ev);   // untimed: the bird can end its morning (nothing else would)
      else if (a.k === 'auto') { s.auto = !!a.on && (s.phase === 'hunt' || s.phase === 'dawn'); s.autoT = 0; if (s.auto && s.phase === 'dawn') this.toHunt(ev); ev.push({ k: 'auto', on: s.auto }); }
      else if (a.k === 'predict' && s.ask && a.id === s.ask.id) this.commit(a.id, a.v, ev);
      else if (a.k === 'void' && s.ask && a.id === s.ask.id) this.commit(a.id, null, ev);
      else if (a.k === 'unt' && s.gen === 1 && s.phase === 'dawn' && !s.thawed) { s.unt = !!a.on; }
      return ev;
    },

    /* ---------- contract ---------- */
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_BITTER_V2.stars, n = s.kd;
      const mask = s.thawed ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: this.outcome(s), interesting: this.why(s) };
    },
    outcome(s) {
      const n = s.kd, H = s.hist, a = H[0], z = H[H.length - 1];
      if (n === 0) return { r0: a.mean, r1: z.mean, fed: bwFed(s) };
      if (n === 3) { const rare = s.common === 'b' ? 's' : 'b', f = r => r['m' + rare], g = r => r['m' + s.common]; return { rare: Math.abs(f(z) - f(a)), common: Math.abs(g(z) - g(a)), fed: bwFed(s) }; }
      if (n === 4) return { A: s.isl[0].hist.slice(), B: s.isl[1].hist.slice(), fed: bwFed(s), brT: s.brT };
      return { fed: bwFed(s), bluff: s.bluff };
    },
    why(s) {   // the Interesting result, chosen from what happened in this run
      const n = s.kd, st = CH_BITTER_V2.stars, o = this.outcome(s);
      if (s.thawed && s.lever) return this.whatIfText(s);
      if (st.discover(s, n)) return n === 4 && o.A[o.A.length - 1] >= o.A[0] ? 'a_kept' : n === 4 && s.brT !== 1 ? 'nolearn5' : null;
      if (n === 0) return s.eatenAll < 3 * Math.max(1, s.gen) ? 'flat_idle' : (o.r1 - o.r0 < 0.15 ? 'flat' : 'short1');
      if (n === 1) return bwFed(s) < 0.6 ? 'short2' : s.bluff < 2 ? 'nobluff' : null;
      if (n === 3) return bwFed(s) < 0.6 ? 'short4' : (this.jumpLost() ? 'lost4' : (o.common * 3 > o.rare ? 'both4' : null));
      return bwFed(s) < 0.6 ? 'short5' : (o.B[o.B.length - 1] <= 0 ? 'b_lost' : null);
    },
    metric(s) {   // the number a What if? text is checked against: the frozen value at the thaw, then the end of the rerun
      const H = s.hist, z = H[H.length - 1], n = s.kd, after = H.filter(r => r.gen >= (s.thawGen || 1) && r.adv != null).map(r => r.adv);
      if (n === 0) return z.mean; if (n <= 1) return after.length ? bwMean(after) : null;
      if (n === 3) { const rare = s.common === 'b' ? 'ms' : 'mb'; return z[rare]; }
      return { A: s.isl[0].hist[s.isl[0].hist.length - 1], B: s.isl[1].hist[s.isl[1].hist.length - 1] };
    },
    whatIfText(s) {   // a What if? text only when this rerun went the way it says (lessons §1.5); otherwise an honest "chance" line
      const k = s.lever, a = s.th0, z = this.metric(s), rare = s.common === 'b' ? 's' : 'b';
      if (k === 'clusterA' && a && a.A <= 0) return 'w_gone';
      const ok = { nomodels: () => z - a < 0.05, noinherit: () => z - a < 0.05, manymodels: () => z != null && z > 0.1, cheap: () => z != null && z < 0.15,
        nojump: () => Math.abs(z - a) < 0.1,
        inside: () => (rare === 's' ? z - a : a - z) >= 0.03, scatterB: () => z.B <= a.B, clusterA: () => z.A >= a.A }[k];
      return ok && ok() ? 'w_' + k : 'w_chance';
    },
    jumpLost() { const s = this.s, lay = bwLay('two'), rare = s.common === 'b' ? 's' : 'b'; return !s.ins.some(x => x.k === rare && x.st !== 1 && x.st !== 3 && Gen.dom(lay, x.g, 'jp')); },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) { const A = s.ask, st = BWK.STEP[A.id]; for (let v = A.lo; v <= A.hi + 1e-9; v += st) out.push({ k: 'predict', id: A.id, v: Math.round(v * 1000) / 1000 }); return out; }
      if (s.phase === 'hunt' || s.phase === 'dawn') { s.ins.forEach((x, i) => { if (!x.st) out.push({ k: 'tap', i }); }); out.push({ k: 'tap', i: -1 }); if (s.unt && s.phase === 'hunt') out.push({ k: 'rest' }); }
      if (s.phase === 'dusk') out.push({ k: 'skip' });
      return out;
    },
    bots: {   // (s, acts, rnd, ticks) → action | null; 'random' is generic. Hunting bots peck about once every 0.6 s, as a person does
      alwaysA(s, acts, rnd, tk) { const p = acts.find(a => a.k === 'predict'); if (p) return p; if ((tk | 0) % 18) return null; return acts.find(a => a.k === 'tap' && a.i >= 0) || acts[0] || null; },
      alwaysB(s, acts, rnd, tk) { const p = acts.filter(a => a.k === 'predict'); if (p.length) return p[p.length - 1]; if ((tk | 0) % 18) return null; const t = acts.filter(a => a.k === 'tap' && a.i >= 0); return t.length ? t[t.length - 1] : acts[acts.length - 1] || null; },
      greedy(s, acts, rnd, tk) {   // eats the safest-looking insect it can see; predicts "no change" (what the screen shows now)
        const sim = CH_BITTER_V2.sim;
        if (s.ask) { const v = sim.current(s.ask.id); return acts.reduce((b, a) => !b || Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b, null); }
        if ((tk | 0) % 18) return null;
        const t = acts.filter(a => a.k === 'tap' && a.i >= 0); if (!t.length) return null;
        const score = x => x.k === 'u' ? -1 : x.k === 'm' ? 1 : x.k === 'g' ? (x.br ? 2 : 1.5) : x.v;
        return t.reduce((b, a) => !b || score(s.ins[a.i]) < score(s.ins[b.i]) ? a : b, null);
      },
      threshold(s, acts, rnd, tk) {   // eats only pale-looking insects and grubs; predicts the middle of every axis
        if (s.ask) { const m = (s.ask.lo + s.ask.hi) / 2; return acts.reduce((b, a) => !b || Math.abs(a.v - m) < Math.abs(b.v - m) ? a : b, null); }
        if ((tk | 0) % 18) return null;
        return acts.find(a => a.k === 'tap' && a.i >= 0 && (s.ins[a.i].k === 'u' || (s.ins[a.i].k === 'p' && s.ins[a.i].v < 0.5))) || acts.find(a => a.k === 'rest') || null;
      },
      bayes(s, acts, rnd, tk) {   // the auto bird's rule, at a person's pace; predicts the middle of every axis
        if (s.ask) return CH_BITTER_V2.sim.bots.threshold(s, acts, rnd, tk);
        if ((tk | 0) % 18) return null; const i = CH_BITTER_V2.sim.autoPick(); return i >= 0 ? { k: 'tap', i } : acts.find(a => a.k === 'rest') || null;
      },
      copynow(s, acts, rnd, tk) { return CH_BITTER_V2.sim.bots.greedy(s, acts, rnd, tk); },
      edge(s, acts, rnd, tk) {   // predicts a fixed number (the band end, 0.8) and hunts like the Bayesian bird
        if (s.ask) return acts.reduce((b, a) => !b || Math.abs(a.v - 0.8) < Math.abs(b.v - 0.8) ? a : b, null);
        return CH_BITTER_V2.sim.bots.bayes(s, acts, rnd, tk);
      },
      learner(s, acts, rnd, tk) {   // the boss's Transfer path: taste one bright bug (on island A), then spare bright bugs; otherwise the Bayesian bird
        if (s.kd === 4 && !s.ask && !((tk | 0) % 18) && s.brT === 0 && s.phase === 'hunt') { const a = acts.find(x => x.k === 'tap' && x.i >= 0 && s.ins[x.i].k === 'g' && s.ins[x.i].br && s.ins[x.i].isl === 0) || acts.find(x => x.k === 'tap' && x.i >= 0 && s.ins[x.i].k === 'g' && s.ins[x.i].br); if (a) return a; }
        if (s.kd === 4 && !s.ask) { if ((tk | 0) % 18) return null; const g = acts.find(x => x.k === 'tap' && x.i >= 0 && s.ins[x.i].k === 'u'); return g || acts.find(a => a.k === 'rest') || null; }
        return CH_BITTER_V2.sim.bots.bayes(s, acts, rnd, tk);
      }
    }
  },

  /* ---------- stars: pure functions of the final state, scored against expectations (D1 G10) ---------- */
  stars: {
    discover: (s, n) => {
      const f = bwFed(s), H = s.hist;
      if (n === 0) return f >= 0.6 && H[H.length - 1].mean - H[0].mean >= 0.15;
      if (n === 1) return f >= 0.6 && s.bluff >= 2;
      if (n === 3) { const o = CH_BITTER_V2.sim.outcome(s), gap = s.base ? s.base.b - s.base.s : 0.6; return f >= 0.6 && o.rare >= 0.25 * gap && o.rare >= 3 * o.common; }   // the rarer crossed a quarter of the gap
      const A = s.isl[0].hist; return f >= 0.6 && s.spareB >= 3 && A[A.length - 1] < A[0];
    },
    predict: (s, n) => { const id = BWK.PRED[n]; return !!id && !!s.hit[id] && !!s.cnt[id]; },
    // the boss's Transfer: act as the young birds do. Taste exactly one bright bug, spare the rest, and bright ends commoner on clustered B than on scattered A
    transfer: (s, n) => { if (n !== 4) return false; const A = s.isl[0].hist, B = s.isl[1].hist; return bwFed(s) >= 0.6 && s.brT === 1 && B[B.length - 1] > A[A.length - 1]; }
  },
  // unit stars (by level number; D6 decision 9: four levels): Discover = the bluff called (L2); Predict = the meeting point (L3, the one prediction); Transfer = the boss
  unitStars(lv) { const m = i => (lv && lv[i]) | 0; return (m(1) & 1 ? 1 : 0) | (m(2) & 2 ? 2 : 0) | (m(3) & 4 ? 4 : 0); },

  /* ---------- teacher hook: a 30-bit result code (?unit=bitter&seed=…) ----------
     bits 0–2 level number, 3–5 star mask, 6–12 meals fed %, 13–19 the level's key number ×100 (L1 mean look, L2 bluffs ×10,
     L3 rarer shift, L4 island B share), 20–26 the prediction ×100 (L3 only), 27–29 the retch cost in whole seconds (L1–L2) or bright tastes (L4) */
  resultBits(s, level) {
    if (!s) return 0; const n = s.kd, lv = level == null ? s.level : level, r = this.sim.result(), mask = r ? r.mask & 7 : 0, pc = x => clamp(Math.round(100 * (+x || 0)), 0, 127);
    const H = s.hist || [], z = H[H.length - 1] || {}, o = r ? r.outcome : {};
    const key = n === 0 ? z.mean : n === 1 ? s.bluff / 10 : n === 3 ? o.rare : (o.B ? o.B[o.B.length - 1] : 0);
    const pv = s.pred && s.pred.p4 != null ? s.pred.p4 : 0;
    return ((lv & 7) | (mask << 3) | (pc(bwFed(s)) << 6) | (pc(key) << 13) | (pc(pv) << 20) | ((clamp(Math.round(n === 4 ? s.brT : s.cost), 0, 7) & 7) << 27)) >>> 0;
  },

  /* ---------- view ---------- */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._endT = 0; this._asked = null; this._dockSig = null; this._hudT = null; this._hudN = null; this._g = null;
    Sim.start(this, n, o);
    // the untimed setting enters the run as a logged action, so a replay plays the same mornings on any machine (lessons §1.6)
    if (!o.thaw && !o.replay) Sim.act(this, { k: 'unt', on: !!(Save.d && Save.d.ui && Save.d.ui.unt) });
    this.v = { t: 0, peck: {}, gone: {}, kill: {}, flinch: 0, chickPop: [0, 0, 0, 0], born: 0, title: 1, lastTap: null, cursor: null, retch: null, chunk: null,
      dusk: null, flip: -1, flipT: 1, tastyM: -1, idle: 0, askT0: 0, glow: 0, jac: null };
    this._led = typeof Ledger !== 'undefined' ? Ledger.create({ n: BWK.MAXLED }) : null;
    this.dock(); this.hud(true);
    if (typeof Ghost !== 'undefined') this.ghost = Ghost.show({ verb: 'tap', at: () => this.ghostAt(), until: () => { const s = this.sim.s; return s.eatenAll > 0 || s.tastes > 0 || (s.phase !== 'hunt' && s.phase !== 'dawn'); } });
    if (typeof Live !== 'undefined') Live.say(this.levels[n].name + '. ' + this.introLine());
    if (typeof Fx !== 'undefined') Fx.tier(3, () => { });
  },
  w(group, key, vars) { const s = (this.content[group] || {})[key]; return s == null ? '' : typeof Txt !== 'undefined' ? Txt.f(s, vars || {}) : String(s).replace(/\{(\w+)\}/g, (m, k) => vars && vars[k] != null ? vars[k] : m); },
  whisper(key, vars) { if (typeof Whisper !== 'undefined') Whisper.say(this.w('whispers', key, vars), 'bw-' + key); },
  introLine() { const C = this.content; return [C.firstWords, C.hud.l2, C.hud.l4, C.hud.l5][this.level] || C.firstWords; },
  kd() { return BWK.KIND[this.level | 0] != null ? BWK.KIND[this.level | 0] : 0; },
  kcLine(s) {   // L2's key number, plainly: k mimics per model against C, the retch cost in meals
    const r = s.hist[s.hist.length - 1] || {}, k = r.k != null ? Math.round(r.k * 10) / 10 : 0;
    return this.w('hud', 'kc', { k, c: this.fmtC(s.cost), v: this.w('hud', k > s.cost ? 'pays' : 'spare') });
  },
  duskLine(s) {   // the dusk's key number for each kind of level
    const C = this.content.hud, r = s.hist[s.hist.length - 1] || {}, d = r.dusk || {};
    if (s.kd === 0) return d.mean != null ? this.w('hud', 'dusk1', { m: Math.round(100 * d.mean) }) : C.dusk;
    if (s.kd === 3) { const L = BWK.LV[3], nb = s.common === 'b' ? L.common : L.rare, ns = s.common === 's' ? L.common : L.rare; return this.w('hud', 'dusk4', { kb: d.kb | 0, nb, ks: d.ks | 0, ns }); }
    if (s.kd === 4) { const sh = k => Math.round(100 * s.isl[k].hist[s.isl[k].hist.length - 1]); return this.w('hud', 'dusk5', { a: sh(0), b: sh(1) }); }
    return C.dusk;
  },
  px(x, y) { return [x / 390 * Stage.w, y / 540 * Stage.h]; },
  size() { return Math.max(34, Math.min(64, 0.1 * Math.min(Stage.w, 1.2 * Stage.h))); },   // actors ≥ 0.07u (D4 §3); a butterfly's wingspan
  hudH() { return Math.max(56, this._hudPx || 0, (Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 0); },
  fmtC(c) { return (Math.round(c * 10) / 10).toString(); },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, b = [], key = typeof Fx !== 'undefined' && Fx.lastInput === 'key';
    if (s.ask) b.push({ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } });
    else if (s.phase === 'dusk') b.push({ id: 'skip', label: L.skip, key: 'Enter', fn: () => Sim.act(this, { k: 'skip' }) });
    else {
      if (s.unt && s.phase === 'hunt') b.push({ id: 'rest', label: L.rest, key: 'E', aria: 'End this morning', fn: () => Sim.act(this, { k: 'rest' }) });
      if (s.unt || s.auto || s.thawed || key || (s.kd >= 3 && s.asks.length)) {   // the non-visual path, and the fast watch after a level's prediction
        b.push({ id: 'auto', label: L.auto, key: 'A', pressed: !!s.auto, aria: 'Let the bird hunt by itself', disabled: !(s.phase === 'hunt' || s.phase === 'dawn'), fn: () => Sim.act(this, { k: 'auto', on: !s.auto }) });
      }
    }
    const sig = b.map(x => x.id + (x.pressed ? '+' : '') + (x.disabled ? '-' : '')).join(',');
    if (sig !== this._dockSig) { this._dockSig = sig; Dock.set(b); }
  },
  hud(force) {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud; let text = '', num = '', first = false;
    if (s.ask) text = C.ask4;
    else if (s.thawed && s.lever && s.phase !== 'over') text = this.w('hud', 'whatif', { lever: (this.content.levers || {})[s.lever] || s.lever });
    else if (s.phase === 'hunt' || s.phase === 'dawn') {
      if (s.gen === 1 && s.eatenAll === 0 && s.tastes === 0) { text = this.introLine(); first = s.kd === 0; }
      else if (s.kd === 1) text = this.kcLine(s);
      else if (s.kd === 4) text = C.learn5;
      else text = this.w('hud', s.unt ? 'huntU' : 'hunt', { n: Math.max(0, s.quota - s.eaten) });
      num = s.eaten + '/' + s.quota;
    } else if (s.phase === 'dusk') text = this.duskLine(s);
    else if (s.phase === 'post') text = s.kd === 1 ? this.kcLine(s) : C.post;
    else text = C.wait;
    if (force || text !== this._hudT || num !== this._hudN) {
      this._hudT = text; this._hudN = num; HUD.say(text, num, first ? { first: true } : undefined);
      const el = typeof document !== 'undefined' && document.getElementById ? document.getElementById('hud') : null; this._hudPx = el && el.offsetHeight ? el.offsetHeight : 56;
    }
  },
  ghostAt() {   // the first action cannot fail: point at food (a cream palewing or a grub)
    const s = this.sim.s; let best = -1, bv = 9;
    s.ins.forEach((x, i) => { if (x.st) return; const v = x.k === 'u' ? -1 : x.k === 'p' ? x.v : 9; if (v < bv) { bv = v; best = i; } });
    return best < 0 ? null : this.px(s.ins[best].x, s.ins[best].y);
  },

  update(dt) {
    const ev = Sim.run(this, dt), s = this.sim.s, v = this.v; v.t += dt;
    for (const e of ev) this.juice(e);
    v.flinch = Math.max(0, v.flinch - dt * 6); for (let k = 0; k < 4; k++) v.chickPop[k] = Math.max(0, v.chickPop[k] - dt / 0.22);
    v.born += dt; v.flipT += dt; v.glow = Math.max(0, v.glow - dt);
    for (const m of [v.peck, v.gone]) for (const i in m) m[i] += dt;
    if (v.jac) v.jac.age += dt;
    for (const i in v.kill) v.kill[i].age += dt;
    if (v.retch) { v.retch.age += dt; if (v.retch.age > 1.2) v.retch = null; }
    if (v.chunk) { v.chunk.age += dt; if (v.chunk.age > 0.7) v.chunk = null; }
    if (v.title > 0 && s.phase !== 'dawn') v.title = Math.max(0, v.title - dt * 1.5);
    if (s.ask && this._asked !== s.ask.id) this.openAsk(s.ask);
    this.hud(); this.dock();
    const r = this.sim.result();
    if (r && !this._ended) { this._endT += dt; if (this._endT > (typeof Fx !== 'undefined' && Fx.calm ? 0.3 : 1.2)) this.end(r); }
  },
  openAsk(A) {
    const v = this.v, s = this.sim.s; this._asked = A.id; v.askT0 = v.t; if (typeof Predict === 'undefined') return;
    // the ghost starts off every plausible answer (lessons §1.3); an untouched ghost never commits (needMove)
    const md = sp => { const v = s.ins.filter(x => x.k === sp && !x.st).map(x => x.v).sort((a, b) => a - b); return v.length ? v[v.length >> 1] : 0.5; };
    const start = (md('b') + md('s')) / 2;   // "meet halfway", the misconception, at least 0.18 from the answer
    Predict.ask({ id: A.id, chart: 0, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start, tol: A.tol, at: A.kind === 'y' ? s.gens - 0.4 : undefined, soft: null, needMove: true,
      say: this._hudT || '', onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'void', id: A.id }) });
    if (typeof Snd2 !== 'undefined') Snd2.play('tick', { x: Stage.w / 2, y: Stage.h / 2 });
  },
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, W = Stage.w, H = Stage.h, S = this.size();
    const P = e.x != null ? this.px(e.x, e.y) : null;
    if (e.k === 'eat') {
      v.peck[e.i] = 0; v.jac = { x: P[0], y: P[1], age: 0, kind: 'tasty', i: e.i }; if (this.ghost && this.ghost.hide) this.ghost.hide();
      if (F) F.after(F.calm ? 0 : 90, () => { F.burst('scale', P[0], P[1], 5, { ink: s.ins[e.i] && s.ins[e.i].k === 'u' ? '#BFE6EE' : null }); F.ring(P[0], P[1], S * 0.5, { dashed: true }); });   // the head swings in for 90 ms, then the snap
      if (typeof Snd !== 'undefined') Snd.peck();
      const c = this.chickPos(e.chick); v.chickPop[e.chick] = 1; if (F) F.pop('+1', c[0] + 6, c[1] - 4, 1);
      if (e.warn) { v.flip = s.led.length - 1; v.flipT = 0; if (v.tastyM !== s.gen) { v.tastyM = s.gen; this.whisper('tasty'); } }
    } else if (e.k === 'bitter') {
      if (e.kills) v.kill[e.i] = { age: 0, by: 'you' }; else v.gone[e.i] = 0;
      v.jac = { x: P[0], y: P[1], age: 0, kind: 'bitter', i: e.i };   // the snap, then a grimace and a shudder (0.8 s)
      if (F) { F.shake(5, 180); F.flash({ edge: true, alpha: 0.2, ms: 250 }); F.hitstop(50); F.after(F.calm ? 0 : 160, () => F.burst('droplet', P[0] + S * 0.7, P[1] + S * 0.6, 6, { ink: '#A8D45A' })); }
      if (typeof Snd !== 'undefined') Snd.bitter();
      v.retch = { age: 0, c: e.cost, x: P[0], y: P[1] }; v.chunk = { age: 0, c: e.cost }; v.flip = s.led.length - 1; v.flipT = 0; v.flinch = 1;
      const T = this.timerBox(); if (F) F.pop('−' + this.fmtC(e.cost) + ' s', T.x + T.w * clamp(s.time / s.time0, 0, 1), T.y + 16, -1);
      this.whisper(e.kills && s.kd >= 3 && s.bitN <= 1 ? 'kill' : 'bitter');
      if (typeof Snd2 !== 'undefined' && Snd2.buzz) Snd2.buzz('cost');
    } else if (e.k === 'ring') { this.whisper('ring'); v.glow = 1; }
    else if (e.k === 'crack') this.whisper('crack');
    else if (e.k === 'miss') { const t = v.lastTap || [W / 2, H / 2]; if (F) { F.burst('dust', t[0], t[1], 1); F.pop('−0.3 s', t[0], t[1] - 16, -1); } v.flinch = 1; if (typeof Snd !== 'undefined') Snd.miss(); this.whisper('miss'); }
    else if (e.k === 'busy') { if (e.stun) this.whisper('busy'); }
    else if (e.k === 'fed') { this.whisper('fed'); if (typeof Snd2 !== 'undefined') Snd2.play('peep', { x: this.chickPos(0)[0], y: this.chickPos(0)[1] }); }
    else if (e.k === 'hunt') v.title = Math.min(v.title, 0.6);
    else if (e.k === 'auto') this.whisper(e.on ? 'auto' : 'manual');
    else if (e.k === 'dusk') {
      v.dusk = this.duskPlan(); if (F) F.tier(2, () => { }); if (typeof Snd2 !== 'undefined') Snd2.play('dusk', { x: W / 2, y: H * 0.8 });
      if (e.hungry > 0) { this.whisper('hungry'); for (let k = BWK.CHICKS - e.hungry; k < BWK.CHICKS; k++) { const c = this.chickPos(k); if (F) F.ring(c[0], c[1], 15, { dashed: true }); } }
      if (!s.thawed && !s.auto) { v.idle = e.eaten || s.mTaste ? 0 : v.idle + 1; if (v.idle >= 2) this.whisper('idle'); }
      if (typeof Live !== 'undefined') Live.say(Txt.f('Dusk. {n} meals for the chicks today.', { n: e.got }));
    } else if (e.k === 'ask') { if (typeof Live !== 'undefined') Live.say(this._hudT || ''); }
    else if (e.k === 'pred') {
      if (typeof Predict !== 'undefined') { Predict.reveal(e.id, e.exp, e.tol); if (Predict.fold && F) F.after(1600, () => Predict.fold()); }
      if (typeof Snd2 !== 'undefined') Snd2.play(e.hit ? 'count' : 'tock', { x: W / 2, y: H / 2, i: 6 });
      this._asked = null;
    } else if (e.k === 'bred') {
      v.born = 0; v.title = 1; v.dusk = null; v.peck = {}; v.gone = {}; v.kill = {}; v.jac = null; this._asked = null;
      if (typeof Freezer !== 'undefined' && !Sim.replaying(this)) Freezer.put(this.id, e.gen, this.sim.snapshot());
      if (typeof Live !== 'undefined') Live.say(Txt.f('Generation {g}.', { g: e.gen }));
      if (typeof Snd !== 'undefined' && Snd.dawn) Snd.dawn();
    }
    else if (e.k === 'over') { if (typeof Snd2 !== 'undefined') Snd2.play('interesting', { x: W / 2, y: H / 2 }); }
  },
  duskPlan() {   // when each young bird's taste lands during the dusk (L4–L5), and which bugs it spared
    const s = this.sim.s, r = s.hist[s.hist.length - 1].dusk || {}, out = { kills: [], spares: [] }, D = BWK.T.dusk - 0.6;
    if (s.kd === 3) (r.order || []).forEach((i, k, a) => out.kills.push({ i, t: 0.35 + D * (k + 0.5) / Math.max(1, a.length) }));
    if (s.kd === 4) (r.y || []).forEach(y => { y.kill.forEach((i, k, a) => { if (i >= 0) out.kills.push({ i, t: 0.35 + D * (k + 0.5) / Math.max(1, a.length) }); }); y.spare.forEach(i => { if (i >= 0) out.spares.push(i); }); });
    return out;
  },
  end(r) {
    this._ended = true; const final = this.level === this.levels.length - 1, last = typeof Freezer !== 'undefined' ? Freezer.list(this.id)[0] : null;   // What if? from the earliest vial, so the change has time to show
    const kd = this.kd(), levers = { 0: ['nomodels', 'noinherit'], 1: ['manymodels', 'cheap'], 3: ['nojump', 'inside'], 4: ['scatterB', 'clusterA'] }[kd];
    const C = this.content, LS = (C.levelStars || [])[this.level] || {}, stars = {};   // a star this level earned still missing from the unit points to where the unit earns it
    [['discover', 1], ['predict', 2], ['transfer', 4]].forEach(([k, b]) => { stars[k] = r.mask & b ? C.stars[k] : LS[k] || null; });
    const labels = ['Average palewing look by generation', 'Mimics’ edge against mimics per model (break-even k = C)', 'Each species’ pattern by generation', 'Bright share on each island'];
    End.show(this, { level: this.level, mask: r.mask, final, interesting: r.interesting, whatIf: last && levers ? { gen: last.gen, levers } : null, stars,
      chart: cv => { if (typeof LiveGraph !== 'undefined') LiveGraph.draw(cv, this.notes(true).charts[kd === 0 ? 1 : 0], 'paper'); }, chartLabel: labels[this.level] });
  },
  teacherStep() {   // Teacher → (step): run on to the next dawn, prediction or the end
    for (let i = 0; i < 4000; i++) { const s = this.sim.s, ph = s.phase, g = s.gen; this.update(1 / 30); const t = this.sim.s; if (t.ask || t.gen !== g || (t.phase !== ph && t.phase === 'over')) break; }
  },

  /* ---------- input ---------- */
  tap(x, y) {
    const s = this.sim.s; this.v.lastTap = [x, y];
    if (s.phase !== 'hunt' && s.phase !== 'dawn') return;
    const r = Math.max(22, this.size() * 0.55), pts = s.ins.map(q => { if (q.st) return { x: -1e4, y: -1e4 }; const p = this.px(q.x, q.y); return { x: p[0], y: p[1], r }; });
    Sim.act(this, { k: 'tap', i: Stage.hit ? Stage.hit(x, y, pts, 22) : -1 });
  },
  onKey(k) {
    const s = this.sim.s, W = Stage.w, H = Stage.h, c = this.v.cursor || (this.v.cursor = [W / 2, H / 2]);
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (d) { c[0] = clamp(c[0] + d[0] * W * 0.06, 8, W - 8); c[1] = clamp(c[1] + d[1] * H * 0.06, this.hudH() + 40, H - 64); return true; }
    if (k === ' ' || k === 'Spacebar') { if (s.phase === 'dusk') Sim.act(this, { k: 'skip' }); else this.tap(c[0], c[1]); return true; }
    if (k === 'a' || k === 'A') { Sim.act(this, { k: 'auto', on: !s.auto }); return true; }
    if ((k === 'e' || k === 'E') && s.unt) { Sim.act(this, { k: 'rest' }); return true; }
    return false;
  },

  /* ---------- drawing: a Neotropical forest edge (D6 addendum 7) ---------- */
  sprite(q, S) {   // butterflies, dragonflies and shield bugs, baked once per look (32 bins) and size
    const C = BWK.spr || (BWK.spr = new Map()), d = Math.min(2, Stage.dpr || 1), vq = Math.round(clamp(q.v, 0, 1) * 31) / 31;
    const key = q.k + (q.k === 'g' ? (q.br ? 'B' : 'G') : vq) + '|' + Math.round(S) + '|' + d;
    let cv = C.get(key); if (cv) return cv;
    const W = 42, Hh = 36, sc = S / W; cv = mkCanvas(W * sc * d, Hh * sc * d); const g = cv.getContext('2d'); g.scale(sc * d, sc * d);
    if (q.k === 'u') bwDragon(g); else if (q.k === 'g') bwBug(g, !!q.br); else bwFly(g, q.k, vq);
    cv.cw = S; cv.ch = S * Hh / W; if (C.size > 700) C.clear(); C.set(key, cv); return cv;
  },
  ground(w, h) {   // the forest edge, baked once per size: canopy light, layered big leaves, dappled sun, a passion vine in flower; L5 adds the river
    const d = w * h > 300000 ? 1 : Math.min(1.5, Stage.dpr || 1), isl = this.kd() === 4, key = Math.round(w) + 'x' + Math.round(h) + '@' + d + (isl ? 'i' : '') + Math.round(this.hudH());
    const G = this._g; if (G && G.key === key) return G.cv;
    const cv = mkCanvas(w * d, h * d), g = cv.getContext('2d'); g.scale(d, d);
    const r = rng(4157), u = Math.min(w, 1.2 * h) / 390, I = BW_INK, top = this.hudH();
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1A4429'); bg.addColorStop(0.4, '#123320'); bg.addColorStop(1, '#0A1E13'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    for (const q of [[0.12, 0.16, 0.42], [0.86, 0.1, 0.36], [0.55, 0.5, 0.5]]) {   // light falling through gaps at the forest edge
      const gr = g.createRadialGradient(q[0] * w, q[1] * h, 0, q[0] * w, q[1] * h, q[2] * Math.max(w, h)); gr.addColorStop(0, 'rgba(176,214,120,.2)'); gr.addColorStop(1, 'rgba(176,214,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    }
    for (let k = 0; k < 80; k++) { const L = (46 + 74 * r()) * u; bwLeaf(g, r() * w, r() * h - L * 0.5, L, L * (0.34 + 0.18 * r()), (r() - 0.5) * 6.2, css(mix(I.leaf0, I.leaf1, 0.15 + 0.35 * r())), 'rgba(140,190,120,.09)'); }
    for (let k = 0; k < 40; k++) { const L = (40 + 60 * r()) * u; bwLeaf(g, r() * w, r() * h - L * 0.5, L, L * (0.36 + 0.16 * r()), (r() - 0.5) * 6.2, css(mix(I.leaf1, I.leaf2, 0.02 + 0.22 * r())), 'rgba(190,230,160,.14)'); }
    g.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 46; k++) { const x = r() * w, y = r() * h, rr = (8 + 30 * r()) * u, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, 'rgba(120,130,60,.22)'); gr.addColorStop(1, 'rgba(120,130,60,0)'); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }   // dappled sun
    g.globalCompositeOperation = 'source-over';
    for (let k = 0; k < 10; k++) {   // big heliconia-like leaves frame the sides
      const left = k % 2 === 0, L = (110 + 70 * r()) * u, y = top + 20 + r() * (h - top - BWK.BAND - 40);
      bwLeaf(g, left ? -L * 0.15 : w + L * 0.15, y, L, L * 0.32, left ? -1.9 - 0.5 * r() : 1.9 + 0.5 * r(), css(mix(I.leaf1, I.leaf2, 0.45 + 0.3 * r())), 'rgba(214,240,180,.35)');
    }
    // the passion vine (Passiflora: the models' food plant) along the top, flowering at the edges, never where butterflies sit
    const vy = top + 18 * u; g.strokeStyle = '#3F6A34'; g.lineWidth = 2.2 * u; g.beginPath(); g.moveTo(-10, vy + 10 * u);
    for (let x = 0; x <= w + 40; x += 60 * u) g.quadraticCurveTo(x + 30 * u, vy - 10 * u + 18 * u * r(), x + 60 * u, vy + 6 * u * r()); g.stroke();
    for (let x = 14 * u; x < w; x += (34 + 20 * r()) * u) { bwPLeaf(g, x, vy + 4 * u, (11 + 5 * r()) * u, 2.6 + (r() - 0.5) * 1.2, css(mix(I.leaf1, I.leaf2, 0.6 + 0.3 * r()))); bwTendril(g, x + 10 * u, vy, 5 * u, '#5E8C46'); }
    for (const q of [[0.04, vy + 14 * u, 15], [0.965, vy + 10 * u, 13], [0.965, h - BWK.BAND - 26 * u, 14], [0.035, h - BWK.BAND - 46 * u, 12]]) bwFlower(g, q[0] * w, q[1], q[2] * u, 0);
    if (isl) {   // L5: a café-au-lait Amazon river between two islands; dashed territory lines
      const wy0 = this.px(0, BWK.ISL[0].y1 + 4)[1], wy1 = this.px(0, BWK.ISL[1].y0 - 6)[1], rv = g.createLinearGradient(0, wy0, 0, wy1);
      rv.addColorStop(0, '#5A4A30'); rv.addColorStop(0.5, '#7C6A47'); rv.addColorStop(1, '#5A4A30'); g.fillStyle = rv; g.fillRect(0, wy0, w, wy1 - wy0);
      g.fillStyle = '#3C2C1C'; g.fillRect(0, wy0 - 3, w, 3); g.fillRect(0, wy1, w, 3);
      g.strokeStyle = 'rgba(236,220,170,.28)'; g.lineWidth = 1.2; g.beginPath(); for (let k = 0; k < 9; k++) { const x = r() * w, y = wy0 + (0.2 + 0.6 * r()) * (wy1 - wy0); g.moveTo(x, y); g.quadraticCurveTo(x + 9 * u, y - 2, x + 18 * u, y); } g.stroke();
      g.setLineDash([3, 5]); g.strokeStyle = 'rgba(232,223,201,.16)'; g.lineWidth = 1;
      for (const I2 of BWK.ISL) { const y0 = this.px(0, I2.y0)[1], y1 = this.px(0, I2.y1)[1], ym = (y0 + y1) / 2; g.beginPath(); g.moveTo(0, ym); g.lineTo(w, ym); for (let k = 1; k < 4; k++) { const x = this.px(BWK.BOX.x0 + k * (BWK.BOX.x1 - BWK.BOX.x0) / 4, 0)[0]; g.moveTo(x, y0); g.lineTo(x, y1); } g.stroke(); }
      g.setLineDash([]);
    }
    const gr = g.createRadialGradient(w / 2, h * 0.5, Math.min(w, h) * 0.3, w / 2, h * 0.5, Math.max(w, h) * 0.8); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,8,4,0.45)'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    this._g = { key, cv }; return cv;
  },
  onResize() { this._g = null; },
  draw(c, w, h) {
    const s = this.sim.s; if (!s || !this.v) return; const v = this.v;
    c.drawImage(this.ground(w, h), 0, 0, w, h);
    this.drawInsects(c, w, h);
    if (s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'post' || s.phase === 'over') this.drawDusk(c, w, h);
    this.drawJac(c);
    this.drawTop(c, w, h);
    this.drawBand(c, w, h);
    if (s.phase === 'dawn' || v.title > 0) this.drawTitle(c, w, h);
    if (v.cursor && typeof Fx !== 'undefined' && Fx.lastInput === 'key') { const cu = v.cursor; c.strokeStyle = '#E8DFC9'; c.lineWidth = 2; c.beginPath(); c.arc(cu[0], cu[1], 16, 0, TAU); c.moveTo(cu[0] - 22, cu[1]); c.lineTo(cu[0] - 10, cu[1]); c.moveTo(cu[0] + 10, cu[1]); c.lineTo(cu[0] + 22, cu[1]); c.stroke(); }
  },
  avoid(q) {   // the memory cue (D4 §5.3): warning looks gain a dashed avoid-ring once memory holds about three bitter tastes; it cracks when tasty tastes outnumber bitter
    const s = this.sim.s, sim = this.sim;
    if (s.kd <= 1) { if (!(q.k === 'm' || (q.k === 'p' && q.v >= BWK.WARN))) return 0; const w = sim.weights(); return w.b >= 2.5 ? (w.t > w.b ? 2 : 1) : 0; }
    if (q.k === 'u') return 0; return sim.inHalo(q.v) ? 1 : 0;
  },
  drawInsects(c, w, h) {
    const s = this.sim.s, v = this.v, S = this.size(), calm = typeof Fx !== 'undefined' && Fx.calm, t = v.t, D = v.dusk, dt0 = s.phase === 'dusk' ? s.t : 99;
    const killAt = {}; if (D) for (const k of D.kills) killAt[k.i] = k.t;
    const put = (cv, x, y, a, sx, al) => { c.save(); c.globalAlpha = al; c.translate(x, y); c.rotate(a); c.scale(sx, 1); c.drawImage(cv, -cv.cw / 2, -cv.ch / 2, cv.cw, cv.ch); c.restore(); };
    s.ins.forEach((q, i) => {
      const p = this.px(q.x, q.y), born = clamp(v.born / 0.5, 0, 1), fly = q.k !== 'u' && q.k !== 'g', sz = q.k === 'u' ? S * 0.92 : q.k === 'g' ? S * 0.9 : S;
      let x = p[0], y = p[1];
      const alive = !q.st || (q.st === 3 && killAt[i] != null && dt0 < killAt[i]);
      if (alive) {
        const ph = (q.id * 0.618) % 1; let sx = 1, lift = 0;
        if (!calm && fly) {   // a resting butterfly fans its wings now and then (a few quick beats), otherwise breathes
          const cyc = (t * (0.15 + 0.12 * ph) + ph) % 1;
          if (cyc < 0.2) { const f = cyc / 0.2; sx = 0.28 + 0.72 * Math.abs(Det.cos(f * 3 * Math.PI)); lift = 3 * Det.sin(f * Math.PI); } else sx = 0.95 + 0.05 * Det.cos(t * 1.3 + ph * 6);
        }
        if (!calm && q.k === 'u') { x += 1.6 * Det.sin(t * 2.1 + ph * 6); y += 1.2 * Det.cos(t * 1.7 + ph * 5); lift = 2; }   // a dragonfly hovers
        c.globalAlpha = born * 0.3; c.fillStyle = '#000000'; c.beginPath(); c.ellipse(x + 3, y + 5, sz * 0.34 * sx, sz * 0.18, 0, 0, TAU); c.fill(); c.globalAlpha = 1;   // its shadow on the leaf
        put(this.sprite(q, sz), x, y - lift, q.a, sx, born);
        const ring = this.avoid(q);
        if (ring) { c.save(); c.globalAlpha = 0.85; c.strokeStyle = '#F0E6CC'; c.lineWidth = 1.6 + (v.glow > 0 ? v.glow * 1.5 : 0); c.setLineDash(ring === 2 ? [2, 7] : [5, 3]); c.beginPath(); c.arc(x, y, sz * 0.62, 0, TAU); c.stroke(); c.restore(); }
        return;
      }
      if (q.st === 1 && v.peck[i] != null && v.peck[i] < 0.45) {   // the catch: snapped up at the strike, pulled towards the bill, gone
        const k = v.peck[i], f = clamp((k - 0.12) / 0.3, 0, 1), J = v.jac;
        const tx = J && J.i === i ? lerp(x, x + S * 0.5, f) : x, ty = J && J.i === i ? lerp(y, y + S * 0.45, f) : y - 6 * f;
        put(this.sprite(q, sz), tx, ty, q.a + 0.6 * f, k < 0.12 ? 1 : 0.4 + 0.6 * Math.abs(Det.cos(k * 40)), 1 - f);
        return;
      }
      if (q.st === 2 && v.gone[i] != null && v.gone[i] < 1.6) {   // a tasted model flutters off alive, as jacamars release Heliconius (D4 §5.3; Chai 1986)
        const g0 = v.gone[i], k = g0 / 1.6, dir = q.x < 195 ? -1 : 1, hold = clamp((g0 - 0.25) / 1.35, 0, 1);
        put(this.sprite(q, S), x + dir * hold * (S * 3.2) + 4 * Det.sin(g0 * 11), y - hold * S * 1.6 + 5 * Det.sin(g0 * 14), q.a + 0.5 * Det.sin(g0 * 9), g0 < 0.25 ? 1 : 0.25 + 0.75 * Math.abs(Det.cos(g0 * 20)), 1 - k * k);
        return;
      }
      const kk = v.kill[i] ? v.kill[i].age : killAt[i] != null ? dt0 - killAt[i] : null;
      if (kk != null && kk >= 0 && kk < 1.2) {   // tasting kills (L4–L5): it falls; a dashed ghost ring stays
        const k = kk / 1.2;
        if (k < 0.6) put(this.sprite(q, sz), x, y + 14 * k, q.a + 1.4 * k, 1 - 0.5 * k, 1 - k / 0.6);
        c.save(); c.globalAlpha = 0.8 * (1 - k); c.strokeStyle = '#E8DFC9'; c.lineWidth = 1.5; c.setLineDash([4, 3]); c.beginPath(); c.arc(x, y, S * 0.42, 0, TAU); c.stroke(); c.restore();
      }
    });
  },
  drawJac(c) {   // you, the jacamar: the head swings in (90 ms telegraph), snaps, then gulps happily or grimaces and shudders at a bitter mouthful
    const v = this.v, J = v.jac; if (!J) return;
    const S = this.size(), calm = typeof Fx !== 'undefined' && Fx.calm, k = J.age, bad = J.kind === 'bitter', life = bad ? 0.95 : 0.42;
    if (k > life) { v.jac = null; return; }
    const dx = J.x > Stage.w * 0.62 ? -0.72 : 0.72, dy = J.y > Stage.h - BWK.BAND - S * 1.9 ? -0.69 : 0.69, Z = S * 1.25, reach = Z * 1.25;   // the head comes from below, or from above near the nest band
    let dist = reach, gape = 0, mood = 0, alpha = 1, shud = 0;
    if (calm) { dist = reach * 1.1; gape = bad ? 0.5 : 0; mood = bad ? 2 : 1; alpha = 1 - k / life; }
    else if (k < 0.09) { const f = k / 0.09; dist = reach * (1.9 - 0.9 * f); gape = 0.7 * f; alpha = 0.35 + 0.65 * f; }
    else if (k < 0.16) gape = 0.7 * (1 - (k - 0.09) / 0.07);
    else if (bad) { const f = clamp((k - 0.16) / 0.18, 0, 1); dist = reach * (1 + 0.5 * f); gape = 0.85 * f; mood = 2; shud = (1 - clamp((k - 0.16) / 0.6, 0, 1)) * S * 0.08 * Det.sin(k * 80); alpha = 1 - clamp((k - 0.78) / 0.17, 0, 1); }
    else { const f = (k - 0.16) / (life - 0.16); dist = reach * (1 + 0.7 * f); mood = 1; alpha = 1 - f * f; }
    const zz = mood === 2 && !calm ? Z * (1 + 0.25 * clamp((k - 0.16) / 0.12, 0, 1)) : Z;   // the grimace swells into view
    bwJacHead(c, J.x + dx * dist + shud, J.y + dy * dist, -dx, -dy, zz, { gape, mood, alpha, age: k });
  },
  drawDusk(c, w, h) {   // dusk in the canvas: a violet tint; in L4–L5 the young jacamars swoop on what they taste and spare the siblings
    const s = this.sim.s, v = this.v, t = s.phase === 'dusk' ? s.t : 9, D = v.dusk, S = this.size();
    c.fillStyle = 'rgba(24,14,40,' + (0.34 * clamp(t / 0.5, 0, 1)) + ')'; c.fillRect(0, 0, w, h);
    if (s.kd <= 1 && s.phase === 'dusk') {   // survivors lay eggs, tinted by their look; the eggs fly into the next column of the in-scene graph (T2)
      const G = this.graphBox(), n = Math.max(s.gens, s.hist.length), X = G.x + 6 + (G.w - 12) * (n > 1 ? Math.min(s.hist.length, n - 1) / (n - 1) : 0.5), Yt = G.y + G.h / 2;
      const a = clamp((t - 0.3) / 0.4, 0, 1), m = clamp((t - 1.3) / 0.8, 0, 1), e = m * m * (3 - 2 * m);
      s.ins.forEach((q, i) => {
        if (q.k !== 'p' || q.st) return; const p = this.px(q.x, q.y), col = css(mix(BW_INK.cream, BW_INK.black, q.v));
        if (t < 0.9) { c.strokeStyle = 'rgba(240,230,204,' + (0.7 * (1 - t / 0.9)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(p[0], p[1], S * (0.5 + 0.2 * t), 0, TAU); c.stroke(); }
        for (let k = 0; k < 2; k++) {
          const ex = p[0] + (k ? 7 : -7), ey = p[1] + S * 0.45, f = clamp(e * 1.15 - (i % 7) * 0.02, 0, 1), x = lerp(ex, X, f), y = lerp(ey, Yt, f) - 40 * Det.sin(Math.PI * f);
          c.globalAlpha = a * (1 - 0.7 * m); c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 3, 3.8, 0, 0, TAU); c.fill(); c.strokeStyle = '#F0E6CC'; c.lineWidth = 1; c.stroke(); c.globalAlpha = 1;
        }
      });
    }
    if (!D || s.phase !== 'dusk') return;
    for (const k of D.kills) {
      const dtk = t - k.t; if (dtk < -0.3 || dtk > 0.3) continue; const q = s.ins[k.i]; if (!q) continue;
      const p = this.px(q.x, q.y), a = dtk < 0 ? 1 + dtk / 0.3 : 1 - dtk / 0.3, fx = p[0] + (dtk < 0 ? 1 : -1) * (1 - a) * 70, fy = p[1] - 14 - (1 - a) * 60;
      bwJacFly(c, fx, fy, S * 1.05, dtk > 0 ? 1 : -1, t + k.i);
    }
    if (D.spares.length && t > 0.4) {   // spared siblings: a paper ring, and one label
      const a = clamp((t - 0.4) / 0.4, 0, 1); c.save(); c.globalAlpha = a; c.strokeStyle = '#F0E6CC'; c.lineWidth = 2;
      for (const i of D.spares) { const q = s.ins[i]; if (!q) continue; const p = this.px(q.x, q.y); c.beginPath(); c.arc(p[0], p[1], S * 0.36, 0, TAU); c.stroke(); }
      c.restore(); const q = s.ins[D.spares[0]]; if (q) { const p = this.px(q.x, q.y); Lbl.put('spared', this.w('labels', 'spared'), p[0], p[1] - S * 0.75, { size: 12 }); }
    }
  },
  timerBox() { return { x: 10, y: this.hudH() + 4, w: Stage.w - 20, h: 6 }; },
  drawTop(c, w, h) {   // the morning clock in meal-seconds, and the level's pills
    const s = this.sim.s, v = this.v, T = this.timerBox();
    if (s.phase === 'hunt' || s.phase === 'dawn') {   // one tick a meal-second: the pace that makes a retch worth its seconds in meals
      const f = clamp(s.unt ? s.looks / BWK.LOOKS : s.time / s.time0, 0, 1);
      c.fillStyle = 'rgba(20,16,12,.5)'; c.fillRect(T.x, T.y, T.w, T.h); c.fillStyle = f < 0.25 ? '#E8DFC9' : '#D9A441'; c.fillRect(T.x + v.flinch * 4, T.y, T.w * f, T.h);
      c.fillStyle = 'rgba(20,16,12,.55)'; const n = s.unt ? BWK.LOOKS : s.time0; for (let k = 1; k < n; k++) c.fillRect(T.x + T.w * k / n - 0.5, T.y, 1, T.h);
      if (v.chunk) { const a = v.chunk.age / 0.7, cw = T.w * v.chunk.c / (s.unt ? BWK.LOOKS : s.time0); c.globalAlpha = 1 - a; c.fillStyle = '#E8DFC9'; c.fillRect(T.x + T.w * f, T.y + 18 * a, cw, T.h); c.globalAlpha = 1; }
    }
    const py = T.y + 20; let x = w - 8;   // pills: the retch cost, the models (L2: k against C), the ×N chip, islands (boss)
    const pill = (id, txt, o) => { const b = Lbl.put(id, txt, x, py, Object.assign({ size: 12, align: 'right' }, o || {})); if (b) x = b.x - 6; };
    if (s.kd === 0) { pill('retch', this.w('labels', 'retch', { c: this.fmtC(s.cost) })); pill('models', this.w('labels', s.models === 1 ? 'model1' : 'models', { m: s.models })); }
    if (s.kd === 1) { const r = s.hist[s.hist.length - 1] || {}, k = r.k != null ? Math.round(r.k * 10) / 10 : 0, pays = k > s.cost;   // the key number, in the scene
      pill('kc', this.w('labels', 'kc', { k, c: this.fmtC(s.cost) }), pays ? { ink: '#1B1612', bg: '#D9A441' } : undefined); pill('models', this.w('labels', s.models === 1 ? 'model1' : 'models', { m: s.models })); }
    if (s.kd === 3 || s.kd === 4) pill('retch', this.w('labels', 'retch', { c: this.fmtC(s.cost) }));
    Lbl.put('xn', this.w('labels', 'xn'), 8, py, { size: 12, align: 'left', mono: true });
    if (s.kd === 1) this.drawPlant(c, w - 30, py + 48, s.models / 12);
    if (s.kd === 3 && s.gen <= 2) Lbl.put('hc', this.w('labels', 'hc'), 8, py + 24, { size: 12, align: 'left', mono: true });
    if (s.kd === 4) for (let k = 0; k < 2; k++) {
      const y = this.px(0, k ? BWK.ISL[1].y0 - 16 : BWK.ISL[0].y0 + 2)[1], b = Lbl.put('isl' + k, this.w('labels', k ? 'B' : 'A'), w - 8, y, { size: 12, align: 'right' });
      Lbl.put('isl' + k + 'd', this.w('labels', k ? 'clus' : 'scat'), (b ? b.x : w - 70) - 6, y, { size: 12, align: 'right', mono: true });
    }
  },
  drawPlant(c, x, y, f) {   // the models' passion vine (L2; Heliconius caterpillars eat only Passiflora): leaves droop and brown, the flower wilts as the models fall
    const k = clamp(f, 0, 1), leaf = css(mix([124, 98, 52], [74, 152, 82], k)), droop = (1 - k) * 0.9;
    c.save(); c.translate(x, y); c.fillStyle = 'rgba(8,22,14,.55)'; c.beginPath(); c.ellipse(0, 2, 22, 28, 0, 0, TAU); c.fill();
    c.strokeStyle = css(mix([100, 82, 48], [60, 116, 62], k)); c.lineWidth = 2.4; c.beginPath(); c.moveTo(2, 26); c.quadraticCurveTo(-6, 6, -2, -12); c.stroke();
    bwTendril(c, 3, 8, 5, css(mix([110, 92, 52], [96, 150, 76], k)));
    for (let i = 0; i < 3; i++) { const sd = i % 2 ? 1 : -1; bwPLeaf(c, -2 + sd * 2, 18 - i * 10, 9, sd * (1.2 + droop) + (i === 2 ? 0.4 : 0), leaf); }
    bwFlower(c, -2, -15, 9, 1 - k);
    c.restore();
  },
  drawLedger(c, x0, y0, w) {   // the taste ledger (the bird's memory, D4 rule 11) and the warning-wing cue whose outline thickens per fresh bitter taste
    const s = this.sim.s, v = this.v, wgt = this.sim.weights(), nb = Math.min(4, Math.round(wgt.b));
    const cue = this.sprite({ k: s.kd === 3 ? (s.common || 'b') : s.kd === 4 ? 'g' : 'm', v: s.kd === 3 ? (s.common === 's' ? 0.1 : 0.9) : 1, br: true, id: 0 }, 26, 0);
    c.drawImage(cue, x0 + 14 - cue.cw / 2, y0 + 15 - cue.ch / 2, cue.cw, cue.ch);
    c.strokeStyle = nb > 0 ? '#E8DFC9' : 'rgba(232,223,201,.3)'; c.lineWidth = Math.max(1, nb); c.beginPath(); c.arc(x0 + 14, y0 + 15, 15, 0, TAU); c.stroke();
    const n = Math.max(1, Math.min(BWK.MAXLED, Math.floor((w - 40) / 30))), tx = x0 + 36;
    if (!s.led.length) { Lbl.put('mem', this.w('labels', 'memory'), tx, y0 + 15, { size: 12, align: 'left', pill: false, ink: 'rgba(232,223,201,.6)' }); return; }
    if (this._led) {
      this._led.items = s.led.slice(-n).map(t => ({ glyph: (g, x, y, sz) => { const cv = this.sprite({ k: t.k, v: t.v, br: !!t.br, id: 0 }, sz * 0.95, 0); g.drawImage(cv, x - 3 - cv.cw / 2, y - cv.ch / 2, cv.cw, cv.ch); }, good: !t.b, t: t.g }));
      this._led.draw(c, tx, y0 + 1, { gen: s.gen, size: 28, cols: n, theme: 'paper' });
      const k = v.flip - Math.max(0, s.led.length - n);
      if (v.flip >= 0 && v.flipT < 0.25 && k >= 0) { const cx = tx + k * 32 + 14; c.strokeStyle = '#FFF6DE'; c.lineWidth = 2; c.beginPath(); c.arc(cx, y0 + 15, 17 + 10 * v.flipT, 0, TAU); c.stroke(); }
    }
  },
  chickPos(k) { return [24 + k * 30, Stage.h - 26]; },
  drawBand(c, w, h) {   // the memory row, then the nest and the in-scene graph: the population's story, one column or point per generation
    const s = this.sim.s, v = this.v, y0 = h - BWK.BAND;
    c.fillStyle = 'rgba(8,22,14,.92)'; c.fillRect(0, y0, w, BWK.BAND);
    c.fillStyle = '#4A2F1E'; c.beginPath(); c.moveTo(4, h - 4); c.lineTo(4, y0 + 46); c.quadraticCurveTo(68, y0 + 36, 132, y0 + 46); c.lineTo(132, h - 4); c.closePath(); c.fill();   // the jacamars' earth bank
    c.fillStyle = '#5E3D27'; for (let k = 0; k < 14; k++) c.fillRect(8 + (k * 37) % 120, y0 + 50 + (k * 23) % 38, 3, 2);
    c.fillStyle = '#140B06'; c.beginPath(); c.ellipse(68, h - 22, 60, 16, 0, 0, TAU); c.fill();   // the burrow mouth
    c.fillStyle = 'rgba(232,223,201,.25)'; c.fillRect(0, y0, w, 1); c.fillRect(0, y0 + 36, w, 1);
    this.drawLedger(c, 6, y0 + 3, w - 12);
    for (let k = 0; k < BWK.CHICKS; k++) {
      const p = this.chickPos(k), per = s.quota / BWK.CHICKS, got = Math.floor(s.eaten / BWK.CHICKS) + (k < s.eaten % BWK.CHICKS ? 1 : 0), f = clamp(got / per, 0, 1);
      const hungry = (s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'post') && k >= BWK.CHICKS - s.hungry;
      if (hungry) { c.strokeStyle = 'rgba(232,223,201,.7)'; c.setLineDash([4, 3]); c.lineWidth = 1.5; c.beginPath(); c.arc(p[0], p[1], 11, 0, TAU); c.stroke(); c.setLineDash([]); continue; }
      bwChick(c, p[0], p[1], 30, { fed: s.phase === 'hunt' || s.phase === 'dawn' ? f : 1, gape: (s.phase === 'hunt' && f < 1) || v.chickPop[k] > 0.5, pop: v.chickPop[k] });
    }
    const b = this.graphBox(), H = s.hist, n = Math.max(s.gens, H.length);
    c.strokeStyle = 'rgba(232,223,201,.35)'; c.lineWidth = 1; c.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
    const X = i => b.x + 6 + (b.w - 12) * (n > 1 ? i / (n - 1) : 0.5), Y = f => b.y + b.h - 4 - (b.h - 8) * clamp(f, 0, 1);
    const line = (vals, col, lw, dash) => { c.strokeStyle = col; c.lineWidth = lw; c.setLineDash(dash || []); c.beginPath(); let on = false; vals.forEach((f, i) => { if (f == null) { on = false; return; } if (on) c.lineTo(X(i), Y(f)); else { c.moveTo(X(i), Y(f)); on = true; } }); c.stroke(); c.setLineDash([]); };
    const dot = (x, y, col, r) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r || 3, 0, TAU); c.fill(); };
    if (s.kd === 0) {   // columns of the average look, painted in that look
      H.forEach((r, i) => { const cw = Math.min(16, (b.w - 12) / n * 0.7), f = r.mean || 0, x = X(i) - cw / 2, ht = Y(0) - Y(f), a = i === H.length - 1 ? clamp(v.born / 0.4, 0, 1) : 1;
        c.globalAlpha = a; c.fillStyle = css(mix([226, 212, 158], [28, 22, 24], f)); c.fillRect(x, Y(f), cw, ht); c.strokeStyle = '#E8DFC9'; c.strokeRect(x + 0.5, Y(f) + 0.5, cw - 1, ht - 1); c.globalAlpha = 1; });
      c.setLineDash([4, 3]); c.strokeStyle = 'rgba(232,223,201,.8)'; c.beginPath(); c.moveTo(b.x, Y(0.98)); c.lineTo(b.x + b.w, Y(0.98)); c.stroke(); c.setLineDash([]);
    } else if (s.kd <= 1) {   // the mimics' edge each day, above or below zero
      const z = b.y + b.h / 2; c.setLineDash([4, 3]); c.strokeStyle = 'rgba(232,223,201,.7)'; c.beginPath(); c.moveTo(b.x, z); c.lineTo(b.x + b.w, z); c.stroke(); c.setLineDash([]);
      H.forEach((r, i) => { if (r.adv == null) return; const y = z - (b.h / 2 - 5) * clamp(r.adv, -1, 1); if (s.kd === 1) { const bh = 2 + 14 * r.models / 12; c.fillStyle = 'rgba(232,223,201,.25)'; c.fillRect(X(i) - 3, b.y + b.h - bh, 6, bh); } dot(X(i), y, '#E8DFC9', 3.5); c.strokeStyle = '#E8DFC9'; c.lineWidth = 1; c.beginPath(); c.arc(X(i), y, 3.5, 0, TAU); c.stroke(); });
    } else if (s.kd === 3) {   // each species' typical pattern: band above, spots below
      line(H.map(r => r.mb), '#E8DFC9', 2.5); line(H.map(r => r.ms), '#D9A441', 2.5);
    } else {   // bright share on island A (thin) and B (thick)
      line(H.map(r => r.sh ? r.sh[0] : null), 'rgba(232,223,201,.7)', 1.5, [3, 2]); line(H.map(r => r.sh ? r.sh[1] : null), '#E8DFC9', 2.5);
    }
  },
  graphBox() { const h = Stage.h; return { x: 140, y: h - 54, w: Stage.w - 152, h: 46 }; },
  drawTitle(c, w, h) {
    const s = this.sim.s, v = this.v; if (s.phase === 'dawn') v.title = Math.max(v.title, 0.6);
    const a = clamp(v.title, 0, 1); if (a <= 0.02) return;
    c.globalAlpha = a; c.fillStyle = 'rgba(12,18,17,.45)'; c.fillRect(0, h * 0.44 - 30, w, 60);
    Lbl.put('gen', this.w('labels', s.kd === 1 ? 'day' : 'gen', { g: s.gen }), w / 2, h * 0.44 - 6, { size: 24, pill: false, ink: '#E8DFC9', weight: 700 });
    const sub = s.kd <= 1 ? this.w('labels', s.models === 1 ? 'model1' : 'models', { m: s.models }) : this.w('labels', 'young');
    Lbl.put('sub', sub, w / 2, h * 0.44 + 18, { size: 14, pill: false, ink: '#E8DFC9' });
    c.globalAlpha = 1;
  },

  /* ---------- the live graph (notes() feeds the strip; never pauses) ---------- */
  notes(card) {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    const H = s.hist, n = s.kd, cur = H[H.length - 1];
    const stats = [['Meals', s.fed + ' of ' + s.need, 'Meals fed to the chicks so far.'], [n === 1 ? 'Day' : 'Generation', s.gen + ' of ' + s.gens, '']];
    if (n === 0) {
      const sp = [], ea = []; s.ins.forEach(q => { if (q.k !== 'p') return; (q.st ? ea : sp).push(q.v); });
      const dots = { type: 'dots', title: 'Palewing looks', x: { lo: 0, hi: 1, label: 'cream to warning' }, bins: 16, frame: 'designed',
        groups: [{ v: sp, style: 'solid', label: 'spared' }, { v: ea, style: 'hollow', label: 'eaten' }] };
      const tr = { type: 'trace', title: 'Average look', x: { lo: 1, hi: s.gens, label: 'generation' }, y: { lo: 0, hi: 1, label: 'look' }, frame: 'designed',
        series: [{ d: H.map(r => r.mean), ink: 'ink', label: 'palewings' }], fold: false };
      stats.push(['Average look', Math.round((cur.mean || 0) * 100) + '%', '0% cream, 100% like a model.']);
      return { stats, charts: [dots, tr] };
    }
    if (n === 1) {   // the key number shown plainly (D6 decision 9): the break-even k = C is drawn from the start, since nothing is asked here
      const pts = H.filter(r => r.adv != null).map(r => [Math.min(14, r.k), Math.round(r.adv * 100) / 100]), lo = 0, hi = 14;
      const sc = { type: 'scatter', title: 'Mimics’ edge (break-even k = C)', x: { lo, hi, label: 'k, mimics per model' }, y: { lo: -1, hi: 1, label: 'edge', fmt: 'pct' }, frame: 'designed', ref: 'zero',
        series: [{ pts, shape: 'disc', ink: 'ink', label: 'days' }], ghost: this.edgeCurve(s.cost, lo, hi, 1) };   // ghost: the expected edge for a bird that knows the true mix
      const second = { type: 'trace', title: 'Average look', x: { lo: 1, hi: s.gens, label: 'day' }, y: { lo: 0, hi: 1, label: 'average look' }, frame: 'designed', series: [{ d: H.map(r => r.mean), ink: 'ink', label: 'mimics' }], fold: false };
      stats.push(['k, mimics per model', cur.k != null ? (Math.round(cur.k * 10) / 10).toString() : '–', 'Warning-coloured palewings for each model today.'], ['C, retch cost', this.fmtC(s.cost) + ' meals', 'A retch wastes C seconds, about one meal a second. Tasting pays when k > C.']);
      return { stats, charts: [sc, second] };
    }
    if (n === 3) {
      const nameC = s.common === 'b' ? 'bitterwings' : 'sourwings', nameR = s.common === 'b' ? 'sourwings' : 'bitterwings', key = sp => sp === 'b' ? 'mb' : 'ms';
      const tr = { type: 'trace', title: 'Patterns', x: { lo: 1, hi: s.gens, label: 'generation' }, y: { lo: 0, hi: 1, label: 'spots to band' }, frame: 'designed',
        series: [{ d: H.map(r => r[key(s.common)]), ink: 'ink', label: nameC }, { d: H.map(r => r[key(s.common === 'b' ? 's' : 'b')]), ink: 'text2', label: nameR }] };
      stats.push(['Commoner', nameC, 'The species with more individuals.']);
      return { stats, charts: [tr] };
    }
    const sh = k => H.map(r => r.sh ? r.sh[k] : null), ser = [{ d: sh(0), ink: 'text2', label: 'A' }, { d: sh(1), ink: 'ink', label: 'B' }];
    const tr = { type: 'trace', title: 'Bright share', x: { lo: 1, hi: s.gens, label: 'generation' }, y: { lo: 0, hi: 1, label: 'bright', fmt: 'pct' }, frame: 'designed',
      series: ser };
    stats.push(['Island B spared', String(s.spareB), 'Bright siblings spared by a young bird that had just tasted one.']);
    return { stats, charts: [tr] };
  },
  edgeCurve(E, lo, hi, sign) {   // ghost-only: a smooth step through (E, 0); sign +1 falls with x (L2), −1 rises with x (L3)
    const out = []; for (let x = lo; x <= hi + 1e-9; x += (hi - lo) / 40) { const z = sign * (E - x) / 0.9, e = Det.exp(-2 * z); out.push([Math.round(x * 100) / 100, Math.round((0.9 / (1 + e) - 0.4) * 100) / 100]); }
    return out;
  }
};
V2.push(CH_BITTER_V2);
EXPORT.BITTER = { K: BWK, young5: bwYoung5 };   // for tests/oracle_bitter.js

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 (there was no TRANSFER.bitter to rebuild) ---------- */
if (!Url.v1) {
  TAKE.bitter = BW_C.take;
  BRIDGE.bitter = 'In the Black Country you ate the moths that stood out. Now, at a rainforest edge, some butterflies taste bitter and say so.';
  MODEL.bitter = 'You are a jacamar, the only predator in L1–L3: a retch costs seconds, about one meal each. Look is one inherited trait. L4–L5 add young birds that each learn by tasting. Selection is many times stronger than in nature.';
  RECALL.bitter = { q: 'A bitter model and its tasty mimic look alike. When is the mimic best protected?', opts: [['rare', 'When mimics are rare relative to models'], ['common', 'When mimics are common'], ['always', 'Always, once it looks right']], ans: 'rare', why: 'Each mimic a bird tastes teaches it the warning may be a bluff. Mimics do best while models outnumber them, or models are very toxic.' };
}

/* ---------- painters for the forest edge (view only; Det trig; the scenery uses a private PRNG) ---------- */
const BW_INK = { cream: [242, 236, 214], black: [24, 18, 20], red: [214, 44, 38], yellow: [242, 200, 58], leaf0: [12, 36, 22], leaf1: [28, 78, 46], leaf2: [60, 128, 70] };
function bwWing(g, s, fore) {   // Heliconius proportions: long narrow forewings, rounded hindwings
  g.beginPath();
  if (fore) { g.moveTo(s * 1, -4); g.bezierCurveTo(s * 6, -14, s * 15, -17.5, s * 19.5, -14.5); g.bezierCurveTo(s * 21, -10.5, s * 17.5, -3.5, s * 12, -0.5); g.bezierCurveTo(s * 7, 1.2, s * 3, 0.8, s * 1, 0); }
  else { g.moveTo(s * 1, -1); g.bezierCurveTo(s * 8, -2.5, s * 15, 1.5, s * 14, 8); g.bezierCurveTo(s * 13, 13, s * 6, 14.5, s * 2.5, 9.5); g.bezierCurveTo(s * 1.2, 6.5, s * 0.6, 3, s * 1, -1); }
  g.closePath();
}
function bwFly(g, k, v) {   // a butterfly, wings open, head up, in a 42 × 36 box
  // 'p'/'m': the Batesian look line, a cream white with dark tips (0) → black with a red forewing band and a yellow hindwing bar (1, the model)
  // 'b'/'s': the Müllerian pattern line on black, two yellow spots (0) → one red band (1): pattern and luminance differ, not only hue
  g.save(); g.translate(21, 19);
  const I = BW_INK, bat = k === 'p' || k === 'm', t = bat ? (k === 'm' ? 1 : v) : 1, d = t > 0 ? Det.pow(t, 0.85) : 0, ground = bat ? mix(I.cream, I.black, d) : I.black;
  for (const s of [-1, 1]) for (const fore of [false, true]) {
    bwWing(g, s, fore); g.fillStyle = css(ground); g.fill();
    g.save(); bwWing(g, s, fore); g.clip();
    if (bat) {
      if (fore && t < 0.7) { g.fillStyle = css(mix(ground, [64, 58, 56], 0.8), 1 - t / 0.7); g.beginPath(); g.ellipse(s * 18, -13.5, 5.2, 3.8, s * -0.5, 0, TAU); g.fill(); }
      const rA = clamp(1.25 * t - 0.15, 0, 1), yA = clamp(1.6 * t - 0.6, 0, 1);
      if (fore && rA > 0) { g.fillStyle = css(I.red, rA); g.beginPath(); g.ellipse(s * 11.5, -7.8, 7, 3, s * -0.48, 0, TAU); g.fill(); }
      if (!fore && yA > 0) { g.fillStyle = css(I.yellow, yA); g.beginPath(); g.ellipse(s * 7.6, 2.8, 6.2, 1.6, s * 0.42, 0, TAU); g.fill(); }
      g.strokeStyle = css(mix(ground, [0, 0, 0], 0.4), 0.5 * (1 - 0.7 * d)); g.lineWidth = 0.45; g.beginPath();
      if (fore) for (const q of [[19, -14], [16, -6], [12, -2]]) { g.moveTo(s * 1.5, -2.5); g.lineTo(s * q[0], q[1]); } else for (const q of [[13, 7], [8, 12], [4, 10]]) { g.moveTo(s * 1.5, 0); g.lineTo(s * q[0], q[1]); }
      g.stroke();
    } else {
      g.fillStyle = css(mix(I.yellow, I.red, v));
      if (fore) { const sep = 4.2 * (1 - v), rx = 2.6 + 3.8 * v, ry = 2.5 + 0.5 * v; for (const e of [-1, 1]) { g.beginPath(); g.ellipse(s * (11.5 + e * sep), -7.8 + e * sep * 0.45, rx, ry, s * -0.48, 0, TAU); g.fill(); } }
      else if (v < 0.5) { g.fillStyle = css(I.yellow, 1 - v); for (const q of [[6, 5], [10.5, 7.5]]) { g.beginPath(); g.arc(s * q[0], q[1], 2.1 * (1 - v), 0, TAU); g.fill(); } }
      else { g.fillStyle = css(I.red, 0.3 + 0.5 * v); for (const q of [[13, 4], [11, 9], [7, 11]]) { g.beginPath(); g.moveTo(s * 2, 0.5); g.lineTo(s * q[0], q[1]); g.lineTo(s * q[0] * 0.92, q[1] + 1.6); g.closePath(); g.fill(); } }   // rays at the band end
    }
    g.restore();
    bwWing(g, s, fore); g.strokeStyle = 'rgba(255,248,226,.62)'; g.lineWidth = 0.8; g.stroke();   // a pale rim keeps black wings readable on dark leaves
  }
  g.fillStyle = '#16110F'; g.beginPath(); g.ellipse(0, -2.5, 1.9, 3.4, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(0, 5, 1.3, 6.2, 0, 0, TAU); g.fill(); g.beginPath(); g.arc(0, -6.6, 1.7, 0, TAU); g.fill();
  g.strokeStyle = '#16110F'; g.lineWidth = 0.8; g.beginPath(); g.moveTo(-0.6, -7.6); g.quadraticCurveTo(-2.5, -13, -5.6, -16.6); g.moveTo(0.6, -7.6); g.quadraticCurveTo(2.5, -13, 5.6, -16.6); g.stroke();
  g.beginPath(); g.arc(-5.6, -16.6, 0.9, 0, TAU); g.arc(5.6, -16.6, 0.9, 0, TAU); g.fill();
  if (bat && t > 0.5) { g.fillStyle = css(I.yellow, clamp(2 * t - 1, 0, 1)); g.beginPath(); g.arc(-0.8, -3.6, 0.5, 0, TAU); g.arc(0.8, -3.6, 0.5, 0, TAU); g.fill(); }   // thorax dots
  g.restore();
}
function bwDragon(g) {   // safe food: a dragonfly, glassy wings and a turquoise abdomen (a different shape from every butterfly)
  g.save(); g.translate(21, 18);
  for (const q of [[-7, 19, 3.4, -0.12], [-3.5, 17, 3.8, 0.1]]) for (const s of [-1, 1]) {
    g.beginPath(); g.ellipse(s * q[1] / 2, q[0], q[1] / 2, q[2], s * q[3], 0, TAU); g.fillStyle = 'rgba(214,236,246,.34)'; g.fill(); g.strokeStyle = 'rgba(232,246,255,.8)'; g.lineWidth = 0.6; g.stroke();
    g.fillStyle = 'rgba(30,30,30,.85)'; g.fillRect(s * (q[1] - 3.4) - 0.8, q[0] - 1, 1.6, 1.6);
  }
  for (let i = 0; i < 9; i++) { g.fillStyle = i % 2 ? '#1A8193' : '#46C9D6'; g.fillRect(-1.15, -2 + i * 2, 2.3, 2.1); }
  g.fillStyle = '#2E8F5E'; g.beginPath(); g.ellipse(0, -5.5, 2.7, 3.7, 0, 0, TAU); g.fill();
  g.fillStyle = '#5CC2D0'; g.beginPath(); g.arc(-1.8, -10, 2.2, 0, TAU); g.arc(1.8, -10, 2.2, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(-2.3, -10.7, 0.6, 0, TAU); g.arc(1.3, -10.7, 0.6, 0, TAU); g.fill();
  g.restore();
}
function bwBug(g, br) {   // L5: a defended shield bug, green (cryptic) or bright (black with pale yellow bars: luminance and pattern)
  g.save(); g.translate(21, 18);
  const body = br ? [24, 20, 22] : [92, 128, 58], edge = br ? [24, 20, 22] : [46, 72, 30];
  g.fillStyle = css(body); g.beginPath(); g.moveTo(0, -9); g.bezierCurveTo(12, -9, 12.5, 2, 0, 15.5); g.bezierCurveTo(-12.5, 2, -12, -9, 0, -9); g.fill(); g.strokeStyle = css(edge); g.lineWidth = 1.2; g.stroke();
  g.save(); g.beginPath(); g.moveTo(0, -9); g.bezierCurveTo(12, -9, 12.5, 2, 0, 15.5); g.bezierCurveTo(-12.5, 2, -12, -9, 0, -9); g.clip();
  if (br) { g.fillStyle = '#F4CD50'; g.fillRect(-13, -5, 26, 3.6); g.fillRect(-13, 3, 26, 3.6); g.beginPath(); g.arc(0, 11, 2.2, 0, TAU); g.fill(); }
  else { g.fillStyle = 'rgba(160,196,96,.6)'; g.beginPath(); g.moveTo(0, -3); g.lineTo(5, 7); g.lineTo(0, 13); g.lineTo(-5, 7); g.closePath(); g.fill(); g.strokeStyle = 'rgba(36,56,22,.5)'; g.lineWidth = 0.7; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(0, -8); g.lineTo(i * 5, 15); g.stroke(); } }
  g.restore();
  g.fillStyle = css(edge); g.beginPath(); g.ellipse(0, -10.5, 4, 2.8, 0, 0, TAU); g.fill();
  g.strokeStyle = css(edge); g.lineWidth = 0.8; g.beginPath(); g.moveTo(-1, -12.5); g.quadraticCurveTo(-3, -16.5, -6.5, -17.5); g.moveTo(1, -12.5); g.quadraticCurveTo(3, -16.5, 6.5, -17.5);
  for (const s of [-1, 1]) for (const y of [-4, 1, 6]) { g.moveTo(s * 9, y); g.lineTo(s * 13, y + 2.5); } g.stroke();
  g.restore();
}
function bwLeaf(g, x, y, L, W, rot, col, vein) {   // a pointed rainforest leaf from its base at (x, y)
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(W * 0.95, L * 0.14, W * 0.78, L * 0.7, 0, L); g.bezierCurveTo(-W * 0.78, L * 0.7, -W * 0.95, L * 0.14, 0, 0); g.fillStyle = col; g.fill();
  if (vein) { g.strokeStyle = vein; g.lineWidth = Math.max(0.6, W * 0.045); g.beginPath(); g.moveTo(0, 0); g.lineTo(0, L * 0.96); for (let k = 1; k < 6; k++) { const yy = L * k / 6.5; g.moveTo(0, yy); g.quadraticCurveTo(W * 0.3, yy + L * 0.04, W * 0.62, yy + L * 0.13); g.moveTo(0, yy); g.quadraticCurveTo(-W * 0.3, yy + L * 0.04, -W * 0.62, yy + L * 0.13); } g.stroke(); }
  g.restore();
}
function bwPLeaf(g, x, y, r, rot, col) {   // a three-lobed passion-vine leaf
  g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = col;
  for (const a of [-0.8, 0, 0.8]) { g.save(); g.rotate(a); g.beginPath(); g.ellipse(0, r * 0.55, r * 0.27, r * 0.6, 0, 0, TAU); g.fill(); g.restore(); }
  g.strokeStyle = 'rgba(200,236,170,.3)'; g.lineWidth = 0.7; g.beginPath(); for (const a of [-0.8, 0, 0.8]) { g.moveTo(0, 0); g.lineTo(-Det.sin(a) * r, Det.cos(a) * r); } g.stroke();
  g.restore();
}
function bwTendril(g, x, y, r, col) { g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); for (let k = 1; k <= 14; k++) { const a = k * 0.75, rr = r * (1 - k / 16); g.lineTo(x + rr * Det.cos(a) + k * 0.4, y - k * 0.9 + rr * Det.sin(a)); } g.stroke(); }
function bwFlower(g, x, y, r, wilt) {   // Passiflora: ten pale petals, a banded corona of filaments, the green ovary and stamens; wilt browns and shrinks it
  g.save(); g.translate(x, y);
  const pet = css(mix([238, 230, 246], [140, 112, 66], wilt)), band = [mix([92, 46, 140], [104, 78, 48], wilt), mix([246, 244, 250], [168, 146, 106], wilt), mix([118, 100, 214], [116, 92, 58], wilt)];
  for (let k = 0; k < 10; k++) { g.save(); g.rotate(k * TAU / 10 + wilt * 0.2); g.beginPath(); g.ellipse(0, -r * (0.55 - 0.12 * wilt), r * 0.19, r * 0.48 * (1 - 0.4 * wilt), 0, 0, TAU); g.fillStyle = pet; g.fill(); g.restore(); }
  const L = r * (0.84 - 0.32 * wilt);
  [[0.2, 0.38], [0.38, 0.56], [0.56, 1]].forEach((q, j) => { g.strokeStyle = css(band[j]); g.lineWidth = Math.max(0.6, r * 0.05); g.beginPath(); for (let k = 0; k < 36; k++) { const ux = Det.cos(k * TAU / 36), uy = Det.sin(k * TAU / 36); g.moveTo(ux * L * q[0], uy * L * q[0]); g.lineTo(ux * L * q[1], uy * L * q[1]); } g.stroke(); });
  g.fillStyle = '#7DA84E'; g.beginPath(); g.arc(0, 0, r * 0.15, 0, TAU); g.fill();
  g.fillStyle = '#D6CC5C'; for (let k = 0; k < 5; k++) { const a = k * TAU / 5; g.beginPath(); g.ellipse(Det.cos(a) * r * 0.26, Det.sin(a) * r * 0.26, r * 0.1, r * 0.055, a, 0, TAU); g.fill(); }
  g.restore();
}
function bwJacHead(c, x, y, ux, uy, S, o) {   // a rufous-tailed jacamar's head: metallic green, white throat, long black bill pointing along (ux, uy)
  const r = S * 0.32, b0 = r * 0.75, L = S * 0.95, gp = o.gape || 0;
  c.save(); c.globalAlpha = clamp(o.alpha, 0, 1); c.transform(ux, uy, -uy, ux, x, y); if (ux < 0) c.scale(1, -1);   // keep the crown up
  c.fillStyle = '#B5542A'; c.beginPath(); c.ellipse(-r * 1.05, r * 1.05, r * 0.95, r * 0.7, -0.5, 0, TAU); c.fill();
  c.fillStyle = '#1C6440'; c.beginPath(); c.ellipse(-r * 1.5, r * 0.15, r * 1.15, r * 0.75, -0.3, 0, TAU); c.fill();
  c.fillStyle = '#121010'; c.strokeStyle = 'rgba(255,248,226,.55)'; c.lineWidth = 1;
  c.beginPath(); c.moveTo(b0 - 2, r * 0.1); c.lineTo(b0 + L * 0.93, r * 0.06 + gp * S * 0.26); c.lineTo(b0 - 2, r * 0.46); c.closePath(); c.fill(); c.stroke();
  if (o.mood === 2 && gp > 0.2) { c.fillStyle = '#EE8FA0'; c.beginPath(); c.ellipse(b0 + L * 0.3, r * 0.3 + gp * S * 0.1, L * 0.2, r * 0.15, 0.3, 0, TAU); c.fill(); c.fillStyle = '#121010'; }
  c.beginPath(); c.moveTo(b0 - 2, -r * 0.3); c.lineTo(b0 + L, r * 0.04 - gp * S * 0.12); c.lineTo(b0 - 2, r * 0.14); c.closePath(); c.fill(); c.stroke();
  const gr = c.createRadialGradient(-r * 0.3, -r * 0.45, r * 0.1, 0, 0, r * 1.05); gr.addColorStop(0, '#86E6A6'); gr.addColorStop(0.45, '#2E9A5E'); gr.addColorStop(1, '#154A30');
  c.fillStyle = gr; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,248,226,.5)'; c.lineWidth = 1.2; c.stroke();
  c.fillStyle = '#F2EEE2'; c.beginPath(); c.ellipse(r * 0.38, r * 0.62, r * 0.46, r * 0.28, 0.3, 0, TAU); c.fill();
  const ex = r * 0.28, ey = -r * 0.16, er = r * 0.21; c.strokeStyle = '#0D0B0A'; c.fillStyle = '#0D0B0A'; c.lineWidth = Math.max(1.4, r * 0.13); c.lineCap = 'round';
  if (o.mood === 2) { c.beginPath(); c.moveTo(ex - er, ey - er); c.lineTo(ex + er * 0.6, ey); c.lineTo(ex - er, ey + er); c.stroke(); }   // screwed shut
  else if (o.mood === 1) { c.beginPath(); c.arc(ex, ey + er * 0.5, er, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }   // a happy squint
  else { c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.fill(); c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ex + er * 0.35, ey - er * 0.35, er * 0.32, 0, TAU); c.fill(); }
  c.restore();
  if (o.mood === 2) {   // stink lines rising off a bitter mouthful
    const a = clamp(o.alpha, 0, 1) * clamp((o.age - 0.16) / 0.12, 0, 1); if (a <= 0) return;
    c.save(); c.globalAlpha = a; c.strokeStyle = '#B4DC5A'; c.lineWidth = Math.max(1.6, S * 0.05); c.lineCap = 'round';
    for (let k = -1; k <= 1; k++) { const bx = x + k * r * 0.85, by = y - r * 1.3 - o.age * S * 0.4; c.beginPath(); for (let j = 0; j <= 6; j++) { const yy = by - j * r * 0.17, xx = bx + Det.sin(j * 1.6 + o.age * 14 + k) * r * 0.17; if (j) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); }
    c.restore();
  }
}
function bwJacFly(c, x, y, S, dir, t) {   // a young jacamar in flight, side view: long tail, long bill, rufous belly
  const r = S * 0.2, f = Det.sin(t * 22);
  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.fillStyle = '#1C6440'; c.beginPath(); c.moveTo(-r * 1.1, -r * 0.15); c.lineTo(-r * 4.2, -r * 0.55); c.lineTo(-r * 4.1, r * 0.2); c.closePath(); c.fill();
  c.fillStyle = '#B5542A'; c.beginPath(); c.ellipse(0, r * 0.15, r * 1.5, r * 0.68, 0, 0, TAU); c.fill();
  c.fillStyle = '#2E9A5E'; c.beginPath(); c.ellipse(-r * 0.2, -r * 0.22, r * 1.4, r * 0.48, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(r * 1.3, -r * 0.3, r * 0.62, 0, TAU); c.fill();
  c.fillStyle = '#F2EEE2'; c.beginPath(); c.ellipse(r * 1.55, r * 0.1, r * 0.35, r * 0.2, 0.3, 0, TAU); c.fill();
  c.fillStyle = '#121010'; c.beginPath(); c.moveTo(r * 1.8, -r * 0.42); c.lineTo(r * 4.1, -r * 0.15); c.lineTo(r * 1.8, -r * 0.02); c.closePath(); c.fill(); c.beginPath(); c.arc(r * 1.45, -r * 0.42, r * 0.12, 0, TAU); c.fill();
  c.fillStyle = '#237A4C'; c.beginPath(); c.moveTo(-r * 0.7, -r * 0.25); c.quadraticCurveTo(-r * 0.1, -r * (0.4 + 2.3 * f), r * 0.8, -r * 0.25); c.closePath(); c.fill();
  c.restore();
}
function bwChick(c, x, y, z, o) {   // a jacamar nestling in the burrow mouth: jacamar chicks hatch in long white down
  const r = z * 0.42 * (1 + 0.18 * (o.pop || 0)), fed = clamp(o.fed, 0, 1);
  c.save(); c.translate(x, y); c.fillStyle = '#EEE9DD';
  for (let j = 0; j < 9; j++) { const a = j * TAU / 9; c.beginPath(); c.arc(Det.cos(a) * r * 0.72, r * 0.2 + Det.sin(a) * r * 0.6, r * (0.38 + 0.08 * fed), 0, TAU); c.fill(); }
  c.beginPath(); c.arc(0, -r * 0.45, r * 0.6, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(200,190,170,.7)'; c.lineWidth = 0.8; c.beginPath(); for (const q of [[-0.5, -0.95], [0, -1.1], [0.35, -1]]) { c.moveTo(q[0] * r, q[1] * r * 0.9); c.lineTo(q[0] * r * 1.3, q[1] * r * 1.25); } c.stroke();   // wisps of down
  c.fillStyle = '#1A1412'; c.beginPath(); c.arc(r * 0.2, -r * 0.55, r * 0.11, 0, TAU); c.fill();
  if (o.gape) { c.fillStyle = '#E8B048'; c.beginPath(); c.moveTo(r * 0.45, -r * 0.42); c.lineTo(r * 1.3, -r * 0.85); c.lineTo(r * 1.25, -r * 0.05); c.closePath(); c.fill(); c.fillStyle = '#2A2220'; c.beginPath(); c.moveTo(r * 0.45, -r * 0.5); c.lineTo(r * 1.32, -r * 0.88); c.lineTo(r * 1.2, -r * 0.7); c.closePath(); c.fill(); }
  else { c.fillStyle = '#2A2220'; c.beginPath(); c.moveTo(r * 0.45, -r * 0.55); c.lineTo(r * 1.35, -r * 0.42); c.lineTo(r * 0.45, -r * 0.28); c.closePath(); c.fill(); }
  c.restore();
}
