/* ================= v2/arch.js: The Archipelago (id 'arch'), the Wave 2 rebuild =================
   D3 §4.8 and D2 §4, cut down by D6 decision 9 (simple: one verb, four levels, one prediction) and decision 10 (real birds,
   real seeds). D6 decision 7: its own world, the Galápagos from above at golden hour: tuff and lava, prickly pears, caltrop
   mats, a cobalt sea, sunset light; Darwin's finches whose beaks visibly deepen or slim.
   Role: the environment. The player is the climate: HOLD on an island to rain on it; let the season end dry for a drought.
   Rain grows small soft seeds and lets the finches breed; a drought leaves only the island's lasting seeds, so beaks that
   handle them survive. One verb, four ideas:
     L1 The drought: selection plus inheritance (R = h²S; Boag and Grant 1981; Grant and Grant 2002).
     L2 Three islands: one founding flock, three seed niches, three beaks (adaptive radiation).
     L3 Neighbours: with large ground finches on Daphne, a drought now SLIMS beaks (character displacement; Grant and
        Grant 2006). The one prediction (the aha) is here, and it inverts L1.
     L4 Big Bird: an immigrant male founds a lineage that mates within itself by song (Lamichhaney et al. 2018).
   Headless sim (R() and Det only); stars read the expectation or the final state; juice from Sim.run's events only. */

const ARC_X = [];   // seed sizes, as the beak depth (mm) that handles each best: 5 to 17 mm in half-millimetre bins
for (let k = 0; k <= 24; k++) ARC_X.push(5 + k * 0.5);
// model constants (MODEL card): utilisation width W (legacy), h² (Boag 1983), phenotypic variance (sd 0.9 mm), the
// survival curve (h, s0), smaller birds need less food (needk), rain thresholds (mm), seed per mm of rain, rain rate when held
const ARC_M = { W: 1.5, h2: 0.8, VP: 0.81, h: 0.7, s0: 0.92, needk: 0.5, wet: 50, boom: 150, rmax: 250, perMM: 2, rate: 110, rateU: 55, assort: 0.95, magW: 2 };
// islands: lasting seeds [peak (mm), sd, food in bird-years], the breeding cap; 'daphne04' has more small-seeded plants (after 1983)
const ARC_ISL = {
  daphne77: { last: [[12, 1.2, 22], [10.5, 1.0, 4], [7.5, 1.0, 2]], cap: 120 },
  daphne81: { last: [[12, 1.2, 30], [10.5, 1.0, 4], [7.5, 1.0, 2]], cap: 120 },
  daphne04: { last: [[12, 1.2, 20], [10.5, 1.0, 2], [7.5, 1.0, 22]], cap: 120 },
  grass: { last: [[7.5, 1.0, 22]], cap: 60 },
  cactus: { last: [[10, 1.0, 22]], cap: 60 },
  lava: { last: [[12.5, 1.1, 22]], cap: 60 }
};
// levels: islands, founders, starting beak, rounds, the first year's label and step, large ground finches, Big Bird
const ARC_LV = [
  { isl: ['daphne77'], n0: [100], mu: [9.4], years: 6, y0: 1, step: 1, mag: 0, levers: ['noh2', 'allrain'] },
  { isl: ['grass', 'cactus', 'lava'], n0: [30, 30, 30], mu: [10, 10, 10], years: 8, y0: 1, step: 1, mag: 0, mig: 1, levers: ['mix', 'noh2'] },
  { isl: ['daphne04'], n0: [100], mu: [9.6], years: 6, y0: 2003, step: 1, mag: 60, ask: true, levers: ['nomag', 'noh2'] },
  { isl: ['daphne81'], n0: [70], mu: [9.4], years: 10, y0: 1981, step: 3, mag: 12, big: true, forced: 7, extra: 0.85, famCap: 30, levers: ['random'] }
];
const ARC_PLAN4 = [250, 250, 250, 250, 250, 250, 250, 250, 250, 250];   // the expert's level 4 weather (oracle and What if? without a log)
const ARC_FOUNDER = 3;   // the immigrant lived and bred for years (history): he survives the first rounds
const ARC_DRY4 = 30;   // the forced 2002 drought still has a little rain (mm), too little for breeding
const ARC_T = { season: 3.4, season2: 5, forced: 1.4, feed: 2.4, breed: 1.8, tally: 1.5, end: 1.4, ask: 0 };
const ARC_GOAL = { d1: 0.5, n1: 20, spread: 2.0, n2: 10, d3: 0.2, n3: 15, n4: 10, g4: 5 };
// the world's paints (D6 decision 7): Daphne's brown tuff, lava black, cobalt sea, cactus green, sunset orange; finches charcoal
// with a low-sun rim light (so they read on any ground), large ground finches drawn in the brown of females and young
const ARC_C = {
  sea0: '#163F78', sea1: '#2463A6', sea2: '#3C82BF', glint: '#F6B25A', sun: '#FFC66B', sky: '#F2A65A', foam: '#E9F1F4',
  lava: '#1D1A1A', lava2: '#2E2725', tuffA: '#6F5640', tuffB: '#9A7B5A', crater: '#5A4534', rimL: 'rgba(255,206,140,.85)', rust: '#6B3A26', tuff: '#8A6A4A', sand: '#E7CF9E', sandD: '#C7A86F',
  cactus: '#4F7F3A', cactusD: '#2F5524', pear: '#C9473A', shrub: '#5D7D32', shrubD: '#3B5520', flower: '#F2C230', green: '#7DB24A',
  dry: '#9C7A4E', bird: '#262220', birdB: '#5B4634', belly: '#7A6A58', beak: '#2A2420', beakL: '#8C7A64', chick: '#9C8770',
  mag: '#7A5C42', magB: '#C8B08A', famB: '#43362C', big: '#F3E6C4', cloud: '#E8E6E2', cloudD: '#9DA3AB', rain: '#CFE3F2', ink: '#1B1612', paper: '#FBF4E4',
  seed: '#E8D9A8', caltrop: '#7A5A32'
};

const ARC_TEXT = {
  intro: {
    game: 'You are the weather over the Galápagos. Darwin’s finches live on the islands, eating seeds they can crack.',
    biology: 'Droughts leave only big, hard seeds, so beaks that crack them survive. Chicks inherit their parents’ beaks, so the population’s beaks change.',
    how: 'Hold on an island to rain: seeds grow and finches breed. Press End season with no rain for a drought, and reach each level’s goal.'
  },
  firstWords: 'Hold on the island to rain: seeds grow and finches breed. Press End season with no rain for a drought.',
  hud: {
    s0: 'Year {y} of {n}. Goal: beaks 0.5 mm deeper, 20 finches left.',
    s1: 'Year {y} of {n}. Hold an island to rain. Split the beaks 2 mm.',
    s2: 'Year {y} of {n}. Large ground finches share Daphne now. Try a drought.',
    s3: '{yr}. Keep the Big Bird family alive. Rain lets it breed.',
    raining: 'Raining: {mm} mm. Over 50 mm, finches breed.',
    forced: '{yr}: a long drought. No rain can fall this time.',
    ask: 'A drought, with big finches here. Which medium ground finches survive best?',
    dry0: 'Drought. Small seeds run out; deep beaks crack the caltrops.',
    dry1: 'Dry islands keep only their own lasting seeds.',
    dry2: 'Drought. Big finches crack the caltrops; small seeds are left.',
    wet: 'A wet year: seeds for every beak.',
    breed: 'Chicks hatch. Their beaks resemble their parents’ beaks.',
    nobreed: 'No rain, no chicks this year.',
    rule: 'Chicks inherit 80% of the survivors’ edge: R = h² × S.',
    tally: 'Average beak now {m} mm.',
    tally1: 'Beaks: {a}, {b} and {c} mm.',
    tally3: 'The Big Bird family: {n} birds, generation {g}.',
    auto: 'What if? Your weather again, with one thing changed.',
    over: 'The level is done.'
  },
  whispers: {
    wet: 'Over 50 mm: they will breed.', boom: 'A very wet year!', dry: 'A drought year.', crash: 'Few finches left!',
    hit: 'You called it.', miss: 'Not this time.', lost: 'An island emptied!', gone: 'The family is gone.', song: 'Song keeps them together.', ff: 'Faster.'
  },
  labels: {
    rain: 'rain', mm: '{mm} mm', wetLine: 'breeds', avg: 'average beak', was: 'start', you: 'you', grass: 'Grass isle', cactus: 'Cactus isle', lava: 'Caltrop isle',
    daphne: 'Daphne Major', mag: 'large ground finch', big: 'Big Bird', family: 'Big Bird family',
    sMeaning: 'survivors', rMeaning: 'chicks', seeds: '{x} mm seeds', deep: 'Deep beaks', none: 'No change', slim: 'Slim beaks', end: 'End season', faster: 'Faster',
    year: 'year', beak: 'beak (mm)', count: 'birds', avgBeak: 'Average beak', tBeaks: 'Beak depths', tAvg: 'Average beak', tIsl: 'Island beaks', tFam: 'Big Bird family',
    surv: 'survived', died: 'died', chicks: 'chicks', fortis: 'medium ground', famLine: 'family', xN: '×3 years', sBeak: 'Average beak', sBirds: 'Finches', sYear: 'Year',
    sSpread: 'Beak spread', sFam: 'Family birds', sGen: 'Generation', drought: 'drought', jackpot: 'Goal reached!'
  },
  panels: [],
  interesting: {
    crash: 'Only {n} finches were left. Droughts select hard, but back-to-back droughts empty the island.',
    flat: 'No drought, so no selection: wet years feed every beak alike.',
    lost: 'One island fell to {n} finches. Too many droughts there, too few wet years.',
    wet: 'No drought came, so the big finches never competed for the last seeds.',
    gone: 'The family died out. A small lineage can vanish in one bad drought.',
    pair: 'The drought left {k} of the family. Real Big Birds fell to one brother and sister.'
  },
  levers: { noh2: 'No inheritance', allrain: 'Every year wet', mix: 'Many migrants', nomag: 'No big finches', random: 'Mate at random' },
  whatifBody: {
    noh2: 'The same weather, but chicks’ beaks ignore their parents’: the average moved {d} mm, not {p} mm. Selection needs inheritance.',
    allrain: 'Every year wet: the average moved {d} mm, not {p} mm. Without a drought, nothing selects.',
    mix: 'With eight migrants a year, the beak spread ended at {d} mm, not {p} mm. Gene flow blurs islands.',
    nomag: 'The same weather without large ground finches: the average moved {d} mm, not {p} mm.',
    random: 'Mating at random: the family’s beaks ended {d} mm above medium ground finches’, not {p} mm. Song kept them apart.'
  },
  take: 'Weather sets the seeds, the seeds set which beaks survive, and neighbours change which seeds are left.',
  body: 'Droughts selected beaks that fit the lasting seeds, and wet years let survivors breed. Different islands made different beaks. A competitor reversed the push. Your Big Bird family reached generation {g} with {n} birds. Its beaks were {d} mm deeper than medium ground finches’.',
  law: { title: 'Seeds shape beaks' },
  boss: { inverts: 'In level 1 droughts deepened beaks. With big finches here, droughts slim them.' },
  stars: {
    discover: 'Shift the beaks as the goal asks, in two of the first three levels.',
    predict: 'Call which beaks survive the drought with big finches.',
    transfer: 'Bring the Big Bird family through the drought to generation 5.'
  },
  levelStars: [
    { discover: 'Deepen the average beak by 0.5 mm with 20 finches left.' },
    { discover: 'Spread the island beaks 2 mm apart, every island keeping 10 finches.' },
    { discover: 'Slim the beaks 0.2 mm through a drought, with 15 finches left.', predict: 'Call which beaks survive the drought.' },
    { transfer: 'Reach generation 5 with at least 10 family birds.' }
  ],
  levelTake: [
    'Evolution needs both: droughts select the beaks, wet years let the survivors breed.',
    'One flock, three islands, three foods: three beaks. That is adaptive radiation.',
    'The same drought, the opposite push: a competitor changed which seeds were left.'
  ],
  levelBody: [
    'The average beak moved {d} mm in {n} years. In your hardest drought, survivors’ beaks were {s} mm deeper than everyone’s before it. Their chicks inherited about 80% of that edge.',
    'The beaks ended at {a} (grass), {b} (cactus) and {c} mm (caltrops). Each island’s droughts favoured the beak that fits its lasting seeds.',
    'In your hardest drought, survivors’ beaks were {s} mm smaller than everyone’s before it. The big finches cracked most caltrops, so finches that handle small seeds survived.'
  ],
  captions: {
    liveRain: 'Raining, {mm} millimetres.', liveFeed: '{d} of {n} finches died.', liveBreed: '{c} chicks hatched.', liveYear: 'Year {y}. Average beak {m} millimetres.',
    mBeak: 'The mean beak depth of medium ground finches.', mBirds: 'Medium ground finches alive.', mSpread: 'Deepest island average minus slimmest.', mFam: 'Birds of the Big Bird family.', mGen: 'Generations since the founder.'
  },
  model: [
    { level: 0, simulated: 'Each finch has a beak depth: 80% inherited (the average of its parents plus scatter), 20% not. Each seed size is shared among the beaks that handle it. Well-fed finches survive; wet years add chicks.', simplification: 'A model drought has no rain, so selection is about twice that of 1977 (×2). Each drawn finch stands for about ten.', params: [{ name: 'heritability h²', value: 0.8, tag: 'realistic', real: 'about 0.8 (Boag 1983)' }, { name: 'drought selection S', value: 'about +1 mm', tag: 'xN', real: '+0.54 mm in 1977' }, { name: 'beak use width', value: '1.5 mm', tag: 'designed' }, { name: 'finches', value: 100, tag: 'xN', real: 'about 1,200 on Daphne' }], cannot: 'Beak shape, body size apart from the beak, or learning to forage.', nature: 'In the 1977 drought on Daphne Major most medium ground finches died. Survivors had deeper beaks (9.96 against 9.42 mm). Their young inherited much of that (Boag and Grant 1981).', contested: false, refs: ['boag1981', 'boag1983', 'grant2002'] },
    { level: 1, simulated: 'Three islands with different lasting seeds: small grass seeds, cactus seeds, and large caltrops. One founding flock lands on each. About one finch a year flies to another island.', simplification: 'Each round is a year and droughts are severe, so beaks split fast. The real radiation took about two million years.', params: [{ name: 'founders per island', value: 30, tag: 'designed' }, { name: 'migrants a year', value: 1, tag: 'designed' }, { name: 'years', value: 8, tag: 'xN', real: 'about 2 million years' }], cannot: 'Speciation itself: mating barriers, song, or new species names.', nature: 'Darwin’s finches descend from one ancestor that reached the Galápagos about two million years ago. There are now about 15 species (Lamichhaney et al. 2015).', contested: false, refs: ['lam2015', 'lack1947', 'grant2008'] },
    { level: 2, simulated: 'Daphne in 2004, with 60 large ground finches that crack caltrops well and eat twice as much. Their numbers are held fixed. Medium ground finches share every seed size with them.', simplification: 'More small-seeded plants than in 1977 (designed), as after the 1983 El Niño.', params: [{ name: 'large ground finches', value: 60, tag: 'designed' }, { name: 'food each one eats', value: '×2', tag: 'designed', real: 'they weigh about twice as much' }, { name: 'heritability h²', value: 0.8, tag: 'realistic', real: 'about 0.8 (Boag 1983)' }], cannot: 'The competitor evolving too, or changing in number.', nature: 'Large ground finches arrived on Daphne in 1982. In the 2004–05 drought they ate most large seeds, and medium ground finches with small beaks survived best. The next generation’s beaks were smaller (Grant and Grant 2006).', contested: false, refs: ['grant2006', 'lam2016'] },
    { level: 3, simulated: 'One immigrant male joins Daphne. Chicks learn their father’s song; females mostly pair with males singing their father’s song. A drought in the early 2000s cannot be stopped.', simplification: 'Each round stands for three years (×3). Song is either his or not.', params: [{ name: 'pairing by song', value: '95%', tag: 'designed' }, { name: 'years per round', value: 3, tag: 'xN', real: '1 year' }, { name: 'founder beak', value: '12 mm', tag: 'designed' }], cannot: 'Genes for song, or a full species split.', nature: 'In 1981 a large cactus finch from Española bred on Daphne. From the third generation his descendants bred only with each other, kept apart by song and beak. A drought left one brother and sister (Lamichhaney et al. 2018).', contested: false, refs: ['lam2018', 'grant2009'] }
  ],
  why: {
    real: [
      'Peter and Rosemary Grant measured medium ground finches on Daphne Major from 1973. In the 1977 drought, survivors had deeper beaks. The next generation inherited much of that (Boag and Grant 1981; Grant and Grant 2002).',
      'Darwin’s finches descend from one founding ancestor. On different islands, beaks fit different foods: seeds of different sizes, cactus, insects (Lack 1947; Lamichhaney et al. 2015).',
      'Large ground finches settled on Daphne in 1982. In the 2004–05 drought they took the big seeds. Medium ground finch beaks became smaller: character displacement, seen as it happened (Grant and Grant 2006).',
      'In 1981 an immigrant male, a large cactus finch, bred on Daphne. His descendants paired only with each other, recognising their fathers’ song. The lineage has lasted at least six generations (Lamichhaney et al. 2018).'
    ],
    maths: [
      'The breeder’s equation: R = h² × S. S is how far the survivors’ average beak sits from everyone’s; R is how far their chicks move. With h² = 0.8, chicks keep 80% of the survivors’ edge.',
      'Each island’s droughts favour the beak nearest its lasting seeds, so its average climbs towards that seed size. Migrants pull islands back together.',
      'Each seed size is shared among beaks in proportion to how well each handles it. A competitor that handles big seeds well leaves small seeds as the best food left.',
      'A chick sings its father’s song. Most females pair with a male singing their own father’s song, so the family breeds within itself.'
    ]
  }
};

