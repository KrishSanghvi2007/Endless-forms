/* Oracle for The Black Country (v2/soot.js): the science and the sim contract, headless.
     node tests/oracle.js BUILD.html soot
   Checks (D1 §3.1 oracle 3, D5 §4 item 2 acceptance, D0 §3; review round of 14 Oct 2026):
     1 determinism (same seed and actions → same run); a saved wood enters as a logged action, so a replay rebuilds it,
       and a run without that action never reads the save;
     2 one carbonaria origin: 8 Cc moths at p = 1/30, no recurrent mutation, a black migrant only as the logged rescue,
       and the end card names the real cause of a loss (eaten or chance);
     3 dawn black share = 1 − (1 − p)² within sampling error, and the copy share sits below the black share;
     4 transmission: tomorrow's p = survivors' p × (1 − 1/N) within sampling error (the dominant-allele recursion, L4 and L5);
     5 tomorrow's newborns are in HW proportions from the survivors' copies (Monte Carlo breeding), and black needing two
       copies would be far rarer (the dusk line's claim);
     6 dominance over a symmetric span: from 6.6% of the favoured colour to half, the rise (dominant) is faster than the
       fall on bark clean at once (recessive), and the slow-cleaning bark adds more; L4 and L5 are finishable;
     7 the L5 MODEL card's path and the Why? pace numbers are the model's own deterministic projections;
     8 L6: stock binds, power needs both woods, every batch counts (no packing rule since D6 decision 9), the posterior
       comes from the player's own recaptures (strong data → camouflage; one wood or thin data → no confident call);
     9 What if? levers: pale dominant keeps the frozen black share; instant clean bark cleans the bark;
    10 D6 decision 9: the chapter's one prediction is Clean air's "when will black fall below half?"; a player who marks
       the expectation earns Predict; the stars never read the realised outcome of a prediction. */
