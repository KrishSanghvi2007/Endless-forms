/* ================= v2/lichen.js: The Lichen Wood (Act 0, the template pilot; D1 §3.1, D2 §9, D5 §4 item 1) =================
   You are a bird with four hungry chicks. Each morning you peck the moths you can see on the bark; the moths you miss lay
   their eggs at dusk, winter culls the eggs at random down to the room the wood has, and the young take their places.
   Evolution is the by-product you watch, predict and explain. Four levels in a 15-minute box:
     L0 Too many moths  overproduction and a random winter cull; pin a moth: it never changes, its young vary around it.
     L1 The Lichen Wood one pale bark, polygenic shade, h² 0.8: drag where the young will land (R = h²S).
     L2 Mixed diets     larval diet adds environmental variance, h² 0.3: predictions must shrink.
     L3 Two barks       boss: 120 moths, four trunks, three looks; a search image; ghost jays copy your fitted rule.
                        Hunting the common look keeps all three alive (apostatic selection): it inverts L1's one best form.
   What if? (the freezer) reruns the last generation with one lever: no variation, no inheritance, eat at random; in L3
   the jays run fourteen generations with no search image, eating the rare, or one look hiding better.
   Code shape (D5 decision 23, API_v2 §9): a headless sim (plain JSON state, R()/Det/Gen only, a run is (seed, level,
   actions)); all words in LW_TEXT; the view juices from Sim.run's events only. Not a Hunt-mode chapter: Hunt has no replay,
   Freezer or bot sweep (engine_integration.md, risk 1), so the Wood keeps its own sim and reuses Rig, Pin, Predict,
   LiveGraph, Fx, Ghost, Lbl, Whisper, Live and Snd2.
   Load rule: top-level code touches only legacy objects and lower-numbered v2 files; every engine call made at run time is
   behind a typeof guard. Under ?v1=1 the learning-layer rewrites at the foot of this file are skipped. */

/* ---------- all words (API_v2 §9.2); tests/lint_text.js checks every budget ---------- */
const LW_TEXT = {
  firstWords: 'You are a bird with four hungry chicks. Tap a moth to eat it.',
  intro: {   // the opening description card (D6 decision 8; 00_entry.js Intro): 1–2 sentences, ≤ 35 words each
    game: 'You are a bird feeding four chicks in a lichen-covered wood. Each morning you eat the moths you spot; the moths you miss breed at dusk.',
    biology: 'Natural selection: moths vary in shade, and young resemble their parents. The moths you miss leave the young, so the population evolves towards the bark.',
    how: 'Tap a moth you can see to eat it, or use the arrows and Enter. Feed your chicks, then drag the diamond to predict where the young will land.'
  },
  hud: {
    hunt0: 'Each moth you eat feeds a chick.',
    hunt: 'Eat {n} more before the light goes flat.',
    huntHide: 'Hidden moths take longer to find. Eat {n} more before the light goes flat.',
    huntU: 'Eat {n} more. Each look costs one.',
    pin: 'Press and hold a moth to pin it.',
    dusk: 'Dusk. The moths you missed lay their eggs.',
    duskHungry: 'Dusk. A chick went hungry. The moths you missed lay their eggs.',
    jays: 'Dusk. Three jays hunt the other trunks by your rule.',
    eggs: '{e} eggs, and room in the wood for {k}.',
    eggsOnly: '{e} eggs laid.',
    ask0: 'How many eggs will see spring? Drag the line, then press Lock in.',
    cull: 'Winter. Most young die, whatever you did.',
    ask: 'Drag the diamond to where you expect the young to land, then press Lock in.',
    askTri: 'Tap the triangle where the wood will be after generation 6, then Lock in.',
    hatch: 'The young take their places.',
    hatchDiet: 'The young land. Each leaf they fed on shifted their shade.',
    named: 'The young kept {r}% of the shift. That is the realised h².',
    namedOver: 'The young moved further than the survivors’ edge: chance added to it this time.',
    namedNone: 'Chance swamped the response this time.',
    auto: 'The bird hunts by your rule.',
    wask: 'What if? Tap where fourteen more generations leave the wood, then Lock in.',
    wrun: 'Fourteen generations, run fast.',
    over: 'Season over.'
  },
  whispers: {
    miss: 'Only bark there.',
    streak: 'Same look again: quicker.',
    refocus: 'New look: refocus.',
    hit: 'Inside the band.',
    out: 'Outside the band.',
    none: 'No prediction: the diamond never moved.',
    drag: 'Drag the diamond first.',
    pinned: 'Pinned. Its look never changes.',
    random: 'Your beak lands at random.',
    untimed: 'Mornings are untimed now.',
    jays: 'The jays copy your rule.'
  },
  labels: {
    bark: 'Bark', eggs: 'Eggs', spring: 'Spring', eaten: 'Eaten', spared: 'Spared', young: 'Young', camo: 'Camouflage',
    band: 'Band', mottle: 'Mottle', speck: 'Speck', trunk: 'Trunk {n}', birch: 'Birch', oak: 'Oak', dot: 'Dot = {n} eggs',
    xn0: 'Eggs: ×N fewer', xn1: 'Selection: ×N stronger', xn3: 'Years: ×N faster', gen: 'Generation {g}', pinned: 'Pinned', h2: 'h² {h}', rule: 'Detect at', auto: 'Auto-hunt', untimed: 'Untimed',
    commit: 'Lock in', looks: '{n} looks', secs: '{n} s', places: '{k} places', b: 'b = {b}', diet: 'Your catch',
    avail: 'On trunk', common: 'Common first', ff: 'Tap: faster', mean: 'Mean', you: 'you', shift: 'R {r}', sel: 'S {s}', start: 'Start', jay: 'Jays', streak: 'Same look ×{n}'
  },
  interesting: {
    starved: 'Some chicks went hungry. The better hidden the moths get, the longer each takes to find.',
    starved0: 'Some chicks went hungry. Eat faster: there are far more moths than the chicks need.',
    starved3: 'Some chicks went hungry. Sticking to one look saves time; every switch costs you.',
    flat: 'Camouflage barely moved. Selection needs a difference in who survives. Did you eat the moths you could see?',
    lost: 'One look fell below 10%. Taking the rare looks, or plain chance, lets the common one spread.',
    vanished: 'One look vanished. Taking the rare looks, or plain chance, lets the common one spread.',
    novar: 'Nothing moved. Every moth looked alike, so there was nothing to choose between.',
    noinherit: 'You selected, yet the young came back to about the old average. Without inheritance, selection leaves no trace.',
    random: 'No steady push. The survivors were a fair sample, so the mean moved only by chance.',
    nosearch: 'The jays ate each look in proportion to its share. Only chance moved the looks.',
    rare: 'Eating the rare looks drove them down, and the commonest look is taking over.',
    rareNo: 'You ate the rare looks, but chance kept the commonest look from gaining this time.',
    hidden: 'The better-hidden look became the commonest. Your search image still kept the other looks alive.',
    hiddenMixed: 'All three looks persisted, though chance kept the better-hidden look from leading this time.',
    hiddenWon: 'The better-hidden look took over. Your rule did not take the common look often enough to protect the others.'
  },
  live: { gen: 'Generation {g}. {n} moths on the bark.', dusk: 'Dusk. You ate {n}. The rest lay eggs.', tri: 'Prediction open: tap the triangle. Press P for arrows.' },
  data: {
    gen: ['Generation', '{g} of {n}', 'Each morning is one generation.'], bar: 'gen {g} of {n} ≈', barAuto: 'gen {g} ≈',
    shares: ['Band, mottle, speck', 'Shares of the three looks in the whole wood.'], b: ['Fitted rule b', 'Above 1, you take the common look more than its share.'],
    S: ['Selection S', '{v} points', 'How much better hidden the survivors were.'], R: ['Response R', '{v} points', 'How far their young moved.'],
    h2: ['h² this generation', 'The inherited share of the variation.'], rs: ['Realised h²', 'R ÷ S this generation. Chance can push it above 1 or below 0.'],
    eggs: ['Eggs and places', '{e} eggs, {k} places', 'Far more eggs than room in the wood.'],
    titles: { bars: 'Too many moths', dots: 'This morning', trace: 'Mean camouflage', tri: 'Three looks', diet: 'Your diet' },
    axis: { gen: 'generation', real: 'real', exp: 'expected', now: 'now' },
    aria: { auto: 'Auto-hunt: the bird hunts by itself, by your rule.', commit: 'Lock in your prediction.', untimed: 'Untimed mornings: a number of looks instead of a clock.' }
  },
  levers: { novar: 'No variation', noinherit: 'No inheritance', random: 'Eat at random', nosearch: 'No search image', rare: 'Eat the rare', hidden: 'One hides better' },
  take: 'Selection keeps what the predator misses; only the inherited part of that difference reaches the next generation.',
  body: 'Speck began at 80%. Now: band {a}%, mottle {m}%, speck {sp}%. You took the commonest look {pc}% of the time, when it made up {av}% of its trunk. Taking it more than its share helps the rare looks.',
  whatifBody: ['This generation: S was {s} points and R was {r}. With a random beak, both are zero apart from chance.',
    'After fourteen more generations: band {a}%, mottle {m}%, speck {sp}%.',
    'This generation: S was {s} points and R was {r}. Without inheritance, R is zero apart from chance.',
    'This generation: S and R were both 0. With no variation there is nothing to select.'],
  law: { title: 'The hidden survive' },
  boss: { inverts: 'Hunting the common look keeps every look alive: no single best form wins.' },
  stars: {
    discover: 'Feed your chicks and keep all three looks alive in the boss.',
    predict: 'In Mixed diets, land two of three predictions inside the band.',
    transfer: 'Predict the boss triangle, or the young under No inheritance, inside the band.'
  },
  levelStars: [   // the unmet-star hint on each level card names only the stars that level can give
    { discover: 'Feed your chicks on two of three mornings, and pin a moth.' },
    { discover: 'Feed your chicks on four of five mornings, and raise camouflage 15 points.', transfer: 'On this card, try What if? No inheritance and predict the young.' },
    { discover: 'Feed your chicks on three of four mornings, selecting at least 8 points.', predict: 'Land two of three predictions inside the band.', transfer: 'On this card, try What if? No inheritance and predict the young.' },
    { discover: 'Feed your chicks on four of six mornings, and keep all three looks above 10%.', transfer: 'Tap the triangle inside the band at dusk 3.' }
  ],
  levelTake: [
    'Far more eggs are laid than the wood can hold. You only tilt which ones die.',
    'The young land near the survivors: most of the difference was inherited. R = h²S.',
    'Selection moves only what is inherited. When h² is low, a big S gives a small R.'
  ],
  levelBody: [
    'You ate {n} moths in three mornings. Each dusk the survivors laid about {e} eggs, and winter left {k}. Your pinned moth never changed.',
    'Camouflage went from {c0}% to {c1}%. Each generation your survivors were {s} points better hidden on average; their young kept {r}.',
    'Each generation your survivors were {s} points better hidden on average, but their young kept only {r}. Here larval diet sets much of a moth’s shade.',
    'You ate {n} moths in three mornings. Each dusk the survivors laid about {e} eggs, and winter left {k}.'
  ],
  model: [
    { level: 0, simulated: 'Moths on one trunk. However many survive, they lay 300 eggs between them, ten for every place in the wood. A random winter cull keeps 30.',
      simplification: 'Every moth lives one season. Winter is pure chance and ignores shade.',
      params: [{ name: 'places in the wood (K)', value: 30, tag: 'designed' }, { name: 'eggs per survivor', value: '20 (75 on the first morning)', tag: 'xN', real: 'hundreds per female' }, { name: 'strength of selection', value: 'half eaten', tag: 'xN', real: 'usually much weaker in the wild (peppered moths: s about 0.1 to 0.3 a generation)' }],
      cannot: 'Deaths from disease, parasitoids or weather before you see the moths.',
      nature: 'Moths lay hundreds of eggs each, and most young die before they breed.', contested: false, refs: ['majerus1998', 'darwin1859', 'haldane1924', 'cook2003'] },
    { level: 1, simulated: 'Shade is set by four genes of equal, additive effect, plus developmental noise. Heritability starts at 0.8 and falls as selection and chance use up variation (there is no new mutation).',
      simplification: 'One bark and one shade scale. Camouflage is the moth’s shade divided by the bark’s shade. Better-hidden moths take you longer to find.',
      params: [{ name: 'heritability h²', value: 0.8, tag: 'designed' }, { name: 'bark shade', value: 0.85, tag: 'designed' }, { name: 'search time', value: '0.6 s × camouflage', tag: 'designed' }, { name: 'generations', value: 5, tag: 'xN', real: 'decades of selection' }, { name: 'strength of selection', value: 'half eaten', tag: 'xN', real: 'usually much weaker in the wild (peppered moths: s about 0.1 to 0.3 a generation)' }],
      cannot: 'Real peppered moth colour, which rests mainly on one gene.',
      nature: 'Breeders write R = h²S. In real peppered moths, the black form depends mainly on one gene.', contested: false, refs: ['lush1937', 'falconer1996', 'vanthof2016', 'haldane1924', 'cook2003'] },
    { level: 2, simulated: 'The same genes, but larval diet now adds much more variation that is not inherited. Heritability is about 0.3.',
      simplification: 'Diet effects are random and never passed on.',
      params: [{ name: 'heritability h²', value: 0.3, tag: 'designed' }, { name: 'generations', value: 4, tag: 'xN', real: 'decades of selection' }, { name: 'strength of selection', value: 'half eaten', tag: 'xN', real: 'usually much weaker in the wild' }],
      cannot: 'Genes and environment that interact, or diets that run in families.',
      nature: 'Most traits are partly inherited. Breeders see a smaller response when much variation comes from the environment.', contested: false, refs: ['falconer1996'] },
    { level: 3, simulated: '120 moths on four trunks, two birch and two oak. Dark-banded and pale-mottled are dominant looks; grey-speckled shows only without either.',
      simplification: 'Designed: your fitted rule stands in for every jay in the wood. The three looks differ only in pattern, so they hide equally well. The rule b lumps every reason you took a look more than its share.',
      params: [{ name: 'moths in the wood (K)', value: 120, tag: 'designed' }, { name: 'start: speck, band, mottle', value: '80%, 10%, 10%', tag: 'designed' }, { name: 'fitted rule b', value: '0.5 to 3', tag: 'designed' }, { name: 'search image: same look', value: '½ s quicker', tag: 'designed' }, { name: 'search image: a switch', value: '¾ s slower', tag: 'designed' }, { name: 'generations', value: 6, tag: 'xN', real: 'decades' }, { name: 'strength of selection', value: 'half of every trunk eaten', tag: 'xN', real: 'usually much weaker in the wild' }],
      cannot: 'How real jays learn and forget, or habitats that differ in size.',
      nature: 'Blue jays form search images, and blue jays hunting digital moths kept several looks alive.', contested: false, refs: ['pietrewicz1979', 'bond1998', 'bond1999', 'bond2002'] }
  ],
  why: {   // the boss's Why? (and the unit default); levelWhy holds L0–L2
    real: ['Blue jays once hunted digital moths on a screen. The moths they missed were bred for the next screen. Camouflage improved, and several looks persisted, probably because jays look hardest for what they have seen lately.'],
    maths: ['In the boss, your catch is fitted to a rule. Each look is taken in proportion to its share on the trunk, raised to a power b. Above 1, you take the common look more than its share.']
  },
  levelWhy: [
    { real: ['A female moth lays hundreds of eggs, yet a wood holds about as many moths each year. So almost all the young die before they breed. Darwin built his argument on this.'],
      maths: ['Three hundred eggs for thirty places: about nine in ten young must die, whatever their shade. Your beak only tilts which ones.'] },
    { real: ['Real peppered moth colour rests mostly on one gene. The black form spread in industrial Britain after 1848. This wood uses a designed species with four genes, to show the logic first.'],
      maths: ['S is how much better hidden the survivors were than their whole generation. R is how far their young moved. Breeders write R = h²S. Here h² is the inherited share of the variation.'] },
    { real: ['Breeders found that selecting hard on a trait with low heritability gives only a small response. Much of the variation came from food, weather and chance, and none of that is passed on.'],
      maths: ['R = h²S still holds. With h² about 0.3, the young keep about a third of S. So a big S gives a small R.'] }
  ]
};

/* ---------- the four levels (sim parameters; P below holds the tunable, tagged values) ---------- */
const LW_LEVELS = [
  { gens: 3, first: { N: 8, quota: 4, time: 20 }, m0: 0.30, s0: 0.13, ask: { 2: 'count' } },   // ve follows P.h2; K and N follow P.K
  { gens: 5, m0: 0.30, s0: 0.13, ask: { 1: 'x', 2: 'x', 3: 'x' }, time: 14 },   // 14 s mornings: hidden moths cost search time (P.find)
  { gens: 4, m0: 0.32, s0: 0.10, ask: { 1: 'x', 2: 'x', 3: 'x' }, time: 14 },   // ve follows P.h2diet
  { gens: 6, trunks: 4, ve: 0.03, m0: 0.55, s0: 0.04, ask: { 3: 'tri' } }   // K = 4 × P.K; gens = P.gens
];
const LW_T = { dawn: 0.8, fall: 0.5, eggs: 0.9, cull: 0.7, hatch: 0.9, askMax: 30, auto: 0.7, autoGens: 14 };
const LW_D = [1, 1, 1];   // detectability of band, mottle, speck: the looks differ only in pattern (D1), so they hide equally well