const CH_ARCH_V2 = {
  id: 'arch', v2: true, role: 'environment', place: 'outer', accent: '#B5562C',   // sunset rust: the chapter's chrome tint (D6 decision 7)
  plan: ['The Archipelago', 'Seeds, beaks and neighbours'],
  intro: { goal: 'Be the weather; watch the finches’ beaks follow the seeds.' },
  content: ARC_TEXT,
  P: {
    h2: { v: ARC_M.h2, tag: 'realistic', min: 0, max: 1, real: 'about 0.8 (Boag 1983)', label: 'heritability' },
    W: { v: ARC_M.W, tag: 'designed', min: 0.8, max: 3, label: 'beak use width (mm)' },
    N: { v: 100, tag: 'xN', min: 40, max: 200, real: 'about 1,200 on Daphne', label: 'finches' },
    yrs: { v: 3, tag: 'xN', min: 1, max: 5, real: '1 year a round', label: 'years per round' }
  },
  levels: [
    { name: 'The drought', adds: 'drought selects; rain breeds', codes: ['B1'], minutes: 2 },
    { name: 'Three islands', adds: 'islands with different seeds', codes: ['B1', 'F1'], minutes: 2.5 },
    { name: 'Neighbours', adds: 'a competitor on the island', codes: ['F2'], minutes: 2 },
    { name: 'Big Bird', adds: 'an immigrant lineage', codes: ['F3'], minutes: 2 }
  ],
  keys: { Space: 'hold to rain', Enter: 'end the season', ArrowRight: 'next island', F: 'faster' },
  untimed: true,
  teacher: { prompts: ['After a drought, why are the survivors’ chicks less extreme than the survivors?', 'Why did the same kind of drought deepen beaks in 1977 but slim them in 2004?', 'The model holds large ground finches fixed. How would the story change if they evolved too?'], pool: 'trace' },
  starTraits: [],
  encodings: [   // finches: charcoal medium ground finches; large ground finches browner and bigger; the Big Bird family carries a cream song note (pattern + luminance)
    { k: 'fortis', rgb: [38, 34, 32], channels: ['luminance'] },
    { k: 'big', rgb: [243, 230, 196], channels: ['pattern', 'luminance'] }
  ],
  // the unit's stars (API_v2 §14.1): Discover in two of levels 1–3; Predict from level 3; Transfer from level 4
  unitStars(lv) {
    const has = (i, b) => !!((lv[i] || 0) & b), d = [0, 1, 2].filter(i => has(i, 1)).length;
    return (d >= 2 ? 1 : 0) | (has(2, 2) ? 2 : 0) | (has(3, 4) ? 4 : 0);
  },

  /* ================= headless simulation (API_v2 §9.3): R(), Det only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
    born(s, a, sex, sp, o) {   // a bird: breeding value a, beak z = a + scatter (h² of the variance is a)
      const ve = Math.sqrt(ARC_M.VP * (1 - s.h2)), b = { id: s.nid++, a, z: a + ve * Det.gauss(), sex, sp: sp || 'f', song: 0, g: 0, age: 0, dead: 0, chick: 0 };
      if (b.z < 6) b.z = 6; if (b.z > 15.5) b.z = 15.5; return Object.assign(b, o || {});
    },
    reset(level, o) {
      o = o || {};
      if (o.thaw) {   // What if?: rerun the level from its start with one thing changed, replaying the player's weather
        this.restore(o.thaw.snap); const s = this.s; s.whatif = o.thaw.lever || null; s.auto = true; s.log = []; s.ask = null;
        s.plan = Array.isArray(o.thaw.rains) ? o.thaw.rains : null; s.refP = o.thaw.ref != null ? +o.thaw.ref : null; this.lever(s); return;
      }
      const L = ARC_LV[level], va = Math.sqrt(ARC_M.VP * ARC_M.h2);
      const s = { level, phase: 'season', pt: 0, t: 0, year: 0, years: L.years, h2: ARC_M.h2, mig: L.mig || 0, assort: ARC_M.assort, nid: 1, isl: [], rain: [], hold: -1, unt: false, ff: 1,
        ask: null, asks: [], pred: {}, expS: null, askS: null, rains: [], plan: null, whatif: null, auto: false, refP: null, rec: [], sel: null, droughts: 0, bred: 0, dryS: 0, lastS: null, lastR: null, lastRe: null, log: [] };
      this.s = s;
      L.isl.forEach((key, i) => {
        const I = { key, cap: ARC_ISL[key].cap, birds: [], m0: 0, ref: 0 };
        for (let k = 0; k < L.n0[i]; k++) { const b = this.born(s, L.mu[i] + va * Det.gauss(), k % 2, 'f'); b.age = 1 + Math.floor(R() * 4); I.birds.push(b); }
        for (let k = 0; k < (i === 0 ? L.mag : 0); k++) I.birds.push(this.born(s, 14 + 0.5 * Det.gauss(), k % 2, 'm', { age: 3 }));
        if (L.big && i === 0) I.birds.push(this.born(s, 12, 0, 'f', { z: 12, song: 1, g: 0, age: 2, founder: 1 }));
        I.m0 = this.mean(I); I.ref = I.m0; s.isl.push(I); s.rain.push(0);
      });
      this.record(s);
    },
    lever(s) {
      const k = s.whatif;
      if (k === 'noh2') s.h2 = 0; else if (k === 'mix') s.mig = 8; else if (k === 'random') s.assort = 0;
      else if (k === 'nomag') for (const I of s.isl) I.birds = I.birds.filter(b => b.sp !== 'm');
      else if (k === 'allrain') s.plan = null;   // the auto weather rains every year
    },
    // ---- read-outs (pure) ----
    fortis(I) { return I.birds.filter(b => b.sp === 'f' && !b.dead && !b.song); },
    family(I) { return I.birds.filter(b => b.song && !b.dead); },
    mean(I, list) { const a = list || this.fortis(I); let t = 0; for (const b of a) t += b.z; return a.length ? t / a.length : 0; },
    count(I) { return this.fortis(I).length; },
    spread(s) { const m = s.isl.map(I => this.count(I) ? this.mean(I) : null).filter(x => x != null); return m.length > 1 ? Math.max(...m) - Math.min(...m) : 0; },
    famGen(s) { let g = -1; for (const b of this.family(s.isl[0])) g = Math.max(g, b.g); return g; },
    record(s) {
      s.rec.push({ y: s.year, m: s.isl.map(I => Math.round(this.mean(I) * 1000) / 1000), n: s.isl.map(I => this.count(I)), f: s.isl[0] ? this.family(s.isl[0]).length : 0,
        fm: s.isl[0] && this.family(s.isl[0]).length ? Math.round(this.mean(s.isl[0], this.family(s.isl[0])) * 1000) / 1000 : null, r: s.rain.slice(), dry: s.year > 0 && s.rain[0] < ARC_M.wet ? 1 : 0 });
    },
    forced(s) { const L = ARC_LV[s.level]; return L.forced != null && s.year === L.forced; },
    yearLabel(s, y) { const L = ARC_LV[s.level]; return L.y0 + (y == null ? s.year : y) * L.step; },
    // ---- the seed crop and who survives (Det maths) ----
    crop(I, r) {   // food (bird-years) per seed-size bin: the island's lasting seeds plus small soft seeds from this year's rain
      const K = ARC_X.map(() => 0), add = (m, sd, a) => { if (!(a > 0)) return; const g = ARC_X.map(x => Det.exp(-(x - m) * (x - m) / (2 * sd * sd))); let t = 0; for (const v of g) t += v; g.forEach((v, i) => { K[i] += a * v / t; }); };
      for (const q of ARC_ISL[I.key].last) add(q[0], q[1], q[2]); add(7, 1.2, Math.min(r, ARC_M.rmax) * ARC_M.perMM); return K;
    },
    need(z) { return 1 - ARC_M.needk + ARC_M.needk * z / 9.5; },   // smaller birds need less food (Grant and Grant 2006)
    use(x, z) { const d = x - z; return Det.exp(-d * d / (2 * ARC_M.W * ARC_M.W)); },
    survival(I, r) {   // each live bird's chance of living through the year
      const K = this.crop(I, r), live = I.birds.filter(b => !b.dead), D = ARC_X.map(x => { let d = 0; for (const b of live) d += this.use(x, b.z) * this.need(b.z) * (b.sp === 'm' ? ARC_M.magW : 1); return d; });
      return live.map(b => { if (b.sp === 'm' || (b.founder && this.s.year < ARC_FOUNDER)) return { b, p: 1 }; let F = 0; ARC_X.forEach((x, i) => { F += K[i] * this.use(x, b.z) * this.need(b.z) / Math.max(D[i], 1); }); const q = F / (ARC_M.h * this.need(b.z)); return { b, p: ARC_M.s0 * (1 - Det.exp(-q * q)) * (r >= ARC_M.wet ? ARC_LV[this.s.level].extra || 1 : 1) }; });   // level 4: three years a round, so wet rounds add other deaths   // the immigrant bred in his first year (history)
    },
    expS(I, r) {   // the expected selection differential on medium ground finch beaks this year (what the call is scored against)
      let a = 0, w = 0, t = 0, n = 0; for (const { b, p } of this.survival(I, r)) if (b.sp === 'f' && !b.song) { a += p * b.z; w += p; t += b.z; n++; }
      return w > 0 && n ? a / w - t / n : 0;
    },
    feed(s, ev) {   // deaths are decided now; the view fades the dead out during the feed
      s.sel = null; const dry = s.rain[0] < ARC_M.wet; if (dry) s.droughts++;
      s.isl.forEach((I, i) => {
        const r = s.rain[i], pre = this.fortis(I).map(b => b.z), m0 = this.mean(I); let died = 0, n = 0;
        for (const { b, p } of this.survival(I, r)) { if (b.sp === 'm') continue; n++; if (!(R() < p)) { b.dead = 1; died++; } }
        const surv = this.fortis(I).map(b => b.z), S = surv.length ? this.mean(I) - m0 : 0;
        if (i === 0) { s.sel = { pre, dead: I.birds.filter(b => b.dead && b.sp === 'f' && !b.song).map(b => b.z), surv, chicks: [], m0, S, ms: surv.length ? this.mean(I) : m0 }; if (r < ARC_M.wet && Math.abs(S) > Math.abs(s.dryS || 0)) s.dryS = S; }
        ev.push({ k: 'feed', i, died, n, dry: r < ARC_M.wet });
      });
      s.phase = 'feed'; s.pt = 0;
    },
    breed(s, ev) {
      const va2 = Math.sqrt(ARC_M.VP * ARC_M.h2 / 2), L = ARC_LV[s.level];
      s.isl.forEach((I, i) => {
        I.birds = I.birds.filter(b => !b.dead); for (const b of I.birds) b.chick = 0;
        const r = s.rain[i]; if (r < ARC_M.wet) { if (i === 0) ev.push({ k: 'nobreed' }); return; }
        const adults = I.birds.filter(b => b.sp === 'f'), males = this.shuffle(adults.filter(b => b.sex === 0)), fem = this.shuffle(adults.filter(b => b.sex === 1)), pairs = [];
        const founder = males.find(b => b.founder && (b.paired0 || 0) < 2);
        if (founder && L.big) {   // history: the immigrant paired with medium ground finch females (two, in the record), as no female sang his song
          const f = fem.find(q => !q.song); if (f) { pairs.push([founder, f]); males.splice(males.indexOf(founder), 1); fem.splice(fem.indexOf(f), 1); founder.paired0 = (founder.paired0 || 0) + 1; }
        }
        for (const f of fem) {   // females choose: a male singing her father's song if one is free (probability assort), else any free male
          if (!males.length) break; let k = -1;
          if (R() < s.assort) k = males.findIndex(m => m.song === f.song);
          if (k < 0) k = Math.floor(R() * males.length);
          pairs.push([males[k], f]); males.splice(k, 1);
        }
        const n = r >= ARC_M.boom ? 4 : 2, kids = [], pm = []; let pt = 0;
        for (const [m, f] of pairs) {
          pm.push(m.z, f.z);
          for (let j = 0; j < n; j++) {
            const a = s.h2 > 0 ? (m.a + f.a) / 2 + va2 * Det.gauss() : I.m0 + Math.sqrt(ARC_M.VP * ARC_M.h2) * Det.gauss();   // no inheritance (What if?): the founding mix
            const c = this.born(s, a, R() < 0.5 ? 0 : 1, 'f', { chick: 1, age: 0 });
            if (m.song) { c.song = 1; c.g = Math.max(m.g, f.song ? f.g : -1) + 1; }   // a chick sings its father's song
            kids.push(c); pt++;
          }
        }
        // chicks compete for the island's room by lottery; the Big Bird family has a niche of its own (about 30 birds today: designed)
        const fam = L.famCap ? kids.filter(c => c.song) : [], plain = L.famCap ? kids.filter(c => !c.song) : kids;
        const room = Math.max(0, I.cap - I.birds.filter(b => b.sp === 'f' && !(L.famCap && b.song)).length), keep = this.shuffle(plain).slice(0, room);
        if (L.famCap) { const fr = Math.max(0, L.famCap - I.birds.filter(b => b.song).length); for (const c of this.shuffle(fam).slice(0, fr)) keep.push(c); }
        for (const c of keep) I.birds.push(c);
        if (i === 0 && s.sel) {   // R = h²S for the display: S since the last breeding, the parents' edge, and the chicks' move
          const fk = keep.filter(c => !c.song), pmF = pairs.filter(p => !p[0].song && !p[1].song); let pa = 0; for (const p of pmF) pa += p[0].z + p[1].z;
          const par = pmF.length ? pa / (2 * pmF.length) : I.ref, S = par - I.ref, ck = fk.length ? fk.reduce((t, c) => t + c.z, 0) / fk.length : null;
          s.sel.chicks = fk.map(c => c.z); if (Math.abs(S) >= 0.15) { s.lastS = S; s.lastRe = s.h2 * S; s.lastR = ck != null ? ck - I.ref : null; } s.sel.ref = I.ref; s.sel.mc = ck; s.sel.par = par;
        }
        I.ref = this.mean(I);
        if (i === 0 && s.droughts > 0 && keep.length) s.bred++;
        ev.push({ k: 'breed', i, chicks: keep.length, pairs: pairs.length });
      });
      s.phase = 'breed'; s.pt = 0;
    },
    migrate(s, ev) {   // L2: a finch or two flies to another island each year (eight with the What if? lever)
      if (s.isl.length < 2) return;
      for (let k = 0; k < s.mig; k++) {
        const from = Math.floor(R() * s.isl.length), to = (from + 1 + Math.floor(R() * (s.isl.length - 1))) % s.isl.length, A = s.isl[from].birds.filter(b => b.sp === 'f');
        if (A.length < 3 || this.count(s.isl[to]) >= s.isl[to].cap) continue;
        const b = A[Math.floor(R() * A.length)]; s.isl[from].birds.splice(s.isl[from].birds.indexOf(b), 1); s.isl[to].birds.push(b); ev.push({ k: 'fly', from, to, id: b.id });
      }
    },
    endSeason(s, ev) {
      if (s.phase !== 'season') return; s.hold = -1;
      s.rains.push(s.rain.map(r => Math.round(r)));
      if (ARC_LV[s.level].ask && !s.asks.length && !s.auto && s.rain[0] < ARC_M.wet) {   // the one prediction: at the first drought with the big finches
        s.expS = this.expS(s.isl[0], s.rain[0]); s.ask = { id: 'dir' }; s.asks.push('dir'); s.phase = 'ask'; s.pt = 0; ev.push({ k: 'ask', id: 'dir' }); return;
      }
      if (s.rain[0] < ARC_M.wet && s.askS == null && ARC_LV[s.level].ask) s.askS = null;
      ev.push({ k: 'seasonEnd', rain: s.rain.slice() }); this.feed(s, ev);
    },
    autoRain(s) {   // What if? weather: the player's own seasons, or the lever's rule
      const L = ARC_LV[s.level];
      if (s.whatif === 'allrain') return s.isl.map(() => ARC_M.boom);
      const p = s.plan && s.plan[s.year]; if (p) return s.isl.map((_, i) => p[i] || 0);
      return this.expertRain(s, L);
    },
    expertRain(s) {   // the skilled plan (bots and What if? without a log)
      const n = s.level, y = s.year;
      const at = (a, d) => (a[y] == null ? d : a[y]);
      if (n === 0) { const I = s.isl[0]; return [y < s.years - 1 && s.rain && this.count(I) >= 40 && this.dBeak(s) < 0.8 && (y === 0 || s.rec[y] && !s.rec[y].dry) ? 0 : 250]; }   // drought, then a wet year to breed
      if (n === 1) return s.isl.map((I, i) => i === 1 || y >= s.years - 1 || this.count(I) < 16 || (s.rec[y] && s.rec[y].r[i] < ARC_M.wet && y > 0) ? 250 : 0);
      if (n === 2) return [at([250, 0, 250, 0, 250, 250], 250)];
      return [at(ARC_PLAN4, 250)];
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt; s.pt += dt * (s.phase === 'season' || s.phase === 'ask' ? 1 : s.ff);
      if (s.phase === 'season') {
        if (this.forced(s)) { s.hold = -1; s.rain = s.rain.map(() => ARC_DRY4); if (s.pt >= ARC_T.forced) this.endSeason(s, ev); return ev; }   // the 2002 drought: a little rain, no breeding
        if (s.auto) { if (s.pt >= 0.3) { const r = this.autoRain(s); s.rain = r.map(x => Math.min(ARC_M.rmax, x)); this.endSeason(s, ev); } return ev; }
        if (s.hold >= 0 && s.hold < s.rain.length && s.rain[s.hold] < ARC_M.rmax) {
          const b = s.rain[s.hold]; s.rain[s.hold] = Math.min(ARC_M.rmax, b + (s.unt ? ARC_M.rateU : ARC_M.rate) * dt);
          if (b < ARC_M.wet && s.rain[s.hold] >= ARC_M.wet) ev.push({ k: 'wetline', i: s.hold }); if (b < ARC_M.boom && s.rain[s.hold] >= ARC_M.boom) ev.push({ k: 'boom', i: s.hold });
          if (Math.floor(b / 10) !== Math.floor(s.rain[s.hold] / 10)) ev.push({ k: 'drop', i: s.hold, mm: Math.round(s.rain[s.hold]) });
        }
        if (!s.unt && s.pt >= (s.isl.length > 1 ? ARC_T.season2 : ARC_T.season)) this.endSeason(s, ev);
      } else if (s.phase === 'ask') { if (!s.ask) { ev.push({ k: 'seasonEnd', rain: s.rain.slice() }); this.feed(s, ev); } }
      else if (s.phase === 'feed') { if (s.pt >= ARC_T.feed) this.breed(s, ev); }
      else if (s.phase === 'breed') { if (s.pt >= ARC_T.breed) { s.phase = 'tally'; s.pt = 0; s.year++; this.migrate(s, ev); this.record(s); ev.push({ k: 'tally', y: s.year }); } }
      else if (s.phase === 'tally') {
        if (s.pt >= ARC_T.tally) {
          s.pt = 0; s.ff = 1;
          if (s.year >= s.years) { s.phase = 'end'; ev.push({ k: 'end' }); }
          else { s.phase = 'season'; s.rain = s.rain.map(() => 0); for (const I of s.isl) for (const b of I.birds) b.age++; ev.push({ k: 'year', y: s.year }); }
        }
      } else if (s.phase === 'end') { if (s.pt >= ARC_T.end) { s.phase = 'over'; ev.push({ k: 'over' }); } }
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (a.k === 'unt') { s.unt = !!a.on; return ev; }
      if (a.k === 'predict') {
        if (s.ask && a.id === s.ask.id && (a.v === 1 || a.v === 0 || a.v === -1)) { s.pred[a.id] = a.v; s.askS = s.expS; s.ask = null; ev.push({ k: 'predicted', id: a.id, v: a.v }); }
        return ev;
      }
      if (a.k === 'ff') { if (s.phase === 'feed' || s.phase === 'breed' || s.phase === 'tally') { s.ff = 4; ev.push({ k: 'ff' }); } return ev; }
      if (s.auto || s.phase !== 'season' || this.forced(s)) return ev;
      if (a.k === 'hold') {
        const i = a.on ? Math.max(0, Math.min(s.rain.length - 1, a.i | 0)) : -1;
        if (i !== s.hold) { s.hold = i; ev.push({ k: a.on ? 'press' : 'release', i: a.on ? i : (a.i | 0) }); }
      } else if (a.k === 'rain') {
        const i = Math.max(0, Math.min(s.rain.length - 1, a.i | 0)), b = s.rain[i]; s.rain[i] = Math.min(ARC_M.rmax, b + Math.max(0, Math.min(250, +a.mm || 0)));
        if (b < ARC_M.wet && s.rain[i] >= ARC_M.wet) ev.push({ k: 'wetline', i }); if (b < ARC_M.boom && s.rain[i] >= ARC_M.boom) ev.push({ k: 'boom', i });
        ev.push({ k: 'drop', i, mm: Math.round(s.rain[i]) });
      } else if (a.k === 'end') this.endSeason(s, ev);
      return ev;
    },
    // ---- outcomes the stars and cards read ----
    dBeak(s) { const I = s.isl[0]; return this.count(I) ? this.mean(I) - I.m0 : 0; },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_ARCH_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { d: Math.round(this.dBeak(s) * 100) / 100, n: this.count(s.isl[0]), spread: Math.round(this.spread(s) * 100) / 100 }, interesting: s.whatif ? null : this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons rule 6)
      const n = s.level, I = s.isl[0];
      if (n === 0) { if (this.count(I) < ARC_GOAL.n1) return 'crash'; if (!s.droughts) return 'flat'; return null; }
      if (n === 1) { if (s.isl.some(J => this.count(J) < ARC_GOAL.n2)) return 'lost'; return null; }
      if (n === 2) { if (!s.droughts) return 'wet'; if (this.count(I) < ARC_GOAL.n3) return 'crash'; return null; }
      if (!this.family(I).length) return 'gone';
      const k = this.famLow(s); if (k != null && k <= 4) return 'pair';
      return null;
    },
    famLow(s) { const L = ARC_LV[s.level]; if (L.forced == null) return null; const r = s.rec.find(q => q.y === L.forced + 1); return r ? r.f : null; },
    iVars(s) { const I = s.isl[0], lost = s.isl.map(J => this.count(J)); return { n: s.level === 1 ? Math.min(...lost) : this.count(I), k: this.famLow(s) || 0 }; },
    outcomeRef(s) { return s.level === 1 ? this.spread(s) : s.level === 3 ? this.famGap(s) : this.dBeak(s); },
    famGap(s) { const I = s.isl[0], F = this.family(I); return F.length ? this.mean(I, F) - this.mean(I) : 0; },
    wiVars(s) { const r2 = x => (x >= 0 ? '+' : '−') + Math.abs(Math.round(x * 100) / 100).toFixed(2), d = this.outcomeRef(s), p = s.refP;
      return s.level === 1 || s.level === 3 ? { d: Math.abs(Math.round(d * 100) / 100).toFixed(2), p: p == null ? '—' : Math.abs(Math.round(p * 100) / 100).toFixed(2) } : { d: r2(d), p: p == null ? '—' : r2(p) }; },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) return [{ k: 'predict', id: s.ask.id, v: 1 }, { k: 'predict', id: s.ask.id, v: 0 }, { k: 'predict', id: s.ask.id, v: -1 }];
      if (s.auto || s.phase !== 'season') return out;
      if (this.forced(s)) return out;
      s.rain.forEach((r, i) => { if (r < ARC_M.rmax) out.push({ k: 'rain', i, mm: 30 }); });
      out.push({ k: 'end' }); return out;
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    rainTo(s, want) { for (let i = 0; i < s.rain.length; i++) if (want[i] > s.rain[i] + 1e-9) return { k: 'rain', i, mm: Math.min(250, want[i] - s.rain[i]) }; return { k: 'end' }; },
    bots: {
      alwaysA(s, acts) { if (!acts.length) return null; if (acts[0].k === 'predict') return acts[0]; return CH_ARCH_V2.sim.rainTo(s, s.rain.map(() => 250)); },   // rain hard every year; calls "deep"
      alwaysB(s, acts) { if (!acts.length) return null; if (acts[0].k === 'predict') return acts[2]; return { k: 'end' }; },   // never rains; calls "slim"
      greedy(s, acts) {   // the level 1 lesson everywhere: drought and rain in turn; calls "deep" (droughts deepened beaks before)
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[0];
        return CH_ARCH_V2.sim.rainTo(s, s.rain.map(() => s.year % 2 === 0 ? 0 : 250));
      },
      threshold(s, acts) {   // rain wherever finches are below 60% of the island's room, else drought; calls "no change"
        if (!acts.length) return null; if (acts[0].k === 'predict') return acts[1]; const S = CH_ARCH_V2.sim;
        return S.rainTo(s, s.isl.map(I => S.count(I) + S.family(I).length < 0.6 * I.cap ? 250 : 0));
      },
      expert(s, acts) {   // skilled play (oracle only): the plan, and the call read from the expectation
        if (!acts.length) return null; const S = CH_ARCH_V2.sim;
        if (acts[0].k === 'predict') { const v = s.expS > 0.05 ? 1 : s.expS < -0.05 ? -1 : 0; return acts.find(a => a.v === v); }
        return S.rainTo(s, S.expertRain(s));
      }
    }
  },

  /* ---- stars: pure functions of the final state (API_v2 §9.1). No level offers more than two. ---- */
  stars: {
    discover: (s, n) => {
      const S = CH_ARCH_V2.sim, I = s.isl[0];
      if (n === 0) return s.bred > 0 && S.dBeak(s) >= ARC_GOAL.d1 && S.count(I) >= ARC_GOAL.n1;
      if (n === 1) return S.spread(s) >= ARC_GOAL.spread && s.isl.every(J => S.count(J) >= ARC_GOAL.n2);
      if (n === 2) return s.bred > 0 && -S.dBeak(s) >= ARC_GOAL.d3 && S.count(I) >= ARC_GOAL.n3;   // chicks after a drought: the change is inherited
      return false;
    },
    predict: (s, n) => n === 2 && s.pred.dir != null && s.askS != null && Math.abs(s.askS) > 0.05 && s.pred.dir === (s.askS > 0 ? 1 : -1),   // scored against the expected S, not the draw
    transfer: (s, n) => { const S = CH_ARCH_V2.sim; return n === 3 && S.family(s.isl[0]).length >= ARC_GOAL.n4 && S.famGen(s) >= ARC_GOAL.g4; }
  },
  // assignment links (API_v2 §13.5): bits 0–2 mask · 3–12 beak change ×100 + 512 · 13–19 finches (≤ 127) · 20–21 the call + 1
  resultBits(s, level) {
    const S = this.sim, r = S.result(), d = Math.max(0, Math.min(1023, Math.round(S.dBeak(s) * 100) + 512)), n = Math.min(127, S.count(s.isl[0])), p = s.pred.dir == null ? 3 : s.pred.dir + 1;
    return ((r ? r.mask : 0) & 7) | (d << 3) | (n << 13) | ((p & 3) << 20);
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {}); this.level = n; this._ended = false; this._pend = false; this._dockSig = ''; this._said = {};
    if (o.thaw) o.thaw = Object.assign({}, o.thaw, { rains: this._lastRains || null, ref: this._lastRef != null ? this._lastRef : null });   // What if? replays your weather
    Sim.start(this, n, o);
    if (!o.thaw && typeof Freezer !== 'undefined') Freezer.put(this.id, 0, this.sim.snapshot());
    const unt = (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt) || (typeof Url !== 'undefined' && Url.untimed);
    if (unt && !o.thaw && !o.replay) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    this.v = { t: 0, sel: 0, press: null, kPress: false, banner: null, sig: '', fade: {}, hatch: {}, flights: [], drops: [], cracks: 0, lastDrop: 0, bgSig: '', green: [], feedT: 0, sing: {} };
    this._g = null; this.layout(); this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const s = this.sim.s, name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(1000, ms + 300) }; });
    if (!o.thaw && typeof Ghost !== 'undefined' && (n === 0 || n === 1)) {   // the hand demonstrates the hold until the first rain
      const k = n === 1 ? 0 : 0;
      Ghost.show({ verb: 'hold', key: ' ', at: () => { const g = this.geo(), I = g.isl[k]; return [I.cx, I.cy]; }, until: () => this.sim.s.rain[k] > 0 || this.sim.s.year > 0 });
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  onResize() { if (this.v) this.layout(); },

  /* ---------- geometry (canvas px), recomputed when the stage changes size ---------- */
  hudH() { const z = (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; return Math.max(z, Stage.w < 520 ? 84 : 62); },   // the HUD wraps to three lines on a phone
  layout() { this._g = null; this.geo(); if (this.v) this.v.bgSig = ''; },
  geo() {
    const W = Stage.w, H = Stage.h, n = this.sim.s.isl.length, k = W + 'x' + H + 'x' + this.hudH() + 'x' + n;
    if (this._g && this._g.k === k) return this._g;
    const top = this.hudH() + 6, h = H - top, wide = W > H * 1.1, g = { k, W, H, top, h, wide, isl: [] };
    if (n === 1) {
      const rx = Math.min(W * (wide ? 0.3 : 0.4), h * 0.4, 330), ry = rx * 0.66, cx = W * (wide ? 0.47 : 0.5), cy = top + h * 0.47;
      g.isl.push({ cx, cy, rx, ry, seed: 3 });
      g.port = { x: wide ? Math.min(W - 16 - 120, cx + rx + 30) : W - 16 - Math.min(104, W * 0.27), y: top + 10, s: wide ? 120 : Math.min(104, W * 0.27) };
      g.eq = { x: 16, y: H - 64 };
    } else {
      const pos = [[0.38, 0.17], [0.62, 0.5], [0.38, 0.83]], rx = Math.min(W * 0.3, (h / 3 - 46) / 1.3, 170);   // a zig-zag down the stage, tags on the open side
      pos.forEach((p, i) => g.isl.push({ cx: W * p[0], cy: top + h * p[1] - 12, rx, ry: rx * 0.64, seed: 11 + i * 7 }));
    }
    for (const I of g.isl) {   // gauge beside each island; nests near its centre
      I.side = n > 1 && I.cx > W / 2 ? 1 : -1;   // L2 phone: the gauge sits on the sea side away from the tag
      I.gx = Math.max(n === 1 ? 34 : 12, Math.min(W - 14, I.side > 0 ? I.cx + I.rx * 1.15 + 10 : I.cx - I.rx * 1.15 - (n === 1 ? 16 : 10))); I.gy0 = I.cy - I.ry * 0.8; I.gy1 = I.cy + I.ry * 0.6; I.gw = n === 1 ? 14 : 10;
      I.shape = this.shape(I);
    }
    this._g = g; return g;
  },
  shape(I) {   // cosmetic: an island outline (seeded wobble), as points around the ellipse
    const r = rng(I.seed), pts = [], m = 40, a1 = 0.18 + 0.1 * r(), a2 = 0.08 + 0.06 * r(), p1 = r() * 6, p2 = r() * 6;
    for (let k = 0; k < m; k++) { const a = TAU * k / m, w = 1 + a1 * Det.sin(a * 2 + p1) * 0.5 + a2 * Det.sin(a * 5 + p2) * 0.6; pts.push([I.cx + I.rx * w * Det.cos(a), I.cy + I.ry * w * Det.sin(a)]); }
    return pts;
  },
  inIsl(I, u, v) { return [I.cx + I.rx * 0.78 * u, I.cy + I.ry * 0.72 * v]; },   // a point inside the island from a unit-disc coordinate
  hash(n) { let x = (n * 2654435761) >>> 0; x ^= x >>> 15; x = Math.imul(x, 2246822519) >>> 0; x ^= x >>> 13; return (x >>> 0) / 4294967296; },
  disc(id, k) { const a = TAU * this.hash(id * 31 + k * 7 + 1), r = Math.sqrt(this.hash(id * 17 + k * 13 + 5)); return [r * Det.cos(a), r * Det.sin(a)]; },
  birdXY(I, b, t) {   // cosmetic: each finch hops between spots every ~2 s; returns [x, y, hop lift, facing]
    const per = 1.6 + this.hash(b.id) * 1.4, off = this.hash(b.id + 99) * per, q = (t + off) / per, k = Math.floor(q), f = q - k;
    const a = this.disc(b.id, k), c = this.disc(b.id, k + 1), m = Math.min(1, f / 0.25), e = m * m * (3 - 2 * m);
    const u = a[0] + (c[0] - a[0]) * e, v = a[1] + (c[1] - a[1]) * e, [x, y] = this.inIsl(I, u, v);
    return [x, y, f < 0.25 ? Det.sin(f / 0.25 * Math.PI) : 0, c[0] >= a[0] ? 1 : -1];
  },
  islAt(x, y) {   // which island a point is on (nearest centre within its reach)
    const g = this.geo(); let best = -1, bd = 1e9;
    g.isl.forEach((I, i) => { const dx = (x - I.cx) / (I.rx * 1.25), dy = (y - I.cy) / (I.ry * 1.4), d = Math.sqrt(dx * dx + dy * dy); if (d < bd) { bd = d; best = i; } });
    return g.isl.length === 1 ? 0 : bd <= 1.2 ? best : -1;
  },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    if (s.phase === 'feed') v.feedT = Math.min(1, s.pt / ARC_T.feed);
    for (let i = v.flights.length - 1; i >= 0; i--) { v.flights[i].u += dt * 0.7 * (s.ff || 1); if (v.flights[i].u >= 1) v.flights.splice(i, 1); }
    for (const id in v.hatch) { v.hatch[id] += dt * (s.ff || 1); if (v.hatch[id] > 3) delete v.hatch[id]; }
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, S = this.sim, final = n === ARC_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    const V = this.vars();
    if (!s.whatif) { this._lastRains = s.rains.map(x => x.slice()); this._lastRef = S.outcomeRef(s); }
    if (o.interesting) { C.interesting.now = Txt.f(C.interesting[o.interesting], S.iVars(s)); o.interesting = 'now'; }
    if (s.whatif) { o.take = null; o.interesting = null; o.body = Txt.f(C.whatifBody[s.whatif] || '', S.wiVars(s)); }
    else if (!final) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    o.stars = C.levelStars[n];
    const vial = typeof Freezer !== 'undefined' ? Freezer.list(this.id).find(x => x.gen === 0) : null;
    if (vial && !s.whatif) o.whatIf = { gen: 0, levers: ARC_LV[n].levers };
    const spec = this.trendSpec(true); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  vars() {
    const s = this.sim.s, S = this.sim, I = s.isl[0], f2 = x => (Math.round(x * 100) / 100).toFixed(2), sg = x => (x >= 0 ? '+' : '−') + f2(Math.abs(x));
    const m = s.isl.map(J => f2(S.mean(J))), F = S.family(I), sel = s.sel;
    return { d: sg(S.dBeak(s)), n: s.years * ARC_LV[s.level].step, k: s.droughts, s: f2(Math.abs(s.dryS || 0)), a: m[0], b: m[1] || '', c: m[2] || '',
      g: Math.max(0, S.famGen(s)), dd: f2(S.famGap(s)), nf: F.length, ...(s.level === 3 ? { n: F.length, d: f2(S.famGap(s)) } : {}) };
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {   // cosmetic (view-only)
    const s = this.sim.s, v = this.v, g = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, W = C.whispers;
    const snd = (name, x, y, o) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, Object.assign({ x, y }, o || {})); };
    const I = g.isl[Math.max(0, Math.min(g.isl.length - 1, e.i | 0))];
    if (e.k === 'press') { if (F) F.ring(I.cx, I.cy - I.ry * 0.9, 18, { ms: 200 }); }
    else if (e.k === 'drop') { if (v.t - v.lastDrop > 0.1) { snd('pour', I.cx, I.cy - I.ry * 0.5, { left: 1 - e.mm / ARC_M.rmax }); v.lastDrop = v.t; } if (typeof Live !== 'undefined' && e.mm % 50 === 0) Live.say(Txt.f(C.captions.liveRain, { mm: e.mm })); }
    else if (e.k === 'wetline') { this.whisper('wet'); if (F) F.ring(I.gx, this.gaugeY(I, ARC_M.wet), 14, { ms: 300 }); }
    else if (e.k === 'boom') { if (this.once('boom')) this.whisper('boom'); if (F) F.burst('droplet', I.cx, I.cy, 8); }
    else if (e.k === 'seasonEnd') { if (e.rain[0] < ARC_M.wet && g.isl.length === 1) { this.whisper('dry'); if (F) F.tier(2, () => { }); } }
    else if (e.k === 'ask') { if (F) F.ring(I.cx, I.cy, I.rx * 0.6, { ms: 400 }); if (typeof Live !== 'undefined') Live.say(C.hud.ask); }
    else if (e.k === 'predicted') { if (F) F.ring(I.cx, I.cy, I.rx * 0.4, { ms: 300 }); snd('tock', I.cx, I.cy); }
    else if (e.k === 'feed') {
      v.cracks = 0; v.fade = {};
      const B = s.isl[e.i].birds; let k = 0; for (const b of B) if (b.dead) v.fade[b.id] = 0.15 + 0.7 * this.hash(b.id + k++);   // each death at its own moment in the feed
      if (e.i === 0 || g.isl.length > 1) { const x = I.cx, y = I.cy - I.ry - 8; if (F && e.died) F.pop('−' + e.died, x, y, -1); }
      if (e.dry && e.died > e.n * 0.6 && F) { F.shake(3, 160); if (this.once('crash' + s.year + e.i) && this.sim.count(s.isl[e.i]) < 20) this.whisper('crash'); }
      if (typeof Live !== 'undefined' && e.i === 0) Live.say(Txt.f(C.captions.liveFeed, { d: e.died, n: e.n }));
    }
    else if (e.k === 'nobreed') { }
    else if (e.k === 'breed') {
      for (const b of s.isl[e.i].birds) if (b.chick) v.hatch[b.id] = -0.6 * this.hash(b.id);
      if (e.chicks) { snd('peep', I.cx, I.cy); if (F) F.pop('+' + e.chicks, I.cx + I.rx * 0.5, I.cy - I.ry - 8, 1); }
      if (typeof Live !== 'undefined' && e.i === 0) Live.say(Txt.f(C.captions.liveBreed, { c: e.chicks }));
      if (s.level === 3 && e.i === 0 && this.sim.family(s.isl[0]).length > 2 && this.once('song')) this.whisper('song');
    }
    else if (e.k === 'fly') { v.flights.push({ from: e.from, to: e.to, u: 0, id: e.id }); snd('wing', g.isl[e.from].cx, g.isl[e.from].cy); }
    else if (e.k === 'tally') {
      if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
      const S = this.sim; if (F) F.tier(1, () => { });
      if (s.level === 1) s.isl.forEach((J, i) => { if (S.count(J) < ARC_GOAL.n2 && this.once('lost' + i)) this.whisper('lost'); });
      if (s.level === 3 && !S.family(s.isl[0]).length && this.once('gone')) this.whisper('gone');
      const goal = !s.whatif && CH_ARCH_V2.stars[s.level === 3 ? 'transfer' : 'discover'](s, s.level);
      if (goal && this.once('goal')) { if (F) F.tier(3, ms => { v.banner = { text: C.labels.jackpot, t: 0, ms: Math.max(900, ms) }; }); snd('interesting', g.isl[0].cx, g.isl[0].cy); }
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveYear, { y: s.year, m: S.mean(s.isl[0]).toFixed(2) }));
    }
    else if (e.k === 'year') { v.fade = {}; snd('swish', g.W * 0.5, g.top + 20); }
    else if (e.k === 'ff') { if (F) F.ring(g.isl[0].cx, g.isl[0].cy, 24, { ms: 200 }); }
    else if (e.k === 'end' || e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'arc-' + k); },

  /* ---------- input: hold on an island to rain; keys: Space holds, arrows pick the island, Enter ends the season ---------- */
  down(x, y) {
    if (y < this.hudH()) return; const s = this.sim.s;
    if (s.phase === 'feed' || s.phase === 'breed' || s.phase === 'tally') { Sim.act(this, { k: 'ff' }); return; }
    const i = this.islAt(x, y); if (i < 0) return; this.v.sel = i; this.v.press = { i }; Sim.act(this, { k: 'hold', on: true, i });
  },
  move(x, y) { const p = this.v.press; if (!p || this.sim.s.isl.length < 2) return; const i = this.islAt(x, y); if (i >= 0 && i !== p.i) { p.i = i; this.v.sel = i; Sim.act(this, { k: 'hold', on: true, i }); } },
  up() { if (!this.v.press) return; const i = this.v.press.i; this.v.press = null; Sim.act(this, { k: 'hold', on: false, i }); },
  onKey(k, e) {
    const s = this.sim.s, n = s.isl.length;
    if (k === ' ' || k === 'Spacebar') { if (e && e.repeat) return; if (s.phase === 'feed' || s.phase === 'breed' || s.phase === 'tally') { Sim.act(this, { k: 'ff' }); return; } this.v.kPress = true; Sim.act(this, { k: 'hold', on: true, i: this.v.sel }); }
    else if (k === 'ArrowRight' || k === 'ArrowLeft') { this.v.sel = (this.v.sel + (k === 'ArrowRight' ? 1 : n - 1)) % n; }
    else if (k === '1' || k === '2' || k === '3') { const i = +k - 1; if (i < n) this.v.sel = i; }
    else if (k === 'f' || k === 'F') Sim.act(this, { k: 'ff' });
  },
  onKeyUp(k) { if ((k === ' ' || k === 'Spacebar') && this.v.kPress) { this.v.kPress = false; Sim.act(this, { k: 'hold', on: false, i: this.v.sel }); } },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, forced = this.sim.forced(s);
    const sig = s.phase + (s.ask ? 'a' : '') + (s.auto ? 'u' : '') + (forced ? 'f' : ''); if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) {
      Dock.set([{ id: 'arc-deep', label: L.deep, fn: () => Sim.act(this, { k: 'predict', id: 'dir', v: 1 }) },
        { id: 'arc-none', label: L.none, fn: () => Sim.act(this, { k: 'predict', id: 'dir', v: 0 }) },
        { id: 'arc-slim', label: L.slim, fn: () => Sim.act(this, { k: 'predict', id: 'dir', v: -1 }) }]);
      return;
    }
    if (s.auto || s.phase === 'over' || s.phase === 'end') { Dock.set([]); return; }
    if (s.phase === 'feed' || s.phase === 'breed' || s.phase === 'tally') { Dock.set([{ id: 'arc-ff', label: L.faster, key: 'f', fn: () => Sim.act(this, { k: 'ff' }) }]); return; }
    if (forced) { Dock.set([]); return; }
    Dock.set([{ id: 'arc-end', label: L.end, key: 'Enter', primary: true, fn: () => Sim.act(this, { k: 'end' }) }]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, S = this.sim, n = s.level, I = s.isl[0], f2 = x => (Math.round(x * 100) / 100).toFixed(2); let t;
    const yv = { y: s.year + 1, n: s.years, yr: S.yearLabel(s) };
    if (s.ask) t = C.ask;
    else if (s.auto) t = C.auto;
    else if (s.phase === 'over' || s.phase === 'end') t = C.over;
    else if (s.phase === 'season') {
      if (S.forced(s)) t = Txt.f(C.forced, yv);
      else if (s.hold >= 0) t = Txt.f(C.raining, { mm: Math.round(s.rain[s.hold]) });
      else if (n === 0 && s.year === 0 && s.rain[0] <= 0) t = this.content.firstWords;
      else t = Txt.f(C['s' + n], yv);
    } else if (s.phase === 'feed') t = s.rain[0] < ARC_M.wet || s.isl.length > 1 ? (n === 0 ? C.dry0 : n === 1 ? C.dry1 : n === 2 ? C.dry2 : C.dry0) : C.wet;
    else if (s.phase === 'breed') t = s.rain.some(r => r >= ARC_M.wet) ? (n === 0 && s.lastS != null && Math.abs(s.lastS) > 0.1 ? C.rule : C.breed) : C.nobreed;
    else if (s.phase === 'tally') t = n === 1 ? Txt.f(C.tally1, { a: f2(S.mean(s.isl[0])), b: f2(S.mean(s.isl[1])), c: f2(S.mean(s.isl[2])) }) : n === 3 ? Txt.f(C.tally3, { n: S.family(I).length, g: Math.max(0, S.famGen(s)) }) : Txt.f(C.tally, { m: f2(S.mean(I)) });
    if (s.phase === 'feed' && n === 1) t = s.rain.every(r => r >= ARC_M.wet) ? C.wet : C.dry1;
    const num = n === 1 ? 'spread ' + f2(S.spread(s)) : n === 3 ? 'family ' + S.family(I).length : f2(S.mean(I)) + ' mm';
    const sig = t + '|' + num; if (sig === this.v.sig) return; this.v.sig = sig; HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const g = this.geo(), s = this.sim.s, v = this.v;
    this.drawBg(c, g);
    g.isl.forEach((I, i) => this.drawIsland(c, g, I, i));
    g.isl.forEach((I, i) => this.drawBirds(c, g, I, i));
    this.drawFlights(c, g);
    g.isl.forEach((I, i) => { this.drawCloud(c, g, I, i); this.drawGauge(c, g, I, i); });
    if (g.isl.length === 1) { this.drawPortrait(c, g); this.drawEq(c, g); } else this.drawIslandTags(c, g);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('arc-banner', v.banner.text, g.W / 2, g.top + g.h * 0.12, { size: 22 }); c.restore(); }
  },
  drawBg(c, g) {   // cosmetic, cached: the cobalt sea at golden hour, the low sun's glitter path, swell lines
    const sig = g.k; if (!this._bg || this.v.bgSig !== sig) { this._bg = this._bg || Layer(g.W, g.H); this._bg.resize(g.W, g.H); this._bg.redraw(cc => this.paintBg(cc, g)); this.v.bgSig = sig; }
    this._bg.blit(c, 0, 0);
    const t = this.v.t, calm = typeof Fx !== 'undefined' && Fx.calm; if (calm) return;
    c.save(); c.strokeStyle = 'rgba(255,214,150,.28)'; c.lineWidth = 2;   // glints drifting on the sunlit water
    for (let k = 0; k < 14; k++) { const x = g.W * (0.55 + 0.4 * this.hash(k)), y = g.top + g.h * (0.05 + 0.5 * this.hash(k + 40)), w = 6 + 10 * this.hash(k + 80), ph = Det.sin(t * 1.3 + k * 1.7); if (ph < 0.2) continue; c.globalAlpha = ph - 0.2; c.beginPath(); c.moveTo(x - w, y); c.lineTo(x + w, y); c.stroke(); }
    c.restore();
  },
  paintBg(c, g) {   // cosmetic
    const C = ARC_C, W = g.W, H = g.H, r = rng(5);
    const sg = c.createLinearGradient(0, 0, W * 0.3, H); sg.addColorStop(0, C.sea2); sg.addColorStop(0.45, C.sea1); sg.addColorStop(1, C.sea0); c.fillStyle = sg; c.fillRect(0, 0, W, H);
    const sx = W * 0.92, sy = g.top - 10, sun = c.createRadialGradient(sx, sy, 4, sx, sy, Math.max(W, H) * 0.7); sun.addColorStop(0, 'rgba(255,205,120,.75)'); sun.addColorStop(0.25, 'rgba(242,166,90,.32)'); sun.addColorStop(1, 'rgba(242,166,90,0)');
    c.fillStyle = sun; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(220,235,250,.10)'; c.lineWidth = 1.5;
    for (let k = 0; k < 60; k++) { const x = r() * W, y = g.top + r() * g.h, w = 10 + r() * 26; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 3, x + w, y); c.stroke(); }
  },
  path(c, pts, sc, cx, cy) { c.beginPath(); pts.forEach((p, i) => { const x = cx + (p[0] - cx) * sc, y = cy + (p[1] - cy) * sc; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.closePath(); },
  bakeIsland(I, key) {   // cosmetic, cached per size: lava, tuff, beach, cactus and caltrop mats; the island's lasting plants
    const k = this._g.k + '|' + key + '|' + I.seed; this._isl = this._isl || {}; if (this._isl[k]) return this._isl[k];
    const C = ARC_C, L = Layer(this._g.W, this._g.H), r = rng(I.seed + 1);
    L.redraw(c => {
      c.fillStyle = 'rgba(233,241,244,.45)'; this.path(c, I.shape, 1.1, I.cx, I.cy); c.fill();   // surf
      c.fillStyle = C.sand; this.path(c, I.shape, 1.04, I.cx, I.cy); c.fill();
      const lg = c.createRadialGradient(I.cx - I.rx * 0.3, I.cy - I.ry * 0.4, 4, I.cx, I.cy, I.rx * 1.1); const daph = key.indexOf('daphne') === 0; lg.addColorStop(0, daph ? C.tuffB : C.lava2); lg.addColorStop(1, daph ? C.tuffA : C.lava); c.fillStyle = lg; this.path(c, I.shape, 0.95, I.cx, I.cy); c.fill();
      c.save(); this.path(c, I.shape, 0.95, I.cx, I.cy); c.clip();
      for (let q = 0; q < 9; q++) { const [x, y] = this.inIsl(I, r() * 2 - 1, r() * 2 - 1); c.fillStyle = q % 3 ? 'rgba(107,58,38,.45)' : 'rgba(138,106,74,.4)'; c.beginPath(); c.ellipse(x, y, I.rx * (0.1 + 0.2 * r()), I.ry * (0.08 + 0.15 * r()), r() * 3, 0, TAU); c.fill(); }   // rust and tuff patches
      if (daph) { c.fillStyle = C.crater; c.beginPath(); c.ellipse(I.cx + I.rx * 0.08, I.cy - I.ry * 0.05, I.rx * 0.34, I.ry * 0.3, -0.1, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,214,160,.35)'; c.lineWidth = 3; c.beginPath(); c.ellipse(I.cx + I.rx * 0.08, I.cy - I.ry * 0.05, I.rx * 0.34, I.ry * 0.3, -0.1, Math.PI * 0.9, Math.PI * 1.9); c.stroke(); }   // Daphne Major: a tuff cone with its crater
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; for (let q = 0; q < 26; q++) { const [x, y] = this.inIsl(I, r() * 2 - 1, r() * 2 - 1); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 14, y + (r() - 0.5) * 8); c.stroke(); }   // lava cracks
      const sc = Math.max(0.6, Math.min(1.4, I.rx / 120)), last = ARC_ISL[key].last;
      const kind = q => q[0] >= 11.5 ? 'caltrop' : q[0] >= 9.5 ? 'cactus' : 'grass', amount = t => last.filter(q => kind(q) === t).reduce((a, q) => a + q[2], 0);
      const nCac = Math.round(amount('cactus') * 0.9 + 2), nCal = Math.round(amount('caltrop') * 0.6), nGr = Math.round(amount('grass') * 1.2);
      for (let q = 0; q < nGr; q++) { const [x, y] = this.inIsl(I, r() * 2 - 1, r() * 2 - 1); this.grassTuft(c, x, y, sc); }
      for (let q = 0; q < nCal; q++) { const [x, y] = this.inIsl(I, r() * 2 - 1, r() * 2 - 1); this.caltropMat(c, x, y, sc, r); }
      for (let q = 0; q < nCac; q++) { const [x, y] = this.inIsl(I, r() * 1.8 - 0.9, r() * 1.8 - 0.9); this.pear(c, x, y, sc, r); }
      c.restore();
    });
    this._isl[k] = L; return L;
  },
  grassTuft(c, x, y, sc) { c.strokeStyle = '#A9A65A'; c.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + k * 2.2 * sc, y - (5 + Math.abs(k)) * sc); c.stroke(); } },
  caltropMat(c, x, y, sc, r) {   // cosmetic: a low Tribulus mat with yellow flowers and spiky woody fruits
    c.fillStyle = ARC_C.shrubD; c.beginPath(); c.ellipse(x, y, 10 * sc, 6 * sc, 0, 0, TAU); c.fill();
    c.fillStyle = ARC_C.shrub; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(x + (r() - 0.5) * 14 * sc, y + (r() - 0.5) * 7 * sc, 3.2 * sc, 2 * sc, r() * 3, 0, TAU); c.fill(); }
    c.fillStyle = ARC_C.flower; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + (r() - 0.5) * 12 * sc, y + (r() - 0.5) * 6 * sc, 1.4 * sc, 0, TAU); c.fill(); }
  },
  pear(c, x, y, sc, r) {   // cosmetic: a prickly-pear cactus, pads and red fruit, seen from above at a slant
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + 4 * sc, y + 4 * sc, 11 * sc, 5 * sc, 0, 0, TAU); c.fill();
    const pads = [[0, 0, 7, 9, 0], [-7, -6, 5, 7, -0.6], [7, -7, 5, 7, 0.6], [0, -13, 4.5, 6, 0]];
    for (const [dx, dy, a, b, rot] of pads) { c.fillStyle = ARC_C.cactus; c.beginPath(); c.ellipse(x + dx * sc, y + dy * sc, a * sc, b * sc, rot, 0, TAU); c.fill(); c.strokeStyle = ARC_C.cactusD; c.lineWidth = 1; c.stroke(); }
    c.fillStyle = ARC_C.pear; for (const [dx, dy] of [[-9, -12], [9, -13], [0, -19]]) { c.beginPath(); c.ellipse(x + dx * sc, y + dy * sc, 1.8 * sc, 2.3 * sc, 0, 0, TAU); c.fill(); }
  },
  drawIsland(c, g, I, i) {   // cosmetic
    const s = this.sim.s, key = s.isl[i].key, L = this.bakeIsland(I, key);
    c.save(); c.fillStyle = 'rgba(10,25,50,.35)'; this.path(c, I.shape, 1.12, I.cx + 6, I.cy + 8); c.fill(); c.restore();
    L.blit(c, 0, 0);
    const wet = s.phase === 'season' ? s.rain[i] : s.rain[i], k = Math.min(1, wet / ARC_M.boom);   // rain greens the island this year; a drought browns it
    c.save(); this.path(c, I.shape, 0.95, I.cx, I.cy); c.clip();
    if (k > 0.02) { c.globalAlpha = 0.45 * k; c.fillStyle = ARC_C.green; c.fillRect(I.cx - I.rx * 1.2, I.cy - I.ry * 1.2, I.rx * 2.4, I.ry * 2.4); c.globalAlpha = 1; this.drawSmallSeeds(c, I, i, k); }
    else if (s.phase !== 'season' && s.rain[i] < ARC_M.wet) { c.globalAlpha = 0.28; c.fillStyle = ARC_C.dry; c.fillRect(I.cx - I.rx * 1.2, I.cy - I.ry * 1.2, I.rx * 2.4, I.ry * 2.4); c.globalAlpha = 1; }
    c.restore();
    if (s.isl.length === 1) Lbl.put('arc-isl', this.content.labels.daphne, I.cx, I.cy + I.ry * 1.08 + 12, { size: 12, pill: false, ink: '#FBF4E4' });
  },
  drawSmallSeeds(c, I, i, k) {   // cosmetic: after rain, herbs flush and drop small soft seeds; finches eat them down during the feed
    const s = this.sim.s, n = Math.round(60 * k * (s.phase === 'feed' ? 1 - 0.7 * this.v.feedT : s.phase === 'season' ? 1 : 0.3));
    c.fillStyle = ARC_C.seed; for (let q = 0; q < n; q++) { const d = this.disc(q + 500 * i, 3), [x, y] = this.inIsl(I, d[0], d[1]); c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill(); }
  },
  drawBirds(c, g, I, i) {   // cosmetic: every live finch (and the dead, fading during the feed); chicks hatch at nests
    const s = this.sim.s, v = this.v, isl = s.isl[i], t = v.t, calm = typeof Fx !== 'undefined' && Fx.calm, sz = Math.max(11, Math.min(24, I.rx / 6.5));
    const nf = isl.birds.filter(b => b.sp === 'f' && !b.song).length, nm = isl.birds.filter(b => b.sp === 'm').length, cap = g.isl.length > 1 ? 22 : s.level === 3 ? 30 : 46;
    const kf = Math.min(1, cap / Math.max(1, nf)), km = Math.min(1, 10 / Math.max(1, nm));   // a drawn sample when the flock is large; the read-outs count every bird
    const list = isl.birds.filter(b => b.song || this.hash(b.id * 7 + 3) < (b.sp === 'm' ? km : kf)).sort((a, b) => this.birdXY(I, a, t)[1] - this.birdXY(I, b, t)[1]);
    let magLab = false;
    for (const b of list) {
      let al = 1, fall = 0;
      if (b.dead) { const at = v.fade[b.id] != null ? v.fade[b.id] : 0.5, u = s.phase === 'feed' ? (v.feedT - at) / 0.2 : 1; if (u >= 1) continue; if (u > 0) { al = 1 - u; fall = u; } }
      let scale = 1; if (v.hatch[b.id] != null) { const h = v.hatch[b.id]; if (h < 0) continue; scale = 0.45 + 0.55 * Math.min(1, h / 1.5); }
      else if (b.chick && s.phase === 'breed') continue;
      const [x, y, lift, face] = calm ? [...this.inIsl(I, ...this.disc(b.id, 0)), 0, 1] : this.birdXY(I, b, t);
      const peck = s.phase === 'feed' && !b.dead && !calm ? Math.max(0, Det.sin(t * 9 + b.id)) : 0;
      c.save(); c.globalAlpha = al;
      if (b.song && !b.dead) { c.strokeStyle = 'rgba(243,230,196,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y - lift * sz * 0.5 + sz * 0.1, sz * 0.8, sz * 0.5, 0, 0, TAU); c.stroke(); }   // the family: a pale ring (luminance) plus its song note (pattern)
      this.finch(c, x, y - lift * sz * 0.5, sz * scale * (b.sp === 'm' ? 1.55 : b.founder ? 1.2 : b.song ? 1.08 : 1), b.z, face, { sp: b.sp, song: b.song, fall, peck, chick: scale < 1, founder: b.founder });
      c.restore();
      if (peck > 0.95 && i === 0 && v.cracks < 400 && !b.dead && this.hash(b.id + Math.floor(t * 3)) < 0.01 && typeof Snd2 !== 'undefined') { v.cracks++; Snd2.play('crack', { x: x + face * sz * 0.6, y }); }
      if (b.song && !b.dead) this.note(c, x + face * sz * 0.1, y - sz * 0.95 - (calm ? 0 : 2 * Det.sin(t * 3 + b.id)));   // the learned song, always shown
      if (b.sp === 'm' && !b.dead && !magLab && s.level === 2 && s.phase !== 'feed') { magLab = true; Lbl.put('arc-mag', this.content.labels.mag, x, y - sz * 1.9, { size: 12 }); }
      if (b.founder && !b.dead && g.isl.length === 1 && s.year < 3) Lbl.put('arc-bigbird', this.content.labels.big, x, y - sz * 2.2, { size: 12 });
    }
  },
  note(c, x, y) {   // cosmetic: a cream song note over a Big Bird family member (the learned song: pattern, not hue)
    c.fillStyle = ARC_C.big; c.strokeStyle = ARC_C.ink; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, 2.6, 2, -0.4, 0, TAU); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(x + 2.4, y); c.lineTo(x + 2.4, y - 8); c.lineTo(x + 5.5, y - 6); c.stroke();
  },
  finch(c, x, y, sz, z, face, o) {   // cosmetic: a side-view ground finch; beak depth drawn to scale (exaggerated ×2 around 9 mm) so you can see it change
    o = o || {}; c.save(); c.translate(x, y); if (o.fall) c.rotate(face * o.fall * 1.4); c.scale(face, 1);
    const body = o.sp === 'm' ? ARC_C.mag : o.chick ? ARC_C.chick : o.song ? ARC_C.famB : ARC_C.bird, bd = sz * Math.max(0.12, 0.2 + 0.075 * (z - 9.5)), bl = sz * (0.36 + 0.03 * (z - 9.5)), hx = sz * 0.42, hy = -sz * 0.42 + (o.peck ? o.peck * sz * 0.22 : 0);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(0, sz * 0.36, sz * 0.5, sz * 0.12, 0, 0, TAU); c.fill();
    c.strokeStyle = '#3A2A1E'; c.lineWidth = Math.max(1, sz * 0.07); c.beginPath(); c.moveTo(-sz * 0.05, sz * 0.12); c.lineTo(-sz * 0.08, sz * 0.36); c.moveTo(sz * 0.12, sz * 0.12); c.lineTo(sz * 0.12, sz * 0.36); c.stroke();
    c.fillStyle = body; c.beginPath(); c.moveTo(-sz * 0.45, -sz * 0.12); c.lineTo(-sz * 0.85, -sz * 0.02); c.lineTo(-sz * 0.45, sz * 0.06); c.fill();   // tail
    c.beginPath(); c.ellipse(0, 0, sz * 0.5, sz * 0.3, -0.12, 0, TAU); c.fill();
    c.strokeStyle = ARC_C.rimL; c.lineWidth = Math.max(1, sz * 0.07); c.beginPath(); c.ellipse(0, 0, sz * 0.5, sz * 0.3, -0.12, Math.PI * 1.05, Math.PI * 1.85); c.stroke();   // the low sun's rim light
    if (o.sp !== 'm' && !o.chick) { c.fillStyle = 'rgba(122,106,88,.55)'; c.beginPath(); c.ellipse(sz * 0.06, sz * 0.12, sz * 0.3, sz * 0.13, 0, 0, TAU); c.fill(); }
    c.fillStyle = body; c.beginPath(); c.arc(hx, hy, sz * 0.25, 0, TAU); c.fill();
    c.strokeStyle = ARC_C.rimL; c.beginPath(); c.arc(hx, hy, sz * 0.25, Math.PI * 1.05, Math.PI * 1.9); c.stroke();
    c.fillStyle = o.sp === 'm' ? ARC_C.magB : ARC_C.beak; c.beginPath(); c.moveTo(hx + sz * 0.14, hy - bd * 0.55); c.quadraticCurveTo(hx + sz * 0.14 + bl * 0.6, hy - bd * 0.45, hx + sz * 0.14 + bl, hy + bd * 0.05); c.lineTo(hx + sz * 0.14, hy + bd * 0.5); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(140,122,100,.7)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(hx + sz * 0.14, hy + bd * 0.02); c.lineTo(hx + sz * 0.14 + bl * 0.9, hy + bd * 0.04); c.stroke();
    c.fillStyle = '#F4EBDA'; c.beginPath(); c.arc(hx + sz * 0.04, hy - sz * 0.06, Math.max(1, sz * 0.06), 0, TAU); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(hx + sz * 0.05, hy - sz * 0.06, Math.max(0.6, sz * 0.035), 0, TAU); c.fill();
    if (o.founder) { c.fillStyle = '#E2B53A'; c.fillRect(-sz * 0.1, sz * 0.24, sz * 0.12, sz * 0.06); }   // a leg band
    c.restore();
  },
  drawFlights(c, g) {   // cosmetic: a migrant finch crossing the sea between islands
    for (const f of this.v.flights) {
      const A = g.isl[f.from], B = g.isl[f.to]; if (!A || !B) continue; const u = f.u, x = A.cx + (B.cx - A.cx) * u, y = A.cy + (B.cy - A.cy) * u - Det.sin(u * Math.PI) * 40;
      const sz = Math.max(11, Math.min(20, A.rx / 6.5)), fl = Det.sin(this.v.t * 30) > 0;
      c.save(); c.translate(x, y); c.fillStyle = ARC_C.bird; c.beginPath(); c.ellipse(0, 0, sz * 0.45, sz * 0.25, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(-sz * 0.1, 0); c.lineTo(-sz * 0.3, fl ? -sz * 0.7 : sz * 0.4); c.lineTo(sz * 0.2, 0); c.fill(); c.restore();
    }
  },
  drawCloud(c, g, I, i) {   // cosmetic: a rain cloud over the island you hold; streaks of rain; drought sun-haze otherwise
    const s = this.sim.s, t = this.v.t, held = s.hold === i && s.phase === 'season', mm = s.rain[i], sel = g.isl.length > 1 && this.v.sel === i && s.phase === 'season' && !s.auto;
    const cx = I.cx + I.rx * 0.1, cy = I.cy - I.ry * 0.95, w = I.rx * 0.8;
    if (s.phase !== 'season' || (!held && mm <= 0)) { if (sel) { c.save(); c.strokeStyle = '#FBF4E4'; c.lineWidth = 2; c.setLineDash([5, 4]); this.path(c, I.shape, 1.16, I.cx, I.cy); c.stroke(); c.restore(); } return; }
    const a = held ? 0.95 : 0.5 + 0.35 * Math.min(1, mm / ARC_M.boom);
    if (held && !(typeof Fx !== 'undefined' && Fx.calm)) {
      c.save(); c.strokeStyle = 'rgba(207,227,242,.8)'; c.lineWidth = 1.4;
      for (let k = 0; k < 26; k++) { const x = cx - w * 0.8 + w * 1.6 * this.hash(k + i * 50), ph = (t * 2.2 + this.hash(k + 7)) % 1, y0 = cy + I.ry * 0.1 + ph * I.ry * 1.2; c.beginPath(); c.moveTo(x, y0); c.lineTo(x - 3, y0 + 9); c.stroke(); }
      c.restore();
    }
    c.save(); c.globalAlpha = a;
    const col = held ? ARC_C.cloudD : ARC_C.cloud;
    for (const [dx, dy, r] of [[-0.45, 0.05, 0.32], [-0.1, -0.12, 0.42], [0.3, -0.02, 0.36], [0.6, 0.08, 0.26]]) { c.fillStyle = col; c.beginPath(); c.arc(cx + dx * w, cy + dy * w, r * w, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(255,190,110,.35)'; c.beginPath(); c.arc(cx - 0.1 * w, cy - 0.2 * w, 0.3 * w, Math.PI * 1.1, Math.PI * 1.8); c.fill();   // sunset rim
    c.restore();
    if (sel) { c.save(); c.strokeStyle = '#FBF4E4'; c.lineWidth = 2; c.setLineDash([5, 4]); this.path(c, I.shape, 1.16, I.cx, I.cy); c.stroke(); c.restore(); }
  },
  gaugeY(I, mm) { return I.gy1 - (I.gy1 - I.gy0) * Math.min(1, mm / ARC_M.rmax); },
  drawGauge(c, g, I, i) {   // the rain gauge: this season's millimetres, with the 50 mm line above which finches breed
    const s = this.sim.s, mm = s.rain[i], x = I.gx, w = I.gw, y0 = I.gy0, y1 = I.gy1, L = this.content.labels;
    c.fillStyle = 'rgba(251,244,228,.85)'; c.beginPath(); c.roundRect ? c.roundRect(x - w / 2, y0, w, y1 - y0, w / 2) : c.rect(x - w / 2, y0, w, y1 - y0); c.fill();
    const yy = this.gaugeY(I, mm); c.fillStyle = '#4C8FD0'; c.fillRect(x - w / 2 + 2, yy, w - 4, Math.max(0, y1 - yy - 2));
    const wy = this.gaugeY(I, ARC_M.wet); c.strokeStyle = ARC_C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(x - w / 2 - 3, wy); c.lineTo(x + w / 2 + 3, wy); c.stroke();
    c.strokeStyle = 'rgba(27,22,18,.8)'; c.lineWidth = 1.5; c.strokeRect(x - w / 2, y0, w, y1 - y0);
    if (g.isl.length === 1) { Lbl.put('arc-g-mm', Txt.f(L.mm, { mm: Math.round(mm) }), x, y0 - 12, { size: 12 }); Lbl.put('arc-g-wet', L.wetLine, x + w / 2 + 6, wy, { size: 12, align: 'left' }); }
    else if (mm > 0) Lbl.put('arc-g-mm' + i, Txt.f(L.mm, { mm: Math.round(mm) }), x, y0 - 12, { size: 12 });
  },
  head(c, hx, hy, R0, z, z0, body) {   // cosmetic: a big finch head in profile, beak to scale; z0 (if given) is the starting beak, dashed in sunset rust
    const beak = (zz, dash) => { const bd = R0 * (0.7 + 0.3 * (zz - 9.5)), bl = R0 * (1.25 + 0.1 * (zz - 9.5)); c.beginPath(); c.moveTo(hx + R0 * 0.75, hy - bd * 0.55); c.quadraticCurveTo(hx + R0 * 0.75 + bl * 0.6, hy - bd * 0.45, hx + R0 * 0.75 + bl, hy + bd * 0.05); c.lineTo(hx + R0 * 0.75, hy + bd * 0.5); c.closePath();
      if (dash) { c.setLineDash([4, 3]); c.strokeStyle = '#B5562C'; c.lineWidth = 2; c.stroke(); c.setLineDash([]); } else { c.fillStyle = ARC_C.beak; c.fill(); c.strokeStyle = 'rgba(140,122,100,.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(hx + R0 * 0.75, hy); c.lineTo(hx + R0 * 0.75 + bl * 0.9, hy + bd * 0.03); c.stroke(); } };
    c.fillStyle = body || ARC_C.bird; c.beginPath(); c.arc(hx, hy, R0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(hx - R0 * 0.6, hy + R0 * 1.0, R0 * 1.1, R0 * 0.6, -0.3, 0, TAU); c.fill();
    beak(z, false); if (z0 != null && Math.abs(z - z0) >= 0.05) beak(z0, true);
    c.fillStyle = '#F4EBDA'; c.beginPath(); c.arc(hx + R0 * 0.25, hy - R0 * 0.2, R0 * 0.2, 0, TAU); c.fill(); c.fillStyle = '#000'; c.beginPath(); c.arc(hx + R0 * 0.3, hy - R0 * 0.2, R0 * 0.11, 0, TAU); c.fill();
  },
  drawPortrait(c, g) {   // the key picture: the average finch's head, beak to scale, the starting beak dashed (level 4: the family beside the residents)
    const s = this.sim.s, S = this.sim, I = s.isl[0], P = g.port, L = this.content.labels, F = s.level === 3 ? S.family(I) : null, f2 = v => (Math.round(v * 100) / 100).toFixed(2);
    const w = F ? Math.min(P.s * 1.7, g.W - 32) : P.s, h = P.s * 0.92, x = F ? Math.max(16, P.x + P.s - w) : P.x, y = P.y, z = S.mean(I);
    c.fillStyle = 'rgba(251,244,228,.92)'; c.strokeStyle = 'rgba(27,22,18,.5)'; c.lineWidth = 1.2; c.beginPath(); if (c.roundRect) c.roundRect(x, y, w, h, 10); else c.rect(x, y, w, h); c.fill(); c.stroke();
    if (!F) {
      this.head(c, x + w * 0.36, y + h * 0.5, w * 0.2, z, I.m0);
      Lbl.put('arc-p-t', L.avg, x + w / 2, y + 11, { size: 12, pill: false, ink: ARC_C.ink });
      Lbl.put('arc-p-v', f2(z) + ' mm', x + w / 2, y + h - 12, { size: 13, pill: false, ink: ARC_C.ink, weight: 700 });
      return;
    }
    const R0 = Math.min(w * 0.1, h * 0.2), a = x + w * 0.25, b = x + w * 0.73;
    this.head(c, a - R0 * 0.6, y + h * 0.48, R0, z, null);
    Lbl.put('arc-p-t', L.fortis, a, y + 11, { size: 12, pill: false, ink: ARC_C.ink }); Lbl.put('arc-p-v', f2(z) + ' mm', a, y + h - 12, { size: 13, pill: false, ink: ARC_C.ink, weight: 700 });
    Lbl.put('arc-p-f', L.famLine, b, y + 11, { size: 12, pill: false, ink: ARC_C.ink });
    if (F.length) { const zf = S.mean(I, F); this.head(c, b - R0 * 0.6, y + h * 0.48, R0, zf, null, ARC_C.famB); this.note(c, b - R0 * 1.6, y + h * 0.26); Lbl.put('arc-p-fv', f2(zf) + ' mm', b, y + h - 12, { size: 13, pill: false, ink: ARC_C.ink, weight: 700 }); }
    else Lbl.put('arc-p-fv', '—', b, y + h / 2, { size: 14, pill: false, ink: ARC_C.ink });
  },
  drawEq(c, g) {   // the key number, plainly: R = h² × S, with this run's values under each symbol once a drought has selected
    const s = this.sim.s, L = this.content.labels, E = g.eq; if (s.level === 3) return;
    const f = x => (x >= 0 ? '+' : '−') + (Math.round(Math.abs(x) * 100) / 100).toFixed(2), sel = s.sel;
    let vals = null;
    if (s.lastS != null && Math.abs(s.lastS) >= 0.15 && s.lastRe != null) vals = [f(s.lastRe), '=', '0.8', '×', f(s.lastS)];
    else if (sel && s.phase !== 'season' && s.phase !== 'ask' && Math.abs(sel.S) >= 0.15) vals = ['…', '=', '0.8', '×', f(sel.S)];
    const top = ['R', '=', 'h²', '×', 'S'], w = [44, 14, 30, 14, 44], x0 = E.x + 8, wd = w.reduce((a, b) => a + b, 0) + 16, ht = vals ? 72 : 34;
    c.save(); c.fillStyle = 'rgba(251,244,228,.93)'; c.strokeStyle = 'rgba(27,22,18,.45)'; c.lineWidth = 1; c.beginPath(); if (c.roundRect) c.roundRect(E.x, E.y - 17, wd, ht, 9); else c.rect(E.x, E.y - 17, wd, ht); c.fill(); c.stroke(); c.restore();
    let x = x0; top.forEach((t, k) => { Lbl.put('arc-eq' + k, t, x + w[k] / 2, E.y, { size: 16, pill: false, ink: ARC_C.ink, weight: 700 }); x += w[k]; });
    if (vals) { x = x0; vals.forEach((t, k) => { Lbl.put('arc-ev' + k, t, x + w[k] / 2, E.y + 22, { size: 13, pill: false, ink: ARC_C.ink, mono: true }); x += w[k]; });
      Lbl.put('arc-em1', L.rMeaning, x0 + w[0] / 2 + 6, E.y + 42, { size: 12, pill: false, ink: '#5C4F44' }); Lbl.put('arc-em2', L.sMeaning, x0 + wd - 40, E.y + 42, { size: 12, pill: false, ink: '#5C4F44' }); }
  },
  drawIslandTags(c, g) {   // L2: each island's name and average beak, plus a small head showing that beak (beside the island on a phone)
    const s = this.sim.s, S = this.sim, L = this.content.labels;
    g.isl.forEach((I, i) => {
      const isl = s.isl[i], n = S.count(isl), z = n ? S.mean(isl) : null, beside = true, al = beside ? (I.side > 0 ? 'right' : 'left') : 'center';
      const x = beside ? (I.side > 0 ? I.cx - I.rx * 1.12 - 4 : I.cx + I.rx * 1.12 + 4) : I.cx, y = beside ? I.cy - 10 : I.cy + I.ry * 1.05 + 14;
      Lbl.put('arc-n' + i, L[isl.key], x, y, { size: 12, pill: false, ink: '#FBF4E4', align: al });
      if (z != null) { const lx = beside ? x + (I.side > 0 ? -22 : 22) : x + 8; Lbl.put('arc-z' + i, z.toFixed(1) + ' mm', lx, y + 20, { size: 12, align: al }); this.finch(c, beside ? x + (I.side > 0 ? -8 : 8) : x - 34, y + 22, 14, z, I.side > 0 ? -1 : 1, {}); }
    });
  },
  /* ---------- the live graph (strip) and the debrief chart ---------- */
  notes() {
    const s = this.sim.s, S = this.sim, L = this.content.labels, cap = this.content.captions, I = s.isl[0], f2 = x => (Math.round(x * 100) / 100).toFixed(2), stats = [];
    if (s.level === 1) { stats.push([L.sSpread, f2(S.spread(s)) + ' mm', cap.mSpread]); s.isl.forEach(J => stats.push([L[J.key], f2(S.mean(J)) + ' mm', ''])); return { stats, charts: [this.trendSpec(false)] }; }
    if (s.level === 3) { stats.push([L.sFam, String(S.family(I).length), cap.mFam], [L.sGen, String(Math.max(0, S.famGen(s))), cap.mGen], [L.sBeak, f2(S.mean(I)) + ' mm', cap.mBeak]); return { stats, charts: [this.trendSpec(false), Object.assign(this.dotsSpec(), { fold: false })] }; }
    stats.push([L.sBeak, f2(S.mean(I)) + ' mm', cap.mBeak], [L.sBirds, String(S.count(I)), cap.mBirds], [L.sYear, (s.year + 1 > s.years ? s.years : s.year + 1) + ' of ' + s.years, '']);
    return { stats, charts: [this.dotsSpec(), Object.assign(this.trendSpec(false), { fold: false })] };
  },
  dotsSpec() {   // beak depths this year: survivors solid, the dead hollow, chicks hatched; S and R arrows
    const s = this.sim.s, S = this.sim, L = this.content.labels, sel = s.sel, I = s.isl[0], groups = [];
    if (sel && s.phase !== 'season' && s.phase !== 'ask') {
      groups.push({ v: sel.surv, style: 'solid', label: L.surv }); if (sel.dead.length) groups.push({ v: sel.dead, style: 'hollow', label: L.died }); if (sel.chicks.length) groups.push({ v: sel.chicks, style: 'hatched', label: L.chicks });
    } else groups.push({ v: S.fortis(I).map(b => b.z), style: 'solid' });
    const spec = { type: 'dots', title: L.tBeaks, bins: 24, x: { lo: 6.5, hi: 12.5, label: L.beak }, groups, frame: 'designed' };
    if (sel && s.phase !== 'season' && s.phase !== 'ask') { if (sel.mc != null && sel.par != null && Math.abs(sel.par - sel.ref) >= 0.15) spec.arrows = { S: [sel.ref, sel.par], R: [sel.ref, sel.mc] }; else if (Math.abs(sel.S) >= 0.15) spec.arrows = { S: [sel.m0, sel.ms] }; }
    return spec;
  },
  trendSpec(card) {   // average beak per year (L2: one line per island; L4: the family's size)
    const s = this.sim.s, L = this.content.labels, R0 = s.rec, marks = R0.filter(r => r.dry).map(r => r.y - 0.5);
    if (s.level === 3) return { type: 'trace', title: L.tFam, x: { lo: 0, hi: s.years, label: L.year }, y: { lo: 0, hi: 30, label: L.count }, series: [{ d: R0.map(r => [r.y, r.f]), ink: 'ink', label: L.famLine }], marks: [ARC_LV[3].forced + 0.5], frame: 'designed' };
    if (s.level === 1) return { type: 'trace', title: L.tIsl, x: { lo: 0, hi: s.years, label: L.year }, y: { lo: 7.5, hi: 12.5, label: 'mm' }, series: s.isl.map((J, i) => ({ d: R0.map(r => [r.y, r.n[i] ? r.m[i] : null]), ink: 'ink', label: L[J.key] })), frame: 'designed' };
    const lo = Math.floor(Math.min(...R0.map(r => r.m[0])) - 0.3), hi = Math.ceil(Math.max(...R0.map(r => r.m[0])) + 0.3);
    return { type: 'trace', title: L.tAvg, x: { lo: 0, hi: s.years, label: L.year }, y: { lo: Math.min(lo, 9), hi: Math.max(hi, 10), label: 'mm' }, series: [{ d: R0.map(r => [r.y, r.m[0]]), ink: 'ink', label: card ? L.avgBeak : '' }], ghost: [{ d: [[0, s.isl[0].m0], [s.years, s.isl[0].m0]], label: L.was }], marks, frame: 'designed' };
  }
};
V2.push(CH_ARCH_V2);

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.arch = ARC_TEXT.take;
  MODEL.arch = 'Each finch has a heritable beak depth (h² = 0.8). Each seed size is shared among the beaks that handle it, and well-fed finches survive. Rain adds small seeds and chicks; droughts leave each island’s lasting seeds. Large ground finches are held fixed.';
  RECALL.arch = { q: 'Drought survivors’ beaks average 0.6 mm deeper than before. With h² = 0.8, how much deeper will their chicks’ beaks be?', opts: [['a', 'About 0.5 mm'], ['b', 'About 0.6 mm'], ['c', 'About 0.8 mm']], ans: 'a', why: 'R = h² × S = 0.8 × 0.6 ≈ 0.5 mm.' };
  BRIDGE.arch = 'You have watched selection in one place. Now the weather sets the food on many islands, and the food shapes the beaks.';
  if (TRANSFER.arch) delete TRANSFER.arch;
}
