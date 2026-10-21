/* ================= v2/casino.js: Drift Casino (id 'casino'), the Wave 2 rebuild; absorbs Castaways L1 =================
   D3 §3.2, D5 §4 item 5, D6. You are a gambler at the croupier's table and the environment that shapes N (role:
   environment). The second: drop chips on outcome bins, which ARE the histogram on the felt. The minute: a rack of jars
   (or bottles, or islets) runs, and every finished jar slides into its bin and pays against the croupier's naive odds
   (quadratic proper score), so the U builds from the jars themselves. The level adds one variable: the starting share;
   jar size; effective size (Buri's bottles and three Ne side tables); founders (the castaways); many alleles. The boss
   inverts the lesson: a crash keeps 87.5% of heterozygosity but strips half the alleles, then a zoo on a budget is
   scored on letters kept. The house adapts: each level the croupier reprices the rule you just beat; the volcano doubles
   in price. Stars read your chips and markers against the expectation, never the realised run (D2 §11).
   Headless sim (R(), Det, WF only); juice from Sim.run's events only (API_v2 §6.1). */

const DC_K = 6;   // chips paid per outcome: DC_K × (your quadratic score − the croupier's)
const DC_CRASH = { n: 4, gens: 4, at: 1, max: 4 };   // L2: before Spin, up to four jars a rack may be crashed: four beads for generations 1–4, then they refill
const DC_T = { gen: 1 / 6, genU: 0.5, buri: 0.25, side: 0.1, zoo: 0.55, settle: 1.9, storm: 1.0, land: 0.13, crash: 2.6, intro: 1.6, askMax: Infinity };   // markers never time out (D3 §3.2: untimed by default)
const DC_ZOO = { N: 60, F0: 45, G: 20, budget: 24, cBal: 6, cEq: 1, cMig: 3, reps: 200, chunk: 25, want: 9 };   // a migrant costs 3 tokens, at most one a generation: useful late, but families are the cheaper way to keep letters
const DC_BURI = { bottles: 107, flies: 16, T: 19, W: [0.15, 1, 1.85], reps: 4000 };   // W: fertility weights drawn per fly (designed; gives Ne ≈ 11.5)
const DC_SIDES = [   // Ne side tables (L3): census N, the expected Ne (formula), the trap answer, the formula pill shown at the reveal
  { id: 'neA', kind: 'sex', N: 40, f: 36, Ne: 4 * 36 * 4 / 40, trap: 40, cue: 'cueA', fx: 'fA' },
  { id: 'neB', kind: 'cycle', sizes: [50, 50, 50, 5, 50], Ne: 5 / (4 / 50 + 1 / 5), trap: 41, cue: 'cueB', fx: 'fB' },   // the crash falls inside the 20 measured generations
  { id: 'neC', kind: 'equal', N: 16, Ne: (4 * 16 - 2) / 2, trap: 16, cue: 'cueC', fx: 'fC' }
];
const DC_SIDE = { T: 20, reps: 300, show: 40 };

/* the prediction gestures: kind, axis, tolerance, chart, the grid that bots and replays use */
const DC_ASK = {
  mean: { kind: 'y', lo: 0, hi: 1, tol: 0.08, chart: 0, at: 30, step: 0.02, start: 0.5 },
  half: { kind: 'x', lo: 0, hi: 40, tol: 2, chart: 0, step: 0.5, start: 20 },
  h19: { kind: 'y', lo: 0, hi: 0.55, tol: 0.03, chart: 0, at: 19, step: 0.005, start: 0.28 },
  gap: { kind: 'y', lo: 0, hi: 0.5, tol: 0.04, chart: 0, at: 5, step: 0.01, start: 0 },
  neA: { kind: 'x', lo: 0, hi: 48, rel: 0.2, chart: 1, step: 0.5, start: 40 },
  neB: { kind: 'x', lo: 0, hi: 48, rel: 0.2, chart: 1, step: 0.5, start: 41 },
  neC: { kind: 'x', lo: 0, hi: 48, rel: 0.2, chart: 1, step: 0.5, start: 16 },
  hk: { kind: 'y', lo: 0, hi: 1, tol: 0.08, chart: 0, at: 1, step: 0.02, start: 0.5 },
  al: { kind: 'y', lo: 0, hi: 12, tol: 2, chart: 1, at: 1, step: 1, start: 11 }
};

/* per level: what the table is, its rack, its bins, the croupier's belief, its gestures and What if? levers.
   needT: chip tables that must pass for Predict, on top of the level's marker (D2 §11: the marker is always required) */
const DC_LV = [
  { kind: 'jars', jars: 12, T: 30, bins: 'out', crp: 'coin', tables: [{ N: 10, p: 0.8 }, { N: 10, p: 0.3 }], ask: { table: 0, id: 'mean' }, needT: 1, levers: ['big', 'half'] },
  { kind: 'jars', jars: 12, T: 40, bins: 'time', crp: 'n20', volcano: true, tables: [{ N: 6, p: 0.5 }, { N: 20, p: 0.5 }, { N: 200, p: 0.5 }], ask: { table: 0, id: 'half' }, needT: 2, levers: ['vol10', 'small'] },
  { kind: 'buri', bins: 'buri', crp: 'n16', tables: [{ N: 16, p: 0.5 }], ask: { table: 0, id: 'h19' }, needT: 1, levers: ['equal', 'wild'] },
  { kind: 'islets', isl: 12, bins: 'share', crp: 'half', tables: [{ n: 5, fixed: true }, { n: 2 }, { n: 12 }], ask: { table: 0, id: 'gap' }, needT: 2, levers: ['huge', 'pair'] },
  { kind: 'zoo', bins: null, levers: ['mutation', 'bigzoo'] }
];
const DC_BINS = {   // label keys (content.labels) per bin set
  out: ['allBlue', 'allAmber', 'mixed'], time: ['by5', 'by10', 'by20', 'by40', 'not40'], buri: ['lost', 'mixed', 'fixed'],
  share: ['s0', 's1', 's2', 's3', 's4']
};
const DC_WHY = [{ real: [], maths: [2] }, { real: [], maths: [3] }, { real: [2, 3], maths: [4] }, { real: [4], maths: [5] }, { real: [0, 1], maths: [0, 1] }];   // Why? chunks per level (indices into content.why)
const DC_STARS_BY = [{ discover: 'sDiscT', predict: 'sPred1' }, { discover: 'sDiscT', predict: 'sPred2' }, { discover: 'sDiscB', predict: 'sPredB', transfer: 'sTransB' }, { discover: 'sDiscT', predict: 'sPred2' }, { discover: 'sDiscZ', transfer: 'sTransZ' }];   // caption keys
/* the look (D6 decision 7): a riverboat saloon. Burgundy damask walls, mahogany and brass, a green baize table, burgundy
   chips, glass marbles in the jars; the castaways and the zoo are brown anoles on sand and scrub in a teal sea. Blue and amber
   appear only where they are gene copies (marbles, founders' badges, vials, the outcome icons). CVD.gamut passes on DC_LOOK. */
const DC_LOOK = {
  wall: '#33161C', wall2: '#40202A', wood: '#4E2C1D', wood2: '#6B3F28', brass: '#B8954A', brass2: '#E0C27E', brassD: '#7C6230',
  felt: '#1E5A43', felt2: '#2B7254', feltD: '#123D2D', chip: '#8C2438', chipD: '#561520', cream: '#F1E6C8', parch: '#EDE2C6',
  sea: '#1F4C4B', sand: '#CDB68A', scrub: '#5C7A3A', liz: '#7A5434', lizD: '#4B321E', lizM: '#6A4A2E'
};
const DC_STARS = [['discover', 'predict'], ['discover', 'predict'], ['discover', 'predict', 'transfer'], ['discover', 'predict'], ['discover', 'transfer']];   // the stars each level can award

