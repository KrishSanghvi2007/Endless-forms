/* tests/oracle_census.js: the science oracle for Equilibrium (id census, v2/mixer.js). Owned by the census unit.

     node tests/oracle.js BUILD.html census          (via the shared runner)
     node tests/oracle_census.js BUILD.html          (standalone; CENSUS_FAST=1 for fewer seeds)

   Checks the spec's numbers (D6 "Spec: the Equilibrium chapter", D3 §3.1 and §4.3 oracles) against the unit's own maths and
   against the headless game sim. D6 decision 9 cut the chapter to five levels (engine index → sim key: 0→0 copies, 1→1
   tumbler, 2→3 census, 3→4 relatives, 4→6 rats) with one prediction (the tumbler's Aa share). Checks: p², 2pq, q² from 10⁵
   pairs; unequal sexes (maths: 0.27/0.66/0.07, then HW at p = 0.6, as the MODEL card says); χ² power (n = 40 against 300 at
   F = 0.2); the full-sib F recursion and p unchanged; one generation of random mating removes the deficit; the Wahlund
   deficit = 2Var(p) (maths, as the Why? panel says); heterozygote advantage settles at q̂ = s₁/(s₁ + s₂), shown with the run's
   own s₁; the recessive decline Δq = −spq²/(1 − sq²); newborns fit HW while adults show an excess; carriers = 2pq from √aa
   (maths); only the tumbler asks; determinism and snapshots; and an expert can earn every star. */
'use strict';
const FAST = !!process.env.CENSUS_FAST;

