/* ================= v2/alarm.js: Alarm Call (id 'alarm'), the Wave 2 rebuild of a favourite =================
   D1 §3.6, D5 §4 item 10, D6 (21 Oct addendum: own world, intro card; 22 Oct decisions 9 and 10: simple, real biology).
   You are a Belding's ground squirrel in a high Sierra meadow (role: a behaving animal). A coyote or a hawk closes in; you
   call a warning or stay silent, reading your neighbours' ear-flag tags. Calling costs you risk C and saves each warned
   neighbour risk B, so a call pays your genes when Σ r·B > C (Hamilton 1964). One verb all chapter: Call or Stay silent.
   Four levels, one idea each: the cost and benefit of a call (known kin; the one prediction: the break-even relatedness);
   fathers you cannot see (sisters' flags read from their face blazes); sex-biased dispersal (you play a daughter at home and
   a son among strangers while two sex-limited calling alleles run 15 seasons in the colony); and a boss where the hawk's
   whistle saves its caller, so it pays with no kin at all.
   Headless sim (R(), Det only), stars against the expectation, juice from Sim.run's events only (API_v2 §6.1). The run is
   (seed, level, actions); the untimed flag is read once at reset (as Hawks does) and logged in the state. */

const AL_B = 0.4;                                           // risk each warned neighbour avoids (ledger units)
const AL_C = { coyote: 0.22, hawk: -0.26 };                 // the caller's extra risk: trill +0.22 (Sherman 1977); whistle −0.26 (sign from Sherman 1985; size designed)
const AL_RISK = { sil: 0.30, trill: 0.52, whistle: 0.04, warned: 0.1, open: 0.5, k: 0.3 };   // catch chance = k × risk; at most one victim an attack
const AL_REL = { mo: 0.5, fs: 0.5, hs: 0.25, au: 0.25, co: 0.125, un: 0, im: 0, br: 0.5 };
const AL_TAGS = ['1/2', '1/4', '1/8', '0'];
const AL_GLYPH = { '1/2': '½', '1/4': '¼', '1/8': '⅛', '0': '0' };
const AL_T = { tell: 0.8, decide: [3.0, 3.4, 2.6, 2.6], strike: 1.3, debrief: 1.9, season: 1.2, auto: 0.45, ask: 14 };
const AL_ASK = { be: { chart: 0, lo: 0, hi: 2, start: 2, tol: 0.1, step: 0.05 } };   // the one prediction: axis, start (off every plausible answer), tolerance
// L3, the colony: two sex-limited calling loci; neighbourhood relatedness set by dispersal; selection strength ×N
const AL_C4 = { N: 200, T: 15, vig: 8, sigma: 2.6, Rf: 0.9, Rm: 0.05, M: 200 };
const AL_LV = [   // per level: attacks, predators, tags known
  { n: 8, truth: true, ask: 'be', askAt: 3 },
  { n: 8, blaze: true },
  { colony: true },
  { n: 10, truth: true, hawk: true }
];

