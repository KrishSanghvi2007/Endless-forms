/* tests/oracle_royal.js: science and engineering oracle for The Royal Line (v2). Run: node tests/oracle.js BUILD.html royal
   D3 §5.2 oracles: the gap ratio is −½; p̄ = (2q_f + q_m)/3 is invariant; incidence at balance is 3μ/s ± 10%; carrier posteriors
   are exact. Plus: Morgan's crosses hatch in X-linked ratios (F1, F2, backcross, reverse); the realised cage tracks the recursion;
   the asks' expectations are the recursion from the realised state; "no change" never sits inside a scored band; determinism,
   replay and snapshots; the expert earns every star offered and no level offers three; no bot's union reaches three unit stars;
   untimed lamp; What if? runs earn nothing and match their lever; the opening card. RY_FAST=1 runs fewer seeds. */
'use strict';
module.exports = function (G, t) {
  const { sim, ch } = G, FAST = !!process.env.RY_FAST, NS = FAST ? 8 : 24;
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const se = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m))) / Math.max(1, a.length)); };

  /* 1. the X-linked recursion: gap ratio −½, the mean invariant, convergence; the autosomal control in one step */
  { let ok = true, inv = true; for (const [qf, qm] of [[0, 1], [1, 0], [0.8, 0.2], [0.13, 0.71], [0.5, 0.5001]]) {
      const [a, b] = sim.xRec(qf, qm); if (Math.abs(qm - qf) > 1e-9 && Math.abs((a - b) / (qf - qm) + 0.5) > 1e-12) ok = false;
      if (Math.abs((2 * a + b) / 3 - (2 * qf + qm) / 3) > 1e-12) inv = false; }
    t.ok(ok, 'gap ratio (q_f′ − q_m′) ÷ (q_f − q_m) = −½ exactly');
    t.ok(inv, 'p̄ = (2q_f + q_m)/3 is unchanged by a generation');
    let qf = 0, qm = 1; for (let g = 0; g < 10; g++) [qf, qm] = sim.xRec(qf, qm); t.ok(Math.abs(qf - 1 / 3) < 0.002 && Math.abs(qm - 1 / 3) < 0.004, `from q_f = 0, q_m = 1 the sexes reach ${qf.toFixed(4)}, ${qm.toFixed(4)} by generation 10 (p̄ = 1/3)`);
    // the realised cage (N = 1,000 of each sex) samples around the recursion
    const gaps = [], pb = [];
    for (let seed = 1; seed <= NS; seed++) { G.reset(1, seed); const s = sim.s; for (let g = 0; g < 6; g++) { const h0 = sim.cageStat(s); sim.xGen(s.cage, s.N, 0, 0); const h1 = sim.cageStat(s); if (Math.abs(h0.qf - h0.qm) > 0.1) gaps.push((h1.qf - h1.qm) / (h0.qf - h0.qm)); pb.push((2 * h1.qf + h1.qm) / 3 - (2 * h0.qf + h0.qm) / 3); } }
    t.near(mean(gaps), -0.5, 3 * se(gaps) + 0.01, `realised gap ratio ${mean(gaps).toFixed(3)} (expected −0.5)`);
    t.near(mean(pb), 0, 3 * se(pb) + 0.002, `realised change in p̄ per generation ${mean(pb).toFixed(4)} (expected 0)`);
    G.reset(1, 3); const s = sim.s; sim.aGen(s.ctl, s.N); const c = sim.cageStat(s); t.ok(Math.abs(c.cf - 0.5) < 0.04 && Math.abs(c.cm - 0.5) < 0.04, `autosomal control: both sexes near ½ after one generation (${c.cf.toFixed(3)}, ${c.cm.toFixed(3)})`); }

  /* 2. mutation–selection balance with selection on males only: male incidence ≈ 3μ/s (D3: ± 10%), and the realised cage settles there */
  { const mu = sim.P().mu.v; for (const sel of [0.25, 0.5, 1]) { const e = sim.lampEq(0.2, 0.2, sel, mu), h = 3 * mu / sel; t.ok(Math.abs(e - h) / h <= 0.1, `balance with s = ${sel}: q_m = ${e.toFixed(4)} against 3μ/s = ${h.toFixed(4)}`); }
    const e = sim.lampEq(0.3, 0.3, 0.5, 0); t.ok(e < 1e-3, 'without mutation the white allele heads to loss under the lamp');
    const tails = []; for (let seed = 1; seed <= (FAST ? 6 : 16); seed++) { const r = G.run(2, { seed, bot: 'expert' }), s = r.s; tails.push(mean(s.hist.slice(-20).map(h => h.wm)) / s.exp.bal); }
    t.near(mean(tails), 1, 0.12, `realised white-eyed males over the last 20 generations ÷ the predicted balance: ${mean(tails).toFixed(3)}`);
    const wf = []; for (let seed = 1; seed <= 6; seed++) { const s = G.run(2, { seed, bot: 'expert' }).s, h = s.hist.slice(-20); wf.push(mean(h.map(x => x.wf)) / Math.max(1e-6, mean(h.map(x => x.wm)) ** 2)); }
    t.ok(mean(wf) > 0.3 && mean(wf) < 2, `white-eyed females run near q² (ratio to q_m² ${mean(wf).toFixed(2)})`); }

  /* 3. the boss: carrier posteriors are exact (1 ÷ (1 + 2ⁿ) after n unaffected sons; 1 after an affected son or father) */
  { const want = { alice: [0.5, 1], helena: [0.5, 0.2], hv: [0.1, 0.1], albany: [1, 1], voh: [0.5, 0.2], alix: [0.5, 1] };
    const r = G.run(3, { seed: 1, bot: 'expert' }), J = r.s.judg; let ok = J.length === 12;
    for (const j of J) { const w = want[j.id][j.st === 'prior' ? 0 : 1]; if (Math.abs(j.e - w) > 1e-9) ok = false; }
    t.ok(ok, 'priors and posteriors: Alice ½→1, Helena ½→⅕, Helena Victoria ⅒→⅒, Alice of Albany 1→1, Victoria of Hesse ½→⅕, Alix ½→1');
    let f = true; for (let n = 0; n <= 6; n++) { const c = { sons: new Array(n).fill(['x', 0]) }; if (Math.abs(sim.postOf(c, 0.5) - 1 / (1 + Math.pow(2, n))) > 1e-12) f = false; } t.ok(f, 'postOf(½, n unaffected sons) = 1 ÷ (1 + 2ⁿ) for n = 0 to 6'); }

  /* 4. Morgan's crosses hatch in X-linked proportions (pooled over seeds) */
  { const tally = { f1: [0, 0, 0, 0], f2: [0, 0, 0, 0], back: [0, 0, 0, 0], rev: [0, 0, 0, 0] };
    for (let seed = 1; seed <= (FAST ? 20 : 60); seed++) { const s = G.run(0, { seed, bot: 'expert' }).s; for (const c of s.crosses) if (tally[c.type]) c.kids.forEach((k, i) => { tally[c.type][i] += k; }); }
    const sh = (k, w, r) => k[w] / Math.max(1, k[w] + k[r]);
    t.ok(tally.f1[1] === 0 && tally.f1[3] === 0, 'F1 (wild ♀ × white ♂): no white-eyed flies of either sex');
    t.ok(tally.f2[1] === 0 && Math.abs(sh(tally.f2, 3, 2) - 0.5) < 0.05, `F2 (F1 ♀ × red ♂): no white daughters; white sons ${(100 * sh(tally.f2, 3, 2)).toFixed(1)}% (50%)`);
    t.ok(Math.abs(sh(tally.back, 1, 0) - 0.5) < 0.05 && Math.abs(sh(tally.back, 3, 2) - 0.5) < 0.05, `backcross (F1 ♀ × white ♂): white daughters ${(100 * sh(tally.back, 1, 0)).toFixed(1)}%, sons ${(100 * sh(tally.back, 3, 2)).toFixed(1)}% (50%, 50%)`);
    t.ok(tally.rev[1] === 0 && tally.rev[2] === 0 && tally.rev[3] > 0, 'reverse cross (white ♀ × red ♂): every son white, every daughter red');
    G.reset(0, 2); const s = sim.s; sim.act({ k: 'cross', f: 'wf', m: 'wm' }); t.ok(s.phase === 'hatch' && s.left === 5, 'a cross uses one vial and hatches');
    G.reset(0, 2); sim.act({ k: 'cross', f: 'wm', m: 'mm' }); t.ok(sim.s.left === 6 && sim.s.crosses.length === 0, 'two males cannot be crossed'); }

  /* 5. the asks: expectations from the realised state; "no change" outside the scored band; voided when nothing would move */
  { let ok = true, nc = true; const notes = [];
    for (let seed = 1; seed <= NS; seed++) {
      G.reset(1, seed); const s = sim.s; let k = 0;
      while (!sim.result() && k < 20000) { if (s.ask) { const h = s.hist[s.hist.length - 1], id = s.ask.id, e = id === 't' ? (2 * s.th[0].qf + s.th[0].qm) / 3 : id[0] === 'm' ? h.qf : (h.qf + h.qm) / 2; if (Math.abs(e - s.exp[id]) > 1e-6) { ok = false; notes.push(id + seed); } if (Math.abs(s.ask.start - s.exp[id]) <= s.ask.tol) nc = false; sim.act({ k: 'predict', id, v: s.exp[id] }); } sim.step(sim.dt); k++; }
    }
    t.ok(ok, 'zigzag and transfer expectations are the recursion from the realised cage' + (notes.length ? ' (' + notes.slice(0, 4).join(', ') + ')' : ''));
    t.ok(nc, 'L2: the ghost never starts inside the band (the start is "no change", or the naive midpoint for the transfer)');
    let bal = true; for (let seed = 1; seed <= NS; seed++) for (const b of ['expert', 'random', 'alwaysA']) { const r = G.run(2, { seed, bot: b }), s = r.s; const cur = s.atAsk ? s.hist[s.atAsk.hl - 1].qm : null; if (cur != null && cur >= s.exp.bal / 1.5 && cur <= s.exp.bal * 1.5) bal = false; }
    t.ok(bal, 'L3: "no change" at the balance ask always misses (the lamp share is chosen so it does)');
    G.reset(0, 4); const s0 = sim.s; sim.act({ k: 'cross', f: 'wf', m: 'mm' }); t.ok(!s0.ask, 'L1: the F1 cross asks nothing (both models agree there)'); }

  /* 6. determinism, replay and snapshots */
  { for (const lv of [0, 1, 2, 3]) {
      const r1 = G.run(lv, { seed: 11, bot: lv === 2 ? 'greedy' : 'expert' }), log = r1.s.log.slice(), pick = s => JSON.stringify([s.crosses || null, s.hist || null, s.judg || null, s.pred, s.th || null, s.caught || 0]), want = pick(r1.s);
      G.reset(lv, 11); let i = 0, tick = 0;
      while (!sim.result() && tick < 60000) { while (i < log.length && log[i][0] === tick) sim.act(log[i++][1]); sim.step(sim.dt); tick++; }
      t.eq(pick(sim.s), want, `L${lv + 1}: replaying the action log reproduces the run`);
    }
    const a = G.run(2, { seed: 5, bot: 'expert' }), b = G.run(2, { seed: 5, bot: 'expert' }); t.eq(a.s.hist, b.s.hist, 'same seed and actions give the same lamp run');
    const snap = sim.snapshot(); sim.restore(snap); t.eq(sim.snapshot(), snap, 'snapshot round trip is exact'); t.ok(snap.length < 80000, `end snapshot ${snap.length} characters`); }

  /* 7. the expert earns every star its level offers; no level offers all three; per-level offers */
  { const want = [3, 6, 3, 5], got = [0, 0, 0, 0], n = FAST ? 6 : 16; let three = 0;
    for (let lv = 0; lv < 4; lv++) for (let seed = 1; seed <= n; seed++) { const r = G.run(lv, { seed, bot: 'expert' }); if (r.result && (r.result.mask & want[lv]) === want[lv]) got[lv]++; if (r.result && r.result.mask === 7) three++; if (!r.result) t.note(`L${lv + 1} seed ${seed} capped`); }
    t.ok(three === 0, 'no level offers all three stars');
    got.forEach((g, lv) => t.ok(g / n >= 0.85, `L${lv + 1}: the expert earns every offered star (${want[lv]}) on ${g} of ${n} seeds`)); }

  /* 8. no bot's union across the unit reaches three stars (lessons rule 5), via ch.unitStars */
  { const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'lazy', 'bestNoThink'], worst = {};
    for (const b of bots) { worst[b] = 0; for (let seed = 1; seed <= (FAST ? 4 : 12); seed++) { const lv = []; for (let l = 0; l < 4; l++) { const r = G.run(l, { seed, bot: b }); lv.push(r.result ? r.result.mask & 7 : 0); if (r.result && (r.result.mask & 7) === 7) worst[b] = 9; } const u = ch.unitStars(lv); worst[b] = Math.max(worst[b], (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1)); } }
    t.ok(Object.values(worst).every(v => v < 3), 'no bot reaches three unit stars: ' + bots.map(b => b + ' ' + worst[b]).join(', '));
    const ex = []; for (let l = 0; l < 4; l++) ex.push(G.run(l, { seed: 3, bot: 'expert' }).result.mask); t.eq(ch.unitStars(ex), 7, 'the expert reaches all three unit stars'); }

  /* 9. untimed lamp: flashes spend tokens and catch at once; the run ends */
  { const r = G.run(2, { seed: 4, bot: 'expert', untimed: true }); t.ok(!!r.result && r.s.unt && r.s.caught > 0, `untimed lamp plays to the end (caught ${r.s.caught} of ${r.s.shown})`);
    G.reset(2, 4); sim.act({ k: 'unt', on: true }); const s = sim.s, b0 = s.bat; for (let k = 0; k < 300; k++) sim.step(sim.dt); t.ok(s.phase === 'court' && s.bat === b0, 'untimed: the courtship round waits for flashes');
    const f = s.flies.find(x => x.w); if (f) { const p = sim.flyPos(f, s.ct); sim.act({ k: 'flash', x: p[0], y: p[1] }); t.ok(f.c && Math.abs(s.bat - (b0 - 0.5)) < 1e-9, 'a flash on a white-eyed male catches him and costs half a second of battery'); } }

  /* 10. What if? runs earn no stars and match their lever */
  { let ok = true; const notes = [];
    for (const [lv, levers] of [[1, ['auto', 'flip']], [2, ['nomut', 'all']]]) for (const lever of levers) for (let seed = 1; seed <= (FAST ? 2 : 4); seed++) {
      G.run(lv, { seed, bot: 'expert' }); const snap = sim.snapshot(), base = sim.s.hist[sim.s.hist.length - 1];
      G.reset(lv, seed, { thaw: { gen: 1, snap, lever } }); let j = 0; while (!sim.result() && j < 40000) { sim.step(sim.dt); j++; }
      const r = sim.result(), s = sim.s, last = s.hist[s.hist.length - 1]; if (!r || r.mask !== 0) { ok = false; notes.push(lv + lever + 'mask'); continue; }
      if (lever === 'auto' && (Math.abs(s.hist[1].qf - 0.5) > 0.05 || Math.abs(last.qm - 0.5) > 0.06)) { ok = false; notes.push('auto ' + last.qm); }
      if (lever === 'flip' && Math.abs((2 * last.qf + last.qm) / 3 - 2 / 3) > 0.05) { ok = false; notes.push('flip ' + last.qf); }
      if (lever === 'nomut' && !(last.wm < base.wm)) { ok = false; notes.push('nomut ' + last.wm + ' vs ' + base.wm); }
      if (lever === 'all' && Math.abs(last.wm - sim.lampEq(0.2, 0.2, 1, sim.P().mu.v)) > 0.02) { ok = false; notes.push('all ' + last.wm); }
    }
    t.ok(ok, 'every What if? run ends, earns no stars and matches its lever' + (notes.length ? ' (' + notes.join(', ') + ')' : '')); }

  /* 11. result texts follow the run (lessons §1.5) */
  { G.reset(0, 1); const s = sim.s; s.goals = { f1: 1, f2: 1, wf: 0, rev: 0 }; s.phase = 'over'; t.eq(sim.result().interesting, 'nowhite', 'L1: no white daughter → "nowhite"');
    s.goals = { f1: 1, f2: 1, wf: 1, rev: 0 }; t.eq(sim.result().interesting, 'norev', 'L1: white daughters, no reverse cross → "norev"');
    const r = G.run(3, { seed: 2, bot: 'threshold' }); t.ok(['sons', 'father', 'grand', 'cvmiss', null].indexOf(r.result.interesting) >= 0 && r.result.interesting !== null, `boss: a bot that ignores priors gets a reason (${r.result.interesting})`); }

  /* 12. the opening card and the chapter's own world (D6 addendum, 21 Oct 2026) */
  { const I = ch.content.intro || {}, wc = x => String(x || '').split(/\s+/).filter(Boolean).length, sc = x => (String(x || '').match(/[.!?](\s|$)/g) || []).length;
    t.ok(['game', 'biology', 'how'].every(k => wc(I[k]) > 0 && wc(I[k]) <= 35 && sc(I[k]) >= 1 && sc(I[k]) <= 2), 'content.intro has game, biology and how, each 1–2 sentences and ≤ 35 words (' + ['game', 'biology', 'how'].map(k => wc(I[k])).join(', ') + ')');
    t.ok(/^#[0-9a-f]{6}$/i.test(ch.accent || '') && ch.accent.toUpperCase() !== '#A8263F', 'the chapter has its own accent (' + ch.accent + '), not the shell carmine');
    t.ok(!/\b(evolves?|chooses?|chose|needs?|wants?)\b/i.test([I.game, I.biology, I.how].join(' ')), 'the card never says an animal evolves, chooses or needs'); }
};
