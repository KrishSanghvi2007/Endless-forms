/* tests/oracle_tree.js: the science oracle for Tree Thinking (D3 §4.1, D5 §3 items 1, 4, 9; D6 decisions 9–10).
   Run: node tests/oracle.js BUILD.html tree
   Checks:
     A. Fitch counts are right for every rooted and unrooted topology of 4–6 taxa (brute force over internal states);
     B. the step counts the unit shows (sparrow 3/5/5, whale 7/10/10, bat 6/8/9 and wings alone 1/2/2, octopus 6/9/10);
     C. a swing never changes relatedness (2⁵ = 32 drawings of one tree, the clades the same); the plates sit 1, 2, 3 swings apart;
     D. rooting: the steps are the same on every root; rooted on the outgroup every change is a gain; the root decides sisters;
     E. determinism and snapshot replay; every bot reaches the end of every level;
     F. stars: an expert earns every star the unit offers; no level offers three; no bot's union reaches three;
        fixed strategies (ladder, look-alike, first or last target) miss what they should;
     G. every Interesting text matches its own run. */
'use strict';
module.exports = function (G, t) {
  const { ch } = G;
  const S = ch.sim;
  const run = (lv, seed, bot) => G.run(lv, { seed, bot });
  const stars3 = m => ((m & 1) ? 1 : 0) + ((m & 2) ? 1 : 0) + ((m & 4) ? 1 : 0);
  const bitsOf = (n, k) => { const a = []; for (let i = 0; i < k; i++) a.push((n >> i) & 1); return a; };

  /* ---------- A. Fitch against brute force ---------- */
  // brute force: the fewest changes over every assignment of 0/1 to internal nodes (rooted binary tree as nested arrays)
  const brute = (tree, v) => {
    const nodes = []; const walk = n => { if (typeof n === 'number') return { tip: n }; const o = { kids: [walk(n[0]), walk(n[1])] }; nodes.push(o); return o; };
    const root = walk(tree); let best = 1e9;
    for (let m = 0; m < (1 << nodes.length); m++) {
      nodes.forEach((o, i) => { o.st = (m >> i) & 1; });
      let c = 0; const cnt = o => { for (const k of o.kids) { const ks = k.tip != null ? v[k.tip] : k.st; if (ks !== o.st) c++; if (k.kids) cnt(k); } }; cnt(root);
      if (c < best) best = c;
    }
    return best;
  };
  // all rooted binary topologies on a set of tips
  const rooted = tips => { if (tips.length === 1) return [tips[0]]; const out = [], first = tips[0], rest = tips.slice(1);
    for (let m = 0; m < (1 << rest.length); m++) { const A = [first], B = []; rest.forEach((x, i) => ((m >> i) & 1 ? A : B).push(x)); if (!B.length) continue; for (const a of rooted(A)) for (const b of rooted(B)) out.push([a, b]); } return out; };
  // tree.js keeps its helpers inside the build's IIFE; the chapter exposes them read-only as ch._fitch, ch._reroot … (test hooks)
  { let ok = true, n = 0;
    for (const k of [4, 5, 6]) {
      const tips = [...Array(k).keys()], trees = rooted(tips);
      for (const tr of trees.slice(0, k === 6 ? 120 : trees.length)) for (let m = 1; m < (1 << k) - 1; m += (k === 6 ? 7 : 1)) {
        const v = bitsOf(m, k), want = brute(tr, v), got = ch._fitch(tr, v, 0).steps, got1 = ch._fitch(tr, v, 1).steps;
        if (got !== want || got1 !== want) ok = false;
        const f = ch._fitch(tr, v, 0); if (f.ch.length !== f.steps) ok = false;   // one recorded change per step
        n++;
      }
    }
    t.ok(ok, `A. Fitch steps equal the brute-force minimum on ${n} tree × character pairs (4–6 taxa, both root preferences)`);
  }

  /* ---------- B. the step counts on show ---------- */
  { const cases = ch._cases, steps = (C, vis) => [1, 2, 3].map(sis => ch._steps4(C, sis, vis));
    t.eq(steps(cases[0][0]), [3, 5, 5], 'B. sparrow: by the ostrich 3 steps, by the crocodile or lizard 5');
    t.eq(steps(cases[0][1]), [7, 10, 10], 'B. whale: by the hippo 7 steps, by the cow or pig 10 (legacy G5 data)');
    t.eq(steps(cases[1][0], 1), [1, 2, 2], 'B. bat, wings alone: by the sparrow 1 step (the trap)');
    t.eq(steps(cases[1][0]), [8, 6, 9], 'B. bat, all five traits: by the mouse 6, by the sparrow 8, by the lizard 9');
    t.eq(steps(cases[1][1]), [6, 9, 10], 'B. octopus: by the limpet 6, by the salmon 9, by the lancelet 10');
    // uninformative characters: a trait shared by three (or one) costs one step on every tree
    let ok = true; for (const C of [cases[0][0], cases[0][1], cases[1][0]]) for (const c of C.chars) { const n1 = c[1].reduce((a, b) => a + b, 0); if (n1 === 1 || n1 === 3) { const s = [1, 2, 3].map(sis => ch._fitch(ch._pair(sis), c[1], 0).steps); if (s.some(x => x !== 1)) ok = false; } }
    t.ok(ok, 'B. every trait shared by three (or by one) costs exactly one step on every tree');
    const w = cases[1][0].chars[0][1]; t.ok(ch._fitch(ch._pair(2), w, 0).steps === 2 && ch._fitch(ch._pair(2), w, 0).ch.every(x => x.s === 1), 'B. on the best bat tree, wings need two gains (bat and sparrow): convergence');
  }

  /* ---------- C. swings and plates ---------- */
  { const N = ch._n1, orders = new Set(), clades = new Set();
    for (let m = 0; m < 32; m++) { const f = bitsOf(m, 5); orders.add(ch._order(N, f).join(',')); }
    t.ok(orders.size === 32, `C. the five joints give ${orders.size} distinct drawings (2⁵ = 32)`);
    // clades never change under swings: the set of tips under each joint is the same for every flip vector
    for (let m = 0; m < 32; m++) { const f = bitsOf(m, 5); const o = ch._order(N, f); const cl = []; for (let i = 0; i < 5; i++) cl.push(ch._tipsOf(N, { n: i }).slice().sort().join('.')); clades.add(cl.join('|')); void o; }
    t.ok(clades.size === 1, 'C. every drawing holds the same five clades (swings change nothing about relatedness)');
    let ok = true, ladder = true;
    for (let sd = 1; sd <= 200; sd++) { G.reset(0, sd); const s = S.s, h = (a, b) => a.reduce((x, y, i) => x + (y !== b[i] ? 1 : 0), 0);
      if (h(s.flip, s.plates[0]) !== 1 || h(s.plates[0], s.plates[1]) !== 2 || h(s.plates[1], s.plates[2]) !== 3) ok = false;
      if (ch._order(N, s.plates[2]).join(',') !== '0,1,2,3,4,5') ladder = false;
      if (s.flip.every(x => !x)) ok = false; }
    t.ok(ok, 'C. on 200 seeds the brass starts 1 swing from plate 1, plate 2 is 2 swings on, the ladder 3 more (par 1, 2, 3)');
    t.ok(ladder, 'C. the last plate is the ladder: salmon, frog, lizard, sparrow, mouse, human');
    // the frog's closer relative: the frog–human joint holds fewer tips than the frog–salmon joint
    const mrca = (a, b) => { let best = null; for (let i = 0; i < 5; i++) { const tp = ch._tipsOf(N, { n: i }); if (tp.includes(a) && tp.includes(b) && (!best || tp.length < best.length)) best = tp; } return best; };
    t.ok(mrca(1, 5).length === 5 && mrca(1, 0).length === 6, 'C. frog and human share a joint of 5 tips; frog and salmon only the root (6): the human is closer');
  }

  /* ---------- D. rooting ---------- */
  { const RS = ch._roots;
    for (const R0 of RS) {
      const st = R0.tips.map((x, r) => ch._stepsRoot(R0, r)); t.ok(st.every(x => x === st[0]), `D. ${R0.id}: ${st[0]} steps on every root (${st.join(', ')})`);
      const T = ch._reroot(R0.tree, R0.out), story = []; for (const c of R0.chars) for (const x of ch._fitch(T, c[1], c[1][R0.out]).ch) story.push((x.s ? '+' : '-') + c[0]);
      const want = R0.id === 'verts' ? '+skull,+jaws,+limbs,+hair' : '-legs,+scales,+fork';
      t.ok(story.join(',') === want, `D. ${R0.id}: rooted on the outgroup the story is ${want} (got ${story.join(',')})`);
      const T2 = ch._reroot(R0.tree, R0.start); let loss = false; for (const c of R0.chars) for (const x of ch._fitch(T2, c[1], c[1][R0.start]).ch) if (x.s === 0) loss = true;
      t.ok(loss, `D. ${R0.id}: rooted where the level starts, some changes read as losses (the wrong story)`);
    }
    const sn = RS[1], sis = (T, a) => { const find = n => { if (typeof n === 'number') return null; for (const [x, y] of [[n[0], n[1]], [n[1], n[0]]]) if (x === a && typeof y === 'number') return y; return find(n[0]) ?? find(n[1]); }; return find(T); };
    t.ok(sis(ch._reroot(sn.tree, 0), 3) === 2 && sis(ch._reroot(sn.tree, 3), 0) === 1, 'D. the root decides sisters: rooted on the frog the snake’s sister is the monitor; rooted on the snake the frog’s is the gecko');
    const legs = sn.chars[0][1], f = ch._fitch(ch._reroot(sn.tree, 0), legs, legs[0]); t.ok(f.ch.length === 1 && f.ch[0].k === '3' && f.ch[0].s === 0, 'D. rooted on the frog, legs are lost once, on the snake’s branch (Apesteguía and Zaher 2006)');
  }

  /* ---------- E. determinism, replay, termination ---------- */
  const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'ladder', 'lookalike', 'expert'];
  for (let lv = 0; lv < 4; lv++) {
    const a = run(lv, 11, 'random'), b = run(lv, 11, 'random');
    t.eq(a.s, b.s, `E. L${lv + 1}: the same seed and actions give the same final state`);
    G.reset(lv, 12); const pol = G.bot('random'); let rs = 5; const rnd = () => { rs = (rs * 1103515245 + 12345) & 0x7fffffff; return rs / 0x7fffffff; };
    let ticks = 0, snap = null, at = 0, rsAt = 0;
    while (!S.result() && ticks < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([ticks, x]); S.act(x); } } S.step(S.dt); ticks++; if (ticks === 60) { snap = S.snapshot(); at = ticks; rsAt = rs; } }
    const end = JSON.stringify(S.s); S.restore(snap); let k = at; rs = rsAt;
    while (!S.result() && k < 20000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, rnd); if (x) { S.s.log.push([k, x]); S.act(x); } } S.step(S.dt); k++; }
    t.ok(JSON.stringify(S.s) === end, `E. L${lv + 1}: a snapshot at tick 60 restores and replays to the same end`);
    let capped = 0; for (const bn of bots) for (let sd = 1; sd <= 6; sd++) if (run(lv, sd, bn).capped) capped++;
    t.ok(capped === 0, `E. L${lv + 1}: every bot reaches the end on seeds 1–6 (${capped} capped)`);
  }

  /* ---------- F. stars ---------- */
  const offers = [3, 1, 5, 1];   // L1 D+P, L2 D, L3 D+T, L4 D
  for (let lv = 0; lv < 4; lv++) {
    let all = 0; for (let sd = 1; sd <= 20; sd++) { const r = run(lv, sd, 'expert'); if ((r.result.mask & offers[lv]) === offers[lv]) all++; }
    t.ok(all === 20, `F. L${lv + 1}: the expert earns every star the level offers on 20 of 20 seeds (${all})`);
    let over = 0; for (const bn of bots) for (let sd = 1; sd <= 20; sd++) { const r = run(lv, sd, bn); if (r.result && (r.result.mask & ~offers[lv])) over++; if (r.result && stars3(r.result.mask) >= 3) over++; }
    t.ok(over === 0, `F. L${lv + 1}: no run earns a star the level does not offer, and none earns three`);
  }
  { // the unit's union across levels, per bot (D: three of four levels; P: L1; T: L3)
    let bad = []; for (const bn of bots.filter(b => b !== 'expert')) for (let sd = 1; sd <= 20; sd++) { const lv = [0, 1, 2, 3].map(l => { const r = run(l, sd, bn); return r.result ? r.result.mask : 0; }); if (stars3(ch.unitStars(lv)) >= 3) bad.push(bn + '@' + sd); }
    t.ok(!bad.length, `F. no fixed bot's union across the four levels reaches three stars (${bad.slice(0, 4).join(', ') || 'none'})`);
    const ex = [0, 1, 2, 3].map(l => run(l, 3, 'expert').result.mask); t.ok(ch.unitStars(ex) === 7, 'F. the expert earns all three unit stars');
  }
  { const miss = (lv, bn, bit) => { let k = 0; for (let sd = 1; sd <= 20; sd++) { const r = run(lv, sd, bn); if (r.result.mask & bit) k++; } return k; };
    t.ok(miss(0, 'ladder', 2) === 0, 'F. reading the ladder (the frog beside the salmon) never earns Predict');
    t.ok(miss(2, 'lookalike', 1) === 0 && miss(2, 'lookalike', 4) === 0, 'F. trusting look-alikes (wings, the camera eye) never earns L3 Discover or Transfer');
    t.ok(miss(3, 'ladder', 1) <= 8 && miss(3, 'alwaysA', 1) <= 8, 'F. rooting by screen position (the "top" of the drawing, or the first specimen) rarely earns L4 Discover');
    t.ok(miss(1, 'alwaysA', 1) + miss(1, 'alwaysB', 1) < 10, 'F. hanging by a fixed slot rarely earns L2 Discover (the slots are shuffled)');
    t.ok(miss(0, 'threshold', 1) <= 2, 'F. swinging joints in turn almost always misses L1 Discover (more than three over par)');
  }

  /* ---------- G. Interesting texts match their runs ---------- */
  { let ok = true, n = 0;
    for (let lv = 0; lv < 4; lv++) for (const bn of bots) for (let sd = 1; sd <= 8; sd++) {
      const r = run(lv, sd, bn), s = r.s, k = r.result.interesting; if (!k) continue; n++;
      if (k === 'ladder' && s.pick !== 0) ok = false;
      if (k === 'swings' && !(s.swTot > 12)) ok = false;
      if (k === 'hooves') { const m = s.cs[1].mounts[s.cs[1].mounts.length - 1]; if (!m || m.sis === 1) ok = false; }
      if (k === 'wings') { const m = s.cs[0].mounts[0]; if (!(m && m.vis === 1 && m.sis === 1)) ok = false; }
      if (k === 'notFooled') { const m = s.cs[0].mounts[0]; if (!(m && m.vis === 1 && m.sis === 2)) ok = false; }
      if (k === 'eye' && !s.cs[1].mounts.some(m => m.sis === 2)) ok = false;
      if (k === 'wrong' && !s.rc.some(rr => rr.taps > 1)) ok = false;
      const txt = ch.content.interesting[k]; if (!txt) ok = false;
    }
    t.ok(ok, `G. ${n} Interesting texts each match their own run`);
  }
};
