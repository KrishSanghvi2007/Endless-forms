/* ================= v2/hawks.js: Hawks and Doves (id 'hawks'), the Wave 2 rebuild of a favourite =================
   D1 §3.4, D5 §4 item 3, D6 (decision 9: four levels, one verb, one prediction). The duel is the camera; a beach of 150
   hermit crabs is the stage. You are one crab (role: a behaving animal). Each duel you play Hawk (escalate) or Dove (display,
   back off if the rival escalates): that tap is the chapter's only verb. Your choices over your last eight duels are your rule;
   from L2 on your newest young carry it (older kin keep the rule they were born with), and every four duels a tide resizes
   every lineage by its payoff (Wright–Fisher through WF). Opponents come from the beach, so as your lineage spreads you meet
   your own kin. Levels add one idea each: the payoffs; your rule as a lineage, which stalls at V/C; a prize worth more than a
   fight costs, then the one prediction (where does a new beach settle?); and who owns the shell (Bourgeois).
   Headless sim (R(), Det, WF only), stars against the expectation, juice from Sim.run's events only (API_v2 §6.1). */

const HK_N = 150;                        // crabs on the beach
// timers (s): a rival waits face s for your pick (the first duel of a level waits for ever), then you display; dbl: a tap
// within this long of a clash is a double tap, not a pick for the next rival
const HK_T = { walk: 0.45, tele: 0.2, face: 5.5, clash: 0.95, tide: 1.3, ask: 12, auto: 0.7, nb: 0.55, dbl: 0.3 };
const HK_ASK = { nb: { kind: 'y', lo: 0, hi: 1, tol: 0.08, step: 0.025 } };   // the chapter's one prediction: the new beach's hawk share
const HK_NB = { V: 6, C: 8, B: 4, T: 8, h0: 0.5 };   // L3's new beach at 50% hawks, ESS at V/C = 0.75
const HK_CTX = {   // contexts of a duel: d = the rival's size minus yours (sized), or −1 you own / +1 the rival owns (roles)
  sized: { ds: [[-2, 0.2], [-1, 0.2], [0, 0.2], [1, 0.2], [2, 0.2]], w: [0.4, 0.2, 0.4] },
  roles: { ds: [[-1, 0.5], [1, 0.5]], w: [0.5, 0, 0.5] }
};
const HK_LV = [   // per level: payoffs, baseline fitness B (w = B + payoff), tides, duels a tide, the start, your lineage, the V/C rope, the What if? tide
  { V: 4, C: 10, B: 5, T: 3, dpt: 4, types: [['H', 1, 128], ['D', 0, 22]], you: 0, post: 'p', levers: ['cheap', 'costly'], wi: 1 },
  { V: 4, C: 10, B: 5, T: 8, dpt: 4, g: 6, types: [['D', 0, 146]], you: 4, floor: 2, post: 'p', rope: 3, levers: ['cheap', 'dove'], wi: 1 },
  { V: 8, C: 4, B: 6, T: 3, dpt: 4, types: [['H', 1, 37], ['D', 0, 112]], you: 1, post: 'p', nb: true, levers: ['costly4', 'allDove'], wi: 1 },
  { V: 4, C: 10, B: 4, T: 8, dpt: 4, g: 6, roles: true, types: [['H', 1, 50], ['D', 0, 75]], you: 25, floor: 3, hatch: 2, post: 'f', levers: ['sizes', 'intruder'], wi: 1 }
];

const HK_TEXT = {
  firstWords: 'One empty shell. Hawk fights; Dove displays and backs off. Tap Hawk or Dove.',
  intro: {   // the opening description card (D6 decision 8; 00_entry.js Intro): 1–2 sentences, ≤ 35 words each
    game: 'You are a hermit crab on a busy beach, contesting empty shells with rivals. From level 2 your young carry your rule, which spreads or fades with its payoff.',
    biology: 'Evolutionarily stable strategies: a rule’s payoff depends on what the others do. When fights cost more than the shell is worth, hawks settle at V/C, shell ÷ injury.',
    how: 'Tap Hawk to fight or Dove to back off (or use the arrow keys). Win shells, and watch the posts: each one shows the hawk share at a tide.'
  },
  hud: {
    duel0: 'Hawk fights; Dove backs off. Most crabs on this beach are hawks.',
    duel1a: 'Every other crab is a dove. Your young will play your picks.',
    duel1: 'Your newest young play your last eight picks. Watch the ringed crabs.',
    duel2: 'Big shells, cheap fights. Hawk or Dove?',
    duel3a: 'One crab now owns the shell. Does that change your pick?',
    duel3: 'Your newest young play your rule as owner and as intruder.',
    tide: 'The tide turns. Crabs that did well leave more young.',
    nb: 'New beach: shell 6, injury 8. Drag the marker to where hawks will settle.',
    nbrun: 'Watch the new beach. Better-paid crabs leave more young.',
    auto: 'What if? The beach runs on with one thing changed.',
    over: 'The level is done.'
  },
  whispers: {
    injured: 'Hurt! Hawk met hawk.', wonfight: 'Hawk met hawk, and you won.', backed: 'You backed off. Nothing lost.',
    took: 'It backed off. The shell is yours.', display: 'Two doves display. One gives way.', lostdisplay: 'Two doves display. You gave way.',
    kin: 'Your own kin! It plays its rule.', hatched: 'Your brood hatched with your rule.', slow: 'Too slow, so you displayed.', queued: 'Ready for the next rival.', early: 'Wait for the next rival.',
    miss: 'Tap the rival to fight, yourself to display.', newbeach: 'A new beach.',
    vc: 'Rope: V/C. There Hawk and Dove earn equally.'
  },
  labels: {
    you: 'you', rival: 'rival', hawk: 'hawk', dove: 'dove', kin: 'your kin', hawkPad: 'Hawk', dovePad: 'Dove', tapH: 'tap: fight', tapD: 'tap: display',
    posts: 'hawks', postsKin: 'your kin', rope: 'V/C = {v}', tide: 'Tide {n}/{m}', score: 'payoff {n}',
    hawks: 'hawks', expected: 'expected', vc: 'V/C', perDuel: 'per duel', tideAxis: 'tide',
    meanPay: 'mean', worth: 'shell {n}', costs: 'injury {n}', lapse: 'Tides passing', gens: '×{g} generations', lock: 'Lock in',
    picks: 'picks: {k}/{n} hawk', rule: 'rule: {k}/{n} hawk', ruleOwn: 'owner: {k}/{n} hawk', ruleInt: 'intruder: {k}/{n} hawk', noPicks: 'no picks yet',
    owner: 'owner', intruder: 'intruder', youOwn: 'you · owner', rivalOwn: 'rival · owner', payNow: 'mean pay {v}', call: 'your call', third: 'a third', newBeach: 'New beach',
    tHawk: 'Hawk share', tPays: 'What each pays', tKin: 'Your kin', tMean: 'Mean payoff', tNew: 'New beach',
    sTide: 'Tide', sHawk: 'Hawk share', sKin: 'Your kin', sScore: 'Your payoff', sEarn: 'You vs average', sMean: 'Mean payoff', sRule: 'Your rule', sPH: 'Hawk pays', sPD: 'Dove pays'
  },
  panels: [],
  interesting: {
    nofight: 'You never played Hawk. Hawk against hawk costs 10 half the time. Try What if? to change the cost.',
    nospread: 'Your lineage never spread. On a dove beach a hawk wins every shell, but your crabs mostly displayed.',
    blind: 'Your rule ignored who owned the shell, so it earned what the residents earned. Nothing spread.',
    paradox: 'Your crabs fought as intruders and gave way as owners. That convention can work too, but in nature it is rare.',
    cheap: 'Fights got cheap, so Hawk paid against anyone. Hawks took the beach.',
    cheapSome: 'Fights got cheap, so hawks kept rising. Given more tides they would take the beach.',
    cheapNone: 'Fights got cheap, but none of your crabs played Hawk. With no hawks to select, nothing changed.',
    costly: 'With fights costing 20, hawks settled near V/C, about one crab in five.',
    costlyFar: 'With fights costing 20, hawks fell towards V/C, one crab in five, but had not got there yet.',
    costlyLow: 'With fights costing 20, hawks fell to V/C, one crab in five, and drift took them lower.',
    dove: 'Your crabs played Dove from tide 1, so hawks never spread. Among doves, a dove earns what everyone earns.',
    costly4: 'Fights now cost 12, more than the shell. Hawks settled near two crabs in three.',
    costly4Far: 'Fights now cost 12, so the beach moved towards two hawks in three. It had not settled there yet.',
    costly4None: 'Dove now pays more against hawks, but no doves were left, so nothing changed. Selection needs variation.',
    allDove: 'Even from a dove beach, hawks took over, and everyone’s payoff fell.',
    allDoveSlow: 'From one hawk lineage, hawks began to spread and the mean payoff began to fall.',
    allDoveNone: 'Hawk paid more on the dove beach, but from one crab drift kept hawks from spreading this time.',
    sizes: 'Now rival size matters. An assessor fights only rivals no bigger than itself, and it spread.',
    sizesDown: 'Now rival size matters. An assessor should spread, but from a small start drift held it back.',
    intruder: 'Intruders-win spread too. Once common, either convention is stable; in nature, owners usually win.',
    intruderDown: 'Intruders-win shrank this time. A convention pays only once common, and drift decides the early steps.'
  },
  levers: {
    cheap: 'Cheap fights', costly: 'Costly fights', dove: 'You play Dove', costly4: 'Costly fights', allDove: 'Start all doves', sizes: 'Sizes matter', intruder: 'Intruders win'
  },
  take: 'Hawks spread until fighting stops paying: at a hawk share of V/C, hawks and doves do equally well.',
  body: 'The key number is V/C, shell ÷ injury. Below it Hawk pays more, above it Dove does, so the beach settles there. If V ≥ C, hawks take over. A cue such as ownership can end the fighting altogether.',
  law: { title: 'The unbeatable mix' },
  boss: { inverts: 'On Big shells one rule took the beach. Here ownership ends the fighting.' },
  stars: {   // the unit's hints; each level's card shows only the stars that level can give (captions s<n><d|p|t>)
    discover: 'Spread your hawks, or witness the big-shell tragedy.',
    predict: 'Call where hawks settle on a new beach, from V and C.',
    transfer: 'Carry the idea to ownership: spread a convention.'
  },
  captions: {
    take0: 'Hawk pays against doves and hurts against hawks. With many hawks around, fighting costs more than it wins.',
    take1: 'Your hawks spread on a dove beach, then stalled at V/C = 4/10 = 0.4. There Hawk and Dove pay the same, so neither can spread further.',
    take2: 'When shells are worth more than injuries cost, hawks take over, even though everyone then earns less. When V < C, hawks settle at V/C.',
    take3: 'Owning a shell makes no crab stronger, yet owner-wins spreads and ends the fighting. An arbitrary convention can be stable.',
    s0d: 'Try Hawk, then out-earn the average crab as hawks decline.',
    s1d: 'Spread your hawks past 20% while out-earning the average crab.',
    s2d: 'Play what pays while hawks take over and the mean payoff falls.',
    s2p: 'Call where hawks settle on the new beach: shell 6, injury 8.',
    s3t: 'Spread a rule that reads who owns the shell to a third of the beach.',
    liveTide: 'Tide {t}. Hawks {p} percent. Your kin {f} percent.',
    liveDuel: 'You played {a}. Payoff {r}.',
    liveOwn: 'You own this shell.',
    liveInt: 'The rival owns this shell.',
    mHawk: 'Share of duels in which a crab escalates.',
    mKin: 'Crabs that carry your rule or an older one of yours.',
    mScore: 'Your shells won minus injuries.',
    mEarn: 'What your picks were expected to earn, minus the average crab, per duel.',
    mMean: 'Average payoff per duel on the beach.',
    mPays: 'Expected payoff per duel on this beach.'
  },
  model: [
    { level: 0, simulated: '150 hermit crabs, each with a fixed rule: Hawk escalates, Dove displays and backs off from a hawk. Crabs meet at random. Each tide they leave young in proportion to baseline plus payoff.', simplification: 'The empty shell between the crabs is a designed simplification. Payoffs are symbolic and a fight is a coin toss. Nobody learns, grows or remembers a rival. Counts use a normal approximation above n·p = 30.', params: [{ name: 'crabs', value: 150, tag: 'designed' }, { name: 'shell value V', value: 4, tag: 'designed' }, { name: 'injury cost C', value: 10, tag: 'designed' }, { name: 'baseline fitness B', value: 5, tag: 'designed' }, { name: 'generations a tide', value: 4, tag: 'xN', real: 'about 1/700 (two tides a day, a generation a year)' }], cannot: 'Learning, growth, kin or lasting injuries.', nature: 'Hermit crabs fight over shells. An attacker raps its shell against the defender’s to evict it (Elwood and Briffa 2001). The winner takes the shell. The main cost is energy (Briffa and Elwood 2004). Here C stands for any cost of escalating.', contested: false, refs: ['msp1973', 'eb2001', 'be2004'] },
    { level: 1, simulated: 'Your Hawk share over your last eight duels is your rule. Each tide your newest young take it, and older kin keep the rule they were born with. Opponents come from the whole beach, your kin included.', simplification: 'Your rule starts in a brood of four that never drops below two. Your own crab never dies.', params: [{ name: 'your start', value: '4 crabs', tag: 'designed' }, { name: 'your floor', value: '2 crabs', tag: 'designed' }, { name: 'baseline fitness B', value: 5, tag: 'designed' }, { name: 'generations a tide', value: 6, tag: 'xN', real: 'about 1/700' }], cannot: 'How most new lineages are lost by chance at first.', nature: 'When a behaviour pays more while it is rare, selection is frequency dependent. In scale-eating cichlids the rarer mouth side feeds better (Hori 1993). See Left Jaw, Right Jaw.', contested: false, refs: ['msp1973', 'ms1982', 'hori1993'] },
    { level: 2, simulated: 'Shells are worth 8 and an injury costs 4, so Hawk beats Dove against anyone. Mean payoff is the beach average per duel. Then a new beach: shells worth 6, injuries cost 8, half the crabs hawks, and no player.', simplification: 'Same coin-toss fights; only the prize and the cost changed.', params: [{ name: 'shell value V', value: 8, tag: 'designed' }, { name: 'injury cost C', value: 4, tag: 'designed' }, { name: 'baseline fitness B', value: 6, tag: 'designed' }, { name: 'generations a tide', value: 4, tag: 'xN', real: 'about 1/700' }], cannot: 'Groups competing with groups.', nature: 'Where the prize is worth more than any injury, animals fight hard. Male fig wasps fight to the death inside a fig, where mating chances are few. See Hamilton 1979 and Enquist and Leimar 1990.', contested: false, refs: ['ms1982', 'ham1979', 'el1990'] },
    { level: 3, simulated: 'Each duel one crab owns the shell and the other intrudes, at random. Owning does not change who wins a fight. Your rule is your Hawk share as owner and as intruder. Your brood of 25 hatches at tide 2.', simplification: 'A convention pays only once common. From a few crabs it would only drift, so your brood is large. Roles are drawn afresh each duel. Size matters only in What if?.', params: [{ name: 'win chance, owner or intruder', value: '0.5', tag: 'designed' }, { name: 'win chance, 1 step smaller (What if?)', value: '0.12', tag: 'designed' }, { name: 'win chance, 1 step bigger (What if?)', value: '0.88', tag: 'designed' }, { name: 'win chance, 2 steps smaller or bigger', value: '0.02 or 0.98', tag: 'designed' }, { name: 'your start', value: '25 crabs', tag: 'designed' }, { name: 'baseline fitness B', value: 4, tag: 'designed' }, { name: 'generations a tide', value: 6, tag: 'xN', real: 'about 1/700' }], cannot: 'Why owners might value a shell more, or fight harder.', nature: 'Speckled wood males usually keep their sunspot against intruders (Davies 1978). Later work found that residents often have other advantages (Stutt and Willmer 1998). The paradoxical rule, intruders win, is stable in theory but rare in nature.', contested: false, refs: ['ms1982', 'davies1978', 'stutt1998', 'parker1974'] }
  ],
  why: {
    real: [
      'Hermit crabs fight over shells. An attacker raps its shell against the defender’s to evict it (Elwood and Briffa 2001). Red deer stags roar and walk side by side first (Clutton-Brock and colleagues 1979). Most of their fights are between evenly matched stags.',
      'Ownership can settle contests too. Speckled wood males usually keep their sunspot against intruders (Davies 1978). Later work found that residents often have other advantages (Stutt and Willmer 1998). The paradoxical rule, intruders win, is stable in theory but rare in nature.'
    ],
    maths: [
      'Prize V, injury cost C. Hawk meets hawk: (V − C)/2 on average. Hawk meets dove: V. Dove meets hawk: 0. Dove meets dove: V/2. With a hawk share p, hawk and dove pay the same when p = V/C. This needs V < C. If V ≥ C, Hawk always pays more and hawks take over (Big shells).',
      'An ESS is a rule that, once common, no rare rule can beat (Maynard Smith and Price 1973). At V/C every rule earns the same against the residents. A rare mutant only drifts, and once common it does worse. Owner-wins is an ESS too: two owner-wins crabs never fight.'
    ]
  }
};