module.exports = async function (G, t) {
  const ch = G.ch, sim = ch.sim, EQ = ch.maths, LV = ch.lv;
  t.ok(EQ && LV && LV.filter(Boolean).length === 5 && ch.levels.length === 5, 'the unit exposes its maths and five level sims (D6 decision 9)');
  const near = (x, y, tol, m) => t.near(+x.toFixed ? +x.toFixed(4) : x, y, tol, m);
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const seeds = n => { const out = []; for (let i = 1; i <= (FAST ? Math.ceil(n / 4) : n); i++) out.push(i); return out; };

  /* ---------- pure maths ---------- */
  const hw = EQ.hw(0.3); near(hw[0], 0.09, 1e-12, 'p² at p = 0.3'); near(hw[1], 0.42, 1e-12, '2pq at p = 0.3'); near(hw[2], 0.49, 1e-12, 'q² at p = 0.3');
  near(1 - hw[2], 0.51, 1e-12, 'blue (AA + Aa) = 1 − q² = 0.51 at p = 0.3');
  near(EQ.chi([25, 50, 25]), 0, 1e-12, 'χ² of exact HW counts is 0');
  near(EQ.chi([30, 40, 30]), 4, 1e-9, 'χ² of 30/40/30 (F = 0.2, n = 100) is 4.0 = nF²');
  const f2 = EQ.inb(0.5, 0.2); near(f2[1], 0.4, 1e-12, 'inbreeding: Aa = 2pq(1 − F) = 0.4 at p = 0.5, F = 0.2'); near(EQ.p(EQ.counts(f2, 500)), 0.5, 1e-12, 'inbreeding leaves p at 0.5');
  near(EQ.sibF(1), 0.25, 1e-12, 'full-sib F after 1 generation = 0.25'); near(EQ.sibF(2), 0.375, 1e-12, 'after 2 = 0.375'); near(EQ.sibF(3), 0.5, 1e-12, 'after 3 = 0.5');
  { const p1 = 0.85, p2 = 0.2, pb = (p1 + p2) / 2, deficit = 2 * pb * (1 - pb) - (2 * p1 * (1 - p1) + 2 * p2 * (1 - p2)) / 2; near(deficit, EQ.wahlund(p1, p2), 1e-12, 'pooled heterozygote deficit = 2Var(p) = (p₁ − p₂)²/2 = 0.211'); }
  { const s1 = 0.6, s2 = 0.5; near(EQ.proj(0.05, 400, s1, s2), s1 / (s1 + s2), 1e-6, 'heterozygote advantage settles at q̂ = s₁/(s₁ + s₂)'); near(EQ.proj(0.95, 400, s1, s2), s1 / (s1 + s2), 1e-6, '… from either side (stable)'); }
  { const s = 0.5; for (const q of [0.5, 0.2, 0.05]) { const p = 1 - q; near(EQ.sel(q, 0, s) - q, -s * p * q * q / (1 - s * q * q), 1e-12, `recessive decline Δq = −spq²/(1 − sq²) at q = ${q}`); } }
  { const a = EQ.proj(0.5, 4, 0, 0.5) - EQ.proj(0.5, 3, 0, 0.5), b = EQ.proj(0.5, 1, 0, 0.5) - 0.5; t.ok(Math.abs(a) < Math.abs(b), 'the recessive decline slows as q falls (ever more slowly)'); }
  { const f = EQ.adults(EQ.hw(0.5), 0.5, 0.5); t.ok(f[1] > 0.5, `adults after heterozygote advantage have excess Aa (${f[1].toFixed(3)} > 2pq = 0.5)`); }
  near(EQ.triErr([1, 0, 0], [0, 0, 1]), 1, 1e-12, 'triangle distance: corner to corner = 1');
  { const pf = 0.9, pm = 0.3, y = [pf * pm, pf * (1 - pm) + (1 - pf) * pm, (1 - pf) * (1 - pm)]; t.eq(y.map(EQ.r2), [0.27, 0.66, 0.07], 'unequal sexes (p_f 0.9, p_m 0.3): the first young are 0.27/0.66/0.07, off the curve (MODEL card: two generations)'); near(y[0] + y[1] / 2, 0.6, 1e-12, '… their p = (p_f + p_m)/2 = 0.6, so the next generation lands on HW'); }
  { const q = Math.sqrt(0.09); near(2 * q * (1 - q), 0.42, 1e-12, 'carriers from looks: q = √aa = √0.09 = 0.3, so 2pq = 0.42 (Why? panel, RECALL)'); }

  /* ---------- L0: copies, not beetles; Yule's bet ---------- */
  { G.reset(0, 3); const s = sim.s, c = [0, 0, 0]; for (const b of s.bs) c[b.c]++;
    t.eq(c, [4, 16, 20], 'L0: 40 beetles, 4 AA, 16 Aa, 20 aa'); near(EQ.p(c), 0.3, 1e-12, 'L0: p = 0.30 (copies)'); near((c[0] + c[1]) / 40, 0.5, 1e-12, 'L0: yet half the beetles look blue');
    const end = []; for (const sd of seeds(60)) { const r = G.run(0, { seed: sd, bot: 'greedy' }); if (r.result) end.push(r.s.blue[30]); }
    near(mean(end), 0.51, 0.01, `L0: after 30 generations of random mating blue stays at 1 − q² ≈ 0.51 (mean ${mean(end).toFixed(3)}, ${end.length} runs); Yule's 75% never comes`);
    const r0 = G.run(0, { seed: 4, bot: 'greedy' }); t.ok(r0.result && r0.s.asks.length === 0 && r0.s.lapsed === 1, 'L0: no prediction interlude (D6 decision 9): Yule\'s 75% is drawn, then thirty generations run');
    G.reset(0, 6); const s0 = sim.s, ev0 = []; LV[0].tag(sim, s0, 0, ev0, false); t.ok(s0.open === 0 && s0.left.length === 2, 'L0: tapping a beetle opens it; its two copies wait to be sorted');
    const wrong = s0.left[0] ? 0 : 1; LV[0].jar(sim, s0, wrong, s0.left[0], ev0, false); t.ok(s0.left.length === 2 && ev0.some(e => e.k === 'bounce'), 'L0: a copy dragged to the wrong jar bounces back');
    LV[0].jar(sim, s0, s0.left[0], s0.left[0], ev0, false); LV[0].jar(sim, s0, s0.left[0], s0.left[0], ev0, false); t.ok(s0.open < 0 && s0.jar[0] + s0.jar[1] === 2 && s0.manual === 1, 'L0: two right jars sort the beetle'); }

  /* ---------- L1: the tumbler ---------- */
  { G.reset(1, 5); const s = sim.s, H = LV[1]; s.target = 1e9; const ev = []; for (let i = 0; i < 100000; i++) { H.pair(s, ev); ev.length = 0; }
    const g = H.geno(s), n = g[0] + g[1] + g[2], e = EQ.hw(s.p);
    for (let k = 0; k < 3; k++) near(g[k] / n, e[k], 0.005, `L1: 10⁵ pairs give ${['AA', 'Aa', 'aa'][k]} within 0.005 of ${e[k].toFixed(2)}`);
    near((g[1]) / n, 0.42, 0.005, 'L1: Aa ≈ 2pq = 0.42: two cells make Aa'); }
  { G.reset(1, 9); const s = sim.s, H = LV[1]; s.nostir = 1; s.target = 1e9; const ev = []; for (let i = 0; i < 40000; i++) { H.pair(s, ev); ev.length = 0; } const g = H.geno(s);
    t.ok(EQ.Fhat(g) > 0.4, `L1 What if? no stirring: a heterozygote deficit (F̂ ${EQ.Fhat(g).toFixed(2)}) …`); near(EQ.p(g), 0.3, 0.01, '… with p unchanged'); }
  { const r = G.run(1, { seed: 3, bot: 'greedy' }); t.eq(r.s.asks, ['het'], 'L1: the chapter\'s one prediction: the Aa share before the 40 pairs');
    t.near(LV[1].expect(sim, r.s, 'het'), 0.42, 1e-9, 'L1: it is scored against 2pq = 0.42'); }

  /* ---------- the census (engine level 2, sim key 3); χ² with 1 df; power ---------- */
  { const set = (s, F0, F1) => { s.beaches = [{ p: 0.5, F: F0 }, { p: 0.4, F: F1 }]; };
    const pw = (beach, n, runs) => { let hit = 0; for (let k = 0; k < runs; k++) { G.reset(2, 1000 + k); const s = sim.s; set(s, 0.2, 0); LV[3].make(sim, s, beach); const idx = EQ.shuffle(s.f.g.map((g, i) => i)).slice(0, n), c = [0, 0, 0]; for (const i of idx) c[s.f.g[i]]++; if (EQ.chi(c) > 3.84) hit++; } return hit / runs; };
    const R = FAST ? 150 : 500, p40 = pw(0, 40, R), p300 = pw(0, 300, R), f300 = pw(1, 300, R);
    t.ok(p40 > 0.08 && p40 < 0.35, `L3 a departing beach (F = 0.2): a sample of 40 detects the deficit only ${(100 * p40).toFixed(0)}% of the time (≈ 20%, R7-R4 B31)`);
    t.ok(p300 > 0.9, `L3 departing beach: a sample of 300 of 500 detects it ${(100 * p300).toFixed(0)}% of the time`);
    t.ok(f300 < 0.08, `L3 fitting beach (in HW): a false alarm at n = 300 only ${(100 * f300).toFixed(0)}% of the time (≤ 5% nominal; sampling without replacement)`);
    G.reset(2, 2); set(sim.s, 0.2, 0); LV[3].make(sim, sim.s, 0); const all = EQ.tally(sim.s.f.g); t.ok(Math.abs(EQ.Fhat(all) - 0.2) < 0.04 && !(all[0] === 150 && all[1] === 200), `L3: a departing census is drawn beetle by beetle, not exact (${all.join('/')}, shortfall ${EQ.Fhat(all).toFixed(2)})`);
    LV[3].make(sim, sim.s, 1); const a2 = EQ.tally(sim.s.f.g), x2 = EQ.chi(a2); t.ok(x2 < 1 && x2 > 1e-6, `L3: a fitting census fits without being perfect (χ² ${x2.toFixed(2)})`);
    let dep = 0, both = 0, none = 0; for (const sd of seeds(200)) { G.reset(2, sd); const B = sim.s.beaches, d = B.filter(b => b.F > 0).length; dep += d; if (d === 2) both++; if (d === 0) none++; }
    const NB = seeds(200).length; near(dep / (2 * NB), 0.5, 0.08, `L3: each beach departs with chance ½, independently (${(100 * dep / (2 * NB)).toFixed(0)}%; both ${both}, neither ${none} of ${NB})`);
    const upTo = m => (s, acts, rnd) => s.phase === 'sample' && s.n >= m ? acts.find(a => a.k === 'finish') || null : sim.bots.greedy(s, acts, rnd), fin = upTo(150), short = upTo(40);   // the quadrat roams; finish at 150 or at 40
    let big = 0, small = 0, asked = 0; const NS = seeds(20); for (const sd of NS) { const a = G.run(2, { seed: sd, policy: fin }), b = G.run(2, { seed: sd, policy: short }); if (a.result && (a.result.mask & 1)) big++; if (b.result && (b.result.mask & 1)) small++; asked += a.s.asks.length + b.s.asks.length; }
    t.ok(big === NS.length && small === 0 && asked === 0, `the census: Discover needs a sample of 150 (${big} of ${NS.length}) not 40 (${small}); no verdict ask (D6 decision 9)`); }

  /* ---------- close relatives (engine level 3, sim key 4) ---------- */
  { const H = [[], [], [], [], []], M = [[], [], [], [], []], Ho = [[], [], [], []], He0 = [], Mo = [[], [], [], []], Me0 = [], dp = [];
    for (const sd of seeds(120)) { const r = G.run(3, { seed: sd, bot: 'greedy' }); if (!r.result) continue; const h = r.s.hist;
      for (let g = 0; g < h.length; g++) { const he = 2 * h[g].p * (1 - h[g].p), hm = 2 * h[g].pm * (1 - h[g].pm); if (he > 0.05) H[g].push(h[g].c[1] / 96 / he); if (hm > 0.05) M[g].push(h[g].m[1] / 96 / hm); }
      He0.push(2 * h[0].p * (1 - h[0].p)); Me0.push(2 * h[0].pm * (1 - h[0].pm)); for (let g = 1; g <= 3; g++) { Ho[g].push(h[g].c[1] / 96); Mo[g].push(h[g].m[1] / 96); } dp.push(h[3].p - h[0].p); }
    for (let g = 1; g <= 3; g++) near(mean(Ho[g]) / mean(He0), 1 - EQ.sibF(g), 0.05, `L4: after ${g} brother–sister generation(s) heterozygotes are 1 − F = ${(1 - EQ.sibF(g)).toFixed(3)} of the founders' 2pq (${(mean(Ho[g]) / mean(He0)).toFixed(3)})`);
    near(mean(Mo[3]) / mean(Me0), 1 - EQ.sibF(3), 0.05, `L4: the unlinked second gene falls too (${(mean(Mo[3]) / mean(Me0)).toFixed(3)}): inbreeding acts at every gene`);
    near(mean(dp), 0, 0.02, `L4: p does not move under inbreeding (mean change ${mean(dp).toFixed(3)})`);
    near(mean(H[4]), 1, 0.05, `L4: one generation of random mating restores H ≈ 2pq (${mean(H[4]).toFixed(3)})`);
    let gd = 0, asked = 0; for (const sd of seeds(20)) { const a = G.run(3, { seed: sd, bot: 'greedy' }); if (a.result && (a.result.mask & 1)) gd++; asked += a.s.asks.length; }
    t.ok(gd >= 0.8 * seeds(20).length && asked === 0, `L4: following the valve (three sib generations, then Mix) earns Discover in ${gd} of ${seeds(20).length}; no asks`); }

  /* ---------- the bait-layer (engine level 4, sim key 6): warfarin rats ---------- */
  { const q10 = [], pr = [], newF = [], excess = [], dec = [], decE = [];
    for (const sd of seeds(60)) {
      const r = G.run(4, { seed: sd, bot: 'greedy' }); if (!r.result) continue; const s = r.s, m = LV[6].meanS1(s, s.s1.length);
      q10.push(s.q[9]); pr.push(EQ.proj(s.q[0], 9, m, s.s2));
      for (const h of s.hist) { if (h.season > 10) continue; newF.push(EQ.Fhat(h.nb)); if (h.s1 > 0.2) excess.push(h.ad[1] / EQ.n(h.ad) - h.nb[1] / EQ.n(h.nb)); }
      dec.push(s.q[18]); decE.push(EQ.proj(s.q[10], 8, 0, s.s2));
    }
    near(mean(q10), mean(pr), 0.06, `L6: q at season 10 follows the heterozygote-advantage recursion (game ${mean(q10).toFixed(3)}, model ${mean(pr).toFixed(3)})`);
    near(mean(newF), 0, 0.04, `L6: newborns sit on the HW curve (mean F ${mean(newF).toFixed(3)})`);
    t.ok(mean(excess) > 0.04, `L6: adults carry excess heterozygotes after baiting (+${mean(excess).toFixed(3)} Aa)`);
    near(mean(dec), mean(decE), 0.05, `L6: without warfarin q declines as the recessive recursion predicts (game ${mean(dec).toFixed(3)}, model ${mean(decE).toFixed(3)})`);
    const q1 = EQ.proj(0.6, 1, 0, 0.5) - 0.6, q8 = EQ.proj(0.6, 8, 0, 0.5) - EQ.proj(0.6, 7, 0, 0.5); t.ok(Math.abs(q8) < Math.abs(q1) / 2, 'L6: the decline slows: rare a copies hide in Aa rats');
    // no full coverage: the best four trays reach about 0.6 of susceptible rats, the burrow mouths less; one tray about 0.25
    const reach = spots => { const v = []; for (const sd of seeds(30)) { const r = G.run(4, { seed: sd, policy: (s, acts) => { if (s.trays.length < spots.length && !s.auto) { const p = spots[s.trays.length]; return { k: 'tray', i: s.trays.length, x: p[0], y: p[1] }; } return s.phase === 'place' ? { k: 'release' } : null; } }); if (r.result) v.push(LV[6].meanS1(r.s, 10)); } return mean(v); };
    const best4 = reach([[230, 160], [250, 200], [250, 120], [270, 240]]), mouths = reach([[30, 70], [30, 130], [30, 190], [30, 250]]), one = reach([[230, 160]]);
    t.ok(best4 > 0.45 && best4 < 0.75, `L6: four well-placed trays reach s₁ ≈ ${best4.toFixed(2)} of susceptible rats (was 1.00): no full coverage`);
    t.ok(mouths <= best4 + 0.03 && mouths < 0.7, `L6: trays at the burrow mouths reach no more (${mouths.toFixed(2)}, was 1.00): no dominant spot`);
    t.ok(one > 0.12 && one < 0.4, `L6: one tray reaches ${one.toFixed(2)}: how much bait is a real choice`);
    G.reset(4, 1); const b = LV[6].best(sim.s), cost = k => { let q = 0.05, g = 0; const s1 = [0, 0.25, 0.4, 0.55, 0.61][k]; for (let t2 = 0; t2 < 10; t2++) { const p = 1 - q; g += 64 - s1 * 64 * p * p + 4 * k; q = EQ.sel(q, s1, 0.5); } return g; };
    t.ok(b.k >= 1 && b.k <= 3 && cost(4) > cost(b.k) && cost(0) > cost(b.k), `L6: the farmer's trade-off: the best fixed bait is ${b.k} trays (${b.g} grain); none loses ${Math.round(cost(0))}, four lose ${Math.round(cost(4))}`);
    const own = [], gap = [], asked = []; for (const sd of seeds(30)) { const r = G.run(4, { seed: sd, bot: 'threshold' }); if (!r.result) continue; own.push(r.s.qh - EQ.r2(LV[6].qhat(LV[6].meanS1(r.s, 10), r.s.s2))); gap.push(Math.abs(r.s.q[10] - r.s.qh)); asked.push(r.s.asks.length); }
    near(mean(own.map(Math.abs)), 0, 1e-9, 'L6: the q̂ shown after season 10 is s₁/(s₁ + s₂) from your own bait reach (no ask, D6 decision 9)');
    t.ok(asked.every(n => n === 0), 'L6: no asks in the rat field');
    const gg = []; for (const sd of seeds(30)) { const r = G.run(4, { seed: sd, bot: 'greedy' }); if (r.result) gg.push(Math.abs(r.s.q[10] - r.s.qh)); }
    t.ok(mean(gg) < 0.12, `L6: under steady baiting (greedy bot) q has settled near the shown q̂ by season 10 (mean gap ${mean(gg).toFixed(3)}; threshold bot ${mean(gap).toFixed(3)}, still approaching)`); }

  /* ---------- determinism, snapshots, stars an expert can reach ---------- */
  { for (const lv of [0, 2, 4]) { const a = G.run(lv, { seed: 11, bot: 'random' }), sa = JSON.stringify(a.s.hits) + a.ticks + JSON.stringify(a.result), b = G.run(lv, { seed: 11, bot: 'random' }), sb = JSON.stringify(b.s.hits) + b.ticks + JSON.stringify(b.result); t.eq(sa, sb, `L${lv}: a run is (seed, actions): the same seed and policy give the same run`); }
    G.reset(4, 5); for (let k = 0; k < 400; k++) sim.step(sim.dt); const snap = sim.snapshot(), r1 = G.R(), j1 = JSON.stringify(sim.s.q); sim.restore(snap); const r2 = G.R(); t.ok(r1 === r2 && JSON.stringify(sim.s.q) === j1, 'snapshot and restore round-trip the state and R()'); }
  { const expert = (s, acts, rnd) => {   // predicts the expectation, samples enough, follows the valve, baits moderately: every star must be reachable
      if (s.ask) { const e = LV[s.level].expect(sim, s, s.ask.id); return { k: 'predict', id: s.ask.id, v: e }; }
      if (s.level === 3 && s.phase === 'sample' && s.n >= 150) return acts.find(a => a.k === 'finish') || null;
      if (s.level === 6) return sim.bots.threshold(s, acts, rnd);
      return sim.bots.greedy(s, acts, rnd);
    };
    let unit = 0; for (let lv = 0; lv < 5; lv++) { let best = 0; for (const sd of [1, 2, 3, 4]) { const r = G.run(lv, { seed: sd, policy: expert }); if (r.result) best |= r.result.mask; } unit |= best; const can = [1, 3, 1, 1, 5][lv]; t.ok(best === can, `L${lv}: an expert earns every star the level offers, and only those (${best} of ${can})`); }
    t.eq(unit, 7, 'the unit: Discover, Predict and Transfer are all reachable'); }
};

