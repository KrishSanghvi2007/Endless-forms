/* ================= v2/mixer.js: Equilibrium (id 'census', CH_HWE_V2), the one Hardy–Weinberg chapter (D6) =================
   D6 (binding): one chapter replacing the legacy Census by id (legacy stays at ?v1=1). Hardy–Weinberg is the null model of
   population genetics, and every force shows itself as a departure from it. D6 decision 9 (simple beats clever) cut it from
   eight levels to five, with one prediction (the tumbler's Aa share); decision 10 (real biology) shows the tumbler's eggs and
   sperm as gametes the beetles shed. The beetle is the anchor organism; it wears its genotype one allele per wing case (blue
   A, amber a). The last level borrows Norway rats (warfarin resistance) for heterozygote advantage.

     L0 Two copies each   tag beetles; copies fly into jars; Yule's 75% line against 30 generations of random mating  (C1, B1)
     L1 The tumbler       crank eggs and sperm onto the p × q square; the 2pq tiles collapse into bars; one ask      (C1)
     L2 The census        drag a quadrat; χ² with 1 df against 3.84; small samples fit almost anything             (A1, A2)
     L3 Close relatives   a valve on the tumbler: brother–sister matings; F; one generation of mixing undoes it     (C6)
     L4 The bait-layer    lay warfarin against rats: newborns fit HW, adults show a heterozygote excess; q̂         (C9, C7)

   Each level keeps its original simulation key (EQ_MAP: 0, 1, 3, 4, 6), so s.level inside the sim is that key; the engine's
   level index n is EQ_MAP's position. Code shape (API_v2 §9, D5 decisions 22–24): a headless sim with plain-JSON state,
   seeded R() only (WF and Gen for the draws), so a run is (seed, level, actions); every word in EQ_C; tunables in P; the view
   juices only from Sim.run's events. Load rule: top-level code touches only legacy objects and lower-numbered v2 files (Pal,
   Fx, Rig, LiveGraph are read inside functions, behind typeof guards). */

const EQ_MAP = [0, 1, 3, 4, 6];   // engine level index → simulation key

/* ================= words (API_v2 §9.2; D4 budgets; British spelling; tests/lint_text.js) ================= */
const EQ_C = {
  firstWords: 'Each beetle carries two copies of a colour gene. Tap one to open it.',
  intro: {   // the opening description card (D6 decision 8; 00_entry.js Intro): 1–2 sentences, ≤ 35 words each
    game: 'You are a field geneticist on Beetle Isle, then on a farm overrun by rats. Count gene copies, pair eggs with sperm, sample the beach and watch what breaks the balance.',
    biology: 'Hardy–Weinberg is the null model: random mating with no forces gives genotype shares p², 2pq and q². Inbreeding cuts heterozygotes; selection on rats can add them.',
    how: 'Tap beetles, crank the tumbler, drag the quadrat and lay bait for rats. The ghost hand shows each new control the first time.'
  },
  hud: {
    sort: 'Sort its copies: tap the A jar or the a jar.',
    tag: 'Tag beetles. The jars count copies, not beetles. {n} of {m} tagged.',
    reveal: 'Every beetle opened: {a}% of copies are A, yet {b}% of beetles look blue.',
    yule: 'Yule bet blue, the dominant look, would climb to 75%. Watch.',
    lapse: 'Thirty generations of random mating in all 20,000 beetles. Watch the blue share.',
    done0: 'Blue stayed put. Dominant does not mean common.',
    crank: 'A female sheds eggs, a male sheds sperm. Turn the crank to pair them.',
    askHet: 'Before you crank 40 pairs: what share will be Aa? Drag the Aa bar.',
    c40: 'Crank to 40 pairs. Each fertilised egg lands in its cell of the square.',
    collapse: 'Both mixed cells stack in the Aa bar: ×2, the 2 in 2pq.',
    spin: 'Now 400 pairs. Hold the crank, or press Spin.',
    settle: 'p² + 2pq + q² = 1. Here: {a}% + {b}% + {c}%.',
    sample: 'Drag the quadrat over the beach. {t} s of field time for both beaches.',
    sampleN: '{n} genotyped. χ² above 3.84 means a departure: 1 in 20 by chance.',
    census: 'The full census: all {n} beetles. Heterozygotes are {f}% short of 2pq.',
    censusFit: 'The full census: all {n} beetles. Heterozygotes match 2pq.',
    south: 'South beach. {t} s of field time left.',
    valve: 'The valve can keep families apart. Flip it to Families.',
    crankF: 'Brothers mate with sisters. Watch the Aa bar. {n} of {m} families.',
    toMix: 'Flip the valve back to Mix: random mating again.',
    crankM: 'Mixing again. Crank: {n} of {m} families.',
    named: 'F, the inbreeding coefficient: heterozygotes are {f}% short of 2pq.',
    wrongValve: 'Flip the valve to {m} to crank.',
    done4: 'One generation of mixing, and heterozygotes are back. p never moved.',
    place: 'Rats raid your grain. Tap to lay bait: {c} grain a tray a night.',
    plan: 'Season {g}. Keep, add or lift trays: each costs {c} grain a night.',
    night: 'Night {g}. A rat that meets bait eats it six times in ten.',
    fast: 'Seasons pass with your bait. Tap to add or lift a tray.',
    dusk: 'Season {g}. The newborns sit on the Hardy–Weinberg curve.',
    dawn: 'Dawn. Bait reached {k}% of susceptible rats. {n} rats reached the grain.',
    qhat: 'q̂ = s₁/(s₁ + s₂) = {v}: here AA and aa deaths balance.',
    nobait: 'Warfarin withdrawn. Resistant aa rats still pay for vitamin K.',
    whatif: 'What if? Ten seasons with one thing changed.',
    over: 'Done.'
  },
  whispers: {
    copies: 'Two copies: one per wing case.', dominant: 'Aa looks blue: A is dominant.', skittish: 'The beetles are getting skittish.',
    jar: 'That copy is {a}: the other jar.', square: 'Each cell: one egg, one sperm.', small: 'Small samples fit almost anything.',
    shrug: 'One a copy is enough to resist warfarin.', vitK: 'Too little vitamin K for an aa rat.', grain: 'A rat reached the grain.',
    valve: 'Valve: {m}.', trays: 'Four trays is the most.', more: 'Sample at least {n} beetles.', yule: 'Dashed line: Yule’s 75%.'
  },
  labels: {
    jarA: 'A copies', jara: 'a copies', eggs: 'Eggs', sperm: 'Sperm', crank: 'Crank', AA: 'AA', Aa: 'Aa', aa: 'aa', BB: 'BB', Bb: 'Bb', bb: 'bb',
    chi: 'χ²', line: '3.84', departs: 'departs', fits: 'fits', north: 'North beach', southB: 'South beach',
    mix: 'Mix', fam: 'Families', p: 'p', q: 'q', female: 'female', male: 'male',
    n: 'n = {n}', time: '{t} s', season: 'Season {g}', blue: 'blue', amber: 'amber',
    newborn: 'newborns', adult: 'adults', drag: 'Drag me', you: 'you', exp: 'expected', yule: 'Yule’s 75%', yuleBet: 'Yule: 75% blue',
    gene2: 'second gene', colour: 'colour gene', xN: '×N', pairs: '{n} pairs',
    secs: '{n} s', lost: '{n} lost', popBlue: '{x}% blue overall', baitCost: 'Bait {n} grain',
    qhat: 'q̂', tray1: '1 tray', trayN: '{n} trays', blueA: 'blue (A)', amberA: 'amber (a)', twice: '×2', zyg: 'fertilised eggs'
  },
  interesting: {
    het: 'Your Aa guess missed. Aa forms two ways: egg A with sperm a, and egg a with sperm A.',
    small: 'Your sample fitted Hardy–Weinberg. The full census did not. Failing to reject is not proof.',
    drifted: 'p wandered a little by chance in this small population. Inbreeding itself does not move p.',
    bait: 'Resistance barely rose: too few susceptible rats met the bait.',
    nostir: 'Without stirring, eggs met sperm from their own layer. Heterozygotes fell short while p stayed put.',
    nocost: 'With no vitamin-K cost, resistance kept spreading. The cost is what holds q in the middle.',
    nowarf: 'Without warfarin, resistant rats only paid the cost, and q fell.'
  },
  levers: { nostir: 'No stirring', nocost: 'No vitamin cost', nowarf: 'No warfarin' },
  take: 'Hardy–Weinberg is the null model: genotypes follow from copies. A departure points to a cause; a fit rules nothing out.',
  body: 'Selection pushed the adults off the curve. Each season’s newborns landed back on it, at a new q. Heterozygote advantage held q near q̂ = s₁/(s₁ + s₂). Hardy–Weinberg is the yardstick: inbreeding cuts heterozygotes, and this selection adds them. A fit alone proves nothing: drift and migrants can move p while it holds.',
  law: { title: 'The null model' },
  boss: { inverts: 'Selection acts after birth: adults leave the curve; newborns return to it.' },
  stars: {
    discover: 'Make each pattern happen: sort, crank, sample, inbreed, bait.',
    predict: 'Call the Aa share before the tumbler runs.',
    transfer: 'Hold resistant rats near your own q̂.'
  },
  captions: {   // keyed by the engine's level index (0–4)
    L0: 'p and q count copies, not beetles. A dominant allele can be the rare one.',
    L1: 'Random mating is two independent draws, an egg and a sperm. So p², 2pq and q² fall out of the square.',
    L2: 'Hardy–Weinberg is a null model you test with χ² (1 df, 5% line 3.84). Small samples fit almost anything.',
    L3: 'Inbreeding cuts heterozygotes by 2pqF while p stays put. One generation of random mating restores them.',
    L4: 'Selection pushes adults off the curve; their young land back on it, at a new q. Heterozygote advantage holds both alleles at q̂ = s₁/(s₁ + s₂).',
    s0d: 'Tag twelve beetles, then watch thirty generations.',
    s1d: 'Crank all 400 pairs.', s1p: 'Call the Aa share inside the band before you crank.',
    s2d: 'Sample at least 150 beetles on one beach, and census both.',
    s3d: 'Inbreed three generations until heterozygotes fall a fifth short, then mix.',
    s4d: 'See the adults’ extra heterozygotes after a night of bait.', s4t: 'Hold q near your own q̂ by season 10.',
    whatif: 'What if? The frozen moment, with one thing changed.',
    live0: 'Tagged {n} beetles. Jars: A {a}, a {b}.', live1: '{n} pairs. AA {x}, Aa {y}, aa {z}.',
    live3: '{n} beetles genotyped. χ² {c}.', live6: 'Season {g}. q {q}. Grain lost {n}.',
    grain6: 'You lost {g} grain to rats and bait. The best fixed bait here was {k}, losing about {o}.'
  },
  panels: [   // keyed by the engine's level index
    { id: 'L0', text: 'Each beetle carries two copies of the colour gene, one per wing case. An Aa beetle looks blue, because A is dominant. So half the beetles looked blue while only 30% of the copies were A. Random mating did not move that share in thirty generations: dominance alone moves nothing.' },
    { id: 'L1', text: 'An egg carries A with chance p; so does a sperm. Two draws give AA with chance p × p. Aa forms two ways, egg A with sperm a or the reverse, so it is 2pq. The young come from the gamete pool. One round of random mating gives these shares, whatever the parents were, if both sexes share p.' },
    { id: 'L2', text: 'A χ² test asks whether the genotype counts could come from Hardy–Weinberg proportions. With two alleles it has one degree of freedom, so 3.84 is the 5% line. A small sample rarely crosses it, even when the beach truly departs. Not rejecting Hardy–Weinberg never proves it.' },
    { id: 'L3', text: 'Brothers mating with sisters made heterozygotes scarcer every generation, while the copies in the jars stayed level. F measures that deficit: Aa = 2pq(1 − F). The second gene lost heterozygotes too, because relatives share every gene. One generation of random mating removed the deficit.' },
    { id: 'L4', text: 'Warfarin killed susceptible AA rats; resistant aa rats needed far more vitamin K. Heterozygotes did best, so both alleles stayed. One a copy resists warfarin, yet only aa pays the cost. Dominance belongs to a trait, not a letter. Newborns sat on the curve; adults had extra heterozygotes. Without warfarin, q fell ever more slowly.' }
  ],
  model: [
    { level: 0, simulated: 'Forty beetles on the beach stand for a population of 20,000 that mates at random for thirty generations.', simplification: 'One gene with two alleles, A fully dominant; generations do not overlap.', params: [{ name: 'p', value: 0.3, tag: 'designed' }, { name: 'population', value: '20,000', tag: 'designed' }, { name: 'generations', value: 30, tag: 'designed' }], cannot: 'Selection, mutation or migration, which would move p.', nature: 'Hardy answered Yule in 1908: with random mating a dominant allele keeps its frequency.', contested: false, refs: ['hardy1908', 'weinberg1908', 'edwards2008'] },
    { level: 1, simulated: 'Each half-turn draws one egg and one sperm. Each is A with chance p, from pools that never run out.', simplification: 'Infinite gamete pools, drawn with replacement.', params: [{ name: 'p', value: 0.3, tag: 'designed' }, { name: 'pairs', value: '40, 400', tag: 'designed' }], cannot: 'A finite population, where p drifts between generations. Unequal p in the two sexes, which takes two generations. Genes on the X, which approach equilibrium slowly (see The Royal Line).', nature: 'Sea urchins shed eggs and sperm into the water, close to random draws at most genes. Gamete-recognition genes such as bindin are an exception.', contested: false, refs: ['hardy1908'] },
    { level: 2, simulated: 'Each beach holds 500 beetles; your quadrat genotypes the ones inside it without error.', simplification: 'Each beach has a one-in-two chance of a heterozygote shortfall of 15–25%; otherwise it is in Hardy–Weinberg.', params: [{ name: 'beetles a beach', value: 500, tag: 'designed' }, { name: 'shortfall if it departs', value: '15–25%', tag: 'designed' }, { name: 'field time', value: '45 s for both', tag: 'designed' }], cannot: 'Genotyping errors or null alleles, which also fake deficits.', nature: 'Hardy–Weinberg tests on samples of a few dozen detect only large departures.', contested: false, refs: ['lewontin1959'] },
    { level: 3, simulated: 'Twenty-four families of four. Each generation a brother and a sister pair up, or partners are drawn at random.', simplification: 'Two unlinked genes: colour, and a second gene shown as head spots.', params: [{ name: 'families', value: 24, tag: 'designed' }, { name: 'young a couple', value: 4, tag: 'designed' }], cannot: 'Inbreeding depression, where inbred young survive worse.', nature: 'Self-fertilising plants show heterozygote deficits at every gene; mating by colour would affect only colour genes.', contested: false, refs: ['wright1921'] },
    { level: 4, simulated: 'Sixty-four rats run each night. A rat that meets a tray eats the bait six times in ten. Susceptible AA rats that eat it die. Each aa rat dies of vitamin-K shortage with chance 0.5.', simplification: 'Here heterozygotes pay nothing, so resistance hides and fades slowly. Welsh heterozygotes also paid a cost (fitness about 0.77 without warfarin; Partridge 1979). Resistance there fell within two years.', params: [{ name: 'rats', value: 64, tag: 'designed' }, { name: 's₂ (aa cost)', value: 0.5, tag: 'designed' }, { name: 'start q', value: 0.05, tag: 'designed' }, { name: 'bait cost', value: '4 grain a tray a night', tag: 'designed' }, { name: 'seasons', value: 18, tag: 'xN', real: 'one season is one rat generation; real spread took years' }], cannot: 'Newer anticoagulants, or other resistance mutations at the same gene. After season 10 warfarin is withdrawn for eight seasons, with no player.', nature: 'Warfarin resistance settled at intermediate frequencies in Welsh rat populations in the 1970s.', contested: false, refs: ['greaves1977', 'bishop1977', 'partridge1979', 'pelz2005'] }
  ],
  why: {   // one chunk a level (index = the engine's level); the card for level n shows real[n] and maths[n]
    real: [
      'In 1908 Udny Yule wondered why a dominant trait did not climb towards three in four. G. H. Hardy replied with the rule; Wilhelm Weinberg found it the same year. Yule’s own 1902 paper had found the 1:2:1 balance; his 1908 remark was a slip.',
      'Sea urchins shed eggs and sperm into the sea. Their pairing is close to random draws at most genes. The one-generation rule holds for an autosomal gene when the sexes start with equal p. A gene on the X approaches equilibrium slowly, the sexes leapfrogging: see The Royal Line.',
      'Small samples have little power: many genuine departures pass unnoticed in samples of a few dozen. Very large samples flag even tiny departures. Say cystic fibrosis affects 1 birth in 2,500. Then q ≈ 1/50, and about 1 person in 25 is a carrier, if Hardy–Weinberg holds.',
      'Self-fertilising plants and inbred zoo animals show heterozygote deficits at many genes at once. Mating by one trait, as in some flowers and birds, affects only the genes behind that trait. Pooling two demes with different p also makes a deficit (the Wahlund effect, 1928).',
      'Warfarin resistance in Norway rats comes from changes in the VKORC1 gene. On Welsh farms in the 1970s, resistant homozygotes fared badly from vitamin-K shortage. Heterozygotes paid a smaller cost. Resistance settled at an intermediate frequency, then fell fast when warfarin stopped.'
    ],
    maths: [
      'Let A have frequency p and a have q = 1 − p. Random mating gives AA p², Aa 2pq and aa q². Blue beetles are AA plus Aa: 1 − q². With p = 0.3 that is 0.51.',
      'Each cell of the square has an area equal to its chance. The AA cell is p by p. The two Aa cells are p by q each, so together 2pq. The cells add to (p + q)² = p² + 2pq + q² = 1. If the sexes differ in p, it takes two generations.',
      'χ² adds (observed − expected)² ÷ expected over AA, Aa and aa. Three classes, minus one for the total, minus one for estimating p, leaves one degree of freedom. The 5% line is 3.84. χ² is only rough when an expected count is below five. Only aa shows for a recessive, so q = √aa and carriers are 2pq.',
      'With inbreeding coefficient F, AA = p² + Fpq, Aa = 2pq(1 − F) and aa = q² + Fpq; p is unchanged. Brother–sister mating raises F to 0.25, 0.375 and 0.5 over three generations.',
      'Fitnesses are AA 1 − s₁, Aa 1, aa 1 − s₂. The share q rises while rare. It stops where an A copy and an a copy do equally well. That is p s₁ = q s₂, so q̂ = s₁/(s₁ + s₂). Without bait, Δq ≈ −s₂pq²/(1 − s₂q²): slow when q is small.'
    ]
  }
};

/* ================= numbers (seconds; designed values, disclosed in P and the MODEL cards) ================= */
const EQK = {
  ASKMAX: 30,
  L0: { comp: [4, 16, 20], need: 12, sortN: 5, sortT: 8, tag1T: 25, tagT: 30, post: 0.9, revealT: 2.6, yuleT: 2.6, lapseT: 4.5, gens: 30, popN: 20000, done: 1.8 },
  L1: { p: 0.3, first: 4, small: 40, big: 400, slow: 9, fast: 45, col: 3.0, colT: 1.8, idle: 25 },
  L3: { N: 500, beaches: [{ p: 0.5 }, { p: 0.4 }], pool: 45, reserve: 10, wait: 15, max: 300, rate: 10, hw: 0.12, hh: 0.1, census: 3.2, move: 1.2 },
  L4: { fams: 24, sched: ['fam', 'fam', 'fam', 'mix'], rate: 10, valveT: 12, idle: 25 },
  L6: { N: 64, comp: [58, 6, 0], s2: 0.5, seasons: 10, after: 8, trays: 4, r: 24, eat: 0.6, cost: 4, W: 360, H: 300, burrows: [70, 130, 190, 250], gx: 346,
        dusk: 1.0, place: 3, place1: 10, dawn: 1.6, breed: 0.6, night: 3.5, dur0: 2.0, dur1: 0.8, maxNight: 10, lapse: 4, lapseW: 5, askAt: 4, qhatT: 3.2,
        best: [0, 0.25, 0.4, 0.55, 0.61] },   // best: bait reach s₁ for 0–4 well-placed trays at an eating chance of 0.6 (measured on the rat paths)
};

/* ================= the maths (pure; shared by the sim, the stars and tests/oracle_census.js) ================= */
const EQ = {
  hw(p) { const q = 1 - p; return [p * p, 2 * p * q, q * q]; },
  inb(p, F) { const q = 1 - p; return [p * p + F * p * q, 2 * p * q * (1 - F), q * q + F * p * q]; },
  n(c) { return c[0] + c[1] + c[2]; },
  p(c) { const n = c[0] + c[1] + c[2]; return n ? (2 * c[0] + c[1]) / (2 * n) : 0; },
  frac(c) { const n = c[0] + c[1] + c[2]; return n ? [c[0] / n, c[1] / n, c[2] / n] : [0, 0, 0]; },
  // χ² for genotype counts with p estimated from the sample: 1 degree of freedom (3 classes − 1 total − 1 estimated p)
  chi(c) {
    const n = c[0] + c[1] + c[2]; if (n < 1) return 0;
    const p = (2 * c[0] + c[1]) / (2 * n), E = EQ.hw(p).map(f => f * n); let x = 0;
    for (let i = 0; i < 3; i++) if (E[i] > 1e-9) x += (c[i] - E[i]) * (c[i] - E[i]) / E[i];
    return x;
  },
  Fhat(c) { const n = EQ.n(c), p = EQ.p(c), He = 2 * p * (1 - p); return n && He > 0 ? 1 - (c[1] / n) / He : 0; },
  triErr(a, b) { const d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2]; return Math.sqrt((d0 * d0 + d1 * d1 + d2 * d2) / 2); },
  // heterozygote advantage with q the resistant (a) copy share: AA 1 − s1, Aa 1, aa 1 − s2
  sel(q, s1, s2) { const p = 1 - q, w = p * p * (1 - s1) + 2 * p * q + q * q * (1 - s2); return w > 0 ? (p * q + q * q * (1 - s2)) / w : q; },
  proj(q, n, s1, s2) { for (let i = 0; i < n; i++) q = EQ.sel(q, s1, s2); return q; },
  adults(f, s1, s2) { const a = [f[0] * (1 - s1), f[1], f[2] * (1 - s2)], t = a[0] + a[1] + a[2]; return t > 0 ? [a[0] / t, a[1] / t, a[2] / t] : [1 / 3, 1 / 3, 1 / 3]; },
  sibF(t) { let a = 0, b = 0; for (let i = 0; i < t; i++) { const c = (1 + 2 * b + a) / 4; a = b; b = c; } return b; },   // full-sib mating (Wright 1921)
  wahlund(p1, p2) { return (p1 - p2) * (p1 - p2) / 2; },   // 2Var(p) for two equal demes
  // whole counts summing to n from shares (largest remainder), so a designed population is exact
  counts(f, n) { const raw = f.map(v => v * n), out = raw.map(Math.floor); let left = n - out[0] - out[1] - out[2]; raw.map((v, i) => [v - out[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { out[i]++; left--; } }); return out; },
  geno(g, a, b) { return (g[a] < 0.5 ? 1 : 0) + (g[b] < 0.5 ? 1 : 0); },       // a Gen genome → 0 AA, 1 Aa, 2 aa (1.0 = A)
  tally(g) { const c = [0, 0, 0]; for (const x of g) c[x]++; return c; },
  r2(v) { return Math.round(v * 100) / 100; },
  pct(v) { return Math.round(v * 100); }
};

