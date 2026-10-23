/* ================= v2/commons.js: The Commons (id 'commons'), the Wave 2 rebuild =================
   D3 §4.5 and D2 §4 (MERGE with TB Commons; gains the siderophore boss), cut down by D6 decision 9 (simple beats clever)
   and decision 10 (real biology). World: a glowing microfluidic droplet chip under a fluorescence microscope. Pseudomonas
   aeruginosa cells: producers secrete the golden siderophore pyoverdine, which grabs iron that any cell may take up;
   cheats (non-producers) take the iron without paying to make it. Role: experimenter (the player sets population
   structure, never a cell's strategy). One verb: TAP A DROPLET TO SPLIT IT IN TWO. Then Grow, and the droplets pool back
   into the flask. Four levels, one idea each: cheats win inside a shared droplet (L1); Simpson's paradox and the Price
   equation, with the chapter's one prediction (L2); few founders make clone droplets, Hamilton's rule r·b > c (L3);
   the boss, local competition, where every droplet sends back only what it started with and clones stop helping
   (Griffin, West & Buckling 2004). Within a droplet a cell's own siderophore is a vanishing share of the pool, so there
   is no self-benefit: every gain comes from clone-mates (no "weak altruism"; G4 sweep, West, Griffin & Gardner 2007).
   Headless sim (R() and + − × ÷ only); stars read the model's own expectation; juice from Sim.run's events only. */

const CM_M = { b: 1.2, c: 0.15, G: 4, clone: 17.6610 };   // benefit, cost, generations a round (all designed); clone = (1 + b − c)^G, a producer clone's growth a round
const CM_LV = [   // n cells sampled each round; maxD droplets the chip holds; p0 start share of producers
  { n: 32, maxD: 2, p0: 0.6, rounds: 3, local: false, ask: false, levers: ['clones'] },
  { n: 16, maxD: 8, p0: 0.5, rounds: 1, local: false, ask: true, levers: ['few', 'clones'] },
  { n: 32, maxD: 32, p0: 0.1, rounds: 3, local: false, ask: false, goal: 0.75, levers: ['equal', 'four'] },
  { n: 32, maxD: 32, p0: 0.5, rounds: 3, local: true, ask: false, tol: 0.02, levers: ['growth'] }
];
const CM_T = { load: 1.1, grow: 2.6, pool: 1.9, end: 1.3, auto: 0.14, ready: 0.35 };   // phase lengths (s)
// the world's paints (D6 decision 7): deep indigo dark field, golden pyoverdine glow, cyan droplet rims, rust iron
const CM_C = { bg0: '#07061A', bg1: '#141043', bg2: '#221B5E', grid: 'rgba(110,190,230,.07)', rim: '#5FD8EC', rimD: 'rgba(95,216,236,.35)', gold: '#F5C84C', goldL: '#FFE7A0',
  goldD: '#B8862A', halo: 'rgba(245,200,76,.30)', cheat: '#57D7EA', cheatF: '#1B2152', iron: '#D9733B', ironL: '#F2A06A', glass: 'rgba(160,220,240,.16)', ink: '#E9E6FF', dim: 'rgba(233,230,255,.6)' };

const CM_TEXT = {
  intro: {
    game: 'You run a microscope lab. Pseudomonas bacteria grow in droplets, and some cells release a siderophore (drawn gold) that grabs iron for everyone.',
    biology: 'Cheats take the iron without paying to make siderophore, so they out-grow producers in any shared droplet. Producers spread only when droplets keep relatives together.',
    how: 'Tap a droplet to split it in two; smaller droplets hold fewer founding cells. Press Grow, then watch the droplets pool back into the flask.'
  },
  firstWords: 'Tap the droplet to split it in two. Then press Grow and watch who wins inside each droplet.',
  hud: {
    split1: 'Split the flask sample into two droplets, then press Grow.',
    split: 'Tap droplets to split them. Press Grow when ready.',
    split2: 'Split the sample into small droplets, up to eight. Then press Grow.',
    full: 'The chip is full. Press Grow.',
    grow: 'Growing: producers pay for siderophore; every cell shares the iron.',
    gained: 'Cheats gained on producers inside every mixed droplet.',
    ask: 'Producers lost ground in every mixed droplet. After pooling: more producers, or fewer?',
    askPure: 'No droplet mixed both kinds. After pooling: more producers, or fewer?',
    pool: 'Pooling: each droplet sends its cells back to the flask.',
    poolLocal: 'Equal shares: each droplet sends back only as many cells as it started with.',
    price: 'Change = between + within: {b} + ({w}) = {t} points.',
    load: 'A fresh sample of {n} cells leaves the flask.',
    ham: 'Founders per droplet: {k}. Relatedness r = {r}. Producers spread if r×b > c.',
    local: 'Equal shares now. Can clone droplets still raise producers?',
    over: 'The experiment is done.',
    auto: 'What if? The same experiment, with one thing changed.'
  },
  whispers: {
    split: 'Split!', full: 'The chip is full.', single: 'One cell cannot split.', clone: 'A producer clone!', cheats: 'All cheats: no siderophore, iron locked away.',
    rose: 'Producers rose overall!', fell: 'Producers fell overall.', held: 'Producers held steady.', right: 'Right call!', wrong: 'Not this time.', grow: 'Tap Grow when ready.'
  },
  labels: {
    flask: 'culture flask', free: 'cheats pay nothing', lawP: 'producer ×(1+b·f−c)', lawC: 'cheat ×(1+b·f)', keyF: 'f = producer share', keyB: 'b = {b}', keyC: 'c = {c}', prod: 'producers {p}%', gens: '4 generations ×N', chip: 'droplet chip',
    clone: 'clone ×{g}', fell: '▼ {a}→{b}%', rose: '▲ {a}→{b}%', none: '×1', rb: 'r × b', c: 'c', rIs: 'r = {r}', yes: 'spreads', no: 'falls', even: 'break-even',
    between: 'between', within: 'within', total: 'total', eq: 'Δp = between + within', zero: 'between = 0', local: 'equal shares', grow: 'Grow', round: 'round {r}/{n}',
    tProd: 'Producers in flask', tPrice: 'Price’s two terms', axRound: 'round', you: 'you', sProd: 'Producers', sFound: 'Founders per droplet', sR: 'Relatedness r',
    sBetween: 'Between droplets', sWithin: 'Within droplets', sDrops: 'Droplets', more: 'More', fewer: 'Fewer', producer: 'producer', cheat: 'cheat'
  },
  panels: [],
  interesting: {
    whole: 'In round {r} you grew the sample whole, as one droplet. Producers fell {d} points that round.',
    flat: 'With so few droplets, each one mixed both kinds. Producers fell inside every droplet, and overall.',
    sorted: 'Every droplet held one kind only. Nothing was lost inside droplets; all the change came from between them.',
    fell: 'This time producers fell overall: no droplet was producer-rich enough to out-grow the losses inside the mixed ones.',
    slow: 'In round {r} your droplets held {k} founders each, and producers changed by only {d} points.',
    mixed: 'Mixed droplets cost producers {d} points under equal shares. Clone droplets only held them level.'
  },
  levers: { clones: 'Single cells', few: 'Two droplets', equal: 'Equal shares', four: 'Four founders', growth: 'Pool by growth' },
  whatifBody: {
    clones: 'Split down to single cells, every droplet became a clone. Producers went from {a}% to {b}%; you reached {c}%.',
    few: 'With only two droplets, both mixed producers and cheats. Producers went from {a}% to {b}% overall.',
    equal: 'With as many droplets as you made, but equal shares, producers went from {a}% to {b}%. You reached {c}%.',
    four: 'With four founders in every droplet, producers went from {a}% to {b}%. You reached {c}%.',
    growth: 'With as many droplets as you made, but pooled by growth, producers went from {a}% to {b}%. You held {c}%.'
  },
  take: 'Cheats win inside every shared group. Cooperation spreads when clone-mates grow together and compete with other groups.',
  body: 'Cheats out-grew producers inside every mixed droplet. Clone droplets of producers bloomed and out-grew the rest: selection between droplets beat selection within them. When every droplet sent back only what it started with, clones could no longer raise producers. You ended level 4 at {p}% producers.',
  law: { title: 'Levels of selection' },
  boss: { inverts: 'Under equal shares, clone droplets only stop the loss; they cannot raise producers.' },
  stars: {
    discover: 'Split every round in level 1, and rescue the producers in level 3.',
    predict: 'Call the overall change in level 2.',
    transfer: 'Hold producers steady under equal shares.'
  },
  levelStars: [
    { discover: 'Split the flask sample in all three rounds.' },
    { predict: 'Call whether producers rise or fall overall.' },
    { discover: 'Bring producers from 10% to 75% in three rounds.' },
    { transfer: 'Under equal shares, end within 2 points of 50%.' }
  ],
  levelTake: [
    'Inside a shared droplet, cheats skip the cost and still take the iron, so they out-grow producers.',
    'Producers fell inside every mixed droplet yet rose overall, because producer droplets grew more.',
    'Few founders make clone droplets. Producers spread when relatedness r × b beats the cost c.'
  ],
  levelBody: [
    'Producers went from {a}% to {b}%. Each generation a producer grows by 1 + b·f − c. A cheat grows by 1 + b·f, where f is the producer share around it. The cheat always wins by c.',
    'Price’s equation splits the change, in points: between droplets {bt}, within droplets {wi}, total {to}. Between: droplets with more producers grew more. Within: cheats gained inside each mixed droplet.',
    'Producers went from {a}% to {b}%. Your droplets held {k} founders on average. With b = 1.2 and c = 0.15, fewer than 8 founders lets producers spread.'
  ],
  captions: {
    liveSplit: '{n} droplets on the chip.', liveGrow: 'Droplets grow. Producer clones bloom; cheat clones stay dark.', livePool: 'Producers now {p} percent of the flask.',
    liveAsk: 'Prediction open: More or Fewer producers after pooling.', mProd: 'Share of producers in the culture flask.', mFound: 'Cells founding each droplet, on average.',
    mR: 'How much more alike droplet-mates are than random cells; about 1 ÷ founders.', mBetween: 'Points of change from droplets growing by different amounts.', mWithin: 'Points of change inside droplets, weighted by growth.', mDrops: 'Droplets on the chip now.'
  },
  model: [
    { level: 0, simulated: 'Each round 32 cells leave the flask and fill the chip. In a droplet with producer share f, a producer grows by 1 + b·f − c. A cheat grows by 1 + b·f. Droplets then pool by size.', simplification: 'Growth is computed exactly, with no drift inside droplets. A cell’s own siderophore is a vanishing share of the droplet’s pool. No cell gets back enough of its own to pay its cost. Cheats alone do not grow at all here; real ones grow a little.', params: [{ name: 'benefit b', value: 1.2, tag: 'designed' }, { name: 'cost c', value: 0.15, tag: 'designed' }, { name: 'generations a round', value: 4, tag: 'xN', real: 'a day’s growth is many more' }, { name: 'cells drawn', value: 'up to 48 a droplet', tag: 'xN', real: 'millions after growth' }], cannot: 'Siderophore leaking between droplets, iron levels that change, or cells that switch production off.', nature: 'Pseudomonas aeruginosa secretes pyoverdine when iron is scarce. Non-producing mutants out-grow producers in mixed iron-limited cultures (Griffin, West and Buckling 2004).', contested: false, refs: ['griffin2004', 'west2006', 'buckling2007'] },
    { level: 1, simulated: 'Sixteen cells, split into up to eight droplets at random, grow for one round. The flask’s change is split exactly into a between-droplet and a within-droplet term.', simplification: 'Price’s equation is an identity: the two terms always add up to the total change. Droplets are founded at random; nothing sorts producers together.', params: [{ name: 'cells', value: 16, tag: 'designed' }, { name: 'droplets', value: 'up to 8', tag: 'designed' }], cannot: 'Why droplets differ in nature; here the differences come only from small random samples.', nature: 'Chuang, Rivoire and Leibler (2009) built this paradox with engineered E. coli. Producers fell inside every group yet rose overall.', contested: false, refs: ['price1970', 'price1972', 'chuang2009'] },
    { level: 2, simulated: 'Thirty-two cells split into up to 32 droplets. Fewer founders make clone droplets. The relatedness r is measured from your droplets: how much more alike droplet-mates are than random cells. With random founders, r is about 1 ÷ founders.', simplification: 'Hamilton’s rule r × b > c holds exactly only for weak selection. Here selection is strong. Even so, the break-even sits near 8 founders, close to b ÷ c = 8.', params: [{ name: 'founders per droplet', value: '1 to 32', tag: 'designed' }, { name: 'break-even founders', value: 'b ÷ c = 8', tag: 'designed' }], cannot: 'Kin recognition. These cells cannot tell relatives; clone-mates simply grow side by side.', nature: 'Griffin and colleagues founded P. aeruginosa subpopulations from one clone or from a mix. Producers did better when relatedness was high (Griffin, West and Buckling 2004).', contested: false, refs: ['hamilton1964', 'griffin2004', 'fletcher2009', 'wgg2007'] },
    { level: 3, simulated: 'Equal shares: each droplet sends back as many cells as it started with, whatever it grew. Growth between droplets no longer counts; only change inside droplets does.', simplification: 'An all-or-nothing switch between pooling by growth and equal shares; real competition lies between the two.', params: [{ name: 'pooling', value: 'equal shares', tag: 'designed' }, { name: 'start', value: '50% producers', tag: 'designed' }], cannot: 'Partly local competition, or populations that grow in viscous media.', nature: 'In Griffin and colleagues’ experiment, the benefit of relatedness fell when subpopulations contributed equally. Theory predicts this (Taylor 1992). Thicker media can still favour producers (Kümmerli et al. 2009).', contested: false, refs: ['griffin2004', 'taylor1992', 'kummerli2009'] }
  ],
  why: {
    real: [
      'Iron is scarce in the body and in soil. Pseudomonas aeruginosa releases pyoverdine, a yellow-green fluorescent siderophore that binds iron outside the cell. Any cell with the right receptor takes the iron back in. That includes cells that made none (Griffin, West and Buckling 2004).',
      'Chuang, Rivoire and Leibler (2009) showed Simpson’s paradox in engineered E. coli. Producers of a shared signal fell inside every group. Yet they rose overall, because producer-rich groups grew more.',
      'Griffin and colleagues grew producers and non-producers in iron-limited medium. Producers did better when each subpopulation was founded by a single clone. That advantage shrank when every subpopulation contributed equally to the next round.'
    ],
    maths: [
      'In a droplet with producer share f, a producer grows by 1 + b·f − c. A cheat grows by 1 + b·f. So cheats gain by c every generation, whatever f is.',
      'Price (1972): Δp̄ = Cov(w, p) ÷ w̄ + E(w·Δp) ÷ w̄. The first term is selection between droplets; the second, change within them. The two always add to the total.',
      'r = Var(droplet share) ÷ (p(1 − p)): the part of the variation in type that lies between droplets. With k founders at random, r ≈ 1 ÷ k. So Hamilton’s rule r × b > c gives k < b ÷ c = 8. Under equal shares every w is 1, so Cov(w, p) = 0.'
    ]
  },
  data: {}
};