if (require.main === module) {
  const path = require('path'), { load, runSim, mulberry } = require('./vmgame');
  const html = process.argv[2]; if (!html) { console.log('usage: node tests/oracle_census.js BUILD.html'); process.exit(2); }
  const V = load(path.resolve(html)), TB = V.TB, ch = TB.REG.census;
  const G = { TB, ch, sim: ch.sim, Det: TB.Det, WF: TB.WF, Gen: TB.Gen, seed: TB.seed, R: TB.R,
    reset(level, seed, o) { TB.seed(seed == null ? 1 : seed); ch.level = level; ch.sim.reset(level, o || {}); return ch.sim.s; },
    run(level, o) { o = Object.assign({}, o); if (!o.policy && o.bot) { const f = o.bot === 'random' ? (s, a, rnd) => a[Math.floor(rnd() * a.length)] : ch.sim.bots[o.bot]; o.policy = f; } return runSim(TB, ch, level, o); } };
  let pass = 0, fail = 0; const out = [];
  const t = { ok: (c, m) => { (c ? pass++ : fail++); out.push((c ? '  ok   ' : '  FAIL ') + m); }, near: (x, y, tol, m) => { const c = typeof x === 'number' && Math.abs(x - y) <= tol; (c ? pass++ : fail++); out.push((c ? '  ok   ' : '  FAIL ') + m + (c ? '' : ` (got ${x}, want ${y} ± ${tol})`)); }, eq: (a, b, m) => { const c = JSON.stringify(a) === JSON.stringify(b); (c ? pass++ : fail++); out.push((c ? '  ok   ' : '  FAIL ') + m + (c ? '' : ` (got ${JSON.stringify(a)}, want ${JSON.stringify(b)})`)); }, note: m => out.push('  note ' + m) };
  Promise.resolve(module.exports(G, t)).then(() => { console.log(out.join('\n')); console.log(`oracle census: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }, e => { console.log(out.join('\n')); console.log('oracle census: threw ' + (e && e.stack || e)); process.exit(1); });
}