/* ================= the five levels' simulations (headless: R(), Det, WF, Gen only; plain-JSON state) =================
   Keyed by simulation key (EQ_MAP). Each entry: init(S, s), step(S, s, dt, ev), act(S, s, a, ev), after(S, s, id, ev) (a prediction was committed),
   expect(S, s, id) (the expectation for the parameters in force, computed at scoring time), actions(S, s), bot(name, S, s, acts),
   lever(S, s, k) (What if?), interesting(S, s). S is CH_HWE_V2.sim. */
const EQ_SIMS = { sim: {   // one sim: {…} block, so the lint checks it as simulation code

/* ---- L0 Two copies each: open beetles, sort their copies into jars; Yule's 75% against 30 generations of random mating ---- */
0: {
  init(S, s) {
    const K = EQK.L0, p0 = S.P('p0'), comp = Math.abs(p0 - 0.3) < 1e-9 ? K.comp.slice() : EQ.counts(EQ.hw(p0), 40), codes = [];
    for (let c = 0; c < 3; c++) for (let k = 0; k < comp[c]; k++) codes.push(c);
    EQ.shuffle(codes);
    s.bs = codes.map(c => ({ c, tag: 0, h: c === 1 ? (R() < 0.5 ? 1 : 0) : 0 }));
    s.p = EQ.p(comp); s.jar = [0, 0]; s.manual = 0; s.sorted = 0; s.open = -1; s.left = []; s.openK = 0; s.lapsed = 0; s.acc = 0;
    s.big = Array.from(WF.multinom(K.popN, EQ.hw(s.p))); s.blue = [(s.big[0] + s.big[1]) / K.popN];
    S.go(s, 'tag1');
  },
  alleles(b) { return b.c === 0 ? [0, 0] : b.c === 2 ? [1, 1] : b.h ? [1, 0] : [0, 1]; },
  tag(S, s, i, ev, auto) {   // the first few beetles open and wait for you to sort their two copies; later ones pour in by themselves
    const b = s.bs[i]; if (!b || b.tag || s.open >= 0) return; b.tag = 1; const a = this.alleles(b);
    if (!auto && s.sorted < EQK.L0.sortN) { s.open = i; s.left = a.slice(); s.openK = s.tick; ev.push({ k: 'open', i, a }); return; }
    s.jar[a[0]]++; s.jar[a[1]]++;
    if (!auto) s.manual++; ev.push({ k: 'tag', i, a, auto: !!auto });
    if (s.phase === 'tag1') S.go(s, 'post1');
  },
  jar(S, s, j, c, ev, auto) {   // one copy into jar j; c = the copy you dragged (optional). A wrong jar bounces the copy back
    if (s.open < 0) return; const k = c != null ? (c === j ? s.left.indexOf(c) : -1) : s.left.indexOf(j);
    if (k < 0) { ev.push({ k: 'bounce', i: s.open, j, c: c != null ? c : s.left[0] }); return; }
    const two = s.left.length === 2; s.left.splice(k, 1); s.jar[j]++; ev.push({ k: 'sort', i: s.open, a: j, idx: k, two, auto: !!auto });
    if (!s.left.length) { const i = s.open; s.open = -1; s.manual++; s.sorted++; ev.push({ k: 'sorted', i }); if (s.phase === 'tag1') S.go(s, 'post1'); }
  },
  flush(S, s, ev) { while (s.open >= 0 && s.left.length) this.jar(S, s, s.left[0], null, ev, true); },   // an idle sorter: the copies drop in by themselves
  step(S, s, dt, ev) {
    const K = EQK.L0;
    if (s.open >= 0 && !s.unt && (s.tick - s.openK) * S.dt > K.sortT) this.flush(S, s, ev);
    if (s.phase === 'tag1' && !s.unt && s.t > K.tag1T && s.open < 0) { const i = s.bs.findIndex(b => !b.tag); this.tag(S, s, i, ev, true); }
    else if (s.phase === 'post1' && s.t > K.post) S.go(s, 'tag');
    else if (s.phase === 'tag' && s.open < 0 && (s.manual >= K.need || (!s.unt && s.t > K.tagT))) {
      s.bs.forEach((b, i) => { if (!b.tag) this.tag(S, s, i, ev, true); });
      ev.push({ k: 'revealAll' }); S.go(s, 'reveal');
    }
    else if (s.phase === 'tag' && s.open >= 0 && !s.unt && s.t > K.tagT) this.flush(S, s, ev);
    else if (s.phase === 'reveal' && s.t > K.revealT) { S.go(s, 'yule'); ev.push({ k: 'yule' }); }   // Yule's 75% is drawn, not asked (D6 decision 9)
    else if (s.phase === 'yule' && s.t > K.yuleT) { s.acc = 0; S.go(s, 'lapse'); }
    else if (s.phase === 'lapse') {
      s.acc += dt; const per = K.lapseT / K.gens;
      while (s.acc >= per && s.blue.length <= K.gens) { s.acc -= per; this.gen(S, s, ev); }
      if (s.blue.length > K.gens) { s.lapsed = 1; S.go(s, 'done0'); ev.push({ k: 'lapsed' }); }
    }
    else if (s.phase === 'done0' && s.t > K.done) S.go(s, 'over');
  },
  gen(S, s, ev) {   // one generation of random mating in the big population; the forty on the beach are redrawn from it
    const N = EQK.L0.popN, p = EQ.p(s.big);
    s.big = Array.from(WF.multinom(N, EQ.hw(p))); s.blue.push((s.big[0] + s.big[1]) / N);
    const vis = WF.multinom(s.bs.length, EQ.frac(s.big)), codes = [];
    for (let c = 0; c < 3; c++) for (let k = 0; k < vis[c]; k++) codes.push(c);
    EQ.shuffle(codes); s.bs.forEach((b, i) => { b.c = codes[i]; b.h = R() < 0.5 ? 1 : 0; });
    ev.push({ k: 'gen', g: s.blue.length - 1 });
  },
  act(S, s, a, ev) {
    if (s.phase !== 'tag1' && s.phase !== 'tag') return;
    if (a.k === 'tag') this.tag(S, s, a.i | 0, ev, false);
    else if (a.k === 'jar') this.jar(S, s, a.j ? 1 : 0, a.c == null ? null : (a.c ? 1 : 0), ev, false);
  },
  actions(S, s) {
    const out = []; if (s.phase !== 'tag1' && s.phase !== 'tag') return out;
    if (s.open >= 0) return [{ k: 'jar', j: 0 }, { k: 'jar', j: 1 }];
    for (let i = 0; i < s.bs.length && out.length < 6; i++) if (!s.bs[i].tag) out.push({ k: 'tag', i });
    return out;
  },
  bot(name, S, s, acts) {
    if (s.open >= 0) return name === 'alwaysB' ? acts[1] : acts.find(a => a.j === s.left[0]) || null;   // bots can sort; alwaysB always picks the a jar
    return name === 'threshold' && s.manual >= 6 ? null : acts[0] || null;
  }
},

/* ---- L1 The tumbler: each half-turn pairs one egg and one sperm onto the p × q square ---- */
1: {
  init(S, s) { s.p = S.P('p0'); s.cnt = [0, 0, 0, 0]; s.pairs = []; s.spin = 0; s.spinT = 0; s.acc = 0; s.idle = 0; s.target = EQK.L1.first; s.nostir = 0; S.go(s, 'c4'); },
  geno(s) { return [s.cnt[0], s.cnt[1] + s.cnt[2], s.cnt[3]]; },
  pair(s, ev) {
    const e = R() < s.p ? 0 : 1, sp = s.nostir && R() < 0.6 ? e : (R() < s.p ? 0 : 1), code = e * 2 + sp;
    s.pairs.push(code); s.cnt[code]++; ev.push({ k: 'pair', e, sp, n: s.pairs.length });
  },
  cranking(s) { return s.phase === 'c4' || s.phase === 'c40' || s.phase === 'spin'; },
  step(S, s, dt, ev) {
    const K = EQK.L1;
    if (this.cranking(s)) {
      s.idle += dt; if (!s.spin && !s.unt && s.idle > K.idle) { s.spin = 1; s.spinT = 0; ev.push({ k: 'autospin' }); }
      if (s.spin) { s.spinT += dt; const rate = s.phase === 'spin' ? Math.min(K.fast, K.slow + s.spinT * 22) : K.slow; s.acc += rate * dt; while (s.acc >= 1 && s.pairs.length < s.target) { s.acc -= 1; this.pair(s, ev); } }
      if (s.pairs.length >= s.target) this.reached(S, s, ev);
    }
    else if (s.phase === 'col1' && s.t > K.col) { S.go(s, 'spin'); s.target = K.big; s.spinT = 0; s.acc = 0; ev.push({ k: 'vial' }); }
    else if (s.phase === 'col2' && s.t > K.col) S.go(s, 'done1');
    else if (s.phase === 'done1' && s.t > 1.2) S.go(s, 'over');
  },
  reached(S, s, ev) {
    s.spin = 0; s.acc = 0;
    if (s.phase === 'c4') { S.ask(s, ev, 'het', 'y', { chart: 0, at: 1, start: 0.2, tol: 0.05 }); S.go(s, 'askHet'); }
    else if (s.phase === 'c40') { S.go(s, 'col1'); ev.push({ k: 'collapse', n: s.pairs.length }); }
    else if (s.phase === 'spin') { S.go(s, 'col2'); ev.push({ k: 'collapse', n: s.pairs.length }); }
  },
  act(S, s, a, ev) {
    if (!this.cranking(s)) return;
    if (a.k === 'crank') { s.idle = 0; const n = Math.max(1, Math.min(3, a.n | 0)); for (let k = 0; k < n && s.pairs.length < s.target; k++) this.pair(s, ev); if (s.pairs.length >= s.target) this.reached(S, s, ev); }
    else if (a.k === 'spin') { s.idle = 0; s.spin = a.on ? 1 : 0; s.spinT = 0; }
  },
  after(S, s, id) { if (id === 'het') { S.go(s, 'c40'); s.target = EQK.L1.small; } },
  expect(S, s) { return 2 * s.p * (1 - s.p); },
  actions(S, s) { if (!this.cranking(s)) return []; return [{ k: 'crank', n: 1 }, { k: 'spin', on: !s.spin }]; },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) { const g = this.geno(s), n = g[0] + g[1] + g[2]; return S.near(pr, name === 'greedy' ? (n ? g[1] / n : 0.5) : name === 'alwaysA' ? 0 : name === 'alwaysB' ? 1 : 0.5); }
    if (name === 'greedy') return acts.find(a => a.k === 'spin' && a.on) || null;
    return acts.find(a => a.k === 'crank') || null;
  },
  lever(S, s, k) { if (k === 'nostir') s.nostir = 1; },   // What if? keeps p as it was frozen
  interesting(S, s) { if (s.whatif === 'nostir') return 'nostir'; return s.pred.het != null && Math.abs(s.pred.het - 2 * s.p * (1 - s.p)) > 0.1 ? 'het' : null; }
},

/* ---- shared field sampling (the census): a quadrat genotypes the unsampled beetles inside it, nearest first ---- */
field: {
  make(n) { return { x: [], y: [], g: [], sm: [], d: [], m: [] }; },
  inQ(s, f, i) { const K = EQK.L3; return Math.abs(f.x[i] - s.q.x) <= K.hw && Math.abs(f.y[i] - s.q.y) <= K.hh; },
  next(s, f) { let bi = -1, bd = 9; for (let i = 0; i < f.x.length; i++) { if (f.sm[i] || !this.inQ(s, f, i)) continue; const d = (f.x[i] - s.q.x) * (f.x[i] - s.q.x) + (f.y[i] - s.q.y) * (f.y[i] - s.q.y); if (d < bd) { bd = d; bi = i; } } return bi; },
  // advance the quadrat: rate beetles a second; fn(i) records one; → number sampled this tick
  scan(s, f, dt, rate, cap, fn) {
    if (s.q.x < 0) return 0; s.acc += rate * dt; let k = 0;
    while (s.acc >= 1 && s.n < cap) { const i = this.next(s, f); if (i < 0) { s.acc = Math.min(s.acc, 0.999); break; } s.acc -= 1; f.sm[i] = 1; s.n++; k++; fn(i); }
    return k;
  },
  grid(s) { const out = []; for (const x of [0.2, 0.5, 0.8]) for (const y of [0.22, 0.5, 0.78]) out.push({ k: 'quad', x, y }); return out; },
  place(s, a) { s.q.x = Math.max(0, Math.min(1, +a.x || 0)); s.q.y = Math.max(0, Math.min(1, +a.y || 0)); s.idle = 0; },
  pos(f, n, fx) { for (let i = 0; i < n; i++) { const p = fx ? fx(i) : [0.04 + 0.92 * R(), 0.06 + 0.88 * R()]; f.x.push(p[0]); f.y.push(p[1]); f.sm.push(0); } }
},

/* ---- L3 The census (engine level 2): quadrat sampling on two beaches with one shared field clock, χ² with 1 df against 3.84,
   then the full census. Each beach departs (a heterozygote shortfall) with chance one half, independently, so neither the order
   nor the first census gives the second answer away. No verdict ask (D6 decision 9): the census itself is the reveal. */
3: {
  init(S, s) {
    const K = EQK.L3, F0 = S.P('F');
    s.beaches = K.beaches.map(B => ({ p: B.p, F: R() < 0.5 ? EQ.r2(F0 * (0.75 + 0.5 * R())) : 0 }));
    s.pool = K.pool; s.beach = 0; s.res = []; this.make(S, s, 0);
  },
  make(S, s, b) {   // genotypes drawn beetle by beetle; a fitting beach is redrawn until its census fits, a departing one until it shows its shortfall
    const K = EQK.L3, B = s.beaches[b], f = EQ_FIELD.make(); EQ_FIELD.pos(f, K.N);
    let g = [];
    for (let k = 0; k < 60; k++) { g = []; for (let i = 0; i < K.N; i++) g.push(EQ.draw(EQ.inb(B.p, B.F))); const c = EQ.tally(g); if (B.F > 0 ? Math.abs(EQ.Fhat(c) - B.F) < 0.04 : Math.abs(EQ.Fhat(c)) < 0.035) break; }
    f.g = g; s.f = f; s.F = B.F; s.obs = [0, 0, 0]; s.n = 0; s.chiH = []; s.q = { x: -1, y: -1 }; s.clock = 0; s.acc = 0; s.idle = 0; s.full = null;
    S.go(s, 'sample');
  },
  floor(s) { return s.beach === 0 ? EQK.L3.reserve : 0; },   // the first beach leaves some field time for the second
  step(S, s, dt, ev) {
    const K = EQK.L3;
    if (s.phase === 'sample') {
      if (!s.clock && s.t > K.wait) s.clock = 1;   // the clock starts with your first quadrat (or after a long wait)
      if (s.clock && !s.unt) s.pool = Math.max(this.floor(s), s.pool - dt);
      EQ_FIELD.scan(s, s.f, dt, K.rate, K.max, i => { const g = s.f.g[i]; s.obs[g]++; const x = EQ.chi(s.obs); s.chiH.push([s.n, EQ.r2(x)]); ev.push({ k: 'samp', i, g, n: s.n }); });
      if ((!s.unt && s.clock && s.pool <= this.floor(s) + 1e-9 && s.n >= 20) || s.n >= K.max) this.end(S, s, ev);
      else if (!s.unt && s.clock && s.pool <= this.floor(s) + 1e-9 && s.n < 20) this.force(s, ev);
    }
    else if (s.phase === 'census' && s.t > K.census) S.go(s, s.beach === 0 ? 'move' : 'done3');
    else if (s.phase === 'move' && s.t > K.move) { s.beach = 1; this.make(S, s, 1); ev.push({ k: 'beach', b: 1 }); }
    else if (s.phase === 'done3' && s.t > 1.2) S.go(s, 'over');
  },
  force(s, ev) { const f = s.f; for (let i = 0; i < f.x.length && s.n < 20; i++) if (!f.sm[i] && R() < 0.1) { f.sm[i] = 1; s.n++; s.obs[f.g[i]]++; s.chiH.push([s.n, EQ.r2(EQ.chi(s.obs))]); ev.push({ k: 'samp', i, g: f.g[i], n: s.n }); } },
  end(S, s, ev) {   // sampling over: the full census of this beach
    const all = EQ.tally(s.f.g), Fc = EQ.Fhat(all);
    s.full = { n: s.f.g.length, F: Fc, c: all };
    s.res.push({ n: s.n, x2: EQ.r2(EQ.chi(s.obs)), F: EQ.r2(EQ.Fhat(s.obs)), full: EQ.r2(Fc), dep: s.F > 0 });
    S.go(s, 'census'); ev.push({ k: 'census', F: Fc });
  },
  act(S, s, a, ev) {
    if (s.phase !== 'sample') return;
    if (a.k === 'quad') { EQ_FIELD.place(s, a); s.clock = 1; }
    else if (a.k === 'finish' && s.n >= 20) this.end(S, s, ev);
  },
  actions(S, s) { if (s.phase !== 'sample') return []; const out = EQ_FIELD.grid(s); if (s.n >= 20) out.push({ k: 'finish' }); return out; },
  bot(name, S, s, acts) {
    const g = acts.filter(a => a.k === 'quad');
    if (name === 'greedy') { const j = Math.floor(s.tick / 45) % g.length; return s.q.x === g[j].x && s.q.y === g[j].y ? null : g[j]; }
    if (name === 'alwaysA') return s.q.x < 0 ? g[0] : null;
    return name === 'threshold' && s.n >= 40 ? acts.find(a => a.k === 'finish') || null : (s.q.x < 0 ? g[4] : null);
  },
  interesting(S, s) { return s.res.some(r => r.dep && r.x2 < 3.84 && r.n < 120) ? 'small' : null; }
},

/* ---- L4 Close relatives (engine level 3): a two-way valve on the tumbler; brother–sister matings; F; mixing undoes it ---- */
4: {
  lay() { return Gen.layout([{ k: 'col', kind: 'dom', n: 1, p0: 0.7, mu: 0, det: true }, { k: 'mk', kind: 'dom', n: 1, p0: 0.4, mu: 0, det: true }]); },
  init(S, s) {
    const lay = this.lay(); s.fams = [];   // each founding family: four full sibs from an unrelated pair, so F climbs 0.25, 0.375, 0.5
    for (let i = 0; i < EQK.L4.fams; i++) { const m = Gen.genome(lay), d = Gen.genome(lay), f = []; for (let k = 0; k < 4; k++) f.push(Gen.mate(lay, m, d)); s.fams.push(f); }
    s.mode = 'mix'; s.gen = 0; s.couple = 0; s.next = []; s.pairs = null; s.spin = 0; s.acc = 0; s.idle = 0;
    s.hist = [this.stats(s)]; s.want = EQK.L4.sched[0]; S.go(s, 'valve');
  },
  stats(s) {
    const c = [0, 0, 0], m = [0, 0, 0];
    for (const f of s.fams) for (const g of f) { c[EQ.geno(g, 0, 2)]++; m[EQ.geno(g, 1, 3)]++; }
    return { c, m, p: EQ.p(c), pm: EQ.p(m), mode: s.mode };
  },
  pairUp(S, s) {   // the generation's couples: [family of the sister, family of the brother]
    const n = s.fams.length, idx = []; for (let i = 0; i < n; i++) idx.push(i);
    if (s.mode === 'fam') s.pairs = idx.map(i => [i, i]);
    else { const perm = EQ.shuffle(idx.slice()); s.pairs = idx.map(i => [i, perm[i]]); }
    s.couple = 0; s.next = []; s.pairMode = s.mode;
  },
  couple(S, s, ev) {
    const lay = this.lay(), pr = s.pairs[s.couple], mom = s.fams[pr[0]][0], dad = s.fams[pr[1]][2], kids = [];
    for (let k = 0; k < 4; k++) kids.push(Gen.mate(lay, mom, dad));
    s.next.push(kids); ev.push({ k: 'couple', i: s.couple, fi: pr[0], mi: pr[1], kids: kids.map(g => [EQ.geno(g, 0, 2), EQ.geno(g, 1, 3)]) });
    s.couple++;
    if (s.couple >= s.pairs.length) {
      s.fams = s.next; s.next = []; s.couple = 0; s.gen++; const st = this.stats(s); st.mode = s.pairMode || s.mode; s.hist.push(st); s.spin = 0; s.acc = 0;
      ev.push({ k: 'gen', g: s.gen });
      const sch = EQK.L4.sched;
      if (s.gen >= sch.length) S.go(s, 'done4');
      else if (sch[s.gen] !== sch[s.gen - 1]) { s.want = sch[s.gen]; S.go(s, 'valve'); }
      else this.pairUp(S, s);
    }
  },
  ok(s) { return s.mode === s.want; },
  step(S, s, dt, ev) {
    const K = EQK.L4;
    if (s.phase === 'valve') {
      if (this.ok(s)) { this.pairUp(S, s); S.go(s, 'crank'); }
      else if (!s.unt && s.t > K.valveT) { s.mode = s.want; ev.push({ k: 'valve', m: s.mode, auto: true }); }
    }
    else if (s.phase === 'crank') {
      if (!this.ok(s)) return;
      s.idle += dt; if (!s.spin && !s.unt && s.idle > K.idle) { s.spin = 1; ev.push({ k: 'autospin' }); }
      if (s.spin) { s.acc += K.rate * dt; while (s.acc >= 1 && s.phase === 'crank') { s.acc -= 1; this.couple(S, s, ev); } }
    }
    else if (s.phase === 'done4' && s.t > 2.4) S.go(s, 'over');
  },
  act(S, s, a, ev) {
    if (a.k === 'valve' && ['mix', 'fam'].indexOf(a.m) >= 0 && s.phase !== 'over' && s.phase !== 'done4') { if (s.mode !== a.m) { s.mode = a.m; ev.push({ k: 'valve', m: a.m }); if (s.phase === 'crank' && s.couple === 0) this.pairUp(S, s); } }   // a new valve before the first couple re-pairs the generation
    else if (s.phase === 'crank' && this.ok(s)) {
      if (a.k === 'crank') { s.idle = 0; const n = Math.max(1, Math.min(3, a.n | 0)); for (let k = 0; k < n && s.phase === 'crank'; k++) this.couple(S, s, ev); }
      else if (a.k === 'spin') { s.idle = 0; s.spin = a.on ? 1 : 0; }
    }
  },
  actions(S, s) {
    if (s.phase === 'over' || s.phase === 'done4') return [];
    const out = ['mix', 'fam'].filter(m => m !== s.mode).map(m => ({ k: 'valve', m }));
    if (s.phase === 'crank' && this.ok(s)) out.push({ k: 'crank', n: 2 }, { k: 'spin', on: !s.spin });
    return out;
  },
  bot(name, S, s, acts) {
    if (name === 'alwaysA' || name === 'alwaysB') return acts[0] || null;
    if (!this.ok(s)) return acts.find(a => a.k === 'valve' && a.m === s.want) || null;
    return name === 'greedy' ? acts.find(a => a.k === 'spin' && a.on) || null : acts.find(a => a.k === 'crank') || null;
  },
  interesting(S, s) { return s.hist.length > 3 && Math.abs(s.hist[3].p - s.hist[0].p) > 0.04 ? 'drifted' : null; }
},