const CH_LICHEN_V2 = {
  id: 'lichen', v2: true, role: 'environment', place: 'wood', accent: '#6F8A45',   // the chapter's chrome tint (D6 decision 7)
  intro: { goal: 'Feed your chicks; watch the hidden moths become common.' },
  content: LW_TEXT,
  P: {
    K: { v: 30, tag: 'designed', min: 10, max: 60, label: 'places in the wood' },
    eggs: { v: 10, tag: 'xN', min: 2, max: 40, real: 'hundreds of eggs per female', label: 'eggs per place' },
    quota: { v: 15, tag: 'designed', min: 6, max: 20, label: 'moths a morning' },
    time: { v: 12, tag: 'designed', min: 8, max: 30, label: 'seconds a morning' },
    miss: { v: 0.5, tag: 'designed', min: 0, max: 2, label: 'cost of a miss' },
    h2: { v: 0.8, tag: 'designed', min: 0, max: 1, label: 'heritability' },
    h2diet: { v: 0.3, tag: 'designed', min: 0, max: 1, label: 'heritability, mixed diets' },
    find: { v: 0.6, tag: 'designed', min: 0, max: 2, label: 'search time × camouflage' },
    streak: { v: 0.5, tag: 'designed', min: 0, max: 2, label: 'same-look refund' },
    switchCost: { v: 0.75, tag: 'designed', min: 0, max: 2, label: 'refocus cost' },
    gens: { v: 6, tag: 'xN', min: 3, max: 20, real: 'decades', label: 'boss generations' }
  },
  levels: [
    { name: 'Too many moths', adds: 'overproduction', codes: ['A0'], minutes: 2 },
    { name: 'The Lichen Wood', adds: 'heritable shade', codes: ['B1'], minutes: 4 },
    { name: 'Mixed diets', adds: 'environmental variance', codes: ['B2'], minutes: 3 },
    { name: 'Two barks', adds: 'three looks', codes: ['B5'], minutes: 5 }
  ],
  keys: { ArrowLeft: 'previous moth', ArrowRight: 'next moth', Enter: 'peck the moth', Space: 'peck or speed dusk', B: 'auto-hunt', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Where did the mean camouflage go each generation, and why?', 'One morning your realised h² came out above 1. How can that happen?', 'The ghost jays copy your rule. What does that assume about real jays?'], pool: 'trace',
    pools: [{ k: 'h2', x: 'true h²', y: 'realised h² (R ÷ S)', levels: [1, 2] }, { k: 'b', x: 'fitted rule b', y: 'looks kept at 10% or more', levels: [3] }] },   // D1 §3.1 class pools; result codes carry both (resultBits)
  starTraits: ['tone'],
  encodings: [   // the scored trait is shade (luminance); the boss looks are pattern stencils (and letters in the charts), never hue
    { k: 'tone', rgb: [205, 207, 189], channels: ['luminance'] },
    { k: 'dark moth', rgb: [82, 84, 74], channels: ['luminance'] },
    { k: 'band', rgb: [110, 106, 96], channels: ['pattern', 'letter', 'luminance'] },
    { k: 'mottle', rgb: [150, 147, 135], channels: ['pattern', 'letter', 'luminance'] },
    { k: 'speck', rgb: [128, 125, 114], channels: ['pattern', 'letter', 'luminance'] }
  ],


  /* ================= headless simulation (API_v2 §9.3): R(), Det, Gen only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null, _lay: {},
    cfg(level) {   // the level's parameters, with the tunables in P applied (the scene lab's sliders reach the sim here)
      const n = Math.max(0, Math.min(3, level | 0)), c = LW_LEVELS[n], P = CH_LICHEN_V2.P, K = n === 3 ? 4 * P.K.v : P.K.v;
      const h2 = n === 2 ? P.h2diet.v : P.h2.v, ve = n === 3 ? c.ve : Math.round(c.s0 * Math.sqrt((1 - Math.min(0.99, Math.max(0.05, h2))) / Math.min(0.99, Math.max(0.05, h2))) * 10000) / 10000;
      return Object.assign({}, c, { K, N: K, ve, gens: n === 3 ? P.gens.v : c.gens });
    },
    lay(level, ve) {   // tone: four additive loci; A (dark band) and B (pale mottle): dominant loci, A epistatic over B
      const c = this.cfg(level), v = ve == null ? c.ve : ve, key = level + ':' + v;
      if (!this._lay[key]) this._lay[key] = Gen.layout([
        { k: 'tone', n: 4, m0: c.m0, s0: c.s0, mu: 0, msd: 0, ve: v, det: true },
        { k: 'A', n: 1, kind: 'dom', p0: 0, mu: 0, det: true },
        { k: 'B', n: 1, kind: 'dom', p0: 0, mu: 0, det: true }]);
      return this._lay[key];
    },
    L() { const s = this.s; return this.lay(s.level, s.ve0 ? 0 : null); },
    morphOf(lay, g) { return Gen.dom(lay, g, 'A') ? 0 : Gen.dom(lay, g, 'B') ? 1 : 2; },   // 0 band, 1 mottle, 2 speck
    bark(s) { return s.level === 3 ? (s.trunk % 2 ? 0.42 : 0.80) : 0.85; },   // designed bark shades: lichen 0.85; birch 0.80, oak 0.42
    idx(s, m) { return m.t / 0.85; },   // camouflage index on the one pale bark: shade ÷ bark shade (D1: linear in genotype)
    vis(s, m) { return s.level !== 3 || m.tr === s.trunk; },
    live(s) { const out = []; s.moths.forEach((m, i) => { if (m.a === 1 && this.vis(s, m)) out.push(i); }); return out; },
    counts(s, list) { const n = [0, 0, 0]; for (const m of list) n[m.m]++; return n; },
    shares(list) { const n = this.counts(null, list), t = n[0] + n[1] + n[2] || 1; return [n[0] / t, n[1] / t, n[2] / t]; },
    mk(g, lay, mo, fa) {   // the boss looks differ only in pattern (D1): shade comes from the tone loci alone, so no look hides better on one bark
      const s = this.s, m = this.morphOf(lay, g), t = Gen.ph(lay, g, 'tone');
      return { id: s.idBase + s.nextId++, g, t: Math.max(0, Math.min(1, t)), m, x: 0, y: 0, tr: 0, a: 1, mo, fa };
    },
    places(n) {   // positions in the unit bark square, spaced; all R() draws of a dawn happen here and in breed()
      const pts = [], minD = Math.min(0.16, Math.sqrt(1 / Math.max(1, n)) * 0.55);
      for (let k = 0; k < n; k++) {
        let best = null, bd = -1;
        for (let t = 0; t < 30; t++) {
          const p = { x: 0.04 + 0.92 * R(), y: 0.04 + 0.92 * R() }; let dm = 1e9;
          for (const q of pts) { const dx = q.x - p.x, dy = q.y - p.y, dd = dx * dx + dy * dy; if (dd < dm) dm = dd; }
          if (dm > minD * minD) { best = p; break; } if (dm > bd) { bd = dm; best = p; }
        }
        pts.push(best);
      }
      return pts;
    },
    seat(list) {   // trunks (L3: an equal share on each of four) and places
      const s = this.s;
      if (s.level === 3) {
        const ix = list.map((_, i) => i); for (let i = ix.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0, t = ix[i]; ix[i] = ix[j]; ix[j] = t; }
        ix.forEach((j, k) => { list[j].tr = k % 4; });
        for (let t = 0; t < 4; t++) { const on = list.filter(m => m.tr === t), pts = this.places(on.length); on.forEach((m, k) => { m.x = pts[k].x; m.y = pts[k].y; }); }
      } else { const pts = this.places(list.length); list.forEach((m, k) => { m.x = pts[k].x; m.y = pts[k].y; }); }
    },

    reset(level, o) {
      o = o || {}; const c = this.cfg(level), PO = o.P || {};
      if (o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.s.test = this.s.test || {}; this.lever(o.thaw.lever); return; }
      const unt = !!(Save.d && Save.d.ui && Save.d.ui.unt);
      this.s = { level: level | 0, gen: 1, gens: PO.gens || c.gens, phase: 'dawn', dk: '', t: 0, unt, time: 0, looks: null, quota: 15, eaten: 0, fed: [0, 0, 0, 0],
        moths: [], next: null, brood: null, trunk: 0, nextId: 1, idBase: (level + 1) * 100000, ve0: false,
        hist: [], camo: [], trail: [], asks: [], pred: {}, exp: {}, tol: {}, hits: {}, test: {}, ask: null, askAt: '',
        pins: [], fedMorn: 0, auto: false, rule: level === 3 ? 0.2 : 0.5, autoT: 0, si: null, diet: null, mornings: [], b: null, jays: null, d: LW_D.slice(),
        whatif: null, wb: null, wgen: 0, firstPeck: false, named: false, reveal: null, log: [] };
      const s = this.s, lay = this.lay(level);
      if (level === 3) {   // the designed start: 10% Aa bb (band), 10% aa Bb (mottle), 80% aa bb (speck): 12, 12 and 96 of 120
        for (let i = 0; i < c.N; i++) {
          const g = Gen.genome(lay); g[lay.T.A.off] = 0; g[lay.L + lay.T.A.off] = 0; g[lay.T.B.off] = 0; g[lay.L + lay.T.B.off] = 0;
          if (i < Math.round(c.N / 10)) g[lay.T.A.off] = 1; else if (i < 2 * Math.round(c.N / 10)) g[lay.T.B.off] = 1;
          s.moths.push(this.mk(g, lay, 0, 0));
        }
      } else { const n = c.first ? c.first.N : c.N; for (let i = 0; i < n; i++) s.moths.push(this.mk(Gen.genome(lay), lay, 0, 0)); }
      this.seat(s.moths);
      this.morning([]);
    },
    lever(k) {   // What if?: the frozen generation, one thing changed (D1 G9)
      const s = this.s; s.whatif = k; s.pins = []; s.firstPeck = true;
      if (s.level === 3) {   // the vial is the final hatch: finish it, then the jays run fourteen generations by the lever's rule
        if (s.next) { s.moths = s.next; s.next = null; s.brood = null; s.gen++; }
        s.d = LW_D.slice(); s.wb = k === 'nosearch' ? 1 : k === 'rare' ? 0.5 : (s.b || 1); if (k === 'hidden') s.d[1] = 0.6;
        s.wgen = 0; s.trail = [this.shares(s.moths)]; s.phase = 'ask'; s.t = 0;
        this.openAsk([], 'wtri');
        return;
      }
      s.gens = s.gen;   // L0–L2: replay the last generation only
      if (k === 'novar') {   // every moth gets the population's mean genome, and development adds no noise
        const lay = this.L(), avg = new Float32Array(lay.L * 2);
        for (const m of s.moths) for (let j = 0; j < lay.L; j++) { const v = (m.g[j] + m.g[lay.L + j]) / (2 * s.moths.length); avg[j] += v; avg[lay.L + j] += v; }   // both copies alike: the young are clones too
        s.ve0 = true; const lay0 = this.L();
        for (const m of s.moths) { m.g = Float32Array.from(avg); m.t = Gen.add(lay0, m.g, 'tone'); }
        if (s.camo.length) s.camo[s.camo.length - 1] = this.mean(s.moths.map(m => this.idx(s, m)));
      }
    },

    morning(ev) {
      const s = this.s, c = this.cfg(s.level), first = c.first && s.gen === 1;
      s.phase = 'dawn'; s.t = 0; s.eaten = 0; s.fed = [0, 0, 0, 0]; s.dk = '';
      s.quota = first ? c.first.quota : CH_LICHEN_V2.P.quota.v; s.time = first ? c.first.time : c.time || CH_LICHEN_V2.P.time.v; s.time0 = s.time;
      s.looks = s.unt ? Math.max(6, Math.round(s.quota * 4 / 3)) : null;
      if (s.level === 3) {
        s.trunk = (s.gen - 1) % 4; s.si = { last: -1, run: 0 };
        s.diet = { avail: this.counts(s, s.moths.filter(m => m.tr === s.trunk)), catches: [] };
        s.trail.push(this.shares(s.moths));
      } else s.camo.push(this.mean(s.moths.map(m => this.idx(s, m))));
      ev.push({ k: 'dawn', gen: s.gen });
    },
    mean(a) { let t = 0; for (const v of a) t += v; return a.length ? t / a.length : 0; },
    sd(a) { const m = this.mean(a); let v = 0; for (const x of a) v += (x - m) * (x - m); return a.length > 1 ? Math.sqrt(v / a.length) : 0; },

    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt;
      if (s.phase === 'dawn') { if (s.t >= LW_T.dawn) { s.phase = 'hunt'; s.t = 0; ev.push({ k: 'hunt' }); } }
      else if (s.phase === 'hunt') {
        if (s.looks == null) { s.time -= dt; if (s.time <= 0) { s.time = 0; this.endMorning(ev); return ev; } }
        if (s.auto) { s.autoT += dt; if (s.autoT >= (s.looks == null ? 0.6 : 0.35)) { s.autoT = 0; this.autoPeck(ev); } }
      } else if (s.phase === 'dusk') this.duskStep(ev);
      else if (s.phase === 'ask') { if (!s.unt && s.t > LW_T.askMax) this.commit(ev, s.ask.id, null); }
      else if (s.phase === 'hatch') { if (s.t >= LW_T.hatch) this.nextGen(ev); }
      else if (s.phase === 'auto') { if (s.t >= LW_T.auto) { s.t = 0; this.autoGen(ev); } }
      return ev;
    },
    fallT(s) { return s.level === 3 && s.jays ? 1.6 : LW_T.fall; },   // the boss dusk waits for the ghost jays
    duskStep(ev) {
      const s = this.s, c = this.cfg(s.level);
      if (s.dk === 'fall' && s.t >= this.fallT(s)) { s.dk = 'eggs'; s.t = 0; ev.push({ k: 'eggs', E: s.brood.E, K: s.brood.K }); }
      else if (s.dk === 'eggs' && s.t >= LW_T.eggs) {
        if (!s.whatif && c.ask[s.gen] === 'count') { this.openAsk(ev, 'count'); return; }
        s.dk = 'cull'; s.t = 0; ev.push({ k: 'cull' });
      } else if (s.dk === 'cull' && s.t >= LW_T.cull) {
        const kind = s.whatif ? (s.whatif === 'noinherit' ? 'x' : null) : c.ask[s.gen];
        if (kind && kind !== 'count') { this.openAsk(ev, kind); return; }
        this.hatch(ev);
      }
    },

    /* ---------- the morning: pecks, misses, the search image, the bird's rule ---------- */
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      if (a.k === 'peck' && (s.phase === 'hunt' || s.phase === 'dawn')) {
        if (s.phase === 'dawn') { s.phase = 'hunt'; s.t = 0; }   // the first action cannot fail: a peck at dawn starts the morning and counts
        let i = a.i | 0, m = s.moths[i];
        if (!m || m.a !== 1 || !this.vis(s, m)) return this.miss(ev, 0.5, 0.5);
        if (s.whatif === 'random') { const L = this.live(s); i = L[(R() * L.length) | 0]; m = s.moths[i]; ev.push({ k: 'random' }); }
        this.eat(ev, i, false);
      } else if (a.k === 'miss' && s.phase === 'hunt') this.miss(ev, +a.x || 0.5, +a.y || 0.5);
      else if (a.k === 'pin') { const m = s.moths[a.i | 0]; if (m && m.a === 1 && this.canPin(s) && s.pins.indexOf(m.id) < 0) { s.pins.push(m.id); ev.push({ k: 'pin', i: a.i | 0 }); } }
      else if (a.k === 'auto') { s.auto = !!a.on; s.autoT = 0; }
      else if (a.k === 'rule') s.rule = Math.max(0, Math.min(1, +a.v || 0));
      else if (a.k === 'unt') this.untimed(ev, !!a.on);
      else if (a.k === 'predict' && s.ask && a.id === s.ask.id) this.commit(ev, a.id, a.moved === false ? null : a.v);   // a ghost never moved is no prediction: no star for a click
      else if (a.k === 'void' && s.pred[a.id] != null) { s.pred[a.id] = null; s.hits[a.id] = false; ev.push({ k: 'void', id: a.id }); }   // the view's follow-up when the widget committed an unmoved ghost (soft timer, re-tap)
      return ev;
    },
    canPin(s) { return s.level === 0 && s.gen > 1 && !s.whatif && (s.phase === 'hunt' || s.phase === 'dawn'); },   // pinning is taught (and needed) only in L0's later mornings
    untimed(ev, on) {   // the player's untimed switch (offered after two hungry mornings): a number of looks replaces the clock, from now on
      const s = this.s; if (s.unt === on) return; s.unt = on;
      if (s.phase === 'hunt' || s.phase === 'dawn') s.looks = on ? Math.max(6, Math.round(Math.max(1, s.quota - s.eaten) * 4 / 3)) : null;
      if (!on && s.time <= 0) s.time = 1;
      ev.push({ k: 'unt', on });
    },
    findCost(s, m) { return s.level === 1 || s.level === 2 ? CH_LICHEN_V2.P.find.v * Math.max(0, Math.min(1, this.idx(s, m))) : 0; },   // designed: a better-hidden moth takes longer to find (L1–L2)
    miss(ev, x, y) {
      const s = this.s, c = this.cfg(s.level), free = c.first && s.gen === 1;   // L0's first morning cannot fail: a miss there costs nothing
      if (s.looks != null) s.looks--; else if (!free) s.time = Math.max(0, s.time - CH_LICHEN_V2.P.miss.v);
      ev.push({ k: 'miss', x, y, free });
      if (s.looks != null && s.looks <= 0) this.endMorning(ev);
    },
    eat(ev, i, auto) {
      const s = this.s, m = s.moths[i];
      const avail = s.level === 3 ? this.counts(s, s.moths.filter(q => q.a === 1 && q.tr === s.trunk)) : null;
      m.a = 0; s.eaten++; const chick = (s.eaten - 1) % 4; s.fed[chick]++;
      if (s.looks != null) s.looks--;
      const e = { k: 'peck', i, chick, auto: !!auto, first: !s.firstPeck }; s.firstPeck = true;
      const cost = s.looks == null ? this.findCost(s, m) : 0; if (cost > 0) { s.time = Math.max(0, s.time - cost); e.cost = Math.round(cost * 100) / 100; }   // evolution makes the hunt harder
      if (s.level === 3) {
        s.diet.catches.push({ m: m.m, avail });
        const P = CH_LICHEN_V2.P, si = s.si;
        if (si.last === m.m) { si.run++; if (s.looks == null) s.time = Math.min(P.time.v, s.time + P.streak.v); e.streak = si.run; }
        else if (si.last >= 0) { si.run = 1; if (s.looks == null) s.time = Math.max(0, s.time - P.switchCost.v); else s.looks--; e.refocus = true; }
        else si.run = 1;
        si.last = m.m;
      }
      ev.push(e);
      if (s.eaten >= s.quota) { ev.push({ k: 'fed' }); this.endMorning(ev); }
      else if ((s.looks != null && s.looks <= 0) || (s.looks == null && s.time <= 0)) this.endMorning(ev);
    },
    consp(s, m) { return Math.max(0, Math.min(1, 1 - m.t / this.bark(s))); },
    autoPeck(ev) {   // the non-visual path (D2 §13): the bird takes the most conspicuous moth at or above your threshold; in the boss, by commonness
      const s = this.s, L = this.live(s); if (!L.length) return;
      let pick = -1;
      if (s.level === 3) {
        const n = this.counts(s, L.map(i => s.moths[i])), tot = L.length, b = 0.5 + 2.5 * s.rule, w = n.map(v => v ? Det.pow(v / tot, b) : 0);
        let u = R() * (w[0] + w[1] + w[2]), k = 0; for (; k < 2; k++) { u -= w[k]; if (u < 0 && w[k] > 0) break; } if (!w[k]) k = w.findIndex(v => v > 0);
        const pool = L.filter(i => s.moths[i].m === k); pick = pool[(R() * pool.length) | 0];
      } else { let bc = -1; for (const i of L) { const c = this.consp(s, s.moths[i]); if (c >= s.rule && c > bc) { bc = c; pick = i; } } }
      if (pick < 0) { if (s.looks != null) this.endMorning(ev); return; }
      this.eat(ev, pick, true);
    },

    /* ---------- dusk: the record, the ghost jays, the bag, breeding (every R() draw of a dusk happens here) ---------- */
    endMorning(ev) {
      const s = this.s; if (s.phase !== 'hunt' && s.phase !== 'dawn') return;
      const per = s.quota / 4, short = Math.max(0, s.quota - s.eaten), starved = Math.min(4, short > 0 ? Math.ceil(short / per - 1e-9) : 0);
      if (starved <= 1) s.fedMorn++;   // a fed morning: at least three chicks fed (80% of the quota), so the pace is a slope, not a cliff
      s.phase = 'dusk'; s.dk = 'fall'; s.t = 0;
      const rec = { gen: s.gen, eaten: s.eaten, starved, quota: s.quota };
      if (s.level === 3) {
        s.mornings.push(s.diet); while (s.mornings.length > 3) s.mornings.shift();
        if (!s.whatif) this.jays();
        rec.b = s.b; rec.dawn = s.trail[s.trail.length - 1]; rec.catch = this.counts(s, s.diet.catches); rec.avail = s.diet.avail.slice();
      } else {
        const lay = this.L(), all = s.moths, surv = all.filter(m => m.a === 1), iv = m => this.idx(s, m);
        const bv = all.map(m => Gen.add(lay, m.g, 'tone')), sb = this.sd(bv), va = sb * sb, ve = s.ve0 ? 0 : lay.T.tone.ve;
        rec.mAll = this.mean(all.map(iv)); rec.mSurv = surv.length ? this.mean(surv.map(iv)) : rec.mAll; rec.S = rec.mSurv - rec.mAll;
        rec.h2 = va + ve * ve > 0 ? va / (va + ve * ve) : 0; rec.sdP = this.sd(all.map(iv));
        rec.vals = all.map(iv); rec.ev = all.filter(m => m.a !== 1).map(iv); rec.sv = surv.map(iv);
      }
      s.hist.push(rec);
      this.breed();
      ev.push({ k: 'dusk', starved, eaten: s.eaten });
    },
    fitB(ms, lo, hi, d) {   // maximum likelihood b for "catch share of look i ∝ dᵢ·aᵢ^b" over every catch of the last mornings; Det maths, 0.01 grid
      const obs = [];
      for (const m of ms || []) for (const c of m.catches || []) { const tot = c.avail[0] + c.avail[1] + c.avail[2]; if (c.avail[c.m] > 0 && tot > 0) obs.push({ m: c.m, la: c.avail.map(v => v > 0 ? Det.log(v / tot) : null) }); }
      if (!obs.length) return 1;
      const ll = b => { let t = 0; for (const o of obs) { let den = 0; for (let k = 0; k < 3; k++) if (o.la[k] != null) den += d[k] * Det.exp(b * o.la[k]); t += Det.log(d[o.m]) + b * o.la[o.m] - Det.log(den); } return t; };
      let best = 1, bv = -Infinity, v0 = null, flat = true;
      for (let i = 0; i <= 250; i++) { const b = lo + (hi - lo) * i / 250, v = ll(b); if (v0 == null) v0 = v; else if (Math.abs(v - v0) > 1e-9) flat = false; if (v > bv + 1e-12) { bv = v; best = b; } }
      return flat ? 1 : Math.round(best * 100) / 100;
    },
    take(on, n, b, d, rnd) {   // n catches on one trunk, each look with share ∝ dᵢ·aᵢ^b of what is left (rnd: R or a private PRNG)
      const got = [];
      for (let k = 0; k < n && on.length; k++) {
        const c = [0, 0, 0]; for (const m of on) c[m.m]++;
        const w = c.map((v, i) => v ? d[i] * Det.pow(v / on.length, b) : 0), tot = w[0] + w[1] + w[2];
        let u = rnd() * tot, j = 0; for (; j < 2; j++) { u -= w[j]; if (u < 0 && w[j] > 0) break; } if (!w[j]) j = w.findIndex(v => v > 0);
        const pool = []; for (let q = 0; q < on.length; q++) if (on[q].m === j) pool.push(q);
        const q = pool[(rnd() * pool.length) | 0]; got.push(on[q]); on.splice(q, 1);
      }
      return got;
    },
    jays() {   // designed: three ghost jays replay your fitted rule on the trunks you did not hunt (D1 §3.1, L3)
      const s = this.s; s.b = this.fitB(s.mornings, 0.5, 3, s.d); s.jays = [];
      for (let t = 0; t < 4; t++) {
        if (t === s.trunk) continue;
        const on = s.moths.filter(m => m.tr === t && m.a === 1), got = this.take(on, s.eaten, s.b, s.d, R);
        for (const m of got) m.a = 2;
        s.jays.push({ tr: t, got: got.map(m => m.m), left: on.map(m => m.m) });
      }
    },
    breed() {   // survivors lay ten eggs for every place; a random winter cull keeps K; genomes only for the kept eggs
      const s = this.s, c = this.cfg(s.level), lay = this.L(), K = c.K, E = Math.round(K * CH_LICHEN_V2.P.eggs.v);
      let par = s.moths.filter(m => m.a === 1); if (par.length < 2) par = s.moths.slice();
      const gpool = s.whatif === 'noinherit' ? s.moths : par;   // no inheritance: the young come from the whole generation, eaten or not
      const mom = new Array(E); for (let i = 0; i < E; i++) mom[i] = (R() * par.length) | 0;
      const ix = []; for (let i = 0; i < E; i++) ix.push(i);
      for (let i = 0; i < K; i++) { const j = i + ((R() * (E - i)) | 0), t = ix[i]; ix[i] = ix[j]; ix[j] = t; }
      const keep = ix.slice(0, K).sort((a, b) => a - b), cnt = par.map(() => 0), kept = par.map(() => 0);
      for (const m of mom) cnt[m]++;
      const young = [];
      for (const e of keep) {
        kept[mom[e]]++;
        let a = par[mom[e]], b = null;
        if (gpool !== par) { a = gpool[(R() * gpool.length) | 0]; }
        for (let tr = 0; tr < 7; tr++) { b = gpool[(R() * gpool.length) | 0]; if (b !== a) break; }
        young.push(this.mk(Gen.mate(lay, a.g, b.g), lay, a.id, b.id));
      }
      this.seat(young);
      s.brood = { E, K, moms: par.map(m => m.id), cnt, kept }; s.next = young;
    },

    /* ---------- predictions: a gesture on the live graph, scored against the expectation for the parameters in force ---------- */
    openAsk(ev, kind) {
      const s = this.s, rec = s.hist[s.hist.length - 1], id = 'L' + s.level + 'g' + s.gen + (s.whatif ? 'w' : '');
      let ask;
      if (kind === 'count') { ask = { id, kind: 'y', lo: 0, hi: s.brood.E, tol: Math.max(6, Math.round(s.brood.K / 4)), start: s.brood.E }; s.exp[id] = s.brood.K; }
      else if (kind === 'x') {   // the ghost starts off the data, at the axis's left end: leaving it there never scores, and a tap anywhere on the data places it
        const ni = s.whatif === 'noinherit', h2 = ni ? 0 : rec.h2, e = rec.mAll + h2 * rec.S;
        ask = { id, kind: 'x', lo: 0, hi: 1, tol: ni ? Math.max(0.4 * Math.abs(rec.S), 0.01) : Math.max(0.5 * Math.abs(h2 * rec.S), 0.015), start: 0, base: rec.mAll };
        s.exp[id] = Math.max(0, Math.min(1, e)); s.test[id] = Math.abs(s.exp[id] - rec.mAll) > ask.tol;   // a test only when "no change" would miss (weak selection makes it a free answer)
      } else if (kind === 'tri') {   // the wood after generation 6, from 200 replays of your fitted rule on all four trunks
        ask = { id, kind: 'tri', tol: 0.1, start: [0.5, 0.5, 0] }; s.exp[id] = this.replay(s.next, s.gens - s.gen, s.b || 1, s.d, 200, 9001 + s.gen);   // the ghost starts on the band–mottle edge ("no speck at all"), far from every plausible answer
      } else if (kind === 'wtri') {   // What if?: fourteen generations under the lever's rule (shown, never starred)
        ask = { id, kind: 'tri', tol: 0.12, start: [0.5, 0.5, 0] }; s.exp[id] = this.replay(s.moths, LW_T.autoGens, s.wb, s.d, 200, 7777);
      }
      s.ask = ask; s.asks.push(id); s.tol[id] = ask.tol; s.askAt = s.phase === 'dusk' ? s.dk : s.phase; s.phase = 'ask'; s.t = 0;
      ev.push({ k: 'ask', id, kind: ask.kind });
    },
    commit(ev, id, v) {
      const s = this.s, ask = s.ask; if (!ask || ask.id !== id) return;
      s.ask = null; s.pred[id] = v == null ? null : Array.isArray(v) ? this.norm3(v) : +v;
      const e = s.exp[id], err = v == null ? Infinity : ask.kind === 'tri' ? this.triErr(s.pred[id], e) : Math.abs(s.pred[id] - e);
      s.hits[id] = err <= ask.tol;
      if (s.hits[id] && ask.base != null && !s.whatif) { const d = e - ask.base; s.hits[id] = (s.pred[id] - ask.base) * Math.sign(d) >= 0.5 * Math.abs(d) - 1e-9; }   // at least halfway from "no change" to the expectation (the band's own edge unless it is floored)
      ev.push({ k: 'commit', id, v: s.pred[id], none: v == null });
      if (ask.kind === 'tri' && s.whatif) { s.phase = 'auto'; s.t = 0; ev.push({ k: 'auto' }); return; }
      if (s.askAt === 'eggs') { s.phase = 'dusk'; s.dk = 'cull'; s.t = 0; ev.push({ k: 'cull', reveal: id }); return; }
      s.reveal = id; this.hatch(ev);
    },
    norm3(v) { const a = v.map(x => Math.max(0, +x || 0)), t = a[0] + a[1] + a[2] || 1; return [a[0] / t, a[1] / t, a[2] / t]; },
    triErr(a, b) { const d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2]; return Math.sqrt((d0 * d0 + d1 * d1 + d2 * d2) / 2); },
    /* expectation by replays with a private PRNG (rng from core.js), so R() and the run are untouched: genotypes only
       (A, B copies), every trunk hunted by rule b (15 a trunk), survivors pair at random, K young a generation */
    replay(start, gens, b, d, n, seedv) {
      const lay = this.lay(3), K = this.cfg(3).K, rnd = rng(seedv), acc = [0, 0, 0];
      const g0 = start.map(m => [m.g[lay.T.A.off] > 0.5 ? 1 : 0, m.g[lay.L + lay.T.A.off] > 0.5 ? 1 : 0, m.g[lay.T.B.off] > 0.5 ? 1 : 0, m.g[lay.L + lay.T.B.off] > 0.5 ? 1 : 0]);
      const morph = q => q[0] || q[1] ? 0 : q[2] || q[3] ? 1 : 2;
      for (let r = 0; r < n; r++) {
        let pop = g0.map(q => ({ q, m: morph(q) }));
        for (let g = 0; g < gens; g++) {
          for (let i = pop.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = pop[i]; pop[i] = pop[j]; pop[j] = t; }
          const surv = [];
          for (let t = 0; t < 4; t++) { const on = pop.filter((_, k) => k % 4 === t); this.take(on, 15, b, d, rnd); for (const m of on) surv.push(m); }
          const par = surv.length >= 2 ? surv : pop, kids = [];
          for (let k = 0; k < K; k++) {
            const a = par[(rnd() * par.length) | 0]; let c = a; for (let tr = 0; tr < 7 && c === a; tr++) c = par[(rnd() * par.length) | 0];
            const q = [a.q[rnd() < 0.5 ? 0 : 1], c.q[rnd() < 0.5 ? 0 : 1], a.q[rnd() < 0.5 ? 2 : 3], c.q[rnd() < 0.5 ? 2 : 3]];
            kids.push({ q, m: morph(q) });
          }
          pop = kids;
        }
        const sh = this.shares(pop); acc[0] += sh[0]; acc[1] += sh[1]; acc[2] += sh[2];
      }
      return [acc[0] / n, acc[1] / n, acc[2] / n];
    },

    /* ---------- the hatch: the young take their places; the prediction is revealed ---------- */
    hatch(ev) {
      const s = this.s, rec = s.hist[s.hist.length - 1];
      s.phase = 'hatch'; s.t = 0; s.dk = '';
      const id = s.reveal; s.reveal = null;
      if (s.level !== 3) {
        const iv = m => this.idx(s, m); rec.mOff = this.mean(s.next.map(iv)); rec.R = rec.mOff - rec.mAll; rec.yv = s.next.map(iv);
        if (!s.named && s.level === 1 && rec.gen === 3) s.named = true;
      }
      ev.push({ k: 'hatch', gen: s.gen, reveal: id, vial: s.level === 3 && s.gen === s.gens && !s.whatif });
    },
    nextGen(ev) {
      const s = this.s; s.moths = s.next; s.next = null; s.brood = null; s.jays = null; s.gen++;
      if (s.gen > s.gens) {
        if (s.level === 3) s.trail.push(this.shares(s.moths)); else s.camo.push(this.mean(s.moths.map(m => this.idx(s, m))));
        s.phase = 'over'; ev.push({ k: 'over' }); return;
      }
      this.morning(ev);
    },
    autoGen(ev) {   // L3 What if?: one generation of jays on all four trunks by the lever's rule, then K young
      const s = this.s, lay = this.L();
      for (let t = 0; t < 4; t++) { const on = s.moths.filter(m => m.tr === t && m.a === 1); for (const m of this.take(on, 15, s.wb, s.d, R)) m.a = 2; }
      let par = s.moths.filter(m => m.a === 1); if (par.length < 2) par = s.moths.slice();
      const young = [];
      for (let k = 0; k < this.cfg(3).K; k++) { const a = par[(R() * par.length) | 0]; let b = a; for (let tr = 0; tr < 7 && b === a; tr++) b = par[(R() * par.length) | 0]; young.push(this.mk(Gen.mate(lay, a.g, b.g), lay, a.id, b.id)); }
      this.seat(young); s.moths = young; s.wgen++; s.gen++; s.trail.push(this.shares(young));
      ev.push({ k: 'autogen', n: s.wgen });
      if (s.wgen >= LW_T.autoGens) { s.phase = 'over'; ev.push({ k: 'over' }); }
    },

    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_LICHEN_V2.stars, n = s.level;
      const mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: this.outcome(s), interesting: this.interesting(s) };
    },
    outcome(s) {
      const o = { fedMornings: s.fedMorn, gens: s.gens };
      if (s.level === 3) { o.final = s.trail[s.trail.length - 1]; o.b = s.b; } else { o.c0 = s.camo[0]; o.c1 = s.camo[s.camo.length - 1]; }
      return o;
    },
    interesting(s) {   // the card's Interesting result, chosen from what actually happened (failure is data, D1 G9)
      const f = s.trail.length ? s.trail[s.trail.length - 1] : null, lo = f ? Math.min(f[0], f[1], f[2]) : 1;
      if (s.whatif && s.level === 3) {
        if (s.whatif === 'rare') { const f0 = s.trail[0]; return Math.max(f[0], f[1], f[2]) > Math.max(f0[0], f0[1], f0[2]) ? 'rare' : 'rareNo'; }
        if (s.whatif === 'hidden') return lo >= 0.1 ? (f[1] >= f[0] && f[1] >= f[2] ? 'hidden' : 'hiddenMixed') : f[1] >= f[0] && f[1] >= f[2] ? 'hiddenWon' : lo <= 0 ? 'vanished' : 'lost';
        return s.whatif;
      }
      if (s.whatif) return s.whatif;
      const starved = s.hist.filter(r => r.starved > 1).length;   // mornings below the 80% fed rule
      if (s.level === 3 && lo < 0.1) return lo <= 0 ? 'vanished' : 'lost';
      if (s.level === 1 && s.camo[s.camo.length - 1] - s.camo[0] < 0.05) return 'flat';
      if (s.level === 2 && this.mean(s.hist.map(r => r.S || 0)) < 0.03) return 'flat';
      if (starved * 2 >= s.hist.length && starved > 0) return s.level === 0 ? 'starved0' : s.level === 3 ? 'starved3' : 'starved';
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.phase === 'hunt' || s.phase === 'dawn') {
        for (const i of this.live(s)) { out.push({ k: 'peck', i }); if (s.level === 0 && s.gen > 1 && !s.pins.length) out.push({ k: 'pin', i }); }
        out.push({ k: 'miss', x: 0.5, y: 0.5 });
      } else if (s.ask) {
        const A = s.ask;
        if (A.kind === 'tri') { for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10 - i; j++) out.push({ k: 'predict', id: A.id, v: [i / 10, j / 10, (10 - i - j) / 10] }); }
        else { const n = A.kind === 'y' ? 60 : 100; for (let k = 0; k <= n; k++) out.push({ k: 'predict', id: A.id, v: A.lo + (A.hi - A.lo) * k / n }); }   // a fine grid: a bot's rounding is never a lucky answer
      }
      return out;
    },
    /* bots (bots.js): (s, acts, rnd) → action | null; 'random' is generic. None may earn three stars in a level. */
    bots: {
      alwaysA(s, acts) { return acts.find(a => a.k === 'peck') || (s.ask ? acts.find(a => a.k === 'predict') : null) || null; },
      alwaysB(s, acts) { const p = acts.filter(a => a.k === 'peck'); return p[p.length - 1] || (s.ask ? acts.filter(a => a.k === 'predict').pop() : null) || null; },
      greedy(s, acts) {   // greedy-now: the most conspicuous moth (boss: the same look again, else the commonest); predicts the young = the survivors
        const sim = CH_LICHEN_V2.sim, P = acts.filter(a => a.k === 'peck');
        if (P.length) {
          if (s.level === 3) { const c = sim.counts(s, P.map(a => s.moths[a.i])), m = s.si && s.si.last >= 0 && c[s.si.last] ? s.si.last : c.indexOf(Math.max(...c)); return P.find(a => s.moths[a.i].m === m); }
          return P.reduce((b, a) => sim.consp(s, s.moths[a.i]) > sim.consp(s, s.moths[b.i]) ? a : b);
        }
        if (!s.ask) return null;
        const rec = s.hist[s.hist.length - 1], near = v => acts.filter(a => a.k === 'predict').reduce((b, a) => Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b);
        if (s.ask.kind === 'tri') return acts.find(a => a.k === 'predict' && a.v[2] === 1) || null;
        if (s.ask.kind === 'y') return near(s.ask.hi);
        return near(rec.mSurv);
      },
      threshold(s, acts) {   // eats only moths darker than half the bark; predicts no change (young = the parents' mean); the boss: the centre
        const sim = CH_LICHEN_V2.sim, P = acts.filter(a => a.k === 'peck');
        if (P.length) return P.find(a => sim.consp(s, s.moths[a.i]) >= 0.5) || null;
        if (!s.ask) return null;
        const rec = s.hist[s.hist.length - 1], near = v => acts.filter(a => a.k === 'predict').reduce((b, a) => Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b);
        if (s.ask.kind === 'tri') { const pts = acts.filter(a => a.k === 'predict'); return pts.reduce((b, a) => sim.triErr(a.v, [1 / 3, 1 / 3, 1 / 3]) < sim.triErr(b.v, [1 / 3, 1 / 3, 1 / 3]) ? a : b); }
        if (s.ask.kind === 'y') return near(s.ask.hi / 2);
        return near(rec.mAll);
      },
      /* the no-understanding bots the reviewers named (bots.py --bots …,lazy,centre,auto,visual; the oracle checks their unit-wide union) */
      lazy(s, acts, rnd) {   // hunts greedily; at every ask taps Lock in without moving the ghost
        if (s.ask) return { k: 'predict', id: s.ask.id, v: s.ask.start, moved: false };
        return CH_LICHEN_V2.sim.bots.greedy(s, acts, rnd);
      },
      centre(s, acts, rnd) {   // hunts greedily; always calls the middle: the centre of the triangle, half the eggs, no change
        if (s.ask) { const rec = s.hist[s.hist.length - 1]; return { k: 'predict', id: s.ask.id, v: s.ask.kind === 'tri' ? [1 / 3, 1 / 3, 1 / 3] : s.ask.kind === 'y' ? s.ask.hi / 2 : rec.mAll }; }
        return CH_LICHEN_V2.sim.bots.greedy(s, acts, rnd);
      },
      auto(s) {   // switches on Auto-hunt at the first chance and never touches anything else (its predictions time out)
        return !s.auto && (s.phase === 'hunt' || s.phase === 'dawn') ? { k: 'auto', on: true } : null;
      },
      visual(s, acts, rnd) {   // eats whatever stands out most against the bark; in a boss streak the other looks are faded (the drawn search image), so it
        // keeps to the streak's look with the chance the fade gives (0.5 after two, 0.8 after three or more); never moves a ghost
        const sim = CH_LICHEN_V2.sim, P = acts.filter(a => a.k === 'peck');
        if (s.ask) return { k: 'predict', id: s.ask.id, v: s.ask.start, moved: false };
        if (!P.length) return null;
        const bark = sim.bark(s), con = a => Math.abs(s.moths[a.i].t - bark), keep = s.level === 3 && s.si && s.si.run >= 2 ? (s.si.run >= 3 ? 0.8 : 0.5) : 0;
        let pool = P; if (keep && rnd() < keep) { const same = P.filter(a => s.moths[a.i].m === s.si.last); if (same.length) pool = same; }
        return pool.reduce((b, a) => con(a) > con(b) ? a : b);
      }
    }
  },

  /* ---------- stars, scored against the expectation for the parameters in force (never the realised run) ---------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false;
      if (n === 0) return s.fedMorn >= 2 && s.pins.length > 0;
      if (n === 1) return s.fedMorn >= 4 && s.camo[s.camo.length - 1] - s.camo[0] >= 0.15;
      if (n === 2) { let t = 0; for (const r of s.hist) t += r.S || 0; return s.fedMorn >= 3 && t / Math.max(1, s.hist.length) >= 0.08; }
      const f = s.trail[s.trail.length - 1]; return s.fedMorn >= 4 && Math.min(f[0], f[1], f[2]) >= 0.1;
    },
    predict: (s, n) => {   // only Mixed diets, where both naive answers ("no change", "the young match the survivors") miss; L1's asks are practice
      if (s.whatif || n !== 2) return false;
      let k = 0; for (const id of s.asks) if (s.hits[id] && s.test[id] !== false) k++; return k >= 2;
    },
    transfer: (s, n) => {
      if (s.whatif) { const id = s.asks[s.asks.length - 1]; return s.whatif === 'noinherit' && !!(id && s.hits[id]); }   // D1's "What if h² = 0?"; the boss levers are shown, never starred
      if (n !== 3) return false;
      const id = s.asks.find(a => /^L3g/.test(a)); return !!(id && s.hits[id]);
    }
  },

  /* the class pools (D1 §3.1): a 30-bit result code on assignment links (?unit=lichen&seed=…). Bits 0–1 level, 2–4 star mask;
     L1–L2: 5–12 pooled realised h² (R ÷ S) as % + 50 (so −50 to 205), 13–19 mean true h² as %, 20–26 final camouflage %;
     L3: 5–10 fitted b × 20, 11–12 looks kept at ≥ 10%, 13–19 band %, 20–26 mottle %; L0: 5–11 moths eaten. */
  resultBits(s, level) {
    if (!s) return 0;
    const n = Math.max(0, Math.min(3, level | 0)), st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(v)));
    let bits = n | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 2;
    if (n === 0) bits |= c(s.hist.reduce((t, r) => t + r.eaten, 0), 127) << 5;
    else if (n < 3) {
      let S = 0, R0 = 0, h = 0, g = 0; for (const r of s.hist) if (r.R != null) { S += r.S; R0 += r.R; h += r.h2; g++; }
      bits |= c(S > 0.005 ? 100 * R0 / S + 50 : 50, 255) << 5 | c(g ? 100 * h / g : 0, 127) << 13 | c(100 * (s.camo[s.camo.length - 1] || 0), 127) << 20;
    } else {
      const f = s.trail[s.trail.length - 1] || [0, 0, 1];
      bits |= c(20 * (s.b == null ? 1 : s.b), 63) << 5 | (f.filter(x => x >= 0.1).length & 3) << 11 | c(100 * f[0], 127) << 13 | c(100 * f[1], 127) << 20;
    }
    return bits >>> 0;
  },

  /* ================= view: lifecycle, input, juice, drawing, words (D4 §5.3 timings; juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pendEnd = false; this._asking = null; this._dockSig = '';
    this.v = { t: 0, eat: {}, chick: [0, 0, 0, 0], hop: 0, flinch: 0, press: null, focus: -1, banner: null, fly: {}, flyT: -1, tray: null, cullT: -1, hatchT: -1,
      jayT: -1, missN: 0, prevTrunk: -1, trunkT: 1, glow: 0, lastPhase: '', thaw: !!o.thaw, ruleEl: null, gaugeM: null, specimens: {}, holdT: -1, chunk: null, ghost0: false };
    Sim.start(this, n, o);
    const s = this.sim.s;
    this.v.gaugeM = s.camo.length ? s.camo[s.camo.length - 1] : null;
    if (typeof Stage !== 'undefined' && Stage.w > 2) for (const k of n === 3 ? ['birch', 'oak'] : ['lichen']) this.barkTex(k, Stage.w, Stage.h);   // bake the barks under the level banner, not mid-morning
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    this.dock(); this.hud();
    if (s.phase === 'dawn' || o.thaw) this.arrive(true);
    const name = this.levels[n] && this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: o.thaw ? this.content.levers[s.whatif] || name : name, t: 0, ms: Math.max(900, ms + 300) }; });
    this.v.ghost0 = n === 0 && !o.thaw;   // the ghost hand starts once the level banner has gone, so the banner never covers its ring
  },
  ghostTap() { if (typeof Ghost !== 'undefined') Ghost.show({ verb: 'tap', key: 'Enter', at: () => this.ghostAt(), until: () => this.sim.s.eaten > 0 || this.sim.s.phase === 'dusk' }); },
  phoneStrip() { return typeof Strip !== 'undefined' && !!Strip.isOpen && typeof Strip.phone === 'function' && Strip.phone(); },
  canAuto() {   // Auto-hunt (the non-visual path) is offered from L1, after L0's first morning, at once in untimed or readable mode, and whenever it is on
    const s = this.sim.s, ui = Save.d && Save.d.ui; return s.auto || this.level > 0 || s.gen > 1 || !!(ui && (ui.unt || ui.read)) || s.unt;
  },
  canFF(s) { return (s.phase === 'dusk' || s.phase === 'hatch') && (s.gen > 1 || !!s.whatif) && !s.ask; },   // not the first dusk of a level: that one is the payoff
  canUntimed() { const s = this.sim.s; return s.unt || s.hist.filter(r => r.starved > 0).length >= 2; },   // offered after two hungry mornings in a level
  /* ---------- geometry ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  rect() { const W = Stage.w, H = Stage.h, top = this.hudH() + 50; return { x: 14, y: top, w: Math.max(40, W - 28), h: Math.max(40, H - top - 16) }; },
  size() { const u = Stage.u || 390; return Math.round(Math.max(36, Math.min(50, 0.095 * u))); },   // ≈ 37 px on a 390 px phone (D4 asks for heroes near 0.12u)
  pos(m) { const r = this.rect(); return [r.x + m.x * r.w, r.y + m.y * r.h]; },
  hash(v) { let h = 2166136261; const s = String(v); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h ^ h >>> 13) >>> 0; },
  rot(m) { return ((this.hash(m.id) % 1000) / 1000 - 0.5) * 0.9; },
  ph(m) {   // the look: shade (luminance) and, in the boss, the pattern stencil; hue locked so colour-blind players face the same task
    const s = this.sim.s; return s.level === 3 ? { tone: m.t, hue: 0.72, mot: 0.25, morph: ['band', 'mottle', 'speck'][m.m] } : { tone: m.t, hue: 0.86, mot: 0.3, morph: 'speck' };
  },
  chickPos(k) { return [30 + k * 34, this.hudH() + 26]; },
  ghostAt() {
    const s = this.sim.s; let best = null, bc = -1;
    for (const i of this.sim.live(s)) { const c = this.sim.consp(s, s.moths[i]); if (c > bc) { bc = c; best = s.moths[i]; } }
    return best ? this.pos(best) : null;
  },
  visible() { const s = this.sim.s; return s.moths.filter(m => this.sim.vis(s, m)); },

  /* ---------- the frame ---------- */
  update(dt) {
    const v = this.v;
    // phones: a prediction opens the strip over the scene; after Lock in, hold the dusk (sim and its view clocks) until the strip
    // has closed, so the reveal is read first and the cull or hatch plays in full view. View-only: the sim simply takes no steps.
    for (const e of Sim.run(this, 0)) this.juice(e);   // live actions' events first (no step), so a Lock in starts the hold before the sim moves on
    if (v.holdT >= 0) { v.holdT += dt; if (!this.phoneStrip() || v.holdT > 2.4) v.holdT = -1; }
    const s0 = this.sim.s, ff = v.ff && (s0.phase === 'dusk' || s0.phase === 'hatch') ? 3 : 1;   // a tap or Space fast-forwards a dusk you have seen before (view-only: the dusk takes no actions)
    const sdt = v.holdT >= 0 ? 0 : dt * ff, ev = Sim.run(this, sdt), s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.flinch = Math.max(0, v.flinch - dt * 5); v.hop = Math.max(0, v.hop - dt / 0.4); v.trunkT = Math.min(1, v.trunkT + dt / 0.5);
    for (let k = 0; k < 4; k++) v.chick[k] = Math.max(0, v.chick[k] - dt / 0.22);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (v.ghost0 && !v.banner) { v.ghost0 = false; if (s.eaten === 0) this.ghostTap(); }
    if (v.chunk) { v.chunk.t += dt; if (v.chunk.t > 0.45) v.chunk = null; }
    if (v.flyT >= 0) v.flyT += dt; if (v.cullT >= 0) v.cullT += sdt; if (v.hatchT >= 0) v.hatchT += sdt; if (v.jayT >= 0) v.jayT += sdt;
    if (v.tray) this.trayStep();
    if (v.gaugeM != null && s.camo.length) { const target = s.phase === 'hatch' && s.next ? this.sim.mean(s.next.map(m => this.sim.idx(s, m))) : s.camo[s.camo.length - 1]; v.gaugeM += (target - v.gaugeM) * Math.min(1, dt * 4); }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) this._asking = null;
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; this.dock(); }
    this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pendEnd) { this._pendEnd = true; return; } this._ended = true; this.finish(r); }   // one settled frame is drawn before the card
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    const unt = s.unt, soft = unt ? null : 9, chart = 0;
    const onCommit = r => {   // the widget commits on its soft timer or a second tap even if the ghost never moved: that is no prediction
      const o = Predict.overlay(chart); if (o && o.id === r.id && !o.moved) Sim.act(this, { k: 'void', id: r.id });
    };
    const linger = 1500;   // the phone strip stays open 1.5 s after Lock in: the dusk holds while the reveal shows (the engine default is 0.9 s)
    if (A.kind === 'tri') Predict.ask({ id: A.id, chart, kind: 'tri', start: A.start, tol: A.tol, soft, linger, say: this.content.live.tri, onCommit });
    else if (A.kind === 'y') Predict.ask({ id: A.id, chart, kind: 'y', axis: { lo: A.lo, hi: A.hi }, start: A.start, at: 1, tol: A.tol, soft, linger, onCommit });
    else Predict.ask({ id: A.id, chart, kind: 'x', axis: { lo: A.lo, hi: A.hi }, start: A.start, tol: A.tol, soft, linger, onCommit });
    this.dock();
  },
  lockIn() {   // the dock's Lock in: an unmoved ghost asks for a drag instead of committing
    const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return;
    const o = Predict.overlay(0); if (o && o.id === s.ask.id && !o.moved) { this.whisper('drag'); return; }
    Predict.commit(s.ask.id);
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, last = Freezer.list(this.id).slice(-1)[0], o = { level: n, mask: r.mask, final: n === 3, interesting: r.interesting };
    const V = this.bodyVars();
    if (n < 3 && !s.whatif) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n === 0 && !s.pins.length ? 3 : n], V); }
    if (n === 3 && !s.whatif) { o.take = C.boss.inverts; o.body = Txt.f(C.body, V); this.resident(); }   // the boss's own headline: it inverts L1's one best form
    if (s.whatif) o.body = Txt.f(C.whatifBody[n === 3 ? 1 : s.whatif === 'noinherit' ? 2 : s.whatif === 'novar' ? 3 : 0], V);   // the replayed generation itself, never the level's averages
    if (n >= 1 && last) o.whatIf = { gen: last.gen, levers: n === 3 ? ['nosearch', 'rare', 'hidden'] : ['novar', 'noinherit', 'random'] };
    o.why = n < 3 ? C.levelWhy[n] : C.why;   // each level's Why? opens on its own story
    const spec = this.notes().charts[n === 0 ? 0 : n === 3 ? 0 : 1], aid = n === 3 ? s.asks[s.asks.length - 1] : null;
    if (spec && aid && s.exp[aid] && s.pred[aid]) { spec.ghost = s.exp[aid]; spec.you = s.pred[aid]; if (spec.pts) spec.pts.forEach(p => { p.label = ''; }); }   // the debrief: your call, the expectation and the trail ("now" would sit on "you")
    if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    const box = End.show(this, o);   // the unmet-star hint names only stars this level can give: Entry.show reads content.levelStars[n]
    this.chipsInView(box);
  },
  chipsInView(box) {   // phones: the What if? chips open under the card's sticky buttons; bring them into view (engine request 8)
    if (!box || !box.querySelector) return;
    const chips = box.querySelector('.chips'), btn = [...box.querySelectorAll('.card-btns button, .card-btns .btn')].find(b => b.textContent === 'What if?');
    if (!chips || !btn) return;
    btn.addEventListener('click', () => setTimeout(() => { if (!chips.hidden && chips.scrollIntoView) try { chips.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) { chips.scrollIntoView(false); } }, 30));
  },
  bodyVars() {
    const s = this.sim.s, pc = v => Math.round(v * 100), sg = v => (v < 0 ? '−' : '') + Math.abs(Math.round(v * 100)); let S = 0, R0 = 0, n = 0, g = 0;
    for (const r of s.hist) { n += r.eaten; if (r.R != null) { S += r.S; R0 += r.R; g++; } }
    const f = s.trail.length ? s.trail[s.trail.length - 1] : [0, 0, 1], last = s.hist[s.hist.length - 1] || {}, w = s.whatif;
    let top = 0, cat = 0, av = 0;   // the boss in plain words: how often you took the commonest look on the trunk, against its share there
    for (const m of s.mornings.concat(s.diet && s.mornings.indexOf(s.diet) < 0 ? [s.diet] : [])) for (const c of (m && m.catches) || []) {
      const t = c.avail[0] + c.avail[1] + c.avail[2], k = c.avail.indexOf(Math.max(...c.avail)); if (!t) continue; cat++; av += c.avail[k] / t; if (c.m === k) top++;
    }
    return { n, e: Math.round(this.P.eggs.v * this.sim.cfg(s.level).K), k: this.sim.cfg(s.level).K, c0: pc(s.camo[0] || 0), c1: pc(s.camo[s.camo.length - 1] || 0),
      s: w ? sg(last.S || 0) : sg(g ? S / g : 0), r: w ? sg(last.R || 0) : sg(g ? R0 / g : 0), a: pc(f[0]), m: pc(f[1]), b: s.b == null ? 1 : s.b, sp: pc(f[2]),
      pc: cat ? Math.round(100 * top / cat) : 0, av: cat ? Math.round(100 * av / cat) : 0 };
  },
  resident() {   // a ≤ 96-byte snapshot of the wood for the Black Country (D5 decision 25): N, gen, seed, A and B copy shares, shade mean and sd
    try {
      const s = this.sim.s, lay = this.sim.lay(3), P = s.moths, cp = k => { let c = 0; for (const m of P) c += (m.g[lay.T[k].off] > 0.5) + (m.g[lay.L + lay.T[k].off] > 0.5); return c / (2 * P.length); };
      const tones = P.map(m => m.t), pins = [];
      for (const p of (typeof Pin !== 'undefined' ? Pin.list : [])) { const m = P.find(q => q.id === p.id); if (m && pins.length < 4) pins.push({ id: m.id & 65535, bytes: this.pack(m, lay) }); }
      Save.res.put('wood', { N: P.length, gen: s.gen, seed: App.seed >>> 0, freqs: [cp('A'), cp('B')], tone: [this.sim.mean(tones), this.sim.sd(tones)], pins });
    } catch (e) { /* the save adapter never throws; a failed snapshot only loses persistence */ }
  },
  pack(m, lay) {   // 8 bytes: A1 A2 B1 B2 bits, then the four shade loci (both copies summed, ×255)
    const b = new Uint8Array(8), L = lay.L, A = lay.T.A.off, B = lay.T.B.off, t = lay.T.tone.off;
    b[0] = (m.g[A] > 0.5 ? 1 : 0) | (m.g[L + A] > 0.5 ? 2 : 0) | (m.g[B] > 0.5 ? 4 : 0) | (m.g[L + B] > 0.5 ? 8 : 0);
    for (let i = 0; i < 4; i++) b[1 + i] = Math.round(Math.max(0, Math.min(1, (m.g[t + i] + m.g[L + t + i]) * 2)) * 255);
    return b;
  },

  /* ---------- juice: every event of Sim.run gets a visual within one frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, W = Stage.w, H = Stage.h, C = this.content, sz = this.size();
    if (e.k === 'dawn') {
      if (s.level === 3) { v.prevTrunk = v.curTrunk == null ? -1 : v.curTrunk; v.curTrunk = s.trunk; v.trunkT = v.prevTrunk < 0 ? 1 : 0; this.arrive(false); }
      else if (!v.hatchDone) this.arrive(false);
      v.hatchDone = false; v.hatchT = -1; v.tray = null; v.jayT = -1; v.cullT = -1; v.ff = false;
      if (s.gen > 1 || v.thaw) { if (typeof Snd !== 'undefined') Snd.dawn(); v.banner = { text: Txt.f(C.labels.gen, { g: s.gen }), t: 0, ms: 1000 }; }
      if (s.level < 3 && typeof Freezer !== 'undefined' && !s.whatif) Freezer.put(this.id, e.gen, this.sim.snapshot());
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.live.gen, { g: s.gen, n: this.visible().length }));
      if (s.level === 0 && s.gen === 2 && !s.whatif && typeof Ghost !== 'undefined') Ghost.show({ verb: 'hold', key: 'Enter', at: () => this.ghostAt(), until: () => { const q = this.sim.s; return q.pins.length > 0 || q.phase === 'dusk' || q.phase === 'ask' || q.phase === 'over'; } });   // shown at dawn: it must outlive the dawn
      return;
    }
    if (e.k === 'peck') {
      const m = s.moths[e.i], p = this.pos(m); v.eat[m.id] = { t0: v.t, x: p[0], y: p[1] };
      if (F) { F.tier(1); F.burst('dust', p[0], p[1], 3); F.ring(p[0], p[1], sz * 0.42, { dashed: true }); }
      const c = this.chickPos(e.chick); v.chick[e.chick] = 1;
      if (F) F.pop('+1', c[0], c[1] - 20, 1);
      if (typeof Snd !== 'undefined' && !e.auto) Snd.peck();
      if (e.cost >= 0.05) v.chunk = { w: e.cost, t: 0 };   // the clock loses a chunk: a well-hidden moth took longer to find
      if (e.streak >= 2 && F && !e.auto && s.looks == null) F.pop('+½ s', W / 2, this.hudH() + 18, 1);
      if (e.refocus && F && !e.auto) F.pop(s.looks != null ? '−1' : '−¾ s', W / 2, this.hudH() + 18, -1);
      v.streak = e.streak || (e.refocus ? 1 : v.streak);
      if (e.streak === 3) this.whisper('streak'); if (e.refocus) { v.veil = 1; this.whisper('refocus'); }
      if (v.focus === e.i) v.focus = -1;
      return;
    }
    if (e.k === 'miss') {
      const r = this.rect(), x = r.x + e.x * r.w, y = r.y + e.y * r.h; v.flinch = 1;
      if (F) { F.tier(1); F.burst('dust', x, y, 1); if (!e.free) F.pop(s.looks != null ? '−1' : '−½ s', Math.max(34, Math.min(W - 44, x)), Math.max(this.hudH() + 20, y - 16), -1); }
      if (typeof Snd !== 'undefined') Snd.miss();
      if (v.missN++ < 2) this.whisper('miss');
      return;
    }
    if (e.k === 'random') { if (!v.saidRandom) { v.saidRandom = 1; this.whisper('random'); } return; }
    if (e.k === 'fed') { v.hop = 1; if (F) F.tier(2);   // no whisper: it sat on the nest just as the chicks hop and peep
      if (typeof Snd2 !== 'undefined') { const c = this.chickPos(1); Snd2.play('peep', { x: c[0] + 17, y: c[1] }); } return; }
    if (e.k === 'pin') { const m = s.moths[e.i]; if (m && F) { const p = this.pos(m); F.ring(p[0], p[1], 30, { ms: 400 }); } return; }
    if (e.k === 'dusk') {
      v.glow = 0; if (F) F.tier(2);
      if (typeof Snd2 !== 'undefined') Snd2.play('dusk', { x: W / 2, y: H / 2, twin: false });
      if (e.starved) for (const k of this.starvedIdx()) { const c = this.chickPos(k); if (F) F.ring(c[0], c[1], 15, { dashed: true }); }   // the HUD names the hungry chick; a whisper would cover the nest
      if (s.level === 3 && s.jays) { v.jayT = 0; if (!v.saidJays) { v.saidJays = 1; this.whisper('jays'); } }
      const r = s.hist[s.hist.length - 1], g = this.gaugeAt(r && r.mSurv);
      if (F && r && r.S != null && g && s.level > 0) F.pop(Txt.f(C.labels.sel, { s: (r.S >= 0 ? '+' : '−') + Math.abs(Math.round(r.S * 100)) }), g[0], g[1] + 34, r.S >= 0 ? 1 : -1);
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.live.dusk, { n: e.eaten }));
      return;
    }
    if (e.k === 'eggs') { this.trayStart(); if (typeof Snd2 !== 'undefined' && v.tray) Snd2.play('count', { x: W / 2, y: v.tray.y + v.tray.h / 2, twin: false }); return; }
    if (e.k === 'cull') {
      v.cullT = 0; if (F) { F.flash({ alpha: 0.12, ms: 300 }); if (v.tray && s.brood) F.pop('−' + (s.brood.E - s.brood.K), v.tray.x + v.tray.w * 0.5, v.tray.y + v.tray.h * 0.4, -1); }   // over the eggs, clear of the tray labels
      if (typeof Snd2 !== 'undefined' && v.tray) Snd2.play('tock', { x: v.tray.x + v.tray.w / 2, y: v.tray.y, twin: false });
      if (e.reveal) this.reveal(e.reveal);
      return;
    }
    if (e.k === 'hatch') {
      v.hatchT = 0; v.hatchDone = s.level !== 3;
      const r = s.hist[s.hist.length - 1], g = r && r.R != null ? this.gaugeAt(r.mOff) : null;
      if (F && g && s.level > 0) F.pop(Txt.f(C.labels.shift, { r: (r.R >= 0 ? '+' : '−') + Math.abs(Math.round(r.R * 100)) }), g[0], g[1] + 34, r.R >= 0 ? 1 : -1);
      if (e.reveal) this.reveal(e.reveal);
      if (e.vial && typeof Freezer !== 'undefined') Freezer.put(this.id, s.gen + 1, this.sim.snapshot());
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
      if (F) F.tier(2);
      return;
    }
    if (e.k === 'auto') { if (F) F.tier(2); return; }
    if (e.k === 'commit') { if (this.phoneStrip()) v.holdT = 0; return; }
    if (e.k === 'void') { this.whisper('none'); return; }
    if (e.k === 'unt') { if (Save.d && Save.d.ui) { Save.d.ui.unt = e.on ? 1 : 0; Save.save(); } if (e.on) this.whisper('untimed'); this._dockSig = ''; this.dock(); return; }
    if (e.k === 'autogen') {
      this.arrive(false); if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
      if (typeof Snd2 !== 'undefined') Snd2.play('tick', { x: W - 60, y: this.hudH() + 26 });
      return;
    }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'lw-' + k); },
  reveal(id) {
    const s = this.sim.s; if (typeof Predict === 'undefined' || s.exp[id] == null) return;
    const r = Predict.reveal(id, s.exp[id], s.tol[id]); if (!r) return;
    this.whisper(s.pred[id] == null ? 'none' : s.hits[id] ? 'hit' : 'out');
    if (typeof Fx !== 'undefined') Fx.tier(2);
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
  },
  starvedIdx() { const s = this.sim.s, r = s.hist[s.hist.length - 1]; if (!r || !r.starved) return []; return s.fed.map((f, i) => [f, i]).sort((a, b) => a[0] - b[0] || b[1] - a[1]).slice(0, r.starved).map(q => q[1]); },
  arrive(first) {   // moths flutter in from the edges and settle (dawn, the first morning, and each boss trunk)
    const v = this.v, quick = this.sim.s.phase === 'auto'; v.fly = {}; v.flyT = 0; v.flyDur = quick ? 0.3 : 0.55;
    const list = this.visible(); list.forEach((m, k) => { const h = this.hash(m.id + 'a'), side = h % 4; v.fly[m.id] = { side, d: (k / Math.max(1, list.length)) * (quick ? 0.25 : first ? 0.45 : 0.3), u: (h >>> 4) % 1000 / 1000 }; });
  },

  /* ---------- the egg tray (D4 §5.3): one dot an egg (≤ 600 dots), arcs from each mother, a cull in six batches ---------- */
  trayStart() {
    const s = this.sim.s, B = s.brood; if (!B) return;
    const W = Stage.w, H = Stage.h, per = Math.max(1, Math.ceil(B.E / 600)), dots = Math.ceil(B.E / per), maxH = H * 0.42;
    let pitch = 14, cols = Math.max(10, Math.floor((W - 32) / pitch));
    while (Math.ceil(dots / cols) * pitch > maxH && pitch > 7) { pitch--; cols = Math.max(10, Math.floor((W - 32) / pitch)); }
    cols = Math.min(cols, 25 * Math.ceil(dots / 300));
    const rows = Math.ceil(dots / cols), tw = cols * pitch, th = rows * pitch, x = (W - tw) / 2, y = H - th - 18, slots = [];
    const byMom = new Map(s.moths.map(m => [m.id, m]));
    let j = 0;
    B.moms.forEach((id, mi) => {
      const n = Math.round(B.cnt[mi] / per), k = Math.round(B.kept[mi] / per);
      for (let i = 0; i < n && j < dots; i++, j++) slots.push({ x: x + (j % cols + 0.5) * pitch, y: y + (Math.floor(j / cols) + 0.5) * pitch, mi, keep: Math.floor((i + 1) * k / Math.max(1, n)) > Math.floor(i * k / Math.max(1, n)), on: false, gone: false });
    });
    const moms = [], calm = typeof Fx !== 'undefined' && Fx.calm;
    const nm = B.moms.length, stag = Math.min(0.02, 0.55 / Math.max(1, nm));
    B.moms.forEach((id, mi) => { const m = byMom.get(id), vis = m && this.sim.vis(s, m), first = slots.find(q => q.mi === mi); if (!first) return; const p = vis ? this.pos(m) : [first.x, -20]; moms.push({ mi, vis, x0: p[0], y0: p[1], x1: first.x, y1: first.y, t0: calm ? 0 : moms.length * stag }); });
    const culled = slots.filter(q => !q.keep), batches = [0, 1, 2, 3, 4, 5].map(b => culled.filter((_, i) => i % 6 === b));
    this.v.tray = { x, y, w: tw, h: th, pitch, per, slots, moms, batches, landed: -1, culled: -1, layer: null, dirty: true, r: Math.max(2.5, pitch * 0.38) };
  },
  trayStep() {
    const v = this.v, T = v.tray, s = this.sim.s, calm = typeof Fx !== 'undefined' && Fx.calm;
    const tl = s.phase === 'dusk' && s.dk === 'eggs' ? s.t : (s.phase === 'dusk' && s.dk === 'fall') ? -1 : 99;
    let landed = 0; for (const m of T.moms) if (tl >= m.t0 + (calm ? 0 : 0.3)) landed++;
    const cb = v.cullT < 0 ? 0 : calm ? 6 : Math.min(6, Math.floor(v.cullT / (LW_T.cull / 6)) + 1);
    if (landed !== T.landed || cb !== T.culled) {
      T.landed = landed; T.culled = cb; const on = {}; for (let i = 0; i < landed; i++) on[T.moms[i].mi] = 1;
      for (const q of T.slots) q.on = !!on[q.mi]; for (let b = 0; b < 6; b++) for (const q of T.batches[b]) q.gone = b < cb;
      T.dirty = true;
    }
  },
  drawTray(c) {
    const v = this.v, T = v.tray, s = this.sim.s, calm = typeof Fx !== 'undefined' && Fx.calm; if (!T) return;
    const fade = v.hatchT >= 0 ? Math.max(0, 1 - v.hatchT / 0.5) : 1; if (fade <= 0) return;
    const egg = (cc, x, y, r) => { cc.moveTo(x + r, y); cc.ellipse(x, y, r, r * 1.25, 0, 0, TAU); };
    if (T.dirty || !T.layer) {
      T.dirty = false;
      const paint = (cc, ox, oy) => { cc.beginPath(); for (const q of T.slots) if (q.on && !q.gone && !(v.hatchT >= 0 && q.keep)) egg(cc, q.x - ox, q.y - oy, T.r); cc.fillStyle = '#EFE6CC'; cc.fill(); cc.lineWidth = 1; cc.strokeStyle = '#1B1612'; cc.stroke(); };
      if (typeof Layer === 'function') { T.layer = T.layer || Layer(T.w + 20, T.h + 20); T.layer.redraw(cc => paint(cc, T.x - 10, T.y - 10)); } else T.direct = paint;
    }
    c.save(); c.globalAlpha = fade;
    c.fillStyle = 'rgba(21,18,15,.62)'; rrect(c, T.x - 10, T.y - 10, T.w + 20, T.h + 20, 10); c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(232,223,201,.35)'; c.stroke();
    if (T.layer) T.layer.blit(c, T.x - 10, T.y - 10); else if (T.direct) T.direct(c, 0, 0);
    c.restore();
    const tl = s.phase === 'dusk' && s.dk === 'eggs' ? s.t : -1;
    if (!calm && tl >= 0) for (const m of T.moms) {   // one dashed arc per mother, 300 ms, her batch lands as it arrives
      const p = (tl - m.t0) / 0.3; if (!m.vis || p <= 0 || p >= 1) continue;
      const e = p * p * (3 - 2 * p), mx = (m.x0 + m.x1) / 2, my = Math.min(m.y0, m.y1) - 50, x = (1 - e) * (1 - e) * m.x0 + 2 * (1 - e) * e * mx + e * e * m.x1, y = (1 - e) * (1 - e) * m.y0 + 2 * (1 - e) * e * my + e * e * m.y1;
      c.save(); c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(239,230,204,.8)'; c.beginPath(); c.moveTo(m.x0, m.y0); c.quadraticCurveTo(lerp(m.x0, mx, e), lerp(m.y0, my, e), x, y); c.stroke(); c.restore();
      c.beginPath(); egg(c, x, y, T.r); c.fillStyle = '#EFE6CC'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke();
    }
    if (typeof Lbl !== 'undefined') {
      c.save(); c.globalAlpha = fade;   // the tray's labels fade with it at the hatch
      const C = this.content.labels, B = s.brood, label = T.per > 1 ? Txt.f(C.dot, { n: T.per }) : Txt.f(C.places, { k: this.sim.cfg(s.level).K });
      const preAsk = !s.whatif && this.sim.cfg(s.level).ask[s.gen] === 'count' && (s.dk === 'eggs' || s.phase === 'ask' && s.askAt === 'eggs');   // the egg question: room in the wood stays unsaid
      if (!preAsk || T.per > 1) Lbl.put('lw-tray', label, T.x + T.w, T.y - 22, { align: 'right', size: 13, c });
      if (B && (s.dk === 'eggs' || s.phase === 'ask' && s.askAt === 'eggs')) Lbl.put('lw-eggs', B.E + ' ' + C.eggs.toLowerCase(), T.x, T.y - 22, { align: 'left', size: 13, c, mono: true });
      else if (B) Lbl.put('lw-spring', B.K + ' ' + C.spring.toLowerCase(), T.x, T.y - 22, { align: 'left', size: 13, c, mono: true });
      c.restore();
    }
  },

  /* ---------- input: a tap pecks; a 450 ms hold pins only where pinning is taught (L0, mornings 2–3), elsewhere a hold is a peck ---------- */
  hitTest(x, y) {
    const s = this.sim.s, sz = this.size(), L = this.sim.live(s), pts = L.map(i => { const p = this.pos(s.moths[i]); return { x: p[0], y: p[1], r: sz * 0.55 }; });
    const first = s.level === 0 && s.gen === 1 && !s.whatif, magnet = first ? (s.eaten === 0 ? 1e5 : 90) : 22, k = Stage.hit(x, y, pts, magnet);   // the first tap of the game always lands
    return k < 0 ? -1 : L[k];
  },
  down(x, y) {
    const s = this.sim.s; if (this.canFF(s)) { this.v.ff = true; return; } if (s.phase !== 'hunt' && s.phase !== 'dawn') return;
    const i = this.hitTest(x, y); this.v.press = { x, y, i, t: this.v.t, moved: false };
    if (i >= 0 && typeof Pin !== 'undefined' && this.sim.canPin(s)) { const m = s.moths[i]; Pin.press({ id: m.id, ph: this.ph(m) }, x, y); }
  },
  move(x, y) { const p = this.v.press; if (p && !p.moved && Math.abs(x - p.x) + Math.abs(y - p.y) > 14) { p.moved = true; if (typeof Pin !== 'undefined') Pin.release(); } },
  up() {
    const p = this.v.press; this.v.press = null; if (!p) return;
    const pinned = typeof Pin !== 'undefined' && Pin.release();
    if (pinned && p.i >= 0) { Sim.act(this, { k: 'pin', i: p.i }); this.whisper('pinned'); return; }
    if (p.moved) return;
    this.peckAt(p.x, p.y, p.i);
  },
  peckAt(x, y, i) {
    const s = this.sim.s; if (s.phase !== 'hunt' && s.phase !== 'dawn') return;
    if (i == null) i = this.hitTest(x, y);
    if (i >= 0) Sim.act(this, { k: 'peck', i });
    else if (s.phase === 'hunt') { const r = this.rect(); Sim.act(this, { k: 'miss', x: Math.round(Math.max(0, Math.min(1, (x - r.x) / r.w)) * 1000) / 1000, y: Math.round(Math.max(0, Math.min(1, (y - r.y) / r.h)) * 1000) / 1000 }); }
  },
  onKey(k, e) {
    const s = this.sim.s, v = this.v;
    if (k === 'b' || k === 'B') { if (this.canAuto()) this.toggleAuto(); return; }
    if (k === ' ' && this.canFF(s)) { v.ff = true; return; }
    if (s.phase !== 'hunt' && s.phase !== 'dawn') return;
    const L = this.sim.live(s); if (!L.length) return;
    const cur = L.indexOf(v.focus) >= 0 ? v.focus : -1, D = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    const centre = () => { let best = L[0], bd = Infinity; for (const i of L) { const m = s.moths[i], d = (m.x - 0.5) * (m.x - 0.5) + (m.y - 0.5) * (m.y - 0.5); if (d < bd) { bd = d; best = i; } } return best; };
    if (D) {
      if (cur < 0) { v.focus = centre(); return; }
      const a = s.moths[cur]; let best = -1, bs = Infinity;
      for (const i of L) { if (i === cur) continue; const m = s.moths[i], dx = m.x - a.x, dy = m.y - a.y, along = dx * D[0] + dy * D[1]; if (along <= 0.005) continue; const sc = along + 2 * Math.abs(dx * D[1] - dy * D[0]); if (sc < bs) { bs = sc; best = i; } }
      if (best >= 0) v.focus = best; return;
    }
    if ((k === 'Enter' || k === ' ') && e && e.shiftKey && cur >= 0 && this.sim.canPin(s)) { Sim.act(this, { k: 'pin', i: cur }); if (typeof Pin !== 'undefined') { const m = s.moths[cur], p = this.pos(m); Pin.press({ id: m.id, ph: this.ph(m) }, p[0], p[1]); if (Pin.hold) { Pin.hold.t = Pin.HOLD; Pin.update(0); } Pin.release(); } this.whisper('pinned'); return; }
    if (k === 'Enter' || k === ' ') { if (cur < 0) { v.focus = centre(); return; } const p = this.pos(s.moths[cur]); this.peckAt(p[0], p[1], cur); }
  },
  toggleAuto() { const s = this.sim.s; Sim.act(this, { k: 'auto', on: !s.auto }); this._dockSig = ''; this.dock(); },

  /* ---------- HUD line and dock ---------- */
  hud() {
    if (typeof HUD === 'undefined' || !HUD.say) return;
    const s = this.sim.s, H = this.content.hud, L = this.content.labels; let text = '', num = '';
    const left = Math.max(0, s.quota - s.eaten);
    const hold = this.v.holdHud && this.v.holdHud.gen === s.gen - 1 && s.eaten === 0 && (s.phase === 'hunt' || s.phase === 'dawn') ? this.v.holdHud.text : null;   // a teaching line stays up until the first peck
    if (hold) { text = hold; num = s.looks != null ? Txt.f(L.looks, { n: Math.max(0, s.looks) }) : Txt.f(L.secs, { n: (Math.round(Math.max(0, s.time) * 10) / 10).toFixed(1) }); }
    else if (s.phase === 'hunt' || s.phase === 'dawn') {
      if (this.level === 0 && s.gen === 1 && s.eaten === 0 && !s.whatif) text = this.content.firstWords;
      else if (s.auto) text = H.auto;
      else if (this.level === 0 && s.gen === 2 && !s.pins.length) text = H.pin;
      else if (this.level === 0 && s.gen === 1) text = H.hunt0;
      else text = Txt.f(s.looks != null ? H.huntU : this.level === 1 && s.gen === 1 && !s.whatif ? H.huntHide : H.hunt, { n: left });
      num = s.looks != null ? Txt.f(L.looks, { n: Math.max(0, s.looks) }) : Txt.f(L.secs, { n: (Math.round(Math.max(0, s.time) * 10) / 10).toFixed(1) });
    } else if (s.phase === 'dusk') {
      const r0 = s.hist[s.hist.length - 1], hungry = r0 && r0.starved > 0, hideK = !s.whatif && this.sim.cfg(s.level).ask[s.gen] === 'count';   // the egg question: K stays unsaid until the reveal
      text = s.dk === 'fall' ? (s.level === 3 && s.jays ? H.jays : hungry ? H.duskHungry : H.dusk) : s.dk === 'eggs' ? Txt.f(hideK ? H.eggsOnly : H.eggs, { e: s.brood ? s.brood.E : 0, k: s.brood ? s.brood.K : 0 }) : H.cull;
    } else if (s.phase === 'ask') text = s.whatif && s.level === 3 ? H.wask : s.ask && s.ask.kind === 'tri' ? H.askTri : s.ask && s.ask.kind === 'y' ? H.ask0 : H.ask;
    else if (s.phase === 'hatch') {
      const named = this.level === 1 && s.gen === 3 && !s.whatif, np = named ? this.namedPct() : null;
      text = named ? (np == null ? H.namedNone : np > 100 ? H.namedOver : Txt.f(H.named, { r: np })) : this.level === 2 && s.gen === 1 ? H.hatchDiet : H.hatch;   // Wave 1 G2 #4: the share is named only when 0 ≤ R/S ≤ 1
      if ((named || (this.level === 2 && s.gen === 1)) && !(this.v.holdHud && this.v.holdHud.gen === s.gen)) this.v.holdHud = { gen: s.gen, text };
    }
    else if (s.phase === 'auto') { text = H.wrun; num = s.wgen + ' / ' + LW_T.autoGens; }
    else text = H.over;
    if (!num && s.hist.length && (this.level === 2 || (this.level === 1 && s.named)) && s.phase !== 'auto') { const r = s.hist[s.hist.length - 1]; if (r.h2 != null) num = Txt.f(L.h2, { h: (Math.round(r.h2 * 100) / 100).toFixed(2) }); }
    HUD.say(text, num);
    const D = this.content.data, g = typeof document !== 'undefined' && document.getElementById ? document.getElementById('bar-gen') : null, gt = s.phase === 'auto' ? Txt.f(D.barAuto, { g: s.gen }) : Txt.f(D.bar, { g: Math.min(s.gen, s.gens), n: s.gens });
    if (g && g.textContent !== gt) g.textContent = gt;
  },
  namedPct() {   // the pooled realised h² as a percentage, or null when S is too small or R/S ≤ 0 (chance swamped it)
    const s = this.sim.s; let S = 0, R0 = 0; for (const r of s.hist) if (r.R != null) { S += r.S; R0 += r.R; }
    const p = S > 0.005 ? Math.round(100 * R0 / S) : null; return p == null || p <= 0 ? null : p;
  },
  dock() {
    if (typeof Dock === 'undefined' || !Dock.set || App.mode !== this) return;
    const s = this.sim.s, L = this.content.labels, asking = !!s.ask, auto = this.canAuto(), unt = this.canUntimed(), sig = [s.auto, asking, s.phase === 'over', s.level, auto, unt, s.unt].join('|');
    if (sig === this._dockSig) return; this._dockSig = sig;
    const b = [], D = this.content.data.aria;
    if (s.phase !== 'over' && !(s.whatif && s.level === 3)) {   // small secondary chips, never the biggest button on a first screen
      if (auto) { b.push({ id: 'auto', el: this.chipEl('auto', L.auto, !!s.auto, D.auto, () => this.toggleAuto()) }); if (s.auto) b.push({ id: 'rule', el: this.ruleEl() }); }
      if (unt) b.push({ id: 'unt', el: this.chipEl('unt', L.untimed, !!s.unt, D.untimed, () => Sim.act(this, { k: 'unt', on: !this.sim.s.unt })) });
    }
    if (asking) b.push({ id: 'commit', label: L.commit, key: 'Enter', primary: true, aria: D.commit, fn: () => this.lockIn() });
    Dock.set(b);
  },
  chipEl(id, label, on, aria, fn) {   // a compact toggle chip for the dock (flex 0 0 auto there, 44 px tall)
    const el = document.createElement('button'); el.type = 'button'; el.className = 'lw-chip'; el.textContent = label; el.setAttribute('aria-pressed', String(on)); el.setAttribute('aria-label', aria);
    el.style.cssText = 'min-height:44px;padding:0 14px;border-radius:22px;border:1.5px dashed currentColor;background:' + (on ? 'currentColor' : 'transparent') + ';color:inherit;font:600 13px var(--fb);cursor:pointer;white-space:nowrap';
    if (on) { el.style.borderStyle = 'solid'; el.style.background = 'var(--s-text, #E8DFC9)'; el.style.color = 'var(--s-surface, #1B1612)'; }
    el.addEventListener('click', fn); return el;
  },
  ruleEl() {   // the detection threshold (L0–L2) or, in the boss, how strongly the bird prefers the common look
    if (this.v.ruleEl) return this.v.ruleEl;
    const s = this.sim.s, box = document.createElement('label'), sp = document.createElement('span'), inp = document.createElement('input'), out = document.createElement('output');
    box.className = 'hx-rule'; sp.textContent = s.level === 3 ? this.content.labels.common : this.content.labels.rule;
    inp.type = 'range'; inp.min = '0'; inp.max = '1'; inp.step = '0.05'; inp.value = String(s.rule);
    const show = () => { out.textContent = s.level === 3 ? 'b ' + (0.5 + 2.5 * s.rule).toFixed(1) : Math.round(s.rule * 100) + '%'; };
    inp.addEventListener('input', () => { Sim.act(this, { k: 'rule', v: +inp.value }); show(); });
    show(); box.append(sp, inp, out); this.v.ruleEl = box; return box;
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const s = this.sim.s, v = this.v; if (!s) return;
    const calm = typeof Fx !== 'undefined' && Fx.calm;
    this.drawBark(c, W, H);
    this.drawLight(c, W, H);
    this.drawMoths(c, W, H);
    this.drawPress(c);
    this.drawPins(c, W, H);
    if (v.focus >= 0 && s.moths[v.focus] && s.moths[v.focus].a === 1 && (s.phase === 'hunt' || s.phase === 'dawn')) { const p = this.pos(s.moths[v.focus]), r = this.size() * 0.7; c.save(); c.setLineDash([5, 4]); c.lineWidth = 4; c.strokeStyle = '#1B1612'; c.strokeRect(p[0] - r, p[1] - r, 2 * r, 2 * r); c.lineWidth = 2; c.strokeStyle = '#F4EEDD'; c.strokeRect(p[0] - r, p[1] - r, 2 * r, 2 * r); c.restore(); }
    if (v.veil > 0 && !calm) { c.fillStyle = 'rgba(232,223,201,' + (0.22 * v.veil).toFixed(3) + ')'; c.fillRect(0, 0, W, H); v.veil = Math.max(0, v.veil - 0.06); }
    this.drawNest(c);
    if (s.level === 3) this.drawShares(c, W); else this.drawGauge(c, W);
    if (s.phase === 'hunt' || s.phase === 'dawn') this.drawTimer(c, W);
    this.drawTray(c);
    if (s.level === 3 && v.jayT >= 0 && s.jays && s.phase === 'dusk' && (s.dk === 'fall' || (s.dk === 'eggs' && s.t < 0.3))) { c.save(); if (s.dk === 'eggs') c.globalAlpha = 1 - s.t / 0.3; this.drawJays(c, W, H); c.restore(); }
    this.drawHatch(c);
    this.drawLabels(c, W, H);
  },
  barkTex(kind, W, H) {   // cached procedural bark (Field Plate ground for the Wood), regenerated only on a resize
    const d = Math.min(1.5, Stage.dpr || 1), key = kind + Math.round(W) + 'x' + Math.round(H) + '@' + d;
    this._bark = this._bark || {};
    if (!this._bark[key]) { for (const k in this._bark) if (k.indexOf(kind) === 0) delete this._bark[k]; this._bark[key] = LW_BARK(W, H, d, kind === 'oak' ? 5150 : kind === 'birch' ? 4848 : 4242, kind); }
    return this._bark[key];
  },
  trunkKind(t) { return t % 2 ? 'oak' : 'birch'; },
  drawBark(c, W, H) {
    const s = this.sim.s, v = this.v;
    if (s.level !== 3) { c.drawImage(this.barkTex('lichen', W, H).cv, 0, 0, W, H); return; }
    const cur = this.barkTex(this.trunkKind(s.trunk), W, H);
    if (v.trunkT < 1 && v.prevTrunk >= 0) { c.drawImage(this.barkTex(this.trunkKind(v.prevTrunk), W, H).cv, 0, 0, W, H); c.save(); c.globalAlpha = v.trunkT; c.drawImage(cur.cv, 0, 0, W, H); c.restore(); }
    else c.drawImage(cur.cv, 0, 0, W, H);
  },
  drawLight(c, W, H) {   // dawn warms, dusk cools; a vignette keeps the eye in the middle
    const s = this.sim.s; let a = 0, col = '20,28,48';
    if (s.phase === 'dawn') { a = 0.28 * Math.max(0, 1 - s.t / LW_T.dawn); col = '255,214,150'; }
    else if (s.phase === 'dusk') a = Math.min(0.34, 0.34 * (s.dk === 'fall' ? s.t / 0.5 : 1));
    else if (s.phase === 'ask') a = 0.34;
    else if (s.phase === 'hatch') a = 0.34 * Math.max(0, 1 - s.t / LW_T.hatch);
    if (a > 0.001) { c.fillStyle = 'rgba(' + col + ',' + a.toFixed(3) + ')'; c.fillRect(0, 0, W, H); }
    if (!this._vig || this._vig.w !== W || this._vig.h !== H) { const g = c.createRadialGradient(W / 2, H * 0.55, Math.min(W, H) * 0.35, W / 2, H * 0.55, Math.max(W, H) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.32)'); this._vig = { w: W, h: H, g }; }
    c.fillStyle = this._vig.g; c.fillRect(0, 0, W, H);
  },
  drawMoths(c, W, H) {
    const s = this.sim.s, v = this.v, sz = this.size(), calm = typeof Fx !== 'undefined' && Fx.calm, Rg = typeof Rig !== 'undefined' && Rig.has('moth');
    const hatching = s.phase === 'hatch' || (v.hatchT >= 0 && v.hatchT < 0.95);
    const si = s.level === 3 && s.phase === 'hunt' && s.si && s.si.run >= 2 ? s.si : null, fade = si ? 0.5 * Math.min(1, (si.run - 1) / 2) : 0;   // the search image (designed): in a streak, the other looks are harder to see
    for (const m of s.moths) {
      if (!this.sim.vis(s, m)) continue;
      let [x, y] = this.pos(m), a = 1, sc = 1, flap = 1;
      const f = v.fly[m.id];
      if (f && v.flyT >= 0 && !calm) {   // flutter in from an edge, wings beating, then settle
        const p = Math.max(0, Math.min(1, (v.flyT - f.d) / (v.flyDur || 0.55)));
        if (p < 1) {
          const sx = f.side === 0 ? -40 : f.side === 1 ? W + 40 : x + (f.u - 0.5) * W * 0.6, sy = f.side === 2 ? -40 : f.side === 3 ? H + 40 : y + (f.u - 0.5) * H * 0.5;
          const e = 1 - (1 - p) * (1 - p) * (1 - p), mx = (sx + x) / 2 + (f.u - 0.5) * 80, my = Math.min(sy, y) - 40;
          x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * mx + e * e * x; y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * my + e * e * y;
          flap = 0.35 + 0.65 * Math.abs(Det.cos((v.flyT * 14 + f.u * 6) * Math.PI)); if (p > 0.85) flap = Math.max(flap, (p - 0.85) / 0.15);
        }
      } else if (f && calm && v.flyT >= 0 && v.flyT < f.d + 0.15) a = Math.max(0, (v.flyT - f.d) / 0.15);
      if (m.a !== 1) {   // eaten: lifts 6 px and fades over 300 ms; then only Fx's dashed ring remains
        const E = v.eat[m.id]; if (!E) continue; const et = v.t - E.t0;
        if (et > 0.3) continue; a = 1 - et / 0.3; y -= calm ? 0 : 6 * (et / 0.3); sc = 1 + 0.15 * (et / 0.3);
      }
      if (hatching && s.phase === 'hatch') a *= Math.max(0, 1 - s.t / 0.5);   // the parents' season ends
      if (fade && m.a === 1 && m.m !== si.last) a *= 1 - fade;
      if (s.phase === 'dusk' && s.dk === 'fall' && m.a === 1 && !calm) { c.save(); c.globalAlpha = 0.5 * Math.min(1, s.t / LW_T.fall); c.beginPath(); c.arc(x, y, sz * 0.62, 0, TAU); c.lineWidth = 2; c.strokeStyle = '#F4EEDD'; c.stroke(); c.restore(); }
      if (a <= 0.01) continue;
      c.save(); c.translate(x, y); if (flap !== 1) c.scale(flap, 1); if (sc !== 1) c.scale(sc, sc);
      if (Rg) Rig.draw(c, 'moth', this.ph(m), 0, 0, { size: sz, rot: this.rot(m), id: m.id, alpha: a });
      else { c.globalAlpha = a; c.beginPath(); c.ellipse(0, 0, sz / 2, sz / 3, 0, 0, TAU); c.fillStyle = css(t2rgb(m.t, 0.86)); c.fill(); }
      c.restore();
    }
  },
  drawHatch(c) {   // the kept eggs fly from the tray to their places on the bark and open into moths (boss: they rise and scatter to four trunks)
    const s = this.sim.s, v = this.v, T = v.tray; if (!T || v.hatchT < 0 || s.phase !== 'hatch' || !s.next) return;
    const young = s.next;
    const kept = T.slots.filter(q => q.keep), sz = this.size(), calm = typeof Fx !== 'undefined' && Fx.calm, Rg = typeof Rig !== 'undefined' && Rig.has('moth'), lay = this.sim.L();
    young.forEach((m, k) => {
      if (s.level === 3 ? k % 2 : false) return;
      const q = kept[Math.floor(k * kept.length / young.length)] || kept[kept.length - 1]; if (!q) return;
      const p = Math.max(0, Math.min(1, (v.hatchT - (k / young.length) * 0.25) / 0.6)); if (p <= 0 && !calm) { c.beginPath(); c.ellipse(q.x, q.y, T.r, T.r * 1.25, 0, 0, TAU); c.fillStyle = '#EFE6CC'; c.fill(); return; }
      let tx, ty; if (s.level === 3) { tx = q.x + (this.hash(m.id) % 200 - 100); ty = -30; } else [tx, ty] = this.pos(m);
      const e = calm ? 1 : 1 - (1 - p) * (1 - p) * (1 - p), x = lerp(q.x, tx, e), y = lerp(q.y, ty, e) - (calm ? 0 : 60 * e * (1 - e)), ss = lerp(0.3, 1, e);
      if (s.level === 2 && p > 0.5) {   // mixed diets: each young lands beside the leaf it fed on; a paler or darker leaf shifted its shade, and that part is not inherited
        const dev = m.t - Gen.add(lay, m.g, 'tone'), lr = 4 + Math.min(9, Math.abs(dev) * 60), lx = tx + sz * 0.62, ly = ty + sz * 0.42;
        c.save(); c.globalAlpha = Math.min(1, (p - 0.5) * 3); c.translate(lx, ly); c.rotate(0.6); c.beginPath(); c.moveTo(-lr, 0); c.quadraticCurveTo(0, -lr * 0.8, lr, 0); c.quadraticCurveTo(0, lr * 0.8, -lr, 0); c.closePath();
        c.fillStyle = css(t2rgb(Math.max(0.05, Math.min(0.95, 0.5 + dev * 2.2)), 0.35)); c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#1B1612'; c.stroke();
        c.beginPath(); c.moveTo(-lr - 3, 1); c.lineTo(lr * 0.7, 0); c.stroke(); c.restore();
      }
      const fl = p >= 1 || calm ? 1 : 0.4 + 0.6 * Math.abs(Det.cos(v.hatchT * 40));   // landed: settled, wings still
      c.save(); c.translate(x, y); c.scale(ss * fl, ss);
      if (Rg) Rig.draw(c, 'moth', this.ph(m), 0, 0, { size: sz, rot: 0, id: m.id }); c.restore();
    });
  },
  drawPress(c) {   // the telegraph: a bird shadow grows over the pressed spot in 90 ms, then strikes
    const v = this.v, p = v.press; const calm = typeof Fx !== 'undefined' && Fx.calm;
    const list = []; if (p && !p.moved) list.push([p.x, p.y, v.t - p.t]);
    for (const id in v.eat) { const E = v.eat[id], t = v.t - E.t0; if (t < 0.3) list.push([E.x, E.y, 0.09 + t]); else if (t > 3) delete v.eat[id]; }
    for (const [x, y, t] of list) {
      const k = Math.min(1, t / 0.09), al = t < 0.09 ? 0.36 : 0.36 * Math.max(0, 1 - (t - 0.09) / 0.2), r = calm ? 16 : 6 + 12 * k;
      c.save(); c.globalAlpha = al; c.fillStyle = '#1B1612'; c.beginPath(); c.ellipse(x + 4, y + 3, r * 1.25, r * 0.8, 0.35, 0, TAU); c.fill(); c.restore();
      if (t >= 0.09 && t < 0.27 && !calm) {   // the strike: two beak halves snap shut on the moth (120 ms) and lift away
        const q = (t - 0.09) / 0.18, o = 12 * (1 - Math.min(1, q * 2)), lift = q > 0.5 ? (q - 0.5) * 16 : 0;
        c.save(); c.globalAlpha = 1 - Math.max(0, q - 0.6) / 0.4; c.translate(x, y - lift); c.fillStyle = '#D9A93F'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5;
        c.beginPath(); c.moveTo(-5, -16 - o); c.lineTo(5, -16 - o); c.lineTo(0, -3 - o * 0.3); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(-5, 16 + o); c.lineTo(5, 16 + o); c.lineTo(0, 3 + o * 0.3); c.closePath(); c.fill(); c.stroke(); c.restore();
      }
    }
  },
  drawPins(c, W, H) {   // a pinned moth wears the paper halo while it lives; then it stays as a specimen card, with threads to its young
    if (typeof Pin === 'undefined' || !Pin.list.length) return;
    const s = this.sim.s, v = this.v, slot = {}, sz = this.size();
    const on = id => { const m = s.moths.find(q => q.id === id && q.a === 1 && this.sim.vis(s, q)); if (!m) return null; const p = this.pos(m); return [p[0], p[1], sz * 0.55]; };
    let n = 0;
    for (const p of Pin.list) {
      if (on(p.id) || s.pins.indexOf(p.id) < 0) continue;   // a specimen card only for this level's pins (they have young here)
      const x = W - 36, y = Math.min(H - 34, this.hudH() + 126 + n * 66); n++; slot[p.id] = [x, y, 26];   // never cropped by a letterboxed scene
      c.save(); c.fillStyle = typeof Pal !== 'undefined' ? Pal.paper : '#E8DFC9'; rrect(c, x - 28, y - 26, 56, 52, 7); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke(); c.restore();
      if (p.ph && typeof Rig !== 'undefined') Rig.draw(c, 'moth', p.ph, x, y, { size: Math.min(44, sz), rot: 0 });
    }
    Pin.draw(c, id => on(id) || slot[id] || null, id => { const out = []; for (const m of s.moths) if (m.a === 1 && this.sim.vis(s, m) && (m.mo === id || m.fa === id)) out.push(this.pos(m)); return out; });
  },
  drawNest(c) {   // four chicks in a twig nest: fatter with each catch, gaping while hungry, a dashed ring for a hungry one at dusk
    const s = this.sim.s, v = this.v, per = s.quota / 4, starved = s.phase === 'dusk' || s.phase === 'ask' ? this.starvedIdx() : [], hop = v.hop;
    const x0 = 12, y0 = this.hudH() + 10, w = 4 * 34 + 8;
    c.save(); c.fillStyle = '#4A3A2A'; c.beginPath(); c.moveTo(x0, y0 + 22); c.quadraticCurveTo(x0 + w / 2, y0 + 50, x0 + w, y0 + 22); c.lineTo(x0 + w - 6, y0 + 30); c.quadraticCurveTo(x0 + w / 2, y0 + 56, x0 + 6, y0 + 30); c.closePath(); c.fill();
    c.strokeStyle = '#2A1F16'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(x0 + 6 + i * w / 6, y0 + 26 + (i % 2) * 4); c.lineTo(x0 + 26 + i * w / 6, y0 + 34 - (i % 2) * 3); c.stroke(); } c.restore();
    for (let k = 0; k < 4; k++) {
      const p = this.chickPos(k), fed = Math.min(1, s.fed[k] / per), dy = hop > 0 ? -8 * Det.sin(Math.PI * hop) * (k % 2 ? 0.8 : 1) : 0;
      if (starved.indexOf(k) >= 0) { c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = '#E8DFC9'; c.beginPath(); c.arc(p[0], p[1], 13, 0, TAU); c.stroke(); c.restore(); continue; }
      if (typeof Rig !== 'undefined' && Rig.has('chick')) Rig.draw(c, 'chick', { fed, gape: (s.phase === 'hunt' || s.phase === 'dawn') && fed < 1 }, p[0], p[1] + dy, { size: 30, state: v.chick[k] > 0 ? 'alert' : null, alert: v.chick[k] });
      else { c.beginPath(); c.arc(p[0], p[1] + dy, 9 + 3 * fed, 0, TAU); c.fillStyle = '#B9AF9E'; c.fill(); }
    }
  },
  drawTimer(c, W) {   // a thin bar under the HUD band; a miss flinches it 4 px
    const s = this.sim.s, v = this.v, y = this.hudH() + 1, f = s.looks != null ? Math.max(0, Math.min(1, s.looks / Math.max(1, Math.round(s.quota * 4 / 3)))) : Math.max(0, Math.min(1, s.time / Math.max(1, s.time0 || this.P.time.v))), dx = v.flinch > 0 ? (v.flinch > 0.5 ? 4 : -4) * v.flinch : 0;
    c.save(); c.fillStyle = 'rgba(27,22,18,.55)'; c.fillRect(8, y, W - 16, 6); c.fillStyle = typeof Pal !== 'undefined' ? Pal.paper : '#E8DFC9'; c.fillRect(9 + dx, y + 1, (W - 18) * f, 4);
    if (v.chunk && s.looks == null) { const tot = Math.max(1, s.time0 || this.P.time.v), cw = (W - 18) * v.chunk.w / tot, k = v.chunk.t / 0.45; c.globalAlpha = 1 - k; c.fillRect(9 + dx + (W - 18) * f, y + 1 + 6 * k, cw, 4); }   // the search time falls off the end of the bar
    c.restore();
  },
  gaugeAt(q) { const W = Stage.w, gw = Math.min(220, W - 190); if (gw < 80 || q == null) return null; return [W - 16 - gw + Math.max(0, Math.min(1, q)) * gw, this.hudH() + 20]; },
  drawGauge(c, W) {   // the live graph in the scene (rung 1): mean camouflage, one tick a generation, creeping towards the bark
    const s = this.sim.s, v = this.v; if (!s.camo.length) return;
    const gw = Math.min(220, W - 190), x0 = W - 16 - gw, y = this.hudH() + 20, hgt = 12; if (gw < 80) return;
    if (!this._grad || this._grad.x0 !== x0 || this._grad.gw !== gw) { const g = c.createLinearGradient(x0, 0, x0 + gw, 0); for (let i = 0; i <= 8; i++) g.addColorStop(i / 8, css(t2rgb(0.85 * i / 8, 0.86))); this._grad = { x0, gw, g }; }
    c.save(); c.fillStyle = this._grad.g; rrect(c, x0, y, gw, hgt, 6); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke();
    const X = q => x0 + Math.max(0, Math.min(1, q)) * gw;
    c.lineWidth = 2; c.strokeStyle = 'rgba(27,22,18,.75)'; for (let i = 0; i < s.camo.length - 1; i++) { const x = X(s.camo[i]); c.beginPath(); c.moveTo(x, y - 3); c.lineTo(x, y + hgt + 3); c.stroke(); }
    const mx = X(v.gaugeM == null ? s.camo[s.camo.length - 1] : v.gaugeM);
    c.beginPath(); c.moveTo(mx, y + hgt + 2); c.lineTo(mx - 7, y + hgt + 11); c.lineTo(mx + 7, y + hgt + 11); c.closePath(); c.fillStyle = '#F4EEDD'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke();
    c.restore();
    if (typeof Lbl !== 'undefined') { const L = this.content.labels; Lbl.put('lw-camo', L.camo, x0, y + hgt + 22, { align: 'left', size: 12, c }); Lbl.put('lw-bark', L.bark, x0 + gw, y + hgt + 22, { align: 'right', size: 12, c }); }
  },
  pattern(c, k, x, y, w, h) {   // the three looks as pattern, never hue alone: dark band, pale blotches, dark specks
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = k === 0 ? '#8B877C' : k === 1 ? '#B4B0A2' : '#A29E91'; c.fillRect(x, y, w, h);
    if (k === 0) { c.fillStyle = '#3E3B35'; c.fillRect(x, y + h * 0.35, w, h * 0.32); }
    if (k === 1) { c.fillStyle = '#E4E0D2'; for (let i = 0; i < w; i += 9) { c.beginPath(); c.ellipse(x + i + 4, y + h * ((i / 9) % 2 ? 0.3 : 0.7), 3, 2.4, 0, 0, TAU); c.fill(); } }
    if (k === 2) { c.fillStyle = '#2E2C28'; for (let i = 0; i < w; i += 4) for (let j = 0; j < h; j += 4) if ((i * 7 + j * 13) % 3 === 0) { c.beginPath(); c.arc(x + i + 2, y + j + 2, 0.9, 0, TAU); c.fill(); } }
    c.restore();
  },
  drawShares(c, W) {   // boss: the share of each look in the whole wood, as a patterned bar
    const s = this.sim.s, f = s.trail.length ? s.trail[s.trail.length - 1] : [0, 0, 1], gw = Math.min(220, W - 190), x0 = W - 16 - gw, y = this.hudH() + 18, h = 16; if (gw < 80) return;
    let x = x0; const L = this.content.labels;
    for (let k = 0; k < 3; k++) { const w = f[k] * gw; if (w > 0.5) this.pattern(c, k, x, y, w, h); x += w; }
    c.save(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; rrect(c, x0, y, gw, h, 4); c.stroke(); x = x0; for (let k = 0; k < 2; k++) { x += f[k] * gw; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + h); c.stroke(); } c.restore();
    const pcs = [0, 1, 2].map(k => Math.round(f[k] * 100)), letters = ['B', 'M', 'S'];   // a swatch, a letter and a share for each look, evenly spaced
    for (let k = 0; k < 3; k++) { const sx = x0 + k * gw / 3 + 2, sy = y + h + 8; this.pattern(c, k, sx, sy, 11, 11); c.save(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.strokeRect(sx, sy, 11, 11); c.restore(); if (typeof Lbl !== 'undefined') Lbl.put('lw-sh' + k, letters[k] + ' ' + pcs[k] + '%', sx + 14, sy + 5.5, { align: 'left', size: 12, c }); }
  },
  jay(c, x, y, s, flap, a) {   // a ghost jay in flight: an ink silhouette with a paper rim (a designed stand-in for every jay in the wood)
    c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; c.lineJoin = 'round';
    const wy = -14 * flap;
    c.beginPath();
    c.moveTo(-16, 1); c.quadraticCurveTo(-4, -6, 9, -3); c.quadraticCurveTo(14, -7, 18, -4); c.lineTo(23, -2.5); c.lineTo(18, -1); c.quadraticCurveTo(14, 4, 6, 4); c.quadraticCurveTo(-6, 6, -16, 1); c.closePath();   // body, head, beak
    c.moveTo(-14, 0); c.lineTo(-27, -3); c.lineTo(-28, 4); c.lineTo(-14, 3); c.closePath();   // tail
    c.moveTo(-6, -2); c.lineTo(4 - 4 * flap, -4 + wy); c.lineTo(8, -2); c.closePath();   // the far wing
    c.lineWidth = 4 / s; c.strokeStyle = '#F4EEDD'; c.stroke(); c.fillStyle = '#1B1612'; c.fill();
    c.beginPath(); c.arc(14.5, -4.2, 1.1, 0, TAU); c.fillStyle = '#F4EEDD'; c.fill();
    c.restore();
  },
  drawJays(c, W, H) {   // dusk: thumbnails of the other three trunks, a ghost jay swooping over each and taking what your rule would
    const s = this.sim.s, v = this.v, calm = typeof Fx !== 'undefined' && Fx.calm, n = s.jays.length, gap = 8, tw = Math.min(118, (W - 28 - gap * (n - 1)) / n), th = tw * 0.95;
    const x0 = (W - (n * tw + (n - 1) * gap)) / 2, y0 = this.hudH() + 68, t = v.jayT;
    s.jays.forEach((j, n2) => {
      const x = x0 + n2 * (tw + gap), tex = this.barkTex(this.trunkKind(j.tr), W, H), slide = calm ? 1 : Math.min(1, t / 0.3);
      c.save(); c.globalAlpha = slide; c.beginPath(); rrect(c, x, y0, tw, th, 8); c.save(); c.clip(); c.drawImage(tex.cv, 0, 0, tex.cv.width * 0.25, tex.cv.height * 0.25, x, y0, tw, th); c.fillStyle = 'rgba(20,28,48,.3)'; c.fillRect(x, y0, tw, th); c.restore();
      c.lineWidth = 2; c.strokeStyle = '#1B1612'; rrect(c, x, y0, tw, th, 8); c.stroke();
      const all = j.left.map(m => [m, 1]).concat(j.got.map(m => [m, 0])), cols = 6, cw = (tw - 12) / cols, took = calm ? (t > 0.2 ? 1 : 0) : Math.max(0, Math.min(1, (t - 0.35) / 0.9));
      all.forEach(([m, alive], i) => {
        const cx = x + 6 + (i % cols + 0.5) * cw, cy = y0 + 8 + (Math.floor(i / cols) + 0.5) * cw * 0.85, r = Math.max(2.4, cw * 0.28), gone = !alive && i - j.left.length < took * j.got.length;
        c.beginPath(); if (m === 0) c.arc(cx, cy, r, 0, TAU); else if (m === 1) c.rect(cx - r, cy - r, 2 * r, 2 * r); else { c.moveTo(cx, cy - r * 1.2); c.lineTo(cx + r * 1.1, cy + r * 0.8); c.lineTo(cx - r * 1.1, cy + r * 0.8); c.closePath(); }
        if (gone) { c.setLineDash([2, 2]); c.lineWidth = 1; c.strokeStyle = '#E8DFC9'; c.stroke(); c.setLineDash([]); } else { c.fillStyle = '#E8DFC9'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke(); }
      });
      if (!calm && t > 0.3 && t < 1.5) { const p = (t - 0.3) / 1.2, jx = x - 24 + p * (tw + 48), jy = y0 + th * 0.62 - Det.sin(p * Math.PI) * th * 0.42; this.jay(c, jx, jy, Math.max(0.8, tw / 80), 0.5 + 0.5 * Det.sin(t * 20), 0.92); }
      else if (calm && t > 0.2) this.jay(c, x + tw * 0.5, y0 + th * 0.2, Math.max(0.8, tw / 80), 0.5, 0.92);
      c.restore();
      if (typeof Lbl !== 'undefined') Lbl.put('lw-jt' + n2, this.content.labels[this.trunkKind(j.tr)], x + tw / 2, y0 + th + 12, { size: 12, c });
    });
    if (typeof Lbl !== 'undefined' && s.b != null) Lbl.put('lw-b', Txt.f(this.content.labels.b, { b: s.b.toFixed(1) }), W / 2, y0 + th + 36, { size: 14, c, mono: true });
  },
  drawLabels(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels; if (typeof Lbl === 'undefined') return;
    if (v.banner) { const b = v.banner, a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; Lbl.put('lw-banner', b.text, W / 2, this.rect().y + 22, { size: 22, c, weight: 700 }); c.restore(); }   // under the HUD, not over the first moths
    if (s.level === 3 && s.phase === 'hunt' && v.streak >= 2 && s.si && s.si.run >= 2) Lbl.put('lw-streak', Txt.f(L.streak, { n: s.si.run }), 14, this.hudH() + 72, { align: 'left', size: 13, c, mono: true });
    if (s.level === 3 && (s.phase === 'hunt' || s.phase === 'dawn')) Lbl.put('lw-trunk', Txt.f(L.trunk, { n: s.trunk + 1 }) + ' ' + L[this.trunkKind(s.trunk)].toLowerCase(), 14, H - 16, { align: 'left', size: 12, c });
    if (this.canFF(s) && !v.ff && !(s.level === 3 && s.jays && s.dk === 'fall')) Lbl.put('lw-ff', L.ff, W - 16, this.hudH() + 80, { align: 'right', size: 12, c });   // a dusk seen before can be sped up
    const xn = s.level === 0 ? L.xn0 : s.level === 3 ? L.xn3 : L.xn1, T = v.tray;   // the ×N pill names its parameter: eggs (L0), selection (L1–L2), years (boss)
    if (s.phase === 'auto') Lbl.put('lw-xn', L.xn3, 14, H - 16, { align: 'left', size: 12, c });
    else if (T && (s.phase === 'dusk' && s.dk !== 'fall' || s.phase === 'ask' && s.level < 3)) Lbl.put('lw-xn', xn, T.x + T.w / 2, T.y - 22, { size: 12, c });
  },

  /* ---------- the live strip (notes() is the LiveGraph data provider) ---------- */
  notes() {
    const s = this.sim.s, L = this.content.labels, pc = v => Math.round(v * 100) + '%'; if (!s) return { stats: [], charts: [] };
    const D = this.content.data, Tt = D.titles, last = s.hist[s.hist.length - 1], stats = [[D.gen[0], Txt.f(D.gen[1], { g: Math.min(s.gen, s.gens), n: s.gens }), D.gen[2]]];
    const sgn = v => (v >= 0 ? '+' : '−') + Math.abs(Math.round(v * 100));
    if (s.level === 3) {
      const f = s.trail[s.trail.length - 1] || [0, 0, 1], pts = [{ f, kind: 'dusk', label: Math.max(f[0], f[1], f[2]) > 0.8 ? '' : D.axis.now }];   // no label where it would sit on a corner name
      stats.push([D.shares[0], f.map(pc).join(', '), D.shares[1]]);
      if (s.b != null) stats.push([D.b[0], s.b.toFixed(2), D.b[1]]);
      const tri = { type: 'tri', title: Tt.tri, variant: 'simplex', corners: [L.band, L.mottle, L.speck], trail: s.trail.slice(), pts, frame: 'designed' };
      const ser = [[], [], []];
      for (const m of s.mornings.concat(s.diet && s.mornings.indexOf(s.diet) < 0 && s.diet.catches.length ? [s.diet] : [])) {
        const a = m.avail, ta = a[0] + a[1] + a[2], cc = this.sim.counts(s, m.catches), tc = cc[0] + cc[1] + cc[2]; if (!ta || !tc) continue;
        for (let k = 0; k < 3; k++) if (a[k]) ser[k].push([a[k] / ta, cc[k] / tc]);
      }
      const b = s.b || 1, fit = []; for (let i = 0; i <= 20; i++) { const x = i / 20, y1 = x > 0 ? Det.pow(x, b) : 0, y0 = x < 1 ? Det.pow(1 - x, b) : 0; fit.push([x, y1 + y0 > 0 ? y1 / (y1 + y0) : x]); }
      const sc = { type: 'scatter', title: Tt.diet, x: { lo: 0, hi: 1, label: L.avail, fmt: 'pct' }, y: { lo: 0, hi: 1, label: L.diet, fmt: 'pct' }, ref: 'diag', fit: s.mornings.length ? fit : null, frame: 'designed',
        series: [{ pts: ser[0], shape: 'disc', label: L.band }, { pts: ser[1], shape: 'square', label: L.mottle }, { pts: ser[2], shape: 'tri', label: L.speck }] };
      return { stats, charts: [tri, sc] };
    }
    const iv = m => this.sim.idx(s, m), groups = [], young = s.phase === 'hatch' && s.next ? s.next.map(iv) : null;
    const yday = last && last.gen === s.gen - 1 && s.eaten === 0 && (s.phase === 'dawn' || s.phase === 'hunt'), young2 = yday ? this.visible().map(iv) : young;
    if (last && (s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'hatch' || yday)) {   // yesterday's selection and today's young stay up until your first peck
      groups.push({ v: last.ev, style: 'hollow', label: L.eaten }, { v: last.sv, style: 'solid', label: L.spared });
      if (young2) groups.push({ v: young2, style: 'hatched', label: L.young });
    } else groups.push({ v: this.visible().filter(m => m.a === 1).map(iv), style: 'solid', label: L.spared }, { v: this.visible().filter(m => m.a !== 1).map(iv), style: 'hollow', label: L.eaten });
    const dots = { type: 'dots', title: Tt.dots, bins: 20, x: { lo: 0, hi: 1, label: L.camo, fmt: 'pct' }, groups, marker: { v: 1, label: L.bark }, frame: 'designed' };
    if (last && last.S != null && (s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'hatch' || yday)) dots.arrows = young2 ? { S: [last.mAll, last.mSurv], R: [last.mAll, last.mOff != null ? last.mOff : this.sim.mean(young2)] } : { S: [last.mAll, last.mSurv] };
    if (last && last.S != null) {
      stats.push([D.S[0], Txt.f(D.S[1], { v: sgn(last.S) }), D.S[2]]);
      if (last.R != null) stats.push([D.R[0], Txt.f(D.R[1], { v: sgn(last.R) }), D.R[2]]);
      if (s.level !== 1 || s.named || s.whatif) stats.push([D.h2[0], last.h2.toFixed(2), D.h2[1]]);   // L1 names h² only after the third prediction
      if (last.R != null && Math.abs(last.S) > 0.01 && s.level > 0) stats.push([D.rs[0], (last.R / last.S).toFixed(2), D.rs[1]]);   // realised, after the reveal (teacher prompt 2)
    }
    if (s.level === 0) {
      const B = s.brood || (s.hist.length ? { E: Math.round(this.P.eggs.v * 30), K: 30 } : null), eaten = last ? last.eaten : s.eaten;
      const preK = (s.phase === 'dusk' && s.dk !== 'cull') || (s.phase === 'ask' && s.askAt === 'eggs');
      const bars = { type: 'lw_bars', title: Tt.bars, y: { lo: 0, hi: B ? B.E : 300, fmt: 'int' }, bars: [{ v: B ? B.E : 0, label: L.eggs, style: 'hatched' }, { v: B && !preK ? B.K : 0, label: L.spring, style: 'solid' }, { v: eaten, label: L.eaten, style: 'hollow' }], frame: 'designed' };
      const pin = typeof Pin !== 'undefined' ? Pin.list.filter(p => s.pins.indexOf(p.id) >= 0).pop() : null;
      if (pin && pin.ph) dots.marker = { v: pin.ph.tone / 0.85, label: L.pinned };
      const hideK = preK && !s.whatif && this.sim.cfg(0).ask[s.gen] === 'count';   // the egg question: no K in the table either
      stats.push([D.eggs[0], B ? (hideK ? String(B.E) : Txt.f(D.eggs[1], { e: B.E, k: B.K })) : '—', D.eggs[2]]);
      return { stats, charts: [bars, dots] };
    }
    const ghost = [s.camo[0]]; for (const r of s.hist) if (r.h2 != null && r.R != null) ghost.push(r.mAll + (s.whatif === 'noinherit' && r === last ? 0 : r.h2) * r.S);   // No inheritance: the replayed generation's expectation is the old mean   // an expected point appears only once its generation is revealed: never the answer while you predict
    const trace = { type: 'trace', title: Tt.trace, x: { lo: 1, hi: s.gens + 1, label: D.axis.gen }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: s.camo.slice(), ink: 'ink', label: D.axis.real }], ghost: [{ d: ghost, label: D.axis.exp }], frame: 'designed' };
    return { stats, charts: [dots, trace] };
  }
};
V2.push(CH_LICHEN_V2);