const AL_TEXT = {
  intro: {
    game: 'You are a Belding’s ground squirrel in a high Sierra meadow, where coyotes and hawks hunt. Each attack, you call a warning or stay silent.',
    biology: 'Calling can put the caller at risk while it saves the neighbours it warns. Hamilton’s rule: a call pays your genes when relatedness times benefit beats the cost, rB > C.',
    how: 'Read each neighbour’s ear flag, its relatedness to you. Then tap yourself to call, or your burrow to stay silent, before the predator strikes.'
  },
  firstWords: 'A coyote! Ear flags show each neighbour’s relatedness to you. Tap yourself to trill a warning, or tap your burrow to stay silent.',
  hud: {
    decideC: 'Coyote! Trill to warn them, or stay silent?',
    decideB: 'Coyote! Same blaze as yours: full sister, ½. Another blaze: half-sister, ¼.',
    decideH: 'Hawk! Whistle, or stay silent?',
    decideHq: 'A hawk! What does a whistle cost you? Whistle, or stay silent?',
    strike: 'The predator strikes.',
    debrief: 'The ledger: Σr × 0.4 against the cost, 0.22. Call when Σr > 0.55.',
    debriefH: 'The ledger: a whistler bolts for cover, so the call saves the caller.',
    be: 'Drag the line: above what total relatedness does a trill pay?',
    vigF: 'Season {t}: you are a daughter at home. Coyote!',
    vigM: 'Season {t}: you are a son among strangers. Coyote!',
    season: 'Winter. Daughters stay; sons leave home.',
    auto: 'Seasons pass. Calling copies rise or fall by what they do for kin.',
    ask: 'Drag the marker, then Lock in.',
    over: 'The level is done.'
  },
  whispers: {
    called: 'You trilled. You froze in view.', whistled: 'You whistled and bolted.', silent: 'You stayed silent.', slow: 'Too slow: you stayed silent.',
    caught: 'Caught! You go on as a sister.', killed: 'A neighbour was caught.', none: 'Nobody was caught.',
    good: 'Good call for your genes.', bad: 'Your genes lost out.', drag: 'Drag the marker first.',
    miss: 'Tap yourself to call, your burrow for silence.', blaze: 'Read her face blaze.'
  },
  labels: {
    you: 'you', cost: 'cost', costQ: 'cost ?', pays: 'call pays', silentPays: 'silence pays', burrow: 'your burrow', designed: 'blaze: designed', saves: 'saves the caller',
    coyote: 'coyote', hawk: 'hawk', daughters: 'daughters stay', sons: 'sons leave', season: 'season {n}/{m}', attack: 'attack {n}/{m}',
    lock: 'Lock in', call: 'Call', silentB: 'Stay silent', notEq: '≠', ledger: 'kin vs cost', trueR: 'r {r}', sr: 'Σr {v}', xN: 'selection ×N', yourBlaze: 'your blaze',
    tKin: 'Kin nearby', tFem: 'Females calling', tMale: 'Males calling', keyA: 'A: calling copy', keya: 'a: silent copy', callers: 'callers',
    sAtk: 'Attack', sOk: 'Good calls', sSeason: 'Season', sF: 'Females calling', sM: 'Males calling', sVigF: 'You, as daughter', sVigM: 'You, as son',
    called: 'called', silent: 'silent', attackAx: 'attack', seasonAx: 'season', sumR: 'Σr', model: 'model', females: 'females', males: 'males', breakEven: 'break-even'
  },
  panels: [],
  interesting: {
    overcall: 'You called for neighbours worth less than the cost. Two cousins add ¼; a trill needs more than 0.55.',
    undercall: 'You stayed silent beside close kin. One sister and one cousin already make 0.625, above 0.55.',
    halfFull: 'You trilled beside half-sisters as if they were full sisters. Another blaze means another father: r = ¼, not ½.',
    fullMissed: 'You stayed silent beside a sister wearing your blaze. Same father: a full sister, r = ½.',
    noSelfish: 'You never whistled when kin were few. The whistle saves the caller, so it pays with no kin at all.',
    sexGap: 'Female calling rose and male calling fell. Same rule, different kin nearby.',
    sexDrift: 'Drift blurred the gap this time, but the expected paths still parted.'
  },
  levers: {},
  take: 'Warn relatives when relatedness times benefit beats your cost; a call that saves the caller needs no kin.',
  body: 'Hamilton’s rule held in every attack: trill when Σr × 0.4 beats 0.22. Daughters live among kin, so female calling spread; sons disperse, so it did not. The hawk whistle saved its caller, so it needed no kin. You made {g} of {n} good calls here.',
  law: { title: 'Hamilton’s rule' },
  boss: { inverts: 'Here the call saves the caller, so it pays with no kin at all.' },
  stars: {
    discover: 'Call by Hamilton’s rule, with known kin, blazes or dispersal.',
    predict: 'Drag the break-even relatedness for a trill inside the band.',
    transfer: 'Whistle at hawks with no kin near, yet stay silent at coyotes.'
  },
  levelTake: [
    'A trill pays when the relatedness around you times 0.4 beats its cost, 0.22: Σr > 0.55.',
    'Litters have several fathers. A sister with another blaze is a half-sister, r = ¼.',
    'Daughters stay among kin and sons leave, so calling spread in females and fell in males.'
  ],
  levelStars: [
    { discover: 'Make 7 of 8 calls the way Hamilton’s rule says.', predict: 'Drag the break-even relatedness inside the band.' },
    { discover: 'Make 7 of 8 good calls, reading sisters’ blazes.' },
    { discover: 'Call as a daughter at home and stay silent as a son: 7 of 8.' },
    { discover: 'Make 7 of 8 good calls once the hawks arrive.', transfer: 'Whistle at every hawk with few kin near, yet stay silent at such coyotes.' }
  ],
  captions: {
    liveAtk: 'Attack {i}. You {a}. Relatedness nearby {r}.',
    liveSeason: 'Season {t}. Females calling {f} percent, males {m} percent.',
    mOk: 'Calls that matched Hamilton’s rule, counted with true relatedness.',
    mF: 'Share of calling copies at the locus expressed in females.',
    mM: 'Share of calling copies at the locus expressed in males.'
  },
  model: [
    { level: 0, simulated: 'A colony of about 14 squirrels with a known pedigree. Each coyote attack, you and two to five neighbours are in view. A trill raises your risk by 0.22; each warned neighbour avoids 0.4.', simplification: 'Costs and benefits are fixed. At most one squirrel is caught an attack, with chance 0.3 × its risk. If caught, you play on as a full sister.', params: [{ name: 'benefit to a warned neighbour B', value: 0.4, tag: 'designed' }, { name: 'trill cost C', value: 0.22, tag: 'designed' }, { name: 'catch chance per risk unit', value: 0.3, tag: 'designed' }], cannot: 'Learning, age, or calls that change how predators hunt.', nature: 'Sherman found females with kin nearby trilled more, and trillers were stalked and chased more than silent squirrels.', contested: false, refs: ['ham1964', 'sh1977'] },
    { level: 1, simulated: 'Litters have one or two fathers, which you never see. Each pup wears its father’s face blaze, so a sister with your blaze is a full sister. Other relatives keep their known flags.', simplification: 'The face blaze is a designed cue: real squirrels carry no such mark. Each litter has one or two sires.', params: [{ name: 'father’s face blaze', value: 'one per sire', tag: 'designed' }, { name: 'sires per litter', value: '1–2', tag: 'designed' }], cannot: 'How squirrels themselves tell kin apart.', nature: 'Hanken and Sherman found 78% of 27 litters had two or more fathers. Full sisters fought less than half-sisters (Holmes and Sherman 1982).', contested: false, refs: ['hs1981', 'hol1982'] },
    { level: 2, simulated: 'Two calling alleles: one acts in females, one in males. Each season a copy’s fitness moves by Σr × 0.4 − 0.22 near its carrier. Then 400 copies are drawn.', simplification: 'Neighbours’ relatedness is set by dispersal, not counted. Daughters live among Σr ≈ 0.9 of kin; sons among 0.05.', params: [{ name: 'copies per locus', value: 400, tag: 'designed' }, { name: 'Σr near daughters', value: 0.9, tag: 'designed' }, { name: 'Σr near sons', value: 0.05, tag: 'designed' }, { name: 'selection a season', value: 2.6, tag: 'xN', real: 'calls cost far less a season' }], cannot: 'Kin structure built up from births and deaths. Real calling has no known single gene.', nature: 'Belding’s males leave home before they breed; females settle near their mothers (Holekamp 1984). Females called far more than males (Sherman 1977).', contested: false, refs: ['sh1977', 'hol1984'] },
    { level: 3, simulated: 'Hawks arrive. A whistle warns neighbours too. But the whistler bolts for cover, so its risk falls by 0.26.', simplification: 'The whistle’s cost is set from the direction of Sherman’s finding; its size is designed.', params: [{ name: 'whistle cost', value: -0.26, tag: 'designed' }, { name: 'trill cost', value: 0.22, tag: 'designed' }], cannot: 'Why some squirrels call before bolting and others after.', nature: 'Sherman watched 664 hawk encounters at Tioga Pass, most staged with trained raptors. Fewer whistlers than silent squirrels were killed (Sherman 1985).', contested: false, refs: ['sh1985'] }
  ],
  why: {
    real: [
      'Paul Sherman watched Belding’s ground squirrels at Tioga Pass. Females with mothers, sisters or daughters nearby trilled at coyotes more. Males, which leave home, rarely called. Trillers were stalked and chased more than silent squirrels (Sherman 1977).',
      'Litters often have several fathers (Hanken and Sherman 1981). Young males disperse before breeding, while females settle near their mothers (Holekamp 1984).',
      'Hawk whistles differ: fewer whistlers than silent squirrels were killed, so whistles look selfish (Sherman 1985).'
    ],
    maths: [
      'Hamilton’s rule: a gene for helping spreads when rB > C. Here each warned neighbour avoids B = 0.4 risk. A trill costs C = 0.22. So call when Σr × 0.4 > 0.22, that is Σr > 0.55.',
      'Relatedness r is the chance that a gene in you is also in them by descent. Full sister ½; half-sister ¼; mother’s sister ¼; her daughter ⅛.',
      'A whistle’s cost is negative, so Σr × 0.4 − C is positive with no kin at all. A behaviour that helps the actor needs no kin.'
    ]
  }
};

