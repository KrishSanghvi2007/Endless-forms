/* tests/oracle_census.js: the science oracle for Equilibrium (id census, v2/mixer.js). Owned by the census unit.

     node tests/oracle.js BUILD.html census          (via the shared runner)
     node tests/oracle_census.js BUILD.html          (standalone; CENSUS_FAST=1 for fewer seeds)

   Checks the spec's numbers (D6 "Spec: the Equilibrium chapter", D3 §3.1 and §4.3 oracles) against the unit's own maths and
   against the headless game sim: p², 2pq, q² from 10⁵ pairs; 0.27/0.66/0.07 for unequal sexes, then HW at p = 0.6; χ² power
   (n = 40 against 300 at F = 0.2); the full-sib F recursion and p unchanged; one generation of random mating removes the
   deficit; colour-matched mating hides heterozygotes at one gene only; the Wahlund deficit = 2Var(p); heterozygote advantage
   settles at q̂ = s₁/(s₁ + s₂); the recessive decline Δq = −spq²/(1 − sq²); newborns fit HW while adults show an excess;
   the case-file fingerprints; carriers = 2pq from √aa; determinism and snapshots; and an expert can earn every star. */
'use strict';
const FAST = !!process.env.CENSUS_FAST;

module.exports = async function (G, t) {
  const ch = G.ch, sim = ch.sim, EQ = ch.maths, LV = ch.lv;
  t.ok(EQ && LV && LV.length === 8, 'the unit exposes its maths and eight level sims');
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

  /* ---------- L0: copies, not beetles; Yule's bet ---------- */
  { G.reset(0, 3); const s = sim.s, c = [0, 0, 0]; for (const b of s.bs) c[b.c]++;
    t.eq(c, [4, 16, 20], 'L0: 40 beetles, 4 AA, 16 Aa, 20 aa'); near(EQ.p(c), 0.3, 1e-12, 'L0: p = 0.30 (copies)'); near((c[0] + c[1]) / 40, 0.5, 1e-12, 'L0: yet half the beetles look blue');
    const end = []; for (const sd of seeds(60)) { const r = G.run(0, { seed: sd, bot: 'greedy' }); if (r.result) end.push(r.s.blue[30]); }
    near(mean(end), 0.51, 0.01, `L0: after 30 generations of random mating blue stays at 1 − q² ≈ 0.51 (mean ${mean(end).toFixed(3)}, ${end.length} runs); Yule's 75% never comes`);
    const idle = G.run(0, { seed: 4, policy: (s, acts) => acts.find(a => a.k !== 'predict') || null });   // never touches a prediction
    t.ok(idle.result && idle.s.pred.yule == null && !idle.s.hits.yule && idle.result.interesting == null, 'L0: an untouched Yule bet is never committed for you: no answer, no "you backed Yule"');
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
  { G.reset(1, 3); const s = sim.s, H = LV[1], ev = []; s.phase = 'spin'; s.lever = 1; s.pairs = new Array(40).fill(0); H.act(sim, s, { k: 'setp', v: 0.7 }, ev);
    t.ok(Math.abs(s.p - 0.7) < 1e-9 && s.pairs.length === 0, 'L1: the hopper lever sets any p for the 400 and starts the count afresh');
    s.target = 1e9; for (let i = 0; i < 50000; i++) { H.pair(s, ev); ev.length = 0; } const g = H.geno(s); near(g[1] / EQ.n(g), 0.42, 0.01, 'L1: at p = 0.7 the Aa bar sits on 2pq = 0.42 again'); }

  /* ---------- L2: one generation; unequal sexes take two ---------- */
  { G.reset(2, 4); const s = sim.s, H = LV[2];
    for (let r = 0; r < 3; r++) { H.setRound(sim, s, r); const e = H.expect(sim, s, 'r' + r), p = EQ.p(s.par); t.eq(e.map(EQ.r2), EQ.hw(p).map(EQ.r2), `L2 round ${r + 1}: the young are expected on the curve at the parents' p = ${p}`); }
    H.setRound(sim, s, 3); const e3 = H.expect(sim, s, 'r3'); t.eq(e3.map(EQ.r2), [0.27, 0.66, 0.07], 'L2 unequal sexes (p_f 0.9, p_m 0.3): young expected at 0.27/0.66/0.07, off the curve');
    const ev = []; s.ny = 0; s.young = [0, 0, 0]; for (let i = 0; i < 100000; i++) { H.kid(s, ev); ev.length = 0; } const f = EQ.frac(s.young);
    near(f[1], 0.66, 0.005, 'L2: 10⁵ young from unequal sexes give Aa ≈ 0.66'); near(EQ.p(s.young), 0.6, 0.005, 'L2: their p = (p_f + p_m)/2 = 0.6');
    s.pf = s.pm = 0.6; s.young = [0, 0, 0]; for (let i = 0; i < 100000; i++) { H.kid(s, ev); ev.length = 0; } const f2 = EQ.frac(s.young);
    near(f2[1], 0.48, 0.005, 'L2: the next generation is on the curve (Aa 0.48 at p = 0.6): two generations, not one');
    H.setRound(sim, s, 1); t.eq(s.phase, 'build', 'L2 round 2: the pen is yours to build'); for (let i = 0; i < 8; i++) H.cycle(s, i); t.eq(s.par, [24, 8, 8], 'L2: tapping parents changes the pen (32/0/8 → 24/8/8)');
    t.eq(H.expect(sim, s, 'r1').map(EQ.r2), EQ.hw(EQ.p(s.par)).map(EQ.r2), "L2: your own pen's young are expected on the curve at its p"); }

  /* ---------- L3: the census; χ² with 1 df; power; the verdict scored on what your sample supports ---------- */
  { const set = (s, F0, F1) => { s.beaches = [{ p: 0.5, F: F0 }, { p: 0.4, F: F1 }]; };
    const pw = (beach, n, runs) => { let hit = 0; for (let k = 0; k < runs; k++) { G.reset(3, 1000 + k); const s = sim.s; set(s, 0.2, 0); LV[3].make(sim, s, beach); const idx = EQ.shuffle(s.f.g.map((g, i) => i)).slice(0, n), c = [0, 0, 0]; for (const i of idx) c[s.f.g[i]]++; if (EQ.chi(c) > 3.84) hit++; } return hit / runs; };
    const R = FAST ? 150 : 500, p40 = pw(0, 40, R), p300 = pw(0, 300, R), f300 = pw(1, 300, R);
    t.ok(p40 > 0.08 && p40 < 0.35, `L3 a departing beach (F = 0.2): a sample of 40 detects the deficit only ${(100 * p40).toFixed(0)}% of the time (≈ 20%, R7-R4 B31)`);
    t.ok(p300 > 0.9, `L3 departing beach: a sample of 300 of 500 detects it ${(100 * p300).toFixed(0)}% of the time`);
    t.ok(f300 < 0.08, `L3 fitting beach (in HW): a false alarm at n = 300 only ${(100 * f300).toFixed(0)}% of the time (≤ 5% nominal; sampling without replacement)`);
    G.reset(3, 2); set(sim.s, 0.2, 0); LV[3].make(sim, sim.s, 0); const all = EQ.tally(sim.s.f.g); t.ok(Math.abs(EQ.Fhat(all) - 0.2) < 0.04 && !(all[0] === 150 && all[1] === 200), `L3: a departing census is drawn beetle by beetle, not exact (${all.join('/')}, shortfall ${EQ.Fhat(all).toFixed(2)})`);
    LV[3].make(sim, sim.s, 1); const a2 = EQ.tally(sim.s.f.g), x2 = EQ.chi(a2); t.ok(x2 < 1 && x2 > 1e-6, `L3: a fitting census fits without being perfect (χ² ${x2.toFixed(2)})`);
    let dep = 0, both = 0, none = 0; for (const sd of seeds(200)) { G.reset(3, sd); const B = sim.s.beaches, d = B.filter(b => b.F > 0).length; dep += d; if (d === 2) both++; if (d === 0) none++; }
    const NB = seeds(200).length; near(dep / (2 * NB), 0.5, 0.08, `L3: each beach departs with chance ½, independently (${(100 * dep / (2 * NB)).toFixed(0)}%; both ${both}, neither ${none} of ${NB})`);
    const post = (F, n, runs) => { const out = []; for (let k = 0; k < runs; k++) { G.reset(3, 3000 + k); const s = sim.s; set(s, F, F); LV[3].make(sim, s, 0); const idx = EQ.shuffle(s.f.g.map((g, i) => i)).slice(0, n), c = [0, 0, 0]; for (const i of idx) c[s.f.g[i]]++; out.push(LV[3].post(sim, c)); } return out; };
    const q40 = post(0.2, 40, 120), q300 = post(0.2, 300, 120), z300 = post(0, 300, 120), z40 = post(0, 40, 120);
    t.ok(mean(q40) > 0.35 && mean(q40) < 0.8 && mean(z40) > 0.2 && mean(z40) < 0.6, `L3: after 40 beetles the honest verdict is "can't tell" (posterior ${mean(q40).toFixed(2)} departing, ${mean(z40).toFixed(2)} fitting)`);
    t.ok(mean(q300) > 0.9 && mean(z300) < 0.15, `L3: after 300 the sample decides (posterior ${mean(q300).toFixed(2)} departing, ${mean(z300).toFixed(2)} fitting)`);
    const lazy = (s, acts) => { if (s.ask) return { k: 'predict', id: s.ask.id, v: s.ask.id === 'v0' ? 1 : 0 }; if (s.q.x < 0) return acts.find(a => a.k === 'quad'); return s.n >= 20 ? acts.find(a => a.k === 'finish') || null : null; };   // the reviewers' exploit: 20 beetles, then "departs", "fits"
    const sure40 = (s, acts) => { if (s.ask) return { k: 'predict', id: s.ask.id, v: EQ.chi(s.obs) > 3.84 ? 1 : 0 }; if (s.q.x < 0) return acts.find(a => a.k === 'quad'); return s.n >= 40 ? acts.find(a => a.k === 'finish') || null : null; };   // 40 beetles, then a confident call from χ²
    let lz = 0, gz = 0; const NS = seeds(40); for (const sd of NS) { const r = G.run(3, { seed: sd, policy: lazy }); if (r.result && (r.result.mask & 2)) lz++; const g2 = G.run(3, { seed: sd, policy: sure40 }); if (g2.result && (g2.result.mask & 2)) gz++; }
    t.ok(lz / NS.length < 0.1, `L3: "20 beetles, then departs, fits" earns the Predict star in ${lz} of ${NS.length} seeds (was 20 of 20)`);
    t.ok(gz / NS.length < 0.15, `L3: a confident fits-or-departs call after 40 beetles earns it in ${gz} of ${NS.length}: small samples cannot support certainty`); }

  /* ---------- L4: close relatives ---------- */
  { const H = [[], [], [], [], [], [], []], M = [[], [], [], [], [], [], []], Ho = [[], [], [], []], He0 = [], Mo = [[], [], [], []], Me0 = [], dp = [];
    const likeGoal = (s, acts, rnd) => (s.want === 'goal' && s.mode !== 'like' && !s.ask) ? acts.find(a => a.k === 'valve' && a.m === 'like') || sim.bots.greedy(s, acts, rnd) : sim.bots.greedy(s, acts, rnd);   // the goal: colour-matched mating
    const hx = [], hr = [];
    for (const sd of seeds(120)) { const r = G.run(4, { seed: sd, policy: likeGoal }); if (!r.result) continue; const h = r.s.hist; hx.push(r.s.exp.h3); hr.push(h[3].c[1] / 96);
      for (let g = 0; g < h.length; g++) { const he = 2 * h[g].p * (1 - h[g].p), hm = 2 * h[g].pm * (1 - h[g].pm); if (he > 0.05) H[g].push(h[g].c[1] / 96 / he); if (hm > 0.05) M[g].push(h[g].m[1] / 96 / hm); }
      He0.push(2 * h[0].p * (1 - h[0].p)); Me0.push(2 * h[0].pm * (1 - h[0].pm)); for (let g = 1; g <= 3; g++) { Ho[g].push(h[g].c[1] / 96); Mo[g].push(h[g].m[1] / 96); } dp.push(h[3].p - h[0].p); }
    for (let g = 1; g <= 3; g++) near(mean(Ho[g]) / mean(He0), 1 - EQ.sibF(g), 0.05, `L4: after ${g} brother–sister generation(s) heterozygotes are 1 − F = ${(1 - EQ.sibF(g)).toFixed(3)} of the founders' 2pq (${(mean(Ho[g]) / mean(He0)).toFixed(3)})`);
    near(mean(Mo[3]) / mean(Me0), 1 - EQ.sibF(3), 0.05, `L4: the unlinked second gene falls too (${(mean(Mo[3]) / mean(Me0)).toFixed(3)}): inbreeding acts at every gene`);
    near(mean(dp), 0, 0.02, `L4: p does not move under inbreeding (mean change ${mean(dp).toFixed(3)})`);
    near(mean(H[4]), 1, 0.05, `L4: one generation of random mating restores H ≈ 2pq (${mean(H[4]).toFixed(3)})`);
    t.ok(mean(H[6]) < 0.93, `L4: like-colour mating cuts colour heterozygotes (${mean(H[6]).toFixed(3)}) …`); near(mean(M[6]), 1, 0.05, `… while the second gene stays on HW (${mean(M[6]).toFixed(3)})`);
    near(mean(hr) / mean(hx), 1, FAST ? 0.14 : 0.08, `L4: the new ask's expectation 2pq(1 − F₃) matches the colour Aa share after three sib generations (${mean(hr).toFixed(3)} vs ${mean(hx).toFixed(3)})`);
    let gm = 0, gf = 0; for (const sd of seeds(20)) { const a = G.run(4, { seed: sd, policy: likeGoal }), b = G.run(4, { seed: sd, bot: 'greedy' }); if (a.result && (a.result.mask & 1)) gm++; if (b.result && (b.result.mask & 1)) gf++; }
    t.ok(gm >= 0.8 * seeds(20).length && gf === 0, `L4: the valve goal decides Discover (like colour ${gm}, mix ${gf} of ${seeds(20).length})`); }

  /* ---------- L5: two demes, the Wahlund effect; the edge is hidden and points any of four ways ---------- */
  { const gap = [], w0 = [], fitSide = [], orient = [0, 0, 0, 0]; for (const sd of seeds(120)) { G.reset(5, sd); const s = sim.s, f = s.f, cnt = [[0, 0, 0], [0, 0, 0]], all = [0, 0, 0]; orient[s.orient]++; for (let i = 0; i < f.g.length; i++) { cnt[f.d[i]][f.g[i]]++; all[f.g[i]]++; }
      const n0 = EQ.n(cnt[0]), n1 = EQ.n(cnt[1]), N = n0 + n1, p0 = EQ.p(cnt[0]), p1 = EQ.p(cnt[1]), pb = EQ.p(all), He = 2 * pb * (1 - pb), Ho = all[1] / N, a = n0 / N, varp = a * (1 - a) * (p0 - p1) * (p0 - p1);
      gap.push((He - Ho) - 2 * varp); w0.push(He - Ho); fitSide.push(EQ.Fhat(cnt[0]), EQ.Fhat(cnt[1])); }
    near(mean(gap), 0, 0.012, `L5: the pooled heterozygote deficit equals 2Var(p) between demes (mean gap ${mean(gap).toFixed(4)}; deficit ${mean(w0).toFixed(3)})`);
    near(mean(fitSide), 0, 0.03, `L5: each deme alone is in HW (mean F ${mean(fitSide).toFixed(3)})`);
    t.ok(orient.every(k => k > 0), `L5: the hidden edge runs each of the four ways in some seeds (${orient.join('/')})`);
    G.reset(5, 3); const s = sim.s, H = LV[5]; for (let i = 0; i < s.f.g.length; i++) if (i % 3 === 0) { s.f.sm[i] = 1; s.obs[s.f.g[i]]++; s.n++; }
    const ev = []; H.split(sim, s, H.line(s), ev, false); const r = s.splits[0];
    t.ok(r.acc > 0.97, `L5: a line along the true edge sorts ${(100 * r.acc).toFixed(0)}% of the sample by deme`); t.ok(r.fit, `L5: … and both sides fit (χ² ${r.x2[0]} and ${r.x2[1]})`); t.ok(EQ.chi(s.obs) > 3.84, `L5: while the pooled sample departs (χ² ${EQ.chi(s.obs).toFixed(1)})`);
    const cross = H.LINES[[1, 0, 3, 2][s.orient]]; H.split(sim, s, cross, ev, false); t.ok(s.splits[1].acc < 0.8, `L5: a line across the edge sorts badly (${(100 * s.splits[1].acc).toFixed(0)}%)`);
    let fixed = 0; const NS = seeds(40); for (const sd of NS) { G.reset(5, sd); const q = sim.s; for (let i = 0; i < q.f.g.length; i++) if (i % 3 === 0) { q.f.sm[i] = 1; q.obs[q.f.g[i]]++; q.n++; } H.split(sim, q, H.LINES[0], [], false); if (q.splits[0].acc >= 0.85) fixed++; }
    t.ok(fixed / NS.length < 0.45, `L5: one fixed line (across) is right in only ${fixed} of ${NS.length} seeds: the line has to come from your sample`);
    const yF = []; for (const sd of seeds(80)) { G.reset(5, sd); sim.s.phase = 'askMix'; H.after(sim, sim.s, 'mix', []); yF.push(EQ.Fhat(sim.s.young)); }
    near(mean(yF), 0, 0.03, `L5: one generation of mixing puts the young on HW (mean F ${mean(yF).toFixed(3)})`); }

  /* ---------- L6: warfarin rats ---------- */
  { const q10 = [], pr = [], newF = [], excess = [], dec = [], decE = [];
    for (const sd of seeds(60)) {
      const r = G.run(6, { seed: sd, bot: 'greedy' }); if (!r.result) continue; const s = r.s, m = LV[6].meanS1(s, s.s1.length);
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
    const reach = spots => { const v = []; for (const sd of seeds(30)) { const r = G.run(6, { seed: sd, policy: (s, acts) => { if (s.ask) return { k: 'predict', id: s.ask.id, v: 0.5 }; if (s.trays.length < spots.length && !s.auto) { const p = spots[s.trays.length]; return { k: 'tray', i: s.trays.length, x: p[0], y: p[1] }; } return s.phase === 'place' ? { k: 'release' } : null; } }); if (r.result) v.push(LV[6].meanS1(r.s, 10)); } return mean(v); };
    const best4 = reach([[230, 160], [250, 200], [250, 120], [270, 240]]), mouths = reach([[30, 70], [30, 130], [30, 190], [30, 250]]), one = reach([[230, 160]]);
    t.ok(best4 > 0.45 && best4 < 0.75, `L6: four well-placed trays reach s₁ ≈ ${best4.toFixed(2)} of susceptible rats (was 1.00): no full coverage`);
    t.ok(mouths <= best4 + 0.03 && mouths < 0.7, `L6: trays at the burrow mouths reach no more (${mouths.toFixed(2)}, was 1.00): no dominant spot`);
    t.ok(one > 0.12 && one < 0.4, `L6: one tray reaches ${one.toFixed(2)}: how much bait is a real choice`);
    G.reset(6, 1); const b = LV[6].best(sim.s), cost = k => { let q = 0.05, g = 0; const s1 = [0, 0.25, 0.4, 0.55, 0.61][k]; for (let t2 = 0; t2 < 10; t2++) { const p = 1 - q; g += 64 - s1 * 64 * p * p + 4 * k; q = EQ.sel(q, s1, 0.5); } return g; };
    t.ok(b.k >= 1 && b.k <= 3 && cost(4) > cost(b.k) && cost(0) > cost(b.k), `L6: the farmer's trade-off: the best fixed bait is ${b.k} trays (${b.g} grain); none loses ${Math.round(cost(0))}, four lose ${Math.round(cost(4))}`);
    const own = []; for (const sd of seeds(30)) { const r = G.run(6, { seed: sd, policy: (s, acts, rnd) => s.ask ? { k: 'predict', id: s.ask.id, v: LV[6].expect(sim, s, s.ask.id) } : sim.bots.threshold(s, acts, rnd) }); if (r.result) own.push(r.s.exp.qhat - LV[6].qhat(LV[6].meanS1(r.s, 3), r.s.s2)); }
    near(mean(own.map(Math.abs)), 0, 0.006, 'L6: the q̂ ask is scored against your own bait: q̂ = s₁/(s₁ + s₂) from your seasons 1–3'); }

  /* ---------- L7: case-file fingerprints ---------- */
  { const F = { inb: [], wah: [], sel: [], drift: [], mig: [], none: [] }, area = [], nb = [], ad = [], mk = { inb: [], wah: [], sel: [] }, mkA = [], dYear = { drift: [], mig: [], inb: [] }, kinds = {}, NN = {};
    for (const sd of seeds(60)) for (let ci = 0; ci < 5; ci++) {
      G.reset(7, sd); const s = sim.s; s.ci = ci; LV[7].newCase(sim, s); const cs = s.cs, f = cs.f, all = [0, 0, 0], mm = [0, 0, 0], A = [[0, 0, 0], [0, 0, 0]];
      for (let i = 0; i < f.g.length; i++) { all[f.g[i]]++; mm[f.m[i]]++; A[f.d[i]][f.g[i]]++; }
      kinds[cs.cause] = (kinds[cs.cause] || 0) + 1; (NN[cs.cause] = NN[cs.cause] || []).push(cs.N);
      if (cs.N < 300 && cs.cause !== 'drift') continue;   // fingerprints on the big islands (small ones are noisy); drift is always small
      F[cs.cause].push(EQ.Fhat(all)); if (mk[cs.cause]) mk[cs.cause].push(EQ.Fhat(mm));
      if (cs.cause === 'wah') { area.push(EQ.Fhat(A[0]), EQ.Fhat(A[1])); const M2 = [[0, 0, 0], [0, 0, 0]]; for (let i = 0; i < f.g.length; i++) M2[f.d[i]][f.m[i]]++; mkA.push(EQ.Fhat(M2[0]), EQ.Fhat(M2[1])); }
      if (cs.cause === 'sel') { const b = [0, 0, 0]; for (let k = 0; k < 400; k++) b[LV[7].newborn(cs, k)]++; nb.push(EQ.Fhat(b)); ad.push(EQ.Fhat(all)); }
      if (dYear[cs.cause]) dYear[cs.cause].push(cs.years[3] - cs.years[0]);
    }
    near(mean(F.inb), 0.3, 0.06, `L7 relatives: deficit at the colour gene (F ${mean(F.inb).toFixed(2)})`); near(mean(mk.inb), 0.3, 0.06, `… and at the second gene (${mean(mk.inb).toFixed(2)})`);
    near(mean(F.wah), 0.36, 0.06, `L7 two demes: pooled deficit (F ${mean(F.wah).toFixed(2)} ≈ Var(p)/p̄q̄ = 0.36)`); near(mean(area), 0, 0.05, `… each area fits (F ${mean(area).toFixed(2)})`); near(mean(mk.wah), 0.09, FAST ? 0.08 : 0.05, `… the second gene shows a smaller deficit (${mean(mk.wah).toFixed(2)} ≈ 0.09): F differs gene to gene`); near(mean(mkA), 0, 0.06, `… and vanishes within each area (${mean(mkA).toFixed(2)})`);
    near(mean(ad), -0.333, 0.06, `L7 selection: adults show an excess (F ${mean(ad).toFixed(2)}) …`); near(mean(nb), 0, 0.05, `… newborns fit (F ${mean(nb).toFixed(2)})`);
    near(mean(F.drift), 0, 0.12, `L7 drift: the tiny island fits HW (F ${mean(F.drift).toFixed(2)}) …`); t.ok(mean(dYear.drift.map(Math.abs)) > 0.06, `… while p wanders between years (mean |Δp| ${mean(dYear.drift.map(Math.abs)).toFixed(2)})`);
    near(mean(F.mig), 0, 0.05, `L7 migration: fits HW (F ${mean(F.mig).toFixed(2)}) …`); t.ok(mean(dYear.mig) > 0.25, `… while p climbs towards the mainland's 0.9 (+${mean(dYear.mig).toFixed(2)} in three years)`);
    near(mean(dYear.inb), 0, 0.005, 'L7: in the other cases p stays put between years');
    if (F.none.length) near(mean(F.none), 0, 0.06, `L7 nothing: fits (F ${mean(F.none).toFixed(2)}), so "Nothing" can be the right call`);
    let okOrder = true, nulls = 0, reps = 0; for (const sd of seeds(60)) { G.reset(7, sd); const o = sim.s.order; if (o.indexOf('drift') < 0 || o.indexOf('mig') < 0 || o.length !== 5) okOrder = false; if (o.indexOf('none') >= 0) nulls++; if (new Set(o).size < 5) reps++; }
    t.ok(okOrder && nulls > 0 && reps > 0, `L7: every run has drift and migration; causes repeat (${reps} runs) and Nothing appears (${nulls} runs), so the last case cannot be solved by elimination`);
    const small = Object.keys(NN).filter(k => k !== 'drift' && NN[k].some(n => n <= 40)); t.ok(small.length >= 2, `L7: small islands are not always drifting (small ${small.join(', ')})`);
    { const reader = (s, acts) => { if (s.ask) return null; if (s.phase === 'dx') return acts.find(a => a.c === (s.cs.N <= 40 ? 3 : 4) && a.conf === 0.9); if (s.phase === 'csample' && s.n >= LV[7].need(s)) return acts.find(a => a.k === 'diag'); return acts.find(a => a.k === 'quad' && (s.q.x < 0 || s.tick % 40 === 0)) || null; };   // reads only the scene and the census size
      let rd = 0, best = 0; const NS = seeds(40); for (const sd of NS) { const r = G.run(7, { seed: sd, policy: reader }); if (r.result && (r.result.mask & 1)) rd++; if (r.s.dx) best = Math.max(best, r.s.dx.filter(d => d.ok).length); }
      t.ok(rd / NS.length < 0.15, `L7: a scene-reader (small island → drift, else migration) solves 4 of 5 in ${rd} of ${NS.length} runs (best ${best}): the tests decide, not the pictures`); }
    { G.reset(7, 2); const s = sim.s; s.order = ['mig', 'mig', 'mig', 'mig', 'mig']; s.ci = 0; LV[7].newCase(sim, s); const cs = s.cs, b = [0, 0, 0], a = [0, 0, 0]; for (let k = 0; k < 4000; k++) b[LV[7].newborn(cs, k)]++; for (const g of cs.f.g) a[g]++;
      t.ok(Math.abs(EQ.Fhat(b)) < 0.06 && Math.abs(EQ.Fhat(a)) < 0.15, `L7 migration: migrants breed in before each census, so adults (F ${EQ.Fhat(a).toFixed(2)}) and newborns (F ${EQ.Fhat(b).toFixed(2)}) both fit`); }
    G.reset(7, 1); LV[7].carrier(sim, sim.s); const c = sim.s.car; t.eq(c.true, [196, 168, 36], 'L7 carrier beach: 400 beetles at q = 0.3 (9% amber)'); c.obs = [91, 9]; near(LV[7].expect(sim, sim.s), 0.42, 1e-9, 'L7: carriers from looks: q = √0.09 = 0.3, so 2pq = 0.42'); }

  /* ---------- determinism, snapshots, stars an expert can reach ---------- */
  { for (const lv of [0, 3, 6]) { const a = G.run(lv, { seed: 11, bot: 'random' }), sa = JSON.stringify(a.s.hits) + a.ticks + JSON.stringify(a.result), b = G.run(lv, { seed: 11, bot: 'random' }), sb = JSON.stringify(b.s.hits) + b.ticks + JSON.stringify(b.result); t.eq(sa, sb, `L${lv}: a run is (seed, actions): the same seed and policy give the same run`); }
    G.reset(6, 5); for (let k = 0; k < 400; k++) sim.step(sim.dt); const snap = sim.snapshot(), r1 = G.R(), j1 = JSON.stringify(sim.s.q); sim.restore(snap); const r2 = G.R(); t.ok(r1 === r2 && JSON.stringify(sim.s.q) === j1, 'snapshot and restore round-trip the state and R()'); }
  { const expert = (s, acts, rnd) => {   // predicts the expectation, splits on the true line, diagnoses truthfully: every star must be reachable
      if (s.ask) { const e = LV[s.level].expect(sim, s, s.ask.id); return { k: 'predict', id: s.ask.id, v: e }; }
      if (s.level === 5 && s.phase === 'split' && !s.splits.length) return { k: 'split', pts: LV[5].line(s) };
      if (s.level === 4 && s.want === 'goal' && s.mode !== 'like') return acts.find(a => a.k === 'valve' && a.m === 'like') || null;
      if (s.level === 3 && s.phase === 'sample' && s.n >= 150) return acts.find(a => a.k === 'finish') || null;
      if (s.level === 7 && s.phase === 'dx') return { k: 'dx', c: ['inb', 'wah', 'sel', 'drift', 'mig', 'none'].indexOf(s.cs.cause), conf: 0.9 };
      if (s.level === 7 && s.phase === 'csample' && s.n >= Math.min(60, s.cs.N)) return acts.find(a => a.k === 'diag') || null;
      return sim.bots.greedy(s, acts, rnd);
    };
    let unit = 0; for (let lv = 0; lv < 8; lv++) { let best = 0; for (const sd of [1, 2, 3, 4]) { const r = G.run(lv, { seed: sd, policy: expert }); if (r.result) best |= r.result.mask; } unit |= best; const can = [3, 3, 7, 3, 3, 3, 7, 7][lv]; t.ok((best & can) === can, `L${lv}: an expert earns every star the level offers (${best} of ${can})`); }
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
