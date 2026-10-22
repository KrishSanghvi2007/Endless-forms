/* tests/oracle_hawks.js: the science oracle for Hawks and Doves (D1 §3.4, D5 §4 item 3, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html hawks          (HK_FAST=1 for a quicker, smaller pass)
   D5's acceptance lines:
     A. with no player the beach reaches V/C (from above and from below; deterministic and in the 150-crab model);
     B. a rare pure invader into the mixed-ESS beach has negative mean fitness over 200 seeds (Hawk and Dove invaders);
     C. choice buttons never both disabled (checked in the browser: tests/hawks_paths.py).
   Plus the spec's numbers: the payoff table; hawk and dove pay the same at V/C; Bishop–Cannings (every rule earns the
   residents' payoff when rare, less once common); L2 spreads early from a brood of four and stalls near V/C; your newest
   young inherit your rule while older kin keep theirs (cohorts); V > C takes the beach and lowers the mean payoff; the new
   beach (the chapter's one prediction, D6 decision 9) settles at V/C = 0.75; owner-wins (Bourgeois) is neutral when rare,
   favoured once common, and spreads from the brood while a blind rule does not; the size lever's assessor invades and the
   reverse rule does not; the MODEL card's win chances are the sim's; timers and queued picks; determinism and snapshot replay;
   stars ("no change", midpoint and all-hawk calls never earn Predict); every bot finishes every level and none earns three
   stars in a level; What if? Interesting results always say what happened, and a thaw never rewrites the realised record.
   Levels (D6 decision 9): 0 tide pool, 1 the mutant, 2 big shells + new beach, 3 owners. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim } = G, FAST = !!process.env.HK_FAST, N = k => FAST ? Math.max(10, Math.round(k / 5)) : k;
  const { mulberry } = require('./vmgame');
  const LV = ch.levels, near = (acts, v) => acts.filter(a => a.k === 'predict').reduce((b, a) => Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b);
  const det = (x, e, V, C, B, gens) => { for (let g = 0; g < gens; g++) { let q = 0; for (let i = 0; i < x.length; i++) q += x[i] * e[i]; const w = e.map(ei => B + sim.pi(ei, q, V, C)); let wb = 0; for (let i = 0; i < x.length; i++) wb += x[i] * w[i]; x = x.map((v, i) => v * w[i] / wb); } return x; };
  const pHawk = s => { const x = sim.shares(s.n), w = sim.wts(s); let p = 0; for (let j = 0; j < x.length; j++) p += x[j] * sim.hp(s.types[j].e, w); return p; };
  const pol = f => (s, acts, rnd) => acts.length && acts[0].k === 'predict' ? sim.near(acts, sim.now(s)) : sim.pending(s) ? { k: 'pick', a: f(s, rnd) } : null;
  const own = s => s.duel.d < 0 ? 1 : 0;   // owner-wins: Hawk as owner, Dove as intruder
  const mixed = sd => { const s = G.reset(0, sd); s.types = [{ id: 'M', e: [0.4, 0.4, 0.4] }, { id: 'Y', e: [0.4, 0.4, 0.4] }]; s.n = [146, 4]; s.you = 1; return s; };   // a beach where every resident hawks 40% of the time

  /* ---------- the payoff table and the mixed equilibrium (V = 4, C = 10) ---------- */
  t.eq([sim.pi(1, 1, 4, 10), sim.pi(1, 0, 4, 10), sim.pi(0, 1, 4, 10), sim.pi(0, 0, 4, 10)], [-3, 4, 0, 2], 'payoffs: hawk v hawk (V−C)/2 = −3, hawk v dove V = 4, dove v hawk 0, dove v dove V/2 = 2');
  t.near(sim.pi(1, 0.4, 4, 10), 1.2, 1e-12, 'at p = V/C = 0.4 a hawk expects 1.2');
  t.near(sim.pi(0, 0.4, 4, 10), 1.2, 1e-12, 'and a dove expects the same 1.2');
  t.ok(sim.pi(1, 0.3, 4, 10) > sim.pi(0, 0.3, 4, 10) && sim.pi(1, 0.5, 4, 10) < sim.pi(0, 0.5, 4, 10), 'below V/C hawk pays more; above it dove pays more');
  t.ok(sim.pi(1, 1, 8, 4) > sim.pi(0, 1, 8, 4) && sim.pi(1, 0, 8, 4) > sim.pi(0, 0, 8, 4), 'V > C (8, 4): hawk beats dove against anyone');

  /* ---------- A. with no player the beach reaches V/C ---------- */
  t.near(det([0.85, 0.15], [1, 0], 4, 10, 5, 300)[0], 0.4, 0.002, 'A. deterministic: from 85% hawks the beach settles at V/C = 0.4');
  t.near(det([0.05, 0.95], [1, 0], 4, 10, 5, 300)[0], 0.4, 0.002, 'A. deterministic: from 5% hawks it settles at V/C too');
  for (const [start, label] of [[128, 'from 85% hawks (L1)'], [8, 'from 8 hawks']]) {
    let tot = 0, n = 0, lost = 0, runs = 0;
    for (let sd = 1; sd <= N(60); sd++) {
      const s = G.reset(0, sd); s.n = [start, 150 - start]; let m = 0, k = 0; runs++;
      for (let g = 0; g < 160; g++) { sim.gen(s); if (g >= 60) { m += pHawk(s); k++; } }
      if (s.n[0] === 0) { lost++; continue; }   // a few hawks can be lost by chance before selection takes hold (drift)
      tot += m; n += k;
    }
    t.near(tot / n, 0.4, 0.02, `A. 150 crabs, no player, ${label}: mean hawk share over generations 60–160 = ${(tot / n).toFixed(3)}` + (lost ? ` (hawks lost by chance in ${lost} of ${runs} runs)` : ''));
  }

  /* ---------- B. a rare pure invader into the mixed-ESS beach (every resident hawks 40% of the time) ---------- */
  for (const [e, name] of [[1, 'Hawk'], [0, 'Dove']]) {
    let rel = 0, gens = 0; const start = 3;
    for (let sd = 1; sd <= 200; sd++) {
      const s = G.reset(0, sd); s.types = [{ id: 'M', e: [0.4, 0.4, 0.4] }, { id: 'X', e: [e, e, e] }]; s.n = [150 - start, start]; s.you = -1;
      for (let g = 0; g < 20 && s.n[1] > 0; g++) {
        const x = sim.shares(s.n), E = sim.E(s, x, s.types), w = sim.fit(s, E), wb = x[0] * w[0] + x[1] * w[1];
        rel += w[1] / wb - 1; gens++; sim.gen(s);
      }
    }
    t.ok(rel / gens < 0, `B. a rare pure ${name} invader: mean relative fitness over 200 seeds = ${(rel / gens).toExponential(2)} (< 0)`);
  }
  for (const [e, name] of [[1, 'Hawk'], [0, 'Dove']]) {   // once common, the invader shrinks (the ESS's second condition)
    let end = 0; const start = 30, n = N(1000);
    for (let sd = 1; sd <= n; sd++) { const s = G.reset(0, sd); s.types = [{ id: 'M', e: [0.4, 0.4, 0.4] }, { id: 'X', e: [e, e, e] }]; s.n = [150 - start, start]; s.you = -1; for (let g = 0; g < 20; g++) sim.gen(s); end += s.n[1]; }
    t.ok(end / n < start * 0.95, `B. a pure ${name} lineage at 20% of the beach shrinks to ${(end / n).toFixed(1)} crabs of ${start} in 20 generations`);
  }
  { // Bishop–Cannings: when rare every rule earns what the residents earn; once common, any other rule earns less
    const s = mixed(1); let ok0 = true, okC = true, okF = true;
    for (const r of [0, 0.2, 0.7, 1]) {
      if (Math.abs(sim.edge(s, 0, [r, r, r])) > 1e-12) ok0 = false;
      const e5 = sim.edge(s, 0.5, [r, r, r]); if (!(e5 < 0)) okC = false;
      if (Math.abs(e5 - (-5 * 0.5 * (r - 0.4) * (r - 0.4))) > 1e-9) okF = false;
    }
    t.ok(ok0, 'Bishop–Cannings: a rare rule of any P(Hawk) earns exactly the residents\' payoff (edge 0 at share 0)');
    t.ok(okC, 'the ESS condition: at half the beach any other rule earns less than the residents');
    t.ok(okF, 'the edge follows −(C/2)·f·(r − V/C)², with C/2 = 5');
    t.near(sim.edge(s, 0.5, [0.4, 0.4, 0.4]), 0, 1e-12, 'the residents\' own rule (0.4) is neutral at any share');
  }

  /* ---------- L2: your hawks spread early from a brood of four, then stall near V/C ---------- */
  {
    let fin = 0, disc = 0, kin = 0, under = 0, floor = true; const n = N(80), t10 = [];
    for (let sd = 1; sd <= n; sd++) {
      const r = G.run(1, { seed: sd, bot: 'alwaysA' }), h = r.s.hist; fin += h[h.length - 1].p; if (r.result.mask & 1) disc++; kin += r.s.kinN / r.s.dn;
      if (h[3].p < 0.1) under++; const k = h.findIndex(q => q.p >= 0.1); t10.push(k < 0 ? 99 : k);
      for (const q of h) if (q.n[r.s.you] < 2) floor = false;
    }
    t10.sort((a, b) => a - b);
    t.near(fin / n, 0.39, 0.04, `L2: an always-Hawk player's beach ends at ${(fin / n).toFixed(3)} hawks (V/C = 0.4)`);
    t.ok(disc / n >= 0.9, `L2: the lineage passes 20% of the beach, out-earning the average crab, in ${Math.round(100 * disc / n)}% of runs`);
    t.ok(kin / n > 0.1, `L2: ${(100 * kin / n).toFixed(0)}% of your duels end up against your own kin`);
    t.ok(under / n <= 0.15 && t10[n >> 1] <= 2, `L2: from a brood of four, hawks are still under 10% after tide 3 in ${Math.round(100 * under / n)}% of runs (median tide to 10%: ${t10[n >> 1]})`);
    t.ok(floor, 'L2: your newest brood never drops below two crabs');
  }
  { // cohorts: your newest young take your rule, older kin keep theirs. Hawk for 20 duels, then Dove: the hawks you bred stay hawks
    let pEnd = 0, cohort = 0; const n = N(30);
    for (let sd = 1; sd <= n; sd++) {
      const r = G.run(1, { seed: sd, policy: pol(s => s.dn < 20 ? 1 : 0) }), s = r.s, h = s.hist;
      pEnd += h[h.length - 1].p; if (s.types.some((ty, j) => ty.id === 'K' && ty.e[1] === 1 && s.n[j] > 0)) cohort++;
    }
    t.ok(pEnd / n > 0.2 && cohort / n >= 0.9, `cohorts: after switching from Hawk to Dove, hawks stay at ${(pEnd / n).toFixed(2)} of the beach (a Hawk cohort of your kin survives in ${Math.round(100 * cohort / n)}% of runs); no living crab changes its rule`);
    const s = G.reset(1, 3); s.tide = 2; s.n = [100, 20, 30]; s.types = [{ id: 'D', e: [0, 0, 0] }, { id: 'K', e: [1, 1, 1] }, { id: 'Y', e: [1, 1, 1] }]; s.you = 2;
    const sp = sim.inherit(s, [0, 0, 0]);
    t.ok(sp && s.n[2] === 2 && s.n[1] === 48 && s.types[2].e[1] === 0 && s.types[1].e[1] === 1, 'cohorts: a changed rule passes only to your newest brood (2 crabs); 28 older kin join the Hawk cohort unchanged');
  }

  /* ---------- L3 (Big shells' coda): the new beach (V 6, C 8, half hawks) settles near 0.75 ---------- */
  {
    let tot = 0; const n = N(60);
    for (let sd = 1; sd <= n; sd++) { const r = G.run(2, { seed: sd, bot: 'alwaysB' }); tot += r.s.nb.hist[r.s.nb.hist.length - 1]; }
    t.near(tot / n, 0.75, 0.04, `L3 prediction: the new beach ends at ${(tot / n).toFixed(3)} hawks (V/C = 0.75)`);
  }

  /* ---------- L3: V > C. Hawks take over and everyone's payoff falls towards (V − C)/2 ---------- */
  {
    const s0 = G.reset(2, 1), p = pHawk(s0);
    t.near(s0.hist[0].mp, 4 - p * p * 2, 1e-9, `L3: mean payoff = V/2 − p²C/2 at the start (${s0.hist[0].mp.toFixed(3)}, p = ${p.toFixed(3)})`);
    let fp = 0, fm = 0, disc = 0, discD = 0; const n = N(60);
    for (let sd = 1; sd <= n; sd++) {
      const r = G.run(2, { seed: sd, bot: 'alwaysA' }); const z = r.s.hist[r.s.hist.length - 1]; fp += z.p; fm += z.mp; if (r.result.mask & 1) disc++;
      if (G.run(2, { seed: sd, bot: 'alwaysB' }).result.mask & 1) discD++;
    }
    t.ok(fp / n > 0.88, `L3: in three tides hawks reach ${(100 * fp / n).toFixed(0)}% of the beach`);
    t.ok(fm / n < 2.5 && fm / n >= 2, `L3: the mean payoff falls towards (V − C)/2 = 2 (${(fm / n).toFixed(2)}, from 3.88)`);
    t.ok(disc / n >= 0.9 && discD === 0, `L3: the tragedy, played for what pays (Discover): always Hawk ${Math.round(100 * disc / n)}%, always Dove ${discD} runs`);
  }

  /* ---------- L4: owners. Owner-wins is neutral when rare, favoured once common; it spreads from the brood ---------- */
  {
    const s = G.reset(3, 1), P = sim.par(s), M = { ds: [[-1, 0.5], [1, 0.5]] }, Bg = [1, 0.5, 0], X = [0, 0.5, 1], H = [1, 1, 1], D = [0, 0, 0];
    t.near(sim.edge(s, 0, Bg), 0, 1e-12, 'L4: owner-wins is neutral when rare on the 40% hawk beach (edge 0 at share 0)');
    t.ok(sim.edge(s, 0.3, Bg) > 0.3 && sim.edge(s, 0.6, Bg) > sim.edge(s, 0.3, Bg), `L4: once common it is favoured, more so the commoner it is (edge ${sim.edge(s, 0.3, Bg).toFixed(2)} at 30%, ${sim.edge(s, 0.6, Bg).toFixed(2)} at 60%)`);
    t.near(sim.payC(Bg, Bg, P, M), P.V / 2, 1e-12, 'L4: two owner-wins crabs never fight: each gets V/2 on average');
    t.ok(Math.abs(sim.payC(X, X, P, M) - sim.payC(Bg, Bg, P, M)) < 1e-12 && Math.abs(sim.edge(s, 0.4, X) - sim.edge(s, 0.4, Bg)) < 1e-12, 'L4: intruders-win is the mirror image: stable in theory too');
    t.near(sim.hp(Bg, sim.wts(s)), 0.5, 1e-12, 'L4: an owner-wins crab escalates in half its duels (roles weighted 1:1)');
    let fin = 0, disc = 0, finH = 0, discH = 0, lost = 0; const n = N(60);
    for (let sd = 1; sd <= n; sd++) {
      const r = G.run(3, { seed: sd, policy: pol(own) }), z = r.s.hist[r.s.hist.length - 1]; fin += z.f; if (r.result.mask & 4) disc++; if (z.f < 0.06) lost++;
      const q = G.run(3, { seed: sd, policy: pol(() => 1) }); finH += q.s.hist[q.s.hist.length - 1].f; if (q.result.mask & 4) discH++;
    }
    t.ok(disc / n >= 0.75 && fin / n > 0.6, `L4 (Transfer): an owner-wins lineage grows from a brood of 25 to ${(100 * fin / n).toFixed(0)}% on average; it holds a third of the beach in ${Math.round(100 * disc / n)}% of runs (lost by drift in ${lost})`);
    t.ok(discH / n <= 0.05 && finH / n < 0.2, `L4: a blind Hawk lineage ends at ${(100 * finH / n).toFixed(0)}% and earns Transfer in ${discH} of ${n} runs (only when a role never came up before the brood hatched, so its rule there stayed the residents’)`);
  }
  { // the size lever (What if?): an assessor invades a blind 40/60 beach; the reverse rule does not; the MODEL card's numbers are the sim's
    const s = G.reset(3, 1); s.ov = { sized: true }; const P = sim.par(s), M = { ds: [[-2, 0.2], [-1, 0.2], [0, 0.2], [1, 0.2], [2, 0.2]] }, H = [1, 1, 1], D = [0, 0, 0], A = [1, 1, 0], X = [0, 0, 1];
    const vs = e => 0.4 * sim.payC(e, H, P, M) + 0.6 * sim.payC(e, D, P, M);
    t.near(sim.pw(1, P.k), 1 / (1 + Math.exp(2)), 1e-12, `sizes: a crab one size step smaller wins an escalated fight with chance ${sim.pw(1, P.k).toFixed(3)}`);
    t.ok(vs(A) > vs(H) + 0.5 && vs(X) < vs(H), `sizes: an assessor earns ${vs(A).toFixed(2)} against ${vs(H).toFixed(2)}; fighting only bigger rivals earns ${vs(X).toFixed(2)}`);
    t.near(sim.hp(A, sim.wts(s)), 0.6, 1e-12, 'sizes: an assessor escalates in 60% of duels (smaller 2/5, equal 1/5, bigger 2/5), not 67%');
    const card = ch.content.model.find(m => m.level === 3).params, val = name => (card.find(p => p.name === name) || {}).value;
    t.ok(val('win chance, 1 step smaller (What if?)') === sim.pw(1, 2).toFixed(2) && val('win chance, 1 step bigger (What if?)') === sim.pw(-1, 2).toFixed(2) && val('win chance, 2 steps smaller or bigger') === sim.pw(2, 2).toFixed(2) + ' or ' + sim.pw(-2, 2).toFixed(2),
      `the L4 MODEL card's win chances are the sim's (smaller ${sim.pw(1, 2).toFixed(2)}, bigger ${sim.pw(-1, 2).toFixed(2)}, 2 steps ${sim.pw(2, 2).toFixed(2)} or ${sim.pw(-2, 2).toFixed(2)})`);
  }

  /* ---------- timers, queued picks ---------- */
  {
    let s = G.reset(0, 4); for (let i = 0; i < 30 * 60; i++) sim.step(1 / 30);
    t.ok(s === sim.s && s.dn === 0 && s.duel.st === 'face' && s.duel.a == null, 'timers: the first duel of a level waits for your pick (60 s, no default Dove)');
    sim.act({ k: 'pick', a: 1 }); let slow = null; for (let i = 0; i < 30 * 12 && !slow; i++) { for (const e of sim.step(1 / 30)) if (e.k === 'clash' && e.slow) slow = s.time; }
    t.ok(slow != null && s.dl.length === 2 && s.dl[1][0] === 0, 'timers: a later rival waits 5.5 s, then you display (marked slow)');
    s = G.reset(3, 9); sim.act({ k: 'pick', a: 1 }); for (let i = 0; i < 40 && sim.s.duel.st !== 'clash'; i++) sim.step(1 / 30); for (let i = 0; i < 12; i++) sim.step(1 / 30);
    const ev = sim.act({ k: 'pick', a: 1 }); for (let i = 0; i < 60 && sim.s.duel.st !== 'walk'; i++) sim.step(1 / 30);
    t.ok(sim.s.q == null && sim.s.duel.a == null && ev.some(e => e.k === 'early'), 'queue: in Owners a tap during the clash is not a blind pick for the next rival');
    s = G.reset(1, 9); sim.act({ k: 'pick', a: 1 }); for (let i = 0; i < 40 && sim.s.duel.st !== 'clash'; i++) sim.step(1 / 30);
    const e1 = sim.act({ k: 'pick', a: 0 }); for (let i = 0; i < 15; i++) sim.step(1 / 30); const e2 = sim.act({ k: 'pick', a: 0 });
    t.ok(!e1.length && e2.some(e => e.k === 'queue'), 'queue: a second tap within 0.3 s of the clash is a double tap, not a pick; a later tap queues');
  }

  /* ---------- determinism, snapshots, replays ---------- */
  {
    const a = G.run(1, { seed: 5, bot: 'random', rnd: mulberry(9) }), b = G.run(1, { seed: 5, bot: 'random', rnd: mulberry(9) });
    t.eq([a.s.n, a.s.score, a.s.hist.map(r => r.p)], [b.s.n, b.s.score, b.s.hist.map(r => r.p)], 'a run is (seed, actions): two runs agree exactly');
    G.reset(3, 11); for (let i = 0; i < 400; i++) { if (sim.s.duel && sim.s.duel.st === 'face' && sim.s.duel.a == null) sim.act({ k: 'pick', a: i % 2 }); sim.step(1 / 30); }
    const snap = sim.snapshot(), run = () => { const out = []; for (let i = 0; i < 300; i++) { if (sim.s.ask) sim.act({ k: 'predict', id: sim.s.ask.id, v: 0.3 }); if (sim.s.duel && sim.s.duel.st === 'face' && sim.s.duel.a == null) sim.act({ k: 'pick', a: 1 }); sim.step(1 / 30); } return JSON.stringify([sim.s.n, sim.s.score, sim.s.tide]); };
    const one = run(); sim.restore(snap); const two = run();
    t.eq(one, two, 'a snapshot restores the run exactly (R() state included)');
    const r = G.run(2, { seed: 21, bot: 'random', rnd: mulberry(4) }), log = r.s.log.slice();
    G.reset(2, 21); let k = 0; for (let tick = 0; tick < 1e5 && !sim.result(); tick++) { while (k < log.length && log[k][0] === tick) sim.act(log[k++][1]); if (sim.result()) break; sim.step(1 / 30); }
    t.eq([sim.s.n, sim.s.score], [r.s.n, r.s.score], 'replaying the action log reproduces the run');
  }

  /* ---------- stars: the one prediction (the new beach) and each level's own stars ---------- */
  {
    let hit = 0, miss = 0; const n = N(30);
    for (let sd = 1; sd <= n; sd++) {
      if (G.run(2, { seed: sd, policy: (s2, acts, rnd) => acts.length && acts[0].k === 'predict' ? near(acts, 0.75) : G.bot('alwaysA')(s2, acts, rnd) }).result.mask & 2) hit++;
      if (G.run(2, { seed: sd, policy: (s2, acts, rnd) => acts.length && acts[0].k === 'predict' ? near(acts, 0.6) : G.bot('alwaysA')(s2, acts, rnd) }).result.mask & 2) miss++;
    }
    t.ok(hit === n && miss === 0, `calling V/C = 0.75 on the new beach earns Predict in ${hit} of ${n} runs; calling 0.6 in ${miss}`);
    const cheat = {}; let total = 0;
    for (const b of ['greedy', 'doveNoChange', 'hawkNoChange', 'threshold', 'allHawks', 'alwaysA', 'alwaysB']) for (const lv of [0, 1, 2, 3]) for (let sd = 1; sd <= N(30); sd++) { total++; if (G.run(lv, { seed: sd, bot: b }).result.mask & 2) cheat[b + ' L' + (lv + 1)] = (cheat[b + ' L' + (lv + 1)] || 0) + 1; }
    t.ok(!Object.keys(cheat).length, `"no change" (50%), the midpoint, all hawks or no hawks never earn Predict: ${Object.values(cheat).reduce((a, v) => a + v, 0)} of ${total} runs ${JSON.stringify(cheat)}`);
    let d3 = 0; for (let sd = 1; sd <= N(40); sd++) if (G.run(2, { seed: sd, bot: 'doveNoChange' }).result.mask & 1) d3++;
    t.ok(d3 === 0, `always Dove never earns the Big shells Discover (${d3} runs): the star needs you to play what pays`);
    const offered = [0, 1, 2, 3].map(lv => ['discover', 'predict', 'transfer'].filter((k, i) => ch.content.captions['s' + lv + 'dpt'[i]]));
    t.eq(offered, [['discover'], ['discover'], ['discover', 'predict'], ['transfer']], 'each level\'s card offers only its own stars; the unit offers all three');
  }

  /* ---------- every bot finishes every level; no bot earns three stars in a level; unit-wide stars ---------- */
  {
    const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'doveNoChange', 'hawkNoChange', 'allHawks'], seeds = N(20); let capped = 0, three = 0; const union = {};
    for (const b of bots) for (let sd = 1; sd <= seeds; sd++) {
      let u = 0;
      for (let lv = 0; lv < LV.length; lv++) { const r = G.run(lv, { seed: sd, bot: b, rnd: mulberry(sd * 7 + lv) }); if (r.capped) capped++; const m = r.result ? r.result.mask : 0; if (m === 7) three++; u |= m; }
      union[b] = Math.max(union[b] || 0, (u & 1) + (u >> 1 & 1) + (u >> 2 & 1));
      if (u === 7) union[b + '_7'] = (union[b + '_7'] || 0) + 1;
    }
    t.ok(capped === 0, `every bot finishes every level inside 2× its minutes (${capped} capped runs)`);
    t.ok(three === 0, 'no bot earns three stars in any level');
    t.note('unit-wide stars per bot (best over ' + seeds + ' seeds): ' + bots.map(b => b + ' ' + union[b] + (union[b + '_7'] ? ' (3 on ' + union[b + '_7'] + ' seeds)' : '')).join(', '));
    t.ok(bots.filter(b => b !== 'random').every(b => union[b] < 3), 'no fixed bot earns all three unit stars');
    t.ok((union.random_7 || 0) <= Math.ceil(seeds * 0.15), `a uniformly random clicker lucks into all three unit stars on ${union.random_7 || 0} of ${seeds} seeds (≤ 15%; no level gives it three)`);
  }

  /* ---------- What if?: thaw a frozen tide, change one thing; the Interesting result says what actually happened ---------- */
  {
    const WI = [1, 1, 1, 1];
    const play = (lv, sd, f) => {
      G.reset(lv, sd); let snap = null; const rnd = mulberry(sd * 13 + 1);
      for (let i = 0; i < 60000 && !sim.result(); i++) {
        const s = sim.s; if (s.ask) sim.act({ k: 'predict', id: s.ask.id, v: 0.5 });
        else if (sim.pending(s)) sim.act({ k: 'pick', a: f(s, rnd) });
        for (const e of sim.step(1 / 30)) if (e.k === 'tide' && e.tide === WI[lv]) snap = sim.snapshot();
      }
      return snap;
    };
    const thaw = (lv, snap, lever) => { ch.level = lv; sim.reset(lv, { thaw: { gen: WI[lv], snap, lever } }); let k = 0; while (!sim.result() && k++ < 60000) sim.step(1 / 30); return sim.s; };
    // each key's claim, checked against the run it describes
    const claim = {
      cheap: (s, z) => z.p > 0.85, cheapSome: (s, z, r1) => z.p > r1.p, cheapNone: (s, z) => z.p < 0.02, costly: (s, z) => Math.abs(z.p - 0.2) <= 0.08, costlyFar: (s, z, r1) => z.p < r1.p && z.p > 0.28 - 1e-9, costlyLow: (s, z) => z.p < 0.12 + 1e-9,
      dove: (s, z) => z.p < 0.02,
      costly4: (s, z) => Math.abs(z.p - 2 / 3) <= 0.08, costly4Far: (s, z) => Math.abs(z.p - 2 / 3) > 0.08, costly4None: (s, z) => z.p > 0.98, allDove: (s, z, r1) => z.p > 0.8 && z.mp < r1.mp, allDoveSlow: (s, z, r1) => z.p > r1.p && z.mp < r1.mp, allDoveNone: (s, z, r1) => z.p <= r1.p + 0.05,
      sizes: (s, z, r1) => z.f > r1.f, sizesDown: (s, z, r1) => z.f < r1.f + 0.05, intruder: (s, z, r1) => z.f > r1.f, intruderDown: (s, z, r1) => z.f < r1.f + 0.05
    };
    const plan = [[0, s => 1, ['cheap', 'costly'], { cheap: 'cheap' }], [1, s => 1, ['cheap', 'dove'], { cheap: 'cheap', dove: 'dove' }], [1, s => 0, ['cheap'], { cheap: 'cheapNone' }],
      [2, s => 1, ['costly4', 'allDove'], { costly4: 'costly4' }], [3, own, ['sizes', 'intruder'], { sizes: 'sizes', intruder: 'intruder' }]];
    const n = N(30); let wrong = [], kept = true, marked = true; const head = [];
    for (const [lv, f, levers, main] of plan) for (const lever of levers) {
      let mainN = 0;
      for (let sd = 1; sd <= n; sd++) {
        const snap = play(lv, sd, f), s = thaw(lv, snap, lever), res = sim.result(), z = s.hist[s.hist.length - 1], r1 = s.wi0.r1;
        if (res.mask !== 0) wrong.push(`L${lv + 1} ${lever}: a What if? gave stars`);
        if (!claim[res.interesting] || !claim[res.interesting](s, z, r1)) wrong.push(`L${lv + 1} ${lever} seed ${sd}: "${res.interesting}" does not match the run`);
        if (main[lever] && res.interesting === main[lever]) mainN++;
        const rec = s.hist.filter(q => q.wi); if (rec.length !== 1 || rec[0].t !== WI[lv]) marked = false;
        const orig = sim.restore(snap) || sim.s; if (JSON.stringify(orig.hist) !== JSON.stringify(s.hist.slice(0, orig.hist.length))) kept = false;
      }
      if (main[lever]) head.push(`L${lv + 1} ${lever} → ${main[lever]} ${Math.round(100 * mainN / n)}%`);
      if (main[lever] && mainN / n < 0.6) wrong.push(`L${lv + 1} ${lever}: "${main[lever]}" in only ${mainN} of ${n}`);
    }
    t.ok(!wrong.length, 'What if?: every Interesting result matches the run it describes, no What if? gives stars, and each lever\'s main result shows in ≥ 60% (' + head.join('; ') + ')' + (wrong.length ? ' ' + wrong.slice(0, 3).join(' | ') : ''));
    t.ok(kept && marked, 'What if?: a thaw keeps the realised record and adds one marked point at the thawed tide');
  }
};
