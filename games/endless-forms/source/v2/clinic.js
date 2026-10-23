/* ================= v2/clinic.js: The Clinic (id 'clinic'), the Wave 2 rebuild of a favourite =================
   D1 §3.8, D5 §4 item 11, D6 (21 Oct addendum: own world, own palette, intro card; 22 Oct decisions 9–10: simple beats
   clever, real biology). A hospital ward at night, seen two ways: a glowing microscope view of a patient's bacteria, and
   the ward map with its beds. You are the doctor (role: the environment, the selective force). One verb: dose. Tap the
   dish for a low dose, hold it for a high one; on the ward, tap a fever to treat it. The drug level draws live against MIC
   and MPC with the mutant selection window hatched. Four levels, one idea each: the window (L1); missed doses (L2); two
   drugs, with the chapter's one prediction (L3); a plasmid moving between beds on hands (L4). Headless sim (R(), Det
   only), stars against the expectation, juice from Sim.run's events only (API_v2 §6.1). ClinicPK (one-compartment
   pharmacokinetics) is exported for D3's Tumour. */

/* ---------- the model's numbers (MODEL cards list them with their tags) ---------- */
const CL_B = { S: Det.log(8), R: Det.log(7), AB: Det.log(6) };   // growth a day: susceptible ×8, resistant ×7 (a cost), double ×6
const CL_M = {
  K: 1e10,            // the most cells a patient's lesion holds (designed)
  pmin: -3,           // the fastest a drug can kill: 95% a day at most (designed)
  imm: Det.log(100),  // immune clearance below the line: 99% a day (designed, ×N)
  line: 1e5,          // the immune line: below it the immune system wins; above it, it is swamped (designed)
  kel: Det.log(8),    // drug elimination: falls 8-fold a day (half-life 8 h; designed)
  mu: 1e-7,           // resistance mutations per division, per drug (×N; isoniazid about 3 × 10⁻⁸)
  lo: 2, hi: 24, cap: 64,   // low and high dose peaks and the ceiling, in multiples of the MIC
  mpc: 16,            // the single-step mutant's MIC (= the MPC)
  n0: 1e4, N0: 1e9    // the infection grew from 10⁴ founders to 10⁹ cells (Luria–Delbrück history)
};
const CL_W = {   // the ward (KPC Klebsiella pneumoniae, plasmid-borne carbapenemase): rates a day
  gam: 0.3,          // conjugation: plasmid transfer within a patient's gut Klebsiella (×N)
  c0: 0.45,          // the plasmid's cost (designed)
  del: 0.02,         // segregational loss (designed)
  beta: 0.12,        // transfer between beds on unwashed hands (designed)
  gut: 0.4,          // the drug's selective kill in the gut, relative to the blood (designed)
  dose: 8,           // one carbapenem dose: above the MIC for a day
  base: 0.4, rub: 0.9,   // hand-hygiene compliance: baseline (Pittet et al. 2000) and just after a hand-rub round
  fevMax: 3, heal: 0.8   // days a fever can wait before intensive care; drug-days above MIC to clear it
};
const CL_STR = {   // strains per bed kind: growth b, MIC per drug z, mutation steps [from, to]
  tb1: { k: ['S', 'M'], b: [CL_B.S, CL_B.R], z: [[1], [16]], mut: [[0, 1]] },
  tb2: { k: ['S', 'A', 'B', 'AB'], b: [CL_B.S, CL_B.R, CL_B.R, CL_B.AB], z: [[1, 1], [16, 1], [1, 16], [16, 16]], mut: [[0, 1], [0, 2], [1, 3], [2, 3]] }
};
// the chapter's one prediction (D6 decision 9): before two-drug treatment, how many of the 10⁹ cells resist both? (log₁₀ cells)
const CL_ASK = { ab: { kind: 'y', lo: -8, hi: 10, tol: 1, step: 0.2 } };
// levels: bed kind, beds, days, ticks a day (a day lasts tpd/30 s), dose budget, the weekend days, the ask, What if? levers
const CL_LV = [
  { kind: 'tb1', beds: 1, days: 14, tpd: 60, budget: 60, levers: ['lowOnly', 'stop'] },
  { kind: 'tb1', beds: 1, days: 14, tpd: 54, budget: 84, off: [2, 3, 9, 10], levers: ['noWeekend', 'stop'] },
  { kind: 'tb2', beds: 1, days: 14, tpd: 54, budget: 30, off: [2, 3, 9, 10], ask: 'ab', levers: ['onlyA'] },
  { kind: 'kpc', beds: 6, days: 20, tpd: 45, fev: 0.1, dis: 0.04, imp: 0.08, levers: ['noRub'] }
];
const CL_T = { ask: 14 };   // seconds: an unanswered ask closes

const CL_TEXT = {
  intro: {
    game: 'You are the doctor on a night ward. Every dose you give is a selection experiment on a patient’s bacteria.',
    biology: 'Drugs mostly select resistance that already exists: doses between the MIC and the MPC enrich it. On a ward, hands spread it.',
    how: 'Tap the dish for a low dose; hold it for a high one. Push the infection under the immune line; later, tap fevers and the hand rub.'
  },
  firstWords: 'A billion TB cells, a few resistant. Tap the dish: low dose. Hold: high dose.',
  hud: {
    key0: 'Window = MIC to MPC (1× to 16×): only resistant cells grow there.',
    run1: 'At weekends this patient is home and takes no pills.',
    key1: 'A fading dose spends ln 16 ÷ ln 8 = 32 h in the window.',
    weekend: 'Weekend at home: no doses today.',
    run2: 'Two drugs. Tap a pump for one, the dish for both.',
    ab: 'About {a} cells resist A and {b} resist B. Drag: how many resist both?',
    key2: 'Both ≈ {a} × {b} ÷ 10⁹ cells ≈ {e}: almost surely none.',
    key2b: 'Both ≈ {a} × {b} ÷ 10⁹ cells ≈ {e}: a jackpot, so a few may exist.',
    run3: 'Tap a fever to treat it. Tap the hand rub to clean hands.',
    key3: 'No drug: cost 0.45 + loss 0.02 beats transfer 0.3, so carriers fall.',
    wait: 'Paused at dawn. Act, then press Next day.',
    auto: 'What if? The ward runs on with one thing changed.',
    over: 'The level is done.'
  },
  whispers: {
    low: 'Low dose: inside the window.', high: 'High dose: above the MPC.', cap: 'No more: that would pass 64×.', budget: 'Dose budget spent.',
    missed: 'At home today: no dose taken.', immune: 'Under the immune line.', cured: 'Cleared. No cells left.', resist: 'Resistant cells now dominate.',
    icu: 'Moved to intensive care.', fever: 'A fever. Tap the bed to treat it.', healed: 'Fever settled.', failed: 'Drug failing: resistant infection.',
    rub: 'Hand-rub round: hands clean.', seeded: 'Plasmid reached a new bed.', admit: 'New admission.',
    drag: 'Drag the diamond first.', noFever: 'No fever here: no dose needed.', selected: 'The drug selects carriers in this gut.'
  },
  labels: {
    dish: 'lab dish', patient: 'patient', bed: 'bed {n}', mic: 'MIC', mpc: 'MPC', window: 'window', immune: 'immune line',
    day: 'day {d}/{n}', budget: 'budget {n}', drugA: 'drug A', drugB: 'drug B', low: 'low', high: 'high',
    resistant: '{n} resistant', res1: '1 resistant', none: 'none left', noRes: 'no resistant cells', aboveMpc: 'above MPC', immuneS: 'immune', xnMu: 'mutation ×3', xnGam: 'transfer ×N', home: 'at home', icuBox: 'ICU', icuN: 'ICU {n}', hands: 'hands {n}%',
    kpc: 'KPC {n}%', lock: 'Lock in', next: 'Next day', lowDose: 'Low dose', highDose: 'High dose', drugA2: 'Drug A', drugB2: 'Drug B', both2: 'Both', rub: 'Hand rub', treat: 'Treat fever',
    expected: 'expected', call: 'your call', ward: 'ward share',
    tConc: 'Drug level', tLoad: 'Cells', tBed: 'Bed carriers', tWard: 'Ward plasmid',
    sDay: 'Day', sLoad: 'Cells', sRes: 'Resistant', sBudget: 'Dose budget', sWin: 'Days in window', sIcu: 'Intensive care', sWard: 'Ward share',
    sHands: 'Hand hygiene', susc: 'susceptible', resA: 'resist A', resB: 'resist B', resAB: 'resist both', axDay: 'day'
  },
  interesting: {
    resist: 'Resistant cells took over. Doses in the window cleared their competitors and left them room.',
    budget: 'The dose budget ran out with cells still above the immune line.',
    slow: 'The infection was still above the immune line on the last day, mostly susceptible.',
    quick: 'Cleared. Doses above the MPC pushed it under the immune line, and the immune system finished it.',
    jackpot: 'This patient began with an unusually large resistant clone: an early mutation, a Luria–Delbrück jackpot.',
    weekend: 'The weekends left the drug fading through the window, and resistant cells grew each time.',
    combo: 'Cells resisting one drug were killed by the other. None resisted both.',
    abFound: 'A cell resisting both drugs appeared. Combinations cut the odds; they do not make them zero.',
    spread: 'The plasmid reached many beds. Treated carriers became sources for their neighbours.',
    contained: 'The plasmid stayed in a few beds. Clean hands held it.',
    slowed: 'The plasmid reached several patients before clean hands slowed it.',
    lowOnly: 'Low doses from that day on: resistant cells took over.',
    lowOnlyOk: 'Low doses from that day on, yet the infection cleared: it was already small.',
    stop: 'No more drug from that day: the infection grew back.',
    stopOk: 'No more drug from that day, and it still cleared: it was already under the immune line.',
    noWeekend: 'With weekend doses the infection cleared, and resistant cells never got going.',
    noWeekendBad: 'Even with weekend doses the infection was not cleared in time.',
    onlyA: 'With drug A alone, cells resisting A took over.',
    onlyAOk: 'Drug A alone still cleared it this time: few A-resistant cells were left.',
    noRub: 'With no hand-rub rounds the plasmid moved between beds more often.',
    noRubSame: 'With no hand-rub rounds the plasmid reached about as many beds this time.'
  },
  levers: { lowOnly: 'Low doses only', stop: 'Stop all drug', noWeekend: 'Weekend doses', onlyA: 'Drug A only', noRub: 'No hand rubs' },
  take: 'Drugs mostly select resistance that already exists. Doses inside the window enrich it; hands spread it.',
  body: 'Each treated fever selected the plasmid in that gut; unwashed hands carried it on. It reached {n} patients, with {i} moves to intensive care. Off the drug its cost pulls it down.',
  law: { title: 'The mutant selection window' },
  boss: { inverts: 'The dose that cures one patient selects the plasmid that hands carry on.' },
  stars: {
    discover: 'Clear the first infection, clear it with two drugs, or contain the plasmid.',
    predict: 'Call how many cells resist both drugs.',
    transfer: 'Clear an infection despite the weekends at home.'
  },
  levelTake: [
    'Low doses sit in the window: they kill susceptible cells and leave resistant ones room.',
    'Every gap lets the drug fade through the window. One drug cannot cover a weekend at home.',
    'A cell resisting both drugs is about as rare as the product of the two rates.',
    null
  ],
  levelStars: [
    { discover: 'Clear the infection within the dose budget.' },
    { transfer: 'Clear the infection despite the weekends.' },
    { discover: 'Clear the infection with two drugs.', predict: 'Call the number of cells resisting both.' },
    { discover: 'Keep the plasmid to five patients or fewer, three ICU moves at most.' }
  ],
  captions: {
    bCured: 'Cleared on day {d}, using {u} of {b} dose points.',
    bNot: 'Not cleared in {d} days. {r} percent of the cells were resistant at the end.',
    bWard: 'The plasmid reached {n} patients. Moves to intensive care: {i}.',
    liveDay: 'Day {d}. Cells 10 to the {n}. Resistant {r} percent.',
    liveWard: 'Day {d}. Ward plasmid share {w} percent. Intensive care {i}.',
    liveDose: '{k} dose given. Drug level {c} times the MIC.',
    mLoad: 'All cells in the patient, on a log scale.',
    mRes: 'Share of cells resisting the drug.',
    mWin: 'Days with the drug between MIC and MPC while above the immune line.',
    mWard: 'Average plasmid share across the beds.'
  },
  model: [
    { level: 0, simulated: 'One TB lesion of 10⁹ cells. Each day susceptible cells grow ×8 and resistant mutants ×7. The drug kills by concentration: a cell dies fastest well above its MIC.', simplification: 'One-compartment pharmacokinetics: a dose peaks at once and falls 8-fold a day. Immune clearance is a designed switch: 99% a day under 10⁵ cells, nothing above.', params: [{ name: 'growth, susceptible', value: '×8 a day', tag: 'designed' }, { name: 'capacity', value: '10¹⁰ cells', tag: 'designed' }, { name: 'dose points', value: 'low 1, high 12 (total exposure)', tag: 'designed' }, { name: 'growth, resistant', value: '×7 a day', tag: 'designed' }, { name: 'MPC ÷ MIC', value: 16, tag: 'designed' }, { name: 'drug half-life', value: '8 h', tag: 'xN', real: 'isoniazid and rifampicin about 2–4 h' }, { name: 'mutation rate', value: '10⁻⁷ a division', tag: 'xN', real: 'about 3 × 10⁻⁸ for isoniazid' }, { name: 'immune clearance', value: '99% a day under 10⁵', tag: 'xN', real: 'in TB the immune system contains rather than clears' }], cannot: 'Months of treatment, dormant cells, tissue penetration or several lesions.', nature: 'Mutants resistant to one drug are already present in large TB populations (David 1970). Streptomycin alone failed within months in the 1940s (Crofton and Mitchison 1948). How long to treat is still debated (Llewelyn et al. 2017).', contested: false, refs: ['dz2007', 'david1970', 'ld1943', 'regoes2004', 'cm1948', 'llewelyn2017'] },
    { level: 1, simulated: 'The same lesion and drug. On weekend days the patient is at home and no dose is taken.', simplification: 'Missed doses fall on fixed days, so you can plan for them. Real missed doses are scattered.', params: [{ name: 'days without a dose', value: '4 of 14', tag: 'designed' }, { name: 'dose budget', value: 84, tag: 'designed' }], cannot: 'Why patients miss doses, or doses taken late.', nature: 'Poor adherence is one route to drug resistance in TB. Differences in how patients absorb and clear drugs matter too (Srivastava et al. 2011).', contested: false, refs: ['srivastava2011', 'dz2007'] },
    { level: 2, simulated: 'Two drugs that act independently. A cell needs a mutation for each drug to resist both. Both drugs fall 8-fold a day.', simplification: 'Equal half-lives, so neither drug is left alone as the other fades. Resistance to each drug costs the same.', params: [{ name: 'mutation rate, each drug', value: '10⁻⁷', tag: 'xN', real: 'isoniazid 3 × 10⁻⁸; rifampicin 2 × 10⁻¹⁰' }, { name: 'growth, double mutant', value: '×6 a day', tag: 'designed' }], cannot: 'Drugs with different half-lives, which leave one drug working alone.', nature: 'Combination therapy became standard for TB after the streptomycin and PAS trial (Medical Research Council 1950). One plasmid can carry several resistance genes at once, so in other bacteria combinations can fail together.', contested: false, refs: ['mrc1950', 'david1970'] },
    { level: 3, simulated: 'Six patients colonised by Klebsiella pneumoniae. A plasmid with a carbapenemase moves between cells (conjugation) and between beds on hands. Fevers need the drug.', simplification: 'Each bed is one number, the share of its Klebsiella carrying the plasmid. The infection behaves as the majority does. The plasmid’s cost stays fixed.', params: [{ name: 'transfer within a patient', value: '0.3 a day', tag: 'xN', real: 'varies 1000-fold between plasmids' }, { name: 'plasmid cost', value: '0.45 a day', tag: 'designed' }, { name: 'plasmid loss', value: '0.02 a day', tag: 'designed' }, { name: 'hand hygiene, baseline', value: '40%', tag: 'realistic' }, { name: 'transfer between beds', value: '0.12 a day × unwashed share', tag: 'designed' }, { name: 'fevers', value: '10% of beds a day', tag: 'designed' }], cannot: 'Gut ecology, other species, compensation of the cost, or sequencing an outbreak.', nature: 'A plasmid persists only if transfer outpaces its cost plus loss (Stewart and Levin 1977). KPC plasmids spread between Enterobacterales and between patients (Munoz-Price et al. 2013). Costs are often compensated, so resistance can outlast the drug (Andersson and Hughes 2010).', contested: false, refs: ['sl1977', 'mp2013', 'pittet2000', 'ah2010', 'enne2001'] }
  ],
  why: {
    real: [
      'Mutants resistant to one drug already exist in large TB populations (David 1970). The mutant selection window runs from the MIC to the mutant prevention concentration (MPC; Drlica and Zhao 2007). Doses that sit there enrich those mutants.',
      'Drugs mostly select resistance rather than create it. Sub-inhibitory doses can raise mutation rates (Cirz et al. 2005) and spread resistance genes (Beaber et al. 2004).',
      'KPC plasmids move between bacteria and between patients (Munoz-Price et al. 2013). Their costs are often compensated (Andersson and Hughes 2010). Resistance can then persist after a drug is restricted (Enne et al. 2001).'
    ],
    maths: [
      'Net growth at concentration C: ψ(C) = b − (b − ψmin)·x²/(x² − ψmin/b), with x = C/MIC (Regoes et al. 2004). Zero at the MIC. A resistant mutant has its MIC at the MPC.',
      'The drug falls 8-fold a day, so every dose crosses the window on its way down. The time spent there is ln(MPC/MIC)/k, whatever the dose.',
      'Plasmid share p within a patient: dp/dt = p(1 − p)(γ − c + drug kill) − δp. Without the drug it rises only if γ > c + δ (Stewart and Levin 1977).'
    ]
  }
};

