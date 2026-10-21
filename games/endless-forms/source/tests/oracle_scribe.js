/* tests/oracle_scribe.js: science and engineering oracle for The Scribe (v2). Run: node tests/oracle.js BUILD.html scribe
   D5 §4 item 13 acceptance: plate variance/mean ≈ 1 if induced and ≫ 1 if pre-existing (10⁴ seeds); the p₀ estimator unbiased
   within 10%; both DFE ghosts disclosed. Plus: DFE tallies match the designed shares and are independent of the source; the
   Luria–Delbrück mean and p₀ match theory; the ask expectations (20e^(−m), log μ, 10(1 − e^(−1.5)), the new-sugar share) match
   Monte Carlo; velvet prints match on A and B and not under the induced lever; determinism, replay and snapshots; the expert earns
   every star offered; no bot reaches three stars in a level or across the unit; result texts agree with their runs; untimed
   paths finish; What if? runs earn nothing; the first spark waits. SC_FAST=1 runs fewer seeds. */
'use strict';
module.exports = function (G, t) {
  const { sim, ch, TB } = G, FAST = !!process.env.SC_FAST, NS = FAST ? 12 : 40, NMC = FAST ? 2000 : 10000;
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const vmr = a => { const m = mean(a); return m ? a.reduce((x, y) => x + (y - m) * (y - m), 0) / (a.length - 1) / m : 0; };

  /* 1. Luria–Delbrück: theory, the pre-existing counts and the induced (Poisson) counts over 10⁴ seeds */
  { G.reset(1, 1); const m = sim.ldM(), mu = sim.ldMean(), L = 20;
    t.near(m, 1.3107, 0.001, `expected mutations a tube m = μ(N_t − N₀) = ${m.toFixed(4)}`);
    t.near(mu, 11.14, 0.01, `expected resistant cells a tube G·m/2 = ${mu.toFixed(3)}`);
    const pre = [], ind = [], vPre = [], vInd = [];
    let zeros = 0;
    for (let seed = 1; seed <= NMC; seed++) {
      G.reset(1, seed); const a = [], b = [];
      for (let i = 0; i < L; i++) { a.push(sim.ldCount()); b.push(TB.WF.binom(100 * 131072, mu / (100 * 131072))); }
      for (const x of a) { pre.push(x); if (x === 0) zeros++; } for (const x of b) ind.push(x);
      vPre.push(vmr(a)); vInd.push(vmr(b));
    }
    const p0 = zeros / pre.length, mp = mean(pre), mi = mean(ind);
    t.near(p0, Math.exp(-m), 0.01, `share of empty plates ${p0.toFixed(4)} against e^(−m) = ${Math.exp(-m).toFixed(4)} (${pre.length} tubes)`);
    t.ok(Math.abs(mi - mu) < 0.05 * mu, `induced mean ${mi.toFixed(2)} against ${mu.toFixed(2)}`);
    t.ok(Math.abs(mp - mu) < 0.25 * mu, `pre-existing mean ${mp.toFixed(2)} against ${mu.toFixed(2)} (heavy tail: within 25%)`);
    const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
    t.near(mean(vInd), 1, 0.05, `induced: mean variance/mean over 20-plate racks ${mean(vInd).toFixed(3)} ≈ 1 (${NMC} seeds)`);
    t.ok(med(vPre) > 5 && mean(vPre) > 10, `pre-existing: variance/mean median ${med(vPre).toFixed(1)}, mean ${mean(vPre).toFixed(1)} ≫ 1`);
    t.ok(vPre.filter(v => v > 3).length > 0.75 * vPre.length && vInd.filter(v => v > 3).length < 0.001 * vInd.length, `fluctuation test separates: ${(100 * vPre.filter(v => v > 3).length / vPre.length).toFixed(1)}% of racks above 3 pre-existing, ${(100 * vInd.filter(v => v > 3).length / vInd.length).toFixed(2)}% induced`);
    /* 2. the p₀ estimator over 20-plate racks: m̂ = −ln(z/20) */
    const mh = []; let zr = 0;
    for (let r = 0; r < pre.length / L; r++) { const z = pre.slice(r * L, r * L + L).filter(x => x === 0).length; if (z === 0) { zr++; continue; } mh.push(-Math.log(z / L)); }
    const bias = mean(mh) / m - 1;
    t.ok(Math.abs(bias) < 0.10, `p₀ estimator: mean m̂ ${mean(mh).toFixed(4)} against m ${m.toFixed(4)}, bias ${(100 * bias).toFixed(1)}% (< 10%; ${zr} racks with no empty plate dropped)`);
    const within2 = mh.filter(x => x >= m / 2 && x <= 2 * m).length / mh.length;
    t.ok(within2 > 0.9, `m̂ within a factor of 2 of m on ${(100 * within2).toFixed(1)}% of racks (the μ ask's band is fair to an honest reader)`);
    t.near(sim.zExp(), 20 * Math.exp(-m), 1e-3, `empty-plate expectation 20e^(−m) = ${sim.zExp()}`);
    const kh = sim.kHi(); let tail = 0; for (let k = kh; k < 200; k++) { let p = Math.exp(-mu); for (let i = 1; i <= k; i++) p *= mu / i; tail += p; }
    t.ok(tail < 0.001 && kh > 15 && kh < 30, `jackpot line ${kh}: P(count ≥ ${kh}) = ${tail.toExponential(2)} under the phage-caused process`);
    t.note(`jackpot plates per rack (pre-existing): ${(pre.filter(x => x >= kh).length / (pre.length / L)).toFixed(2)}; induced: ${(ind.filter(x => x >= kh).length / (ind.length / L)).toFixed(4)}`);
  }

  /* 3. the DFE: tallies match the designed shares; source independent of effect; the first spark waits */
  { const cnt = [0, 0, 0, 0], src = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]; let n = 0;
    for (let seed = 1; seed <= (FAST ? 300 : 2000); seed++) { G.reset(0, seed); const s = sim.s; for (let k = 0; k < 40; k++) { s.rho = 0.5; sim.spark(s, [], false); } for (const p of s.sp) { cnt[p.cls]++; src[p.cls][p.src]++; n++; } }
    const D = [0.35, 0.30, 0.34, 0.01];
    t.ok(cnt.every((c, i) => Math.abs(c / n - D[i]) < 3 * Math.sqrt(D[i] * (1 - D[i]) / n) + 0.002), `DFE tallies ${cnt.map(c => (100 * c / n).toFixed(2) + '%').join(', ')} match 35/30/34/1 (${n} sparks)`);
    const srcSh = src.map(r => { const k = r.reduce((x, y) => x + y, 0); return r.map(x => x / k); });
    t.ok(srcSh.slice(0, 3).every(r => Math.abs(r[0] - 0.55) < 0.02 && Math.abs(r[1] - 0.25) < 0.02), `source shares are the same in every effect class (sparks look alike): ${srcSh.map(r => (100 * r[0]).toFixed(0)).join('/')}% copying slips`);
    G.reset(0, 3); let k = 0; while (sim.s.seen === 0 && k < 100) { sim.step(sim.dt); k++; }
    for (let j = 0; j < 300; j++) sim.step(sim.dt);
    t.ok(sim.s.sp.some(p => p.wait && !p.gone), 'the first spark waits for its tag (the first action cannot fail)');
    const ds = ch.dfeSpec ? null : null; G.reset(0, 4); sim.s.hits.d1 = false;
    const tri = ch.triSpec.call(Object.assign(Object.create(ch), { sim }));
    t.ok(tri.pts.length >= 0 && Array.isArray(tri.trail), 'the triangle spec builds after the ask');
    const dfe = ch.dfeSpec.call(Object.assign(Object.create(ch), { sim }));
    t.ok(dfe.ticks.some(q => q.dot) && dfe.ticks.some(q => !q.dot) && dfe.note && /under 1%/.test(dfe.note.text), 'both ghosts disclosed on the fates chart: the model, a virus measured, and the genome-wide range');
  }

  /* 4. a level-0 run: fates, shares and the interesting text agree with the run */
  { let ok = 0, okI = 0, nf = [];
    for (let seed = 1; seed <= NS; seed++) {
      const r = G.run(0, { seed, bot: 'expert' }), s = r.s; nf.push(s.fates);
      const tagged = s.sp.filter(p => p.tag && p.fate), c = [0, 1, 2, 3].map(i => tagged.filter(p => p.cls === i).length);
      if (c.every((x, i) => x === s.cnt[i]) && s.fates === tagged.length) ok++;
      const I = r.result.interesting; if ((I === 'winner') === (s.fates >= 30 && s.cnt[3] > 0) && (I === 'few') === (s.fates < 30)) okI++;
    }
    t.eq(ok, NS, `L0 tallies equal the tagged lineages' classes on every seed (mean ${mean(nf).toFixed(1)} fates for a perfect tagger)`);
    t.eq(okI, NS, 'L0 interesting text matches the run');
  }

  /* 5. velvet: A and B carry the same spots; the induced lever does not; the picked colony decides the line */
  { let same = 0, indMatch = [], right = 0;
    for (let seed = 1; seed <= NS; seed++) {
      const r = G.run(2, { seed, bot: 'expert' }), s = r.s; if (s.m2res === 1 && s.m1[s.pick].res === 1 && r.result.mask === 3) right++;
      G.reset(2, seed); const S = sim.s; sim.lever('inducedD'); for (let k = 0; k < 200 && S.phase !== 'over'; k++) sim.step(sim.dt);
      const A = sim.s.indA || [], B = sim.s.indB || []; let m = 0; for (const b of B) if (A.some(a => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 < 0.01)) m++; indMatch.push(B.length ? m / B.length : 0); same++;
    }
    t.eq(right, NS, 'expert picks the matching colony: its line is resistant and earns Discover + Predict');
    t.ok(mean(indMatch) < 0.3, `under "the drug causes it", only ${(100 * mean(indMatch)).toFixed(0)}% of B's spots match A's`);
    let wrong = 0; for (let seed = 1; seed <= NS; seed++) { const r = G.run(2, { seed, bot: 'alwaysA' }), s = r.s; if (!s.m1[0].res && (s.m2res !== 0 || r.result.interesting !== 'wrong')) wrong++; }
    t.eq(wrong, 0, 'a wrong pick yields a sensitive line and the "wrong" text');
  }

  /* 6. the boss: new-sugar expectation against Monte Carlo; patients 10(1 − e^(−1.5)) */
  { const wins = [], exps = [], pats = [];
    for (let seed = 1; seed <= NS * 3; seed++) { const r = G.run(3, { seed, bot: 'expert' }), s = r.s; if (s.pa && s.pa.length) { wins.push(s.pa.filter(q => q.win).length / s.pa.length); exps.push(s.exp.b1); } if (s.pt) pats.push(s.pt.filter(x => x).length); }
    t.ok(Math.abs(mean(wins) - mean(exps)) < 0.05, `new-sugar winners ${mean(wins).toFixed(3)} against the expectation ${mean(exps).toFixed(3)}`);
    t.near(sim.patExp(), 10 * (1 - Math.exp(-1.5)), 1e-3, `patients expected to carry resistance: ${sim.patExp()}`);
    t.ok(Math.abs(mean(pats) - sim.patExp()) < 0.5, `realised patients ${mean(pats).toFixed(2)} against ${sim.patExp()}`);
  }

  /* 7. determinism, replay and snapshots */
  { for (const lv of [0, 1, 2, 3]) {
      const a = G.run(lv, { seed: 11, bot: 'random' }), sa = JSON.stringify(a.s), log = a.s.log.slice();
      const b = G.run(lv, { seed: 11, bot: 'random' }); t.ok(JSON.stringify(b.s) === sa, `L${lv}: same seed and bot, same final state`);
      TB.seed(11); ch.level = lv; sim.reset(lv, {}); sim.s.log = []; let i = 0, tick = 0;
      while (!sim.result() && tick < 40000) { while (i < log.length && log[i][0] === tick) { sim.act(log[i][1]); i++; } if (sim.result()) break; sim.step(sim.dt); tick++; }
      t.ok(JSON.stringify(Object.assign({}, sim.s, { log: [] })) === JSON.stringify(Object.assign({}, a.s, { log: [] })), `L${lv}: replaying the logged actions reproduces the run`);
      G.reset(lv, 5); for (let k = 0; k < 400; k++) { const A = sim.actions(); if (A.length) sim.act(A[0]); sim.step(sim.dt); }
      const snap = sim.snapshot(), s1 = JSON.stringify(sim.s); for (let k = 0; k < 50; k++) sim.step(sim.dt); const after = JSON.stringify(sim.s);
      sim.restore(snap); t.ok(JSON.stringify(sim.s) === s1, `L${lv}: snapshot round trip`); for (let k = 0; k < 50; k++) sim.step(sim.dt); t.ok(JSON.stringify(sim.s) === after, `L${lv}: restored run continues identically`);
    } }

  /* 8. stars: the expert earns every star offered; no bot earns three in a level or across the unit; What if? earns nothing */
  { const offer = [3, 3, 3, 5]; let exp = 0;
    for (let seed = 1; seed <= NS; seed++) { const m = [0, 1, 2, 3].map(lv => G.run(lv, { seed, bot: 'expert' }).result.mask); if (m.every((x, i) => x === offer[i])) exp++; }
    t.eq(exp, NS, `expert earns D+P, D+P, D+P, D+T on every seed (${NS})`);
    const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'lazy', 'allIn']; let worst = 0, three = 0;
    for (const b of bots) for (let seed = 1; seed <= NS; seed++) {
      const m = [0, 1, 2, 3].map(lv => { const r = G.run(lv, { seed, bot: b }); return r.result ? r.result.mask : 0; });
      if (m.some(x => x === 7)) three++; const u = ch.unitStars(m), k = (u & 1) + (u >> 1 & 1) + (u >> 2 & 1); worst = Math.max(worst, k);
    }
    t.eq(three, 0, 'no bot earns three stars in any level');
    t.ok(worst < 3, `no bot's unit union reaches three stars (best ${worst})`);
    for (const [lv, k] of [[0, 'bigU'], [1, 'induced'], [2, 'inducedD'], [3, 'fixed']]) {
      const r = G.run(lv, { seed: 9, bot: 'expert' }), snap = sim.snapshot(); TB.seed(9); ch.level = lv; sim.reset(lv, { thaw: { snap, lever: k } }); let n = 0;
      while (!sim.result() && n < 20000) { sim.step(sim.dt); n++; }
      t.ok(sim.result() && sim.result().mask === 0, `What if? ${k} finishes (${n} ticks) and earns nothing`);
      if (k === 'induced') t.ok(sim.s.n.filter(x => x === 0).length <= 1 && sim.vmr(sim.s.n) < 3, `induced plates: ${sim.s.n.filter(x => x === 0).length} empty, spread ${sim.vmr(sim.s.n).toFixed(2)}`);
    }
  }

  /* 9. untimed paths finish; every level ends for a random clicker within the tick cap */
  { for (const lv of [0, 1, 2, 3]) { const r = G.run(lv, { seed: 2, bot: 'greedy', untimed: true }); t.ok(!r.capped && r.s.unt, `L${lv} untimed run finishes (${r.ticks} ticks)`); }
    for (const lv of [0, 1, 2, 3]) { let capped = 0; for (let seed = 1; seed <= NS; seed++) if (G.run(lv, { seed, bot: 'random' }).capped) capped++; t.eq(capped, 0, `L${lv}: a random clicker always reaches the end`); } }

  /* 10. the L1 interesting text and Discover agree with the plates */
  { let ok = 0; for (let seed = 1; seed <= NS; seed++) { const r = G.run(1, { seed, bot: 'expert' }), s = r.s, mx = Math.max.apply(null, s.n), I = r.result.interesting; if ((I === 'nojack') === (mx < sim.kHi()) && I !== 'misflag' && (r.result.mask & 1)) ok++; }
    t.eq(ok, NS, 'L1: "no jackpot" text only when no plate passes the line; an exact flagger earns Discover'); }
};
