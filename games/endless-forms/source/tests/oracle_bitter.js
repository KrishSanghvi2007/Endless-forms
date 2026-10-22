/* tests/oracle_bitter.js: science and contract oracle for Bitter Wings (v2/bitter.js). Run: node tests/oracle.js BUILD.html bitter
   BW_FAST=1 runs fewer seeds (about a quarter of the time).
   D6 decision 9: four levels (level numbers 0–3 run model kinds 0, 1, 3, 4) and one prediction (L3's meeting point).
   Checks the spec's numbers (D1 §3.2, D5 §4 item 6) against the model's own output:
     L1  avoidance makes palewings look bitter; eating at random does not
     L2  a learning (Bayesian) bird's mimic edge falls as models are removed (D5 accept); the HUD's key line k > C matches the day
     L3  with the large-effect allele the rarer pattern moves ≥ 3× as far as the commoner over 8 generations; without it, it stalls (D5 accept);
         the dusk line's counts (n ÷ N) match the young birds' kills
     L4  bright is lost on scattered island A and spreads on clustered island B; the learner's Transfer path works
   and the contract: determinism, snapshot round trip, replay from the log, What if? texts checked against their runs, an expert's stars,
   and that no bot's union of level masks reaches three unit stars. */
'use strict';
module.exports = function (G, t) {
  const FAST = !!process.env.BW_FAST, N = FAST ? 10 : 30, ch = G.ch, sim = G.sim, K = G.TB.BITTER.K;
  const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  const run = (lv, sd, bot, o) => G.run(lv, Object.assign({ seed: sd }, typeof bot === 'function' ? { policy: bot } : { bot }, o || {}));
  // the expert: the model bird's own rule at a person's pace, and every prediction placed at the expectation the sim scores against
  const expert = (s, acts, rnd, tk) => { if (s.kd === 4) return sim.bots.learner(s, acts, rnd, tk); if (s.ask) { const e = sim.expect(s.ask.id); return acts.reduce((b, a) => !b || Math.abs(a.v - e) < Math.abs(b.v - e) ? a : b, null); } if ((tk | 0) % 18) return null; const i = sim.autoPick(); return i >= 0 ? { k: 'tap', i } : null; };
  const random = (s, acts, rnd, tk) => { if (s.ask) return acts[Math.floor(rnd() * acts.length)]; if ((tk | 0) % 18) return null; const a = acts.filter(x => x.k === 'tap' && x.i >= 0); return a.length ? a[Math.floor(rnd() * a.length)] : null; };

  /* ---------- contract ---------- */
  {
    const a = run(0, 7, 'bayes'), b = run(0, 7, 'bayes');
    t.eq(a.result.mask, b.result.mask, 'determinism: same seed and bot, same stars');
    t.eq(a.s.hist.map(r => r.mean), b.s.hist.map(r => r.mean), 'determinism: same seed and bot, same palewing looks');
    G.reset(2, 5); for (let i = 0; i < 200; i++) sim.step(sim.dt);
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
    const rise = [], riseR = [];
    for (let sd = 1; sd <= N; sd++) {
      const a = run(0, sd, expert), H = a.s.hist; rise.push(H[H.length - 1].mean - H[0].mean);
      const b = run(0, sd, random), Hb = b.s.hist; riseR.push(Hb[Hb.length - 1].mean - Hb[0].mean);
    }
    t.ok(mean(rise) >= 0.2, 'L1: a bird that spares warning looks raises the palewings’ look by ' + mean(rise).toFixed(2) + ' (≥ 0.2) over the level (6 generations)');
    t.ok(Math.abs(mean(riseR)) < 0.08, 'L1: eating at random moves the look by ' + mean(riseR).toFixed(3) + ' (|·| < 0.08)');
  }

  /* ---------- L2: the mimics' edge falls as models are removed ---------- */
  {
    const lo = [], hi = [];
    for (let sd = 1; sd <= N; sd++) { const a = run(1, sd, 'bayes'); for (const r of a.s.hist) { if (r.adv == null || r.k == null) continue; if (r.k <= 2) lo.push(r.adv); if (r.k >= 8) hi.push(r.adv); } }
    t.ok(mean(lo) - mean(hi) >= 0.2, 'L2: a learning bird’s mimic edge is ' + mean(lo).toFixed(2) + ' with ≤ 2 mimics per model and ' + mean(hi).toFixed(2) + ' with ≥ 8 (falls by ≥ 0.2)');
    const costs = new Set(); for (let sd = 1; sd <= 60; sd++) { G.reset(1, sd); costs.add(sim.s.cost); }
    t.ok(costs.size >= 4 && Math.min(...costs) >= 2 && Math.max(...costs) <= 4, 'L2: the retch cost C varies by seed (' + [...costs].sort().join(', ') + ' s), so the break-even k = C moves');
    const C = 3.5, cur = ch.edgeCurve(C, 0, 14, 1), z = cur.findIndex(p => p[1] < 0); t.ok(z > 0 && Math.abs(cur[z][0] - C) <= 0.5, 'L2: the dashed expected edge crosses zero at the break-even');
    // the HUD's key line says "tasting pays" exactly when today's k exceeds C
    const a = run(1, 4, 'bayes'); let okk = 0, nk = 0; ch.level = 1;
    for (const r of a.s.hist) { if (r.k == null) continue; nk++; const fake = Object.assign({}, a.s, { hist: [r] }), line = ch.kcLine(fake), pays = r.k > a.s.cost; if (line.indexOf(pays ? 'tasting pays' : 'sparing pays') >= 0) okk++; }
    t.ok(nk > 0 && okk === nk, 'L2: the key line (k > C) reads "tasting pays" exactly on the ' + okk + ' of ' + nk + ' days when k > C');
  }

  /* ---------- L3 (kind 3): advergence, and Turner's two steps ---------- */
  {
    const jr = [], jc = [], nr = [], ins = [], nf = [], ck2 = s => s.common === 'b' ? 'mb' : 'ms', rk2 = s => s.common === 'b' ? 'ms' : 'mb';
    for (let sd = 1; sd <= N + 10; sd++) {
      const a = run(2, sd, 'bayes'), o = sim.outcome(a.s); jr.push(o.rare); jc.push(o.common);
      const b = run(2, sd, 'bayes', { reset: { lever: 'nojump' } }); nr.push(sim.outcome(b.s).rare);
      const c = run(2, sd, 'bayes', { reset: { lever: 'inside' } }), H = c.s.hist, rk = c.s.common === 'b' ? 'ms' : 'mb', ck = c.s.common === 'b' ? 'mb' : 'ms';
      ins.push((Math.abs(H[0][ck] - H[0][rk]) - Math.abs(H[H.length - 1][ck] - H[H.length - 1][rk])) / Math.abs(H[0][ck] - H[0][rk]));
      const Hn = b.s.hist; nf.push((Math.abs(Hn[0][ck2(b.s)] - Hn[0][rk2(b.s)]) - Math.abs(Hn[Hn.length - 1][ck2(b.s)] - Hn[Hn.length - 1][rk2(b.s)])) / Math.abs(Hn[0][ck2(b.s)] - Hn[0][rk2(b.s)]));
    }
    t.ok(mean(jr) >= 3 * mean(jc), 'L3: with the large-effect allele the rarer pattern moves ' + mean(jr).toFixed(3) + ', ≥ 3× the commoner’s ' + mean(jc).toFixed(3) + ' (8 generations)');
    t.ok(mean(nr) <= mean(jr) / 3, 'L3: without it, small steps stall: the rarer moves ' + mean(nr).toFixed(3) + ' (≤ a third of ' + mean(jr).toFixed(3) + ')');
    t.ok(mean(ins) >= 0.35 && mean(nf) <= 0.1, 'L3 What if: starting within the commoner’s generalisation, small steps close ' + Math.round(100 * mean(ins)) + '% of the gap (≥ 35%); from the far start only ' + Math.round(100 * mean(nf)) + '% (≤ 10%; Balogh & Leimar 2005)');
    const cm = new Set(), es = []; for (let sd = 1; sd <= 200; sd++) { G.reset(2, sd); cm.add(sim.s.common); es.push(sim.expect('p4')); }
    let bestG = 0, bestV = 0; for (let g = 0; g <= 1.0001; g += 0.02) { const n = es.filter(e => Math.abs(g - e) <= K.TOL.p4 + 1e-9).length; if (n > bestG) { bestG = n; bestV = Math.round(g * 100) / 100; } }
    t.ok(cm.size === 2 && bestG <= 0.25 * es.length, 'L3: which species is commoner, and where it sits, vary by seed: the best fixed guess (' + bestV + ') fits ' + bestG + ' of ' + es.length + ' seeds (≤ 25%)');
  }

  {   // the dusk line's key number: the counts it names are the young birds' kills of each species
    const a = run(2, 6, 'bayes'), d = a.s.hist.find(r => r.dusk) && a.s.hist.find(r => r.dusk).dusk;
    t.ok(d && d.kb + d.ks === d.yk, 'L3: the dusk line counts (' + (d ? d.kb + ' + ' + d.ks : '–') + ') add up to the young birds’ kills (' + (d ? d.yk : '–') + ')');
    let rs = 0, cs = 0, n = 0; for (let sd = 1; sd <= N; sd++) { const r = run(2, sd, 'bayes'), L = K.LV[3]; for (const h of r.s.hist) if (h.dusk) { const kr = r.s.common === 'b' ? h.dusk.ks : h.dusk.kb, kc = r.s.common === 'b' ? h.dusk.kb : h.dusk.ks; rs += kr / L.rare; cs += kc / L.common; n++; } }
    t.ok(rs > 1.5 * cs, 'L3: the rarer species loses a bigger share per dusk (' + (100 * rs / n).toFixed(0) + '% against ' + (100 * cs / n).toFixed(0) + '%): cost per insect = n ÷ N');
  }

  /* ---------- L4 (kind 4): rare warning colours die scattered and spread clustered ---------- */
  {
    const A0 = [], A1 = [], B0 = [], B1 = [];
    for (let sd = 1; sd <= (FAST ? 20 : 100); sd++) {
      const a = run(3, sd, 'bayes'), s = a.s, I = s.isl; A0.push(I[0].hist[0]); A1.push(I[0].hist[I[0].hist.length - 1]); B0.push(I[1].hist[0]); B1.push(I[1].hist[I[1].hist.length - 1]);
      if (sd === 1) t.ok(I.length === 2, 'L4: two islands only (island C and its hidden run are gone)');
    }
    t.ok(mean(A1) < mean(A0) / 2, 'L4: on island A (scattered) bright falls by more than half, from ' + mean(A0).toFixed(2) + ' to ' + mean(A1).toFixed(2));
    t.ok(mean(B1) >= mean(B0) + 0.1, 'L4: on island B (sibling clusters) bright rises from ' + mean(B0).toFixed(2) + ' to ' + mean(B1).toFixed(2));
    let tr = 0, one = 0; for (let sd = 1; sd <= N; sd++) { const r = run(3, sd, sim.bots.learner); if (r.s.brT === 1) one++; if (r.result && r.result.mask & 4) tr++; }
    t.ok(one >= 0.9 * N && tr >= 0.6 * N, 'L4: the learner tastes exactly one bright bug on ' + one + ' of ' + N + ' seeds and earns Transfer on ' + tr + ' (bright ends commoner on B than on A)');
  }

  /* ---------- D6 decision 9: the chapter asks once, in L3 ---------- */
  {
    let bad = 0, asked = 0;
    for (let sd = 1; sd <= N; sd++) for (let lv = 0; lv < 4; lv++) { const r = run(lv, sd, 'bayes'); const n = r.s.asks.length; if (lv === 2) { if (n === 1) asked++; if (n > 1) bad++; } else if (n) bad++; }
    t.ok(bad === 0 && asked === N, 'D6: only L3 asks, exactly once (' + asked + ' of ' + N + ' seeds; ' + bad + ' stray asks)');
  }

  /* ---------- What if? texts are checked against their own runs ---------- */
  {
    const levers = [['nomodels', 'noinherit'], ['manymodels', 'cheap'], ['nojump', 'inside'], ['scatterB', 'clusterA']];
    let ok = 0, tot = 0, chance = 0;
    for (let lv = 0; lv < 4; lv++) for (const k of levers[lv]) for (let sd = 1; sd <= (FAST ? 3 : 6); sd++) {
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
    const offer = [1, 1, 3, 5], hits = [0, 0, 0, 0], S = FAST ? 6 : 12;
    for (let lv = 0; lv < 4; lv++) for (let sd = 1; sd <= S; sd++) { const r = run(lv, sd, expert); if (r.result && (r.result.mask & offer[lv]) === offer[lv]) hits[lv]++; }
    hits.forEach((h, lv) => t.ok(h >= Math.ceil(S * (lv === 2 ? 0.6 : 0.65)), 'stars: an expert earns every star level ' + (lv + 1) + ' offers on ' + h + ' of ' + S + ' seeds'));
    t.ok(offer.every(o => o !== 7), 'stars: no level offers all three stars');
    // rule-following bots must never reach three unit stars; the two guessers (random, and edge, which reads a number off the screen)
    // make three separate guesses, each right on at most about a quarter of seeds, so a rare jackpot is reported and capped at 1 in 30
    const bots = ['alwaysA', 'alwaysB', 'greedy', 'threshold', 'bayes', 'copynow', 'learner', 'edge', 'random'], guessers = ['edge', 'random'], seeds = FAST ? 6 : 30; let worst = 0, who = '';
    const jack = {}; for (const b of bots) for (let sd = 1; sd <= seeds; sd++) {
      const lv = [0, 1, 2, 3].map(l => { const r = run(l, sd, b === 'random' ? random : b); return r.result ? r.result.mask : 0; });
      const u = ch.unitStars(lv), n = (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1);
      if (guessers.indexOf(b) >= 0) { if (n === 3) (jack[b] = jack[b] || []).push(sd); continue; }
      if (n > worst) { worst = n; who = b + ' seed ' + sd; }
    }
    t.ok(worst < 3, 'stars: no rule-following bot’s union of level masks reaches three unit stars (best ' + worst + ', ' + who + ')');
    t.ok(guessers.every(b => (jack[b] || []).length <= Math.max(1, Math.floor(seeds / 30))), 'stars: the guessers reach three unit stars on ' + (guessers.map(b => b + ' ' + ((jack[b] || []).length ? 'seed ' + jack[b].join(', ') : 'none')).join('; ')) + ' of ' + seeds + ' (≤ 1 each; three lucky guesses)');
  }

  /* ---------- words: every chosen text exists ---------- */
  {
    const keys = new Set(); for (let lv = 0; lv < 4; lv++) for (const b of ['bayes', 'greedy', 'alwaysA']) for (let sd = 1; sd <= 4; sd++) { const r = run(lv, sd, b); if (r.result && r.result.interesting) keys.add(r.result.interesting); }
    t.ok([...keys].every(k => ch.content.interesting[k]), 'words: every Interesting key chosen exists (' + [...keys].join(', ') + ')');
  }
};
