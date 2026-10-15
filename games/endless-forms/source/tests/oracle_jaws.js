/* tests/oracle_jaws.js: science and engineering oracle for Left Jaw, Right Jaw (v2). Run: node tests/oracle.js BUILD.html jaws
   D1 §3.3 / D5 §4 item 7 acceptance: against a commoner-side bot, selection on right-strikers opposes p − ½; the lizard wheel
   cycles with period 5 ± 1 seasons with the 3-per-morph floor and loses a morph within a few seasons without it. Plus: the
   heritabilities in force, R ≈ h²S, the expectations the stars read (next-season share, lizard step) against realised
   replicates, determinism and replay, snapshot round trip, the expert earning every star offered, no bot's union across the
   unit reaching three stars, the first action that cannot fail, and every What if? text checked against its own run.
   JW_FAST=1 runs fewer seeds. */
'use strict';
module.exports = function (G, t) {
  const { sim, ch, TB } = G, FAST = !!process.env.JW_FAST, NS = FAST ? 12 : 40;
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const sd = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m)))); };

  /* 1. negative frequency dependence against the commoner-side bot (D1's oracle) */
  let agree = 0, tot = 0, sAgree = 0;
  for (const lv of [0, 1]) for (let seed = 1; seed <= NS; seed++) {
    const r = G.run(lv, { seed, bot: 'greedy' });
    for (const rec of r.s.hist) {
      const p = rec.sp[0].p; if (Math.abs(p - 0.5) < 0.05) continue; tot++;
      if ((rec.sR - rec.sL) * (p - 0.5) < 0) agree++;          // the commoner side fed worse
      if (rec.sp[0].S * (p - 0.5) < 0) sAgree++;               // selection on twist pushes towards the rarer side
    }
  }
  t.ok(agree / tot >= 0.97, `commoner-side bot: right-strikers' relative success opposes p − ½ in ${agree} of ${tot} seasons`);
  t.ok(sAgree / tot >= 0.95, `commoner-side bot: the selection differential S opposes p − ½ in ${sAgree} of ${tot} seasons`);

  /* 2. swings: the commoner-side bot makes the share cross 50:50 and come back; guarding one side always does not */
  const swing = (lv, bot) => { let k = 0; for (let seed = 1; seed <= NS; seed++) if (sim.crossings(G.run(lv, { seed, bot }).s.ps[0]) >= 2) k++; return k / NS; };
  const sG0 = swing(0, 'greedy'), sB0 = swing(0, 'alwaysB'), sG1 = swing(1, 'greedy');
  t.ok(sG0 >= 0.85 && sG1 >= 0.85, `full swing with the commoner-side bot: L1 ${sG0.toFixed(2)}, L2 ${sG1.toFixed(2)} of seeds (≥ 0.85)`);
  t.ok(sB0 <= 0.1, `always guarding right gives no full swing (steady selection): ${sB0.toFixed(2)} of seeds`);

  /* 3. heritabilities in force: founders' regression of breeding value on twist */
  const h2of = lv => { const vals = []; for (let seed = 1; seed <= 20; seed++) { const s = G.reset(lv, seed); const P = s.pop[0], am = mean(P.map(x => x.a)), zm = mean(P.map(x => x.z)); let c = 0, v = 0; for (const x of P) { c += (x.a - am) * (x.z - zm); v += (x.z - zm) * (x.z - zm); } vals.push(c / v); } return mean(vals); };
  const h0 = h2of(0), h2 = h2of(2);
  t.near(h0, 0.9, 0.06, `L1 heritability in force ${h0.toFixed(3)} (0.9, ×N)`);
  t.near(h2, 0.25, 0.08, `L3 heritability in force ${h2.toFixed(3)} (0.25, realistic)`);

  /* 4. R ≈ h²S in L3 (the response to your own selection), pooled over seeds */
  let S = 0, Rr = 0, hS = 0;
  for (let seed = 1; seed <= NS; seed++) for (const rec of G.run(2, { seed, bot: 'greedy' }).s.hist) { const q = rec.sp[0]; if (q.R == null) continue; S += q.S; Rr += q.R; hS += q.h2 * q.S; }
  t.near(Rr / S, 0.25, 0.1, `L3 pooled realised R/S ${(Rr / S).toFixed(3)} (≈ 0.25)`);
  t.near(Rr / hS, 1, 0.3, `L3 pooled R against Σh²S ${(Rr / hS).toFixed(3)} (≈ 1)`);

  /* 5. the expectation the Predict star reads: expShare against realised breeding replicates (same state, many R() seeds) */
  { const errs = [];
    for (let seed = 1; seed <= (FAST ? 3 : 6); seed++) {
      G.reset(1, seed); const s = sim.s;   // a fresh L2 state; play one season with the bot
      let ticks = 0; while (s.phase !== 'dusk' && ticks < 20000) { const A = sim.actions(); const a = A.length ? sim.bots.greedy(s, A) : null; if (a) sim.act(a); sim.step(sim.dt); ticks++; }
      const snap = sim.snapshot(), e = sim.expShare(s, 0, 600, 4242), got = [];
      for (let k = 0; k < (FAST ? 60 : 160); k++) { sim.restore(snap); TB.seed(k + 1); sim.breed([]); got.push(sim.s.ps[0][sim.s.ps[0].length - 1]); }
      errs.push(Math.abs(mean(got) - e));
    }
    t.ok(Math.max(...errs) <= 0.03, `next-season expectation matches realised breeding within 0.03 (max error ${Math.max(...errs).toFixed(3)})`);
  }

  /* 6. lizards: D1's checked model — period 5 ± 1 seasons with the floor; a morph lost within a few seasons without it */
  { const P = ch.P, K0 = P.K.v, F0 = P.F.v, N = 150, per = [], lost = [];
    const runL = (F, b, T) => { let c = [40, 70, 40]; const lead = [sim.lizLead(c.map(v => v / N))]; let lostAt = -1;
      for (let g = 1; g <= T; g++) { const q = sim.lizQ(c, b, N), m = TB.WF.multinom(N - 3 * F, q); c = [m[0] + F, m[1] + F, m[2] + F]; lead.push(sim.lizLead(c.map(v => v / N))); if (lostAt < 0 && Math.min(...c) === 0) lostAt = g; }
      return { lead, lostAt }; };
    for (let seed = 1; seed <= (FAST ? 60 : 300); seed++) {
      TB.seed(seed); const a = runL(F0, 1, 40), starts = []; for (let i = 1; i < a.lead.length; i++) if (a.lead[i] === 1 && a.lead[i - 1] !== 1) starts.push(i);
      if (starts.length >= 2) per.push((starts[starts.length - 1] - starts[0]) / (starts.length - 1));
      TB.seed(seed); lost.push(runL(0, 1, 12).lostAt);
    }
    const pm = mean(per); lost.sort((x, y) => (x < 0 ? 99 : x) - (y < 0 ? 99 : y));
    t.near(pm, 5, 1, `lizard period with the floor ${pm.toFixed(2)} ± ${sd(per).toFixed(2)} seasons (5 ± 1; D1 checked 5.1)`);
    t.ok(lost.every(x => x > 0 && x <= 6), `without the floor a morph is lost in every run, by season ${Math.max(...lost)} (median ${lost[lost.length >> 1]})`);
    TB.seed(5); const bad = runL(F0, 0.3, 10); t.ok(bad.lead.slice(-4).every(l => l === 2), 'blocking under half lets yellow take the rocks and stay');
    // the expectation the triangle star reads: lizNext against the mean of realised binomial steps
    const c0 = [60, 50, 40]; let acc = [0, 0, 0]; const reps = FAST ? 400 : 2000;
    for (let k = 0; k < reps; k++) { TB.seed(k + 1); const q = sim.lizQ(c0, 0.8, N), m = TB.WF.multinom(N - 3 * F0, q); for (let i = 0; i < 3; i++) acc[i] += (m[i] + F0) / N; }
    const e = sim.lizNext(c0, 0.8, F0, N), err = Math.max(...acc.map((v, i) => Math.abs(v / reps - e[i])));
    t.ok(err <= 0.01, `lizard expectation matches realised steps within 0.01 (${err.toFixed(4)})`);
    void K0;
  }

  /* 7. two hunters: one defender selects both species, so their moves line up */
  { let ok = 0; for (let seed = 1; seed <= NS; seed++) { const s = G.run(3, { seed, bot: 'greedy' }).s, al = sim.aligned(s); if (al.same >= 4 && al.opp <= 1) ok++; }
    t.ok(ok / NS >= 0.75, `L4: plain and striped shares move together on ${ok} of ${NS} seeds (commoner-side bot)`); }

  /* 8. determinism, replay and snapshots */
  { const a = G.run(1, { seed: 9, bot: 'greedy' }), b = G.run(1, { seed: 9, bot: 'greedy' });
    t.eq(a.s.ps, b.s.ps, 'same seed and actions give the same run');
    const log = a.s.log.slice(); G.reset(1, 9); const s = sim.s; let i = 0, tick = 0;
    while (!sim.result() && tick < 40000) { while (i < log.length && log[i][0] === tick) sim.act(log[i++][1]); sim.step(sim.dt); tick++; }
    t.eq(sim.s.ps, a.s.ps, 'replaying the action log reproduces the run'); void s;
    const snap = sim.snapshot(); sim.restore(snap); t.eq(sim.snapshot(), snap, 'snapshot round trip is exact');
    t.ok(snap.length < 60000, `L2 end snapshot ${snap.length} characters`);
  }

  /* 9. the expert earns every star its level offers; no level offers all three */
  { const want = [1, 3, 3, 3, 5], got = [0, 0, 0, 0, 0];
    for (let lv = 0; lv < 5; lv++) for (let seed = 1; seed <= (FAST ? 8 : 20); seed++) { const r = G.run(lv, { seed, bot: 'expert' }); if (r.result && (r.result.mask & want[lv]) === want[lv]) got[lv]++; }
    const n = FAST ? 8 : 20; got.forEach((g, lv) => t.ok(g / n >= 0.8, `L${lv + 1}: the expert earns every offered star (${want[lv]}) on ${g} of ${n} seeds`)); }

  /* 10. no bot's union across the unit reaches three stars (lessons rule 5), via ch.unitStars */
  { const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'lazy', 'mirror'], worst = {};
    for (const b of bots) { worst[b] = 0; for (let seed = 1; seed <= (FAST ? 6 : 16); seed++) { const lv = []; for (let l = 0; l < 5; l++) { const r = G.run(l, { seed, bot: b }); lv.push(r.result ? r.result.mask & 7 : 0); if (r.result && (r.result.mask & 7) === 7) worst[b] = 9; } const u = ch.unitStars(lv); const pc = (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1); worst[b] = Math.max(worst[b], pc); } }
    t.ok(Object.values(worst).every(v => v < 3), 'no bot reaches three unit stars: ' + bots.map(b => b + ' ' + worst[b]).join(', ')); }

  /* 11. the first action cannot fail: the first wave of L1 waits for your first guard; a random tapper finishes season 1 */
  { const s = G.reset(0, 3); for (let k = 0; k < 300; k++) sim.step(sim.dt); t.ok(s.att === 0 && s.wave && s.wave.tb >= 1e9, 'L1: the first scale-eater waits until you raise a guard');
    const r = G.run(0, { seed: 4, bot: 'random', cap: 3000 }); t.ok(r.s.season >= 2 || r.result, 'a random tapper gets past season 1'); }

  /* 12. What if? texts against their own runs */
  { const thaw = (lv, seed, lever) => { G.reset(lv, seed); const s = sim.s; let k = 0;
      while (!(s.phase === 'dusk' && s.season === s.seasons) && k < 60000) { const A = sim.actions(); const a = A.length ? sim.bots.greedy(s, A) : null; if (a && a.k !== 'predict') sim.act(a); else if (s.ask) sim.act({ k: 'predict', id: s.ask.id, v: s.ask.kind === 'tri' ? [1 / 3, 1 / 3, 1 / 3] : 0.5, moved: true }); sim.step(sim.dt); k++; }
      const snap = sim.snapshot(); G.reset(lv, seed, { thaw: { gen: s.season, snap, lever } }); let j = 0; while (!sim.result() && j < 4000) { sim.step(sim.dt); j++; } return { s: sim.s, r: sim.result() }; };
    let ok = true, notes = [];
    for (let seed = 1; seed <= (FAST ? 4 : 10); seed++) {
      const a = thaw(1, seed, 'always'), d = a.s.wps[0]; if (a.r.interesting === 'always' && !(d[d.length - 1] < d[0] - 0.15)) { ok = false; notes.push('always ' + seed); }
      const e = thaw(1, seed, 'equal'), de = e.s.wps[0], txt = e.r.interesting; if ((txt === 'equal') !== (Math.abs(de[de.length - 1] - de[0]) <= 0.15)) { ok = false; notes.push('equal ' + seed); }
      const ni = thaw(1, seed, 'noinherit'), dn = ni.s.wps[0]; if (Math.abs(mean(dn.slice(1)) - G.reset(1, seed).ps[0][0]) > 0.15) { ok = false; notes.push('noinherit ' + seed); }
      const nf = thaw(4, seed, 'nofloor'); if ((nf.r.interesting === 'nofloor') !== nf.s.wtrail.some(x => Math.min(...x) === 0)) { ok = false; notes.push('nofloor ' + seed); }
      const pr = thaw(4, seed, 'poor'); if (sim.lizLead(pr.s.wtrail[pr.s.wtrail.length - 1]) !== 2) { ok = false; notes.push('poor ' + seed); }
      const pf = thaw(4, seed, 'perfect'); if ((pf.r.interesting === 'perfect') !== sim.turned(pf.s.wlead)) { ok = false; notes.push('perfect ' + seed); }
      if ([a, e, ni, nf, pr, pf].some(x => x.r.mask !== 0)) { ok = false; notes.push('stars in a What if? ' + seed); }
    }
    t.ok(ok, 'every What if? text matches its own run, and What if? runs earn no stars' + (notes.length ? ' (' + notes.join(', ') + ')' : '')); }

  /* 13. result text from the run: always guarding one side never reads as a swing */
  { let ok = true; for (let seed = 1; seed <= 12; seed++) { const r = G.run(0, { seed, bot: 'alwaysB' }); if (r.result.interesting === null && r.result.mask & 1) ok = false; }
    t.ok(ok, 'always guarding right never earns Discover or a silent card'); }
};
