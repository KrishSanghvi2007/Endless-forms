/* ================= v2/dig.js: The Dig (Act 1; D3 §5.6, D5 §4 item 17) =================
   A seaside cliff at golden hour: chalk over ochre sandstone, slate shale and a pale ash bed. Role: the flood that makes a
   record (L0), then a palaeontologist with a hammer, a laser and a brush (L1–L4; D1 G1 roles 1 and 3).
     L0 The flood          a Devonian sea floor; hold to pour mud and bury animals. Hard parts buried fast keep far more often;
                           one still, oxygen-free epoch keeps soft bodies too (a Lagerstätte); uplift and erosion tear out
                           layers. The record is a biased, gappy sample (Briggs 2003; Seilacher et al. 1985).
     L1 The clock          a zircon of 64 uranium-235 atoms; hold to run time and watch each atom decay at random. Then date an
                           ash zircon from the atoms you assay: the age is read off the decay curve (Jaffey et al. 1971).
     L2 Bracket the fish   two ash beds bracket a fossil fish (superposition). Sweep a laser over spots of 40 atoms; error bars
                           shrink as 1/√n. A spot budget forces a split between the beds.
     L3 Where to dig       a field map; finned fish in 385-Myr river rock, four-legged animals in 365-Myr rock. Predict the age
                           of an in-between form, then spend five seasons brushing (Daeschler, Shubin & Jenkins 2006).
     L4 Deep time (boss)   drag fossils onto a log ribbon from Earth's 4.54 Gyr to your Wood's last year. Placed in order they
                           look like a ladder; their ranges show a bush: several human relatives lived at once (Dirks 2017).
   Code shape (API_v2 §9): a headless sim (plain JSON; R(), Det, WF only; a run is (seed, level, actions)); all words in DG_TEXT;
   the view juices from Sim.run's events only. Top-level code touches only legacy objects and lower-numbered v2 files; engine
   calls at run time sit behind typeof guards. Under ?v1=1 the learning-layer lines at the foot are skipped. */

/* ---------- all words (API_v2 §9.2); tests/lint_text.js checks every budget ---------- */
const DG_TEXT = {
  intro: {
    game: 'You are the flood that buries a Devonian sea floor. Then you work its cliff at golden hour with hammer, laser and brush.',
    biology: 'Rock keeps a biased, gappy sample of past life. Uranium in volcanic crystals decays at a steady average rate, so ash beds date the fossils between them.',
    how: 'Hold to pour mud or run the clock. Sweep the laser over crystals, tap the map to dig, brush, and drag fossils onto the deep-time ribbon.'
  },
  firstWords: 'A Devonian sea floor. Hold where the animals are to pour mud and bury them.',
  hud: {
    flood: 'Hold over animals to bury them. Mud is short: aim it.',
    floodU: 'Hold over animals to bury them. Tap Settle when you are done.',
    still: 'The bottom water has gone still. No oxygen reaches the mud.',
    askK: 'Waves remove 1 layer in 4. What share of all animals will the cliff keep?',
    uplift: 'Millions of years pass. The sea floor rises into a cliff; waves bite into it.',
    reveal: 'The cliff as you would find it.',
    clock: 'One zircon, 64 uranium atoms. Hold to run time faster.',
    askA1: 'Half the uranium is gone. When will only 16 atoms be left? Drag, Lock in.',
    ash: 'A zircon from the ash bed. Tap or sweep atoms to test them.',
    ashGo: 'Tap Date it when you have tested enough atoms.',
    askA2: 'Drag the age of this ash on your decay curve.',
    lab: 'A lab counts millions of atoms. Compare its age with yours.',
    free: 'Tap each ash bed with the hammer to free its zircon.',
    laser: 'Sweep the laser over spots. Each spot counts 40 atoms.',
    askB1: 'Drag the error bar you would get from four times as many atoms.',
    bracket: 'Lower beds are older. The fish lies between the two ash dates.',
    pick: 'Tap an outcrop to dig there this season.',
    askP1: 'Finned fish at 385 Myr, four legs at 365. When did in-between forms live?',
    brush: 'Brush the square to clear the sand.',
    place: 'Drag the card onto the ribbon: {name}, {age}.',
    askD1: 'Earth is 4.54 billion years old. Drag the halfway point of its history.',
    bush: 'Placed in order they look like a ladder. Their spans make a bush.',
    gap: 'A new epoch.',
    over: 'Done.'
  },
  whispers: {
    drag: 'Drag the line first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No prediction this time.',
    dry: 'Out of mud for this epoch.', still: 'Still water: soft bodies may keep.', eroded: 'Waves tore out a layer.',
    soft: 'Soft body buried in still mud!', more: 'Test at least 16 atoms first.', empty: 'Only sand this season.',
    budget: 'The laser budget is spent.', both: 'Date both zircons first.', found: 'An in-between form!', placed: 'Placed.'
  },
  labels: {
    lock: 'Lock in', settle: 'Settle', date: 'Date it', test8: 'Test 8', up8: 'Upper ×8', lo8: 'Lower ×8', done: 'Done', chip: 'Chip out',
    brush: 'Brush', mud: 'mud', still: 'still water', epoch: 'Epoch {n}', myr: '{n} Myr', gyr: '{n} Gyr', kyr: '{n} kyr', yr: '{n} yr',
    left: '{n} left', upper: 'upper ash', lower: 'lower ash', fish: 'fossil fish', lobe: 'finned fish', tetra: 'four legs', sea: 'sea rock',
    river: 'river rock', season: 'Season {n}', you: 'you', truth: 'true age', ff: 'Tap: faster', now: 'now', earth: 'Earth forms',
    wood: 'your Wood', spots: '{n} spots', atoms: '{n} atoms', kept: 'kept', lived: 'lived', buried: 'buried', U: 'uranium', Pb: 'lead',
    plus: '+{n}', zircon: 'zircon', kShell: 'keeps ½', kBone: 'keeps ⅓', kSoft: 'rarely keeps', kSoftS: 'keeps 2/5', kStill: 'keeps 3/5', hammer: 'tap here', gone: 'gone', ladder: 'ladder?', bush: 'a bush'
  },
  cards: {
    zircon: ['Oldest zircon', '4.4 billion years'], trilo: ['First trilobites', '521 million years'], tik: ['Tiktaalik', '375 million years'],
    impact: ['Dinosaur-ending impact', '66 million years'], whale: ['Whale with ankles', '47 million years'], lucy: ['Lucy', '3.2 million years'],
    irhoud: ['Early Homo sapiens', '315 thousand years'], naledi: ['Homo naledi', '236–335 thousand years']
  },
  cardShort: { zircon: 'zircon', trilo: 'trilobite', tik: 'Tiktaalik', impact: 'impact', whale: 'walking whale', lucy: 'Lucy', irhoud: 'H. sapiens', naledi: 'H. naledi' },
  finds: { fishapod: 'in-between', lobe: 'finned fish', tetra: 'limb bone', scales: 'scraps', brach: 'sea shells', plant: 'plant' },
  hominins: { afar: 'Lucy’s species', erectus: 'H. erectus', nean: 'Neanderthals', naledi: 'H. naledi', sap: 'H. sapiens', flores: 'H. floresiensis' },
  interesting: {
    lost: 'Waves tore out your still-water layer. Its soft bodies are gone from the record: a gap, not an absence.',
    nosoft: 'No soft-bodied animal was buried in the still water, so worms and jellies left no trace at all.',
    few: 'Most animals rotted unburied. Bodies left on the sea floor almost never keep.',
    lucky: 'Your kept share beat its expectation: chance in fossilisation and erosion, not skill.',
    clump: 'At one half-life your crystal held well away from 32 atoms. Each atom decays at random; only the average is steady.',
    rough: 'Few atoms tested, so the age you read carries a wide error bar.',
    lopsided: 'One zircon got most of the laser. The other date stayed loose, and so did the bracket.',
    flip: 'Your upper ash dated older than the lower one. The beds keep their order; the dates were noisy.',
    wrongrock: 'You dug where in-between forms could not be: wrong age, or sea rock for a river animal.',
    unlucky: 'You dug the right rock, but the record kept nothing there this time. Gaps are normal.',
    ladder: 'Several cards landed far from their age. On a log ribbon each step left is ten times older.',
    middle: 'The middle of the ribbon is only about 200,000 years ago. Half of Earth’s history sits at the far left.'
  },
  live: {
    bury: '{k} buried.', epoch: 'Epoch {n} of 6. Mud {m} seconds.', decay: '{n} atoms left at {t} million years.',
    spot: '{z}: {n} atoms counted, age {t} plus or minus {e}.', find: 'Season {n}: {f}.', ask: 'Prediction open. Press P, then the arrows.',
    placed: '{c} placed at {t}.'
  },
  data: {
    buried: ['Animals buried', '{a} of {b}', 'Soft-bodied in still water: {s}.'], keep: ['Keep chances', 'shell ½, bone ⅓, soft rare', 'Still water: soft 2 in 5. Waves remove 1 layer in 4.'], kept: ['Kept as fossils', '{a} of {b}', 'After erosion.'],
    left: ['Uranium left', '{n} of 64', 'At {t} million years.'], tested: ['Atoms tested', '{n}', '{u} uranium, {p} lead.'],
    est: ['Ash age', '{t} ± {e} Myr', 'Two standard errors, from your atoms.'], zup: ['Upper ash', '{t} ± {e} Myr', '{n} atoms counted.'],
    zlo: ['Lower ash', '{t} ± {e} Myr', '{n} atoms counted.'], spots: ['Laser spots', '{a} of {b}', 'Spent.'],
    seasons: ['Seasons dug', '{a} of 5', 'In-between finds: {f}.'], placed: ['Cards placed', '{a} of 8', 'Within half a step: {b}.'],
    titles: { share: 'Share of animals', epochs: 'Each epoch', decay: 'Uranium left', ages: 'Ages from atoms', err: 'Error bar', fossils: 'Fossil ages', earth: 'Earth’s history', bush: 'Human relatives' },
    ax: { share: 'share', epoch: 'epoch', n: 'animals', myr: 'Myr', atoms: 'atoms counted', err: '± Myr', left: 'atoms', age: 'age, Myr', log: 'years ago', mya: 'Myr ago' },
    lines: { buried: 'buried', kept: 'kept', expected: 'expected', you: 'you', curve: 'decay law', yours: 'your atoms', ash: 'your ash', lab: 'lab age',
      bracket: 'fish', law: '1/√n', half: 'halfway', truth: 'true ages', lived: 'lived', placed: 'yours' }
  },
  levers: { still: 'All still water', noerode: 'No erosion' },
  take: 'Rocks keep a gappy sample and decay sets the clock. Ordered fossils make a bush, not a ladder.',
  body: 'You placed {a} of 8 fossils within half a step of their age. Half of Earth’s history lies before 2.27 billion years ago. Around 300,000 years ago at least four human relatives lived at once.',
  whatifBody: {
    still: 'The same burials, with every epoch still and oxygen-free. The rock kept {k} of 48 animals, {s} of them soft-bodied; on average it keeps {e}.',
    noerode: 'The same burials, with no layer lost to the waves. The rock kept {k} of 48 animals; on average it keeps {e}. With erosion it kept {m}.'
  },
  law: { title: 'Gappy, dated, branching' },
  boss: { inverts: 'Fossils in order are no ladder: several human relatives lived at once.' },
  stars: {
    discover: 'Make a Lagerstätte, and dig where an in-between form should lie.',
    predict: 'Land three predictions: kept share, decay, error bar, in-between age, halfway point.',
    transfer: 'Place seven of eight fossils within half a step on the deep-time ribbon.'
  },
  levelStars: [
    { discover: 'Bury two soft bodies in still water, and 16 animals in all.', predict: 'Predict the share the rock keeps.' },
    { predict: 'Land both the quarter-left time and the ash age.' },
    { discover: 'Spend the laser well: both dates tight enough.', predict: 'Predict the error bar from four times the atoms.' },
    { discover: 'Dig two seasons where an in-between form should lie.', predict: 'Predict the age of in-between forms.' },
    { transfer: 'Place seven of eight fossils within half a step.', predict: 'Drag the halfway point of Earth’s history.' }
  ],
  levelTake: [
    'Hard parts buried fast keep far more often. Erosion tears out whole layers, so a gap is not an absence.',
    'Each atom decays at random, but half of a large crowd goes in one half-life. That average is the clock.',
    'Error bars shrink with the square root of atoms counted. Superposition orders the beds; dates bracket the fossil.',
    'Evolution predicts which rocks to search. Finding the in-between form in the predicted rock tests that prediction.'
  ],
  levelBody: [
    'You buried {b} of 48 animals. The rock kept {k}; on average it keeps {e}. {s} soft-bodied animals were buried in still water.',
    'At one half-life {h} of 64 atoms were left; chance spreads the count. Your ash read {t} ± {e} Myr; the lab says {l} Myr.',
    'Upper ash {u} ± {eu} Myr, lower ash {w} ± {el} Myr. Four times the atoms halves an error bar. The fish lived about {f} Myr ago.',
    'Seasons in 375-Myr river rock: {n}. In-between finds: {f}. Tiktaalik was found this way, after four field seasons.'
  ],
  model: [
    { level: 0, simulated: 'Six epochs of a Devonian sea floor, eight animals each. Mud you pour buries animals; each kind then keeps with a set chance.',
      simplification: 'Burial is all or nothing. Three tissue types stand for hardness. Each layer survives erosion with a fixed chance.',
      params: [{ name: 'chance a buried shell keeps', value: '50%, 60% still', tag: 'xN', real: 'far lower for nearly every body' }, { name: 'soft body kept', value: '2%, 40% still', tag: 'xN', real: 'rarer still' }, { name: 'layer survives erosion', value: '75%', tag: 'designed' }, { name: 'epochs', value: 6, tag: 'designed' }],
      cannot: 'Scavengers, transport of shells, mineral replacement or later heating of the rock.',
      nature: 'Experiments on carcasses show soft tissue rots in days to weeks. Lagerstätten such as the Hunsrück Slate keep it where burial was fast and oxygen scarce.',
      contested: false, refs: ['briggs2003', 'seilacher1985', 'bartels1998'] },
    { level: 1, simulated: 'Each uranium-235 atom has the same small chance to decay in each moment, whatever its age.',
      simplification: 'One decay goes straight to lead; the real chain passes through short-lived steps. The crystal held no lead at first.',
      params: [{ name: 'U-235 half-life', value: '704 Myr', tag: 'realistic' }, { name: 'atoms in a crystal', value: 64, tag: 'xN', real: 'billions' }, { name: 'clock speed', value: 'up to 330 Myr a second', tag: 'designed' }],
      cannot: 'Lead loss from damaged crystals, or the second clock, uranium-238.',
      nature: 'Zircon takes in uranium but almost no lead as it crystallises. Its lead today grew from decay, so lead over uranium dates it.',
      contested: false, refs: ['jaffey1971', 'schoene2014'] },
    { level: 2, simulated: 'Two ash beds above and below a fossil fish. Each laser spot counts 40 atoms, drawn at random.',
      simplification: 'Spots are independent samples of one age. The error bar is two standard errors from counting alone.',
      params: [{ name: 'atoms a spot', value: 40, tag: 'xN', real: 'millions' }, { name: 'spot budget', value: 70, tag: 'designed' }, { name: 'gap between beds', value: '45–70 Myr', tag: 'designed' }],
      cannot: 'Crystals reworked from older rock, or calibration error between labs.',
      nature: 'Steno argued in 1669 that lower layers are older. Modern zircon dates of ash beds reach a precision near 0.1%.',
      contested: false, refs: ['steno1669', 'schoene2014'] },
    { level: 3, simulated: 'Nine outcrops of known age and setting. A season in the right rock finds an in-between form half the time.',
      simplification: 'Finds come in one season or not at all. Ages are rounded to 10 Myr.',
      params: [{ name: 'find chance a season', value: '50%', tag: 'xN', real: 'much lower' }, { name: 'seasons', value: 5, tag: 'realistic' }, { name: 'rock ages', value: '345–405 Myr', tag: 'realistic' }],
      cannot: 'How hard real outcrops are to reach, or fossils weathered out before you arrive.',
      nature: 'Shubin, Daeschler and Jenkins searched 375-Myr river rocks on Ellesmere Island. Tiktaalik turned up in 2004, after four seasons.',
      contested: false, refs: ['daeschler2006', 'shubin2006'] },
    { level: 4, simulated: 'A log ribbon from Earth’s formation to now. Each card is a dated fossil or event.',
      simplification: 'Each fossil has one age; real ages carry error bars and species have spans.',
      params: [{ name: 'Earth’s age', value: '4.54 Gyr', tag: 'realistic' }, { name: 'hominin spans', value: 'from first to last fossil', tag: 'realistic' }],
      cannot: 'Who descends from whom. Spans that overlap say who lived at once, not ancestry.',
      nature: 'Homo naledi, dated to 335–236 thousand years, lived when early Homo sapiens lived in Morocco.',
      contested: false, refs: ['dalrymple2001', 'dirks2017', 'hublin2017', 'gingerich2001'] }
  ],
  why: {
    real: ['Clair Patterson dated meteorites by uranium and lead in 1956, giving Earth about 4.55 billion years. The oldest known crystal, a zircon from Western Australia, is 4.4 billion years old.',
      'Homo naledi was dated by several methods to 335–236 thousand years. Fossils from Jebel Irhoud, Morocco, put early Homo sapiens near 315 thousand.'],
    maths: ['On a log ribbon each equal step is ten times older. Half a step is a factor of about 3.2. Half of 4.54 billion years is 2.27 billion: near the left end.']
  },
  levelWhy: [
    { real: ['Most bodies are eaten or rot before burial. Shells and bones last longer, so they dominate the record. Rare still, oxygen-poor basins kept worms and jellies.'],
      maths: ['Add up every animal’s chance of keeping, buried or not. Multiply by 0.75, the chance its layer survives. Divide by 48.'] },
    { real: ['Uranium-235 has a half-life of 704 million years, measured by counting decays in pure uranium. A single atom’s moment of decay cannot be predicted.'],
      maths: ['After time t a share 2 to the power of minus t over 704 is left. With u uranium of n atoms, age = 704 × log₂(n ÷ u).'] },
    { real: ['Volcanic ash falls in a day and holds fresh zircons, so ash beds are time stamps. A fossil between two dated beds is bracketed.'],
      maths: ['The share of lead counted has a standard error √(f(1 − f) ÷ n). The age error scales the same way, so four times the atoms halves it.'] },
    { real: ['Finned fish such as Panderichthys come from rocks near 385 Myr and early tetrapods from near 365 Myr. Tiktaalik, from 375-Myr river rock, has fins with wrist bones.'],
      maths: ['An in-between form should come from between the two: halfway is 375 Myr. River rock, because the earliest limbed animals lived in shallow fresh water.'] }
  ]
};

/* ---------- constants (sim side) ---------- */
const DG_K = { dt: 1 / 30, half: 704, LN2: 0.6931471805599453, LN10: 2.302585092994046,
  E: 6, mud: 1.6, epochT: 15, r: 0.1, cover: 0.35, bury: 0.32, dryT: 0.8, gapT: 1.1, upT: 2.4, revT: 2.6, askMax: 30, survive: 0.75,
  N1: 64, slow: 55, fast: 330, endA: 2112, q: 16, ashT: 30, minAssay: 16, labT: 2.6,
  spots: 64, m: 40, budget: 70, minSpots: 5, laserT: 60, b1At: 400, freeT: 12, err2: 82,
  seasons: 5, brushIdle: 0.07, pickT: 30,
  cardT: 40, bushT: 3.6, earth: 9.657, lo: 1 };
