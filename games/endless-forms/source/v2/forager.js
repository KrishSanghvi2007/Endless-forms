/* ================= v2/forager.js: The Forager (Act 6; D1 §3.7, D5 §4 item 8) =================
   One great tit's day on one map, then a winter night. Role: a behaving animal (D1 G1 role 2). D6 decision 9: four levels, one
   verb (take it or move on), one prediction (the far orchard), and the key rule shown plainly in the HUD at each stretch.
     L0 Morning, the hedgerow  caterpillars appear one at a time ahead of the bird; tap to carry one home, or let it pass. Big ones
                               scarce, then common, then small ones swarm. The zero–one diet rule (Krebs et al. 1977).
     L1 Midday, the orchard    the tit feeds itself; catches slow as a tree empties; tap the next tree to fly on. Near trees, then
                               far ones. The marginal value theorem: the tangent from the travel time (Charnov 1976; Cowie 1977).
     L2 Afternoon, the hawk    the same take-or-pass verb, but field caterpillars are out in the open under a sparrowhawk.
                               Danger is a cost in the same currency (Lima & Dill 1990).
     L3 Winter night (boss)    a steady feeder (2 seeds) against a lucky one (0 or 4) before a long night: survival, not rate, is
                               the currency, so the gamble pays only when steady feeding falls short (Stephens 1981; contested).
   Encounters are sequential and the next arrival is drawn only when it happens (a per-tick hazard), so nothing in the state
   foretells the next prey: a look-ahead bot has nothing to look at (D1 §3.7 fix; R7 A63). The legacy Math.min(1, eff) cap is
   gone, and no score is a "% of best": stars read expectations from the model in force.
   Notation (D2 §15): λ is speciation and h is dominance, so the diet rule is written bE ÷ (1 + bt): b big caterpillars met a
   second, E food each, t seconds to carry one home.
   Code shape (API_v2 §9): a headless sim (plain JSON; R(), Det, WF only; a run is (seed, level, actions)); all words in FG_TEXT;
   the view juices from Sim.run's events only. Load rule: top-level code touches only legacy objects and lower-numbered v2 files
   (Rig, LiveGraph); engine calls at run time sit behind typeof guards. Under ?v1=1 the learning-layer rewrites at the foot are
   skipped and the legacy chapter plays. Levels run model kinds (FG_KIND 0, 1, 2, 4; s.kd): the evening flock, kind 3, is cut. */

/* ---------- all words (API_v2 §9.2); tests/lint_text.js checks every budget ---------- */
const FG_TEXT = {
  intro: {   // the opening card (D6 addendum 8): three parts, 1–2 sentences each, ≤ 35 words
    game: 'You are a great tit raising four chicks on an English hedgerow. One day runs from dawn mist to dusk, then a winter night.',
    biology: 'Every catch costs time that could find food elsewhere. Selection favours rules that weigh gain against time and danger, though no bird does the sums.',
    how: 'Tap a caterpillar to carry it home, or the hedge to let it pass. Later, tap the next tree or a feeder; once, drag a line to predict.'
  },
  firstWords: 'Four hungry chicks. Tap a caterpillar to carry it home, or tap the hedge to let it pass.',
  hud: {
    hedge: 'Take a caterpillar home, or let it pass. Every trip home costs time.',
    hedgeU: 'Each caterpillar waits for you. Take it, or tap the hedge to pass.',
    // the key rules (D6 decision 9), each with its one-line meaning
    keyHedge: 'Big ones: {b} a minute. Small ones pay only below 15: {v}.', takeSmall: 'take them', passSmall: 'pass them',
    swarm: 'Small ones swarm next. The switch stays at 15 big ones a minute.',
    keyHawk: 'Danger per field trip: {p}%. Field pays only below about 20%: {v}.', fieldPays: 'take it', hedgePays: 'stay in the hedge',
    keyTree: 'Best stay: {t} s, where a line from the {T} s flight meets the curve.',
    keyNight: 'Steady reaches {x} by nightfall; the line is {need}. {v}', playSafe: 'Play steady.', gamble: 'Gamble on lucky.',
    orchard: 'Midday: you feed yourself. Catches slow as a tree empties. Tap the next tree.',
    orchardU: 'Tap Stay to feed for half a second, or Fly on.',
    askB2: 'The trees stand far apart now. Drag the best time to leave, then Lock in.',
    hawk: 'Field caterpillars are plentiful but out in the open. Hedge ones are safe.',
    caught: 'Caught. Your mate finishes the day.',
    night: 'Reach the line by nightfall. Steady gives 2 seeds. Lucky gives 0 or 4.',
    nightfall: 'Night falls. The reserve burns down.',
    auto: 'What if? The rest runs by one fixed rule.',
    gap: 'A new stretch of the day.',
    over: 'Done.'
  },
  whispers: {
    drag: 'Drag the line first.', hit: 'Inside the band.', out: 'Outside the band.', none: 'No prediction this time.',
    passed: 'It slipped away.', wait: 'The first one waits for you.', still: 'Still carrying. Wait a moment.',
    caught: 'Caught. Your mate takes over.', miss: 'The hawk missed!', full: 'The chicks are fed.',
    survive: 'You made it to dawn.', starve: 'The night was too long.', empty: 'Empty this time.', late: 'Fly on to end this round.'
  },
  labels: {
    big: 'big', small: 'small', field: 'field', hedge: 'hedge', lock: 'Lock in', fly: 'Fly on', stay: 'Stay',
    steady: 'Steady', steadyG: 'always 2', lucky: 'Lucky', luckyG: '0 or 4', s0: 'Big ones scarce', s1: 'Big ones common', s2: 'Small ones swarm',
    r0: 'Trees close', r1: 'Trees far apart', h0: 'Hawk rare', h1: 'Hawk hunting', ev: 'Evening orchard', fl: 'Your rule',
    night: 'Night line', eve: 'Evening {n}', travel: '{t} s flight',
    ff: 'Tap: faster', xn: 'Selection ×N', xnRisk: 'Danger ×N', mate: 'Your mate', plus: '+{n}', best: 'best',
    take: 'Take', pass: 'Pass', steadyB: 'Steady', luckyB: 'Lucky', gainC: 'catches in tree',
    nFood: '{n} food', nEat: '{n} eaten', nRes: '{e} of {need}'
  },
  interesting: {
    allsmall: 'You took small ones even when big ones were common. Each small one cost a trip home while big ones slipped past.',
    picky: 'You passed small ones while big ones were scarce. Waiting for a big one cost more than a small one gave.',
    hungry: 'The chicks went short. Count the trips: were too many spent on small ones, or too few taken?',
    same: 'You left near and far trees after about the same time. A long flight makes each tree worth more time.',
    unfed: 'You ate little at midday. Leaving very early wastes time in the air; staying very late picks over empty twigs.',
    bold: 'You kept taking field caterpillars while the hawk hunted. Food is worth little to a parent who is caught.',
    timid: 'You passed field caterpillars when the hawk was rare. That tiny risk was worth the food.',
    caught: 'The hawk caught you. In this model your mate finished the day, so the chicks got less.',
    nogamble: 'You played safe on a night when steady feeding could not reach the line. Only luck could save you then.',
    reckless: 'You gambled when steady feeding was enough. Each gamble could only take survival away.',
    unlucky: 'You chose well, but the lucky feeder ran empty. Good choices raise the chance; they cannot guarantee it.'
  },
  live: {
    appear: 'A {k} caterpillar. Take or pass?', tree: 'Tree {n}. {c} caterpillars so far.',
    eve: 'Evening {n}. Reserve {e}, line {need}, {v} visits.', ask: 'Prediction open. Press P, then the arrows.'
  },
  data: {
    food: ['Chick food', '{n}', 'Big caterpillars bring 3, small ones 1.'],
    small: ['Small ones taken', '{a} of {b}', 'In this stretch.'],
    eaten: ['Caterpillars eaten', '{n}', 'At midday the tit feeds itself.'],
    stays: ['Mean stay', 'near {a} s, far {b} s', 'Time in each tree before flying on.'],
    fieldT: ['Field ones taken', '{a} of {b}', 'This round.'],
    reserve: ['Reserve', '{e} of {need}', 'Visits left: {v}.'],
    right: ['Chance given up', '{r} points', 'Chance of dawn your feeder choices cost, against best play.'],
    titles: { nights: 'Chance of dawn', prof: 'Food per second carried', rate: 'Rate if you leave', round: 'Food this round', diet: 'When to take small', gain: 'Gain in a tree', risk: 'Food against danger', res: 'Tonight’s reserve', odds: 'Chance tonight' },
    ax: { night: 'night', sec: 'seconds of the round', big: 'big ones a minute', rate: 'food a second', t: 'seconds in tree', got: 'caught', p: 'danger per field trip', food: 'chick food', sh: 'share', v: 'visit', e: 'seeds', ch: 'chance of dawn' },
    lines: { takeAll: 'take all', bigOnly: 'big only', swarm: 'take all, swarm', smallBar: 'small ones', mean: 'your mean', curve: 'expected', tangent: 'tangent', field: 'take field', safe: 'hedge only', you: 'you', line: 'night line', yours: 'your rounds', trees: 'your trees', skip: 'big only, now', yourN: 'your nights', bestP: 'best play' }
  },
  levers: { takeall: 'Take everything', bigonly: 'Big ones only', quick: 'Leave at 2s', slow: 'Leave at 10s', bold: 'Brave the hawk', nohawk: 'No hawk', steady: 'Always steady', gamble: 'Always lucky' },
  take: 'Good foragers act as if they weigh gain against time; selection, not calculation, builds the rule.',
  body: 'Your feeder choices gave up {r} points of survival chance over four nights. Ahead of the line, the lucky feeder could only hurt. Behind it, the gamble was the only hope.',
  whatifBody: {   // chosen and filled from the What if? run (lessons §1.5); expectations are the model's, not this run's luck
    takeall: 'The swarm stretch again, taking everything. This run filled {n} food; on average that rule fills about {e}, against {g} for big ones only. The switch point does not move with the number of small ones.',
    bigonly: 'The swarm stretch again, taking only big ones. This run filled {n} food; on average that rule fills about {g}, against {e} for taking everything.',
    quick: 'The far orchard again, leaving every tree at 2 s. This run ate {n}; that rule expects {e}, the tangent stay {bb}. Short stays waste the long flights.',
    slow: 'The far orchard again, leaving every tree at 10 s. This run ate {n}; that rule expects {e}, the tangent stay {bb}. Long stays pick over empty twigs.',
    bold: 'The hawk round again, taking every field caterpillar. This run brought {n} food. On average that rule brings {e}; hedge ones alone bring {h}.',
    nohawk: 'The same round with no hawk, taking everything. This run brought {n} food; that rule expects {e}. The hawk, not the food, set your rule.',
    steady: 'Four nights, always steady. The exact chance of dawn, averaged over the nights, is {p}%. Both short nights are lost for sure.',
    gamble: 'Four nights, always lucky. The exact chance of dawn, averaged over the nights, is {p}%. Best play gives {bb}%: gambling when ahead throws safe nights away.'
  },
  law: { title: 'Weigh gain against time' },
  boss: { inverts: 'Survival, not rate, is the currency now: when steady falls short, gamble.' },
  stars: {
    discover: 'Feed the chicks well in two daytime levels, and survive a winter night.',
    predict: 'In the orchard, land the far trees’ best leaving time inside the band.',
    transfer: 'On winter nights, give up under 10 points of dawn chance.'
  },
  levelStars: [   // each level's own stars (D6 decision 9: one prediction; no star needs a removed step)
    { discover: 'Feed the chicks, taking small ones only while big ones are scarce.' },
    { discover: 'Eat 36 caterpillars, and stay longer in far trees than near ones.', predict: 'Land the far trees’ best leaving time inside the band.' },
    { discover: 'Bring 10 food home, braving the field only while the hawk is rare.' },
    { discover: 'Survive both safe nights and at least one short one.', transfer: 'Give up under 10 points of dawn chance: gamble only when steady falls short.' }
  ],
  levelTake: [
    'Small prey pay only while big ones are scarce. How many small ones come does not matter.',
    'Leave a tree when its catch rate falls to the orchard’s average. Longer flights mean longer stays.',
    'Danger is a cost too. When the hawk hunts, scarce safe food beats plentiful risky food.'
  ],
  levelBody: [
    'You took {a}% of small ones while big ones were scarce, and {b}% once they were common. The chicks got {f} food. The long-run rates cross at 15 big ones a minute, whatever the number of small ones.',
    'You stayed {a} s in near trees and {b} s in far ones. The tangent from the flight time touches the gain curve at {c} s near and {d} s far.',
    'You took {a}% of field caterpillars with the hawk rare and {b}% with it hunting. Below about {p}% danger per trip, the field pays.'
  ],
  model: [
    { level: 0, simulated: 'One great tit on a hedgerow. Caterpillars appear one at a time, at random. Each one taken is carried home to the chicks.',
      simplification: 'Big caterpillars bring 3 food, small ones 1. Either costs a 2 s trip home. Time spent deciding is free.',
      params: [{ name: 'trip home', value: '2 s', tag: 'xN', real: 'far longer for real tits' }, { name: 'big ones', value: '6, then 36 a minute', tag: 'designed' }, { name: 'small ones', value: '30, then 90 a minute', tag: 'designed' }, { name: 'chicks', value: 4, tag: 'realistic' }],
      cannot: 'Learning how common each prey is, or chicks that need variety.',
      nature: 'Krebs and colleagues gave great tits a conveyor of large and small mealworm pieces. Birds mostly ignored small ones when large ones were common. Some still took a few.',
      contested: false, refs: ['krebs1977', 'stephens1986'] },
    { level: 1, simulated: 'The tit feeds itself in an orchard. In each tree catches come at a rate that falls as the tree empties.',
      simplification: 'Every tree is the same. The gain curve is 6(1 − e^(−t/4)) caterpillars after t seconds. The flight between trees is fixed.',
      params: [{ name: 'gain curve', value: '6(1 − e^(−t/4))', tag: 'designed' }, { name: 'flight', value: '2 s, then 10 s', tag: 'designed' }, { name: 'long flights shown faster', value: 'about ×3', tag: 'designed' }],
      cannot: 'Trees of different quality, or a bird that does not know the flight time.',
      nature: 'Cowie gave captive great tits patches of mealworms with harder or easier lids. Birds stayed longer when travel took longer, slightly longer than predicted.',
      contested: false, refs: ['charnov1976', 'cowie1977'] },
    { level: 2, simulated: 'The hedgerow again. Field caterpillars are out in the open; a trip for one exposes you to a sparrowhawk.',
      simplification: 'Field caterpillars are twice as common as hedge ones and worth the same. Each stoop catches you half the time. Caught, your day ends and your mate carries on.',
      params: [{ name: 'danger per field trip', value: '1%, then 50%', tag: 'xN', real: 'far lower for most single trips' }, { name: 'stoop success', value: '50%', tag: 'xN', real: 'most sparrowhawk attacks fail' }, { name: 'round', value: '35 s', tag: 'designed' }],
      cannot: 'Vigilance, flocking, learning where the hawk hunts, or future broods.',
      nature: 'Animals across many groups give up food to lower their risk of being eaten. They feed nearer cover and scan more when predators are about.',
      contested: false, refs: ['limadill1990', 'newton1986'] },
    { level: 3, simulated: 'Four winter evenings. Ten feeder visits before night. The steady feeder gives 2 seeds; the lucky one gives 0 or 4.',
      simplification: 'You survive the night if your reserve reaches the line. Your chance is computed exactly, backwards from nightfall.',
      params: [{ name: 'visits before night', value: 10, tag: 'designed' }, { name: 'feeders', value: '2, or 0 or 4', tag: 'designed' }, { name: 'night line', value: '22 to 28 seeds', tag: 'designed' }],
      cannot: 'Fat that costs flight speed, or hiding food for later.',
      nature: 'Yellow-eyed juncos on track for the night mostly fed at a steady tray. Birds falling short mostly fed at a variable one. Many later tests found weaker switches.',
      contested: true, refs: ['caraco1980', 'stephens1981', 'kacelnik1996'] }
  ],
  why: {
    real: ['Thomas Caraco and colleagues kept yellow-eyed juncos at different temperatures. Birds on track for the night mostly fed at a steady seed tray. Birds falling short mostly fed at a variable one.',
      'This energy-budget rule is contested. Most animals tested avoid variable amounts of food, and many do not switch when short.'],
    maths: ['Work backwards from nightfall. With t visits left and reserve e, your chance of dawn is the better of two options. Steady: the chance from e + 2. Lucky: half the chance from e plus half from e + 4.']
  },
  levelWhy: [
    { real: ['John Krebs and colleagues gave great tits large and small mealworm pieces on a moving belt. When large pieces came often, the birds mostly ignored small ones. That held however many small ones passed.'],
      maths: ['Big caterpillars bring E = 3 food and take t = 2 s to carry home. Met at b a second, they alone earn bE ÷ (1 + bt). Small ones earn 1 ÷ 2 a second. Take them only if that beats bE ÷ (1 + bt).'] },
    { real: ['Richard Cowie put mealworm patches behind lids in an aviary. Harder lids meant longer travel. His great tits stayed longer in each patch when travel took longer.'],
      maths: ['Your long-run rate is gain ÷ (flight + stay). It is highest where a line from minus the flight time just touches the gain curve. Longer flights move that touching point later.',
        'No tit computes this tangent. Selection on leaving rules, and learning within a life, bring birds near it.'] },
    { real: ['Sparrowhawks take many small woodland birds. Tits that feed in the open face more attacks, and they feed nearer cover when hawks are about.'],
      maths: ['A field trip brings food but carries a chance p of being caught. Being caught loses the rest of your day. Above a danger near 20% per trip, the hedge alone pays more.'] }
  ]
};
/* ---------- levels (sim parameters; P holds the tagged tunables) ---------- */
// D6 decision 9: four levels, one prediction (the far orchard's leaving time). FG_KIND maps a level number to its model kind
// (s.kd); kind 3, the evening flock ("Your rule"), is cut
const FG_KIND = [0, 1, 2, 4];
const FG_LV = [
  { kind: 'hedge', rd: [{ b: 0.1, s: 0.5, S: 30, lab: 's0' }, { b: 0.6, s: 0.5, S: 30, lab: 's1' }, { b: 0.6, s: 1.5, S: 25, lab: 's2' }] },
  { kind: 'orchard', rd: [{ T: 2, S: 45, lab: 'r0' }, { T: 10, S: 66, lab: 'r1', askAt: 2, tol: 1.2 }] },   // the near orchard shows its tangent; the far one asks
  { kind: 'hawk', rd: [{ c: 0.2, f: 0.4, p: 0.01, S: 35, lab: 'h0' }, { c: 0.2, f: 0.4, p: 0.5, S: 35, lab: 'h1' }] },
  null,
  { kind: 'night', rd: [[4, 22], [2, 24], [6, 24], [2, 28]] }
];
const FG_AX = 16;   // the orchard's seconds-in-tree axis (the ask's mid-axis, 8 s, is not the far tangent, 6.5 s)
/* timings: dt the tick; vis the 1.2 s a prey stays in view (real time, never charged to the sun); trip ticks (2 s: exposure
   in the first half, delivery at tick 40); gap and night in real seconds */
