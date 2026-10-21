/* ================= v2/royal.js: The Royal Line (Act 3, after Equilibrium; D3 §5.2) =================
   Two rooms (D6 addendum 7): Thomas Hunt Morgan's 1910 fly room (milk bottles of Drosophila under a brass lamp, walnut and
   lamplight) and a Victorian portrait gallery (sepia portraits in gold frames on a burgundy wall). Role: investigator in L1,
   L2 and the boss; the selective environment (the lamp) in L3 (D1 G1).
     L0 Morgan's bottles   drag a female bottle onto a male bottle to cross them; flies hatch into four trays (sex × eye).
                           Goals: F1, F2, a white-eyed daughter, the reverse cross, within six vials (Morgan 1910).
     L1 The zigzag         red-eyed females meet white-eyed males in a cage of 1,000 of each sex beside an autosomal control;
                           tap the next white share in sons and daughters; the gap halves and flips sign; the mean
                           (2q_f + q_m)/3 never moves. Transfer: where a new cage settles.
     L2 The lamp           sweep a lamp beam over the courtship dish: white-eyed males under it court poorly (selection on
                           males only); mutation (×1000) brings white back; predict the male share at balance (≈ 3μ/s).
     L3 The Queen's        boss: six women in Queen Victoria's family (haemophilia B, an F9 variant; Rogaev et al. 2009).
        carriers           Set each one's carrier chance before and after her sons are shown; the exact Bayesian answer is
                           revealed on a brass plaque. Inverts "a carrier is a carrier": evidence moves the odds. Transfer
                           gesture: red–green colour blindness, q in men and q² in women.
   Notation (D2 §15): q is the white (w) allele's share of X copies; q_f in females (two X each), q_m in males (one X, from
   the mother). Allele read-outs use the fixed inks (blue +, amber w) only inside jars and charts (D6 addendum 7).
   Code shape (API_v2 §9): a headless sim (plain JSON; R(), Det, WF only; a run is (seed, level, actions)); all words in
   RY_TEXT; the view juices from Sim.run's events only. Top-level code touches only legacy objects and lower-numbered v2
   files; engine calls at run time sit behind typeof guards. Under ?v1=1 the learning-layer lines at the foot are skipped. */

/* ---------- all words (API_v2 §9.2); tests/lint_text.js checks every budget ---------- */
const RY_TEXT = {
  intro: {   // the opening card (D6 addendum 8)
    game: 'You work in Thomas Hunt Morgan’s fly room in 1910, then in a gallery of royal portraits. You cross flies, watch a gene spread, and read a family tree.',
    biology: 'Females carry two X chromosomes; males carry one, from their mother. A recessive variant on the X therefore shows in far more sons than daughters.',
    how: 'Drag a female bottle onto a male bottle to cross them, and drag on the chart to predict. Later you sweep a lamp and set carrier odds.'
  },
  firstWords: 'Morgan’s white-eyed male waits on the shelf. Drag the wild red-eyed female bottle onto him to cross them.',
  hud: {
    pick: 'Drag a female bottle onto a male bottle to cross them.',
    next: 'Next: {goal}. Drag a female bottle onto a male bottle.',
    hatch: 'The flies hatch and drop into trays by sex and eye colour.',
    askA: 'F1 daughters × red males. What share of their sons will have white eyes?',
    askB: 'The reverse cross: white-eyed females × red males. What share of sons will be white?',
    sorted: 'Sorted. New bottles join the shelf.',
    cage: 'Red-eyed females meet white-eyed males. Watch the white X spread through the cage.',
    askM: 'What share of the sons’ X copies will carry white? Drag on the chart.',
    askF: 'And the daughters’ X copies? Drag your guess, then Lock in.',
    run: 'The generations run. Watch the gap between the sexes.',
    askT: 'White X: {f}% in females, {m}% in males. Where will both sexes settle?',
    trun: 'The new cage runs.',
    court: 'Sweep the lamp over white-eyed males. In bright light they court poorly.',
    courtU: 'Tap to flash the lamp on white-eyed males. Each flash costs battery.',
    bred: 'The next generation hatches.',
    askBal: 'From now the lamp catches half the white males. Where will their share settle?',
    auto: 'Sixty generations under the lamp. Watch the white males.',
    prior: '{name}. Before her sons are known, drag her chance of being a carrier.',
    sons: 'Her sons step forward.',
    nosons: 'She had no children.',
    post: 'Now set her carrier chance again, knowing her sons.',
    reveal: 'The exact chance is on the plaque.',
    cv: 'About 8% of northern European men are red–green colour blind. Predict the share of women.',
    whatif: 'What if? The cage runs again with one thing changed.',
    over: 'Done.'
  },
  whispers: {
    drag: 'Drag the marker first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No prediction this time.',
    pickF: 'Start from a female bottle.', drop: 'Drop it on a male bottle.', noVials: 'No vials left.', stumble: 'He stumbles and loses her.',
    battery: 'The lamp battery is flat.', seal: 'Sealed.', wd: 'White-eyed daughters at last!', setFirst: 'Drag the brass slider first.',
    done: 'All four crosses done.', obligate: 'Her father had haemophilia.', aff: 'A son with haemophilia.', fine: 'An unaffected son.'
  },
  labels: {
    wildF: 'Wild ♀', wildM: 'Wild ♂', mutM: 'White ♂', cF: 'Cross {n} ♀', wF: 'White ♀',
    fr: '♀ red', fw: '♀ white', mr: '♂ red', mw: '♂ white', vials: 'Vials',
    g1: 'F1 hatched', g2: 'F2 hatched', g3: 'White daughter', g4: 'Reverse cross',
    goal1: 'the F1', goal2: 'the F2', goal3: 'a white-eyed daughter', goal4: 'the reverse cross',
    lock: 'Lock in', breed: 'Breed now', seal: 'Seal', faster: 'Faster', crossN: 'Cross {n}', battery: 'Battery', gen: 'Generation {n}',
    ctl: 'Autosome cage', xcage: 'X cage', fem: '♀ X copies', male: '♂ X copies', carrier: 'carrier', notc: 'not carrier',
    aff: 'haemophilia', none: 'no children', chance: 'Carrier chance', xN: 'Mutation ×1000', exact: 'exact {p}%', youP: 'you {p}%',
    obligate: 'father affected', newcage: 'New cage', dish: 'Courtship dish', wm: 'white ♂ {n}%', wfem: 'white ♀ {n}%',
    q: 'q', mother: 'mother', father: 'father', plus: '+{n}', pct: '{n}%', ask: 'predict', gallery: 'Victoria’s line'
  },
  interesting: {
    nowhite: 'No white-eyed daughters appeared. A daughter needs a white X from both parents: a white-eyed father and a mother carrying white.',
    norev: 'You made white-eyed females but never crossed them with red males. That reverse cross gives every son white eyes.',
    nof2: 'You skipped crossing red F1 daughters with red males. That F2 shows white eyes only in sons.',
    fathers: 'You expected sons to copy their white-eyed fathers. A son gets his only X from his mother; his father gives a Y.',
    midpoint: 'You split the difference between the sexes. Females hold two X copies for every male one, so the settling point leans their way.',
    dim: 'The lamp caught fewer than half the white males it could. Sweep where the white eyes are, before the battery fades.',
    low: 'You expected the lamp to nearly clear white. Copies in carrier females never meet the lamp, and new mutations keep arriving.',
    high: 'You expected more white males than the lamp allows. It removes half of them each generation; carriers and mutation replace them.',
    sons: 'Unaffected sons are evidence. Each one halves the carrier side of the odds before you renormalise.',
    father: 'A daughter of a man with haemophilia always carries it. The only X he can give her carries the variant.',
    grand: 'A granddaughter’s chance starts at half of her mother’s chance, not half of certainty.',
    cvmiss: 'Women show it only with the variant on both X copies: about q², not q, of them.'
  },
  live: {
    ask: 'Prediction open. Press P, then the arrows.', hatch: '{n} flies hatched.', gen: 'Generation {n}. White X: females {f}%, males {m}%.',
    court: 'Generation {n}. {w} white-eyed males in the dish.', caseL: '{name}. Set her carrier chance.', son: '{n}: {a}.'
  },
  data: {
    vials: ['Vials left', '{n}', 'Each cross uses one.'], crosses: ['Crosses run', '{n}', 'Of six vials.'],
    qf: ['White X in females', '{p}%', 'Two X copies in each female.'], qm: ['White X in males', '{p}%', 'One X in each male.'],
    gap: ['Gap', '{d} points', 'Females minus males.'], caught: ['Caught', '{a} of {b}', 'White males under the lamp, all rounds.'],
    bat: ['Battery', '{p}%', 'This round.'], score: ['Within 10 points', '{n} of {m}', 'Your carrier odds against the exact ones.'],
    titles: { sons: 'White sons by cross', hatch: 'This hatch', zig: 'White X share', copies: 'X copies now', inc: 'White-eyed share', where: 'Where white X sits', odds: 'Carrier odds', err: 'Your error', cv: 'Women affected' },
    ax: { share: 'white sons', cross: 'cross', gen: 'generation', p: 'chance', pct: 'women', judg: 'judgment', n: 'flies', sh: 'share' },
    lines: { fem: 'females', male: 'males', ctl: 'autosome', pbar: 'average', exp: 'expected', you: 'you', inF: 'in females', inM: 'in males',
      exact: 'exact', prior: 'before sons', post: 'after sons', daus: 'daughters', sons: 'sons', bal: 'balance', wm: 'white males', wf: 'white females', ten: '10 points' }
  },
  levers: { auto: 'Autosomal gene', flip: 'White females first', nomut: 'No new mutations', all: 'Catch every white' },
  whatifBody: {
    auto: 'The same cage, with the gene on an autosome instead. Both sexes reached {a}% white in one generation and stayed there. On the X the sexes leapfrogged for generations.',
    flip: 'White-eyed females with red-eyed males this time. The cage settled near {a}% white, two-thirds of the way to the females’ start. Females hold two of every three X copies.',
    nomut: 'No new mutations. After the lamp’s sixty generations {a}% of males had white eyes, against {b}% with mutation. Selection on males alone removes white slowly.',
    all: 'The lamp caught every white male. Their share still settled near {a}%, about three times the mutation rate. Carrier mothers and new mutations keep making white sons.'
  },
  take: 'A recessive gene on the X shows in sons, hides in daughters, and responds slowly to selection.',
  body: 'Your carrier odds were within 10 points of the exact answer {n} times out of {m}. Each unaffected son halved the carrier side of the odds. A son with haemophilia made his mother a certain carrier.',
  law: { title: 'Sons show, daughters carry' },
  boss: { inverts: 'A carrier is not fixed in advance: each son changes the odds.' },
  stars: {
    discover: 'Run Morgan’s crosses, work the lamp, and spot the certain carriers.',
    predict: 'Predict the crosses, the zigzag and the balance, in two of three levels.',
    transfer: 'Find where a new cage settles, and read the royal pedigree exactly.'
  },
  levelStars: [
    { discover: 'Get a white-eyed daughter and run the reverse cross within six vials.', predict: 'Predict the white sons of both key crosses.' },
    { predict: 'Land four of five zigzag predictions inside the band.', transfer: 'Predict where a new cage settles.' },
    { discover: 'Catch at least half the white-eyed males under the lamp.', predict: 'Predict the balance within a factor of 1.5.' },
    { discover: 'Mark every certain carrier, and lower the odds after unaffected sons.', transfer: 'Land 11 of 12 odds within 10 points, and the colour-blind share.' }
  ],
  levelTake: [
    'Sons show the X their mother gave. The reverse cross differs because males have one X.',
    'Sons copy their mothers; daughters average both parents. The gap halves and flips each generation.',
    'Selection on males alone leaves white lingering: two of every three copies hide in females.'
  ],
  levelBody: [
    'Your F2 sons were {a}% white-eyed, the daughters {b}%. In the reverse cross {c}% of sons had white eyes. The gene sits on the X, and a male carries one copy, from his mother.',
    'Your cage’s gap between the sexes went from {a} to {b} points in ten generations. Both settled near {c}%. That is the average over all X copies: two in each female, one in each male.',
    'You caught {a}% of the white males in the dish. Then white-eyed males settled near {b}%, and white-eyed females near {c}%. That is q in males, about q² in females.'
  ],
  model: [
    { level: 0, simulated: 'Bottles of flies crossed in batches. Each hatch gives 40 flies. Sex and eye colour are drawn at random, by the rules for a gene on the X.',
      simplification: 'A new bottle stands for its class, with the expected mix of genotypes. White-eyed flies survive as well as red-eyed ones.',
      params: [{ name: 'flies per hatch', value: 40, tag: 'designed' }, { name: 'vials', value: 6, tag: 'designed' }, { name: 'white allele', value: 'recessive, on the X', tag: 'realistic' }],
      cannot: 'Morgan’s real F2 had fewer white-eyed flies than expected, because white-eyed flies survive less well.',
      nature: 'Morgan found one white-eyed male in 1910. His F2 had 3,470 red-eyed flies and 782 white-eyed ones, all of them males.',
      contested: false, refs: ['morgan1910'] },
    { level: 1, simulated: 'A cage of 1,000 flies of each sex. Each daughter takes an X from each parent; each son takes his X from his mother.',
      simplification: 'Random mating, no selection, and generations that do not overlap. A second cage carries the same variant on an autosome.',
      params: [{ name: 'flies of each sex', value: 1000, tag: 'designed' }, { name: 'start', value: 'red females, white males', tag: 'designed' }],
      cannot: 'Overlapping generations, which smooth the zigzag in real populations.',
      nature: 'In real populations the sexes reach the same X-linked frequencies within a few generations of mixing.',
      contested: false, refs: ['hartl2007'] },
    { level: 2, simulated: 'The same cage under a lamp. White-eyed males caught by the beam fail to mate, and new white mutations arise each generation.',
      simplification: 'Only males are selected. The flies in the dish stand for the whole cage. After five rounds the lamp catches half of white males.',
      params: [{ name: 'mutation to white', value: '1 in 100 copies', tag: 'xN', real: 'about 1 in 100,000 per gene per generation, or fewer' }, { name: 'selection on white males', value: '50% after five rounds', tag: 'designed' }, { name: 'flies of each sex', value: 1000, tag: 'designed' }],
      cannot: 'The poorer survival of white-eyed flies of both sexes, or mosaic carrier females.',
      nature: 'White-eyed Drosophila males mate less often than red-eyed ones, and laboratory cages lose the white allele over generations.',
      contested: false, refs: ['sturtevant1915', 'reed1950', 'haldane1935'] },
    { level: 3, simulated: 'Six women in Queen Victoria’s family. Each carrier chance is computed exactly from her parents, then from her sons.',
      simplification: 'No new mutations after Victoria. Sons who died in infancy are left out. Every man with the variant shows haemophilia B.',
      params: [{ name: 'pedigree', value: 'Queen Victoria’s descendants', tag: 'realistic' }, { name: 'variant', value: 'F9, haemophilia B', tag: 'realistic' }, { name: 'colour blindness in men', value: '8%', tag: 'realistic' }],
      cannot: 'X inactivation, which makes some carrier women bleed more easily than others.',
      nature: 'In 2009, DNA from the Romanov remains showed the royal disease was haemophilia B, an F9 variant. Alexandra carried it; Alexei had it.',
      contested: false, refs: ['rogaev2009', 'birch2012'] }
  ],
  why: {
    real: ['Haemophilia B lowers clotting factor IX. In Victoria’s family it passed through carrier daughters to sons in several royal houses. No cases are known among her ancestors, so it may have begun as a new mutation.',
      'About 8% of northern European men have red–green colour blindness, but only about 0.4% of women. Two different genes are involved, so a woman with one variant at each usually sees normally.'],
    maths: ['A daughter of a carrier starts at ½. Each unaffected son multiplies the carrier side by ½. With n such sons her chance is 1 ÷ (1 + 2ⁿ). One affected son makes it certain.',
      'Suppose a share q of X copies carry a variant. Then a share q of men show it, but only q² of women. With q = 0.08 that is 0.64% of women.']
  },
  levelWhy: [
    { real: ['Morgan found the white-eyed male in May 1910. These crosses tied a gene to a particular chromosome for the first time.'],
      maths: ['A son’s X comes from his mother. So the share of white sons equals the white share of the mothers’ X copies. A daughter needs white from both parents.'] },
    { real: ['Real populations mix generations, so the zigzag is damped further. The sexes still match within a few generations.'],
      maths: ['q_m′ = q_f and q_f′ = (q_f + q_m)/2. The gap q_f − q_m becomes −½ of itself each generation. The average (2q_f + q_m)/3 never moves.'] },
    { real: ['In 1935 Haldane used this balance to estimate a human mutation rate. He started from how often boys with haemophilia are born.'],
      maths: ['Each generation selection removes about s × q ÷ 3 white copies, since only males show it. Mutation adds μ. They balance when q ≈ 3μ/s.'] }
  ]
};

/* ---------- the boss pedigree: six women, their parents and their sons (realistic; Rogaev et al. 2009 for the variant) ----------
   mother: a case id or 'victoria' (a known carrier: her son Leopold had haemophilia); fatherAff: her father had haemophilia.
   Sons who died in infancy are left out (MODEL). Victoria's other children and the wider family are outside the model. */
