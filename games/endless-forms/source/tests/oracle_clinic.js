/* tests/oracle_clinic.js: the science oracle for The Clinic (D1 §3.8, D5 §4 item 11, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html clinic          (CL_FAST=1 for a quicker, smaller pass)
   D5's acceptance lines:
     A. untreated ×8 a day (resistant ×7);
     B. double mutants ≈ the product of the single-mutant rates;
     C. untreated loads under 10⁵ clear within 5 days;
     D. a fixed-schedule bot cannot three-star a level (no level offers three stars at all).
   D6 decision 9 (22 Oct 2026) cut the unit to four levels (The course, Weekends at home, Two drugs, The bay) with one prediction
   (L3: cells resisting both drugs); the contested two-bed level and the compensated-plasmid boss were removed.
   Plus the model's own claims: zero net growth at the MIC (and at the MPC for a single-step mutant); the window enriches mutants
   and doses above the MPC suppress both; every dose spends ln(MPC/MIC)/k in the window whatever its size; the Luria–Delbrück
   history (mean = the expectation, variance ≫ mean); low doses select resistance and spaced high doses cure; combinations hold
   where one drug fails; Stewart–Levin (a costly plasmid falls without the drug); clean hands and treating fevers contain the
   ward; the HUD's key numbers match the model; determinism, snapshot and replay; stars scored against the expectation ("no change" never earns Predict,
   an expert earns what each level offers); every bot finishes every level, none earns three stars in a level or across the unit;
   What if? runs end and their texts follow the run. */
