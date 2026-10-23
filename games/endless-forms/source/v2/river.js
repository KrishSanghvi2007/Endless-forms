/* ================= v2/river.js: The River (id 'river'), the Wave 2 rebuild of the legacy chapter (ch6.js stays at ?v1=1) =================
   D3 §4.7 and D2 §4 triage, simplified by D6 decisions 9 and 10 (22 Oct 2026): one verb, three levels, one prediction, real organisms.
   World: a misty tropical river through rainforest. A flood has split a tree frog population across it; over the epochs the north
   bank's frogs turn orange with a dark side stripe and the south bank's teal with pale spots, and their calls drift apart. The
   player (the environment, D1 role) controls a fallen, mossy log that bridges the banks. The verb: TAP the log (or Space) to lay
   it across the river or lift it away.
   L1 the snowball: kept apart, each bank fixes one gene change an epoch; every north–south pair is untested in one body and clashes
      in a hybrid with chance 0.15 (Bateson–Dobzhansky–Muller). Untested pairs grow as k² (Orr 1995; Contested). Lay the log when
      hybrids should fail: hybrid tadpoles hatch on the log and show the clashes. 20% or more survive and the frogs merge. The one
      prediction (the aha): at 3 changes per bank, how many untested pairs at 6?
   L2 the contact zone: two young species whose hybrids mostly die (survival 9%). Matings across the river waste clutches, so females
      carrying a choosy allele leave more young; preference and call gap grow where the species meet, not upstream (reinforcement,
      Dobzhansky 1940; Hoskin et al. 2005 tree frogs).
   L3 boss, too soon: one season does both. Contact while hybrids thrive merges the frogs (inverts L2); contact after they fail
      finishes the split.
   Headless sim: R() and + − × ÷ only (Det.exp in the what-if planner); stars read the expectation; juice from Sim.run's events only.
   Keeps ch6.js's incompatibility test (each new change is tested against every change on the other bank, p = 0.15, 0.55 a clash,
   species below 20%). Prefix: RV_ / rv. */

const RV_P = 0.15, RV_HV = 0.55, RV_ISO = 0.2, RV_LNHV = -0.5978370007556204;   // clash chance per pair, hybrid survival per clash, species line (legacy ch6.js); ln 0.55
// timers in s (epoch/night: one tick of the season; U: untimed mode); cross: frogs on the log; rev: the clash reveal (per cell, capped)
const RV_T = { arrive: 0.9, epoch: 2.0, epochU: 3.4, night: 2.3, nightU: 3.6, cross: 1.4, revCell: 0.16, revMax: 2.6, revHold: 0.7, fuse: 2.4, species: 2.0, dry: 1.8, end: 1.5, idle: 7, auto: 0.35 };
// reinforcement (designed): discrimination a = gap ÷ (gap + half); the gap grows beta·p·(1 − w) a night in contact; apart it drifts gk per change
const RV_R = { half: 5, beta: 2.2, gk: 1.4, p0: 0.1, n2: 200, gDrift: 0.3, mates: 8 };
const RV_LV = [
  { mode: 'split', E: 20, ask: true, levers: ['often', 'line'] },
  { mode: 'zone', E: 12, k0: 5, levers: ['fit', 'apart'] },
  { mode: 'boss', E: 18, levers: ['early', 'late'] }
];
const RV_GOAL = { k1: 7, w2: 12, w3: 13 };   // L1, L3: join once the panel's hybrid survival 0.55^(0.15·k²) < 20% (L1 by 7 changes per bank); L2, L3: wasted clutches at the end (%)
const RV_ASK = { p1: { at: 3, ans: 36, opts: [12, 18, 36] } };
const RV_ZONE = [[0, 2], [1, 4], [3, 1], [4, 3]];   // L2's four known clashes among the 5 × 5 pairs (hybrid survival 0.55⁴ ≈ 9%)
// the world's paints (D6 decision 7): jungle greens, mist grey, river teal-grey, frog orange and teal (allele inks are not used here)
const RV_C = { mist: '#D9E2DC', mist2: '#B8C9BE', far1: '#7E9C88', far2: '#5B7E66', mid: '#3D6249', near: '#27452F', dark: '#16291C',
  leaf: '#3F7D3E', leaf2: '#5E9B4B', leafD: '#2A5A2C', moss: '#86A94E', water: '#5A8A82', water2: '#335F5A', waterHi: '#BFDCD3', mud: '#5C4A33',
  log: '#6E4C30', logD: '#3F2918', logL: '#93704A', orange: '#EE8A3C', orangeD: '#93450F', teal: '#2C9C8F', tealD: '#105A52', anc: '#7FAE4E', ancD: '#3C6A27',
  belly: '#F1EAD2', iris: '#D2A73A', ink: '#15201A', red: '#C23B2C', ok: '#D6ECC2', paper: '#EFF1E7', paperD: '#C9D2C0', night: '#0E1A2E', fly: '#F6F0A0' };

const RV_TEXT = {
  intro: {
    game: 'A flood has split a tree frog population across a misty rainforest river. You control a fallen log that can bridge the banks.',
    biology: 'Kept apart, each bank gathers its own gene changes. Some north–south pairs clash in hybrids, and untested pairs grow with the square of time apart.',
    how: 'Tap the log, or press Space, to lay it across the river or lift it away. Contact too soon merges the frogs; later, it can finish the split.'
  },
  firstWords: 'Apart, each bank gathers gene changes. Tap the log to join them, but too soon and they merge.',
  hud: {
    apart: 'Apart: {n} gene pairs never tested in one body. Tap the log to join.',
    apart1: 'The banks drift apart. Each bank fixes a new gene change each epoch.',
    cross: 'The log is down: frogs cross and hybrid tadpoles hatch.',
    reveal: 'Each red square is a clashing pair. Each clash kills 45% of survivors.',
    fused: 'Hybrids thrived, so the two banks merged. The split starts again.',
    species: 'Hybrids mostly die: two species, even with the log down.',
    wait: 'Two young species, kept apart. Tap the log to let them meet.',
    down: 'They meet. Matings across the river waste clutches: hybrid tadpoles die.',
    up: 'The log is up: no contact, so nothing favours choosy females.',
    bossApart: 'Keep them apart until hybrids should fail, then join them in time.',
    bossDown: 'In contact: choosy females waste fewer clutches. The dry season ends it.',
    p1: '3 changes per bank make 9 untested pairs. How many at 6 each?',
    dry: 'The dry season: the river falls and the banks join for good.',
    auto: 'What if? The best plan plays, with one thing changed.',
    over: 'The level is done.'
  },
  whispers: {
    fused: 'They merged!', species: 'Two species!', clash: 'A clash!', snow: 'Untested pairs snowball!', locked: 'The log stays one epoch.', empty: 'No changes to test yet.', lift: 'Log lifted: no contact.',
    hit: 'Right: four times as many.', miss: 'Not quite: watch the pairs.', six: '36 pairs: four times as many!', waste: 'A hybrid clutch dies.', choosy: 'Choosy females are spreading.',
    calls: 'The calls are pulling apart.', later: 'Called. Watch the pairs at 6.', none: 'No call this time.', ff: 'Faster.', slow: 'Normal speed.'
  },
  labels: {
    log: 'Lay log', lift: 'Lift log', faster: 'Faster', normal: 'Normal', crossing: 'Crossing…', north: 'north bank', south: 'south bank',
    pairsT: 'untested pairs', clashT: 'expected clashes', survT: 'hybrid survival', clashR: 'clashes', gridT: 'hybrid gene pairs',
    pairsV: '{k}×{k} = {n}', pairsN: '{n} pairs', clashV: '0.15×{n} ≈ {c}', survE: '0.55^{c} ≈ {w}%', survV: '0.55^{c} = {w}%', line: 'species below 20%',
    choosyT: 'choosy females', gapT: 'call gap', wasteT: 'wasted clutches', here: 'at the log', upstream: 'upstream', goal: 'goal {g}%',
    pct: '{v}%', night: 'night {n}/{E}', epoch: 'epoch {n}/{E}', pairs: '{v} pairs', merged: 'They merged', two: 'Two species', dry: 'Dry season',
    tClash: 'Clashes pile up', tWaste: 'Wasted clutches', ax: 'changes per bank', axN: 'night', axE: 'epoch', expected: 'expected', straight: 'straight line',
    found: 'found', youCall: 'your call', xN: '×N', hyb: 'a hybrid',
    sK: 'Changes per bank', sPairs: 'Untested pairs', sClash: 'Expected clashes', sSurv: 'Hybrid survival', sFused: 'Mergers',
    sChoosy: 'Choosy females', sGap: 'Call gap', sWaste: 'Wasted clutches', sUp: 'Upstream wasted', sNight: 'Night'
  },
  panels: [],
  interesting: {
    fused: 'Hybrids survived {w}% at your first join. So the frogs merged, and {k} changes per bank were lost.',
    unlucky: 'The panel showed about {s}% survival. But chance gave only {c} clashes, so {w}% of hybrids survived and the frogs merged.',
    late: 'You waited for {k} changes per bank: {c} clashes. Hybrids were failing long before you joined the banks.',
    dry: 'The season ran out with the banks apart, so the dry season joined them for you.',
    lifted: 'You kept the log up for {n} nights. With no contact, nothing favoured choosy females.',
    upstream: 'Upstream, where the species never meet, the call gap stayed near {u}%. At the log it reached {g}%.',
    fused3: 'The banks merged {f} times. Each merger threw away the divergence the season had built.',
    late3: 'You joined the banks at epoch {e}. Choosiness had too little time to spread before the dry season.'
  },
  levers: { often: 'Double clash chance', line: 'Straight-line clashes', fit: 'Fit hybrids', apart: 'Never meet', early: 'Join early', late: 'Join late' },
  whatifBody: {
    often: 'With twice the clash chance, the best plan joined at {k} changes per bank. Hybrids survived {w}%. Faster clashes, faster species.',
    lineFail: 'Suppose each epoch added only one new pair. Then {k} changes per bank gave just {c} clashes; {w}% of hybrids survived. The square makes the snowball.',
    lineOk: 'Suppose each epoch added only one new pair. Then it took {k} changes per bank, the whole season, to reach {c} clashes. The square makes the snowball.',
    fit: 'With hybrids surviving 55%, contact merged the two species at once. Reinforcement needs hybrids that fail.',
    apart: 'With the log never laid, choosy females stayed near {p}%. When the banks joined for good, {x}% of clutches were wasted.',
    earlyFused: 'Joining at 3 changes per bank merged the frogs {f} times. The season ended with {x}% of clutches wasted.',
    earlyLost: 'Joining at 3 changes per bank merged the frogs {f} times. The season ended with one merged population.',
    late: 'Joining at 11 changes per bank left {n} epochs of contact. At the end, {x}% of clutches were still wasted.'
  },
  take: 'Apart, gene clashes pile up with the square of time. In contact, failing hybrids can sharpen mate preferences.',
  body: 'Apart, untested gene pairs grew as k², so hybrid survival fell slowly, then fast. Where young species met and hybrids died, choosy females wasted fewer clutches and calls pulled apart. Contact while hybrids still thrive merges the frogs. {end}',
  law: { title: 'The snowball' },
  boss: { inverts: 'Contact built the barrier last level. Too soon, contact erases the split.' },
  stars: {
    discover: 'Join the banks in good time, and let contact cut wasted clutches.',
    predict: 'Call the untested pairs at 6 changes per bank.',
    transfer: 'In one season, join in good time and end with few wasted clutches.'
  },
  levelStars: [
    { discover: 'Join once the panel’s hybrid survival is under 20%, by 7 changes per bank.', predict: 'Call the untested pairs at 6 changes per bank.' },
    { discover: 'End the last night with 12% or fewer wasted clutches.' },
    { transfer: 'Join once the panel’s survival is under 20%; end with 13% or fewer wasted clutches.' }
  ],
  levelTake: [
    'Untested gene pairs grow as k², so isolation comes slowly, then all at once.',
    'Where hybrids die, contact favours choosy females, so the calls pull apart.'
  ],
  levelBody: [
    'You joined the banks at {k} changes per bank: {n} untested pairs, {c} clashes, and {w}% hybrid survival. Doubling the time apart quadruples the pairs.',
    'Choosy females rose from 10% to {p}% and the call gap from 7% to {g}%. Upstream, apart, the gap stayed near {u}%. On the last night {x}% of clutches were wasted.'
  ],
  captions: {
    liveMut: 'Epoch {e}: each bank fixed change {k}. {n} untested pairs.', liveJoin: 'The log is down. Hybrid tadpoles hatch.',
    still0: 'Done here. Also end level 2 with 12% or fewer wasted clutches.', still1: 'Done here. Also join the banks in good time in level 1.',
    endX: 'Your season ended with {x}% of clutches wasted.', endLost: 'Your season ended with the two banks merged into one population.',
    liveVerdict: '{c} clashes: hybrid survival {w} percent.', liveNight: 'Night {n}: {x} percent of clutches wasted.', liveAsk: 'Prediction open: 1, 2 or 3, or the dock buttons.',
    mK: 'Gene changes fixed on each bank since the split.', mPairs: 'North–south pairs never tested together in one body.', mClash: '0.15 × untested pairs.',
    mSurv: 'Hybrid young that survive: 0.55 to the expected clashes.', mFused: 'Times the banks merged.', mChoosy: 'Females carrying the choosy allele.', mGap: 'Difference between the two calls.',
    mWaste: 'Clutches lost to matings with the other species.', mUp: 'The same species, never in contact.', mNight: 'Each night stands for many generations.'
  },
  model: [
    { level: 0, simulated: 'Each epoch, each bank fixes one new gene change. Every new north–south pair clashes in a hybrid with chance 0.15. Hybrid survival is 0.55 per clash. Below 20% the banks stay two species; at 20% or more they merge.', simplification: 'Changes are harmless at home; only north–south pairs clash, each tested when hybrids first form. One epoch stands for thousands of generations. The 20% line and the frogs’ colours are designed.', params: [{ name: 'clash chance per pair', value: 0.15, tag: 'designed' }, { name: 'hybrid survival per clash', value: 0.55, tag: 'designed' }, { name: 'species line', value: '20%', tag: 'designed' }, { name: 'one epoch', value: 'thousands of generations', tag: 'xN', real: 'species often take hundreds of thousands of years or more (Coyne and Orr 2004)' }], cannot: 'Clashes within one bank, three-gene clashes, ecological speciation (Two Fruits) or polyploidy (Doubling).', nature: 'Bateson (1909), Dobzhansky (1936) and Muller (1942) saw how hybrids can fail with neither population ever unfit. Orr (1995) predicted the snowball. Fruit-fly and wild-tomato crosses found evidence for it (Matute et al. 2010; Moyle and Nakazato 2010); other data show no clear snowball (Gourbière and Mallet 2010).', contested: true, refs: ['bateson1909', 'dobzhansky1936', 'muller1942', 'orr1995', 'matute2010', 'moyle2010', 'gourbiere2010'] },
    { level: 1, simulated: 'Two young species meet at the log. Hybrids survive 9%. A female with the choosy allele mostly rejects males whose call differs from her own. The wider the call gap, the better she does it. Choosy females waste fewer clutches, and they favour males with distinct calls.', simplification: 'One inherited choosy allele, at no cost. The call gap grows in step with choosiness (designed). Equal numbers on each side. Upstream, the same two species never meet and only drift.', params: [{ name: 'hybrid survival', value: '9%', tag: 'designed' }, { name: 'gap for half discrimination', value: '5%', tag: 'designed' }, { name: 'choosy at the start', value: '10%', tag: 'designed' }, { name: 'one night', value: 'many generations', tag: 'xN', real: 'about one breeding season a year' }], cannot: 'Migrants from far populations swamping the choosy allele, or a cost of being choosy.', nature: 'Dobzhansky (1940) proposed that selection against hybrids strengthens mate preferences: reinforcement. In Australian green-eyed tree frogs, the contact zone has more distinct calls and choosier females (Hoskin et al. 2005). Such contrasts fit reinforcement but have other explanations (Coyne and Orr 1989; Noor 1999).', contested: false, refs: ['dobzhansky1940', 'hoskin2005', 'coyne1989', 'noor1999'] },
    { level: 2, simulated: 'One season of 18 epochs: the split of level 1, then the contact of level 2. If hybrids survive 20% or more when the banks join, the frogs merge and the split restarts. Otherwise, choosiness spreads while the log is down.', simplification: 'Merging is all or nothing here. In nature, contact with fairly fit hybrids can leave a lasting hybrid zone. Reinforcement may still occur (Servedio and Noor 2003).', params: [{ name: 'season', value: '18 epochs', tag: 'designed' }, { name: 'species line', value: '20%', tag: 'designed' }, { name: 'one epoch', value: 'thousands of generations', tag: 'xN', real: 'species often take hundreds of thousands of years or more (Coyne and Orr 2004)' }], cannot: 'Stable hybrid zones, hybrid species, or migrants from far populations.', nature: 'Contact can end in reinforcement or a merger. Hybrid fitness and gene flow help decide which (Servedio and Noor 2003). In green-eyed tree frogs, the contact-zone population became very choosy. It is now isolated from its own lineage too (Hoskin et al. 2005).', contested: false, refs: ['servedio2003', 'hoskin2005', 'coyne2004'] }
  ],
  why: {
    real: [
      'William Bateson (1909), Theodosius Dobzhansky (1936) and H. J. Muller (1942) saw that genes harmless at home can clash when combined in a hybrid. Allen Orr (1995) showed such clashes should snowball. Evidence is mixed: some crosses show it, others not (Gourbière and Mallet 2010).',
      'Dobzhansky (1940) argued that where young species meet and hybrids fail, selection strengthens mate preferences. In green-eyed tree frogs of north-east Australia, calls differ most where two lineages meet (Hoskin et al. 2005).',
      'Contact can merge populations or finish their split. Which happens depends on how unfit hybrids are and on gene flow (Servedio and Noor 2003).'
    ],
    maths: [
      'With k changes on each bank there are k × k north–south pairs never tested together. If each clashes with chance p, expected clashes are p·k². Double the time apart and they quadruple. Hybrid survival is 0.55 to the power of the clashes, so three clashes give 17%. Before hybrids hatch, the panel shows 0.55 to the expected clashes.',
      'Wasted clutches = matings with the other species × hybrids that die. A plain female mates across half the time. A choosy one mates across ½(1 − a), where a = gap ÷ (gap + 5). The choosy allele spreads by that difference.',
      'Contact pays only once hybrids fail: with survival 20% or more the banks merge here. Below it, choosiness spreads at a rate set by 1 − survival.'
    ]
  }
};