const DG_TIS = { ammonoid: 'shell', brach: 'shell', trilo: 'shell', fish: 'bone', worm: 'soft', jelly: 'soft' };
const DG_PF = { shell: [0.5, 0.6, 0.04, 0.1], bone: [0.35, 0.55, 0.02, 0.08], soft: [0.02, 0.4, 0, 0.01] };   // [buried, buried still, exposed, exposed still]
const DG_MIX = ['ammonoid', 'brach', 'brach', 'trilo', 'fish', 'worm', 'worm', 'jelly'];
const DG_CROPS = [[375, 'river'], [375, 'river'], [385, 'river'], [365, 'river'], [375, 'sea'], [395, 'sea'], [355, 'river'], [405, 'river'], [345, 'sea']];
const DG_CARDS = [{ id: 'zircon', t: 4.4e9 }, { id: 'trilo', t: 5.21e8 }, { id: 'tik', t: 3.75e8 }, { id: 'impact', t: 6.6e7 }, { id: 'whale', t: 4.7e7 }, { id: 'lucy', t: 3.2e6 }, { id: 'irhoud', t: 3.15e5 }, { id: 'naledi', t: 2.81e5 }];
const DG_HOM = [['afar', 3.9e6, 2.9e6], ['erectus', 1.9e6, 1.1e5], ['nean', 4.3e5, 4e4], ['naledi', 3.35e5, 2.36e5], ['sap', 3.15e5, 0], ['flores', 1e5, 5e4]];   // spans in years ago (refs in the log)
/* the palette (D6 addendum 7): chalk white, ochre sandstone, slate shale, ammonite rust, a pale ash bed, golden-hour sky */
const DG_C = { chalk: '#F1ECDF', chalk2: '#D9D0BC', ochre: '#C9974A', ochreD: '#94682E', slate: '#56606C', slateD: '#363D47', rust: '#A4532F', ash: '#DCD7CC', ink: '#1E1A16',
  sky0: '#F3C98C', sky1: '#E59A62', sea: '#46606A', seaD: '#2E434C', gold: '#F6D79A', paper: '#EFE3C6', paperD: '#D8C59C' };
const dgLog10 = x => Det.log(x) / DG_K.LN10;
const dgYears = v => { let p = 1; const e = Math.floor(v); for (let i = 0; i < e; i++) p *= 10; return p * Det.exp((v - e) * DG_K.LN10); };

