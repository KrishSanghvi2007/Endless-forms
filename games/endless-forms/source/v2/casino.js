/* ================= v2/casino.js: Drift Casino (id 'casino'), the Wave 2 rebuild; absorbs Castaways L1 =================
   D3 §3.2, D5 §4 item 5, D6 (decision 9: four levels, one verb; decision 10: real populations, the casino only as framing).
   You watch real populations drift and bet on how they end. The one verb: tap a bin on the felt strip to stake a chip (ten a
   table), then Spin. The populations are the picture: fruit-fly bottles whose eye colour shows each fly's genotype (orange
   bw75/bw75, pale orange bw75/bw, white bw/bw), Buri's 107 bottles of 16 flies, brown anoles rafting from a mainland to
   empty islets, and anole islets struck by a hurricane. Every finished bottle or islet slides into its bin and pays against
   the croupier's naive odds (quadratic proper score), so the histogram builds from the populations themselves.
     L0 Fly bottles      a neutral allele fixes with a chance equal to its share (P = p)
     L1 Buri's bottles   16 flies drift like about 11.5: Ne, not N, sets the pace
     L2 The castaways    a few founders are a sample: the spread shrinks as √(pq/2n)
     L3 The hurricane    a crash to 4 survivors keeps 7/8 of H but strips about half the alleles
   The bets are the predictions (no marker interludes): stars read your chips against the expectation, never the run.
   Headless sim (R(), Det, WF only); juice from Sim.run's events only (API_v2 §6.1). */

const DC_K = 6;   // chips paid per outcome: DC_K × (your quadratic score − the croupier's)
const DC_T = { gen: 1 / 6, genU: 0.5, buri: 0.25, buriU: 0.6, settle: 2.6, raft: 1.3, storm: 2.2, land: 0.13 };
const DC_BURI = { bottles: 107, flies: 16, T: 19, W: [0.15, 1, 1.85], reps: 4000 };   // W: fertility weights drawn per fly (designed; gives Ne ≈ 11.5)
/* per level: what the population is, its tables, its bins, the croupier's belief, the What if? levers. need: chip tables that
   must pass (bet close to the true odds) for the level's second star: Predict on L0–L2, Transfer on the hurricane */
const DC_LV = [
  { kind: 'bottles', T: 30, n: 12, bins: 'out', crp: 'coin', tables: [{ N: 20, p: 0.8 }], need: 1, levers: ['big', 'half'] },
  { kind: 'buri', bins: 'buri', crp: 'n16', tables: [{}], need: 1, levers: ['equal', 'wild'] },
  { kind: 'islets', n: 12, bins: 'share', crp: 'half', tables: [{ n: 2 }, { n: 12 }], need: 2, levers: ['huge', 'single'] },
  { kind: 'storm', n: 12, bins: 'letters', crp: 'holds', tables: [{ s: 4 }], need: 1, levers: ['ten', 'two'] }
];
const DC_BINS = {   // label keys (content.labels) per bin set
  out: ['allOr', 'allWh', 'mixed'], buri: ['allWh', 'mixed', 'allOr'], share: ['s0', 's1', 's2', 's3', 's4'], letters: ['l0', 'l1', 'l2', 'l3', 'l4']
};
const DC_WHY = [{ real: [], maths: [0] }, { real: [1, 2], maths: [1] }, { real: [3], maths: [2] }, { real: [0], maths: [3] }];   // Why? chunks per level (indices into content.why)
const DC_STARS = [['discover', 'predict'], ['discover', 'predict'], ['discover', 'predict'], ['discover', 'transfer']];   // the stars each level can award
/* the look (D6 decisions 7 and 10): the populations fill the screen (a fly-room bench, a teal sea with sand islets); the
   riverboat casino survives only as a slim felt strip of bins at the bottom, burgundy chips and the croupier's pill.
   Blue and amber appear only where they are gene copies (the bottles' gene-pool bars, founders' badges, the letters). */
const DC_LOOK = {
  bench: '#D9CDB2', bench2: '#C9BB9C', wood: '#4E2C1D', wood2: '#6B3F28', brass: '#B8954A', brass2: '#E0C27E',
  felt: '#1E5A43', felt2: '#2B7254', feltD: '#123D2D', chip: '#8C2438', chipD: '#561520', cream: '#F1E6C8', parch: '#EDE2C6',
  glass: 'rgba(222,232,228,0.82)', food: '#B98F4E', plug: '#EFE6D2', sea: '#1F4C4B', sea2: '#2A615E', sand: '#CDB68A', scrub: '#5C7A3A',
  liz: '#7A5434', lizD: '#4B321E', lizM: '#6A4A2E', raft: '#6E5A36', storm: '#3B4448'
};

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
  chain(N, k0, T) {   // Wright–Fisher with N copies: the distribution of the count at t = 0..T
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
  outBins(N, p, T) { const d = this.chain(N, Math.round(N * p), T)[T]; return [d[N], d[0], 1 - d[N] - d[0]]; },   // all bw75 (orange), all bw (white), still mixed
  meanAbsorb(N, p, Tmax) {   // mean generations to fixation or loss (exact chain, truncated at Tmax)
    const k = Math.round(N * p), h = this.chain(N, k, Tmax); let m = 0, prev = 0;
    for (let t = 1; t <= Tmax; t++) { const a = h[t][0] + h[t][N]; m += t * (a - prev); prev = a; }
    return m + Tmax * (1 - prev);
  },
  buriBins16() { const d = this.chain(32, 16, DC_BURI.T)[DC_BURI.T]; return [d[0], 1 - d[0] - d[32], d[32]]; },   // the croupier: 16 ideal flies, 32 copies
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
  buriH(b) { const p = this.buriK(b) / 32; return 2 * p * (1 - p); },   // the bottle's own 2pq: every copy is counted (same scale as his line)
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
  founders(n) {   // the marker share of 2n founder copies from a large mainland at 50%, in the five share bins
    const d = this.pmf(2 * n, 0.5), out = [0, 0, 0, 0, 0];
    for (let k = 0; k <= 2 * n; k++) out[this.shareBin(k / (2 * n))] += d[k];
    return out;
  },
  shareBin(x) { return x < 0.25 - 1e-9 ? 0 : x < 0.45 - 1e-9 ? 1 : x <= 0.55 + 1e-9 ? 2 : x <= 0.75 + 1e-9 ? 3 : 4; },
  gap(n) { const d = this.pmf(2 * n, 0.5); let s = 0; for (let k = 0; k <= 2 * n; k++) s += d[k] * Math.abs(k / (2 * n) - 0.5); return s; },   // expected distance of an islet's share from the mainland's 50%
  sd(n) { return Math.sqrt(0.25 / (2 * n)); },   // the spread of a founders' share: √(pq/2n) at p = ½
  // the hurricane: m survivor copies drawn from 12 equally common alleles; the distribution of letters kept (exact occupancy)
  kept12(m) { let P = new Float64Array(13); P[0] = 1; for (let i = 0; i < m; i++) { const Q = new Float64Array(13); for (let d = 0; d <= 12; d++) { if (!(P[d] > 0)) continue; Q[d] += P[d] * d / 12; if (d < 12) Q[d + 1] += P[d] * (12 - d) / 12; } P = Q; } return P; },
  letterBin(k) { return k <= 4 ? 0 : k >= 8 ? 4 : k - 4; },
  letterBins(m) { const P = this.kept12(m), out = [0, 0, 0, 0, 0]; for (let k = 0; k <= 12; k++) out[this.letterBin(k)] += P[k]; return out; },
  keptMean(m) { return 12 * (1 - WF._powi(11 / 12, m)); },   // expected letters left of 12 equally common ones
  hKept(m) { return 1 - 1 / m; },   // E[H after] / H before for a crash to m copies
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
  het(n) { let t = 0, s = 0; for (const x of n) t += x; if (!t) return 0; for (const x of n) s += (x / t) * (x / t); return 1 - s; },
  kept(n) { let k = 0; for (const x of n) if (x > 0) k++; return k; }
};

