/* ================= v2/jaws.js: Left Jaw, Right Jaw (Act 5; D1 §3.3, D5 §4 item 7) =================
   You guard a school of cichlids in Lake Tanganyika. Scale-eaters (Perissodus) dart in from behind and bite a flank; each one
   mostly strikes one side, set by its twisted jaw (a continuous, partly inherited trait). Tap a flank to raise a guard plate
   (1.2 s; at most two up). You cannot see the jaw until the strike, so you guard the side most bites come from. That habit is
   the selection: the commoner side goes hungry, the rarer side feeds and breeds, and the share swings (negative frequency
   dependence). Five levels:
     L0 One fish        one prey, one plate; h² 0.9 (×N). The rare side feeds better.
     L1 The school      three fish, two plates: triage is the selection; the young answer last season's guards (overshoot).
     L2 Partly inherited h² 0.25 (realistic): drag where the young's mean twist lands (R = h²S, the Wood L2 echo).
     L3 Two hunters     a second, striped species shares the prey; one defender selects both, so their swings line up.
     L4 The lizard wheel (boss) side-blotched lizards, rock–paper–scissors; you are a blue mate-guarder blocking yellow sneakers.
                        Rarity is no shield: a morph rises when the morph it beats is common (inverts L0–L3).
   What if? (the freezer) thaws the last season and runs eight more with one lever: guards split evenly, no inheritance, always
   guard right; in the boss: no arrivals from other rocks, weak or perfect blocking.
   Code shape (API_v2 §9): a headless sim (plain JSON, R()/Det/Gen/WF only; a run is (seed, level, actions)); all words in
   JW_TEXT; the view juices from Sim.run's events only. Load rule: top-level code touches only legacy objects and lower-numbered
   v2 files (Rig, LiveGraph); every engine call at run time is behind a typeof guard. Under ?v1=1 the learning-layer rewrites at
   the foot are skipped. */

/* ---------- all words (API_v2 §9.2); tests/lint_text.js checks every budget ---------- */
const JW_TEXT = {
  firstWords: 'Scale-eaters dart in from behind and bite a flank. Tap the flank you expect them to bite.',
  hud: {
    swim0: 'Tap a flank to guard it. A guard lasts a moment.',
    swim: 'Guard the flank you expect them to bite.',
    swimN: 'Two guards, three fish. Guard where the next bites will land.',
    unt: 'Place your guards, then press Strike.',
    dusk: 'Season over. Well-fed scale-eaters leave the most young.',
    ask: 'Where will right-strikers be next season? Drag the diamond, then Lock in.',
    askZ: 'Where will the young’s mean twist land? Drag the line, then Lock in.',
    askB: 'Where will striped right-strikers be next season? Drag, then Lock in.',
    breed: 'The young replace their parents.',
    liz: 'Tap the side a yellow sneaker comes from. Orange males cannot be stopped.',
    lizU: 'A sneaker waits. Tap its side to chase it off.',
    lizDusk: 'Season over. Each morph’s young depend on whom it beat.',
    lizAsk: 'Where will the rocks be next season? Tap the triangle, then Lock in.',
    auto: 'What if? Eight seasons, run fast.',
    over: 'Done.'
  },
  whispers: {
    drag: 'Drag the diamond first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No prediction this time.',
    rare: 'The rarer side slips through.', orange: 'Orange males are too strong.', untimed: 'Untimed: place guards, then Strike.',
    both: 'Two at once: one gets through.', guard2: 'Two guards at most.'
  },
  labels: {
    left: 'Left', right: 'Right', lp: 'Left {p}%', rp: 'Right {p}%', season: 'Season {n}', strike: 'Strike', lock: 'Lock in',
    fed: 'Fed', hungry: 'Hungry', young: 'Young', parents: 'Parents', plain: 'Plain', striped: 'Striped', twist: 'jaw twist', share: 'right-strikers',
    half: '50:50', exp: 'expected', xn: 'Selection ×N', xnL: 'Strength ×N', seasons: 'season', blocked: '{p}% blocked',
    O: 'O', B: 'B', Y: 'Y', you: 'you', kept: '{n} kept', ff: 'Tap: faster', now: 'now'
  },
  interesting: {
    flat: 'The share stayed near where it began. Did your guards follow the commoner side, or fall at random?',
    oneway: 'One side kept losing, past 50:50. Guarding the same side every time is steady selection, not frequency dependence.',
    bitten: 'Many bites landed. With few guards and fast attacks, the side you left open fed well.',
    slow: 'The share moved only a little. Heritability this low gives a small response, however hard you select.',
    apart: 'The two species moved apart this time. Chance in who bred can outweigh the shared push.',
    stalled: 'The wheel stopped at yellow. Block under half the sneakers and yellow beats blue as well as orange.',
    equal: 'With guards split evenly, neither side fed better. The share wandered by chance alone.',
    equalMoved: 'With guards split evenly there was no push either way. What moved the share was chance in breeding.',
    noinherit: 'Without inheritance the young came back to the founders’ mix every season. Selection left no trace.',
    always: 'Always guarding right starved right-strikers, season after season. Steady selection pushes one way only.',
    nofloor: 'With no lizards arriving from other rocks, one morph was lost. The wheel cannot turn without it.',
    poor: 'With weak blocking, yellow beat blue too. Yellow took the rocks and stayed.',
    perfect: 'With every sneaker blocked, the wheel kept turning: blue, orange, yellow, blue.'
  },
  live: { season: 'Season {n}. Right-strikers {p}%.', ask: 'Prediction open. Press P, then the arrows.', liz: 'Season {n}. Orange {o}%, blue {b}%, yellow {y}%.' },
  data: {
    season: ['Season', '{n} of {m}', 'Each season is one generation of scale-eaters.'],
    share: ['Right-strikers', 'Share of strikes aimed at the right flank.'], shareB: ['Striped right-strikers', 'The second species.'],
    blocked: ['Blocked', '{b} of {a} attacks', 'Your guards in the right place, in time.'],
    S: ['Selection S', 'Fed mean twist minus everyone’s.'], R: ['Response R', 'Young mean twist minus their parents’.'],
    h2: ['h²', 'The inherited share of twist variation.'], morphs: ['Orange, blue, yellow', 'Shares of the three throat morphs.'],
    b: ['Sneakers blocked', 'This season. Above half, blue beats yellow.'],
    titles: { trace: 'Right-strikers', hist: 'Jaw twist', tri: 'Three morphs', liz: 'Morph shares' },
    gen: 'season {n} of {m}', genAuto: 'what if: season {n}'
  },
  levers: { equal: 'Guard evenly', noinherit: 'No inheritance', always: 'Always right', nofloor: 'No arrivals', poor: 'Weak blocking', perfect: 'Block all' },
  take: 'When the rare type does better, neither type wins for long. When each beats another, they chase round.',
  body: 'You blocked {b}% of sneakers. The leading morph went {seq}. Blue beat yellow only while you blocked over half.',
  whatifBody: [
    'Eight seasons with one change. Right-strikers went {p0}% → {p1}%, crossing 50:50 {x} times.',
    'Twelve seasons with one change. The leading morph went {seq}.'
  ],
  law: { title: 'Rare does better' },
  boss: { inverts: 'Rarity is no shield here: a morph rises when the morph it beats is common.' },
  stars: {
    discover: 'Block over half the bites and watch the share swing past 50:50 and back.',
    predict: 'In two levels, land two predictions inside the band.',
    transfer: 'Keep the lizard wheel turning and land two triangle predictions.'
  },
  levelStars: [
    { discover: 'Block 55% of bites and see the share cross 50:50 and come back.' },
    { discover: 'Block half the bites and see the share cross 50:50 and come back.', predict: 'Land two of three predictions inside the band.' },
    { discover: 'Block half the bites and move the share 8 points towards 50:50.', predict: 'Land two of three predictions inside the band.' },
    { discover: 'Block half the bites and keep both species moving together.', predict: 'Land two of three predictions inside the band.' },
    { discover: 'Keep the wheel turning: blue, orange, yellow, then blue again.', transfer: 'Land two of three triangle predictions inside the band.' }
  ],
  levelTake: [
    'Your guards made the common side go hungry. The rare side fed, bred and became common.',
    'Scarce guards protect the common side. So the rare type rises, and the young overshoot.',
    'Little heritability, little response. Hard selection moved the young only a quarter of the way.',
    'One defender selects both species, so their swings line up.'
  ],
  levelBody: [
    'Right-strikers went {p0}% → {p1}%, crossing 50:50 {x} times. You blocked {b}% of bites. The side you guarded less fed better and left more young.',
    'Right-strikers went {p0}% → {p1}%, crossing 50:50 {x} times. You guarded the commoner side {t}% of the time. Young answer last season’s guards, so the swing overshoots.',
    'Each season your guards fed a group whose twist differed by {s} on average. Their young differed by only {r}. Most twist variation here comes from development.',
    'Plain right-strikers went {a0}% → {a1}%; striped went {b0}% → {b1}%. They moved the same way in {k} of {n} seasons, because one guard blocks both.'
  ],
  model: [
    { level: 0, simulated: 'Forty scale-eaters. Each strikes the right flank with a chance set by its jaw twist: four additive genes plus development. Young come in proportion to scales eaten.',
      simplification: 'A season is a generation. You stand in for the prey’s vigilance. The jaw shows only at the strike.',
      params: [{ name: 'heritability h²', value: 0.9, tag: 'xN', real: 'about 0.2 in Perissodus' }, { name: 'scale-eaters', value: 40, tag: 'designed' }, { name: 'young per scale eaten', value: 'about 20 to 1 against the hungry', tag: 'xN', real: 'much weaker selection in the lake' }, { name: 'guard length', value: '1.2 s', tag: 'designed' }, { name: 'seasons', value: 6, tag: 'xN', real: 'years per swing' }],
      cannot: 'Prey that remember attacks, or scale-eaters that switch sides.',
      nature: 'Hori followed Perissodus for about a decade. The share swung around 50:50, with a period of about five years.', contested: false, refs: ['hori1993', 'takeuchi2012'] },
    { level: 1, simulated: 'Three prey fish and two guard plates. Each plate covers one flank of one fish. The young answer last season’s guards.',
      simplification: 'Each attack picks a fish at random. Twist is the only trait that matters for feeding.',
      params: [{ name: 'heritability h²', value: 0.9, tag: 'xN', real: 'about 0.2' }, { name: 'prey fish', value: 3, tag: 'designed' }, { name: 'guards', value: 2, tag: 'designed' }],
      cannot: 'Years of overlap between generations, which stretch real swings to about five years.',
      nature: 'Prey are bitten more on the flank they guard less. Nobody computes: guarding follows experience.', contested: false, refs: ['hori1993'] },
    { level: 2, simulated: 'The same lake, but development adds most of the twist variation. Heritability is about 0.25.',
      simplification: 'Development is random and never passed on.',
      params: [{ name: 'heritability h²', value: 0.25, tag: 'realistic' }, { name: 'scale-eaters', value: 40, tag: 'designed' }],
      cannot: 'Learning by the scale-eaters, which may sharpen their side preference.',
      nature: 'Twist heritability is about 0.2, with a large developmental part. Whether twist has one mode or two is debated.', contested: false, refs: ['lee2015', 'raffini2019'] },
    { level: 3, simulated: 'Two scale-eater species, forty each, share the prey. Your guards block both alike.',
      simplification: 'This synchrony is a model prediction: one defender selects both species.',
      params: [{ name: 'heritability h²', value: 0.9, tag: 'xN', real: 'about 0.2' }, { name: 'species', value: 2, tag: 'designed' }],
      cannot: 'Competition between the two species for prey.',
      nature: 'Several Tanganyika scale-eaters strike mostly one flank. Whether their swings line up in the lake is not settled here.', contested: false, refs: ['hori1993'] },
    { level: 4, simulated: '150 male side-blotched lizards. Orange usurps blue, blue guards against yellow, yellow sneaks past orange. Three of each morph arrive from other rocks each season.',
      simplification: 'Your block rate sets how well blue does against yellow. Each morph’s young depend on whom it beats.',
      params: [{ name: 'males', value: 150, tag: 'designed' }, { name: 'strength of selection', value: 5, tag: 'xN', real: 'weaker in the field' }, { name: 'arrivals per morph', value: 3, tag: 'designed' }],
      cannot: 'Females, whose own morphs cycle too, and the yearly turnover of real lizards.',
      nature: 'Sinervo and Lively saw the morphs cycle blue, orange, yellow over about four to five years.', contested: false, refs: ['sinervo1996'] }
  ],
  why: {
    real: ['Side-blotched lizards near Los Baños, California: orange males hold big territories and take blue males’ females. Yellow males sneak past orange. Blue males guard against yellow.'],
    maths: ['A morph’s fitness rises with the share of the morph it beats. It falls with the share of the morph that beats it. No mix is stable, so the shares cycle.']
  },
  levelWhy: [
    { real: ['Michio Hori watched Perissodus in Lake Tanganyika for about ten years. Whichever jaw was common did worse, and the share swung around 50:50.'],
      maths: ['Call p the share striking the right flank. When p is high, prey guard the right more, so right-strikers feed less. Fitness falls as p rises.'] },
    { real: ['Prey cannot see a scale-eater coming from behind. They watch the flank they are bitten on most, so the commoner side meets more resistance.'],
      maths: ['The young reflect last season’s feeding, not this season’s. Strong selection plus that lag makes the share overshoot 50:50, then swing back.'] },
    { real: ['Studies of Perissodus find twist heritability near 0.2. Much of the twist comes from development, which is not passed on.'],
      maths: ['Breeders write R = h²S. With h² near 0.25, the young keep about a quarter of the twist difference you selected.'] },
    { real: ['Lake Tanganyika holds several scale-eating cichlids. A striped one mimics the fish it feeds on.'],
      maths: ['Both species meet the same guards. When most strikes come from the right, right-strikers of both species go hungry.'] }
  ]
};

