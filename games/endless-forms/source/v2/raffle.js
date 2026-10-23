/* ================= v2/raffle.js: The Raffle (id 'raffle'), the Wave 2 rebuild of a favourite =================
   D1 §3.5, D5 §4 item 9, D6 (21 Oct addendum: own world, opening card; 22 Oct decisions 9 and 10: simple, real biology).
   A sunny cow pasture: you are a male yellow dung fly (Scathophaga stercoraria) on a cowpat (role: a behaving animal).
   The main picture is the female's abdomen under a hand lens: your sperm pass into her genital chamber and up the ducts to her
   three spermathecae, where they mix with (or flush out) the stored sperm of earlier males; each egg then takes one stored
   sperm as it passes the duct openings and is laid on the dung. The verb: HOLD to mate (pass sperm), let go to stop.
   Three levels, one idea each: the fair raffle (rival sperm already stored; one supply for six females); the loaded raffle
   (dung fly sperm displacement and the best mating time, a marginal-value tangent); and a boss where her storage sets which
   sperm count (cryptic female choice), which inverts the unit's lesson. One prediction (L1: her eggs before she lays).
   Headless sim (R(), Det only); stars read the expectation; juice from Sim.run's events only. Reuses ch3.js optimum(). */

const RF_E = 20, RF_X = 20, RF_B = 100;   // eggs per female, one male's ejaculate, your supply (all designed; a unit stands for many sperm)
// timers (s); rate: units a second while held (rateU in untimed mode); mins: copula minutes a second of holding (×N)
const RF_T = { arrive: 0.75, grace: 0.45, graceM: 0.3, egg: 0.11, leave: 0.6, search: 1.6, pm: 3.2, end: 1.5, dry: 0.9, rate: 14, rateU: 6, delay: 0.25, mins: 10, minsU: 5, cap: 120 };
const RF_L1 = [0, 40, 20, 0];   // rival units for four of females 1, 2, 3, 5, 6 (shuffled by seed); female 4 holds 100 (five rivals), female 5 or 6 holds 60, so a call is always due
// L2 displacement curve share(t) = a(1 − e^(−kt)): a and k fitted so share(36 min) = 0.80 (Parker 1970) and the tangent from
// −156.5 min (search and guarding, Parker 1978) touches at 41.4 min (Parker and Stuart 1976); tests/oracle_raffle.js re-derives both
const RF_D = { k: 0.0627036, a: 0.8934849, T: 156.5, Tpm: 40, n: 40, pocket: 4 };
const RF_L3 = [[20, 0.05, 1], [60, 1, 0.05], [40, 1, 1], [20, 1, 1], [60, 0.5, 1]];   // [rival units, share of yours she stores, share of rivals' she stores]; shown on her card
const RF_ASK = { p1: { kind: 'y', lo: 0, hi: 20, tol: 2, step: 0.5 } };
const RF_LV = [{ n: 6, levers: ['later', 'many'] }, { n: 6, dung: true, levers: ['scarce', 'quick'] }, { n: 5, her: true, levers: ['fair', 'choosy'] }];
// the world's paints (D6 addendum 7): meadow green, warm cowpat brown, and the lens: pale field, tissue pink, dark sclerotised stores
const RF_C = { sky: '#CFE4EA', sky2: '#EEF2DA', hill: '#9DBB6A', hedge: '#4F6E31', grass: '#7FA350', grass2: '#6A9142', pat: '#6B4A2E', crust: '#86603A', patD: '#4A321D',
  brass: '#C99A2E', brassL: '#EED38A', brassD: '#7E5C17', red: '#B23A2E', cream: '#F4E8C8', ink: '#1E1810', field: '#FBF6EA', body: '#B7AE8C', bodyD: '#6F684E',
  tissue: '#F1CDBE', tissueD: '#C98F7C', duct: '#D69E89', store: '#3B2414', storeIn: '#EBCB8E', ovary: '#F6EEDB',
  you: '#FBF3DC', youS: '#A3322A', halo: '#F3D27A', riv1: '#5A3B22', riv2: '#9DAE86', dot: '#2E3A22', egg: '#F2EBD6' };

const RF_TEXT = {
  intro: {
    game: 'You are a male yellow dung fly on a sunny cowpat. Females arrive one at a time, and your sperm must last them all.',
    biology: 'A female stores sperm from several males in her spermathecae. Each egg is fertilised by one stored sperm as it passes, so sperm compete.',
    how: 'Hold anywhere to mate and pass sperm into her stores; let go to stop. Then watch her eggs take their fathers.'
  },
  firstWords: 'Hold to mate: your sperm flow into her stores. Let go to stop. Each egg then takes one stored sperm.',
  hud: {
    pourV: 'A virgin: her stores are empty. Hold to mate, let go to stop.',
    pourR: 'Rivals left {r} sperm units in her stores. Hold to mate.',
    mate: 'Hold to mate: your sperm flush out his. Win the most eggs per hour.',
    copula: 'Mating for {m} minutes. Let go to leave her and search.',
    pour4: 'She stores {y}% of your sperm and {z}% of rivals’. Hold to mate.',
    dry: 'Your supply is empty. Her eggs go to the rivals.',
    draw: 'Her eggs pass the stores, each taking one sperm. Tap to hurry.',
    search: 'You guard her while she lays, then search: {T} minutes.',
    pm: 'Best morning mating: about 41 minutes. Afternoon searches take only 40.',
    p1: 'Before she lays: how many of her 20 eggs will be yours?',
    auto: 'What if? The best plan mates, with one thing changed.',
    over: 'The level is done.'
  },
  whispers: {
    jackpot: 'Every egg is yours!', dry: 'Your supply is empty!', drag: 'Drag the marker first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No call this time.',
    flushed: 'Some flushed sperm were your own.', pocket: 'She is not storing most of yours.', favour: 'She stores few rival sperm.', hold: 'Hold longer to pass more.', ff: 'Faster.'
  },
  labels: {
    yours: 'yours {n}', rivals: 'rivals {n}', supply: 'your supply', pocket: 'not stored', reach: 'out of reach', virgin: 'virgin', mins: '{m} min',
    search: 'search {T} min', eggsAx: 'eggs', morning: 'morning', afternoon: 'afternoon', pour: 'Mate', stop: 'Stop', done: 'Done', mate: 'Mate',
    leave: 'Leave', faster: 'Faster', rate: '{r} eggs/h', xN: '×600', fitted: '≈ fitted curve', lock: 'Lock in', jackpot: 'All yours!', pm: 'Afternoon',
    tEggs: 'Eggs won', tUnits: 'Sperm passed', tShare: 'Your share', tLaid: 'Eggs per female', stores: 'spermathecae', ovary: 'ovary', lens: 'her abdomen',
    eqFair: 'share = yours÷all', eqHer: 'stored yours÷all', eqNum: '{a}÷{t} = {p}%', eqDung: 'your share {p}%', bestT: 'best ≈ {t} min',
    female: 'female', units: 'units', minutes: 'minutes', share: 'share', you: 'you', best: 'best plan', expected: 'expected', tangent: 'search line',
    searchM: 'search', sSupply: 'Supply left', sEggs: 'Eggs so far', sExp: 'Expected eggs', sRate: 'Eggs per hour', sMins: 'Last mating', sBest: 'Best plan'
  },
  panels: [],
  interesting: {
    virgins: 'You spent {v} units on virgins. With no rival sperm stored, a single unit wins all her eggs.',
    dry: 'Your supply ran out before the last female, so her eggs all went to the rivals.',
    crowd: 'You passed {c} units to the most crowded female. There each extra unit bought only a sliver of her eggs.',
    short: 'Your morning matings averaged {m} minutes. Leaving early wastes the long search it took to find her.',
    long: 'Your morning matings averaged {m} minutes. Late minutes mostly flushed out your own sperm.',
    same: 'Your morning matings all lasted about {m} minutes. Varying them maps the curve better.',
    pocket: 'You passed {u} units to a female who stored few of them. Her storage, not your supply, set your share.',
    favoured: 'One female stored few of the rivals’ sperm. There a modest mating won most of her eggs.'
  },
  levers: { later: 'Males follow', many: 'Triple rivals', scarce: 'Scarce females', quick: 'Quick search', fair: 'She stores all', choosy: 'Very choosy' },
  whatifBody: {
    later: 'If a male may follow any female, half the time, each virgin gets {v} units, not 1. Rivals to come make virgins worth sperm.',
    many: 'With three times the rivals, the most crowded female got {c} units and the least crowded {l}. Crowded stores pay back less.',
    scarce: 'When females are scarce and searching takes 400 minutes, the best mating lasts about {t} minutes. Each female is worth more time.',
    quick: 'When the next female is 20 minutes away, the best mating lasts about {t} minutes. Cheap searching makes leaving sooner pay.',
    fair: 'If she stored every sperm, the best plan would follow the rival counts alone and win {e} eggs.',
    choosy: 'If every female stored one of your sperm in ten, the best plan would win {e} eggs.'
  },
  take: 'Paternity is a raffle among stored sperm, but the raffle may be loaded, and the store is hers.',
  body: 'In a fair raffle your share is your sperm ÷ all stored sperm. Dung flies are a loaded raffle: the last male flushes out most rival sperm. The best mating time is set by the search. When she controls storage, the best plan follows her. You won {e} expected eggs; the best plan won {b}.',
  law: { title: 'The sperm raffle' },
  boss: { inverts: 'Until now more sperm meant more eggs. Here her storage sets which sperm count.' },
  stars: {
    discover: 'Win nearly the best plan’s eggs, or mate near the best time.',
    predict: 'Call how many of her eggs will be yours.',
    transfer: 'Mate near the new best time in the busy afternoon.'
  },
  levelStars: [
    { discover: 'Win within one egg of the best plan’s expected eggs.', predict: 'Call her eggs within two of the expected number.' },
    { discover: 'Average within six minutes of the best mating time all morning.', transfer: 'Mate near the new best time in the busy afternoon.' },
    { discover: 'Win 97% of the best plan’s eggs, following what each female stores.' }
  ],
  levelTake: [
    'Your share is your sperm ÷ all stored sperm. With no rival sperm stored, one unit wins a virgin’s eggs.',
    'Dung flies are a loaded raffle. The best mating time is where a line from the search touches the curve.'
  ],
  levelBody: [
    'You won {e} expected eggs; the best plan won {b}. It gave each virgin 1 unit and most to females with a few rivals. The most crowded got less. That fall is the model’s prediction; in real animals it is weakly supported.',
    'Your morning matings averaged {m} minutes; the best was about 41, and real males mate about 36. With a 40-minute search the best fell to about 26. Your last two afternoon matings averaged {a}.'
  ],
  captions: {
    liveIn: '{s} units passed. Supply {l}.', liveLaid: 'She laid 20 eggs: {m} are yours.',
    liveMin: 'Mating {m} minutes. Your share {p} percent.', liveAsk: 'Prediction open. Press P, then arrows and Enter.', livePocket: 'She stored {k} of your {n} units.',
    mSupply: 'Units you can still pass this season.', mEggs: 'Eggs fertilised by your sperm.', mExp: 'Expected eggs from your matings so far.', mRate: 'Expected eggs per hour of mating and searching.',
    mBest: 'Expected eggs of the best plan, shown after the level.'
  },
  model: [
    { level: 0, simulated: 'Six females, each already storing 0 to 5 rivals’ ejaculates of 20 units. Each of her 20 eggs is fertilised by one stored sperm drawn at random. Your expected share is your units ÷ all units.', simplification: 'A fair raffle: sperm mix fully and each has the same chance. A unit stands for many sperm. Rivals are fixed, so this is one male’s best plan, not an evolutionarily stable one. Dung flies are not a fair raffle; see level 2.', params: [{ name: 'eggs per female', value: 20, tag: 'designed' }, { name: 'a rival’s ejaculate', value: '20 units', tag: 'designed' }, { name: 'your supply', value: '100 units', tag: 'designed' }], cannot: 'Sperm-limited females, sperm that differ in quality, or a supply that refills.', nature: 'Parker’s raffle models ask how a male should share a limited supply (Parker 1990). Males of many species spend more when rivals are present. Spending less when a female is very crowded is predicted but weakly supported (Kelly and Jennions 2011).', contested: false, refs: ['parker1970', 'parker1990', 'kj2011'] },
    { level: 1, simulated: 'Each female arrives storing an earlier male’s sperm. While you mate, your sperm displace stored sperm at random, yours included. Your share rises ever more slowly. After mating you guard her while she lays, then search.', simplification: 'The curve is fitted to two published numbers (≈). A 36-minute mating wins about 80% of eggs. With 156 minutes of guarding and searching, the best time is near 41. One earlier sperm in nine stays out of reach (designed).', params: [{ name: 'search and guarding', value: '156 min', tag: 'realistic', real: 'about 156 min (Parker 1978)' }, { name: 'last male’s share at 36 min', value: '80%', tag: 'realistic', real: 'about 80% (Parker 1970)' }, { name: 'afternoon search', value: '40 min', tag: 'designed' }, { name: 'minutes per second held', value: 10, tag: 'xN', real: 'one minute a minute' }], cannot: 'Takeovers by bigger males, or females that resist mating.', nature: 'Females store sperm in three spermathecae (Ward 1993). Males mate for about 36 minutes; Parker’s model predicted about 41 (Parker 1978; Parker and Stuart 1976). Random displacement fits his sperm data (Parker and Simmons 1991).', contested: false, refs: ['parker1970b', 'ps1976', 'parker1978', 'psim1991', 'ward1993', 'sps1999', 'charnov1976'] },
    { level: 2, simulated: 'Each female moves a share of every male’s sperm into her spermathecae. Sperm she does not store stay behind and are lost. Her card shows both shares.', simplification: 'Her bias is a fixed share per female (designed). In dung flies, female control works through how sperm are spread among her three spermathecae.', params: [{ name: 'share of your sperm stored', value: '5% to 100%', tag: 'designed' }, { name: 'share of rivals’ sperm stored', value: '5% to 100%', tag: 'designed' }, { name: 'your supply', value: '100 units', tag: 'designed' }], cannot: 'Why a female might favour some males, or what it costs her.', nature: 'Female yellow dung flies influence how sperm are stored and used (Ward 1993, 2000; Hellriegel and Ward 1998). Female feral fowl eject the sperm of low-ranking males (Pizzari and Birkhead 2000). How common such cryptic female choice is remains debated (Birkhead 1998).', contested: true, refs: ['ward1993', 'ward2000', 'hw1998', 'hb2000', 'pb2000', 'eberhard1996', 'birkhead1998'] }
  ],
  why: {
    real: [
      'Geoff Parker’s work on yellow dung flies in the 1970s founded the study of sperm competition. The last male to mate fertilises about 80% of the eggs (Parker 1970). His raffle models ask how males should spend a limited supply (Parker 1990).',
      'A female dung fly stores sperm in three small, hard spermathecae. Eggs are fertilised as they pass the ducts on the way to being laid (Ward 1993). Many males spend more sperm when rivals are likely (Kelly and Jennions 2011).',
      'Female yellow dung flies influence how sperm are stored and used (Ward 1993, 2000). Female feral fowl eject the sperm of low-ranking males (Pizzari and Birkhead 2000). How common such female control is remains debated (Birkhead 1998).'
    ],
    maths: [
      'Fair raffle: your share is s ÷ (s + R) for your s units against R. One more unit gains R ÷ (s + R)². The best plan equalises that gain across females, so s = √(R/λ) − R, a hump in R. A virgin takes one unit.',
      'Precedence: your share after t minutes is a(1 − e^(−kt)). Eggs per minute are E·share ÷ (T + t). The best t is where a line from −T touches the curve.',
      'Her control: she stores a share y of your sperm and z of the rivals’. Then your share is y·s ÷ (y·s + z·R), so R acts like z·R ÷ y.'
    ]
  }
};