/* ---------- ClinicPK: one-compartment pharmacokinetics and the pharmacodynamic function (exported for D3's Tumour) ---------- */
const ClinicPK = {
  decay(k, dt) { return Det.exp(-k * dt); },                         // the factor a concentration keeps over dt
  dose(C, D, cap) { return C + D > cap + 1e-9 ? null : C + D; },     // null: over the ceiling
  // net growth at concentration x (in units of the strain's MIC), with crowding cr = 1 − N/K (Regoes et al. 2004, κ = 2)
  kill(b, x, pmin) { if (!(x > 0)) return 0; const x2 = x * x; return (b - pmin) * x2 / (x2 - pmin / b); },
  psi(b, x, pmin, cr) { return b * (cr == null ? 1 : cr) - this.kill(b, x, pmin); },
  window(mic, mpc, k) { return Det.log(mpc / mic) / k; }              // days a falling dose spends between MIC and MPC
};
EXPORT.ClinicPK = ClinicPK;

const CL_l10 = x => x > 0 ? Det.log(x) / Det.log(10) + 1e-12 : -9;
const CL_sum = a => { let t = 0; for (const v of a) t += v; return t; };

const CH_CLINIC_V2 = {
  id: 'clinic', v2: true, role: 'environment', place: 'lab',
  intro: { goal: 'Clear infections without selecting resistance; then stop it spreading.' },
  content: CL_TEXT,
  P: {
    mu: { v: CL_M.mu, tag: 'xN', min: 1e-9, max: 1e-6, real: 'about 3 × 10⁻⁸ (isoniazid)', label: 'mutation rate' },
    half: { v: 8, tag: 'xN', min: 2, max: 24, real: '2–4 h for TB drugs', label: 'half-life, hours' },
    mpc: { v: CL_M.mpc, tag: 'designed', min: 2, max: 64, label: 'MPC ÷ MIC' },
    line: { v: CL_M.line, tag: 'designed', min: 1e3, max: 1e7, label: 'immune line' },
    gam: { v: CL_W.gam, tag: 'xN', min: 0, max: 2, real: 'varies 1000-fold', label: 'plasmid transfer' },
    c0: { v: CL_W.c0, tag: 'designed', min: 0, max: 1, label: 'plasmid cost' }
  },
  levels: [
    { name: 'The course', adds: 'drug concentration over time', codes: ['K1'], minutes: 1.5 },
    { name: 'Weekends at home', adds: 'missed doses', codes: ['K2'], minutes: 1.5 },
    { name: 'Two drugs', adds: 'a second drug', codes: ['K3'], minutes: 1.5 },
    { name: 'The bay', adds: 'a plasmid moving between beds', codes: ['K5'], minutes: 2 }
  ],
  keys: { L: 'low dose', H: 'high dose', A: 'drug A', B: 'drug B', N: 'next day', R: 'hand rub', D: 'treat fever', P: 'predict', Enter: 'lock in' },
  untimed: true,
  teacher: { prompts: ['Why did low doses select resistant cells faster than no drug at all?', 'Why do two drugs together work when each alone fails?', '"My body became resistant." What is actually resistant, and which model simplification hides that most?'], pool: 'trace' },
  starTraits: ['resistant'],
  encodings: [   // susceptible rods pale teal, resistant rods neon magenta with a spiked or ringed outline (shape twin); the drug a cyan tide
    { k: 'susceptible', rgb: [207, 245, 238], channels: ['colour', 'luminance', 'pattern'] },
    { k: 'resistant', rgb: [255, 63, 180], channels: ['colour', 'shape', 'luminance'] },
    { k: 'resB', rgb: [198, 255, 77], channels: ['colour', 'pattern'] }
  ],

  /* ================= headless simulation (API_v2 §9.3): R(), Det only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    L(s) { return CL_LV[s.level]; },
    // a Luria–Delbrück history: the infection doubles from n0 founders to 10⁹; each doubling adds Poisson mutants per drug
    ld(kind) {
      let n = CL_M.n0, a = 0, b = 0, ab = 0; const mu = CL_M.mu;
      while (n < CL_M.N0) { const nab = Det.poisson(mu * a) + (kind === 'tb2' ? Det.poisson(mu * b) : 0); ab = 2 * ab + nab; a = 2 * a + Det.poisson(mu * n); if (kind === 'tb2') b = 2 * b + Det.poisson(mu * n); n *= 2; }
      return { a, b, ab };
    },
    // the same history in expectation (what the both-drugs call is scored against)
    ldExp() { let n = CL_M.n0, a = 0, ab = 0; const mu = CL_M.mu; while (n < CL_M.N0) { ab = 2 * ab + 2 * mu * a; a = 2 * a + mu * n; n *= 2; } return { a, ab }; },
    tbBed(kind) {
      const st = CL_STR[kind], n = new Array(st.k.length).fill(0), h = this.ld(kind);
      n[1] = h.a; if (kind === 'tb2') { n[2] = h.b; n[3] = h.ab; }
      n[0] = CL_M.N0 - CL_sum(n);
      return { kind, n, C: kind === 'tb2' ? [0, 0] : [0], used: 0, win: 0, cured: null, n0: n.slice(), under: false, res: false, doses: [] };
    },
    kpcBed(p, c) { return { kind: 'kpc', p, c, C: 0, fev: null, icu: 0, seeded: p > 0.01, pt: 0, tr: 0 }; },
    reset(level, o) {
      o = o || {};
      if (o.thaw) { this.restore(o.thaw.snap); const s = this.s; s.log = []; s.whatif = o.thaw.lever; s.ask = null; s.wi0 = this.summary(s); if (s.phase === 'ask' || s.phase === 'wait') s.phase = 'run'; return; }
      const L = CL_LV[level];
      this.s = { level, phase: 'run', day: 0, tick: 0, t: 0, beds: [], ward: null, hist: [], conc: [], asks: [], askQ: {}, askAt: {}, at0: {}, ask: null, pred: {}, exp: {}, expTr: {},
        whatif: null, wi0: null, unt: !!(o.unt || (Save.d && Save.d.ui && Save.d.ui.unt)), sel: 0, events: 0, log: [] };
      const s = this.s;
      if (L.kind === 'kpc') {
        const W = { hyg: CL_W.base, icu: 0, seen: 0, max: 0, adm: 0, rubs: 0 };
        for (let i = 0; i < L.beds; i++) s.beds.push(this.kpcBed(0, CL_W.c0));
        s.beds[0].p = 0.7; s.beds[0].seeded = true; s.beds[0].calm = 8;
        s.ward = W; W.seen = s.beds.filter(b => b.seeded).length; W.max = W.seen;
      } else for (let i = 0; i < L.beds; i++) s.beds.push(this.tbBed(L.kind));
      this.record(s);
      if (L.ask) this.openAsk(s, [], L.ask);
    },
    summary(s) { return { day: s.day, beds: JSON.parse(JSON.stringify(s.beds)), ward: s.ward ? Object.assign({}, s.ward) : null }; },

    /* ---------- one tick of a TB bed (expected: mutations at their mean, no flooring) ---------- */
    tbTick(b, D, expd) {
      const st = CL_STR[b.kind], n = b.n, M = CL_M; let N = CL_sum(n);
      const cr = 1 - N / M.K, im = N > 0 && N < M.line ? M.imm : 0;
      if (cr > 0) for (const [f, t] of st.mut) {
        if (n[f] <= 0) continue; const lam = M.mu * st.b[f] * cr * n[f] * D;
        const m = expd ? lam : lam < 30 ? Det.poisson(lam) : Math.round(lam);
        if (m > 0) { const mm = Math.min(m, n[f]); n[f] -= mm; n[t] += mm; }
      }
      for (let i = 0; i < n.length; i++) {
        if (n[i] <= 0) continue; let r = st.b[i] * cr - im;
        for (let d = 0; d < b.C.length; d++) r -= ClinicPK.kill(st.b[i], b.C[d] / st.z[i][d], M.pmin);
        n[i] *= Det.exp(r * D); if (!expd && n[i] < 0.5) n[i] = 0;
      }
      const f = this._dec || (this._dec = {}); if (f.k !== D) { f.k = D; f.v = ClinicPK.decay(M.kel, D); }
      for (let d = 0; d < b.C.length; d++) { b.C[d] *= f.v; if (b.C[d] < 1e-3) b.C[d] = 0; }
    },
    load(b) { return CL_sum(b.n); },
    resShare(b) { const N = CL_sum(b.n); return N > 0 ? (N - b.n[0]) / N : 0; },

    /* ---------- one tick of the ward ---------- */
    wardTick(s, D, o) {
      o = o || {}; const W = s.ward, B = s.beds, M = CL_M;
      let srcP = 0, srcC = 0; for (const b of B) { srcP += b.p; srcC += b.p * b.c; }
      const hyg = o.hyg != null ? o.hyg : W.hyg, inflow = CL_W.beta * (1 - hyg), others = B.length - 1;
      const ev = [];
      for (let i = 0; i < B.length; i++) {
        const b = B[i], sel = !o.noDrug && b.C > 0 ? CL_W.gut * ClinicPK.kill(CL_B.S, b.C, M.pmin) : 0;
        const mp = others <= 0 ? 0 : (srcP - b.p) / others, mc = mp > 0 ? (srcC - b.p * b.c) / (others * mp) : b.c;
        const p = b.p, cost = b.c, inn = inflow * (1 - p) * mp * D;
        let np = p + (p * (1 - p) * (CL_W.gam - cost + sel) - CL_W.del * p) * D + inn;
        if (inn > 0 && np > 0) b.c = (b.c * p + mc * inn) / (p + inn);
        np = Math.max(0, Math.min(1, np)); if (np < 1e-4) np = 0;
        b.p = np;
        if (!b.seeded && np >= 0.05) { b.seeded = true; if (!o.proj) { W.seen++; ev.push({ k: 'seeded', bed: i }); } }
        if (b.C > 0) { const f = this._decW || (this._decW = {}); if (f.k !== D) { f.k = D; f.v = ClinicPK.decay(M.kel, D); } b.C *= f.v; if (b.C < 1e-3) b.C = 0; }
        if (b.fev && !o.proj) {
          b.fev.t += D;
          const works = b.C >= 1 && !b.fev.res;
          if (works) b.fev.prog += D;
          if (b.fev.prog >= CL_W.heal) { b.fev = null; ev.push({ k: 'healed', bed: i }); }
          else if (b.fev.t >= CL_W.fevMax) { W.icu++; b.icu++; ev.push({ k: 'icu', bed: i }); this.admit(s, i, true); }
        }
      }
      return ev;
    },
    admit(s, i) { const L = CL_LV[s.level], b = s.beds[i], imp = R() < L.imp; b.p = imp ? 0.4 : 0; b.c = CL_W.c0; b.C = 0; b.fev = null; b.seeded = imp; b.pt++; s.ward.adm++; if (imp) s.ward.seen++; return imp; },
    wardShare(s) { let t = 0; for (const b of s.beds) t += b.p; return s.beds.length ? t / s.beds.length : 0; },
    carriers(s, th) { let n = 0; for (const b of s.beds) if (b.p >= (th || 0.5)) n++; return n; },

    /* ---------- records (sufficient for every chart and star) ---------- */
    record(s) {
      const L = CL_LV[s.level], r = { t: Math.round((s.day + s.tick / L.tpd) * 1000) / 1000 };
      if (L.kind === 'kpc') { r.w = this.wardShare(s); r.p = s.beds.map(b => Math.round(b.p * 1000) / 1000); r.icu = s.ward.icu; }
      else r.b = s.beds.map(b => ({ n: b.n.map(v => Math.round(CL_l10(v) * 100) / 100), r: Math.round(this.resShare(b) * 10000) / 10000 }));
      s.hist.push(r);
    },
    sample(s) {   // the concentration curve: a point every few ticks, per bed and drug (log2 of ×MIC; −2 floor)
      const L = CL_LV[s.level]; if (L.kind === 'kpc') return;
      const t = Math.round((s.day + s.tick / L.tpd) * 1000) / 1000;
      s.conc.push([t].concat(s.beds.map(b => b.C.map(c => c > 0.25 ? Math.round(Det.log(c) / Det.log(2) * 100) / 100 : -2))));
    },

    /* ---------- the frame ---------- */
    step(dt) {
      const s = this.s, ev = [];
      if (s.phase === 'over') return ev;
      if (s.phase === 'ask') { s.askT = (s.askT || 0) + dt; if (!s.unt && s.askT >= CL_T.ask) this.closeAsk(s, ev); return ev; }
      if (s.phase === 'wait') return ev;
      if (s.phase === 'auto' || s.phase === 'run') this.tickDay(s, ev);
      return ev;
    },
    tickDay(s, ev) {
      const L = CL_LV[s.level], tpd = L.tpd, D = 1 / tpd;
      if (s.tick === 0 && s.dawned !== s.day) { s.dawned = s.day; this.dawn(s, ev); }
      if (s.phase !== 'run' && s.phase !== 'auto') return;
      if (s.whatif) this.autoAct(s, ev);
      if (L.kind === 'kpc') ev.push(...this.wardTick(s, D));
      else for (let i = 0; i < s.beds.length; i++) {
        const b = s.beds[i]; if (b.cured != null) continue;
        const before = this.load(b), res0 = b.res;
        this.tbTick(b, D, false);
        const N = this.load(b);
        if (b.C[0] >= 1 && b.C[0] < CL_M.mpc && N >= CL_M.line) b.win += D;
        if (!b.under && N > 0 && N < CL_M.line) { b.under = true; ev.push({ k: 'immune', bed: i }); }
        if (b.under && N >= CL_M.line) b.under = false;
        if (N === 0 && before > 0) { b.cured = s.day + s.tick / tpd; ev.push({ k: 'cured', bed: i }); }
        b.res = N >= CL_M.line && this.resShare(b) >= 0.5; if (b.res && !res0) ev.push({ k: 'resist', bed: i });
      }
      s.tick++; if (s.tick % 3 === 0) this.sample(s);
      if (s.tick >= tpd) {
        s.tick = 0; s.day++; this.record(s);
        ev.push({ k: 'day', d: s.day });
        if (this.ended(s)) { this.finish(s, ev); return; }
        if (s.unt && !s.whatif && s.phase === 'run') s.phase = 'wait';
      }
    },
    ended(s) {
      const L = CL_LV[s.level];
      if (s.day >= L.days) return true;
      return L.kind !== 'kpc' && s.beds.every(b => b.cured != null);
    },
    dawn(s, ev) {   // the start of a day: hygiene fades, fevers, discharges (the ward); the weekend (TB)
      const L = CL_LV[s.level];
      if (L.kind === 'kpc') {
        const W = s.ward; W.hyg = CL_W.base + (W.hyg - CL_W.base) * 0.75;
        for (let i = 0; i < s.beds.length; i++) { const b = s.beds[i]; if (!b.fev && R() < L.fev && !(b.calm > s.day)) { b.fev = { t: 0, prog: 0, res: R() < b.p }; ev.push({ k: 'fever', bed: i }); } }
        for (let i = 0; i < s.beds.length; i++) { const b = s.beds[i]; if (!b.fev && R() < L.dis && !(b.calm > s.day)) { const imp = this.admit(s, i); ev.push({ k: 'admit', bed: i, imp }); } }
        return;
      }
      if (L.off && L.off.indexOf(s.day) >= 0) ev.push({ k: 'weekend', d: s.day });
    },
    home(s) { const L = CL_LV[s.level]; return !!(L.off && L.off.indexOf(s.day) >= 0) && !(s.whatif === 'noWeekend'); },

    /* ---------- the one ask (L3): the sim opens it, the view shows it, the commit is a logged action ---------- */
    openAsk(s, ev, q) {
      const A = CL_ASK[q], id = 'a' + s.level;
      s.ask = { id, kind: A.kind, lo: A.lo, hi: A.hi, tol: A.tol, q };
      s.asks.push(id); s.askQ[id] = q; s.askAt[id] = this.summary(s); s.at0[id] = this.now(s, q);
      s.back = s.phase; s.phase = 'ask'; s.askT = 0; ev.push({ k: 'ask', id, q });
    },
    closeAsk(s, ev) {
      const id = s.ask.id; s.ask = null; s.askT = 0;
      s.phase = s.back === 'auto' ? 'auto' : 'run';
      s.exp[id] = this.expect(s, id);
      ev.push({ k: 'asked', id });
    },
    now(s, q) { return q === 'ab' ? CL_l10(s.beds[0].n[1]) : 0; },   // the asked quantity's "no change" answer: the single-drug count
    expect(s, id) {   // the expectation the call is scored against: the Luria–Delbrück history in expectation, never the realised run
      if (s.askQ[id] !== 'ab') return null; const e = this.ldExp(); s.expTr[id] = [CL_l10(e.ab)]; return CL_l10(e.ab);
    },
    // What if?: the thawed run plays itself with the lever's rule
    autoAct(s, ev) {
      const L = CL_LV[s.level], k = s.whatif, a = [];
      if (L.kind === 'kpc') {
        if (s.tick === 0) {
          for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1) a.push({ k: 'dose', bed: i });
          if (k !== 'noRub' && s.ward.hyg < 0.6) a.push({ k: 'rub' });
        }
      } else {
        const per = L.tpd / 2;
        for (let i = 0; i < s.beds.length; i++) {
          const b = s.beds[i]; if (b.cured != null) continue; const N = this.load(b), C = b.C[0];
          if (k === 'lowOnly' && s.tick % per === 0) a.push({ k: 'dose', bed: i, d: 0, hi: false });
          else if ((k === 'noWeekend' || k === 'onlyA') && N >= CL_M.line && C < 8 && s.tick === 0) a.push({ k: 'dose', bed: i, d: 0, hi: true });
        }
      }
      for (const x of a) ev.push(...this.apply(s, x, true));
    },

    /* ---------- actions ---------- */
    act(a) {
      const s = this.s; if (!a || s.phase === 'over') return [];
      if (a.k === 'predict' || a.k === 'void') {
        const ev = [];
        if (s.ask && a.id === s.ask.id && s.pred[a.id] == null) {
          if (a.k === 'predict') { const A = CL_ASK[s.ask.q]; s.pred[a.id] = Math.max(A.lo, Math.min(A.hi, +a.v || 0)); ev.push({ k: 'predicted', id: a.id }); }
          this.closeAsk(s, ev);
        }
        return ev;
      }
      if (s.whatif || s.phase === 'auto') return [];
      if (a.k === 'next') { if (s.phase === 'wait') { s.phase = 'run'; return [{ k: 'go' }]; } return []; }
      if (a.k === 'sel') { if (a.bed >= 0 && a.bed < s.beds.length) { s.sel = a.bed; return [{ k: 'sel', bed: a.bed }]; } return []; }
      if (s.phase !== 'run' && s.phase !== 'wait') return [];
      return this.apply(s, a, false);
    },
    apply(s, a, auto) {
      const L = CL_LV[s.level], ev = [], i = a.bed | 0, b = s.beds[i]; if (!b && a.k !== 'rub') return ev;
      if (L.kind === 'kpc') {
        const W = s.ward;
        if (a.k === 'dose') {
          if (!b.fev) { ev.push({ k: 'nofever', bed: i }); return ev; }
          b.C = Math.max(b.C, CL_W.dose); b.tr++; ev.push({ k: 'dose', bed: i, fail: b.fev.res, auto });
        } else if (a.k === 'rub') { W.hyg = CL_W.rub; W.rubs++; ev.push({ k: 'rub' }); }
        return ev;
      }
      if (a.k !== 'dose' || b.cured != null) return ev;
      const d = L.kind === 'tb2' ? (a.d === 1 ? 1 : a.d === 2 ? 2 : 0) : 0, drugs = d === 2 ? [0, 1] : [d], hi = !!a.hi && L.kind !== 'tb2', D = hi ? CL_M.hi : CL_M.lo, cost = hi ? 12 : 1;
      if (this.home(s)) { const t = s.day + s.tick / L.tpd, last = b.doses[b.doses.length - 1]; if (!last || !last[3] || t - last[0] > 0.12) { b.doses.push([t, d, hi ? 1 : 0, 1]); ev.push({ k: 'missed', bed: i }); } return ev; }
      if (!auto && b.used + cost * drugs.length > L.budget + 1e-9) { ev.push({ k: 'budget', bed: i }); return ev; }
      for (const g of drugs) if (b.C[g] + D > CL_M.cap + 1e-9) { ev.push({ k: 'cap', bed: i }); return ev; }
      for (const g of drugs) { b.C[g] += D; b.used += cost; b.doses.push([s.day + s.tick / L.tpd, g, hi ? 1 : 0, 0]); }
      ev.push({ k: 'dose', bed: i, d, hi, auto });
      return ev;
    },
    finish(s, ev) {
      s.phase = 'over'; s.ask = null;
      if (!s.whatif) for (const id of s.asks) if (s.exp[id] == null) s.exp[id] = this.expect(s, id);
      ev.push({ k: 'over' });
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_CLINIC_V2.stars, n = s.level, mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { day: s.day, cured: s.beds.filter(b => b.cured != null).length }, interesting: this.interesting(s) };
    },
    interesting(s) {   // chosen from what happened (lessons §1.5)
      const L = CL_LV[s.level], n = s.level, b = s.beds[0];
      if (s.whatif) return this.wiText(s);
      if (L.kind === 'kpc') return s.ward.seen > 5 ? 'spread' : s.ward.seen > 3 ? 'slowed' : 'contained';
      if (n === 2) return b.n[3] > 0 || CL_sum(b.n0.slice(3)) > 0 ? 'abFound' : b.cured != null ? 'combo' : (this.resShare(b) >= 0.5 ? 'resist' : 'slow');
      if (b.cured != null) return n === 0 && b.n0[1] >= 3000 ? 'jackpot' : 'quick';
      if (this.resShare(b) >= 0.5) return n === 1 ? 'weekend' : 'resist';
      if (b.used >= L.budget - 1) return 'budget';
      return 'slow';
    },
    wiText(s) {
      const k = s.whatif, b = s.beds[0];
      if (k === 'lowOnly') return b.cured != null ? 'lowOnlyOk' : 'lowOnly';
      if (k === 'stop') return b.cured != null ? 'stopOk' : 'stop';
      if (k === 'noWeekend') return b.cured != null ? 'noWeekend' : 'noWeekendBad';
      if (k === 'onlyA') return this.resShare(b) >= 0.5 ? 'onlyA' : 'onlyAOk';
      if (k === 'noRub') { const w = s.wi0, was = w && w.ward ? w.ward.seen : 0; return s.ward.seen > was ? 'noRub' : 'noRubSame'; }
      return null;
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) { const A = CL_ASK[s.ask.q], m = Math.round((A.hi - A.lo) / A.step); for (let i = 0; i <= m; i++) out.push({ k: 'predict', id: s.ask.id, v: Math.round((A.lo + i * A.step) * 1000) / 1000 }); return out; }
      if (s.phase === 'wait') out.push({ k: 'next' });
      if (s.phase !== 'run' && s.phase !== 'wait') return out;
      const L = CL_LV[s.level];
      if (L.kind === 'kpc') { out.push({ k: 'rub' }); for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev) out.push({ k: 'dose', bed: i }); return out; }
      for (let i = 0; i < s.beds.length; i++) {
        if (s.beds[i].cured != null) continue;
        if (L.kind === 'tb2') out.push({ k: 'dose', bed: i, d: 0 }, { k: 'dose', bed: i, d: 1 }, { k: 'dose', bed: i, d: 2 });
        else out.push({ k: 'dose', bed: i, d: 0, hi: false }, { k: 'dose', bed: i, d: 0, hi: true });
      }
      return out;
    },
    near(acts, v) { let best = null, bd = 1e9; for (const a of acts) if (a.k === 'predict') { const d = Math.abs(a.v - v); if (d < bd) { bd = d; best = a; } } return best; },
    // ---- bots (tests/bots.py): fixed strategies that must never earn three stars ----
    bots: {
      alwaysA(s, acts) {   // low doses on a fixed 12-hour schedule; the ward: treat every fever, never rub; predicts the axis bottom
        if (acts.length && acts[0].k === 'predict') return acts[0];
        if (acts[0] && acts[0].k === 'next') return acts[0];
        const L = CL_LV[s.level]; if (s.tick % Math.round(L.tpd / 2) !== 0) return null;
        if (L.kind === 'kpc') return acts.find(a => a.k === 'dose') || null;
        return acts.find(a => a.k === 'dose' && !a.hi && (a.d === 0 || a.d === 2)) || null;
      },
      alwaysB(s, acts) {   // a high dose every morning (both drugs in L3); the ward: rub hands daily, never treat; predicts the axis top
        if (acts.length && acts[0].k === 'predict') return acts[acts.length - 1];
        if (acts[0] && acts[0].k === 'next') return acts[0];
        const L = CL_LV[s.level]; if (s.tick !== 0) return null;
        if (L.kind === 'kpc') return acts.find(a => a.k === 'rub') || null;
        const cand = acts.filter(a => a.k === 'dose' && (a.hi || a.d === 2)); return cand[(s.day + s.beds.length) % Math.max(1, cand.length)] || null;
      },
      greedy(s, acts) {   // hits hard while above the immune line, stops below it; the ward: treats fevers and rubs hands; predicts no change
        const S = CH_CLINIC_V2.sim;
        if (acts.length && acts[0].k === 'predict') return S.near(acts, S.now(s, s.ask.q));
        if (acts[0] && acts[0].k === 'next') return acts[0];
        const L = CL_LV[s.level];
        if (L.kind === 'kpc') { if (s.tick !== 0) return null; const f = acts.find(a => a.k === 'dose' && s.beds[a.bed].C < 1); if (f) return f; return s.ward.hyg < 0.6 ? { k: 'rub' } : null; }
        for (let i = 0; i < s.beds.length; i++) { const b = s.beds[i]; if (b.cured != null || S.load(b) < CL_M.line) continue; if (Math.max(...b.C) < CL_M.mpc) { const a = acts.find(x => x.k === 'dose' && x.bed === i && (x.hi || x.d === 2)); if (a) return a; } }
        return null;
      },
      threshold(s, acts) {   // a low dose whenever the drug falls under the MIC; the ward: treat a fever only on its second day; predicts mid-axis
        const S = CH_CLINIC_V2.sim;
        if (acts.length && acts[0].k === 'predict') { const A = CL_ASK[s.ask.q]; return S.near(acts, (A.lo + A.hi) / 2); }
        if (acts[0] && acts[0].k === 'next') return acts[0];
        const L = CL_LV[s.level];
        if (L.kind === 'kpc') { if (s.tick !== 0) return null; return acts.find(a => a.k === 'dose' && s.beds[a.bed].C < 1 && s.beds[a.bed].fev.t >= 1) || null; }
        for (let i = 0; i < s.beds.length; i++) { const b = s.beds[i]; if (b.cured != null || b.C[0] >= 1) continue; const a = acts.find(x => x.k === 'dose' && x.bed === i && !x.hi && (x.d === 0 || x.d === 2)); if (a) return a; }
        return null;
      },
      noChange(s, acts) {   // the expert dosing of greedy, but the call is "no change"
        const S = CH_CLINIC_V2.sim; if (acts.length && acts[0].k === 'predict') return S.near(acts, S.now(s, s.ask.q)); return S.bots.greedy(s, acts);
      }
    }
  },

  /* ---- stars: pure functions of the final state, scored against the expectation. Each level offers two stars at most. ---- */
  stars: {
    discover: (s, n) => {
      const L = CL_LV[n], b = s.beds[0];
      if (n === 0 || n === 2) return b.cured != null && b.used <= L.budget + 1e-9;
      if (n === 3) return s.ward.icu <= 3 && s.ward.seen <= 5;
      return false;
    },
    predict: (s, n) => {   // the chapter's one prediction (L3), scored against the expectation; "no change" can never hit
      if (n !== 2) return false;
      const id = 'a' + n, A = CL_ASK[s.askQ[id]]; if (!A || s.pred[id] == null || s.exp[id] == null) return false;
      const hit = Math.abs(s.pred[id] - s.exp[id]) <= A.tol + 1e-9, real = Math.abs(s.exp[id] - s.at0[id]) >= 2 * A.tol - 1e-9;
      return hit && real;
    },
    transfer: (s, n) => n === 1 && s.beds[0].cured != null && s.beds[0].used <= CL_LV[1].budget + 1e-9   // L1's lesson carried across the weekends
  },
  // the unit's stars across levels (D1 §3.8): Discover in two of L1, L3, L4; Predict in L3; Transfer in L2
  unitStars(lv) { const c = m => lv.filter(x => x & m).length; return (c(1) >= 2 ? 1 : 0) | (c(2) >= 1 ? 2 : 0) | (c(4) >= 1 ? 4 : 0); },
  /* result code for assignment links (30 bits): 0–2 star mask · 3–7 day cleared (31 = not) · 8–14 dose points used ·
     15–20 your call, 64 steps across its axis (63 = none) · 21–26 ward plasmid share or resistant share × 63 · 27–29 ICU moves (capped 7) */
  resultBits(s, n) {
    if (!s) return 0; const L = CL_LV[n], r = this.sim.result(), b = s.beds[0], id = 'a' + n, A = CL_ASK[s.askQ[id]];
    const call = A && s.pred[id] != null ? Math.min(62, Math.round((s.pred[id] - A.lo) / (A.hi - A.lo) * 62)) : 63;
    const share = L.kind === 'kpc' ? this.sim.wardShare(s) : this.sim.resShare(b), icu = L.kind === 'kpc' ? s.ward.icu : 0;
    return ((r ? r.mask : 0) & 7) | ((b.cured != null ? Math.min(30, Math.ceil(b.cured)) : 31) << 3) | (Math.min(127, b.used || 0) << 8) | (call << 15) | (Math.round(63 * share) << 21) | (Math.min(7, icu) << 27);
  },
  teacherStep() { const s = this.sim.s; if (!s || s.phase !== 'run') return; const d = s.day; for (let k = 0; k < 40 && this.sim.s.day === d && this.sim.s.phase === 'run'; k++) for (const e of Sim.run(this, 8 * this.sim.dt)) this.juice(e); },   // projector: one day at a time
  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = Object.assign({}, o || {});
    if (typeof Url !== 'undefined' && Url.q && Url.q.untimed != null && !/^(0|false|no|off)$/i.test(Url.q.untimed)) o.unt = true;   // ?untimed=1
    this.level = n; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._said = {}; this._spr = null; this._ghost = {};
    Sim.start(this, n, o);
    const s = this.sim.s;
    this.v = { t: 0, banner: null, rip: [], press: null, flash: 0, flashCol: '#FF3FB4', sel: s.sel || 0, links: [], tally: [], thaw: !!o.thaw, prev: null, seen: {} };
    this.slots();
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (!o.thaw) this.ghosts();
  },
  once(k) { if (this._said[k]) return false; this._said[k] = 1; return true; },
  ghosts() {   // the hand demonstrates the level's first action once; the verb's bit stops it repeating in later levels
    if (typeof Ghost === 'undefined') return;
    const s = this.sim.s, L = CL_LV[s.level], strip = () => typeof Strip !== 'undefined' && Strip.canvas ? Strip.canvas(0) : null;
    if (s.ask) { if (!this._ghost.drag) { this._ghost.drag = 1; Ghost.show({ verb: 'drag', el: strip, until: () => !this.sim.s.ask }); } return; }
    if (L.kind === 'kpc') {
      const f = s.beds.findIndex(b => b.fev); if (f >= 0 && !this._ghost.tap) { this._ghost.tap = 1; Ghost.show({ verb: 'tap', key: 'D', at: () => this.tileAt(f), until: () => !this.sim.s.beds[f].fev || this.sim.s.beds[f].C > 0 }); }
      return;
    }
    if (!this._ghost.tap) { this._ghost.tap = 1; Ghost.show({ verb: 'tap', key: 'L', at: () => { const G = this.geo(), d = G.dish[0]; return [d.x, d.y]; }, until: () => this.sim.s.beds.some(b => b.doses.length) }); }
    else if (!this._ghost.hold && s.level === 0 && s.day >= 1) { this._ghost.hold = 1; Ghost.show({ verb: 'hold', key: 'H', at: () => { const G = this.geo(), d = G.dish[0]; return [d.x, d.y]; }, until: () => this.sim.s.beds[0].doses.some(q => q[2]) }); }
  },

  /* ---------- geometry (canvas px) ---------- */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  geo() {
    const W = Stage.w, H = Stage.h, top = this.hudH() + 6, s = this.sim.s, L = CL_LV[s.level], wide = W > H * 1.05, G = { W, H, top, wide, kind: L.kind };
    if (L.kind === 'kpc') {
      const n = L.beds, cols = wide ? (n > 6 ? 4 : 3) : (n > 6 ? 3 : 2), rows = Math.ceil(n / cols), bar = 64, gx = 8, gy = 10;
      const area = { x: 10, y: top + 4, w: W - 20, h: Math.max(160, H - top - bar - 16) }, tw = (area.w - gx * (cols - 1)) / cols, th = Math.min(150, (area.h - gy * (rows - 1)) / rows);
      G.tiles = []; for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); G.tiles.push({ x: area.x + c * (tw + gx), y: area.y + r * (th + gy), w: tw, h: th }); }
      G.corr = rows > 1 ? G.tiles[cols].y - gy / 2 : area.y + th + gy / 2;
      const by = Math.min(H - bar - 6, area.y + rows * (th + gy) + 2); G.bar = { x: 10, y: by, w: W - 20, h: bar };
      G.rub = { x: G.bar.x + 30, y: by + bar / 2, r: 24 };
      return G;
    }
    const room = H - top;
    if (wide) {
      const R = Math.min(W * 0.2, room * 0.36), mx = W * 0.62;
      G.dish = [{ x: W * 0.29, y: top + room * 0.46, r: R }];
      G.mon = [{ x: mx, y: top + room * 0.14, w: W - mx - 14, h: room * 0.64 }];
    } else {
      const R = Math.min(W * 0.32, room * 0.27);
      G.dish = [{ x: W / 2 - 26, y: top + R + 22, r: R }];
      const my = top + 2 * R + 50; G.mon = [{ x: 12, y: my, w: W - 24, h: Math.max(96, H - my - 10) }];
    }
    G.pumps = L.kind === 'tb2' ? [0, 1].map(k => { const d = G.dish[0]; return { x: d.x + (k ? 1 : -1) * d.r * 0.92, y: d.y + d.r * 0.92, r: Math.max(22, d.r * 0.2) }; }) : null;
    return G;
  },
  tileAt(i) { const G = this.geo(), t = G.tiles && G.tiles[i]; return t ? [t.x + t.w / 2, t.y + t.h / 2] : [G.W / 2, G.H / 2]; },
  hrand(i, k) { let h = Math.imul((i + 1) * 2654435761 ^ (k + 7) * 40503, 2246822519); h ^= h >>> 13; h = Math.imul(h, 3266489917); h ^= h >>> 16; return (h >>> 0) / 4294967296; },
  slots() {   // rod positions in a unit disc (cosmetic), the same each level so the field feels familiar
    const out = []; for (let i = 0; i < 170; i++) { const r = 0.9 * Math.sqrt(this.hrand(i, 1)), a = TAU * this.hrand(i, 2); out.push({ x: r * Det.cos(a), y: r * Det.sin(a), a: TAU * this.hrand(i, 3), ph: 6 * this.hrand(i, 4), k: this.hrand(i, 5) }); }
    this.v.slots = out;
  },

  /* ---------- sprites: baked once per type and size (a field blits ≤ 170 a frame) ---------- */
  sprite(type, len) {   // cosmetic
    const key = type + '|' + Math.round(len), C = this._spr || (this._spr = new Map()); let cv = C.get(key); if (cv) return cv;
    const d = Math.max(1, Math.min(2, Stage.dpr || 1)), w = len * 1.9, h = len * 1.3; cv = mkCanvas(w * d, h * d); cv.cw = w; cv.ch = h;
    const c = cv.getContext('2d'); c.scale(d, d); c.translate(w / 2, h / 2);
    const L = len, Wd = len * 0.42, cap = (fill, stroke, lw) => { rrect(c, -L / 2, -Wd / 2, L, Wd, Wd / 2); c.fillStyle = fill; c.fill(); if (stroke) { c.lineWidth = lw || 1.2; c.strokeStyle = stroke; c.stroke(); } };
    const glow = (col, a) => { const g = c.createRadialGradient(0, 0, 1, 0, 0, L * 0.85); g.addColorStop(0, col + a + ')'); g.addColorStop(1, col + '0)'); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h); };
    if (type === 'S') { glow('rgba(127,232,218,', 0.22); cap('rgba(207,245,238,0.92)', 'rgba(47,211,195,0.9)', 1); c.fillStyle = 'rgba(47,140,135,0.55)'; c.fillRect(-L * 0.18, -Wd * 0.12, L * 0.36, Wd * 0.24); }
    else if (type === 'D') { cap('rgba(120,150,148,0.35)', 'rgba(150,180,178,0.35)', 1); }
    else if (type === 'B') { glow('rgba(198,255,77,', 0.35); cap('rgba(198,255,77,0.95)', '#1E3A10', 1.2); c.fillStyle = '#1E3A10'; for (let k = -1; k <= 1; k++) { c.beginPath(); c.arc(k * L * 0.22, 0, Wd * 0.14, 0, TAU); c.fill(); } }
    else {   // resistant: neon magenta; M spiked (a chromosomal mutation), P with its plasmid ring, X double-walled, AB half lime
      glow('rgba(255,63,180,', 0.5); cap('#FF3FB4', '#FFD3EE', 1.3); c.fillStyle = '#5A0F3A'; rrect(c, -L * 0.3, -Wd * 0.13, L * 0.6, Wd * 0.26, Wd * 0.13); c.fill();   // a dark core: reads in monochrome
      if (type === 'AB') { c.save(); rrect(c, -L / 2, -Wd / 2, L, Wd, Wd / 2); c.clip(); c.fillStyle = '#C6FF4D'; c.fillRect(0, -Wd, L, 2 * Wd); c.restore(); rrect(c, -L / 2, -Wd / 2, L, Wd, Wd / 2); c.lineWidth = 1.3; c.strokeStyle = '#FFD3EE'; c.stroke(); }
      if (type === 'M' || type === 'AB') { c.strokeStyle = '#FFD3EE'; c.lineWidth = 1.2; c.beginPath(); for (let k = -2; k <= 2; k++) { c.moveTo(k * L * 0.16, -Wd / 2); c.lineTo(k * L * 0.16, -Wd / 2 - L * 0.12); c.moveTo(k * L * 0.16, Wd / 2); c.lineTo(k * L * 0.16, Wd / 2 + L * 0.12); } c.stroke(); }
      if (type === 'P') { c.beginPath(); c.arc(L * 0.12, 0, Wd * 0.3, 0, TAU); c.lineWidth = 1.8; c.strokeStyle = '#FFFFFF'; c.stroke(); }
      if (type === 'X') { rrect(c, -L / 2 - 2.5, -Wd / 2 - 2.5, L + 5, Wd + 5, Wd / 2 + 2.5); c.lineWidth = 1.4; c.strokeStyle = '#FFD3EE'; c.stroke(); }
    }
    if (C.size > 60) C.clear(); C.set(key, cv); return cv;
  },

  /* ---------- the frame ---------- */
  // nothing left to decide (every bed cleared or under the immune line with the drug gone, or no dose affordable): days run ×3
  ffwd() {
    const s = this.sim.s, L = CL_LV[s.level]; if (L.kind === 'kpc' || s.phase !== 'run' || s.whatif) return 1;
    for (const b of s.beds) { if (b.cured != null) continue; const N = CL_sum(b.n), C = Math.max(...b.C), broke = L.budget - b.used < 1; if (!(broke || (N < CL_M.line && C < 1))) return 1; }
    return 3;
  },
  update(dt) {
    const ev = Sim.run(this, dt * this.ffwd()), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.flash = Math.max(0, v.flash - dt / 0.5);
    for (const r of v.rip) r.t += dt; v.rip = v.rip.filter(r => r.t < 1.4);
    for (const l of v.links) l.t += dt; v.links = v.links.filter(l => l.t < 1.6);
    for (const q of v.tally) q.t += dt;
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (v.press && !v.press.fired && v.press.hold && v.t - v.press.t0 >= 0.35) { v.press.fired = true; this.doseAt(v.press, true); }   // a hold fires while still pressed: a high dose
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { if (typeof Predict !== 'undefined') { Predict.cancel(this._asking); Predict.fold(); } this._asking = null; this._dockSig = ''; }   // the sim closed the ask (time-out or a logged void)
    if (v.lastPhase !== s.phase) { v.lastPhase = s.phase; this._dockSig = ''; this.ghosts(); }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; this._dockSig = ''; if (typeof Predict === 'undefined') return;
    // the ghost starts on the single-drug count ("no change"), and the call needs a move (an untouched ghost is no prediction)
    Predict.ask({ id: A.id, chart: 0, kind: 'y', axis: { lo: A.lo, hi: A.hi }, start: this.sim.now(s, A.q), at: 0, tol: A.tol, soft: null, needMove: true, linger: 0,
      onStill: () => this.whisper('drag'), onTimeout: () => Sim.act(this, { k: 'void', id: A.id }) });
  },
  doseAt(p, hi) {   // a press on a dish, a pump or a bed becomes one logged action
    const s = this.sim.s, L = CL_LV[s.level];
    if (p.target === 'pump') Sim.act(this, { k: 'dose', bed: 0, d: p.drug, hi: false });
    else if (p.target === 'dish') Sim.act(this, { k: 'dose', bed: p.bed, d: L.kind === 'tb2' ? 2 : 0, hi: !!hi });
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, cap = C.captions, L = CL_LV[n], final = n === CL_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (!s.whatif) for (const id of s.asks) if (s.exp[id] != null && typeof Predict !== 'undefined') Predict.reveal(id, s.exp[id], CL_ASK[s.askQ[id]].tol);
    if (!s.whatif) {
      const b = s.beds[0];
      if (L.kind === 'kpc') o.body = Txt.f(final ? C.body : cap.bWard, { n: s.ward.seen, i: s.ward.icu });
      else o.body = b.cured != null ? Txt.f(cap.bCured, { d: Math.max(1, Math.ceil(b.cured)), u: b.used, b: L.budget }) : Txt.f(cap.bNot, { d: s.day, r: Math.round(100 * this.sim.resShare(b)) });
    }
    const vials = typeof Freezer !== 'undefined' ? Freezer.list(this.id) : [];
    if (vials.length && !s.whatif && L.levers) { const want = 2, vial = vials.find(x => x.gen === want) || vials[0]; o.whatIf = { gen: vial.gen, levers: L.levers }; }
    const spec = this.debrief();
    if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, C = this.content, L = CL_LV[s.level], G = this.geo();
    const snd = (name, x, y) => { if (typeof Snd2 !== 'undefined') Snd2.play(name, { x, y, twin: name !== 'pour' && name !== 'scale' }); };   // pour and scale are twinned by this unit's own ripple and ring
    const dish = i => G.dish ? G.dish[Math.min(i, G.dish.length - 1)] : null, tile = i => this.tileAt(i);
    if (e.k === 'dose') {
      if (L.kind === 'kpc') { const p = tile(e.bed); v.rip.push({ x: p[0], y: p[1], t: 0, r: 40, col: '#8FF5EA' }); if (F) F.ring(p[0], p[1], 30, { ms: 200 }); snd('pour', p[0], p[1]); if (e.fail && this.once('failed')) this.whisper('failed'); else if (!e.fail && !e.auto && this.once('selected')) this.whisper('selected'); return; }
      const d = dish(e.bed); v.rip.push({ x: d.x, y: d.y, t: 0, r: d.r, col: e.hi ? '#FFFFFF' : '#8FF5EA', hi: e.hi });
      if (F) { F.ring(d.x, d.y, d.r * 0.5, { ms: 180 }); F.pop(e.hi ? '+24×' : '+2×', d.x, d.y - d.r - 4, 1); if (e.hi) F.burst('spark', d.x, d.y, 12, { ink: '#8FF5EA' }); }
      snd('pour', d.x, d.y);
      if (!e.auto) { const c = s.beds[e.bed].C, z = Math.max(...c); v.nd = (v.nd || 0) + 1; if (v.nd <= 3) this.whisper(z >= CL_M.mpc ? 'high' : 'low'); if (typeof Live !== 'undefined') Live.say(Txt.f(C.captions.liveDose, { k: e.hi ? C.labels.high : C.labels.low, c: Math.round(z) })); }
    }
    else if (e.k === 'missed') { const d = dish(e.bed); if (F) F.pop('0×', d.x, d.y - d.r - 4, -1); snd('tock', d.x, d.y); this.whisper('missed'); }
    else if (e.k === 'cap' || e.k === 'budget') { const d = dish(e.bed); if (F) F.ring(d.x, d.y, d.r, { ms: 300, dashed: true }); snd('tock', d.x, d.y); this.whisper(e.k); }
    else if (e.k === 'immune') { const d = dish(e.bed); if (F) F.tier(2, ms => F.ring(d.x, d.y, d.r * 1.15, { ms })); snd('scale', d.x, d.y); this.whisper('immune'); }
    else if (e.k === 'cured') { const d = dish(e.bed); if (F) { F.tier(3, ms => F.ring(d.x, d.y, d.r * 1.3, { ms })); F.burst('spark', d.x, d.y, 16, { ink: '#8FF5EA' }); } if (typeof Snd !== 'undefined') Snd.chime(); this.whisper('cured'); }
    else if (e.k === 'resist') { v.flash = 1; v.flashCol = '#FF3FB4'; if (F) F.shake(4, 160); snd('crack', G.W / 2, G.H / 2); this.whisper('resist'); }
    else if (e.k === 'icu') {
      v.tally.push({ t: 0, bed: e.bed, from: tile(e.bed) });
      if (F) F.tier(2, () => { }); snd('tock', G.W / 2, G.H / 2); this.whisper('icu');
    }
    else if (e.k === 'day') {
      if (!s.whatif && typeof Freezer !== 'undefined') Freezer.put(this.id, s.day, this.sim.snapshot());
      if (typeof Live !== 'undefined' && s.day % 3 === 0) Live.say(L.kind === 'kpc' ? Txt.f(C.captions.liveWard, { d: s.day, w: Math.round(100 * this.sim.wardShare(s)), i: s.ward.icu }) : Txt.f(C.captions.liveDay, { d: s.day, n: Math.round(CL_l10(this.sim.load(s.beds[0]))), r: Math.round(100 * this.sim.resShare(s.beds[0])) }));
      if (L.kind !== 'kpc') snd('tick', G.W - 30, G.top);
      if (s.day === 1 && !s.whatif) this.ghosts();
    }
    else if (e.k === 'weekend') { if (F) F.tier(2, ms => { v.banner = { text: C.labels.home, t: 0, ms: Math.max(800, ms + 200) }; }); }
    else if (e.k === 'fever') { const p = tile(e.bed); if (F) F.ring(p[0], p[1], 40, { ms: 300, ink: '#FF8A7A' }); snd('peep', p[0], p[1]); if (this.once('fever')) this.whisper('fever'); this.ghosts(); }
    else if (e.k === 'healed') { const p = tile(e.bed); if (F) F.burst('spark', p[0], p[1], 6, { ink: '#8FF5EA' }); this.whisper('healed'); }
    else if (e.k === 'seeded') { let j = -1, m = 0; for (let i = 0; i < s.beds.length; i++) if (i !== e.bed && s.beds[i].p > m) { m = s.beds[i].p; j = i; } if (j >= 0) v.links.push({ a: j, b: e.bed, t: 0 }); snd('swish', tile(e.bed)[0], tile(e.bed)[1]); this.whisper('seeded'); }
    else if (e.k === 'admit') { const p = tile(e.bed); if (F) F.ring(p[0], p[1], 34, { ms: 300 }); if (this.once('admit')) this.whisper('admit'); }
    else if (e.k === 'rub') { if (F) { F.burst('spark', G.rub.x, G.rub.y, 12, { ink: '#8FF5EA' }); F.ring(G.rub.x, G.rub.y, G.rub.r + 8, { ms: 300 }); } snd('swish', G.rub.x, G.rub.y); this.whisper('rub'); }
    else if (e.k === 'nofever') { const p = tile(e.bed); if (F) F.ring(p[0], p[1], 30, { ms: 240, dashed: true }); if (this.once('nofever')) this.whisper('noFever'); }
    else if (e.k === 'sel') { const p = L.kind === 'kpc' ? tile(e.bed) : [dish(e.bed).x, dish(e.bed).y]; if (F) F.ring(p[0], p[1], 36, { ms: 160 }); }
    else if (e.k === 'asked' || e.k === 'go') { if (F) F.ring(G.W / 2, G.top + 30, 20, { ms: 160 }); if (typeof Predict !== 'undefined' && Predict.fold) Predict.fold(); }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  whisper(k) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(t, 'cl-' + k); },

  /* ---------- input: tap a dish (low) or hold it (high); a pump; a bed (treat its fever); the hand rub ---------- */
  pick(x, y) {   // → {target, bed, drug} under the pointer, or null
    const G = this.geo(), s = this.sim.s;
    if (G.tiles) {
      if (G.rub && (x - G.rub.x) * (x - G.rub.x) + (y - G.rub.y) * (y - G.rub.y) <= (G.rub.r + 12) * (G.rub.r + 12)) return { target: 'rub' };
      for (let i = 0; i < G.tiles.length; i++) { const t = G.tiles[i]; if (x >= t.x && x <= t.x + t.w && y >= t.y && y <= t.y + t.h) return { target: 'bed', bed: i }; }
      return null;
    }
    if (G.pumps) for (let k = 0; k < 2; k++) { const p = G.pumps[k]; if ((x - p.x) * (x - p.x) + (y - p.y) * (y - p.y) <= (p.r + 8) * (p.r + 8)) return { target: 'pump', drug: k }; }
    for (let i = 0; i < G.dish.length; i++) { const d = G.dish[i]; if ((x - d.x) * (x - d.x) + (y - d.y) * (y - d.y) <= (d.r + 14) * (d.r + 14)) return { target: 'dish', bed: i }; }
    for (let i = 0; i < G.mon.length; i++) { const m = G.mon[i]; if (x >= m.x && x <= m.x + m.w && y >= m.y && y <= m.y + m.h) return { target: 'dish', bed: i }; }   // a tap on a bed's monitor doses that bed too
    if (s.beds.length === 1 && y > G.top) return { target: 'dish', bed: 0 };   // one patient: anywhere doses (a miss never fails)
    return null;
  },
  down(x, y) {
    const s = this.sim.s, p = this.pick(x, y); if (!p) return;
    if (s.beds.length > 1 && p.bed != null && p.bed !== s.sel && p.target !== 'rub') Sim.act(this, { k: 'sel', bed: p.bed });
    const L = CL_LV[s.level];
    this.v.press = Object.assign({ t0: this.v.t, x, y, fired: false, hold: p.target === 'dish' && L.kind !== 'tb2' }, p);
  },
  up() {
    const v = this.v, p = v.press; v.press = null; if (!p || p.fired) return;
    const s = this.sim.s, held = v.t - p.t0;
    if (p.target === 'rub') { Sim.act(this, { k: 'rub' }); return; }
    if (p.target === 'bed') { if (s.beds[p.bed].fev) Sim.act(this, { k: 'dose', bed: p.bed }); return; }
    this.doseAt(p, false);
  },
  onKey(k) {
    const s = this.sim.s, L = CL_LV[s.level], b = s.sel || 0;
    if (k === 'n' || k === 'N') Sim.act(this, { k: 'next' });
    else if (L.kind === 'kpc') {
      if (k === 'r' || k === 'R') Sim.act(this, { k: 'rub' });
      else if (k === 'd' || k === 'D' || k === 'l' || k === 'L') Sim.act(this, { k: 'dose', bed: this.feverBed() });
      else if (k === 'ArrowRight') Sim.act(this, { k: 'sel', bed: (b + 1) % s.beds.length });
      else if (k === 'ArrowLeft') Sim.act(this, { k: 'sel', bed: (b + s.beds.length - 1) % s.beds.length });
    } else if (L.kind === 'tb2') { if (k === 'a' || k === 'A') Sim.act(this, { k: 'dose', bed: 0, d: 0 }); else if (k === 'b' || k === 'B') Sim.act(this, { k: 'dose', bed: 0, d: 1 }); else if (k === 'l' || k === 'L') Sim.act(this, { k: 'dose', bed: 0, d: 2 }); }
    else {
      if (k === 'l' || k === 'L') Sim.act(this, { k: 'dose', bed: b, d: 0, hi: false });
      else if (k === 'h' || k === 'H') Sim.act(this, { k: 'dose', bed: b, d: 0, hi: true });
    }
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = CL_LV[s.level], Lb = this.content.labels, ask = !!(s.ask && this._asking), sig = ask + s.phase + (s.sel || 0) + (s.unt ? 'u' : '');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.whatif || s.phase === 'over') { Dock.set([]); return; }
    if (ask) { Dock.set([{ id: 'lock', label: Lb.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } }]); return; }
    const b = () => this.sim.s.sel || 0, act = a => () => Sim.act(this, a()), B = [];
    if (L.kind === 'kpc') B.push({ id: 'cl-rub', label: Lb.rub, key: 'R', fn: act(() => ({ k: 'rub' })) }, { id: 'cl-dose', label: Lb.treat, key: 'D', fn: act(() => ({ k: 'dose', bed: this.feverBed() })) });
    else if (L.kind === 'tb2') B.push({ id: 'cl-a', label: Lb.drugA2, key: 'A', fn: act(() => ({ k: 'dose', bed: 0, d: 0 })) }, { id: 'cl-b', label: Lb.drugB2, key: 'B', fn: act(() => ({ k: 'dose', bed: 0, d: 1 })) }, { id: 'cl-ab', label: Lb.both2, key: 'L', fn: act(() => ({ k: 'dose', bed: 0, d: 2 })) });
    else B.push({ id: 'cl-lo', label: Lb.lowDose, key: 'L', fn: act(() => ({ k: 'dose', bed: b(), d: 0, hi: false })) }, { id: 'cl-hi', label: Lb.highDose, key: 'H', fn: act(() => ({ k: 'dose', bed: b(), d: 0, hi: true })) });
    if (s.unt) B.push({ id: 'cl-next', label: Lb.next, key: 'N', primary: s.phase === 'wait', fn: act(() => ({ k: 'next' })) });
    Dock.set(B);
  },
  feverBed() { const s = this.sim.s, b = s.sel || 0; if (s.beds[b] && s.beds[b].fev) return b; let w = -1; for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1 && (w < 0 || s.beds[i].fev.t > s.beds[w].fev.t)) w = i; return w < 0 ? b : w; },   // the selected bed, else the longest-waiting untreated fever
  hud() {   // one line: the control, then (once the moment comes) the key number with its plain meaning (D6 decision 9)
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, H = this.content.hud, L = CL_LV[s.level], n = s.level, b = s.beds[0]; let t;
    if (s.ask) t = Txt.f(H.ab, { a: this.fmtN(b.n[1]), b: this.fmtN(b.n[2]) });
    else if (s.whatif) t = H.auto;
    else if (s.phase === 'over') t = H.over;
    else if (s.phase === 'wait') t = H.wait;
    else if (this.sim.home(s)) t = H.weekend;
    else if (n === 0) t = b.doses.length ? H.key0 : this.content.firstWords;
    else if (n === 1) t = s.day > L.off[0] ? H.key1 : H.run1;
    else if (n === 2) { const N = CL_sum(b.n0), e = b.n0[1] * b.n0[2] / Math.max(1, N); t = b.doses.length ? Txt.f(e < 0.1 ? H.key2 : H.key2b, { a: this.fmtN(b.n0[1]), b: this.fmtN(b.n0[2]), e: e < 0.01 ? e.toFixed(4) : e.toFixed(2) }) : H.run2; }
    else t = s.beds.some(q => q.tr > 0) && s.beds.every(q => q.C < 1) ? H.key3 : H.run3;
    const Lb = this.content.labels, days = L.days, num = Txt.f(Lb.day, { d: Math.min(days, s.day + (s.phase === 'over' ? 0 : 1)), n: days });
    if (t + num !== this._hudSig) { this._hudSig = t + num; HUD.say(t, num); }
  },
  fmtN(x) { return x < 1 ? '0' : x < 1e4 ? String(Math.round(x)) : '10' + this.sup(Math.floor(CL_l10(x))); },
  sup(n) { const d = '⁰¹²³⁴⁵⁶⁷⁸⁹'; return String(n).split('').map(ch => ch === '-' ? '⁻' : d[+ch] || '').join(''); },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const s = this.sim.s, G = this.geo(), v = this.v;
    this.drawRoom(c, G);
    if (G.tiles) this.drawWard(c, G);
    else {
      for (let i = 0; i < G.dish.length; i++) this.drawDish(c, G.dish[i], i);
      for (let i = 0; i < G.mon.length; i++) this.drawMonitor(c, G.mon[i], G.dish.length > 1 ? [i] : [0], i);
      if (G.pumps) this.drawPumps(c, G);
    }
    this.drawTally(c, G);
    if (v.flash > 0) { c.save(); c.globalAlpha = 0.25 * v.flash; c.fillStyle = v.flashCol; c.fillRect(0, 0, W, H); c.restore(); }
    if (v.banner) { const p = v.banner.t / v.banner.ms, a = p < 0.15 ? p / 0.15 : p > 0.8 ? (1 - p) / 0.2 : 1; c.save(); c.globalAlpha = Math.max(0, a); Lbl.put('cl-banner', v.banner.text, W / 2, G.top + 40, { size: 22, bg: '#E8F6F4', ink: '#041416' }); c.restore(); }
  },
  drawRoom(c, G) {   // cosmetic: the ward at night: deep teal, a floor grid, a window of moonlight
    const g = c.createLinearGradient(0, 0, 0, G.H); g.addColorStop(0, '#061C1F'); g.addColorStop(1, '#03110F');
    c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
    c.strokeStyle = 'rgba(47,211,195,0.06)'; c.lineWidth = 1; c.beginPath();
    for (let x = 0; x <= G.W; x += 32) { c.moveTo(x + 0.5, G.top); c.lineTo(x + 0.5, G.H); } for (let y = G.top; y <= G.H; y += 32) { c.moveTo(0, y + 0.5); c.lineTo(G.W, y + 0.5); }
    c.stroke();
  },
  conc(b) { return Math.max(...b.C); },
  zone(C) { return C >= CL_M.mpc ? 2 : C >= 1 ? 1 : 0; },   // 0 under the MIC, 1 the window, 2 above the MPC
  drawDish(c, d, i) {   // cosmetic: the microscope view of one patient's bacteria
    const s = this.sim.s, v = this.v, b = s.beds[i], L = CL_LV[s.level], st = CL_STR[b.kind], calm = typeof Fx !== 'undefined' && Fx.calm;
    const n = b.n, N = CL_sum(n), C = this.conc(b);
    const g = c.createRadialGradient(d.x, d.y - d.r * 0.25, d.r * 0.1, d.x, d.y, d.r); g.addColorStop(0, '#0D3A3E'); g.addColorStop(1, '#021416');
    c.save(); c.beginPath(); c.arc(d.x, d.y, d.r, 0, TAU); c.fillStyle = g; c.fill(); c.clip();
    if (C > 0.25) {   // the drug: a cyan tide whose level follows log₂ of the concentration
      const lv = clamp((Det.log(C) / Det.log(2) + 1) / 7, 0.05, 1), top = d.y + d.r - lv * 2 * d.r;
      c.fillStyle = 'rgba(143,245,234,' + (0.06 + 0.12 * lv) + ')'; c.beginPath(); c.moveTo(d.x - d.r, d.y + d.r);
      for (let x = -d.r; x <= d.r; x += 8) c.lineTo(d.x + x, top + (calm ? 0 : 4 * Det.sin(x * 0.05 + v.t * 2.2)));
      c.lineTo(d.x + d.r, d.y + d.r); c.closePath(); c.fill();
    }
    // rods: a log-scaled sample of the cells; resistant cells first, never fewer than the true count up to six
    const S = v.slots, nVis = N <= 0 ? 0 : Math.max(1, Math.round(clamp(CL_l10(N) / 10, 0.02, 1) * S.length)), types = [];
    for (let k = n.length - 1; k >= 1; k--) { if (n[k] <= 0) continue; const want = Math.max(Math.min(6, Math.ceil(n[k])), Math.round(nVis * n[k] / N)); for (let q = 0; q < want && types.length < nVis; q++) types.push(st.k[k] === 'A' ? 'M' : st.k[k]); }
    while (types.length < nVis) types.push('S');
    const kill = C > 0 && n[0] > 0 ? ClinicPK.kill(st.b[0], C / st.z[0][0], CL_M.pmin) : 0, dying = kill > st.b[0], len = Math.max(9, d.r * 0.085);
    for (let q = 0; q < types.length; q++) {
      const sl = S[q], ty = types[q], dead = ty === 'S' && dying && sl.k < 0.45;
      const jx = calm ? 0 : 2.2 * Det.sin(v.t * 0.9 + sl.ph), jy = calm ? 0 : 2.2 * Det.cos(v.t * 0.7 + sl.ph * 1.3);
      const x = d.x + sl.x * d.r + jx, y = d.y + sl.y * d.r + jy, cv = this.sprite(dead ? 'D' : ty === 'B' ? 'B' : ty, ty === 'S' || dead ? len : len * 1.18);   // resistant rods a size larger (a non-hue channel)
      c.save(); c.translate(x, y); c.rotate(sl.a + (calm ? 0 : 0.15 * Det.sin(v.t * 0.5 + sl.ph)));
      if (!dead && !calm && kill < st.b[0] * 0.5 && sl.k > 0.82) { const ph = (v.t * 0.35 + sl.ph) % 1, sp = ph > 0.7 ? (ph - 0.7) / 0.3 * len * 0.35 : 0; c.drawImage(cv, -cv.cw / 2 - sp, -cv.ch / 2, cv.cw, cv.ch); if (sp > 0) c.drawImage(cv, -cv.cw / 2 + sp, -cv.ch / 2, cv.cw, cv.ch); }   // dividing
      else c.drawImage(cv, -cv.cw / 2, -cv.ch / 2, cv.cw, cv.ch);
      c.restore();
    }
    for (const r of v.rip) { if (Math.abs(r.x - d.x) > 1 || Math.abs(r.y - d.y) > 1) continue; const k = r.t / 1.4; c.beginPath(); c.arc(d.x, d.y, d.r * (0.15 + 1.1 * k), 0, TAU); c.lineWidth = r.hi ? 5 : 3; c.strokeStyle = 'rgba(232,246,244,' + (0.7 * (1 - k)) + ')'; c.stroke(); }
    c.restore();
    // the eyepiece rim, lit by the concentration zone: cyan above the MPC, hatched magenta in the window
    const z = this.zone(C); c.save(); c.beginPath(); c.arc(d.x, d.y, d.r + 5, 0, TAU); c.lineWidth = 10; c.strokeStyle = '#0B2224'; c.stroke();
    if (z === 2) { c.lineWidth = 5; c.strokeStyle = '#8FF5EA'; c.stroke(); }
    else if (z === 1) { c.setLineDash([7, 6]); c.lineWidth = 5; c.strokeStyle = '#FF3FB4'; c.lineDashOffset = calm ? 0 : -v.t * 20; c.stroke(); c.setLineDash([]); }
    else { c.lineWidth = 1.5; c.strokeStyle = 'rgba(47,211,195,0.45)'; c.stroke(); }
    c.restore();
    const Lb = this.content.labels, zl = z === 2 ? Lb.aboveMpc : z === 1 ? Lb.window : null;
    if (zl) Lbl.put('cl-zone' + i, zl, d.x, d.y - d.r - 14, { size: 12, bg: z === 1 ? '#FF3FB4' : '#8FF5EA', ink: '#041416' });
    Lbl.put('cl-who' + i, Lb.patient, d.x - d.r * 0.7, d.y - d.r * 0.92, { size: 12, bg: '#0B2224', ink: '#E8F6F4' });
    const R = N - n[0]; Lbl.put('cl-res' + i, N <= 0 ? Lb.none : R < 1 ? Lb.noRes : R < 1.5 ? Lb.res1 : Txt.f(Lb.resistant, { n: this.fmtN(R) }), d.x, d.y + d.r + 16, { size: 13, bg: R >= 1 ? '#FF3FB4' : '#0B2224', ink: R >= 1 ? '#041416' : '#E8F6F4' });
    this.drawGauge(c, d, n, i);
  },
  drawGauge(c, d, n, i) {   // the load on a log scale beside the dish, with the immune line
    const x = d.x + d.r + 18, y0 = d.y + d.r, y1 = d.y - d.r, h = y0 - y1, Y = l => y0 - h * clamp(l / 10, 0, 1), N = CL_sum(n);
    c.save(); rrect(c, x - 6, y1, 12, h, 6); c.fillStyle = '#0B2224'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(47,211,195,0.5)'; c.stroke();
    if (N > 0) { const t = Y(CL_l10(N)); rrect(c, x - 4, t, 8, Math.max(2, y0 - t), 4); c.fillStyle = '#2FD3C3'; c.fill(); }
    const R = N - n[0]; if (R >= 1) { const t = Y(CL_l10(R)); c.fillStyle = '#FF3FB4'; c.beginPath(); c.moveTo(x - 10, t); c.lineTo(x - 4, t - 5); c.lineTo(x - 4, t + 5); c.closePath(); c.fill(); }
    c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = '#E8F6F4'; c.beginPath(); c.moveTo(x - 10, Y(5)); c.lineTo(x + 10, Y(5)); c.stroke();
    c.setLineDash([]); c.restore();
    const Lb = this.content.labels;
    Lbl.put('cl-imm' + i, Lb.immuneS, x + 12, Y(5), { size: 12, align: 'left', pill: false, ink: '#E8F6F4' });
    Lbl.put('cl-xn', Lb.xnMu, x, y0 + 14, { size: 12, pill: false, ink: '#8FF5EA' });   // the ×N disclosure: mutation rate raised for a two-week course
    Lbl.put('cl-gN', N > 0 ? '10' + this.sup(Math.floor(CL_l10(N))) : '0', x, y1 - 11, { size: 12, pill: false, ink: '#2FD3C3', mono: true });
  },
  drawPumps(c, G) {   // cosmetic: two syringe pumps, A (solid line) and B (dashed line)
    const s = this.sim.s, b = s.beds[0];
    for (let k = 0; k < 2; k++) {
      const p = G.pumps[k], on = b.C[k] >= 1; c.save(); rrect(c, p.x - p.r, p.y - p.r * 0.7, 2 * p.r, 1.4 * p.r, 8); c.fillStyle = '#0B2224'; c.fill(); c.lineWidth = 2; c.strokeStyle = on ? '#8FF5EA' : 'rgba(47,211,195,0.5)'; if (k) c.setLineDash([5, 3]); c.stroke(); c.setLineDash([]);
      const f = clamp((b.C[k] > 0.25 ? Det.log(b.C[k]) / Det.log(2) + 1 : 0) / 7, 0, 1); c.fillStyle = 'rgba(143,245,234,0.8)'; c.fillRect(p.x - p.r * 0.7, p.y + p.r * 0.35 - f * p.r * 0.8, p.r * 1.4, f * p.r * 0.8); c.restore();
      Lbl.put('cl-pump' + k, k ? 'B' : 'A', p.x, p.y - p.r * 0.25, { size: 15, bg: '#E8F6F4', ink: '#041416' });
    }
  },
  drawMonitor(c, m, beds, mi) {   // the bedside monitor: the drug level live up to now against MIC and MPC, the window hatched, doses as pills
    const s = this.sim.s, L = CL_LV[s.level], Lb = this.content.labels, calm = typeof Fx !== 'undefined' && Fx.calm, b = s.beds[beds[0]];
    c.save(); rrect(c, m.x, m.y, m.w, m.h, 12); c.fillStyle = '#062A2E'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(47,211,195,0.55)'; c.stroke();
    const P = { x: m.x + 34, y: m.y + 26, w: m.w - 44, h: m.h - 50 }, now = s.day + s.tick / L.tpd, span = m.w > 420 ? 5 : m.w > 250 ? 3.5 : 2.5, t0 = Math.max(0, now - span), t1 = Math.max(span, now);
    const X = t => P.x + (t - t0) / (t1 - t0) * P.w, Y = l => P.y + P.h - (l + 1) / 7 * P.h;
    if (L.off) for (const d of L.off) if (d + 1 > t0 && d < t1) { const a = Math.max(P.x, X(d)), z = Math.min(P.x + P.w, X(d + 1)); c.fillStyle = 'rgba(232,246,244,0.07)'; c.fillRect(a, P.y, z - a, P.h); }
    c.save(); c.beginPath(); c.rect(P.x, Y(4), P.w, Y(0) - Y(4)); c.clip(); c.strokeStyle = 'rgba(255,63,180,0.35)'; c.lineWidth = 1.5; c.beginPath(); for (let k = -P.h; k < P.w; k += 9) { c.moveTo(P.x + k, Y(0)); c.lineTo(P.x + k + (Y(0) - Y(4)), Y(4)); } c.stroke(); c.restore();
    c.setLineDash([4, 3]); c.lineWidth = 1.5; for (const [l, col] of [[0, '#E8F6F4'], [4, '#FF3FB4']]) { c.strokeStyle = col; c.beginPath(); c.moveTo(P.x, Y(l)); c.lineTo(P.x + P.w, Y(l)); c.stroke(); } c.setLineDash([]);
    for (let d = Math.ceil(t0); d <= t1; d++) { c.strokeStyle = 'rgba(47,211,195,0.15)'; c.beginPath(); c.moveTo(X(d), P.y); c.lineTo(X(d), P.y + P.h); c.stroke(); }
    const bi = beds[0] + 1, drugs = L.kind === 'tb2' ? [0, 1] : [0];
    for (const g of drugs) {   // the trace: a soft glow under a bright line; drug B dashed
      const pts = []; for (const q of s.conc) if (q[0] >= t0 - 0.05) pts.push([X(q[0]), Y(clamp(q[bi][g], -1, 6))]);
      if (pts.length > 1) for (const [lw, col] of [[6, 'rgba(143,245,234,0.18)'], [2.4, g ? '#E8F6F4' : '#8FF5EA']]) { c.lineWidth = lw; c.strokeStyle = col; if (g) c.setLineDash([6, 4]); c.beginPath(); pts.forEach((q, k) => k ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke(); c.setLineDash([]); }
    }
    for (const q of b.doses) { if (q[0] < t0) continue; const x = X(q[0]), y = P.y + P.h + 9, r = q[2] ? 6 : 4; rrect(c, x - r, y - r * 0.55, 2 * r, r * 1.1, r * 0.55); if (q[3]) { c.lineWidth = 1.5; c.strokeStyle = '#E8F6F4'; c.stroke(); c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r, y + r); c.stroke(); } else { c.fillStyle = q[1] ? '#E8F6F4' : '#8FF5EA'; c.fill(); } }
    const xn = X(now); c.strokeStyle = 'rgba(232,246,244,0.6)'; c.lineWidth = 1; c.beginPath(); c.moveTo(xn, P.y); c.lineTo(xn, P.y + P.h); c.stroke();
    if (!calm) { const ph = (this.v.t * 1.2) % 1; c.fillStyle = 'rgba(143,245,234,' + (0.8 - 0.6 * ph) + ')'; c.beginPath(); c.arc(xn, Y(clamp(this.conc(b) > 0.25 ? Det.log(this.conc(b)) / Det.log(2) : -1, -1, 6)), 3 + 4 * ph, 0, TAU); c.fill(); }
    c.restore();
    Lbl.put('cl-mic' + mi, Lb.mic, m.x + 6, Y(0), { size: 12, align: 'left', pill: false, ink: '#E8F6F4' });
    Lbl.put('cl-mpc' + mi, Lb.mpc, m.x + 6, Y(4), { size: 12, align: 'left', pill: false, ink: '#FF3FB4' });
    if (P.h > 70) Lbl.put('cl-win' + mi, Lb.window, P.x + 6, Y(2), { size: 12, align: 'left', bg: '#062A2E', ink: '#FF8CCF' });
    Lbl.put('cl-mt' + mi, beds.length && s.beds.length > 1 ? Txt.f(Lb.bed, { n: beds[0] + 1 }) : Lb.tConc, m.x + 10, m.y + 13, { size: 12, align: 'left', pill: false, ink: '#8FF5EA' });
    if (L.budget) Lbl.put('cl-bud' + mi, Txt.f(Lb.budget, { n: L.budget - b.used }), m.x + m.w - 8, m.y + 13, { size: 12, align: 'right', bg: L.budget - b.used < 12 ? '#FF8A7A' : '#E8F6F4', ink: '#041416', mono: true });
    if (this.sim.home(s) && P.w > 120) Lbl.put('cl-home' + mi, Lb.home, xn - 6, P.y + 10, { size: 12, align: 'right', bg: '#E8F6F4', ink: '#041416' });
  },
  drawWard(c, G) {   // cosmetic: the ward map: beds, patients, monitors, drips, the nurse's round, the hand rub
    const s = this.sim.s, v = this.v, W = s.ward, Lb = this.content.labels, calm = typeof Fx !== 'undefined' && Fx.calm;
    c.save(); c.setLineDash([10, 8]); c.strokeStyle = 'rgba(47,211,195,0.2)'; c.lineWidth = 2; c.beginPath(); c.moveTo(10, G.corr); c.lineTo(G.W - 10, G.corr); c.stroke(); c.setLineDash([]); c.restore();
    for (let i = 0; i < G.tiles.length; i++) this.drawBed(c, G.tiles[i], s.beds[i], i);
    for (const l of v.links) {   // a contact flash: carriers' cells on a nurse's hands reaching another bed
      const a = this.tileAt(l.a), b = this.tileAt(l.b), k = l.t / 1.6; c.save(); c.globalAlpha = 1 - k; c.setLineDash([6, 5]); c.lineDashOffset = -l.t * 40; c.lineWidth = 3; c.strokeStyle = '#FF3FB4'; c.beginPath(); c.moveTo(a[0], a[1]); c.quadraticCurveTo((a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 30, b[0], b[1]); c.stroke(); c.restore();
    }
    // the nurse walks the corridor; the hands' dots tint magenta with unwashed carriage
    const cont = clamp((1 - W.hyg) * this.sim.wardShare(s) * 3, 0, 1), px = 20 + ((v.t * 40) % (G.W - 40)), py = G.corr;
    c.save(); c.fillStyle = '#E8F6F4'; c.beginPath(); c.arc(px, py - 7, 5, 0, TAU); c.fill(); rrect(c, px - 5, py - 2, 10, 12, 4); c.fill();
    c.fillStyle = 'rgba(255,63,180,' + (0.2 + 0.8 * cont) + ')'; c.beginPath(); c.arc(px - 7, py + 4, 3, 0, TAU); c.arc(px + 7, py + 4, 3, 0, TAU); c.fill(); c.restore();
    // the bar: hand rub (tap), compliance arc, intensive care box
    const B = G.bar, R = G.rub; c.save(); rrect(c, B.x, B.y, B.w, B.h, 12); c.fillStyle = '#062A2E'; c.fill(); c.strokeStyle = 'rgba(47,211,195,0.45)'; c.lineWidth = 1.5; c.stroke();
    c.beginPath(); c.arc(R.x, R.y, R.r, 0, TAU); c.fillStyle = '#0B3438'; c.fill(); c.lineWidth = 4; c.strokeStyle = 'rgba(47,211,195,0.25)'; c.stroke();
    c.beginPath(); c.arc(R.x, R.y, R.r, -TAU / 4, -TAU / 4 + TAU * W.hyg); c.strokeStyle = W.hyg >= 0.6 ? '#8FF5EA' : '#FF8A7A'; c.stroke();
    rrect(c, R.x - 7, R.y - 6, 14, 16, 4); c.fillStyle = '#E8F6F4'; c.fill(); c.fillRect(R.x - 2, R.y - 12, 4, 6); c.fillRect(R.x - 2, R.y - 12, 9, 3);
    c.restore();
    Lbl.put('cl-hands', Txt.f(Lb.hands, { n: Math.round(100 * W.hyg) }), R.x + R.r + 10, B.y + B.h * 0.3, { size: 12, align: 'left', pill: false, ink: '#E8F6F4', mono: true });
    Lbl.put('cl-rubl', Lb.rub, R.x + R.r + 10, B.y + B.h * 0.7, { size: 12, align: 'left', pill: false, ink: '#8FF5EA' });
    Lbl.put('cl-xnw', Lb.xnGam, R.x + R.r + 10 + 6 * 13 + 30, B.y + B.h * 0.3, { size: 12, align: 'left', pill: false, ink: '#8FF5EA' });   // the ×N disclosure for the ward
    Lbl.put('cl-wsh', Txt.f(Lb.kpc, { n: Math.round(100 * this.sim.wardShare(s)) }), B.x + B.w - 8, B.y + B.h * 0.3, { size: 12, align: 'right', bg: '#FF3FB4', ink: '#041416', mono: true });
  },
  drawBed(c, t, b, i) {   // cosmetic: one bed seen from above
    const s = this.sim.s, v = this.v, Lb = this.content.labels, calm = typeof Fx !== 'undefined' && Fx.calm, sel = i === (s.sel || 0);
    c.save(); rrect(c, t.x, t.y, t.w, t.h, 10); c.fillStyle = '#082427'; c.fill(); c.lineWidth = sel ? 3 : 1.2; c.strokeStyle = sel ? '#E8F6F4' : 'rgba(47,211,195,0.35)'; c.stroke();
    const bw = t.w * 0.42, bh = t.h * 0.7, bx = t.x + 10, by = t.y + (t.h - bh) / 2;
    rrect(c, bx, by, bw, bh, 8); c.fillStyle = 'rgba(214,236,232,0.85)'; c.fill();   // the bed and sheet
    rrect(c, bx + 4, by + 4, bw - 8, bh * 0.22, 5); c.fillStyle = '#F4FBFA'; c.fill();   // pillow
    c.fillStyle = '#9DB8B4'; c.beginPath(); c.arc(bx + bw / 2, by + bh * 0.2, Math.min(bw, bh) * 0.13, 0, TAU); c.fill();   // the patient: head and shoulders under the sheet
    rrect(c, bx + bw * 0.22, by + bh * 0.34, bw * 0.56, bh * 0.56, 8); c.fillStyle = 'rgba(157,184,180,0.75)'; c.fill();
    if (b.C >= 1) { c.strokeStyle = '#8FF5EA'; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + bw + 4, t.y + 8); c.lineTo(bx + bw * 0.7, by + bh * 0.45); c.stroke(); rrect(c, bx + bw - 2, t.y + 4, 10, 14, 3); c.fillStyle = 'rgba(143,245,234,0.85)'; c.fill(); }   // the drip
    // the mini dish: carriers magenta with their plasmid ring, plasmid-free pale teal
    const r = Math.min(t.w * 0.22, t.h * 0.36), dx = t.x + t.w - r - 10, dy = t.y + t.h / 2 + 4, nr = 16, nk = b.p > 0 ? Math.max(b.p >= 0.02 ? 1 : 0, Math.round(b.p * nr)) : 0, len = Math.max(7, r * 0.34);
    c.beginPath(); c.arc(dx, dy, r, 0, TAU); c.fillStyle = '#031719'; c.fill(); c.lineWidth = 2; c.strokeStyle = b.C >= 1 ? '#8FF5EA' : 'rgba(47,211,195,0.5)'; c.stroke();
    c.save(); c.beginPath(); c.arc(dx, dy, r - 1, 0, TAU); c.clip();
    for (let q = 0; q < nr; q++) { const sl = v.slots[q * 7 % v.slots.length], cv = this.sprite(q < nk ? 'P' : 'S', len), jx = calm ? 0 : 1.5 * Det.sin(v.t + sl.ph); c.save(); c.translate(dx + sl.x * r * 0.95 + jx, dy + sl.y * r * 0.95); c.rotate(sl.a); c.drawImage(cv, -cv.cw / 2, -cv.ch / 2, cv.cw, cv.ch); c.restore(); }
    c.restore();
    if (b.fev) {   // a fever: a pulsing thermometer; its arc shows the days it can wait
      const fx = bx + bw + 14, fy = t.y + 16, k = calm ? 0.5 : 0.5 + 0.5 * Det.sin(v.t * 6), left = 1 - b.fev.t / CL_W.fevMax;
      c.beginPath(); c.arc(fx, fy, 11 + 3 * k, 0, TAU); c.fillStyle = 'rgba(255,138,122,' + (0.25 + 0.35 * k) + ')'; c.fill();
      c.beginPath(); c.arc(fx, fy, 13, -TAU / 4, -TAU / 4 + TAU * clamp(left, 0, 1)); c.lineWidth = 2.5; c.strokeStyle = '#FF8A7A'; c.stroke();
      rrect(c, fx - 2.5, fy - 8, 5, 12, 2.5); c.fillStyle = '#FFFFFF'; c.fill(); c.beginPath(); c.arc(fx, fy + 5, 4, 0, TAU); c.fill();
    }
    c.restore();
    Lbl.put('cl-bed' + i, Txt.f(Lb.bed, { n: i + 1 }), t.x + 8, t.y + t.h - 10, { size: 12, align: 'left', pill: false, ink: '#8FF5EA' });
    if (b.p >= 0.05 && t.h > 70) Lbl.put('cl-p' + i, Math.round(100 * b.p) + '%', dx, dy - r - 8, { size: 12, bg: '#FF3FB4', ink: '#041416', mono: true });
  },
  drawTally(c, G) {   // intensive care as a pictogram tally (D5 decision 17): patients move to the ICU box; nobody is shown dying
    const s = this.sim.s, v = this.v, L = CL_LV[s.level], Lb = this.content.labels;
    if (L.kind !== 'kpc') return;
    const n = s.ward.icu, box = { x: G.bar.x + G.bar.w - 120, y: G.bar.y + G.bar.h * 0.5, w: 112, h: G.bar.h * 0.46 };
    c.save(); rrect(c, box.x, box.y, box.w, box.h, 6); c.fillStyle = 'rgba(255,138,122,0.12)'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = '#FF8A7A'; c.stroke();
    const per = Math.max(1, Math.floor((box.w - 40) / 9)), shown = Math.min(n, per);
    for (let k = 0; k < shown; k++) { const x = box.x + 36 + k * 9, y = box.y + box.h / 2; c.fillStyle = '#FF8A7A'; c.beginPath(); c.arc(x, y - 4, 2.6, 0, TAU); c.fill(); rrect(c, x - 2.8, y - 1, 5.6, 7, 2); c.fill(); }
    for (const q of v.tally) if (q.t < 0.9) { const k = Math.min(1, q.t / 0.9), x = lerp(q.from[0], box.x + 36 + Math.min(shown, per) * 9, k), y = lerp(q.from[1], box.y + box.h / 2, k); c.globalAlpha = 1 - k * 0.3; c.fillStyle = '#FF8A7A'; c.beginPath(); c.arc(x, y - 6, 5, 0, TAU); c.fill(); rrect(c, x - 5, y - 1, 10, 13, 4); c.fill(); }
    c.restore();
    Lbl.put('cl-icu', n > per ? Txt.f(Lb.icuN, { n }) : Lb.icuBox, box.x + 4, box.y + box.h / 2, { size: 12, align: 'left', pill: false, ink: '#FF8A7A', mono: true });
  },

  /* ---------- the live graph (strip) and the debrief chart ---------- */
  spec(o) { return Object.assign({ type: 'cl_trace', frame: 'designed', series: [], ghost: [], lines: [] }, o); },
  notes() {
    const s = this.sim.s, L = CL_LV[s.level], Lb = this.content.labels, cap = this.content.captions, over = s.phase === 'over', n = s.level, H = s.hist;
    const xs = { lo: 0, hi: L.days, label: Lb.axDay }, pc = v => Math.round(100 * v) + '%', stats = [[Lb.sDay, Math.min(L.days, s.day) + ' / ' + L.days, '']];
    const logY = (lo, hi, z) => ({ lo, hi, fmt: v => z && v <= lo ? '0' : '10' + this.sup(Math.round(v)) });
    if (L.kind === 'kpc') {
      stats.push([Lb.sWard, pc(this.sim.wardShare(s)), cap.mWard], [Lb.sIcu, String(s.ward.icu), ''], [Lb.sHands, pc(s.ward.hyg), '']);
      const ward = this.spec({ title: Lb.tWard, x: xs, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: H.map(r => [r.t, r.w]), col: 'res', label: Lb.ward }], fold: false });
      const bed = this.spec({ title: Lb.tBed, x: xs, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: H.map(r => [r.t, r.p[0]]), col: 'res', label: Txt.f(Lb.bed, { n: 1 }) }] });
      for (let i = 1; i < s.beds.length; i++) bed.series.push({ d: H.map(r => [r.t, r.p[i]]), col: 'thin' });
      return { stats, charts: [bed, ward] };
    }
    const b = s.beds[0], tr = (k, f) => H.map(r => [r.t, f(r.b[k])]);
    stats.push([Lb.sLoad, this.fmtN(this.sim.load(b)), cap.mLoad], [Lb.sRes, pc(this.sim.resShare(b)), cap.mRes], [Lb.sBudget, (L.budget - b.used) + ' / ' + L.budget, ''], [Lb.sWin, b.win.toFixed(1), cap.mWin]);
    const conc = this.spec({ title: Lb.tConc, x: xs, y: { lo: -1, hi: 6, fmt: v => (v < 0 ? '½' : String(Math.round(Det.exp(v * Det.log(2))))) + '×' }, band: { lo: 0, hi: 4 }, lines: [{ v: 0, label: Lb.mic }, { v: 4, label: Lb.mpc }], series: [] });
    for (let g = 0; g < b.C.length; g++) conc.series.push({ d: s.conc.map(q => [q[0], q[1][g]]), col: g ? 'drugB' : 'drug', dash: g === 1, label: g ? Lb.drugB : L.kind === 'tb2' ? Lb.drugA : null });
    const lines = [{ v: 5, label: Lb.immune }], lo = L.kind === 'tb2' ? -8 : 0, fl = v => v < lo ? lo : v;
    const cells = this.spec({ title: Lb.tLoad, x: xs, y: logY(lo, 10, true), lines, series: [{ d: tr(0, q => fl(q.n[0])), col: 'sus', label: Lb.susc }] });
    if (L.kind === 'tb2') cells.series.push({ d: tr(0, q => fl(q.n[1])), col: 'res', label: Lb.resA }, { d: tr(0, q => fl(q.n[2])), col: 'resB', label: Lb.resB }, { d: tr(0, q => fl(q.n[3])), col: 'res', dash: true, label: Lb.resAB });
    else cells.series.push({ d: tr(0, q => fl(q.n[1])), col: 'res', label: Lb.resistant.replace('{n} ', '') });
    conc.fold = false;
    return { stats, charts: [cells, conc] };
  },
  tot(q) { let t = 0; for (const l of q.n) if (l > -9) t += Det.exp(l * Det.log(10)); return t > 0 ? CL_l10(t) : 0; },
  debrief() {   // the level card's chart: what happened, solid; the expectation, dashed; your call, a diamond
    const s = this.sim.s, n = s.level, Lb = this.content.labels, spec = this.notes().charts[0]; if (!spec) return null;
    const id = 'a' + n;
    if (s.askQ[id] && s.pred[id] != null && s.exp[id] != null && !s.whatif) {
      spec.ghost = [{ d: [[0, s.exp[id]], [1, s.exp[id]]], label: Lb.expected }];
      spec.series = spec.series.concat([{ d: [[0, s.pred[id]]], col: 'ink', label: Lb.call, you: true }]);
    }
    return spec;
  }
};
V2.push(CH_CLINIC_V2);