/* ---------- the model's maths: pure (+ − × ÷ only), shared by the sim, the stars, the bots and the oracle ---------- */
const CM = {
  grow(P, C, b, c, G) { for (let g = 0; g < G; g++) { const f = P / (P + C); P *= 1 + b * f - c; C *= 1 + b * f; } return [P, C]; },
  // Price partition for droplets [{n, P, gP, gC}] (founders n, producers P, grown counts); local: each droplet sends back n cells
  price(ds, local) {
    let N = 0; for (const d of ds) N += d.n; if (!(N > 0)) return { between: 0, within: 0, total: 0, pbar: 0, pnew: 0 };
    let pbar = 0, wbar = 0; const w = ds.map(d => local ? 1 : (d.gP + d.gC) / d.n);
    ds.forEach((d, i) => { pbar += d.n / N * (d.P / d.n); wbar += d.n / N * w[i]; });
    let cov = 0, ewd = 0, num = 0, den = 0;
    ds.forEach((d, i) => { const q = d.n / N, pg = d.P / d.n, pg2 = d.gP / (d.gP + d.gC); cov += q * (w[i] - wbar) * (pg - pbar); ewd += q * w[i] * (pg2 - pg); num += d.n * w[i] * pg2; den += d.n * w[i]; });
    const pnew = num / den; return { between: cov / wbar, within: ewd / wbar, total: pnew - pbar, pbar, pnew };
  },
  r(n, nd) { return nd > 0 ? nd / n : 0; },   // the random-founder expectation: 1 ÷ founders per droplet
  // relatedness measured from the droplets [{n, P}]: the between-droplet share of the variance in type, Σ n(f − p)² ÷ (N p(1 − p)).
  // 1 when every droplet is a clone, 0 for one droplet; about 1 ÷ founders for random even splits. null when only one type is left.
  rel(ds) { let N = 0, P = 0; for (const d of ds) { N += d.n; P += d.P; } const p = N > 0 ? P / N : 0; if (!(p > 0 && p < 1)) return null; let v = 0; for (const d of ds) { const f = d.P / d.n; v += d.n * (f - p) * (f - p); } return v / (N * p * (1 - p)); }
};

