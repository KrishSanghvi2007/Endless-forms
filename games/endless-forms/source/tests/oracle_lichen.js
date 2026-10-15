/* tests/oracle_lichen.js: the science oracle for The Lichen Wood (D1 §3.1 oracles 1, 2, 4; D5 §4 item 1 accept).
   Run: node tests/oracle.js BUILD.html lichen      (LW_FAST=1 for a quicker, smaller pass)
   1. L1–L2: mean R/S within ±0.05 of the generation's h² (from its additive variance), 500 seeds; ≤ 1% of moths at the bark.
   2. L3 at K = 120: with the switching bot at b = 2, all three looks ≥ 10% from generation 6 to 20 in ≥ 95% of seeds;
      at b = 1 the polymorphism is lost in most seeds; b = 0.5 loses both rare looks; a look 40% better hidden takes over.
   4. A scripted competent player finishes the unit inside the 15-minute box.
   Plus: overproduction (ten eggs a place, a cull to K), determinism and replay, What if? levers, the b fit, expectation
   scoring (the expectation bot hits; naive rules miss in L2), the ≤ 96-byte resident snapshot, and the word budgets. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim, runSim = null } = G, FAST = !!process.env.LW_FAST, N = k => FAST ? Math.max(20, Math.round(k / 5)) : k;
  const { mulberry } = require('./vmgame');
  const live = s => sim.live(s);
  // a soft-visibility bot (the player D1 checked with): pecks with probability ∝ (conspicuousness + 0.05)³; boss: catch share ∝ a^b
  const softBot = (b, predict) => (s, acts, rnd) => {
    const P = acts.filter(a => a.k === 'peck');
    if (P.length) {
      if (s.level === 3) {
        const c = sim.counts(s, P.map(a => s.moths[a.i])), tot = P.length, w = c.map(v => v ? Math.pow(v / tot, b) : 0);
        let u = rnd() * (w[0] + w[1] + w[2]), k = 0; for (; k < 2; k++) { u -= w[k]; if (u < 0 && w[k] > 0) break; } if (!w[k]) k = w.findIndex(v => v > 0);
        const pool = P.filter(a => s.moths[a.i].m === k); return pool[Math.floor(rnd() * pool.length)];
      }
      const w = P.map(a => Math.pow(sim.consp(s, s.moths[a.i]) + 0.05, 3)); let u = rnd() * w.reduce((x, y) => x + y, 0);
      for (let i = 0; i < P.length; i++) { u -= w[i]; if (u <= 0) return P[i]; } return P[P.length - 1];
    }
    if (s.ask) return predict ? predict(s, acts) : acts.filter(a => a.k === 'predict')[0];
    return null;
  };
  const near = (acts, v) => acts.filter(a => a.k === 'predict').reduce((b, a) => Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b);
  const expectBot = (s, acts) => { const e = s.exp[s.ask.id]; return s.ask.kind === 'tri' ? { k: 'predict', id: s.ask.id, v: e } : { k: 'predict', id: s.ask.id, v: e }; };
  const run = (lv, o) => G.run(lv, Object.assign({ every: 3 }, o));

  /* ---------- 1. the breeder's equation in L1 and L2 ---------- */
  for (const lv of [1, 2]) {
    let SR = 0, SS = 0, H2S = 0, over = 0, tot = 0, n = 0, h2m = 0;
    for (let sd = 1; sd <= N(500); sd++) {
      const r = run(lv, { seed: sd, policy: softBot(0, expectBot), rnd: mulberry(sd * 31 + lv) });
      for (const rec of r.s.hist) { if (rec.R == null) continue; SR += rec.R; SS += rec.S; H2S += rec.h2 * rec.S; h2m += rec.h2; n++; for (const v of rec.yv) { tot++; if (v >= 1) over++; } }
    }
    const rs = SR / SS, h2 = H2S / SS;
    t.note(`L${lv}: realised R/S ${rs.toFixed(3)}, S-weighted h² ${h2.toFixed(3)}, mean h² ${(h2m / n).toFixed(3)}, mean S ${(SS / n).toFixed(3)}, ${N(500)} seeds`);
    t.near(rs, h2, 0.05, `L${lv}: mean R/S within ±0.05 of the generation's h² (D1 oracle 1)`);
    t.near(h2m / n, lv === 1 ? 0.75 : 0.28, 0.06, `L${lv}: heritability as designed (${lv === 1 ? '0.8 falling as variance is used' : 'about 0.3'})`);
    t.ok(over / tot <= 0.01, `L${lv}: ≤ 1% of young at the bark's shade (${(100 * over / tot).toFixed(2)}%)`);
  }

  /* ---------- 2. the boss: apostatic selection holds three looks (D1 oracle 2) ---------- */
  const keepAll = trail => { for (let g = 5; g < Math.min(trail.length, 20); g++) if (Math.min(trail[g][0], trail[g][1], trail[g][2]) < 0.1) return false; return trail.length >= 20; };   // no dip below 10% (a strict test)
  const lostAny = trail => { const f = trail[trail.length - 1]; return Math.min(f[0], f[1], f[2]) <= 0; };   // a look truly gone (share 0) at the end
  {
    let ok2 = 0, n2 = 0, lost1 = 0, n1 = 0, gone2 = 0, gone1 = 0;
    for (let sd = 1; sd <= N(100); sd++) {
      const r = run(3, { seed: 500 + sd, policy: softBot(2), P: { gens: 20 }, rnd: mulberry(sd * 7 + 3) });
      n2++; if (keepAll(r.s.trail)) ok2++; if (lostAny(r.s.trail)) gone2++;
    }
    for (let sd = 1; sd <= N(100); sd++) {
      const r = run(3, { seed: 900 + sd, policy: softBot(1), P: { gens: 20 }, rnd: mulberry(sd * 11 + 5) });
      n1++; if (!keepAll(r.s.trail)) lost1++; if (lostAny(r.s.trail)) gone1++;
    }
    t.note(`L3 game sim, switching bot b = 2: all three looks ≥ 10% in gens 6–20 in ${ok2}/${n2} (a look gone, share 0, by gen 20: ${gone2}); b = 1: a dip below 10% in ${lost1}/${n1}, a look gone in ${gone1}/${n1}`);
    t.ok(ok2 / n2 >= 0.95, 'L3 (full game sim): b = 2 keeps all three looks ≥ 10% from generation 6 to 20 in ≥ 95% of seeds');
    t.ok(lost1 / n1 > 0.5, 'L3 (full game sim): with no search image (b = 1) the polymorphism is lost in most seeds');
  }
  {   // the replay model (the expectation and the What if? runs use it): 400 seeds, from the designed start
    G.reset(3, 77); const start = sim.s.moths.slice(), lay = sim.lay(3);
    const traj = (b, d, gens, sd) => {   // generation-by-generation shares with the replay engine's rules
      const rnd = G.TB.R ? require('./vmgame').mulberry(sd) : Math.random, trail = [];
      let pop = start.map(m => ({ q: [m.g[lay.T.A.off] > 0.5 ? 1 : 0, m.g[lay.L + lay.T.A.off] > 0.5 ? 1 : 0, m.g[lay.T.B.off] > 0.5 ? 1 : 0, m.g[lay.L + lay.T.B.off] > 0.5 ? 1 : 0], m: m.m }));
      const morph = q => q[0] || q[1] ? 0 : q[2] || q[3] ? 1 : 2;
      for (let g = 0; g < gens; g++) {
        trail.push(sim.shares(pop));
        for (let i = pop.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, x = pop[i]; pop[i] = pop[j]; pop[j] = x; }
        const surv = []; for (let tr = 0; tr < 4; tr++) { const on = pop.filter((_, k) => k % 4 === tr); sim.take(on, 15, b, d, rnd); for (const m of on) surv.push(m); }
        const kids = []; for (let k = 0; k < 120; k++) { const a = surv[(rnd() * surv.length) | 0]; let c = a; for (let q = 0; q < 7 && c === a; q++) c = surv[(rnd() * surv.length) | 0]; const q = [a.q[rnd() < 0.5 ? 0 : 1], c.q[rnd() < 0.5 ? 0 : 1], a.q[rnd() < 0.5 ? 2 : 3], c.q[rnd() < 0.5 ? 2 : 3]]; kids.push({ q, m: morph(q) }); }
        pop = kids;
      }
      trail.push(sim.shares(pop)); return trail;
    };
    const D = LW_D_ORACLE(), S = N(400);
    let k2 = 0, l1 = 0, rare = 0, hid = 0, hid1 = 0, hm = 0, m6 = [0, 0, 0];
    for (let sd = 1; sd <= S; sd++) {
      const a = traj(2, D, 20, sd * 3 + 1); if (keepAll(a)) k2++; for (let k = 0; k < 3; k++) m6[k] += a[6][k] / S;
      if (!keepAll(traj(1, D, 20, sd * 3 + 2))) l1++;
      const r = traj(0.5, D, 20, sd * 5 + 7)[20]; if (r[0] < 0.02 && r[1] < 0.02) rare++;
      const h = traj(2, [1, 0.6, 1], 20, sd * 7 + 11)[20]; hm += h[1] / S; if (h[1] > h[0] && h[1] > h[2] && Math.min(h[0], h[2]) >= 0.1) hid++;
      if (traj(1, [1, 0.6, 1], 20, sd * 7 + 13)[20][1] >= 0.6) hid1++;
    }
    t.note(`L3 replay model, ${S} seeds: b = 2 keeps all three ${k2}; mean shares after 6 generations ${m6.map(v => v.toFixed(2)).join(', ')} (band, mottle, speck); b = 1 loses ${l1}; b = 0.5 loses both rare looks ${rare}; mottle 40% better hidden: at b = 2 commonest with the others ≥ 10% in ${hid} (mean share ${hm.toFixed(2)}; equilibrium aᵢ ∝ dᵢ^(−1/(b−1)) gives 0.46), at b = 1 ≥ 60% in ${hid1}`);
    t.ok(k2 / S >= 0.95, 'L3 (replay model): b = 2 keeps all three looks ≥ 10% from generation 6 to 20 in ≥ 95% of seeds');
    t.ok(l1 / S > 0.5, 'L3 (replay model): b = 1 loses the polymorphism in most seeds');
    t.ok(rare / S >= 0.95, 'L3 (replay model): eating the rare (b = 0.5) loses both rare looks in nearly every seed');
    t.ok(hid / S >= 0.6, 'L3 (replay model): at b = 2 a look 40% better hidden becomes the commonest, yet the others persist (What if? "One hides better")');
    t.near(hm, 0.46, 0.1, 'L3 (replay model): its share approaches the apostatic equilibrium, aᵢ ∝ dᵢ^(−1/(b−1)) (0.46 at b = 2)');
    t.ok(hid1 / S >= 0.6, 'L3 (replay model): with no search image (b = 1) the better-hidden look takes over (D1: 86% by generation 20)');
    t.ok(m6[0] > 0.2 && m6[1] > 0.2 && m6[2] > 0.25, 'L3: after six generations at b = 2 the rare looks have risen (D1: about 0.33, 0.27, 0.41)');
  }

  /* ---------- overproduction and the winter cull ---------- */
  {
    G.reset(0, 3); const s = sim.s;
    t.eq(live(s).length, 8, 'L0 morning 1: eight moths');
    t.eq([s.quota, s.time], [4, 20], 'L0 morning 1: quota 4, a slowed clock (12 s ÷ 0.6 = 20 s)');
    for (let k = 0; k < 4; k++) sim.act({ k: 'peck', i: live(s)[0] });
    t.eq(s.phase, 'dusk', 'four pecks feed the chicks and end the first morning');
    t.eq([s.brood.E, s.brood.K, s.next.length], [300, 30, 30], 'four survivors lay 300 eggs; a random winter cull leaves 30');
    t.eq(s.brood.cnt.reduce((a, b) => a + b, 0), 300, 'every egg has a mother among the survivors');
    t.ok(s.next.every(m => s.brood.moms.indexOf(m.mo) >= 0), 'every young moth has a surviving mother');
    G.reset(3, 3); const s3 = sim.s;
    t.eq([s3.moths.length, sim.counts(s3, s3.moths).join(',')], [120, '12,12,96'], 'L3 starts with 120 moths: 12 band, 12 mottle, 96 speck');
    t.eq([0, 1, 2, 3].map(tr => s3.moths.filter(m => m.tr === tr).length).join(','), '30,30,30,30', 'four trunks hold 30 moths each');
  }

  /* ---------- determinism and replay: a run is (seed, level, actions) ---------- */
  {
    const r1 = run(1, { seed: 42, policy: softBot(0, expectBot), rnd: mulberry(9) });
    const log = r1.s.log.slice(), snap = JSON.stringify(r1.s.camo) + JSON.stringify(r1.s.hist.map(h => [h.S, h.R]));
    G.TB.seed(42); ch.level = 1; sim.reset(1, {}); let i = 0, ticks = 0;
    while (!sim.result() && ticks < 20000) { while (i < log.length && log[i][0] <= ticks) sim.act(log[i++][1]); sim.step(sim.dt); ticks++; }
    t.eq(JSON.stringify(sim.s.camo) + JSON.stringify(sim.s.hist.map(h => [h.S, h.R])), snap, 'replaying the logged actions from the seed reproduces the run exactly');
    const a = run(3, { seed: 5, policy: softBot(2), rnd: mulberry(4) }), b = run(3, { seed: 5, policy: softBot(2), rnd: mulberry(4) });
    t.eq(a.s.trail, b.s.trail, 'L3: the same seed and actions give the same wood');
  }

  /* ---------- What if? levers (the freezer) ---------- */
  {
    const lever = (k, sd) => {   // play L1 to the last dawn, snapshot, thaw with one lever, finish the generation
      G.TB.seed(sd); ch.level = 1; sim.reset(1, {}); const rnd = mulberry(sd), pol = softBot(0, expectBot); let ticks = 0, snap = null;
      while (!sim.result() && ticks < 30000) { if (sim.s.gen === sim.s.gens && sim.s.phase === 'dawn' && !snap) { snap = sim.snapshot(); break; } const A = sim.actions(); if (A.length && ticks % 3 === 0) { const x = pol(sim.s, A, rnd); if (x) sim.act(x); } sim.step(sim.dt); ticks++; }
      sim.reset(1, { thaw: { snap, lever: k } }); ticks = 0;
      while (!sim.result() && ticks < 30000) { const A = sim.actions(); if (A.length && ticks % 3 === 0) { const x = pol(sim.s, A, rnd); if (x) sim.act(x); } sim.step(sim.dt); ticks++; }
      return sim.s;
    };
    const nv = lever('novar', 3), rv = nv.hist[nv.hist.length - 1];
    t.ok(Math.abs(rv.S) < 1e-9 && Math.abs(rv.R) < 1e-6, `no variation: nothing to select, nothing moves (S ${rv.S.toExponential(1)}, R ${rv.R.toExponential(1)})`);
    t.eq(sim.result().interesting, 'novar', 'no variation: its Interesting result');
    let S = 0, R0 = 0, Sr = 0; const M = N(150);
    for (let sd = 1; sd <= M; sd++) { const s = lever('noinherit', 100 + sd), r = s.hist[s.hist.length - 1]; S += r.S; R0 += r.R; }
    for (let sd = 1; sd <= M; sd++) { const s = lever('random', 300 + sd), r = s.hist[s.hist.length - 1]; Sr += r.S; }
    t.note(`no inheritance: mean S ${(S / M).toFixed(3)}, mean R ${(R0 / M).toFixed(3)}; eat at random: mean S ${(Sr / M).toFixed(3)} (${M} seeds)`);
    t.ok(S / M > 0.05 && Math.abs(R0 / M) < 0.012, 'no inheritance: you still select, but the young return to the old average (E[R] = 0)');
    t.ok(Math.abs(Sr / M) < 0.015, 'eat at random: the survivors are a fair sample (E[S] = 0)');
  }

  /* ---------- the fitted rule b (maximum likelihood over your catches) ---------- */
  for (const b0 of [0.7, 1.6, 2.4]) {
    const rnd = mulberry(Math.round(b0 * 100)), ms = [];
    for (let m = 0; m < 3; m++) { const cat = []; let pool = [6, 6, 18]; for (let k = 0; k < 15; k++) { const tot = pool[0] + pool[1] + pool[2], w = pool.map(v => v ? Math.pow(v / tot, b0) : 0); let u = rnd() * (w[0] + w[1] + w[2]), j = 0; for (; j < 2; j++) { u -= w[j]; if (u < 0 && w[j] > 0) break; } if (!w[j]) j = w.findIndex(v => v > 0); cat.push({ m: j, avail: pool.slice() }); pool[j]--; } ms.push({ catches: cat }); }
    let acc = 0, reps = 30; for (let r = 0; r < reps; r++) { const ms2 = []; for (let m = 0; m < 3; m++) { const cat = []; let pool = [8, 7, 15]; for (let k = 0; k < 15; k++) { const tot = pool[0] + pool[1] + pool[2], w = pool.map(v => v ? Math.pow(v / tot, b0) : 0); let u = rnd() * (w[0] + w[1] + w[2]), j = 0; for (; j < 2; j++) { u -= w[j]; if (u < 0 && w[j] > 0) break; } if (!w[j]) j = w.findIndex(v => v > 0); cat.push({ m: j, avail: pool.slice() }); pool[j]--; } ms2.push({ catches: cat }); } acc += sim.fitB(ms2, 0.5, 3, [1, 1, 1]); }
    t.near(acc / reps, b0, 0.35, `fitted b recovers a hunter's rule b = ${b0} from three mornings (mean of ${reps} fits ${(acc / reps).toFixed(2)})`);
  }

  /* ---------- predictions scored against the expectation, never the realised run ---------- */
  {
    const tally = (lv, pred) => { let hit = 0, n = 0; for (let sd = 1; sd <= N(60); sd++) { const r = run(lv, { seed: 2000 + sd, policy: softBot(0, pred), rnd: mulberry(sd) }); for (const id of r.s.asks) { n++; if (r.s.hits[id]) hit++; } } return hit / n; };
    const rIsS = (s, acts) => near(acts, s.hist[s.hist.length - 1].mSurv), none = (s, acts) => near(acts, s.hist[s.hist.length - 1].mAll), exact = (s, acts) => ({ k: 'predict', id: s.ask.id, v: s.exp[s.ask.id] });
    const e1 = tally(1, exact), e2 = tally(2, exact), s2 = tally(2, rIsS), z2 = tally(2, none), z1 = tally(1, none);
    t.note(`hit rates: expectation L1 ${e1.toFixed(2)} L2 ${e2.toFixed(2)}; young = survivors L2 ${s2.toFixed(2)}; no change L1 ${z1.toFixed(2)} L2 ${z2.toFixed(2)}`);
    t.ok(e1 >= 0.99 && e2 >= 0.99, 'a prediction at the expectation always lands in the band');
    t.ok(s2 <= 0.25, 'L2: "the young match the survivors" mostly misses (h² is low; predictions must shrink)');
    t.ok(z2 <= 0.35 && z1 <= 0.35, '"no change" mostly misses in L1 and L2');
    G.reset(3, 11); const sx = sim.s, e = sim.replay(sx.moths, 3, 2, LW_D_ORACLE(), 200, 5), e2b = sim.replay(sx.moths, 3, 2, LW_D_ORACLE(), 200, 5);
    t.eq(e, e2b, 'the boss expectation (200 replays, private PRNG) is deterministic');
    const before = G.TB.R.state(); sim.replay(sx.moths, 3, 2, LW_D_ORACLE(), 50, 6); t.eq(G.TB.R.state(), before, 'the replays never draw from R(), so the run is untouched');
  }

  /* ---------- 4. the 15-minute box ---------- */
  {
    let secs = 0; const paced = (s, acts, rnd) => softBot(2, (s2, a2) => ({ k: 'predict', id: s2.ask.id, v: s2.exp[s2.ask.id] }))(s, acts, rnd);
    for (let lv = 0; lv < 4; lv++) {   // a competent player: one peck every 0.5 s, a prediction after 3 s; plus 15 s on each level card
      const r = G.run(lv, { seed: 3000 + lv, policy: (s, acts, rnd) => { if (s.ask && s.t < 3) return null; if (lv === 0 && s.gen === 2 && !s.pins.length) { const p = acts.find(a => a.k === 'pin'); if (p) return p; } return paced(s, acts, rnd); }, every: 15, rnd: mulberry(lv + 1) });
      secs += r.ticks * sim.dt + 15; t.ok(!!r.result, `L${lv}: the competent player finishes (${(r.ticks * sim.dt).toFixed(0)} s)`);
      if (lv === 0) t.ok((r.result.mask & 1) === 1, 'L0: feeding the chicks and pinning a moth earns Discover');
    }
    t.note(`the unit takes ${(secs / 60).toFixed(1)} minutes of virtual clock for a competent player`);
    t.ok(secs <= 15 * 60, 'D1 oracle 4: a scripted competent player finishes the Wood within 15 minutes');
  }

  /* ---------- the resident snapshot (D5 decision 25) ---------- */
  {
    const r = run(3, { seed: 8, policy: softBot(2) }), s = r.s, lay = sim.lay(3), cp = k => { let c = 0; for (const m of s.moths) c += (m.g[lay.T[k].off] > 0.5) + (m.g[lay.L + lay.T[k].off] > 0.5); return c / (2 * s.moths.length); };
    const snap = { N: s.moths.length, gen: s.gen, seed: 8, freqs: [cp('A'), cp('B')], tone: [sim.mean(s.moths.map(m => m.t)), sim.sd(s.moths.map(m => m.t))], pins: [0, 1, 2, 3].map(k => ({ id: s.moths[k].id & 65535, bytes: ch.pack(s.moths[k], lay) })) };
    const b64 = G.TB.Save._resEnc(snap), bytes = Math.floor(b64.length * 3 / 4);
    t.ok(bytes <= 96, `the wood's resident snapshot is ${bytes} bytes with four pins (≤ 96)`);
    const back = G.TB.Save._resDec(b64); t.near(back.freqs[0], snap.freqs[0], 0.005, 'the snapshot round-trips the band copy share');
  }

  /* ---------- word budgets the lint cannot see (level cards and What if? bodies) ---------- */
  {
    const C = ch.content, w = s => String(s).split(/\s+/).filter(x => /[A-Za-z0-9{]/.test(x)).length;
    t.ok(C.levelTake.every(s => w(s) <= 20), 'level TAKE lines ≤ 20 words');
    t.ok(C.levelBody.concat(C.whatifBody).every(s => w(s) <= 60), 'level and What if? bodies ≤ 60 words');
    t.ok(C.levelBody.concat(C.whatifBody, C.levelTake).every(s => s.split(/(?<=[.!?])\s+/).every(x => w(x) <= 18)), 'their sentences ≤ 18 words');
  }

  /* ---------- review round: predictions need a decision, never a click ---------- */
  {
    const undragged = (s) => ({ k: 'predict', id: s.ask.id, v: s.ask.start, moved: false });
    let asks = 0, hits = 0, stars = 0;
    for (const lv of [0, 1, 2]) for (let sd = 1; sd <= N(30); sd++) { const r = run(lv, { seed: 6000 + sd, policy: softBot(0, undragged), rnd: mulberry(sd + 50 * lv) }); for (const id of r.s.asks) { asks++; if (r.s.hits[id]) hits++; } if (r.result && (r.result.mask & 6)) stars++; }
    t.eq([hits, stars], [0, 0], `an unmoved ghost (Lock in, or the soft timer) is no prediction: ${asks} asks, no hit, no Predict or Transfer star`);
    let ok = 0, n = 0;   // the ghost starts at the axis's left end (0%), far from any expectation
    for (let sd = 1; sd <= N(30); sd++) { const r = run(1, { seed: 6100 + sd, policy: softBot(0, (s) => ({ k: 'predict', id: s.ask.id, v: s.ask.start })), rnd: mulberry(sd) }); for (const id of r.s.asks) { n++; if (!r.s.hits[id]) ok++; } }
    t.eq(ok, n, `L1: the ghost starts off the data, so committing its start value always misses (${ok}/${n})`);
    let zc = 0, zn = 0;   // "no change" never counts towards Predict (the test rule), even where the band is floored
    for (let sd = 1; sd <= N(60); sd++) { const r = run(2, { seed: 6200 + sd, policy: softBot(0, (s) => ({ k: 'predict', id: s.ask.id, v: s.hist[s.hist.length - 1].mAll })), rnd: mulberry(sd * 3) }); for (const id of r.s.asks) { zn++; if (r.s.hits[id]) zc++; } }
    t.eq(zc, 0, `L2: an exact "no change" call never scores (${zn} asks)`);
  }
  {   // No inheritance: "the young match the survivors" (the undragged start) always misses; the right call (the old mean) lands
    const thawRun = (sd, pred) => {
      G.TB.seed(sd); ch.level = 1; sim.reset(1, {}); const rnd = mulberry(sd), pol = softBot(0, expectBot); let ticks = 0, snap = null;
      while (!sim.result() && ticks < 30000) { if (sim.s.gen === sim.s.gens && sim.s.phase === 'dawn') { snap = sim.snapshot(); break; } const A = sim.actions(); if (A.length && ticks % 3 === 0) { const x = pol(sim.s, A, rnd); if (x) sim.act(x); } sim.step(sim.dt); ticks++; }
      sim.reset(1, { thaw: { snap, lever: 'noinherit' } }); ticks = 0;
      while (!sim.result() && ticks < 30000) { const A = sim.actions(); if (A.length && ticks % 3 === 0) { const x = softBot(0, pred)(sim.s, A, rnd); if (x) sim.act(x); } sim.step(sim.dt); ticks++; }
      return sim.s;
    };
    let miss = 0, hit = 0, M = N(30), bodyOk = 0;
    for (let sd = 1; sd <= M; sd++) {
      const a = thawRun(700 + sd, (s) => ({ k: 'predict', id: s.ask.id, v: s.hist[s.hist.length - 1].mSurv })); if (!a.hits[a.asks[a.asks.length - 1]]) miss++;
      const v = ch.bodyVars(), last = a.hist[a.hist.length - 1], sg = x => (x < 0 ? '−' : '') + Math.abs(Math.round(x * 100)); if (v.s === sg(last.S) && v.r === sg(last.R)) bodyOk++;
      const b = thawRun(700 + sd, (s) => ({ k: 'predict', id: s.ask.id, v: s.hist[s.hist.length - 1].mAll })); if (b.hits[b.asks[b.asks.length - 1]]) hit++;
    }
    t.eq(miss, M, `No inheritance: "the young match the survivors" never earns Transfer (${miss}/${M} miss)`);
    t.ok(hit / M >= 0.95, `No inheritance: calling the old average lands (${hit}/${M})`);
    t.eq(bodyOk, M, 'What if? card: S and R are the replayed generation\'s own, never the level\'s averages');
  }
  {   // the strip never shows the answer while you predict; L1 names h² only after the third prediction
    G.TB.seed(31); ch.level = 1; sim.reset(1, {}); let ticks = 0; const rnd = mulberry(31), pol = softBot(0, null);
    while (!sim.s.ask && ticks < 20000) { const A = sim.actions(); if (A.length && ticks % 3 === 0 && !sim.s.ask) { const x = pol(sim.s, A, rnd); if (x) sim.act(x); } sim.step(sim.dt); ticks++; }
    const nt = ch.notes(), tr = nt.charts.find(c => c.type === 'trace'), e = sim.s.exp[sim.s.ask.id];
    t.ok(tr && tr.ghost[0].d.length === 1 && tr.ghost[0].d.every(v => Math.abs(v - e) > 1e-9), 'during an L1 ask the trace shows no expected point for the generation you are predicting');
    t.ok(!nt.stats.some(r => /^h²/.test(r[0])), 'during L1\'s first ask the data table hides h²');
  }

  /* ---------- review round: pins, the search cost, the boss looks, Interesting results ---------- */
  {
    G.reset(1, 5); const s = sim.s; sim.act({ k: 'pin', i: live(s)[0] }); t.eq(s.pins.length, 0, 'L1: a long press never pins (pinning is taught only in L0, mornings 2–3)');
    G.reset(0, 5); sim.act({ k: 'pin', i: live(sim.s)[0] }); t.eq(sim.s.pins.length, 0, 'L0 morning 1: no pin');
    const idle = G.run(0, { seed: 9, policy: () => null }); t.eq(idle.result && idle.result.interesting, 'starved0', 'L0 idle: the hungry-chicks line for L0 (nothing is hidden there)');
  }
  {   // evolution makes the job harder: a darkest-first hunter at a fixed pace has more hungry chicks in L1's last morning than its first
    const pace = (ms) => { let g1 = 0, g5 = 0, fed = 0, M = N(20); for (let sd = 1; sd <= M; sd++) { const r = G.run(1, { seed: 6500 + sd, every: Math.round(ms / 1000 / sim.dt), policy: (s, acts) => s.ask ? expectBot(s, acts) : acts.filter(a => a.k === 'peck').reduce((b, a) => !b || sim.consp(s, s.moths[a.i]) > sim.consp(s, s.moths[b.i]) ? a : b, null) }); g1 += r.s.hist[0].eaten / M; g5 += r.s.hist[4].eaten / M; fed += r.s.fedMorn / (5 * M); } return [g1, g5, fed]; };
    const p6 = pace(650), p8 = pace(800), p10 = pace(1000);
    t.note(`L1 pace (darkest first): 650 ms eats ${p6[0].toFixed(1)} → ${p6[1].toFixed(1)} (fed mornings ${(100 * p6[2]).toFixed(0)}%); 800 ms ${p8[0].toFixed(1)} → ${p8[1].toFixed(1)} (${(100 * p8[2]).toFixed(0)}%); 1000 ms ${p10[0].toFixed(1)} → ${p10[1].toFixed(1)} (${(100 * p10[2]).toFixed(0)}%)`);
    t.ok(p8[1] < p8[0] - 1 && p6[1] < p6[0], 'L1: better-hidden moths cost search time, so the same pace catches fewer by generation 5');
    t.ok(p10[2] > 0.3, 'L1: a slow hunter (1 s a peck) still feeds some mornings (the fed rule is 80%, a slope not a cliff)');
  }
  {   // the boss looks differ only in pattern: a hunter who eats what stands out is not pushed onto the rare looks
    const vis = keep => (s, acts, rnd) => {
      const P = acts.filter(a => a.k === 'peck'); if (s.ask) return { k: 'predict', id: s.ask.id, v: s.ask.start, moved: false }; if (!P.length) return null;
      const bark = sim.bark(s), con = a => Math.abs(s.moths[a.i].t - bark), k = s.si && s.si.run >= 2 ? keep : 0;
      let pool = P; if (k && rnd() < k) { const same = P.filter(a => s.moths[a.i].m === s.si.last); if (same.length) pool = same; } return pool.reduce((b, a) => con(a) > con(b) ? a : b);
    };
    const sweep = keep => { let kept = 0, bs = [], M = N(40); for (let sd = 1; sd <= M; sd++) { const r = G.run(3, { seed: 7000 + sd, every: 15, policy: vis(keep), rnd: mulberry(sd * 17) }); const f = r.s.trail[r.s.trail.length - 1]; if (Math.min(f[0], f[1], f[2]) >= 0.1) kept++; bs.push(r.s.b); } bs.sort((a, b) => a - b); return [kept / M, bs[bs.length >> 1]]; };
    const v0 = sweep(0), vS = sweep(0.8);
    t.note(`L3 visual hunter (eats the highest contrast): all looks ≥ 10% at the end in ${(100 * v0[0]).toFixed(0)}%, median fitted b ${v0[1]}; with the drawn search image (keeps a streak 80%): ${(100 * vS[0]).toFixed(0)}%, b ${vS[1]}`);
    t.ok(v0[1] >= 0.75 && v0[1] <= 1.3, 'L3: eating what stands out gives b near 1: conspicuousness is no longer read as frequency dependence');
    t.ok(v0[0] >= 0.15, 'L3: a visual hunter is not driven to lose a look (it was 0–2 of 40 with the old per-look shade offsets)');
    const seen = []; for (let sd = 1; sd <= N(30); sd++) { G.reset(3, 8800 + sd); for (const m of sim.s.moths) seen.push([m.m, m.t]); }
    const mt = k => sim.mean(seen.filter(q => q[0] === k).map(q => q[1]));
    t.ok(Math.abs(mt(0) - mt(2)) < 0.02 && Math.abs(mt(1) - mt(2)) < 0.02, `L3: band, mottle and speck share one shade distribution (means ${[0, 1, 2].map(k => mt(k).toFixed(3)).join(', ')})`);
  }
  {   // What if? Interesting results follow the outcome
    const pick = (lever, f0, f) => sim.interesting({ whatif: lever, level: 3, trail: [f0, f], hist: [] });
    t.eq(pick('hidden', [0.3, 0.3, 0.4], [0.2, 0.45, 0.35]), 'hidden', 'One hides better: all three kept and the hidden look leads → the search-image line');
    t.eq(pick('hidden', [0.3, 0.3, 0.4], [0.02, 0.9, 0.08]), 'hiddenWon', 'One hides better: the hidden look took over → it says so');
    t.eq(pick('rare', [0.3, 0.3, 0.4], [0.1, 0.2, 0.7]), 'rare', 'Eat the rare: the commonest gained → "is taking over"');
    t.eq(pick('rare', [0.3, 0.3, 0.4], [0.33, 0.33, 0.34]), 'rareNo', 'Eat the rare: chance held it back → it says so');
    t.eq(sim.interesting({ level: 3, trail: [[0.1, 0.1, 0.8], [0.05, 0.3, 0.65]], hist: [] }), 'lost', 'a look below 10% is "fell below 10%", not "vanished"');
    t.eq(sim.interesting({ level: 3, trail: [[0.1, 0.1, 0.8], [0, 0.3, 0.7]], hist: [] }), 'vanished', 'a look at 0% "vanished"');
  }
  {   // the class pools: a 30-bit result code
    const r = run(1, { seed: 77, policy: softBot(0, expectBot), rnd: mulberry(77) }), b = ch.resultBits(r.s, 1);
    t.ok(b >= 0 && b < (1 << 30) && (b & 3) === 1, `result bits fit 30 bits and carry the level (L1: ${b})`);
    const C = ch.content, w = s => String(s).split(/\s+/).filter(x => /[A-Za-z0-9{]/.test(x)).length;
    t.ok(C.levelStars.every(o => Object.values(o).every(s => w(s) <= 15)), 'per-level star hints ≤ 15 words');
    t.ok(C.levelWhy.every(o => [].concat(o.real, o.maths).every(s => w(s) <= 60)), 'per-level Why? chunks ≤ 60 words');
  }

  /* ---------- the bots, unit-wide: no bot's union of level masks may reach D + P + T (D5 item 4, review round) ---------- */
  {
    const names = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'lazy', 'centre', 'auto', 'visual', 'idle'], pop = m => (m & 1) + (m >> 1 & 1) + (m >> 2 & 1), rows = [];
    let three = 0, unions = 0;
    for (const b of names) {
      let best = 0; const pol = b === 'idle' ? () => null : null;
      for (let sd = 1; sd <= N(20); sd++) {
        let u = 0;
        for (let lv = 0; lv < 4; lv++) { const r = G.run(lv, Object.assign({ seed: 4000 + sd, rnd: mulberry(sd * 13 + lv) }, pol ? { policy: pol } : { bot: b })); const m = r.result ? r.result.mask : 0; if (pop(m) === 3) three++; u |= m; }
        if (pop(u) === 3) unions++; if (pop(u) > pop(best)) best = u;
      }
      rows.push(`${b}: ${['-', 'D'][best & 1]}${['-', 'P'][best >> 1 & 1]}${['-', 'T'][best >> 2 & 1]}`);
    }
    t.note('bots, best unit-wide union over ' + N(20) + ' seeds: ' + rows.join('; '));
    t.eq(three, 0, 'no bot earns three stars in any level');
    t.eq(unions, 0, 'no bot (including lazy, centre, auto-hunt only, visual and idle) reaches Discover + Predict + Transfer across the unit');
  }
};
function LW_D_ORACLE() { return [1, 1, 1]; }   // review round: the looks differ only in pattern, so they hide equally well