/* ---------- a bar chart for the live strip (L0: eggs, places in spring, eaten). Engine request: a 'bars' LiveGraph type ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.lw_bars) LiveGraph.T.lw_bars = {
  lay(w, h, spec, T, c) { const n = (spec.bars || []).length || 1; return wgXY(w, h, Object.assign({}, spec, { x: { lo: -0.5, hi: n - 0.5 } }), T, c, { xlo: -0.5, xhi: n - 0.5, ylo: 0, yhi: (spec.y && spec.y.hi) || 1, labels: [] }); },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, bars = spec.bars || [], bw = Math.min(56, p.w / Math.max(1, bars.length) * 0.6);
    wgAxes(c, G, spec, T, { noX: true });
    bars.forEach((b, i) => {
      const x = G.X(i) - bw / 2, y = G.Y(Math.max(0, b.v)), hh = p.y + p.h - y;
      if (hh > 0.5) { if (b.style === 'solid') { c.fillStyle = I.text; c.fillRect(x, y, bw, hh); } else { c.lineWidth = 1.5; c.strokeStyle = I.text; c.strokeRect(x + 0.75, y + 0.75, bw - 1.5, hh - 1.5); if (b.style === 'hatched') wgHatch(c, x, y, bw, hh, I.text, 5); } }
      wgText(c, b.label, G.X(i), p.y + p.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
      if (b.v > 0) { const above = y - G.tk - 2 > p.y; if (above || hh > G.tk + 4) wgText(c, String(Math.round(b.v)), G.X(i), above ? y - G.tk / 2 - 2 : y + G.tk / 2 + 3, G.tk, I.text, { align: 'center', wt: 700, halo: I.surface }); }   // a full bar carries its count inside, on a halo over the hatching
    });
  },
  rows(spec) { return { head: ['', 'count'], rows: (spec.bars || []).map(b => [b.label, String(Math.round(b.v))]) }; },
  say(spec) { return (spec.bars || []).map(b => b.label + ' ' + Math.round(b.v)).join(', '); }
};

/* ---------- procedural bark: the Wood's ground (D4 Field Plate). kind 'lichen' (L0–L2, mean shade ≈ 0.85), 'birch' (≈ 0.8),
   'oak' (≈ 0.42); shades in the moths' own colour space (t2rgb), so a moth of shade t sits on bark of shade t. View-only: never in the sim. ---------- */