/* ---------- the model's maths: pure and Det-safe (+ − × ÷ only), shared by the sim, the stars, the bots and the oracle ---------- */
const RV = {
  powi(q, n) { let r = 1; for (let i = 0; i < n; i++) r *= q; return r; },
  surv(cl) { return this.powi(RV_HV, cl); },                              // hybrid survival with cl clashes
  pairs(k, line) { return line ? k : k * k; },                            // north–south pairs never tested together
  tsurv(k, pc, line) { return Det.exp(RV_LNHV * pc * this.pairs(k, line)); },   // the panel's survival before hybrids hatch: 0.55 to the expected clashes (pc × pairs)
  disc(g) { return g > 0 ? g / (g + RV_R.half) : 0; },                    // how well a choosy female rejects the other call
  across(p, g) { return 0.5 * (1 - p * this.disc(g)); },                  // share of matings with the other species (equal numbers, full mixing)
  waste(p, g, w) { return 100 * this.across(p, g) * (1 - w); },           // % of clutches wasted on hybrids that die
  night(p, g, w) {   // one night in contact: the choosy allele by its clutch advantage; choosy females favour distinct calls
    const x0 = 0.5, x1 = 0.5 * (1 - this.disc(g)), W0 = 1 - x0 * (1 - w), W1 = 1 - x1 * (1 - w);
    const p2 = p * W1 / (p * W1 + (1 - p) * W0); return [p2, g + RV_R.beta * p2 * (1 - w)];
  },
  replay(p, g, w, hist) { for (const d of hist) if (d) { const r = this.night(p, g, w); p = r[0]; g = r[1]; } return [p, g]; }   // the expectation over a contact history
};

