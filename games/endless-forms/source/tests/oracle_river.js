/* tests/oracle_river.js: the science oracle for The River (D3 §4.7; D6 decisions 9 and 10).
   Run: node tests/oracle.js BUILD.html river          (RV_FAST=1 for a quicker pass)
   D3's acceptance lines:
     A. expected clashes after k changes per bank are 0.15·k² ± 10% (the Orr snowball; k² untested north–south pairs);
     B. the choosy allele rises only in contact with unfit hybrids; with fit hybrids or no contact it does not (upstream it only drifts);
   (C, Haldane's rule on an X-linked pair, was cut with the boss it belonged to: D6 decision 9.)
   Plus: hybrid survival 0.55^clashes and the legacy species line (3 clashes 17% < 20% ≤ 2 clashes 30%); the expected-survival
   formula (1 − p + 0.55p)^(k²) against Monte Carlo; mergers below the line restart the split; the call gap grows only in contact;
   the stars read the expectation; determinism and snapshot replay; the one prediction; an expert earns every star the unit
   offers; no level offers three stars and no bot's union across the unit reaches three; every Interesting and What if? text
   matches its own run; result codes fit in 30 bits. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim } = G, FAST = !!process.env.RV_FAST, N = k => FAST ? Math.max(6, Math.round(k / 4)) : k;
  const run = (lv, seed, bot, extra) => G.run(lv, Object.assign({ seed, bot }, extra || {}));
  const stars3 = m => ((m & 1) ? 1 : 0) + ((m & 2) ? 1 : 0) + ((m & 4) ? 1 : 0);
  const pw = (q, n) => { let r = 1; for (let i = 0; i < n; i++) r *= q; return r; };

  /* ---------- A. the snowball: k² untested pairs, 0.15·k² expected clashes ---------- */
  { const S = sim, n = N(600), tot = {}, surv = {}, cells = {};
    for (let sd = 1; sd <= n; sd++) {
      G.reset(0, sd); const s = S.s;
      for (let k = 1; k <= 8; k++) { S.mutate(s, []); tot[k] = (tot[k] || 0) + s.cl; surv[k] = (surv[k] || 0) + pw(0.55, s.cl); cells[k] = s.cells.length; }
    }
    let ok = true; for (let k = 1; k <= 8; k++) if (cells[k] !== k * k) ok = false;
    t.ok(ok, 'each bank\'s k-th change adds 2k − 1 new north–south pairs: k × k untested pairs in all (k = 1…8)');
    for (const k of [2, 4, 6, 8]) t.ok(Math.abs(tot[k] / n - 0.15 * k * k) <= 0.1 * 0.15 * k * k + (k <= 2 ? 0.05 : 0), `A. mean clashes after ${k} changes per bank ${(tot[k] / n).toFixed(2)} = 0.15·k² = ${(0.15 * k * k).toFixed(2)} ± 10%`);
    t.ok(tot[8] / tot[4] > 3.5 && tot[8] / tot[4] < 4.5, `doubling the time apart (4 → 8) multiplies clashes by ${(tot[8] / tot[4]).toFixed(2)} (≈ 4, not 2)`);
    for (const k of [3, 5, 6]) t.ok(Math.abs(surv[k] / n - pw(1 - 0.15 + 0.15 * 0.55, k * k)) < 0.02, `expected hybrid survival at k = ${k}: Monte Carlo ${(surv[k] / n).toFixed(3)} = (1 − p + 0.55p)^(k²) = ${pw(0.9325, k * k).toFixed(3)}`);
  }
  { const tk = k => G.Det.exp(-0.5978370007556204 * 0.15 * k * k);   // the sim's RV.tsurv for p = 0.15
    t.ok(Math.abs(tk(5) - Math.pow(0.55, 3.75)) < 1e-9 && tk(4) >= 0.2 && tk(5) < 0.2 && tk(5) >= 0.1 && tk(6) < 0.1,
      `the panel's survival 0.55^(0.15·k²): k = 4 ${(100 * tk(4)).toFixed(1)}% (above the line), k = 5 ${(100 * tk(5)).toFixed(1)}%, k = 6 ${(100 * tk(6)).toFixed(1)}%`);
    const ex = k => pw(0.9325, k * k); t.ok(ex(4) >= 0.2 && ex(5) < 0.2 && ex(5) >= 0.1 && ex(6) < 0.1, 'and it crosses 20% and 10% at the same k (5 and 6) as the true expectation (1 − p + 0.55p)^(k²), so the stars are unchanged');
  }
  { G.reset(0, 3); const S = sim, s = S.s; s.line = true; for (let k = 1; k <= 6; k++) S.mutate(s, []); t.eq(s.cells.length, 6, 'the straight-line What if? adds one pair an epoch (6 pairs after 6 changes)'); }

  /* ---------- hybrid survival and the species line (legacy ch6.js) ---------- */
  { const S = sim; G.reset(0, 1); const s = S.s;
    t.near(pw(0.55, 3), 0.166375, 1e-9, 'three clashes leave 0.55³ ≈ 17% hybrid survival: below the 20% species line');
    t.ok(pw(0.55, 2) >= 0.2, 'two clashes leave 30%: at or above the line, so contact merges the banks');
    // force a merger: two changes, no clashes, join
    s.phase = 'run'; S.mutate(s, []); S.mutate(s, []); s.cells.forEach(c => { c[2] = 0; }); s.cl = 0; S.act({ k: 'log', on: true });
    let k = 0; while (s.phase !== 'run' && k++ < 2000) S.step(1 / 30);
    t.ok(s.fused === 1 && s.k === 0 && s.cells.length === 0 && !s.down, 'a merger restarts the split: no changes, no pairs, the log lifted');
  }

  /* ---------- B. reinforcement: only in contact, and only with unfit hybrids ---------- */
  { let pA = 0, gA = 0, pB = 0, gB = 0, pU = 0, n = N(40);
    for (let sd = 1; sd <= n; sd++) { const a = run(1, sd, 'alwaysA'), b = run(1, sd, 'alwaysB'); pA += a.s.p; gA += a.s.g; pB += b.s.p; gB += b.s.g; pU += a.s.pU; }
    t.ok(pA / n > 0.9 && Math.abs(pB / n - 0.1) < 1e-12, `B. in contact with 9% hybrid survival choosy females rise from 10% to ${Math.round(100 * pA / n)}%; with no contact they stay at 10%`);
    t.ok(gA / n > 18 && Math.abs(gB / n - 7) < 1e-9, `the call gap grows from 7% to ${(gA / n).toFixed(1)}% in contact and stays at 7% apart`);
    t.ok(Math.abs(pU / n - 0.1) < 0.04, `upstream, never in contact, choosy females only drift: mean ${(100 * pU / n).toFixed(1)}% (started 10%)`);
    // fertile, fully fit hybrids (w = 1): the recursion the sim uses gives the choosy allele no advantage
    { G.reset(1, 2); let pp = 0.1, gg = 7; const R0 = ch.sim.s; R0.w = 1; const before = pp;
      for (let i = 0; i < 12; i++) { const x1 = 0.5 * (1 - gg / (gg + 5)), W0 = 1 - 0.5 * (1 - R0.w), W1 = 1 - x1 * (1 - R0.w); pp = pp * W1 / (pp * W1 + (1 - pp) * W0); }
      t.near(pp, before, 1e-12, 'B. with fully fit hybrids a choosy female gains nothing, so selection leaves the allele where it was'); }
    { let rose = 0; for (const w of [0.6, 0.3, 0.09]) { let pp = 0.1, gg = 7; for (let i = 0; i < 6; i++) { const x1 = 0.5 * (1 - gg / (gg + 5)), W0 = 1 - 0.5 * (1 - w), W1 = 1 - x1 * (1 - w); pp = pp * W1 / (pp * W1 + (1 - pp) * W0); } rose = pp > rose + 0.02 ? pp : -1; if (rose < 0) break; }
      t.ok(rose > 0, 'and the less fit the hybrids, the faster the choosy allele spreads (hybrid survival 60% → 30% → 9%)'); }
  }
  { // the stars read the expectation: the zone's realised state equals the recursion over the contact history
    let bad = 0; for (let sd = 1; sd <= N(20); sd++) for (const b of ['alwaysA', 'threshold', 'lifter']) { const r = run(1, sd, b), s = r.s, x = sim.expWaste(s); if (Math.abs(x - 100 * 0.5 * (1 - s.p * s.g / (s.g + 5)) * (1 - s.w)) > 1e-9) bad++; }
    t.eq(bad, 0, 'L2: the expected wasted clutches the star reads equal the realised contact-zone state (no drift at the log)');
    const nights = h => { G.reset(1, 1); const s = sim.s; s.hist = h; s.final = 0; return sim.expWaste(s); };
    t.ok(nights(new Array(12).fill(1)) <= 12 && nights(new Array(11).fill(1).concat([0])) <= 12 && nights(new Array(10).fill(1).concat([0, 0])) > 12,
      `L2 Discover (≤ 12% wasted): 12 nights of contact give ${nights(new Array(12).fill(1)).toFixed(1)}%, 11 give ${nights(new Array(11).fill(1).concat([0])).toFixed(1)}%, 10 give ${nights(new Array(10).fill(1).concat([0, 0])).toFixed(1)}%`);
    t.near(nights([]), 42.8, 0.1, 'with no contact at all, 42.8% of clutches are wasted when the banks join for good');
  }

  /* ---------- the one prediction ---------- */
  { let pos = new Set(), opened = 0, n = N(30);
    for (let sd = 1; sd <= n; sd++) { G.reset(0, sd); pos.add(sim.s.opts.indexOf(36)); const r = run(0, sd, 'expert'); if (r.s.pred.p1 === 36) opened++; }
    t.ok(pos.size === 3, 'the three answers (12, 18, 36 pairs) come in a seeded order, so no fixed position is always right');
    t.eq(opened, n, `the call opens at 3 changes per bank and the expert answers it on ${n} of ${n} seeds`);
    let p18 = 0; for (let sd = 1; sd <= n; sd++) if (run(0, sd, 'greedy').result.mask & 2) p18++;
    t.eq(p18, 0, 'calling the linear answer (18: twice the time, twice the pairs) never earns Predict');
  }

  /* ---------- determinism and snapshot replay ---------- */
  for (const lv of [0, 1, 2]) {
    const a = run(lv, 11, 'expert'), b = run(lv, 11, 'expert');
    t.eq(a.s, b.s, `L${lv + 1}: the same seed and actions give the same final state`);
    const S = sim; G.reset(lv, 12); const pol = G.bot('expert'), rnd = () => 0.5; let ticks = 0, snap = null, at = 0;
    while (!S.result() && ticks < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([ticks, x]); S.act(x); } } S.step(S.dt); ticks++; if (ticks === 200) { snap = S.snapshot(); at = ticks; } }
    const end = JSON.stringify(S.s); S.restore(snap); let k = at;
    while (!S.result() && k < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([k, x]); S.act(x); } } S.step(S.dt); k++; }
    t.ok(JSON.stringify(S.s) === end, `L${lv + 1}: a snapshot at tick 200 restores and replays to the same end`);
  }

  /* ---------- stars: per level, the expert, the bots ---------- */
  const offers = [3, 1, 4];   // L1 D+P, L2 D, L3 T: no level offers all three
  const seeds = N(30), bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'lifter', 'late'];
  for (let lv = 0; lv < 3; lv++) {
    let all = 0; for (let sd = 1; sd <= seeds; sd++) { const r = run(lv, sd, 'expert'); if ((r.result.mask & offers[lv]) === offers[lv]) all++; }
    t.ok(all >= Math.ceil(seeds * (lv === 2 ? 0.9 : 1)), `L${lv + 1}: the expert earns every star the level offers (${['D+P', 'D', 'T'][lv]}) on ${all} of ${seeds} seeds${lv === 2 ? ' (a merger by bad luck at 6 changes can cost the boss)' : ''}`);
  }
  { const lv = [0, 1, 2].map(l => run(l, 3, 'expert').result.mask); t.eq(ch.unitStars(lv), 7, 'the expert\'s levels add up to all three unit stars'); }
  for (const b of bots) {
    let worst = 0, three = 0, off = 0;
    for (let sd = 1; sd <= seeds; sd++) {
      const masks = [0, 1, 2].map(l => { const r = run(l, sd, b); const m = r.result ? r.result.mask : 0; if (stars3(m) === 3) three++; if (m & ~offers[l]) off++; return m; });
      worst = Math.max(worst, stars3(ch.unitStars(masks)));
    }
    t.ok(three === 0 && off === 0 && worst < 3, `bot ${b}: no level gives three stars, none outside its offer, and its union across the unit is at most ${worst} star(s)`);
  }
  for (const [lv, b, bit] of [[0, 'alwaysA', 1], [0, 'threshold', 1], [0, 'late', 1], [0, 'alwaysB', 1], [1, 'lifter', 1], [1, 'threshold', 1], [1, 'alwaysB', 1], [2, 'alwaysA', 4], [2, 'threshold', 4], [2, 'late', 4], [2, 'lifter', 4], [2, 'alwaysB', 4]]) {
    let d = 0; for (let sd = 1; sd <= seeds; sd++) if (run(lv, sd, b).result.mask & bit) d++;
    t.eq(d, 0, `fixed strategy "${b}" never earns L${lv + 1} ${bit === 1 ? 'Discover' : 'Transfer'} (${seeds} seeds)`);
  }
  { let d = 0, s0 = 0; for (let sd = 1; sd <= seeds; sd++) { const r = run(0, sd, 'greedy'); if (r.result.mask & 1) d++; if (r.s.fused) s0++; }
    t.eq(d, seeds, `L1: joining once the panel's survival falls below 20% earns Discover every time (it merged anyway by chance on ${s0} of ${seeds} seeds)`); }

  /* ---------- Interesting results say what happened ---------- */
  { let bad = 0; const seen = {};
    for (const b of bots.concat(['expert'])) for (let sd = 1; sd <= N(12); sd++) for (let lv = 0; lv < 3; lv++) {
      const r = run(lv, sd, b), k = r.result.interesting, s = r.s, f = s.joins[0]; if (!k) continue; seen[k] = (seen[k] || 0) + 1;
      const ok = k === 'dry' ? s.forced : k === 'fused' ? s.fused > 0 && f.w >= 0.2 && f.es >= 0.2 : k === 'unlucky' ? s.fused > 0 && f.w >= 0.2 && f.es < 0.2 : k === 'late' ? s.species && s.joinK >= 9
        : k === 'lifted' ? s.ups >= 2 : k === 'upstream' ? s.final != null : k === 'fused3' ? s.fused >= 2 : k === 'late3' ? s.joinE >= 9 && sim.expWaste(s) > 13 : false;
      if (!ok) bad++;
    }
    t.eq(bad, 0, 'every Interesting result matches its own run (' + Object.keys(seen).join(', ') + ')'); }

  /* ---------- What if?: the reruns do what their texts say ---------- */
  { const S = sim, wi = (lv, lever, sd) => { G.reset(lv, sd || 5); const snap = S.snapshot(); return G.run(lv, { seed: sd || 5, reset: { thaw: { snap, lever } } }); };
    const base = wi(0, null), often = wi(0, 'often');
    t.ok(often.result && often.result.mask === 0 && often.s.joinK < base.s.joinK, `What if? double clash chance: the best plan joins at ${often.s.joinK} changes per bank, not ${base.s.joinK} (no stars on a thaw)`);
    const line = wi(0, 'line'); t.ok(line.s.cells.length === line.s.joinK && line.s.forced, `What if? straight-line clashes: ${line.s.joinK} changes give only ${line.s.cells.length} pairs, and the season runs out first`);
    const fit = wi(1, 'fit'); t.ok(fit.s.fused === 1 && fit.s.final == null, 'What if? fit hybrids (55%): contact merges the two species at once');
    const ap = wi(1, 'apart'); t.ok(ap.s.downs === 0 && Math.abs(S.wiVars(ap.s).x - 43) <= 1, `What if? never meet: ${S.wiVars(ap.s).x}% of clutches wasted at the end`);
    let ef = 0; for (let sd = 1; sd <= N(12); sd++) if (wi(2, 'early', sd).s.fused >= 1) ef++;
    t.ok(ef >= N(12) * 0.4, `What if? join early (3 changes per bank): merged at least once on ${ef} of ${N(12)} seeds`);
    const lt = wi(2, 'late'); t.ok(S.expWaste(lt.s) > 13, `What if? join late (11 changes per bank): ${S.expWaste(lt.s).toFixed(1)}% wasted at the end (> 13%)`);
    t.ok(ch.wiKey(line.s) === 'lineFail' || ch.wiKey(line.s) === 'lineOk', 'the straight-line text follows the rerun\'s outcome');
  }

  /* ---------- result codes and shape ---------- */
  { const r = run(2, 4, 'expert'); const bits = ch.resultBits(r.s, 2); t.ok(bits >= 0 && bits < (1 << 30) && (bits & 7) === r.result.mask && ((bits >> 3) & 31) === r.s.joinK, 'resultBits packs the mask, the join and the wasted clutches into 30 bits'); }
  t.eq(ch.levels.length, 3, 'three levels (D6 decision 9)');
  t.eq(ch.content.levelStars.length, 3, 'a star line for each level');
};