const CH_COMMONS_V2 = {
  id: 'commons', v2: true, role: 'experimenter', place: 'pond', accent: '#2C9DB0',   // cyan-teal: the chapter's chrome tint (D6 decision 7)
  plan: ['The Commons', 'Public goods and cheats'],
  cm: CM, cmLV: CM_LV, cmM: CM_M,   // the model's maths and level table, for tests/oracle_commons.js
  intro: { goal: 'Split droplets so siderophore producers out-grow cheats.' },
  content: CM_TEXT,
  P: {
    b: { v: CM_M.b, tag: 'designed', min: 0.2, max: 3, label: 'benefit b' },
    c: { v: CM_M.c, tag: 'designed', min: 0.02, max: 0.5, label: 'cost c' },
    G: { v: CM_M.G, tag: 'xN', min: 1, max: 10, real: 'a day’s growth is many more generations', label: 'generations a round' }
  },
  levels: [
    { name: 'Cheats inside', adds: 'cheats sharing a public good', codes: ['H3'], minutes: 1.5 },
    { name: 'Small droplets', adds: 'many small droplets', codes: ['H3'], minutes: 1.5 },
    { name: 'Clones', adds: 'founders per droplet', codes: ['H2', 'H3'], minutes: 2 },
    { name: 'Equal shares', adds: 'local competition', codes: ['H3'], minutes: 2 }
  ],
  keys: { ArrowLeft: 'select droplet', ArrowRight: 'select droplet', Space: 'split selected droplet', Enter: 'grow', M: 'more producers', F: 'fewer producers' },
  untimed: true,   // nothing waits on the clock: the player presses Grow
  teacher: { prompts: ['Why do cheats always gain inside a droplet that mixes them with producers?', 'Producers fell in every mixed droplet yet rose overall. Use the two Price terms to explain how.', 'This model gives no cell any of its own siderophore back. How would a little self-benefit change what counts as altruism?'], pool: 'trace' },
  starTraits: [],
  encodings: [   // producers: filled gold with a glow; cheats: hollow cyan outline (fill versus hollow, never hue alone)
    { k: 'producer', rgb: [245, 200, 76], channels: ['luminance', 'pattern'] },
    { k: 'cheat', rgb: [87, 215, 234], channels: ['pattern'] }
  ],
  // the unit's stars across levels (API_v2 §14.1): Discover needs L1 and L3; Predict is L2; Transfer is the boss
  unitStars(lv) { const has = (i, b) => !!((lv[i] || 0) & b); return (has(0, 1) && has(2, 1) ? 1 : 0) | (has(1, 2) ? 2 : 0) | (has(3, 4) ? 4 : 0); },

  /* ================= headless simulation (API_v2 §9.3): R() and plain arithmetic only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    reset(level, o) {
      o = o || {}; const L = CM_LV[level];
      if (o.thaw) {   // What if?: rerun the level from its start with one thing changed; an automatic experimenter splits as the lever says
        this.restore(o.thaw.snap); const prev = this.s, k = o.thaw.lever || null, plan = (prev.hist || []).map(h => h.nd);
        const s = this.fresh(level); s.auto = true; s.whatif = k; s.prevEnd = prev.p;
        if (k === 'clones') { s.maxD = L.n; s.plan = plan.map(() => L.n); }
        else if (k === 'few') s.plan = plan.map(() => 2);
        else if (k === 'four') s.plan = plan.map(() => L.n / 4);
        else { s.plan = plan.length ? plan : [1]; if (k === 'equal') s.local = true; if (k === 'growth') s.local = false; }
        while (s.plan.length < L.rounds) s.plan.push(s.plan[s.plan.length - 1] || 1);
        this.s = s; this.load(s); return;
      }
      this.s = this.fresh(level); this.load(this.s);
    },
    fresh(level) {
      const L = CM_LV[level];
      return { level, phase: 'load', pt: 0, t: 0, round: 0, rounds: L.rounds, n: L.n, maxD: L.maxD, local: L.local, p: L.p0, p0: L.p0, drops: [], hist: [], ask: null, pred: {}, asked: 0,
        splits: 0, rsplits: 0, unt: false, auto: false, whatif: null, plan: null, prevEnd: null, acc: 0, log: [] };
    },
    load(s) {   // a fresh sample leaves the flask: exactly round(n·p) producers (no sampling noise), in a random order, as one droplet
      const nP = Math.round(s.n * s.p), cells = []; for (let i = 0; i < s.n; i++) cells.push(i < nP ? 1 : 0);
      s.drops = [{ path: '', cells: this.shuffle(cells), g: null }]; s.phase = 'load'; s.pt = 0; s.rsplits = 0; s.acc = 0;
    },
    can(s, i) { const d = s.drops[i]; return !!d && d.cells.length >= 2 && s.drops.length < s.maxD; },
    split(s, i, ev) {
      if (!this.can(s, i)) { ev.push({ k: 'nosplit', i, why: s.drops.length >= s.maxD ? 'full' : 'single' }); return false; }
      const d = s.drops[i], c = this.shuffle(d.cells.slice()), h = Math.floor(c.length / 2);
      s.drops.splice(i, 1, { path: d.path + '0', cells: c.slice(0, h), g: null }, { path: d.path + '1', cells: c.slice(h), g: null });
      s.splits++; s.rsplits++; ev.push({ k: 'split', i, path: d.path, nd: s.drops.length }); return true;
    },
    count(d) { let P = 0; for (const x of d.cells) P += x; return P; },
    grow(s, ev) {
      for (const d of s.drops) { const P = this.count(d), C = d.cells.length - P, g = CM.grow(P, C, CM_M.b, CM_M.c, CM_M.G); d.g = { n: d.cells.length, P, gP: g[0], gC: g[1] }; }
      s.phase = 'grow'; s.pt = 0; ev.push({ k: 'grow', nd: s.drops.length });
    },
    priceNow(s) { return CM.price(s.drops.map(d => d.g), s.local); },
    pool(s, ev) {
      const pr = this.priceNow(s), ds = s.drops.map(d => d.g); let mixed = 0, fell = 0, pureP = 0, pureC = 0;
      for (const d of ds) { if (d.P > 0 && d.P < d.n) { mixed++; if (d.gP / (d.gP + d.gC) < d.P / d.n - 1e-12) fell++; } else if (d.P === d.n) pureP++; else pureC++; }
      s.hist.push({ round: s.round, pa: pr.pbar, pb: pr.pnew, nd: s.drops.length, k: s.n / s.drops.length, between: pr.between, within: pr.within, total: pr.total, mixed, fell, pureP, pureC, local: !!s.local });
      s.p = pr.pnew; s.phase = 'pool'; s.pt = 0; ev.push({ k: 'pool', total: pr.total, p: pr.pnew, pureP });
    },
    autoSplit(s, ev) {   // What if?: the automatic experimenter splits the biggest droplet until the plan's droplet count
      s.acc += 1; if (s.acc * this.dt < CM_T.auto) return; s.acc = 0;
      const want = Math.min(s.maxD, s.plan[Math.min(s.round, s.plan.length - 1)] || 1);
      if (s.drops.length < want) { let bi = -1, bn = 1; s.drops.forEach((d, i) => { if (d.cells.length > bn) { bn = d.cells.length; bi = i; } }); if (bi >= 0) { this.split(s, bi, ev); return; } }
      this.grow(s, ev);
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; s.pt += dt; const L = CM_LV[s.level];
      if (s.phase === 'load') { if (s.pt >= CM_T.load) { s.phase = 'split'; s.pt = 0; ev.push({ k: 'ready', round: s.round }); } }
      else if (s.phase === 'split') { if (s.auto && s.pt >= CM_T.ready) this.autoSplit(s, ev); }
      else if (s.phase === 'grow') {
        if (s.pt >= CM_T.grow) {
          const pr = this.priceNow(s); ev.push({ k: 'grown', clones: s.drops.filter(d => d.g.P === d.g.n).length });
          if (L.ask && !s.auto && !s.asked && Math.abs(pr.total) >= 0.01) { s.asked = 1; s.ask = { id: 'p1' }; s.phase = 'ask'; s.pt = 0; ev.push({ k: 'ask', id: 'p1' }); }
          else this.pool(s, ev);
        }
      }
      else if (s.phase === 'ask') { if (!s.ask) this.pool(s, ev); }
      else if (s.phase === 'pool') {
        if (s.pt >= CM_T.pool) { s.round++; if (s.round >= s.rounds) { s.phase = 'end'; s.pt = 0; ev.push({ k: 'end' }); } else { this.load(s); ev.push({ k: 'load', round: s.round }); } }
      }
      else if (s.phase === 'end') { if (s.pt >= CM_T.end) { s.phase = 'over'; ev.push({ k: 'over' }); } }
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (a.k === 'unt') { s.unt = !!a.on; return ev; }
      if (a.k === 'predict') {
        if (s.ask && a.id === s.ask.id) { s.pred[a.id] = a.v > 0 ? 1 : -1; s.ask = null; ev.push({ k: 'predicted', id: a.id, v: s.pred[a.id] }); }
        return ev;
      }
      if (s.auto || s.phase !== 'split') return ev;
      if (a.k === 'split') this.split(s, a.i | 0, ev);
      else if (a.k === 'grow') this.grow(s, ev);
      return ev;
    },
    expect(s, id) { if (id !== 'p1') return null; const d = s.drops; if (!d.length || !d[0].g) return null; return this.priceNow(s).total; },   // the call is scored against the model's own outcome
    hit(s) { const v = s.pred.p1; if (v == null) return false; const h = s.hist[0]; const t = h ? h.total : this.expect(s, 'p1'); return t != null && Math.abs(t) >= 0.01 && v === (t > 0 ? 1 : -1); },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_COMMONS_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { p0: s.p0, p: Math.round(s.p * 1000) / 1000, splits: s.splits }, interesting: s.whatif ? null : this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons rule 6)
      const H = s.hist, n = s.level;
      if (n === 0) { const h = H.find(x => x.nd < 2); return h ? 'whole' : null; }
      if (n === 1) { const h = H[0]; if (!h) return null; if (h.nd <= 2 && h.mixed === h.nd) return 'flat'; if (h.total <= 0) return 'fell'; if (!h.mixed) return 'sorted'; return null; }
      if (n === 2) { const h = this.slowRound(H); return h ? 'slow' : null; }
      const loss = s.p0 - s.p; return loss >= 0.01 ? 'mixed' : null;
    },
    iVars(s) {
      const H = s.hist, n = s.level, pts = x => Math.round(Math.abs(x) * 100);
      if (n === 0) { const h = H.find(x => x.nd < 2) || H[0]; return { r: h.round + 1, d: pts(h.total) }; }
      if (n === 1) { const h = H[0]; return { n: String(h.pureP), d: pts(h.total) }; }
      if (n === 2) { const h = this.slowRound(H) || H[0]; return { r: h.round + 1, k: Math.round(h.k), d: (h.total >= 0 ? '+' : '−') + pts(h.total) }; }
      return { d: pts(s.p0 - s.p) };
    },
    slowRound(H) { return H.find(x => x.k >= 4 && x.total < 0.05 && x.pa <= 0.8) || null; },   // a round of big droplets that had room to rise (not near 100%)
    wiVars(s) { const pc = x => Math.round(x * 100); return { a: pc(s.p0), b: pc(s.p), c: s.prevEnd == null ? '' : pc(s.prevEnd) }; },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) return [{ k: 'predict', id: s.ask.id, v: -1 }, { k: 'predict', id: s.ask.id, v: 1 }];
      if (s.auto || s.phase !== 'split') return out;
      if (s.drops.length < s.maxD) s.drops.forEach((d, i) => { if (d.cells.length >= 2) out.push({ k: 'split', i }); });
      out.push({ k: 'grow' }); return out;
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    biggest(s, mixedOnly) { let bi = -1, bn = 1; s.drops.forEach((d, i) => { const P = this.count(d), mix = P > 0 && P < d.cells.length; if (d.cells.length > bn && (!mixedOnly || mix)) { bn = d.cells.length; bi = i; } }); return bi; },
    bots: {
      alwaysA(s, acts) { return acts.length ? acts[0] : null; },   // split the first droplet until it is one cell, then the next … then grow; calls "fewer"
      alwaysB(s, acts) { return acts.length ? acts[acts.length - 1] : null; },   // never split: grow at once; calls "more"
      greedy(s, acts) {   // split the biggest droplet while there is room (an even split); calls the naive answer: producers fell inside, so fewer
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[0];
        const S = CH_COMMONS_V2.sim, i = s.drops.length < s.maxD ? S.biggest(s, false) : -1; return i >= 0 ? { k: 'split', i } : { k: 'grow' };
      },
      threshold(s, acts) {   // splits until droplets hold 4 founders (Hamilton's rule just met), then grows; calls "more"
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[1];
        const S = CH_COMMONS_V2.sim, i = s.drops.length < s.maxD && s.n / s.drops.length > 4 ? S.biggest(s, false) : -1; return i >= 0 ? { k: 'split', i } : { k: 'grow' };
      },
      noChange(s, acts) {   // splits evenly to the chip's limit and always answers "more"
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[1];
        return CH_COMMONS_V2.sim.bots.greedy(s, acts);
      },
      expert(s, acts) {   // skilled play (oracle only): split mixed droplets, biggest first, until every droplet is pure; call from the model
        if (!acts.length) return null; const S = CH_COMMONS_V2.sim;
        if (acts[0].k === 'predict') { const t = S.expect(s, s.ask.id); return t > 0 ? acts[1] : acts[0]; }
        const i = s.drops.length < s.maxD ? S.biggest(s, true) : -1; if (i >= 0) return { k: 'split', i };
        if (s.level === 0 && s.drops.length < 2) return { k: 'split', i: 0 };
        return { k: 'grow' };
      }
    }
  },

  /* ---- stars: pure functions of the final state (API_v2 §9.1). Each level offers one star, so none offers all three. ---- */
  stars: {
    discover: (s, n) => { if (n === 0) return s.hist.length === CM_LV[0].rounds && s.hist.every(h => h.nd >= 2); if (n === 2) return s.hist.length === CM_LV[2].rounds && s.p >= CM_LV[2].goal - 1e-9; return false; },
    predict: (s, n) => n === 1 && CH_COMMONS_V2.sim.hit(s),
    transfer: (s, n) => n === 3 && s.hist.length === CM_LV[3].rounds && Math.abs(s.p - s.p0) <= CM_LV[3].tol + 1e-9
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–12 final producer share ×1000 · 13–18 total splits
  resultBits(s) { const r = this.sim.result(); return ((r ? r.mask : 0) & 7) | (Math.min(1023, Math.round(s.p * 1000)) << 3) | (Math.min(63, s.splits) << 13); },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {}); this.level = n; this._ended = false; this._pend = false; this._dockSig = ''; this._said = {}; this._hudPx = 0;
    Sim.start(this, n, o);
    const unt = (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt) || (typeof Url !== 'undefined' && Url.untimed);
    if (unt && !o.thaw && !o.replay) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    this.v = { t: 0, dp: {}, sel: 0, sig: '', banner: null, flow: [], pAnim: this.sim.s.p, swipe: null, flash: {}, lastSay: '' };
    this.layout(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const s = this.sim.s, name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(1000, ms + 300) }; });
    if (!o.thaw && typeof Ghost !== 'undefined' && n === 0) {   // the hand demonstrates the split on the first droplet, then rings Grow
      Ghost.show({ verb: 'tap', at: () => { const d = this.dropXY(0); return [d.x, d.y]; }, until: () => this.sim.s.splits > 0 || this.sim.s.round > 0 });
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  onResize() { if (this.v) this.layout(); },
  layout() { this._g = null; this._bg = null; this.geo(); },

  /* ---------- geometry (canvas px), recomputed when the stage changes size ---------- */
  hudH() { return Math.max(56, this._hudPx || 0, (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 0); },
  measureHud() { const el = typeof document !== 'undefined' && document.getElementById ? document.getElementById('hud') : null; const h = el && el.offsetHeight ? el.offsetHeight : 0; if (h > (this._hudPx || 0)) { this._hudPx = h; this._g = null; } },
  geo() {
    const W = Stage.w, H = Stage.h, k = W + 'x' + H + 'x' + this.hudH();
    if (this._g && this._g.k === k) return this._g;
    const top = this.hudH() + 4, eqH = 40, resH = Math.round(Math.max(54, Math.min(76, H * 0.11))), resY = H - resH - 8, eqY = resY - eqH - 4;
    const cy0 = top + 4, ch = Math.max(120, eqY - 6 - cy0), cw = Math.min(W - 20, Math.max(ch * 1.1, Math.min(W - 20, ch * 2.3))), cx0 = Math.round((W - cw) / 2);
    this._g = { k, W, H, top, eqH, eqY, res: { x: Math.max(10, W / 2 - Math.min(W - 20, 560) / 2), y: resY, w: Math.min(W - 20, 560), h: resH }, chip: { x: cx0, y: cy0, w: cw, h: ch } };
    return this._g;
  },
  rects() {   // the treemap of droplets: each split halves its parent's cell along the longer side (deterministic for a viewport)
    const g = this.geo(), s = this.sim.s, have = {}, out = {}; for (const d of s.drops) have[d.path] = 1;
    const lay = (x, y, w, h, p, depth) => {
      if (have[p] || depth > 8) { out[p] = { x, y, w, h }; return; }
      if (w >= h) { lay(x, y, w / 2, h, p + '0', depth + 1); lay(x + w / 2, y, w / 2, h, p + '1', depth + 1); }
      else { lay(x, y, w, h / 2, p + '0', depth + 1); lay(x, y + h / 2, w, h / 2, p + '1', depth + 1); }
    };
    const C = g.chip; lay(C.x + 4, C.y + 4, C.w - 8, C.h - 8, '', 0); return out;
  },
  target(d, R) {   // where a droplet sits and how big it is drawn: founders small; after growth it swells with its growth (clones fill their cell)
    const s = this.sim.s, r = R[d.path] || { x: 0, y: 0, w: 10, h: 10 }, base = Math.max(6, Math.min(r.w, r.h) / 2 - 4);
    let u = 0; if (d.g) { const gr = (d.g.gP + d.g.gC) / d.g.n, k = s.phase === 'grow' ? Math.min(1, s.pt / CM_T.grow) : 1; u = k * Math.max(0, Math.min(1, (gr - 1) / (CM_M.clone - 1))); }
    return { x: r.x + r.w / 2, y: r.y + r.h / 2, r: Math.min(150, base * (0.62 + 0.38 * Math.sqrt(u))), base: Math.min(150, base) };
  },
  dropXY(i) { const s = this.sim.s, d = s.drops[Math.min(i, s.drops.length - 1)]; const v = d && this.v.dp[d.path]; if (v) return v; const t = d ? this.target(d, this.rects()) : { x: Stage.w / 2, y: Stage.h / 2, r: 30 }; return t; },
  syncDrops(dt) {   // cosmetic: ease every droplet towards its treemap cell
    const s = this.sim.s, R = this.rects(), v = this.v, keep = {}, k = Math.min(1, dt * 9);
    for (const d of s.drops) {
      const t = this.target(d, R), cur = v.dp[d.path]; keep[d.path] = 1;
      if (!cur) { const par = v.dp[d.path.slice(0, -1)]; const side = d.path.slice(-1) === '1' ? 1 : -1; v.dp[d.path] = par ? { x: par.x + side * par.r * 0.3 * (t.x !== par.x ? Math.sign(t.x - par.x) * side : 0), y: par.y + side * par.r * 0.3 * (t.y !== par.y ? Math.sign(t.y - par.y) * side : 0), r: par.r * 0.75, a: 1 } : { x: t.x, y: t.y, r: t.r * 0.4, a: 0 }; continue; }
      if (s.phase === 'pool') continue;   // pooling moves them (drawDrops)
      cur.x += (t.x - cur.x) * k; cur.y += (t.y - cur.y) * k; cur.r += (t.r - cur.r) * k; cur.b = t.base; cur.a = Math.min(1, (cur.a || 0) + dt * 3);
    }
    for (const p in v.dp) if (!keep[p]) delete v.dp[p];
  },
  hitDrop(x, y) { const s = this.sim.s; let bi = -1, bd = 1e9; s.drops.forEach((d, i) => { const q = this.v.dp[d.path]; if (!q) return; const dx = x - q.x, dy = y - q.y, dd = Math.sqrt(dx * dx + dy * dy); if (dd <= Math.max(q.r + 6, 22) && dd < bd) { bd = dd; bi = i; } }); return bi; },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; this.syncDrops(dt);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    for (let i = v.flow.length - 1; i >= 0; i--) { v.flow[i].u += dt / CM_T.load * 1.1; if (v.flow[i].u >= 1) v.flow.splice(i, 1); }
    for (const k in v.flash) { v.flash[k] -= dt; if (v.flash[k] <= 0) delete v.flash[k]; }
    v.pAnim += (s.p - v.pAnim) * Math.min(1, dt * (s.phase === 'pool' ? 2.2 : 6));
    if (v.sel >= s.drops.length) v.sel = s.drops.length - 1; if (v.sel < 0) v.sel = 0;
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, S = this.sim, final = n === CM_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (o.interesting) { C.interesting.now = Txt.f(C.interesting[o.interesting], S.iVars(s)); o.interesting = 'now'; }   // the engine shows the text as is: fill this run's numbers first
    const V = this.vars();
    if (s.whatif) { o.take = null; o.interesting = null; o.body = Txt.f(C.whatifBody[s.whatif] || '', S.wiVars(s)); }
    else if (!final) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }   // L2: a run without the paradox gets an Interesting text, which the card shows instead of the take
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    o.stars = C.levelStars[n];
    if (typeof Freezer !== 'undefined' && !s.whatif) { Freezer.put(this.id, 0, S.snapshot(), { force: true }); o.whatIf = { gen: 0, levers: CM_LV[n].levers }; }
    const spec = n === 1 && !s.whatif ? this.priceSpec() : this.traceSpec(true); o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title;
    End.show(this, o);
  },
  vars() {
    const s = this.sim.s, H = s.hist, pc = x => Math.round(x * 100), f3 = x => this.sgn(x);
    const h = H[H.length - 1] || { between: 0, within: 0, total: 0 }, kk = H.length ? H.reduce((a, x) => a + x.k, 0) / H.length : s.n;
    return { a: pc(s.p0), b: pc(s.p), p: pc(s.p), k: kk >= 10 ? Math.round(kk) : Math.round(kk * 10) / 10, bt: f3(h.between), wi: f3(h.within), to: f3(h.total) };
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {   // cosmetic (view-only maths)
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, g = this.geo();
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    if (e.k === 'split') {
      const q = v.dp[e.path]; if (q) { if (F) { F.ring(q.x, q.y, q.r * 0.9, { ms: 220 }); F.burst('droplet', q.x, q.y, 5, { ink: CM_C.rim }); if (F.squash) F.shake(1.5, 90); } snd('crack', q.x, q.y); }
      const kids = s.drops.filter(d => d.path.slice(0, -1) === e.path);
      for (const d of kids) { const P = this.sim.count(d); if (P === d.cells.length && P >= 1 && this.once('clone')) this.whisper('clone'); }
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveSplit, { n: e.nd }));
    }
    else if (e.k === 'nosplit') { const d = s.drops[e.i], q = d && v.dp[d.path]; if (q && F) F.ring(q.x, q.y, q.r + 6, { ms: 160, dashed: false }); this.whisper(e.why === 'full' ? 'full' : 'single'); }
    else if (e.k === 'grow') {
      if (F) F.tier(1, () => { }); snd('pour', g.chip.x + g.chip.w / 2, g.chip.y + g.chip.h / 2, { left: 0.8 });
      if (typeof Live !== 'undefined') Live.say(C.captions.liveGrow);
      if (s.drops.some(d => d.g && d.g.P === 0 && d.g.n >= 1) && this.once('cheats') && s.level >= 1) this.whisper('cheats');
    }
    else if (e.k === 'grown') {   // producer clones bloom: a spark burst on each, with a rising count
      let j = 0; for (const d of s.drops) { if (!d.g || d.g.P !== d.g.n) continue; const q = v.dp[d.path]; if (!q) continue; if (F && j < 12) F.burst('spark', q.x, q.y, 6, { ink: CM_C.goldL }); if (j < 6) snd('count', q.x, q.y, { i: j * 2 }); j++; }
      if (!j && F) F.ring(g.chip.x + g.chip.w / 2, g.chip.y + g.chip.h / 2, 30, { ms: 300 });
    }
    else if (e.k === 'ask') { if (F) F.ring(g.res.x + g.res.w / 2, g.res.y + g.res.h / 2, 40, { ms: 400 }); if (typeof Live !== 'undefined') Live.say(C.captions.liveAsk); }
    else if (e.k === 'predicted') { const ok = this.sim.hit(Object.assign({}, s, { hist: [] })); this.whisper(ok ? 'right' : 'wrong'); snd(ok ? 'interesting' : 'tock', g.res.x + g.res.w / 2, g.res.y); }
    else if (e.k === 'pool') {
      const up = e.total > 0.005, dn = e.total < -0.005, cx = g.res.x + g.res.w / 2, cy = g.res.y + g.res.h / 2;
      if (F) { F.tier(2, () => { }); F.pop((e.total >= 0 ? '+' : '−') + Math.round(Math.abs(e.total) * 100) + ' pts', cx, cy - g.res.h * 0.75, up ? 1 : dn ? -1 : 0); }
      snd('swish', cx, cy);
      if (up && e.total > 0.25 && F) F.tier(3, ms => { v.banner = { text: C.whispers.rose, t: 0, ms: Math.max(900, ms) }; });   // a big rise gets the banner, not a whisper too
      else this.whisper(up ? 'rose' : dn ? 'fell' : 'held');
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.livePool, { p: Math.round(e.p * 100) }));
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'load') { v.flow.push({ u: 0 }); v.dp = {}; snd('tick', g.res.x + g.res.w / 2, g.res.y); }
    else if (e.k === 'ready') { const q = this.dropXY(0); if (F) F.ring(q.x, q.y, (q.r || 30) + 8, { ms: 300 }); }
    else if (e.k === 'end' || e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'cm-' + k); },

  /* ---------- input: tap (or swipe through) a droplet to split it; keys select and split; Grow in the dock ---------- */
  down(x, y) { if (y < this.hudH()) return; this.v.swipe = { x, y, hit: {} }; this.trySplit(x, y); },
  move(x, y) { const sw = this.v.swipe; if (!sw) return; this.trySplit(x, y); },
  up() { this.v.swipe = null; },
  trySplit(x, y) {
    const s = this.sim.s, sw = this.v.swipe; if (s.phase !== 'split' || s.auto) return;
    const i = this.hitDrop(x, y); if (i < 0) return; const d = s.drops[i]; if (sw && sw.hit[d.path.slice(0, -1)] || sw && sw.hit[d.path]) return;   // a swipe splits each droplet it crosses once
    if (sw) sw.hit[d.path] = 1; this.v.sel = i; Sim.act(this, { k: 'split', i });
  },
  onKey(k) {
    const s = this.sim.s;
    if (s.ask) { if (k === 'm' || k === 'M') this.answer(1); else if (k === 'f' || k === 'F') this.answer(-1); return; }
    if (k.indexOf('Arrow') === 0 || k === ' ' || k === 'Spacebar') this.v.kb = true;
    if (k === 'ArrowRight' || k === 'ArrowDown') this.v.sel = (this.v.sel + 1) % Math.max(1, s.drops.length);
    else if (k === 'ArrowLeft' || k === 'ArrowUp') this.v.sel = (this.v.sel - 1 + s.drops.length) % Math.max(1, s.drops.length);
    else if (k === ' ' || k === 'Spacebar') Sim.act(this, { k: 'split', i: this.v.sel });
  },
  answer(v) { const s = this.sim.s; if (s.ask) Sim.act(this, { k: 'predict', id: s.ask.id, v }); },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, sig = s.phase + (s.ask ? 'a' : '') + (s.auto ? 'u' : '') + s.round; if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'cm-fewer', label: L.fewer, key: 'f', fn: () => this.answer(-1) }, { id: 'cm-more', label: L.more, key: 'm', fn: () => this.answer(1) }]); return; }
    if (s.auto || s.phase !== 'split') { Dock.set([]); return; }
    Dock.set([{ id: 'cm-grow', label: L.grow, key: 'Enter', primary: true, fn: () => Sim.act(this, { k: 'grow' }) }]);
    if (this.level === 0 && s.round === 0 && typeof Ghost !== 'undefined' && this.once('ghostGrow')) {   // after the first split, the hand rings Grow once
      const dockEl = () => typeof document !== 'undefined' ? document.querySelector('#dock [data-id="cm-grow"]') : null;
      if (s.splits > 0) Ghost.show({ verb: 'tap', el: dockEl, until: () => this.sim.s.phase !== 'split' || this.sim.s.round > 0 });
      else this._said.ghostGrow = 0;
    }
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, lab = this.content.labels, n = this.level, H = s.hist, last = H[H.length - 1]; let t;
    if (s.ask) t = s.drops.some(d => d.g && d.g.P > 0 && d.g.P < d.g.n) ? C.ask : C.askPure;
    else if (s.auto) t = C.auto;
    else if (s.phase === 'over' || s.phase === 'end') t = C.over;
    else if (s.phase === 'grow') t = C.grow;
    else if (s.phase === 'pool') t = n === 1 && last ? Txt.f(C.price, { b: this.sgn(last.between), w: this.sgn(last.within), t: this.sgn(last.total) }) : s.local ? C.poolLocal : (n === 0 && last && last.mixed ? C.gained : C.pool);
    else if (s.phase === 'load') t = Txt.f(C.load, { n: s.n });
    else if (n === 0 && s.round === 0 && s.splits === 0) t = this.content.firstWords;
    else if (n === 0) t = C.split1;
    else if (n === 2) { const k = s.n / s.drops.length; t = Txt.f(C.ham, { k: k >= 10 ? Math.round(k) : Math.round(k * 10) / 10, r: this.rTxt(this.relNow()) }); }
    else if (n === 3 && s.round === 0 && s.splits === 0) t = C.local;
    else t = s.drops.length >= s.maxD ? C.full : n === 1 ? C.split2 : C.split;
    const num = Txt.f(lab.round, { r: Math.min(s.round + 1, s.rounds), n: s.rounds });
    const sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num); this.measureHud();
  },
  relNow() { const s = this.sim.s; return CM.rel(s.drops.map(d => ({ n: d.cells.length, P: this.sim.count(d) }))); },
  rTxt(r) { return r == null ? '–' : r >= 0.995 ? '1' : r < 0.005 ? '0' : r.toFixed(2); },
  sgn(x) { return (x >= 0 ? '+' : '−') + (Math.abs(x) * 100).toFixed(1); },   // a change in percentage points

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g); this.drawRes(c, g); this.drawFlow(c, g);
    if (s.phase !== 'end' && s.phase !== 'over') this.drawDrops(c, g);
    this.drawPanel(c, g);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('cm-banner', v.banner.text, g.W / 2, g.chip.y + g.chip.h * 0.18, { size: 22 }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached: the dark field, a faint chip grid and the microscope's vignette
    if (!this._bg || this._bg.k !== g.k) {
      const L = Layer(g.W, g.H); L.redraw(cc => {
        const gr = cc.createRadialGradient(g.W / 2, g.H * 0.45, 10, g.W / 2, g.H * 0.45, Math.max(g.W, g.H) * 0.75); gr.addColorStop(0, CM_C.bg2); gr.addColorStop(0.55, CM_C.bg1); gr.addColorStop(1, CM_C.bg0);
        cc.fillStyle = gr; cc.fillRect(0, 0, g.W, g.H);
        const C = g.chip; cc.save(); rrect(cc, C.x, C.y, C.w, C.h, 18); cc.fillStyle = 'rgba(10,8,40,.45)'; cc.fill(); cc.lineWidth = 1.5; cc.strokeStyle = 'rgba(95,216,236,.22)'; cc.stroke(); cc.clip();
        cc.strokeStyle = CM_C.grid; cc.lineWidth = 1; for (let x = C.x; x < C.x + C.w; x += 22) { cc.beginPath(); cc.moveTo(x, C.y); cc.lineTo(x, C.y + C.h); cc.stroke(); } for (let y = C.y; y < C.y + C.h; y += 22) { cc.beginPath(); cc.moveTo(C.x, y); cc.lineTo(C.x + C.w, y); cc.stroke(); }
        const rn = rng(17); cc.fillStyle = 'rgba(200,220,255,.05)'; for (let i = 0; i < 70; i++) { cc.beginPath(); cc.arc(C.x + rn() * C.w, C.y + rn() * C.h, 0.8 + rn() * 1.6, 0, TAU); cc.fill(); }
        cc.restore();
        const vg = cc.createRadialGradient(g.W / 2, g.H / 2, Math.min(g.W, g.H) * 0.35, g.W / 2, g.H / 2, Math.max(g.W, g.H) * 0.72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)'); cc.fillStyle = vg; cc.fillRect(0, 0, g.W, g.H);
      });
      this._bg = { k: g.k, L };
    }
    this._bg.L.blit(c, 0, 0);
  },
  glow() {   // cosmetic: a cached golden glow sprite for producer cells and siderophore
    if (this._glow) return this._glow; const cv = mkCanvas(64, 64), cc = cv.getContext('2d'), gr = cc.createRadialGradient(32, 32, 2, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,225,130,.75)'); gr.addColorStop(0.35, 'rgba(245,200,76,.32)'); gr.addColorStop(1, 'rgba(245,200,76,0)'); cc.fillStyle = gr; cc.fillRect(0, 0, 64, 64); this._glow = cv; return cv;
  },
  hash(str, i) { let h = 2166136261; for (let k = 0; k < str.length; k++) h = Math.imul(h ^ str.charCodeAt(k), 16777619); h = Math.imul(h ^ (i + 1) * 2654435761, 16777619); return (h >>> 0) / 4294967296; },
  cell(c, x, y, ang, sc, prod, t, flash) {   // cosmetic: one rod-shaped Pseudomonas cell with a polar flagellum; producers filled gold, cheats hollow cyan
    const L = 11 * sc, w = 4.6 * sc, calm = typeof Fx !== 'undefined' && Fx.calm;
    if (prod) { const gs = 26 * sc; c.drawImage(this.glow(), x - gs / 2, y - gs / 2, gs, gs); }
    c.save(); c.translate(x, y); c.rotate(ang);
    c.strokeStyle = prod ? 'rgba(255,230,160,.55)' : 'rgba(110,225,240,.55)'; c.lineWidth = Math.max(0.7, 0.6 * sc); c.beginPath(); c.moveTo(L / 2, 0);
    for (let k = 1; k <= 4; k++) c.lineTo(L / 2 + k * 2.4 * sc, 1.4 * sc * Det.sin((calm ? 0 : t * 12) + k * 1.7)); c.stroke();
    rrect(c, -L / 2, -w / 2, L, w, w / 2);
    if (prod) { c.fillStyle = CM_C.gold; c.fill(); c.lineWidth = 1; c.strokeStyle = CM_C.goldD; c.stroke(); c.fillStyle = 'rgba(255,248,220,.6)'; c.fillRect(-L / 2 + w * 0.5, -w * 0.28, L - w, w * 0.18); }
    else { c.fillStyle = flash > 0 ? 'rgba(87,215,234,.55)' : CM_C.cheatF; c.fill(); c.lineWidth = 1.6; c.strokeStyle = CM_C.cheat; c.stroke(); }
    c.restore();
  },
  shown(d, q, back) {   // cosmetic: how many cells of each kind to draw in a droplet now, and the producer share they show
    const s = this.sim.s, n = d.cells.length, cap = Math.max(4, Math.min(48, Math.floor(q.r * q.r / 60)));
    if (!d.g) { let P = 0; for (const x of d.cells) P += x; return { m: n, P, f: n ? P / n : 0, founders: true }; }
    const k = s.phase === 'grow' ? Math.min(1, s.pt / CM_T.grow) : 1, tot = d.g.gP + d.g.gC, f1 = d.g.gP / tot, f0 = d.g.P / d.g.n;
    const cnt = (d.g.n + (tot - d.g.n) * k) * (1 - (back || 0)) + d.g.n * (back || 0), f = f0 + (f1 - f0) * k, m = Math.max(1, Math.min(cap, Math.round(cnt))), P = Math.round(m * f);
    return { m, P: d.g.P === 0 ? 0 : Math.max(d.g.P > 0 && f > 0.02 ? 1 : 0, P), f, f0, f1, gr: tot / d.g.n, founders: false };
  },
  drawDrops(c, g) {   // cosmetic: each droplet, its cells, the siderophore haze and the iron it carries
    const s = this.sim.s, v = this.v, lab = this.content.labels, t = v.t, calm = typeof Fx !== 'undefined' && Fx.calm, G = this.glow();
    const load = s.phase === 'load' ? Math.min(1, s.pt / CM_T.load) : 1;
    s.drops.forEach((d, i) => {
      const q0 = v.dp[d.path]; if (!q0) return; let q = q0, back = 0;
      if (s.phase === 'pool') {   // pooling: by growth each droplet drains as it is; under equal shares it first shrinks back to its founders
        const pk = Math.min(1, s.pt / (CM_T.pool * 0.85)), k1 = s.local ? Math.max(0, (pk - 0.4) / 0.6) : pk, e = k1 * k1, tx = g.res.x + g.res.w / 2, ty = g.res.y + g.res.h * 0.5;
        back = s.local ? Math.min(1, pk / 0.4) : 0; const r0 = s.local ? q0.r + ((q0.b || q0.r) * 0.62 - q0.r) * back : q0.r;
        q = { x: q0.x + (tx - q0.x) * e, y: q0.y + (ty - q0.y) * e, r: Math.max(3, r0 * (1 - 0.82 * k1)), a: (q0.a == null ? 1 : q0.a) * (1 - 0.75 * k1) };
      }
      const sh = this.shown(d, q, back), r = q.r * (s.phase === 'load' ? 0.3 + 0.7 * load : 1), x = q.x, y = q.y, a = (q.a == null ? 1 : q.a) * load;
      c.save(); c.globalAlpha = a;
      // the droplet: dark water with a golden siderophore haze in proportion to producers, a cyan rim and a highlight
      const body = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); body.addColorStop(0, 'rgba(60,52,140,.55)'); body.addColorStop(1, 'rgba(18,14,60,.82)');
      c.fillStyle = body; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      if (sh.f > 0.01) { c.globalAlpha = a * Math.min(0.9, 0.15 + 0.75 * sh.f) * (sh.founders ? 0.6 : 1); c.drawImage(G, x - r * 1.05, y - r * 1.05, r * 2.1, r * 2.1); c.globalAlpha = a; }
      const selOn = v.kb && i === v.sel && s.phase === 'split' && !s.auto; c.lineWidth = selOn ? 3 : 1.8; c.strokeStyle = selOn ? CM_C.goldL : CM_C.rim; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
      c.strokeStyle = CM_C.rimD; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r + 3, 0, TAU); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.10)'; c.beginPath(); c.ellipse(x - r * 0.38, y - r * 0.45, r * 0.32, r * 0.13, -0.6, 0, TAU); c.fill();
      // cells: a stable scatter inside the droplet; producers first in a droplet-specific order
      c.save(); c.beginPath(); c.arc(x, y, r * 0.98, 0, TAU); c.clip();
      const sc = Math.max(0.55, Math.min(1.45, r / 40)), pos = [];
      for (let j = 0; j < sh.m; j++) {
        const h1 = this.hash(d.path, j), h2 = this.hash(d.path, j + 97), rr = Math.sqrt(h1) * r * 0.72, an = h2 * TAU;
        const jx = calm ? 0 : 1.6 * Det.sin(t * 1.3 + j * 2.1), jy = calm ? 0 : 1.6 * Det.cos(t * 1.1 + j * 1.7), cx = x + rr * Det.cos(an) + jx, cy = y + rr * Det.sin(an) + jy;
        pos.push([cx, cy]);
      }
      const order = this.order(d.path, sh.m), isP = new Array(sh.m).fill(false);
      if (sh.founders) d.cells.forEach((x0, j) => { if (j < sh.m) isP[j] = x0 === 1; }); else for (let j = 0; j < sh.P; j++) isP[order[j]] = true;
      // iron (rust specks) and siderophore traffic: a golden molecule leaves a producer, picks up iron, and is taken in by any cell
      const nIron = Math.max(2, Math.min(8, Math.round(r / 10))); c.fillStyle = CM_C.iron;
      for (let j = 0; j < nIron; j++) { const h1 = this.hash(d.path + 'fe', j), h2 = this.hash(d.path + 'fe', j + 31), rr = Math.sqrt(h1) * r * 0.85, an = h2 * TAU + (calm ? 0 : t * 0.05); const ix = x + rr * Det.cos(an), iy = y + rr * Det.sin(an); c.beginPath(); c.moveTo(ix, iy - 2.2); c.lineTo(ix + 2.2, iy); c.lineTo(ix, iy + 2.2); c.lineTo(ix - 2.2, iy); c.closePath(); c.fill(); }
      const prods = [], all = []; for (let j = 0; j < sh.m; j++) { all.push(j); if (isP[j]) prods.push(j); }
      if (prods.length && !calm && s.phase !== 'load') {
        const nS = Math.min(14, prods.length * 2 + 2);
        for (let k = 0; k < nS; k++) {
          const per = 1.8 + this.hash(d.path + 's', k) * 1.2, ph = ((t + this.hash(d.path + 'p', k) * per) % per) / per, cyc = Math.floor((t + this.hash(d.path + 'p', k) * per) / per);
          const A = pos[prods[Math.floor(this.hash(d.path + 'a' + cyc, k) * prods.length)]], B = pos[all[Math.floor(this.hash(d.path + 'b' + cyc, k) * all.length)]];
          const mx = x + (this.hash(d.path + 'm' + cyc, k) - 0.5) * r, my = y + (this.hash(d.path + 'n' + cyc, k) - 0.5) * r;
          const u = ph, bx = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * mx + u * u * B[0], by = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * my + u * u * B[1];
          c.globalAlpha = a * (u < 0.1 ? u / 0.1 : u > 0.9 ? (1 - u) / 0.1 : 1);
          c.fillStyle = u > 0.5 ? CM_C.ironL : CM_C.goldL; c.beginPath(); c.arc(bx, by, u > 0.5 ? 2.2 : 1.7, 0, TAU); c.fill();
          if (u > 0.5) { c.strokeStyle = CM_C.gold; c.lineWidth = 1; c.stroke(); }
        }
        c.globalAlpha = a;
      }
      for (let j = 0; j < sh.m; j++) { const an = this.hash(d.path, j + 211) * TAU + (calm ? 0 : 0.3 * Det.sin(t * 0.7 + j)); this.cell(c, pos[j][0], pos[j][1], an, sc, isP[j], t + j, 0); }
      c.restore();
      // the droplet's story after growth: producer share before → after (▼ in a mixed droplet), or a clone's growth
      if (d.g && (s.phase === 'grow' || s.phase === 'ask' || (s.phase === 'pool' && s.pt < 0.35)) && (s.phase !== 'grow' || s.pt > CM_T.grow * 0.5)) {
        const mixed = d.g.P > 0 && d.g.P < d.g.n, big = r >= 26, ly = y + r + (big ? -2 : 10);
        if (mixed) Lbl.put('cm-d' + d.path, big ? Txt.f(lab.fell, { a: Math.round(100 * sh.f0), b: Math.round(100 * sh.f1) }) : '▼', x, ly, { size: 12, bg: '#DDF6FA' });
        else if (d.g.P === d.g.n && big) Lbl.put('cm-d' + d.path, Txt.f(lab.clone, { g: Math.round(sh.gr) }), x, ly, { size: 12, bg: '#FFF1C4' });
        else if (big && s.drops.length <= 8) Lbl.put('cm-d' + d.path, lab.none, x, ly, { size: 12, bg: '#DDF6FA' });
      }
      c.restore();
    });
    if (s.phase === 'grow') Lbl.put('cm-gens', lab.gens, g.chip.x + g.chip.w - 8, g.chip.y + 14, { size: 12, align: 'right' });
  },
  order(path, m) { const o = []; for (let j = 0; j < m; j++) o.push(j); o.sort((a, b) => this.hash(path + 'o', a) - this.hash(path + 'o', b)); return o; },   // cosmetic
  drawFlow(c, g) {   // cosmetic: a new sample rises from the flask into the chip
    const v = this.v, R = g.res; for (const f of v.flow) {
      const u = f.u, x0 = R.x + R.w / 2, y0 = R.y, C = g.chip, y1 = C.y + C.h / 2; c.save(); c.globalAlpha = Math.max(0, 1 - u) * 0.8;
      for (let k = 0; k < 8; k++) { const w = (u * 1.6 + k / 8) % 1, y = y0 + (y1 - y0) * w; c.fillStyle = k % 3 ? CM_C.rim : CM_C.gold; c.beginPath(); c.arc(x0 + 6 * Det.sin(w * 9 + k), y, 2.4, 0, TAU); c.fill(); }
      c.restore();
    }
  },
  drawRes(c, g) {   // the culture flask, drawn as a glass channel: golden for producers, hatched cyan for cheats, with the key number
    const R = g.res, s = this.sim.s, v = this.v, p = Math.max(0, Math.min(1, v.pAnim)), lab = this.content.labels, inset = 6, bw = R.w - 2 * inset, bh = Math.max(12, R.h * 0.34), by = R.y + R.h - bh - 8;
    c.save(); rrect(c, R.x, R.y, R.w, R.h, 16); c.fillStyle = CM_C.glass; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(160,220,240,.45)'; c.stroke();
    rrect(c, R.x + inset, by, bw, bh, bh / 2); c.fillStyle = 'rgba(8,6,30,.8)'; c.fill(); c.save(); c.clip();
    c.fillStyle = CM_C.gold; c.fillRect(R.x + inset, by, bw * p, bh);
    c.strokeStyle = CM_C.cheat; c.lineWidth = 1.5; for (let x = R.x + inset + bw * p - bh; x < R.x + inset + bw + bh; x += 7) { c.beginPath(); c.moveTo(Math.max(R.x + inset + bw * p, x), by + bh - Math.max(0, R.x + inset + bw * p - x)); c.lineTo(x + bh, by); c.stroke(); }
    c.restore(); c.lineWidth = 1.5; c.strokeStyle = CM_C.rim; rrect(c, R.x + inset, by, bw, bh, bh / 2); c.stroke();
    // the start share, a thin tick, so the change is visible
    const x0 = R.x + inset + bw * s.p0; c.strokeStyle = CM_C.ink; c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x0, by - 4); c.lineTo(x0, by + bh + 4); c.stroke(); c.setLineDash([]);
    const goal = CM_LV[s.level].goal; if (goal && !s.whatif) { const xg = R.x + inset + bw * goal; c.strokeStyle = CM_C.goldL; c.lineWidth = 2; c.beginPath(); c.moveTo(xg, by - 6); c.lineTo(xg, by + bh + 6); c.stroke(); }
    c.restore();
    Lbl.put('cm-flask', lab.flask, R.x + 12, R.y + 14, { size: 12, align: 'left', pill: false, ink: CM_C.dim });
    Lbl.put('cm-prod', Txt.f(lab.prod, { p: Math.round(p * 100) }), R.x + R.w - 10, R.y + 15, { size: 14, align: 'right', bg: '#FFF1C4' });
  },
  drawPanel(c, g) {   // the key number, plainly, in the band under the HUD (D6 decision 9)
    const s = this.sim.s, n = this.level, lab = this.content.labels, y = g.eqY + g.eqH / 2, H = s.hist, last = H[H.length - 1], W = g.W;
    if (n === 0 || (n === 1 && !last)) {   // the cost and the benefit that every cell in a droplet shares
      Lbl.put('cm-lawP', lab.lawP, W / 2 - 5, y - 7, { size: 13, align: 'right', bg: '#FFF1C4' });
      Lbl.put('cm-lawC', lab.lawC, W / 2 + 5, y - 7, { size: 13, align: 'left', bg: '#DDF6FA' });
      if (n === 0 && (s.phase === 'grow' || s.phase === 'pool')) Lbl.put('cm-key', lab.free, W / 2, y + 12, { size: 12, pill: false, ink: CM_C.cheat });   // the one-line meaning
      else { const o = { size: 12, pill: false, align: 'left', ink: CM_C.dim }; Lbl.put('cm-kf', lab.keyF, W / 2 - 112, y + 12, o); Lbl.put('cm-kb', Txt.f(lab.keyB, { b: CM_M.b }), W / 2 + 4, y + 12, Object.assign({}, o, { ink: CM_C.goldL })); Lbl.put('cm-kc', Txt.f(lab.keyC, { c: CM_M.c }), W / 2 + 56, y + 12, Object.assign({}, o, { ink: CM_C.cheat })); }
      return;
    }
    if (n === 2 && s.phase !== 'pool') {   // Hamilton's rule, live as the player splits: r × b against c
      const r0 = this.relNow(), r = r0 == null ? 0 : r0, rb = r * CM_M.b, bw = Math.min(150, W * 0.28), sc = bw / 0.6, x0 = W / 2 - bw / 2 + 10, h = 9;
      Lbl.put('cm-r', Txt.f(lab.rIs, { r: this.rTxt(r0) }), x0 - 10, y, { size: 13, align: 'right' });
      c.fillStyle = CM_C.gold; c.fillRect(x0, y - h - 1, Math.min(bw, rb * sc), h);
      c.save(); c.beginPath(); c.rect(x0, y + 1, CM_M.c * sc, h); c.clip(); c.fillStyle = CM_C.cheatF; c.fill(); c.strokeStyle = CM_C.cheat; c.lineWidth = 1.5; for (let k = x0 - h; k < x0 + CM_M.c * sc + h; k += 4) { c.beginPath(); c.moveTo(k, y + 1 + h); c.lineTo(k + h, y + 1); c.stroke(); } c.restore();   // c hatched like the cheats: never hue alone
      c.strokeStyle = 'rgba(233,230,255,.5)'; c.lineWidth = 1; c.strokeRect(x0, y - h - 1, bw, h); c.strokeRect(x0, y + 1, bw, h);
      Lbl.put('cm-rb', lab.rb, x0 + bw + 6, y - h / 2 - 1, { size: 12, align: 'left', pill: false, ink: CM_C.goldL });
      Lbl.put('cm-c', lab.c, x0 + bw + 6, y + h / 2 + 2, { size: 12, align: 'left', pill: false, ink: CM_C.cheat });
      if (r0 != null) Lbl.put('cm-ok', rb > CM_M.c + 1e-9 ? lab.yes : rb < CM_M.c - 1e-9 ? lab.no : lab.even, x0 + bw + 34, y, { size: 13, align: 'left', bg: rb > CM_M.c ? '#FFF1C4' : '#DDF6FA' });
      return;
    }
    if (last) { this.pricePills(c, g, last, s.local); return; }   // the Price equation after a round: between + within = total
    if (n === 3) Lbl.put('cm-loc', lab.local, W / 2, y, { size: 13, bg: '#DDF6FA' });
  },
  pricePills(c, g, h, local) {   // Price's equation, plainly: three labelled numbers that add up, each with a bar on a shared scale
    const lab = this.content.labels, span = Math.min(g.W - 16, 560), x0 = g.W / 2 - span / 2, y = g.eqY + 13, by = g.eqY + 28, f2 = v => this.sgn(v);
    const vals = [[local ? 0 : h.between, lab.between, '#FFF1C4'], [h.within, lab.within, '#DDF6FA'], [h.total, lab.total, '#F1EEFF']], m = Math.max(0.05, ...vals.map(q => Math.abs(q[0]))), slot = span / 3, sc = slot * 0.42 / m;
    vals.forEach(([v, name, bg], i) => {
      const cx = x0 + slot * (i + 0.5), w = v * sc;
      Lbl.put('cm-pp' + i, name + ' ' + f2(v), cx, y, { size: 12, bg });
      if (i === 0) { c.fillStyle = CM_C.gold; c.fillRect(Math.min(cx, cx + w), by, Math.abs(w), 7); }
      else if (i === 1) { c.save(); c.beginPath(); c.rect(Math.min(cx, cx + w), by, Math.abs(w), 7); c.clip(); c.strokeStyle = CM_C.cheat; c.lineWidth = 1.5; for (let k = Math.min(cx, cx + w) - 8; k < Math.max(cx, cx + w) + 8; k += 4) { c.beginPath(); c.moveTo(k, by + 7); c.lineTo(k + 7, by); c.stroke(); } c.restore(); c.strokeStyle = CM_C.cheat; c.lineWidth = 1; c.strokeRect(Math.min(cx, cx + w), by, Math.abs(w), 7); }
      else { c.fillStyle = CM_C.ink; c.fillRect(Math.min(cx, cx + w), by, Math.abs(w), 7); }
      c.strokeStyle = 'rgba(233,230,255,.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx, by - 3); c.lineTo(cx, by + 10); c.stroke();
      if (i < 2) Lbl.put('cm-op' + i, i ? '=' : '+', x0 + slot * (i + 1), y, { size: 14, pill: false, ink: CM_C.ink });
    });
  },

  /* ---------- the live graph (strip) and the debrief chart ---------- */
  notes() {
    const s = this.sim.s, lab = this.content.labels, cap = this.content.captions, H = s.hist, last = H[H.length - 1], nd = s.drops.length;
    const stats = [[lab.sProd, Math.round(s.p * 100) + '%', cap.mProd], [lab.sDrops, String(nd), cap.mDrops], [lab.sFound, String(Math.round(s.n / Math.max(1, nd) * 10) / 10), cap.mFound], [lab.sR, this.rTxt(this.relNow()), cap.mR]];
    if (last) stats.push([lab.sBetween, this.sgn(last.between), cap.mBetween], [lab.sWithin, this.sgn(last.within), cap.mWithin]);
    const pr = this.priceSpec(), charts = this.level === 1 ? [pr] : [this.traceSpec(false)];
    if (last && this.level >= 2) charts.push(Object.assign(pr, { fold: false }));
    return { stats, charts };
  },
  priceSpec() { const s = this.sim.s, h = s.hist[s.hist.length - 1] || { between: 0, within: 0, total: 0 }; return { type: 'price', title: this.content.labels.tPrice, between: h.between, within: h.within, total: h.total, fmt: v => this.sgn(v) + ' pts' }; },
  traceSpec(card) {   // the flask's producer share, round by round (realised solid); the level's goal as a band
    const s = this.sim.s, lab = this.content.labels, L = CM_LV[s.level], d = [[0, s.p0]].concat(s.hist.map((h, i) => [i + 1, h.pb]));
    const spec = { type: 'trace', title: lab.tProd, x: { lo: 0, hi: L.rounds, label: lab.axRound, step: 1 }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d, ink: 'sel', label: card ? (s.whatif ? this.content.levers[s.whatif] : lab.you) : '' }], frame: 'designed' };
    if (L.goal) spec.target = { lo: L.goal, hi: 1 };
    if (L.tol) spec.target = { lo: L.p0 - L.tol, hi: L.p0 + L.tol };
    return spec;
  }
};
V2.push(CH_COMMONS_V2);

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.commons = CM_TEXT.take;
  MODEL.commons = 'Pseudomonas producers pay a cost c to make siderophore; every cell in a droplet shares the benefit b × the producer share. No cell gets its own siderophore back. Droplets are founded at random and pool by growth, or, in the boss, by equal shares. b, c and the generations a round are designed numbers.';
  RECALL.commons = { q: 'Droplets are each founded by 4 cells at random. With b = 1.2 and c = 0.15, do producers spread?', opts: [['y', 'Yes: r × b = 0.3 beats c'], ['n', 'No: cheats always win'], ['h', 'Only if b exceeds 4']], ans: 'y', why: 'r ≈ 1 ÷ 4, so r × b = 0.3 > c = 0.15 (Hamilton’s rule).' };
  BRIDGE.commons = 'In Alarm Call, relatives paid for each other’s safety. Here microbes share a costly good. Can kinship save it?';
  if (TRANSFER.commons) delete TRANSFER.commons;
}
