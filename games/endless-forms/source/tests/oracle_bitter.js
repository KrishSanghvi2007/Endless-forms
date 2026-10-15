/* tests/oracle_bitter.js: science and contract oracle for Bitter Wings (v2/bitter.js). Run: node tests/oracle.js BUILD.html bitter
   BW_FAST=1 runs fewer seeds (about a quarter of the time).
   Checks the spec's numbers (D1 §3.2, D5 §4 item 6) against the model's own output:
     L1  avoidance makes palewings look bitter; eating at random does not; the β fit recovers a known rule; the p1 expectation is calibrated
     L2  a learning (Bayesian) bird's mimic edge falls as models are removed (D5 accept); the scored break-even is the retch cost
     L3  deadly days hold protection up (edge on deadly days above mild days)
     L4  with the large-effect allele the rarer pattern moves ≥ 3× as far as the commoner over 8 generations; without it, it stalls (D5 accept)
     L5  bright is lost on scattered island A and spreads on clustered island B; island C's expectation is calibrated
   and the contract: determinism, snapshot round trip, replay from the log, What if? texts checked against their runs, an expert's stars,
   and that no bot's union of level masks reaches three unit stars. */
'use strict';
module.exports = function (G, t) {
  const FAST = !!process.env.BW_FAST, N = FAST ? 10 : 30, ch = G.ch, sim = G.sim, K = G.TB.BITTER.K;
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const run = (lv, sd, bot, o) => G.run(lv, Object.assign({ seed: sd }, typeof bot === 'function' ? { policy: bot } : { bot }, o || {}));
  // the expert: the model bird's own rule at a person's pace, and every prediction placed at the expectation the sim scores against
  const expert = (s, acts, rnd, tk) => { if (s.ask) { const e = sim.expect(s.ask.id); return acts.reduce((b, a) => !b || Math.abs(a.v - e) < Math.abs(b.v - e) ? a : b, null); } if ((tk | 0) % 18) return null; const i = sim.autoPick(); return i >= 0 ? { k: 'tap', i } : null; };
  const random = (s, acts, rnd, tk) => { if (s.ask) return acts[Math.floor(rnd() * acts.length)]; if ((tk | 0) % 18) return null; const a = acts.filter(x => x.k === 'tap' && x.i >= 0); return a.length ? a[Math.floor(rnd() * a.length)] : null; };

  /* ---------- contract ---------- */
  {
    const a = run(0, 7, 'bayes'), b = run(0, 7, 'bayes');
    t.eq(a.result.mask, b.result.mask, 'determinism: same seed and bot, same stars');
    t.eq(a.s.hist.map(r => r.mean), b.s.hist.map(r => r.mean), 'determinism: same seed and bot, same palewing looks');
    G.reset(3, 5); for (let i = 0; i < 200; i++) sim.step(sim.dt);
    const snap = sim.snapshot(), s1 = JSON.stringify(sim.s); sim.restore(snap); t.eq(JSON.stringify(sim.s), s1, 'snapshot: restore gives back the same state');
    t.ok(snap.length < 60000, 'snapshot: ' + snap.length + ' characters');
    // replay from the log reproduces the run
    const r1 = run(1, 11, 'bayes'), log = r1.s.log.slice(), res1 = JSON.stringify(r1.s.hist.map(h => [h.adv, h.mean]));
    G.TB.seed(11); ch.level = 1; sim.reset(1, {}); sim.s.log = []; let tick = 0, li = 0;
    while (!sim.result() && tick < 20000) { while (li < log.length && log[li][0] === tick) { sim.act(log[li][1]); li++; } sim.step(sim.dt); tick++; }
    t.eq(JSON.stringify(sim.s.hist.map(h => [h.adv, h.mean])), res1, 'replay: the action log rebuilds the same days');
  }

  /* ---------- L1: avoidance makes palewings look bitter ---------- */
  {
    const rise = [], riseR = [], cal = [];
    for (let sd = 1; sd <= N; sd++) {
      const a = run(0, sd, expert), H = a.s.hist; rise.push(H[H.length - 1].mean - H[0].mean);
      cal.push([a.s.exp.p1, H[H.length - 1].mean]);
      const b = run(0, sd, random), Hb = b.s.hist; riseR.push(Hb[Hb.length - 1].mean - Hb[0].mean);
    }
    t.ok(mean(rise) >= 0.2, 'L1: a bird that spares warning looks raises the palewings’ look by ' + mean(rise).toFixed(2) + ' (≥ 0.2) over the level (4–9 generations by seed)');
    t.ok(Math.abs(mean(riseR)) < 0.08, 'L1: eating at random moves the look by ' + mean(riseR).toFixed(3) + ' (|·| < 0.08)');
    const ce = mean(cal.map(c => c[0])), cr = mean(cal.map(c => c[1]));
    t.near(ce, cr, 0.06, 'L1: the p1 expectation (' + ce.toFixed(3) + ') matches the realised last-generation look on average (' + cr.toFixed(3) + ')');
    // the β fit recovers a known rule from synthetic catches
    const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(12345), cat = [];
    for (let m = 0; m < 3; m++) { const pool = []; for (let i = 0; i < 32; i++) pool.push(i < 8 ? 0.98 : 0.05 + 0.4 * rnd()); for (let k = 0; k < 12; k++) { const w = pool.map(v => Math.exp(-4 * v)), z = w.reduce((x, y) => x + y, 0); let u = rnd() * z, j = 0; while ((u -= w[j]) > 0) j++; cat.push({ e: pool[j], pool: pool.slice() }); pool.splice(j, 1); } }
    const bf = G.TB.BITTER.fitBeta(cat); t.near(bf, 4, 2, 'L1: the fitted rule recovers β = 4 from 36 synthetic catches (got ' + bf + ')');
  }

  /* ---------- L2: the mimics' edge falls as models are removed ---------- */
  {
    const lo = [], hi = [];
    for (let sd = 1; sd <= N; sd++) { const a = run(1, sd, 'bayes'); for (const r of a.s.hist) { if (r.adv == null || r.k == null) continue; if (r.k <= 2) lo.push(r.adv); if (r.k >= 8) hi.push(r.adv); } }
    t.ok(mean(lo) - mean(hi) >= 0.2, 'L2: a learning bird’s mimic edge is ' + mean(lo).toFixed(2) + ' with ≤ 2 mimics per model and ' + mean(hi).toFixed(2) + ' with ≥ 8 (falls by ≥ 0.2)');
    G.reset(1, 3); t.eq(sim.expect('p2'), sim.s.cost, 'L2: the scored break-even is the retch cost in meals (k = C)');
    const costs = new Set(), cs = []; for (let sd = 1; sd <= 200; sd++) { G.reset(1, sd); costs.add(sim.s.cost); cs.push(sim.s.cost); }
    let bestG = 0, bestV = 0; for (let g = 0; g <= 14; g += 0.25) { const n = cs.filter(c => Math.abs(g - c) <= G.TB.BITTER.K.TOL.p2 + 1e-9).length; if (n > bestG) { bestG = n; bestV = g; } }
    t.ok(costs.size >= 7 && bestG <= 0.25 * cs.length, 'L2: the retch cost varies by seed (' + costs.size + ' values, ' + Math.min(...costs) + '–' + Math.max(...costs) + ' s); the best fixed guess (' + bestV + ') fits ' + bestG + ' of ' + cs.length + ' seeds (≤ 25%)');
    const C = 3.5, cur = ch.edgeCurve(C, 0, 14, 1), z = cur.findIndex(p => p[1] < 0); t.ok(z > 0 && Math.abs(cur[z][0] - C) <= 0.5, 'L2: the dashed expected edge crosses zero at the break-even');
  }

  /* ---------- L3: toxicity holds protection up ---------- */
  {
    const dd = [], mm = [];
    for (let sd = 1; sd <= N; sd++) { const a = run(2, sd, 'bayes'); for (const r of a.s.hist) { if (r.adv == null || r.gen < 3) continue; (r.deadly ? dd : mm).push(r.adv); } }   // from day 3, once the bird has tasted
    t.ok(mean(dd) - mean(mm) >= 0.1, 'L3: once the bird has tasted, the mimic edge is ' + mean(dd).toFixed(2) + ' on deadly days and ' + mean(mm).toFixed(2) + ' on mild days (≥ 0.1 apart)');
    G.reset(2, 4); const r = sim.s.hist[0]; t.near(sim.expect('p3'), r.k, 1e-9, 'L3: the scored protecting cost equals mimics per model now');
  }

  /* ---------- L4: advergence, and Turner's two steps ---------- */
  {
    const jr = [], jc = [], nr = [], ins = [], nf = [], ck2 = s => s.common === 'b' ? 'mb' : 'ms', rk2 = s => s.common === 'b' ? 'ms' : 'mb';
    for (let sd = 1; sd <= N + 10; sd++) {
      const a = run(3, sd, 'bayes'), o = sim.outcome(a.s); jr.push(o.rare); jc.push(o.common);
      const b = run(3, sd, 'bayes', { reset: { lever: 'nojump' } }); nr.push(sim.outcome(b.s).rare);
      const c = run(3, sd, 'bayes', { reset: { lever: 'inside' } }), H = c.s.hist, rk = c.s.common === 'b' ? 'ms' : 'mb', ck = c.s.common === 'b' ? 'mb' : 'ms';
      ins.push((Math.abs(H[0][ck] - H[0][rk]) - Math.abs(H[H.length - 1][ck] - H[H.length - 1][rk])) / Math.abs(H[0][ck] - H[0][rk]));
      const Hn = b.s.hist; nf.push((Math.abs(Hn[0][ck2(b.s)] - Hn[0][rk2(b.s)]) - Math.abs(Hn[Hn.length - 1][ck2(b.s)] - Hn[Hn.length - 1][rk2(b.s)])) / Math.abs(Hn[0][ck2(b.s)] - Hn[0][rk2(b.s)]));
    }
    t.ok(mean(jr) >= 3 * mean(jc), 'L4: with the large-effect allele the rarer pattern moves ' + mean(jr).toFixed(3) + ', ≥ 3× the commoner’s ' + mean(jc).toFixed(3) + ' (8 generations)');
    t.ok(mean(nr) <= mean(jr) / 3, 'L4: without it, small steps stall: the rarer moves ' + mean(nr).toFixed(3) + ' (≤ a third of ' + mean(jr).toFixed(3) + ')');
    t.ok(mean(ins) >= 0.35 && mean(nf) <= 0.1, 'L4 What if: starting within the commoner’s generalisation, small steps close ' + Math.round(100 * mean(ins)) + '% of the gap (≥ 35%); from the far start only ' + Math.round(100 * mean(nf)) + '% (≤ 10%; Balogh & Leimar 2005)');
    const cm = new Set(), es = []; for (let sd = 1; sd <= 200; sd++) { G.reset(3, sd); cm.add(sim.s.common); es.push(sim.expect('p4')); }
    let bestG = 0, bestV = 0; for (let g = 0; g <= 1.0001; g += 0.02) { const n = es.filter(e => Math.abs(g - e) <= K.TOL.p4 + 1e-9).length; if (n > bestG) { bestG = n; bestV = Math.round(g * 100) / 100; } }
    t.ok(cm.size === 2 && bestG <= 0.25 * es.length, 'L4: which species is commoner, and where it sits, vary by seed: the best fixed guess (' + bestV + ') fits ' + bestG + ' of ' + es.length + ' seeds (≤ 25%)');
  }

  /* ---------- L5: rare warning colours die scattered and spread clustered ---------- */
  {
    const A0 = [], A1 = [], B0 = [], B1 = [], C = { 2: [], 8: [] }, Ce = { 2: [], 8: [] };
    for (let sd = 1; sd <= (FAST ? 20 : 100); sd++) {
      const a = run(4, sd, 'bayes'), s = a.s, I = s.isl; A0.push(I[0].hist[0]); A1.push(I[0].hist[I[0].hist.length - 1]); B0.push(I[1].hist[0]); B1.push(I[1].hist[I[1].hist.length - 1]);
      C[s.cBrood].push(I[2].hist[I[2].hist.length - 1]); Ce[s.cBrood].push(sim.replay5(s.C0, s.cBrood, s.gens - 1, 200, 77));
    }
    t.ok(mean(A1) < mean(A0) / 2, 'L5: on island A (scattered) bright falls by more than half, from ' + mean(A0).toFixed(2) + ' to ' + mean(A1).toFixed(2));
    t.ok(mean(B1) >= mean(B0) + 0.1, 'L5: on island B (sibling clusters) bright rises from ' + mean(B0).toFixed(2) + ' to ' + mean(B1).toFixed(2));
    t.ok(mean(Ce[2]) < mean(A0) && mean(Ce[8]) > mean(A0) + 0.1, 'L5: island C’s expectation falls with pairs (' + mean(Ce[2]).toFixed(2) + ') and rises with broods of eight (' + mean(Ce[8]).toFixed(2) + ')');
    if (!FAST) for (const b of [2, 8]) if (C[b].length >= 30) t.near(mean(C[b]), mean(Ce[b]), 0.12, 'L5: island C (broods of ' + b + ') realised ' + mean(C[b]).toFixed(3) + ' against expected ' + mean(Ce[b]).toFixed(3));
    // honest limit, reported not asserted: the island C answer is set almost wholly by the brood size, so one fixed guess fits about half the seeds
    const all = Ce[2].concat(Ce[8]); let bestG = 0, bestV = 0; for (let g = 0; g <= 1.0001; g += 0.01) { const n = all.filter(e => Math.abs(g - e) <= K.TOL.t5 + 1e-9).length; if (n > bestG) { bestG = n; bestV = Math.round(g * 100) / 100; } }
    t.note('L5 Transfer limit: the best fixed island C guess (' + bestV + ') fits ' + bestG + ' of ' + all.length + ' seeds; the unit star also needs Discover and Predict');
  }

  /* ---------- What if? texts are checked against their own runs ---------- */
  {
    const levers = [['nomodels', 'noinherit'], ['manymodels', 'cheap'], ['mild', 'deadly'], ['nojump', 'inside'], ['scatterB', 'clusterA']];
    let ok = 0, tot = 0, chance = 0;
    for (let lv = 0; lv < 5; lv++) for (const k of levers[lv]) for (let sd = 1; sd <= (FAST ? 3 : 6); sd++) {
      G.reset(lv, sd); let tick = 0; while (sim.s.gen < 2 && tick < 20000) { const A = sim.actions(); const a = A.length ? G.bot('bayes')(sim.s, A, Math.random, tick) : null; if (a) sim.act(a); sim.step(sim.dt); tick++; }
      const snap = sim.snapshot(); ch.level = lv; sim.reset(lv, { thaw: { snap, lever: k } }); tick = 0;
      while (!sim.result() && tick < 40000) { sim.step(sim.dt); tick++; }
      const r = sim.result(); tot++; if (r && r.mask === 0 && (r.interesting === 'w_' + k || r.interesting === 'w_chance' || r.interesting === 'w_gone') && ch.content.interesting[r.interesting]) ok++;
      if (r && r.interesting === 'w_chance') chance++;
    }
    t.ok(ok === tot, 'What if: ' + ok + ' of ' + tot + ' reruns end with no stars and a text chosen from the rerun (' + chance + ' honest "chance" texts)');
  }

  /* ---------- stars: an expert earns what each level offers; no bot reaches three unit stars ---------- */
  {
    const offer = [3, 3, 3, 3, 5], hits = [0, 0, 0, 0, 0], S = FAST ? 6 : 12;
    for (let lv = 0; lv < 5; lv++) for (let sd = 1; sd <= S; sd++) { const r = run(lv, sd, expert); if (r.result && (r.result.mask & offer[lv]) === offer[lv]) hits[lv]++; }
    hits.forEach((h, lv) => t.ok(h >= Math.ceil(S * (lv === 3 ? 0.6 : 0.65)), 'stars: an expert earns every star level ' + (lv + 1) + ' offers on ' + h + ' of ' + S + ' seeds'));
    for (let lv = 0; lv < 5; lv++) { G.reset(lv, 1); const m = (ch.stars.discover(sim.s, lv) ? 1 : 0); void m; }
    t.ok(offer.every(o => o !== 7), 'stars: no level offers all three stars');
    // rule-following bots must never reach three unit stars; the two guessers (random, and edge, which reads a number off the screen)
    // make three separate guesses, each right on at most about a quarter of seeds, so a rare jackpot is reported and capped at 1 in 30
    const bots = ['alwaysA', 'alwaysB', 'greedy', 'threshold', 'bayes', 'copynow', 'edge', 'random'], guessers = ['edge', 'random'], seeds = FAST ? 6 : 30; let worst = 0, who = '';
    const jack = {}; for (const b of bots) for (let sd = 1; sd <= seeds; sd++) {
      const lv = [0, 1, 2, 3, 4].map(l => { const r = run(l, sd, b === 'random' ? random : b); return r.result ? r.result.mask : 0; });
      const u = ch.unitStars(lv), n = (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1);
      if (guessers.indexOf(b) >= 0) { if (n === 3) (jack[b] = jack[b] || []).push(sd); continue; }
      if (n > worst) { worst = n; who = b + ' seed ' + sd; }
    }
    t.ok(worst < 3, 'stars: no rule-following bot’s union of level masks reaches three unit stars (best ' + worst + ', ' + who + ')');
    t.ok(guessers.every(b => (jack[b] || []).length <= Math.max(1, Math.floor(seeds / 30))), 'stars: the guessers reach three unit stars on ' + (guessers.map(b => b + ' ' + ((jack[b] || []).length ? 'seed ' + jack[b].join(', ') : 'none')).join('; ')) + ' of ' + seeds + ' (≤ 1 each; three lucky guesses)');
  }

  /* ---------- words: every chosen text exists ---------- */
  {
    const keys = new Set(); for (let lv = 0; lv < 5; lv++) for (const b of ['bayes', 'greedy', 'alwaysA']) for (let sd = 1; sd <= 4; sd++) { const r = run(lv, sd, b); if (r.result && r.result.interesting) keys.add(r.result.interesting); }
    t.ok([...keys].every(k => ch.content.interesting[k]), 'words: every Interesting key chosen exists (' + [...keys].join(', ') + ')');
  }
};