function LW_BARK(w, h, d, sv, kind) {
  const Wp = Math.round(w * d), Hp = Math.round(h * d), cv = mkCanvas(Wp, Hp), c = cv.getContext('2d'), im = c.createImageData(Wp, Hp), D = im.data;
  const n1 = makeNoise(sv), n2 = makeNoise(sv + 11), n3 = makeNoise(sv + 23), n4 = makeNoise(sv + 37);
  let sT = 0, sH = 0;
  for (let y = 0; y < Hp; y++) {
    const Y = y / d;
    for (let x = 0; x < Wp; x++) {
      const X = x / d; let t, hh;
      if (kind === 'oak') {
        const f = fbm(n1, X * 0.085, Y * 0.011, 3), ridge = 1 - Math.abs(f * 2 - 1), fur = smooth(0.55, 0.97, ridge), sp = n3(X * 0.5, Y * 0.5), l = fbm(n2, X * 0.04, Y * 0.04, 3), li = smooth(0.74, 0.8, n4(X * 0.09, Y * 0.09) * 0.6 + l * 0.4);
        t = 0.58 + 0.1 * (sp - 0.5) + 0.1 * (l - 0.5) - 0.3 * fur + 0.28 * li; hh = 0.2 + 0.1 * (l - 0.5) + 0.5 * li;
      } else if (kind === 'birch') {
        const l = fbm(n2, X * 0.02, Y * 0.07, 3), sp = n3(X * 0.6, Y * 0.6), len = smooth(0.74, 0.8, n1(X * 0.05, Y * 0.55)), f = fbm(n4, X * 0.02, Y * 0.008, 3), cr = smooth(0.93, 0.985, 1 - Math.abs(f * 2 - 1));
        t = 0.93 + 0.06 * (l - 0.5) + 0.05 * (sp - 0.5) - 0.42 * len - 0.6 * cr; hh = 0.86 + 0.1 * (l - 0.5);
      } else {
        const f = fbm(n1, X * 0.05, Y * 0.011, 3), ridge = 1 - Math.abs(f * 2 - 1), crack = smooth(0.82, 0.97, ridge), l = fbm(n2, X * 0.05, Y * 0.05, 4), sp = n3(X * 0.55, Y * 0.55), bl = n4(X * 0.14, Y * 0.14);
        const cov = smooth(0.26, 0.4, l + 0.12 * (bl - 0.5)), tb = 0.62 + 0.12 * (f - 0.5) + 0.08 * (sp - 0.5), tl = 0.9 + 0.12 * (bl - 0.5) + 0.12 * (sp - 0.5) + 0.05 * (l - 0.5);
        t = lerp(tb, tl, cov) - 0.3 * crack * (1 - cov * 0.7); hh = lerp(0.55, 0.92 + 0.1 * (bl - 0.5), cov);
      }
      t = clamp(t, 0, 1); hh = clamp(hh, 0, 1); sT += t; sH += hh;
      const rgb = t2rgb(t, hh), i = (y * Wp + x) * 4; D[i] = rgb[0]; D[i + 1] = rgb[1]; D[i + 2] = rgb[2]; D[i + 3] = 255;
    }
  }
  c.putImageData(im, 0, 0);
  return { cv, T: sT / (Wp * Hp), H: sH / (Wp * Hp) };
}

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 (the legacy chapter keeps its words) ---------- */
if (!Url.v1) {
  TAKE.lichen = LW_TEXT.take;
  MODEL.lichen = 'Shade is set by four genes of equal, additive effect plus developmental noise; survivors pair at random and lay 300 eggs between them, and a random winter cull keeps 30. In the boss, designed ghost jays copy your own hunting rule on the trunks you are not hunting.';
  RECALL.lichen = { q: 'Survivors were 10 points better hidden than their generation; their young were 4 points better. What is the realised heritability?', opts: [['04', '0.4'], ['4', '4'], ['01', '0.1']], ans: '04', why: 'Response ÷ selection: R/S = 4/10 = 0.4. Breeders write R = h²S.' };
}