/* ---- a chart type of this unit: a trace in the clinic's own inks, with a hatched band (the window) and labelled reference lines ---- */
const CL_INK = { dusk: { sus: '#7FE8DA', res: '#FF4FBF', resB: '#C6FF4D', drug: '#8FF5EA', drugB: '#E8F6F4', thin: 'rgba(255,79,191,0.35)' }, paper: { sus: '#0F7A70', res: '#B8146F', resB: '#4F7A00', drug: '#0E6F75', drugB: '#29211B', thin: 'rgba(184,20,111,0.35)' } };
if (typeof LiveGraph !== 'undefined' && LiveGraph.T && LiveGraph.T.trace && !LiveGraph.T.cl_trace) LiveGraph.T.cl_trace = Object.assign(Object.create(LiveGraph.T.trace), {
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, K = CL_INK[T.th === 'dusk' ? 'dusk' : 'paper'], col = k => k === 'ink' ? I.text : K[k] || I.text, ends = [];
    wgAxes(c, G, spec, T);
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip(); c.lineJoin = 'round'; c.lineCap = 'round';
    if (spec.band) { const a = G.Y(spec.band.hi), b = G.Y(spec.band.lo); wgHatch(c, p.x, Math.min(a, b), p.w, Math.abs(b - a), wgRgba(K.res.length === 7 ? K.res : '#FF4FBF', 0.45), 7, 1.2); }
    c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.3); c.setLineDash([2, 3]);
    for (const m of spec.marks || []) { const x = G.X(+m); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); }
    for (const l of spec.lines || []) { const y = G.Y(l.v); c.strokeStyle = wgRgba(I.text, 0.6); c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke(); }
    c.setLineDash([]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.setLineDash([6, 4]);
    for (const g of spec.ghost || []) { const pts = this.pts(g.d, G.x0, G.st); this.path(c, G, pts); c.stroke(); const l = pts.filter(q => q[1] != null).pop(); if (l && g.label) ends.push({ y: G.Y(l[1]), text: g.label, col: I.text, dash: true }); }
    c.setLineDash([]);
    const tips = [];
    for (const s of spec.series || []) {
      const pts = this.pts(s.d, G.x0, G.st), k = col(s.col); c.lineWidth = (s.col === 'thin' ? 1.5 : s.you ? 3.5 : 3) * T.k; c.strokeStyle = k; if (s.dash) c.setLineDash([7, 4]); this.path(c, G, pts); c.stroke(); c.setLineDash([]);
      const l = pts.filter(q => q[1] != null).pop(); if (!l) continue; const x = G.X(l[0]), y = G.Y(l[1]); tips.push([x, y, s, k]);
      if (s.label || s.you) ends.push({ y, text: s.label || 'you', col: k, you: s.you });
    }
    c.restore();
    for (const l of spec.lines || []) if (l.label && !T.compact) wgText(c, l.label, p.x + p.w - 4, G.Y(l.v) - T.tk / 2 - 1, T.tk, I.text2, { align: 'right', fam: 'b', wt: 600, halo: I.surface });
    for (const [x, y, s, k] of tips) { if (y < p.y - 1 || y > p.y + p.h + 1 || s.col === 'thin') continue; if (s.you) wgDiamond(c, x, y, 6 * T.k, I.text, I.surface, 2); else wgMark(c, null, x, y, 3.5 * T.k, k, I.surface); }
    wgEnds(c, G, ends, T);
  }
});

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.clinic = CL_TEXT.take;
  MODEL.clinic = 'One-compartment pharmacokinetics against a pharmacodynamic kill curve (Regoes et al. 2004); MIC, MPC and immune clearance are designed. Mutants arise Poisson-style before and during treatment. On the ward each bed is one plasmid share, moved by conjugation, drug selection and hands.';
  RECALL.clinic = { q: 'A dose sits between the MIC and the MPC for a day. What happens to resistant mutants?', opts: [['sel', 'They are enriched'], ['made', 'The drug creates them'], ['gone', 'They are killed too']], ans: 'sel', why: 'In the window susceptible cells die while single-step mutants keep growing: the drug selects what is already there.' };
  BRIDGE.clinic = 'In the Black Country soot changed which moths survived. Here a drug changes which bacteria do.';
  if (TRANSFER.clinic) delete TRANSFER.clinic;
}
