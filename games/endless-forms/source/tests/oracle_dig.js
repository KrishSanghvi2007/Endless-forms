/* tests/oracle_dig.js: science and engineering oracle for The Dig (v2). Run: node tests/oracle.js BUILD.html dig
   D3 §5.6 / D5 §4 item 17 acceptance: preserved shares match the burial probabilities over 1,000 runs; decay counts are Poisson
   (binomial per atom); age estimates are unbiased. Plus: 2SE intervals cover the truth about 95% of the time; four times the atoms
   halves the error bar; the in-between find rate; the log ribbon maths; determinism, replay and snapshots; the expert earning every
   star offered; no level offering three stars to any bot; no bot's union across the unit reaching three stars; untimed play;
   What if? runs earning nothing. DG_FAST=1 runs fewer seeds. */
'use strict';
module.exports = function (G, t) {
  const { sim, ch } = G, FAST = !!process.env.DG_FAST, NS = FAST ? 120 : 400;
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const vari = a => { const m = mean(a); return mean(a.map(x => (x - m) * (x - m))) * a.length / Math.max(1, a.length - 1); };

  /* 1. taphonomy: realised kept shares match the expectation from each animal's keeping chance and the layer survival */
  { const r = G.run(0, { seed: 3, bot: 'expert' }), base = JSON.parse(JSON.stringify(r.s)), ex = sim.keptExp(base), ks = [];
    const N = FAST ? 300 : 1000;
    for (let k = 0; k < N; k++) { G.TB.seed(1000 + k); sim.s = JSON.parse(JSON.stringify(base)); sim.uplift(sim.s, []); ks.push(sim.s.kept / 48); }
    const m = mean(ks), se = Math.sqrt(vari(ks) / N);
    t.ok(Math.abs(m - ex) < 3.5 * se + 1e-9, `kept share over ${N} runs ${m.toFixed(4)} vs expected ${ex.toFixed(4)} (± ${(3.5 * se).toFixed(4)})`);
    const still = sim.keptExp(base, { still: true }), noer = sim.keptExp(base, { noerode: true });
    t.ok(still > ex && noer > ex, `still water (${still.toFixed(3)}) and no erosion (${noer.toFixed(3)}) both keep more than the run (${ex.toFixed(3)})`);
    t.near(noer * 0.75, ex, 1e-9, 'erosion scales the expectation by the layer survival 0.75');
    t.ok(sim.pf('brach', 1, 0) > 10 * sim.pf('worm', 1, 0) && sim.pf('worm', 1, 1) >= 10 * sim.pf('worm', 1, 0), 'a buried shell keeps far more often than a soft body; still water multiplies soft keeping ≥ 10×'); }

  /* 2. decay: each atom decays independently with a fixed hazard; counts at one half-life are binomial(64, ½); short-window counts Poisson-like */
  { const at = [];
    for (let seed = 1; seed <= NS; seed++) { G.reset(1, seed); let k = 0; while (sim.s.h == null && k < 20000) { sim.step(sim.dt); k++; } at.push(sim.s.h); }
    const m = mean(at), v = vari(at);
    t.near(m, 32, 4 * Math.sqrt(16 / NS), `atoms left at one half-life: mean ${m.toFixed(2)} (binomial 32)`);
    t.ok(v > 16 * 0.7 && v < 16 * 1.35, `variance at one half-life ${v.toFixed(2)} (binomial 16)`);
    const e = []; for (let seed = 1; seed <= NS; seed++) { G.reset(1, seed); while (sim.s.T < 100 - 1e-9) sim.step(sim.dt); e.push(64 - sim.s.n); }
    const pe = 1 - Math.pow(2, -sim.s.T / 704), me = mean(e), ve = vari(e);
    t.near(me, 64 * pe, 4 * Math.sqrt(64 * pe / NS), `decays in the first ${sim.s.T.toFixed(0)} Myr: mean ${me.toFixed(2)} (expected ${(64 * pe).toFixed(2)})`);
    t.ok(ve / me > 0.7 && ve / me < 1.25, `short-window decay counts are Poisson-like: variance/mean ${(ve / me).toFixed(2)} (binomial ${(1 - pe).toFixed(2)})`); }

  /* 3. dating: the U–Pb estimator is unbiased to within 1% with spots of 40 atoms; 2SE covers the truth about 95% of the time */
  { const rel = [], cov = [], halves = [];
    for (let seed = 1; seed <= NS; seed++) {
      G.reset(2, seed); const s = sim.s; sim.chip(s, [], 0); sim.chip(s, [], 1);
      for (let i = 0; i < 30; i++) { sim.spot(s, [], 1, i); if (s.ask) sim.commit(s, [], s.ask.id, null); }
      const E = sim.zEst(s.z[1]); rel.push(E.t / s.z[1].t - 1); cov.push(Math.abs(E.t - s.z[1].t) <= E.e ? 1 : 0);
      halves.push(sim.zTrueErr(s.z[1], 4 * s.z[1].n) / sim.zTrueErr(s.z[1], s.z[1].n));
    }
    t.ok(Math.abs(mean(rel)) < 0.01, `zircon age estimate bias ${(100 * mean(rel)).toFixed(2)}% over ${NS} crystals`);
    t.ok(mean(cov) > 0.9 && mean(cov) < 0.99, `two-standard-error bars cover the true age in ${(100 * mean(cov)).toFixed(1)}% of crystals (≈ 95%)`);
    t.near(mean(halves), 0.5, 1e-9, 'four times the atoms halves the error bar');
    G.reset(1, 5); const s = sim.s; s.tA = 704; s.ns = 64; s.nu = 32; t.near(sim.ashEst(s), 704, 1e-6, 'half the uranium left reads one half-life');
    s.nu = 16; t.near(sim.ashEst(s), 1408, 1e-6, 'a quarter left reads two half-lives'); }

  /* 4. where to dig: a season in 375-Myr river rock finds an in-between form with chance 0.5; never in sea rock */
  { let n = 0, f = 0, sea = 0;
    for (let seed = 1; seed <= NS; seed++) { G.reset(3, seed); const s = sim.s; const o = s.crops.findIndex(c => c.age === 375 && c.env === 'river'), q = s.crops.findIndex(c => c.age === 375 && c.env === 'sea'); sim.dig(s, [], o); n++; if (s.digs[0].f === 'fishapod') f++; s.phase = 'pick'; sim.dig(s, [], q); if (s.digs[1].f === 'fishapod') sea++; }
    t.near(f / n, 0.5, 4 * Math.sqrt(0.25 / n), `in-between finds in the right rock: ${(f / n).toFixed(3)} (model 0.5)`);
    t.eq(sea, 0, 'no in-between form in sea rock');
    G.reset(3, 1); t.eq(sim.s.crops.filter(c => c.age === 375 && c.env === 'river').length, 2, 'two outcrops of the right age and setting on every map'); }

  /* 5. the ribbon: log maths, the halfway point, card ages */
  { G.reset(4, 2); const s = sim.s; const ids = s.order.slice();
    for (const id of ids) sim.place(s, [], id, Math.log10(sim.card(id).t));
    t.ok(sim.goodCards(s) === 8 && s.ask && s.ask.id === 'd1', 'true placements: 8 of 8 within half a step, then the halfway ask');
    t.near(s.exp.d1, Math.log10(2.27e9), 1e-6, 'halfway point of Earth’s history is 2.27 Gyr on the log ribbon');
    t.ok(Math.abs(s.alt.d1[0] - Math.log10(2.27e9)) > 3, 'the ribbon’s visual middle is far from the halfway point (the log trap)');
    const naledi = sim.card('naledi').t, irh = sim.card('irhoud').t; t.ok(naledi > 2.36e5 && naledi < 3.35e5 && Math.abs(Math.log10(naledi / irh)) < 0.1, 'H. naledi and early H. sapiens sit within a tenth of a step: they overlapped'); }

  /* 6. determinism, replay and snapshots */
  for (const lv of [0, 1, 2, 3, 4]) {
    const a = G.run(lv, { seed: 11, bot: 'expert' }), b = G.run(lv, { seed: 11, bot: 'expert' });
    t.eq(a.s, b.s, `L${lv}: same seed and policy give the same final state`);
    const log = a.s.log.slice(); G.reset(lv, 11); let k = 0, li = 0; while (!sim.result() && k < 40000) { while (li < log.length && log[li][0] === k) { sim.act(log[li][1]); li++; } sim.step(sim.dt); k++; }
    t.eq(sim.s.kept != null ? sim.s.kept : sim.s.hits, a.s.kept != null ? a.s.kept : a.s.hits, `L${lv}: replaying the action log reproduces the run`);
    G.reset(lv, 4); for (let i = 0; i < 90; i++) { const A = sim.actions(); if (A.length) sim.act(sim.bots.expert(sim.s, A) || A[0]); sim.step(sim.dt); }
    const snap = sim.snapshot(), s1 = JSON.stringify(sim.s); for (let i = 0; i < 60; i++) sim.step(sim.dt); const after = JSON.stringify(sim.s);
    sim.restore(snap); t.ok(JSON.stringify(sim.s) === s1, `L${lv}: snapshot round trip`); for (let i = 0; i < 60; i++) sim.step(sim.dt); t.ok(JSON.stringify(sim.s) === after, `L${lv}: restored run continues identically`);
  }

  /* 7. stars: the expert earns every star each level offers; untimed too; What if? earns nothing */
  { const offer = [3, 2, 3, 3, 6], masks = [];
    for (let lv = 0; lv < 5; lv++) { let all = true; for (let seed = 1; seed <= 6; seed++) { const r = G.run(lv, { seed, bot: 'expert' }); if (!r.result || (r.result.mask & offer[lv]) !== offer[lv]) all = false; if (seed === 1) masks.push(r.result ? r.result.mask : 0); } t.ok(all, `L${lv}: the expert earns every star offered (${offer[lv]}) on seeds 1–6`); }
    t.eq(ch.unitStars(masks), 7, 'the expert earns all three unit stars');
    for (let lv = 0; lv < 5; lv++) { const r = G.run(lv, { seed: 2, bot: 'expert', untimed: true }); t.ok(r.result && !r.capped, `L${lv}: completes in untimed mode`); }
    const r0 = G.run(0, { seed: 5, bot: 'expert' }); const snap = sim.snapshot(); G.TB.seed(5); sim.reset(0, { thaw: { snap, lever: 'still' } }); let k = 0; while (!sim.result() && k < 5000) { sim.step(sim.dt); k++; }
    t.ok(sim.result() && sim.result().mask === 0 && sim.s.whatif === 'still', 'a What if? rerun ends and earns no stars'); void r0; }

  /* 8. bots: no level gives any bot three stars; no bot's union across the unit reaches three */
  { const bots = ['alwaysA', 'alwaysB', 'greedy', 'threshold', 'random', 'still', 'naive', 'fixed'], seeds = FAST ? 6 : 12;
    for (const b of bots) {
      let worst = 0; const best = [0, 0, 0, 0, 0];
      for (let seed = 1; seed <= seeds; seed++) for (let lv = 0; lv < 5; lv++) { const r = G.run(lv, { seed, bot: b }); const m = r.result ? r.result.mask : 0; best[lv] |= m; if ([1, 2, 4].filter(x => m & x).length === 3) worst = 3; }
      const u = ch.unitStars(best), pop = [1, 2, 4].filter(x => u & x).length;
      t.ok(worst < 3 && pop < 3, `bot ${b}: no level at three stars; unit union of its best levels ${pop} star(s)`);
    }
  }
};
