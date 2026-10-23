/* tests/oracle_sex.js: the science oracle for Why Sex? (D3 §4.4 as simplified by D6 decision 9; D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html sex          (SX_FAST=1 for a quicker pass)
   D3's acceptance lines, as they apply to the simplified unit:
     A. without parasites the clone's share follows the twofold rule 2c ÷ (1 + c) (here exactly, not just within 5%);
     B. with tracking keys and good aim, sexual snails persist (males at least 20% at the end) in at least 80% of seeds;
     C. "tap the nearest snail", "tap only clones" and "no change" all miss the prediction.
   Plus: the patch is the lake's shares by largest remainder; free recombination of the two lock genes; matching alleles
   (castrating a fraction x of clones scales the clone's output by 1 − x); the parasite's key weights and dealt keys; the
   prediction is scored against the twofold rule; the shallows keep sex while the deep turns clonal; determinism and snapshot
   replay; the expert earns every star each level offers; no level offers three and no bot's unit union reaches three;
   every Interesting and What if? text matches its own run; the What if? levers move the result the way their text says. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim } = G, S = sim, FAST = !!process.env.SX_FAST, N = k => FAST ? Math.max(6, Math.round(k / 4)) : k;
  const run = (lv, seed, bot, extra) => G.run(lv, Object.assign({ seed, bot }, extra || {}));
  const stars3 = m => ((m & 1) ? 1 : 0) + ((m & 2) ? 1 : 0) + ((m & 4) ? 1 : 0);
  const sum = a => a.reduce((x, y) => x + y, 0);
  const share = Z => sum(Z.f) + sum(Z.m) + Z.c;

  /* ---------- A. the twofold cost: no infection, the clone's share goes 2c ÷ (1 + c) every generation ---------- */
  { G.reset(0, 3); const s = S.s; let c = s.zones[0].c, ok = true, okSum = true;
    for (let g = 0; g < 8; g++) { for (const a of s.patch) a.inf = 0; S.breed(s, []); const want = 2 * c / (1 + c); if (Math.abs(s.zones[0].c - want) > 1e-12) ok = false; if (Math.abs(share(s.zones[0]) - 1) > 1e-9) okSum = false; c = s.zones[0].c; }
    t.ok(ok, 'A. with no infections the clone share follows 2c ÷ (1 + c) exactly for 8 generations (the twofold cost)');
    t.ok(okSum, 'and the lake’s class shares always sum to 1');
    t.near(100 * s.hist[6].c[0], S.expect(s, 'p1'), 1e-9, `the L1 call is scored against the same rule: ${S.expect(s, 'p1').toFixed(1)}% at generation 6 from 5%`);
    t.near(S.expect(s, 'p1'), 77.07, 0.05, 'which is 77% (and Why? says so)');
    t.near(s.hist[1].m[0], (1 - 0.05) / 2 / (1 + 0.05) * 1, 1e-9, 'sexual young are half sons: males are (1 − c) ÷ 2 of the next generation, over (1 + c)'); }
  { G.reset(0, 4); const s = S.s; s.noSons = true; s.zones = s.zones.map(Z => ({ f: Z.f.map((v, i) => v + Z.m[i]), m: [0, 0, 0, 0], c: Z.c }));
    const c0 = s.zones[0].c; for (let g = 0; g < 6; g++) { for (const a of s.patch) a.inf = 0; S.breed(s, []); }
    t.near(s.zones[0].c, c0, 1e-9, 'with no sons (hermaphrodite outcrossing) the clone has no advantage: its share stays at 5%'); }

  /* ---------- the patch, recombination, matching alleles ---------- */
  { G.reset(1, 5); const s = S.s, P = s.patch, Z = s.zones[0];
    t.eq(P.length, 40, 'the patch shows 40 snails');
    const nC = P.filter(a => a.t === 'c').length; t.ok(Math.abs(nC - 40 * Z.c) < 1, `its clones (${nC}) are the lake’s share × 40 by largest remainder`);
    t.ok(P.every(a => a.x >= 6 && a.x <= 94 && a.y >= 12 && a.y <= 94), 'every snail sits inside the lakebed, below the shore');
    t.ok(P.filter(a => a.t === 'c').every(a => a.lk === 3) && P.every(a => a.t !== 'c' || a.t === 'c'), 'every clone carries the clone’s lock (banded and spotted)'); }
  { G.reset(1, 6); const s = S.s; s.zones = [{ f: [0, 0, 0, 0.5], m: [0.5, 0, 0, 0], c: 0 }]; s.imm = 0;
    const lv = ch.levels; for (const a of s.patch) a.inf = 0;
    // a lake of banded-spotted mothers and plain fathers: free recombination makes each of the four locks a quarter of the young
    S.newPatch(s); for (const a of s.patch) a.inf = 0; s.w = [1, 1, 1, 1]; const save = s.level; s.level = 0; S.breed(s, []); s.level = save;
    const y = s.zones[0].f.map((v, k) => v + s.zones[0].m[k]), tot = sum(y);
    t.ok(y.every(v => Math.abs(v / tot - 0.25) < 0.006), `free recombination: young locks ${y.map(v => (100 * v / tot).toFixed(1)).join(' / ')}% (a quarter each, give or take 1% lock mutation)`); }
  { G.reset(0, 7); const s = S.s, Z = s.zones[0], c0 = Z.c, sx = sum(Z.f), f3 = Z.f[3];
    for (const a of s.patch) a.inf = a.lk === 3 ? 1 : 0; S.breed(s, []);
    t.near(s.zones[0].c, 0, 1e-12, 'matching alleles: castrate every snail of the clone’s lock and the clone leaves no young');
    G.reset(0, 7); const s2 = S.s; const l3 = s2.patch.filter(a => a.lk === 3), cl = l3.filter(a => a.t === 'c'); cl[0].inf = 1; const x = 1 / l3.length;
    t.near(S.s && ch.sim.s === s2 ? (s2.patch.filter(a => a.lk === 3 && a.inf).length / l3.length) : -1, x, 1e-12, 'infection is pooled by lock: clones and sexual snails of one lock share one infected fraction');
    S.breed(s2, []);
    const want = c0 * (1 - x) / (c0 * (1 - x) + sx - f3 * x); t.near(s2.zones[0].c, want, 1e-9, `castrate one of the ${l3.length} snails of the clone’s lock (x = ${x.toFixed(2)}): the clone’s young and that lock’s sexual young both scale by 1 − x`);
    let wipe = 0; for (let sd = 1; sd <= N(30); sd++) { const r = run(0, sd, 'threshold'); if (r.s.hist.some(h => h.c[0] < 0.005)) wipe++; }
    t.ok(wipe === 0, `L1: even a player who aims only at the two clones never wipes the clone out of the lake (${wipe} of ${N(30)} runs)`); }

  /* ---------- the parasite's keys ---------- */
  { G.reset(1, 8); const s = S.s, w0 = s.w.slice(); s.inf = [1, 0, 2, 5]; for (const a of s.patch) a.inf = 0; S.breed(s, []);
    t.ok(s.w.every((v, k) => Math.abs(v - (0.3 * w0[k] + s.inf[k] * 0 + [1, 0, 2, 5][k] + 0.4)) < 1e-6), 'keys that infect multiply: next weight = 0.3 × this season’s + its infections + 0.4');
    S.deal(s); const tot = sum(s.w), want = s.w.map(v => v / tot * s.C), got = [0, 1, 2, 3].map(k => s.keys.filter(q => q === k).length);
    t.ok(got.every((n, k) => Math.abs(n - want[k]) < 1) && sum(got) === s.C, `tracking keys are dealt in proportion: ${got.join(', ')} of ${s.C} for weights ${s.w.map(v => v.toFixed(2)).join(', ')}`); }
  { let mn = 1; for (let sd = 1; sd <= N(40); sd++) { G.reset(0, sd); for (let g = 0; g < 4; g++) { S.deal(S.s); for (const k of S.s.keys) if (k < 0 || k > 3) mn = 0; } }
    t.ok(mn === 1, 'L1 keys are a naive strain: each clutch’s key is one of the four at random'); }

  /* ---------- B. the Red Queen (L2) and the boss (L3) ---------- */
  { const n = N(40); let sexOK = 0, crash = 0, blindWin = 0;
    for (let sd = 1; sd <= n; sd++) { const r = run(1, sd, 'expert'), e = S.end(r.s); if (e.m >= 0.2) sexOK++; if (r.s.hist.some(h => h.g <= 6 && h.c[0] < 0.1)) crash++; }
    for (let sd = 1; sd <= n; sd++) { const r = run(1, sd, 'alwaysA'); if (S.end(r.s).c >= 0.9) blindWin++; }
    t.ok(sexOK >= 0.8 * n, `B. with tracking keys and good aim, males are at least 20% at the end in ${sexOK} of ${n} seeds (D3: at least 80%)`);
    t.ok(crash >= 0.8 * n, `the clone crashes below 10% by generation 6 in ${crash} of ${n} seeds`);
    t.ok(blindWin >= 0.9 * n, `with almost no infections (eggs dropped in a corner) the clone takes ≥ 90% of the lake in ${blindWin} of ${n}`); }
  { const n = N(40); let pattern = 0, sexMore = 0;
    for (let sd = 1; sd <= n; sd++) { const r = run(2, sd, 'expert'), e = S.end(r.s); if (e.c < 0.15 && e.d >= 0.7) pattern++; if (e.m > e.md) sexMore++; }
    t.ok(pattern >= 0.8 * n, `L3: the shallows end under 15% clone while the deep turns clonal in ${pattern} of ${n} seeds`);
    t.ok(sexMore >= 0.9 * n, `and males are commoner in the shallows than in deep water in ${sexMore} of ${n} (Lively 1987; King et al. 2009)`); }
  { G.reset(2, 9); const s = S.s, ev = []; const k = S.key(s); s.phase = 'season'; S.drop(s, 50, 80, ev, false);
    t.ok(ev.length === 1 && ev[0].k === 'deep' && s.ki === 0 && S.key(s) === k, 'L3: eggs dropped in deep water are refused (ducks feed in the shallows) and the clutch is kept'); }
  /* ---------- the one call comes after the first breed, scored by the twofold rule from the share then shown ---------- */
  { const r = run(0, 5, 'expert'), s = r.s, h1 = s.hist[1].c[0];
    t.ok(s.asks.length === 1 && s.askG === 1 && Math.abs(s.askC - h1) < 1e-12, `L1 asks once, after the first breed, when clones are ${(100 * h1).toFixed(1)}%`);
    t.near(S.expect(s, 'p1'), 100 * 32 * h1 / (1 + 31 * h1), 1e-9, `and scores the call against 2c ÷ (1 + c) five more times: ${S.expect(s, 'p1').toFixed(1)}%`);
    const n = N(40); let mid = 0, sane = 0; for (let sd = 1; sd <= n; sd++) { const e = S.expect(run(0, sd, 'expert').s, 'p1'); if (e > 55 && e < 92) mid++; if (e > 25 && e < 92) sane++; }
    t.ok(mid >= 0.9 * n && sane === n, `that target is 55–92% in ${mid} of ${n} seeds (lower only when the first clutches castrated many clones), far from a linear guess or "no change"`); }

  /* ---------- determinism and snapshot replay ---------- */
  for (const lv of [0, 1, 2]) {
    const a = run(lv, 11, 'expert'), b = run(lv, 11, 'expert');
    t.eq(a.s, b.s, `L${lv + 1}: the same seed and actions give the same final state`);
    G.reset(lv, 12); const pol = G.bot('expert'), rnd = () => 0.5; let ticks = 0, snap = null, at = 0;
    while (!S.result() && ticks < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([ticks, x]); S.act(x); } } S.step(S.dt); ticks++; if (ticks === 300) { snap = S.snapshot(); at = ticks; } }
    const end = JSON.stringify(S.s); S.restore(snap); let k = at;
    while (!S.result() && k < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([k, x]); S.act(x); } } S.step(S.dt); k++; }
    t.ok(JSON.stringify(S.s) === end, `L${lv + 1}: a snapshot at tick 300 restores and replays to the same end`);
  }

  /* ---------- stars: per level, the expert, the bots ---------- */
  const offers = [3, 1, 4];   // L1 D+P, L2 D, L3 T: no level offers all three
  const seeds = N(20), bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'noChange'];
  for (let lv = 0; lv < 3; lv++) {
    let all = 0, over = 0;
    for (let sd = 1; sd <= seeds; sd++) { const r = run(lv, sd, 'expert'); if ((r.result.mask & offers[lv]) === offers[lv]) all++; if (r.result.mask & ~offers[lv]) over++; }
    t.ok(all >= 0.8 * seeds, `L${lv + 1}: the expert earns every star the level offers in ${all} of ${seeds} seeds`);
    t.ok(over === 0, `L${lv + 1}: no run earns a star the level does not offer`);
  }
  { let worst = 0, best = ''; const masks = {};
    for (const b of bots) for (let sd = 1; sd <= seeds; sd++) { const lvm = [0, 1, 2].map(lv => run(lv, sd, b).result.mask); const u = stars3(ch.unitStars(lvm)); if (u > worst) { worst = u; best = b + ' seed ' + sd; } masks[b] = (masks[b] || 0) | lvm.reduce((a, m) => a | m, 0); }
    t.ok(worst < 3, `no fixed bot’s unit union reaches three stars (most: ${worst}, ${best || 'none'})`); }
  { let p = 0; for (let sd = 1; sd <= seeds; sd++) for (const b of ['greedy', 'threshold', 'noChange']) if (run(0, sd, b).result.mask & 2) p++;
    t.ok(p === 0, 'C. "tap the nearest", "only clones" and "no change" calls (35%, 50%, the share now) all miss the prediction'); }
  { let d = 0; for (let sd = 1; sd <= seeds; sd++) for (const b of ['alwaysA', 'alwaysB']) for (const lv of [0, 1]) if (run(lv, sd, b).result.mask & 1) d++;
    t.ok(d === 0, 'dropping every clutch in one fixed spot never earns Discover'); }

  /* ---------- words chosen from the run ---------- */
  { let ok = true, seen = {};
    for (let sd = 1; sd <= N(24); sd++) for (const b of ['expert', 'greedy', 'random', 'alwaysB', 'threshold']) for (const lv of [0, 1, 2]) {
      const r = run(lv, sd, b), e = S.end(r.s), k = r.result.interesting; if (k) seen[k] = 1;
      if (k === 'held' && !(e.c < 0.5)) ok = false; if (k === 'fast' && !(e.c >= 0.9)) ok = false;
      if (k === 'escaped' && !(e.c >= 0.3 && S.trough(r.s) >= 0.1)) ok = false; if (k === 'cycle' && !(e.c >= 0.3 && S.trough(r.s) < 0.1)) ok = false;
      if (k === 'shallowclone' && !(e.c >= 0.5)) ok = false;
    }
    t.ok(ok, `every Interesting text matches its own run (seen: ${Object.keys(seen).join(', ')})`); }
  { const lever = (lv, k, sd) => { G.reset(lv, sd); const snap = S.snapshot(); return run(lv, sd, null, { reset: { thaw: { snap, lever: k } } }); };
    const n = N(12); let nos = 0, blind = 0, ducks = 0, base = 0;
    for (let sd = 1; sd <= n; sd++) {
      const a = lever(0, 'nosons', sd); if (S.end(a.s).c < 0.25) nos++;
      const b = lever(1, 'blind', sd); if (S.end(b.s).c >= 0.3) blind++;
      const c = lever(2, 'ducks', sd), d = run(2, sd, 'expert'); if (S.end(c.s).d < S.end(d.s).d) ducks++;
      if (a.result.mask === 0 && b.result.mask === 0) base++;
    }
    t.ok(nos >= 0.8 * n, `What if? No sons: the clone stays under 25% in ${nos} of ${n} (the main text), else the other text shows`);
    t.ok(blind >= 0.8 * n, `What if? Keys stay random: the clone keeps ≥ 30% in ${blind} of ${n}`);
    t.ok(ducks >= 0.8 * n, `What if? Ducks dive deep: fewer clones in deep water than without in ${ducks} of ${n}`);
    t.ok(base === n, 'What if? runs earn no stars'); }
};