/* ---------- exact science helpers: + − × ÷ only (no Math.exp/log/pow), cached; used by the sim, the stars and the oracle ---------- */
const DC = {
  pmf(n, p) {   // binomial(n, p) probabilities by recurrence from the larger tail, so nothing underflows below 0.5^n
    const out = new Float64Array(n + 1);
    if (!(p > 0)) { out[0] = 1; return out; }
    if (p >= 1) { out[n] = 1; return out; }
    if (p > 0.5) { const r = this.pmf(n, 1 - p); for (let k = 0; k <= n; k++) out[k] = r[n - k]; return out; }
    const q = 1 - p; let f = WF._powi(q, n); out[0] = f;
    for (let k = 0; k < n; k++) { f *= (n - k) / (k + 1) * p / q; out[k + 1] = f; }
    return out;
  },
  _ch: {},
  chain(N, k0, T) {   // Wright–Fisher with N haploid copies: the distribution of the count at t = 0..T
    const key = N + ':' + k0 + ':' + T; if (this._ch[key]) return this._ch[key];
    const rows = []; for (let i = 0; i <= N; i++) rows.push(this.pmf(N, i / N));
    let d = new Float64Array(N + 1); d[k0] = 1; const out = [d];
    for (let t = 0; t < T; t++) {
      const nd = new Float64Array(N + 1);
      for (let i = 0; i <= N; i++) { const w = d[i]; if (!(w > 0)) continue; const r = rows[i]; for (let j = 0; j <= N; j++) nd[j] += w * r[j]; }
      d = nd; out.push(d);
    }
    this._ch[key] = out; return out;
  },
  absorbed(N, k0, t, T) { const h = this.chain(N, k0, T)[t]; return h[0] + h[N]; },
  _ab: {},
  absorbC(N, k0, T, at) {   // P(settled by t), t = 0..T, for a jar crashed to DC_CRASH.n beads for DC_CRASH.gens generations from generation `at` (no crash if at < 0)
    const key = N + ':' + k0 + ':' + T + ':' + at; if (this._ab[key]) return this._ab[key];
    if (!(at >= 0)) { const h = this.chain(N, k0, T); return (this._ab[key] = h.map(d => d[0] + d[N])); }
    let size = N, d = new Float64Array(N + 1); d[k0] = 1; const out = [0], rows = {};
    const row = (n, i, m) => { const k = n + ':' + i + ':' + m; return rows[k] || (rows[k] = this.pmf(n, i / m)); };
    for (let t = 1; t <= T; t++) {
      const ns = t >= at && t < at + DC_CRASH.gens ? DC_CRASH.n : N, nd = new Float64Array(ns + 1);
      for (let i = 0; i <= size; i++) { const w = d[i]; if (!(w > 0)) continue; if (i === 0) { nd[0] += w; continue; } if (i === size) { nd[ns] += w; continue; } const r = row(ns, i, size); for (let j = 0; j <= ns; j++) nd[j] += w * r[j]; }
      d = nd; size = ns; out.push(d[0] + d[size]);
    }
    return (this._ab[key] = out);
  },
  settledBy(N, p, T, f, at) {   // P(settled by t) for a rack where a share f of the jars was crashed from generation `at` (the mixture the bins see)
    const k = Math.round(N * p), A0 = this.absorbC(N, k, T, -1); if (!(f > 0)) return A0;
    const A1 = this.absorbC(N, k, T, at == null ? DC_CRASH.at : at); return A0.map((x, t) => (1 - f) * x + f * A1[t]);
  },
  outBins(N, p, T) { const d = this.chain(N, Math.round(N * p), T)[T]; return [d[N], d[0], 1 - d[N] - d[0]]; },   // all blue, all amber, still mixed
  timeBins(N, p, T, f) { const A = this.settledBy(N, p, T, f); return [A[5], A[10] - A[5], A[20] - A[10], A[40] - A[20], 1 - A[40]]; },   // generations 1–5, 6–10, 11–20, 21–40, not by 40
  median(N, p, T, f) {   // the generation by which half the jars have settled (interpolated); T if never
    const A = this.settledBy(N, p, T, f); let prev = 0;
    for (let t = 1; t <= T; t++) { const a = A[t]; if (a >= 0.5) return t - 1 + (0.5 - prev) / (a - prev || 1); prev = a; }
    return T;
  },
  meanAbsorb(N, p, Tmax) {   // mean generations to fixation or loss (exact chain, truncated at Tmax)
    const k = Math.round(N * p), h = this.chain(N, k, Tmax); let m = 0, prev = 0;
    for (let t = 1; t <= Tmax; t++) { const a = h[t][0] + h[t][N]; m += t * (a - prev); prev = a; }
    return m + Tmax * (1 - prev);
  },
  buriBins16() { const d = this.chain(32, 16, DC_BURI.T)[DC_BURI.T]; return [d[0], 1 - d[0] - d[32], d[32]]; },   // the croupier: 16 flies, 32 copies, ideal
  ghost16(t) { let h = 0.5; for (let i = 0; i < t; i++) h *= 1 - 1 / 32; return h; },   // his heterozygosity line: 16 ideal flies, 32 copies
  _buri: {},
  buriMC(mode) {   // the expectation for Buri's model: a private, fixed-seed replicate run (never R(); deterministic)
    mode = mode || 'w'; if (this._buri[mode]) return this._buri[mode];
    const rnd = rng(1956 + mode.length), T = DC_BURI.T, reps = DC_BURI.reps, H = new Float64Array(T + 1), bins = [0, 0, 0], hist = new Float64Array(33);
    for (let r = 0; r < reps; r++) {
      let b = this.buriFounders();
      H[0] += this.buriH(b) / reps;
      for (let t = 1; t <= T; t++) { b = this.buriGen(b, mode, rnd); H[t] += this.buriH(b) / reps; }
      const k = this.buriK(b); hist[k] += 1 / reps; bins[k === 0 ? 0 : k === 32 ? 2 : 1] += 1 / reps;
    }
    return (this._buri[mode] = { H: Array.from(H), bins, hist: Array.from(hist) });
  },
  buriFounders() { const m = [], f = []; for (let i = 0; i < 8; i++) { m.push([1, 0]); f.push([1, 0]); } return { m, f }; },   // Buri began with bw75/bw heterozygotes
  buriK(b) { let k = 0; for (const g of b.m) k += g[0] + g[1]; for (const g of b.f) k += g[0] + g[1]; return k; },
  buriH(b) { const p = this.buriK(b) / 32; return 2 * p * (1 - p); },   // the bottle's own 2pq: every copy is counted, so no sample correction (same scale as his line)
  W(mode) { return mode === 'eq' ? null : mode === 'wild' ? [0.02, 1.98] : DC_BURI.W; },
  // one generation of 8 ♂ + 8 ♀: each fly draws a fertility weight; each of 8 sons and 8 daughters picks a mother and a father
  // by weight and one copy from each. Mode 'eq': every pair raises exactly one son and one daughter (family-size variance 0).
  buriGen(b, mode, rnd, stat) {   // stat (tests only): {k: []} collects each parent's number of young, for family-size variance
    const k = this.buriK(b); if (!stat && (k === 0 || k === 32)) return b;
    const r = rnd || R, W = this.W(mode), m = [], f = [];
    if (!W) {
      const perm = [0, 1, 2, 3, 4, 5, 6, 7]; for (let i = 7; i > 0; i--) { const j = Math.floor(r() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
      for (let i = 0; i < 8; i++) { const mo = b.f[i], fa = b.m[perm[i]]; m.push([mo[r() < 0.5 ? 0 : 1], fa[r() < 0.5 ? 0 : 1]]); f.push([mo[r() < 0.5 ? 0 : 1], fa[r() < 0.5 ? 0 : 1]]); }
      if (stat) for (let i = 0; i < 16; i++) stat.k.push(2);
      return { m, f };
    }
    const wm = [], wf = []; let tm = 0, tf = 0;
    for (let i = 0; i < 8; i++) { const w = W[Math.floor(r() * W.length)]; wm.push(w); tm += w; }
    for (let i = 0; i < 8; i++) { const w = W[Math.floor(r() * W.length)]; wf.push(w); tf += w; }
    const pick = (w, tot) => { let u = r() * tot; for (let i = 0; i < 8; i++) { u -= w[i]; if (u < 0) return i; } return 7; };
    const cm = stat ? new Array(8).fill(0) : null, cf = stat ? new Array(8).fill(0) : null;
    const kid = () => { const im = pick(wf, tf), ip = pick(wm, tm), mo = b.f[im], fa = b.m[ip]; if (stat) { cf[im]++; cm[ip]++; } return [mo[r() < 0.5 ? 0 : 1], fa[r() < 0.5 ? 0 : 1]]; };
    for (let i = 0; i < 8; i++) { m.push(kid()); f.push(kid()); }
    if (stat) for (let i = 0; i < 8; i++) stat.k.push(cm[i], cf[i]);
    return { m, f };
  },
  founders(n) {   // the amber share of 2n founder copies from a large mainland at 50% amber, in the five share bins
    const d = this.pmf(2 * n, 0.5), out = [0, 0, 0, 0, 0];
    for (let k = 0; k <= 2 * n; k++) out[this.shareBin(k / (2 * n))] += d[k];
    return out;
  },
  shareBin(x) { return x < 0.25 - 1e-9 ? 0 : x < 0.45 - 1e-9 ? 1 : x <= 0.55 + 1e-9 ? 2 : x <= 0.75 + 1e-9 ? 3 : 4; },
  near(n) { const d = this.pmf(2 * n, 0.5); let s = 0; for (let k = 0; k <= 2 * n; k++) if (Math.abs(k / (2 * n) - 0.5) <= 0.1 + 1e-9) s += d[k]; return s; },
  gap(n) { const d = this.pmf(2 * n, 0.5); let s = 0; for (let k = 0; k <= 2 * n; k++) s += d[k] * Math.abs(k / (2 * n) - 0.5); return s; },   // expected distance of an islet's amber share from the mainland's 50%
  crashH: 1 - 1 / 8,                                   // E[H after] / H before for a crash to 8 copies
  crashKept() { return 12 * (1 - WF._powi(11 / 12, 8)); },   // expected alleles left of 12 equally common ones
  // ---- the quadratic proper score and the star thresholds ----
  S(q, o) { let s = 0; for (const x of q) s += x * x; return 2 * (q[o] || 0) - s; },
  ES(q, e) { let s = 0, d = 0; for (let i = 0; i < e.length; i++) { s += (q[i] || 0) * e[i]; d += (q[i] || 0) * (q[i] || 0); } return 2 * s - d; },
  uni(n) { const u = []; for (let i = 0; i < n; i++) u.push(1 / n); return u; },
  thr(e, c) {   // halfway from the better of the croupier and an even spread to the best possible bet (the croupier's odds always fail)
    const best = this.ES(e, e), u = this.ES(this.uni(e.length), e), cs = this.ES(c, e);
    const ref = cs >= best - 0.02 ? u : Math.max(cs, u);
    return ref + 0.5 * (best - ref);
  },
  pass(q, e, c) { return this.ES(q, e) >= this.thr(e, c) - 1e-9; },
  gain(q, e, c) { return this.ES(q, e) - this.ES(c, e); },
  // ---- the zoo (boss): 60 lizards, 12 alleles; the breeding rule under the keeper's levers ----
  zooBreed(pop, eq, bal, r) {
    const N = pop.length, F = bal ? N / 2 : Math.round(N * DC_ZOO.F0 / DC_ZOO.N), fem = [], mal = [];
    for (const b of pop) (b.f ? fem : mal).push(b);
    if (!fem.length || !mal.length) return pop;
    const mo = [], fa = [], shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
    if (eq) {   // equal families: every female and every male parents as near the same number of young as the numbers allow.
      // Both lists are shuffled, so which parents raise the odd extra young changes every generation (family size is never inherited).
      for (let i = 0; i < N; i++) { mo.push(fem[i % fem.length]); fa.push(mal[i % mal.length]); }
      shuf(mo); shuf(fa);
    } else for (let i = 0; i < N; i++) { mo.push(fem[Math.floor(r() * fem.length)]); fa.push(mal[Math.floor(r() * mal.length)]); }
    const sex = []; for (let i = 0; i < N; i++) sex.push(i < F); shuf(sex);   // each young's sex is a random draw from the zoo's quota, never tied to its mother's slot
    const kids = [];
    for (let i = 0; i < N; i++) kids.push({ f: sex[i], a: [mo[i].a[r() < 0.5 ? 0 : 1], fa[i].a[r() < 0.5 ? 0 : 1]] });
    return kids;
  },
  zooCount(pop) { const n = new Array(12).fill(0); for (const b of pop) { n[b.a[0]]++; n[b.a[1]]++; } return n; },
  kept(n) { let k = 0; for (const x of n) if (x > 0) k++; return k; },
  het(n) { let t = 0, s = 0; for (const x of n) t += x; if (!t) return 0; for (const x of n) s += (x / t) * (x / t); return 1 - s; }
};

/* ================= all words (API_v2 §9.2); tests/lint_text.js checks every budget ================= */
const DC_TEXT = {
  firstWords: 'The croupier calls every jar a coin toss. Tap a bin to bet a chip.',
  intro: {   // the opening description card (D6 decision 8; 00_entry.js Intro): 1–2 sentences, ≤ 35 words each
    game: 'You are a gambler at a riverboat casino, betting chips against the croupier. The stakes are jars of glass beads, bottles of flies and island lizards, all left to chance.',
    biology: 'Genetic drift is chance in sampling: allele shares wander, fastest in small populations. A neutral allele takes over with a chance equal to its share, and crashes strip rare alleles.',
    how: 'Tap a bin on the felt to bet a chip, then Spin. Bet close to the true odds to beat the croupier, and drag the marker to predict.'
  },
  hud: {
    bet0: 'Bet all ten chips on how the jars end. {c} left.',
    bet1: 'Bet when jars settle; he treats all as jars of 20. Tap jars to crash.',
    bet2: 'Bet 107 bottles at generation 19. Families vary beyond chance.',
    bet3a: 'Five lizards raft to each islet. Bet the islets’ amber share.',
    bet3: 'Hold the beach to size the storm. Bet the islets, then release.',
    spin: 'All ten chips are down. Press Spin.',
    release: 'All ten chips are down. Press Release.',
    mean: 'Where will the average jar sit at generation 30?',
    half: 'By which generation will half the 6-bead jars settle?',
    h19: 'Heterozygosity in Buri’s bottles at generation 19?',
    gap: 'How far from half will the average islet start?',
    neA: '36 females and 4 males. What is this cage’s Ne?',
    neB: 'Fifty flies, crashing to five every fifth generation. What is Ne?',
    neC: 'Sixteen flies; every pair raises exactly two young. What is Ne?',
    hk: 'What share of heterozygosity will survive the eruption?',
    al: 'How many of the 12 letters will survive?',
    run0: 'Each new bead copies a random bead from the jar before.',
    run1: 'Settled jars slide into their bins. Crashed jars drop to four beads.',
    run2: 'Sixteen flies breed each generation. Families vary more than chance makes them.',
    run3: 'The storm rafts lizards out. Each islet starts from its founders.',
    side: 'Three hundred cages drift. Their heterozygosity gives their Ne.',
    erupt: 'Tap the volcano.',
    crash: 'Four lizards survive the eruption.',
    zooIntro: 'Keepers saved 60 lizards first. Keep their letters for 20 generations.',
    zoo: 'Spend tokens to keep letters alive.',
    paused: 'Paused. Press Step for one generation, or Play.',
    pays: 'The house pays you {c}.',
    takes: 'The house takes {c}.',
    even: 'You broke even on this table.',
    whatif: 'What if? The table runs again with one thing changed.',
    over: 'Done.'
  },
  whispers: {
    full: 'All ten chips are down.', need: 'Bet all ten chips first.', pinned: 'Your jar. Its line is bold.',
    hold: 'Hold a bin to take a chip back.', odds: 'Dashed boxes: his bets. Beat them.', pills: 'Each pill shows what one jar pays.',
    harder: 'He backed this bin harder than you.', spread: 'Piling chips elsewhere costs you here.',
    volHint: 'Tap jars to crash them. He ignores crashes.', volSet: 'Crashed: four beads for four generations.', volMax: 'Four crashes a rack at most.', volOff: 'Crash called off.',
    reprice: 'The croupier changes his odds.', lost: 'Letter {x} is gone.', back: 'Letter {x} is back!',
    broke: 'Out of tokens.', oneGen: 'One migrant a generation at most.', equal: 'Every pair raises the same brood.', balanced: 'Thirty females and thirty males now.',
    migrant: 'A migrant lizard arrives.', storm: 'The storm grows.', fixed: 'Five founders this time.', empty: 'Nothing to take back.',
    neDef: 'Ne: ideal population size that drifts as fast.', cleared: 'Chips back in your stack.', same: 'Same bets as last table.'
  },
  labels: {
    allBlue: 'All blue', allAmber: 'All amber', mixed: 'Still mixed', by5: 'By gen 5', by10: '6–10', by20: '11–20', by40: '21–40', not40: 'Not by 40',
    lost: 'Lost', fixed: 'Fixed', s0: '< 25%', s1: '25–44%', s2: 'Near half', s3: '56–75%', s4: '> 75%',
    coin: 'Coin toss!', n20: 'All alike!', n16: 'Sixteen flies!', half: 'Exactly half!', halves: 'Variety halves!',
    table: 'Table {n}/{m}', gen: 'Gen {n}/{m}', beads: '{n} beads', you: 'you', chips: '{n} chips', chip1: '{n} chip', storm: '×{n} lizards',
    mainland: 'Mainland', amber: '{n}% amber', letters: 'Letters', tokens: 'Tokens {n}', het: 'H', ne: 'Ne {n}', expected: 'expected', exp: 'exp', avg: 'avg', average: 'average',
    croupier: 'croupier', young: 'dots: young', yourJar: 'your jar', jar: 'jar', fit: 'fit {n} ±{e}', yourNe: 'you {n}', females: '{n} females', males: '{n} males', crash: 'crash', mutN: 'mutation ×N',
    spin: 'Spin', release: 'Release', lock: 'Lock in', erupt: 'Erupt', play: 'Play', pause: 'Pause', step: 'Step', bal: 'Balance', clear: 'Clear', same: 'Same bets',
    eq: 'Families', mig: 'Migrant', bigger: 'Bigger', smaller: 'Smaller', bw75: 'bw75', bw: 'bw',
    pBal: 'Balance {n}', pEq: 'Families 1/gen', pMig: 'Migrant {n}/gen',
    cueA: 'only 4 males', cueB: 'crash to 5', cueC: 'two per pair', fA: '4×36×4÷40 = 14', fB: '5÷(4/50+1/5) = 18', fC: '(4×16−2)÷2 = 31',
    tBlue: 'Blue share', tPurse: 'Purse', tSettled: 'Jars settled', tH: 'Heterozygosity', tNe: 'Effective size', tNear: 'Gap from half',
    tHk: 'H kept', tAl: 'Letters left', tKept: 'Letters kept', axGen: 'generation', axFounders: 'founders', axTable: 'table',
    n6: '6 beads', n20b: '20 beads', n200: '200 beads', sixteen: '16 flies', yourPlan: 'your plan', noPlan: 'no plan', vol10: 'volcano', small20: 'jars of 20',
    house: 'House', wins: 'House wins!', pays: 'House pays!', ruler: 'Ne ruler', next: 'Next', zoo: 'The zoo', census: 'Count heads!', nLetters: '{n} letters'
  },
  panels: [],
  interesting: {
    lost0: 'The house won. A colour takes the jar with a chance equal to its share, not a coin toss.',
    lost1: 'Small jars settle within a few generations. Jars of 200 spread out but almost never settle in forty.',
    lost2: 'Sixteen flies drifted like about eleven. The real spread was wider than the croupier’s.',
    lost3: 'A few founders are a small sample. They often miss the mainland share; five hit exactly half only one time in four.',
    lost4: 'About half the letters were lost. Balanced sexes and equal families, together, slow the loss.',
    lost4b: 'A few letters too many were lost. Both levers, from the start, keep nine or more.',
    big: 'Jars of 100 beads spread out, but most were still mixed after thirty generations.',
    half: 'From half blue, about half the jars went each way.',
    vol10: 'Four generations at four beads settled more than half the big jars. A crash speeds drift.',
    small: 'Jars of 20 settled at the croupier’s pace. He was right about these.',
    equal: 'With equal families, heterozygosity fell more slowly than the sixteen-fly line.',
    wild: 'With very unequal families, sixteen flies drifted like about seven.',
    huge: 'Forty founders: most islets started near half amber, and none far from it.',
    pair: 'Two founders: islets could start only at 0, 25, 50, 75 or 100% amber.',
    mutation: 'Over 2,000 generations mutation made letters now and then; drift took most of them again.',
    bigzoo: 'A zoo of 300 kept nearly every letter for 20 generations, with no help.'
  },
  levers: { big: 'Jars of 100', half: 'Start at half', vol10: 'Volcano everywhere', small: 'Jars of 20', equal: 'Equal families', wild: 'Unequal families', huge: 'Forty founders', pair: 'Two founders', mutation: 'Add mutation', bigzoo: 'Zoo of 300' },
  take: 'Drift is chance in sampling. A neutral copy wins with its share; small populations lose alleles fast.',
  body: 'Recap: a colour wins with its share. Small jars settle fast. Families more unequal than chance shrink Ne. Founders are a sample.',
  law: { title: 'Chance has no memory' },
  boss: { inverts: 'Before, H was the casualty. After a brief crash, H holds while alleles vanish.' },
  stars: {
    discover: 'Beat the croupier’s odds, or keep nine letters in the zoo.',
    predict: 'Hit the marker, and bet chips close to the true odds.',
    transfer: 'Judge Ne on the side tables, or the eruption’s cost.'
  },
  captions: {
    take0: 'A neutral colour takes the jar with a chance equal to its share. The average jar stays put.',
    take1: 'Drift is fast in small jars. From half, N copies settle in about 1.4N generations on average. Half settle sooner.',
    take2: 'Families more unequal than chance made sixteen flies drift like about eleven. Ne, not N, sets the pace of drift.',
    take3: 'A founding group is a sample. The fewer the founders, the further they scatter from the mainland.',
    takeBoss: 'The crash kept {h}% of H but lost {l} of 12 letters.',
    invBody: 'After a brief crash, alleles vanish faster than heterozygosity.',
    bodyZoo: 'Your zoo plan kept {z} of 12 letters in expectation.',
    edge: 'You won {w} chips. Expected for your bets: {e}.',
    sDiscT: 'Beat the croupier’s odds over the level’s tables.', sDiscB: 'Beat the croupier’s odds on Buri’s bottles.', sDiscZ: 'Keep nine of 12 letters in the zoo, in expectation.',
    sPred1: 'Hit the marker, and bet one table close to the true odds.', sPred2: 'Hit the marker, and bet two tables close to the true odds.',
    sPredB: 'Hit the marker, and bet the bottles close to the true odds.', sTransB: 'Judge Ne within a fifth on two of the three side tables.', sTransZ: 'Judge the eruption’s cost on both markers.',
    liveGen: 'Generation {g}. {f} of {n} settled.',
    liveTable: 'Table done. Chips won {w}.',
    liveCrash: '{k} of 12 letters survived. Heterozygosity kept {h} percent.',
    liveZoo: 'Generation {g}. {k} letters left.',
    liveSide: 'Fitted Ne {f}, give or take {e}. You said {y}. Stars read the formula, {r}.',
    keySay: 'Arrows move the marker. Enter locks it in.',
    mPurse: 'Chips you hold.', mSettled: 'Jars fixed or lost so far.', mKept: 'Alleles still present.', mH: 'Chance two random copies differ.',
    mNe: 'Size of an ideal population that drifts as fast.', mNear: 'Average distance of an islet’s amber share from 50%.'
  },
  model: [
    { level: 0, simulated: 'Twelve jars of 10 beads. Each generation every bead copies a random bead from the jar before (Wright–Fisher). No bead colour is better.', simplification: 'A bead is a gene copy, not an animal. Generations do not overlap.', params: [{ name: 'beads a jar', value: 10, tag: 'designed' }, { name: 'generations', value: 30, tag: 'designed' }, { name: 'jars a table', value: 12, tag: 'designed' }], cannot: 'Selection, mutation or migration.', nature: 'Every finite population drifts. Small isolated ones drift fastest.', contested: false, refs: ['wright1931', 'fisher1930', 'kimura1962'] },
    { level: 1, simulated: 'Racks of 6, 20 and 200 beads from half blue, run for 40 generations. Before Spin you may crash up to four jars: each holds four beads in generations 1 to 4.', simplification: 'Above 30 expected beads a draw uses the normal approximation. The croupier prices every jar like a jar of 20 and ignores crashes.', params: [{ name: 'jar sizes', value: '6, 20, 200', tag: 'designed' }, { name: 'generations', value: 40, tag: 'designed' }, { name: 'crash', value: '4 beads, generations 1–4', tag: 'designed' }, { name: 'crashes a rack', value: 'up to 4', tag: 'designed' }], cannot: 'Overlapping generations or age structure.', nature: 'On average, N copies from half settle in about 2N ln 2 generations.', contested: false, refs: ['kimura1969'] },
    { level: 2, simulated: '107 bottles of 8 males and 8 females, all bw75/bw at first, for 19 generations. Each fly gets a low, middling or high fertility weight. Families vary more than chance alone makes them.', simplification: 'Fertility is redrawn each generation and is not inherited.', params: [{ name: 'bottles', value: 107, tag: 'realistic' }, { name: 'flies a bottle', value: 16, tag: 'realistic' }, { name: 'generations', value: 19, tag: 'realistic' }, { name: 'fertility weights', value: '0.15, 1, 1.85', tag: 'designed' }], cannot: 'Why Buri’s real families varied: crowding, larval competition and luck.', nature: 'Buri’s 1956 lines fitted an Ne of about eleven and a half, though each kept 16 parents.', contested: false, refs: ['buri1956', 'crow1970'] },
    { level: 3, simulated: 'A large mainland at 50% amber. A storm rafts 2 to 12 lizards to each of 12 empty islets. Founders’ copies are a random sample.', simplification: 'The mainland is large and mates at random, so each founder copy is amber with chance one half.', params: [{ name: 'islets a table', value: 12, tag: 'designed' }, { name: 'founders', value: '2 to 12', tag: 'designed' }], cannot: 'What happens after founding: growth, drift and migration.', nature: 'Island populations founded by a few castaways often differ from their source. Brown anoles released on small Bahamian islands kept their founders’ differences for years.', contested: false, refs: ['mayr1942', 'kolbe2012', 'censky1998'] },
    { level: 4, simulated: 'A large island with 12 equally common alleles. The eruption leaves 4 lizards (8 copies) for one generation; the island regrows at once. The zoo breeds 60 lizards, 45 females, for 20 generations.', simplification: 'Migrants come from a neighbouring island the eruption missed. Mutation can only remake one of the 12 letters.', params: [{ name: 'alleles', value: 12, tag: 'designed' }, { name: 'survivors', value: 4, tag: 'designed' }, { name: 'zoo size', value: 60, tag: 'designed' }, { name: 'zoo generations', value: 20, tag: 'designed' }, { name: 'mutation (What if?)', value: '1 in 10,000 copies a generation', tag: 'xN', real: '1 in 100,000 or fewer for most genes' }], cannot: 'Inbreeding depression, or selection on any allele.', nature: 'Northern elephant seals and cheetahs carry little genetic variation after past declines.', contested: false, refs: ['nei1975', 'hoelzel1993', 'obrien1985', 'frankham1995', 'mills1996'] }
  ],
  why: {   // every Why? chunk; DC_WHY says which ones each level's card shows. No decimals: the card's sentence splitter breaks on every full stop.
    real: [
      'Northern elephant seals fell to perhaps a few tens in the 1890s, and stayed few for decades. Today they number over 100,000 but carry little genetic variation (Hoelzel and colleagues 1993).',
      'Zoo studbooks equalise family sizes and balance the sexes, which raises Ne. Rare alleles are still lost. About one migrant a generation brings some back (Mills and Allendorf 1996).',
      'Buri (1956) kept 107 lines of fruit flies at 16 parents each for 19 generations. The lines drifted apart until many had lost or fixed the bw75 allele. The spread fitted an effective size of about eleven and a half, not 16.',
      'Wild populations often have Ne near a tenth of their census size (Frankham 1995).',
      'Island populations founded by a few individuals often differ from their source. Mayr (1942) called this the founder principle.'
    ],
    maths: [
      'A crash to n copies keeps (1 − 1/n) of heterozygosity on average: seven eighths for 8 copies. Each of 12 equal alleles survives with chance 1 − (11/12)^8, about one half. So about 6 vanish (Nei, Maruyama and Chakraborty 1975).',
      'That holds for one generation followed by fast regrowth. A population of N that stays small loses a 1/(2N) share of H each generation. So long or repeated crashes strip heterozygosity too.',
      'A neutral allele at share p ends up fixed with probability p (Kimura 1962). The average share stays at p, but each jar wanders until one colour wins. With N copies, heterozygosity falls on average by a factor (1 − 1/N) each generation.',
      'From half, N copies take on average about 2N ln 2 generations to settle when N is large. That is close to 140 for 100 copies (Kimura and Ohta 1969). Small jars settle far sooner. Half of all jars settle well before the average.',
      'Ne is the size of an ideal population that drifts at the same rate. In an ideal population family sizes vary by chance (Vk about 2), so Ne = N. With family-size variance Vk, Ne = (4N − 2)/(Vk + 2). Unequal sexes: Ne = 4NmNf/(Nm + Nf). Changing size: the harmonic mean.',
      'n founders carry 2n copies, a random sample of the mainland. The typical distance from the mainland share shrinks with the square root of 2n. Four times the founders, half the gap.'
    ]
  }
};

/* ---------- scoring helpers shared by the stars, the level card and the oracle (pure functions of the sim state) ---------- */
const DC_SC = {
  expectBins(r) {   // r: a table record {level, N, p, n, mode, vols, nj}; vols jars of nj were crashed before Spin (L2)
    const L = DC_LV[r.level];
    if (L.kind === 'jars') return L.bins === 'out' ? DC.outBins(r.N, r.p, L.T) : DC.timeBins(r.N, r.p, L.T, r.vols ? r.vols / (r.nj || 12) : 0);
    if (L.kind === 'buri') return DC.buriMC(r.mode || 'w').bins;
    if (L.kind === 'islets') return DC.founders(r.n);
    return null;
  },
  count(r) { const L = DC_LV[r.level]; return L.kind === 'buri' ? DC_BURI.bottles : L.kind === 'islets' ? L.isl : L.jars; },
  expectAsk(s, id) {
    if (id === 'mean') return s.tab[0] ? s.tab[0].p : DC_LV[0].tables[0].p;
    if (id === 'half') { const r = s.tab[0]; return DC.median(6, 0.5, 40, r && r.vols ? r.vols / (r.nj || 12) : 0); }   // with any crashes the player chose on that rack
    if (id === 'h19') return DC.buriMC('w').H[DC_BURI.T];
    if (id === 'gap') return DC.gap(5);
    if (id === 'hk') return DC.crashH;
    if (id === 'al') return DC.crashKept();
    const sd = DC_SIDES.find(d => d.id === id); return sd ? sd.Ne : null;
  },
  tol(s, id) { const A = DC_ASK[id]; return A.rel ? A.rel * this.expectAsk(s, id) : A.tol; },
  hit(s, id) { const v = s.pred[id], e = this.expectAsk(s, id); return v != null && e != null && Math.abs(v - e) <= this.tol(s, id) + 1e-9; },
  gainSum(s) { let g = 0; for (const r of s.tab) if (r) g += DC.gain(r.q, this.expectBins(r), r.c); return g; },
  availSum(s) { let g = 0; for (const r of s.tab) if (r) { const e = this.expectBins(r); g += Math.max(0, DC.ES(e, e) - DC.ES(r.c, e)); } return g; },
  beat(s) { const g = this.gainSum(s); return s.tab.length > 0 && g > 0 && g >= 0.25 * this.availSum(s) - 1e-9; },   // Discover: your bets beat his by a quarter of what was there to win
  passes(s) { let k = 0; for (const r of s.tab) if (r && DC.pass(r.q, this.expectBins(r), r.c)) k++; return k; },
  expChips(s) { let e = 0; for (const r of s.tab) if (r) e += this.count(r) * DC_K * DC.gain(r.q, this.expectBins(r), r.c); return Math.round(e); },
  predict(s) { const L = DC_LV[s.level]; return !!(L.ask && this.hit(s, L.ask.id)) && this.passes(s) >= L.needT; },   // Predict: the marker, plus needT chip tables
  predictHits(s) { const L = DC_LV[s.level]; return this.passes(s) + (L.ask && this.hit(s, L.ask.id) ? 1 : 0); },
  sideHits(s) { let k = 0; for (const d of DC_SIDES) if (this.hit(s, d.id)) k++; return k; }
};

/* bot helpers (bots are called without a receiver, so they never use this) */
const DC_BOT = {
  alloc(w) { const n = w.length, tot = w.reduce((a, b) => a + b, 0) || 1, raw = w.map(x => 10 * x / tot), base = raw.map(Math.floor); let left = 10 - base.reduce((a, b) => a + b, 0); const ord = raw.map((x, i) => [x - base[i], i]).sort((a, b) => b[0] - a[0]); for (let k = 0; k < n && left > 0; k++, left--) base[ord[k][1]]++; return base; },
  one(s, i) { const w = new Array(s.chips.length).fill(0); w[i] = 1; return w; },
  chips(s, acts, target) { for (let b = 0; b < target.length; b++) { if (s.chips[b] < target[b]) { const a = acts.find(x => x.k === 'add' && x.b === b); if (a) return a; } if (s.chips[b] > target[b]) { const a = acts.find(x => x.k === 'rem' && x.b === b); if (a) return a; } } return acts.find(x => x.k === 'spin') || null; },
  near(acts, v) { const ps = acts.filter(a => a.k === 'predict'); if (!ps.length) return null; return ps.reduce((b, a) => Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b); },
  start(s) { const L = DC_LV[s.level]; return L.kind === 'jars' ? (L.bins === 'out' ? (s.p0 >= 0.5 ? 0 : 1) : 4) : L.kind === 'buri' ? 1 : 2; },
  mixed(s) { const L = DC_LV[s.level]; return L.bins === 'out' ? 2 : L.bins === 'time' ? 4 : L.bins === 'buri' ? 1 : 2; },
  common(s, acts, chips, ask, zoo) {
    if (s.phase === 'ask') return this.near(acts, ask(DC_ASK[s.ask.id]));
    if (s.phase === 'bet') return this.chips(s, acts, chips());
    if (s.phase === 'erupt') return acts[0] || null;
    if (s.phase === 'zoo') return zoo ? zoo(s, acts) : null;
    return null;
  }
};

const CH_CASINO_V2 = {
  id: 'casino', v2: true, role: 'environment', place: 'lab', accent: '#8C2438',   // the chapter's chrome tint (D6 decision 7)
  intro: { goal: 'Beat the croupier’s odds on jars, bottles and islands that drift.' },
  content: DC_TEXT,
  P: {
    jars: { v: 12, tag: 'designed', min: 6, max: 18, label: 'jars a table' },
    survivors: { v: 4, tag: 'designed', min: 2, max: 10, label: 'eruption survivors' },
    zoo: { v: 60, tag: 'designed', min: 24, max: 120, label: 'zoo size' },
    budget: { v: 24, tag: 'designed', min: 8, max: 40, label: 'zoo tokens' }
  },
  levels: [
    { name: 'The croupier’s coin', adds: 'the starting share', codes: ['C2'], minutes: 3 },
    { name: 'Small jars', adds: 'jar size', codes: ['C2'], minutes: 4 },
    { name: 'Buri’s bottles', adds: 'effective size', codes: ['C3'], minutes: 5 },
    { name: 'The castaways', adds: 'founders', codes: ['C4'], minutes: 3 },
    { name: 'Volcano and zoo', adds: 'many alleles', codes: ['C4', 'C3'], minutes: 4 }
  ],
  keys: { ArrowLeft: 'previous bin', ArrowRight: 'next bin', ArrowUp: 'add a chip', ArrowDown: 'take a chip', Space: 'spin or pause', X: 'clear chips', A: 'same bets', V: 'crash a jar', U: 'bigger storm', D: 'smaller storm', B: 'balance sexes', E: 'equal families', I: 'migrant', P: 'predict', Enter: 'lock in' },
  untimed: true,
  teacher: { prompts: ['A jar is 80% blue. What is the chance it ends all blue, and why?', 'Buri kept 16 flies per bottle. Why did they drift like 11.5? Name two reasons.', 'Real populations are not jars of beads. Which assumption here is least true for a wild species you know?'], pool: 'trace' },
  encodings: [   // two alleles blue/amber with letters; twelve alleles by fill, overlay pattern and letter (D4 §2.2 rule 7)
    { k: 'A', rgb: [107, 151, 255], channels: ['colour', 'letter'] }, { k: 'a', rgb: [242, 201, 76], channels: ['colour', 'letter'] },
    { k: 'chips', rgb: [232, 223, 201], channels: ['shape'] }
  ],
  starTraits: ['A', 'a'],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {};
      this.s = { level, phase: 'bet', t: 0, ti: 0, purse: 100, won: 0, paid: 0, chips: [], odds: [], landed: [], tab: [], pred: {}, asks: [], ask: null, after: null,
        gen: 0, paused: false, unt: !!(Save.d && Save.d.ui && Save.d.ui.unt), pin: 0, vols: 0, last: null, side: -1, sd: null, sides: [], whatif: null, res: null, log: [] };
      if (o.thaw) { this.restore(o.thaw.snap); const s = this.s; s.log = []; s.res = null; s.whatif = o.thaw.lever; s.unt = !!(Save.d && Save.d.ui && Save.d.ui.unt); this.lever(s, o.thaw.lever); return; }
      if (DC_LV[level].kind === 'zoo') this.bossStart(this.s); else this.table(this.s);
    },
    nb(s) { const L = DC_LV[s.level]; return L.bins ? DC_BINS[L.bins].length : 0; },
    odds(s) {
      const c = DC_LV[s.level].crp;
      if (c === 'coin') { const m = DC.outBins(10, 0.5, 30)[2]; return [(1 - m) / 2, (1 - m) / 2, m]; }
      if (c === 'n20') return DC.timeBins(20, 0.5, 40);
      if (c === 'n16') return DC.buriBins16();
      if (c === 'half') return [0.05, 0.15, 0.6, 0.15, 0.05];
      return [];
    },
    table(s) {
      const L = DC_LV[s.level], T = L.tables[s.ti], nb = this.nb(s);
      s.chips = new Array(nb).fill(0); s.odds = this.odds(s); s.landed = new Array(nb).fill(0); s.gen = 0; s.t = 0; s.phase = 'bet'; s.paid = 0; s.paused = false;
      if (L.kind === 'jars') {
        s.N = T.N; s.p0 = T.p; s.T = L.T; s.jars = []; const k0 = Math.round(T.N * T.p);
        for (let j = 0; j < CH_CASINO_V2.P.jars.v; j++) s.jars.push({ k: k0, cur: T.N, fix: -1, out: -1, crash: -1, tr: [k0 / T.N] });
      } else if (L.kind === 'buri') {
        s.N = 16; s.p0 = 0.5; s.T = DC_BURI.T; s.mode = 'w'; s.bot = [];
        for (let b = 0; b < DC_BURI.bottles; b++) s.bot.push({ b: DC.buriFounders(), k: 16, out: -1, tr: [0.5] });
        s.Hs = [this.meanH(s)];
      } else if (L.kind === 'islets') { s.n = T.n || s.n || 5; s.fixedN = !!T.fixed; s.isl = []; }   // tables 2 and 3 start at 2 and 12 founders: a bet that ignores the storm size fails
    },
    meanH(s) { let h = 0; for (const B of s.bot) h += DC.buriH(B.b); return h / s.bot.length; },
    lever(s, k) {   // What if?: the frozen table, one thing changed
      const L = DC_LV[s.level];
      if (L.kind === 'jars') {
        if (k === 'big') s.N = 100; if (k === 'small') s.N = 20; if (k === 'half') s.p0 = 0.5;
        const k0 = Math.round(s.N * s.p0);
        s.jars.forEach(J => { J.k = k0; J.cur = s.N; J.fix = -1; J.out = -1; J.crash = k === 'vol10' ? 10 : -1; J.tr = [k0 / s.N]; });
        s.landed = s.landed.map(() => 0); s.gen = 0; s.t = 0; s.phase = 'run'; s.ask = null;
      } else if (L.kind === 'buri') {
        s.mode = k === 'equal' ? 'eq' : 'wild'; s.bot.forEach(B => { B.b = DC.buriFounders(); B.k = 16; B.out = -1; B.tr = [0.5]; });
        s.Hs = [this.meanH(s)]; s.landed = s.landed.map(() => 0); s.gen = 0; s.t = 0; s.phase = 'run'; s.ask = null;
      } else if (L.kind === 'islets') {
        s.n = k === 'huge' ? 40 : 2; s.landed = s.landed.map(() => 0); this.found(s); s.t = 0; s.phase = 'run'; s.ask = null;
      } else if (L.kind === 'zoo') {
        if (k === 'bigzoo') this.zooStart(s, { N: 300, auto: true });
        else this.zooStart(s, { from: s.crash.counts, auto: true, G: 2000, mu: 1e-4 });
        s.phase = 'zoo';
      }
    },
    /* ---- prediction gestures: the sim opens s.ask; the commit is an action (Predict → Sim.act), so bots and replays reproduce it ---- */
    openAsk(s, id, after, ev) {
      const A = DC_ASK[id];
      s.ask = { id, kind: A.kind, lo: A.lo, hi: A.hi, tol: A.tol, rel: A.rel, chart: A.chart, at: A.at, start: A.start };
      if (s.asks.indexOf(id) < 0) s.asks.push(id);
      s.after = after; s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id });
    },
    afterAsk(s, ev) {
      const a = s.after; s.after = null; s.ask = null;
      if (a === 'go') this.go(s, ev);
      else if (a === 'side') this.sideRun(s, ev);
      else if (a === 'al') this.openAsk(s, 'al', 'erupt', ev);
      else if (a === 'erupt') { s.phase = 'erupt'; s.t = 0; ev.push({ k: 'readyErupt' }); }
    },
    /* ---- one table: bet → (ask) → run → settle ---- */
    spin(s, ev) {
      const L = DC_LV[s.level], T = L.tables[s.ti]; let n = 0; for (const x of s.chips) n += x;
      if (n !== 10) { ev.push({ k: 'need' }); return; }
      const vols = s.jars ? s.jars.filter(J => J.crash >= 0).length : 0;
      s.tab[s.ti] = { level: s.level, ti: s.ti, q: s.chips.map(x => x / 10), c: s.odds.slice(), N: s.N, p: s.p0, n: s.n, mode: s.mode || 'w', vols, nj: s.jars ? s.jars.length : 0 };
      s.last = s.chips.slice(); s.vols = vols;
      ev.push({ k: 'spun', ti: s.ti, last: s.ti === L.tables.length - 1 });
      if (L.ask && L.ask.table === s.ti && s.pred[L.ask.id] == null && !s.whatif) this.openAsk(s, L.ask.id, 'go', ev);
      else this.go(s, ev);
      return T;
    },
    go(s, ev) {
      const L = DC_LV[s.level]; s.t = 0; s.phase = 'run'; s.gen = 0;
      if (L.kind === 'islets') { this.found(s); ev.push({ k: 'storm', n: s.n }); } else ev.push({ k: 'run' });
    },
    found(s) {   // the storm: each of the islets gets s.n founders, two copies each, amber with chance one half (a large mainland at 50%)
      s.isl = [];
      const rec = () => { if (s.ti === 0 && !s.whatif && !s.isl0) s.isl0 = s.isl.map(I => I.am); };
      for (let i = 0; i < DC_LV[3].isl; i++) {
        const g = []; let am = 0;
        for (let f = 0; f < s.n; f++) { const a = R() < 0.5 ? 1 : 0, b = R() < 0.5 ? 1 : 0; g.push([a, b]); am += a + b; }
        s.isl.push({ g, am, share: am / (2 * s.n), out: DC.shareBin(am / (2 * s.n)), landed: false });
      }
      rec();
    },
    land(s, j, bin, ev) {   // a finished jar, bottle or islet lands in its bin and pays: DC_K × (your score − the croupier's)
      const r = s.tab[s.ti], pay = r && !s.whatif ? Math.round(DC_K * (DC.S(r.q, bin) - DC.S(r.c, bin))) : 0;   // a thawed What if? table pays nothing
      s.landed[bin]++; s.purse += pay; s.paid += pay; s.won += pay; ev.push({ k: 'land', j, bin, pay });
    },
    timeBin(g) { return g <= 5 ? 0 : g <= 10 ? 1 : g <= 20 ? 2 : 3; },
    genJars(s, ev) {
      const L = DC_LV[s.level]; s.gen++;
      s.jars.forEach((J, j) => {
        if (J.out >= 0) { J.tr.push(J.k / J.cur); return; }
        const size = J.crash >= 0 && s.gen >= J.crash && s.gen < J.crash + DC_CRASH.gens ? DC_CRASH.n : s.N;   // the volcano: a few generations at four beads
        J.k = WF.binom(size, J.k / J.cur); J.cur = size;
        if (J.k === 0 || J.k === J.cur) { J.k = J.k ? s.N : 0; J.cur = s.N; J.fix = s.gen; J.out = L.bins === 'out' ? (J.k ? 0 : 1) : this.timeBin(s.gen); this.land(s, j, J.out, ev); }
        J.tr.push(J.k / J.cur);
      });
      ev.push({ k: 'gen', g: s.gen });
      if (s.gen >= s.T || s.jars.every(J => J.out >= 0)) {
        s.jars.forEach((J, j) => { if (J.out < 0) { J.out = L.bins === 'out' ? 2 : 4; this.land(s, j, J.out, ev); } });
        this.settle(s, ev);
      }
    },
    genBuri(s, ev) {
      s.gen++;
      s.bot.forEach(B => { if (B.k > 0 && B.k < 32) { B.b = DC.buriGen(B.b, s.mode); B.k = DC.buriK(B.b); } B.tr.push(B.k / 32); });
      s.Hs.push(this.meanH(s));
      ev.push({ k: 'gen', g: s.gen });
      if (s.gen >= s.T) { s.bot.forEach((B, j) => { B.out = B.k === 0 ? 0 : B.k === 32 ? 2 : 1; this.land(s, j, B.out, ev); }); this.settle(s, ev); }
    },
    settle(s, ev) {
      const L = DC_LV[s.level]; s.hist = s.hist || [];
      if (L.kind === 'jars') { const cr = s.jars.filter(J => J.crash >= 0); s.hist[s.ti] = { N: s.N, p: s.p0, fix: s.jars.map(J => J.fix), tr: s.jars.map(J => J.tr.slice()), purse: s.purse, vols: cr.length, at: cr.length ? cr[0].crash : -1 }; }
      else if (L.kind === 'islets') { let g = 0; for (const I of s.isl) g += Math.abs(I.share - 0.5); s.hist[s.ti] = { n: s.n, gap: g / s.isl.length, purse: s.purse }; }
      else if (L.kind === 'buri' && s.side < 0) s.hist[0] = { purse: s.purse };
      s.phase = 'settle'; s.t = 0; s.paused = false; ev.push({ k: 'settle', paid: s.paid });
    },
    next(s, ev) {
      const L = DC_LV[s.level];
      if (s.whatif) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
      if (L.kind === 'buri' && s.side < DC_SIDES.length - 1) { this.sideStart(s, s.side + 1, ev); return; }
      if (L.tables && s.ti < L.tables.length - 1) { s.ti++; this.table(s); ev.push({ k: 'table', ti: s.ti }); return; }
      s.phase = 'over'; ev.push({ k: 'over' });
    },
    /* ---- L3 side tables: drag an Ne marker, then a hundred cages drift for 20 generations and their heterozygosity is fitted ---- */
    sideStart(s, i, ev) {
      s.side = i; s.sd = { i, pops: null, H: [], gen: 0, fit: null }; ev.push({ k: 'side', i });
      this.openAsk(s, DC_SIDES[i].id, 'side', ev);
    },
    sidePop(D) {
      if (D.kind === 'cycle') return { k: 50, n: 100 };
      const N = D.N, out = []; for (let i = 0; i < N; i++) out.push([R() < 0.5 ? 1 : 0, R() < 0.5 ? 1 : 0]); return out;   // founders drawn at random (all-heterozygote founders would hide the first generation's drift)
    },
    sideH(D, P) {
      let k, n; if (D.kind === 'cycle') { k = P.k; n = P.n; } else { k = 0; n = 2 * P.length; for (const g of P) k += g[0] + g[1]; }
      const p = k / n; return 2 * p * (1 - p) * n / (n - 1);
    },
    sideGen(D, P, gen) {
      if (D.kind === 'cycle') { const n2 = 2 * D.sizes[gen % D.sizes.length]; return { k: WF.binom(n2, P.k / P.n), n: n2 }; }
      if (D.kind === 'sex') {   // 36 females, 4 males; every young has a random mother and a random father
        const out = []; for (let i = 0; i < D.N; i++) { const mo = P[Math.floor(R() * D.f)], fa = P[D.f + Math.floor(R() * (D.N - D.f))]; out.push([mo[R() < 0.5 ? 0 : 1], fa[R() < 0.5 ? 0 : 1]]); }
        return out;
      }
      const h = D.N / 2, perm = []; for (let i = 0; i < h; i++) perm.push(i);   // equal: 8 pairs, each raises one daughter and one son
      for (let i = h - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
      const fem = [], mal = [];
      for (let i = 0; i < h; i++) { const mo = P[i], fa = P[h + perm[i]]; fem.push([mo[R() < 0.5 ? 0 : 1], fa[R() < 0.5 ? 0 : 1]]); mal.push([mo[R() < 0.5 ? 0 : 1], fa[R() < 0.5 ? 0 : 1]]); }
      return fem.concat(mal);
    },
    sideRun(s, ev) {
      const D = DC_SIDES[s.side], pops = []; for (let r = 0; r < DC_SIDE.reps; r++) pops.push(this.sidePop(D));
      s.sd.pops = pops; s.sd.gen = 0; s.sd.h0 = pops.map(P => this.sideH(D, P)); s.sd.H = [this.sideMeanH(D, pops)]; s.phase = 'sideRun'; s.t = 0; ev.push({ k: 'sideRun', i: s.side });
    },
    sideMeanH(D, pops) { let h = 0; for (const P of pops) h += this.sideH(D, P); return h / pops.length; },
    genSide(s, ev) {
      const D = DC_SIDES[s.side], sd = s.sd;
      sd.pops = sd.pops.map(P => this.sideGen(D, P, sd.gen)); sd.gen++; sd.H.push(this.sideMeanH(D, sd.pops));
      ev.push({ k: 'sgen', g: sd.gen });
      if (sd.gen >= DC_SIDE.T) {
        const ratio = sd.H[sd.gen] / sd.H[0], lam = ratio > 1e-6 ? Det.pow(ratio, 1 / DC_SIDE.T) : 0;
        sd.fit = lam < 1 ? Math.min(99, 1 / (2 * (1 - lam))) : 99;
        // the fit's spread (delta method over the replicate cages): the formula, not the fit, is what the stars read
        const hT = sd.pops.map(P => this.sideH(D, P)), h0 = sd.h0 || hT, n = hT.length, mT = sd.H[sd.gen], m0 = sd.H[0];
        let vT = 0, v0 = 0, cv = 0; for (let i = 0; i < n; i++) { vT += (hT[i] - mT) * (hT[i] - mT); v0 += (h0[i] - m0) * (h0[i] - m0); cv += (hT[i] - mT) * (h0[i] - m0); }
        vT /= n - 1; v0 /= n - 1; cv /= n - 1;
        const vr = ratio * ratio * Math.max(0, vT / (n * mT * mT) + v0 / (n * m0 * m0) - 2 * cv / (n * mT * m0)), dN = lam < 1 && ratio > 0 ? lam / (2 * (1 - lam) * (1 - lam) * DC_SIDE.T * ratio) : 0;
        sd.se = Math.min(99, dN * Math.sqrt(vr));
        s.sides[s.side] = { fit: sd.fit, se: sd.se, you: s.pred[D.id], Ne: D.Ne };
        s.phase = 'settle'; s.t = 0; ev.push({ k: 'sideDone', i: s.side, fit: sd.fit, se: sd.se });
      }
    },
    /* ---- the boss: two markers, the eruption, then the zoo ---- */
    bossStart(s) { s.phase = 'ask'; s.H0 = 11 / 12; const ev = []; this.openAsk(s, 'hk', 'al', ev); },
    erupt(s, ev) {
      const n2 = 2 * CH_CASINO_V2.P.survivors.v, w = DC.uni(12), counts = Array.from(WF.multinom(n2, w)), copies = [];
      counts.forEach((c, i) => { for (let k = 0; k < c; k++) copies.push(i); });
      for (let i = copies.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = copies[i]; copies[i] = copies[j]; copies[j] = t; }
      const surv = []; for (let i = 0; i + 1 < copies.length; i += 2) surv.push([copies[i], copies[i + 1]]);
      s.crash = { counts, H: DC.het(counts), kept: DC.kept(counts), surv };
      s.phase = 'crash'; s.t = 0; ev.push({ k: 'erupt', lost: counts.map((c, i) => c ? -1 : i).filter(i => i >= 0) });
    },
    zooStart(s, o) {
      o = o || {}; const N = o.N || CH_CASINO_V2.P.zoo.v, copies = [];
      if (o.from) { const t = o.from.reduce((a, b) => a + b, 0); for (let i = 0; i < 2 * N; i++) { let u = R() * t, a = 0; while (u >= o.from[a]) { u -= o.from[a]; a++; } copies.push(a); } }
      else for (let i = 0; i < 2 * N; i++) copies.push(i % 12);
      for (let i = copies.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = copies[i]; copies[i] = copies[j]; copies[j] = t; }
      const F = Math.round(N * DC_ZOO.F0 / DC_ZOO.N), pop = [];
      for (let i = 0; i < N; i++) pop.push({ f: i < F, a: [copies[2 * i], copies[2 * i + 1]] });
      const n = DC.zooCount(pop);
      s.zoo = { N, pop, f0: pop.map(b => ({ f: b.f, a: b.a.slice() })), gen: 0, G: o.G || DC_ZOO.G, budget: o.auto ? 0 : CH_CASINO_V2.P.budget.v, bal: false, eq: false,
        migs: 0, pend: false, kept: [DC.kept(n)], H: [DC.het(n)], pol: [], auto: !!o.auto, mu: o.mu || 0, E: null, Eg: null, rep: null };
    },
    zooGen(s, ev) {
      const Z = s.zoo, before = DC.zooCount(Z.pop); let mig = 0;
      if (Z.eq) { if (Z.budget >= DC_ZOO.cEq) Z.budget -= DC_ZOO.cEq; else { Z.eq = false; ev.push({ k: 'broke' }); } }
      if (Z.pend) { const i = Math.floor(R() * Z.pop.length); Z.pop[i] = { f: Z.pop[i].f, a: [Math.floor(R() * 12), Math.floor(R() * 12)] }; Z.pend = false; mig = 1; ev.push({ k: 'migIn', i }); }
      Z.pop = DC.zooBreed(Z.pop, Z.eq, Z.bal, R);
      if (Z.mu > 0) { const m = WF.binom(2 * Z.pop.length, Z.mu); for (let q = 0; q < m; q++) { const b = Z.pop[Math.floor(R() * Z.pop.length)]; b.a[R() < 0.5 ? 0 : 1] = Math.floor(R() * 12); } }
      Z.gen++; const n = DC.zooCount(Z.pop);
      if (Z.kept.length < 4000) { Z.kept.push(DC.kept(n)); Z.H.push(DC.het(n)); }
      Z.pol.push([Z.eq ? 1 : 0, Z.bal ? 1 : 0, mig]);
      for (let a = 0; a < 12; a++) { if (before[a] > 0 && !n[a]) ev.push({ k: 'zlost', a }); if (!before[a] && n[a] > 0) ev.push({ k: 'zback', a }); }
      ev.push({ k: 'zgen', g: Z.gen });
      if (Z.gen >= Z.G) {
        if (Z.auto) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
        s.phase = 'zooEnd'; s.t = 0; Z.rep = { done: 0, sum: 0, by: new Array(Z.G + 1).fill(0) }; ev.push({ k: 'zooEnd' });
      }
    },
    zooReps(s, ev) {   // the expectation under the keeper's plan: the same founders and lever timeline, 200 fresh runs (luck removed)
      const Z = s.zoo, R0 = Z.rep, todo = Math.min(DC_ZOO.chunk, DC_ZOO.reps - R0.done);
      for (let r = 0; r < todo; r++) {
        let pop = Z.f0.map(b => ({ f: b.f, a: b.a.slice() }));
        R0.by[0] += DC.kept(DC.zooCount(pop));
        for (let g = 0; g < Z.G; g++) {
          const row = Z.pol[g];
          if (row[2]) { const i = Math.floor(R() * pop.length); pop[i] = { f: pop[i].f, a: [Math.floor(R() * 12), Math.floor(R() * 12)] }; }
          pop = DC.zooBreed(pop, row[0], row[1], R);
          R0.by[g + 1] += DC.kept(DC.zooCount(pop));
        }
        R0.sum += DC.kept(DC.zooCount(pop));
      }
      R0.done += todo;
      if (R0.done >= DC_ZOO.reps) { Z.E = R0.sum / R0.done; Z.Eg = R0.by.map(x => x / R0.done); s.phase = 'over'; ev.push({ k: 'over' }); }
    },
    /* ---- the clock ---- */
    genOf(s) {
      const L = DC_LV[s.level], u = s.unt;
      if (s.phase === 'sideRun') return DC_T.side;
      if (L.kind === 'zoo') return u ? 1.2 : DC_T.zoo;
      if (L.kind === 'buri') return u ? 0.6 : DC_T.buri;
      return u ? DC_T.genU : DC_T.gen;
    },
    step(dt) {
      const s = this.s, ev = []; if (!s) return ev;
      const L = DC_LV[s.level], ph = s.phase;
      if (ph === 'ask') { s.t += dt; if (!s.unt && s.t > DC_T.askMax) { ev.push({ k: 'askTimeout', id: s.ask && s.ask.id }); this.afterAsk(s, ev); } return ev; }
      if (ph === 'run' && L.kind === 'islets') {   // the storm sweeps, then the islets land one by one
        s.t += dt;
        s.isl.forEach((I, i) => { if (!I.landed && s.t >= DC_T.storm + DC_T.land * i) { I.landed = true; this.land(s, i, I.out, ev); } });
        if (s.t >= DC_T.storm + DC_T.land * s.isl.length + 0.6) this.settle(s, ev);
        return ev;
      }
      if (ph === 'run' || ph === 'sideRun' || ph === 'zoo') {
        if (s.paused) return ev;
        s.t += dt;
        if (ph === 'zoo' && s.zoo.auto) {   // What if?: the zoo runs by itself; a long run takes 40 generations a tick
          const per = s.zoo.G > 100 ? 0 : 0.25, k = s.zoo.G > 100 ? 40 : 1;
          if (s.t + 1e-9 >= per) { s.t = 0; for (let i = 0; i < k && s.phase === 'zoo'; i++) this.zooGen(s, ev); }
          return ev;
        }
        const per = this.genOf(s);
        if (s.t + 1e-9 >= per) { s.t -= per; this.tick(s, ev); }
        return ev;
      }
      if (ph === 'settle') { s.t += dt; if (s.t >= DC_T.settle) this.next(s, ev); return ev; }
      if (ph === 'crash') { s.t += dt; if (s.t >= DC_T.crash) { this.zooStart(s); s.phase = 'zooIntro'; s.t = 0; ev.push({ k: 'zooStart' }); } return ev; }
      if (ph === 'zooIntro') { s.t += dt; if (s.t >= DC_T.intro) { s.phase = 'zoo'; s.t = 0; ev.push({ k: 'zooGo' }); } return ev; }
      if (ph === 'zooEnd') { this.zooReps(s, ev); return ev; }
      if (ph === 'bet' || ph === 'erupt') s.t += dt;
      return ev;
    },
    tick(s, ev) {   // one generation of whatever is running
      const L = DC_LV[s.level];
      if (s.phase === 'sideRun') this.genSide(s, ev);
      else if (L.kind === 'jars') this.genJars(s, ev);
      else if (L.kind === 'buri') this.genBuri(s, ev);
      else if (L.kind === 'zoo') this.zooGen(s, ev);
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      const L = DC_LV[s.level], nb = this.nb(s);
      if (a.k === 'add' && s.phase === 'bet') { let n = 0; for (const x of s.chips) n += x; if (n < 10 && a.b >= 0 && a.b < nb) { s.chips[a.b]++; ev.push({ k: 'chip', b: a.b, n: n + 1 }); if (n + 1 === 10) ev.push({ k: 'full' }); } else if (n >= 10) ev.push({ k: 'fullAlready' }); }
      else if (a.k === 'rem' && s.phase === 'bet') { if (a.b >= 0 && a.b < nb && s.chips[a.b] > 0) { s.chips[a.b]--; ev.push({ k: 'unchip', b: a.b }); } else ev.push({ k: 'empty' }); }
      else if (a.k === 'move' && s.phase === 'bet') { if (a.from >= 0 && a.from < nb && a.to >= 0 && a.to < nb && s.chips[a.from] > 0 && a.from !== a.to) { s.chips[a.from]--; s.chips[a.to]++; ev.push({ k: 'unchip', b: a.from }, { k: 'chip', b: a.to, n: -1 }); } }
      else if (a.k === 'storm' && s.phase === 'bet' && L.kind === 'islets') { if (s.fixedN) ev.push({ k: 'fixedN' }); else { const n = Math.max(2, Math.min(12, Math.round(+a.n || 0))); if (n !== s.n) { s.n = n; ev.push({ k: 'stormSize', n }); } } }
      else if (a.k === 'spin' && s.phase === 'bet') this.spin(s, ev);
      else if (a.k === 'predict' && s.ask && a.id === s.ask.id) { s.pred[a.id] = Math.min(s.ask.hi, Math.max(s.ask.lo, +a.v)); ev.push({ k: 'predicted', id: a.id, v: s.pred[a.id] }); this.afterAsk(s, ev); }
      else if (a.k === 'vol' && s.phase === 'bet' && L.volcano) {   // before Spin: crash this jar (or call it off); the expectation includes every crash
        const J = s.jars && s.jars[a.j], n = s.jars ? s.jars.filter(Q => Q.crash >= 0).length : 0;
        if (!J) ev.push({ k: 'volNo' });
        else if (J.crash >= 0) { J.crash = -1; ev.push({ k: 'vol', j: a.j, on: false, n: n - 1 }); }
        else if (n >= DC_CRASH.max) ev.push({ k: 'volMax' });
        else { J.crash = DC_CRASH.at; ev.push({ k: 'vol', j: a.j, on: true, n: n + 1 }); }
      }
      else if (a.k === 'clear' && s.phase === 'bet') { let n = 0; for (const x of s.chips) n += x; if (!n) ev.push({ k: 'empty' }); else { const was = s.chips.slice(); s.chips = s.chips.map(() => 0); ev.push({ k: 'clear', was }); } }
      else if (a.k === 'same' && s.phase === 'bet') {   // last table's bet again (same bins only)
        let n = 0; for (const x of s.chips) n += x;
        if (s.last && s.last.length === nb && !n) { s.chips = s.last.slice(); ev.push({ k: 'same' }, { k: 'full' }); } else ev.push({ k: 'sameNo' });
      }
      else if (a.k === 'pin') { s.pin = Math.max(0, a.j | 0); ev.push({ k: 'pin', j: s.pin }); }
      else if (a.k === 'pause') { if (s.phase === 'run' || s.phase === 'sideRun' || s.phase === 'zoo') { s.paused = !!a.on; ev.push({ k: 'pause', on: s.paused }); } }
      else if (a.k === 'step') { if (s.paused && (s.phase === 'run' || s.phase === 'sideRun')) { s.t = 0; if (!(L.kind === 'islets' && s.phase === 'run')) this.tick(s, ev); } else if (s.paused && s.phase === 'zoo') this.zooGen(s, ev); }
      else if (a.k === 'erupt' && s.phase === 'erupt') this.erupt(s, ev);
      else if (a.k === 'next' && s.phase === 'settle' && s.t > 0.4) this.next(s, ev);
      else if (a.k === 'bal' && s.phase === 'zoo' && !s.zoo.auto) { const Z = s.zoo; if (Z.bal) ev.push({ k: 'balAlready' }); else if (Z.budget < DC_ZOO.cBal) ev.push({ k: 'broke' }); else { Z.bal = true; Z.budget -= DC_ZOO.cBal; ev.push({ k: 'bal' }); } }
      else if (a.k === 'eq' && s.phase === 'zoo' && !s.zoo.auto) { const Z = s.zoo, on = !!a.on; if (on && Z.budget < DC_ZOO.cEq) ev.push({ k: 'broke' }); else if (on !== Z.eq) { Z.eq = on; ev.push({ k: 'eq', on }); } }
      else if (a.k === 'mig' && s.phase === 'zoo' && !s.zoo.auto) {   // one migrant a generation at most (it joins before the next breeding)
        const Z = s.zoo, price = DC_ZOO.cMig;
        if (Z.pend) ev.push({ k: 'oneGen' }); else if (Z.budget < price) ev.push({ k: 'broke' });
        else { Z.budget -= price; Z.migs++; Z.pend = true; ev.push({ k: 'migBuy', price }); }
      }
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      if (s.res) return s.res;
      if (s.whatif) return (s.res = { mask: 0, outcome: { won: s.won }, interesting: s.whatif });
      const st = CH_CASINO_V2.stars, n = s.level;
      const mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      const lostKey = n === 4 && s.zoo && s.zoo.E != null && s.zoo.E >= 7.5 ? 'lost4b' : 'lost' + n;   // the zoo: "about half lost" only when it was about half
      return (s.res = { mask, outcome: { won: s.won, exp: DC_SC.expChips(s) }, interesting: mask & 1 ? null : lostKey });
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      const L = DC_LV[s.level], nb = this.nb(s);
      if (s.phase === 'bet') {
        let n = 0; for (const x of s.chips) n += x;
        for (let b = 0; b < nb; b++) { if (n < 10) out.push({ k: 'add', b }); if (s.chips[b] > 0) out.push({ k: 'rem', b }); }
        if (n === 10) out.push({ k: 'spin' });
        if (L.kind === 'islets' && !s.fixedN) for (const m of [2, 3, 5, 8, 12]) if (m !== s.n) out.push({ k: 'storm', n: m });
        if (L.volcano && s.jars) { const nv = s.jars.filter(J => J.crash >= 0).length; s.jars.forEach((J, j) => { if (J.crash >= 0 || nv < DC_CRASH.max) out.push({ k: 'vol', j }); }); }
      } else if (s.phase === 'ask' && s.ask) {
        const A = DC_ASK[s.ask.id]; for (let v = A.lo; v <= A.hi + 1e-9; v += A.step) out.push({ k: 'predict', id: s.ask.id, v: Math.round(v * 1000) / 1000 });
      } else if (s.phase === 'erupt') out.push({ k: 'erupt' });
      else if (s.phase === 'zoo' && !s.zoo.auto) {
        const Z = s.zoo; if (!Z.bal && Z.budget >= DC_ZOO.cBal) out.push({ k: 'bal' });
        out.push({ k: 'eq', on: !Z.eq });
        if (!Z.pend && Z.budget >= DC_ZOO.cMig) out.push({ k: 'mig' });
      }
      return out;
    },
    bots: {   // (s, acts, rnd) → action | null; 'random' is generic. D3's named bots: copy the croupier, uniform, all on mixed, all on the start, always the volcano
      alwaysA(s, acts) {   // all chips on the bin that holds the starting share; markers at the bottom of the axis; the zoo left alone
        return DC_BOT.common(s, acts, () => DC_BOT.alloc(DC_BOT.one(s, DC_BOT.start(s))), A => A.lo, null);
      },
      alwaysB(s, acts) {   // an even spread; markers at the top of the axis; the biggest storm; equal families switched on
        if (s.phase === 'bet' && DC_LV[s.level].kind === 'islets' && !s.fixedN && s.n !== 12) return acts.find(a => a.k === 'storm' && a.n === 12) || null;
        return DC_BOT.common(s, acts, () => DC_BOT.alloc(s.chips.map(() => 1)), A => A.hi, (S, a) => (!S.zoo.eq ? a.find(x => x.k === 'eq' && x.on) : null) || null);
      },
      greedy(s, acts) {   // copy the croupier's odds and his answers; buy every migrant
        return DC_BOT.common(s, acts, () => DC_BOT.alloc(s.odds), A => A.start, (S, a) => a.find(x => x.k === 'mig') || null);
      },
      threshold(s, acts) {   // all on "still mixed"; markers at the middle; the smallest storm; every crash it may; balance and equal families
        if (s.phase === 'bet' && DC_LV[s.level].volcano && s.jars.filter(J => J.crash >= 0).length < DC_CRASH.max) { const a = acts.find(x => x.k === 'vol' && s.jars[x.j].crash < 0); if (a) return a; }
        if (s.phase === 'bet' && DC_LV[s.level].kind === 'islets' && !s.fixedN && s.n !== 2) return acts.find(a => a.k === 'storm' && a.n === 2) || null;
        return DC_BOT.common(s, acts, () => DC_BOT.alloc(DC_BOT.one(s, DC_BOT.mixed(s))), A => (A.lo + A.hi) / 2, (S, a) => a.find(x => x.k === 'bal') || (!S.zoo.eq ? a.find(x => x.k === 'eq' && x.on) : null) || null);
      }
    }
  },

  /* ---- stars against the expectation for the parameters in force, never the realised run (pure functions of the final state) ---- */
  stars: {
    discover: (s, n) => n === 4 ? !!(s.zoo && s.zoo.E != null && s.zoo.E >= DC_ZOO.want - 1e-9) : DC_SC.beat(s),
    predict: (s, n) => n < 4 && DC_SC.predict(s),
    transfer: (s, n) => (n === 2 && DC_SC.sideHits(s) >= 2) || (n === 4 && DC_SC.hit(s, 'hk') && DC_SC.hit(s, 'al'))
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = 0; this._asking = null; this._dockSig = ''; this._ghost = null; this._tips = this._tips || {};
    if (typeof Predict !== 'undefined') Predict.clear();
    Sim.start(this, n, o);
    const s = this.sim.s;
    this.v = { t: 0, fl: [], gone: {}, shown: [], ord: {}, pulse: 0, banner: null, press: null, cursor: 0, focus: false, armed: false, talk: null,
      purse: s.purse, hold: null, stormT: -1, erT: -1, lost: {}, thaw: !!o.thaw, lastPhase: '', tableT: 0, zt: 0, mig: null, spinT: -1, settleT: -1,
      hatch: 0, shake: {}, flash: {}, ghosted: {}, n0: s.n, tags: [] };
    this.resetShown();
    this.talk(DC_LV[n].crp || 'halves');
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (n > 0 && DC_LV[n].kind !== 'zoo' && !o.thaw) this.whisper('reprice');   // the boss has no croupier and no odds
  },
  tip(k, vars) { if (this._tips[k]) return false; this._tips[k] = 1; this.whisper(k, vars); return true; },   // a teaching whisper, once per session
  chipsTxt(n) { return Txt.f(this.content.labels[n === 1 ? 'chip1' : 'chips'], { n }); },
  resetShown() { const s = this.sim.s, v = this.v; v.shown = (s.landed || []).map(() => 0); v.gone = {}; v.lost = {}; v.landCol = {}; v.col = {}; v.colN = {}; },
  talk(key) { const L = this.content.labels; this.v.talk = { text: L[key] || '', t: 0 }; },
  whisper(k, vars) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(vars ? Txt.f(t, vars) : t, 'dc-' + k); },
  live(k, vars) { if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.captions[k], vars)); },
  snd(name, x, y) { if (typeof Snd2 !== 'undefined') Snd2.play(name, { x, y }); },
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  kind() { return DC_LV[this.sim.s.level].kind; },

  /* ---------- geometry (canvas px), recomputed each frame from Stage ---------- */
  geo() {
    const W = Stage.w, H = Stage.h, top = this.hudH() + 6, A = Math.max(260, H - top - 6), wide = W >= 640, u = Stage.u || 390;
    const G = { W, H, top, A, wide, u, k: this.kind() };
    const footH = Math.max(58, Math.min(84, Math.round(A * 0.13)));
    G.foot = { x: 8, y: H - footH - 4, w: W - 16, h: footH };
    if (G.k === 'jars') {
      const s = this.sim.s, n = s.jars.length, rackH = Math.round(A * 0.33), gap = Math.max(6, Math.min(12, W * 0.015));
      const fit = c => { const r = Math.ceil(n / c), w = Math.min(110, (W - 28 - (c - 1) * gap) / c), h = Math.min((rackH - 8) / r - 12, w * 1.55); return { c, r, w: Math.min(w, h / 1.25), h }; };
      const A1 = fit(n), A2 = fit(Math.ceil(n / 2)), F0 = A1.w >= A2.w ? A1 : A2, cols = F0.c, rows = F0.r, jw = F0.w, jh = F0.h;
      const x0 = (W - (cols * jw + (cols - 1) * gap)) / 2, y0 = top + 16 + Math.max(0, (rackH - rows * (jh + 12)) / 2);
      G.jars = []; for (let j = 0; j < n; j++) { const c = j % cols, r = Math.floor(j / cols); G.jars.push({ x: x0 + c * (jw + gap), y: y0 + r * (jh + 12), w: jw, h: jh }); }
      G.rack = { x: 8, y: top + 4, w: W - 16, h: rackH + 6, rows, rowY: [...Array(rows)].map((_, r) => y0 + r * (jh + 12) + jh) };
      G.felt = { x: 8, y: top + rackH + 14, w: W - 16, h: G.foot.y - (top + rackH + 14) - 6 };
    } else if (G.k === 'buri') {
      const trayH = Math.round(A * 0.36), heroW = Math.round(Math.min(W * 0.3, 230));
      G.tray = { x: 8, y: top + 4, w: W - 24 - heroW, h: trayH };
      G.hero = { x: W - 8 - heroW, y: top + 4, w: heroW, h: trayH };
      G.felt = { x: 8, y: top + trayH + 12, w: W - 16, h: G.foot.y - (top + trayH + 12) - 6 };
    } else if (G.k === 'islets') {
      const seaH = Math.round(A * 0.3), landH = Math.round(A * 0.25);
      G.sea = { x: 0, y: top - 6, w: W, h: seaH + 10 };
      G.land = { x: 0, y: top + seaH + 4, w: W, h: landH };
      G.felt = { x: 8, y: G.land.y + landH + 6, w: W - 16, h: G.foot.y - (G.land.y + landH + 6) - 6 };
      const cols = 6, gap = 8, iw = Math.min(110, (W - 16) / (cols + 0.4) - gap), ih = Math.max(26, Math.min(44, seaH / 2 - 16)), span = cols * (iw + gap) + (iw + gap) * 0.4;
      G.isl = []; for (let i = 0; i < 12; i++) { const c = i % cols, r = Math.floor(i / cols); G.isl.push({ x: (W - span) / 2 + gap / 2 + c * (iw + gap) + (r % 2 ? (iw + gap) * 0.4 : 0), y: top + 14 + r * (ih + 18), w: iw, h: ih }); }
    } else {
      const rh = Math.max(40, Math.min(56, A * 0.1));
      G.row = { x: 8, y: H - rh - 6, w: W - 16, h: rh };
      G.isle = { x: 8, y: top + 2, w: W - 16, h: G.row.y - top - 10 };
    }
    if (G.felt) G.bins = this.layBins(G.felt);
    return G;
  },
  layBins(F) {
    const s = this.sim.s, nb = (s.chips || []).length; if (!nb) return [];
    const pad = 8, gap = 6, bw = (F.w - 2 * pad - (nb - 1) * gap) / nb, top = F.y + (this.kind() === 'buri' ? F.h * 0.48 : pad), h = F.y + F.h - pad - top, out = [];
    const wide = typeof Stage !== 'undefined' && Stage.w >= 640;   // desktop: the chips and jar icons are the heroes (D4: 0.12u), so they grow into the felt
    const r = Math.max(7, Math.min(wide ? 18 : 13, bw * 0.17, h / (wide ? 13 : 16)));
    const isz = Math.max(10, Math.min(wide ? 32 : 22, bw * 0.3, (h - 40) / (wide ? 8 : 11)));
    for (let b = 0; b < nb; b++) { const x = F.x + pad + b * (bw + gap); out.push({ x, y: top + (this.kind() === 'buri' ? 0 : 16), w: bw, h: h - (this.kind() === 'buri' ? 0 : 16), r, cx: x + bw * 0.3, lx: x + bw * 0.72, base: top + h - 26 - r * 0.5, step: r * 0.6, isz }); }
    return out;
  },
  binAt(x, y) { const G = this.geo(); for (let b = 0; b < (G.bins || []).length; b++) { const B = G.bins[b]; if (x >= B.x - 3 && x <= B.x + B.w + 3 && y >= B.y - 6 && y <= B.y + B.h + 6) return b; } return -1; },
  stackPos(G) { return [G.foot.x + 30, G.foot.y + G.foot.h * 0.62]; },
  chipTop(G, b, n) { const B = G.bins[b]; return [B.cx, B.base - n * B.step]; },
  landSlot(G, b, n) {
    const B = G.bins[b], k = this.kind();
    if (k === 'buri') { const H = this.histGeo(G); return [H.x0 + (b === 0 ? 0.5 : b === 2 ? 32.5 : 16.5) * H.cw, H.y1 - 4]; }
    return [B.lx, B.base - 4 - n * this.landStep(B)];
  },
  landStep(B) { return Math.max(4, Math.min(B.isz * 0.9, (B.base - B.y - B.isz - 36) / 12)); },   // twelve jars fit under the pay pill
  histGeo(G) { const F = G.felt, x0 = F.x + 10, w = F.w - 20, cw = w / 33, y0 = F.y + 8, y1 = F.y + F.h * 0.44; return { x0, w, cw, y0, y1, h: y1 - y0 }; },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.pulse = Math.max(0, v.pulse - dt / 0.18); v.tableT += dt; if (v.talk) v.talk.t += dt;
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (v.stormT >= 0) v.stormT += dt; if (v.erT >= 0) v.erT += dt; if (v.spinT >= 0) { v.spinT += dt; if (v.spinT > 0.6) v.spinT = -1; }
    if (v.hold && s.phase === 'bet') { v.hold.t += dt; const n = Math.min(12, 2 + Math.floor(v.hold.t / 0.22)); if (n !== s.n && n > s.n) Sim.act(this, { k: 'storm', n }); }
    this.flights(dt);
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) { this._asking = null; this._dockSig = ''; }
    if (v.lastPhase !== s.phase) { this.phaseIn(s.phase); v.lastPhase = s.phase; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { this._pend += dt; if (this._pend > 0.25 && (!v.fl.length || this._pend > 2)) { this._ended = true; this.finish(r); } }
  },
  phaseIn(ph) {
    const s = this.sim.s, v = this.v, n = this.level, G0 = typeof Ghost !== 'undefined';
    if (ph === 'bet' && n === 0 && s.ti === 0 && !v.thaw && G0 && !v.ghosted.bet) { v.ghosted.bet = 1; this._ghost = Ghost.show({ verb: 'tap', key: 'ArrowUp', at: () => { const G = this.geo(), B = G.bins[0]; return [B.x + B.w / 2, B.y + B.h * 0.55]; }, until: () => this.sim.s.chips.some(x => x > 0) || this.sim.s.phase !== 'bet' }); }
    if (ph === 'bet' && n === 0 && s.ti === 0 && !v.thaw) this.tip('odds');   // the dashed boxes are his bets (taught once)
    if (ph === 'bet' && n === 3 && !s.fixedN && G0 && !v.ghosted.hold) { v.ghosted.hold = 1; const n0 = s.n; Ghost.show({ verb: 'hold', key: 'u', at: () => { const G = this.geo(); return [G.W / 2, G.land.y + G.land.h * 0.5]; }, until: () => this.sim.s.n !== n0 || this.sim.s.phase !== 'bet' }); }
    if (ph === 'erupt' && G0 && !v.ghosted.erupt) { v.ghosted.erupt = 1; Ghost.show({ verb: 'tap', key: ' ', at: () => this.volcanoAt(), until: () => this.sim.s.phase !== 'erupt' }); }
  },
  /* ---------- teacher hook (D5 §3 item 10): a 30-bit result code on assignment links (?unit=casino&seed=…) ----------
     bits 0–2 level, 3–5 star mask, then per level:
     L1: 6–29 the twelve jars of table 1, two bits each (0 all blue, 1 all amber, 2 still mixed): the class U, pooled;
     L2: 6–29 the twelve 6-bead jars, two bits each (settled by 5, 6–10, 11–20, later or never);
     L3: 6–12 bottles lost, 13–19 bottles fixed (of 107), 20–26 your H19 marker × 200, 27–29 side tables hit;
     L4: 6–25 the first five islets' amber copies (of 10), four bits each, 26–29 your gap marker in points ÷ 4;
     boss: 6–9 letters left after the eruption, 10–16 H kept %, 17–23 zoo letters in expectation × 10, 24–29 tokens left */
  resultBits(s, level) {
    if (!s) return 0; const n = level == null ? s.level : level, r = this.sim.result(), mask = r ? r.mask & 7 : 0, cl = (x, hi) => Math.max(0, Math.min(hi, Math.round(+x || 0)));
    let b = (n & 7) | (mask << 3); const h = s.hist || [];
    if (n === 0 && h[0]) h[0].tr.slice(0, 12).forEach((tr, j) => { const f = h[0].fix[j], last = tr[tr.length - 1]; b |= ((f >= 0 ? (last > 0.5 ? 0 : 1) : 2) << (6 + 2 * j)); });
    else if (n === 1 && h[0]) h[0].fix.slice(0, 12).forEach((f, j) => { b |= ((f < 0 ? 3 : f <= 5 ? 0 : f <= 10 ? 1 : f <= 20 ? 2 : 3) << (6 + 2 * j)); });
    else if (n === 2 && s.bot) { const lost = s.bot.filter(B => B.k === 0).length, fixed = s.bot.filter(B => B.k === 32).length; b |= (cl(lost, 127) << 6) | (cl(fixed, 127) << 13) | (cl(200 * (s.pred.h19 || 0), 127) << 20) | (cl(DC_SC.sideHits(s), 7) << 27); }
    else if (n === 3) { const t0 = (s.isl0 || []); t0.slice(0, 5).forEach((am, j) => { b |= (cl(am, 15) << (6 + 4 * j)); }); b |= cl(100 * (s.pred.gap || 0) / 4, 15) << 26; }
    else if (n === 4) { const Z = s.zoo; b |= (cl(s.crash ? s.crash.kept : 0, 15) << 6) | (cl(s.crash ? 100 * s.crash.H / s.H0 : 0, 127) << 10) | (cl(Z && Z.E != null ? 10 * Z.E : 0, 127) << 17) | (cl(Z ? Z.budget : 0, 63) << 24); }
    return b >>> 0;
  },
  freezeAsk() {   // teacher strip → freeze: an unscored class marker on the live graph ("where will it end?")
    const s = this.sim.s; if (typeof Predict === 'undefined' || s.ask) return;
    const k = this.kind(); if (!(s.phase === 'run' && (k === 'jars' || k === 'buri'))) return;
    const at = k === 'buri' ? DC_BURI.T : s.T, y = this.level === 0 ? s.p0 : 0.5;
    Predict.ask({ id: 'freeze', chart: 0, kind: 'y', axis: { lo: 0, hi: k === 'buri' ? 0.55 : 1 }, start: y, at, tol: null, soft: null });
  },
  teacherStep() {   // teacher strip → step: one generation of whatever is running (pauses it first)
    const s = this.sim.s; if (!(s.phase === 'run' || s.phase === 'sideRun' || s.phase === 'zoo')) return;
    if (!s.paused) Sim.act(this, { k: 'pause', on: true }); Sim.act(this, { k: 'step' });
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; this._dockSig = ''; if (typeof Predict === 'undefined') return;
    const D = DC_ASK[A.id], tol = D.tol != null ? D.tol : D.rel * 20;
    const key = typeof Fx !== 'undefined' && Fx.lastInput === 'key';   // the marker opens already focused: P would unfocus it, so say what works
    Predict.ask({ id: A.id, chart: D.chart, kind: D.kind, axis: { lo: D.lo, hi: D.hi }, start: D.start, at: D.at, tol, soft: null, say: key ? this.content.captions.keySay : undefined });   // never auto-commits: working out an Ne takes time
  },
  reveal(id) { if (typeof Predict === 'undefined') return; const s = this.sim.s; Predict.reveal(id, DC_SC.expectAsk(s, id), DC_SC.tol(s, id)); },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, final = n === 4, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (!s.whatif) {
      if (!final) { o.take = C.captions['take' + n]; o.body = Txt.f(C.captions.edge, { w: (s.won > 0 ? '+' : '') + s.won, e: (r.outcome.exp > 0 ? '+' : '') + r.outcome.exp }); }
      else {   // the unit card: the inversion is the take; the zoo line only when the plan earned it; then a short recap
        const bv = this.bodyVars(), inv = Txt.f(C.captions.takeBoss, bv);
        o.take = inv; o.body = ((r.mask & 1) ? '' : inv + ' ') + C.captions.invBody + ((r.mask & 1) ? ' ' + Txt.f(C.captions.bodyZoo, bv) : '') + ' ' + C.body;
      }
    } else o.body = '';
    const wx = DC_WHY[n]; o.why = { real: wx.real.map(i => C.why.real[i]), maths: wx.maths.map(i => C.why.maths[i]) };   // each level's Why? opens on its own story
    if (!s.whatif) {
      const last = typeof Freezer !== 'undefined' ? Freezer.list(this.id).slice(-1)[0] : null;
      if (last) o.whatIf = { gen: last.gen, levers: DC_LV[n].levers };
    }
    const spec = this.debrief(); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    const by = {}; for (const k in DC_STARS_BY[n]) by[k] = C.captions[DC_STARS_BY[n][k]]; o.stars = by;   // the "still to earn" line names only stars this level can award
    End.show(this, o);
  },
  bodyVars() { const s = this.sim.s, k = s.crash ? s.crash.kept : 0; return { h: s.crash ? Math.round(100 * s.crash.H / s.H0) : 0, k, l: 12 - k, z: s.zoo && s.zoo.E != null ? (Math.round(s.zoo.E * 10) / 10).toFixed(1) : '0' }; },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, G = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null, k = G.k;
    if (e.k === 'chip') {
      const [x0, y0] = e.n < 0 ? [G.W / 2, G.felt.y] : this.stackPos(G), B = G.bins[e.b], n = s.chips[e.b] - 1, [x1, y1] = this.chipTop(G, e.b, n);
      v.inb = v.inb || {}; v.inb[e.b] = (v.inb[e.b] || 0) + 1;
      if (F) F.ring(x1, y1, B.r + 6, { ms: 140 });   // telegraph within a frame of the tap
      v.fl.push({ kind: 'chip', x0, y0, x1, y1, t: 0, d: 0, ms: 0.16, r: B.r, done: () => { v.inb[e.b] = Math.max(0, (v.inb[e.b] || 0) - 1); v.flash[e.b] = 1; this.snd('tock', x1, y1); } });
      if (v.cursor !== e.b) v.cursor = e.b;
      if (s.level === 1 && s.ti === 0 && !v.thaw) this.tip('volHint'); else this.tip('pills');   // the pay pills appear with the first chip
    } else if (e.k === 'unchip') {
      const B = G.bins[e.b], [x0, y0] = this.chipTop(G, e.b, s.chips[e.b]), [x1, y1] = this.stackPos(G);
      v.fl.push({ kind: 'chip', x0, y0, x1, y1, t: 0, d: 0, ms: 0.16, r: B.r, done: () => { } }); if (F) F.ring(x0, y0, B.r + 4, { ms: 180 });
    } else if (e.k === 'full') { this.tip('hold'); if (F) { const p = this.stackPos(G); F.ring(p[0], p[1], 22, { ms: 300 }); } }   // the HUD already says Spin; teach take-back once
    else if (e.k === 'fullAlready') this.whisper('full');
    else if (e.k === 'clear') {   // every chip flies home
      const [x1, y1] = this.stackPos(G); let d = 0; v.inb = {};
      e.was.forEach((c, b) => { const B = G.bins[b]; for (let i = c - 1; i >= 0; i--) { const [x0, y0] = this.chipTop(G, b, i); v.fl.push({ kind: 'chip', x0, y0, x1, y1, t: 0, d: (d++) * 0.025, ms: 0.16, r: B.r, done: () => { } }); } });
      this.snd('swish', x1, y1);
    }
    else if (e.k === 'same') { v.inb = {}; G.bins.forEach((B, b) => { if (s.chips[b] && F) F.ring(B.cx, B.base - s.chips[b] * B.step, B.r + 6, { ms: 200 }); }); this.whisper('same'); this.snd('tock', G.W / 2, G.felt.y + 20); }
    else if (e.k === 'sameNo') this.whisper('need');
    else if (e.k === 'need') this.whisper('need');
    else if (e.k === 'empty') this.whisper('empty');
    else if (e.k === 'fixedN') this.whisper('fixed');
    else if (e.k === 'stormSize') { if (F) F.ring(G.W / 2, G.land.y + G.land.h * 0.42, 12 + 4 * e.n, { ms: 200 }); this.snd('tick', G.W / 2, G.land.y + 20); }
    else if (e.k === 'spun') {
      v.spinT = 0; const L = DC_LV[s.level];
      if (typeof Whisper !== 'undefined' && Whisper.clear) Whisper.clear(true);   // stale bet-phase whispers must not sit over the first generations
      if (e.last && typeof Freezer !== 'undefined' && L.kind !== 'zoo') Freezer.put(this.id, 1 + s.ti, this.sim.snapshot());
      if (F) F.tier(1, () => { }); this.snd('swish', G.foot.x + G.foot.w - 40, G.foot.y + 20);
    }
    else if (e.k === 'run') { v.pulse = 1; if (F) F.burst('dust', G.W / 2, (G.rack || G.tray || G.felt).y + 20, 4); if (typeof Whisper !== 'undefined' && Whisper.clear) Whisper.clear(true); }
    else if (e.k === 'predicted') {   // phone: the strip the marker opened folds at once, so the run is not played under it
      if (!s.ask && typeof Predict !== 'undefined') Predict.fold();
    }
    else if (e.k === 'gen') {
      v.pulse = 1; if (s.jars) this.shuffleBeads(); if (e.g % 3 === 0) this.snd('tick', 30, G.top + 12);
      if (e.g % 5 === 0) { const f = s.jars ? s.jars.filter(J => J.out >= 0).length : s.bot.filter(B => B.k === 0 || B.k === 32).length; this.live('liveGen', { g: e.g, f, n: (s.jars || s.bot).length }); }
    }
    else if (e.k === 'land') this.landFlight(e, G, v.stag = (v.stag || 0) + 1);
    else if (e.k === 'vol') {   // a crash set (or called off) before Spin
      const R0 = G.jars[e.j];
      if (e.on) { if (F) { F.burst('dust', R0.x + R0.w / 2, R0.y + 4, 8); F.ring(R0.x + R0.w / 2, R0.y + R0.h / 2, R0.w * 0.7, { ms: 220 }); } v.shake[e.j] = 1; this.snd('crack', R0.x + R0.w / 2, R0.y); if (!this.tip('volSet')) this.whisper('volSet'); }
      else { if (F) F.ring(R0.x + R0.w / 2, R0.y + R0.h / 2, R0.w * 0.5, { ms: 160, dashed: true }); this.whisper('volOff'); this.snd('tick', R0.x + R0.w / 2, R0.y); }
    }
    else if (e.k === 'volMax') this.whisper('volMax');
    else if (e.k === 'pin') { const R0 = this.itemRect(G, e.j); if (R0 && F) F.ring(R0.x + R0.w / 2, R0.y + R0.h / 2, Math.max(R0.w, R0.h) * 0.6, { ms: 240 }); if (!v.ghosted.pin) { v.ghosted.pin = 1; this.whisper('pinned'); } }
    else if (e.k === 'settle') {
      v.settleT = 0; const n = e.paid; this.talk(s.side >= 0 ? 'census' : n > 0 ? 'pays' : n < 0 ? 'wins' : DC_LV[s.level].crp || 'halves');
      if (F) { F.tier(2, () => { }); if (s.side < 0 && n) F.pop((n > 0 ? '+' : '−') + Math.abs(n), G.foot.x + 72, G.foot.y + G.foot.h * 0.62 - 26, n > 0 ? 1 : -1, { size: 22 }); }
      this.live('liveTable', { w: (n > 0 ? '+' : '') + n });
      if (v.tipLater) { const k = v.tipLater; v.tipLater = null; setTimeout(() => { if (this.v === v) this.tip(k); }, 500); }
      if (s.phase === 'settle' && DC_LV[s.level].ask && s.ti === DC_LV[s.level].ask.table && s.side < 0 && s.pred[DC_LV[s.level].ask.id] != null) this.reveal(DC_LV[s.level].ask.id);
    }
    else if (e.k === 'table') { v.tableT = 0; this.resetShown(); v.inb = {}; this.talk(DC_LV[s.level].crp); if (typeof Predict !== 'undefined') Predict.clear(); if (G.k === 'jars') { if (F) F.burst('droplet', G.W / 2, G.top + 30, 6); this.snd('pour', G.W / 2, G.top + 30); } else this.snd('swish', G.W / 2, G.top + 30); }
    else if (e.k === 'side') { v.tableT = 0; this.talk('census'); if (F) F.tier(3, ms => { v.banner = { text: this.content.labels.ruler, t: 0, ms: Math.max(900, ms + 300) }; }); if (e.i === 0) this.tip('neDef'); }
    else if (e.k === 'sideRun') { v.tableT = 0; this.snd('pour', G.W / 2, G.top + 40); }
    else if (e.k === 'sgen') { v.pulse = 1; if (e.g % 4 === 0) this.snd('tick', 30, G.top + 12); }
    else if (e.k === 'sideDone') {
      const D = DC_SIDES[e.i], y = s.pred[D.id], se = s.sides[e.i] ? s.sides[e.i].se : 0; this.reveal(D.id);
      if (F) { const R1 = this.rulerGeo(G); F.ring(R1.X(Math.min(48, e.fit)), R1.y, 14, { ms: 300 }); F.ring(R1.X(D.Ne), R1.y, 18, { ms: 360, dashed: true }); }   // no text pop: the fit and formula pills say it, and 'you' stays readable
      this.live('liveSide', { f: Math.round(e.fit), e: Math.max(1, Math.round(se)), y: y == null ? '?' : Math.round(y), r: Math.round(D.Ne) }); this.snd('count', G.W / 2, G.top + 40);
    }
    else if (e.k === 'storm') { v.stormT = 0; this.snd('wing', G.W / 2, G.land.y + 20); if (F) F.burst('dust', G.W / 2, G.land.y + G.land.h * 0.4, 10); }
    else if (e.k === 'readyErupt') { }
    else if (e.k === 'erupt') {
      v.erT = 0; const p = this.volcanoAt();
      if (typeof Freezer !== 'undefined') Freezer.put(this.id, 1, this.sim.snapshot());
      if (F) { F.tier(3, () => { }); F.burst('dust', p[0], p[1] - 10, 18); F.burst('spark', p[0], p[1] - 20, 10, { ink: '#CF9A33' }); F.flash({ alpha: 0.2, ms: 300 }); }
      this.snd('crack', p[0], p[1]);
      e.lost.forEach((a, i) => setTimeout(() => { if (!this.v || this.sim.s !== s) return; this.v.lost[a] = 1; const q = this.letterAt(a); if (typeof Fx !== 'undefined') Fx.ring(q[0], q[1], 16, { dashed: true }); this.snd('tick', q[0], q[1]); }, 900 + 160 * i));
      setTimeout(() => { if (this.sim.s === s && s.crash) { this.live('liveCrash', { k: s.crash.kept, h: Math.round(100 * s.crash.H / s.H0) }); this.reveal('hk'); this.reveal('al'); } }, 1100 + 160 * e.lost.length);
    }
    else if (e.k === 'zooStart') { v.zt = 0; v.lost = {}; if (typeof Predict !== 'undefined') Predict.clear(); if (F) F.tier(3, ms => { v.banner = { text: this.content.labels.zoo, t: 0, ms: Math.max(900, ms + 300) }; }); }
    else if (e.k === 'zgen') { v.zt = 0; v.pulse = 1; if (F && !s.zoo.auto) for (let p = 0; p < 4; p++) { const P = this.penRect(G, p); F.burst('egg', P.x + P.w / 2, P.y + P.h / 2, 2); } if (!s.zoo.auto) { this.snd('peep', G.W - 40, G.isle.y + 10); if (e.g % 5 === 0) this.live('liveZoo', { g: e.g, k: s.zoo.kept[s.zoo.kept.length - 1] }); } }
    else if (e.k === 'zlost') { v.lost[e.a] = 1; const q = this.letterAt(e.a); if (F) F.ring(q[0], q[1], 16, { dashed: true }); if (!s.zoo.auto) { this.whisper('lost', { x: 'ABCDEFGHIJKL'[e.a] }); this.snd('interesting', q[0], q[1]); } }
    else if (e.k === 'zback') { delete v.lost[e.a]; const q = this.letterAt(e.a); if (F) F.burst('spark', q[0], q[1], 8); if (!s.zoo.auto) this.whisper('back', { x: 'ABCDEFGHIJKL'[e.a] }); }
    else if (e.k === 'bal') { this.whisper('balanced'); if (F) F.ring(G.W / 2, G.isle.y + G.isle.h / 2, 60, { ms: 300 }); this.snd('tock', G.W / 2, G.isle.y + 20); }
    else if (e.k === 'eq') { if (e.on) this.whisper('equal'); this.snd('tock', G.W / 2, G.isle.y + 20); }
    else if (e.k === 'migBuy') { this.snd('wing', G.W - 30, G.isle.y + 30); if (F) F.pop('−' + e.price, G.W - 60, G.isle.y + G.isle.h - 60, -1); }
    else if (e.k === 'migIn') { v.mig = { t: 0, i: e.i }; this.whisper('migrant'); }
    else if (e.k === 'broke') this.whisper('broke');
    else if (e.k === 'oneGen') this.whisper('oneGen');
    else if (e.k === 'zooEnd' || e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  landFlight(e, G, stag) {
    const s = this.sim.s, v = this.v, k = G.k, b = e.bin, F = typeof Fx !== 'undefined' ? Fx : null;
    const from = this.itemRect(G, e.j); if (!from) return;
    const n = Math.max(0, s.landed[b] - 1), [x1, y1] = this.landSlot(G, b, n), d = k === 'buri' ? 0.012 * e.j : Math.min(0.9, 0.07 * (stag - 1));
    v.gone[e.j] = true; v.pending = (v.pending || 0) + e.pay;
    const hx = k === 'buri' ? this.histGeo(G) : null, col = k === 'buri' ? s.bot[e.j].k : 0, J = k === 'jars' ? s.jars[e.j] : null, outCol = J ? (J.out >= 0 && J.fix >= 0 ? (J.k ? 0 : 1) : 2) : 0;
    v.colN = v.colN || {}; const cn = hx ? (v.colN[col] = (v.colN[col] || 0) + 1) : 0, bh = hx ? Math.min(6, hx.h / 22) : 0;
    const tx = hx ? hx.x0 + (col + 0.5) * hx.cw : x1, ty = hx ? Math.max(hx.y0, hx.y1 - cn * bh) : y1;
    v.fl.push({ kind: k === 'islets' ? 'islet' : k === 'buri' ? 'vial' : 'jar', j: e.j, x0: from.x + from.w / 2, y0: from.y + from.h / 2, x1: tx, y1: ty, w0: from.w, h0: from.h, t: 0, d, ms: k === 'buri' ? 0.5 : 0.45, bin: b, isz: G.bins[b] ? G.bins[b].isz : 12,
      done: () => {
        v.shown[b] = (v.shown[b] || 0) + 1; v.purse += e.pay; v.pending -= e.pay; v.flash['l' + b] = 1;
        v.landCol = v.landCol || {}; (v.landCol[b] = v.landCol[b] || []).push(outCol);
        if (k === 'buri') { v.col = v.col || {}; v.col[col] = (v.col[col] || 0) + 1; }
        const py = k === 'buri' ? y1 - 18 : y1 - (G.bins[b] ? G.bins[b].isz : 12) * 0.6 - 16;   // above the landed stack, clear of the bin's name
        if (F && (k !== 'buri' || e.j % 9 === 0)) { if (e.pay) F.pop((e.pay > 0 ? '+' : '−') + Math.abs(e.pay), x1, py, e.pay > 0 ? 1 : -1); else F.ring(x1, y1, 10, { ms: 200 }); }
        if (k !== 'buri' || e.j % 6 === 0) this.snd('count', x1, y1);
        const rec = s.tab[s.ti]; if (e.pay < 0 && rec && rec.q[b] > 0 && !v.tipLater) v.tipLater = rec.q[b] < rec.c[b] ? 'harder' : 'spread';   // why a bin you backed can cost you: said when the table settles, not over the jars
      } });
  },
  flights(dt) {
    const v = this.v; v.stag = 0; v.pulse = Math.max(0, v.pulse);
    for (const key in v.flash) { v.flash[key] -= dt / 0.22; if (v.flash[key] <= 0) delete v.flash[key]; }
    for (const key in v.shake) { v.shake[key] -= dt / 0.3; if (v.shake[key] <= 0) delete v.shake[key]; }
    if (v.mig) { v.mig.t += dt; if (v.mig.t > 0.9) v.mig = null; }
    const calm = typeof Fx !== 'undefined' && Fx.calm;   // Calm: flights become short slides (D4 §5)
    for (let i = v.fl.length - 1; i >= 0; i--) { const f = v.fl[i]; if (calm && !f.calm) { f.calm = 1; f.ms = Math.min(f.ms, 0.15); f.d = Math.min(f.d, 0.3); } f.t += dt; if (f.t >= f.d + f.ms) { v.fl.splice(i, 1); try { f.done(); } catch (er) { if (typeof showErr === 'function') showErr(er); } } }
  },
  shuffleBeads() {   // cosmetic: a few beads trade places each generation, so changes look local
    const s = this.sim.s, v = this.v, rnd = typeof Fx !== 'undefined' ? () => Fx.rnd() : () => 0.5;
    s.jars.forEach((J, j) => { let o = v.ord[j]; if (!o || o.length !== J.cur) { o = v.ord[j] = []; for (let i = 0; i < J.cur; i++) o.push(i); for (let i = o.length - 1; i > 0; i--) { const r = Math.floor(rnd() * (i + 1)), t = o[i]; o[i] = o[r]; o[r] = t; } } for (let q = 0; q < Math.max(2, J.cur / 6); q++) { const a = Math.floor(rnd() * o.length), b = Math.floor(rnd() * o.length), t = o[a]; o[a] = o[b]; o[b] = t; } });
  },
  itemRect(G, j) {
    const s = this.sim.s;
    if (G.k === 'jars') return G.jars[j];
    if (G.k === 'buri') return this.vialRect(G, j);
    if (G.k === 'islets') return G.isl[j];
    return null;
  },

  /* ---------- input ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, G = this.geo(), k = G.k;
    if (s.phase === 'bet') {
      if (k === 'islets' && !s.fixedN && y >= G.land.y && y <= G.land.y + G.land.h) { Sim.act(this, { k: 'storm', n: 2 }); v.hold = { t: 0 }; return; }
      const b = this.binAt(x, y); if (b >= 0) { v.press = { x, y, t: v.t, bin: b, drag: false }; return; }
      if (k === 'jars' || k === 'buri') {   // a jar tapped while betting: L2 sets (or calls off) its crash; elsewhere it becomes your pinned jar or bottle
        const n = k === 'jars' ? s.jars.length : s.bot.length;
        for (let j = 0; j < n; j++) { const R0 = this.itemRect(G, j); if (R0 && x >= R0.x - 4 && x <= R0.x + R0.w + 4 && y >= R0.y - 4 && y <= R0.y + R0.h + 4) { Sim.act(this, { k: k === 'jars' && DC_LV[s.level].volcano ? 'vol' : 'pin', j }); return; } }
      }
      return;
    }
    if (s.phase === 'zoo') { for (const T of v.tags || []) if (T.box && x >= T.box.x - 4 && x <= T.box.x + T.box.w + 4 && y >= T.box.y - 4 && y <= T.box.y + T.box.h + 4) { Sim.act(this, T.a()); return; } }   // the price tags are buttons too
    if (s.phase === 'settle') { Sim.act(this, { k: 'next' }); return; }
    if (s.phase === 'erupt') { const p = this.volcanoAt(); if (Math.abs(x - p[0]) < Math.max(60, G.W * 0.18) && Math.abs(y - p[1]) < 90) Sim.act(this, { k: 'erupt' }); return; }
    if (s.phase === 'run' && (k === 'jars' || k === 'buri')) {
      const n = k === 'jars' ? s.jars.length : s.bot.length;
      for (let j = 0; j < n; j++) { const R0 = this.itemRect(G, j); if (R0 && x >= R0.x - 4 && x <= R0.x + R0.w + 4 && y >= R0.y - 4 && y <= R0.y + R0.h + 4) { Sim.act(this, { k: 'pin', j }); return; } }
    }
  },
  move(x, y) { const p = this.v.press; if (!p) return; if (!p.drag && Math.abs(x - p.x) + Math.abs(y - p.y) > 12) p.drag = true; p.mx = x; p.my = y; },
  up(x, y) {
    const v = this.v, p = v.press; v.hold = null; if (!p) return; v.press = null;
    if (this.sim.s.phase !== 'bet') return;
    if (p.drag) { const b = this.binAt(x, y); if (b >= 0 && b !== p.bin) Sim.act(this, { k: 'move', from: p.bin, to: b }); else if (b < 0) Sim.act(this, { k: 'rem', b: p.bin }); return; }
    if (v.t - p.t >= 0.55) Sim.act(this, { k: 'rem', b: p.bin }); else Sim.act(this, { k: 'add', b: p.bin });   // a hold takes a chip back (the ring fills first)
  },
  onKey(key) {
    const s = this.sim.s, v = this.v, nb = (s.chips || []).length;
    if (s.phase === 'bet' && nb) {
      if (key === 'ArrowLeft' || key === 'ArrowRight') { v.cursor = (v.cursor + (key === 'ArrowRight' ? 1 : nb - 1)) % nb; v.focus = true; return true; }
      if (key === 'ArrowUp' || key === '+' || key === '=') { v.focus = true; Sim.act(this, { k: 'add', b: v.cursor }); return true; }
      if (key === 'ArrowDown' || key === '-') { v.focus = true; Sim.act(this, { k: 'rem', b: v.cursor }); return true; }
      if ((key === 'u' || key === 'U') && s.n != null) { Sim.act(this, { k: 'storm', n: Math.min(12, s.n + 1) }); return true; }
      if ((key === 'd' || key === 'D') && s.n != null) { Sim.act(this, { k: 'storm', n: Math.max(2, s.n - 1) }); return true; }
      if (key === 'x' || key === 'X') { Sim.act(this, { k: 'clear' }); return true; }
      if (key === 'a' || key === 'A') { Sim.act(this, { k: 'same' }); return true; }
      if ((key === 'v' || key === 'V') && DC_LV[s.level].volcano && s.jars) {   // crash the next jar; at four, V calls them all off one by one
        const nv = s.jars.filter(J => J.crash >= 0).length, j = nv < DC_CRASH.max ? s.jars.findIndex(J => J.crash < 0) : s.jars.findIndex(J => J.crash >= 0);
        if (j >= 0) Sim.act(this, { k: 'vol', j }); return true;
      }
      if (key === 'Enter') { Sim.act(this, { k: 'spin' }); return true; }
    }
    if (s.phase === 'run' && s.jars) {
      if (key === 'ArrowLeft' || key === 'ArrowRight') { Sim.act(this, { k: 'pin', j: (s.pin + (key === 'ArrowRight' ? 1 : s.jars.length - 1)) % s.jars.length }); return true; }
    }
    if (s.phase === 'zoo') { if (key === 'b' || key === 'B') Sim.act(this, { k: 'bal' }); if (key === 'e' || key === 'E') Sim.act(this, { k: 'eq', on: !s.zoo.eq }); if (key === 'i' || key === 'I') Sim.act(this, { k: 'mig' }); }
    return false;
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, v = this.v, L = this.content.labels, W = this.content.whispers, k = this.kind(), ask = !!(s.ask && this._asking), ph = s.phase;
    let n = 0; for (const x of s.chips || []) n += x;
    const Z = s.zoo, sig = [ph, ask, n, s.paused, !!s.last, s.fixedN, s.n, Z ? [Z.bal, Z.eq, Z.budget, Z.pend, Z.migs].join() : ''].join('|');
    if (sig === this._dockSig) return; this._dockSig = sig;
    const act = a => () => Sim.act(this, a), b = [];
    if (ask) b.push({ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } });
    else if (ph === 'bet') {
      if (k === 'islets' && !s.fixedN) { b.push({ id: 'smaller', label: L.smaller, aria: 'Smaller storm', key: 'd', disabled: s.n <= 2, fn: act({ k: 'storm', n: s.n - 1 }) }); b.push({ id: 'bigger', label: L.bigger, aria: 'Bigger storm', key: 'u', disabled: s.n >= 12, fn: act({ k: 'storm', n: s.n + 1 }) }); }
      if (n === 10) b.push({ id: 'clear', label: L.clear, aria: 'Take every chip back', key: 'x', fn: act({ k: 'clear' }) });   // a visible undo beside Spin once the bet is full (before that, hold or drag a chip off)
      else if (s.last && s.last.length === (s.chips || []).length && k !== 'islets') b.push({ id: 'same', label: L.same, aria: 'Bet as on the last table', key: 'a', fn: act({ k: 'same' }) });
      b.push({ id: 'spin', label: k === 'islets' ? L.release : L.spin, key: ' ', primary: true, disabled: n !== 10, why: W.need, fn: act({ k: 'spin' }) });
    } else if (ph === 'run' && k === 'islets') { }
    else if (ph === 'run' || ph === 'sideRun' || (ph === 'zoo' && Z && !Z.auto)) {
      if (ph === 'zoo') {
        b.push({ id: 'bal', label: L.bal, aria: 'Balance the sexes', key: 'b', disabled: Z.bal || Z.budget < DC_ZOO.cBal, why: Z.bal ? W.balanced : W.broke, fn: act({ k: 'bal' }) });
        b.push({ id: 'eq', label: L.eq, aria: 'Equal family sizes', key: 'e', pressed: Z.eq, fn: act({ k: 'eq', on: !Z.eq }) });
        b.push({ id: 'mig', label: L.mig, aria: 'Buy a migrant', key: 'i', disabled: !!(Z.pend || Z.budget < DC_ZOO.cMig), why: Z.budget < DC_ZOO.cMig ? W.broke : W.oneGen, fn: act({ k: 'mig' }) });
      }
      b.push({ id: 'pause', label: s.paused ? L.play : L.pause, key: ' ', primary: !s.paused ? false : true, fn: act({ k: 'pause', on: !s.paused }) });
      if (s.paused) b.push({ id: 'step', label: L.step, key: 'ArrowRight', fn: act({ k: 'step' }) });
    }
    else if (ph === 'erupt') b.push({ id: 'erupt', label: L.erupt, key: ' ', primary: true, fn: act({ k: 'erupt' }) });
    else if (ph === 'settle') b.push({ id: 'next', label: L.next, key: ' ', primary: true, fn: act({ k: 'next' }) });
    Dock.set(b);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, L = this.content.labels, n = this.level, ph = s.phase, k = this.kind();
    let chips = 0; for (const x of s.chips || []) chips += x;
    let t;
    if (s.whatif && ph !== 'over') t = C.whatif;
    else if (ph === 'ask' && s.ask) t = C[s.ask.id];
    else if (ph === 'bet') { if (chips === 10) t = k === 'islets' ? C.release : C.spin; else if (n === 0 && s.ti === 0 && chips === 0) t = this.content.firstWords; else t = Txt.f(C[n === 3 ? (s.fixedN ? 'bet3a' : 'bet3') : 'bet' + n], { c: this.chipsTxt(10 - chips) }); }
    else if (s.paused) t = C.paused;
    else if (ph === 'run') t = C['run' + n];
    else if (ph === 'sideRun') t = C.side;
    else if (ph === 'settle') { const p = s.side >= 0 && s.sides[s.side] ? null : s.paid; t = p == null ? C.side : p > 0 ? Txt.f(C.pays, { c: this.chipsTxt(p) }) : p < 0 ? Txt.f(C.takes, { c: this.chipsTxt(-p) }) : C.even; }
    else if (ph === 'erupt') t = C.erupt;
    else if (ph === 'crash') t = C.crash;
    else if (ph === 'zooIntro') t = C.zooIntro;
    else if (ph === 'zoo' || ph === 'zooEnd') t = C.zoo;   // the token count sits in the HUD's number slot only
    else t = C.over;
    const num = k === 'zoo' ? (s.zoo && ph !== 'crash' ? Txt.f(L.tokens, { n: s.zoo.budget }) : Txt.f(L.nLetters, { n: this.present().filter(Boolean).length })) : this.chipsTxt(Math.round(this.v.purse));
    HUD.say(t, num);
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const G = this.geo(), s = this.sim.s;
    this.drawGround(c, G);
    if (G.k === 'jars') { this.drawRack(c, G); this.drawFelt(c, G); }
    else if (G.k === 'buri') { if (s.side >= 0) this.drawSide(c, G); else { this.drawTray(c, G); this.drawHero(c, G); this.drawFelt(c, G); } }
    else if (G.k === 'islets') { this.drawSea(c, G); this.drawLand(c, G); this.drawFelt(c, G); }
    else this.drawBoss(c, G);
    this.drawFlights(c, G);
    if (G.k !== 'zoo') this.drawFoot(c, G);
    this.drawBanner(c, G);
  },
  ink() { return '#1B1612'; },
  paper() { return typeof Pal !== 'undefined' ? Pal.paper : '#E8DFC9'; },
  inkA() { return typeof Pal !== 'undefined' ? Pal.A : '#6B97FF'; },
  inka() { return typeof Pal !== 'undefined' ? Pal.a : '#F2C94C'; },
  lbl(id, text, x, y, o) { if (typeof Lbl !== 'undefined') return Lbl.put('dc-' + id, text, x, y, o); return null; },
  drawGround(c, G) {   // the riverboat saloon: damask wall, a mahogany dado with a brass rail, lamplight and drifting smoke
    const v = this.v, key = G.W + 'x' + G.H + G.k, K = DC_LOOK;
    const paint = cc => {
      cc.fillStyle = K.wall; cc.fillRect(0, 0, G.W, G.H);
      cc.fillStyle = K.wall2; for (let x = 0; x < G.W; x += 36) cc.fillRect(x, 0, 14, G.H);   // wallpaper stripes
      cc.fillStyle = 'rgba(224,194,126,0.07)';   // a quiet damask lozenge in each stripe
      for (let x = 7; x < G.W; x += 36) for (let y = 20 + ((x / 36) % 2) * 22; y < G.H; y += 44) { cc.beginPath(); cc.moveTo(x, y - 8); cc.lineTo(x + 5, y); cc.lineTo(x, y + 8); cc.lineTo(x - 5, y); cc.closePath(); cc.fill(); }
      const dy = G.H - Math.max(70, G.H * 0.16);   // the dado: mahogany panels under a brass rail
      cc.fillStyle = K.wood; cc.fillRect(0, dy, G.W, G.H - dy);
      cc.strokeStyle = 'rgba(0,0,0,0.25)'; cc.lineWidth = 1; for (let x = 0; x < G.W; x += 90) { cc.strokeRect(x + 8.5, dy + 10.5, 74, G.H - dy - 20); }
      cc.fillStyle = K.brass; cc.fillRect(0, dy - 4, G.W, 4); cc.fillStyle = K.brass2; cc.fillRect(0, dy - 4, G.W, 1);
      if (typeof cc.createRadialGradient === 'function') {   // the lamp over the table
        const g = cc.createRadialGradient(G.W / 2, G.top - 40, 10, G.W / 2, G.top - 40, Math.max(G.W, G.H) * 0.75);
        g.addColorStop(0, 'rgba(255,214,150,0.22)'); g.addColorStop(0.5, 'rgba(255,190,120,0.07)'); g.addColorStop(1, 'rgba(0,0,0,0.25)');
        cc.fillStyle = g; cc.fillRect(0, 0, G.W, G.H);
      }
    };
    if (typeof Layer === 'undefined') paint(c);
    else { if (!v.bg || v.bg.key !== key) v.bg = { key, L: Layer(G.W, G.H).redraw(cc => paint(cc)) }; v.bg.L.blit(c, 0, 0); }
    c.save(); c.fillStyle = 'rgba(214,200,184,0.045)';   // cigar smoke drifting under the lamp (cosmetic)
    for (let i = 0; i < 4; i++) { const t = v.t * 0.05 + i * 0.27, x = ((t % 1) * 1.4 - 0.2) * G.W, y = G.top + 30 + i * G.A * 0.21 + 14 * Det.sin(v.t * 0.3 + i); c.beginPath(); c.ellipse(x, y, G.W * 0.28, 26 + 8 * i, 0, 0, TAU); c.fill(); }
    c.restore();
  },
  /* the rack: jars of beads on wooden shelves; beads are gene copies (blue A, amber a) */
  drawRack(c, G) {
    const s = this.sim.s, v = this.v, I = this.ink(), L = this.content.labels;
    const K = DC_LOOK;
    for (const y of G.rack.rowY) { c.fillStyle = K.wood2; c.fillRect(G.rack.x + 4, y + 2, G.rack.w - 8, 8); c.fillStyle = K.brass; c.fillRect(G.rack.x + 4, y + 1, G.rack.w - 8, 2); c.fillStyle = 'rgba(0,0,0,0.4)'; c.fillRect(G.rack.x + 4, y + 10, G.rack.w - 8, 3); }
    s.jars.forEach((J, j) => this.drawJar(c, G.jars[j], J, j));
  },
  drawJar(c, R, J, j, o) {
    o = o || {}; const s = this.sim.s, v = this.v, I = this.ink(), gone = v.gone[j] && !o.fly;
    let x = R.x, y = R.y; const w = R.w, h = R.h, neck = Math.max(6, h * 0.12);
    if (v.shake[j]) x += Det.sin(v.t * 70) * 3 * v.shake[j];
    if (gone) { c.save(); c.setLineDash([4, 4]); c.strokeStyle = 'rgba(241,230,200,0.32)'; c.lineWidth = 1.5; rrect(c, x, y + neck, w, h - neck, Math.min(10, w * 0.2)); c.stroke(); c.restore(); return; }
    const pinned = s.pin === j && !o.fly && (s.phase !== 'bet' || v.ghosted.pin);
    if (pinned) { c.save(); c.lineWidth = 5; c.strokeStyle = I; rrect(c, x - 3, y + neck - 3, w + 6, h - neck + 6, 12); c.stroke(); c.lineWidth = 3; c.strokeStyle = this.paper(); c.stroke(); c.restore(); }
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.3)'; c.beginPath(); c.ellipse(x + w / 2, y + h + 1, w * 0.46, 3, 0, 0, TAU); c.fill();
    rrect(c, x, y + neck, w, h - neck, Math.min(10, w * 0.2)); c.fillStyle = 'rgba(218,228,222,0.78)'; c.fill();
    this.beads(c, { x: x + 4, y: y + neck + 4, w: w - 8, h: h - neck - 8 }, J, j);
    rrect(c, x, y + neck, w, h - neck, Math.min(10, w * 0.2)); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(x + 4, y + neck + 6, Math.max(2, w * 0.08), (h - neck) * 0.55);
    rrect(c, x + w * 0.16, y + 1, w * 0.68, neck, 3); c.fillStyle = DC_LOOK.brass; c.fill(); c.lineWidth = 1.5; c.stroke(); c.fillStyle = DC_LOOK.brass2; c.fillRect(x + w * 0.2, y + 2.5, w * 0.6, 1.5);
    if (J.fix >= 0 || o.cork) { rrect(c, x + w * 0.24, y - 4, w * 0.52, neck + 2, 3); c.fillStyle = '#A07C52'; c.fill(); c.lineWidth = 1.2; c.stroke(); }
    c.restore();
    const hot = J.crash >= 0 && !o.fly && (s.phase === 'bet' ? DC_LV[s.level].volcano : s.gen < J.crash + DC_CRASH.gens);   // a crash set before Spin, or one in progress
    if (hot) this.cone(c, x + w / 2, y - 2, Math.max(10, Math.min(18, w * 0.32)), s.phase !== 'bet');
    if (pinned && !o.fly) this.lbl('you', this.content.labels.you, x + w / 2, y + h + 9, { size: 12 });
  },
  cone(c, x, y, r, smoke) {   // the crash mark: a little volcano on the jar's lid (natural paint: rock and ochre lava, never a data ink)
    const I = this.ink(); c.save(); c.beginPath(); c.moveTo(x - r, y); c.lineTo(x - r * 0.25, y - r * 0.9); c.lineTo(x + r * 0.25, y - r * 0.9); c.lineTo(x + r, y); c.closePath(); c.fillStyle = '#6F625A'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke();
    c.beginPath(); c.moveTo(x - r * 0.25, y - r * 0.9); c.lineTo(x + r * 0.25, y - r * 0.9); c.lineTo(x + r * 0.1, y - r * 0.5); c.lineTo(x - r * 0.1, y - r * 0.55); c.closePath(); c.fillStyle = '#CF9A33'; c.fill();
    if (smoke) { c.fillStyle = 'rgba(80,72,66,0.45)'; const t = this.v.t; for (let i = 0; i < 3; i++) { const k = (t * 0.8 + i / 3) % 1; c.beginPath(); c.arc(x + Det.sin(i * 2.1 + t) * 3, y - r - k * r * 1.4, r * (0.2 + 0.3 * k), 0, TAU); c.fill(); } }
    c.restore();
  },
  beads(c, B, J, j) {   // the rung-0 chart: exactly J.k blue copies among J.cur beads
    const v = this.v, n = J.cur; let o = v.ord[j]; if (!o || o.length !== n) { this.shuffleBeads(); o = v.ord[j]; }
    const cols = Math.max(1, Math.round(Math.sqrt(n * B.w / B.h))), rows = Math.ceil(n / cols), p = Math.min(B.w / cols, B.h / rows), r = p * 0.43;
    const ox = B.x + (B.w - cols * p) / 2 + p / 2, oy = B.y + B.h - p / 2, drop = v.tableT < 0.4 ? (1 - v.tableT / 0.4) * B.h * 0.6 : 0, A = this.inkA(), a = this.inka();
    for (let i = 0; i < n; i++) {
      const cx = ox + (i % cols) * p, cy = oy - Math.floor(i / cols) * p - drop * (1 - i / n), al = o[i] < J.k ? 0 : 1;
      if (r >= 6 && typeof Pal !== 'undefined') { Pal.token(c, cx, cy, r, al, { lw: 1.2 }); this.gloss(c, cx, cy, r); }
      else {
        c.fillStyle = al ? a : A; if (r < 2.6) c.fillRect(cx - r, cy - r, 2 * r, 2 * r); else { c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); }
        if (al && r >= 2.6) { c.strokeStyle = 'rgba(27,22,18,0.55)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx - r * 0.6, cy + r * 0.6); c.lineTo(cx + r * 0.6, cy - r * 0.6); c.stroke(); }   // amber carries a stroke, so blue and amber differ in shape too (CVD, greyscale)
        if (r >= 3.5) this.gloss(c, cx, cy, r);
      }
    }
  },
  gloss(c, x, y, r) {   // a glass marble's highlight: a soft crescent top left (cosmetic; the letter stays clear)
    c.save(); c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(x - r * 0.42, y - r * 0.5, r * 0.32, r * 0.18, -0.6, 0, TAU); c.fill(); c.restore();
  },
  /* the felt: the bins are the histogram; your chips on the left of each bin, finished jars stack on the right */
  drawFelt(c, G) {
    const s = this.sim.s, v = this.v, F = G.felt, I = this.ink(), P = this.paper(), L = this.content.labels, keys = DC_BINS[DC_LV[s.level].bins];
    this.baize(c, F);
    if (G.k === 'buri') this.drawHist(c, G);
    this.feltTop(c, G);
    const odds = s.phase === 'bet' || !s.tab[s.ti] ? s.odds : s.tab[s.ti].c, rec = s.phase === 'bet' ? null : s.tab[s.ti];
    const q = rec ? rec.q : (s.chips || []).map(x => x / 10), anyBet = !s.whatif && (!!rec || (s.chips || []).some(x => x > 0));
    G.bins.forEach((B, b) => {
      if (b > 0) { c.save(); c.setLineDash([3, 5]); c.strokeStyle = 'rgba(232,223,201,0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(B.x - 3, B.y + 4); c.lineTo(B.x - 3, B.y + B.h - 4); c.stroke(); c.restore(); }
      const gh = (odds[b] || 0) * 10 * B.step;   // the croupier's odds: a dashed ghost stack
      if (gh > 0.5) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(232,223,201,0.75)'; c.strokeRect(B.cx - B.r - 3, B.base + B.r * 0.45 - gh - B.r * 0.4, 2 * B.r + 6, gh + B.r * 0.4); c.restore(); }
      const nIn = (v.inb && v.inb[b]) || 0, n = Math.max(0, s.chips[b] - nIn), fl = v.flash[b] || 0;
      for (let i = 0; i < n; i++) this.chip(c, B.cx, B.base - i * B.step - (i === n - 1 ? fl * 3 : 0), B.r);
      if (n) this.lbl('n' + b, String(n), B.cx, B.base - n * B.step - B.r - 6, { size: 12, mono: true });
      if (G.k !== 'buri') { const m = v.shown[b] || 0, st = this.landStep(B), lf = v.flash['l' + b] || 0, cols = (v.landCol && v.landCol[b]) || []; for (let i = 0; i < m; i++) this.icon(c, B.lx, B.base - 4 - i * st - (i === m - 1 ? lf * 3 : 0), G.k, cols[i], B.isz); if (m) this.lbl('m' + b, String(m), B.lx, B.base - 4 - m * st - B.isz - 8, { size: 12, mono: true, bg: '#EAD8A8' }); }
      else if (v.shown[b]) this.lbl('m' + b, String(v.shown[b]), B.lx, B.base - 12, { size: 13, mono: true, bg: '#EAD8A8' });
      if (v.focus && v.cursor === b && s.phase === 'bet') { c.save(); c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = P; c.strokeRect(B.x + 1, B.y + 1, B.w - 2, B.h - 2); c.restore(); }
      const pr = v.press; if (pr && pr.bin === b && !pr.drag && v.t - pr.t > 0.12) { const f = Math.min(1, (v.t - pr.t) / 0.45); c.save(); c.lineWidth = 3; c.strokeStyle = P; c.beginPath(); c.arc(B.cx, B.base - n * B.step, B.r + 6, -TAU / 4, -TAU / 4 + TAU * f); c.stroke(); c.restore(); }
      this.lbl('b' + b, L[keys[b]], B.x + B.w / 2, B.y + B.h - 11, { size: B.w < 70 ? 12 : 13 });
      if (anyBet) {   // what one jar landing here pays you now: DC_K × (your score − his); a shape as well as a sign, never a hue
        const pay = Math.round(DC_K * (DC.S(q, b) - DC.S(odds, b)));
        this.lbl('pay' + b, pay > 0 ? '+' + pay + ' ▲' : pay < 0 ? '−' + (-pay) + ' ▼' : '0', B.x + B.w / 2, B.y + 6, { size: 12, mono: true, bg: pay > 0 ? '#F4EEDD' : pay < 0 ? '#CFC6B0' : '#E8DFC9' });
      }
    });
    const pr = v.press; if (pr && pr.drag && pr.mx != null) this.chip(c, pr.mx, pr.my, G.bins[0].r);
  },
  baize(c, F) {   // the table: mahogany rail, brass rim, green baize brighter under the lamp, a brass pinstripe
    const K = DC_LOOK; c.save();
    rrect(c, F.x - 2, F.y - 2, F.w + 4, F.h + 4, 16); c.fillStyle = K.wood; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(0,0,0,0.5)'; c.stroke();
    rrect(c, F.x + 3, F.y + 3, F.w - 6, F.h - 6, 12);
    if (typeof c.createRadialGradient === 'function') { const g = c.createRadialGradient(F.x + F.w / 2, F.y + F.h * 0.35, 10, F.x + F.w / 2, F.y + F.h * 0.4, Math.max(F.w, F.h) * 0.7); g.addColorStop(0, K.felt2); g.addColorStop(0.7, K.felt); g.addColorStop(1, K.feltD); c.fillStyle = g; } else c.fillStyle = K.felt;
    c.fill(); c.lineWidth = 2.5; c.strokeStyle = K.brass; c.stroke();
    c.lineWidth = 1; c.strokeStyle = 'rgba(224,194,126,0.35)'; rrect(c, F.x + 9, F.y + 9, F.w - 18, F.h - 18, 8); c.stroke(); c.restore();
  },
  feltTop(c, G) {   // the table's state along the felt's top edge: generation, table number, size
    const s = this.sim.s, F = G.felt, L = this.content.labels, nt = (DC_LV[s.level].tables || []).length, y = F.y + 2;
    if (F.h < 110) return;   // landscape phones: the chip counts need the room; the strip and HUD carry the generation
    if (G.k === 'jars') { this.lbl('gen', Txt.f(L.gen, { n: s.gen, m: s.T }), F.x + 14, y, { size: 12, align: 'left', mono: true }); this.lbl('beads', Txt.f(L.beads, { n: s.N }), F.x + F.w - 14, y, { size: 12, align: 'right' }); }
    if (nt > 1) this.lbl('table', Txt.f(L.table, { n: s.ti + 1, m: nt }), F.x + F.w / 2, y, { size: 12 });
  },
  chip(c, x, y, r) {   // a casino chip: burgundy, cream edge spots and inlay, ink rim (your stake; never a data ink)
    const I = this.ink(), K = DC_LOOK;
    c.save(); c.beginPath(); c.ellipse(x, y + r * 0.22, r, r * 0.62, 0, 0, TAU); c.fillStyle = K.chipD; c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke();
    c.beginPath(); c.ellipse(x, y, r, r * 0.62, 0, 0, TAU); c.fillStyle = K.chip; c.fill(); c.lineWidth = 1.4; c.stroke();
    c.setLineDash([r * 0.32, r * 0.5]); c.beginPath(); c.ellipse(x, y, r * 0.84, r * 0.5, 0, 0, TAU); c.lineWidth = Math.max(1.5, r * 0.2); c.strokeStyle = K.cream; c.stroke();
    c.setLineDash([2.5, 2.5]); c.beginPath(); c.ellipse(x, y, r * 0.5, r * 0.29, 0, 0, TAU); c.lineWidth = 1.1; c.stroke(); c.restore();
  },
  icon(c, x, y, k, col, sz) {   // a finished jar (filled with its final colour: blue, amber or both) or a founded islet, stacked in its bin
    const I = this.ink(), z = sz || 12, w = z * 0.8, h = z; c.save();
    if (k === 'islets') { c.beginPath(); c.ellipse(x, y, z * 0.75, z * 0.38, 0, 0, TAU); c.fillStyle = DC_LOOK.sand; c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke(); c.fillStyle = DC_LOOK.scrub; c.beginPath(); c.ellipse(x - z * 0.15, y - z * 0.05, z * 0.3, z * 0.15, 0, 0, TAU); c.fill(); }
    else {
      rrect(c, x - w / 2, y - h / 2, w, h, 3); c.fillStyle = col === 0 ? this.inkA() : col === 1 ? this.inka() : 'rgba(206,224,230,0.95)'; c.fill();
      if (col === 2) { c.save(); rrect(c, x - w / 2, y - h / 2, w, h, 3); c.clip(); c.fillStyle = this.inkA(); c.fillRect(x - w / 2, y, w, h / 2); c.fillStyle = this.inka(); c.fillRect(x - w / 2, y - h / 2, w, h / 2); c.restore(); }
      rrect(c, x - w / 2, y - h / 2, w, h, 3); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke(); c.fillStyle = DC_LOOK.brass; c.fillRect(x - w * 0.3, y - h / 2 - 3, w * 0.6, 3);
    }
    c.restore();
  },
  drawFoot(c, G) {
    const s = this.sim.s, v = this.v, F = G.foot, L = this.content.labels; let placed = 0; for (const x of s.chips || []) placed += x;
    const [sx, sy] = this.stackPos(G), r = 10; for (let i = 0; i < 10 - placed; i++) this.chip(c, sx, sy + 8 - i * 4, r);
    if (s.side >= 0) this.lbl('table', Txt.f(L.table, { n: s.side + 1, m: 3 }), F.x + F.w * 0.5, F.y + F.h * 0.62, { size: 12 });
    this.croupier(c, F.x + F.w - 34, F.y + F.h - 4, Math.min(F.h - 8, 54));
  },
  croupier(c, x, base, h) {   // one-ink human pictogram (D4 rule 10): visor, bow tie, rake; his belief in a speech pill
    const I = this.ink(), v = this.v, k = h / 54, sp = v.spinT >= 0 ? Det.sin(v.spinT * 12) * 0.5 : 0;
    c.save(); c.translate(x, base); c.scale(k, k);
    c.fillStyle = DC_LOOK.cream; rrect(c, -30, -56, 60, 56, 8); c.fill(); c.lineWidth = 3; c.strokeStyle = DC_LOOK.brass; c.stroke(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke();
    c.fillStyle = I; c.beginPath(); c.arc(0, -38, 8, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-11, -44); c.lineTo(11, -44); c.lineTo(7, -49); c.lineTo(-7, -49); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(-14, -2); c.quadraticCurveTo(-14, -26, 0, -27); c.quadraticCurveTo(14, -26, 14, -2); c.closePath(); c.fill();
    c.fillStyle = DC_LOOK.cream; c.beginPath(); c.moveTo(-5, -25); c.lineTo(0, -22); c.lineTo(5, -25); c.lineTo(5, -19); c.lineTo(0, -22); c.lineTo(-5, -19); c.closePath(); c.fill();
    c.save(); c.translate(12, -16); c.rotate(-0.6 + sp); c.strokeStyle = I; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(16, -6); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(16, -12); c.lineTo(16, 0); c.stroke(); c.restore();
    c.restore();
    if (v.talk && v.talk.text) { const b = v.talk.t < 0.3 ? 1 + 0.15 * Det.sin(v.talk.t / 0.3 * Math.PI) : 1; this.lbl('talk', v.talk.text, x - 36 * k, base - h * 0.55, { size: Math.round(13 * b), align: 'right', bg: '#FFF7E0' }); }
  },
  drawFlights(c, G) {
    const v = this.v, s = this.sim.s;
    for (const f of v.fl) {
      if (f.t < f.d) continue; const p = Math.min(1, (f.t - f.d) / f.ms), e = p < 0.5 ? 4 * p * p * p : 1 - (2 - 2 * p) * (2 - 2 * p) * (2 - 2 * p) / 2;
      const calm = typeof Fx !== 'undefined' && Fx.calm, x = f.x0 + (f.x1 - f.x0) * e, y = f.y0 + (f.y1 - f.y0) * e - (calm ? 0 : Det.sin(e * Math.PI) * 40);
      if (f.kind === 'chip') this.chip(c, x, y, f.r);
      else if (f.kind === 'jar') { const sc = 1 - e * (1 - (f.isz || 12) / f.h0), J = s.jars[f.j]; if (J) this.drawJar(c, { x: x - f.w0 * sc / 2, y: y - f.h0 * sc / 2, w: f.w0 * sc, h: f.h0 * sc }, J, f.j, { fly: true, cork: J.fix >= 0 }); }
      else if (f.kind === 'islet') this.icon(c, x, y, 'islets', 0, f.isz);
      else if (f.kind === 'vial') { const B = s.bot[f.j]; if (B) this.vial(c, x - 3, y - 5, 6, 10, B.k / 32); }
    }
  },
  drawBanner(c, G) {
    const b = this.v.banner; if (!b) return; const a = Math.min(1, b.t / 200, (b.ms - b.t) / 250); if (a <= 0) return;
    c.save(); c.globalAlpha = a; this.lbl('banner', b.text, G.W / 2, G.top + G.A * 0.42, { size: 22, weight: 700 }); c.restore();
  },
  /* ---------- L3: Buri's 107 bottles, the pinned bottle's flies, the generation-19 histogram ---------- */
  trayGrid(G) { const T = G.tray, n = DC_BURI.bottles, cols = Math.max(6, Math.round(Math.sqrt(n * T.w / (T.h - 18)))), rows = Math.ceil(n / cols), p = Math.min(T.w / cols, (T.h - 18) / rows); return { cols, rows, p, ox: T.x + (T.w - cols * p) / 2, oy: T.y + 16 + (T.h - 18 - rows * p) / 2 }; },
  vialRect(G, j) { const g = this.trayGrid(G), c = j % g.cols, r = Math.floor(j / g.cols), w = g.p * 0.56, h = g.p * 0.86; return { x: g.ox + c * g.p + (g.p - w) / 2, y: g.oy + r * g.p + (g.p - h) / 2, w, h }; },
  vial(c, x, y, w, h, f) {   // a fly bottle drawn as its gene pool: blue bw75 copies below, amber bw above
    const I = this.ink(); c.save(); rrect(c, x, y, w, h, Math.min(3, w / 3)); c.fillStyle = this.inka(); c.fill();
    const fh = h * f; if (fh > 0) { c.save(); rrect(c, x, y, w, h, Math.min(3, w / 3)); c.clip(); c.fillStyle = this.inkA(); c.fillRect(x, y + h - fh, w, fh); c.restore(); }
    rrect(c, x, y, w, h, Math.min(3, w / 3)); c.lineWidth = 1; c.strokeStyle = I; c.stroke(); c.restore();
  },
  drawTray(c, G) {
    const s = this.sim.s, v = this.v, T = G.tray, L = this.content.labels;
    c.save(); rrect(c, T.x, T.y, T.w, T.h, 10); c.fillStyle = DC_LOOK.parch; c.fill(); c.lineWidth = 2.5; c.strokeStyle = DC_LOOK.brass; c.stroke(); c.restore();
    s.bot.forEach((B, j) => {
      const R0 = this.vialRect(G, j);
      if (v.gone[j]) { c.save(); c.setLineDash([2, 2]); c.strokeStyle = 'rgba(27,22,18,0.3)'; c.strokeRect(R0.x, R0.y, R0.w, R0.h); c.restore(); return; }
      if (s.pin === j) { c.save(); c.lineWidth = 4; c.strokeStyle = this.ink(); c.strokeRect(R0.x - 3, R0.y - 3, R0.w + 6, R0.h + 6); c.lineWidth = 2; c.strokeStyle = this.paper(); c.strokeRect(R0.x - 3, R0.y - 3, R0.w + 6, R0.h + 6); c.restore(); }
      this.vial(c, R0.x, R0.y + (v.pulse * ((j * 7) % 3 === 0 ? 1 : 0)), R0.w, R0.h, B.k / 32);
    });
    this.lbl('gen', Txt.f(L.gen, { n: s.gen, m: s.T }), T.x + 6, T.y + 2, { size: 12, align: 'left', base: 'top', mono: true });
    this.lbl('bw', L.bw75, T.x + T.w - 6, T.y + 2, { size: 12, align: 'right', base: 'top', bg: '#C9D6F5' });
  },
  drawHero(c, G) {
    const s = this.sim.s, v = this.v, R0 = G.hero, B = s.bot[s.pin] || s.bot[0], I = this.ink();
    const bx = R0.x + 6, by = R0.y + 18, bw = R0.w - 12, bh = R0.h - 40;
    c.save(); rrect(c, bx, by, bw, bh, 18); c.fillStyle = 'rgba(234,240,236,0.93)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.fillStyle = '#B9A27A'; c.fillRect(bx + 3, by + bh - 14, bw - 6, 11); rrect(c, bx + bw * 0.3, by - 10, bw * 0.4, 12, 4); c.fillStyle = '#E9E2CF'; c.fill(); c.stroke(); c.restore();
    const fl = B.b.m.concat(B.b.f), sz = Math.max(12, Math.min(26, Math.min(bw, bh - 14) / 5.2)), kids = this.broods(s.pin * 131 + s.gen, s.mode || 'w');
    fl.forEach((g, i) => {   // a jittered 4 × 4 grid, so the 16 flies can be counted and their eyes read
      const h1 = ((i * 2654435761) >>> 0) / 4294967296, h2 = (((i + 5) * 40503 * 2246822519) >>> 0) / 4294967296;
      const fx = ((i % 4) + 0.2 + 0.6 * h1) / 4 + 0.015 * Det.sin(v.t * (0.7 + h2) + i), fy = (Math.floor(i / 4) + 0.2 + 0.6 * h2) / 4 + 0.015 * Det.cos(v.t * (0.6 + h1) + 2 * i);
      const x = bx + sz * 0.5 + (bw - sz) * fx, y = by + sz * 0.5 + (bh - 14 - sz) * fy;
      if (typeof Rig !== 'undefined' && Rig.has('fruitfly')) Rig.draw(c, 'fruitfly', { eye: g[0] + g[1], sex: i < 8 ? 'm' : 'f' }, x, y, { size: i < 8 ? sz * 0.86 : sz, rot: Det.sin(i * 1.7 + v.t * 0.3) * 0.5, id: i });
      const k = Math.min(6, kids[i]), d = Math.max(2, sz * 0.09);   // dots: this fly's young last generation (families vary more than chance)
      for (let q = 0; q < k; q++) { c.beginPath(); c.arc(x - (k - 1) * d * 1.3 + q * d * 2.6, y + sz * 0.62, d, 0, TAU); c.fillStyle = this.paper(); c.fill(); c.lineWidth = 1; c.strokeStyle = I; c.stroke(); }
    });
    this.lbl('pin', s.phase === 'bet' ? this.content.labels.young : this.content.labels.you, R0.x + R0.w / 2, R0.y + R0.h - 10, { size: 12 });
    this.lbl('pinp', Math.round(100 * B.k / 32) + '% bw75', R0.x + R0.w / 2, R0.y + 6, { size: 12, mono: true });
  },
  broods(seed, mode) {   // cosmetic: one generation of young per fly under the model's fertility weights (a local generator, never R())
    let u = (seed * 2654435761 + 12345) >>> 0; const rnd = () => { u = (u * 1664525 + 1013904223) >>> 0; return u / 4294967296; };
    const W = DC.W(mode), w = []; for (let i = 0; i < 16; i++) w.push(W ? W[Math.floor(rnd() * W.length)] : 1);
    const out = new Array(16).fill(0);
    if (!W) { for (let i = 0; i < 16; i++) out[i] = 2; return out; }
    for (let kid = 0; kid < 16; kid++) for (const off of [0, 8]) { let tot = 0; for (let i = 0; i < 8; i++) tot += w[off + i]; let x = rnd() * tot, i = 0; while (i < 7 && x >= w[off + i]) { x -= w[off + i]; i++; } out[off + i]++; }
    return out;
  },
  drawHist(c, G) {   // the U builds from the bottles themselves: each lands in the column of its bw75 count (0–32)
    const s = this.sim.s, v = this.v, H = this.histGeo(G), I = this.ink(), bh = Math.min(6, H.h / 22), P = DC.chain(32, 16, DC_BURI.T)[DC_BURI.T];
    for (let k = 0; k <= 32; k++) {
      const n = (v.col && v.col[k]) || 0, x = H.x0 + k * H.cw;
      for (let i = 0; i < n; i++) { const y = H.y1 - (i + 1) * bh; c.fillStyle = k === 0 ? this.inka() : k === 32 ? this.inkA() : '#E8DFC9'; c.fillRect(x + 0.5, Math.max(H.y0, y), H.cw - 1, bh - 1); }
    }
    c.save(); c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(232,223,201,0.9)'; c.beginPath();
    for (let k = 0; k <= 32; k++) { const y = H.y1 - P[k] * DC_BURI.bottles * bh, x = H.x0 + k * H.cw; if (k) c.lineTo(x, y); else c.moveTo(x, y); c.lineTo(x + H.cw, y); }
    c.stroke(); c.restore();
    c.strokeStyle = 'rgba(232,223,201,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(H.x0, H.y1 + 0.5); c.lineTo(H.x0 + H.w, H.y1 + 0.5); c.stroke();
    this.lbl('sixteen', this.content.labels.sixteen, H.x0 + H.w / 2, H.y0 + 2, { size: 12, base: 'top' });
    const Bs = G.bins; if (!Bs || Bs.length < 3) return;   // brackets: lost = column 0, still mixed = 1–31, fixed = 32
    const ranges = [[0, 1], [1, 32], [32, 33]]; c.strokeStyle = 'rgba(232,223,201,0.45)'; c.lineWidth = 1;
    ranges.forEach(([a, b], i) => { const B = Bs[i], xa = H.x0 + a * H.cw, xb = H.x0 + b * H.cw; c.beginPath(); c.moveTo(xa + 1, H.y1 + 4); c.lineTo(xa + 1, H.y1 + 8); c.lineTo(xb - 1, H.y1 + 8); c.lineTo(xb - 1, H.y1 + 4); c.moveTo((xa + xb) / 2, H.y1 + 8); c.lineTo(B.x + B.w / 2, B.y - 2); c.stroke(); });
  },
  /* the Ne side tables: a cage of flies, a hundred replicate cages drifting, and the Ne ruler */
  rulerGeo(G) { const y = G.foot.y - 46, x0 = 26, x1 = G.W - 26; return { x0, x1, y, X: v => x0 + (x1 - x0) * Math.max(0, Math.min(48, v)) / 48 }; },
  drawSide(c, G) {
    const s = this.sim.s, v = this.v, D = DC_SIDES[s.side], sd = s.sd, L = this.content.labels, I = this.ink(), top = G.top + 6, bot = G.foot.y - 92;
    const cw = G.W * 0.42, cage = { x: 10, y: top, w: cw - 16, h: bot - top }, vr = { x: cw, y: top, w: G.W - cw - 10, h: bot - top };
    c.save(); rrect(c, 4, top - 4, G.W - 8, G.foot.y - top - 2, 12); c.fillStyle = DC_LOOK.parch; c.fill(); c.lineWidth = 3; c.strokeStyle = DC_LOOK.brass; c.stroke(); c.restore();   // the ledger the side tables are drawn on
    c.save(); rrect(c, cage.x, cage.y, cage.w, cage.h, 10); c.fillStyle = 'rgba(206,224,230,0.45)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.strokeStyle = 'rgba(27,22,18,0.12)'; c.lineWidth = 1; c.beginPath(); for (let x = cage.x + 10; x < cage.x + cage.w; x += 10) { c.moveTo(x, cage.y + 2); c.lineTo(x, cage.y + cage.h - 2); } c.stroke(); c.restore();
    let flies = [];
    if (D.kind === 'sex') { for (let i = 0; i < 40; i++) flies.push(i < 36 ? 'f' : 'm'); }
    else if (D.kind === 'cycle') { const n = sd && sd.gen > 0 ? D.sizes[(sd.gen - 1) % 5] : 50; for (let i = 0; i < n; i++) flies.push(i % 2 ? 'm' : 'f'); }
    else for (let i = 0; i < 16; i++) flies.push(i < 8 ? 'f' : 'm');
    const cols = Math.max(4, Math.round(Math.sqrt(flies.length * cage.w / cage.h))), rows = Math.ceil(flies.length / cols), p = Math.min(cage.w / cols, (cage.h - 30) / rows), sz = Math.max(12, Math.min(26, p * 0.9));
    flies.forEach((sx, i) => { const x = cage.x + (cage.w - cols * p) / 2 + (i % cols + 0.5) * p + Det.sin(v.t * 1.3 + i) * 1.5, y = cage.y + 26 + (Math.floor(i / cols) + 0.5) * p; if (typeof Rig !== 'undefined' && Rig.has('fruitfly')) Rig.draw(c, 'fruitfly', { eye: 1, sex: sx }, x, y, { size: sx === 'm' ? sz * 0.85 : sz, rot: Det.sin(i * 2.1) * 0.8, id: i }); });
    if (D.kind === 'sex') { this.lbl('cf', Txt.f(L.females, { n: 36 }), cage.x + cage.w / 2 - 4, cage.y + 12, { size: 12, align: 'right' }); this.lbl('cm', Txt.f(L.males, { n: 4 }), cage.x + cage.w / 2 + 4, cage.y + 12, { size: 12, align: 'left' }); }
    else this.lbl('cn', flies.length + ' flies', cage.x + cage.w / 2, cage.y + 12, { size: 12 });
    this.lbl('cue', L[D.cue], cage.x + cage.w / 2, cage.y + cage.h - 12, { size: 12, bg: '#FFF7E0' });   // what is different about this cage
    const pops = sd && sd.pops ? sd.pops.slice(0, DC_SIDE.show) : [], vc = 8, vrw = vr.w / vc, vrh = Math.min(vr.h / 5, vrw * 1.6);
    for (let i = 0; i < DC_SIDE.show; i++) {
      const P0 = pops[i]; let f = 0.5; if (P0) { if (D.kind === 'cycle') f = P0.k / P0.n; else { let k = 0; for (const g of P0) k += g[0] + g[1]; f = k / (2 * P0.length); } }
      this.vial(c, vr.x + (i % vc) * vrw + vrw * 0.25, vr.y + 6 + Math.floor(i / vc) * vrh, vrw * 0.5, vrh * 0.8, f);
    }
    const R1 = this.rulerGeo(G), done = s.sides[s.side];
    if (done) this.lbl('fx', L[D.fx], vr.x + vr.w / 2, vr.y + vr.h - 4, { size: 12, mono: true, base: 'bottom', bg: '#FFF7E0' });   // once the cages are done, the rule the stars read takes the generation's place
    else this.lbl('sg', Txt.f(L.gen, { n: sd ? sd.gen : 0, m: DC_SIDE.T }), vr.x + vr.w / 2, vr.y + vr.h - 4, { size: 12, mono: true, base: 'bottom' });
    c.save(); c.strokeStyle = I; c.lineWidth = 2; c.beginPath(); c.moveTo(R1.x0, R1.y); c.lineTo(R1.x1, R1.y); c.stroke();
    for (let t = 0; t <= 48; t += 8) { const x = R1.X(t); c.beginPath(); c.moveTo(x, R1.y - 5); c.lineTo(x, R1.y + 5); c.lineWidth = 1.5; c.stroke(); this.lbl('rt' + t, String(t), x, R1.y + 16, { size: 12, mono: true, pill: false, ink: I }); }
    if (done) { const a = R1.X(D.Ne * 0.8), b = R1.X(D.Ne * 1.2); c.fillStyle = 'rgba(27,22,18,0.15)'; c.fillRect(a, R1.y - 12, b - a, 24); c.setLineDash([4, 3]); c.beginPath(); c.moveTo(R1.X(D.Ne), R1.y - 16); c.lineTo(R1.X(D.Ne), R1.y + 16); c.stroke(); c.setLineDash([]); c.lineWidth = 3; c.beginPath(); c.moveTo(R1.X(done.fit), R1.y - 12); c.lineTo(R1.X(done.fit), R1.y + 12); c.stroke(); }
    const you = s.pred[D.id]; if (you != null) { const x = R1.X(you); c.fillStyle = this.paper(); c.beginPath(); c.moveTo(x, R1.y - 9); c.lineTo(x + 7, R1.y); c.lineTo(x, R1.y + 9); c.lineTo(x - 7, R1.y); c.closePath(); c.fill(); c.lineWidth = 2; c.strokeStyle = I; c.stroke(); this.lbl('ry', Txt.f(L.yourNe, { n: Math.round(you) }), x, R1.y - 22, { size: 12 }); }
    if (done) this.lbl('rf', Txt.f(L.fit, { n: Math.round(done.fit), e: Math.max(1, Math.round(done.se || 0)) }), R1.X(done.fit), R1.y + 34, { size: 12 });
    c.restore();
    this.lbl('rl', L.ruler, R1.x1, R1.y + 34, { size: 12, align: 'right' });
  },
  /* ---------- L4: the castaways: islets at sea, the mainland swarm, the storm ---------- */
  drawSea(c, G) {
    const s = this.sim.s, v = this.v, S = G.sea, I = this.ink(), sea = DC_LOOK.sea;
    c.fillStyle = sea; c.fillRect(S.x, S.y, S.w, S.h);
    c.strokeStyle = 'rgba(232,223,201,0.18)'; c.lineWidth = 1.5; c.beginPath(); for (let y = S.y + 16; y < S.y + S.h; y += 22) for (let x = (y * 7) % 40; x < S.w; x += 60) { c.moveTo(x, y); c.quadraticCurveTo(x + 8, y - 4 + 2 * Det.sin(v.t + x), x + 16, y); } c.stroke();
    G.isl.forEach((R0, i) => {
      this.islet(c, R0, i);
      const I0 = s.isl && s.isl[i]; if (!I0) return;
      const ta = DC_T.storm + DC_T.land * i - 0.08, here = I0.landed || (v.stormT >= ta && s.phase === 'run') || s.phase === 'settle' || s.phase === 'over';
      if (!here) return;
      const n = I0.g.length, cols = Math.min(n, Math.max(2, Math.ceil(n / 2))), r = Math.max(4, Math.min(7, R0.w / (2.6 * cols)));
      I0.g.forEach((g, f) => { const x = R0.x + R0.w / 2 + ((f % cols) - (cols - 1) / 2) * r * 2.3, y = R0.y + R0.h / 2 + (n > cols ? (Math.floor(f / cols) - 0.5) * r * 2.2 : 0); if (typeof Pal !== 'undefined') Pal.genotype(c, x, y, r, g[0], g[1], { letter: '' }); });
      this.lbl('is' + i, Math.round(100 * I0.share) + '%', R0.x + R0.w / 2, R0.y + R0.h + 9, { size: 12, mono: true });
    });
    if (v.stormT >= 0 && s.phase === 'run' && s.isl) {   // founders in flight: one token per founder, mainland to islet
      const from = [G.W / 2, G.land.y + G.land.h * 0.45];
      s.isl.forEach((I0, i) => {
        const td = 0.15 + 0.04 * i, ta = DC_T.storm + DC_T.land * i - 0.08; if (v.stormT < td || v.stormT >= ta) return;
        const p = (v.stormT - td) / (ta - td), R0 = G.isl[i], x = from[0] + (R0.x + R0.w / 2 - from[0]) * p, y = from[1] + (R0.y + R0.h / 2 - from[1]) * p - Det.sin(p * Math.PI) * 30;
        I0.g.forEach((g, f) => { if (typeof Pal !== 'undefined') Pal.genotype(c, x + (f % 4) * 7 - 10, y + Math.floor(f / 4) * 7, 4, g[0], g[1], { letter: '' }); });
      });
    }
  },
  islet(c, R0, i) {   // a sandy islet with a tuft of scrub (natural paint), seeded by its index so it never flickers
    const I = this.ink(), K = DC_LOOK, cx = R0.x + R0.w / 2, cy = R0.y + R0.h / 2, h1 = ((i * 2654435761) >>> 0) / 4294967296;
    c.save(); c.beginPath(); c.ellipse(cx, cy, R0.w / 2 + 3, R0.h / 2 + 3, 0, 0, TAU); c.fillStyle = 'rgba(241,230,200,0.18)'; c.fill();   // surf
    c.beginPath(); c.ellipse(cx, cy, R0.w / 2, R0.h / 2, 0, 0, TAU); c.fillStyle = K.sand; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.fillStyle = K.scrub; c.beginPath(); c.ellipse(cx + (h1 - 0.5) * R0.w * 0.5, cy - R0.h * 0.18, R0.w * 0.16, R0.h * 0.2, 0, 0, TAU); c.ellipse(cx + (h1 - 0.5) * R0.w * 0.5 + R0.w * 0.1, cy - R0.h * 0.1, R0.w * 0.1, R0.h * 0.16, 0, 0, TAU); c.fill();
    c.restore();
  },
  // a brown anole seen from above, head to +x (natural paint, D4 §1.2): s = nose-to-tail length in px; o.male: bigger and plain,
  // a female carries the dorsal diamonds (as in brown anoles); o.dark 0..1 shades it
  lizard(c, x, y, s, rot, o) {
    o = o || {}; const I = this.ink(), K = DC_LOOK, k = s / 46, body = o.dark ? (o.dark > 0.5 ? K.lizD : K.lizM) : K.liz;
    c.save(); c.translate(x, y); c.rotate(rot || 0); c.scale(k, k); c.lineJoin = 'round'; c.lineCap = 'round';
    for (const [lx, sy, fx] of [[7, 1, 1], [7, -1, 1], [-6, 1, -1], [-6, -1, -1]]) {   // legs: ink under paint, elbows out, toes forward or back
      const pts = [lx, 0, lx + fx * 1.5, sy * 6.5, lx + fx * 5, sy * 8];
      for (const [col, lw] of [[I, 4], [body, 2.2]]) { c.strokeStyle = col; c.lineWidth = lw; c.beginPath(); c.moveTo(pts[0], pts[1]); c.lineTo(pts[2], pts[3]); c.lineTo(pts[4], pts[5]); c.stroke(); }
    }
    c.beginPath(); c.moveTo(-7, -2.4); c.quadraticCurveTo(-18, -3.2, -27, 1.5); c.quadraticCurveTo(-18, 1.6, -7, 2.4); c.closePath();   // tail
    c.fillStyle = body; c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke();
    c.beginPath(); c.ellipse(2, 0, 10.5, 4.2, 0, 0, TAU); c.fill(); c.stroke();   // body
    c.beginPath(); c.moveTo(11, -3); c.quadraticCurveTo(19, -3.2, 21, 0); c.quadraticCurveTo(19, 3.2, 11, 3); c.closePath(); c.fill(); c.stroke();   // head
    c.fillStyle = I; c.beginPath(); c.arc(15.5, -2.1, 0.8, 0, TAU); c.arc(15.5, 2.1, 0.8, 0, TAU); c.fill();
    if (!o.male) { c.fillStyle = 'rgba(241,230,200,0.55)'; for (const dx of [-4, 1, 6]) { c.beginPath(); c.moveTo(dx - 2, 0); c.lineTo(dx, -1.6); c.lineTo(dx + 2, 0); c.lineTo(dx, 1.6); c.closePath(); c.fill(); } }
    c.restore();
  },
  drawLand(c, G) {
    const s = this.sim.s, v = this.v, Lr = G.land, I = this.ink(), sand = DC_LOOK.sand, L = this.content.labels;
    c.fillStyle = sand; c.beginPath(); c.moveTo(0, Lr.y + 8); for (let x = 0; x <= G.W; x += 20) c.lineTo(x, Lr.y + 6 + 4 * Det.sin(x * 0.05 + v.t * 0.8)); c.lineTo(G.W, Lr.y + Lr.h); c.lineTo(0, Lr.y + Lr.h); c.closePath(); c.fill();
    c.fillStyle = DC_LOOK.scrub; for (let i = 0; i < 9; i++) { const h1 = ((i * 2246822519) >>> 0) / 4294967296; c.beginPath(); c.ellipse(G.W * (i + 0.5) / 9 + (h1 - 0.5) * 30, Lr.y + Lr.h - 8 - h1 * 10, 18 + h1 * 14, 7 + h1 * 4, 0, 0, TAU); c.fill(); }   // scrub along the back of the beach
    const sz = Math.max(18, Math.min(30, 0.06 * G.u)), n = 28;
    for (let i = 0; i < n; i++) { const h1 = ((i * 2654435761) >>> 0) / 4294967296, h2 = (((i + 3) * 40503 * 2246822519) >>> 0) / 4294967296; this.lizard(c, 14 + (G.W - 28) * h1, Lr.y + 22 + (Lr.h - 34) * h2 + Det.sin(v.t * 1.3 + i) * 0.6, sz * 1.5, (h1 - 0.5) * 2 + (i % 2 ? Math.PI : 0), { male: i % 3 === 0, dark: h2 > 0.6 ? 0.3 : 0 }); }
    this.lbl('main', L.mainland, 12, Lr.y + 16, { size: 12, align: 'left' });
    this.lbl('main2', Txt.f(L.amber, { n: 50 }), G.W - 12, Lr.y + 16, { size: 12, align: 'right', bg: '#F5E2A0' });
    if (s.phase === 'bet' || (s.phase === 'run' && v.stormT < DC_T.storm)) {   // the storm cloud: its size is the number rafted
      const rise = s.phase === 'run' ? Math.min(1, v.stormT / DC_T.storm) : 0, cx = G.W / 2, cy = Lr.y + Lr.h * 0.42 - rise * (Lr.h * 0.7), rc = 10 + 5 * Math.sqrt(s.n || 5) + (v.hold ? 2 * Det.sin(v.t * 20) : 0);
      c.save(); c.globalAlpha = 0.85 * (1 - rise * 0.6); c.fillStyle = '#7D8389';
      for (const [dx, dy, r] of [[-1, 0, 0.8], [0, -0.4, 1], [1, 0, 0.85], [-0.5, 0.3, 0.7], [0.55, 0.32, 0.7]]) { c.beginPath(); c.arc(cx + dx * rc, cy + dy * rc, r * rc, 0, TAU); c.fill(); }
      c.restore();
      this.lbl('storm', Txt.f(L.storm, { n: s.n || 5 }), cx, cy + rc + 12, { size: 13, mono: true });
    }
  },
  /* ---------- the boss: the island and its volcano, the richness row, the survivors, then the zoo ---------- */
  volcanoAt() { const G = this.geo(), Is = G.isle; return [Is.x + Is.w * 0.5, Is.y + Is.h * 0.22]; },
  letterAt(a) { const G = this.geo(), Rw = G.row, r = Math.min(14, Rw.w / 30), gap = (Rw.w - 24 * r) / 13; return [Rw.x + gap + r + a * (2 * r + gap), Rw.y + Rw.h / 2]; },
  present() {
    const s = this.sim.s, v = this.v, out = [];
    if (s.zoo && s.phase !== 'crash') { const n = DC.zooCount(s.zoo.pop); for (let a = 0; a < 12; a++) out.push(n[a] > 0); }
    else for (let a = 0; a < 12; a++) out.push(!v.lost[a]);
    return out;
  },
  drawBoss(c, G) {
    const s = this.sim.s, zoo = !!s.zoo && s.phase !== 'crash';
    if (zoo) this.drawZoo(c, G); else this.drawIsland(c, G);
    this.drawRow(c, G);
  },
  drawRow(c, G) {   // the richness row: 12 lettered chips, solid while the allele is present, hollow once lost (D4 rule 7)
    const Rw = G.row, I = this.ink(), pr = this.present(), r = Math.min(14, Rw.w / 30);
    c.save(); rrect(c, Rw.x, Rw.y, Rw.w, Rw.h, 10); c.fillStyle = 'rgba(232,223,201,0.92)'; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,0.35)'; c.stroke(); c.restore();
    for (let a = 0; a < 12; a++) {
      const [x, y] = this.letterAt(a);
      if (pr[a] && typeof Pal !== 'undefined') Pal.token(c, x, y, Math.max(10, r), a, { multi: true });
      else { c.save(); c.globalAlpha = 0.25; if (typeof Pal !== 'undefined') Pal.token(c, x, y, Math.max(10, r), a, { multi: true }); c.restore(); c.save(); c.setLineDash([3, 3]); c.lineWidth = 1.5; c.strokeStyle = I; c.beginPath(); c.arc(x, y, Math.max(10, r) + 2, 0, TAU); c.stroke(); c.restore(); }
    }
  },
  hGauge(c, G, x, y, w, frac) {
    const I = this.ink(), L = this.content.labels; c.save(); rrect(c, x, y, w, 12, 6); c.fillStyle = 'rgba(232,223,201,0.9)'; c.fill(); c.lineWidth = 1; c.strokeStyle = I; c.stroke();
    rrect(c, x, y, Math.max(6, w * Math.max(0, Math.min(1, frac))), 12, 6); c.fillStyle = typeof Pal !== 'undefined' ? Pal.drift : '#CF81A2'; c.fill(); c.stroke(); c.restore();
    this.lbl('hg', L.het, x - 6, y + 6, { size: 12, align: 'right' }); this.lbl('hgv', Math.round(100 * frac) + '%', x + w + 6, y + 6, { size: 12, align: 'left', mono: true });
  },
  drawIsland(c, G) {
    const s = this.sim.s, v = this.v, Is = G.isle, I = this.ink(), sea = DC_LOOK.sea, sand = DC_LOOK.sand;
    c.fillStyle = sea; c.fillRect(0, Is.y - 4, G.W, Is.h + 8);
    c.strokeStyle = 'rgba(241,230,200,0.14)'; c.lineWidth = 1.5; c.beginPath(); for (let y = Is.y + 10; y < Is.y + Is.h; y += 24) for (let x = (y * 7) % 40; x < G.W; x += 64) { c.moveTo(x, y); c.quadraticCurveTo(x + 8, y - 4 + 2 * Det.sin(v.t + x), x + 16, y); } c.stroke();
    c.save(); rrect(c, Is.x + 6, Is.y + 6, Is.w - 12, Is.h - 12, 40); c.fillStyle = sand; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.clip(); c.fillStyle = DC_LOOK.scrub; [[0.07, 0.1], [0.2, 0.2], [0.79, 0.12], [0.93, 0.24], [0.06, 0.42], [0.95, 0.5], [0.12, 0.95], [0.9, 0.94]].forEach(([fx, fy], i) => { const h1 = ((i * 2246822519) >>> 0) / 4294967296; c.beginPath(); c.ellipse(Is.x + Is.w * fx, Is.y + Is.h * fy, 20 + 16 * h1, 9 + 5 * h1, 0, 0, TAU); c.fill(); });   // scrub round the shore, clear of the cone
    c.restore();
    const [vx, vy] = this.volcanoAt(), bw = Math.min(Is.w * 0.46, 260), bh = Is.h * 0.24, er = v.erT;
    c.save(); c.beginPath(); c.moveTo(vx - bw / 2, vy + bh); c.lineTo(vx - bw * 0.12, vy - bh * 0.15); c.lineTo(vx + bw * 0.12, vy - bh * 0.15); c.lineTo(vx + bw / 2, vy + bh); c.closePath(); c.fillStyle = '#6F625A'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.beginPath(); c.ellipse(vx, vy - bh * 0.15, bw * 0.12, bh * 0.08, 0, 0, TAU); c.fillStyle = '#3C3530'; c.fill(); c.stroke();
    if (er >= 0) {   // lava down the flanks, ash rising (natural paint: ochre, never the selection ink)
      const f = Math.min(1, er / 1.0); c.strokeStyle = '#CF9A33'; c.lineWidth = 5; c.lineCap = 'round';
      for (const sd of [-1, -0.35, 0.4, 1]) { c.beginPath(); c.moveTo(vx + sd * bw * 0.08, vy - bh * 0.1); c.quadraticCurveTo(vx + sd * bw * 0.25, vy + bh * 0.5 * f, vx + sd * bw * 0.42 * f, vy + bh * (0.2 + 1.6 * f)); c.stroke(); }
      c.fillStyle = 'rgba(80,72,66,0.55)'; for (let i = 0; i < 6; i++) { const t = (er * 0.6 + i / 6) % 1; c.beginPath(); c.arc(vx + Det.sin(i * 2.3) * 20 * t, vy - bh * 0.2 - t * 70, 8 + 14 * t, 0, TAU); c.fill(); }
    }
    c.restore();
    const crowdA = er < 0 ? 1 : Math.max(0, 1 - er / 1.0); if (crowdA > 0) { c.save(); c.globalAlpha = crowdA; this.crowd(c, G); c.restore(); }
    const showSurv = s.crash && (er < 0 || er > 1.1);
    if (showSurv) {
      const n = s.crash.surv.length, sz = Math.max(36, Math.min(60, 0.12 * G.u)), y = Is.y + Is.h * 0.68;
      s.crash.surv.forEach((g, i) => { const x = Is.x + Is.w * (i + 1) / (n + 1); this.lizard(c, x, y - sz * 0.1, sz * 1.5, -Math.PI / 2 + 0.25 * Det.sin(v.t * 0.8 + i), { male: i % 2 === 0 }); if (typeof Pal !== 'undefined') Pal.genotype(c, x, y + sz * 0.75, 13, g[0], g[1], { multi: true }); });
    }
    const hk = s.crash ? s.crash.H / s.H0 : 1, frac = er < 0 ? hk : 1 - (1 - hk) * Math.max(0, Math.min(1, (er - 1.2) / 0.8));
    this.hGauge(c, G, Is.x + Is.w - 120, Is.y + 22, 80, frac);
  },
  crowd(c, G) {   // 240 anoles in natural paint, baked once into a cached layer (D4 §1.4)
    const Is = G.isle, key = G.W + 'x' + G.H, v = this.v;
    const paint = (cc) => { for (let i = 0; i < 240; i++) { const h1 = ((i * 2654435761) >>> 0) / 4294967296, h2 = (((i + 11) * 40503 * 2246822519) >>> 0) / 4294967296, x = Is.x + 30 + (Is.w - 60) * h1, y = Is.y + Is.h * 0.5 + (Is.h * 0.42) * h2; this.lizard(cc, x, y, i % 3 ? 14 : 17, (h1 - 0.5) * 6, { male: i % 3 === 0, dark: h2 > 0.55 ? 0.3 : 0 }); } };
    if (typeof Layer === 'undefined') { paint(c); return; }
    if (!v.crowd || v.crowd.key !== key) v.crowd = { key, L: Layer(G.W, G.H).redraw(cc => paint(cc)) };
    v.crowd.L.blit(c, 0, 0);
  },
  penRect(G, p) { const Is = G.isle, top = Is.y + 30, bot = Is.y + Is.h - 66, gw = (Is.w - 30) / 2, gh = (bot - top - 10) / 2; return { x: Is.x + 10 + (p % 2) * (gw + 10), y: top + Math.floor(p / 2) * (gh + 10), w: gw, h: gh }; },
  drawZoo(c, G) {
    const s = this.sim.s, v = this.v, Z = s.zoo, Is = G.isle, I = this.ink(), L = this.content.labels;
    c.save(); rrect(c, Is.x, Is.y - 2, Is.w, Is.h + 4, 12); c.fillStyle = 'rgba(78,44,29,0.85)'; c.fill(); c.restore();   // the keepers' bench
    let nf = 0; for (const b of Z.pop) if (b.f) nf++;
    const per = Math.ceil(Z.pop.length / 4);
    for (let p = 0; p < 4; p++) {
      const P = this.penRect(G, p); c.save(); rrect(c, P.x, P.y, P.w, P.h, 8); c.fillStyle = DC_LOOK.sand; c.fill(); c.lineWidth = 3; c.strokeStyle = DC_LOOK.brass; c.stroke(); c.lineWidth = 1; c.strokeStyle = 'rgba(0,0,0,0.45)'; c.stroke(); c.restore();
      const cols = Math.max(3, Math.round(Math.sqrt(per * P.w / P.h))), rows = Math.ceil(per / cols), q = Math.min(P.w / cols, P.h / rows), sz = Math.max(10, Math.min(46, q * 1.1)), grow = v.zt < 0.3 && !Z.auto ? 0.6 + 0.4 * v.zt / 0.3 : 1;
      for (let k = 0; k < per; k++) {
        const i = k * 4 + p, b = Z.pop[i]; if (!b) continue;
        const x = P.x + (P.w - cols * q) / 2 + (k % cols + 0.5) * q, y = P.y + (P.h - rows * q) / 2 + (Math.floor(k / cols) + 0.5) * q;
        if (Z.eq && k % 2 === 0 && k + 1 < per && (k % cols) + 1 < cols) { c.strokeStyle = 'rgba(27,22,18,0.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + q, y); c.stroke(); }
        const tagged = sz >= 18 && !Z.auto, bs = tagged ? 0.82 : 1;
        this.lizard(c, x, y - (tagged ? sz * 0.16 : 0), sz * 1.25 * (b.f ? 0.86 : 1) * grow * bs, (((i * 2654435761) >>> 0) / 4294967296 - 0.5) * 0.8 + (k % 2 ? Math.PI : 0), { male: !b.f });   // males bigger and plain, as in brown anoles
        if (tagged && typeof Pal !== 'undefined') Pal.genotype(c, x, y + sz * 0.36, Math.max(6, Math.min(10.5, sz * 0.25)), b.a[0], b.a[1], { multi: true });   // each lizard wears its two letters
      }
    }
    this.lbl('zf', Txt.f(L.females, { n: nf }), Is.x + 12, Is.y + 14, { size: 12, align: 'left' });
    this.lbl('zm', Txt.f(L.males, { n: Z.pop.length - nf }), Is.x + 100, Is.y + 14, { size: 12, align: 'left' });
    this.lbl('zg', Txt.f(L.gen, { n: Z.gen, m: Z.G }), Is.x + Is.w - 12, Is.y + 14, { size: 12, align: 'right', mono: true });
    if (Z.mu > 0) this.lbl('mut', L.mutN, Is.x + Is.w / 2 + 40, Is.y + 14, { size: 12, bg: '#F5E2A0' });   // the What if? rate is unrealistic, and says so
    const by = Is.y + Is.h - 52, n = DC.zooCount(Z.pop);   // row one: the keeper's tokens (spent ones hollow) and the H gauge; row two: the price tags, which are buttons too
    v.tags = [];
    if (!Z.auto) {
      const tot = CH_CASINO_V2.P.budget.v, r = 5, gap = Math.min(13, (Is.w * 0.5) / tot);
      for (let i = 0; i < tot; i++) { const x = Is.x + 16 + i * gap, filled = i < Z.budget; c.beginPath(); c.arc(x, by + 6, r, 0, TAU); if (filled) { c.fillStyle = DC_LOOK.brass; c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; } else { c.lineWidth = 1.2; c.strokeStyle = 'rgba(241,230,200,0.6)'; } c.stroke(); }
      let tx = Is.x + 12; const ty = by + 30, tag = (id, text, ok, a) => { const B0 = this.lbl(id, text, tx, ty, { size: 12, align: 'left', bg: ok ? '#FFF7E0' : '#CFC6B0' }); if (B0) { v.tags.push({ box: B0, a }); tx = B0.x + B0.w + 8; } };
      tag('pb', Txt.f(L.pBal, { n: DC_ZOO.cBal }), !Z.bal && Z.budget >= DC_ZOO.cBal, () => ({ k: 'bal' }));
      tag('pe', L.pEq, Z.eq || Z.budget >= DC_ZOO.cEq, () => ({ k: 'eq', on: !this.sim.s.zoo.eq }));
      tag('pm', Txt.f(L.pMig, { n: DC_ZOO.cMig }), !Z.pend && Z.budget >= DC_ZOO.cMig, () => ({ k: 'mig' }));
    }
    if (v.mig) {   // a migrant flies in from the wild island (migration ink, D4 §2.1)
      const P = this.penRect(G, v.mig.i % 4), t = Math.min(1, v.mig.t / 0.7), x = G.W + 10 + (P.x + P.w / 2 - G.W - 10) * t, y = P.y + P.h / 2 - Det.sin(t * Math.PI) * 30, M = typeof Pal !== 'undefined' ? Pal.mig : '#7CC4F0';
      c.save(); c.strokeStyle = M; c.lineWidth = 4; c.beginPath(); c.moveTo(G.W, P.y + P.h / 2); c.lineTo(x + 14, y); c.stroke(); c.restore();
      this.lizard(c, x, y, 40, Math.PI, { male: true });
    }
    this.hGauge(c, G, Is.x + Is.w - 120, by, 80, DC.het(n) / (11 / 12));
  },

  /* ---------- the live graph (strip) and the level card's debrief ---------- */
  tr(title, x, y, extra) { return Object.assign({ type: 'trace', title, x, y, series: [], ghost: [], frame: 'designed' }, extra || {}); },
  flat(v, n) { const d = []; for (let t = 0; t <= n; t++) d.push(v); return d; },
  meanTr(jars) { const n = jars[0] ? jars[0].tr.length : 0, out = []; for (let t = 0; t < n; t++) { let m = 0; for (const J of jars) m += J.tr[t]; out.push(m / jars.length); } return out; },
  settledTr(fix, upto, n) { const d = []; for (let t = 0; t <= upto; t++) { let k = 0; for (const f of fix) if (f >= 0 && f <= t) k++; d.push(k / n); } return d; },
  expSettled(N, p, T, f, at) { return DC.settledBy(N, p, T, f, at).slice(); },
  rackLabel(N) { const L = this.content.labels, s = this.sim.s; if (s.whatif === 'vol10') return L.vol10; if (s.whatif === 'small') return L.small20; return N === 6 ? L.n6 : N === 20 ? L.n20b : N === 200 ? L.n200 : Txt.f(L.beads, { n: N }); },
  small() { return typeof Strip !== 'undefined' && !!Strip.phone && Strip.phone() && !Strip.isOpen; },   // the folded phone strip (112 px): one chart, short labels
  notes(full) {   // full: the level card's chart (never the folded-strip version)
    const s = this.sim.s, L = this.content.labels, C = this.content.captions, n = this.level, k = this.kind(), charts = [], stats = [], sm = !full && this.small(), EXP = sm ? L.exp : L.expected;
    const purse = this.tr(L.tPurse, { lo: 0, hi: 3, label: L.axTable }, { lo: 0, hi: Math.max(160, Math.ceil((s.purse + 20) / 40) * 40) }, { series: [{ d: [100].concat((s.hist || []).map(h => h.purse)).concat(s.phase === 'settle' || s.phase === 'over' ? [] : [s.purse]), ink: 'ink', label: L.tPurse }] });
    if (k === 'jars') {
      const pin = s.jars[s.pin] || s.jars[0], fan = s.jars.map(J => J.tr), x = { lo: 0, hi: s.T + (n === 0 ? 2 : 0), label: L.axGen };   // L1: room past 30 so the marker clears the legend
      const blue = this.tr(L.tBlue, x, { lo: 0, hi: 1, fmt: 'pct' }, { fan, series: [{ d: this.meanTr(s.jars), ink: 'ink', label: sm ? L.avg : L.average }, { d: pin.tr, ink: 'A', you: true, label: sm ? L.jar : L.yourJar }] });
      if (n === 0 && ((s.hist && s.hist.length) || s.whatif)) blue.ghost = [{ d: this.flat(s.p0, s.T), label: EXP }];
      if (n === 0) charts.push(blue, purse);
      else {   // What if? shows only the thawed rack, labelled by its lever
        const set = this.tr(L.tSettled, x, { lo: 0, hi: 1, fmt: 'pct' }), done = s.whatif ? (s.hist && s.hist[s.ti] ? [s.hist[s.ti]] : []) : (s.hist || []).filter(Boolean);
        done.forEach((h, i) => { set.series.push({ d: this.settledTr(h.fix, s.T, h.fix.length), ink: 'ink', label: this.rackLabel(h.N) }); set.ghost.push({ d: this.expSettled(h.N, h.p, s.T, h.vols / h.fix.length, h.at), label: i === 0 ? EXP : '' }); });
        if (s.phase !== 'settle' && s.phase !== 'over' && (s.whatif ? !done.length : done.length < 3)) set.series.push({ d: this.settledTr(s.jars.map(J => J.fix), s.gen, s.jars.length), ink: 'drift', label: this.rackLabel(s.N) });
        charts.push(set, blue);
      }
      stats.push([L.tPurse, String(s.purse), C.mPurse], [L.tSettled, s.jars.filter(J => J.out >= 0).length + ' of ' + s.jars.length, C.mSettled]);
    } else if (k === 'buri') {
      const H = this.tr(L.tH, { lo: 0, hi: DC_BURI.T + 2, label: L.axGen }, { lo: 0, hi: 0.55 }, { series: [{ d: s.Hs, ink: 'drift', label: sm ? 'H' : 'bottles' }], ghost: [{ d: [...Array(DC_BURI.T + 1)].map((_, t) => DC.ghost16(t)), label: L.sixteen }] });
      if (s.side >= 0 || s.phase === 'settle' || s.phase === 'over') H.ghost.push({ d: DC.buriMC(s.mode || 'w').H, label: EXP });
      const ne = this.tr(L.tNe, { lo: 0, hi: 48, label: 'Ne' }, { lo: 0, hi: 1, fmt: () => '' }, { series: s.sides.filter(Boolean).map((d, i) => ({ d: [[Math.min(48, d.fit), 0.3 + 0.2 * i]], ink: 'drift', label: Txt.f(L.fit, { n: Math.round(d.fit), e: Math.max(1, Math.round(d.se || 0)) }) })) });
      charts.push(H); if (s.side >= 0) charts.push(ne);
      stats.push([L.tH, (s.Hs[s.Hs.length - 1] || 0).toFixed(3), C.mH]); s.sides.forEach((d, i) => { if (d) stats.push([L.tNe + ' ' + (i + 1), Math.round(d.fit) + ' (you ' + (d.you == null ? '–' : Math.round(d.you)) + ')', C.mNe]); });
    } else if (k === 'islets') {
      const pts = (s.hist || []).map(h => [h.n, h.gap]).sort((a, b) => a[0] - b[0]), hi = Math.max(12, ...pts.map(p => p[0]));
      const near = this.tr(L.tNear, { lo: 0, hi, label: L.axFounders }, { lo: 0, hi: 0.5, fmt: 'pct' }, { series: pts.length ? [{ d: pts, ink: 'ink', label: 'islets' }] : [] });
      if (s.hist && s.hist.length) { const g = []; for (let n = 1; n <= hi; n += n < 12 ? 1 : 4) g.push([n, DC.gap(n)]); near.ghost = [{ d: g, label: EXP }]; }
      charts.push(near, purse);
      stats.push([L.tPurse, String(s.purse), C.mPurse], [L.tNear, pts.map(p => p[0] + ': ' + Math.round(100 * p[1]) + ' points').join(', ') || '–', C.mNear]);
    } else {
      const Z = s.zoo;
      if (Z && s.phase !== 'crash') {
        const x = { lo: 0, hi: Math.min(Z.G, 4000), label: L.axGen };
        const kept = this.tr(L.tKept, x, { lo: 0, hi: 12 }, { series: [{ d: Z.kept, ink: 'ink', label: L.letters }] });
        if (Z.Eg) kept.ghost = [{ d: Z.Eg, label: L.yourPlan }];
        charts.push(kept, this.tr(L.tH, x, { lo: 0, hi: 1 }, { series: [{ d: Z.H, ink: 'drift', label: 'H' }] }));
        stats.push([L.tKept, String(Z.kept[Z.kept.length - 1]), C.mKept], [L.tokens.replace(' {n}', ''), String(Z.budget), '']);
      } else {
        const x = { lo: 0, hi: 1.2, label: 'eruption', fmt: v => Math.abs(v) < 1e-6 ? 'before' : Math.abs(v - 1) < 1e-6 ? 'after' : '' }, cr = s.crash && this.v.erT > 1.1 + 0.16 * 12 || (s.crash && this.v.erT < 0);   // x runs past 1 so the marker's halo is not cut at the edge
        charts.push(this.tr(L.tHk, x, { lo: 0, hi: 1, fmt: 'pct' }, { series: cr ? [{ d: [[0, 1], [1, s.crash.H / s.H0]], ink: 'drift', label: 'H' }] : [] }));
        charts.push(this.tr(L.tAl, x, { lo: 0, hi: 12 }, { series: cr ? [{ d: [[0, 12], [1, s.crash.kept]], ink: 'ink', label: L.letters }] : [] }));
        if (cr) stats.push([L.tHk, Math.round(100 * s.crash.H / s.H0) + '%', C.mH], [L.tAl, String(s.crash.kept), C.mKept]);
      }
    }
    if (sm && charts.length > 1) charts.length = 1;   // the folded strip draws the chart the player cares about, big enough to read
    return { stats, charts };
  },
  debrief() {   // the level card's chart: what happened, solid; the expectation, dashed; your call, a diamond
    const s = this.sim.s, L = this.content.labels, n = this.level, k = this.kind(), h = s.hist || [];
    if (k === 'jars' && n === 0 && h.length) {   // What if?: only the thawed table (one fan, one expectation)
      const fan = [], ghost = [], tabs = s.whatif ? [h[s.ti]].filter(Boolean) : h.filter(Boolean);
      tabs.forEach((t, i) => { for (const d of t.tr) fan.push(d); ghost.push({ d: this.flat(t.p, DC_LV[0].T), label: i === 0 ? L.expected : '' }); });
      return this.tr(L.tBlue, { lo: 0, hi: DC_LV[0].T + 2, label: L.axGen }, { lo: 0, hi: 1, fmt: 'pct' }, { fan, ghost, you: s.pred.mean != null && !s.whatif ? { x: 30, y: s.pred.mean, label: L.you } : null });
    }
    const ch = this.notes(true).charts[0]; if (!ch) return null;
    if (s.whatif) return ch;   // a thawed table: your marker belonged to the original run
    if (k === 'jars' && s.pred.half != null) ch.you = { x: s.pred.half, y: 0.5, label: L.you };
    if (k === 'buri') { if (s.pred.h19 != null) ch.you = { x: DC_BURI.T, y: s.pred.h19, label: L.you }; }
    if (k === 'islets' && s.pred.gap != null) ch.you = { x: 5, y: s.pred.gap, label: L.you };
    return ch;
  }
};

/* ---------- the fruit fly (Lab): eye colour shows the bw genotype; males smaller with a dark rounded tip ---------- */
if (typeof Rig !== 'undefined' && !Rig.has('fruitfly')) {
  const { E, L, OL, INK } = Rig._, EYE = ['#F2EEE6', '#EBC39A', '#D98E4A'], TH = '#B58E62', AB = '#C9A574', BAND = '#5A4632';
  Rig.def('fruitfly', {
    tier: 'actor', quant: { '*': 4 },
    row: { scene: 'lab', squint: 'fly from above: folded wings in a V, big eyes', channels: ['eye colour: white, pale orange, orange by bw75 copies (natural paint)', 'sex: smaller male with a dark rounded tip'] },
    paints: EYE.concat([TH, AB, BAND]),
    recipe(ph) {
      const m = ph.sex === 'm', e = EYE[Math.max(0, Math.min(2, ph.eye | 0))], parts = [];
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) parts.push(L([sd * 3, -3 + k * 3, sd * 9, -6 + k * 5, sd * 11, -3 + k * 7], INK, 1));
      parts.push(E(0, 7, m ? 4 : 4.8, m ? 7 : 9, AB, Object.assign({}, OL, { kids: [L([-5, 5, 5, 5], BAND, 1.6), L([-5, 8.5, 5, 8.5], BAND, 1.6), m ? E(0, 12.5, 4, 3.4, BAND) : L([-4, 12, 4, 12], BAND, 1.4)] })));
      parts.push(E(0, -2, 4.5, 4.5, TH, OL));
      for (const sd of [-1, 1]) parts.push(E(sd * 4.2, 5, 3.6, 10, 'rgba(232,223,201,0.55)', { rot: sd * 0.35, stroke: 'rgba(27,22,18,0.6)', lw: 0.8 }));
      parts.push(E(0, -8.5, 4.4, 3.4, TH, OL), E(-3.6, -9, 3, 3.5, e, { stroke: INK, lw: 0.9 }), E(3.6, -9, 3, 3.5, e, { stroke: INK, lw: 0.9 }));
      return { w: 26, h: 30, parts };
    }
  });
}

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.casino = DC_TEXT.take;
  MODEL.casino = 'Jars hold gene copies sampled with replacement each generation (Wright–Fisher). Buri’s bottles add family sizes more unequal than chance (designed weights, Ne ≈ 11.5). Founders are a random sample of a large mainland. The eruption draws 8 copies; the zoo breeds 60 lizards under your levers.';
  RECALL.casino = { q: 'A neutral allele is at 20% in a small population. What is its chance of eventually taking over?', opts: [['20', 'About 20%'], ['50', 'About 50%'], ['0', 'Almost none']], ans: '20', why: 'With no selection, an allele’s chance of fixing equals its current share.' };
  BRIDGE.casino = 'In the Black Country selection pushed the moths one way. Here no colour is better, and chance alone moves the jars.';
  if (typeof TRANSFER !== 'undefined') delete TRANSFER.casino;   // the chips are the casino's predictions. TRANSFER.castaways stays until Genetic Rescue replaces the legacy Castaways chapter
}

CH_CASINO_V2.sci = { DC, DC_SC, DC_LV, DC_ASK, DC_SIDES, DC_SIDE, DC_ZOO, DC_BURI, DC_K, DC_BINS, DC_CRASH, DC_STARS };   // for tests/oracle_casino.js
V2.push(CH_CASINO_V2);