const FG_T = { dt: 1 / 30, vis: 1.2, trip: 60, expo: 30, del: 40, gap: 1.3, askMax: 30, maxStay: 20, genT: 0.45, nightT: 2.6, feedT: 0.5, auto: 4 };
/* the day's light (view only; the sun is the sim's clock, this paints it): [hour, sky top, horizon, sun] keyframes from dawn mist
   to rose dusk (D6 addendum 7: this chapter's world is an English hedgerow and orchard in May, in sage, gold and rose) */
const FG_SKY = [[5, '#5F6E93', '#EDBFA2', '#F6D2B0'], [6.5, '#8CA6C6', '#F4D6B6', '#FBE6C4'], [8.5, '#92B8D5', '#EBE6D0', '#FCF0CF'], [12, '#86B2D8', '#E3ECE3', '#FFF6DA'],
  [15.5, '#8AAFCB', '#EEE0BA', '#FCE6B0'], [18, '#7A88AC', '#F2BC88', '#F9C27A'], [19.6, '#55567F', '#E99E7F', '#F2A070'], [21, '#2E3256', '#B47A80', '#E08A6A']];
const FG_DIET = { big: 3, small: 1, t: 2 };   // food and carrying time; the long-run switch point is bE ÷ (1 + bt) = 1 ÷ 2 at b = 0.25 a second