const CH_DIG_V2 = {
  id: 'dig', v2: true, role: 'investigator', place: 'cliff',
  accent: '#9C4A2C',   // ammonite rust: the chapter's chrome tint and intro card (D6 addendum 7)
  intro: { goal: 'Read a sea cliff: how rock keeps life, and how ash tells time.' },
  content: DG_TEXT,
  P: {
    survive: { v: 0.75, tag: 'designed', min: 0, max: 1, label: 'layer survives erosion' },
    half: { v: 704, tag: 'realistic', min: 704, max: 704, label: 'U-235 half-life (Myr)' },
    m: { v: 40, tag: 'xN', min: 1, max: 1000, real: 'millions', label: 'atoms a spot' },
    find: { v: 0.5, tag: 'xN', min: 0.05, max: 1, real: 'much lower', label: 'find chance a season' }
  },
  levels: [
    { name: 'The flood', adds: 'burial', codes: ['D1'], minutes: 3 },
    { name: 'The clock', adds: 'radioactive decay', codes: ['D2'], minutes: 3 },
    { name: 'Bracket the fish', adds: 'atoms counted', codes: ['D3'], minutes: 3 },
    { name: 'Where to dig', adds: 'a predicted in-between form', codes: ['D4'], minutes: 3 },
    { name: 'Deep time', adds: 'a log time scale', codes: ['D5'], minutes: 3 }
  ],
  keys: { Space: 'pour, run or brush', ArrowLeft: 'move the mud', ArrowRight: 'move the mud', Enter: 'settle or date', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why do shells and bones dominate the fossil record?', 'How does counting more atoms change an age, and why only by a square root?', 'Why is a gap in the fossil record not evidence against evolution?'], pool: 'trace' },
  starTraits: ['tissue'],
  encodings: [   // tissue by silhouette and outline; atoms by fill (solid uranium, hollow lead); no hue carries a score
    { k: 'tissue', rgb: [201, 151, 74], channels: ['shape', 'pattern'] },
    { k: 'uranium', rgb: [164, 83, 47], channels: ['shape', 'luminance'] }, { k: 'lead', rgb: [86, 96, 108], channels: ['pattern', 'luminance'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: DG_K.dt, s: null,
    reset(level, o) {
      o = o || {}; const n = Math.max(0, Math.min(4, level | 0));
      if (o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.lever(o.thaw.lever); return; }
      this.s = { level: n, kind: ['flood', 'clock', 'bracket', 'map', 'ribbon'][n], phase: 'run', t: 0, unt: false, whatif: null,
        asks: [], pred: {}, exp: {}, tol: {}, alt: {}, hits: {}, ask: null, resume: null, log: [] };
      const s = this.s;
      if (n === 0) { s.anox = 2 + Math.floor(R() * 3); s.e = 0; s.layers = []; s.pid = 0; this.epoch(s, []); }
      else if (n === 1) { s.at = new Array(DG_K.N1).fill(1); s.n = DG_K.N1; s.T = 0; s.hold = false; s.tr = [[0, DG_K.N1]]; s.phase = 'run'; }
      else if (n === 2) {
        const tLo = 400 + 40 * R(), gap = 45 + 25 * R(), tUp = tLo - gap;
        s.fish = Math.round((tUp + gap * (0.3 + 0.4 * R())) * 10) / 10;
        s.z = [tUp, tLo].map(t => ({ t: Math.round(t * 10) / 10, pU: Det.exp(-DG_K.LN2 * t / DG_K.half), sp: new Array(DG_K.spots).fill(-1), n: 0, u: 0, k: 0, chip: false, hist: [] }));
        s.used = 0; s.phase = 'free';
      } else if (n === 3) {
        const crops = DG_CROPS.map(c => c.slice()); shuffle(crops);
        s.crops = crops.map((c, i) => ({ age: c[0], env: c[1], x: (i % 3 + 0.2 + 0.6 * R()) / 3, y: (Math.floor(i / 3) + 0.25 + 0.5 * R()) / 3 }));
        s.season = 0; s.digs = []; s.br = 0; s.site = -1; s.phase = 'pick';
      } else {
        s.order = shuffle(DG_CARDS.map(c => c.id)); s.ci = 0; s.pl = {}; s.err = {}; s.wood = 12; s.phase = 'place';
      }
    },
    /* ---------- L0 the flood: a sea floor per epoch, mud that buries, still water, uplift and erosion ---------- */
    epoch(s, ev) {
      s.an = DG_MIX.map(k => {
        const x = 0.06 + 0.88 * R(), dir = R() < 0.5 ? -1 : 1, ph = 6.283 * R();
        const v = { ammonoid: 0.09, brach: 0, trilo: 0.04, fish: 0.16, worm: 0.02, jelly: 0.03 }[k];
        return { id: ++s.pid, k, x, y: 0, vx: dir * v, ph, c: 0, b: 0 };
      });
      this.moveAn(s, 0); s.mud = DG_K.mud; s.pour = null; s.slug = 0; s.et = 0; s.dry = 0; s.phase = 'epoch'; s.t = 0;
      ev.push({ k: 'epoch', e: s.e, still: s.e === s.anox });
    },
    moveAn(s, dt) {
      for (const a of s.an) {
        if (a.b) continue; a.x += a.vx * dt; if (a.x < 0.04) a.vx = Math.abs(a.vx); if (a.x > 0.96) a.vx = -Math.abs(a.vx);
        a.ph += dt;
        if (a.k === 'ammonoid') a.y = 0.36 + 0.26 * Det.sin(a.ph * 0.6);
        else if (a.k === 'fish') a.y = 0.48 + 0.36 * Det.sin(a.ph * 0.8);
        else if (a.k === 'jelly') a.y = 0.32 + 0.24 * Det.sin(a.ph * 0.45);
        else a.y = 0;
      }
    },
    floodStep(s, ev) {
      const K = DG_K, dt = this.dt; s.et += dt; this.moveAn(s, dt);
      const px = s.pour != null ? s.pour : null;
      if (px != null && s.mud > 0) {
        s.mud = Math.max(0, s.mud - dt);
        for (const a of s.an) {
          if (a.b) continue;
          if (Math.abs(a.x - px) < K.r && a.y < K.bury) { a.c += dt; if (a.c >= K.cover - 1e-9) { a.b = 1; a.y = 0; ev.push({ k: 'bury', id: a.id, kind: a.k, x: a.x, still: s.e === s.anox }); } }
          else a.c = Math.max(0, a.c - dt * 0.5);
        }
        if (s.slug > 0) { s.slug--; if (s.slug === 0) s.pour = null; }
        if (s.mud <= 0) { s.pour = null; ev.push({ k: 'dry' }); }
      } else for (const a of s.an) if (!a.b) a.c = Math.max(0, a.c - dt * 0.5);
      if (s.mud <= 0) s.dry += dt;
      if ((s.mud <= 0 && s.dry >= K.dryT) || (!s.unt && s.et >= K.epochT)) this.endEpoch(s, ev);
    },
    endEpoch(s, ev) {
      s.layers.push({ still: s.e === s.anox ? 1 : 0, mud: Math.round((DG_K.mud - s.mud) * 100) / 100, a: s.an.map(a => ({ k: a.k, b: a.b, x: Math.round(a.x * 1000) / 1000 })) });
      s.pour = null; ev.push({ k: 'layer', e: s.e });
      if (s.e + 1 < DG_K.E) { s.e++; s.phase = 'gap'; s.t = 0; return; }
      const ex = this.keptExp(s), bur = this.buried(s) / (DG_K.E * 8);
      this.openAsk(s, ev, 'k1', 0, 0.6, 0.035, 0.6, ex, 'uplift', Math.abs(bur - ex) > 0.1 ? [bur] : null);
    },
    pf(k, b, still) { const p = DG_PF[DG_TIS[k]]; return b ? p[still ? 1 : 0] : p[still ? 3 : 2]; },
    keptExp(s, o) {   // expected share kept: Σ over animals of each one's keeping chance × its layer's chance of surviving, ÷ 48
      o = o || {}; const sv = o.noerode ? 1 : this.surv(); let e = 0;
      for (const L of s.layers) for (const a of L.a) e += this.pf(a.k, a.b, o.still ? 1 : L.still) * sv;
      return e / (DG_K.E * 8);
    },
    surv() { const P = CH_DIG_V2.P; return P && P.survive ? P.survive.v : DG_K.survive; },
    buried(s) { let n = 0; for (const L of s.layers) for (const a of L.a) n += a.b; return n; },
    softStill(s) { let n = 0; for (const L of s.layers) if (L.still) for (const a of L.a) if (a.b && DG_TIS[a.k] === 'soft') n++; return n; },
    uplift(s, ev, o) {   // erosion first (one draw a layer), then each animal's keeping (one draw each), in layer order
      o = o || {}; const sv = o.noerode ? 1 : this.surv();
      for (const L of s.layers) L.gone = R() < sv ? 0 : 1;
      let k = 0, ks = 0;
      for (const L of s.layers) for (const a of L.a) { a.f = R() < this.pf(a.k, a.b, o.still ? 1 : L.still) ? 1 : 0; if (a.f && !L.gone) { k++; if (DG_TIS[a.k] === 'soft') ks++; } }
      s.kept = k; s.keptSoft = ks; s.phase = 'uplift'; s.t = 0; ev.push({ k: 'uplift', kept: k });
    },
    /* ---------- L1 the clock: each atom decays with the same chance per moment; then an ash zircon to date ---------- */
    clockStep(s, ev) {
      const K = DG_K, dt = this.dt;
      if (s.phase === 'run') {
        let dT = (s.hold ? K.fast : K.slow) * dt;
        const a1 = s.asks.indexOf('a1') >= 0; if (!a1 && s.T + dT > K.half) dT = K.half - s.T;
        const p = 1 - Det.exp(-K.LN2 / K.half * dT), T0 = s.T;
        for (let i = 0; i < s.at.length; i++) if (s.at[i] && R() < p) { s.at[i] = 0; s.n--; const tt = Math.round((T0 + dT * R()) * 10) / 10; s.tr.push([tt, s.n]); ev.push({ k: 'decay', i, n: s.n, T: tt }); }
        s.T = Math.round((s.T + dT) * 1e6) / 1e6;
        if (!a1 && s.T >= K.half - 1e-9) { s.h = s.n; if (s.n >= 22) { this.openAsk(s, ev, 'a1', 0, 2400, 150, 2400, K.half + K.half * Det.log(s.n / K.q) / K.LN2, 'run', [K.half + K.half * (s.n - K.q) / (DG_K.N1 - s.n)]); } else s.asks.push('a1'); return; }
        if (s.T >= K.endA - 1e-9) this.ashStart(s, ev);
        return;
      }
      if (s.phase === 'ash') { if (!s.unt && s.t >= K.ashT) { while (s.ns < K.minAssay) this.assay8(s, ev); this.date(s, ev); } return; }
      if (s.phase === 'lab' && s.t >= K.labT) { s.phase = 'over'; ev.push({ k: 'over' }); }
    },
    ashStart(s, ev) {
      s.tA = Math.round((300 + 300 * R()) * 10) / 10; const pU = Det.exp(-DG_K.LN2 * s.tA / DG_K.half);
      s.az = []; for (let i = 0; i < DG_K.N1; i++) s.az.push(R() < pU ? 1 : 0);
      s.seen = new Array(DG_K.N1).fill(0); s.ns = 0; s.nu = 0; s.phase = 'ash'; s.t = 0; ev.push({ k: 'ash' });
    },
    assay(s, ev, i) { if (s.phase !== 'ash' || i < 0 || i >= DG_K.N1 || s.seen[i]) return; s.seen[i] = 1; s.ns++; s.nu += s.az[i]; ev.push({ k: 'assay', i, u: s.az[i], n: s.ns }); },
    assay8(s, ev) { let c = 0; for (let i = 0; i < DG_K.N1 && c < 8; i++) if (!s.seen[i]) { this.assay(s, ev, i); c++; } },
    ashEst(s) { const n = s.ns, u = Math.max(0.5, s.nu); return Math.min(2400, DG_K.half * Det.log(n / u) / DG_K.LN2); },
    ashErr(s) { const n = s.ns, f = Math.max(0.01, Math.min(0.99, 1 - s.nu / Math.max(1, n))); return 2 * DG_K.half / DG_K.LN2 * Math.sqrt(f / ((1 - f) * Math.max(1, n))); },
    date(s, ev) {
      if (s.phase !== 'ash') return; if (s.ns < DG_K.minAssay) { ev.push({ k: 'more' }); return; }
      const e = this.ashEst(s), tol = Math.max(50, 0.12 * e), lin = 2 * DG_K.half * (1 - s.nu / s.ns);
      this.openAsk(s, ev, 'a2', 0, 2400, tol, 2400, e, 'lab', Math.abs(lin - e) > 2 * tol ? [lin] : null);
    },
    /* ---------- L2 bracket: two zircons, spots of 40 atoms, a laser budget; error bars shrink as 1/√n ---------- */
    zEst(z) { if (!z.n) return null; const f = Math.max(0.002, Math.min(0.998, 1 - z.u / z.n)); return { t: DG_K.half * Det.log(1 / (1 - f)) / DG_K.LN2, e: 2 * DG_K.half / DG_K.LN2 * Math.sqrt(f / ((1 - f) * z.n)) }; },
    zTrueErr(z, n) { const f = 1 - z.pU; return 2 * DG_K.half / DG_K.LN2 * Math.sqrt(f / ((1 - f) * Math.max(1, n))); },
    mSpot() { const P = CH_DIG_V2.P; return P && P.m ? P.m.v | 0 : DG_K.m; },
    spot(s, ev, zi, i) {
      const z = s.z[zi]; if (s.phase !== 'assay' || !z || !z.chip || i < 0 || i >= DG_K.spots || z.sp[i] >= 0) return;
      if (s.used >= DG_K.budget) { ev.push({ k: 'budget' }); return; }
      const m = this.mSpot(), u = WF.binom(m, z.pU); z.sp[i] = u; z.n += m; z.u += u; z.k++; s.used++;
      const E = this.zEst(z); z.hist.push([z.n, Math.round(E.e * 10) / 10]);
      ev.push({ k: 'spot', z: zi, i, u, n: z.n });
      if (s.asks.indexOf('b1') < 0 && z.n >= DG_K.b1At) { const e = E.e; s.b1z = zi; s.b1e = Math.round(e * 10) / 10; this.openAsk(s, ev, 'b1', 0, Math.ceil(e * 2), 0.15 * e, 0, e / 2, 'assay', [e / 4, e]); return; }
      if (s.used >= DG_K.budget) { ev.push({ k: 'budget' }); this.endAssay(s, ev); }
    },
    laser8(s, ev, zi) { const z = s.z[zi]; let c = 0; for (let i = 0; i < DG_K.spots && c < 8 && s.phase === 'assay'; i++) if (z.sp[i] < 0) { this.spot(s, ev, zi, i); c++; } },
    endAssay(s, ev) {
      if (s.phase !== 'assay') return;
      for (let zi = 0; zi < 2; zi++) { const z = s.z[zi]; for (let i = 0; i < DG_K.spots && z.k < DG_K.minSpots; i++) if (z.sp[i] < 0) { const m = this.mSpot(), u = WF.binom(m, z.pU); z.sp[i] = u; z.n += m; z.u += u; z.k++; } }
      s.phase = 'bracket'; s.t = 0; ev.push({ k: 'bracket' });
    },
    bracketStep(s, ev) {
      const K = DG_K;
      if (s.phase === 'free') { if (!s.unt && s.t >= K.freeT) { for (let zi = 0; zi < 2; zi++) if (!s.z[zi].chip) this.chip(s, ev, zi); } return; }
      if (s.phase === 'assay') { s.lt = (s.lt || 0) + this.dt; if (!s.unt && s.lt >= K.laserT) this.endAssay(s, ev); return; }
      if (s.phase === 'bracket' && s.t >= K.labT) { s.phase = 'over'; ev.push({ k: 'over' }); }
    },
    chip(s, ev, zi) { const z = s.z[zi]; if (s.phase !== 'free' || !z || z.chip) return; z.chip = true; ev.push({ k: 'chip', z: zi }); if (s.z[0].chip && s.z[1].chip) { s.phase = 'assay'; s.t = 0; s.lt = 0; } },
    /* ---------- L3 where to dig: a field map, five seasons, finds drawn when you choose the site ---------- */
    findP() { const P = CH_DIG_V2.P; return P && P.find ? P.find.v : 0.5; },
    dig(s, ev, o) {
      const c = s.crops[o]; if (s.phase !== 'pick' || !c) return;
      const p = this.findP(), r = R(); let f = 'scales';
      if (c.env === 'sea') f = r < 0.7 ? 'brach' : 'scales';
      else if (c.age === 375) f = r < p ? 'fishapod' : 'scales';
      else if (c.age === 385) f = r < 0.6 ? 'lobe' : 'scales';
      else if (c.age === 365) f = r < 0.6 ? 'tetra' : 'scales';
      else f = r < 0.6 ? 'plant' : 'scales';
      s.site = o; s.br = 0; s.digs.push({ o, age: c.age, env: c.env, f }); s.phase = 'brush'; s.t = 0; ev.push({ k: 'dig', o, season: s.season });
    },
    brush(s, ev, a) { if (s.phase !== 'brush') return; s.br = Math.min(1, s.br + Math.max(0, Math.min(0.2, +a || 0))); if (s.br >= 1) this.found(s, ev); },
    found(s, ev) { const d = s.digs[s.digs.length - 1]; s.phase = 'gap'; s.t = 0; ev.push({ k: 'find', f: d.f, season: s.season }); },
    mapStep(s, ev) {
      const K = DG_K;
      if (s.phase === 'pick') { if (!s.unt && s.t >= K.pickT) this.dig(s, ev, 0); return; }
      if (s.phase === 'brush') { s.br = Math.min(1, s.br + K.brushIdle * this.dt); if (s.br >= 1) this.found(s, ev); return; }
      if (s.phase === 'gap' && s.t >= 1.6) {
        s.season++; if (s.season >= K.seasons) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
        if (s.season === 1 && s.asks.indexOf('p1') < 0) { this.openAsk(s, ev, 'p1', 340, 420, 4, 340, 375, 'pick', [385, 365]); return; }
        s.phase = 'pick'; s.t = 0; ev.push({ k: 'season', n: s.season });
      }
    },
    fishapods(s) { return s.digs.filter(d => d.f === 'fishapod').length; },
    rightDigs(s) { return s.digs.filter(d => d.age === 375 && d.env === 'river').length; },
    /* ---------- L4 deep time: cards onto a log ribbon; then the halfway point; then the bush ---------- */
    card(id) { return DG_CARDS.find(c => c.id === id); },
    place(s, ev, id, v) {
      if (s.phase !== 'place' || s.order[s.ci] !== id) return;
      const c = this.card(id), tv = dgLog10(c.t);
      if (v == null || !isFinite(+v)) { s.pl[id] = null; s.err[id] = 99; }
      else { v = Math.max(DG_K.lo, Math.min(DG_K.earth, +v)); s.pl[id] = Math.round(v * 1000) / 1000; s.err[id] = Math.round(Math.abs(v - tv) * 1000) / 1000; }
      ev.push({ k: 'placed', id, v: s.pl[id], err: s.err[id], tv });
      s.ci++; s.t = 0;
      if (s.ci >= s.order.length) this.openAsk(s, ev, 'd1', DG_K.lo, DG_K.earth, 0.12, DG_K.lo, dgLog10(2.27e9), 'bush', [(DG_K.lo + DG_K.earth) / 2]);
    },
    goodCards(s) { return s.order.filter(id => s.err[id] != null && s.err[id] <= 0.5).length; },
    ribbonStep(s, ev) {
      if (s.phase === 'place') { if (!s.unt && s.t >= DG_K.cardT) this.place(s, ev, s.order[s.ci], null); return; }
      if (s.phase === 'bush' && s.t >= DG_K.bushT) { s.phase = 'over'; ev.push({ k: 'over' }); }
    },
    /* ---------- the step ---------- */
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt;
      if (s.phase === 'ask') { if (!s.unt && s.t >= DG_K.askMax) this.commit(s, ev, s.ask.id, null); return ev; }
      const n = s.level;
      if (n === 0) {
        if (s.phase === 'epoch') this.floodStep(s, ev);
        else if (s.phase === 'gap') { if (s.t >= DG_K.gapT) this.epoch(s, ev); }
        else if (s.phase === 'uplift') { if (s.t >= DG_K.upT) { s.phase = 'reveal'; s.t = 0; ev.push({ k: 'reveal' }); } }
        else if (s.phase === 'reveal' && s.t >= DG_K.revT) { s.phase = 'over'; ev.push({ k: 'over' }); }
      } else if (n === 1) this.clockStep(s, ev);
      else if (n === 2) this.bracketStep(s, ev);
      else if (n === 3) this.mapStep(s, ev);
      else this.ribbonStep(s, ev);
      return ev;
    },
    /* ---------- predictions: the sim opens the ask; the expectation is the model's, never the realised luck ---------- */
    openAsk(s, ev, id, lo, hi, tol, start, expect, resume, alt) {
      s.ask = { id, kind: id === 'b1' ? 'y' : 'x', lo, hi, tol, start }; s.exp[id] = expect; s.tol[id] = tol; if (alt) s.alt[id] = alt;
      s.asks.push(id); s.resume = resume; s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id });
    },
    commit(s, ev, id, v) {
      if (!s.ask || s.ask.id !== id) return; const A = s.ask, e = s.exp[id]; let hit = false;
      if (v != null && isFinite(+v)) { v = Math.max(A.lo, Math.min(A.hi, +v)); const d = Math.abs(v - e); hit = d <= A.tol && (s.alt[id] || []).filter(a => Math.abs(a - e) > A.tol).every(a => d < Math.abs(v - a)); } else v = null;
      s.pred[id] = v; s.hits[id] = hit; s.ask = null; s.t = 0;
      const r = s.resume || 'run'; s.phase = r; ev.push({ k: 'commit', id, reveal: id });
      if (r === 'uplift') this.uplift(s, ev);
      else if (r === 'lab') { s.phase = 'lab'; ev.push({ k: 'lab' }); }
      else if (r === 'bush') ev.push({ k: 'bush' });
      else if (r === 'pick') ev.push({ k: 'season', n: s.season });
    },
    /* ---------- What if? (D1 G9): L0's burials rerun through uplift with one rule changed ---------- */
    lever(k) {
      const s = this.s; s.whatif = k; s.ask = null; s.mine = s.kept; s.t = 0;
      if (s.level === 0) this.uplift(s, [], { still: k === 'still', noerode: k === 'noerode' });
      else { s.phase = 'over'; }
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      if (a.k === 'unt') { s.unt = !!a.on; ev.push({ k: 'unt', on: s.unt }); return ev; }
      if (a.k === 'wood') { if (s.level === 4) s.wood = Math.max(1, Math.min(200, Math.round(+a.gen || 12))); return ev; }
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id) this.commit(s, ev, a.id, a.moved === false ? null : a.v); return ev; }
      if (s.whatif || s.phase === 'ask' || s.phase === 'over') return ev;
      const n = s.level;
      if (n === 0 && s.phase === 'epoch') {
        if (a.k === 'pour' && s.mud > 0) { s.pour = Math.max(0, Math.min(1, +a.x || 0)); s.slug = 0; }
        else if (a.k === 'slug' && s.mud > 0) { s.pour = Math.max(0, Math.min(1, +a.x || 0)); s.slug = 15; }
        else if (a.k === 'stop') { if (!s.slug) s.pour = null; }
        else if (a.k === 'settle') this.endEpoch(s, ev);
      } else if (n === 1) {
        if (a.k === 'hold' && s.phase === 'run') s.hold = !!a.on;
        else if (a.k === 'assay') this.assay(s, ev, a.i | 0);
        else if (a.k === 'assay8') this.assay8(s, ev);
        else if (a.k === 'date') this.date(s, ev);
      } else if (n === 2) {
        if (a.k === 'chip') this.chip(s, ev, a.z | 0);
        else if (a.k === 'spot') this.spot(s, ev, a.z | 0, a.i | 0);
        else if (a.k === 'laser8') this.laser8(s, ev, a.z | 0);
        else if (a.k === 'done' && s.phase === 'assay') { if (s.z[0].k >= DG_K.minSpots && s.z[1].k >= DG_K.minSpots) this.endAssay(s, ev); else ev.push({ k: 'both' }); }
      } else if (n === 3) {
        if (a.k === 'dig') this.dig(s, ev, a.o | 0);
        else if (a.k === 'brush') this.brush(s, ev, a.a);
      } else if (a.k === 'place') this.place(s, ev, a.id, a.v);
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_DIG_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, interesting: this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons §1.5)
      if (s.whatif) return null; const n = s.level, st = CH_DIG_V2.stars;
      if (n === 0) { const L = s.layers.find(x => x.still); if (L && L.gone && this.softStill(s) > 0) return 'lost'; if (this.softStill(s) === 0) return 'nosoft'; if (this.buried(s) < 12) return 'few'; return s.kept / 48 > this.keptExp(s) + 0.08 ? 'lucky' : null; }
      if (n === 1) { if (s.ns < 24) return 'rough'; return s.h != null && Math.abs(s.h - 32) >= 6 ? 'clump' : null; }
      if (n === 2) { const a = this.zEst(s.z[0]), b = this.zEst(s.z[1]); if (a && b && a.t > b.t) return 'flip'; return st.discover(s, 2) ? null : 'lopsided'; }
      if (n === 3) { if (this.rightDigs(s) === 0) return 'wrongrock'; return this.fishapods(s) === 0 ? 'unlucky' : null; }
      if (this.goodCards(s) < 6) return 'ladder';
      const v = s.pred.d1; return v != null && Math.abs(v - (DG_K.lo + DG_K.earth) / 2) < 1 ? 'middle' : null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s || s.whatif) return out;
      if (s.ask) { const A = s.ask; for (let k = 0; k <= 48; k++) out.push({ k: 'predict', id: A.id, v: Math.round((A.lo + (A.hi - A.lo) * k / 48) * 1e4) / 1e4 }); return out; }
      const n = s.level;
      if (n === 0 && s.phase === 'epoch') { if (s.mud > 0) for (let k = 0; k < 10; k++) out.push({ k: 'pour', x: 0.05 + 0.1 * k }); out.push({ k: 'stop' }, { k: 'settle' }); }
      else if (n === 1) { if (s.phase === 'run') out.push({ k: 'hold', on: !s.hold }); else if (s.phase === 'ash') { for (let i = 0; i < DG_K.N1; i++) if (!s.seen[i]) out.push({ k: 'assay', i }); out.push({ k: 'date' }); } }
      else if (n === 2) { if (s.phase === 'free') { for (let zi = 0; zi < 2; zi++) if (!s.z[zi].chip) out.push({ k: 'chip', z: zi }); } else if (s.phase === 'assay') { for (let zi = 0; zi < 2; zi++) for (let i = 0; i < DG_K.spots; i++) if (s.z[zi].sp[i] < 0) out.push({ k: 'spot', z: zi, i }); out.push({ k: 'done' }); } }
      else if (n === 3) { if (s.phase === 'pick') for (let o = 0; o < s.crops.length; o++) out.push({ k: 'dig', o }); else if (s.phase === 'brush') out.push({ k: 'brush', a: 0.1 }); }
      else if (n === 4 && s.phase === 'place') { const id = s.order[s.ci]; for (let k = 0; k <= 34; k++) out.push({ k: 'place', id, v: Math.round((1 + k * 0.25) * 100) / 100 }); }
      return out;
    },
    /* bots (tests/bots.js): (s, acts, rnd) → action | null; 'random' is generic. No bot may earn three stars in a level, nor across the unit. */
    bots: {
      alwaysA(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'centre', hold: 1, assay: 16, laser: 'up', dig: 'first', card: 9, pred: 'lo' }); },
      alwaysB(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'none', hold: 0, assay: 64, laser: 'lo', dig: 'last', card: 3, pred: 'hi' }); },
      greedy(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'chase', hold: 1, assay: 32, laser: 'alt', dig: 'pin', card: 5.3, pred: 'mid' }); },
      threshold(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'chase', hold: 1, assay: 24, laser: 'even', dig: 'age', card: 'word', pred: 'mid' }); },
      fixed(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'chase', hold: 1, assay: 32, laser: 'even', dig: 'right', card: 'word', pred: 'fixed' }); },
      still(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'soft', hold: 1, assay: 64, laser: 'even', dig: 'right', card: 'true', pred: 'still' }); },
      naive(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'soft', hold: 1, assay: 64, laser: 'even', dig: 'right', card: 'true', pred: 'naive' }); },
      expert(s, acts) { return CH_DIG_V2.sim.bot(s, acts, { pour: 'soft', hold: 1, assay: 64, laser: 'even', dig: 'right', card: 'true', pred: 'exact' }); }   // test policy: reads s.exp (never in a sweep)
    },
    bot(s, acts, o) {
      if (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt && !s.unt) return { k: 'unt', on: true };
      if (s.ask) {
        const A = s.ask, P = acts.filter(a => a.k === 'predict'), near = v => P.reduce((b, a) => (Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b));
        if (o.pred === 'still') return { k: 'predict', id: A.id, v: A.start, moved: false };
        if (o.pred === 'exact') return { k: 'predict', id: A.id, v: s.exp[A.id] };
        if (o.pred === 'fixed') { const F = { k1: 0.15, a1: 1408, a2: 450, b1: (A.hi) / 4, p1: 375, d1: 9.3 }; return { k: 'predict', id: A.id, v: F[A.id] }; }
        if (o.pred === 'naive') { const al = s.alt[A.id]; return { k: 'predict', id: A.id, v: al ? al[0] : (A.lo + A.hi) / 2 }; }
        return near(o.pred === 'lo' ? A.lo : o.pred === 'hi' ? A.hi : (A.lo + A.hi) / 2);
      }
      const n = s.level;
      if (n === 0) {
        if (s.phase !== 'epoch') return null;
        if (o.pour === 'none') return { k: 'settle' };
        if (s.mud <= 0) return null;
        if (o.pour === 'centre') return s.pour === 0.5 ? null : { k: 'pour', x: 0.5 };
        const still = s.e === s.anox, tgt = s.an.filter(a => !a.b && a.y < DG_K.bury && (o.pour !== 'soft' || !still || DG_TIS[a.k] === 'soft'));
        const pool = tgt.length ? tgt : s.an.filter(a => !a.b && a.y < DG_K.bury);
        if (!pool.length) return s.pour != null ? { k: 'stop' } : null;
        const cur = s.pour != null ? s.pour : 0.5, a = pool.reduce((b, x) => (Math.abs(x.x - cur) < Math.abs(b.x - cur) ? x : b));
        const x = Math.round(a.x * 100) / 100; return s.pour != null && Math.abs(s.pour - x) < 0.02 ? null : { k: 'pour', x };
      }
      if (n === 1) {
        if (s.phase === 'run') return !!o.hold !== s.hold ? { k: 'hold', on: !!o.hold } : null;
        if (s.phase === 'ash') return s.ns < o.assay ? { k: 'assay8' } : { k: 'date' };
        return null;
      }
      if (n === 2) {
        if (s.phase === 'free') { const zi = s.z[0].chip ? 1 : 0; return { k: 'chip', z: zi }; }
        if (s.phase !== 'assay') return null;
        if (s.used >= DG_K.budget) return { k: 'done' };
        const a = s.z[0].k, b = s.z[1].k;
        let zi = o.laser === 'up' ? 0 : o.laser === 'lo' ? 1 : a <= b ? 0 : 1;
        if (o.laser === 'alt') zi = s.used % 2;
        if (s.z[zi].k >= DG_K.spots) zi = 1 - zi;
        return { k: 'laser8', z: zi };
      }
      if (n === 3) {
        if (s.phase === 'brush') return { k: 'brush', a: 0.2 };
        if (s.phase !== 'pick') return null;
        const C = s.crops; let o2 = 0;
        if (o.dig === 'last') o2 = C.length - 1;
        else if (o.dig === 'pin') o2 = C.findIndex(c => c.age === 385 && c.env === 'river');
        else if (o.dig === 'age') o2 = C.findIndex(c => c.age === 375);
        else if (o.dig === 'right') o2 = C.findIndex(c => c.age === 375 && c.env === 'river');
        return { k: 'dig', o: Math.max(0, o2) };
      }
      if (n === 4 && s.phase === 'place') {
        const id = s.order[s.ci], c = this.card(id), tv = dgLog10(c.t);
        let v = typeof o.card === 'number' ? o.card : o.card === 'true' ? tv : (c.t >= 1e9 ? 9.5 : c.t >= 1e6 ? 7 : 5.5);
        return { k: 'place', id, v };
      }
      return null;
    }
  },

  /* ---------- stars, against the expectation for the actions taken (never the realised run of luck) ---------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false; const sim = CH_DIG_V2.sim;
      if (n === 0) return sim.softStill(s) >= 2 && sim.buried(s) >= 16;
      if (n === 2) return s.z[0].k >= 10 && s.z[1].k >= 10 && sim.zTrueErr(s.z[0], s.z[0].n) + sim.zTrueErr(s.z[1], s.z[1].n) <= DG_K.err2;
      if (n === 3) return sim.rightDigs(s) >= 2;
      return false;
    },
    predict: (s, n) => {
      if (s.whatif) return false;
      if (n === 0) return !!s.hits.k1;
      if (n === 1) return !!s.hits.a2 && (s.exp.a1 == null || !!s.hits.a1);
      if (n === 2) return !!s.hits.b1;
      if (n === 3) return !!s.hits.p1;
      return !!s.hits.d1;
    },
    transfer: (s, n) => !s.whatif && n === 4 && CH_DIG_V2.sim.goodCards(s) >= 7
  },
  unitStars(lv) {   // D3: Discover = a Lagerstätte (L0) and the in-between rock (L3); Predict in three of five levels; Transfer = the boss
    const m = i => lv[i] | 0; let p = 0; for (let i = 0; i < 5; i++) if (m(i) & 2) p++;
    return ((m(0) & 1) && (m(3) & 1) ? 1 : 0) | (p >= 3 ? 2 : 0) | (m(4) & 4 ? 4 : 0);
  },
  /* result code (30 bits): 0–2 level, 3–5 mask, 6–13 a level number (L0 buried, L1 atoms tested, L2 spots on the upper zircon,
     L3 seasons in the right rock, L4 cards within half a step), 14–20 the prediction ×100 of its axis span (127 none) */
  resultBits(s, level) {
    if (!s) return 0; const n = Math.max(0, Math.min(4, level | 0)), st = this.stars, sim = this.sim, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(v)));
    const x = n === 0 ? sim.buried(s) : n === 1 ? s.ns || 0 : n === 2 ? s.z[0].k : n === 3 ? sim.rightDigs(s) : sim.goodCards(s);
    const id = ['k1', 'a2', 'b1', 'p1', 'd1'][n], A = s.ask, v = s.pred[id], span = { k1: [0, 0.6], a2: [0, 2400], b1: [0, (s.b1e || 1) * 2], p1: [340, 420], d1: [1, DG_K.earth] }[id];
    const pv = v == null ? 127 : c(100 * (v - span[0]) / (span[1] - span[0]), 126); void A;
    return (n | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 3 | c(x, 255) << 6 | pv << 14) >>> 0;
  },
  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = false; this._asking = null; this._hudSig = ''; this._dockSig = '';
    this.v = { t: 0, banner: null, anims: [], flash: {}, hold: -1, fold: 0, said: {}, ptr: null, cur: 0.5, keyHold: false, bg: null, bgk: '', thaw: !!o.thaw,
      upT: 0, revT: 0, cells: {}, brushD: 0, drag: null, sel: 0, bushT: 0, lastTick: 0, laser: null, crack: {} };
    Sim.start(this, n, o);
    const ui = Save.d && Save.d.ui;
    if (!o.thaw && !o.replay && ui && ui.unt) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    if (n === 4 && !o.thaw && !o.replay) {   // the Wood's generations enter as a logged action, never a read inside the sim (lessons §1.6, §7)
      const canonical = (typeof Url !== 'undefined' && Url.seed != null) || (typeof Teacher !== 'undefined' && Teacher.on);
      let w = null; try { if (!canonical && Save.res && Save.res.get) w = Save.res.get('wood'); } catch (e) { w = null; }
      if (w && w.gen > 0) Sim.act(this, { k: 'wood', gen: w.gen | 0 });
    }
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = this.levels[n] && this.levels[n].name, s = this.sim.s;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => this.banner(o.thaw ? this.content.levers[s.whatif] || name : name, Math.max(1000, ms + 400)));
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
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'dg-' + k); },
  redraw() { if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); },

  /* ---------- the frame ---------- */
  update(dt) {
    const v = this.v;
    for (const e of Sim.run(this, 0)) this.juice(e);   // live actions first, so a Lock in starts the hold before the sim moves on
    if (v.hold >= 0) { v.hold += dt; if (!this.phoneStrip() || v.hold > 1.2) v.hold = -1; }
    const s0 = this.sim.s, ff = s0.whatif ? 3 : v.ff && /gap|uplift|reveal|lab|bracket|bush/.test(s0.phase) ? 3 : 1;
    const ev = Sim.run(this, v.hold >= 0 ? 0 : dt * ff), s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    v.anims = v.anims.filter(a => (a.t += dt) < a.d);
    for (const k in v.flash) { v.flash[k] -= dt; if (v.flash[k] <= 0) delete v.flash[k]; }
    if (s.phase === 'uplift') v.upT += dt * ff; if (s.phase === 'reveal' || (s.level === 0 && s.phase === 'over')) v.revT += dt * ff;
    if (s.phase === 'bush' || (s.level === 4 && s.phase === 'over')) v.bushT += dt;
    if (v.ghost0 && !v.banner) { v.ghost0 = false; this.teach(); }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; v.fold = 1; }
    if (v.fold && v.hold < 0) { v.fold = 0; if (typeof Predict !== 'undefined' && Predict.fold) Predict.fold(); }
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; v.ff = false; this._dockSig = ''; }
    if (s.level === 2 && s.phase === 'assay' && v.lt0 == null) v.lt0 = 1;
    if (s.level === 1 && s.phase === 'run' && (v.t - v.lastLive || 99) > 4 && typeof Live !== 'undefined') { v.lastLive = v.t; Live.say(Txt.f(this.content.live.decay, { n: s.n, t: Math.round(s.T) })); }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; v.endT = 0; return; } v.endT += dt; if (v.endT < 0.9 && !s.whatif) return; this._ended = true; this.finish(r); }
  },
  teach() {   // the ghost hand: within 3 s, on the verb this level adds (a known verb is skipped by Ghost itself)
    if (typeof Ghost === 'undefined') return; const n = this.level, s = this.sim.s;
    if (n === 0) Ghost.show({ verb: 'hold', key: ' ', at: () => { const G = this.geo(), a = s.an && s.an.find(q => !q.b && q.y < DG_K.bury); return a ? this.anXY(a, G) : [G.W / 2, G.floor - 10]; }, until: () => this.sim.buried(s) > 0 || s.an.some(a => a.b) });
    else if (n === 1) Ghost.show({ verb: 'hold', key: ' ', at: () => { const Z = this.zGeo(); return [Z.x, Z.y]; }, until: () => s.hold || s.T > 300 });
    else if (n === 2) Ghost.show({ verb: 'tap', at: () => { const G = this.geo(); return [G.cx + G.cw / 2, G.ashY[0]]; }, until: () => s.z[0].chip || s.z[1].chip });
    else if (n === 3) Ghost.show({ verb: 'tap', at: () => { const G = this.geo(), c = s.crops[4]; return this.cropXY(c, G); }, until: () => s.digs.length > 0 });
    else Ghost.show({ verb: 'drag', at: () => { const G = this.geo(); return [G.cardX, G.cardY]; }, to: () => { const G = this.geo(); return [G.X(6), G.ry]; }, until: () => s.ci > 0 });
  },
  teach2(kind) {
    if (typeof Ghost === 'undefined') return; const s = this.sim.s;
    if (kind === 'ash') Ghost.show({ verb: 'tap', at: () => { const Z = this.zGeo(), p = Z.atom(0); return [p[0], p[1]]; }, until: () => s.ns > 0 });
    if (kind === 'laser') Ghost.show({ verb: 'sweep', at: () => { const Z = this.z2Geo(0); return Z.spot(0); }, to: () => { const Z = this.z2Geo(0); return Z.spot(7); }, until: () => s.used > 0 });
    if (kind === 'brush') Ghost.show({ verb: 'sweep', at: () => { const B = this.brushGeo(); return [B.x + B.w * 0.2, B.y + B.h * 0.4]; }, to: () => { const B = this.brushGeo(); return [B.x + B.w * 0.8, B.y + B.h * 0.6]; }, until: () => s.br > 0.4 || s.phase !== 'brush' });
  },
  hud() {
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; if (typeof HUD === 'undefined') return;
    let t, num = ''; const n = s.level;
    if (s.phase === 'ask') t = { k1: C.askK, a1: C.askA1, a2: C.askA2, b1: C.askB1, p1: C.askP1, d1: C.askD1 }[s.ask.id];
    else if (n === 0) { t = s.phase === 'epoch' ? (s.e === 0 && !s.an.some(a => a.b) ? this.content.firstWords : s.e === s.anox ? C.still : s.unt ? C.floodU : C.flood) : s.phase === 'uplift' ? C.uplift : s.phase === 'reveal' || s.phase === 'over' ? C.reveal : C.gap; num = Txt.f(L.epoch, { n: Math.min(6, s.e + 1) }); }
    else if (n === 1) { t = s.phase === 'run' ? C.clock : s.phase === 'ash' ? (s.ns >= DG_K.minAssay ? C.ashGo : C.ash) : C.lab; num = s.phase === 'run' ? Txt.f(L.myr, { n: Math.round(s.T) }) : Txt.f(L.atoms, { n: s.ns || 0 }); }
    else if (n === 2) { t = s.phase === 'free' ? C.free : s.phase === 'assay' ? C.laser : C.bracket; num = Txt.f(L.spots, { n: DG_K.budget - s.used }); }
    else if (n === 3) { t = s.phase === 'brush' ? C.brush : C.pick; num = Txt.f(L.season, { n: Math.min(5, s.season + 1) }); }
    else { if (s.phase === 'place') { const id = s.order[s.ci], cd = this.content.cards[id]; t = Txt.f(C.place, { name: cd[0], age: cd[1] }); } else t = C.bush; num = (s.ci || 0) + ' / 8'; }
    if (s.whatif) t = this.content.levers[s.whatif];
    const sig = t + num; if (sig !== this._hudSig) { this._hudSig = sig; HUD.say(t, num); }
    const bar = typeof document !== 'undefined' && document.getElementById ? document.getElementById('bar-gen') : null;
    if (bar) { const lab = this.levels[n] ? this.levels[n].name : ''; if (bar.textContent !== lab) bar.textContent = lab; }
  },
  dock() {
    if (typeof Dock === 'undefined') return; const s = this.sim.s, L = this.content.labels, n = s.level;
    const sig = s.phase + (s.unt ? 'u' : '') + (s.ask ? s.ask.id : '') + (s.whatif ? 'w' : '') + (n === 1 ? (s.hold ? 'h' : '') + (s.ns >= DG_K.minAssay ? 'd' : '') : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'dg-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (s.whatif || s.phase === 'over') { Dock.set([]); return; }
    if (n === 0 && s.phase === 'epoch') { Dock.set([{ id: 'dg-settle', label: L.settle, key: 'Enter', fn: () => Sim.act(this, { k: 'settle' }) }]); return; }
    if (n === 1 && s.phase === 'run') { Dock.set([{ id: 'dg-fast', label: 'Run fast', key: 'F', pressed: !!s.hold, fn: () => Sim.act(this, { k: 'hold', on: !this.sim.s.hold }) }]); return; }
    if (n === 1 && s.phase === 'ash') { Dock.set([{ id: 'dg-t8', label: L.test8, key: 'T', fn: () => Sim.act(this, { k: 'assay8' }) }, { id: 'dg-date', label: L.date, key: 'Enter', primary: s.ns >= DG_K.minAssay, fn: () => Sim.act(this, { k: 'date' }) }]); return; }
    if (n === 2 && s.phase === 'free') { Dock.set([{ id: 'dg-chip', label: L.chip, key: 'Enter', fn: () => Sim.act(this, { k: 'chip', z: this.sim.s.z[0].chip ? 1 : 0 }) }]); return; }
    if (n === 2 && s.phase === 'assay') { Dock.set([{ id: 'dg-u8', label: L.up8, key: '1', fn: () => Sim.act(this, { k: 'laser8', z: 0 }) }, { id: 'dg-l8', label: L.lo8, key: '2', fn: () => Sim.act(this, { k: 'laser8', z: 1 }) }, { id: 'dg-done', label: L.done, key: 'Enter', fn: () => Sim.act(this, { k: 'done' }) }]); return; }
    if (n === 3 && s.phase === 'brush') { Dock.set([{ id: 'dg-brush', label: L.brush, key: ' ', fn: () => Sim.act(this, { k: 'brush', a: 0.12 }) }]); return; }
    Dock.set([]);
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    const chart = A.id === 'b1' ? 1 : 0;
    Predict.ask({ id: A.id, chart, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.start, tol: A.tol, soft: s.unt ? null : 26, needMove: true, linger: 1000,
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null, moved: false }), say: this.content.live.ask });
    if (typeof Live !== 'undefined') Live.say(this.content.live.ask);
    this._dockSig = ''; this.dock(); this.redraw();
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(s.ask.id === 'b1' ? 1 : 0); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
  reveal(id) {
    const s = this.sim.s; if (typeof Predict === 'undefined' || s.exp[id] == null) return;
    Predict.reveal(id, s.exp[id], s.tol[id]); this.whisper(s.pred[id] == null ? 'none' : s.hits[id] ? 'hit' : 'out'); this.redraw();
  },

  /* ---------- the level card ---------- */
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, o = { level: n, mask: r.mask, final: n === 4, interesting: r.interesting }, V = this.bodyVars();
    if (s.whatif) { o.body = Txt.f(C.whatifBody[s.whatif], V); o.take = null; o.interesting = null; }
    else if (n < 4) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    if (!s.whatif && n === 0 && typeof Freezer !== 'undefined') { Freezer.put(this.id, 1, this.sim.snapshot(), { force: true }); o.whatIf = { gen: 1, levers: ['still', 'noerode'] }; }
    o.why = n < 4 ? C.levelWhy[n] : C.why;
    const spec = this.cardSpec(); if (spec && typeof LiveGraph !== 'undefined') { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  bodyVars() {
    const s = this.sim.s, sim = this.sim, n = this.level, r = x => Math.round(x);
    if (n === 0) { const lv = s.whatif ? { still: s.whatif === 'still', noerode: s.whatif === 'noerode' } : {}; return { b: sim.buried(s), k: s.kept || 0, e: r(48 * sim.keptExp(s, lv)), s: s.whatif ? s.keptSoft || 0 : sim.softStill(s), m: s.mine || 0 }; }
    if (n === 1) return { h: s.h != null ? s.h : s.n, t: r(sim.ashEst(s)), e: r(sim.ashErr(s)), l: r(s.tA || 0) };
    if (n === 2) { const a = sim.zEst(s.z[0]) || { t: 0, e: 0 }, b = sim.zEst(s.z[1]) || { t: 0, e: 0 }; return { u: r(a.t), eu: r(a.e), w: r(b.t), el: r(b.e), f: r(s.fish) }; }
    if (n === 3) return { n: sim.rightDigs(s), f: sim.fishapods(s) };
    return { a: sim.goodCards(s) };
  },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, L = this.content.labels, G = this.geo();
    const snd = (k, x, y) => { if (typeof Snd2 !== 'undefined') Snd2.play(k, { x, y }); };
    const live = (k, o) => { if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live[k], o)); };
    switch (e.k) {
      case 'epoch': if (e.e > 0) this.banner(Txt.f(L.epoch, { n: e.e + 1 }), 1000); if (e.still) { this.whisper('still'); if (F) F.tier(2, () => F.ring(G.W / 2, G.floor - 20, 60, { ms: 600 })); } live('epoch', { n: e.e + 1, m: DG_K.mud }); return;
      case 'bury': {
        const a = s.an.find(q => q.id === e.id), p = a ? this.anXY(a, G) : [G.W / 2, G.floor];
        const ts = DG_TIS[e.kind], kt = ts === 'soft' ? (e.still ? L.kSoftS : L.kSoft) : ts === 'bone' ? (e.still ? L.kStill : L.kBone) : (e.still ? L.kStill : L.kShell);
        if (F) { F.tier(1); F.burst('dust', p[0], p[1], 8, { ink: '#8A6A44' }); F.pop(kt, p[0], p[1] - 24, ts === 'soft' && !e.still ? -1 : 1); }
        snd('pour', p[0], p[1]); live('bury', { k: e.kind });
        if (e.still && DG_TIS[e.kind] === 'soft') { this.whisper('soft'); if (F) F.tier(2, () => F.ring(p[0], p[1], 34, { ms: 700 })); }
        return;
      }
      case 'dry': this.whisper('dry'); return;
      case 'layer': v.anims.push({ k: 'layer', t: 0, d: 0.6 }); snd('swish', G.W / 2, G.floor); this.redraw(); return;
      case 'uplift': v.upT = 0; v.revT = 0; if (F) { F.shake(6, 220); F.tier(3, () => this.banner(this.content.levels ? '' : '', 10)); } snd('crack', G.W / 2, G.H / 2); this.redraw(); return;
      case 'reveal': v.revT = 0; if (s.layers.some(l => l.gone)) this.whisper('eroded'); this.redraw(); return;
      case 'decay': { v.flash['a' + e.i] = 0.55; const now = v.t; if (now - v.lastTick > 0.07) { v.lastTick = now; const Z = this.zGeo(), p = Z.atom(e.i); snd('tick', p[0], p[1]); if (F) F.burst('spark', p[0], p[1], 3); } if (now - (v.lastRd || 0) > 0.3) { v.lastRd = now; this.redraw(); } return; }
      case 'ash': this.banner(this.content.labels.zircon, 900); v.anims.push({ k: 'ash', t: 0, d: 0.7 }); this.teach2('ash'); this.redraw(); return;
      case 'assay': { const Z = this.zGeo(), p = Z.atom(e.i); v.flash['s' + e.i] = 0.4; if (F) F.burst('spark', p[0], p[1], 4); snd('tock', p[0], p[1]); this.redraw(); return; }
      case 'more': this.whisper('more'); return;
      case 'lab': { const Z = this.zGeo(); if (F) F.tier(2, () => F.ring(Z.x, Z.y, Z.w * 0.6, { ms: 700 })); snd('interesting', Z.x, Z.y); return; }
      case 'chip': { const y = G.ashY[e.z]; if (F) { F.burst('dust', G.cx + G.cw * 0.5, y, 10, { ink: '#CFC8B8' }); F.shake(3, 120); } snd('crack', G.cx + G.cw * 0.5, y); v.anims.push({ k: 'chip', z: e.z, t: 0, d: 0.6 }); if (s.z[0].chip && s.z[1].chip) this.teach2('laser'); return; }
      case 'spot': { const Z = this.z2Geo(e.z), p = Z.spot(e.i); v.flash['p' + e.z + '_' + e.i] = 0.35; if (F) F.burst('spark', p[0], p[1], 3, { ink: '#F2C27A' }); if (v.t - v.lastTick > 0.06) { v.lastTick = v.t; snd('tick', p[0], p[1]); } const E = this.sim.zEst(s.z[e.z]); if (E && s.z[e.z].k % 5 === 0) live('spot', { z: e.z ? L.lower : L.upper, n: s.z[e.z].n, t: Math.round(E.t), e: Math.round(E.e) }); this.redraw(); return; }
      case 'budget': this.whisper('budget'); return;
      case 'both': this.whisper('both'); return;
      case 'bracket': { const y = G.fishY; if (F) F.tier(2, () => F.ring(G.cx + G.cw / 2, y, 40, { ms: 700 })); snd('interesting', G.cx, y); this.redraw(); return; }
      case 'dig': { const c = s.crops[e.o], p = this.cropXY(c, G); if (F) F.burst('dust', p[0], p[1], 8, { ink: '#B48A52' }); snd('crack', p[0], p[1]); v.cells = {}; v.anims.push({ k: 'zoom', t: 0, d: 0.45 }); this.teach2('brush'); return; }
      case 'find': {
        const B = this.brushGeo(), cx = B.x + B.w / 2, cy = B.y + B.h / 2; live('find', { n: e.season + 1, f: this.content.finds[e.f] });
        if (e.f === 'fishapod') { this.whisper('found'); if (F) F.tier(3, () => { F.burst('spark', cx, cy, 14); F.ring(cx, cy, B.w * 0.45, { ms: 900 }); }); snd('interesting', cx, cy); }
        else if (e.f === 'scales') { this.whisper('empty'); snd('swish', cx, cy); }
        else { if (F) F.tier(2, () => F.ring(cx, cy, B.w * 0.35, { ms: 600 })); snd('scale', cx, cy); }
        this.redraw(); return;
      }
      case 'season': if (e.n > 0) this.banner(Txt.f(L.season, { n: e.n + 1 }), 1000); return;
      case 'placed': {
        const x = e.v != null ? G.X(e.v) : G.W / 2; if (F) { F.tier(1); F.ring(x, G.ry, 18, { ms: 300 }); } snd('tock', x, G.ry);
        live('placed', { c: this.content.cardShort[e.id], t: e.v != null ? this.fmtY(dgYears(e.v)) : '' }); v.drag = null; this.redraw(); return;
      }
      case 'bush': v.bushT = 0; this.banner(L.bush, 1300); if (F) F.tier(3, () => F.ring(G.X(5.5), G.ry, 50, { ms: 900 })); this.redraw(); return;
      case 'commit': if (this.phoneStrip()) v.hold = 0; this.reveal(e.reveal); return;
      case 'unt': this._dockSig = ''; return;
    }
  },

  /* ---------- input ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, n = s.level, G = this.geo(); v.ptr = { x, y, x0: x, y0: y, t0: v.t };
    if (/gap|uplift|reveal|lab|bracket|bush/.test(s.phase)) { v.ff = true; return; }
    if (s.whatif || s.phase === 'ask' || s.phase === 'over') return;
    if (n === 0 && s.phase === 'epoch') { if (y > G.top) { v.pouring = true; v.px = this.xToF(x, G); Sim.act(this, { k: 'pour', x: v.px }); } return; }
    if (n === 1) {
      if (s.phase === 'run') { v.held = true; Sim.act(this, { k: 'hold', on: true }); return; }
      if (s.phase === 'ash') { this.assayAt(x, y); return; }
    }
    if (n === 2) {
      if (s.phase === 'free') { for (let zi = 0; zi < 2; zi++) if (Math.abs(y - G.ashY[zi]) < Math.max(22, G.ashH * 2) && x < G.cx + G.cw + 20) { Sim.act(this, { k: 'chip', z: zi }); return; } for (let zi = 0; zi < 2; zi++) { const Z = this.z2Geo(zi); if (x > Z.x - Z.w / 2 && x < Z.x + Z.w / 2 && Math.abs(y - Z.y) < Z.h / 2) { Sim.act(this, { k: 'chip', z: zi }); return; } } return; }
      if (s.phase === 'assay') { v.laser = { x, y }; this.laserAt(x, y); return; }
    }
    if (n === 3) {
      if (s.phase === 'pick') { const o = this.cropAt(x, y, G); if (o >= 0) Sim.act(this, { k: 'dig', o }); return; }
      if (s.phase === 'brush') { this.brushAt(x, y, true); return; }
    }
    if (n === 4 && s.phase === 'place') {
      if (Math.abs(x - G.cardX) < G.cardW / 2 + 10 && Math.abs(y - G.cardY) < G.cardH / 2 + 10) { v.drag = { x, y }; return; }
      if (Math.abs(y - G.ry) < G.rh * 1.6) v.drag = { x, y, tapRibbon: true };
    }
  },
  move(x, y) {
    const s = this.sim.s, v = this.v, n = s.level, G = this.geo(); if (v.ptr) { v.ptr.x = x; v.ptr.y = y; }
    if (n === 0 && v.pouring && s.phase === 'epoch') { const f = this.xToF(x, G); if (Math.abs(f - v.px) >= 0.01) { v.px = f; Sim.act(this, { k: 'pour', x: f }); } return; }
    if (n === 1 && s.phase === 'ash') { this.assayAt(x, y); return; }
    if (n === 2 && s.phase === 'assay') { v.laser = { x, y }; this.laserAt(x, y); return; }
    if (n === 3 && s.phase === 'brush') { this.brushAt(x, y, false); return; }
    if (n === 4 && v.drag) { v.drag.x = x; v.drag.y = y; v.drag.moved = true; }
  },
  up(x, y) {
    const s = this.sim.s, v = this.v, n = s.level, G = this.geo(), p = v.ptr; v.ptr = null;
    if (n === 0 && v.pouring) { v.pouring = false; if (s.phase === 'epoch') { if (p && v.t - p.t0 < 0.25) Sim.act(this, { k: 'slug', x: this.xToF(x, G) }); else Sim.act(this, { k: 'stop' }); } return; }
    if (n === 1 && v.held) { v.held = false; Sim.act(this, { k: 'hold', on: false }); return; }
    if (n === 2) { v.laser = null; return; }
    if (n === 4 && v.drag && s.phase === 'place') {
      const d = v.drag; v.drag = null;
      if (Math.abs(y - G.ry) < G.rh * 2.2 && x >= G.rx0 - 10 && x <= G.rx1 + 10) Sim.act(this, { k: 'place', id: s.order[s.ci], v: Math.round(G.V(x) * 1000) / 1000 });
      void d;
    }
  },
  onKey(k) {
    const s = this.sim.s, v = this.v, n = s.level;
    if (k === ' ' && /gap|uplift|reveal|lab|bracket|bush/.test(s.phase)) { v.ff = true; return; }
    if (n === 0 && s.phase === 'epoch') {
      if (k === 'ArrowLeft' || k === 'ArrowRight') { v.cur = Math.max(0.02, Math.min(0.98, v.cur + (k === 'ArrowLeft' ? -0.05 : 0.05))); if (v.keyHold) Sim.act(this, { k: 'pour', x: Math.round(v.cur * 100) / 100 }); return; }
      if (k === ' ' && !v.keyHold) { v.keyHold = true; Sim.act(this, { k: 'pour', x: Math.round(v.cur * 100) / 100 }); }
      return;
    }
    if (n === 1 && k === ' ' && s.phase === 'run' && !v.keyHold) { v.keyHold = true; Sim.act(this, { k: 'hold', on: true }); return; }
    if (n === 3 && s.phase === 'pick') {
      if (k === 'ArrowLeft' || k === 'ArrowRight') { v.sel = (v.sel + (k === 'ArrowLeft' ? s.crops.length - 1 : 1)) % s.crops.length; return; }
      if (k === 'Enter' || k === ' ') { Sim.act(this, { k: 'dig', o: v.sel }); return; }
    }
    if (n === 4 && s.phase === 'place') {
      if (k === 'ArrowLeft' || k === 'ArrowRight') { v.kv = Math.max(1, Math.min(DG_K.earth, (v.kv || 5) + (k === 'ArrowLeft' ? 0.25 : -0.25))); return; }
      if (k === 'Enter' || k === ' ') Sim.act(this, { k: 'place', id: s.order[s.ci], v: v.kv || 5 });
    }
  },
  onKeyUp(k) {
    const s = this.sim.s, v = this.v; if (k !== ' ' || !v.keyHold) return; v.keyHold = false;
    if (s.level === 0) Sim.act(this, { k: 'stop' }); else if (s.level === 1) Sim.act(this, { k: 'hold', on: false });
  },
  teacherStep() { this.v.ff = true; },
  assayAt(x, y) { const s = this.sim.s, Z = this.zGeo(); for (let i = 0; i < DG_K.N1; i++) { if (s.seen[i]) continue; const p = Z.atom(i), dx = x - p[0], dy = y - p[1]; if (dx * dx + dy * dy <= Z.hit * Z.hit) Sim.act(this, { k: 'assay', i }); } },
  laserAt(x, y) { const s = this.sim.s; for (let zi = 0; zi < 2; zi++) { const Z = this.z2Geo(zi), z = s.z[zi]; for (let i = 0; i < DG_K.spots; i++) { if (z.sp[i] >= 0) continue; const p = Z.spot(i), dx = x - p[0], dy = y - p[1]; if (dx * dx + dy * dy <= Z.hit * Z.hit) Sim.act(this, { k: 'spot', z: zi, i }); } } },
  brushAt(x, y, first) {
    const v = this.v, B = this.brushGeo(); if (x < B.x || x > B.x + B.w || y < B.y || y > B.y + B.h) return;
    const ci = Math.floor((x - B.x) / B.w * 12), cj = Math.floor((y - B.y) / B.h * 12);
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) v.cells[(ci + di) + ',' + (cj + dj)] = 1;
    if (!first && v.bx != null) { const dx = x - v.bx, dy = y - v.by; v.brushD += Math.sqrt(dx * dx + dy * dy); }
    v.bx = x; v.by = y;
    if (v.brushD > B.w * 0.18) { v.brushD = 0; Sim.act(this, { k: 'brush', a: 0.07 }); if (typeof Fx !== 'undefined') Fx.burst('dust', x, y, 3, { ink: '#C7A46A' }); }
  },

  /* ---------- geometry (canvas px) ---------- */
  geo() {
    const W = Stage.w, H = Stage.h, u = Stage.u || Math.min(W, 1.2 * H), top = this.hudH() + 6, bot = H - 12, n = this.level, G = { W, H, u, top, bot };
    if (n === 0) { G.lh = Math.max(14, Math.min(26, (bot - top) * 0.36 / DG_K.E)); G.floor = bot - DG_K.E * G.lh - 2; G.gx = W - 18; }
    if (n === 2) {   // the cliff section on the left, two zircons on the right
      const wide = W > 700; G.cx = wide ? W * 0.1 : 12; G.cw = wide ? W * 0.32 : W * 0.38; G.ct = top + 18; G.cb = bot - 8;
      const h = G.cb - G.ct; G.ashH = Math.max(6, h * 0.025); G.ashY = [G.ct + h * 0.3, G.ct + h * 0.72]; G.fishY = (G.ashY[0] + G.ashY[1]) / 2;
      G.zx = wide ? W * 0.66 : G.cx + G.cw + (W - G.cx - G.cw) / 2; G.zw = Math.min(wide ? 260 : W - G.cw - 34, (G.ashY[1] - G.ashY[0]) * 0.7);
    }
    if (n === 3) { const m = Math.min(W - 24, (bot - top) * 1.5), mh = Math.min(bot - top - 12, Math.max(m * 0.8, W < 600 ? bot - top - 12 : 0)); G.mx = (W - m) / 2; G.my = top + 6; G.mw = m; G.mh = mh; }
    if (n === 4) {
      G.rx0 = 20; G.rx1 = W - 20; G.ry = top + (bot - top) * 0.36; G.rh = Math.max(16, Math.min(26, H * 0.03));
      G.X = v => G.rx0 + (DG_K.earth - v) / (DG_K.earth - DG_K.lo) * (G.rx1 - G.rx0); G.V = x => Math.max(DG_K.lo, Math.min(DG_K.earth, DG_K.earth - (x - G.rx0) / (G.rx1 - G.rx0) * (DG_K.earth - DG_K.lo)));
      G.cardW = Math.min(260, W * 0.62); G.cardH = Math.min(150, (bot - top) * 0.26); G.cardX = W / 2; G.cardY = bot - G.cardH / 2 - 8;
    }
    return G;
  },
  xToF(x, G) { return Math.round(Math.max(0.02, Math.min(0.98, x / G.W)) * 100) / 100; },
  anXY(a, G) { return [a.x * G.W, G.floor - 8 - a.y * (G.floor - G.top) * 0.92]; },
  zGeo() {   // the L1 zircon: an elongated bipyramid with an 8 × 8 atom grid
    const W = Stage.w, H = Stage.h, top = this.hudH() + 6, bot = H - 12, w = Math.min(W * 0.78, 360, (bot - top) * 0.62), h = Math.min((bot - top) * 0.86, w * 1.45), x = W / 2, y = top + (bot - top) * 0.52;
    const cell = w * 0.8 / 8;
    return { x, y, w, h, cell, hit: Math.max(cell * 0.55, 12), atom: i => [x - cell * 3.5 + (i % 8) * cell, y - cell * 3.5 + Math.floor(i / 8) * cell] };
  },
  z2Geo(zi) { const G = this.geo(), w = G.zw, x = G.zx, y = G.ashY[zi], cell = w * 0.78 / 8; return { x, y, w, h: w * 1.0, cell, hit: Math.max(cell * 0.55, 11), spot: i => [x - cell * 3.5 + (i % 8) * cell, y - cell * 3.5 + Math.floor(i / 8) * cell] }; },
  cropXY(c, G) { return [G.mx + G.mw * (0.08 + 0.84 * c.x), G.my + G.mh * (0.1 + 0.8 * c.y)]; },
  cropR(G) { return Math.max(26, Math.min(G.mw, G.mh) * 0.11); },
  cropAt(x, y, G) { const s = this.sim.s, r = this.cropR(G); let best = -1, bd = 1e9; s.crops.forEach((c, i) => { const p = this.cropXY(c, G), dx = x - p[0], dy = y - p[1], d = Math.sqrt(dx * dx + dy * dy); if (d < r * 1.35 && d < bd) { bd = d; best = i; } }); return best; },
  brushGeo() { const W = Stage.w, H = Stage.h, top = this.hudH() + 6, bot = H - 12, w = Math.min(W - 40, (bot - top) * 0.7, 420); return { x: (W - w) / 2, y: top + (bot - top - w) / 2, w, h: w }; },
  fmtY(t) { const L = this.content.labels, r1 = x => (Math.round(x * 10) / 10).toString(); if (t >= 1e9) return Txt.f(L.gyr, { n: r1(t / 1e9) }); if (t >= 1e6) return Txt.f(L.myr, { n: t >= 1e8 ? Math.round(t / 1e6) : r1(t / 1e6) }); if (t >= 1e3) return Txt.f(L.kyr, { n: Math.round(t / 1e3) }); return Txt.f(L.yr, { n: Math.round(t) }); },

  /* ---------- drawing ---------- */
  draw(c, w, h) {
    const s = this.sim.s; if (!s) return;
    const n = s.level;
    if (n === 0) this.drawFlood(c, w, h); else if (n === 1) this.drawClock(c, w, h); else if (n === 2) this.drawBracket(c, w, h); else if (n === 3) this.drawMap(c, w, h); else this.drawRibbon(c, w, h);
    const v = this.v; if (typeof Lbl === 'undefined') return;
    if (v.banner) { const b = v.banner, a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; if (b.text) { c.save(); c.globalAlpha = a; Lbl.put('dg-banner', b.text, w / 2, this.hudH() + 30, { size: 22, c, weight: 700 }); c.restore(); } }
    if (/gap|uplift|reveal|lab|bracket|bush/.test(s.phase) && !v.ff && !s.whatif) Lbl.put('dg-ff', this.content.labels.ff, w - 12, h - 16, { align: 'right', size: 12, c });
  },
  /* the golden-hour cliff, baked once per size: sky, sun, sea with glitter, and a cliff of chalk, ochre sandstone, slate shale, pale ash */
  cliffBg(c, w, h, key, fn) {
    const v = this.v, k = key + w + 'x' + h; if (!v.bg || v.bgk !== k) { v.bg = typeof Layer !== 'undefined' ? Layer(w, h) : null; v.bgk = k; if (v.bg) v.bg.redraw((cc, W, H) => fn.call(this, cc, W, H)); }
    if (v.bg) v.bg.blit(c, 0, 0); else fn.call(this, c, w, h);
  },
  paintSky(c, W, y1, hues) {
    const g = c.createLinearGradient(0, 0, 0, y1); g.addColorStop(0, hues[0]); g.addColorStop(0.7, hues[1]); g.addColorStop(1, hues[2]); c.fillStyle = g; c.fillRect(0, 0, W, y1);
  },
  paintSea(c, W, y0, y1, sunX) {
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#7C8A86'); g.addColorStop(1, DG_C.seaD); c.fillStyle = g; c.fillRect(0, y0, W, y1 - y0);
    c.strokeStyle = 'rgba(246,215,154,.55)'; c.lineWidth = 1.5; for (let i = 0; i < 26; i++) { const yy = y0 + 4 + (i * i * 0.9) % (y1 - y0 - 6), ww = 10 + (i * 37) % 40, xx = sunX + ((i * 53) % 120 - 60) * (1 + (yy - y0) / 60); c.beginPath(); c.moveTo(xx - ww / 2, yy); c.lineTo(xx + ww / 2, yy); c.stroke(); }
  },
  strataBands() { return [['chalk', 0.2, DG_C.chalk], ['ochre', 0.16, DG_C.ochre], ['slate', 0.12, DG_C.slate], ['ash', 0.03, DG_C.ash], ['ochre', 0.14, '#B98A44'], ['slate', 0.17, DG_C.slateD], ['ochre', 0.18, DG_C.ochreD]]; },
  paintCliff(c, x0, x1, yTop, yBot, edge) {   // a cliff face of bands (top to bottom), with a ragged seaward edge and texture
    const B = this.strataBands(), tot = B.reduce((a, b) => a + b[1], 0); let y = yTop; const hR = this.hash.bind(this);
    c.save(); c.beginPath(); c.moveTo(x0, yTop); for (let yy = yTop; yy <= yBot; yy += 10) c.lineTo(x1 - edge * (0.4 + 0.6 * ((hR('e' + yy) % 100) / 100)), yy); c.lineTo(x0, yBot); c.closePath(); c.clip();
    for (const b of B) {
      const hh = b[1] / tot * (yBot - yTop); c.fillStyle = b[2]; c.fillRect(x0, y, x1 - x0, hh + 1);
      c.strokeStyle = b[0] === 'slate' ? 'rgba(20,24,30,.35)' : 'rgba(60,40,20,.22)'; c.lineWidth = 1; c.beginPath();
      if (b[0] === 'slate') for (let yy = y + 3; yy < y + hh; yy += 4) { c.moveTo(x0, yy); c.lineTo(x1, yy + 1); }
      else if (b[0] === 'chalk') for (let k = 0; k < (x1 - x0) * hh / 300; k++) { const px = x0 + (hR('c' + k + y) % 1000) / 1000 * (x1 - x0), py = y + (hR('d' + k + y) % 1000) / 1000 * hh; c.moveTo(px, py); c.lineTo(px + 6, py + 1); }
      else if (b[0] === 'ochre') for (let k = 0; k < (x1 - x0) * hh / 60; k++) { const px = x0 + (hR('o' + k + y) % 1000) / 1000 * (x1 - x0), py = y + (hR('p' + k + y) % 1000) / 1000 * hh; c.moveTo(px + 0.8, py); c.arc(px, py, 0.8, 0, TAU); }
      c.stroke(); y += hh;
    }
    const sh = c.createLinearGradient(x0, 0, x1, 0); sh.addColorStop(0, 'rgba(40,25,10,.25)'); sh.addColorStop(0.7, 'rgba(255,200,120,0)'); sh.addColorStop(1, 'rgba(255,190,110,.25)'); c.fillStyle = sh; c.fillRect(x0, yTop, x1 - x0, yBot - yTop);
    c.restore();
  },
  hash(v) { let h = 2166136261; const t = String(v); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h ^ h >>> 13) >>> 0; },
  goldenScene(c, W, H) {   // L1 and L2's backdrop: sky, sun low over the sea, the cliff filling the left
    const hor = H * 0.42; this.paintSky(c, W, hor, ['#E7A56E', '#F3C98C', '#F8E2B4']);
    const sx = W * 0.78, sy = hor - 18, gl = c.createRadialGradient(sx, sy, 6, sx, sy, W * 0.45); gl.addColorStop(0, 'rgba(255,236,190,.95)'); gl.addColorStop(0.15, 'rgba(255,214,150,.5)'); gl.addColorStop(1, 'rgba(255,200,140,0)'); c.fillStyle = gl; c.fillRect(0, 0, W, hor);
    c.fillStyle = '#FFF1D2'; c.beginPath(); c.arc(sx, sy, Math.max(10, W * 0.025), 0, TAU); c.fill();
    this.paintSea(c, W, hor, H, sx);
    this.paintCliff(c, 0, W * 0.7, H * 0.12, H, W * 0.12);
    c.fillStyle = 'rgba(46,58,62,.5)'; c.fillRect(0, H * 0.94, W, H * 0.06);
  },

  /* ----- L0: the Devonian sea floor and the growing record ----- */
  drawFlood(c, w, h) {
    const s = this.sim.s, v = this.v, G = this.geo(), still = s.phase === 'epoch' || s.phase === 'gap' ? s.e === s.anox : false;
    if (s.phase === 'uplift' || s.phase === 'reveal' || (s.phase === 'over' && s.kept != null) || (s.phase === 'ask' && false)) { this.drawUplift(c, w, h, G); return; }
    const g = c.createLinearGradient(0, 0, 0, G.floor);
    if (still) { g.addColorStop(0, '#6E7A62'); g.addColorStop(1, '#2B3330'); } else { g.addColorStop(0, '#E8C48A'); g.addColorStop(0.25, '#8FA39A'); g.addColorStop(1, DG_C.seaD); }
    c.fillStyle = g; c.fillRect(0, 0, w, G.floor);
    if (!still && !(typeof Fx !== 'undefined' && Fx.calm)) { c.save(); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x = w * (0.1 + 0.2 * i) + 30 * Det.sin(v.t * 0.3 + i); c.fillStyle = 'rgba(246,215,154,.07)'; c.beginPath(); c.moveTo(x - 20, 0); c.lineTo(x + 20, 0); c.lineTo(x + 90, G.floor); c.lineTo(x + 10, G.floor); c.closePath(); c.fill(); } c.restore(); }
    // the floor and the record beneath it (newest layer on top)
    c.fillStyle = still ? '#3C3A33' : '#7D6A4E'; c.fillRect(0, G.floor - 4, w, 6);
    const nL = s.layers.length;
    for (let i = 0; i < DG_K.E; i++) {
      const y = G.floor + 2 + i * G.lh, li = nL - 1 - i;
      if (li < 0) { c.fillStyle = '#3A3936'; c.fillRect(0, y, w, G.lh + 1); c.setLineDash([4, 6]); c.strokeStyle = 'rgba(241,236,223,.18)'; c.lineWidth = 1; c.strokeRect(6, y + 3, w - 12, G.lh - 6); c.setLineDash([]); continue; }
      const L = s.layers[li]; c.fillStyle = L.still ? '#33302C' : li % 2 ? '#8C7656' : '#A28A63'; c.fillRect(0, y, w, G.lh + 1);
      c.strokeStyle = 'rgba(20,16,12,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke();
      for (const a of L.a) if (a.b) this.critter(c, a.k, a.x * w, y + G.lh * 0.5, Math.min(G.lh * 0.8, 22), 0.55, true);
      if (L.still && typeof Lbl !== 'undefined') Lbl.put('dg-still-' + li, this.content.labels.still, 12, y + G.lh / 2, { size: 12, align: 'left', c });
    }
    // the mud plume
    const px = s.pour != null ? s.pour * w : null;
    if (px != null) {
      const r = DG_K.r * w, gp = c.createLinearGradient(0, G.top, 0, G.floor); gp.addColorStop(0, 'rgba(120,88,52,.15)'); gp.addColorStop(1, 'rgba(120,88,52,.75)');
      c.fillStyle = gp; c.beginPath(); c.moveTo(px - 10, G.top); c.lineTo(px + 10, G.top); c.lineTo(px + r, G.floor); c.lineTo(px - r, G.floor); c.closePath(); c.fill();
      for (let i = 0; i < 14; i++) { const f = ((v.t * 1.6 + i / 14) % 1), yy = G.top + f * (G.floor - G.top), sp = 10 + f * (r - 10), xx = px + sp * Det.sin(i * 2.7 + v.t); c.fillStyle = 'rgba(90,64,38,.7)'; c.beginPath(); c.arc(xx, yy, 2, 0, TAU); c.fill(); }
    } else if (s.phase === 'epoch') { const cx = (v.ptr ? v.ptr.x : v.cur * w); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(240,230,210,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, G.top + 4); c.lineTo(cx, G.floor - 4); c.stroke(); c.setLineDash([]); }
    // animals of this epoch
    if (s.an && (s.phase === 'epoch' || s.phase === 'ask' || s.phase === 'gap')) for (const a of s.an) {
      if (s.phase !== 'epoch' && !a.b) continue;
      const p = this.anXY(a, G), sz = Math.max(30, Math.min(54, G.u * 0.1));
      if (a.b) { c.fillStyle = '#6E5638'; c.beginPath(); c.ellipse(p[0], G.floor - 3, sz * 0.75, sz * 0.32, 0, Math.PI, TAU); c.fill(); continue; }
      this.critter(c, a.k, p[0], p[1], sz, 1, false, a.vx < 0, v.t + a.id);
      if (a.c > 0) { c.strokeStyle = '#F6D79A'; c.lineWidth = 3; c.beginPath(); c.arc(p[0], p[1], sz * 0.62, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, a.c / DG_K.cover)); c.stroke(); }
    }
    // the mud gauge
    if (s.phase === 'epoch') {
      const gx = G.gx, gy0 = G.top + 30, gy1 = G.floor - 30, f = s.mud / DG_K.mud;
      c.fillStyle = 'rgba(20,16,12,.35)'; rrect(c, gx - 6, gy0, 12, gy1 - gy0, 6); c.fill();
      c.fillStyle = '#9A7448'; rrect(c, gx - 6, gy1 - (gy1 - gy0) * f, 12, (gy1 - gy0) * f, 6); c.fill();
      if (typeof Lbl !== 'undefined') Lbl.put('dg-mud', this.content.labels.mud, gx, gy0 - 14, { size: 12, align: 'right', c });
    }
  },
  critter(c, k, x, y, sz, alpha, flat, flip, t) {   // living animals (stylised); buried ones drawn flat and faded
    c.save(); c.globalAlpha = alpha; c.translate(x, y); if (flip) c.scale(-1, 1); const r = sz / 2, wob = flat ? 0 : Det.sin((t || 0) * 3) * 0.12;
    c.lineWidth = 1.5; c.strokeStyle = DG_C.ink;
    if (k === 'ammonoid') { c.fillStyle = DG_C.rust; c.beginPath(); c.arc(0, 0, r * 0.7, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = 'rgba(30,20,10,.6)'; c.beginPath(); for (let a = 0; a < 9; a += 0.3) { const rr = r * 0.7 * (1 - a / 11); c.lineTo(rr * Det.cos(a), rr * Det.sin(a)); } c.stroke(); if (!flat) { c.strokeStyle = '#C98E6A'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(r * 0.6, -r * 0.2 + i * 0.15 * r); c.quadraticCurveTo(r * 1.0, (i - 1.5) * 0.3 * r + wob * r, r * 1.25, (i - 1.5) * 0.4 * r); c.stroke(); } } }
    else if (k === 'brach') { c.fillStyle = DG_C.ochre; c.beginPath(); c.moveTo(-r * 0.7, r * 0.2); c.quadraticCurveTo(0, -r * 0.9, r * 0.7, r * 0.2); c.quadraticCurveTo(0, r * 0.45, -r * 0.7, r * 0.2); c.fill(); c.stroke(); c.strokeStyle = 'rgba(40,30,15,.5)'; c.beginPath(); for (let i = -2; i <= 2; i++) { c.moveTo(0, r * 0.3); c.lineTo(i * r * 0.22, -r * 0.45); } c.stroke(); }
    else if (k === 'trilo') { c.fillStyle = DG_C.slate; c.beginPath(); c.ellipse(0, 0, r * 0.75, r * 0.45, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = 'rgba(230,220,200,.5)'; c.beginPath(); for (let i = -2; i <= 3; i++) { c.moveTo(i * r * 0.2, -r * 0.4); c.lineTo(i * r * 0.2, r * 0.4); } c.moveTo(-r * 0.75, 0); c.lineTo(r * 0.75, 0); c.stroke(); }
    else if (k === 'fish') { c.fillStyle = '#7F7A66'; c.beginPath(); c.moveTo(r, 0); c.quadraticCurveTo(r * 0.2, -r * 0.5, -r * 0.6, 0); c.lineTo(-r, -r * 0.35 + wob * r); c.lineTo(-r, r * 0.35 + wob * r); c.lineTo(-r * 0.6, 0); c.quadraticCurveTo(r * 0.2, r * 0.5, r, 0); c.fill(); c.stroke(); c.fillStyle = DG_C.ochreD; c.fillRect(r * 0.2, -r * 0.28, r * 0.5, r * 0.56); c.fillStyle = DG_C.ink; c.beginPath(); c.arc(r * 0.6, -r * 0.08, 1.8, 0, TAU); c.fill(); }
    else if (k === 'worm') { c.strokeStyle = '#D89A86'; c.lineWidth = Math.max(3, r * 0.28); c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 8; i++) { const xx = -r + i * r / 4, yy = Det.sin(i * 0.9 + (t || 0) * 4) * r * 0.18; if (i) c.lineTo(xx, yy); else c.moveTo(xx, yy); } c.stroke(); }
    else if (k === 'jelly') { c.fillStyle = 'rgba(241,236,223,.55)'; c.beginPath(); c.arc(0, 0, r * 0.6, Math.PI, TAU); c.quadraticCurveTo(0, r * 0.2, -r * 0.6, 0); c.fill(); c.strokeStyle = 'rgba(241,236,223,.8)'; c.stroke(); for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(i * r * 0.22, r * 0.05); c.quadraticCurveTo(i * r * 0.25 + wob * r, r * 0.5, i * r * 0.2, r * 0.9); c.stroke(); } }
    c.restore();
  },
  fossilKind: { ammonoid: 'ammonite', brach: 'brachiopod', trilo: 'trilobite', fish: 'fish', worm: 'worm', jelly: null },
  drawUplift(c, w, h, G) {   // the record rises into a cliff; waves tear out layers; the kept fossils show in their beds
    const s = this.sim.s, v = this.v, k = Math.min(1, v.upT / 1.6), hor = h * 0.3;
    this.paintSky(c, w, hor, ['#E39D68', '#F2C48A', '#F7DDAE']); this.paintSea(c, w, hor, h, w * 0.8);
    const x0 = 0, x1 = w * (0.62 + 0.3 * k), yT = G.floor + (G.top + 20 - G.floor) * k, yB = h, lh = (yB - yT) / DG_K.E, bands = [DG_C.slate, DG_C.ochre, DG_C.chalk2, DG_C.ochreD, DG_C.slateD, '#B98A44'];
    c.save(); c.beginPath(); c.moveTo(x0, yT); c.lineTo(x1 - 30, yT); for (let yy = yT; yy <= yB; yy += 12) c.lineTo(x1 - 30 * ((this.hash('u' + Math.round(yy - yT)) % 100) / 100), yy); c.lineTo(x0, yB); c.closePath(); c.clip();
    for (let i = 0; i < DG_K.E; i++) {   // oldest at the bottom
      const L = s.layers[i], y = yB - (i + 1) * lh, gone = L.gone && v.revT > 0;
      c.fillStyle = L.still ? '#3A3732' : bands[i % bands.length]; c.fillRect(x0, y, x1 - x0, lh + 1);
      if (gone) { c.fillStyle = 'rgba(30,26,22,.85)'; c.fillRect(x0, y + lh * 0.15, x1 - x0, lh * 0.7); c.strokeStyle = DG_C.chalk; c.lineWidth = 2; c.beginPath(); for (let x = x0; x <= x1; x += 10) c.lineTo(x, y + lh * 0.15 + ((this.hash('g' + i + x) % 100) / 100) * 8); c.stroke(); if (typeof Lbl !== 'undefined') Lbl.put('dg-gone-' + i, this.content.labels.gone, (x0 + x1) / 2, y + lh / 2, { size: 13, c }); continue; }
      c.strokeStyle = 'rgba(20,16,12,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
      if (v.revT > 0) L.a.forEach((a, j) => {
        if (!a.f) return; const appear = Math.min(1, Math.max(0, v.revT * 3 - (i * 8 + j) * 0.06)); if (appear <= 0) return;
        const fx = x0 + (x1 - x0 - 30) * a.x, fy = y + lh / 2, sz = Math.max(26, Math.min(44, lh * 0.8)), fk = this.fossilKind[a.k];
        c.save(); c.globalAlpha = appear;
        if (fk && typeof Rig !== 'undefined' && Rig.has && Rig.has('fossil')) Rig.draw(c, 'fossil', { kind: fk, lum: 0.75, wear: 0.1 }, fx, fy, { size: sz, id: a.k + i + j });
        else { c.setLineDash([3, 2]); c.strokeStyle = DG_C.chalk; c.lineWidth = 1.5; c.beginPath(); c.arc(fx, fy, sz * 0.32, 0, TAU); c.stroke(); c.setLineDash([]); }
        c.restore();
      });
      if (L.still && typeof Lbl !== 'undefined') Lbl.put('dg-lst-' + i, this.content.labels.still, x0 + 12, y + 12, { size: 12, align: 'left', c });
    }
    c.restore();
  },

  /* ----- L1: the zircon clock ----- */
  drawClock(c, w, h) {
    const s = this.sim.s, v = this.v, Z = this.zGeo(), L = this.content.labels;
    this.cliffBg(c, w, h, 'gold', this.goldenScene);
    c.fillStyle = 'rgba(28,24,22,.55)'; c.fillRect(0, 0, w, h);
    const ash = s.phase !== 'run' && !(s.phase === 'ask' && s.ask && s.ask.id === 'a1');
    // the crystal: a long bipyramid, honey-rust glass
    const hw = Z.w / 2, hh = Z.h / 2, tip = Z.w * 0.32;
    c.save(); c.beginPath(); c.moveTo(Z.x, Z.y - hh); c.lineTo(Z.x + hw, Z.y - hh + tip); c.lineTo(Z.x + hw, Z.y + hh - tip); c.lineTo(Z.x, Z.y + hh); c.lineTo(Z.x - hw, Z.y + hh - tip); c.lineTo(Z.x - hw, Z.y - hh + tip); c.closePath();
    const g = c.createLinearGradient(Z.x - hw, 0, Z.x + hw, 0); g.addColorStop(0, ash ? 'rgba(214,190,150,.92)' : 'rgba(205,150,100,.92)'); g.addColorStop(0.55, ash ? 'rgba(240,222,190,.92)' : 'rgba(236,190,140,.92)'); g.addColorStop(1, ash ? 'rgba(180,160,130,.92)' : 'rgba(170,110,70,.92)');
    c.fillStyle = g; c.fill(); c.lineWidth = 2; c.strokeStyle = DG_C.ink; c.stroke();
    c.strokeStyle = 'rgba(255,245,225,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(Z.x, Z.y - hh); c.lineTo(Z.x, Z.y + hh); c.moveTo(Z.x - hw, Z.y - hh + tip); c.lineTo(Z.x, Z.y - hh + tip * 1.6); c.lineTo(Z.x + hw, Z.y - hh + tip); c.stroke(); c.restore();
    const r = Z.cell * 0.34;
    for (let i = 0; i < DG_K.N1; i++) {
      const p = Z.atom(i); let st;
      if (!ash) st = s.at[i] ? 'U' : 'Pb'; else st = !s.seen || !s.seen[i] ? '?' : s.az[i] ? 'U' : 'Pb';
      c.beginPath(); c.arc(p[0], p[1], r, 0, TAU);
      if (st === 'U') { c.fillStyle = DG_C.rust; c.fill(); c.lineWidth = 1.5; c.strokeStyle = DG_C.ink; c.stroke(); c.fillStyle = 'rgba(255,220,180,.6)'; c.beginPath(); c.arc(p[0] - r * 0.3, p[1] - r * 0.3, r * 0.3, 0, TAU); c.fill(); }
      else if (st === 'Pb') { c.fillStyle = 'rgba(232,226,214,.9)'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = DG_C.slateD; c.stroke(); }
      else { c.fillStyle = 'rgba(120,110,100,.35)'; c.fill(); c.lineWidth = 1; c.setLineDash([2, 2]); c.strokeStyle = 'rgba(40,34,30,.6)'; c.stroke(); c.setLineDash([]); }
      const f = v.flash['a' + i] || v.flash['s' + i]; if (f) { c.strokeStyle = 'rgba(255,240,200,' + Math.min(1, f * 2).toFixed(2) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(p[0], p[1], r + (0.55 - f) * 30, 0, TAU); c.stroke(); }
    }
    if (typeof Lbl === 'undefined') return;
    const ly = Z.y - hh - 18;
    if (!ash) { Lbl.put('dg-T', Txt.f(L.myr, { n: Math.round(s.T) }), Z.x, Math.max(this.hudH() + 56, ly), { size: 20, c, mono: true, weight: 700 }); Lbl.put('dg-n', Txt.f(L.left, { n: s.n }), Z.x, Z.y + hh + 18, { size: 15, c, mono: true }); if (s.hold) Lbl.put('dg-fast', '▶▶', Z.x + hw + 8, Z.y, { size: 16, c, align: 'left', pill: false }); }
    else { Lbl.put('dg-ns', Txt.f(L.atoms, { n: s.ns || 0 }), Z.x, Math.max(this.hudH() + 56, ly), { size: 16, c, mono: true }); Lbl.put('dg-u', L.U + ' ' + (s.nu || 0), Z.x - hw * 0.55, Z.y + hh + 18, { size: 13, c, mono: true }); Lbl.put('dg-pb', L.Pb + ' ' + ((s.ns || 0) - (s.nu || 0)), Z.x + hw * 0.55, Z.y + hh + 18, { size: 13, c, mono: true }); }
  },

  /* ----- L2: two ash beds and two zircons ----- */
  drawBracket(c, w, h) {
    const s = this.sim.s, v = this.v, G = this.geo(), L = this.content.labels;
    this.cliffBg(c, w, h, 'gold', this.goldenScene);
    c.fillStyle = 'rgba(28,24,22,.45)'; c.fillRect(0, 0, w, h);
    // the section: sandstone with the fish between two ash beds; shale below, chalk above
    const x = G.cx, cw = G.cw, t = G.ct, b = G.cb;
    c.save(); rrect(c, x, t, cw, b - t, 8); c.clip();
    c.fillStyle = DG_C.chalk; c.fillRect(x, t, cw, (b - t) * 0.12);
    c.fillStyle = DG_C.ochre; c.fillRect(x, t + (b - t) * 0.12, cw, (b - t) * 0.7);
    c.fillStyle = DG_C.slate; c.fillRect(x, t + (b - t) * 0.82, cw, (b - t) * 0.18);
    c.fillStyle = 'rgba(80,50,20,.25)'; for (let k = 0; k < cw * (b - t) / 70; k++) { const px = x + (this.hash('s' + k) % 1000) / 1000 * cw, py = t + (b - t) * (0.12 + 0.7 * ((this.hash('t' + k) % 1000) / 1000)); c.fillRect(px, py, 1.5, 1.5); }
    for (let zi = 0; zi < 2; zi++) { const y = G.ashY[zi], glow = s.phase === 'free' && !s.z[zi].chip ? 0.5 + 0.5 * Det.sin(v.t * 5) : 0; c.fillStyle = DG_C.ash; c.fillRect(x, y - G.ashH / 2, cw, G.ashH); if (glow) { c.strokeStyle = 'rgba(255,236,190,' + glow.toFixed(2) + ')'; c.lineWidth = 3; c.strokeRect(x + 2, y - G.ashH / 2 - 2, cw - 4, G.ashH + 4); } c.fillStyle = 'rgba(40,40,40,.35)'; for (let k = 0; k < cw / 6; k++) c.fillRect(x + k * 6 + (this.hash('a' + k + zi) % 5), y - G.ashH / 2 + (this.hash('b' + k + zi) % Math.max(1, G.ashH | 0)), 1.5, 1.5); }
    if (typeof Rig !== 'undefined' && Rig.has && Rig.has('fossil')) Rig.draw(c, 'fossil', { kind: 'fish', lum: 0.82, wear: 0.1 }, x + cw / 2, G.fishY, { size: Math.min(cw * 0.7, (G.ashY[1] - G.ashY[0]) * 0.6) });
    c.restore(); c.strokeStyle = DG_C.ink; c.lineWidth = 1.5; rrect(c, x, t, cw, b - t, 8); c.stroke();
    // the two zircons, each beside its bed
    for (let zi = 0; zi < 2; zi++) {
      const Z = this.z2Geo(zi), z = s.z[zi], open = z.chip, k = v.anims.find(a => a.k === 'chip' && a.z === zi), sc = k ? Math.min(1, k.t / k.d) : open ? 1 : 0;
      c.strokeStyle = 'rgba(241,236,223,.5)'; c.setLineDash([3, 4]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + cw, G.ashY[zi]); c.lineTo(Z.x - Z.w / 2 - 4, Z.y); c.stroke(); c.setLineDash([]);
      if (!open && !k) { if (typeof Lbl !== 'undefined') Lbl.put('dg-hm' + zi, L.hammer, Z.x, Z.y, { size: 13, c }); continue; }
      c.save(); c.translate(Z.x, Z.y); c.scale(sc, sc); const hw = Z.w / 2, hh = Z.h / 2, tip = Z.w * 0.16;
      c.beginPath(); c.moveTo(0, -hh); c.lineTo(hw, -hh + tip); c.lineTo(hw, hh - tip); c.lineTo(0, hh); c.lineTo(-hw, hh - tip); c.lineTo(-hw, -hh + tip); c.closePath(); c.fillStyle = 'rgba(232,212,178,.92)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = DG_C.ink; c.stroke(); c.restore();
      if (sc < 1) continue;
      const r = Z.cell * 0.38, m = this.sim.mSpot();
      for (let i = 0; i < DG_K.spots; i++) {
        const p = Z.spot(i), u = z.sp[i];
        c.beginPath(); c.arc(p[0], p[1], r, 0, TAU);
        if (u < 0) { c.fillStyle = 'rgba(160,140,110,.35)'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(40,34,30,.45)'; c.stroke(); }
        else { c.fillStyle = 'rgba(232,226,214,.95)'; c.fill(); c.beginPath(); c.moveTo(p[0], p[1]); c.arc(p[0], p[1], r, -Math.PI / 2, -Math.PI / 2 + TAU * u / m); c.closePath(); c.fillStyle = DG_C.rust; c.fill(); c.lineWidth = 1.5; c.strokeStyle = DG_C.slateD; c.beginPath(); c.arc(p[0], p[1], r, 0, TAU); c.stroke(); }
        const f = v.flash['p' + zi + '_' + i]; if (f) { c.strokeStyle = 'rgba(255,236,190,' + Math.min(1, f * 3).toFixed(2) + ')'; c.lineWidth = 2; c.beginPath(); c.arc(p[0], p[1], r + (0.35 - f) * 24, 0, TAU); c.stroke(); }
      }
      if (typeof Lbl !== 'undefined') { const E = this.sim.zEst(z); Lbl.put('dg-zl' + zi, zi ? L.lower : L.upper, Z.x, Z.y - Z.h / 2 - 12, { size: 12, c }); if (E) Lbl.put('dg-ze' + zi, Math.round(E.t) + ' ± ' + Math.round(E.e), Z.x, Z.y + Z.h / 2 + 12, { size: 13, c, mono: true }); }
    }
    if (v.laser && s.phase === 'assay') { c.save(); c.strokeStyle = 'rgba(255,214,150,.85)'; c.lineWidth = 3; c.beginPath(); c.moveTo(w, this.hudH()); c.lineTo(v.laser.x, v.laser.y); c.stroke(); c.fillStyle = 'rgba(255,240,210,.9)'; c.beginPath(); c.arc(v.laser.x, v.laser.y, 6, 0, TAU); c.fill(); c.restore(); }
    if (s.phase === 'bracket' || s.phase === 'over') { const a = this.sim.zEst(s.z[0]), bb = this.sim.zEst(s.z[1]); if (a && bb && typeof Lbl !== 'undefined') Lbl.put('dg-br', Math.round(a.t - a.e) + '–' + Math.round(bb.t + bb.e) + ' Myr', x + cw / 2, G.fishY + Math.min(40, (G.ashY[1] - G.ashY[0]) * 0.35), { size: 14, c, mono: true }); }
  },

  /* ----- L3: the field map ----- */
  drawMap(c, w, h) {
    const s = this.sim.s, v = this.v, G = this.geo(), L = this.content.labels;
    c.fillStyle = '#2F3A40'; c.fillRect(0, 0, w, h);
    const g = c.createLinearGradient(0, G.my, 0, G.my + G.mh); g.addColorStop(0, DG_C.paper); g.addColorStop(1, DG_C.paperD); c.fillStyle = g; rrect(c, G.mx, G.my, G.mw, G.mh, 6); c.fill();
    c.save(); rrect(c, G.mx, G.my, G.mw, G.mh, 6); c.clip();
    c.fillStyle = 'rgba(86,96,108,.28)'; c.beginPath(); c.moveTo(G.mx + G.mw, G.my); for (let k = 0; k <= 10; k++) c.lineTo(G.mx + G.mw * (0.86 - 0.05 * Det.sin(k * 1.3)), G.my + G.mh * k / 10); c.lineTo(G.mx + G.mw, G.my + G.mh); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(94,72,40,.18)'; c.lineWidth = 1; for (let k = 1; k < 7; k++) { c.beginPath(); for (let x = 0; x <= G.mw; x += 12) c.lineTo(G.mx + x, G.my + G.mh * k / 7 + 6 * Det.sin(x * 0.03 + k)); c.stroke(); }
    const R = this.cropR(G);
    s.crops.forEach((cr, i) => {
      const p = this.cropXY(cr, G), sea = cr.env === 'sea', hov = v.sel === i && s.phase === 'pick';
      c.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, rr = R * (0.78 + 0.3 * ((this.hash('r' + i + k + cr.age) % 100) / 100)); c.lineTo(p[0] + rr * Det.cos(a) * 1.25, p[1] + rr * Det.sin(a) * 0.85); } c.closePath();
      c.fillStyle = sea ? '#8E9AA3' : '#D3A660'; c.fill(); c.lineWidth = hov ? 3 : 1.5; c.strokeStyle = DG_C.ink; c.stroke();
      c.save(); c.clip(); c.strokeStyle = sea ? 'rgba(40,52,62,.55)' : 'rgba(110,70,30,.55)'; c.lineWidth = 1.2; c.beginPath();
      if (sea) for (let yy = -R; yy < R; yy += 7) for (let xx = -R * 1.3; xx < R * 1.3; xx += 12) { c.moveTo(p[0] + xx, p[1] + yy); c.quadraticCurveTo(p[0] + xx + 3, p[1] + yy - 3, p[0] + xx + 6, p[1] + yy); }
      else { c.moveTo(p[0] - R * 1.2, p[1] - R * 0.2); c.bezierCurveTo(p[0] - R * 0.4, p[1] + R * 0.5, p[0] + R * 0.3, p[1] - R * 0.6, p[0] + R * 1.2, p[1] + R * 0.1); for (let k = 0; k < 20; k++) { const px = p[0] + ((this.hash('q' + i + k) % 200) / 100 - 1) * R, py = p[1] + ((this.hash('w' + i + k) % 200) / 100 - 1) * R * 0.7; c.moveTo(px + 0.9, py); c.arc(px, py, 0.9, 0, TAU); } }
      c.stroke(); c.restore();
      if (typeof Lbl !== 'undefined') { Lbl.put('dg-age' + i, Txt.f(L.myr, { n: cr.age }), p[0], p[1] - R * 0.15, { size: 13, c, mono: true }); Lbl.put('dg-env' + i, sea ? L.sea : L.river, p[0], p[1] + R * 0.95, { size: 12, c, pill: false, ink: DG_C.ink }); }
      if (cr.env === 'river' && (cr.age === 385 || cr.age === 365)) { const fk = cr.age === 385 ? 'fish' : 'bone'; c.save(); c.globalAlpha = 0.95; if (typeof Rig !== 'undefined' && Rig.has && Rig.has('fossil')) Rig.draw(c, 'fossil', { kind: fk, lum: 0.85, wear: 0 }, p[0] + R * 1.05, p[1] - R * 0.75, { size: 28 }); c.restore(); if (typeof Lbl !== 'undefined') Lbl.put('dg-pin' + i, cr.age === 385 ? L.lobe : L.tetra, p[0] + R * 1.05, p[1] - R * 1.35, { size: 12, c }); }
      const ds = s.digs.filter(d => d.o === i); ds.forEach((d, j) => { const fx = p[0] - R * 1.0 + j * 9, fy = p[1] - R * 0.7; c.strokeStyle = DG_C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(fx, fy + 14); c.lineTo(fx, fy - 6); c.stroke(); c.fillStyle = d.f === 'fishapod' ? DG_C.rust : DG_C.slate; c.beginPath(); c.moveTo(fx, fy - 6); c.lineTo(fx + 10, fy - 2); c.lineTo(fx, fy + 2); c.closePath(); c.fill(); });
    });
    c.restore(); c.strokeStyle = DG_C.ink; c.lineWidth = 2; rrect(c, G.mx, G.my, G.mw, G.mh, 6); c.stroke();
    if (s.phase === 'brush' || (s.phase === 'gap' && s.digs.length)) this.drawDig(c, w, h);
  },
  drawDig(c, w, h) {   // the dig square: sand over the find, cleared by brush strokes and by the season's patient work
    const s = this.sim.s, v = this.v, B = this.brushGeo(), d = s.digs[s.digs.length - 1], z = v.anims.find(a => a.k === 'zoom'), sc = z ? 0.6 + 0.4 * z.t / z.d : 1;
    c.save(); c.fillStyle = 'rgba(20,18,16,.55)'; c.fillRect(0, 0, w, h);
    c.translate(B.x + B.w / 2, B.y + B.h / 2); c.scale(sc, sc); c.translate(-(B.x + B.w / 2), -(B.y + B.h / 2));
    c.fillStyle = d.env === 'sea' ? '#9AA1A4' : '#C9A56C'; c.fillRect(B.x, B.y, B.w, B.h);
    const cx = B.x + B.w / 2, cy = B.y + B.h / 2, sz = B.w * 0.62, map = { fishapod: null, lobe: 'fish', tetra: 'bone', brach: 'brachiopod', plant: 'leaf', scales: 'tooth' };
    if (d.f === 'fishapod') this.fishapod(c, cx, cy, sz);
    else if (typeof Rig !== 'undefined' && Rig.has && Rig.has('fossil')) { const k = map[d.f]; Rig.draw(c, 'fossil', { kind: k, lum: 0.78, wear: d.f === 'scales' ? 0.7 : 0.1 }, cx, cy, { size: d.f === 'scales' ? sz * 0.35 : sz * 0.8 }); if (d.f === 'brach') Rig.draw(c, 'fossil', { kind: 'brachiopod', lum: 0.7, wear: 0.3 }, cx + sz * 0.3, cy + sz * 0.25, { size: sz * 0.4 }); }
    const N = 12, cw = B.w / N, ch = B.h / N, br = s.phase === 'brush' ? s.br : 1;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      const rank = (Math.abs(i - 5.5) + Math.abs(j - 5.5)) / 11 + ((this.hash('k' + i + j) % 100) / 100) * 0.15;
      if (v.cells[i + ',' + j] || rank < br * 1.15) continue;
      c.fillStyle = (i + j) % 2 ? '#B48E58' : '#BC9660'; c.fillRect(B.x + i * cw, B.y + j * ch, cw + 0.5, ch + 0.5);
    }
    c.strokeStyle = DG_C.ink; c.lineWidth = 2; c.strokeRect(B.x, B.y, B.w, B.h);
    c.strokeStyle = 'rgba(241,236,223,.6)'; c.lineWidth = 1; c.setLineDash([2, 6]); for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(B.x + B.w * k / 4, B.y); c.lineTo(B.x + B.w * k / 4, B.y + B.h); c.moveTo(B.x, B.y + B.h * k / 4); c.lineTo(B.x + B.w, B.y + B.h * k / 4); c.stroke(); } c.setLineDash([]);
    c.restore();
    if (s.phase === 'gap' && typeof Lbl !== 'undefined') Lbl.put('dg-find', this.content.finds[d.f], B.x + B.w / 2, B.y + B.h + 16, { size: 15, c, weight: 700 });
  },
  fishapod(c, x, y, sz) {   // a flat-headed lobe-finned fish with a neck and fin bones (a Tiktaalik-like in-between form), in stone relief
    c.save(); c.translate(x, y); const r = sz / 2;
    c.fillStyle = '#D9CDB3'; c.strokeStyle = DG_C.ink; c.lineWidth = 2;
    c.beginPath(); c.moveTo(r * 0.95, 0); c.quadraticCurveTo(r * 0.75, -r * 0.3, r * 0.35, -r * 0.24); c.quadraticCurveTo(-r * 0.3, -r * 0.2, -r * 0.95, -r * 0.05); c.lineTo(-r * 0.95, r * 0.05); c.quadraticCurveTo(-r * 0.3, r * 0.2, r * 0.35, r * 0.24); c.quadraticCurveTo(r * 0.75, r * 0.3, r * 0.95, 0); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(30,26,22,.55)'; c.lineWidth = 1.2; c.beginPath(); for (let i = 0; i < 10; i++) { const xx = r * 0.25 - i * r * 0.11; c.moveTo(xx, -r * 0.16); c.lineTo(xx - r * 0.04, r * 0.16); } c.moveTo(r * 0.35, -r * 0.24); c.lineTo(r * 0.35, r * 0.24); c.stroke();
    c.fillStyle = DG_C.ink; c.beginPath(); c.arc(r * 0.7, -r * 0.12, 2.2, 0, TAU); c.arc(r * 0.7, r * 0.12, 2.2, 0, TAU); c.fill();
    for (const [fx, fl] of [[r * 0.2, 1], [-r * 0.45, 0.7]]) for (const sg of [-1, 1]) {   // lobed fins: a fleshy fin round a chain of bones (upper arm, forearm, wrist)
      c.save(); c.translate(fx, sg * r * 0.2); c.rotate(sg * 0.9); c.fillStyle = '#CBBE9F'; c.strokeStyle = DG_C.ink; c.lineWidth = 1.5; c.beginPath(); c.ellipse(r * 0.17 * fl, 0, r * 0.2 * fl, r * 0.09 * fl, 0, 0, TAU); c.fill(); c.stroke();
      c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(r * 0.12 * fl, 0); c.moveTo(r * 0.12 * fl, -r * 0.02); c.lineTo(r * 0.22 * fl, -r * 0.03); c.moveTo(r * 0.12 * fl, r * 0.02); c.lineTo(r * 0.22 * fl, r * 0.03); for (let k = -1; k <= 1; k++) { c.moveTo(r * 0.24 * fl, k * r * 0.02); c.lineTo(r * 0.32 * fl, k * r * 0.05); } c.stroke(); c.restore(); }
    c.restore();
  },

  /* ----- L4: the deep-time ribbon at sunset ----- */
  drawRibbon(c, w, h) {
    const s = this.sim.s, v = this.v, G = this.geo(), L = this.content.labels;
    this.cliffBg(c, w, h, 'dusk', (cc, W, H) => { this.paintSky(cc, W, H * 0.62, ['#5A4A6A', '#C9775A', '#F0B47A']); cc.fillStyle = '#FFD9A0'; cc.beginPath(); cc.arc(W * 0.5, H * 0.62, Math.max(14, W * 0.04), Math.PI, TAU); cc.fill(); this.paintSea(cc, W, H * 0.62, H, W * 0.5); this.paintCliff(cc, 0, W * 0.28, H * 0.5, H, W * 0.06); });
    // the ribbon: deep time to the left, the last years to the right
    const g = c.createLinearGradient(G.rx0, 0, G.rx1, 0); g.addColorStop(0, DG_C.slateD); g.addColorStop(0.45, DG_C.ochreD); g.addColorStop(0.8, DG_C.ochre); g.addColorStop(1, DG_C.chalk);
    c.fillStyle = g; rrect(c, G.rx0, G.ry - G.rh / 2, G.rx1 - G.rx0, G.rh, G.rh / 2); c.fill(); c.strokeStyle = DG_C.ink; c.lineWidth = 1.5; c.stroke();
    const step = w < 520 ? 2 : 1;
    for (let e = 1; e <= 9; e++) { const x = G.X(e); c.strokeStyle = 'rgba(30,26,22,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, G.ry - G.rh / 2); c.lineTo(x, G.ry + G.rh / 2); c.stroke(); if ((e - 1) % step === 0 && typeof Lbl !== 'undefined') Lbl.put('dg-dec' + e, this.fmtY(dgYears(e)), x, G.ry + G.rh / 2 + 14, { size: 12, c }); }
    // your Wood's years, a tick at the young end
    const wx = G.X(Math.max(1, dgLog10(s.wood || 12))); c.strokeStyle = DG_C.chalk; c.lineWidth = 3; c.beginPath(); c.moveTo(wx, G.ry - G.rh); c.lineTo(wx, G.ry + G.rh); c.stroke();
    if (typeof Lbl !== 'undefined') Lbl.put('dg-wood', L.wood, wx + 4, G.ry - G.rh / 2 - 14, { size: 12, c, align: 'right' });
    // placed cards: pins, then truth after the halfway ask
    const showTruth = s.phase === 'bush' || s.phase === 'over' || (s.phase === 'ask' && false);
    const rowsR = [[], [], [], []], ys = [-1, -2, 2, 3], placed = s.order.slice(0, s.ci).filter(id => s.pl[id] != null).sort((a, b) => G.X(s.pl[a]) - G.X(s.pl[b])), rowOf = {};
    for (const id of placed) { const x = G.X(s.pl[id]), hw = this.content.cardShort[id].length * 3.6 + 12; let k = 0; while (k < 3 && rowsR[k].some(q => Math.abs(q - x) < hw + 40)) k++; rowsR[k].push(x); rowOf[id] = k; }
    if (typeof Lbl !== 'undefined') { const crowd = (rowsR[0].some(x => x < G.rx0 + 110) ? 1 : 0) + (rowsR[1].some(x => x < G.rx0 + 110) ? 1 : 0); Lbl.put('dg-earth', L.earth, G.rx0, G.ry - G.rh / 2 - 14 - crowd * 24 - (crowd ? 18 : 0), { size: 12, c, align: 'left' }); }
    placed.forEach(id => {
      const pv = s.pl[id], k = ys[rowOf[id]], yL = G.ry + Math.sign(k) * (G.rh + 18 + (Math.abs(k) - 1) * 24);
      const x = G.X(pv);
      c.strokeStyle = DG_C.chalk; c.lineWidth = 2; c.beginPath(); c.moveTo(x, G.ry); c.lineTo(x, yL); c.stroke();
      c.fillStyle = DG_C.rust; c.beginPath(); c.arc(x, G.ry, 5, 0, TAU); c.fill(); c.strokeStyle = DG_C.ink; c.lineWidth = 1.5; c.stroke();
      if (showTruth) { const tx = G.X(dgLog10(this.sim.card(id).t)); c.setLineDash([3, 3]); c.strokeStyle = DG_C.chalk; c.beginPath(); c.moveTo(tx, G.ry - G.rh * 0.9); c.lineTo(tx, G.ry + G.rh * 0.9); c.stroke(); c.setLineDash([]); }
      if (typeof Lbl !== 'undefined') Lbl.put('dg-pl' + id, this.content.cardShort[id], x, yL, { size: 12, c });
    });
    // the current card, or the bush
    if (s.phase === 'place') {
      const id = s.order[s.ci], cd = this.content.cards[id], d = v.drag, cx = d && !d.tapRibbon ? d.x : G.cardX, cy = d && !d.tapRibbon ? d.y : G.cardY;
      c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 10; c.fillStyle = DG_C.paper; rrect(c, cx - G.cardW / 2, cy - G.cardH / 2, G.cardW, G.cardH, 10); c.fill(); c.restore();
      c.strokeStyle = DG_C.rust; c.lineWidth = 2; rrect(c, cx - G.cardW / 2, cy - G.cardH / 2, G.cardW, G.cardH, 10); c.stroke();
      this.cardIcon(c, id, cx - G.cardW * 0.3, cy, Math.min(G.cardH * 0.7, 70));
      if (typeof Lbl !== 'undefined') { Lbl.put('dg-cn', cd[0], cx + G.cardW * 0.12, cy - G.cardH * 0.16, { size: 14, c, pill: false, ink: DG_C.ink, weight: 700 }); Lbl.put('dg-ca', cd[1], cx + G.cardW * 0.12, cy + G.cardH * 0.18, { size: 13, c, pill: false, ink: DG_C.ink, mono: true }); }
      const px = d ? d.x : (v.kv != null ? G.X(v.kv) : null);
      if (px != null && px >= G.rx0 && px <= G.rx1) { c.strokeStyle = 'rgba(241,236,223,.85)'; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(px, G.ry - G.rh); c.lineTo(px, d ? d.y : G.ry + 40); c.stroke(); c.setLineDash([]); if (typeof Lbl !== 'undefined') Lbl.put('dg-read', this.fmtY(dgYears(G.V(px))), px, G.ry - G.rh - 26, { size: 13, c, mono: true }); }
    } else if (s.phase === 'bush' || s.phase === 'over') this.drawBush(c, w, h, G);
  },
  cardIcon(c, id, x, y, sz) {
    const k = { zircon: null, trilo: 'trilobite', tik: null, impact: null, whale: 'bone', lucy: 'bone', irhoud: 'tooth', naledi: 'tooth' }[id];
    if (id === 'tik') { this.fishapod(c, x, y, sz); return; }
    if (id === 'zircon') { c.fillStyle = '#D9A87A'; c.strokeStyle = DG_C.ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y - sz * 0.45); c.lineTo(x + sz * 0.18, y - sz * 0.25); c.lineTo(x + sz * 0.18, y + sz * 0.25); c.lineTo(x, y + sz * 0.45); c.lineTo(x - sz * 0.18, y + sz * 0.25); c.lineTo(x - sz * 0.18, y - sz * 0.25); c.closePath(); c.fill(); c.stroke(); return; }
    if (id === 'impact') { c.fillStyle = DG_C.rust; c.beginPath(); c.arc(x, y, sz * 0.25, 0, TAU); c.fill(); c.strokeStyle = '#F2C27A'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x + sz * 0.2 + i * 4, y - sz * 0.2 - i * 6); c.lineTo(x + sz * 0.45 + i * 4, y - sz * 0.45 - i * 3); c.stroke(); } return; }
    if (typeof Rig !== 'undefined' && Rig.has && Rig.has('fossil')) Rig.draw(c, 'fossil', { kind: k, lum: 0.8, wear: 0.1 }, x, y, { size: sz });
  },
  drawBush(c, w, h, G) {   // hominin spans on a linear 0–4.2 Myr axis: several lived at once
    const v = this.v, k = Math.min(1, v.bushT / 1.2), y0 = G.ry + G.rh + 104, y1 = G.bot - 10, x0 = 24, x1 = w - 24, X = t => x0 + (4.2e6 - t) / 4.2e6 * (x1 - x0), rows = DG_HOM.length, rh = Math.min(30, (y1 - y0) / (rows + 0.5));
    c.save(); c.globalAlpha = k; c.fillStyle = 'rgba(28,24,22,.6)'; rrect(c, x0 - 10, y0 - 22, x1 - x0 + 20, rows * rh + 40, 10); c.fill();
    DG_HOM.forEach((hm, i) => { const y = y0 + i * rh, a = X(hm[1]), b = X(hm[2]); c.fillStyle = hm[0] === 'sap' ? DG_C.chalk : DG_C.ochre; rrect(c, a, y, Math.max(6, b - a), rh * 0.55, 4); c.fill(); if (typeof Lbl !== 'undefined') Lbl.put('dg-hm' + i, this.content.hominins[hm[0]], Math.min(a, x1 - 80), y + rh * 0.28 - 12, { size: 12, c, align: 'left', pill: false, ink: DG_C.chalk }); });
    const x3 = X(3e5); c.strokeStyle = DG_C.rust; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(x3, y0 - 14); c.lineTo(x3, y0 + rows * rh); c.stroke(); c.setLineDash([]);
    if (typeof Lbl !== 'undefined') { Lbl.put('dg-300', Txt.f(this.content.labels.kyr, { n: 300 }), x3, y0 - 14, { size: 12, c }); Lbl.put('dg-4m', Txt.f(this.content.labels.myr, { n: 4 }), x0 + 14, y0 + rows * rh + 8, { size: 12, c, pill: false, ink: DG_C.chalk }); }
    c.restore();
  },

  /* ---------- the live strip (notes() is the LiveGraph data provider) ---------- */
  notes() {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    const D = this.content.data, sim = this.sim, n = s.level, stats = [], row = (d, o) => stats.push([d[0], Txt.f(d[1], o), d[2] ? Txt.f(d[2], o) : '']);
    if (n === 0) { const nb = s.layers.length * 8 || 0; row(D.buried, { a: sim.buried(s) + (s.phase === 'epoch' ? s.an.filter(a => a.b).length : 0), b: nb + (s.phase === 'epoch' ? 8 : 0), s: sim.softStill(s) }); if (s.phase === 'ask') row(D.keep, {}); if (s.kept != null && s.phase !== 'uplift') row(D.kept, { a: s.kept, b: 48 }); return { stats, charts: [this.shareSpec(), this.epochSpec()] }; }
    if (n === 1) { row(D.left, { n: s.n, t: Math.round(s.T) }); if (s.ns) { row(D.tested, { n: s.ns, u: s.nu, p: s.ns - s.nu }); if (s.ns >= 4) row(D.est, { t: Math.round(sim.ashEst(s)), e: Math.round(sim.ashErr(s)) }); } return { stats, charts: [this.decaySpec()] }; }
    if (n === 2) { for (let zi = 0; zi < 2; zi++) { const E = sim.zEst(s.z[zi]); if (E) row(zi ? D.zlo : D.zup, { t: Math.round(E.t), e: Math.round(E.e), n: s.z[zi].n }); } row(D.spots, { a: s.used, b: DG_K.budget }); return { stats, charts: [this.agesSpec(), this.errSpec()] }; }
    if (n === 3) { row(D.seasons, { a: s.digs.length, f: sim.fishapods(s) }); return { stats, charts: [this.fossilSpec()] }; }
    row(D.placed, { a: s.ci, b: sim.goodCards(s) });
    return { stats, charts: s.phase === 'bush' || s.phase === 'over' ? [this.earthSpec(), this.bushSpec()] : [this.earthSpec()] };
  },
  shareSpec() {
    const s = this.sim.s, D = this.content.data, sim = this.sim, bur = (sim.buried(s) + (s.phase === 'epoch' ? s.an.filter(a => a.b).length : 0)) / 48, rows = [{ y: 2, lo: 0, hi: bur, style: 'solid', label: D.lines.buried }], vlines = [];
    if (s.kept != null && s.phase !== 'uplift') rows.push({ y: 1, lo: 0, hi: s.kept / 48, style: 'hatched', label: D.lines.kept });
    if (s.hits.k1 !== undefined) vlines.push({ x: s.exp.k1, dash: true, label: D.lines.expected });
    return { type: 'dg_xy', title: D.titles.share, x: { lo: 0, hi: 0.6, fmt: 'pct', label: D.ax.share }, y: { lo: 0, hi: 3 }, noY: true, frame: 'designed', rows, vlines };
  },
  epochSpec() {
    const s = this.sim.s, D = this.content.data, bars = [], dots = [];
    s.layers.forEach((L, i) => { const b = L.a.filter(a => a.b).length; bars.push({ x: i + 1, y: 8, style: 'hollow', w: 0.32 }, { x: i + 1, y: b, style: L.gone && s.phase !== 'uplift' ? 'hatched' : 'solid', w: 0.32 }); if (s.kept != null && s.phase !== 'uplift') dots.push({ x: i + 1, y: L.gone ? 0 : L.a.filter(a => a.f).length, shape: L.gone ? 'ring' : 'disc' }); });
    return { type: 'dg_xy', title: D.titles.epochs, fold: false, x: { lo: 0.4, hi: 6.6, label: D.ax.epoch, fmt: 'int' }, xticks: [1, 2, 3, 4, 5, 6], y: { lo: 0, hi: 8, label: D.ax.n }, frame: 'designed', bars, dots, dotLabel: dots.length ? D.lines.kept : null };
  },
  decaySpec() {
    const s = this.sim.s, D = this.content.data, sim = this.sim, steps = [], lines = [], hlines = [], vlines = [], rows = [];
    const pts = []; let prev = DG_K.N1; for (const [T, n] of s.tr) { pts.push([T, prev], [T, n]); prev = n; } pts.push([Math.min(2400, s.T), prev]); steps.push({ pts, w: 3, label: D.lines.yours });
    if (s.hits.a1 !== undefined || s.phase !== 'run' && s.phase !== 'ask' || (s.phase === 'ask' && s.ask.id === 'a2')) { const c = []; for (let T = 0; T <= 2400; T += 60) c.push([T, DG_K.N1 * Det.exp(-DG_K.LN2 * T / DG_K.half)]); lines.push({ pts: c, dash: true, label: D.lines.curve }); }
    if (s.ns >= 1) hlines.push({ y: DG_K.N1 * s.nu / s.ns, label: D.lines.ash });
    let you = null; if (s.hits.a2 !== undefined) { const e = sim.ashEst(s), er = sim.ashErr(s), y = DG_K.N1 * s.nu / s.ns; you = { x: e, y, label: D.lines.you }; rows.push({ y, lo: Math.max(0, e - er), hi: Math.min(2400, e + er), style: 'bar' }); vlines.push({ x: s.tA, dash: true, label: D.lines.lab }); }
    return { type: 'dg_xy', title: D.titles.decay, x: { lo: 0, hi: 2400, label: D.ax.myr }, y: { lo: 0, hi: 64, label: D.ax.left }, frame: 'designed', steps, lines, hlines, vlines, rows, you };
  },
  agesSpec() {
    const s = this.sim.s, D = this.content.data, L = this.content.labels, sim = this.sim, rows = [], vlines = [], a = sim.zEst(s.z[0]), b = sim.zEst(s.z[1]);
    if (a) rows.push({ y: 2.5, lo: a.t - a.e, hi: a.t + a.e, mid: a.t, style: 'bar', label: L.upper });
    if (b) rows.push({ y: 0.5, lo: b.t - b.e, hi: b.t + b.e, mid: b.t, style: 'bar', label: L.lower });
    if (a && b && (s.phase === 'bracket' || s.phase === 'over')) { rows.push({ y: 1.5, lo: Math.min(a.t - a.e, b.t + b.e), hi: Math.max(a.t - a.e, b.t + b.e), style: 'hatched', label: L.fish }); vlines.push({ x: s.z[0].t, dash: true }, { x: s.z[1].t, dash: true, label: D.lines.truth }); }
    return { type: 'dg_xy', title: D.titles.ages, x: { lo: 280, hi: 500, rev: true, label: D.ax.age }, y: { lo: 0, hi: 3 }, noY: true, frame: 'designed', rows, vlines };
  },
  errSpec() {
    const s = this.sim.s, D = this.content.data, zi = s.b1z != null ? s.b1z : (s.z[0].n >= s.z[1].n ? 0 : 1), z = s.z[zi], yHi = s.b1e ? Math.ceil(s.b1e * 2) : 160, dots = z.hist.filter(q => q[0] >= 120).map(q => ({ x: q[0], y: q[1], shape: 'disc' })), lines = [];
    if (s.hits.b1 !== undefined && s.b1e) { const c = []; for (let n = 160; n <= 2800; n += 80) c.push([n, s.b1e * Math.sqrt(DG_K.b1At / n)]); lines.push({ pts: c, dash: true, label: D.lines.law }); }
    return { type: 'dg_xy', title: D.titles.err, fold: false, x: { lo: 0, hi: 2800, label: D.ax.atoms }, y: { lo: 0, hi: yHi, label: D.ax.err }, frame: 'designed', dots, lines, vlines: s.ask && s.ask.id === 'b1' ? [{ x: 1600, dash: true }] : [], dotLabel: dots.length ? D.lines.yours : null };
  },
  fossilSpec() {
    const s = this.sim.s, D = this.content.data, L = this.content.labels, rows = [{ y: 2.5, lo: 383, hi: 388, style: 'solid', label: L.lobe }, { y: 0.5, lo: 360, hi: 367, style: 'solid', label: L.tetra }], dots = [], vlines = [];
    for (const d of s.digs) { if (d.f === 'fishapod') dots.push({ x: 375, y: 1.5, shape: 'disc' }); if (d.f === 'lobe') dots.push({ x: d.age, y: 2.5, shape: 'square' }); if (d.f === 'tetra') dots.push({ x: d.age, y: 0.5, shape: 'square' }); }
    if (s.hits.p1 !== undefined) vlines.push({ x: 375, dash: true, label: D.lines.expected });
    return { type: 'dg_xy', title: D.titles.fossils, x: { lo: 340, hi: 420, rev: true, label: D.ax.mya }, y: { lo: 0, hi: 3 }, noY: true, frame: 'designed', rows, dots, vlines };
  },
  earthSpec() {
    const s = this.sim.s, D = this.content.data, sim = this.sim, dots = [], vlines = [];
    s.order.slice(0, s.ci).forEach(id => { if (s.pl[id] != null) dots.push({ x: s.pl[id], y: 1.5, shape: 'disc' }); });
    if (s.hits.d1 !== undefined) { vlines.push({ x: dgLog10(2.27e9), dash: true, label: D.lines.half }); s.order.forEach(id => dots.push({ x: dgLog10(sim.card(id).t), y: 0.7, shape: 'ring' })); }
    return { type: 'dg_xy', title: D.titles.earth, x: { lo: DG_K.lo, hi: DG_K.earth, rev: true, fmt: 'log', label: D.ax.log }, xticks: [1, 3, 5, 7, 9], y: { lo: 0, hi: 2.5 }, noY: true, frame: 'designed', dots, vlines, dotLabel: dots.length ? D.lines.placed : null };
  },
  bushSpec() {
    const D = this.content.data, H = this.content.hominins, rows = DG_HOM.map((hm, i) => ({ y: DG_HOM.length - i - 0.5, lo: hm[2] / 1e6, hi: hm[1] / 1e6, style: 'solid', label: H[hm[0]] }));
    return { type: 'dg_xy', title: D.titles.bush, fold: false, side: true, x: { lo: 0, hi: 4.2, rev: true, label: D.ax.mya }, y: { lo: 0, hi: DG_HOM.length }, noY: true, frame: 'real', source: 'dirks2017, hublin2017', rows, vlines: [{ x: 0.3, dash: true }] };
  },
  cardSpec() { const n = this.level, s = this.sim.s; if (n === 0) return s.whatif ? this.shareSpec() : this.epochSpec(); if (n === 1) return this.decaySpec(); if (n === 2) return this.agesSpec(); if (n === 3) return this.fossilSpec(); return this.bushSpec(); }
};
V2.push(CH_DIG_V2);