/* ---- L6 The bait-layer (engine level 4): warfarin against rats; newborns fit HW, adults show a heterozygote excess ----
   Each season you choose how much bait to lay (0–4 trays, each costing grain every night) and where. A rat that passes a tray
   eats the bait with chance 0.6; a susceptible AA rat that eats it turns back and dies. So your bait reach s₁ is a choice,
   q settles at your own q̂ = s₁/(s₁ + s₂), and the farmer's score is grain: rats at the sacks plus the bait itself. Seasons
   1–3 run at your pace; seasons 4–10 run faster with your bait (tap to change it). Then q̂ is shown with its numbers, and
   warfarin is withdrawn for eight seasons with no player: the rare recessive fades slowly. No asks (D6 decision 9). */
6: {
  lay() { return Gen.layout([{ k: 'vk', kind: 'dom', n: 1, p0: 0.95, mu: 0, det: true }]); },   // 1.0 = A (susceptible), 0 = a (resistant)
  mk(a1, a2) { const g = new Float32Array(2); g[0] = a1; g[1] = a2; return g; },
  init(S, s) {
    const K = EQK.L6, comp = K.comp, gs = [];
    for (let k = 0; k < comp[0]; k++) gs.push(this.mk(1, 1)); for (let k = 0; k < comp[1]; k++) gs.push(R() < 0.5 ? this.mk(1, 0) : this.mk(0, 1)); for (let k = 0; k < comp[2]; k++) gs.push(this.mk(0, 0));
    EQ.shuffle(gs); s.rats = gs.map(g => this.rat(g)); s.s2 = S.P('s2');
    s.season = 1; s.trays = []; s.hist = []; s.s1 = []; s.q = [this.q(s.rats)]; s.grain = 0; s.grainT = 0; s.baitT = 0; s.auto = false; s.fast = 1; s.endSeason = 0; s.T = 0; s.rec = null;
    S.go(s, 'dusk');
  },
  rat(g) { return { g, c: EQ.geno(g, 0, 1), st: 'wait', b: 0, y1: 0, bend: 0, t0: 0, dur: 3, u: 0, ate: 0, met: 0, et: 0, x: 14, y: 150, dead: 0 }; },
  q(rats) { let a = 0; for (const r of rats) a += r.c; return rats.length ? a / (2 * rats.length) : 0; },
  counts(rats) { const c = [0, 0, 0]; for (const r of rats) c[r.c]++; return c; },
  P0(r) { const K = EQK.L6; return [14, K.burrows[r.b]]; },
  at(r, u) { const K = EQK.L6, a = this.P0(r), c = [K.gx, r.y1], m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 + r.bend], v = 1 - u; return [v * v * a[0] + 2 * u * v * m[0] + u * u * c[0], v * v * a[1] + 2 * u * v * m[1] + u * u * c[1]]; },
  speed(s) { return s.auto ? EQK.L6.lapseW : s.fast; },
  baited(s) { return !s.auto && s.season <= EQK.L6.seasons; },
  night(S, s) {
    const K = EQK.L6, n = s.rats.length, f = this.speed(s), span = K.night / f;
    s.rats.forEach((r, i) => { r.b = Math.floor(R() * 4); r.y1 = 80 + R() * 170; r.bend = (R() - 0.5) * 140; r.t0 = (i / n) * span + R() * 0.25 / f; r.dur = (K.dur0 + R() * K.dur1) / f; r.st = 'wait'; r.u = 0; r.ate = 0; r.met = 0; r.et = 0; r.dead = 0; const p = this.P0(r); r.x = p[0]; r.y = p[1]; });
    s.T = 0; s.grain = 0; s.nightTrays = s.trays.length; if (this.baited(s)) s.baitT += s.trays.length * K.cost;   // tonight's bait is paid for as it goes down
    S.go(s, 'night');
  },
  step(S, s, dt, ev) {
    const K = EQK.L6, f = this.speed(s);
    if (s.phase === 'dusk' && s.t > (f > 1 ? 0.3 : s.season === 1 ? 1.0 : K.dusk)) { if (s.season === 5 && !s.auto) ev.push({ k: 'vial', g: s.season }); S.go(s, s.auto ? 'go' : 'place'); if (s.auto) this.night(S, s); }
    else if (s.phase === 'place') {   // untimed: the rats wait for Release
      const due = s.season === 1 ? ((s.trays.length && s.t > 2.5) || s.t > K.place1) : s.t > (f > 1 ? 0.5 : K.place);
      if (!s.unt && due) this.night(S, s);
    }
    else if (s.phase === 'night') {
      s.T += dt; let live = 0;
      for (let i = 0; i < s.rats.length; i++) {
        const r = s.rats[i];
        if (r.st === 'wait') { if (s.T >= r.t0) r.st = 'run'; else { live++; continue; } }
        if (r.st === 'run') {
          r.u = Math.min(1, r.u + dt / r.dur); const p = this.at(r, r.u); r.x = p[0]; r.y = p[1];
          if (!r.ate && !s.auto) for (let j = 0; j < s.trays.length; j++) {   // each tray met once a night; a rat eats with chance 0.6 (some are bait-shy)
            const t = s.trays[j]; if (r.met & (1 << j)) continue;
            if ((t.x - r.x) * (t.x - r.x) + (t.y - r.y) * (t.y - r.y) < K.r * K.r) { r.met |= 1 << j; if (R() < K.eat) { r.ate = 1; r.st = 'eat'; r.et = 0; ev.push({ k: 'eat', i, c: r.c, j }); break; } }
          }
          if (r.st === 'run' && r.u >= 1) { r.st = 'grain'; s.grain++; ev.push({ k: 'grain', i }); }
        } else if (r.st === 'eat') { r.et += dt; if (r.et > 0.5 / f) { r.st = r.c === 0 ? 'sick' : 'run'; ev.push({ k: r.c === 0 ? 'sick' : 'shrug', i, c: r.c }); } }
        else if (r.st === 'sick') { r.u = Math.max(0, r.u - dt / (r.dur * 2)); const p = this.at(r, r.u); r.x = p[0]; r.y = p[1]; if (r.u <= 0) r.st = 'home'; }
        if (r.st === 'run' || r.st === 'eat' || r.st === 'sick') live++;
      }
      if (!live || s.T > K.maxNight / f) this.dawn(S, s, ev);
    }
    else if (s.phase === 'dawn' && s.t > (f > 1 ? 0.5 : K.dawn)) this.breed(S, s, ev);
    else if (s.phase === 'qhat' && s.t > K.qhatT) this.withdraw(s);
    else if (s.phase === 'done6' && s.t > 1.4) S.go(s, 'over');
  },
  withdraw(s) { const K = EQK.L6; s.auto = true; s.fast = 1; s.s1w = 0; s.s2w = s.s2; s.endSeason = K.seasons + K.after + 1; s.trays = []; s.phase = 'dusk'; s.t = 0; },   // warfarin stops: eight seasons with no player
  dawn(S, s, ev) {
    const nb = this.counts(s.rats); let aaAte = 0;
    for (const r of s.rats) {
      if (r.c === 0) { if (s.auto ? R() < s.s1w : r.ate) { r.dead = 1; aaAte++; } }
      else if (r.c === 2 && R() < (s.auto ? s.s2w : s.s2)) r.dead = 2;
    }
    const ad = this.counts(s.rats.filter(r => !r.dead)), s1t = nb[0] ? aaAte / nb[0] : 0;
    s.rec = { season: s.season, nb, ad, s1: EQ.r2(s1t), grain: s.grain, trays: s.nightTrays | 0, q: this.q(s.rats) };
    if (this.baited(s)) { s.s1.push(s1t); s.grainT += s.grain; }
    ev.push({ k: 'dawn', s1: s1t });
    S.go(s, 'dawn');
  },
  breed(S, s, ev) {
    const K = EQK.L6, lay = this.lay(), surv = s.rats.filter(r => !r.dead), par = surv.length >= 2 ? surv : s.rats.slice(0, 2), N = K.N, kids = [];
    for (let i = 0; i < N; i++) { const m = par[Math.floor(R() * par.length)], d = par[Math.floor(R() * par.length)]; kids.push(this.rat(Gen.mate(lay, m.g, d.g))); }
    s.hist.push(s.rec); s.rats = kids; s.season++; s.q.push(this.q(kids)); ev.push({ k: 'bred', g: s.season, q: this.q(kids) });
    if (s.auto) { if (s.season >= s.endSeason) S.go(s, 'done6'); else S.go(s, 'dusk'); return; }
    if (s.season === K.askAt && !s.whatif) s.fast = K.lapse;   // seasons 4–10 run faster with your bait
    if (s.season > K.seasons) { s.qh = EQ.r2(this.qhat(this.meanS1(s, s.s1.length), s.s2)); S.go(s, 'qhat'); ev.push({ k: 'qhat', v: s.qh }); return; }   // the key number, shown with its own numbers
    S.go(s, 'dusk');
  },
  act(S, s, a, ev) {
    const K = EQK.L6, open = s.phase === 'dusk' || s.phase === 'place' || s.phase === 'night';
    if (a.k === 'tray' && !s.auto && open) {
      const x = Math.max(30, Math.min(K.W - 24, +a.x || 0)), y = Math.max(34, Math.min(K.H - 18, +a.y || 0)), i = a.i | 0;
      if (i >= s.trays.length) { if (s.trays.length < K.trays) { s.trays.push({ x, y }); ev.push({ k: 'tray', i: s.trays.length - 1, add: 1 }); } else ev.push({ k: 'full' }); }
      else { s.trays[i].x = x; s.trays[i].y = y; }
    }
    else if (a.k === 'untray' && !s.auto && (s.phase === 'dusk' || s.phase === 'place')) { const i = a.i | 0; if (i >= 0 && i < s.trays.length) { const t = s.trays.splice(i, 1)[0]; ev.push({ k: 'untray', x: t.x, y: t.y }); } }
    else if (a.k === 'release' && s.phase === 'place') this.night(S, s);
  },
  meanS1(s, n) { const a = s.s1.slice(0, n); let t = 0; for (const v of a) t += v; return a.length ? t / a.length : 0; },
  qhat(s1, s2) { return s1 + s2 > 0 ? s1 / (s1 + s2) : 0; },
  // the farmer's debrief: the best fixed number of well-placed trays over the ten baited seasons, from the expected recursion
  best(s) {
    const K = EQK.L6; let bk = 0, bg = 1e9;
    for (let k = 0; k <= K.trays; k++) { let q = s.q[0], g = 0; const s1 = K.best[k]; for (let t = 0; t < K.seasons; t++) { const p = 1 - q; g += K.N - s1 * K.N * p * p + k * K.cost; q = EQ.sel(q, s1, s.s2); } if (g < bg - 1e-9) { bg = g; bk = k; } }
    return { k: bk, g: Math.round(bg) };
  },
  actions(S, s) {
    if (s.auto || !(s.phase === 'dusk' || s.phase === 'place' || s.phase === 'night')) return [];
    const out = [], i = Math.min(s.trays.length, EQK.L6.trays - 1);
    for (const x of [70, 130, 190, 250, 310]) for (const y of [80, 150, 220]) out.push({ k: 'tray', i, x, y });
    if (s.phase !== 'night') for (let j = 0; j < s.trays.length; j++) out.push({ k: 'untray', i: j });
    if (s.phase === 'place') out.push({ k: 'release' });
    return out;
  },
  bot(name, S, s, acts) {
    if (name === 'greedy') { const spots = [[230, 160], [250, 200], [250, 120], [270, 240]]; if (s.trays.length < 4) { const p = spots[s.trays.length]; return { k: 'tray', i: s.trays.length, x: p[0], y: p[1] }; } return s.phase === 'place' ? { k: 'release' } : null; }   // the most bait, best placed
    if (name === 'threshold') return s.trays.length < 1 ? { k: 'tray', i: 0, x: 180, y: 150 } : (s.phase === 'place' ? { k: 'release' } : null);
    return name === 'alwaysA' ? acts[0] || null : null;
  },
  lever(S, s, k) { s.auto = true; s.fast = 1; s.trays = []; s.s2w = k === 'nocost' ? 0 : s.s2; s.s1w = k === 'nowarf' ? 0 : Math.max(0.3, this.meanS1(s, s.s1.length)); s.endSeason = s.season + 10; S.go(s, 'dusk'); },
  interesting(S, s) {
    if (s.whatif) return s.whatif === 'nocost' ? 'nocost' : 'nowarf';
    let mx = 0; for (let i = 0; i <= EQK.L6.seasons && i < s.q.length; i++) mx = Math.max(mx, s.q[i]);
    return mx < 0.15 ? 'bait' : null;
  }
},

rnd: {
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
  draw(f) { const u = R(); return u < f[0] ? 0 : u < f[0] + f[1] ? 1 : 2; }   // one genotype from shares (one R())
}
} };
const EQ_LV = []; for (const k of EQ_MAP) EQ_LV[k] = EQ_SIMS.sim[k];   // sparse: indexed by simulation key
const EQ_FIELD = EQ_SIMS.sim.field;
EQ.shuffle = EQ_SIMS.sim.rnd.shuffle; EQ.draw = EQ_SIMS.sim.rnd.draw;