const CH_FORAGER_V2 = {
  id: 'forager', v2: true, role: 'animal', place: 'hedge',
  accent: '#A8505E',   // rose-hip: the chapter's chrome tint and intro card (D6 addendum 7); the scene paints sage, gold and rose dusk
  intro: { goal: 'Feed your chicks; spend time like a great tit, not a calculator.' },
  content: FG_TEXT,
  P: {
    G: { v: 6, tag: 'designed', min: 2, max: 20, label: 'caterpillars per tree' },
    tau: { v: 4, tag: 'designed', min: 1, max: 10, label: 'tree emptying time' },
    kill: { v: 0.5, tag: 'xN', min: 0.05, max: 1, real: 'most attacks fail', label: 'stoop success' }
  },
  levels: [
    { name: 'The hedgerow', adds: 'prey choice', codes: ['F1'], minutes: 3 },
    { name: 'The orchard', adds: 'travel time', codes: ['F2'], minutes: 4 },
    { name: 'The hawk', adds: 'predation risk', codes: ['F3'], minutes: 3 },
    { name: 'Winter night', adds: 'a survival threshold', codes: ['F5'], minutes: 4 }
  ],
  keys: { Space: 'take, stay or speed', ArrowRight: 'pass or fly on', 1: 'steady feeder', 2: 'lucky feeder', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['Why do tits pass small caterpillars when big ones are common?', 'Birds do not calculate tangents. Why do they act as if they do?', 'This model counts only today’s food. What would counting future broods change?'], pool: 'trace' },
  starTraits: ['size'],
  encodings: [   // prey size and position carry every scored distinction; lineages by halo and marker shape; no hue carries a score
    { k: 'size', rgb: [110, 120, 56], channels: ['shape', 'luminance'] },
    { k: 'field', rgb: [196, 182, 104], channels: ['position', 'pattern'] }, { k: 'hedge', rgb: [74, 104, 52], channels: ['position', 'shape'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: FG_T.dt, s: null, _V: {},
    cfg(kd) { return FG_LV[Math.max(0, Math.min(4, kd | 0))] || FG_LV[0]; },   // by model kind (s.kd), not level number
    P() { return CH_FORAGER_V2.P; },
    reset(level, o) {
      o = o || {}; const kd = FG_KIND[level | 0] != null ? FG_KIND[level | 0] : 0, c = this.cfg(kd);
      if (o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.lever(o.thaw.lever); return; }
      this.s = { level: level | 0, kd, kind: c.kind, phase: 'run', t: 0, i: 0, sun: 0, food: 0, eat: 0, unt: false, whatif: null, auto: null,
        asks: [], pred: {}, exp: {}, tol: {}, hits: {}, alt: {}, ask: null, resume: null, rec: [], log: [] };
      const s = this.s;
      if (c.kind === 'hedge' || c.kind === 'hawk') { s.prey = null; s.busy = 0; s.carry = null; s.dead = false; s.first = true; s.pid = 0; this.newRound(s, []); }
      else if (c.kind === 'orchard') { s.deps = []; s.tree = 0; this.newRound(s, []); }
      else { s.nights = []; s.decs = 0; s.right = 0; s.reg = 0; s.cd = 0; this.newEve(s, []); }
    },
    /* ---------- rounds (stretches of hedge, orchards, evenings) ---------- */
    newRound(s, ev) {
      const r = this.cfg(s.kd).rd[s.i]; s.sun = 0; s.t = 0;
      if (s.kind === 'orchard') { s.tt = 0; s.got = 0; s.lastC = null; s.late = false; s.phase = 'fly'; s.flyTot = s.flyN = this.flyTicks(r.T); s.rec.push({ T: r.T, eat: 0, stays: [] }); }   // every round opens with a flight, so each tree costs one flight
      else { s.phase = 'run'; s.dead = false; s.rec.push(s.kind === 'hedge' ? { seenS: 0, takeS: 0, seenB: 0, takeB: 0, food: 0, sun: 0 } : { seenF: 0, takeF: 0, seenH: 0, takeH: 0, food: 0, sun: 0, caught: false }); }
      ev.push({ k: 'round', i: s.i, lab: r.lab || '' });
    },
    endRound(s, ev) {
      const L = this.cfg(s.kd), r = s.rec[s.i]; r.sun = s.sun; ev.push({ k: 'endround', i: s.i });
      if (s.auto) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
      s.prey = null; s.carry = null; s.busy = 0;
      if (s.i + 1 >= L.rd.length) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
      s.i++; s.phase = 'gap'; s.t = 0;
    },
    afterGap(s, ev) {
      if (s.kind === 'night') { this.newEve(s, ev); return; }
      this.newRound(s, ev);
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.t += dt;
      if (s.phase === 'ask') { if (!s.unt && !s.auto && s.t >= FG_T.askMax) this.commit(s, ev, s.ask.id, null); return ev; }
      if (s.phase === 'gap') { if (s.t >= FG_T.gap || s.auto) this.afterGap(s, ev); return ev; }
      if (s.kind === 'hedge' || s.kind === 'hawk') this.hedgeStep(s, ev);
      else if (s.kind === 'orchard') this.orchardStep(s, ev);
      else this.nightStep(s, ev);
      return ev;
    },

    /* ---------- the hedgerow and the hawk: sequential encounters, carry home, take or pass ---------- */
    rates(s) { const r = this.cfg(s.kd).rd[s.i]; return s.kind === 'hedge' ? [r.b, r.s] : [r.f, r.c]; },   // [rate of the first kind (big | field), of the second (small | hedge)] a second
    killTick(p) { return p > 0 ? 1 - Det.exp(Det.log(1 - p) / FG_T.expo) : 0; },   // per-tick catch chance while exposed, so a 30-tick trip carries danger p
    hedgeStep(s, ev) {
      const dt = this.dt, r = this.cfg(s.kd).rd[s.i];
      if (s.busy > 0) {
        s.busy--; s.sun += dt; const k = FG_T.trip - s.busy, c = s.carry;
        if (c.field && k <= FG_T.expo && r.p > 0) {
          const q = this.killTick(s.lever === 'nohawk' ? 0 : r.p);
          if (q > 0 && R() < 2 * q) {   // a stoop; half of stoops strike home
            const kill = R() < 0.5; ev.push({ k: 'stoop', kill });
            if (kill) { s.dead = true; s.mate = true; s.rec[s.i].caught = true; s.busy = 0; s.carry = null; ev.push({ k: 'caught' }); this.endRound(s, ev); return; }
          }
        }
        if (k === FG_T.del) { const v = s.kind === 'hedge' ? (c.big ? FG_DIET.big : FG_DIET.small) : 1; s.food += v; s.rec[s.i].food += v; ev.push({ k: 'deliver', sun: Math.round(s.sun * 100) / 100, v, big: !!c.big, field: !!c.field }); }
        if (s.busy === 0) { s.carry = null; ev.push({ k: 'back' }); }
        return;
      }
      if (s.prey) {   // in view: the sun waits while you decide (decisions are free; D1 untimed time accounting)
        s.prey.t += dt;
        if (s.auto) { const a = this.rule(s, s.auto); if (a) this.act1(s, a, ev); return; }
        if (!s.unt && !s.prey.wait && s.prey.t >= FG_T.vis) this.pass(s, ev, true);
        return;
      }
      if (s.sun >= r.S - 1e-9) { this.endRound(s, ev); return; }
      s.sun += dt;
      const [a, b] = this.rates(s);
      if (s.first) { s.first = false; this.appear(s, ev, s.kind === 'hedge', s.kind === 'hawk' ? false : null, true); return; }   // the first prey waits for you and cannot be a wrong take
      if (R() < (a + b) * dt) { const one = R() < a / (a + b); if (s.kind === 'hedge') this.appear(s, ev, one, false, false); else this.appear(s, ev, false, one, false); }
    },
    appear(s, ev, big, field, wait) {
      s.prey = { id: ++s.pid, big: !!big, field: !!field, t: 0, wait: !!wait };
      const R0 = s.rec[s.i]; if (s.kind === 'hedge') { if (big) R0.seenB++; else R0.seenS++; } else { if (field) R0.seenF++; else R0.seenH++; }
      ev.push({ k: 'appear', id: s.prey.id, big: !!big, field: !!field });
    },
    take(s, ev) {
      const p = s.prey; if (!p || s.busy > 0) return; const R0 = s.rec[s.i];
      if (s.kind === 'hedge') { if (p.big) R0.takeB++; else R0.takeS++; } else { if (p.field) R0.takeF++; else R0.takeH++; }
      s.carry = p; s.prey = null; s.busy = FG_T.trip; ev.push({ k: 'take', id: p.id, big: p.big, field: p.field });
    },
    pass(s, ev, timeout) { const p = s.prey; if (!p || p.wait) return; s.prey = null; ev.push({ k: 'pass', id: p.id, big: p.big, field: p.field, timeout: !!timeout }); },

    /* ---------- the orchard: a depleting tree, a flight, the marginal value theorem ---------- */
    gainAt(t) { const P = this.P(); return P.G.v * (1 - Det.exp(-t / P.tau.v)); },                    // expected catches after t s in a tree
    rateAt(t, T) { return this.gainAt(t) / (T + t); },                                                // long-run rate when leaving at t
    tStar(T) { const tau = this.P().tau.v, key = T + ':' + tau + ':' + this.P().G.v; this._ts = this._ts || {}; if (key in this._ts) return this._ts[key]; let lo = 0.01, hi = 60; for (let k = 0; k < 80; k++) { const m = (lo + hi) / 2, f = Det.exp(-m / tau) * (1 + (T + m) / tau) - 1; if (f > 0) lo = m; else hi = m; } return (this._ts[key] = (lo + hi) / 2); },   // e^(t/τ) = 1 + (T + t)/τ
    flyTicks(T) { return Math.round((1.2 + 0.25 * T) / this.dt); },                                    // long flights are shown faster than the sun counts them
    feedTick(s, ev) {
      const P = this.P(), dt = this.dt, t = s.tt * dt; s.tt++; s.sun += dt;
      if (R() < (P.G.v / P.tau.v) * Det.exp(-t / P.tau.v) * dt) { s.got++; s.eat++; s.rec[s.i].eat++; s.lastC = s.tt * dt; ev.push({ k: 'catch', got: s.got, t: s.tt * dt }); }
    },
    orchardStep(s, ev) {
      const r = this.cfg(s.kd).rd[s.i], dt = this.dt;
      if (s.phase === 'fly') { s.flyN--; s.sun += r.T / s.flyTot; if (s.flyN <= 0) this.land(s, ev); return; }
      if (s.phase !== 'tree') return;
      if (s.sun >= r.S - 1e-9 && !s.late) { s.late = true; ev.push({ k: 'late' }); }   // the round ends at your next departure, so every stay is whole
      if (s.auto) { const a = this.rule(s, s.auto); if (a) { this.act1(s, a, ev); return; } }
      if (s.unt && !s.auto) return;
      this.feedTick(s, ev);
      if (s.tt * dt >= FG_T.maxStay) this.leave(s, ev);   // an empty tree: the bird gives up at 20 s
    },
    leave(s, ev) {
      if (s.phase !== 'tree') return; const r = this.cfg(s.kd).rd[s.i], d = { T: r.T, stay: Math.round(s.tt * this.dt * 1000) / 1000, got: s.got, round: s.i };
      s.deps.push(d); s.rec[s.i].stays.push(d.stay); s.phase = 'fly'; s.flyTot = s.flyN = this.flyTicks(r.T);
      ev.push({ k: 'leave', stay: d.stay, got: d.got, T: r.T });
      if ((r.trees && s.rec[s.i].stays.length >= r.trees) || s.sun >= r.S - 1e-9) { s.phase = 'tree'; this.endRound(s, ev); }
    },
    land(s, ev) {
      const r = this.cfg(s.kd).rd[s.i]; s.tt = 0; s.got = 0; s.lastC = null; s.tree++; s.phase = 'tree'; ev.push({ k: 'land', tree: s.tree, round: s.i });
      if (r.askAt && !s.auto && s.rec[s.i].stays.length === r.askAt && s.asks.indexOf('b' + s.i) < 0) this.openAsk(s, ev, 'b' + s.i, 0, FG_AX, r.tol, FG_AX - 1, this.tStar(r.T), 'tree', this.tStar(this.cfg(1).rd[1 - s.i].T));   // the one prediction
    },

    /* ---------- the winter night: the steady and the lucky feeder; the chance of dawn by dynamic programming ---------- */
    V(e, t, need) { const key = e + ',' + t + ',' + need; if (key in this._V) return this._V[key]; const v = t <= 0 ? (e >= need ? 1 : 0) : Math.max(this.V(e + 2, t - 1, need), 0.5 * this.V(e, t - 1, need) + 0.5 * this.V(e + 4, t - 1, need)); this._V[key] = v; return v; },
    Q(a, e, t, need) { return a === 0 ? this.V(e + 2, t - 1, need) : 0.5 * this.V(e, t - 1, need) + 0.5 * this.V(e + 4, t - 1, need); },
    Wfix(a, e, t, need) { if (t <= 0) return e >= need ? 1 : 0; return a === 0 ? this.Wfix(a, e + 2, t - 1, need) : 0.5 * this.Wfix(a, e, t - 1, need) + 0.5 * this.Wfix(a, e + 4, t - 1, need); },   // a fixed policy's exact chance
    newEve(s, ev) { const [e, need] = this.cfg(4).rd[s.i]; s.e = e; s.need = need; s.v = 10; s.traj = [e]; s.phase = 'eve'; s.t = 0; s.cd = 0; ev.push({ k: 'eve', i: s.i, e, need }); },
    short(i) { const [e, need] = this.cfg(4).rd[i]; return e + 20 < need; },
    feed(s, ev, a) {
      if (s.phase !== 'eve' || s.cd > 0 || s.v <= 0) return; a = a ? 1 : 0;
      const q0 = this.Q(0, s.e, s.v, s.need), q1 = this.Q(1, s.e, s.v, s.need);
      if (Math.abs(q0 - q1) >= 0.05) { s.decs++; if ((a ? q1 : q0) >= Math.max(q0, q1) - 1e-9) s.right++; }
      s.reg = Math.round(((s.reg || 0) + Math.max(q0, q1) - (a ? q1 : q0)) * 1e6) / 1e6;   // chance of dawn given up against best play: luck-free, summed over the nights
      const g = a === 0 ? 2 : (R() < 0.5 ? 0 : 4); s.e += g; s.v--; s.traj.push(s.e); s.cd = Math.round((s.auto ? 0.12 : FG_T.feedT) / this.dt);
      ev.push({ k: 'feed', a, g, e: s.e, v: s.v });
    },
    nightStep(s, ev) {
      if (s.phase === 'eve') {
        if (s.cd > 0) { s.cd--; return; }
        if (s.v <= 0) { s.phase = 'night'; s.t = 0; ev.push({ k: 'nightfall' }); return; }
        if (s.auto) this.feed(s, ev, s.auto === 'gamble' ? 1 : 0);
        return;
      }
      if (s.phase === 'night' && s.t >= (s.auto ? 0.4 : FG_T.nightT)) {
        const ok = s.e >= s.need; s.nights.push({ ok, e: s.e, need: s.need, short: this.short(s.i) }); ev.push({ k: ok ? 'dawn' : 'starve', i: s.i });
        if (s.i + 1 >= this.cfg(4).rd.length) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
        s.i++; s.phase = 'gap'; s.t = 0;
      }
    },

    /* ---------- predictions: the sim opens the ask; the expectation is the model's, never the realised run ---------- */
    openAsk(s, ev, id, lo, hi, tol, start, expect, resume, alt) {
      s.ask = { id, kind: 'x', lo, hi, tol, start }; s.exp[id] = expect; s.tol[id] = tol; if (alt != null) s.alt[id] = alt;
      s.asks.push(id); s.resume = resume; s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id });
    },
    commit(s, ev, id, v) {
      if (!s.ask || s.ask.id !== id) return; const A = s.ask, e = s.exp[id]; let hit = false;
      if (v != null && isFinite(+v)) { v = Math.max(A.lo, Math.min(A.hi, +v)); const d = Math.abs(v - e); hit = d <= A.tol && (s.alt[id] == null || d < Math.abs(v - s.alt[id])); } else v = null;   // d1, b: also closer to the right answer than to the other orchard's
      s.pred[id] = v; s.hits[id] = hit; s.ask = null; s.phase = s.resume || 'run'; s.t = 0; ev.push({ k: 'commit', id, reveal: id });
    },
    /* ---------- What if? (D1 G9): the finished level is frozen; one round reruns by one fixed rule, at speed ---------- */
    lever(k) {
      const s = this.s; s.whatif = k; s.ask = null; s.t = 0; const n = s.kd;
      if (n === 0) { s.mine = s.rec[2].food; s.food -= s.rec[2].food; s.i = 2; s.rec.length = 2; s.auto = k === 'takeall' ? 'all' : 'big'; s.prey = null; s.busy = 0; s.carry = null; this.newRound(s, []); }
      else if (n === 1) { s.mine = s.rec[1].eat; s.i = 1; s.rec.length = 1; s.deps = s.deps.filter(d => d.round === 0); s.auto = k === 'quick' ? 'at2' : 'at10'; this.newRound(s, []); }
      else if (n === 2) { s.mine = s.rec[1].food; s.food -= s.rec[1].food; s.i = 1; s.rec.length = 1; s.lever = k; s.auto = 'all'; s.prey = null; s.busy = 0; s.carry = null; this.newRound(s, []); }
      else { s.auto = k; s.nights = []; s.i = 0; s.decs = 0; s.right = 0; s.reg = 0; s.wfix = this.cfg(4).rd.map(([e, need]) => this.Wfix(k === 'gamble' ? 1 : 0, e, 10, need)); this.newEve(s, []); }
    },
    rule(s, key) {   // fixed rules for What if? runs and bots: → an action or null
      if (s.kind === 'hedge' || s.kind === 'hawk') {
        const p = s.prey; if (!p) return null; let take;
        if (key === 'all') take = true; else if (key === 'none') take = !!p.wait;
        else if (key === 'big') take = s.kind === 'hedge' ? p.big : !p.field;
        else { const r = this.cfg(s.kd).rd[s.i]; take = s.kind === 'hedge' ? (p.big || r.b < 0.25) : (!p.field || r.p < this.riskStar()); }   // 'rule': the zero–one rule in force
        return { k: take ? 'take' : 'pass' };
      }
      if (s.kind === 'orchard' && s.phase === 'tree') {
        const r = this.cfg(s.kd).rd[s.i], t = s.tt * this.dt, at = key === 'at2' ? 2 : key === 'at10' ? 10 : key === 'mvt' ? this.tStar(r.T) : +String(key).slice(2) || 4;
        if (t >= at - 1e-9) return { k: 'leave' };
        return s.unt ? { k: 'stay' } : null;
      }
      if (s.kind === 'night' && s.phase === 'eve' && s.cd === 0 && s.v > 0) return { k: 'feed', a: key === 'gamble' ? 1 : key === 'steady' ? 0 : (s.e + 2 * s.v < s.need ? 1 : 0) };
      return null;
    },
    act1(s, a, ev) { if (a.k === 'take') this.take(s, ev); else if (a.k === 'pass') this.pass(s, ev, false); else if (a.k === 'leave') this.leave(s, ev); else if (a.k === 'stay') { for (let j = 0; j < 15 && s.phase === 'tree'; j++) this.feedTick(s, ev); } else if (a.k === 'feed') this.feed(s, ev, a.a); },
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      if (a.k === 'unt') { s.unt = !!a.on; ev.push({ k: 'unt', on: s.unt }); return ev; }
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id) this.commit(s, ev, a.id, a.moved === false ? null : a.v); return ev; }
      if (s.auto || s.phase === 'ask' || s.phase === 'gap') return ev;
      if ((s.kind === 'hedge' || s.kind === 'hawk') && s.phase === 'run') { if (a.k === 'pass' && s.prey && s.prey.wait) { ev.push({ k: 'wait' }); return ev; } if (a.k === 'take' && s.busy > 0) { ev.push({ k: 'still' }); return ev; } }
      if (s.kind === 'orchard' && a.k === 'stay' && !s.unt) return ev;
      this.act1(s, a, ev);
      return ev;
    },

    /* ---------- expectations behind the charts and the stars (all from the model in force) ---------- */
    dietRates(b, sm) { const D = FG_DIET; return { all: (D.big * b + D.small * sm) / (1 + D.t * b + D.t * sm), big: D.big * b / (1 + D.t * b) }; },   // food a second, long run
    dietStar() { const D = FG_DIET; return D.small / (D.t * (D.big - D.small)); },   // b where small ones stop paying: 0.25 a second (15 a minute), whatever the small rate
    /* expected chick food in a hawk round for "take every field caterpillar" (take = 1) or "hedge ones only" (0): the exact
       expectation of this sim's discrete chain (search ticks, 60-tick trips, exposure ticks 1–30, delivery at tick 40) */
    riskE(p, take, r, out) {   // out (optional): filled with [seconds, expected food so far] every half second, for the chart
      r = r || this.cfg(2).rd[1]; const dt = this.dt, N = Math.round(r.S / dt), lam = (r.c + r.f) * dt, ff = r.f / (r.c + r.f), q = this.killTick(p);
      let surv = 1; for (let k = 0; k < FG_T.expo; k++) surv *= 1 - q;
      const back = new Float64Array(N + FG_T.trip + 2); let P = 1, E = 0;
      for (let n = 0; n < N; n++) {
        P += back[n]; const m = P * lam, go = m * ((1 - ff) + ff * take);
        E += m * ((1 - ff) + ff * take * surv);
        back[n + 1 + FG_T.trip] += m * (1 - ff) + m * ff * take * surv;
        P = P - go;
        if (out && n % 15 === 0) out.push([Math.round(n * dt * 100) / 100, E]);
      }
      if (out) out.push([r.S, E]);
      return E;
    },
    riskStar(r) { if (!r && this._rs != null) return this._rs; let lo = 0.001, hi = 0.95; const safe = this.riskE(0, 0, r); for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (this.riskE(m, 1, r) > safe) lo = m; else hi = m; } const v = (lo + hi) / 2; if (!r) this._rs = v; return v; },   // ≈ 0.2: the danger per trip where the two rules tie
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_FORAGER_V2.stars, n = s.kd, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, interesting: this.interesting(s) };
    },
    share(a, b) { return b > 0 ? a / b : 0; },
    meanStay(s, rd) { const a = s.deps.filter(d => d.round === rd).map(d => d.stay); return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0; },
    interesting(s) {   // chosen from what happened (D1 G9; lessons §1.5)
      const n = s.kd;
      if (s.whatif) return null;   // a What if? card reads whatifBody, filled from its own run
      const st = CH_FORAGER_V2.stars;
      if (n === 0) { if (st.discover(s, 0)) return null; const R0 = s.rec, late = R0[1].seenS + R0[2].seenS, lateT = R0[1].takeS + R0[2].takeS; if (late >= 4 && lateT / late > 0.4) return 'allsmall'; if (R0[0].seenS >= 3 && R0[0].takeS / R0[0].seenS < 0.6) return 'picky'; return s.food < 40 ? 'hungry' : null; }
      if (n === 1) { if (st.discover(s, 1)) return null; return s.eat < 36 ? 'unfed' : 'same'; }
      if (n === 2) { if (s.rec.some(r => r.caught)) return 'caught'; if (st.discover(s, 2)) return null; const b = s.rec[1]; if (b.seenF >= 3 && b.takeF / b.seenF > 0.2) return 'bold'; const a = s.rec[0]; if (a.seenF >= 3 && a.takeF / a.seenF < 0.6) return 'timid'; return null; }
      const shorts = s.nights.filter(x => x.short), safe = s.nights.filter(x => !x.short);
      if (safe.some(x => !x.ok)) return 'reckless';
      if (shorts.length && shorts.every(x => !x.ok)) return (s.reg || 0) <= 0.1 ? 'unlucky' : 'nogamble';
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) { const A = s.ask, n = A.hi - A.lo > 20 ? 48 : A.hi - A.lo > 2 ? 56 : A.hi - A.lo > 0.7 ? 50 : 60; for (let k = 0; k <= n; k++) out.push({ k: 'predict', id: A.id, v: Math.round((A.lo + (A.hi - A.lo) * k / n) * 1e4) / 1e4 }); return out; }
      if (s.auto || s.phase === 'gap') return out;
      if ((s.kind === 'hedge' || s.kind === 'hawk') && s.phase === 'run' && s.prey && s.busy === 0) { out.push({ k: 'take' }); if (!s.prey.wait) out.push({ k: 'pass' }); }
      else if (s.kind === 'orchard' && s.phase === 'tree') { out.push({ k: 'leave' }, s.unt ? { k: 'stay' } : { k: 'wait' }); }
      else if (s.kind === 'night' && s.phase === 'eve' && s.cd === 0 && s.v > 0) out.push({ k: 'feed', a: 0 }, { k: 'feed', a: 1 });
      return out;
    },
    /* bots (tests/bots.js): (s, acts, rnd) → action | null; 'random' is generic. No bot may earn three stars in a level, nor across the unit. */
    bots: {
      alwaysA(s, acts) { return CH_FORAGER_V2.sim.bot(s, acts, 'all', 'at1.5', 'steady', 'lo'); },       // take everything, leave at once, steady
      alwaysB(s, acts) { return CH_FORAGER_V2.sim.bot(s, acts, 'none', 'at12', 'gamble', 'hi'); },       // pass everything, stay long, gamble
      greedy(s, acts) { return CH_FORAGER_V2.sim.bot(s, acts, 'all', 'gap2', 'steady', 'mid'); },        // greedy-now: any food now; stay while catches come; steady
      threshold(s, acts) { return CH_FORAGER_V2.sim.bot(s, acts, 'rule', 'at4', 'rule', 'mid'); },      // the right zero–one and night rules, a fixed 4 s stay
      lazy(s, acts) { return CH_FORAGER_V2.sim.bot(s, acts, 'rule', 'at4', 'rule', 'still'); },          // never moves a prediction
      bestNoThink(s, acts) { return CH_FORAGER_V2.sim.bot(s, acts, 'rule', 'mvt', 'rule', 'mid'); },     // the best play, every prediction at mid-axis
      expert(s, acts) { return CH_FORAGER_V2.sim.bot(s, acts, 'rule', 'mvt', 'rule', 'exact'); }         // test policy: reads s.exp (never in a sweep)
    },
    bot(s, acts, hedge, tree, night, pred) {
      if (typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt && !s.unt) return { k: 'unt', on: true };
      if (s.ask) {
        const A = s.ask, P = acts.filter(a => a.k === 'predict'), near = v => P.reduce((b, a) => (Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b));
        if (pred === 'still') return { k: 'predict', id: A.id, v: A.start, moved: false };
        if (pred === 'exact') return { k: 'predict', id: A.id, v: s.exp[A.id] };
        return near(pred === 'lo' ? A.lo : pred === 'hi' ? A.hi : (A.lo + A.hi) / 2);
      }
      if (s.kind === 'orchard' && s.phase === 'tree' && tree === 'gap2') { const t = s.tt * this.dt; if (t >= 1 && (s.lastC == null || t - s.lastC >= 2)) return { k: 'leave' }; return s.unt ? { k: 'stay' } : null; }
      return this.rule(s, s.kind === 'orchard' ? tree : s.kind === 'night' ? night : hedge);
    }
  },

  /* ---------- stars, against the expectation for the parameters in force (never the realised run of luck) ---------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false; const sim = CH_FORAGER_V2.sim, R0 = s.rec;
      if (n === 0) { const a = R0[0], lateSeen = R0[1].seenS + R0[2].seenS, lateTake = R0[1].takeS + R0[2].takeS; return s.food >= 40 && (a.seenS < 3 || a.takeS / a.seenS >= 0.6) && lateSeen >= 4 && lateTake / lateSeen <= 0.4; }
      if (n === 1) { const near = s.deps.filter(d => d.round === 0).length, far = s.deps.filter(d => d.round === 1).length; return s.eat >= 36 && near >= 2 && far >= 1 && sim.meanStay(s, 1) - sim.meanStay(s, 0) >= 1.5; }
      if (n === 2) { const a = R0[0], b = R0[1]; return s.food >= 10 && (a.seenF < 3 || a.takeF / a.seenF >= 0.6) && !b.caught && (b.seenF < 3 ? b.takeF === 0 : b.takeF / b.seenF <= 0.2); }
      const safe = s.nights.filter(x => !x.short), shorts = s.nights.filter(x => x.short);
      return s.nights.length === 4 && safe.every(x => x.ok) && shorts.some(x => x.ok);
    },
    predict: (s, n) => !s.whatif && n === 1 && !!s.hits.b1,   // the one prediction: the far orchard's best leaving time
    transfer: (s, n) => !s.whatif && n === 4 && s.nights.length === 4 && (s.reg || 0) <= 0.1   // the boss: pick feeders well (under 10 points of dawn chance given up)
  },
  unitStars(lv) {   // by level number: Discover = fed in two daytime levels and a night survived; Predict = the orchard; Transfer = the winter night
    const m = i => lv[i] | 0, cnt = (a, b, bit) => { let k = 0; for (let i = a; i <= b; i++) if (m(i) & bit) k++; return k; };
    return (cnt(0, 2, 1) >= 2 && (m(3) & 1) ? 1 : 0) | (m(1) & 2 ? 2 : 0) | (m(3) & 4 ? 4 : 0);
  },
  /* result code (30 bits) on assignment links: 0–2 level number, 3–5 mask, 6–13 a level number (L1 small taken late %, L2 far − near stay ×10 + 64,
     L3 field taken while hunting %, L4 100 − chance given up in points), 14–20 the prediction ×100 of its axis span (127: none) */
  resultBits(s, level) {
    if (!s) return 0; const lv = Math.max(0, Math.min(3, (level == null ? s.level : level) | 0)), n = s.kd, st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(v))), sim = this.sim;
    let x = 0; if (n === 0) x = 100 * sim.share(s.rec[1].takeS + s.rec[2].takeS, s.rec[1].seenS + s.rec[2].seenS); else if (n === 1) x = 10 * (sim.meanStay(s, 1) - sim.meanStay(s, 0)) + 64; else if (n === 2) x = 100 * sim.share(s.rec[1].takeF, s.rec[1].seenF); else x = 100 - 100 * (s.reg || 0);
    const pv = id => { const v = s.pred[id]; return v == null || id !== 'b1' ? 127 : c(100 * v / FG_AX, 126); };
    return (lv | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 3 | c(x, 255) << 6 | pv(s.asks[0]) << 14) >>> 0;
  },
  /* ================= view: lifecycle, input, juice, drawing (D4 §5.3 Forager timings; juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = false; this._asking = null; this._hudSig = ''; this._dockSig = '';
    this.v = { t: 0, ff: false, hold: -1, fold: 0, said: {}, bg: null, bgk: '', anims: [], seeds: [], chick: [0, 0, 0, 0], squash: [0, 0, 0, 0], ledger: [], deps: [], tan: null, flash: 0,
      dive: null, ghostR: null, birds: null, night: 0, thaw: !!o.thaw, scroll: 0, perch: 0, land: 0, cpos: null, hawkT: 0, banner: null };
    Sim.start(this, n, o);
    const ui = Save.d && Save.d.ui;
    if (!o.thaw && !o.replay && ui && ui.unt) Sim.act(this, { k: 'unt', on: true });   // a setting enters the run as a logged action (lessons §1.6)
    const s = this.sim.s;
    if (o.thaw) { const per = Math.floor(s.food / 4); this.v.chick = [per, per, per, per]; }
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = this.levels[n] && this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => this.banner(o.thaw ? this.content.levers[s.whatif] || name : name, Math.max(1000, ms + 400)));
    this.v.ghost0 = !o.thaw;
  },
  banner(text, ms) { this.v.banner = { text, t: 0, ms: ms || 1100 }; },
  kd() { return FG_KIND[this.level | 0] != null ? FG_KIND[this.level | 0] : 0; },   // the level's model kind (0 hedge, 1 orchard, 2 hawk, 4 night)
  asked(ri) { return ri === 0 || this.sim.s.hits.b1 !== undefined; },   // the near orchard shows its tangent from the start; the far one after its ask
  keyLine(s) {   // the key number for the moment (D6 decision 9), with its one-line meaning
    const C = this.content.hud, r = this.sim.cfg(s.kd).rd[Math.min(s.i, this.sim.cfg(s.kd).rd.length - 1)];
    if (s.kind === 'hedge') return Txt.f(C.keyHedge, { b: Math.round(60 * r.b), v: Math.round(60 * r.b) < 15 ? C.takeSmall : C.passSmall });
    if (s.kind === 'hawk') return Txt.f(C.keyHawk, { p: Math.round(100 * r.p), v: r.p < this.sim.riskStar() ? C.fieldPays : C.hedgePays });
    if (s.kind === 'orchard') return this.asked(s.i) ? Txt.f(C.keyTree, { t: (Math.round(10 * this.sim.tStar(r.T)) / 10).toFixed(1), T: r.T }) : C.orchard;
    if (s.kind === 'night') { const x = s.e + 2 * s.v; return Txt.f(C.keyNight, { x, need: s.need, v: x >= s.need ? C.playSafe : C.gamble }); }
    return '';
  },
  phoneStrip() { return typeof Strip !== 'undefined' && !!Strip.isOpen && typeof Strip.phone === 'function' && Strip.phone(); },
  hudH() {   // the HUD's real bottom over the canvas (it wraps on a phone); measured at most twice a second
    const z = (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56, v = this.v || {}, now = v.t || 0;
    if (v.hh != null && now - (v.hhT || 0) < 0.5) return v.hh;
    let h = z; try { const el = document.getElementById('hud'), cv = Stage.cv; if (el && cv && el.getBoundingClientRect) { const a = el.getBoundingClientRect(), b = cv.getBoundingClientRect(); if (a.height > 0) h = Math.max(z, Math.min(Stage.h * 0.3, a.bottom - b.top)); } } catch (e) { }
    if (this.v) { this.v.hh = h; this.v.hhT = now; } return h;
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'fg-' + k); },

  /* ---------- the frame ---------- */
  update(dt) {
    const v = this.v;
    for (const e of Sim.run(this, 0)) this.juice(e);   // live actions first, so a Lock in starts the hold before the sim moves on
    if (v.hold >= 0) { v.hold += dt; if (!this.phoneStrip() || v.hold > 1.4) v.hold = -1; }
    const s0 = this.sim.s, ff = s0.auto ? FG_T.auto : v.ff && /gap|night/.test(s0.phase) ? 3 : 1;
    const ev = Sim.run(this, v.hold >= 0 ? 0 : dt * ff), s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.flash = Math.max(0, v.flash - dt);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    v.anims = v.anims.filter(a => (a.t += dt) < a.d); v.seeds = v.seeds.filter(a => (a.t += dt) < a.d);
    for (let i = 0; i < 4; i++) v.squash[i] = Math.max(0, v.squash[i] - dt);
    if (v.tan) v.tan.k = Math.min(1, v.tan.k + dt / 0.5);
    if (v.dive) { v.dive.t += dt; if (v.dive.t > 0.9) v.dive = null; }
    if (v.fledge) v.fledge.t += dt;
    if (v.ghostR) { v.ghostR.t += dt; if (v.ghostR.t > 2) v.ghostR = null; }
    if (s.kind === 'night') v.night = s.phase === 'night' ? Math.min(1, v.night + dt / 0.8) : Math.max(0, v.night - dt / 0.8);
    if (s.kind === 'hedge' || s.kind === 'hawk') { if (s.phase === 'run' && !s.prey && !s.busy) v.scroll += dt * 26; }
    if (v.ghost0 && !v.banner) { v.ghost0 = false; this.teach(); }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; v.fold = 1; }
    if (v.fold && v.hold < 0) { v.fold = 0; if (typeof Predict !== 'undefined' && Predict.fold) Predict.fold(); }
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; v.ff = false; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; v.endT = 0; return; } v.endT += dt; if (v.endT < (v.fledge ? 1.7 : 0.9) && !s.auto) return; this._ended = true; this.finish(r); }
  },
  teach() {   // the ghost hand: within 3 s, on the verb this level adds (a known verb is skipped by Ghost itself)
    if (typeof Ghost === 'undefined') return; const n = this.kd();
    if (n === 0 || n === 2) Ghost.show({ verb: 'tap', key: ' ', at: () => this.preyXY() || [Stage.w * 0.7, Stage.h * 0.5], until: () => this.sim.s.rec.some(r => (r.takeB || 0) + (r.takeS || 0) + (r.takeF || 0) + (r.takeH || 0) > 0) });
    else if (n === 1) Ghost.show({ verb: 'tap', key: 'ArrowRight', at: () => { const P = this.pos(); return [P.nextX, P.treeY]; }, until: () => this.sim.s.deps.length > 0 });
    else if (n === 4) Ghost.show({ verb: 'tap', key: '1', at: () => { const P = this.pos(); return [P.fx[0], P.fy]; }, until: () => this.sim.s.v < 10 || this.sim.s.i > 0 });
  },
  hud() {
    const s = this.sim.s, C = this.content.hud, L = this.content.labels; if (typeof HUD === 'undefined') return;
    let t, num;
    if (s.auto) t = C.auto;
    else if (s.phase === 'ask') t = C.askB2;
    else if (s.phase === 'gap') t = s.kind === 'night' ? C.night : s.kind === 'hedge' && s.i === 2 ? C.swarm : C.gap;
    else if (s.kind === 'hedge') t = s.kd === 0 && s.first !== false ? this.content.firstWords : s.rec.length === 1 && s.rec[0].seenB + s.rec[0].seenS <= 1 && s.rec[0].takeB === 0 ? this.content.firstWords : s.unt ? C.hedgeU : this.keyLine(s);
    else if (s.kind === 'hawk') t = s.dead ? C.caught : s.unt ? C.hedgeU : s.rec[s.i].seenF + s.rec[s.i].seenH === 0 && s.i === 0 ? C.hawk : this.keyLine(s);
    else if (s.kind === 'orchard') t = s.unt ? C.orchardU : s.deps.length === 0 ? C.orchard : this.keyLine(s);
    else t = s.phase === 'night' ? C.nightfall : s.v === 10 && s.i === 0 ? C.night : this.keyLine(s);
    if (s.phase === 'over' && !s.auto) t = C.over;
    if (s.kind === 'hedge' || s.kind === 'hawk') num = Txt.f(L.nFood, { n: s.food });
    else if (s.kind === 'orchard') num = Txt.f(L.nEat, { n: s.eat });
    else num = Txt.f(L.nRes, { e: s.e, need: s.need });
    const sig = t + num; if (sig !== this._hudSig) { this._hudSig = sig; HUD.say(t, num); }
    const bar = typeof document !== 'undefined' && document.getElementById ? document.getElementById('bar-gen') : null;
    if (bar) { const lab = this.roundLabel(); if (bar.textContent !== lab) bar.textContent = lab; }
  },
  roundLabel() {
    const s = this.sim.s, L = this.content.labels, r = this.sim.cfg(s.kd).rd[Math.min(s.i, this.sim.cfg(s.kd).rd.length - 1)];
    if (s.kind === 'night') return Txt.f(L.eve, { n: s.i + 1 });
    const rr = r;
    return rr && rr.lab ? L[rr.lab] : '';
  },
  dock() {
    if (typeof Dock === 'undefined') return; const s = this.sim.s, L = this.content.labels;
    const sig = s.phase + (s.unt ? 'u' : '') + (s.ask ? s.ask.id : '') + (s.auto ? 'a' : '') + (s.kind === 'night' ? s.cd > 0 : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) { Dock.set([{ id: 'fg-lock', label: L.lock, key: 'Enter', primary: true, fn: () => this.lockIn() }]); return; }
    if (s.auto || s.phase === 'over') { Dock.set([]); return; }
    if ((s.kind === 'hedge' || s.kind === 'hawk') && s.phase === 'run') { Dock.set([{ id: 'fg-take', label: L.take, key: ' ', fn: () => Sim.act(this, { k: 'take' }) }, { id: 'fg-pass', label: L.pass, key: 'ArrowRight', fn: () => Sim.act(this, { k: 'pass' }) }]); return; }
    if (s.kind === 'orchard' && (s.phase === 'tree' || s.phase === 'fly')) { const b = [{ id: 'fg-fly', label: L.fly, key: 'ArrowRight', fn: () => Sim.act(this, { k: 'leave' }) }]; if (s.unt) b.unshift({ id: 'fg-stay', label: L.stay, key: ' ', fn: () => Sim.act(this, { k: 'stay' }) }); Dock.set(b); return; }
    if (s.kind === 'night' && s.phase === 'eve') { Dock.set([{ id: 'fg-s', label: L.steadyB, key: '1', fn: () => Sim.act(this, { k: 'feed', a: 0 }) }, { id: 'fg-l', label: L.luckyB, key: '2', fn: () => Sim.act(this, { k: 'feed', a: 1 }) }]); return; }
    Dock.set([]);
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    const chart = s.kind === 'night' ? 1 : 0;
    Predict.ask({ id: A.id, chart, kind: 'x', axis: { lo: A.lo, hi: A.hi }, start: A.start, tol: A.tol, soft: s.unt ? null : 24, needMove: true, linger: 1100,
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'predict', id: A.id, v: null, moved: false }), say: this.content.live.ask });
    if (typeof Live !== 'undefined') Live.say(this.content.live.ask);
    this._dockSig = ''; this.dock();
  },
  lockIn() { const s = this.sim.s; if (!s.ask || typeof Predict === 'undefined') return; const ov = Predict.overlay(s.kind === 'night' ? 1 : 0); if (ov && ov.id === s.ask.id && !ov.moved) { this.whisper('drag'); return; } Predict.commit(s.ask.id); },
  reveal(id) {
    const s = this.sim.s; if (typeof Predict === 'undefined' || s.exp[id] == null) return;
    Predict.reveal(id, s.exp[id], s.tol[id]); this.whisper(s.pred[id] == null ? 'none' : s.hits[id] ? 'hit' : 'out');
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
  },

  /* ---------- the level card ---------- */
  finish(r) {
    const s = this.sim.s, n = this.kd(), C = this.content, sim = this.sim, o = { level: this.level, mask: r.mask, final: n === 4, interesting: r.interesting }, V = this.bodyVars();   // n: the model kind; kinds 0–2 are levels 0–2, so they index the level texts
    if (s.whatif) { o.body = Txt.f(C.whatifBody[s.whatif], V); o.take = null; o.interesting = null; }
    else if (n < 4) { o.take = C.levelTake[n]; o.body = Txt.f(C.levelBody[n], V); }
    else { o.take = C.take; o.body = Txt.f(C.body, V); o.bodyFirst = true; }
    if (!s.whatif && typeof Freezer !== 'undefined') { Freezer.put(this.id, 1, sim.snapshot(), { force: true }); o.whatIf = { gen: 1, levers: { 0: ['takeall', 'bigonly'], 1: ['quick', 'slow'], 2: ['bold', 'nohawk'], 4: ['steady', 'gamble'] }[n] }; }
    o.why = n < 4 ? C.levelWhy[n] : C.why;
    { const LS = (C.levelStars || [])[this.level] || {}; o.stars = {}; [['discover', 1], ['predict', 2], ['transfer', 4]].forEach(([k, b]) => { o.stars[k] = r.mask & b ? C.stars[k] : LS[k] || null; }); }   // a star this level earned but the unit still lacks names where the unit earns it
    const spec = this.cardSpec(); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  bodyVars() {
    const s = this.sim.s, sim = this.sim, pc = (a, b) => Math.round(100 * sim.share(a, b)), f1 = x => (Math.round(x * 10) / 10).toFixed(1), n = this.kd();
    if (n === 0) { const R0 = s.rec, rt = sim.dietRates(0.6, 1.5), S2 = R0[2] && R0[2].sun > 0 ? R0[2].sun : 25; return { a: pc(R0[0].takeS, R0[0].seenS), b: pc((R0[1] || {}).takeS + ((R0[2] || {}).takeS || 0), (R0[1] || {}).seenS + ((R0[2] || {}).seenS || 0)), f: s.food, n: R0[2] ? R0[2].food : 0, e: Math.round(rt.all * S2), g: Math.round(rt.big * S2) }; }   // expectations over the stretch's own length
    if (n === 1) { const at = s.whatif === 'quick' ? 2 : 10, S1 = s.rec[1] && s.rec[1].sun > 0 ? s.rec[1].sun : 66; return { a: f1(sim.meanStay(s, 0)), b: f1(sim.meanStay(s, 1)), c: f1(sim.tStar(2)), d: f1(sim.tStar(10)), n: s.rec[1] ? s.rec[1].eat : 0, e: Math.round(sim.rateAt(at, 10) * S1), bb: Math.round(sim.rateAt(sim.tStar(10), 10) * S1) }; }
    if (n === 2) { const R0 = s.rec, ra = sim.cfg(2).rd[1]; return { a: pc(R0[0].takeF, R0[0].seenF), b: R0[1] ? pc(R0[1].takeF, R0[1].seenF) : 0, p: Math.round(100 * sim.riskStar()), n: R0[1] ? R0[1].food : 0, e: f1(sim.riskE(s.whatif === 'nohawk' ? 0 : ra.p, 1)), h: f1(sim.riskE(0, 0)) }; }
    const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length), vs = sim.cfg(4).rd.map(([e, need]) => sim.V(e, 10, need));
    return { r: Math.round(100 * (s.reg || 0)), a: s.right, b: s.decs, p: s.wfix ? Math.round(100 * mean(s.wfix)) : 0, bb: Math.round(100 * mean(vs)) };
  },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, S2 = typeof Snd2 !== 'undefined' ? Snd2 : null, P = this.pos(), L = this.content.labels;
    const snd = (k, x, y) => { if (S2) S2.play(k, { x, y }); };
    switch (e.k) {
      case 'round': if (e.i > 0 || v.thaw) this.banner(L[e.lab] || '', 1200); if (e.i > 0 && typeof Snd !== 'undefined' && Snd.dawn) { Snd.dawn(); if (F) F.ring(Stage.w / 2, this.hudH() + 40, 30, { ms: 400 }); } return;
      case 'appear': {
        const p = this.preyXY(); if (!p) return; if (F) { F.ring(p[0], p[1], e.big ? 22 : 15, { ms: 160 }); F.burst('dust', p[0], p[1] - 6, 3, { ink: '#7E9A4C' }); }
        snd('tick', p[0], p[1]); if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.appear, { k: s.kind === 'hawk' ? (e.field ? L.field : L.hedge) : e.big ? L.big : L.small }));
        return;
      }
      case 'take': { const p = v.lastPrey || [P.preyX, P.preyY]; if (F) { F.tier(1); F.burst('dust', p[0], p[1], 6, { ink: '#8FA35A' }); } if (typeof Snd !== 'undefined' && Snd.peck) Snd.peck(); this.ledger(e, true); return; }
      case 'pass': { const p = v.lastPrey || [P.preyX, P.preyY]; v.anims.push({ k: 'hide', x: p[0], y: p[1], big: e.big, field: e.field, t: 0, d: 0.25 }); snd('swish', p[0], p[1]); if (e.timeout && !v.said.passed) { v.said.passed = 1; this.whisper('passed'); } this.ledger(e, false); return; }
      case 'wait': this.whisper('wait'); return;
      case 'late': this.whisper('late'); return;
      case 'still': this.whisper('still'); return;
      case 'deliver': {
        let j = 0; for (let i = 1; i < 4; i++) if (v.chick[i] < v.chick[j]) j = i; v.chick[j] += e.v; v.squash[j] = 0.18; (v.dl || (v.dl = [])).push({ i: s.i, sun: e.sun, v: e.v });
        const c = this.chickXY(j); v.anims.push({ k: 'arc', x0: P.nestX, y0: P.nestY - P.box * 0.2, x1: c[0], y1: c[1], big: e.big, t: 0, d: 0.35 });
        if (F) F.pop(Txt.f(L.plus, { n: e.v }), c[0], c[1] - 24, 1); snd('peep', c[0], c[1]);
        if (s.kind === 'hedge' && s.food >= 40 && !v.said.full) { v.said.full = 1; this.whisper('full'); if (F) F.tier(2, () => F.ring(P.nestX, P.nestY, 40, { ms: 600 })); }
        return;
      }
      case 'back': return;
      case 'stoop': {
        const tp = this.titXY(); v.dive = { t: 0, kill: e.kill, x: tp[0], y: tp[1] };
        if (F) { F.shake(5, 180); F.burst('scale', tp[0], tp[1], e.kill ? 10 : 4, { ink: '#8B7E6A' }); if (e.kill) F.hitstop(70); }
        snd(e.kill ? 'crack' : 'wing', tp[0], tp[1]); if (!e.kill) this.whisper('miss');
        return;
      }
      case 'caught': { const tp = this.titXY(); v.ghostR = { x: tp[0], y: tp[1], t: 0 }; this.whisper('caught'); return; }
      case 'endround': if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); return;
      case 'ask': return;
      case 'commit': if (this.phoneStrip()) v.hold = 0; this.reveal(e.reveal); return;
      case 'land': { if (F) F.burst('dust', P.treeX, P.treeY - P.tree * 0.2, 5, { ink: '#6E8F45' }); if (typeof Live !== 'undefined' && e.tree > 1) Live.say(Txt.f(this.content.live.tree, { n: e.tree, c: s.eat })); v.picks = []; v.ct = []; return; }
      case 'catch': {
        const SP = this.sim.P(), left = SP.G.v * Det.exp(-e.t / SP.tau.v), kk = Math.max(0, Math.min(SP.G.v - 1, Math.ceil(left) - 1)), q = this.slotXY(P, P.treeX, P.tree, kk, s.tree), x = q[0], y = q[1];   // the bird takes the caterpillar that is fading
        v.cpos = [x, y]; (v.picks || (v.picks = [])).push([x, y]); (v.ct || (v.ct = [])).push(e.t);
        if (F) { F.tier(1); F.burst('dust', x, y, 5, { ink: '#8FA35A' }); F.pop('+1', x, y - 18, 1); } if (typeof Snd !== 'undefined' && Snd.peck) Snd.peck();
        return;
      }
      case 'leave': { v.prevStay = v.lastStay; v.lastStay = e.stay; snd('wing', P.titX, P.titY); v.deps.push({ stay: e.stay, got: e.got, T: e.T }); (v.past || (v.past = [])).push({ ct: (v.ct || []).slice(), stay: e.stay, round: s.i }); if (v.past.length > 6) v.past.shift(); if (this.asked(s.i)) v.tan = { k: 0, T: e.T }; return; }
      case 'eve': if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.live.eve, { n: e.i + 1, e: e.e, need: e.need, v: 10 })); if (e.i > 0) this.banner(Txt.f(L.eve, { n: e.i + 1 }), 1100); return;
      case 'feed': {
        const fx = P.fx[e.a], tx = P.gx, ty = P.gaugeY(e.e); v.fly = { a: e.a, t: 0 };
        for (let i = 0; i < Math.max(1, e.g); i++) v.seeds.push({ x0: fx, y0: P.fy - 10, x1: tx, y1: ty, t: -0.05 * i, d: 0.55 + 0.05 * i, g: e.g });
        if (e.g === 0) { if (F) F.burst('dust', fx, P.fy, 6); this.whisper('empty'); if (typeof Snd !== 'undefined' && Snd.miss) Snd.miss(); }
        else { if (F) { F.pop(Txt.f(L.plus, { n: e.g }), fx, P.fy - 30, 1); if (e.g === 4) F.tier(2, () => F.burst('spark', fx, P.fy - 10, 8)); } snd('pour', fx, P.fy); }
        if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); return;
      }
      case 'nightfall': snd('dusk', Stage.w / 2, Stage.h / 2); return;
      case 'dawn': { this.whisper('survive'); if (F) F.tier(3, () => F.ring(P.titX, P.titY, 50, { ms: 700 })); snd('interesting', P.titX, P.titY); return; }
      case 'starve': { v.ghostR = { x: P.titX, y: P.titY, t: 0 }; this.whisper('starve'); if (typeof Snd !== 'undefined' && Snd.miss) Snd.miss(); if (F) F.ring(P.titX, P.titY, 30, { dashed: true, ms: 2000 }); return; }
      case 'unt': this._dockSig = ''; return;
      case 'over': if ((s.kind === 'hedge' || s.kind === 'hawk') && !s.auto) { v.fledge = { t: 0 }; if (S2) S2.play('wing', { x: P.nestX, y: P.nestY }); } return;
    }
  },
  ledger(e, took) { const s = this.sim.s; if (s.kind !== 'hedge') return; this.v.ledger.push({ big: e.big, took, i: s.i }); },
  hash(v) { let h = 2166136261; const t = String(v); for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h ^ h >>> 13) >>> 0; },

  /* ---------- input: tap the caterpillar to take it, the hedge to pass; the next tree to fly on; a feeder to visit it ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, P = this.pos();
    if (/gap|night/.test(s.phase)) { v.ff = true; return; }
    if (s.auto || s.phase === 'ask' || s.phase === 'over') return;
    if (s.kind === 'hedge' || s.kind === 'hawk') {
      if (s.busy > 0) { Sim.act(this, { k: 'take' }); return; }
      const p = this.preyXY(); if (!p) return;
      const r = Math.max(44, P.u * 0.13), dx = x - p[0], dy = y - p[1], d = Math.sqrt(dx * dx + dy * dy);
      Sim.act(this, { k: d <= r ? 'take' : 'pass' }); return;
    }
    if (s.kind === 'orchard' && s.phase === 'tree') { if (x > P.treeX + P.tree * 0.45) Sim.act(this, { k: 'leave' }); else if (s.unt) Sim.act(this, { k: 'stay' }); return; }
    if (s.kind === 'night' && s.phase === 'eve') Sim.act(this, { k: 'feed', a: x < (P.fx[0] + P.fx[1]) / 2 ? 0 : 1 });
  },
  onKey(k) {
    const s = this.sim.s, v = this.v;
    if (k === ' ' && /gap|night/.test(s.phase)) { v.ff = true; return; }
    if (s.kind === 'night' && (k === '1' || k === '2')) { Sim.act(this, { k: 'feed', a: k === '2' ? 1 : 0 }); return; }
    if (k === ' ') { Sim.act(this, { k: s.kind === 'orchard' ? 'stay' : 'take' }); return; }
    if (k === 'ArrowRight') Sim.act(this, { k: s.kind === 'orchard' ? 'leave' : 'pass' });
  },
  teacherStep() { this.v.ff = true; },

  /* ---------- geometry (canvas px); recomputed per call, cheap ---------- */
  pos() {
    const W = Stage.w, H = Stage.h, u = Stage.u || Math.min(W, 1.2 * H), top = this.hudH() + 6, s = this.sim.s, gy = s && s.kind === 'hawk' ? H - Math.max(110, Math.min(260, H * 0.32)) : H - Math.max(46, Math.min(110, H * 0.15));
    const P = { W, H, u, top, gy, hero: Math.max(52, Math.min(110, 0.16 * u)) };
    // hedge and hawk: nest box at the left, the tit on the hedge top, prey ahead on a leaf or out in the field
    P.hedgeTop = top + (gy - top) * 0.36; P.hedgeBot = gy - 4; P.box = Math.max(76, Math.min(150, 0.26 * u));
    P.nestX = Math.max(P.box * 0.62, W * 0.14); P.nestY = P.hedgeTop - P.box * 0.05;
    P.titX = W * 0.46; P.titY = P.hedgeTop + (P.hedgeBot - P.hedgeTop) * 0.22;
    P.preyX = W * 0.76; P.preyY = P.hedgeTop + (P.hedgeBot - P.hedgeTop) * 0.42;
    P.fieldX = W * 0.66; P.fieldY = gy + (H - gy) * 0.5;
    // orchard: the current tree at 42% of the width, the next to the right at a distance set by the flight time
    P.tree = Math.max(130, Math.min(300, 0.5 * u, (gy - top) * 0.8)); P.treeX = W * 0.42; P.treeY = gy; P.nextX = Math.min(W - 26, P.treeX + P.tree * 0.95 + (s && s.kind === 'orchard' && this.sim.cfg(s.kd).rd[s.i] && this.sim.cfg(s.kd).rd[s.i].T > 5 ? W : 0));
    // night: two feeders, the perch between, the reserve gauge at the right
    P.fx = [W * 0.2, W * 0.58]; P.fy = top + (gy - top) * 0.62; P.gx = W - Math.max(30, W * 0.08); P.gTop = top + 40; P.gBot = gy - 10; P.gaugeY = e => P.gBot - (P.gBot - P.gTop) * Math.max(0, Math.min(1, e / 36));
    if (s && s.kind === 'night') { P.titX = W * 0.39; P.titY = top + (gy - top) * 0.25 - P.hero * 0.3; }
    if (s && s.kind === 'orchard') { P.titX = P.treeX; P.titY = P.treeY - P.tree * 0.6; }
    return P;
  },
  preyXY() {
    const s = this.sim.s; if (!s.prey) return null; const P = this.pos(), id = s.prey.id, j = (this.hash('p' + id) % 1000) / 1000;
    const xy = s.prey.field ? [P.fieldX + (j - 0.5) * P.W * 0.22, P.fieldY + (((this.hash('q' + id) % 100) / 100) - 0.5) * (P.H - P.gy) * 0.4] : [P.preyX + (j - 0.5) * P.W * 0.12, P.preyY + (((this.hash('q' + id) % 100) / 100) - 0.5) * (P.hedgeBot - P.hedgeTop) * 0.3];
    this.v.lastPrey = xy; return xy;
  },
  chickXY(j) { const P = this.pos(), cw = P.box * 0.62, x0 = P.nestX - cw / 2 + cw * (j % 2 ? 0.72 : 0.28) + (j > 1 ? cw * 0.12 : -cw * 0.04), y = P.nestY + P.box * (j > 1 ? 0.2 : 0.1); return [x0, y]; },
  titXY() {   // where the tit is drawn now: on its perch, or along the trip (dart to the prey, fly to the nest, feed, fly back)
    const s = this.sim.s, P = this.pos(), v = this.v;
    if ((s.kind === 'hedge' || s.kind === 'hawk') && s.busy > 0 && s.carry) {
      const k = (FG_T.trip - s.busy) / FG_T.trip, pr = v.carryXY || [P.preyX, P.preyY], nest = [P.nestX + P.box * 0.45, P.nestY - P.box * 0.05], home = [P.titX, P.titY];
      const lerp2 = (a, b, f, arc) => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f - arc * Det.sin(Math.PI * f)];
      if (k < 0.15) return lerp2(home, pr, k / 0.15, 10);
      if (k < 0.62) return lerp2(pr, nest, (k - 0.15) / 0.47, P.u * 0.12);
      if (k < 0.72) return nest;
      return lerp2(nest, home, (k - 0.72) / 0.28, P.u * 0.06);
    }
    if (s.kind === 'orchard' && s.phase === 'tree' && v.cpos && s.tt > 0) return v.cpos;
    return [P.titX, P.titY];
  },

  /* ---------- drawing ---------- */
  draw(c, w, h) {
    const s = this.sim.s; if (!s) return;
    if (s.kind === 'hedge' || s.kind === 'hawk') this.drawHedge(c, w, h);
    else if (s.kind === 'orchard') this.drawOrchard(c, w, h);
    else this.drawNight(c, w, h);
    const v = this.v; if (typeof Lbl === 'undefined') return;
    if (v.banner) { const b = v.banner, a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; Lbl.put('fg-banner', b.text, w / 2, this.hudH() + 34, { size: 22, c, weight: 700 }); c.restore(); }
    if (/gap|night/.test(s.phase) && !v.ff && !s.auto) Lbl.put('fg-ff', this.content.labels.ff, w - 12, h - 16, { align: 'right', size: 12, c });
  },
  sky(c, w, h, top, bot, k) {   // the winter boss's baked sky (k 4); the day levels paint theirs live from the clock (skyLive)
    const S = [['#F3D9B1', '#C9DCE3'], ['#A9CCE0', '#E4EEE6'], ['#E9C98E', '#CFE0DA'], ['#5B5A7E', '#E6A97A'], ['#D99A8E', '#3A3F66']][k], g = c.createLinearGradient(0, 0, 0, bot);
    g.addColorStop(0, S[1]); g.addColorStop(1, S[0]); c.fillStyle = g; c.fillRect(0, 0, w, bot);
  },
  /* ---------- the day clock: one light from dawn mist to rose dusk across L1–L4 (view only) ---------- */
  mixC(a, b, k) { const p = q => [1, 3, 5].map(i => parseInt(q.slice(i, i + 2), 16)), A = p(a), B = p(b); return 'rgb(' + A.map((x, i) => Math.round(x + (B[i] - x) * k)).join(',') + ')'; },
  hour() {   // hedgerow 05:10–08:50, orchard 11–14, hawk 14:35–19:25 into rose dusk (the winter night bakes its own sky)
    const n = this.kd(), f = this.dayFrac();
    if (n === 0) return 5.15 + 3.6 * f; if (n === 1) return 11 + 3 * f; return 14.6 + 4.8 * f;
  },
  skyAt(h) { const K = FG_SKY; let i = 0; while (i < K.length - 2 && h > K[i + 1][0]) i++; const a = K[i], b = K[i + 1], k = Math.max(0, Math.min(1, (h - a[0]) / (b[0] - a[0]))); return { top: this.mixC(a[1], b[1], k), hor: this.mixC(a[2], b[2], k), sun: this.mixC(a[3], b[3], k) }; },
  sunXY(h, P, hor) { const f = Math.max(0, Math.min(1, (h - 5) / 16)); return [P.W * (0.06 + 0.88 * f), hor + 10 - Det.sin(Math.PI * f) * Math.max(30, hor - P.top - 46)]; },
  skyLive(c, P, hor, h) {   // the sky, the sun and its glow, painted each frame from the clock (two gradients and an arc)
    const S = this.skyAt(h), g = c.createLinearGradient(0, P.top, 0, hor); g.addColorStop(0, S.top); g.addColorStop(1, S.hor); c.fillStyle = g; c.fillRect(0, 0, P.W, hor + 40);
    const [x, y] = this.sunXY(h, P, hor), r = Math.max(12, P.u * 0.035), R = r * 7, gl = c.createRadialGradient(x, y, r * 0.6, x, y, R);
    gl.addColorStop(0, h > 17 || h < 7 ? 'rgba(255,214,160,0.6)' : 'rgba(255,246,214,0.5)'); gl.addColorStop(1, 'rgba(255,240,210,0)'); c.fillStyle = gl; c.fillRect(x - R, y - R, 2 * R, 2 * R);
    c.fillStyle = S.sun; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  },
  castLive(c, P, h, y0) {   // the light over the land: cool at dawn, gold late in the afternoon, rose at dusk (multiply keeps the dark lines)
    let col = null, a = 0;
    if (h < 8) { col = '#8E9CC4'; a = 0.24 * Math.min(1, (8 - h) / 2.4); }
    else if (h > 15) { col = h < 18.6 ? '#F0B060' : '#D7868A'; a = h < 18.6 ? 0.32 * Math.min(1, (h - 15) / 3) : 0.32 + 0.1 * Math.min(1, (h - 18.6) / 2); }
    if (!col || a <= 0.005) return; c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = a; c.fillStyle = col; c.fillRect(0, y0 || 0, P.W, P.H - (y0 || 0)); c.restore();
  },
  mistLive(c, P, h, y0, y1) {   // dawn mist lying in bands along the hedge foot and the field; gone by mid-morning
    const a = 0.62 * Math.max(0, Math.min(1, (8.4 - h) / 2.8)); if (a <= 0.01) return; const t = typeof Fx !== 'undefined' && Fx.calm ? 0 : this.v.t;
    for (let i = 0; i < 3; i++) {
      const yc = y0 + (y1 - y0) * (0.15 + 0.4 * i), hh = 22 + 16 * i, dx = Det.sin(t * 0.08 + i * 2.1) * 34, g = c.createLinearGradient(0, yc - hh, 0, yc + hh);
      g.addColorStop(0, 'rgba(246,240,228,0)'); g.addColorStop(0.5, 'rgba(246,240,228,' + (a * (0.5 + 0.22 * i)).toFixed(3) + ')'); g.addColorStop(1, 'rgba(246,240,228,0)');
      c.fillStyle = g; c.fillRect(dx - 50, yc - hh, P.W + 100, 2 * hh);
    }
  },
  insects(c, P, y0, y1, n, h) {   // midges dancing in the light and, by day, an orange-tip butterfly along the hedge (view only; none under Calm)
    if (typeof Fx !== 'undefined' && Fx.calm) return; const t = this.v.t;
    c.fillStyle = h > 17 ? 'rgba(255,214,150,0.85)' : 'rgba(236,230,196,0.75)';   // a midge swarm dancing in one place
    const mx = P.W * 0.78, my = y0 + (y1 - y0) * 0.4;
    for (let i = 0; i < n; i++) { const x = mx + Det.sin(t * (1.9 + i * 0.37) + i * 2.3) * 16, y = my + Det.sin(t * (2.7 + i * 0.29) + i * 1.7) * 10; c.beginPath(); c.arc(x, y, 1.1, 0, TAU); c.fill(); }
    if (h > 18.8) return; const ph = (t % 15) / 15; if (ph > 0.55) return;
    const f = ph / 0.55, x = -20 + (P.W + 40) * f, y = y0 + (y1 - y0) * 0.25 + Det.sin(f * 17) * 14, fl = 0.3 + 0.7 * Math.abs(Det.sin(t * 13)), s = Math.max(7, P.u * 0.018);
    c.save(); c.translate(x, y); c.fillStyle = '#F6F1E4'; for (const g of [-1, 1]) { c.beginPath(); c.ellipse(g * s * 0.55 * fl, -s * 0.15, s * 0.6 * fl, s * 0.5, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#E8893A'; for (const g of [-1, 1]) { c.beginPath(); c.arc(g * s * 0.8 * fl, -s * 0.3, s * 0.24, 0, TAU); c.fill(); } c.fillStyle = '#1B1612'; c.fillRect(-0.8, -s * 0.5, 1.6, s * 0.9); c.restore();   // the male's orange wing tips
  },
  bake(key, w, h, fn) {   // static layers, baked once per size and key (never in the frame loop); a resize drops them all
    const v = this.v, sz = Math.round(w) + 'x' + Math.round(h); if (v.bgk !== sz) { v.bgk = sz; v.bgs = {}; } if (v.bgs[key]) return v.bgs[key];
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, cv = mkCanvas(Math.round(w * d), Math.round(h * d)), c = cv.getContext('2d'); c.scale(d, d); fn(c, w, h); v.bgs[key] = cv; return cv;
  },
  hills(c, w, y, col, amp, seed) { const r = rng(seed); c.fillStyle = col; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w + 40; x += 40) c.lineTo(x, y - amp * (0.4 + 0.6 * r())); c.lineTo(w, y + 400); c.lineTo(0, y + 400); c.closePath(); c.fill(); },
  leafBlob(c, x, y, r, col, rr) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, q = r * (0.75 + 0.35 * rr()); c.moveTo(x + Det.cos(a) * q * 0.3, y + Det.sin(a) * q * 0.3); c.arc(x + Det.cos(a) * q * 0.55, y + Det.sin(a) * q * 0.45, q * 0.5, 0, TAU); } c.fill(); },
  hedgeTile(P) {   // a 2W-wide hawthorn hedge in May: shadowed depths, sunlit sage crown, cream may blossom, dog roses, bramble arches; scrolled as the bird hops along
    const v = this.v, k = 'h' + Math.round(P.W) + 'x' + Math.round(P.hedgeBot - P.hedgeTop); if (v.htk === k && v.ht) return v.ht; v.htk = k;
    const d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, W2 = Math.round(P.W * 2), Hh = Math.round(P.hedgeBot - P.hedgeTop + 30), cv = mkCanvas(W2 * d, Hh * d), c = cv.getContext('2d'); c.scale(d, d);
    const r = rng(17), wrap = (fn, x) => { fn(x); if (x < 40) fn(x + W2); if (x > W2 - 40) fn(x - W2); };
    const g = c.createLinearGradient(0, 24, 0, Hh); g.addColorStop(0, '#3E5631'); g.addColorStop(1, '#1F2F1B'); c.fillStyle = g; c.fillRect(0, 28, W2, Hh - 28);
    const passes = [[['#2F4A27', '#36532C', '#2A4324'], 0.25, 1, 13, 16], [['#486836', '#527340', '#456335'], 0.1, 0.8, 17, 13], [['#6C8A54', '#7A9760', '#88A36A', '#97B176'], 0, 0.32, 12, 11]];
    for (const [cols, y0, y1, step, q0] of passes) for (let i = 0; i < W2 / step; i++) {
      const x = (i * step + r() * step) % W2, top = 8 + 10 * Det.sin(x / W2 * TAU * 3) * Det.sin(x / W2 * TAU * 5), y = top + (Hh - top) * (y0 + r() * (y1 - y0)), q = q0 + r() * 14, col = cols[(r() * cols.length) | 0], seed = r() * 1e6;
      wrap(xx => this.leafBlob(c, xx, y, q, col, rng(seed | 0)), x);
    }
    c.lineCap = 'round';   // bramble shoots arching out of the crown, leafy
    for (let i = 0; i < W2 / 150; i++) { const x = r() * W2, sp = 18 + r() * 22, hi = 6 + r() * 8, sd = (r() * 1e6) | 0; wrap(xx => { const rr = rng(sd); c.strokeStyle = '#4E3A2A'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(xx, 26); c.quadraticCurveTo(xx + sp * 0.5, 26 - hi * 2, xx + sp, 22 + hi); c.stroke(); for (let j = 1; j < 4; j++) { const f = j / 4; this.leafBlob(c, xx + sp * f, 26 - hi * 2 * f * (1 - f) * 2 + 2, 5, '#4F6E3B', rr); } }, x); }
    for (let i = 0; i < W2 / 24; i++) {   // hawthorn (may) blossom: cream clusters, thick on the crown
      const x = r() * W2, y = 12 + (Hh - 30) * r() * r(), n = 3 + ((r() * 5) | 0);
      wrap(xx => { for (let j = 0; j < n; j++) { const a = j / n * TAU + x; c.fillStyle = j % 3 ? '#F3EEDF' : '#E6DEC8'; c.beginPath(); c.arc(xx + Det.cos(a) * 3.4, y + Det.sin(a) * 2.6, 1.9, 0, TAU); c.fill(); } }, x);
    }
    for (let i = 0; i < W2 / 95; i++) {   // dog roses
      const fx = r() * W2, fy = 18 + r() * (Hh - 50);
      wrap(xx => { c.fillStyle = '#EBB0BC'; for (let j = 0; j < 5; j++) { const a = j / 5 * TAU; c.beginPath(); c.arc(xx + Det.cos(a) * 2.8, fy + Det.sin(a) * 2.8, 2.3, 0, TAU); c.fill(); } c.fillStyle = '#E2BD4E'; c.beginPath(); c.arc(xx, fy, 1.5, 0, TAU); c.fill(); }, fx);
    }
    v.ht = cv; v.htW = W2; v.htH = Hh; return cv;
  },
  bgHedge(c, W, H, P, hawk) {   // baked: far downs in blue-sage haze, hedgerow oaks on the field line, the verge with cow parsley; the sky is live
    this.hills(c, W, P.hedgeTop - 26, '#A9B9AC', 18, 3);
    const r = rng(5);
    for (let i = 0; i < W / 110 + 1; i++) { const x = r() * W, sz = 22 + r() * 24, y = P.hedgeTop - 14; c.fillStyle = '#7C8F80'; c.fillRect(x - 2, y - sz * 0.5, 4, sz * 0.5); for (let j = 0; j < 6; j++) this.leafBlob(c, x + (r() - 0.5) * sz * 0.9, y - sz * 0.7 + (r() - 0.5) * sz * 0.5, sz * 0.4, j % 2 ? '#8A9C88' : '#7F927E', r); }
    this.hills(c, W, P.hedgeTop - 2, hawk ? '#AFB083' : '#98AC84', 10, 5);
    const g = c.createLinearGradient(0, P.gy, 0, H); g.addColorStop(0, hawk ? '#B9AE66' : '#86A257'); g.addColorStop(1, hawk ? '#9E9452' : '#66843F'); c.fillStyle = g; c.fillRect(0, P.gy - 6, W, H - P.gy + 6);
    for (let i = 0; i < W / 3; i++) { c.strokeStyle = r() < 0.5 ? 'rgba(60,70,30,0.35)' : 'rgba(240,232,190,0.25)'; c.lineWidth = 1; const x = r() * W, y = P.gy + r() * (H - P.gy); c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 4, y - 6 - r() * 8); c.stroke(); }
    if (hawk) for (let i = 0; i < W / 30; i++) { const cx = r() * W, cy = P.gy + 16 + r() * (H - P.gy - 24), yel = r() < 0.7; for (let j = 0; j < 8; j++) { c.fillStyle = yel ? 'rgba(232,196,64,0.85)' : 'rgba(246,242,228,0.9)'; c.beginPath(); c.arc(cx + (r() - 0.5) * 40, cy + (r() - 0.5) * 14, 1.5 + r(), 0, TAU); c.fill(); } }   // buttercups and ox-eye daisies in the hay meadow
  },
  verge(c, W, H, P) {   // baked foreground: long grass and cow parsley along the hedge foot, in front of the hedge
    const r = rng(41), y = P.gy + 4;
    for (let x = 0; x < W; x += 3) { c.strokeStyle = r() < 0.5 ? 'rgba(74,98,48,0.9)' : 'rgba(110,138,70,0.9)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 8, y - 6 - r() * 14); c.stroke(); }
    for (let x = 4; x < W; x += 14 + r() * 16) {
      const hgt = 18 + r() * 26, lean = (r() - 0.5) * 8; c.strokeStyle = 'rgba(86,108,58,0.95)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + lean, y - hgt); c.stroke();
      c.fillStyle = 'rgba(246,242,228,0.95)'; for (let j = 0; j < 9; j++) { const a = Math.PI + j / 8 * Math.PI; c.beginPath(); c.arc(x + lean + Det.cos(a) * 6, y - hgt + 1 + Det.sin(a) * 3.5, 1.6, 0, TAU); c.fill(); }
    }
  },
  caterpillar(c, x, y, len, big, t, o) {   // a natural-paint caterpillar, looping as it walks; o: {alpha, rot, carry}
    o = o || {}; const n = big ? 7 : 5, r = len / (n * 1.55), body = big ? '#6E8B3D' : '#9AAF5C', dark = big ? '#4A6127' : '#6E8240', calm = typeof Fx !== 'undefined' && Fx.calm, ph = calm ? 0 : t * 6;
    c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.alpha != null) c.globalAlpha *= o.alpha;
    for (let i = n - 1; i >= 0; i--) { const fx = (i - (n - 1) / 2) * r * 1.45, fy = -Math.abs(Det.sin(ph + i * 0.6)) * r * 0.5; c.beginPath(); c.arc(fx, fy, r * (i === n - 1 ? 1.08 : 1), 0, TAU); c.fillStyle = i % 2 ? body : dark; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#1B1612'; c.stroke(); }
    const hx = (n - 1) / 2 * r * 1.45; c.fillStyle = '#1B1612'; c.beginPath(); c.arc(hx + r * 0.35, -r * 0.25, Math.max(1, r * 0.22), 0, TAU); c.fill();
    if (big) { c.strokeStyle = '#E8DFC9'; c.lineWidth = 1; c.beginPath(); c.moveTo(-hx, r * 0.15); c.lineTo(hx, r * 0.15); c.stroke(); }   // a pale side stripe: big ones read by size and stripe, not hue
    c.restore();
  },
  titDraw(c, x, y, size, o) { o = o || {}; if (typeof Rig !== 'undefined' && Rig.has && Rig.has('tit')) Rig.draw(c, 'tit', { stripe: o.stripe == null ? 0.6 : o.stripe, carry: !!o.carry }, x, y, { size, flip: !!o.flip, rot: o.rot || 0, alpha: o.alpha, halo: !!o.halo, state: o.idle ? 'idle' : undefined, t: this.v.t, id: o.id }); },
  chicks(c, P) {
    const s = this.sim.s, v = this.v, need = s.kind === 'hedge' ? 10 : 2.5, home = s.busy > 0 && s.carry ? (FG_T.trip - s.busy) / FG_T.trip : 0, gape = home > 0.45 && home < 0.72;
    for (let j = 0; j < 4; j++) {
      const p0 = this.chickXY(j), fed = Math.min(1, v.chick[j] / need), sq = v.squash[j] > 0 ? 1 - 0.1 * Det.sin(Math.PI * v.squash[j] / 0.18) : 1;
      let p = p0;
      if (v.fledge) {   // fed chicks hop to the rim and fly off (D4 §5.3); a chick that went short stays thin in the cup, then a ghost ring
        const f = Math.max(0, Math.min(1, (v.fledge.t - j * 0.12) / 1.1));
        if (fed >= 1) { if (f >= 1) continue; const hop = Math.min(1, f / 0.2), fl = Math.max(0, (f - 0.2) / 0.8); p = [p0[0] + fl * P.W * 0.45, p0[1] - hop * 10 - fl * P.H * 0.25 - 14 * Det.sin(Math.PI * fl)]; c.save(); c.globalAlpha *= 1 - fl * 0.6; if (fl > 0) { this.titDraw(c, p[0], p[1], Math.max(24, P.u * 0.06), { stripe: 0.4 }); c.restore(); continue; } c.restore(); }
        else if (f >= 1) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = '#E8DFC9'; c.beginPath(); c.arc(p0[0], p0[1], Math.max(12, P.u * 0.035), 0, TAU); c.stroke(); c.restore(); continue; }
      }
      if (typeof Rig !== 'undefined' && Rig.has('chick')) { c.save(); c.translate(p[0], p[1]); c.scale(1, sq); Rig.draw(c, 'chick', { fed, gape: gape || fed < 0.15 && (v.t % 2 < 1) }, 0, 0, { size: Math.max(27, P.u * 0.075) }); c.restore(); }
      const n = 5, x0 = p[0] - 2 * 5.5; for (let i = 0; i < n; i++) { c.beginPath(); c.arc(x0 + i * 5.5, p[1] - Math.max(27, P.u * 0.075) * 0.72, 2, 0, TAU); if (i < Math.round(fed * n)) { c.fillStyle = '#E8DFC9'; c.fill(); } else { c.lineWidth = 1; c.strokeStyle = 'rgba(232,223,201,0.5)'; c.stroke(); } }
    }
  },
  nestBox(c, P) {   // a nest box on a post, its front cut away to show the brood (a diorama)
    const b = P.box, x = P.nestX, y = P.nestY;
    c.fillStyle = '#6B4F33'; c.fillRect(x - b * 0.06, y + b * 0.35, b * 0.12, P.gy - y);
    c.fillStyle = '#8A6A47'; c.fillRect(x - b * 0.42, y - b * 0.3, b * 0.84, b * 0.68); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.strokeRect(x - b * 0.42, y - b * 0.3, b * 0.84, b * 0.68);
    c.fillStyle = '#5B412A'; c.beginPath(); c.moveTo(x - b * 0.5, y - b * 0.28); c.lineTo(x, y - b * 0.52); c.lineTo(x + b * 0.5, y - b * 0.28); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#2B2016'; c.fillRect(x - b * 0.34, y - b * 0.18, b * 0.68, b * 0.5);
    c.fillStyle = '#7A7148'; c.beginPath(); c.ellipse(x, y + b * 0.28, b * 0.32, b * 0.09, 0, 0, TAU); c.fill();   // moss cup
    c.fillStyle = '#1B1612'; c.beginPath(); c.arc(x + b * 0.42, y - b * 0.05, b * 0.07, 0, TAU); c.fill();     // the entrance hole on the side the tit comes in by
  },
  drawHedge(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), hawk = s.kind === 'hawk', L = this.content.labels;
    const hr = this.hour(), bg = this.bake(hawk ? 'hk' : 'hd', w, h, (cc, W, H) => this.bgHedge(cc, W, H, P, hawk));
    this.skyLive(c, P, P.hedgeTop - 10, hr);   // the sun is the day's clock
    c.drawImage(bg, 0, 0, w, h);
    if (hawk) this.drawHawkSky(c, P, false);
    this.mistLive(c, P, hr, P.hedgeTop - 30, P.hedgeTop + 10);
    const ht = this.hedgeTile(P), off = -((v.scroll % v.htW) + v.htW) % v.htW; c.drawImage(ht, off, P.hedgeTop - 22, v.htW, v.htH); c.drawImage(ht, off + v.htW, P.hedgeTop - 22, v.htW, v.htH);
    c.drawImage(this.bake('vg', w, h, (cc, W, H) => this.verge(cc, W, H, P)), 0, 0, w, h);
    this.castLive(c, P, hr, P.hedgeTop - 40);
    this.mistLive(c, P, hr, P.hedgeBot - 40, h - 10);
    if (hawk) this.drawHawkSky(c, P, true);
    this.nestBox(c, P); this.chicks(c, P);
    c.strokeStyle = '#5B412A'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(P.titX - P.hero * 0.9, P.titY + P.hero * 0.42); c.quadraticCurveTo(P.titX, P.titY + P.hero * 0.24, P.titX + P.hero * 0.55, P.titY + P.hero * 0.3); c.stroke();   // the perch twig
    // the prey in view (a draining ring in timed play), and prey slipping away
    const p = this.preyXY();
    if (p) { const pr = s.prey, len = (pr.big ? 0.13 : 0.075) * P.u * (hawk ? 1.1 : 1), k = Math.min(1, pr.t / 0.12); if (!pr.field) { c.fillStyle = '#A7BE72'; c.beginPath(); c.ellipse(p[0] - len * 0.05, p[1] + len * 0.18, len * 0.75 * k, len * 0.3 * k, -0.15, 0, TAU); c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#3F5A2E'; c.stroke(); } else { c.fillStyle = 'rgba(27,22,18,0.18)'; c.beginPath(); c.ellipse(p[0], p[1] + len * 0.25, len * 0.7 * k, len * 0.18 * k, 0, 0, TAU); c.fill(); } this.caterpillar(c, p[0], p[1], len * k, pr.big || hawk, v.t, {}); if (!s.unt && !pr.wait) { c.beginPath(); c.arc(p[0], p[1], Math.max(24, len * 0.75), -Math.PI / 2, -Math.PI / 2 + TAU * Math.max(0, 1 - pr.t / FG_T.vis)); c.lineWidth = 2.5; c.strokeStyle = 'rgba(232,223,201,0.85)'; c.stroke(); } if (pr.field) Lbl.put('fg-field', L.field, p[0], p[1] + Math.max(26, len * 0.8), { size: 12, c }); }
    if (s.busy > 0 && s.carry && (FG_T.trip - s.busy) / FG_T.trip < 0.15 && v.carryXY) this.caterpillar(c, v.carryXY[0], v.carryXY[1], (s.carry.big || hawk ? 0.13 : 0.075) * P.u * (hawk ? 1.1 : 1), s.carry.big || hawk, v.t, {});
    for (const a of v.anims) if (a.k === 'hide') { const f = a.t / a.d; this.caterpillar(c, a.x, a.y + f * 10, (a.big || hawk ? 0.13 : 0.075) * P.u * (1 - f), a.big || hawk, v.t, { alpha: 1 - f }); }
    // the tit, on its perch or along the trip
    const tp = this.titXY(), flying = s.busy > 0, k = flying ? (FG_T.trip - s.busy) / FG_T.trip : 0;
    if (flying && s.carry && k < 0.15 && !v.carryXY0) v.carryXY0 = 1; if (!flying) v.carryXY0 = 0;
    if (s.prey) v.carryXY = p;
    const hop = !flying && s.phase === 'run' && !s.prey ? Math.abs(Det.sin(v.scroll * 0.35)) * 6 : 0, gone = s.dead && !flying;
    if (!gone) {
      if (flying && typeof Fx !== 'undefined' && !Fx.calm) for (let j = 1; j <= 2; j++) { c.save(); c.globalAlpha = 0.18 / j; this.titDraw(c, tp[0] - (k < 0.62 ? -1 : 1) * j * 9, tp[1] + j * 2, P.hero * 0.95, { flip: k >= 0.15 && k < 0.72 ? true : false }); c.restore(); }
      this.titDraw(c, tp[0], tp[1] - hop, P.hero, { carry: flying && k > 0.12 && k < 0.66, flip: flying && k >= 0.15 && k < 0.72, idle: !flying, rot: flying ? -0.12 : 0, stripe: s.mate ? 0.15 : 0.6 });   // the mate, a female, wears a narrower breast stripe
      if (s.mate && !flying && typeof Lbl !== 'undefined') Lbl.put('fg-mate', L.mate, tp[0], tp[1] - P.hero * 0.7, { size: 12, c });
    }
    for (const a of v.anims) if (a.k === 'arc') { const f = Math.min(1, a.t / a.d), e = f * f * (3 - 2 * f); this.caterpillar(c, a.x0 + (a.x1 - a.x0) * e, a.y0 + (a.y1 - a.y0) * e - 20 * Det.sin(Math.PI * f), (a.big ? 0.09 : 0.05) * P.u, a.big, v.t, { alpha: 1 - 0.3 * f }); }
    if (v.dive) this.drawStoop(c, P);
    this.insects(c, P, P.hedgeTop - 30, P.hedgeTop + 50, hawk ? 4 : 6, hr);
    if (v.ghostR) { c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = '#E8DFC9'; c.beginPath(); c.arc(v.ghostR.x, v.ghostR.y, P.hero * 0.45, 0, TAU); c.stroke(); c.restore(); }
    if (!hawk) this.drawLedger(c, P);
    if (hawk) { Lbl.put('fg-hedgeL', L.hedge, w * 0.82, P.hedgeTop + 18, { size: 13, c }); Lbl.put('fg-fieldL', L.field, w * 0.82, P.gy + 16, { size: 13, c }); Lbl.put('fg-xn', L.xnRisk, 12, h - 14, { align: 'left', size: 12, c }); }
    if (s.phase === 'gap' || s.phase === 'ask') { c.fillStyle = 'rgba(20,28,26,0.18)'; c.fillRect(0, 0, w, h); }
  },
  dayFrac() { const s = this.sim.s, rd = this.sim.cfg(this.kd()).rd; let tot = 0, done = 0; rd.forEach((r, i) => { const S = r.S > 1e8 ? 30 : r.S || 30; tot += S; if (i < s.i) done += S; else if (i === s.i) done += Math.min(S, s.sun); }); return tot ? Math.max(0, Math.min(1, done / tot)) : 0; },
  drawLedger(c, P) {   // the take-or-pass record in the scene: big row and small row, filled taken, hollow passed (rung 1)
    const v = this.v, L = v.ledger.slice(-Math.floor((P.W - 70) / 9)), y0 = P.H - 22, r = 3.6; let x = 60, lastI = L.length ? L[0].i : 0;
    if (typeof Lbl !== 'undefined') { Lbl.put('fg-lbig', this.content.labels.big, 30, y0 - 9, { size: 12, c: Stage.ctx, pill: false, ink: '#1B1612' }); Lbl.put('fg-lsmall', this.content.labels.small, 30, y0 + 7, { size: 12, c: Stage.ctx, pill: false, ink: '#1B1612' }); }
    for (const q of L) { if (q.i !== lastI) { x += 8; lastI = q.i; } const yy = q.big ? y0 - 9 : y0 + 7, c0 = c; c0.beginPath(); c0.arc(x, yy, q.big ? r * 1.3 : r, 0, TAU); if (q.took) { c0.fillStyle = '#1B1612'; c0.fill(); } else { c0.lineWidth = 1.4; c0.strokeStyle = '#1B1612'; c0.stroke(); } x += 9; }
  },
  hawkShape(c, x, y, s, rot, alpha, fold, ink) {   // a sparrowhawk from below: short, broad, rounded wings, a long square-tipped barred tail; fold tucks the wings for a stoop
    c.save(); c.translate(x, y); c.rotate(rot || 0); c.globalAlpha *= alpha == null ? 1 : alpha; c.fillStyle = ink || '#3A3029';
    const ws = s * (1 - 0.6 * (fold || 0)), fl = fold ? 0 : 0.06 * s * Det.sin(this.v.t * 9);
    c.beginPath(); c.moveTo(-s * 0.07, s * 0.08); c.lineTo(-s * 0.1, s * 0.6); c.lineTo(s * 0.1, s * 0.6); c.lineTo(s * 0.07, s * 0.08); c.closePath(); c.fill();   // the long, square-tipped tail
    for (const g of [-1, 1]) {   // a broad wing: straight leading edge to the wrist, a rounded hand, a full trailing edge
      c.beginPath(); c.moveTo(g * s * 0.06, -s * 0.14); c.lineTo(g * ws * 0.55, -s * 0.15 - fl * 0.5); c.quadraticCurveTo(g * ws * 0.92, -s * 0.13 - fl, g * ws, -s * 0.02 - fl);
      c.quadraticCurveTo(g * ws * 0.98, s * 0.1 - fl * 0.5, g * ws * 0.7, s * 0.14); c.quadraticCurveTo(g * ws * 0.35, s * 0.17, g * s * 0.06, s * 0.1); c.closePath(); c.fill();
    }
    c.beginPath(); c.ellipse(0, -s * 0.04, s * 0.085, s * 0.19, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -s * 0.24, s * 0.07, 0, TAU); c.fill();
    if (!ink) { c.strokeStyle = 'rgba(232,223,201,0.4)'; c.lineWidth = Math.max(1, s * 0.03); for (const k of [0.34, 0.44, 0.54]) { c.beginPath(); c.moveTo(-s * 0.09, s * k); c.lineTo(s * 0.09, s * k); c.stroke(); } }   // tail bars
    c.restore();
  },
  hawkPath(P) {   // where the hunting hawk circles (and where a stoop starts): a slow loop over the field
    const a = typeof Fx !== 'undefined' && Fx.calm ? 0 : this.v.t * 0.7; return { x: P.W * 0.6 + Det.cos(a) * P.W * 0.22, y: P.top + 44 + Det.sin(a) * 16, a };
  },
  drawHawkSky(c, P, ground) {   // the sparrowhawk: a rare pass in the first round, circling overhead while it hunts; its shadow sweeps the field and hedge
    const s = this.sim.s, v = this.v, hunting = s.i === 1 && s.lever !== 'nohawk' && s.phase !== 'gap', t = v.t, sz = Math.max(30, P.u * 0.1);
    if (v.dive) return;
    let x, y, a = 0, k = 1;
    if (hunting) { const H = this.hawkPath(P); x = H.x; y = H.y; a = H.a; }
    else if ((t % 11) < 3.2) { const f = (t % 11) / 3.2; x = P.W * (1.15 - 1.3 * f); y = P.top + 30 + 10 * f; k = 0.45; a = Math.PI; } else return;
    if (ground) { const gx = x + 30, gy = P.gy + (P.H - P.gy) * (0.25 + 0.15 * Det.sin(a)); c.save(); c.translate(gx, gy); c.scale(1, 0.45); this.hawkShape(c, 0, 0, sz * k * 1.1, Det.cos(a) * 0.15, 0.22, 0, '#141A10'); c.restore(); return; }
    this.hawkShape(c, x, y, sz * k, Det.cos(a) * 0.15, k < 1 ? 0.7 : 1);
  },
  drawStoop(c, P) {   // the stoop: wings tucked, straight at the tit (350 ms); then away, wings open, with or without it
    const v = this.v, d = v.dive, f = Math.min(1, d.t / 0.35), H = d.from || (d.from = this.hawkPath(P)), x = H.x + (d.x - H.x) * f * f, y = H.y + (d.y - H.y) * f * f, sz = Math.max(26, P.u * 0.09);
    if (d.t < 0.35) { this.hawkShape(c, x, y, sz, Math.max(-0.6, Math.min(0.6, (d.x - H.x) / P.W * 1.4)), 1, 0.9); return; }
    const g = Math.min(1, (d.t - 0.35) / 0.5); this.hawkShape(c, d.x + g * P.W * 0.4, d.y - g * P.H * 0.4, sz, -0.5, 1 - g * 0.5, 0.3 * (1 - g));
  },
  tree(c, x, y, size, picked, seed) {   // an apple tree after blossom: two baked versions per tree (fresh, picked over), crossfaded as it is picked
    const v = this.v, d = (typeof Stage !== 'undefined' && Stage.dpr) || 1, k = Math.max(0, Math.min(1, picked / 0.6));
    const get = pk => { const key = seed + '|' + Math.round(size) + '|' + pk; v.tc = v.tc || {}; let cv = v.tc[key]; if (cv) return cv; if (Object.keys(v.tc).length > 24) v.tc = {};
      const S = Math.ceil(size * 1.1), Hh = Math.ceil(size * 1.05); cv = mkCanvas(Math.ceil(S * d), Math.ceil(Hh * d)); const g = cv.getContext('2d'); g.scale(d, d); this.treePaint(g, S / 2, Hh - 4, size, pk ? 0.6 : 0, seed); cv.ox = S / 2; cv.oy = Hh - 4; cv.cw = S; cv.ch = Hh; return (v.tc[key] = cv); };
    c.fillStyle = 'rgba(30,40,20,0.22)'; c.beginPath(); c.ellipse(x, y + 2, size * 0.42, size * 0.06, 0, 0, TAU); c.fill();
    const a = get(0); c.drawImage(a, x - a.ox, y - a.oy, a.cw, a.ch);
    if (k > 0.02) { const p = get(1); c.save(); c.globalAlpha *= k; c.drawImage(p, x - p.ox, y - p.oy, p.cw, p.ch); c.restore(); }
  },
  treePaint(c, x, y, size, picked, seed) {   // gnarled trunk, shadowed and sunlit sage canopy, green fruitlets
    const r = rng(seed); c.fillStyle = '#5E4630'; c.lineWidth = 1.5; c.strokeStyle = '#1B1612';
    c.beginPath(); c.moveTo(x - size * 0.06, y); c.quadraticCurveTo(x - size * 0.01, y - size * 0.2, x - size * 0.05, y - size * 0.44); c.lineTo(x + size * 0.02, y - size * 0.46); c.quadraticCurveTo(x + size * 0.03, y - size * 0.22, x + size * 0.06, y); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#5E4630'; c.lineCap = 'round'; c.lineWidth = Math.max(2, size * 0.028); c.beginPath(); c.moveTo(x - size * 0.02, y - size * 0.38); c.lineTo(x - size * 0.22, y - size * 0.56); c.moveTo(x, y - size * 0.4); c.lineTo(x + size * 0.2, y - size * 0.6); c.stroke();
    const layer = (n, cols, dy, sc, pale) => { for (let i = 0; i < n; i++) { const a = r() * TAU, rr = Math.sqrt(r()), px = x + Det.cos(a) * size * 0.4 * rr, py = y - size * 0.62 + dy * size + Det.sin(a) * size * 0.26 * rr, q = size * sc * (0.85 + 0.4 * r()), col = pale && r() < picked ? '#A7A672' : cols[(r() * cols.length) | 0]; this.leafBlob(c, px, py, q, col, r); } };
    layer(14, ['#3F5F33', '#45683A', '#3A5A30'], 0.05, 0.14, false);
    layer(16, ['#56793F', '#5F8446', '#527440'], 0, 0.13, true);
    layer(9, ['#7F9F5E', '#8DAC68', '#9BB874'], -0.08, 0.1, true);
    for (let i = 0; i < 7; i++) { const a = r() * TAU, rr = Math.sqrt(r()); c.fillStyle = '#B8C46A'; c.beginPath(); c.arc(x + Det.cos(a) * size * 0.34 * rr, y - size * 0.58 + Det.sin(a) * size * 0.22 * rr, Math.max(2, size * 0.018), 0, TAU); c.fill(); }
  },
  bgOrchard(c, W, H, P, eve) {   // baked: far downs, a hedgerow line, the orchard grass with buttercups and daisies; the sky is live
    const hy = P.gy - P.tree * 0.5; this.hills(c, W, hy, eve ? '#8E8C9A' : '#A8BBAA', 22, 7);
    const r = rng(23); for (let x = -10; x < W + 10; x += 14) this.leafBlob(c, x, hy + 22 + r() * 6, 16 + r() * 8, r() < 0.5 ? '#6F8668' : '#7A9073', r);
    c.fillStyle = eve ? '#6E7A4C' : '#89A65A'; c.fillRect(0, hy + 26, W, P.gy - hy - 26);
    const g = c.createLinearGradient(0, P.gy, 0, H); g.addColorStop(0, eve ? '#6F7A4C' : '#8DAA5C'); g.addColorStop(1, eve ? '#56603A' : '#6E8C45'); c.fillStyle = g; c.fillRect(0, P.gy, W, H - P.gy);
    for (let i = 0; i < W / 40; i++) { const cx = r() * W, cy = P.gy + 8 + r() * (H - P.gy - 12), yel = r() < 0.6; for (let j = 0; j < 7; j++) { c.fillStyle = yel ? 'rgba(232,196,64,0.85)' : 'rgba(246,242,228,0.9)'; c.beginPath(); c.arc(cx + (r() - 0.5) * 30, cy + (r() - 0.5) * 10, 1.3 + r() * 0.7, 0, TAU); c.fill(); } }   // buttercups and daisies in drifts
  },
  slotXY(P, x, size, k, tree) {   // where caterpillar k of a tree hangs on its silk thread under the canopy
    const G = this.sim.P().G.v, a = this.hash('s' + tree + ':' + k), ang = 0.4 + 2.35 * ((k * 0.618 + (a % 100) / 400) % 1), rr = 0.55 + ((a >>> 9) % 40) / 100, len = 8 + ((a >>> 15) % 14); void G;
    return [x + Det.cos(Math.PI - ang) * size * 0.4 * rr, P.treeY - size * 0.62 + Det.sin(ang) * size * 0.22 * rr + len * 0.6, len];
  },
  treePrey(c, P, x, size, tree, left) {   // the tree's caterpillars, hanging on silk; slot k shows while the expected catch still to come exceeds k (view only, from the gain curve)
    const G = this.sim.P().G.v, calm = typeof Fx !== 'undefined' && Fx.calm;
    for (let k = 0; k < G; k++) {
      const al = Math.max(0, Math.min(1, left - k)); if (al <= 0.02) continue; const [px, py, len] = this.slotXY(P, x, size, k, tree), sw = calm ? 0 : Det.sin(this.v.t * 1.6 + k) * 2;
      c.save(); c.globalAlpha *= al; c.strokeStyle = 'rgba(240,236,220,0.7)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(px, py - len); c.lineTo(px + sw, py); c.stroke();
      this.caterpillar(c, px + sw, py + 3, Math.max(12, P.u * 0.04), false, this.v.t + k, { rot: Math.PI / 2 }); c.restore();
    }
  },
  drawOrchard(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), eve = false, r = this.sim.cfg(s.kd).rd[Math.min(s.i, this.sim.cfg(s.kd).rd.length - 1)], L = this.content.labels, hr = this.hour(), tau = this.sim.P().tau.v, G = this.sim.P().G.v;
    const bg = this.bake(eve ? 'ev' : 'or', w, h, (cc, W, H) => this.bgOrchard(cc, W, H, P, eve));
    this.skyLive(c, P, P.gy - P.tree * 0.5, hr); c.drawImage(bg, 0, 0, w, h);
    // the camera: in flight it pans from this tree to the next (distance ∝ flight time)
    const fl = s.phase === 'fly' ? 1 - s.flyN / s.flyTot : 0, gap = P.tree * 1.0 + (r.T > 5 ? w * 0.9 : r.T > 3 ? w * 0.25 : 0), pan = fl * gap;
    const now = s.phase === 'tree' ? s.tt * this.sim.dt : (v.lastStay == null ? 6 : v.lastStay), left = t => G * Det.exp(-t / tau), picked = Math.min(0.6, now / 14);
    c.save(); c.translate(-pan, 0);
    const prevT = s.tree - 1, prevS = s.phase === 'fly' ? v.prevStay : v.lastStay;
    this.tree(c, P.treeX - gap, P.treeY, P.tree * 0.9, 0.85, prevT * 7 + 11);
    this.tree(c, P.treeX, P.treeY, P.tree, picked, s.tree * 7 + 11);
    this.tree(c, P.treeX + gap, P.treeY, P.tree, 0, (s.tree + 1) * 7 + 11);
    this.castLive(c, { W: w + pan + gap, H: h }, hr, 0);
    this.treePrey(c, P, P.treeX - gap, P.tree * 0.9, prevT, left(prevS == null ? 6 : prevS));
    this.treePrey(c, P, P.treeX, P.tree, s.tree, left(now));
    this.treePrey(c, P, P.treeX + gap, P.tree, s.tree + 1, G);
    c.restore();
    // the tit: in the canopy, hopping to each catch; in flight between trees
    let tx = P.titX, ty = P.titY;
    if (s.phase === 'tree' && v.cpos && s.tt > 0) { tx = v.cpos[0]; ty = v.cpos[1] - 6; }
    if (s.phase === 'fly') { tx = w * 0.42; ty = P.treeY - P.tree * 0.75 - 30 * Det.sin(Math.PI * fl); }
    this.titDraw(c, tx, ty, P.hero * 0.9, { idle: s.phase === 'tree', rot: s.phase === 'fly' ? -0.1 : 0 });
    this.insects(c, P, P.gy - P.tree * 0.95, P.gy - P.tree * 0.35, 5, hr);
    if (s.phase === 'fly') Lbl.put('fg-travel', Txt.f(L.travel, { t: r.T }), w * 0.42, ty - P.hero * 0.7, { size: 13, c, mono: true });
    if (r.T > 5 && s.phase === 'tree') { Lbl.put('fg-far', Txt.f(L.travel, { t: r.T }), w - 14, P.treeY - P.tree * 0.5, { align: 'right', size: 13, c, mono: true }); c.fillStyle = '#E8DFC9'; c.beginPath(); c.moveTo(w - 10, P.treeY - P.tree * 0.35); c.lineTo(w - 22, P.treeY - P.tree * 0.35 - 8); c.lineTo(w - 22, P.treeY - P.tree * 0.35 + 8); c.closePath(); c.fill(); }
    this.drawGainCard(c, P);
    if (s.phase === 'ask' || s.phase === 'gap') { c.fillStyle = 'rgba(20,28,26,0.18)'; c.fillRect(0, 0, w, h); }
  },
  drawGainCard(c, P) {   // the gain curve drawing itself in the scene: this tree's catches against time, past trees faint, your leaving points
    const s = this.sim.s, v = this.v, r = this.sim.cfg(s.kd).rd[Math.min(s.i, this.sim.cfg(s.kd).rd.length - 1)], T = r.T, cw = Math.min(P.W * 0.46, 230), ch = Math.min(130, (P.gy - P.top) * 0.36), x0 = P.W - cw - 10, y0 = P.top + 8;
    c.save(); c.fillStyle = 'rgba(232,223,201,0.92)'; rrect(c, x0, y0, cw, ch, 8); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,0.4)'; c.stroke();
    const px = x0 + 12, pw = cw - 20, py = y0 + 8, ph = ch - 22, tmin = -T, tmax = FG_AX, X = t => px + (t - tmin) / (tmax - tmin) * pw, Y = g => py + ph - g / 7 * ph;
    c.strokeStyle = 'rgba(27,22,18,0.55)'; c.beginPath(); c.moveTo(X(0), py); c.lineTo(X(0), py + ph); c.lineTo(px + pw, py + ph); c.stroke();
    c.setLineDash([2, 3]); c.beginPath(); c.moveTo(X(-T), py + ph - 30); c.lineTo(X(-T), py + ph); c.stroke(); c.setLineDash([]);
    const asked = this.asked(s.i);
    if (asked) { c.lineWidth = 2; c.setLineDash([5, 3]); c.strokeStyle = '#1B1612'; c.beginPath(); for (let t = 0; t <= FG_AX; t += 0.25) { const g = this.sim.gainAt(t); if (t === 0) c.moveTo(X(t), Y(g)); else c.lineTo(X(t), Y(g)); } c.stroke();
      const ts = this.sim.tStar(T), gs = this.sim.gainAt(ts), k = v.tan ? v.tan.k : 1; c.beginPath(); c.moveTo(X(-T), Y(0)); c.lineTo(X(-T) + (X(ts) - X(-T)) * k, Y(0) + (Y(gs) - Y(0)) * k); c.stroke(); c.setLineDash([]); if (k >= 1) { c.beginPath(); c.arc(X(ts), Y(gs), 4, 0, TAU); c.lineWidth = 1.5; c.stroke(); } }
    for (const d of s.deps.filter(q => q.round === s.i)) { c.fillStyle = '#1B1612'; c.beginPath(); c.arc(X(d.stay), Y(d.got), 3, 0, TAU); c.fill(); }
    const stair = (ct, end, lw, a) => { c.save(); c.globalAlpha *= a; c.lineWidth = lw; c.strokeStyle = '#1B1612'; c.beginPath(); c.moveTo(X(0), Y(0)); let g = 0; for (const t of ct) { if (t > FG_AX) break; c.lineTo(X(t), Y(g)); g++; c.lineTo(X(t), Y(g)); } c.lineTo(X(Math.min(end, FG_AX)), Y(g)); c.stroke(); c.restore(); return g; };
    for (const q of (v.past || []).filter(q => q.round === s.i)) stair(q.ct, q.stay, 1.5, 0.3);
    if (s.phase === 'tree') { const now = s.tt * this.sim.dt, g = stair(v.ct || [], now, 3, 1); c.beginPath(); c.arc(X(Math.min(now, FG_AX)), Y(g), 3.5, 0, TAU); c.fillStyle = '#1B1612'; c.fill(); }
    c.restore();
    if (typeof Lbl !== 'undefined') { Lbl.put('fg-gc', this.content.labels.gainC, X(0) + 6, y0 + 12, { size: 12, c, pill: false, ink: '#1B1612', align: 'left' }); }
  },
  drawNight(c, w, h) {
    const s = this.sim.s, v = this.v, P = this.pos(), L = this.content.labels, calm = typeof Fx !== 'undefined' && Fx.calm;
    const bg = this.bake('nt', w, h, (cc, W, H) => { this.sky(cc, W, H, 0, P.gy, 4); this.hills(cc, W, P.gy - 34, '#7A7090', 22, 13); { const r0 = rng(31); for (let x = -8; x < W + 8; x += 9) { cc.strokeStyle = '#3A3245'; cc.lineWidth = 1.2; cc.beginPath(); cc.moveTo(x, P.gy); cc.lineTo(x + (r0() - 0.5) * 10, P.gy - 14 - r0() * 16); cc.stroke(); } cc.fillStyle = '#3A3245'; cc.fillRect(0, P.gy - 12, W, 12); }   /* a bare winter hedge on the skyline */ cc.fillStyle = '#E4E8EC'; cc.fillRect(0, P.gy, W, H - P.gy); const r = rng(21); for (let i = 0; i < W / 4; i++) { cc.fillStyle = 'rgba(160,172,190,0.4)'; cc.beginPath(); cc.arc(r() * W, P.gy + r() * (H - P.gy), 1 + r() * 2, 0, TAU); cc.fill(); }
      cc.strokeStyle = '#3E3428'; cc.lineWidth = 6; cc.beginPath(); cc.moveTo(0, P.top + (P.gy - P.top) * 0.22); cc.quadraticCurveTo(W * 0.4, P.top + (P.gy - P.top) * 0.3, W * 0.78, P.top + (P.gy - P.top) * 0.18); cc.stroke(); });
    c.drawImage(bg, 0, 0, w, h);
    const sunK = Math.min(1, (10 - s.v) / 10), sy = P.top + 30 + (P.gy - P.top - 30) * sunK; c.save(); c.beginPath(); c.rect(0, 0, w, P.gy - 34); c.clip(); c.fillStyle = '#F2B57A'; c.beginPath(); c.arc(w * 0.1, sy, Math.max(12, P.u * 0.035), 0, TAU); c.fill(); c.restore();   // the sun sinks with each visit
    if (!calm) { c.fillStyle = 'rgba(240,244,248,0.85)'; for (let i = 0; i < 40; i++) { const x = (i * 97 + v.t * (8 + i % 5)) % w, y = (i * 61 + v.t * (22 + i % 7)) % P.gy; c.beginPath(); c.arc(x, y, 1.3 + (i % 3) * 0.5, 0, TAU); c.fill(); } }
    // the two feeders: a seed tray on a post (steady) and a hanging seed bell (lucky)
    const fs = Math.max(40, P.u * 0.13);
    c.fillStyle = '#6B4F33'; c.fillRect(P.fx[0] - 3, P.fy, 6, P.gy - P.fy); c.fillStyle = '#8A6A47'; c.fillRect(P.fx[0] - fs * 0.5, P.fy - 6, fs, 10); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.strokeRect(P.fx[0] - fs * 0.5, P.fy - 6, fs, 10);
    for (let i = 0; i < 6; i++) { c.fillStyle = '#C9A24A'; c.beginPath(); c.arc(P.fx[0] - fs * 0.35 + i * fs * 0.14, P.fy - 8, 2.4, 0, TAU); c.fill(); }
    c.strokeStyle = '#3E3428'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(P.fx[1], P.top + (P.gy - P.top) * 0.24); c.lineTo(P.fx[1], P.fy - fs * 0.5); c.stroke();
    c.fillStyle = '#B48E52'; c.beginPath(); c.ellipse(P.fx[1], P.fy - fs * 0.15, fs * 0.32, fs * 0.42, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = 'rgba(27,22,18,0.25)'; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(P.fx[1] + ((i % 3) - 1) * fs * 0.15, P.fy - fs * 0.3 + Math.floor(i / 3) * fs * 0.15, 2, 0, TAU); c.fill(); }
    Lbl.put('fg-steady', L.steady, P.fx[0], P.fy + 22, { size: 14, c, weight: 700 }); Lbl.put('fg-steadyG', L.steadyG, P.fx[0], P.fy + 44, { size: 12, c, mono: true });
    Lbl.put('fg-lucky', L.lucky, P.fx[1], P.fy + fs * 0.42, { size: 14, c, weight: 700 }); Lbl.put('fg-luckyG', L.luckyG, P.fx[1], P.fy + fs * 0.42 + 22, { size: 12, c, mono: true });
    // the tit: on the branch, or flying to a feeder and back
    let tx = P.titX, ty = P.titY; const fl = v.fly && s.cd > 0 ? 1 - s.cd / Math.round(FG_T.feedT / this.sim.dt) : -1;
    if (fl >= 0 && v.fly) { const fx = P.fx[v.fly.a], fy = P.fy - (v.fly.a ? fs * 0.6 : 20), f = fl < 0.5 ? fl / 0.5 : (1 - fl) / 0.5; tx = P.titX + (fx - P.titX) * f; ty = P.titY + (fy - P.titY) * f - 16 * Det.sin(Math.PI * f); }
    if (!v.ghostR) this.titDraw(c, tx, ty, P.hero, { idle: fl < 0, flip: fl >= 0 && v.fly && P.fx[v.fly.a] < P.titX && fl < 0.5, stripe: 0.6 });
    if (v.ghostR) { c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = '#E8DFC9'; c.beginPath(); c.arc(P.titX, P.titY, P.hero * 0.45, 0, TAU); c.stroke(); c.restore(); }
    for (const q of v.seeds) { if (q.t < 0) continue; const f = Math.min(1, q.t / q.d), e = f * f; c.fillStyle = '#C9A24A'; c.beginPath(); c.arc(q.x0 + (q.x1 - q.x0) * e, q.y0 + (q.y1 - q.y0) * e - 40 * Det.sin(Math.PI * f), 3, 0, TAU); c.fill(); }
    this.drawGauge(c, P);
    if (v.night > 0) { c.fillStyle = 'rgba(8,12,30,' + (0.72 * v.night).toFixed(3) + ')'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(236,236,220,' + v.night.toFixed(3) + ')'; c.beginPath(); c.arc(w * (0.3 + 0.3 * Math.min(1, s.t / FG_T.nightT)), P.top + 50, Math.max(10, P.u * 0.03), 0, TAU); c.fill(); this.drawGauge(c, P); }
    for (let i = 0; i < 10; i++) { c.beginPath(); c.arc(P.gx - 20 - (9 - i) * 12, P.gBot + 18, 4, 0, TAU); if (i < s.v) { c.fillStyle = '#E8DFC9'; c.fill(); } c.lineWidth = 1.2; c.strokeStyle = '#1B1612'; c.stroke(); }
  },
  drawGauge(c, P) {   // the fat reserve: seeds in, the night line, and at night the burn down to dawn
    const s = this.sim.s, v = this.v, gw = Math.max(26, P.u * 0.06), x = P.gx - gw / 2;
    const e = s.phase === 'night' ? s.e - s.need * Math.min(1, s.t / FG_T.nightT) : s.e;
    c.fillStyle = 'rgba(232,223,201,0.85)'; c.fillRect(x, P.gTop, gw, P.gBot - P.gTop); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.strokeRect(x, P.gTop, gw, P.gBot - P.gTop);
    const yE = P.gaugeY(Math.max(0, e)); c.fillStyle = '#C9A24A'; c.fillRect(x + 2, yE, gw - 4, P.gBot - yE);
    const yN = s.phase === 'night' ? P.gaugeY(0) : P.gaugeY(s.need); c.setLineDash([5, 3]); c.lineWidth = 2; c.beginPath(); c.moveTo(x - 8, yN); c.lineTo(x + gw + 4, yN); c.stroke(); c.setLineDash([]);
    if (typeof Lbl !== 'undefined') { Lbl.put('fg-line', this.content.labels.night, x - 10, yN, { align: 'right', size: 12, c }); Lbl.put('fg-res', s.phase === 'night' ? String(Math.max(0, Math.round(e))) : Txt.f(this.content.labels.nRes, { e: s.e, need: s.need }), P.gx, P.gTop - 14, { size: 13, c, mono: true }); }
    void v;
  },

  /* ---------- the live strip (notes() is the LiveGraph data provider) ---------- */
  notes() {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    const D = this.content.data, sim = this.sim, n = this.kd(), stats = [];
    const row = (d, vars) => stats.push([d[0], Txt.f(d[1], vars), d[2] ? Txt.f(d[2], vars) : '']);
    if (n === 0) { row(D.food, { n: s.food }); s.rec.forEach(r => row(D.small, { a: r.takeS, b: r.seenS })); return { stats, charts: [this.dietSpec(), this.profSpec()] }; }
    if (n === 1) { row(D.eaten, { n: s.eat }); row(D.stays, { a: sim.meanStay(s, 0).toFixed(1), b: sim.meanStay(s, 1).toFixed(1) }); return { stats, charts: [this.gainSpec(), this.rateSpec()] }; }
    if (n === 2) { row(D.food, { n: s.food }); s.rec.forEach(r => row(D.fieldT, { a: r.takeF, b: r.seenF })); return { stats, charts: [this.riskSpec(), this.roundSpec()] }; }
    row(D.reserve, { e: s.e, need: s.need, v: s.v }); row(D.right, { r: Math.round(100 * (s.reg || 0)) });
    return { stats, charts: [this.resSpec(), this.oddsSpec()] };
  },
  dietSpec() {   // food a second against big ones a minute: your stretches as dots; the two long-run lines only after you predict
    const s = this.sim.s, D = this.content.data, sim = this.sim, lines = [], dots = [];
    const curve = (fn, lab) => { const pts = []; for (let b = 0; b <= 48; b += 2) pts.push([b, fn(b / 60)]); lines.push({ pts, dash: true, label: lab }); };
    curve(b => sim.dietRates(b, 0.5).big, D.lines.bigOnly); curve(b => sim.dietRates(b, 0.5).all, D.lines.takeAll);   // the key result in plain sight (D6 decision 9): the lines cross at 15 big ones a minute
    if (s.hits.a2 !== undefined) curve(b => sim.dietRates(b, 1.5).all, D.lines.swarm);
    s.rec.forEach((r, i) => { if (r.sun > 0) dots.push({ x: 60 * sim.cfg(0).rd[i].b + (i === 2 ? 1.5 : 0), y: r.food / r.sun, shape: i === 2 ? 'square' : 'disc' }); });
    return { type: 'fg_xy', title: D.titles.diet, x: { lo: 0, hi: 48, label: D.ax.big }, y: { lo: 0, hi: 1.2, label: D.ax.rate }, frame: 'designed', lines, dots, dotLabel: dots.length ? D.lines.yours : null };
  },
  gainSpec() {   // catches against seconds in a tree, from minus the flight time; the expected curve and the tangent only after you predict
    const s = this.sim.s, D = this.content.data, sim = this.sim, v = this.v, ri = Math.min(s.i, sim.cfg(s.kd).rd.length - 1), T = sim.cfg(s.kd).rd[ri].T, lines = [], steps = [], dots = [];
    const asked = this.asked(ri);
    if (asked) { const pts = []; for (let t = 0; t <= FG_AX; t += 0.5) pts.push([t, sim.gainAt(t)]); lines.push({ pts, dash: true, label: D.lines.curve }); }
    for (const d of s.deps.filter(q => q.round === ri)) dots.push({ x: d.stay, y: d.got, shape: 'disc' });
    const stair = (ct, end) => { const pts = [[0, 0]]; let g = 0; for (const t of ct) { if (t > FG_AX) break; pts.push([t, g]); g++; pts.push([t, g]); } pts.push([Math.min(FG_AX, end), g]); return pts; };
    if (v) for (const q of (v.past || []).filter(q => q.round === ri)) steps.push({ pts: stair(q.ct, q.stay), w: 1, faint: true });
    if (s.phase === 'tree') steps.push({ pts: stair((v && v.ct) || [], s.tt * sim.dt), w: 3 });
    const st = s.deps.filter(q => q.round === ri).map(q => q.stay), you = st.length ? { x: st.reduce((a, b) => a + b, 0) / st.length, y: sim.gainAt(st.reduce((a, b) => a + b, 0) / st.length), label: D.lines.mean } : null;
    const tan = asked ? { x0: -T, y0: 0, x1: sim.tStar(T), y1: sim.gainAt(sim.tStar(T)), k: v && v.tan ? v.tan.k : 1, label: D.lines.tangent } : null;
    return { type: 'fg_xy', title: D.titles.gain, x: { lo: -T, hi: FG_AX, label: D.ax.t }, y: { lo: 0, hi: 7, label: D.ax.got }, frame: 'designed', lines, steps, dots, you, tan, vlines: [{ x: 0 }, { x: -T, dash: true }] };
  },
  riskSpec() {   // chick food in a round against the danger per field trip: the two rules' expectations only after you predict
    const s = this.sim.s, D = this.content.data, sim = this.sim, lines = [], dots = [];
    { const a = [], b = []; const safe = sim.riskE(0, 0); for (let p = 0; p <= 0.6001; p += 0.03) { a.push([p, sim.riskE(p, 1)]); b.push([p, safe]); } lines.push({ pts: a, dash: true, label: D.lines.field }, { pts: b, dash: true, label: D.lines.safe }); }   // the two rules cross near 20% danger
    s.rec.forEach((r, i) => { if (r.sun > 0 || r.caught) dots.push({ x: sim.cfg(2).rd[i].p, y: r.food, shape: r.caught ? 'ring' : 'disc' }); });
    return { type: 'fg_xy', title: D.titles.risk, x: { lo: 0, hi: 0.6, label: D.ax.p, fmt: 'pct' }, y: { lo: 0, hi: 14, label: D.ax.food }, frame: 'designed', lines, dots, dotLabel: dots.length ? D.lines.yours : null };
  },
  profSpec() {   // food a second while carrying each kind (its profitability); after you predict, what passing small ones earns in this stretch
    const s = this.sim.s, D = this.content.data, L = this.content.labels, sim = this.sim, F = FG_DIET, r = sim.cfg(0).rd[Math.min(s.i, 2)], lines = [];
    lines.push({ pts: [[0, sim.dietRates(r.b, r.s).big], [2, sim.dietRates(r.b, r.s).big]], dash: true, label: D.lines.skip });
    return { type: 'fg_xy', title: D.titles.prof, fold: false, x: { lo: 0, hi: 2 }, y: { lo: 0, hi: 1.8, label: D.ax.rate }, frame: 'designed', noX: true, lines, dots: [],
      bars: [{ x: 0.5, y: F.big / F.t, label: L.big }, { x: 1.5, y: F.small / F.t, label: L.small }] };
  },
  rateSpec() {   // your long-run rate for each tree you left, against the stay; the expected rate curve and its peak only after you predict
    const s = this.sim.s, D = this.content.data, sim = this.sim, ri = Math.min(s.i, sim.cfg(s.kd).rd.length - 1), T = sim.cfg(s.kd).rd[ri].T, lines = [], vlines = [];
    const asked = this.asked(ri);
    if (asked) { const pts = []; for (let t = 0.25; t <= FG_AX; t += 0.25) pts.push([t, sim.rateAt(t, T)]); lines.push({ pts, dash: true, label: D.lines.curve }); vlines.push({ x: sim.tStar(T), dash: true }); }
    const dots = s.deps.filter(q => q.round === ri).map(q => ({ x: q.stay, y: q.got / (T + q.stay), shape: 'disc' }));
    return { type: 'fg_xy', title: D.titles.rate, fold: false, x: { lo: 0, hi: FG_AX, label: D.ax.t }, y: { lo: 0, hi: 1.2, label: D.ax.rate }, frame: 'designed', lines, dots, vlines, dotLabel: dots.length ? D.lines.trees : null };
  },
  roundSpec() {   // chick food so far this round, against the round's seconds; after you predict, both rules' expectations for this round's hawk
    const s = this.sim.s, v = this.v, D = this.content.data, sim = this.sim, ri = Math.min(s.i, 1), r = sim.cfg(2).rd[ri], lines = [];
    { const a = [], b = []; sim.riskE(r.p, 1, r, a); sim.riskE(0, 0, r, b); lines.push({ pts: a, dash: true, label: D.lines.field }, { pts: b, dash: true, label: D.lines.safe }); }
    const pts = [[0, 0]]; let f = 0; for (const d of (v && v.dl || []).filter(q => q.i === ri)) { pts.push([d.sun, f]); f += d.v; pts.push([d.sun, f]); } pts.push([Math.min(r.S, s.i === ri ? s.sun : r.S), f]);
    return { type: 'fg_xy', title: D.titles.round, fold: false, x: { lo: 0, hi: r.S, label: D.ax.sec }, y: { lo: 0, hi: 14, label: D.ax.food }, frame: 'designed', lines, steps: [{ pts, w: 3 }], dots: [] };
  },
  resSpec() { const s = this.sim.s, D = this.content.data; return { type: 'fg_xy', title: D.titles.res, x: { lo: 0, hi: 10, label: D.ax.v }, y: { lo: 0, hi: 36, label: D.ax.e }, frame: 'designed', steps: [{ pts: (s.traj || []).map((e, i) => [i, e]), w: 3 }], lines: [{ pts: [[0, s.need], [10, s.need]], dash: true, label: D.lines.line }], dots: [] }; },
  oddsSpec() {   // one row per night: best play's exact chance (dashed, once that night is under way and past any ask) and how it went
    const s = this.sim.s, D = this.content.data, sim = this.sim, lines = [], dots = [];
    sim.cfg(4).rd.forEach(([e, need], i) => {
      if (i < s.i || (i === s.i && s.phase !== 'ask' && !(s.phase === 'gap'))) { const V = sim.V(e, 10, need); lines.push({ pts: [[V, i + 0.7], [V, i + 1.3]], dash: true }); }
      const q = (s.nights || [])[i]; if (q) dots.push({ x: q.ok ? 1 : 0, y: i + 1, shape: q.ok ? 'disc' : 'ring' });
    });
    return { type: 'fg_xy', title: D.titles.odds, fold: false, x: { lo: 0, hi: 1.04, label: D.ax.ch, fmt: 'pct' }, xticks: [0, 0.5, 1], y: { lo: 0.5, hi: 4.5, label: D.ax.night, fmt: 'int' }, frame: 'designed', lines, dots, dotLabel: dots.length ? D.lines.yourN : null };
  },
  nightsSpec() {   // the boss card: best play's exact chance of dawn for each night, and how each night went for you
    const s = this.sim.s, D = this.content.data, sim = this.sim, rd = sim.cfg(4).rd;
    return { type: 'fg_xy', title: D.titles.nights, x: { lo: 0.4, hi: 4.6, label: D.ax.night, fmt: 'int' }, xticks: [1, 2, 3, 4], y: { lo: 0, hi: 1.2, label: D.ax.ch, fmt: 'pct' }, frame: 'designed',
      bars: rd.map(([e, need], i) => ({ x: i + 1, y: sim.V(e, 10, need), w: 0.25 })), dots: (s.nights || []).map((q, i) => ({ x: i + 1, y: q.ok ? 1 : 0, shape: q.ok ? 'disc' : 'ring' })), lines: [], dotLabel: (s.nights || []).length ? D.lines.yourN : null, barLabel: D.lines.bestP };
  },
  cardSpec() { const n = this.kd(), s = this.sim.s; if (n === 0) return this.dietSpec(); if (n === 1) return this.gainSpec(); if (n === 2) return this.riskSpec(); return s.whatif ? this.resSpec() : this.nightsSpec(); }
};
V2.push(CH_FORAGER_V2);

