/* ================= v2/tap.js: The Leaky Tap (Act 4; D3 §5.3, D5 §4 item 14) =================
   Mutation–selection balance on a windswept kittiwake cliff at sunset. Role: the selective agent (D1 G1 role 1): you are a great
   black-backed gull diving on kittiwake chicks that totter at the ledge edge. A rain-fed rock pool on the shore is the tap: rain
   drips new harmful copies in (mutation), the crack leaks the copies your catches remove (selection), and the water level is q.
     L1 The drip (dominant)    a season of dusks sets your catch rate s; predict where q settles; 30 generations run at s:
                               q̂ ≈ μ ÷ (h·s) with h = 1. At balance your catches match the drip (Haldane 1935).
     L2 Hidden copies          the same allele, now recessive (h = 0); the lens shows genotypes but blocks dives; q̂ ≈ √(μ ÷ s),
                               and most copies sit in carriers (the carrier pocket of the pool).
     L3 The warden's net       s = 0: predict when q doubles (it creeps up by about μ a generation); then the net lifts: a feast,
                               then a purge. Relaxed selection is slow (Lahti et al. 2009).
     L4 The load (boss)        the keeper wants the load (chicks lost to the allele, per 1,000) halved. Two more gulls join: the
                               load spikes and returns to the drip line, μ, whatever s (Haldane 1937; Muller 1950). Only shutting
                               the rusty drum that doubles the drip halves it. This inverts "harder selection cuts the harm".
   D5 says Hunt mode; this is a headless sim with a hunt's look (lessons §0 rule 1). The colony is 2,000 chicks a generation as
   genotype counts (WF sampling); you hunt a stretch of 48 nests drawn from it, and your catch share is the colony's s. Stars and
   predictions read the deterministic recursion for the parameters in force, never the realised run.
   Notation (D2 §15): A normal, a harmful, q the share of a, h dominance, s selection, μ the mutation rate A → a per copy.
   Code shape (API_v2 §9): sim plain JSON (R(), Det, WF only; a run is (seed, level, actions)); all words in TP_TEXT; juice from
   Sim.run's events only; no fillText. Under ?v1=1 the learning-layer rewrites at the foot are skipped. */

/* ---------- all words (API_v2 §9.2); tests/lint_text.js checks every budget ---------- */
const TP_TEXT = {
  intro: {   // the opening card (D6 addendum 8)
    game: 'You are a great black-backed gull on a sea cliff at sunset. Below you, kittiwakes raise their chicks on narrow ledges.',
    biology: 'Mutation drips harmful copies into every gene pool, and selection drains them. The harm settles where drip meets drain, and it hides best in carriers.',
    how: 'Tap an unsteady chick while it totters at the ledge edge to dive. Drag on the graph to predict, then Lock in.'
  },
  firstWords: 'Unsteady chicks totter to the ledge edge. Tap one while it is out to dive. Tucked chicks are safe.',
  hud: {
    dusk: 'Dive on chicks tottering at the edge. Tucked chicks are safe.',
    duskU: 'Untimed: the chicks hold still. Spend your dives, or tap End dusk.',
    lens: 'Lens on: carriers show, but you cannot dive.',
    dawn: 'Night on the cliff. Next dusk the chicks totter again.',
    bal: 'Many generations on. Dive again: how many unsteady chicks are left?',
    askA1: 'Your catch rate was {s}%. Drag where the a share will settle.',
    askB1: 'Now a is recessive. Catch rate {s}%. Drag where the a share settles.',
    askC1: 'Under the net no gull dives. When will the a share, now {q}, double?',
    askT1: 'Two more gulls hunt with you. Drag where the load will settle.',
    lapse: 'The colony runs on at your catch rate. Watch drip against leak.',
    net: 'The warden’s net keeps gulls off the ledges. Selection is relaxed.',
    netLapse: 'Only the drip now. A real drip is 2,000 times slower.',
    lift: 'The net lifts. A feast of unsteady chicks!',
    feast: 'Dive while the feast lasts. Your catches set the purge.',
    purge: 'The purge: the colony runs on at your catch rate.',
    boss: 'The keeper wants the load halved: chicks lost to the allele, per 1,000.',
    twist: 'Hunt harder: two more black-backs join you.',
    bossDusk: 'Dive. Your catches add to the other gulls’ hunting.',
    season: 'Five generations pass. Watch the load.',
    hint: 'The load is back on its line. What else fills the pool?',
    plugged: 'The drum is shut. Half the drip is gone.',
    auto: 'What if? The colony runs by the new rule.',
    over: 'Done.'
  },
  whispers: {
    drag: 'Drag the line first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No prediction this time.',
    miss: 'Missed: it tucked in.', empty: 'That nest is empty.', busy: 'Still diving.', nodives: 'No dives left this dusk.',
    lensblock: 'Lens on: no diving.', fed: 'Your chicks are fed.', drum: 'The drum is shut.', hint: 'What else fills the pool?', gone: 'No unsteady chicks left out.'
  },
  labels: {
    drip: 'drip', leak: 'leak', pool: 'a copies', hidden: 'in carriers', net: 'warden’s net', drum: 'rusty drum', gen: 'Generation {n}',
    lensOn: 'Lens on', ff: 'Tap: faster', xn: 'Drip ×2000', lock: 'Lock in', lensB: 'Lens', end: 'End dusk', fast: 'Faster',
    half: 'half load', line: 'drip line', bal: 'balance', fedN: 'fed {m}/{need}', divesN: '{d} dives', catchN: 'catch {s}%', loadN: '{l} per 1000',
    dusk: 'Dusk {n}', season: 'Season {n}', unsteady: 'unsteady', shutDrum: 'Shut drum', gulls: '+2 gulls'
  },
  interesting: {
    hungry: 'Your chicks went short. A dive on a tucked chick is wasted; wait until one totters at the edge.',
    nolens: 'You never looked under the lens. Most a copies sat in steady-looking carriers, out of reach of every dive.',
    weak: 'You caught few unsteady chicks, so selection was weak. With a weak drain, more copies pile up before it matches the drip.',
    feast: 'The feast was short of meals. Copies left uncaught breed on, so the purge ran slower.',
    early: 'You shut the drum before the gulls joined. That works, but you never saw harder hunting fail.',
    late: 'The drum was shut too late for the load to halve. Harder hunting never moved the line; the drip set it.',
    nodrum: 'The load kept returning to its line, however hard the gulls hunted. Only less drip could lower it.'
  },
  live: {
    dusk: 'Dusk {n}. {k} unsteady chicks on your stretch.', gen: 'Generation {n}. The a share is {q}.', ask: 'Prediction open. Press P, then the arrows.',
    catch: 'Caught one. {m} meals.', plug: 'The drum is shut.'
  },
  data: {
    q: ['a share', '{q}', 'Copies of a among all copies.'],
    s: ['Catch rate', '{s}%', 'Share of unsteady chicks you caught.'],
    fed: ['Meals', '{m} of {need}', 'Chicks carried to your nest.'],
    load: ['Load', '{l} per 1000', 'Chicks lost to the allele each generation.'],
    gen: ['Generation', '{g}', 'Colony of 2,000 chicks.'],
    titles: { q: 'The a share', cp: 'Drip against leak', load: 'Load per 1000' },
    ax: { gen: 'generation', q: 'a share', cp: 'copies', l: 'per 1000' },
    lines: { real: 'colony', exp: 'expected', drip: 'drip in', drain: 'removed', line: 'drip line', goal: 'goal' }
  },
  levers: { halfs: 'Half the catch', real1: 'Real drip', dom: 'Make a dominant', real2: 'Real drip', long: 'Longer net', slow: 'Real drip', nogulls: 'No extra gulls', early: 'Shut drum early' },
  take: 'At balance the drip, not selection, sets the load: about μ, or 2μ for a dominant allele.',
  body: 'The extra gulls spiked the load, then it fell back to its line, near μ, whatever the catch. Shutting the drum halved the drip, and the load followed: {l} per 1000 at the end.',
  whatifBody: {   // chosen and filled from the What if? run (lessons §1.5)
    halfs: 'Your season again at half your catch rate ({s}%). The a share settled near {q}; μ ÷ s gives {e}. Halve s and the balance doubles.',
    real1: 'Your catch rate with a real drip of 10⁻⁵. The a share fell to {q}; μ ÷ s gives {e}. Real balances are tiny.',
    dom: 'The same catch rate with a dominant. The a share settled near {q}; μ ÷ s gives {e}, far below the recessive balance of {r}.',
    real2: 'A real drip of 10⁻⁵ at your catch rate. The balance would be {e}, about {x} times μ ÷ s. This run ended at {q}.',
    long: 'Ninety generations under the net. The a share climbed from {q0} to {q}. With no leak, the drip keeps filling the pool.',
    slow: 'Thirty generations under the net with a real drip of 10⁻⁵. The a share went from {q0} to {q}. The drip alone adds about {e}; the rest was chance.',
    nogulls: 'No extra gulls, an average catch, and the drum shut at generation 10. The load ended at {l} per 1000: the same line, no help from harder hunting.',
    early: 'The drum shut as the gulls joined. The load ended at {l} per 1000. The extra gulls changed nothing lasting; the drip set the line.'
  },
  law: { title: 'Drip meets drain' },
  boss: { inverts: 'Harder selection does not cut the load; only a smaller drip does.' },
  stars: {
    discover: 'Feed your chicks, look at the carriers, and halve the load.',
    predict: 'Land two of three predictions: both balances and the doubling time.',
    transfer: 'Predict where the load settles when the hunting gets harder.'
  },
  levelStars: [
    { discover: 'Bring home 8 unsteady chicks this season.', predict: 'Land the balance prediction inside the band.' },
    { discover: 'Bring home 4 chicks, or all there are, and look under the lens.', predict: 'Land the recessive balance inside the band.' },
    { discover: 'Bring home 6 chicks from the feast.', predict: 'Land the doubling time inside the band.' },
    { discover: 'After the gulls join, shut the drum and bring the load near half.', transfer: 'Predict where the load settles under harder hunting.' }
  ],
  levelTake: [
    'Mutation drips harmful copies in; selection drains them. They settle where the two match: q ≈ μ ÷ s.',
    'A recessive allele hides in carriers, so it settles far higher: q ≈ √(μ ÷ s).',
    'Relaxed selection lets the drip refill the pool, but only by about μ a generation.'
  ],
  levelBody: [
    'You caught {c} of {n} unsteady chicks: a catch rate of {s}%. The a share settled near {q}; μ ÷ s gives {e}. At balance the gulls removed about {k} copies a generation, and the drip added {m}.',
    'Your catch rate was {s}%. The a share settled near {q}, against √(μ ÷ s) = {e}. At balance {k} chicks in 100 carried a, but only {a} in 100 were unsteady.',
    'Under the net the a share rose from {q0} to {q1} in 30 generations. It doubled after about {d}. At a real drip near 10⁻⁵, doubling from balance takes about 450 generations.'
  ],
  model: [
    { level: 0, simulated: 'A kittiwake colony of 2,000 chicks a generation. One gene has a harmful allele, a; affected chicks totter at the ledge edge.',
      simplification: 'Here a is fully dominant: one copy makes a chick unsteady. Your catch share on your stretch is the colony’s selection, s.',
      params: [{ name: 'mutation rate μ', value: '0.02 per copy per generation', tag: 'xN', real: '10⁻⁴ to 10⁻⁶ per gene' }, { name: 'colony', value: '2,000 chicks', tag: 'designed' }, { name: 'selection s', value: 'your catch rate', tag: 'designed' }, { name: 'dominance h', value: 1, tag: 'designed' }],
      cannot: 'Partial dominance, many harmful genes at once, or any benefit of the allele.',
      nature: 'Haldane saw in 1935 that a harmful allele settles where new mutations replace the copies selection removes. He used it to estimate how often the haemophilia gene mutates.',
      contested: false, refs: ['haldane1935', 'crow1970'] },
    { level: 1, simulated: 'The same colony and drip, but a is recessive: only chicks with two copies totter. The lens shows each chick’s genotype.',
      simplification: 'Carriers are exactly as steady as normal chicks (h = 0). Looking under the lens costs dive time.',
      params: [{ name: 'mutation rate μ', value: '0.02 per copy per generation', tag: 'xN', real: '10⁻⁴ to 10⁻⁶ per gene' }, { name: 'dominance h', value: 0, tag: 'designed', real: 'often 0.1 to 0.3' }, { name: 'colony', value: '2,000 chicks', tag: 'designed' }],
      cannot: 'Carriers with a slight cost, which real alleles often have. Even a small h pulls q far below √(μ ÷ s).',
      nature: 'Most harmful mutations are partly recessive. So carriers of a rare recessive condition, such as cystic fibrosis, far outnumber people who have it.',
      contested: false, refs: ['crow1970', 'agrawal2011'] },
    { level: 2, simulated: 'The warden’s net stops all diving, so s = 0. Only the drip acts, plus chance in a colony of 2,000.',
      simplification: 'The net stays 30 generations. Then your feast catches set s for the purge.',
      params: [{ name: 'mutation rate μ', value: '0.02 per copy per generation', tag: 'xN', real: '10⁻⁴ to 10⁻⁶ per gene' }, { name: 'net', value: '30 generations', tag: 'designed' }],
      cannot: 'Other costs the allele may carry when no gull hunts.',
      nature: 'Relaxed selection acts slowly. Without selection, a harmful allele gains only new mutations, about μ a generation.',
      contested: false, refs: ['lahti2009', 'crow1997'] },
    { level: 3, simulated: 'Each season of 5 generations, your catches plus other black-backs set s. Rain and a leaking drum both drip.',
      simplification: 'The drum doubles the drip; shutting it halves μ. The load is chicks lost to the allele per 1,000 hatched.',
      params: [{ name: 'mutation rate μ', value: '0.014 to 0.026', tag: 'xN', real: '10⁻⁴ to 10⁻⁶ per gene' }, { name: 'drum', value: 'half the drip', tag: 'designed' }, { name: 'extra gulls', value: 2, tag: 'designed' }],
      cannot: 'Load summed over thousands of genes, or mutations that help.',
      nature: 'Haldane and Muller showed that load at balance equals the mutation rate, whatever s. Herring gulls nesting near steel mills had raised germline mutation rates.',
      contested: false, refs: ['haldane1937', 'muller1950', 'yauk1996'] }
  ],
  why: {
    real: ['Muller called this our load of mutations. Thousands of genes each have their own drip. So the total load is large, whatever the strength of selection.'],
    maths: ['Recessive: at balance s·q² = μ, so the share of chicks lost, s·q², is μ. Dominant: each loss removes one copy, not two, so twice as many die: 2μ. Neither contains s.']
  },
  levelWhy: [
    { real: ['J. B. S. Haldane used this balance in 1935 to estimate how often the haemophilia gene mutates. The copies lost each generation must be replaced by new mutations.'],
      maths: ['Each generation selection removes about s·q copies per copy and mutation adds μ. They balance when s·q = μ, so q ≈ μ ÷ s. With partial dominance h, q ≈ μ ÷ (h·s).'] },
    { real: ['A rare recessive allele sits almost entirely in carriers, out of selection’s reach. With a real μ of 10⁻⁵ and s = 1, √(μ ÷ s) is 316 times μ ÷ s.'],
      maths: ['Only aa chicks are removed, a share q², so selection removes about s·q² copies a generation. Balance: s·q² = μ, so q ≈ √(μ ÷ s).'] },
    { real: ['Selection relaxes when a predator vanishes, or when medicine treats a condition. The allele then creeps up by new mutation alone, about one in 100,000 copies a generation or fewer.'],
      maths: ['With s = 0, q grows by μ(1 − q) a generation. Doubling from balance takes roughly q ÷ μ generations. That is 15 here, and 450 at a real μ of 10⁻⁵.'] }
  ]
};
/* ---------- levels: plain-JSON scripts the sim steps through ---------- */
const TP_LV = [
  { h: 1, q0: 0.2, mu: 0.02, steps: [{ k: 'season', n: 4, dives: 6, quota: 8 }, { k: 'ask', id: 'a1' }, { k: 'lapse', g: 30 }, { k: 'season', n: 1, dives: 6, bal: 1 }] },
  { h: 0, q0: 0.4, mu: 0.02, lens: 1, steps: [{ k: 'season', n: 4, dives: 6, quota: 4 }, { k: 'ask', id: 'b1' }, { k: 'lapse', g: 40 }, { k: 'season', n: 1, dives: 6, bal: 1 }] },
  { h: 0, q0: -1, mu: 0.02, lens: 1, steps: [{ k: 'pause', note: 'net', t: 2.2 }, { k: 'ask', id: 'c1' }, { k: 'lapse', g: 30, s0: 1 }, { k: 'pause', note: 'lift', t: 1.8 }, { k: 'season', n: 2, dives: 6, quota: 6, feast: 1 }, { k: 'lapse', g: 25 }] },
  { h: 0, q0: 0, mu: 0, boss: 1, lens: 1, steps: [] }   // filled in reset: six seasons of 5 generations, the gulls join before season 2
];
const TP_T = { dt: 1 / 30, dusk: 12, bossDusk: 8, dawn: 1.2, arrive: 8, busy: 15, gen: 0.16, bossGen: 0.3, askMax: 30, untMax: 60, V: 48, N: 2000 };

