/* tests/oracle_tap.js: science and engineering oracle for The Leaky Tap (v2). Run: node tests/oracle.js BUILD.html tap
   D5 §4 item 14 / D3 §5.3 acceptance: q̂ within 10% of μ/(hs) (dominant) and √(μ/s) (recessive); load within 15% of 2μ
   (dominant) and μ (recessive) at equilibrium, whatever s; the textbook values at a real μ. Plus: the Wright–Fisher colony's
   long-run mean tracks the recursion; relaxed selection raises q by about μ(1 − q) a generation and the doubling time the ask
   reads is the recursion's; the boss load spikes under harder hunting and returns to the drip line; shutting the drum halves
   it; determinism, replay and snapshots; the expert earns every star offered; no level offers three; no bot's union reaches
   three; the first action cannot fail; untimed play ends; What if? runs earn nothing. TP_FAST=1 runs fewer seeds. */
'use strict';
module.exports = function (G, t) {
  const { sim, ch } = G, FAST = !!process.env.TP_FAST, NS = FAST ? 6 : 20;
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);

  /* 1. the balance formulas (D5: within 10%), and the exact recursion's fixed point */
  { const mu = 0.02; let okD = true, okR = true; const notes = [];
    for (const s of [0.2, 0.4, 0.6, 0.8, 0.95]) {
      const qd = sim.qhat(s, 1, mu), qr = sim.qhat(s, 0, mu), fd = mu / s, fr = Math.sqrt(mu / s);
      if (Math.abs(qd - fd) / fd > 0.1) okD = false; if (Math.abs(qr - fr) / fr > 0.1) okR = false; notes.push(`s ${s}: ${qd.toFixed(4)}/${fd.toFixed(4)}, ${qr.toFixed(4)}/${fr.toFixed(4)}`);
      if (Math.abs(sim.qn(qd, s, 1, mu) - qd) > 1e-10 || Math.abs(sim.qn(qr, s, 0, mu) - qr) > 1e-10) { okD = false; notes.push('not a fixed point'); }
    }
    t.ok(okD, 'dominant: q̂ within 10% of μ ÷ (h·s), h = 1 (' + notes.join('; ') + ')');
    t.ok(okR, 'recessive: q̂ within 10% of √(μ ÷ s)');
    for (const h of [0.2, 0.5]) { const q = sim.qhat(0.5, h, 0.002), f = 0.002 / (h * 0.5); t.ok(Math.abs(q - f) / f < 0.15, `partly dominant h = ${h} (μ = 0.002, s = 0.5): q̂ ${q.toFixed(4)} near μ ÷ (h·s) = ${f.toFixed(4)}`); }
  }

  /* 2. the Haldane–Muller principle: load ≈ 2μ (dominant) and μ (recessive), whatever s (D5: within 15%) */
  { const mu = 0.02; let ok = true; const notes = [];
    for (const s of [0.2, 0.5, 0.8, 0.95]) { const Ld = sim.eqLoad(s, 1, mu), Lr = sim.eqLoad(s, 0, mu); notes.push(`s ${s}: ${(1000 * Ld).toFixed(1)}, ${(1000 * Lr).toFixed(1)}`); if (Math.abs(Ld - 2 * mu) / (2 * mu) > 0.15 || Math.abs(Lr - mu) / mu > 0.15) ok = false; }
    t.ok(ok, 'equilibrium load is 2μ dominant and μ recessive per 1000, whatever s (' + notes.join('; ') + ')'); }

  /* 3. Realistic values: μ = 1e-5 gives the textbook balances (and the 300-fold recessive gap the Why card quotes) */
  { const mu = 1e-5, qd = sim.qhat(1, 1, mu), qr = sim.qhat(1, 0, mu);
    t.near(qd, 1e-5, 1e-6, `real μ, s = 1, dominant: q̂ = ${qd.toExponential(3)}`);
    t.near(qr, Math.sqrt(1e-5), 2e-4, `real μ, s = 1, recessive: q̂ = ${qr.toExponential(3)} (√μ = 3.16e-3)`);
    t.ok(Math.abs(qr / qd - 316) < 20, `the recessive balance is ${(qr / qd).toFixed(0)} times the dominant one (about 316)`);
    const dd = sim.doubling(Math.sqrt(1e-5 / 0.5), 0, 1e-5); t.ok(dd > 400 && dd < 500, `at a real μ doubling from balance (s = 0.5) takes ${dd.toFixed(0)} generations (about 450)`); }

  /* 4. the Wright–Fisher colony tracks the recursion: long-run means at balance, and the copies dripped match those removed */
  { for (const [h, s] of [[1, 0.5], [0, 0.5], [0, 0.9]]) {
      const qs = [], ms = [], ks = [];
      for (let seed = 1; seed <= (FAST ? 3 : 8); seed++) {
        G.reset(h ? 0 : 1, seed); const S = sim.s; S.h = h; S.qE = S.q; for (let g = 0; g < 160; g++) { sim.generation(S, [], s); if (g >= 60) { qs.push(S.q); ms.push(S.hist[S.hist.length - 1].m); ks.push(S.hist[S.hist.length - 1].k); } }
      }
      const e = sim.qhat(s, h, 0.02);
      t.ok(Math.abs(mean(qs) - e) / e < 0.08, `colony h = ${h}, s = ${s}: long-run mean q ${mean(qs).toFixed(4)} against the recursion ${e.toFixed(4)}`);
      const dif = ms.map((x, i) => x - ks[i]), md = mean(dif), se = Math.sqrt(mean(dif.map(x => (x - md) * (x - md))) / dif.length);
      t.ok(Math.abs(md) <= 3 * se + 0.02 * mean(ms), `at balance the copies dripped in (${mean(ms).toFixed(1)}) match the copies removed (${mean(ks).toFixed(1)}) a generation (difference ${md.toFixed(1)}, SE ${se.toFixed(1)})`);
    } }

  /* 5. relaxed selection: Δq = μ(1 − q) with s = 0; the doubling time is the recursion's; the colony follows it */
  { const q0 = 0.2, q1 = sim.qn(q0, 0, 0, 0.02); t.near(q1 - q0, 0.02 * 0.8, 1e-12, 'with s = 0, q rises by μ(1 − q) in a generation');
    const d = sim.doubling(q0, 0, 0.02); t.near(d, Math.log(0.6 / 0.8) / Math.log(0.98), 0.02, `doubling from 0.2 takes ${d.toFixed(2)} generations (closed form ${(Math.log(0.6 / 0.8) / Math.log(0.98)).toFixed(2)})`);
    const ends = []; for (let seed = 1; seed <= (FAST ? 6 : 20); seed++) { const S = G.reset(2, seed), qE0 = S.qE; for (let g = 0; g < 30; g++) sim.generation(S, [], 0); ends.push(S.q - S.qE); void qE0; }
    t.ok(Math.abs(mean(ends)) < 0.01, `after 30 generations under the net the colony sits ${mean(ends).toFixed(4)} from the recursion on average`);
    const starts = new Set(); for (let seed = 1; seed <= 30; seed++) starts.add(G.reset(2, seed).q0); t.ok(starts.size === 3, `L3 opens at three balances by seed (${[...starts].join(', ')}), so no fixed doubling answer fits every run`); }

  /* 6. the boss: harder hunting spikes the load, then it returns to the drip line; shutting the drum halves it */
  { for (const mt of [0.014, 0.02, 0.026]) {
      let q = Math.sqrt(mt / 0.5), Ls = []; const h = 0;
      for (let g = 0; g < 40; g++) { const s = g < 5 ? 0.5 : 0.9, mu = g < 25 ? mt : mt / 2; Ls.push(1000 * sim.load(q, s, h)); q = sim.qn(q, s, h, mu); }
      t.ok(Ls[5] > 1.5 * Ls[4], `μ ${mt}: the load spikes when the gulls join (${Ls[4].toFixed(1)} → ${Ls[5].toFixed(1)} per 1000)`);
      t.ok(Math.abs(Ls[24] - 1000 * mt) / (1000 * mt) < 0.1, `μ ${mt}: twenty generations later it is back near the drip line (${Ls[24].toFixed(1)} against ${(1000 * mt).toFixed(1)})`);
      t.ok(Math.abs(Ls[39] - 500 * mt) / (500 * mt) < 0.15, `μ ${mt}: after the drum is shut it falls towards half (${Ls[39].toFixed(1)} against ${(500 * mt).toFixed(1)})`);
    }
    const tr = []; for (let seed = 1; seed <= NS; seed++) { const r = G.run(3, { seed, bot: 'expert' }); tr.push(r.s.exp.t1 / (1000 * r.s.mt)); }
    t.ok(tr.every(x => Math.abs(x - 1) < 0.03), 'the boss ask reads the equilibrium load at the gulls’ s: within 3% of μ on every seed'); }

  /* 7. determinism, replay and snapshots */
  { const a = G.run(0, { seed: 9, bot: 'expert' }), b = G.run(0, { seed: 9, bot: 'expert' });
    t.eq(a.s.hist, b.s.hist, 'same seed and actions give the same run');
    for (const lv of [0, 1, 2, 3]) {
      const r1 = G.run(lv, { seed: 11, bot: 'threshold' }), log = r1.s.log.slice(), want = JSON.stringify([r1.s.hist, r1.s.meals, r1.s.pred, r1.s.plugGen]);
      G.reset(lv, 11); let i = 0, tick = 0;
      while (!sim.result() && tick < 80000) { while (i < log.length && log[i][0] === tick) sim.act(log[i++][1]); sim.step(sim.dt); tick++; }
      t.eq(JSON.stringify([sim.s.hist, sim.s.meals, sim.s.pred, sim.s.plugGen]), want, `L${lv + 1}: replaying the action log reproduces the run`);
    }
    const snap = sim.snapshot(); sim.restore(snap); t.eq(sim.snapshot(), snap, 'snapshot round trip is exact'); t.ok(snap.length < 40000, `end snapshot ${snap.length} characters`); }

  /* 8. the expert earns every star its level offers; no level offers all three */
  { const want = [3, 3, 3, 5], got = [0, 0, 0, 0], n = FAST ? 8 : 20; let three = 0;
    for (let lv = 0; lv < 4; lv++) for (let seed = 1; seed <= n; seed++) { const r = G.run(lv, { seed, bot: 'expert' }); if (r.result && (r.result.mask & want[lv]) === want[lv]) got[lv]++; if (r.result && r.result.mask === 7) three++; }
    t.ok(three === 0, 'no level offers all three stars');
    got.forEach((g, lv) => t.ok(g / n >= 0.8, `L${lv + 1}: the expert earns every offered star (${want[lv]}) on ${g} of ${n} seeds`)); }

  /* 9. no bot's union across the unit reaches three stars (lessons rule 5), via ch.unitStars */
  { const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'lensAlways', 'line', 'halfNow'], worst = {};
    for (const b of bots) { worst[b] = 0; for (let seed = 1; seed <= (FAST ? 5 : 14); seed++) { const lv = []; for (let l = 0; l < 4; l++) { const r = G.run(l, { seed, bot: b }); lv.push(r.result ? r.result.mask & 7 : 0); if (r.result && (r.result.mask & 7) === 7) worst[b] = 9; } const u = ch.unitStars(lv); worst[b] = Math.max(worst[b], (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1)); } }
    t.ok(Object.values(worst).every(v => v < 3), 'no bot reaches three unit stars: ' + bots.map(b => b + ' ' + worst[b]).join(', ')); }

  /* 10. the asks: never pre-answered; "no change" never counts; a never-diving hunter cannot predict */
  { const s0 = G.reset(0, 3); t.ok(!s0.ask && s0.phase === 'dusk', 'L1 opens on a dusk, with no ask open');
    let ok = true; for (let seed = 1; seed <= NS; seed++) for (const lv of [0, 1]) { const r = G.run(lv, { seed, bot: 'line' }); if (r.s.hits[['a1', 'b1'][lv]]) ok = false; }
    t.ok(ok, '"no change" answers never earn the balance predictions');
    let ok2 = true; for (let seed = 1; seed <= NS; seed++) { const r = G.run(0, { seed, policy: (s, A) => s.ask ? { k: 'predict', id: s.ask.id, v: s.exp[s.ask.id] } : s.phase === 'dusk' && s.busy === 0 ? { k: 'end' } : null }); if (r.s.hits.a1) ok2 = false; }
    t.ok(ok2, 'a gull that never dives cannot earn Predict, even with the exact answer (the ask does not count)'); }

  /* 11. the first action cannot fail; untimed play ends; the lens blocks dives */
  { const s = G.reset(0, 4); let k = 0; while (k < 200 && !s.vis.some(c => c.alive && c.aff && c.ex && c.tm > 0.3)) { sim.step(sim.dt); k++; }
    const i = s.vis.findIndex(c => c.alive && c.aff && c.ex && c.tm > 0.3); sim.act({ k: 'dive', i }); for (let j = 0; j < 10; j++) sim.step(sim.dt);
    t.ok(i >= 0 && s.caught === 1, 'a dive on a chick tottering at the edge is a catch');
    const u = G.run(1, { seed: 5, bot: 'alwaysB', untimed: true }); t.ok(!!u.result, 'untimed: a gull that never dives still reaches the end');
    const e = G.run(3, { seed: 5, bot: 'expert', untimed: true }); t.ok(!!e.result, 'untimed: the boss plays to the end');
    const L = G.reset(1, 6); sim.act({ k: 'lens', on: true }); const before = L.dives; sim.act({ k: 'dive', i: 0 }); t.ok(L.dives === before && L.lensUsed, 'the lens blocks dives'); }

  /* 12. What if? runs end, earn no stars and move the way their lever says */
  { let ok = true; const notes = [];
    for (const [lv, levers] of [[0, ['halfs', 'real1']], [1, ['dom', 'real2']], [2, ['long', 'slow']], [3, ['nogulls', 'early']]]) for (const lever of levers) for (let seed = 1; seed <= (FAST ? 1 : 3); seed++) {
      const base = G.run(lv, { seed, bot: 'expert' }), snap = sim.snapshot(), sc = base.s.sCol;
      G.reset(lv, seed, { thaw: { gen: 1, snap, lever } }); let j = 0; while (!sim.result() && j < 60000) { sim.step(sim.dt); j++; }
      const r = sim.result(), S = sim.s; if (!r || r.mask !== 0) { ok = false; notes.push(lv + lever + ' mask'); continue; }
      const qEnd = S.qE;
      if (lever === 'halfs' && Math.abs(qEnd - sim.qhat(sim.clampS(sc / 2), 1, 0.02)) > 0.01) { ok = false; notes.push('halfs ' + qEnd); }
      if (lever === 'dom' && Math.abs(qEnd - sim.qhat(sc, 1, 0.02)) > 0.01) { ok = false; notes.push('dom ' + qEnd); }
      if (lever === 'long' && !(S.gen >= 90 && S.q > 0.6)) { ok = false; notes.push('long ' + S.gen + ' ' + S.q); }
      if ((lever === 'nogulls' || lever === 'early') && Math.abs(sim.lastLE(S) - 500 * S.mt) / (500 * S.mt) > 0.3) { ok = false; notes.push(lever + ' ' + sim.lastLE(S)); }
    }
    t.ok(ok, 'every What if? run ends, earns no stars and matches its lever' + (notes.length ? ' (' + notes.join(', ') + ')' : '')); }

  /* 13. the opening card and the chapter's own world (D6 addendum, 21 Oct 2026) */
  { const I = ch.content.intro || {}, wc = x => String(x || '').split(/\s+/).filter(Boolean).length, sc = x => (String(x || '').match(/[.!?](\s|$)/g) || []).length;
    t.ok(['game', 'biology', 'how'].every(k => wc(I[k]) > 0 && wc(I[k]) <= 35 && sc(I[k]) >= 1 && sc(I[k]) <= 2), 'content.intro has game, biology and how, each 1–2 sentences and ≤ 35 words (' + ['game', 'biology', 'how'].map(k => wc(I[k])).join(', ') + ')');
    t.ok(/^#[0-9a-f]{6}$/i.test(ch.accent || '') && ch.accent.toUpperCase() !== '#A8263F', 'the chapter has its own accent (' + ch.accent + ')');
    t.ok(!/\b(evolves?|chooses?|chose|needs?|wants?)\b/i.test([I.game, I.biology, I.how].join(' ')), 'the card never says an animal evolves, chooses or needs'); }
};