/* ================= view helpers (pure arithmetic; cosmetic randomness from a hash, never R()) ================= */
const EQV = {
  dist(x, y) { return Math.sqrt(x * x + y * y); },
  hash(i, k) { let h = Math.imul((i | 0) ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul((k | 0) + 0x632BE5AB, 0xC2B2AE35); h ^= h >>> 13; h = Math.imul(h, 0x5BD1E995); h ^= h >>> 15; return (h >>> 0) / 4294967296; },
  rng(seed) { let a = seed >>> 0 || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
  atan2(y, x) {   // a polynomial atan2 (|error| < 0.01 rad), for headings only
    const ax = Math.abs(x), ay = Math.abs(y), mx = Math.max(ax, ay), mn = Math.min(ax, ay); if (mx < 1e-9) return 0;
    const a = mn / mx, s2 = a * a; let r = ((-0.0464964749 * s2 + 0.15931422) * s2 - 0.327622764) * s2 * a + a;
    if (ay > ax) r = 1.5707963267948966 - r; if (x < 0) r = 3.141592653589793 - r; return y < 0 ? -r : r;
  },
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  easeOut(t) { t = EQV.clamp(t, 0, 1); return 1 - (1 - t) * (1 - t) * (1 - t); },
  easeIO(t) { t = EQV.clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) * (-2 * t + 2) * (-2 * t + 2) / 2; },
  pal(k, d) { return typeof Pal !== 'undefined' && Pal[k] ? String(Pal[k]) : d; },
  rgba(h, a) { const s = String(h).replace('#', ''), f = s.length === 3 ? s.split('').map(x => x + x).join('') : s; return 'rgba(' + parseInt(f.slice(0, 2), 16) + ',' + parseInt(f.slice(2, 4), 16) + ',' + parseInt(f.slice(4, 6), 16) + ',' + a + ')'; },
  jh(A) { return Math.round(EQV.clamp(A.h * 0.2, 76, 120)); },
  tok(r, max) { let t = 9; while (t > 3) { const cols = Math.floor((r.w - 8) / (2 * t + 1.5)), rows = Math.floor((r.h - 8) / (2 * t + 1.5)); if (cols * rows >= max) break; t -= 0.5; } return t; },
  INK: '#1B1612', SIL: '#9C8A70', PAPER: '#F4EEDD', SAND: '#C9B283', SAND2: '#B39C6E', LAB: '#F4EEDD', SOIL: '#6E5A45', NIGHT: '#2E2620', WATER: '#36504F', MARSH: '#8A8A66', DUNE: '#D8C9A0'
};

/* ================= the chapter ================= */
const CH_HWE_V2 = {
  id: 'census', v2: true, plan: ['Equilibrium', 'Hardy–Weinberg and what breaks it'],
  role: 'investigator', place: 'beetle', accent: '#7D5BA6',   // the chapter's chrome tint (D6 decision 7)
  intro: { goal: 'Find what keeps genotypes in balance, and what breaks it.' },
  content: EQ_C,
  P: {
    p0: { v: 0.3, tag: 'designed', min: 0.1, max: 0.9, label: 'p on Beetle Isle' },
    F: { v: 0.2, tag: 'designed', min: 0.05, max: 0.4, label: 'shortfall if departing' },
    s2: { v: 0.5, tag: 'designed', min: 0.1, max: 0.9, label: 'vitamin-K cost s₂' }
  },
  levels: [
    { name: 'Two copies each', adds: 'allele copies', codes: ['C1', 'B1'], minutes: 2 },
    { name: 'The tumbler', adds: 'random pairing of gametes', codes: ['C1', 'A1'], minutes: 2 },
    { name: 'The census', adds: 'a χ² test', codes: ['A1', 'A2'], minutes: 3 },
    { name: 'Close relatives', adds: 'inbreeding', codes: ['C6'], minutes: 2 },
    { name: 'The bait-layer', adds: 'selection on rats', codes: ['C9', 'C7'], minutes: 4 }
  ],
  keys: { ArrowLeft: 'move', ArrowRight: 'move', ArrowUp: 'move', ArrowDown: 'move', Space: 'crank or act', Enter: 'tag or choose', S: 'spin', V: 'turn the valve', N: 'next step', L: 'gene lens', P: 'predict', 1: 'A jar', 2: 'a jar', Backspace: 'lift a tray' },
  untimed: true,
  teacher: { prompts: ['Why do half the beetles look blue when only 30% of copies are A?', 'A population fits Hardy–Weinberg. Name two forces that could still be acting.', 'Which Hardy–Weinberg assumption is least true for your study species?'], pool: 'tri' },
  encodings: [{ k: 'A', rgb: [47, 95, 208], channels: ['colour', 'letter'] }, { k: 'a', rgb: [232, 180, 22], channels: ['colour', 'letter'] }],
  starTraits: [],
  maths: EQ, lv: EQ_LV,   // for tests/oracle_census.js

  /* ---------------- headless simulation (API_v2 §9.3) ---------------- */
  sim: {
    dt: 1 / 30, s: null,
    P(k) { const P = CH_HWE_V2.P[k]; return P ? +P.v : 0; },
    H() { return EQ_LV[this.s.level]; },
    go(s, phase) { s.phase = phase; s.t = 0; },
    ask(s, ev, id, kind, o) {
      o = o || {}; s.ask = { id, kind, chart: o.chart || 0, lo: 0, hi: 1, at: o.at, start: o.start, tol: o.tol }; s.askT = 0;
      if (s.asks.indexOf(id) < 0) s.asks.push(id); ev.push({ k: 'ask', id });
    },
    near(acts, v) {   // the predict option nearest to v (bots)
      let best = acts[0], bd = 1e9;
      for (const a of acts) { const d = Array.isArray(v) ? EQ.triErr(a.v, v) : Math.abs(a.v - v); if (d < bd) { bd = d; best = a; } }
      return best;
    },
    reset(level, o) {
      o = o || {};
      if (o.thaw && o.thaw.snap) {   // What if?: the frozen moment, one lever changed (D1 G9)
        this.restore(o.thaw.snap); const s = this.s; s.log = []; s.whatif = o.thaw.lever; s.ask = null;
        const H = EQ_LV[s.level]; if (H.lever) H.lever(this, s, o.thaw.lever); return;
      }
      if (o.P) for (const k in o.P) if (CH_HWE_V2.P[k]) CH_HWE_V2.P[k].v = o.P[k];
      this.s = { level: EQ_MAP[level], phase: 'start', t: 0, T: 0, tick: 0, asks: [], pred: {}, exp: {}, hits: {}, err: {}, ask: null, askT: 0, log: [], whatif: null,
                 unt: !!(typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt) };
      EQ_LV[this.s.level].init(this, this.s);
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.tick++; s.t += dt;
      if (s.ask) { if (!s.unt) { s.askT += dt; if (s.askT > EQK.ASKMAX) this.commit(s, s.ask.id, null, ev); } return ev; }
      this.H().step(this, s, dt, ev);
      return ev;
    },
    commit(s, id, v, ev) {
      const A = s.ask, H = EQ_LV[s.level]; if (!A || A.id !== id) return;
      const e = H.expect(this, s, id), tri = A.kind === 'tri';
      let val = v;
      if (val != null) val = tri ? (Array.isArray(val) && val.length === 3 ? (t => [val[0] / t, val[1] / t, val[2] / t])(Math.max(1e-9, (+val[0] || 0) + (+val[1] || 0) + (+val[2] || 0))) : null) : Math.max(A.lo, Math.min(A.hi, +val));
      if (val != null && !tri && !isFinite(val)) val = null;
      const err = val == null ? 9 : tri ? EQ.triErr(val, e) : Math.abs(val - e);
      s.pred[id] = val; s.exp[id] = tri ? e.map(EQ.r2) : EQ.r2(e); s.err[id] = EQ.r2(err); s.hits[id] = err <= A.tol;
      s.ask = null; ev.push({ k: 'reveal', id, e, tol: A.tol, hit: s.hits[id], none: val == null });
      H.after(this, s, id, ev);
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id) this.commit(s, a.id, a.v, ev); return ev; }
      if (s.ask) return ev;
      this.H().act(this, s, a, ev);
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_HWE_V2.stars, n = s.level, H = EQ_LV[n];
      const mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { level: n, hits: Object.assign({}, s.hits) }, interesting: H.interesting ? H.interesting(this, s) : null };
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s; if (!s || s.phase === 'over') return [];
      if (s.ask) {
        const A = s.ask, out = [];
        if (A.kind === 'tri') { for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10 - i; j++) out.push({ k: 'predict', id: A.id, v: [i / 10, j / 10, EQ.r2(1 - i / 10 - j / 10)] }); }
        else for (let i = 0; i <= 20; i++) out.push({ k: 'predict', id: A.id, v: i / 20 });
        return out;
      }
      return this.H().actions(this, s) || [];
    },
    bots: {
      alwaysA(s, acts, rnd) { return EQ_LV[s.level].bot('alwaysA', CH_HWE_V2.sim, s, acts, rnd); },
      alwaysB(s, acts, rnd) { return EQ_LV[s.level].bot('alwaysB', CH_HWE_V2.sim, s, acts, rnd); },
      greedy(s, acts, rnd) { return EQ_LV[s.level].bot('greedy', CH_HWE_V2.sim, s, acts, rnd); },
      threshold(s, acts, rnd) { return EQ_LV[s.level].bot('threshold', CH_HWE_V2.sim, s, acts, rnd); }
    }
  },

  /* ---------------- stars: pure functions of the final state, scored against the expectation (D1 G10) ----------------
     Called with the simulation key (s.level). Each level gives only its own stars (D6 decision 9): Discover everywhere;
     Predict only on the tumbler (the chapter's one ask); Transfer only on the bait-layer (q held near your own q̂). */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false;
      if (n === 0) return s.manual >= EQK.L0.need && !!s.lapsed;
      if (n === 1) return s.pairs.length >= EQK.L1.big;
      if (n === 3) return s.res.length >= 2 && s.res.some(r => r.n >= 150);   // a big enough sample; not a χ² that once crossed 3.84
      if (n === 4) { const h = s.hist[3]; return s.gen >= EQK.L4.sched.length && !!h && h.c[1] / EQ.n(h.c) <= 0.8 * 2 * h.p * (1 - h.p); }
      if (n === 6) return s.hist.some(h => h.season <= EQK.L6.seasons && h.ad[1] / Math.max(1, EQ.n(h.ad)) > h.nb[1] / Math.max(1, EQ.n(h.nb)) + 0.03);   // the adult excess seen
      return false;
    },
    predict: (s, n) => !s.whatif && n === 1 && !!s.hits.het,
    transfer: (s, n) => {   // q settled near your own q̂ by season 10 (not "breed the most resistance")
      if (s.whatif || n !== 6) return false;
      const K = EQK.L6; return s.q.length > K.seasons && Math.abs(s.q[K.seasons] - EQ_LV[6].qhat(EQ_LV[6].meanS1(s, K.seasons), s.s2)) <= 0.12;
    }
  },

  /* teacher result code (D5 §3 item 10; ?unit=census&seed=S): 30 bits. 0–2 the engine level, 3–5 star mask, 6 the tumbler's
     Aa hit, then per level: L0 beetles tagged; L1 Aa bet %; L2 the two sample sizes ÷ 10; L3 F after three sib generations
     × 100; L4 grain lost ÷ 10. */
  resultBits(s, level) {
    if (!s) return 0;
    const lv = Math.max(0, Math.min(4, level | 0)), n = EQ_MAP[lv], st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(+v || 0))), P = s.pred || {};
    let bits = lv | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 3;
    if (s.hits && s.hits.het) bits |= 1 << 6;
    if (n === 0) bits |= c(s.manual, 127) << 10;
    else if (n === 1) bits |= c(100 * (P.het == null ? 0 : P.het), 127) << 10;
    else if (n === 3) bits |= c(((s.res[0] || {}).n || 0) / 10, 31) << 10 | c(((s.res[1] || {}).n || 0) / 10, 31) << 15;
    else if (n === 4) bits |= c(100 * (s.hist[3] ? EQ.Fhat(s.hist[3].c) : 0), 127) << 10;
    else bits |= c(((s.grainT || 0) + (s.baitT || 0)) / 10, 127) << 10;
    return bits >>> 0;
  },

  /* ================= view: lifecycle, juice, cards, HUD, dock, input (juice only from Sim.run's events) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this.k = EQ_MAP[n]; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._phase = '';
    this.v = { t: 0, fly: [], open: {}, landed: 0, sq: null, sqKey: '', bg: null, bgKey: '', crank: 0, drum: 0, spinHold: null, press: null, banner: null,
      pulse: 0, col: 0, jarShown: [0, 0], quadSent: 0, trayDrag: -1, traySent: 0, focus: 0, lens: this.k === 6 ? 'look' : 'genes',
      flash: {}, nursery: [], couple: -1, coupleT: 0, eat: {}, gone: [], revealT: -1, cenT: -1, popT: {}, hatchT: -1, kidPop: {},
      sheetT: 0, sheetWas: false, bounce: null, tok: null, colTag: 0 };
    Sim.start(this, n, o);
    const s = this.sim.s;
    if (s.whatif) this.v.lens = 'look';
    const k = this.k;
    if (k === 1 && s.pairs) this.v.landed = s.pairs.length;   // a thawed vial redraws its square and bars at once
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    this.dock(); this.hud();
    const name = s.whatif ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (typeof Ghost !== 'undefined' && !s.whatif) {
      const G = { verb: 'tap', key: 'Enter' };
      if (k === 0) Object.assign(G, { at: () => this.ghost0(), until: () => this.sim.s.manual > 0 || this.sim.s.phase !== 'tag1' });
      else if (k === 1) Object.assign(G, { verb: 'hold', key: 'Space', at: () => this.knob(), until: () => this.sim.s.pairs.length > 0 });   // its own verb, so the crank's demo shows (L0 used tap)
      else if (k === 4) Object.assign(G, { verb: 'toggle', key: 'V', at: () => this.valvePos('fam'), until: () => this.sim.s.mode === 'fam' });
      else if (k === 6) Object.assign(G, { at: () => this.yardPt(120, 150), until: () => this.sim.s.trays.length > 0 });
      else Object.assign(G, { verb: 'drag', key: 'ArrowRight', at: () => this.quadPark(), to: () => this.fieldPt(0.5, 0.45), until: () => this.sim.s.q && this.sim.s.q.x >= 0 });
      Ghost.show(G);
    }
  },
  update(dt) {
    const v = this.v, ev = Sim.run(this, dt), s = this.sim.s; if (!s) return;
    v.t += dt;
    for (const e of ev) this.juice(e);
    for (const f of v.fly) f.t += dt;
    for (let i = v.fly.length - 1; i >= 0; i--) { const f = v.fly[i]; if (f.t >= f.d) { if (f.land) f.land(f); v.fly.splice(i, 1); } }
    v.pulse = Math.max(0, v.pulse - dt * 2.5);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (s.phase === 'col1' || s.phase === 'col2') v.col = Math.min(1, s.t / EQK.L1.colT); else v.col = Math.max(0, v.col - dt * 3);
    if (v.sheetT && v.t >= v.sheetT) { v.sheetT = 0; this.foldSheet(); }
    if (v.spinHold && !v.spinHold.on && v.t - v.spinHold.t0 > 0.35 && !v.spinHold.moved) { v.spinHold.on = true; Sim.act(this, { k: 'spin', on: true }); }
    const spinning = s.spin && !s.ask;
    v.drum += dt * (spinning ? 7 : 0.6); if (spinning) v.crank += dt * 7;
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) this._asking = null;
    if (this._phase !== s.phase) { this._phase = s.phase; this.phaseIn(s.phase); }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  phaseIn(ph) {
    const s = this.sim.s, v = this.v;
    const late = v.sheetWas ? 0.35 : 0;   // on a phone the payoff waits for the prediction sheet to fold
    if (ph === 'reveal' || ph === 'census') v.revealT = v.t + (ph === 'reveal' ? 0 : late);
    if (ph === 'move' || (ph === 'sample' && this.k === 3 && s.beach === 1)) v.banner = { text: this.content.labels.southB, t: 0, ms: 1200 };
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    // no soft timer: an untouched guess is never committed for you (the sim's 30 s timeout scores no answer, with no lecture)
    const o = { id: A.id, chart: A.chart, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.start, tol: A.tol, soft: null };
    if (A.at != null || A.kind === 'y' || A.kind === 'x') o.at = this.askAt(A);
    Predict.ask(o); this.v.sheetWas = !!Predict.opened; this.dock();
    if (typeof Live !== 'undefined') Live.say(this.hudText());
  },
  askAt(A) {   // where the ghost sits: on the asked bar of an eq_bars chart, or on the bare axis line (0.45 up) so its halo has room
    if (A.kind === 'x') return 0.45;
    if (A.kind === 'y' && this.k === 1) return this.barAt(0, 1);
    return A.at;
  },
  foldSheet() { if (typeof Predict !== 'undefined') Predict.fold(); },   // fold the phone sheet Predict opened, about 250 ms after a commit, so the payoff plays in view
  barAt(g, b) { return g * 3.7 + b + 0.5; },   // x of bar b in group g on an eq_bars chart (three bars a group, a 0.7 gap)
  finish(r) {
    const s = this.sim.s, lv = this.level, k = this.k, C = this.content, last = lv === EQ_MAP.length - 1, o = { level: lv, mask: r.mask, final: last, interesting: r.interesting };
    const st = {}; for (const [key, c] of [['discover', 'd'], ['predict', 'p'], ['transfer', 't']]) if (C.captions['s' + lv + c]) st[key] = C.captions['s' + lv + c];
    o.stars = st;   // the card names only the stars this level can give
    if (!s.whatif) {
      o.take = C.captions['L' + lv];
      const pn = C.panels.find(p => p.id === 'L' + lv); if (pn) o.body = pn.text;
      if (k === 6) { const b = EQ_LV[6].best(s); o.body = C.body + ' ' + Txt.f(C.captions.grain6, { g: Math.round(s.grainT + s.baitT), k: b.k === 1 ? C.labels.tray1 : Txt.f(C.labels.trayN, { n: b.k }), o: b.g }); }   // the unit's thesis, then the knowable optimum
      o.why = { real: [C.why.real[lv]], maths: [C.why.maths[lv]] };
      const vial = typeof Freezer !== 'undefined' ? Freezer.list(this.id).slice(-1)[0] : null;
      if (vial && k === 1) o.whatIf = { gen: vial.gen, levers: ['nostir'] };
      if (vial && k === 6) o.whatIf = { gen: vial.gen, levers: ['nocost', 'nowarf'] };
    } else { o.body = C.captions.whatif; o.why = { real: [C.why.real[lv]], maths: [C.why.maths[lv]] }; }
    const spec = this.cardChart();
    if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  cardChart() { const ch = this.notes().charts; return ch[this.k === 0 ? 1 : 0] || ch[0]; },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, n = this.k, C = this.content;
    const snd = (k, x, y) => { if (typeof Snd2 !== 'undefined') Snd2.play(k, x != null ? { x, y } : undefined); };
    if (e.k === 'reveal') v.sheetT = v.t + 0.25;   // fold the phone sheet soon, so the payoff is not hidden
    if (e.k === 'reveal' && e.none) { if (typeof Predict !== 'undefined') Predict.cancel(e.id); return; }   // timed out untouched: no mark, no score, no lecture
    if (e.k === 'reveal') { if (typeof Predict !== 'undefined') Predict.reveal(e.id, e.e, e.tol); if (F) Fx.tier(1, () => {}); if (e.hit && F) Fx.pop('✓', Stage.w - 40, this.hudH() + 24, 1); return; }
    if (e.k === 'ask') { snd('tock', Stage.w - 36, this.hudH() + 18); return; }
    if (e.k === 'vial') { if (!s.whatif && typeof Freezer !== 'undefined') Freezer.put(this.id, e.g || 1, this.sim.snapshot()); return; }
    if (e.k === 'autospin') { this.whisper('square'); return; }
    if (n === 0) return this.juice0(e, F, snd);
    if (n === 1) return this.juiceLab(e, F, snd);
    if (n === 4) return this.juice4(e, F, snd);
    if (n === 6) return this.juice6(e, F, snd);
    return this.juiceField(e, F, snd);
  },
  clearAsk(i) {   // a committed ask's band stays on its chart; when that chart changes type, drop it
    const ov = typeof Predict !== 'undefined' ? Predict.overlay(i) : null; if (ov && !ov.active) Predict.clear(i);
  },
  whisper(k, vars) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(vars ? Txt.f(t, vars) : t, 'eq-' + k); },
  fly(o) { const f = Object.assign({ t: -(o.delay || 0), d: 0.45, lift: 30, r: 7 }, o); if (typeof Fx !== 'undefined' && Fx.calm) { f.d = 0.15; f.lift = 0; f.t = Math.max(f.t, -0.05); } this.v.fly.push(f); },

  /* ---------- HUD line, the live number, the dock ---------- */
  T(k, vars) { return Txt.f(this.content.hud[k], vars || {}); },
  hudText() {
    const s = this.sim.s, n = this.k, ph = s.phase, T = (k, x) => this.T(k, x), L = this.content.labels;
    if (n === 0) {
      if (s.open >= 0) return T('sort');
      if (ph === 'tag1' || ph === 'post1') return this.content.firstWords;
      if (ph === 'tag') return T('tag', { n: s.manual, m: EQK.L0.need });
      if (ph === 'reveal') return T('reveal', { a: EQ.pct(s.p), b: Math.round(100 * s.bs.filter(b => b.c < 2).length / s.bs.length) });
      if (ph === 'yule') return T('yule'); if (ph === 'lapse') return T('lapse'); return T('done0');
    }
    if (n === 1) {
      if (ph === 'c4') return T('crank'); if (ph === 'askHet') return T('askHet'); if (ph === 'c40') return T('c40');
      if (ph === 'col1') return T('collapse'); if (ph === 'spin') return T('spin');
      const e = this.shares1(); return T('settle', { a: EQ.pct(e[0]), b: EQ.pct(e[1]), c: EQ.pct(e[2]) });   // the key equation, with this run's own numbers
    }
    if (n === 3) {
      const t = Math.ceil(s.pool);
      if (ph === 'sample') return s.n ? T('sampleN', { n: s.n }) : (s.beach ? T('south', { t }) : T('sample', { t }));
      if (ph === 'census' && s.full) { const f = Math.round(100 * s.full.F); return f >= 6 ? T('census', { n: s.full.n, f }) : T('censusFit', { n: s.full.n }); }
      return T('south', { t });
    }
    if (n === 4) {
      const m = { mix: L.mix, fam: L.fam };
      if (ph === 'valve') return s.gen === 0 ? T('valve') : T('toMix');
      if (ph === 'crank') {
        if (!EQ_LV[4].ok(s)) return T('wrongValve', { m: m[s.want] });
        if (s.gen === 3 && s.couple === 0 && s.mode === 'mix') { const h = s.hist[3]; return T('named', { f: Math.max(0, Math.round(100 * (1 - h.c[1] / EQ.n(h.c) / Math.max(1e-6, 2 * h.p * (1 - h.p))))) }); }
        return s.mode === 'fam' ? T('crankF', { n: s.couple, m: EQK.L4.fams }) : T('crankM', { n: s.couple, m: EQK.L4.fams });
      }
      return T('done4');
    }
    const c = EQK.L6.cost;
    if (s.whatif) return T('whatif'); if (ph === 'qhat') return T('qhat', { v: (s.qh || 0).toFixed(2) }); if (s.auto) return T('nobait');
    if (s.fast > 1 && ph !== 'dawn') return T('fast');
    if (ph === 'dusk') return T('dusk', { g: s.season }); if (ph === 'place') return s.season === 1 ? T('place', { c }) : T('plan', { g: s.season, c });
    if (ph === 'night') return T('night', { g: s.season });
    if (ph === 'dawn' && s.rec) return T('dawn', { k: EQ.pct(s.rec.s1), n: s.rec.grain });
    return T('dusk', { g: s.season });
  },
  hudNum() {
    const s = this.sim.s, n = this.k, L = this.content.labels;
    if (n === 0) return s.phase === 'lapse' || s.phase === 'done0' ? 'gen ' + (s.blue.length - 1) : Txt.f(L.n, { n: s.manual });
    if (n === 1) return Txt.f(L.pairs, { n: s.pairs.length });
    if (n === 3) return s.phase === 'sample' && !s.unt ? Txt.f(L.secs, { n: Math.ceil(s.pool) }) : Txt.f(L.n, { n: s.phase === 'census' && s.full ? s.full.n : s.n });   // the census shows all of them
    if (n === 4) return 'p ' + s.hist[s.hist.length - 1].p.toFixed(2);
    return 'q ' + (s.q[s.q.length - 1] || 0).toFixed(2);
  },
  hud() { if (typeof HUD === 'undefined' || !HUD.say) return; const t = this.hudText(); HUD.say(t, this.hudNum()); if (t !== this._lastHud) { this._lastHud = t; } },
  dock() {
    if (typeof Dock === 'undefined' || !Dock.set || App.mode !== this) return;
    const s = this.sim.s, n = this.k, L = this.content.labels, ph = s.phase, b = [], need = 20;
    const sig = [n, ph, !!s.ask, s.spin, s.mode, s.n >= need, s.trays ? s.trays.length : 0, this.v.lens, s.p, s.fast, s.auto].join('|');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) b.push({ id: 'commit', label: 'Lock in', key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(s.ask && s.ask.id); } });
    else if ((n === 1 && (ph === 'c4' || ph === 'c40' || ph === 'spin')) || (n === 4 && ph === 'crank')) {
      b.push({ id: 'crank', label: L.crank, key: ' ', primary: !s.spin, fn: () => Sim.act(this, { k: 'crank', n: 1 }) });
      b.push({ id: 'spin', label: s.spin ? 'Stop' : 'Spin', key: 'S', pressed: !!s.spin, fn: () => Sim.act(this, { k: 'spin', on: !this.sim.s.spin }) });
    }
    if (n === 4 && !s.ask && ph !== 'over' && ph !== 'done4') b.push({ id: 'valve', label: 'Valve', key: 'V', primary: ph === 'valve', fn: () => this.cycleValve() });
    if (n === 3 && ph === 'sample') b.push({ id: 'finish', label: 'Finish', key: 'N', disabled: s.n < need, why: Txt.f(this.content.whispers.more, { n: need }), fn: () => Sim.act(this, { k: 'finish' }) });
    if (n === 6 && !s.ask && !s.auto) { if (ph === 'place') b.push({ id: 'release', label: 'Release', key: 'N', primary: true, fn: () => Sim.act(this, { k: 'release' }) }); b.push({ id: 'lens', label: this.v.lens === 'look' ? 'Genes' : 'Look', key: 'L', fn: () => { this.v.lens = this.v.lens === 'look' ? 'genes' : 'look'; this._dockSig = ''; this.dock(); } }); }
    Dock.set(b);
  },
  cycleValve() { const s = this.sim.s; Sim.act(this, { k: 'valve', m: s.mode === 'mix' ? 'fam' : 'mix' }); },

  /* ---------- input: taps, drags, holds; keyboard paths for every verb ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, n = this.k; v.press = { x, y, t: v.t, moved: false };
    if (n === 0 && s.open >= 0) { const k = this.tokHit(x, y); if (k >= 0) { v.press.tok = { k, c: s.left[k] }; v.tok = { k, x, y }; return; } }   // press a copy to drag it to a jar
    if ((n === 1 || n === 4) && this.crankable()) { const k = this.knob(), d = this.drumGeo(); if (k && (EQV.dist(x - k[0], y - k[1]) < 34 || EQV.dist(x - d.cx, y - d.cy) < d.r + 10)) v.spinHold = { t0: v.t, on: false, moved: false, px: x - d.cx, py: y - d.cy, acc: 0 }; }
    if (n === 4) { const vk = this.valveHit(x, y); if (vk) { Sim.act(this, { k: 'valve', m: vk }); v.press = null; return; } }
    if (n === 3 && s.q && s.phase === 'sample') { const r = this.quadRect(); if (r && x >= r.x - 14 && x <= r.x + r.w + 14 && y >= r.y - 14 && y <= r.y + r.h + 14) v.press.quad = { dx: x - (r.x + r.w / 2), dy: y - (r.y + r.h / 2) }; }
    if (n === 6 && !s.auto) { const i = this.trayHit(x, y); if (i >= 0) v.trayDrag = i; }
  },
  move(x, y) {
    const s = this.sim.s, v = this.v, n = this.k, p = v.press; if (!p) return;
    if (Math.abs(x - p.x) + Math.abs(y - p.y) > 10) p.moved = true;
    if (p.tok && v.tok) { v.tok.x = x; v.tok.y = y; return; }
    if (v.spinHold) {
      const d = this.drumGeo(), h = v.spinHold, nx = x - d.cx, ny = y - d.cy, l0 = EQV.dist(h.px, h.py), l1 = EQV.dist(nx, ny);
      const da = l0 > 8 && l1 > 8 ? Math.abs(h.px * ny - h.py * nx) / (l0 * l1) : 0;   // sin of the turned angle: small steps, so ≈ the angle
      h.px = nx; h.py = ny; if (p.moved) { h.moved = true; if (h.on) { h.on = false; Sim.act(this, { k: 'spin', on: false }); } }
      h.acc += da; v.crank += da;
      while (h.acc >= 3.14159) { h.acc -= 3.14159; Sim.act(this, { k: 'crank', n: 1 }); }
    }
    if (p.quad) { const fp = this.fieldUnit(x - p.quad.dx, y - p.quad.dy); if (v.t - v.quadSent > 0.08) { v.quadSent = v.t; Sim.act(this, { k: 'quad', x: fp[0], y: fp[1] }); } p.qx = fp; }
    if (v.trayDrag >= 0) { const q = this.yardUnit(x, y); v.trayGhost = q; if (v.t - v.traySent > 0.06) { v.traySent = v.t; Sim.act(this, { k: 'tray', i: v.trayDrag, x: q[0], y: q[1] }); } }
  },
  up(x, y) {
    const s = this.sim.s, v = this.v, n = this.k, p = v.press; v.press = null;
    if (v.spinHold) { const h = v.spinHold; v.spinHold = null; if (h.on) Sim.act(this, { k: 'spin', on: false }); else if (!h.moved && p && !p.moved) Sim.act(this, { k: 'crank', n: 1 }); return; }
    if (!p) return;
    if (p.tok) { v.tokDrop = v.tok ? [v.tok.x, v.tok.y] : null; v.tok = null; const j = this.jarHit(x, y); if (j >= 0) Sim.act(this, { k: 'jar', j, c: p.tok.c }); v.tokDrop = null; return; }   // dropped on a jar: in, or a bounce; dropped elsewhere: it floats back
    if (p.quad && p.qx) { Sim.act(this, { k: 'quad', x: p.qx[0], y: p.qx[1] }); return; }
    if (v.trayDrag >= 0) { const i = v.trayDrag; v.trayDrag = -1; v.trayGhost = null; if (!p.moved) { this.tap(x, y); return; } const q = this.yardUnit(x, y); Sim.act(this, { k: 'tray', i, x: q[0], y: q[1] }); return; }   // a tap on a tray (no drag) lifts it
    if (!p.moved) this.tap(x, y);
  },
  tap(x, y) {
    const s = this.sim.s, v = this.v, n = this.k;
    if (n === 0 && (s.phase === 'tag1' || s.phase === 'tag')) {
      if (s.open >= 0) { const j = this.jarHit(x, y); if (j >= 0) Sim.act(this, { k: 'jar', j }); return; }   // tap a jar: the next copy of that kind goes in, or bounces
      const i = this.hit0(x, y); if (i >= 0) Sim.act(this, { k: 'tag', i }); else this.whisper('copies'); return;
    }
    if (n === 3 && s.phase === 'sample') { const A = this.fieldRect(); if (x >= A.x && x <= A.x + A.w && y >= A.y && y <= A.y + A.h) { const fp = this.fieldUnit(x, y); Sim.act(this, { k: 'quad', x: fp[0], y: fp[1] }); } return; }
    if (n === 6 && !s.auto && (s.phase === 'dusk' || s.phase === 'place' || s.phase === 'night')) {
      const q = this.yardUnit(x, y); if (q[0] < 22 || q[0] > EQK.L6.W - 10) return;
      const hit = this.trayHit(x, y);
      if (hit >= 0 && s.phase !== 'night') { Sim.act(this, { k: 'untray', i: hit }); return; }   // tap a tray to lift it (it costs grain every night)
      if (s.trays.length < EQK.L6.trays) Sim.act(this, { k: 'tray', i: s.trays.length, x: q[0], y: q[1] }); else this.whisper('trays');
    }
  },
  onKey(k, e) {
    const s = this.sim.s, v = this.v, n = this.k; if (!s || s.ask) return;
    const key = k.length === 1 ? k.toLowerCase() : k;
    if (n === 0 && s.open >= 0 && (key === '1' || key === '2')) { Sim.act(this, { k: 'jar', j: key === '1' ? 0 : 1 }); return; }   // 1: the A jar, 2: the a jar
    if (n === 6 && !s.auto && (key === 'Backspace' || key === 'Delete') && s.trays.length) { Sim.act(this, { k: 'untray', i: s.trays.length - 1 }); return; }
    if (n === 0 && (s.phase === 'tag1' || s.phase === 'tag')) {
      const open = s.bs.map((b, i) => b.tag ? -1 : i).filter(i => i >= 0); if (!open.length) return;
      if (key === 'ArrowRight' || key === 'ArrowDown') v.focus = (v.focus + 1) % open.length; else if (key === 'ArrowLeft' || key === 'ArrowUp') v.focus = (v.focus + open.length - 1) % open.length;
      else if (key === 'Enter' || key === ' ') Sim.act(this, { k: 'tag', i: open[v.focus % open.length] });
      v.focusOn = true; return;
    }
    if ((n === 1 || n === 4) && key === 'Enter') { if (this.crankable()) Sim.act(this, { k: 'crank', n: 1 }); return; }
    if (n === 4 && key === 'v') { this.cycleValve(); return; }
    if (n === 3 && s.q && /^Arrow/.test(key) && s.phase === 'sample') {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[key], st = e && e.shiftKey ? 0.2 : 0.08;
      const x = s.q.x < 0 ? 0.5 : s.q.x + d[0] * st, y = s.q.y < 0 ? 0.5 : s.q.y + d[1] * st; Sim.act(this, { k: 'quad', x: Math.max(0.05, Math.min(0.95, x)), y: Math.max(0.05, Math.min(0.95, y)) }); return;
    }
    if (n === 6 && !s.auto && /^Arrow/.test(key) && s.trays.length) { const t = s.trays[s.trays.length - 1], d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[key]; Sim.act(this, { k: 'tray', i: s.trays.length - 1, x: t.x + d[0], y: t.y + d[1] }); return; }
    if (n === 6 && !s.auto && (key === 'Enter' || key === ' ') && s.trays.length < EQK.L6.trays) { const spots = [[200, 150], [200, 90], [200, 210], [200, 260]][s.trays.length]; Sim.act(this, { k: 'tray', i: s.trays.length, x: spots[0], y: spots[1] }); return; }
  },
  crankable() { const s = this.sim.s, n = this.k; return !s.ask && ((n === 1 && (s.phase === 'c4' || s.phase === 'c40' || s.phase === 'spin')) || (n === 4 && s.phase === 'crank' && s.mode === s.want)); },

  /* ================= geometry ================= */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  area() { const W = Stage.w, H = Stage.h, top = this.hudH() + 6; return { x: 10, y: top, w: Math.max(60, W - 20), h: Math.max(60, H - top - 10) }; },
  U() { return (typeof Stage !== 'undefined' && Stage.u) || 390; },
  // beach (L0): the field above the jars
  jarRect() { const A = this.area(), jh = EQV.jh(A), w = Math.min(A.w * 0.44, 220), gap = Math.min(24, A.w * 0.06), y = A.y + A.h - jh - 22; return { y, h: jh, w, a: { x: A.x + A.w / 2 - gap / 2 - w, y, w, h: jh }, b: { x: A.x + A.w / 2 + gap / 2, y, w, h: jh } }; },
  field0() { const A = this.area(), J = this.jarRect(); return { x: A.x + 8, y: A.y + 44, w: A.w - 16, h: Math.max(80, J.y - A.y - 62) }; },
  sz0() { return Math.round(EQV.clamp(0.08 * this.U(), 28, 42)); },
  pos0(i) {
    const F = this.field0(), s = this.sim.s, t = this.v.t, b = s.bs[i], hx = 0.08 + 0.84 * EQV.hash(i, 1), hy = 0.1 + 0.8 * EQV.hash(i, 2);
    const sp = (0.32 + 0.022 * Math.min(12, s.manual)) * (b && b.tag ? 0.45 : 1), w1 = 0.7 + 0.6 * EQV.hash(i, 3), w2 = 1.3 + 0.9 * EQV.hash(i, 4), f1 = 6.28 * EQV.hash(i, 5), f2 = 6.28 * EQV.hash(i, 6);
    const ux = hx + 0.07 * Det.sin(t * sp * w1 + f1) + 0.03 * Det.sin(t * sp * w2 * 1.7 + f2), uy = hy + 0.06 * Det.cos(t * sp * w1 * 0.8 + f2) + 0.025 * Det.sin(t * sp * w2 + f1);
    const dx = 0.07 * w1 * Det.cos(t * sp * w1 + f1) + 0.051 * w2 * Det.cos(t * sp * w2 * 1.7 + f2), dy = -0.048 * w1 * Det.sin(t * sp * w1 * 0.8 + f2) + 0.025 * w2 * Det.cos(t * sp * w2 + f1);
    return [F.x + F.w * EQV.clamp(ux, 0.03, 0.97), F.y + F.h * EQV.clamp(uy, 0.03, 0.97), EQV.atan2(dy * F.h, dx * F.w) + 1.5707963];
  },
  hit0(x, y) { const s = this.sim.s, r = Math.max(24, this.sz0() * 0.75); let bi = -1, bd = r * r; s.bs.forEach((b, i) => { if (b.tag) return; const p = this.pos0(i), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < bd) { bd = d; bi = i; } }); return bi; },
  ghost0() { const s = this.sim.s, i = s.bs.findIndex(b => !b.tag); return i < 0 ? null : this.pos0(i).slice(0, 2); },
  // L0 sorting: the open beetle's copies hover above it until you send each to a jar
  tokPos(k) { const s = this.sim.s, sz = this.sz0(); if (s.open < 0) return null; const p = this.pos0(s.open), one = s.left.length === 1; return [p[0] + (one ? 0 : (k ? 0.5 : -0.5) * sz), p[1] - 0.95 * sz]; },
  tokHit(x, y) { const s = this.sim.s; for (let k = 0; k < s.left.length; k++) { const t = this.tokPos(k); if (t && EQV.dist(x - t[0], y - t[1]) < 26) return k; } return -1; },
  jarHit(x, y) { const J = this.jarRect(); for (const [j, r] of [[0, J.a], [1, J.b]]) if (x >= r.x - 12 && x <= r.x + r.w + 12 && y >= r.y - 24 && y <= r.y + r.h + 24) return j; return -1; },
  // lab (L1, L4): hoppers, drum, square / families
  drumGeo() {
    const A = this.area(), n = this.k, m = Math.min(A.w, A.h * 0.95);
    if (n === 1) { const r = Math.round(EQV.clamp(m * 0.13, 34, 70)); return { cx: A.x + A.w / 2, cy: A.y + 16 + r * 1.35, r }; }
    const r = Math.round(EQV.clamp(m * 0.1, 28, 52)); return { cx: A.x + A.w * 0.3, cy: A.y + 14 + r * 1.3, r };
  },
  knob() { const d = this.drumGeo(), L = d.r * 1.32, a = this.v.crank; return [d.cx + L * Det.cos(a), d.cy + L * Det.sin(a)]; },
  hoppers() { const d = this.drumGeo(), w = Math.round(EQV.clamp(d.r * 1.25, 40, 84)), h = Math.round(w * 1.15), gap = d.r * 1.55 + w * 0.6; return { a: { x: d.cx - gap - w / 2, y: d.cy - h * 0.62, w, h }, b: { x: d.cx + gap - w / 2, y: d.cy - h * 0.62, w, h } }; },
  sqGeo() { const A = this.area(), d = this.drumGeo(), top = d.cy + d.r * 1.55 + 22, room = A.y + A.h - top - 96, S = Math.round(EQV.clamp(Math.min(A.w * 0.62, room), 120, 330)); return { x: A.x + A.w / 2 - S / 2 + 10, y: top, S }; },
  barGeo1() { const A = this.area(), q = this.sqGeo(), y = q.y + q.S + 28; return { x: A.x + A.w / 2 - Math.min(A.w * 0.36, 170), y, w: Math.min(A.w * 0.72, 340), h: Math.max(44, A.y + A.h - y - 18) }; },
  // the census field
  fieldRect() { const A = this.area(); return { x: A.x + 2, y: A.y + 48, w: A.w - 4, h: A.h - 54 }; },
  fieldPt(ux, uy) { const F = this.fieldRect(); return [F.x + ux * F.w, F.y + uy * F.h]; },
  fieldUnit(x, y) { const F = this.fieldRect(); return [EQV.clamp((x - F.x) / F.w, 0, 1), EQV.clamp((y - F.y) / F.h, 0, 1)]; },
  quadRect() { const s = this.sim.s, F = this.fieldRect(), K = EQK.L3; if (!s.q) return null; const q = s.q.x < 0 ? this.parkUnit() : [s.q.x, s.q.y]; return { x: F.x + (q[0] - K.hw) * F.w, y: F.y + (q[1] - K.hh) * F.h, w: 2 * K.hw * F.w, h: 2 * K.hh * F.h, parked: s.q.x < 0 }; },
  parkUnit() { return [0.86, 0.86]; },
  quadPark() { const u = this.parkUnit(); return this.fieldPt(u[0], u[1]); },
  szF() { return Math.round(EQV.clamp(0.043 * this.U(), 15, 21)); },
  // yard (L6): a virtual 360 × 300 yard, letterboxed
  yardGeo() { const A = this.area(), K = EQK.L6, k = Math.min(A.w / K.W, (A.h - 8) / K.H); return { k, ox: A.x + (A.w - K.W * k) / 2, oy: A.y + 4 + (A.h - 8 - K.H * k) / 2 }; },
  yardPt(x, y) { const g = this.yardGeo(); return [g.ox + x * g.k, g.oy + y * g.k]; },
  yardUnit(x, y) { const g = this.yardGeo(); return [(x - g.ox) / g.k, (y - g.oy) / g.k]; },
  trayHit(x, y) { const s = this.sim.s, g = this.yardGeo(), r = Math.max(26, EQK.L6.r * g.k); let bi = -1, bd = r * r; s.trays.forEach((t, i) => { const p = this.yardPt(t.x, t.y), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < bd) { bd = d; bi = i; } }); return bi; },
  // L4: the valve and the families
  valvePos(m) { const d = this.drumGeo(), i = ['mix', 'fam'].indexOf(m), w = Math.min(96, (this.area().w - 20) / 3.2); return [d.cx - w / 2 + i * w, d.cy + d.r * 1.55 + 18]; },
  valveHit(x, y) { for (const m of ['mix', 'fam']) { const p = this.valvePos(m); if (Math.abs(x - p[0]) < 46 && Math.abs(y - p[1]) < 24) return m; } return null; },
  famGeo() {
    const A = this.area(), top = this.valvePos('mix')[1] + 26, land = A.w > A.h * 1.05, cols = land ? 8 : 6, rows = 24 / cols, nurse = 46;
    const h = A.y + A.h - top - nurse - 8, cw = A.w / cols, ch = h / rows; return { x: A.x, y: top, cols, rows, cw, ch, ny: A.y + A.h - nurse, nh: nurse };
  },
  famSlot(i) { const G = this.famGeo(), c = i % G.cols, r = Math.floor(i / G.cols); return { x: G.x + c * G.cw + 3, y: G.y + r * G.ch + 3, w: G.cw - 6, h: G.ch - 6 }; },
  /* ================= drawing ================= */
  draw(c, W, H) {
    const s = this.sim.s; if (!s) return;
    const n = this.k;
    if (n === 0) this.draw0(c, W, H);
    else if (n === 1) this.draw1(c, W, H);
    else if (n === 4) this.draw4(c, W, H);
    else if (n === 6) this.draw6(c, W, H);
    else this.drawField(c, W, H);
    this.drawFly(c);
    this.drawBanner(c, W, H);
  },
  bg(c, W, H, key, fn) {
    const v = this.v, k = key + '|' + Math.round(W) + 'x' + Math.round(H) + '|' + (typeof Pal !== 'undefined' ? Pal.theme : '');
    if (v.bgKey !== k || !v.bg) { v.bgKey = k; if (typeof Layer !== 'undefined') v.bg = Layer(W, H).redraw((cc, w, h) => fn(cc, w, h)); else { v.bg = null; } }
    if (v.bg) v.bg.blit(c, 0, 0); else fn(c, W, H);
  },
  lbl(id, text, x, y, o) { if (typeof Lbl === 'undefined') return null; return Lbl.put(id, text, x, y, Object.assign({ c: Stage.ctx }, o || {})); },
  drawBanner(c, W, H) { const b = this.v.banner; if (!b) return; const a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; this.lbl('eq-banner', b.text, W / 2, H * 0.44, { size: 22, weight: 700 }); c.restore(); },
  drawFly(c) {
    for (const f of this.v.fly) {
      if (f.t < 0) continue; const k = EQV.easeIO(f.t / f.d), x = EQV.lerp(f.x0, f.x1, k), y = EQV.lerp(f.y0, f.y1, k) - Det.sin(k * 3.14159) * f.lift;
      if (f.zyg) this.zygote(c, x, y, f.r * 0.8, f.geno[0], f.geno[1]); else if (f.kind) this.gamete(c, x, y, f.r, f.a, f.kind, f.kind === 'sperm' ? EQV.atan2(f.y1 - f.y0, f.x1 - f.x0) : 0); else if (f.geno) Pal.genotype(c, x, y, f.r, f.geno[0], f.geno[1], { letter: '' }); else if (typeof Pal !== 'undefined') Pal.token(c, x, y, f.r, f.a, { letter: f.r >= 7 ? undefined : '' });
    }
  },
  sand(c, W, H, seed, o) {   // Beetle Isle's sand: speckle, ripples and shells (natural paint, kept away from the data inks)
    o = o || {}; const rnd = EQV.rng(seed || 7), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || '#CDB98B'); g.addColorStop(1, o.bot || '#BBA373');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 90; i++) { const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * 1.3; c.fillStyle = rnd() < 0.5 ? 'rgba(90,70,40,.16)' : 'rgba(255,250,235,.22)'; c.fillRect(x, y, r, r); }
    c.lineWidth = 1.2; for (let i = 0; i < W * H / 9000; i++) { const x = rnd() * W, y = rnd() * H, w = 30 + rnd() * 70; c.strokeStyle = 'rgba(255,248,230,.18)'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 5, x + w, y); c.stroke(); }
    for (let i = 0; i < W * H / 26000; i++) { const x = rnd() * W, y = rnd() * H; c.fillStyle = '#E9DFC8'; c.beginPath(); c.ellipse(x, y, 3 + rnd() * 2, 2 + rnd() * 1.5, rnd() * 3, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(80,60,40,.35)'; c.lineWidth = 0.8; c.stroke(); }
  },
  labPlate(c, W, H) { c.fillStyle = EQV.LAB; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(27,22,18,.06)'; c.lineWidth = 1; for (let x = 0; x < W; x += 22) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); c.stroke(); } for (let y = 0; y < H; y += 22) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); c.stroke(); } },
  beetle(c, x, y, size, a, genes, o) {
    o = o || {}; if (typeof Rig !== 'undefined' && Rig.has && Rig.has('beetle')) return Rig.draw(c, 'beetle', { a }, x, y, Object.assign({ size, genes }, o));
    Pal.genotype(c, x, y, size * 0.35, genes ? a[0] : (a[0] === 0 || a[1] === 0 ? 0 : 1), genes ? a[1] : (a[0] === 0 || a[1] === 0 ? 0 : 1), { letter: '' });
  },
  mini(c, x, y, size, a, genes, rot, noRing, sil) {   // a crowd beetle (D4 §4.1 rule 6): head and split wing cases, no legs or letters; sil: not yet sampled
    const A = EQV.pal('A', '#6B97FF'), B = EQV.pal('a', '#F2C94C'), dom = a[0] === 0 || a[1] === 0;
    const l = sil ? EQV.SIL : genes ? (a[0] ? B : A) : (dom ? A : B), r = sil ? EQV.SIL : genes ? (a[1] ? B : A) : (dom ? A : B), ring = !!(genes && !noRing && !sil);
    const cr = Det.cos(rot), sr = Det.sin(rot), dl = !sil && l === B, dr = !sil && r === B;   // amber wing cases carry a dark dot: a pattern channel for ?cvd=mono
    const sp = this.miniSprite(size, l, r, ring, dl, dr);   // a field holds 300–600 of these: blit a cached sprite instead of six antialiased paths each
    if (sp) { const k = size / sp.sz; c.save(); c.transform(cr * k, sr * k, -sr * k, cr * k, x, y); c.drawImage(sp.L.cv, -sp.half, -sp.half, 2 * sp.half, 2 * sp.half); c.restore(); return; }
    c.save(); c.transform(cr, sr, -sr, cr, x, y); this.miniPaths(c, size, l, r, ring, dl, dr, sil); c.restore();
  },
  miniPaths(c, size, l, r, ring, dl, dr, sil) {
    const rx = size * 0.32, ry = size * 0.42;
    c.fillStyle = sil ? 'rgba(43,36,32,.55)' : '#2B2420'; c.beginPath(); c.ellipse(0, -ry * 1.05, rx * 0.55, rx * 0.45, 0, 0, 6.283); c.fill();
    c.fillStyle = l; c.beginPath(); c.moveTo(0, -ry); c.ellipse(0, 0, rx, ry, 0, -1.5708, 1.5708, true); c.closePath(); c.fill();
    c.fillStyle = r; c.beginPath(); c.moveTo(0, -ry); c.ellipse(0, 0, rx, ry, 0, -1.5708, 1.5708, false); c.closePath(); c.fill();
    c.fillStyle = 'rgba(27,22,18,.6)'; if (dl) { c.beginPath(); c.arc(-rx * 0.45, ry * 0.1, Math.max(0.9, size * 0.06), 0, 6.283); c.fill(); } if (dr) { c.beginPath(); c.arc(rx * 0.45, ry * 0.1, Math.max(0.9, size * 0.06), 0, 6.283); c.fill(); }
    c.lineWidth = 1.2; c.strokeStyle = sil ? 'rgba(27,22,18,.45)' : EQV.INK; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 6.283); c.stroke(); c.beginPath(); c.moveTo(0, -ry); c.lineTo(0, ry); c.stroke();
    if (ring) { c.lineWidth = 2; c.strokeStyle = 'rgba(244,238,221,.8)'; c.beginPath(); c.ellipse(0, 0, rx + 2, ry + 2, 0, 0, 6.283); c.stroke(); }
  },
  miniSprite(size, l, r, ring, dl, dr) {   // sprites keyed by colours, ring, dots and a 2 px size bucket; drawn at 1.5× the Layer's own pixel ratio so a pop to 1.5× stays crisp
    if (typeof Layer !== 'function') return null;
    const sz = Math.max(4, Math.round(size / 2) * 2), sil = l === EQV.SIL, key = l + '|' + r + '|' + (ring ? 1 : 0) + (dl ? 1 : 0) + (dr ? 1 : 0) + '|' + sz, C = EQV.sprites || (EQV.sprites = {});
    let sp = C[key]; if (sp) return sp;
    if (Object.keys(C).length > 160) { EQV.sprites = {}; return null; }
    const half = Math.ceil(sz * 0.62 + 4), up = 1.5;
    try { const L = Layer(2 * half * up, 2 * half * up).redraw(cc => { cc.scale(up, up); cc.translate(half, half); this.miniPaths(cc, sz, l, r, ring, dl, dr, sil); }); sp = C[key] = { L, half, sz }; } catch (e) { return null; }
    return sp;
  },
  jar(c, r, a, n, max, label) {   // a glass jar of allele tokens: the rung-0 chart of p (D4 §4.2)
    const ink = EQV.INK; c.save();
    c.fillStyle = 'rgba(244,238,221,.28)'; rrect(c, r.x, r.y, r.w, r.h, 10); c.fill(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke();
    c.fillStyle = 'rgba(244,238,221,.5)'; c.fillRect(r.x + 6, r.y - 5, r.w - 12, 6); c.strokeRect(r.x + 6, r.y - 5, r.w - 12, 6);
    const tr = EQV.tok(r, max), cols = Math.max(1, Math.floor((r.w - 8) / (2 * tr + 1.5)));
    for (let k = 0; k < Math.min(n, max); k++) { const cx = r.x + 4 + tr + (k % cols) * (2 * tr + 1.5), cy = r.y + r.h - 4 - tr - Math.floor(k / cols) * (2 * tr + 1.5); Pal.token(c, cx, cy, tr, a, { letter: tr >= 7 ? undefined : '', lw: 1 }); }
    c.restore();
    this.lbl('eq-jar' + a, label + ' ' + n, r.x + r.w / 2, r.y + r.h + 12, { size: 13 });
  },
  jarSlot(r, a, k, max) { const tr = EQV.tok(r, max), cols = Math.max(1, Math.floor((r.w - 8) / (2 * tr + 1.5))); return [r.x + 4 + tr + (k % cols) * (2 * tr + 1.5), r.y + r.h - 4 - tr - Math.floor(k / cols) * (2 * tr + 1.5), tr]; },

  /* ---------- L0: the beach and the jars ---------- */
  draw0(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels, sz = this.sz0(), J = this.jarRect();
    this.bg(c, W, H, 'sand0', (cc, w, h) => this.sand(cc, w, h, 11));
    const lapse = s.phase === 'lapse' || s.phase === 'done0';
    s.bs.forEach((b, i) => {
      const p = this.pos0(i), op = v.open[i], k = op != null ? EQV.clamp((v.t - op) / 0.22, 0, 1) : 1, sc = op != null ? 1 + 0.3 * (1 - k) : 1, pl = lapse ? 1 + 0.12 * v.pulse : 1;
      const a = EQ_LV[0].alleles(b);
      if (b.tag) { c.save(); c.beginPath(); c.arc(p[0], p[1], sz * 0.62 * sc, 0, 6.283); c.lineWidth = 3; c.strokeStyle = 'rgba(244,238,221,.75)'; c.stroke(); c.restore(); }
      this.beetle(c, p[0], p[1], sz * sc * pl, a, !!b.tag, { rot: p[2], id: i });
      if (v.focusOn && !b.tag) { const open = s.bs.map((q, j) => q.tag ? -1 : j).filter(j => j >= 0); if (open[v.focus % open.length] === i) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 2.5; c.strokeStyle = EQV.INK; c.strokeRect(p[0] - sz * 0.7, p[1] - sz * 0.7, sz * 1.4, sz * 1.4); c.restore(); } }
    });
    // during the lapse the pill and the jars show all 20,000 (copies scaled to 80 tokens); the forty here are a fresh sample each generation
    const blue = s.bs.filter(b => b.c < 2).length, pp = EQ.p(s.big), jarN = lapse ? [Math.round(80 * pp), 80 - Math.round(80 * pp)] : v.jarShown;
    this.lbl('eq-looks', lapse ? Txt.f(L.popBlue, { x: EQ.pct(s.blue[s.blue.length - 1]) }) : Math.round(100 * blue / s.bs.length) + '% look blue', Stage.w - 16, this.area().y + 16, { align: 'right', size: 13 });   // right side: the whisper sits top-left
    if (lapse) this.lbl('eq-gen', 'gen ' + (s.blue.length - 1), Stage.w - 16, this.area().y + 64, { align: 'right', size: 13, mono: true });
    if (lapse || s.phase === 'yule') this.lbl('eq-yule', L.yuleBet, Stage.w - 16, this.area().y + 40, { align: 'right', size: 13, bg: 'rgba(244,238,221,.6)' });   // Yule's bet stays on screen beside the real blue share
    this.jar(c, J.a, 0, jarN[0], 80, L.jarA); this.jar(c, J.b, 1, jarN[1], 80, L.jara);
    if (s.open >= 0) {   // the open beetle's copies, waiting to be sorted; the jars pulse
      const pu = 0.5 + 0.5 * Det.sin(v.t * 6); c.save(); c.setLineDash([6, 4]); c.lineWidth = 2 + pu; c.strokeStyle = EQV.INK;
      for (const r of [J.a, J.b]) { rrect(c, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 12); c.stroke(); } c.restore();
      s.left.forEach((a, k) => {
        let t = this.tokPos(k); if (v.tok && v.tok.k === k) t = [v.tok.x, v.tok.y];
        const bo = v.bounce && v.t - v.bounce.t < 0.4 && v.bounce.c === a ? 6 * Det.sin((v.t - v.bounce.t) * 50) * (1 - (v.t - v.bounce.t) / 0.4) : 0;
        c.save(); c.beginPath(); c.arc(t[0] + bo, t[1], 14, 0, 6.283); c.fillStyle = 'rgba(244,238,221,.85)'; c.fill(); c.restore();
        Pal.token(c, t[0] + bo, t[1], 11, a, { lw: 1.5 });
      });
    }
  },
  jarFromBeetles() { const out = [0, 0]; for (const b of this.sim.s.bs) { const a = EQ_LV[0].alleles(b); out[a[0]]++; out[a[1]]++; } return out; },
  juice0(e, F, snd) {
    const s = this.sim.s, v = this.v, J = this.jarRect(), sz = this.sz0();
    if (e.k === 'tag') {
      const p = this.pos0(e.i); v.open[e.i] = v.t; const delay = e.auto && s.phase === 'reveal' ? 0.02 * (e.i % 40) : e.auto ? 0.03 * (e.i % 40) : 0.12;
      if (F && !e.auto) { Fx.ring(p[0], p[1], sz * 0.8); Fx.burst('scale', p[0], p[1], 5); snd('scale', p[0], p[1]); if (s.manual === 1) this.whisper('copies'); else if (s.bs[e.i].c === 1 && !v.saidDom) { v.saidDom = 1; this.whisper('dominant'); } if (s.manual === 8) this.whisper('skittish'); }
      e.a.forEach((a, j) => {
        const k = v.jarShown[a] + v.fly.filter(f => f.jar === a).length, slot = this.jarSlot(a ? J.b : J.a, a, k, 80);
        this.fly({ a, jar: a, x0: p[0] + (j ? 0.18 : -0.18) * sz, y0: p[1] + 0.07 * sz, x1: slot[0], y1: slot[1], r: Math.max(6, slot[2] + 2), d: 0.5, delay: delay + j * 0.06, lift: 40,
          land: () => { v.jarShown[a]++; if (F && !e.auto) { Fx.pop('+1', slot[0], slot[1] - 14, 0); } if (!e.auto && typeof Snd !== 'undefined' && Snd.click) Snd.click(); } });
      });
      return;
    }
    if (e.k === 'open') { const p = this.pos0(e.i); v.open[e.i] = v.t; if (F) { Fx.ring(p[0], p[1], sz * 0.8); Fx.burst('scale', p[0], p[1], 5); } snd('scale', p[0], p[1]); if (s.sorted === 0) this.whisper('copies'); return; }
    if (e.k === 'bounce') { v.bounce = { t: v.t, c: e.c }; snd('tock'); this.whisper('jar', { a: e.c ? this.content.labels.amberA : this.content.labels.blueA }); return; }
    if (e.k === 'sort') {   // one copy flies from above the beetle into its jar
      const p = this.pos0(e.i), sz0 = this.sz0(), from = v.tokDrop || [p[0] + (e.two ? (e.idx ? 0.5 : -0.5) : 0) * sz0, p[1] - 0.95 * sz0], k = v.jarShown[e.a] + v.fly.filter(f => f.jar === e.a).length, slot = this.jarSlot(e.a ? J.b : J.a, e.a, k, 80);
      this.fly({ a: e.a, jar: e.a, x0: from[0], y0: from[1], x1: slot[0], y1: slot[1], r: Math.max(6, slot[2] + 2), d: 0.4, lift: 30, land: () => { v.jarShown[e.a]++; if (F) Fx.pop('+1', slot[0], slot[1] - 14, 0); if (typeof Snd !== 'undefined' && Snd.click) Snd.click(); } });
      return;
    }
    if (e.k === 'sorted') { if (s.bs[e.i].c === 1 && !v.saidDom) { v.saidDom = 1; this.whisper('dominant'); } if (s.manual === 8) this.whisper('skittish'); return; }
    if (e.k === 'revealAll') { if (F) { Fx.tier(2, () => {}); Fx.flash({ edge: true }); } snd('count'); return; }
    if (e.k === 'gen') { v.pulse = 1; if (F && e.g % 5 === 0) Fx.tier(1, () => {}); if (e.g % 10 === 0) snd('tick'); return; }
    if (e.k === 'yule') { this.whisper('yule'); return; }
    if (e.k === 'lapsed') { if (F) Fx.tier(2, () => {}); snd('dusk'); if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.captions.live0, { n: s.manual, a: s.jar[0], b: s.jar[1] })); }
  },

  /* ---------- the lab: hoppers, the tumbling drum, the crank ---------- */
  hopper(c, r, p, label, k) {
    const ink = EQV.INK; c.save();
    c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x + r.w, r.y); c.lineTo(r.x + r.w * 0.62, r.y + r.h); c.lineTo(r.x + r.w * 0.38, r.y + r.h); c.closePath();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); c.save(); c.clip();
    const tr = Math.max(4, Math.round(r.w / 11)), rows = Math.ceil(r.h / (2 * tr)), rnd = EQV.rng(k * 31 + 5);   // the hopper holds real gametes: eggs (k 1) or sperm (k 2), each carrying one copy
    for (let j = 0; j < rows; j++) for (let i = 0; i < 6; i++) { const x = r.x + tr + i * (r.w - 2 * tr) / 5 + (j % 2 ? tr * 0.5 : 0), y = r.y + r.h - tr - j * tr * 1.7; this.gamete(c, x, y, tr, rnd() < p ? 0 : 1, k === 1 ? 'egg' : 'sperm', rnd() * 6.28); }
    c.restore(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke(); c.restore();
    this.lbl('eq-hop' + k, label, r.x + r.w / 2, r.y - 12, { size: 13 });
    this.lbl('eq-hp' + k, 'p ' + p.toFixed(2), r.x + r.w / 2, r.y + r.h + 13, { size: 12, mono: true });
  },
  // D6 decision 10: the tumbler pairs gametes the beetles shed. An egg is a cream cell with its copy in the nucleus; a sperm is a
  // head carrying its copy, with a tail; a fertilised egg (zygote) is a cream cell holding both copies (egg's left, sperm's right).
  gamete(c, x, y, r, a, kind, rot) {
    const ink = EQV.INK, fill = a ? EQV.pal('a', '#F2C94C') : EQV.pal('A', '#6B97FF');
    c.save();
    if (kind === 'egg') {
      c.beginPath(); c.ellipse(x, y, r, r * 0.9, 0, 0, 6.283); c.fillStyle = '#F6ECD0'; c.fill(); c.lineWidth = Math.max(0.8, r * 0.14); c.strokeStyle = ink; c.stroke();
      c.beginPath(); c.arc(x, y, r * 0.5, 0, 6.283); c.fillStyle = fill; c.fill(); c.lineWidth = 0.8; c.stroke();
      if (a && r >= 5) { c.beginPath(); c.arc(x, y, Math.max(0.8, r * 0.14), 0, 6.283); c.fillStyle = 'rgba(27,22,18,.65)'; c.fill(); }   // amber carries a dark dot: a channel for ?cvd=mono
    } else {
      const cr = Det.cos(rot || 0), sr = Det.sin(rot || 0), hx = r * 0.62, hy = r * 0.42;
      c.translate(x, y); c.transform(cr, sr, -sr, cr, 0, 0);
      c.beginPath(); c.moveTo(-hx * 0.8, 0); for (let t = 0; t <= 1.0001; t += 0.125) c.lineTo(-hx * 0.8 - t * r * 1.9, Det.sin(t * 9.4) * r * 0.22); c.lineWidth = Math.max(0.8, r * 0.13); c.strokeStyle = ink; c.stroke();   // the tail
      c.beginPath(); c.ellipse(0, 0, hx, hy, 0, 0, 6.283); c.fillStyle = fill; c.fill(); c.lineWidth = 0.9; c.stroke();
      if (a && r >= 5) { c.beginPath(); c.arc(0, 0, Math.max(0.8, r * 0.13), 0, 6.283); c.fillStyle = 'rgba(27,22,18,.65)'; c.fill(); }
    }
    c.restore();
  },
  zygote(c, x, y, r, a1, a2) {
    c.beginPath(); c.arc(x, y, r * 1.35, 0, 6.283); c.fillStyle = '#F6ECD0'; c.fill(); c.lineWidth = Math.max(0.8, r * 0.18); c.strokeStyle = EQV.INK; c.stroke();
    Pal.genotype(c, x, y, r * 0.82, a1, a2, { letter: '' });
  },
  parents(c) {   // L1: a female beetle sheds eggs into the left hopper, a male sheds sperm into the right (cosmetic; the pools are p)
    const hp = this.hoppers(), v = this.v, sz = Math.round(EQV.clamp(hp.a.w * 0.62, 30, 52)), L = this.content.labels, A = this.area(), calm = typeof Fx !== 'undefined' && Fx.calm;
    for (const [r, k, side] of [[hp.a, 1, -1], [hp.b, 2, 1]]) {
      const bx = EQV.clamp(side < 0 ? r.x - sz * 0.62 : r.x + r.w + sz * 0.62, A.x + sz * 0.5, A.x + A.w - sz * 0.5), by = r.y + r.h * 0.18;
      this.beetle(c, bx, by, sz, [0, 1], false, { rot: side < 0 ? 0.5 : -0.5, id: 900 + k, state: 'idle', t: v.t });
      this.lbl('eq-par' + k, k === 1 ? L.female : L.male, bx, by + sz * 0.62, { size: 12, pill: false, ink: EQV.INK });
      for (let j = 0; j < 2; j++) {   // two gametes always on their way from the beetle into the hopper's mouth
        const t = calm ? 0.5 : ((v.t * 0.7 + j * 0.5 + k * 0.23) % 1), x0 = bx - side * sz * 0.3, y0 = by - sz * 0.1, x1 = r.x + r.w * (side < 0 ? 0.3 : 0.7), y1 = r.y + 4;
        this.gamete(c, EQV.lerp(x0, x1, t), EQV.lerp(y0, y1, t) - Det.sin(t * 3.14159) * 16, 5, j, k === 1 ? 'egg' : 'sperm', side < 0 ? 0 : 3.14159);
      }
    }
  },
  drum(c, d, mode) {
    const v = this.v, ink = EQV.INK, a = v.drum; c.save();
    c.beginPath(); c.arc(d.cx, d.cy, d.r, 0, 6.283); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); c.lineWidth = 3; c.strokeStyle = ink; c.stroke();
    c.save(); c.beginPath(); c.arc(d.cx, d.cy, d.r - 2, 0, 6.283); c.clip();
    for (let k = 0; k < 10; k++) { const ang = a * (0.6 + 0.07 * k) + k * 0.63, rr = d.r * (0.35 + 0.45 * EQV.hash(k, 9)); this.gamete(c, d.cx + rr * Det.cos(ang), d.cy + rr * Det.sin(ang) * 0.9, Math.max(4, d.r * 0.11), k % 3 === 0 ? 0 : 1, k % 2 ? 'sperm' : 'egg', ang + 1.57); }   // eggs and sperm tumbling together
    c.restore();
    const walls = mode === 'fam' ? 12 : mode === 'like' ? 2 : 4; c.lineWidth = mode === 'mix' ? 1.5 : 2.5; c.strokeStyle = mode === 'mix' ? 'rgba(27,22,18,.45)' : ink;
    for (let k = 0; k < walls; k++) { const ang = a * 0.5 + k * 6.283 / walls; c.beginPath(); c.moveTo(d.cx, d.cy); c.lineTo(d.cx + d.r * Det.cos(ang), d.cy + d.r * Det.sin(ang)); c.stroke(); }
    c.beginPath(); c.arc(d.cx, d.cy, 5, 0, 6.283); c.fillStyle = ink; c.fill();
    c.fillStyle = '#8C7A63'; c.beginPath(); c.moveTo(d.cx - 12, d.cy + d.r - 2); c.lineTo(d.cx + 12, d.cy + d.r - 2); c.lineTo(d.cx + 6, d.cy + d.r + 14); c.lineTo(d.cx - 6, d.cy + d.r + 14); c.closePath(); c.fill(); c.lineWidth = 1.5; c.strokeStyle = ink; c.stroke();
    const kb = this.knob(); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = ink; c.beginPath(); c.moveTo(d.cx, d.cy); c.lineTo(kb[0], kb[1]); c.stroke(); c.lineWidth = 3; c.strokeStyle = '#B9A27A'; c.stroke();
    c.beginPath(); c.arc(kb[0], kb[1], 12, 0, 6.283); c.fillStyle = '#E8DFC9'; c.fill(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke();
    if (this.crankable() && !this.sim.s.spin) { c.beginPath(); c.arc(kb[0], kb[1], 18 + 3 * Det.sin(v.t * 5), 0, 6.283); c.lineWidth = 1.5; c.strokeStyle = 'rgba(27,22,18,.5)'; c.stroke(); }
    c.restore();
  },
  chute(d) { return [d.cx, d.cy + d.r + 14]; },
  // L1 square: cells sized by p; a cached layer of zygote dots
  cellRect(e, sp) { const q = this.sqGeo(), p = this.sim.s.p, S = q.S; return { x: q.x + (e ? p * S : 0), y: q.y + (sp ? p * S : 0), w: (e ? 1 - p : p) * S, h: (sp ? 1 - p : p) * S }; },
  dotAt(i, code) { const r = this.cellRect(code >> 1, code & 1), pad = 4; return [r.x + pad + EQV.hash(i, 21) * Math.max(1, r.w - 2 * pad), r.y + pad + EQV.hash(i, 22) * Math.max(1, r.h - 2 * pad)]; },
  draw1(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels, d = this.drumGeo(), hp = this.hoppers(), q = this.sqGeo(), S = q.S, p = s.p;
    this.bg(c, W, H, 'lab', (cc, w, h) => this.labPlate(cc, w, h));
    this.hopper(c, hp.a, p, L.eggs, 1); this.hopper(c, hp.b, p, L.sperm, 2); this.parents(c); this.drum(c, d, 'mix');
    const col = v.col, tint = (g, a) => g === 0 ? EQV.rgba(EQV.pal('A', '#6B97FF'), a) : g === 2 ? EQV.rgba(EQV.pal('a', '#F2C94C'), a) : null;
    const B = this.barGeo1(), sh = this.shares1(), bars = this.barRects(B, sh);
    for (const code of [0, 1, 2, 3]) {
      const r = this.cellRect(code >> 1, code & 1), g = code === 0 ? 0 : code === 3 ? 2 : 1, tgt = g === 0 ? bars[0] : g === 2 ? bars[2] : (code === 1 ? { x: bars[1].x, y: bars[1].y + bars[1].h / 2, w: bars[1].w, h: bars[1].h / 2 } : { x: bars[1].x, y: bars[1].y, w: bars[1].w, h: bars[1].h / 2 });
      const k = EQV.easeIO(col), x = EQV.lerp(r.x, tgt.x, k), y = EQV.lerp(r.y, tgt.y, k), w = EQV.lerp(r.w, tgt.w, k), h = EQV.lerp(r.h, tgt.h, k);
      if (g === 1) { c.fillStyle = EQV.rgba(EQV.pal('A', '#6B97FF'), 0.16 + 0.5 * col); c.fillRect(x, y, w / 2, h); c.fillStyle = EQV.rgba(EQV.pal('a', '#F2C94C'), 0.2 + 0.5 * col); c.fillRect(x + w / 2, y, w / 2, h); }
      else { c.fillStyle = tint(g, 0.18 + 0.5 * col); c.fillRect(x, y, w, h); }
      c.lineWidth = 1.5; c.strokeStyle = EQV.INK; c.strokeRect(x, y, w, h);
    }
    if (col < 0.6) {
      const key = S + '|' + q.x + '|' + q.y + '|' + p;
      if (!v.sq || v.sqKey !== key) { v.sqKey = key; v.landed = Math.min(v.landed, s.pairs.length); v.sq = typeof Layer !== 'undefined' ? Layer(Stage.w, Stage.h) : null; v.sqN = 0; }
      if (v.sq) { while (v.sqN < v.landed) { const i = v.sqN, pt = this.dotAt(i, s.pairs[i]), code = s.pairs[i]; this.zygote(v.sq.c, pt[0], pt[1], S > 220 ? 3.6 : 3, code >> 1, code & 1); v.sqN++; } c.save(); c.globalAlpha = 1 - col / 0.6; v.sq.blit(c, 0, 0); c.restore(); }
      this.lbl('eq-eA', 'egg A', q.x + p * S / 2, q.y - 12, { size: 12, pill: false, ink: EQV.INK }); this.lbl('eq-ea', 'egg a', q.x + p * S + (1 - p) * S / 2, q.y - 12, { size: 12, pill: false, ink: EQV.INK });
      this.lbl('eq-sA', 'sperm A', q.x - 8, q.y + p * S / 2, { size: 12, align: 'right', pill: false, ink: EQV.INK }); this.lbl('eq-sa', 'sperm a', q.x - 8, q.y + p * S + (1 - p) * S / 2, { size: 12, align: 'right', pill: false, ink: EQV.INK });
    }
    this.bars(c, B, sh, s.asks.indexOf('het') >= 0 && !s.ask ? EQ.hw(p) : null, 'b1');
    if (col > 0.85) { const r = bars[1]; c.save(); c.lineWidth = 2; c.strokeStyle = EQV.INK; c.beginPath(); c.moveTo(r.x - 4, r.y + r.h / 2); c.lineTo(r.x + r.w + 4, r.y + r.h / 2); c.stroke(); c.restore(); this.lbl('eq-x2', this.content.labels.twice, r.x + r.w + 22, r.y + r.h / 2, { size: 15, weight: 700 }); }   // the two Aa tiles stacked: the 2 in 2pq
  },
  shares1() { const s = this.sim.s, n = this.v.landed || 0; if (!n) return [0, 0, 0]; const c = [0, 0, 0]; for (let i = 0; i < n && i < s.pairs.length; i++) { const k = s.pairs[i]; c[k === 0 ? 0 : k === 3 ? 2 : 1]++; } return [c[0] / n, c[1] / n, c[2] / n]; },
  barRects(B, sh) { const bw = Math.min(46, B.w / 5), out = []; for (let g = 0; g < 3; g++) { const x = B.x + B.w * (g + 0.5) / 3 - bw / 2, h = Math.max(1, sh[g] * (B.h - 16) / 0.6); out.push({ x, y: B.y + B.h - 16 - Math.min(B.h - 16, h), w: bw, h: Math.min(B.h - 16, h) }); } return out; },
  bars(c, B, sh, exp, id) {   // three genotype bars in the scene (rung 1): realised solid, expected dashed
    const R0 = this.barRects(B, sh), ink = EQV.INK, base = B.y + B.h - 16, names = ['AA', 'Aa', 'aa'];
    c.save(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.4)'; c.beginPath(); c.moveTo(B.x, base + 0.5); c.lineTo(B.x + B.w, base + 0.5); c.stroke();
    R0.forEach((r, g) => {
      if (r.h > 0.5) { if (g === 1) { c.fillStyle = EQV.pal('A', '#6B97FF'); c.fillRect(r.x, r.y, r.w / 2, r.h); c.fillStyle = EQV.pal('a', '#F2C94C'); c.fillRect(r.x + r.w / 2, r.y, r.w / 2, r.h); } else { c.fillStyle = g ? EQV.pal('a', '#F2C94C') : EQV.pal('A', '#6B97FF'); c.fillRect(r.x, r.y, r.w, r.h); } c.lineWidth = 1.5; c.strokeStyle = ink; c.strokeRect(r.x, r.y, r.w, r.h); }
      if (exp) { const ey = base - Math.min(B.h - 16, exp[g] * (B.h - 16) / 0.6); c.setLineDash([5, 3]); c.lineWidth = 2; c.strokeStyle = ink; c.beginPath(); c.moveTo(r.x - 8, ey); c.lineTo(r.x + r.w + 8, ey); c.stroke(); c.setLineDash([]); }
      this.lbl('eq-' + id + g, names[g], r.x + r.w / 2, base + 9, { size: 12, pill: false, ink });
      if (sh[g] > 0) this.lbl('eq-' + id + 'v' + g, Math.round(sh[g] * 100) + '%', r.x + r.w / 2, r.y - 10, { size: 12, mono: true });
    });
    c.restore();
  },
  juiceLab(e, F, snd) {
    const s = this.sim.s, v = this.v, d = this.drumGeo(), hp = this.hoppers(), ch = this.chute(d);
    if (e.k === 'pair' || e.k === 'young') {
      const busy = v.fly.length > 18, quick = s.spin && s.phase === 'spin';
      if (!quick && !busy) { this.fly({ a: e.e, kind: 'egg', x0: hp.a.x + hp.a.w / 2, y0: hp.a.y + hp.a.h, x1: d.cx - 4, y1: d.cy, d: 0.22, lift: 14, r: 8 }); this.fly({ a: e.sp, kind: 'sperm', x0: hp.b.x + hp.b.w / 2, y0: hp.b.y + hp.b.h, x1: d.cx + 4, y1: d.cy, d: 0.22, lift: 14, r: 8 }); }   // one egg and one sperm meet in the tumbler
      const i = e.n - 1, pt = this.dotAt(i, e.e * 2 + e.sp);
      if (busy && quick) { v.landed = Math.max(v.landed, e.n); return; }
      this.fly({ geno: [e.e, e.sp], zyg: 1, x0: ch[0], y0: ch[1], x1: pt[0], y1: pt[1], d: quick ? 0.22 : 0.3, delay: quick ? 0 : 0.22, lift: 10, r: quick ? 5 : 8, land: () => { v.landed = Math.max(v.landed, i + 1); if (!quick && F) { Fx.ring(pt[0], pt[1], 8); if (typeof Snd !== 'undefined' && Snd.click) Snd.click(); } } });
      if (!quick && F) Fx.burst('egg', ch[0], ch[1], 3);
      if (e.n === 1) this.whisper('square');
      return;
    }
    if (e.k === 'collapse') { if (F) { Fx.tier(2, () => {}); } snd('sieve'); return; }
  },

  /* ---------- L4: the valve, the families, the nursery ---------- */
  draw4(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels, d = this.drumGeo(), A = this.area();
    this.bg(c, W, H, 'lab', (cc, w, h) => this.labPlate(cc, w, h));
    this.drum(c, d, s.mode);
    for (const m of ['mix', 'fam']) {   // the valve: two labelled positions; the lever points at the current one
      const p = this.valvePos(m), on = s.mode === m, want = s.phase === 'valve' && s.want === m && !on;
      this.lbl('eq-v' + m, L[m], p[0], p[1], { size: 13, weight: on ? 700 : 500, bg: on ? '#E8DFC9' : 'rgba(244,238,221,.55)', ink: EQV.INK });
      if (on) { c.save(); c.lineWidth = 2.5; c.strokeStyle = EQV.INK; c.beginPath(); c.moveTo(p[0] - 30, p[1] + 13); c.lineTo(p[0] + 30, p[1] + 13); c.stroke(); c.restore(); }
      if (want) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = EQV.INK; c.strokeRect(p[0] - 44, p[1] - 15, 88, 30); c.restore(); }
    }
    const st = s.hist[s.hist.length - 1], jw = Math.min(70, A.w * 0.16), jh = Math.min(96, d.r * 2), jx = A.x + A.w - 2 * jw - 22, jy = d.cy - jh / 2;   // the jars: copies of the colour gene stay level
    for (const [k, share] of [[0, st.p], [1, 1 - st.p]]) {
      const x = jx + k * (jw + 12); c.save(); c.fillStyle = 'rgba(255,255,255,.4)'; rrect(c, x, jy, jw, jh, 8); c.fill();
      const fh = (jh - 6) * share; c.fillStyle = k ? EQV.pal('a', '#F2C94C') : EQV.pal('A', '#6B97FF'); c.fillRect(x + 3, jy + jh - 3 - fh, jw - 6, fh);
      c.lineWidth = 2; c.strokeStyle = EQV.INK; rrect(c, x, jy, jw, jh, 8); c.stroke(); c.restore();
      this.lbl('eq-j4' + k, (k ? 'a ' : 'A ') + Math.round(share * 100) + '%', x + jw / 2, jy + jh + 12, { size: 12, mono: true });
    }
    const G = this.famGeo(), sz = Math.round(EQV.clamp(Math.min(G.cw / 2.3, G.ch / 2.4), 13, 26)), cp = v.couple;
    for (let i = 0; i < s.fams.length; i++) {
      const R0 = this.famSlot(i), fam = s.fams[i], hot = cp && v.t - cp.t < 0.5 && (cp.fi === i || cp.mi === i);
      c.save(); c.fillStyle = hot ? 'rgba(110,90,69,.32)' : 'rgba(110,90,69,.16)'; rrect(c, R0.x, R0.y, R0.w, R0.h, 8); c.fill(); c.restore();
      fam.forEach((g, k) => {
        const x = R0.x + R0.w * (k % 2 ? 0.72 : 0.28), y = R0.y + R0.h * (k < 2 ? 0.3 : 0.72) + 1.2 * Det.sin(v.t * (1.4 + 0.3 * (k % 3)) + i * 1.7 + k), a = [g[0] > 0.5 ? 0 : 1, g[2] > 0.5 ? 0 : 1];
        this.mini(c, x, y, sz * 1.15, a, true, 0, true);
        const m1 = g[1] > 0.5, m2 = g[3] > 0.5, r = Math.max(3.4, sz * 0.17), hy = y - sz * 0.62;   // the second gene: a pale or dark spot each side of the head
        c.save(); c.beginPath(); c.arc(x - r * 0.9, hy, r, 0, 6.283); c.fillStyle = m1 ? '#F4EEDD' : '#1B1612'; c.fill(); c.lineWidth = 1; c.strokeStyle = EQV.INK; c.stroke();
        c.beginPath(); c.arc(x + r * 0.9, hy, r, 0, 6.283); c.fillStyle = m2 ? '#F4EEDD' : '#1B1612'; c.fill(); c.stroke(); c.restore();
      });
      if (cp && v.t - cp.t < 0.5 && cp.fi === i) { const R1 = this.famSlot(cp.mi), x0 = R0.x + R0.w * 0.28, y0 = R0.y + R0.h * 0.3, x1 = R1.x + R1.w * 0.28, y1 = R1.y + R1.h * 0.72; c.save(); c.lineWidth = 2.5; c.strokeStyle = EQV.INK; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 30, x1, y1); c.stroke(); c.restore(); }
    }
    c.save(); c.fillStyle = 'rgba(244,238,221,.7)'; rrect(c, A.x + 4, G.ny, A.w - 8, G.nh - 4, 8); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.35)'; c.stroke(); c.restore();
    const nn = v.nursery.length, cw = (A.w - 16) / 24, hk = v.hatchT >= 0 ? EQV.clamp((v.t - v.hatchT) / 0.6, 0, 1) : 0;
    v.nursery.forEach((kids, i) => kids.forEach((q, k) => {
      const nx = A.x + 8 + cw * (i + 0.5) + (k % 2 ? 3 : -3), ny = G.ny + 12 + Math.floor(k / 2) * 10, R1 = this.famSlot(i), tx = R1.x + R1.w * (k % 2 ? 0.72 : 0.28), ty = R1.y + R1.h * (k < 2 ? 0.3 : 0.72);
      const x = EQV.lerp(nx, tx, EQV.easeIO(hk)), y = EQV.lerp(ny, ty, EQV.easeIO(hk)); this.zygote(c, x, y, Math.max(3, Math.min(cw * 0.18, 5)), q[0] === 2 ? 1 : 0, q[0] === 0 ? 0 : 1);   // the couple's fertilised eggs
    }));
    if (hk >= 1) { v.nursery = []; v.hatchT = -1; }
    if (!nn) this.lbl('eq-nur', 'eggs', A.x + A.w / 2, G.ny + G.nh / 2 - 2, { size: 12, pill: false, ink: 'rgba(27,22,18,.55)' });
  },
  juice4(e, F, snd) {
    const v = this.v, s = this.sim.s;
    if (e.k === 'couple') { v.couple = { fi: e.fi, mi: e.mi, t: v.t }; if (v.hatchT >= 0) { v.nursery = []; v.hatchT = -1; } v.nursery[e.i] = e.kids; const R0 = this.famSlot(e.fi); if (F && (!s.spin || e.i % 4 === 0)) { Fx.burst('egg', R0.x + R0.w / 2, R0.y + R0.h / 2, 3); } if (!s.spin && typeof Snd !== 'undefined' && Snd.click) Snd.click(); return; }
    if (e.k === 'gen') { v.hatchT = v.t; if (F) Fx.tier(2, () => {}); snd('count'); return; }
    if (e.k === 'valve') { const p = this.valvePos(e.m); if (F) { Fx.ring(p[0], p[1], 26); Fx.burst('dust', p[0], p[1], 4); } snd('tock', p[0], p[1]); this.whisper('valve', { m: this.content.labels[e.m] }); }
  },

  /* ---------- the census field ---------- */
  fieldBg(c, W, H) { const s = this.sim.s; this.bg(c, W, H, 'sand3' + s.beach, (cc, w, h) => this.sand(cc, w, h, 31 + s.beach * 7, s.beach ? { top: '#CBB68A', bot: '#B59E70' } : null)); },
  drawField(c, W, H) {
    const s = this.sim.s, v = this.v, n = this.k, F = this.fieldRect(), f = s.f, sz = this.szF(), L = this.content.labels;
    this.fieldBg(c, W, H);
    const reveal = s.phase === 'census' && v.revealT >= 0, cx = F.x + F.w / 2, cy = F.y + F.h / 2, maxd = EQV.dist(F.w / 2, F.h / 2), N = f.x.length;
    const one = (cc, i, wob, still) => {   // one crowd beetle; still = drawn into the cached layer (no wobble, no pop)
      let x = F.x + f.x[i] * F.w, y = F.y + f.y[i] * F.h;
      if (wob) { x += 1.5 * Det.sin(v.t * (0.8 + EQV.hash(i, 7)) + i); y += 1.2 * Det.cos(v.t * (0.7 + EQV.hash(i, 8)) + i * 1.3); }
      const g = f.g[i], a = g === 0 ? [0, 0] : g === 2 ? [1, 1] : (EQV.hash(i, 9) < 0.5 ? [0, 1] : [1, 0]);
      // a beetle shows its genes once sampled; unsampled ones are shapes in the marram. The census ripple opens every one.
      let open = !!f.sm[i], sil = !f.sm[i]; if (reveal && EQV.dist(x - cx, y - cy) / maxd < (v.t - v.revealT) / 1.4) { open = true; sil = false; }
      const pop = !still && v.popT[i] != null ? EQV.clamp((v.t - v.popT[i]) / 0.25, 0, 1) : 1, sc = 1 + 0.5 * (1 - pop);
      this.mini(cc, x, y, sz * sc, a, open, (EQV.hash(i, 10) - 0.5) * 2.4, false, sil);
    };
    // A field holds 500 beetles. About one in seven shuffles on the spot every frame; the rest sit still in a cached layer,
    // rebuilt only when what they show changes (a sample, the census). Reveal waves run fully live.
    const act = i => EQV.hash(i, 12) < 0.14, live = (reveal && v.t - v.revealT < 1.6) || typeof Layer !== 'function';
    if (live) { for (let i = 0; i < N; i++) one(c, i, act(i), false); }
    else {
      let h = 7, hs = 7; for (let i = 0; i < N; i++) { h = (h * 31 + f.g[i] * 3) | 0; hs = (hs * 31 + (f.sm[i] ? 1 : 0)) | 0; }
      const key = [Math.round(W), Math.round(H), F.x, F.y, F.w, F.h, sz, N, h, f.x[0], f.y[N - 1], s.phase, reveal ? 1 : 0, EQV.pal('A', '#6B97FF'), EQV.pal('a', '#F2C94C'), s.beach].join(',');
      let build = v.crowdKey !== key || !v.crowd || !v.crowdSm || v.crowdSm.length !== N;
      if (!build && hs !== v.crowdHs) { let d = 0; for (let i = 0; i < N; i++) if ((f.sm[i] ? 1 : 0) !== v.crowdSm[i]) d++; build = d > 60 || v.t - v.crowdT > 1.2; }   // newly sampled beetles draw live until the next rebuild
      if (build) { v.crowdKey = key; v.crowdHs = hs; v.crowdT = v.t; v.crowdSm = Uint8Array.from(f.sm, x => (x ? 1 : 0)); v.crowd = v.crowd ? v.crowd.resize(W, H) : Layer(W, H); v.crowd.redraw(cc => { for (let i = 0; i < N; i++) if (!act(i)) one(cc, i, false, true); }); }
      v.crowd.blit(c, 0, 0);
      const cs0 = v.crowdSm;
      for (let i = 0; i < N; i++) if (act(i) || (f.sm[i] ? 1 : 0) !== cs0[i] || (v.popT[i] != null && v.t - v.popT[i] < 0.26)) one(c, i, act(i), false);   // popping or changed beetles redraw over their still copy
    }
    const Q = this.quadRect(); if (Q && s.phase === 'sample') this.drawQuad(c, Q);
    this.drawGauge(c);
  },
  drawQuad(c, Q) {
    const v = this.v, ink = EQV.INK; c.save();
    c.lineWidth = 5; c.strokeStyle = ink; c.strokeRect(Q.x, Q.y, Q.w, Q.h); c.lineWidth = 2.5; c.strokeStyle = '#E8DFC9'; c.strokeRect(Q.x, Q.y, Q.w, Q.h);
    for (const [x, y] of [[Q.x, Q.y], [Q.x + Q.w, Q.y], [Q.x, Q.y + Q.h], [Q.x + Q.w, Q.y + Q.h]]) { c.beginPath(); c.arc(x, y, 5, 0, 6.283); c.fillStyle = '#8C6E4A'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = ink; c.stroke(); }
    if (!Q.parked) { const k = (v.t * 1.6) % 1, y = Q.y + 4 + k * (Q.h - 8); c.strokeStyle = 'rgba(244,238,221,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(Q.x + 4, y); c.lineTo(Q.x + Q.w - 4, y); c.stroke(); }
    c.restore();
    if (Q.parked) this.lbl('eq-drag', this.content.labels.drag, Q.x + Q.w / 2, Q.y - 14, { size: 13 });
  },
  sampleCounts() { return this.sim.s.obs; },
  drawGauge(c) {   // in the scene (rung 1): your sample's AA, Aa, aa against the dashed expectation, and the χ² needle with the 3.84 line
    const s = this.sim.s, A = this.area(), ob = this.sampleCounts(), n = EQ.n(ob), w = Math.min(160, A.w * 0.42), x = A.x + A.w - w - 6, y = A.y + 4, h = 36, ink = EQV.INK;
    c.save(); c.fillStyle = 'rgba(244,238,221,.82)'; rrect(c, x - 6, y - 2, w + 12, h + 8, 8); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.35)'; c.stroke();
    const f = EQ.frac(ob), e = EQ.hw(EQ.p(ob)), bw = 12;
    for (let g = 0; g < 3; g++) {
      const bx = x + 4 + g * (bw + 6), bh = 26 * f[g] / 0.7, by = y + 30 - bh;
      if (n) { if (g === 1) { c.fillStyle = EQV.pal('A', '#6B97FF'); c.fillRect(bx, by, bw / 2, bh); c.fillStyle = EQV.pal('a', '#F2C94C'); c.fillRect(bx + bw / 2, by, bw / 2, bh); } else { c.fillStyle = g ? EQV.pal('a', '#F2C94C') : EQV.pal('A', '#6B97FF'); c.fillRect(bx, by, bw, bh); } c.lineWidth = 1; c.strokeStyle = ink; c.strokeRect(bx, by, bw, bh); const ey = y + 30 - 26 * e[g] / 0.7; c.setLineDash([3, 2]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx - 3, ey); c.lineTo(bx + bw + 3, ey); c.stroke(); c.setLineDash([]); }
    }
    const gx = x + 64, gw = w - 70, x2 = n ? EQ.chi(ob) : 0, vmax = 15, X = v => gx + Math.min(1, v / vmax) * gw;
    c.fillStyle = 'rgba(27,22,18,.12)'; c.fillRect(gx, y + 18, gw, 10); if (typeof wgHatch === 'function') wgHatch(c, X(3.84), y + 18, gx + gw - X(3.84), 10, 'rgba(27,22,18,.45)', 4);
    c.fillStyle = ink; c.fillRect(gx, y + 18, Math.max(1, X(x2) - gx), 10); c.lineWidth = 2; c.beginPath(); c.moveTo(X(3.84), y + 14); c.lineTo(X(3.84), y + 32); c.stroke();
    c.restore();
    this.lbl('eq-chi', 'χ² ' + x2.toFixed(1), gx + gw / 2, y + 8, { size: 12, pill: false, ink, mono: true });
  },

  juiceField(e, F, snd) {
    const s = this.sim.s, v = this.v, f = s.f, Fr = this.fieldRect(), sz = this.szF();
    if (e.k === 'samp') {
      v.popT[e.i] = v.t; const x = Fr.x + f.x[e.i] * Fr.w, y = Fr.y + f.y[e.i] * Fr.h;
      if (F && (e.n % 3 === 0 || !s.spin)) Fx.burst('dust', x, y, 2);
      if (v.fly.length < 14) { const A = this.area(), w = Math.min(160, A.w * 0.42), gx = A.x + A.w - w - 6 + 4 + e.g * 18 + 6, gy = A.y + 20; const a = e.g === 0 ? 0 : e.g === 2 ? 1 : null; if (a == null) this.fly({ geno: [0, 1], x0: x, y0: y, x1: gx, y1: gy, d: 0.4, r: 5, lift: 24 }); else this.fly({ a, x0: x, y0: y, x1: gx, y1: gy, d: 0.4, r: 5, lift: 24 }); }
      if (e.n % 4 === 0 && typeof Snd !== 'undefined' && Snd.click) Snd.click();
      if (this.k === 3 && e.n === 40 && EQ.chi(s.obs) < 3.84) this.whisper('small');
      return;
    }
    if (e.k === 'census') { if (F) { Fx.tier(2, () => {}); Fx.flash({ edge: true }); } snd('count'); if (typeof Live !== 'undefined') Live.say(this.hudText()); return; }
    if (e.k === 'beach') { v.revealT = -1; return; }
  },

  /* ---------- L6: the farmyard at night ---------- */
  yardBg(c, W, H) {
    const g = this.yardGeo(), K = EQK.L6, rnd = EQV.rng(5), k = g.k, X = x => g.ox + x * k, Y = y => g.oy + y * k;
    c.fillStyle = '#7A6852'; c.fillRect(0, 0, W, H);   // a dusty yard, light enough for dark rats to read
    for (let i = 0; i < W * H / 120; i++) { const x = rnd() * W, y = rnd() * H; c.strokeStyle = rnd() < 0.5 ? 'rgba(201,178,131,.22)' : 'rgba(20,16,12,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 7, y + (rnd() - 0.5) * 3); c.stroke(); }
    for (const by of K.burrows) for (let j = 0; j < 4; j++) { c.strokeStyle = 'rgba(201,178,131,.08)'; c.lineWidth = 10 * k; c.beginPath(); c.moveTo(X(14), Y(by)); c.quadraticCurveTo(X(180), Y(by + (j - 1.5) * 40), X(K.gx), Y(90 + j * 50)); c.stroke(); }
    c.fillStyle = '#5C5048'; c.fillRect(X(0), 0, 22 * k, H); for (let y = Y(0) - Math.ceil(Y(0) / (18 * k)) * 18 * k; y < H; y += 18 * k) { c.strokeStyle = 'rgba(20,16,12,.4)'; c.lineWidth = 1; c.strokeRect(X(0), y, 22 * k, 18 * k); }
    for (const by of K.burrows) { c.fillStyle = '#120E0B'; c.beginPath(); c.ellipse(X(16), Y(by), 9 * k, 12 * k, 0, 0, 6.283); c.fill(); }
    for (let j = 0; j < 7; j++) { const sx = X(K.gx - 6 + (j % 2) * 10), sy = Y(70 + j * 30); c.fillStyle = '#B9A27A'; c.beginPath(); c.ellipse(sx, sy, 16 * k, 13 * k, 0, 0, 6.283); c.fill(); c.lineWidth = 1.5; c.strokeStyle = EQV.INK; c.stroke(); c.strokeStyle = 'rgba(27,22,18,.4)'; c.beginPath(); c.moveTo(sx - 8 * k, sy - 9 * k); c.lineTo(sx + 8 * k, sy - 9 * k); c.stroke(); }
    const rg = c.createRadialGradient(X(K.W * 0.55), Y(K.H * 0.3), 20, X(K.W * 0.55), Y(K.H * 0.45), Math.max(W, H) * 0.75); rg.addColorStop(0, 'rgba(232,223,201,.1)'); rg.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = rg; c.fillRect(0, 0, W, H);
  },
  draw6(c, W, H) {
    const s = this.sim.s, v = this.v, g = this.yardGeo(), K = EQK.L6, ink = EQV.INK, L = this.content.labels, k = g.k;
    this.bg(c, W, H, 'yard', (cc, w, h) => this.yardBg(cc, w, h));
    s.trays.forEach((t, i) => {
      const p = this.yardPt(t.x, t.y), r = K.r * k;
      c.save(); c.beginPath(); c.arc(p[0], p[1], r, 0, 6.283); c.fillStyle = 'rgba(232,223,201,.08)'; c.fill(); c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(232,223,201,.45)'; c.stroke(); c.setLineDash([]);
      c.beginPath(); c.ellipse(p[0], p[1], r * 0.55, r * 0.4, 0, 0, 6.283); c.fillStyle = '#9C9890'; c.fill(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke();
      c.fillStyle = '#5E5A54'; for (let j = 0; j < 7; j++) { c.beginPath(); c.arc(p[0] + (EQV.hash(j, i) - 0.5) * r * 0.7, p[1] + (EQV.hash(j, i + 9) - 0.5) * r * 0.45, Math.max(1.5, r * 0.07), 0, 6.283); c.fill(); }
      c.restore();
    });
    const night = s.phase === 'night', sz = Math.round(EQV.clamp(40 * k, 30, 56)), genes = v.lens === 'genes';
    s.rats.forEach((r, i) => {
      let x, y, rot = 0, sick = r.st === 'sick', show = true;
      if (night && r.st !== 'wait') { if (r.st === 'grain' || r.st === 'home') show = false; x = r.x; y = r.y; const nx = this.ratAhead(r); rot = EQV.atan2(nx[1] - r.y, nx[0] - r.x) + (sick ? 3.14159 : 0); }
      else if (night) { const row = Math.floor(i / 4); if (row >= 6) show = false; x = 32 + (row % 3) * 12; y = K.burrows[r.b] - 8 + Math.floor(row / 3) * 12; }   // a few wait at the burrow mouth; the rest are inside
      else { const b = i % 4, row = Math.floor(i / 4); x = 32 + (row % 3) * 12; y = K.burrows[b] - 8 + Math.floor(row / 3) * 12; if (r.dead || row >= 6) show = false; }
      if (!show) return;
      const p = this.yardPt(x, y), eat = r.st === 'eat';
      const big = night && r.st !== 'wait'; this.rat(c, p[0], p[1] + (eat ? Det.sin(v.t * 30) : 0), big ? sz : sz * 0.62, rot, sick, i, v.t);
      if (genes && (big || i % 2 === 0)) Pal.genotype(c, p[0], p[1] - (big ? sz * 0.55 : sz * 0.4), Math.max(5, big ? sz * 0.2 : sz * 0.14), r.c >= 1 && EQV.hash(i, 3) < 0.5 ? 1 : (r.c === 2 ? 1 : 0), r.c === 0 ? 0 : (r.c === 2 ? 1 : (EQV.hash(i, 3) < 0.5 ? 0 : 1)), { letter: '' });
    });
    const per = {};   // at most three dashed rings at each burrow, then a ×n badge, so a big dawn does not blur into a blob
    for (const gq of v.gone) { const a = 1 - (v.t - gq.t) / 2; if (a <= 0 || v.t < gq.t) continue; const kb = gq.y; per[kb] = (per[kb] || 0) + 1; if (per[kb] > 3) continue; const p = this.yardPt(gq.x + (per[kb] - 1) * 9, gq.y); c.save(); c.globalAlpha = a; c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = '#F4EEDD'; c.beginPath(); c.arc(p[0], p[1], sz * 0.36, 0, 6.283); c.stroke(); c.restore(); }
    for (const kb in per) if (per[kb] > 3) { const p = this.yardPt(64, +kb); this.lbl('eq-gn' + kb, '×' + per[kb], p[0] + 6, p[1], { size: 12, mono: true }); }
    v.gone = v.gone.filter(gq => v.t - gq.t < 2);
    const q = s.q[s.q.length - 1] || 0, A = this.area(), bw = Math.min(150, A.w * 0.36), bx = A.x + A.w - bw - 8, by = A.y + 8;   // the copies bar of this season's newborns (rung 1)
    c.save(); c.fillStyle = EQV.pal('A', '#6B97FF'); c.fillRect(bx, by, bw * (1 - q), 14); c.fillStyle = EQV.pal('a', '#F2C94C'); c.fillRect(bx + bw * (1 - q), by, bw * q, 14); c.lineWidth = 1.5; c.strokeStyle = '#E8DFC9'; c.strokeRect(bx, by, bw, 14); c.restore();
    this.lbl('eq-q6', 'q ' + q.toFixed(2), bx + bw * (1 - q / 2), by + 28, { size: 12, mono: true });
    this.lbl('eq-se', Txt.f(L.season, { g: Math.min(s.season, K.seasons + K.after + 1) }), A.x + 8, A.y + 14, { align: 'left', size: 12 });
    this.lbl('eq-xn', L.xN, A.x + 90, A.y + 14, { size: 12, mono: true, bg: '#E8DFC9' });   // ×N: one season is one rat generation (the MODEL card says so)
    if (!s.auto) this.lbl('eq-tr', Txt.f(L.baitCost, { n: s.trays.length * K.cost }), A.x + 8, A.y + 34, { align: 'left', size: 12, mono: true });
    if (s.grainT || s.grain || s.baitT) this.lbl('eq-gr', Txt.f(L.lost, { n: s.grainT + s.baitT + (night && !s.auto ? s.grain : 0) }), this.yardPt(K.gx, 40)[0] - 10, this.yardPt(K.gx, 40)[1], { align: 'right', size: 12 });
    if (v.trayGhost && v.trayDrag >= 0) { const p = this.yardPt(v.trayGhost[0], v.trayGhost[1]); c.save(); c.beginPath(); c.arc(p[0], p[1], K.r * k, 0, 6.283); c.setLineDash([3, 3]); c.lineWidth = 2; c.strokeStyle = '#E8DFC9'; c.stroke(); c.restore(); }
  },
  ratAhead(r) { const u = r.st === 'sick' ? Math.max(0, r.u - 0.02) : Math.min(1, r.u + 0.02); return EQ_LV[6].at(r, u); },
  rat(c, x, y, size, rot, sick, i, t) {
    if (typeof Rig !== 'undefined' && Rig.has && Rig.has('eqrat')) { Rig.draw(c, 'eqrat', { sick: sick ? 1 : 0, leg: Math.floor(t * 10 + i) % 2 }, x, y, { size, rot, id: i }); return; }
    c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = sick ? '#9A8E84' : '#6E6056'; c.beginPath(); c.ellipse(0, 0, size * 0.42, size * 0.2, 0, 0, 6.283); c.fill(); c.restore();
  },
  juice6(e, F, snd) {
    const s = this.sim.s, v = this.v;
    if (e.k === 'tray') { const t = s.trays[e.i], p = this.yardPt(t.x, t.y); if (F) { Fx.ring(p[0], p[1], 22); Fx.burst('dust', p[0], p[1], 5); } snd('tock', p[0], p[1]); return; }
    if (e.k === 'full') { this.whisper('trays'); return; }
    if (e.k === 'untray') { const p = this.yardPt(e.x, e.y); if (F) { Fx.ring(p[0], p[1], 18, { dashed: true, ms: 500 }); } snd('tock', p[0], p[1]); return; }
    if (e.k === 'eat') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F) Fx.burst('dust', p[0], p[1], 3); if (typeof Snd !== 'undefined' && Snd.peck) Snd.peck(); return; }
    if (e.k === 'shrug') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F) { Fx.pop(e.c === 2 ? 'aa' : 'Aa', p[0], p[1] - 22, 0); } if (!v.saidShrug) { v.saidShrug = 1; this.whisper('shrug'); } return; }
    if (e.k === 'sick') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F) Fx.ring(p[0], p[1], 16, { dashed: true, ms: 900 }); return; }
    if (e.k === 'grain') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F && !s.auto) { Fx.pop('−1', p[0] - 14, p[1], -1); } if (!s.auto && !v.saidGrain) { v.saidGrain = 1; this.whisper('grain'); } return; }
    if (e.k === 'dawn') {
      if (F) Fx.tier(2, () => {}); snd('dusk');
      s.rats.forEach((r, i) => { if (!r.dead) return; const b = r.b, x = 30 + (i % 4) * 8, y = EQK.L6.burrows[b]; v.gone.push({ x: r.dead === 1 && r.st === 'home' ? 20 : x, y, t: v.t + (r.dead === 2 ? 0.4 : 0) }); });
      if (s.rats.some(r => r.dead === 2) && !v.saidK) { v.saidK = 1; this.whisper('vitK'); }
      return;
    }
    if (e.k === 'qhat') { if (F) Fx.tier(2, () => {}); snd('count'); if (typeof Live !== 'undefined') Live.say(this.hudText()); return; }
    if (e.k === 'bred') { if (F) Fx.tier(1, () => {}); if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.captions.live6, { g: e.g, q: e.q.toFixed(2), n: s.grainT + s.baitT })); return; }   // the adult-triangle mark leaves once its season is over
  },

  /* ================= the live strip: notes() feeds LiveGraph (D5 decision 10); realised solid, expected dashed ================= */
  notes() {
    const s = this.sim.s, v = this.v || {}, n = this.k, L = this.content.labels; if (!s) return { stats: [], charts: [] };
    const bars3 = (c, exp, kinds) => { const f = EQ.frac(c), N = EQ.n(c); return (kinds || ['AA', 'Aa', 'aa']).map((k, i) => ({ k, v: N ? f[i] : null, exp: exp ? exp[i] : null })); };
    const small = typeof Strip !== 'undefined' && Strip.phone && Strip.phone() && !Strip.isOpen;   // the folded phone strip: point labels would overlap
    const tri = (pts, trail, noCurve) => ({ type: 'tri', title: 'Genotypes', variant: noCurve ? 'simplex' : 'hw', corners: ['AA', 'Aa', 'aa'], pts: small ? pts.map(q => Object.assign({}, q, { label: '' })) : pts, trail: trail || [], frame: 'designed' });
    const stats = [], ch = [];
    if (n === 0) {
      const jn = (v.jarShown || [0, 0]), tot = jn[0] + jn[1];
      if (tot === 0) ch.push({ type: 'eq_axis', title: 'Share of A copies', ends: ['0', '1'], frame: 'designed' });
      else ch.push({ type: 'pq', title: 'Copies in the jars', p: jn[0] / tot, n: tot, frame: 'designed' });
      const gh = s.phase === 'yule' || s.phase === 'lapse' || s.phase === 'done0' || s.phase === 'over' ? [{ d: [[0, 0.75], [EQK.L0.gens, 0.75]], label: L.yule }] : [];   // Yule's 75%, drawn: the dominant look did not climb towards it
      ch.push({ type: 'trace', title: 'Blue beetles', x: { lo: 0, hi: EQK.L0.gens, label: 'generation' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: s.blue.slice(), ink: 'A', label: L.blue }], ghost: gh, frame: 'designed' });
      stats.push(['Copies', 'A ' + s.jar[0] + ', a ' + s.jar[1], 'Each beetle carries two copies.'], ['Blue', EQ.pct(s.blue[s.blue.length - 1]) + '%', 'AA and Aa look blue.']);
    }
    else if (n === 1) {
      const c = [0, 0, 0], nn = Math.min(v.landed || 0, s.pairs.length); for (let i = 0; i < nn; i++) { const k = s.pairs[i]; c[k === 0 ? 0 : k === 3 ? 2 : 1]++; }
      const done = s.exp.het != null, e = EQ.hw(s.p);
      const tall = nn ? Math.max(c[0], c[1], c[2]) / nn : 0;
      ch.push({ type: 'eq_bars', title: 'Genotypes', groups: [{ label: '', bars: bars3(c, done ? e : null) }], y: { lo: 0, hi: Math.min(1, Math.max(0.7, Math.ceil((tall + 0.05) * 10) / 10)), fmt: 'pct' }, frame: 'designed' });
      const tr = []; let a = 0; for (let i = 0; i < nn; i++) { const k = s.pairs[i]; if (k === 1 || k === 2) a++; if (i >= 3 && ((i + 1) % Math.max(1, Math.floor(nn / 60)) === 0 || i === nn - 1)) tr.push([i + 1, a / (i + 1)]); }
      ch.push({ type: 'trace', title: 'Aa share as you crank', x: { lo: 0, hi: s.pairs.length > EQK.L1.small || s.phase === 'col1' || s.phase === 'spin' ? EQK.L1.big : EQK.L1.small, label: 'pairs' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: tr, ink: 'ink', label: 'Aa' }], ghost: done ? [{ d: [[0, e[1]], [EQK.L1.big, e[1]]], label: '2pq' }] : [], frame: 'designed' });
      stats.push(['Pairs', String(s.pairs.length), 'Each pair: one egg and one sperm.'], ['Expected', 'AA ' + EQ.pct(e[0]) + '%, Aa ' + EQ.pct(e[1]) + '%, aa ' + EQ.pct(e[2]) + '%', 'p², 2pq and q².']);
    }
    else if (n === 3) {
      const groups = [{ label: 'sample', bars: bars3(s.obs, EQ.n(s.obs) ? EQ.hw(EQ.p(s.obs)) : null) }];
      if (s.full && (s.phase === 'census' || s.phase === 'move' || s.phase === 'done3' || s.phase === 'over')) groups.push({ label: 'census', bars: bars3(s.full.c, EQ.hw(EQ.p(s.full.c))) });
      ch.push({ type: 'eq_bars', title: 'Observed and expected', groups, y: { lo: 0, hi: 0.7, fmt: 'pct' }, frame: 'designed' });
      { const d = s.chiH.filter((q, i) => i % Math.max(1, Math.floor(s.chiH.length / 80)) === 0 || i === s.chiH.length - 1), mx = d.reduce((m, q) => Math.max(m, q[1]), 0), hi = Math.min(30, Math.max(8, Math.ceil(mx * 1.15))); ch.push({ type: 'trace', title: 'χ² as you sample', x: { lo: 0, hi: EQK.L3.max, label: 'beetles' }, y: { lo: 0, hi, label: '' }, series: [{ d, ink: 'ink', label: 'χ²' }], target: { lo: 3.84, hi }, marks: [40], frame: 'designed' }); }
      stats.push(['Sampled', String(s.n), 'Beetles genotyped on this beach.'], ['Field time', Math.ceil(s.pool) + ' s', 'Left for both beaches.'], ['χ²', EQ.chi(s.obs).toFixed(2), 'Above 3.84: evidence of a departure (5% level).'], ['Shortfall', EQ.pct(EQ.Fhat(s.obs)) + '%', 'Heterozygotes short of 2pq in your sample.']);
    }
    else if (n === 4) {
      const h = s.hist[s.hist.length - 1];
      ch.push({ type: 'pq', title: 'Colour copies', p: h.p, n: 2 * 96, frame: 'designed' });
      ch.push({ type: 'eq_bars', title: 'Two genes', groups: [{ label: L.colour, bars: bars3(h.c, EQ.hw(h.p)) }, { label: L.gene2, bars: bars3(h.m, EQ.hw(h.pm), ['BB', 'Bb', 'bb']) }], y: { lo: 0, hi: 0.8, fmt: 'pct' }, frame: 'designed' });
      stats.push(['Generation', String(s.gen), 'Valve: ' + this.content.labels[s.mode] + '.'], ['F', EQ.Fhat(h.c).toFixed(2), 'Colour heterozygotes short of 2pq.'], ['F, gene two', EQ.Fhat(h.m).toFixed(2), 'The unlinked second gene.']);
    }
    else if (n === 6) {
      const K6 = EQK.L6, gh = []; if (s.qh != null) gh.push({ d: [[1, s.qh], [K6.seasons + 1, s.qh]], label: L.qhat });   // q̂ from your own bait reach, drawn once the baited seasons are over
      ch.push({ type: 'trace', title: 'Resistant share q', x: { lo: 1, hi: EQK.L6.seasons + EQK.L6.after + 1, label: 'season' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: s.q.slice(), ink: 'a', label: 'q' }], ghost: gh, marks: [EQK.L6.seasons + 0.5], frame: 'designed' });
      const R0 = s.rec, nb = EQ.frac(this.sim.H().counts(s.rats)), pts = [];
      if (R0 && s.phase === 'dawn') { pts.push({ f: EQ.frac(R0.nb), kind: 'dawn', label: L.newborn }); if (s.phase === 'dawn') pts.push({ f: EQ.frac(R0.ad), kind: 'dusk', label: L.adult }); }
      else pts.push({ f: nb, kind: 'dawn', label: L.newborn });
      ch.push(tri(pts, s.hist.map(h => EQ.frac(h.ad))));
      stats.push(['Season', String(s.season), 'One rat generation (×N: real spread took years).'], ['q', (s.q[s.q.length - 1] || 0).toFixed(2), 'Share of resistant a copies in newborns.'], ['Grain lost', String(s.grainT + s.baitT), 'Rats at the sacks ' + s.grainT + ', bait ' + s.baitT + '.']);
      if (R0) stats.push(['Bait reach', EQ.pct(R0.s1) + '%', 'Susceptible AA rats that ate bait (s₁).']);
      if (s.qh != null) stats.push(['q̂', s.qh.toFixed(2), 's₁/(s₁ + s₂): where AA and aa deaths balance.']);
    }
    return { stats, charts: ch };
  }
};