const CH_TAP_V2 = {
  id: 'tap', v2: true, role: 'environment', place: 'coast',
  accent: '#9A4C7E',   // sunset plum: the chapter's chrome tint (D6 addendum 7); the scene paints violet sky, coral light, slate sea
  intro: { goal: 'Dive on unsteady chicks; find where drip meets drain.' },
  content: TP_TEXT,
  P: {
    mu: { v: 0.02, tag: 'xN', min: 0.002, max: 0.05, real: '1e-4 to 1e-6 per gene', label: 'mutation rate' },
    N: { v: 2000, tag: 'designed', min: 200, max: 10000, label: 'colony' }
  },
  levels: [
    { name: 'The drip', adds: 'mutation against selection', codes: ['T1'], minutes: 3 },
    { name: 'Hidden copies', adds: 'recessive dominance', codes: ['T2'], minutes: 3 },
    { name: 'The warden’s net', adds: 'relaxed selection', codes: ['T3'], minutes: 3 },
    { name: 'The load', adds: 'genetic load', codes: ['T4'], minutes: 4 }
  ],
  keys: { Space: 'dive or speed up', ArrowLeft: 'previous nest', ArrowRight: 'next nest', L: 'lens', D: 'shut the drum', E: 'end dusk', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why does a recessive harmful allele settle at a higher frequency than a dominant one?', 'Medicine lets people with a recessive condition have children. How fast does that raise the allele’s frequency?', 'This model has one gene and one predator. What would many harmful genes, each with its own drip, change?'], pool: 'trace' },
  starTraits: ['unsteady'],
  encodings: [   // the phenotype is posture and motion (tottering at the lip); allele inks appear only in genotype read-outs, with letters
    { k: 'unsteady', rgb: [236, 232, 226], channels: ['shape', 'position'] }, { k: 'steady', rgb: [214, 210, 206], channels: ['shape', 'position'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only ================= */
  sim: {
    dt: TP_T.dt, s: null, _qh: {},
    P() { return CH_TAP_V2.P; },
    /* ---------- the deterministic model the stars read: selection, then mutation A → a ---------- */
    qn(q, s, h, mu) { const p = 1 - q, w = p * p + 2 * p * q * (1 - h * s) + q * q * (1 - s), qs = w > 0 ? (p * q * (1 - h * s) + q * q * (1 - s)) / w : q; return qs + mu * (1 - qs); },
    load(q, s, h) { const p = 1 - q; return 2 * p * q * h * s + q * q * s; },   // 1 − w̄: the share of chicks lost to the allele
    qhat(s, h, mu) {
      const key = s + ':' + h + ':' + mu; if (key in this._qh) return this._qh[key];
      let q = 0.1; for (let i = 0; i < 40000; i++) { const n = this.qn(q, s, h, mu); if (Math.abs(n - q) < 1e-13) { q = n; break; } q = n; }
      return (this._qh[key] = q);
    },
    eqLoad(s, h, mu) { return this.load(this.qhat(s, h, mu), s, h); },
    doubling(q0, h, mu) { let q = q0, t = 0; while (q < 2 * q0 && t < 5000) { const n = this.qn(q, 0, h, mu); if (n >= 2 * q0) return t + (2 * q0 - q) / (n - q); q = n; t++; } return t; },
    clampS(x) { return Math.max(0.1, Math.min(0.95, x)); },
    affOf(g, h) { return h ? g > 0 : g === 2; },
    muNow(s) { return s.mu + (s.drum ? s.muD : 0); },
    reset(level, o) {
      o = o || {}; const L = TP_LV[Math.max(0, Math.min(3, level | 0))], N = this.P().N.v;
      if (o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.lever(o.thaw.lever); return; }
      const s = this.s = { level: level | 0, h: L.h, mu: L.mu, muD: 0, drum: false, N, gen: 0, si: -1, phase: 'start', t: 0, unt: false, auto: false, whatif: null,
        lensLv: !!L.lens, lens: false, lensUsed: false, net: false, gulls: false, plugGen: null, meals: 0, quota: 0, balDone: false, balC: 0, balN: 0,
        sYou: 0.5, sCol: 0.5, need: 0, seasons: [], caught: 0, seen: 0, cTot: 0, nTot: 0, vis: [], dusk: 0, dives: 0, divesMax: 0, busy: 0, dv: null, ut: 0,
        asks: [], pred: {}, exp: {}, tol: {}, now: {}, hits: {}, ask: null, hist: [], steps: L.steps, log: [] };
      let q0 = L.q0;
      if (L.boss) {   // the drip varies by seed so no fixed answer fits every run; rain and drum each give half
        const mt = [0.014, 0.02, 0.026][Math.floor(R() * 3)]; s.mu = mt / 2; s.muD = mt / 2; s.drum = true; q0 = Math.sqrt(mt / 0.5);
        const st = []; for (let k = 0; k < 6; k++) { if (k === 1) st.push({ k: 'pause', note: 'twist', t: 2 }); st.push({ k: 'season', n: 1, dives: 6, boss: 1 }); if (k === 1) st.push({ k: 'ask', id: 't1' }); st.push({ k: 'lapse', g: 5 }); }
        s.steps = st; s.mt = mt;
      }
      if (q0 < 0) { s.sPrev = [0.3, 0.5, 0.8][Math.floor(R() * 3)]; q0 = this.r5(this.qhat(s.sPrev, L.h, L.mu)); }   // L3 opens at the balance of an earlier catch rate, so no fixed answer fits every run
      s.q0 = q0; s.q = q0; s.qE = q0; s.c = this.hw(q0, N);
      s.hist.push({ g: 0, q: this.r5(q0), qE: this.r5(q0) });
      this.next(s, []);
    },
    r5(x) { return Math.round(x * 1e5) / 1e5; },
    hw(q, N) { const p = 1 - q, AA = Math.round(N * p * p), aa = Math.round(N * q * q); return [AA, N - AA - aa, aa]; },
    /* ---------- the script ---------- */
    next(s, ev) {
      s.si++; s.t = 0; const st = s.steps[s.si];
      if (!st) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
      if (st.k === 'season') this.seasonStart(s, ev, st);
      else if (st.k === 'ask') { if (s.auto) { this.next(s, ev); return; } this.openAsk(s, ev, st.id); }
      else if (st.k === 'lapse') {
        if (!s.auto) (s.l0s || (s.l0s = [])).push({ c: s.c.slice(), q: s.q, qE: s.qE, gen: s.gen, hn: s.hist.length, si: s.si });   // where a What if? rewinds to
        s.phase = 'lapse'; s.lg = 0; s.lapseS = st.s0 ? 0 : s.sCol; if (st.s0) s.net = true; ev.push({ k: 'lapse', g: st.g });
      }
      else if (st.k === 'pause') { s.phase = 'pause'; s.note = st.note; if (st.note === 'net') s.net = true; if (st.note === 'lift') s.net = false; if (st.note === 'twist') s.gulls = true; ev.push({ k: 'note', note: st.note }); }
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; const st = s.steps[s.si] || {};
      if (s.busy > 0) this.diveTick(s, ev);
      if (s.phase === 'ask') { if (!s.unt && s.t >= TP_T.askMax) this.commit(s, ev, s.ask.id, null); return ev; }
      if (s.phase === 'pause') { if (s.t >= (s.auto ? 0.2 : st.t)) this.next(s, ev); return ev; }
      if (s.phase === 'dawn') { if (s.t >= TP_T.dawn) this.duskStart(s, ev); return ev; }
      if (s.phase === 'dusk') { this.duskStep(s, ev, st); return ev; }
      if (s.phase === 'lapse') {
        const per = s.auto ? 0.04 : st.g <= 4 ? TP_T.bossGen : TP_T.gen;
        if (s.t >= per) { s.t = 0; this.generation(s, ev, s.lapseS); s.lg++; if (s.lg >= st.g) { if (st.s0) s.net = false; this.next(s, ev); } }
      }
      return ev;
    },
    /* ---------- a season: the gull hunts a 48-nest stretch over 1–4 dusks; the catch share is s ---------- */
    seasonStart(s, ev, st) {
      const N = s.N, ps = s.c.map(x => x / N), m = WF.multinom(TP_T.V, ps), g = [];
      for (let k = 0; k < 3; k++) for (let j = 0; j < m[k]; j++) g.push(k);
      for (let i = g.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), x = g[i]; g[i] = g[j]; g[j] = x; }   // shuffle the nests
      s.vis = g.map(x => ({ g: x, aff: this.affOf(x, s.h), alive: true, ex: false, tm: 0 }));
      s.caught = 0; s.seen = s.vis.filter(c => c.aff).length; s.dusk = 0; s.quota = st.quota ? Math.max(1, Math.min(st.quota, s.seen)) : 0;   // a thin sample asks for all there are
      if (st.quota) s.need = s.quota;
      if (s.auto) { this.seasonEnd(s, ev, st, true); return; }
      ev.push({ k: 'season', bal: !!st.bal, n: s.seasons.length }); this.duskStart(s, ev);
    },
    duskStart(s, ev) {
      const st = s.steps[s.si]; s.phase = 'dusk'; s.t = 0; s.ut = 0; s.dusk++; s.dives = s.divesMax = st.dives; s.busy = 0; s.dv = null;
      for (const c of s.vis) { if (!c.alive || !c.aff) { c.ex = false; continue; } c.ex = R() < 0.4; c.tm = c.ex ? 0.3 + 0.9 * R() : 0.4 + 2.2 * R(); }
      ev.push({ k: 'dusk', n: s.dusk, left: s.vis.filter(c => c.alive && c.aff).length });
    },
    duskStep(s, ev, st) {
      const dt = this.dt, len = st.boss ? TP_T.bossDusk : TP_T.dusk;
      if (!s.unt) {
        for (const c of s.vis) { if (!c.alive || !c.aff) continue; c.tm -= dt; if (c.tm <= 0) { c.ex = !c.ex; c.tm = c.ex ? 0.9 + 0.6 * R() : 1.2 + 2.2 * R(); } }
      } else s.ut += dt;
      const left = s.vis.some(c => c.alive && c.aff), out = (s.dives <= 0 || !left) && s.busy === 0;
      if ((!s.unt && s.t >= len) || (s.unt && s.ut >= TP_T.untMax) || (out && s.t >= 0.6)) this.duskEnd(s, ev, !left);
    },
    duskEnd(s, ev, gone) {
      const st = s.steps[s.si]; s.busy = 0; s.dv = null; ev.push({ k: 'duskend', gone: !!gone });
      if (s.dusk < st.n && s.vis.some(c => c.alive && c.aff)) { s.phase = 'dawn'; s.t = 0; return; }
      this.seasonEnd(s, ev, st, false);
    },
    seasonEnd(s, ev, st, auto) {
      const sy = auto ? (s.whatifS != null ? s.whatifS : 0.5) : s.seen > 0 ? s.caught / s.seen : 0.5;
      if (st.bal) { if (!auto) { s.balDone = true; s.balC = s.caught; s.balN = s.seen; } this.next(s, ev); return; }
      s.sYou = Math.round(sy * 1000) / 1000;
      s.sCol = st.boss ? Math.round((s.gulls ? 0.75 + 0.2 * sy : 0.3 + 0.4 * sy) * 1000) / 1000 : this.clampS(s.sYou);
      if (!auto) { s.cTot += s.caught; s.nTot += s.seen; }
      s.seasons.push({ g: s.gen, sYou: s.sYou, sCol: s.sCol, c: auto ? 0 : s.caught, n: s.seen });
      ev.push({ k: 'seasonend', s: s.sYou, sc: s.sCol });   // the season's own generation runs first in the next time-lapse, so an ask sees the colony before it responds
      this.next(s, ev);
    },
    canDive(s) { return s.phase === 'dusk' && s.busy === 0 && s.dives > 0 && !s.lens && !s.auto; },
    dive(s, ev, i) {
      if (s.phase !== 'dusk') return; if (s.lens) { ev.push({ k: 'lensblock' }); return; }
      if (s.busy > 0) { ev.push({ k: 'busy' }); return; } if (s.dives <= 0) { ev.push({ k: 'nodives' }); return; }
      const c = s.vis[i]; if (!c) return;
      s.dives--; s.busy = TP_T.busy; s.dv = { i, at: TP_T.arrive }; ev.push({ k: 'dive', i });
    },
    diveTick(s, ev) {
      s.busy--; if (!s.dv) return; s.dv.at--;
      if (s.dv.at > 0) return; const i = s.dv.i, c = s.vis[i]; s.dv = null;
      if (c && c.alive && c.aff && c.ex) {
        c.alive = false; s.caught++; const st = s.steps[s.si] || {};
        if (!st.bal) s.meals++;
        ev.push({ k: 'catch', i, g: c.g, meals: s.meals, fed: s.quota > 0 && s.meals === s.quota });
      } else ev.push({ k: 'miss', i, empty: !(c && c.alive) });
    },
    /* ---------- one colony generation: selection at sc, mutation, Wright–Fisher sampling of N chicks ---------- */
    generation(s, ev, sc) {
      if (s.auto && s.wiPlug != null && s.drum && s.gen >= s.wiPlug) { s.drum = false; s.plugGen = s.gen; }
      const [AA, Aa, aa] = s.c, h = s.h, N = s.N, mu = this.muNow(s);
      const kAa = h ? WF.binom(Aa, sc) : 0, kaa = WF.binom(aa, sc), Aa2 = Aa - kAa, aa2 = aa - kaa;
      const Ac = 2 * AA + Aa2, ac = Aa2 + 2 * aa2, tot = Ac + ac, m = mu > 0 ? WF.binom(Ac, mu) : 0, q2 = tot > 0 ? (ac + m) / tot : 0;
      const nx = WF.multinom(N, [(1 - q2) * (1 - q2), 2 * q2 * (1 - q2), q2 * q2]);
      const LE = this.load(s.qE, sc, h);
      s.qE = this.qn(s.qE, sc, h, mu); s.c = [nx[0], nx[1], nx[2]]; s.q = (nx[1] + 2 * nx[2]) / (2 * N); s.gen++;
      const qb = (Aa + 2 * aa) / (2 * N), qs = tot > 0 ? ac / tot : 0, two = 2 * N;   // drip and leak as changes in the a share, in copies of 4,000: they cancel at balance
      const rec = { g: s.gen, q: this.r5(s.q), qE: this.r5(s.qE), m: Math.round((q2 - qs) * two * 10) / 10, k: Math.round((qb - qs) * two * 10) / 10, d: kAa + kaa, L: Math.round((kAa + kaa) / N * 1e4) / 10, LE: Math.round(LE * 1e4) / 10, s: sc, mu };
      s.hist.push(rec); ev.push({ k: 'gen', g: s.gen, m, kc: kAa + 2 * kaa, q: rec.q });
    },
    /* ---------- predictions: the sim opens the ask; the expectation is the model's ---------- */
    openAsk(s, ev, id) {
      const h = s.h, mu = this.muNow(s); let A, e, now = null, tol;
      if (id === 'a1' || id === 'b1') { e = this.qhat(s.sCol, h, mu); now = s.qE; tol = Math.max(0.006, 0.3 * e); A = { kind: 'y', chart: 0, lo: 0, hi: id === 'a1' ? 0.25 : 0.5 }; A.start = A.hi; }
      else if (id === 'c1') { e = this.doubling(s.qE, h, mu); tol = 0.3 * e; A = { kind: 'x', chart: 0, lo: 0, hi: 60, start: 60 }; }
      else { e = 1000 * this.eqLoad(s.sCol, h, mu); now = 1000 * this.load(s.qE, s.sCol, h); tol = 0.2 * e; A = { kind: 'y', chart: 0, lo: 0, hi: 60, start: 60 }; }
      A.id = id; s.ask = A; s.exp[id] = e; s.tol[id] = tol; if (now != null) s.now[id] = now; s.cnt = s.cnt || {}; s.cnt[id] = now == null || Math.abs(e - now) >= tol;   // an ask counts only when "no change" would miss s.asks.push(id); s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id });
    },
    commit(s, ev, id, v) {
      if (!s.ask || s.ask.id !== id) return; const A = s.ask, e = s.exp[id], tol = s.tol[id], now = s.now[id]; let hit = false;
      if (v != null && isFinite(+v)) { v = Math.max(A.lo, Math.min(A.hi, +v)); const d = Math.abs(v - e); hit = !!s.cnt[id] && d <= tol && (now == null || d < Math.abs(v - now)); } else v = null;   // also nearer the answer than "no change"
      s.pred[id] = v; s.hits[id] = hit; s.ask = null; ev.push({ k: 'commit', id }); this.next(s, ev);
    },
    /* ---------- What if? (D1 G9): the frozen state reruns automatically with one lever changed ---------- */
    lever(k) {
      const s = this.s; s.whatif = k; s.auto = true; s.ask = null; s.t = 0; s.lens = false; s.busy = 0; s.dv = null;
      const back = r => { s.c = r.c.slice(); s.q = r.q; s.qE = r.qE; s.gen = r.gen; s.hist.length = r.hn; };
      if (s.level < 3) {   // the first time-lapse again (the balance run, or the net), with one lever changed; no dusk after it
        const r = s.l0s[0]; back(r); s.wiQ0 = r.q;
        if (k === 'halfs') s.sCol = this.clampS(s.sCol / 2);
        if (k === 'real1' || k === 'real2' || k === 'slow') s.mu = 1e-5;
        if (k === 'dom') s.h = 1;
        s.steps = s.steps.slice(0, r.si + 1).map((x, i) => i === r.si && k === 'long' ? Object.assign({}, x, { g: 90 }) : x);
        s.si = r.si - 1; s.net = false; this.next(s, []); return;
      }
      back({ c: this.hw(s.q0, s.N), q: s.q0, qE: s.q0, gen: 0, hn: 1 });   // the boss from its start at an average catch; the lever sets the gulls and the drum
      s.drum = true; s.gulls = false; s.plugGen = null; s.seasons = []; s.whatifS = 0.5; s.wiPlug = k === 'early' ? 5 : 10;
      if (k === 'nogulls') s.steps = s.steps.filter(x => !(x.k === 'pause' && x.note === 'twist'));
      s.si = -1; this.next(s, []);
    },
    /* ---------- actions ---------- */
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      if (a.k === 'unt') { s.unt = !!a.on; ev.push({ k: 'unt', on: s.unt }); return ev; }
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id) this.commit(s, ev, a.id, a.moved === false ? null : a.v); return ev; }
      if (s.auto || s.phase === 'over') return ev;
      if (a.k === 'plug') { if (s.drum && s.phase !== 'ask') { s.drum = false; s.plugGen = s.gen; ev.push({ k: 'plug', g: s.gen }); } return ev; }
      if (a.k === 'lens') { if (s.lensLv && s.phase === 'dusk') { s.lens = !!a.on; if (s.lens) s.lensUsed = true; ev.push({ k: 'lens', on: s.lens }); } return ev; }
      if (a.k === 'dive') { this.dive(s, ev, a.i | 0); return ev; }
      if (a.k === 'end') { if (s.phase === 'dusk' && s.busy === 0) this.duskEnd(s, ev, false); return ev; }
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_TAP_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, interesting: this.interesting(s) };
    },
    lastLE(s) { const h = s.hist[s.hist.length - 1]; return h && h.LE != null ? h.LE : 0; },
    interesting(s) {   // chosen from what happened (lessons §1.5)
      if (s.whatif) return null; const st = CH_TAP_V2.stars, n = s.level;
      if (n === 3) { if (st.discover(s, 3)) return null; if (s.plugGen == null) return 'nodrum'; return s.plugGen < 5 ? 'early' : 'late'; }
      if (st.discover(s, n)) return n < 2 && s.sCol < 0.3 ? 'weak' : null;
      if (n === 1 && !s.lensUsed && s.meals >= s.need) return 'nolens';
      return n === 2 ? 'feast' : 'hungry';
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s || s.auto || s.phase === 'over') return out;
      if (s.ask) { const A = s.ask; for (let k = 0; k <= 50; k++) out.push({ k: 'predict', id: A.id, v: Math.round((A.lo + (A.hi - A.lo) * k / 50) * 1e4) / 1e4 }); return out; }
      if (s.phase === 'dusk') { if (this.canDive(s)) s.vis.forEach((c, i) => { if (c.alive) out.push({ k: 'dive', i }); }); if (s.busy === 0) out.push({ k: 'end' }); if (s.lensLv) out.push({ k: 'lens', on: !s.lens }); }
      if (s.drum) out.push({ k: 'plug' });
      return out;
    },
    /* ---------- bots (tests/bots.js): (s, acts, rnd) → action | null. No bot may earn three stars in a level or across the unit. ---------- */
    bots: {
      alwaysA(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'random', 'lo', 'now'); },        // dive on any nest at once; lowest prediction; shut the drum at once
      alwaysB(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'never', 'hi', 'never'); },       // never dive (ends each dusk); predictions at the top
      greedy(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'best', 'still', 'now'); },        // a perfect hunter that never moves a prediction; drum at once
      threshold(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'best', 'mid', 'g5'); },        // perfect hunter, every prediction at mid-axis, drum after the gulls
      lensAlways(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'lens', 'mid', 'g5'); },       // the lens on all the time
      line(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'best', 'nochange', 'g5'); },        // "no change" answers; the boss line at a fixed 20
      halfNow(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'best', 'half', 'g5'); },         // "half of now" answers
      expert(s, acts, rnd) { return CH_TAP_V2.sim.bot(s, acts, rnd, 'best', 'exact', 'g10'); }         // test policy: reads s.exp (never in a sweep); shuts the drum a season after the gulls join
    },
    bot(s, acts, rnd, hunt, pred, drum) {
      if (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt && !s.unt) return { k: 'unt', on: true };
      if (s.ask) {
        const A = s.ask, P = acts.filter(a => a.k === 'predict'), near = v => P.reduce((b, a) => (Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b));
        if (pred === 'still') return { k: 'predict', id: A.id, v: A.start, moved: false };
        if (pred === 'exact') return { k: 'predict', id: A.id, v: s.exp[A.id] };
        if (pred === 'nochange') return near(A.id === 't1' ? 20 : A.id === 'c1' ? 25 : s.qE);
        if (pred === 'half') return near(A.id === 't1' ? 500 * this.load(s.qE, s.sCol, s.h) : A.id === 'c1' ? s.qE / this.muNow(s) : s.qE / 2);
        return near(pred === 'lo' ? A.lo : pred === 'hi' ? A.hi : (A.lo + A.hi) / 2);
      }
      if (s.drum && (drum === 'now' || (drum === 'g5' && s.gen >= 5 && s.gulls) || (drum === 'g10' && s.gen >= 10))) return { k: 'plug' };
      if (s.phase !== 'dusk') return null;
      if (hunt === 'never') return s.busy === 0 && s.t > 0.5 ? { k: 'end' } : null;
      if (hunt === 'lens') { if (!s.lens && s.lensLv) return { k: 'lens', on: true }; return s.t > 2 && s.busy === 0 ? { k: 'end' } : null; }
      if (s.lens) return { k: 'lens', on: false };
      if (!this.canDive(s)) return null;
      if (hunt === 'random') { const D = acts.filter(a => a.k === 'dive'); return D.length ? D[Math.floor(rnd() * D.length)] : null; }
      if (s.lensLv && !s.lensUsed) return { k: 'lens', on: true };
      const arr = TP_T.arrive * this.dt + 0.02; let best = -1;
      s.vis.forEach((c, i) => { if (c.alive && c.aff && c.ex && (s.unt || c.tm > arr) && best < 0) best = i; });
      if (best >= 0) return { k: 'dive', i: best };
      if (s.unt) return { k: 'end' };
      return null;
    }
  },

  /* ---------- stars, against the expectation for the parameters in force ---------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif || s.phase !== 'over') return false;
      if (n === 0) return s.meals >= s.need && s.balDone;
      if (n === 1) return s.meals >= s.need && s.lensUsed && s.balDone;
      if (n === 2) return s.meals >= s.need;
      const LE0 = 1000 * s.mt, end = CH_TAP_V2.sim.lastLE(s);
      return s.plugGen != null && s.plugGen >= 5 && end <= 0.6 * LE0;
    },
    predict: (s, n) => !s.whatif && n < 3 && !!s.hits[['a1', 'b1', 'c1'][n]],
    transfer: (s, n) => !s.whatif && n === 3 && !!s.hits.t1
  },
  unitStars(lv) {   // D3: Discover = chicks fed in two of L1–L3 and the boss; Predict = two of three; Transfer = the boss gesture
    const m = i => lv[i] | 0; let d = 0, p = 0; for (let i = 0; i < 3; i++) { if (m(i) & 1) d++; if (m(i) & 2) p++; }
    return (d >= 2 && (m(3) & 1) ? 1 : 0) | (p >= 2 ? 2 : 0) | (m(3) & 4 ? 4 : 0);
  },
  /* result code (30 bits): 0–2 level, 3–5 mask, 6–13 catch rate %, 14–20 prediction ×100 of its axis span (127 none), 21–27 the a share ×200 at the end */
  resultBits(s, level) {
    if (!s) return 0; const n = Math.max(0, Math.min(3, level | 0)), st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(v)));
    const id = ['a1', 'b1', 'c1', 't1'][n], span = { a1: 0.25, b1: 0.5, c1: 60, t1: 60 }[id], pv = s.pred[id] == null ? 127 : c(100 * s.pred[id] / span, 126);
    return (n | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 3 | c(100 * s.sYou, 255) << 6 | pv << 14 | c(200 * s.q, 127) << 21) >>> 0;
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = false; this._asking = null; this._hudSig = ''; this._dockSig = '';
    this.v = { t: 0, ff: false, hold: -1, fold: 0, said: {}, bgk: '', bgs: {}, anims: [], drops: [], leaks: [], dive: null, cur: 0, banner: null, ghostR: [], thaw: !!o.thaw, lapseFrom: null, spl: [] };
    Sim.start(this, n, o);
    const ui = Save.d && Save.d.ui;
    if (!o.thaw && !o.replay && ui && ui.unt) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    const s = this.sim.s;
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = this.levels[n] && this.levels[n].name;
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
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'tp-' + k); },

  /* ---------- the frame ---------- */
  update(dt) {
    const v = this.v;
    for (const e of Sim.run(this, 0)) this.juice(e);
    if (v.hold >= 0) { v.hold += dt; if (!this.phoneStrip() || v.hold > 1.2) v.hold = -1; }
    const s0 = this.sim.s, slow = /lapse|pause|dawn/.test(s0.phase), ff = s0.auto ? 3 : v.ff && slow ? 3 : 1;
    for (const e of Sim.run(this, v.hold >= 0 ? 0 : dt * ff)) this.juice(e);
    const s = this.sim.s; v.t += dt;
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    v.anims = v.anims.filter(a => (a.t += dt) < a.d); v.drops = v.drops.filter(a => (a.t += dt) < a.d); v.leaks = v.leaks.filter(a => (a.t += dt) < a.d);
    v.ghostR = v.ghostR.filter(a => (a.t += dt) < 2); v.spl = v.spl.filter(a => (a.t += dt) < a.d);
    if (v.dive) { v.dive.t += dt; if (v.dive.t > 1.1) v.dive = null; }
    if (v.pool == null) v.pool = s.q; v.pool += (s.q - v.pool) * Math.min(1, dt * 4);
    if (v.ghost0 && !v.banner) { v.ghost0 = false; this.teach(); }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; v.fold = 1; }
    if (v.fold && v.hold < 0) { v.fold = 0; if (typeof Predict !== 'undefined' && Predict.fold) Predict.fold(); }
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; v.ff = false; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; v.endT = 0; return; } v.endT += dt; if (v.endT < 0.9 && !s.auto) return; this._ended = true; this.finish(r); }
  },
  teach() {   // the ghost hand on this level's new verb (a known verb is skipped by Ghost itself)
    if (typeof Ghost === 'undefined') return; const n = this.level;
    if (n === 0) Ghost.show({ verb: 'tap', key: ' ', at: () => this.targetXY() || this.nestXY(0), until: () => this.sim.s.caught > 0 || this.sim.s.phase !== 'dusk' });
    else if (n === 1) Ghost.show({ verb: 'toggle', key: 'l', el: () => document.querySelector('#dock [data-id="tp-lens"]'), until: () => this.sim.s.lensUsed || this.sim.s.phase !== 'dusk' });
  },
  targetXY() { const s = this.sim.s; for (let i = 0; i < s.vis.length; i++) { const c = s.vis[i]; if (c.alive && c.aff && c.ex) return this.nestXY(i); } return null; },
  hud() {
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; if (typeof HUD === 'undefined') return;
    const st = s.steps[s.si] || {}; let t, num = '';
    if (s.auto) t = C.auto;
    else if (s.phase === 'ask') t = Txt.f({ a1: C.askA1, b1: C.askB1, c1: C.askC1, t1: C.askT1 }[s.ask.id], { s: Math.round(100 * s.sYou), q: s.q.toFixed(2) });
    else if (s.phase === 'pause') t = C[s.note] || C.lapse;
    else if (s.phase === 'dawn') t = C.dawn;
    else if (s.phase === 'lapse') t = s.level === 3 ? (s.plugGen != null ? C.plugged : s.gen >= 15 && s.drum ? C.hint : C.season) : s.net ? C.netLapse : s.level === 2 ? C.purge : C.lapse;
    else if (s.phase === 'dusk') t = s.lens ? C.lens : st.bal ? C.bal : st.feast ? C.feast : st.boss ? (s.gen === 0 ? C.boss : s.plugGen == null && s.gen >= 15 ? C.hint : s.gen === 5 ? C.twist : C.bossDusk) : this.level === 0 && s.caught === 0 && s.dusk === 1 ? this.content.firstWords : s.unt ? C.duskU : C.dusk;
    else t = C.over;
    if (s.phase === 'over' && !s.auto) t = C.over;
    if (s.phase === 'dusk' && !st.boss) num = st.bal ? Txt.f(L.divesN, { d: s.dives }) : Txt.f(L.fedN, { m: s.meals, need: s.quota }) + ' · ' + Txt.f(L.divesN, { d: s.dives });
    else if (s.level === 3) num = Txt.f(L.loadN, { l: (this.loadNow()).toFixed(0) });
    else num = 'q ' + s.q.toFixed(3);
    const sig = t + num; if (sig !== this._hudSig) { this._hudSig = sig; HUD.say(t, num); }
    const bar = typeof document !== 'undefined' && document.getElementById ? document.getElementById('bar-gen') : null;
    if (bar) { const lab = s.phase === 'dusk' || s.phase === 'dawn' ? Txt.f(L.dusk, { n: s.dusk }) : Txt.f(L.gen, { n: s.gen }); if (bar.textContent !== lab) bar.textContent = lab; }
  },
  loadNow() { const s = this.sim.s, h = s.hist[s.hist.length - 1]; return h && h.LE != null ? h.LE : 1000 * this.sim.load(s.qE, s.sCol, s.h); },
  dock() {
    if (typeof Dock === 'undefined') return; const s = this.sim.s, L = this.content.labels;
    const sig = s.phase + (s.lens ? 'l' : '') + (s.ask ? s.ask.id : '') + (s.auto ? 'a' : '') + (s.drum ? 'd' : '') + (s.busy > 0 ? 'b' : '') + (this.v.ff ? 'f' : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'tp-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (s.auto || s.phase === 'over') { Dock.set([]); return; }
    const b = [];
    if (s.phase === 'dusk') {
      if (s.lensLv) b.push({ id: 'tp-lens', label: L.lensB, key: 'l', pressed: !!s.lens, fn: () => Sim.act(this, { k: 'lens', on: !this.sim.s.lens }) });
      b.push({ id: 'tp-end', label: L.end, key: 'e', fn: () => Sim.act(this, { k: 'end' }) });
    } else if (/lapse|pause|dawn/.test(s.phase)) b.push({ id: 'tp-ff', label: L.fast, key: ' ', disabled: this.v.ff, fn: () => { this.v.ff = true; } });
    if (s.level === 3 && s.drum && s.plugGen == null && s.gen >= 15) b.push({ id: 'tp-drum', label: L.shutDrum, key: 'd', fn: () => Sim.act(this, { k: 'plug' }) });   // a late tap path for keyboard and switch users
    Dock.set(b);
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    Predict.ask({ id: A.id, chart: A.chart, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.start, soft: s.unt ? null : 26, needMove: true, linger: 900,
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
    if (s.whatif) { o.body = Txt.f(C.whatifBody[s.whatif], V); o.take = null; o.interesting = null; }
    else if (n < 3) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    if (!s.whatif && typeof Freezer !== 'undefined') { Freezer.put(this.id, 1, this.sim.snapshot(), { force: true }); o.whatIf = { gen: 1, levers: [['halfs', 'real1'], ['dom', 'real2'], ['long', 'slow'], ['nogulls', 'early']][n] }; }
    o.why = n < 3 ? C.levelWhy[n] : C.why;
    const spec = this.cardSpec(); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  bodyVars() {
    const s = this.sim.s, sim = this.sim, f3 = x => (Math.round(x * 1000) / 1000).toFixed(3), H = s.hist, last = H[H.length - 1] || { q: s.q };
    const tail = H.slice(-8), qm = tail.reduce((a, b) => a + b.q, 0) / Math.max(1, tail.length), mu = sim.muNow(s), n = this.level;
    const V = { c: s.cTot, n: s.nTot, s: Math.round(100 * s.sCol), q: f3(qm), b: s.balC, l: (sim.lastLE(s)).toFixed(0) };
    const t10 = H.slice(-10).filter(r => r.m != null); V.k = Math.round(t10.reduce((a, r) => a + r.k, 0) / Math.max(1, t10.length)); V.m = Math.round(t10.reduce((a, r) => a + r.m, 0) / Math.max(1, t10.length));   // realised, colony-wide
    V.e = f3(sim.qhat(s.sCol, s.h, mu)); V.r = f3(sim.qhat(s.sCol, 0, mu)); V.x = Math.round(Math.sqrt(s.sCol / Math.max(1e-9, mu)));
    if (n === 1) { const q = qm; V.k = Math.round(200 * q * (1 - q)); V.a = Math.round(100 * q * q); }
    if (n === 2) { const q0 = s.wiQ0 != null ? s.wiQ0 : H[0] ? H[0].q : s.q0, q30 = H[Math.min(30, H.length - 1)].q; V.q0 = f3(q0); V.q1 = f3(q30); V.d = Math.round(s.exp.c1 != null ? s.exp.c1 : sim.doubling(q0, s.h, 0.02)) + ' generations'; V.q = f3(last.q); V.e = (30 * mu * (1 - q0)).toFixed(4); }
    return V;
  },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, S2 = typeof Snd2 !== 'undefined' ? Snd2 : null, P = this.pos();
    const snd = (k, x, y) => { if (S2) S2.play(k, { x, y }); };
    switch (e.k) {
      case 'season': if (e.n > 0 || e.bal) this.banner(e.bal ? this.content.labels.bal : Txt.f(this.content.labels.season, { n: e.n + 1 }), 1100); return;
      case 'dusk': { if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.dusk, { n: e.n, k: e.left })); if (e.n > 1) this.banner(Txt.f(this.content.labels.dusk, { n: e.n }), 900); snd('dusk', P.W / 2, P.top + 30); return; }
      case 'dive': { const p = this.nestXY(e.i), g = this.gullXY(); v.dive = { i: e.i, t: 0, x0: g[0], y0: g[1], x1: p[0], y1: p[1], res: null }; if (F) F.tier(1); snd('swish', p[0], p[1]); return; }
      case 'catch': {
        const p = this.nestXY(e.i); if (v.dive) v.dive.res = 'catch';
        if (F) { F.burst('dust', p[0], p[1], 7, { ink: '#F2EEE8' }); F.pop('+1', p[0], p[1] - 22, 1); F.ring(p[0], p[1], 18, { ms: 180 }); }
        v.leaks.push({ t: 0, d: 0.9, n: e.g === 2 ? 2 : 1 }); snd('wing', p[0], p[1]);
        if (e.fed && !v.said.fed) { v.said.fed = 1; this.whisper('fed'); if (F) F.tier(2, ms => F.ring(P.gnX, P.gnY, 34, { ms })); }
        if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.catch, { m: e.meals }));
        return;
      }
      case 'miss': { const p = this.nestXY(e.i); if (v.dive) v.dive.res = 'miss'; v.ghostR.push({ x: p[0], y: p[1], t: 0 }); if (F) F.ring(p[0], p[1], 14, { dashed: true, ms: 300 }); if (typeof Snd !== 'undefined' && Snd.miss) Snd.miss(); this.whisper(e.empty ? 'empty' : 'miss'); return; }
      case 'busy': this.whisper('busy'); return;
      case 'nodives': this.whisper('nodives'); return;
      case 'lensblock': this.whisper('lensblock'); return;
      case 'lens': if (F) F.ring(P.poolX, P.poolY, 30, { ms: 220 }); snd('scale', P.poolX, P.poolY); this._dockSig = ''; return;
      case 'duskend': if (e.gone) this.whisper('gone'); return;
      case 'seasonend': if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); return;
      case 'lapse': return;
      case 'gen': {
        const nd = Math.min(5, Math.max(e.m > 0 ? 1 : 0, Math.round(e.m / 12))); for (let i = 0; i < nd; i++) v.drops.push({ t: -i * 0.03, d: 0.45, x: (this.hash('d' + e.g + i) % 100) / 100 });
        const nl = Math.min(5, Math.round(e.kc / 12)); if (nl > 0) v.leaks.push({ t: 0, d: 0.6, n: nl });
        if (typeof Live !== 'undefined' && e.g % 10 === 0) Live.say(Txt.f(this.content.live.gen, { n: e.g, q: e.q.toFixed(3) }));
        if (e.g % 2 === 0) snd('tick', P.poolX, P.poolY); if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); return;
      }
      case 'note': { const L = this.content.labels, lab = { net: L.net, lift: L.net, twist: L.gulls }[e.note]; if (lab) this.banner(lab, 1500); if (F) F.tier(2, ms => F.ring(P.cx, P.ledgeY[2], 60, { ms })); snd(e.note === 'twist' ? 'wing' : 'swish', P.cx, P.ledgeY[2]); if (e.note === 'twist') v.extra = { t: 0 }; return; }
      case 'ask': return;
      case 'commit': if (this.phoneStrip()) v.hold = 0; this.reveal(e.id); return;
      case 'plug': { if (F) { F.shake(5, 180); F.burst('spark', P.drumX, P.drumY, 10, { ink: '#E9B08A' }); F.tier(3, ms => F.ring(P.drumX, P.drumY, 40, { ms })); } snd('crack', P.drumX, P.drumY); this.whisper('drum'); if (typeof Live !== 'undefined') Live.say(this.content.live.plug); return; }
      case 'unt': this._dockSig = ''; return;
      case 'over': if (F) F.tier(2, ms => F.ring(P.poolX, P.poolY, 36, { ms })); return;
    }
  },
  hash(v) { let h = 2166136261; const t = String(v); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h ^ h >>> 13) >>> 0; },

  /* ---------- input: tap a nest to dive; tap the drum to shut it; tap during a time-lapse to speed it ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, P = this.pos();
    if (s.auto || s.phase === 'ask' || s.phase === 'over') return;
    if (s.level === 3 && s.drum) { const dx = x - P.drumX, dy = y - P.drumY; if (dx * dx + dy * dy <= Math.max(30, P.drumR * 1.4) * Math.max(30, P.drumR * 1.4)) { Sim.act(this, { k: 'plug' }); return; } }
    if (/lapse|pause|dawn/.test(s.phase)) { v.ff = true; return; }
    if (s.phase !== 'dusk') return;
    let best = -1, bd = 1e9; const r = Math.max(24, P.cr * 1.6);
    for (let i = 0; i < s.vis.length; i++) { const p = this.nestXY(i), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < bd) { bd = d; best = i; } }
    if (best >= 0 && bd <= r * r) { v.cur = best; Sim.act(this, { k: 'dive', i: best }); }
  },
  onKey(k) {
    const s = this.sim.s, v = this.v, n = s.vis.length;
    if ((k === 'd' || k === 'D') && s.level === 3) { Sim.act(this, { k: 'plug' }); return; }
    if (k === ' ' && /lapse|pause|dawn/.test(s.phase)) { v.ff = true; return; }
    if (s.phase !== 'dusk' || !n) return;
    if (k === 'ArrowRight' || k === 'ArrowLeft') { const d = k === 'ArrowRight' ? 1 : -1; for (let j = 1; j <= n; j++) { const i = (v.cur + d * j + n * 4) % n; if (s.vis[i].alive) { v.cur = i; break; } } return; }
    if (k === 'ArrowDown' || k === 'ArrowUp') { v.cur = (v.cur + (k === 'ArrowDown' ? 8 : n - 8)) % n; return; }
    if (k === ' ') { Sim.act(this, { k: 'dive', i: v.cur }); return; }
    if (k === 'l' || k === 'L') { Sim.act(this, { k: 'lens', on: !s.lens }); return; }
    if (k === 'e' || k === 'E') Sim.act(this, { k: 'end' });
  },
  teacherStep() { this.v.ff = true; },

  /* ---------- geometry (canvas px, from a fixed virtual layout: 6 ledges × 8 nests) ---------- */
  pos() {
    const W = Stage.w, H = Stage.h, top = this.hudH() + 4, ph = W < 600, h = H - top, P = { W, H, top, ph, u: Stage.u || Math.min(W, 1.2 * H) };
    P.hz = top + h * (ph ? 0.2 : 0.46); P.band = Math.max(ph ? 86 : 80, h * (ph ? 0.19 : 0.17)); P.foot = H - P.band;
    P.x0 = ph ? W * 0.05 : W * 0.3; P.x1 = W - (ph ? 6 : W * 0.025); P.y0 = top + h * (ph ? 0.1 : 0.08); P.cx = (P.x0 + P.x1) / 2;
    const dy = (P.foot - P.y0 - 14) / 6.15; P.dy = dy; P.ledgeY = []; for (let k = 0; k < 6; k++) P.ledgeY.push(P.y0 + 14 + dy * (k + 0.92));
    P.dx = (P.x1 - P.x0) / 8.4; P.cr = Math.max(8, Math.min(P.dx, dy) * 0.3);
    P.poolX = ph ? W * 0.25 : W * 0.15; P.poolY = P.foot + P.band * 0.66; P.poolW = ph ? W * 0.38 : Math.min(W * 0.24, 200); P.poolH = Math.max(26, P.band * 0.46);
    P.cloudX = P.poolX + P.poolW * 0.02; P.cloudY = P.foot + P.band * 0.16;
    P.drumX = ph ? W * 0.84 : W * 0.88; P.drumY = P.foot + P.band * 0.6; P.drumR = Math.max(13, P.band * 0.2);
    P.gnX = P.x1 - Math.max(40, P.dx * 0.9); P.gnY = P.y0 - 2;
    return P;
  },
  nestXY(i) { const P = this.pos(), k = Math.floor(i / 8), j = i % 8, off = k % 2 ? 0.35 : 0; return [P.x0 + P.dx * (j + 0.55 + off), P.ledgeY[k] - P.cr * 0.55]; },
  gullXY() {   // where the gull is now: soaring over the cliff top, diving to a nest, carrying a chick home
    const v = this.v, P = this.pos(), t = typeof Fx !== 'undefined' && Fx.calm ? 0 : v.t, soar = [P.cx + Det.cos(t * 0.6) * (P.x1 - P.x0) * 0.32, P.top + Math.max(16, (P.y0 - P.top) * 0.5) + Det.sin(t * 1.2) * 6];
    const d = v.dive; if (!d) return soar;
    const ta = TP_T.arrive * TP_T.dt, f = d.t / ta;
    if (f < 1) { const e = f * f; return [d.x0 + (d.x1 - d.x0) * e, d.y0 + (d.y1 - d.y0) * e]; }
    const g = Math.min(1, (d.t - ta) / 0.7), home = d.res === 'catch' ? [P.gnX, P.gnY - 10] : soar;
    return [d.x1 + (home[0] - d.x1) * g, d.y1 + (home[1] - d.y1) * g - Det.sin(Math.PI * g) * 30];
  },

  /* ---------- drawing ---------- */
  draw(c, w, h) {
    const s = this.sim.s; if (!s) return; const v = this.v, P = this.pos(), L = this.content.labels, calm = typeof Fx !== 'undefined' && Fx.calm, t = calm ? 0 : v.t;
    c.drawImage(this.bake('bg', w, h, (cc, W, H) => this.paintBg(cc, P)), 0, 0, w, h);
    this.sea(c, P, t);
    this.poolDraw(c, P, t);
    if (s.level === 3) this.drumDraw(c, P, t);
    this.colony(c, P, t);
    if (s.net) this.netDraw(c, P);
    this.gullNest(c, P);
    this.gullDraw(c, P, t);
    if (v.extra) this.extraGulls(c, P, t);
    for (const g of v.ghostR) { c.save(); c.globalAlpha = 1 - g.t / 2; c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = '#F4EEE6'; c.beginPath(); c.arc(g.x, g.y, P.cr * 1.4, 0, TAU); c.stroke(); c.restore(); }
    if (s.phase === 'dusk' && (typeof Fx === 'undefined' || Fx.lastInput === 'key')) { const p = this.nestXY(v.cur); c.save(); c.lineWidth = 2; c.strokeStyle = '#FBE3C8'; c.setLineDash([3, 3]); c.beginPath(); c.arc(p[0], p[1], P.cr * 1.7, 0, TAU); c.stroke(); c.restore(); }
    if (typeof Lbl === 'undefined') return;
    if (s.phase !== 'dusk' && s.phase !== 'dawn') Lbl.put('tp-gen', Txt.f(L.gen, { n: s.gen }), 12, P.top + 16, { align: 'left', size: 14, c, mono: true });
    if (s.lens) Lbl.put('tp-lens', L.lensOn, P.cx, P.y0 + 2, { size: 13, c });
    if (v.banner) { const b = v.banner, a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; Lbl.put('tp-banner', b.text, w / 2, P.top + 40, { size: 22, c, weight: 700 }); c.restore(); }
    if (/lapse|pause|dawn/.test(s.phase) && !v.ff && !s.auto) Lbl.put('tp-ff', L.ff, w - 12, P.top + 16, { align: 'right', size: 12, c });
    if (s.phase === 'ask') { c.fillStyle = 'rgba(30,20,44,0.2)'; c.fillRect(0, 0, w, h); }
  },
  bake(key, w, h, fn) {
    const v = this.v, sz = Math.round(w) + 'x' + Math.round(h) + ':' + Math.round(this.hudH()); if (v.bgk !== sz) { v.bgk = sz; v.bgs = {}; } if (v.bgs[key]) return v.bgs[key];
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, cv = mkCanvas(Math.round(w * d), Math.round(h * d)), c = cv.getContext('2d'); c.scale(d, d); fn(c, w, h); v.bgs[key] = cv; return cv;
  },
  paintBg(c, P) {   // baked once per size: sunset sky, the sun, far headlands with their colonies, the cliff face, ledges and nest cups
    const W = P.W, H = P.H, r = rng(13), g = c.createLinearGradient(0, 0, 0, P.hz);
    g.addColorStop(0, '#2E2450'); g.addColorStop(0.45, '#6B3F6E'); g.addColorStop(0.78, '#D2706A'); g.addColorStop(1, '#F2B27A'); c.fillStyle = g; c.fillRect(0, 0, W, P.hz + 2);
    for (let i = 0; i < 7; i++) { const y = P.hz * (0.25 + 0.1 * i) + r() * 10, x = r() * W, len = W * (0.3 + 0.4 * r()); c.fillStyle = i < 3 ? 'rgba(86,58,104,0.55)' : 'rgba(150,76,96,0.5)'; c.beginPath(); c.ellipse(x, y, len / 2, 3 + r() * 4, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,170,130,0.35)'; c.beginPath(); c.ellipse(x, y + 3, len / 2.3, 1.5, 0, 0, TAU); c.fill(); }   // cloud streaks lit from below
    const sx = P.ph ? W * 0.16 : W * 0.14, sy = P.ph ? P.y0 - 8 : P.hz - 14, sr = Math.max(14, P.u * 0.05), gl = c.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 6);
    gl.addColorStop(0, 'rgba(255,214,160,0.75)'); gl.addColorStop(1, 'rgba(255,170,120,0)'); c.fillStyle = gl; c.fillRect(sx - sr * 6, sy - sr * 6, sr * 12, sr * 12);
    c.fillStyle = '#FFD9A0'; c.beginPath(); c.arc(sx, sy, sr, 0, TAU); c.fill();
    const sea = c.createLinearGradient(0, P.hz, 0, H); sea.addColorStop(0, '#6E6A86'); sea.addColorStop(0.3, '#4C5A70'); sea.addColorStop(1, '#2C3A4C'); c.fillStyle = sea; c.fillRect(0, P.hz, W, H - P.hz);
    if (!P.ph) {   // far headlands, each with its own colony as specks
      for (const [x0, x1, hh, col] of [[-20, W * 0.2, 46, '#4F3F5E'], [W * 0.06, W * 0.3, 30, '#5E4A68']]) {
        c.fillStyle = col; c.beginPath(); c.moveTo(x0, P.hz); c.lineTo(x0 + 10, P.hz - hh * 0.7); c.lineTo((x0 + x1) / 2, P.hz - hh); c.lineTo(x1 - 8, P.hz - hh * 0.6); c.lineTo(x1, P.hz); c.closePath(); c.fill();
        c.fillStyle = 'rgba(244,238,230,0.55)'; for (let i = 0; i < 40; i++) c.fillRect(x0 + 12 + r() * (x1 - x0 - 24), P.hz - hh * 0.65 + r() * hh * 0.55, 1.2, 1.2);
      }
    }
    // the cliff: a dark slate-violet mass, rim-lit coral on its sunward edge, with strata, guano streaks and six ledges
    const cg = c.createLinearGradient(P.x0, 0, P.x1, 0); cg.addColorStop(0, '#4A3A52'); cg.addColorStop(0.25, '#3A2F45'); cg.addColorStop(1, '#2A2334'); c.fillStyle = cg;
    c.beginPath(); c.moveTo(P.x0 + 6, P.y0); for (let k = 0; k <= 12; k++) c.lineTo(P.x0 - 4 + r() * 10 - (k % 3) * 3, P.y0 + (P.foot - P.y0) * k / 12); c.lineTo(W + 2, P.foot + 4); c.lineTo(W + 2, P.y0 - 6); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(240,140,110,0.55)'; c.lineWidth = 3; c.beginPath(); c.moveTo(P.x0 + 6, P.y0); c.lineTo(P.x0 + 2, P.foot); c.stroke();
    c.fillStyle = '#5E6B45'; c.beginPath(); c.moveTo(P.x0 + 4, P.y0 + 2); for (let x = P.x0; x <= W; x += 8) c.lineTo(x, P.y0 - 4 - r() * 6); c.lineTo(W, P.y0 + 4); c.closePath(); c.fill();   // the grassy cliff top
    c.strokeStyle = 'rgba(120,140,80,0.9)'; c.lineWidth = 1.2; for (let x = P.x0 + 4; x < W; x += 5) { c.beginPath(); c.moveTo(x, P.y0 - 2); c.lineTo(x + 5 + r() * 3, P.y0 - 10 - r() * 6); c.stroke(); }   // grass bent by the wind
    c.strokeStyle = 'rgba(18,12,24,0.4)'; c.lineWidth = 1.5; for (let i = 0; i < 9; i++) { let x = P.x0 + 20 + r() * (W - P.x0 - 30), y = P.y0 + 6; c.beginPath(); c.moveTo(x, y); while (y < P.foot) { y += 10 + r() * 16; x += (r() - 0.5) * 8; c.lineTo(x, y); } c.stroke(); }   // vertical fissures
    c.strokeStyle = 'rgba(20,14,26,0.35)'; c.lineWidth = 1; for (let i = 0; i < 14; i++) { const y = P.y0 + 10 + r() * (P.foot - P.y0 - 20); c.beginPath(); c.moveTo(P.x0 + 8, y); c.quadraticCurveTo(P.cx, y + (r() - 0.5) * 16, W, y + (r() - 0.5) * 10); c.stroke(); }
    for (let k = 0; k < 6; k++) {
      const y = P.ledgeY[k], x0 = P.x0 + 6 + (k % 2 ? P.dx * 0.25 : 0);
      c.fillStyle = '#1E1826'; c.fillRect(x0, y + 2, W - x0, P.dy * 0.28);   // the shadow under the shelf
      c.fillStyle = '#7A5A62'; c.beginPath(); c.moveTo(x0, y); for (let x = x0; x <= W; x += 10) c.lineTo(x, y - 2 + r() * 2.5); c.lineTo(W, y + 4); c.lineTo(x0, y + 4); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(242,160,120,0.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y - 1); c.lineTo(W, y - 1); c.stroke();   // coral light on each ledge lip
      for (let j = 0; j < 8; j++) {
        const nx = P.x0 + P.dx * (j + 0.55 + (k % 2 ? 0.35 : 0));
        c.fillStyle = 'rgba(236,230,220,0.22)'; for (let q = 0; q < 3; q++) c.fillRect(nx - 4 + r() * 8, y + 5, 1 + r(), P.dy * (0.08 + 0.22 * r()));   // thin guano streaks
        c.fillStyle = '#5A4632'; c.beginPath(); c.ellipse(nx, y - 1, P.cr * 1.25, P.cr * 0.45, 0, 0, TAU); c.fill();   // the nest cup of mud and weed
        c.strokeStyle = '#3A2C22'; c.lineWidth = 1; c.stroke();
      }
    }
    const sg = c.createLinearGradient(0, P.foot - 6, 0, H); sg.addColorStop(0, '#3B3344'); sg.addColorStop(1, '#2A2533'); c.fillStyle = sg;   // the rock shelf at the foot
    c.beginPath(); c.moveTo(0, P.foot + 8); for (let x = 0; x <= W; x += 14) c.lineTo(x, P.foot + 2 + r() * 8); c.lineTo(W, H); c.lineTo(0, H); c.closePath(); c.fill();
    c.fillStyle = 'rgba(242,160,120,0.25)'; for (let x = 0; x < W; x += 14) c.fillRect(x, P.foot + 4 + r() * 4, 8, 1.5);
  },
  sea(c, P, t) {   // sun glitter on the slate sea and foam at the cliff foot (view only)
    const W = P.W, x0 = P.ph ? W * 0.16 : W * 0.14;
    c.save(); c.fillStyle = 'rgba(255,214,170,0.7)';
    for (let i = 0; i < 18; i++) { const y = P.hz + 4 + i * (P.foot - P.hz) / 20, wv = Det.sin(t * 2 + i * 1.7) * 6, ww = 4 + (i % 5) * 3 + Math.abs(Det.sin(t * 3 + i)) * 6; if (y > P.foot) break; c.globalAlpha = 0.25 + 0.4 * Math.abs(Det.sin(t * 1.3 + i * 2.1)); c.fillRect(x0 + wv - ww / 2 + (i - 9) * 2, y, ww, 1.5); }
    c.globalAlpha = 0.5; c.strokeStyle = '#E8E2DA'; c.lineWidth = 1.5;
    for (let k = 0; k < 2; k++) { c.beginPath(); for (let x = 0; x <= W; x += 12) { const y = P.foot + 3 + k * 5 + Det.sin(x * 0.05 + t * (1.5 + k)) * 2; if (x) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); }
    c.restore();
  },
  chick(c, x, y, r, pose, t, id) {   // a kittiwake chick in grey-white down: tucked low in the cup, or standing and tottering at the lip
    c.save(); c.translate(x, y);
    if (pose === 'stand') {
      const wob = Det.sin(t * 7 + id) * 0.28; c.translate(0, -r * 0.5); c.rotate(wob);
      c.fillStyle = '#F2EEE8'; c.beginPath(); c.ellipse(0, 0, r * 0.82, r * 1.05, 0, 0, TAU); c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#2B2530'; c.stroke();
      const fl = Det.sin(t * 16 + id) * 0.5; c.fillStyle = '#C9C3C2'; for (const sgn of [-1, 1]) { c.save(); c.translate(sgn * r * 0.7, -r * 0.1); c.rotate(sgn * (0.6 + fl)); c.beginPath(); c.ellipse(0, 0, r * 0.18, r * 0.45, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
      c.fillStyle = '#F7F4EF'; c.beginPath(); c.arc(0, -r * 1.05, r * 0.55, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#1E1A22'; c.beginPath(); c.arc(r * 0.18, -r * 1.12, r * 0.1, 0, TAU); c.fill(); c.fillStyle = '#3A3438'; c.beginPath(); c.moveTo(r * 0.45, -r * 1.05); c.lineTo(r * 0.8, -r * 0.98); c.lineTo(r * 0.45, -r * 0.92); c.fill();
      c.strokeStyle = 'rgba(251,227,200,0.85)'; c.lineWidth = 1.5; for (const sg of [-1, 1]) { c.beginPath(); c.arc(0, -r * 0.2, r * 1.35, sg > 0 ? -0.5 : Math.PI - 0.5, sg > 0 ? 0.3 : Math.PI + 0.3); c.stroke(); }   // motion arcs: the totter reads without colour
      c.strokeStyle = '#2B2530'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-r * 0.25, r * 1.0); c.lineTo(-r * 0.3, r * 1.35); c.moveTo(r * 0.25, r * 1.0); c.lineTo(r * 0.3, r * 1.35); c.stroke();
    } else {
      c.fillStyle = '#DAD5D1'; c.beginPath(); c.ellipse(0, -r * 0.15, r * 0.95, r * 0.6, 0, Math.PI, 0); c.fill(); c.lineWidth = 1.1; c.strokeStyle = '#2B2530'; c.stroke();
      const peek = pose === 'peek'; c.fillStyle = '#E8E4DF'; c.beginPath(); c.arc(r * 0.35, -r * (peek ? 0.85 : 0.55), r * 0.38, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#1E1A22'; c.beginPath(); c.arc(r * 0.48, -r * (peek ? 0.92 : 0.6), r * 0.08, 0, TAU); c.fill();
    }
    c.restore();
  },
  adult(c, x, y, r) {   // a kittiwake parent standing at the nest: white head and breast, grey wing, black wingtips, short dark legs
    c.save(); c.translate(x, y); c.lineWidth = 1; c.strokeStyle = 'rgba(30,24,36,0.8)';
    c.beginPath(); c.moveTo(-r * 0.12, 0); c.lineTo(-r * 0.12, -r * 0.45); c.moveTo(r * 0.14, 0); c.lineTo(r * 0.14, -r * 0.45); c.stroke();
    c.fillStyle = '#F4F2EE'; c.beginPath(); c.ellipse(r * 0.05, -r * 1.1, r * 0.55, r * 0.72, -0.2, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#A3AAB4'; c.beginPath(); c.ellipse(-r * 0.18, -r * 1.05, r * 0.42, r * 0.62, -0.35, 0, TAU); c.fill();
    c.fillStyle = '#1C1A20'; c.beginPath(); c.moveTo(-r * 0.45, -r * 0.62); c.lineTo(-r * 0.9, -r * 0.2); c.lineTo(-r * 0.3, -r * 0.5); c.closePath(); c.fill();
    c.fillStyle = '#F7F5F1'; c.beginPath(); c.arc(r * 0.28, -r * 1.85, r * 0.34, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#1C1A20'; c.beginPath(); c.arc(r * 0.38, -r * 1.9, r * 0.06, 0, TAU); c.fill();
    c.fillStyle = '#D8C25A'; c.beginPath(); c.moveTo(r * 0.58, -r * 1.86); c.lineTo(r * 0.92, -r * 1.8); c.lineTo(r * 0.58, -r * 1.74); c.closePath(); c.fill();
    c.restore();
  },
  colony(c, P, t) {   // the 48 nests: chicks drawn from the sim's stretch in a season, else from the colony's shares (view only, no draws)
    const s = this.sim.s, v = this.v, live = s.phase === 'dusk' || s.phase === 'dawn';
    let show; if (s.phase === 'dusk' || s.phase === 'dawn') show = s.vis.map(c0 => ({ alive: c0.alive, aff: c0.aff, ex: c0.ex, g: c0.g }));
    else {   // the colony's genotype shares, laid out by a fixed nest order so the cliff fills and empties as q moves
      const N = s.N, nAff = Math.round(48 * (s.h ? (s.c[1] + s.c[2]) / N : s.c[2] / N)), nC = Math.round(48 * s.c[1] / N), nA = Math.round(48 * s.c[2] / N);
      const ord = this.order || (this.order = Array.from({ length: 48 }, (_, i) => i).sort((a, b) => (this.hash('n' + a) % 997) - (this.hash('n' + b) % 997)));
      show = new Array(48); ord.forEach((i, k) => { const g = k < nA ? 2 : k < nA + nC ? 1 : 0; show[i] = { alive: true, aff: k < nAff, ex: k < nAff && ((t * 0.7 + i * 0.37) % 2) < 1.1, g }; });
    }
    for (let i = 0; i < 48; i++) {
      const q = show[i]; if (!q) continue; const p = this.nestXY(i), x = p[0], y = p[1] + P.cr * 0.55;
      if (this.hash('a' + i) % 4 === 0) this.adult(c, x - P.cr * 1.25, y - P.cr * 0.1, P.cr * 0.95);
      if (!q.alive) continue;
      const diving = v.dive && v.dive.i === i && v.dive.res === 'catch';
      if (diving) continue;
      const peek = !q.aff && ((t * 0.5 + (this.hash('p' + i) % 100) / 13) % 7) < 0.6;   // steady chicks lift their heads now and then: a lure, not a target
      this.chick(c, x + (q.aff && q.ex ? P.cr * 0.35 : 0), y + (q.aff && q.ex ? P.cr * 0.15 : -P.cr * 0.1), P.cr, q.aff && q.ex ? 'stand' : peek ? 'peek' : 'tuck', t, i);
      if (s.lens && typeof Pal !== 'undefined' && Pal.genotype) Pal.genotype(c, x, y - P.cr * 2.2, Math.max(7, P.cr * 0.75), q.g === 2 ? 1 : 0, q.g >= 1 ? 1 : 0);
    }
    if (live && s.phase === 'dusk' && v.dive && v.dive.res === 'catch') { const g = this.gullXY(); this.chick(c, g[0] + 4, g[1] + 10, P.cr * 0.8, 'tuck', t, v.dive.i); }
  },
  netDraw(c, P) {   // the warden's net: a fine mesh over the ledges with cork floats along its top
    c.save(); c.strokeStyle = 'rgba(232,226,218,0.45)'; c.lineWidth = 1; const x0 = P.x0, y0 = P.y0 + 8, x1 = P.x1 + 6, y1 = P.foot - 4, st = Math.max(12, P.dx * 0.32);
    c.beginPath(); for (let x = x0 - (y1 - y0); x < x1; x += st) { c.moveTo(x, y0); c.lineTo(x + (y1 - y0), y1); c.moveTo(x + (y1 - y0), y0); c.lineTo(x, y1); } c.rect(x0, y0, x1 - x0, y1 - y0); c.clip(); c.stroke(); c.restore();
    c.fillStyle = '#C98A5A'; for (let x = P.x0 + 10; x < P.x1; x += P.dx) { c.beginPath(); c.arc(x, P.y0 + 8, 3.5, 0, TAU); c.fill(); }
    if (typeof Lbl !== 'undefined') Lbl.put('tp-net', this.content.labels.net, P.cx, P.ledgeY[0] - P.dy * 0.6, { size: 13, c });
  },
  gullNest(c, P) {   // the black-back's own nest on the cliff top: two mottled chicks and their meal pips
    const s = this.sim.s, x = P.gnX, y = P.gnY, r = Math.max(8, P.cr * 0.9);
    c.fillStyle = '#6A5A3A'; c.beginPath(); c.ellipse(x, y, r * 2.4, r * 0.8, 0, 0, TAU); c.fill();
    for (const k of [-1, 1]) { c.fillStyle = '#9C8C78'; c.beginPath(); c.arc(x + k * r * 0.9, y - r * 0.6, r * 0.75, 0, TAU); c.fill(); c.fillStyle = 'rgba(60,48,40,0.55)'; for (let j = 0; j < 4; j++) { c.beginPath(); c.arc(x + k * r * 0.9 + Det.cos(j * 1.7) * r * 0.4, y - r * 0.6 + Det.sin(j * 2.3) * r * 0.35, r * 0.12, 0, TAU); c.fill(); } }
    const q = s.quota; if (q > 0 && !s.auto) { for (let i = 0; i < q; i++) { const px = x - (q - 1) * 5 + i * 10, py = y + r * 1.4; c.beginPath(); c.arc(px, py, 3.2, 0, TAU); if (i < s.meals) { c.fillStyle = '#F4EEE6'; c.fill(); } c.lineWidth = 1.2; c.strokeStyle = '#F4EEE6'; c.stroke(); } }
  },
  gullShape(c, x, y, sz, mode, t) {   // the great black-backed gull as a dark shadow and a heavy bill (D4 RC2): soaring, stooping or carrying
    c.save(); c.translate(x, y); const flap = mode === 'soar' ? Det.sin(t * 2.2) * 0.12 : 0, fold = mode === 'dive' ? 0.55 : 0;
    c.fillStyle = 'rgba(24,20,30,0.92)';
    for (const g of [-1, 1]) { c.beginPath(); c.moveTo(0, -sz * 0.05); c.quadraticCurveTo(g * sz * 0.5 * (1 - fold), -sz * (0.32 + flap), g * sz * (1.15 - fold), -sz * (0.12 - flap)); c.quadraticCurveTo(g * sz * 0.55 * (1 - fold), sz * 0.05, 0, sz * 0.12); c.fill(); }
    c.beginPath(); c.ellipse(0, 0, sz * 0.16, sz * 0.36, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(244,240,234,0.9)'; c.beginPath(); c.arc(0, sz * 0.36, sz * 0.11, 0, TAU); c.fill();
    c.fillStyle = '#E9C24A'; c.beginPath(); c.moveTo(-sz * 0.05, sz * 0.44); c.lineTo(0, sz * 0.62); c.lineTo(sz * 0.05, sz * 0.44); c.closePath(); c.fill();   // the bill, with its red gonys spot
    c.fillStyle = '#C8452E'; c.beginPath(); c.arc(0, sz * 0.54, sz * 0.022, 0, TAU); c.fill();
    c.restore();
  },
  gullDraw(c, P, t) {
    const v = this.v, g = this.gullXY(), sz = Math.max(26, P.u * 0.075), d = v.dive, ta = TP_T.arrive * TP_T.dt;
    const mode = d && d.t < ta ? 'dive' : 'soar';
    if (d && d.t < ta && typeof Fx !== 'undefined' && !Fx.calm) for (let j = 1; j <= 2; j++) { c.save(); c.globalAlpha = 0.2 / j; const f = Math.max(0, d.t / ta - j * 0.15); this.gullShape(c, d.x0 + (d.x1 - d.x0) * f * f, d.y0 + (d.y1 - d.y0) * f * f, sz, 'dive', t); c.restore(); }
    c.save(); if (d && d.t < ta) { c.translate(g[0], g[1]); c.rotate(Math.max(-0.5, Math.min(0.5, (d.x0 - d.x1) / P.W))); c.translate(-g[0], -g[1]); }
    this.gullShape(c, g[0], g[1], sz, mode, t); c.restore();
  },
  extraGulls(c, P, t) {   // the boss: two more black-backs circling once they join (shadow shapes only)
    const s = this.sim.s; if (!s.gulls) return; const sz = Math.max(20, P.u * 0.055);
    for (let k = 0; k < 2; k++) { const a = t * (0.5 + 0.15 * k) + k * 2.6; this.gullShape(c, P.cx + Det.cos(a) * (P.x1 - P.x0) * 0.4, P.top + 30 + k * 16 + Det.sin(a * 1.3) * 8, sz, 'soar', t + k); }
  },
  poolDraw(c, P, t) {   // the tap: a rain-fed rock pool. Rain drips in (mutation), the crack leaks (selection), the level is q
    const s = this.sim.s, v = this.v, L = this.content.labels, x = P.poolX, y = P.poolY, w = P.poolW, h = P.poolH, top = y - h / 2;
    const scale = [0.1, 0.5, 0.8, 0.4][this.level], f = Math.max(0.04, Math.min(1, (v.pool || 0) / scale));   // each level's scale puts its balance mid-pool; L1 opens brimming
    c.save(); c.fillStyle = '#4A4058'; c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, TAU); c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(242,160,120,0.5)'; c.stroke();   // the basin, its rim lit by the low sun
    c.beginPath(); c.ellipse(x, y, w / 2 - 3, h / 2 - 3, 0, 0, TAU); c.clip();
    const wy = top + h * (1 - f), wg = c.createLinearGradient(0, wy, 0, y + h / 2); wg.addColorStop(0, '#7E8FA8'); wg.addColorStop(1, '#3E4D66'); c.fillStyle = wg; c.fillRect(x - w / 2, wy, w, h);
    c.strokeStyle = 'rgba(255,214,170,0.75)'; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k <= 20; k++) { const xx = x - w / 2 + w * k / 20, yy = wy + Det.sin(k * 1.3 + t * 3) * 1.2; if (k) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke();
    if (s.h === 0 && s.lensLv) {   // the carrier pocket under the overhang: copies hidden in carriers, shown only under the lens (an allele read-out)
      const hq = s.q > 0 ? (2 * s.q * (1 - s.q)) / (2 * s.q * (1 - s.q) + 2 * s.q * s.q) : 0, pw = w * 0.42 * Math.min(1, hq + 0.05);
      c.fillStyle = s.lens ? (typeof Pal !== 'undefined' ? Pal.rgba(Pal.a, 0.75) : 'rgba(242,201,76,0.75)') : 'rgba(20,16,26,0.75)';
      c.fillRect(x - w / 2, wy, pw, h);
    }
    c.restore();
    c.fillStyle = '#3B3344'; c.beginPath(); c.moveTo(x - w / 2 - 6, y - 2); c.quadraticCurveTo(x - w * 0.3, top - h * 0.35, x - w * 0.02, top + 4); c.lineTo(x - w * 0.1, top + 8); c.quadraticCurveTo(x - w * 0.32, top - h * 0.1, x - w / 2 + 2, y + 2); c.closePath(); c.fill();   // the overhang
    c.strokeStyle = '#151019'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w / 2 - 4, y - 4); c.lineTo(x + w / 2 + 3, y + 2); c.lineTo(x + w / 2 - 1, y + 8); c.stroke();   // the crack, seaward
    const cx = P.cloudX, cy = P.cloudY, cr = Math.max(8, P.band * 0.11);   // the rain cloud over the pool
    c.fillStyle = 'rgba(78,62,100,0.95)'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(cx - w * 0.26 + k * w * 0.13, cy + (k % 2) * 3, cr * (k % 2 ? 1 : 1.25), 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(240,150,120,0.45)'; c.fillRect(cx - w * 0.3, cy + cr * 0.9, w * 0.6, 1.5);
    c.fillStyle = '#B8C6DA';
    for (const d of v.drops) { if (d.t < 0) continue; const k = d.t / d.d, xx = cx - w * 0.25 + w * 0.5 * d.x, y0 = cy + cr; c.beginPath(); c.ellipse(xx, y0 + (wy - y0) * k, 1.6, 3, 0, 0, TAU); c.fill(); if (k > 0.9 && !d.sp) { d.sp = 1; v.spl.push({ x: xx, y: wy, t: 0, d: 0.3 }); } }
    for (const sp of v.spl) { c.strokeStyle = 'rgba(200,214,232,' + (1 - sp.t / sp.d).toFixed(2) + ')'; c.lineWidth = 1; c.beginPath(); c.arc(sp.x, sp.y, 2 + sp.t * 20, Math.PI, 0); c.stroke(); }
    c.fillStyle = '#9FB0C8';
    for (const l of v.leaks) { const k = l.t / l.d; for (let j = 0; j < l.n; j++) { c.beginPath(); c.arc(x + w / 2 + 4 + k * 14 + j * 3, y + 4 + k * k * 30 + j * 4, 1.8, 0, TAU); c.fill(); } }
    if (s.drum && s.level === 3) { c.strokeStyle = 'rgba(176,96,64,0.8)'; c.lineWidth = 2; c.setLineDash([3, 4]); c.lineDashOffset = -t * 20; c.beginPath(); c.moveTo(P.drumX - P.drumR, P.drumY); c.quadraticCurveTo((P.drumX + x) / 2, P.drumY + 14, x + w / 2 - 2, y); c.stroke(); c.setLineDash([]); }   // the drum's trickle into the pool
    if (typeof Lbl === 'undefined') return;
    Lbl.put('tp-xn', L.xn, cx + w * 0.36, cy, { size: 12, c, align: 'left' });
    Lbl.put('tp-pool', s.lens && s.h === 0 ? L.hidden : L.pool, x + w / 2 + 10, y - 6, { size: 12, c, align: 'left' });
    Lbl.put('tp-leak', L.leak, x + w / 2 + 10, y + 14, { size: 12, c, align: 'left' });
  },
  drumDraw(c, P, t) {   // the rusty drum on the shore rocks (boss); shut, it sits capped and dry
    const s = this.sim.s, x = P.drumX, y = P.drumY, r = P.drumR;
    c.save(); c.translate(x, y); c.rotate(-0.25);
    c.fillStyle = s.drum ? '#8A4A34' : '#6A5048'; c.fillRect(-r, -r * 0.7, r * 2, r * 1.4); c.strokeStyle = '#2A1A16'; c.lineWidth = 1.5; c.strokeRect(-r, -r * 0.7, r * 2, r * 1.4);
    c.fillStyle = 'rgba(60,30,20,0.6)'; for (const k of [-0.5, 0, 0.5]) c.fillRect(-r, k * r - 1.5, r * 2, 3);
    c.fillStyle = s.drum ? '#B0603F' : '#9A8A80'; c.beginPath(); c.ellipse(-r, 0, r * 0.25, r * 0.7, 0, 0, TAU); c.fill(); c.stroke();
    if (s.drum) { const k = (t * 1.5) % 1; c.fillStyle = 'rgba(176,96,64,0.85)'; c.beginPath(); c.arc(-r - 4 - k * 8, r * 0.2 + k * k * 12, 2, 0, TAU); c.fill(); }
    else { c.fillStyle = '#2A1A16'; c.fillRect(-r - 3, -4, 6, 8); }
    c.restore();
    if (s.drum && s.gen >= 20 && typeof Fx !== 'undefined' && !Fx.calm && (t % 3) < 0.15) Fx.ring(x, y, r * 1.6, { ms: 400 });   // a late glint, after the hint
    if (typeof Lbl !== 'undefined' && (!s.drum || s.gen >= 15)) Lbl.put('tp-drum', this.content.labels.drum, x, y + r + 12, { size: 12, c });
  },

  /* ---------- the live strip (notes() is the LiveGraph data provider) ---------- */
  notes() {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    const D = this.content.data, stats = [], row = (d, vars) => stats.push([d[0], Txt.f(d[1], vars), d[2] ? Txt.f(d[2], vars) : '']);
    row(D.gen, { g: s.gen }); row(D.q, { q: s.q.toFixed(3) }); if (s.seasons.length) row(D.s, { s: Math.round(100 * s.sYou) });
    if (s.quota) row(D.fed, { m: s.meals, need: s.quota });
    if (this.level === 3) { row(D.load, { l: this.loadNow().toFixed(1) }); return { stats, charts: [this.loadSpec(), this.qSpec(true)] }; }
    return { stats, charts: [this.qSpec(false), this.cpSpec()] };
  },
  gens() { return this.level === 0 ? 30 : this.level === 1 ? 40 : this.level === 2 ? 60 : 30; },
  qSpec(second) {   // the a share against generation: realised solid; the expected path dashed only after the ask is answered
    const s = this.sim.s, D = this.content.data, id = ['a1', 'b1', 'c1', 't1'][this.level], shown = s.hits[id] !== undefined || s.whatif;
    const hi = this.level === 0 ? 0.25 : this.level === 1 ? 0.5 : this.level === 2 ? 0.8 : 0.4;
    const sp = { type: 'trace', title: D.titles.q, x: { lo: 0, hi: Math.max(this.gens(), s.gen), label: D.ax.gen }, y: { lo: 0, hi, label: D.ax.q }, frame: 'designed',
      series: [{ d: s.hist.map(r => [r.g, r.q]), ink: 'a', label: D.lines.real }], ghost: shown ? [{ d: s.hist.map(r => [r.g, r.qE]), label: D.lines.exp }] : [] };
    if (second) sp.fold = false;
    return sp;
  },
  cpSpec() {   // copies dripped in against copies removed, per generation: equal at balance
    const s = this.sim.s, D = this.content.data, H = s.hist.slice(1);
    return { type: 'trace', title: D.titles.cp, fold: false, x: { lo: 0, hi: Math.max(this.gens(), s.gen), label: D.ax.gen }, y: { lo: 0, hi: Math.round(8 * s.N * TP_LV[this.level].mu / 10) * 10, label: D.ax.cp }, frame: 'designed',
      series: [{ d: H.map(r => [r.g, r.m]), ink: 'mut', label: D.lines.drip }, { d: H.map(r => [r.g, r.k]), ink: 'sel', label: D.lines.drain }] };
  },
  loadSpec() {   // the boss: chicks lost per 1,000 each generation; the drip line and the keeper's goal only after the ask
    const s = this.sim.s, D = this.content.data, H = s.hist.slice(1), shown = s.hits.t1 !== undefined || s.whatif;
    const ghost = shown ? [{ d: H.map(r => [r.g, r.LE]), label: D.lines.exp }, { d: H.map(r => [r.g, 1000 * r.mu / (1 + r.mu)]), label: D.lines.line }] : [];
    return { type: 'trace', title: D.titles.load, x: { lo: 0, hi: 30, label: D.ax.gen }, y: { lo: 0, hi: 60, label: D.ax.l }, frame: 'designed',
      series: [{ d: H.map(r => [r.g, r.L]), ink: 'sel', label: D.lines.real }], ghost, target: shown ? { lo: 0, hi: 600 * s.mt } : null };
  },
  cardSpec() { return this.level === 3 ? this.loadSpec() : this.qSpec(false); }
};
V2.push(CH_TAP_V2);

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.tap = TP_TEXT.take;
  MODEL.tap = 'A gull dives on unsteady kittiwake chicks while mutation drips the harmful allele back in: dominant, then recessive, then relaxed selection, then the load.';
  RECALL.tap = { q: 'Gulls start hunting twice as hard. At the new balance, what happens to the share of chicks lost to the allele?', opts: [['same', 'About the same'], ['half', 'It halves'], ['zero', 'It falls to zero']], ans: 'same', why: 'The allele settles lower, but each copy is still removed once. The load matches the mutation rate, whatever the hunting.' };
  BRIDGE.tap = 'In the Black Country selection swept an allele through. Here a steady drip of mutation pushes back.';
}