const AL_hit = (s, id) => { const A = AL_ASK[id]; return s.pred[id] != null && s.exp[id] != null && Math.abs(s.pred[id] - s.exp[id]) <= A.tol + 1e-9; };
const AL_val = (sr, pred) => sr * AL_B - AL_C[pred];   // the call's inclusive gain in ledger units (true relatedness)
const AL_low = r => r.sr * AL_B <= AL_C.coyote + 1e-9;   // few kin near: a trill would not pay

const CH_ALARM_V2 = {
  id: 'alarm', v2: true, role: 'animal', place: 'meadow', accent: '#6E5AA8',
  intro: { goal: 'Warn your kin when Hamilton’s rule says the call pays.' },
  content: AL_TEXT,
  P: {
    B: { v: AL_B, tag: 'designed', min: 0.1, max: 0.8, label: 'benefit of a warning' },
    C: { v: AL_C.coyote, tag: 'designed', min: 0, max: 0.6, label: 'trill cost' },
    sigma: { v: AL_C4.sigma, tag: 'xN', min: 0.5, max: 5, real: 'calls cost far less a season', label: 'selection a season' }
  },
  levels: [
    { name: 'Coyote at dusk', adds: 'the cost of a call', codes: ['K1'], minutes: 2 },
    { name: 'Who’s my sister?', adds: 'fathers you cannot see', codes: ['K2'], minutes: 2 },
    { name: 'Daughters stay', adds: 'sex-biased dispersal', codes: ['K4'], minutes: 2.5 },
    { name: 'The hawk', adds: 'a call that saves the caller', codes: ['K3'], minutes: 2.5 }
  ],
  keys: { C: 'call', S: 'stay silent', P: 'predict', Enter: 'lock in' },
  untimed: true,
  teacher: { prompts: ['A sister has r = ½. Does she carry only half of the genes you carry?', 'Is the hawk whistle altruistic? What evidence would decide it?', 'This model fixes costs and sets relatedness by dispersal. Which simplification most changes the result?'], pool: 'trace' },
  starTraits: ['caller', 'silent'],
  encodings: [   // calling alleles in the colony read-out only (D4 §2.2 rule 4): caller blue, silent amber, each with its letter
    { k: 'caller', rgb: [107, 151, 255], channels: ['colour', 'letter'] },
    { k: 'silent', rgb: [242, 201, 76], channels: ['colour', 'letter'] }
  ],
  unitStars(lv) {   // D1's cross-level stars: Discover on two levels; Predict on L1; Transfer on the boss
    const c = b => lv.filter(m => m & b).length;
    return (c(1) >= 2 ? 1 : 0) | (c(2) >= 1 ? 2 : 0) | (c(4) >= 1 ? 4 : 0);
  },

  /* ================= headless simulation (API_v2 §9.3): R() and plain JSON only ================= */
  sim: {
    dt: 1 / 30, s: null,
    // ---- the colony (L1, L2, L4): relations to you, each sister with her father's face blaze ----
    colony() {
      const yb = R() < 0.5 ? 'stripe' : 'chevron', ob = yb === 'stripe' ? 'chevron' : 'stripe', col = [], add = (id, rel, sex, blaze) => col.push({ id, rel, sex, blaze: blaze || null, alive: true });
      const nF = 2 + (R() < 0.5 ? 1 : 0), nH = 1 + (R() < 0.5 ? 1 : 0), nC = 2 + (R() < 0.5 ? 1 : 0);
      add('mo', 'mo', 'f'); add('au', 'au', 'f');
      for (let i = 1; i <= nF; i++) add('f' + i, 'fs', 'f', yb);
      for (let i = 1; i <= nH; i++) add('h' + i, 'hs', 'f', ob);
      for (let i = 1; i <= nC; i++) add('c' + i, 'co', 'f', 'spot');
      add('u1', 'un', 'f'); add('u2', 'un', 'f'); add('m1', 'im', 'm'); add('m2', 'im', 'm'); add('m3', 'im', 'm');
      return { col, yb, ob };
    },
    tagOf(rel) { const r = AL_REL[rel]; return r === 0.5 ? '1/2' : r === 0.25 ? '1/4' : r === 0.125 ? '1/8' : '0'; },
    tagR(t) { return t === '1/2' ? 0.5 : t === '1/4' ? 0.25 : t === '1/8' ? 0.125 : 0; },
    member(s, id) { for (const m of s.col) if (m.id === id) return m; return null; },
    pool(s) { return s.col.filter(m => m.alive && m.id !== s.me); },
    // neighbours for an attack: 2–5 squirrels; want: 1 call pays, 0 silence pays, 'low' Σr < 0.55, 'sis' (L2) a sister in view, null any
    pickNb(s, pred, want) {
      let best = null;
      for (let tries = 0; tries < 40; tries++) {
        const P = this.pool(s).slice(), n = Math.min(P.length, 2 + Math.floor(R() * 4)), nb = [];
        for (let k = 0; k < n; k++) { const j = Math.floor(R() * P.length); nb.push(P[j].id); P.splice(j, 1); }
        let sr = 0, sisR = 0, nhs = 0; for (const id of nb) { const m = this.member(s, id); sr += AL_REL[m.rel]; if (m.rel === 'fs' || m.rel === 'hs') sisR += AL_REL[m.rel]; if (m.rel === 'hs') nhs++; }
        const v = AL_val(sr, pred); best = nb;
        if (want === 'low') { if (sr < 0.55 - 1e-9) return nb; continue; }
        if (Math.abs(v) < 0.02) continue;
        if (s.level === 1 && tries < 36) {   // L2: the sisters' blazes decide the call (ignoring them, or reading a half-sister as full, would get it wrong)
          const crit = v > 0 ? sisR > 0 && (sr - sisR) * AL_B < AL_C[pred] - 1e-9 : nhs > 0 && (sr + 0.25 * nhs) * AL_B > AL_C[pred] + 1e-9;
          if (!crit) continue;
        }
        if (want == null || (want === 1) === (v > 0)) return nb;
      }
      return best;
    },
    plan(level) {   // the attack list: predators and what each attack should test, shuffled with R()
      const L = AL_LV[level], sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
      if (L.hawk) return [['coyote', null], ['hawk', null]].concat(sh([['coyote', 1], ['coyote', 0], ['coyote', 1], ['coyote', 0], ['hawk', 'low'], ['hawk', 'low'], ['hawk', null], ['hawk', null]]));
      const w = []; for (let i = 0; i < L.n; i++) w.push(['coyote', i % 2 ? 0 : 1]); return sh(w);
    },
    reset(level, o) {
      o = o || {}; const L = AL_LV[level];
      this.s = { level, phase: 'start', pt: 0, time: 0, unt: !!(o.unt || (Save.d && Save.d.ui && Save.d.ui.unt)), log: [], asks: [], at0: {}, pred: {}, exp: {}, ask: null, voided: {} };
      const s = this.s;
      if (L.colony) return this.reset4(s);
      const c = this.colony(); s.col = c.col; s.yb = c.yb; s.ob = c.ob; s.me = 'me'; s.tags = {}; s.recs = []; s.ai = 0; s.atk = null; s.n = L.n; s.died = 0; s.hawkSeen = false;
      for (const m of s.col) s.tags[m.id] = L.blaze && (m.rel === 'fs' || m.rel === 'hs') ? null : this.tagOf(m.rel);   // L2: sisters' flags are blank; their face blazes tell full from half
      s.plan = this.plan(level);
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
    first(s) { return !AL_LV[s.level].colony && s.ai === 0; },   // the first attack of a level waits for you
    choose(s, a, ev) {
      const A = s.atk; if (!A || (A.st !== 'decide' && A.st !== 'tell') || A.a != null) return;   // a call as the predator appears counts too
      A.a = a ? 1 : 0; A.st = 'strike'; A.t = 0;
      ev.push({ k: 'call', a: A.a, pred: A.pred, slow: A.slow });
      this.strike(s, ev);
    },
    strike(s, ev) {   // at most one victim: one R() walks the cumulative catch chances (k × risk)
      const A = s.atk, call = A.a === 1, K = AL_RISK.k, colony = !!AL_LV[s.level].colony, fsAlive = !colony && s.col.some(m => m.alive && m.rel === 'fs' && m.id !== s.me);
      const mine = call ? (A.pred === 'hawk' ? AL_RISK.whistle : AL_RISK.trill) : AL_RISK.sil, list = [];
      if (colony || fsAlive) list.push(['@me', mine]);   // designed floor: with no full sister left to play on as, you are not caught
      for (const id of A.nb) list.push([id, call ? AL_RISK.warned : AL_RISK.open]);
      const u = R(); let cum = 0, vic = null;
      for (const [id, r] of list) { cum += K * r; if (u < cum) { vic = id; break; } }
      if (colony) { A.victim = vic === '@me' ? '@me' : vic; A.you = vic === '@me'; }
      else if (vic === '@me') { A.you = true; const m = this.member(s, s.me); if (m) m.alive = false; const sis = s.col.find(q => q.alive && q.rel === 'fs' && q.id !== s.me); s.meOld = s.me; s.me = sis.id; sis.you = true; s.died++; A.victim = '@me'; }
      else if (vic) { A.victim = vic; this.member(s, vic).alive = false; }
      const v = AL_val(A.sr, A.pred), best = v > 0 ? 1 : 0, rels = A.nb.map(id => { const m = this.member(s, id); return m ? m.rel : 'un'; });
      s.recs.push({ i: A.i, pred: A.pred, sr: A.sr, srt: A.srt, a: A.a, best, v, ok: A.a === best, slow: A.slow, vig: A.vig || null, rels });
      ev.push({ k: 'strike', victim: A.victim, you: A.you, pred: A.pred });
    },
    attackStep(s, dt, ev) {
      const A = s.atk; A.t += dt;
      if (A.st === 'tell') { if (A.t >= AL_T.tell) { A.st = 'decide'; A.t = 0; ev.push({ k: 'decide' }); } }
      else if (A.st === 'decide') { if (!s.unt && !this.first(s) && A.t >= this.decideT(s)) { A.slow = true; this.choose(s, 0, ev); } }
      else if (A.st === 'strike') { if (A.t >= AL_T.strike) { A.st = 'debrief'; A.t = 0; const r = s.recs[s.recs.length - 1]; ev.push({ k: 'debrief', ok: r.ok, v: r.v, pred: A.pred }); } }
      else if (A.st === 'debrief') { if (A.t >= AL_T.debrief) this.afterAttack(s, ev); }
    },
    afterAttack(s, ev) {
      if (AL_LV[s.level].colony) { this.season4(s, ev); return; }
      if (s.atk && s.atk.pred === 'hawk') s.hawkSeen = true;   // the first hawk's ledger has shown what a whistle costs
      s.ai++; const L = AL_LV[s.level];
      if (L.askAt && s.ai === L.askAt && !s.asked) { s.asked = true; s.atk = null; this.openAsk(s, ev, L.ask); return; }
      if (s.ai >= s.n) { this.finish(s, ev); return; }
      this.newAttack(s, ev);
    },
    // ---- the one prediction (L1) ----
    openAsk(s, ev, id) {
      const A = AL_ASK[id]; s.ask = { id, kind: 'y', lo: A.lo, hi: A.hi, tol: A.tol }; s.asks.push(id); s.at0[id] = 0;
      s.phase = 'ask'; s.pt = 0; ev.push({ k: 'ask', id });
    },
    now() { return 0; },
    askDone(s, ev) { s.ask = null; this.newAttack(s, ev); },
    // ---- L3: the colony (two sex-limited calling loci, Wright–Fisher on 400 copies each) ----
    reset4(s) {
      const j = () => Math.round((0.35 + 0.3 * R()) * 100) / 100;
      s.c4 = { t: 0, p0: [j(), j()], p: null, hist: [] };
      s.c4.p = s.c4.p0.slice(); s.c4.hist.push([0, s.c4.p[0], s.c4.p[1]]);
      s.recs = []; s.col = []; s.tags = {}; s.me = 'me'; s.ai = 0; s.atk = null;
      this.nextSeason(s, []);
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
    model4(s) {   // the expected paths the end chart shows dashed (a private PRNG: R() and the run stay untouched)
      if (!s.exp4) { const P = [], sd = (Math.round(s.c4.p0[0] * 100) * 131 + Math.round(s.c4.p0[1] * 100) * 7) >>> 0; s.exp4 = this.exp4(s.c4.p0, false, sd + 11, P); s.exp4path = P; }
      return s.exp4;
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
    // ---- the end ----
    finish(s, ev) {
      s.phase = 'over'; s.ask = null; if (s.atk) s.atk.st = 'done';
      for (const id of s.asks) s.exp[id] = this.expect(s, id);
      if (s.c4) this.model4(s);
      ev.push({ k: 'over' });
    },
    expect(s, id) { return id === 'be' ? AL_C.coyote / AL_B : null; },
    // ---- the frame ----
    step(dt) {
      const s = this.s, ev = []; s.time += dt;
      if (s.phase === 'attack') this.attackStep(s, dt, ev);
      else if (s.phase === 'ask') { s.pt += dt; const id = s.ask.id; if (s.pred[id] != null || s.voided[id] || (!s.unt && s.pt >= AL_T.ask)) this.askDone(s, ev); }
      else if (s.phase === 'season') { s.pt += dt; if (s.pt >= AL_T.season) this.nextSeason(s, ev); }
      else if (s.phase === 'auto') { s.pt += dt; if (s.pt >= AL_T.auto) { s.pt = 0; const C = s.c4; C.p = this.gen4(C.p, false, R); C.t++; C.hist.push([C.t, C.p[0], C.p[1]]); ev.push({ k: 'season', t: C.t, auto: true }); if (C.t >= AL_C4.T) this.finish(s, ev); } }
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!a || s.phase === 'over') return ev;
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id && s.pred[a.id] == null) { const A = AL_ASK[a.id]; s.pred[a.id] = Math.max(A.lo, Math.min(A.hi, +a.v || 0)); ev.push({ k: 'predicted', id: a.id }); } return ev; }
      if (a.k === 'void') { if (s.ask && a.id === s.ask.id) s.voided[a.id] = 1; return ev; }
      if (a.k === 'call') { if (s.phase === 'attack') this.choose(s, a.a, ev); return ev; }
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_ALARM_V2.stars, n = s.level, mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { ok: (s.recs || []).filter(r => r.ok).length }, interesting: this.interesting(s) };
    },
    interesting(s) {   // the card's Interesting line, chosen from what happened
      const n = s.level, R0 = (s.recs || []).filter(r => !r.ok);
      if (n === 0) { const o = R0.filter(r => r.a === 1).length, u = R0.filter(r => r.a === 0 && !r.slow).length; if (R0.length >= 2) return o >= u ? 'overcall' : 'undercall'; return null; }
      if (n === 1) { if (R0.some(r => r.a === 1 && r.rels.indexOf('hs') >= 0)) return 'halfFull'; if (R0.some(r => r.a === 0 && r.rels.indexOf('fs') >= 0)) return 'fullMissed'; return null; }
      if (n === 2) { const h = s.c4.hist, a = h[0], z = h[h.length - 1]; return z[1] - a[1] >= 0.1 && a[2] - z[2] >= 0.1 ? 'sexGap' : 'sexDrift'; }
      if (!(s.recs || []).some((r, i) => i >= 2 && r.pred === 'hawk' && r.a === 1 && AL_low(r))) return 'noSelfish';
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s || s.phase === 'over') return out;
      if (s.ask) { const A = AL_ASK[s.ask.id], m = Math.round((A.hi - A.lo) / A.step); for (let i = 0; i <= m; i++) out.push({ k: 'predict', id: s.ask.id, v: Math.round((A.lo + i * A.step) * 1000) / 1000 }); return out; }
      if (s.phase === 'attack' && s.atk && s.atk.st === 'decide') out.push({ k: 'call', a: 1 }, { k: 'call', a: 0 });
      return out;
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    near(acts, v) { let best = null, bd = 1e9; for (const a of acts) if (a.k === 'predict') { const d = Math.abs(a.v - v); if (d < bd) { bd = d; best = a; } } return best; },
    bots: {
      alwaysA(s, acts) { if (!acts.length) return null; if (acts[0].k === 'predict') return acts[0]; return acts.find(a => a.k === 'call' && a.a === 1) || null; },   // always call; predicts the axis bottom
      alwaysB(s, acts) { if (!acts.length) return null; if (acts[0].k === 'predict') return acts[acts.length - 1]; return acts.find(a => a.k === 'call' && a.a === 0) || null; },   // never call; predicts the axis top
      greedy(s, acts) {   // knows the truth and plays Hamilton's rule with the trill's cost for every call; predicts no change
        const S = CH_ALARM_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, S.now(s, s.ask.id));
        return { k: 'call', a: s.atk.sr * AL_B > AL_C.coyote ? 1 : 0 };
      },
      threshold(s, acts) {   // a rule of thumb: call when two or more neighbours wear kin flags; predicts mid-axis
        const S = CH_ALARM_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') { const A = AL_ASK[s.ask.id]; return S.near(acts, (A.lo + A.hi) / 2); }
        return { k: 'call', a: s.atk.tags.filter(t => t && t !== '0').length >= 2 ? 1 : 0 };
      },
      whistler(s, acts) {   // the D1 oracle bot: whistles at every hawk, trills by the flags it can read (a blank flag counts as 0); predicts no change
        const S = CH_ALARM_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, S.now(s, s.ask.id));
        return { k: 'call', a: s.atk.pred === 'hawk' || s.atk.srt * AL_B > AL_C.coyote ? 1 : 0 };
      },
      expert(s, acts) {   // skilled play (oracle only): reads blazes, whistles at every hawk, calls the break-even
        const S = CH_ALARM_V2.sim; if (!acts.length) return null;
        if (acts[0].k === 'predict') return S.near(acts, S.expect(s, s.ask.id));
        return { k: 'call', a: s.atk.pred === 'hawk' || s.atk.sr * AL_B > AL_C.coyote ? 1 : 0 };
      }
    }
  },

  /* ---- stars: pure functions of the final state, scored against the expectation (true relatedness, model costs) ---- */
  stars: {
    discover: (s, n) => {
      const R = s.recs || [], ok = R.filter(r => r.ok).length;
      if (n === 0) return R.length >= 8 && ok >= 7 && R.some(r => r.a === 1 && r.best === 1) && R.some(r => r.a === 0 && r.best === 0);
      if (n === 1) return R.length >= 8 && ok >= 7;
      if (n === 2) { const V = R.filter(r => r.vig); return V.length >= 8 && V.filter(r => r.ok).length >= 7; }
      const P = R.filter((r, i) => i >= 2); return P.length >= 8 && P.filter(r => r.ok).length >= 7;
    },
    predict: (s, n) => n === 0 && AL_hit(s, 'be'),
    transfer: (s, n) => {   // the boss: every few-kin attack handled by the new rule (whistle at the hawk, stay silent at the coyote)
      if (n !== 3) return false; const P = (s.recs || []).filter((r, i) => i >= 2 && AL_low(r)), H = P.filter(r => r.pred === 'hawk');
      return H.length >= 2 && H.every(r => r.a === 1) && P.filter(r => r.pred === 'coyote').every(r => r.a === 0);
    }
  },
  // assignment links: bits 0–2 level, 3–5 mask, 6–9 good calls, 14–20 the L1 prediction ×100 (clamped)
  resultBits(s, level) {
    if (!s) return 0; const r = this.sim.result() || { mask: 0 }, ok = (s.recs || []).filter(q => q.ok).length, p = s.pred && s.pred.be != null ? Math.round(s.pred.be * 100) : 0;
    return (level & 7) | ((r.mask & 7) << 3) | ((Math.min(15, ok)) << 6) | ((Math.min(127, p)) << 14);
  },
  teacherStep() { const s = this.sim.s; if (!s) return; if (s.phase === 'attack' && s.atk && s.atk.st !== 'decide') s.atk.t = 99; else if (s.phase !== 'attack' && s.phase !== 'ask') s.pt = 99; },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {});
    if (typeof Url !== 'undefined' && Url.q && Url.q.untimed != null && !/^(0|false|no|off)$/i.test(Url.q.untimed)) o.unt = true;
    this.level = n; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._said = {};
    Sim.start(this, n, o);
    this.v = { t: 0, bg: null, bgKey: '', banner: null, rings: [], dash: {}, lift: null, pop: 0, sq: 0, mapT: 0, lastSig: '' };
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: this.levels[n].name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (typeof Ghost !== 'undefined' && n === 0) { const s = this.sim.s; Ghost.show({ verb: 'tap', key: 'c', at: () => this.youAt(), until: () => (s.recs && s.recs.length > 0) || (s.atk && s.atk.a != null) }); }
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

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.pop = Math.max(0, v.pop - dt / 0.2); v.sq = Math.max(0, v.sq - dt / 0.25); v.mapT += dt;
    v.rings = v.rings.filter(r => (r.t += dt) < r.ms);
    if (v.lift) { v.lift.t += dt; if (v.lift.t > 1.4) v.lift = null; }
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
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
    if (final) { const P = (s.recs || []).filter((q, i) => i >= 2); o.body = Txt.f(C.body, { g: P.filter(q => q.ok).length, n: P.length }); }
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
      if (s.level === 1 && this.once('blaze')) this.whisper('blaze');
    } else if (e.k === 'decide') { v.sq = 1; }
    else if (e.k === 'call') {
      const G = this.geo(), p = this.youAt();
      if (e.a) { if (F) F.ring(p[0], p[1] - G.hero * 0.35, 16, { ms: 180 }); v.rings.push({ x: p[0], y: p[1] - G.hero * 0.35, t: 0, ms: 0.6, wavy: e.pred !== 'hawk' }, { x: p[0], y: p[1] - G.hero * 0.35, t: -0.12, ms: 0.72, wavy: e.pred !== 'hawk' }, { x: p[0], y: p[1] - G.hero * 0.35, t: -0.24, ms: 0.84, wavy: e.pred !== 'hawk' }); snd('peep', p[0], p[1]); this.whisper(e.pred === 'hawk' ? 'whistled' : 'called'); }
      else { if (F) F.ring(p[0], G.by, 18, { ms: 200 }); snd('tock', p[0], p[1]); this.whisper(e.slow ? 'slow' : 'silent'); }
      if (typeof Live !== 'undefined') { const A = s.atk; Live.say(Txt.f(C.captions.liveAtk, { i: A.i + 1, a: e.a ? C.labels.called : C.labels.silent, r: A.sr.toFixed(2) })); }
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
      if (!AL_LV[s.level].colony) setTimeout(() => this.whisper(e.ok ? 'good' : 'bad'), 500);
    } else if (e.k === 'ask') { snd('interesting', Stage.w / 2, 80); }
    else if (e.k === 'predicted') { if (typeof Predict !== 'undefined' && Predict.fold) setTimeout(() => Predict.fold(), 650); }
    else if (e.k === 'season') {
      v.mapT = 0; if (F) F.tier(e.auto ? 1 : 2, () => { }); snd('swish', Stage.w / 2, 120);
      if (typeof Live !== 'undefined' && s.c4) { const p = s.c4.p; Live.say(Txt.f(C.captions.liveSeason, { t: e.t, f: Math.round(100 * p[0]), m: Math.round(100 * p[1]) })); }
    }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'al-' + k); },

  /* ---------- input: one verb, Call or Stay silent ---------- */
  call(a) { Sim.act(this, { k: 'call', a: a ? 1 : 0 }); },
  down(x, y) {
    const s = this.sim.s;
    if (s.phase !== 'attack' || !s.atk || (s.atk.st !== 'decide' && s.atk.st !== 'tell')) return;
    const G = this.geo(), dx = x - G.yx, dy = y - G.yy;
    const rr = Math.max(30, G.hero * 0.62); if (dx * dx + dy * dy <= rr * rr) { this.call(1); return; }
    const bx = x - (G.yx + G.hero * 0.85), by = y - G.by; if (bx * bx + by * by <= 34 * 34) { this.call(0); return; }
    this.v.pop = 1; if (this.once('miss')) this.whisper('miss');
  },
  onKey(k) { if (k === 'c' || k === 'C') this.call(1); else if (k === 's' || k === 'S') this.call(0); },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, A = s.atk, st = s.phase === 'attack' && A ? A.st : '', ask = !!(s.ask && this._asking), sig = s.phase + st + ask + (A ? A.pred : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (ask) { Dock.set([{ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } }]); return; }
    if (s.phase === 'attack' && (st === 'tell' || st === 'decide')) { Dock.set([{ id: 'al-call', label: L.call, key: 'c', aria: A.pred === 'hawk' ? 'Whistle' : 'Trill', fn: () => this.call(1) }, { id: 'al-sil', label: L.silentB, key: 's', aria: 'Stay silent', fn: () => this.call(0) }]); return; }
    Dock.set([]);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content, H = C.hud, L = C.labels, n = this.level, A = s.atk; let t = H.over, num = '';
    if (s.ask) t = H[s.ask.id] || H.ask;
    else if (s.phase === 'attack' && A) {
      if (A.vig) t = Txt.f(A.vig === 'f' ? H.vigF : H.vigM, { t: A.i + 1 });
      else if (A.st === 'tell' || A.st === 'decide') t = n === 0 && s.ai === 0 ? C.firstWords : A.pred === 'hawk' ? (!s.hawkSeen ? H.decideHq : H.decideH) : n === 1 ? H.decideB : H.decideC;
      else t = A.st === 'strike' ? H.strike : A.pred === 'hawk' ? H.debriefH : H.debrief;
      num = AL_LV[n].colony ? Txt.f(L.season, { n: s.c4.t + 1, m: AL_C4.T }) : Txt.f(L.attack, { n: Math.min(s.n, s.ai + 1), m: s.n });
    } else if (s.phase === 'season') { t = H.season; num = Txt.f(L.season, { n: s.c4.t, m: AL_C4.T }); }
    else if (s.phase === 'auto') { t = H.auto; num = Txt.f(L.season, { n: s.c4.t, m: AL_C4.T }); }
    else if (s.phase === 'over' && s.c4) num = Txt.f(L.season, { n: s.c4.t, m: AL_C4.T });
    HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const s = this.sim.s, v = this.v;
    if (AL_LV[this.level].colony && s.phase !== 'attack') this.drawMap(c);
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
      const sis = s.level === 1 && m && (m.rel === 'fs' || m.rel === 'hs');   // L2: a sister shows her father's face blaze
      if (al > 0.02) Rig.draw(c, 'squirrel', { pose: st === 'decide' || st === 'tell' ? (i % 2 ? 'down' : 'up') : 'up', blaze: sis ? m.blaze : null, age: 1 }, x, y, { size: G.act, alpha: al, id: id, state: 'idle', t: v.t, flip: x > G.yx });
      if (al > 0.3 || st === 'decide' || st === 'tell') { this.flag(c, 'al-f' + i, s.tags[id], p[0], p[1] - G.act * 0.62, deb ? m : null); if (sis) this.blazeBadge(c, p[0] + 22, p[1] - G.act * 0.62 - 17, 9, m.blaze); }
    });
    // you: freeze upright and trill, or whistle and bolt for the burrow; caught: lifted or dusted
    let yx = G.yx, yy = G.yy, yal = 1;
    if (called && hawk && (st === 'strike' || deb)) { const k = Math.min(1, (st === 'strike' ? t : 1) / 0.35); yx += G.hero * 0.85 * k; yy += (G.by - G.yy) * k; yal = 1 - k; if (deb) { yx = G.yx; yy = G.yy; yal = Math.min(1, t / 0.4); } }
    if (A.you && (st === 'strike' || deb) && v.lift) { const k = Math.max(0, v.lift.t - 0.26); if (hawk) { yy -= k * 260; yal = Math.max(0, 1 - k); } else yal = Math.max(0, 1 - k * 3); if (deb && v.lift.t >= 1.2) { yal = Math.min(1, (t - 0.2) / 0.5); yy = G.yy; } }
    if (yal > 0.02) {
      const ph = { pose: st === 'tell' || st === 'decide' ? 'up' : called && !hawk ? 'up' : 'up', blaze: s.yb || null, call: called && !hawk && st === 'strike', age: 1 };
      Rig.draw(c, 'squirrel', ph, yx, yy, { size: G.hero * (1 + 0.06 * Det.sin(Math.PI * v.sq)), alpha: yal, halo: true, id: 'you', state: 'idle', t: v.t });
      Lbl.put('al-you', this.content.labels.you, yx, yy + G.hero * 0.62, { size: 13 });
      if (s.level === 1 && s.yb) { this.blazeBadge(c, yx - G.hero * 0.62, yy - G.hero * 0.3, 11, s.yb); if (s.ai < 3) Lbl.put('al-yb', this.content.labels.yourBlaze, yx - G.hero * 0.62, yy - G.hero * 0.3 - 22, { size: 12 }); }
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
    Lbl.put(id, t == null ? '?' : AL_GLYPH[t], x, by + h / 2, { size: 16, pill: false, mono: true, ink: '#1B1612' });
    if (truth) {   // the debrief: true r under the flag; a mismatch rings in selection ink with ≠
      const tr = this.sim.tagOf(truth.rel), bad = tr !== t;
      Lbl.put(id + 't', Txt.f(this.content.labels.trueR, { r: AL_GLYPH[tr] }), x, y + 50, { size: 12, ink: bad ? '#F4EEDD' : '#1B1612', bg: bad ? '#9E3412' : undefined });
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
    const show = A.st === 'strike' || A.st === 'debrief', unknownC = AL_LV[s.level].hawk && A.pred === 'hawk' && !s.hawkSeen && !show;   // the first hawk: its cost shows only once you have called
    c.save(); c.fillStyle = 'rgba(244,238,221,.88)'; rrect(c, x0 - 6, y - h / 2 - 6, w + 12, h + 12, 8); c.fill(); c.strokeStyle = 'rgba(27,22,18,.5)'; c.lineWidth = 1; c.stroke();
    c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(0), y - h / 2 - 3); c.lineTo(X(0), y + h / 2 + 3); c.stroke();
    if (show) {
      let acc = 0; A.nb.forEach((id, i) => { const m = this.sim.member(s, id), q = AL_REL[m.rel] * AL_B; if (q <= 0) return; c.fillStyle = i % 2 ? '#8E7FC9' : '#6E5AA8'; c.fillRect(X(acc), y - h / 2, X(acc + q) - X(acc), h); c.strokeStyle = '#1B1612'; c.lineWidth = 1; c.strokeRect(X(acc), y - h / 2, X(acc + q) - X(acc), h); acc += q; });
      if (!unknownC) { const cx = X(C); c.lineWidth = 3; c.strokeStyle = '#1B1612'; c.beginPath(); c.moveTo(cx, y - h / 2 - 6); c.lineTo(cx, y + h / 2 + 6); c.stroke(); }
      const box = Lbl.put('al-led', unknownC ? L.costQ : (A.sr * AL_B > C ? L.pays : L.silentPays), G.W / 2, y - h - 4, { size: 12 });
      if (!unknownC) Lbl.put('al-ledc', C < 0 ? L.saves : L.cost, X(C), y + h / 2 + 12, { size: 12, bg: C < 0 ? '#D9D1EE' : undefined });
      Lbl.put('al-ledr', Txt.f(L.sr, { v: (Math.round(A.sr * 1000) / 1000).toString() }), x0 + 2, y - h - 4, { size: 12, align: 'left', mono: true });
    } else { Lbl.put('al-led', unknownC ? L.costQ : '?', X(0) + 30, y, { size: 13, pill: false, ink: '#1B1612' }); Lbl.put('al-ledk', L.ledger, x0 + w - 4, y, { size: 12, align: 'right', pill: false, ink: '#1B1612' }); }
    c.restore();
  },
  drawChips(c, G, A) {   // the vignette's role: a daughter at home or a son among strangers
    const L = this.content.labels; if (A.vig) Lbl.put('al-vig', A.vig === 'f' ? L.daughters : L.sons, G.W - 10, G.top + 12, { size: 12, align: 'right' });
  },
  /* L3: the colony from above, between the vignettes: six burrow clusters of real squirrels (daughters at home, sons that
     arrived from other clusters); a caller rears up with a wavy call ring; the genotype read-out (A calling, a silent) sits
     at each squirrel's feet, at the locus its sex expresses (D6 decision 10: the organisms are the picture) */
  drawMap(c) {
    const s = this.sim.s, v = this.v, G = this.geo(), C4 = s.c4, L = this.content.labels, p = C4.p, t = C4.t, calm = typeof Fx !== 'undefined' && Fx.calm;
    this.bake(Object.assign({}, G, { sky: G.top + 6 })).blit(c, 0, 0);
    const cols = G.W > 700 ? 3 : 2, rows = Math.ceil(6 / cols), cw = (G.W - 20) / cols, chh = (G.ledY - G.top - 60) / rows, ex = cw * 0.44, ey = chh * 0.42, sz = clamp(Math.min(ex, ey) * 0.42, 26, 46), cen = [];
    for (let k = 0; k < 6; k++) cen.push([10 + cw * (k % cols + 0.5), G.top + 30 + chh * (Math.floor(k / cols) + 0.5)]);
    const mover = s.phase === 'season' ? clamp(v.mapT / 0.9, 0, 1) : 1;
    for (let k = 0; k < 6; k++) {   // a mound of bare earth with burrow mouths, then daughters (upright) and sons (on all fours)
      const [x, y] = cen[k]; c.fillStyle = 'rgba(150,120,80,.55)'; c.beginPath(); c.ellipse(x, y + ey * 0.15, ex, ey * 0.8, 0, 0, TAU); c.fill();
      for (let b = 0; b < 3; b++) this.burrow(c, x + (b - 1) * ex * 0.55, y + ey * 0.45, 8);
      for (let i = 0; i < 6; i++) {
        const male = i >= 4;
        let px = x + (male ? (i === 4 ? -0.62 : 0.62) : (-0.42 + 0.28 * (i % 4))) * ex, py = y + (male ? 0.18 : -0.22 + 0.3 * (i >= 2 ? 1 : 0) - 0.1) * ey;
        if (male && mover < 1) { const [fx, fy] = cen[(k + 1 + i) % 6]; px = lerp(fx, px, mover); py = lerp(fy, py, mover); }   // sons arrive from other clusters each winter
        const loc = male ? 1 : 0, a1 = this.hrand(k * 9 + i, t * 2 + loc * 101) < p[loc] ? 0 : 1, a2 = this.hrand(k * 9 + i, t * 2 + 1 + loc * 101) < p[loc] ? 0 : 1, caller = a1 === 0 || a2 === 0;
        Rig.draw(c, 'squirrel', { pose: male ? 'down' : 'up', blaze: null, age: 1, call: caller && !male }, px, py, { size: sz, id: 'm' + k + '_' + i, state: 'idle', t: v.t, flip: (i % 2) === 1 });
        if (caller && !calm) { c.save(); c.strokeStyle = 'rgba(27,22,18,.55)'; c.lineWidth = 1.4; const ph = (v.t * 0.9 + i * 0.37 + k * 0.21) % 1, rr = 6 + ph * 12; c.globalAlpha = 1 - ph; c.beginPath(); c.arc(px, py - sz * 0.45, rr, -2.4, -0.7); c.stroke(); c.restore(); }
        if (typeof Pal !== 'undefined') Pal.genotype(c, px + sz * 0.38, py + sz * 0.34, 6, a1, a2);   // the read-out beside the animal: A calling copy, a silent copy
      }
    }
    Lbl.put('al-mapd', L.daughters, 10, G.top + 12, { size: 12, align: 'left' });
    Lbl.put('al-maps', L.sons, G.W - 10, G.top + 12, { size: 12, align: 'right' });
    Lbl.put('al-mapt', Txt.f(L.season, { n: t, m: AL_C4.T }), G.W / 2, G.ledY + 4, { size: 13, mono: true });
    Lbl.put('al-mapx', L.xN, G.W / 2, G.ledY - 22, { size: 12, bg: 'rgba(244,238,221,.8)' });
    Lbl.put('al-keyA', L.keyA, 10, G.ledY + 4, { size: 12, align: 'left' }); Lbl.put('al-keya', L.keya, G.W - 10, G.ledY + 4, { size: 12, align: 'right' });
  },

  /* ---------- the live graph (strip) and the debrief chart ---------- */
  notes() {
    const s = this.sim.s, n = this.level, L = this.content.labels, cap = this.content.captions, over = s.phase === 'over', stats = [];
    if (!AL_LV[n].colony) {
      const R = s.recs || [], ok = R.filter(r => r.ok).length; stats.push([L.sAtk, Math.min(s.n, s.ai + 1) + ' / ' + s.n, ''], [L.sOk, ok + ' / ' + R.length, cap.mOk]);
      const xs = { lo: 0, hi: s.n + 1, label: L.attackAx };
      const S = [{ label: L.called, shape: 'disc', ink: 'ink', pts: R.map((r, i) => r.a === 1 ? [i + 1, r.sr] : null).filter(Boolean) }, { label: L.silent, shape: 'square', pts: R.map((r, i) => r.a === 0 ? [i + 1, r.sr] : null).filter(Boolean) }];
      const sp = { type: 'scatter', title: L.tKin, x: xs, y: { lo: 0, hi: 2, label: L.sumR }, series: S, frame: 'designed' };
      if (n !== 0 || over) sp.ghost = [[0, 0.55], [s.n + 1, 0.55]];   // the trill's break-even, Σr = 0.55, once you have called it
      return { stats, charts: [sp] };
    }
    const C = s.c4, xs = { lo: 0, hi: AL_C4.T, label: L.seasonAx }, ys = { lo: 0, hi: 1, fmt: 'pct' };
    stats.push([L.sSeason, C.t + ' / ' + AL_C4.T, ''], [L.sF, Math.round(100 * C.p[0]) + '%', cap.mF], [L.sM, Math.round(100 * C.p[1]) + '%', cap.mM]);
    const R = s.recs || [], vF = R.filter(r => r.vig === 'f'), vM = R.filter(r => r.vig === 'm');
    if (vF.length) stats.push([L.sVigF, vF.filter(r => r.a).length + ' / ' + vF.length, '']); if (vM.length) stats.push([L.sVigM, vM.filter(r => r.a).length + ' / ' + vM.length, '']);
    const ghost = i => over && s.exp4path ? [{ d: s.exp4path.map(q => [q[0], q[i + 1]]), label: L.model }] : [];
    const f = { type: 'trace', title: L.tFem, x: xs, y: ys, series: [{ d: C.hist.map(q => [q[0], q[1]]), ink: 'A', label: L.females }], ghost: ghost(0), frame: 'designed' };
    const m = { type: 'trace', title: L.tMale, x: xs, y: ys, series: [{ d: C.hist.map(q => [q[0], q[2]]), ink: 'A', label: L.males }], ghost: ghost(1), frame: 'designed' };
    return { stats, charts: [f, m] };
  },
  debrief() {
    const s = this.sim.s, spec = this.notes().charts[0]; if (!spec) return null;
    if (s.pred && s.pred.be != null && spec.type === 'scatter') spec.you = { x: (s.n || 8) + 0.5, y: s.pred.be, label: 'you' };
    return spec;
  }
};
V2.push(CH_ALARM_V2);

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.alarm = AL_TEXT.take;
  MODEL.alarm = 'Belding’s ground squirrels in a meadow: a call costs the caller risk C and saves each warned neighbour risk B = 0.4, so it pays when Σr × B > C. The trill costs 0.22; the whistle saves its caller. Calling alleles act in one sex each; dispersal sets who lives among kin.';
  RECALL.alarm = { q: 'A trill costs 0.22 and saves each neighbour 0.4. Beside one sister and one cousin, should you trill?', opts: [['yes', 'Yes: ½ + ⅛ = 0.625'], ['no', 'No: it costs you'], ['half', 'Only for the sister']], ans: 'yes', why: 'Σr × 0.4 = 0.25, more than the cost of 0.22.' };
  BRIDGE.alarm = 'So far each animal served only its own young. Here relatives share your genes by descent, so helping them can pay.';
  if (TRANSFER.alarm) delete TRANSFER.alarm;
}
