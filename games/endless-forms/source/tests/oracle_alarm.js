/* tests/oracle_alarm.js: the science oracle for Alarm Call (D1 §3.6, D5 §4 item 10, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html alarm          (AL_FAST=1 for a quicker pass)
   D5's acceptance lines:
     A. the trill boundary is exactly Σr·B = C (Σr = 0.55);
     B. the whistle bot calls at r = 0 and those calls count as good (the whistle's cost is negative);
     C. Sherman 1985 figures: the model's whistlers are caught less often than silent squirrels, trillers more (direction only;
        the sizes are designed and say so on the MODEL card).
   Plus: catch chances are k × risk with at most one victim; relatedness by path counting (PedigreeView) equals the unit's
   relation table for the drawn pedigree with sires (half-sisters ¼, cousins ⅛); the notebook's estimates recover the model
   costs; L4's sex-limited alleles: female calling rises and male calling falls when daughters stay, and the reverse in the
   swapped meadow; the scored expectation equals the mean of live runs; the boss's springs (co-breeding tips four springs,
   a kin-only player misses Discover, always-help misses both stars); determinism, replay and snapshot; untimed decisions
   never time out; an expert earns every star the unit offers; no bot earns three stars in a level or across the unit;
   Interesting texts say what happened. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim, TB } = G, FAST = !!process.env.AL_FAST, N = k => FAST ? Math.max(8, Math.round(k / 4)) : k;
  const { mulberry } = require('./vmgame');
  const B = 0.4, Ct = 0.22, Cw = -0.26, k = 0.3;

  /* ---------- A. the trill boundary ---------- */
  const val = sr => sr * B - Ct;
  t.near(Ct / B, 0.55, 1e-12, 'A. break-even relatedness C/B = 0.55');
  t.ok(val(0.5) < 0 && val(0.625) > 0 && val(0.25) < 0 && val(0.75) > 0, 'A. one sister (½) is not enough; a sister and a cousin (0.625) is');
  t.near(sim.expect({ c4: null }, 'be'), 0.55, 1e-12, 'A. the L1 call is scored against 0.55');
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
    let blz = true; for (let sd = 1; sd <= 30; sd++) { const s = G.reset(1, sd); for (const m of s.col) { if (m.rel === 'fs' && m.blaze !== s.yb) blz = false; if (m.rel === 'hs' && m.blaze === s.yb) blz = false; if ((m.rel === 'un' || m.rel === 'im') && m.blaze) blz = false; } }
    t.ok(blz, 'the face blaze: full sisters wear your father’s blaze, half-sisters another; strangers none');
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
    t.ok(sim.expect({}, 'wh') < 0 && sim.expect({}, 'tr') > 0, 'B. the whistle’s scored cost is negative, the trill’s positive');
    let T = { coyote: [0, 0, 0, 0], hawk: [0, 0, 0, 0] };
    for (let sd = 1; sd <= N(60); sd++) { const r = G.run(2, { seed: sd, bot: 'random' }); for (const p of ['coyote', 'hawk']) for (let i = 0; i < 4; i++) T[p][i] += r.s.tally[p][i]; }
    const fr = (p, i) => T[p][i + 1] / T[p][i];
    t.ok(fr('hawk', 0) < fr('hawk', 2), `C. whistlers caught ${(100 * fr('hawk', 0)).toFixed(1)}% < silent squirrels ${(100 * fr('hawk', 2)).toFixed(1)}% (Sherman 1985, direction)`);
    t.ok(fr('coyote', 0) > fr('coyote', 2), `C. trillers caught ${(100 * fr('coyote', 0)).toFixed(1)}% > silent squirrels ${(100 * fr('coyote', 2)).toFixed(1)}% (Sherman 1977, direction)`);
    t.near((fr('coyote', 0) - fr('coyote', 2)) / k, Ct, 0.05, 'the notebook recovers the trill’s cost');
    t.near((fr('hawk', 0) - fr('hawk', 2)) / k, Cw, 0.05, 'the notebook recovers the whistle’s cost');
    const s = G.reset(2, 3); t.ok(s.plan[0][0] === 'coyote' && s.plan[1][0] === 'hawk' && s.plan.filter(p => p[1] === 'low').length === 2, 'L3 opens with a coyote and a hawk before the ask, and tests two low-kin hawks after it');
  }

  /* ---------- L4: sex-limited calling alleles ---------- */
  {
    const e = sim.exp4([0.5, 0.5], false, 99), w = sim.exp4([0.5, 0.5], true, 99);
    t.ok(e[0] > 0.7 && e[1] < 0.25, `L4: daughters stay: females calling 0.50 → ${e[0].toFixed(2)}, males 0.50 → ${e[1].toFixed(2)}`);
    t.ok(w[0] < 0.25 && w[1] > 0.7, `L4: swapped meadow: females 0.50 → ${w[0].toFixed(2)}, males 0.50 → ${w[1].toFixed(2)}`);
    t.ok(sim.a4(0.9) > 0 && sim.a4(0.05) < 0 && Math.abs(sim.a4(0.55)) < 1e-12, 'L4: a copy gains when Σr·0.4 > 0.22 and is neutral at Σr = 0.55 (Hamilton’s rule)');
    let dF = 0, dM = 0, n = N(80);   // the scored expectation equals the mean of live runs
    for (let sd = 1; sd <= n; sd++) { const r = G.run(3, { seed: sd, bot: 'alwaysB' }), C = r.s.c4, z = C.hist[C.hist.length - 1]; dF += z[1] - r.s.exp4[0]; dM += z[2] - r.s.exp4[1]; }
    t.near(dF / n, 0, 0.03, `L4: live final female share minus expectation, mean over ${n} seeds = ${(dF / n).toFixed(3)}`);
    t.near(dM / n, 0, 0.03, `L4: live final male share minus expectation = ${(dM / n).toFixed(3)}`);
    let realOk = true; for (let sd = 1; sd <= N(40); sd++) { const r = G.run(3, { seed: sd, bot: 'alwaysB' }), s = r.s; if (!(AL_ok(s, 'f4') && AL_ok(s, 'm4') && AL_ok(s, 'sw'))) realOk = false; }
    t.ok(realOk, 'L4: every ask moves at least 0.15 from its start in expectation ("no change" never passes)');
    function AL_ok(s, id) { return Math.abs(s.exp[id] - s.at0[id]) >= 0.15; }
    let vf = 0, vm = 0, nf = 0, nm = 0; for (let sd = 1; sd <= N(200); sd++) { G.reset(3, sd); const s = sim.s; s.c4.t = sd % 2 ? 1 : 0; const nb = sim.vigNb(s, s.c4.t === 0); let sr = 0; for (const m of nb) sr += sim.tagR(sim.tagOf(m.rel)); if (s.c4.t === 0) { vf += sr; nf++; } else { vm += sr; nm++; } }
    t.near(vf / nf, 0.9, 0.12, `L4 vignettes: a daughter's neighbours average Σr = ${(vf / nf).toFixed(2)} (the model's 0.9)`);
    t.near(vm / nm, 0.05, 0.05, `L4 vignettes: a son's neighbours average Σr = ${(vm / nm).toFixed(2)} (the model's 0.05)`);
  }

  /* ---------- L5: the boss ---------- */
  {
    const s = G.reset(4, 1), best = sim.best5(s), inv = s.sp.filter(q => q.inv).length;
    t.eq(inv, 4, 'boss: four springs where helping wins only through the helper’s own egg');
    t.near(sim.rNest('mum', 'dad'), 0.4, 1e-12, 'boss: with 40% extra-group young, the nestling of mum and dad is r = 0.4 to you on average');
    t.near(sim.rNest('step', 'new'), 0, 1e-12, 'boss: a new pair’s nestling is unrelated');
    let kin = 0, help = 0; for (const q of s.sp) { kin += Math.max(q.kin, q.vB); help += q.vH; }
    let kinOnly = 0; for (const q of s.sp) kinOnly += q.kin > q.vB ? q.vH : q.vB;
    t.ok(kinOnly < best - 0.07, `boss: a kin-only player gains ${kinOnly.toFixed(2)} of ${best.toFixed(2)}: no Discover`);
    t.ok(help < best - 0.07, `boss: always help gains ${help.toFixed(2)}: no Discover`);
    let mind = 9; for (const q of s.sp) mind = Math.min(mind, Math.abs(q.vH - q.vB)); t.ok(mind >= 0.06, `boss: no spring is a near tie (smallest gap ${mind.toFixed(3)})`);
  }

  /* ---------- determinism, replay, snapshot, untimed ---------- */
  for (const lv of [0, 1, 2, 3, 4]) {
    const a = G.run(lv, { seed: 11, bot: 'random', rnd: mulberry(3) }), log = a.s.log.slice();
    const b = G.run(lv, { seed: 11, bot: 'random', rnd: mulberry(3) });
    t.eq(JSON.stringify(b.s.recs || b.s.sp || b.s.c4), JSON.stringify(a.s.recs || a.s.sp || a.s.c4), `L${lv + 1}: same seed and policy → same run`);
    // replay the logged actions tick by tick
    TB.seed(11); ch.level = lv; sim.reset(lv, {}); let i = 0;
    for (let tick = 0; tick < 40000 && !sim.result(); tick++) { while (i < log.length && log[i][0] === tick) sim.act(log[i++][1]); sim.step(sim.dt); }
    t.eq(JSON.stringify(sim.s.recs || sim.s.sp || sim.s.c4), JSON.stringify(a.s.recs || a.s.sp || a.s.c4), `L${lv + 1}: replaying the action log reproduces the run`);
    TB.seed(5); sim.reset(lv, {}); for (let k2 = 0; k2 < 200; k2++) { const A = sim.actions(); if (A.length) sim.act(A[k2 % A.length]); sim.step(sim.dt); }
    const snap = sim.snapshot(); for (let k2 = 0; k2 < 300; k2++) sim.step(sim.dt); const after = JSON.stringify(sim.s);
    sim.restore(snap); for (let k2 = 0; k2 < 300; k2++) sim.step(sim.dt); t.eq(JSON.stringify(sim.s), after, `L${lv + 1}: snapshot and restore continue identically`);
  }
  { const s = G.reset(0, 2, { unt: true }); s.ai = 1; s.atk.st = 'decide'; for (let i = 0; i < 9000; i++) sim.step(sim.dt); t.ok(s.atk.st === 'decide' && s.atk.a == null, 'untimed: a decision never times out'); }
  { const s = G.reset(0, 2); s.ai = 1; s.atk.st = 'decide'; s.atk.t = 0; for (let i = 0; i < 120; i++) sim.step(sim.dt); t.ok(s.atk.a === 0 && s.atk.slow, 'timed: after the clock runs out you stay silent (and it is marked slow)'); }
  { const s = G.reset(0, 2); s.atk.st = 'decide'; for (let i = 0; i < 9000; i++) sim.step(sim.dt); t.ok(s.atk.a == null, 'the first attack of a level waits for you'); }

  /* ---------- the expert earns every star offered; no bot reaches three ---------- */
  const expert = (s, acts) => {
    if (!acts.length) return null;
    if (acts[0].k === 'predict') { const id = s.ask.id, e = id === 'be' ? 0.55 : id === 'tr' ? Ct : id === 'wh' ? Cw : id === 'sw' ? sim.exp4(s.c4.sw0, true, 1)[1] : sim.exp4(s.c4.p0, false, 1)[id === 'f4' ? 0 : 1]; return sim.near(acts, e); }
    if (s.phase === 'peace') { const m = s.col.find(q => s.tags[q.id] !== sim.tagOf(q.rel)); return m ? { k: 'tag', id: m.id, t: sim.tagOf(m.rel) } : { k: 'done' }; }
    if (s.phase === 'attack') return { k: 'call', a: s.atk.pred === 'hawk' || s.atk.sr * B > Ct ? 1 : 0 };
    if (s.phase === 'spring') { const q = s.sp[s.si]; return { k: 'choose', a: q.vH > q.vB ? 'help' : 'breed' }; }
    return null;
  };
  const want = [3, 1, 3, 6, 5];
  for (let lv = 0; lv < 5; lv++) { let ok = 0; const n = N(20); for (let sd = 1; sd <= n; sd++) { const r = G.run(lv, { seed: sd, policy: expert }); if (r.result && (r.result.mask & want[lv]) === want[lv]) ok++; } t.ok(ok >= n - (lv === 3 ? 2 : 0), `expert: L${lv + 1} earns its stars (mask ${want[lv]}) on ${ok} of ${n} seeds`); }
  {
    const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'whistler']; let worst = 0, who = '';
    for (const b of bots) for (let sd = 1; sd <= N(20); sd++) { const lv = []; for (let L = 0; L < 5; L++) { const r = G.run(L, { seed: sd, bot: b, rnd: mulberry(sd * 31 + L) }); lv.push(r.result ? r.result.mask : 0); } const u = ch.unitStars(lv), p = (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1); if (p > worst) { worst = p; who = b + ' seed ' + sd; } }
    t.ok(worst < 3, `no bot's union across the unit reaches three stars (best ${worst}, ${who})`);
  }

  /* ---------- Interesting texts follow the run ---------- */
  {
    let ok = true;
    for (let sd = 1; sd <= N(30); sd++) {
      const r = G.run(3, { seed: sd, bot: 'random', rnd: mulberry(sd) }), h = r.s.c4.hist, a = h[0], z = h[h.length - 1];
      if (r.result.interesting === 'sexGap' && !(z[1] - a[1] >= 0.1 && a[2] - z[2] >= 0.1)) ok = false;
      const r0 = G.run(0, { seed: sd, bot: 'alwaysA' }); if (r0.result.interesting !== 'overcall') ok = false;
      const r4 = G.run(4, { seed: sd, bot: 'greedy' }); if (r4.result.interesting !== 'pureKin') ok = false;
    }
    t.ok(ok, 'Interesting: sexGap only when the gap happened; always-call reads overcall; a kin-only warbler reads pureKin');
  }
};
