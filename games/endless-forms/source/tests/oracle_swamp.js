/* tests/oracle_swamp.js: science and engineering oracle for Gene Swamping (v2). Run: node tests/oracle.js BUILD.html swamp
   D5 §4 item 16 acceptance: swamping at m ≈ s (± 20%); cline width ∝ σ/√s within 15%; F_ST ≈ 1/(1 + 4Nm). Plus: the stochastic
   isle tracks its deterministic expectation; F_ST realised against expected; the boss's only winning three-ferry plans link like with like;
   the chapter's one prediction (L1: the ferry size that swamps, m = s);
   determinism, replay and snapshots; the expert earning every star offered; no bot's unit-wide union reaching three stars;
   What if? runs finishing with no stars; the untimed path. SW_FAST=1 runs fewer seeds. */
'use strict';
module.exports = function (G, t) {
  const { sim, ch } = G, FAST = !!process.env.SW_FAST, NS = FAST ? 60 : 200;
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const se = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m))) / Math.max(1, a.length)); };

  /* 1. the swamping threshold: a favoured dominant allele with pale migrants is lost exactly when m ≥ s */
  { let ok = true; const notes = [];
    for (const s of [0.15, 0.25, 0.4]) for (const k of [0.8, 0.95, 1.05, 1.2]) {
      const m = k * s; let p = 0.5; for (let g = 0; g < 20000; g++) p = sim.selP(p, m, 1, 1 - s);
      const kept = p > 1e-3; if (kept !== (k < 1)) ok = false; notes.push(`s ${s} m ${m.toFixed(3)} → p ${p.toExponential(1)}`);
      if (k < 1) { const want = sim.eqDark(s, m), got = sim.dawnDark(p, m); if (Math.abs(want - got) > 1e-3) { ok = false; notes.push('eq mismatch ' + want + ' ' + got); } }
    }
    t.ok(ok, 'dark allele kept below m = s and lost above it (threshold within ±5% of s, D5 asks ±20%); equilibrium matches q² = m(1 − s)/(s(1 − m))');
    t.note(notes.slice(0, 4).join('; ')); }

  /* 2. the stochastic isle (N = 200, binomial ferry counts, Wright–Fisher breeding) tracks the deterministic expectation */
  { const p0 = sim.p0(); let ok = true; const notes = [];
    for (const [sY, m] of [[0.3, 0.02], [0.3, 0.1], [0.3, 0.4]]) {
      const got = [];
      for (let seed = 1; seed <= NS; seed++) { G.reset(0, seed); const s = sim.s; s.sY = sY; s.sW = sY; s.mOver = m; s.auto = true; s.rd = [s.rd[0]]; sim.startRound(s, 1, []); let k = 0; while (s.phase !== 'over' && k < 5000) { sim.step(sim.dt); k++; } got.push(s.rd[1].d[9]); }
      const e = sim.exp10(p0, 0, sY, m), mm = mean(got), tol = 3 * se(got) + 0.02; notes.push(`s ${sY} m ${m}: ${mm.toFixed(3)} vs ${e.toFixed(3)}`); if (Math.abs(mm - e) > tol) ok = false;
    }
    t.ok(ok, 'night-10 dark share: realised mean matches the expectation (' + notes.join('; ') + ')'); }

  /* 3. the round ladder: round three's ferry always reaches s (so swamping is witnessed), and s is measured from the hunt */
  { t.ok([0.1, 0.2, 0.25, 0.3, 0.38, 0.5].every(s => sim.mBig(s) >= s && sim.mBig(s) >= 0.3), 'round three m ≥ max(0.3, s) for every s');
    const r = G.run(0, { seed: 4, bot: 'expert' }); t.ok(r.s.sY >= 0.1 && r.s.sY <= 0.5 && r.s.rd.length === 3, `expert run: s = ${r.s.sY}, m = ${r.s.rd.map(x => x.m).join(', ')}`);
    t.ok(r.s.asks.length === 1 && r.s.asks[0] === 'th' && r.s.exp.th === r.s.sY && r.s.rd[2].m >= r.s.sY, `one prediction in L1 (asks ${r.s.asks.join(',')}): its answer is the measured s = ${r.s.exp.th}, and round three's m = ${r.s.rd[2].m} reaches it`);
    let other = 0; for (let lv = 1; lv < 4; lv++) { const q = G.run(lv, { seed: 4, bot: 'expert' }); other += q.s.asks.length; } t.ok(other === 0, 'no prediction outside L1 (D6 decision 9)');
    let sw = 0, n3 = 0; for (let seed = 1; seed <= 10; seed++) { const q = G.run(0, { seed, bot: 'threshold' }); if (q.s.rd[2]) { n3++; if (q.s.rd[2].d[9] < 0.15) sw++; } } t.ok(sw === n3 && n3 > 0, `round three (m ≥ s) leaves the lava pale on night 10 in ${sw}/${n3} runs`); }

  /* 4. the cline: width scales as σ/√s; it centres on the lava edge */
  { const roosts = [20, 27, 33, 40], p = new Array(60).fill(0.5);
    const w1 = sim.measure(sim.equil(p, roosts, 1, 3)), w2 = sim.measure(sim.equil(p, roosts, 2, 3)), w3 = sim.measure(sim.equil(p, roosts, 2, 1.5));
    const r1 = w1.w / w2.w, r2 = w2.w / w3.w;
    t.ok(Math.abs(r1 - Math.SQRT2) / Math.SQRT2 <= 0.15, `doubling selection narrows the cline by ${r1.toFixed(3)} (√2 = 1.414, within 15%)`);
    t.ok(Math.abs(r2 - 2) / 2 <= 0.15, `halving dispersal narrows it by ${r2.toFixed(3)} (2, within 15%)`);
    t.ok(Math.abs(w1.c - 30) < 0.5 && Math.abs(w3.c - 30) < 0.5, `centre ${w1.c.toFixed(2)} km at the lava edge, and still ${w3.c.toFixed(2)} km after both changes`);
    const r = G.run(1, { seed: 3, bot: 'expert' }); t.ok(r.s.ws.length === 3 && r.s.owls === 2 && r.s.sig === 1.5, `L2 plays both changes by itself after Measure: widths ${r.s.ws.map(q => q.w).join(', ')} km`);
    const lava = sim.measure(sim.equil(p, [6, 12, 18, 24], 1, 3)); t.ok(lava.c > 33 || lava.w >= 60, `roosts on the lava only: centre ${lava.c} km, width ${lava.w} km (the cline slides onto the sand)`); }

  /* 5. F_ST: the identity recursion gives 1/(1 + 4Nm) at balance and 1 − (1 − 1/2N)^t without ferries; the realised estimator agrees */
  { const N = sim.P().Ni.v, hub = [[-1, 0], [-1, 1], [-1, 2], [-1, 3], [-1, 4]];
    G.reset(2, 1); const f0 = sim.zf(), eq = sim.expF(f0, hub, N, 2000), none = sim.expF(f0, [], N, 100), want = 1 - Math.pow(1 - 1 / (2 * N), 100);
    t.near(eq, 1 / (1 + 4), 0.01, `Nm = 1 on every isle: F_ST → ${eq.toFixed(4)} (1/(1 + 4Nm) = 0.2)`);
    t.near(none, want, 1e-9, `no ferries, 100 generations: ${none.toFixed(4)} = 1 − (1 − 1/2N)^100`);
    const eq4 = sim.expF(f0, hub, 4 * N, 4000); t.near(eq4, eq, 0.01, `four times bigger isles, one migrant a generation each: F_ST ${eq4.toFixed(4)} (about the same: Nm sets it)`);
    const a = [], b = [];
    for (let seed = 1; seed <= (FAST ? 80 : 300); seed++) { G.reset(2, seed); const s = sim.s; s.phase = 'drift'; while (s.gen < 100) sim.gen3(s); a.push(s.F[100]); s.routes = hub.map(r => r.slice()); while (s.gen < 250) sim.gen3(s); b.push(s.F[250]); }
    const ea = want, eb = sim.expF(f0.map((r, i) => r.map((v, j) => i === j ? want : 0)), hub, N, 150);
    t.ok(Math.abs(mean(a) - ea) <= 3 * se(a) + 0.03, `realised F_ST at generation 100: ${mean(a).toFixed(3)} against ${ea.toFixed(3)}`);
    t.ok(Math.abs(mean(b) - eb) <= 3 * se(b) + 0.03, `realised F_ST at generation 250 with hub ferries: ${mean(b).toFixed(3)} against ${eb.toFixed(3)}`); }

  /* 6. the boss: of every plan of up to three ferries (pairs of isles), only lava–lava plus two sand–sand links hold all five isles */
  { const pairs = []; for (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) pairs.push([a, b]);
    const plans = []; const rec = (i, cur) => { plans.push(cur); if (cur.length >= ch.C.bossMax) return; for (let j = i; j < pairs.length; j++) rec(j + 1, cur.concat([pairs[j]])); }; rec(0, []);
    const win = plans.filter(pl => sim.expPlan(pl, 100).held === 5).map(pl => pl.map(r => r.join('')).sort().join(' '));
    const like = pl => pl.split(' ').every(r => (r === '01') || (r[0] !== '0' && r[0] !== '1' && r[1] !== '0' && r[1] !== '1'));
    t.ok(win.length === 3 && win.every(like) && win.every(w => w.indexOf('01') >= 0), `winning plans: ${win.join(' | ')} (of ${plans.length}; want only lava–lava with two sand–sand links)`);
    t.ok(ch.P.mF.v > ch.P.sB.v, `a ferry's m = ${ch.P.mF.v} exceeds the owls' s = ${ch.P.sB.v} (the HUD's "Lava–sand links: m > s")`);
    const e = sim.expPlan([[0, 1], [2, 3], [3, 4]], 100), mixed = sim.expPlan([[0, 4], [1, 3], [2, 3]], 100), none = sim.expPlan([], 100);
    t.ok(mixed.dark[0] < 0.75 && Math.min.apply(null, none.H) < 0.5 && none.why.every(w => w === 'drifted') && mixed.why[0] === 'bad', `nearest-isle ferries swamp lava (dark ${mixed.dark[0]}); no ferries lets drift wear the marker down (H ${Math.min.apply(null, none.H)}), and the card says "drifted", not "swamped"`);
    const fc = []; for (let seed = 1; seed <= (FAST ? 40 : 150); seed++) { G.reset(3, seed); const s = sim.s; s.routes = [[0, 1], [2, 3], [3, 4]]; s.eD = s.pD.slice(); while (s.gen < 100) sim.gen4(s); fc.push(s.Fc[100]); }
    t.ok(Math.abs(mean(fc) - e.fc) <= 3 * se(fc) + 0.04, `colour-gene F_ST at generation 100: realised ${mean(fc).toFixed(3)} against expected ${e.fc}`); }

  /* 7. determinism, replay and snapshots */
  { for (const lv of [0, 1, 2, 3]) {
      const r1 = G.run(lv, { seed: 11, bot: 'threshold' }), r2 = G.run(lv, { seed: 11, bot: 'threshold' });
      const key = s => JSON.stringify([s.rd || null, s.ws || null, s.F || null, s.Fc || null, s.hits]);
      t.eq(key(r1.s), key(r2.s), `L${lv + 1}: same seed and actions give the same run`);
      const log = r1.s.log.slice(); G.reset(lv, 11); let i = 0, tick = 0;
      while (!sim.result() && tick < 40000) { while (i < log.length && log[i][0] === tick) sim.act(log[i++][1]); sim.step(sim.dt); tick++; }
      t.eq(key(sim.s), key(r1.s), `L${lv + 1}: replaying the action log reproduces the run`);
    }
    const snap = sim.snapshot(); sim.restore(snap); t.eq(sim.snapshot(), snap, 'snapshot round trip is exact'); t.ok(snap.length < 60000, `end snapshot ${snap.length} characters`); }

  /* 8. the expert earns every star its level offers; no level offers all three */
  { const want = [3, 1, 1, 4], got = [0, 0, 0, 0], n = FAST ? 6 : 15; let three = 0;
    for (let lv = 0; lv < 4; lv++) for (let seed = 1; seed <= n; seed++) { const r = G.run(lv, { seed, bot: 'expert' }); if (r.result && (r.result.mask & want[lv]) === want[lv]) got[lv]++; if (r.result && r.result.mask === 7) three++; }
    t.ok(got.every(g => g >= Math.ceil(0.85 * n)), `expert earns the offered stars: ${got.map((g, i) => 'L' + (i + 1) + ' ' + g + '/' + n).join(', ')}`);
    t.ok(three === 0, 'no level ever awards three stars'); }

  /* 9. no sweep bot's union across the unit reaches three stars (unitStars) */
  { const bots = ['alwaysA', 'alwaysB', 'greedy', 'threshold', 'lazy', 'chain', 'random']; let worst = 0, who = '';
    for (const b of bots) for (let seed = 1; seed <= (FAST ? 4 : 10); seed++) { const lv = [0, 1, 2, 3].map(l => { const r = G.run(l, { seed, bot: b }); return r.result ? r.result.mask : 0; }); const u = ch.unitStars(lv), pop = (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1); if (pop > worst) { worst = pop; who = b + ' seed ' + seed + ' ' + lv.join(','); } }
    t.ok(worst < 3, `best bot unit stars: ${worst} (${who || 'none'})`); }

  /* 10. What if? runs finish by themselves and earn nothing; the untimed path finishes */
  { const levers = [['noferry', 'weak'], ['oneside', 'wide'], ['none', 'big'], ['mixed', 'nofer']]; let ok = true; const notes = [];
    for (let lv = 0; lv < 4; lv++) { const r = G.run(lv, { seed: 5, bot: 'expert' }); const snap = sim.snapshot();
      for (const k of levers[lv]) { G.reset(lv, 5, { thaw: { snap, lever: k } }); let i = 0; while (!sim.result() && i < 30000) { sim.step(sim.dt); i++; } const res = sim.result(); if (!res || res.mask !== 0) ok = false; notes.push(`L${lv + 1} ${k}: ${res ? 'done' : 'stuck'}`); } }
    t.ok(ok, 'every What if? lever runs to the end with no stars (' + notes.join(', ') + ')');
    const u = G.run(0, { seed: 6, bot: 'expert', untimed: true }); t.ok(!!u.result && u.s.unt && u.s.hunts.length === 4 && u.s.hunts.every(h => h.strikes <= 10), `untimed L1 finishes: ${u.s.hunts.map(h => h.fed).join(',')} mice a night`);
    const keys = Object.keys(ch.content.interesting); let bad = 0; for (let lv = 0; lv < 4; lv++) for (const b of ['alwaysB', 'greedy', 'chain']) { const r = G.run(lv, { seed: 2, bot: b }); const k = r.result && r.result.interesting; if (k && keys.indexOf(k) < 0) bad++; }
    t.ok(bad === 0, 'every Interesting key chosen from a run exists in content'); }
};