const RY_CASES = [
  { id: 'alice', name: 'Princess Alice', yrs: '1843–1878', mother: 'victoria', sons: [['Ernst Ludwig', 0], ['Friedrich', 1]], look: 1 },
  { id: 'helena', name: 'Princess Helena', yrs: '1846–1923', mother: 'victoria', sons: [['Christian Victor', 0], ['Albert', 0]], look: 2 },
  { id: 'hv', name: 'Helena Victoria', yrs: '1870–1948', mother: 'helena', sons: [], look: 3 },
  { id: 'albany', name: 'Alice of Albany', yrs: '1883–1981', mother: null, fatherAff: 'Leopold', sons: [['Rupert', 1]], look: 4 },
  { id: 'voh', name: 'Victoria of Hesse', yrs: '1863–1950', mother: 'alice', sons: [['George', 0], ['Louis', 0]], look: 5 },
  { id: 'alix', name: 'Alix of Hesse', yrs: '1872–1918', mother: 'alice', sons: [['Alexei', 1]], look: 6 }
];
const RY_LV = ['cross', 'cage', 'lamp', 'gallery'];
/* timings in seconds: hatch per fly, a cage generation, auto generations, the courtship round, an ask's backstop, a son's walk-in */
const RY_T = { dt: 1 / 30, hatch: 0.1, sorted: 0.9, gen: 1.25, run: 0.75, trun: 0.4, court: 6, bred: 1.1, auto: 0.11, askMax: 40, son: 0.85, reveal: 2.4, beamR: 0.14, expo: 0.2 };
/* the fly room's colours (view only): walnut, brass, lamplight, cream glass, banana mash; the gallery's burgundy and gold */
const RY_C = { wall: '#2A2019', wall2: '#3A2B20', bench: '#7A5534', bench2: '#5C3F27', brass: '#C9A04A', brassD: '#8C6A2A', lamp: '#FFE2A6',
  glass: 'rgba(222,232,226,0.28)', glassE: 'rgba(240,246,242,0.75)', mash: '#D9C27A', plug: '#EFE7D6', red: '#A8332B', white: '#F6F3EC', body: '#B98E52', band: '#4A3624',
  bord: '#5E1F2B', bord2: '#7A2E3E', gold: '#C9A24E', goldD: '#8A6A2C', sepia: '#C8B08A', sepiaD: '#6E5638', paper: '#EFE6D2', ink: '#1B1612' };

