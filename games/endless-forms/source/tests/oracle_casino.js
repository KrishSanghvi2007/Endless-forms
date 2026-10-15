/* tests/oracle_casino.js: the science oracle for the Drift Casino (D3 §3.2, D5 §4 item 5, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html casino          (DC_FAST=1 for a quicker, smaller pass)
   D3's oracle lines:
     1. a neutral allele fixes with probability equal to its starting share, within 1% over 10^4 seeds;
     2. the mean absorption time from 0.5 is 1.39N ± 5%;
     3. heterozygosity decays as (1 − 1/N)^t;
     4. with family-size variance Vk, realised Ne matches (4N − 2)/(Vk + 2) ± 5% (Buri's bottles, Ne ≈ 11.5);
     5. a crash to 8 copies keeps 87.5% of H and 6.0 of 12 alleles in expectation;
     6. "copy the croupier", "uniform", "all on mixed", "all on the starting share" and "always buy the volcano" stay below
        three stars (per level, and across the whole unit).
   Plus: every scored expectation matches the sim's own stochastic runs (jars, bottles, islets, zoo), the croupier's odds
   always fail the Predict threshold where he is wrong, the side tables' realised Ne matches the formulas, a skilled policy
   earns the stars, determinism and snapshot replay, What if? levers.
   Review round: the L2 crash chain matches the sim and enters the expectation; Predict needs the marker; equal families never
   make family size inherited; migrants help late but families are the cheaper route; the side tables report a spread; the
   result code fits 30 bits; Clear and Same bets; no "barely moved" and no decimals where the card's splitter would break them. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim, WF, Det } = G, X = ch.sci, DC = X.DC, SC = X.DC_SC, FAST = !!process.env.DC_FAST, N = k => FAST ? Math.max(20, Math.round(k / 5)) : k;
  const R = G.R, seed = G.seed;

  /* ---------- 1. the neutral rule: fixation probability = starting share ---------- */
  for (const p0 of [0.8, 0.3]) {
    seed(101); let fix = 0; const n = N(10000), Nc = 10;
    for (let r = 0; r < n; r++) { let k = Math.round(Nc * p0); while (k > 0 && k < Nc) k = WF.binom(Nc, k / Nc); if (k === Nc) fix++; }
    t.near(fix / n, p0, FAST ? 0.03 : 0.01, `1. neutral rule: jars of 10 from ${p0}: ${(100 * fix / n).toFixed(1)}% fixed blue over ${n} runs (= the start share ± 1%)`);
  }
  { const d = DC.chain(10, 8, 400)[400]; t.near(d[10], 0.8, 1e-6, '1. exact chain: a jar of 10 at 80% ends all blue with probability 0.8'); }
  { // the expectation the stars use for L1 equals the sim's own jars (30 generations; blue, amber, still mixed)
    const e = DC.outBins(10, 0.8, 30); seed(7); const c = [0, 0, 0], n = N(20000);
    for (let r = 0; r < n; r++) { let k = 8; for (let g = 0; g < 30 && k > 0 && k < 10; g++) k = WF.binom(10, k / 10); c[k === 10 ? 0 : k === 0 ? 1 : 2]++; }
    t.ok(c.every((x, i) => Math.abs(x / n - e[i]) < (FAST ? 0.03 : 0.012)), `L1 bins: exact chain ${e.map(x => x.toFixed(3))} vs ${n} simulated jars ${c.map(x => (x / n).toFixed(3))}`);
  }

  /* ---------- 2. mean absorption time from one half ≈ 1.39N ---------- */
  { const m = DC.meanAbsorb(100, 0.5, 4000); t.near(m / 100, 1.386, 0.069, `2. exact chain: N = 100 copies from 0.5 settle in ${m.toFixed(1)} generations on average = ${(m / 100).toFixed(3)}N (1.39N ± 5%)`); }
  { seed(202); const Nc = 60, n = N(3000); let s = 0; for (let r = 0; r < n; r++) { let k = 30, g = 0; while (k > 0 && k < Nc) { k = WF.binom(Nc, k / Nc); g++; } s += g; }
    t.near(s / n / Nc, 1.386, 0.069 + (FAST ? 0.05 : 0.02), `2. simulated: jars of 60 from half settle in ${(s / n).toFixed(1)} generations = ${(s / n / Nc).toFixed(3)}N`); }
  { const m6 = DC.median(6, 0.5, 40), m20 = DC.median(20, 0.5, 40); t.ok(m6 > 4 && m6 < 6.5 && m20 > 17 && m20 < 23, `L2: half the 6-bead jars settle by generation ${m6.toFixed(1)}, half the 20-bead jars by ${m20.toFixed(1)}`);
    const b = DC.timeBins(200, 0.5, 40); t.ok(b[4] > 0.99, `L2: jars of 200 are still mixed at 40 with probability ${b[4].toFixed(3)}`);
    t.near(DC.timeBins(6, 0.5, 40).reduce((a, x) => a + x, 0), 1, 1e-9, 'L2: the five time bins sum to 1'); }

  /* ---------- 3. heterozygosity decays as (1 − 1/N)^t ---------- */
  { seed(303); const Nc = 20, n = N(8000), T = 20, H = new Float64Array(T + 1);
    for (let r = 0; r < n; r++) { let k = 10; for (let g = 0; g <= T; g++) { const p = k / Nc; H[g] += 2 * p * (1 - p) * Nc / (Nc - 1) / n; k = WF.binom(Nc, p); } }
    for (const g of [10, 20]) { let want = H[0]; for (let i = 0; i < g; i++) want *= 1 - 1 / Nc; t.near(H[g] / want, 1, FAST ? 0.08 : 0.03, `3. jars of 20: H at generation ${g} = ${H[g].toFixed(4)}, (1 − 1/N)^t predicts ${want.toFixed(4)}`); } }

  /* ---------- 4. Buri's bottles: family-size variance Vk and Ne = (4N − 2)/(Vk + 2) ---------- */
  { seed(404); const st = { k: [] }, n = N(20000), T = DC.W ? 19 : 19; let H0 = 0, HT = 0;
    for (let r = 0; r < n; r++) { let b = DC.buriFounders(); H0 += DC.buriH(b); for (let g = 0; g < T; g++) b = DC.buriGen(b, 'w', R, g === 0 && r < 4000 ? st : null); HT += DC.buriH(b); }
    let m = 0, v = 0; for (const x of st.k) m += x; m /= st.k.length; for (const x of st.k) v += (x - m) * (x - m); v /= st.k.length;
    const lam = Det.pow(HT / H0, 1 / T), NeH = 1 / (2 * (1 - lam)), NeF = (4 * 16 - 2) / (v + 2);
    t.near(m, 2, 0.02, `4. Buri: each parent leaves ${m.toFixed(3)} young on average`);
    t.near(NeH / NeF, 1, 0.05, `4. Buri: Vk = ${v.toFixed(2)}; (4N − 2)/(Vk + 2) = ${NeF.toFixed(2)}; heterozygosity decay gives Ne = ${NeH.toFixed(2)} (± 5%)`);
    t.near(NeH, 11.5, 0.8, `4. Buri: the model's Ne = ${NeH.toFixed(2)} (Buri 1956: about 11.5, not 16)`);
    const mc = DC.buriMC('w'); t.near(mc.H[19] / mc.H[0], HT / H0, 0.02, `L3: the private expectation run (H19/H0 ${(mc.H[19] / mc.H[0]).toFixed(3)}) matches ${n} R() bottles (${(HT / H0).toFixed(3)})`);
    const c16 = DC.buriBins16(); t.ok(mc.bins[0] > c16[0] + 0.04 && mc.bins[2] > c16[2] + 0.04, `L3: Buri's model loses or fixes more often (${mc.bins[0].toFixed(3)}, ${mc.bins[2].toFixed(3)}) than 16 ideal flies (${c16[0].toFixed(3)}, ${c16[2].toFixed(3)})`); }
  { seed(405); const st = { k: [] }; for (let r = 0; r < N(2000); r++) DC.buriGen(DC.buriFounders(), 'eq', R, st); let v = 0; for (const x of st.k) v += (x - 2) * (x - 2); t.near(v / st.k.length, 0, 1e-12, 'What if? equal families: Vk = 0, so Ne = (4N − 2)/2 = 31'); }

  /* ---------- the Ne side tables: realised Ne from many cages matches the formula ---------- */
  for (const D of X.DC_SIDES) {
    seed(500 + D.id.charCodeAt(2)); const reps = N(1500), T = 20; let H0 = 0, HT = 0;
    for (let r = 0; r < reps; r++) { let P = sim.sidePop(D); H0 += sim.sideH(D, P); for (let g = 0; g < T; g++) P = sim.sideGen(D, P, g); HT += sim.sideH(D, P); }
    const Ne = 1 / (2 * (1 - Det.pow(HT / H0, 1 / T)));
    t.near(Ne / D.Ne, 1, FAST ? 0.2 : 0.1, `side ${D.id} (${D.kind}): realised Ne ${Ne.toFixed(1)} vs formula ${D.Ne.toFixed(1)} (± 10%); the trap answer ${D.trap} is outside ± 20%`);
    t.ok(Math.abs(D.trap - D.Ne) > 0.2 * D.Ne, `side ${D.id}: census ${D.trap} misses the ± 20% band`);
  }

  /* ---------- 5. the eruption: a crash to 8 copies keeps 87.5% of H and about 6 of 12 alleles ---------- */
  { t.near(DC.crashH, 0.875, 1e-12, '5. exact: E[H after]/H before = 1 − 1/8 = 0.875'); t.near(DC.crashKept(), 6.017, 0.001, '5. exact: E[alleles left] = 12(1 − (11/12)^8) = 6.02');
    seed(606); const n = N(20000); let h = 0, k = 0; const H0 = 11 / 12;
    for (let r = 0; r < n; r++) { const c = WF.multinom(8, DC.uni(12)); h += DC.het(Array.from(c)) / H0; k += DC.kept(Array.from(c)); }
    t.near(h / n, 0.875, FAST ? 0.02 : 0.006, `5. simulated eruptions keep ${(100 * h / n).toFixed(1)}% of H`); t.near(k / n, 6.02, FAST ? 0.1 : 0.04, `5. and ${(k / n).toFixed(2)} of 12 alleles`);
    const s = G.reset(4, 9); sim.act({ k: 'predict', id: 'hk', v: 0.88 }); sim.act({ k: 'predict', id: 'al', v: 6 }); sim.act({ k: 'erupt' });
    t.eq(sim.s.crash.counts.reduce((a, b) => a + b, 0), 8, '5. the sim\'s eruption leaves 4 beetles, 8 copies'); t.eq(sim.s.crash.surv.length, 4, '5. four survivors'); }

  /* ---------- the zoo: the plan matters; luck is removed by 200 replays ---------- */
  { const run = (pol, sd) => G.run(4, { seed: sd, policy: (s, acts) => { if (s.phase === 'ask') { const e = SC.expectAsk(s, s.ask.id); return acts.filter(a => a.k === 'predict').reduce((b, a) => Math.abs(a.v - e) < Math.abs(b.v - e) ? a : b); } if (s.phase === 'erupt') return { k: 'erupt' }; if (s.phase === 'zoo') return pol(s.zoo); return null; } });
    const none = run(() => null, 3), good = run(Z => !Z.bal ? { k: 'bal' } : (!Z.eq && Z.gen < 18) ? { k: 'eq', on: true } : (Z.eq && Z.gen >= 18) ? { k: 'eq', on: false } : null, 3);
    t.ok(none.s.zoo.E < 8, `zoo, no plan: ${none.s.zoo.E.toFixed(2)} letters kept in expectation (< 9: no Discover)`);
    t.ok(good.s.zoo.E >= 9, `zoo, balanced sexes and equal families for 18 generations: ${good.s.zoo.E.toFixed(2)} letters (≥ 9: Discover)`);
    t.ok(good.s.zoo.budget >= 0 && good.s.zoo.budget <= 1, `zoo: that plan spends the budget (${good.s.zoo.budget} tokens left)`);
    const eqOnly = run(Z => !Z.eq ? { k: 'eq', on: true } : null, 3); t.ok(eqOnly.s.zoo.E < 9 && eqOnly.s.zoo.E > none.s.zoo.E + 1, `zoo, equal families alone: ${eqOnly.s.zoo.E.toFixed(2)} letters (they help, but the 15 males still limit Ne)`);
    const balOnly = run(Z => !Z.bal ? { k: 'bal' } : null, 3); t.ok(balOnly.s.zoo.E < 9 && balOnly.s.zoo.E > none.s.zoo.E + 0.5, `zoo, balanced sexes alone: ${balOnly.s.zoo.E.toFixed(2)} letters (< 9)`);
    const late = run(Z => !Z.bal ? { k: 'bal' } : (Z.gen >= 14 && !Z.pend && Z.budget >= X.DC_ZOO.cMig) ? { k: 'mig' } : null, 3);
    t.ok(late.s.zoo.E > balOnly.s.zoo.E + 0.8 && late.s.zoo.E < 9, `zoo, balance and a migrant a generation from 14: ${late.s.zoo.E.toFixed(2)} letters (migrants help, families are cheaper)`);
    const early = run(Z => !Z.bal ? { k: 'bal' } : (!Z.pend && Z.budget >= X.DC_ZOO.cMig) ? { k: 'mig' } : null, 3);
    t.ok(early.s.zoo.E < late.s.zoo.E, `zoo, migrants from generation 0: ${early.s.zoo.E.toFixed(2)} letters (early migrants mostly bring letters still present)`);
    const again = run(Z => !Z.bal ? { k: 'bal' } : (!Z.eq && Z.gen < 18) ? { k: 'eq', on: true } : (Z.eq && Z.gen >= 18) ? { k: 'eq', on: false } : null, 3);
    t.eq(again.s.zoo.E, good.s.zoo.E, 'zoo: the expectation is deterministic for (seed, actions)'); }
  { // equal families with unbalanced sexes: which mothers raise the extra young must change every generation (Robertson 1961: inherited family size lowers Ne)
    seed(808); let n22 = 0, n2 = 0, n12 = 0, n1 = 0; const reps = N(400);
    for (let r = 0; r < reps; r++) {
      const p0 = []; for (let i = 0; i < 60; i++) p0.push({ f: i < 45, a: [100 + i, 100 + i] });
      const g1 = DC.zooBreed(p0, true, false, R), kids = {}; for (const b of g1) kids[b.a[0]] = (kids[b.a[0]] || 0) + 1;   // maternal copy comes first
      const cls = g1.map(b => kids[b.a[0]] === 2), lab = g1.map((b, i) => ({ f: b.f, a: [1000 + i, 1000 + i] }));
      const g2 = DC.zooBreed(lab, true, false, R), k2 = {}; for (const b of g2) k2[b.a[0]] = (k2[b.a[0]] || 0) + 1;
      lab.forEach((b, i) => { if (!b.f) return; const two = k2[1000 + i] === 2; if (cls[i]) { n2++; if (two) n22++; } else { n1++; if (two) n12++; } });
    }
    const pa = n22 / n2, pb = n12 / n1; t.ok(Math.abs(pa - pb) < 0.05 && Math.abs(pa - 15 / 45) < 0.05, `zoo: equal families, 45 females: daughters of two-young mothers raise two young ${(100 * pa).toFixed(1)}% of the time, others ${(100 * pb).toFixed(1)}% (not inherited)`);
  }

  /* ---------- the founders (L4) ---------- */
  { const e = DC.founders(5); t.near(e[2], 0.246, 0.001, `L4: five founders (10 copies) carry exactly half amber with probability ${e[2].toFixed(3)}`);
    t.near(DC.near(5), 0.656, 0.001, 'L4: within 10 points of half with probability 0.656');
    t.near(DC.gap(5), 0.123, 0.001, 'L4: five founders start on average 12.3 points from half (the marker asks for this)');
    { let ok = true; for (let n = 1; n < 40; n++) if (!(DC.gap(n + 1) < DC.gap(n))) ok = false; t.ok(ok, 'L4: the expected gap from half shrinks steadily with every extra founder'); }
    { const s = G.reset(3, 13); s.n = 5; let g = 0; const n = N(400); for (let r = 0; r < n; r++) { sim.found(s); for (const I of s.isl) g += Math.abs(I.share - 0.5); } t.near(g / (12 * n), DC.gap(5), FAST ? 0.02 : 0.006, `L4: ${12 * n} simulated islets start ${(100 * g / 12 / n).toFixed(1)} points from half on average`); }
    const s = G.reset(3, 12); s.n = 5; const c = [0, 0, 0, 0, 0], n = N(300); for (let r = 0; r < n; r++) { sim.found(s); for (const I of s.isl) c[I.out]++; }
    t.ok(c.every((x, i) => Math.abs(x / (12 * n) - e[i]) < (FAST ? 0.05 : 0.02)), `L4: ${12 * n} simulated islets ${c.map(x => (x / 12 / n).toFixed(3))} match the binomial ${e.map(x => x.toFixed(3))}`); }

  /* ---------- the croupier's odds always fail where he is wrong; an honest bet passes ---------- */
  { const cases = [['L1 80%', DC.outBins(10, 0.8, 30), sim.odds({ level: 0 })], ['L1 30%', DC.outBins(10, 0.3, 30), sim.odds({ level: 0 })], ['L1 60%', DC.outBins(10, 0.6, 30), sim.odds({ level: 0 })],
      ['L2 6 beads', DC.timeBins(6, 0.5, 40), sim.odds({ level: 1 })], ['L2 200 beads', DC.timeBins(200, 0.5, 40), sim.odds({ level: 1 })], ['L3 Buri', DC.buriMC('w').bins, sim.odds({ level: 2 })], ['L4 5 founders', DC.founders(5), sim.odds({ level: 3 })]];
    for (const [nm, e, c] of cases) {
      const q = X.DC_BINS && e.map(x => x), r10 = (() => { const raw = e.map(x => 10 * x), b = raw.map(Math.floor); let left = 10 - b.reduce((a, x) => a + x, 0); raw.map((x, i) => [x - b[i], i]).sort((a, z) => z[0] - a[0]).slice(0, left).forEach(([, i]) => b[i]++); return b.map(x => x / 10); })();
      t.ok(!DC.pass(c, e, c) && DC.pass(r10, e, c) && !DC.pass(DC.uni(e.length), e, c), `${nm}: the croupier's odds and an even spread fail the Predict threshold; the expectation rounded to ten chips passes`);
    }
    const e20 = DC.timeBins(20, 0.5, 40); t.ok(DC.pass(e20, e20, sim.odds({ level: 1 })) && !DC.pass(DC.uni(5), e20, sim.odds({ level: 1 })), 'L2 20 beads: the croupier is right here, so copying him passes this one table (and only this one)'); }

  /* ---------- review round: the L2 crash chain, Predict rules, side-table spread, result code, Clear and Same bets, words ---------- */
  for (const Nc of [20, 200]) {
    const A1 = DC.absorbC(Nc, Nc / 2, 40, 1); seed(909 + Nc); let c5 = 0, c40 = 0; const n = N(20000);
    for (let r = 0; r < n; r++) { let k = Nc / 2, cur = Nc, at = -1; for (let g = 1; g <= 40; g++) { const size = g < 5 ? 4 : Nc; k = WF.binom(size, k / cur); cur = size; if (k === 0 || k === cur) { at = g; break; } } if (at >= 0 && at <= 5) c5++; if (at >= 0) c40++; }
    t.ok(Math.abs(c5 / n - A1[5]) < (FAST ? 0.03 : 0.012) && Math.abs(c40 / n - A1[40]) < (FAST ? 0.03 : 0.012), `L2 crash: jars of ${Nc} held at 4 beads for generations 1–4: chain ${A1[5].toFixed(3)} settled by 5 and ${A1[40].toFixed(3)} by 40; ${n} simulated jars ${(c5 / n).toFixed(3)} and ${(c40 / n).toFixed(3)}`);
  }
  { const e0 = SC.expectBins({ level: 1, N: 20, p: 0.5, vols: 0, nj: 12 }), e4 = SC.expectBins({ level: 1, N: 20, p: 0.5, vols: 4, nj: 12 }), c = sim.odds({ level: 1 });
    t.near(e4.reduce((a, x) => a + x, 0), 1, 1e-9, 'L2 crash: the crash-aware bins sum to 1');
    t.ok(e4[0] > e0[0] + 0.15 && DC.ES(e4, e4) - DC.ES(c, e4) > 0.03, `L2 crash: four crashed jars of 20 move "by gen 5" from ${e0[0].toFixed(3)} to ${e4[0].toFixed(3)}, so the croupier (right about jars of 20) is now beatable`);
    const s = G.reset(1, 21); sim.act({ k: 'vol', j: 0 }); sim.act({ k: 'vol', j: 1 }); sim.act({ k: 'vol', j: 2 }); sim.act({ k: 'vol', j: 3 }); const ev = sim.act({ k: 'vol', j: 4 });
    t.ok(ev.some(e => e.k === 'volMax') && s.jars.filter(J => J.crash >= 0).length === 4, 'L2 crash: four crashes a rack at most');
    sim.act({ k: 'vol', j: 3 }); t.eq(s.jars.filter(J => J.crash >= 0).length, 3, 'L2 crash: tapping a crashed jar calls it off');
    for (let i = 0; i < 10; i++) sim.act({ k: 'add', b: i % 5 }); sim.act({ k: 'spin' });
    t.eq([s.tab[0].vols, s.tab[0].nj], [3, 12], 'L2 crash: the table record keeps the crashes, so stars and the level card read them');
    t.near(SC.expectAsk(s, 'half'), DC.median(6, 0.5, 40, 3 / 12), 1e-12, `L2: the half-settled marker reads the crashes too (${DC.median(6, 0.5, 40, 3 / 12).toFixed(2)} with 3 of 12 crashed, ${DC.median(6, 0.5, 40).toFixed(2)} without)`); }
  { // Predict needs the marker (D2 §11), and L4's later storms start at 2 and 12 founders, so a bet that ignores the storm fails
    const alloc = w => { const raw = w.map(x => 10 * x), b = raw.map(Math.floor); let left = 10 - b.reduce((a, x) => a + x, 0); raw.map((x, i) => [x - b[i], i]).sort((a, z) => z[0] - a[0]).slice(0, left).forEach(([, i]) => b[i]++); return b; };
    const bet = (s, tg) => { for (let b = 0; b < tg.length; b++) { if (s.chips[b] < tg[b]) return { k: 'add', b }; if (s.chips[b] > tg[b]) return { k: 'rem', b }; } return { k: 'spin' }; };
    const noMark = (s, acts) => s.phase === 'ask' ? acts.filter(a => a.k === 'predict')[0] : s.phase === 'bet' ? bet(s, alloc(SC.expectBins({ level: s.level, N: s.N, p: s.p0, n: s.n, mode: 'w' }))) : null;
    let ok = true; for (const lv of [0, 1, 3]) { const r = G.run(lv, { seed: 4, policy: noMark }); if (r.result.mask & 2) ok = false; }
    t.ok(ok, 'Predict: perfect chips with the marker left at the bottom of its axis earn no Predict star (L1, L2, L4)');
    const fixed5 = (s, acts) => { if (s.phase === 'ask') { const e = SC.expectAsk(s, s.ask.id); return acts.filter(a => a.k === 'predict').reduce((b, a) => Math.abs(a.v - e) < Math.abs(b.v - e) ? a : b); } return s.phase === 'bet' ? bet(s, alloc(DC.founders(5))) : null; };
    const r4 = G.run(3, { seed: 6, policy: fixed5 }); t.ok(!(r4.result.mask & 2) && r4.s.tab[1].n === 2 && r4.s.tab[2].n === 12, `L4: the five-founder bet on every storm (left at 2 and 12 founders) fails Predict (mask ${r4.result.mask})`); }
  { // side tables: the fit reports a spread, and the formula sits inside it about as often as it should
    let inside = 0, tot = 0;
    for (const sd of FAST ? [1, 2] : [1, 2, 3, 4, 5, 6]) for (let i = 0; i < 3; i++) {
      G.reset(2, sd); const s = sim.s, D = X.DC_SIDES[i]; s.side = i; s.sd = { i, pops: null, H: [], gen: 0, fit: null }; s.pred[D.id] = D.Ne; sim.sideRun(s, []);
      while (s.phase === 'sideRun') sim.genSide(s, []); const r = s.sides[i]; tot++; if (Math.abs(r.fit - D.Ne) <= 2 * r.se + 1e-9) inside++;
    }
    t.ok(inside / tot >= 0.75, `side tables: the formula lies within the fit ± 2 spreads in ${inside} of ${tot} runs of ${X.DC_SIDE.reps} cages`); }
  { const r = G.run(0, { seed: 3, bot: 'greedy' }), b = ch.resultBits(r.s, 0), r2 = G.run(0, { seed: 3, bot: 'greedy' }), b2 = ch.resultBits(r2.s, 0);
    t.ok(b >= 0 && b < 1073741824 && b === b2 && (b & 7) === 0, `result code: L1 bits ${b} fit 30 bits and repeat for (seed, actions)`);
    let ok = true; for (let lv = 1; lv < 5; lv++) { const q = G.run(lv, { seed: 3, bot: 'greedy' }), v = ch.resultBits(q.s, lv); if (!(v >= 0 && v < 1073741824 && (v & 7) === lv)) ok = false; } t.ok(ok, 'result code: every level fits 30 bits and names its level'); }
  { const s = G.reset(0, 2); sim.act({ k: 'add', b: 0 }); sim.act({ k: 'add', b: 2 }); sim.act({ k: 'clear' }); t.eq(s.chips, [0, 0, 0], 'Clear: every chip comes back');
    for (let i = 0; i < 10; i++) sim.act({ k: 'add', b: i < 7 ? 0 : 2 }); sim.act({ k: 'spin' }); sim.act({ k: 'predict', id: 'mean', v: 0.8 });
    let g = 0; while (s.phase !== 'bet' && g++ < 5000) { sim.step(sim.dt); if (s.phase === 'settle') sim.act({ k: 'next' }); }
    sim.act({ k: 'same' }); t.eq(s.chips, [7, 0, 3], 'Same bets: table 2 starts from table 1\'s chips in one action'); }
  { const C = ch.content, all = []; const walk = (o, at) => { if (typeof o === 'string') all.push([at, o]); else if (o && typeof o === 'object') for (const k in o) walk(o[k], at + '.' + k); }; walk(C, 'content');
    const barely = all.filter(([, x]) => /barely mov/i.test(x)); t.ok(!barely.length, 'words: no "barely moved/move" (Wave 1 G1: big jars do drift)' + (barely.length ? ' — ' + barely.map(b => b[0]).join(', ') : ''));
    const split = all.filter(([at, x]) => /^content\.(why|model)/.test(at) && !/\.params\./.test(at) && /\d\.\d/.test(x)); t.ok(!split.length, 'words: no decimals in Why? or MODEL text (the card splits sentences on every full stop)' + (split.length ? ' — ' + split.map(b => b[0]).join(', ') : ''));
    t.near(DC.buriH(DC.buriFounders()), DC.ghost16(0), 1e-12, 'L3: the bottles\' H and the croupier\'s 16-fly line start on the same scale (2pq of the 32 copies)'); }

  /* ---------- 6. bots: D3's five named strategies stay below three stars, per level and across the unit ---------- */
  { const bots = ['alwaysA', 'alwaysB', 'greedy', 'threshold', 'random'], seeds = FAST ? [1, 2] : [1, 2, 3, 4, 5, 6, 7, 8];
    const names = { alwaysA: 'all on the starting share', alwaysB: 'uniform', greedy: 'copy the croupier', threshold: 'all on mixed, always the volcano', random: 'random' };
    for (const b of bots) {
      let worst = 0, unitBest = 0;
      for (const sd of seeds) { let unit = 0; for (let lv = 0; lv < 5; lv++) { const r = G.run(lv, { seed: sd, bot: b }); const m = r.result ? r.result.mask : 0; unit |= m; if (m === 7) worst = 7; t.ok(!r.capped, `bot ${b} L${lv + 1} seed ${sd} finishes`); } const pc = ((unit & 1) ? 1 : 0) + ((unit & 2) ? 1 : 0) + ((unit & 4) ? 1 : 0); if (pc > unitBest) unitBest = pc; }
      t.ok(worst !== 7, `6. ${names[b]}: no level earns three stars`);
      if (b !== 'random') t.ok(unitBest < 3, `6. ${names[b]}: at most ${unitBest} unit stars across ${seeds.length} seeds`);
    } }

  /* ---------- a skilled policy earns the stars (scored against the expectation) ---------- */
  { const alloc = w => { const raw = w.map(x => 10 * x), b = raw.map(Math.floor); let left = 10 - b.reduce((a, x) => a + x, 0); raw.map((x, i) => [x - b[i], i]).sort((a, z) => z[0] - a[0]).slice(0, left).forEach(([, i]) => b[i]++); return b; };
    const smart = (s, acts) => {
      if (s.phase === 'ask') { const e = SC.expectAsk(s, s.ask.id); return acts.filter(a => a.k === 'predict').reduce((b, a) => Math.abs(a.v - e) < Math.abs(b.v - e) ? a : b); }
      if (s.phase === 'bet') { if (s.level === 3 && !s.fixedN && s.n !== 4) return { k: 'storm', n: 4 }; const tg = alloc(SC.expectBins({ level: s.level, N: s.N, p: s.p0, n: s.n, mode: 'w' })); for (let b = 0; b < tg.length; b++) { if (s.chips[b] < tg[b]) return { k: 'add', b }; if (s.chips[b] > tg[b]) return { k: 'rem', b }; } return { k: 'spin' }; }
      if (s.phase === 'erupt') return { k: 'erupt' };
      if (s.phase === 'zoo') { const Z = s.zoo; if (!Z.bal) return { k: 'bal' }; if (!Z.eq && Z.gen < 18) return { k: 'eq', on: true }; if (Z.eq && Z.gen >= 18) return { k: 'eq', on: false }; }
      return null;
    };
    const want = [3, 3, 7, 3, 5], seeds = FAST ? [1, 2] : [1, 2, 3, 4, 5];
    for (let lv = 0; lv < 5; lv++) { let ok = 0; for (const sd of seeds) { const r = G.run(lv, { seed: sd, policy: smart }); if (r.result && r.result.mask === want[lv]) ok++; } t.ok(ok === seeds.length, `skilled play L${lv + 1}: mask ${want[lv]} on ${ok} of ${seeds.length} seeds`); } }

  /* ---------- determinism, snapshots, replay ---------- */
  { const pol = G.bot('greedy'), a = G.run(1, { seed: 77, policy: pol }), b = G.run(1, { seed: 77, policy: pol });
    t.eq(a.s.won, b.s.won, 'determinism: the same seed and actions give the same chips'); t.eq(a.s.hist.map(h => h.fix), b.s.hist.map(h => h.fix), 'determinism: and the same fixation generations');
    const s = G.reset(2, 31); for (let i = 0; i < 10; i++) sim.act({ k: 'add', b: i % 3 }); sim.act({ k: 'spin' }); sim.act({ k: 'predict', id: 'h19', v: 0.22 }); for (let i = 0; i < 40; i++) sim.step(sim.dt);
    const snap = sim.snapshot(); for (let i = 0; i < 60; i++) sim.step(sim.dt); const after = JSON.stringify(sim.s.bot.map(B => B.k));
    sim.restore(snap); for (let i = 0; i < 60; i++) sim.step(sim.dt); t.eq(JSON.stringify(sim.s.bot.map(B => B.k)), after, 'snapshot: restoring a frozen generation replays exactly');
    const log = a.s.log.slice(), c = G.run(1, { seed: 77, policy: (st, acts, rnd, tick) => { const e = log.find(x => x[0] === tick); return e ? e[1] : null; } });
    t.eq(c.s.won, a.s.won, 'replay: (seed, logged actions) reproduces the run'); }

  /* ---------- What if? levers: each thaws the frozen table, changes one thing and ends in an Interesting result ---------- */
  for (let lv = 0; lv < 5; lv++) for (const lever of X.DC_LV[lv].levers) {
    const pol = G.bot('greedy'); let snap = null;
    G.reset(lv, 5); let ticks = 0;
    while (!sim.result() && ticks < 20000) { const L = X.DC_LV[lv], s = sim.s; const last = (L.tables && s.ti === L.tables.length - 1 && s.phase === 'bet') || (L.kind === 'buri' && s.phase === 'bet') || (L.kind === 'zoo' && s.phase === 'erupt');
      const acts = sim.actions(); const a = acts.length ? pol(s, acts, () => 0.5) : null; if (a) { sim.act(a); if (last && !snap && (a.k === 'spin' || a.k === 'erupt')) snap = sim.snapshot(); } sim.step(sim.dt); ticks++; }
    if (!snap) { t.ok(false, `What if? L${lv + 1} ${lever}: no frozen table`); continue; }
    G.reset(lv, 5, { thaw: { snap, lever } }); ticks = 0; while (!sim.result() && ticks < 20000) { sim.step(sim.dt); ticks++; }
    const r = sim.result(); t.ok(r && r.mask === 0 && r.interesting === lever, `What if? L${lv + 1} "${lever}" runs to its Interesting result in ${ticks} ticks`);
    if (lever === 'big') t.ok(sim.s.jars.filter(J => J.fix < 0).length >= 6, `What if? jars of 100: ${sim.s.jars.filter(J => J.fix < 0).length} of 12 still mixed at 30`);
    if (lever === 'vol10') t.ok(sim.s.jars.filter(J => J.fix >= 0).length >= 5, `What if? a volcano in every 200-bead jar: ${sim.s.jars.filter(J => J.fix >= 0).length} of 12 settle by 40`);
    if (lever === 'bigzoo') t.ok(sim.s.zoo.kept[sim.s.zoo.kept.length - 1] >= 11, `What if? a zoo of 300 keeps ${sim.s.zoo.kept[sim.s.zoo.kept.length - 1]} letters`);
  }
};