/* ---------- the model's maths: pure, Det-safe (+ − × ÷ √ and Det.exp only), shared by the sim, the stars, the bots and the oracle ---------- */
const RF = {
  share(F, s) {   // expected share of her eggs for s units: a fair raffle, a later male with chance q (What if? only), her storage (y yours, z rivals')
    if (!(s > 0)) return 0; const K = (F.y == null ? 1 : F.y) * s, Rr = (F.z == null ? 1 : F.z) * F.R, q = F.q || 0;
    return (1 - q) * K / (K + Rr) + (q ? q * K / (K + Rr + RF_X) : 0);
  },
  real(F, s) { if (!(s > 0)) return 0; const K = (F.y == null ? 1 : F.y) * s, Rr = (F.z == null ? 1 : F.z) * F.R; return K / (K + Rr); },   // the realised store
  marg(F, s) {   // eggs gained by one more unit
    const y = F.y == null ? 1 : F.y, Rr = (F.z == null ? 1 : F.z) * F.R, q = F.q || 0, a = y * s + Rr, b = a + RF_X;
    return RF_E * ((1 - q) * y * Rr / (a * a) + (q ? q * y * (Rr + RF_X) / (b * b) : 0));
  },
  at(F, lam, cap) {   // the spend where the marginal gain falls to λ (at least 1 unit)
    if (cap <= 1 || this.marg(F, 1) <= lam) return 1; if (this.marg(F, cap) >= lam) return cap;
    let lo = 1, hi = cap; for (let k = 0; k < 48; k++) { const m = (lo + hi) / 2; if (this.marg(F, m) > lam) lo = m; else hi = m; } return (lo + hi) / 2;
  },
  plan(fs, B) {   // Lagrange (legacy optimum(), generalised): spends for fs summing to B
    if (!fs.length) return []; if (B <= 0) return fs.map(() => 0);
    const tot = lam => { let t = 0; for (const F of fs) t += this.at(F, lam, B); return t; };
    let lo = 1e-9, hi = 1e3; if (tot(lo) <= B) return fs.map(F => this.at(F, lo, B));
    for (let k = 0; k < 90; k++) { const m = Math.sqrt(lo * hi); if (tot(m) > B) lo = m; else hi = m; }
    return fs.map(F => this.at(F, hi, B));
  },
  eggs(fs, ss) { let e = 0; fs.forEach((F, i) => { e += RF_E * this.share(F, ss[i]); }); return e; },
  best(fs) { return this.plan(fs, RF_B); },
  dshare(t) { return t > 0 ? RF_D.a * (1 - Det.exp(-RF_D.k * t)) : 0; },   // L2: your share of her store after t minutes
  tstar(T) {   // L2: the mating time where the line from (−T, 0) touches the curve (marginal value theorem)
    const k = RF_D.k; let lo = 0.5, hi = 300;
    for (let i = 0; i < 60; i++) { const t = (lo + hi) / 2, e = Det.exp(-k * t), f = k * e * (T + t) - (1 - e); if (f > 0) lo = t; else hi = t; }
    return (lo + hi) / 2;
  }
};