const CH_RIVER_V2 = {
  id: 'river', v2: true, role: 'environment', place: 'river', accent: '#2F7A5C',   // jungle green: the chapter's chrome tint (D6 decision 7)
  plan: ['The River', 'Allopatric speciation'],
  intro: { goal: 'Split one frog species in two, then let contact finish the job.' },
  content: RV_TEXT,
  P: {
    p: { v: RV_P, tag: 'designed', min: 0.05, max: 0.4, label: 'clash chance per pair' },
    hv: { v: RV_HV, tag: 'designed', min: 0.3, max: 0.9, label: 'hybrid survival per clash' },
    iso: { v: RV_ISO, tag: 'designed', min: 0.05, max: 0.5, label: 'species line' },
    epoch: { v: 1, tag: 'xN', min: 1, max: 1, real: 'species often take hundreds of thousands of years or more (Coyne and Orr 2004)', label: 'one epoch' }
  },
  levels: [
    { name: 'The snowball', adds: 'time apart', codes: ['K2', 'K3'], minutes: 1.5 },
    { name: 'The contact zone', adds: 'contact between young species', codes: ['K4'], minutes: 1 },
    { name: 'Too soon?', adds: 'when contact begins', codes: ['K3', 'K4'], minutes: 1.5 }
  ],
  keys: { Space: 'lay or lift log', F: 'faster', 1: 'first answer', 2: 'second answer', 3: 'third answer' },
  untimed: true,
  teacher: { prompts: ['Why do untested gene pairs grow faster than the time apart?', 'Why does contact merge the frogs in one case and sharpen their preferences in another?', 'This model lets every clash cut survival by the same amount. Which real feature of hybrids would most change the snowball?'], pool: 'trace' },
  starTraits: [],
  encodings: [   // the two banks' frogs: orange with a dark side stripe vs teal with pale spots (luminance and pattern, never hue alone)
    { k: 'north', rgb: [238, 138, 60], channels: ['luminance', 'pattern'] },
    { k: 'south', rgb: [44, 156, 143], channels: ['luminance', 'pattern'] },
    { k: 'clash', rgb: [194, 59, 44], channels: ['shape', 'luminance'] }
  ],
  // the unit's stars (API_v2 §14.1): Discover = L1 and L2; Predict = the L1 call; Transfer = the boss
  unitStars(lv) { const has = (i, b) => !!((lv[i] || 0) & b); return (has(0, 1) && has(1, 1) ? 1 : 0) | (has(0, 2) ? 2 : 0) | (has(2, 4) ? 4 : 0); },

  /* ================= headless simulation (API_v2 §9.3): R() and plain arithmetic only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {};
      if (o.thaw) { this.restore(o.thaw.snap); const s = this.s; s.whatif = o.thaw.lever || null; s.auto = true; s.log = []; s.ask = null; this.lever(s); return; }
      const L = RV_LV[level];
      const s = { level, mode: L.mode, phase: 'arrive', pt: 0, acc: 0, t: 0, e: 0, E: L.E, k: 0, cl: 0, cells: [], rev: 0, revT: 0, down: false, contact: false, species: false,
        fused: 0, joins: [], joinK: -1, joinE: -1, forced: false, endFuse: false, p: RV_R.p0, g: 0, pU: RV_R.p0, gU: 0, g0: 0, w: 1, hist: [], wasteH: [], wasteU: [], ups: 0, downs: 0,
        dec: -1, go: false, ask: null, opts: [], pred: {}, nocall: {}, saw6: false, mates: [], final: null, unt: false, ff: 1, pc: RV_P, line: false, whatif: null, auto: false, log: [] };
      if (L.mode === 'zone') {   // two young species: 5 changes per bank, 4 known clashes, already distinct calls
        s.k = L.k0; for (let i = 0; i < L.k0; i++) for (let j = 0; j < L.k0; j++) s.cells.push([i, j, RV_ZONE.some(c => c[0] === i && c[1] === j) ? 1 : 0]);
        s.rev = s.cells.length; s.cl = RV_ZONE.length; s.w = RV.surv(s.cl); s.species = true; s.g = s.g0 = s.gU = RV_R.gk * L.k0;
      }
      if (L.ask) { const a = RV_ASK.p1.opts.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } s.opts = a; }   // the answers' order is shuffled by seed
      this.s = s;
    },
    lever(s) {   // What if?: rerun the level from its start with one thing changed; the best plan plays
      const k = s.whatif;
      if (k === 'often') s.pc = 0.3; else if (k === 'line') s.line = true;
      else if (k === 'fit') { s.cells.forEach(c => { c[2] = 0; }); s.cells[2][2] = 1; s.cl = 1; s.w = RV.surv(1); }
    },
    elen(s) { return s.mode === 'zone' || s.contact ? (s.unt ? RV_T.nightU : RV_T.night) : (s.unt ? RV_T.epochU : RV_T.epoch); },
    inZone(s) { return s.mode === 'zone' || (s.mode === 'boss' && s.contact); },
    // ---- apart: each bank fixes one change; every new north–south pair is tested once, now, for a clash (hidden until hybrids form) ----
    mutate(s, ev) {
      const k = ++s.k, pc = s.pc, add = (i, j) => { const c = R() < pc ? 1 : 0; s.cells.push([i, j, c]); s.cl += c; };
      if (s.line) add(k - 1, k - 1); else { for (let j = 0; j < k - 1; j++) { add(k - 1, j); add(j, k - 1); } add(k - 1, k - 1); }
      s.g = RV_R.gk * k; ev.push({ k: 'mut', n: k });
      if (k === 6 && s.pred.p1 != null && !s.saw6) { s.saw6 = true; ev.push({ k: 'six' }); }
    },
    // ---- in contact: one night (many generations) of reinforcement; upstream (L2) only drifts ----
    night(s, ev) {
      const down = s.down; s.hist.push(down ? 1 : 0);
      if (down) { const r = RV.night(s.p, s.g, s.w); s.p = r[0]; s.g = r[1]; s.downs++; } else s.ups++;
      const mates = [], ax = RV.across(s.p, s.g);
      for (let i = 0; i < RV_R.mates; i++) { const across = down && R() < ax; mates.push(across ? 2 : i % 2); }   // 0, 1: a clutch on her own bank; 2: a hybrid clutch at the log
      s.mates = mates;
      if (s.mode === 'zone') {
        const n2 = RV_R.n2; s.pU = WF.binom(n2, s.pU) / n2; s.gU = Math.max(0, s.gU + (R() - 0.5) * 2 * RV_R.gDrift);
        s.wasteU.push(Math.round(10 * RV.waste(s.pU, s.gU, s.w)) / 10);
      }
      s.wasteH.push(Math.round(10 * RV.waste(s.p, s.g, s.w)) / 10);
      ev.push({ k: 'night', down, mates, n: s.hist.length });
    },
    tick(s, ev) {   // the end of one epoch (apart) or night (in contact)
      s.e++;
      if (this.inZone(s)) this.night(s, ev); else this.mutate(s, ev);
      if (s.e >= s.E) { this.seasonEnd(s, ev); return; }
      if (RV_LV[s.level].ask && s.k === RV_ASK.p1.at && !s.ask && !s.pred.p1 && !s.nocall.p1 && !s.auto && !this.inZone(s)) { s.ask = { id: 'p1', opts: s.opts.slice() }; s.phase = 'ask'; s.pt = 0; ev.push({ k: 'ask', id: 'p1' }); }
    },
    join(s, ev, forced) {   // the log goes down while the banks are apart: frogs cross and hybrids hatch; the log stays one epoch
      s.down = true; s.forced = !!forced; s.joinK = s.k; s.joinE = s.e; s.joins.push({ k: s.k, e: s.e, cl: s.cl, pairs: s.cells.length, es: RV.tsurv(s.k, s.pc, s.line), forced: !!forced });
      if (!forced) s.e++;
      s.phase = 'cross'; s.pt = 0; s.rev = 0; s.revT = 0; ev.push({ k: 'join', forced: !!forced, n: s.k });
    },
    verdict(s, ev) {
      const w = RV.surv(s.cl), J = s.joins[s.joins.length - 1]; s.w = w; if (J) J.w = w;
      if (w >= RV_ISO - 1e-12) { s.fused++; s.phase = 'fuse'; s.pt = 0; ev.push({ k: 'fuse', w, n: s.k, cl: s.cl }); }
      else { s.species = true; s.phase = 'species'; s.pt = 0; ev.push({ k: 'species', w, n: s.k, cl: s.cl }); }
    },
    afterFuse(s, ev) {
      if (s.forced || s.endFuse || s.e >= s.E) { s.final = null; s.phase = 'end'; s.pt = 0; return; }
      s.k = 0; s.cl = 0; s.cells = []; s.rev = 0; s.g = 0; s.down = false; s.w = 1; s.phase = 'run'; s.acc = 0; s.pt = 0; ev.push({ k: 'restart' });
    },
    afterSpecies(s, ev) {
      if (s.mode === 'split') { s.phase = 'end'; s.pt = 0; return; }
      s.contact = true; s.down = true; s.g0 = s.g; s.p = RV_R.p0; s.acc = 0; s.pt = 0;   // boss: the season continues in contact
      if (s.forced || s.e >= s.E) { s.phase = 'dry'; ev.push({ k: 'dry' }); return; }
      s.phase = 'run'; ev.push({ k: 'contact' });
    },
    seasonEnd(s, ev) {
      if (this.inZone(s)) { s.phase = 'dry'; s.pt = 0; ev.push({ k: 'dry' }); return; }
      if (!s.species) { this.join(s, ev, true); return; }
      s.phase = 'end'; s.pt = 0;
    },
    autoPlan(s, ev) {   // What if?: the best plan with one thing changed (joins once the panel's survival falls below 10%)
      const lv = s.whatif;
      if (s.mode === 'zone') { if (lv !== 'apart' && !s.down) this.act({ k: 'log', on: true, auto: true }); else if (!s.go) s.go = true; return; }
      if (s.contact) { if (!s.down) this.act({ k: 'log', on: true, auto: true }); return; }
      const K = lv === 'early' ? 3 : lv === 'late' ? 11 : 0;
      const go = K ? s.k >= K : RV.tsurv(s.k, s.pc, s.line) < 0.1;
      if (go && s.k > 0) this.act({ k: 'log', on: true, auto: true });
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; s.pt += dt;
      const ph = s.phase;
      if (ph === 'arrive') { if (s.pt >= RV_T.arrive) { s.phase = s.mode === 'zone' ? 'wait' : 'run'; s.pt = 0; s.acc = 0; ev.push({ k: 'ready' }); } }
      else if (ph === 'wait') {
        if (s.auto && s.pt >= RV_T.auto) { this.autoPlan(s, ev); if (s.phase !== 'wait') return ev; }
        if (s.go || s.pt >= RV_T.idle) { s.go = true; s.phase = 'run'; s.pt = 0; s.acc = 0; ev.push({ k: 'go' }); }
      }
      else if (ph === 'run') {
        if (s.auto && s.dec !== s.e && s.pt >= RV_T.auto) { s.dec = s.e; this.autoPlan(s, ev); if (s.phase !== 'run') return ev; }
        s.acc += dt * s.ff; const L = this.elen(s);
        if (s.acc >= L) { s.acc -= L; s.pt = 0; this.tick(s, ev); }
      }
      else if (ph === 'cross') { if (s.pt >= RV_T.cross) { s.phase = 'reveal'; s.pt = 0; s.revT = 0; ev.push({ k: 'hatch', n: s.cells.length }); } }
      else if (ph === 'reveal') {
        const n = s.cells.length, per = Math.min(RV_T.revCell, RV_T.revMax / Math.max(1, n)); s.revT += dt * s.ff;
        while (s.rev < n && s.revT >= per * (s.rev + 1)) { const c = s.cells[s.rev++]; ev.push({ k: 'rev', i: c[0], j: c[1], c: c[2], m: s.rev }); }
        if (s.rev >= n && s.revT >= per * n + RV_T.revHold) this.verdict(s, ev);
      }
      else if (ph === 'fuse') { if (s.pt >= RV_T.fuse) this.afterFuse(s, ev); }
      else if (ph === 'species') { if (s.pt >= RV_T.species) this.afterSpecies(s, ev); }
      else if (ph === 'dry') { if (s.pt >= RV_T.dry) { s.final = RV.waste(s.p, s.g, s.w); s.down = true; s.phase = 'end'; s.pt = 0; ev.push({ k: 'final', x: s.final }); } }
      else if (ph === 'end') { if (s.pt >= RV_T.end) { s.phase = 'over'; ev.push({ k: 'over' }); } }
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (a.k === 'unt') { s.unt = !!a.on; return ev; }
      if (a.k === 'predict') {
        if (s.ask && a.id === s.ask.id) {
          if (a.v == null) s.nocall[a.id] = 1; else s.pred[a.id] = +a.v;
          s.ask = null; s.phase = 'run'; s.pt = 0; ev.push({ k: 'predicted', id: a.id, none: a.v == null, v: a.v });
        }
        return ev;
      }
      if (a.k === 'ff') { s.ff = s.ff > 1 ? 1 : 3; ev.push({ k: 'ff', on: s.ff > 1 }); return ev; }
      if (s.auto && !a.auto) return ev;
      if (a.k === 'wait') { s.dec = s.e; if (s.phase === 'wait') s.go = true; return ev; }
      if (a.k !== 'log') return ev;
      s.dec = s.e; const on = a.on == null ? !s.down : !!a.on;
      if (s.phase === 'wait') { s.down = on; ev.push({ k: 'log', on }); if (on) { s.go = true; this.zoneFuse(s, ev); } return ev; }
      if (s.phase === 'cross' || s.phase === 'reveal') { ev.push({ k: 'locked' }); return ev; }
      if (s.phase !== 'run') return ev;
      if (this.inZone(s)) { if (on === s.down) return ev; s.down = on; ev.push({ k: 'log', on }); if (on) this.zoneFuse(s, ev); return ev; }
      if (on && s.k > 0) this.join(s, ev, false); else if (on) ev.push({ k: 'empty' });
      return ev;
    },
    zoneFuse(s, ev) {   // L2's 'fit hybrids' What if?: contact with hybrids that survive 20% or more merges the species
      if (s.mode !== 'zone' || s.w < RV_ISO - 1e-12) return;
      s.fused++; s.endFuse = true; s.phase = 'fuse'; s.pt = 0; ev.push({ k: 'fuse', w: s.w, n: s.k, cl: s.cl });
    },
    expWaste(s) {   // the expectation the stars read: the night recursion over this run's contact history (the zone has no drift)
      if (s.final == null) return null;
      const r = RV.replay(RV_R.p0, s.g0, s.w, s.hist); return RV.waste(r[0], r[1], s.w);
    },
    hit(s) { return s.pred.p1 === RV_ASK.p1.ans; },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_RIVER_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      const x = this.expWaste(s);
      return { mask, outcome: { species: s.species && !s.endFuse, fused: s.fused, joinK: s.joinK, waste: x == null ? null : Math.round(x * 10) / 10 }, interesting: s.whatif ? null : this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons rule 6)
      const n = s.level, f = s.joins[0];
      if (n === 0) { if (s.forced) return 'dry'; if (s.fused && f && f.w != null) return f.es < RV_ISO ? 'unlucky' : 'fused'; if (s.species && s.joinK >= 9) return 'late'; return null; }
      if (n === 1) { if (s.ups >= 2) return 'lifted'; if (s.final != null) return 'upstream'; return null; }
      if (s.fused >= 2) return 'fused3';
      if (s.species && s.final != null && s.joinE >= 9 && this.expWaste(s) > RV_GOAL.w3) return 'late3';
      return null;
    },
    iVars(s) {   // the numbers an Interesting result names, from this run
      const f = s.joins[0] || {}, r1 = x => Math.round(x);
      return { w: r1(100 * (f.w == null ? 1 : f.w)), k: f.k || 0, c: f.cl == null ? s.cl : f.cl, s: r1(100 * (f.es == null ? 1 : f.es)), n: s.ups, u: r1(s.gU), g: r1(s.g), f: s.fused, e: s.joinE };
    },
    wiVars(s) {   // the What if? card's numbers, from the rerun that just happened
      const x = this.expWaste(s);
      return { k: s.joinK, c: s.cl, w: Math.round(100 * s.w), p: Math.round(100 * s.p), x: x == null ? 0 : Math.round(x), f: s.fused, n: s.downs };
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {   // one decision per epoch or night for the bots: lay/lift the log, or wait
      const s = this.s, out = []; if (!s || s.auto) return out;
      if (s.ask) return s.ask.opts.map(v => ({ k: 'predict', id: s.ask.id, v }));
      if (s.dec === s.e) return out;
      if (s.phase === 'wait') return [{ k: 'log', on: true }, { k: 'wait' }];
      if (s.phase !== 'run') return out;
      if (this.inZone(s)) return [{ k: 'log', on: !s.down }, { k: 'wait' }];
      return [{ k: 'log', on: true }, { k: 'wait' }];
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    layIf(s, acts, go) { const a = acts.find(x => x.k === 'log' && x.on === true); return go && a ? a : acts.find(x => x.k === 'wait') || null; },
    keepDown(s, acts) { return this.layIf(s, acts, true); },   // in contact: lay it and keep it down
    bots: {
      alwaysA(s, acts) { if (acts[0] && acts[0].k === 'predict') return acts[0]; return CH_RIVER_V2.sim.layIf(s, acts, true); },              // the log down at every chance
      alwaysB(s, acts) { if (acts[0] && acts[0].k === 'predict') return acts[acts.length - 1]; return acts.find(x => x.k === 'wait') || null; },   // never lays the log
      greedy(s, acts) {   // reads the panel: joins as soon as the panel's hybrid survival falls below 20%; calls the linear answer (twice the time, twice the pairs)
        const S = CH_RIVER_V2.sim; if (acts[0] && acts[0].k === 'predict') return acts.find(a => a.v === 18);
        if (S.inZone(s)) return S.keepDown(s, acts);
        return S.layIf(s, acts, RV.tsurv(s.k, s.pc, s.line) < RV_ISO);
      },
      threshold(s, acts) {   // a fixed rule of thumb: join after 4 changes per bank; in the zone, wait three nights first; calls the middle number
        const S = CH_RIVER_V2.sim; if (acts[0] && acts[0].k === 'predict') return acts.find(a => a.v === 18);
        if (s.mode === 'zone') return S.layIf(s, acts, s.e >= 3);
        if (S.inZone(s)) return S.keepDown(s, acts);
        return S.layIf(s, acts, s.k >= 4);
      },
      lifter(s, acts) {   // lays the log, then lifts it every other night to spare clutches; joins at 6 changes
        const S = CH_RIVER_V2.sim; if (acts[0] && acts[0].k === 'predict') return acts.find(a => a.v === 36);
        if (S.inZone(s)) { const a = acts.find(x => x.k === 'log'); return a && (s.e % 2 === 0) === !s.down ? a : acts.find(x => x.k === 'wait'); }
        return S.layIf(s, acts, s.k >= 6);
      },
      late(s, acts) {   // waits for 11 changes per bank before any contact; calls 36
        const S = CH_RIVER_V2.sim; if (acts[0] && acts[0].k === 'predict') return acts.find(a => a.v === 36);
        if (s.mode === 'zone') return S.layIf(s, acts, s.e >= 5);
        if (S.inZone(s)) return S.keepDown(s, acts);
        return S.layIf(s, acts, s.k >= 11);
      },
      expert(s, acts) {   // skilled play (oracle only): joins once the panel's hybrid survival falls below 10% (6 changes per bank); keeps contact; calls 36
        const S = CH_RIVER_V2.sim; if (acts[0] && acts[0].k === 'predict') return acts.find(a => a.v === RV_ASK.p1.ans);
        if (S.inZone(s)) return S.keepDown(s, acts);
        return S.layIf(s, acts, RV.tsurv(s.k, s.pc, s.line) < 0.1);
      }
    }
  },

  /* ---- stars: pure functions of the final state, scored against the expectation (API_v2 §9.1). No level offers all three. ---- */
  stars: {
    discover: (s, n) => {
      if (n === 0) return s.joins.some(J => !J.forced && J.es < RV_ISO && J.k <= RV_GOAL.k1);   // the decision, scored against the expectation: chance may still merge them
      if (n === 1) { const x = CH_RIVER_V2.sim.expWaste(s); return !s.fused && x != null && x <= RV_GOAL.w2 + 1e-9; }
      return false;
    },
    predict: (s, n) => n === 0 && CH_RIVER_V2.sim.hit(s),
    transfer: (s, n) => { if (n !== 2) return false; const x = CH_RIVER_V2.sim.expWaste(s); return s.species && x != null && x <= RV_GOAL.w3 + 1e-9 && s.joins.length > 0 && s.joins.every(J => J.es < RV_ISO && !J.forced); }
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–7 changes per bank at the last join (31 = none) · 8–10 mergers (capped 7) ·
  // 11–17 wasted clutches at the end, % (127 = none) · 18–19 the L1 call (0 none, 1–3: 12, 18, 36) · 20–25 call gap % (capped 63)
  resultBits(s, level) {
    const r = this.sim.result(), x = this.sim.expWaste(s), call = s.pred.p1 == null ? 0 : RV_ASK.p1.opts.indexOf(s.pred.p1) + 1;
    return ((r ? r.mask : 0) & 7) | ((s.joinK < 0 ? 31 : Math.min(30, s.joinK)) << 3) | (Math.min(7, s.fused) << 8) | ((x == null ? 127 : Math.min(100, Math.round(x))) << 11) | ((call & 3) << 18) | (Math.min(63, Math.round(s.g)) << 20);
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {}); this.level = n; this._ended = false; this._pend = false; this._dockSig = ''; this._said = {}; this._gh = null;
    Sim.start(this, n, o);
    if (!o.thaw && typeof Freezer !== 'undefined') Freezer.put(this.id, 0, this.sim.snapshot());   // What if? reruns the level from here
    const unt = (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt) || (typeof Url !== 'undefined' && Url.untimed);
    if (unt && !o.thaw && !o.replay) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    const s = this.sim.s;
    this.v = { t: 0, logA: s.down ? 1 : 0, banner: null, sig: '', bgSig: '', calls: [], tads: [], hops: [], clutches: [], sparks: [], pop: {}, blend: 0, fuseT: -1, revFlash: {}, lastCall: 0, caller: -1, night: s.mode === 'zone' ? 1 : 0 };
    this.layout(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(1000, ms + 300) }; });
    if (!o.thaw && n === 1) this.ghost();   // L2 at once; L1 after the first change (nothing to test before it)
  },
  ghost(again) {   // the hand shows the tap on the log, until the log is first laid; it steps aside for the one prediction and comes back after it
    if (typeof Ghost !== 'undefined' && (again ? this.once('ghost2') : this.once('ghost'))) {
      this._gh = Ghost.show({ verb: 'tap', key: ' ', force: !!again, at: () => this.logTip(), until: () => { const q = this.sim.s; return q.down || q.joins.length > 0 || q.phase === 'over' || !!q.ask; } });
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  onResize() { if (this.v) this.layout(); },

  /* ---------- geometry (canvas px) ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  geo() {
    const W = Stage.w, H = Stage.h, k = W + 'x' + H + 'x' + this.hudH();
    if (this._g && this._g.k === k) return this._g;
    const top = this.hudH() + 2, land = W > H * 1.05;
    let sc, pn;
    if (land) { const sw = Math.round(W * 0.6); sc = { x: 0, y: top, w: sw, h: H - top }; pn = { x: sw + 12, y: top + 12, w: W - sw - 24, h: H - top - 24 }; }
    else { const sh = Math.round((H - top) * 0.64); sc = { x: 0, y: top, w: W, h: sh }; pn = { x: 10, y: top + sh + 8, w: W - 20, h: H - top - sh - 14 }; }
    const rT = Math.round(sc.y + sc.h * 0.42), rB = Math.round(sc.y + sc.h * 0.68), fs = Math.round(Math.max(25, Math.min(42, Math.min(sc.w, sc.h) * 0.085)));
    const lx = Math.round(sc.x + sc.w * 0.5), P0 = [lx, rB + 6], Lg = rB - rT + 22;   // the log pivots on the south bank: lying along it (up) or across the river (down)
    const NP = [[0.1, 0.3], [0.27, 0.2], [0.4, 0.33], [0.63, 0.22], [0.78, 0.33], [0.92, 0.2], [0.18, 0.4]], SP = [[0.08, 0.8], [0.22, 0.91], [0.36, 0.83], [0.62, 0.93], [0.76, 0.85], [0.92, 0.79], [0.3, 0.97]];
    const at = (q, f) => [Math.round(sc.x + sc.w * q[0]), Math.round(sc.y + sc.h * q[1] * (f ? 1 : 1))];
    const g = { k, W, H, top, land, sc, pn, rT, rB, fs, lx, P0, Lg, north: NP.map(q => at(q)), south: SP.map(q => at(q)) };
    g.mid = [lx, Math.round((rT + rB) / 2)];
    this._g = g; return g;
  },
  layout() { this._g = null; this.geo(); if (this.v) this.v.bgSig = ''; },
  logEnds(a) {   // the log's two ends at lowered fraction a (0 lying along the bank, 1 across the river)
    const g = this.geo(), th = -a * TAU / 4 * 0.96, c = Det.cos(th), sn = Det.sin(th);
    return [g.P0, [g.P0[0] + g.Lg * c, g.P0[1] + g.Lg * sn]];
  },
  logTip() { const e = this.logEnds(this.v ? this.v.logA : 0); return [Math.round((e[0][0] + e[1][0]) / 2), Math.round((e[0][1] + e[1][1]) / 2)]; },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    const want = s.down ? 1 : 0; v.logA += (want - v.logA) * Math.min(1, dt * 6); if (Math.abs(want - v.logA) < 0.002) v.logA = want;
    const nt = this.sim.inZone(s) ? 1 : 0; v.night += (nt - v.night) * Math.min(1, dt * 1.5);
    if (s.phase === 'fuse') v.blend = Math.min(1, v.blend + dt / (RV_T.fuse * 0.7)); else if (v.blend > 0 && s.phase !== 'end' && s.phase !== 'over') v.blend = Math.max(0, v.blend - dt * 2);
    if (s.phase === 'fuse' && s.endFuse) v.blend = Math.min(1, v.blend);
    this.animate(dt);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  animate(dt) {   // cosmetic: calls, hops, tadpoles, clutches and sparks (view clocks only)
    const v = this.v, s = this.sim.s, g = this.geo(), calm = typeof Fx !== 'undefined' && Fx.calm;
    if (!calm && v.t - v.lastCall > 0.9 && s.phase !== 'fuse') {   // a male calls: his vocal sac swells and rings spread
      v.lastCall = v.t; const north = Fx.rnd() < 0.5, list = north ? g.north : g.south, i = Math.floor(Fx.rnd() * list.length);
      v.calls.push({ north, i, t: 0 }); if (v.calls.length > 6) v.calls.shift();
    }
    for (const c of v.calls) c.t += dt; v.calls = v.calls.filter(c => c.t < 1.6);
    for (const h of v.hops) h.t += dt * (s.ff > 1 ? 2 : 1); v.hops = v.hops.filter(h => h.t < h.d);
    for (const q of v.tads) { q.t += dt; if (q.dying) q.die += dt; } v.tads = v.tads.filter(q => !(q.dying && q.die > 1.4) && q.t < (q.life || 99));
    for (const c of v.clutches) c.t += dt * (s.ff > 1 ? 2 : 1); v.clutches = v.clutches.filter(c => c.t < 2.2).slice(-24);
    for (const p of v.sparks) p.t += dt; v.sparks = v.sparks.filter(p => p.t < 0.8);
    for (const k in v.pop) { v.pop[k] -= dt; if (v.pop[k] <= 0) delete v.pop[k]; }
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, S = this.sim, final = n === RV_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    const V = this.vars();
    if (o.interesting) { C.interesting.now = Txt.f(C.interesting[o.interesting], S.iVars(s)); o.interesting = 'now'; }   // the engine shows the text as is: fill this run's numbers first
    if (s.whatif) { o.take = null; o.interesting = null; o.body = Txt.f(C.whatifBody[this.wiKey(s)] || '', S.wiVars(s)); }
    else if (!final) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, Object.assign({ end: Txt.f(V.x === '—' ? C.captions.endLost : C.captions.endX, V) }, V)); o.bodyFirst = true; }
    o.stars = Object.assign({}, C.levelStars[n]);
    if ((r.mask & 1) && n < 2) o.stars.discover = C.captions['still' + n];   // earned here; the unit's Discover also needs the other level (unitStars)
    const vial = typeof Freezer !== 'undefined' ? Freezer.list(this.id).find(x => x.gen === 0) : null;
    if (vial && !s.whatif) o.whatIf = { gen: 0, levers: RV_LV[n].levers };
    const spec = this.debrief(); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  wiKey(s) {   // the What if? text that matches this rerun
    const k = s.whatif;
    if (k === 'line') return s.species ? 'lineOk' : 'lineFail';
    if (k === 'early') return s.species && s.final != null ? 'earlyFused' : 'earlyLost';
    return k;
  },
  vars() {
    const s = this.sim.s, x = this.sim.expWaste(s), J = s.joins[s.joins.length - 1] || {};
    return { k: J.k || s.k, n: J.pairs || s.cells.length, c: J.cl == null ? s.cl : J.cl, w: Math.round(100 * (J.w == null ? s.w : J.w)), p: Math.round(100 * s.p), g: Math.round(s.g), u: Math.round(s.gU), x: x == null ? '—' : Math.round(x) };
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {   // cosmetic (view-only maths)
    const s = this.sim.s, v = this.v, g = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content;
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    const tip = this.logTip();
    if (e.k === 'mut') {
      const a = g.north[e.n % g.north.length], b = g.south[(e.n + 3) % g.south.length];
      v.sparks.push({ x: a[0], y: a[1] - g.fs * 0.4, t: 0 }, { x: b[0], y: b[1] - g.fs * 0.4, t: 0 });
      if (F) { F.burst('spark', a[0], a[1] - g.fs * 0.4, 5, { ink: RV_C.orange }); F.burst('spark', b[0], b[1] - g.fs * 0.4, 5, { ink: RV_C.teal }); }
      v.pop['row' + (e.n - 1)] = 0.5; snd('tick', a[0], a[1]);
      if (s.level === 0 && e.n === 1 && !s.auto) this.ghost();
      if (e.n === 5 && this.once('snow')) this.whisper('snow');
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveMut, { e: s.e, k: e.n, n: RV.pairs(e.n, s.line) }));
    }
    else if (e.k === 'six') { this.whisper('six'); if (F) F.ring(g.pn.x + g.pn.w / 2, g.pn.y + g.pn.h / 2, 40, { ms: 600 }); }
    else if (e.k === 'join' || (e.k === 'log' && e.on)) {
      if (F) { F.burst('droplet', tip[0], tip[1], 10, { ink: RV_C.waterHi }); F.shake(3, 140); }
      snd('swish', tip[0], tip[1]);
      if (e.k === 'join') {
        for (let i = 0; i < 3; i++) { v.hops.push({ from: g.north[(i * 2) % g.north.length], north: true, t: -i * 0.25, d: 1.3 }); v.hops.push({ from: g.south[(i * 2 + 1) % g.south.length], north: false, t: -i * 0.25 - 0.12, d: 1.3 }); }
        if (typeof Live !== 'undefined') Live.say(C.captions.liveJoin);
      }
    }
    else if (e.k === 'log' && !e.on) { if (F) F.burst('droplet', tip[0], tip[1], 6, { ink: RV_C.waterHi }); snd('swish', tip[0], tip[1]); if (this.sim.inZone(s) && this.once('lift')) this.whisper('lift'); }
    else if (e.k === 'locked') this.whisper('locked');
    else if (e.k === 'empty') this.whisper('empty');
    else if (e.k === 'hatch') {   // a hybrid clutch hatches beside the log: two-tone tadpoles, one parent's look on each half
      v.tads = []; const n = 14, ce = this.logEnds(1);
      for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; v.tads.push({ x: ce[0][0] + (ce[1][0] - ce[0][0]) * u + (i % 2 ? 1 : -1) * (g.fs * 0.7 + Fx.rnd() * g.fs * 1.3), y: ce[0][1] + (ce[1][1] - ce[0][1]) * u, ph: Fx.rnd() * 6, t: 0, hyb: true, dying: false, die: 0 }); }
      snd('scale', g.mid[0], g.mid[1]);
    }
    else if (e.k === 'rev') {
      v.revFlash[e.i + ',' + e.j] = 0.5;
      if (e.c) {   // a clash: some hybrid tadpoles die
        const alive = v.tads.filter(q => !q.dying), kill = Math.max(1, Math.round(alive.length * (1 - RV_HV)));
        for (let i = 0; i < kill && i < alive.length; i++) alive[Math.floor(Fx.rnd() * alive.length)].dying = true;
        const p = this.cellXY(e.i, e.j); if (F && p) F.burst('spark', p[0], p[1], 4, { ink: RV_C.red }); snd('crack', p ? p[0] : g.mid[0], p ? p[1] : g.mid[1]);
        if (this.once('clash')) this.whisper('clash');
      } else if (e.m % 4 === 0) { const p = this.cellXY(e.i, e.j); if (p) snd('count', p[0], p[1], { i: Math.min(24, e.m / 4) }); }
    }
    else if (e.k === 'fuse') {
      this.whisper('fused'); v.blend = 0.01; for (const q of v.tads) if (!q.dying) q.life = q.t + 1.2;
      if (F) { F.shake(6, 300); F.tier(3, ms => { v.banner = { text: C.labels.merged, t: 0, ms: Math.max(1300, ms + 400) }; }); }
      for (let i = 0; i < 6; i++) v.hops.push({ from: (i % 2 ? g.south : g.north)[i], north: !(i % 2), t: -i * 0.15, d: 1.6, swarm: true });
      snd('swish', g.mid[0], g.mid[1]);
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveVerdict, { c: e.cl, w: Math.round(100 * e.w) }));
    }
    else if (e.k === 'species') {
      this.whisper('species'); for (const q of v.tads) if (Fx.rnd() < 0.85) q.dying = true;
      if (F) { F.tier(3, ms => { v.banner = { text: C.labels.two, t: 0, ms: Math.max(1300, ms + 400) }; }); for (const p of [g.north[2], g.south[2], g.north[4], g.south[4]]) F.burst('spark', p[0], p[1] - g.fs * 0.5, 7, { ink: RV_C.fly }); }
      snd('interesting', g.mid[0], g.mid[1]);
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveVerdict, { c: e.cl, w: Math.round(100 * e.w) }));
    }
    else if (e.k === 'restart') { v.tads = []; v.blend = 0; snd('tock', g.mid[0], g.mid[1]); }
    else if (e.k === 'contact') { v.tads = []; snd('dusk', g.mid[0], g.mid[1]); }
    else if (e.k === 'night') {   // tonight's matings: a female hops to a male; own-bank spawn by each bank, hybrid clutches at the log die
      const ce = this.logEnds(1); let h = 0;
      e.mates.forEach((m, i) => {
        const north = m === 2 ? i % 2 === 0 : m === 0, bank = north ? g.north : g.south, base = bank[(i * 3 + e.n) % bank.length], dl = i * 0.12;
        if (m === 2) {   // across the log: she meets a male of the other species mid-river; the clutch is laid in the water beside the log
          h++; const u = north ? 0.58 - 0.08 * (h % 3) : 0.42 - 0.08 * (h % 3), tx = ce[0][0] + (ce[1][0] - ce[0][0]) * u, ty = ce[0][1] + (ce[1][1] - ce[0][1]) * u;
          if (h <= 3) v.hops.push({ from: base, to: [tx, ty], north, t: -dl, d: 0.9, f: true });
          v.clutches.push({ x: tx + (h % 2 ? 1 : -1) * g.fs * (0.9 + 0.25 * (h % 3)), y: ty + g.fs * 0.15, hyb: true, t: -dl - 0.7 });
        } else v.clutches.push({ x: base[0] + (i % 2 ? 0.3 : -0.3) * g.fs, y: north ? g.rT + g.fs * 0.35 : g.rB - g.fs * 0.3, hyb: false, north, t: -dl });
      });
      if (h && F) { F.ring(g.mid[0], g.mid[1], 22, { ms: 300, ink: RV_C.red }); snd('crack', g.mid[0], g.mid[1]); if (this.once('waste')) this.whisper('waste'); }
      else snd('peep', g.north[1][0], g.north[1][1]);
      if (s.p > 0.5 && this.once('choosy')) this.whisper('choosy'); else if (s.g > 14 && this.once('calls')) this.whisper('calls');
      v.pop.waste = 0.5;
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveNight, { n: e.n, x: Math.round(RV.waste(s.p, s.g, s.w)) }));
    }
    else if (e.k === 'dry') { if (F) F.tier(3, ms => { v.banner = { text: C.labels.dry, t: 0, ms: Math.max(1300, ms + 400) }; }); snd('dusk', g.mid[0], g.mid[1]); }
    else if (e.k === 'final') { if (F) F.pop(Math.round(e.x) + '%', g.pn.x + g.pn.w / 2, g.pn.y + 24, e.x <= RV_GOAL.w2 ? 1 : -1); }
    else if (e.k === 'ask') { if (F) F.ring(g.pn.x + g.pn.w / 2, g.pn.y + g.pn.h / 2, 30, { ms: 400 }); if (typeof Live !== 'undefined') Live.say(C.captions.liveAsk); this._dockSig = ''; }
    else if (e.k === 'predicted') { this.whisper(e.none ? 'none' : 'later'); this._dockSig = ''; if (!s.joins.length && !s.auto && this._gh && this._gh.shown) this.ghost(true); if (F) F.ring(g.pn.x + g.pn.w / 2, g.pn.y + g.pn.h / 2, 24, { ms: 300 }); }
    else if (e.k === 'ff') this.whisper(e.on ? 'ff' : 'slow');
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'rv-' + k); },

  /* ---------- input: tap the log (or anywhere on the river) to lay or lift it; keys through onKey ---------- */
  toggle() { const s = this.sim.s; Sim.act(this, { k: 'log', on: !s.down }); },
  down(x, y) {
    if (y < this.hudH()) return; const s = this.sim.s, g = this.geo();
    if (s.ask) { const i = this.chipAt(x, y); if (i >= 0) Sim.act(this, { k: 'predict', id: s.ask.id, v: s.ask.opts[i] }); return; }
    const t = this.logTip(), onRiver = x >= g.sc.x && x <= g.sc.x + g.sc.w && y >= g.rT - 24 && y <= g.rB + 40;
    if (onRiver || (x - t[0]) * (x - t[0]) + (y - t[1]) * (y - t[1]) < 4900) this.toggle();
  },
  onKey(k, e) {
    const s = this.sim.s;
    if (k === ' ' || k === 'Spacebar') { if (e && e.repeat) return; if (!s.ask) this.toggle(); }
    else if (k === 'f' || k === 'F') Sim.act(this, { k: 'ff' });
    else if (s.ask && /^[123]$/.test(k)) Sim.act(this, { k: 'predict', id: s.ask.id, v: s.ask.opts[+k - 1] });
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, busy = s.phase === 'cross' || s.phase === 'reveal';
    const sig = s.phase + (s.ask ? 'a' : '') + (s.down ? 'd' : '') + (s.auto ? 'x' : '') + s.ff + (this.sim.inZone(s) ? 'z' : ''); if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set(s.ask.opts.map((v, i) => ({ id: 'rv-a' + i, label: Txt.f(L.pairs, { v }), key: String(i + 1), fn: () => Sim.act(this, { k: 'predict', id: s.ask.id, v }) }))); return; }
    if (s.auto || s.phase === 'over' || s.phase === 'end' || s.phase === 'arrive') { Dock.set([]); return; }
    const canLift = this.sim.inZone(s) || s.phase === 'wait';
    const logBtn = { id: 'rv-log', label: busy ? L.crossing : s.down && canLift ? L.lift : L.log, key: ' ', primary: !s.down, pressed: !!s.down, disabled: busy || (s.down && !canLift) || s.phase === 'fuse' || s.phase === 'species' || s.phase === 'dry', aria: 'Lay the log across the river, or lift it', fn: () => this.toggle() };
    Dock.set([logBtn, { id: 'rv-ff', label: s.ff > 1 ? L.normal : L.faster, key: 'f', pressed: s.ff > 1, fn: () => Sim.act(this, { k: 'ff' }) }]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; let t;
    if (s.ask) t = C.p1;
    else if (s.auto) t = C.auto;
    else if (s.phase === 'over' || s.phase === 'end') t = C.over;
    else if (s.phase === 'cross') t = C.cross;
    else if (s.phase === 'reveal') t = C.reveal;
    else if (s.phase === 'fuse') t = C.fused;
    else if (s.phase === 'species') t = C.species;
    else if (s.phase === 'dry') t = C.dry;
    else if (s.phase === 'wait') t = C.wait;
    else if (this.sim.inZone(s)) t = s.down ? (s.mode === 'boss' ? C.bossDown : C.down) : C.up;
    else if (s.level === 0 && s.e === 0 && s.joins.length === 0) t = this.content.firstWords;
    else if (s.mode === 'boss' && s.k < 2) t = C.bossApart;
    else if (s.k < 2) t = C.apart1;
    else t = Txt.f(C.apart, { n: RV.pairs(s.k, s.line) });
    const num = this.sim.inZone(s) || s.phase === 'wait' ? Txt.f(L.night, { n: Math.min(s.E, s.e + (s.phase === 'run' ? 1 : 0)), E: s.E }) : Txt.f(L.epoch, { n: Math.min(s.E, s.e), E: s.E });
    const sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g); this.drawWater(c, g); this.drawClutches(c, g); this.drawTads(c, g); this.drawLog(c, g); this.drawFrogs(c, g); this.drawHops(c, g); this.drawMist(c, g);
    if (v.night > 0.02) this.drawNight(c, g);
    this.drawPanel(c, g);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('rv-banner', v.banner.text, g.mid[0], g.mid[1], { size: 22 }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached: misty rainforest layers, buttress trees, ferns and the leaves the frogs sit on
    const sig = g.k; if (!this._bg || this.v.bgSig !== sig) { this._bg = this._bg || Layer(g.W, g.H); this._bg.resize(g.W, g.H); this._bg.redraw(cc => this.paintBg(cc, g)); this.v.bgSig = sig; }
    this._bg.blit(c, 0, 0);
  },
  paintBg(c, g) {   // cosmetic
    const C = RV_C, sc = g.sc, rnd = rng(31), W = sc.w, X0 = sc.x;
    c.fillStyle = C.dark; c.fillRect(0, 0, g.W, g.H);
    const sk = c.createLinearGradient(0, sc.y, 0, g.rT); sk.addColorStop(0, C.mist); sk.addColorStop(1, C.mist2); c.fillStyle = sk; c.fillRect(X0, 0, W, g.rT + 4);
    // three misty layers of canopy, paler with distance
    for (const [col, base, amp, n, al] of [[C.far1, 0.16, 0.08, 9, 0.75], [C.far2, 0.26, 0.09, 7, 0.85], [C.mid, 0.36, 0.08, 6, 1]]) {
      c.globalAlpha = al; c.fillStyle = col; const yb = sc.y + sc.h * base;
      c.beginPath(); c.moveTo(X0, g.rT + 2); c.lineTo(X0, yb);
      for (let i = 0; i <= n; i++) { const x = X0 + W * i / n, r = W / n * (0.55 + rnd() * 0.25); c.arc(x, yb - sc.h * amp * rnd(), r, Math.PI, 0); }
      c.lineTo(X0 + W, g.rT + 2); c.closePath(); c.fill();
      c.globalAlpha = al * 0.9; for (let i = 0; i < n; i++) { const x = X0 + W * (i + rnd()) / n; c.fillRect(x, yb - 4, Math.max(3, W * 0.012), g.rT - yb + 6); }   // trunks
    }
    c.globalAlpha = 1;
    // the north bank's near edge: dark soil with roots, ferns and broad leaves for the frogs
    const nb = c.createLinearGradient(0, g.rT - sc.h * 0.16, 0, g.rT); nb.addColorStop(0, 'rgba(39,69,47,0)'); nb.addColorStop(1, C.near); c.fillStyle = nb; c.fillRect(X0, g.rT - sc.h * 0.16, W, sc.h * 0.16);
    c.fillStyle = C.mud; c.beginPath(); c.moveTo(X0, g.rT - 6); for (let x = 0; x <= W; x += 16) c.lineTo(X0 + x, g.rT - 4 + 4 * Det.sin(x * 0.07)); c.lineTo(X0 + W, g.rT + 6); c.lineTo(X0, g.rT + 6); c.fill();
    // the south bank: the near forest floor
    const sb = c.createLinearGradient(0, g.rB, 0, sc.y + sc.h); sb.addColorStop(0, C.near); sb.addColorStop(1, C.dark); c.fillStyle = sb; c.fillRect(X0, g.rB - 2, W, sc.y + sc.h - g.rB + 2);
    c.fillStyle = C.mud; c.beginPath(); c.moveTo(X0, g.rB + 4); for (let x = 0; x <= W; x += 16) c.lineTo(X0 + x, g.rB + 2 + 4 * Det.sin(x * 0.05 + 2)); c.lineTo(X0 + W, g.rB - 4); c.lineTo(X0, g.rB - 4); c.fill();
    // ferns along both banks
    const fern = (x, y, s, up) => { c.strokeStyle = rnd() < 0.5 ? C.leaf : C.leafD; c.lineWidth = 1.6; for (let f = -2; f <= 2; f++) { const a = -TAU / 4 + f * 0.35; c.beginPath(); c.moveTo(x, y); const ex = x + Det.cos(a) * s, ey = y + Det.sin(a) * s * (up ? 1 : 1); c.quadraticCurveTo(x + Det.cos(a) * s * 0.5 + 4, y + Det.sin(a) * s * 0.6, ex, ey); c.stroke(); for (let k = 1; k < 6; k++) { const px = x + (ex - x) * k / 6, py = y + (ey - y) * k / 6; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 4, py - 3); c.moveTo(px, py); c.lineTo(px - 4, py - 3); c.stroke(); } } };
    for (let i = 0; i < 9; i++) fern(X0 + W * (i + 0.5) / 9 + (rnd() - 0.5) * 20, g.rT - 2, 14 + rnd() * 10, true);
    for (let i = 0; i < 8; i++) fern(X0 + W * (i + 0.3) / 8, sc.y + sc.h - 2, 22 + rnd() * 14, true);
    // the broad leaves the frogs sit on
    const leaf = (x, y, s, rot) => { c.save(); c.translate(x, y); c.rotate(rot); const lg = c.createLinearGradient(-s, 0, s, 0); lg.addColorStop(0, C.leafD); lg.addColorStop(0.5, C.leaf2); lg.addColorStop(1, C.leaf); c.fillStyle = lg; c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(-s * 0.2, -s * 0.55, s, 0); c.quadraticCurveTo(-s * 0.2, s * 0.55, -s, 0); c.fill(); c.strokeStyle = 'rgba(20,40,20,.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s * 0.9, 0); c.stroke(); c.restore(); };
    for (const p of g.north) leaf(p[0] + g.fs * 0.1, p[1] + g.fs * 0.06, g.fs * 0.95, -0.08 + (rnd() - 0.5) * 0.3);
    for (const p of g.south) leaf(p[0] + g.fs * 0.1, p[1] + g.fs * 0.06, g.fs * 0.95, 0.06 + (rnd() - 0.5) * 0.3);
    // hanging vines
    c.strokeStyle = 'rgba(40,80,40,.6)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const x = X0 + W * (0.1 + 0.2 * i + rnd() * 0.05); c.beginPath(); c.moveTo(x, sc.y); c.quadraticCurveTo(x + 10, sc.y + sc.h * 0.12, x - 4, sc.y + sc.h * (0.18 + rnd() * 0.12)); c.stroke(); }
  },
  drawWater(c, g) {   // cosmetic: the river, flowing left to right, with drifting ripples
    const C = RV_C, sc = g.sc, t = this.v.t, calm = typeof Fx !== 'undefined' && Fx.calm, s = this.sim.s;
    const dry = s.phase === 'dry' || ((s.phase === 'end' || s.phase === 'over') && this.sim.inZone(s)) ? 1 : 0;
    const wg = c.createLinearGradient(0, g.rT, 0, g.rB); wg.addColorStop(0, C.water2); wg.addColorStop(0.5, C.water); wg.addColorStop(1, C.water2);
    c.fillStyle = wg; c.fillRect(sc.x, g.rT + 2, sc.w, g.rB - g.rT - 2);
    if (dry) { c.fillStyle = 'rgba(92,74,51,.55)'; c.fillRect(sc.x, g.rT + 2, sc.w, (g.rB - g.rT) * 0.22); c.fillRect(sc.x, g.rB - (g.rB - g.rT) * 0.22, sc.w, (g.rB - g.rT) * 0.22); }
    c.strokeStyle = 'rgba(191,220,211,.45)'; c.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) { const y = g.rT + (g.rB - g.rT) * (i + 0.5) / 9, off = calm ? 0 : (t * (18 + i * 3)) % 80; for (let x = sc.x - 80 + off + i * 23 % 60; x < sc.x + sc.w; x += 80) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 10, y - 2, x + 22, y); c.stroke(); } }
  },
  drawLog(c, g) {   // cosmetic: the mossy fallen log, lying on the south bank or across the river
    const v = this.v, e = this.logEnds(v.logA), C = RV_C, dx = e[1][0] - e[0][0], dy = e[1][1] - e[0][1], L = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), r = Math.max(7, g.fs * 0.36);   // cosmetic
    c.save(); c.translate(e[0][0], e[0][1]); c.rotate(ang);
    c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(L / 2, r * 0.9, L / 2 + 4, r * 0.6, 0, 0, TAU); c.fill();
    const lg = c.createLinearGradient(0, -r, 0, r); lg.addColorStop(0, C.logL); lg.addColorStop(0.5, C.log); lg.addColorStop(1, C.logD); c.fillStyle = lg;
    c.beginPath(); c.moveTo(0, -r); c.lineTo(L, -r * 0.85); c.quadraticCurveTo(L + r * 0.5, 0, L, r * 0.85); c.lineTo(0, r); c.quadraticCurveTo(-r * 0.5, 0, 0, -r); c.fill();
    c.strokeStyle = 'rgba(40,25,12,.5)'; c.lineWidth = 1.2; for (let k = 1; k < 7; k++) { const x = L * k / 7; c.beginPath(); c.moveTo(x - 6, -r * 0.7); c.lineTo(x + 8, -r * 0.2); c.stroke(); }
    c.fillStyle = C.moss; for (let k = 0; k < 6; k++) { c.beginPath(); c.ellipse(L * (k + 0.4) / 6, -r * 0.75, r * 0.55, r * 0.3, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#C9A77A'; c.beginPath(); c.ellipse(L, 0, r * 0.35, r * 0.85, 0, 0, TAU); c.fill(); c.strokeStyle = C.logD; c.stroke();   // the cut end with rings
    c.beginPath(); c.ellipse(L, 0, r * 0.18, r * 0.45, 0, 0, TAU); c.stroke();
    c.restore();
    if (v.logA > 0.05 && v.logA < 0.95 && typeof Fx !== 'undefined' && !Fx.calm) { c.fillStyle = 'rgba(220,240,235,.5)'; c.beginPath(); c.arc(e[1][0], e[1][1], 6 + 10 * v.logA, 0, TAU); c.fill(); }
  },
  frogCol(north, k) {   // the bank's look after k changes: from the ancestral green toward orange (north) or teal (south)
    const s = this.sim.s, d = s.mode === 'zone' ? 1 : Math.min(1, k / 7) * (1 - this.v.blend);
    const mix = (a, b, u) => { const A = [1, 3, 5].map(i => parseInt(a.slice(i, i + 2), 16)), B = [1, 3, 5].map(i => parseInt(b.slice(i, i + 2), 16)); return 'rgb(' + A.map((x, i) => Math.round(x + (B[i] - x) * u)).join(',') + ')'; };
    return { col: mix(RV_C.anc, north ? RV_C.orange : RV_C.teal, d), colD: mix(RV_C.ancD, north ? RV_C.orangeD : RV_C.tealD, d), pat: d };
  },
  frog(c, x, y, sz, o) {   // cosmetic: a sitting tree frog in side view, facing right (f = −1 mirrors); toe discs, golden eye, vocal sac
    const L = sz, C = RV_C; c.save(); c.translate(x, y); c.scale(o.f || 1, 1); if (o.alpha != null) c.globalAlpha = o.alpha;
    const col = o.col, colD = o.colD;
    // hind leg folded under the body
    c.fillStyle = colD; c.beginPath(); c.ellipse(-L * 0.2, -L * 0.13, L * 0.27, L * 0.12, -0.35, 0, TAU); c.fill();
    c.strokeStyle = colD; c.lineWidth = L * 0.07; c.lineCap = 'round'; c.beginPath(); c.moveTo(-L * 0.04, -L * 0.04); c.lineTo(-L * 0.36, -L * 0.02); c.lineTo(-L * 0.12, 0); c.stroke();
    // body
    const bg = o.hyb ? c.createLinearGradient(-L * 0.45, 0, L * 0.45, 0) : null;
    if (bg) { bg.addColorStop(0, o.hyb[0]); bg.addColorStop(0.49, o.hyb[0]); bg.addColorStop(0.51, o.hyb[1]); bg.addColorStop(1, o.hyb[1]); }
    c.fillStyle = bg || col; c.beginPath(); c.ellipse(0, -L * 0.24, L * 0.42, L * 0.21, -0.22, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(L * 0.3, -L * 0.37, L * 0.2, L * 0.15, -0.1, 0, TAU); c.fill();   // head
    c.fillStyle = C.belly; c.globalAlpha *= 0.85; c.beginPath(); c.ellipse(L * 0.06, -L * 0.12, L * 0.3, L * 0.08, -0.15, 0, TAU); c.fill(); c.globalAlpha = o.alpha != null ? o.alpha : 1;
    // the bank's pattern: north a dark side stripe, south pale spots (fading in as the banks diverge)
    if (o.pat > 0.05 && !o.hyb) {
      c.save(); c.globalAlpha *= Math.min(1, o.pat * 1.2);
      if (o.north) { c.strokeStyle = 'rgba(40,20,8,.75)'; c.lineWidth = L * 0.05; c.beginPath(); c.moveTo(L * 0.42, -L * 0.42); c.quadraticCurveTo(L * 0.05, -L * 0.36, -L * 0.32, -L * 0.24); c.stroke(); }
      else { c.fillStyle = 'rgba(235,250,240,.85)'; for (const [px, py] of [[-0.18, -0.3], [0.02, -0.36], [-0.05, -0.22], [0.15, -0.28], [-0.28, -0.22]]) { c.beginPath(); c.arc(L * px, L * py, L * 0.035, 0, TAU); c.fill(); } }
      c.restore();
    }
    // front leg with a toe disc, and the hind foot's toe discs
    c.strokeStyle = colD; c.lineWidth = L * 0.06; c.beginPath(); c.moveTo(L * 0.2, -L * 0.2); c.lineTo(L * 0.28, -L * 0.01); c.stroke();
    c.fillStyle = colD; for (const [px, py] of [[0.31, 0], [0.24, 0.01], [-0.14, 0.01], [-0.08, 0.01]]) { c.beginPath(); c.arc(L * px, L * py, L * 0.035, 0, TAU); c.fill(); }
    // vocal sac (males calling)
    if (o.sac > 0) { c.fillStyle = 'rgba(250,240,215,.92)'; c.strokeStyle = colD; c.lineWidth = 1; c.beginPath(); c.ellipse(L * 0.37, -L * 0.25, L * 0.09 * (0.6 + o.sac), L * 0.08 * (0.6 + o.sac), 0, 0, TAU); c.fill(); c.stroke(); }
    // the eye: golden iris, horizontal pupil
    c.fillStyle = colD; c.beginPath(); c.arc(L * 0.33, -L * 0.47, L * 0.095, 0, TAU); c.fill();
    c.fillStyle = C.iris; c.beginPath(); c.arc(L * 0.34, -L * 0.47, L * 0.075, 0, TAU); c.fill();
    c.fillStyle = C.ink; c.beginPath(); c.ellipse(L * 0.34, -L * 0.47, L * 0.055, L * 0.025, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(L * 0.36, -L * 0.49, L * 0.015, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(20,20,10,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(L * 0.48, -L * 0.36); c.quadraticCurveTo(L * 0.38, -L * 0.32, L * 0.24, -L * 0.34); c.stroke();
    c.restore();
  },
  drawFrogs(c, g) {   // cosmetic: seven frogs a bank; calling males swell their vocal sacs and send rings out (closer rings = faster call)
    const s = this.sim.s, v = this.v, k = s.k, calm = typeof Fx !== 'undefined' && Fx.calm;
    const gap = Math.max(0, s.g);
    for (const north of [true, false]) {
      const list = north ? g.north : g.south, look = this.frogCol(north, k);
      list.forEach((p, i) => {
        const call = v.calls.find(q => q.north === north && q.i === i), sac = call ? Math.max(0, Det.sin(Math.min(1, call.t / 0.5) * Math.PI)) : 0;
        let x = p[0], y = p[1];
        if (s.phase === 'fuse' && v.blend > 0 && !calm) { const tx = g.mid[0] + (i - 3) * g.fs * 0.6, ty = north ? g.rT - 6 : g.rB + 10, u = Math.min(1, v.blend * 1.4); x += (tx - x) * u * 0.6; y += (ty - y) * u * 0.6; }
        this.frog(c, x, y, g.fs, { f: x < g.lx ? 1 : -1, col: look.col, colD: look.colD, pat: look.pat, north, sac });
        if (call && !calm) {   // the call: rings from the vocal sac, spacing set by the bank's call (the gap pulls them apart)
          const sp = 7 * (north ? 1 - gap / 100 : 1 + gap / 100), sx = x + (x < g.lx ? 1 : -1) * g.fs * 0.37, sy = y - g.fs * 0.25;
          c.strokeStyle = north ? 'rgba(255,214,170,.8)' : 'rgba(180,240,230,.8)'; c.lineWidth = 1.5;
          for (let r = 0; r < 4; r++) { const rad = (call.t * 30 + r * sp) % 40 + 4; c.globalAlpha = Math.max(0, 1 - rad / 44) * Math.min(1, (1.6 - call.t) * 2); c.beginPath(); c.arc(sx, sy, rad, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(sx, sy, rad, Math.PI - 0.9, Math.PI + 0.9); c.stroke(); }
          c.globalAlpha = 1;
        }
      });
    }
    for (const p of v.sparks) { c.globalAlpha = 1 - p.t / 0.8; c.fillStyle = RV_C.fly; c.beginPath(); c.arc(p.x, p.y - p.t * 16, 3 + p.t * 4, 0, TAU); c.fill(); } c.globalAlpha = 1;
    if (g.sc.w > 300) { Lbl.put('rv-north', this.content.labels.north, g.sc.x + 50, g.rT + 12, { size: 12 }); Lbl.put('rv-south', this.content.labels.south, g.sc.x + 50, g.rB - 12, { size: 12 }); }
  },
  drawHops(c, g) {   // cosmetic: frogs hopping onto the log to meet in the middle (a join) or swarming across (a merger)
    const v = this.v, s = this.sim.s, ce = this.logEnds(1);
    for (const h of v.hops) {
      if (h.t < 0) continue; const u = Math.min(1, h.t / h.d), to = h.to ? h.to : h.swarm ? [g.mid[0] + (h.north ? 1 : -1) * 10, h.north ? g.rB + 6 : g.rT - 6] : [ce[0][0] + (ce[1][0] - ce[0][0]) * (h.north ? 0.62 : 0.38), ce[0][1] + (ce[1][1] - ce[0][1]) * (h.north ? 0.62 : 0.38)];
      const x = h.from[0] + (to[0] - h.from[0]) * u, y = h.from[1] + (to[1] - h.from[1]) * u - Math.abs(Det.sin(u * Math.PI * 3)) * g.fs * 0.5, look = this.frogCol(h.north, s.k);
      this.frog(c, x, y, g.fs * (h.f ? 0.85 : 0.9), { f: to[0] >= h.from[0] ? 1 : -1, col: look.col, colD: look.colD, pat: look.pat, north: h.north, alpha: 1 - Math.max(0, u - 0.85) * 4 });
    }
  },
  drawTads(c, g) {   // cosmetic: hybrid tadpoles beside the log, one parent's look on each half; dying ones grey and sink
    const v = this.v, t = v.t, calm = typeof Fx !== 'undefined' && Fx.calm, s = this.sim.s, n = this.frogCol(true, s.k), so = this.frogCol(false, s.k);
    for (const q of v.tads) {
      const fl = q.ph > 3 ? 1 : 0, sway = calm ? 0 : Det.sin(t * 6 + q.ph) * 3, a = q.dying ? Math.max(0, 1 - q.die / 1.4) : 1;
      const x = q.x + sway, y = q.y + (q.dying ? q.die * 10 : 0), r = Math.max(4, g.fs * 0.2);
      c.save(); c.globalAlpha = a; c.translate(x, y);
      c.strokeStyle = q.dying ? '#7A7F78' : 'rgba(30,40,30,.8)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-r, 0); for (let k = 1; k <= 4; k++) c.lineTo(-r - k * r * 0.6, Det.sin(t * 12 + q.ph + k) * r * 0.35 * (calm ? 0 : 1)); c.stroke();
      c.fillStyle = q.dying ? '#8C918A' : fl ? n.col : so.col; c.beginPath(); c.ellipse(0, 0, r * 1.2, r * 0.85, 0, -TAU / 4, TAU / 4); c.fill();
      c.fillStyle = q.dying ? '#8C918A' : fl ? so.col : n.col; c.beginPath(); c.ellipse(0, 0, r * 1.2, r * 0.85, 0, TAU / 4, TAU * 3 / 4); c.fill();
      c.fillStyle = RV_C.ink; c.beginPath(); c.arc(r * 0.6, -r * 0.2, Math.max(1, r * 0.18), 0, TAU); c.fill();
      c.restore();
    }
  },
  drawClutches(c, g) {   // cosmetic: spawn by the banks (healthy tadpoles wriggle out) and hybrid clutches at the log (two-tone, then grey and sink)
    const v = this.v, s = this.sim.s, t = v.t, n = this.frogCol(true, s.k), so = this.frogCol(false, s.k), calm = typeof Fx !== 'undefined' && Fx.calm;
    for (const q of v.clutches) {
      if (q.t < 0) continue; const u = q.t / 2.2, r = Math.max(7, g.fs * 0.42), a = u > 0.82 ? (1 - u) / 0.18 : 1;
      c.save(); c.globalAlpha = Math.max(0, a);
      if (u < 0.45) {   // the egg mass: clear jelly, dark embryos
        c.fillStyle = 'rgba(235,242,228,.55)'; c.beginPath(); c.ellipse(q.x, q.y, r, r * 0.6, 0, 0, TAU); c.fill();
        for (let k = 0; k < 9; k++) { const ex = q.x + Det.cos(k * 2.4) * r * 0.65 * Math.sqrt((k + 0.5) / 9), ey = q.y + Det.sin(k * 2.4) * r * 0.38 * Math.sqrt((k + 0.5) / 9); c.fillStyle = 'rgba(245,248,238,.9)'; c.beginPath(); c.arc(ex, ey, r * 0.2, 0, TAU); c.fill(); c.fillStyle = RV_C.ink; c.beginPath(); c.arc(ex, ey, r * 0.08, 0, TAU); c.fill(); }
      } else {
        const dead = q.hyb && u > 0.62;
        if (dead) { c.strokeStyle = 'rgba(194,59,44,' + (0.8 * (1 - u)) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(q.x, q.y, r * (1 + (u - 0.62) * 1.5), 0, TAU); c.stroke(); }
        for (let k = 0; k < 5; k++) {
          const fl = k % 2, tx = q.x + (k - 2) * r * 0.5 + (calm || dead ? 0 : Det.sin(t * 5 + k) * 3), ty = q.y + (dead ? (u - 0.62) * r * 3 : (k % 2 ? -1 : 1) * r * 0.25 - (q.hyb ? 0 : (u - 0.45) * r));
          const body = dead ? '#8C918A' : q.hyb ? (fl ? n.col : so.col) : q.north ? n.col : so.col, other = dead ? '#8C918A' : q.hyb ? (fl ? so.col : n.col) : body, tr = r * 0.26;
          c.strokeStyle = dead ? '#7A7F78' : 'rgba(20,30,20,.8)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(tx - tr, ty); c.lineTo(tx - tr * 2.6, ty + (calm || dead ? 0 : Det.sin(t * 14 + k) * tr * 0.5)); c.stroke();
          c.fillStyle = body; c.beginPath(); c.ellipse(tx, ty, tr * 1.2, tr * 0.85, 0, TAU / 4, TAU * 3 / 4); c.fill();
          c.fillStyle = other; c.beginPath(); c.ellipse(tx, ty, tr * 1.2, tr * 0.85, 0, -TAU / 4, TAU / 4); c.fill();
        }
      }
      c.restore();
    }
  },
  drawMist(c, g) {   // cosmetic: slow mist bands drifting over the far bank and the river
    const t = this.v.t, sc = g.sc, calm = typeof Fx !== 'undefined' && Fx.calm;
    c.save(); c.beginPath(); c.rect(sc.x, sc.y, sc.w, sc.h); c.clip();
    for (let i = 0; i < 3; i++) { const y = sc.y + sc.h * (0.18 + i * 0.14), x = sc.x + ((calm ? 0 : t * (6 + i * 3)) + i * sc.w * 0.4) % (sc.w * 1.6) - sc.w * 0.3; c.fillStyle = 'rgba(232,238,234,' + (0.22 - i * 0.04) + ')'; c.beginPath(); c.ellipse(x, y, sc.w * 0.45, sc.h * 0.045, 0, 0, TAU); c.fill(); }
    c.restore();
  },
  drawNight(c, g) {   // cosmetic: frogs breed at night: a moonlit wash and fireflies over the scene
    const v = this.v, sc = g.sc, t = v.t, calm = typeof Fx !== 'undefined' && Fx.calm;
    c.save(); c.globalAlpha = 0.34 * v.night; c.fillStyle = RV_C.night; c.fillRect(sc.x, sc.y, sc.w, sc.h); c.restore();
    c.fillStyle = 'rgba(246,240,200,' + (0.8 * v.night) + ')'; c.beginPath(); c.arc(sc.x + sc.w * 0.86, sc.y + sc.h * 0.09, Math.max(8, sc.w * 0.025), 0, TAU); c.fill();
    if (calm) return; c.fillStyle = RV_C.fly;
    for (let i = 0; i < 12; i++) { const x = sc.x + ((i * 97 + t * 9 * (i % 3 + 1)) % sc.w), y = sc.y + sc.h * (0.1 + ((i * 53) % 60) / 100) + Det.sin(t + i) * 8, a = 0.5 + 0.5 * Det.sin(t * 3 + i * 1.7); c.globalAlpha = a * v.night; c.beginPath(); c.arc(x, y, 1.8, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
  },

  /* ---------- the field notebook panel: the abstract read-outs, beside the biology (D6 decision 10) ---------- */
  rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); },
  drawPanel(c, g) {
    const p = g.pn, s = this.sim.s; if (p.h < 40) return;
    c.fillStyle = RV_C.paper; this.rr(c, p.x, p.y, p.w, p.h, 10); c.fill(); c.strokeStyle = RV_C.leafD; c.lineWidth = 2; c.stroke();
    if (this.sim.inZone(s) || s.phase === 'wait' || (s.mode === 'zone')) this.drawZone(c, g); else this.drawGrid(c, g);
  },
  gridBox(g) {   // where the hybrid gene-pair grid sits in the panel, and where the equations go
    const p = g.pn, s = this.sim.s, kmax = Math.max(6, s.k), two = !g.land;
    const gw = two ? Math.min(p.h - 40, p.w * 0.46) : Math.min(p.w - 30, p.h * 0.5), cs = Math.max(3, Math.floor((gw - 12) / kmax));
    const size = cs * kmax, gx = two ? p.x + 24 : p.x + (p.w - size) / 2 + 6, gy = p.y + 34;
    const eq = two ? { x: p.x + 24 + size + 18, y: p.y + 34, w: p.x + p.w - (p.x + 24 + size + 18) - 8 } : { x: p.x + 14, y: gy + size + 22, w: p.w - 28 };
    return { gx, gy, cs, size, kmax, eq };
  },
  cellXY(i, j) { const b = this.gridBox(this.geo()); return [b.gx + j * b.cs + b.cs / 2, b.gy + i * b.cs + b.cs / 2]; },
  drawGrid(c, g) {   // rows: north changes (orange, striped); columns: south changes (teal, spotted); a cell is one north–south pair
    const s = this.sim.s, v = this.v, L = this.content.labels, b = this.gridBox(g), C = RV_C, p = g.pn;
    Lbl.put('rv-gridT', L.gridT, b.gx + b.size / 2, p.y + 12, { size: 12, pill: false, ink: C.ink });
    const revealing = s.phase === 'reveal' || s.phase === 'fuse' || s.phase === 'species' || s.phase === 'end' || s.phase === 'over';
    for (let i = 0; i < s.k; i++) {   // row and column heads: the change itself, on each bank's colour
      const pr = v.pop['row' + i] ? 1 + v.pop['row' + i] : 1;
      c.fillStyle = C.orange; c.beginPath(); c.arc(b.gx - 8, b.gy + i * b.cs + b.cs / 2, Math.min(5, b.cs * 0.3) * pr, 0, TAU); c.fill(); c.strokeStyle = C.orangeD; c.lineWidth = 1; c.stroke();
      c.fillStyle = C.teal; c.beginPath(); c.arc(b.gx + i * b.cs + b.cs / 2, b.gy - 8, Math.min(5, b.cs * 0.3) * pr, 0, TAU); c.fill(); c.strokeStyle = C.tealD; c.stroke();
    }
    if (s.k) { c.strokeStyle = 'rgba(30,40,30,.35)'; c.lineWidth = 1; c.strokeRect(b.gx - 0.5, b.gy - 0.5, b.cs * s.k + 1, b.cs * s.k + 1); }
    s.cells.forEach((cell, n) => {
      const [i, j, cl] = cell, x = b.gx + j * b.cs, y = b.gy + i * b.cs, shown = revealing && n < s.rev, fl = v.revFlash[i + ',' + j];
      c.fillStyle = shown ? (cl ? C.red : C.ok) : '#9AA395'; c.fillRect(x + 1, y + 1, b.cs - 2, b.cs - 2);   // untested grey, fine pale green, clash red with a cross: apart in luminance (CVD)
      if (shown && cl && b.cs >= 8) { c.strokeStyle = '#FFF4EC'; c.lineWidth = Math.max(1.2, b.cs * 0.12); c.beginPath(); c.moveTo(x + b.cs * 0.28, y + b.cs * 0.28); c.lineTo(x + b.cs * 0.72, y + b.cs * 0.72); c.moveTo(x + b.cs * 0.72, y + b.cs * 0.28); c.lineTo(x + b.cs * 0.28, y + b.cs * 0.72); c.stroke(); }
      if (fl) { c.strokeStyle = 'rgba(20,30,20,' + fl * 1.6 + ')'; c.lineWidth = 2; c.strokeRect(x + 1, y + 1, b.cs - 2, b.cs - 2); }
    });
    for (const key in v.revFlash) { v.revFlash[key] -= 1 / 60; if (v.revFlash[key] <= 0) delete v.revFlash[key]; }
    // the key numbers, plainly: pairs = k × k, expected clashes 0.15 × pairs, hybrid survival 0.55 to the clashes
    const e = b.eq, n = RV.pairs(s.k, s.line), ec = Math.round(s.pc * n * 10) / 10, rows = [];
    if (s.ask || !s.k) rows.push([L.pairsT, Txt.f(L.pairsN, { n })]);
    else rows.push([L.pairsT, s.line ? Txt.f(L.pairsN, { n }) : Txt.f(L.pairsV, { k: s.k, n })], [L.clashT, Txt.f(L.clashV, { n, c: ec })]);
    if (!s.ask && s.k) {
      if (revealing && s.rev >= s.cells.length && s.cells.length) rows.push([L.survT, Txt.f(L.survV, { c: s.cl, w: Math.round(100 * RV.surv(s.cl)) })]);
      else if (revealing) { let cc = 0; for (let q = 0; q < s.rev; q++) cc += s.cells[q][2]; rows.push([L.clashR, String(cc)]); }
      else rows.push([L.survT, Txt.f(L.survE, { c: ec, w: Math.round(100 * Det.exp(RV_LNHV * ec)) })]);   // the shown exponent, so the sum on screen checks
    }
    const lineH = s.ask ? 0 : 18, lh = Math.max(28, Math.min(40, (p.y + p.h - e.y - 8 - lineH) / Math.max(3, rows.length)));   // room for the species line, on a phone too
    rows.forEach((r, i) => { const y = e.y + i * lh; Lbl.put('rv-eqT' + i, r[0], e.x, y, { size: 12, align: 'left', pill: false, ink: '#4A5A4E' }); Lbl.put('rv-eqV' + i, r[1], e.x, y + 15, { size: 15, align: 'left', pill: false, ink: C.ink }); });
    if (!s.ask && e.y + rows.length * lh + 10 < p.y + p.h) Lbl.put('rv-line', L.line, e.x, e.y + rows.length * lh + 2, { size: 12, align: 'left', pill: false, ink: '#A3271B' });
    if (s.ask) this.drawChips(c, g);
    const y0 = e.y + rows.length * lh + 34, room = p.y + p.h - y0;
    if (g.land && room > 120 && s.k > 0) {   // a hybrid in portrait: one parent's look on each half (the picture the grid stands for)
      const nl = this.frogCol(true, s.k), sl = this.frogCol(false, s.k), fl = 0, sz = Math.min(110, room * 0.75, p.w * 0.4);
      this.frog(c, p.x + p.w / 2 - sz * 0.05, y0 + room * 0.5 + sz * 0.3, sz, { f: 1, col: nl.col, colD: nl.colD, hyb: fl ? [nl.col, sl.col] : [sl.col, nl.col], north: true });
      Lbl.put('rv-hyb', L.hyb, p.x + p.w / 2, y0 + 6, { size: 12, pill: false, ink: '#4A5A4E' });
    }
  },
  chipRects(g) {   // the three answers, as big chips under the equations (also dock buttons and keys 1–3)
    const s = this.sim.s; if (!s.ask) return []; const b = this.gridBox(g), e = b.eq, n = s.ask.opts.length, gap = 8;
    const w = Math.min(96, (e.w - gap * (n - 1)) / n), h = 40, y = e.y + 52;
    return s.ask.opts.map((v, i) => ({ x: e.x + i * (w + gap), y, w, h, v }));
  },
  chipAt(x, y) { const R0 = this.chipRects(this.geo()); for (let i = 0; i < R0.length; i++) { const r = R0[i]; if (x >= r.x - 6 && x <= r.x + r.w + 6 && y >= r.y - 6 && y <= r.y + r.h + 6) return i; } return -1; },
  drawChips(c, g) {
    const L = this.content.labels; this.chipRects(g).forEach((r, i) => {
      c.fillStyle = '#FFFFFF'; this.rr(c, r.x, r.y, r.w, r.h, 8); c.fill(); c.strokeStyle = RV_C.leafD; c.lineWidth = 2; c.stroke();
      Lbl.put('rv-chip' + i, Txt.f(L.pairs, { v: r.v }), r.x + r.w / 2, r.y + r.h / 2, { size: 14, pill: false, ink: RV_C.ink });
    });
  },
  drawZone(c, g) {   // the contact zone's numbers: choosy females, the call gap (as two pulse trains), and wasted clutches against the goal
    const s = this.sim.s, L = this.content.labels, p = g.pn, C = RV_C, up = s.mode === 'zone', goal = s.mode === 'zone' ? RV_GOAL.w2 : RV_GOAL.w3;
    const cols = up ? [[L.here, s.p, s.g, RV.waste(s.p, s.g, s.w)], [L.upstream, s.pU, s.gU, RV.waste(s.pU, s.gU, s.w)]] : [[L.here, s.p, s.g, RV.waste(s.p, s.g, s.w)]];
    const lw = Math.min(118, p.w * 0.32), cx0 = p.x + 12 + lw, cw = (p.w - lw - 24) / cols.length, rows = 3, top = p.y + 26, rh = Math.min(g.land ? 96 : 54, (p.h - 34) / rows);
    cols.forEach((col, i) => Lbl.put('rv-zc' + i, col[0], cx0 + cw * (i + 0.5), p.y + 13, { size: 12, pill: false, ink: C.ink }));
    [L.choosyT, L.gapT, L.wasteT].forEach((t, r) => Lbl.put('rv-zr' + r, t, p.x + 12, top + rh * r + rh * 0.42, { size: 12, align: 'left', pill: false, ink: '#4A5A4E' }));
    cols.forEach((col, i) => {
      const x = cx0 + cw * i + 8, w = cw - 16, bh = Math.min(g.land ? 20 : 14, rh * 0.32);
      // choosy females: a bar
      let y = top + rh * 0.3; c.fillStyle = '#D5DBCF'; c.fillRect(x, y, w, bh); c.fillStyle = C.leafD; c.fillRect(x, y, w * Math.max(0, Math.min(1, col[1])), bh);
      Lbl.put('rv-zp' + i, Txt.f(L.pct, { v: Math.round(100 * col[1]) }), x + w / 2, y + bh + 10, { size: 12, pill: false, ink: C.ink });
      // the call gap: the two species' pulse trains, north ticks above, south below; faster pulses sit closer
      y = top + rh * 1.18; const base = Math.max(5, w / 10), gp = col[2] / 100;
      c.strokeStyle = C.orangeD; c.lineWidth = 2; for (let q = 0, xx = x; xx < x + w * 0.62; q++, xx = x + q * base * (1 - gp)) { c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + bh * 0.7); c.stroke(); }
      c.strokeStyle = C.tealD; for (let q = 0, xx = x; xx < x + w * 0.62; q++, xx = x + q * base * (1 + gp)) { c.beginPath(); c.moveTo(xx, y + bh); c.lineTo(xx, y + bh * 1.7); c.stroke(); }
      Lbl.put('rv-zg' + i, Txt.f(L.pct, { v: Math.round(col[2]) }), x + w * 0.82, y + bh * 0.85, { size: 13, pill: false, ink: C.ink });
      // wasted clutches: a bar against the goal line
      y = top + rh * 2.3; const xs = 50, frac = Math.max(0, Math.min(1, col[3] / xs)), pop = this.v.pop.waste && i === 0 ? 1 : 0;
      c.fillStyle = '#D5DBCF'; c.fillRect(x, y, w, bh); c.fillStyle = col[3] <= goal ? C.leaf : C.red; c.fillRect(x, y - pop, w * frac, bh + pop * 2);
      const gx = x + w * goal / xs; c.strokeStyle = C.ink; c.lineWidth = 2; c.setLineDash([3, 2]); c.beginPath(); c.moveTo(gx, y - 4); c.lineTo(gx, y + bh + 4); c.stroke(); c.setLineDash([]);
      Lbl.put('rv-zw' + i, Txt.f(L.pct, { v: Math.round(col[3]) }), x + w / 2, y + bh + 10, { size: 13, pill: false, ink: C.ink });
      if (i === 0 && w > 90) Lbl.put('rv-zgoal', Txt.f(L.goal, { g: goal }), Math.min(x + w - 20, gx + 26), y - 9, { size: 12, pill: false, ink: C.ink });
    });
  },

  /* ---------- the live graph (strip) and the debrief chart ---------- */
  notes() {
    const s = this.sim.s, L = this.content.labels, cap = this.content.captions, stats = [];
    if (this.sim.inZone(s) || s.mode === 'zone') {
      stats.push([L.sNight, String(s.hist.length), cap.mNight], [L.sChoosy, Math.round(100 * s.p) + '%', cap.mChoosy], [L.sGap, Math.round(s.g) + '%', cap.mGap], [L.sWaste, Math.round(RV.waste(s.p, s.g, s.w)) + '%', cap.mWaste]);
      if (s.mode === 'zone') stats.push([L.sUp, Math.round(RV.waste(s.pU, s.gU, s.w)) + '%', cap.mUp]);
      return { stats, charts: [this.wasteSpec()] };
    }
    const n = RV.pairs(s.k, s.line);
    stats.push([L.sK, String(s.k), cap.mK], [L.sPairs, String(n), cap.mPairs], [L.sClash, (s.pc * n).toFixed(1), cap.mClash], [L.sSurv, Math.round(100 * RV.tsurv(s.k, s.pc, s.line)) + '%', cap.mSurv], [L.sFused, String(s.fused), cap.mFused]);
    return { stats, charts: [this.clashSpec()] };
  },
  clashSpec() {   // expected clashes against changes per bank: the curve bends upward (p·k²); a straight line for comparison; found clashes at each join
    const s = this.sim.s, L = this.content.labels, K = Math.max(6, s.k, ...s.joins.map(j => j.k)), exp = [], lin = [];
    for (let k = 0; k <= K; k++) { exp.push([k, Math.round(s.pc * RV.pairs(k, s.line) * 100) / 100]); lin.push([k, Math.round(s.pc * k * 100) / 100]); }
    const cur = []; for (let k = 0; k <= s.k; k++) cur.push([k, Math.round(s.pc * RV.pairs(k, s.line) * 100) / 100]);
    const found = s.joins.filter(j => j.w != null).map(j => [j.k, j.cl]);
    const spec = { type: 'trace', title: L.tClash, x: { lo: 0, hi: K, label: L.ax }, y: { lo: 0, label: L.clashR }, series: [{ d: cur, ink: 'ink', label: L.expected }], ghost: [{ d: lin, label: L.straight }], frame: 'designed' };
    if (found.length) spec.series.push({ d: found, ink: 'sel', label: L.found });
    if (s.saw6 || s.phase === 'end' || s.phase === 'over') spec.ghost.push({ d: exp, label: '' });
    return spec;
  },
  wasteSpec() {   // wasted clutches night by night: at the log (solid) and upstream (dashed, L2); the goal hatched
    const s = this.sim.s, L = this.content.labels, goal = s.mode === 'zone' ? RV_GOAL.w2 : RV_GOAL.w3, here = s.wasteH.map((x, i) => [i + 1, x]);
    const spec = { type: 'trace', title: L.tWaste, x: { lo: 0, hi: Math.max(s.E - (s.mode === 'boss' ? Math.max(0, s.joinE) : 0), here.length, 4), label: L.axN }, y: { lo: 0, hi: 50, label: '%' }, target: { lo: 0, hi: goal },
      series: [{ d: [[0, Math.round(10 * RV.waste(RV_R.p0, s.g0, s.w)) / 10]].concat(here), ink: 'sel', label: L.here }], frame: 'designed' };
    if (s.mode === 'zone') spec.ghost = [{ d: [[0, Math.round(10 * RV.waste(RV_R.p0, s.g0, s.w)) / 10]].concat(s.wasteU.map((x, i) => [i + 1, x])), label: L.upstream }];
    return spec;
  },
  debrief() { const s = this.sim.s; return s.mode === 'zone' || s.contact ? this.wasteSpec() : this.clashSpec(); }
};
V2.push(CH_RIVER_V2);

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.river = RV_TEXT.take;
  MODEL.river = 'Two tree frog populations split by a river: each bank fixes one gene change an epoch, and each north–south pair clashes in hybrids with chance 0.15. Then contact zones where choosy females waste fewer clutches. Clash and survival numbers are designed.';
  RECALL.river = { q: 'After 4 changes per bank there are 16 untested pairs. How many after 8?', opts: [['a', '32'], ['b', '64'], ['c', '24']], ans: 'b', why: 'Untested pairs are k × k: 8 × 8 = 64. Doubling the time apart quadruples them.' };
  BRIDGE.river = 'The Royal Line followed one gene down a family. Here thousands of generations of changes pile up between two banks.';
  if (TRANSFER.river) delete TRANSFER.river;
}
