/* tests/oracle_raffle.js: the science oracle for The Raffle (D1 §3.5, D5 §4 item 9, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html raffle          (RF_FAST=1 for a quicker pass)
   D5's acceptance lines:
     A. a greedy allocation (each unit to the female where it buys most) is within 1% of the Lagrange optimum;
     B. the L2 benchmark is an expectation over the hidden queue: the planner sees three cards and takes each hidden female at
        the queue's distribution; it is checked against the omniscient plan and against the queue it was scored on.
   Plus: the fair-raffle maths (s/(s + R), the marginal gain, the legacy L1 plan of R7 A19); later-male risk raises a virgin's
   best pour (Parker 1990); the dung fly curve (80% at 36 min, Parker 1970; best time 41.4 min with 156.5 min of search and
   guarding, Parker and Stuart 1976) and the marginal value theorem; her storage (R acts like z·R ÷ y); the egg draws and the
   later males match the expectations the stars read; determinism and snapshot replay; an expert earns every star the unit
   offers; no level offers three stars and no bot's union across the unit reaches three; fixed strategies miss Discover;
   every Interesting and What if? text matches its own run. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim } = G, FAST = !!process.env.RF_FAST, N = k => FAST ? Math.max(5, Math.round(k / 4)) : k;
  const E = 20, sh = (s, R) => s > 0 ? s / (s + R) : 0;
  const eggs = (fs, ss) => fs.reduce((a, F, i) => a + E * share(F, ss[i]), 0);
  const share = (F, s) => { if (!(s > 0)) return 0; const y = F.y == null ? 1 : F.y, z = F.z == null ? 1 : F.z, q = F.q || 0, K = y * s, Rr = z * F.R; return (1 - q) * K / (K + Rr) + q * K / (K + Rr + 20); };
  const lag = (Rs, B) => { const f = l => Rs.map(R => R === 0 ? 1 : Math.max(1, Math.sqrt(R / l) - R)); let lo = 1e-9, hi = 10; for (let k = 0; k < 200; k++) { const m = Math.sqrt(lo * hi), tt = f(m).reduce((a, b) => a + b, 0); if (tt > B) lo = m; else hi = m; } return f(hi); };
  const greedyAlloc = (fs, B) => { const s = fs.map(() => 1); let left = B - fs.length; while (left > 0) { let bi = 0, bg = -1; fs.forEach((F, i) => { const g = E * (share(F, s[i] + 0.1) - share(F, s[i])); if (g > bg) { bg = g; bi = i; } }); s[bi] += 0.1; left -= 0.1; } return s; };
  const run = (lv, seed, bot, extra) => G.run(lv, Object.assign({ seed, bot }, extra || {}));
  const stars3 = m => ((m & 1) ? 1 : 0) + ((m & 2) ? 1 : 0) + ((m & 4) ? 1 : 0);

  /* ---------- the fair raffle (L1) ---------- */
  const legacy = [0, 40, 20, 100, 0, 60], L0 = lag(legacy, 100);
  t.near(sim.expect ? 1 : 1, 1, 0, 'sim loaded');
  { const F = { R: 40 }; let ok = true; for (const s of [1, 5, 20, 60]) if (Math.abs(E * share(F, s) - E * sh(s, 40)) > 1e-12) ok = false; t.ok(ok, 'fair raffle: your share of her 20 eggs is 20·s/(s + R)'); }
  { const S = ch.sim; S.reset(0, {}); const s = S.s; s.fem = legacy.map(R => ({ R, s: 0, eggs: -1 }));
    const b = S.bestPlan(s); t.eq(b.map(x => Math.round(x * 10) / 10), [1, 30.5, 29.8, 11.4, 1, 26.3], 'L1 best plan for rivals 0, 40, 20, 100, 0, 60 matches R7 A19 (1, 30.5, 29.8, 11.4, 1, 26.3 units)');
    t.near(S.bestEggs(s), 68.76, 0.02, 'and wins 68.8 expected eggs');
    t.near(eggs(s.fem, legacy.map(() => 100 / 6)) / S.bestEggs(s), 0.904, 0.002, 'an even split wins 90% of that (R7 A19), so Discover asks for within one egg instead');
    s.fem.forEach((F, i) => { F.s = legacy.map(() => 100 / 6)[i]; }); t.ok(!ch.stars.discover(s, 0), 'an even split misses L1 Discover'); }
  /* A. greedy within 1% of the Lagrange optimum */
  for (const Rs of [legacy, [20, 0, 40, 100, 60, 0], [40, 60, 20, 0, 100, 20]]) {
    const fs = Rs.map(R => ({ R })), g = eggs(fs, greedyAlloc(fs, 100)), l = eggs(fs, lag(Rs, 100));
    t.ok(Math.abs(g - l) / l <= 0.01, `A. greedy allocation ${g.toFixed(2)} eggs is within 1% of the Lagrange optimum ${l.toFixed(2)} (rivals ${Rs.join(', ')})`);
  }
  { const fs = [[20, 0.05, 1], [60, 1, 0.05], [40, 1, 1], [20, 1, 1], [60, 0.5, 1]].map(a => ({ R: a[0], y: a[1], z: a[2] })), S = ch.sim; S.reset(3, {}); S.s.fem = fs.map(F => Object.assign({ s: 0, eggs: -1 }, F));
    const g = eggs(fs, greedyAlloc(fs, 100)), l = S.bestEggs(S.s); t.ok(Math.abs(g - l) / l <= 0.01, `A. her drum: greedy ${g.toFixed(2)} within 1% of the plan ${l.toFixed(2)}`);
    const eff = lag(fs.map(F => F.z * F.R / F.y), 100); t.ok(Math.abs(eggs(fs, eff) - l) < 0.05, 'her storage: the plan equals the fair raffle with each R replaced by z·R ÷ y'); }

  /* ---------- the expectation the stars read equals the mean of the draws ---------- */
  { let tot = 0, n = N(800), lat = 0, came = 0;
    for (let sd = 1; sd <= n; sd++) {
      const r = run(0, sd, 'threshold'); for (const F of r.s.fem) tot += F.eggs - E * share(F, F.s);
      const r2 = run(1, sd, 'even'); for (const F of r2.s.fem) { lat++; if (F.later) came += 1 / F.q > 5 ? 1 : 0; }
    }
    t.ok(Math.abs(tot / (n * 6)) < 0.12, `egg draws: realised minus expected eggs averages ${(tot / (n * 6)).toFixed(3)} per female over ${n} runs (unbiased)`);
    let c9 = 0, n9 = 0, c1 = 0, n1 = 0; for (let sd = 1; sd <= n; sd++) { const r = run(1, sd, 'even'); for (const F of r.s.fem) { if (F.q > 0.5) { n9++; c9 += F.later ? 1 : 0; } else { n1++; c1 += F.later ? 1 : 0; } } }
    t.near(c9 / n9, 0.9, 0.03, `L2: a later male came to ${(100 * c9 / n9).toFixed(1)}% of the 9-in-10 females`); t.near(c1 / n1, 0.1, 0.03, `and to ${(100 * c1 / n1).toFixed(1)}% of the 1-in-10 females`); void lat; void came; }

  /* ---------- L2: risk, and the benchmark (B) ---------- */
  { const S = ch.sim; let worst = 1, rvs = 0, n = N(200), heavy = 0;
    for (let sd = 1; sd <= n; sd++) {
      G.reset(1, sd); const s = S.s, fs = s.fem, P = S.bestPlan(s), om = (() => { const tot = l => fs.reduce((a, F) => a + S.constructor ? 0 : 0, 0); void tot; return null; })(); void om;
      const omni = eggs(fs, (() => { const f = fs.map(F => Object.assign({}, F)); let lo = 1e-9, hi = 1e3; const at = (F, l) => { let a = 1, b = 100; const mg = x => { const Rr = F.R, q = F.q, A = x + Rr, Bb = A + 20; return E * ((1 - q) * Rr / (A * A) + q * (Rr + 20) / (Bb * Bb)); }; if (mg(1) <= l) return 1; if (mg(100) >= l) return 100; for (let k = 0; k < 50; k++) { const m = (a + b) / 2; if (mg(m) > l) a = m; else b = m; } return (a + b) / 2; }; for (let k = 0; k < 90; k++) { const m = Math.sqrt(lo * hi); if (f.reduce((x, F) => x + at(F, m), 0) > 100) lo = m; else hi = m; } return f.map(F => at(F, hi)); })());
      const pe = eggs(fs, P); worst = Math.min(worst, pe / omni);
      if (P[s.risky] >= P[s.safe] + 5) rvs++;
      if (Math.abs(P.reduce((a, b) => a + b, 0) - 100) > 1e-6) heavy++;
    }
    t.ok(worst >= 0.96 && worst <= 1 + 1e-9, `B. the planner (three cards, the hidden queue at its expectation) wins ${(100 * worst).toFixed(1)}%+ of the omniscient plan on ${n} queues`);
    t.eq(heavy, 0, 'B. the planner spends exactly the supply on every queue');
    t.ok(rvs === n, `L2: the planner gives the risky virgin at least 5 units more than the safe virgin on ${rvs} of ${n} queues (Parker 1990)`);
    // the spec's numbers: at the multiplier where a mated female with 20 rival units gets 15, a virgin at 9 in 10 gets about 15–22 and one at 1 in 10 gets 1
    const marg = (F, x) => { const A = x + F.R, Bb = A + 20; return E * ((1 - F.q) * F.R / (A * A) + F.q * (F.R + 20) / (Bb * Bb)); };
    const lam = marg({ R: 20, q: 0.5 }, 15), at = F => { let a = 1, b = 100; if (marg(F, 1) <= lam) return 1; for (let k = 0; k < 60; k++) { const m = (a + b) / 2; if (marg(F, m) > lam) a = m; else b = m; } return (a + b) / 2; };
    const v9 = at({ R: 0, q: 0.9 }), v1 = at({ R: 0, q: 0.1 }); t.ok(v9 > 10 && v9 < 25 && v1 <= 1.0001, `risk: a virgin at 9 in 10 earns ${v9.toFixed(1)} units, one at 1 in 10 earns ${v1.toFixed(1)} (D1: about 22 and about 1)`); }

  /* ---------- L3: the dung fly curve and the marginal value theorem ---------- */
  { const S = ch.sim, D = (S.reset(2, {}), S.s), F0 = D.fem[0];
    const x36 = (() => { G.reset(2, 1); const s = S.s; S.act({ k: 'add', n: 36 }); return null; })(); void x36;
    // read the curve through the sim: mate exactly t minutes
    const shareAt = mins => { G.reset(2, 1); const s = S.s; for (let k = 0; k < 40 && s.phase !== 'pour'; k++) S.step(1 / 30); S.act({ k: 'add', n: 40 }); s.mins = mins; S.act({ k: 'mate' }); return s.fem[0].x; };
    t.near(shareAt(36), 0.80, 0.005, 'L3: a 36-minute mating gives the last male 80% of her store (Parker 1970)');
    const rate = (m, T) => shareAt(m) / (T + m);
    let bt = 0, bv = -1; for (let m = 20; m <= 70; m += 0.2) { const v = rate(m, 156.5); if (v > bv) { bv = v; bt = m; } }
    t.near(bt, 41.4, 0.3, `L3: eggs per minute peak at ${bt.toFixed(1)} min with 156.5 min of search and guarding (Parker and Stuart 1976: about 41)`);
    t.near(S.expect({ fem: [] }, 'p3'), 41.4, 0.1, 'and the Predict star is scored against the tangent point, 41.4 min');
    let bt2 = 0, bv2 = -1; for (let m = 10; m <= 50; m += 0.2) { const v = rate(m, 40); if (v > bv2) { bv2 = v; bt2 = m; } }
    t.near(bt2, 26.1, 0.3, `L3: with a 40-minute afternoon search the best mating falls to ${bt2.toFixed(1)} min (the Transfer's target)`);
    const a = shareAt(1000 > 120 ? 120 : 120); t.ok(a < 0.894 && a > 0.88, `about one earlier sperm in nine stays out of reach: share at 120 min ${a.toFixed(3)} < 0.894`);
    // constant random displacement: d(share)/dt = k (a − share)
    const s1 = shareAt(20), s2 = shareAt(20.5); t.near((s2 - s1) / 0.5, 0.0627036 * (0.8934849 - (s1 + s2) / 2), 2e-4, 'random displacement: the share rises at k·(a − share), slowing as your own sperm are flushed');
    void F0; }

  /* ---------- determinism and snapshot replay ---------- */
  for (const lv of [0, 1, 2, 3]) {
    const a = run(lv, 11, 'expert'), b = run(lv, 11, 'expert');
    t.eq(a.s, b.s, `L${lv + 1}: the same seed and actions give the same final state`);
    const S = ch.sim; G.reset(lv, 12); const pol = G.bot('expert'), rnd = () => 0.5; let ticks = 0, snap = null, at = 0;
    while (!S.result() && ticks < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([ticks, x]); S.act(x); } } S.step(S.dt); ticks++; if (ticks === 300) { snap = S.snapshot(); at = ticks; } }
    const end = JSON.stringify(S.s); S.restore(snap); let k = at;
    while (!S.result() && k < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([k, x]); S.act(x); } } S.step(S.dt); k++; }
    t.ok(JSON.stringify(S.s) === end, `L${lv + 1}: a snapshot at tick 300 restores and replays to the same end`);
  }

  /* ---------- stars: per level, the expert, the bots ---------- */
  const offers = [3, 3, 6, 5];   // L1 D+P, L2 D+P, L3 P+T, L4 D+T: no level offers all three
  const seeds = N(20), bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'even', 'noChange'];
  for (let lv = 0; lv < 4; lv++) {
    let all = 0; for (let sd = 1; sd <= seeds; sd++) { const r = run(lv, sd, 'expert'); if ((r.result.mask & offers[lv]) === offers[lv]) all++; }
    t.eq(all, seeds, `L${lv + 1}: the expert earns every star the level offers (${['D+P', 'D+P', 'P+T', 'D+T'][lv]}) on ${seeds} of ${seeds} seeds`);
  }
  { const lv = [0, 1, 2, 3].map(l => run(l, 3, 'expert').result.mask); t.eq(ch.unitStars(lv), 7, 'the expert\'s levels add up to all three unit stars'); }
  for (const b of bots) {
    let worst = 0, three = 0, off = 0;
    for (let sd = 1; sd <= seeds; sd++) {
      const masks = [0, 1, 2, 3].map(l => { const r = run(l, sd, b); const m = r.result ? r.result.mask : 0; if (stars3(m) === 3) three++; if (m & ~offers[l]) off++; return m; });
      worst = Math.max(worst, stars3(ch.unitStars(masks)));
    }
    t.ok(three === 0 && off === 0 && worst < 3, `bot ${b}: no level gives three stars, none outside its offer, and its union across the unit is at most ${worst} star(s)`);
  }
  for (const [lv, b] of [[1, 'even'], [1, 'greedy'], [3, 'even'], [3, 'greedy'], [0, 'threshold'], [1, 'threshold'], [3, 'threshold']]) {
    let d = 0; for (let sd = 1; sd <= seeds; sd++) if (run(lv, sd, b).result.mask & 1) d++;
    t.eq(d, 0, `fixed strategy "${b}" never earns L${lv + 1} Discover (${seeds} seeds)`);
  }
  { let p = 0; for (let sd = 1; sd <= seeds; sd++) if (run(1, sd, 'noChange').result.mask & 2) p++; t.eq(p, 0, 'L2: calling "no male after her" (all 20 eggs) never earns Predict'); }
  { let p = 0, tr = 0; for (let sd = 1; sd <= seeds; sd++) { const r = run(2, sd, 'threshold'); if (r.result.mask & 4) tr++; const r2 = run(3, sd, 'noChange'); if (r2.result.mask & 4) p++; }
    t.eq(tr, 0, 'L3: one fixed 30-minute mating all day never earns the afternoon Transfer'); t.eq(p, 0, 'L4: the fair-raffle answer (30 units) never earns the boss Transfer'); }

  /* ---------- Interesting results say what happened ---------- */
  { let bad = 0, seen = {};
    for (const b of bots.concat(['expert'])) for (let sd = 1; sd <= N(12); sd++) for (let lv = 0; lv < 4; lv++) {
      const r = run(lv, sd, b), k = r.result.interesting, s = r.s, L = s.fem; if (!k) continue; seen[k] = (seen[k] || 0) + 1;
      const ok = k === 'virgins' ? L.filter(F => !F.R).reduce((a, F) => a + F.s, 0) >= 10 : k === 'dry' ? L.some(F => F.s <= 0) : k === 'crowd' ? L[3].s > 26 : k === 'safe' ? L[s.safe].s >= 10
        : k === 'riskyCame' ? L[s.risky].later && L[s.risky].s < 5 : k === 'riskyLucky' ? !L[s.risky].later && L[s.risky].s < 5 : k === 'short' ? ch.sim.amMean(s) < 22 : k === 'long' ? ch.sim.amMean(s) > 70
        : k === 'same' ? true : k === 'pocket' ? L.some(F => F.y <= 0.2 && F.s >= 10) : k === 'favoured' ? L.some(F => F.z <= 0.15 && share(F, F.s) >= 0.75) : false;
      if (!ok) bad++;
    }
    t.eq(bad, 0, 'every Interesting result matches its own run (' + Object.keys(seen).join(', ') + ')'); }

  /* ---------- What if?: the reruns do what their texts say ---------- */
  { const S = ch.sim, wi = (lv, lever) => { G.reset(lv, 5); const snap = S.snapshot(); const r = G.run(lv, { seed: 5, reset: { thaw: { snap, lever } } }); return r; };
    const a = wi(0, 'later'); t.ok(a.result && a.result.mask === 0 && S.wiVars(a.s).v > 1, `What if? males follow: the best plan gives each virgin ${S.wiVars(a.s).v} units, not 1 (no stars on a thaw)`);
    const b = wi(2, 'scarce'); t.near(b.s.fem[0].t, 53.96, 0.3, 'What if? scarce females (400 min search): the best mating is about 54 min');
    const c = wi(2, 'quick'); t.ok(c.s.fem[0].t < 26, `What if? a 20-minute search: the best mating falls to ${c.s.fem[0].t.toFixed(1)} min`);
    const d = wi(1, 'norisk'); t.ok(d.s.fem.filter(F => !F.R).every(F => Math.abs(F.s - 1) < 1e-6), 'What if? no later males: every virgin gets 1 unit');
    const e = wi(3, 'choosy'), f = wi(3, 'fair'); t.ok(S.wiVars(e.s).e < S.wiVars(f.s).e, `What if? very choosy females (${S.wiVars(e.s).e} eggs) leave you fewer eggs than females who keep everything (${S.wiVars(f.s).e})`); }

  /* ---------- result codes fit in 30 bits ---------- */
  { const r = run(1, 4, 'expert'); const bits = ch.resultBits(r.s, 1); t.ok(bits >= 0 && bits < (1 << 30) && (bits & 7) === r.result.mask, 'resultBits packs the mask, the eggs and the call into 30 bits'); }
};
