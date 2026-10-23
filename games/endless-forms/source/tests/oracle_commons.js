/* tests/oracle_commons.js: the science oracle for The Commons (D3 §4.5 as cut by D6 decisions 9–10).
   Run: node tests/oracle.js BUILD.html commons          (CM_FAST=1 for a quicker pass)
   Checks:
     the within-droplet model: inside any mixed droplet producers lose share every generation (cheats win by c), whatever
       the mix, and a cell gets none of its own siderophore back (a lone producer among cheats gains nothing over them);
     Price's partition is an identity: between + within = total, for random droplet sets, pooled by growth or by equal shares;
       under equal shares the between term is exactly 0, and all-clone droplets leave producers exactly where they were;
     one unsplit droplet (no structure) always loses producers; relatedness from few founders: the expected change across
       random even splits is positive at 4 founders or fewer and negative at 16 or more, with break-even near b ÷ c = 8;
     the L2 call is scored against the model's own outcome; determinism and snapshot replay; What if? thaws run to an end;
     an expert earns every star the unit offers; no level offers three and no standard bot's union across the unit reaches
     three; the Interesting texts quote their own run. */
'use strict';
module.exports = function (G, t) {
  const { ch } = G, S = ch.sim, FAST = !!process.env.CM_FAST, N = k => FAST ? Math.max(5, Math.round(k / 4)) : k;
  const b = 1.2, c = 0.15, Gn = 4, CM = ch.cm, LV = ch.cmLV;
  let seed = 12345; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const grow = (P, C) => { for (let g = 0; g < Gn; g++) { const f = P / (P + C); P *= 1 + b * f - c; C *= 1 + b * f; } return [P, C]; };

  /* ---------- inside a droplet ---------- */
  { let ok = true, worst = 1;
    for (let P = 1; P <= 31; P++) for (const C of [1, 2, 5, 16, 31]) { const [p2, c2] = CM.grow(P, C, b, c, Gn), f0 = P / (P + C), f1 = p2 / (p2 + c2); if (!(f1 < f0)) ok = false; worst = Math.min(worst, f0 - f1); }
    t.ok(ok, `within any mixed droplet producers lose share over a round (smallest loss ${worst.toFixed(4)})`);
    const [p1, c1] = CM.grow(1, 31, b, c, Gn); t.ok(p1 / 1 < c1 / 31, 'no self-benefit: a lone producer among 31 cheats grows less than each cheat beside it');
    const [pp] = CM.grow(4, 0, b, c, Gn), [, cc] = CM.grow(0, 4, b, c, Gn);
    t.near(pp / 4, Math.pow(1 + b - c, Gn), 1e-9, `a producer clone grows (1 + b − c)^4 = ${(pp / 4).toFixed(2)}× a round`);
    t.near(ch.cmM.clone, Math.pow(1 + b - c, Gn), 1e-3, 'CM_M.clone matches (1 + b − c)^4');
    t.near(cc / 4, 1, 1e-12, 'a cheat clone has no siderophore, so no iron: it does not grow');
    let ok2 = true; for (let k = 0; k < 200; k++) { const P = 1 + Math.floor(rnd() * 20), C = 1 + Math.floor(rnd() * 20), f = P / (P + C); if (!((1 + b * f - c) / (1 + b * f) < 1)) ok2 = false; } t.ok(ok2, 'per generation, a producer grows by 1 + b·f − c and a cheat by 1 + b·f: the cheat always wins by c'); }

  /* ---------- Price's partition ---------- */
  { let worst = 0, worstL = 0, zero = 0;
    for (let k = 0; k < 400; k++) {
      const nd = 1 + Math.floor(rnd() * 12), ds = [];
      for (let i = 0; i < nd; i++) { const n = 1 + Math.floor(rnd() * 8), P = Math.floor(rnd() * (n + 1)), g = grow(P, n - P); ds.push({ n, P, gP: g[0], gC: g[1] }); }
      const a = CM.price(ds, false), l = CM.price(ds, true);
      worst = Math.max(worst, Math.abs(a.between + a.within - a.total)); worstL = Math.max(worstL, Math.abs(l.between + l.within - l.total)); zero = Math.max(zero, Math.abs(l.between));
      let N0 = 0, Pn = 0, Tn = 0; for (const d of ds) { N0 += d.n; Pn += d.gP; Tn += d.gP + d.gC; } if (Math.abs(a.pnew - Pn / Tn) > 1e-12) worst = 1;
    }
    t.ok(worst < 1e-12, `pooled by growth: between + within = total for 400 random droplet sets (worst error ${worst.toExponential(1)})`);
    t.ok(worstL < 1e-12, `equal shares: between + within = total (worst error ${worstL.toExponential(1)})`);
    t.ok(zero < 1e-12, 'equal shares: the between-droplet term is exactly 0');
    const clones = [{ n: 1, P: 1 }, { n: 1, P: 0 }, { n: 2, P: 2 }, { n: 3, P: 0 }].map(d => { const g = grow(d.P, d.n - d.P); return Object.assign(d, { gP: g[0], gC: g[1] }); });
    t.near(CM.price(clones, true).total, 0, 1e-12, 'equal shares with every droplet a clone: producers stay exactly where they were');
    t.ok(CM.price(clones, false).total > 0.2, 'the same clone droplets pooled by growth: producers rise');
  }

  /* ---------- structure and relatedness: random even splits of 32 cells, through the sim's own split ---------- */
  const roundBy = (p, k, local) => {   // one round from flask share p with droplets of k founders, split by the sim
    S.s = S.fresh(2); S.s.p = p; S.s.local = !!local; S.load(S.s); S.s.phase = 'split';
    const ev = []; while (S.s.drops.length < 32 / k) { let bi = 0; S.s.drops.forEach((d, i) => { if (d.cells.length > S.s.drops[bi].cells.length) bi = i; }); S.split(S.s, bi, ev); }
    S.grow(S.s, ev); const pr = S.priceNow(S.s); return pr.total;
  };
  { G.reset(2, 3); const reps = N(400), out = {};
    for (const p of [0.25, 0.5]) for (const k of [32, 16, 8, 4, 2, 1]) { let s = 0; for (let i = 0; i < reps; i++) s += roundBy(p, k); out[p + '_' + k] = s / reps; }
    const f = x => (x >= 0 ? '+' : '') + x.toFixed(3);
    t.ok(out['0.25_32'] < 0 && out['0.5_32'] < 0, `one unsplit droplet: producers fall (${f(out['0.25_32'])}, ${f(out['0.5_32'])})`);
    t.ok(out['0.25_16'] < 0 && out['0.5_16'] < 0, `16 founders (r = 1/16, r·b = 0.075 < c): producers fall (${f(out['0.25_16'])}, ${f(out['0.5_16'])})`);
    t.ok(Math.abs(out['0.25_8']) < 0.04 && Math.abs(out['0.5_8']) < 0.04, `8 founders (r·b = c): near break-even (${f(out['0.25_8'])}, ${f(out['0.5_8'])})`);
    t.ok(out['0.25_4'] > 0 && out['0.5_4'] > 0, `4 founders (r·b = 0.3 > c): producers rise (${f(out['0.25_4'])}, ${f(out['0.5_4'])})`);
    t.ok(out['0.25_1'] > out['0.25_2'] && out['0.25_2'] > out['0.25_4'], 'fewer founders, faster rise (1 > 2 > 4 founders)');
    let l1 = 0; for (let i = 0; i < 20; i++) l1 += Math.abs(roundBy(0.5, 1, true)); t.ok(l1 < 1e-12, 'equal shares with single-cell droplets: no change at all');
    let l4 = 0; for (let i = 0; i < reps; i++) l4 += roundBy(0.5, 4, true); t.ok(l4 / reps < -0.03, `equal shares with 4 founders: producers fall (${f(l4 / reps)}): relatives compete with relatives`);
  }

  /* ---------- relatedness measured from the droplets (the r the player sees in L3) ---------- */
  { const mk = (cells, sizes) => { const out = []; let i = 0; for (const n of sizes) { let P = 0; for (let j = 0; j < n; j++) P += cells[i++]; out.push({ n, P }); } return out; };
    const sh = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; };
    const base = () => { const a = []; for (let i = 0; i < 32; i++) a.push(i < 12 ? 1 : 0); return a; };
    t.near(CM.rel(mk(base(), [32])), 0, 1e-12, 'r = 0 for one droplet holding the whole sample');
    t.near(CM.rel(mk(base(), new Array(32).fill(1))), 1, 1e-12, 'r = 1 when every droplet is a single cell (a clone)');
    t.ok(CM.rel([{ n: 4, P: 4 }, { n: 4, P: 4 }]) === null, 'r is undefined (null) when only producers are left');
    for (const k of [2, 4, 8]) { let m = 0; const reps = N(2000); for (let i = 0; i < reps; i++) m += CM.rel(mk(sh(base()), new Array(32 / k).fill(k))); m /= reps; const ex = (32 / k - 1) / 31;
      t.near(m, ex, 0.02, `random droplets of ${k} founders: mean r = ${m.toFixed(3)} ≈ (32/k − 1) ÷ 31 = ${ex.toFixed(3)}, close to 1 ÷ ${k}`); }
    let agree = 0, n = 0;
    for (let i = 0; i < N(3000); i++) {   // random uneven splits: does r × b > c call the sign of the change?
      const nP = [3, 10, 16, 22][i % 4], cells = []; for (let j = 0; j < 32; j++) cells.push(j < nP ? 1 : 0); sh(cells);
      let sizes = [32]; const want = 1 + Math.floor(rnd() * 31); while (sizes.length < want) { const j = Math.floor(rnd() * sizes.length); if (sizes[j] < 2) { if (sizes.every(x => x < 2)) break; continue; } const a = sizes[j] >> 1; sizes.splice(j, 1, a, sizes[j] - a); }
      const ds = mk(cells, sizes).map(d => { const g = CM.grow(d.P, d.n - d.P, b, c, Gn); return Object.assign(d, { gP: g[0], gC: g[1] }); }), tot = CM.price(ds, false).total, r = CM.rel(ds);
      if (Math.abs(tot) < 0.005 || r == null) continue; n++; if ((r * b > c) === (tot > 0)) agree++;
    }
    t.ok(agree / n > 0.95, `Hamilton's rule with the measured r calls the sign of the change in ${(100 * agree / n).toFixed(1)}% of ${n} random splits (strong selection: not exact)`);
  }

  /* ---------- the sample leaves the flask with exactly round(n·p) producers ---------- */
  { let ok = true; for (const p of [0.1, 0.33, 0.5, 0.6, 0.97]) { G.reset(2, 5); S.s.p = p; S.load(S.s); if (S.count(S.s.drops[0]) !== Math.round(32 * p)) ok = false; } t.ok(ok, 'each sample holds exactly round(32·p) producers (no sampling noise; the randomness is in the splits)'); }

  /* ---------- the L2 call is scored against the model ---------- */
  { let agree = 0, n = 0;
    for (let sd = 1; sd <= N(40); sd++) {
      const r = G.run(1, { seed: sd, bot: 'expert' }), h = r.s.hist[0]; n++;
      if (r.s.pred.p1 === (h.total > 0 ? 1 : -1) && (r.result.mask & 2)) agree++;
    }
    t.eq(agree, n, `L2: the expert's call matches the model's own outcome and earns Predict (${agree}/${n})`);
    const a = G.run(1, { seed: 3, bot: 'alwaysB' }); t.ok(a.s.hist[0].nd === 1 && a.s.hist[0].total < 0 && !(a.result.mask & 2), 'L2: one unsplit droplet falls, so "more" misses');
  }

  /* ---------- determinism and snapshot replay ---------- */
  for (let lv = 0; lv < 4; lv++) {
    const a = G.run(lv, { seed: 11, bot: 'expert' }), b2 = G.run(lv, { seed: 11, bot: 'expert' });
    t.eq(a.s, b2.s, `L${lv + 1}: the same seed and actions give the same final state`);
    G.reset(lv, 12); const pol = G.bot('expert'), rr = () => 0.5; let ticks = 0, snap = null, at = 0;
    while (!S.result() && ticks < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rr); if (x) { S.s.log.push([ticks, x]); S.act(x); } } S.step(S.dt); ticks++; if (ticks === 60) { snap = S.snapshot(); at = ticks; } }
    const end = JSON.stringify(S.s); S.restore(snap); let k = at;
    while (!S.result() && k < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rr); if (x) { S.s.log.push([k, x]); S.act(x); } } S.step(S.dt); k++; }
    t.ok(JSON.stringify(S.s) === end, `L${lv + 1}: a snapshot at tick 60 restores and replays to the same end`);
  }

  /* ---------- What if? thaws ---------- */
  for (let lv = 0; lv < 4; lv++) for (const lever of LV[lv].levers) {
    const r = G.run(lv, { seed: 21, bot: 'expert' }), snap = S.snapshot(); S.reset(lv, { thaw: { snap, lever } }); let k = 0;
    while (!S.result() && k < 30000) { S.step(S.dt); k++; }
    const res = S.result(); t.ok(res && res.mask === 0 && S.s.auto && S.s.hist.length === LV[lv].rounds, `L${lv + 1} What if? "${lever}": the automatic rerun ends (producers ${Math.round(r.s.p * 100)}% → ${res ? Math.round(S.s.p * 100) : '?'}%) and earns no stars`);
    if (lever === 'equal') t.ok(S.s.p < r.s.p, 'L3 What if? equal shares: the same experiment ends with fewer producers');
    if (lever === 'growth') t.ok(S.s.p > r.s.p + 0.1, 'L4 What if? pooled by growth: the same clones raise producers');
    if (lever === 'clones' && lv === 0) t.ok(S.s.p > 0.9, 'L1 What if? single cells: clone droplets take producers above 90%');
  }

  /* ---------- stars: per level, the expert, the bots ---------- */
  const offers = [1, 2, 1, 4], seeds = N(20), bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold'];
  for (let lv = 0; lv < 4; lv++) {
    let all = 0; for (let sd = 1; sd <= seeds; sd++) { const r = G.run(lv, { seed: sd, bot: 'expert' }); if ((r.result.mask & offers[lv]) === offers[lv]) all++; }
    t.ok(all === seeds, `L${lv + 1}: the expert earns the level's star on ${all}/${seeds} seeds`);
  }
  const union = {}; for (const bt of bots) union[bt] = [];
  for (let sd = 1; sd <= seeds; sd++) for (const bt of bots) {
    const masks = [0, 1, 2, 3].map(lv => { const r = G.run(lv, { seed: sd, bot: bt }); if (r.capped) throw new Error(bt + ' capped at L' + (lv + 1)); if ((r.result.mask & ~offers[lv]) !== 0) throw new Error('L' + (lv + 1) + ' awarded a star it does not offer'); return r.result.mask; });
    union[bt].push(ch.unitStars(masks));
  }
  for (const bt of bots) { const best = Math.max(...union[bt].map(m => (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1))); t.ok(best < 3, `bot ${bt}: best union across the unit is ${best} star(s) of 3`); }
  { let th = 0; for (let sd = 1; sd <= seeds; sd++) if (G.run(2, { seed: sd, bot: 'threshold' }).result.mask & 1) th++; t.ok(th === 0, `L3: just meeting Hamilton's rule (4 founders) is too slow for 75% in three rounds (${th}/${seeds})`); }
  { let gr = 0; for (let sd = 1; sd <= seeds; sd++) if (G.run(3, { seed: sd, bot: 'threshold' }).result.mask & 4) gr++; t.ok(gr === 0, `L4: 4-founder droplets lose producers under equal shares (${gr}/${seeds} hold)`); }

  /* ---------- Interesting texts quote their own run ---------- */
  { const r = G.run(0, { seed: 4, bot: 'alwaysB' }), iv = S.iVars(r.s), h = r.s.hist[0];
    t.ok(r.result.interesting === 'whole' && iv.d === Math.round(Math.abs(h.total) * 100) && iv.r === 1, `L1 "whole": round ${iv.r}, producers fell ${iv.d} points, as the run did`);
    let quiet = 0, paraN = 0, fellOk = 0, fellN = 0, flatOk = 0, flatN = 0;
    for (let sd = 1; sd <= N(20); sd++) {   // L2: the paradox keeps its take (no Interesting); a fall or two mixed droplets say so
      const e = G.run(1, { seed: sd, bot: 'expert' }), h = e.s.hist[0]; if (h.total > 0 && h.fell > 0) { paraN++; if (e.result.interesting === null) quiet++; } else if (!h.mixed && e.result.interesting === 'sorted') quiet++, paraN++;
      const g2 = G.run(1, { seed: sd, bot: 'alwaysB' }), hg = g2.s.hist[0]; flatN++; if (g2.result.interesting === 'flat' && hg.nd <= 2 && hg.mixed === hg.nd) flatOk++;
      const th = G.run(1, { seed: sd, bot: 'threshold' }), ht = th.s.hist[0]; if (ht.nd > 2 && ht.total <= 0) { fellN++; if (th.result.interesting === 'fell') fellOk++; }
    }
    t.ok(quiet === paraN && paraN >= N(20) - 2, `L2: when producers fall inside yet rise overall the paradox take shows, not an Interesting text; all-clone droplets say "sorted" (${quiet}/${paraN})`);
    t.eq(flatOk, flatN, `L2 "flat": one or two mixed droplets are named as such (${flatOk}/${flatN})`);
    t.eq(fellOk, fellN, `L2 "fell": an overall fall with small droplets is named (${fellOk}/${fellN})`);
    const r3 = G.run(2, { seed: 4, bot: 'threshold' }), iv3 = S.iVars(r3.s), h3 = S.slowRound(r3.s.hist);
    t.ok(r3.result.interesting === 'slow' && h3 && h3.pa <= 0.8 && iv3.k >= 4 && iv3.d === (h3.total >= 0 ? '+' : '−') + Math.round(Math.abs(h3.total) * 100), `L3 "slow": droplets of ${iv3.k} founders, producers changed by ${iv3.d} points from ${Math.round(h3 ? h3.pa * 100 : 0)}%`);
    let ceil = 0; for (let sd = 1; sd <= N(20); sd++) { const e = G.run(2, { seed: sd, bot: 'expert' }); const hs = S.slowRound(e.s.hist); if (hs && hs.pa > 0.8) ceil++; }
    t.eq(ceil, 0, 'L3 "slow" never blames big droplets for a small change near 100% (no headroom)');
    const r4 = G.run(3, { seed: 4, bot: 'greedy' }), iv4 = S.iVars(r4.s);
    t.ok(r4.result.interesting === null || iv4.d === Math.round((r4.s.p0 - r4.s.p) * 100), 'L4 "mixed": the loss quoted is the run\'s own');
    const r5 = G.run(3, { seed: 4, bot: 'threshold' }), iv5 = S.iVars(r5.s);
    t.ok(r5.result.interesting === 'mixed' && iv5.d === Math.round((r5.s.p0 - r5.s.p) * 100) && iv5.d >= 1, `L4 "mixed": mixed droplets cost ${iv5.d} points`);
  }
};
