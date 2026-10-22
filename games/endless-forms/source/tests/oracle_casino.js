/* tests/oracle_casino.js: the science oracle for the Drift Casino (D3 §3.2, D5 §4 item 5, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html casino          (DC_FAST=1 for a quicker, smaller pass)
   D6 decisions 9 and 10 rebuilt the unit as four levels of real populations (fly bottles, Buri's bottles, castaways, the
   hurricane) with one verb (bet chips on the bins) and no marker interludes: the bets are the predictions.
   D3's oracle lines:
     1. a neutral allele fixes with probability equal to its starting share, within 1% over 10^4 seeds;
     2. the mean absorption time from 0.5 is 1.39N ± 5%;
     3. heterozygosity decays as (1 − 1/N)^t;
     4. with family-size variance Vk, realised Ne matches (4N − 2)/(Vk + 2) ± 5% (Buri's bottles, Ne ≈ 11.5);
     5. a crash to 8 copies keeps 87.5% of H and 6.0 of 12 alleles in expectation (the hurricane);
     6. "copy the croupier", "uniform", "all on mixed" and "all on the starting share" stay below three stars (per level, and
        across the whole unit).
   Plus: every scored expectation matches the sim's own stochastic runs (bottles, Buri, islets, hurricanes), the croupier's
   odds always fail where he is wrong while an honest bet passes, the founders' spread follows √(pq/2n), a skilled policy earns
   each level's stars, determinism, snapshot replay, What if? levers, the result code, Clear and Same bets, and words. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim, WF, Det } = G, X = ch.sci, DC = X.DC, SC = X.DC_SC, FAST = !!process.env.DC_FAST, N = k => FAST ? Math.max(20, Math.round(k / 5)) : k;
  const R = G.R, seed = G.seed;
  const alloc = w => { const raw = w.map(x => 10 * x), b = raw.map(Math.floor); let left = 10 - b.reduce((a, x) => a + x, 0); raw.map((x, i) => [x - b[i], i]).sort((a, z) => z[0] - a[0]).slice(0, left).forEach(([, i]) => b[i]++); return b; };
  const bet = (s, tg) => { for (let b = 0; b < tg.length; b++) { if (s.chips[b] < tg[b]) return { k: 'add', b }; if (s.chips[b] > tg[b]) return { k: 'rem', b }; } return { k: 'spin' }; };
  const smart = s => s.phase === 'bet' ? bet(s, alloc(SC.expectBins({ level: s.level, N: s.N, p: s.p0, n: s.n, surv: s.surv, mode: 'w' }))) : null;   // bets the expectation

  t.eq([ch.levels.length, X.DC_LV.map(L => L.kind).join()], [4, 'bottles,buri,islets,storm'], 'four levels of real populations (D6 decisions 9 and 10)');

  /* ---------- 1. the neutral rule: fixation probability = starting share (bottles of 10 flies, 20 copies) ---------- */
  for (const p0 of [0.8, 0.3]) {
    seed(101); let fix = 0; const n = N(10000), Nc = 20;
    for (let r = 0; r < n; r++) { let k = Math.round(Nc * p0); while (k > 0 && k < Nc) k = WF.binom(Nc, k / Nc); if (k === Nc) fix++; }
    t.near(fix / n, p0, FAST ? 0.03 : 0.01, `1. neutral rule: bottles of 20 copies from ${p0}: ${(100 * fix / n).toFixed(1)}% fixed bw75 over ${n} runs (= the start share ± 1%)`);
  }
  { const d = DC.chain(20, 16, 400)[400]; t.near(d[20], 0.8, 1e-6, '1. exact chain: a bottle at 80% bw75 ends all orange-eyed with probability 0.8'); }
  { const e = DC.outBins(20, 0.8, 30); seed(7); const c = [0, 0, 0], n = N(20000);
    for (let r = 0; r < n; r++) { let k = 16; for (let g = 0; g < 30 && k > 0 && k < 20; g++) k = WF.binom(20, k / 20); c[k === 20 ? 0 : k === 0 ? 1 : 2]++; }
    t.ok(c.every((x, i) => Math.abs(x / n - e[i]) < (FAST ? 0.03 : 0.012)), `L1 bins: exact chain ${e.map(x => x.toFixed(3))} vs ${n} simulated bottles ${c.map(x => (x / n).toFixed(3))}`);
    const tally = [0, 0, 0]; const sd = N(40); for (let k = 1; k <= sd; k++) { const r = G.run(0, { seed: k, policy: smart }); r.s.hist[0].out.forEach(o => tally[o]++); }
    t.ok(tally.every((x, i) => Math.abs(x / (12 * sd) - e[i]) < (FAST ? 0.08 : 0.04)), `L1: the game's own bottles ${tally.map(x => (x / 12 / sd).toFixed(3))} match the bins it scores against`);
  }

  /* ---------- 2. mean absorption time from one half ≈ 1.39N; 3. heterozygosity decays as (1 − 1/N)^t ---------- */
  { const m = DC.meanAbsorb(100, 0.5, 4000); t.near(m / 100, 1.386, 0.069, `2. exact chain: N = 100 copies from 0.5 settle in ${m.toFixed(1)} generations on average = ${(m / 100).toFixed(3)}N (1.39N ± 5%)`); }
  { seed(202); const Nc = 60, n = N(3000); let s = 0; for (let r = 0; r < n; r++) { let k = 30, g = 0; while (k > 0 && k < Nc) { k = WF.binom(Nc, k / Nc); g++; } s += g; }
    t.near(s / n / Nc, 1.386, 0.069 + (FAST ? 0.05 : 0.02), `2. simulated: 60 copies from half settle in ${(s / n).toFixed(1)} generations = ${(s / n / Nc).toFixed(3)}N`); }
  { seed(303); const Nc = 20, n = N(8000), T = 20, H = new Float64Array(T + 1);
    for (let r = 0; r < n; r++) { let k = 10; for (let g = 0; g <= T; g++) { const p = k / Nc; H[g] += 2 * p * (1 - p) * Nc / (Nc - 1) / n; k = WF.binom(Nc, p); } }
    for (const g of [10, 20]) { let want = H[0]; for (let i = 0; i < g; i++) want *= 1 - 1 / Nc; t.near(H[g] / want, 1, FAST ? 0.08 : 0.03, `3. 20 copies: H at generation ${g} = ${H[g].toFixed(4)}, (1 − 1/N)^t predicts ${want.toFixed(4)}`); } }

  /* ---------- 4. Buri's bottles: family-size variance Vk and Ne = (4N − 2)/(Vk + 2) ---------- */
  { seed(404); const st = { k: [] }, n = N(20000), T = 19; let H0 = 0, HT = 0;
    for (let r = 0; r < n; r++) { let b = DC.buriFounders(); H0 += DC.buriH(b); for (let g = 0; g < T; g++) b = DC.buriGen(b, 'w', R, g === 0 && r < 4000 ? st : null); HT += DC.buriH(b); }
    let m = 0, v = 0; for (const x of st.k) m += x; m /= st.k.length; for (const x of st.k) v += (x - m) * (x - m); v /= st.k.length;
    const lam = Det.pow(HT / H0, 1 / T), NeH = 1 / (2 * (1 - lam)), NeF = (4 * 16 - 2) / (v + 2);
    t.near(m, 2, 0.02, `4. Buri: each parent leaves ${m.toFixed(3)} young on average`);
    t.near(NeH / NeF, 1, 0.05, `4. Buri: Vk = ${v.toFixed(2)}; (4N − 2)/(Vk + 2) = ${NeF.toFixed(2)}; heterozygosity decay gives Ne = ${NeH.toFixed(2)} (± 5%)`);
    t.near(NeH, 11.5, 0.8, `4. Buri: the model's Ne = ${NeH.toFixed(2)} (Buri 1956: about 11.5, not 16; the scene says "Ne ≈ 11.5")`);
    const mc = DC.buriMC('w'); t.near(mc.H[19] / mc.H[0], HT / H0, 0.02, `L2: the private expectation run (H19/H0 ${(mc.H[19] / mc.H[0]).toFixed(3)}) matches ${n} R() bottles (${(HT / H0).toFixed(3)})`);
    const c16 = DC.buriBins16(); t.ok(mc.bins[0] > c16[0] + 0.04 && mc.bins[2] > c16[2] + 0.04, `L2: Buri's model loses or fixes more often (${mc.bins[0].toFixed(3)}, ${mc.bins[2].toFixed(3)}) than 16 ideal flies (${c16[0].toFixed(3)}, ${c16[2].toFixed(3)})`);
    t.near(DC.buriH(DC.buriFounders()), DC.ghost16(0), 1e-12, 'L2: the bottles\' H and the croupier\'s 16-fly line start on the same scale (2pq of the 32 copies)'); }
  { seed(405); const st = { k: [] }; for (let r = 0; r < N(2000); r++) DC.buriGen(DC.buriFounders(), 'eq', R, st); let v = 0; for (const x of st.k) v += (x - 2) * (x - 2); t.near(v / st.k.length, 0, 1e-12, 'What if? equal families: Vk = 0, so Ne = (4N − 2)/2 = 31'); }

  /* ---------- the castaways: founders are a sample; the spread shrinks as √(pq/2n) ---------- */
  { const e2 = DC.founders(2), e12 = DC.founders(12);
    t.near(e2.reduce((a, x) => a + x, 0), 1, 1e-12, 'L3: the founders\' share bins sum to 1');
    t.near(e2[2], 0.375, 1e-9, 'L3: two founders (4 copies) carry exactly half the marker with probability 6/16');
    t.ok(e12[2] > 0.4 && e12[0] + e12[4] < 0.03, `L3: twelve founders start near half ${(100 * e12[2]).toFixed(0)}% of the time, beyond 25 or 75% only ${(100 * (e12[0] + e12[4])).toFixed(1)}%`);
    t.near(DC.sd(2), 0.25, 1e-12, 'L3: √(pq/2n) = 0.25 for 2 founders (±25 points, as the HUD says)'); t.near(DC.sd(12), 0.102, 0.001, 'L3: and ±10 points for 12');
    { let ok = true; for (let n = 1; n < 40; n++) if (!(DC.gap(n + 1) < DC.gap(n))) ok = false; t.ok(ok, 'L3: the expected gap from half shrinks steadily with every extra founder'); }
    for (const nf of [2, 12]) { const s = G.reset(2, 13); s.n = nf; const c = [0, 0, 0, 0, 0], n = N(300), e = DC.founders(nf); let sq = 0; for (let r = 0; r < n; r++) { sim.found(s); for (const I of s.items) { c[I.out]++; sq += (I.share - 0.5) * (I.share - 0.5); } }
      t.ok(c.every((x, i) => Math.abs(x / (12 * n) - e[i]) < 4 * Math.sqrt(e[i] * (1 - e[i]) / (12 * n)) + 0.003), `L3: ${12 * n} simulated islets of ${nf} founders ${c.map(x => (x / 12 / n).toFixed(3))} match the binomial ${e.map(x => x.toFixed(3))}`);
      t.near(Math.sqrt(sq / (12 * n)), DC.sd(nf), FAST ? 0.02 : 0.008, `L3: their spread ${Math.sqrt(sq / (12 * n)).toFixed(3)} = √(pq/2n) = ${DC.sd(nf).toFixed(3)}`); } }

  /* ---------- 5. the hurricane: a crash to 8 copies keeps 87.5% of H and about 6 of 12 alleles ---------- */
  { t.near(DC.hKept(8), 0.875, 1e-12, '5. exact: E[H after]/H before = 1 − 1/8 = 0.875'); t.near(DC.keptMean(8), 6.017, 0.001, '5. exact: E[alleles left] = 12(1 − (11/12)^8) = 6.02');
    const P = DC.kept12(8); let m = 0, s1 = 0; for (let k = 0; k <= 12; k++) { m += k * P[k]; s1 += P[k]; } t.near(s1, 1, 1e-12, '5. the occupancy distribution sums to 1'); t.near(m, DC.keptMean(8), 1e-9, '5. and its mean is 12(1 − (11/12)^8)');
    seed(606); const n = N(20000); let h = 0, k = 0; const H0 = 11 / 12, c = [0, 0, 0, 0, 0], e = DC.letterBins(8);
    for (let r = 0; r < n; r++) { const cnt = Array.from(WF.multinom(8, DC.uni(12))); h += DC.het(cnt) / H0; const kk = DC.kept(cnt); k += kk; c[DC.letterBin(kk)]++; }
    t.near(h / n, 0.875, FAST ? 0.02 : 0.006, `5. simulated hurricanes keep ${(100 * h / n).toFixed(1)}% of H`); t.near(k / n, 6.02, FAST ? 0.1 : 0.04, `5. and ${(k / n).toFixed(2)} of 12 alleles`);
    t.ok(c.every((x, i) => Math.abs(x / n - e[i]) < (FAST ? 0.03 : 0.01)), `5. the letters bins ${e.map(x => x.toFixed(3))} match ${n} simulated hurricanes ${c.map(x => (x / n).toFixed(3))}`);
    const s = G.reset(3, 9); for (let i = 0; i < 10; i++) sim.act({ k: 'add', b: i % 5 }); sim.act({ k: 'spin' });
    t.ok(s.items.length === 12 && s.items.every(I => I.counts.reduce((a, b) => a + b, 0) === 8 && I.surv.length === 4), '5. the game\'s hurricane leaves 4 lizards (8 copies) on each of 12 islets'); }

  /* ---------- the croupier's odds always fail where he is wrong; an honest bet passes ---------- */
  { const cases = [['L1 fly bottles', DC.outBins(20, 0.8, 30), sim.odds({ level: 0 })], ['L2 Buri', DC.buriMC('w').bins, sim.odds({ level: 1 })], ['L3 2 founders', DC.founders(2), sim.odds({ level: 2 })], ['L3 12 founders', DC.founders(12), sim.odds({ level: 2 })], ['L4 hurricane', DC.letterBins(8), sim.odds({ level: 3 })]];
    for (const [nm, e, c] of cases) t.ok(!DC.pass(c, e, c) && DC.pass(alloc(e).map(x => x / 10), e, c) && !DC.pass(DC.uni(e.length), e, c), `${nm}: the croupier's odds and an even spread fail the threshold; the expectation rounded to ten chips passes`); }

  /* ---------- 6. named bots stay below three stars; a skilled bettor earns each level's stars ---------- */
  { const names = { alwaysA: 'all on the start', alwaysB: 'uniform', greedy: 'copy the croupier', threshold: 'all on mixed', random: 'random' }, seeds = []; for (let i = 1; i <= N(20); i++) seeds.push(i);
    for (const b of Object.keys(names)) { let worst = 0, unitBest = 0, three = 0;
      for (const sd of seeds) { let unit = 0; for (let lv = 0; lv < 4; lv++) { const r = G.run(lv, { seed: sd, bot: b }); const m = r.result ? r.result.mask : 0; unit |= m; if (m === 7) worst = 7; } const k = (unit & 1) + (unit >> 1 & 1) + (unit >> 2 & 1); unitBest = Math.max(unitBest, k); if (k === 3) three++; }
      t.ok(worst !== 7, `6. ${names[b]}: no level earns three stars`);
      if (b !== 'random') t.ok(unitBest < 3, `6. ${names[b]}: at most ${unitBest} unit stars across ${seeds.length} seeds`);
      else t.ok(three <= Math.ceil(0.15 * seeds.length), `6. random: all three unit stars on ${three} of ${seeds.length} seeds (≤ 15%)`); }
    const want = [3, 3, 3, 5];
    for (let lv = 0; lv < 4; lv++) { let ok = 0; for (const sd of seeds) { const r = G.run(lv, { seed: sd, policy: smart }); if (r.result && r.result.mask === want[lv]) ok++; } t.ok(ok === seeds.length, `skill: betting the expectation earns the level's stars (${want[lv]}) on ${ok} of ${seeds.length} seeds`); }
    t.eq(X.DC_STARS.map(a => a.join('+')), ['discover+predict', 'discover+predict', 'discover+predict', 'discover+transfer'], 'each level offers two stars; the unit offers all three'); }

  /* ---------- no marker interludes: the bets are the predictions (D6 decision 9) ---------- */
  { let asks = 0; for (let lv = 0; lv < 4; lv++) { const r = G.run(lv, { seed: 2, bot: 'greedy' }); asks += (r.s.asks || []).length; if (r.s.ask) asks++; } t.eq(asks, 0, 'no level opens a prediction marker'); }

  /* ---------- determinism, snapshots, replay ---------- */
  { const a = G.run(0, { seed: 77, bot: 'random', rnd: () => 0.37 }), b = G.run(0, { seed: 77, bot: 'random', rnd: () => 0.37 });
    t.eq(a.s.won, b.s.won, 'determinism: the same seed and actions give the same chips'); t.eq(a.s.hist.map(h => h.fix), b.s.hist.map(h => h.fix), 'determinism: and the same fixation generations');
    G.reset(1, 5); for (let i = 0; i < 10; i++) sim.act({ k: 'add', b: 1 }); sim.act({ k: 'spin' }); for (let i = 0; i < 60; i++) sim.step(sim.dt);
    const snap = sim.snapshot(); for (let i = 0; i < 60; i++) sim.step(sim.dt); const after = JSON.stringify(sim.s.items.map(B => B.k));
    sim.restore(snap); for (let i = 0; i < 60; i++) sim.step(sim.dt); t.eq(JSON.stringify(sim.s.items.map(B => B.k)), after, 'snapshot: restoring a frozen generation replays exactly');
    const log = a.s.log.slice(), c = G.run(0, { seed: 77, policy: (st, acts, rnd, tick) => { const e = log.find(x => x[0] === tick); return e ? e[1] : null; } });
    t.eq(c.s.won, a.s.won, 'replay: (seed, logged actions) reproduces the run'); }

  /* ---------- result code, Clear and Same bets, words ---------- */
  { const q = G.run(0, { seed: 3, policy: smart }), b = ch.resultBits(q.s, 0), b2 = ch.resultBits(G.run(0, { seed: 3, policy: smart }).s, 0);
    t.ok(b >= 0 && b < 1073741824 && b === b2 && (b & 7) === 0, `result code: L1 bits ${b} fit 30 bits and repeat for (seed, actions)`);
    let ok = true; for (let lv = 1; lv < 4; lv++) { const r = G.run(lv, { seed: 3, bot: 'greedy' }), v = ch.resultBits(r.s, lv); if (!(v >= 0 && v < 1073741824 && (v & 7) === lv)) ok = false; } t.ok(ok, 'result code: every level fits 30 bits'); }
  { const s = G.reset(0, 2); sim.act({ k: 'add', b: 0 }); sim.act({ k: 'add', b: 2 }); sim.act({ k: 'clear' }); t.eq(s.chips, [0, 0, 0], 'Clear: every chip comes back');
    const s3 = G.reset(2, 2); for (let i = 0; i < 10; i++) sim.act({ k: 'add', b: i < 7 ? 2 : 3 }); sim.act({ k: 'spin' }); for (let i = 0; i < 2000 && s3.ti === 0; i++) sim.step(sim.dt);
    sim.act({ k: 'same' }); t.eq(s3.chips, [0, 0, 7, 3, 0], 'Same bets: table 2 starts from table 1\'s chips in one action'); }
  { const C = ch.content, all = []; const walk = (o, at) => { if (typeof o === 'string') all.push([at, o]); else if (o && typeof o === 'object') for (const k in o) walk(o[k], at + '.' + k); }; walk(C, 'content');
    const split = all.filter(([at, x]) => /^content\.(why|model)/.test(at) && !/\.params\./.test(at) && /\d\.\d/.test(x)); t.ok(!split.length, 'words: no decimals in Why? or MODEL text (the card splits sentences on full stops)' + (split.length ? ' — ' + split[0][0] : ''));
    const sym = all.filter(([at, x]) => /\b(marble|bead|jar)s?\b/i.test(x)); t.ok(!sym.length, 'words: no marbles, beads or jars as the picture (D6 decision 10)' + (sym.length ? ' — ' + sym[0][0] : ''));
    t.ok(C.model.length === 4 && C.model.every((m, i) => m.level === i && m.refs.length), 'one MODEL card per level, each with references'); }

  /* ---------- What if? levers: each thaws the frozen table, changes one thing and ends in its Interesting result ---------- */
  for (let lv = 0; lv < 4; lv++) for (const lever of X.DC_LV[lv].levers) {
    const pol = G.bot('greedy'); let snap = null;
    G.reset(lv, 5); let ticks = 0;
    while (!sim.result() && ticks < 20000) { const L = X.DC_LV[lv], s = sim.s, last = s.ti === L.tables.length - 1 && s.phase === 'bet';
      const acts = sim.actions(); const a = acts.length ? pol(s, acts, () => 0.5) : null; if (a) { sim.act(a); if (last && !snap && a.k === 'spin') snap = sim.snapshot(); } sim.step(sim.dt); ticks++; }
    if (!snap) { t.ok(false, `What if? L${lv + 1} ${lever}: no frozen table`); continue; }
    G.reset(lv, 5, { thaw: { snap, lever } }); ticks = 0; while (!sim.result() && ticks < 20000) { sim.step(sim.dt); ticks++; }
    const r = sim.result(); t.ok(r && r.mask === 0 && r.interesting === lever, `What if? L${lv + 1} "${lever}" runs to its Interesting result in ${ticks} ticks`);
    if (lever === 'big') t.ok(sim.s.items.filter(J => J.fix < 0).length >= 6, `What if? bottles of 50 flies: ${sim.s.items.filter(J => J.fix < 0).length} of 12 still mixed at 30`);
    if (lever === 'single') t.ok(sim.s.items.every(I => [0, 0.5, 1].indexOf(I.share) >= 0), 'What if? one founder: islets start only at 0, 50 or 100%');
    if (lever === 'two') t.ok(sim.s.items.every(I => I.kept <= 4), 'What if? two survivors keep at most four letters');
    if (lever === 'ten') t.ok(sim.s.items.reduce((a, I) => a + I.kept, 0) / 12 > 9, `What if? ten survivors keep ${(sim.s.items.reduce((a, I) => a + I.kept, 0) / 12).toFixed(1)} letters on average (most)`);
  }
};
