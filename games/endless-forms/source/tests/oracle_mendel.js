/* tests/oracle_mendel.js: the science oracle for Mendel's Garden (D3 §4.2; D6 decisions 9 and 10; D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html mendel          (MG_FAST=1 for a quicker pass)
   Checks:
     segregation: a hybrid (Pp) selfed gives white ¼ of the time; purple × white gives all purple; hybrid × white gives ½ white;
       pure lines breed true (the sim's own seed draws, thousands of seeds);
     the test cross: a carrier × white gives white ½ per seed, so a pod of 4 is all purple (½)⁴ = 1/16 of the time; a pure
       plant never gives white; every L2 garden has 1–4 carriers among 5; the words' "1 in k" is 2ⁿ;
     independent assortment: the selfed double hybrid gives 9 : 3 : 3 : 1; the abbot's round green pea breeds true 1 time in 3;
       its test with wrinkled green gives ½ wrinkled when it hides one (¼ when selfed); the evidence numbers (½)⁸ and (¾)⁸;
     Mendel's numbers in the words (705 : 224 = 3.15 : 1; 315 + 108 + 101 + 32 = 556);
     the one prediction opens once, at the first selfed hybrid, and the pod waits for it;
     stars: one a level (L1 Predict, L2 Discover, L3 Transfer); an expert earns them; no fixed bot's union reaches three;
     fixed strategies (no tests, one selfed pod) miss Transfer on strong-evidence terms;
     determinism and snapshot replay; every Interesting text matches its own run and fills every number. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim } = G, FAST = !!process.env.MG_FAST, N = k => FAST ? Math.max(20, Math.round(k / 5)) : k;
  const plant = (k, o) => Object.assign({ k, name: k, A: [0, 0], R: [1, 1], Y: [1, 1], call: null, lock: false, tn: 0, tw: 0, tt: 0, ts: 0, pods: 0 }, o || {});
  const C = ch.content, stars3 = m => ((m & 1) ? 1 : 0) + ((m & 2) ? 1 : 0) + ((m & 4) ? 1 : 0);
  const draw = (lv, a, b, n) => {   // the kids of n crosses a × b, read from the sim's own draws (then the cross is cleared)
    const s = sim.s, out = []; for (let i = 0; i < n; i++) { s.phase = 'idle'; s.left = 99; s.cross = null; sim.act({ k: 'cross', a, b }); if (!s.cross) throw new Error('cross refused ' + a + '×' + b); out.push(...s.cross.kids); }
    s.cross = null; s.phase = 'idle'; return out;
  };
  const dom = g => g[0] + g[1] > 0;

  /* ---------- L1: dominance and segregation ---------- */
  { G.reset(0, 11); const s = sim.s; s.pl[2] = plant('H', { A: [1, 0] });
    const f2 = draw(0, 2, 2, N(1000)), w = f2.filter(k => !dom(k.A)).length / f2.length;
    t.near(w, 0.25, FAST ? 0.03 : 0.012, `hybrid selfed: white share ${w.toFixed(4)} over ${f2.length} seeds (expect ¼ = ½ × ½)`);
    const het = f2.filter(k => k.A[0] !== k.A[1]).length / f2.length; t.near(het, 0.5, FAST ? 0.03 : 0.015, `and half the seeds are hybrids (Pp ${het.toFixed(3)}): 1 : 2 : 1 under 3 : 1`);
    const f1 = draw(0, 0, 1, N(200)); t.ok(f1.every(k => dom(k.A) && k.A[0] !== k.A[1]), 'purple line × white line: every seed purple, every seed Pp');
    const tx = draw(0, 2, 1, N(500)), tw = tx.filter(k => !dom(k.A)).length / tx.length; t.near(tw, 0.5, FAST ? 0.04 : 0.02, `hybrid × white: white share ${tw.toFixed(3)} (expect ½)`);
    t.ok(draw(0, 0, 0, N(100)).every(k => dom(k.A)) && draw(0, 1, 1, N(100)).every(k => !dom(k.A)), 'pure lines breed true when selfed');
    t.eq(sim.type(s, 2, 2), 'Hs', 'a hybrid dusted with its own pollen is a self (type Hs)'); }
  /* the one prediction: once, at the first selfed hybrid; the pod waits; no ask elsewhere */
  { G.reset(0, 3); const s = sim.s; const step = k => { for (let i = 0; i < k; i++) sim.step(sim.dt); };
    sim.act({ k: 'cross', a: 0, b: 1 }); step(400); t.ok(!!s.pl[2] && s.asks.length === 0, 'purple × white: the hybrid is potted up, and no question is asked');
    sim.act({ k: 'cross', a: 2, b: 2 }); step(60); t.ok(s.phase === 'ask' && s.ask && s.ask.id === 'p1', 'the first selfed hybrid opens the question before its pod splits');
    step(600); t.ok(s.phase === 'ask', 'untimed: the pod waits for the answer (no soft auto-commit)');
    t.eq(sim.actions().map(a => a.v), [0, 0.25, 0.5], 'three answers: none, a quarter, a half');
    sim.act({ k: 'predict', id: 'p1', v: 0.25 }); step(400); t.ok(s.phase === 'idle' && s.hs === 1 && s.pred.p1 === 0.25, 'answered: the pod splits, the seeds flower and are counted');
    sim.act({ k: 'cross', a: 2, b: 2 }); step(60); t.ok(s.phase !== 'ask' && s.asks.length === 1, 'the question is asked only once'); }

  /* ---------- L2: the test cross and the evidence ---------- */
  { let car = [0, 0, 0, 0, 0, 0], ok = true;
    for (let sd = 1; sd <= N(400); sd++) { G.reset(1, sd); const k = sim.s.pl.filter(P => P.k === 'U' && P.A[0] !== P.A[1]).length; car[k]++; if (k < 1 || k > 4) ok = false; }
    t.ok(ok && car[1] && car[2] && car[3] && car[4], `every garden has 1–4 carriers among 5 (counts by k: ${car.slice(1, 5).join(', ')})`);
    G.reset(1, 5); const s = sim.s; s.pl[1] = plant('U', { A: [1, 0], name: 'A' }); s.pl[2] = plant('U', { A: [1, 1], name: 'B' });
    const kc = draw(1, 0, 1, N(5000)); let hid = 0; for (let i = 0; i + 4 <= kc.length; i += 4) if (kc.slice(i, i + 4).every(k => dom(k.A))) hid++;
    const pods = Math.floor(kc.length / 4), wsh = kc.filter(k => !dom(k.A)).length / kc.length;
    t.near(wsh, 0.5, FAST ? 0.03 : 0.01, `carrier × white: white share ${wsh.toFixed(3)} (expect ½)`);
    t.near(hid / pods, 1 / 16, FAST ? 0.025 : 0.008, `a carrier's pod of 4 is all purple ${(hid / pods).toFixed(4)} of the time (expect (½)⁴ = 0.0625)`);
    t.ok(draw(1, 2, 0, N(500)).every(k => dom(k.A)), 'a pure purple plant never gives white with the tester (either way round)');
    t.ok(sim.legal(s, 1, 2) === 'tester' && sim.legal(s, 0, 0) === 'tester' && sim.legal(s, 0, 3) === '', 'L2 allows only crosses with the white tester');
    const U = plant('U', { tn: 8 }); t.eq([4, 8, 10].map(n => Math.round(1 / sim.uMiss(Object.assign({}, U, { tn: n })))), [16, 256, 1024], "the words' '1 in k' after 4, 8, 10 purples: 16, 256, 1024 (2ⁿ)"); }

  /* ---------- L3: independent assortment and the abbot's pea ---------- */
  { G.reset(2, 9); const s = sim.s; s.pl[2] = plant('H', { R: [1, 0], Y: [1, 0] });
    const f2 = draw(2, 2, 2, N(2000)), c = [0, 0, 0, 0]; for (const k of f2) c[(dom(k.R) ? 0 : 2) + (dom(k.Y) ? 0 : 1)]++;
    const e = [9, 3, 3, 1].map(x => x / 16), fr = c.map(x => x / f2.length), tol = FAST ? 0.03 : 0.012;
    t.ok(fr.every((x, i) => Math.abs(x - e[i]) <= tol), `double hybrid selfed: ${c.join(' : ')} over ${f2.length} peas (expect 9 : 3 : 3 : 1, shares ${fr.map(x => x.toFixed(3)).join(', ')})`);
    const RgivenY = c[0] / (c[0] + c[2]), RgivenG = c[1] / (c[1] + c[3]); t.ok(Math.abs(RgivenY - RgivenG) < (FAST ? 0.06 : 0.03), `shape is independent of colour: round among yellow ${RgivenY.toFixed(3)}, among green ${RgivenG.toFixed(3)}`);
    t.ok(draw(2, 0, 1, N(100)).every(k => dom(k.R) && dom(k.Y) && k.R[0] !== k.R[1] && k.Y[0] !== k.Y[1]), 'round yellow × wrinkled green: every pea round and yellow (RrYy)');
    let rr = 0, n = N(1500);
    for (let sd = 1; sd <= n; sd++) { G.reset(2, sd); const q = sim.s; q.pl[2] = plant('H', { R: [1, 0], Y: [1, 0] }); q.hs = 3; q.left = 5; sim.act({ k: 'cross', a: 2, b: 2 }); for (let i = 0; i < 400 && !q.pl[3]; i++) sim.step(sim.dt); if (q.pl[3] && q.pl[3].R[0] && q.pl[3].R[1]) rr++; }
    t.near(rr / n, 1 / 3, FAST ? 0.07 : 0.035, `the abbot's round green pea breeds true ${(rr / n).toFixed(3)} of the time (RRyy among round green: 1 in 3)`);
    G.reset(2, 4); const q = sim.s; q.pl[2] = plant('H', { R: [1, 0], Y: [1, 0] }); q.pl[3] = plant('G', { R: [1, 0], Y: [0, 0] });
    const tg = draw(2, 3, 1, N(600)), ts = draw(2, 3, 3, N(600)), wr = a => a.filter(k => !dom(k.R)).length / a.length;
    t.near(wr(tg), 0.5, FAST ? 0.04 : 0.02, `a hider (Rr) × wrinkled green: wrinkled ${wr(tg).toFixed(3)} (expect ½)`);
    t.near(wr(ts), 0.25, FAST ? 0.04 : 0.02, `a hider selfed: wrinkled ${wr(ts).toFixed(3)} (expect ¼)`);
    t.ok(tg.concat(ts).every(k => !dom(k.Y)), 'its test peas are all green');
    t.near(sim.gMiss(plant('G', { tt: 8 })), 1 / 256, 1e-12, 'evidence: a hider gives no wrinkled pea in 8 tester peas (½)⁸ = 1/256');
    t.near(sim.gMiss(plant('G', { ts: 8 })), 0.100113, 1e-5, 'and in 8 selfed peas (¾)⁸ ≈ 0.10, too weak alone for the star (threshold 1/16)');
    t.ok(sim.legal(q, 3, 0) === 'gtest' && sim.legal(q, 3, 1) === '' && sim.legal(q, 0, 0) === 'l3', 'L3: the abbot\'s pea may be tested only against wrinkled green or by selfing'); }

  /* ---------- the words carry the real numbers ---------- */
  { const all = JSON.stringify(C);
    t.ok(/705 purple to 224 white, 3\.15 : 1/.test(all) && Math.abs(705 / 224 - 3.147) < 0.001, "Mendel's 705 : 224 is 3.15 : 1 (Mendel 1866)");
    t.ok(/315 : 108 : 101 : 32 from 556/.test(all) && 315 + 108 + 101 + 32 === 556, "Mendel's two-gene counts sum to 556");
    t.ok(/1 in 16 for four, 1 in 256 for eight/.test(all), 'the maths text: (½)⁴ = 1/16, (½)⁸ = 1/256'); }

  /* ---------- stars, bots, expert ---------- */
  const BOTS = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'guessQuarter'], allowed = [2, 1, 4];
  { let bad = 0, union3 = []; const seeds = N(40);
    for (const b of BOTS) for (let sd = 1; sd <= seeds; sd++) {
      let u = 0; for (let lv = 0; lv < 3; lv++) { const r = G.run(lv, { seed: sd, bot: b }); const m = r.result ? r.result.mask : 0; if (m & ~allowed[lv]) bad++; u |= m; }
      if (stars3(u) === 3) union3.push(b + '@' + sd);
    }
    t.ok(!bad, 'each level offers exactly one star: L1 Predict, L2 Discover, L3 Transfer (no other bit ever set)');
    t.ok(!union3.length, `no fixed bot's union across the unit reaches three stars (${BOTS.join(', ')}; ${seeds} seeds)` + (union3.length ? ': ' + union3.slice(0, 5).join(', ') : '')); }
  { const n = N(60); let p = 0, d = 0, tr = 0, caps = 0;
    for (let sd = 1; sd <= n; sd++) { const r0 = G.run(0, { seed: sd, bot: 'expert' }), r1 = G.run(1, { seed: sd, bot: 'expert' }), r2 = G.run(2, { seed: sd, bot: 'expert' }); caps += [r0, r1, r2].filter(r => r.capped).length; if (r0.result.mask & 2) p++; if (r1.result.mask & 1) d++; if (r2.result.mask & 4) tr++; }
    t.ok(p === n, `an expert calls the quarter: L1 Predict on ${p}/${n} seeds`);
    t.ok(d >= 0.85 * n, `an expert (two test pods where it can) calls all five right on ${d}/${n} seeds (a carrier hides in 8 seeds 1 time in 256, and the budget is tight)`);
    t.ok(tr >= 0.95 * n, `an expert tests the abbot's pea with the tester and calls it: L3 Transfer on ${tr}/${n} seeds`);
    t.ok(!caps, 'no expert run hits the tick cap'); }
  { let tt = 0, g3 = 0, n = N(60); for (let sd = 1; sd <= n; sd++) { if (G.run(2, { seed: sd, bot: 'threshold' }).result.mask & 4) tt++; const r = G.run(2, { seed: sd, bot: 'greedy' }); const Gp = r.s.pl[3]; if ((r.result.mask & 4) && Gp && !(Gp.R[0] && Gp.R[1]) === false) g3++; }
    t.ok(tt === 0, 'calling the abbot\'s pea without a test never earns Transfer');
    t.ok(g3 === 0, 'one selfed pod is never strong enough to certify a true-breeding pea ((¾)⁸ ≈ 0.10 > 1/16)'); }
  { let none = 0; for (let sd = 1; sd <= N(40); sd++) if (G.run(1, { seed: sd, bot: 'threshold' }).result.mask & 1) none++; t.ok(none === 0, 'calling every plant pure without testing never earns Discover (every garden has a carrier)'); }

  /* ---------- determinism and snapshot replay ---------- */
  { const a = G.run(1, { seed: 21, bot: 'random' }), b = G.run(1, { seed: 21, bot: 'random' });
    t.eq(JSON.stringify(a.s), JSON.stringify(b.s), 'same seed and policy: the same final state (L2, random bot)');
    G.reset(2, 8); const s0 = sim.s; let snap = null, k = 0; const pol = G.bot('expert'), rnd = () => 0.5;
    for (let i = 0; i < 4000 && !sim.result(); i++) { const acts = sim.actions(); const x = acts.length ? pol(sim.s, acts, rnd) : null; if (x) sim.act(x); if (++k === 300) snap = sim.snapshot(); sim.step(sim.dt); }
    const end1 = JSON.stringify(sim.s.f2) + JSON.stringify(sim.s.pl[3]);
    sim.restore(snap); for (let i = 0; i < 4000 && !sim.result(); i++) { const acts = sim.actions(); const x = acts.length ? pol(sim.s, acts, rnd) : null; if (x) sim.act(x); sim.step(sim.dt); }
    t.eq(JSON.stringify(sim.s.f2) + JSON.stringify(sim.s.pl[3]), end1, 'a snapshot taken mid-level replays to the same ending (L3)'); void s0; }

  /* ---------- Interesting texts match their runs ---------- */
  { let checked = 0, bad = []; const keys = {};
    for (const b of ['random', 'greedy', 'alwaysA', 'alwaysB', 'expert']) for (let lv = 0; lv < 3; lv++) for (let sd = 1; sd <= N(30); sd++) {
      const r = G.run(lv, { seed: sd, bot: b }); if (!r.result || !r.result.interesting) continue;
      const s = r.s, key = r.result.interesting, txt = C.interesting[key], v = sim.iVars(s), filled = String(txt).replace(/\{(\w+)\}/g, (m, k) => v[k] == null ? '{' + k + '}' : String(v[k]));
      keys[key] = (keys[key] || 0) + 1; checked++;
      if (/\{|undefined|NaN/.test(filled)) bad.push(key + ' unfilled: ' + filled.slice(0, 80));
      if (key === 'scatter') { const n = s.f2[0] + s.f2[1]; if (!(n >= 16 && Math.abs(s.f2[1] - n / 4) >= 3) || v.w !== s.f2[1] || v.n !== n || v.e !== n / 4) bad.push('scatter wrong'); }
      if (key === 'nohyb' && s.pl[2]) bad.push('nohyb with a hybrid');
      if (key === 'fooled') { const U = s.pl.find(P => P && P.name === v.p); if (!U || U.A[0] === U.A[1] || U.call !== 'pure' || v.k !== Math.round(1 / Math.pow(0.5, v.n))) bad.push('fooled wrong'); }
      if (key === 'hid') { const U = s.pl.find(P => P && P.name === v.p); if (!U || U.A[0] === U.A[1] || v.n < 4 || v.k !== Math.round(Math.pow(2, v.n))) bad.push('hid wrong'); }
      if (key === 'risky') { const U = s.pl.find(P => P && P.name === v.p); if (!U || U.A[0] !== U.A[1] || U.call !== 'pure' || U.tn !== v.n) bad.push('risky wrong'); }
      if (key === 'self') { const Gp = s.pl[3]; if (!Gp || Gp.tt || !Gp.ts) bad.push('self wrong'); }
      if (key === 'nowg' && (s.f2[3] || v.pc !== Math.round(100 * Math.pow(15 / 16, v.n)))) bad.push('nowg wrong');
      if (key === 'mix' && v.m !== s.f2[1] + s.f2[2]) bad.push('mix count wrong');
    }
    t.ok(!bad.length, `every Interesting text matches its run and fills every number (${checked} runs; keys ${Object.keys(keys).map(k => k + '×' + keys[k]).join(', ')})` + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : '')); }

  /* ---------- assignment bits ---------- */
  { const r = G.run(2, { seed: 3, bot: 'expert' }); const bits = ch.resultBits(r.s, 2); t.ok(bits >= 0 && bits < (1 << 30) && (bits & 7) === r.result.mask, 'resultBits fits 30 bits and carries the mask'); }
};
