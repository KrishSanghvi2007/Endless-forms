/* Oracle for the contract skeleton (docs/design/v2_chapter_skeleton.js), and the worked example of the
   tests/oracle_<id>.js convention: node tests/oracle.js BUILD.html skeleton (the skeleton is only in private test builds).
   An oracle checks the model's science and the sim's contract, headless: expectations, directions, determinism. */
module.exports = function (G, t) {
  const q = s => { let a = 0; for (const b of s.pop) a += (b.g[0] < 0.5 ? 1 : 0) + (b.g[1] < 0.5 ? 1 : 0); return a / (2 * s.pop.length); };
  const seeds = n => Array.from({ length: n }, (_, i) => i + 1);
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;

  // 1. Determinism: the same seed and the same bot give the same run, bit for bit (replays depend on it)
  const a = G.run(0, { seed: 11, bot: 'greedy' }), b = G.run(0, { seed: 11, bot: 'greedy' });
  t.eq(a.s.hist, b.s.hist, 'same seed and bot → identical a-share history');
  t.ok(a.result && a.result.mask >= 0 && a.result.mask <= 7, 'result() gives a star mask in 0..7');
  t.eq(a.s.hist.length, a.s.gens + 1, 'one a-share per generation plus the start');

  // 2. No selection, no migration: the a share is a martingale, so its mean change over a run is about zero
  const idle = seeds(200).map(sd => { const r = G.run(0, { seed: sd, policy: () => null }); return r.s.hist[r.s.hist.length - 1] - r.s.hist[0]; });
  t.near(mean(idle), 0, 0.02, 'idle gull: mean change in the a share over 5 generations ≈ 0 (drift only)');

  // 3. The stored expectation is (1 − m)·q(parents) + m·0.1 (migrants carry a at 0.1)
  const s = G.reset(1, 5); G.sim.breed(); const m = s.m;
  t.ok(m > 0, 'level 1 has migrants');
  t.near(G.sim.s.expect.g1, (1 - m) * 0.5 + m * 0.1, 0.12, 'expectation at the first dusk ≈ (1 − m)·q + 0.1·m around q = 0.5');

  // 4. Direction of selection: eating the visible (dark) beetles on pale sand raises the a share; dark sand lowers it
  const up = mean(seeds(40).map(sd => { const r = G.run(0, { seed: sd, bot: 'greedy' }); return r.s.hist[r.s.hist.length - 1] - r.s.hist[0]; }));
  const down = mean(seeds(40).map(sd => { const r = G.run(2, { seed: sd, bot: 'greedy' }); return r.s.hist[r.s.hist.length - 1] - r.s.hist[0]; }));
  t.ok(up > 0.1, `pale sand, eating what you see: a share rises (mean +${up.toFixed(3)})`);
  t.ok(down < -0.05, `dark sand: a share falls (mean ${down.toFixed(3)})`);

  // 5. Migration opposes selection: the same hunting moves the a share less when dark migrants arrive
  const mig = mean(seeds(40).map(sd => { const r = G.run(1, { seed: sd, bot: 'greedy' }); return r.s.hist[r.s.hist.length - 1] - r.s.hist[0]; }));
  t.ok(mig < up, `migrants damp the response (${mig.toFixed(3)} < ${up.toFixed(3)})`);
  t.note('q at reset of level 0, seed 1: ' + q(G.reset(0, 1)).toFixed(3));
};