/* ---------- fg_xy: one XY chart for the unit — dashed expectations, your dots and staircases, a tangent that draws itself ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.fg_xy) LiveGraph.T.fg_xy = {
  lay(w, h, spec, T, c) { const labels = (spec.lines || []).map(l => l.label).concat(spec.tan && spec.tan.label ? [spec.tan.label] : [], spec.dotLabel ? [spec.dotLabel] : [], spec.barLabel ? [spec.barLabel] : []); return wgXY(w, h, spec, T, c, { xlo: spec.x.lo, xhi: spec.x.hi, ylo: spec.y.lo, yhi: spec.y.hi, labels }); },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, ends = [];
    wgAxes(c, G, spec, T, { noY: !!spec.noY, noX: !!spec.noX, xticks: spec.xticks });
    if (spec.barLabel && (spec.bars || []).length) { const b = spec.bars[spec.bars.length - 1]; ends.push({ y: G.Y(b.y), text: spec.barLabel, col: wgRgba(I.text, 0.75), role: 'a' }); }
    for (const b of spec.bars || []) { const bw = b.w || 0.3, x0 = G.X(b.x - bw), x1 = G.X(b.x + bw), y = G.Y(b.y), yb = G.Y(spec.y.lo); c.fillStyle = wgRgba(I.text, 0.75); c.fillRect(x0, y, x1 - x0, yb - y); if (b.label && !T.compact) wgText(c, b.label, (x0 + x1) / 2, G.plot.y + G.plot.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 }); }
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip(); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const l of spec.vlines || []) { const x = G.X(l.x); c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, l.dash ? 0.45 : 0.3); c.setLineDash(l.dash ? [2, 3] : []); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); }
    c.setLineDash([6, 4]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text;
    for (const l of spec.lines || []) { if (!l.pts || !l.pts.length) continue; c.beginPath(); l.pts.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); const q = l.pts[l.pts.length - 1]; if (l.label) ends.push({ y: G.Y(q[1]), text: l.label, col: I.text, dash: true }); }
    if (spec.tan) { const t = spec.tan, k = t.k == null ? 1 : t.k, x0 = G.X(t.x0), y0 = G.Y(t.y0), x1 = x0 + (G.X(t.x1) - x0) * k, y1 = y0 + (G.Y(t.y1) - y0) * k; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); if (k >= 1) { c.setLineDash([]); c.lineWidth = 1.5; c.beginPath(); c.arc(x1, y1, 4.5 * T.k, 0, TAU); c.stroke(); } if (t.label && k >= 1) ends.push({ y: y1, text: t.label, col: I.text, dash: true }); }
    c.setLineDash([]);
    for (const st of spec.steps || []) { if (!st.pts || !st.pts.length) continue; c.lineWidth = (st.w || 2) * T.k; c.strokeStyle = st.faint ? wgRgba(I.text, 0.35) : I.text; c.beginPath(); st.pts.forEach((q, i) => { const x = G.X(q[0]), y = G.Y(q[1]); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); if (!st.faint) { const q = st.pts[st.pts.length - 1]; wgMark(c, 'ink', G.X(q[0]), G.Y(q[1]), 3.5 * T.k, I.text, I.surface); } }
    for (const d of spec.dots || []) { const x = G.X(d.x), y = G.Y(d.y), r = 4 * T.k; c.beginPath(); if (d.shape === 'square') c.rect(x - r, y - r, 2 * r, 2 * r); else c.arc(x, y, r, 0, TAU); if (d.shape === 'ring') { c.lineWidth = 2; c.strokeStyle = I.text; c.stroke(); } else { c.fillStyle = I.text; c.fill(); c.lineWidth = 1; c.strokeStyle = I.surface; c.stroke(); } }
    c.restore();
    const dl = (spec.dots || []).length && spec.dotLabel ? spec.dots[spec.dots.length - 1] : null; if (dl) ends.push({ y: G.Y(dl.y), text: spec.dotLabel, col: I.text, role: 'ink' });
    wgEnds(c, G, ends, T); if (spec.you) wgYou(c, G, spec.you, T, 'x');
  },
  rows(spec) {
    const fx = spec.x && spec.x.fmt, fy = spec.y && spec.y.fmt, out = [];
    for (const d of spec.dots || []) out.push(['you', wgFmt(fx, d.x), wgFmt(fy, d.y)]);
    for (const l of spec.lines || []) for (const q of (l.pts || []).filter((q0, i) => i % 4 === 0)) out.push([(l.label || 'expected') + ' (expected)', wgFmt(fx, q[0]), wgFmt(fy, q[1])]);
    if (spec.tan) out.push(['tangent point', wgFmt(fx, spec.tan.x1), wgFmt(fy, spec.tan.y1)]);
    return { head: ['series', (spec.x && spec.x.label) || 'x', (spec.y && spec.y.label) || 'y'], rows: out };
  },
  say(spec) { return (spec.dots || []).length + ' points' + ((spec.lines || []).length ? ', ' + spec.lines.map(l => l.label).filter(Boolean).join(', ') : ''); }
};

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.forager = FG_TEXT.take;
  MODEL.forager = 'One great tit: take or pass caterpillars carried home one at a time; leave depleting trees; weigh food against a hawk; then a flock evolves your leaving rule; then a winter night where survival, not rate, counts.';
  RECALL.forager = { q: 'Big caterpillars become very common. What should a great tit do with small ones?', opts: [['pass', 'Pass them'], ['take', 'Take them all'], ['more', 'Take more, since there are more of everything']], ans: 'pass', why: 'Each small one costs a trip home while big ones slip past. Whether to take them depends on how often big ones come.' };
  BRIDGE.forager = 'In Hawks and Doves your fighting habit became a gene. Here your foraging habit does.';
}