const CH_RAFFLE_V2 = {
  id: 'raffle', v2: true, role: 'animal', place: 'meadow', accent: '#A8821F',   // brass: the chapter's chrome tint (D6 decision 7)
  plan: ['The Raffle', 'Sperm competition'],
  intro: { goal: 'Share one season’s sperm among females; win the most eggs.' },
  content: RF_TEXT,
  P: {
    E: { v: RF_E, tag: 'designed', min: 10, max: 40, label: 'eggs per female' },
    B: { v: RF_B, tag: 'designed', min: 50, max: 200, label: 'your supply' },
    X: { v: RF_X, tag: 'designed', min: 10, max: 40, label: 'a rival’s ejaculate' },
    T: { v: RF_D.T, tag: 'realistic', min: 20, max: 400, real: 'about 156 min (Parker 1978)', label: 'search and guarding' },
    mins: { v: RF_T.mins, tag: 'xN', min: 2, max: 20, real: 'one minute a minute', label: 'mating minutes a second' }
  },
  levels: [
    { name: 'The fair raffle', adds: 'rival sperm already stored', codes: ['E4'], minutes: 1.5 },
    { name: 'The loaded raffle', adds: 'last-male sperm displacement', codes: ['E4'], minutes: 2 },
    { name: 'Her stores', adds: 'her control of which sperm count', codes: ['E4', 'E3'], minutes: 1.5 }
  ],
  keys: { Space: 'hold to mate', ArrowUp: 'one more unit', Enter: 'done', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why might a virgin get less sperm than a mated female, and when should she get more?', 'In dung flies, who controls paternity: the last male, the female, or both?', 'This model makes every rival equal and every sperm alike. Which missing piece would most change the best plan?'], pool: 'trace' },
  starTraits: [],
  encodings: [   // sperm and eggs: yours cream with a gold halo (and red stripes on eggs); rivals solid umber or dotted sage (luminance and pattern, never hue alone)
    { k: 'yours', rgb: [251, 243, 220], channels: ['luminance', 'pattern'] },
    { k: 'rival', rgb: [90, 59, 34], channels: ['luminance'] },
    { k: 'rival2', rgb: [157, 174, 134], channels: ['pattern', 'luminance'] }
  ],
  // the unit's stars across levels (API_v2 §14.1; D1 G10): Discover in two of the three levels; Predict on L1; Transfer on the afternoon
  unitStars(lv) {
    const has = (i, b) => !!((lv[i] || 0) & b), d = [0, 1, 2].filter(i => has(i, 1)).length;
    return (d >= 2 ? 1 : 0) | (has(0, 2) ? 2 : 0) | (has(1, 4) ? 4 : 0);
  },

  /* ================= headless simulation (API_v2 §9.3): R(), Det only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    reset(level, o) {
      o = o || {};
      if (o.thaw) { this.restore(o.thaw.snap); const s = this.s; s.whatif = o.thaw.lever || null; s.auto = true; s.log = []; s.ask = null; this.lever(s); return; }
      const s = { level, phase: 'arrive', pt: 0, acc: 0, t: 0, i: 0, left: RF_B, unt: false, hold: false, held: 0, ff: 1, fem: [], ask: null, pred: {}, nocall: {}, asks: [], eggI: 0, got: 0, mins: 0, dry: false, whatif: null, auto: false, log: [] };
      if (level === 0) { const r = this.shuffle(RF_L1.slice()), k = R() < 0.5 ? 4 : 5, a = []; for (let i = 0; i < 6; i++) a.push(i === 3 ? 100 : i === k ? 60 : r.shift()); s.fem = a.map(R0 => ({ R: R0 })); }
      else if (level === 1) { for (let i = 0; i < 6; i++) s.fem.push({ R: RF_D.n, T: i < 3 ? RF_D.T : RF_D.Tpm }); }
      else s.fem = this.shuffle(RF_L3.map(a => a.slice())).map(a => ({ R: a[0], y: a[1], z: a[2] }));
      for (const F of s.fem) { F.s = 0; F.eggs = -1; }
      this.s = s;
    },
    lever(s) {   // What if?: rerun the level from its start with one thing changed; the best plan mates
      const k = s.whatif, L = s.fem;
      if (k === 'later') L.forEach(F => { F.q = 0.5; }); else if (k === 'many') L.forEach(F => { F.R *= 3; });
      else if (k === 'scarce') L.forEach(F => { F.T = 400; }); else if (k === 'quick') L.forEach(F => { F.T = 20; });
      else if (k === 'fair') L.forEach(F => { F.y = 1; F.z = 1; }); else if (k === 'choosy') L.forEach(F => { F.y = 0.1; });
    },
    cur(s) { return s.fem[Math.min(s.i, s.fem.length - 1)]; },
    // ---- passing sperm (L1, L3) and mating minutes (L2) ----
    add(s, F, u, ev) {
      u = Math.min(u, s.left); if (!(u > 0)) return;
      const b = Math.floor(F.s + 1e-9); F.s += u; s.left -= u; if (s.left < 1e-9) s.left = 0;
      const a = Math.floor(F.s + 1e-9); if (a > b) ev.push({ k: 'in', n: a - b, tot: a });
      if (s.left <= 0 && !s.dry) { s.dry = true; s.hold = false; ev.push({ k: 'dry' }); if (s.phase === 'pour') { s.phase = 'close'; s.pt = 0; } }
    },
    minutes(s, dm, ev) { const b = Math.floor(s.mins); s.mins = Math.min(RF_T.cap, s.mins + dm); if (Math.floor(s.mins) > b) ev.push({ k: 'min', m: Math.floor(s.mins) }); },
    pour(s, dt, ev) {
      s.held += dt; if (s.held < RF_T.delay) return;
      if (RF_LV[s.level].dung) this.minutes(s, (s.unt ? RF_T.minsU : RF_T.mins) * dt, ev);
      else this.add(s, this.cur(s), (s.unt ? RF_T.rateU : RF_T.rate) * dt, ev);
    },
    shut(s, ev) {
      const F = this.cur(s), L = RF_LV[s.level]; s.hold = false;
      if (L.dung) { F.t = Math.round(Math.max(1, s.mins) * 10) / 10; F.s = F.t; F.x = RF.dshare(F.t); }
      ev.push({ k: 'shut', i: s.i });
      if (!s.auto && s.level === 0 && this.askHere(s)) { this.openAsk(s, ev, 'p1'); return; }
      this.startDraw(s, ev);
    },
    askHere(s) {   // L1 asks once, from female 4 on, at the first mated female whose answer is neither near-certain nor half, else at the last mated one
      if (s.asks.length || s.i < 3) return false; const F = this.cur(s); if (!(F.R > 0)) return false;
      return this.real1(F) || !s.fem.slice(s.i + 1).some(G => G.R > 0);
    },
    real1(F) { const e = RF_E * RF.share(F, F.s); return e >= 3 && e <= RF_E - 3 && Math.abs(e - RF_E / 2) > RF_ASK.p1.tol; },   // a near-certain answer (one unit against 100), or one a lazy 'half' would hit, counts for nothing
    openAsk(s, ev, id) {
      s.p1i = s.i;
      const A = RF_ASK[id]; s.ask = { id, kind: A.kind, lo: A.lo, hi: A.hi, tol: A.tol, at: s.i }; s.asks.push(id); s.phase = 'ask'; s.pt = 0;
      ev.push({ k: 'ask', id });
    },
    startDraw(s, ev) {
      const F = this.cur(s), sh = RF_LV[s.level].dung ? F.x : RF.real(F, F.s); F.draws = [];
      for (let j = 0; j < RF_E; j++) F.draws.push(R() < sh ? 1 : 0);
      s.eggI = 0; s.acc = 0; s.ff = s.auto ? 3 : 1; s.phase = 'draw'; s.pt = 0; ev.push({ k: 'draw', i: s.i });
    },
    next(s, ev) {
      s.i++; s.mins = 0; s.ff = 1; s.held = 0; s.hold = false; s.pt = 0; s.acc = 0;
      const L = RF_LV[s.level];
      if (L.dung && s.i === 3 && !s.auto) { s.phase = 'pm'; ev.push({ k: 'pm' }); return; }   // the morning's best time, shown plainly; then the busy afternoon
      if (s.i >= s.fem.length) { s.phase = 'end'; return; }
      s.phase = 'arrive'; ev.push({ k: 'arrive', i: s.i });
    },
    autoPour(s, ev) {   // What if?: the best plan with every card visible mates (or mates for the best time) after a short beat
      if (s.pt < 0.35) return; const F = this.cur(s);
      if (RF_LV[s.level].dung) s.mins = RF.tstar(F.T);
      else { const p = RF.plan(s.fem.slice(s.i), s.left)[0] || 0; this.add(s, F, Math.max(Math.min(1, s.left), Math.min(s.left, p)), ev); }
      this.shut(s, ev);
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; s.pt += dt; const L = RF_LV[s.level], F = this.cur(s);
      if (s.phase === 'arrive') { if (s.pt >= RF_T.arrive) { s.phase = 'pour'; s.pt = 0; ev.push({ k: 'ready', i: s.i }); } }
      else if (s.phase === 'pour') {
        if (s.auto) this.autoPour(s, ev);
        else if (s.hold) this.pour(s, dt, ev);
        else if (!L.dung && s.left <= 0 && s.pt >= RF_T.dry) this.shut(s, ev);   // nothing left to pass: she lays without you
      }
      else if (s.phase === 'close') { if (s.pt >= (L.dung ? RF_T.graceM : RF_T.grace)) this.shut(s, ev); }
      else if (s.phase === 'ask') { if (!s.ask) this.startDraw(s, ev); }
      else if (s.phase === 'draw') {
        s.acc += dt * s.ff;
        while (s.acc >= RF_T.egg && s.eggI < RF_E) { s.acc -= RF_T.egg; const j = s.eggI++; ev.push({ k: 'egg', j, m: F.draws[j] }); }
        if (s.eggI >= RF_E && s.acc >= RF_T.egg * 3) {
          let n = 0; for (const d of F.draws) n += d; F.eggs = n; s.got += n; s.acc = 0; s.pt = 0;
          ev.push({ k: 'laid', i: s.i, eggs: n, exp: RF_E * (L.dung ? F.x : RF.share(F, F.s)) });
          if (L.dung) { s.phase = 'search'; ev.push({ k: 'search', T: F.T }); } else s.phase = 'leave';
        }
      }
      else if (s.phase === 'search') { s.acc += dt * s.ff; if (s.acc >= RF_T.search) { s.phase = 'leave'; s.pt = 0; s.acc = 0; } }
      else if (s.phase === 'leave') { if (s.pt >= RF_T.leave) { ev.push({ k: 'leave', i: s.i }); this.next(s, ev); } }
      else if (s.phase === 'pm') { if (s.pt >= RF_T.pm) { s.phase = 'arrive'; s.pt = 0; ev.push({ k: 'arrive', i: s.i }); } }
      else if (s.phase === 'end') { if (s.pt >= RF_T.end) { s.phase = 'over'; ev.push({ k: 'over' }); } }
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      const L = RF_LV[s.level], F = this.cur(s), open = s.phase === 'pour' || s.phase === 'close';
      if (a.k === 'unt') { s.unt = !!a.on; return ev; }
      if (a.k === 'predict') {
        if (s.ask && a.id === s.ask.id) {
          const A = RF_ASK[a.id];
          if (a.v == null) s.nocall[a.id] = 1; else s.pred[a.id] = Math.max(A.lo, Math.min(A.hi, +a.v || 0));
          s.ask = null; ev.push({ k: 'predicted', id: a.id, none: a.v == null });
        }
        return ev;
      }
      if (a.k === 'ff') { if (s.phase === 'draw' || s.phase === 'search') { s.ff = 4; ev.push({ k: 'ff' }); } return ev; }
      if (s.auto || !open) return ev;
      if (a.k === 'hold') {
        if (a.on && !s.hold && (L.dung || s.left > 0)) {
          s.hold = true; s.held = 0; s.phase = 'pour'; s.pt = 0; ev.push({ k: 'press' });
          if (!L.dung && F.s < 1) this.add(s, F, 1, ev);   // a tap passes the smallest ejaculate: one unit, within the frame
        } else if (!a.on && s.hold) { s.hold = false; s.phase = 'close'; s.pt = 0; ev.push({ k: 'release' }); }
      } else if (a.k === 'add') {
        const n = Math.max(1, Math.min(40, +a.n || 1));
        if (L.dung) this.minutes(s, n, ev); else this.add(s, F, n, ev);
        if (s.phase === 'close') s.pt = 0;
      } else if (a.k === 'mate') {
        if (!L.dung && F.s < 1) this.add(s, F, 1, ev); if (L.dung && s.mins < 1) s.mins = 1;
        this.shut(s, ev);
      }
      return ev;
    },
    expect(s, id) {   // what the call is scored against (never the realised draw)
      if (id === 'p1') { const F = s.fem[s.p1i]; return F ? RF_E * RF.share(F, F.s) : null; }
      return null;
    },
    hit(s, id) { const v = s.pred[id], e = this.expect(s, id); return v != null && e != null && Math.abs(v - e) <= RF_ASK[id].tol + 1e-9; },
    expEggs(s) { if (RF_LV[s.level].dung) { let e = 0; for (const F of s.fem) e += RF_E * (F.x || 0); return e; } return RF.eggs(s.fem, s.fem.map(F => F.s)); },
    bestEggs(s) { const L = s.fem; if (RF_LV[s.level].dung) { let e = 0; for (const F of L) e += RF_E * RF.dshare(RF.tstar(F.T)); return e; } return RF.eggs(L, RF.best(L)); },
    bestPlan(s) { return RF_LV[s.level].dung ? s.fem.map(F => RF.tstar(F.T)) : RF.best(s.fem); },
    pmMean(s) { const a = s.fem.slice(4).filter(F => F.t > 0); return a.length === 2 ? (a[0].t + a[1].t) / 2 : null; },
    amMean(s) { const a = s.fem.slice(0, 3).filter(F => F.t > 0); return a.length ? a.reduce((x, F) => x + F.t, 0) / a.length : null; },
    rate(s) { let e = 0, m = 0; for (const F of s.fem) if (F.t > 0 && F.eggs >= 0) { e += RF_E * F.x; m += F.T + F.t; } return m > 0 ? 60 * e / m : 0; },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_RAFFLE_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { eggs: s.got, exp: Math.round(this.expEggs(s) * 10) / 10 }, interesting: s.whatif ? null : this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons rule 6)
      const L = s.fem, n = s.level;
      if (n === 0) { if (L.some(F => F.s <= 0)) return 'dry'; let v = 0; for (const F of L) if (!F.R) v += F.s; if (v >= 10) return 'virgins'; const c = L[3], b = RF.best(L)[3]; if (c.s > b + 15) return 'crowd'; return null; }
      if (n === 1) { const m = L.slice(0, 3).map(F => F.t || 0), mean = (m[0] + m[1] + m[2]) / 3; if (mean < 22) return 'short'; if (mean > 70) return 'long'; if (Math.max(...m) - Math.min(...m) < 4) return 'same'; return null; }
      for (const F of L) if (F.y <= 0.2 && F.s >= 10) return 'pocket';
      if (L.some(F => F.z <= 0.15 && F.s > 0 && F.s <= 24 && RF.share(F, F.s) >= 0.75)) return 'favoured';
      return null;
    },
    iVars(s) {   // the numbers an Interesting result names, from this run
      const L = s.fem, n = s.level; let v = 0, u = 0; const r1 = x => Math.round(x);
      if (n === 0) { for (const F of L) if (!F.R) v += F.s; return { v: r1(v), c: r1(L[3].s) }; }
      if (n === 1) return { m: r1(this.amMean(s) || 0) };
      for (const F of L) if (F.y <= 0.2) u = Math.max(u, F.s); return { u: r1(u) };
    },
    wiVars(s) {   // the What if? card's numbers, from the run that just happened
      const L = s.fem, v = L.filter(F => !F.R), avg = a => a.length ? a.reduce((x, F) => x + F.s, 0) / a.length : 0, sorted = L.slice().sort((a, b) => b.R - a.R);
      return { v: Math.round(avg(v)), c: Math.round(sorted[0].s), l: Math.round(sorted[sorted.length - 1].s), t: Math.round(L[0].t || 0), e: Math.round(this.expEggs(s) * 10) / 10 };
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) { const A = RF_ASK[s.ask.id], m = Math.round((A.hi - A.lo) / A.step); for (let i = 0; i <= m; i++) out.push({ k: 'predict', id: s.ask.id, v: Math.round((A.lo + i * A.step) * 100) / 100 }); return out; }
      if (s.auto || !(s.phase === 'pour' || s.phase === 'close')) return out;
      if (RF_LV[s.level].dung) return [{ k: 'add', n: 5 }, { k: 'add', n: 20 }, { k: 'mate' }];
      return s.left > 0 ? [{ k: 'add', n: 1 }, { k: 'add', n: 5 }, { k: 'add', n: 20 }, { k: 'mate' }] : [{ k: 'mate' }];
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    near(acts, v) { let best = null, bd = 1e9; for (const a of acts) if (a.k === 'predict') { const d = Math.abs(a.v - v); if (d < bd) { bd = d; best = a; } } return best; },
    pourTo(s, want) {   // pass sperm until this female holds `want` units, then stop
      const F = this.cur(s), need = Math.min(s.left, want) - F.s;
      if (need >= 1 && s.left >= 1) return { k: 'add', n: Math.min(40, Math.floor(need)) };
      return { k: 'mate' };
    },
    fairPlan(s) { return RF.plan(s.fem.slice(s.i).map(F => ({ R: F.R })), s.left)[0]; },   // the L1 rule everywhere: a fair raffle, ignoring her storage
    expertPlan(s) { const F = this.cur(s); return RF.plan(s.fem.slice(s.i), s.left + F.s)[0]; },   // full information (her card shows what she stores)
    bots: {
      alwaysA(s, acts) {   // everything early: the biggest matings, the longest copulas, the top of the axis
        if (acts.length && acts[0].k === 'predict') return acts[acts.length - 1];
        if (!acts.length) return null; const S = CH_RAFFLE_V2.sim;
        if (RF_LV[s.level].dung) return s.mins < 100 ? { k: 'add', n: 20 } : { k: 'mate' };
        return S.pourTo(s, 60);
      },
      alwaysB(s, acts) { if (acts.length && acts[0].k === 'predict') return acts[0]; return acts.length ? { k: 'mate' } : null; },   // a single unit, a one-minute mating, the bottom of the axis
      greedy(s, acts) {   // the fair-raffle rule on what it sees; calls the fair-raffle answer; leaves a mating once it holds half her store
        const S = CH_RAFFLE_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') { const F = s.fem[s.p1i]; return S.near(acts, RF_E * F.s / (F.s + F.R)); }
        if (RF_LV[s.level].dung) return RF.dshare(s.mins) < 0.5 ? { k: 'add', n: 5 } : { k: 'mate' };
        return S.pourTo(s, Math.max(1, Math.round(S.fairPlan(s))));
      },
      threshold(s, acts) {   // a fixed rule of thumb: 15 units for a mated female, 2 for a virgin, 30-minute matings; calls the middle
        if (!acts.length) return null; if (acts[0].k === 'predict') { const A = RF_ASK[s.ask.id]; return CH_RAFFLE_V2.sim.near(acts, (A.lo + A.hi) / 2); }
        if (RF_LV[s.level].dung) return s.mins < 30 ? { k: 'add', n: 5 } : { k: 'mate' };
        return CH_RAFFLE_V2.sim.pourTo(s, CH_RAFFLE_V2.sim.cur(s).R ? 15 : 2);
      },
      even(s, acts) {   // an even split, 41-minute matings all day and perfect calls: shows Predict without the unit's Discover
        const S = CH_RAFFLE_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, S.expect(s, s.ask.id));
        if (RF_LV[s.level].dung) return s.mins < 41 ? { k: 'add', n: 5 } : { k: 'mate' };
        return S.pourTo(s, Math.round(RF_B / s.fem.length));
      },
      noChange(s, acts) {   // mates by the fair rule and calls "half her eggs" every time
        const S = CH_RAFFLE_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, RF_E / 2);
        return CH_RAFFLE_V2.sim.bots.greedy(s, acts);
      },
      expert(s, acts) {   // skilled play (oracle only): the expert earns every star the unit offers
        const S = CH_RAFFLE_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, S.expect(s, s.ask.id));
        if (RF_LV[s.level].dung) { const F = S.cur(s), t = Math.round(RF.tstar(F.T)); return s.mins + 5 <= t ? { k: 'add', n: 5 } : s.mins < t ? { k: 'add', n: t - Math.floor(s.mins) } : { k: 'mate' }; }
        return S.pourTo(s, Math.max(1, Math.round(S.expertPlan(s))));
      }
    }
  },

  /* ---- stars: pure functions of the final state, scored against the expectation (API_v2 §9.1; D1 G10). No level offers all three. ---- */
  stars: {
    discover: (s, n) => {
      const S = CH_RAFFLE_V2.sim;
      if (n === 0) return S.expEggs(s) >= S.bestEggs(s) - 1;   // within one egg of the best plan (an even split loses 6.6)
      if (n === 1) { const m = S.amMean(s); return m != null && Math.abs(m - RF.tstar(RF_D.T)) <= 6; }   // the morning near the tangent point, 41.4 min
      return S.expEggs(s) >= 0.97 * S.bestEggs(s);   // her card shows what she stores, so the best plan is what you could see; the fair-raffle rule wins 93%
    },
    predict: (s, n) => { const S = CH_RAFFLE_V2.sim; return n === 0 && S.hit(s, 'p1') && S.real1(s.fem[s.p1i]); },
    transfer: (s, n) => { const S = CH_RAFFLE_V2.sim; if (n !== 1) return false; const m = S.pmMean(s), a = S.amMean(s); return m != null && a != null && a - m >= 6 && Math.abs(m - RF.tstar(RF_D.Tpm)) <= 6; }   // the afternoon: shorter than your mornings, and near the new best time
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–12 expected eggs ×4 · 13–19 the L1 call (scaled to 0–127) · 20–29 the best plan's eggs ×4
  resultBits(s, level) {
    const S = this.sim, A = RF_ASK.p1, v = level === 0 && s.pred.p1 != null ? Math.round((s.pred.p1 - A.lo) / (A.hi - A.lo) * 127) : 0;
    const r = S.result(); return ((r ? r.mask : 0) & 7) | (Math.min(1023, Math.round(S.expEggs(s) * 4)) << 3) | ((v & 127) << 13) | (Math.min(1023, Math.round(S.bestEggs(s) * 4)) << 20);
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {}); this.level = n; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._said = {};
    Sim.start(this, n, o);
    if (!o.thaw && typeof Freezer !== 'undefined') Freezer.put(this.id, 0, this.sim.snapshot());   // What if? reruns the level from here
    const unt = (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt) || (typeof Url !== 'undefined' && Url.untimed);
    if (unt && !o.thaw && !o.replay) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    this.v = { t: 0, tk: [], order: [], fly: [], gone: [], press: null, kPress: false, latch: false, banner: null, sig: '', bgSig: '', eggs: [], eggT: [], lastPour: 0, tube: [], lastIn: 0, flushSaid: false, clock: 0, fi: -1, cap: 0 };
    this.resetEggs(); this.layout(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const s = this.sim.s, name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(1000, ms + 300) }; });
    if (!o.thaw && typeof Ghost !== 'undefined') {   // the hand demonstrates the hold until the first mating
      const G = () => this.geo();
      if (n === 0) Ghost.show({ verb: 'hold', key: ' ', at: () => [G().cx, G().cy], until: () => this.sim.s.fem[0].s > 0 || this.sim.s.i > 0 });
      if (n === 1) Ghost.show({ verb: 'hold', key: ' ', at: () => [G().cx, G().cy], until: () => this.sim.s.mins > 0 || this.sim.s.i > 0 });
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  resetEggs() { this.v.eggs = new Array(RF_E).fill(-1); this.v.eggT = new Array(RF_E).fill(0); this.v.nMine = 0; this.v.nRiv = 0; },
  onResize() { if (this.v) this.layout(); },

  /* ---------- geometry (canvas px), recomputed when the stage changes size ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  geo() {
    const W = Stage.w, H = Stage.h, k = W + 'x' + H + 'x' + this.hudH();
    if (this._g && this._g.k === k) return this._g;
    const top = this.hudH() + 4, cardH = Math.round(Math.min(54, Math.max(42, H * 0.075))), patH = Math.round(Math.min(150, Math.max(96, H * 0.2))), patY = H - patH;
    const avail = patY - (top + cardH) - 22, Rd = Math.round(Math.max(60, Math.min(W * 0.4, avail * 0.45, 230))), cx = Math.round(W * 0.45), cy = Math.round(top + cardH + 16 + Rd);
    const S = Math.max(52, Math.min(120, Rd * 0.6));
    const g = { k, W, H, top, cardH, patY, patH, Rd, cx, cy, S,
      gauge: { x: Math.min(W - 22, cx + Rd + Math.max(34, W * 0.08)), y0: cy - Rd * 0.5, y1: cy + Rd * 0.55, w: Math.max(14, Math.round(Rd * 0.11)) },
      pair: { x: Math.round(Math.max(S * 0.75, W * 0.19)), y: Math.round(patY + patH * 0.42) },
      eggs: { x0: W * 0.43, x1: W * 0.96, y0: patY + patH * 0.36, y1: patY + patH * 0.7, r: Math.max(5, Math.min(9, W * 0.55 / 10 * 0.3)) } };
    // the female's reproductive tract, in the abdomen's own frame (u along the body, tip at −1; v across it, dorsal negative), rotated into the lens
    const th = -0.4, ct = Math.cos(th), st = Math.sin(th), F = (u, v) => [cx + Rd * (u * ct - v * st), cy + Rd * (u * st + v * ct)];   // cosmetic
    g.F = F; g.th = th;
    g.O = F(-0.95, 0.02);                                     // her genital opening (where your sperm enter and her eggs leave)
    g.B = F(-0.68, 0.0); g.Br = [0.2 * Rd, 0.13 * Rd];         // the genital chamber (bursa)
    g.J = F(-0.5, -0.12); g.Fz = F(-0.5, 0.0);                 // the duct openings, and the point on the oviduct where an egg meets a sperm
    g.ov = [F(0.42, 0.06), F(0.15, 0.04), F(-0.25, 0.0), g.Fz];   // the common oviduct, from the ovaries down
    g.ova = [F(0.66, -0.2), F(0.66, 0.3)];                      // the two ovaries
    g.cr = Math.round(0.155 * Rd);
    g.caps = [F(-0.62, -0.36), F(-0.3, -0.47), F(0.04, -0.41)];   // her three spermathecae: a doublet sharing a duct, and a singlet
    g.split = F(-0.5, -0.3); g.sMid = F(-0.2, -0.24);
    g.duct = [[g.J, g.split, g.caps[0]], [g.J, g.split, g.caps[1]], [g.J, g.sMid, g.caps[2]]];
    this.slots(g); this._g = g; return g;
  },
  slots(g) {   // where stored sperm rest: a loose pack inside each spermatheca; the singlet's far end holds the out-of-reach sperm (L2); the chamber holds unstored sperm (L3)
    const sp = Math.max(4.2, g.Rd * 0.042), out = [], reach = [], bur = [], dung = !!RF_LV[this.sim.s.level].dung;
    g.caps.forEach((c, ci) => {
      const rr = g.cr - sp * 0.8, row = sp * 0.88, list = [];
      for (let y = -rr; y <= rr + 1e-6; y += row) { const half = Math.sqrt(Math.max(0, rr * rr - y * y)), off = Math.round((y + rr) / row) % 2 ? sp / 2 : 0; for (let x = -half + off; x <= half; x += sp) list.push([c[0] + x, c[1] + y]); }
      for (const p of list) { if (dung && ci === 2 && p[1] < c[1] - rr * 0.35) reach.push(p); else out.push(p); }
    });
    const rnd = rng(11); for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)), t = out[i]; out[i] = out[j]; out[j] = t; }   // cosmetic: sperm mix across the three stores
    for (let i = 0; i < 40; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.8; bur.push([g.B[0] + g.Br[0] * r * Math.cos(a), g.B[1] + g.Br[1] * r * Math.sin(a)]); }   // cosmetic
    g.slot = out; g.reach = reach.length ? reach : out.slice(0, 4); g.bur = bur; g.sp = sp;
  },
  layout() { this._g = null; this.geo(); this.v.bgSig = ''; this._lens = null; },
  cardXY(i, g) { const n = this.sim.s.fem.length, gap = 6, w = Math.min(70, (g.W - 16 - gap * (n - 1)) / n), x0 = (g.W - (w * n + gap * (n - 1))) / 2; return { x: x0 + i * (w + gap), y: g.top, w, h: g.cardH }; },
  eggXY(j, g) { const E = g.eggs, col = j % 10, row = Math.floor(j / 10); return [E.x0 + (E.x1 - E.x0) * (col + 0.5) / 10, row ? E.y1 : E.y0]; },
  along(pts, u) {   // a point a fraction u along a polyline (cosmetic)
    let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let want = Math.max(0, Math.min(1, u)) * L; for (let i = 0; i < seg.length; i++) { if (want <= seg[i] || i === seg.length - 1) { const k = seg[i] ? Math.min(1, want / seg[i]) : 0; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; } want -= seg[i]; }
    return pts[pts.length - 1];
  },

  /* ---------- sperm in her stores: the counts follow the sim, the motion is cosmetic ---------- */
  style(o) { return o === 0 ? 0 : o % 2 ? 1 : 2; },   // owner → look: yours, then rivals alternate solid umber / dotted sage
  target() {   // what her stores (dr) and her chamber or the out-of-reach end (pk) hold now, by owner (0 yours; 1–5 rivals before you; 8 the earlier male in L2)
    const s = this.sim.s, F = this.sim.cur(s), dr = {}, pk = {}, ph = s.phase, n = s.level;
    if (ph === 'end' || ph === 'over' || ph === 'pm') return { dr, pk, clear: true };
    if (RF_LV[n].dung) {
      const mine = ph === 'arrive' ? 0 : Math.round(RF_D.n * (F.x != null && ph !== 'pour' && ph !== 'close' ? F.x : RF.dshare(s.mins)));
      dr[8] = RF_D.n - RF_D.pocket - mine; pk[8] = RF_D.pocket; dr[0] = mine; return { dr, pk };
    }
    const k = Math.round(F.R / RF_X), z = F.z == null ? 1 : F.z, y = F.y == null ? 1 : F.y, laying = ph === 'draw' || ph === 'leave';
    for (let r = 1; r <= k; r++) { const kept = Math.round(RF_X * z); dr[r] = kept; if (RF_X - kept && !laying) pk[r] = RF_X - kept; }
    const u = ph === 'arrive' ? 0 : Math.floor(F.s + 1e-9), ky = Math.round(u * y); dr[0] = ky; if (u - ky && !laying) pk[0] = u - ky;   // unstored sperm are lost once she lays
    return { dr, pk };
  },
  scaled(want, cap) {   // when a store holds more units than the picture has room for, each sperm drawn stands for several units (labels keep the true counts)
    let tot = 0; for (const o in want) tot += want[o]; if (tot <= cap) return want;
    const out = {}; for (const o in want) out[o] = want[o] > 0 ? Math.max(1, Math.round(want[o] * cap / tot)) : 0; return out;
  },
  sync(dt) {   // cosmetic: reconcile the sperm sprites with target(): your new sperm swim in from her opening; removed ones are flushed back out
    const g = this.geo(), v = this.v, s = this.sim.s, T = this.target(), rnd = () => Fx.rnd(), her = !!RF_LV[s.level].her;   // cosmetic
    const fresh = v.fi !== s.i || !!T.clear;   // a new female: her own stores, drawn at once
    if (fresh) { v.tk = []; v.order = []; v.gone = []; v.fi = T.clear ? -1 : s.i; }
    for (const where of ['dr', 'pk']) {
      const cap = where === 'dr' ? g.slot.length : her ? g.bur.length : g.reach.length, want = this.scaled(T[where], cap), have = {};
      for (const t of v.tk) if (t.w === where) have[t.o] = (have[t.o] || 0) + 1;
      for (const o in have) { let extra = have[o] - (want[o] || 0); for (let i = v.tk.length - 1; i >= 0 && extra > 0; i--) { const t = v.tk[i]; if (t.w === where && t.o === +o) { this.drop(t, i); extra--; } } }
      for (const o in want) {
        const add = want[o] - (have[o] || 0);
        for (let i = 0; i < add; i++) {
          const t = { o: +o, w: where, x: g.O[0], y: g.O[1], a: rnd() * TAU, seed: rnd(), via: +o === 0 && !fresh ? [g.B, g.J] : null };
          if (fresh || +o !== 0) { t.x = null; }   // stored before you arrived: placed at once
          v.tk.push(t); if (where === 'dr') v.order.splice(Math.floor(rnd() * (v.order.length + 1)), 0, t);   // mixed in at random: a raffle
        }
      }
    }
    const k = Math.min(1, dt * 7);
    const place = (t, p) => {
      if (t.x == null) { t.x = p[0]; t.y = p[1]; return; }
      let tx = p[0], ty = p[1]; if (t.via && t.via.length) { tx = t.via[0][0]; ty = t.via[0][1]; if (Math.hypot(tx - t.x, ty - t.y) < 4) t.via.shift(); }
      const kk = t.via && t.via.length ? Math.min(1, dt * 10) : k; t.x += (tx - t.x) * kk; t.y += (ty - t.y) * kk;
    };
    v.order.forEach((t, i) => place(t, g.slot[i % g.slot.length]));
    let pi = 0; for (const t of v.tk) if (t.w === 'pk') { const L = her ? g.bur : g.reach; place(t, L[pi % L.length]); pi++; }
    for (let i = v.gone.length - 1; i >= 0; i--) { const t = v.gone[i]; t.u += dt * 1.6; if (t.u >= 1) v.gone.splice(i, 1); }
  },
  drop(t, i) {   // a sperm leaves: flushed back down the duct and out of her opening
    const v = this.v, g = this.geo(); v.tk.splice(i, 1); const j = v.order.indexOf(t); if (j >= 0) v.order.splice(j, 1);
    if (v.gone.length < 60 && t.x != null) v.gone.push({ o: t.o, path: t.w === 'pk' && RF_LV[this.sim.s.level].her ? [[t.x, t.y], g.O] : [[t.x, t.y], g.J, g.B, g.O], u: 0, seed: t.seed });
  },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    if (s.phase === 'search') v.clock += dt * (s.ff || 1); else if (s.phase === 'arrive') v.clock = 0;
    for (let i = v.fly.length - 1; i >= 0; i--) { const f = v.fly[i]; f.t += dt * (s.ff > 1 ? 2.5 : 1); if (f.t >= f.d) { this.v.eggs[f.j] = f.o; this.v.eggT[f.j] = 0.3; if (f.o === 0 && typeof Fx !== 'undefined') { const p = this.eggXY(f.j, this.geo()); Fx.burst('spark', p[0], p[1], 4, { ink: RF_C.brassD }); } v.fly.splice(i, 1); } }
    for (let j = 0; j < RF_E; j++) if (v.eggT[j] > 0) v.eggT[j] = Math.max(0, v.eggT[j] - dt);
    for (let i = v.tube.length - 1; i >= 0; i--) { v.tube[i].u += dt * 1.8; if (v.tube[i].u >= 1) v.tube.splice(i, 1); }
    if (s.hold && v.t - v.lastPour > 0.06 && v.tube.length < 30) { v.tube.push({ u: 0, c: Math.floor(v.t * 17) % 3 }); v.lastPour = v.t; }   // a stream of your sperm up the ducts while you mate
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    this.sync(dt);
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; this._dockSig = ''; if (typeof Predict === 'undefined') return;
    Predict.ask({ id: A.id, chart: 0, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.hi, at: A.at, tol: A.tol, soft: s.unt ? null : 40, needMove: true, linger: 700,   // the ghost starts off every plausible answer (lessons §1.3)
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null }), say: this.content.captions.liveAsk });
    if (typeof Live !== 'undefined') Live.say(this.content.hud[A.id]);
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(0); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, S = this.sim, final = n === RF_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    const V = this.vars();
    if (o.interesting) { const iv = this.sim.iVars(s); C.interesting.now = Txt.f(C.interesting[o.interesting], iv); o.interesting = 'now'; }   // the engine shows the text as is: fill this run's numbers first
    if (s.whatif) { o.take = null; o.interesting = null; o.body = Txt.f(C.whatifBody[s.whatif] || '', S.wiVars(s)); }
    else if (!final) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    o.stars = C.levelStars[n];
    const vial = typeof Freezer !== 'undefined' ? Freezer.list(this.id).find(x => x.gen === 0) : null;
    if (vial && !s.whatif) o.whatIf = { gen: 0, levers: RF_LV[n].levers };
    const spec = this.debrief(); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  vars() {
    const s = this.sim.s, S = this.sim, L = s.fem, r1 = x => Math.round(x * 10) / 10, m = L.slice(0, 3).map(F => F.t || 0);
    return { e: r1(S.expEggs(s)), b: r1(S.bestEggs(s)), m: Math.round((m[0] + m[1] + m[2]) / 3), a: Math.round(S.pmMean(s) || 0) };
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {   // cosmetic (view-only maths)
    const s = this.sim.s, v = this.v, g = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, cur = this.sim.cur(s);
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    if (e.k === 'press') { if (F) F.ring(g.O[0], g.O[1], 16, { ms: 180 }); }
    else if (e.k === 'in') {
      if (v.t - v.lastIn > 0.08) { snd('pour', g.O[0], g.O[1], { left: s.left / RF_B }); v.lastIn = v.t; }
      if (RF_LV[s.level].her) { const u = Math.floor(cur.s + 1e-9), kept = Math.round(u * cur.y); if (u >= 4 && u - kept >= 2 && this.once('pk' + s.i)) this.whisper('pocket'); }
      if (typeof Live !== 'undefined' && e.tot % 10 === 0) Live.say(Txt.f(C.captions.liveIn, { s: e.tot, l: Math.round(s.left) }));
    }
    else if (e.k === 'min') {
      if (e.m % 5 === 0) snd('tock', g.cx, g.cy - g.Rd);
      if (F && e.m % 3 === 0) F.ring(g.J[0], g.J[1], 10, { ms: 200 });
      const sh = RF.dshare(s.mins); if (sh > 0.55 && !v.flushSaid) { v.flushSaid = true; this.whisper('flushed'); }
      if (typeof Live !== 'undefined' && e.m % 10 === 0) Live.say(Txt.f(C.captions.liveMin, { m: e.m, p: Math.round(100 * sh) }));
    }
    else if (e.k === 'release') { if (F) F.ring(g.O[0], g.O[1], 12, { ms: 160 }); }
    else if (e.k === 'dry') { this.whisper('dry'); if (F) { F.shake(4, 160); F.ring(g.gauge.x, g.gauge.y1, 20, { ms: 400 }); } snd('tock', g.gauge.x, g.gauge.y1); }
    else if (e.k === 'shut') { if (F) F.ring(g.O[0], g.O[1], 22, { ms: 260 }); snd('tock', g.O[0], g.O[1]); }
    else if (e.k === 'ask') { if (F) F.ring(g.cx, g.cy, g.Rd * 0.5, { ms: 400 }); }
    else if (e.k === 'predicted') {
      const id = e.id, ex = this.sim.expect(s, id), A = RF_ASK[id];
      if (typeof Predict !== 'undefined' && !e.none) Predict.reveal(id, ex, A.tol);
      this.whisper(e.none ? 'none' : this.sim.hit(s, id) ? 'hit' : 'out');
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'draw') { this.resetEggs(); v.fly = []; if (F) F.tier(1, () => { }); snd('sieve', g.cx, g.cy); }
    else if (e.k === 'egg') {
      const slot = e.m ? v.nMine++ : RF_E - 1 - v.nRiv++, o = e.m ? 0 : this.rivalOwner(cur, e.j);   // yours fill from the first egg, rivals' from the last
      const tk = v.order.filter(t => t.x != null && this.style(t.o) === this.style(o)), src = tk.length ? tk[e.j % tk.length] : null, from = src ? [src.x, src.y] : g.caps[e.j % 3];   // the sperm that meets this egg leaves one of her stores
      let ci = 0, bd = 1e9; g.caps.forEach((p, i) => { const d = Math.hypot(p[0] - from[0], p[1] - from[1]); if (d < bd) { bd = d; ci = i; } });
      v.fly.push({ j: slot, o, t: 0, d: 0.8, path: [from, ci === 2 ? g.sMid : g.split, g.J, g.Fz] });
      snd(e.m ? 'count' : 'tick', g.Fz[0], g.Fz[1], { i: e.j });
    }
    else if (e.k === 'laid') {
      const [x, y] = this.eggXY(4, g);
      if (F) { F.pop('+' + e.eggs, x, y - 22, e.eggs > 0 ? 1 : 0); F.tier(2, () => { }); }
      if (e.eggs === RF_E && F) { F.tier(3, ms => { v.banner = { text: C.labels.jackpot, t: 0, ms: Math.max(900, ms) }; }); for (let k = 0; k < 4; k++) F.burst('spark', g.eggs.x0 + (k + 0.5) * (g.eggs.x1 - g.eggs.x0) / 4, g.eggs.y0, 6, { ink: RF_C.red }); this.whisper('jackpot'); if (typeof Snd2 !== 'undefined') Snd2.play('interesting', { x: g.cx, y: g.cy }); }
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveLaid, { m: e.eggs }));
    }
    else if (e.k === 'search') { snd('wing', g.pair.x, g.pair.y); }
    else if (e.k === 'leave') { snd('swish', g.pair.x, g.pair.y); }
    else if (e.k === 'arrive') { this.resetEggs(); v.fly = []; snd('wing', g.W, g.pair.y); }
    else if (e.k === 'ready') { if (RF_LV[s.level].her && cur.z < 0.5) this.whisper('favour'); }
    else if (e.k === 'pm') { if (F) F.tier(3, ms => { v.banner = { text: C.labels.pm, t: 0, ms: Math.max(1700, ms + 500) }; }); if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); }
    else if (e.k === 'ff') { if (F) F.ring(g.Fz[0], g.Fz[1], g.Rd * 0.3, { ms: 220 }); }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  rivalOwner(F, j) { const k = Math.max(1, Math.round(F.R / RF_X)); return RF_LV[this.sim.s.level].dung ? 8 : 1 + (j % k); },   // cosmetic: which rival's look an egg takes
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'rf-' + k); },

  /* ---------- input: hold anywhere below the HUD to mate; a quick tap passes one unit; keys through onKey/onKeyUp ---------- */
  holdOn() { const s = this.sim.s; if (s.phase === 'draw' || s.phase === 'search') { Sim.act(this, { k: 'ff' }); return; } Sim.act(this, { k: 'hold', on: true }); },
  holdOff() { Sim.act(this, { k: 'hold', on: false }); },
  down(x, y) { if (y < this.hudH()) return; this.v.press = { t: this.v.t }; this.v.latch = false; this.holdOn(); },
  up() { if (!this.v.press) return; this.v.press = null; if (!this.v.latch) this.holdOff(); },
  toggle() { const s = this.sim.s; if (s.hold) { this.v.latch = false; this.holdOff(); } else { this.v.latch = true; this.holdOn(); } },
  onKey(k, e) {
    const s = this.sim.s, dung = RF_LV[s.level].dung;
    if (k === ' ' || k === 'Spacebar') { if (e && e.repeat) return; this.v.kPress = true; this.holdOn(); }
    else if (k === 'ArrowUp' || k === '+' || k === '=') Sim.act(this, { k: 'add', n: dung ? 5 : e && e.shiftKey ? 5 : 1 });
  },
  onKeyUp(k) { if ((k === ' ' || k === 'Spacebar') && this.v.kPress) { this.v.kPress = false; this.holdOff(); } },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, dung = RF_LV[s.level].dung, open = s.phase === 'pour' || s.phase === 'close';
    const sig = s.phase + (s.ask ? s.ask.id : '') + (s.hold ? 'h' : '') + (s.auto ? 'a' : '') + (s.left > 0 ? 'l' : ''); if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'rf-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (s.auto || s.phase === 'over' || s.phase === 'end') { Dock.set([]); return; }
    if (s.phase === 'draw' || s.phase === 'search') { Dock.set([{ id: 'rf-ff', label: L.faster, key: 'f', fn: () => Sim.act(this, { k: 'ff' }) }]); return; }
    if (!open) { Dock.set([]); return; }
    Dock.set([{ id: 'rf-pour', label: s.hold ? L.stop : L.mate, pressed: !!s.hold, aria: 'Mate: tap to start, tap to stop', disabled: !dung && s.left <= 0, fn: () => this.toggle() },
      { id: 'rf-done', label: dung ? L.leave : L.done, key: 'Enter', primary: true, fn: () => Sim.act(this, { k: 'mate' }) }]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, L = RF_LV[s.level], F = this.sim.cur(s), lab = this.content.labels; let t;
    if (s.ask) t = C[s.ask.id];
    else if (s.auto) t = C.auto;
    else if (s.phase === 'over' || s.phase === 'end') t = C.over;
    else if (s.phase === 'draw') t = C.draw;
    else if (s.phase === 'search') t = Txt.f(C.search, { T: Math.floor(F.T) });
    else if (s.phase === 'pm') t = C.pm;
    else if (L.dung) t = s.mins > 0 ? Txt.f(C.copula, { m: Math.floor(s.mins) }) : C.mate;
    else if (s.left <= 0 && F.s <= 0) t = C.dry;
    else if (s.level === 0 && s.i === 0 && F.s <= 0) t = this.content.firstWords;
    else if (L.her) t = Txt.f(C.pour4, { y: Math.round(100 * F.y), z: Math.round(100 * F.z) });
    else t = F.R ? Txt.f(C.pourR, { r: F.R }) : C.pourV;
    const rt = this.sim.rate(s), num = L.dung ? (rt > 0 ? Txt.f(lab.rate, { r: rt.toFixed(1) }) : '') : lab.supply + ' ' + Math.round(s.left);
    const sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g); this.drawCards(c, g); this.drawFlies(c, g); this.drawBeam(c, g); this.drawLens(c, g); this.drawGauge(c, g); this.drawEggs(c, g);
    if (s.phase === 'search' || (RF_LV[s.level].dung && (s.phase === 'pour' || s.phase === 'close'))) this.drawClock(c, g);
    this.drawEq(c, g);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('rf-banner', v.banner.text, g.cx, g.cy - g.Rd * 0.75, { size: 22 }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached: sky, sun, hedge and a grazing cow, meadow, the cowpat
    const sig = g.k; if (!this._bg || this.v.bgSig !== sig) { this._bg = this._bg || Layer(g.W, g.H); this._bg.resize(g.W, g.H); this._bg.redraw(cc => this.paintBg(cc, g)); this.v.bgSig = sig; }
    this._bg.blit(c, 0, 0);
  },
  paintBg(c, g) {   // cosmetic
    const C = RF_C, W = g.W, H = g.H, hz = g.top + g.cardH + Math.min(70, g.Rd * 0.45), rnd = rng(7);
    const sk = c.createLinearGradient(0, 0, 0, hz); sk.addColorStop(0, C.sky); sk.addColorStop(1, C.sky2); c.fillStyle = sk; c.fillRect(0, 0, W, hz + 2);
    c.fillStyle = 'rgba(255,244,200,.85)'; c.beginPath(); c.arc(W * 0.88, g.top + g.cardH + 22, Math.min(30, W * 0.06), 0, TAU); c.fill();
    c.fillStyle = C.hill; c.beginPath(); c.moveTo(0, hz); for (let x = 0; x <= W; x += 20) c.lineTo(x, hz - 10 - 8 * Math.sin(x / W * 5.1 + 1)); c.lineTo(W, hz + 4); c.lineTo(0, hz + 4); c.fill();   // cosmetic
    c.fillStyle = C.hedge; for (let x = -10; x < W + 20; x += 16) { c.beginPath(); c.arc(x, hz - 2, 9 + 5 * rnd(), Math.PI, 0); c.fill(); }
    const cw = Math.max(26, W * 0.07), cx0 = W * 0.86, cy0 = hz + 4;   // a Friesian grazing in the distance
    c.fillStyle = '#F5F2EA'; this.rr(c, cx0, cy0 - cw * 0.5, cw, cw * 0.42, cw * 0.15); c.fill(); c.fillStyle = '#2B2622';
    c.beginPath(); c.ellipse(cx0 + cw * 0.3, cy0 - cw * 0.35, cw * 0.14, cw * 0.1, 0.3, 0, TAU); c.fill(); c.beginPath(); c.ellipse(cx0 + cw * 0.7, cy0 - cw * 0.25, cw * 0.1, cw * 0.08, 0, 0, TAU); c.fill();
    c.fillRect(cx0 + cw * 0.08, cy0 - cw * 0.1, 3, cw * 0.22); c.fillRect(cx0 + cw * 0.85, cy0 - cw * 0.1, 3, cw * 0.22); c.beginPath(); c.ellipse(cx0 - cw * 0.05, cy0 - cw * 0.12, cw * 0.14, cw * 0.1, -0.6, 0, TAU); c.fill();
    const mg = c.createLinearGradient(0, hz, 0, H); mg.addColorStop(0, C.grass); mg.addColorStop(1, C.grass2); c.fillStyle = mg; c.fillRect(0, hz + 2, W, H - hz);
    c.strokeStyle = 'rgba(60,90,30,.35)'; c.lineWidth = 1.2; for (let i = 0; i < 160; i++) { const x = rnd() * W, y = hz + 8 + rnd() * (H - hz); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 4, y - 4 - rnd() * 5); c.stroke(); }
    c.fillStyle = '#F4F0D8'; for (let i = 0; i < 22; i++) { const x = rnd() * W, y = hz + 14 + rnd() * (g.patY - hz - 10); c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); }   // daisies
    // the cowpat: a warm crusted disc with darker wet patches and cracks
    const py = g.patY + g.patH * 0.55, pw = W * 0.5, ph = g.patH * 0.42;
    c.fillStyle = 'rgba(40,30,15,.25)'; c.beginPath(); c.ellipse(W * 0.52, py + ph * 0.25, pw * 1.02, ph * 0.9, 0, 0, TAU); c.fill();
    const pg = c.createRadialGradient(W * 0.48, py - ph * 0.4, 4, W * 0.52, py, pw); pg.addColorStop(0, C.crust); pg.addColorStop(1, C.pat); c.fillStyle = pg;
    c.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.2) { const r = 1 + 0.05 * Math.sin(a * 5 + 1) + 0.03 * Math.sin(a * 11); const x = W * 0.52 + Math.cos(a) * pw * r, y = py + Math.sin(a) * ph * r; if (a === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.fill();   // cosmetic
    c.fillStyle = C.patD; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(W * 0.52 + (rnd() - 0.5) * pw * 1.4, py + (rnd() - 0.4) * ph * 1.1, 6 + rnd() * 14, 3 + rnd() * 5, rnd(), 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(230,200,150,.35)'; c.lineWidth = 1; for (let i = 0; i < 7; i++) { const x = W * 0.52 + (rnd() - 0.5) * pw * 1.3, y = py + (rnd() - 0.5) * ph; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10 + rnd() * 10, y + (rnd() - 0.5) * 6); c.stroke(); }
  },
  rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
  sperm(c, x, y, ang, o, sc, t) {   // cosmetic: one sperm cell, head and beating tail; yours light with a gold halo, rivals dark umber or sage with a dot
    const st = this.style(o), hl = 2.3 * sc, hw = 1.25 * sc, tl = 6.5 * sc, calm = typeof Fx !== 'undefined' && Fx.calm;
    c.save(); c.translate(x, y); c.rotate(ang);
    c.strokeStyle = st === 0 ? 'rgba(120,80,30,.7)' : 'rgba(40,30,20,.55)'; c.lineWidth = Math.max(0.8, 0.45 * sc); c.beginPath(); c.moveTo(-hl * 0.8, 0);
    const w = calm ? 0 : t; for (let k = 1; k <= 4; k++) c.lineTo(-hl * 0.8 - tl * k / 4, 1.3 * sc * Det.sin(w * 14 + k * 1.6) * k / 4); c.stroke();
    if (st === 0) { c.fillStyle = 'rgba(243,210,122,.75)'; c.beginPath(); c.ellipse(0, 0, hl + 1.3, hw + 1.3, 0, 0, TAU); c.fill(); }
    c.fillStyle = st === 0 ? RF_C.you : st === 1 ? RF_C.riv1 : RF_C.riv2; c.beginPath(); c.ellipse(0, 0, hl, hw, 0, 0, TAU); c.fill();
    c.lineWidth = 0.8; c.strokeStyle = RF_C.ink; c.stroke();
    if (st === 2) { c.fillStyle = RF_C.dot; c.beginPath(); c.arc(0.2 * hl, 0, Math.max(0.7, 0.35 * hw), 0, TAU); c.fill(); }
    c.restore();
  },
  drawCards(c, g) {   // the queue: one card per female (rival males before her as sperm; L2 her search time; L3 the share of each male's sperm she stores)
    const s = this.sim.s, lab = this.content.labels, C = RF_C, dung = RF_LV[s.level].dung, her = RF_LV[s.level].her;
    s.fem.forEach((F, i) => {
      const r = this.cardXY(i, g), now = i === s.i && s.phase !== 'over' && s.phase !== 'end', done = F.eggs >= 0, cx = r.x + r.w / 2;
      c.save(); c.globalAlpha = done && !now ? 0.66 : 1;
      c.fillStyle = C.cream; this.rr(c, r.x, r.y, r.w, r.h, 6); c.fill();
      c.lineWidth = now ? 3 : 1.2; c.strokeStyle = now ? C.red : C.brassD; c.stroke();
      if (dung) Lbl.put('rf-c' + i, Txt.f(lab.mins, { m: Math.floor(F.T) }), cx, r.y + 12, { size: 12, pill: false, ink: C.ink });   // her search time
      else {
        const k = Math.round(F.R / RF_X), sw = Math.min(9, (r.w - 8) / Math.max(1, k));
        if (!k) Lbl.put('rf-c' + i, lab.virgin, cx, r.y + 12, { size: 12, pill: false, ink: C.ink });
        for (let q = 0; q < k; q++) this.sperm(c, cx - sw * (k - 1) / 2 + q * sw, r.y + 11, -TAU / 4, 1 + q, 1.35, 0);   // one sperm per earlier male
      }
      if (her && !done) {   // what she stores: his sperm (solid) above, yours (striped) below
        const bw = r.w - 10, bx = r.x + 5;
        for (const [k, f, y0] of [[1, F.z, r.y + r.h * 0.52], [0, F.y, r.y + r.h * 0.74]]) {
          c.fillStyle = 'rgba(30,24,16,.15)'; c.fillRect(bx, y0, bw, 6); c.fillStyle = k ? C.riv1 : C.youS; c.fillRect(bx, y0, Math.max(1.5, bw * f), 6);
          c.strokeStyle = C.ink; c.lineWidth = 0.8; c.strokeRect(bx + 0.5, y0 + 0.5, bw - 1, 5);
        }
      }
      if (done) Lbl.put('rf-e' + i, String(F.eggs), cx, r.y + r.h * 0.7, { size: 12 });
      c.restore();
    });
  },
  drawBeam(c, g) {   // cosmetic: the hand lens's view cone, from the female on the pat up to the magnified abdomen
    const s = this.sim.s, ph = s.phase; if (ph === 'end' || ph === 'over' || ph === 'pm') return;
    const fp = this.femaleAt(g); if (!fp) return;
    const dx = g.cx - fp[0], dy = g.cy - fp[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
    c.save(); c.fillStyle = 'rgba(255,252,236,.22)'; c.strokeStyle = 'rgba(60,40,20,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(fp[0], fp[1]);
    c.lineTo(g.cx + nx * g.Rd * 0.96, g.cy + ny * g.Rd * 0.96); c.lineTo(g.cx - nx * g.Rd * 0.96, g.cy - ny * g.Rd * 0.96); c.closePath(); c.fill(); c.stroke(); c.restore();
  },
  femaleAt(g) { const s = this.sim.s, ph = s.phase; let fx = g.pair.x, fy = g.pair.y; if (ph === 'arrive') { const u = Math.min(1, s.pt / RF_T.arrive); fx = g.W + g.S - (g.W + g.S - g.pair.x) * (1 - (1 - u) * (1 - u)); fy = g.pair.y - g.S * 1.4 * (1 - u); } else if (ph === 'leave') { const u = Math.min(1, s.pt / RF_T.leave); fx = g.pair.x - g.S * 2 * u; fy = g.pair.y - g.S * 2.2 * u; } return [fx, fy]; },
  bakeLens(g) {   // cosmetic, cached per size: the lens field, her abdomen in cutaway, the tract, ducts, ovaries and the three spermathecae
    if (this._lens && this._lens.k === g.k) return this._lens.L;
    const L = Layer(g.W, g.H), C = RF_C, R0 = g.Rd;
    L.redraw(c => {
      c.save(); c.beginPath(); c.arc(g.cx, g.cy, R0, 0, TAU); c.clip();
      const fg = c.createRadialGradient(g.cx - R0 * 0.3, g.cy - R0 * 0.3, R0 * 0.1, g.cx, g.cy, R0); fg.addColorStop(0, '#FFFDF5'); fg.addColorStop(1, '#EFE6CF'); c.fillStyle = fg; c.fillRect(g.cx - R0, g.cy - R0, 2 * R0, 2 * R0);
      // the abdomen: a grey-olive, bristly body wall with segment lines, opened to show the organs inside
      c.save(); c.translate(g.cx, g.cy); c.rotate(g.th);
      c.fillStyle = C.body; c.strokeStyle = C.bodyD; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, R0 * 0.98, R0 * 0.64, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(70,64,44,.55)'; c.lineWidth = 1.2; for (let k = -3; k <= 4; k++) { const u = k * 0.22 * R0, h = R0 * 0.64 * Math.sqrt(Math.max(0, 1 - (u / (R0 * 0.98)) ** 2)); c.beginPath(); c.moveTo(u - 4, -h); c.quadraticCurveTo(u + 6, 0, u - 4, h); c.stroke(); }   // cosmetic
      c.strokeStyle = 'rgba(60,54,36,.5)'; c.lineWidth = 1; const rn = rng(5); for (let i = 0; i < 70; i++) { const a = rn() * TAU, x = R0 * 0.98 * Math.cos(a), y = R0 * 0.64 * Math.sin(a); c.beginPath(); c.moveTo(x, y); c.lineTo(x * 1.06, y * 1.08); c.stroke(); }   // cosmetic: bristles
      c.fillStyle = 'rgba(250,236,226,.92)'; c.beginPath(); c.ellipse(-R0 * 0.04, 0, R0 * 0.88, R0 * 0.55, 0, 0, TAU); c.fill();   // the cutaway window
      c.strokeStyle = 'rgba(160,110,90,.45)'; c.setLineDash([4, 3]); c.lineWidth = 1.2; c.stroke(); c.setLineDash([]);
      c.restore();
      // ovaries: grape-like bunches of follicles
      for (const [ox, oy] of g.ova) for (let i = 0; i < 9; i++) { const a = i * 2.4, r = R0 * 0.07 * Math.sqrt(i + 0.5); c.fillStyle = C.ovary; c.strokeStyle = C.tissueD; c.lineWidth = 1; c.beginPath(); c.ellipse(ox + r * Math.cos(a), oy + r * Math.sin(a), R0 * 0.05, R0 * 0.033, g.th + a, 0, TAU); c.fill(); c.stroke(); }   // cosmetic
      // lateral oviducts and the common oviduct down to the opening
      const tube = (pts, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); };
      for (const o of g.ova) tube([o, g.ov[0]], R0 * 0.05, C.tissueD);
      const ovd = g.ov.concat([g.B, g.O]); tube(ovd, R0 * 0.085, C.tissueD); tube(ovd, R0 * 0.06, C.tissue);
      c.fillStyle = C.tissue; c.strokeStyle = C.tissueD; c.lineWidth = 2; c.beginPath(); c.ellipse(g.B[0], g.B[1], g.Br[0], g.Br[1], g.th, 0, TAU); c.fill(); c.stroke();   // the genital chamber
      // spermathecal ducts and the three dark, hard spermathecae (cut open to show the sperm inside)
      for (const d of g.duct) { tube(d, Math.max(2.5, R0 * 0.025), C.duct); }
      g.caps.forEach(p => { c.fillStyle = C.store; c.beginPath(); c.arc(p[0], p[1], g.cr + Math.max(3, R0 * 0.03), 0, TAU); c.fill(); c.fillStyle = C.storeIn; c.beginPath(); c.arc(p[0], p[1], g.cr, 0, TAU); c.fill(); });
      c.restore();
    });
    this._lens = { k: g.k, L }; return L;
  },
  drawLens(c, g) {   // cosmetic
    const s = this.sim.s, v = this.v, R0 = g.Rd, C = RF_C, lab = this.content.labels, ph = s.phase, empty = ph === 'end' || ph === 'over' || ph === 'pm';
    c.fillStyle = 'rgba(30,20,10,.2)'; c.beginPath(); c.arc(g.cx + 5, g.cy + 7, R0 * 1.03, 0, TAU); c.fill();
    if (empty) { c.fillStyle = 'rgba(251,246,234,.85)'; c.beginPath(); c.arc(g.cx, g.cy, R0, 0, TAU); c.fill(); }
    else {
      this.bakeLens(g).blit(c, 0, 0);
      c.save(); c.beginPath(); c.arc(g.cx, g.cy, R0, 0, TAU); c.clip();
      const sc = g.sp / 4.2;
      // your sperm streaming in while you mate: opening → chamber → duct → a store
      for (const q of v.tube) { const path = [g.O, g.B].concat(g.duct[q.c]), p = this.along(path, q.u), p2 = this.along(path, Math.min(1, q.u + 0.02)); this.sperm(c, p[0], p[1], Math.atan2(p2[1] - p[1], p2[0] - p[0]), 0, sc, v.t + q.u); }   // cosmetic
      for (const t of v.tk) if (t.x != null) this.sperm(c, t.x, t.y, t.a + (typeof Fx !== 'undefined' && Fx.calm ? 0 : 0.25 * Det.sin(v.t * 2 + t.seed * 9)), t.o, sc, v.t + t.seed * 5);
      for (const t of v.gone) { const p = this.along(t.path, t.u), p2 = this.along(t.path, Math.min(1, t.u + 0.03)); c.save(); c.globalAlpha = Math.max(0, 1 - t.u * 0.8); this.sperm(c, p[0], p[1], Math.atan2(p2[1] - p[1], p2[0] - p[0]), t.o, sc, v.t + t.seed); c.restore(); }   // cosmetic: flushed out
      // eggs in the oviduct: each meets one stored sperm at the duct openings, then is laid
      for (const f of v.fly) {
        const u = f.t / f.d, er = Math.max(3.5, R0 * 0.045);
        if (u < 0.4) { const k = u / 0.4, p = this.along(g.ov, k); this.eggDot(c, p[0], p[1], er, -1);
          const q = this.along(f.path, k); this.sperm(c, q[0], q[1], Math.atan2(g.Fz[1] - q[1], g.Fz[0] - q[0]), f.o, sc * 1.1, v.t); }
        else if (u < 0.62) { const p = this.along([g.Fz, g.B, g.O], (u - 0.4) / 0.22); this.eggDot(c, p[0], p[1], er, f.o); }
      }
      c.restore();
      // labels: the stores, out of reach (L2), not stored (L3), the ovary
      Lbl.put('rf-stores', lab.stores, g.caps[1][0], g.caps[1][1] - g.cr - 14, { size: 12 });
      if (RF_LV[s.level].dung) Lbl.put('rf-reach', lab.reach, g.caps[2][0] + g.cr + 6, g.caps[2][1] - g.cr * 0.6, { size: 12, align: 'left' });
      if (RF_LV[s.level].her && v.tk.some(t => t.w === 'pk')) Lbl.put('rf-pocket', lab.pocket, g.B[0], g.B[1] + g.Br[1] + 14, { size: 12 });
      if (R0 > 90) Lbl.put('rf-ovary', lab.ovary, g.ova[0][0], g.ova[0][1] - R0 * 0.2, { size: 12 });
      if (ph !== 'arrive' && ph !== 'leave') {   // the store's two numbers, in true units (shown during the call too: they are the evidence, not the answer)
        const T = this.target(); let me = T.dr[0] || 0, them = 0; for (const o in T.dr) if (+o !== 0) them += T.dr[o];
        if (RF_LV[s.level].dung) them += RF_D.pocket;
        Lbl.put('rf-yours', Txt.f(lab.yours, { n: me }), g.cx - R0 * 0.3, g.cy - R0 * 0.8, { size: 13 }); Lbl.put('rf-rivals', Txt.f(lab.rivals, { n: them }), g.cx + R0 * 0.3, g.cy - R0 * 0.8, { size: 13 });
      }
    }
    // the lens rim: a brass hand lens
    const rim = c.createLinearGradient(g.cx - R0, g.cy - R0, g.cx + R0, g.cy + R0); rim.addColorStop(0, C.brassL); rim.addColorStop(0.5, C.brass); rim.addColorStop(1, C.brassD);
    c.strokeStyle = rim; c.lineWidth = Math.max(6, R0 * 0.06); c.beginPath(); c.arc(g.cx, g.cy, R0, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(g.cx - R0 * 0.45, g.cy - R0 * 0.55, R0 * 0.28, R0 * 0.12, -0.6, 0, TAU); c.fill();
    if (!empty && R0 > 80) Lbl.put('rf-lens', lab.lens, g.cx - R0 * 0.15, g.cy + R0 * 0.84, { size: 12 });
  },
  eggDot(c, x, y, r, o) {   // cosmetic: an egg in her oviduct, pale until a sperm meets it, then in its father's look
    c.save(); c.translate(x, y); c.rotate(this.geo().th);
    if (o === 0) { c.fillStyle = RF_C.halo; c.beginPath(); c.ellipse(0, 0, r * 1.45 + 1.5, r + 1.5, 0, 0, TAU); c.fill(); }
    c.fillStyle = o < 0 ? RF_C.egg : o === 0 ? RF_C.you : this.style(o) === 1 ? RF_C.riv1 : RF_C.riv2; c.beginPath(); c.ellipse(0, 0, r * 1.45, r, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(30,24,16,.7)'; c.lineWidth = 1; c.stroke(); c.restore();
  },
  drawEq(c, g) {   // the key number, plainly, under the lens: your share of her stored sperm (hidden while you call her eggs)
    const s = this.sim.s, ph = s.phase, lab = this.content.labels, y = g.cy + g.Rd + 22; if (s.ask) return;
    if (ph === 'pm') { Lbl.put('rf-best', Txt.f(lab.bestT, { t: Math.round(RF.tstar(RF_D.T)) }), g.cx, g.cy, { size: 16 }); return; }
    if (!(ph === 'pour' || ph === 'close' || ph === 'draw' || ph === 'leave' || ph === 'search')) return;
    const F = this.sim.cur(s);
    if (RF_LV[s.level].dung) { const sh = ph === 'pour' || ph === 'close' ? RF.dshare(s.mins) : F.x || 0; Lbl.put('rf-eq', Txt.f(lab.eqDung, { p: Math.round(100 * sh) }), g.cx, y, { size: 14 }); return; }
    const her = RF_LV[s.level].her, a = her ? Math.round(Math.floor(F.s + 1e-9) * F.y) : Math.floor(F.s + 1e-9), r = her ? Math.round(F.R * F.z) : F.R;
    if (a <= 0 && ph !== 'draw') return;
    Lbl.put('rf-eq', her ? lab.eqHer : lab.eqFair, g.cx - 4, y, { size: 14, align: 'right' });
    Lbl.put('rf-eqn', Txt.f(lab.eqNum, { a, t: a + r, p: Math.round(100 * (a + r > 0 ? a / (a + r) : 0)) }), g.cx + 4, y, { size: 14, align: 'left', bg: '#FBF3DC' });
  },
  drawGauge(c, g) {   // your season's supply: a glass vial that drains as you mate (L1, L3)
    const s = this.sim.s; if (RF_LV[s.level].dung) return; const G = g.gauge, f = s.left / RF_B, h = G.y1 - G.y0;
    c.fillStyle = 'rgba(250,245,228,.85)'; this.rr(c, G.x - G.w / 2, G.y0, G.w, h, G.w / 2); c.fill();
    c.fillStyle = RF_C.halo; this.rr(c, G.x - G.w / 2 + 2, G.y0 + h * (1 - f) + 2, G.w - 4, Math.max(0, h * f - 4), G.w / 2 - 2); c.fill();
    c.strokeStyle = RF_C.ink; c.lineWidth = 1; for (let k = 1; k < 10; k++) { const y = G.y0 + h * k / 10; c.beginPath(); c.moveTo(G.x - G.w / 2, y); c.lineTo(G.x - G.w / 2 + 4, y); c.stroke(); }
    c.strokeStyle = RF_C.brassD; c.lineWidth = 2.5; this.rr(c, G.x - G.w / 2, G.y0, G.w, h, G.w / 2); c.stroke();
    Lbl.put('rf-supply', this.content.labels.supply, Math.min(g.W - 44, G.x), G.y1 + 14, { size: 12 });
  },
  drawEggs(c, g) {   // her 20 eggs laid on the dung: each takes its father's look as it is fertilised
    const v = this.v, r = g.eggs.r, s = this.sim.s, F = this.sim.cur(s);
    for (let j = 0; j < RF_E; j++) {
      const [x, y] = this.eggXY(j, g), o = v.eggs[j], sc = 1 + v.eggT[j] * 1.2;
      c.save(); c.translate(x, y); c.scale(sc, sc);
      c.fillStyle = o < 0 ? 'rgba(242,235,214,.35)' : o === 0 ? RF_C.you : this.style(o) === 1 ? RF_C.riv1 : RF_C.riv2;
      if (o === 0) { c.fillStyle = RF_C.halo; c.beginPath(); c.ellipse(0, 0, r * 0.75 + 2, r + 2, 0, 0, TAU); c.fill(); c.fillStyle = RF_C.you; }
      c.beginPath(); c.ellipse(0, 0, r * 0.75, r, 0, 0, TAU); c.fill();
      if (o === 0) { c.save(); c.clip(); c.strokeStyle = RF_C.youS; c.lineWidth = 1.6; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-r, k * r * 0.6 + r * 0.4); c.lineTo(r, k * r * 0.6 - r * 0.4); c.stroke(); } c.restore(); }
      if (o > 0 && this.style(o) === 2) { c.fillStyle = RF_C.dot; for (const [dx, dy] of [[-0.3, -0.4], [0.25, 0], [-0.2, 0.45]]) { c.beginPath(); c.arc(dx * r, dy * r, 1.1, 0, TAU); c.fill(); } }
      c.strokeStyle = o < 0 ? 'rgba(30,24,16,.3)' : 'rgba(30,24,16,.7)'; c.lineWidth = 1; c.setLineDash(o < 0 ? [2, 2] : []); c.beginPath(); c.ellipse(0, 0, r * 0.75, r, 0, 0, TAU); c.stroke(); c.restore();
    }
    if ((s.phase === 'draw' || s.phase === 'search' || s.phase === 'leave') && F && F.draws) {   // the expected boundary, dashed: yours fill from the first egg
      const ex = RF_E * (RF_LV[s.level].dung ? F.x : RF.share(F, F.s)), k = Math.max(0, Math.min(RF_E, ex)), row = k >= 10 && k < 20 ? 1 : 0, col = row ? k - 10 : Math.min(10, k);
      const E = g.eggs, x = E.x0 + (E.x1 - E.x0) * col / 10, y = row ? E.y1 : E.y0;
      c.save(); c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = RF_C.ink; c.beginPath(); c.moveTo(x, y - r * 1.8); c.lineTo(x, y + r * 1.8); c.stroke(); c.restore();
      Lbl.put('rf-expect', this.content.labels.expected, Math.max(E.x0 + 30, Math.min(E.x1 - 30, x)), (row ? E.y1 : E.y0) - r * 1.8 - 9, { size: 12 });
    }
    for (const f of v.fly) {   // a fertilised egg, laid: from her opening down onto the dung
      const u = f.t / f.d; if (u < 0.62) continue; const k = (u - 0.62) / 0.38, [x1, y1] = this.eggXY(f.j, g), fp = this.femaleAt(g);
      const x = fp[0] + (x1 - fp[0]) * k, y = fp[1] + (y1 - fp[1]) * k - 26 * k * (1 - k) * 4; c.save(); c.globalAlpha = 0.9; this.eggDot(c, x, y, r * 0.75, f.o); c.restore();
    }
  },
  drawFlies(c, g) {   // the mating pair on the pat (Rig 'dungfly': furry golden male, greyer female), and rivals hovering in L2
    if (typeof Rig === 'undefined') return;
    const s = this.sim.s, v = this.v, S = g.S, ph = s.phase, calm = typeof Fx !== 'undefined' && Fx.calm;
    const fp = this.femaleAt(g), fx = fp[0], fy = fp[1], fa = ph === 'leave' ? 1 - Math.min(1, s.pt / RF_T.leave) : ph === 'end' || ph === 'over' || ph === 'pm' ? 0 : 1;
    if (fa > 0) {
      Rig.draw(c, 'dungfly', { sex: 'f', size: 0.5 }, fx, fy, { size: S, rot: TAU / 4, alpha: fa });
      const on = ph === 'pour' || ph === 'close' || ph === 'ask', bob = s.hold && !calm ? 2 * Det.sin(v.t * 22) : 0;
      if (on) Rig.draw(c, 'dungfly', { sex: 'm', size: 0.75 }, fx - S * 0.18, fy - S * 0.12 + bob, { size: S * 1.08, rot: TAU / 4 });
      else if (ph === 'draw' || ph === 'search') Rig.draw(c, 'dungfly', { sex: 'm', size: 0.75 }, fx + S * 0.15, fy - S * 0.8, { size: S * 1.08, rot: TAU / 4 + 0.25 });   // guarding beside her while she lays
    }
    if (RF_LV[s.level].dung && (ph === 'pour' || ph === 'close') && !calm) for (let k = 0; k < 2; k++) {   // rival males circling the pat
      const a = v.t * (1.1 + k * 0.4) + k * 2.2, x = g.pair.x + S * (1.4 + k * 0.5) * Det.cos(a), y = g.pair.y - S * 0.9 + S * 0.35 * Det.sin(a * 1.3);
      Rig.draw(c, 'dungfly', { sex: 'm', size: 0.6 }, x, y, { size: S * 0.8, rot: a + TAU / 4, alpha: 0.85 });
    }
  },
  drawClock(c, g) {   // L2: a brass stopwatch: mating minutes while you hold, then the search spinning past
    const s = this.sim.s, F = this.sim.cur(s), x = Math.min(g.W - 30, g.cx + g.Rd + 30), y = g.cy - g.Rd * 0.55, r = Math.max(16, g.Rd * 0.17), lab = this.content.labels;
    const m = s.phase === 'search' ? Math.min(1, this.v.clock / RF_T.search) * F.T : s.mins;
    c.fillStyle = RF_C.cream; c.strokeStyle = RF_C.brassD; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke();
    if (s.phase !== 'search') { c.fillStyle = 'rgba(178,58,46,.35)'; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r - 3, -TAU / 4, -TAU / 4 + TAU * Math.min(1, m / 60)); c.closePath(); c.fill(); }
    const a = -TAU / 4 + TAU * (m % 60) / 60; c.strokeStyle = RF_C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r - 4) * Det.cos(a), y + (r - 4) * Det.sin(a)); c.stroke();
    Lbl.put('rf-x600', lab.xN, x, y - r - 10, { size: 12 });   // the time compression, tagged (D0 §3)
    Lbl.put('rf-clock', s.phase === 'search' ? Txt.f(lab.search, { T: Math.floor(F.T) }) : Txt.f(lab.mins, { m: Math.floor(m) }), Math.min(g.W - 44, x), y + r + 13, { size: 12 });
  },

  /* ---------- the live graph (strip) and the debrief chart ---------- */
  notes() {
    const s = this.sim.s, S = this.sim, lab = this.content.labels, cap = this.content.captions, L = s.fem, over = s.phase === 'over' || s.phase === 'end', n = s.level;
    const stats = [];
    if (RF_LV[n].dung) {
      stats.push([lab.sRate, S.rate(s).toFixed(1), cap.mRate], [lab.sEggs, String(s.got), cap.mEggs]);
      const last = L.filter(F => F.t > 0).pop(); if (last) stats.push([lab.sMins, last.t.toFixed(0), '']);
      const laid = { type: 'rf_rows', title: lab.tLaid, y: { lo: 0, hi: RF_E, label: lab.eggsAx }, cols: L.map((F, i) => ({ label: F.t > 0 ? Math.round(F.t) + '′' : String(i + 1), v: F.eggs >= 0 ? F.eggs : null, cur: i === s.i })), frame: 'designed', fold: false };
      return { stats, charts: [this.gainSpec(false), laid] };
    }
    stats.push([lab.sSupply, String(Math.round(s.left)), cap.mSupply], [lab.sEggs, String(s.got), cap.mEggs], [lab.sExp, S.expEggs(s).toFixed(1), cap.mExp]);
    if (over) stats.push([lab.sBest, S.bestEggs(s).toFixed(1), cap.mBest]);
    return { stats, charts: [this.rowsSpec('eggs')] };   // one live chart; the sperm you passed against the best plan waits for the level card
  },
  rowsSpec(kind) {   // per female: eggs won (realised solid, expected dashed after the level) or units passed (yours solid, the best plan dashed after the level)
    const s = this.sim.s, S = this.sim, lab = this.content.labels, over = s.phase === 'over' || s.phase === 'end', best = over ? S.bestPlan(s) : null;
    const cols = s.fem.map((F, i) => {
      const label = String(Math.round(F.R / RF_X));   // rival males before her
      if (kind === 'eggs') return { label, v: F.eggs >= 0 ? F.eggs : null, e: over ? RF_E * RF.share(F, F.s) : null, cur: i === s.i && !over };
      return { label, v: F.s > 0 || i < s.i ? F.s : null, best: best ? best[i] : null, cur: i === s.i && !over };
    });
    if (kind === 'eggs') return { type: 'rf_rows', title: lab.tEggs, y: { lo: 0, hi: RF_E, label: lab.eggsAx }, cols, frame: 'designed', bestLabel: lab.expected };
    let hi = 40; for (const c of cols) hi = Math.max(hi, c.v || 0, c.best || 0); hi = Math.ceil(hi / 10) * 10;
    return { type: 'rf_rows', title: lab.tUnits, y: { lo: 0, hi, label: lab.units }, cols, frame: 'designed', fold: false, bestLabel: lab.best };
  },
  gainSpec(card) {   // L2: your share against mating time, with the search time to the left of zero; the curve and the tangent appear after the morning
    const s = this.sim.s, lab = this.content.labels, L = s.fem, over = s.phase === 'over' || s.phase === 'end', shown = s.i >= 3 || over || card, pm = s.i >= 3 && !over;
    const curve = [], tans = [];
    if (shown) { for (let t = 0; t <= 120; t += 4) curve.push([t, RF.dshare(t)]); }
    const tan = Tq => { const t = RF.tstar(Tq), y = RF.dshare(t), sl = y / (Tq + t); return { pts: [[-Tq, 0], [120, sl * (120 + Tq)]], at: [t, y] }; };
    if (shown) tans.push(tan(RF_D.T)); if (over || card) tans.push(tan(RF_D.Tpm));
    return { type: 'rf_gain', title: lab.tShare, x: { lo: -RF_D.T, hi: 120, label: lab.minutes }, y: { lo: 0, hi: 1, fmt: 'pct' }, pts: L.filter(F => F.t > 0).map(F => [F.t, F.x, F.T < 100 ? 1 : 0]),
      curve, tans, marks: [{ x: -RF_D.T, label: lab.searchM }].concat(pm || over || card ? [{ x: -RF_D.Tpm, label: '' }] : []), frame: 'designed', curveLabel: lab.fitted };
  },
  debrief() {   // the level card's chart: what you did solid, the best plan dashed (L2: the curve and both tangents)
    const s = this.sim.s; if (!s.whatif && RF_LV[s.level].dung) return this.gainSpec(true);
    return this.rowsSpec('units');
  }
};
V2.push(CH_RAFFLE_V2);