'use strict';
module.exports = function (G, t) {
  const { ch, sim, TB } = G, FAST = !!process.env.CL_FAST, NS = k => FAST ? Math.max(4, Math.round(k / 4)) : k;
  const sum = a => a.reduce((x, y) => x + y, 0), l10 = x => Math.log10(x);
  const PK = TB.ClinicPK, bS = Math.log(8), bR = Math.log(7);
  const blank = (kind, n, C) => ({ kind, n: n.slice(), C: C.slice(), used: 0, win: 0, cured: null, icu: null, out: 0, n0: n.slice(), under: false, res: false, doses: [] });
  const days = (b, d, tpd, expd, dose) => { for (let k = 0; k < d * tpd; k++) { if (dose) dose(b, k, tpd); sim.tbTick(b, 1 / tpd, !!expd); } return b; };
  G.reset(0, 1);

  /* ---------- A. growth: untreated ×8 a day, resistant ×7 (well below capacity, above the immune line) ---------- */
  { const b = days(blank('tb1', [1e6, 1e6], [0]), 1, 60, true);
    t.near(b.n[0] / 1e6, 8 * Math.exp(0) * Math.exp(-0) * (1 - 0), 0.02, 'A. untreated susceptible cells grow ×8 a day (got ×' + (b.n[0] / 1e6).toFixed(3) + ', crowding 0.02%)');
    t.near(b.n[1] / 1e6, 7, 0.02, 'A. resistant mutants grow ×7 a day: the cost of resistance (got ×' + (b.n[1] / 1e6).toFixed(3) + ')'); }

  /* ---------- C. the immune line: under 10⁵ an untreated load clears within 5 days; above it, it grows ---------- */
  for (const n0 of [99999, 5e4, 1e3]) { const b = blank('tb1', [n0, 0], [0]); let d = 0; for (; d < 10 && sum(b.n) > 0; d++) days(b, 1, 60, false); t.ok(sum(b.n) === 0 && d <= 5, `C. an untreated load of ${n0} clears in ${d} days (≤ 5)`); }
  { const b = days(blank('tb1', [2e5, 0], [0]), 2, 60, false); t.ok(sum(b.n) > 2e5 * 50, 'C. above the line (2 × 10⁵) the immune system is swamped and the load grows'); }

  /* ---------- the pharmacodynamics: zero net growth at the MIC, and at the MPC for a single-step mutant ---------- */
  t.near(PK.psi(bS, 1, -3, 1), 0, 1e-12, 'PD: net growth of a susceptible cell is zero at the MIC (Regoes et al. 2004 form)');
  t.near(PK.psi(bR, 16 / 16, -3, 1), 0, 1e-12, 'PD: a single-step mutant’s net growth is zero at the MPC (its own MIC)');
  t.ok(PK.psi(bS, 4, -3, 1) < -2 && PK.psi(bR, 4 / 16, -3, 1) > 1.5, 'PD: inside the window (4× MIC) susceptible cells die and mutants grow');
  t.ok(PK.psi(bS, 32, -3, 1) < -2.5 && PK.psi(bR, 2, -3, 1) < -1, 'PD: above the MPC (32× MIC) both die');
  t.ok(PK.psi(bS, 1e4, -3, 1) > -3 - 1e-9, 'PD: the drug kills at most 95% a day (net −3 a day at saturation)');
  { // every dose crosses the window in ln(MPC/MIC)/k, whatever its size
    const k = Math.log(8), want = Math.log(16) / k; let ok = true, got = [];
    for (const D of [24, 48, 64]) { let C = D, tt = 0, tin = 0; const dt = 1 / 600, f = PK.decay(k, dt); while (C > 0.5) { if (C >= 1 && C < 16) tin += dt; C *= f; tt += dt; } got.push(tin.toFixed(3)); if (Math.abs(tin - want) > 0.01) ok = false; }
    t.ok(ok, `PK: a falling dose spends ln(16)/ln(8) = ${want.toFixed(3)} days (32 h) in the window, whatever the dose (${got.join(', ')})`);
    t.near(PK.window(1, 16, k), want, 1e-9, 'PK: ClinicPK.window gives the same time');
  }

  /* ---------- the Luria–Delbrück history and B. double mutants ---------- */
  { const e = sim.ldExp(), N = 1e9, M = NS(600); let s1 = 0, s2 = 0, ab = 0, big = 0;
    for (let i = 0; i < M; i++) { TB.seed(1000 + i); const h = sim.ld('tb2'); s1 += h.a; s2 += h.a * h.a; ab += h.ab; if (h.a > 20 * e.a) big++; }
    const mean = s1 / M, vr = s2 / M - mean * mean;
    t.ok(Math.abs(mean - e.a) / e.a < (FAST ? 0.6 : 0.35), `LD: the mean resistant count (${mean.toFixed(0)}) matches the expectation (${e.a.toFixed(0)}) within sampling error of a heavy-tailed law`);
    t.ok(vr / mean > 50, `LD: variance ÷ mean = ${(vr / mean).toFixed(0)} ≫ 1, Luria–Delbrück jackpots (${big} of ${M} plates above 20× the mean)`);
    const fA = e.a / N, fAB = e.ab / N, ratio = fAB / (fA * fA);
    t.ok(ratio > 0.5 && ratio < 2, `B. double-mutant frequency ${fAB.toExponential(2)} ≈ the product of the single frequencies ${(fA * fA).toExponential(2)} (ratio ${ratio.toFixed(2)})`);
    t.ok(e.ab < 1e-3, `B. expected cells resisting both among 10⁹: ${e.ab.toExponential(2)} (almost certainly none)`);
    t.ok(ab / M < 0.05, `B. realised plates with a double mutant: mean ${(ab / M).toFixed(3)} a plate`);
  }

  /* ---------- the levels' lessons, on the real sim with simple policies ---------- */
  const pol = f => (s, acts) => acts.length && acts[0].k === 'predict' ? acts[Math.floor(acts.length / 2)] : acts.length && acts[0].k === 'next' ? acts[0] : f(s);
  const dose = (bed, hi, d) => ({ k: 'dose', bed, hi: !!hi, d: d || 0 });
  const rate = (lv, f, test, n) => { let k = 0; n = n || NS(20); for (let sd = 1; sd <= n; sd++) { const r = G.run(lv, { seed: sd, policy: pol(f) }); if (test(r.s, r)) k++; } return k / n; };
  const above = b => sum(b.n) >= 1e5;
  const low12 = s => s.tick % 30 === 0 && s.beds[0].cured == null ? dose(0) : null;
  const highDay = s => { const b = s.beds[0]; return b.cured == null && above(b) && s.tick === 0 ? dose(0, 1) : null; };
  t.ok(rate(0, low12, s => sim.resShare(s.beds[0]) >= 0.5) >= 0.95, 'L1: low doses twice a day (inside the window) let resistant cells take over on ≥ 95% of seeds');
  t.ok(rate(0, highDay, s => s.beds[0].cured != null) === 1, 'L1: one high dose a day while above the immune line cures every seed, within the budget');
  t.ok(rate(0, () => null, s => s.beds[0].cured == null && sim.resShare(s.beds[0]) < 0.01) === 1, 'L1: no drug: the infection stays, mostly susceptible (the cost keeps mutants rare)');
  t.ok(rate(1, highDay, s => s.beds[0].cured == null) >= 0.9, 'L2: the same once-a-day plan fails when weekends at home interrupt it');
  t.ok(rate(1, s => { const b = s.beds[0]; return above(b) && b.C[0] < 10 ? dose(0, 1) : null; }, s => s.beds[0].cured != null) >= 0.9, 'L2: loading before the weekend can still cure (at a high dose cost)');
  const both12 = s => s.tick % 27 === 0 && sum(s.beds[0].n) > 0 ? dose(0, 0, 2) : null, onlyA = s => { const b = s.beds[0]; return above(b) && b.C[0] < 2 ? dose(0, 0, 0) : null; };
  t.ok(rate(2, both12, s => s.beds[0].cured != null && s.beds[0].n[3] === 0) >= 0.95, 'L3: low doses of both drugs twice a day cure despite the weekends, with no double mutant');
  t.ok(rate(2, onlyA, s => s.beds[0].n[1] / Math.max(1, sum(s.beds[0].n)) >= 0.5) >= 0.95, 'L3: drug A alone: cells resisting A take over');

  /* ---------- the ward: Stewart–Levin, gut selection, hands ---------- */
  { G.reset(3, 1); const s = sim.s; for (const b of s.beds) { b.p = 0; b.fev = null; b.C = 0; } s.beds[0].p = 0.5; s.beds[0].c = 0.45; s.beds[1].p = 0.5; s.beds[1].c = 0.28; s.beds[2].p = 0.05; s.beds[2].C = 8;
    for (let k = 0; k < 45 * 5; k++) sim.wardTick(s, 1 / 45, { proj: true, hyg: 1 });   // hands perfectly clean: no transfer between beds
    t.ok(s.beds[0].p < 0.3, `Ward: a costly plasmid (γ 0.3 < c 0.45 + δ 0.02) falls without the drug: 0.50 → ${s.beds[0].p.toFixed(2)} in 5 days (Stewart and Levin 1977)`);
    t.ok(Math.abs(s.beds[1].p - 0.5) < 0.05, `Ward (the card's compensation note): at c = 0.28 transfer balances cost plus loss: 0.50 → ${s.beds[1].p.toFixed(2)}`);
    t.ok(s.beds[2].p > 0.1, `Ward: one dose selects the plasmid in the gut: 0.05 → ${s.beds[2].p.toFixed(2)}`);
    G.reset(3, 1); const s2 = sim.s; for (const b of s2.beds) { b.p = 0; b.fev = null; } s2.beds[0].p = 0.9;
    const after = hyg => { const z = JSON.parse(JSON.stringify(s2)); for (let k = 0; k < 45 * 3; k++) sim.wardTick(z, 1 / 45, { proj: true, hyg }); return sum(z.beds.slice(1).map(b => b.p)); };
    t.ok(after(0.4) > 3 * after(0.9), `Ward: hands at 40% compliance carry ${(after(0.4) / Math.max(1e-9, after(0.9))).toFixed(1)}× more plasmid to other beds than at 90%`);
  }
  { // the bay's lesson: treat every fever and keep hands clean; treating alone spreads the plasmid; doing nothing fills the ICU
    const mk = th => s => { if (s.tick !== 0) return null; for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1) return { k: 'dose', bed: i }; return s.ward.hyg < th ? { k: 'rub' } : null; };
    const stat = f => { let seen = 0, icu = 0; const n = NS(30); for (let sd = 1; sd <= n; sd++) { const r = G.run(3, { seed: sd, policy: pol(f) }); seen += r.s.ward.seen; icu += r.s.ward.icu; } return [seen / n, icu / n]; };
    const both = stat(mk(0.89)), treat = stat(mk(0)), none = stat(() => null);
    t.ok(treat[0] > both[0] + 1.5, `Ward: treating fevers without hand rubs spreads the plasmid to ${treat[0].toFixed(1)} patients, against ${both[0].toFixed(1)} with daily rubs`);
    t.ok(none[1] > both[1] + 3, `Ward: untreated fevers send ${none[1].toFixed(1)} patients to intensive care, against ${both[1].toFixed(1)} when treated`);
  }
  /* ---------- the HUD's key numbers (D6 decision 9) match the model ---------- */
  { const H = ch.content.hud;
    t.ok(/32 h/.test(H.key1) && Math.abs(PK.window(1, 16, Math.log(8)) * 24 - 32) < 0.01, 'key number L2: a fading dose spends ln 16 ÷ ln 8 days = 32 h in the window');
    t.ok(/1× to 16×/.test(H.key0), 'key number L1: the window runs from the MIC to the MPC = 16× MIC');
    t.ok(/0\.45/.test(H.key3) && /0\.02/.test(H.key3) && /0\.3\b/.test(H.key3), 'key number L4: cost 0.45 + loss 0.02 against transfer 0.3 (the model card values)');
    G.reset(2, 1); const b = sim.s.beds[0], e = sim.ldExp(), est = b.n0[1] * b.n0[2] / sum(b.n0);
    t.ok(Math.abs(Math.log10(Math.max(1e-9, est)) - Math.log10(e.ab)) < 1.5, `key number L3: a × b ÷ 10⁹ = ${est.toExponential(1)} sits within the call's band of the expectation ${e.ab.toExponential(1)} on this seed`);
    let asks = 0, wrong = 0; for (let lv = 0; lv < 4; lv++) { G.reset(lv, 1); if (sim.s.asks.length) { asks++; if (lv !== 2) wrong++; } }
    t.ok(asks === 1 && wrong === 0, 'one prediction in the chapter, at the start of L3 (D6 decision 9)');
  }

  /* ---------- determinism, snapshot and replay ---------- */
  for (const lv of [0, 1, 2, 3]) {
    const f = lv === 3 ? s => { for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1) return { k: 'dose', bed: i }; return s.ward.hyg < 0.6 ? { k: 'rub' } : null; } : lv === 2 ? both12 : highDay;
    const a = G.run(lv, { seed: 11, policy: pol(f) }), b = G.run(lv, { seed: 11, policy: pol(f) });
    t.eq(JSON.stringify(a.s.hist), JSON.stringify(b.s.hist), `determinism: level ${lv + 1}, same seed and actions, same history`);
    // replay the logged actions on a fresh sim
    const log = a.s.log.slice(); G.reset(lv, 11); let i = 0, ticks = 0; while (!sim.result() && ticks < 20000) { while (i < log.length && log[i][0] <= ticks) sim.act(log[i++][1]); sim.step(1 / 30); ticks++; }
    t.eq(JSON.stringify(sim.s.hist), JSON.stringify(a.s.hist), `replay: level ${lv + 1} from (seed, actions) alone`);
    // snapshot halfway, restore, continue: the same end
    G.reset(lv, 12); for (let k = 0; k < 400; k++) { const A = sim.actions(); const x = A.length ? pol(f)(sim.s, A) : null; if (x) sim.act(x); sim.step(1 / 30); }
    const snap = sim.snapshot(); const cont = () => { for (let k = 0; k < 600 && !sim.result(); k++) { const A = sim.actions(); const x = A.length ? pol(f)(sim.s, A) : null; if (x) sim.act(x); sim.step(1 / 30); } return JSON.stringify(sim.s.hist); };
    const h1 = cont(); sim.restore(snap); const h2 = cont(); t.eq(h1, h2, `snapshot: level ${lv + 1} restores and continues identically`);
  }

  /* ---------- stars: against the expectation ---------- */
  const expertCall = (s, acts) => { const id = s.ask.id, keepE = s.exp[id], keepT = s.expTr[id]; const e = sim.expect(s, id); s.exp[id] = keepE; if (keepT === undefined) delete s.expTr[id]; else s.expTr[id] = keepT; return sim.near(acts, e); };
  const EXPERT = [
    highDay,
    s => { const b = s.beds[0]; return b.cured == null && above(b) && b.C[0] < 10 ? dose(0, 1) : null; },
    s => { const b = s.beds[0]; return above(b) && b.C[0] < 2 ? dose(0, 0, 2) : null; },
    s => { for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1) return { k: 'dose', bed: i }; return s.tick === 0 && s.ward.hyg < 0.89 ? { k: 'rub' } : null; }   // treat each fever at once; a hand-rub round each morning
  ];
  const OFFER = [1, 4, 3, 1];   // D, T, D|P, D
  for (let lv = 0; lv < 4; lv++) {
    let full = 0, real = 0, nc = 0; const n = NS(12);
    for (let sd = 1; sd <= n; sd++) {
      const r = G.run(lv, { seed: sd, policy: (s, acts) => acts.length && acts[0].k === 'predict' ? expertCall(s, acts) : acts.length && acts[0].k === 'next' ? acts[0] : EXPERT[lv](s) });
      const m = r.result ? r.result.mask : 0; t.ok((m & ~OFFER[lv]) === 0, `level ${lv + 1} seed ${sd}: only the stars this level offers (mask ${m})`);
      if (m === OFFER[lv]) full++;
      const id = 'a' + lv, A = r.s.askQ[id] ? 1 : 0; if (A && Math.abs(r.s.exp[id] - r.s.at0[id]) >= 2 - 1e-9) real++;
      const q = G.run(lv, { seed: sd, bot: 'noChange' }); if (q.result && (q.result.mask & 2)) nc++;
    }
    t.ok(full >= 0.75 * n, `level ${lv + 1}: an expert earns every star the level offers on ${full} of ${n} seeds (calls that count: ${real})`);
    t.ok(nc === 0, `level ${lv + 1}: "no change" calls never earn Predict`);
  }
  { let off = 0; for (let sd = 1; sd <= NS(12); sd++) { const r = G.run(2, { seed: sd, policy: (s, acts) => acts.length && acts[0].k === 'predict' ? sim.near(acts, -3.6) : EXPERT[2](s) }); const e = r.s.exp.a2; if (Math.abs(-3.6 - e) > 1 && (r.result.mask & 2)) off++; } t.ok(off === 0, 'L3: a call more than a decade from the expectation never earns Predict'); }

  /* ---------- bots: every bot finishes every level; none earns three stars in a level or across the unit ---------- */
  { const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'noChange']; let fin = true, three = false, unit = false; const n = NS(8);
    for (const b of bots) for (let sd = 1; sd <= n; sd++) { const masks = []; for (let lv = 0; lv < 4; lv++) { const r = G.run(lv, { seed: sd, bot: b }); if (!r.result) fin = false; const m = r.result ? r.result.mask : 0; masks.push(m); if ((m & 7) === 7) three = true; } if (ch.unitStars(masks) === 7) unit = true; }
    t.ok(fin, 'bots: every bot finishes every level inside 2 × its minutes');
    t.ok(!three, 'bots: no bot earns three stars in a level');
    t.ok(!unit, 'bots: no bot’s union across the unit (unitStars) reaches three stars');
  }

  /* ---------- What if?: thawed runs end, never score, and say what happened ---------- */
  for (let lv = 0; lv < 4; lv++) {
    const L = ch.levels[lv]; G.reset(lv, 5); let k = 0, snap = null;
    while (!sim.result() && k < 30000) { const A = sim.actions(); const x = A.length ? (A[0].k === 'predict' ? A[0] : EXPERT[lv](sim.s)) : null; if (x) sim.act(x); sim.step(1 / 30); k++; if (!snap && sim.s.day >= 2 && sim.s.tick === 1) snap = sim.snapshot(); }
    for (const lever of ({ 0: ['lowOnly', 'stop'], 1: ['noWeekend', 'stop'], 2: ['onlyA'], 3: ['noRub'] })[lv]) {
      TB.seed(5); sim.reset(lv, { thaw: { snap, lever } }); let j = 0; while (!sim.result() && j < 30000) { sim.step(1 / 30); j++; }
      const r = sim.result(); t.ok(r && r.mask === 0 && typeof r.interesting === 'string' && ch.content.interesting[r.interesting], `What if? level ${lv + 1} "${lever}" ends, scores nothing, says "${r && r.interesting}"`);
      if (lever === 'lowOnly') t.ok(r.interesting === (sim.s.beds[0].cured != null ? 'lowOnlyOk' : 'lowOnly'), 'What if? low-doses text matches the outcome');
      if (lever === 'noRub') t.ok(r.interesting === (sim.s.ward.seen > sim.s.wi0.ward.seen ? 'noRub' : 'noRubSame'), 'What if? no-rub text matches the outcome');
    }
  }

  /* ---------- untimed: days wait at dawn for Next day ---------- */
  { G.reset(0, 3); const s = sim.s; s.unt = true; if (s.ask) sim.act({ k: 'void', id: s.ask.id }); let k = 0; while (s.phase !== 'run' && k < 2000) { sim.step(1 / 30); k++; } while (s.phase === 'run' && k < 5000) { sim.step(1 / 30); k++; }
    t.ok(s.phase === 'wait', 'untimed: the day ends in a wait'); const d = s.day; for (let i = 0; i < 300; i++) sim.step(1 / 30); t.ok(s.day === d && s.phase === 'wait', 'untimed: nothing moves until Next day'); sim.act({ k: 'next' }); sim.step(1 / 30); t.ok(s.phase === 'run', 'untimed: Next day resumes'); }
};