'use strict';
module.exports = function (G, t) {
  const TB = G.TB, ch = G.ch, sim = G.sim, seeds = n => Array.from({ length: n }, (_, i) => i + 1);
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length), sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };
  const N = 120, K = TB.SOOT.K;

  // 1. determinism, the logged wood, and a canonical run never reading the save
  const r1 = G.run(0, { seed: 11, bot: 'greedy' }), r2 = G.run(0, { seed: 11, bot: 'greedy' });
  t.eq(r1.s.hist.map(h => [h.B, h.p]), r2.s.hist.map(h => [h.B, h.p]), 'same seed and bot → identical L4 history');
  const r3 = G.run(2, { seed: 5, bot: 'greedy' }), r4 = G.run(2, { seed: 5, bot: 'greedy' });
  t.eq(r3.s.data, r4.s.data, 'same seed and bot → identical L6 recaptures');
  t.ok(r1.result && r1.result.mask >= 0 && r1.result.mask <= 7, 'result() gives a star mask 0..7');
  const snap = (() => { G.reset(0, 21); for (let i = 0; i < 500; i++) sim.step(sim.dt); return sim.snapshot(); })();
  sim.restore(snap); for (let i = 0; i < 300; i++) sim.step(sim.dt); const a1 = JSON.stringify(sim.s.hist);
  sim.restore(snap); for (let i = 0; i < 300; i++) sim.step(sim.dt); t.eq(JSON.stringify(sim.s.hist), a1, 'snapshot → restore replays bit for bit (What if? vials)');
  {
    const W = { freqs: [0.45, 0.08], tone: [0.66, 0.06] }, lwRun = () => { G.reset(0, 9); sim.s.log = []; const a = { k: 'lw', w: W }; sim.s.log.push([0, a]); sim.act(a); for (let i = 0; i < 400; i++) sim.step(sim.dt); return { snap: JSON.stringify(sim.s.hist), wood: sim.s.wood, log: sim.s.log.slice() }; };
    const x = lwRun(), y = lwRun();
    t.ok(x.wood.saved && Math.abs(x.wood.pA - 0.45) < 1e-9 && x.log.length === 1 && x.log[0][1].k === 'lw', 'the saved wood enters as a logged action (it is in the replay log)');
    t.eq(x.snap, y.snap, 'replaying that log rebuilds the same wood and the same run');
    try { if (TB.Save.res && TB.Save.res.put) TB.Save.res.put('wood', { N: 120, gen: 6, seed: 9, freqs: [0.45, 0.08], tone: [0.66, 0.06], pins: [] }); } catch (e) { }
    G.reset(0, 9); const c1 = JSON.stringify(sim.s.hist), saved = sim.s.wood.saved;
    try { if (TB.Save.res && TB.Save.res.put) TB.Save.res.put('wood', null); } catch (e) { }
    G.reset(0, 9); t.ok(!saved && c1 === JSON.stringify(sim.s.hist), 'without the logged action a run never reads the local save (same link, same wood on every machine)');
  }

  // 2. one origin, the rescue, and the cause the end card names
  const s0 = G.reset(0, 3), cc = m => sim.cc(m.g);
  t.eq(s0.pop.reduce((a, m) => a + cc(m), 0), K.CARRIERS, `L4 starts with exactly ${K.CARRIERS} carbonaria copies (p = 1/30)`);
  t.eq(s0.pop.filter(m => cc(m) === 2).length, 0, 'all carriers are heterozygotes (one origin, no CC yet)');
  t.near(s0.hist[0].B, K.CARRIERS / N, 1e-9, 'so 6.7% of moths start black');
  let bad = 0, rescues = 0, flagged = 0, lossRuns = 0, breeds = 0, ate = 0, why = {}, rnp = 0, lostCards = 0;
  const orig = sim.breed;
  sim.breed = function (ev) {   // watch every breeding: C copies come only from parents, or from the one logged black migrant
    const surv = this.s.pop.filter(m => !m.dead), had = surv.reduce((a, m) => a + cc(m), 0), r0 = this.s.rescues, out = [];
    orig.call(this, out); for (const e of out) ev.push(e); breeds++;
    const kids = this.s.pop.filter(m => !m.mig).reduce((a, m) => a + cc(m), 0), mig = this.s.pop.filter(m => m.mig).reduce((a, m) => a + cc(m), 0);
    if (had === 0 && kids > 0) bad++;                       // a copy from nowhere would be recurrent mutation
    if (mig > 0 && this.s.rescues !== r0 + 1) bad++;        // a black migrant only as the rescue
    if (this.s.rescues > r0) { flagged++; if (!out.some(e => e.k === 'bred' && e.rescue)) bad++; if (r0 === 0 && this.s.lostWhy !== (had === 0 ? 'ate' : 'chance')) bad++; }
  };
  try {
    for (const sd of seeds(60)) {   // a bird that eats black moths first: carbonaria is often lost
      const eatBlack = (s, acts) => { if (s.phase !== 'hunt' && s.phase !== 'dawn') return acts.find(a => a.k === 'predict') || null; for (let i = 0; i < s.trunk.length; i++) if (sim.alive(i) && sim.black(s.pop[s.trunk[i]])) return { k: 'tap', i }; return acts.find(a => a.k === 'tap' && a.i >= 0) || null; };
      const r = G.run(0, { seed: sd, policy: eatBlack }); rescues += r.s.rescues; if (r.s.rescues) { lossRuns++; why[r.s.lostWhy] = (why[r.s.lostWhy] || 0) + 1; if (r.s.lostWhy === 'ate') ate++; }
      if (r.result && r.s.passed == null && r.s.rescues) { rnp++; if (/^lost_/.test(r.result.interesting || '')) lostCards++; }
    }
  } finally { sim.breed = orig; }
  t.eq(bad, 0, `over ${breeds} breedings no carbonaria copy appears without a parent; the black migrant comes only as the logged rescue, with its cause recorded (${rescues} rescues in ${lossRuns} of 60 runs)`);
  t.ok(rescues === flagged && rescues > 0 && ate > lossRuns / 2, `eating black moths loses carbonaria and the card says so: causes ${JSON.stringify(why)}`);
  t.ok(rnp > 0 && lostCards === rnp, `a rescued run that never passed half ends on a cause-specific card (${lostCards} of ${rnp})`);
  { const idle = G.run(0, { seed: 4, policy: () => null }); t.eq(idle.result && idle.result.interesting, 'flat_idle', 'a bird that never pecks gets the “little selection” card, not a claim about random eating'); }

  // 3 and 4: dawn genotypes and transmission, from many runs of a sharp-eyed bird
  const resB = [], resP = [], below = [], zs = [];
  for (const lv of [0, 1]) for (const sd of seeds(120)) {
    const r = G.run(lv, { seed: sd, bot: 'greedy' }), h = r.s.hist;
    for (let i = 0; i < h.length; i++) {
      const p = h[i].p; resB.push(h[i].B - (1 - (1 - p) * (1 - p)));
      if (p > 0 && p < 1) below.push(p < h[i].B ? 1 : 0);
      if (i > 0 && h[i - 1].dusk) { const ps = h[i - 1].dusk.p, e = ps * (1 - 1 / N); resP.push(h[i].p - e); const v = e * (1 - e) / (2 * N); if (v > 0) zs.push((h[i].p - e) / Math.sqrt(v)); }
    }
  }
  t.near(mean(resB), 0, 0.006, `dawn black share = 1 − (1 − p)²: mean residual ${mean(resB).toFixed(4)} over ${resB.length} dawns`);
  t.ok(sd(resB) < 0.05, `… and its spread (${sd(resB).toFixed(3)}) is sampling noise in 120 moths`);
  t.eq(mean(below), 1, `the C copy share is below the black share at every dawn with both alleles present (${below.length} dawns)`);
  t.near(mean(resP), 0, 0.004, `tomorrow's p = survivors' p × (1 − 1/N): mean residual ${mean(resP).toFixed(4)} over ${resP.length} generations`);
  t.near(sd(zs), 1, 0.15, `… with binomial sampling of 240 copies (z-score SD ${sd(zs).toFixed(2)}; migrant and pairing noise included)`);

  // 5. the expectations the stars use match breeding from the same survivors
  {
    G.reset(0, 8); let n = 0; while (!(sim.s.phase === 'dusk' && sim.s.gen === 5) && n++ < 20000) { const A = sim.actions(), b = ch.sim.bots.greedy(sim.s, A); if (b) sim.act(b); sim.step(sim.dt); }
    const p = sim.s.hist[sim.s.hist.length - 1].dusk.p, f = 1 - 1 / N, q = 1 - p, eG = [f * p * p, f * 2 * p * q, f * q * q + (1 - f)], e3 = 1 - eG[2], eT = eG[0], sn = sim.snapshot();
    const B = [], CC = [], G3 = [[], [], []];
    for (let k = 0; k < 400; k++) { sim.restore(sn); TB.seed(1000 + k); sim.breed([]); const st = sim.stats(sim.s.pop); B.push(st.B); CC.push(st.G[0]); st.G.forEach((x, i) => G3[i].push(x)); }
    t.near(mean(B), e3, 0.008, `black tomorrow from the survivors' copies, 1 − q² (${e3.toFixed(3)}) = mean of 400 breedings (${mean(B).toFixed(3)})`);
    t.near(mean(CC), eT, 0.008, `if two copies were needed: CC share ${eT.toFixed(3)} = mean CC share (${mean(CC).toFixed(3)})`);
    t.ok(eG.every((x, i) => Math.abs(x - mean(G3[i])) < 0.01), 'HW newborns from the survivors = mean genotype shares of 400 breedings');
    t.ok(eT < e3 - 0.15, `if black needed two copies it would be far rarer tomorrow (${eT.toFixed(2)} vs ${e3.toFixed(2)})`);
  }

  // 6. dominance over a symmetric span (both levels: 6.6% of the favoured colour → half), with and without the bark lag
  {
    const s4 = G.reset(0, 1).hist[0].B, s5 = mean(seeds(60).map(sd => 1 - G.reset(1, sd).hist[0].B));
    t.ok(Math.abs(s4 - (1 - K.P5) * (1 - K.P5)) < 0.005 && Math.abs(s5 - s4) < 0.01, `symmetric starts: L4 ${(100 * s4).toFixed(1)}% black; L5 ${(100 * s5).toFixed(1)}% pale on average over 60 seeds`);
    const rise = [], fallClean = [], fallLag = [], fin = []; let passed = 0;
    for (const sd of seeds(60)) {
      const a = G.run(0, { seed: sd, bot: 'greedy' }).s, i = a.hist.findIndex(h => h.B >= 0.5); if (i >= 0) { rise.push(i); } if (a.passed != null) passed++;
      const c = G.run(1, { seed: sd, bot: 'greedy', reset: { p5: K.P5, lever: 'nolag' } }).s; fallClean.push(c.crossGen ? c.crossGen - 1 : 16);
      const l = G.run(1, { seed: sd, bot: 'greedy', reset: { p5: K.P5 } }).s; fallLag.push(l.crossGen ? l.crossGen - 1 : 16);
      const j = G.run(1, { seed: sd, bot: 'greedy' }).s; fin.push(j.crossGen != null ? 1 : 0);
    }
    t.ok(passed >= 54, `L4 is finishable: with a sharp-eyed bird black passes half within 8 generations in ${passed} of 60 seeds`);
    t.ok(mean(fallClean) > mean(rise) + 1, `dominance alone: black rose to half in ${mean(rise).toFixed(1)} generations; on bark clean at once pale took ${mean(fallClean).toFixed(1)}`);
    t.ok(mean(fallLag) > mean(fallClean) + 0.8, `the slow-cleaning bark adds more: ${mean(fallLag).toFixed(1)} generations with it`);
    t.ok(fin.reduce((a, b) => a + b, 0) >= 54, `L5 is finishable: black falls below half within 16 generations in ${fin.reduce((a, b) => a + b, 0)} of 60 seeds (start jittered)`);
  }

  // 7. the L5 MODEL card's path and the Why? pace numbers are the model's deterministic projections (default wood, designed rule, 12 meals)
  {
    const S = TB.SOOT, K5 = K.SOOT5, f = 1 - 1 / N, rho = x => S.rho([], x >= 0.5 ? 'soot' : 'clean', x, 0.72), pct = a => a.map(b => Math.round(b * 100));
    const lag = pct(S.project(K.P5 / f, 10, i => K5[i] != null ? K5[i] : 0, rho, 12, true, 1)), clean = S.project(K.P5 / f, 16, () => 0, rho, 12, true, 1), up = S.project(K.CARRIERS / (2 * N) / f, 14, () => 1, rho, 12, true, 1);
    const card = ch.content.model.find(m => m.level === 1).simplification, nums = (card.split('start:')[1] || '').match(/\d+/g).map(Number);
    t.note('L5 projection, % black by generation: ' + lag.join(', '));
    t.eq(nums, lag, 'the L5 MODEL card quotes the model’s own projection');
    const iUp = up.findIndex(b => b >= 0.5), iClean = clean.findIndex(b => b < 0.5), iLag = S.project(K.P5 / f, 16, i => K5[i] != null ? K5[i] : 0, rho, 12, true, 1).findIndex(b => b < 0.5);
    const pace = ch.content.why.maths[2], pn = pace.match(/about (\d+)/g).map(x => +x.split(' ')[1]);
    t.note(`designed crossings: rise ${iUp}, fall on clean bark ${iClean}, fall with the bark lag ${iLag} generations`);
    t.ok(pn[0] === iUp && pn[1] === iClean && pn[2] === iLag - iClean, `the Why? pace text (about ${pn.join(', ')}) matches the projections`);
  }

  // 8. L6: stock, power, every batch counted, posterior from the player's own data, the verdict
  {
    G.reset(2, 4); const P0 = sim.power6();
    t.eq(P0, 0, 'no moths released → no power');
    const J = [[150, 222], [246, 308], [150, 400], [240, 460]];
    const rel = (w, nights, per) => { for (let n = 0; n < nights; n++) { sim.act({ k: 'wood', w }); for (const j of J.slice(0, per || 4)) sim.act({ k: 'release', x: j[0], y: j[1] }); sim.act({ k: 'night' }); if (sim.s.ask) sim.act({ k: 'predict', id: sim.s.ask.id, v: 0.5 }); for (let i = 0; i < 400 && sim.s.phase !== 'place' && sim.s.phase !== 'conclude'; i++) sim.step(sim.dt); } };
    rel('soot', 1); const P1 = sim.power6(); rel('clean', 1); const P2 = sim.power6(); rel('soot', 2); rel('clean', 2); const P3 = sim.power6();
    t.ok(P1 === 0 && P2 > 0 && P3 > P2, `power needs both woods and grows with moths (${P2.toFixed(2)} → ${P3.toFixed(2)})`);
    t.ok(P3 >= 0.8, `the whole stock, split evenly at spaced sites, reaches 80% power (${P3.toFixed(2)})`);
    t.ok(sim.s.stock === 0 && (sim.s.phase === 'conclude'), 'the stock binds: 24 batches, then the verdict');
    let good = 0, split = 0, thin = 0;
    for (const sd of seeds(100)) {
      G.reset(2, sd); rel('soot', 3); rel('clean', 3); const po = sim.posterior6(); if (po.rev > 0.8) good++;
      G.reset(2, sd); rel('soot', 3); const p1 = sim.posterior6(); if (Math.abs(p1.rev - p1.black) < 0.01) split++;
      G.reset(2, sd); rel('soot', 1, 1); rel('clean', 1, 1); if (sim.posterior6().rev < 0.8) thin++;
    }
    t.ok(good >= 85, `with both woods and the whole stock the evidence favours camouflage (posterior > 0.8) in ${good} of 100 seeds`);
    t.ok(split >= 99, `one wood alone cannot tell camouflage from "black is tougher" (posteriors equal in ${split} of 100)`);
    t.ok(thin >= 60, `one batch per wood is too thin for a confident call (posterior < 0.8 in ${thin} of 100 seeds)`);
    G.reset(2, 7); sim.act({ k: 'release', x: 150, y: 222 }); sim.act({ k: 'release', x: 160, y: 230 }); const b = sim.s.batches;
    t.ok(b.length === 2 && sim.risk6('soot', false) - sim.risk6('soot', true) > 0.29 && sim.risk6('clean', true) - sim.risk6('clean', false) > 0.29, 'birds take more of the colour that stands out on each bark (designed gap ×3)');
    sim.act({ k: 'night' }); t.ok(!sim.s.ask && sim.s.phase === 'night', 'the night runs at once: no prediction before it (D6 decision 9)');
    for (let i = 0; i < 400 && sim.s.phase !== 'place'; i++) sim.step(sim.dt);
    t.ok(sim.s.data.soot.nb === 10 && sim.s.aside.soot.nb === 0, 'every released batch is counted as evidence (the packing rule was cut)');
    const strong = { rev: 0.99, black: 0, pale: 0, none: 0 }, weak = { rev: 0.6, black: 0.1, pale: 0.1, none: 0.1 };
    const st = (hyp, post) => ch.stars.transfer({ hyp, post }, 2);
    t.ok(st('rev', strong) && !st('rev', weak) && !st('black', strong), 'the verdict: camouflage with strong evidence wins; thin data or the wrong idea does not');
    G.reset(2, 7); sim.act({ k: 'conclude' }); sim.act({ k: 'submit' }); t.eq(sim.s.phase, 'conclude', 'Submit needs an idea first'); sim.act({ k: 'hyp', h: 'rev' }); sim.act({ k: 'submit' }); t.eq(sim.s.phase, 'over', 'an idea and Submit end the level (no confidence pips)');
    const gr = G.run(2, { seed: 3, bot: 'greedy' }); t.ok(gr.result && gr.result.outcome.post != null && gr.s.post && Math.abs(gr.s.post.rev - gr.result.outcome.post) < 1e-12, 'the posterior shown at the verdict is computed from the run’s own recaptures');
  }

  // 9. What if? levers
  {
    let worst = 0;
    for (const sd of seeds(20)) {
      G.reset(1, sd); let n = 0; while (sim.s.gen < 2 && n++ < 5000) { const A = sim.actions(), b = ch.sim.bots.greedy(sim.s, A); if (b) sim.act(b); sim.step(sim.dt); }
      const B0 = sim.s.hist[sim.s.hist.length - 1].B, sn = sim.snapshot(); sim.reset(1, { thaw: { snap: sn, lever: 'paledom' } });
      worst = Math.max(worst, Math.abs(sim.s.hist[sim.s.hist.length - 1].B - B0));
    }
    t.ok(worst < 0.02, `“Pale dominant” keeps the frozen black share (largest jump ${worst.toFixed(3)}): the change is in selection, not a re-reading`);
    G.reset(1, 3); const sn = sim.snapshot(); sim.reset(1, { thaw: { snap: sn, lever: 'nolag' } });
    t.ok(sim.s.soot === 0 && sim.sootAt(2) === 0 && sim.s.autoAll, '“Instant clean bark” cleans the bark at once; the rerun hunts by contrast');
  }

  // 10. stars against the expectation; the fingertip floor
  {
    let pred = 0, asks = [0, 0, 0], mirror = 0;
    const smart = (s, acts) => { if (s.ask) { const e = sim.expect(s.ask); return { k: 'predict', id: s.ask.id, v: s.ask.kind === 'x' ? Math.round(e) : e }; } return ch.sim.bots.greedy(s, acts); };
    for (const sd of seeds(20)) {
      for (const lv of [0, 2]) asks[lv] += G.run(lv, { seed: sd, policy: smart }).s.asks.length;
      const r = G.run(1, { seed: sd, policy: smart }); asks[1] += r.s.asks.length; if (r.result && (r.result.mask & 2)) pred++;
      const m = G.run(1, { seed: sd, policy: (s, acts) => s.ask ? { k: 'predict', id: s.ask.id, v: Math.min(s.ask.hi, 1 + 5) } : ch.sim.bots.greedy(s, acts) }); if (m.result && (m.result.mask & 2)) mirror++;
    }
    t.eq(asks, [0, 20, 0], 'one prediction in the chapter: Clean air asks once (b1); the Black Country and the evidence ask nothing');
    t.eq(pred, 20, 'a player who marks the expectation earns the Predict star in Clean air (20 of 20 seeds)');
    t.ok(mirror <= 6, `the naive mirror ("pale returns as fast as black rose") mostly misses: ${mirror} of 20 hit`);
    const src = String(ch.stars.predict) + String(ch.stars.transfer);
    t.ok(!/hist\[|\.B\b|\.p\b/.test(src), 'Predict and Transfer read hit flags and the evidence, never the realised trajectory');
  }
};
