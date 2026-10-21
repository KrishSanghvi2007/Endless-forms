/* ================= v2/raffle.js: The Raffle (id 'raffle'), the Wave 2 rebuild of a favourite =================
   D1 §3.5, D5 §4 item 9, D6 (and its 21 Oct addendum: own world, own palette, opening card). A sunny cow pasture: you are a
   male yellow dung fly (Scathophaga stercoraria) on a cowpat, and each female's sperm store is a brass fairground raffle drum
   (role: a behaving animal). The second: HOLD to pour your tickets into her drum against one season's supply (or, on the
   dung pat, hold to mate). The minute: one female, ending in the draw, where each egg pulls one ticket and takes its father's
   pattern. Levels add one variable each: rivals already in her (the fair raffle); the chance of a male after you; last-male
   precedence and mating time (the loaded raffle, a marginal-value tangent); and a boss where her storage sets which tickets
   count (cryptic female choice), which inverts the unit's lesson.
   Headless sim (R(), Det only); stars read the expectation; juice from Sim.run's events only. Reuses ch3.js optimum(),
   generalised to risk and to her storage. */

const RF_E = 20, RF_X = 20, RF_B = 100;   // eggs per female, a later male's ejaculate, your supply (all designed)
// timers (s); rate: units a second while held (rateU in untimed mode); mins: copula minutes a second of holding (×N)
const RF_T = { arrive: 0.75, grace: 0.45, graceM: 0.3, egg: 0.085, leave: 0.6, later: 1.6, search: 1.6, pm: 1.9, end: 1.5, dry: 0.9, rate: 14, rateU: 6, delay: 0.25, mins: 10, minsU: 5, cap: 120 };
const RF_L1 = [0, 40, 20, 0];   // rival units for four of females 1, 2, 3, 5, 6 (shuffled by seed); female 4 holds 100 (five rivals), female 5 or 6 holds 60, so a call is always due
const RF_L2 = [[0, 0.1, 2], [0, 0.9, 2], [20, 0.1, 1], [20, 0.9, 1], [60, 0.1, 1], [60, 0.9, 1]];   // [rival units, chance of a later male, weight]
const RF_Q = RF_L2.map(a => ({ R: a[0], q: a[1], p: a[2] / 8 }));   // the hidden queue's distribution (what the planner knows)
// L3 displacement curve share(t) = a(1 − e^(−kt)): a and k fitted so share(36 min) = 0.80 (Parker 1970) and the tangent from
// −156.5 min (search and guarding, Parker 1978) touches at 41.4 min (Parker and Stuart 1976); tests/oracle_raffle.js re-derives both
const RF_D = { k: 0.0627036, a: 0.8934849, T: 156.5, Tpm: 40, n: 40, pocket: 4 };
const RF_L4 = [[20, 0.05, 1], [60, 1, 0.05], [40, 1, 1], [20, 1, 1], [60, 0.5, 1]];   // [rival units, share of yours she keeps, share of rivals' she keeps]; shown on her card
const RF_P4 = { R: 30, y: 0.5 };   // the boss's new female: she keeps half your tickets and all of the rival's → 60 units for half
const RF_ASK = { p1: { kind: 'y', lo: 0, hi: 20, tol: 2, step: 0.5 }, p2: { kind: 'y', lo: 0, hi: 20, tol: 2, step: 0.5 }, p3: { kind: 'x', lo: 0, hi: 120, tol: 6, step: 1 }, p4: { kind: 'x', lo: 0, hi: 150, tol: 8, step: 1 } };
const RF_LV = [{ n: 6, levers: ['later', 'many'] }, { n: 8, vis: 3, levers: ['norisk', 'sure'] }, { n: 6, dung: true, levers: ['scarce', 'quick'] }, { n: 5, her: true, levers: ['fair', 'choosy'] }];
// the world's paints (D6 addendum 7): meadow green, warm cowpat brown, fairground brass; tickets differ by luminance and pattern
const RF_C = { sky: '#CFE4EA', sky2: '#EEF2DA', hill: '#9DBB6A', hedge: '#4F6E31', grass: '#7FA350', grass2: '#6A9142', pat: '#6B4A2E', crust: '#86603A', patD: '#4A321D',
  brass: '#C99A2E', brassL: '#EED38A', brassD: '#7E5C17', wood: '#8A5A32', woodD: '#5E3B1F', red: '#B23A2E', cream: '#F4E8C8', glass: 'rgba(250,245,228,.9)', ink: '#1E1810',
  you: '#FBF3DC', youS: '#A3322A', halo: '#F3D27A', riv1: '#5A3B22', riv2: '#9DAE86', dot: '#2E3A22', egg: '#F2EBD6' };

const RF_TEXT = {
  intro: {
    game: 'You are a male yellow dung fly on a sunny cowpat. Females arrive one at a time, and your sperm must last them all.',
    biology: 'When a female mates with several males, their sperm compete for her eggs. How much to spend depends on rivals before you, rivals after you, and on her.',
    how: 'Hold anywhere to pour sperm tickets into her store, the brass drum, and let go to stop. Each egg then draws one ticket.'
  },
  firstWords: 'Hold to pour your tickets into her drum. Let go to stop. Each egg draws one ticket.',
  hud: {
    pourV: 'A virgin: no rival tickets yet. Hold to pour, let go to stop.',
    pourR: 'Rivals left {r} tickets in her. Hold to pour, let go to stop.',
    pour2: 'Rival tickets in her: {r}. Chance a male mates after you: {q}.',
    mate: 'Hold to mate: your tickets flush out his. Let go to leave.',
    copula: 'Mating for {m} minutes. Let go to leave her and search.',
    pour4: 'Her card shows what she keeps: his tickets on top, yours below.',
    dry: 'Your supply is empty. Her eggs go to the rivals.',
    draw: 'Her eggs draw their tickets. Tap to hurry.',
    later: 'Will another male mate with her after you?',
    search: 'You guard her while she lays, then search: {T} minutes.',
    pm: 'Afternoon: females arrive fast, so searching takes only 40 minutes.',
    p1: 'Before the draw: how many of her 20 eggs will be yours?',
    p2: 'On average, how many of her 20 eggs will be yours?',
    p3: 'Drag the marker: which mating time wins most eggs per hour?',
    p4: 'She keeps half your tickets, all 30 of his. Units to win half?',
    auto: 'What if? The best plan pours, with one thing changed.',
    over: 'The level is done.'
  },
  whispers: {
    jackpot: 'Jackpot! Every egg is yours.', dry: 'Your supply is empty!', came: 'A male after you. His tickets mix in.', nocame: 'No male came. Her eggs stay yours.',
    drag: 'Drag the marker first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No call this time.', flushed: 'Some flushed tickets were your own.',
    pocket: 'She is setting your tickets aside.', favour: 'She set the rivals’ tickets aside.', hold: 'Hold longer to pour more.', ff: 'Faster.'
  },
  labels: {
    yours: 'yours {n}', rivals: 'rivals {n}', supply: 'supply', pocket: 'her pocket', reach: 'out of reach', virgin: 'virgin', risk: '{q} after', mins: '{m} min',
    search: 'search {T} min', eggsAx: 'eggs', hidden: '?', morning: 'morning', afternoon: 'afternoon', pour: 'Pour', stop: 'Stop', done: 'Done', mate: 'Mate',
    leave: 'Leave', faster: 'Faster', rate: '{r} eggs/h', xN: '×600', fitted: '≈ fitted curve', lock: 'Lock in', jackpot: 'Jackpot!', pm: 'Afternoon', new4: 'New female',
    tEggs: 'Eggs won', tUnits: 'Units poured', tShare: 'Your share', tHalf: 'Half her eggs', tLaid: 'Eggs per female',
    female: 'female', units: 'units', minutes: 'minutes', share: 'share', you: 'you', best: 'best plan', planner: 'planner', expected: 'expected', tangent: 'best rate',
    half: 'half', searchM: 'search', sSupply: 'Supply left', sEggs: 'Eggs so far', sExp: 'Expected eggs', sRate: 'Eggs per hour', sMins: 'Last mating', sBest: 'Best plan'
  },
  panels: [],
  interesting: {
    virgins: 'You spent {v} units on virgins. With no male after you, a single ticket wins all her eggs.',
    dry: 'Your supply ran out before the last female, so her eggs all went to the rivals.',
    crowd: 'You poured {c} units into the most crowded drum. There each extra ticket bought only a sliver.',
    safe: 'The safe virgin got {v} units. With nine males in ten staying away, one ticket nearly always wins.',
    riskyCame: 'The risky virgin got only {v} units, and a male did come after you. His tickets took most eggs.',
    riskyLucky: 'The risky virgin got only {v} units. No male came this time, but nine times in ten one would.',
    short: 'Your morning matings averaged {m} minutes. Leaving early wastes the long search it took to find her.',
    long: 'Your morning matings averaged {m} minutes. Late minutes mostly flushed out your own tickets.',
    same: 'Your morning matings all lasted about {m} minutes. Varying them maps the curve better.',
    pocket: 'You poured {u} units into a female who set most of them aside. Her storage, not your supply, set your share.',
    favoured: 'One female set the rivals’ tickets aside. There a modest pour won most of her eggs.'
  },
  levers: { later: 'Males follow', many: 'Triple rivals', norisk: 'No later males', sure: 'Males always follow', scarce: 'Scarce females', quick: 'Quick search', fair: 'She keeps all', choosy: 'Very choosy' },
  whatifBody: {
    later: 'If a male may follow any female, half the time, each virgin gets {v} units, not 1. Rivals to come make virgins worth sperm.',
    many: 'With three times the rivals, the most crowded drum got {c} units and the least crowded {l}. Crowded drums pay back less.',
    norisk: 'With no later males, each virgin got 1 unit. The mated females got {d} units in all.',
    sure: 'If a male always follows, every virgin is a raffle too. The best plan gave virgins {v} units each on average.',
    scarce: 'When females are scarce and searching takes 400 minutes, the best mating lasts about {t} minutes. Each female is worth more time.',
    quick: 'When the next female is 20 minutes away, the best mating lasts about {t} minutes. Cheap searching makes leaving sooner pay.',
    fair: 'If she kept every ticket, the best plan would follow the rival counts alone and win {e} eggs.',
    choosy: 'If every female kept one of your tickets in ten, the best plan would win {e} eggs.'
  },
  take: 'Paternity is a raffle of tickets, but the raffle may be loaded, and the drum may be hers.',
  body: 'In a fair raffle your share is your tickets ÷ all tickets. Rivals to come make virgins worth sperm. Dung flies are a loaded raffle: the last male wins most eggs. When her storage sets which tickets count, the best pour follows her, not the rivals. You won {e} expected eggs; the best plan won {b}.',
  law: { title: 'The sperm raffle' },
  boss: { inverts: 'Until now more tickets meant more eggs. Here her storage sets which tickets count.' },
  stars: {
    discover: 'Win nearly the best plan’s eggs, in the raffle and in her drum.',
    predict: 'Call her eggs, or the best mating time, inside the band twice.',
    transfer: 'Solve a busy afternoon and a choosy new female.'
  },
  levelStars: [
    { discover: 'Win within one egg of the best plan’s expected eggs.', predict: 'Call her eggs within two of the expected number.' },
    { discover: 'Win 96% of the planner’s eggs, giving the risky virgin more.', predict: 'Call the risky virgin’s average eggs within two.' },
    { predict: 'Call the best mating time within six minutes.', transfer: 'Mate near the new best time in the busy afternoon.' },
    { discover: 'Win 97% of the best plan’s eggs, following what each female keeps.', transfer: 'Find the units that win half the new female’s eggs.' }
  ],
  levelTake: [
    'Your share is your tickets ÷ all tickets. With nobody after you, one ticket wins a virgin’s eggs.',
    'Rivals to come matter. A virgin likely to mate again is worth real sperm.',
    'Dung flies are a loaded raffle. The best mating time is where a line from the search touches the curve.'
  ],
  levelBody: [
    'You won {e} expected eggs; the best plan won {b}. It gave each virgin 1 unit and most to drums with a few rivals. The most crowded got less. That fall is the model’s prediction; in real animals it is weakly supported.',
    'You won {e} expected eggs; a planner that saw the same three cards won {b}. It gave the risky virgin {r} units and the safe one {v}.',
    'Your morning matings averaged {m} minutes; the best was about 41. With a 40-minute search the best fell to about 26. Your last two afternoon matings averaged {a}.'
  ],
  captions: {
    liveIn: '{s} units poured. Supply {l}.', liveLaid: 'She laid 20 eggs: {m} are yours.', liveCame: 'A male mated with her after you.', liveNo: 'No male came after you.',
    liveMin: 'Mating {m} minutes. Your share {p} percent.', liveAsk: 'Prediction open. Press P, then arrows and Enter.', livePocket: 'She set aside {k} of your {n} tickets.',
    mSupply: 'Units you can still pour this season.', mEggs: 'Eggs that drew your tickets.', mExp: 'Expected eggs from your pours so far.', mRate: 'Expected eggs per hour of mating and searching.',
    mBest: 'Expected eggs of the best plan, shown after the level.'
  },
  model: [
    { level: 0, simulated: 'Six females, each already holding 0 to 5 rivals’ ejaculates of 20 units. Every unit is one ticket. Each of her 20 eggs draws a ticket at random. Your expected share is your tickets ÷ all tickets.', simplification: 'A fair raffle: every sperm has the same chance. Rivals are fixed, so this is one male’s best plan, not an evolutionarily stable one. No male mates after you. Dung flies are not a fair raffle; see level 3.', params: [{ name: 'eggs per female', value: 20, tag: 'designed' }, { name: 'a rival’s ejaculate', value: '20 units', tag: 'designed' }, { name: 'your supply', value: '100 units', tag: 'designed' }], cannot: 'Sperm-limited females, sperm that differ in quality, or a supply that refills.', nature: 'Parker’s raffle models ask how a male should share a limited supply (Parker 1990). Males of many species spend more when rivals are present. Spending less when a drum is very crowded is predicted but weakly supported (Kelly and Jennions 2011).', contested: false, refs: ['parker1970', 'parker1990', 'kj2011'] },
    { level: 1, simulated: 'Eight females. Each card shows the rivals before you. It also shows the chance that a later male adds 20 units. You see three cards ahead. Half the queue are virgins.', simplification: 'The chance of a later male is known exactly, and he always brings 20 units. You are scored against a planner that sees the same three cards. It knows how often each kind of female turns up.', params: [{ name: 'chance of a later male', value: '1 or 9 in 10', tag: 'designed' }, { name: 'later male’s ejaculate', value: '20 units', tag: 'designed' }, { name: 'cards visible', value: 3, tag: 'designed' }, { name: 'your supply', value: '100 units', tag: 'designed' }], cannot: 'How a male could sense the risk, or a female who controls remating.', nature: 'In Parker’s risk models, males spend more as rivals become likelier (Parker 1990; Parker and colleagues 1997). This rise is well supported across species (Kelly and Jennions 2011). Prudent males can leave females short of sperm (Wedell and colleagues 2002).', contested: false, refs: ['parker1990', 'pbsg1997', 'kj2011', 'wgp2002'] },
    { level: 2, simulated: 'Each female arrives carrying an earlier male’s sperm. While you mate, your sperm displace stored sperm at random, yours included. Your share rises ever more slowly. After mating you guard her while she lays, then search.', simplification: 'The curve is fitted to two published numbers (≈). A 36-minute mating wins about 80% of eggs. With 156 minutes of guarding and searching, the best time is near 41. One earlier sperm in nine stays out of reach (designed).', params: [{ name: 'search and guarding', value: '156 min', tag: 'realistic', real: 'about 156 min (Parker 1978)' }, { name: 'last male’s share at 36 min', value: '80%', tag: 'realistic', real: 'about 80% (Parker 1970)' }, { name: 'afternoon search', value: '40 min', tag: 'designed' }, { name: 'minutes per second held', value: 10, tag: 'xN', real: 'one minute a minute' }], cannot: 'Takeovers by bigger males, or females that resist mating.', nature: 'Dung fly males mate for about 36 minutes. Parker’s model predicted about 41 (Parker 1978; Parker and Stuart 1976). Random displacement fits his sperm data (Parker and Simmons 1991). Later work asked how much of the displacement females control (Simmons and colleagues 1999).', contested: false, refs: ['parker1970b', 'ps1976', 'parker1978', 'psim1991', 'sps1999', 'charnov1976'] },
    { level: 3, simulated: 'Each female keeps a share of every male’s tickets in her drum. The rest go to a pocket she does not use for these eggs. Her card shows both shares.', simplification: 'Her bias is a fixed share per female (designed). In dung flies, female control works through how sperm are spread among her sperm stores, not a pocket.', params: [{ name: 'share of your tickets kept', value: '5% to 100%', tag: 'designed' }, { name: 'share of rivals’ tickets kept', value: '5% to 100%', tag: 'designed' }, { name: 'your supply', value: '100 units', tag: 'designed' }], cannot: 'Why a female might favour some males, or what it costs her.', nature: 'Female yellow dung flies influence how sperm are stored and used (Ward 1993, 2000; Hellriegel and Ward 1998). Female feral fowl eject the sperm of low-ranking males (Pizzari and Birkhead 2000). How common such cryptic female choice is remains debated (Birkhead 1998).', contested: true, refs: ['ward1993', 'ward2000', 'hw1998', 'hb2000', 'pb2000', 'eberhard1996', 'birkhead1998'] }
  ],
  why: {
    real: [
      'Geoff Parker’s work on yellow dung flies in the 1970s founded the study of sperm competition. The last male to mate fertilises about 80% of the eggs (Parker 1970). His raffle models ask how males should spend a limited supply (Parker 1990).',
      'Many males spend more sperm when rivals are likely (Kelly and Jennions 2011). Drosophila males that meet rivals mate for longer (Bretman and colleagues 2009). Spending less when competition is very high is predicted but weakly supported.',
      'Female yellow dung flies influence how sperm are stored and used (Ward 1993, 2000). Female feral fowl eject the sperm of low-ranking males (Pizzari and Birkhead 2000). How common such female control is remains debated (Birkhead 1998).'
    ],
    maths: [
      'Fair raffle: your share is s ÷ (s + R) for your s units against R. One more unit gains R ÷ (s + R)². The best plan equalises that gain across females, so s = √(R/λ) − R, a hump in R. A virgin with no later male takes one ticket.',
      'Risk: with chance q a later male adds X units. Your expected share is (1 − q)·s/(s + R) + q·s/(s + R + X). A risky virgin now pays back sperm.',
      'Precedence: your share after t minutes is a(1 − e^(−kt)). Eggs per minute are E·share ÷ (T + t). The best t is where a line from −T touches the curve. Her control: share = y·s ÷ (y·s + z·R), so R acts like z·R ÷ y.'
    ]
  }
};

