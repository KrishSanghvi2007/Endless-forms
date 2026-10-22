/* tests/oracle_forager.js: science and engineering oracle for The Forager (v2). Run: node tests/oracle.js BUILD.html forager
   D1 §3.7 / D5 §4 item 8 acceptance: for G(1 − e^(−t/τ)) with τ = 4 the best stay is 3.4 s at T = 2 and 6.5 s at T = 10, and a
   look-ahead bot cannot beat the scored rule. Plus: the diet rule's switch point (15 big ones a minute) and its independence from
   the small-prey rate, in theory and in the sim; the hawk round's exact expectation against realised rounds; the flock finding
   the tangent from any founders (and stopping at the best founder without mutation); the winter-night dynamic programme; nothing
   in the state foretells the next prey; determinism, replay and snapshots; the expert earning every star offered; no bot's union
   across the unit reaching three stars; the first action that cannot fail; untimed paths; What if? runs earning nothing.
   D6 decision 9: four levels (level numbers 0–3 run model kinds 0, 1, 2, 4; the evening flock is cut) and one prediction
   (the far orchard's best leaving time); the HUD's key lines are checked against the model.
   FG_FAST=1 runs fewer seeds. */
'use strict';
module.exports = function (G, t) {
  const { sim, ch, TB } = G, FAST = !!process.env.FG_FAST, NS = FAST ? 16 : 60;
  const mean = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  const se = a => { const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) * (x - m))) / Math.max(1, a.length)); };
  const policy = (fn) => (s, acts, rnd) => fn(s, acts, rnd);

  /* 1. the marginal value theorem: D5's oracle numbers, by the closed form and by brute force */
  { const t2 = sim.tStar(2), t10 = sim.tStar(10), t4 = sim.tStar(4);
    t.near(t2, 3.4, 0.05, `best stay at T = 2: ${t2.toFixed(3)} s (D5: 3.4 s)`);
    t.near(t10, 6.5, 0.06, `best stay at T = 10: ${t10.toFixed(3)} s (D5: 6.5 s)`);
    const brute = T => { let bt = 0, br = -1; for (let x = 0.001; x < 30; x += 0.001) { const r = sim.rateAt(x, T); if (r > br) { br = r; bt = x; } } return bt; };
    t.ok(Math.abs(brute(2) - t2) < 0.005 && Math.abs(brute(10) - t10) < 0.005 && Math.abs(brute(4) - t4) < 0.005, `tangent stays match a brute-force maximum of gain ÷ (T + t) (T = 4: ${t4.toFixed(3)} s)`);
    t.ok(sim.gainAt(1e3) > 5.999 && Math.abs(sim.gainAt(4) - 6 * (1 - Math.exp(-1))) < 1e-9, 'gain curve is 6(1 − e^(−t/4))'); }

  /* 2. in the sim, a fixed-time rule at the tangent stay beats shorter and longer stays (realised catches over the far orchard) */
  { const T = 10, ts = sim.tStar(T), rates = {};
    for (const at of [ts - 3, ts, ts + 3.5]) { const r = []; for (let seed = 1; seed <= NS; seed++) { const out = G.run(1, { seed, policy: (s) => { if (s.ask) return { k: 'predict', id: s.ask.id, v: 7 }; if (s.phase === 'tree' && s.i === 0) return s.tt * sim.dt >= 3.4 ? { k: 'leave' } : null; if (s.phase === 'tree' && s.tt * sim.dt >= at) return { k: 'leave' }; return null; } }); r.push(out.s.rec[1].eat / out.s.rec[1].sun); } rates[at.toFixed(2)] = r; }
    const k = Object.keys(rates), m = k.map(x => mean(rates[x]));
    t.ok(m[1] > m[0] && m[1] > m[2], `far orchard, realised rate by stay: ${k.map((x, i) => x + ' s → ' + m[i].toFixed(3)).join(', ')} (peak at the tangent)`);
    t.near(m[1], sim.rateAt(ts, T), 0.04, `realised rate at the tangent stay ${m[1].toFixed(3)} against the model's ${sim.rateAt(ts, T).toFixed(3)}`); }

  /* 3. a look-ahead bot cannot beat the scored rule: nothing in the state foretells the next prey, and rollouts gain nothing */
  { // (a) the state during search holds no pre-drawn arrival: two runs that agree up to a tick and then reseed R() diverge only after it
    G.reset(0, 5); let k = 0; while (k < 400) { const A = sim.actions(); if (A.length) sim.act(sim.bots.threshold(sim.s, A)); sim.step(sim.dt); k++; }
    const keys = Object.keys(sim.s).filter(x => /next|queue|arriv|future/i.test(x));
    t.ok(keys.length === 0 && !sim.s.prey || keys.length === 0, 'no next-arrival, queue or future field in the hedge state' + (keys.length ? ' (' + keys.join(', ') + ')' : ''));
    // (b) a Monte-Carlo look-ahead bot (private PRNG, 40 rollouts of the rest of the stretch for each choice) against the zero–one rule
    const roll = (s, take, rr) => {   // expected food over the rest of the stretch: take (or pass) this prey, then play the zero–one rule
      const r = sim.cfg(0).rd[s.i], dt = sim.dt; let food = 0, sun = s.sun, busy = 0;
      if (take) { food += s.prey.big ? 3 : 1; busy = 60; }
      while (true) {
        if (busy > 0) { busy--; sun += dt; continue; }
        if (sun >= r.S - 1e-9) break; sun += dt;
        if (rr() < (r.b + r.s) * dt) { const big = rr() < r.b / (r.b + r.s); if (big || r.b < 0.25) { food += big ? 3 : 1; busy = 60; } }
      }
      return food;
    };
    let seedR = 12345; const rr = () => { seedR = (seedR * 1103515245 + 12345) & 0x7fffffff; return seedR / 0x80000000; };
    const look = (s, acts) => { if (s.ask) return { k: 'predict', id: s.ask.id, v: s.exp[s.ask.id] }; if (!s.prey || s.busy) return null; let a = 0, b = 0; for (let j = 0; j < 40; j++) { a += roll(s, true, rr); b += roll(s, false, rr); } return { k: a >= b ? 'take' : 'pass' }; };
    const fa = [], fr = [];
    for (let seed = 1; seed <= (FAST ? 12 : 40); seed++) { fa.push(G.run(0, { seed, policy: look }).s.food); fr.push(G.run(0, { seed, bot: 'expert' }).s.food); }
    const d = mean(fa) - mean(fr), noise = 2 * Math.sqrt(se(fa) ** 2 + se(fr) ** 2);
    t.ok(d <= Math.max(noise, 0.02 * mean(fr)), `hedgerow: look-ahead bot ${mean(fa).toFixed(1)} food against the zero–one rule ${mean(fr).toFixed(1)} (difference ${d.toFixed(2)}, noise ${noise.toFixed(2)})`);
    // (c) orchard: a bot that leaves early after a slow spell (reading the realised catches) does not beat the tangent time rule
    const slow = (s) => { if (s.ask) return { k: 'predict', id: s.ask.id, v: s.exp[s.ask.id] }; if (s.phase !== 'tree') return null; const T = sim.cfg(1).rd[s.i].T, tt = s.tt * sim.dt, gap = tt - (s.lastC == null ? 0 : s.lastC); return tt >= sim.tStar(T) + 1.5 || (tt >= 1 && gap >= 1.6) ? { k: 'leave' } : null; };
    const ea = [], er = []; for (let seed = 1; seed <= (FAST ? 12 : 40); seed++) { ea.push(G.run(1, { seed, policy: slow }).s.eat); er.push(G.run(1, { seed, bot: 'expert' }).s.eat); }
    t.ok(mean(ea) <= mean(er) + 2 * Math.sqrt(se(ea) ** 2 + se(er) ** 2), `orchard: a giving-up-time bot ${mean(ea).toFixed(1)} against the tangent rule ${mean(er).toFixed(1)} caterpillars`);
  }

  /* 4. the diet rule: switch at 15 big ones a minute, whatever the small rate (theory), and the zero–one rule best in the sim */
  { const bs = sim.dietStar(); t.near(60 * bs, 15, 1e-9, `switch point bE ÷ (1 + bt) = 1 ÷ 2 at ${(60 * bs).toFixed(2)} big ones a minute`);
    const cross = sm => { let lo = 0.001, hi = 3; for (let k = 0; k < 60; k++) { const m = (lo + hi) / 2, r = sim.dietRates(m, sm); if (r.big > r.all) hi = m; else lo = m; } return (lo + hi) / 2; };
    t.ok([0.2, 0.5, 1.5, 4].every(sm => Math.abs(cross(sm) - 0.25) < 1e-6), 'take-all and big-only rates cross at 0.25 a second for small rates 0.2, 0.5, 1.5 and 4 a second');
    const run = bot => { const f = []; for (let seed = 1; seed <= NS; seed++) f.push(G.run(0, { seed, bot }).s.food); return mean(f); };
    const zo = run('threshold'), all = run('alwaysA');
    const bo = (() => { const f = []; for (let seed = 1; seed <= NS; seed++) f.push(G.run(0, { seed, policy: (s, A) => s.ask ? A[0] : s.prey && !s.busy ? { k: s.prey.big || s.prey.wait ? 'take' : 'pass' } : null }).s.food); return mean(f); })();
    t.ok(zo > all && zo > bo, `hedgerow food: zero–one rule ${zo.toFixed(1)}, take everything ${all.toFixed(1)}, big ones only ${bo.toFixed(1)}`); }

  /* 5. the hawk round: the expectation behind the chart and the star is exact for this sim's chain */
  { const r = sim.cfg(2).rd[1], ps = [0.01, 0.2, 0.5]; let ok = true; const notes = [];
    for (const p of ps) for (const take of [1, 0]) {
      const got = []; const rr = Object.assign({}, r, { p });
      for (let seed = 1; seed <= (FAST ? 150 : 500); seed++) {
        G.reset(2, seed); const s = sim.s; s.i = 1; s.rec.length = 1; sim.newRound(s, []); s.first = false;
        const saved = sim.cfg(2).rd[1].p; sim.cfg(2).rd[1].p = p;
        let k = 0; while (s.phase === 'run' && k < 20000) { if (s.prey && !s.busy) sim.act({ k: s.prey.field && !take ? 'pass' : 'take' }); sim.step(sim.dt); k++; }
        sim.cfg(2).rd[1].p = saved; got.push(s.rec[1].food);
      }
      const e = sim.riskE(p, take, rr), m = mean(got), tol = 3 * se(got) + 0.05; notes.push(`p ${p} ${take ? 'field' : 'hedge'}: ${m.toFixed(2)} vs ${e.toFixed(2)}`);
      if (Math.abs(m - e) > tol) ok = false;
    }
    t.ok(ok, 'hawk round: realised mean food matches the exact expectation (' + notes.join('; ') + ')');
    const pst = sim.riskStar(); t.ok(pst > 0.15 && pst < 0.25, `the two rules tie at a danger of ${(100 * pst).toFixed(1)}% per field trip`); }

  /* 6. D6 decision 9: only the far orchard asks (once); the HUD's key lines agree with the model */
  { let bad = 0, asked = 0; const n = FAST ? 6 : 16;
    for (let seed = 1; seed <= n; seed++) for (let lv = 0; lv < 4; lv++) { const r = G.run(lv, { seed, bot: 'threshold' }); const ids = r.s.asks; if (lv === 1) { if (ids.length === 1 && ids[0] === 'b1') asked++; else bad++; } else if (ids.length) bad++; }
    t.ok(bad === 0 && asked === n, `D6: only the far orchard asks, once (${asked} of ${n} seeds; ${bad} stray asks)`);
    G.reset(1, 2); const ask = (() => { const s = sim.s; let k = 0; while (!s.ask && k < 40000) { const A = sim.actions(); const a = A.length ? sim.bots.threshold(s, A) : null; if (a) sim.act(a); sim.step(sim.dt); k++; } return s.ask; })();
    t.ok(ask && Math.abs((ask.lo + ask.hi) / 2 - sim.tStar(10)) > ask.tol && Math.abs(ask.start - sim.tStar(10)) > ask.tol, `the far-orchard ask: mid-axis ${(ask.lo + ask.hi) / 2} s and the start ${ask.start} s both miss the tangent ${sim.tStar(10).toFixed(2)} s ± ${ask.tol}`);
    const H = ch.content.hud; ch.level = 0; G.reset(0, 1); const s0 = sim.s;
    const lines = [0, 1, 2].map(i => { s0.i = i; return ch.keyLine(s0); }), want = sim.cfg(0).rd.map(r => 60 * r.b < 15 ? H.takeSmall : H.passSmall);
    t.ok(lines.every((l, i) => l.indexOf(want[i]) >= 0) && 60 * sim.dietStar() === 15, 'hedge key line: "take them" only below 15 big ones a minute (' + lines.map(l => l.split(': ').pop()).join(' / ') + ')');
    ch.level = 2; G.reset(2, 1); const s2 = sim.s; const hl = [0, 1].map(i => { s2.i = i; return ch.keyLine(s2); });
    t.ok(hl[0].indexOf(H.fieldPays) >= 0 && hl[1].indexOf(H.hedgePays) >= 0, 'hawk key line: take field food at 1% danger, stay in the hedge at 50%');
    ch.level = 3; G.reset(3, 1); const s3 = sim.s; let okN = true; for (let i = 0; i < 4; i++) { sim.newEve(s3, []); s3.i = i; const [e, need] = sim.cfg(4).rd[i]; s3.e = e; s3.need = need; s3.v = 10; const l = ch.keyLine(s3); if (l.indexOf(e + 20 >= need ? H.playSafe : H.gamble) < 0) okN = false; }
    t.ok(okN, 'night key line: "play steady" exactly when steady feeding reaches the line'); }

  /* 7. the winter night: the dynamic programme, the energy-budget rule, and the expectation the ask reads */
  { t.near(sim.V(2, 10, 24), 0.7539, 0.0001, `chance of dawn from 2 with the line at 24: ${sim.V(2, 10, 24).toFixed(4)}`);
    t.near(sim.V(2, 10, 28), 0.3438, 0.0001, `from 2 with the line at 28: ${sim.V(2, 10, 28).toFixed(4)}`);
    t.ok(sim.V(4, 10, 22) === 1 && sim.V(6, 10, 24) === 1, 'safe nights: steady feeding reaches the line for sure');
    let rule = true; for (let need = 18; need <= 30; need++) for (let e = 0; e <= 30; e++) for (let v = 1; v <= 10; v++) { const q0 = sim.Q(0, e, v, need), q1 = sim.Q(1, e, v, need); if (e + 2 * v >= need && q1 > q0 + 1e-12) rule = false; }
    t.ok(rule, 'when steady feeding is enough, the gamble never beats it (energy-budget rule, positive budget)');
    const sv = []; for (let seed = 1; seed <= (FAST ? 40 : 200); seed++) sv.push(G.run(3, { seed, bot: 'expert' }).s.nights.filter(x => x.ok).length);
    const ex = sim.cfg(4).rd.reduce((a, [e, need]) => a + sim.V(e, 10, need), 0);
    t.near(mean(sv), ex, 3 * se(sv) + 0.05, `best play survives ${mean(sv).toFixed(2)} of 4 nights; the programme expects ${ex.toFixed(2)}`); }

  /* 8. determinism, replay and snapshots */
  { const a = G.run(1, { seed: 9, bot: 'expert' }), b = G.run(1, { seed: 9, bot: 'expert' });
    t.eq(a.s.deps, b.s.deps, 'same seed and actions give the same orchard run');
    for (const lv of [0, 2, 3]) {
      const r1 = G.run(lv, { seed: 11, bot: 'threshold' }), log = r1.s.log.slice(), want = JSON.stringify([r1.s.food, r1.s.eat, r1.s.rec, r1.s.fh || null, r1.s.nights || null]);
      G.reset(lv, 11); let i = 0, tick = 0;
      while (!sim.result() && tick < 60000) { while (i < log.length && log[i][0] === tick) sim.act(log[i++][1]); sim.step(sim.dt); tick++; }
      t.eq(JSON.stringify([sim.s.food, sim.s.eat, sim.s.rec, sim.s.fh || null, sim.s.nights || null]), want, `L${lv + 1}: replaying the action log reproduces the run`);
    }
    const snap = sim.snapshot(); sim.restore(snap); t.eq(sim.snapshot(), snap, 'snapshot round trip is exact'); t.ok(snap.length < 60000, `end snapshot ${snap.length} characters`); }

  /* 9. the expert earns every star its level offers; no level offers all three */
  { const want = [1, 3, 1, 5], got = [0, 0, 0, 0], n = FAST ? 8 : 20;
    let three = 0; for (let lv = 0; lv < 4; lv++) for (let seed = 1; seed <= n; seed++) { const r = G.run(lv, { seed, bot: 'expert' }); if (r.result && (r.result.mask & want[lv]) === want[lv]) got[lv]++; if (r.result && r.result.mask === 7) three++; }
    t.ok(three === 0, 'no level offers all three stars (the expert never earns 7 in one level)');
    got.forEach((g, lv) => t.ok(g / n >= 0.8, `L${lv + 1}: the expert earns every offered star (${want[lv]}) on ${g} of ${n} seeds`)); }

  /* 10. no bot's union across the unit reaches three stars (lessons rule 5), via ch.unitStars */
  { const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'lazy', 'bestNoThink'], worst = {};
    for (const b of bots) { worst[b] = 0; for (let seed = 1; seed <= (FAST ? 6 : 16); seed++) { const lv = []; for (let l = 0; l < 4; l++) { const r = G.run(l, { seed, bot: b }); lv.push(r.result ? r.result.mask & 7 : 0); if (r.result && (r.result.mask & 7) === 7) worst[b] = 9; } const u = ch.unitStars(lv); worst[b] = Math.max(worst[b], (u & 1) + ((u >> 1) & 1) + ((u >> 2) & 1)); } }
    t.ok(Object.values(worst).every(v => v < 3), 'no bot reaches three unit stars: ' + bots.map(b => b + ' ' + worst[b]).join(', ')); }

  /* 11. the first action cannot fail; untimed paths */
  { const s = G.reset(0, 3); for (let k = 0; k < 200; k++) sim.step(sim.dt);
    t.ok(s.prey && s.prey.big && s.prey.wait, 'L1: the first caterpillar is a big one and waits for you');
    sim.act({ k: 'pass' }); t.ok(!!s.prey, 'L1: a tap off the first caterpillar does not lose it');
    const r = G.run(0, { seed: 4, bot: 'random' }); t.ok(!!r.result, 'a random tapper reaches the end of the hedgerow');
    const u = G.reset(0, 6); sim.act({ k: 'unt', on: true }); let k = 0; while (k < 3000 && !(u.prey && !u.prey.wait)) { if (u.prey && u.prey.wait) sim.act({ k: 'take' }); sim.step(sim.dt); k++; }
    const id = u.prey && u.prey.id; for (let j = 0; j < 300; j++) sim.step(sim.dt); t.ok(u.prey && u.prey.id === id, 'untimed: a caterpillar waits for take or pass');
    const o = G.reset(1, 6); sim.act({ k: 'unt', on: true }); const tt0 = o.tt; for (let j = 0; j < 300; j++) sim.step(sim.dt); const still = o.tt === tt0; sim.act({ k: 'stay' }); t.ok(still && o.tt === tt0 + 15, 'untimed orchard: time in the tree moves only by Stay, half a second at a time');
    const un = G.run(3, { seed: 2, bot: 'expert', untimed: true }); t.ok(!!un.result, 'the boss plays to the end untimed'); }

  /* 12. What if? runs earn no stars and report their own numbers */
  { let ok = true; const notes = [];
    for (const [lv, levers] of [[0, ['takeall', 'bigonly']], [1, ['quick', 'slow']], [2, ['bold', 'nohawk']], [3, ['steady', 'gamble']]]) for (const lever of levers) for (let seed = 1; seed <= (FAST ? 2 : 5); seed++) {
      const base = G.run(lv, { seed, bot: 'expert' }); const snap = sim.snapshot();
      G.reset(lv, seed, { thaw: { gen: 1, snap, lever } }); let j = 0; while (!sim.result() && j < 40000) { sim.step(sim.dt); j++; }
      const r = sim.result(), s = sim.s; if (!r || r.mask !== 0) { ok = false; notes.push(lv + lever + seed + ' mask'); continue; }
      if (lv === 0 && !(s.rec[2] && s.rec[2].sun > 0)) { ok = false; notes.push('L1 no swarm rerun'); }
      if (lv === 3 && lever === 'steady' && s.wfix[1] !== 0) { ok = false; notes.push('steady short night'); }
      void base;
    }
    t.ok(ok, 'every What if? run ends, earns no stars and matches its lever' + (notes.length ? ' (' + notes.join(', ') + ')' : '')); }

  /* 13. the opening card and the chapter's own world (D6 addendum, 21 Oct 2026) */
  { const I = G.ch.content.intro || {}, wc = x => String(x || '').split(/\s+/).filter(Boolean).length, sc = x => (String(x || '').match(/[.!?](\s|$)/g) || []).length;
    t.ok(['game', 'biology', 'how'].every(k => wc(I[k]) > 0 && wc(I[k]) <= 35 && sc(I[k]) >= 1 && sc(I[k]) <= 2), 'content.intro has game, biology and how, each 1–2 sentences and ≤ 35 words (' + ['game', 'biology', 'how'].map(k => wc(I[k])).join(', ') + ')');
    t.ok(/^#[0-9a-f]{6}$/i.test(G.ch.accent || '') && G.ch.accent.toUpperCase() !== '#A8263F', 'the chapter has its own accent (' + G.ch.accent + '), not the shell carmine');
    t.ok(!/\b(evolves?|chooses?|chose|needs?|wants?)\b/i.test([I.game, I.biology, I.how].join(' ')), 'the card never says a bird evolves, chooses or needs'); }
};
