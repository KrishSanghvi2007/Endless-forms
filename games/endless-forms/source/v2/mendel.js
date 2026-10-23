/* ================= v2/mendel.js: Mendel's Garden (id 'mendel'), the Wave 2 rebuild =================
   D3 §4.2, D2 §4 triage, D6 (21 Oct addendum: own world, opening card; 22 Oct decisions 9 and 10: simple, real biology).
   The Augustinian abbey garden in Brno, 1850s: terracotta pots on a potting bench, pea plants on hazel sticks, a monk's ledger.
   Role: the experimenter. ONE verb: brush pollen from one flower onto another (or onto itself, to self it). The pod swells and
   splits; its peas are sown and flower (flower colour), or show their own shape and colour at once (seed traits).
   Three levels, one idea each:
     L1 The vanishing white: dominance and segregation. Purple × white gives all purple; the hybrid selfed gives white back in ¼.
        The unit's one prediction (three buttons, the aha): what share of the hybrid's offspring will be white?
     L2 Pure or carrier?: the test cross and inference with uncertainty. One white offspring proves a carrier; n purples in a row
        only make a hidden carrier unlikely, (½)ⁿ.
     L3 Two genes: independent assortment, 9 : 3 : 3 : 1, and new mixtures; then a round green pea is tested (1 in 3 breeds true).
   Headless sim (R() only; no transcendental maths); stars read the state against the expectation; juice from Sim.run's events only. */

const MG_T = { brush: 0.6, pod: 1.0, pea: 0.16, fly: 0.55, grow: 0.95, land: 0.35, reveal: 1.9, end: 1.3, tally: 2.4 };
// pod: peas per cross (designed); budget: crosses in the summer (designed); goal: hybrid selfs that end L1; f2: hybrid selfs before the abbot's pea (L3); slots: pots on the bench
const MG_LV = [{ pod: 8, budget: 6, goal: 4, slots: 3 }, { pod: 4, budget: 8, n: 5, slots: 6 }, { pod: 8, budget: 10, f2: 4, slots: 4 }];
const MG_ASK = { p1: { opts: [0, 0.25, 0.5] } };
const MG_CLS = [[9, 'ry'], [3, 'rg'], [3, 'wy'], [1, 'wg']];   // L3 seed classes: round yellow, round green, wrinkled yellow, wrinkled green
// the world's paints (D6 decision 7): sage, terracotta, pea-flower violet, cream, sepia ink; herbarium watercolour
const MG_C = { sky: '#DCE6E2', sky2: '#F3EEDF', stucco: '#E9DAB6', stuccoD: '#CDB88C', tile: '#B65A3C', tileD: '#8B3F27', glass: '#4E5E5E', glassL: '#7D8F8A',
  hedge: '#8AA27A', hedgeD: '#5F7B55', gravel: '#DCCFB1', bench: '#8E6B47', benchD: '#5F4630', benchL: '#A9845C', soil: '#5B4434', soilD: '#3E2E23', soilL: '#76594A',
  pot: '#C66C45', potD: '#9A4C2F', potL: '#E39470', stick: '#7B5D40', stem: '#6C9A4A', leaf: '#8CB25F', leafD: '#5E8540', stip: '#A2C27A',
  vio: '#A37BCB', vioD: '#5F2E88', vioL: '#D3BDE8', wht: '#FCF9F1', whtD: '#E2DAC6', whtS: '#C9BFA6', keel: '#EFE4F6',
  pod: '#93B85C', podD: '#5E8636', podL: '#C3DB92', podIn: '#E8EFC9', peaY: '#EBC94B', peaYD: '#B8952A', peaG: '#7C9E3B', peaGD: '#55732A', peaP: '#CFCB8C', peaPD: '#9C9659',
  paper: '#F7EFDB', paperD: '#E5D5B0', rule: 'rgba(122,98,72,.28)', margin: 'rgba(170,70,50,.45)', ink: '#4A3626', ink2: '#7A6248', pollen: '#E8B43A', pollenL: '#F7DC86',
  cloth: '#EFE6D2', clothD: '#D9CCB0', saucer: '#C46A44', saucerD: '#934A2E', brushW: '#8B5A2B', brushT: '#3A2A1E', ferrule: '#B9A16A' };

const MG_TEXT = {
  intro: {
    game: 'You work in Gregor Mendel’s abbey garden in Brno in the 1850s. You brush pollen between pea flowers, then watch what their seeds become.',
    biology: 'Each pea plant carries two copies of each gene and passes one, at random, to each seed. A copy can hide for a generation, then show again when two meet.',
    how: 'Drag pollen from one flower onto another, or tap a hybrid to self it. Pods split, peas grow, and the ledger keeps the count.'
  },
  firstWords: 'Drag pollen from the purple flower onto the white one.',
  hud: {
    nohyb: 'Cross the purple line with the white line to make a hybrid.',
    f1: 'All purple: white vanished. Now self the hybrid: tap its flower.',
    p1: 'Before its seeds flower: what share will be white?',
    f2: 'White came back: {w} of {n}. Self the hybrid again.',
    key1: '¼ white = ½ × ½: pollen and egg each carry white half the time.',
    key3: '¾ round × ¾ yellow = 9/16 round yellow: the genes sort on their own.',
    pick: 'Now drop the pollen on a flower, or back on its own.',
    pickG: 'Now drop it on wrinkled green, or back on its own flower.',
    wait: 'The pod swells and splits; its peas are sown.',
    grow: 'The peas are growing. Watch the flowers open.',
    start2: 'Five purple plants; some hide a white copy. Tap one to test it.',
    white2: 'A white flower: {p} must carry a hidden white copy.',
    purple2: '{p}: {n} purple in a row. A carrier does that 1 time in {k}.',
    out2: 'No crosses left. Tap each plant to call it, then press Done.',
    ready2: 'Every plant is called. Press Done to check.',
    start3: 'Round yellow peas and wrinkled green ones. Cross the two plants.',
    f13: 'Every pea is round and yellow. Self the hybrid to see what hides.',
    f23: 'Four kinds of pea, two of them new mixtures. Self the hybrid again.',
    abbot: 'The abbot wants round green peas that breed true. Test this one.',
    g3: '{n} test peas, none wrinkled: a hider does that 1 time in {k}.',
    gw3: 'A wrinkled pea: this round green plant hides a wrinkled copy.',
    ready3: 'Called. Press Done to check, or test more.',
    nog: 'The summer ended before the hybrid gave enough peas.',
    reveal: 'Years of later crosses show what each plant carried.',
    over: 'The level is done.'
  },
  whispers: {
    back: 'White is back!', allPurple: 'Every one purple.', pureP: 'Pure purple breeds true.', pureW: 'Pure white breeds true.', half: 'About half white.',
    tester: 'Use the white tester’s pollen.', gtest: 'Test it with wrinkled green.', l3: 'Not useful here.', left: 'No crosses left.', busy: 'Wait for the peas.',
    calls: 'Call every plant first.', lock: 'A white flower settled it.', lockG: 'A wrinkled pea settled it.', mix: 'New mixtures!', hit: 'Right: a quarter.',
    miss: 'Watch the count.', none: 'No call this time.', pick: 'Pollen on the brush.', hurry: 'Faster.', hybrid: 'A hybrid is potted up.', round: 'All round and yellow.', callHint: 'Tap its tag: pure or carrier?'
  },
  labels: {
    P: 'Purple line', W: 'White line', H: 'Hybrid', T: 'Tester', RY: 'Round yellow', WG: 'Wrinkled green', G: 'Round green',
    Hq: 'hybrid pot', Gq: 'abbot’s pot', ask: 'call?', pure: 'pure', carrier: 'carrier', true: 'breeds true', hides: 'hides wrinkled',
    PW: 'purple × white', Hs: 'hybrid selfed', Ps: 'purple selfed', Ws: 'white selfed', HP: 'hybrid × purple', HW: 'hybrid × white',
    purple: 'purple', white: 'white', yours: 'yours', expected: 'expected', mendel: 'Mendel', oneIn: '1 in {k}', nPur: '{n} purple', whiteBang: 'white!',
    ifCar: 'if a carrier:', chance: 'chance', ry: 'round yellow', rg: 'round green', wy: 'wrinkled yellow', wg: 'wrinkled green', gTest: 'test peas',
    left: '{n} left', none: 'None', quarter: 'A quarter', half: 'A half', done: 'Done', hurry: 'Hurry', ledger: 'Ledger', f1: 'all purple', bed: 'seed bed',
    lines: 'pure lines', round: 'round {n}', wrinkled: 'wrinkled {n}', tOffspring: 'Hybrid’s offspring', tTests: 'Test crosses', tPeas: 'Hybrid’s peas',
    tGTest: 'Round green test', f1peas: 'first cross', allRY: 'all RrYy', howWhite: 'how many white?', count: '{a} : {b}', sLeft: 'Crosses left', sSelf: 'Hybrid selfed', sPW: 'Purple : white', sRight: 'Calls right',
    sClasses: 'Four kinds', sTest: 'Abbot’s pea'
  },
  panels: [],
  interesting: {
    nohyb: 'You never crossed the two pure lines, so no hybrid grew. Mendel crossed them first, then let the hybrids self.',
    scatter: '{w} white in {n}, where a quarter is {e}. Small samples scatter; Mendel counted 929 plants to see 3 : 1.',
    testx: 'Hybrid × white gave {w} white in {n}, about half. That is a test cross, the next level’s tool.',
    pure: 'Your selfed pure lines bred true: every seed matched its parent. Only the hybrid hides a second kind of copy.',
    fooled: '{p} was a carrier, yet gave {n} purple in a row. That happens 1 time in {k}: rare, not impossible.',
    hid: 'Carrier {p} gave {n} purple before its first white. That happens 1 time in {k}.',
    waste: 'You tested {p} again after a white flower. One white offspring already proves a carrier.',
    risky: 'You called {p} pure after only {n} purple. A carrier does that 1 time in {k}: right, but risky.',
    self: 'Selfing tests weakly. A hider’s selfed pea is wrinkled only 1 time in 4; with the tester, 1 in 2.',
    nowg: 'No wrinkled green pea in {n}. It is 1 pea in 16, so {n} peas miss it {pc}% of the time.',
    mix: '{m} of your {n} peas were new mixtures, round green or wrinkled yellow, seen on neither parent.'
  },
  take: 'Copies hide and reappear by chance; ratios and test crosses reveal what each plant carries.',
  body: 'Each plant has two copies of a gene and gives each seed one at random. A hidden copy shows when two meet: ¼ from two hybrids. A test cross shows carriers; all-dominant results build evidence, never proof. Genes on different chromosomes sort independently: 9 : 3 : 3 : 1.',
  law: { title: 'Segregation and assortment' },
  stars: {
    discover: 'Call all five purple plants right: pure or carrier.',
    predict: 'Call the share of white from a selfed hybrid.',
    transfer: 'Test the round green pea and call it right.'
  },
  levelStars: [
    { predict: 'Call the share of white before it flowers.' },
    { discover: 'Call all five plants right.' },
    { transfer: 'Test the round green pea and call it right, on strong evidence.' }
  ],
  levelTake: [
    'A hidden copy is not lost. A selfed hybrid gives white a quarter of the time: ½ × ½.',
    'One white offspring proves a carrier. A run of purples only makes a carrier unlikely: (½)ⁿ.',
    'Two genes sort on their own: ¾ × ¾ gives 9 : 3 : 3 : 1, and new mixtures appear.'
  ],
  levelBody: [
    'The hybrid gave {w} white in {n}, {pc}%. Mendel counted 705 purple to 224 white, 3.15 : 1. The hybrid is Pp, and each seed takes P or p from each parent at random.',
    'You called {r} of 5 right with {u} crosses. Every white flower proved its parent a carrier. All-purple results never prove a plant pure; they make a hidden carrier unlikely.',
    'Your hybrid gave {a} : {b} : {c} : {d}. Mendel counted 315 : 108 : 101 : 32 from 556 peas. Your round green plant was {g}; among round green peas, 1 in 3 breeds true.'
  ],
  captions: {
    liveBloom: '{w} white and {p} purple flowers.', livePeas: '{a} round yellow, {b} round green, {c} wrinkled yellow, {d} wrinkled green.',
    liveAsk: 'Prediction open: choose None, A quarter or A half in the dock.', liveCall: '{p} called {v}.', liveCross: 'Pollen moved. A pod is swelling.'
  },
  model: [
    { level: 0, simulated: 'Flower colour is one gene with two versions. Purple (P) masks white (p). Each seed takes one copy from each parent, each with chance ½.', simplification: 'A pod holds 8 peas and every pea flowers. A pea generation passes in seconds. Real pea flowers usually pollinate themselves; for a cross, Mendel first removed the anthers.', params: [{ name: 'peas per pod', value: 8, tag: 'designed' }, { name: 'crosses in a summer', value: 6, tag: 'designed' }, { name: 'one generation', value: 'about 4 s', tag: 'xN', real: 'one growing season' }], cannot: 'Genes that blend, interact, or sit close together on one chromosome.', nature: 'Mendel’s violet × white hybrids, selfed, gave 705 violet to 224 white (Mendel 1866). White comes from a broken A, the gene that switches on pigment (Hellens et al. 2010).', contested: false, refs: ['mendel1866', 'hellens2010', 'olby1979'] },
    { level: 1, simulated: 'Five purple plants, one to four of them carriers (Pp), drawn at random. Each test cross with white gives 4 seedlings, and a carrier gives white with chance ½ each.', simplification: 'Pods of 4 peas make the evidence build slowly (designed). Real pods hold up to about 10.', params: [{ name: 'peas per test cross', value: 4, tag: 'designed' }, { name: 'crosses', value: 8, tag: 'designed' }, { name: 'carriers', value: '1 to 4 of 5', tag: 'designed' }], cannot: 'DNA tests, which now often find carriers instead of test crosses.', nature: 'Crossing an unknown with the recessive is still a standard way for breeders to find carriers. Mendel checked his hybrids with such backcrosses (Mendel 1866).', contested: false, refs: ['mendel1866', 'olby1979'] },
    { level: 2, simulated: 'Seed shape (round R over wrinkled r) and seed colour (yellow Y over green y), on different chromosomes. Each seed takes each gene’s copies independently.', simplification: 'A pea shows its shape and colour inside the pod, because the pea is already the next generation. The abbot’s round green pea is drawn with the true odds: 1 in 3 breeds true.', params: [{ name: 'peas per pod', value: 8, tag: 'designed' }, { name: 'crosses', value: 10, tag: 'designed' }], cannot: 'Linked genes, which travel together on one chromosome (see Crossing Over).', nature: 'Mendel’s two-gene cross gave 315 : 108 : 101 : 32 (Mendel 1866). Wrinkled peas lack a starch-branching enzyme, broken by a transposon (Bhattacharyya et al. 1990). Green peas keep chlorophyll through a broken stay-green gene (Armstead et al. 2007).', contested: false, refs: ['mendel1866', 'bhattacharyya1990', 'armstead2007', 'blixt1975', 'reid2011'] }
  ],
  why: {
    real: [
      'Gregor Mendel, an Augustinian friar in Brno, crossed and counted thousands of pea plants from 1856 to 1863. He chose traits with two clear forms and counted every offspring. He published in 1866; the work was largely ignored until 1900.',
      'Breeders still find carriers by crossing an unknown with the recessive, though DNA tests now often replace this. Mendel checked his hybrids this way. Crossed back to the recessive parent, they gave both kinds about equally.',
      'Mendel’s two-gene cross gave 315 : 108 : 101 : 32, close to 9 : 3 : 3 : 1. Fisher argued in 1936 that his counts fit too well; that is still debated (Franklin et al. 2008).'
    ],
    maths: [
      'A hybrid Pp makes P and p pollen and eggs in equal numbers. A seed is white only if both its copies are p: ½ × ½ = ¼. So three purple to one white.',
      'Crossed with white (pp), a carrier gives white with chance ½ per seed. So n purple seeds in a row have chance (½)ⁿ. That is 1 in 16 for four, 1 in 256 for eight. A pure plant never gives white.',
      'Round shows in ¾ of seeds and yellow in ¾, independently. So round yellow is ¾ × ¾ = 9/16, round green 3/16, wrinkled green 1/16. Among round green peas, 1 in 3 is RR and breeds true.'
    ]
  }
};
MG_TEXT.levelWhy = [0, 1, 2].map(i => ({ real: [MG_TEXT.why.real[i]], maths: [MG_TEXT.why.maths[i]] }));