/* ---------- the model's maths: pure, Det-safe (+ − × ÷ √ and Det.exp only), shared by the sim, the stars, the bots and the oracle ---------- */
const RF = {
  share(F, s) {   // expected share of her eggs for s units: a fair raffle, a later male with chance q, her storage (y yours, z rivals')
    if (!(s > 0)) return 0; const K = (F.y == null ? 1 : F.y) * s, Rr = (F.z == null ? 1 : F.z) * F.R, q = F.q || 0;
    return (1 - q) * K / (K + Rr) + (q ? q * K / (K + Rr + RF_X) : 0);
  },
  real(F, s) { if (!(s > 0)) return 0; const K = (F.y == null ? 1 : F.y) * s, Rr = (F.z == null ? 1 : F.z) * F.R + (F.later ? RF_X : 0); return K / (K + Rr); },   // the realised drum
  marg(F, s) {   // eggs gained by one more unit
    const y = F.y == null ? 1 : F.y, Rr = (F.z == null ? 1 : F.z) * F.R, q = F.q || 0, a = y * s + Rr, b = a + RF_X;
    return RF_E * ((1 - q) * y * Rr / (a * a) + (q ? q * y * (Rr + RF_X) / (b * b) : 0));
  },
  at(F, lam, cap) {   // the spend where the marginal gain falls to λ (at least 1 unit)
    if (cap <= 1 || this.marg(F, 1) <= lam) return 1; if (this.marg(F, cap) >= lam) return cap;
    let lo = 1, hi = cap; for (let k = 0; k < 48; k++) { const m = (lo + hi) / 2; if (this.marg(F, m) > lam) lo = m; else hi = m; } return (lo + hi) / 2;
  },
  // Lagrange (legacy optimum(), generalised): spends for fs summing to B; hid counts hidden females, each taken at the queue's expectation
  plan(fs, B, hid, Q) {
    hid = hid || 0; Q = Q || RF_Q; if (!fs.length) return []; if (B <= 0) return fs.map(() => 0);
    const tot = lam => { let t = 0; for (const F of fs) t += this.at(F, lam, B); if (hid) for (const T of Q) t += hid * T.p * this.at(T, lam, B); return t; };
    let lo = 1e-9, hi = 1e3; if (tot(lo) <= B) return fs.map(F => this.at(F, lo, B));
    for (let k = 0; k < 90; k++) { const m = Math.sqrt(lo * hi); if (tot(m) > B) lo = m; else hi = m; }
    return fs.map(F => this.at(F, hi, B));
  },
  eggs(fs, ss) { let e = 0; fs.forEach((F, i) => { e += RF_E * this.share(F, ss[i]); }); return e; },
  best(fs) { return this.plan(fs, RF_B); },
  planner(fs) {   // L2: at each female, the best plan over the three visible cards and the expected hidden queue; spent on the queue as it came
    let left = RF_B; const out = [];
    for (let i = 0; i < fs.length; i++) {
      const vis = fs.slice(i, i + 3), hid = Math.max(0, fs.length - i - 3);
      let s = i === fs.length - 1 ? left : this.plan(vis, left, hid)[0]; s = Math.max(Math.min(1, left), Math.min(left, s)); out.push(s); left -= s;
    }
    return out;
  },
  dshare(t) { return t > 0 ? RF_D.a * (1 - Det.exp(-RF_D.k * t)) : 0; },   // L3: your share of her store after t minutes
  tstar(T) {   // L3: the mating time where the line from (−T, 0) touches the curve (marginal value theorem)
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
    X: { v: RF_X, tag: 'designed', min: 10, max: 40, label: 'a later male’s ejaculate' },
    T: { v: RF_D.T, tag: 'realistic', min: 20, max: 400, real: 'about 156 min (Parker 1978)', label: 'search and guarding' },
    mins: { v: RF_T.mins, tag: 'xN', min: 2, max: 20, real: 'one minute a minute', label: 'mating minutes a second' }
  },
  levels: [
    { name: 'The fair raffle', adds: 'rival tickets already in her', codes: ['E4'], minutes: 1.5 },
    { name: 'Who comes next?', adds: 'the chance of a male after you', codes: ['E4'], minutes: 2 },
    { name: 'The loaded raffle', adds: 'last-male sperm displacement', codes: ['E4'], minutes: 2 },
    { name: 'Her drum', adds: 'her control of which tickets count', codes: ['E4', 'E3'], minutes: 1.5 }
  ],
  keys: { Space: 'hold to pour', ArrowUp: 'pour one more', Enter: 'done', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why might a virgin get more sperm than a mated female, and when should she get less?', 'In dung flies, who controls paternity: the last male, the female, or both?', 'This model makes every rival equal and every risk known. Which missing piece would most change the best plan?'], pool: 'trace' },
  starTraits: [],
  encodings: [   // tickets: yours cream with red stripes and a gold halo; rivals solid umber or dotted sage (luminance and pattern, never hue alone)
    { k: 'yours', rgb: [251, 243, 220], channels: ['luminance', 'pattern'] },
    { k: 'rival', rgb: [90, 59, 34], channels: ['luminance'] },
    { k: 'rival2', rgb: [157, 174, 134], channels: ['pattern', 'luminance'] }
  ],
  // the unit's stars across levels (API_v2 §14.1; D1 G10): Discover in two of L1, L2, L4; Predict in two of L1–L3; Transfer both the afternoon and the boss
  unitStars(lv) {
    const has = (i, b) => !!((lv[i] || 0) & b), d = [0, 1, 3].filter(i => has(i, 1)).length, p = [0, 1, 2].filter(i => has(i, 2)).length;
    return (d >= 2 ? 1 : 0) | (p >= 2 ? 2 : 0) | (has(2, 4) && has(3, 4) ? 4 : 0);
  },

  /* ================= headless simulation (API_v2 §9.3): R(), Det only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    reset(level, o) {
      o = o || {};
      if (o.thaw) { this.restore(o.thaw.snap); const s = this.s; s.whatif = o.thaw.lever || null; s.auto = true; s.log = []; s.ask = null; this.lever(s); return; }
      const s = { level, phase: 'arrive', pt: 0, acc: 0, t: 0, i: 0, left: RF_B, unt: false, hold: false, held: 0, ff: 1, fem: [], ask: null, pred: {}, nocall: {}, asks: [], eggI: 0, got: 0, mins: 0, dry: false, whatif: null, auto: false, risky: -1, safe: -1, log: [] };
      if (level === 0) { const r = this.shuffle(RF_L1.slice()), k = R() < 0.5 ? 4 : 5, a = []; for (let i = 0; i < 6; i++) a.push(i === 3 ? 100 : i === k ? 60 : r.shift()); s.fem = a.map(R0 => ({ R: R0 })); }
      else if (level === 1) {
        for (let i = 0; i < 8; i++) { let u = R() * 8, k = 0; while (k < RF_L2.length - 1 && u >= RF_L2[k][2]) { u -= RF_L2[k][2]; k++; } s.fem.push({ R: RF_L2[k][0], q: RF_L2[k][1] }); }
        const a = 1 + Math.floor(R() * 2); let b = Math.floor(R() * 4); if (b === a) b = 3;   // a risky virgin early (the ask) and a safe one among the first four
        s.fem[a] = { R: 0, q: 0.9 }; s.fem[b] = { R: 0, q: 0.1 }; s.risky = a; s.safe = b;
      } else if (level === 2) { for (let i = 0; i < 6; i++) s.fem.push({ R: RF_D.n, T: i < 3 ? RF_D.T : RF_D.Tpm }); }
      else s.fem = this.shuffle(RF_L4.map(a => a.slice())).map(a => ({ R: a[0], y: a[1], z: a[2] }));
      for (const F of s.fem) { F.s = 0; F.eggs = -1; }
      this.s = s;
    },
    lever(s) {   // What if?: rerun the level from its start with one thing changed; the best plan pours
      const k = s.whatif, L = s.fem;
      if (k === 'later') L.forEach(F => { F.q = 0.5; }); else if (k === 'many') L.forEach(F => { F.R *= 3; });
      else if (k === 'norisk') L.forEach(F => { F.q = 0; }); else if (k === 'sure') L.forEach(F => { F.q = 1; });
      else if (k === 'scarce') L.forEach(F => { F.T = 400; }); else if (k === 'quick') L.forEach(F => { F.T = 20; });
      else if (k === 'fair') L.forEach(F => { F.y = 1; F.z = 1; }); else if (k === 'choosy') L.forEach(F => { F.y = 0.1; });
    },
    cur(s) { return s.fem[Math.min(s.i, s.fem.length - 1)]; },
    // ---- pouring (L1, L2, L4) and mating (L3) ----
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
      if (!s.auto && ((s.level === 0 && this.askHere(s)) || (s.level === 1 && s.i === s.risky))) { this.openAsk(s, ev, s.level === 0 ? 'p1' : 'p2'); return; }
      this.afterShut(s, ev);
    },
    askHere(s) {   // L1 asks once, from female 4 on, at the first mated female whose answer is neither near-certain nor half, else at the last mated one
      if (s.asks.length || s.i < 3) return false; const F = this.cur(s); if (!(F.R > 0)) return false;
      return this.real1(F) || !s.fem.slice(s.i + 1).some(G => G.R > 0);
    },
    real1(F) { const e = RF_E * RF.share(F, F.s); return e >= 3 && e <= RF_E - 3 && Math.abs(e - RF_E / 2) > RF_ASK.p1.tol; },   // a near-certain answer (one ticket against 100), or one a lazy 'half' would hit, counts for nothing
    afterShut(s, ev) {
      if (s.level === 1) { const F = this.cur(s); F.later = R() < F.q; s.phase = 'later'; s.pt = 0; ev.push({ k: 'latergo', came: F.later }); }
      else this.startDraw(s, ev);
    },
    openAsk(s, ev, id) {
      if (id === 'p1') s.p1i = s.i;
      const A = RF_ASK[id]; s.ask = { id, kind: A.kind, lo: A.lo, hi: A.hi, tol: A.tol, at: A.kind === 'y' ? s.i : null }; s.asks.push(id); s.phase = 'ask'; s.pt = 0;
      ev.push({ k: 'ask', id });
    },
    afterAsk(s, ev) {
      const id = s.asks[s.asks.length - 1];
      if (id === 'p1') this.startDraw(s, ev); else if (id === 'p2') this.afterShut(s, ev);
      else if (id === 'p3') { s.phase = 'pm'; s.pt = 0; ev.push({ k: 'pm' }); }
      else { s.phase = 'end'; s.pt = 0; }
    },
    startDraw(s, ev) {
      const F = this.cur(s), sh = RF_LV[s.level].dung ? F.x : RF.real(F, F.s); F.draws = [];
      for (let j = 0; j < RF_E; j++) F.draws.push(R() < sh ? 1 : 0);
      s.eggI = 0; s.acc = 0; s.ff = s.auto ? 3 : 1; s.phase = 'draw'; s.pt = 0; ev.push({ k: 'draw', i: s.i });
    },
    next(s, ev) {
      s.i++; s.mins = 0; s.ff = 1; s.held = 0; s.hold = false; s.pt = 0; s.acc = 0;
      const L = RF_LV[s.level];
      if (L.dung && s.i === 3 && !s.auto) { this.openAsk(s, ev, 'p3'); return; }
      if (s.i >= s.fem.length) { if (L.her && !s.auto) this.openAsk(s, ev, 'p4'); else s.phase = 'end'; return; }
      s.phase = 'arrive'; ev.push({ k: 'arrive', i: s.i });
    },
    autoPour(s, ev) {   // What if?: the best plan with every card visible pours (or mates for the best time) after a short beat
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
        else if (!L.dung && s.left <= 0 && s.pt >= RF_T.dry) this.shut(s, ev);   // nothing left to pour: she mates without you
      }
      else if (s.phase === 'close') { if (s.pt >= (L.dung ? RF_T.graceM : RF_T.grace)) this.shut(s, ev); }
      else if (s.phase === 'ask') { if (!s.ask) this.afterAsk(s, ev); }
      else if (s.phase === 'later') { if (s.pt >= RF_T.later) { ev.push({ k: 'later', came: !!F.later }); this.startDraw(s, ev); } }
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
          if (!L.dung && F.s < 1) this.add(s, F, 1, ev);   // a tap pours the smallest ejaculate: one unit, within the frame
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
    expect(s, id) {   // what each call is scored against (never the realised draw)
      if (id === 'p1') { const F = s.fem[s.p1i]; return F ? RF_E * RF.share(F, F.s) : null; }
      if (id === 'p2') { const F = s.fem[s.risky]; return RF_E * RF.share(F, F.s); }
      if (id === 'p3') return RF.tstar(RF_D.T);
      if (id === 'p4') return RF_P4.R / RF_P4.y;
      return null;
    },
    hit(s, id) { const v = s.pred[id], e = this.expect(s, id); return v != null && e != null && Math.abs(v - e) <= RF_ASK[id].tol + 1e-9; },
    // L2's call counts only when "no male after her" (all eggs on your share without him) would miss
    realP2(s) { const F = s.fem[s.risky]; if (!F || !(F.s > 0)) return false; return Math.abs(this.expect(s, 'p2') - RF_E * F.s / (F.s + F.R)) >= RF_ASK.p2.tol; },
    expEggs(s) { if (RF_LV[s.level].dung) { let e = 0; for (const F of s.fem) e += RF_E * (F.x || 0); return e; } return RF.eggs(s.fem, s.fem.map(F => F.s)); },
    bestEggs(s) { const L = s.fem; if (s.level === 1) return RF.eggs(L, RF.planner(L)); if (s.level === 2) { let e = 0; for (const F of L) e += RF_E * RF.dshare(RF.tstar(F.T)); return e; } return RF.eggs(L, RF.best(L)); },
    bestPlan(s) { return s.level === 1 ? RF.planner(s.fem) : s.level === 2 ? s.fem.map(F => RF.tstar(F.T)) : RF.best(s.fem); },
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
      if (n === 1) { const r = L[s.risky], f = L[s.safe]; if (f.s >= 10) return 'safe'; if (r.s < 5) return r.later ? 'riskyCame' : 'riskyLucky'; if (L.some(F => F.s <= 0)) return 'dry'; return null; }
      if (n === 2) { const m = L.slice(0, 3).map(F => F.t || 0), mean = (m[0] + m[1] + m[2]) / 3; if (mean < 22) return 'short'; if (mean > 70) return 'long'; if (Math.max(...m) - Math.min(...m) < 4) return 'same'; return null; }
      for (const F of L) if (F.y <= 0.2 && F.s >= 10) return 'pocket';
      if (L.some(F => F.z <= 0.15 && F.s > 0 && F.s <= 24 && RF.share(F, F.s) >= 0.75)) return 'favoured';
      return null;
    },
    iVars(s) {   // the numbers an Interesting result names, from this run
      const L = s.fem, n = s.level; let v = 0, u = 0; const r1 = x => Math.round(x);
      if (n === 0) { for (const F of L) if (!F.R) v += F.s; return { v: r1(v), c: r1(L[3].s) }; }
      if (n === 1) { const sf = L[s.safe], rk = L[s.risky]; return { v: r1(sf.s >= 10 ? sf.s : rk.s) }; }
      if (n === 2) return { m: r1(this.amMean(s) || 0) };
      for (const F of L) if (F.y <= 0.2) u = Math.max(u, F.s); return { u: r1(u) };
    },
    wiVars(s) {   // the What if? card's numbers, from the run that just happened
      const L = s.fem, v = L.filter(F => !F.R), avg = a => a.length ? a.reduce((x, F) => x + F.s, 0) / a.length : 0, sorted = L.slice().sort((a, b) => b.R - a.R);
      return { v: Math.round(avg(v)), c: Math.round(sorted[0].s), l: Math.round(sorted[sorted.length - 1].s), d: Math.round(L.filter(F => F.R).reduce((x, F) => x + F.s, 0)), t: Math.round(L[0].t || 0), e: Math.round(this.expEggs(s) * 10) / 10 };
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
    pourTo(s, want) {   // pour until this female holds `want` units, then mate
      const F = this.cur(s), need = Math.min(s.left, want) - F.s;
      if (need >= 1 && s.left >= 1) return { k: 'add', n: Math.min(40, Math.floor(need)) };
      return { k: 'mate' };
    },
    fairPlan(s) {   // the L1 rule everywhere: a fair raffle over what is visible, ignoring later males and her storage
      const L = s.fem.slice(s.i, RF_LV[s.level].vis ? s.i + 3 : s.fem.length).map(F => ({ R: F.R })), hid = RF_LV[s.level].vis ? Math.max(0, s.fem.length - s.i - 3) : 0;
      return RF.plan(L, s.left, hid, RF_Q.map(T => ({ R: T.R, p: T.p })))[0];
    },
    expertPlan(s) {   // what a skilled player can do: the planner (L2), full information (L1, and L4 where her card shows what she keeps)
      const F = this.cur(s);
      if (s.level === 1) { const vis = s.fem.slice(s.i, s.i + 3), hid = Math.max(0, s.fem.length - s.i - 3); return s.i === s.fem.length - 1 ? s.left : RF.plan(vis, s.left, hid)[0]; }
      return RF.plan(s.fem.slice(s.i), s.left + F.s)[0];
    },
    bots: {
      alwaysA(s, acts) {   // everything early: the biggest pours, the longest matings, the top of every axis
        if (acts.length && acts[0].k === 'predict') return acts[acts.length - 1];
        if (!acts.length) return null; const S = CH_RAFFLE_V2.sim;
        if (RF_LV[s.level].dung) return s.mins < 100 ? { k: 'add', n: 20 } : { k: 'mate' };
        return S.pourTo(s, 60);
      },
      alwaysB(s, acts) { if (acts.length && acts[0].k === 'predict') return acts[0]; return acts.length ? { k: 'mate' } : null; },   // a single ticket, a one-minute mating, the bottom of every axis
      greedy(s, acts) {   // the fair-raffle rule on what it sees; calls the fair-raffle answer; leaves a mating once it holds half her store
        const S = CH_RAFFLE_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') {
          const id = s.ask.id, F = id === 'p1' ? s.fem[s.p1i] : id === 'p2' ? s.fem[s.risky] : null;
          if (F) return S.near(acts, RF_E * F.s / (F.s + F.R)); if (id === 'p4') return S.near(acts, RF_P4.R);
          const m = s.fem.slice(0, 3).map(G => G.t || 0); return S.near(acts, (m[0] + m[1] + m[2]) / 3);
        }
        if (RF_LV[s.level].dung) return RF.dshare(s.mins) < 0.5 ? { k: 'add', n: 5 } : { k: 'mate' };
        return S.pourTo(s, Math.max(1, Math.round(S.fairPlan(s))));
      },
      threshold(s, acts) {   // a fixed rule of thumb: 15 units for a mated female, 2 for a virgin, 30-minute matings; calls the middle
        if (!acts.length) return null; if (acts[0].k === 'predict') { const A = RF_ASK[s.ask.id]; return CH_RAFFLE_V2.sim.near(acts, (A.lo + A.hi) / 2); }
        if (RF_LV[s.level].dung) return s.mins < 30 ? { k: 'add', n: 5 } : { k: 'mate' };
        return CH_RAFFLE_V2.sim.pourTo(s, CH_RAFFLE_V2.sim.cur(s).R ? 15 : 2);
      },
      even(s, acts) {   // an even split and perfect calls: shows Predict without Discover
        const S = CH_RAFFLE_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, S.expect(s, s.ask.id));
        if (RF_LV[s.level].dung) return s.mins < 41 ? { k: 'add', n: 5 } : { k: 'mate' };
        return S.pourTo(s, Math.round(RF_B / s.fem.length));
      },
      noChange(s, acts) {   // pours by the fair rule and calls as if nothing beyond the drum mattered (no later male, no bias, its own habit)
        const S = CH_RAFFLE_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') { const id = s.ask.id; return S.near(acts, id === 'p2' ? RF_E : id === 'p4' ? RF_P4.R : id === 'p3' ? 20 : RF_E / 2); }
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
      const S = CH_RAFFLE_V2.sim, e = S.expEggs(s);
      if (n === 0) return e >= S.bestEggs(s) - 1;   // within one egg of the best plan (an even split loses 6.6)
      if (n === 1) return e >= 0.96 * S.bestEggs(s) && s.fem[s.risky].s >= s.fem[s.safe].s + 3;   // and the risk shaped the pour
      if (n === 3) return e >= 0.97 * S.bestEggs(s);   // her card shows what she keeps, so the best plan is what you could see; the fair-raffle rule wins 93%
      return false;
    },
    predict: (s, n) => { const S = CH_RAFFLE_V2.sim; return (n === 0 && S.hit(s, 'p1') && S.real1(s.fem[s.p1i])) || (n === 1 && S.hit(s, 'p2') && S.realP2(s)) || (n === 2 && S.hit(s, 'p3')); },
    transfer: (s, n) => { const S = CH_RAFFLE_V2.sim; if (n === 2) { const m = S.pmMean(s), a = S.amMean(s); return m != null && a != null && a - m >= 6 && Math.abs(m - RF.tstar(RF_D.Tpm)) <= 6; } return n === 3 && S.hit(s, 'p4'); }   // the afternoon: shorter than your mornings, and near the new best time
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–12 expected eggs ×4 · 13–19 the call (scaled to 0–127) · 20–29 the best plan's eggs ×4
  resultBits(s, level) {
    const S = this.sim, id = ['p1', 'p2', 'p3', 'p4'][level], A = RF_ASK[id], v = s.pred[id] == null ? 0 : Math.round((s.pred[id] - A.lo) / (A.hi - A.lo) * 127);
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
    this.v = { t: 0, tk: [], order: [], fly: [], gone: [], spin: 0, spinV: 0, lit: 0, press: null, kPress: false, latch: false, banner: null, sig: '', bgSig: '', eggs: [], eggT: [], laterT: -1, laterCame: false, lastPour: 0, tube: [], lastIn: 0, flushSaid: false, clock: 0 };
    this.resetEggs(); this.layout(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const s = this.sim.s, name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(1000, ms + 300) }; });
    if (!o.thaw && typeof Ghost !== 'undefined') {   // the hand demonstrates the hold until the first pour (or the first mating)
      const G = () => this.geo();
      if (n === 0) Ghost.show({ verb: 'pour', key: ' ', at: () => [G().cx, G().cy], until: () => this.sim.s.fem[0].s > 0 || this.sim.s.i > 0 });
      if (n === 2) Ghost.show({ verb: 'hold', key: ' ', at: () => [G().pair.x, G().pair.y], until: () => this.sim.s.mins > 0 || this.sim.s.i > 0 });
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
    const avail = patY - (top + cardH) - 22, Rd = Math.round(Math.max(56, Math.min(W * 0.3, avail * 0.45, 230))), cx = Math.round(W * 0.47), cy = Math.round(top + cardH + 16 + Rd);
    const tw = Math.max(10, Math.round(Rd * 0.14)), th = Math.max(6, Math.round(tw * 0.58)), S = Math.max(52, Math.min(120, Rd * 0.74));
    const g = { k, W, H, top, cardH, patY, patH, Rd, cx, cy, tw, th, S,
      gauge: { x: Math.min(W - 22, cx + Rd + Math.max(34, W * 0.08)), y0: cy - Rd * 0.5, y1: cy + Rd * 0.55, w: Math.max(14, Math.round(Rd * 0.13)) },
      pocket: { x: cx + Rd * 0.8, y: cy + Rd * 0.86, r: Math.round(Rd * 0.36) },
      hatch: { x: cx - Rd * 0.42, y: cy - Rd * 0.9 }, gate: { x: cx, y: cy + Rd + 4 },
      pair: { x: Math.round(Math.max(S * 0.75, W * 0.19)), y: Math.round(patY + patH * 0.42) },
      eggs: { x0: W * 0.43, x1: W * 0.96, y0: patY + patH * 0.36, y1: patY + patH * 0.7, r: Math.max(5, Math.min(9, W * 0.55 / 10 * 0.3)) } };
    g.slots = this.slots(g); this._g = g; return g;
  },
  slots(g) {   // ticket rest positions inside the drum, filled from the bottom up (a pile), centred
    const out = [], rr = g.Rd - g.tw * 0.9, sx = g.tw * 1.08, sy = g.th * 1.3;
    for (let row = 0; ; row++) {
      const y = g.cy + rr - g.th * 0.6 - row * sy; if (y < g.cy - rr + g.th) break;
      const half = Math.sqrt(Math.max(0, rr * rr - (y - g.cy) * (y - g.cy))) - g.tw * 0.6, off = row % 2 ? sx / 2 : 0, xs = [];
      for (let x = g.cx - half + off; x <= g.cx + half; x += sx) xs.push(x);
      xs.sort((a, b) => Math.abs(a - g.cx) - Math.abs(b - g.cx)); for (const x of xs) out.push([x, y]);
    }
    return out;
  },
  layout() { this._g = null; const g = this.geo(); this.bakeTickets(g); this.v.bgSig = ''; },
  cardXY(i, g) { const n = this.sim.s.fem.length, gap = 6, w = Math.min(70, (g.W - 16 - gap * (n - 1)) / n), x0 = (g.W - (w * n + gap * (n - 1))) / 2; return { x: x0 + i * (w + gap), y: g.top, w, h: g.cardH }; },
  eggXY(j, g) { const E = g.eggs, col = j % 10, row = Math.floor(j / 10); return [E.x0 + (E.x1 - E.x0) * (col + 0.5) / 10, row ? E.y1 : E.y0]; },

  /* ---------- tickets: baked sprites; the drum's contents follow the sim (counts), the motion is cosmetic ---------- */
  bakeTickets(g) {
    const d = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1), w = g.tw, h = g.th, C = RF_C; this.spr = [];
    for (let o = 0; o < 3; o++) {
      const cv = mkCanvas((w + 6) * d, (h + 6) * d), c = cv.getContext('2d'); c.scale(d, d); c.translate(3, 3);
      if (o === 0) { c.fillStyle = C.halo; this.rr(c, -2, -2, w + 4, h + 4, 3); c.fill(); }   // yours: a gold halo
      c.fillStyle = o === 0 ? C.you : o === 1 ? C.riv1 : C.riv2; this.rr(c, 0, 0, w, h, 2); c.fill();
      c.save(); this.rr(c, 0, 0, w, h, 2); c.clip();
      if (o === 0) { c.strokeStyle = C.youS; c.lineWidth = Math.max(1.4, h * 0.22); for (let x = -h; x < w + h; x += h * 0.9) { c.beginPath(); c.moveTo(x, h); c.lineTo(x + h, 0); c.stroke(); } }
      if (o === 2) { c.fillStyle = C.dot; for (let x = 2; x < w; x += 3.4) for (let y = 1.8; y < h; y += 3) { c.beginPath(); c.arc(x, y, 0.9, 0, TAU); c.fill(); } }
      c.restore(); c.lineWidth = 1; c.strokeStyle = C.ink; this.rr(c, 0.5, 0.5, w - 1, h - 1, 2); c.stroke();
      cv.cw = w + 6; cv.ch = h + 6; this.spr.push(cv);
    }
  },
  rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
  style(o) { return o === 0 ? 0 : o % 2 ? 1 : 2; },   // owner → sprite: yours, then rivals alternate solid umber / dotted sage
  target() {   // what the drum and her pocket hold now, by owner (0 yours; 1–5 rivals before you; 6 the later male; 8 the earlier male in L3)
    const s = this.sim.s, F = this.sim.cur(s), dr = {}, pk = {}, ph = s.phase, n = s.level;
    if (ph === 'leave' || ph === 'end' || ph === 'over' || ph === 'pm' || (ph === 'ask' && (s.ask && (s.ask.id === 'p3' || s.ask.id === 'p4')))) return { dr, pk };
    if (n === 2) {
      const mine = ph === 'arrive' ? 0 : Math.round(RF_D.n * (F.x != null && ph !== 'pour' && ph !== 'close' ? F.x : RF.dshare(s.mins)));
      dr[8] = RF_D.n - RF_D.pocket - mine; pk[8] = RF_D.pocket; dr[0] = mine; return { dr, pk };
    }
    const k = Math.round(F.R / RF_X), z = F.z == null ? 1 : F.z, y = F.y == null ? 1 : F.y;
    for (let r = 1; r <= k; r++) { const kept = Math.round(RF_X * z); dr[r] = kept; if (RF_X - kept) pk[r] = RF_X - kept; }
    const u = ph === 'arrive' ? 0 : Math.floor(F.s + 1e-9), ky = Math.round(u * y); dr[0] = ky; if (u - ky) pk[0] = u - ky;
    if (n === 1 && F.later && (ph === 'draw' || (ph === 'later' && this.v.laterT > 0.55))) dr[6] = RF_X;
    return { dr, pk };
  },
  sync(dt) {   // reconcile the ticket sprites with target(): new tickets drop in at the hatch, removed ones fall out of the gate
    const g = this.geo(), v = this.v, T = this.target(), rnd = () => Fx.rnd();   // cosmetic
    for (const where of ['dr', 'pk']) {
      const want = T[where], have = {};
      for (const t of v.tk) if (t.w === where) have[t.o] = (have[t.o] || 0) + 1;
      for (const o in have) { let extra = have[o] - (want[o] || 0); for (let i = v.tk.length - 1; i >= 0 && extra > 0; i--) { const t = v.tk[i]; if (t.w === where && t.o === +o) { this.drop(t, i); extra--; } } }
      for (const o in want) {
        const add = want[o] - (have[o] || 0);
        for (let i = 0; i < add; i++) {
          const t = { o: +o, w: where, x: g.hatch.x + (rnd() - 0.5) * 10, y: g.hatch.y - 6 - i * 3, a: (rnd() - 0.5) * 1.2, va: (rnd() - 0.5) * 6, seed: rnd() };
          if (where === 'pk') { t.x = g.pocket.x; t.y = g.pocket.y - g.pocket.r - 8 - i * 2; }
          v.tk.push(t); if (where === 'dr') v.order.splice(Math.floor(rnd() * (v.order.length + 1)), 0, t);   // mixed in at random: a raffle
        }
      }
    }
    // ease each ticket towards its slot; the pile rotates with the drum while it spins
    const sl = g.slots, pr = g.pocket, k = Math.min(1, dt * 9), sp = v.spin;
    v.order.forEach((t, i) => {
      let p = sl[Math.min(i, sl.length - 1)]; if (i >= sl.length) p = [g.cx + (t.seed - 0.5) * g.Rd, g.cy + (t.seed * 7 % 1 - 0.5) * g.Rd];
      let x = p[0], y = p[1];
      if (v.spinV > 0.2) { const dx = x - g.cx, dy = y - g.cy, f = 0.55 + 0.45 * t.seed; x = g.cx + (dx * Det.cos(sp * f) - dy * Det.sin(sp * f)); y = g.cy + (dx * Det.sin(sp * f) + dy * Det.cos(sp * f)); }
      t.x += (x - t.x) * k; t.y += (y - t.y) * k; t.a += (t.va * (v.spinV > 0.2 ? 1 : 0.1)) * dt;
    });
    if (!this._ps || this._ps.k !== g.k) {   // pocket rest positions: a small pile of half-size tickets
      const ps = [], sx = g.tw * 0.74, sy = g.th * 0.92, rr = pr.r - g.tw * 0.45;
      for (let row = 0; row < 40; row++) { const y = pr.y + rr - row * sy; if (y < pr.y - rr) break; const half = Math.sqrt(Math.max(0, rr * rr - (y - pr.y) * (y - pr.y))), off = row % 2 ? sx / 2 : 0; for (let x = pr.x - half + off; x <= pr.x + half; x += sx) ps.push([x, y]); }
      this._ps = { k: g.k, ps };
    }
    let pi = 0; for (const t of v.tk) if (t.w === 'pk') { const q = this._ps.ps[Math.min(pi, this._ps.ps.length - 1)]; pi++; t.x += (q[0] - t.x) * k; t.y += (q[1] - t.y) * k; }
    for (let i = v.gone.length - 1; i >= 0; i--) { const t = v.gone[i]; t.vy += 900 * dt; t.x += t.vx * dt; t.y += t.vy * dt; t.a += t.va * dt; t.life -= dt; if (t.life <= 0 || t.y > g.H + 20) v.gone.splice(i, 1); }
  },
  drop(t, i) {   // a ticket leaves: out of the gate and into the grass
    const v = this.v, g = this.geo(); v.tk.splice(i, 1); const j = v.order.indexOf(t); if (j >= 0) v.order.splice(j, 1);
    if (v.gone.length < 80) v.gone.push({ o: t.o, x: t.w === 'pk' ? t.x : g.gate.x, y: t.w === 'pk' ? t.y : g.gate.y, vx: (t.seed - 0.5) * 120, vy: -60, a: t.a, va: (t.seed - 0.5) * 12, life: 1.2 });
  },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    const calm = typeof Fx !== 'undefined' && Fx.calm, spinning = !calm && (s.phase === 'draw' || (s.phase === 'later' && v.laterCame && v.laterT > 0.55));
    v.spinV += ((spinning ? 6 : 0) - v.spinV) * Math.min(1, dt * 4); v.spin += v.spinV * dt; v.lit += calm ? 0 : dt * (spinning ? 9 : 1.2);
    if (v.laterT >= 0) v.laterT += dt;
    if (s.phase === 'search') v.clock += dt * (s.ff || 1); else if (s.phase === 'arrive') v.clock = 0;
    for (let i = v.fly.length - 1; i >= 0; i--) { const f = v.fly[i]; f.t += dt * (s.ff > 1 ? 2.5 : 1); if (f.t >= f.d) { this.v.eggs[f.j] = f.o; this.v.eggT[f.j] = 0.3; if (f.o === 0 && typeof Fx !== 'undefined') Fx.burst('spark', f.x1, f.y1, 4, { ink: RF_C.brassD }); v.fly.splice(i, 1); } }
    for (let j = 0; j < RF_E; j++) if (v.eggT[j] > 0) v.eggT[j] = Math.max(0, v.eggT[j] - dt);
    for (let i = v.tube.length - 1; i >= 0; i--) { v.tube[i] += dt * 2.6; if (v.tube[i] >= 1) v.tube.splice(i, 1); }
    if (s.hold && !RF_LV[s.level].dung && v.t - v.lastPour > 0.07 && v.tube.length < 24) { v.tube.push(0); v.lastPour = v.t; }
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
    const chart = A.id === 'p4' ? 1 : 0, start = A.kind === 'y' ? A.hi : A.id === 'p3' ? 2 : 2;   // the ghost starts off every plausible answer (lessons §1.3)
    Predict.ask({ id: A.id, chart, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start, at: A.at, tol: A.tol, soft: s.unt ? null : 40, needMove: true, linger: 700,
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null }), say: this.content.captions.liveAsk });
    if (typeof Live !== 'undefined') Live.say(this.content.hud[A.id]);
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(s.ask.id === 'p4' ? 1 : 0); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
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
    const s = this.sim.s, S = this.sim, L = s.fem, r1 = x => Math.round(x * 10) / 10, pl = S.bestPlan(s), m = L.slice(0, 3).map(F => F.t || 0);
    return { e: r1(S.expEggs(s)), b: r1(S.bestEggs(s)), r: s.risky >= 0 ? Math.round(pl[s.risky]) : 0, v: s.safe >= 0 ? Math.round(pl[s.safe]) : 0, m: Math.round((m[0] + m[1] + m[2]) / 3), a: Math.round(S.pmMean(s) || 0) };
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, g = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, cur = this.sim.cur(s);
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    if (e.k === 'press') { if (F) F.ring(g.hatch.x, g.hatch.y, 16, { ms: 180 }); v.tube.push(0); }
    else if (e.k === 'in') {
      if (v.t - v.lastIn > 0.08) { snd('pour', g.hatch.x, g.hatch.y, { left: s.left / RF_B }); v.lastIn = v.t; }
      if (RF_LV[s.level].her) { const u = Math.floor(cur.s + 1e-9), kept = Math.round(u * cur.y); if (u >= 4 && u - kept >= 2 && this.once('pk' + s.i)) this.whisper('pocket'); }
      if (typeof Live !== 'undefined' && e.tot % 10 === 0) Live.say(Txt.f(C.captions.liveIn, { s: e.tot, l: Math.round(s.left) }));
    }
    else if (e.k === 'min') {
      if (e.m % 5 === 0) snd('tock', g.cx, g.cy - g.Rd);
      if (F && e.m % 2 === 0) F.burst('dust', g.gate.x, g.gate.y + 4, 1);
      const sh = RF.dshare(s.mins); if (sh > 0.55 && !v.flushSaid) { v.flushSaid = true; this.whisper('flushed'); }
      if (typeof Live !== 'undefined' && e.m % 10 === 0) Live.say(Txt.f(C.captions.liveMin, { m: e.m, p: Math.round(100 * sh) }));
    }
    else if (e.k === 'release') { if (F) F.ring(g.hatch.x, g.hatch.y, 12, { ms: 160 }); }
    else if (e.k === 'dry') { this.whisper('dry'); if (F) { F.shake(4, 160); F.ring(g.gauge.x, g.gauge.y1, 20, { ms: 400 }); } snd('tock', g.gauge.x, g.gauge.y1); }
    else if (e.k === 'shut') { if (F) F.ring(g.hatch.x, g.hatch.y, 22, { ms: 260 }); snd('tock', g.hatch.x, g.hatch.y); }
    else if (e.k === 'ask') { if (F) F.ring(g.cx, g.cy, g.Rd * 0.5, { ms: 400 }); }
    else if (e.k === 'predicted') {
      const id = e.id, ex = this.sim.expect(s, id), A = RF_ASK[id];
      if (typeof Predict !== 'undefined' && !e.none) Predict.reveal(id, ex, A.tol);
      this.whisper(e.none ? 'none' : this.sim.hit(s, id) ? 'hit' : 'out');
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'latergo') { v.laterT = 0; v.laterCame = e.came; snd('wing', g.W - 20, g.pair.y - g.S); }
    else if (e.k === 'later') { this.whisper(e.came ? 'came' : 'nocame'); if (typeof Live !== 'undefined') Live.say(e.came ? C.captions.liveCame : C.captions.liveNo); if (e.came && F) F.burst('dust', g.hatch.x, g.hatch.y, 6); }
    else if (e.k === 'draw') { this.resetEggs(); v.laterT = -1; if (F) F.tier(1, () => { }); snd('sieve', g.cx, g.cy); }
    else if (e.k === 'egg') {
      const slot = e.m ? v.nMine++ : RF_E - 1 - v.nRiv++, [x1, y1] = this.eggXY(slot, g), o = e.m ? 0 : this.rivalOwner(cur, e.j);   // yours fill from the first egg, rivals' from the last
      v.fly.push({ j: slot, o, x0: g.gate.x, y0: g.gate.y, x1, y1, t: 0, d: 0.22 });
      snd(e.m ? 'count' : 'tick', x1, y1, { i: e.j });
    }
    else if (e.k === 'laid') {
      const [x, y] = this.eggXY(4, g);
      if (F) { F.pop('+' + e.eggs, x, y - 22, e.eggs > 0 ? 1 : 0); F.tier(2, () => { }); }
      if (e.eggs === RF_E && F) { F.tier(3, ms => { v.banner = { text: C.labels.jackpot, t: 0, ms: Math.max(900, ms) }; }); for (let k = 0; k < 4; k++) F.burst('spark', g.cx + (k - 1.5) * g.Rd * 0.5, g.cy - g.Rd * 0.6, 6, { ink: RF_C.red }); this.whisper('jackpot'); if (typeof Snd2 !== 'undefined') Snd2.play('interesting', { x: g.cx, y: g.cy }); }
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveLaid, { m: e.eggs }));
    }
    else if (e.k === 'search') { snd('wing', g.pair.x, g.pair.y); }
    else if (e.k === 'leave') { snd('swish', g.pair.x, g.pair.y); }
    else if (e.k === 'arrive') { this.resetEggs(); snd('wing', g.W, g.pair.y); }
    else if (e.k === 'ready') { if (RF_LV[s.level].her && cur.z < 0.5) this.whisper('favour'); }
    else if (e.k === 'pm') { if (F) F.tier(3, ms => { v.banner = { text: C.labels.pm, t: 0, ms: Math.max(1700, ms + 500) }; }); }
    else if (e.k === 'ff') { if (F) F.ring(g.cx, g.cy, g.Rd * 0.7, { ms: 220 }); }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  rivalOwner(F, j) { const k = Math.max(1, Math.round(F.R / RF_X)); return F.later && j % 3 === 2 ? 6 : 1 + (j % k); },   // cosmetic: which rival's pattern an egg wears
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'rf-' + k); },

  /* ---------- input: hold anywhere below the HUD to pour (or mate); a quick tap pours one unit; keys through onKey/onKeyUp ---------- */
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
    Dock.set([{ id: 'rf-pour', label: s.hold ? L.stop : dung ? L.mate : L.pour, pressed: !!s.hold, aria: dung ? 'Mate: tap to start, tap to stop' : 'Pour: tap to start, tap to stop', disabled: !dung && s.left <= 0, fn: () => this.toggle() },
      { id: 'rf-done', label: dung ? L.leave : L.done, key: 'Enter', primary: true, fn: () => Sim.act(this, { k: 'mate' }) }]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, L = RF_LV[s.level], F = this.sim.cur(s), lab = this.content.labels; let t;
    if (s.ask) t = C[s.ask.id];
    else if (s.auto) t = C.auto;
    else if (s.phase === 'over' || s.phase === 'end') t = C.over;
    else if (s.phase === 'draw') t = C.draw;
    else if (s.phase === 'later') t = C.later;
    else if (s.phase === 'search') t = Txt.f(C.search, { T: Math.floor(F.T) });
    else if (s.phase === 'pm') t = C.pm;
    else if (L.dung) t = s.mins > 0 ? Txt.f(C.copula, { m: Math.floor(s.mins) }) : C.mate;
    else if (s.left <= 0 && F.s <= 0) t = C.dry;
    else if (s.level === 0 && s.i === 0 && F.s <= 0) t = this.content.firstWords;
    else if (L.her) t = C.pour4;
    else if (s.level === 1) t = Txt.f(C.pour2, { r: F.R, q: F.q > 0.5 ? '9 in 10' : '1 in 10' });
    else t = F.R ? Txt.f(C.pourR, { r: F.R }) : C.pourV;
    const rt = this.sim.rate(s), num = L.dung ? (rt > 0 ? Txt.f(lab.rate, { r: rt.toFixed(1) }) : '') : lab.supply + ' ' + Math.round(s.left);
    const sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g); this.drawCards(c, g); this.drawTube(c, g); this.drawPocket(c, g); this.drawDrum(c, g); this.drawGauge(c, g); this.drawEggs(c, g); this.drawFlies(c, g); this.drawFly(c, g);
    if (s.phase === 'search' || (RF_LV[s.level].dung && (s.phase === 'pour' || s.phase === 'close'))) this.drawClock(c, g);
    if (s.ask && s.ask.id === 'p4') { Lbl.put('rf-new4', this.content.labels.new4, g.cx, g.cy, { size: 18 }); }
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('rf-banner', v.banner.text, g.cx, g.cy - g.Rd * 0.35, { size: 22 }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached: sky, sun, hedge and a grazing cow, meadow, the cowpat, bunting and the drum's wooden stand
    const sig = g.k; if (!this._bg || this.v.bgSig !== sig) { this._bg = this._bg || Layer(g.W, g.H); this._bg.resize(g.W, g.H); this._bg.redraw(cc => this.paintBg(cc, g)); this.v.bgSig = sig; }
    this._bg.blit(c, 0, 0);
  },
  paintBg(c, g) {   // cosmetic
    const C = RF_C, W = g.W, H = g.H, hz = g.top + g.cardH + g.Rd * 0.55, rnd = rng(7);
    const sk = c.createLinearGradient(0, 0, 0, hz); sk.addColorStop(0, C.sky); sk.addColorStop(1, C.sky2); c.fillStyle = sk; c.fillRect(0, 0, W, hz + 2);
    c.fillStyle = 'rgba(255,244,200,.85)'; c.beginPath(); c.arc(W * 0.86, g.top + g.cardH + 22, Math.min(30, W * 0.06), 0, TAU); c.fill();
    c.fillStyle = C.hill; c.beginPath(); c.moveTo(0, hz); for (let x = 0; x <= W; x += 20) c.lineTo(x, hz - 10 - 8 * Math.sin(x / W * 5.1 + 1)); c.lineTo(W, hz + 4); c.lineTo(0, hz + 4); c.fill();   // cosmetic
    c.fillStyle = C.hedge; for (let x = -10; x < W + 20; x += 16) { c.beginPath(); c.arc(x, hz - 2, 9 + 5 * rnd(), Math.PI, 0); c.fill(); }
    const cw = Math.max(26, W * 0.07), cx0 = W * 0.08, cy0 = hz + 4;   // a Friesian grazing in the distance
    c.fillStyle = '#F5F2EA'; this.rr(c, cx0, cy0 - cw * 0.5, cw, cw * 0.42, cw * 0.15); c.fill(); c.fillStyle = '#2B2622';
    c.beginPath(); c.ellipse(cx0 + cw * 0.3, cy0 - cw * 0.35, cw * 0.14, cw * 0.1, 0.3, 0, TAU); c.fill(); c.beginPath(); c.ellipse(cx0 + cw * 0.7, cy0 - cw * 0.25, cw * 0.1, cw * 0.08, 0, 0, TAU); c.fill();
    c.fillRect(cx0 + cw * 0.08, cy0 - cw * 0.1, 3, cw * 0.22); c.fillRect(cx0 + cw * 0.85, cy0 - cw * 0.1, 3, cw * 0.22); c.beginPath(); c.ellipse(cx0 + cw * 1.05, cy0 - cw * 0.12, cw * 0.14, cw * 0.1, 0.6, 0, TAU); c.fill();
    const mg = c.createLinearGradient(0, hz, 0, H); mg.addColorStop(0, C.grass); mg.addColorStop(1, C.grass2); c.fillStyle = mg; c.fillRect(0, hz + 2, W, H - hz);
    c.strokeStyle = 'rgba(60,90,30,.35)'; c.lineWidth = 1.2; for (let i = 0; i < 140; i++) { const x = rnd() * W, y = hz + 8 + rnd() * (H - hz); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 4, y - 4 - rnd() * 5); c.stroke(); }
    c.fillStyle = '#F4F0D8'; for (let i = 0; i < 18; i++) { const x = rnd() * W, y = hz + 14 + rnd() * (g.patY - hz - 10); c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); }   // daisies
    // the drum's wooden A-frame, under the drum
    c.strokeStyle = C.woodD; c.lineCap = 'round';
    for (const sd of [-1, 1]) { c.lineWidth = Math.max(5, g.Rd * 0.07); c.beginPath(); c.moveTo(g.cx + sd * g.Rd * 0.25, g.cy + g.Rd * 0.2); c.lineTo(g.cx + sd * g.Rd * 0.9, g.patY + g.patH * 0.12); c.stroke(); }
    c.lineWidth = Math.max(3, g.Rd * 0.04); c.beginPath(); c.moveTo(g.cx - g.Rd * 0.7, g.cy + g.Rd * 1.08); c.lineTo(g.cx + g.Rd * 0.7, g.cy + g.Rd * 1.08); c.stroke();
    // the cowpat: a warm crusted disc with darker wet patches and cracks
    const py = g.patY + g.patH * 0.55, pw = W * 0.5, ph = g.patH * 0.42;
    c.fillStyle = 'rgba(40,30,15,.25)'; c.beginPath(); c.ellipse(W * 0.52, py + ph * 0.25, pw * 1.02, ph * 0.9, 0, 0, TAU); c.fill();
    const pg = c.createRadialGradient(W * 0.48, py - ph * 0.4, 4, W * 0.52, py, pw); pg.addColorStop(0, C.crust); pg.addColorStop(1, C.pat); c.fillStyle = pg;
    c.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.2) { const r = 1 + 0.05 * Math.sin(a * 5 + 1) + 0.03 * Math.sin(a * 11); const x = W * 0.52 + Math.cos(a) * pw * r, y = py + Math.sin(a) * ph * r; if (a === 0) c.moveTo(x, y); else c.lineTo(x, y); } c.fill();   // cosmetic
    c.fillStyle = C.patD; for (let i = 0; i < 9; i++) { c.beginPath(); c.ellipse(W * 0.52 + (rnd() - 0.5) * pw * 1.4, py + (rnd() - 0.4) * ph * 1.1, 6 + rnd() * 14, 3 + rnd() * 5, rnd(), 0, TAU); c.fill(); }
    c.strokeStyle = 'rgba(230,200,150,.35)'; c.lineWidth = 1; for (let i = 0; i < 7; i++) { const x = W * 0.52 + (rnd() - 0.5) * pw * 1.3, y = py + (rnd() - 0.5) * ph; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 10 + rnd() * 10, y + (rnd() - 0.5) * 6); c.stroke(); }
    // bunting on a line across the sky: carnival pennants
    const by = g.top + g.cardH + 6; c.strokeStyle = 'rgba(60,40,20,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, by); c.quadraticCurveTo(W / 2, by + 16, W, by); c.stroke();
    const cols = [C.red, C.cream, '#5E8C3A', C.brass]; for (let i = 0, x = 8; x < W; x += 22, i++) { const t = x / W, y = by + 16 * 2 * t * (1 - t) * 0.98; c.fillStyle = cols[i % 4]; c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 6, y); c.lineTo(x, y + 12); c.closePath(); c.fill(); }
  },
  drawCards(c, g) {   // the queue: one card per female (rivals before her as ticket stacks; L2 adds the chance of a male after her; L2 hides all but three)
    const s = this.sim.s, lab = this.content.labels, vis = RF_LV[s.level].vis, C = RF_C;
    s.fem.forEach((F, i) => {
      const r = this.cardXY(i, g), now = i === s.i && s.phase !== 'over' && s.phase !== 'end', done = F.eggs >= 0, hidden = vis && i >= s.i + vis && !done, cx = r.x + r.w / 2;
      c.save(); c.globalAlpha = done && !now ? 0.66 : 1;
      c.fillStyle = hidden ? '#B9A57A' : C.cream; this.rr(c, r.x, r.y, r.w, r.h, 6); c.fill();
      c.lineWidth = now ? 3 : 1.2; c.strokeStyle = now ? C.red : C.brassD; c.stroke();
      if (hidden) { Lbl.put('rf-c' + i, lab.hidden, cx, r.y + r.h / 2, { size: 14, pill: false, ink: C.ink }); c.restore(); return; }
      if (s.level === 2) Lbl.put('rf-c' + i, Txt.f(lab.mins, { m: Math.floor(F.T) }), cx, r.y + 12, { size: 12, pill: false, ink: C.ink });   // her search time
      else {
        const k = Math.round(F.R / RF_X), sw = Math.min(7, (r.w - 8) / Math.max(1, k)), x0 = cx - sw * k / 2;
        if (!k) Lbl.put('rf-c' + i, lab.virgin, cx, r.y + 12, { size: 12, pill: false, ink: C.ink });
        for (let q = 0; q < k; q++) for (let z = 0; z < 3; z++) { c.fillStyle = q % 2 ? C.riv2 : C.riv1; c.fillRect(x0 + q * sw + 0.5, r.y + 5 + z * 4, sw - 1.5, 3); }
      }
      if (s.level === 3 && !done) {   // what she keeps: his tickets (solid) above, yours (striped) below
        const bw = r.w - 10, bx = r.x + 5;
        for (const [k, f, y0] of [[1, F.z, r.y + r.h * 0.52], [0, F.y, r.y + r.h * 0.74]]) {
          c.fillStyle = 'rgba(30,24,16,.15)'; c.fillRect(bx, y0, bw, 6); c.fillStyle = k ? C.riv1 : C.youS; c.fillRect(bx, y0, Math.max(1.5, bw * f), 6);
          c.strokeStyle = C.ink; c.lineWidth = 0.8; c.strokeRect(bx + 0.5, y0 + 0.5, bw - 1, 5);
        }
      }
      if (done) Lbl.put('rf-e' + i, String(F.eggs), cx, r.y + r.h * 0.7, { size: 12 });
      else if (s.level === 1) {   // the chance of a male after her: a pie, dark for the share of times one comes
        const cyp = r.y + r.h * 0.68, rp = Math.min(8, r.h * 0.17);
        c.fillStyle = C.cream; c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.arc(cx, cyp, rp, 0, TAU); c.fill(); c.stroke();
        c.fillStyle = C.riv1; c.beginPath(); c.moveTo(cx, cyp); c.arc(cx, cyp, rp, -TAU / 4, -TAU / 4 + TAU * F.q); c.closePath(); c.fill();
      }
      c.restore();
    });
  },
  drawTube(c, g) {   // cosmetic: the brass pipe from the mating pair up to the drum's hatch; tickets rattle up it while you pour
    const p0 = [g.pair.x - g.S * 0.55, g.pair.y - g.S * 0.2], p2 = [g.hatch.x, g.hatch.y - 4], p1 = [Math.max(10, g.cx - g.Rd * 1.3), g.cy - g.Rd * 0.1];
    c.lineCap = 'round'; c.strokeStyle = RF_C.brassD; c.lineWidth = Math.max(8, g.tw * 0.9); c.beginPath(); c.moveTo(p0[0], p0[1]); c.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]); c.stroke();
    c.strokeStyle = RF_C.brassL; c.lineWidth = Math.max(4, g.tw * 0.45); c.stroke();
    const pt = u => { const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u; return [a * p0[0] + b * p1[0] + d * p2[0], a * p0[1] + b * p1[1] + d * p2[1]]; };
    for (const u of this.v.tube) { const q = pt(u), sp = this.spr[0]; if (sp) c.drawImage(sp, q[0] - sp.cw / 2, q[1] - sp.ch / 2, sp.cw, sp.ch); }
    c.fillStyle = RF_C.brass; c.beginPath(); c.moveTo(g.hatch.x - g.tw, g.hatch.y - 10); c.lineTo(g.hatch.x + g.tw, g.hatch.y - 10); c.lineTo(g.hatch.x + g.tw * 0.45, g.hatch.y + 2); c.lineTo(g.hatch.x - g.tw * 0.45, g.hatch.y + 2); c.closePath(); c.fill();
    c.strokeStyle = RF_C.ink; c.lineWidth = 1; c.stroke();
  },
  drawPocket(c, g) {   // L3 "out of reach", L4 "her pocket": a small glass jar clamped to the drum
    const s = this.sim.s; if (!(RF_LV[s.level].dung || RF_LV[s.level].her)) return; const P = g.pocket;
    c.fillStyle = 'rgba(214,200,160,.92)'; c.strokeStyle = RF_C.brassD; c.lineWidth = 3; c.beginPath(); c.arc(P.x, P.y, P.r, 0, TAU); c.fill(); c.stroke();
    this.ticketsIn(c, 'pk', 0.8);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(P.x - P.r * 0.3, P.y - P.r * 0.3, P.r * 0.35, 0, TAU); c.fill();
    Lbl.put('rf-pocket', RF_LV[s.level].dung ? this.content.labels.reach : this.content.labels.pocket, P.x + P.r * 0.35, P.y + P.r + 11, { size: 12 });
  },
  ticketsIn(c, where, alpha) {
    const v = this.v, sp = this.spr; if (!sp) return; c.save(); if (alpha != null) c.globalAlpha = alpha;
    const sc = where === 'pk' ? 0.7 : 1;
    for (const t of v.tk) if (t.w === where) { const im = sp[this.style(t.o)]; c.save(); c.translate(t.x, t.y); c.rotate(t.a); c.scale(sc, sc); c.drawImage(im, -im.cw / 2, -im.ch / 2, im.cw, im.ch); c.restore(); }
    c.restore();
  },
  drawDrum(c, g) {
    const C = RF_C, v = this.v, R0 = g.Rd, s = this.sim.s;
    c.fillStyle = 'rgba(30,20,10,.18)'; c.beginPath(); c.ellipse(g.cx + 6, g.cy + R0 * 0.08 + 6, R0 * 1.02, R0 * 1.02, 0, 0, TAU); c.fill();
    c.fillStyle = C.glass; c.beginPath(); c.arc(g.cx, g.cy, R0, 0, TAU); c.fill();
    c.save(); c.strokeStyle = 'rgba(126,92,23,.22)'; c.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = v.spin * 0.5 + k * TAU / 6; c.beginPath(); c.moveTo(g.cx, g.cy); c.lineTo(g.cx + R0 * 0.95 * Det.cos(a), g.cy + R0 * 0.95 * Det.sin(a)); c.stroke(); } c.restore();
    const ish = c.createRadialGradient(g.cx, g.cy, R0 * 0.55, g.cx, g.cy, R0); ish.addColorStop(0, 'rgba(160,120,50,0)'); ish.addColorStop(1, 'rgba(160,120,50,.28)'); c.fillStyle = ish; c.beginPath(); c.arc(g.cx, g.cy, R0, 0, TAU); c.fill();
    this.ticketsIn(c, 'dr');
    c.fillStyle = 'rgba(255,255,255,.22)'; c.beginPath(); c.ellipse(g.cx - R0 * 0.38, g.cy - R0 * 0.45, R0 * 0.32, R0 * 0.16, -0.6, 0, TAU); c.fill();
    const rim = c.createLinearGradient(g.cx - R0, g.cy - R0, g.cx + R0, g.cy + R0); rim.addColorStop(0, C.brassL); rim.addColorStop(0.5, C.brass); rim.addColorStop(1, C.brassD);
    c.strokeStyle = rim; c.lineWidth = Math.max(7, R0 * 0.085); c.beginPath(); c.arc(g.cx, g.cy, R0, 0, TAU); c.stroke();
    const nb = 16; for (let k = 0; k < nb; k++) {   // marquee bulbs: they chase while the drum spins
      const a = k * TAU / nb, on = (Math.floor(v.lit) + k) % 4 === 0, x = g.cx + R0 * Det.cos(a), y = g.cy + R0 * Det.sin(a);
      c.fillStyle = on ? '#FFF2B8' : '#9C7A2A'; c.beginPath(); c.arc(x, y, Math.max(2.5, R0 * 0.03), 0, TAU); c.fill();
      if (on) { c.fillStyle = 'rgba(255,236,160,.35)'; c.beginPath(); c.arc(x, y, Math.max(5, R0 * 0.06), 0, TAU); c.fill(); }
    }
    c.fillStyle = C.brass; c.strokeStyle = C.ink; c.lineWidth = 1; c.beginPath(); c.arc(g.cx, g.cy, Math.max(5, R0 * 0.07), 0, TAU); c.fill(); c.stroke();
    const ca = v.spin * 0.8, hx = g.cx + R0 + 10, hy = g.cy, hl = R0 * 0.32;   // the crank
    c.strokeStyle = C.brassD; c.lineWidth = 5; c.beginPath(); c.moveTo(g.cx + R0, g.cy); c.lineTo(hx, hy); c.lineTo(hx + hl * Det.cos(ca), hy + hl * Det.sin(ca)); c.stroke();
    c.fillStyle = C.red; c.beginPath(); c.arc(hx + hl * Det.cos(ca), hy + hl * Det.sin(ca), 5, 0, TAU); c.fill();
    c.fillStyle = C.brass; c.beginPath(); c.moveTo(g.gate.x - 9, g.gate.y - 8); c.lineTo(g.gate.x + 9, g.gate.y - 8); c.lineTo(g.gate.x + 5, g.gate.y + 6); c.lineTo(g.gate.x - 5, g.gate.y + 6); c.closePath(); c.fill(); c.stroke();
    // counts under the drum: the raffle's two numbers (in L4 only the tickets she kept in the drum count)
    if (s.phase !== 'arrive' && s.phase !== 'leave' && s.phase !== 'end' && s.phase !== 'over' && s.phase !== 'pm' && !(s.ask && (s.ask.id === 'p3' || s.ask.id === 'p4'))) {
      let me = 0, them = 0; for (const t of v.tk) if (t.w === 'dr') { if (t.o === 0) me++; else them++; }
      const lab = this.content.labels, y = g.cy - R0 * 0.6;   // a scoreboard in the empty top of the drum
      Lbl.put('rf-yours', Txt.f(lab.yours, { n: me }), g.cx - R0 * 0.36, y, { size: 13 });
      Lbl.put('rf-rivals', Txt.f(lab.rivals, { n: them }), g.cx + R0 * 0.36, y, { size: 13 });
    }
  },
  drawGauge(c, g) {   // the season's supply: a brass-capped glass tube that drains as you pour (L1, L2, L4)
    const s = this.sim.s; if (RF_LV[s.level].dung) return; const G = g.gauge, f = s.left / RF_B, h = G.y1 - G.y0;
    c.fillStyle = 'rgba(250,245,228,.85)'; this.rr(c, G.x - G.w / 2, G.y0, G.w, h, G.w / 2); c.fill();
    c.fillStyle = RF_C.halo; this.rr(c, G.x - G.w / 2 + 2, G.y0 + h * (1 - f) + 2, G.w - 4, Math.max(0, h * f - 4), G.w / 2 - 2); c.fill();
    c.strokeStyle = RF_C.ink; c.lineWidth = 1; for (let k = 1; k < 10; k++) { const y = G.y0 + h * k / 10; c.beginPath(); c.moveTo(G.x - G.w / 2, y); c.lineTo(G.x - G.w / 2 + 4, y); c.stroke(); }
    c.strokeStyle = RF_C.brassD; c.lineWidth = 2.5; this.rr(c, G.x - G.w / 2, G.y0, G.w, h, G.w / 2); c.stroke();
    Lbl.put('rf-supply', this.content.labels.supply, G.x, G.y1 + 14, { size: 12 });
  },
  drawEggs(c, g) {   // her 20 eggs on the pat: each takes its father's ticket pattern as it is drawn
    const v = this.v, r = g.eggs.r, sp = this.spr;
    for (let j = 0; j < RF_E; j++) {
      const [x, y] = this.eggXY(j, g), o = v.eggs[j], sc = 1 + v.eggT[j] * 1.2;
      c.save(); c.translate(x, y); c.scale(sc, sc);
      c.fillStyle = o < 0 ? RF_C.egg : o === 0 ? RF_C.you : this.style(o) === 1 ? RF_C.riv1 : RF_C.riv2;
      if (o === 0) { c.fillStyle = RF_C.halo; c.beginPath(); c.ellipse(0, 0, r * 0.75 + 2, r + 2, 0, 0, TAU); c.fill(); c.fillStyle = RF_C.you; }
      c.beginPath(); c.ellipse(0, 0, r * 0.75, r, 0, 0, TAU); c.fill();
      if (o === 0) { c.save(); c.clip(); c.strokeStyle = RF_C.youS; c.lineWidth = 1.6; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(-r, k * r * 0.6 + r * 0.4); c.lineTo(r, k * r * 0.6 - r * 0.4); c.stroke(); } c.restore(); }
      if (o > 0 && this.style(o) === 2) { c.fillStyle = RF_C.dot; for (const [dx, dy] of [[-0.3, -0.4], [0.25, 0], [-0.2, 0.45]]) { c.beginPath(); c.arc(dx * r, dy * r, 1.1, 0, TAU); c.fill(); } }
      c.strokeStyle = 'rgba(30,24,16,.7)'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 0, r * 0.75, r, 0, 0, TAU); c.stroke(); c.restore();
    }
    const s = this.sim.s, F = this.sim.cur(s);
    if ((s.phase === 'draw' || s.phase === 'search' || s.phase === 'leave') && F && F.draws) {   // the expected boundary, dashed: yours fill from the first egg
      const ex = RF_E * (RF_LV[s.level].dung ? F.x : RF.share(F, F.s)), k = Math.max(0, Math.min(RF_E, ex)), row = k >= 10 && k < 20 ? 1 : 0, col = row ? k - 10 : Math.min(10, k);
      const E = g.eggs, x = E.x0 + (E.x1 - E.x0) * col / 10, y = row ? E.y1 : E.y0;
      c.save(); c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = RF_C.ink; c.beginPath(); c.moveTo(x, y - r * 1.8); c.lineTo(x, y + r * 1.8); c.stroke(); c.restore();
      Lbl.put('rf-expect', this.content.labels.expected, Math.max(E.x0 + 30, Math.min(E.x1 - 30, x)), (row ? E.y1 : E.y0) - r * 1.8 - 9, { size: 12 });
    }
    for (const f of v.fly) {   // a ticket on its thread, from the gate to its egg
      const u = Math.min(1, f.t / f.d), x = f.x0 + (f.x1 - f.x0) * u, y = f.y0 + (f.y1 - f.y0) * u - 30 * u * (1 - u) * 4, im = sp && sp[this.style(f.o)];
      c.strokeStyle = 'rgba(30,24,16,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(f.x0, f.y0); c.quadraticCurveTo((f.x0 + x) / 2, Math.min(f.y0, y) - 10, x, y); c.stroke();
      if (im) c.drawImage(im, x - im.cw / 2, y - im.ch / 2, im.cw, im.ch);
    }
  },
  drawFlies(c, g) {   // the mating pair on the pat (Rig 'dungfly': furry golden male, greyer female), the later male, and rivals hovering in L3
    if (typeof Rig === 'undefined') return;
    const s = this.sim.s, v = this.v, S = g.S, ph = s.phase, calm = typeof Fx !== 'undefined' && Fx.calm;
    let fx = g.pair.x, fy = g.pair.y, fa = 1;
    if (ph === 'arrive') { const u = Math.min(1, s.pt / RF_T.arrive); fx = g.W + S - (g.W + S - g.pair.x) * (1 - (1 - u) * (1 - u)); fy = g.pair.y - S * 1.4 * (1 - u); }
    else if (ph === 'leave') { const u = Math.min(1, s.pt / RF_T.leave); fx = g.pair.x - S * 2 * u; fy = g.pair.y - S * 2.2 * u; fa = 1 - u; }
    else if (ph === 'end' || ph === 'over' || ph === 'pm' || (s.ask && (s.ask.id === 'p3' || s.ask.id === 'p4'))) fa = 0;
    if (fa > 0) {
      Rig.draw(c, 'dungfly', { sex: 'f', size: 0.5 }, fx, fy, { size: S, rot: TAU / 4, alpha: fa });
      const on = ph === 'pour' || ph === 'close' || ph === 'ask' || (ph === 'later' && v.laterT < 0.5), bob = s.hold && !calm ? 2 * Det.sin(v.t * 22) : 0;
      if (on) Rig.draw(c, 'dungfly', { sex: 'm', size: 0.75 }, fx - S * 0.18, fy - S * 0.12 + bob, { size: S * 1.08, rot: TAU / 4 });
      else if (ph === 'draw' || ph === 'search' || ph === 'later') Rig.draw(c, 'dungfly', { sex: 'm', size: 0.75 }, fx + S * 0.15, fy - S * 0.8, { size: S * 1.08, rot: TAU / 4 + 0.25 });   // guarding beside her
    }
    if (ph === 'later' && v.laterT >= 0) {   // a later male: he lands on her and adds his tickets, or flies on past
      const u = Math.min(1, v.laterT / 0.55), w = Math.min(1, v.laterT / RF_T.later);
      let x, y, rot;
      if (v.laterCame) { x = g.W + S - (g.W + S - (g.pair.x + S * 0.1)) * u; y = g.pair.y - S * 0.15 - S * (1 - u); rot = TAU / 4; }
      else if (w < 0.5) { const k = w / 0.5; x = g.W + S - (g.W * 0.3 + S) * k; y = g.patY - S * 0.3 - S * 0.6 * (1 - k); rot = TAU * 0.75; }   // he looks her over from above the eggs…
      else { const k = (w - 0.5) / 0.5; x = g.W * 0.7 + (g.W * 0.3 + S) * k; y = g.patY - S * 0.3 - S * 1.2 * k; rot = TAU / 4 - 0.3; }   // …and flies on
      Rig.draw(c, 'dungfly', { sex: 'm', size: 0.9 }, x, y, { size: S * 1.12, rot, alpha: 0.95 });
    }
    if (RF_LV[s.level].dung && (ph === 'pour' || ph === 'close') && !calm) for (let k = 0; k < 2; k++) {   // rival males circling the pat
      const a = v.t * (1.1 + k * 0.4) + k * 2.2, x = g.pair.x + S * (1.4 + k * 0.5) * Det.cos(a), y = g.pair.y - S * 0.9 + S * 0.35 * Det.sin(a * 1.3);
      Rig.draw(c, 'dungfly', { sex: 'm', size: 0.6 }, x, y, { size: S * 0.8, rot: a + TAU / 4, alpha: 0.85 });
    }
  },
  drawFly(c, g) {   // tickets falling out of the gate or the pocket into the grass
    const sp = this.spr; if (!sp) return;
    for (const t of this.v.gone) { const im = sp[this.style(t.o)]; c.save(); c.globalAlpha = Math.max(0, Math.min(1, t.life)); c.translate(t.x, t.y); c.rotate(t.a); c.drawImage(im, -im.cw / 2, -im.ch / 2, im.cw, im.ch); c.restore(); }
  },
  drawClock(c, g) {   // L3: a brass stopwatch: mating minutes while you hold, then the search spinning past
    const s = this.sim.s, F = this.sim.cur(s), x = g.gauge.x - 4, y = g.cy - g.Rd * 0.55, r = Math.max(16, g.Rd * 0.2), lab = this.content.labels;
    const m = s.phase === 'search' ? Math.min(1, this.v.clock / RF_T.search) * F.T : s.mins;
    c.fillStyle = RF_C.cream; c.strokeStyle = RF_C.brassD; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke();
    if (s.phase !== 'search') { c.fillStyle = 'rgba(178,58,46,.35)'; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r - 3, -TAU / 4, -TAU / 4 + TAU * Math.min(1, m / 60)); c.closePath(); c.fill(); }
    const a = -TAU / 4 + TAU * (m % 60) / 60; c.strokeStyle = RF_C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r - 4) * Det.cos(a), y + (r - 4) * Det.sin(a)); c.stroke();
    Lbl.put('rf-x600', this.content.labels.xN, x - r - 4, y - r + 4, { size: 12 });   // the time compression, tagged (D0 §3)
    Lbl.put('rf-clock', s.phase === 'search' ? Txt.f(lab.search, { T: Math.floor(F.T) }) : Txt.f(lab.mins, { m: Math.floor(m) }), x, y + r + 13, { size: 12 });
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
    const charts = [this.rowsSpec('eggs'), this.rowsSpec('units')];
    if (RF_LV[n].her) charts[1] = this.halfSpec();
    return { stats, charts };
  },
  rowsSpec(kind) {   // per female: eggs won (realised solid, expected dashed after the level) or units poured (yours solid, the best plan dashed after the level)
    const s = this.sim.s, S = this.sim, lab = this.content.labels, over = s.phase === 'over' || s.phase === 'end', best = over ? S.bestPlan(s) : null, vis = RF_LV[s.level].vis;
    const cols = s.fem.map((F, i) => {
      const hidden = vis && i >= s.i + vis && F.eggs < 0, label = hidden ? '?' : String(Math.round(F.R / RF_X)) + (s.level === 1 && F.q > 0.5 ? '+' : '');   // rivals before her; + a male likely after
      if (kind === 'eggs') return { label, v: F.eggs >= 0 ? F.eggs : null, e: over ? RF_E * RF.share(F, F.s) : null, cur: i === s.i && !over };
      return { label, v: F.s > 0 || i < s.i ? F.s : null, best: best ? best[i] : null, cur: i === s.i && !over };
    });
    if (kind === 'eggs') return { type: 'rf_rows', title: lab.tEggs, y: { lo: 0, hi: RF_E, label: lab.eggsAx }, cols, frame: 'designed', bestLabel: lab.expected };
    let hi = 40; for (const c of cols) hi = Math.max(hi, c.v || 0, c.best || 0); hi = Math.ceil(hi / 10) * 10;
    return { type: 'rf_rows', title: lab.tUnits, y: { lo: 0, hi, label: lab.units }, cols, frame: 'designed', fold: false, bestLabel: s.level === 1 ? lab.planner : lab.best };
  },
  gainSpec(card) {   // L3: your share against mating time, with the search time to the left of zero; the curve and the tangent appear only after your call
    const s = this.sim.s, lab = this.content.labels, L = s.fem, over = s.phase === 'over' || s.phase === 'end', shown = s.pred.p3 != null || s.nocall.p3 || over, pm = s.i >= 3 && !over;
    const T = pm ? RF_D.Tpm : RF_D.T, curve = [], tans = [];
    if (shown) { for (let t = 0; t <= 120; t += 4) curve.push([t, RF.dshare(t)]); }
    const tan = Tq => { const t = RF.tstar(Tq), y = RF.dshare(t), sl = y / (Tq + t); return { pts: [[-Tq, 0], [120, sl * (120 + Tq)]], at: [t, y] }; };
    if (shown) tans.push(tan(RF_D.T)); if (over || card) tans.push(tan(RF_D.Tpm));
    return { type: 'rf_gain', title: lab.tShare, x: { lo: -RF_D.T, hi: 120, label: lab.minutes }, y: { lo: 0, hi: 1, fmt: 'pct' }, pts: L.filter(F => F.t > 0).map(F => [F.t, F.x, F.T < 100 ? 1 : 0]),
      curve, tans, marks: [{ x: -RF_D.T, label: lab.searchM }].concat(pm || over || card ? [{ x: -RF_D.Tpm, label: '' }] : []), frame: 'designed', curveLabel: lab.fitted };
  },
  halfSpec() {   // L4's new female: your share against units poured; axes only until your call, then her curve and the half line
    const s = this.sim.s, lab = this.content.labels, over = s.phase === 'over' || s.phase === 'end', shown = s.pred.p4 != null || s.nocall.p4 || over, curve = [];
    if (shown) for (let u = 0; u <= 150; u += 5) curve.push([u, RF.share({ R: RF_P4.R, y: RF_P4.y }, u)]);
    return { type: 'rf_gain', title: lab.tHalf, x: { lo: 0, hi: 150, label: lab.units }, y: { lo: 0, hi: 1, fmt: 'pct' }, pts: [], curve, tans: [], half: true, marks: [], frame: 'designed', fold: false, curveLabel: lab.expected };
  },
  debrief() {   // the level card's chart: what you did solid, the best plan dashed (L3: the curve, both tangents and your call)
    const s = this.sim.s; if (!s.whatif && RF_LV[s.level].dung) { const g = this.gainSpec(true); if (s.pred.p3 != null) g.call = s.pred.p3; return g; }
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
    if (spec.half) { const y = G.Y(0.5); c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke(); }
    c.setLineDash([]);
    if (spec.curve && spec.curve.length) { c.setLineDash([6, 4]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.beginPath(); spec.curve.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.setLineDash([]); }
    (spec.tans || []).forEach((tn, k) => { c.lineWidth = 1.6 * T.k; c.strokeStyle = wgRgba(I.text, k ? 0.55 : 0.85); c.setLineDash(k ? [3, 3] : []); c.beginPath(); c.moveTo(G.X(tn.pts[0][0]), G.Y(tn.pts[0][1])); c.lineTo(G.X(tn.pts[1][0]), G.Y(tn.pts[1][1])); c.stroke(); c.setLineDash([]); wgDiamond(c, G.X(tn.at[0]), G.Y(tn.at[1]), 4 * T.k, I.text, I.surface, 1.5); });
    c.restore();
    for (const q of spec.pts || []) { c.fillStyle = q[2] ? I.surface : I.text; c.strokeStyle = I.text; c.lineWidth = 1.5; c.beginPath(); c.arc(G.X(q[0]), G.Y(q[1]), 4.5 * T.k, 0, TAU); c.fill(); c.stroke(); }
    if (!T.compact) { for (const m of spec.marks || []) if (m.label) wgText(c, m.label, G.X(m.x) + 4, p.y + p.h - G.tk / 2 - 3, G.tk, I.text2, { fam: 'b', wt: 600, halo: I.surface }); if (spec.half) wgText(c, '50%', p.x + p.w - 4, G.Y(0.5) - G.tk / 2 - 2, G.tk, I.text2, { align: 'right', halo: I.surface }); }
    if (!T.compact && spec.curve && spec.curve.length && spec.curveLabel) { const q = spec.curve[spec.curve.length - 1]; wgText(c, spec.curveLabel, G.X(q[0]) - 4, G.Y(q[1]) + G.tk, G.tk, I.text, { align: 'right', fam: 'b', wt: 600, halo: I.surface }); }
    if (wgFin(spec.call)) wgYou(c, G, { x: spec.call, label: 'you' }, T, 'x');
  },
  rows(spec) { return { head: ['minutes or units', 'share'], rows: (spec.pts || []).map(q => [String(Math.round(q[0])), Math.round(q[1] * 100) + '%']).concat((spec.curve || []).filter((q, i) => i % 3 === 0).map(q => [String(q[0]) + ' (curve)', Math.round(q[1] * 100) + '%'])) }; },
  say(spec) { return (spec.pts || []).map(q => Math.round(q[0]) + ' minutes, ' + Math.round(q[1] * 100) + '%').join('; '); }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.raffle = RF_TEXT.take;
  MODEL.raffle = 'Each female’s sperm store is a raffle drum: every unit of sperm is a ticket, and each egg draws one. Levels add later males with a known chance, last-male displacement fitted to yellow dung flies, and a female who keeps only some of each male’s tickets. Rivals, risks and her bias are designed numbers.';
  RECALL.raffle = { q: 'A virgin will almost surely mate again after you. How much sperm should she get?', opts: [['some', 'A real share'], ['one', 'One ticket'], ['all', 'Everything left']], ans: 'some', why: 'A later male would split her eggs, so your tickets now buy a share of that raffle.' };
  BRIDGE.raffle = 'Why Sex? asked why genes are mixed at all. Here males compete even after mating, inside the female.';
  if (TRANSFER.raffle) delete TRANSFER.raffle;
}