const HK_hit = (s, id) => id != null && s.pred[id] != null && s.exp[id] != null && Math.abs(s.pred[id] - s.exp[id]) <= HK_ASK.nb.tol + 1e-9;

const CH_HAWKS_V2 = {
  id: 'hawks', v2: true, role: 'animal', place: 'shore', accent: '#23998B',   // the chapter's chrome tint (D6 decision 7)
  intro: { goal: 'Win shells as Hawk or Dove; watch your rule spread or stall.' },
  content: HK_TEXT,
  P: {
    N: { v: HK_N, tag: 'designed', min: 50, max: 300, label: 'crabs' },
    g: { v: 4, tag: 'xN', min: 1, max: 8, real: 'about 1/700 generation a tide', label: 'generations a tide' },
    k: { v: 2, tag: 'designed', min: 0, max: 4, label: 'size advantage' }
  },
  levels: [
    { name: 'The tide pool', adds: 'fight payoffs', codes: ['E1'], minutes: 1.5 },
    { name: 'The mutant', adds: 'your rule as a lineage; hawks settle at V/C', codes: ['E2', 'E3'], minutes: 3 },
    { name: 'Big shells', adds: 'a prize worth more than a fight costs; then call a new beach', codes: ['E4'], minutes: 2 },
    { name: 'Owners', adds: 'who owns the shell', codes: ['E5'], minutes: 3 }
  ],
  keys: { ArrowLeft: 'play Dove', ArrowRight: 'play Hawk', D: 'play Dove', H: 'play Hawk', Enter: 'lock in' },
  untimed: true,
  teacher: { prompts: ['Why did hawks decline on the tide pool, and where did they stop?', 'Shells are worth 6 and injuries cost 8. Where should hawks settle, and why there?', 'Real crabs grow, learn and remember rivals. Which missing piece would most change these results?'], pool: 'trace' },
  starTraits: ['hawk', 'dove'],
  encodings: [   // two inherited rules: Hawk blue with claws up, Dove amber with claws down (D4 §2.2 rule 4); your lineage wears the you-halo
    { k: 'hawk', rgb: [107, 151, 255], channels: ['colour', 'shape'] },
    { k: 'dove', rgb: [242, 201, 76], channels: ['colour', 'shape'] },
    { k: 'kin', rgb: [232, 223, 201], channels: ['shape'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    // ---- parameters, contexts, payoffs ----
    mode(s) { const L = HK_LV[s.level]; return s.ov && s.ov.sized ? 'sized' : L.roles ? 'roles' : null; },   // a level whose duels have a cue
    par(s) {
      const L = HK_LV[s.level], o = s.ov || {}, P = CH_HAWKS_V2.P;
      return { V: o.V != null ? o.V : L.V, C: o.C != null ? o.C : L.C, B: o.B != null ? o.B : L.B, k: this.mode(s) === 'sized' ? P.k.v : 0, g: L.g || P.g.v, N: P.N.v | 0 };
    },
    ctx(d) { return d < 0 ? 0 : d === 0 ? 1 : 2; },   // 0: you hold the edge (smaller rival, or you own), 1: equal, 2: the rival holds it
    pw(d, k) { return k ? 1 / (1 + Det.exp(k * d)) : 0.5; },   // chance that a crab d size steps smaller than its rival wins an escalated fight; k = 0: a coin toss
    pi(a, b, V, C) { return a * b * (V - C) / 2 + a * (1 - b) * V + (1 - a) * (1 - b) * V / 2; },   // escalation probabilities a vs b
    payC(e1, e2, P, M) {   // a level with cues: averaged over the contexts; the rival sees each context from its side
      let t = 0;
      for (const [d, w] of M.ds) { const a = e1[this.ctx(d)], b = e2[this.ctx(-d)], p = this.pw(d, P.k); t += w * (a * b * (p * P.V - (1 - p) * P.C) + a * (1 - b) * P.V + (1 - a) * (1 - b) * P.V / 2); }
      return t;
    },
    wts(s) { const m = this.mode(s); return m ? HK_CTX[m].w : [1 / 3, 1 / 3, 1 / 3]; },
    hp(e, w) { return w[0] * e[0] + w[1] * e[1] + w[2] * e[2]; },   // a rule's share of duels escalated, each context weighted by how often it occurs
    shares(n) { let t = 0; for (const v of n) t += v; return Array.prototype.map.call(n, v => t ? v / t : 0); },
    kin(t) { return !!t && (t.id === 'Y' || t.id === 'K'); },   // Y: your newest young (your current rule); K: older cohorts of your lineage
    kinShare(x, types) { let f = 0; for (let j = 0; j < x.length; j++) if (this.kin(types[j])) f += x[j]; return f; },
    // expected payoff per duel of each type against a beach with shares x (each crab meets the beach average)
    E(s, x, types) {
      const P = this.par(s), m = this.mode(s);
      if (m) { const M = HK_CTX[m]; return types.map(ti => { let e = 0; for (let j = 0; j < types.length; j++) if (x[j]) e += x[j] * this.payC(ti.e, types[j].e, P, M); return e; }); }
      let q = 0; for (let j = 0; j < types.length; j++) q += x[j] * types[j].e[1];
      return types.map(ti => this.pi(ti.e[1], q, P.V, P.C));
    },
    // the expected payoff of playing a (1 Hawk, 0 Dove) in context d against a crab drawn from the beach
    expPick(s, a, d) {
      const P = this.par(s), x = this.shares(s.n), m = this.mode(s), p = m ? this.pw(d, P.k) : 0.5; let e = 0;
      for (let j = 0; j < x.length; j++) { if (!x[j]) continue; const b = s.types[j].e[m ? this.ctx(-d) : 1]; e += x[j] * (a * b * (p * P.V - (1 - p) * P.C) + a * (1 - b) * P.V + (1 - a) * (1 - b) * P.V / 2); }
      return e;
    },
    fit(s, E) { const B = this.par(s).B; return E.map(e => Math.max(0.01, B + e)); },
    // ---- your rule: the share of Hawk over your last eight duels in each context (L5: as owner, as intruder) ----
    rule(s) {
      if (s.fix) return s.fix.slice();
      const c = s.c, m = a => { let t = 0; for (const v of a) t += v; return t / a.length; }, mode = this.mode(s);
      const dflt = [0, 1, 2].map(k => {   // where you have no record yet, your crabs behave like the residents
        let w = 0, e = 0; if (s.types) for (let j = 0; j < s.types.length; j++) if (!this.kin(s.types[j])) { w += s.n[j]; e += s.n[j] * s.types[j].e[k]; }
        return w > 0 ? e / w : 0.5;
      });
      if (!mode) { const v = c[1].length ? m(c[1]) : dflt[1]; return [v, v, v]; }
      const r = [0, 1, 2].map(k => c[k].length ? m(c[k]) : dflt[k]);
      if (mode === 'roles') r[1] = (r[0] + r[2]) / 2;   // an owner never meets an equal: the middle slot is unused
      return r;
    },
    same(a, b) { for (let k = 0; k < 3; k++) if (Math.round(8 * a[k]) !== Math.round(8 * b[k])) return false; return true; },   // rules equal to the nearest eighth
    // at a tide your newest young take your current rule, and older kin keep the rule they hatched with (cohorts merge by
    // rule). Your first brood hatches with your first picks (L5: your first eight duels). → {to, n} when kin moved to a cohort.
    inherit(s, rr) {
      const y = s.you, L = HK_LV[s.level]; if (y < 0) return null; const Y = s.types[y];
      if (s.tide < (L.hatch || 1) || this.same(Y.e, rr)) { Y.e = rr.slice(); return null; }
      const keep = Math.min(s.n[y], L.floor || 1), move = s.n[y] - keep; let j = -1;
      if (move > 0) {
        for (let i = 0; i < s.types.length; i++) if (i !== y && s.types[i].id === 'K' && this.same(s.types[i].e, Y.e)) { j = i; break; }
        if (j < 0) { s.types.push({ id: 'K', e: Y.e.slice() }); s.n.push(0); j = s.types.length - 1; }
        s.n[j] += move; s.n[y] = keep;
      }
      Y.e = rr.slice();
      return move > 0 ? { to: j, n: move } : null;
    },
    inheritX(st, types, x, rr) {   // inherit() on shares, for the deterministic projection
      const y = st.you, L = HK_LV[st.level], Y = types[y];
      if (st.tide < (L.hatch || 1) || this.same(Y.e, rr)) { Y.e = rr.slice(); return x; }
      const keep = Math.min(x[y], (L.floor || 1) / HK_N), move = x[y] - keep; let j = -1;
      for (let i = 0; i < types.length; i++) if (i !== y && types[i].id === 'K' && this.same(types[i].e, Y.e)) { j = i; break; }
      x = x.slice(); if (j < 0) { types.push({ id: 'K', e: Y.e.slice() }); x.push(0); j = types.length - 1; }
      x[j] += move; x[y] = keep; Y.e = rr.slice(); return x;
    },
    // ---- the record of one tide (sufficient for every chart and star) ----
    rec(s) {
      const x = this.shares(s.n), L = HK_LV[s.level], E = this.E(s, x, s.types); let mp = 0; for (let i = 0; i < x.length; i++) mp += x[i] * E[i];
      const r = { t: s.tide, n: Array.from(s.n), f: this.kinShare(x, s.types), mp };
      const P = this.par(s), rr = this.rule(s), w = this.wts(s), m = this.mode(s); let p = 0; for (let j = 0; j < x.length; j++) p += x[j] * this.hp(s.types[j].e, w);
      r.p = p; r.r = rr;
      if (m) { const M = HK_CTX[m]; let eH = 0, eD = 0; for (let j = 0; j < x.length; j++) { eH += x[j] * this.payC([1, 1, 1], s.types[j].e, P, M); eD += x[j] * this.payC([0, 0, 0], s.types[j].e, P, M); } r.eH = eH; r.eD = eD; }
      else { let q = 0; for (let j = 0; j < x.length; j++) q += x[j] * s.types[j].e[1]; r.eH = this.pi(1, q, P.V, P.C); r.eD = this.pi(0, q, P.V, P.C); }
      if (s.you >= 0) { let er = 0, wr = 0; for (let j = 0; j < x.length; j++) if (!this.kin(s.types[j])) { er += x[j] * E[j]; wr += x[j]; } r.adv = E[s.you] - (wr ? er / wr : 0); }
      if (L.roles) {   // your kin that follow a convention (owner-wins or intruder-wins)
        let fc = 0; for (let j = 0; j < x.length; j++) { const e = s.types[j].e; if (this.kin(s.types[j]) && Math.abs(e[0] - e[2]) >= 0.5) fc += x[j]; }
        r.fc = fc;
      }
      return r;
    },
    // your edge over the residents if your lineage held a share f and played rule rr (the oracle's invasion test; deterministic)
    edge(s, f, rr) {
      if (s.you < 0) return 0;
      const types = [], n = []; for (let j = 0; j < s.types.length; j++) if (!this.kin(s.types[j])) { types.push({ id: s.types[j].id, e: s.types[j].e.slice() }); n.push(s.n[j]); }
      const tot = n.reduce((a, v) => a + v, 0), x = n.map(v => tot ? (1 - f) * v / tot : 0); types.push({ id: 'Y', e: (rr || this.rule(s)).slice() }); x.push(f);
      const E = this.E(s, x, types); let er = 0, wr = 0; for (let j = 0; j < x.length - 1; j++) { er += x[j] * E[j]; wr += x[j]; }
      return E[x.length - 1] - (wr ? er / wr : 0);
    },
    build(level) {
      const L = HK_LV[level], types = [], n = [];
      for (const [id, e, c] of L.types) { types.push({ id, e: [e, e, e] }); n.push(c); }
      let you = -1; if (L.you) { you = types.length; types.push({ id: 'Y', e: [0.5, 0.5, 0.5] }); n.push(L.you); }
      return { types, n, you };
    },
    reset(level, o) {
      o = o || {};
      if (o.thaw) {   // What if?: a frozen tide, one thing changed, then the beach runs on by itself. The realised record stays;
        this.restore(o.thaw.snap); const s = this.s; s.log = []; s.whatif = o.thaw.lever; s.ask = null;   // the changed beach is a new, marked point
        const before = s.hist[s.hist.length - 1]; this.lever(s, o.thaw.lever);
        s.phase = 'auto'; s.pt = 0; s.endT = Math.max(HK_LV[s.level].T, s.tide + 5);
        const r = this.rec(s); r.wi = true; s.hist.push(r); s.wi0 = { tide: s.tide, before, r1: r }; return;
      }
      const L = HK_LV[level], b = this.build(level);
      this.s = { level, phase: 'duel', pt: 0, time: 0, tide: 0, endT: L.T, types: b.types, n: b.n, you: b.you, c: [[], [], []], q: null, duel: null,
        score: 0, wins: 0, inj: 0, hh: 0, dn: 0, nh: 0, k: 0, kinN: 0, eY: 0, eM: 0, dl: [], hist: [], asks: [], askQ: {}, at0: {}, ask: null, pred: {}, exp: {},
        nb: null, ov: null, fix: null, whatif: null, wi0: null, unt: !!(o.unt || (Save.d && Save.d.ui && Save.d.ui.unt)), log: [] };
      const s = this.s;
      if (s.you >= 0) s.types[s.you].e = this.rule(s);
      s.hist.push(this.rec(s));
      this.newDuel(s);
    },
    lever(s, k) {
      const fixAll = v => {   // "what if your lineage had played this": every kin crab plays it from the thaw on
        s.fix = v.slice(); if (s.you < 0) return;
        for (let j = 0; j < s.types.length; j++) if (j !== s.you && this.kin(s.types[j])) { s.n[s.you] += s.n[j]; s.n[j] = 0; }
        s.types[s.you].e = v.slice();
      };
      if (k === 'cheap') s.ov = { C: 2 };
      else if (k === 'costly') s.ov = { C: 20, B: 10 };
      else if (k === 'costly4') s.ov = { C: 12, B: 8 };
      else if (k === 'dove') fixAll([0, 0, 0]);
      else if (k === 'sizes') { s.ov = { sized: true }; fixAll([1, 1, 0]); }   // an assessor: fight unless the rival is bigger
      else if (k === 'intruder') fixAll([0, 0.5, 1]);   // the paradoxical convention: fight as intruder, give way as owner
      else if (k === 'allDove') { const iH = s.types.findIndex(t => t.id === 'H'), iD = s.types.findIndex(t => t.id === 'D'); if (iH >= 0 && iD >= 0) { s.n[iD] += s.n[iH]; s.n[iH] = 0; } fixAll([1, 1, 1]); }
    },
    // ---- duels ----
    rival(s) {   // a crab drawn from the beach, not counting your own crab
      let t = 0; const w = Array.prototype.map.call(s.n, (v, i) => i === s.you ? Math.max(0, v - 1) : v); for (const v of w) t += v;
      let r = R() * t; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r < 0) return i; } return w.length - 1;
    },
    newDuel(s) {
      const m = this.mode(s), d = m === 'sized' ? Math.floor(R() * 5) - 2 : m === 'roles' ? (R() < 0.5 ? -1 : 1) : 0, rv = this.rival(s);
      // in a level with cues a pick waits for the rival (no blind pick queued from the last duel)
      s.duel = { st: 'walk', t: 0, d, rv, kin: this.kin(s.types[rv]), a: m ? null : s.q, b: null, r: null, win: null, slow: false };
      s.q = null; s.phase = 'duel';
      return [{ k: 'walk', d, kin: s.duel.kin, role: m === 'roles' }];
    },
    clash(s, ev) {
      const D = s.duel, P = this.par(s), k = this.ctx(-D.d), e = s.types[D.rv].e[k];
      { const x = this.shares(s.n), Ev = this.E(s, x, s.types); let mp = 0; for (let i = 0; i < x.length; i++) mp += x[i] * Ev[i]; s.eY += this.expPick(s, D.a, D.d); s.eM += mp; }   // expected, before the draw: Discover scores these, not luck
      D.b = R() < e ? 1 : 0;
      const a = D.a, b = D.b; let r, win;
      if (a && b) { win = R() < this.pw(D.d, P.k); r = win ? P.V : -P.C; s.hh++; if (!win) s.inj++; }
      else if (a) { win = true; r = P.V; }
      else if (b) { win = false; r = 0; }
      else { win = R() < 0.5; r = win ? P.V : 0; }
      D.r = r; D.win = win; D.st = 'clash'; D.t = 0;
      const ck = s.c[this.ctx(D.d)]; ck.push(a); if (ck.length > 8) ck.shift();
      s.score += r; if (win) s.wins++; s.dn++; if (a) s.nh++; if (D.kin) s.kinN++;
      s.dl.push([a, r]);
      ev.push({ k: 'clash', a, b, r, win, kin: D.kin, d: D.d, slow: D.slow });
    },
    duelStep(s, dt, ev) {
      const D = s.duel, first = s.dn === 0 && !s.whatif; D.t += dt;   // the first duel of a level waits for you
      if (D.st === 'walk') { if (D.t >= HK_T.walk) { D.st = 'face'; D.t = 0; ev.push({ k: 'face', d: D.d, role: this.mode(s) === 'roles' }); } }
      else if (D.st === 'face') {
        if (D.a != null && D.t >= HK_T.tele) this.clash(s, ev);
        else if (D.a == null && !s.unt && !first && D.t >= HK_T.face) { D.a = 0; D.slow = true; this.clash(s, ev); }
      } else if (D.st === 'clash') { if (D.t >= HK_T.clash) this.endDuel(s, ev); }
    },
    endDuel(s, ev) { s.k++; if (s.k >= HK_LV[s.level].dpt) { s.k = 0; this.tide(s, ev, false); } else ev.push(...this.newDuel(s)); },
    // ---- the tide: P.g generations of Wright–Fisher on the beach's lineages ----
    gen(s) {
      const x = this.shares(s.n), E = this.E(s, x, s.types), w = this.fit(s, E);
      const n = Array.from(WF.step(s.n, w, this.par(s).N));
      const fl = HK_LV[s.level].floor || 1;   // designed: your own crab (in L2 and L5 your newest brood) never dies out
      while (s.you >= 0 && n[s.you] < fl) { let j = -1, m = -1; for (let i = 0; i < n.length; i++) if (i !== s.you && n[i] > m) { m = n[i]; j = i; } if (j < 0) break; n[j]--; n[s.you]++; }
      s.n = n;
    },
    tide(s, ev, auto) {
      const from = Array.from(s.n);
      const sp = s.you >= 0 ? this.inherit(s, this.rule(s)) : null;
      if (sp) ev.push({ k: 'split', from: s.you, to: sp.to, n: sp.n });
      for (let g = 0; g < this.par(s).g; g++) this.gen(s);
      s.tide++; s.hist.push(this.rec(s));
      ev.push({ k: 'tide', tide: s.tide, from, to: Array.from(s.n), auto: !!auto });
      if (auto) { if (s.tide >= s.endT) this.finish(s, ev); return; }
      s.phase = 'tide'; s.pt = 0;
    },
    afterTide(s, ev) { this.next(s, ev); },
    next(s, ev) {
      const L = HK_LV[s.level];
      if (s.tide >= L.T) { if (L.nb && !s.whatif) this.startNB(s, ev); else this.finish(s, ev); return; }
      ev.push(...this.newDuel(s));
    },
    openAsk(s, ev, q) {   // the one prediction: the new beach
      const A = HK_ASK[q], id = q;
      s.ask = { id, kind: A.kind, lo: A.lo, hi: A.hi, tol: A.tol, q };
      s.asks.push(id); s.askQ[id] = q; s.at0[id] = this.now(s);
      s.phase = 'nb'; s.pt = 0; ev.push({ k: 'ask', id });
    },
    startNB(s, ev) {   // Big shells' coda, the chapter's one prediction: judge a new beach (V 6, C 8, half hawks) before it runs
      const h = Math.round(HK_N * HK_NB.h0); s.nb = { n: [h, HK_N - h], hist: [HK_NB.h0], tide: 0 };
      ev.push({ k: 'nb' }); this.openAsk(s, ev, 'nb');
    },
    nbTide(s, ev) {
      const P = this.par(s);
      for (let g = 0; g < P.g; g++) { const x = this.shares(s.nb.n), w = [HK_NB.B + this.pi(1, x[0], HK_NB.V, HK_NB.C), HK_NB.B + this.pi(0, x[0], HK_NB.V, HK_NB.C)]; s.nb.n = Array.from(WF.step(s.nb.n, w, P.N)); }
      s.nb.tide++; s.nb.hist.push(this.shares(s.nb.n)[0]); ev.push({ k: 'nbtide', tide: s.nb.tide });
      if (s.nb.tide >= HK_NB.T) this.finish(s, ev);
    },
    finish(s, ev) { s.phase = 'over'; s.ask = null; s.duel.st = 'done'; if (!s.whatif) for (const id of s.asks) s.exp[id] = HK_NB.V / HK_NB.C; ev.push({ k: 'over' }); },   // the new beach's expectation: the ESS, V/C
    // ---- the frame ----
    step(dt) {
      const s = this.s, ev = []; s.time += dt;
      if (s.phase === 'duel') this.duelStep(s, dt, ev);
      else if (s.phase === 'tide') { s.pt += dt; if (s.pt >= HK_T.tide) this.afterTide(s, ev); }
      else if (s.phase === 'nb') {
        s.pt += dt; const done = s.ask && s.pred[s.ask.id] != null;
        if (done || (!s.unt && s.pt >= HK_T.ask)) { s.ask = null; s.phase = 'nbrun'; s.pt = 0; ev.push({ k: 'nbrun' }); }
      } else if (s.phase === 'nbrun') { s.pt += dt; if (s.pt >= HK_T.nb) { s.pt = 0; this.nbTide(s, ev); } }
      else if (s.phase === 'auto') { s.pt += dt; if (s.pt >= HK_T.auto) { s.pt = 0; this.tide(s, ev, true); } }
      return ev;
    },
    act(a) {
      const s = this.s, ev = []; if (!a || s.phase === 'over') return ev;
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id && s.pred[a.id] == null) { const A = HK_ASK[s.ask.q]; s.pred[a.id] = Math.max(A.lo, Math.min(A.hi, +a.v || 0)); ev.push({ k: 'predicted', id: a.id }); } return ev; }
      if (s.phase === 'auto') return ev;
      if (a.k === 'pick') {
        const v = a.a ? 1 : 0, D = s.duel, cue = !!this.mode(s);
        if (s.phase === 'duel' && D && (D.st === 'walk' || D.st === 'face') && D.a == null) { D.a = v; ev.push({ k: 'pick', a: v }); }
        else if (cue) { if (s.phase === 'duel' && D && D.st === 'clash') ev.push({ k: 'early' }); }   // the next rival's role is the cue: wait for it
        else if (s.q !== v && (s.phase === 'tide' || (s.phase === 'duel' && D && D.st === 'clash' && D.t >= HK_T.dbl))) { s.q = v; ev.push({ k: 'queue', a: v }); }   // a double tap is not a pick
      }
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_HAWKS_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      const z = s.hist[s.hist.length - 1];
      return { mask, outcome: { score: s.score, wins: s.wins, p: z.p, f: z.f }, interesting: this.interesting(s) };
    },
    interesting(s) {
      if (s.whatif) return this.wiText(s);
      const n = s.level, h = s.hist, z = h[h.length - 1];
      if (n === 0 && s.nh === 0) return 'nofight';
      if (n === 1 && Math.max(...h.map(r => r.p)) < 0.1) return 'nospread';
      if (n === 3 && z.r) { if (z.r[2] - z.r[0] >= 0.5) return 'paradox'; if (Math.abs(z.r[0] - z.r[2]) < 0.25) return 'blind'; }
      return null;
    },
    wiText(s) {   // What if?: the Interesting result follows what actually happened after the thaw
      const k = s.whatif, w = s.wi0 || {}, h = s.hist, z = h[h.length - 1], r1 = w.r1 || z;
      if (k === 'cheap') return z.p > 0.85 ? 'cheap' : r1.p < 0.02 && z.p < 0.02 ? 'cheapNone' : 'cheapSome';
      if (k === 'costly') return Math.abs(z.p - 0.2) <= 0.08 ? 'costly' : z.p > 0.2 ? 'costlyFar' : 'costlyLow';
      if (k === 'dove') return 'dove';
      if (k === 'costly4') return r1.p > 0.98 && z.p > 0.98 ? 'costly4None' : Math.abs(z.p - 2 / 3) <= 0.08 ? 'costly4' : 'costly4Far';
      if (k === 'allDove') return z.p > 0.8 ? 'allDove' : z.p > r1.p + 0.05 ? 'allDoveSlow' : 'allDoveNone';
      if (k === 'sizes') return z.f >= r1.f + 0.05 ? 'sizes' : 'sizesDown';
      if (k === 'intruder') return z.f >= r1.f + 0.05 ? 'intruder' : 'intruderDown';
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) { const A = HK_ASK[s.ask.q], m = Math.round((A.hi - A.lo) / A.step); for (let i = 0; i <= m; i++) out.push({ k: 'predict', id: s.ask.id, v: Math.round((A.lo + i * A.step) * 1000) / 1000 }); return out; }
      if (s.phase !== 'duel' || !s.duel) return out;
      out.push({ k: 'pick', a: 1 }, { k: 'pick', a: 0 });
      return out;
    },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    now(s) {   // the value each ask is about, as it stands now (the "no change" bots predict this)
      return s.ask && s.ask.q === 'nb' ? s.nb.hist[s.nb.hist.length - 1] : 0;
    },
    near(acts, v) { let best = null, bd = 1e9; for (const a of acts) if (a.k === 'predict') { const d = Math.abs(a.v - v); if (d < bd) { bd = d; best = a; } } return best; },
    pending(s) { const D = s.duel; return s.phase === 'duel' && D && (D.st === 'walk' || D.st === 'face') && D.a == null; },
    bots: {
      alwaysA(s, acts) { if (acts.length && acts[0].k === 'predict') return acts[0]; return CH_HAWKS_V2.sim.pending(s) ? { k: 'pick', a: 1 } : null; },
      alwaysB(s, acts) { if (acts.length && acts[0].k === 'predict') return acts[acts.length - 1]; return CH_HAWKS_V2.sim.pending(s) ? { k: 'pick', a: 0 } : null; },
      greedy(s, acts) {   // myopic best reply to the beach as it stands; predicts that nothing will change
        const S = CH_HAWKS_V2.sim;
        if (acts.length && acts[0].k === 'predict') return S.near(acts, S.now(s));
        if (!S.pending(s)) return null;
        return { k: 'pick', a: S.expPick(s, 1, s.duel.d) >= S.expPick(s, 0, s.duel.d) ? 1 : 0 };
      },
      threshold(s, acts) {   // a fixed rule of thumb: fight while hawks are under half (or when you hold the edge); call the middle
        const S = CH_HAWKS_V2.sim;
        if (acts.length && acts[0].k === 'predict') return S.near(acts, 0.5);
        if (!S.pending(s)) return null;
        if (S.mode(s)) return { k: 'pick', a: s.duel.d < 0 ? 1 : 0 };
        return { k: 'pick', a: s.hist[s.hist.length - 1].p < 0.5 ? 1 : 0 };
      },
      doveNoChange(s, acts) {   // never engages: always Dove, and predicts no change
        const S = CH_HAWKS_V2.sim;
        if (acts.length && acts[0].k === 'predict') return S.near(acts, S.now(s));
        return S.pending(s) ? { k: 'pick', a: 0 } : null;
      },
      hawkNoChange(s, acts) {   // blind Hawk, and predicts no change
        const S = CH_HAWKS_V2.sim;
        if (acts.length && acts[0].k === 'predict') return S.near(acts, S.now(s));
        return S.pending(s) ? { k: 'pick', a: 1 } : null;
      },
      allHawks(s, acts) {   // blind Hawk, and calls "all hawks" on the new beach (right only when V ≥ C)
        const S = CH_HAWKS_V2.sim;
        if (acts.length && acts[0].k === 'predict') return acts[acts.length - 1];
        return S.pending(s) ? { k: 'pick', a: 1 } : null;
      }
    }
  },

  /* ---- stars: pure functions of the final state, scored against the expectation (API_v2 §9.1; D1 G10) ----
     Each level awards only its lesson's stars (D6 decision 9: four levels, one prediction), so the unit's three stars need
     understanding in different places: Discover on L1–L3 (the in-world goal, scored on the expected payoff of your picks, plus
     the phenomenon); Predict only on Big shells' new beach (V/C = 0.75); Transfer only on Owners (a convention spreads). */
  stars: {
    discover: (s, n) => {
      const h = s.hist, a = h[0], z = h[h.length - 1], earn = s.dn > 0 && s.eY >= s.eM - 1e-9;
      if (n === 0) return s.nh >= 1 && s.dn >= 6 && a.p - z.p >= 0.15 && earn;   // tried Hawk, out-earned the average crab, saw hawks fall towards V/C
      if (n === 1) { let m = 0; for (const r of h) if (r.p > m) m = r.p; return m >= 0.2 && earn; }   // your hawks spread on the dove beach (the only hawks there are your kin)
      if (n === 2) return z.p - a.p >= 0.25 && a.mp - z.mp >= 0.8 && earn;   // the tragedy: hawks rose while the mean payoff fell, and you played what pays
      return false;
    },
    predict: (s, n) => n === 2 && HK_hit(s, 'nb'),
    transfer: (s, n) => n === 3 && s.hist.some(r => r.fc >= 1 / 3)   // a convention you seeded (owner-wins or intruder-wins) held a third of the beach
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {});
    if (typeof Url !== 'undefined' && Url.q && Url.q.untimed != null && !/^(0|false|no|off)$/i.test(Url.q.untimed)) o.unt = true;   // ?untimed=1 for playtests (no settings screen yet)
    this.level = n; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._said = {};
    Sim.start(this, n, o);
    const s = this.sim.s;
    this.v = { t: 0, crowd: null, slotT: [], born: [], gone: [], wave: -1, waveMs: 1.2, bg: 0, bgT: 0.3, dash: {}, spark: [], pick: 0, pickA: null, sq: 0, pulse: 0,
      rvIn: 0, exit: null, cl: null, banner: null, postV: [], kinSeen: false, thaw: !!o.thaw, lastPhase: '', nbT: -1, revealed: {}, flick: 0 };
    this.layoutCrowd(); this.assignCrowd(true);
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (!o.thaw && typeof Ghost !== 'undefined') {   // the hand stays until your first pick (the first duel waits for it)
      if (n === 0) Ghost.show({ verb: 'tap', key: 'ArrowRight', at: () => this.padAt(1), until: () => this.sim.s.dn > 0 || (this.sim.s.duel && this.sim.s.duel.a != null) });
    }
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },

  /* ---------- geometry (canvas px) ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  geo() {
    const W = Stage.w, H = Stage.h, u = Stage.u || 390, top = this.hudH() + 4, y0 = top + 28, room = Math.max(200, H - y0);
    const beach = { x: 10, y: y0, w: W - 20, h: Math.round(room * 0.33) };
    const post = { x: 14, y: beach.y + beach.h + 8, w: W - 28, h: Math.round(Math.max(44, room * 0.14)) };
    const ay = post.y + post.h + 8, arena = { x: 0, y: ay, w: W, h: Math.max(60, H - ay - 8) };
    const inner = Math.max(40, arena.h - 46), hero = Math.round(Math.max(56, Math.min(150, 0.27 * u, inner * 0.62)));   // 24 px of chips above the duel, a row of rule pips below
    return { W, H, u, top, beach, post, arena, hero, cy: arena.y + 24 + inner * 0.5, xs: W * 0.27, xr: W * 0.73, crowd: Math.round(Math.max(14, Math.min(28, 0.042 * u))) };
  },
  padAt(i) { const G = this.geo(); return i === 1 ? [G.xr, G.cy] : [G.xs, G.cy]; },   // tap targets: the rival (Hawk), your crab (Dove)

  /* ---------- the crowd: 150 slots on the beach; a slot's crab carries one lineage's rule ---------- */
  hrand(i, k) { let h = Math.imul((i + 1) * 2654435761 ^ (k + 7) * 40503, 2246822519); h ^= h >>> 13; h = Math.imul(h, 3266489917); h ^= h >>> 16; return (h >>> 0) / 4294967296; },
  layoutCrowd() {
    const cols = 15, rows = 10, sl = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c; sl.push({ u: (c + 0.2 + 0.6 * this.hrand(i, 1) + (r % 2) * 0.35) / (cols + 0.4), v: (r + 0.15 + 0.7 * this.hrand(i, 2)) / rows, flip: this.hrand(i, 3) < 0.5, lum: 0.25 + 0.5 * this.hrand(i, 4), ph: this.hrand(i, 5) * 6 }); }
    sl.sort((a, b) => a.v - b.v); this.v.crowd = sl;
  },
  counts() { const s = this.sim.s; if (s.phase === 'nb' || s.phase === 'nbrun' || (s.phase === 'over' && s.nb)) return s.nb.n; return s.n; },
  assignCrowd(fresh) {   // slots keep their type where they can; changed slots wash away and hatch anew (the tide)
    const v = this.v, n = this.counts(), N = v.crowd.length, want = Array.from(n).map(x => x), cur = v.slotT, nb = !!(this.sim.s.nb && this.sim.s.phase !== 'duel' && this.sim.s.phase !== 'tide');
    let tot = 0; for (const x of want) tot += x; const scale = tot ? N / tot : 1, quota = want.map(x => Math.round(x * scale)); let q = 0; for (const x of quota) q += x;
    let big = 0; for (let i = 1; i < quota.length; i++) if (quota[i] > quota[big]) big = i; quota[big] += N - q;
    const next = new Array(N).fill(-1), have = quota.map(() => 0);
    const salt = 9 + this.sim.s.tide * 31 + (this.sim.s.nb ? this.sim.s.nb.tide * 7 : 0), keep = []; for (let i = 0; i < N; i++) keep.push(i);
    keep.sort((a, b) => this.hrand(a, salt) - this.hrand(b, salt));   // who survives the wash is random, so hatchlings appear all over the beach
    if (!fresh && cur.length === N && v.nbMode === nb) for (const i of keep) { const t = cur[i]; if (t >= 0 && t < quota.length && have[t] < quota[t]) { next[i] = t; have[t]++; } }
    const order = keep.filter(i => next[i] < 0);
    let k = 0; for (let t = 0; t < quota.length; t++) while (have[t] < quota[t] && k < order.length) { next[order[k++]] = t; have[t]++; }
    v.born = []; v.gone = [];
    if (!fresh) for (let i = 0; i < N; i++) if (cur[i] !== next[i]) { v.born.push(i); if (cur[i] >= 0) v.gone.push({ i, t: cur[i] }); }
    v.slotT = next; v.nbMode = nb;
  },
  splitSlots(e) {   // older kin keep their rule as a cohort: their slots change type in place, so nobody washes away for it
    const v = this.v; let m = Math.round(e.n * v.crowd.length / HK_N), keepY = 0;
    for (let i = 0; i < v.slotT.length && m > 0; i++) if (v.slotT[i] === e.from) { if (keepY < 1) { keepY++; continue; } v.slotT[i] = e.to; m--; }
  },
  /* what a crowd crab of type t looks like: two pure rules wear blue/amber plus claw shape; mixers and quitters keep natural paint */
  look(t) {
    const s = this.sim.s, L = HK_LV[s.level];
    if (this.v.nbMode) return t === 0 ? { ink: 'A', claw: 'up' } : { ink: 'a', claw: 'down' };
    const ty = s.types[t]; if (!ty) return { claw: 'idle' };
    if (ty.id === 'H') return { ink: 'A', claw: 'up' };
    if (ty.id === 'D') return { ink: 'a', claw: 'down' };
    if (ty.id === 'M') return { claw: 'mix', p: 0.4 };
    const r = this.sim.hp(ty.e, this.sim.wts(s));
    if (L.roles) return { claw: 'idle', kin: true };
    return { ink: r >= 0.5 ? 'A' : 'a', claw: r >= 0.5 ? 'up' : 'down', kin: true };
  },
  sprite(ph, size) {   // a baked crab per look and size (the crowd blits ≤ 150 of these a frame)
    const key = (ph.ink || 'n' + (ph.lum == null ? '' : Math.round(ph.lum * 4))) + ph.claw + size + (typeof Pal !== 'undefined' ? Pal.theme : '');
    const C = this._spr || (this._spr = new Map()); let cv = C.get(key);
    if (!cv) { if (C.size > 80) C.clear(); cv = Rig.bake('crab', { claw: ph.claw === 'mix' ? 'idle' : ph.claw, ink: ph.ink, lum: ph.lum }, Math.max(1, Math.min(2, Stage.dpr || 1)), { size }); C.set(key, cv); }
    return cv;
  },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.pick = Math.max(0, v.pick - dt / 0.16); v.sq = Math.max(0, v.sq - dt / 0.22); v.pulse = Math.max(0, v.pulse - dt / 0.9);
    if (v.wave >= 0) { v.wave += dt; if (v.wave > v.waveMs + 0.6) v.wave = -1; }
    if (v.cl) { v.cl.t += dt; if (!v.cl.hit && v.cl.a != null && v.cl.t >= 0.16) this.impact(); } if (v.exit) { v.exit.t += dt; if (v.exit.t > 0.7) v.exit = null; }
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (s.duel && s.duel.st === 'walk') v.rvIn = Math.min(1, s.duel.t / HK_T.walk); else v.rvIn = 1;
    for (const k in v.dash) { v.dash[k] -= dt; if (v.dash[k] <= 0) delete v.dash[k]; }
    v.bgT -= dt; if (v.bgT <= 0) { v.bgT = 0.28 + 0.3 * this.hrand(Math.floor(v.t * 37), 11); this.bgContest(); }
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; this._dockSig = ''; }
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }   // one settled frame before the card
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; this._dockSig = ''; if (typeof Predict === 'undefined') return;
    Predict.ask({ id: A.id, chart: 0, kind: 'y', axis: { lo: A.lo, hi: A.hi }, start: this.sim.now(s), at: HK_NB.T, tol: A.tol, soft: null, needMove: true });   // the ghost starts at today's 50%, which is never the answer
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, cap = C.captions, final = n === HK_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (!s.whatif) { o.take = cap['take' + n]; if (final) o.body = C.body; }
    // the card names only the stars this level can give (the engine shows the first one still missing)
    const st = {}; for (const [k, c] of [['discover', 'd'], ['predict', 'p'], ['transfer', 't']]) if (cap['s' + n + c]) st[k] = cap['s' + n + c];
    o.stars = st;
    const vials = typeof Freezer !== 'undefined' ? Freezer.list(this.id) : [], want = HK_LV[n].wi, vial = vials.find(x => x.gen === want) || vials.slice().sort((a, b) => a.gen - b.gen)[0];
    if (vial && !s.whatif) o.whatIf = { gen: vial.gen, levers: HK_LV[n].levers };
    if (!s.whatif) for (const id of s.asks) if (s.exp[id] != null && typeof Predict !== 'undefined') Predict.reveal(id, s.exp[id], HK_ASK[s.askQ[id]].tol);
    const spec = this.debrief();
    if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    const box = End.show(this, o);
    this.cardExtras(box, n, final);
  },
  cardExtras(box, n, final) {   // the boss's card can replay the boss; Why? scrolls its opened panel into view on a short screen
    if (!box || !box.querySelector || typeof document === 'undefined') return;
    const row = box.querySelector('.card-btns');
    if (final && row && !row.querySelector('[data-hk="replay"]')) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = 'Replay level'; b.dataset.hk = 'replay';
      b.addEventListener('click', () => { if (box.dataset.armed !== '1') return; if (typeof Snd !== 'undefined') Snd.click(); if (typeof Entry !== 'undefined') Entry.enter(this, n); else App.playLevel(this, n); });
      row.insertBefore(b, row.lastChild);
    }
    if (row) for (const b of row.children) if (b.textContent === 'Why?') b.addEventListener('click', () => setTimeout(() => { const w = box.querySelector('.why:not([hidden])'); if (w && w.scrollIntoView) w.scrollIntoView({ block: 'nearest', behavior: typeof Entry !== 'undefined' && Entry.calm && Entry.calm() ? 'auto' : 'smooth' }); }, 30));
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, G = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, hasS2 = typeof Snd2 !== 'undefined';
    const youX = G.xs, rvX = G.xr, cy = G.cy, top = Math.max(G.arena.y + 58, cy - G.hero * 0.45 - 12);   // payoff pops start below the chip row
    const sound = (name, x, y) => { if (hasS2) Snd2.play(name, { x, y }); };
    if (e.k === 'walk') { v.cl = null; sound('wing', G.W - 30, cy); }
    else if (e.k === 'face') {
      if (F) F.ring(rvX, cy, G.hero * 0.45, { ms: 220 });
      if (e.role && typeof Live !== 'undefined') Live.say(e.d < 0 ? C.captions.liveOwn : C.captions.liveInt);   // the cue, for screen readers
    }
    else if (e.k === 'pick' || e.k === 'queue') {
      v.pick = 1; v.pickA = e.a; v.sq = 1; const p = this.padAt(e.a ? 1 : 0);
      if (F) F.ring(p[0], p[1], 26, { ms: 200 });
      sound('tock', youX, top);
      if (e.k === 'queue') this.whisper('queued');
    }
    else if (e.k === 'early') { v.pulse = 1; if (this.once('early')) this.whisper('early'); }
    else if (e.k === 'clash') {   // telegraph (the lunge), act (contact at 0.16 s: impact()), settle (the shell changes hands)
      v.cl = { t: 0, a: e.a, b: e.b, r: e.r, win: e.win, kin: e.kin, d: e.d, ph: this.rivalPh(), hit: false };
      if (e.slow) this.whisper('slow');   // a timed-out pick says so, and nothing overwrites it
      else if (e.kin && !v.kinSeen) { v.kinSeen = true; this.whisper('kin'); }
      else if (e.a && e.b) this.whisper(e.win ? 'wonfight' : 'injured');
      else if (e.a) this.whisper('took'); else if (e.b) this.whisper('backed'); else this.whisper(e.win ? 'display' : 'lostdisplay');
      if (F) F.ring(rvX, cy, G.hero * 0.5, { ms: 160 });
      if (typeof Live !== 'undefined') Live.say((e.slow ? C.whispers.slow + ' ' : '') + Txt.f(C.captions.liveDuel, { a: e.a ? C.labels.hawkPad : C.labels.dovePad, r: e.r }));
    }
    else if (e.k === 'split') this.splitSlots(e);
    else if (e.k === 'tide') {
      if (!e.auto && typeof Freezer !== 'undefined') Freezer.put(this.id, e.tide, this.sim.snapshot());
      this.assignCrowd(false); v.wave = 0; v.waveMs = e.auto ? 0.5 : 1.0;
      if (F) F.tier(2, () => { });
      sound('swish', G.W / 2, G.beach.y + 10);
      if (F) for (const i of v.born.slice(0, 18)) { const p = this.slotXY(i, G); F.burst('egg', p[0], p[1], 2); }
      const z = s.hist[s.hist.length - 1], L = HK_LV[s.level];
      if (!e.auto && L.hatch && e.tide === L.hatch) this.whisper('hatched');   // L5: the brood takes your rule from your first eight duels
      if (!e.auto && L.rope && e.tide === L.rope) this.whisper('vc');   // the key number, said once as the rope appears
      if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveTide, { t: e.tide, p: Math.round(100 * z.p), f: Math.round(100 * z.f) }));
    }
    else if (e.k === 'nb') { this.assignCrowd(true); v.nbT = 0; this.whisper('newbeach'); if (F) F.tier(3, ms => { v.banner = { text: C.labels.newBeach, t: 0, ms: Math.max(900, ms + 300) }; }); sound('swish', G.W / 2, G.beach.y + 10); }
    else if (e.k === 'nbtide') { this.assignCrowd(false); v.wave = 0; v.waveMs = 0.4; sound('swish', G.W / 2, G.beach.y + 10); }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  impact() {   // the moment of contact: sparks and an injury shake for a fight, a scuttle for a retreat, then the payoff pops
    const v = this.v, cl = v.cl, G = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, mid = (G.xs + G.xr) / 2, cy = G.cy, top = Math.max(G.arena.y + 58, cy - G.hero * 0.45 - 12), ink = '#1B1612';
    const sound = (name, x, y) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, { x, y }); };
    cl.hit = true; if (!F) return;
    if (cl.a && cl.b) {
      F.burst('spark', mid, cy - 4, 14, { ink }); F.burst('dust', mid, cy + G.hero * 0.25, 6); sound('crack', mid, cy - 10);
      if (!cl.win) { F.shake(5, 180); F.hitstop(50); F.pop('−' + Math.abs(cl.r), G.xs, top, -1); }
      else F.pop('+' + cl.r, G.xs, top, 1);
    } else if (cl.a) { F.burst('dust', G.xr + G.hero * 0.2, cy + G.hero * 0.25, 8); F.pop('+' + cl.r, G.xs, top, 1); sound('swish', G.xr, cy); }
    else if (cl.b) { F.burst('dust', G.xs - G.hero * 0.2, cy + G.hero * 0.25, 8); F.pop('0', G.xs, top, 0); sound('swish', G.xs, cy); }
    else { F.ring(mid, cy, 30, { ms: 400 }); F.pop(cl.win ? '+' + cl.r : '0', G.xs, top, cl.win ? 1 : 0); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'hk-' + k); },
  rivalPh() { const s = this.sim.s, D = s.duel; return { lum: 0.3 + 0.4 * this.hrand(s.dn + 1, 6), d: D ? D.d : 0 }; },
  bgContest() {   // a background duel on the beach, true to the mix: sparks where two hawks meet, a dash where a dove backs off
    const v = this.v, s = this.sim.s, G = this.geo(), N = v.crowd.length; if (!N || typeof Fx === 'undefined' || s.phase === 'over') return;
    const i = Math.floor(this.hrand(Math.floor(v.t * 101), 12) * N), j = Math.min(N - 1, i + 1), a = this.look(v.slotT[i]), b = this.look(v.slotT[j]);
    const hawk = l => l.claw === 'up' || (l.claw === 'mix' && this.hrand(Math.floor(v.t * 53) + i, 13) < l.p), pa = this.slotXY(i, G), pb = this.slotXY(j, G);
    const ha = hawk(a), hb = hawk(b);
    if (ha && hb) Fx.burst('spark', (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, 4, { ink: Pal.paper });
    else if (ha || hb) { v.dash[ha ? j : i] = 0.3; Fx.burst('dust', ha ? pb[0] : pa[0], ha ? pb[1] : pa[1], 2); }
  },
  slotXY(i, G) { const sl = this.v.crowd[i], B = G.beach; return [B.x + 8 + sl.u * (B.w - 16), B.y + 14 + sl.v * (B.h - 24)]; },

  /* ---------- input: tap the arena (rival half = Hawk, your half = Dove); keys through the dock ---------- */
  pick(a) { Sim.act(this, { k: 'pick', a }); },
  hit(x, y) {   // the arena's two halves: nearer the rival = Hawk, nearer you = Dove; the shell in the middle and the beach above give a hint
    const G = this.geo(), shr = G.hero * 0.26, sy = G.cy + G.hero * 0.32;
    if (y < G.arena.y - 10) return -2;
    if (Math.abs(x - G.W / 2) < shr * 1.3 && Math.abs(y - sy) < shr * 1.3) return -3;
    return Math.abs(x - G.xr) <= Math.abs(x - G.xs) ? 1 : 0;
  },
  down(x, y) {
    const s = this.sim.s, i = this.hit(x, y);
    if (i >= 0) { this.pick(i); return; }
    if (this.sim.pending(s)) { this.v.pulse = 1; if (this.once('miss')) this.whisper('miss'); }   // a miss is never silent
  },
  onKey(k) { if (k === 'h' || k === 'H') this.pick(1); else if (k === 'd' || k === 'D') this.pick(0); },
  glyph(up) {   // a small vector crab for the dock: claws raised (Hawk) or lowered (Dove)
    const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 24 18'); svg.setAttribute('width', '22'); svg.setAttribute('height', '16'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); svg.style.marginRight = '6px'; svg.style.verticalAlign = '-2px';
    const p = document.createElementNS(ns, 'path'); p.setAttribute('fill', 'none'); p.setAttribute('stroke', 'currentColor'); p.setAttribute('stroke-width', '2.2'); p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    p.setAttribute('d', up ? 'M7 15h10M8 15c0-3 2-5 4-5s4 2 4 5M8 11L4 6M4 6l-1-3M4 6l3-1M16 11l4-5M20 6l1-3M20 6l-3-1' : 'M7 11h10M8 11c0-3 2-5 4-5s4 2 4 5M8 11l-4 4M4 15h-2M4 15v-2M16 11l4 4M20 15h2M20 15v-2');
    svg.appendChild(p); return svg;
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, ask = !!(s.ask && this._asking), th = typeof Pal !== 'undefined' ? Pal.theme : '';
    const sig = 'hd' + ask + s.phase + th; if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.phase === 'auto' || s.phase === 'nbrun' || s.phase === 'over') { Dock.set([]); return; }
    if (ask) { Dock.set([{ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } }]); return; }   // during a call, the only thing to press
    Dock.set([{ id: 'hk-dove', label: L.dovePad, key: 'ArrowLeft', aria: 'Dove: display', fn: () => this.pick(0) }, { id: 'hk-hawk', label: L.hawkPad, key: 'ArrowRight', aria: 'Hawk: fight', fn: () => this.pick(1) }]);
    if (typeof document === 'undefined' || !document.querySelector || typeof Pal === 'undefined') return;
    for (const [id, role, up] of [['hk-dove', 'a', false], ['hk-hawk', 'A', true]]) {   // neutral chrome (D6 decision 7): each button carries its rule's ink only as a key, a side bar and the claw glyph
      const el = document.querySelector('#dock [data-id="' + id + '"]'); if (!el) continue;
      const fill = Pal.INK[Pal.theme] ? Pal.INK[Pal.theme][role] : Pal.INK.dusk[role];
      el.style.boxShadow = 'inset 7px 0 0 ' + fill; el.style.paddingLeft = '18px';
      if (el.insertBefore) { const g = this.glyph(up); g.style.color = fill; el.insertBefore(g, el.firstChild); }
    }
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, n = this.level, D = s.duel, L = HK_LV[n]; let t;
    if (s.phase === 'nb') t = s.ask ? C.nb : C.tide;
    else if (s.phase === 'nbrun') t = C.nbrun;
    else if (s.phase === 'auto') t = C.auto;
    else if (s.phase === 'tide') t = C.tide;
    else if (s.phase === 'over') t = C.over;
    else if (n === 0 && s.dn === 0) t = this.content.firstWords;
    else if (n === 1) t = s.tide < 1 ? C.duel1a : C.duel1;
    else if (n === 3) t = s.tide < (L.hatch || 1) ? C.duel3a : C.duel3;
    else t = C['duel' + n];
    const sc = s.score, num = Txt.f(this.content.labels.score, { n: (sc > 0 ? '+' : sc < 0 ? '−' : '') + Math.abs(Math.round(sc)) });
    HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const s = this.sim.s, G = this.geo(), v = this.v;
    this.drawGround(c, G);
    this.drawCrowd(c, G);
    this.drawPosts(c, G);
    this.drawArena(c, G);
    this.drawHints(c, G);
    this.drawInfo(c, G);
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('hk-banner', v.banner.text, W / 2, G.beach.y + G.beach.h * 0.5, { size: 22 }); c.restore(); }
  },
  drawGround(c, G) {   // cosmetic: sand, the sea at the top, a foam line, and the tide's wash
    const v = this.v, sand = typeof Pal !== 'undefined' ? Pal.place('shore').ground : '#D2BE96', calm = typeof Fx !== 'undefined' && Fx.calm;
    c.fillStyle = sand; c.fillRect(0, 0, G.W, G.H);
    const sea = G.beach.y + 4, gl = c.createLinearGradient(0, 0, 0, sea + 10); gl.addColorStop(0, '#3F6E70'); gl.addColorStop(1, '#6F9A92');
    c.fillStyle = gl; c.fillRect(0, 0, G.W, sea);
    c.strokeStyle = 'rgba(244,238,221,.75)'; c.lineWidth = 2.5; c.beginPath();
    for (let x = 0; x <= G.W; x += 12) { const y = sea + (calm ? 0 : 3 * Det.sin(x * 0.045 + v.t * 1.6)); if (x === 0) c.moveTo(x, y); else c.lineTo(x, y); }
    c.stroke();
    c.fillStyle = 'rgba(120,96,64,.16)'; for (let i = 0; i < 90; i++) { const x = this.hrand(i, 21) * G.W, y = sea + 8 + this.hrand(i, 22) * (G.H - sea - 8); c.fillRect(x, y, 2, 2); }
    if (v.wave >= 0) {   // the tide: a wash rolls down over the beach and draws back
      const p = Math.min(1, v.wave / v.waveMs), k = p < 0.5 ? p * 2 : (1 - p) * 2, y = sea + k * (G.beach.h + 6);
      c.fillStyle = calm ? 'rgba(111,154,146,.25)' : 'rgba(111,154,146,.55)'; c.fillRect(0, sea, G.W, y - sea);
      c.strokeStyle = 'rgba(244,238,221,.9)'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= G.W; x += 10) { const yy = y + (calm ? 0 : 2.5 * Det.sin(x * 0.07 + v.t * 4)); if (x === 0) c.moveTo(x, yy); else c.lineTo(x, yy); } c.stroke();
    }
  },
  drawCrowd(c, G) {   // cosmetic: 150 baked sprites, a halo on your kin, dashes and hatchlings during a tide
    const v = this.v, s = this.sim.s, size = G.crowd, born = new Set(v.born), wp = v.wave >= 0 ? Math.min(1, v.wave / v.waveMs) : 1, paper = typeof Pal !== 'undefined' ? Pal.paper : '#F4EEDD';
    for (let i = 0; i < v.crowd.length; i++) {
      const t = v.slotT[i]; if (t < 0) continue;
      const sl = v.crowd[i], p = this.slotXY(i, G), look = this.look(t);
      let claw = look.claw, x = p[0], y = p[1], al = 1, sc = 1;
      if (claw === 'mix') claw = this.hrand(i * 7 + Math.floor((v.t + sl.ph) / 0.9), 14) < look.p ? 'up' : 'down';
      if (v.dash[i]) x += (sl.flip ? 1 : -1) * 9 * Det.sin(Math.PI * v.dash[i] / 0.3);
      if (born.has(i) && wp < 1) { const k = Math.max(0, (wp - 0.45) / 0.55); sc = 0.3 + 0.7 * k; al = k; }
      if (al <= 0.01) continue;
      const cv = this.sprite({ ink: look.ink, claw, lum: look.ink ? null : Math.round(sl.lum * 4) / 4 }, size);
      const yy = y + (typeof Fx !== 'undefined' && Fx.calm ? 0 : Det.sin(v.t * 2 + sl.ph) * 0.8);
      c.save(); c.globalAlpha = al; c.translate(x, yy); c.scale((sl.flip ? -1 : 1) * sc, sc); c.drawImage(cv, -cv.cw / 2, -cv.ch / 2, cv.cw, cv.ch); c.restore();
      if (look.ink === 'A') { c.save(); c.globalAlpha = al; c.fillStyle = '#1B1612'; c.beginPath(); c.moveTo(x, yy - size * 0.7); c.lineTo(x + size * 0.22, yy - size * 0.36); c.lineTo(x - size * 0.22, yy - size * 0.36); c.closePath(); c.fill(); c.restore(); }   // luminance twin of blue: a dark raised-claw tick, readable in monochrome
      if (look.kin) { c.beginPath(); c.arc(x, y, size * 0.52, 0, TAU); c.lineWidth = 3; c.strokeStyle = 'rgba(27,22,18,.6)'; c.stroke(); c.lineWidth = 2; c.strokeStyle = paper; c.stroke(); }
    }
    if (wp < 0.6) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(41,33,27,.55)'; for (const g of v.gone.slice(0, 40)) { const p = this.slotXY(g.i, G); c.beginPath(); c.arc(p[0], p[1], size * 0.45, 0, TAU); c.stroke(); } c.restore(); }
  },
  postVal(r) { const s = this.sim.s, L = HK_LV[s.level]; return L.post === 'f' && !this.v.nbMode ? r.f : r.p; },
  drawPosts(c, G) {   // the live graph in the scene: one groyne post a tide, painted to the share; a rope at V/C once revealed
    const s = this.sim.s, L = HK_LV[s.level], v = this.v, P = G.post, nb = v.nbMode, T = nb ? HK_NB.T : (s.whatif ? s.endT : L.T);
    let vals; if (nb) vals = s.nb.hist; else { vals = []; for (const r of s.hist) vals[r.t] = this.postVal(r); }   // a What if? point replaces its tide's post; the strip keeps both
    const kin = L.post === 'f' && !nb, n = T + 1, dx = (P.w - 64) / Math.max(1, n - 1), pw = Math.max(8, Math.min(18, dx * 0.55));
    const ink = kin ? (typeof Pal !== 'undefined' ? Pal.paper : '#F4EEDD') : (typeof Pal !== 'undefined' ? Pal.A : '#6B97FF');
    c.save();
    c.fillStyle = 'rgba(41,33,27,.14)'; c.fillRect(P.x + 54, P.y + P.h - 3, P.w - 56, 5);
    for (let i = 0; i < n; i++) {
      const x = P.x + 64 + i * dx - pw / 2, has = i < vals.length && vals[i] != null, val = has ? Math.max(0, Math.min(1, vals[i])) : 0;
      c.fillStyle = has ? '#6E5034' : 'rgba(110,80,52,.22)'; c.fillRect(x, P.y, pw, P.h);
      if (has) {
        let k = 1; if (i === vals.length - 1 && v.wave >= 0) k = Math.min(1, v.wave / Math.max(0.3, v.waveMs));
        const hh = (P.h - 4) * val * (i === vals.length - 1 ? k : 1);
        c.fillStyle = ink; c.fillRect(x + 2, P.y + P.h - 2 - hh, pw - 4, hh);
        c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.strokeRect(x + 0.5, P.y + 0.5, pw - 1, P.h - 1);
        if (kin) { c.save(); c.beginPath(); c.rect(x + 2, P.y + P.h - 2 - hh, pw - 4, hh); c.clip(); c.strokeStyle = 'rgba(27,22,18,.35)'; c.lineWidth = 1; for (let yy = P.y + P.h; yy > P.y; yy -= 5) { c.beginPath(); c.moveTo(x, yy); c.lineTo(x + pw, yy - 5); c.stroke(); } c.restore(); }
      } else { c.setLineDash([3, 3]); c.strokeStyle = 'rgba(41,33,27,.35)'; c.strokeRect(x + 0.5, P.y + 0.5, pw - 1, P.h - 1); c.setLineDash([]); }
    }
    let rope = null;   // V/C appears only once it can no longer give an answer away
    if (nb) rope = s.pred.nb != null ? HK_NB.V / HK_NB.C : null;
    else if (L.rope && !s.whatif && (s.tide >= L.rope || s.phase === 'over')) rope = L.V / L.C;   // the key number, once the hawks have shown where they are heading
    if (rope != null) { const y = P.y + P.h - 2 - (P.h - 4) * rope; c.setLineDash([6, 4]); c.lineWidth = 2; c.strokeStyle = '#1B1612'; c.beginPath(); c.moveTo(P.x + 56, y); c.lineTo(P.x + P.w, y); c.stroke(); c.setLineDash([]); Lbl.put('hk-rope', Txt.f(this.content.labels.rope, { v: nb ? HK_NB.V + '/' + HK_NB.C : L.V + '/' + L.C }), P.x + P.w - 4, y - 12, { size: 12, align: 'right' }); }
    c.restore();
    Lbl.put('hk-posts', kin ? this.content.labels.postsKin : this.content.labels.posts, P.x, P.y + P.h / 2 + 10, { size: 12, align: 'left' });
  },
  crabAt(c, ph, x, y, size, o) { return Rig.draw(c, 'crab', ph, x, y, Object.assign({ size }, o)); },
  drawArena(c, G) {   // cosmetic: the duel at hero size; the prize shell between (beside its owner in L5); lunges, retreats and the shell changing owner
    const s = this.sim.s, v = this.v, D = s.duel, L = HK_LV[s.level], hs = G.hero, cy = G.cy, calm = typeof Fx !== 'undefined' && Fx.calm, lab = this.content.labels;
    if (!D || s.phase === 'over' && !v.cl) return;
    if (s.phase === 'auto' || s.phase === 'nb' || s.phase === 'nbrun' || (s.phase === 'over' && (s.whatif || s.nb))) { this.drawLapse(c, G); return; }
    const cl = v.cl, ct = cl ? cl.t : 0, inDuel = s.phase === 'duel' || s.phase === 'tide', roles = !!L.roles;
    // the shell (prize): bigger in Big shells; in Owners it sits beside the crab that owns it
    let shx = (G.xs + G.xr) / 2, shy = cy + hs * 0.32; const shr = hs * (L.V >= 8 ? 0.26 : L.V >= 6 ? 0.22 : 0.19);
    if (roles) shx = lerp(shx, D.d < 0 ? G.xs : G.xr, 0.42);
    if (cl && ct > 0.3 && cl.r > 0) shx = lerp(shx, G.xs + hs * 0.15, Math.min(1, (ct - 0.3) / 0.3)); else if (cl && ct > 0.3 && cl.b && !cl.win) shx = lerp(shx, G.xr - hs * 0.15, Math.min(1, (ct - 0.3) / 0.3));
    if (inDuel) this.shell(c, shx, shy, shr);
    // your crab
    const reach = Math.max(0, (G.xr - G.xs - hs * 0.9) / 2), lunge = cl && !calm ? Det.sin(Math.PI * Math.min(1, ct / 0.34)) : 0;
    let yx = G.xs, yrot = 0;
    if (cl) { if (cl.a) yx += lunge * reach * (cl.b ? 1 : 0.7); if (!cl.a && cl.b && ct > 0.12 && !calm) yx -= Math.min(1, (ct - 0.12) / 0.12) * hs * 0.45; if (cl.a && cl.b && !cl.win && ct > 0.17) yrot = -0.3 * Math.min(1, (ct - 0.17) / 0.1); }
    const mine = D.a, yph = mine == null ? { claw: 'idle', lum: 0.55 } : { claw: mine ? 'up' : 'down', ink: mine ? 'A' : 'a' };
    const ysq = 1 + 0.08 * Det.sin(Math.PI * v.sq);
    this.crabAt(c, yph, yx, cy, hs * ysq, { halo: true, rot: yrot, state: 'idle', t: v.t, id: 'you' });
    Lbl.put('hk-you', roles && D.d < 0 ? lab.youOwn : lab.you, G.xs, cy + hs * 0.55, { size: 13 });   // in Owners the labels name the owner (the cue)
    // the rival: natural paint until it acts; then blue with claws up (hawk) or amber with claws down (dove)
    if (v.exit) { const ex = v.exit; this.crabAt(c, ex.ph, G.xr + ex.t * hs * 2.2, cy, ex.size, { flip: true, alpha: Math.max(0, 1 - ex.t / 0.7) }); }
    const rs = hs * (L.sized ? 1 + 0.16 * D.d : 1), rin = calm ? 1 : 1 - (1 - v.rvIn) * (1 - v.rvIn) * (1 - v.rvIn);
    let rx = lerp(G.W + rs, G.xr, rin), rrot = 0, rph = { claw: 'idle', lum: cl && cl.ph ? cl.ph.lum : 0.35 + 0.3 * this.hrand(s.dn + 1, 6) }, halo = false;
    if (cl) {
      rph = cl.b ? { claw: 'up', ink: 'A' } : { claw: 'down', ink: 'a' }; halo = !!cl.kin;
      if (cl.b) rx -= lunge * reach * (cl.a ? 1 : 0.7); if (cl.a && !cl.b && ct > 0.12 && !calm) rx += Math.min(1, (ct - 0.12) / 0.12) * hs * 0.45; if (cl.a && cl.b && cl.win && ct > 0.17) rrot = 0.3 * Math.min(1, (ct - 0.17) / 0.1);
      if (ct > 0.75 && !calm) rx += (ct - 0.75) / 0.2 * hs * 1.2;
    }
    if (D.st !== 'done') this.crabAt(c, rph, rx, cy, rs, { flip: true, halo, rot: rrot, state: 'idle', t: v.t + 3, id: 'rv' + s.dn });
    if (cl && cl.a && cl.b && ct > 0.13 && ct < 0.34) {   // the impact star at contact (Calm: a still outline)
      const k = calm ? 1 : Math.min(1, (ct - 0.13) / 0.08), r = hs * (0.18 + 0.14 * k), mx = (yx + rx) / 2, my = cy - hs * 0.08;
      c.save(); c.globalAlpha = calm ? 0.8 : 1 - Math.max(0, (ct - 0.26) / 0.08); c.beginPath();
      for (let i = 0; i < 20; i++) { const ang = i * Math.PI / 10, rr = i % 2 ? r * 0.45 : r; const px = mx + Det.cos(ang) * rr, py = my + Det.sin(ang) * rr; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
      c.closePath(); c.fillStyle = typeof Pal !== 'undefined' ? Pal.paper : '#F4EEDD'; c.fill(); c.lineWidth = 2; c.strokeStyle = '#1B1612'; c.stroke(); c.restore();
    }
    const rlab = cl ? (cl.kin ? lab.kin : cl.b ? lab.hawk : lab.dove) : (roles && D.d > 0 ? lab.rivalOwn : lab.rival);
    if (D.st !== 'done' && rin > 0.6) Lbl.put('hk-rv', rlab, rx, cy + rs * 0.55, { size: 13 });
    if (inDuel) this.drawPips(c, G);
  },
  drawPips(c, G) {   // your rule, in the scene: your last eight picks (in L5, in this duel's role), blue filled Hawk, amber hollow Dove, newest right
    const s = this.sim.s, L = HK_LV[s.level], lab = this.content.labels, D = s.duel, k = L.roles && D ? this.sim.ctx(D.d) : 1, pk = s.c[k] || [];
    const A = typeof Pal !== 'undefined' ? Pal.A : '#6B97FF', a = typeof Pal !== 'undefined' ? Pal.a : '#F2C94C', y = Math.min(G.cy + G.hero * 0.55 + 20, G.arena.y + G.arena.h - 9), r = 4, gap = 11, x0 = G.xs - 3.5 * gap;
    c.save();
    for (let i = 0; i < 8; i++) {
      const x = x0 + i * gap, j = pk.length - 8 + i, val = j >= 0 ? pk[j] : null; c.beginPath(); c.arc(x, y, r, 0, TAU);
      if (val == null) { c.setLineDash([2, 2]); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.45)'; c.stroke(); c.setLineDash([]); }
      else if (val) { c.fillStyle = A; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke(); }
      else { c.fillStyle = 'rgba(244,238,221,.85)'; c.fill(); c.lineWidth = 2.2; c.strokeStyle = a; c.stroke(); c.lineWidth = 0.8; c.strokeStyle = '#1B1612'; c.beginPath(); c.arc(x, y, r + 1.4, 0, TAU); c.stroke(); }
    }
    c.restore();
    const h = pk.reduce((t, q) => t + q, 0), key = L.roles ? (k === 0 ? 'ruleOwn' : 'ruleInt') : L.you ? 'rule' : 'picks';
    Lbl.put('hk-pips', pk.length ? Txt.f(lab[key], { k: h, n: pk.length }) : lab.noPicks, x0 + 8 * gap, y, { size: 12, align: 'left', pill: false, ink: '#1B1612' });
  },
  drawLapse(c, G) {   // no duel while tides pass: the new beach's prize and cost, or the What if? lever, and a fast-forward mark
    const s = this.sim.s, v = this.v, lab = this.content.labels, hs = G.hero, cy = G.cy, calm = typeof Fx !== 'undefined' && Fx.calm;
    if (s.nb && !s.whatif) {
      this.shell(c, G.W * 0.32, cy, hs * 0.3); Lbl.put('hk-nbv', Txt.f(lab.worth, { n: HK_NB.V }), G.W * 0.32, cy + hs * 0.42, { size: 14 });
      this.crabAt(c, { claw: 'up', ink: 'A' }, G.W * 0.68, cy, hs * 0.8, { state: 'idle', t: v.t }); Lbl.put('hk-nbc', Txt.f(lab.costs, { n: HK_NB.C }), G.W * 0.68, cy + hs * 0.42, { size: 14 });
    } else if (s.whatif) Lbl.put('hk-wi', this.content.levers[s.whatif] || '', G.W / 2, cy - hs * 0.2, { size: 18 });
    if (s.phase === 'nbrun' || s.phase === 'auto') {   // two triangles pulse while the tides run
      const k = calm ? 1 : 0.6 + 0.4 * Det.sin(v.t * 6), x = G.W / 2, y = cy - hs * 0.05, r = 12; c.save(); c.globalAlpha = k; c.fillStyle = typeof Pal !== 'undefined' ? Pal.text : '#E8DFC9'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5;
      for (const dx of [-r, r * 0.6]) { c.beginPath(); c.moveTo(x + dx - r * 0.6, y - r); c.lineTo(x + dx + r * 0.8, y); c.lineTo(x + dx - r * 0.6, y + r); c.closePath(); c.fill(); c.stroke(); }
      c.restore(); Lbl.put('hk-lapse', lab.lapse, x, cy + hs * 0.72, { size: 13 });
    }
  },
  shell(c, x, y, r) {   // cosmetic: a whelk shell, natural paint
    c.save(); c.translate(x, y); c.rotate(-0.3);
    c.fillStyle = '#CDB596'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5;
    c.beginPath(); c.ellipse(0, 0, r, r * 0.72, 0, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = '#8F7757'; c.lineWidth = 1.8; c.beginPath(); for (let k = 0; k < 26; k++) { const a = k * 0.42, rr = r * 0.75 * (1 - k / 30); const px = Det.cos(a) * rr * 0.9, py = Det.sin(a) * rr * 0.65; if (k === 0) c.moveTo(px, py); else c.lineTo(px, py); } c.stroke();
    c.fillStyle = '#5A4634'; c.beginPath(); c.ellipse(r * 0.55, r * 0.2, r * 0.28, r * 0.2, 0.4, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-r * 0.35, -r * 0.3, r * 0.25, r * 0.12, -0.4, 0, TAU); c.fill();
    c.restore();
  },
  drawHints(c, G) {   // while you choose: a dashed ring on the rival (fight) and on you (display), with a shrinking arc for the clock
    const s = this.sim.s, v = this.v, D = s.duel, lab = this.content.labels, calm = typeof Fx !== 'undefined' && Fx.calm;
    if (s.phase !== 'duel' || !D) return;
    const A = typeof Pal !== 'undefined' ? Pal.A : '#6B97FF', a = typeof Pal !== 'undefined' ? Pal.a : '#F2C94C', pulse = calm ? 0.5 : 0.5 + 0.5 * Det.sin(v.t * 5);
    const timed = !s.unt && !(s.dn === 0 && !s.whatif), left = k => { c.save(); c.lineWidth = 4; c.strokeStyle = '#1B1612'; c.globalAlpha = 0.75; return k; };
    if (!(D.st === 'walk' || D.st === 'face') || D.a != null || v.rvIn < 0.9) return;
    const r = Math.max(44, G.hero * 0.62), boost = v.pulse > 0 ? 0.6 * v.pulse : 0;
    c.save(); c.lineWidth = 2.5 + 2 * boost; c.globalAlpha = Math.min(1, 0.35 + 0.4 * pulse + boost);
    c.strokeStyle = A; c.setLineDash([7, 5]); c.beginPath(); c.arc(G.xr, G.cy, r, 0, TAU); c.stroke();
    c.strokeStyle = a; c.beginPath(); c.arc(G.xs, G.cy, r, 0, TAU); c.stroke();
    c.restore();
    if (timed && D.st === 'face') {   // the clock: a solid arc on each ring shrinks to nothing, then you display
      const k = Math.max(0, 1 - D.t / HK_T.face);
      for (const x of [G.xs, G.xr]) { left(k); c.beginPath(); c.arc(x, G.cy, r + 5, -TAU / 4, -TAU / 4 + TAU * k); c.stroke(); c.restore(); }
    }
    if (s.dn < 4 || v.pulse > 0) {   // action words, not identities: the rival is not a hawk until it acts
      Lbl.put('hk-tapH', lab.tapH, G.xr, G.cy - G.hero * 0.62, { size: 13 });
      Lbl.put('hk-tapD', lab.tapD, G.xs, G.cy - G.hero * 0.62, { size: 13 });
    }
  },
  drawInfo(c, G) {   // chips at the top of the arena: the tide and its ×N, the payoffs in play, and one live readout per level
    const s = this.sim.s, L = HK_LV[s.level], lab = this.content.labels, nb = this.v.nbMode, T = nb ? HK_NB.T : (s.whatif ? s.endT : L.T), t = nb ? s.nb.tide : s.tide, y = G.arena.y + 12, P = this.sim.par(s);
    const box = Lbl.put('hk-tide', Txt.f(lab.tide, { n: Math.min(T, t), m: T }), 12, y, { size: 12, align: 'left', mono: true });
    if (box) Lbl.put('hk-xn', Txt.f(lab.gens, { g: P.g }), box.x + box.w + 4, y, { size: 12, align: 'left', bg: 'rgba(0,0,0,0)', ink: '#1B1612' });   // the ×N disclosure: generations compressed into one tide
    if (nb || s.phase === 'auto' || s.phase === 'nbrun' || (s.phase === 'over' && (s.whatif || s.nb))) return;
    const b2 = Lbl.put('hk-c2', Txt.f(lab.costs, { n: P.C }), G.W - 12, y, { size: 12, align: 'right' });   // V and C are on the scene, not only in pops
    if (b2) Lbl.put('hk-c1', Txt.f(lab.worth, { n: P.V }), b2.x - 4, y, { size: 12, align: 'right' });
    const z = s.hist[s.hist.length - 1], y2 = y + 22;
    if (s.tide < 1) return;   // the readouts appear once there is a tide to read (the tap words have gone by then)
    if (s.level === 2) Lbl.put('hk-pay', Txt.f(lab.payNow, { v: z.mp.toFixed(1) }), 12, y2, { size: 12, align: 'left' });   // the tragedy, in the scene
  },

  /* ---------- the live graph (strip) and the debrief chart ---------- */
  trace(title, xs, ys, series, ghost, extra) { return Object.assign({ type: 'trace', title, x: xs, y: ys, series, ghost: ghost || [], frame: 'designed' }, extra || {}); },
  notes() {
    const s = this.sim.s, L = HK_LV[s.level], lab = this.content.labels, cap = this.content.captions, h = s.hist, T = s.whatif ? s.endT : L.T, n = s.level, z = h[h.length - 1], over = s.phase === 'over';
    const xs = { lo: 0, hi: T, label: lab.tideAxis }, pct = { lo: 0, hi: 1, fmt: 'pct' }, pc = v => Math.round(100 * v) + '%', ser = f => h.map(r => [r.t, f(r)]);
    const marks = s.whatif && s.wi0 ? [s.wi0.tide] : [];   // a What if? starts here: the realised point and the changed point share this tide
    const stats = [[lab.sTide, s.tide + ' / ' + T, ''], [lab.sScore, String(Math.round(s.score)), cap.mScore]];
    if (s.dn) stats.push([lab.sEarn, ((s.eY - s.eM) / s.dn >= 0 ? '+' : '−') + Math.abs((s.eY - s.eM) / s.dn).toFixed(2), cap.mEarn]);
    let charts;
    if (this.v.nbMode || (s.nb && s.phase !== 'duel')) {   // the new beach: V/C drawn only once you have called it
      const nh = s.nb.hist, pays = nh.map(p => [this.sim.pi(1, p, HK_NB.V, HK_NB.C), this.sim.pi(0, p, HK_NB.V, HK_NB.C)]);
      const called = s.pred.nb != null || over;   // during the call, one chart only: the hawk share you are calling
      charts = [this.trace(lab.tNew, { lo: 0, hi: HK_NB.T, label: lab.tideAxis }, pct, [{ d: nh, ink: 'A', label: lab.hawks }], called ? [{ d: nh.map((v, i) => [i, HK_NB.V / HK_NB.C]), label: lab.vc }] : [])];
      if (called) charts.push(this.trace(lab.tPays, { lo: 0, hi: HK_NB.T, label: lab.tideAxis }, { lo: -1, hi: 6, label: lab.perDuel }, [{ d: pays.map(q => q[0]), ink: 'A', label: lab.hawkPad }, { d: pays.map(q => q[1]), ink: 'a', label: lab.dovePad }]));
    } else {
      stats.push([lab.sHawk, pc(z.p), cap.mHawk]); if (s.you >= 0) stats.push([lab.sKin, pc(z.f), cap.mKin]);
      if (over) stats.push([lab.sPH, z.eH.toFixed(1), cap.mPays], [lab.sPD, z.eD.toFixed(1), cap.mPays]);   // what each pays: on the card, not while you choose
      stats.push([lab.sMean, z.mp.toFixed(2), cap.mMean]);
      const vc = L.rope && (s.tide >= L.rope || over) ? [{ d: [[0, L.V / L.C], [T, L.V / L.C]], label: lab.vc }] : [];
      const hawk = this.trace(lab.tHawk, xs, pct, (n === 1 ? [{ d: ser(r => r.f), ink: 'ink', label: lab.kin, you: true }] : []).concat([{ d: ser(r => r.p), ink: 'A', label: lab.hawks }]), vc, { marks });
      const pays = this.trace(lab.tPays, xs, { lo: n === 2 ? 0 : -3, hi: n === 2 ? 8 : 4, label: lab.perDuel }, [{ d: ser(r => r.eH), ink: 'A', label: lab.hawkPad }, { d: ser(r => r.eD), ink: 'a', label: lab.dovePad }], [], { marks });
      if (n <= 1) charts = over ? [hawk, pays] : [hawk];
      else if (n === 2) charts = [this.trace(lab.tMean, xs, { lo: 0, hi: 6, label: lab.perDuel }, [{ d: ser(r => r.mp), ink: 'ink', label: lab.meanPay }], [], { marks }), hawk];
      else {
        const rr = this.sim.rule(s);
        stats.push([lab.sRule, lab.owner + ' ' + pc(rr[0]) + ' · ' + lab.intruder + ' ' + pc(rr[2]), '']);
        charts = [this.trace(lab.tKin, xs, pct, [{ d: ser(r => r.f), ink: 'ink', label: lab.kin, you: true }], [{ d: [[0, 1 / 3], [T, 1 / 3]], label: lab.third }], { marks })];   // the Transfer line: a third of the beach
      }
    }
    return { stats, charts };
  },
  debrief() {   // the level card's chart: what happened, solid; V/C dashed; your call on the new beach, a diamond with its own end label
    const s = this.sim.s, lab = this.content.labels, spec = this.notes().charts[0]; if (!spec) return null;
    if (s.nb && s.pred.nb != null) spec.series = (spec.series || []).concat([{ d: [[HK_NB.T, s.pred.nb]], ink: 'ink', label: lab.call, you: true }]);
    return spec;
  }
};
V2.push(CH_HAWKS_V2);

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.hawks = HK_TEXT.take;
  MODEL.hawks = 'Hermit crabs with fixed rules meet at random; each tide, lineages leave young in proportion to baseline plus payoff (Wright–Fisher, 150 crabs). Payoffs are symbolic; your rule is your Hawk share over your last eight duels, and your newest young inherit it.';
  RECALL.hawks = { q: 'Shells are worth 4 and an injury costs 10. Where does the hawk share settle?', opts: [['40', 'About 40%'], ['100', 'All hawks'], ['0', 'No hawks']], ans: '40', why: 'Hawk and dove pay the same when the hawk share is V/C = 4/10.' };
  BRIDGE.hawks = 'In Left Jaw, Right Jaw the rarer fish did better. Here a rule’s payoff depends on how many crabs use it.';
  if (TRANSFER.hawks) delete TRANSFER.hawks;
}