/* ---------- the strip's two extra chart types (engine request: a 'bars' type with expected ghosts, and a bare 0–1 axis) ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T) {
  LiveGraph.T.eq_bars = {
    n(spec) { return Math.max(3, (spec.groups || []).length * 3.7 - 0.7); },
    lay(w, h, spec, T, c) { const G = wgXY(w, h, spec, T, c, { xlo: 0, xhi: this.n(spec), ylo: 0, yhi: (spec.y && spec.y.hi) || 1, labels: [] }); return G; },
    fill(T, k) { const I = T.I; return { AA: [I.A, I.A], Aa: [I.A, I.a], aa: [I.a, I.a], BB: [I.paper, I.paper], Bb: [I.paper, I.ink], bb: [I.ink, I.ink], blue: [I.A, I.A], amber: [I.a, I.a] }[k] || null; },
    draw(c, G, spec, T) {
      const p = G.plot, I = T.I, base = p.y + p.h, slot = G.X(1) - G.X(0), bw = Math.min(28 * T.k, slot * 0.64);
      const many = (spec.groups || []).length > 1, tight = many && p.h < 64 * (T.k || 1);   // a short strip with several groups: name the groups under them, drop the per-bar text
      wgAxes(c, G, spec, T, { noX: true, noY: p.h < 3 * G.tk });   // a strip too short for two tick labels drops them (Show data has the numbers)
      (spec.groups || []).forEach((g, gi) => {
        (g.bars || []).forEach((b, bi) => {
          const cx = G.X(gi * 3.7 + bi + 0.5), x = cx - bw / 2, f = this.fill(T, b.k);
          if (b.v != null && f) { const y = G.Y(clamp(b.v, 0, G.ys.hi)), hh = base - y; if (hh > 0.4) { c.fillStyle = f[0]; c.fillRect(x, y, bw / 2, hh); c.fillStyle = f[1]; c.fillRect(x + bw / 2, y, bw / 2, hh); c.lineWidth = 1.5; c.strokeStyle = b.k === 'bb' ? I.paper : I.ink; c.strokeRect(x, y, bw, hh); }
            if (!tight && y - G.tk - 2 > p.y + G.tk) wgText(c, Math.round(b.v * 100) + '%', cx, y - G.tk / 2 - 2, G.tk, I.text, { align: 'center', wt: 700, halo: I.surface }); }
          else if (b.v == null) { const y = G.Y(G.ys.hi * 0.55); c.setLineDash([3, 3]); c.lineWidth = 1.2; c.strokeStyle = I.text2; c.strokeRect(x, y, bw, base - y); c.setLineDash([]); wgText(c, '?', cx, (y + base) / 2, G.tk + 2, I.text2, { align: 'center', fam: 'b', wt: 700 }); }
          if (b.exp != null) { const ey = G.Y(clamp(b.exp, 0, G.ys.hi)); c.setLineDash([5, 3]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.beginPath(); c.moveTo(x - 5, ey); c.lineTo(x + bw + 5, ey); c.stroke(); c.setLineDash([]); }
          const lab = b.label || b.k; if (!(tight && g.label) && wgW(c, lab, G.tk, 'b', 600) + 3 < slot) wgText(c, lab, cx, base + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
        });
      });
      (spec.groups || []).forEach((g, gi) => {   // group names last, haloed, so a tall bar never hides them
        if (g.label && many && wgW(c, g.label, G.tk, 'b', 600) < slot * 3.4) wgText(c, g.label, G.X(gi * 3.7 + 1.5), tight ? base + 3 + G.tk / 2 : p.y + G.tk / 2 + 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600, halo: I.surface });
      });
    },
    rows(spec) { const rows = []; for (const g of spec.groups || []) for (const b of g.bars || []) rows.push([(g.label ? g.label + ' ' : '') + (b.label || b.k), b.v == null ? '?' : Math.round(b.v * 100) + '%', b.exp == null ? '' : Math.round(b.exp * 100) + '%']); return { head: ['genotype', 'observed', 'expected'], rows }; },
    say(spec) { return (spec.groups || []).map(g => (g.label ? g.label + ': ' : '') + (g.bars || []).map(b => (b.label || b.k) + ' ' + (b.v == null ? 'unknown' : Math.round(b.v * 100) + '%')).join(', ')).join('; '); }
  };
  LiveGraph.T.eq_axis = {
    lay(w, h, spec, T, c) { return wgXY(w, h, spec, T, c, { xlo: 0, xhi: 1, ylo: 0, yhi: 1, labels: [] }); },
    draw(c, G, spec, T) {
      const p = G.plot, I = T.I, y = p.y + p.h * 0.55, e = spec.ends || ['0', '1'];
      c.lineWidth = 2; c.strokeStyle = I.text; c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke();
      for (let k = 0; k <= 4; k++) { const x = G.X(k / 4); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y - (k % 2 ? 4 : 7)); c.lineTo(x, y + (k % 2 ? 4 : 7)); c.stroke(); }
      wgText(c, e[0], p.x, y + 10 + G.tk / 2, G.tk, I.text2, { align: 'left', fam: 'b', wt: 600 }); wgText(c, e[1], p.x + p.w, y + 10 + G.tk / 2, G.tk, I.text2, { align: 'right', fam: 'b', wt: 600 });
      wgText(c, '50%', G.X(0.5), y + 10 + G.tk / 2, G.tk, I.text2, { align: 'center' });
    },
    rows() { return { head: ['', ''], rows: [] }; },
    say(spec) { return (spec.ends || []).join(' to '); }
  };
}

/* ---------- the Norway rat (L6 only): a natural-paint rig, ≥ ΔE 8 from the data inks; faces right ---------- */
if (typeof Rig !== 'undefined' && Rig.def) {
  const { E, C, L, P, OL, eye, INK } = Rig._;
  Rig.def('eqrat', {
    tier: 'actor', pose: 0.4,
    row: { scene: 'farm', squint: 'long body, pointed snout, long thin tail', channels: ['genotype badge above (GENES lens)', 'pale and hunched when poisoned'] },
    paints: ['#6E6158', '#9B9089', '#A3928A', '#8A7A70'],
    recipe(ph) {
      const body = ph.sick ? '#9B9089' : '#6E6158', ear = '#8A7A70', tail = '#A3928A', lg = ph.leg ? 3 : -3, ol = Object.assign({}, OL);
      return { w: 64, h: 30, parts: [
        L([-20, 2, -30, 4, -38, -2, -44, -8], INK, 3.4, { cap: 'round' }), L([-20, 2, -30, 4, -38, -2, -44, -8], tail, 2, { cap: 'round' }),
        E(-12 + lg, 9, 4, 2.6, body, ol), E(8 - lg, 9, 4, 2.6, body, ol),
        E(-4, 0, 19, ph.sick ? 8.5 : 10, body, Object.assign({}, ol, { kids: [E(-6, 5, 16, 5, 'rgba(0,0,0,.16)'), E(-8, -5, 9, 3, 'rgba(255,255,255,.14)')] })),
        P([12, -7, 28, 0, 12, 6], body, ol), E(15, -1, 8, 6.5, body, ol),
        C(11, -8, 4, ear, ol), ...eye(18, -3, 1.7), C(28, 0, 1.6, INK),
        L([24, 1, 31, -2], 'rgba(27,22,18,.6)', 0.8), L([24, 2, 31, 4], 'rgba(27,22,18,.6)', 0.8)
      ] };
    }
  });
}

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.census = EQ_C.take;
  BRIDGE.census = 'Mendel predicts one cross. What does a whole population of random crosses look like?';
  MODEL.census = 'One gene, two alleles, discrete generations. Beetles mate at random unless a level changes one thing: relatives mating, or warfarin selection on rats.';
  RECALL.census = { q: 'A beach has 9% amber (aa) beetles and mates at random. About what share carry one hidden a?', opts: [['42', 'About 42%'], ['9', 'About 9%'], ['30', 'About 30%']], ans: '42', why: 'q = √0.09 = 0.3, so carriers are 2pq = 2 × 0.7 × 0.3 = 0.42.' };
  if (typeof TRANSFER !== 'undefined' && TRANSFER.census) delete TRANSFER.census;
}
V2.push(CH_HWE_V2);