const CH_ROYAL_V2 = {
  id: 'royal', v2: true, role: 'investigator', place: 'lab',
  accent: '#7A2E3E',   // burgundy, from the gallery wall: the chapter's chrome tint and intro card (D6 addendum 7)
  plan: ['The Royal Line', 'X-linked inheritance'],
  intro: { goal: 'Follow a gene on the X from Morgan’s flies to a royal family tree.' },
  content: RY_TEXT,
  P: {
    N: { v: 1000, tag: 'designed', min: 200, max: 5000, label: 'flies of each sex' },
    brood: { v: 40, tag: 'designed', min: 10, max: 200, label: 'flies per hatch' },
    vials: { v: 6, tag: 'designed', min: 4, max: 12, label: 'vials' },
    mu: { v: 0.01, tag: 'xN', min: 0, max: 0.05, real: 'about 1 in 100,000 per gene per generation, or fewer', label: 'mutation to white' },
    s: { v: 0.5, tag: 'designed', min: 0.1, max: 1, label: 'selection on white males' }
  },
  levels: [
    { name: 'Morgan’s bottles', adds: 'sex: the reciprocal cross', codes: ['X1'], minutes: 4 },
    { name: 'The zigzag', adds: 'a population over generations', codes: ['X2'], minutes: 4 },
    { name: 'The lamp', adds: 'selection on males only', codes: ['X3'], minutes: 4 },
    { name: 'The Queen’s carriers', adds: 'evidence from sons', codes: ['X4'], minutes: 5 }
  ],
  keys: { 1: 'pick a bottle (1–7)', Space: 'beam or faster', ArrowLeft: 'move beam or slider', Enter: 'lock in or seal', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why do X-linked recessive conditions show far more often in men?', 'Why does selection on males alone remove a recessive X-linked allele slowly?', 'This pedigree ignores new mutations and X inactivation. When would that mislead a counsellor?'], pool: 'trace' },
  starTraits: ['eye'],
  encodings: [   // eye colour reads by luminance (dark red against bright white); sex by abdomen shape and the ♀/♂ trays; no hue carries a score alone
    { k: 'eye', rgb: [168, 51, 43], channels: ['colour', 'luminance'] }, { k: 'white', rgb: [246, 243, 236], channels: ['colour', 'luminance'] },
    { k: 'aff', rgb: [27, 22, 18], channels: ['shape', 'luminance', 'letter'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: RY_T.dt, s: null,
    P() { return CH_ROYAL_V2.P; },
    reset(level, o) {
      o = o || {};
      if (o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.lever(o.thaw.lever); return; }
      const n = Math.max(0, Math.min(3, level | 0));
      this.s = { level: n, kind: RY_LV[n], phase: 'run', t: 0, unt: false, whatif: null, auto: false, asks: [], pred: {}, exp: {}, tol: {}, hits: {}, voids: {}, ask: null, resume: null, log: [] };
      const s = this.s, ev = [];
      if (n === 0) this.crossInit(s); else if (n === 1) this.cageInit(s); else if (n === 2) this.lampInit(s, ev); else this.galInit(s, ev);
    },
    r6: x => Math.round(x * 1e6) / 1e6,
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt;
      if (s.phase === 'ask') { if (!s.unt && !s.auto && s.t >= RY_T.askMax) this.commit(s, ev, s.ask.id, null); return ev; }
      if (s.kind === 'cross') this.crossStep(s, ev); else if (s.kind === 'cage') this.cageStep(s, ev); else if (s.kind === 'lamp') this.lampStep(s, ev); else this.galStep(s, ev);
      return ev;
    },

    /* ---------- L0: Morgan's bottles ---------- */
    crossInit(s) {
      s.stocks = [{ id: 'wf', sex: 'f', g: [1, 0, 0], lab: 'wildF', white: false }, { id: 'wm', sex: 'm', g: [1, 0], lab: 'wildM', white: false }, { id: 'mm', sex: 'm', g: [0, 1], lab: 'mutM', white: true }];
      s.left = this.P().vials.v; s.crosses = []; s.cur = null; s.goals = { f1: 0, f2: 0, wf: 0, rev: 0 }; s.phase = 'pick'; s.t = 0;
    },
    stock(s, id) { return s.stocks.find(x => x.id === id) || null; },
    qOf(st) { return st.sex === 'f' ? st.g[1] / 2 + st.g[2] : st.g[1]; },   // the white share of a stock's X copies
    typeOf(F, M) { const qf = this.qOf(F), qm = this.qOf(M); if (qf === 0 && qm === 1) return 'f1'; if (!F.white && qf > 0 && qm === 0) return 'f2'; if (F.white && qm === 0) return 'rev'; if (qf > 0 && qm === 1) return 'back'; return 'other'; },
    cross(s, ev, fi, mi) {
      if (s.phase !== 'pick') return;
      if (s.left <= 0) { ev.push({ k: 'novials' }); return; }
      const F = this.stock(s, fi), M = this.stock(s, mi); if (!F || !M || F.sex !== 'f' || M.sex !== 'm') { ev.push({ k: 'badcross' }); return; }
      s.left--; const qf = this.r6(this.qOf(F)), qm = this.qOf(M), type = this.typeOf(F, M);
      const c = { no: s.crosses.length + 1, f: F.id, m: M.id, qf, qm, fw: F.white, type, kids: [0, 0, 0, 0], n: this.P().brood.v, i: 0 };
      s.cur = c; s.crosses.push(c); ev.push({ k: 'cross', f: F.id, m: M.id, no: c.no });
      if (!s.auto && type === 'f2' && s.asks.indexOf('a') < 0 && qf >= 0.3) this.openAsk(s, ev, 'a', 'x', 0, 1, 0.12, 0, qf, 'hatch', c.no);
      else if (!s.auto && type === 'rev' && s.asks.indexOf('b') < 0) this.openAsk(s, ev, 'b', 'x', 0, 1, 0.12, 0, 1, 'hatch', c.no);
      else { s.phase = 'hatch'; s.t = 0; }
    },
    crossStep(s, ev) {
      if (s.phase === 'sorted') { if (s.t >= RY_T.sorted) { const g = s.goals; if ((g.f1 && g.f2 && g.wf && g.rev) || s.left <= 0) { s.phase = 'over'; ev.push({ k: 'over' }); } else { s.phase = 'pick'; s.t = 0; ev.push({ k: 'pick' }); } } return; }
      if (s.phase !== 'hatch') return;
      if (s.t < (s.ff ? RY_T.hatch / 3 : RY_T.hatch)) return; s.t = 0;
      const c = s.cur, F = this.stock(s, c.f), M = this.stock(s, c.m);
      const female = R() < 0.5, u = R(), mg = u < F.g[0] ? 0 : u < F.g[0] + F.g[1] ? 1 : 2, ma = mg === 0 ? 0 : mg === 2 ? 1 : (R() < 0.5 ? 1 : 0);
      let cls; if (female) { const pa = R() < M.g[1] ? 1 : 0; cls = ma && pa ? 1 : 0; } else cls = ma ? 3 : 2;
      c.kids[cls]++; c.i++; ev.push({ k: 'hatch', cls, i: c.i });
      if (c.i >= c.n) this.sorted(s, ev);
    },
    sorted(s, ev) {
      const c = s.cur, qf = c.qf, qm = c.qm, pww = qf * qm, phet = qf * (1 - qm) + (1 - qf) * qm, phom = (1 - qf) * (1 - qm);
      if (c.type === 'f1') s.goals.f1 = 1; if (c.type === 'f2') s.goals.f2 = 1; if (c.type === 'rev') s.goals.rev = 1;
      const add = (sex, g, white) => {
        g = g.map(x => this.r6(x)); if (s.stocks.some(x => x.sex === sex && x.g.every((v, i) => Math.abs(v - g[i]) < 1e-6))) return;
        const st = { id: 'c' + c.no + (sex === 'f' ? (white ? 'w' : 'r') : (white ? 'W' : 'R')), sex, g, lab: white ? 'wF' : 'cF', no: c.no, white };
        s.stocks.push(st); ev.push({ k: 'stock', id: st.id, white });
        if (sex === 'f' && white && !s.goals.wf) { s.goals.wf = 1; ev.push({ k: 'wd' }); }
        const fem = s.stocks.filter(x => x.sex === 'f'); if (fem.length > 5) { const old = fem.find(x => x.id !== 'wf' && !x.white && x.id !== st.id); if (old) s.stocks.splice(s.stocks.indexOf(old), 1); }
      };
      if (c.kids[0] > 0 && phom + phet > 0) add('f', [phom / (phom + phet), phet / (phom + phet), 0], false);
      if (c.kids[1] > 0) add('f', [0, 0, 1], true);
      if (c.kids[2] > 0) add('m', [1, 0], false);
      if (c.kids[3] > 0) add('m', [0, 1], true);
      void pww; s.phase = 'sorted'; s.t = 0; ev.push({ k: 'sorted', no: c.no, kids: c.kids.slice() });
    },

    /* ---------- L1: the zigzag (X-linked cage beside an autosomal control) ---------- */
    cageInit(s) {
      const N = this.P().N.v; s.N = N;
      s.cage = { F: [N, 0, 0], M: [0, N] };                 // red-eyed (homozygous) females with white-eyed males
      s.ctl = { F: [N, 0, 0], M: [0, 0, N] };               // the same start with the variant on an autosome (males diploid)
      s.g = 0; s.hist = [this.cageStat(s)]; s.phase = 'gen'; s.t = 0; s.plan = [['m1', 1], ['f1', 1], ['m2', 2], ['f2', 2], ['f3', 3]]; s.tc = null;
    },
    qF(F, N) { return (F[1] + 2 * F[2]) / (2 * N); }, qM(M, N) { return M.length === 3 ? (M[1] + 2 * M[2]) / (2 * N) : M[1] / N; },
    cageStat(s) { const N = s.N, o = { qf: this.r6(this.qF(s.cage.F, N)), qm: this.r6(this.qM(s.cage.M, N)), wm: this.r6(s.cage.M.length === 3 ? s.cage.M[2] / N : s.cage.M[1] / N), wf: this.r6(s.cage.F[2] / N) }; if (s.ctl) { o.cf = this.r6(this.qF(s.ctl.F, N)); o.cm = this.r6(this.qM(s.ctl.M, N)); } return o; },
    diploid(N, qa, qb) { const a = WF.binom(N, qa), b1 = WF.binom(a, qb), b2 = WF.binom(N - a, qb); return [N - a - b2, a - b1 + b2, b1]; },   // N offspring: one allele from each parent's gamete pool
    xGen(cage, N, sel, mu) {   // one X-linked generation: selection on white males (sel), then mutation + → w in every gamete
      const qf = this.qF(cage.F, N), qm = this.qM(cage.M, N), fa = sel > 0 ? qm * (1 - sel) / (1 - sel * qm) : qm, mut = q => q + mu * (1 - q);
      const mo = mut(qf), pa = mut(fa); cage.F = this.diploid(N, mo, pa); const w = WF.binom(N, mo); cage.M = [N - w, w];
    },
    aGen(cage, N) { const qf = this.qF(cage.F, N), qm = this.qM(cage.M, N); cage.F = this.diploid(N, qf, qm); cage.M = this.diploid(N, qf, qm); },   // autosomal: both sexes alike
    cageStep(s, ev) {
      if (s.phase === 'gen') {
        if (!s.auto) { const p = s.plan.find(x => x[1] === s.g + 1 && s.asks.indexOf(x[0]) < 0); if (p) { if (this.cageAsk(s, ev, p[0])) return; } }
        if (s.t < (s.g >= 3 || s.auto ? RY_T.run : RY_T.gen) / (s.ff ? 3 : 1)) return;
        s.t = 0; if (s.auts) this.aGen(s.cage, s.N); else this.xGen(s.cage, s.N, 0, 0); if (s.ctl && !s.auts) this.aGen(s.ctl, s.N);
        s.g++; s.hist.push(this.cageStat(s)); ev.push({ k: 'gen', g: s.g });
        if (s.g >= 10) { if (s.auto) { s.phase = 'over'; ev.push({ k: 'over' }); } else this.tcStart(s, ev); }
        return;
      }
      if (s.phase === 'tgen') {
        if (s.t < RY_T.trun / (s.ff ? 3 : 1)) return; s.t = 0; this.xGen(s.tc, s.N, 0, 0); s.tg++; const N = s.N;
        s.th.push({ qf: this.r6(this.qF(s.tc.F, N)), qm: this.r6(this.qM(s.tc.M, N)) }); ev.push({ k: 'tgen', g: s.tg });
        if (s.tg >= 10) { s.phase = 'over'; ev.push({ k: 'over' }); }
      }
    },
    cageAsk(s, ev, id) {   // the next sons' (m) or daughters' (f) white share, from the realised cage now; counted only when "no change" misses
      const h = s.hist[s.hist.length - 1], m = id[0] === 'm', exp = this.r6(m ? h.qf : (h.qf + h.qm) / 2), start = m ? h.qm : h.qf;
      if (Math.abs(exp - start) < 0.09) { s.voids[id] = true; s.asks.push(id); return false; }
      this.openAsk(s, ev, id, 'y', 0, 1, 0.06, start, exp, 'gen', s.g + 1); return true;
    },
    tcStart(s, ev) {   // the transfer cage: one of four starts, drawn once; the settling point is (2q_f + q_m)/3
      const pre = [[0.8, 0.2], [0.9, 0.3], [0.2, 0.8], [0.1, 0.7]][Math.min(3, Math.floor(R() * 4))], N = s.N, a = pre[0], b = pre[1];
      const f2 = Math.round(N * a * a), f1 = Math.round(N * 2 * a * (1 - a)), m1 = Math.round(N * b);
      s.tc = { F: [N - f1 - f2, f1, f2], M: [N - m1, m1] }; s.tg = 0; const qf = this.qF(s.tc.F, N), qm = this.qM(s.tc.M, N);
      s.th = [{ qf: this.r6(qf), qm: this.r6(qm) }]; s.tpre = pre;
      this.openAsk(s, ev, 't', 'y', 0, 1, 0.05, this.r6((qf + qm) / 2), this.r6((2 * qf + qm) / 3), 'tgen', 10);
      ev.push({ k: 'tcage' });
    },

    /* ---------- L2: the lamp (selection on white males only; mutation brings white back) ---------- */
    lampInit(s, ev) {
      const N = this.P().N.v; s.N = N; const f2 = Math.round(N / 9), f1 = Math.round(4 * N / 9), m1 = Math.round(N / 3);
      s.cage = { F: [N - f1 - f2, f1, f2], M: [N - m1, m1] };   // the zigzag's balance: q = 1/3 in both sexes
      s.g = 0; s.hist = [this.cageStat(s)]; s.caught = 0; s.shown = 0; s.rounds = []; s.mu = this.P().mu.v; s.sAuto = this.P().s.v;
      this.courtStart(s, ev);
    },
    courtStart(s, ev) {
      const N = s.N, qm = s.cage.M[1] / N, nm = 36, nw = Math.round(nm * qm); s.flies = [];
      for (let i = 0; i < nm; i++) {
        const r = 0.3 * Math.sqrt(R()), a = 2 * Math.PI * R(), amp = 0.05 + 0.07 * R();
        s.flies.push({ cx: this.r6(0.5 + r * Det.cos(a)), cy: this.r6(0.5 + r * Det.sin(a)), ax: this.r6(amp * (0.6 + 0.8 * R())), ay: this.r6(amp * (0.6 + 0.8 * R())), wx: this.r6(0.5 + 0.9 * R()), wy: this.r6(0.5 + 0.9 * R()), p1: this.r6(6.28 * R()), p2: this.r6(6.28 * R()), w: false, ex: 0, c: false });
      }
      for (let k = 0; k < nw; k++) { const j = Math.floor(R() * nm); let q = j; while (s.flies[q].w) q = (q + 1) % nm; s.flies[q].w = true; }   // white-eyed males scattered through the dish
      s.nw = nw; s.cg = 0; s.ct = 0; s.bat0 = this.r6(2.8 * Det.pow(0.85, s.g)); s.bat = s.bat0; s.beam = { on: false, x: 0.5, y: 0.5 }; s.phase = 'court'; s.t = 0;
      ev.push({ k: 'court', g: s.g + 1, nw });
    },
    flyPos(f, t) { return [f.cx + f.ax * Det.sin(f.wx * t + f.p1), f.cy + f.ay * Det.sin(f.wy * t + f.p2)]; },
    catchAt(s, ev, x, y, r, need) {   // white males within r of (x, y) gain exposure; at need seconds (0: at once) a male is caught
      for (let i = 0; i < s.flies.length; i++) {
        const f = s.flies[i]; if (!f.w || f.c) continue; const p = this.flyPos(f, s.ct), dx = p[0] - x, dy = p[1] - y;
        if (dx * dx + dy * dy > r * r) continue;
        if (need > 0) { f.ex = this.r6(f.ex + this.dt); if (f.ex < need) continue; }
        f.c = true; s.cg++; ev.push({ k: 'stumble', i });
      }
    },
    lampStep(s, ev) {
      if (s.phase === 'court') {
        if (s.unt) { if (s.bat < 0.5 - 1e-9 || s.cg >= s.nw && s.nw > 0 && s.t > 0.6) this.breed(s, ev); return; }
        s.ct = this.r6(s.ct + this.dt);
        if (s.beam.on && s.bat > 0) { s.bat = this.r6(Math.max(0, s.bat - this.dt)); this.catchAt(s, ev, s.beam.x, s.beam.y, RY_T.beamR, RY_T.expo); if (s.bat <= 0) ev.push({ k: 'flat' }); }
        if (s.ct >= RY_T.court || (s.bat <= 0 && s.ct > 0.3) || (s.nw > 0 && s.cg >= s.nw && s.ct > 0.8)) this.breed(s, ev);
        return;
      }
      if (s.phase === 'bred') { if (s.t >= RY_T.bred / (s.ff ? 3 : 1)) { if (s.g < 5) this.courtStart(s, ev); else this.balAsk(s, ev); } return; }
      if (s.phase === 'auto') {
        if (s.t < RY_T.auto) return; s.t = 0; this.xGen(s.cage, s.N, s.sAuto, s.mu); s.g++; s.hist.push(this.cageStat(s)); ev.push({ k: 'gen', g: s.g });
        if (s.g >= 65) { s.phase = 'over'; ev.push({ k: 'over' }); }
      }
    },
    breed(s, ev) {
      const sel = s.nw > 0 ? s.cg / s.nw : 0; s.caught += s.cg; s.shown += s.nw; s.rounds.push({ nw: s.nw, cg: s.cg, sel: this.r6(sel) });
      s.beam.on = false; this.xGen(s.cage, s.N, sel, s.mu); s.g++; s.hist.push(this.cageStat(s)); s.phase = 'bred'; s.t = 0; ev.push({ k: 'bred', g: s.g, sel: this.r6(sel) });
    },
    lampEq(qf, qm, sel, mu) { const mut = q => q + mu * (1 - q); for (let g = 0; g < 3000; g++) { const fa = qm * (1 - sel) / (1 - sel * qm), a = mut(qf), b = mut(fa); qf = (a + b) / 2; qm = a; } return qm; },   // deterministic recursion to its balance
    balAsk(s, ev) {
      const h = s.hist[s.hist.length - 1], e = this.r6(this.lampEq(h.qf, h.qm, s.sAuto, s.mu)), cur = h.qm, inBand = cur >= e / 1.5 && cur <= e * 1.5;
      s.atAsk = { F: s.cage.F.slice(), M: s.cage.M.slice(), g: s.g, hl: s.hist.length };
      this.openAsk(s, ev, 'bal', 'y', 0, 0.4, this.r6(e * 0.45), inBand ? 0.4 : cur, e, 'auto', 65);
    },

    /* ---------- L3 (boss): the Queen's carriers ---------- */
    galInit(s, ev) { s.ci = 0; s.post = { victoria: 1 }; s.judg = []; s.son = 0; s.cv = null; this.caseStart(s, ev); },
    priorOf(s, c) { if (c.fatherAff) return 1; return (s.post[c.mother] || 0) / 2; },
    postOf(c, prior) { if (c.sons.some(x => x[1])) return 1; let L = 1; for (let k = 0; k < c.sons.length; k++) L *= 0.5; return prior * L / (prior * L + 1 - prior); },
    caseStart(s, ev) { const c = RY_CASES[s.ci]; s.phase = 'prior'; s.t = 0; s.son = 0; s.cur = { id: c.id, prior: this.r6(this.priorOf(s, c)) }; ev.push({ k: 'case', i: s.ci, id: c.id }); },
    judge(s, ev, v) {
      if (s.phase !== 'prior' && s.phase !== 'post') return; if (v == null || !isFinite(+v)) return; v = Math.max(0, Math.min(1, Math.round(+v * 100) / 100));
      const c = RY_CASES[s.ci], pr = s.cur.prior;
      if (s.phase === 'prior') { s.judg.push({ id: c.id, st: 'prior', v, e: pr }); s.phase = 'sons'; s.t = 0; ev.push({ k: 'seal', st: 'prior', v, e: pr }); return; }
      const e = this.r6(this.postOf(c, pr)); s.judg.push({ id: c.id, st: 'post', v, e }); s.post[c.id] = e; s.phase = 'reveal'; s.t = 0; ev.push({ k: 'seal', st: 'post', v, e });
    },
    galStep(s, ev) {
      const c = RY_CASES[s.ci];
      if (s.phase === 'sons') {
        if (s.t < (c.sons.length ? RY_T.son : 0.9) / (s.ff ? 3 : 1)) return; s.t = 0;
        if (s.son < c.sons.length) { const so = c.sons[s.son]; s.son++; ev.push({ k: 'son', i: s.son - 1, aff: so[1] }); return; }
        s.phase = 'post'; ev.push({ k: 'post' }); return;
      }
      if (s.phase === 'reveal') {
        if (s.t < RY_T.reveal / (s.ff ? 3 : 1)) return;
        if (s.ci + 1 < RY_CASES.length) { s.ci++; this.caseStart(s, ev); return; }
        this.openAsk(s, ev, 'cv', 'x', 0, 0.05, 0.003, 0.04, 0.0064, 'end', null); return;
      }
      if (s.phase === 'end' && s.t >= 1.2) { s.phase = 'over'; ev.push({ k: 'over' }); }
    },
    galScore(s) { const j = s.judg || []; let n = 0; for (const x of j) if (Math.abs(x.v - x.e) <= 0.1 + 1e-9) n++; return { n, m: j.length }; },

    /* ---------- predictions: the sim opens the ask; the expectation is the model's, never the realised run ---------- */
    openAsk(s, ev, id, kind, lo, hi, tol, start, expect, resume, at) {
      s.ask = { id, kind, lo, hi, tol, start: this.r6(start), at }; (s.atOf || (s.atOf = {}))[id] = at; s.exp[id] = expect; s.tol[id] = tol; s.asks.push(id); s.resume = resume; s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id });
    },
    commit(s, ev, id, v) {
      if (!s.ask || s.ask.id !== id) return; const A = s.ask, e = s.exp[id]; let hit = false;
      if (v != null && isFinite(+v)) { v = Math.max(A.lo, Math.min(A.hi, +v)); hit = id === 'bal' ? v >= e / 1.5 - 1e-9 && v <= e * 1.5 + 1e-9 : Math.abs(v - e) <= A.tol + 1e-9; } else v = null;
      s.pred[id] = v; s.hits[id] = hit; s.ask = null; s.phase = s.resume; s.t = 0; ev.push({ k: 'commit', id });
    },

    /* ---------- What if? (D1 G9): the finished level reruns with one lever pulled, at speed ---------- */
    lever(k) {
      const s = this.s; s.whatif = k; s.ask = null; s.t = 0; s.auto = true;
      if (s.level === 1) { const N = s.N; s.auts = k === 'auto'; s.cage = k === 'flip' ? { F: [0, 0, N], M: [N, 0] } : k === 'auto' ? { F: [N, 0, 0], M: [0, 0, N] } : { F: [N, 0, 0], M: [0, N] }; s.ctl = null; s.g = 0; s.hist = [this.cageStat(s)]; s.tc = null; s.th = null; s.phase = 'gen'; }
      else if (s.level === 2 && s.atAsk) { s.base = s.hist[s.hist.length - 1]; s.cage = { F: s.atAsk.F.slice(), M: s.atAsk.M.slice() }; s.g = s.atAsk.g; s.hist = s.hist.slice(0, s.atAsk.hl); if (k === 'nomut') s.mu = 0; else s.sAuto = 1; s.phase = 'auto'; }
      else s.phase = 'over';
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      if (a.k === 'unt') { s.unt = !!a.on; ev.push({ k: 'unt', on: s.unt }); return ev; }
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id) this.commit(s, ev, a.id, a.moved === false ? null : a.v); return ev; }
      if (a.k === 'ff') { s.ff = !!a.on; return ev; }
      if (s.auto || s.phase === 'ask') return ev;
      if (s.kind === 'cross' && a.k === 'cross') this.cross(s, ev, a.f, a.m);
      else if (s.kind === 'lamp' && s.phase === 'court') {
        if (a.k === 'beam' && !s.unt) { s.beam.on = s.bat > 0; s.beam.x = this.r6(Math.max(0, Math.min(1, +a.x || 0))); s.beam.y = this.r6(Math.max(0, Math.min(1, +a.y || 0))); }
        else if (a.k === 'off') s.beam.on = false;
        else if (a.k === 'flash' && s.unt && s.bat >= 0.5 - 1e-9) { s.bat = this.r6(s.bat - 0.5); s.beam.x = this.r6(+a.x || 0); s.beam.y = this.r6(+a.y || 0); ev.push({ k: 'flash', x: s.beam.x, y: s.beam.y }); this.catchAt(s, ev, s.beam.x, s.beam.y, RY_T.beamR * 1.25, 0); }
        else if (a.k === 'breed') this.breed(s, ev);
      }
      else if (s.kind === 'gallery' && a.k === 'judge') this.judge(s, ev, a.v);
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_ROYAL_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, interesting: this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons §1.5)
      if (s.whatif) return null; const n = s.level, st = CH_ROYAL_V2.stars;
      if (n === 0) { if (st.discover(s, 0)) return null; const g = s.goals; return !g.wf ? 'nowhite' : !g.rev ? 'norev' : !g.f2 ? 'nof2' : null; }
      if (n === 1) { if (s.pred.m1 != null && s.pred.m1 > 0.5) return 'fathers'; if (s.pred.t != null && !s.hits.t && s.ask == null && Math.abs(s.pred.t - (s.tpre[0] + s.tpre[1]) / 2) < 0.04) return 'midpoint'; return null; }
      if (n === 2) { if (s.shown > 0 && s.caught / s.shown < 0.5) return 'dim'; const v = s.pred.bal, e = s.exp.bal; if (v != null && !s.hits.bal) return v < e ? 'low' : 'high'; return null; }
      const J = s.judg || [], miss = id => J.some(x => x.id === id && Math.abs(x.v - x.e) > 0.1);
      if (miss('albany')) return 'father'; if (miss('hv')) return 'grand';
      if (J.some(x => x.st === 'post' && (x.id === 'helena' || x.id === 'voh') && Math.abs(x.v - x.e) > 0.1)) return 'sons';
      if (s.pred.cv != null && !s.hits.cv) return 'cvmiss';
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s || s.auto) return out;
      if (s.ask) { const A = s.ask, n = 50; for (let k = 0; k <= n; k++) out.push({ k: 'predict', id: A.id, v: Math.round((A.lo + (A.hi - A.lo) * k / n) * 1e5) / 1e5 }); return out; }
      if (s.kind === 'cross' && s.phase === 'pick' && s.left > 0) { for (const F of s.stocks) if (F.sex === 'f') for (const M of s.stocks) if (M.sex === 'm') out.push({ k: 'cross', f: F.id, m: M.id }); }
      else if (s.kind === 'lamp' && s.phase === 'court') {
        for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) out.push({ k: s.unt ? 'flash' : 'beam', x: 0.1 + 0.2 * i, y: 0.1 + 0.2 * j });
        out.push({ k: 'off' }, { k: 'breed' });
      }
      else if (s.kind === 'gallery' && (s.phase === 'prior' || s.phase === 'post')) for (let k = 0; k <= 20; k++) out.push({ k: 'judge', v: k / 20 });
      return out;
    },
    /* bots (tests/bots.js): (s, acts, rnd) → action | null; 'random' is generic. No bot may earn three stars in a level, nor across the unit. */
    bots: {
      alwaysA(s, acts) { return CH_ROYAL_V2.sim.bot(s, acts, 'first', 'centre', 'lo', 0); },
      alwaysB(s, acts) { return CH_ROYAL_V2.sim.bot(s, acts, 'last', 'none', 'hi', 1); },
      greedy(s, acts) { return CH_ROYAL_V2.sim.bot(s, acts, 'expert', 'aim', 'auto', 'half'); },         // plays well, predicts as if the gene were autosomal
      threshold(s, acts) { return CH_ROYAL_V2.sim.bot(s, acts, 'expert', 'aim', 'still', 'evid'); },     // plays well; never moves a ghost; odds 1 after an affected son, else 0.5 or 0
      lazy(s, acts) { return CH_ROYAL_V2.sim.bot(s, acts, 'expert', 'centre', 'still', 'half'); },
      bestNoThink(s, acts) { return CH_ROYAL_V2.sim.bot(s, acts, 'expert', 'aim', 'mid', 'mid'); },
      expert(s, acts) { return CH_ROYAL_V2.sim.bot(s, acts, 'expert', 'aim', 'exact', 'exact'); }      // test policy: reads s.exp (never in a sweep)
    },
    bot(s, acts, cross, lamp, pred, odds) {
      if (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt && !s.unt && s.kind === 'lamp') return { k: 'unt', on: true };
      if (s.ask) {
        const A = s.ask, P = acts.filter(a => a.k === 'predict'), near = v => P.reduce((b, a) => (Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b));
        if (pred === 'still') return { k: 'predict', id: A.id, v: A.start, moved: false };
        if (pred === 'exact') return { k: 'predict', id: A.id, v: s.exp[A.id] };
        if (pred === 'auto') { const h = s.hist && s.hist[s.hist.length - 1], v = A.id === 'a' ? 0.25 : A.id === 'b' ? 0 : A.id === 't' ? A.start : A.id === 'bal' ? (h ? h.qm : A.start) : A.id === 'cv' ? 0.04 : h ? (h.qf + h.qm) / 2 : 0.5; return near(v); }
        return near(pred === 'lo' ? A.lo : pred === 'hi' ? A.hi : (A.lo + A.hi) / 2);
      }
      if (s.kind === 'cross') {
        const C = acts.filter(a => a.k === 'cross'); if (!C.length) return null;
        if (cross === 'first') return C[0]; if (cross === 'last') return C[C.length - 1];
        const g = s.goals, F = s.stocks.filter(x => x.sex === 'f'), car = F.find(x => !x.white && Math.abs(this.qOf(x) - 0.5) < 1e-6), wf = F.find(x => x.white);
        if (!g.f1) return { k: 'cross', f: 'wf', m: 'mm' }; if (!g.f2 && car) return { k: 'cross', f: car.id, m: 'wm' };
        if (!g.wf && car) return { k: 'cross', f: car.id, m: 'mm' }; if (!g.rev && wf) return { k: 'cross', f: wf.id, m: 'wm' };
        return C[0];
      }
      if (s.kind === 'lamp' && s.phase === 'court') {
        if (lamp === 'none') return { k: 'breed' };
        if (lamp === 'centre') return s.unt ? { k: 'flash', x: 0.5, y: 0.5 } : (s.beam.on ? null : { k: 'beam', x: 0.5, y: 0.5 });
        let best = null, bd = 9; const bx = s.beam.x, by = s.beam.y;
        for (const f of s.flies) { if (!f.w || f.c) continue; const p = this.flyPos(f, s.ct + 0.1), d = (p[0] - bx) * (p[0] - bx) + (p[1] - by) * (p[1] - by); if (d < bd) { bd = d; best = p; } }
        if (!best) return { k: 'breed' };
        if (s.unt) return { k: 'flash', x: this.r6(best[0]), y: this.r6(best[1]) };
        return { k: 'beam', x: this.r6(best[0]), y: this.r6(best[1]) };
      }
      if (s.kind === 'gallery' && (s.phase === 'prior' || s.phase === 'post')) {
        const c = RY_CASES[s.ci], pr = s.cur.prior, ex = s.phase === 'prior' ? pr : this.postOf(c, pr);
        let v = 0.5; if (odds === 'exact') v = ex; else if (odds === 0 || odds === 1) v = odds; else if (odds === 'mid') v = 0.5;
        else if (odds === 'evid') v = s.phase === 'post' && c.sons.some(x => x[1]) ? 1 : s.phase === 'post' && c.sons.length ? 0 : 0.5;
        return { k: 'judge', v: Math.round(v * 20) / 20 === v ? v : Math.round(v * 100) / 100 };
      }
      return null;
    }
  },

  /* ---------- stars, against the expectation for the parameters in force (never the realised run of luck) ---------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false;
      if (n === 0) { const g = s.goals; return !!(g.f1 && g.f2 && g.wf && g.rev); }
      if (n === 2) { const h = s.hist[s.hist.length - 1]; return s.shown > 0 && s.caught / s.shown >= 0.5 && s.g >= 65 && h.qm > 0; }
      if (n === 3) {
        const J = s.judg || [], post = id => (J.find(x => x.id === id && x.st === 'post') || {}).v, pri = id => (J.find(x => x.id === id && x.st === 'prior') || {}).v;
        if (J.length < 12) return false;
        const sure = ['alice', 'albany', 'alix'].every(id => post(id) >= 0.9) && pri('albany') >= 0.9;
        const down = ['helena', 'voh'].every(id => post(id) <= pri(id) - 0.15);
        return sure && down;
      }
      return false;
    },
    predict: (s, n) => {
      if (s.whatif) return false;
      if (n === 0) return !!(s.hits.a && s.hits.b);
      if (n === 1) { const ids = ['m1', 'f1', 'm2', 'f2', 'f3'].filter(id => !s.voids[id]), hit = ids.filter(id => s.hits[id]).length; return ids.length >= 3 && hit >= Math.min(4, ids.length); }
      if (n === 2) return !!s.hits.bal;
      return false;
    },
    transfer: (s, n) => {
      if (s.whatif) return false;
      if (n === 1) return !!s.hits.t;
      if (n === 3) { const sc = CH_ROYAL_V2.sim.galScore(s); return sc.m === 12 && sc.n >= 11 && !!s.hits.cv; }
      return false;
    }
  },
  unitStars(lv) {   // D3: Discover in two of L1, L3, boss; Predict in two of L1–L3; Transfer = the new cage and the boss
    const m = i => lv[i] | 0, cnt = (ids, bit) => ids.filter(i => m(i) & bit).length;
    return (cnt([0, 2, 3], 1) >= 2 ? 1 : 0) | (cnt([0, 1, 2], 2) >= 2 ? 2 : 0) | ((m(1) & 4) && (m(3) & 4) ? 4 : 0);
  },
  /* result code (30 bits): 0–1 level, 2–4 mask, 5–12 a level number (L0 crosses used, L1 final gap ×100 + 100, L2 caught %,
     L3 judgments within 10 points), 13–19 first prediction ×100 of its axis span, 20–26 second */
  resultBits(s, level) {
    if (!s) return 0; const n = Math.max(0, Math.min(3, level | 0)), st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(v)));
    let x = 0; if (n === 0) x = (s.crosses || []).length; else if (n === 1) { const h = s.hist[s.hist.length - 1]; x = 100 * (h.qf - h.qm) + 100; } else if (n === 2) x = s.shown ? 100 * s.caught / s.shown : 0; else x = this.sim.galScore(s).n;
    const span = { a: 1, b: 1, m1: 1, f1: 1, m2: 1, f2: 1, f3: 1, t: 1, bal: 0.4, cv: 0.05 }, pv = id => { const v = s.pred[id]; return v == null || !span[id] ? 127 : c(100 * v / span[id], 126); }, ids = s.asks.filter(id => !s.voids[id]);
    return (n | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 2 | c(x, 255) << 5 | pv(ids[0]) << 13 | pv(ids[1]) << 20) >>> 0;
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = false; this._asking = null; this._hudSig = ''; this._dockSig = '';
    this.v = { t: 0, hold: -1, fold: 0, said: {}, bgs: {}, bgk: '', drag: null, sel: null, flies: [], trays: [[], [], [], []], pour: null, banner: null, slider: null, sliding: false,
      stumbles: {}, flash: null, sons: [], seal: null, last: 0, kb: [0.5, 0.5], beamOn: false, thaw: !!o.thaw, portraits: {}, hatchAt: 0, newStock: {}, glow: 0 };
    Sim.start(this, n, o);
    const ui = Save.d && Save.d.ui;
    if (!o.thaw && !o.replay && ui && ui.unt && n === 2) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    const s = this.sim.s;
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = o.thaw ? this.content.levers[s.whatif] || this.levels[n].name : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => this.banner(name, Math.max(1000, ms + 400)));
    this.v.ghost0 = !o.thaw;
  },
  banner(text, ms) { this.v.banner = { text, t: 0, ms: ms || 1100 }; },
  phoneStrip() { return typeof Strip !== 'undefined' && !!Strip.isOpen && typeof Strip.phone === 'function' && Strip.phone(); },
  hudH() {   // the HUD's real bottom over the canvas (it wraps on a phone); measured at most twice a second
    const z = (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56, v = this.v || {}, now = v.t || 0;
    if (v.hh != null && now - (v.hhT || 0) < 0.5) return v.hh;
    let h = z; try { const el = document.getElementById('hud'), cv = Stage.cv; if (el && cv && el.getBoundingClientRect) { const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect(); if (a.height > 0) h = Math.max(z, Math.min(Stage.h * 0.3, a.bottom - b.top)); } } catch (e) { }
    if (this.v) { this.v.hh = h; this.v.hhT = now; } return h;
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'ry-' + k); },
  redraw() { if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); },

  /* ---------- the frame ---------- */
  update(dt) {
    const v = this.v;
    for (const e of Sim.run(this, 0)) this.juice(e);   // live actions first
    if (v.hold >= 0) { v.hold += dt; if (!this.phoneStrip() || v.hold > 1.3) v.hold = -1; }
    const ev = Sim.run(this, v.hold >= 0 ? 0 : dt * (this.sim.s.auto ? 2 : 1)), s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.glow = Math.max(0, v.glow - dt);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    v.flies = v.flies.filter(f => (f.t += dt) < f.d);
    if (v.pour) { v.pour.t += dt; if (v.pour.t > 0.7) v.pour = null; }
    if (v.flash) { v.flash.t += dt; if (v.flash.t > 0.5) v.flash = null; }
    if (v.seal) { v.seal.t += dt; if (v.seal.t > 1.2) v.seal = null; }
    for (const k in v.stumbles) v.stumbles[k] += dt;
    for (const k in v.newStock) { v.newStock[k] += dt; if (v.newStock[k] > 1.5) delete v.newStock[k]; }
    if (v.ghost0 && !v.banner) { v.ghost0 = false; this.teach(); }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; v.fold = 1; }
    if (v.fold && v.hold < 0) { v.fold = 0; if (typeof Predict !== 'undefined' && Predict.fold) Predict.fold(); }
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; this._dockSig = ''; if (s.ff && typeof Sim !== 'undefined') Sim.act(this, { k: 'ff', on: false }); if (s.phase === 'prior' || s.phase === 'post') v.slider = null; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; v.endT = 0; return; } v.endT += dt; if (v.endT < 1.0 && !s.auto) return; this._ended = true; this.finish(r); }
  },
  teach() {   // the ghost hand demonstrates the verb this level adds (a known verb is skipped by Ghost itself)
    if (typeof Ghost === 'undefined') return; const n = this.level, s = this.sim.s;
    if (n === 0) Ghost.show({ verb: 'drag', key: '1', at: () => this.bottleXY('wf'), to: () => this.bottleXY('mm'), until: () => s.crosses.length > 0 || !!this.v.drag });
    else if (n === 2) Ghost.show({ verb: 'sweep', key: ' ', at: () => { const D = this.pos().dish; return [D.x - D.r * 0.4, D.y]; }, to: () => { const D = this.pos().dish; return [D.x + D.r * 0.4, D.y - D.r * 0.2]; }, until: () => s.cg > 0 || s.g > 0 || this.v.beamOn });
    else if (n === 3) Ghost.show({ verb: 'slide', key: 'ArrowRight', at: () => { const S = this.pos().sl; return [S.x + S.w * 0.3, S.y]; }, to: () => { const S = this.pos().sl; return [S.x + S.w * 0.6, S.y]; }, until: () => this.v.slider != null || s.judg.length > 0 });
  },
  hud() {
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; if (typeof HUD === 'undefined') return;
    let t = '', num = '';
    if (s.auto) t = C.whatif;
    else if (s.phase === 'ask') t = { a: C.askA, b: C.askB, m1: C.askM, m2: C.askM, f1: C.askF, f2: C.askF, f3: C.askF, bal: C.askBal, cv: C.cv }[s.ask.id] || (s.ask.id === 't' ? Txt.f(C.askT, { f: Math.round(100 * s.th[0].qf), m: Math.round(100 * s.th[0].qm) }) : C.askF);
    else if (s.kind === 'cross') { const g = s.goals, nx = !g.f1 ? L.goal1 : !g.f2 ? L.goal2 : !g.wf ? L.goal3 : L.goal4; t = s.phase === 'hatch' ? C.hatch : s.phase === 'sorted' ? C.sorted : s.crosses.length === 0 ? this.content.firstWords : Txt.f(C.next, { goal: nx }); num = Txt.f(L.vials, {}) + ' ' + s.left; }
    else if (s.kind === 'cage') { t = s.phase === 'tgen' ? C.trun : s.g === 0 ? C.cage : C.run; num = Txt.f(L.gen, { n: s.phase === 'tgen' ? s.tg : s.g }); }
    else if (s.kind === 'lamp') { t = s.phase === 'court' ? (s.unt ? C.courtU : C.court) : s.phase === 'auto' ? C.auto : C.bred; num = Txt.f(L.gen, { n: s.g + (s.phase === 'court' ? 1 : 0) }); }
    else { const c = RY_CASES[s.ci]; t = s.phase === 'prior' ? Txt.f(C.prior, { name: c.name }) : s.phase === 'sons' ? (c.sons.length ? C.sons : C.nosons) : s.phase === 'post' ? C.post : C.reveal; const sc = this.sim.galScore(s); num = sc.n + '/' + sc.m; }
    if (s.phase === 'over' && !s.auto) t = C.over;
    const sig = t + num; if (sig !== this._hudSig) { this._hudSig = sig; HUD.say(t, num); }
    const bar = typeof document !== 'undefined' && document.getElementById ? document.getElementById('bar-gen') : null;
    if (bar) { const lab = s.kind === 'gallery' ? L.gallery : s.kind === 'cross' ? L.vials + ' ' + s.left : Txt.f(L.gen, { n: s.g || 0 }); if (bar.textContent !== lab) bar.textContent = lab; }
  },
  dock() {
    if (typeof Dock === 'undefined') return; const s = this.sim.s, L = this.content.labels;
    const sig = s.phase + (s.unt ? 'u' : '') + (s.ask ? s.ask.id : '') + (s.auto ? 'a' : '') + (this.v.slider != null ? 's' : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'ry-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (s.auto || s.phase === 'over') { Dock.set([]); return; }
    if (s.kind === 'lamp' && s.phase === 'court') { Dock.set([{ id: 'ry-breed', label: L.breed, key: 'Enter', fn: () => Sim.act(this, { k: 'breed' }) }]); return; }
    if (s.kind === 'gallery' && (s.phase === 'prior' || s.phase === 'post')) { Dock.set([{ id: 'ry-seal', label: L.seal, key: 'Enter', primary: true, disabled: this.v.slider == null, why: this.content.whispers.setFirst, fn: () => this.sealIt() }]); return; }
    if (/hatch|gen|tgen|bred|auto|sons|reveal|sorted/.test(s.phase)) { Dock.set([{ id: 'ry-ff', label: L.faster, key: ' ', fn: () => Sim.act(this, { k: 'ff', on: true }) }]); return; }
    Dock.set([]);
  },
  sealIt() { const v = this.v; if (v.slider == null) { this.whisper('setFirst'); return; } Sim.act(this, { k: 'judge', v: Math.round(v.slider * 100) / 100 }); },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    if ((A.id === 't' || A.id === 'cv') && Predict.clear) Predict.clear(0);   // chart 0 changes meaning for the transfer asks
    Predict.ask({ id: A.id, chart: 0, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.start, tol: A.tol, at: A.at, soft: s.unt ? null : 26, needMove: true, linger: 1000,
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null, moved: false }), say: this.content.live.ask });
    if (typeof Live !== 'undefined') Live.say(this.content.live.ask);
    this._dockSig = ''; this.dock(); this.redraw();
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(0); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
  reveal(id) {
    const s = this.sim.s; if (typeof Predict === 'undefined' || s.exp[id] == null) return;
    const tol = id === 'bal' ? s.exp[id] * 0.45 : s.tol[id];
    Predict.reveal(id, s.exp[id], tol); this.whisper(s.pred[id] == null ? 'none' : s.hits[id] ? 'hit' : 'out'); this.redraw();
  },

  /* ---------- the level card ---------- */
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, o = { level: n, mask: r.mask, final: n === 3, interesting: r.interesting }, V = this.bodyVars();
    if (s.whatif) { o.body = Txt.f(C.whatifBody[s.whatif], V); o.take = null; o.interesting = null; }
    else if (n < 3) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    if (!s.whatif && (n === 1 || n === 2) && typeof Freezer !== 'undefined') { Freezer.put(this.id, 1, this.sim.snapshot(), { force: true }); o.whatIf = { gen: 1, levers: n === 1 ? ['auto', 'flip'] : ['nomut', 'all'] }; }
    o.why = n < 3 ? C.levelWhy[n] : C.why;
    const spec = this.cardSpec(); if (spec && typeof LiveGraph !== 'undefined') { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  bodyVars() {
    const s = this.sim.s, n = this.level, pc = x => Math.round(100 * x);
    if (n === 0) { const sh = (c, i, j) => c ? pc(c.kids[i] / Math.max(1, c.kids[i] + c.kids[j])) : 0, f2 = s.crosses.find(c => c.type === 'f2'), rv = s.crosses.find(c => c.type === 'rev'); return { a: sh(f2, 3, 2), b: sh(f2, 1, 0), c: sh(rv, 3, 2) }; }
    if (n === 1) { const h = s.hist, last = h[h.length - 1]; if (s.whatif) return { a: pc((last.qf * 2 + last.qm) / 3) }; return { a: pc(Math.abs(h[0].qf - h[0].qm)), b: Math.abs(pc(last.qf - last.qm)), c: pc((2 * last.qf + last.qm) / 3) }; }
    if (n === 2) { const last = s.hist[s.hist.length - 1]; if (s.whatif) return { a: (Math.round(1000 * last.wm) / 10).toFixed(1), b: s.base ? (Math.round(1000 * s.base.wm) / 10).toFixed(1) : '' }; const tail = s.hist.slice(-20), m = k => tail.reduce((a, b) => a + b[k], 0) / tail.length; return { a: s.shown ? pc(s.caught / s.shown) : 0, b: (Math.round(1000 * m('wm')) / 10).toFixed(1), c: (Math.round(1000 * m('wf')) / 10).toFixed(1) }; }
    const sc = this.sim.galScore(s); return { n: sc.n, m: sc.m };
  },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, S2 = typeof Snd2 !== 'undefined' ? Snd2 : null, P = this.pos();
    const snd = (k, x, y) => { if (S2) S2.play(k, { x, y }); };
    switch (e.k) {
      case 'cross': { const b = P.cross; v.pour = { t: 0, f: e.f, m: e.m }; v.trays = [[], [], [], []]; snd('pour', b.x, b.y); if (F) { F.tier(1); F.ring(b.x, b.y, 40, { ms: 300 }); } this.redraw(); return; }
      case 'hatch': {
        const b = P.cross, t = this.trayXY(e.cls, v.trays[e.cls].length); v.trays[e.cls].push(1);
        v.flies.push({ x0: b.x + (this.hash('h' + e.i) % 30 - 15), y0: b.y - b.h * 0.2, x1: t[0], y1: t[1], t: 0, d: 0.45, cls: e.cls });
        if (e.i % 4 === 0) snd('tick', t[0], t[1]); if (F && e.i % 3 === 0) F.burst('dust', b.x, b.y - b.h * 0.3, 2, { ink: '#E8D9B0' });
        if (e.cls === 1 && !v.said.wd0) { v.said.wd0 = 1; if (F) F.tier(2, () => F.ring(t[0], t[1], 26, { ms: 500 })); }
        if (e.i % 10 === 0 && typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.hatch, { n: e.i }));
        if (e.i % 8 === 0) this.redraw(); return;
      }
      case 'sorted': { snd('count', P.plate.x, P.plate.y); if (F) F.pop(Txt.f(this.content.labels.plus, { n: e.kids.reduce((a, b) => a + b, 0) }), P.plate.x, P.plate.y - P.plate.h * 0.6, 1); this.redraw(); if (s.goals.f1 && s.goals.f2 && s.goals.wf && s.goals.rev && !v.said.done) { v.said.done = 1; this.whisper('done'); } return; }
      case 'stock': { v.newStock[e.id] = 0; const b = this.bottleXY(e.id); if (F && b) F.burst('spark', b[0], b[1], 6); return; }
      case 'wd': { this.whisper('wd'); if (F) F.tier(3, () => this.banner(this.content.labels.wF, 1200)); snd('interesting', P.W / 2, P.H / 2); return; }
      case 'novials': this.whisper('noVials'); return;
      case 'badcross': this.whisper('drop'); return;
      case 'gen': case 'tgen': {
        const h = e.k === 'gen' ? s.hist[s.hist.length - 1] : s.th[s.th.length - 1]; v.glow = 0.4;
        if (s.kind === 'cage') { snd('tick', P.cage.x, P.cage.y); if (F && !s.auto) F.ring(P.cage.x, P.cage.y, P.cage.r * 0.8, { ms: 300 }); }
        if (typeof Live !== 'undefined' && (e.g % 2 === 0 || e.g < 4)) Live.say(Txt.f(this.content.live.gen, { n: e.g, f: Math.round(100 * h.qf), m: Math.round(100 * h.qm) }));
        this.redraw(); return;
      }
      case 'tcage': if (F) F.tier(2, () => this.banner(this.content.labels.newcage, 1100)); this.redraw(); return;
      case 'court': v.stumbles = {}; if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.court, { n: e.g, w: e.nw })); if (e.g > 1) snd('wing', P.dish.x, P.dish.y); this.redraw(); return;
      case 'stumble': {
        v.stumbles[e.i] = 0; const f = s.flies[e.i], p = this.flyXY(f), x = p[0], y = p[1];
        if (F) { F.burst('dust', x, y, 5, { ink: '#F2E6C4' }); F.pop('×', x, y - 16, -1); F.hitstop(30); } snd('crack', x, y);
        if (!v.said.st) { v.said.st = 1; this.whisper('stumble'); } return;
      }
      case 'flash': { const D = P.dish; v.flash = { t: 0, x: D.x + (e.x - 0.5) * 2 * D.r, y: D.y + (e.y - 0.5) * 2 * D.r }; snd('swish', v.flash.x, v.flash.y); return; }
      case 'flat': this.whisper('battery'); if (S2) S2.play('tock', { x: P.lampX, y: P.lampY }); return;
      case 'bred': snd('peep', P.dish.x, P.dish.y); if (F) F.ring(P.dish.x, P.dish.y, P.dish.r * 0.9, { ms: 400 }); this.redraw(); return;
      case 'case': { v.sons = []; v.portraitIn = 0; snd('tock', P.W / 2, P.H * 0.4); if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.caseL, { name: RY_CASES[e.i].name })); if (RY_CASES[e.i].fatherAff && !v.said['ob' + e.i]) { v.said['ob' + e.i] = 1; if (F && F.after) F.after(700, () => this.whisper('obligate')); else this.whisper('obligate'); } this.redraw(); return; }
      case 'son': {
        v.sons.push({ i: e.i, t: 0, aff: e.aff }); const q = this.sonXY(e.i); snd(e.aff ? 'crack' : 'tick', q[0], q[1]);
        if (F) { if (e.aff) { F.shake(3, 150); F.ring(q[0], q[1], 30, { ms: 400 }); } else F.burst('dust', q[0], q[1], 3, { ink: '#E8D9B0' }); }
        const c = RY_CASES[s.ci], so = c.sons[e.i]; if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.son, { n: so[0], a: e.aff ? this.content.labels.aff : '' }));
        this.whisper(e.aff ? 'aff' : 'fine'); return;
      }
      case 'seal': { v.seal = { t: 0, st: e.st, v: e.v, e: e.e }; const S = P.sl; snd('scale', S.x + S.w * e.v, S.y); if (F) { F.tier(1); if (e.st === 'post') F.tier(2, () => F.ring(P.frame.x, P.frame.y, P.frame.r * 1.1, { ms: 600 })); if (Math.abs(e.v - e.e) <= 0.1) F.burst('spark', S.x + S.w * e.v, S.y, 6); } this.redraw(); return; }
      case 'commit': if (this.phoneStrip()) v.hold = 0; this.reveal(e.id); return;
      case 'ask': return;
      case 'unt': this._dockSig = ''; return;
      case 'over': snd('interesting', P.W / 2, P.H / 2); return;
    }
  },
  hash(v) { let h = 2166136261; const t = String(v); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h ^ h >>> 13) >>> 0; },

  /* ---------- input ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, P = this.pos(); v.px = x; v.py = y; v.pdown = true;
    if (s.auto || s.phase === 'ask' || s.phase === 'over') return;
    if (/hatch|gen|tgen|bred|auto|sons|reveal|sorted/.test(s.phase)) { Sim.act(this, { k: 'ff', on: true }); return; }
    if (s.kind === 'cross' && s.phase === 'pick') {
      const id = this.bottleAt(x, y);
      if (id) { const st = this.sim.stock(s, id); if (st.sex === 'f') { v.drag = { id, x, y, moved: false }; v.sel = id; } else if (v.sel) { Sim.act(this, { k: 'cross', f: v.sel, m: id }); v.sel = null; } else this.whisper('pickF'); }
      return;
    }
    if (s.kind === 'lamp' && s.phase === 'court') {
      const D = P.dish, nx = 0.5 + (x - D.x) / (2 * D.r), ny = 0.5 + (y - D.y) / (2 * D.r);
      if (s.unt) { Sim.act(this, { k: 'flash', x: Math.round(nx * 1000) / 1000, y: Math.round(ny * 1000) / 1000 }); return; }
      v.beamOn = true; v.last = v.t; Sim.act(this, { k: 'beam', x: Math.round(nx * 1000) / 1000, y: Math.round(ny * 1000) / 1000 }); return;
    }
    if (s.kind === 'gallery' && (s.phase === 'prior' || s.phase === 'post')) { const S = P.sl; if (y > S.y - 40 && y < S.y + 40) { v.sliding = true; v.slider = Math.max(0, Math.min(1, (x - S.x) / S.w)); this._dockSig = ''; } }
  },
  move(x, y) {
    const s = this.sim.s, v = this.v, P = this.pos(); v.px = x; v.py = y;
    if (v.drag) { if (Math.abs(x - v.drag.x) + Math.abs(y - v.drag.y) > 6) v.drag.moved = true; v.drag.cx = x; v.drag.cy = y; return; }
    if (s.kind === 'lamp' && s.phase === 'court' && v.beamOn && !s.unt && v.t - v.last >= 0.05) { const D = P.dish; v.last = v.t; Sim.act(this, { k: 'beam', x: Math.round((0.5 + (x - D.x) / (2 * D.r)) * 1000) / 1000, y: Math.round((0.5 + (y - D.y) / (2 * D.r)) * 1000) / 1000 }); return; }
    if (v.sliding) { const S = P.sl; v.slider = Math.max(0, Math.min(1, (x - S.x) / S.w)); }
  },
  up(x, y) {
    const s = this.sim.s, v = this.v; v.pdown = false;
    if (s.ff && /hatch|gen|tgen|bred|auto|sons|reveal|sorted/.test(s.phase)) { /* faster stays on until the phase ends */ }
    if (v.drag) { const d = v.drag; v.drag = null; if (d.moved) { const id = this.bottleAt(x, y), st = id && this.sim.stock(s, id); if (st && st.sex === 'm') { Sim.act(this, { k: 'cross', f: d.id, m: id }); v.sel = null; } else this.whisper('drop'); } return; }
    if (v.beamOn) { v.beamOn = false; Sim.act(this, { k: 'off' }); }
    v.sliding = false;
  },
  onKey(k) {
    const s = this.sim.s, v = this.v;
    if (k === ' ' && /hatch|gen|tgen|bred|auto|sons|reveal|sorted/.test(s.phase)) { Sim.act(this, { k: 'ff', on: true }); return; }
    if (s.kind === 'cross' && s.phase === 'pick' && /^[1-9]$/.test(k)) { const B = this.shelf(), b = B[+k - 1]; if (!b) return; const st = this.sim.stock(s, b.id); if (st.sex === 'f') v.sel = b.id; else if (v.sel) { Sim.act(this, { k: 'cross', f: v.sel, m: b.id }); v.sel = null; } else this.whisper('pickF'); return; }
    if (s.kind === 'lamp' && s.phase === 'court') {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
      if (d) { v.kb = [Math.max(0.05, Math.min(0.95, v.kb[0] + d[0] * 0.06)), Math.max(0.05, Math.min(0.95, v.kb[1] + d[1] * 0.06))]; if (s.beam.on) Sim.act(this, { k: 'beam', x: v.kb[0], y: v.kb[1] }); return; }
      if (k === ' ') { if (s.unt) Sim.act(this, { k: 'flash', x: v.kb[0], y: v.kb[1] }); else Sim.act(this, s.beam.on ? { k: 'off' } : { k: 'beam', x: v.kb[0], y: v.kb[1] }); }
      return;
    }
    if (s.kind === 'gallery' && (s.phase === 'prior' || s.phase === 'post')) { if (k === 'ArrowLeft' || k === 'ArrowRight') { v.slider = Math.max(0, Math.min(1, (v.slider == null ? 0.5 : v.slider) + (k === 'ArrowRight' ? 0.05 : -0.05))); v.slider = Math.round(v.slider * 100) / 100; this._dockSig = ''; } }
  },
  teacherStep() { Sim.act(this, { k: 'ff', on: true }); },

  /* ---------- geometry (canvas px), recomputed per call ---------- */
  pos() {
    const W = Stage.w, H = Stage.h, u = Stage.u || Math.min(W, 1.2 * H), top = this.hudH() + 8, s = this.sim.s, bot = H - 10, ph = W < 600;
    const P = { W, H, u, top, bot, ph };
    // fly room: the shelf of stock bottles, the bench with the cross bottle and the sorting plate, the brass lamp
    P.shelfY = top + Math.max(54, Math.min(92, (bot - top) * 0.15)); P.bw = Math.max(36, Math.min(64, (W - 40) / 7.6)); P.bh = P.bw * 1.45;
    P.benchY = top + (bot - top) * (ph ? 0.5 : 0.52);
    const pw = Math.min(W * (ph ? 0.92 : 0.5), 460), phh = Math.min((bot - P.benchY) * 0.86, pw * 0.62);
    P.plate = { x: ph ? W / 2 : W * 0.62, y: P.benchY + (bot - P.benchY) * 0.5, w: pw, h: phh };
    P.cross = { x: ph ? W * 0.5 : W * 0.24, y: ph ? P.benchY - 8 : P.benchY + (bot - P.benchY) * 0.45, w: P.bw * 1.5, h: P.bw * 2.1 };
    if (ph) P.cross.y = P.shelfY + P.bh * 0.55 + (P.benchY - P.shelfY - P.bh * 0.55) * 0.5 + P.bw * 1.05;
    P.lampX = W - Math.max(40, W * 0.12); P.lampY = top + 6;
    // the cage (L1): a big cage bottle and the small autosome control
    const cr = Math.max(80, Math.min((bot - top) * 0.36, W * (ph ? 0.36 : 0.22)));
    P.cage = { x: ph ? W * 0.42 : W * 0.4, y: top + (bot - top) * 0.52, r: cr };
    P.ctl = { x: ph ? W * 0.84 : W * 0.75, y: top + (bot - top) * (ph ? 0.3 : 0.5), r: cr * 0.42 };
    P.jars = { x: ph ? W * 0.84 : W * 0.75, y: top + (bot - top) * (ph ? 0.66 : 0.82) };
    // the lamp (L2): the courtship dish under the lamp
    const dr = Math.max(100, Math.min((bot - top) * 0.42, W * (ph ? 0.45 : 0.3)));
    P.dish = { x: ph ? W / 2 : W * 0.45, y: top + (bot - top) * 0.55, r: dr };
    // the gallery (boss): the current portrait, her parents above, her sons below, the brass slider
    const fr = Math.max(48, Math.min((bot - top) * 0.15, W * 0.17));
    P.frame = { x: W / 2, y: top + (bot - top) * 0.36, r: fr };
    P.par = { y: top + fr * 0.62, r: fr * 0.42 };
    P.sonY = P.frame.y + fr * 1.95; P.sonR = Math.max(24, fr * 0.42);
    P.sl = { x: W * (ph ? 0.12 : 0.3), w: W * (ph ? 0.76 : 0.4), y: bot - Math.max(34, (bot - top) * 0.08) };
    return P;
  },
  shelf() {   // stock bottles in shelf order: females left, males right (keys 1–7 follow this order)
    const s = this.sim.s, P = this.pos(), F = s.stocks.filter(x => x.sex === 'f'), M = s.stocks.filter(x => x.sex === 'm'), n = F.length + M.length, gap = P.bw * 0.5;
    const tot = n * P.bw * 1.12 + gap, x0 = P.W / 2 - tot / 2 + P.bw * 0.56, out = [];
    F.forEach((st, i) => out.push({ id: st.id, x: x0 + i * P.bw * 1.12, y: P.shelfY }));
    M.forEach((st, i) => out.push({ id: st.id, x: x0 + F.length * P.bw * 1.12 + gap + i * P.bw * 1.12, y: P.shelfY }));
    return out;
  },
  bottleXY(id) { const b = this.shelf().find(q => q.id === id); return b ? [b.x, b.y] : [this.pos().W / 2, this.pos().shelfY]; },
  bottleAt(x, y) { const P = this.pos(); let best = null, bd = 1e9; for (const b of this.shelf()) { const dx = x - b.x, dy = y - b.y; if (Math.abs(dx) < P.bw * 0.62 && dy > -P.bh * 0.7 && dy < P.bh * 0.75) { const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = b.id; } } } return best; },
  trayXY(cls, k) {   // the k-th fly in tray cls (0 ♀ red, 1 ♀ white, 2 ♂ red, 3 ♂ white): a neat grid in each quarter of the plate
    const P = this.pos(), pl = P.plate, cw = pl.w / 2, chh = pl.h / 2, col = cls % 2, row = cls >> 1, per = 8, gx = (cw - 26) / per, gy = Math.min(gx * 0.9, (chh - 30) / 5);
    return [pl.x - pl.w / 2 + col * cw + 16 + (k % per + 0.5) * gx, pl.y - pl.h / 2 + row * chh + 24 + (Math.floor(k / per) + 0.5) * gy];
  },
  flyXY(f) { const s = this.sim.s, D = this.pos().dish, p = this.sim.flyPos(f, s.ct || 0); return [D.x + (p[0] - 0.5) * 2 * D.r, D.y + (p[1] - 0.5) * 2 * D.r]; },
  sonXY(i) { const s = this.sim.s, P = this.pos(), c = RY_CASES[s.ci], n = Math.max(1, c.sons.length), sp = Math.min(P.sonR * 2.9, (P.W - 30) / n); return [P.W / 2 + (i - (n - 1) / 2) * sp, P.sonY]; },

  /* ---------- drawing ---------- */
  draw(c, w, h) {
    const s = this.sim.s; if (!s) return;
    if (s.kind === 'cross') this.drawCross(c, w, h); else if (s.kind === 'cage') this.drawCage(c, w, h); else if (s.kind === 'lamp') this.drawLamp(c, w, h); else this.drawGallery(c, w, h);
    const v = this.v; if (typeof Lbl === 'undefined') return;
    if (v.banner) { const b = v.banner, a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; Lbl.put('ry-banner', b.text, w / 2, this.hudH() + 34, { size: 22, c, weight: 700 }); c.restore(); }
  },
  bake(key, w, h, fn) {   // static layers, baked once per size and key (never in the frame loop)
    const v = this.v, sz = Math.round(w) + 'x' + Math.round(h) + ':' + Math.round(this.hudH()); if (v.bgk !== sz) { v.bgk = sz; v.bgs = {}; } if (v.bgs[key]) return v.bgs[key];
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, cv = mkCanvas(Math.round(w * d), Math.round(h * d)), c = cv.getContext('2d'); c.scale(d, d); fn(c, w, h); v.bgs[key] = cv; return cv;
  },
  roomBg(c, W, H, P, deep) {   // Morgan's fly room: walnut panelling, a window of 1910 dusk, the bench, the shelf plank, the brass lamp
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1E1712'); g.addColorStop(0.55, RY_C.wall2); g.addColorStop(1, '#2A2019'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const r = rng(11); c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 1;
    for (let x = 0; x < W; x += 3) { c.globalAlpha = 0.05 + 0.08 * r(); c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (r() - 0.5) * 6, H); c.stroke(); } c.globalAlpha = 1;   // grain
    const pw = Math.max(90, W / 5);   // raised panels
    for (let x = 12; x < W - 20; x += pw) { c.strokeStyle = 'rgba(255,220,170,0.07)'; c.lineWidth = 2; c.strokeRect(x, P.top + 4, pw - 18, P.benchY - P.top - 30); c.strokeStyle = 'rgba(0,0,0,0.35)'; c.strokeRect(x + 3, P.top + 7, pw - 24, P.benchY - P.top - 36); }
    if (!deep) {   // a tall window onto a violet dusk over the rooftops (Columbia's Schermerhorn Hall, view only)
      const wx = P.ph ? W * 0.06 : W * 0.06, ww = P.ph ? W * 0.18 : W * 0.12, wy = P.top + 10, wh = Math.min(P.benchY - P.top - 50, ww * 1.9), sg = c.createLinearGradient(0, wy, 0, wy + wh);
      sg.addColorStop(0, '#3B3557'); sg.addColorStop(0.7, '#B9836A'); sg.addColorStop(1, '#D9A672'); c.fillStyle = sg; c.fillRect(wx, wy, ww, wh);
      c.fillStyle = '#231B22'; for (let i = 0; i < 6; i++) { const bx = wx + i * ww / 6, bh = wh * (0.12 + 0.2 * r()); c.fillRect(bx, wy + wh - bh, ww / 6 + 1, bh); }
      c.strokeStyle = '#5A4130'; c.lineWidth = 4; c.strokeRect(wx, wy, ww, wh); c.lineWidth = 2; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh * 0.45); c.lineTo(wx + ww, wy + wh * 0.45); c.stroke();
    }
    const bg = c.createLinearGradient(0, P.benchY, 0, H); bg.addColorStop(0, RY_C.bench); bg.addColorStop(1, RY_C.bench2); c.fillStyle = bg; c.fillRect(0, P.benchY, W, H - P.benchY);
    c.fillStyle = 'rgba(255,230,190,0.18)'; c.fillRect(0, P.benchY, W, 3);
    for (let i = 0; i < W / 4; i++) { c.strokeStyle = 'rgba(40,24,12,' + (0.08 + 0.12 * r()).toFixed(2) + ')'; c.lineWidth = 1; const y = P.benchY + 6 + r() * (H - P.benchY); c.beginPath(); c.moveTo(r() * W, y); c.lineTo(r() * W, y + (r() - 0.5) * 3); c.stroke(); }
  },
  lampLight(c, P, x, y, R0, k) {   // the warm cone of the brass lamp (live, so it can flicker on a flash)
    const g = c.createRadialGradient(x, y, 10, x, y, R0); g.addColorStop(0, 'rgba(255,226,166,' + (0.42 * k).toFixed(3) + ')'); g.addColorStop(0.6, 'rgba(255,214,140,' + (0.12 * k).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,214,140,0)');
    c.fillStyle = g; c.fillRect(x - R0, y - R0, 2 * R0, 2 * R0);
  },
  lampDraw(c, x, y, s) {   // a green-shaded brass bench lamp on a swing arm
    c.save(); c.strokeStyle = RY_C.brassD; c.lineWidth = 3; c.beginPath(); c.moveTo(x + s * 1.6, y - s * 0.6); c.lineTo(x + s * 0.4, y - s * 0.2); c.stroke();
    c.fillStyle = '#2E4A3A'; c.beginPath(); c.moveTo(x - s * 0.8, y + s * 0.4); c.quadraticCurveTo(x, y - s * 0.7, x + s * 0.8, y + s * 0.4); c.closePath(); c.fill(); c.strokeStyle = RY_C.brass; c.lineWidth = 2; c.stroke();
    c.fillStyle = RY_C.lamp; c.beginPath(); c.ellipse(x, y + s * 0.42, s * 0.62, s * 0.13, 0, 0, TAU); c.fill(); c.restore();
  },
  /* a fruit fly, top view: o {white (eyes), male (dark rounded tip; females larger with banded pointed abdomen), rot, alpha, down (on its back), wing (flutter)} */
  fly(c, x, y, sz, o) {
    o = o || {}; const m = !!o.male, L = sz * (m ? 0.9 : 1); c.save(); c.translate(x, y); c.rotate(o.rot || 0); if (o.alpha != null) c.globalAlpha *= o.alpha;
    if (o.down) { c.strokeStyle = RY_C.band; c.lineWidth = 1; for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(i * L * 0.12, 0); c.lineTo(i * L * 0.3, -L * 0.42); c.stroke(); } }
    const wf = o.wing || 0; c.fillStyle = 'rgba(236,240,240,0.55)'; c.strokeStyle = 'rgba(80,70,60,0.55)'; c.lineWidth = 0.8;
    for (const g of [-1, 1]) { c.beginPath(); c.ellipse(g * L * 0.16, L * 0.22, L * 0.13, L * (0.36 - 0.06 * wf), g * (0.35 + 0.25 * wf), 0, TAU); c.fill(); c.stroke(); }
    c.fillStyle = RY_C.body; c.beginPath(); c.ellipse(0, L * (m ? 0.2 : 0.24), L * (m ? 0.15 : 0.17), L * (m ? 0.24 : 0.3), 0, 0, TAU); c.fill();   // abdomen
    c.fillStyle = RY_C.band; if (m) { c.beginPath(); c.ellipse(0, L * 0.32, L * 0.13, L * 0.12, 0, 0, Math.PI); c.fill(); } else for (const k of [0.16, 0.27, 0.38]) c.fillRect(-L * 0.15, L * k, L * 0.3, L * 0.04);
    c.fillStyle = '#A07A44'; c.beginPath(); c.ellipse(0, -L * 0.06, L * 0.15, L * 0.14, 0, 0, TAU); c.fill();   // thorax
    c.fillStyle = '#B08A50'; c.beginPath(); c.ellipse(0, -L * 0.25, L * 0.11, L * 0.09, 0, 0, TAU); c.fill();   // head
    const er = L * 0.085; for (const g of [-1, 1]) { c.beginPath(); c.arc(g * L * 0.1, -L * 0.27, er, 0, TAU); c.fillStyle = o.white ? RY_C.white : RY_C.red; c.fill(); c.lineWidth = 1; c.strokeStyle = o.white ? '#8A8478' : '#5A1A14'; c.stroke(); }
    c.restore();
  },
  bottle(c, x, y, bw, bh, o) {   // a half-pint milk bottle with banana mash and a cotton plug; o {flies: [{white, male}], lift, sel, label, alpha, glow}
    o = o || {}; c.save(); if (o.alpha != null) c.globalAlpha *= o.alpha; const y0 = y - (o.lift || 0), top = y0 - bh * 0.5, bot = y0 + bh * 0.5, nw = bw * 0.32;
    if (o.sel || o.glow) { c.fillStyle = 'rgba(255,226,166,' + (o.sel ? 0.35 : 0.2 * o.glow).toFixed(3) + ')'; c.beginPath(); c.ellipse(x, y0, bw * 0.8, bh * 0.66, 0, 0, TAU); c.fill(); }
    c.beginPath(); c.moveTo(x - nw / 2, top + bh * 0.08); c.lineTo(x - nw / 2, top + bh * 0.2); c.quadraticCurveTo(x - bw / 2, top + bh * 0.3, x - bw / 2, top + bh * 0.48); c.lineTo(x - bw / 2, bot - 4); c.quadraticCurveTo(x - bw / 2, bot, x - bw / 2 + 4, bot);
    c.lineTo(x + bw / 2 - 4, bot); c.quadraticCurveTo(x + bw / 2, bot, x + bw / 2, bot - 4); c.lineTo(x + bw / 2, top + bh * 0.48); c.quadraticCurveTo(x + bw / 2, top + bh * 0.3, x + nw / 2, top + bh * 0.2); c.lineTo(x + nw / 2, top + bh * 0.08); c.closePath();
    c.fillStyle = RY_C.glass; c.fill();
    c.save(); c.clip(); c.fillStyle = RY_C.mash; c.fillRect(x - bw / 2, bot - bh * 0.2, bw, bh * 0.2); c.fillStyle = 'rgba(120,90,40,0.35)'; c.fillRect(x - bw / 2, bot - bh * 0.2, bw, 2);
    const fl = o.flies || []; fl.forEach((f, i) => { const fx = x + ((i * 37) % 7 - 3) * bw * 0.1, fy = top + bh * (0.42 + 0.12 * ((i * 3) % 4)); this.fly(c, fx, fy, Math.max(9, bw * 0.3), { white: f.white, male: f.male, rot: ((i * 1.7) % 3) - 1.5 }); });
    c.restore();
    c.lineWidth = 1.5; c.strokeStyle = RY_C.glassE; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x - bw / 2 + 4, top + bh * 0.45, 3, bh * 0.4);   // a highlight down the glass
    c.fillStyle = RY_C.plug; c.beginPath(); c.ellipse(x, top + bh * 0.06, nw * 0.62, bh * 0.07, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(120,100,70,0.6)'; c.lineWidth = 1; c.stroke();
    c.restore();
  },
  stockFlies(st) { if (st.sex === 'm') return [0, 1, 2].map(() => ({ white: st.white, male: true })); return [0, 1, 2].map(() => ({ white: st.white, male: false })); },
  stockLabel(st) { const L = this.content.labels; return st.lab === 'cF' ? Txt.f(L.cF, { n: st.no }) : L[st.lab]; },
  drawCross(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), L = this.content.labels;
    c.drawImage(this.bake('room', w, h, (cc, W, H) => this.roomBg(cc, W, H, P, false)), 0, 0, w, h);
    this.lampLight(c, P, P.cross.x, P.benchY, Math.max(w, h) * 0.55, 1);
    c.fillStyle = '#4A3322'; c.fillRect(0, P.shelfY + P.bh * 0.5, w, 8); c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(0, P.shelfY + P.bh * 0.5 + 8, w, 5);   // the shelf plank
    // the stock bottles
    const B = this.shelf();
    B.forEach((b, i) => {
      const st = this.sim.stock(s, b.id); if (!st) return; const dragging = v.drag && v.drag.id === b.id && v.drag.moved, nk = v.newStock[b.id];
      const target = v.drag && v.drag.moved && st.sex === 'm' && this.bottleAt(v.drag.cx || 0, v.drag.cy || 0) === b.id;
      this.bottle(c, b.x, b.y, P.bw, P.bh, { flies: this.stockFlies(st), lift: v.sel === b.id ? 8 : target ? 4 : 0, sel: v.sel === b.id || target, alpha: dragging ? 0.35 : 1, glow: nk != null ? Math.max(0, 1 - nk / 1.5) : 0 });
      Lbl.put('ry-st' + i, this.stockLabel(st), b.x, b.y + P.bh * 0.5 + 18, { size: 12, c });
    });
    if (v.drag && v.drag.moved) { const st = this.sim.stock(s, v.drag.id); if (st) this.bottle(c, v.drag.cx, v.drag.cy, P.bw, P.bh, { flies: this.stockFlies(st), sel: true }); }
    // the plate: four trays, the flies sorted by sex and eye colour (rung 0: the world is the chart)
    const pl = P.plate; c.fillStyle = '#F2EEE4'; c.beginPath(); c.roundRect ? c.roundRect(pl.x - pl.w / 2, pl.y - pl.h / 2, pl.w, pl.h, 10) : c.rect(pl.x - pl.w / 2, pl.y - pl.h / 2, pl.w, pl.h); c.fill();
    c.strokeStyle = '#B9AE98'; c.lineWidth = 1.5; c.stroke(); c.beginPath(); c.moveTo(pl.x, pl.y - pl.h / 2 + 6); c.lineTo(pl.x, pl.y + pl.h / 2 - 6); c.moveTo(pl.x - pl.w / 2 + 6, pl.y); c.lineTo(pl.x + pl.w / 2 - 6, pl.y); c.stroke();
    const cur = s.cur, keys = ['fr', 'fw', 'mr', 'mw'];
    for (let k = 0; k < 4; k++) {
      const col = k % 2, row = k >> 1, cx = pl.x - pl.w / 2 + col * pl.w / 2, cy = pl.y - pl.h / 2 + row * pl.h / 2;
      Lbl.put('ry-tr' + k, L[keys[k]], cx + 34, cy + 11, { size: 12, c, pill: false, ink: '#3A2E24' });
      const n = cur ? cur.kids[k] : 0; Lbl.put('ry-tn' + k, String(n), cx + pl.w / 2 - 18, cy + 12, { size: 14, c, pill: false, ink: '#3A2E24', weight: 700 });
      const shown = v.trays[k].length; for (let j = 0; j < shown; j++) { const q = this.trayXY(k, j); this.fly(c, q[0], q[1], Math.max(8, Math.min(14, pl.w / 34)), { white: k % 2 === 1, male: k > 1, rot: ((j * 2.3) % 2) - 1 }); }
    }
    // the cross bottle on the bench: the two parent bottles pour in, then pupae crack and flies hatch out to the trays
    const cb = P.cross;
    if (cur && (s.phase === 'hatch' || s.phase === 'ask' || s.phase === 'sorted')) {
      const F = this.sim.stock(s, cur.f), M = this.sim.stock(s, cur.m), left = cur.n - cur.i;
      this.bottle(c, cb.x, cb.y, cb.w, cb.h, { flies: [{ white: F && F.white, male: false }, { white: M && M.white, male: true }] });
      c.fillStyle = '#C7A86A'; for (let j = 0; j < Math.min(14, Math.ceil(left / 3)); j++) { const px = cb.x - cb.w * 0.35 + (j % 5) * cb.w * 0.17, py = cb.y - cb.h * 0.1 + Math.floor(j / 5) * cb.h * 0.1; c.beginPath(); c.ellipse(px, py, 3, 6, 0.3, 0, TAU); c.fill(); }   // pupae on the glass
      Lbl.put('ry-cno', Txt.f(L.crossN, { n: cur.no }), cb.x, cb.y + cb.h * 0.5 + 16, { size: 12, c });
    }
    if (v.pour) { const k = v.pour.t / 0.7, a = this.bottleXY(v.pour.f), b = this.bottleXY(v.pour.m); for (const p of [a, b]) { const x = p[0] + (cb.x - p[0]) * k, y = p[1] + (cb.y - p[1]) * k - 30 * Det.sin(Math.PI * k); this.fly(c, x, y, 14, { male: p === b, alpha: 1 - k * 0.5 }); } }
    for (const f of v.flies) { const k = f.t / f.d, e = k * k * (3 - 2 * k); this.fly(c, f.x0 + (f.x1 - f.x0) * e, f.y0 + (f.y1 - f.y0) * e - 26 * Det.sin(Math.PI * k), 12, { white: f.cls % 2 === 1, male: f.cls > 1, wing: Det.sin(v.t * 40) }); }
    // the notebook: four goals, ticked as they are met; the vials left
    const g = s.goals, nbx = P.ph ? 10 : 14, nby = P.ph ? P.benchY + 6 : P.benchY + 10, done = [g.f1, g.f2, g.wf, g.rev];
    if (!P.ph) { c.fillStyle = 'rgba(239,230,210,0.92)'; c.fillRect(nbx, nby, 150, 104); c.strokeStyle = '#8A7A5E'; c.lineWidth = 1; c.strokeRect(nbx, nby, 150, 104); }
    ['g1', 'g2', 'g3', 'g4'].forEach((k, i) => {
      const yy = P.ph ? P.benchY - 10 - (3 - i) * 0 : nby + 16 + i * 22, xx = P.ph ? 14 + i * (w - 28) / 4 : nbx + 10;
      if (P.ph) { const cx = xx + (w - 28) / 8; c.beginPath(); c.arc(cx, P.top + 10 + 0, 0, 0, 0); this.tick(c, cx - 30, yy, done[i]); Lbl.put('ry-g' + i, L[k], cx + 4, yy, { size: 12, c, pill: true }); }
      else { this.tick(c, xx + 6, yy, done[i]); Lbl.put('ry-g' + i, L[k], xx + 22, yy, { size: 12, c, pill: false, ink: '#3A2E24', align: 'left' }); }
    });
    const vx = P.ph ? w - 16 - 6 * 14 : 24, vy = P.ph ? P.cross.y - 16 : nby + 132;
    for (let i = 0; i < this.sim.P().vials.v; i++) { const full = i < s.left; c.fillStyle = full ? 'rgba(222,232,226,0.5)' : 'rgba(222,232,226,0.12)'; c.fillRect(vx + i * 14, vy, 9, 26); c.strokeStyle = 'rgba(240,246,242,0.6)'; c.lineWidth = 1; c.strokeRect(vx + i * 14, vy, 9, 26); if (full) { c.fillStyle = RY_C.mash; c.fillRect(vx + i * 14 + 1, vy + 18, 7, 7); } }
    Lbl.put('ry-vl', L.vials, vx + this.sim.P().vials.v * 7 - 2, vy + 40, { size: 12, c });
    if (s.phase === 'ask') { c.fillStyle = 'rgba(10,8,6,0.18)'; c.fillRect(0, 0, w, h); }
  },
  tick(c, x, y, on) { c.save(); c.strokeStyle = on ? '#2F6B3A' : 'rgba(90,80,60,0.6)'; c.lineWidth = on ? 2.5 : 1.2; c.strokeRect(x - 6, y - 6, 12, 12); if (on) { c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x - 1, y + 4); c.lineTo(x + 6, y - 6); c.stroke(); } c.restore(); },
  /* the zigzag cage: one big bottle of flies (a sample of the cage), the autosome control, and the X-copy jars (allele inks) */
  cageFlies(cage, N, n, salt) {   // n flies drawn as a sample: white-eyed share by sex from the counts; positions from a hash (view only)
    const out = [], nf = Math.round(n / 2), M = cage.M, wm = M.length === 3 ? M[2] / N : M[1] / N, wf = cage.F[2] / N, kf = Math.round(nf * wf), km = Math.round((n - nf) * wm);
    for (let i = 0; i < n; i++) { const male = i >= nf, j = male ? i - nf : i; out.push({ male, white: male ? j < km : j < kf, h: this.hash(salt + ':' + i) }); }
    return out;
  },
  drawCageBottle(c, x, y, r, flies, t, lab) {
    c.save(); c.fillStyle = 'rgba(222,232,226,0.16)'; c.beginPath(); c.ellipse(x, y, r * 0.78, r, 0, 0, TAU); c.fill(); c.strokeStyle = RY_C.glassE; c.lineWidth = 2; c.stroke();
    c.save(); c.beginPath(); c.ellipse(x, y, r * 0.78, r, 0, 0, TAU); c.clip(); c.fillStyle = RY_C.mash; c.fillRect(x - r, y + r * 0.62, 2 * r, r);
    const calm = typeof Fx !== 'undefined' && Fx.calm;
    for (const f of flies) { const a = (f.h % 628) / 100, rr = ((f.h >> 10) % 100) / 100, sp = 0.25 + ((f.h >> 17) % 50) / 100, ang = a + (calm ? 0 : t * sp * 0.4), fx = x + Det.cos(ang) * r * 0.62 * Math.sqrt(rr), fy = y - r * 0.15 + Det.sin(ang * 1.3) * r * 0.62 * Math.sqrt(rr); this.fly(c, fx, fy, Math.max(9, r * 0.12), { white: f.white, male: f.male, rot: ang + 1.57 }); }
    c.restore();
    c.fillStyle = RY_C.plug; c.beginPath(); c.ellipse(x, y - r * 1.02, r * 0.3, r * 0.08, 0, 0, TAU); c.fill();
    if (lab) Lbl.put('ry-cl' + Math.round(x), lab, x, y + r + 16, { size: 12, c });
    c.restore();
  },
  jars(c, x, y, qf, qm, s0) {   // allele read-out: X copies as rods, blue + and amber w (D6: allele inks only here); ♀ two rods per fly, ♂ one plus a Y bar
    const T = typeof Pal !== 'undefined' ? Pal : null, A = T ? String(T.A) : '#6B97FF', a = T ? String(T.a) : '#F2C94C', L = this.content.labels, n = 10, wR = s0 * 0.11, gap = s0 * 0.04;
    const row = (yy, q, k, lab, male) => { const nw = Math.round(n * q); for (let i = 0; i < n; i++) { const xx = x - (n * (wR + gap)) / 2 + i * (wR + gap); c.fillStyle = i < n - nw ? A : a; c.fillRect(xx, yy - s0 * 0.16, wR, s0 * 0.32); c.strokeStyle = RY_C.ink; c.lineWidth = 1; c.strokeRect(xx, yy - s0 * 0.16, wR, s0 * 0.32); }
      Lbl.put('ry-jl' + k, lab, x, yy + s0 * 0.16 + 13, { size: 12, c }); Lbl.put('ry-jp' + k, Math.round(100 * q) + '%', x + (n * (wR + gap)) / 2 + 22, yy, { size: 13, c, weight: 700 }); void male; };
    row(y - s0 * 0.42, qf, 0, L.fem, false); row(y + s0 * 0.42, qm, 1, L.male, true);
  },
  drawCage(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), L = this.content.labels, N = s.N;
    c.drawImage(this.bake('room2', w, h, (cc, W, H) => this.roomBg(cc, W, H, P, true)), 0, 0, w, h);
    this.lampLight(c, P, P.cage.x, P.cage.y - P.cage.r, Math.max(w, h) * 0.6, 1 + v.glow);
    const tc = s.phase === 'tgen' || (s.ask && s.ask.id === 't') || (s.phase === 'over' && s.tc), cage = tc ? s.tc : s.cage;
    this.drawCageBottle(c, P.cage.x, P.cage.y, P.cage.r, this.cageFlies(cage, N, 44, (tc ? 'T' : 'C') + (tc ? s.tg : s.g)), v.t, tc ? L.newcage : s.auts ? L.ctl : L.xcage);
    if (s.ctl && !tc) this.drawCageBottle(c, P.ctl.x, P.ctl.y, P.ctl.r, this.cageFlies(s.ctl, N, 12, 'A' + s.g), v.t, L.ctl);
    const qf = this.sim.qF(cage.F, N), qm = this.sim.qM(cage.M, N), hide = s.ask && s.ask.id !== 't';   // during a zigzag ask the jars show the cage now, never the answer
    void hide; this.jars(c, P.jars.x, P.jars.y, qf, qm, Math.max(70, Math.min(130, P.cage.r * 0.9)));
    if (s.phase === 'ask') { c.fillStyle = 'rgba(10,8,6,0.16)'; c.fillRect(0, 0, w, h); }
  },
  /* the lamp: the courtship dish under the brass lamp; the beam is where the pointer is */
  drawLamp(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), D = P.dish, L = this.content.labels;
    c.drawImage(this.bake('room3', w, h, (cc, W, H) => this.roomBg(cc, W, H, P, true)), 0, 0, w, h);
    c.fillStyle = 'rgba(8,6,4,0.35)'; c.fillRect(0, 0, w, h);   // the room is dim; the lamp is the light
    this.lampDraw(c, P.lampX, P.lampY + 16, Math.max(18, P.u * 0.05));
    // the dish: a wide glass mating chamber on white filter paper
    c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(D.x + 6, D.y + 10, D.r * 1.02, D.r * 1.02, 0, 0, TAU); c.fill();
    c.fillStyle = '#5A5246'; c.beginPath(); c.arc(D.x, D.y, D.r, 0, TAU); c.fill();
    const g = c.createRadialGradient(D.x, D.y, D.r * 0.1, D.x, D.y, D.r); g.addColorStop(0, '#6E665A'); g.addColorStop(1, '#4A443A'); c.fillStyle = g; c.beginPath(); c.arc(D.x, D.y, D.r * 0.97, 0, TAU); c.fill();
    const on = s.phase === 'court' && s.beam.on && s.bat > 0, bx = D.x + (s.beam.x - 0.5) * 2 * D.r, by = D.y + (s.beam.y - 0.5) * 2 * D.r, br = RY_T.beamR * 2 * D.r;
    if (on) { const bg = c.createRadialGradient(bx, by, br * 0.2, bx, by, br * 1.25); bg.addColorStop(0, 'rgba(255,240,200,0.85)'); bg.addColorStop(0.75, 'rgba(255,226,166,0.5)'); bg.addColorStop(1, 'rgba(255,226,166,0)'); c.fillStyle = bg; c.beginPath(); c.arc(bx, by, br * 1.25, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,240,200,0.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(P.lampX, P.lampY + 24); c.lineTo(bx - br, by); c.moveTo(P.lampX, P.lampY + 24); c.lineTo(bx + br, by); c.stroke(); }
    if (v.flash) { const k = 1 - v.flash.t / 0.5; c.fillStyle = 'rgba(255,240,200,' + (0.8 * k).toFixed(3) + ')'; c.beginPath(); c.arc(v.flash.x, v.flash.y, br * 1.25, 0, TAU); c.fill(); }
    // females (view only: the dish holds a few; white-eyed ones are rare, about q²) and the males (the sim's flies)
    const N = s.N, wf = s.cage.F[2] / N, nf = 14, kf = Math.round(nf * wf);
    for (let i = 0; i < nf; i++) { const hh = this.hash('f' + s.g + ':' + i), a = (hh % 628) / 100, rr = 0.2 + 0.6 * ((hh >> 9) % 100) / 100; this.fly(c, D.x + Det.cos(a) * D.r * rr * 0.85, D.y + Det.sin(a) * D.r * rr * 0.85, Math.max(12, D.r * 0.11), { white: i < kf, male: false, rot: a }); }
    if (s.flies && (s.phase === 'court' || s.phase === 'bred')) s.flies.forEach((f, i) => {
      const p = this.flyXY(f), st = v.stumbles[i], lit = on && (p[0] - bx) * (p[0] - bx) + (p[1] - by) * (p[1] - by) < br * br, calm = typeof Fx !== 'undefined' && Fx.calm;
      const rot = f.c ? 3.14 + (st != null ? Math.min(1, st * 3) * 0.6 : 0.6) : (s.ct * f.wx * 0.7 + f.p1), wob = lit && f.w && !f.c && !calm ? Det.sin(v.t * 30) * 0.4 : 0;
      this.fly(c, p[0], p[1], Math.max(11, D.r * 0.1), { white: f.w, male: true, rot: rot + wob, down: f.c, wing: f.c ? 0 : (calm ? 0 : Math.abs(Det.sin(v.t * 9 + i))) });
      if (f.w && !f.c && lit) { c.strokeStyle = 'rgba(255,240,200,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(p[0], p[1], 12, -1.57, -1.57 + TAU * Math.min(1, f.ex / RY_T.expo)); c.stroke(); }   // the exposure ring fills before he stumbles
    });
    else if (s.phase === 'auto' || s.phase === 'ask' || s.phase === 'over') { const fl = this.cageFlies(s.cage, N, 30, 'L' + s.g); fl.forEach((f, i) => { if (!f.male) return; const a = (f.h % 628) / 100 + v.t * 0.2, rr = 0.25 + 0.6 * ((f.h >> 9) % 100) / 100; this.fly(c, D.x + Det.cos(a) * D.r * rr * 0.85, D.y + Det.sin(a) * D.r * rr * 0.85, Math.max(11, D.r * 0.1), { white: f.white, male: true, rot: a + 1.57 }); void i; }); }
    // the battery gauge (brass), the catch tally, the mutation tag
    if (s.phase === 'court') {
      const gx = P.ph ? 16 : Math.max(16, D.x - D.r - 70), gy = P.ph ? D.y + D.r + 18 : D.y - D.r * 0.6, gw = P.ph ? w * 0.45 : 26, gh = P.ph ? 12 : D.r * 1.2, k = s.bat0 > 0 ? s.bat / s.bat0 : 0;
      c.fillStyle = '#2A2019'; c.fillRect(gx, gy, gw, gh); c.fillStyle = RY_C.lamp; if (P.ph) c.fillRect(gx + 2, gy + 2, (gw - 4) * k, gh - 4); else c.fillRect(gx + 2, gy + 2 + (gh - 4) * (1 - k), gw - 4, (gh - 4) * k);
      c.strokeStyle = RY_C.brass; c.lineWidth = 2; c.strokeRect(gx, gy, gw, gh); Lbl.put('ry-bat', L.battery, P.ph ? gx + gw / 2 : gx + gw / 2, P.ph ? gy + gh + 14 : gy + gh + 16, { size: 12, c });
      Lbl.put('ry-ct', s.cg + ' / ' + s.nw, P.ph ? w - 50 : D.x + D.r + 50, P.ph ? gy + 6 : D.y - D.r * 0.5, { size: 16, c, weight: 700 });
    }
    const last = s.hist[s.hist.length - 1];
    Lbl.put('ry-wm', Txt.f(L.wm, { n: (Math.round(1000 * last.wm) / 10).toFixed(1) }), P.ph ? w * 0.28 : D.x + D.r + 70, P.ph ? D.y - D.r - 14 : D.y + D.r * 0.2, { size: 13, c });
    Lbl.put('ry-wf', Txt.f(L.wfem, { n: (Math.round(1000 * last.wf) / 10).toFixed(1) }), P.ph ? w * 0.72 : D.x + D.r + 70, P.ph ? D.y - D.r - 14 : D.y + D.r * 0.2 + 26, { size: 13, c });
    Lbl.put('ry-xn', L.xN, 12, h - 14, { align: 'left', size: 12, c });
    if (s.phase === 'ask') { c.fillStyle = 'rgba(10,8,6,0.18)'; c.fillRect(0, 0, w, h); }
  },
  /* the gallery: burgundy damask, gold frames, sepia portraits; the pedigree is read one woman at a time */
  galleryBg(c, W, H, P) {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4A1621'); g.addColorStop(1, '#2E0E15'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(140,60,70,0.16)';   // damask: a repeating fleur pattern
    for (let y = 0; y < H; y += 46) for (let x = (y / 46) % 2 ? 23 : 0; x < W + 23; x += 46) { c.beginPath(); c.ellipse(x, y, 7, 12, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x - 9, y + 6, 5, 3, 0.6, 0, TAU); c.ellipse(x + 9, y + 6, 5, 3, -0.6, 0, TAU); c.fill(); }
    c.fillStyle = '#2A1A12'; c.fillRect(0, H - 26, W, 26); c.fillStyle = RY_C.goldD; c.fillRect(0, H - 28, W, 2);   // dado rail and wainscot
    c.fillStyle = RY_C.goldD; c.fillRect(0, P.top - 4, W, 3);   // picture rail
  },
  portrait(id, look, r, male, aff) {   // a sepia bust in an oval (women) or a square (men), cached per id and size (pedigree shapes: circle ♀, square ♂)
    const key = id + ':' + Math.round(r) + (aff ? 'a' : ''), v = this.v; if (v.portraits[key]) return v.portraits[key];
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, S = Math.ceil(r * 2.6), cv = mkCanvas(S * d, S * d), c = cv.getContext('2d'); c.scale(d, d);
    const cx = S / 2, cy = S / 2, rr = rng(look * 97 + 13);
    c.save(); c.beginPath(); if (male) c.rect(cx - r * 0.8, cy - r, r * 1.6, r * 2); else c.ellipse(cx, cy, r * 0.8, r, 0, 0, TAU); c.clip();
    const bg = c.createRadialGradient(cx, cy - r * 0.2, r * 0.1, cx, cy, r * 1.2); bg.addColorStop(0, '#D9C49C'); bg.addColorStop(1, '#8E7350'); c.fillStyle = bg; c.fillRect(0, 0, S, S);
    const dark = male ? '#2E241C' : ['#3B2A20', '#4A3426', '#2F2621'][look % 3];
    c.fillStyle = dark; c.beginPath(); c.ellipse(cx, cy + r * 0.95, r * 0.75, r * 0.55, 0, 0, TAU); c.fill();   // shoulders
    if (!male) { c.fillStyle = '#E8DCC2'; c.beginPath(); c.moveTo(cx - r * 0.18, cy + r * 0.45); c.lineTo(cx, cy + r * 0.62); c.lineTo(cx + r * 0.18, cy + r * 0.45); c.closePath(); c.fill(); }   // lace collar
    c.fillStyle = '#C9B08A'; c.fillRect(cx - r * 0.09, cy + r * 0.2, r * 0.18, r * 0.25);   // neck
    c.fillStyle = '#D6BF98'; c.beginPath(); c.ellipse(cx, cy - r * 0.05, r * 0.27, r * 0.34, 0, 0, TAU); c.fill();   // face
    c.fillStyle = '#4A3828';
    if (male) { c.beginPath(); c.ellipse(cx, cy - r * 0.32, r * 0.29, r * 0.14, 0, Math.PI, 0); c.fill(); if (rr() < 0.7) { c.beginPath(); c.ellipse(cx, cy + r * 0.12, r * 0.16, r * 0.06 + r * 0.08 * rr(), 0, 0, Math.PI); c.fill(); } }
    else { c.beginPath(); c.ellipse(cx, cy - r * 0.28, r * 0.31, r * 0.2, 0, Math.PI, 0); c.fill(); c.beginPath(); c.arc(cx - r * 0.28, cy - r * 0.08, r * 0.1, 0, TAU); c.arc(cx + r * 0.28, cy - r * 0.08, r * 0.1, 0, TAU); c.fill(); if (look % 2) { c.beginPath(); c.arc(cx, cy - r * 0.5, r * 0.12, 0, TAU); c.fill(); } }   // centre parting, side curls, a bun
    c.fillStyle = 'rgba(60,40,26,0.75)'; c.fillRect(cx - r * 0.12, cy - r * 0.07, r * 0.06, r * 0.03); c.fillRect(cx + r * 0.06, cy - r * 0.07, r * 0.06, r * 0.03);
    c.fillStyle = 'rgba(120,90,60,0.18)'; for (let i = 0; i < 90; i++) c.fillRect(rr() * S, rr() * S, 1.2, 1.2);   // foxing
    if (aff) { c.fillStyle = 'rgba(27,22,18,0.62)'; c.fillRect(0, 0, S, S); }   // pedigree convention: an affected man's square is filled
    c.restore();
    c.lineWidth = Math.max(4, r * 0.14); c.strokeStyle = RY_C.gold; c.beginPath(); if (male) c.rect(cx - r * 0.8, cy - r, r * 1.6, r * 2); else c.ellipse(cx, cy, r * 0.8, r, 0, 0, TAU); c.stroke();
    c.lineWidth = 1.5; c.strokeStyle = RY_C.goldD; c.beginPath(); if (male) c.rect(cx - r * 0.8 - r * 0.08, cy - r - r * 0.08, r * 1.76, r * 2.16); else c.ellipse(cx, cy, r * 0.88, r * 1.08, 0, 0, TAU); c.stroke();
    if (aff) { c.fillStyle = RY_C.paper; c.fillRect(cx - r * 0.22, cy - r * 0.22, r * 0.44, r * 0.44); c.fillStyle = RY_C.ink; c.fillRect(cx - r * 0.16, cy - r * 0.16, r * 0.32, r * 0.32); }   // the filled-square glyph
    v.portraits[key] = cv; return cv;
  },
  drawPortrait(c, id, look, x, y, r, male, aff, alpha) { const cv = this.portrait(id, look, r, male, aff), S = cv.width / ((typeof Stage !== 'undefined' && Stage.dpr) || 1); c.save(); if (alpha != null) c.globalAlpha *= alpha; c.drawImage(cv, x - S / 2, y - S / 2, S, S); c.restore(); },
  drawGallery(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), L = this.content.labels, ca = RY_CASES[s.ci], fr = P.frame;
    c.drawImage(this.bake('gal', w, h, (cc, W, H) => this.galleryBg(cc, W, H, P)), 0, 0, w, h);
    const lg = c.createRadialGradient(fr.x, fr.y - fr.r, 10, fr.x, fr.y, fr.r * 3); lg.addColorStop(0, 'rgba(255,226,166,0.32)'); lg.addColorStop(1, 'rgba(255,226,166,0)'); c.fillStyle = lg; c.fillRect(0, 0, w, h);   // the picture light
    // the rail of finished cases: mini frames with their exact plaque
    const done = s.ci + (s.phase === 'reveal' ? 1 : 0);
    // parents: mother (oval) and father (square), small, with a gold cord down to her
    const mx = fr.x - fr.r * 1.25, fx = fr.x + fr.r * 1.25, py = P.par.y, pr = P.par.r;
    c.strokeStyle = RY_C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(mx + pr, py); c.lineTo(fx - pr, py); c.moveTo(fr.x, py); c.lineTo(fr.x, fr.y - fr.r * 1.05); c.stroke();
    const momId = ca.mother || 'helenaW', mum = ca.mother === 'victoria' ? 'Queen Victoria' : ca.mother ? (RY_CASES.find(q => q.id === ca.mother) || {}).name : 'Helena of Waldeck';
    this.drawPortrait(c, momId, 7 + (ca.look % 3), mx, py, pr, false, false);
    this.drawPortrait(c, 'dad' + ca.id, 11 + ca.look, fx, py, pr, true, !!ca.fatherAff);
    Lbl.put('ry-mum', mum.split(' ').slice(-2).join(' '), mx, py + pr + 14, { size: 12, c });
    Lbl.put('ry-dad', ca.fatherAff ? ca.fatherAff : L.father, fx, py + pr + 14, { size: 12, c });
    const mp = ca.mother === 'victoria' ? 1 : ca.mother ? s.post[ca.mother] : 0;
    Lbl.put('ry-mp', ca.mother ? Txt.f(L.exact, { p: Math.round(100 * mp) }) : L.notc, mx, py - pr - 12, { size: 12, c });
    if (ca.fatherAff) Lbl.put('ry-fa', L.aff, fx, py - pr - 12, { size: 12, c });
    // her portrait, name plate and the plaque
    this.drawPortrait(c, ca.id, ca.look, fr.x, fr.y, fr.r, false, false);
    c.fillStyle = RY_C.goldD; c.fillRect(fr.x - 70, fr.y + fr.r * 1.12, 140, 22); c.fillStyle = RY_C.gold; c.fillRect(fr.x - 68, fr.y + fr.r * 1.12 + 2, 136, 18);
    Lbl.put('ry-name', ca.name, fr.x, fr.y + fr.r * 1.12 + 11, { size: 13, c, pill: false, ink: RY_C.ink, weight: 700 });
    Lbl.put('ry-yrs', ca.yrs, fr.x, fr.y + fr.r * 1.12 + 34, { size: 12, c });
    // the sons, stepping forward one at a time (squares; filled when affected)
    const rev = s.phase === 'prior' ? 0 : s.phase === 'sons' ? s.son : ca.sons.length;
    if (s.phase !== 'prior' && !ca.sons.length) Lbl.put('ry-none', L.none, fr.x, P.sonY, { size: 13, c });
    for (let i = 0; i < rev; i++) { const so = ca.sons[i], q = this.sonXY(i), sv = v.sons.find(z => z.i === i), k = sv ? Math.min(1, sv.t / 0.35) : 1; if (sv) sv.t += 1 / 60; this.drawPortrait(c, ca.id + 's' + i, 20 + i + ca.look, q[0], q[1] + (1 - k) * 20, P.sonR, true, !!so[1], k); Lbl.put('ry-son' + i, so[0], q[0], q[1] + P.sonR * 1.15 + 12, { size: 12, c }); if (so[1]) Lbl.put('ry-sa' + i, L.aff, q[0], q[1] - P.sonR * 1.1 - 10, { size: 12, c }); }
    if (rev > 0 || s.phase !== 'prior') { c.strokeStyle = RY_C.gold; c.lineWidth = 1.5; if (ca.sons.length) { const a = this.sonXY(0), b = this.sonXY(ca.sons.length - 1), yy = P.sonY - P.sonR * 1.4; c.beginPath(); c.moveTo(fr.x, fr.y + fr.r * 1.12 + 42); c.lineTo(fr.x, yy); c.moveTo(a[0], yy); c.lineTo(b[0], yy); for (let i = 0; i < Math.min(rev, ca.sons.length); i++) { const q = this.sonXY(i); c.moveTo(q[0], yy); c.lineTo(q[0], q[1] - P.sonR * 1.05); } c.stroke(); } }
    // the brass slider (your estimate) and, after sealing, the exact plaque and the two-worlds bar (Bayes as areas)
    const S = P.sl, J = s.judg.filter(x => x.id === ca.id), jp = J.find(x => x.st === 'prior'), jq = J.find(x => x.st === 'post');
    c.fillStyle = '#2A1A12'; c.fillRect(S.x - 10, S.y - 9, S.w + 20, 18); c.fillStyle = RY_C.goldD; c.fillRect(S.x, S.y - 3, S.w, 6);
    for (let k = 0; k <= 10; k++) { c.fillStyle = RY_C.gold; c.fillRect(S.x + S.w * k / 10 - 0.5, S.y + 5, 1, k % 5 ? 4 : 8); }
    Lbl.put('ry-s0', '0%', S.x, S.y + 22, { size: 12, c }); Lbl.put('ry-s1', '100%', S.x + S.w, S.y + 22, { size: 12, c }); Lbl.put('ry-sl', L.chance, S.x + S.w / 2, S.y - 22, { size: 12, c });
    const knob = (val, ghost) => { const x = S.x + S.w * val; c.save(); if (ghost) c.globalAlpha = 0.45; c.fillStyle = RY_C.gold; c.beginPath(); c.moveTo(x, S.y - 12); c.lineTo(x + 9, S.y); c.lineTo(x, S.y + 12); c.lineTo(x - 9, S.y); c.closePath(); c.fill(); c.strokeStyle = RY_C.ink; c.lineWidth = 1.5; c.stroke(); c.restore(); };
    if (jp && s.phase !== 'prior') knob(jp.v, true);
    if ((s.phase === 'prior' || s.phase === 'post') && v.slider != null) { knob(v.slider, false); Lbl.put('ry-sv', Txt.f(L.youP, { p: Math.round(100 * v.slider) }), S.x + S.w * v.slider, S.y - 40, { size: 14, c, weight: 700 }); }
    if (s.phase === 'reveal' && jq) {
      knob(jq.v, false); const ex = jq.e, x = S.x + S.w * ex; c.strokeStyle = RY_C.paper; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, S.y - 16); c.lineTo(x, S.y + 16); c.stroke();
      Lbl.put('ry-ex', Txt.f(L.exact, { p: Math.round(100 * ex) }), x, S.y - 40, { size: 14, c, weight: 700 });
      const bw = Math.min(260, w * 0.62), bx = w / 2 - bw / 2, byy = S.y - 78, pr0 = s.cur.prior, nU = ca.sons.filter(z => !z[1]).length, aff = ca.sons.some(z => z[1]);
      let cs = pr0; for (let k = 0; k < nU; k++) cs *= 0.5; if (aff) cs = pr0 * 0.5; const ns = aff ? 0 : 1 - pr0, tot = cs + ns || 1;   // carrier world shrinks by ½ per unaffected son; an affected son rules out the other world
      c.fillStyle = RY_C.paper; c.fillRect(bx, byy, bw * cs / tot, 14); c.fillStyle = 'rgba(239,230,210,0.25)'; c.fillRect(bx + bw * cs / tot, byy, bw * ns / tot, 14); c.strokeStyle = RY_C.gold; c.lineWidth = 1; c.strokeRect(bx, byy, bw, 14);
      Lbl.put('ry-wc', L.carrier, bx + 2, byy - 10, { size: 12, c, align: 'left' }); Lbl.put('ry-wn', L.notc, bx + bw - 2, byy - 10, { size: 12, c, align: 'right' });
    }
    // the rail: completed women as small plaques along the top edge
    for (let i = 0; i < Math.min(done, RY_CASES.length); i++) { const q = RY_CASES[i], x = 18 + i * Math.min(44, (w - 36) / 6), y = P.top + 4; c.fillStyle = RY_C.goldD; c.fillRect(x - 2, y - 2, 34, 18); c.fillStyle = RY_C.paper; c.fillRect(x, y, 30, 14); void q; Lbl.put('ry-rl' + i, Math.round(100 * s.post[RY_CASES[i].id]) + '%', x + 15, y + 7, { size: 12, c, pill: false, ink: RY_C.ink }); }
    if (s.phase === 'ask' || s.phase === 'end') { c.fillStyle = 'rgba(10,6,6,0.3)'; c.fillRect(0, 0, w, h); }
  },

  /* ---------- the live strip (notes() is the LiveGraph data provider) ---------- */
  notes() {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    const D = this.content.data, n = this.level, stats = [], row = (d, vars) => stats.push([d[0], Txt.f(d[1], vars), d[2] ? Txt.f(d[2], vars) : '']), pc = x => Math.round(100 * x);
    if (n === 0) { row(D.vials, { n: s.left }); row(D.crosses, { n: s.crosses.length }); return { stats, charts: [this.sonsSpec(), this.hatchSpec()] }; }
    if (n === 1) { const h = s.hist[s.hist.length - 1]; row(D.qf, { p: pc(h.qf) }); row(D.qm, { p: pc(h.qm) }); row(D.gap, { d: pc(h.qf - h.qm) }); return { stats, charts: [this.zigSpec(), this.copiesSpec()] }; }
    if (n === 2) { const h = s.hist[s.hist.length - 1]; row(D.qm, { p: pc(h.qm) }); row(D.caught, { a: s.caught + (s.phase === 'court' ? s.cg : 0), b: s.shown + (s.phase === 'court' ? s.nw : 0) }); if (s.phase === 'court') row(D.bat, { p: pc(s.bat0 ? s.bat / s.bat0 : 0) }); return { stats, charts: [this.incSpec(), this.whereSpec()] }; }
    const sc = this.sim.galScore(s); row(D.score, sc); return { stats, charts: [s.ask && s.ask.id === 'cv' || s.phase === 'end' || (s.phase === 'over' && s.pred.cv !== undefined) ? this.cvSpec() : this.oddsSpec(), this.errSpec()] };
  },
  sonsSpec() {   // L0: white share of sons (discs) and daughters (squares) per cross; the expectation dashed only after the ask is scored
    const s = this.sim.s, D = this.content.data, dots = [], lines = [], nC = this.sim.P().vials.v;
    s.crosses.forEach(c => { const done = c.i >= c.n || c !== s.cur || s.phase === 'sorted'; const ns = c.kids[2] + c.kids[3], nd = c.kids[0] + c.kids[1]; if (ns) dots.push({ x: c.kids[3] / ns, y: c.no, shape: 'disc' }); if (nd) dots.push({ x: c.kids[1] / nd, y: c.no, shape: 'square' }); void done; });
    for (const id of ['a', 'b']) if (s.hits[id] !== undefined && s.atOf && s.atOf[id]) { const no = s.atOf[id]; lines.push({ pts: [[s.exp[id], no - 0.35], [s.exp[id], no + 0.35]], label: D.lines.exp }); }
    return { type: 'ry_xy', title: D.titles.sons, x: { lo: 0, hi: 1, label: D.ax.share, fmt: 'pct' }, y: { lo: 0.4, hi: nC + 0.6, label: D.ax.cross, fmt: 'int' }, yticks: [1, nC], frame: 'designed', dots, lines, dotLabel: dots.length ? D.lines.sons : null, legend: [['disc', D.lines.sons], ['square', D.lines.daus]] };
  },
  hatchSpec() { const s = this.sim.s, D = this.content.data, L = this.content.labels, k = s.cur ? s.cur.kids : [0, 0, 0, 0], mx = Math.max(10, s.cur ? s.cur.n * 0.6 : 10); return { type: 'ry_xy', title: D.titles.hatch, fold: false, x: { lo: 0, hi: 4 }, y: { lo: 0, hi: mx, label: D.ax.n, fmt: 'int' }, noX: true, frame: 'designed', bars: [L.fr, L.fw, L.mr, L.mw].map((lab, i) => ({ x: i + 0.5, y: k[i], label: lab, hatch: i % 2 === 1 })) }; },
  zigSpec() {   // L1: white share of X copies in females (discs) and males (squares) by generation; the control faint; the average dashed after the asks
    const s = this.sim.s, D = this.content.data, tc = s.th && (s.phase === 'tgen' || s.phase === 'over' || (s.ask && s.ask.id === 't'));
    if (tc) { const th = s.th, ser = [{ pts: th.map((h, i) => [i, h.qf]), shape: 'disc', label: D.lines.fem }, { pts: th.map((h, i) => [i, h.qm]), shape: 'square', label: D.lines.male }], lines = []; if (s.hits.t !== undefined) { const e = s.exp.t; lines.push({ pts: [[0, e], [10, e]], label: D.lines.pbar }); } return { type: 'ry_xy', title: D.titles.zig, x: { lo: 0, hi: 10, label: D.ax.gen, fmt: 'int' }, y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed', series: ser, lines, nextX: s.ask ? 10 : null }; }
    const h = s.hist, ser = [{ pts: h.map((q, i) => [i, q.qf]), shape: 'disc', label: s.auts ? D.lines.ctl : D.lines.fem }, { pts: h.map((q, i) => [i, q.qm]), shape: 'square', label: D.lines.male }], lines = [];
    if (h[0].cf != null && !s.auts) ser.push({ pts: h.map((q, i) => [i, (q.cf + q.cm) / 2]), faint: true, label: D.lines.ctl });
    if (s.asks.indexOf('f3') >= 0 && !s.ask || s.g > 3) { const e = (2 * h[0].qf + h[0].qm) / 3; lines.push({ pts: [[0, e], [10, e]], label: D.lines.pbar }); }
    return { type: 'ry_xy', title: D.titles.zig, x: { lo: 0, hi: 10, label: D.ax.gen, fmt: 'int' }, y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed', series: ser, lines, nextX: s.ask ? s.ask.at : null };
  },
  copiesSpec() { const s = this.sim.s, D = this.content.data, tc = s.th && (s.phase === 'tgen' || s.phase === 'over'), h = tc ? s.th[s.th.length - 1] : s.hist[s.hist.length - 1]; return { type: 'ry_xy', title: D.titles.copies, fold: false, x: { lo: 0, hi: 2 }, y: { lo: 0, hi: 1, fmt: 'pct' }, noX: true, frame: 'designed', bars: [{ x: 0.5, y: h.qf, label: D.lines.fem, ink: 'a' }, { x: 1.5, y: h.qm, label: D.lines.male, ink: 'a', hatch: true }] }; },
  incSpec() {   // L2: white-eyed males (squares) and white-eyed females (discs) by generation; the balance dashed after the ask
    const s = this.sim.s, D = this.content.data, h = s.hist, lines = [], vl = [];
    if (s.hits.bal !== undefined) lines.push({ pts: [[0, s.exp.bal], [65, s.exp.bal]], label: D.lines.bal });
    vl.push({ x: 5, dash: true });
    return { type: 'ry_xy', title: D.titles.inc, x: { lo: 0, hi: 65, label: D.ax.gen, fmt: 'int' }, y: { lo: 0, hi: 0.4, fmt: 'pct' }, frame: 'designed', series: [{ pts: h.map((q, i) => [i, q.wm]), shape: 'square', label: D.lines.wm }, { pts: h.map((q, i) => [i, q.wf]), shape: 'disc', label: D.lines.wf }], lines, vlines: vl, nextX: s.ask ? 65 : null };
  },
  whereSpec() { const s = this.sim.s, D = this.content.data, h = s.hist[s.hist.length - 1], a = 2 * h.qf, b = h.qm, t = a + b || 1; return { type: 'ry_xy', title: D.titles.where, fold: false, x: { lo: 0, hi: 2 }, y: { lo: 0, hi: 1, fmt: 'pct' }, noX: true, frame: 'designed', bars: [{ x: 0.5, y: a / t, label: D.lines.inF, ink: 'a' }, { x: 1.5, y: b / t, label: D.lines.inM, ink: 'a', hatch: true }] }; },
  oddsSpec() {   // boss: your before-sons (rings) and after-sons (discs) odds for each woman; the exact odds dashed once sealed
    const s = this.sim.s, D = this.content.data, dots = [], lines = [];
    for (const j of s.judg) { const i = RY_CASES.findIndex(q => q.id === j.id) + 1; dots.push({ x: i + (j.st === 'prior' ? -0.15 : 0.15), y: j.v, shape: j.st === 'prior' ? 'ring' : 'disc' }); lines.push({ pts: [[i + (j.st === 'prior' ? -0.35 : -0.05), j.e], [i + (j.st === 'prior' ? 0.05 : 0.35), j.e]] }); }
    if (lines.length) lines[lines.length - 1].label = D.lines.exact;
    return { type: 'ry_xy', title: D.titles.odds, x: { lo: 0.4, hi: 6.6, label: '', fmt: 'int' }, xticks: [1, 2, 3, 4, 5, 6], y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed', dots, lines, legend: [['ring', D.lines.prior], ['disc', D.lines.post]] };
  },
  errSpec() { const s = this.sim.s, D = this.content.data; return { type: 'ry_xy', title: D.titles.err, fold: false, x: { lo: 0, hi: 12.6 }, y: { lo: 0, hi: 0.6, fmt: 'pct' }, noX: true, frame: 'designed', bars: s.judg.map((j, i) => ({ x: i + 0.8, y: Math.abs(j.v - j.e), w: 0.32 })), lines: [{ pts: [[0, 0.1], [12.6, 0.1]], label: D.lines.ten }] }; },
  cvSpec() { const s = this.sim.s, D = this.content.data, lines = []; if (s.hits.cv !== undefined) lines.push({ pts: [[0.0064, 0], [0.0064, 1]], label: D.lines.exact }); return { type: 'ry_xy', title: D.titles.cv, x: { lo: 0, hi: 0.05, label: D.ax.pct, fmt: v => (Math.round(v * 1000) / 10) + '%' }, xticks: [0, 0.01, 0.02, 0.03, 0.04, 0.05], y: { lo: 0, hi: 1 }, noY: true, frame: 'designed', lines }; },
  cardSpec() { const n = this.level, s = this.sim.s; if (n === 0) return this.sonsSpec(); if (n === 1) return this.zigSpec(); if (n === 2) return this.incSpec(); return s.judg && s.judg.length ? this.oddsSpec() : null; }
};
V2.push(CH_ROYAL_V2);

/* ---------- ry_xy: one XY chart for the unit — solid realised series with shaped markers, dashed expectations, dots and bars ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.ry_xy) LiveGraph.T.ry_xy = {
  lay(w, h, spec, T, c) {
    const labels = (spec.lines || []).map(l => l.label).concat((spec.series || []).map(s => s.label), spec.dotLabel ? [spec.dotLabel] : []);
    const G = wgXY(w, h, spec, T, c, { xlo: spec.x.lo, xhi: spec.x.hi, ylo: spec.y.lo, yhi: spec.y.hi, labels }); G.nextX = spec.nextX != null ? spec.nextX : null; return G;
  },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, ends = [];
    wgAxes(c, G, spec, T, { noY: !!spec.noY, noX: !!spec.noX, xticks: spec.xticks });
    if (spec.yticks && !T.compact) for (const v of spec.yticks) { const y = G.Y(v); wgText(c, wgFmt(spec.y.fmt, v), p.x + p.w - 4, y, G.tk, I.text2, { align: 'right', halo: I.surface }); }
    for (const b of spec.bars || []) {
      const bw = b.w || 0.32, x0 = G.X(b.x - bw), x1 = G.X(b.x + bw), y = G.Y(b.y), yb = G.Y(spec.y.lo), col = b.ink ? T.fill(b.ink) : wgRgba(I.text, 0.75);
      c.fillStyle = col; c.fillRect(x0, y, x1 - x0, yb - y); if (b.hatch) wgHatch(c, x0, y, x1 - x0, yb - y, wgRgba(I.ink, 0.55), 5);
      c.lineWidth = 1; c.strokeStyle = I.ink; c.strokeRect(x0, y, x1 - x0, yb - y);
      if (b.label && !T.compact) wgText(c, b.label, (x0 + x1) / 2, G.plot.y + G.plot.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
    }
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip(); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const l of spec.vlines || []) { const x = G.X(l.x); c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, l.dash ? 0.45 : 0.3); c.setLineDash(l.dash ? [2, 3] : []); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); }
    c.setLineDash([6, 4]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text;
    for (const l of spec.lines || []) { if (!l.pts || !l.pts.length) continue; c.beginPath(); l.pts.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); const q = l.pts[l.pts.length - 1]; if (l.label) ends.push({ y: G.Y(q[1]), text: l.label, col: I.text, dash: true }); }
    c.setLineDash([]);
    for (const sr of spec.series || []) {
      if (!sr.pts || !sr.pts.length) continue; c.lineWidth = (sr.faint ? 1.5 : 3) * T.k; c.strokeStyle = sr.faint ? wgRgba(I.text, 0.4) : I.text;
      c.beginPath(); sr.pts.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
      if (!sr.faint) { const step = Math.max(1, Math.ceil(sr.pts.length / 14)); sr.pts.forEach((q, i) => { if (i % step && i !== sr.pts.length - 1) return; const r = 3.5 * T.k, x = G.X(q[0]), y = G.Y(q[1]); c.beginPath(); if (sr.shape === 'square') c.rect(x - r, y - r, 2 * r, 2 * r); else c.arc(x, y, r, 0, TAU); c.fillStyle = sr.shape === 'square' ? I.surface : I.text; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.text; c.stroke(); }); }
      const q = sr.pts[sr.pts.length - 1]; if (sr.label) ends.push({ y: G.Y(q[1]), text: sr.label, col: sr.faint ? wgRgba(I.text, 0.6) : I.text, role: sr.shape === 'square' ? 'a' : 'ink' });
    }
    for (const d of spec.dots || []) { const x = G.X(d.x), y = G.Y(d.y), r = 4.5 * T.k; c.beginPath(); if (d.shape === 'square') c.rect(x - r, y - r, 2 * r, 2 * r); else c.arc(x, y, r, 0, TAU); if (d.shape === 'ring') { c.lineWidth = 2; c.strokeStyle = I.text; c.stroke(); } else { c.fillStyle = d.shape === 'square' ? I.surface : I.text; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.text; c.stroke(); } }
    c.restore();
    if (spec.legend && !T.compact) { let x = p.x + 8; const y = p.y + 9; for (const [sh, lab] of spec.legend) { const r = 4; c.beginPath(); if (sh === 'square') c.rect(x - r, y - r, 2 * r, 2 * r); else c.arc(x, y, r, 0, TAU); if (sh === 'ring') { c.lineWidth = 2; c.strokeStyle = I.text; c.stroke(); } else { c.fillStyle = sh === 'square' ? I.surface : I.text; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.text; c.stroke(); } wgText(c, lab, x + 8, y, G.tk, I.text, { fam: 'b', wt: 600, halo: I.surface }); x += wgW(c, lab, G.tk, 'b', 600) + 24; } }
    wgEnds(c, G, ends, T);
  },
  rows(spec) {
    const fx = spec.x && spec.x.fmt, fy = spec.y && spec.y.fmt, out = [];
    for (const s of spec.series || []) for (const q of s.pts || []) out.push([s.label || 'series', wgFmt(fx, q[0]), wgFmt(fy, q[1])]);
    for (const d of spec.dots || []) out.push(['you', wgFmt(fx, d.x), wgFmt(fy, d.y)]);
    for (const b of spec.bars || []) out.push([b.label || 'bar', '', wgFmt(fy, b.y)]);
    for (const l of spec.lines || []) for (const q of l.pts || []) out.push([(l.label || 'expected') + ' (expected)', wgFmt(fx, q[0]), wgFmt(fy, q[1])]);
    return { head: ['series', (spec.x && spec.x.label) || 'x', (spec.y && spec.y.label) || 'y'], rows: out };
  },
  say(spec) { return (spec.series || []).map(s => s.label).filter(Boolean).join(', ') + ((spec.dots || []).length ? ', ' + spec.dots.length + ' points' : '') + ((spec.bars || []).length ? ', ' + spec.bars.length + ' bars' : ''); }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.royal = RY_TEXT.take;
  MODEL.royal = 'Morgan’s white-eyed flies crossed both ways; a cage where the sexes leapfrog to the X-linked balance; a lamp that selects only males while mutation brings white back; then exact carrier odds in Queen Victoria’s family.';
  RECALL.royal = { q: 'A woman’s father had haemophilia. What is the chance she carries the variant?', opts: [['one', 'Certain'], ['half', 'One half'], ['quarter', 'One quarter']], ans: 'one', why: 'The only X her father could give her carries the variant.' };
  BRIDGE.royal = 'In Equilibrium both sexes reached Hardy–Weinberg in one generation. On the X, the sexes leapfrog.';
}