/* ---------- pure helpers shared by the sim, stars, bots and oracle (+ − × ÷ only) ---------- */
const MG = {
  plant(k, o) { o = o || {}; return { k, name: o.name || k, A: o.A || [0, 0], R: o.R || [1, 1], Y: o.Y || [1, 1], call: null, lock: false, tn: 0, tw: 0, tt: 0, ts: 0, pods: 0 }; },
  dom(g) { return g[0] + g[1] > 0 ? 1 : 0; },
  het(g) { return g[0] !== g[1]; },
  genes(lv) { return lv === 2 ? ['R', 'Y'] : ['A']; },
  cls(k) { return (MG.dom(k.R) ? 0 : 2) + (MG.dom(k.Y) ? 0 : 1); },   // 0 round yellow, 1 round green, 2 wrinkled yellow, 3 wrinkled green
  pw(b, n) { let p = 1; for (let i = 0; i < n; i++) p *= b; return p; },
  oneIn(p) { return p > 0 ? Math.round(1 / p) : 0; },
  dist(dx, dy) { return Math.sqrt(dx * dx + dy * dy); }
};

const CH_MENDEL_V2 = {
  id: 'mendel', v2: true, role: 'experimenter', place: 'lab', accent: '#7B3F98',   // pea-flower violet: the chapter's chrome tint (D6 decision 7); never a data ink
  plan: ['Mendel’s Garden', 'Inheritance and dominance'],
  intro: { goal: 'Cross pea plants and read what hides in their seeds.' },
  content: MG_TEXT,
  P: {
    pod: { v: 8, tag: 'designed', min: 4, max: 12, label: 'peas per pod' },
    pod2: { v: 4, tag: 'designed', min: 2, max: 10, label: 'peas per test cross' },
    gen: { v: 4, tag: 'xN', min: 2, max: 8, real: 'one growing season', label: 'seconds per generation' }
  },
  levels: [
    { name: 'The vanishing white', adds: 'a hidden copy', codes: ['B1'], minutes: 2 },
    { name: 'Pure or carrier?', adds: 'the test cross', codes: ['B1'], minutes: 2.5 },
    { name: 'Two genes', adds: 'a second gene', codes: ['B1', 'B4'], minutes: 2.5 }
  ],
  keys: { 1: 'pick plant one', 2: 'pick plant two', 3: 'pick plant three', C: 'call picked plant', Space: 'hurry', Enter: 'done' },
  untimed: true,   // no timed verb: nothing waits on the clock but the animation
  teacher: { prompts: ['Why did white vanish in the hybrids, then come back among their offspring?', 'A test cross gave ten purple seeds. Is the plant pure? How sure are you, and why not certain?', 'This model gives every seed a fair coin for each gene. Which real pea genes break that rule?'], pool: 'trace' },
  starTraits: ['flower', 'shape'],
  encodings: [   // flower colour by luminance (violet against cream white); seed shape by outline; seed colour by luminance and the saucer labels
    { k: 'flower', rgb: [95, 46, 136], channels: ['luminance'] },
    { k: 'flowerW', rgb: [252, 249, 241], channels: ['luminance'] },
    { k: 'shape', rgb: [235, 201, 75], channels: ['shape'] },
    { k: 'shapeW', rgb: [124, 158, 59], channels: ['shape'] }
  ],
  // one star a level (D6 decision 9): L1 Predict (the aha), L2 Discover (the test cross), L3 Transfer (the abbot's pea); the unit's stars are their union

  /* ================= headless simulation (API_v2 §9.3): R() only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {};
      const L = MG_LV[level], s = { level, phase: 'idle', pt: 0, left: L.budget, pl: [], cross: null, crosses: [], ask: null, pred: {}, asks: [], ff: 1, f2: [0, 0, 0, 0], hs: 0, last: -1, log: [] };
      if (level === 0) s.pl = [MG.plant('P', { A: [1, 1] }), MG.plant('W', { A: [0, 0] }), null];
      else if (level === 1) {
        const k = 1 + Math.floor(R() * 4), ord = [0, 1, 2, 3, 4];
        for (let i = 4; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
        const car = ord.slice(0, k); s.pl = [MG.plant('T', { A: [0, 0] })];
        for (let i = 0; i < 5; i++) s.pl.push(MG.plant('U', { A: car.indexOf(i) >= 0 ? [1, 0] : [1, 1], name: 'ABCDE'[i] }));
      } else s.pl = [MG.plant('RY', { R: [1, 1], Y: [1, 1] }), MG.plant('WG', { R: [0, 0], Y: [0, 0] }), null, null];
      this.s = s;
    },
    anim(s) { return s.phase === 'brush' || s.phase === 'pod' || s.phase === 'peas' || s.phase === 'grow'; },
    legal(s, a, b) {   // '' when the cross is allowed, else the reason (a whisper key)
      const A = s.pl[a], B = s.pl[b]; if (!A || !B) return 'none';
      if (s.level === 1) return (A.k === 'T' ? 1 : 0) + (B.k === 'T' ? 1 : 0) === 1 ? '' : 'tester';
      if (s.level === 2) { const ks = [A.k, B.k].sort().join(''); if (ks === 'RYWG' || ks === 'HH' || ks === 'GWG' || ks === 'GG') return ''; return A.k === 'G' || B.k === 'G' ? 'gtest' : 'l3'; }
      return '';
    },
    type(s, a, b) {
      const ks = [s.pl[a].k, s.pl[b].k].sort().join('');
      if (s.level === 0) return { PW: 'PW', HH: 'Hs', PP: 'Ps', WW: 'Ws', HP: 'HP', HW: 'HW' }[ks] || ks;
      if (s.level === 1) return 'T';
      return { RYWG: 'F1', HH: 'Hs', GWG: 'Gt', GG: 'Gs' }[ks] || ks;
    },
    unk(s, C) { const A = s.pl[C.a]; return A && A.k === 'T' ? C.b : C.a; },   // L2: the slot of the plant under test
    callable(s, P) { return !!P && ((s.level === 1 && P.k === 'U') || (s.level === 2 && P.k === 'G')); },
    canDone(s) { if (s.level === 1) return s.pl.every(P => !P || P.k !== 'U' || !!P.call); if (s.level === 2) return !!(s.pl[3] && s.pl[3].call); return false; },
    askHere(s) { return s.level === 0 && s.cross && s.cross.type === 'Hs' && s.asks.indexOf('p1') < 0; },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      const C = s.cross; s.pt += this.anim(s) ? dt * (s.ff || 1) : dt;
      if (s.phase === 'brush') {
        if (s.pt >= MG_T.brush) { s.pt = 0; if (this.askHere(s)) { s.ask = { id: 'p1' }; s.asks.push('p1'); s.phase = 'ask'; ev.push({ k: 'ask', id: 'p1' }); } else { s.phase = 'pod'; ev.push({ k: 'pod', b: C.b }); } }
      } else if (s.phase === 'pod') { if (s.pt >= MG_T.pod) { s.phase = 'peas'; s.pt = 0; ev.push({ k: 'split' }); } }
      else if (s.phase === 'peas') {
        while (C.j < C.kids.length && s.pt >= (C.j + 1) * MG_T.pea) { ev.push({ k: 'pea', j: C.j }); C.j++; }
        if (C.j >= C.kids.length && s.pt >= C.kids.length * MG_T.pea + MG_T.fly) { s.phase = 'grow'; s.pt = 0; ev.push({ k: 'sown' }); }
      } else if (s.phase === 'grow') { if (s.pt >= (s.level === 2 ? MG_T.land : MG_T.grow)) this.bloom(s, ev); }
      else if (s.phase === 'reveal') { if (s.pt >= MG_T.reveal) { s.phase = 'end'; s.pt = 0; ev.push({ k: 'end' }); } }
      else if (s.phase === 'end') { if (s.pt >= (s.tally ? MG_T.tally : MG_T.end)) { s.phase = 'over'; ev.push({ k: 'over' }); } }
      return ev;
    },
    bloom(s, ev) {   // the pod's peas have flowered (L1, L2) or been sorted (L3): count them, then what follows
      const C = s.cross, L = s.level, n = C.kids.length, ph = C.kids.map(k => L === 2 ? MG.cls(k) : MG.dom(k.A));
      let w = 0; for (const p of ph) if (L === 2 ? p >= 2 : p === 0) w++;   // white flowers (L1, L2) or wrinkled peas (L3)
      s.crosses.push({ a: C.a, b: C.b, type: C.type, ph, w, n }); s.cross = null; s.phase = 'idle'; s.pt = 0; s.ff = 1;
      const M = s.pl[C.b]; if (M) M.pods++;
      ev.push({ k: 'bloom', i: s.crosses.length - 1, w, n, type: C.type });
      if (L === 0) {
        if (C.type === 'PW' && !s.pl[2]) { s.pl[2] = MG.plant('H', { A: [1, 0] }); ev.push({ k: 'hybrid' }); }
        if (C.type === 'Hs') { const first = s.f2[1] === 0; s.f2[0] += n - w; s.f2[1] += w; s.hs++; if (w && first) ev.push({ k: 'back' }); }
        if (s.hs >= MG_LV[0].goal || s.left <= 0) { s.phase = 'end'; s.pt = 0; s.tally = true; ev.push({ k: 'tally' }); }
      } else if (L === 1) {
        const ui = this.unk(s, C), U = s.pl[ui]; U.tn += n - w; U.tw += w;
        if (w && !U.lock) { U.call = 'carrier'; U.lock = true; ev.push({ k: 'carrier', i: ui }); }
        if (s.left <= 0) ev.push({ k: 'out' });
      } else {
        if (C.type === 'F1' && !s.pl[2]) { s.pl[2] = MG.plant('H', { R: [1, 0], Y: [1, 0] }); ev.push({ k: 'hybrid' }); }
        if (C.type === 'Hs') {
          for (const p of ph) s.f2[p]++; s.hs++;
          if (s.hs >= MG_LV[2].f2 && !s.pl[3]) { s.pl[3] = MG.plant('G', { R: R() < 1 / 3 ? [1, 1] : [1, 0], Y: [0, 0] }); ev.push({ k: 'abbot' }); }
        }
        if (C.type === 'Gt' || C.type === 'Gs') { const G = s.pl[3]; if (C.type === 'Gt') G.tt += n; else G.ts += n; G.tw += w; if (w && !G.lock) { G.call = 'hides'; G.lock = true; ev.push({ k: 'hides' }); } }
        if (s.left <= 0) { if (!s.pl[3]) { s.phase = 'end'; s.pt = 0; s.tally = true; ev.push({ k: 'tally' }); } else ev.push({ k: 'out' }); }
      }
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (a.k === 'predict') {
        if (s.ask && a.id === s.ask.id) {
          const v = MG_ASK[a.id].opts.indexOf(+a.v) >= 0 && a.v != null ? +a.v : null;
          s.pred[a.id] = v; s.ask = null; s.phase = 'pod'; s.pt = 0;
          ev.push({ k: 'predicted', id: a.id, none: v == null }, { k: 'pod', b: s.cross.b });
        }
        return ev;
      }
      if (a.k === 'ff') { if (this.anim(s)) { s.ff = 3; ev.push({ k: 'ff' }); } return ev; }
      if (a.k === 'call') {
        const i = a.i | 0, P = s.pl[i]; if (!this.callable(s, P) || P.lock || s.phase === 'reveal' || s.phase === 'end') return ev;
        const ok = s.level === 1 ? ['pure', 'carrier'] : ['true', 'hides']; P.call = ok.indexOf(a.v) >= 0 ? a.v : null; ev.push({ k: 'call', i, v: P.call });
        return ev;
      }
      if (a.k === 'done') { if (s.phase === 'idle' && this.canDone(s)) { s.phase = 'reveal'; s.pt = 0; ev.push({ k: 'reveal' }); } else ev.push({ k: 'nope', why: 'calls' }); return ev; }
      if (a.k === 'cross') {
        const i = a.a | 0, j = a.b | 0;
        if (s.phase !== 'idle') { ev.push({ k: 'nope', why: 'busy' }); return ev; }
        if (s.left <= 0) { ev.push({ k: 'nope', why: 'left' }); return ev; }
        const why = this.legal(s, i, j); if (why) { ev.push({ k: 'nope', why, a: i, b: j }); return ev; }
        const M = s.pl[j], F = s.pl[i], n = MG_LV[s.level].pod, kids = [], gs = MG.genes(s.level);
        for (let q = 0; q < n; q++) { const kid = {}; for (const g of gs) { const m = M[g][R() < 0.5 ? 0 : 1], f = F[g][R() < 0.5 ? 0 : 1]; kid[g] = [m, f]; } kids.push(kid); }
        s.left--; s.cross = { a: i, b: j, type: this.type(s, i, j), kids, j: 0 }; s.last = s.level === 1 ? this.unk(s, s.cross) : j;
        s.phase = 'brush'; s.pt = 0; s.ff = 1; ev.push({ k: 'brush', a: i, b: j });
      }
      return ev;
    },
    // ---- what the stars and cards read ----
    right(s) { let r = 0; for (const P of s.pl) if (P && P.k === 'U' && P.call === (MG.het(P.A) ? 'carrier' : 'pure')) r++; return r; },
    gMiss(G) { return MG.pw(0.5, G.tt) * MG.pw(0.75, G.ts); },   // the chance a hider (Rr) would give no wrinkled pea in G's tests so far
    uMiss(U) { return MG.pw(0.5, U.tn); },                        // the chance a carrier would give U's purple run with the white tester
    gRight(s) { const G = s.pl[3]; if (!G || !G.call) return false; if (MG.het(G.R)) return G.call === 'hides' && G.tw > 0; return G.call === 'true' && this.gMiss(G) <= 1 / 16 + 1e-12; },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_MENDEL_V2.stars, n = s.level, mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { hs: s.hs, f2: s.f2.slice(), right: n === 1 ? this.right(s) : null, used: MG_LV[n].budget - s.left }, interesting: this.interesting(s) };
    },
    firstWhite(s, ui) { let n = 0; for (const c of s.crosses) { if (c.type !== 'T' || this.unk(s, c) !== ui) continue; for (const p of c.ph) { if (p === 0) return { n, found: true }; n++; } } return { n, found: false }; },
    interesting(s) {   // chosen from what happened (lessons rule 6)
      const L = s.level;
      if (L === 0) {
        if (!s.pl[2]) return 'nohyb'; const n = s.f2[0] + s.f2[1];
        if (n >= 16 && Math.abs(s.f2[1] - n / 4) >= 3) return 'scatter';   // at least 3 off the expected count (about 1.2 SD at n = 32)
        if (s.crosses.some(c => c.type === 'HW')) return 'testx';
        if (s.crosses.some(c => c.type === 'Ps' || c.type === 'Ws')) return 'pure';
        return null;
      }
      if (L === 1) {
        for (let i = 1; i < s.pl.length; i++) { const U = s.pl[i]; if (MG.het(U.A) && U.call === 'pure' && U.tn >= 4) return 'fooled'; }
        for (let i = 1; i < s.pl.length; i++) { const U = s.pl[i], f = this.firstWhite(s, i); if (MG.het(U.A) && f.found && f.n >= 4) return 'hid'; }
        for (let k = 0; k < s.crosses.length; k++) { const c = s.crosses[k], ui = this.unk(s, c); if (s.crosses.slice(0, k).some(d => this.unk(s, d) === ui && d.w > 0)) return 'waste'; }
        for (let i = 1; i < s.pl.length; i++) { const U = s.pl[i]; if (!MG.het(U.A) && U.call === 'pure' && U.tn > 0 && U.tn <= 4) return 'risky'; }
        return null;
      }
      const G = s.pl[3];
      if (G && G.ts > 0 && G.tt === 0) return 'self';
      if (s.hs > 0 && s.f2[3] === 0) return 'nowg';
      if (s.hs > 0) return 'mix';
      return null;
    },
    iVars(s) {   // the numbers an Interesting text names, from this run
      const L = s.level, nm = i => s.pl[i] ? s.pl[i].name : '';
      if (L === 0) { if (this.interesting(s) === 'testx') { const hw = s.crosses.filter(c => c.type === 'HW'); return { w: hw.reduce((a, c) => a + c.w, 0), n: hw.reduce((a, c) => a + c.n, 0) }; } const n = s.f2[0] + s.f2[1]; return { w: s.f2[1], n, e: n / 4 }; }
      if (L === 1) {
        for (let i = 1; i < s.pl.length; i++) { const U = s.pl[i]; if (MG.het(U.A) && U.call === 'pure' && U.tn >= 4) return { p: nm(i), n: U.tn, k: MG.oneIn(this.uMiss(U)) }; }
        for (let i = 1; i < s.pl.length; i++) { const U = s.pl[i], f = this.firstWhite(s, i); if (MG.het(U.A) && f.found && f.n >= 4) return { p: nm(i), n: f.n, k: MG.oneIn(MG.pw(0.5, f.n)) }; }
        for (let k = 0; k < s.crosses.length; k++) { const c = s.crosses[k], ui = this.unk(s, c); if (s.crosses.slice(0, k).some(d => this.unk(s, d) === ui && d.w > 0)) return { p: nm(ui) }; }
        for (let i = 1; i < s.pl.length; i++) { const U = s.pl[i]; if (!MG.het(U.A) && U.call === 'pure' && U.tn > 0 && U.tn <= 4) return { p: nm(i), n: U.tn, k: MG.oneIn(this.uMiss(U)) }; }
        return {};
      }
      const n = s.f2[0] + s.f2[1] + s.f2[2] + s.f2[3]; return { m: s.f2[1] + s.f2[2], n, pc: Math.round(100 * MG.pw(15 / 16, n)) };
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) return MG_ASK[s.ask.id].opts.map(v => ({ k: 'predict', id: s.ask.id, v }));
      if (this.anim(s)) return [{ k: 'ff' }];
      if (s.phase !== 'idle') return out;
      if (s.left > 0) for (let i = 0; i < s.pl.length; i++) for (let j = 0; j < s.pl.length; j++) if (!this.legal(s, i, j)) out.push({ k: 'cross', a: i, b: j });
      const vs = s.level === 1 ? ['pure', 'carrier'] : ['true', 'hides'];
      for (let i = 0; i < s.pl.length; i++) { const P = s.pl[i]; if (this.callable(s, P) && !P.lock) for (const v of vs) if (P.call !== v) out.push({ k: 'call', i, v }); }
      if (this.canDone(s)) out.push({ k: 'done' });
      return out;
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    has(acts, a) { return acts.some(x => x.k === a.k && x.a === a.a && x.b === a.b && x.i === a.i && x.v === a.v); },
    callAll(s, acts, v) { for (const x of acts) if (x.k === 'call' && x.v === v && !s.pl[x.i].call) return x; for (const x of acts) if (x.k === 'done') return x; return null; },
    plan(s, acts, o) {   // a configurable fixed policy: o = {ans, tests (pods per plant, L2), self (test G by selfing), call (L2 call for no-white plants), gPods}
      const S = CH_MENDEL_V2.sim; if (!acts.length) return null;
      if (acts[0].k === 'predict') return acts.find(x => x.v === o.ans) || acts[0];
      if (acts[0].k === 'ff') return null;
      const X = (a, b) => { const x = { k: 'cross', a, b }; return S.has(acts, x) ? x : null; };
      if (s.level === 0) { if (!s.pl[2]) return X(0, 1) || acts[0]; return X(2, 2); }
      if (s.level === 1) {
        for (let pass = 1; pass <= o.tests; pass++) for (let i = 1; i <= 5; i++) { const U = s.pl[i]; if (!U.lock && U.tn < pass * MG_LV[1].pod && s.left > 0) { const x = X(0, i); if (x) return x; } }
        for (let i = 1; i <= 5; i++) { const U = s.pl[i]; if (!U.call) { const x = { k: 'call', i, v: U.lock ? 'carrier' : o.call }; if (S.has(acts, x)) return x; } }
        return acts.find(x => x.k === 'done') || null;
      }
      if (!s.pl[2]) return X(0, 1);
      if (!s.pl[3]) return X(2, 2);
      const G = s.pl[3], pods = (G.tt + G.ts) / MG_LV[2].pod;
      if (!G.lock && pods < o.gPods && s.left > 0) { const x = o.self ? X(3, 3) : X(3, 1); if (x) return x; }
      if (!G.call) { const x = { k: 'call', i: 3, v: G.tw > 0 ? 'hides' : 'true' }; if (S.has(acts, x)) return x; }
      return acts.find(x => x.k === 'done') || null;
    },
    bots: {
      alwaysA(s, acts) {   // "the first thing": crosses the first two plants every time, calls every plant pure, answers None
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[0]; if (acts[0].k === 'ff') return null;
        const c = acts.find(x => x.k === 'cross'); if (c) return c; return CH_MENDEL_V2.sim.callAll(s, acts, s.level === 1 ? 'pure' : 'true');
      },
      alwaysB(s, acts) {   // "the last thing": the last legal cross, calls every plant carrier, answers a half
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[acts.length - 1]; if (acts[0].k === 'ff') return null;
        const cs = acts.filter(x => x.k === 'cross'); if (cs.length) return cs[cs.length - 1]; return CH_MENDEL_V2.sim.callAll(s, acts, s.level === 1 ? 'carrier' : 'hides');
      },
      greedy(s, acts) { return CH_MENDEL_V2.sim.plan(s, acts, { ans: 0.5, tests: 1, call: 'pure', self: true, gPods: 1 }); },     // half the copies are white, so half white; one test each; one selfed pod
      threshold(s, acts) { return CH_MENDEL_V2.sim.plan(s, acts, { ans: 0, tests: 0, call: 'pure', self: false, gPods: 0 }); },   // white has vanished for good; calls without testing
      expert(s, acts) { return CH_MENDEL_V2.sim.plan(s, acts, { ans: 0.25, tests: 2, call: 'pure', self: false, gPods: 1 }); },  // skilled play (oracle only)
      guessQuarter(s, acts) { return CH_MENDEL_V2.sim.plan(s, acts, { ans: 0.25, tests: 0, call: 'carrier', self: true, gPods: 0 }); }
    }
  },

  /* ---- stars: pure functions of the final state (API_v2 §9.1; D1 G10). No level offers all three. ---- */
  stars: {
    discover: (s, n) => n === 1 && CH_MENDEL_V2.sim.right(s) === 5,
    predict: (s, n) => n === 0 && s.pred.p1 === 0.25,   // the expectation is exactly ¼ (½ × ½); scored against it, never the realised count
    transfer: (s, n) => n === 2 && CH_MENDEL_V2.sim.gRight(s)
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–6 hybrid selfs (L1), calls right (L2) or the abbot's pea right (L3) · 7–10 crosses used · 11–12 the L1 call (0 none, 1–3 option)
  resultBits(s, level) {
    const S = this.sim, r = S.result(), c = level === 0 ? s.hs : level === 1 ? S.right(s) : S.gRight(s) ? 1 : 0, p = s.pred.p1 == null ? 0 : MG_ASK.p1.opts.indexOf(s.pred.p1) + 1;
    return ((r ? r.mask : 0) & 7) | ((c & 15) << 3) | (((MG_LV[level].budget - s.left) & 15) << 7) | ((p & 3) << 11);
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {}); this.level = n; this._ended = false; this._pend = false; this._dockSig = ''; this._said = {}; this._ghost2 = null; this._keyT = 0;
    Sim.start(this, n, o);
    this.v = { t: 0, drag: null, sel: -1, hov: -1, banner: null, sig: '', bgSig: '', fly: [], land: {}, brush: null, glow: {}, grow: {}, keyOnce: false, shake: 0, podT: 0, lastBloom: -1, reveal: 0 };
    this.layout(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: this.levels[n].name, t: 0, ms: Math.max(1100, ms + 400) }; });
    if (typeof Ghost !== 'undefined') {   // the hand demonstrates the drag until the first cross
      const F = i => () => this.flowerXY(i), done = () => this.sim.s.crosses.length > 0 || this.sim.s.phase !== 'idle';
      if (n === 0) Ghost.show({ verb: 'drag', at: F(0), to: F(1), until: done });
      else if (n === 1) Ghost.show({ verb: 'drag', at: F(0), to: F(1), until: done });
      else Ghost.show({ verb: 'drag', at: F(0), to: F(1), until: done });
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  onResize() { if (this.v) this.layout(); },
  layout() { this._g = null; if (this.v) this.v.bgSig = ''; this.geo(); },

  /* ---------- geometry (canvas px) ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  geo() {
    const s = this.sim.s, W = Stage.w, H = Stage.h, hh = this.hudH(), k = [W, H, hh, s.level].join('x');
    if (this._g && this._g.k === k) return this._g;
    const L = MG_LV[s.level], n = L.slots, top = Math.max(hh + 4, W < 600 ? 90 : 62), av = Math.max(300, H - top);
    const cw = Math.min(W - 16, 720), x0 = (W - cw) / 2;
    const l3 = s.level === 2, ledH = Math.round(Math.max(88, Math.min(132, av * (l3 ? 0.19 : 0.21)))), ledY = H - ledH - 6;
    const benchY = Math.round(top + Math.max(138, Math.min(262, av * (l3 ? 0.33 : 0.37))));
    const bedY0 = benchY + 44, bedY1 = ledY - 8, sw = cw / n;
    const pk = Math.max(0.55, Math.min(1.4, Math.min(sw / 92, (benchY - top - 4) / 166)));
    const fs = Math.round(Math.max(12, Math.min(16, W / 30)));
    const slots = []; for (let i = 0; i < n; i++) slots.push({ x: x0 + sw * (i + 0.5) });
    if (s.level === 1) { slots[0].x = x0 + sw * 0.42; }   // the tester stands a little apart
    if (s.level === 2 && sw < 110) { const wt = [1.1, 1.1, 0.85, 0.95]; let a = x0; for (let i = 0; i < n; i++) { slots[i].x = a + sw * wt[i] / 2; a += sw * wt[i]; } }   // phones: the parents' long tags get wider slots
    const g = { k, W, H, top, cw, x0, ledH, ledY, benchY, bedY0, bedY1, bedH: bedY1 - bedY0, sw, pk, fs, slots, n, tagY: benchY + 20 };
    g.pod = { x: W / 2, y: bedY0 + (bedY1 - bedY0) * 0.45, L: Math.min(cw * 0.7, 330) };
    // L3: saucers take the right of the bed, row headers the left (the ledger's columns line up with them)
    g.hx = x0 + Math.min(86, cw * 0.2); g.colW = (x0 + cw - g.hx) / 4; g.col = i => g.hx + g.colW * (i + 0.5);
    this._g = g; return g;
  },
  flowerXY(i) { const g = this.geo(), sl = g.slots[i]; return sl ? [sl.x + 2 * g.pk, g.benchY - 150 * g.pk] : [g.W / 2, g.H / 2]; },
  plantAt(x, y, wide) {   // the plant whose flower (or, for a drop, whose column) is under the point
    const g = this.geo(), s = this.sim.s; let best = -1, bd = 1e9;
    for (let i = 0; i < g.n; i++) {
      if (!s.pl[i]) continue; const f = this.flowerXY(i), d = MG.dist(x - f[0], y - f[1]), r = Math.max(26, 24 * g.pk);
      if (d < r && d < bd) { bd = d; best = i; }
    }
    if (best >= 0 || !wide) return best;
    for (let i = 0; i < g.n; i++) { if (!s.pl[i]) continue; const sx = g.slots[i].x; if (Math.abs(x - sx) < g.sw * 0.5 && y > g.benchY - 175 * g.pk && y < g.benchY + 6) return i; }
    return -1;
  },
  tagBox(i) { const g = this.geo(), x = g.slots[i].x, w = Math.min(g.sw - 6, 120), h = Math.max(24, g.fs + 12); return { x: x - w / 2, y: g.tagY - h / 2, w, h }; },
  tagAt(x, y) { const s = this.sim.s; for (let i = 0; i < this.geo().n; i++) { if (!this.sim.callable(s, s.pl[i])) continue; const b = this.tagBox(i); if (x >= b.x - 4 && x <= b.x + b.w + 4 && y >= b.y - 6 && y <= b.y + b.h + 6) return i; } return -1; },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; if (s.left <= 0 && v.sel >= 0) v.sel = -1;
    const sp = s.ff > 1 ? 3 : 1;
    for (let i = v.fly.length - 1; i >= 0; i--) { const f = v.fly[i]; f.t += dt * sp; if (f.t >= f.d) { v.land[f.j] = true; v.fly.splice(i, 1); if (typeof Fx !== 'undefined' && s.level === 2) Fx.burst('dust', f.to[0], f.to[1], 2, { ink: MG_C.soilL }); } }
    for (const k in v.glow) { v.glow[k] -= dt; if (v.glow[k] <= 0) delete v.glow[k]; }
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (s.phase === 'reveal' || s.phase === 'end' || s.phase === 'over') v.reveal = Math.min(1, v.reveal + dt * 1.5);
    if (this._ghost2 && !this._ghost2.active) this._ghost2 = null;
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, final = n === MG_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (o.interesting) { C.interesting.now = Txt.f(C.interesting[o.interesting], this.sim.iVars(s)); o.interesting = 'now'; }   // the engine shows the text as is: fill this run's numbers first
    const V = this.vars();
    if (!final) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.levelBody[n], V); o.bodyFirst = true; }
    o.stars = C.levelStars[n];
    const spec = this.chartSpec(true); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  vars() {
    const s = this.sim.s, S = this.sim, n = s.f2[0] + s.f2[1], G = s.pl[3];
    return { w: s.f2[1], n, pc: n ? Math.round(100 * s.f2[1] / n) : 0, r: s.level === 1 ? S.right(s) : 0, u: MG_LV[s.level].budget - s.left,
      a: s.f2[0], b: s.f2[1], c: s.f2[2], d: s.f2[3], g: G ? (MG.het(G.R) ? 'Rr, hiding wrinkled' : 'RR, breeding true') : 'never sown' };
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {   // cosmetic (view-only maths)
    const s = this.sim.s, v = this.v, g = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content;
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    const live = t => { if (typeof Live !== 'undefined') Live.say(t); };
    if (e.k === 'brush') { v.land = {}; v.fly = []; const a = this.flowerXY(e.a), b = this.flowerXY(e.b); v.brush = { from: v.dropAt || a, to: b, t: 0 }; v.dropAt = null; v.sel = -1; snd('swish', b[0], b[1]); live(C.captions.liveCross); if (F) F.burst('dust', a[0], a[1], 6, { ink: MG_C.pollen }); }
    else if (e.k === 'pod') { const b = this.flowerXY(e.b); if (F) { F.burst('dust', b[0], b[1], 10, { ink: MG_C.pollen }); F.ring(b[0], b[1], 18, { ms: 300 }); } snd('tick', b[0], b[1]); v.brush = null; }
    else if (e.k === 'ask') { if (F) F.ring(g.pod.x, g.pod.y, 40, { ms: 400 }); live(C.captions.liveAsk); v.brush = null; }
    else if (e.k === 'predicted') { this.whisper(e.none ? 'none' : s.pred.p1 === 0.25 ? 'hit' : 'miss'); if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); }
    else if (e.k === 'split') { if (F) { F.burst('droplet', g.pod.x, g.pod.y, 8, { ink: MG_C.podL }); F.tier(1, () => { }); F.ring(g.pod.x, g.pod.y, g.pod.L * 0.3, { ms: 260 }); } snd('crack', g.pod.x, g.pod.y); }
    else if (e.k === 'pea') { const from = this.podPea(e.j), to = this.dest(e.j); v.fly.push({ j: e.j, from, to, t: 0, d: MG_T.fly * 0.9 }); snd('tick', from[0], from[1], { i: e.j }); }
    else if (e.k === 'sown') { if (s.level !== 2) snd('pour', g.W / 2, g.bedY0); }
    else if (e.k === 'bloom') {
      const rec = s.crosses[e.i]; v.lastBloom = e.i; v.land = {};
      if (s.level !== 2) {
        live(Txt.f(C.captions.liveBloom, { w: e.w, p: e.n - e.w }));
        snd('count', g.W / 2, g.bedY0, { i: e.w });
        if (e.w && F) { for (let j = 0; j < rec.ph.length; j++) if (rec.ph[j] === 0) { const p = this.cellXY(e.i, j, rec); if (p) { F.burst('spark', p[0], p[1] - 8, 5, { ink: '#FFFFFF' }); F.ring(p[0], p[1] - 8, 12, { ms: 380 }); } } }
        if (s.level === 1 && !e.w && this.once('callHint')) this.whisper('callHint');
        if (s.level === 0) { if (rec.type === 'Ps') this.whisper('pureP'); else if (rec.type === 'Ws') this.whisper('pureW'); else if (rec.type === 'HW' && e.w) this.whisper('half'); else if (!e.w && rec.type !== 'Hs') this.whisper('allPurple'); }
      } else {
        const c = [0, 0, 0, 0]; for (const p of rec.ph) c[p]++;
        live(Txt.f(C.captions.livePeas, { a: c[0], b: c[1], c: c[2], d: c[3] })); snd('count', g.W / 2, g.bedY0, { i: e.n });
        if (rec.type === 'F1') this.whisper('round');
        if (rec.type === 'Hs' && (c[1] || c[2]) && this.once('mix')) { this.whisper('mix'); if (F) F.tier(2, () => { }); }
      }
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    }
    else if (e.k === 'hybrid') {
      const p = this.flowerXY(2); v.glow[2] = 1.4; if (F) { F.burst('spark', p[0], p[1], 10, { ink: MG_C.pollenL }); F.tier(2, () => { }); } this.whisper('hybrid'); snd('interesting', p[0], p[1]);
      if (s.level === 0 && typeof Ghost !== 'undefined') this._ghost2 = Ghost.show({ verb: 'tap', at: () => this.flowerXY(2), say: 'Demo: tap the hybrid’s flower to self it.', force: true, until: () => this.sim.s.crosses.some(c => c.type === 'Hs') || this.sim.s.phase !== 'idle' });
    }
    else if (e.k === 'back') { if (F) { F.tier(3, ms => { v.banner = { text: C.whispers.back, t: 0, ms: Math.max(1200, ms + 300) }; }); } this.whisper('back'); snd('interesting', g.W / 2, g.bedY0); }
    else if (e.k === 'carrier') { const p = this.flowerXY(e.i); v.glow[e.i] = 1.2; if (F) { F.ring(p[0], p[1], 26, { ms: 420 }); F.pop('white', p[0], p[1] - 24, 0); } this.whisper('lock'); snd('interesting', p[0], p[1]); }
    else if (e.k === 'hides') { const p = this.flowerXY(3); v.glow[3] = 1.2; if (F) F.ring(p[0], p[1], 26, { ms: 420 }); this.whisper('lockG'); snd('tock', p[0], p[1]); }
    else if (e.k === 'abbot') { const p = this.flowerXY(3); v.glow[3] = 1.6; if (F) { F.burst('spark', p[0], p[1], 10, { ink: MG_C.pollenL }); F.tier(3, ms => { v.banner = { text: C.labels.G, t: 0, ms: Math.max(1100, ms + 300) }; }); } snd('interesting', p[0], p[1]); }
    else if (e.k === 'call') { const b = this.tagBox(e.i); if (F) F.ring(b.x + b.w / 2, b.y + b.h / 2, b.w * 0.4, { ms: 220 }); snd('tock', b.x + b.w / 2, b.y); live(Txt.f(C.captions.liveCall, { p: s.pl[e.i].name, v: e.v || 'not yet' })); }
    else if (e.k === 'nope') { v.dropAt = null; if (C.whispers[e.why]) this.whisper(e.why); }
    else if (e.k === 'out') this.whisper('left');
    else if (e.k === 'ff') { if (F) F.ring(g.pod.x, g.pod.y, 24, { ms: 200 }); }
    else if (e.k === 'reveal' || e.k === 'tally') { if (F) F.tier(2, () => { }); snd('scale', g.W / 2, g.bedY0); if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'mg-' + k); },
  podPea(j) {   // where pea j sits in the open pod close-up (cosmetic)
    const g = this.geo(), C = this.sim.s.cross, n = C ? C.kids.length : MG_LV[this.sim.s.level].pod, P = g.pod, u = n > 1 ? j / (n - 1) : 0.5;
    return [P.x - P.L * 0.33 + u * P.L * 0.66, P.y + 2 - 6 * (1 - (2 * u - 1) * (2 * u - 1))];
  },
  dest(j) {   // where pea j of the current cross lands
    const s = this.sim.s, C = s.cross, g = this.geo(); if (!C) return [g.W / 2, g.bedY1];
    if (s.level === 2) {
      if (C.type === 'F1') { let k = 0; for (const r of s.crosses) if (r.type === 'F1') k += r.n; return this.trayXY(k + j); }
      if (C.type === 'Hs') { const c = MG.cls(C.kids[j]); let k = s.f2[c]; for (let q = 0; q < j; q++) if (MG.cls(C.kids[q]) === c) k++; return this.heapXY(c, k); }
      const G = s.pl[3]; return this.trayXY(G.tt + G.ts + j);
    }
    return this.cellXY(s.crosses.length, j, null) || [g.W / 2, g.bedY1];
  },

  /* ---------- the bed's cells (L1 rows of offspring; L2 a column under each plant) ---------- */
  bedRows() { return MG_LV[this.sim.s.level].budget; },
  cellXY(ci, j, rec) {   // the soil point of seedling j in cross ci (cosmetic)
    const s = this.sim.s, g = this.geo();
    if (s.level === 0) { const rh = g.bedH / this.bedRows(), lw = Math.min(118, g.cw * 0.3), cw = (g.cw - lw - 34) / 8; return [g.x0 + lw + cw * (j + 0.5), g.bedY0 + rh * (ci + 1) - 3]; }
    if (s.level === 1) {
      const c = rec || s.cross || s.crosses[ci]; if (!c) return null; const ui = this.sim.unk(s, c);
      let row = 0; for (let k = 0; k < ci && k < s.crosses.length; k++) if (this.sim.unk(s, s.crosses[k]) === ui) row++;
      const rh = this.l2RowH(), x = g.slots[ui].x, w = Math.min(g.sw - 14, 84 * Math.max(1, g.pk)), cwid = w / 4;
      return [x - w / 2 + cwid * (j + 0.5), g.bedY0 + 26 + rh * (row + 1) - 3];
    }
    return null;
  },
  l2RowH() { const g = this.geo(), s = this.sim.s; let m = 2; for (let i = 1; i <= 5; i++) { let r = 0; for (const c of s.crosses) if (this.sim.unk(s, c) === i) r++; if (s.cross && this.sim.unk(s, s.cross) === i) r++; m = Math.max(m, r); } return Math.min(40 * Math.max(1, g.pk), (g.bedH - 30) / m); },
  heapXY(c, k) {   // pea k in saucer c (cosmetic): a heap packed from the saucer's floor
    const g = this.geo(), s = this.sim.s, cx = g.col(c), top = g.bedY0 + 44, floor = g.bedY1 - 40;
    const r = this.peaR(), per = Math.max(4, Math.floor((g.colW - 18) / (r * 2.1))), row = Math.floor(k / per), i = k % per, off = row % 2 ? r : 0;
    const y = floor - 6 - row * r * 1.75; return [cx - (per - 1) * r * 1.05 + i * r * 2.1 + off - (row % 2 ? r * 0.5 : 0), Math.max(top + r, y)];
  },
  peaR() { const g = this.geo(), s = this.sim.s; let m = 8; for (const c of s.f2) m = Math.max(m, c); if (s.cross && s.cross.type === 'Hs') m += 8; const hgt = g.bedH - 44 - 58; let r = Math.min(9 * Math.max(1, g.pk * 0.9), g.colW / 9); for (let k = 0; k < 6; k++) { const per = Math.max(4, Math.floor((g.colW - 18) / (r * 2.1))), rows = Math.ceil(m / per); if (rows * r * 1.75 + 8 <= hgt) break; r *= 0.86; } return Math.max(3.5, r); },
  trayR() { const g = this.geo(), s = this.sim.s, G = s.pl[3], n = Math.max(8, G ? G.tt + G.ts + (s.cross && (s.cross.type === 'Gt' || s.cross.type === 'Gs') ? s.cross.kids.length : 0) : s.crosses.filter(r => r.type === 'F1').length * 8 + (s.cross && s.cross.type === 'F1' ? 8 : 0)), w = g.x0 + g.cw - g.hx - 24; return Math.max(2.5, Math.min(8, w / (n * 2.3))); },
  trayXY(k) { const g = this.geo(), r = this.trayR(); return [g.hx + 12 + k * r * 2.3 + r, g.bedY0 + 21]; },

  /* ---------- input: drag pollen between flowers; tap a flower, then another; tap a tag to call ---------- */
  down(x, y) {
    if (y < this.hudH()) return; const s = this.sim.s, v = this.v;
    if (s.ask) return;
    if (this.sim.anim(s)) { Sim.act(this, { k: 'ff' }); return; }
    if (s.phase !== 'idle') return;
    const t = this.tagAt(x, y); if (t >= 0) { this.cycle(t); return; }
    const i = this.plantAt(x, y, true); if (i >= 0) { v.drag = { a: i, x, y, x0: x, y0: y, moved: false }; return; }
  },
  move(x, y) { const d = this.v.drag; if (!d) return; d.x = x; d.y = y; if (MG.dist(x - d.x0, y - d.y0) > 12) d.moved = true; this.v.hov = d.moved ? this.plantAt(x, y, true) : -1; },
  up(x, y) {
    const v = this.v, d = v.drag; if (!d) return; v.drag = null; v.hov = -1;
    if (x != null) { d.x = x; d.y = y; if (MG.dist(x - d.x0, y - d.y0) > 12) d.moved = true; }
    if (d.moved) { const j = this.plantAt(d.x, d.y, true); if (j >= 0) { v.dropAt = [d.x, d.y]; this.cross(d.a, j); } return; }
    this.tapPlant(d.a);
  },
  tapPlant(i) {   // tap-tap: the first tap loads the brush, the second drops it (the same flower selfs it); L2: a tap on a purple plant tests it
    const s = this.sim.s, v = this.v, P = s.pl[i]; if (!P) return;
    if (s.left <= 0) { v.sel = -1; if (this.sim.callable(s, P)) this.cycle(i); else this.whisper('left'); return; }   // no crosses left: a tap on a plant calls it
    if (s.level === 1 && P.k === 'U' && v.sel < 0) { this.cross(0, i); return; }
    if (s.level === 0 && P.k === 'H' && v.sel < 0) { this.cross(i, i); return; }   // L1: a tap on the hybrid selfs it (the ghost demonstrates this tap)
    if (s.level === 2 && v.sel < 0) {   // L3: a tap does the only useful cross (the two parents together; the hybrid selfed); the abbot's pea has two tests, so it loads the brush
      if ((P.k === 'RY' || P.k === 'WG') && !s.pl[2]) { this.cross(i, i === 0 ? 1 : 0); return; }
      if (P.k === 'H') { this.cross(i, i); return; }
    }
    if (v.sel < 0) { v.sel = i; this.whisper('pick'); if (typeof Snd2 !== 'undefined') { const f = this.flowerXY(i); Snd2.play('tick', { x: f[0], y: f[1] }); } return; }
    const a = v.sel; v.sel = -1; this.cross(a, i);
  },
  cross(a, b) { Sim.act(this, { k: 'cross', a, b }); },
  cycle(i) {
    const s = this.sim.s, P = s.pl[i]; if (!this.sim.callable(s, P)) return;
    if (P.lock) { this.whisper(s.level === 1 ? 'lock' : 'lockG'); return; }
    const vs = s.level === 1 ? ['pure', 'carrier'] : ['true', 'hides'];   // the first tap calls the safer-sounding answer; later taps toggle (a call is never taken back to "?")
    Sim.act(this, { k: 'call', i, v: P.call === vs[0] ? vs[1] : vs[0] });
  },
  onKey(k, e) {
    const s = this.sim.s;
    if (k === ' ' || k === 'Spacebar') { if (this.sim.anim(s)) Sim.act(this, { k: 'ff' }); return; }
    if (k === 'Enter') { if (s.phase === 'idle' && this.sim.canDone(s)) Sim.act(this, { k: 'done' }); return; }
    if ((k === 'c' || k === 'C') && this.v.sel >= 0) { const i = this.v.sel; this.v.sel = -1; this.cycle(i); return; }
    const d = /^[1-6]$/.test(k) ? +k - 1 : -1;
    if (d >= 0 && d < this.geo().n && s.phase === 'idle' && !s.ask && s.pl[d]) { if (e && e.shiftKey && this.sim.callable(s, s.pl[d])) this.cycle(d); else this.tapPlant(d); }
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, can = this.sim.canDone(s), sig = s.phase + (s.ask ? s.ask.id : '') + (can ? 'd' : '') + (s.pl[3] ? 'g' : '') + s.level;
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set(MG_ASK.p1.opts.map((v, i) => ({ id: 'mg-a' + i, label: [L.none, L.quarter, L.half][i], key: String(i + 1), fn: () => Sim.act(this, { k: 'predict', id: 'p1', v }) }))); return; }
    if (this.sim.anim(s)) { Dock.set([{ id: 'mg-ff', label: L.hurry, key: 'f', fn: () => Sim.act(this, { k: 'ff' }) }]); return; }
    if (s.phase === 'idle' && (s.level === 1 || (s.level === 2 && s.pl[3]))) { Dock.set([{ id: 'mg-done', label: L.done, key: 'Enter', primary: true, disabled: !can, why: this.content.whispers.calls, fn: () => Sim.act(this, { k: 'done' }) }]); return; }
    Dock.set([]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, lab = this.content.labels, L = s.level, S = this.sim; let t;
    const last = s.crosses[s.crosses.length - 1];
    if (s.ask) t = C.p1;
    else if (s.phase === 'reveal') t = C.reveal;
    else if (s.phase === 'end' || s.phase === 'over') t = s.tally && L === 2 ? C.nog : C.over;
    else if (S.anim(s)) t = s.phase === 'grow' && L !== 2 ? C.grow : C.wait;
    else if (this.v.sel >= 0) t = s.pl[this.v.sel] && s.pl[this.v.sel].k === 'G' ? C.pickG : C.pick;
    else if (L === 0) {
      if (!s.pl[2]) t = s.crosses.length ? C.nohyb : this.content.firstWords;
      else if (!s.hs) t = C.f1;
      else if (last && last.type === 'Hs' && s.hs === 1 && !this.v.keyOnce) t = C.key1;
      else t = Txt.f(C.f2, { w: s.f2[1], n: s.f2[0] + s.f2[1] });
    } else if (L === 1) {
      const P = s.last >= 1 ? s.pl[s.last] : null;
      if (s.left <= 0 && !S.canDone(s)) t = C.out2;
      else if (S.canDone(s)) t = C.ready2;
      else if (!P) t = C.start2;
      else if (P.tw > 0) t = Txt.f(C.white2, { p: P.name });
      else t = Txt.f(C.purple2, { p: P.name, n: P.tn, k: MG.oneIn(S.uMiss(P)) });
    } else {
      const G = s.pl[3];
      if (!s.pl[2]) t = C.start3;
      else if (!s.hs) t = C.f13;
      else if (!G) t = last && last.type === 'Hs' && s.hs === 1 && !this.v.key3Once ? C.key3 : C.f23;
      else if (G.call && !G.lock) t = C.ready3;
      else if (G.tw > 0) t = C.gw3;
      else if (G.tt + G.ts > 0) t = Txt.f(C.g3, { n: G.tt + G.ts, k: MG.oneIn(S.gMiss(G)) });
      else t = C.abbot;
    }
    if ((t === C.key1 || t === C.key3) && s.phase === 'idle') { this._keyT = (this._keyT || 0) + 1 / 60; if (this._keyT > 4) { if (t === C.key1) this.v.keyOnce = true; else this.v.key3Once = true; } }
    const num = Txt.f(lab.left, { n: s.left }), sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num);
  },

  /* ---------- the strip: one chart a level (API_v2 §7.1); expected bars only after the call ---------- */
  notes() {
    const s = this.sim.s, lab = this.content.labels, S = this.sim, stats = [[lab.sLeft, String(s.left), '']];
    if (s.level === 0) stats.push([lab.sSelf, String(s.hs), ''], [lab.sPW, s.f2[0] + ' : ' + s.f2[1], '']);
    else if (s.level === 1) { if (s.phase === 'end' || s.phase === 'over') stats.push([lab.sRight, S.right(s) + ' of 5', '']); }
    else stats.push([lab.sClasses, s.f2.join(' : '), '9 : 3 : 3 : 1 expected']);
    return { stats, charts: [this.chartSpec(false)] };
  },
  chartSpec(card) {
    const s = this.sim.s, lab = this.content.labels, over = card || s.phase === 'end' || s.phase === 'over' || s.phase === 'reveal';
    if (s.level === 0) {
      const n = s.f2[0] + s.f2[1], shown = over || (s.asks.indexOf('p1') >= 0 && !s.ask);
      return { type: 'mg_bars', title: lab.tOffspring, y: { lo: 0, hi: Math.max(8, Math.ceil(n * 0.85 / 4) * 4) }, cols: [{ label: lab.purple, v: s.f2[0], e: shown && n ? n * 0.75 : null }, { label: lab.white, v: s.f2[1], e: shown && n ? n * 0.25 : null, hatch: true }], frame: 'designed', eLabel: '3 : 1' };
    }
    if (s.level === 1) {
      let hi = 8; const cols = []; for (let i = 1; i <= 5; i++) { const U = s.pl[i]; hi = Math.max(hi, U.tn + U.tw); cols.push({ label: U.name, v: U.tn, w: U.tw }); }
      return { type: 'mg_bars', title: lab.tTests, y: { lo: 0, hi: Math.ceil(hi / 4) * 4 }, cols, frame: 'designed', stack: true };
    }
    const n = s.f2[0] + s.f2[1] + s.f2[2] + s.f2[3], shown = n > 0;
    return { type: 'mg_bars', title: lab.tPeas, y: { lo: 0, hi: Math.max(8, Math.ceil(n * 0.66 / 4) * 4) }, cols: MG_CLS.map((c, i) => ({ label: ['RY', 'RG', 'WY', 'WG'][i], v: s.f2[i], e: shown ? n * c[0] / 16 : null, hatch: i === 3 })), frame: 'designed', eLabel: '9:3:3:1' };
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g);
    for (let i = 0; i < g.n; i++) this.drawSlot(c, g, i);
    this.drawBed(c, g);
    this.drawPodScene(c, g);
    this.drawBrush(c, g);
    this.drawLedger(c, g);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('mg-banner', v.banner.text, g.W / 2, g.bedY0 + g.bedH * 0.5, { size: Math.round(g.fs * 1.5) }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached
    const sig = g.k; if (!this._bg || this.v.bgSig !== sig) { this._bg = this._bg || Layer(g.W, g.H); this._bg.resize(g.W, g.H); this._bg.redraw(cc => this.paintBg(cc, g)); this.v.bgSig = sig; }
    this._bg.blit(c, 0, 0);
  },
  wash(c, fill, col, a, n, rnd, j) {   // cosmetic: a watercolour wash, a few offset passes with soft edges
    c.save(); c.fillStyle = col; for (let k = 0; k < n; k++) { c.globalAlpha = a; c.save(); c.translate((rnd() - 0.5) * j, (rnd() - 0.5) * j); fill(); c.fill(); c.restore(); } c.restore();
  },
  blob(c, x, y, rx, ry, rnd, k) {   // cosmetic: an irregular closed blot
    c.beginPath(); const n = 14; for (let i = 0; i <= n; i++) { const a = i / n * TAU, r = 1 + (rnd() - 0.5) * (k || 0.25); const px = x + Math.cos(a) * rx * r, py = y + Math.sin(a) * ry * r; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath();
  },
  paintBg(c, g) {   // cosmetic: sky, the abbey wall with its tiled coping and arched windows, sage hedge, bench, seed bed or linen, paper grain
    const C = MG_C, W = g.W, H = g.H, rnd = rng(1866), s = this.sim.s, wallTop = Math.round(g.top + (g.benchY - g.top) * 0.16), wallBot = g.benchY - 14;
    const sk = c.createLinearGradient(0, 0, 0, wallTop + 20); sk.addColorStop(0, C.sky); sk.addColorStop(1, C.sky2); c.fillStyle = sk; c.fillRect(0, 0, W, wallTop + 20);
    for (let i = 0; i < 5; i++) { const x = rnd() * W, y = rnd() * (wallTop * 0.8); this.wash(c, () => this.blob(c, x, y, 40 + rnd() * 50, 8 + rnd() * 8, rnd, 0.3), '#FFFFFF', 0.25, 3, rnd, 6); }
    // the wall: stucco with soft blotches
    c.fillStyle = C.stucco; c.fillRect(0, wallTop, W, wallBot - wallTop + 2);
    for (let i = 0; i < 26; i++) { const x = rnd() * W, y = wallTop + rnd() * (wallBot - wallTop); this.wash(c, () => this.blob(c, x, y, 18 + rnd() * 40, 10 + rnd() * 22, rnd, 0.4), rnd() < 0.5 ? C.stuccoD : '#F4E8CC', 0.12, 2, rnd, 5); }
    // tiled coping
    c.fillStyle = C.tileD; c.fillRect(0, wallTop - 7, W, 9); const tw = 14;
    for (let x = -tw / 2; x < W + tw; x += tw) { c.fillStyle = C.tile; c.beginPath(); c.arc(x, wallTop - 6, tw / 2, Math.PI, 0); c.fill(); c.strokeStyle = 'rgba(70,30,20,.35)'; c.lineWidth = 1; c.stroke(); }
    // arched windows with leaded panes
    const wh = Math.max(40, (wallBot - wallTop) * 0.62), ww = Math.max(22, Math.min(46, W * 0.07)), wy = wallTop + (wallBot - wallTop) * 0.14;
    for (const fx of [0.13, 0.5, 0.87]) {
      const x = W * fx; c.fillStyle = C.stuccoD; c.beginPath(); c.moveTo(x - ww / 2 - 5, wy + wh + 4); c.lineTo(x - ww / 2 - 5, wy + ww / 2); c.arc(x, wy + ww / 2, ww / 2 + 5, Math.PI, 0); c.lineTo(x + ww / 2 + 5, wy + wh + 4); c.closePath(); c.fill();
      const gl = c.createLinearGradient(0, wy, 0, wy + wh); gl.addColorStop(0, C.glassL); gl.addColorStop(1, C.glass); c.fillStyle = gl;
      c.beginPath(); c.moveTo(x - ww / 2, wy + wh); c.lineTo(x - ww / 2, wy + ww / 2); c.arc(x, wy + ww / 2, ww / 2, Math.PI, 0); c.lineTo(x + ww / 2, wy + wh); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,40,36,.55)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x - ww / 2, wy + ww / 2 + k * (wh - ww / 2) / 4); c.lineTo(x + ww / 2, wy + ww / 2 + k * (wh - ww / 2) / 4); c.stroke(); }
      c.beginPath(); c.moveTo(x, wy); c.lineTo(x, wy + wh); c.stroke();
    }
    // sage hedge along the wall foot
    for (let x = -10; x < W + 20; x += 13) { const r = 10 + rnd() * 7; this.wash(c, () => { c.beginPath(); c.arc(x, wallBot - 4, r, Math.PI, 0); }, rnd() < 0.5 ? C.hedge : C.hedgeD, 0.55, 2, rnd, 3); }
    c.fillStyle = C.gravel; c.fillRect(0, wallBot, W, g.benchY - wallBot + 2);
    // the potting bench: a plank and its shadow
    c.fillStyle = 'rgba(60,40,25,.25)'; c.fillRect(0, g.benchY + 10, W, 8);
    c.fillStyle = C.bench; c.fillRect(0, g.benchY - 2, W, 14); c.fillStyle = C.benchL; c.fillRect(0, g.benchY - 2, W, 3); c.fillStyle = C.benchD; c.fillRect(0, g.benchY + 9, W, 3);
    c.strokeStyle = 'rgba(60,40,25,.3)'; c.lineWidth = 1; for (let x = 20; x < W; x += 47 + rnd() * 30) { c.beginPath(); c.moveTo(x, g.benchY + 1); c.lineTo(x + 20, g.benchY + 1); c.stroke(); }
    // ground below the bench
    c.fillStyle = C.gravel; c.fillRect(0, g.benchY + 12, W, g.bedY0 - g.benchY - 12);
    if (s.level === 2) {   // linen cloth on the table: saucers sit here
      c.fillStyle = C.cloth; c.fillRect(0, g.bedY0 - 6, W, g.bedY1 - g.bedY0 + 12);
      c.strokeStyle = 'rgba(150,130,100,.18)'; for (let y = g.bedY0; y < g.bedY1; y += 5) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      for (let x = 0; x < W; x += 5) { c.beginPath(); c.moveTo(x, g.bedY0 - 6); c.lineTo(x, g.bedY1 + 6); c.stroke(); }
    } else {   // the seed bed: dark tilled soil in a plank frame
      c.fillStyle = C.benchD; this.rr(c, g.x0 - 4, g.bedY0 - 6, g.cw + 8, g.bedH + 12, 6); c.fill();
      c.fillStyle = C.soil; c.fillRect(g.x0 + 2, g.bedY0, g.cw - 4, g.bedH);
      for (let i = 0; i < 260; i++) { const x = g.x0 + 2 + rnd() * (g.cw - 4), y = g.bedY0 + rnd() * g.bedH; c.fillStyle = rnd() < 0.5 ? C.soilD : C.soilL; c.globalAlpha = 0.5; c.beginPath(); c.ellipse(x, y, 1 + rnd() * 2.2, 0.8 + rnd() * 1.2, rnd() * 3, 0, TAU); c.fill(); }
      c.globalAlpha = 1;
    }
    c.fillStyle = C.gravel; c.fillRect(0, g.bedY1 + 6, W, H - g.bedY1 - 6);
    for (let i = 0; i < 200; i++) { c.fillStyle = 'rgba(120,100,70,.18)'; c.fillRect(rnd() * W, g.bedY1 + 6 + rnd() * (H - g.bedY1), 1.5, 1.5); }
  },
  rr(c, x, y, w, h, r) { rrect(c, x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); },

  /* ---------- a pot on the bench: terracotta, a hazel stick, the pea plant and its flower; its tag ---------- */
  drawSlot(c, g, i) {
    const s = this.sim.s, v = this.v, P = s.pl[i], x = g.slots[i].x, by = g.benchY, k = g.pk, lab = this.content.labels;
    const L = s.level, white = !P ? false : L === 2 || !MG.dom(P.A);
    this.drawPot(c, x, by, k, !!P);
    if (P) {
      const sel = v.sel === i || (v.drag && v.drag.a === i), hov = v.hov === i, gl = v.glow[i] > 0;
      const grow = 1;
      this.drawPlant(c, x, by, k, white, { sel, hov, gl, pods: Math.min(3, P.pods), seed: i * 7 + L * 31, grow });
      if (s.phase === 'pod' && s.cross && s.cross.b === i) this.drawPodOn(c, x, by, k, s.pt / MG_T.pod);
    }
    // the tag: name, or the call
    const b = this.tagBox(i), callable = this.sim.callable(s, P);
    let text = P ? lab[P.k] || P.name : (L === 0 ? lab.Hq : lab.Gq);
    if (L === 1 && P && P.k === 'U') text = P.name + ': ' + (P.call ? lab[P.call] : lab.ask);
    if (L === 2 && P && P.k === 'G') text = P.call ? lab[P.call] : lab.ask;
    const ink = P ? MG_C.ink : 'rgba(74,54,38,.5)', bg = callable ? (P.call ? (P.call === 'pure' || P.call === 'true' ? '#F6EBC8' : '#E9DDF3') : '#FFFDF5') : 'rgba(247,239,219,.85)';
    c.save(); c.strokeStyle = 'rgba(90,70,50,.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, by + 4); c.lineTo(x, b.y + 2); c.stroke(); c.restore();
    const box = Lbl.put('mg-tag' + i, text, x, g.tagY, { size: Math.max(12, g.fs - (g.sw < 70 || (L === 2 && g.sw < 110) ? 2 : 0)), bg, ink });
    if (callable && box && !P.lock && !P.call && s.phase === 'idle') { c.save(); c.globalAlpha = 0.5 + 0.3 * Math.sin(v.t * 4); c.strokeStyle = MG_C.vioD; c.lineWidth = 2; this.rr(c, box.x - 2, box.y - 2, box.w + 4, box.h + 4, box.h / 2 + 2); c.stroke(); c.restore(); }   // cosmetic
    if (P && v.reveal > 0) this.drawReveal(c, g, i, P, box);
  },
  drawReveal(c, g, i, P, box) {   // cosmetic: the truth, in ink, above the tag
    const s = this.sim.s, L = s.level, a = Math.min(1, this.v.reveal * 1.4); if (L === 0 && P.k !== 'H' && P.k !== 'P' && P.k !== 'W') return;
    let gt = ''; if (L === 2) { if (P.k !== 'G') return; gt = (P.R[0] && P.R[1] ? 'RR' : 'Rr') + 'yy'; } else gt = (P.A[0] + P.A[1] === 2 ? 'PP' : P.A[0] + P.A[1] === 1 ? 'Pp' : 'pp');
    const ok = L === 1 ? (P.k === 'U' ? P.call === (MG.het(P.A) ? 'carrier' : 'pure') : null) : L === 2 ? this.sim.gRight(s) : null;
    c.save(); c.globalAlpha = a; const y = g.benchY - 10 * g.pk - 6;
    Lbl.put('mg-gt' + i, gt + (ok == null ? '' : ok ? ' ✓' : ' ✗'), g.slots[i].x, y, { size: g.fs, mono: true, bg: ok === false ? '#F3D3C8' : ok ? '#DDEBC9' : '#FFFDF5', ink: MG_C.ink });
    c.restore();
  },
  drawPot(c, x, by, k, full) {   // cosmetic: a terracotta pot standing on the bench
    const C = MG_C, h = 34 * k, tw = 24 * k, bw = 17 * k, rim = 6 * k;
    c.save(); c.fillStyle = 'rgba(60,40,25,.22)'; c.beginPath(); c.ellipse(x + 3, by, bw * 1.2, 3.5 * k, 0, 0, TAU); c.fill();
    const gr = c.createLinearGradient(x - tw, 0, x + tw, 0); gr.addColorStop(0, C.potD); gr.addColorStop(0.35, C.potL); gr.addColorStop(1, C.potD);
    c.fillStyle = gr; c.beginPath(); c.moveTo(x - bw, by); c.lineTo(x - tw * 0.92, by - h + rim); c.lineTo(x + tw * 0.92, by - h + rim); c.lineTo(x + bw, by); c.closePath(); c.fill();
    c.fillStyle = C.pot; this.rr(c, x - tw, by - h, tw * 2, rim, 2 * k); c.fill(); c.fillStyle = 'rgba(255,220,190,.35)'; c.fillRect(x - tw + 2, by - h + 1, tw * 2 - 4, 1.5 * k);
    if (full) { c.fillStyle = C.soilD; c.beginPath(); c.ellipse(x, by - h + 1, tw * 0.86, 2.6 * k, 0, 0, TAU); c.fill(); }
    else { c.fillStyle = 'rgba(62,46,35,.55)'; c.beginPath(); c.ellipse(x, by - h + 1, tw * 0.86, 2.6 * k, 0, 0, TAU); c.fill(); }
    c.restore();
  },
  drawPlant(c, x, by, k, white, o) {   // cosmetic: a pea plant climbing a hazel stick, leaflets and stipules, tendrils, a flower at the top
    const C = MG_C, rnd = rng(o.seed + 3), top = by - 150 * k, base = by - 34 * k;
    c.save(); c.lineCap = 'round';
    c.strokeStyle = C.stick; c.lineWidth = 2 * k; c.beginPath(); c.moveTo(x - 6 * k, base); c.lineTo(x - 9 * k, top - 14 * k); c.stroke();
    c.lineWidth = 1.2 * k; for (let i = 0; i < 4; i++) { const yy = base - (i + 1) * 26 * k, dir = i % 2 ? 1 : -1; c.beginPath(); c.moveTo(x - 7 * k - i * 0.6 * k, yy); c.lineTo(x - 7 * k + dir * 12 * k, yy - 12 * k); c.stroke(); }
    // stem: a gentle zigzag
    const pts = []; for (let i = 0; i <= 6; i++) pts.push([x + (i % 2 ? 3 : -2) * k + (rnd() - 0.5) * 2 * k, base - (base - top) * i / 6]);
    c.strokeStyle = C.stem; c.lineWidth = 2.6 * k; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    for (let i = 1; i < 6; i++) {   // a node: two broad stipules clasping the stem, a leaf of two leaflet pairs, a branched tendril
      const p = pts[i], dir = i % 2 ? 1 : -1, sz = (1.12 - i * 0.07) * k, ex = p[0] + dir * 21 * sz, ey = p[1] - 9 * sz;
      c.fillStyle = C.stip; c.strokeStyle = 'rgba(70,100,50,.45)'; c.lineWidth = 0.7 * k;
      for (const d of [-1, 1]) { c.beginPath(); c.ellipse(p[0] + d * 4.2 * sz, p[1] + 3 * sz, 5.6 * sz, 3.8 * sz, d * 0.55, 0, TAU); c.fill(); c.stroke(); }
      c.strokeStyle = C.stem; c.lineWidth = 1.1 * k; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(ex, ey); c.stroke();
      for (const q of [0.42, 0.8]) {
        const qx = p[0] + (ex - p[0]) * q, qy = p[1] + (ey - p[1]) * q;
        for (const up of [-1, 1]) { c.fillStyle = up < 0 ? C.leaf : C.leafD; c.beginPath(); c.ellipse(qx + dir * 1.5 * sz, qy + up * 4.2 * sz, 5.4 * sz, 3 * sz, dir * (up < 0 ? -0.75 : 0.6), 0, TAU); c.fill(); }
        c.strokeStyle = 'rgba(60,90,40,.45)'; c.lineWidth = 0.5 * k; c.beginPath(); c.moveTo(qx, qy); c.lineTo(qx + dir * 4 * sz, qy - 4.5 * sz); c.moveTo(qx, qy); c.lineTo(qx + dir * 4 * sz, qy + 3.5 * sz); c.stroke();
      }
      c.strokeStyle = C.leafD; c.lineWidth = 0.75 * k; c.beginPath(); c.moveTo(ex, ey); c.quadraticCurveTo(ex + dir * 5 * sz, ey - 3 * sz, ex + dir * 6 * sz, ey - 8 * sz); c.arc(ex + dir * 4.5 * sz, ey - 8 * sz, 1.6 * sz, 0, TAU * 0.85); c.moveTo(ex, ey); c.quadraticCurveTo(ex + dir * 6 * sz, ey + 1 * sz, ex + dir * 9 * sz, ey - 1 * sz); c.stroke();
    }
    for (let i = 0; i < (o.pods || 0); i++) { const p = pts[2 + i], dir = i % 2 ? -1 : 1; this.drawPodShape(c, p[0] + dir * 10 * k, p[1] + 10 * k, 18 * k, dir * 1.1, 0); }
    // the flower (and a bud beside it)
    const fx = x + 2 * k, fy = top;
    if (o.sel || o.hov || o.gl) { c.fillStyle = o.hov ? 'rgba(232,180,58,.35)' : 'rgba(232,180,58,.25)'; c.beginPath(); c.arc(fx, fy, 24 * k + 4, 0, TAU); c.fill(); c.strokeStyle = MG_C.pollen; c.lineWidth = 2; c.stroke(); }
    this.drawFlower(c, fx + 14 * k, fy + 14 * k, 0.55 * k, white, -0.5);
    this.drawFlower(c, fx, fy, k, white, 0.15);
    if (o.sel) { c.fillStyle = MG_C.pollen; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + this.v.t * 2; c.beginPath(); c.arc(fx + Math.cos(a) * 20 * k, fy + Math.sin(a) * 20 * k, 2, 0, TAU); c.fill(); } }
    c.restore();
  },
  drawFlower(c, x, y, k, white, rot) {   // cosmetic: a pea flower in side view, facing right: the broad standard behind, two wings, the keel, a green calyx
    const C = MG_C, edge = white ? C.whtS : C.vioD; c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(k, k); c.lineJoin = 'round';
    c.strokeStyle = C.leafD; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-6, 16); c.quadraticCurveTo(-5, 11, -3, 8); c.stroke();   // pedicel
    c.fillStyle = C.leafD; c.beginPath(); c.moveTo(-6, 6); c.lineTo(2, 5); c.lineTo(5, 9); c.lineTo(1, 11); c.lineTo(-5, 11); c.closePath(); c.fill();   // calyx
    c.fillStyle = C.leaf; c.beginPath(); c.moveTo(2, 5); c.lineTo(8, 4); c.lineTo(4, 8); c.closePath(); c.fill();   // a sepal tip
    c.fillStyle = white ? C.wht : C.vioL; c.strokeStyle = edge; c.lineWidth = 0.9;   // the standard (banner): broad, upright, notched
    c.beginPath(); c.moveTo(-3, 6); c.bezierCurveTo(-17, 2, -18, -15, -7, -17); c.quadraticCurveTo(-3, -18, -1, -14); c.quadraticCurveTo(2, -19, 6, -16); c.bezierCurveTo(14, -12, 10, 2, 2, 5); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = white ? 'rgba(150,160,110,.45)' : 'rgba(95,46,136,.5)'; c.lineWidth = 0.6;
    for (const a of [-0.9, -0.45, 0, 0.45]) { c.beginPath(); c.moveTo(-1, 4); c.quadraticCurveTo(-1 + a * 6, -4, -1 + a * 12, -14); c.stroke(); }
    if (!white) { c.fillStyle = 'rgba(95,46,136,.25)'; c.beginPath(); c.ellipse(-2, -2, 5, 7, 0, 0, TAU); c.fill(); }
    c.fillStyle = white ? C.whtD : C.vio; c.strokeStyle = white ? C.whtS : '#4A2070'; c.lineWidth = 0.8;   // the two wings, forward
    c.beginPath(); c.ellipse(5, 4, 8, 5, -0.25, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = white ? '#F4EEE0' : C.vioD; c.beginPath(); c.ellipse(7, 7, 7.5, 4.2, 0.05, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = white ? '#FFFFFF' : C.keel; c.strokeStyle = edge; c.lineWidth = 0.6; c.beginPath(); c.moveTo(4, 9); c.quadraticCurveTo(12, 12, 15, 8); c.quadraticCurveTo(10, 7, 4, 9); c.fill(); c.stroke();   // keel
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-8, -9, 3, 5, -0.4, 0, TAU); c.fill();   // a watercolour highlight
    c.restore();
  },

  drawPodShape(c, x, y, len, rot, open) {   // cosmetic: a pea pod, closed or with its upper valve lifted
    const C = MG_C; c.save(); c.translate(x, y); c.rotate(rot || 0);
    const h = len * 0.22;
    c.fillStyle = C.pod; c.strokeStyle = C.podD; c.lineWidth = Math.max(0.8, len / 60);
    c.beginPath(); c.moveTo(-len / 2, 0); c.bezierCurveTo(-len * 0.3, h * 1.3, len * 0.3, h * 1.3, len / 2, -h * 0.2); c.bezierCurveTo(len * 0.3, -h * 0.9, -len * 0.3, -h * 0.9, -len / 2, 0); c.fill(); c.stroke();
    c.strokeStyle = C.podL; c.beginPath(); c.moveTo(-len * 0.4, -h * 0.25); c.bezierCurveTo(-len * 0.2, -h * 0.6, len * 0.2, -h * 0.6, len * 0.42, -h * 0.35); c.stroke();
    c.restore();
  },
  drawPodOn(c, x, by, k, p) {   // cosmetic: the pod swelling on the mother plant, before it is picked into the close-up
    const q = Math.min(1, p / 0.45); if (p > 0.5) return; const fx = x + 2 * k, fy = by - 150 * k + 18 * k;
    this.drawPodShape(c, fx + 8 * k, fy + 8 * k, (10 + 20 * q) * k, 1.2, 0);
  },

  /* ---------- the open pod close-up and the flying peas ---------- */
  drawPodScene(c, g) {   // cosmetic
    const s = this.sim.s, C = s.cross, v = this.v, P = g.pod; if (!C) return;
    const ph = s.phase; if (ph !== 'pod' && ph !== 'peas' && ph !== 'ask' && ph !== 'grow') return;
    let a = 1, open = 0, sc = 1;
    if (ph === 'pod') { const p = s.pt / MG_T.pod; if (p < 0.4) return; a = Math.min(1, (p - 0.4) / 0.25); sc = 0.6 + 0.4 * Math.min(1, (p - 0.4) / 0.3); open = p > 0.8 ? (p - 0.8) / 0.2 : 0; }
    else if (ph === 'ask') { a = 1; open = 0; }
    else if (ph === 'peas') open = 1;
    else if (ph === 'grow') { a = Math.max(0, 1 - s.pt / 0.4); open = 1; }
    if (a <= 0) return;
    c.save(); c.globalAlpha = a;
    // the herbarium card behind the pod
    const cw = P.L * 1.22, ch = P.L * 0.44; c.fillStyle = 'rgba(40,30,20,.18)'; this.rr(c, P.x - cw / 2 + 4, P.y - ch / 2 + 5, cw, ch, 8); c.fill();
    c.fillStyle = MG_C.paper; this.rr(c, P.x - cw / 2, P.y - ch / 2, cw, ch, 8); c.fill(); c.strokeStyle = MG_C.ink2; c.lineWidth = 1; c.stroke();
    c.translate(P.x, P.y); c.scale(sc, sc);
    const L = P.L * 0.86, h = L * 0.2, n = C.kids.length;
    // lower valve
    c.fillStyle = MG_C.pod; c.strokeStyle = MG_C.podD; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-L / 2, 0); c.bezierCurveTo(-L * 0.3, h * 1.4, L * 0.3, h * 1.4, L / 2, -h * 0.1); c.lineTo(-L / 2, 0); c.fill(); c.stroke();
    if (open > 0) { c.fillStyle = MG_C.podIn; c.beginPath(); c.moveTo(-L / 2 + 4, 0); c.bezierCurveTo(-L * 0.3, h * 1.1, L * 0.3, h * 1.1, L / 2 - 4, -h * 0.1); c.lineTo(-L / 2 + 4, 0); c.fill(); }
    // the peas still in the pod
    const r = this.podPeaR(n, L);
    for (let j = 0; j < n; j++) {
      if (ph === 'peas' && j < C.j) continue; if (ph === 'grow') continue;
      const p = this.podPea(j), px = (p[0] - P.x) / sc, py = (p[1] - P.y) / sc + h * 0.25;
      if (open > 0.3 || ph === 'peas') this.drawPea(c, px, py, r, this.peaKind(C.kids[j]), j);
    }
    // upper valve: lifts as the pod splits
    c.save(); c.translate(0, -open * h * 0.35); c.scale(1, 1 - 0.45 * open);
    c.fillStyle = open > 0.5 ? MG_C.podIn : MG_C.pod; c.strokeStyle = MG_C.podD; c.beginPath(); c.moveTo(-L / 2, 0); c.bezierCurveTo(-L * 0.3, -h * 1.2, L * 0.3, -h * 1.2, L / 2, -h * 0.1); c.lineTo(-L / 2, 0); c.fill(); c.stroke();
    if (open > 0.5) { c.fillStyle = MG_C.pod; c.beginPath(); c.moveTo(-L / 2, 0); c.bezierCurveTo(-L * 0.3, -h * 1.2, L * 0.3, -h * 1.2, L / 2, -h * 0.1); c.bezierCurveTo(L * 0.3, -h * 0.95, -L * 0.3, -h * 0.95, -L / 2, 0); c.fill(); }
    c.strokeStyle = MG_C.podL; c.lineWidth = 2; c.beginPath(); c.moveTo(-L * 0.38, -h * 0.4); c.bezierCurveTo(-L * 0.15, -h * 0.8, L * 0.15, -h * 0.8, L * 0.38, -h * 0.45); c.stroke();
    c.restore();
    c.fillStyle = MG_C.podD; c.beginPath(); c.moveTo(L / 2, -h * 0.1); c.lineTo(L / 2 + 10, -h * 0.5); c.lineTo(L / 2 + 2, h * 0.1); c.fill();   // the stalk
    c.restore();
    if (ph === 'ask') Lbl.put('mg-askq', this.content.labels.howWhite, P.x, P.y + P.L * 0.16, { size: g.fs, bg: '#FFFDF5', ink: MG_C.vioD, weight: 700 });
    // peas in flight
    for (const f of v.fly) {
      const u = Math.min(1, f.t / f.d), e = u * u * (3 - 2 * u), x = f.from[0] + (f.to[0] - f.from[0]) * e, y = f.from[1] + (f.to[1] - f.from[1]) * e - 40 * 4 * u * (1 - u);
      this.drawPea(c, x, y, Math.max(3.5, this.podPeaR(n, L) * (1 - 0.4 * u)), this.peaKind(C.kids[f.j]), f.j);
    }
  },
  podPeaR(n, L) { return Math.max(4, Math.min(L * 0.05, L * 0.6 / (n * 2))); },
  peaKind(k) { if (this.sim.s.level !== 2) return { plain: true }; return { round: !!MG.dom(k.R), yellow: !!MG.dom(k.Y) }; },
  drawPea(c, x, y, r, kind, seed) {   // cosmetic: a pea: smooth and round, or wrinkled and dented; yellow, green or a plain dried pea
    const C = MG_C, col = kind.plain ? C.peaP : kind.yellow ? C.peaY : C.peaG, dk = kind.plain ? C.peaPD : kind.yellow ? C.peaYD : C.peaGD;
    c.save(); c.fillStyle = col; c.strokeStyle = dk; c.lineWidth = Math.max(0.8, r * 0.14);
    if (kind.plain || kind.round) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke(); }
    else {
      const rnd = rng(seed * 13 + 5), n = 7, P = [];   // a dented, angular pea: smooth curves through uneven points
      for (let i = 0; i < n; i++) { const a = i / n * TAU + rnd() * 0.3, rr = r * (0.84 + rnd() * 0.2); P.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9]); }
      c.beginPath(); const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; let m0 = mid(P[n - 1], P[0]); c.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) { const q = P[i], m = mid(q, P[(i + 1) % n]); c.quadraticCurveTo(q[0], q[1], m[0], m[1]); }
      c.closePath(); c.fill(); c.stroke();
      c.lineWidth = Math.max(0.6, r * 0.1); c.beginPath(); c.moveTo(x - r * 0.5, y - r * 0.1); c.quadraticCurveTo(x, y + r * 0.3, x + r * 0.45, y - r * 0.2); c.moveTo(x - r * 0.2, y - r * 0.55); c.quadraticCurveTo(x + r * 0.1, y - r * 0.25, x + r * 0.2, y - r * 0.6); c.stroke();
    }
    if (kind.plain || kind.round) { c.fillStyle = 'rgba(255,255,240,.55)'; c.beginPath(); c.arc(x - r * 0.35, y - r * 0.35, r * 0.3, 0, TAU); c.fill(); }
    c.restore();
  },

  /* ---------- the bed: offspring that grew from the peas ---------- */
  drawBed(c, g) {
    const s = this.sim.s; if (s.level === 0) this.drawRows(c, g); else if (s.level === 1) this.drawCols(c, g); else this.drawSaucers(c, g);
  },
  growOf(ci) {   // seedling growth 0..1 for cross ci (completed crosses are fully grown)
    const s = this.sim.s; if (ci < s.crosses.length) return 1; if (s.phase === 'grow') return Math.min(1, s.pt / MG_T.grow); return 0;
  },
  drawRows(c, g) {   // cosmetic: L1, one row of seedlings per cross, labelled in ink at the left
    const s = this.sim.s, lab = this.content.labels, rh = g.bedH / this.bedRows(), lw = Math.min(118, g.cw * 0.3);
    const rows = s.crosses.length + (s.cross ? 1 : 0);
    if (!rows) { c.save(); c.globalAlpha = 0.85; Lbl.put('mg-bed0', lab.bed, g.x0 + g.cw / 2, g.bedY0 + g.bedH / 2, { size: g.fs, pill: true }); c.restore(); return; }
    for (let ci = 0; ci < rows; ci++) {
      const rec = ci < s.crosses.length ? s.crosses[ci] : null, C = rec || s.cross, y = g.bedY0 + rh * (ci + 1) - 3, sz = Math.min(Math.max(1, g.pk), rh / 30);
      Lbl.put('mg-row' + ci, lab[C.type] || C.type, g.x0 + 6, y - rh * 0.42, { size: 12, align: 'left', bg: 'rgba(247,239,219,.88)' });
      const n = MG_LV[0].pod;
      for (let j = 0; j < n; j++) {
        const p = this.cellXY(ci, j, C); if (!p) continue;
        if (rec) this.drawSeedling(c, p[0], p[1], sz, rec.ph[j] === 1, 1);
        else if (this.v.land[j] || s.phase === 'grow') { const gr = this.growOf(ci); if (gr <= 0.02) this.drawPea(c, p[0], p[1] - 3, 3.5, { plain: true }, j); else this.drawSeedling(c, p[0], p[1], sz, MG.dom(C.kids[j].A) === 1, gr); }
      }
      if (rec) { const w = rec.w; Lbl.put('mg-cnt' + ci, (rec.n - w) + ':' + w, g.x0 + g.cw - 4, y - rh * 0.42, { size: 12, align: 'right', bg: w ? '#FFFFFF' : 'rgba(247,239,219,.88)' }); }
    }
  },
  drawCols(c, g) {   // cosmetic: L2, each purple plant's test offspring in a column under it, with its evidence on top
    const s = this.sim.s, lab = this.content.labels, S = this.sim, rh = this.l2RowH(), sz = Math.min(0.9 * Math.max(1, g.pk), rh / 32);
    const rowOf = {}; s.crosses.forEach((rec, ci) => { const ui = S.unk(s, rec); rowOf[ui] = (rowOf[ui] || 0) + 1; for (let j = 0; j < rec.n; j++) { const p = this.cellXY(ci, j, rec); if (p) this.drawSeedling(c, p[0], p[1], sz, rec.ph[j] === 1, 1); } });
    if (s.cross) { const ci = s.crosses.length, C = s.cross; for (let j = 0; j < C.kids.length; j++) { if (!(this.v.land[j] || s.phase === 'grow')) continue; const p = this.cellXY(ci, j, C); if (!p) continue; const gr = this.growOf(ci); if (gr <= 0.02) this.drawPea(c, p[0], p[1] - 3, 3.2, { plain: true }, j); else this.drawSeedling(c, p[0], p[1], sz, MG.dom(C.kids[j].A) === 1, gr); } }
    for (let i = 1; i <= 5; i++) {
      const U = s.pl[i], x = g.slots[i].x; if (!U.tn && !U.tw) continue;
      const t = U.tw > 0 ? lab.whiteBang : Txt.f(lab.oneIn, { k: MG.oneIn(S.uMiss(U)) });
      Lbl.put('mg-ev' + i, t, x, g.bedY0 + 12, { size: 12, bg: U.tw > 0 ? '#FFFFFF' : 'rgba(247,239,219,.9)', ink: U.tw > 0 ? MG_C.vioD : MG_C.ink });
    }
    // the tester's corner: a jar holding the brush
    const tx = g.slots[0].x, ty = g.bedY0 + g.bedH * 0.5; c.save(); c.fillStyle = 'rgba(220,230,225,.75)'; this.rr(c, tx - 10, ty - 6, 20, 26, 4); c.fill(); c.strokeStyle = 'rgba(80,90,90,.6)'; c.stroke(); c.restore();
    if (!s.cross && s.phase === 'idle' && this.v.sel !== 0 && !this.v.drag) this.drawBrushAt(c, tx + 2, ty - 8, -1.25, false, 0.8);
  },
  drawSeedling(c, x, y, k, purple, gr) {   // cosmetic: a young pea plant whose bud opens purple or white once it has grown
    const C = MG_C, h = 24 * k * Math.min(1, gr * 1.3); c.save(); c.lineCap = 'round';
    c.strokeStyle = C.stem; c.lineWidth = 1.6 * k; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 1, y - h); c.stroke();
    if (gr > 0.2) { c.fillStyle = C.leaf; c.beginPath(); c.ellipse(x - 4 * k, y - h * 0.45, 4.2 * k, 2.4 * k, 0.5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x + 4.5 * k, y - h * 0.6, 4.2 * k, 2.4 * k, -0.5, 0, TAU); c.fill(); }
    if (gr < 0.62) { if (gr > 0.35) { c.fillStyle = C.leafD; c.beginPath(); c.ellipse(x + 1, y - h - 2 * k, 2.4 * k, 3.4 * k, 0, 0, TAU); c.fill(); } }
    else { const b = Math.min(1, (gr - 0.62) / 0.3); this.drawFlower(c, x + 1, y - h - 3 * k, k * (0.42 + 0.18 * b), !purple, 0.1); }
    c.restore();
  },
  drawSaucers(c, g) {   // cosmetic: L3, four terracotta saucers of peas by kind; the abbot's test tray above them
    const s = this.sim.s, lab = this.content.labels, C = s.cross, r = this.peaR(), G = s.pl[3], top = g.bedY0 + 44;
    for (let i = 0; i < 4; i++) {
      const cx = g.col(i), w = g.colW - 10, y = g.bedY1 - 34;
      c.save(); c.fillStyle = 'rgba(80,50,30,.2)'; c.beginPath(); c.ellipse(cx + 3, y + 8, w * 0.5, 7, 0, 0, TAU); c.fill();
      c.fillStyle = MG_C.saucerD; c.beginPath(); c.ellipse(cx, y + 4, w * 0.5, 8, 0, 0, TAU); c.fill(); c.fillStyle = MG_C.saucer; c.beginPath(); c.ellipse(cx, y, w * 0.5, 7, 0, 0, TAU); c.fill(); c.restore();
      const kind = { round: i < 2, yellow: i % 2 === 0 };
      for (let k = 0; k < s.f2[i]; k++) { const p = this.heapXY(i, k); this.drawPea(c, p[0], p[1], r, kind, k + i * 97); }
      if (C && C.type === 'Hs') { let k = s.f2[i]; for (let j = 0; j < C.kids.length; j++) { if (MG.cls(C.kids[j]) !== i) continue; if (this.v.land[j] || s.phase === 'grow') { const p = this.heapXY(i, k); this.drawPea(c, p[0], p[1], r, kind, k + i * 97); } k++; } }
      const nm = lab[MG_CLS[i][1]].split(' '); Lbl.put('mg-sc' + i, nm[0], cx, g.bedY1 - 18, { size: 12, pill: false, ink: MG_C.ink, weight: 700 }); Lbl.put('mg-sd' + i, nm[1], cx, g.bedY1 - 4, { size: 12, pill: false, ink: MG_C.ink });
      if (s.hs || s.f2[i]) Lbl.put('mg-sn' + i, String(s.f2[i]), cx, Math.max(top + 10, this.heapXY(i, Math.max(0, s.f2[i] - 1))[1] - r - 12), { size: g.fs + 2, mono: true });
    }
    if (!G) {   // the first cross's peas, in the tray until the abbot's pea takes it over
      const f1 = s.crosses.filter(r => r.type === 'F1'), live = C && C.type === 'F1'; if (!f1.length && !live) return;
      const tr = this.trayR(), y0 = g.bedY0 + 4, y1 = g.bedY0 + 38;
      c.save(); c.fillStyle = 'rgba(246,238,220,.95)'; this.rr(c, g.hx, y0, g.x0 + g.cw - g.hx, y1 - y0, 8); c.fill(); c.strokeStyle = MG_C.ink2; c.lineWidth = 1; c.stroke(); c.restore();
      Lbl.put('mg-trayh', lab.f1peas, g.x0 + 4, y0 + 9, { size: 12, align: 'left', pill: false, ink: MG_C.ink });
      let k = 0; for (const rec of f1) for (let j = 0; j < rec.n; j++) { const q = this.trayXY(k++); this.drawPea(c, q[0], q[1], tr, { round: true, yellow: true }, k); }
      if (live) for (let j = 0; j < C.kids.length; j++) { if (!(this.v.land[j] || s.phase === 'grow')) continue; const q = this.trayXY(k + j); this.drawPea(c, q[0], q[1], tr, this.peaKind(C.kids[j]), k + j); }
      if (f1.length) Lbl.put('mg-f1ev', lab.allRY, g.x0 + 4, y1 - 6, { size: 12, align: 'left', bg: 'rgba(247,239,219,.9)' });
      return;
    }
    {   // the abbot's tray
      const tr = this.trayR(), y0 = g.bedY0 + 4, y1 = g.bedY0 + 38;
      c.save(); c.fillStyle = 'rgba(246,238,220,.95)'; this.rr(c, g.hx, y0, g.x0 + g.cw - g.hx, y1 - y0, 8); c.fill(); c.strokeStyle = MG_C.ink2; c.lineWidth = 1; c.stroke(); c.restore();
      Lbl.put('mg-trayh', lab.gTest, g.x0 + 4, y0 + 9, { size: 12, align: 'left', pill: false, ink: MG_C.ink });
      let k = 0; for (const rec of s.crosses) { if (rec.type !== 'Gt' && rec.type !== 'Gs') continue; for (const p of rec.ph) { const q = this.trayXY(k++); this.drawPea(c, q[0], q[1], tr, { round: p < 2, yellow: false }, k); } }
      if (C && (C.type === 'Gt' || C.type === 'Gs')) for (let j = 0; j < C.kids.length; j++) { if (!(this.v.land[j] || s.phase === 'grow')) continue; const q = this.trayXY(k + j); this.drawPea(c, q[0], q[1], tr, this.peaKind(C.kids[j]), k + j); }
      const n = G.tt + G.ts; if (n) { const t = G.tw > 0 ? Txt.f(lab.wrinkled, { n: G.tw }) : Txt.f(lab.oneIn, { k: MG.oneIn(this.sim.gMiss(G)) }); Lbl.put('mg-gev', t, g.x0 + 4, y1 - 6, { size: 12, align: 'left', bg: G.tw ? '#FFFFFF' : 'rgba(247,239,219,.9)' }); }
    }
  },

  /* ---------- the brush: follows a drag, or carries pollen from one flower to the other ---------- */
  drawBrush(c, g) {   // cosmetic
    const v = this.v, s = this.sim.s;
    if (v.drag && v.drag.moved) { const f = this.flowerXY(v.drag.a); c.save(); c.strokeStyle = 'rgba(232,180,58,.55)'; c.setLineDash([4, 5]); c.lineWidth = 2; c.beginPath(); c.moveTo(f[0], f[1]); c.lineTo(v.drag.x, v.drag.y); c.stroke(); c.restore(); this.drawBrushAt(c, v.drag.x, v.drag.y, -0.9, true, 1); return; }
    if (v.sel >= 0 && s.phase === 'idle') { const f = this.flowerXY(v.sel); this.drawBrushAt(c, f[0] + 16, f[1] + 10 + Math.sin(v.t * 3) * 2, -0.9, true, 1); return; }
    if (s.phase === 'brush' && s.cross) {
      const p = Math.min(1, s.pt / MG_T.brush), a = v.dropAt || this.flowerXY(s.cross.a), b = this.flowerXY(s.cross.b), from = v.brush ? v.brush.from : a;
      const e = p * p * (3 - 2 * p), x = from[0] + (b[0] - from[0]) * e + (p > 0.7 ? Math.sin(p * 40) * 3 : 0), y = from[1] + (b[1] - from[1]) * e - 26 * 4 * p * (1 - p);
      this.drawBrushAt(c, x, y, -0.9, p < 0.85, 1);
      if (p > 0.7) { c.save(); c.fillStyle = MG_C.pollen; for (let i = 0; i < 6; i++) { c.globalAlpha = 0.8; c.beginPath(); c.arc(b[0] + (Fx.rnd() - 0.5) * 16, b[1] + (Fx.rnd() - 0.5) * 12, 1.6, 0, TAU); c.fill(); } c.restore(); }
    }
  },
  drawBrushAt(c, x, y, ang, pollen, k) {   // cosmetic: a fine sable brush, its tip at (x, y)
    c.save(); c.translate(x, y); c.rotate(ang); c.scale(k, k); c.lineCap = 'round';
    c.strokeStyle = MG_C.brushW; c.lineWidth = 4; c.beginPath(); c.moveTo(14, 0); c.lineTo(52, 0); c.stroke();
    c.strokeStyle = MG_C.ferrule; c.lineWidth = 5; c.beginPath(); c.moveTo(9, 0); c.lineTo(15, 0); c.stroke();
    c.fillStyle = MG_C.brushT; c.beginPath(); c.moveTo(10, -3); c.quadraticCurveTo(2, -2, 0, 0); c.quadraticCurveTo(2, 2, 10, 3); c.closePath(); c.fill();
    if (pollen) { c.fillStyle = MG_C.pollen; for (const q of [[2, -1], [4, 1.5], [6, -1.5], [1, 1], [7, 0.5]]) { c.beginPath(); c.arc(q[0], q[1], 1.5, 0, TAU); c.fill(); } }
    c.restore();
  },

  /* ---------- the monk's ledger: counts, the key number and its meaning, in sepia ink ---------- */
  drawLedger(c, g) {
    const s = this.sim.s, x = g.x0, y = g.ledY, w = g.cw, h = g.ledH;
    c.save(); c.fillStyle = 'rgba(60,40,25,.22)'; this.rr(c, x + 3, y + 4, w, h, 6); c.fill();
    c.fillStyle = MG_C.paper; this.rr(c, x, y, w, h, 6); c.fill(); c.strokeStyle = MG_C.paperD; c.lineWidth = 1.5; c.stroke();
    c.strokeStyle = MG_C.rule; c.lineWidth = 1; for (let yy = y + 22; yy < y + h - 4; yy += Math.max(18, (h - 26) / 4)) { c.beginPath(); c.moveTo(x + 8, yy); c.lineTo(x + w - 8, yy); c.stroke(); }
    c.strokeStyle = MG_C.margin; c.beginPath(); c.moveTo(x + 22, y + 4); c.lineTo(x + 22, y + h - 4); c.stroke();
    c.restore();
    if (s.level === 0) this.ledger1(c, g); else if (s.level === 1) this.ledger2(c, g); else this.ledger3(c, g);
  },
  ink(id, t, x, y, o) { return Lbl.put(id, t, x, y, Object.assign({ size: 12, pill: false, ink: MG_C.ink }, o || {})); },
  ledger1(c, g) {   // L1: purple and white counts against 3 : 1 and Mendel's 705 : 224; the Punnett square once white is back
    const s = this.sim.s, lab = this.content.labels, x = g.x0, y = g.ledY, w = g.cw, h = g.ledH, fs = g.fs;
    const tw = w * 0.56, c1 = x + 30, cP = x + tw * 0.62, cW = x + tw * 0.9, rh = (h - 14) / 4, ry = i => y + 10 + rh * (i + 0.5);
    const n = s.f2[0] + s.f2[1], shown = s.asks.indexOf('p1') >= 0 && !s.ask;
    this.ink('mg-l-h1', lab.purple, cP, ry(0), { size: 12, ink: MG_C.vioD, weight: 700 }); this.ink('mg-l-h2', lab.white, cW, ry(0), { size: 12, weight: 700 });
    this.ink('mg-l-r1', lab.yours, c1, ry(1), { align: 'left' }); this.ink('mg-l-v1', String(s.f2[0]), cP, ry(1), { size: fs + 2, mono: true }); this.ink('mg-l-v2', String(s.f2[1]), cW, ry(1), { size: fs + 2, mono: true });
    if (shown) { this.ink('mg-l-r2', lab.expected, c1, ry(2), { align: 'left' }); this.ink('mg-l-e1', '¾', cP, ry(2), { size: fs + 2 }); this.ink('mg-l-e2', '¼', cW, ry(2), { size: fs + 2 }); }
    if (shown || s.phase === 'end' || s.phase === 'over') { this.ink('mg-l-r3', lab.mendel, c1, ry(3), { align: 'left' }); this.ink('mg-l-m1', '705', cP, ry(3), { mono: true }); this.ink('mg-l-m2', '224', cW, ry(3), { mono: true }); }
    // right: the genotypes, then the Punnett square for the selfed hybrid
    const px = x + tw + (w - tw) / 2;
    if (!s.pl[2]) { this.ink('mg-l-g0', lab.lines, px, ry(0), { weight: 700 }); this.ink('mg-l-g1', 'PP×pp', px, ry(1.4), { size: fs + 2, mono: true }); return; }
    if (!shown) { this.ink('mg-l-g0', lab.H, px, ry(0), { weight: 700 }); this.ink('mg-l-g1', 'PP×pp → Pp', px, ry(1.4), { size: fs, mono: true }); this.ink('mg-l-g2', lab.f1, px, ry(2.6), {}); return; }
    const cell = Math.min((h - 22) / 3, (w - tw) / 4.4), sx = x + tw + cell * 0.6, sy = y + 8 + cell;
    c.save(); c.strokeStyle = MG_C.ink; c.lineWidth = 1.2;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const white = i === 1 && j === 1; c.fillStyle = white ? '#FFFFFF' : 'rgba(163,123,203,.32)'; c.fillRect(sx + j * cell, sy + i * cell, cell, cell); c.strokeRect(sx + j * cell, sy + i * cell, cell, cell); }
    c.restore();
    const L2 = ['P', 'p']; for (let j = 0; j < 2; j++) { this.ink('mg-pt' + j, L2[j], sx + (j + 0.5) * cell, sy - cell * 0.42, { mono: true, weight: 700 }); this.ink('mg-pl' + j, L2[j], sx - cell * 0.42, sy + (j + 0.5) * cell, { mono: true, weight: 700 }); }
    const G4 = [['PP', 'Pp'], ['Pp', 'pp']]; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) this.ink('mg-pc' + i + j, G4[i][j], sx + (j + 0.5) * cell, sy + (i + 0.5) * cell, { mono: true, size: 12 });
    this.ink('mg-pk', '¼ = ½×½', sx + cell * 2 + 8, sy + cell, { align: 'left', size: fs + 1, weight: 700, ink: MG_C.vioD });
  },
  ledger2(c, g) {   // L2: the key number (½)ⁿ, and what it says about the last plant tested
    const s = this.sim.s, lab = this.content.labels, S = this.sim, x = g.x0, y = g.ledY, w = g.cw, h = g.ledH, fs = g.fs;
    this.ink('mg-l2a', lab.ifCar, x + 30, y + h * 0.28, { align: 'left', size: fs - 1 });
    this.ink('mg-l2b', '(½)ⁿ', x + 30, y + h * 0.64, { align: 'left', size: Math.round(fs * 1.9), weight: 700, ink: MG_C.vioD });
    this.ink('mg-l2c', 'Pp×pp → ½ white', x + w * 0.4, y + h * 0.28, { align: 'left', size: 12, mono: true });
    const P = s.last >= 1 ? s.pl[s.last] : null, mx = x + w * 0.4;
    if (!P || (!P.tn && !P.tw)) { this.ink('mg-l2d', 'n = purples', mx, y + h * 0.64, { align: 'left', size: fs }); return; }
    if (P.tw > 0) { this.ink('mg-l2d', P.name + ': ' + lab.whiteBang, mx, y + h * 0.58, { align: 'left', size: fs + 1, weight: 700 }); this.ink('mg-l2e', lab.carrier, mx, y + h * 0.82, { align: 'left', size: 12 }); return; }
    const sup = String(P.tn).split('').map(d => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d]).join('');
    this.ink('mg-l2d', P.name + ': (½)' + sup, mx, y + h * 0.58, { align: 'left', size: fs + 2, mono: true, weight: 700 });
    this.ink('mg-l2e', '= ' + Txt.f(lab.oneIn, { k: MG.oneIn(S.uMiss(P)) }), mx, y + h * 0.84, { align: 'left', size: fs });
  },
  ledger3(c, g) {   // L3: your counts, 9 : 3 : 3 : 1 and Mendel's, in columns under the saucers
    const s = this.sim.s, lab = this.content.labels, y = g.ledY, h = g.ledH, fs = g.fs, rh = (h - 12) / 3, ry = i => y + 8 + rh * (i + 0.5);
    this.ink('mg-l3r0', lab.yours, g.x0 + 28, ry(0), { align: 'left' }); this.ink('mg-l3r1', lab.expected, g.x0 + 28, ry(1), { align: 'left', weight: 700 }); this.ink('mg-l3r2', lab.mendel, g.x0 + 28, ry(2), { align: 'left' });
    const M = [315, 108, 101, 32];
    for (let i = 0; i < 4; i++) {
      const cx = g.col(i);
      this.ink('mg-l3y' + i, String(s.f2[i]), cx, ry(0), { mono: true, size: fs });
      this.ink('mg-l3e' + i, String(MG_CLS[i][0]), cx, ry(1), { size: fs + 3, weight: 700, ink: MG_C.vioD });
      this.ink('mg-l3m' + i, String(M[i]), cx, ry(2), { mono: true });
      if (i < 3) this.ink('mg-l3c' + i, ':', (cx + g.col(i + 1)) / 2, ry(1), { size: fs + 3, weight: 700, ink: MG_C.vioD });
    }
  }
};
V2.push(CH_MENDEL_V2);

