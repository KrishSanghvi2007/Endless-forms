/* ================= v2/alarm.js: Alarm Call (id 'alarm'), the Wave 2 rebuild of a favourite =================
   D1 §3.6, D5 §4 item 10, D6 (and its 21 Oct addendum: own world, intro card). You are a Belding's ground squirrel in a high
   Sierra meadow (role: a behaving animal). A coyote or a hawk closes in; you call a warning or stay silent, reading your
   neighbours' ear-flag tags. Calling costs you risk C and saves each warned neighbour risk B, so a call pays your genes when
   Σ r·B > C (Hamilton 1964). Levels add one variable each: the cost and benefit of a call (known kin); fathers you cannot see
   (you tag litters with several sires on a burrow-map pedigree, and the attacks read your tags); a second predator whose call
   (the whistle) turns out to protect the caller; sex-biased dispersal (daughters stay among kin, sons leave), shown as two
   sex-limited calling alleles over 15 seasons; and a boss on Cousin Island where Seychelles warbler helpers can lay eggs in
   the nest they help at, so helping pays even for unrelated nestlings.
   Headless sim (R(), Det only), stars against the expectation, juice from Sim.run's events only (API_v2 §6.1). The run is
   (seed, level, actions); the untimed flag is read once at reset (as Hawks does) and logged in the state. */

const AL_B = 0.4;                                           // risk each warned neighbour avoids (ledger units)
const AL_C = { coyote: 0.22, hawk: -0.26 };                 // the caller's extra risk: trill +0.22 (Sherman 1977); whistle −0.26 (sign from Sherman 1985; size designed)
const AL_RISK = { sil: 0.30, trill: 0.52, whistle: 0.04, warned: 0.1, open: 0.5, k: 0.3 };   // catch chance = k × risk; at most one victim an attack
const AL_REL = { mo: 0.5, fs: 0.5, hs: 0.25, au: 0.25, co: 0.125, un: 0, im: 0, br: 0.5 };
const AL_TAGS = ['1/2', '1/4', '1/8', '0'];
const AL_T = { tell: 0.8, decide: [3.0, 2.6, 2.6, 2.6], strike: 1.3, debrief: 1.9, season: 1.2, auto: 0.45, swap: 0.3, ask: 14, fly: 2.4, tally: 2.0 };
const AL_ASK = {   // the prediction gestures: axis, start (off every plausible answer), tolerance
  be: { chart: 0, lo: 0, hi: 2, start: 2, tol: 0.1, step: 0.05 },
  tr: { chart: 0, lo: -0.5, hi: 0.5, start: -0.5, tol: 0.08, step: 0.02 },
  wh: { chart: 1, lo: -0.5, hi: 0.5, start: 0.5, tol: 0.2, step: 0.02 },
  f4: { chart: 0, lo: 0, hi: 1, start: 0, tol: 0.1, step: 0.02 },
  m4: { chart: 1, lo: 0, hi: 1, start: 1, tol: 0.1, step: 0.02 },
  sw: { chart: 2, lo: 0, hi: 1, start: 0, tol: 0.1, step: 0.02 },
  lm: { chart: 1, lo: 0, hi: 0.6, start: 0, tol: 0.05, step: 0.0125 },
  eg: { chart: 1, lo: 0, hi: 0.6, start: 0, tol: 0.05, step: 0.0125, practice: true }
};
// L4, the colony: two sex-limited calling loci; neighbourhood relatedness set by dispersal; selection strength ×N
const AL_C4 = { N: 200, T: 15, vig: 8, sigma: 2.6, Rf: 0.9, Rm: 0.05, M: 200 };
// L5, Cousin Island: one egg a clutch; helpers co-breed with chance 0.44 (Richardson et al. 2001); EGP 40% of young
const AL_W = { cob: 0.44, own: 0.5, help: 0.6, brood: 0.6, egp: 0.4 };
const AL_SPRINGS = [   // [home quality, breeding female, nestlings' social father, vacancy quality or 0]
  [1, 'step', 'new', 0.2], [1, 'mum', 'new', 0.4], [0.6, 'step', 'dad', 0.2], [1, 'step', 'dad', 0.3],
  [1, 'mum', 'dad', 0.2], [0.3, 'mum', 'dad', 0.9], [0.3, 'step', 'new', 0.5], [0.6, 'mum', 'new', 0.9]
];
const AL_LV = [   // per level: attacks, predators, tags known, asks
  { n: 8, preds: 'c', truth: true, ask: 'be', askAt: 3 },
  { n: 8, preds: 'c', truth: false, peace: true },
  { n: 10, preds: 'ch', truth: true, asks: ['tr', 'wh'], askAt: 2 },
  { colony: true },
  { warbler: true }
];

const AL_TEXT = {
  intro: {
    game: 'You are a Belding’s ground squirrel in a high Sierra meadow, where coyotes and hawks hunt. Each attack, you call a warning or stay silent.',
    biology: 'Calling can put the caller at risk while it saves the neighbours it warns. Hamilton’s rule: a call pays your genes when relatedness times benefit beats the cost, rB > C.',
    how: 'Read each neighbour’s ear flag, then tap Call or Stay silent before the predator strikes. Later you tag kin on a burrow map, and help or breed as a warbler.'
  },
  firstWords: 'A coyote! Ear flags show each neighbour’s relatedness to you. Tap yourself to trill a warning, or tap your burrow to stay silent.',
  hud: {
    decideC: 'Coyote! Trill to warn them, or stay silent?',
    decideH: 'Hawk! Whistle, or stay silent?',
    decideHq: 'Hawk! The whistle’s cost is unknown. Whistle, or stay silent?',
    strike: 'The predator strikes.',
    debrief: 'The ledger: relatedness times benefit against your cost.',
    peace: 'Peace time. Tap each squirrel on the burrow map and tag its relatedness to you.',
    peace2: 'Same face blaze as yours: same father. Tap Done when tagged.',
    be: 'Drag the line: above what total relatedness does a trill pay?',
    tr: 'Drag the marker: what does a trill cost the caller?',
    wh: 'Drag the marker: what does a whistle cost? Below zero means it saves you.',
    lm: 'Your litter has two fathers. Drag your average relatedness to your littermates.',
    eg: '40% of young have extra-group fathers. Drag: your r to mum and dad’s chick?',
    f4: 'Drag: what share of females will carry calling at season 15?',
    m4: 'Drag: and what share of males will carry calling at season 15?',
    vigF: 'Season {t}: you are a daughter at home. Coyote!',
    vigM: 'Season {t}: you are a son among strangers. Coyote!',
    season: 'Winter. Daughters stay; sons leave home.',
    auto: 'Seasons pass. Calling alleles rise or fall by what they do for kin.',
    sw: 'A new meadow where daughters leave and sons stay. Drag: males calling at season 15?',
    swrun: 'The new meadow runs.',
    spring: 'Spring {t}: help at home, or breed on the vacancy?',
    springNone: 'Spring {t}: no vacancy. Help at home, or wait?',
    fly: 'Spring under way.',
    tally: 'Gene copies: your own young plus kin you raised.',
    ask: 'Drag the marker, then Lock in.',
    over: 'The level is done.'
  },
  whispers: {
    called: 'You trilled. You froze in view.', whistled: 'You whistled and bolted.', silent: 'You stayed silent.', slow: 'Too slow: you stayed silent.',
    caught: 'Caught! You go on as a sister.', killed: 'A neighbour was caught.', none: 'Nobody was caught.',
    good: 'Good call for your genes.', bad: 'Your genes lost out.', tagged: 'Tagged.', you: 'That is you.', drag: 'Drag the marker first.',
    miss: 'Tap yourself to call, your burrow for silence.', missW: 'Tap home to help, far tree to breed.',
    practice: 'Practice call: off by {d}.', coop: 'You laid an egg in the nest!', nocoop: 'No egg of yours this spring.', bred: 'You raised your own chick.', floated: 'No territory: you waited.'
  },
  labels: {
    you: 'you', cost: 'cost', costQ: 'cost ?', pays: 'call pays', silentPays: 'silence pays', burrow: 'your burrow', designed: 'blaze: designed',
    others: 'other burrows', kinMap: 'burrow map', gone: 'left home', notebook: 'notebook', callers: 'callers caught {k}/{n}', silents: 'silent caught {k}/{n}',
    trill: 'trill', whistle: 'whistle', coyote: 'coyote', hawk: 'hawk', home: 'home', vacancy: 'vacancy', noVac: 'no vacancy',
    mum: 'mum', step: 'new female', dad: 'dad', newM: 'new male', helpV: 'help {v}', breedV: 'breed {v}', genes: 'your genes',
    daughters: 'daughters stay', sons: 'sons leave', dLeave: 'daughters leave', sStay: 'sons stay', season: 'season {n}/{m}', attack: 'attack {n}/{m}',
    spring: 'spring {n}/{m}', tags: 'tags {n}/{m}', lock: 'Lock in', call: 'Call', silentB: 'Stay silent', done: 'Done', help: 'Help', breed: 'Breed',
    notEq: '≠', ledger: 'kin vs cost', rich: 'rich', fair: 'fair', poor: 'poor', trueR: 'r {r}', sr: 'Σr {v}', xN: 'selection ×N', island: 'Cousin Island',
    tKin: 'Kin nearby', tTrill: 'Trill cost', tWhistle: 'Whistle cost', tFem: 'Females calling', tMale: 'Males calling', tSwap: 'Swapped meadow', tGenes: 'Gene copies', tLitter: 'Littermates', tChick: 'Chick relatedness', rbar: 'mean r', oneFather: 'one father', keyA: 'A: calling copy', keya: 'a: silent copy',
    sAtk: 'Attack', sOk: 'Good calls', sTags: 'Tags right', sSeason: 'Season', sF: 'Females calling', sM: 'Males calling', sVigF: 'You, as daughter',
    sVigM: 'You, as son', sSpring: 'Spring', sTot: 'Gene copies', sDir: 'Own young', sInd: 'Kin raised',
    called: 'called', silent: 'silent', est: 'from data', attackAx: 'attack', seasonAx: 'season', springAx: 'spring', sumR: 'Σr', costAx: 'risk',
    share: 'share', yours: 'yours', best: 'best', breakEven: 'break-even', model: 'model', females: 'females', males: 'males'
  },
  panels: [],
  interesting: {
    overcall: 'You called for neighbours worth less than the cost. Two cousins add ¼; a trill needs more than 0.55.',
    undercall: 'You stayed silent beside close kin. One sister and one cousin already make 0.625, above 0.55.',
    halfFull: 'You tagged half-sisters as full sisters. Another blaze means another father: r = ¼, not ½.',
    cousinHigh: 'You tagged cousins too high. A cousin through your mother’s sister is r = ⅛.',
    strangerKin: 'You tagged strangers or immigrant males as kin. Males here came from other burrows: r = 0.',
    noSelfish: 'You never whistled when kin were few. The whistle saves the caller, so it pays with no kin at all.',
    trillFree: 'You marked the trill as free. Trillers were caught more often than silent squirrels.',
    sexGap: 'Female calling rose and male calling fell. Same rule, different kin nearby.',
    sexDrift: 'Drift blurred the gap this time, but the expected paths still parted.',
    pureKin: 'You bred whenever the nestlings were not close kin. Here helpers lay eggs too, which tipped those springs.',
    allHelp: 'You helped even beside a rich vacancy. Komdeur found helpers leave once good territories open.'
  },
  levers: {},
  take: 'Warn relatives when relatedness times benefit beats your cost; a call that saves the caller needs no kin.',
  body: 'Hamilton’s rule held in every attack: call when Σr × 0.4 beats 0.22. Daughters live among kin, so female calling spread; sons disperse, so it did not. The whistle saved its caller, so it needed no kin. On Cousin Island helpers lay eggs too. You gained {g} gene copies of a possible {b}.',
  law: { title: 'Hamilton’s rule' },
  boss: { inverts: 'Helpers here lay eggs too, so helping pays even for unrelated nestlings.' },
  stars: {
    discover: 'Call by Hamilton’s rule, tag kin well, or help like a warbler.',
    predict: 'Call the break-even, the two call costs, or the calling shares.',
    transfer: 'Judge the swapped meadow, or help where co-breeding pays.'
  },
  levelTake: [
    'A trill pays when the relatedness around you times 0.4 beats its cost, 0.22.',
    'Several fathers per litter: a sister with another blaze is a half-sister, r = ¼.',
    'The whistle saves its caller, so it pays with no kin near. Only the costly trill needs kin.',
    'Daughters stay among kin and sons leave, so calling spread in females and fell in males.'
  ],
  levelStars: [
    { discover: 'Make 7 of 8 calls the way Hamilton’s rule says.', predict: 'Drag the break-even relatedness inside the band.' },
    { discover: 'Tag 4 in 5 squirrels right, then make 6 good calls.', predict: 'Drag your mean relatedness to your littermates inside the band.' },
    { discover: 'Make 7 of 8 good calls, whistling once with few kin near.', predict: 'Place both call costs inside their bands.' },
    { predict: 'Call both calling shares at season 15 inside the bands.', transfer: 'Call male calling in the swapped meadow inside the band.' },
    { discover: 'Gain nearly the most gene copies possible over eight springs.', transfer: 'Help where only co-breeding pays, yet leave for rich vacancies.' }
  ],
  captions: {
    liveAtk: 'Attack {i}. You {a}. Relatedness nearby {r}.',
    liveSeason: 'Season {t}. Females calling {f} percent, males {m} percent.',
    liveSpring: 'Spring {t}. Help {h}, breed {b} gene copies.',
    mOk: 'Calls that matched Hamilton’s rule, counted with true relatedness.',
    mTags: 'Squirrels whose tag matches their true relatedness to you.',
    mF: 'Share of calling copies at the locus expressed in females.',
    mM: 'Share of calling copies at the locus expressed in males.',
    mTot: 'Expected gene copies: own young × ½ plus extra kin raised × r.'
  },
  model: [
    { level: 0, simulated: 'A colony of about 14 squirrels with a known pedigree. Each coyote attack, you and two to five neighbours are in view. A trill raises your risk by 0.22; each warned neighbour avoids 0.4.', simplification: 'Costs and benefits are fixed. At most one squirrel is caught an attack, with chance 0.3 × its risk. If caught, you play on as a full sister.', params: [{ name: 'benefit to a warned neighbour B', value: 0.4, tag: 'designed' }, { name: 'trill cost C', value: 0.22, tag: 'designed' }, { name: 'catch chance per risk unit', value: 0.3, tag: 'designed' }], cannot: 'Learning, age, or calls that change how predators hunt.', nature: 'Sherman found females with kin nearby trilled more, and trillers were stalked and chased more than silent squirrels.', contested: false, refs: ['ham1964', 'sh1977'] },
    { level: 1, simulated: 'A new spring. Litters come up with their mothers; fathers are unseen. Each pup wears its father’s face blaze. Your tags, not the truth, are what you read in the attacks.', simplification: 'The face blaze is a designed cue: real squirrels carry no such mark. Each litter has one or two sires.', params: [{ name: 'father’s face blaze', value: 'one per sire', tag: 'designed' }, { name: 'sires per litter', value: '1–2', tag: 'designed' }], cannot: 'How squirrels themselves tell kin apart.', nature: 'Hanken and Sherman found 78% of 27 litters had two or more fathers. Full sisters fought less than half-sisters (Holmes and Sherman 1982).', contested: false, refs: ['hs1981', 'hol1982'] },
    { level: 2, simulated: 'Hawks arrive. A whistle warns neighbours too. But the whistler bolts for cover, so its risk falls by 0.26. A notebook tallies catches of callers and silent squirrels by predator.', simplification: 'The whistle’s cost is set from the direction of Sherman’s finding; its size is designed. Each notebook entry is 40 encounters.', params: [{ name: 'whistle cost', value: -0.26, tag: 'designed' }, { name: 'trill cost', value: 0.22, tag: 'designed' }, { name: 'encounters a notebook entry', value: 40, tag: 'designed' }], cannot: 'Why some squirrels call before bolting and others after.', nature: 'Sherman watched 664 hawk encounters at Tioga Pass, most staged with trained raptors. Fewer whistlers than silent squirrels were killed (Sherman 1985).', contested: false, refs: ['sh1985'] },
    { level: 3, simulated: 'Two calling alleles: one acts in females, one in males. Each season a copy’s fitness moves by Σr × 0.4 − 0.22 near its carrier. Then 400 copies are drawn.', simplification: 'Neighbours’ relatedness is set by dispersal, not counted. Daughters live among Σr ≈ 0.9 of kin; sons among 0.05.', params: [{ name: 'copies per locus', value: 400, tag: 'designed' }, { name: 'Σr near daughters', value: 0.9, tag: 'designed' }, { name: 'Σr near sons', value: 0.05, tag: 'designed' }, { name: 'selection a season', value: 2.6, tag: 'xN', real: 'calls cost far less a season' }], cannot: 'Kin structure built up from births and deaths. Real calling has no known single gene.', nature: 'Belding’s males leave home before they breed; females settle near their mothers (Holekamp 1984). Females called far more than males (Sherman 1977).', contested: false, refs: ['sh1977', 'hol1984'] },
    { level: 4, simulated: 'Eight springs on Cousin Island. A young female warbler helps at home or breeds on a vacancy. Gene copies count own young × ½ plus extra kin raised × r.', simplification: 'Helping adds 0.6 × home quality young; a helper lays her own egg with chance 0.44. Extra-group fathers sire 40% of young.', params: [{ name: 'helpers that co-breed', value: 0.44, tag: 'realistic', real: '44% of female helpers bred' }, { name: 'extra-group young', value: 0.4, tag: 'realistic', real: '40% of young' }, { name: 'young from helping', value: '0.6 × quality', tag: 'designed' }], cannot: 'Helpers that hinder on poor territories, or sex ratios set by breeders.', nature: 'When moved birds freed territories, helpers left to breed (Komdeur 1992). Helpers fed more when the breeder was their mother (Richardson and colleagues 2003).', contested: false, refs: ['kom1992', 'ric2001', 'ric2002', 'ric2003'] }
  ],
  why: {
    real: [
      'Paul Sherman watched Belding’s ground squirrels at Tioga Pass. Females with mothers, sisters or daughters nearby trilled at coyotes more. Males, which leave home, rarely called. Trillers were stalked and chased more than silent squirrels (Sherman 1977).',
      'Litters often have several fathers (Hanken and Sherman 1981). Hawk whistles differ: fewer whistlers than silent squirrels were killed, so whistles look selfish (Sherman 1985).',
      'Seychelles warbler helpers left home when territories were freed (Komdeur 1992). Of female helpers, 44% laid eggs in the nest they helped at. They made 15% of young (Richardson and colleagues 2001).'
    ],
    maths: [
      'Hamilton’s rule: a gene for helping spreads when rB > C. Here each warned neighbour avoids B = 0.4 risk. A trill costs C = 0.22. So call when Σr × 0.4 > 0.22, that is Σr > 0.55.',
      'Relatedness r is the chance that a gene in you is also in them by descent. Full sister ½; half-sister ¼; mother’s sister ¼; her daughter ⅛.',
      'A whistle’s cost is negative, so Σr × 0.4 − C is positive with no kin at all. A behaviour that helps the actor needs no kin.'
    ]
  }
};