/* ---- this unit's chart types (registered guarded, like hk_hist): per-female rows of bars, and a gain curve with its tangent ---- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.rf_rows) LiveGraph.T.rf_rows = {
  lay(w, h, spec, T, c) { const n = (spec.cols || []).length || 1, G = wgXY(w, h, Object.assign({}, spec, { x: { lo: -1, hi: n - 0.5 } }), T, c, { xlo: -1, xhi: n - 0.5, ylo: 0, yhi: (spec.y && spec.y.hi) || 1, labels: [] }); G.nextX = null; return G; },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, cols = spec.cols || [], bw = Math.min(30, p.w / Math.max(1, cols.length) * 0.56);
    wgAxes(c, G, spec, T, { noX: true });
    cols.forEach((b, i) => {
      const x = G.X(i);
      if (b.cur) { c.fillStyle = wgRgba(I.text, 0.08); c.fillRect(x - bw * 0.9, p.y, bw * 1.8, p.h); }
      if (wgFin(b.v)) { const y = G.Y(Math.max(0, b.v)); c.fillStyle = I.text; c.fillRect(x - bw / 2, y, bw, p.y + p.h - y); }
      if (wgFin(b.best)) { const y = G.Y(Math.max(0, b.best)); c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = I.text; c.strokeRect(x - bw / 2 - 3, y, bw + 6, p.y + p.h - y); c.setLineDash([]); }
      if (wgFin(b.e)) { const y = G.Y(b.e); c.setLineDash([5, 3]); c.lineWidth = 2.5; c.strokeStyle = I.text; c.beginPath(); c.moveTo(x - bw * 0.85, y); c.lineTo(x + bw * 0.85, y); c.stroke(); c.setLineDash([]); }
      if (!T.compact || cols.length <= 8) wgText(c, b.label, x, p.y + p.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
    });
    if (!T.compact && cols.some(b => wgFin(b.best) || wgFin(b.e))) wgText(c, '- - ' + (spec.bestLabel || ''), p.x + p.w - 4, p.y + G.tk / 2 + 3, G.tk, I.text, { align: 'right', fam: 'b', wt: 600, halo: I.surface });
  },
  rows(spec) { return { head: ['female', 'yours', 'dashed'], rows: (spec.cols || []).map((b, i) => [String(i + 1) + ' (' + b.label + ')', wgFin(b.v) ? (Math.round(b.v * 10) / 10).toString() : '', wgFin(b.best) ? (Math.round(b.best * 10) / 10).toString() : wgFin(b.e) ? (Math.round(b.e * 10) / 10).toString() : '']) }; },
  say(spec) { return (spec.cols || []).filter(b => wgFin(b.v)).map(b => Math.round(b.v)).join(', '); }
};
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.rf_gain) LiveGraph.T.rf_gain = {
  lay(w, h, spec, T, c) { const G = wgXY(w, h, spec, T, c, { xlo: spec.x.lo, xhi: spec.x.hi, ylo: 0, yhi: 1, labels: [] }); G.nextX = null; return G; },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I; wgAxes(c, G, spec, T, { xticks: spec.x.lo < 0 ? [spec.x.lo, 0, 60, 120] : [0, 50, 100, 150] });
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip();
    c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.35); c.setLineDash([2, 3]);
    if (spec.x.lo < 0) { const x = G.X(0); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); }
    for (const m of spec.marks || []) { const x = G.X(m.x); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); }
    c.setLineDash([]);
    if (spec.curve && spec.curve.length) { c.setLineDash([6, 4]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.beginPath(); spec.curve.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.setLineDash([]); }
    (spec.tans || []).forEach((tn, k) => { c.lineWidth = 1.6 * T.k; c.strokeStyle = wgRgba(I.text, k ? 0.55 : 0.85); c.setLineDash(k ? [3, 3] : []); c.beginPath(); c.moveTo(G.X(tn.pts[0][0]), G.Y(tn.pts[0][1])); c.lineTo(G.X(tn.pts[1][0]), G.Y(tn.pts[1][1])); c.stroke(); c.setLineDash([]); wgDiamond(c, G.X(tn.at[0]), G.Y(tn.at[1]), 4 * T.k, I.text, I.surface, 1.5); });
    c.restore();
    for (const q of spec.pts || []) { c.fillStyle = q[2] ? I.surface : I.text; c.strokeStyle = I.text; c.lineWidth = 1.5; c.beginPath(); c.arc(G.X(q[0]), G.Y(q[1]), 4.5 * T.k, 0, TAU); c.fill(); c.stroke(); }
    if (!T.compact) { for (const m of spec.marks || []) if (m.label) wgText(c, m.label, G.X(m.x) + 4, p.y + p.h - G.tk / 2 - 3, G.tk, I.text2, { fam: 'b', wt: 600, halo: I.surface }); }
    if (!T.compact && spec.tans && spec.tans.length) { const a = spec.tans[0].at; wgText(c, Math.round(a[0]) + ' min', G.X(a[0]) + 6, G.Y(a[1]) + G.tk, G.tk, I.text, { fam: 'b', wt: 700, halo: I.surface }); }
    if (!T.compact && spec.curve && spec.curve.length && spec.curveLabel) { const q = spec.curve[spec.curve.length - 1]; wgText(c, spec.curveLabel, G.X(q[0]) - 4, G.Y(q[1]) + G.tk * 2.2, G.tk, I.text, { align: 'right', fam: 'b', wt: 600, halo: I.surface }); }
  },
  rows(spec) { return { head: ['minutes', 'share'], rows: (spec.pts || []).map(q => [String(Math.round(q[0])), Math.round(q[1] * 100) + '%']).concat((spec.curve || []).filter((q, i) => i % 3 === 0).map(q => [String(q[0]) + ' (curve)', Math.round(q[1] * 100) + '%'])) }; },
  say(spec) { return (spec.pts || []).map(q => Math.round(q[0]) + ' minutes, ' + Math.round(q[1] * 100) + '%').join('; '); }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.raffle = RF_TEXT.take;
  MODEL.raffle = 'A female dung fly stores sperm in three spermathecae, and each egg is fertilised by one stored sperm drawn at random. Levels add last-male displacement fitted to yellow dung flies, and a female who stores only some of each male’s sperm. Rivals and her bias are designed numbers.';
  RECALL.raffle = { q: 'Her stores hold 30 units of a rival’s sperm. You add 10. What share of her eggs do you expect?', opts: [['q', 'A quarter'], ['t', 'A third'], ['h', 'A half']], ans: 'q', why: 'A fair raffle: 10 ÷ (10 + 30) = ¼ of her eggs.' };
  BRIDGE.raffle = 'Why Sex? asked why genes are mixed at all. Here males compete even after mating, inside the female.';
  if (TRANSFER.raffle) delete TRANSFER.raffle;
}
