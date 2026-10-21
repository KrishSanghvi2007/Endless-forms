/* tests/oracle_switch.js: science and contract oracle for Switches (v2/switch.js). Run: node tests/oracle.js BUILD.html switch
   SW_FAST=1 runs fewer seeds.
   Checks the spec (D1 §3.9, D5 §4 item 12: "identity table correct for every grid state") against an independent reference:
     identity  all 48 states of a column (5 genes, Ubx off/low/high) against a reference rule; columns independent (random grids);
               the named mutants: wild type, abd-A, Ubx and whole-complex deletions, Ubx everywhere (G2 sweep: abd-A loss gives
               legless A1-like segments, not legs); every order solvable by its one-cell solution; L3 mutants are one edge each
     L4        feeding pairs = edge − 1; the three presets and the mantis shrimp's predicted edge
     L5        only the pelvic-enhancer cut removes the pelvis with no other damage
     L6        the scored expectation (exact recursion) matches the simulated lake on average; recessive starts slower than
               dominant; the trout-lake balance sits near √(μ/s); fixed predictions rarely land
   and the contract: determinism, snapshot round trip, replay from the log, an expert earns every unit star, What if? thaws run,
   and no bot's union of level masks reaches three unit stars. */
'use strict';
module.exports = function (G, t) {
  const FAST = !!process.env.SW_FAST, N = FAST ? 8 : 24, ch = G.ch, sim = G.sim, X = G.TB.SWITCH, K = X.K, mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const run = (lv, sd, bot, o) => G.run(lv, Object.assign({ seed: sd }, typeof bot === 'function' ? { policy: bot } : { bot }, o || {}));

  /* ---------- the identity table, against an independent reference ---------- */
  const REF = (sc, sa, su, sb, sB) => sB ? 'A8' : sb ? 'A' : su === 2 ? 'A1' : su === 1 ? 'T3' : sa ? 'T2' : sc ? 'T1' : 'H';   // Abd-B > abd-A > Ubx (high A1, low T3) > Antp > Scr > none
  let bad = 0, n = 0;
  for (let j = 0; j < 7; j++) for (let sc = 0; sc < 2; sc++) for (let sa = 0; sa < 2; sa++) for (let su = 0; su < 3; su++) for (let sb = 0; sb < 2; sb++) for (let sB = 0; sB < 2; sB++) {
    const g = K.WT.map(r => r.slice()); g[0][j] = sc; g[1][j] = sa; g[2][j] = su; g[3][j] = sb; g[4][j] = sB; n++;
    const id = X.ident(g); if (id[j] !== REF(sc, sa, su, sb, sB)) bad++;
    for (let k = 0; k < 7; k++) if (k !== j && id[k] !== X.ident(K.WT)[k]) bad++;   // a change in one column never moves another
  }
  t.ok(bad === 0 && n === 336, 'identity: all 48 states of each of the 7 columns (336) match the reference rule, and no column affects another');
  { const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(99); let b2 = 0;
    for (let r = 0; r < 4000; r++) { const g = [0, 1, 2, 3, 4].map(q => Array.from({ length: 7 }, () => Math.floor(rnd() * (q === 2 ? 3 : 2)))); const id = X.ident(g); for (let j = 0; j < 7; j++) if (id[j] !== REF(g[0][j], g[1][j], g[2][j], g[3][j], g[4][j])) b2++; }
    t.ok(b2 === 0, 'identity: 4,000 random whole grids (28,000 columns) match the reference'); }
  const legs = ids => ids.filter(x => /^T/.test(x)).length;
  t.eq(X.ident(K.WT), ['H', 'T1', 'T2', 'T3', 'A1', 'A', 'A8'], 'wild type: head, T1, T2, T3, A1, abdomen, A8');
  { const id = X.ident(X.vial('abdADel')); t.eq(id, ['H', 'T1', 'T2', 'T3', 'A1', 'A1', 'A8'], 'abd-A deleted: the abdomen becomes A1-like (Sánchez-Herrero et al. 1985)'); t.eq(legs(id), 3, 'abd-A deleted: no new legs (G2 sweep: the old grid wrongly gave legs)'); }
  t.eq(X.ident(X.vial('ubxDel')).slice(3, 6), ['T2', 'T2', 'A'], 'Ubx deleted: T3 and A1 become T2-like; the abdomen stays (abd-A)');
  t.eq(X.ident(X.vial('bxcDel')).slice(2), ['T2', 'T2', 'T2', 'T2', 'T2'], 'whole bithorax complex deleted: every segment from T2 back is T2-like (Lewis 1978)');
  t.eq(X.ident(X.vial('ubxAll')), ['A1', 'A1', 'A1', 'A1', 'A1', 'A', 'A8'], 'Ubx everywhere: head and thorax A1-like, abdomen unchanged (González-Reyes & Morata 1990)');
  t.eq(K.VIALS.map(v => legs(X.ident(X.vial(v)))), [0, 4, 6], 'the three heat-shock vials need 0, 4 and 6 leg pairs, never the wild type’s 3 and never the ghost’s start (7)');
  for (const k of Object.keys(K.SOL)) { const g = K.WT.map(r => r.slice()), c = K.SOL[k]; g[c[0]][c[1]] = c[2]; const id = X.ident(g);
    t.ok(k === 'legsA1' ? /^T/.test(id[4]) && id.every((x, j) => j === 4 || x === K.TGT.legsA1[j]) : JSON.stringify(id) === JSON.stringify(K.TGT[k]), 'order ' + k + ': its one-cell solution builds it'); }
  { const g = K.WT.map(r => r.slice()); g[2][4] = 0; const id = X.ident(g); t.ok(id[4] === 'T2' && legs(id) === 4, 'legs on A1: Ubx off in A1 also works (A1 → T2-like), as well as Ubx low (A1 → T3-like, bithoraxoid)'); }
  t.eq(X.ident(X.gridB(K.WB)), X.ident(K.WT), 'L3: the wild-type front edges rebuild the wild-type grid');
  { const ids = Object.keys(K.MUT).map(k => JSON.stringify(X.ident(X.gridB(K.MUT[k])))); t.ok(Object.keys(K.MUT).every(k => K.MUT[k].filter((b, g) => b !== K.WB[g]).length === 1), 'L3: each mutant moves exactly one front edge');
    t.ok(new Set(ids).size === ids.length && ids.indexOf(JSON.stringify(X.ident(K.WT))) < 0, 'L3: every mutant looks different from the wild type and from each other'); }

  /* ---------- L4, L5 ---------- */
  t.eq(['artemia', 'isopod', 'lobster', 'mantis'].map(k => K.CR[k].maxi + 1), [1, 2, 4, 6], 'L4: Ubx/abd-A edges T1 (brine shrimp), T2 (woodlouse), T4 (lobster); the rule puts the mantis shrimp’s at T6');
  { G.reset(3, 2); t.eq(sim.expect('t4'), 6, 'L4: the transfer is scored against edge = feeding pairs + 1 = 6'); }
  t.ok(K.MOD.filter(m => K.DARK[m][2] && K.DARK[m][0] + K.DARK[m][1] === 0).join() === 'pel' && K.FATE.pel === 'clean', 'L5: only the pelvic-enhancer cut removes the pelvis and nothing else');
  t.ok(K.DARK.stop.every(Boolean) && K.DARK.swap.every(Boolean), 'L5: coding changes reach every tissue that uses Pitx1 (pleiotropy)');

  /* ---------- L6: the lake ---------- */
  const rec = X.rec, Lk = K.LAKE;
  { const early = rec(0.05, 0, 4, 8, Lk.MU, false) - 0.05, earlyD = rec(0.05, 0, 4, 8, Lk.MU, true) - 0.05; t.ok(earlyD > 2 * early, 'L6: from 5%, a dominant deletion rises over 8 generations ' + earlyD.toFixed(2) + ', more than twice the recessive ' + early.toFixed(2)); }
  { const qs = rec(0.5, 4, 0, 400, Lk.MU, false), s = 1 - (1 - Lk.K * 0) / 1, se = 1 - (1 - Lk.K * 4); t.near(qs, Math.sqrt(Lk.MU / se), 0.04, 'L6: under 4 trout the deletion settles near √(μ/s) = ' + Math.sqrt(Lk.MU / se).toFixed(3) + ' (got ' + qs.toFixed(3) + '): a recessive hides from selection'); }
  const lakeExpert = (s, acts, rnd, tk) => {
    if ((tk | 0) % 6) return null;
    if (s.ask) { const e = sim.expect(s.ask.id); return acts.reduce((b, a) => !b || Math.abs(a.v - e) < Math.abs(b.v - e) ? a : b, null); }
    if (s.phase === 'lake' && !s.locked) { const ti = s.preds.findIndex(p => p.type === 't'); if (ti >= 0) return { k: 'rm', i: ti }; return acts.find(a => a.k === 'add' && a.type === 'n') || null; }
    return null;
  };
  { const cal = [], cal2 = [], dom = [];
    for (let sd = 1; sd <= N; sd++) { const r = run(5, sd, lakeExpert); const s = r.s; cal.push([s.exp.p6, s.hist[s.flip - 1].q]); cal2.push([s.exp.t6, s.hist[s.end - 1].q]); }
    const e1 = mean(cal.map(c => c[0])), r1 = mean(cal.map(c => c[1])), e2 = mean(cal2.map(c => c[0])), r2 = mean(cal2.map(c => c[1]));
    t.near(r1, e1, 0.05, 'L6: the p6 expectation (' + e1.toFixed(3) + ') matches the simulated lake at the flip on average (' + r1.toFixed(3) + ')');
    t.near(r2, e2, 0.05, 'L6: the t6 expectation (' + e2.toFixed(3) + ') matches the simulated lake at the end on average (' + r2.toFixed(3) + ')');
    const ex = cal.map(c => c[0]), ex2 = cal2.map(c => c[0]);
    let worst = 0, worst2 = 0; for (let v = 0; v <= 1.0001; v += 0.02) { worst = Math.max(worst, ex.filter(e => Math.abs(e - v) <= K.TOL.p6).length / ex.length); worst2 = Math.max(worst2, ex2.filter(e => Math.abs(e - v) <= K.TOL.t6).length / ex2.length); }
    t.ok(worst <= 0.5 && worst2 <= 0.5, 'L6: the best fixed guess lands on ' + Math.round(worst * 100) + '% (p6) and ' + Math.round(worst2 * 100) + '% (t6) of seeds');
  }

  /* ---------- contract ---------- */
  const expert = (s, acts, rnd, tk) => {
    if ((tk | 0) % 6) return null; const J = s.jobs && s.jobs[s.job];
    if (s.ask) {
      const A = s.ask;
      if (A.kind === 'y' || A.kind === 'x') { const e = sim.expect(A.id); return acts.reduce((b, a) => !b || Math.abs(a.v - e) < Math.abs(b.v - e) ? a : b, null); }
      if (A.kind === 'set') { const tr = X.ident(s.grid).map(x => /^T/.test(x) ? 1 : 0); for (let j = 0; j < 7; j++) if (s.mark[j] !== tr[j]) return { k: 'mark', j }; return { k: 'lock' }; }
      const tr = K.DARK[K.MOD[s.sel]]; for (let q = 0; q < 3; q++) if (s.tis[q] !== tr[q]) return { k: 'tis', t: q }; return { k: 'lock' };
    }
    if (s.phase === 'paint' && J) {
      if (J.k === 'build') { const c = K.SOL[J.id]; if (s.grid[c[0]][c[1]] !== c[2]) return { k: 'cell', g: c[0], j: c[1], v: c[2] }; return { k: 'hatch' }; }
      if (J.k === 'bound') { const b = K.MUT[J.id]; for (let g = 0; g < 5; g++) if (s.b[g] !== b[g]) return { k: 'bound', g, b: b[g] }; return { k: 'hatch' }; }
      if (J.k === 'crust') { const b = K.CR[J.id].maxi + 1; return s.ub !== b ? { k: 'ub', b } : { k: 'hatch' }; }
    }
    if (s.phase === 'choose') return { k: 'mod', m: [2, 3, 1, 2][s.tests.length] };
    if (s.phase === 'pick') return s.sel === 2 ? { k: 'send' } : { k: 'mod', m: 2 };
    if (s.phase === 'lake') return lakeExpert(s, acts, rnd, 0);
    return acts.find(a => a.k === 'skip') || null;
  };
  {
    const a = run(2, 7, expert), b = run(2, 7, expert);
    t.eq(a.s.jobs, b.s.jobs, 'determinism: same seed, same mutants'); t.eq(a.result.mask, b.result.mask, 'determinism: same seed and policy, same stars');
    const c = run(5, 9, 'threshold'), d = run(5, 9, 'threshold'); t.eq(c.s.hist.map(h => h.q), d.s.hist.map(h => h.q), 'determinism: the lake runs the same twice');
    G.reset(5, 4); for (let i = 0; i < 400; i++) sim.step(sim.dt); const snap = sim.snapshot(), s1 = JSON.stringify(sim.s); sim.restore(snap);
    t.eq(JSON.stringify(sim.s), s1, 'snapshot: restore gives back the same lake'); t.ok(snap.length < 60000, 'snapshot: ' + snap.length + ' characters');
    const r1 = run(5, 11, lakeExpert), log = r1.s.log.slice(), want = JSON.stringify(r1.s.hist.map(h => h.q));
    G.TB.seed(11); ch.level = 5; sim.reset(5, {}); sim.s.log = []; let tick = 0, li = 0;
    while (!sim.result() && tick < 40000) { while (li < log.length && log[li][0] === tick) { sim.act(log[li][1]); li++; } sim.step(sim.dt); tick++; }
    t.eq(JSON.stringify(sim.s.hist.map(h => h.q)), want, 'replay: the action log rebuilds the same lake');
    const rr = run(0, 3, expert), log0 = rr.s.log.slice(); G.TB.seed(3); ch.level = 0; sim.reset(0, {}); sim.s.log = []; tick = 0; li = 0;
    while (!sim.result() && tick < 40000) { while (li < log0.length && log0[li][0] === tick) { sim.act(log0[li][1]); li++; } sim.step(sim.dt); tick++; }
    t.eq(sim.result() && sim.result().mask, rr.result.mask, 'replay: the bench log rebuilds the same stars');
  }
  { const masks = []; let all = true;
    for (let sd = 1; sd <= (FAST ? 3 : 8); sd++) { const lv = []; for (let L = 0; L < 6; L++) { const r = run(L, sd, expert); lv.push(r.result ? r.result.mask : 0); } masks.push(lv); if (ch.unitStars(lv) !== 7) all = false; }
    t.ok(all, "an expert earns all three unit stars on every seed (level masks " + JSON.stringify(masks.filter(lv => ch.unitStars(lv) !== 7).concat([masks[0]])[0]) + ")");
    t.ok(masks.every(lv => lv.every(m => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1) <= 2)), 'no level offers all three stars');
  }
  { // What if? thaws: restore a frozen lake, apply a lever, run on with no asks and no stars
    for (const lever of ['dom', 'nomut']) {
      G.reset(5, 6); let tk = 0; while (sim.s.gen < 6 && tk < 20000) { const A = sim.actions(); const a = lakeExpert(sim.s, A, Math.random, 0); if (a) sim.act(a); sim.step(sim.dt); tk++; }
      const snap = sim.snapshot(); sim.reset(5, { thaw: { snap, lever } }); tk = 0; while (!sim.result() && tk < 40000) { sim.step(sim.dt); tk++; }
      const r = sim.result(); t.ok(r && r.mask === 0 && /^w_/.test(r.interesting || ''), 'What if? ' + lever + ': the thawed lake runs to the end, earns nothing and picks "' + (r && r.interesting) + '"');
    }
  }
  { // no bot's union of level masks reaches three unit stars
    const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'naive']; let worst = 0, who = '';
    for (const b of bots) for (let sd = 1; sd <= (FAST ? 4 : 12); sd++) { const lv = []; for (let L = 0; L < 6; L++) { const r = run(L, sd, b); lv.push(r.result ? r.result.mask : 0); } const u = ch.unitStars(lv), p = (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1); if (p > worst) { worst = p; who = b + ' seed ' + sd; } }
    t.ok(worst < 3, 'bots: the best unit union is ' + worst + ' star(s)' + (who ? ' (' + who + ')' : ''));
  }
};