/* ---- this unit's chart type (registered guarded): bars with an expected dashed line; stacked white (hatched) on purple ---- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.mg_bars) LiveGraph.T.mg_bars = {
  lay(w, h, spec, T, c) { const n = (spec.cols || []).length || 1, G = wgXY(w, h, Object.assign({}, spec, { x: { lo: -0.5, hi: n - 0.5 } }), T, c, { xlo: -0.5, xhi: n - 0.5, ylo: 0, yhi: (spec.y && spec.y.hi) || 1, labels: [] }); G.nextX = null; return G; },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, cols = spec.cols || [], bw = Math.min(40, p.w / Math.max(1, cols.length) * 0.5);
    wgAxes(c, G, spec, T, { noX: true });
    cols.forEach((b, i) => {
      const x = G.X(i), y0 = p.y + p.h;
      if (wgFin(b.v) && b.v > 0) { const y = G.Y(b.v); if (b.hatch) { c.strokeStyle = I.text; c.lineWidth = 1.5; c.strokeRect(x - bw / 2, y, bw, y0 - y); wgHatch(c, x - bw / 2, y, bw, y0 - y, I.text, 5, 1.2); } else { c.fillStyle = I.text; c.fillRect(x - bw / 2, y, bw, y0 - y); } }
      if (spec.stack && wgFin(b.w) && b.w > 0) { const yb = G.Y(b.v || 0), yt = G.Y((b.v || 0) + b.w); c.fillStyle = I.surface; c.fillRect(x - bw / 2, yt, bw, yb - yt); c.strokeStyle = I.text; c.lineWidth = 1.5; c.strokeRect(x - bw / 2, yt, bw, yb - yt); wgHatch(c, x - bw / 2, yt, bw, yb - yt, I.text, 5, 1.2); }
      if (wgFin(b.e)) { const y = G.Y(b.e); c.setLineDash([5, 3]); c.lineWidth = 2.5; c.strokeStyle = I.text; c.beginPath(); c.moveTo(x - bw * 0.85, y); c.lineTo(x + bw * 0.85, y); c.stroke(); c.setLineDash([]); }
      wgText(c, b.label, x, p.y + p.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
    });
    if (!T.compact && spec.eLabel && cols.some(b => wgFin(b.e))) wgText(c, '- - ' + spec.eLabel, p.x + p.w - 4, p.y + G.tk / 2 + 3, G.tk, I.text, { align: 'right', fam: 'b', wt: 600, halo: I.surface });
    if (!T.compact && spec.stack) wgText(c, '▨ white', p.x + p.w - 4, p.y + G.tk / 2 + 3, G.tk, I.text, { align: 'right', fam: 'b', wt: 600, halo: I.surface });
  },
  rows(spec) { return { head: ['', 'count', spec.stack ? 'white' : 'expected'], rows: (spec.cols || []).map(b => [b.label, wgFin(b.v) ? String(b.v) : '', spec.stack ? (wgFin(b.w) ? String(b.w) : '') : wgFin(b.e) ? (Math.round(b.e * 10) / 10).toString() : '']) }; },
  say(spec) { return (spec.cols || []).map(b => b.label + ' ' + (b.v || 0) + (spec.stack && b.w ? ' and ' + b.w + ' white' : '')).join(', '); }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.mendel = MG_TEXT.take;
  MODEL.mendel = 'Each pea gene has two copies; each seed takes one from each parent at random, and the dominant copy masks the recessive. Levels add the test cross and a second gene on another chromosome. Pod sizes and the cross budget are designed numbers.';
  RECALL.mendel = { q: 'A purple plant crossed with white gives eight purple seeds. How strong is the evidence that it carries no white copy?', opts: [['proof', 'Proof'], ['strong', 'Strong, not proof'], ['none', 'None']], ans: 'strong', why: 'A carrier would give eight purple seeds only 1 time in 256, (½)⁸. Strong evidence, but evidence, not proof.' };
  BRIDGE.mendel = 'The Lichen Wood showed variation being selected. Here is how variation is passed on, copy by copy.';
  if (typeof TRANSFER !== 'undefined' && TRANSFER.mendel) delete TRANSFER.mendel;
}
