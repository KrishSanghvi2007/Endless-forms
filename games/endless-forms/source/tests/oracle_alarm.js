/* tests/oracle_alarm.js: the science oracle for Alarm Call (D1 §3.6, D5 §4 item 10, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html alarm          (AL_FAST=1 for a quicker pass)
   D5's acceptance lines:
     A. the trill boundary is exactly Σr·B = C (Σr = 0.55);
     B. the whistle bot calls at r = 0 and those calls count as good (the whistle's cost is negative);
     C. Sherman 1985 figures: the model's whistlers are caught less often than silent squirrels, trillers more (direction only;
        the sizes are designed and say so on the MODEL card).
   Plus (after the D6 decision 9 simplification: three levels, one prediction): catch chances are k × risk with at most one
   victim; relatedness by path counting (PedigreeView) equals the unit's relation table (half-sisters ¼, cousins ⅛); every
   ear tag shows true relatedness and L1 includes half-sisters; the model's whistlers are caught less often than silent
   squirrels and trillers more; L2's sex-limited alleles: female calling rises and male calling falls when daughters stay,
   and the reverse if sons stayed; the expected paths equal the mean of live runs; the one prediction (male calling at
   season 15) is scored against replays from the season of the call, and "no change" never earns it; determinism, replay
   and snapshot; untimed decisions never time out; an expert earns every star the unit offers; no bot earns three stars in
   a level or across the unit; Interesting texts say what happened. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim, TB } = G, FAST = !!process.env.AL_FAST, N = k => FAST ? Math.max(8, Math.round(k / 4)) : k;
  const { mulberry } = require('./vmgame');
  const B = 0.4, Ct = 0.22, Cw = -0.26, k = 0.3;

  /* ---------- A. the trill boundary ---------- */
  const val = sr => sr * B - Ct;
  t.near(Ct / B, 0.55, 1e-12, 'A. break-even relatedness C/B = 0.55');
  t.ok(val(0.5) < 0 && val(0.625) > 0 && val(0.25) < 0 && val(0.75) > 0, 'A. one sister (½) is not enough; a sister and a cousin (0.625) is');
  { // the sim's verdict on every attack matches Σr·B − C, with true relatedness
    let bad = 0, n = 0; for (let sd = 1; sd <= N(40); sd++) { const r = G.run(0, { seed: sd, bot: 'random' }); for (const q of r.s.recs) { n++; if ((q.best === 1) !== (q.sr * B > Ct)) bad++; } }
    t.ok(bad === 0, `A. every recorded best call equals sign(Σr·0.4 − 0.22) (${n} attacks)`);
  }
  { // the L1 plan alternates: half the attacks reward a call, half silence, and none sits within 0.02 of the boundary
    let ok = true; for (let sd = 1; sd <= N(40); sd++) { const r = G.run(0, { seed: sd, bot: 'alwaysA' }), b = r.s.recs.filter(q => q.best).length; if (b !== 4 || r.s.recs.some(q => Math.abs(q.v) < 0.02 - 1e-9)) ok = false; }
    t.ok(ok, 'A. L1: 4 of 8 attacks reward a trill, none within 0.02 of the boundary');
  }

  /* ---------- relatedness: path counting on the true pedigree equals the relation table ---------- */
  {
    const PV = TB.PedigreeView, nodes = [{ id: 'gm', sex: 'f', parents: [null, null] }, { id: 'gf', sex: 'm', parents: [null, null] }, { id: 'x', sex: 'm' }, { id: 'y', sex: 'm' }, { id: 'z', sex: 'm' },
      { id: 'mo', sex: 'f', parents: ['gm', 'gf'] }, { id: 'au', sex: 'f', parents: ['gm', 'gf'] }, { id: 'me', sex: 'f', parents: ['mo', 'x'] }, { id: 'fs', sex: 'f', parents: ['mo', 'x'] },
      { id: 'hs', sex: 'f', parents: ['mo', 'y'] }, { id: 'co', sex: 'f', parents: ['au', 'z'] }, { id: 'co2', sex: 'f', parents: ['au', 'y'] }, { id: 'un', sex: 'f' }, { id: 'br', sex: 'm', parents: ['mo', 'y'] }];
    const pv = PV.create({ nodes }), want = { mo: 0.5, au: 0.25, fs: 0.5, hs: 0.25, co: 0.125, un: 0, br: 0.25 };
    for (const id in want) t.near(pv.r('me', id), want[id], 1e-12, `relatedness: you and ${id} r = ${want[id]} by path counting`);
    t.near(pv.r('me', 'co2'), 0.125, 1e-12, 'a cousin sired by your mother’s other mate is still r = ⅛ to you (not a half-sister)');
    t.near(pv.r('fs', 'hs'), pv.r('me', 'hs'), 1e-12, 'a full sister has your relatedness to everyone else (so you can play on as her)');
    t.ok(sim.tagOf('hs') === '1/4' && sim.tagOf('co') === '1/8' && sim.tagOf('im') === '0' && sim.tagOf('fs') === '1/2', 'the tag table: half-sister ¼, cousin ⅛, immigrant male 0, full sister ½');
    let tags = true, hs = 0; for (let sd = 1; sd <= 30; sd++) { const s = G.reset(0, sd); for (const m of s.col) if (s.tags[m.id] !== sim.tagOf(m.rel)) tags = false; if (s.col.some(m => m.rel === 'hs')) hs++; }
    t.ok(tags, 'L1: every ear tag shows its true relatedness (no blank tags, no designed face marks)');
    t.ok(hs === 30, `L1: every colony holds a half-sister (another father, r = ¼) on ${hs} of 30 seeds`);
    let none = true; for (let sd = 1; sd <= N(30); sd++) { const r = G.run(0, { seed: sd, bot: 'expert' }); if (r.s.asks.length) none = false; } t.ok(none, 'L1 has no prediction: the break-even Σr > 0.55 is shown, not asked');
  }

  /* ---------- catch chances: k × risk, at most one victim ---------- */
  {
    const runs = N(20000), cnt = { me: 0, n0: 0, two: 0 }, cases = [['coyote', 1, 0.52, 0.1], ['coyote', 0, 0.30, 0.5], ['hawk', 1, 0.04, 0.1]];
    for (const [pred, a, rm, rn] of cases) {
      const s = G.reset(0, 7); let me = 0, n0 = 0, two = 0;
      for (let i = 0; i < runs; i++) {
        for (const m of s.col) m.alive = true; s.me = 'me'; s.died = 0; s.recs = [];
        s.atk = { i: 0, pred, nb: ['u1', 'u2', 'm1'], tags: [], sr: 0, srt: 0, a, st: 'strike', t: 0 }; const ev = []; sim.strike(s, ev);
        if (s.atk.you) me++; if (s.atk.victim === 'u1') n0++; if (s.atk.you && s.atk.victim !== '@me') two++;
      }
      t.near(me / runs, k * rm, 0.012, `${pred} ${a ? 'call' : 'silent'}: you are caught ${(100 * me / runs).toFixed(1)}% (k × ${rm} = ${(100 * k * rm).toFixed(1)}%)`);
      t.near(n0 / runs, k * rn, 0.012, `${pred} ${a ? 'call' : 'silent'}: a neighbour is caught ${(100 * n0 / runs).toFixed(1)}% (k × ${rn})`);
    }
  }

  /* ---------- B and C: the whistle ---------- */
  {
    let lowCalls = 0, lowOk = 0;
    for (let sd = 1; sd <= N(40); sd++) { const r = G.run(2, { seed: sd, bot: 'whistler' }); for (const q of r.s.recs) if (q.pred === 'hawk' && q.sr === 0) { lowCalls += q.a; lowOk += q.ok ? 1 : 0; } }
    t.ok(lowCalls > 0 && lowCalls === lowOk, `B. the whistle bot whistles with r = 0 near (${lowCalls} attacks) and every such call is good`);
    t.ok(Cw < 0 && Ct > 0, 'B. the whistle’s cost is negative, the trill’s positive');
    // C. direction of Sherman's findings: in the model, callers' and silent squirrels' catch chances (k × risk)
    const R = { trill: 0.52, whistle: 0.04, sil: 0.30 };
    t.ok(k * R.whistle < k * R.sil && k * R.trill > k * R.sil, 'C. whistlers are caught less often than silent squirrels (Sherman 1985), trillers more (Sherman 1977): direction only');
    t.near((R.trill - R.sil), Ct, 1e-12, 'the trill’s cost is its extra catch risk, 0.22'); t.near((R.whistle - R.sil), Cw, 1e-12, 'the whistle’s cost is its (negative) extra catch risk, −0.26');
    const s = G.reset(2, 3); t.ok(s.plan[0][0] === 'coyote' && s.plan[1][0] === 'hawk' && s.plan.filter(p => p[1] === 'low').length === 2, 'the boss opens with a coyote and a hawk (unscored), and tests two low-kin hawks after them');
    t.ok(!s.hawkSeen, 'the boss: the whistle’s cost is hidden until the first hawk’s ledger');
  }

  /* ---------- L2: sex-limited calling alleles, and the one prediction ---------- */
  {
    const e = sim.exp4([0.5, 0.5], false, 99), w = sim.exp4([0.5, 0.5], true, 99);
    t.ok(e[0] > 0.7 && e[1] < 0.25, `L2: daughters stay: females calling 0.50 → ${e[0].toFixed(2)}, males 0.50 → ${e[1].toFixed(2)}`);
    t.ok(w[0] < 0.25 && w[1] > 0.7, `L2 (model check): if sons stayed instead: females 0.50 → ${w[0].toFixed(2)}, males 0.50 → ${w[1].toFixed(2)}`);
    t.ok(sim.a4(0.9) > 0 && sim.a4(0.05) < 0 && Math.abs(sim.a4(0.55)) < 1e-12, 'L2: a copy gains when Σr·0.4 > 0.22 and is neutral at Σr = 0.55 (Hamilton’s rule)');
    let dF = 0, dM = 0, n = N(80);   // the scored expectation equals the mean of live runs
    for (let sd = 1; sd <= n; sd++) { const r = G.run(1, { seed: sd, bot: 'alwaysB' }), C = r.s.c4, z = C.hist[C.hist.length - 1]; dF += z[1] - r.s.exp4[0]; dM += z[2] - r.s.exp4[1]; }
    t.near(dF / n, 0, 0.03, `L2: live final female share minus the dashed expected path, mean over ${n} seeds = ${(dF / n).toFixed(3)}`);
    t.near(dM / n, 0, 0.03, `L2: live final male share minus expectation = ${(dM / n).toFixed(3)}`);
    { const r = G.run(1, { seed: 4, bot: 'alwaysB' }), C = r.s.c4; t.ok(r.s.asks.length === 1 && r.s.asks[0] === 'ml' && C.tAsk === 6 && r.s.exp4path.length === 15 - C.tAsk + 1 && r.s.exp4path[0][0] === C.tAsk, `L2: one ask, after the six daughter and son seasons; the end chart's dashed paths run from the call (season ${C.tAsk}) to 15`); }
    { // the ask: scored against the mean of replays from the share at the call; male calling falls well past the band; "no change" never scores
      let real = 0, fall = 0, nc = 0, bot0 = 0, ex = 0, same = true; const n2 = N(40);
      for (let sd = 1; sd <= n2; sd++) {
        const r = G.run(1, { seed: sd, bot: 'expert' }), C = r.s.c4, e = r.s.exp.ml; if (sim.real(r.s)) real++; if (C.pAsk[1] - e > 0.12) fall++; if (r.result.mask & 2) ex++;
        if (Math.abs(e - sim.exp4(C.pAsk, false, ((Math.round(C.pAsk[0] * 1000) * 37 + Math.round(C.pAsk[1] * 1000) * 11 + C.tAsk) >>> 0) + 5, null, 15 - C.tAsk)[1]) > 1e-12) same = false;
        if (G.run(1, { seed: sd, bot: 'greedy' }).result.mask & 2) nc++;
        if (G.run(1, { seed: sd, bot: 'alwaysA' }).result.mask & 2) bot0++;
      }
      t.ok(real >= n2 - 1 && fall >= n2 - 1, `L2 ask: "no change" misses by more than two bands on ${real} of ${n2} seeds; male calling falls > 0.12 after the call on ${fall}`);
      t.ok(same, 'L2 ask: the scored expectation is the mean of 200 replays from the share at the call, over the seasons left');
      t.eq(nc, 0, 'L2 ask: predicting no change (the greedy bot) never earns Predict');
      t.ok(bot0 <= Math.ceil(n2 * 0.1), `L2 ask: predicting zero (the axis bottom) rarely earns Predict (${bot0} of ${n2})`);
      t.eq(ex, n2, `L2 ask: calling the expectation earns Predict on every seed (${ex} of ${n2})`);
    }
    let vf = 0, vm = 0, nf = 0, nm = 0; for (let sd = 1; sd <= N(200); sd++) { G.reset(1, sd); const s = sim.s; s.c4.t = sd % 2 ? 1 : 0; const nb = sim.vigNb(s, s.c4.t === 0); let sr = 0; for (const m of nb) sr += sim.tagR(sim.tagOf(m.rel)); if (s.c4.t === 0) { vf += sr; nf++; } else { vm += sr; nm++; } }
    t.near(vf / nf, 0.9, 0.12, `L2 vignettes: a daughter's neighbours average Σr = ${(vf / nf).toFixed(2)} (the model's 0.9)`);
    t.near(vm / nm, 0.05, 0.05, `L2 vignettes: a son's neighbours average Σr = ${(vm / nm).toFixed(2)} (the model's 0.05)`);
  }

  /* ---------- determinism, replay, snapshot, untimed ---------- */
  for (const lv of [0, 1, 2]) {
    const a = G.run(lv, { seed: 11, bot: 'random', rnd: mulberry(3) }), log = a.s.log.slice();
    const b = G.run(lv, { seed: 11, bot: 'random', rnd: mulberry(3) });
    t.eq(JSON.stringify([b.s.recs, b.s.c4]), JSON.stringify([a.s.recs, a.s.c4]), `L${lv + 1}: same seed and policy → same run`);
    // replay the logged actions tick by tick
    TB.seed(11); ch.level = lv; sim.reset(lv, {}); let i = 0;
    for (let tick = 0; tick < 40000 && !sim.result(); tick++) { while (i < log.length && log[i][0] === tick) sim.act(log[i++][1]); sim.step(sim.dt); }
    t.eq(JSON.stringify([sim.s.recs, sim.s.c4]), JSON.stringify([a.s.recs, a.s.c4]), `L${lv + 1}: replaying the action log reproduces the run`);
    TB.seed(5); sim.reset(lv, {}); for (let k2 = 0; k2 < 200; k2++) { const A = sim.actions(); if (A.length) sim.act(A[k2 % A.length]); sim.step(sim.dt); }
    const snap = sim.snapshot(); for (let k2 = 0; k2 < 300; k2++) sim.step(sim.dt); const after = JSON.stringify(sim.s);
    sim.restore(snap); for (let k2 = 0; k2 < 300; k2++) sim.step(sim.dt); t.eq(JSON.stringify(sim.s), after, `L${lv + 1}: snapshot and restore continue identically`);
  }
  { const s = G.reset(0, 2, { unt: true }); s.ai = 1; s.atk.st = 'decide'; for (let i = 0; i < 9000; i++) sim.step(sim.dt); t.ok(s.atk.st === 'decide' && s.atk.a == null, 'untimed: a decision never times out'); }
  { const s = G.reset(0, 2); s.ai = 1; s.atk.st = 'decide'; s.atk.t = 0; for (let i = 0; i < 120; i++) sim.step(sim.dt); t.ok(s.atk.a === 0 && s.atk.slow, 'timed: after the clock runs out you stay silent (and it is marked slow)'); }
  { const s = G.reset(0, 2); s.atk.st = 'decide'; for (let i = 0; i < 9000; i++) sim.step(sim.dt); t.ok(s.atk.a == null, 'the first attack of a level waits for you'); }

  /* ---------- the expert earns every star offered; no bot reaches three ---------- */
  const want = [1, 3, 5];   // L1 D, L2 D+P, the boss D+T: no level offers all three
  for (let lv = 0; lv < 3; lv++) { let ok = 0, off = 0; const n = N(20); for (let sd = 1; sd <= n; sd++) { const r = G.run(lv, { seed: sd, bot: 'expert' }); if (r.result && (r.result.mask & want[lv]) === want[lv]) ok++; if (r.result && (r.result.mask & ~want[lv])) off++; } t.ok(ok === n && off === 0, `expert: L${lv + 1} earns its stars (mask ${want[lv]}) on ${ok} of ${n} seeds, and none outside them`); }
  { const lv = [0, 1, 2].map(L => G.run(L, { seed: 2, bot: 'expert' }).result.mask); t.eq(ch.unitStars(lv), 7, 'the expert’s levels add up to all three unit stars'); }
  { let ev = 0; for (let sd = 1; sd <= N(20); sd++) { const r = G.run(2, { seed: sd, bot: 'greedy' }); if (r.result.mask & 4) ev++; } t.eq(ev, 0, 'the boss: the trill rule applied to hawks (no whistle without kin) never earns Transfer'); }
  { let ev = 0; for (let sd = 1; sd <= N(20); sd++) { const r = G.run(2, { seed: sd, bot: 'alwaysA' }); if (r.result.mask & 4) ev++; } t.eq(ev, 0, 'the boss: calling at everything never earns Transfer (it trills at low-kin coyotes)'); }
  {
    const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'whistler']; let worst = 0, who = '';
    for (const b of bots) for (let sd = 1; sd <= N(20); sd++) { const lv = []; for (let L = 0; L < 3; L++) { const r = G.run(L, { seed: sd, bot: b, rnd: mulberry(sd * 31 + L) }); lv.push(r.result ? r.result.mask : 0); } const u = ch.unitStars(lv), p = (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1); if (p > worst) { worst = p; who = b + ' seed ' + sd; } }
    t.ok(worst < 3, `no bot's union across the unit reaches three stars (best ${worst}, ${who})`);
  }

  /* ---------- Interesting texts follow the run ---------- */
  {
    let ok = true;
    for (let sd = 1; sd <= N(30); sd++) {
      const r = G.run(1, { seed: sd, bot: 'random', rnd: mulberry(sd) }), h = r.s.c4.hist, a = h[0], z = h[h.length - 1];
      if (r.result.interesting === 'sexGap' && !(z[1] - a[1] >= 0.1 && a[2] - z[2] >= 0.1)) ok = false;
      const r0 = G.run(0, { seed: sd, bot: 'alwaysA' }); if (r0.result.interesting !== 'overcall') ok = false;
      const r4 = G.run(2, { seed: sd, bot: 'greedy' }); if (r4.result.interesting !== 'noSelfish') ok = false;
    }
    t.ok(ok, 'Interesting: sexGap only when the gap happened; always-call reads overcall (L1); the trill rule at hawks reads noSelfish');
  }
};