const AL_hit = (s, id) => { const A = AL_ASK[id]; return s.pred[id] != null && s.exp[id] != null && Math.abs(s.pred[id] - s.exp[id]) <= A.tol + 1e-9; };
const AL_real = (s, id) => s.exp[id] != null && s.at0[id] != null && Math.abs(s.exp[id] - s.at0[id]) >= 0.15 - 1e-9;
const AL_val = (sr, pred) => sr * AL_B - AL_C[pred];   // the call's inclusive gain in ledger units (true relatedness)

const CH_ALARM_V2 = {
  id: 'alarm', v2: true, role: 'animal', place: 'meadow', accent: '#6E5AA8',
  intro: { goal: 'Warn your kin, read your family, and count your genes.' },
  content: AL_TEXT,
  P: {
    B: { v: AL_B, tag: 'designed', min: 0.1, max: 0.8, label: 'benefit of a warning' },
    C: { v: AL_C.coyote, tag: 'designed', min: 0, max: 0.6, label: 'trill cost' },
    sigma: { v: AL_C4.sigma, tag: 'xN', min: 0.5, max: 5, real: 'calls cost far less a season', label: 'selection a season' }
  },
  levels: [
    { name: 'Coyote at dusk', adds: 'the cost of a call', codes: ['K1'], minutes: 2 },
    { name: 'Who’s my sister?', adds: 'fathers you cannot see', codes: ['K2'], minutes: 3 },
    { name: 'The hawk', adds: 'a second predator', codes: ['K3'], minutes: 3 },
    { name: 'The colony map', adds: 'sex-biased dispersal', codes: ['K4'], minutes: 3 },
    { name: 'Help or breed', adds: 'helpers that lay eggs', codes: ['K5'], minutes: 2.5 }
  ],
  keys: { C: 'call', S: 'stay silent', D: 'done tagging', H: 'help', B: 'breed', P: 'predict', Enter: 'lock in' },
  untimed: true,
  teacher: { prompts: ['A sister has r = ½. Does she carry only half of the genes you carry?', 'Is the hawk whistle altruistic? What evidence would decide it?', 'This model fixes costs and sets relatedness by dispersal. Which simplification most changes the result?'], pool: 'trace' },
  starTraits: ['caller', 'silent'],
  encodings: [   // calling alleles in the colony read-out only (D4 §2.2 rule 4): caller blue, silent amber, each with its letter
    { k: 'caller', rgb: [107, 151, 255], channels: ['colour', 'letter'] },
    { k: 'silent', rgb: [242, 201, 76], channels: ['colour', 'letter'] }
  ],
  unitStars(lv) {   // D1's cross-level stars: Discover and Predict on two levels each; Transfer on one
    const c = b => lv.filter(m => m & b).length;
    return (c(1) >= 2 ? 1 : 0) | (c(2) >= 2 ? 2 : 0) | (c(4) >= 1 ? 4 : 0);
  },

  /* ================= headless simulation (API_v2 §9.3): R() and plain JSON only ================= */
  sim: {
    dt: 1 / 30, s: null,
    // ---- the colony (L1–L3): relations to you; the pedigree is drawn from them ----
    colony() {
      const yb = R() < 0.5 ? 'stripe' : 'chevron', ob = yb === 'stripe' ? 'chevron' : 'stripe', col = [], add = (id, rel, sex, blaze) => col.push({ id, rel, sex, blaze: blaze || null, alive: true });
      const nF = 2 + (R() < 0.5 ? 1 : 0), nH = 1 + (R() < 0.5 ? 1 : 0), nC = 2 + (R() < 0.5 ? 1 : 0);
      add('mo', 'mo', 'f'); add('au', 'au', 'f');
      for (let i = 1; i <= nF; i++) add('f' + i, 'fs', 'f', yb);
      for (let i = 1; i <= nH; i++) add('h' + i, 'hs', 'f', ob);
      for (let i = 1; i <= nC; i++) add('c' + i, 'co', 'f', 'spot');
      add('u1', 'un', 'f'); add('u2', 'un', 'f'); add('m1', 'im', 'm'); add('m2', 'im', 'm'); add('m3', 'im', 'm');
      return { col, yb, ob, brb: R() < 0.5 ? yb : ob };
    },
    tagOf(rel) { const r = AL_REL[rel]; return r === 0.5 ? '1/2' : r === 0.25 ? '1/4' : r === 0.125 ? '1/8' : '0'; },
    tagR(t) { return t === '1/2' ? 0.5 : t === '1/4' ? 0.25 : t === '1/8' ? 0.125 : 0; },
    member(s, id) { for (const m of s.col) if (m.id === id) return m; return null; },
    pool(s) { return s.col.filter(m => m.alive && m.id !== s.me); },
    // neighbours for an attack: 2–5 squirrels; want: 1 call pays, 0 silence pays, 'low' Σr < 0.55, null any
    pickNb(s, pred, want) {
      let best = null;
      for (let tries = 0; tries < 40; tries++) {
        const P = this.pool(s).slice(), n = Math.min(P.length, 2 + Math.floor(R() * 4)), nb = [];
        for (let k = 0; k < n; k++) { const j = Math.floor(R() * P.length); nb.push(P[j].id); P.splice(j, 1); }
        let sr = 0; for (const id of nb) sr += AL_REL[this.member(s, id).rel];
        const v = AL_val(sr, pred); best = nb;
        if (want === 'low') { if (sr < 0.55 - 1e-9) return nb; continue; }
        if (Math.abs(v) < 0.02) continue;
        if (want == null || (want === 1) === (v > 0)) return nb;
      }
      return best;
    },
    plan(level) {   // the attack list: predators and what each attack should test, shuffled with R()
      const L = AL_LV[level], sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
      if (level === 2) return [['coyote', null], ['hawk', null]].concat(sh([['coyote', 1], ['coyote', 0], ['coyote', 1], ['coyote', 0], ['hawk', 'low'], ['hawk', 'low'], ['hawk', null], ['hawk', null]]));
      const w = []; for (let i = 0; i < L.n; i++) w.push(['coyote', i % 2 ? 0 : 1]); return sh(w);
    },
    reset(level, o) {
      o = o || {}; const L = AL_LV[level];
      this.s = { level, phase: 'start', pt: 0, time: 0, unt: !!(o.unt || (Save.d && Save.d.ui && Save.d.ui.unt)), log: [], asks: [], at0: {}, pred: {}, exp: {}, ask: null, voided: {} };
      const s = this.s;
      if (L.colony) return this.reset4(s);
      if (L.warbler) return this.reset5(s);
      const c = this.colony(); s.col = c.col; s.yb = c.yb; s.ob = c.ob; s.brb = c.brb; s.me = 'me'; s.meId = 'me'; s.tags = {}; s.recs = []; s.ai = 0; s.atk = null; s.n = L.n; s.died = 0;
      s.tally = { coyote: [0, 0, 0, 0], hawk: [0, 0, 0, 0] };   // [callers seen, callers caught, silent seen, silent caught]
      if (L.truth) for (const m of s.col) s.tags[m.id] = this.tagOf(m.rel);
      s.plan = this.plan(level);
      if (L.peace) { s.phase = 'peace'; this.openAsk(s, [], 'lm'); return; }
      this.newAttack(s, []);
    },
    // ---- attacks ----
    newAttack(s, ev) {
      const [pred, want] = s.plan[s.ai], nb = this.pickNb(s, pred, want);
      let sr = 0, srt = 0; for (const id of nb) { sr += AL_REL[this.member(s, id).rel]; srt += this.tagR(s.tags[id]); }
      s.atk = { i: s.ai, pred, nb, tags: nb.map(id => s.tags[id] || null), sr, srt, a: null, slow: false, victim: null, you: false, t: 0, st: 'tell' };
      s.phase = 'attack'; ev.push({ k: 'tell', pred, i: s.ai });
    },
    decideT(s) { return AL_T.decide[Math.min(s.level, 3)]; },
    first(s) { return s.level !== 3 && s.ai === 0; },   // the first attack of a level waits for you
    choose(s, a, ev) {
      const A = s.atk; if (!A || (A.st !== 'decide' && A.st !== 'tell') || A.a != null) return;   // a call as the predator appears counts too
      A.a = a ? 1 : 0; A.st = 'strike'; A.t = 0;
      ev.push({ k: 'call', a: A.a, pred: A.pred, slow: A.slow });
      this.strike(s, ev);
    },
    strike(s, ev) {   // at most one victim: one R() walks the cumulative catch chances (k × risk)
      const A = s.atk, call = A.a === 1, K = AL_RISK.k, fsAlive = s.col.some(m => m.alive && m.rel === 'fs' && m.id !== s.me);
      const mine = call ? (A.pred === 'hawk' ? AL_RISK.whistle : AL_RISK.trill) : AL_RISK.sil, list = [];
      if (s.level === 3 || fsAlive) list.push(['@me', mine]);   // designed floor: with no full sister left to play on as, you are not caught
      for (const id of A.nb) list.push([id, call ? AL_RISK.warned : AL_RISK.open]);
      const u = R(); let cum = 0, vic = null;
      for (const [id, r] of list) { cum += K * r; if (u < cum) { vic = id; break; } }
      if (s.level === 3) { A.victim = vic === '@me' ? '@me' : vic; A.you = vic === '@me'; }
      else if (vic === '@me') { A.you = true; const m = this.member(s, s.me); if (m) m.alive = false; const sis = s.col.find(q => q.alive && q.rel === 'fs' && q.id !== s.me); s.meOld = s.me; s.me = sis.id; sis.you = true; s.died++; A.victim = '@me'; }
      else if (vic) { A.victim = vic; this.member(s, vic).alive = false; }
      if (s.tally) { this.notebook(s, A.pred); if (s.level === 2) (s.estH = s.estH || []).push([A.i + 1, this.est(s, 'coyote'), this.est(s, 'hawk')]); }
      const v = AL_val(A.sr, A.pred), best = v > 0 ? 1 : 0;
      s.recs.push({ i: A.i, pred: A.pred, sr: A.sr, srt: A.srt, a: A.a, best, v, ok: A.a === best, slow: A.slow, vig: A.vig || null });
      ev.push({ k: 'strike', victim: A.victim, you: A.you, pred: A.pred });
    },
    notebook(s, pred) {   // L3's tally: 40 background encounters a notebook entry (only from the hawk level on)
      if (s.level !== 2) return; const T = s.tally[pred], K = AL_RISK.k;
      for (let i = 0; i < 40; i++) { const c = R() < 0.5; if (c) { T[0]++; if (R() < K * (pred === 'hawk' ? AL_RISK.whistle : AL_RISK.trill)) T[1]++; } else { T[2]++; if (R() < K * AL_RISK.sil) T[3]++; } }
    },
    est(s, pred) { const T = s.tally[pred]; if (!T[0] || !T[2]) return null; return (T[1] / T[0] - T[3] / T[2]) / AL_RISK.k; },   // extra risk to callers, in ledger units
    attackStep(s, dt, ev) {
      const A = s.atk; A.t += dt;
      if (A.st === 'tell') { if (A.t >= AL_T.tell) { A.st = 'decide'; A.t = 0; ev.push({ k: 'decide' }); } }
      else if (A.st === 'decide') { if (!s.unt && !this.first(s) && A.t >= this.decideT(s)) { A.slow = true; this.choose(s, 0, ev); } }
      else if (A.st === 'strike') { if (A.t >= AL_T.strike) { A.st = 'debrief'; A.t = 0; const r = s.recs[s.recs.length - 1]; ev.push({ k: 'debrief', ok: r.ok, v: r.v }); } }
      else if (A.st === 'debrief') { if (A.t >= AL_T.debrief) this.afterAttack(s, ev); }
    },
    afterAttack(s, ev) {
      if (s.level === 3) { this.season4(s, ev); return; }
      s.ai++; const L = AL_LV[s.level];
      if (L.askAt && s.ai === L.askAt && !s.asked) { s.asked = true; s.atk = null; s.qq = (L.asks || [L.ask]).slice(); this.openAsk(s, ev, s.qq.shift()); return; }
      if (s.ai >= s.n) { this.finish(s, ev); return; }
      this.newAttack(s, ev);
    },
    // ---- predictions ----
    openAsk(s, ev, id) {
      const A = AL_ASK[id]; s.ask = { id, kind: 'y', lo: A.lo, hi: A.hi, tol: A.tol }; s.asks.push(id); s.at0[id] = this.now(s, id);
      s.phase = 'ask'; s.pt = 0; ev.push({ k: 'ask', id });
    },
    now(s, id) { if (id === 'lm' || id === 'eg') return 0.5; if (id === 'f4') return s.c4.p0[0]; if (id === 'm4') return s.c4.p0[1]; if (id === 'sw') return s.c4.sw0[1]; return 0; },
    askDone(s, ev) {
      const id = s.ask.id; s.ask = null;
      if (id === 'lm') { s.phase = 'peace'; return; }
      if (id === 'eg') { s.phase = 'spring'; s.pt = 0; ev.push({ k: 'spring', i: 0 }); return; }
      if (s.qq && s.qq.length) { this.openAsk(s, ev, s.qq.shift()); return; }
      if (s.level === 3) { if (id === 'sw') { s.phase = 'swap'; s.pt = 0; ev.push({ k: 'swap' }); } else this.nextSeason(s, ev); return; }
      this.newAttack(s, ev);
    },
    // ---- L4: the colony map (two sex-limited calling loci, Wright–Fisher on 400 copies each) ----
    reset4(s) {
      const j = () => Math.round((0.35 + 0.3 * R()) * 100) / 100;
      s.c4 = { t: 0, p0: [j(), j()], sw0: [j(), j()], p: null, hist: [], vig: [], sw: null, swHist: [], rec: [] };
      s.c4.p = s.c4.p0.slice(); s.c4.hist.push([0, s.c4.p[0], s.c4.p[1]]);
      s.recs = []; s.col = []; s.tags = {}; s.me = 'me'; s.ai = 0; s.atk = null;
      s.qq = ['m4']; this.openAsk(s, [], 'f4');
    },
    a4(R2, call) { return AL_C4.sigma * (R2 * AL_B - AL_C.coyote) / 4 * (call == null ? 1 : call); },   // a copy's fitness gain: additive (½) and expressed in one sex (½)
    // live runs draw the 400 copies with WF.binom on R(); the expectation's replays use the same binomial on a private PRNG
    binom(n, p, rnd) {
      if (rnd === R && typeof WF !== 'undefined') return WF.binom(n, p);
      if (p <= 0) return 0; if (p >= 1) return n; if (p > 0.5) return n - this.binom(n, 1 - p, rnd);
      const q = 1 - p; if (n * p < 30) { const u = rnd(); let f = 1; for (let i = 0; i < n; i++) f *= q; let k = 0, c = f; while (u > c && k < n) { f *= (n - k) / (k + 1) * p / q; k++; c += f; } return k; }
      let u = 0; while (u === 0) u = rnd(); const g = Math.sqrt(-2 * Det.log(u)) * Det.cos(TAU * rnd());
      return Math.max(0, Math.min(n, Math.floor(n * p + 0.5 + Math.sqrt(n * p * q) * g)));
    },
    wf4(p, a, rnd) { const q = p * (1 + a) / (1 + a * p), n = 2 * AL_C4.N; return this.binom(n, q, rnd) / n; },
    gen4(p, swap, rnd) { const Rf = swap ? AL_C4.Rm : AL_C4.Rf, Rm = swap ? AL_C4.Rf : AL_C4.Rm; return [this.wf4(p[0], this.a4(Rf), rnd), this.wf4(p[1], this.a4(Rm), rnd)]; },
    exp4(p0, swap, seedv, path) {   // the mean of M replays on a private PRNG; path (optional) receives the mean trajectory [[t, f, m]…]
      const r = rng(seedv), M = AL_C4.M, T = AL_C4.T, acc = []; for (let t = 0; t <= T; t++) acc.push([t, 0, 0]);
      for (let m = 0; m < M; m++) { let p = p0.slice(); acc[0][1] += p[0]; acc[0][2] += p[1]; for (let t = 1; t <= T; t++) { p = this.gen4(p, swap, r); acc[t][1] += p[0]; acc[t][2] += p[1]; } }
      for (const q of acc) { q[1] /= M; q[2] /= M; } if (path) path.push(...acc); return [acc[T][1], acc[T][2]];
    },
    vigNb(s, female) {   // the vignette: a daughter's neighbours are mostly kin; a son's are strangers
      const n = 3 + (R() < 0.5 ? 1 : 0), nb = [], tab = female ? [['mo', 0.2], ['fs', 0.2], ['hs', 0.2], ['co', 0.15], ['un', 0.25]] : [['br', 0.03], ['un', 0.97]];
      for (let k = 0; k < n; k++) { let u = R(), rel = tab[tab.length - 1][0]; for (const [r, w] of tab) { if (u < w) { rel = r; break; } u -= w; } nb.push({ id: 'v' + s.c4.t + '_' + k, rel, sex: rel === 'un' && !female ? 'm' : 'f', alive: true }); }
      return nb;
    },
    nextSeason(s, ev) {
      const C = s.c4;
      if (C.t < AL_C4.vig) {   // a vignette attack: you as a daughter (odd seasons) or a son
        const female = C.t % 2 === 0, nb = this.vigNb(s, female); s.col = nb; s.tags = {}; for (const m of nb) s.tags[m.id] = this.tagOf(m.rel);
        let sr = 0; for (const m of nb) sr += AL_REL[m.rel];
        s.atk = { i: C.t, pred: 'coyote', nb: nb.map(m => m.id), tags: nb.map(m => s.tags[m.id]), sr, srt: sr, a: null, slow: false, victim: null, you: false, t: 0, st: 'tell', vig: female ? 'f' : 'm' };
        s.ai = C.t; s.phase = 'attack'; ev.push({ k: 'tell', pred: 'coyote', i: C.t, vig: female ? 'f' : 'm' });
      } else { s.phase = 'auto'; s.pt = 0; s.atk = null; }
    },
    season4(s, ev) {
      const C = s.c4; C.p = this.gen4(C.p, false, R); C.t++; C.hist.push([C.t, C.p[0], C.p[1]]);
      s.phase = 'season'; s.pt = 0; s.atk = null; ev.push({ k: 'season', t: C.t });
    },
    swapStep(s, ev) {
      const C = s.c4; if (!C.sw) { C.sw = C.sw0.slice(); C.swHist = [[0, C.sw[0], C.sw[1]]]; }
      C.sw = this.gen4(C.sw, true, R); C.swHist.push([C.swHist.length, C.sw[0], C.sw[1]]); ev.push({ k: 'swtick', t: C.swHist.length - 1 });
      if (C.swHist.length - 1 >= AL_C4.T) this.finish(s, ev);
    },
    // ---- L5: Cousin Island ----
    rNest(br, sire) { const pd = 1 - AL_W.egp; return br === 'mum' ? (sire === 'dad' ? pd * 0.5 + AL_W.egp * 0.25 : 0.25) : (sire === 'dad' ? pd * 0.25 : 0); },
    vals(sp) { const r = this.rNest(sp.br, sp.sire), kin = sp.q * AL_W.help * r, own = sp.q * AL_W.cob * AL_W.own; return { r, kin, own, vH: kin + own, vB: sp.vac ? AL_W.brood * sp.vac : 0 }; },
    reset5(s) {
      const order = AL_SPRINGS.map((x, i) => i); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = order[i]; order[i] = order[j]; order[j] = t; }
      s.sp = order.map(i => { const [q, br, sire, vac] = AL_SPRINGS[i], sp = { q, br, sire, vac }, V = this.vals(sp); return Object.assign(sp, { r: V.r, kin: V.kin, own: V.own, vH: V.vH, vB: V.vB, inv: V.vH > V.vB && V.kin < V.vB, a: null, coop: false }); });
      s.si = 0; s.phase = 'spring'; s.pt = 0; s.tot = 0; s.dir = 0; s.ind = 0; this.openAsk(s, [], 'eg');
    },
    best5(s) { let b = 0; for (const sp of s.sp) b += Math.max(sp.vH, sp.vB); return b; },
    springStep(s, dt, ev) {
      if (s.phase === 'fly') { s.pt += dt; if (s.pt >= AL_T.fly) { s.phase = 'tally'; s.pt = 0; ev.push({ k: 'tally', i: s.si }); } }
      else if (s.phase === 'tally') { s.pt += dt; if (s.pt >= AL_T.tally) { s.si++; if (s.si >= s.sp.length) this.finish(s, ev); else { s.phase = 'spring'; s.pt = 0; ev.push({ k: 'spring', i: s.si }); } } }
    },
    choose5(s, a, ev) {
      if (s.phase !== 'spring') return; const sp = s.sp[s.si]; sp.a = a;
      if (a === 'help') { sp.coop = R() < AL_W.cob; s.tot += sp.vH; s.dir += sp.own; s.ind += sp.kin; }
      else { s.tot += sp.vB; s.dir += sp.vB; }
      s.phase = 'fly'; s.pt = 0; ev.push({ k: 'chose', a, coop: sp.coop, vac: sp.vac });
    },
    // ---- the end ----
    finish(s, ev) {
      s.phase = 'over'; s.ask = null; if (s.atk) s.atk.st = 'done';
      for (const id of s.asks) s.exp[id] = this.expect(s, id);
      ev.push({ k: 'over' });
    },
    expect(s, id) {
      if (id === 'be') return AL_C.coyote / AL_B;
      if (id === 'tr') return AL_C.coyote;
      if (id === 'wh') return AL_C.hawk;
      if (id === 'lm') { let t = 0, n = 0; for (const m of s.col) if (m.rel === 'fs' || m.rel === 'hs') { t += AL_REL[m.rel]; n++; } return n ? t / n : null; }
      if (id === 'eg') return this.rNest('mum', 'dad');
      const sd = (Math.round(s.c4.p0[0] * 100) * 131 + Math.round(s.c4.p0[1] * 100) * 7 + Math.round(s.c4.sw0[1] * 100) * 3) >>> 0;   // a private PRNG: R() and the run stay untouched
      if (id === 'f4' || id === 'm4') { if (!s.exp4) { const P = []; s.exp4 = this.exp4(s.c4.p0, false, sd + 11, P); s.exp4path = P; } return id === 'f4' ? s.exp4[0] : s.exp4[1]; }
      if (id === 'sw') return this.exp4(s.c4.sw0, true, sd + 23)[1];
      return null;
    },
    // ---- the frame ----
    step(dt) {
      const s = this.s, ev = []; s.time += dt;
      if (s.phase === 'attack') this.attackStep(s, dt, ev);
      else if (s.phase === 'ask') { s.pt += dt; const id = s.ask.id; if (s.pred[id] != null || s.voided[id] || (!s.unt && s.pt >= AL_T.ask)) this.askDone(s, ev); }
      else if (s.phase === 'season') { s.pt += dt; if (s.pt >= AL_T.season) this.nextSeason(s, ev); }
      else if (s.phase === 'auto') { s.pt += dt; if (s.pt >= AL_T.auto) { s.pt = 0; const C = s.c4; C.p = this.gen4(C.p, false, R); C.t++; C.hist.push([C.t, C.p[0], C.p[1]]); ev.push({ k: 'season', t: C.t, auto: true }); if (C.t >= AL_C4.T) { s.qq = []; this.openAsk(s, ev, 'sw'); } } }
      else if (s.phase === 'swap') { s.pt += dt; if (s.pt >= AL_T.swap) { s.pt = 0; this.swapStep(s, ev); } }
      else if (s.phase === 'fly' || s.phase === 'tally') this.springStep(s, dt, ev);
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!a || s.phase === 'over') return ev;
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id && s.pred[a.id] == null) { const A = AL_ASK[a.id]; s.pred[a.id] = Math.max(A.lo, Math.min(A.hi, +a.v || 0)); ev.push({ k: 'predicted', id: a.id }); } return ev; }
      if (a.k === 'void') { if (s.ask && a.id === s.ask.id) s.voided[a.id] = 1; return ev; }
      if (a.k === 'call') { if (s.phase === 'attack') this.choose(s, a.a, ev); return ev; }
      if (a.k === 'tag') {
        if (s.phase !== 'peace' || a.id === s.me) return ev; const m = this.member(s, a.id); if (!m || AL_TAGS.indexOf(a.t) < 0) return ev;
        s.tags[a.id] = a.t; ev.push({ k: 'tagged', id: a.id, t: a.t }); return ev;
      }
      if (a.k === 'done') { if (s.phase === 'peace') { s.tagAcc = this.tagAcc(s); this.newAttack(s, ev); } return ev; }
      if (a.k === 'start') return ev;
      if (a.k === 'choose') { if (s.level === 4) this.choose5(s, a.a === 'help' ? 'help' : 'breed', ev); return ev; }
      return ev;
    },
    tagAcc(s) { let ok = 0, n = 0; for (const m of s.col) { if (m.id === s.me) continue; n++; if (s.tags[m.id] === this.tagOf(m.rel)) ok++; } return n ? ok / n : 0; },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_ALARM_V2.stars, n = s.level, mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { ok: (s.recs || []).filter(r => r.ok).length, tot: s.tot }, interesting: this.interesting(s) };
    },
    interesting(s) {   // the card's Interesting line, chosen from what happened
      const n = s.level, R0 = (s.recs || []).filter(r => !r.ok);
      if (n === 0) { const o = R0.filter(r => r.a === 1).length, u = R0.filter(r => r.a === 0 && !r.slow).length; if (R0.length >= 2) return o >= u ? 'overcall' : 'undercall'; return null; }
      if (n === 1) {
        const err = { halfFull: 0, cousinHigh: 0, strangerKin: 0 };
        for (const m of s.col) { const t = s.tags[m.id]; if (!t || m.id === s.me) continue; if (m.rel === 'hs' && t === '1/2') err.halfFull++; else if (m.rel === 'co' && (t === '1/2' || t === '1/4')) err.cousinHigh++; else if ((m.rel === 'un' || m.rel === 'im') && t !== '0') err.strangerKin++; }
        let k = null, b = 0; for (const q in err) if (err[q] > b) { b = err[q]; k = q; } return k;
      }
      if (n === 2) { if (s.pred.tr != null && s.pred.tr <= 0) return 'trillFree'; if (!(s.recs || []).some((r, i) => i >= 2 && r.pred === 'hawk' && r.a === 1 && r.sr < 0.55)) return 'noSelfish'; return null; }
      if (n === 3) { const h = s.c4.hist, a = h[0], z = h[h.length - 1]; return z[1] - a[1] >= 0.1 && a[2] - z[2] >= 0.1 ? 'sexGap' : 'sexDrift'; }
      if (n === 4) { if (s.sp.filter(sp => sp.inv && sp.a === 'breed').length >= 2) return 'pureKin'; if (s.sp.some(sp => sp.vac >= 0.9 && sp.a === 'help')) return 'allHelp'; }
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s || s.phase === 'over') return out;
      if (s.ask) { const A = AL_ASK[s.ask.id], m = Math.round((A.hi - A.lo) / A.step); for (let i = 0; i <= m; i++) out.push({ k: 'predict', id: s.ask.id, v: Math.round((A.lo + i * A.step) * 1000) / 1000 }); return out; }
      if (s.phase === 'peace') { for (const m of s.col) for (const t of AL_TAGS) out.push({ k: 'tag', id: m.id, t }); out.push({ k: 'done' }); return out; }
      if (s.phase === 'attack' && s.atk && s.atk.st === 'decide') { out.push({ k: 'call', a: 1 }, { k: 'call', a: 0 }); return out; }
      if (s.phase === 'spring') out.push({ k: 'choose', a: 'help' }, { k: 'choose', a: 'breed' });
      return out;
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    near(acts, v) { let best = null, bd = 1e9; for (const a of acts) if (a.k === 'predict') { const d = Math.abs(a.v - v); if (d < bd) { bd = d; best = a; } } return best; },
    bots: {
      alwaysA(s, acts) {   // always call (always help); predicts the axis bottom; tags everything ½ and moves on
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[0];
        if (s.phase === 'peace') { const m = s.col.find(q => !s.tags[q.id]); return m ? { k: 'tag', id: m.id, t: '1/2' } : { k: 'done' }; }
        return acts.find(a => (a.k === 'call' && a.a === 1) || (a.k === 'choose' && a.a === 'help')) || null;
      },
      alwaysB(s, acts) {   // never call (always breed); predicts the axis top; tags nothing
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[acts.length - 1];
        if (s.phase === 'peace') return { k: 'done' };
        return acts.find(a => (a.k === 'call' && a.a === 0) || (a.k === 'choose' && a.a === 'breed')) || null;
      },
      greedy(s, acts) {   // knows the truth and plays Hamilton's rule with the trill's cost for every call; kin-only in the boss; predicts no change
        const S = CH_ALARM_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, S.now(s, s.ask.id));
        if (s.phase === 'peace') { const m = s.col.find(q => s.tags[q.id] !== S.tagOf(q.rel)); return m ? { k: 'tag', id: m.id, t: S.tagOf(m.rel) } : { k: 'done' }; }
        if (s.phase === 'attack') return { k: 'call', a: s.atk.sr * AL_B > AL_C.coyote ? 1 : 0 };
        if (s.phase === 'spring') { const sp = s.sp[s.si]; return { k: 'choose', a: sp.kin > sp.vB ? 'help' : 'breed' }; }
        return null;
      },
      threshold(s, acts) {   // a rule of thumb: call when two or more neighbours wear kin tags; help when home is rich; predicts mid-axis
        const S = CH_ALARM_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') { const A = AL_ASK[s.ask.id]; return S.near(acts, (A.lo + A.hi) / 2); }
        if (s.phase === 'peace') { const m = s.col.find(q => !s.tags[q.id]); return m ? { k: 'tag', id: m.id, t: m.blaze ? '1/2' : '0' } : { k: 'done' }; }
        if (s.phase === 'attack') return { k: 'call', a: s.atk.tags.filter(t => t && t !== '0').length >= 2 ? 1 : 0 };
        if (s.phase === 'spring') return { k: 'choose', a: s.sp[s.si].q >= 0.6 ? 'help' : 'breed' };
        return null;
      },
      whistler(s, acts) {   // the D1 oracle bot: whistles at every hawk, trills by the tags; predicts the trill's cost for both calls
        const S = CH_ALARM_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, s.ask.id === 'tr' || s.ask.id === 'wh' ? AL_C.coyote : S.now(s, s.ask.id));
        if (s.phase === 'peace') return { k: 'done' };
        if (s.phase === 'attack') return { k: 'call', a: s.atk.pred === 'hawk' || s.atk.srt * AL_B > AL_C.coyote ? 1 : 0 };
        if (s.phase === 'spring') return { k: 'choose', a: 'help' };
        return null;
      }
    }
  },

  /* ---- stars: pure functions of the final state, scored against the expectation (true relatedness, model costs) ---- */
  stars: {
    discover: (s, n) => {
      const R = s.recs || [], ok = R.filter(r => r.ok).length;
      if (n === 0) return R.length >= 8 && ok >= 7 && R.some(r => r.a === 1 && r.best === 1) && R.some(r => r.a === 0 && r.best === 0);
      if (n === 1) return (s.tagAcc || 0) >= 0.8 - 1e-9 && ok >= 6;
      if (n === 2) { const P = R.filter((r, i) => i >= 2); return P.length >= 8 && P.filter(r => r.ok).length >= 7 && P.some(r => r.pred === 'hawk' && r.a === 1 && r.sr * AL_B <= AL_C.coyote + 1e-9); }
      if (n === 4) return s.sp && s.sp.every(sp => sp.a) && s.tot >= CH_ALARM_V2.sim.best5(s) - 0.07 - 1e-9;
      return false;
    },
    predict: (s, n) => (n === 0 && AL_hit(s, 'be')) || (n === 1 && AL_hit(s, 'lm')) || (n === 2 && AL_hit(s, 'tr') && AL_hit(s, 'wh')) || (n === 3 && AL_hit(s, 'f4') && AL_hit(s, 'm4') && AL_real(s, 'f4') && AL_real(s, 'm4')),
    transfer: (s, n) => (n === 3 && AL_hit(s, 'sw') && AL_real(s, 'sw')) || (n === 4 && !!s.sp && s.sp.filter(sp => sp.inv && sp.a === 'help').length >= 3 && s.sp.every(sp => !(sp.vac >= 0.9) || sp.a === 'breed'))
  },
  // assignment links: bits 0–2 level, 3–5 mask, 6–9 good calls, 10–13 tags right ×10 (L2) or gene copies ×5 (L5), 14–20 first prediction ×100 (clamped)
  resultBits(s, level) {
    if (!s) return 0; const r = this.sim.result() || { mask: 0 }, ok = (s.recs || []).filter(q => q.ok).length;
    const t = level === 1 ? Math.round((s.tagAcc || 0) * 10) : level === 4 ? Math.round((s.tot || 0) * 5) : 0, id = s.asks && s.asks[0], p = id && s.pred[id] != null ? Math.round(Math.abs(s.pred[id]) * 100) : 0;
    return (level & 7) | ((r.mask & 7) << 3) | ((Math.min(15, ok)) << 6) | ((Math.min(15, t)) << 10) | ((Math.min(127, p)) << 14);
  },
  teacherStep() { const s = this.sim.s; if (!s) return; if (s.phase === 'attack' && s.atk && s.atk.st !== 'decide') s.atk.t = 99; else if (s.phase !== 'attack' && s.phase !== 'spring' && s.phase !== 'peace' && s.phase !== 'ask') s.pt = 99; },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {});
    if (typeof Url !== 'undefined' && Url.q && Url.q.untimed != null && !/^(0|false|no|off)$/i.test(Url.q.untimed)) o.unt = true;
    this.level = n; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._said = {};
    Sim.start(this, n, o);
    this.v = { t: 0, bg: null, bgKey: '', banner: null, rings: [], dash: {}, lift: null, pv: null, pvO: null, pop: 0, sq: 0, tok: [], mapT: 0, wing: 0, lastSig: '' };
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: this.levels[n].name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (typeof Ghost !== 'undefined') {
      const s = this.sim.s;
      if (n === 0) Ghost.show({ verb: 'tap', key: 'c', at: () => this.youAt(), until: () => (s.recs && s.recs.length > 0) || (s.atk && s.atk.a != null) });
      if (n === 1) Ghost.show({ verb: 'tap', at: () => this.nodeAt('f1'), until: () => Object.keys(this.sim.s.tags).length > 0 || this.sim.s.phase !== 'peace' });
      if (n === 4) Ghost.show({ verb: 'tap', key: 'h', at: () => { const G = this.geo5(); return [G.hx, G.ty]; }, until: () => this.sim.s.si > 0 || this.sim.s.phase !== 'spring' });
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },

  /* ---------- geometry (canvas px) ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  geo() {
    const W = Stage.w, H = Stage.h, u = Stage.u || 390, top = this.hudH() + 4, room = Math.max(240, H - top);
    const sky = top + Math.round(room * 0.2), ledY = H - 30, hero = Math.round(clamp(0.2 * u, 60, 112)), act = Math.round(clamp(0.13 * u, 42, 74));
    const yy = Math.min(ledY - 60 - hero * 0.3, sky + (ledY - sky) * 0.66);
    return { W, H, u, top, room, sky, ledY, hero, act, yx: W * 0.5, yy, by: yy + hero * 0.42 };
  },
  youAt() { const G = this.geo(); return [G.yx, G.yy]; },
  slots(n, G) {   // neighbours in an arc above you, spread to the width
    const out = [], w = Math.min(G.W - 60, 560), rx = w / 2, ry = Math.max(50, (G.yy - G.sky) * 0.62);
    for (let i = 0; i < n; i++) { const a = Math.PI * (0.12 + 0.76 * (n === 1 ? 0.5 : i / (n - 1))); out.push([G.yx - rx * Det.cos(a), G.yy - ry * Det.sin(a) + (i % 2) * 14]); }
    return out;
  },
  geoPeace() {
    const W = Stage.w, H = Stage.h, top = this.hudH() + 4, room = Math.max(260, H - top), surf = { x: 0, y: top, w: W, h: Math.round(room * 0.2) };
    const oth = { x: 36, y: H - Math.round(room * 0.15), w: W - 72, h: Math.round(room * 0.13) }, kin = { x: 36, y: surf.y + surf.h + 26, w: W - 72, h: oth.y - (surf.y + surf.h + 26) - 28 };
    return { W, H, top, room, surf, kin, oth };
  },
  geo5() {
    const W = Stage.w, H = Stage.h, top = this.hudH() + 4, room = Math.max(240, H - top), sea = H - Math.round(room * 0.16), ty = top + room * 0.47;
    return { W, H, top, room, sea, ty, hx: W * 0.22, vx: W * 0.78, yx: W * 0.5, yy: top + room * 0.3, jar: { x: W - 64, y: top + 10, w: 50, h: Math.round(room * 0.22) } };
  },
  nodeAt(id) { const v = this.v; for (const pv of [v.pv, v.pvO]) if (pv && pv.pos[id]) return [pv.pos[id].x, pv.pos[id].y]; const G = this.geoPeace(); return [G.W / 2, G.kin.y + G.kin.h * 0.8]; },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.pop = Math.max(0, v.pop - dt / 0.2); v.sq = Math.max(0, v.sq - dt / 0.25); v.mapT += dt;
    v.rings = v.rings.filter(r => (r.t += dt) < r.ms);
    if (v.lift) { v.lift.t += dt; if (v.lift.t > 1.4) v.lift = null; }
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    v.tok = v.tok.filter(k => (k.t += dt) < k.ms);
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  openAsk() {
    const s = this.sim.s, id = s.ask.id, A = AL_ASK[id]; this._asking = id; this._dockSig = ''; if (typeof Predict === 'undefined') return;
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    Predict.ask({ id, chart: A.chart, kind: 'y', axis: { lo: A.lo, hi: A.hi }, start: A.start, tol: A.tol, soft: null, needMove: true, linger: 600,
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'void', id }) });
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, final = n === AL_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (final) o.body = Txt.f(C.body, { g: (s.tot || 0).toFixed(2), b: this.sim.best5(s).toFixed(2) });
    o.stars = C.levelStars[n];
    for (const id of s.asks) if (s.exp[id] != null && typeof Predict !== 'undefined') Predict.reveal(id, s.exp[id], AL_ASK[id].tol);
    const spec = this.debrief();
    if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, snd = (n, x, y) => { if (typeof Snd2 !== 'undefined') Snd2.play(n, { x, y }); };
    if (e.k === 'tell') {
      const G = this.geo(); v.side = (e.i * 7 + s.level) % 2 ? 1 : -1; v.dash = {}; v.lift = null;
      if (F) F.ring(v.side > 0 ? G.W - 30 : 30, e.pred === 'hawk' ? G.sky - 10 : G.yy - 20, 26, { ms: 300 });
      snd(e.pred === 'hawk' ? 'wing' : 'swish', v.side > 0 ? G.W : 0, G.yy);
    } else if (e.k === 'decide') { v.sq = 1; }
    else if (e.k === 'call') {
      const G = this.geo(), p = this.youAt();
      if (e.a) { if (F) F.ring(p[0], p[1] - G.hero * 0.35, 16, { ms: 180 }); v.rings.push({ x: p[0], y: p[1] - G.hero * 0.35, t: 0, ms: 0.6, wavy: e.pred !== 'hawk' }, { x: p[0], y: p[1] - G.hero * 0.35, t: -0.12, ms: 0.72, wavy: e.pred !== 'hawk' }, { x: p[0], y: p[1] - G.hero * 0.35, t: -0.24, ms: 0.84, wavy: e.pred !== 'hawk' }); snd('peep', p[0], p[1]); this.whisper(e.pred === 'hawk' ? 'whistled' : 'called'); }
      else { if (F) F.ring(p[0], G.by, 18, { ms: 200 }); snd('tock', p[0], p[1]); this.whisper(e.slow ? 'slow' : 'silent'); }
      if (typeof Live !== 'undefined') { const A = s.atk; Live.say(Txt.f(C.captions.liveAtk, { i: A.i + 1, a: e.a ? C.labels.called : C.labels.silent, r: A.srt.toFixed(2) })); }
    } else if (e.k === 'strike') {
      const G = this.geo(), A = s.atk; let pos = null;
      if (e.victim === '@me') pos = this.youAt(); else if (e.victim) { const i = A.nb.indexOf(e.victim); const sl = this.slots(A.nb.length, G); if (i >= 0) pos = sl[i]; }
      if (pos) {
        v.lift = { x: pos[0], y: pos[1], t: 0, hawk: e.pred === 'hawk', id: e.victim };
        if (F) { F.after(260, () => { F.burst('dust', pos[0], pos[1], 10); if (e.pred === 'hawk') F.burst('scale', pos[0], pos[1] - 10, 6); F.shake(4, 160); F.ring(pos[0], pos[1], G.act * 0.55, { dashed: true, ms: 2000 }); }); }
        snd('crack', pos[0], pos[1]); this.whisper(e.you ? 'caught' : 'killed');
      } else this.whisper('none');
    } else if (e.k === 'debrief') {
      const G = this.geo(); if (F) { F.pop(e.ok ? '✓' : '✗', G.W - 40, G.ledY - 28, e.ok ? 1 : -1); F.tier(1, () => { }); }
      if (s.level !== 3) setTimeout(() => this.whisper(e.ok ? 'good' : 'bad'), 500);
    } else if (e.k === 'tagged') {
      const p = this.nodeAt(e.id); if (F) { F.ring(p[0], p[1], 20, { ms: 220 }); F.pop(PedigreeView.GLYPH[e.t], p[0], p[1] - 30, 0); } snd('tick', p[0], p[1]); v.lastTag = e.id;
    } else if (e.k === 'ask') { snd('interesting', Stage.w / 2, 80); }
    else if (e.k === 'predicted') {
      if (e.id === 'eg' && typeof Predict !== 'undefined') { const ex = this.sim.expect(s, 'eg'); Predict.reveal('eg', ex, AL_ASK.eg.tol); if (typeof Whisper !== 'undefined') Whisper.say(Txt.f(C.whispers.practice, { d: Math.abs(s.pred.eg - ex).toFixed(2) }), 'al-practice'); }
      if (typeof Predict !== 'undefined' && Predict.fold) setTimeout(() => Predict.fold(), e.id === 'eg' ? 1600 : 650);
    }
    else if (e.k === 'season' || e.k === 'swtick') {
      v.mapT = 0; if (F) F.tier(e.auto || e.k === 'swtick' ? 1 : 2, () => { }); snd('swish', Stage.w / 2, 120);
      if (typeof Live !== 'undefined' && s.c4) { const p = e.k === 'swtick' ? s.c4.sw : s.c4.p; Live.say(Txt.f(C.captions.liveSeason, { t: e.t, f: Math.round(100 * p[0]), m: Math.round(100 * p[1]) })); }
    } else if (e.k === 'swap') { if (F) F.tier(3, ms => { v.banner = { text: C.labels.tSwap, t: 0, ms: Math.max(900, ms + 300) }; }); }
    else if (e.k === 'chose') {
      const G = this.geo5(); v.fly = { a: e.a, t: 0 }; snd('wing', e.a === 'help' ? G.hx : G.vx, G.ty); if (F) F.ring(G.yx, G.yy, 30, { ms: 200 });
      if (e.a === 'help') { setTimeout(() => this.whisper(e.coop ? 'coop' : 'nocoop'), 900); } else this.whisper(e.vac ? 'bred' : 'floated');
    } else if (e.k === 'tally') {
      const G = this.geo5(), sp = s.sp[e.i], dir = sp.a === 'help' ? sp.own : sp.vB, ind = sp.a === 'help' ? sp.kin : 0, x0 = sp.a === 'help' ? G.hx : G.vx;
      for (let k = 0; k < Math.min(6, Math.round(dir * 10)); k++) v.tok.push({ x: x0, y: G.ty, t: -k * 0.08, ms: 0.9, h: false });
      for (let k = 0; k < Math.min(6, Math.round(ind * 10)); k++) v.tok.push({ x: x0, y: G.ty, t: -0.1 - k * 0.08, ms: 0.9, h: true });
      if (F) F.pop('+' + (dir + ind).toFixed(2), G.jar.x + G.jar.w / 2, G.jar.y + G.jar.h + 16, 1); snd('count', G.jar.x, G.jar.y);
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveSpring, { t: e.i + 1, h: sp.vH.toFixed(2), b: sp.vB.toFixed(2) }));
    } else if (e.k === 'spring') { if (F) F.tier(1, () => { }); }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'al-' + k); },

  /* ---------- input ---------- */
  call(a) { Sim.act(this, { k: 'call', a: a ? 1 : 0 }); },
  down(x, y) {
    const s = this.sim.s, n = this.level;
    if (s.phase === 'peace') { this.tapPeace(x, y); return; }
    if (n === 4) {
      if (s.phase !== 'spring') return; const G = this.geo5();
      if (Math.abs(x - G.hx) < G.W * 0.2 && y > G.top + 30) Sim.act(this, { k: 'choose', a: 'help' });
      else if (Math.abs(x - G.vx) < G.W * 0.2 && y > G.top + 30) Sim.act(this, { k: 'choose', a: 'breed' });
      else if (this.once('missW')) this.whisper('missW');
      return;
    }
    if (s.phase !== 'attack' || !s.atk || (s.atk.st !== 'decide' && s.atk.st !== 'tell')) return;
    const G = this.geo(), dx = x - G.yx, dy = y - G.yy;
    const rr = Math.max(30, G.hero * 0.62); if (dx * dx + dy * dy <= rr * rr) { this.call(1); return; }
    const bx = x - (G.yx + G.hero * 0.85), by = y - G.by; if (bx * bx + by * by <= 34 * 34) { this.call(0); return; }
    this.v.pop = 1; if (this.once('miss')) this.whisper('miss');
  },
  tapPeace(x, y) {
    const v = this.v, s = this.sim.s; if (!v.pv) return;
    for (const pv of [v.pv, v.pvO]) {
      if (pv.menu != null) { const r = pv.tap(x, y); if (r && r.tag) { Sim.act(this, { k: 'tag', id: r.id, t: r.tag }); return; } if (r && r.menu) { if (r.id === s.me) { pv.menu = null; this.whisper('you'); } return; } }
    }
    for (const pv of [v.pv, v.pvO]) { const id = pv.hit(x, y); if (id != null) { for (const q of [v.pv, v.pvO]) q.menu = null; if (id === s.me) { this.whisper('you'); return; } if (!this.sim.member(s, id)) return; pv.menu = id; pv.focus = id; return; } }
  },
  onKey(k) {
    const s = this.sim.s, n = this.level;
    if (s.phase === 'peace') { for (const pv of [this.v.pv, this.v.pvO]) if (pv && pv.menu != null) { const id = pv.menu; if (pv.key(k) && pv.tags[id] && pv.tags[id] !== s.tags[id]) Sim.act(this, { k: 'tag', id, t: pv.tags[id] }); return; } if (this.v.pv) this.v.pv.key(k); return; }
    if (k === 'c' || k === 'C') this.call(1); else if (k === 's' || k === 'S') this.call(0);
    else if (n === 4 && (k === 'h' || k === 'H')) Sim.act(this, { k: 'choose', a: 'help' }); else if (n === 4 && (k === 'b' || k === 'B')) Sim.act(this, { k: 'choose', a: 'breed' });
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, A = s.atk, st = s.phase === 'attack' && A ? A.st : '', ask = !!(s.ask && this._asking), sig = s.phase + st + ask + (A ? A.pred : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (ask) { Dock.set([{ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } }]); return; }
    if (s.phase === 'peace') { Dock.set([{ id: 'al-done', label: L.done, key: 'd', primary: true, fn: () => Sim.act(this, { k: 'done' }) }]); return; }
    if (s.phase === 'spring') { Dock.set([{ id: 'al-help', label: L.help, key: 'h', aria: 'Help at home', fn: () => Sim.act(this, { k: 'choose', a: 'help' }) }, { id: 'al-breed', label: L.breed, key: 'b', aria: 'Breed on the vacancy', fn: () => Sim.act(this, { k: 'choose', a: 'breed' }) }]); return; }
    if (s.phase === 'attack' && (st === 'tell' || st === 'decide')) { Dock.set([{ id: 'al-call', label: L.call, key: 'c', aria: A.pred === 'hawk' ? 'Whistle' : 'Trill', fn: () => this.call(1) }, { id: 'al-sil', label: L.silentB, key: 's', aria: 'Stay silent', fn: () => this.call(0) }]); return; }
    Dock.set([]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content, H = C.hud, L = C.labels, n = this.level, A = s.atk; let t = H.over, num = '';
    if (s.ask) t = H[s.ask.id] || H.ask;
    else if (s.phase === 'peace') { const m = s.col.filter(q => q.id !== s.me).length, k = s.col.filter(q => q.id !== s.me && s.tags[q.id]).length; t = k >= 3 ? H.peace2 : H.peace; num = Txt.f(L.tags, { n: k, m }); }
    else if (s.phase === 'attack' && A) {
      if (A.vig) t = Txt.f(A.vig === 'f' ? H.vigF : H.vigM, { t: A.i + 1 });
      else if (A.st === 'tell' || A.st === 'decide') t = n === 0 && s.ai === 0 ? C.firstWords : A.pred === 'hawk' ? (n === 2 && !s.asked ? H.decideHq : H.decideH) : H.decideC;
      else t = A.st === 'strike' ? H.strike : H.debrief;
      num = n === 3 ? Txt.f(L.season, { n: s.c4.t + 1, m: AL_C4.T }) : Txt.f(L.attack, { n: Math.min(s.n, s.ai + 1), m: s.n });
    } else if (s.phase === 'season') { t = H.season; num = Txt.f(L.season, { n: s.c4.t, m: AL_C4.T }); }
    else if (s.phase === 'auto') { t = H.auto; num = Txt.f(L.season, { n: s.c4.t, m: AL_C4.T }); }
    else if (s.phase === 'swap') { t = H.swrun; num = Txt.f(L.season, { n: s.c4.swHist.length - 1, m: AL_C4.T }); }
    else if (s.phase === 'spring') { t = Txt.f(s.sp[s.si].vac ? H.spring : H.springNone, { t: s.si + 1 }); num = Txt.f(L.spring, { n: s.si + 1, m: s.sp.length }); }
    else if (s.phase === 'fly') { t = H.fly; num = Txt.f(L.spring, { n: s.si + 1, m: s.sp.length }); }
    else if (s.phase === 'tally') { t = H.tally; num = Txt.f(L.spring, { n: s.si + 1, m: s.sp.length }); }
    HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const s = this.sim.s, v = this.v, n = this.level;
    if (n === 4) this.drawIsland(c);
    else if (s.phase === 'peace' || (n === 1 && s.ask && s.ask.id === 'lm')) this.drawPeace(c);
    else if (n === 3 && s.phase !== 'attack') this.drawMap(c);
    else this.drawMeadow(c);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('al-banner', v.banner.text, W / 2, this.hudH() + 60, { size: 22 }); c.restore(); }
  },
  /* the meadow backdrop, baked once per size: alpine sky, granite peaks, lodgepole pines, lupins, boulders, burrows */
  bake(G) {   // cosmetic
    const key = 'm' + G.W + 'x' + G.H + (typeof Pal !== 'undefined' ? Pal.theme : '');
    if (this.v.bg && this.v.bgKey === key) return this.v.bg;
    const L = Layer(G.W, G.H), h = (i, k) => this.hrand(i, k);
    L.redraw((c, w, hh) => {
      const g = c.createLinearGradient(0, 0, 0, G.sky + 20); g.addColorStop(0, '#5E93C9'); g.addColorStop(1, '#C7DEEE'); c.fillStyle = g; c.fillRect(0, 0, w, G.sky + 20);
      c.fillStyle = '#8E949C'; c.beginPath(); c.moveTo(0, G.sky); const pk = [0, 0.12, 0.2, 0.33, 0.45, 0.55, 0.68, 0.8, 0.9, 1];
      for (let i = 0; i < pk.length; i++) c.lineTo(pk[i] * w, G.sky - (i % 2 ? 0.55 : 0.2) * (G.sky - G.top) * (0.6 + 0.4 * h(i, 3)));
      c.lineTo(w, G.sky); c.closePath(); c.fill();
      c.fillStyle = '#EEF2F5'; for (let i = 1; i < pk.length; i += 2) { const x = pk[i] * w, y = G.sky - 0.55 * (G.sky - G.top) * (0.6 + 0.4 * h(i, 3)); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 14, y + 12); c.lineTo(x - 4, y + 9); c.lineTo(x + 6, y + 13); c.lineTo(x + 13, y + 10); c.closePath(); c.fill(); }
      c.fillStyle = '#2F4A35'; for (let i = 0; i < 26; i++) { const x = h(i, 5) * w, t = 14 + 16 * h(i, 6); c.beginPath(); c.moveTo(x, G.sky + 4 - t); c.lineTo(x + 5, G.sky + 6); c.lineTo(x - 5, G.sky + 6); c.closePath(); c.fill(); }
      const mg = c.createLinearGradient(0, G.sky, 0, hh); mg.addColorStop(0, '#87A45E'); mg.addColorStop(1, '#6C8C49'); c.fillStyle = mg; c.fillRect(0, G.sky + 4, w, hh - G.sky);
      c.strokeStyle = 'rgba(52,74,34,.35)'; c.lineWidth = 1; for (let i = 0; i < 160; i++) { const x = h(i, 7) * w, y = G.sky + 10 + h(i, 8) * (hh - G.sky - 10); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2, y - 6); c.stroke(); }
      for (let i = 0; i < 70; i++) { const x = h(i, 9) * w, y = G.sky + 12 + h(i, 10) * (hh - G.sky - 20), lup = h(i, 11) < 0.7; c.fillStyle = lup ? '#7E6BC4' : '#F3EEF5'; if (lup) { for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x, y - k * 2.6, 2.1 - k * 0.3, 0, TAU); c.fill(); } } else { c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); } }
      for (let i = 0; i < 5; i++) { const x = (0.08 + 0.21 * i + 0.06 * h(i, 12)) * w, y = G.sky + 18 + h(i, 13) * (hh - G.sky) * 0.75, r = 12 + 14 * h(i, 14); c.fillStyle = '#A8A39A'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, r * 1.3, r, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(x - r * 0.4, y - r * 0.4, r * 0.5, r * 0.25, -0.3, 0, TAU); c.fill(); c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(x + r * 0.3, y + r * 0.5, r, r * 0.3, 0, 0, TAU); c.fill(); }
    });
    this.v.bg = L; this.v.bgKey = key; return L;
  },
  hrand(i, k) { let x = Math.imul((i + 1) * 2654435761 ^ (k + 7) * 40503, 2246822519); x ^= x >>> 13; x = Math.imul(x, 3266489917); x ^= x >>> 16; return (x >>> 0) / 4294967296; },
  blazeBadge(c, x, y, r, kind) {   // the father's face blaze as a badge: stripe, chevron or spot (a designed cue)
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = '#F4EEDD'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke(); c.fillStyle = '#1B1612'; c.lineWidth = 2.4; c.lineCap = 'round'; c.beginPath();
    if (kind === 'stripe') { c.moveTo(x, y - r * 0.62); c.lineTo(x, y + r * 0.62); c.stroke(); } else if (kind === 'chevron') { c.moveTo(x - r * 0.55, y + r * 0.3); c.lineTo(x, y - r * 0.35); c.lineTo(x + r * 0.55, y + r * 0.3); c.stroke(); } else { c.arc(x, y, r * 0.36, 0, TAU); c.fill(); }
    c.restore();
  },
  burrow(c, x, y, r) { c.fillStyle = '#5B4630'; c.beginPath(); c.ellipse(x, y + 2, r * 1.25, r * 0.5, 0, 0, TAU); c.fill(); c.fillStyle = '#231A12'; c.beginPath(); c.ellipse(x, y, r, r * 0.38, 0, 0, TAU); c.fill(); },
  drawMeadow(c) {
    const s = this.sim.s, v = this.v, G = this.geo(), A = s.atk, calm = typeof Fx !== 'undefined' && Fx.calm;
    this.bake(G).blit(c, 0, 0);
    if (!A) return;
    const st = A.st, t = A.t, sl = this.slots(A.nb.length, G), called = A.a === 1, hawk = A.pred === 'hawk';
    const k0 = st === 'tell' ? t / AL_T.tell * 0.3 : st === 'decide' ? 0.3 + 0.55 * Math.min(1, t / this.sim.decideT(s)) : 1;   // the predator closes in
    if (!hawk) this.drawCoyote(c, G, A, k0, sl);
    // your burrow and the neighbours' burrows
    this.burrow(c, G.yx + G.hero * 0.85, G.by, 15);
    if (st === 'decide') { c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = 'rgba(244,238,221,.85)'; c.beginPath(); c.ellipse(G.yx + G.hero * 0.85, G.by, 24, 12, 0, 0, TAU); c.stroke(); c.restore(); if (s.ai < 2 || v.pop > 0) Lbl.put('al-bur', this.content.labels.burrow, G.yx + G.hero * 0.85, G.by + 22, { size: 12 }); }
    A.nb.forEach((id, i) => this.burrow(c, sl[i][0] + G.act * 0.55, sl[i][1] + G.act * 0.35, 10));
    // neighbours: warned ones dash for their burrows; the victim is lifted or dusted
    const deb = st === 'debrief';
    A.nb.forEach((id, i) => {
      const p = sl[i], m = this.sim.member(s, id), dead = A.victim === id; let x = p[0], y = p[1], al = 1;
      if ((st === 'strike' || deb) && called && !dead) { const k = Math.min(1, (st === 'strike' ? t : 1.5) / 0.7); x += G.act * 0.55 * k; y += G.act * 0.35 * k; al = deb ? Math.min(1, Math.max(0, (t - 0.1) / 0.3)) : 1 - k; if (deb && al > 0) { x = p[0]; y = p[1]; } }
      if (dead && (st === 'strike' || deb)) { if (v.lift && v.lift.id === id && v.lift.t < 1.2) { const k = Math.max(0, v.lift.t - 0.26); if (hawk) { y -= k * 260; al = Math.max(0, 1 - k); } else al = Math.max(0, 1 - k * 3); } else al = 0; }
      if (al > 0.02) Rig.draw(c, 'squirrel', { pose: st === 'decide' || st === 'tell' ? (i % 2 ? 'down' : 'up') : 'up', blaze: null, age: 1 }, x, y, { size: G.act, alpha: al, id: id, state: 'idle', t: v.t, flip: x > G.yx });
      if (al > 0.3 || st === 'decide' || st === 'tell') this.flag(c, 'al-f' + i, s.tags[id], p[0], p[1] - G.act * 0.62, deb ? m : null);
    });
    // you: freeze upright and trill, or whistle and bolt for the burrow; caught: lifted or dusted
    let yx = G.yx, yy = G.yy, yal = 1;
    if (called && hawk && (st === 'strike' || deb)) { const k = Math.min(1, (st === 'strike' ? t : 1) / 0.35); yx += G.hero * 0.85 * k; yy += (G.by - G.yy) * k; yal = 1 - k; if (deb) { yx = G.yx; yy = G.yy; yal = Math.min(1, t / 0.4); } }
    if (A.you && (st === 'strike' || deb) && v.lift) { const k = Math.max(0, v.lift.t - 0.26); if (hawk) { yy -= k * 260; yal = Math.max(0, 1 - k); } else yal = Math.max(0, 1 - k * 3); if (deb && v.lift.t >= 1.2) { yal = Math.min(1, (t - 0.2) / 0.5); yy = G.yy; } }
    if (yal > 0.02) {
      const ph = { pose: st === 'tell' || st === 'decide' ? 'up' : called && !hawk ? 'up' : 'up', blaze: s.yb || null, call: called && !hawk && st === 'strike', age: 1 };
      Rig.draw(c, 'squirrel', ph, yx, yy, { size: G.hero * (1 + 0.06 * Det.sin(Math.PI * v.sq)), alpha: yal, halo: true, id: 'you', state: 'idle', t: v.t });
      Lbl.put('al-you', this.content.labels.you, yx, yy + G.hero * 0.62, { size: 13 });
    }
    // the decision clock: an arc around you that shrinks
    if (st === 'decide' && !s.unt && !this.sim.first(s)) { const k = Math.max(0, 1 - t / this.sim.decideT(s)); c.save(); c.lineWidth = 5; c.strokeStyle = 'rgba(27,22,18,.7)'; c.beginPath(); c.arc(G.yx, G.yy, G.hero * 0.66, -TAU / 4, -TAU / 4 + TAU * k); c.stroke(); c.lineWidth = 2.5; c.strokeStyle = '#F4EEDD'; c.stroke(); c.restore(); }
    if (st === 'decide' && (s.ai < 2 || v.pop > 0)) { c.save(); c.setLineDash([6, 5]); c.lineWidth = 2; c.strokeStyle = 'rgba(244,238,221,.9)'; c.beginPath(); c.arc(G.yx, G.yy, G.hero * 0.6, 0, TAU); c.stroke(); c.restore(); }
    if (hawk) this.drawHawk(c, G, A, k0, sl);
    // calls: a trill is a wavy ring, a whistle a thin straight ring (shape, not only sound)
    for (const r of v.rings) { if (r.t < 0) continue; const p = r.t / r.ms, rad = 14 + p * 70; c.save(); c.globalAlpha = Math.max(0, 1 - p); c.strokeStyle = '#1B1612'; c.lineWidth = r.wavy ? 3 : 1.6; c.beginPath(); for (let a = 0; a <= 64; a++) { const th = a / 64 * TAU, rr = rad + (r.wavy && !calm ? 4 * Det.sin(th * 10 + p * 8) : 0); const x = r.x + rr * Det.cos(th), y = r.y + rr * 0.8 * Det.sin(th); if (a) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); c.restore(); }
    this.drawLedger(c, G, A);
    this.drawChips(c, G, A);
  },
  flag(c, id, t, x, y, truth) {   // an ear-flag tag on a thread: the player's inference; ½ solid, ¼ dashed, ⅛ dotted, 0 no border, untagged hatched "?"
    const w = 28, h = 22, bx = x - w / 2, by = y - h - 6;
    c.save(); c.strokeStyle = '#1B1612'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x, by + h); c.stroke();
    rrect(c, bx, by, w, h, 5); c.fillStyle = '#F4EEDD'; c.fill();
    if (t == null) { c.save(); rrect(c, bx, by, w, h, 5); c.clip(); c.strokeStyle = 'rgba(27,22,18,.35)'; for (let k = -h; k < w; k += 5) { c.beginPath(); c.moveTo(bx + k, by + h); c.lineTo(bx + k + h, by); c.stroke(); } c.restore(); }
    if (t !== '0') { c.setLineDash(t === '1/4' ? [4, 2] : t === '1/8' ? [1.5, 2] : []); c.lineWidth = 1.6; rrect(c, bx, by, w, h, 5); c.stroke(); c.setLineDash([]); }
    c.restore();
    Lbl.put(id, t == null ? '?' : PedigreeView.GLYPH[t], x, by + h / 2, { size: 16, pill: false, mono: true, ink: '#1B1612' });
    if (truth) {   // the debrief: true r under the flag; a mismatch rings in selection ink with ≠
      const tr = this.sim.tagOf(truth.rel), bad = tr !== t;
      Lbl.put(id + 't', Txt.f(this.content.labels.trueR, { r: PedigreeView.GLYPH[tr] }), x, y + 50, { size: 12, ink: bad ? '#F4EEDD' : '#1B1612', bg: bad ? '#9E3412' : undefined });
      if (bad) { c.save(); c.lineWidth = 3; c.strokeStyle = typeof Pal !== 'undefined' ? Pal.sel : '#F46034'; c.beginPath(); c.arc(x, by + h / 2, 19, 0, TAU); c.stroke(); c.restore(); Lbl.put(id + 'ne', this.content.labels.notEq, x + 20, by - 4, { size: 14 }); }
    }
  },
  drawCoyote(c, G, A, k, sl) {   // cosmetic: a coyote slinking through the grass from the side, lunging at the strike
    const v = this.v, side = v.side || 1, st = A.st; let x = lerp(side > 0 ? G.W - 30 : 30, G.yx + side * G.W * 0.3, Math.min(1, k * 1.15)), y = G.yy - G.hero * 0.05, sc = clamp(G.u / 390, 0.9, 1.6);
    if ((st === 'strike' || st === 'debrief') && v.lift) { x = lerp(x, v.lift.x, Math.min(1, v.lift.t / 0.26)); y = lerp(y, v.lift.y, Math.min(1, v.lift.t / 0.26)); if (v.lift.t > 0.6) x += side * (v.lift.t - 0.6) * 400; }
    else if (st === 'strike' || st === 'debrief') { const tt = st === 'strike' ? A.t : 1.3 + A.t; x += side * Math.max(0, tt - 0.4) * 300; }
    const f = side > 0 ? -1 : 1, bob = typeof Fx !== 'undefined' && Fx.calm ? 0 : Det.sin(v.t * 9) * 1.5;
    c.save(); c.translate(x, y + bob); c.scale(f * sc, sc);
    c.fillStyle = '#A08C6C'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(0, 0, 26, 10, 0, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-24, -3); c.quadraticCurveTo(-46, -6, -50, 6); c.quadraticCurveTo(-38, 4, -24, 5); c.closePath(); c.fill(); c.stroke();
    for (const lx of [-16, -8, 10, 18]) { c.beginPath(); c.moveTo(lx, 6); c.lineTo(lx + 2, 20); c.stroke(); }
    c.beginPath(); c.moveTo(20, -6); c.lineTo(40, -2); c.lineTo(44, 4); c.lineTo(30, 6); c.lineTo(20, 4); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(26, -5); c.lineTo(28, -15); c.lineTo(32, -5); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#1B1612'; c.beginPath(); c.arc(34, -1, 1.5, 0, TAU); c.fill(); c.fillStyle = '#E4D8C0'; c.beginPath(); c.ellipse(4, 5, 16, 4, 0, 0, TAU); c.fill();
    c.restore();
    if (st === 'tell' || st === 'decide') Lbl.put('al-pred', this.content.labels.coyote, clamp(x, 40, G.W - 40), y + 30 * sc, { size: 12 });
  },
  drawHawk(c, G, A, k, sl) {   // cosmetic: a red-tail high in the sky, its big shadow sweeping across the meadow
    const v = this.v, side = v.side || 1, st = A.st, sc = clamp(G.u / 390, 0.9, 1.6);
    let hx = lerp(side > 0 ? G.W - 20 : 20, G.yx + side * G.W * 0.12, k), hy = lerp(G.top + 20, G.sky - 6, k * k);
    if ((st === 'strike' || st === 'debrief') && v.lift) { const q = Math.min(1, v.lift.t / 0.26); hx = lerp(hx, v.lift.x, q); hy = lerp(hy, v.lift.y - 16, q); if (v.lift.t > 0.26) { hy -= (v.lift.t - 0.26) * 260; hx -= side * (v.lift.t - 0.26) * 120; } }
    else if (st === 'strike' || st === 'debrief') { const tt = st === 'strike' ? A.t : 1.3 + A.t; hx -= side * tt * 260; hy -= tt * 60; }
    const sx = lerp(side > 0 ? G.W + 80 : -80, G.yx + side * 20, k), sy = G.yy + G.hero * 0.2;
    if (st === 'tell' || st === 'decide') { c.save(); c.fillStyle = 'rgba(20,24,30,.32)'; c.translate(sx, sy); c.scale(1, 0.38); c.beginPath(); c.moveTo(-70 * sc, 0); c.quadraticCurveTo(0, -36 * sc, 70 * sc, 0); c.quadraticCurveTo(0, 20 * sc, -70 * sc, 0); c.fill(); c.restore(); }
    const flap = typeof Fx !== 'undefined' && Fx.calm ? 0 : Det.sin(v.t * 6) * 4;
    c.save(); c.translate(hx, hy); c.scale(sc, sc); c.fillStyle = '#4A3628'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-34, -2 + flap); c.quadraticCurveTo(-14, -12, 0, -2); c.quadraticCurveTo(14, -12, 34, -2 + flap); c.quadraticCurveTo(14, 4, 0, 6); c.quadraticCurveTo(-14, 4, -34, -2 + flap); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#B5603A'; c.beginPath(); c.moveTo(-5, 4); c.lineTo(5, 4); c.lineTo(3, 12); c.lineTo(-3, 12); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#E6D3B5'; c.beginPath(); c.ellipse(0, 1, 4, 5, 0, 0, TAU); c.fill(); c.restore();
    if (st === 'tell' || st === 'decide') Lbl.put('al-pred', this.content.labels.hawk, clamp(hx, 40, G.W - 40), hy + 22 * sc, { size: 12 });
  },
  drawLedger(c, G, A) {   // the Hamilton ledger in the scene: Σ r·B stacked by neighbour against your cost; hidden while you decide
    const s = this.sim.s, L = this.content.labels, x0 = 20, w = G.W - 40, y = G.ledY, h = 18, lo = -0.4, hi = 1.2, X = v => x0 + (v - lo) / (hi - lo) * w, C = AL_C[A.pred];
    const show = A.st === 'strike' || A.st === 'debrief', unknownC = s.level === 2 && A.pred === 'hawk' && !s.asked;
    c.save(); c.fillStyle = 'rgba(244,238,221,.88)'; rrect(c, x0 - 6, y - h / 2 - 6, w + 12, h + 12, 8); c.fill(); c.strokeStyle = 'rgba(27,22,18,.5)'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(0), y - h / 2 - 3); c.lineTo(X(0), y + h / 2 + 3); c.stroke();
    if (show) {
      let acc = 0; A.nb.forEach((id, i) => { const m = this.sim.member(s, id), q = AL_REL[m.rel] * AL_B; if (q <= 0) return; c.fillStyle = i % 2 ? '#8E7FC9' : '#6E5AA8'; c.fillRect(X(acc), y - h / 2, X(acc + q) - X(acc), h); c.strokeStyle = '#1B1612'; c.lineWidth = 1; c.strokeRect(X(acc), y - h / 2, X(acc + q) - X(acc), h); acc += q; });
      if (!unknownC) { const cx = X(C); c.lineWidth = 3; c.strokeStyle = '#1B1612'; c.beginPath(); c.moveTo(cx, y - h / 2 - 6); c.lineTo(cx, y + h / 2 + 6); c.stroke(); }
      const box = Lbl.put('al-led', unknownC ? L.costQ : (A.sr * AL_B > C ? L.pays : L.silentPays), G.W / 2, y - h - 4, { size: 12 });
      if (!unknownC) Lbl.put('al-ledc', L.cost, X(C), y + h / 2 + 12, { size: 12 });
      Lbl.put('al-ledr', Txt.f(L.sr, { v: (Math.round(A.sr * 1000) / 1000).toString() }), x0 + 2, y - h - 4, { size: 12, align: 'left', mono: true });
    } else { Lbl.put('al-led', unknownC ? L.costQ : '?', X(0) + 30, y, { size: 13, pill: false, ink: '#1B1612' }); Lbl.put('al-ledk', L.ledger, x0 + w - 4, y, { size: 12, align: 'right', pill: false, ink: '#1B1612' }); }
    c.restore();
  },
  drawChips(c, G, A) {   // the attack counter and, from the hawk level on, the notebook tally (after you have called the costs)
    const s = this.sim.s, L = this.content.labels, y = G.top + 12;
    if (s.level === 2 && s.asked && s.pred.wh != null && A.st === 'debrief') {   // the notebook shows between attacks, when the sky is clear
      const T = s.tally; let yy = y;
      for (const p of ['coyote', 'hawk']) { const t = T[p]; if (!t[0]) continue; const b = Lbl.put('al-nb' + p, L[p === 'hawk' ? 'whistle' : 'trill'], 10, yy, { size: 12, align: 'left' }); Lbl.put('al-nc' + p, Txt.f(L.callers, { k: t[1], n: t[0] }), b.x + b.w + 4, yy, { size: 12, align: 'left', mono: true }); Lbl.put('al-ns' + p, Txt.f(L.silents, { k: t[3], n: t[2] }), b.x + b.w + 4, yy + 22, { size: 12, align: 'left', mono: true }); yy += 46; }
    }
    if (A.vig) Lbl.put('al-vig', A.vig === 'f' ? L.daughters : L.sons, G.W - 10, y, { size: 12, align: 'right' });
  },
  /* peace time: the litters come up on the surface; below, the family drawn as a burrow map (PedigreeView) */
  buildPV(G) {
    const s = this.sim.s, v = this.v, key = G.W + 'x' + G.H + s.me; if (v.pv && v.pvKey === key) return; v.pvKey = key;
    const kin = [{ id: 'gm', sex: 'f', parents: [null, null], dead: true }, { id: 'gf', sex: 'm', parents: [null, null], absent: true }];
    const mk = m => ({ id: m.id, sex: m.sex, parents: m.rel === 'mo' || m.rel === 'au' ? ['gm', 'gf'] : m.rel === 'co' ? ['au', null] : ['mo', null], blaze: m.blaze, dead: !m.alive });
    for (const m of s.col) if (m.rel === 'mo' || m.rel === 'au') kin.push(mk(m));
    kin.push({ id: 'me', sex: 'f', parents: ['mo', null], blaze: s.yb, dead: s.me !== 'me' });
    for (const m of s.col) if (m.rel === 'fs' || m.rel === 'hs' || m.rel === 'co') kin.push(mk(m));
    kin.push({ id: 'br', sex: 'm', parents: ['mo', null], blaze: s.brb, absent: true });
    v.pv = PedigreeView.create({ nodes: kin }).layout(G.kin); v.pvO = PedigreeView.create({ nodes: s.col.filter(m => m.rel === 'un' || m.rel === 'im').map(m => ({ id: m.id, sex: m.sex, parents: [null, null] })) }).layout(G.oth);
  },
  drawPeace(c) {
    const s = this.sim.s, v = this.v, G = this.geoPeace(), L = this.content.labels, gm = this.geo();
    this.buildPV(G);
    this.bake(Object.assign({}, gm, { sky: G.surf.y + G.surf.h * 0.45 })).blit(c, 0, 0);
    // the soil cross-section
    const sy = G.surf.y + G.surf.h, sg = c.createLinearGradient(0, sy, 0, G.H); sg.addColorStop(0, '#D7BF98'); sg.addColorStop(1, '#BFA27A'); c.fillStyle = sg; c.fillRect(0, sy, G.W, G.H - sy);
    c.fillStyle = 'rgba(90,66,40,.18)'; for (let i = 0; i < 60; i++) { c.beginPath(); c.arc(this.hrand(i, 31) * G.W, sy + this.hrand(i, 32) * (G.H - sy), 1.5 + 2 * this.hrand(i, 33), 0, TAU); c.fill(); }
    { // tunnels behind the chambers, along the pedigree's own lines: down from the mother (or the pair), along the litter, down to each pup
      const pv = v.pv, h = pv.s / 2, fam = new Map();
      for (const nd of pv.nodes) { const pr = nd.parents || []; if (!pv.pos[pr[0]]) continue; const key = pr[0] + '|' + (pr[1] || ''); if (!fam.has(key)) fam.set(key, { m: pr[0], f: pr[1], kids: [] }); fam.get(key).kids.push(nd.id); }
      c.strokeStyle = 'rgba(92,66,40,.5)'; c.lineWidth = Math.max(10, h * 0.9); c.lineCap = 'round'; c.lineJoin = 'round';
      for (const F of fam.values()) {
        const pm = pv.pos[F.m], pf = F.f && pv.pos[F.f], mx = pf ? (pm.x + pf.x) / 2 : pm.x, my = pf ? (pm.y + pf.y) / 2 : pm.y + h, kp = F.kids.map(id => pv.pos[id]).filter(Boolean); if (!kp.length) continue;
        const ky = Math.min(...kp.map(q => q.y)) - h, sb = my + (ky - my) / 2, xs = kp.map(q => q.x).concat([mx]);
        c.beginPath(); if (pf) { c.moveTo(pm.x, pm.y); c.lineTo(pf.x, pf.y); } c.moveTo(mx, my); c.lineTo(mx, sb); c.moveTo(Math.min(...xs), sb); c.lineTo(Math.max(...xs), sb); for (const q of kp) { c.moveTo(q.x, sb); c.lineTo(q.x, q.y); } c.stroke();
      }
      c.lineCap = 'butt';
    }
    c.fillStyle = 'rgba(244,238,221,.35)'; rrect(c, G.oth.x - 26, G.oth.y - 6, G.oth.w + 52, G.oth.h + 12, 10); c.fill();
    Lbl.put('al-kinmap', L.kinMap, 10, G.kin.y - 14, { size: 12, align: 'left' });
    Lbl.put('al-oth', L.others, 10, G.oth.y - 16, { size: 12, align: 'left' });
    // the litter on the surface: you and your sisters at hero size, each wearing her father's face blaze; a brother leaves
    const pups = [{ id: 'me', blaze: s.yb }].concat(s.col.filter(m => m.rel === 'fs' || m.rel === 'hs').map(m => ({ id: m.id, blaze: m.blaze }))), n = pups.length, sz = Math.round(clamp(G.surf.h * 0.62, 40, 74));
    pups.forEach((p, i) => { const x = G.W * (0.12 + 0.62 * (n === 1 ? 0.5 : i / (n - 1))), y = G.surf.y + G.surf.h * 0.6, k = clamp((v.t - 0.3 * i) / 0.4, 0, 1); if (k <= 0) return; this.burrow(c, x, y + sz * 0.42, 12); Rig.draw(c, 'squirrel', { pose: 'up', blaze: p.blaze, age: 0.75 }, x, y + (1 - k) * sz * 0.5, { size: sz, alpha: k, halo: p.id === s.me, id: p.id }); this.blazeBadge(c, x + sz * 0.42, y - sz * 0.25, 10, p.blaze); if (p.id === s.me) Lbl.put('al-pupme', L.you, x, y - sz * 0.62, { size: 12 }); });
    { const bx = G.W * 0.9 + Math.min(40, v.t * 12), y = G.surf.y + G.surf.h * 0.62; if (bx < G.W + 30) { Rig.draw(c, 'squirrel', { pose: 'down', blaze: s.brb, age: 0.8 }, bx, y, { size: sz * 0.8, id: 'br' }); Lbl.put('al-br', L.gone, Math.min(G.W - 40, bx), y + sz * 0.5, { size: 12 }); } }
    Lbl.put('al-dsg', L.designed, G.W - 8, G.surf.y + 12, { size: 12, align: 'right', bg: 'rgba(244,238,221,.8)' });
    // the burrow map
    for (const pv of [v.pv, v.pvO]) { pv.tags = {}; pv.untagged = false; for (const id in pv.pos) if (s.tags[id] && this.sim.member(s, id)) pv.tags[id] = s.tags[id]; }
    const menus = [v.pv.menu, v.pvO.menu]; v.pv.menu = v.pvO.menu = null;   // the tag menu is drawn last, over the pills and badges
    v.pv.draw(c, { theme: 'paper' }); v.pvO.draw(c, { theme: 'paper' }); v.pv.menu = menus[0]; v.pvO.menu = menus[1];
    for (const pv of [v.pv, v.pvO]) for (const nd of pv.nodes) {   // hatched "?" pills on squirrels still to tag; larger blaze badges
      const p = pv.pos[nd.id], h = pv.s / 2; if (!p) continue;
      if (nd.blaze) this.blazeBadge(c, p.x + h + 8, p.y - h + 3, 9, nd.blaze);
      if (!this.sim.member(s, nd.id) || s.tags[nd.id] || nd.id === s.me) continue;
      const x = p.x - 13, y = p.y - h - 26; c.save(); rrect(c, x, y, 26, 22, 5); c.fillStyle = '#F4EEDD'; c.fill(); c.clip(); c.strokeStyle = 'rgba(27,22,18,.35)'; c.lineWidth = 1; for (let k2 = -22; k2 < 26; k2 += 4) { c.beginPath(); c.moveTo(x + k2, y + 22); c.lineTo(x + k2 + 22, y); c.stroke(); } c.restore();
      c.save(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; rrect(c, x, y, 26, 22, 5); c.stroke(); c.restore(); Lbl.put('al-q' + nd.id, '?', p.x, y + 11, { size: 15, pill: false, mono: true, ink: '#1B1612' });
    }
    const mp = v.pv.pos[s.me]; if (mp) { c.save(); c.lineWidth = 3; c.strokeStyle = '#F4EEDD'; c.beginPath(); c.arc(mp.x, mp.y, v.pv.s / 2 + 6, 0, TAU); c.stroke(); c.restore(); Lbl.put('al-pvme', L.you, mp.x, mp.y + v.pv.s / 2 + 14, { size: 12 }); }
    for (const pv of [v.pv, v.pvO]) if (pv.menu != null && pv.pos[pv.menu]) {   // the radial tag menu: ½ ¼ ⅛ 0 round the chosen squirrel
      const p = pv.pos[pv.menu];
      for (let k = 0; k < 4; k++) { const x = p.x + PedigreeView.OX[k], y = p.y + PedigreeView.OY[k]; c.save(); c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fillStyle = '#F4EEDD'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#1B1612'; c.setLineDash(k === 1 ? [4, 2] : k === 2 ? [1.5, 2] : []); if (k === 3) c.lineWidth = 0.8; c.stroke(); c.restore(); Lbl.put('al-mn' + k, PedigreeView.GLYPH[AL_TAGS[k]], x, y, { size: 16, pill: false, mono: true, ink: '#1B1612' }); }
    }
  },
  /* L4: the colony map, seen from above: six burrow clusters; each squirrel a genotype disc at the locus its sex expresses */
  drawMap(c) {
    const s = this.sim.s, v = this.v, G = this.geo(), C4 = s.c4, L = this.content.labels, swap = s.phase === 'swap' || (s.phase === 'over' && C4.sw) || (s.ask && s.ask.id === 'sw');
    const p = swap ? (C4.sw || C4.sw0) : C4.p, t = swap ? Math.max(0, C4.swHist.length - 1) : C4.t;
    c.fillStyle = '#7C9A55'; c.fillRect(0, 0, G.W, G.H);
    c.fillStyle = 'rgba(52,74,34,.25)'; for (let i = 0; i < 120; i++) c.fillRect(this.hrand(i, 41) * G.W, G.top + this.hrand(i, 42) * (G.H - G.top), 2, 5);
    for (let i = 0; i < 50; i++) { c.fillStyle = '#7E6BC4'; c.beginPath(); c.arc(this.hrand(i, 43) * G.W, G.top + this.hrand(i, 44) * (G.H - G.top), 2, 0, TAU); c.fill(); }
    const cols = G.W > 700 ? 3 : 2, rows = Math.ceil(6 / cols), cw = (G.W - 20) / cols, chh = (G.ledY - G.top - 60) / rows, ex = cw * 0.44, ey = chh * 0.42, r = clamp(Math.min(ex, ey) * 0.15, 7, 13), cen = [];
    for (let k = 0; k < 6; k++) cen.push([10 + cw * (k % cols + 0.5), G.top + 30 + chh * (Math.floor(k / cols) + 0.5)]);
    const mover = s.phase === 'season' || s.phase === 'swap' ? clamp(v.mapT / 0.9, 0, 1) : 1;
    for (let k = 0; k < 6; k++) {   // granite ring, burrows, then daughters (circles) and sons (squares)
      const [x, y] = cen[k]; c.fillStyle = 'rgba(168,163,154,.55)'; c.beginPath(); c.ellipse(x, y, ex, ey, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(27,22,18,.35)'; c.lineWidth = 1.5; c.stroke();
      for (let i = 0; i < 9; i++) {
        const male = i >= 6, ang = male ? (i - 6) / 3 * TAU + 0.5 + k : i / 6 * TAU + k * 0.7, fr = male ? 0.74 : 0.4;
        let px = x + ex * fr * Det.cos(ang), py = y + ey * fr * Det.sin(ang);
        const mobile = swap ? !male : male;
        if (mobile && mover < 1) { const fromK = (k + 1 + (i % 5)) % 6, [fx, fy] = cen[fromK]; px = lerp(fx, px, mover); py = lerp(fy, py, mover); }
        const loc = male ? 1 : 0, a1 = this.hrand(k * 9 + i, t * 2 + loc * 101) < p[loc] ? 0 : 1, a2 = this.hrand(k * 9 + i, t * 2 + 1 + loc * 101) < p[loc] ? 0 : 1;
        if (typeof Pal !== 'undefined') Pal.genotype(c, px, py, r, a1, a2);   // A = calling copy, a = silent copy (letters, for colour-blind players)
        c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.beginPath(); if (male) c.rect(px - r - 2, py - r - 2, 2 * r + 4, 2 * r + 4); else c.arc(px, py, r + 1.5, 0, TAU); c.stroke();
      }
    }
    Lbl.put('al-mapd', swap ? L.dLeave : L.daughters, 10, G.top + 12, { size: 12, align: 'left' });
    Lbl.put('al-maps', swap ? L.sStay : L.sons, G.W - 10, G.top + 12, { size: 12, align: 'right' });
    Lbl.put('al-mapt', Txt.f(L.season, { n: t, m: AL_C4.T }), G.W / 2, G.ledY + 4, { size: 13, mono: true });
    Lbl.put('al-mapx', L.xN, G.W / 2, G.ledY - 22, { size: 12, bg: 'rgba(244,238,221,.8)' });
    Lbl.put('al-keyA', L.keyA, 10, G.ledY + 4, { size: 12, align: 'left' }); Lbl.put('al-keya', L.keya, G.W - 10, G.ledY + 4, { size: 12, align: 'right' });
  },
  /* L5 boss: Cousin Island, Seychelles; home territory left, a vacancy right, you on a branch between */
  drawIsland(c) {
    const s = this.sim.s, v = this.v, G = this.geo5(), L = this.content.labels, sp = s.sp[Math.min(s.si, s.sp.length - 1)], calm = typeof Fx !== 'undefined' && Fx.calm;
    const g = c.createLinearGradient(0, 0, 0, G.sea); g.addColorStop(0, '#F2D7A2'); g.addColorStop(1, '#BFE0DC'); c.fillStyle = g; c.fillRect(0, 0, G.W, G.sea);
    c.fillStyle = '#2E9C97'; c.fillRect(0, G.sea, G.W, G.H - G.sea); c.strokeStyle = 'rgba(244,238,221,.7)'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= G.W; x += 10) { const y = G.sea + 6 + (calm ? 0 : 2 * Det.sin(x * 0.05 + v.t * 1.4)); if (x) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
    c.fillStyle = '#B7A496'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; for (let i = 0; i < 4; i++) { const x = (0.1 + 0.28 * i) * G.W, y = G.sea - 4, r = 16 + 10 * this.hrand(i, 51); c.beginPath(); c.ellipse(x, y, r * 1.6, r, 0, Math.PI, TAU); c.fill(); c.stroke(); }
    c.fillStyle = '#4E7A3E'; c.fillRect(0, G.sea - 30, G.W, 26);
    Lbl.put('al-isl', L.island, 10, G.top + 12, { size: 12, align: 'left' });
    const K = clamp(Math.min(G.W / 390, G.room / 400), 1, 1.9);
    const tree = (x, q, lab, empty) => {   // a scrub tree; insects (quality) dance round its crown
      c.fillStyle = '#6B4F34'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 7 * K, G.sea - 30); c.lineTo(x - 4 * K, G.ty); c.lineTo(x + 4 * K, G.ty); c.lineTo(x + 7 * K, G.sea - 30); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = empty ? '#6E9356' : '#4F7E3F';
      for (const [dx, dy, r] of [[-30, 4, 34], [30, 0, 32], [0, -24, 40], [-12, -8, 30]]) { c.beginPath(); c.arc(x + dx * K, G.ty + (dy - 10) * K, r * K, 0, TAU); c.fill(); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(x - 10 * K, G.ty - 46 * K, 16 * K, 0, TAU); c.fill();
      const ni = Math.round(q * 6);
      for (let i = 0; i < ni; i++) { const a = (calm ? 0 : v.t * 1.6) + i * 1.05, ix = x + 58 * K * Det.cos(a), iy = G.ty - 20 * K + 34 * K * Det.sin(a * 1.2 + i); c.fillStyle = 'rgba(244,238,221,.8)'; c.beginPath(); c.ellipse(ix - 3, iy - 4, 4, 2.4, -0.5, 0, TAU); c.ellipse(ix + 3, iy - 4, 4, 2.4, 0.5, 0, TAU); c.fill(); c.fillStyle = '#1B1612'; c.beginPath(); c.ellipse(ix, iy, 2.4, 3.6, 0, 0, TAU); c.fill(); }
      Lbl.put('al-t' + lab, L[lab], x, G.sea - 18, { size: 12 });
      if (lab !== 'noVac') Lbl.put('al-q' + lab, q >= 0.9 ? L.rich : q >= 0.5 ? L.fair : L.poor, x, G.ty + 52 * K, { size: 12, bg: 'rgba(244,238,221,.85)' });
    };
    tree(G.hx, sp.q, 'home', false);
    if (sp.vac) tree(G.vx, sp.vac, 'vacancy', true); else { tree(G.vx, 0.3, 'noVac', false); Rig.draw(c, 'warbler', { ring: 3 }, G.vx - 18 * K, G.ty - 50 * K, { size: 36 * K, id: 'oth1' }); Rig.draw(c, 'warbler', { ring: 0 }, G.vx + 18 * K, G.ty - 48 * K, { size: 36 * K, flip: true, id: 'oth2' }); }
    // the home nest: the breeding pair, the nestling, and your egg if you co-bred
    const nx = G.hx, ny = G.ty - 6 * K; c.fillStyle = '#7A5B3A'; c.beginPath(); c.ellipse(nx, ny, 22 * K, 9 * K, 0, 0, Math.PI); c.fill(); c.stroke();
    Rig.draw(c, 'warbler', { chick: true, gape: !calm && Det.sin(v.t * 5) > 0.3 }, nx - 5 * K, ny - 8 * K, { size: 24 * K, id: 'chick' });
    if (sp.a === 'help' && sp.coop && s.phase !== 'spring') Rig.draw(c, 'warbler', { chick: true, gape: false }, nx + 11 * K, ny - 8 * K, { size: 22 * K, id: 'mine' });
    Rig.draw(c, 'warbler', { ring: sp.br === 'mum' ? 2 : 3 }, nx - 42 * K, ny - 40 * K, { size: 44 * K, id: 'bf' + sp.br });
    Rig.draw(c, 'warbler', { ring: sp.sire === 'dad' ? 1 : 0 }, nx + 42 * K, ny - 44 * K, { size: 44 * K, flip: true, id: 'bm' + sp.sire });
    Lbl.put('al-bf', L[sp.br === 'mum' ? 'mum' : 'step'], nx - 42 * K, ny - 40 * K - 26 * K, { size: 12 }); Lbl.put('al-bm', L[sp.sire === 'dad' ? 'dad' : 'newM'], nx + 42 * K, ny - 44 * K - 26 * K, { size: 12 });
    // you: on a branch in the middle, or flying to the tree you picked
    let yx = G.yx, yy = G.yy; const f = v.fly && (s.phase === 'fly' || s.phase === 'tally') ? v.fly : null;
    if (f) { const k = clamp((s.phase === 'fly' ? s.pt : AL_T.fly) / 0.8, 0, 1), tx = f.a === 'help' ? G.hx + 20 : G.vx, ty = G.ty - 40; yx = lerp(G.yx, tx, k); yy = lerp(G.yy, ty, k) - Det.sin(Math.PI * k) * 40; if (k >= 1 && f.a === 'help' && s.phase === 'fly') { const q = (s.pt - 0.8) % 0.8 / 0.8; yx = lerp(tx + 40, nx + 10, Math.abs(1 - 2 * q)); yy = ty + 10 * Det.sin(Math.PI * q); } }
    Rig.draw(c, 'warbler', { ring: 1, carry: !!f && f.a === 'help' }, yx, yy, { size: 50 * K, halo: true, id: 'you', flip: f && f.a === 'help' });
    Lbl.put('al-you', L.you, yx, yy + 32 * K, { size: 13 });
    if (s.phase === 'spring') { c.save(); c.setLineDash([6, 5]); c.lineWidth = 2; c.strokeStyle = 'rgba(27,22,18,.55)'; for (const x of [G.hx, G.vx]) { c.beginPath(); c.arc(x, G.ty - 18 * K, Math.min(G.W * 0.2, 80 * K), 0, TAU); c.stroke(); } c.restore(); }
    // the gene jar: own young solid, kin raised hatched; tokens fly in
    const J = G.jar, best = this.sim.best5(s), sc = J.h / Math.max(1.5, best);
    c.save(); c.fillStyle = 'rgba(244,238,221,.85)'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; rrect(c, J.x, J.y, J.w, J.h, 6); c.fill(); c.stroke();
    const hd = s.dir * sc, hi = s.ind * sc; c.fillStyle = '#6E5AA8'; c.fillRect(J.x + 3, J.y + J.h - 3 - hd, J.w - 6, hd);
    c.save(); c.beginPath(); c.rect(J.x + 3, J.y + J.h - 3 - hd - hi, J.w - 6, hi); c.clip(); c.fillStyle = 'rgba(110,90,168,.35)'; c.fillRect(J.x, J.y, J.w, J.h); c.strokeStyle = '#1B1612'; c.lineWidth = 1; for (let k = -J.h; k < J.w + J.h; k += 6) { c.beginPath(); c.moveTo(J.x + k, J.y + J.h); c.lineTo(J.x + k + J.h, J.y); c.stroke(); } c.restore();
    c.restore(); Lbl.put('al-jar', L.genes, J.x + J.w / 2, J.y + J.h + 14, { size: 12 });
    for (const k of v.tok) { if (k.t < 0) continue; const p = k.t / k.ms, x = lerp(k.x, J.x + J.w / 2, p), y = lerp(k.y, J.y + J.h * 0.5, p) - Det.sin(Math.PI * p) * 50; c.save(); c.fillStyle = k.h ? '#F4EEDD' : '#6E5AA8'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); c.stroke(); if (k.h) { c.beginPath(); c.moveTo(x - 4, y + 4); c.lineTo(x + 4, y - 4); c.stroke(); } c.restore(); }
    if (s.phase === 'tally' || (s.phase === 'over' && sp.a)) {   // the debrief: both choices' gene copies for this spring
      const yb = G.sea + 4, hb = Math.max(18, G.H - G.sea - 12);
      c.save(); c.fillStyle = 'rgba(244,238,221,.92)'; rrect(c, 10, yb, G.W - 20, hb, 8); c.fill(); c.restore();
      Lbl.put('al-dh', Txt.f(L.helpV, { v: sp.vH.toFixed(2) }), G.W * 0.27, yb + hb / 2, { size: 13, mono: true, bg: sp.a === 'help' ? '#D9D1EE' : undefined });
      Lbl.put('al-db', Txt.f(L.breedV, { v: sp.vB.toFixed(2) }), G.W * 0.73, yb + hb / 2, { size: 13, mono: true, bg: sp.a === 'breed' ? '#D9D1EE' : undefined });
    }
  },

  /* ---------- the live graph (strip) and the debrief chart ---------- */
  notes() {
    const s = this.sim.s, n = this.level, L = this.content.labels, cap = this.content.captions, over = s.phase === 'over', stats = [];
    if (n <= 2) {
      const R = s.recs || [], ok = R.filter(r => r.ok).length; stats.push([L.sAtk, Math.min(s.n, s.ai + 1) + ' / ' + s.n, ''], [L.sOk, ok + ' / ' + R.length, cap.mOk]);
      if (n === 1 && s.tagAcc != null) stats.push([L.sTags, Math.round(100 * s.tagAcc) + '%', cap.mTags]);
      const xs = { lo: 0, hi: s.n + 1, label: L.attackAx };
      if (n < 2) {
        const S = [{ label: L.called, shape: 'disc', ink: 'ink', pts: R.map((r, i) => r.a === 1 ? [i + 1, r.sr] : null).filter(Boolean) }, { label: L.silent, shape: 'square', pts: R.map((r, i) => r.a === 0 ? [i + 1, r.sr] : null).filter(Boolean) }];
        const sp = { type: 'scatter', title: L.tKin, x: xs, y: { lo: 0, hi: 2, label: L.sumR }, series: S, frame: 'designed' };
        if (n === 1 || over) sp.ghost = [[0, 0.55], [s.n + 1, 0.55]];
        if (n === 0) return { stats, charts: [sp] };
        return { stats, charts: [sp, this.rChart(L.tLitter, s.pred.lm != null ? [{ d: [[0, 0.5], [1, 0.5]], label: L.oneFather }] : [])] };
      }
      const hidden = s.pred.wh == null;
      const tr = { type: 'scatter', title: L.tTrill, x: xs, y: { lo: -0.5, hi: 0.5, label: L.costAx }, series: [{ label: L.est, shape: 'disc', ink: 'ink', pts: hidden ? [] : (s.estH || []).filter(q => q[1] != null).map(q => [q[0], q[1]]) }], ref: 'zero', frame: 'designed' };
      const wh = { type: 'scatter', title: L.tWhistle, x: xs, y: { lo: -0.5, hi: 0.5, label: L.costAx }, series: [{ label: L.est, shape: 'square', pts: hidden ? [] : (s.estH || []).filter(q => q[2] != null).map(q => [q[0], q[2]]) }], ref: 'zero', frame: 'designed' };
      if (over) { tr.ghost = [[0, AL_C.coyote], [s.n + 1, AL_C.coyote]]; wh.ghost = [[0, AL_C.hawk], [s.n + 1, AL_C.hawk]]; }
      return { stats, charts: [tr, wh] };
    }
    if (n === 3) {
      const C = s.c4, xs = { lo: 0, hi: AL_C4.T, label: L.seasonAx }, ys = { lo: 0, hi: 1, fmt: 'pct' }, vf = C.vig.length;
      stats.push([L.sSeason, C.t + ' / ' + AL_C4.T, ''], [L.sF, Math.round(100 * C.p[0]) + '%', cap.mF], [L.sM, Math.round(100 * C.p[1]) + '%', cap.mM]);
      const R = s.recs || [], vF = R.filter(r => r.vig === 'f'), vM = R.filter(r => r.vig === 'm');
      if (vF.length) stats.push([L.sVigF, vF.filter(r => r.a).length + ' / ' + vF.length, '']); if (vM.length) stats.push([L.sVigM, vM.filter(r => r.a).length + ' / ' + vM.length, '']);
      const ghost = (i) => over && s.exp4path ? [{ d: s.exp4path.map(q => [q[0], q[i + 1]]), label: L.model }] : [];
      const f = { type: 'trace', title: L.tFem, x: xs, y: ys, series: [{ d: C.hist.map(q => [q[0], q[1]]), ink: 'A', label: L.females }], ghost: ghost(0), frame: 'designed' };
      const m = { type: 'trace', title: L.tMale, x: xs, y: ys, series: [{ d: C.hist.map(q => [q[0], q[2]]), ink: 'A', label: L.males }], ghost: ghost(1), frame: 'designed' };
      const charts = [f, m];
      if (C.sw || (s.ask && s.ask.id === 'sw')) charts.push({ type: 'trace', title: L.tSwap, x: xs, y: ys, series: C.swHist.length ? [{ d: C.swHist.map(q => [q[0], q[2]]), ink: 'A', label: L.males }, { d: C.swHist.map(q => [q[0], q[1]]), ink: 'ink', label: L.females }] : [], frame: 'designed', fold: false });
      return { stats, charts };
    }
    const sp = s.sp || [], cum = []; let t = 0, b = 0, bc = []; sp.forEach((q, i) => { if (q.a) { t += q.a === 'help' ? q.vH : q.vB; cum.push([i + 1, t]); } b += Math.max(q.vH, q.vB); bc.push([i + 1, b]); });
    stats.push([L.sSpring, Math.min(sp.length, s.si + 1) + ' / ' + sp.length, ''], [L.sTot, (s.tot || 0).toFixed(2), cap.mTot], [L.sDir, (s.dir || 0).toFixed(2), ''], [L.sInd, (s.ind || 0).toFixed(2), '']);
    return { stats, charts: [this.rChart(L.tChick, s.pred.eg != null ? [{ d: [[0, 0.5], [1, 0.5]], label: L.oneFather }] : []), { type: 'trace', title: L.tGenes, x: { lo: 0, hi: sp.length, label: L.springAx }, y: { lo: 0, hi: 3.2 }, series: [{ d: [[0, 0]].concat(cum), ink: 'ink', label: L.yours, you: true }], ghost: over ? [{ d: [[0, 0]].concat(bc), label: L.best }] : [], frame: 'designed' }].reverse() };
  },
  rChart(title, ghost) { return { type: 'trace', title, x: { lo: 0, hi: 1, fmt: () => '' }, y: { lo: 0, hi: 0.6, label: this.content.labels.rbar }, series: [], ghost, frame: 'designed' }; },
  debrief() {
    const s = this.sim.s, spec = this.notes().charts[0]; if (!spec) return null;
    const id = s.asks && s.asks[0];
    if (id && s.pred[id] != null && spec.type === 'scatter') spec.you = { x: (s.n || 8) + 0.5, y: s.pred[id], label: 'you' };
    if (id && s.pred[id] != null && spec.type === 'trace') spec.series = spec.series.concat([{ d: [[AL_C4.T, s.pred[id]]], ink: 'ink', label: this.content.labels.yours, you: true }]);
    return spec;
  }
};
V2.push(CH_ALARM_V2);

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.alarm = AL_TEXT.take;
  MODEL.alarm = 'Belding’s ground squirrels in a meadow: a call costs the caller risk C and saves each warned neighbour risk B = 0.4, so it pays when Σr × B > C. The trill costs 0.22; the whistle saves its caller. Calling alleles act in one sex each; dispersal sets who lives among kin. Warbler helpers can co-breed.';
  RECALL.alarm = { q: 'A trill costs 0.22 and saves each neighbour 0.4. Beside one sister and one cousin, should you trill?', opts: [['yes', 'Yes: ½ + ⅛ = 0.625'], ['no', 'No: it costs you'], ['half', 'Only for the sister']], ans: 'yes', why: 'Σr × 0.4 = 0.25, more than the cost of 0.22.' };
  BRIDGE.alarm = 'So far each animal served only its own young. Here relatives share your genes by descent, so helping them can pay.';
  if (TRANSFER.alarm) delete TRANSFER.alarm;
}