/* ---------- levels (sim parameters; P holds the tunable, tagged values) ---------- */
const JW_LV = [
  { nf: 1, plates: 1, att: 12, seasons: 6, m: [1.0], hk: 'h2', thr: 0.55, ask: 'y', asks: 2 },
  { nf: 3, plates: 2, att: 16, seasons: 7, m: [-0.95], hk: 'h2', thr: 0.5, ask: 'y', asks: 3 },
  { nf: 3, plates: 2, att: 18, seasons: 6, m: [1.0], hk: 'h2low', thr: 0.5, ask: 'x', asks: 3 },
  { nf: 3, plates: 2, att: 20, seasons: 6, m: [1.0, -0.5], hk: 'h2', thr: 0.5, ask: 'b', asks: 3 },
  { boss: true, seasons: 8, c0: [40, 70, 40] }
];
const JW_T = { lead: 0.12, veer: 0.16, guard: 1.2, dawn: 0.7, dusk: 1.3, breed: 1.5, askMax: 25, auto: 0.45, autoN: 8, lunge: 0.55, W: 0.12, tolY: 0.07, tolX: 0.08, tolT: 0.12 };

const CH_JAWS_V2 = {
  id: 'jaws', v2: true, role: 'environment', place: 'lake',
  intro: { goal: 'Guard the school; watch the rare jaw do better.' },
  content: JW_TEXT,
  P: {
    N: { v: 40, tag: 'designed', min: 20, max: 80, label: 'scale-eaters' },
    h2: { v: 0.9, tag: 'xN', min: 0, max: 1, real: 'about 0.2', label: 'heritability' },
    h2low: { v: 0.25, tag: 'realistic', min: 0, max: 1, label: 'heritability, partly inherited' },
    base: { v: 0.05, tag: 'xN', min: 0.01, max: 1, real: 'weaker selection in the lake', label: 'young with no scales' },
    guard: { v: 1.2, tag: 'designed', min: 0.6, max: 3, label: 'guard seconds' },
    K: { v: 5, tag: 'xN', min: 1, max: 8, real: 'weaker in the field', label: 'lizard selection' },
    F: { v: 3, tag: 'designed', min: 0, max: 10, label: 'arrivals per morph' }
  },
  levels: [
    { name: 'One fish', adds: 'frequency dependence', codes: ['C3'], minutes: 3 },
    { name: 'The school', adds: 'scarce guards', codes: ['C3'], minutes: 3 },
    { name: 'Partly inherited', adds: 'low heritability', codes: ['B2'], minutes: 3 },
    { name: 'Two hunters', adds: 'a second species', codes: ['C3'], minutes: 4 },
    { name: 'The lizard wheel', adds: 'rock–paper–scissors', codes: ['C4'], minutes: 4 }
  ],
  keys: { ArrowLeft: 'guard left flank', ArrowRight: 'guard right flank', 1: 'pick fish one', 2: 'pick fish two', 3: 'pick fish three', Space: 'strike or speed dusk', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['If twist were not inherited, would the share still swing?', 'Why does the lizard cycle run one way round?', 'Why does the model need lizards arriving from other rocks?'], pool: 'trace' },
  starTraits: ['twist'],
  encodings: [   // twist is read as jaw bend (shape) and histogram side (position); lizard morphs by throat pattern and letter; no hue carries a score
    { k: 'twist', rgb: [79, 75, 64], channels: ['shape', 'luminance'] },
    { k: 'O', rgb: [217, 142, 74], channels: ['pattern', 'letter'] }, { k: 'B', rgb: [79, 120, 168], channels: ['pattern', 'letter'] }, { k: 'Y', rgb: [184, 174, 102], channels: ['pattern', 'letter'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, Gen, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null, _lay: {},
    cfg(n) { return JW_LV[Math.max(0, Math.min(4, n | 0))]; },
    lay(h2) { const k = 'h' + h2; if (!this._lay[k]) this._lay[k] = Gen.layout([{ k: 'tw', n: 4, m0: 0, s0: Math.sqrt(h2), mu: 0, msd: 0, ve: Math.sqrt(Math.max(0, 1 - h2)), lo: -4, hi: 4, det: true }]); return this._lay[k]; },
    h2(s) { const P = CH_JAWS_V2.P; return s.level === 2 ? P.h2low.v : P.h2.v; },
    L(s) { return this.lay(this.h2(s)); },
    pr(z) { return 1 / (1 + Det.exp(-z / JW_T.W)); },   // chance of striking the right flank: mostly one-flanked (D1)
    born(lay, g, sp) { const z = Gen.ph(lay, g, 'tw'); return { g, z: Math.round(z * 1e4) / 1e4, a: Math.round(Gen.add(lay, g, 'tw') * 1e4) / 1e4, sp }; },
    share(list) { let t = 0; for (const x of list) t += this.pr(x.z); return list.length ? t / list.length : 0.5; },
    pops(s) { return s.pop.length > 1 ? [s.pop[0], s.pop[1]] : [s.pop[0]]; },
    pAll(s) { let t = 0, n = 0; for (const P of s.pop) for (const x of P) { t += this.pr(x.z); n++; } return n ? t / n : 0.5; },
    mean(a) { let t = 0; for (const v of a) t += v; return a.length ? t / a.length : 0; },
    tapp(s) { return Math.max(0.6, 1.05 - 0.08 * (s.season - 1)); },
    lead(f) { return Math.max(0, Math.min(1, f)); },

    reset(level, o) {
      o = o || {}; const c = this.cfg(level), P = CH_JAWS_V2.P;
      if (o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.lever(o.thaw.lever); return; }
      this.s = { level: level | 0, boss: !!c.boss, phase: 'dawn', t: 0, T: 0, season: 1, seasons: c.seasons, unt: false, att: 0, blk: 0, reach: 0, onCommon: 0,
        asks: [], pred: {}, exp: {}, now: {}, tol: {}, hits: {}, ask: null, askAt: 0, whatif: null, wseason: 0, hist: [], first: level === 0, log: [] };
      const s = this.s;
      if (c.boss) { s.c = c.c0.slice(); s.N = c.c0[0] + c.c0[1] + c.c0[2]; s.trail = [s.c.map(v => v / s.N)]; s.lead = [this.lizLead(s.trail[0])]; s.bs = []; s.guard = null; s.cur = []; s.queue = []; s.orange = 0; s.sAtt = 0; s.sBlk = 0; s.kept = 0; s.lost = 0; }
      else {
        const lay = this.L(s); s.pop = []; s.ps = [];
        for (let sp = 0; sp < c.m.length; sp++) { const pop = []; for (let i = 0; i < P.N.v; i++) pop.push(this.born(lay, Gen.genome(lay, { tw: { m: c.m[sp] } }), sp)); s.pop.push(pop); s.ps.push([Math.round(this.share(pop) * 1e4) / 1e4]); }
        s.plates = []; s.wave = null; s.next = 0.4; s.left = c.att; s.tally = [0, 0, 0, 0]; s.m0 = c.m.slice();
      }
      this.dawn([]);
    },
    dawn(ev) {
      const s = this.s; s.phase = 'dawn'; s.t = 0; s.T = 0;
      if (s.boss) { const x = s.trail[s.trail.length - 1]; this.lizQueue(s, x); s.sAtt = 0; s.sBlk = 0; s.orange = 0; s.guard = null; s.cur = []; s.next = 0.5; }
      else { const c = this.cfg(s.level); s.plates = []; s.wave = null; s.next = 0.4; s.left = c.att; s.tally = [0, 0, 0, 0]; }
      ev.push({ k: 'dawn', season: s.season });
    },
    lever(k) {   // What if? (D1 G9): the frozen dusk, one thing changed, then eight (boss: twelve) seasons run fast
      const s = this.s; s.whatif = k; s.ask = null; s.phase = 'auto'; s.t = 0; s.wseason = 0;
      if (s.boss) { s.wc = s.c.slice(); s.wtrail = [s.c.map(v => v / s.N)]; s.wlead = [this.lizLead(s.wtrail[0])]; return; }
      s.wps = s.ps.map(a => [a[a.length - 1]]); s.wpop = s.pop; s.wrule = this.rule(s);
    },
    rule(s) { const r = s.att ? s.reach / s.att : 0.9, t = s.reach ? s.onCommon / s.reach : 0.5; return { r: Math.max(0.3, Math.min(1, r)), t }; },   // your habit: share of attacks you guarded, and of those, share on the commoner side

    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt;
      if (s.phase === 'dawn') { if (s.t >= JW_T.dawn) { s.phase = 'swim'; s.t = 0; s.T = 0; ev.push({ k: 'swim' }); } }
      else if (s.phase === 'swim') { if (s.boss) this.lizStep(dt, ev); else this.swimStep(dt, ev); }
      else if (s.phase === 'dusk') { if (s.t >= JW_T.dusk) this.afterDusk(ev); }
      else if (s.phase === 'ask') { if (!s.unt && s.t >= JW_T.askMax) this.commit(ev, s.ask.id, null); }
      else if (s.phase === 'breed') { if (s.t >= JW_T.breed) { if (s.season >= s.seasons) { s.phase = 'over'; ev.push({ k: 'over' }); } else { s.season++; this.dawn(ev); } } }
      else if (s.phase === 'auto') { if (s.t >= JW_T.auto) { s.t = 0; if (s.boss) this.lizAuto(ev); else this.autoSeason(ev); } }
      return ev;
    },

    /* ---------- the fish: waves, plates, strikes ---------- */
    swimStep(dt, ev) {
      const s = this.s, c = this.cfg(s.level); s.T += dt;
      const w = s.wave;
      if (w) { if (!w.veered && s.T >= w.tb - JW_T.veer) this.veer(ev); if (s.T >= w.tb) this.resolve(ev); }   // strikes first: a plate up at the bite counts even if it lapses this tick
      if (!s.unt) s.plates = s.plates.filter(p => p.t1 > s.T);
      if (!s.wave) { if (s.left <= 0) this.endSeason(ev); else if (s.T >= s.next) this.spawn(ev, c); }
    },
    spawn(ev, c) {
      const s = this.s, pPair = c.nf > 1 ? 0.3 + 0.06 * s.season : 0, k = Math.min(s.left, c.nf, R() < pPair ? 2 : 1), fish = [];
      while (fish.length < k) { const f = (R() * c.nf) | 0; if (fish.indexOf(f) < 0) fish.push(f); }
      const wait = s.unt || (s.first && s.att === 0 && !s.plates.length);   // the very first wave waits for your first guard: the first action cannot fail
      s.wave = { att: fish.map(f => ({ f, sp: -1, i: -1, side: -1 })), t0: s.T, tb: wait ? 1e9 : s.T + this.tapp(s), veered: false };
      ev.push({ k: 'spawn', fish: fish.slice(), tb: s.wave.tb });
    },
    veer(ev) {   // who strikes, and on which side, is drawn only now: the jaw is never visible before the strike
      const s = this.s, w = s.wave, two = s.pop.length > 1;
      for (const a of w.att) {
        const sp = two ? (R() < s.pop[0].length / (s.pop[0].length + s.pop[1].length) ? 0 : 1) : 0, i = (R() * s.pop[sp].length) | 0;
        a.sp = sp; a.i = i; a.side = R() < this.pr(s.pop[sp][i].z) ? 1 : 0;
      }
      w.veered = true; ev.push({ k: 'veer', att: w.att.map(a => ({ f: a.f, side: a.side, sp: a.sp, z: s.pop[a.sp][a.i].z })) });
    },
    resolve(ev) {
      const s = this.s, w = s.wave, common = this.pAll(s) >= 0.5 ? 1 : 0;
      for (const a of w.att) {
        const pl = s.plates.find(p => p.f === a.f), up = !!pl && (s.unt || (pl.t0 <= w.tb - JW_T.lead && pl.t1 >= w.tb)), blocked = up && pl.side === a.side;
        s.tally[a.side * 2] += 1; if (!blocked) s.tally[a.side * 2 + 1] += 1;   // [aL, bL, aR, bR]
        s.att++; if (blocked) s.blk++; if (up) { s.reach++; if (pl.side === common) s.onCommon++; }
        ev.push({ k: blocked ? 'block' : 'bite', f: a.f, side: a.side, sp: a.sp, z: s.pop[a.sp][a.i].z, guarded: up });
      }
      s.left -= w.att.length; s.wave = null; s.next = s.T + 0.35 + 0.35 * R();
      if (s.unt) s.plates = [];
    },
    guard(ev, f, side) {
      const s = this.s, c = this.cfg(s.level); if (s.phase !== 'swim' && s.phase !== 'dawn') return;
      f = Math.max(0, Math.min(c.nf - 1, f | 0)); side = side ? 1 : 0;
      if (s.phase === 'dawn') { s.phase = 'swim'; s.t = 0; s.T = 0; }
      const old = s.plates.find(p => p.f === f), dur = CH_JAWS_V2.P.guard.v;
      if (old) { if (old.side === side) old.t1 = s.unt ? 1e9 : s.T + dur; else { old.side = side; old.t0 = s.unt ? -1 : s.T; old.t1 = s.unt ? 1e9 : s.T + dur; } }
      else {
        let drop = null; if (s.plates.length >= c.plates) { drop = s.plates.reduce((a, b) => (b.t0 < a.t0 ? b : a)); s.plates = s.plates.filter(p => p !== drop); }
        s.plates.push({ f, side, t0: s.unt ? -1 : s.T, t1: s.unt ? 1e9 : s.T + dur }); if (drop) ev.push({ k: 'drop', f: drop.f, side: drop.side });
      }
      ev.push({ k: 'guard', f, side });
      if (s.wave && s.wave.tb >= 1e9 && !s.unt) s.wave.tb = s.T + this.tapp(s);   // the first wave starts its run once you have guarded
    },
    strike(ev) { const s = this.s; if (s.unt && s.phase === 'swim' && s.wave && s.wave.tb >= 1e9) { s.wave.tb = s.T + JW_T.veer + 0.25; ev.push({ k: 'strike' }); } },
    skip(ev) {   // teacher step: the rest of the season resolves at once, by your own habit (logged, so a replay agrees)
      const s = this.s; if (s.phase !== 'swim' || s.boss) return;
      const rl = this.rule(s), two = s.pop.length > 1; s.wave = null;
      while (s.left > 0) {
        const sp = two && R() < 0.5 ? 1 : 0, x = s.pop[sp][(R() * s.pop[sp].length) | 0], side = R() < this.pr(x.z) ? 1 : 0, common = this.pAll(s) >= 0.5 ? 1 : 0;
        const up = R() < rl.r, gs = R() < rl.t ? common : 1 - common, blocked = up && gs === side;
        s.tally[side * 2]++; if (!blocked) s.tally[side * 2 + 1]++; s.att++; if (blocked) s.blk++; if (up) { s.reach++; if (gs === common) s.onCommon++; } s.left--;
      }
      ev.push({ k: 'skip' }); this.endSeason(ev);
    },
    succ(t) { return [(t[1] + 0.5) / (t[0] + 1), (t[3] + 0.5) / (t[2] + 1)]; },   // bite success on the left and right flank this season (smoothed)
    fit(x, sc) { const p = this.pr(x.z); return CH_JAWS_V2.P.base.v + p * sc[1] + (1 - p) * sc[0]; },   // young in proportion to scales eaten, plus a small floor
    endSeason(ev) {
      const s = this.s, sc = this.succ(s.tally), lay = this.L(s); s.phase = 'dusk'; s.t = 0;
      const rec = { season: s.season, sL: sc[0], sR: sc[1], tally: s.tally.slice(), sp: [] };
      for (const pop of s.pop) {
        const w = pop.map(x => this.fit(x, sc)), wt = w.reduce((a, b) => a + b, 0), zs = pop.map(x => x.z), zm = this.mean(zs), fm = pop.reduce((a, x, i) => a + w[i] * x.z, 0) / wt;
        const am = this.mean(pop.map(x => x.a)); let caz = 0, vz = 0; for (const x of pop) { caz += (x.a - am) * (x.z - zm); vz += (x.z - zm) * (x.z - zm); }
        rec.sp.push({ p: this.share(pop), zm, fm, S: fm - zm, h2: vz > 0 ? Math.max(0, Math.min(1, caz / vz)) : 0, zs: zs.map(z => Math.round(z * 100) / 100) });
      }
      for (const r0 of s.hist) for (const q of r0.sp) delete q.zs;   // only the latest parents are kept (the debrief histogram)
      s.hist.push(rec); ev.push({ k: 'dusk', season: s.season, sL: sc[0], sR: sc[1] });
    },
    afterDusk(ev) { const s = this.s; if (this.openAsk(ev)) return; this.breed(ev); },
    openAsk(ev) {
      const s = this.s, n = s.level, c = this.cfg(n); if (s.whatif) return false;
      if (s.boss) {
        if (s.asks.length >= 3) return false;
        const x = s.trail[s.trail.length - 1], e = this.lizNext(s.c, this.lizB(s), CH_JAWS_V2.P.F.v, s.N), corner = Math.min(...[0, 1, 2].map(k => this.triErr(e, [0, 1, 2].map(j => j === k ? 1 : 0))));
        if (corner < 0.1 || this.triErr(e, x) < 0.2 || this.triErr(e, [1 / 3, 1 / 3, 1 / 3]) < 1.25 * JW_T.tolT) return false;
        const id = 'L4s' + s.season, ld = this.lizLead(x); s.ask = { id, kind: 'tri', tol: JW_T.tolT, start: [0, 1, 2].map(j => j === ld ? 1 : 0) };
        s.exp[id] = e; s.now[id] = x.slice();
      } else {
        if (s.asks.length >= c.asks) return false;
        const r = s.hist[s.hist.length - 1], id = 'L' + n + 's' + s.season;
        if (c.ask === 'x') {   // R = h²S on the twist histogram (the Wood L2 echo)
          const q = r.sp[0], e = q.zm + q.h2 * q.S, tol = JW_T.tolX; if (Math.abs(e - q.zm) < 1.25 * tol || Math.abs(e) < 1.25 * tol) return false;
          s.ask = { id, kind: 'x', lo: -3, hi: 3, tol, start: q.zm >= 0 ? 2.7 : -2.7 }; s.exp[id] = e; s.now[id] = q.zm; s.fedm = q.fm;
        } else {
          const sp = c.ask === 'b' ? 1 : 0, now = s.ps[sp][s.ps[sp].length - 1], e = this.expShare(s, sp, 300, 7001 + 97 * s.season + 13 * n), tol = JW_T.tolY;
          if (Math.abs(e - now) < 1.25 * tol || Math.abs(e - 0.5) < tol || Math.abs(e - (1 - now)) < 0.75 * tol) return false;   // an ask counts only where every fixed rule misses: no change, back to 50:50, the mirror image
          s.ask = { id, kind: 'y', lo: 0, hi: 1, tol, start: now >= 0.5 ? 1 : 0, at: s.season + 1, sp }; s.exp[id] = e; s.now[id] = now;
        }
      }
      s.tol[s.ask.id] = s.ask.tol; s.asks.push(s.ask.id); s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id: s.ask.id }); return true;
    },
    expShare(s, sp, reps, seedv) {   // the expectation for the next season's share: the breeding below replayed on a private PRNG (R() untouched)
      const r = rng(seedv), pop = s.pop[sp], lay = this.L(s), L = lay.L, n = lay.T.tw.n, ve = lay.T.tw.ve, sc = this.succ(s.tally);
      const w = pop.map(x => this.fit(x, sc)), cum = []; let t = 0; for (const v of w) { t += v; cum.push(t); }
      const pick = () => { const u = r() * t; let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cum[m] > u) hi = m; else lo = m + 1; } return pop[lo]; };
      const gau = () => { let u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Det.log(u)) * Det.cos(TAU * r()); };
      let acc = 0;
      for (let k = 0; k < reps; k++) for (let i = 0; i < pop.length; i++) {
        const a = pick().g, b = pick().g; let A = 0; for (let j = 0; j < n; j++) A += (r() < 0.5 ? a[j] : a[L + j]) + (r() < 0.5 ? b[j] : b[L + j]);
        acc += this.pr(Math.max(-4, Math.min(4, A + ve * gau())));
      }
      return acc / (reps * pop.length);
    },
    triErr(a, b) { const d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2]; return Math.sqrt((d0 * d0 + d1 * d1 + d2 * d2) / 2); },
    commit(ev, id, v) {
      const s = this.s; if (!s.ask || s.ask.id !== id) return;
      const A = s.ask, e = s.exp[id], now = s.now[id];
      let hit = false;
      if (v != null) {
        if (A.kind === 'tri') { const f = [0, 1, 2].map(k => Math.max(0, +v[k] || 0)), t = f[0] + f[1] + f[2] || 1; v = f.map(x => x / t); const d = this.triErr(v, e); hit = d <= A.tol && d < this.triErr(v, now); }
        else { v = Math.max(A.lo, Math.min(A.hi, +v)); const d = Math.abs(v - e); hit = d <= A.tol && d < Math.abs(v - now) && (A.kind !== 'x' || d < Math.abs(v - s.fedm)); }   // closer to the expectation than to "no change" (and, for R, than to the fed mean)
      }
      s.pred[id] = v; s.hits[id] = hit; s.ask = null; ev.push({ k: 'commit', id });
      this.breed(ev, id);
    },
    breed(ev, rid) {
      const s = this.s; s.phase = 'breed'; s.t = 0;
      if (s.boss) { this.lizBreed(ev, rid); return; }
      const sc = this.succ(s.tally), lay = this.L(s), rec = s.hist[s.hist.length - 1];
      s.pop = s.pop.map((pop, sp) => {
        const w = pop.map(x => this.fit(x, sc)), cum = []; let t = 0; for (const v of w) { t += v; cum.push(t); }
        const pick = () => { const u = R() * t; for (let i = 0; i < cum.length; i++) if (u < cum[i]) return pop[i]; return pop[pop.length - 1]; };
        const kids = []; for (let i = 0; i < pop.length; i++) { const a = pick(), b = pick(); kids.push(this.born(lay, Gen.mate(lay, a.g, b.g), sp)); }
        return kids;
      });
      s.pop.forEach((pop, sp) => { s.ps[sp].push(Math.round(this.share(pop) * 1e4) / 1e4); rec.sp[sp].ym = this.mean(pop.map(x => x.z)); rec.sp[sp].R = rec.sp[sp].ym - rec.sp[sp].zm; });
      ev.push({ k: 'breed', season: s.season, reveal: rid || null });
    },
    autoSeason(ev) {   // a What if? season, resolved at once: attacks drawn with R(), guards by the lever's rule
      const s = this.s, c = this.cfg(s.level), lay = this.L(s), rl = s.wrule, k = s.whatif, two = s.wpop.length > 1, t = [0, 0, 0, 0];
      const pAll = () => { let a = 0, n = 0; for (const P of s.wpop) for (const x of P) { a += this.pr(x.z); n++; } return a / n; };
      const common = pAll() >= 0.5 ? 1 : 0;
      for (let i = 0; i < c.att; i++) {
        const sp = two && R() < 0.5 ? 1 : 0, x = s.wpop[sp][(R() * s.wpop[sp].length) | 0], side = R() < this.pr(x.z) ? 1 : 0, up = R() < rl.r;
        const gs = k === 'equal' ? (R() < 0.5 ? 1 : 0) : k === 'always' ? 1 : (R() < rl.t ? common : 1 - common), blocked = up && gs === side;
        t[side * 2]++; if (!blocked) t[side * 2 + 1]++;
      }
      const sc = this.succ(t);
      s.wpop = s.wpop.map((pop, sp) => {
        if (k === 'noinherit') { const out = []; for (let i = 0; i < pop.length; i++) out.push(this.born(lay, Gen.genome(lay, { tw: { m: s.m0[sp] } }), sp)); return out; }   // no inheritance: young drawn afresh from the founders' mix
        const w = pop.map(x => this.fit(x, sc)), cum = []; let tt = 0; for (const v of w) { tt += v; cum.push(tt); }
        const pick = () => { const u = R() * tt; for (let i = 0; i < cum.length; i++) if (u < cum[i]) return pop[i]; return pop[pop.length - 1]; };
        const kids = []; for (let i = 0; i < pop.length; i++) kids.push(this.born(lay, Gen.mate(lay, pick().g, pick().g), sp)); return kids;
      });
      s.wpop.forEach((pop, sp) => s.wps[sp].push(Math.round(this.share(pop) * 1e4) / 1e4));
      s.wseason++; ev.push({ k: 'autogen', n: s.wseason });
      if (s.wseason >= JW_T.autoN) { s.phase = 'over'; ev.push({ k: 'over' }); }
    },

    /* ---------- the boss: side-blotched lizards (rock–paper–scissors with a 3-per-morph input floor) ---------- */
    lizLead(x) { return x[0] >= x[1] && x[0] >= x[2] ? 0 : x[1] >= x[2] ? 1 : 2; },   // 0 O, 1 B, 2 Y
    lizB(s) { return s.sAtt ? s.sBlk / s.sAtt : 0.5; },
    lizW(x, b) { const K = CH_JAWS_V2.P.K.v, e = 2 * b - 1, M = [[0, 1, -1], [-1, 0, e], [1, -e, 0]]; return M.map(r => Det.exp(K * (r[0] * x[0] + r[1] * x[1] + r[2] * x[2]))); },   // O beats B, B beats Y (entry 2b − 1), Y beats O
    lizQ(c, b, N) { const x = c.map(v => v / N), w = this.lizW(x, b), xw = x.map((v, i) => v * w[i]), t = xw[0] + xw[1] + xw[2]; return xw.map(v => v / t); },
    lizNext(c, b, F, N) { const q = this.lizQ(c, b, N); return q.map(v => (v * (N - 3 * F) + F) / N); },   // the expectation: the binomial draws below have this mean
    lizQueue(s, x) {   // this season's intruders: 4 + 8y yellow sneakers and 4o orange usurpers, shuffled
      const nY = 4 + Math.round(8 * x[2]), nO = Math.round(4 * x[0]), q = []; for (let i = 0; i < nY; i++) q.push('Y'); for (let i = 0; i < nO; i++) q.push('O');
      for (let i = q.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0, t = q[i]; q[i] = q[j]; q[j] = t; }
      s.queue = q;
    },
    lizStep(dt, ev) {
      const s = this.s; s.T += dt;
      if (s.cur.length && s.T >= s.cur[0].tb) this.lizResolve(ev);   // arrivals first: a lunge up at the arrival counts even if it lapses this tick
      if (s.guard && s.T > s.guard.t1 + 0.05) s.guard = null;
      if (!s.cur.length) {
        if (!s.queue.length) { this.lizEnd(ev); return; }
        if (s.T >= s.next) {
          const k = s.queue.shift(), x = s.trail[s.trail.length - 1], side = R() < 0.5 ? 0 : 1, tb = s.unt && k === 'Y' ? 1e9 : s.T + Math.max(0.75, 1.15 - 0.05 * (s.season - 1)) + (k === 'O' ? 0.3 : 0);   // orange cannot be stopped, so it never waits
          s.cur = [{ k, side, tb }];
          if (k === 'Y' && s.queue.indexOf('Y') >= 0 && R() < 0.3 * x[2]) { s.queue.splice(s.queue.indexOf('Y'), 1); s.cur.push({ k: 'Y', side: 1 - side, tb }); }   // when yellow is common, two sneak at once
          ev.push({ k: 'intrude', cur: s.cur.map(q => ({ k: q.k, side: q.side })) });
        }
      }
    },
    lizResolve(ev) {
      const s = this.s;
      for (const q of s.cur) {
        if (q.k === 'O') { s.orange++; s.lost++; ev.push({ k: 'orange', side: q.side }); continue; }
        const g = s.guard, blocked = !!g && g.side === q.side && g.t0 <= q.tb + 1e-9 && g.t1 >= q.tb - 0.05;
        s.sAtt++; s.att++; if (blocked) { s.sBlk++; s.blk++; s.kept++; } else s.lost++;
        ev.push({ k: blocked ? 'chase' : 'sneak', side: q.side });
      }
      s.cur = []; s.guard = null; s.next = s.T + 0.35 + 0.35 * R();
    },
    lunge(ev, side) {
      const s = this.s; if (s.phase !== 'swim' && s.phase !== 'dawn') return; side = side ? 1 : 0;
      if (s.phase === 'dawn') { s.phase = 'swim'; s.t = 0; s.T = 0; }
      s.guard = { side, t0: s.T, t1: s.T + JW_T.lunge }; ev.push({ k: 'lunge', side, orange: s.cur.some(q => q.k === 'O' && q.side === side) });
      if (s.unt && s.cur.length) { for (const q of s.cur) q.tb = s.T; this.lizResolve(ev); }
    },
    lizEnd(ev) { const s = this.s, b = this.lizB(s); s.bs.push(Math.round(b * 1000) / 1000); s.phase = 'dusk'; s.t = 0; s.hist.push({ season: s.season, b, orange: s.orange }); ev.push({ k: 'dusk', season: s.season, b }); },
    lizBreed(ev, rid) {
      const s = this.s, F = CH_JAWS_V2.P.F.v, q = this.lizQ(s.c, this.lizB(s), s.N), m = WF.multinom(s.N - 3 * F, q);
      s.c = [m[0] + F, m[1] + F, m[2] + F]; const x = s.c.map(v => v / s.N); s.trail.push(x); s.lead.push(this.lizLead(x));
      ev.push({ k: 'breed', season: s.season, reveal: rid || null });
    },
    lizAuto(ev) {
      const s = this.s, k = s.whatif, F = k === 'nofloor' ? 0 : CH_JAWS_V2.P.F.v, b = k === 'poor' ? 0.3 : k === 'perfect' ? 1 : this.lizB(s), q = this.lizQ(s.wc, b, s.N), m = WF.multinom(s.N - 3 * F, q);
      s.wc = [m[0] + F, m[1] + F, m[2] + F]; const x = s.wc.map(v => v / s.N); s.wtrail.push(x); s.wlead.push(this.lizLead(x));
      s.wseason++; ev.push({ k: 'autogen', n: s.wseason });
      if (s.wseason >= 12) { s.phase = 'over'; ev.push({ k: 'over' }); }
    },
    turned(lead) { let q = ''; for (const l of lead) if (q[q.length - 1] !== 'OBY'[l]) q += 'OBY'[l]; return /BOYB|OYBO|YBOY/.test(q); },   // a full turn of the wheel, in its order

    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      if (a.k === 'guard' && !s.boss) this.guard(ev, a.f, a.side);
      else if (a.k === 'lunge' && s.boss) this.lunge(ev, a.side);
      else if (a.k === 'strike') this.strike(ev);
      else if (a.k === 'skip') this.skip(ev);
      else if (a.k === 'unt') { s.unt = !!a.on; if (s.unt && s.plates) s.plates.forEach(p => { p.t0 = -1; p.t1 = 1e9; }); ev.push({ k: 'unt', on: s.unt }); }
      else if (a.k === 'predict' && s.ask && a.id === s.ask.id) this.commit(ev, a.id, a.moved === false ? null : a.v);
      return ev;
    },

    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_JAWS_V2.stars, n = s.level, mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, interesting: this.interesting(s) };
    },
    crossings(d) { let k = 0; for (let i = 1; i < d.length; i++) if ((d[i] - 0.5) * (d[i - 1] - 0.5) < 0) k++; return k; },
    aligned(s) { const A = s.ps[0], B = s.ps[1]; let same = 0, opp = 0; for (let i = 1; i < A.length; i++) { const da = A[i] - A[i - 1], db = B[i] - B[i - 1]; if (Math.max(Math.abs(da), Math.abs(db)) < 0.03) continue; if (da * db > 0) same++; else opp++; } return { same, opp, n: A.length - 1 }; },
    interesting(s) {   // chosen from what happened (failure is data, D1 G9)
      if (s.whatif) {
        const k = s.whatif;
        if (s.boss) { if (k === 'nofloor') return s.wtrail.some(x => Math.min(...x) === 0) ? 'nofloor' : null; if (k === 'poor') return 'poor'; return this.turned(s.wlead) ? 'perfect' : null; }
        if (k === 'equal') { const d = s.wps[0]; return Math.abs(d[d.length - 1] - d[0]) > 0.15 ? 'equalMoved' : 'equal'; }
        if (k === 'always') { const d = s.wps[0]; return d[d.length - 1] < d[0] - 0.15 ? 'always' : null; }
        return 'noinherit';
      }
      if (s.boss) return this.turned(s.lead) ? null : s.bs.some(b => b < 0.5) ? 'stalled' : null;
      const c = this.cfg(s.level), br = s.blk / Math.max(1, s.att), d = s.ps[0], x = this.crossings(d), moved = Math.abs(d[0] - 0.5) - Math.abs(d[d.length - 1] - 0.5);
      if (s.level === 3) { const al = this.aligned(s); if (al.opp > 1 && br >= c.thr) return 'apart'; }
      if (br < c.thr) return 'bitten';
      if (s.level === 2) return moved < 0.08 ? 'slow' : null;
      if (x === 1 && Math.abs(d[d.length - 1] - 0.5) > 0.2) return 'oneway';
      if (x === 0 && moved < 0.1) return 'flat';
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.phase === 'swim' || s.phase === 'dawn') {
        if (s.boss) out.push({ k: 'lunge', side: 0 }, { k: 'lunge', side: 1 });
        else { const c = this.cfg(s.level); for (let f = 0; f < c.nf; f++) out.push({ k: 'guard', f, side: 0 }, { k: 'guard', f, side: 1 }); if (s.unt && s.wave) out.push({ k: 'strike' }); }
      } else if (s.ask) {
        const A = s.ask;
        if (A.kind === 'tri') { for (let i = 0; i <= 20; i++) for (let j = 0; j <= 20 - i; j++) out.push({ k: 'predict', id: A.id, v: [i / 20, j / 20, (20 - i - j) / 20] }); }
        else { const n = A.kind === 'x' ? 120 : 100; for (let k = 0; k <= n; k++) out.push({ k: 'predict', id: A.id, v: A.lo + (A.hi - A.lo) * k / n }); }
      }
      return out;
    },
    /* bots (bots.js): (s, acts, rnd) → action | null; 'random' is generic. None may earn three stars in a level, nor across the unit. */
    bots: {
      alwaysA(s, acts) { const sim = CH_JAWS_V2.sim; if (s.ask) return acts.find(a => a.k === 'predict') || null; return sim.botGuard(s, () => 0, true); },
      alwaysB(s, acts) { const sim = CH_JAWS_V2.sim; if (s.ask) return acts.filter(a => a.k === 'predict').pop() || null; return sim.botGuard(s, () => 1, true); },
      greedy(s, acts) {   // the commoner-side bot (D1's oracle): guards the commoner side of every threatened fish; predicts "no change"
        const sim = CH_JAWS_V2.sim; if (s.ask) return sim.botPredict(s, acts, 'now');
        return sim.botGuard(s, () => (sim.pAll(s) >= 0.5 ? 1 : 0));
      },
      threshold(s, acts) {   // guards the side bitten more last season (a lagged rule); predicts a return to 50:50 (the triangle's centre)
        const sim = CH_JAWS_V2.sim; if (s.ask) return sim.botPredict(s, acts, 'half');
        const r = s.hist[s.hist.length - 1], side = r && r.tally ? (r.tally[3] >= r.tally[1] ? 1 : 0) : 1; return sim.botGuard(s, () => side);
      },
      lazy(s, acts, rnd) { if (s.ask) return { k: 'predict', id: s.ask.id, v: s.ask.start, moved: false }; return CH_JAWS_V2.sim.bots.greedy(s, acts, rnd); },
      mirror(s, acts, rnd) {   // predicts the reflection of the current share about 50:50 (a "full overshoot" rule), the corner of the morph that beats the leader
        const sim = CH_JAWS_V2.sim; if (s.ask) return sim.botPredict(s, acts, 'mirror');
        return CH_JAWS_V2.sim.bots.greedy(s, acts, rnd);
      },
      expert(s, acts) {   // the oracle's expert: commoner side, and the expectation itself (it reads s.exp: a test policy, never in a sweep)
        const sim = CH_JAWS_V2.sim; if (s.ask) return { k: 'predict', id: s.ask.id, v: s.exp[s.ask.id] };
        return sim.botGuard(s, () => (sim.pAll(s) >= 0.5 ? 1 : 0));
      }
    },
    botGuard(s, sideOf, fixed) {   // shared by the bots: one plate per threatened fish, raised early enough; boss: lunge at each yellow sneaker's side (fixed: always the same side)
      if (s.phase !== 'swim') return null;
      if (s.boss) { const y = s.cur.find(q => q.k === 'Y'); if (!y) return null; const side = fixed ? sideOf() : y.side; if (s.guard && s.guard.side === side && s.guard.t1 > s.T + 0.04) return null; return { k: 'lunge', side }; }
      if (!s.wave) return null;
      const side = sideOf();
      for (const a of s.wave.att) { const p = s.plates.find(q => q.f === a.f); if (!p || p.side !== side || (!s.unt && p.t1 < s.wave.tb + 0.02)) return { k: 'guard', f: a.f, side }; }
      if (s.unt) return { k: 'strike' };
      return null;
    },
    botPredict(s, acts, how) {
      const A = s.ask, now = s.now[A.id], P = acts.filter(a => a.k === 'predict'), near = v => P.reduce((b, a) => (Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b));
      if (A.kind === 'tri') {
        const ld = this.lizLead(now), tgt = how === 'now' ? now : how === 'half' ? [1 / 3, 1 / 3, 1 / 3] : [0, 1, 2].map(j => j === (ld + 2) % 3 ? 1 : 0);   // the morph that beats the leader: O beats B, Y beats O, B beats Y
        return P.reduce((b, a) => (this.triErr(a.v, tgt) < this.triErr(b.v, tgt) ? a : b));
      }
      if (how === 'now') return near(now);
      if (how === 'half') return near(A.kind === 'x' ? 0 : 0.5);
      return near(A.kind === 'x' ? -now : 1 - now);
    }
  },

  /* ---------- stars, against the expectation for the parameters in force (never the realised run) ---------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false; const sim = CH_JAWS_V2.sim;
      if (n === 4) return sim.turned(s.lead);
      const c = sim.cfg(n); if (s.blk / Math.max(1, s.att) < c.thr) return false;
      const d = s.ps[0];
      if (n <= 1) return sim.crossings(d) >= 2;
      if (n === 2) return Math.abs(d[0] - 0.5) - Math.abs(d[d.length - 1] - 0.5) >= 0.08;
      const al = sim.aligned(s); return al.same >= 4 && al.opp <= 1;
    },
    predict: (s, n) => { if (s.whatif || n < 1 || n > 3) return false; let k = 0; for (const id of s.asks) if (s.hits[id]) k++; return k >= 2; },
    transfer: (s, n) => { if (s.whatif || n !== 4) return false; let k = 0; for (const id of s.asks) if (s.hits[id]) k++; return k >= 2; }
  },
  unitStars(lv) {   // D1: Discover in two fish levels; Predict in two of L1–L3; Transfer = the boss wheel turned and its triangle predicted
    const m = i => lv[i] | 0, cnt = (a, b, bit) => { let k = 0; for (let i = a; i <= b; i++) if (m(i) & bit) k++; return k; };
    return (cnt(0, 3, 1) >= 2 ? 1 : 0) | (cnt(1, 3, 2) >= 2 ? 2 : 0) | ((m(4) & 5) === 5 ? 4 : 0);
  },
  /* result code (30 bits) on assignment links: 0–2 level, 3–5 mask, 6–12 blocked %, 13–19 final right-striker % (boss: leader string as base 3),
     20–23 crossings of 50:50 (boss: seasons blue led), 24–29 guarded-commoner-side % ÷ 2 */
  resultBits(s, level) {
    if (!s) return 0; const n = Math.max(0, Math.min(4, level | 0)), st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(v)));
    let bits = n | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 3 | c(100 * s.blk / Math.max(1, s.att), 127) << 6;
    if (s.boss) { let v = 0; for (const l of s.lead.slice(-4)) v = v * 3 + l; bits |= c(v, 127) << 13 | c(s.lead.filter(l => l === 1).length, 15) << 20; }
    else { const d = s.ps[0]; bits |= c(100 * d[d.length - 1], 127) << 13 | c(this.sim.crossings(d), 15) << 20 | c(50 * (s.reach ? s.onCommon / s.reach : 0), 63) << 24; }
    return bits >>> 0;
  },

  /* ================= view: lifecycle, input, juice, drawing (D4 §5.3 Jaws timings; juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = false; this._asking = null;
    this.v = { t: 0, hold: -1, ff: false, focus: -1, banner: null, scars: [], flash: {}, recoil: [], fry: null, lunge: null, intr: [], gone: [], said: {}, bg: null, bgk: '', crowd: null, crowdK: '', fly: [], slide: {}, off: [], thaw: !!o.thaw };
    Sim.start(this, n, o);
    const ui = Save.d && Save.d.ui;
    if (!o.thaw && !o.replay && ui && ui.unt) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    this.dock(); this.hud();
    const name = this.levels[n] && this.levels[n].name, s = this.sim.s;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: o.thaw ? this.content.levers[s.whatif] || name : name, t: 0, ms: Math.max(900, ms + 300) }; });
    this.v.ghost0 = n === 0 && !o.thaw;
  },
  phoneStrip() { return typeof Strip !== 'undefined' && !!Strip.isOpen && typeof Strip.phone === 'function' && Strip.phone(); },
  hudH() {   // the HUD's real bottom over the canvas (it wraps to three lines on a phone); measured at most twice a second
    const z = (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56, v = this.v || {}, now = v.t || 0;
    if (v.hh != null && now - (v.hhT || 0) < 0.5) return v.hh;
    let h = z; try { const el = document.getElementById('hud'), cv = Stage.cv; if (el && cv && el.getBoundingClientRect) { const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect(); if (a.height > 0) h = Math.max(z, Math.min(Stage.h * 0.3, a.bottom - b.top)); } } catch (e) { }
    if (this.v) { this.v.hh = h; this.v.hhT = now; } return h;
  },
  /* ---------- geometry ---------- */
  geo() {
    const W = Stage.w, H = Stage.h, u = Stage.u || Math.min(W, 1.2 * H), top = this.hudH() + 34, floor = Math.max(64, Math.min(120, H * 0.17)), c = this.sim.cfg(this.level), nf = c.nf || 1;
    const len = nf === 1 ? Math.max(120, Math.min(230, 0.4 * u, (H - top - floor) * 0.55)) : Math.max(84, Math.min(150, 0.26 * u, W / 3.4, (H - top - floor) * 0.48));
    const y = top + (H - top - floor) * 0.42, xs = nf === 1 ? [W / 2] : [W * 0.2, W * 0.5, W * 0.8];
    return { W, H, u, top, floor, fy: H - floor, len, wid: len * 0.4, y, xs, nf };
  },
  flank(G, f, side) { return [G.xs[f] + (side ? 1 : -1) * G.wid * 0.62, G.y + G.len * 0.04]; },
  ghostAt() { const G = this.geo(), s = this.sim.s; return this.flank(G, 0, this.sim.pAll(s) >= 0.5 ? 1 : 0); },

  /* ---------- the frame ---------- */
  update(dt) {
    const v = this.v;
    for (const e of Sim.run(this, 0)) this.juice(e);   // live actions first, so a Lock in starts the hold before the sim moves on
    if (v.hold >= 0) { v.hold += dt; if (!this.phoneStrip() || v.hold > 1.6) v.hold = -1; }
    const s0 = this.sim.s, ff = v.ff && /dusk|breed|auto/.test(s0.phase) ? 3 : 1;
    const ev = Sim.run(this, v.hold >= 0 ? 0 : dt * ff), s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt;
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (v.ghost0 && !v.banner) { v.ghost0 = false; if (s.att === 0 && typeof Ghost !== 'undefined') Ghost.show({ verb: 'tap', key: 'ArrowRight', at: () => this.ghostAt(), until: () => this.sim.s.att > 0 || (this.sim.s.plates && this.sim.s.plates.length > 0) }); }
    for (const k in v.flash) { v.flash[k] -= dt; if (v.flash[k] <= 0) delete v.flash[k]; }
    v.recoil = v.recoil.filter(r => (r.t += dt) < 0.9); v.off = v.off.filter(q => (q.t += dt) < 0.12); v.gone = v.gone.filter(g => (g.t += dt) < 0.8); v.fly = v.fly.filter(f => (f.t += dt) < f.d);
    if (v.lunge) { v.lunge.t += dt; if (v.lunge.t > 0.4) v.lunge = null; }
    if (v.fry && v.hold < 0 && (typeof Predict === 'undefined' || !Predict.opened)) v.fry.t += dt * ff;   // the young hatch once the phone strip has folded, in view
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; v.fold = 1; }
    if (v.fold && v.hold < 0) { v.fold = 0; if (typeof Predict !== 'undefined' && Predict.fold) Predict.fold(); }   // the phone strip folds once the reveal has been read, so the young hatch in view
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; v.ff = false; this.dock(); }
    this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  hud() {
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; if (typeof HUD === 'undefined') return;
    let t;
    if (s.phase === 'auto') t = C.auto;
    else if (s.boss) t = s.phase === 'ask' ? C.lizAsk : s.phase === 'dusk' || s.phase === 'breed' ? C.lizDusk : s.unt ? C.lizU : C.liz;
    else if (s.phase === 'ask') t = s.ask && s.ask.kind === 'x' ? C.askZ : s.ask && s.ask.sp ? C.askB : C.ask;
    else if (s.phase === 'dusk') t = C.dusk;
    else if (s.phase === 'breed') t = C.breed;
    else if (s.phase === 'over') t = C.over;
    else if (this.level === 0 && s.att === 0 && s.season === 1) t = this.content.firstWords;
    else t = s.unt ? C.unt : this.level === 0 ? (s.season === 1 ? C.swim0 : C.swim) : C.swimN;
    const num = Txt.f(L.blocked, { p: Math.round(100 * s.blk / Math.max(1, s.att)) }), sig = t + num;
    if (sig !== this._hudSig) { this._hudSig = sig; HUD.say(t, num); }
    const bar = typeof document !== 'undefined' && document.getElementById ? document.getElementById('bar-gen') : null;
    if (bar) bar.textContent = s.phase === 'auto' ? Txt.f(this.content.data.genAuto, { n: s.wseason + 1 }) : Txt.f(this.content.data.gen, { n: Math.min(s.season, s.seasons), m: s.seasons });
  },
  dock() {
    if (typeof Dock === 'undefined') return; const s = this.sim.s, L = this.content.labels, sig = s.phase + (s.unt ? 'u' : '') + (s.ask ? s.ask.id : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'jw-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (s.unt && s.phase === 'swim' && !s.boss) { Dock.set([{ id: 'jw-strike', label: L.strike, key: ' ', primary: true, fn: () => Sim.act(this, { k: 'strike' }) }]); return; }
    Dock.set([]);
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    const soft = s.unt ? null : 20, chart = A.kind === 'x' ? 1 : 0, wh = this.content.whispers;
    const o = { id: A.id, chart, kind: A.kind, start: A.start, tol: A.tol, soft, needMove: true, linger: 1100, onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null, moved: false }) };   // the soft timer: no prediction, and the dusk moves on
    if (A.kind === 'tri') o.say = this.content.live.ask; else { o.axis = { lo: A.lo, hi: A.hi }; if (A.kind === 'y') o.at = A.at; }
    Predict.ask(o);
    if (typeof Live !== 'undefined') Live.say(this.content.live.ask);
    this._dockSig = ''; this.dock();
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(s.ask.kind === 'x' ? 1 : 0); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'jw-' + k); },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, o = { level: n, mask: r.mask, final: n === 4, interesting: r.interesting }, V = this.bodyVars();
    if (s.whatif) { o.body = Txt.f(C.whatifBody[s.boss ? 1 : 0], V); o.take = null; }
    else if (n < 4) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.boss.inverts; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    const last = typeof Freezer !== 'undefined' ? Freezer.list(this.id).slice(-1)[0] : null;
    if (last && !s.whatif) o.whatIf = { gen: last.gen, levers: n === 4 ? ['nofloor', 'poor', 'perfect'] : ['equal', 'noinherit', 'always'] };
    o.why = n < 4 ? C.levelWhy[n] : C.why;
    let spec = this.notes().charts[0];
    const rec = s.hist[s.hist.length - 1], q = rec && rec.sp && rec.sp[0];
    if (n === 2 && !s.whatif && q && q.zs && q.ym != null) {   // the breeder's equation in one picture: parents, their young, S and R
      const L = this.content.labels; spec = { type: 'dots', title: this.content.data.titles.hist, bins: 24, x: { lo: -3, hi: 3, label: L.twist }, frame: 'designed',
        groups: [{ v: q.zs, style: 'hollow', label: L.parents }, { v: s.pop[0].map(x => x.z), style: 'hatched', label: L.young }], arrows: { S: [q.zm, q.fm], R: [q.zm, q.ym] } };
      o.bodyFirst = true;
    }
    if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  bodyVars() {
    const s = this.sim.s, pc = v => Math.round(100 * v), sim = this.sim, f2 = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
    if (s.boss) { const L = s.whatif ? s.wlead : s.lead; let q = ''; for (const l of L) if (q.slice(-1) !== 'OBY'[l]) q += 'OBY'[l]; const sat = s.bs.length ? s.bs.reduce((a, b) => a + b, 0) / s.bs.length : 0; return { b: pc(sat), seq: q.split('').join(' → ') }; }
    if (s.whatif) { const d = s.wps[0]; return { p0: pc(d[0]), p1: pc(d[d.length - 1]), x: sim.crossings(d) }; }
    const d = s.ps[0], V = { p0: pc(d[0]), p1: pc(d[d.length - 1]), x: sim.crossings(d), b: pc(s.blk / Math.max(1, s.att)), t: pc(s.reach ? s.onCommon / s.reach : 0) };
    if (s.level === 2) { let S = 0, R0 = 0, k = 0; for (const r of s.hist) if (r.sp[0].R != null) { S += Math.abs(r.sp[0].S); R0 += Math.abs(r.sp[0].R); k++; } V.s = f2(k ? S / k : 0); V.r = f2(k ? R0 / k : 0); }
    if (s.level === 3) { const B = s.ps[1], al = sim.aligned(s); V.a0 = pc(d[0]); V.a1 = pc(d[d.length - 1]); V.b0 = pc(B[0]); V.b1 = pc(B[B.length - 1]); V.k = al.same; V.n = al.n; }
    return V;
  },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, S2 = typeof Snd2 !== 'undefined' ? Snd2 : null, C = this.content, W = Stage.w;
    const G = s.boss ? null : this.geo();
    switch (e.k) {
      case 'dawn':
        v.scars = []; v.fry = null; v.intr = [];
        if (e.season > 1 || v.thaw) { if (typeof Snd !== 'undefined' && Snd.dawn) Snd.dawn(); v.banner = { text: Txt.f(C.labels.season, { n: e.season }), t: 0, ms: 900 }; }
        if (typeof Live !== 'undefined') Live.say(s.boss ? Txt.f(C.live.liz, { n: e.season, o: Math.round(100 * s.trail[s.trail.length - 1][0]), b: Math.round(100 * s.trail[s.trail.length - 1][1]), y: Math.round(100 * s.trail[s.trail.length - 1][2]) }) : Txt.f(C.live.season, { n: e.season, p: Math.round(100 * s.ps[0][s.ps[0].length - 1]) }));
        return;
      case 'guard': { const p = this.flank(G, e.f, e.side); v.slide[e.f] = { t0: v.t, side: e.side }; if (F) { F.tier(1); F.ring(p[0], p[1], 10, { ms: 160 }); } if (typeof Snd !== 'undefined') Snd.click(); return; }
      case 'drop': v.off.push({ f: e.f, side: e.side, t: 0 }); if (!v.said.g2 && this.level > 0) { v.said.g2 = 1; this.whisper('guard2'); } return;   // the oldest plate slides off (120 ms)
      case 'spawn': if (F && !s.unt) for (const f of e.fish) F.ring(G.xs[f], G.y + G.len * 0.7, 10, { dashed: true, ms: 260 }); return;   // a telegraph in the murk behind the target
      case 'veer': return;
      case 'block': {
        const p = this.flank(G, e.f, e.side); v.flash[e.f + ':' + e.side] = 0.09; v.recoil.push({ f: e.f, side: e.side, z: e.z, sp: e.sp, t: 0, ok: true });
        if (F) { F.ring(p[0], p[1], 14, { ms: 200 }); F.pop('+1', p[0] + (e.side ? 18 : -18), p[1] - 22, 1); }
        if (S2) S2.play('tock', { x: p[0], y: p[1] }); return;
      }
      case 'bite': {
        const p = this.flank(G, e.f, e.side); v.scars.push({ f: e.f, side: e.side, y: (this.hash(s.att + ':' + e.f) % 100) / 100 }); v.recoil.push({ f: e.f, side: e.side, z: e.z, sp: e.sp, t: 0, ok: false });
        if (F) { F.hitstop(50); F.shake(5, 180); F.burst('scale', p[0], p[1], 6); F.pop('−1', p[0] + (e.side ? 18 : -18), p[1] - 22, -1); }
        if (S2) S2.play('scale', { x: p[0], y: p[1] });
        if (!e.guarded && this.level > 0 && !v.said.rare && s.att > 6) { v.said.rare = 1; this.whisper('rare'); }
        return;
      }
      case 'strike': if (F) F.tier(1); return;
      case 'dusk':
        if (F) F.tier(2); if (S2) S2.play('dusk', { x: W / 2, y: Stage.h / 2, twin: false });
        if (!s.boss) for (const sc of v.scars) { const p = this.flank(G, sc.f, sc.side); v.fly.push({ x0: p[0], y0: p[1], side: sc.side, t: 0, d: 0.7 + (this.hash(p[0] + ':' + p[1]) % 100) / 500 }); }
        if (typeof Freezer !== 'undefined' && !s.whatif) Freezer.put(this.id, e.season, this.sim.snapshot());
        if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
        return;
      case 'commit': if (this.phoneStrip()) v.hold = 0; return;
      case 'breed':
        v.fry = { t: 0 }; if (F) F.tier(2); if (S2) S2.play('count', { x: W / 2, y: Stage.h - 40, twin: false });
        if (e.reveal) this.reveal(e.reveal);
        if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
        return;
      case 'unt': if (Save.d && Save.d.ui) { Save.d.ui.unt = e.on ? 1 : 0; } if (e.on && !v.said.unt) { v.said.unt = 1; this.whisper('untimed'); } this._dockSig = ''; this.dock(); return;
      case 'autogen': if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); if (S2) S2.play('tick', { x: W - 60, y: this.hudH() + 26 }); return;
      case 'intrude': for (const q of e.cur) v.intr.push({ k: q.k, side: q.side, t0: v.t }); if (e.cur.length > 1 && !v.said.both) { v.said.both = 1; this.whisper('both'); } return;
      case 'lunge': v.lunge = { side: e.side, t: 0 }; if (F) F.tier(1); if (typeof Snd !== 'undefined') Snd.click(); if (e.orange && !v.said.or) { v.said.or = 1; this.whisper('orange'); } return;
      case 'chase': { const p = this.lizPos(e.side, 1); v.gone.push({ k: 'Y', side: e.side, t: 0, ok: true }); v.intr = v.intr.filter(q => q.side !== e.side || q.k !== 'Y'); if (F) { F.burst('dust', p[0], p[1], 4); F.ring(p[0], p[1], 14, { ms: 200 }); F.pop('+1', p[0], p[1] - 26, 1); } if (S2) S2.play('tock', { x: p[0], y: p[1] }); return; }
      case 'sneak': { const p = this.lizPos(e.side, 1); v.gone.push({ k: 'Y', side: e.side, t: 0, ok: false }); v.intr = v.intr.filter(q => q.side !== e.side || q.k !== 'Y'); if (F) { F.hitstop(50); F.shake(5, 180); F.pop('−1', p[0], p[1] - 26, -1); } if (S2) S2.play('crack', { x: p[0], y: p[1] }); return; }
      case 'orange': { v.gone.push({ k: 'O', side: e.side, t: 0, ok: false }); v.intr = v.intr.filter(q => q.k !== 'O'); if (F) { F.shake(5, 180); F.pop('−1', W / 2, Stage.h * 0.4, -1); } if (typeof Snd !== 'undefined' && Snd.miss) Snd.miss(); return; }
      case 'over': return;
    }
  },
  reveal(id) {
    const s = this.sim.s; if (typeof Predict === 'undefined' || s.exp[id] == null) return;
    Predict.reveal(id, s.exp[id], s.tol[id]); this.whisper(s.pred[id] == null ? 'none' : s.hits[id] ? 'hit' : 'out');
  },
  hash(v) { let h = 2166136261; const t = String(v); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h ^ h >>> 13) >>> 0; },

  /* ---------- input: a tap raises a plate on the nearest fish's flank (boss: a lunge to that side); taps in dusk speed it up ---------- */
  down(x, y) {
    const s = this.sim.s;
    if (/dusk|breed|auto/.test(s.phase)) { this.v.ff = true; return; }
    if (s.phase !== 'swim' && s.phase !== 'dawn') return;
    if (s.boss) { Sim.act(this, { k: 'lunge', side: x >= Stage.w / 2 ? 1 : 0 }); return; }
    const G = this.geo(); let f = 0, bd = 1e9; G.xs.forEach((fx, i) => { const d = Math.abs(fx - x); if (d < bd) { bd = d; f = i; } });
    Sim.act(this, { k: 'guard', f, side: x >= G.xs[f] ? 1 : 0 });
  },
  onKey(k) {
    const s = this.sim.s, v = this.v;
    if (k === ' ' && /dusk|breed|auto/.test(s.phase)) { v.ff = true; return; }
    if (k === ' ' && s.unt && !s.boss) { Sim.act(this, { k: 'strike' }); return; }
    if (k === '1' || k === '2' || k === '3') { v.focus = Math.min((this.sim.cfg(this.level).nf || 1) - 1, +k - 1); return; }
    if (k !== 'ArrowLeft' && k !== 'ArrowRight') return; const side = k === 'ArrowRight' ? 1 : 0;
    if (s.boss) { Sim.act(this, { k: 'lunge', side }); return; }
    let f = v.focus; if (f < 0 && s.wave) { const a = s.wave.att.find(q => !s.plates.some(p => p.f === q.f)) || s.wave.att[0]; f = a.f; } if (f < 0) f = 0;   // the threatened fish without a plate, unless you picked one
    Sim.act(this, { k: 'guard', f, side }); v.focus = -1;
  },
  teacherStep() { const s = this.sim.s; if (s.phase === 'swim' && !s.boss) Sim.act(this, { k: 'skip' }); },

  /* ---------- drawing ---------- */
  draw(c, w, h) {
    const s = this.sim.s; if (!s) return;
    if (s.boss) this.drawRocks(c, w, h); else this.drawLake(c, w, h);
    const v = this.v; if (typeof Lbl === 'undefined') return;
    if (v.banner) { const b = v.banner, a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; Lbl.put('jw-banner', b.text, w / 2, this.hudH() + 30, { size: 22, c, weight: 700 }); c.restore(); }
    if (/dusk|breed/.test(s.phase) && s.season > 1 && !v.ff) Lbl.put('jw-ff', this.content.labels.ff, w - 14, this.hudH() + 58, { align: 'right', size: 12, c });
  },
  bake(w, h) {   // the lake: water, light shafts, weed, sand; baked once per size (never in the frame loop)
    const k = Math.round(w) + 'x' + Math.round(h); if (this.v.bgk === k && this.v.bg) return this.v.bg; this.v.bgk = k;
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, cv = mkCanvas(Math.round(w * d), Math.round(h * d)), c = cv.getContext('2d'); c.scale(d, d);
    const G = this.geo(), g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3F8AA0'); g.addColorStop(0.55, '#2E6F86'); g.addColorStop(1, '#1D4E60'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rng(7);
    for (let i = 0; i < 5; i++) { const x = w * (0.1 + 0.2 * i) + 30 * (r() - 0.5); c.beginPath(); c.moveTo(x - 18, 0); c.lineTo(x + 18, 0); c.lineTo(x + 70, h * 0.8); c.lineTo(x + 10, h * 0.8); c.closePath(); c.fillStyle = 'rgba(232,243,240,0.05)'; c.fill(); }
    const fy = G.fy; c.fillStyle = '#B8A983'; c.beginPath(); c.moveTo(0, fy + 8); for (let x = 0; x <= w; x += 24) c.lineTo(x, fy + 4 * Det.sin(x * 0.03) + 6); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fill();
    for (let i = 0; i < w / 6; i++) { c.fillStyle = r() < 0.5 ? 'rgba(90,80,60,0.25)' : 'rgba(240,232,210,0.25)'; c.beginPath(); c.arc(r() * w, fy + 12 + r() * (h - fy - 12), 0.8 + r() * 1.6, 0, TAU); c.fill(); }
    for (const side of [0, 1]) for (let i = 0; i < 4; i++) { const x0 = side ? w - 8 - i * 9 - r() * 6 : 8 + i * 9 + r() * 6, ht = h * (0.18 + 0.2 * r()); c.beginPath(); c.moveTo(x0, fy + 10); c.quadraticCurveTo(x0 + (side ? -16 : 16) * r(), fy - ht / 2, x0 + (side ? -10 : 10) * (r() - 0.3), fy - ht); c.lineWidth = 3; c.strokeStyle = 'rgba(46,72,52,0.75)'; c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, fy + 8, w, 2);
    this.v.bg = cv; return cv;
  },
  drawLake(c, w, h) {
    const s = this.sim.s, v = this.v, G = this.geo(), bg = this.bake(w, h); c.drawImage(bg, 0, 0, w, h);
    const calm = typeof Fx !== 'undefined' && Fx.calm;
    c.save(); c.globalAlpha = 0.07; c.strokeStyle = '#E8F3F0'; c.lineWidth = 2;   // drifting caustics (cosmetic)
    for (let i = 0; i < 6; i++) { const y = (i * 71 + (calm ? 0 : v.t * 9)) % (G.fy - 20) + 10; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 30) c.lineTo(x, y + 5 * Det.sin(x * 0.02 + i + v.t * 0.7)); c.stroke(); }
    c.restore();
    c.save(); c.fillStyle = '#16323C';   // a distant school drifting in the murk, and bubbles (cosmetic)
    for (let i = 0; i < 6; i++) { const dir = i % 2 ? 1 : -1, sp = 10 + 5 * (i % 3), span = w + 120, x = (((v.t * sp * dir + i * 173) % span) + span) % span - 60, y = G.top + 30 + (i * 67) % Math.max(40, G.fy - G.top - 90), r0 = 9 + (i % 3) * 3;
      c.globalAlpha = 0.16; c.beginPath(); c.ellipse(x, y, r0, r0 * 0.38, 0, 0, TAU); c.moveTo(x - dir * r0 * 0.9, y); c.lineTo(x - dir * r0 * 1.5, y - r0 * 0.35); c.lineTo(x - dir * r0 * 1.5, y + r0 * 0.35); c.closePath(); c.fill(); }
    c.globalAlpha = 0.35; c.strokeStyle = '#E8F3F0'; c.lineWidth = 1;
    for (let i = 0; i < 7; i++) { const x = w * ((i * 0.137 + 0.06) % 1), y = G.fy - ((v.t * (14 + i * 3) + i * 61) % Math.max(60, G.fy - G.top)); c.beginPath(); c.arc(x + 3 * Det.sin(v.t * 2 + i), y, 1.5 + (i % 3), 0, TAU); c.stroke(); }
    c.restore();
    this.drawFloor(c, G);
    if (/dusk|ask|breed/.test(s.phase)) { const k = s.phase === 'dusk' ? Math.min(1, s.t / 0.4) : s.phase === 'breed' ? Math.max(0, 1 - s.t / JW_T.breed) : 1; c.fillStyle = 'rgba(10,22,40,' + (0.28 * k).toFixed(3) + ')'; c.fillRect(0, 0, w, G.fy + 8); }
    if (v.fry && s.phase === 'breed') for (let i = 0; i < 16; i++) {   // the young: pale fry rise from the weed and scatter
      const k = Math.min(1, Math.max(0, (v.fry.t - i * 0.03) / 1.0)); if (k <= 0 || k >= 1) continue;
      const x = w * (0.08 + 0.84 * ((i * 0.618) % 1)) + 10 * Det.sin(k * 6 + i), y = G.fy + 10 - k * (G.fy - G.top) * 0.55, r0 = 5;
      c.save(); c.globalAlpha = 0.9 * (1 - k * k); c.beginPath(); c.ellipse(x, y, r0 * 0.45, r0, 0, 0, TAU); c.moveTo(x, y + r0); c.lineTo(x - 3, y + r0 + 4); c.lineTo(x + 3, y + r0 + 4); c.closePath(); c.fillStyle = '#E8DFC9'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke(); c.restore();
    }
    const auto = s.phase === 'auto';
    for (let f = 0; f < G.nf; f++) this.drawPrey(c, G, f);
    if (!auto) this.drawAttackers(c, G);
    for (const fl of v.fly) {   // scars slide into the histogram at dusk (D4)
      const k = Math.min(1, fl.t / fl.d), e = k * k * (3 - 2 * k), tx = fl.side ? w * 0.72 : w * 0.28, ty = G.fy + 22;
      c.beginPath(); c.arc(fl.x0 + (tx - fl.x0) * e, fl.y0 + (ty - fl.y0) * e - 40 * Det.sin(Math.PI * k), 3, 0, TAU); c.fillStyle = '#E8DFC9'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke();
    }
    this.drawPips(c, G);
    if (typeof Lbl !== 'undefined') {
      Lbl.put('jw-xn', this.content.labels.xn, 12, G.fy - 14, { align: 'left', size: 12, c });
    }
  },
  drawPips(c, G) {   // guard plates available: filled while a plate is up (D4: two guard pips)
    const s = this.sim.s, n = this.sim.cfg(this.level).plates || 1, up = s.plates ? s.plates.length : 0, y = this.hudH() + 20;
    for (let i = 0; i < n; i++) { const x = G.W - 20 - i * 20, ready = i >= up; c.beginPath(); c.moveTo(x, y - 10); c.quadraticCurveTo(x + 12, y, x, y + 10); c.quadraticCurveTo(x + 4, y, x, y - 10); c.closePath(); c.fillStyle = ready ? '#E8DFC9' : 'rgba(27,22,18,0.3)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke(); }
  },
  drawFloor(c, G) {   // the twist histogram on the lake floor: one dot per scale-eater, left-strikers left of the line, right-strikers right
    const s = this.sim.s, v = this.v, W = G.W, x0 = 18, x1 = W - 18, nb = 25, bw = (x1 - x0) / nb, r = Math.max(2.2, Math.min(4, bw * 0.32)), base = G.H - 8;
    const pops = s.phase === 'auto' ? s.wpop : s.pop, fry = v.fry && s.phase === 'breed' ? Math.min(1, v.fry.t / 0.9) : 1;
    const rec = s.hist[s.hist.length - 1], dusk = (s.phase === 'dusk' || s.phase === 'ask') && rec;
    const sc = dusk ? this.sim.succ(s.tally) : null;
    c.save(); c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(27,22,18,0.55)'; c.beginPath(); c.moveTo(W / 2, G.fy + 12); c.lineTo(W / 2, G.H - 4); c.stroke(); c.restore();
    pops.forEach((pop, sp) => {
      const cnt = new Array(nb).fill(0), n = pop.length;
      pop.forEach((x, i) => {
        const b = Math.max(0, Math.min(nb - 1, Math.floor((x.z + 2.6) / 5.2 * nb))), k = cnt[b]++, cx = x0 + (b + 0.5) * bw + (sp ? bw * 0.25 : 0), cy = base - k * (2 * r + 1) - (sp ? 0 : 0);
        if (cy < G.fy + 14) return; if (s.phase === 'breed' && i / n > fry) return;
        c.beginPath(); c.arc(cx, cy, r, 0, TAU);
        const fed = dusk && sc ? this.sim.fit(x, sc) > CH_JAWS_V2.P.base.v + 0.5 * (sc[0] + sc[1]) : true;
        if (sp) { c.fillStyle = 'rgba(27,22,18,0.85)'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#E8DFC9'; c.stroke(); }
        else if (fed) { c.fillStyle = '#F4EEDD'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke(); }
        else { c.lineWidth = 1.3; c.strokeStyle = '#1B1612'; c.stroke(); }
      });
    });
    if (typeof Lbl !== 'undefined') {
      const L = this.content.labels, p = this.sim.share(pops[0]), num = s.season > 1 || s.phase === 'breed' || s.phase === 'auto' || this.level > 0;   // reveal ladder: the first season shows the dots and the words, numbers after the first change
      Lbl.put('jw-lp', num ? Txt.f(L.lp, { p: Math.round(100 * (1 - p)) }) : L.left, W * 0.25, G.fy + 26, { size: 13, c, mono: num }); Lbl.put('jw-rp', num ? Txt.f(L.rp, { p: Math.round(100 * p) }) : L.right, W * 0.75, G.fy + 26, { size: 13, c, mono: num });
    }
  },
  drawPrey(c, G, f) {
    const s = this.sim.s, v = this.v, x = G.xs[f], y = G.y, len = G.len, wid = G.wid, calm = typeof Fx !== 'undefined' && Fx.calm, sway = calm ? 0 : Det.sin(v.t * 2.2 + f * 1.7) * 0.03;
    if (typeof Rig !== 'undefined' && Rig.has('jwprey')) Rig.draw(c, 'jwprey', { k: 0 }, x, y, { size: len, rot: sway });
    for (const sc of v.scars) if (sc.f === f) { const sx = x + (sc.side ? 1 : -1) * wid * 0.36, sy = y - len * 0.1 + sc.y * len * 0.35; c.beginPath(); c.ellipse(sx, sy, 4, 6, 0, 0, TAU); c.fillStyle = '#D9D4C0'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke(); }
    const crescent = (px, sd, top, bot) => { c.beginPath(); c.moveTo(px, top); c.quadraticCurveTo(px + sd * wid * 0.42, (top + bot) / 2, px, bot); c.quadraticCurveTo(px + sd * wid * 0.14, (top + bot) / 2, px, top); c.closePath(); };
    for (const q of v.off) if (q.f === f) { const k = q.t / 0.12, sd = q.side ? 1 : -1; c.save(); c.globalAlpha = 1 - k; crescent(x + sd * (wid * 0.5 + 14 * k), sd, y - len * 0.3, y + len * 0.22); c.fillStyle = '#E8DFC9'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke(); c.restore(); }
    const pl = s.plates && s.plates.find(p => p.f === f);
    if (pl) {   // the guard plate: a pale crescent slides onto the flank (120 ms, ≤ 8% overshoot); an arc drains over the guard
      const sl = v.slide[f], k = sl ? Math.min(1, (v.t - sl.t0) / 0.12) : 1, ov = calm ? k : (k < 1 ? k * 1.08 : 1), sd = pl.side ? 1 : -1, fl = v.flash[f + ':' + pl.side] > 0;
      const px = x + sd * (wid * 0.5 + 6 * (1 - ov)), top = y - len * 0.3, bot = y + len * 0.22;
      c.save(); c.globalAlpha = calm ? 1 : Math.min(1, 0.3 + ov);
      crescent(px, sd, top, bot);
      c.fillStyle = fl ? '#FFFFFF' : '#E8DFC9'; c.fill(); c.lineWidth = fl && calm ? 3 : 1.5; c.strokeStyle = '#1B1612'; c.stroke(); c.restore();
      if (!s.unt && pl.t1 < 1e8) { const left = Math.max(0, (pl.t1 - s.T) / CH_JAWS_V2.P.guard.v); c.beginPath(); c.arc(x, y, len * 0.56, -Math.PI / 2, -Math.PI / 2 + TAU * left); c.lineWidth = 3; c.strokeStyle = 'rgba(244,238,221,0.7)'; c.stroke(); }
    }
    if (v.focus === f) { c.save(); c.setLineDash([4, 4]); c.beginPath(); c.arc(x, y, len * 0.6, 0, TAU); c.lineWidth = 2; c.strokeStyle = '#F4EEDD'; c.stroke(); c.restore(); }
  },
  drawAttackers(c, G) {   // scale-eaters lurk behind their target, then veer to a flank in the last 0.16 s; the twisted jaw shows only then
    const s = this.sim.s, v = this.v, len = G.len * 0.62, calm = typeof Fx !== 'undefined' && Fx.calm, has = typeof Rig !== 'undefined' && Rig.has('jwscaler');
    if (s.wave && s.phase === 'swim') {
      const w = s.wave, wait = w.tb >= 1e8;
      for (const a of w.att) {
        const fx = G.xs[a.f], start = G.H + len * 0.3, lurk = G.y + G.len * 0.62 + len * 0.45, tA = wait ? 1 : Math.min(1, (s.T - w.t0) / Math.max(0.2, w.tb - w.t0 - JW_T.veer));
        let x = fx + (calm ? 0 : Det.sin(v.t * 7 + a.f) * 4), y = start + (lurk - start) * (1 - (1 - tA) * (1 - tA)), rot = 0, tw = 0;
        if (w.veered && a.side >= 0) { const k = Math.min(1, (s.T - (w.tb - JW_T.veer)) / JW_T.veer), p = this.flank(G, a.f, a.side), sd = a.side ? 1 : -1; x = fx + (p[0] + sd * len * 0.2 - fx) * k; y = lurk + (p[1] + len * 0.42 - lurk) * k; rot = -sd * 0.5 * k; tw = this.tw(s.pop[a.sp][a.i].z); }
        if (has) Rig.draw(c, 'jwscaler', { tw, st: a.sp === 1 }, x, y, { size: len, rot, alpha: wait ? 0.85 : Math.min(1, 0.4 + tA) });
      }
    }
    for (const r of v.recoil) {   // after the strike: a block recoils 6 px and flees; a bite darts off with its scale
      const p = this.flank(G, r.f, r.side), sd = r.side ? 1 : -1, k = r.t / 0.9, back = r.ok ? 6 + 160 * k * k : 30 * k + 200 * k * k;
      if (has) Rig.draw(c, 'jwscaler', { tw: this.tw(r.z), st: r.sp === 1 }, p[0] + sd * (len * 0.2 + back * 0.3), p[1] + len * 0.42 + back, { size: len, rot: -sd * 0.5 + sd * k * 0.8, alpha: Math.max(0, 1 - k) });
    }
  },
  tw(z) { return Math.round(Math.max(-1, Math.min(1, z / 1.4)) * 2) / 2; },

  /* ---------- the boss scene: rocks, a crowd of 150 lizards (cached), your blue male, his female, the intruders ---------- */
  lizPos(side, k) { const W = Stage.w, H = Stage.h, cy = H * 0.55; return [W / 2 + (side ? 1 : -1) * (W * 0.42 - (W * 0.42 - 54) * k), cy + 10]; },
  drawRocks(c, w, h) {
    const s = this.sim.s, v = this.v, u = Stage.u || 390, k = Math.round(w) + 'x' + Math.round(h), has = typeof Rig !== 'undefined';
    if (v.bgk !== k || !v.bg) { v.bgk = k; v.bg = has && Rig.grounds().indexOf('rocks') >= 0 ? Rig.ground('rocks', w, h, (Stage.dpr || 1), 3).cv : null; v.crowdK = ''; }
    if (v.bg) c.drawImage(v.bg, 0, 0, w, h); else { c.fillStyle = '#A79A82'; c.fillRect(0, 0, w, h); }
    const x = s.phase === 'auto' ? s.wtrail[s.wtrail.length - 1] : s.trail[s.trail.length - 1], ck = k + ':' + x.map(q => Math.round(q * 24)).join(',');
    if (v.crowdK !== ck && has && typeof Layer === 'function') {   // 24 lizards stand for the 150: the morph mix, redrawn once a season
      v.crowdK = ck; const n = 24, cnt = [0, 1, 2].map(i => Math.round(x[i] * n)); while (cnt[0] + cnt[1] + cnt[2] > n) cnt[cnt.indexOf(Math.max(...cnt))]--; while (cnt[0] + cnt[1] + cnt[2] < n) cnt[cnt.indexOf(Math.min(...cnt))]++;
      const list = []; [0, 1, 2].forEach(i => { for (let j = 0; j < cnt[i]; j++) list.push('OBY'[i]); }); const r = rng(11);
      for (let i = list.length - 1; i > 0; i--) { const j = (r() * (i + 1)) | 0, t = list[i]; list[i] = list[j]; list[j] = t; }
      v.crowd = v.crowd || Layer(w, h); v.crowd.resize(w, h);
      const top = this.hudH() + 46, sz = Math.max(28, Math.min(44, 0.08 * u)), cyA = h * 0.55, pts = [], rr = rng(23);
      for (let tries = 0; pts.length < list.length && tries < 4000; tries++) {   // basking spots round the edge, clear of the arena and of each other
        const px = 16 + rr() * (w - 32), py = top + rr() * (h - top - 34);
        if (Math.abs(px - w / 2) < w * 0.3 && Math.abs(py - cyA) < h * 0.2) continue;
        if (pts.some(q => Math.abs(q[0] - px) < sz * 1.05 && Math.abs(q[1] - py) < sz * 0.55)) continue;
        pts.push([px, py, (rr() - 0.5) * 1.2, rr() < 0.5]);
      }
      v.crowd.redraw(cc => list.forEach((m, i) => { const q = pts[i]; if (q) Rig.draw(cc, 'lizard', { morph: m }, q[0], q[1], { size: sz, rot: q[2], flip: q[3] }); }));
    }
    if (v.crowd) v.crowd.blit(c, 0, 0);
    const cy = h * 0.55, hero = Math.max(70, Math.min(130, 0.24 * u)), lg = v.lunge, lx = lg ? (lg.side ? 1 : -1) * 26 * Det.sin(Math.PI * Math.min(1, lg.t / 0.4)) : 0;
    c.save(); c.beginPath(); c.ellipse(w / 2, cy + hero * 0.25, Math.min(w * 0.46, hero * 1.5), hero * 0.62, 0, 0, TAU); c.fillStyle = 'rgba(214,202,176,0.75)'; c.fill(); c.lineWidth = 2; c.strokeStyle = 'rgba(27,22,18,0.35)'; c.stroke(); c.restore();   // the pair's basking slab
    if (has) {
      Rig.draw(c, 'jwfem', { morph: 'O' }, w / 2, cy + hero * 0.55, { size: hero * 0.7, flip: true });
      Rig.draw(c, 'lizard', { morph: 'B' }, w / 2 + lx, cy - hero * 0.12, { size: hero, letters: true, flip: lg ? !lg.side : false, halo: true });
      if (typeof Lbl !== 'undefined') Lbl.put('jw-you', this.content.labels.you, w / 2, cy - hero * 0.7, { size: 13, c });
      if (s.phase === 'swim') for (const q of v.intr) {
        const cur = s.cur.find(c0 => c0.k === q.k && c0.side === q.side); if (!cur) continue;
        const k2 = cur.tb >= 1e8 ? 0.15 : Math.min(1, (s.T - (cur.tb - Math.max(0.75, 1.15 - 0.05 * (s.season - 1)))) / Math.max(0.3, Math.max(0.75, 1.15 - 0.05 * (s.season - 1))));
        if (q.k === 'O') Rig.draw(c, 'lizard', { morph: 'O' }, w / 2 + (q.side ? 1 : -1) * 40, this.hudH() + 60 + (cy - this.hudH() - 90) * k2, { size: hero * 0.95, letters: true, rot: Math.PI / 2 * (q.side ? 1 : -1) * 0.4 });
        else { const p = this.lizPos(q.side, k2); Rig.draw(c, 'lizard', { morph: 'Y' }, p[0], p[1] + hero * 0.3, { size: hero * 0.62, letters: true, flip: !!q.side }); }
      }
      for (const g of v.gone) { const k3 = g.t / 0.8, p = this.lizPos(g.side, g.ok ? 1 - k3 : 1); Rig.draw(c, 'lizard', { morph: g.k }, p[0] + (g.ok ? 0 : (g.side ? -1 : 1) * 20 * k3), p[1] + hero * 0.3, { size: hero * 0.62, flip: g.ok ? !g.side : !!g.side, alpha: Math.max(0, 1 - k3) }); }
    }
    if (typeof Lbl !== 'undefined') {
      const L = this.content.labels; Lbl.put('jw-xnl', L.xnL, 12, h - 12, { align: 'left', size: 12, c });
      Lbl.put('jw-kept', Txt.f(L.kept, { n: s.kept }), w - 14, this.hudH() + 24, { align: 'right', size: 13, c, mono: true });
    }
  },

  /* ---------- the live strip (notes() is the LiveGraph data provider) ---------- */
  notes() {
    const s = this.sim.s, D = this.content.data, L = this.content.labels, pc = v => Math.round(100 * v) + '%'; if (!s) return { stats: [], charts: [] };
    const stats = [[D.season[0], Txt.f(D.season[1], { n: Math.min(s.season, s.seasons), m: s.seasons }), D.season[2]], [D.blocked[0], Txt.f(D.blocked[1], { b: s.blk, a: s.att }), D.blocked[2]]];
    if (s.boss) {
      const tr = s.phase === 'auto' ? s.wtrail : s.trail, x = tr[tr.length - 1];
      stats.push([D.morphs[0], x.map(pc).join(', '), D.morphs[1]]); if (s.bs.length) stats.push([D.b[0], pc(s.bs[s.bs.length - 1]), D.b[1]]);
      const tri = { type: 'tri', title: D.titles.tri, variant: 'simplex', corners: [L.O, L.B, L.Y], trail: tr.slice(), pts: [{ f: x, kind: 'dusk', label: L.now }], frame: 'designed' };
      const lines = { type: 'jw_trace', title: D.titles.liz, fold: false, x: { lo: 1, hi: (s.phase === 'auto' ? 12 : s.seasons) + 1, label: L.seasons }, y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed',
        series: [0, 1, 2].map(i => ({ d: tr.map(q => q[i]), ink: 'ink', label: ['O', 'B', 'Y'][i] })) };
      return { stats, charts: [tri, lines] };
    }
    const ps = s.phase === 'auto' ? s.wps : s.ps, n = s.phase === 'auto' ? 8 : s.seasons;
    stats.push([D.share[0], pc(ps[0][ps[0].length - 1]), D.share[1]]); if (ps.length > 1) stats.push([D.shareB[0], pc(ps[1][ps[1].length - 1]), D.shareB[1]]);
    const series = [{ d: ps[0].slice(), ink: 'ink', label: ps.length > 1 ? L.plain : L.share }]; if (ps.length > 1) series.push({ d: ps[1].slice(), ink: 'ink', label: L.striped });
    const half = []; for (let i = 0; i <= n; i++) half.push(0.5);
    const trace = { type: 'jw_trace', title: D.titles.trace, x: { lo: 1, hi: n + 1, label: L.seasons }, y: { lo: 0, hi: 1, fmt: 'pct' }, series, ghost: [{ d: half, label: L.half }], frame: 'designed' };
    const rec = s.hist[s.hist.length - 1], pops = s.phase === 'auto' ? s.wpop : s.pop, groups = [];
    if (pops.length > 1) groups.push({ v: pops[0].map(x => x.z), style: 'solid', label: L.plain }, { v: pops[1].map(x => x.z), style: 'hollow', label: L.striped });
    else if ((s.phase === 'dusk' || s.phase === 'ask') && rec) { const sc = this.sim.succ(s.tally), thr = CH_JAWS_V2.P.base.v + 0.5 * (sc[0] + sc[1]); groups.push({ v: pops[0].filter(x => this.sim.fit(x, sc) > thr).map(x => x.z), style: 'solid', label: L.fed }, { v: pops[0].filter(x => this.sim.fit(x, sc) <= thr).map(x => x.z), style: 'hollow', label: L.hungry }); }
    else if (s.phase === 'breed' && rec) groups.push({ v: pops[0].map(x => x.z), style: 'hatched', label: L.young });
    else groups.push({ v: pops[0].map(x => x.z), style: 'solid', label: L.share });
    const hist = { type: 'dots', title: D.titles.hist, fold: false, bins: 24, x: { lo: -3, hi: 3, label: L.twist }, groups, frame: 'designed' };
    if (rec && pops.length === 1 && s.level === 2) {
      const q = rec.sp[0]; if (s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'breed') hist.arrows = q.R != null ? { S: [q.zm, q.fm], R: [q.zm, q.ym] } : { S: [q.zm, q.fm] };
      if (q.S != null) stats.push([D.S[0], q.S.toFixed(2), D.S[1]]); if (q.R != null) { stats.push([D.R[0], q.R.toFixed(2), D.R[1]]); stats.push([D.h2[0], q.h2.toFixed(2), D.h2[1]]); }
    }
    return { stats, charts: [trace, hist] };
  }
};
V2.push(CH_JAWS_V2);

/* ---------- a trace with a marker at every season (disc, square, triangle by series), so two species or three morphs read without hue ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && LiveGraph.T.trace && !LiveGraph.T.jw_trace) LiveGraph.T.jw_trace = Object.assign({}, LiveGraph.T.trace, {
  draw(c, G, spec, T) {
    LiveGraph.T.trace.draw.call(this, c, G, spec, T);
    const p = G.plot, I = T.I, r = 3.2 * (T.k || 1);
    (spec.series || []).forEach((s, k) => {
      for (const q of this.pts(s.d, G.x0, G.st)) {
        if (q[1] == null) continue; const x = G.X(q[0]), y = G.Y(q[1]); if (x < p.x - 1 || x > p.x + p.w + 1) continue;
        c.beginPath(); if (k === 1) c.rect(x - r, y - r, 2 * r, 2 * r); else if (k === 2) { c.moveTo(x, y - r * 1.2); c.lineTo(x + r, y + r * 0.8); c.lineTo(x - r, y + r * 0.8); c.closePath(); } else c.arc(x, y, r, 0, TAU);
        c.fillStyle = k === 1 ? I.surface : I.text; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.text; c.stroke();
      }
    });
  }
});

/* ---------- rigs: the prey cichlid and the scale-eater seen from above (dorsal view, head up), and a plain female lizard ---------- */
if (typeof Rig !== 'undefined') {
  const { E, P, D, OL, eye, INK } = Rig._, ol = o => Object.assign({}, OL, o);
  Rig.def('jwprey', {   // a deep-bodied Tanganyika cichlid from above: natural olive-grey paint, dark saddles, spread pectorals
    tier: 'hero', pose: 0, paints: ['#9AA58C', '#5E6B55', '#7D8A6E'],
    row: { scene: 'lake', squint: 'spindle fish from above with spread fins', channels: ['flank plates and scars (position)'] },
    recipe() {
      const body = [['M', 0, -50], ['C', 15, -44, 18, -18, 15, 2], ['C', 13, 20, 7, 32, 0, 38], ['C', -7, 32, -13, 20, -15, 2], ['C', -18, -18, -15, -44, 0, -50], ['Z']];
      return { w: 48, h: 104, parts: [
        P([-3, 33, -17, 51, 0, 45, 17, 51, 3, 33], '#7D8A6E', ol({ lw: 1.2 })), E(-15, -16, 10, 4, '#7D8A6E', ol({ rot: -0.5, lw: 1.2 })), E(15, -16, 10, 4, '#7D8A6E', ol({ rot: 0.5, lw: 1.2 })),
        D(body, '#9AA58C', ol({ kids: [E(0, -22, 16, 4, 'rgba(70,80,62,0.45)'), E(0, -4, 16, 4.5, 'rgba(70,80,62,0.45)'), E(0, 14, 13, 4, 'rgba(70,80,62,0.45)'), E(-5, -20, 4, 18, 'rgba(255,255,255,0.18)'), E(6, 4, 5, 22, 'rgba(0,0,0,0.1)')] })),
        P([0, -46, 0, 30], null, { stroke: '#5E6B55', lw: 2.2, close: false }), ...eye(-8.5, -39, 2.6), ...eye(8.5, -39, 2.6)] };
    }
  });
  Rig.def('jwscaler', {   // Perissodus from above: slender, dark; ph.tw bends the head (−1 left-striker … 1 right-striker); ph.st the striped species
    tier: 'actor', pose: 0, quant: { tw: 5, '*': 4 }, paints: ['#4F4B40', '#3D3A31', '#262420'],
    row: { scene: 'lake', squint: 'slender fish with a bent snout', channels: ['jaw bend (shape)', 'stripes: second species (pattern)'] },
    recipe(ph) {
      const tw = Math.max(-1, Math.min(1, +ph.tw || 0)), body = [['M', 0, -24], ['C', 7, -21, 8, -6, 7, 6], ['C', 6, 18, 3, 24, 0, 26], ['C', -3, 24, -6, 18, -7, 6], ['C', -8, -6, -7, -21, 0, -24], ['Z']];
      const stripes = ph.st ? [E(0, -12, 7.5, 1.6, '#262420'), E(0, -2, 8, 1.6, '#262420'), E(0, 8, 7, 1.6, '#262420'), E(0, 17, 5, 1.4, '#262420')] : [E(0, -4, 2, 18, 'rgba(0,0,0,0.25)')];
      return { w: 26, h: 72, parts: [
        P([-2, 24, -10, 36, 0, 32, 10, 36, 2, 24], '#3D3A31', ol({ lw: 1 })),
        D(body, '#4F4B40', ol({ kids: stripes.concat([E(-2.5, -8, 2, 12, 'rgba(255,255,255,0.15)')]) })),
        { op: 'g', x: 0, y: -21, rot: -tw * 0.45, parts: [P([-5, 0, -2.2, -14, 0, -15.5, 2.2, -14, 5, 0], '#4F4B40', ol({ lw: 1.2 })), P([0, -15.5, tw * 3, -11], null, { stroke: '#E8DFC9', lw: 1.2, close: false })] },
        ...eye(-4.2, -20, 1.7), ...eye(4.2, -20, 1.7)] };
    }
  });
  Rig.def('jwfem', {   // the blue male's female: the lizard rig with its throat painted plain (females are drawn without a male morph)
    tier: 'actor', pose: 0.3, paints: ['#8B7459'],
    recipe(ph, o) { const r = Rig.recipe('lizard', { morph: 'O' }, {}), fix = a => a.map(p => Array.isArray(p) ? fix(p) : p && typeof p === 'object' ? Object.assign({}, p, p.fill === '#D98E4A' ? { fill: '#A08A6E' } : {}, p.kids ? { kids: fix(p.kids) } : {}, p.parts ? { parts: fix(p.parts) } : {}) : p); return { w: r.w, h: r.h, parts: fix(r.parts) }; }
  });
}

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.jaws = JW_TEXT.take;
  MODEL.jaws = 'Forty scale-eaters with a partly inherited jaw twist; each mostly strikes one flank. Young come in proportion to scales eaten, so your guards are the selection. In the boss, side-blotched lizards play rock–paper–scissors, with three of each morph arriving every season.';
  RECALL.jaws = { q: 'Most scale-eaters strike the right flank, so prey guard the right. Which scale-eaters leave more young next?', opts: [['left', 'Left-strikers'], ['right', 'Right-strikers'], ['same', 'Neither: they are equal']], ans: 'left', why: 'The rarer side meets fewer guards and eats more scales, so it leaves more young: negative frequency dependence.' };
  BRIDGE.jaws = 'In Bitter Wings, birds avoided the look they had tasted. Here prey guard the flank they are bitten on most.';
}