/* ================= all words (API_v2 §9.2); tests/lint_text.js checks every budget ================= */
const DC_TEXT = {
  firstWords: 'Twelve bottles of flies. The croupier calls each a coin toss. Tap a bin to bet a chip.',
  intro: {   // the opening description card (D6 decision 8; 00_entry.js Intro): 1–2 sentences, ≤ 35 words each
    game: 'You bet against a riverboat croupier on real populations left to chance. Fruit-fly bottles, Buri’s famous bottles, rafting lizards and islets hit by a hurricane.',
    biology: 'Genetic drift is chance in who breeds: allele shares wander, fastest in small populations. A neutral allele takes over with a chance equal to its share; crashes strip rare alleles.',
    how: 'Tap a bin on the felt to stake a chip, ten a table, then press Spin. Bet close to the true odds to beat the croupier.'
  },
  hud: {
    bet0: 'Bet how the bottles end at generation 30. {c} left.',
    bet1: 'Bet Buri’s 107 bottles at generation 19. {c} left.',
    bet2: '{n} lizards raft to each islet. Bet the marker share. {c} left.',
    bet3: 'Bet the letters left after the storm. {c} left.',
    spin: 'All ten chips are down. Press Spin.',
    run0: 'Each generation the flies are a random draw of the bottle before.',
    run1: 'Sixteen flies a bottle. Some leave many young, some none.',
    run2: 'Rafts of vegetation carry the founders out to sea.',
    run3: 'The hurricane sweeps the islets. Four lizards survive on each.',
    key0: 'Long run: P(all orange) = start share = 80%. Fixed: {k} of 12.',
    key1: 'Ne ≈ 11.5, not 16: H fell by 1/(2Ne) a generation.',
    key2: 'Spread ≈ √(pq/2n): about ±{d} points with {n} founders.',
    key3: 'H kept {h}% ≈ 1 − 1/2N; letters kept {k} of 12.',
    paused: 'Paused. Press Step for one generation, or Play.',
    whatif: 'What if? The table runs again with one thing changed.',
    over: 'Done.'
  },
  whispers: {
    full: 'All ten chips are down.', need: 'Bet all ten chips first.', hold: 'Hold a bin to take a chip back.',
    odds: 'Dashed boxes: his bets. Beat them.', pills: 'Each finished population pays.', eyes: 'Eye colour shows each fly’s genotype.',
    harder: 'He backed this bin harder than you.', spread: 'Piling chips elsewhere costs you here.', reprice: 'The croupier changes his odds.',
    empty: 'Nothing to take back.', cleared: 'Chips back in your stack.', same: 'Same bets as last table.', pinned: 'Your bottle. Its flies are shown.',
    raft: 'Founders are a sample of the mainland.', storm: 'Who survives is luck.'
  },
  labels: {
    allOr: 'All orange', allWh: 'All white', mixed: 'Still mixed',
    s0: '<25', s1: '25–44', s2: '≈50', s3: '56–75', s4: '>75',
    l0: '≤4', l1: '5', l2: '6', l3: '7', l4: '≥8', hint2: 'Marker share, %', hint3: 'Letters kept',
    coin: 'Coin toss!', n16: 'Sixteen flies!', half: 'Exactly half!', holds: 'Variety holds!', pays: 'House pays!', wins: 'House wins!',
    table: 'Table {n}/{m}', gen: 'Gen {n}/{m}', you: 'you', chips: '{n} chips', chip1: '{n} chip', flies: '{n} flies',
    mainland: 'Mainland', marker: '{n}% marker', letters: 'Letters', het: 'H', hKept: 'H kept {n}%', lKept: 'Letters kept {n}%',
    expected: 'expected', exp: 'exp', avg: 'avg', average: 'average', bottle: 'bottle', yourBottle: 'your bottle', sixteen: '16 ideal flies',
    spin: 'Spin', play: 'Play', pause: 'Pause', step: 'Step', clear: 'Clear', same: 'Same bets', bw75: 'bw75', bw: 'bw', mixTag: 'mixed', young: 'dots: young',
    tShare: 'bw75 share', tH: 'Heterozygosity', tNear: 'Gap from half', tKept: 'Kept after storm', tPurse: 'Purse',
    axGen: 'generation', axFounders: 'founders', axStorm: 'hurricane', before: 'before', after: 'after', pfix: 'P(fix) = p = 0.8', ne: 'Ne ≈ 11.5'
  },
  panels: [],
  interesting: {
    lost0: 'The house won. A neutral allele takes the bottle with a chance equal to its share, not a coin toss.',
    lost1: 'Sixteen flies drifted like about eleven. The real spread was wider than the croupier’s.',
    lost2: 'A few founders are a small sample. Two founders often start far from the mainland’s half.',
    lost3: 'About half the letters vanished, though heterozygosity barely fell. The croupier mistook one for the other.',
    big: 'In bottles of 50 flies the shares spread out, but most bottles were still mixed after thirty generations.',
    half: 'From half bw75, about half the settled bottles went each way.',
    equal: 'With equal families, heterozygosity fell more slowly than the sixteen-fly line.',
    wild: 'With very unequal families, sixteen flies drifted like about seven.',
    huge: 'Forty founders: most islets started near half, and none far from it.',
    single: 'One founder carries two copies: islets could start only at 0, 50 or 100%.',
    ten: 'With ten survivors, most letters made it through the hurricane.',
    two: 'With two survivors, at most four letters could make it through.'
  },
  levers: { big: '50-fly bottles', half: 'Start at half', equal: 'Equal families', wild: 'Unequal families', huge: 'Forty founders', single: 'One founder', ten: 'Ten survivors', two: 'Two survivors' },
  take: 'Drift is chance in sampling. A neutral copy wins with its share; small populations lose alleles fast.',
  body: 'Recap: an allele wins with its share. Families more unequal than chance shrink Ne. Founders are a sample. A crash strips alleles before heterozygosity.',
  law: { title: 'Chance has no memory' },
  boss: { inverts: 'Before, H was the casualty. After a brief crash, H holds while alleles vanish.' },
  stars: {
    discover: 'Beat the croupier’s odds.',
    predict: 'Bet close to the true odds on fly bottles and castaways.',
    transfer: 'Bet close to the true odds on the hurricane’s letters.'
  },
  captions: {
    take0: 'A neutral allele takes the bottle with a chance equal to its share: P(fix) = p. The average bottle stays put.',
    take1: 'Families more unequal than chance made sixteen flies drift like about eleven. Ne, not N, sets the pace of drift.',
    take2: 'A founding group is a sample. Its share scatters by about √(pq/2n): the fewer the founders, the further from the mainland.',
    takeBoss: 'The hurricane kept {h}% of H but lost {l} of 12 letters.',
    invBody: 'After a brief crash, alleles vanish faster than heterozygosity. H keeps 1 − 1/2N, but rare letters are simply not drawn.',
    edge: 'You won {w} chips. Expected for your bets: {e}.',
    sD: 'Beat the croupier’s odds over the level’s tables.', sP1: 'Bet one table close to the true odds.', sP2: 'Bet both tables close to the true odds.', sT: 'Bet the letters close to the true odds.',
    liveGen: 'Generation {g}. {f} of {n} settled.',
    liveTable: 'Table done. Chips won {w}.',
    liveStorm: 'Letters kept {k} percent. Heterozygosity kept {h} percent.',
    mPurse: 'Chips you hold.', mSettled: 'Bottles fixed or lost so far.', mH: 'Chance two random copies differ.', mNear: 'Average distance of an islet’s marker share from 50%.'
  },
  model: [
    { level: 0, simulated: 'Twelve bottles of 10 fruit flies, 20 gene copies each, from 80% bw75. Each generation every copy is drawn from the bottle before (Wright–Fisher), and pairs of copies make the flies. Neither allele is better.', simplification: 'Ten flies is far fewer than a real culture. Generations do not overlap. Eye colour shows the genotype: orange, pale orange or white.', params: [{ name: 'flies a bottle', value: 10, tag: 'designed' }, { name: 'start', value: '80% bw75', tag: 'designed' }, { name: 'generations', value: 30, tag: 'designed' }, { name: 'bottles a table', value: 12, tag: 'designed' }], cannot: 'Selection, mutation or migration.', nature: 'Every finite population drifts. Small isolated ones drift fastest.', contested: false, refs: ['wright1931', 'fisher1930', 'kimura1962', 'buri1956'] },
    { level: 1, simulated: '107 bottles of 8 males and 8 females, all bw75/bw at first, for 19 generations. Each fly gets a low, middling or high fertility weight. Families vary more than chance alone makes them.', simplification: 'Fertility is redrawn each generation and is not inherited.', params: [{ name: 'bottles', value: 107, tag: 'realistic' }, { name: 'flies a bottle', value: 16, tag: 'realistic' }, { name: 'generations', value: 19, tag: 'realistic' }, { name: 'fertility weights', value: '0.15, 1, 1.85', tag: 'designed' }], cannot: 'Why Buri’s real families varied: crowding, larval competition and luck.', nature: 'Buri’s 1956 lines fitted an Ne of about eleven and a half, though each kept 16 parents.', contested: false, refs: ['buri1956', 'crow1970'] },
    { level: 2, simulated: 'A large mainland where a neutral marker allele is at 50%. Rafts of vegetation carry 2, then 12, brown anoles to each of 12 empty islets. Founders’ copies are a random sample.', simplification: 'The mainland is large and mates at random. So each founder copy carries the marker with chance one half.', params: [{ name: 'islets a table', value: 12, tag: 'designed' }, { name: 'founders', value: '2, then 12', tag: 'designed' }], cannot: 'What happens after founding: growth, drift and migration.', nature: 'Green iguanas rafted 250 km to Anguilla on debris after hurricanes in 1995 (Censky and colleagues 1998). Brown anoles released on small Bahamian islands kept their founders’ differences for years (Kolbe and colleagues 2012).', contested: false, refs: ['mayr1942', 'kolbe2012', 'censky1998'] },
    { level: 3, simulated: 'Twelve islets, each with a large anole population carrying 12 equally common neutral alleles. A hurricane leaves 4 lizards (8 copies) on each, and the islet regrows from them at once.', simplification: 'Survivors are a random draw: here the storm does not favour any allele.', params: [{ name: 'alleles', value: 12, tag: 'designed' }, { name: 'survivors an islet', value: 4, tag: 'designed' }, { name: 'islets', value: 12, tag: 'designed' }], cannot: 'Inbreeding depression, or selection by the storm itself.', nature: 'Northern elephant seals and cheetahs carry little genetic variation after past declines.', contested: false, refs: ['nei1975', 'hoelzel1993', 'obrien1985'] }
  ],
  why: {   // every Why? chunk; DC_WHY says which ones each level's card shows. No decimals: the card's sentence splitter breaks on every full stop.
    real: [
      'Northern elephant seals fell to perhaps a few tens in the 1890s, and stayed few for decades. Today they number over 100,000 but carry little genetic variation (Hoelzel and colleagues 1993).',
      'Buri (1956) kept 107 lines of fruit flies at 16 parents each for 19 generations. The lines drifted apart until many had lost or fixed the bw75 allele. The spread fitted an effective size of about eleven and a half, not 16.',
      'Wild populations often have Ne near a tenth of their census size (Frankham 1995).',
      'Island populations founded by a few individuals often differ from their source. Mayr (1942) called this the founder principle. Lizards really do raft: green iguanas reached Anguilla on storm debris in 1995.'
    ],
    maths: [
      'A neutral allele at share p ends up fixed with probability p (Kimura 1962). The average share stays at p, but each bottle wanders until one allele wins. With N copies, heterozygosity falls on average by a factor (1 − 1/N) each generation.',
      'Ne is the size of an ideal population that drifts at the same rate. In an ideal population family sizes vary by chance (Vk about 2), so Ne = N. With family-size variance Vk, Ne = (4N − 2)/(Vk + 2). Heterozygosity falls by 1/(2Ne) a generation.',
      'n founders carry 2n copies, a random sample of the mainland. Their share scatters with a standard deviation of √(pq/2n). Four times the founders, half the spread.',
      'A crash to n copies keeps (1 − 1/n) of heterozygosity on average: seven eighths for 8 copies. Each of 12 equal alleles survives with chance 1 − (11/12)^8, about one half. So about 6 vanish (Nei, Maruyama and Chakraborty 1975).'
    ]
  }
};

/* ---------- scoring helpers shared by the stars, the level card and the oracle (pure functions of the sim state) ---------- */
const DC_SC = {
  expectBins(r) {   // r: a table record {level, N, p, n, surv, mode}
    const L = DC_LV[r.level];
    if (L.kind === 'bottles') return DC.outBins(r.N, r.p, L.T);
    if (L.kind === 'buri') return DC.buriMC(r.mode || 'w').bins;
    if (L.kind === 'islets') return DC.founders(r.n);
    return DC.letterBins(2 * r.surv);
  },
  count(r) { const L = DC_LV[r.level]; return L.kind === 'buri' ? DC_BURI.bottles : L.n; },
  gainSum(s) { let g = 0; for (const r of s.tab) if (r) g += DC.gain(r.q, this.expectBins(r), r.c); return g; },
  availSum(s) { let g = 0; for (const r of s.tab) if (r) { const e = this.expectBins(r); g += Math.max(0, DC.ES(e, e) - DC.ES(r.c, e)); } return g; },
  beat(s) { const g = this.gainSum(s); return s.tab.length > 0 && g > 0 && g >= 0.25 * this.availSum(s) - 1e-9; },   // Discover: your bets beat his by a quarter of what was there to win
  passes(s) { let k = 0; for (const r of s.tab) if (r && DC.pass(r.q, this.expectBins(r), r.c)) k++; return k; },
  expChips(s) { let e = 0; for (const r of s.tab) if (r) e += this.count(r) * DC_K * DC.gain(r.q, this.expectBins(r), r.c); return Math.round(e); }
};

/* bot helpers (bots are called without a receiver, so they never use this) */
const DC_BOT = {
  alloc(w) { const n = w.length, tot = w.reduce((a, b) => a + b, 0) || 1, raw = w.map(x => 10 * x / tot), base = raw.map(Math.floor); let left = 10 - base.reduce((a, b) => a + b, 0); const ord = raw.map((x, i) => [x - base[i], i]).sort((a, b) => b[0] - a[0]); for (let k = 0; k < n && left > 0; k++, left--) base[ord[k][1]]++; return base; },
  one(s, i) { const w = new Array(s.chips.length).fill(0); w[i] = 1; return w; },
  chips(s, acts, target) { for (let b = 0; b < target.length; b++) { if (s.chips[b] < target[b]) { const a = acts.find(x => x.k === 'add' && x.b === b); if (a) return a; } if (s.chips[b] > target[b]) { const a = acts.find(x => x.k === 'rem' && x.b === b); if (a) return a; } } return acts.find(x => x.k === 'spin') || null; },
  start(s) { const k = DC_LV[s.level].kind; return k === 'bottles' ? 0 : k === 'buri' ? 1 : k === 'islets' ? 2 : 4; },   // "nothing changes": the bin that holds the start
  mixed(s) { const k = DC_LV[s.level].kind; return k === 'bottles' ? 2 : k === 'buri' ? 1 : 2; },
  common(s, acts, chips) { return s.phase === 'bet' ? this.chips(s, acts, chips()) : null; }
};

