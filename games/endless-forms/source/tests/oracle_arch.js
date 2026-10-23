/* tests/oracle_arch.js: the science oracle for The Archipelago (v2/arch.js; D3 §4.8 cut down by D6 decisions 9–10).
   Run: node tests/oracle.js BUILD.html arch          (ARC_FAST=1 for a quicker pass)
   Checks: the seed crop and the utilisation model; wet years select almost nothing; a 1977-style drought kills most finches
   and favours deep beaks (Boag and Grant 1981); with large ground finches a drought favours slim beaks (Grant and Grant
   2006) and the competitor is the cause; the breeder's equation R ≈ h²S holds on average and vanishes without inheritance;
   song-assortative pairing keeps the Big Bird family's beaks apart (Lamichhaney et al. 2018); determinism and snapshot replay;
   the expert earns each level's stars (population levels are stochastic: at least 90% of seeds, L3 every seed); no level
   offers three stars and no bot's union reaches three; fixed strategies miss Discover; Interesting and What if? texts match. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim: S } = G, FAST = !!process.env.ARC_FAST, N = k => FAST ? Math.max(6, Math.round(k / 4)) : k;
  const run = (lv, seed, bot, extra) => G.run(lv, Object.assign({ seed, bot, cap: 60000 }, extra || {}));
  const stars3 = m => ((m & 1) ? 1 : 0) + ((m & 2) ? 1 : 0) + ((m & 4) ? 1 : 0);
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  // drive a level with a fixed weather plan (mm per year; a number or one per island) and a call
  const plan = (lv, seed, p, call) => { G.reset(lv, seed); const s = S.s; let g = 0;
    while (s.phase !== 'over' && g++ < 200000) {
      if (s.phase === 'season' && !S.forced(s)) { const w = Array.isArray(p[s.year]) ? p[s.year] : s.rain.map(() => p[s.year] == null ? 250 : p[s.year]); w.forEach((mm, i) => { if (mm > 0) S.act({ k: 'rain', i, mm }); }); S.act({ k: 'end' }); }
      if (s.ask) S.act({ k: 'predict', id: 'dir', v: call == null ? -1 : call });
      S.step(S.dt);
    }
    return s; };

  /* ---------- the model ---------- */
  { G.reset(0, 1); const I = S.s.isl[0], K0 = S.crop(I, 0), K1 = S.crop(I, 150), sum = a => a.reduce((x, y) => x + y, 0);
    t.near(sum(K0), 22 + 4 + 2, 1e-6, 'crop: a drought leaves only the lasting seeds (28 bird-years on Daphne, 1977)');
    t.near(sum(K1) - sum(K0), 150 * 2, 1e-6, 'crop: rain adds small soft seeds, 2 bird-years per mm');
    t.near(S.use(10, 10), 1, 1e-12, 'utilisation peaks at the seed size matching the beak'); t.near(S.use(11.5, 10), Math.exp(-0.5), 1e-12, 'and falls as a Gaussian of width 1.5 mm (legacy)'); }
  { const wet = [], dry = [];
    for (let sd = 1; sd <= N(30); sd++) { G.reset(0, sd); wet.push(S.expS(S.s.isl[0], 250)); dry.push(S.expS(S.s.isl[0], 0)); }
    t.ok(Math.abs(mean(wet)) < 0.06, `a very wet year selects almost nothing: expected S ${mean(wet).toFixed(3)} mm`);
    t.ok(mean(dry) > 0.4, `a 1977-style drought favours deep beaks: expected S +${mean(dry).toFixed(2)} mm (observed 1977: +0.54, Boag and Grant 1981)`); }
  { let died = 0, n = 0, Ss = [];
    for (let sd = 1; sd <= N(40); sd++) { G.reset(0, sd); const s = S.s, ev = []; s.rain = [0]; S.feed(s, ev); died += ev[0].died; n += ev[0].n; Ss.push(s.sel.S); }
    const m = died / n; t.ok(m > 0.75 && m < 0.95, `a drought kills ${Math.round(m * 100)}% of medium ground finches (about 85% in 1977)`);
    t.ok(mean(Ss) > 0.4 && Ss.filter(x => x > 0).length >= Ss.length * 0.9, `realised drought S averages +${mean(Ss).toFixed(2)} mm, positive in ${Ss.filter(x => x > 0).length} of ${Ss.length} runs`); }
  { const a = [], b = [];
    for (let sd = 1; sd <= N(30); sd++) { G.reset(2, sd); a.push(S.expS(S.s.isl[0], 0)); S.s.isl[0].birds = S.s.isl[0].birds.filter(x => x.sp !== 'm'); b.push(S.expS(S.s.isl[0], 0)); }
    t.ok(a.every(x => x < -0.1), `with large ground finches, every 2004 drought favours slim beaks (expected S ${mean(a).toFixed(2)} mm)`);
    t.ok(mean(b) > mean(a) + 0.3, `remove the large ground finches and the push vanishes (${mean(b).toFixed(2)} against ${mean(a).toFixed(2)} mm): the competitor is the cause`); }

  /* ---------- the breeder's equation ---------- */
  { const ratio = [], none = [];
    for (let sd = 1; sd <= N(80); sd++) {
      const s = plan(0, sd, [0, 250, 250, 250, 250, 250]); if (s.lastS != null && s.lastR != null && s.lastS > 0.2) ratio.push(s.lastR / s.lastS);
    }
    t.near(mean(ratio), 0.8, 0.15, `chicks after a drought: realised R/S averages ${mean(ratio).toFixed(2)} over ${ratio.length} runs (h² = 0.8)`);
    for (let sd = 1; sd <= N(30); sd++) { G.reset(0, sd); const snap = S.snapshot(); const r = G.run(0, { seed: sd, reset: { thaw: { snap, lever: 'noh2', rains: [[0], [250], [250], [250], [250], [250]] } } }); none.push(S.dBeak(r.s)); }
    t.ok(Math.abs(mean(none)) < 0.15, `with no inheritance, the same weather leaves the average beak where it was (${mean(none).toFixed(2)} mm)`); }

  /* ---------- the Big Bird family: song keeps it apart ---------- */
  { const keep = [], mix = [];
    for (let sd = 1; sd <= N(30); sd++) {
      const s = plan(3, sd, []); if (S.family(s.isl[0]).length >= 4) keep.push(S.famGap(s));
      G.reset(3, sd); const snap = S.snapshot(); const r = G.run(3, { seed: sd, reset: { thaw: { snap, lever: 'random' } } }); if (S.family(r.s.isl[0]).length >= 4) mix.push(S.famGap(r.s));
    }
    t.ok(mean(keep) > 0.4, `pairing by song: the family's beaks end ${mean(keep).toFixed(2)} mm deeper than medium ground finches' (${keep.length} runs)`);
    t.ok(mix.length === 0 || mean(mix) < mean(keep) - 0.2, `mating at random: the gap shrinks to ${mix.length ? mean(mix).toFixed(2) : '—'} mm`);
    G.reset(3, 1); const f = S.s.isl[0].birds.find(b => b.founder); t.ok(f && f.song === 1 && f.z === 12, 'level 4 starts with one immigrant male who sings his own song'); }

  /* ---------- determinism and snapshot replay ---------- */
  for (const lv of [0, 1, 2, 3]) {
    const a = run(lv, 11, 'expert'), b = run(lv, 11, 'expert'); t.eq(a.s.rec, b.s.rec, `L${lv + 1}: the same seed and actions give the same history`);
    G.reset(lv, 12); const pol = G.bot('expert'); let ticks = 0, snap = null, at = 0;
    while (!S.result() && ticks < 60000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, () => 0.5); if (x) { S.s.log.push([ticks, x]); S.act(x); } } S.step(S.dt); ticks++; if (ticks === 400) { snap = S.snapshot(); at = ticks; } }
    const end = JSON.stringify(S.s.rec); S.restore(snap); let k = at;
    while (!S.result() && k < 60000) { const A = S.actions(); if (A.length) { const x = pol(S.s, A, () => 0.5); if (x) { S.s.log.push([k, x]); S.act(x); } } S.step(S.dt); k++; }
    t.ok(JSON.stringify(S.s.rec) === end, `L${lv + 1}: a snapshot at tick 400 restores and replays to the same end`);
  }

  /* ---------- stars ---------- */
  const offers = [1, 1, 3, 4], seeds = N(30), need = [0.9, 0.9, 0.9, 0.9];
  for (let lv = 0; lv < 4; lv++) {
    let all = 0; for (let sd = 1; sd <= seeds; sd++) { const r = run(lv, sd, 'expert'); if ((r.result.mask & offers[lv]) === offers[lv]) all++; }
    t.ok(all >= Math.ceil(need[lv] * seeds), `L${lv + 1}: the expert earns the level's stars on ${all} of ${seeds} seeds (needs ${Math.round(need[lv] * 100)}%; populations are stochastic)`);
  }
  { const lv = [0, 1, 2, 3].map(l => run(l, 3, 'expert').result.mask); t.eq(ch.unitStars(lv), 7, 'the expert\'s levels add up to all three unit stars'); }
  for (const b of ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold']) {
    let worst = 0, three = 0, off = 0;
    for (let sd = 1; sd <= seeds; sd++) {
      const masks = [0, 1, 2, 3].map(l => { const r = run(l, sd, b); const m = r.result ? r.result.mask : 0; if (stars3(m) === 3) three++; if (m & ~offers[l]) off++; return m; });
      worst = Math.max(worst, stars3(ch.unitStars(masks)));
    }
    t.ok(three === 0 && off === 0 && worst < 3, `bot ${b}: no level gives three stars, none outside its offer, union at most ${worst} star(s)`);
  }
  for (const [lv, b] of [[0, 'alwaysA'], [1, 'alwaysA'], [2, 'alwaysA'], [0, 'alwaysB'], [1, 'alwaysB'], [2, 'alwaysB']]) {
    let d = 0; for (let sd = 1; sd <= seeds; sd++) if (run(lv, sd, b).result.mask & 1) d++;
    t.eq(d, 0, `fixed weather "${b === 'alwaysA' ? 'always wet' : 'never rain'}" never earns L${lv + 1} Discover`);
  }
  { let tr = 0; for (let sd = 1; sd <= seeds; sd++) if (run(3, sd, 'alwaysB').result.mask & 4) tr++; t.eq(tr, 0, 'L4: never raining never brings the family through'); }
  { let p = 0, d = 0; for (let sd = 1; sd <= seeds; sd++) { const r = run(2, sd, 'greedy'); if (r.result.mask & 2) p++; const r2 = run(2, sd, 'expert'); if (r2.s.askS < 0) d++; }
    t.eq(p, 0, 'L3: calling "deep beaks" (the level 1 answer) never earns Predict'); t.eq(d, seeds, 'L3: the call is scored against the expected S, negative at every first drought'); }

  /* ---------- Interesting results say what happened ---------- */
  { let bad = 0; const seen = {};
    for (const b of ['alwaysA', 'alwaysB', 'greedy', 'threshold', 'expert', 'random']) for (let sd = 1; sd <= N(8); sd++) for (let lv = 0; lv < 4; lv++) {
      const r = run(lv, sd, b), k = r.result.interesting, s = r.s, I = s.isl[0]; if (!k) continue; seen[k] = (seen[k] || 0) + 1;
      const ok = k === 'crash' ? S.count(I) < (lv === 0 ? 20 : 15) : k === 'flat' ? s.droughts === 0 : k === 'lost' ? s.isl.some(J => S.count(J) < 10) : k === 'wet' ? s.droughts === 0
        : k === 'gone' ? S.family(I).length === 0 : k === 'pair' ? S.famLow(s) <= 4 : false;
      if (!ok) bad++;
    }
    t.eq(bad, 0, 'every Interesting result matches its own run (' + Object.keys(seen).join(', ') + ')'); }

  /* ---------- What if? ---------- */
  { const ds = []; for (let sd = 1; sd <= N(12); sd++) { G.reset(0, sd); const snap = S.snapshot(); const r = G.run(0, { seed: sd, reset: { thaw: { snap, lever: 'allrain' } } }); ds.push(S.dBeak(r.s)); if (r.result.mask) t.ok(false, 'a thaw awards no stars'); }
    t.ok(Math.abs(mean(ds)) < 0.25, `What if? every year wet: the average beak barely moves (${mean(ds).toFixed(2)} mm)`); }
  { const a = [], b = []; for (let sd = 1; sd <= N(12); sd++) { G.reset(1, sd); const snap = S.snapshot(); const p = run(1, sd, 'expert'); a.push(S.spread(p.s)); const r = G.run(1, { seed: sd, reset: { thaw: { snap, lever: 'mix', rains: p.s.rains } } }); b.push(S.spread(r.s)); }
    t.ok(mean(b) < mean(a) - 0.5, `What if? eight migrants a year: the spread falls from ${mean(a).toFixed(2)} to ${mean(b).toFixed(2)} mm`); }

  /* ---------- result codes, shape ---------- */
  { const r = run(2, 4, 'expert'); const bits = ch.resultBits(r.s, 2); t.ok(bits >= 0 && bits < (1 << 30) && (bits & 7) === r.result.mask, 'resultBits packs the mask, the beak change, the count and the call into 30 bits'); }
  t.eq(ch.levels.length, 4, 'four levels (D6 decision 9)'); t.eq(ch.content.levelStars.length, 4, 'a star line for each level');
};
