/* tests/oracle_clinic.js: the science oracle for The Clinic (D1 §3.8, D5 §4 item 11, D5 §3 items 1, 3, 4, 9).
   Run: node tests/oracle.js BUILD.html clinic          (CL_FAST=1 for a quicker, smaller pass)
   D5's acceptance lines:
     A. untreated ×8 a day (resistant ×7);
     B. double mutants ≈ the product of the single-mutant rates;
     C. untreated loads under 10⁵ clear within 5 days;
     D. a fixed-schedule bot cannot three-star L3 (here L4, "Already there"; no level offers three stars at all).
   Plus the model's own claims: zero net growth at the MIC (and at the MPC for a single-step mutant); the window enriches mutants
   and doses above the MPC suppress both; every dose spends ln(MPC/MIC)/k in the window whatever its size; the Luria–Delbrück
   history (mean = the expectation, variance ≫ mean); low doses select resistance and spaced high doses cure; combinations hold
   where one drug fails; containment buys bed 2 time where hitting hard releases the resistant strain; Stewart–Levin (a costly
   plasmid falls without the drug, a compensated one does not); compensation in the boss; restriction alone falls far less than a
   costly plasmid would; determinism, snapshot and replay; stars scored against the expectation ("no change" never earns Predict,
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
  { // L4: hitting bed 2 hard releases its resistant strain; containment near the intensive-care line buys days
    const hard = s => { const b = s.beds[1]; return s.tick === 0 ? dose(1, 1) : null; };
    const contain = s => { const b = s.beds[1]; return sum(b.n) > 0.85 * 9e9 && b.C[0] < 0.5 ? dose(1, 0) : null; };
    const icuOf = (f, n) => { const out = []; for (let sd = 1; sd <= (n || NS(12)); sd++) { const r = G.run(3, { seed: sd, policy: pol(f) }); out.push(r.s.beds[1].icu == null ? 99 : r.s.beds[1].icu); } return out; };
    const H = icuOf(hard), C2 = icuOf(contain), N0 = icuOf(() => null);
    t.ok(Math.max(...H) < 5, 'L4 (contested): hitting bed 2 hard sends it to intensive care by day ' + Math.max(...H).toFixed(1) + ' (competitive release)');
    t.ok(Math.min(...C2) >= 6, 'L4 (contested): containment keeps bed 2 out until day ' + Math.min(...C2).toFixed(1) + ' or later, in this model');
    t.ok(Math.max(...N0) < 3, 'L4: no drug at all: bed 2 reaches intensive care by day ' + Math.max(...N0).toFixed(1));
    const r = G.run(3, { seed: 3, policy: pol(hard) }); t.ok(sim.resShare(r.s.beds[1]) > 0.99, 'L4: after hitting hard bed 2 is almost all resistant');
  }

  /* ---------- the ward: Stewart–Levin, gut selection, hands, compensation ---------- */
  { G.reset(4, 1); const s = sim.s; for (const b of s.beds) { b.p = 0; b.iso = true; b.fev = null; b.C = 0; } s.beds[0].p = 0.5; s.beds[0].c = 0.45; s.beds[1].p = 0.5; s.beds[1].c = 0.28; s.beds[2].p = 0.05; s.beds[2].C = 8;
    for (let k = 0; k < 45 * 5; k++) sim.wardTick(s, 1 / 45, { proj: true, hyg: 0.4 });
    t.ok(s.beds[0].p < 0.3, `Ward: a costly plasmid (γ 0.3 < c 0.45 + δ 0.02) falls without the drug: 0.50 → ${s.beds[0].p.toFixed(2)} in 5 days (Stewart and Levin 1977)`);
    t.ok(Math.abs(s.beds[1].p - 0.5) < 0.05, `Ward: compensated to c = 0.28, transfer balances cost plus loss: 0.50 → ${s.beds[1].p.toFixed(2)}`);
    t.ok(s.beds[2].p > 0.1, `Ward: one dose selects the plasmid in the gut: 0.05 → ${s.beds[2].p.toFixed(2)}`);
    G.reset(4, 1); const s2 = sim.s; for (const b of s2.beds) { b.p = 0; b.iso = false; b.fev = null; } s2.beds[0].p = 0.9;
    const after = hyg => { const z = JSON.parse(JSON.stringify(s2)); for (let k = 0; k < 45 * 3; k++) sim.wardTick(z, 1 / 45, { proj: true, hyg }); return sum(z.beds.slice(1).map(b => b.p)); };
    t.ok(after(0.4) > 3 * after(0.9), `Ward: hands at 40% compliance carry ${(after(0.4) / Math.max(1e-9, after(0.9))).toFixed(1)}× more plasmid to other beds than at 90%`);
    const s3 = JSON.parse(JSON.stringify(s2)); s3.beds[0].iso = true; for (let k = 0; k < 45 * 3; k++) sim.wardTick(s3, 1 / 45, { proj: true, hyg: 0.4 }); t.ok(sum(s3.beds.slice(1).map(b => b.p)) === 0, 'Ward: an isolated carrier seeds no other bed');
  }
  { const rows = []; let okC = 0, okA = 0, okG = 0, okReal = 0; const n = NS(16);
    for (let sd = 1; sd <= n; sd++) { G.reset(5, sd); const s = sim.s, st = sim.summary(s), a = sim.project(s, st, false), c = sim.project(s, st, true); rows.push(s.c30); if (s.c30 > 0.285 && s.c30 < 0.37) okC++; if (a[a.length - 1] - c[c.length - 1] >= 0.15 && c[c.length - 1] < 0.05) okG++; if (a[a.length - 1] < s.w30) okA++; if (Math.abs(a[a.length - 1] - s.w30) >= 0.12) okReal++; }
    t.ok(okC === n, `Boss: after the autumn the plasmid's cost has fallen from 0.45 towards 0.28 (mean ${(sum(rows) / n).toFixed(2)})`);
    t.ok(okG === n, 'Boss: restriction alone ends at least 0.15 above the costly-plasmid ghost, which falls under 5%');
    t.ok(okA >= 0.75 * n, `Boss: restriction alone does lower the ward share on ${okA} of ${n} seeds, but slowly`);
    t.note(`Boss: the restriction call counts (moves ≥ 2 bands) on ${okReal} of ${n} seeds`);
  }

  /* ---------- determinism, snapshot and replay ---------- */
  for (const lv of [0, 2, 3, 4, 5]) {
    const f = lv >= 4 ? s => { for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1) return { k: 'dose', bed: i }; return s.ward.hyg < 0.6 && s.ward.staff >= 2 ? { k: 'rub' } : null; } : lv === 2 ? both12 : lv === 3 ? s => s.tick === 0 ? dose(s.day % 2, s.day % 3 === 0) : null : highDay;
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
    s => { const b0 = s.beds[0], b1 = s.beds[1]; if (b0.cured == null && above(b0) && b0.C[0] < 10 && s.tick === 0) return dose(0, 1); if (sum(b1.n) > 0.85 * 9e9 && b1.C[0] < 0.5) return dose(1, 0); return null; },
    s => { for (let i = 0; i < s.beds.length; i++) if (s.beds[i].fev && s.beds[i].C < 1) return { k: 'dose', bed: i }; if (s.ward.hyg < 0.75 && s.ward.staff >= 2) return { k: 'rub' }; for (let i = 0; i < s.beds.length; i++) if (s.beds[i].iso && s.beds[i].p < 0.15) return { k: 'iso', bed: i }; let w = -1; for (let i = 0; i < s.beds.length; i++) if (!s.beds[i].iso && s.beds[i].p >= 0.2 && (w < 0 || s.beds[i].p > s.beds[w].p)) w = i; return w >= 0 && s.beds.filter(b => b.iso).length < 2 ? { k: 'iso', bed: w } : null; },
    null
  ];
  EXPERT[5] = s => { const f = EXPERT[4](s); if (f && f.k === 'iso' && s.beds.filter(b => b.iso).length >= 3) return null; if (f) return f; let w = -1; for (let i = 0; i < s.beds.length; i++) if (!s.beds[i].iso && s.beds[i].p >= 0.2 && (w < 0 || s.beds[i].p > s.beds[w].p)) w = i; return w >= 0 && s.beds.filter(b => b.iso).length < 3 ? { k: 'iso', bed: w } : null; };
  const OFFER = [3, 3, 3, 5, 3, 6];   // D|P, D|P, D|P, D|T, D|P, P|T
  for (let lv = 0; lv < 6; lv++) {
    let full = 0, real = 0, nc = 0; const n = NS(12);
    for (let sd = 1; sd <= n; sd++) {
      const r = G.run(lv, { seed: sd, policy: (s, acts) => acts.length && acts[0].k === 'predict' ? expertCall(s, acts) : acts.length && acts[0].k === 'next' ? acts[0] : EXPERT[lv](s) });
      const m = r.result ? r.result.mask : 0; t.ok((m & ~OFFER[lv]) === 0, `level ${lv + 1} seed ${sd}: only the stars this level offers (mask ${m})`);
      if (m === OFFER[lv]) full++;
      const id = 'a' + lv, A = r.s.askQ[id] ? 1 : 0; if (A && Math.abs(r.s.exp[id] - r.s.at0[id]) >= 2 * ({ dish: 0.5, wk: 0.5, ab: 1, rel: 0.1, sl: 0.07, ward: 0.06 })[r.s.askQ[id]] - 1e-9) real++;
      const q = G.run(lv, { seed: sd, bot: 'noChange' }); if (q.result && (q.result.mask & 2)) nc++;
    }
    t.ok(full >= (lv === 3 ? 0.9 : lv === 5 ? 0.5 : 0.75) * n, `level ${lv + 1}: an expert earns every star the level offers on ${full} of ${n} seeds (calls that count: ${real})`);
    t.ok(nc === 0, `level ${lv + 1}: "no change" calls never earn Predict`);
  }
  { const r = G.run(3, { seed: 2, policy: (s, acts) => acts.length && acts[0].k === 'predict' ? expertCall(s, acts) : EXPERT[3](s) }); t.ok(!(r.result.mask & 2), 'L4: the practice call never gives a Predict star, even when exact'); }

  /* ---------- bots: every bot finishes every level; none earns three stars in a level or across the unit ---------- */
  { const bots = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold', 'noChange']; let fin = true, three = false, unit = false; const n = NS(8);
    for (const b of bots) for (let sd = 1; sd <= n; sd++) { const masks = []; for (let lv = 0; lv < 6; lv++) { const r = G.run(lv, { seed: sd, bot: b }); if (!r.result) fin = false; const m = r.result ? r.result.mask : 0; masks.push(m); if ((m & 7) === 7) three = true; } if (ch.unitStars(masks) === 7) unit = true; }
    t.ok(fin, 'bots: every bot finishes every level inside 2 × its minutes');
    t.ok(!three, 'bots: no bot earns three stars in a level');
    t.ok(!unit, 'bots: no bot’s union across the unit (unitStars) reaches three stars');
  }

  /* ---------- What if?: thawed runs end, never score, and say what happened ---------- */
  for (let lv = 0; lv < 6; lv++) {
    const L = ch.levels[lv]; G.reset(lv, 5); let k = 0, snap = null;
    while (!sim.result() && k < 30000) { const A = sim.actions(); const x = A.length ? (A[0].k === 'predict' ? A[0] : EXPERT[lv](sim.s)) : null; if (x) sim.act(x); sim.step(1 / 30); k++; if (!snap && sim.s.day >= (lv === 5 ? 32 : 2) && sim.s.tick === 1) snap = sim.snapshot(); }
    for (const lever of ({ 0: ['lowOnly', 'stop'], 1: ['noWeekend', 'stop'], 2: ['onlyA'], 3: ['swap'], 4: ['noRub', 'noIso'], 5: ['costly'] })[lv]) {
      TB.seed(5); sim.reset(lv, { thaw: { snap, lever } }); let j = 0; while (!sim.result() && j < 30000) { sim.step(1 / 30); j++; }
      const r = sim.result(); t.ok(r && r.mask === 0 && typeof r.interesting === 'string' && ch.content.interesting[r.interesting], `What if? level ${lv + 1} "${lever}" ends, scores nothing, says "${r && r.interesting}"`);
      if (lever === 'lowOnly') t.ok(r.interesting === (sim.s.beds[0].cured != null ? 'lowOnlyOk' : 'lowOnly'), 'What if? low-doses text matches the outcome');
      if (lever === 'costly') t.ok(sim.wardShare(sim.s) < 0.1, `What if? the costly plasmid collapses (ward ${sim.wardShare(sim.s).toFixed(2)})`);
    }
  }

  /* ---------- untimed: days wait at dawn for Next day ---------- */
  { G.reset(0, 3); const s = sim.s; s.unt = true; if (s.ask) sim.act({ k: 'void', id: s.ask.id }); let k = 0; while (s.phase !== 'run' && k < 2000) { sim.step(1 / 30); k++; } while (s.phase === 'run' && k < 5000) { sim.step(1 / 30); k++; }
    t.ok(s.phase === 'wait', 'untimed: the day ends in a wait'); const d = s.day; for (let i = 0; i < 300; i++) sim.step(1 / 30); t.ok(s.day === d && s.phase === 'wait', 'untimed: nothing moves until Next day'); sim.act({ k: 'next' }); sim.step(1 / 30); t.ok(s.phase === 'run', 'untimed: Next day resumes'); }
};