const CH_CASINO_V2 = {
  id: 'casino', v2: true, role: 'environment', place: 'lab', accent: '#8C2438',   // the chapter's chrome tint (D6 decision 7)
  intro: { goal: 'Beat the croupier’s odds on real populations that drift.' },
  content: DC_TEXT,
  P: {
    bottles: { v: 12, tag: 'designed', min: 6, max: 18, label: 'bottles a table' },
    survivors: { v: 4, tag: 'designed', min: 2, max: 10, label: 'hurricane survivors' }
  },
  levels: [
    { name: 'Fly bottles', adds: 'the starting share', codes: ['C2'], minutes: 2 },
    { name: 'Buri’s bottles', adds: 'effective size', codes: ['C3'], minutes: 3 },
    { name: 'The castaways', adds: 'founders', codes: ['C4'], minutes: 3 },
    { name: 'The hurricane', adds: 'many alleles', codes: ['C4'], minutes: 2 }
  ],
  keys: { ArrowLeft: 'previous bin', ArrowRight: 'next bin', ArrowUp: 'add a chip', ArrowDown: 'take a chip', Space: 'spin or pause', X: 'clear chips', A: 'same bets', Enter: 'spin' },
  untimed: true,
  teacher: { prompts: ['A bottle is 80% bw75. What is the chance it ends all orange-eyed, and why?', 'Buri kept 16 flies per bottle. Why did they drift like 11.5? Name two reasons.', 'A hurricane left four lizards. Why did heterozygosity survive better than the rare alleles?'], pool: 'trace' },
  encodings: [   // two alleles blue/amber in the gene-pool read-outs; twelve alleles by fill, overlay pattern and letter (D4 §2.2 rule 7)
    { k: 'A', rgb: [107, 151, 255], channels: ['colour', 'letter'] }, { k: 'a', rgb: [242, 201, 76], channels: ['colour', 'letter'] },
    { k: 'chips', rgb: [232, 223, 201], channels: ['shape'] }
  ],
  starTraits: ['A', 'a'],

  /* ================= headless simulation (API_v2 §9.3): R(), Det, WF only; no DOM, canvas or view ================= */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {};
      this.s = { level, phase: 'bet', t: 0, ti: 0, purse: 100, won: 0, paid: 0, chips: [], odds: [], landed: [], tab: [], hist: [], items: [],
        gen: 0, paused: false, unt: !!(Save.d && Save.d.ui && Save.d.ui.unt), pin: 0, last: null, whatif: null, res: null, pred: {}, asks: [], log: [] };
      if (o.thaw) { this.restore(o.thaw.snap); const s = this.s; s.log = []; s.res = null; s.whatif = o.thaw.lever; s.unt = !!(Save.d && Save.d.ui && Save.d.ui.unt); this.lever(s, o.thaw.lever); return; }
      this.table(this.s);
    },
    nb(s) { return DC_BINS[DC_LV[s.level].bins].length; },
    odds(s) {
      const c = DC_LV[s.level].crp;
      if (c === 'coin') { const m = DC.outBins(20, 0.5, 30)[2]; return [(1 - m) / 2, (1 - m) / 2, m]; }
      if (c === 'n16') return DC.buriBins16();
      if (c === 'half') return [0.05, 0.15, 0.6, 0.15, 0.05];
      return [0.02, 0.04, 0.09, 0.2, 0.65];   // 'holds': he thinks the letters survive as well as heterozygosity does
    },
    table(s) {
      const L = DC_LV[s.level], T = L.tables[s.ti], nb = this.nb(s);
      s.chips = new Array(nb).fill(0); s.odds = this.odds(s); s.landed = new Array(nb).fill(0); s.gen = 0; s.t = 0; s.phase = 'bet'; s.paid = 0; s.paused = false; s.items = [];
      if (L.kind === 'bottles') {
        s.N = T.N; s.p0 = T.p; s.T = L.T; const k0 = Math.round(T.N * T.p);
        for (let j = 0; j < CH_CASINO_V2.P.bottles.v; j++) s.items.push({ k: k0, fix: -1, out: -1, tr: [k0 / T.N] });
      } else if (L.kind === 'buri') {
        s.N = 16; s.p0 = 0.5; s.T = DC_BURI.T; s.mode = 'w';
        for (let b = 0; b < DC_BURI.bottles; b++) s.items.push({ b: DC.buriFounders(), k: 16, out: -1, tr: [0.5] });
        s.Hs = [this.meanH(s)];
      } else if (L.kind === 'islets') s.n = T.n;
      else s.surv = CH_CASINO_V2.P.survivors.v;
    },
    meanH(s) { let h = 0; for (const B of s.items) h += DC.buriH(B.b); return h / s.items.length; },
    lever(s, k) {   // What if?: the frozen table, one thing changed
      const L = DC_LV[s.level];
      s.landed = s.landed.map(() => 0); s.gen = 0; s.t = 0; s.phase = 'run'; s.paused = false;
      if (L.kind === 'bottles') {
        if (k === 'big') s.N = 100; if (k === 'half') s.p0 = 0.5;
        const k0 = Math.round(s.N * s.p0); s.items.forEach(J => { J.k = k0; J.fix = -1; J.out = -1; J.tr = [k0 / s.N]; });
      } else if (L.kind === 'buri') {
        s.mode = k === 'equal' ? 'eq' : 'wild'; s.items.forEach(B => { B.b = DC.buriFounders(); B.k = 16; B.out = -1; B.tr = [0.5]; }); s.Hs = [this.meanH(s)];
      } else if (L.kind === 'islets') { s.n = k === 'huge' ? 40 : 1; this.found(s); }
      else { s.surv = k === 'ten' ? 10 : 2; this.strike(s); }
    },
    /* ---- one table: bet → run → settle ---- */
    spin(s, ev) {
      let n = 0; for (const x of s.chips) n += x;
      if (n !== 10) { ev.push({ k: 'need' }); return; }
      s.tab[s.ti] = { level: s.level, ti: s.ti, q: s.chips.map(x => x / 10), c: s.odds.slice(), N: s.N, p: s.p0, n: s.n, surv: s.surv, mode: s.mode || 'w' };
      s.last = s.chips.slice();
      ev.push({ k: 'spun', ti: s.ti, last: s.ti === DC_LV[s.level].tables.length - 1 });
      this.go(s, ev);
    },
    go(s, ev) {
      const L = DC_LV[s.level]; s.t = 0; s.phase = 'run'; s.gen = 0;
      if (L.kind === 'islets') { this.found(s); ev.push({ k: 'raft', n: s.n }); }
      else if (L.kind === 'storm') { this.strike(s); ev.push({ k: 'storm' }); }
      else ev.push({ k: 'run' });
    },
    found(s) {   // rafts: each islet gets s.n founders, two copies each, carrying the marker with chance one half (a large mainland at 50%)
      s.items = [];
      for (let i = 0; i < DC_LV[2].n; i++) {
        const g = []; let am = 0;
        for (let f = 0; f < s.n; f++) { const a = R() < 0.5 ? 1 : 0, b = R() < 0.5 ? 1 : 0; g.push([a, b]); am += a + b; }
        s.items.push({ g, am, share: am / (2 * s.n), out: DC.shareBin(am / (2 * s.n)), landed: false });
      }
    },
    strike(s) {   // the hurricane: on each islet s.surv lizards survive, 2·s.surv copies drawn from 12 equally common alleles
      s.items = []; const m = 2 * s.surv, w = DC.uni(12);
      for (let i = 0; i < DC_LV[3].n; i++) {
        const counts = Array.from(WF.multinom(m, w)), copies = [];
        counts.forEach((c, a) => { for (let q = 0; q < c; q++) copies.push(a); });
        for (let q = copies.length - 1; q > 0; q--) { const j = Math.floor(R() * (q + 1)), t = copies[q]; copies[q] = copies[j]; copies[j] = t; }
        const surv = []; for (let q = 0; q + 1 < copies.length; q += 2) surv.push([copies[q], copies[q + 1]]);
        const kept = DC.kept(counts);
        s.items.push({ counts, surv, H: DC.het(counts), kept, out: DC.letterBin(kept), landed: false });
      }
    },
    land(s, j, bin, ev) {   // a finished population lands in its bin and pays: DC_K × (your score − the croupier's)
      const r = s.tab[s.ti], pay = r && !s.whatif ? Math.round(DC_K * (DC.S(r.q, bin) - DC.S(r.c, bin))) : 0;   // a thawed What if? table pays nothing
      s.landed[bin]++; s.purse += pay; s.paid += pay; s.won += pay; ev.push({ k: 'land', j, bin, pay });
    },
    genBottles(s, ev) {
      s.gen++;
      s.items.forEach((J, j) => {
        if (J.out >= 0) { J.tr.push(J.k / s.N); return; }
        J.k = WF.binom(s.N, J.k / s.N);
        if (J.k === 0 || J.k === s.N) { J.fix = s.gen; J.out = J.k ? 0 : 1; this.land(s, j, J.out, ev); }
        J.tr.push(J.k / s.N);
      });
      ev.push({ k: 'gen', g: s.gen });
      if (s.gen >= s.T || s.items.every(J => J.out >= 0)) {
        s.items.forEach((J, j) => { if (J.out < 0) { J.out = 2; this.land(s, j, 2, ev); } });
        this.settle(s, ev);
      }
    },
    genBuri(s, ev) {
      s.gen++;
      s.items.forEach(B => { if (B.k > 0 && B.k < 32) { B.b = DC.buriGen(B.b, s.mode); B.k = DC.buriK(B.b); } B.tr.push(B.k / 32); });
      s.Hs.push(this.meanH(s));
      ev.push({ k: 'gen', g: s.gen });
      if (s.gen >= s.T) { s.items.forEach((B, j) => { B.out = B.k === 0 ? 0 : B.k === 32 ? 2 : 1; this.land(s, j, B.out, ev); }); this.settle(s, ev); }
    },
    settle(s, ev) {
      const L = DC_LV[s.level];
      if (L.kind === 'bottles') s.hist[s.ti] = { N: s.N, p: s.p0, fix: s.items.map(J => J.fix), out: s.items.map(J => J.out), tr: s.items.map(J => J.tr.slice()), purse: s.purse };
      else if (L.kind === 'islets') { let g = 0; for (const I of s.items) g += Math.abs(I.share - 0.5); s.hist[s.ti] = { n: s.n, gap: g / s.items.length, purse: s.purse, am: s.items.map(I => I.am) }; }
      else if (L.kind === 'storm') { let h = 0, k = 0; for (const I of s.items) { h += I.H; k += I.kept; } s.hist[s.ti] = { surv: s.surv, H: h / s.items.length / (11 / 12), kept: k / s.items.length, purse: s.purse }; }
      else s.hist[s.ti] = { purse: s.purse, lost: s.items.filter(B => B.k === 0).length, fixed: s.items.filter(B => B.k === 32).length };
      s.phase = 'settle'; s.t = 0; s.paused = false; ev.push({ k: 'settle', paid: s.paid });
    },
    next(s, ev) {
      const L = DC_LV[s.level];
      if (s.whatif) { s.phase = 'over'; ev.push({ k: 'over' }); return; }
      if (s.ti < L.tables.length - 1) { s.ti++; this.table(s); ev.push({ k: 'table', ti: s.ti }); return; }
      s.phase = 'over'; ev.push({ k: 'over' });
    },
    /* ---- the clock ---- */
    genOf(s) { return DC_LV[s.level].kind === 'buri' ? (s.unt ? DC_T.buriU : DC_T.buri) : (s.unt ? DC_T.genU : DC_T.gen); },
    step(dt) {
      const s = this.s, ev = []; if (!s) return ev;
      const L = DC_LV[s.level], ph = s.phase;
      if (ph === 'run' && (L.kind === 'islets' || L.kind === 'storm')) {   // the rafts (or the storm) sweep, then the islets land one by one
        s.t += dt; const t0 = L.kind === 'islets' ? DC_T.raft : DC_T.storm;
        s.items.forEach((I, i) => { if (!I.landed && s.t >= t0 + DC_T.land * i) { I.landed = true; this.land(s, i, I.out, ev); } });
        if (s.t >= t0 + DC_T.land * s.items.length + 0.6) this.settle(s, ev);
        return ev;
      }
      if (ph === 'run') {
        if (s.paused) return ev;
        s.t += dt; const per = this.genOf(s);
        if (s.t + 1e-9 >= per) { s.t -= per; this.tick(s, ev); }
        return ev;
      }
      if (ph === 'settle') { s.t += dt; if (s.t >= DC_T.settle) this.next(s, ev); return ev; }
      if (ph === 'bet') s.t += dt;
      return ev;
    },
    tick(s, ev) { if (DC_LV[s.level].kind === 'bottles') this.genBottles(s, ev); else this.genBuri(s, ev); },
    act(a) {
      const s = this.s, ev = []; if (!s || !a) return ev;
      const L = DC_LV[s.level], nb = this.nb(s);
      if (a.k === 'add' && s.phase === 'bet') { let n = 0; for (const x of s.chips) n += x; if (n < 10 && a.b >= 0 && a.b < nb) { s.chips[a.b]++; ev.push({ k: 'chip', b: a.b, n: n + 1 }); if (n + 1 === 10) ev.push({ k: 'full' }); } else if (n >= 10) ev.push({ k: 'fullAlready' }); }
      else if (a.k === 'rem' && s.phase === 'bet') { if (a.b >= 0 && a.b < nb && s.chips[a.b] > 0) { s.chips[a.b]--; ev.push({ k: 'unchip', b: a.b }); } else ev.push({ k: 'empty' }); }
      else if (a.k === 'move' && s.phase === 'bet') { if (a.from >= 0 && a.from < nb && a.to >= 0 && a.to < nb && s.chips[a.from] > 0 && a.from !== a.to) { s.chips[a.from]--; s.chips[a.to]++; ev.push({ k: 'unchip', b: a.from }, { k: 'chip', b: a.to, n: -1 }); } }
      else if (a.k === 'spin' && s.phase === 'bet') this.spin(s, ev);
      else if (a.k === 'clear' && s.phase === 'bet') { let n = 0; for (const x of s.chips) n += x; if (!n) ev.push({ k: 'empty' }); else { const was = s.chips.slice(); s.chips = s.chips.map(() => 0); ev.push({ k: 'clear', was }); } }
      else if (a.k === 'same' && s.phase === 'bet') {   // last table's bet again (same bins only)
        let n = 0; for (const x of s.chips) n += x;
        if (s.last && s.last.length === nb && !n) { s.chips = s.last.slice(); ev.push({ k: 'same' }, { k: 'full' }); } else ev.push({ k: 'sameNo' });
      }
      else if (a.k === 'pin') { const m = s.items.length; s.pin = Math.max(0, Math.min(Math.max(0, m - 1), a.j | 0)); ev.push({ k: 'pin', j: s.pin }); }
      else if (a.k === 'pause') { if (s.phase === 'run' && (L.kind === 'bottles' || L.kind === 'buri')) { s.paused = !!a.on; ev.push({ k: 'pause', on: s.paused }); } }
      else if (a.k === 'step') { if (s.paused && s.phase === 'run') { s.t = 0; this.tick(s, ev); } }
      else if (a.k === 'next' && s.phase === 'settle' && s.t > 0.4) this.next(s, ev);
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      if (s.res) return s.res;
      if (s.whatif) return (s.res = { mask: 0, outcome: { won: s.won }, interesting: s.whatif });
      const st = CH_CASINO_V2.stars, n = s.level;
      const mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return (s.res = { mask, outcome: { won: s.won, exp: DC_SC.expChips(s) }, interesting: mask & 1 ? null : 'lost' + n });
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.phase === 'bet') {
        const nb = this.nb(s); let n = 0; for (const x of s.chips) n += x;
        for (let b = 0; b < nb; b++) { if (n < 10) out.push({ k: 'add', b }); if (s.chips[b] > 0) out.push({ k: 'rem', b }); }
        if (n === 10) out.push({ k: 'spin' });
      }
      return out;
    },
    bots: {   // (s, acts, rnd) → action | null; 'random' is generic. D3's named bots: all on the start, an even spread, copy the croupier, all on mixed
      alwaysA(s, acts) { return DC_BOT.common(s, acts, () => DC_BOT.alloc(DC_BOT.one(s, DC_BOT.start(s)))); },
      alwaysB(s, acts) { return DC_BOT.common(s, acts, () => DC_BOT.alloc(s.chips.map(() => 1))); },
      greedy(s, acts) { return DC_BOT.common(s, acts, () => DC_BOT.alloc(s.odds)); },
      threshold(s, acts) { return DC_BOT.common(s, acts, () => DC_BOT.alloc(DC_BOT.one(s, DC_BOT.mixed(s)))); }
    }
  },

  /* ---- stars against the expectation for the parameters in force, never the realised run (pure functions of the final state) ---- */
  stars: {
    discover: (s) => DC_SC.beat(s),
    predict: (s, n) => n < 3 && DC_SC.passes(s) >= DC_LV[n].need,
    transfer: (s, n) => n === 3 && DC_SC.passes(s) >= DC_LV[n].need
  },

  /* ================= view: lifecycle, input, juice, drawing (juice from Sim.run's events only) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = 0; this._dockSig = ''; this._tips = this._tips || {};
    if (typeof Predict !== 'undefined') Predict.clear();
    Sim.start(this, n, o);
    const s = this.sim.s;
    this.v = { t: 0, fl: [], gone: {}, shown: [], pulse: 0, banner: null, press: null, cursor: 0, focus: false, talk: null, purse: s.purse, thaw: !!o.thaw,
      lastPhase: '', tableT: 0, spinT: -1, settleT: -1, flash: {}, ghosted: {}, landCol: {}, col: {}, colN: {}, rt: -1 };
    this.resetShown();
    this.talk(DC_LV[n].crp);
    this.dock(); this.hud();
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    const name = o.thaw ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (o.thaw) this.v.rt = 0;   // a thawed raft or storm replays its sweep
    else if (n > 0) this.whisper('reprice');
  },
  tip(k, vars) { if (this._tips[k]) return false; this._tips[k] = 1; this.whisper(k, vars); return true; },   // a teaching whisper, once per session
  chipsTxt(n) { return Txt.f(this.content.labels[n === 1 ? 'chip1' : 'chips'], { n }); },
  resetShown() { const s = this.sim.s, v = this.v; v.shown = (s.landed || []).map(() => 0); v.gone = {}; v.landCol = {}; v.col = {}; v.colN = {}; },
  talk(key) { const L = this.content.labels; this.v.talk = { text: L[key] || '', t: 0 }; },
  whisper(k, vars) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(vars ? Txt.f(t, vars) : t, 'dc-' + k); },
  live(k, vars) { if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.captions[k], vars)); },
  snd(name, x, y) { if (typeof Snd2 !== 'undefined') Snd2.play(name, { x, y }); },
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  kind() { return DC_LV[this.sim.s.level].kind; },
  ink() { return '#1B1612'; },
  paper() { return typeof Pal !== 'undefined' ? Pal.paper : '#E8DFC9'; },
  inkA() { return typeof Pal !== 'undefined' ? Pal.A : '#6B97FF'; },
  inka() { return typeof Pal !== 'undefined' ? Pal.a : '#F2C94C'; },
  lbl(id, text, x, y, o) { if (typeof Lbl !== 'undefined') return Lbl.put('dc-' + id, text, x, y, o); return null; },

  /* ---------- geometry (canvas px), recomputed each frame from Stage: the population fills the scene; the felt is a strip ---------- */
  geo() {
    const W = Stage.w, H = Stage.h, top = this.hudH() + 6, A = Math.max(260, H - top - 6), wide = W >= 640, u = Stage.u || 390, k = this.kind();
    const feltH = Math.round(Math.max(118, Math.min(180, A * 0.27)));
    const G = { W, H, top, A, wide, u, k };
    G.felt = { x: 8, y: H - feltH - 6, w: W - 16, h: feltH };
    G.scene = { x: 0, y: top - 6, w: W, h: G.felt.y - top };
    const S = G.scene;
    if (k === 'bottles') {
      const n = this.sim.s.items.length, gap = Math.max(6, Math.min(14, W * 0.018));
      const fit = c => { const r = Math.ceil(n / c), w = Math.min(96, (W - 20 - (c - 1) * gap) / c); return Math.min(w, ((S.h - 26) / r - 22) / 1.7); };   // the bottle width each grid allows
      const cols = wide && fit(12) > fit(6) ? Math.min(12, n) : wide && fit(4) > fit(6) ? 4 : 6, rows = Math.ceil(n / cols);   // whichever grid gives the biggest bottles
      const bw = Math.min(96, (W - 20 - (cols - 1) * gap) / cols), bh = Math.min(bw * 1.7, (S.h - 26) / rows - 22);
      const x0 = (W - (cols * bw + (cols - 1) * gap)) / 2, y0 = S.y + 18 + Math.max(0, (S.h - 26 - rows * (bh + 22)) / 2);
      G.items = []; for (let j = 0; j < n; j++) { const c = j % cols, r = Math.floor(j / cols); G.items.push({ x: x0 + c * (bw + gap), y: y0 + r * (bh + 22), w: bw, h: bh }); }
    } else if (k === 'buri') {
      const heroW = Math.round(Math.min(W * 0.36, 260)), histH = Math.round(Math.max(44, Math.min(70, S.h * 0.2)));
      G.tray = { x: 8, y: S.y + 10, w: W - 24 - heroW, h: S.h - histH - 20 };
      G.hero = { x: W - 8 - heroW, y: S.y + 10, w: heroW, h: S.h - histH - 20 };
      G.hist = { x: 14, y: S.y + S.h - histH - 4, w: W - 28, h: histH };
    } else if (k === 'islets') {
      const seaH = Math.round(S.h * 0.64);
      G.sea = { x: 0, y: S.y, w: W, h: seaH };
      G.land = { x: 0, y: S.y + seaH, w: W, h: S.h - seaH };
      G.items = this.isletGrid({ x: 0, y: S.y + 4, w: W, h: seaH - 8 }, wide ? 6 : 4, 0.6);
    } else {
      G.sea = { x: 0, y: S.y, w: W, h: S.h };
      G.items = this.isletGrid({ x: 0, y: S.y + 4, w: W, h: S.h - 34 }, wide ? 6 : 4, 0.6);
    }
    G.bins = this.layBins(G.felt);
    return G;
  },
  isletGrid(R0, cols, aspect) {
    const n = 12, rows = Math.ceil(n / cols), gap = 10, iw = Math.min(150, (R0.w - 16) / (cols + 0.4) - gap), ih = Math.min(iw * aspect, (R0.h - 16) / rows - gap - 18), span = cols * (iw + gap) + (iw + gap) * 0.4, out = [];
    for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols); out.push({ x: (R0.w - span) / 2 + gap / 2 + c * (iw + gap) + (r % 2 ? (iw + gap) * 0.4 : 0), y: R0.y + 12 + r * (ih + gap + 18), w: iw, h: ih }); }
    return out;
  },
  layBins(F) {   // the bins sit between your chip stack (left) and the croupier (right)
    const s = this.sim.s, nb = (s.chips || []).length; if (!nb) return [];
    const left = 46, right = 70, gap = 5, x0 = F.x + left, bw = (F.w - left - right - (nb - 1) * gap) / nb, top = F.y + 22, h = F.h - 28, out = [];
    const r = Math.max(7, Math.min(13, bw * 0.17, h / 11)), isz = Math.max(9, Math.min(18, bw * 0.24, h / 7));
    for (let b = 0; b < nb; b++) { const x = x0 + b * (bw + gap); out.push({ x, y: top, w: bw, h, r, cx: x + bw * 0.3, lx: x + bw * 0.73, base: top + h - 22 - r * 0.5, step: r * 0.55, isz }); }
    return out;
  },
  binAt(x, y) { const G = this.geo(); for (let b = 0; b < G.bins.length; b++) { const B = G.bins[b]; if (x >= B.x - 3 && x <= B.x + B.w + 3 && y >= B.y - 10 && y <= B.y + B.h + 6) return b; } return -1; },
  stackPos(G) { return [G.felt.x + 23, G.felt.y + G.felt.h - 22]; },
  chipTop(G, b, n) { const B = G.bins[b]; return [B.cx, B.base - n * B.step]; },
  landStep(B) { return Math.max(3, Math.min(B.isz * 0.6, (B.base - B.y - B.isz) / 12)); },

  /* ---------- the frame ---------- */
  update(dt) {
    const ev = Sim.run(this, dt), v = this.v, s = this.sim.s;
    for (const e of ev) this.juice(e);
    v.t += dt; v.pulse = Math.max(0, v.pulse - dt / 0.18); v.tableT += dt; if (v.talk) v.talk.t += dt;
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (v.spinT >= 0) { v.spinT += dt; if (v.spinT > 0.6) v.spinT = -1; }
    if (v.rt >= 0) v.rt += dt;
    this.flights(dt);
    if (v.lastPhase !== s.phase) { this.phaseIn(s.phase); v.lastPhase = s.phase; this._dockSig = ''; }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { this._pend += dt; if (this._pend > 0.25 && (!v.fl.length || this._pend > 2)) { this._ended = true; this.finish(r); } }
  },
  phaseIn(ph) {
    const s = this.sim.s, v = this.v, n = this.level;
    if (ph === 'bet' && n === 0 && s.ti === 0 && !v.thaw && typeof Ghost !== 'undefined' && !v.ghosted.bet) { v.ghosted.bet = 1; Ghost.show({ verb: 'tap', key: 'ArrowUp', at: () => { const G = this.geo(), B = G.bins[0]; return [B.x + B.w / 2, B.y + B.h * 0.55]; }, until: () => this.sim.s.chips.some(x => x > 0) || this.sim.s.phase !== 'bet' }); }
    if (ph === 'bet' && n === 0 && s.ti === 0 && !v.thaw) { this.tip('odds'); setTimeout(() => { if (this.v === v) this.tip('eyes'); }, 2600); }
    if (ph === 'run' && (DC_LV[n].kind === 'islets' || DC_LV[n].kind === 'storm')) v.rt = 0;
  },
  /* ---------- teacher hook (D5 §3 item 10): a 30-bit result code on assignment links (?unit=casino&seed=…) ----------
     bits 0–2 level, 3–5 star mask, then per level:
     L1: 6–29 the twelve bottles, two bits each (0 all orange, 1 all white, 2 still mixed): the class U, pooled;
     L2: 6–12 bottles lost, 13–19 bottles fixed (of 107);
     L3: 6–29 the first six islets' marker copies of table 1 (of 4), four bits each;
     L4: 6–9 mean letters kept, 10–16 H kept %. */
  resultBits(s, level) {
    if (!s) return 0; const n = level == null ? s.level : level, r = this.sim.result(), mask = r ? r.mask & 7 : 0, cl = (x, hi) => Math.max(0, Math.min(hi, Math.round(+x || 0)));
    let b = (n & 7) | (mask << 3); const h = s.hist || [];
    if (n === 0 && h[0]) h[0].out.slice(0, 12).forEach((o, j) => { b |= (cl(o, 2) << (6 + 2 * j)); });
    else if (n === 1 && h[0]) b |= (cl(h[0].lost, 127) << 6) | (cl(h[0].fixed, 127) << 13);
    else if (n === 2 && h[0]) h[0].am.slice(0, 6).forEach((am, j) => { b |= (cl(am, 15) << (6 + 4 * j)); });
    else if (n === 3 && h[0]) b |= (cl(h[0].kept, 15) << 6) | (cl(100 * h[0].H, 127) << 10);
    return b >>> 0;
  },
  teacherStep() {   // teacher strip → step: one generation of whatever is running (pauses it first)
    const s = this.sim.s; if (s.phase !== 'run') return;
    if (!s.paused) Sim.act(this, { k: 'pause', on: true }); Sim.act(this, { k: 'step' });
  },
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, final = n === DC_LV.length - 1, o = { level: n, mask: r.mask, final, interesting: r.interesting };
    if (!s.whatif) {
      if (!final) { o.take = C.captions['take' + n]; o.body = Txt.f(C.captions.edge, { w: (s.won > 0 ? '+' : '') + s.won, e: (r.outcome.exp > 0 ? '+' : '') + r.outcome.exp }); }
      else { const bv = this.bodyVars(); o.take = Txt.f(C.captions.takeBoss, bv); o.body = C.captions.invBody + ' ' + Txt.f(C.captions.edge, { w: (s.won > 0 ? '+' : '') + s.won, e: (r.outcome.exp > 0 ? '+' : '') + r.outcome.exp }) + ' ' + C.body; }
    } else o.body = '';
    const wx = DC_WHY[n]; o.why = { real: wx.real.map(i => C.why.real[i]), maths: wx.maths.map(i => C.why.maths[i]) };   // each level's Why? opens on its own story
    if (!s.whatif) { const last = typeof Freezer !== 'undefined' ? Freezer.list(this.id).slice(-1)[0] : null; if (last) o.whatIf = { gen: last.gen, levers: DC_LV[n].levers }; }
    const spec = this.debrief(); if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    o.stars = { discover: C.captions.sD };   // the "still to earn" line names only stars this level can award
    if (n < 3) o.stars.predict = DC_LV[n].need > 1 ? C.captions.sP2 : C.captions.sP1; else o.stars.transfer = C.captions.sT;
    End.show(this, o);
  },
  bodyVars() { const h = (this.sim.s.hist || [])[0] || { H: 1, kept: 12 }; return { h: Math.round(100 * h.H), l: Math.round(12 - h.kept), k: Math.round(h.kept) }; },

  /* ---------- juice: every Sim.run event gets a visual within a frame; every sound has a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, G = this.geo(), F = typeof Fx !== 'undefined' ? Fx : null;
    if (e.k === 'chip') {
      const [x0, y0] = e.n < 0 ? [G.W / 2, G.felt.y] : this.stackPos(G), B = G.bins[e.b], n = s.chips[e.b] - 1, [x1, y1] = this.chipTop(G, e.b, n);
      v.inb = v.inb || {}; v.inb[e.b] = (v.inb[e.b] || 0) + 1;
      if (F) F.ring(x1, y1, B.r + 6, { ms: 140 });   // telegraph within a frame of the tap
      v.fl.push({ kind: 'chip', x0, y0, x1, y1, t: 0, d: 0, ms: 0.16, r: B.r, done: () => { v.inb[e.b] = Math.max(0, (v.inb[e.b] || 0) - 1); v.flash[e.b] = 1; this.snd('tock', x1, y1); } });
      v.cursor = e.b; this.tip('pills');
    } else if (e.k === 'unchip') {
      const B = G.bins[e.b], [x0, y0] = this.chipTop(G, e.b, s.chips[e.b]), [x1, y1] = this.stackPos(G);
      v.fl.push({ kind: 'chip', x0, y0, x1, y1, t: 0, d: 0, ms: 0.16, r: B.r, done: () => { } }); if (F) F.ring(x0, y0, B.r + 4, { ms: 180 });
    } else if (e.k === 'full') { this.tip('hold'); if (F) { const p = this.stackPos(G); F.ring(p[0], p[1], 22, { ms: 300 }); } }
    else if (e.k === 'fullAlready') this.whisper('full');
    else if (e.k === 'clear') {   // every chip flies home
      const [x1, y1] = this.stackPos(G); let d = 0; v.inb = {};
      e.was.forEach((c, b) => { const B = G.bins[b]; for (let i = c - 1; i >= 0; i--) { const [x0, y0] = this.chipTop(G, b, i); v.fl.push({ kind: 'chip', x0, y0, x1, y1, t: 0, d: (d++) * 0.025, ms: 0.16, r: B.r, done: () => { } }); } });
      this.whisper('cleared'); this.snd('swish', x1, y1);
    }
    else if (e.k === 'same') { v.inb = {}; G.bins.forEach((B, b) => { if (s.chips[b] && F) F.ring(B.cx, B.base - s.chips[b] * B.step, B.r + 6, { ms: 200 }); }); this.whisper('same'); this.snd('tock', G.W / 2, G.felt.y + 20); }
    else if (e.k === 'sameNo' || e.k === 'need') this.whisper('need');
    else if (e.k === 'empty') this.whisper('empty');
    else if (e.k === 'spun') {
      v.spinT = 0;
      if (typeof Whisper !== 'undefined' && Whisper.clear) Whisper.clear(true);   // stale bet-phase whispers must not sit over the first generations
      if (e.last && typeof Freezer !== 'undefined') Freezer.put(this.id, 1 + s.ti, this.sim.snapshot());
      if (F) F.tier(1, () => { }); this.snd('swish', G.felt.x + G.felt.w - 40, G.felt.y + 20);
    }
    else if (e.k === 'run') { v.pulse = 1; if (F) F.burst('dust', G.W / 2, G.scene.y + 30, 4); }
    else if (e.k === 'raft') { v.rt = 0; this.snd('wing', G.W / 2, G.land.y + 20); this.tip('raft'); }
    else if (e.k === 'storm') { v.rt = 0; if (F) { F.tier(3, () => { }); F.shake(4, 300); } this.snd('crack', G.W / 2, G.scene.y + 40); this.tip('storm'); }
    else if (e.k === 'gen') {
      v.pulse = 1; if (e.g % 3 === 0) this.snd('tick', 30, G.top + 12);
      if (e.g % 5 === 0) { const f = s.items.filter(J => DC_LV[s.level].kind === 'buri' ? (J.k === 0 || J.k === 32) : J.out >= 0).length; this.live('liveGen', { g: e.g, f, n: s.items.length }); }
    }
    else if (e.k === 'land') this.landFlight(e, G, v.stag = (v.stag || 0) + 1);
    else if (e.k === 'pin') { const R0 = this.itemRect(G, e.j); if (R0 && F) F.ring(R0.x + R0.w / 2, R0.y + R0.h / 2, Math.max(R0.w, R0.h) * 0.6, { ms: 240 }); if (!v.ghosted.pin) { v.ghosted.pin = 1; this.whisper('pinned'); } }
    else if (e.k === 'settle') {
      v.settleT = 0; const n = e.paid; this.talk(n > 0 ? 'pays' : n < 0 ? 'wins' : DC_LV[s.level].crp);
      if (F) { F.tier(2, () => { }); if (n) F.pop((n > 0 ? '+' : '−') + Math.abs(n), G.felt.x + 72, G.felt.y + 14, n > 0 ? 1 : -1, { size: 22 }); }
      this.live('liveTable', { w: (n > 0 ? '+' : '') + n });
      if (DC_LV[s.level].kind === 'storm' && s.hist[0]) this.live('liveStorm', { k: Math.round(100 * s.hist[0].kept / 12), h: Math.round(100 * s.hist[0].H) });
      if (v.tipLater) { const k = v.tipLater; v.tipLater = null; setTimeout(() => { if (this.v === v) this.tip(k); }, 500); }
    }
    else if (e.k === 'table') { v.tableT = 0; this.resetShown(); v.inb = {}; v.rt = -1; this.talk(DC_LV[s.level].crp); this.snd('swish', G.W / 2, G.top + 30); }
    else if (e.k === 'over') { if (F) F.tier(2, () => { }); }
  },
  landFlight(e, G, stag) {
    const s = this.sim.s, v = this.v, k = G.k, b = e.bin, F = typeof Fx !== 'undefined' ? Fx : null;
    const from = this.itemRect(G, e.j); if (!from) return;
    const B = G.bins[b], n = Math.max(0, s.landed[b] - 1), st = this.landStep(B), d = k === 'buri' ? 0.012 * e.j : Math.min(0.9, 0.07 * (stag - 1));
    const x1 = B.lx, y1 = B.base - 4 - n * st;
    v.gone[e.j] = true; v.pending = (v.pending || 0) + e.pay;
    v.fl.push({ kind: 'item', k, j: e.j, x0: from.x + from.w / 2, y0: from.y + from.h / 2, x1, y1, t: 0, d, ms: k === 'buri' ? 0.5 : 0.45, bin: b, isz: B.isz,
      done: () => {
        v.shown[b] = (v.shown[b] || 0) + 1; v.purse += e.pay; v.pending -= e.pay; v.flash['l' + b] = 1;
        (v.landCol[b] = v.landCol[b] || []).push(this.itemLook(e.j));
        if (k === 'buri') { const c = s.items[e.j].k; v.col[c] = (v.col[c] || 0) + 1; }
        if (F && (k !== 'buri' || e.j % 9 === 0)) { if (e.pay) F.pop((e.pay > 0 ? '+' : '−') + Math.abs(e.pay), x1, y1 - B.isz - 8, e.pay > 0 ? 1 : -1); else F.ring(x1, y1, 10, { ms: 200 }); }
        if (k !== 'buri' || e.j % 6 === 0) this.snd('count', x1, y1);
        const rec = s.tab[s.ti]; if (e.pay < 0 && rec && rec.q[b] > 0 && !v.tipLater) v.tipLater = rec.q[b] < rec.c[b] ? 'harder' : 'spread';   // why a bin you backed can cost you: said when the table settles
      } });
  },
  itemLook(j) {   // what a landed icon shows: the bottle's eye colour (0 orange, 1 white, 2 mixed), or the islet's state
    const s = this.sim.s, k = this.kind(), I = s.items[j]; if (!I) return 2;
    if (k === 'bottles') return I.out; if (k === 'buri') return I.k === 32 ? 0 : I.k === 0 ? 1 : 2; return 2;
  },
  flights(dt) {
    const v = this.v; v.stag = 0;
    for (const key in v.flash) { v.flash[key] -= dt / 0.22; if (v.flash[key] <= 0) delete v.flash[key]; }
    const calm = typeof Fx !== 'undefined' && Fx.calm;   // Calm: flights become short slides (D4 §5)
    for (let i = v.fl.length - 1; i >= 0; i--) { const f = v.fl[i]; if (calm && !f.calm) { f.calm = 1; f.ms = Math.min(f.ms, 0.15); f.d = Math.min(f.d, 0.3); } f.t += dt; if (f.t >= f.d + f.ms) { v.fl.splice(i, 1); try { f.done(); } catch (er) { if (typeof showErr === 'function') showErr(er); } } }
  },
  itemRect(G, j) { if (G.k === 'buri') return this.vialRect(G, j); return G.items ? G.items[j] : null; },

  /* ---------- input: tap a bin to stake a chip (hold or drag one off); tap a bottle to see its flies ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, G = this.geo();
    if (s.phase === 'bet') { const b = this.binAt(x, y); if (b >= 0) { v.press = { x, y, t: v.t, bin: b, drag: false }; return; } }
    if (s.phase === 'settle') { Sim.act(this, { k: 'next' }); return; }
    if (G.k === 'bottles' || G.k === 'buri') {
      for (let j = 0; j < s.items.length; j++) { const R0 = this.itemRect(G, j); if (R0 && x >= R0.x - 3 && x <= R0.x + R0.w + 3 && y >= R0.y - 3 && y <= R0.y + R0.h + 3) { Sim.act(this, { k: 'pin', j }); return; } }
    }
  },
  move(x, y) { const p = this.v.press; if (!p) return; if (!p.drag && Math.abs(x - p.x) + Math.abs(y - p.y) > 12) p.drag = true; p.mx = x; p.my = y; },
  up(x, y) {
    const v = this.v, p = v.press; if (!p) return; v.press = null;
    if (this.sim.s.phase !== 'bet') return;
    if (p.drag) { const b = this.binAt(x, y); if (b >= 0 && b !== p.bin) Sim.act(this, { k: 'move', from: p.bin, to: b }); else if (b < 0) Sim.act(this, { k: 'rem', b: p.bin }); return; }
    if (v.t - p.t >= 0.55) Sim.act(this, { k: 'rem', b: p.bin }); else Sim.act(this, { k: 'add', b: p.bin });   // a hold takes a chip back
  },
  onKey(key) {
    const s = this.sim.s, v = this.v, nb = (s.chips || []).length;
    if (s.phase === 'bet' && nb) {
      if (key === 'ArrowLeft' || key === 'ArrowRight') { v.cursor = (v.cursor + (key === 'ArrowRight' ? 1 : nb - 1)) % nb; v.focus = true; return true; }
      if (key === 'ArrowUp' || key === '+' || key === '=') { v.focus = true; Sim.act(this, { k: 'add', b: v.cursor }); return true; }
      if (key === 'ArrowDown' || key === '-') { v.focus = true; Sim.act(this, { k: 'rem', b: v.cursor }); return true; }
      if (key === 'x' || key === 'X') { Sim.act(this, { k: 'clear' }); return true; }
      if (key === 'a' || key === 'A') { Sim.act(this, { k: 'same' }); return true; }
      if (key === 'Enter') { Sim.act(this, { k: 'spin' }); return true; }
    }
    if (s.phase === 'run' && (key === 'ArrowLeft' || key === 'ArrowRight') && s.items.length && (this.kind() === 'bottles' || this.kind() === 'buri')) { Sim.act(this, { k: 'pin', j: (s.pin + (key === 'ArrowRight' ? 1 : s.items.length - 1)) % s.items.length }); return true; }
    return false;
  },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, W = this.content.whispers, k = this.kind(), ph = s.phase;
    let n = 0; for (const x of s.chips || []) n += x;
    const sig = [ph, n, s.paused, !!s.last].join('|');
    if (sig === this._dockSig) return; this._dockSig = sig;
    const act = a => () => Sim.act(this, a), b = [];
    if (ph === 'bet') {
      // no Clear button (D6 decision 9: one verb). A hold or a drag off the felt takes a chip back; X clears them all
      if (n < 10 && s.last && s.last.length === (s.chips || []).length) b.push({ id: 'same', label: L.same, aria: 'Bet as on the last table', key: 'a', fn: act({ k: 'same' }) });
      b.push({ id: 'spin', label: L.spin, key: ' ', primary: true, disabled: n !== 10, why: W.need, fn: act({ k: 'spin' }) });
    } else if (ph === 'run' && (k === 'bottles' || k === 'buri')) {
      b.push({ id: 'pause', label: s.paused ? L.play : L.pause, key: ' ', pressed: s.paused, fn: () => Sim.act(this, { k: 'pause', on: !this.sim.s.paused }) });
      if (s.paused) b.push({ id: 'step', label: L.step, key: 'n', fn: act({ k: 'step' }) });
    }
    Dock.set(b);
  },
  hud() {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, n = this.level, ph = s.phase;
    let chips = 0; for (const x of s.chips || []) chips += x;
    let t;
    if (s.whatif && ph !== 'over') t = C.whatif;
    else if (ph === 'bet') { if (chips === 10) t = C.spin; else if (n === 0 && s.ti === 0 && chips === 0) t = this.content.firstWords; else t = Txt.f(C['bet' + n], { c: this.chipsTxt(10 - chips), n: s.n }); }
    else if (s.paused) t = C.paused;
    else if (ph === 'run') t = C['run' + n];
    else if (ph === 'settle' || ph === 'over') t = this.keyLine();
    else t = C.over;
    HUD.say(t, this.chipsTxt(Math.round(this.v.purse)));
  },
  keyLine() {   // the level's key number with its one-line meaning, shown as each table settles (D6 decision 9)
    const s = this.sim.s, C = this.content.hud, n = this.level, h = s.hist[s.ti] || s.hist[0];
    if (n === 0) return Txt.f(C.key0, { k: s.items.filter(J => J.out === 0).length });
    if (n === 1) return C.key1;
    if (n === 2) return Txt.f(C.key2, { d: Math.round(100 * DC.sd(s.n)), n: s.n });
    return Txt.f(C.key3, { h: h ? Math.round(100 * h.H) : 0, k: h ? (Math.round(10 * h.kept) / 10).toFixed(1) : 0 });
  },

  /* ---------- drawing ---------- */
  draw(c, W, H) {
    const G = this.geo();
    if (G.k === 'bottles') this.drawBottles(c, G);
    else if (G.k === 'buri') { this.drawBench(c, G); this.drawTray(c, G); this.drawHero(c, G); this.drawHist(c, G); }
    else if (G.k === 'islets') { this.drawSea(c, G, G.sea); this.drawLand(c, G); this.drawCastaways(c, G); }
    else this.drawStorm(c, G);
    this.drawFelt(c, G);
    this.drawFlights(c, G);
    this.drawBanner(c, G);
  },
  /* the fly room: a wooden bench under a window; real fruit-fly bottles (glass, cotton plug, food) */
  drawBench(c, G) {
    const v = this.v, key = G.W + 'x' + G.H + 'b', K = DC_LOOK, S = G.scene;
    const paint = cc => {
      cc.fillStyle = K.wood; cc.fillRect(0, 0, G.W, G.H);   // the casino's mahogany shows only round the edges
      const g = cc.createLinearGradient ? cc.createLinearGradient(0, S.y, 0, S.y + S.h) : null;
      if (g) { g.addColorStop(0, '#E7DDC6'); g.addColorStop(1, K.bench2); cc.fillStyle = g; } else cc.fillStyle = K.bench;
      cc.fillRect(4, S.y, G.W - 8, S.h);
      cc.strokeStyle = 'rgba(78,44,29,0.12)'; cc.lineWidth = 1; for (let y = S.y + 14; y < S.y + S.h; y += 18) { cc.beginPath(); cc.moveTo(4, y); cc.lineTo(G.W - 4, y); cc.stroke(); }
    };
    if (typeof Layer === 'undefined') paint(c);
    else { if (!v.bg || v.bg.key !== key) v.bg = { key, L: Layer(G.W, G.H).redraw(cc => paint(cc)) }; v.bg.L.blit(c, 0, 0); }
  },
  bottle(c, R0, o) {   // a culture bottle: glass, a cotton plug, a layer of yellow food; o.flies: genotypes [[a, b], …] drawn by eye colour
    o = o || {}; const I = this.ink(), K = DC_LOOK, x = R0.x, y = R0.y, w = R0.w, h = R0.h, neck = Math.max(5, h * 0.14), rad = Math.min(10, w * 0.22);
    c.save();
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.beginPath(); c.ellipse(x + w / 2, y + h + 1, w * 0.46, 3, 0, 0, TAU); c.fill();
    rrect(c, x, y + neck, w, h - neck, rad); c.fillStyle = K.glass; c.fill();
    c.fillStyle = K.food; c.fillRect(x + 2, y + h - Math.max(5, h * 0.14), w - 4, Math.max(3, h * 0.14) - 2);
    if (o.flies) this.flyCrowd(c, { x: x + 3, y: y + neck + 3, w: w - 6, h: h - neck - Math.max(5, h * 0.14) - 4 }, o.flies, o.seed || 0);
    rrect(c, x, y + neck, w, h - neck, rad); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(x + 3, y + neck + 5, Math.max(2, w * 0.07), (h - neck) * 0.5);
    rrect(c, x + w * 0.2, y, w * 0.6, neck + 3, 4); c.fillStyle = K.plug; c.fill(); c.lineWidth = 1.2; c.stroke();   // the cotton plug
    c.restore();
  },
  flyCrowd(c, B, flies, seed) {   // flies in a bottle, eye colour = genotype (Rig 'fruitfly'); jittered so they look alive
    const v = this.v, n = flies.length, cols = Math.max(1, Math.round(Math.sqrt(n * B.w / Math.max(1, B.h)))), rows = Math.ceil(n / cols), p = Math.min(B.w / cols, B.h / rows), sz = Math.max(9, Math.min(26, p * 0.95));
    flies.forEach((g, i) => {
      const h1 = (((i + 1) * 2654435761 + seed * 97) >>> 0) / 4294967296, h2 = (((i + 7) * 40503 * 2246822519 + seed * 31) >>> 0) / 4294967296;
      const x = B.x + (B.w - cols * p) / 2 + (i % cols + 0.25 + 0.5 * h1) * p + 0.8 * Det.sin(v.t * (0.9 + h2) + i), y = B.y + (B.h - rows * p) / 2 + (Math.floor(i / cols) + 0.25 + 0.5 * h2) * p + 0.8 * Det.cos(v.t * (0.8 + h1) + 2 * i);
      if (typeof Rig !== 'undefined' && Rig.has('fruitfly')) Rig.draw(c, 'fruitfly', { eye: g[0] + g[1], sex: i % 2 ? 'm' : 'f' }, x, y, { size: i % 2 ? sz * 0.86 : sz, rot: (h1 - 0.5) * 2.4, id: seed * 100 + i });
      else { c.fillStyle = ['#F2EEE6', '#EBC39A', '#D98E4A'][g[0] + g[1]]; c.beginPath(); c.arc(x, y, sz * 0.3, 0, TAU); c.fill(); }
    });
  },
  fliesOf(k, N, seed) {   // k bw75 copies among N, paired into flies in a fixed per-bottle order (cosmetic; the sim holds only k)
    const ord = []; for (let i = 0; i < N; i++) ord.push(i);
    let u = (seed * 2654435761 + 12345) >>> 0; for (let i = N - 1; i > 0; i--) { u = (u * 1664525 + 1013904223) >>> 0; const j = u % (i + 1), t = ord[i]; ord[i] = ord[j]; ord[j] = t; }
    const fl = []; for (let i = 0; i + 1 < N; i += 2) fl.push([ord[i] < k ? 1 : 0, ord[i + 1] < k ? 1 : 0]);
    return fl;
  },
  poolBar(c, x, y, w, f) {   // the gene-pool read-out beside the biology: blue bw75 copies, amber bw copies
    const I = this.ink(); c.save(); rrect(c, x, y, w, 6, 3); c.fillStyle = this.inka(); c.fill();
    if (f > 0) { c.save(); rrect(c, x, y, w, 6, 3); c.clip(); c.fillStyle = this.inkA(); c.fillRect(x, y, w * f, 6); c.restore(); }
    rrect(c, x, y, w, 6, 3); c.lineWidth = 1; c.strokeStyle = I; c.stroke(); c.restore();
  },
  drawBottles(c, G) {
    const s = this.sim.s, v = this.v, L = this.content.labels, I = this.ink();
    this.drawBench(c, G);
    const showN = Math.min(s.N, 20);   // a bottle of 50 flies (What if?) shows a sample of ten, drawn by its share
    s.items.forEach((J, j) => {
      const R0 = G.items[j]; if (!R0) return;
      const f = J.k / s.N, kk = Math.round(f * showN), pulse = v.pulse > 0 && J.out < 0 ? 1 + 0.015 * v.pulse : 1;
      if (s.pin === j && v.ghosted.pin) { c.save(); c.lineWidth = 4; c.strokeStyle = I; rrect(c, R0.x - 4, R0.y - 4, R0.w + 8, R0.h + 8, 10); c.stroke(); c.restore(); }
      this.bottle(c, { x: R0.x, y: R0.y, w: R0.w * pulse, h: R0.h }, { flies: this.fliesOf(kk, showN, j * 131 + s.gen * 7), seed: j });
      this.poolBar(c, R0.x + 3, R0.y + R0.h + 5, R0.w - 6, f);
      if (J.out >= 0) this.lbl('tag' + j, [L.bw75, L.bw, L.mixTag][J.out], R0.x + R0.w / 2, R0.y + R0.h * 0.07, { size: 12, mono: true, bg: ['#C9D6F5', '#F5E2A0', 'rgba(244,238,221,.9)'][J.out] });   // a settled bottle's tag sits on its plug
    });
    const S = G.scene;
    this.lbl('gen', Txt.f(L.gen, { n: s.gen, m: s.T }), 12, S.y + 10, { size: 12, align: 'left', mono: true });
    this.lbl('flies', Txt.f(L.flies, { n: s.N / 2 }), G.W - 12, S.y + 10, { size: 12, align: 'right' });
    if (s.phase === 'settle' || s.phase === 'over') this.lbl('key', L.pfix, G.W / 2, S.y + S.h - 12, { size: 14, weight: 700, bg: '#FFF7E0' });   // the key number, once the bottles have settled
  },
  /* ---------- L2: Buri's 107 bottles, the pinned bottle's flies, the generation-19 histogram ---------- */
  trayGrid(G) { const T = G.tray, n = DC_BURI.bottles, cols = Math.max(6, Math.round(Math.sqrt(n * T.w / (T.h - 18)))), rows = Math.ceil(n / cols), p = Math.min(T.w / cols, (T.h - 18) / rows); return { cols, rows, p, ox: T.x + (T.w - cols * p) / 2, oy: T.y + 16 + (T.h - 18 - rows * p) / 2 }; },
  vialRect(G, j) { const g = this.trayGrid(G), c = j % g.cols, r = Math.floor(j / g.cols), w = g.p * 0.6, h = g.p * 0.88; return { x: g.ox + c * g.p + (g.p - w) / 2, y: g.oy + r * g.p + (g.p - h) / 2, w, h }; },
  miniBottle(c, x, y, w, h, look) {   // a tiny culture bottle whose dot is its flies' eye colour: orange (all bw75), white (all bw), or mixed
    const I = this.ink(), K = DC_LOOK, E = ['#D98E4A', '#F2EEE6', '#EBC39A']; c.save();
    rrect(c, x, y + h * 0.18, w, h * 0.82, Math.min(3, w / 3)); c.fillStyle = K.glass; c.fill(); c.lineWidth = 1; c.strokeStyle = I; c.stroke();
    c.fillStyle = K.plug; c.fillRect(x + w * 0.2, y, w * 0.6, h * 0.2);
    const r = Math.max(1.6, Math.min(w, h) * 0.28);
    if (look === 2) { c.fillStyle = E[0]; c.beginPath(); c.arc(x + w * 0.5 - r * 0.55, y + h * 0.58, r * 0.8, 0, TAU); c.fill(); c.fillStyle = E[1]; c.beginPath(); c.arc(x + w * 0.5 + r * 0.55, y + h * 0.58, r * 0.8, 0, TAU); c.fill(); }
    else { c.fillStyle = E[look]; c.beginPath(); c.arc(x + w / 2, y + h * 0.58, r, 0, TAU); c.fill(); }
    c.lineWidth = 0.8; c.strokeStyle = 'rgba(27,22,18,0.6)'; c.stroke();
    c.restore();
  },
  drawTray(c, G) {
    const s = this.sim.s, v = this.v, T = G.tray, L = this.content.labels;
    c.save(); rrect(c, T.x, T.y, T.w, T.h, 10); c.fillStyle = 'rgba(78,44,29,0.12)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(78,44,29,0.5)'; c.stroke(); c.restore();
    s.items.forEach((B, j) => {
      const R0 = this.vialRect(G, j);
      if (s.pin === j) { c.save(); c.lineWidth = 3; c.strokeStyle = this.ink(); c.strokeRect(R0.x - 2, R0.y - 2, R0.w + 4, R0.h + 4); c.restore(); }
      this.miniBottle(c, R0.x, R0.y, R0.w, R0.h, B.k === 32 ? 0 : B.k === 0 ? 1 : 2);
    });
    this.lbl('gen', Txt.f(L.gen, { n: s.gen, m: s.T }), T.x + 6, T.y + 4, { size: 12, align: 'left', base: 'top', mono: true });
  },
  drawHero(c, G) {   // the pinned bottle, close up: 16 flies whose eyes show their genotypes; dots: each fly's young last generation
    const s = this.sim.s, v = this.v, R0 = G.hero, B = s.items[s.pin] || s.items[0], I = this.ink(), L = this.content.labels;
    const bx = R0.x + 6, by = R0.y + 22, bw = R0.w - 12, bh = R0.h - 44;
    this.bottle(c, { x: bx, y: by - 10, w: bw, h: bh + 10 });
    const fl = B.b.m.concat(B.b.f), sz = Math.max(12, Math.min(26, Math.min(bw, bh - 14) / 5.2)), kids = this.broods(s.pin * 131 + s.gen, s.mode || 'w');
    fl.forEach((g, i) => {   // a jittered 4 × 4 grid, so the 16 flies can be counted and their eyes read
      const h1 = ((i * 2654435761) >>> 0) / 4294967296, h2 = (((i + 5) * 40503 * 2246822519) >>> 0) / 4294967296;
      const fx = ((i % 4) + 0.2 + 0.6 * h1) / 4 + 0.015 * Det.sin(v.t * (0.7 + h2) + i), fy = (Math.floor(i / 4) + 0.2 + 0.6 * h2) / 4 + 0.015 * Det.cos(v.t * (0.6 + h1) + 2 * i);
      const x = bx + sz * 0.5 + (bw - sz) * fx, y = by + sz * 0.5 + (bh - 18 - sz) * fy;
      if (typeof Rig !== 'undefined' && Rig.has('fruitfly')) Rig.draw(c, 'fruitfly', { eye: g[0] + g[1], sex: i < 8 ? 'm' : 'f' }, x, y, { size: i < 8 ? sz * 0.86 : sz, rot: Det.sin(i * 1.7 + v.t * 0.3) * 0.5, id: i });
      const k = Math.min(6, kids[i]), d = Math.max(2, sz * 0.09);
      for (let q = 0; q < k; q++) { c.beginPath(); c.arc(x - (k - 1) * d * 1.3 + q * d * 2.6, y + sz * 0.62, d, 0, TAU); c.fillStyle = this.paper(); c.fill(); c.lineWidth = 1; c.strokeStyle = I; c.stroke(); }
    });
    this.poolBar(c, bx + 4, R0.y + R0.h - 16, bw - 8, B.k / 32);
    this.lbl('pin', s.phase === 'bet' ? L.young : L.yourBottle, R0.x + R0.w / 2, R0.y + 8, { size: 12 });
  },
  broods(seed, mode) {   // cosmetic: one generation of young per fly under the model's fertility weights (a local generator, never R())
    let u = (seed * 2654435761 + 12345) >>> 0; const rnd = () => { u = (u * 1664525 + 1013904223) >>> 0; return u / 4294967296; };
    const W = DC.W(mode), w = []; for (let i = 0; i < 16; i++) w.push(W ? W[Math.floor(rnd() * W.length)] : 1);
    const out = new Array(16).fill(0);
    if (!W) { for (let i = 0; i < 16; i++) out[i] = 2; return out; }
    for (let kid = 0; kid < 16; kid++) for (const off of [0, 8]) { let tot = 0; for (let i = 0; i < 8; i++) tot += w[off + i]; let x = rnd() * tot, i = 0; while (i < 7 && x >= w[off + i]) { x -= w[off + i]; i++; } out[off + i]++; }
    return out;
  },
  drawHist(c, G) {   // the U builds from the bottles themselves: each lands in the column of its bw75 count (0–32); dashed: 16 ideal flies
    const s = this.sim.s, v = this.v, Hg = G.hist, I = this.ink(), cw = Hg.w / 33, y1 = Hg.y + Hg.h - 2, bh = Math.min(5, (Hg.h - 14) / 22), P = DC.chain(32, 16, DC_BURI.T)[DC_BURI.T], E = ['#D98E4A', '#F2EEE6'];
    c.save(); rrect(c, Hg.x - 6, Hg.y - 4, Hg.w + 12, Hg.h + 6, 8); c.fillStyle = 'rgba(78,44,29,0.1)'; c.fill(); c.restore();
    for (let k = 0; k <= 32; k++) { const n = (v.col && v.col[k]) || 0, x = Hg.x + k * cw; for (let i = 0; i < n; i++) { const y = y1 - (i + 1) * bh; c.fillStyle = k === 32 ? E[0] : k === 0 ? E[1] : '#B9A27A'; c.fillRect(x + 0.5, Math.max(Hg.y + 12, y), cw - 1, bh - 0.8); } }
    c.save(); c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = I; c.beginPath();
    for (let k = 0; k <= 32; k++) { const y = y1 - P[k] * DC_BURI.bottles * bh, x = Hg.x + k * cw; if (k) c.lineTo(x, y); else c.moveTo(x, y); c.lineTo(x + cw, y); }
    c.stroke(); c.restore();
    c.strokeStyle = 'rgba(27,22,18,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(Hg.x, y1 + 0.5); c.lineTo(Hg.x + Hg.w, y1 + 0.5); c.stroke();
    this.lbl('sixteen', this.content.labels.sixteen, Hg.x + Hg.w / 2, Hg.y + 4, { size: 12, base: 'top', pill: false, ink: I });
    if (s.phase === 'settle' || s.phase === 'over') this.lbl('key', this.content.labels.ne, Hg.x + Hg.w - 4, Hg.y + 4, { size: 13, weight: 700, align: 'right', base: 'top', bg: '#FFF7E0' });
  },
  /* ---------- L3: the castaways: the mainland beach, rafts of vegetation, islets at sea ---------- */
  drawSea(c, G, S) {
    const v = this.v, K = DC_LOOK;
    c.fillStyle = K.sea; c.fillRect(S.x, S.y, S.w, S.h);
    c.strokeStyle = 'rgba(232,223,201,0.18)'; c.lineWidth = 1.5; c.beginPath(); for (let y = S.y + 16; y < S.y + S.h; y += 22) for (let x = (y * 7) % 40; x < S.w; x += 60) { c.moveTo(x, y); c.quadraticCurveTo(x + 8, y - 4 + 2 * Det.sin(v.t + x), x + 16, y); } c.stroke();
  },
  islet(c, R0, i) {   // a sandy islet with a tuft of scrub (natural paint), seeded by its index so it never flickers
    const I = this.ink(), K = DC_LOOK, cx = R0.x + R0.w / 2, cy = R0.y + R0.h / 2, h1 = ((i * 2654435761) >>> 0) / 4294967296;
    c.save(); c.beginPath(); c.ellipse(cx, cy, R0.w / 2 + 3, R0.h / 2 + 3, 0, 0, TAU); c.fillStyle = 'rgba(241,230,200,0.18)'; c.fill();   // surf
    c.beginPath(); c.ellipse(cx, cy, R0.w / 2, R0.h / 2, 0, 0, TAU); c.fillStyle = K.sand; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I; c.stroke();
    c.fillStyle = K.scrub; c.beginPath(); c.ellipse(cx + (h1 - 0.5) * R0.w * 0.5, cy - R0.h * 0.22, R0.w * 0.14, R0.h * 0.18, 0, 0, TAU); c.ellipse(cx + (h1 - 0.5) * R0.w * 0.5 + R0.w * 0.1, cy - R0.h * 0.16, R0.w * 0.09, R0.h * 0.14, 0, 0, TAU); c.fill();
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
  badge(c, x, y, r, g, multi) { if (typeof Pal !== 'undefined') Pal.genotype(c, x, y, r, g[0], g[1], multi ? { multi: true } : { letter: '' }); },   // the read-out: a lizard's two copies
  raft(c, x, y, w, rot) {   // a floating mat of vegetation: a log with leafy branches (natural paint)
    const I = this.ink(), K = DC_LOOK; c.save(); c.translate(x, y); c.rotate(rot || 0);
    c.fillStyle = K.raft; c.beginPath(); c.ellipse(0, 0, w / 2, w * 0.13, 0, 0, TAU); c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke();
    c.fillStyle = K.scrub; for (const dx of [-0.35, -0.05, 0.25]) { c.beginPath(); c.ellipse(dx * w, -w * 0.1, w * 0.14, w * 0.08, 0.3, 0, TAU); c.fill(); }
    c.restore();
  },
  drawLand(c, G) {
    const s = this.sim.s, v = this.v, Lr = G.land, L = this.content.labels, K = DC_LOOK;
    c.fillStyle = K.sand; c.beginPath(); c.moveTo(0, Lr.y + 8); for (let x = 0; x <= G.W; x += 20) c.lineTo(x, Lr.y + 6 + 4 * Det.sin(x * 0.05 + v.t * 0.8)); c.lineTo(G.W, Lr.y + Lr.h); c.lineTo(0, Lr.y + Lr.h); c.closePath(); c.fill();
    c.fillStyle = K.scrub; for (let i = 0; i < 9; i++) { const h1 = ((i * 2246822519) >>> 0) / 4294967296; c.beginPath(); c.ellipse(G.W * (i + 0.5) / 9 + (h1 - 0.5) * 30, Lr.y + Lr.h - 6 - h1 * 8, 18 + h1 * 14, 6 + h1 * 4, 0, 0, TAU); c.fill(); }
    const sz = Math.max(18, Math.min(30, 0.06 * G.u)), n = 24;
    for (let i = 0; i < n; i++) { const h1 = ((i * 2654435761) >>> 0) / 4294967296, h2 = (((i + 3) * 40503 * 2246822519) >>> 0) / 4294967296; this.lizard(c, 14 + (G.W - 28) * h1, Lr.y + 22 + (Lr.h - 34) * h2 + Det.sin(v.t * 1.3 + i) * 0.6, sz * 1.5, (h1 - 0.5) * 2 + (i % 2 ? Math.PI : 0), { male: i % 3 === 0, dark: h2 > 0.6 ? 0.3 : 0 }); }
    this.lbl('main', L.mainland, 12, Lr.y + 16, { size: 12, align: 'left' });
    this.lbl('main2', Txt.f(L.marker, { n: 50 }), G.W - 12, Lr.y + 16, { size: 12, align: 'right', bg: '#F5E2A0' });
  },
  drawCastaways(c, G) {   // each islet, and once the rafts have landed its founders with their two copies as badges
    const s = this.sim.s, v = this.v, rt = v.rt, from = [G.W / 2, G.land.y + 14];
    G.items.forEach((R0, i) => {
      this.islet(c, R0, i);
      const I0 = s.items[i]; if (!I0) return;
      const ta = DC_T.raft + DC_T.land * i - 0.08, here = I0.landed || s.phase === 'settle' || s.phase === 'over' || (rt >= ta && s.phase === 'run');
      const cx = R0.x + R0.w / 2, cy = R0.y + R0.h / 2;
      if (!here && s.phase === 'run' && rt >= 0) {   // the raft on its way, founders aboard
        const td = 0.1 + 0.03 * i; if (rt < td) return; const p = Math.min(1, (rt - td) / Math.max(0.1, ta - td)), x = from[0] + (cx - from[0]) * p, y = from[1] + (cy - from[1]) * p;
        const w = Math.min(46, R0.w * 0.6); this.raft(c, x, y, w, 0.2 * Det.sin(v.t * 3 + i));
        const m = Math.min(I0.g.length, 4); for (let f = 0; f < m; f++) this.lizard(c, x + (f - (m - 1) / 2) * w * 0.22, y - w * 0.08, Math.max(12, w * 0.42), -0.3, { male: f % 2 === 0 });
        return;
      }
      if (!here) return;
      const n = I0.g.length, show = Math.min(n, 4), lz = Math.max(12, Math.min(28, R0.w / (show + 0.7))), small = n <= 2;   // up to four founders drawn as lizards; the gene pool beside them
      for (let f = 0; f < show; f++) {
        const x = cx + (f - (show - 1) / 2) * lz * 0.9, y = cy - (small ? 4 : 0);
        this.lizard(c, x, y, lz, -Math.PI / 2 + 0.3 * Det.sin(v.t + f + i), { male: f % 2 === 0 });
        if (small) this.badge(c, x, y + lz * 0.5, Math.max(5, Math.min(8, lz * 0.3)), I0.g[f]);   // two founders: each one's two copies, plainly
      }
      if (n > show) this.lbl('nn' + i, '×' + n, R0.x + R0.w - 2, R0.y + 2, { size: 12, mono: true, align: 'right' });
      this.poolBar(c, R0.x + 4, R0.y + R0.h + 3, R0.w - 8, 1 - I0.share);
      this.lbl('is' + i, Math.round(100 * I0.share) + '%', cx, R0.y + R0.h + 18, { size: 12, mono: true });
    });
  },
  /* ---------- L4: the hurricane: twelve anole islets; a storm sweeps them; four survivors each, with their letters ---------- */
  crowdOn(c, R0, i, alpha) {   // a busy islet before the storm (natural paint)
    if (alpha <= 0) return; c.save(); c.globalAlpha = alpha;
    for (let q = 0; q < 14; q++) { const h1 = (((i * 31 + q) * 2654435761) >>> 0) / 4294967296, h2 = ((((i * 31 + q) + 11) * 40503 * 2246822519) >>> 0) / 4294967296; this.lizard(c, R0.x + R0.w * (0.18 + 0.64 * h1), R0.y + R0.h * (0.25 + 0.55 * h2), Math.max(9, Math.min(16, R0.w * 0.13)), (h1 - 0.5) * 6, { male: q % 3 === 0, dark: h2 > 0.55 ? 0.3 : 0 }); }
    c.restore();
  },
  drawStorm(c, G) {
    const s = this.sim.s, v = this.v, L = this.content.labels, rt = v.rt, struck = s.phase !== 'bet', sweep = struck && rt >= 0 ? Math.min(1, rt / DC_T.storm) : struck ? 1 : 0, calm = typeof Fx !== 'undefined' && Fx.calm;
    this.drawSea(c, G, G.sea);
    G.items.forEach((R0, i) => {
      this.islet(c, R0, i);
      const I0 = s.items[i], hitAt = (R0.x + R0.w / 2) / G.W, gone = struck ? Math.max(0, Math.min(1, (sweep * 1.3 - hitAt) * 4)) : 0;
      this.crowdOn(c, R0, i, 1 - gone);
      if (I0 && gone >= 1) {   // the survivors and their letters (the read-out beside the biology)
        const n = I0.surv.length, lz = Math.max(12, Math.min(26, R0.w / (n + 0.8))), r = Math.max(6, Math.min(10, lz * 0.42));
        I0.surv.forEach((g, f) => { const x = R0.x + R0.w * (f + 1) / (n + 1), y = R0.y + R0.h * 0.42; this.lizard(c, x, y, lz, -Math.PI / 2 + 0.2 * Det.sin(v.t * 0.8 + f), { male: f % 2 === 0 }); this.badge(c, x, y + lz * 0.55, r, g, true); });
        this.lbl('kl' + i, I0.kept + ' / 12', R0.x + R0.w / 2, R0.y + R0.h + 9, { size: 12, mono: true });
      }
    });
    if (struck && sweep < 1 && !calm) {   // the hurricane: a dark wall of cloud and rain moving across
      const x = -G.W * 0.3 + sweep * G.W * 1.3; c.save(); c.globalAlpha = 0.55; c.fillStyle = DC_LOOK.storm;
      for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(x + k * 28 - 50, G.sea.y + 20 + (k % 2) * 16, 46, 0, TAU); c.fill(); }
      c.strokeStyle = 'rgba(232,223,201,0.5)'; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k < 40; k++) { const rx = x - 120 + (k * 37) % 240, ry = G.sea.y + ((k * 53 + v.t * 600) % G.sea.h); c.moveTo(rx, ry); c.lineTo(rx - 10, ry + 18); } c.stroke(); c.restore();
    }
    if (s.phase === 'settle' || s.phase === 'over') {   // the key comparison, plainly: letters kept against heterozygosity kept
      const h = s.hist[0], y = G.sea.y + G.sea.h - 14; if (h) { this.lbl('hk', Txt.f(L.hKept, { n: Math.round(100 * h.H) }), G.W / 2 - 8, y, { size: 14, weight: 700, align: 'right', bg: '#FFF7E0' }); this.lbl('lk', Txt.f(L.lKept, { n: Math.round(100 * h.kept / 12) }), G.W / 2 + 8, y, { size: 14, weight: 700, align: 'left', bg: '#FFF7E0' }); }
    }
  },
  /* ---------- the casino framing: a slim felt strip of bins, your chips, the croupier ---------- */
  drawFelt(c, G) {
    const s = this.sim.s, v = this.v, F = G.felt, I = this.ink(), L = this.content.labels, keys = DC_BINS[DC_LV[s.level].bins], K = DC_LOOK;
    c.save(); rrect(c, F.x - 4, F.y - 4, F.w + 8, F.h + 8, 14); c.fillStyle = K.wood2; c.fill(); c.lineWidth = 2; c.strokeStyle = K.brass; c.stroke();
    rrect(c, F.x, F.y, F.w, F.h, 10); c.fillStyle = K.felt; c.fill(); c.restore();
    const nt = DC_LV[s.level].tables.length, hint = L['hint' + s.level]; let hx = F.x + 10;
    if (nt > 1) { const bx = this.lbl('table', Txt.f(L.table, { n: s.ti + 1, m: nt }), hx, F.y + 10, { size: 12, align: 'left' }); if (bx) hx = bx.x + bx.w + 8; }
    if (hint) this.lbl('hint', hint, hx, F.y + 10, { size: 12, align: 'left', pill: false, ink: K.cream });   // what the bins count
    const odds = s.phase === 'bet' || !s.tab[s.ti] ? s.odds : s.tab[s.ti].c;
    G.bins.forEach((B, b) => {
      if (b > 0) { c.save(); c.setLineDash([3, 5]); c.strokeStyle = 'rgba(232,223,201,0.3)'; c.lineWidth = 1; c.beginPath(); c.moveTo(B.x - 3, B.y); c.lineTo(B.x - 3, B.y + B.h - 4); c.stroke(); c.restore(); }
      const gh = (odds[b] || 0) * 10 * B.step;   // the croupier's odds: a dashed ghost stack
      if (gh > 0.5) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(232,223,201,0.75)'; c.strokeRect(B.cx - B.r - 3, B.base + B.r * 0.45 - gh - B.r * 0.4, 2 * B.r + 6, gh + B.r * 0.4); c.restore(); }
      const nIn = (v.inb && v.inb[b]) || 0, n = Math.max(0, s.chips[b] - nIn), fl = v.flash[b] || 0;
      for (let i = 0; i < n; i++) this.chip(c, B.cx, B.base - i * B.step - (i === n - 1 ? fl * 3 : 0), B.r);
      if (n) this.lbl('n' + b, String(n), B.cx, B.base - n * B.step - B.r - 6, { size: 12, mono: true });
      const m = v.shown[b] || 0, st = this.landStep(B), lf = v.flash['l' + b] || 0, cols = v.landCol[b] || [];
      for (let i = 0; i < m; i++) this.icon(c, B.lx, B.base - 4 - i * st - (i === m - 1 ? lf * 3 : 0), G.k, cols[i], B.isz);
      if (m) this.lbl('m' + b, String(m), B.lx, Math.max(B.y + 2, B.base - 4 - m * st - B.isz - 6), { size: 12, mono: true, bg: '#EAD8A8' });
      if (v.focus && v.cursor === b && s.phase === 'bet') { c.save(); c.lineWidth = 2.5; c.strokeStyle = this.paper(); c.setLineDash([5, 3]); c.strokeRect(B.x - 2, B.y - 2, B.w + 4, B.h + 2); c.restore(); }
      this.lbl('b' + b, L[keys[b]], B.x + B.w / 2, B.y + B.h - 6, { size: 12, pill: false, ink: K.cream });
    });
    let placed = 0; for (const x of s.chips || []) placed += x;
    const [sx, sy] = this.stackPos(G); for (let i = 0; i < 10 - placed; i++) this.chip(c, sx, sy - i * 4, 10);
    this.croupier(c, F.x + F.w - 34, F.y + F.h - 6, Math.min(F.h - 20, 50));
  },
  chip(c, x, y, r) {   // a casino chip: burgundy, cream edge spots and inlay, ink rim (your stake; never a data ink)
    const I = this.ink(), K = DC_LOOK;
    c.save(); c.beginPath(); c.ellipse(x, y + r * 0.22, r, r * 0.62, 0, 0, TAU); c.fillStyle = K.chipD; c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke();
    c.beginPath(); c.ellipse(x, y, r, r * 0.62, 0, 0, TAU); c.fillStyle = K.chip; c.fill(); c.lineWidth = 1.4; c.stroke();
    c.setLineDash([r * 0.32, r * 0.5]); c.beginPath(); c.ellipse(x, y, r * 0.84, r * 0.5, 0, 0, TAU); c.lineWidth = Math.max(1.5, r * 0.2); c.strokeStyle = K.cream; c.stroke();
    c.setLineDash([2.5, 2.5]); c.beginPath(); c.ellipse(x, y, r * 0.5, r * 0.29, 0, 0, TAU); c.lineWidth = 1.1; c.stroke(); c.restore();
  },
  icon(c, x, y, k, look, sz) {   // a finished population stacked in its bin: a little bottle with its eye colour, or an islet
    const z = sz || 12;
    if (k === 'bottles' || k === 'buri') { this.miniBottle(c, x - z * 0.32, y - z * 0.5, z * 0.64, z, look == null ? 2 : look); return; }
    const I = this.ink(); c.save(); c.beginPath(); c.ellipse(x, y, z * 0.75, z * 0.36, 0, 0, TAU); c.fillStyle = DC_LOOK.sand; c.fill(); c.lineWidth = 1.2; c.strokeStyle = I; c.stroke();
    c.fillStyle = DC_LOOK.scrub; c.beginPath(); c.ellipse(x - z * 0.15, y - z * 0.05, z * 0.3, z * 0.14, 0, 0, TAU); c.fill(); c.restore();
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
    if (v.talk && v.talk.text) { const b = v.talk.t < 0.3 ? 1 + 0.15 * Det.sin(v.talk.t / 0.3 * Math.PI) : 1; this.lbl('talk', v.talk.text, x, base - h - 12, { size: Math.round(12 * b), align: 'right', bg: '#FFF7E0' }); }
  },
  drawFlights(c, G) {
    const v = this.v, s = this.sim.s;
    for (const f of v.fl) {
      if (f.t < f.d) continue; const p = Math.min(1, (f.t - f.d) / f.ms), e = p < 0.5 ? 4 * p * p * p : 1 - (2 - 2 * p) * (2 - 2 * p) * (2 - 2 * p) / 2;
      const calm = typeof Fx !== 'undefined' && Fx.calm, x = f.x0 + (f.x1 - f.x0) * e, y = f.y0 + (f.y1 - f.y0) * e - (calm ? 0 : Det.sin(e * Math.PI) * 40);
      if (f.kind === 'chip') this.chip(c, x, y, f.r);
      else this.icon(c, x, y, f.k, this.itemLook(f.j), f.isz * (1 + 0.6 * (1 - e)));
    }
  },
  drawBanner(c, G) {
    const b = this.v.banner; if (!b) return; const a = Math.min(1, b.t / 200, (b.ms - b.t) / 250); if (a <= 0) return;
    c.save(); c.globalAlpha = a; this.lbl('banner', b.text, G.W / 2, G.top + G.A * 0.36, { size: 22, weight: 700 }); c.restore();
  },

  /* ---------- the live graph (strip) and the level card's debrief ---------- */
  tr(title, x, y, extra) { return Object.assign({ type: 'trace', title, x, y, series: [], ghost: [], frame: 'designed' }, extra || {}); },
  flat(v, n) { const d = []; for (let t = 0; t <= n; t++) d.push(v); return d; },
  meanTr(items) { const n = items[0] ? items[0].tr.length : 0, out = []; for (let t = 0; t < n; t++) { let m = 0; for (const J of items) m += J.tr[t]; out.push(m / items.length); } return out; },
  small() { return typeof Strip !== 'undefined' && !!Strip.phone && Strip.phone() && !Strip.isOpen; },   // the folded phone strip: one chart, short labels
  notes(full) {   // full: the level card's chart (never the folded-strip version)
    const s = this.sim.s, L = this.content.labels, C = this.content.captions, k = this.kind(), charts = [], stats = [], sm = !full && this.small(), EXP = sm ? L.exp : L.expected;
    const purse = this.tr(L.tPurse, { lo: 0, hi: 2, label: 'table' }, { lo: 0, hi: Math.max(160, Math.ceil((s.purse + 20) / 40) * 40) }, { series: [{ d: [100].concat((s.hist || []).filter(Boolean).map(h => h.purse)).concat(s.phase === 'settle' || s.phase === 'over' ? [] : [s.purse]), ink: 'ink', label: L.tPurse }] });
    if (k === 'bottles') {
      const pin = s.items[s.pin] || s.items[0], x = { lo: 0, hi: s.T + 2, label: L.axGen };
      const sh = this.tr(L.tShare, x, { lo: 0, hi: 1, fmt: 'pct' }, { fan: s.items.map(J => J.tr), series: [{ d: this.meanTr(s.items), ink: 'ink', label: sm ? L.avg : L.average }, { d: pin.tr, ink: 'A', you: true, label: sm ? L.bottle : L.yourBottle }] });
      if (s.phase === 'settle' || s.phase === 'over') sh.ghost = [{ d: this.flat(s.p0, s.T), label: EXP }];
      charts.push(sh, purse);
      stats.push([L.tPurse, String(s.purse), C.mPurse], ['Settled', s.items.filter(J => J.out >= 0).length + ' of ' + s.items.length, C.mSettled]);
    } else if (k === 'buri') {
      const H = this.tr(L.tH, { lo: 0, hi: DC_BURI.T + 2, label: L.axGen }, { lo: 0, hi: 0.55 }, { series: [{ d: s.Hs, ink: 'drift', label: sm ? 'H' : 'bottles' }], ghost: [{ d: [...Array(DC_BURI.T + 1)].map((_, t) => DC.ghost16(t)), label: L.sixteen }] });
      if (s.phase === 'settle' || s.phase === 'over') H.ghost.push({ d: DC.buriMC(s.mode || 'w').H, label: EXP });
      charts.push(H, purse);
      stats.push([L.tH, (s.Hs[s.Hs.length - 1] || 0).toFixed(3), C.mH]);
    } else if (k === 'islets') {
      const pts = (s.hist || []).filter(Boolean).map(h => [h.n, h.gap]).sort((a, b) => a[0] - b[0]), hi = Math.max(12, ...pts.map(p => p[0]));
      const near = this.tr(L.tNear, { lo: 0, hi, label: L.axFounders }, { lo: 0, hi: 0.5, fmt: 'pct' }, { series: pts.length ? [{ d: pts, ink: 'ink', label: 'islets' }] : [] });
      if (pts.length) { const g = []; for (let n = 1; n <= hi; n += n < 12 ? 1 : 4) g.push([n, DC.gap(n)]); near.ghost = [{ d: g, label: EXP }]; }
      charts.push(near, purse);
      stats.push([L.tPurse, String(s.purse), C.mPurse], [L.tNear, pts.map(p => p[0] + ': ' + Math.round(100 * p[1]) + ' points').join(', ') || '–', C.mNear]);
    } else {
      const h = (s.phase === 'settle' || s.phase === 'over') ? s.hist[0] : null, x = { lo: 0, hi: 1.2, label: L.axStorm, fmt: v => Math.abs(v) < 1e-6 ? L.before : Math.abs(v - 1) < 1e-6 ? L.after : '' };
      const kept = this.tr(L.tKept, x, { lo: 0, hi: 1, fmt: 'pct' }, { series: h ? [{ d: [[0, 1], [1, h.H]], ink: 'drift', label: 'H' }, { d: [[0, 1], [1, h.kept / 12]], ink: 'ink', label: L.letters }] : [] });
      if (h) kept.ghost = [{ d: [[0, 1], [1, DC.hKept(2 * h.surv)]], label: EXP + ' H' }, { d: [[0, 1], [1, DC.keptMean(2 * h.surv) / 12]], label: EXP + ' ' + L.letters.toLowerCase() }];
      charts.push(kept, purse);
      if (h) stats.push(['H kept', Math.round(100 * h.H) + '%', C.mH], ['Letters kept', (Math.round(10 * h.kept) / 10) + ' of 12', '']);
    }
    if (sm && charts.length > 1) charts.length = 1;   // the folded strip draws the chart the player cares about, big enough to read
    return { stats, charts };
  },
  debrief() { const ch = this.notes(true).charts[0]; return ch || null; }
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
  MODEL.casino = 'Fruit-fly bottles hold gene copies drawn with replacement each generation (Wright–Fisher); eye colour shows each fly’s genotype. Buri’s bottles add family sizes more unequal than chance (designed weights, Ne ≈ 11.5). Founders are a random sample of a large mainland. The hurricane draws 8 copies from 12 alleles.';
  RECALL.casino = { q: 'A neutral allele is at 20% in a small population. What is its chance of eventually taking over?', opts: [['20', 'About 20%'], ['50', 'About 50%'], ['0', 'Almost none']], ans: '20', why: 'With no selection, an allele’s chance of fixing equals its current share.' };
  BRIDGE.casino = 'In the Black Country selection pushed the moths one way. Here no eye colour is better, and chance alone moves the bottles.';
  if (typeof TRANSFER !== 'undefined') delete TRANSFER.casino;   // the chips are the casino's predictions. TRANSFER.castaways stays until Genetic Rescue replaces the legacy Castaways chapter
}

CH_CASINO_V2.sci = { DC, DC_SC, DC_LV, DC_BURI, DC_K, DC_BINS, DC_STARS };   // for tests/oracle_casino.js
V2.push(CH_CASINO_V2);