/* ---------- dg_xy: one XY chart for the unit — bars, range rows, dashed expectations, your staircase and dots; log or reversed x ---------- */
const dgFmtX = (f, v) => f === 'log' ? CH_DIG_V2.fmtY(dgYears(v)) : wgFmt(f, v);
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.dg_xy) LiveGraph.T.dg_xy = {
  lay(w, h, spec, T, c) {
    const labels = (spec.lines || []).map(l => l.label).concat((spec.vlines || []).map(l => l.label), (spec.hlines || []).map(l => l.label), spec.dotLabel ? [spec.dotLabel] : [], (spec.steps || []).map(l => l.label));
    const G = wgXY(w, h, spec, T, c, { xlo: spec.x.lo, xhi: spec.x.hi, ylo: spec.y.lo, yhi: spec.y.hi, labels });
    if (spec.x.rev) { const p = G.plot, xs = G.xs; G.X = v => p.x + (xs.hi - v) / (xs.hi - xs.lo) * p.w; G.ix = px => xs.hi - (px - p.x) / p.w * (xs.hi - xs.lo); }
    return G;
  },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, ends = [], fx = spec.x.fmt;
    wgAxes(c, G, spec, T, { noY: !!spec.noY, xticks: spec.xticks, xfmt: v => dgFmtX(fx, v) });
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip(); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const b of spec.bars || []) { const bw = b.w || 0.3, x0 = G.X(b.x - bw), x1 = G.X(b.x + bw), y = G.Y(b.y), yb = G.Y(spec.y.lo), a = Math.min(x0, x1), ww = Math.abs(x1 - x0); if (b.style === 'hollow') { c.lineWidth = 1.5; c.strokeStyle = wgRgba(I.text, 0.6); c.strokeRect(a, y, ww, yb - y); } else if (b.style === 'hatched') wgHatch(c, a, y, ww, yb - y, wgRgba(I.text, 0.7), 4, 1); else { c.fillStyle = wgRgba(I.text, 0.8); c.fillRect(a, y, ww, yb - y); } }
    const rh = Math.max(8, Math.min(18, p.h / 6));
    for (const r of spec.rows || []) {
      const a = G.X(r.lo), b = G.X(r.hi), x0 = Math.min(a, b), ww = Math.max(3, Math.abs(b - a)), y = G.Y(r.y);
      if (r.style === 'bar') { c.strokeStyle = I.text; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + ww, y); c.moveTo(x0, y - rh / 2); c.lineTo(x0, y + rh / 2); c.moveTo(x0 + ww, y - rh / 2); c.lineTo(x0 + ww, y + rh / 2); c.stroke(); if (r.mid != null) { c.fillStyle = I.text; c.beginPath(); c.arc(G.X(r.mid), y, 4 * T.k, 0, TAU); c.fill(); } }
      else if (r.style === 'hatched') { wgHatch(c, x0, y - rh / 2, ww, rh, wgRgba(I.text, 0.75), 4, 1); c.lineWidth = 1; c.strokeStyle = I.text; c.strokeRect(x0, y - rh / 2, ww, rh); }
      else { c.fillStyle = wgRgba(I.text, 0.8); c.fillRect(x0, y - rh / 2, ww, rh); }
      if (r.label && !T.compact) { const lw = wgW(c, r.label, G.tk, 'b', 600); if (spec.side && x0 - p.x > lw + 8) wgText(c, r.label, x0 - 6, y, G.tk, I.text2, { align: 'right', fam: 'b', wt: 600, halo: I.surface }); else if (spec.side && p.x + p.w - (x0 + ww) > lw + 8) wgText(c, r.label, x0 + ww + 6, y, G.tk, I.text2, { align: 'left', fam: 'b', wt: 600, halo: I.surface }); else wgText(c, r.label, Math.min(Math.max(p.x + 4, x0), p.x + p.w - 4), y - rh / 2 - G.tk * 0.6, G.tk, I.text2, { align: x0 > p.x + p.w * 0.6 ? 'right' : 'left', fam: 'b', wt: 600, halo: I.surface }); }
    }
    for (const l of spec.vlines || []) { const x = G.X(l.x); c.lineWidth = l.dash ? 2 : 1; c.strokeStyle = wgRgba(I.text, l.dash ? 0.8 : 0.4); c.setLineDash(l.dash ? [5, 4] : []); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); if (l.label) ends.push({ y: p.y + G.tk, text: l.label, col: I.text, dash: true }); }
    for (const l of spec.hlines || []) { const y = G.Y(l.y); c.lineWidth = 1.5; c.setLineDash([]); c.strokeStyle = wgRgba(I.text, 0.7); c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke(); if (l.label) ends.push({ y, text: l.label, col: I.text, role: 'ink' }); }
    c.setLineDash([6, 4]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text;
    for (const l of spec.lines || []) { if (!l.pts || !l.pts.length) continue; c.beginPath(); l.pts.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); const q = l.pts[l.pts.length - 1]; if (l.label) ends.push({ y: G.Y(q[1]), text: l.label, col: I.text, dash: true }); }
    c.setLineDash([]);
    for (const st of spec.steps || []) { if (!st.pts || !st.pts.length) continue; c.lineWidth = (st.w || 2) * T.k; c.strokeStyle = I.text; c.beginPath(); st.pts.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); const q = st.pts[st.pts.length - 1]; wgMark(c, 'ink', G.X(q[0]), G.Y(q[1]), 3.5 * T.k, I.text, I.surface); if (st.label) ends.push({ y: G.Y(q[1]), text: st.label, col: I.text, role: 'ink' }); }
    for (const d of spec.dots || []) { const x = G.X(d.x), y = G.Y(d.y), r = 4 * T.k; c.beginPath(); if (d.shape === 'square') c.rect(x - r, y - r, 2 * r, 2 * r); else c.arc(x, y, r, 0, TAU); if (d.shape === 'ring') { c.lineWidth = 2; c.strokeStyle = I.text; c.stroke(); } else { c.fillStyle = I.text; c.fill(); c.lineWidth = 1; c.strokeStyle = I.surface; c.stroke(); } }
    c.restore();
    const dl = (spec.dots || []).length && spec.dotLabel ? spec.dots[spec.dots.length - 1] : null; if (dl) ends.push({ y: G.Y(dl.y), text: spec.dotLabel, col: I.text, role: 'ink' });
    wgEnds(c, G, ends, T); if (spec.you) wgYou(c, G, spec.you, T, 'x');
  },
  rows(spec) {
    const fx = spec.x && spec.x.fmt, out = [];
    for (const r of spec.rows || []) out.push([r.label || 'range', dgFmtX(fx, r.lo) + ' – ' + dgFmtX(fx, r.hi), r.mid != null ? dgFmtX(fx, r.mid) : '']);
    for (const b of spec.bars || []) out.push([b.style === 'hollow' ? 'lived' : 'buried', dgFmtX(fx, b.x), wgFmt(null, b.y)]);
    for (const d of spec.dots || []) out.push([spec.dotLabel || 'point', dgFmtX(fx, d.x), wgFmt(null, d.y)]);
    for (const l of spec.lines || []) for (const q of (l.pts || []).filter((q0, i) => i % 6 === 0)) out.push([(l.label || 'expected') + ' (expected)', dgFmtX(fx, q[0]), wgFmt(null, q[1])]);
    for (const l of spec.vlines || []) if (l.label) out.push([l.label, dgFmtX(fx, l.x), '']);
    return { head: ['series', (spec.x && spec.x.label) || 'x', (spec.y && spec.y.label) || 'y'], rows: out };
  },
  say(spec) { return ((spec.rows || []).length + (spec.dots || []).length + (spec.bars || []).length) + ' marks' + ((spec.lines || []).length ? ', ' + spec.lines.map(l => l.label).filter(Boolean).join(', ') : ''); }
};

/* ---------- the learning layer (D5 §3 item 12): new id, so only the v2 entries; untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.dig = DG_TEXT.take;
  MODEL.dig = 'A Devonian sea floor buried by your floods, then a cliff read with a hammer, a laser and a brush: preservation bias, erosion gaps, uranium–lead dating with counting error, a predicted in-between form, and deep time on a log ribbon.';
  RECALL.dig = { q: 'A zircon has lost half its uranium-235. How long until only a quarter is left?', opts: [['one', 'One more half-life'], ['half', 'Half a half-life'], ['two', 'Two more half-lives']], ans: 'one', why: 'Each half-life halves whatever is left: half of a half is a quarter.' };
  BRIDGE.dig = 'In the Lichen Wood you watched selection over a few generations. Here the rocks keep a record of millions of years.';
}
