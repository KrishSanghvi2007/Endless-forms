/* tests/oracle_raffle.js: the science oracle for The Raffle (D1 §3.5, D5 §4 item 9, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html raffle          (RF_FAST=1 for a quicker pass)
   D5's acceptance lines:
     A. a greedy allocation (each unit to the female where it buys most) is within 1% of the Lagrange optimum;
   (D6 decision 9, 22 Oct 2026: the old L2 "Who comes next?" and its hidden-queue benchmark are cut; three levels remain.)
   Plus: the fair-raffle maths (s/(s + R), the marginal gain, the legacy L1 plan of R7 A19); the dung fly curve (80% at 36 min, Parker 1970; best time 41.4 min with 156.5 min of search and
   guarding, Parker and Stuart 1976) and the marginal value theorem; her storage (R acts like z·R ÷ y); the egg draws match
   the expectations the stars read; determinism and snapshot replay; an expert earns every star the unit
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
  { const fs = [[20, 0.05, 1], [60, 1, 0.05], [40, 1, 1], [20, 1, 1], [60, 0.5, 1]].map(a => ({ R: a[0], y: a[1], z: a[2] })), S = ch.sim; S.reset(2, {}); S.s.fem = fs.map(F => Object.assign({ s: 0, eggs: -1 }, F));
    const g = eggs(fs, greedyAlloc(fs, 100)), l = S.bestEggs(S.s); t.ok(Math.abs(g - l) / l <= 0.01, `A. her drum: greedy ${g.toFixed(2)} within 1% of the plan ${l.toFixed(2)}`);
    const eff = lag(fs.map(F => F.z * F.R / F.y), 100); t.ok(Math.abs(eggs(fs, eff) - l) < 0.05, 'her storage: the plan equals the fair raffle with each R replaced by z·R ÷ y'); }

  /* ---------- the expectation the stars read equals the mean of the draws ---------- */
  { let tot = 0, n = N(800);
    for (let sd = 1; sd <= n; sd++) {
      const r = run(0, sd, 'threshold'); for (const F of r.s.fem) tot += F.eggs - E * share(F, F.s);
    }
    t.ok(Math.abs(tot / (n * 6)) < 0.12, `egg draws: realised minus expected eggs averages ${(tot / (n * 6)).toFixed(3)} per female over ${n} runs (unbiased)`);
    let tb = 0; for (let sd = 1; sd <= N(200); sd++) { const r = run(2, sd, 'threshold'); for (const F of r.s.fem) { const y = F.y, z = F.z, K = y * F.s, Rr = z * F.R; tb += F.eggs - E * (K > 0 ? K / (K + Rr) : 0); } }
    t.ok(Math.abs(tb / (N(200) * 5)) < 0.15, `her stores: realised minus expected eggs averages ${(tb / (N(200) * 5)).toFixed(3)} per female (draws use only the sperm she stored)`); }

  /* ---------- L2: the dung fly curve and the marginal value theorem ---------- */
  { const S = ch.sim;
    // read the curve through the sim: mate exactly t minutes
    const shareAt = mins => { G.reset(1, 1); const s = S.s; for (let k = 0; k < 40 && s.phase !== 'pour'; k++) S.step(1 / 30); S.act({ k: 'add', n: 40 }); s.mins = mins; S.act({ k: 'mate' }); return s.fem[0].x; };
    t.near(shareAt(36), 0.80, 0.005, 'L2: a 36-minute mating gives the last male 80% of her store (Parker 1970)');
    const rate = (m, T) => shareAt(m) / (T + m);
    let bt = 0, bv = -1; for (let m = 20; m <= 70; m += 0.2) { const v = rate(m, 156.5); if (v > bv) { bv = v; bt = m; } }
    t.near(bt, 41.4, 0.3, `L2: eggs per minute peak at ${bt.toFixed(1)} min with 156.5 min of search and guarding (Parker and Stuart 1976: about 41)`);
    const am = ts => ({ level: 1, fem: ts.map(x => ({ t: x, x: 0, T: 156.5 })).concat([{}, {}, {}]) });
    t.ok(ch.stars.discover(am([36, 41, 47]), 1) && ch.stars.discover(am([47, 47, 47]), 1) && !ch.stars.discover(am([30, 30, 30]), 1) && !ch.stars.discover(am([50, 50, 50]), 1), 'and L2 Discover is scored against the tangent point, 41.4 min (a morning average within 6 min)');
    let bt2 = 0, bv2 = -1; for (let m = 10; m <= 50; m += 0.2) { const v = rate(m, 40); if (v > bv2) { bv2 = v; bt2 = m; } }
    t.near(bt2, 26.1, 0.3, `L2: with a 40-minute afternoon search the best mating falls to ${bt2.toFixed(1)} min (the Transfer's target)`);
    const a = shareAt(120); t.ok(a < 0.894 && a > 0.88, `about one earlier sperm in nine stays out of reach: share at 120 min ${a.toFixed(3)} < 0.894`);
    // constant random displacement: d(share)/dt = k (a − share)
    const s1 = shareAt(20), s2 = shareAt(20.5); t.near((s2 - s1) / 0.5, 0.0627036 * (0.8934849 - (s1 + s2) / 2), 2e-4, 'random displacement: the share rises at k·(a − share), slowing as your own sperm are flushed');
  }

  /* ---------- determinism and snapshot replay ---------- */
  for (const lv of [0, 1, 2]) {
    const a = run(lv, 11, 'expert'), b = run(lv, 11, 'expert');
    t.eq(a.s, b.s, `L${lv + 1}: the same seed and actions give the same final state`);
    const S = ch.sim; G.reset(lv, 12); const pol = G.bot('expert'), rnd = () => 0.5; let ticks = 0, snap = null, at = 0;
    while (!S.result() && ticks < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([ticks, x]); S.act(x); } } S.step(S.dt); ticks++; if (ticks === 300) { snap = S.snapshot(); at = ticks; } }
    const end = JSON.stringify(S.s); S.restore(snap); let k = at;
    while (!S.result() && k < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([k, x]); S.act(x); } } S.step(S.dt); k++; }
    t.ok(JSON.stringify(S.s) === end, `L${lv + 1}: a snapshot at tick 300 restores and replays to the same end`);
  }

  /* ---------- stars: per level, the expert, the bots ---------- */
  const offers = [3, 5, 1];   // L1 D+P, L2 D+T, L3 D: no level offers all three
  const seeds = N(20), bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'even', 'noChange'];
  for (let lv = 0; lv < 3; lv++) {
    let all = 0; for (let sd = 1; sd <= seeds; sd++) { const r = run(lv, sd, 'expert'); if ((r.result.mask & offers[lv]) === offers[lv]) all++; }
    t.eq(all, seeds, `L${lv + 1}: the expert earns every star the level offers (${['D+P', 'D+T', 'D'][lv]}) on ${seeds} of ${seeds} seeds`);
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
  for (const [lv, b] of [[2, 'even'], [2, 'greedy'], [0, 'threshold'], [1, 'threshold'], [1, 'greedy'], [2, 'threshold']]) {
    let d = 0; for (let sd = 1; sd <= seeds; sd++) if (run(lv, sd, b).result.mask & 1) d++;
    t.eq(d, 0, `fixed strategy "${b}" never earns L${lv + 1} Discover (${seeds} seeds)`);
  }
  { let p = 0; for (let sd = 1; sd <= seeds; sd++) if (run(0, sd, 'noChange').result.mask & 2) p++; t.eq(p, 0, 'L1: calling "half her eggs" every time never earns Predict'); }
  { let tr = 0, ev = 0; for (let sd = 1; sd <= seeds; sd++) { if (run(1, sd, 'threshold').result.mask & 4) tr++; if (run(1, sd, 'even').result.mask & 4) ev++; }
    t.eq(tr, 0, 'L2: one fixed 30-minute mating all day never earns the afternoon Transfer'); t.eq(ev, 0, 'L2: 41-minute matings all day (the morning answer) never earn it either'); }

  /* ---------- Interesting results say what happened ---------- */
  { let bad = 0, seen = {};
    for (const b of bots.concat(['expert'])) for (let sd = 1; sd <= N(12); sd++) for (let lv = 0; lv < 3; lv++) {
      const r = run(lv, sd, b), k = r.result.interesting, s = r.s, L = s.fem; if (!k) continue; seen[k] = (seen[k] || 0) + 1;
      const ok = k === 'virgins' ? L.filter(F => !F.R).reduce((a, F) => a + F.s, 0) >= 10 : k === 'dry' ? L.some(F => F.s <= 0) : k === 'crowd' ? L[3].s > 26 : k === 'short' ? ch.sim.amMean(s) < 22 : k === 'long' ? ch.sim.amMean(s) > 70
        : k === 'same' ? true : k === 'pocket' ? L.some(F => F.y <= 0.2 && F.s >= 10) : k === 'favoured' ? L.some(F => F.z <= 0.15 && share(F, F.s) >= 0.75) : false;
      if (!ok) bad++;
    }
    t.eq(bad, 0, 'every Interesting result matches its own run (' + Object.keys(seen).join(', ') + ')'); }

  /* ---------- What if?: the reruns do what their texts say ---------- */
  { const S = ch.sim, wi = (lv, lever) => { G.reset(lv, 5); const snap = S.snapshot(); const r = G.run(lv, { seed: 5, reset: { thaw: { snap, lever } } }); return r; };
    const a = wi(0, 'later'); t.ok(a.result && a.result.mask === 0 && S.wiVars(a.s).v > 1, `What if? males follow: the best plan gives each virgin ${S.wiVars(a.s).v} units, not 1 (no stars on a thaw)`);
    const b = wi(1, 'scarce'); t.near(b.s.fem[0].t, 53.96, 0.3, 'What if? scarce females (400 min search): the best mating is about 54 min');
    const c = wi(1, 'quick'); t.ok(c.s.fem[0].t < 26, `What if? a 20-minute search: the best mating falls to ${c.s.fem[0].t.toFixed(1)} min`);
    { G.reset(0, 5); const r0 = run(0, 5, 'expert'); t.ok(r0.s.fem.filter(F => !F.R).every(F => Math.abs(F.s - 1) < 1e-6), 'L1 best play: with no rival sperm stored, every virgin gets 1 unit'); }
    const e = wi(2, 'choosy'), f = wi(2, 'fair'); t.ok(S.wiVars(e.s).e < S.wiVars(f.s).e, `What if? very choosy females (${S.wiVars(e.s).e} eggs) leave you fewer eggs than females who keep everything (${S.wiVars(f.s).e})`); }

  /* ---------- result codes fit in 30 bits ---------- */
  { const r = run(0, 4, 'expert'); const bits = ch.resultBits(r.s, 0); t.ok(bits >= 0 && bits < (1 << 30) && (bits & 7) === r.result.mask && ((bits >> 13) & 127) > 0, 'resultBits packs the mask, the eggs and the call into 30 bits'); }
  { t.eq(ch.levels.length, 3, 'three levels (D6 decision 9)'); t.eq(Object.keys(ch.content.levelStars).length, 3, 'a star line for each level'); }
};
