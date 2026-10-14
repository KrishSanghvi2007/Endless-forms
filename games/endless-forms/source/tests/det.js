/* tests/det.js: Det cross-check (API_v2 §3.2). Det must give the same bits in every engine, because replays, result codes
   and oracles depend on it.

     node tests/det.js [BUILD.html] [--write]

   Computes 1,000 fixed vectors (exp, log, sin, cos, pow: 200 each, including edge cases) plus an R()-driven sequence
   (Det.gauss, Det.poisson from seed 12345), checks accuracy against Math (relative error ≤ 1e-14 on normal outputs) and
   compares every output bit for bit with tests/det_vectors.json, which stores inputs and outputs as IEEE-754 hex.
   The file is written when it is missing or with --write (do that only when Det changes on purpose, and say why).
   Without BUILD.html, Det comes from source/core.js alone. tests/selftest_e7.py replays the same vectors in Chromium.
   Exit 1 on any accuracy failure or bit difference. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const FILE = path.join(__dirname, 'det_vectors.json');

const dv = new DataView(new ArrayBuffer(8));
const hex = x => { dv.setFloat64(0, x); let s = ''; for (let i = 0; i < 8; i++) s += dv.getUint8(i).toString(16).padStart(2, '0'); return s; };
const unhex = h => { for (let i = 0; i < 8; i++) dv.setUint8(i, parseInt(h.slice(2 * i, 2 * i + 2), 16)); return dv.getFloat64(0); };
const fnv = strs => { let h = 0x811c9dc5; for (const s of strs) for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); };

/* fixed inputs from an integer LCG (exact in any engine) */
function inputs() {
  let s = 20261014; const u = () => (s = (Math.imul(s, 1103515245) + 12345) >>> 0) / 4294967296;
  const v = [];
  const EXP_EDGE = [0, -0, 1, -1, 1e-300, -1e-300, 0.5, -745.2, -740, -708.4, 709.78, 709.7827128933841, 88.72, -88.72, 2.220446049250313e-16, 30, -30, 1e-8, 0.6931471805599453, 20];
  EXP_EDGE.forEach(x => v.push(['exp', x])); for (let i = 0; i < 180; i++) v.push(['exp', (u() - 0.5) * 1400]);
  const LOG_EDGE = [5e-324, 2.2250738585072014e-308, 1, 1 + 1e-12, 1 - 1e-12, 2, 0.5, 10, 1e300, 1.7976931348623157e308, 0.7071067811865476, 1.4142135623730951, 3, 1e-5, 1e5, 0.1, 7.38905609893065, 0.36787944117144233, 1.5, 0.9];
  LOG_EDGE.forEach(x => v.push(['log', x])); for (let i = 0; i < 180; i++) v.push(['log', Math.exp((u() - 0.5) * 1400)]);
  for (const f of ['sin', 'cos']) {
    [0, -0, 1, -1, 0.7853981633974483, 1.5707963267948966, 3.141592653589793, 6.283185307179586, 1e-9, 100, 1000, 99999.5, -12345.678, 0.5, 2, 3, 4.71238898038469, 10, 1e5, 33].forEach(x => v.push([f, x]));
    for (let i = 0; i < 90; i++) v.push([f, (u() - 0.5) * 20]);
    for (let i = 0; i < 90; i++) v.push([f, (u() - 0.5) * 2e5]);
  }
  for (let i = 0; i < 150; i++) v.push(['pow', u() * 8 + 1e-3, (u() - 0.5) * 40]);
  for (let i = 0; i < 50; i++) v.push(['pow', (u() - 0.5) * 4, Math.round((u() - 0.5) * 128)]);
  return v;
}
const SEQ = { seed: 12345, gauss: 200, lambdas: [0.5, 3, 12, 29.9, 30.1, 80], poisson: 120 };

function compute(Det, seed, R) {
  const out = inputs().map(r => [r[0], ...r.slice(1).map(hex), hex(r[0] === 'pow' ? Det.pow(r[1], r[2]) : Det[r[0]](r[1]))]);
  seed(SEQ.seed);
  const gauss = []; for (let i = 0; i < SEQ.gauss; i++) gauss.push(hex(Det.gauss()));
  const poisson = []; for (let i = 0; i < SEQ.poisson; i++) poisson.push(Det.poisson(SEQ.lambdas[i % SEQ.lambdas.length]));
  return { v: out, seq: { seed: SEQ.seed, gauss, poisson, state: R.state ? R.state() : null } };
}

function accuracy(rows) {
  const bad = [];
  for (const r of rows) {
    const f = r[0], x = unhex(r[1]), got = unhex(r[r.length - 1]);
    const want = f === 'pow' ? Math.pow(x, unhex(r[2])) : Math[f](x);
    if (!isFinite(want) || want === 0) { if (!(Object.is(got, want) || (isNaN(got) && isNaN(want)) || (want === 0 && got === 0))) bad.push(`${f}(${x}) = ${got}, Math says ${want}`); continue; }
    if (Math.abs(want) < 2.2250738585072014e-308) continue;   // subnormal outputs: bits only
    if ((f === 'sin' || f === 'cos') && Math.abs(want) < 1e-3) continue;   // near a zero Math itself is only good to ~1e-16 absolute
    if (f === 'log' && Math.abs(x - 1) < 1e-6) { if (Math.abs(got - want) > 1e-28) bad.push(`log(${x}) = ${got}, Math says ${want}`); continue; }
    if (f === 'pow' && Math.abs(unhex(r[2]) * Math.log(Math.abs(x))) > 90) continue;   // E1 log: error grows as |y·ln x|·1e-16 past ~90
    const rel = Math.abs(got - want) / Math.abs(want);
    if (rel > 1e-14) bad.push(`${f}(${x}${f === 'pow' ? ', ' + unhex(r[2]) : ''}) relative error ${rel.toExponential(2)}`);
  }
  return bad;
}

function fromCore() {
  const ctx = { console, performance: { now: () => 0 }, location: { search: '' } }; vm.createContext(ctx);
  vm.runInContext("(function(){'use strict';\n" + fs.readFileSync(path.join(__dirname, '..', 'core.js'), 'utf8') + '\nthis.E = {Det, seed, R};\n}).call(this);', ctx);
  return ctx.E;
}

function main() {
  const args = process.argv.slice(2), write = args.indexOf('--write') >= 0, html = args.find(a => !a.startsWith('--'));
  const E = html ? (() => { const TB = require('./vmgame').load(html).TB; return { Det: TB.Det, seed: TB.seed, R: TB.R }; })() : fromCore();
  if (!E.Det) { console.log('det: no Det in this build'); process.exit(1); }
  const res = compute(E.Det, E.seed, E.R), print = res.v.map(r => r[r.length - 1]).concat(res.seq.gauss, res.seq.poisson.map(String));
  const fp = fnv(print), bad = accuracy(res.v);
  console.log(`det: ${res.v.length} vectors + ${res.seq.gauss.length} gauss + ${res.seq.poisson.length} poisson from ${html ? path.basename(html) : 'core.js'}, fingerprint ${fp}`);
  bad.slice(0, 10).forEach(b => console.log('  FAIL accuracy ' + b));
  let diff = 0;
  if (!fs.existsSync(FILE) || write) {
    fs.writeFileSync(FILE, JSON.stringify({ about: 'Det vectors (tests/det.js): [fn, input hex…, output hex]; IEEE-754 big-endian. seq: Det.gauss/Det.poisson after seed().', engine: 'Node ' + process.version, fnv: fp, v: res.v, seq: res.seq }) + '\n');
    console.log(`det: wrote ${path.relative(process.cwd(), FILE)}`);
  } else {
    const ref = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    const n = Math.max(ref.v.length, res.v.length);
    for (let i = 0; i < n; i++) { const a = ref.v[i], b = res.v[i]; if (!a || !b || a.join() !== b.join()) { if (diff++ < 10) console.log(`  FAIL bits #${i}: stored ${a && a.join(' ')} now ${b && b.join(' ')}`); } }
    ['gauss', 'poisson'].forEach(k => ref.seq[k].forEach((x, i) => { if (String(x) !== String(res.seq[k][i]) && diff++ < 10) console.log(`  FAIL ${k} #${i}: stored ${x} now ${res.seq[k][i]}`); }));
    if (ref.seq.state !== res.seq.state) { diff++; console.log(`  FAIL R.state after the sequence: stored ${ref.seq.state} now ${res.seq.state}`); }
    console.log(diff ? `det: ${diff} bit difference(s) from det_vectors.json (recorded on ${ref.engine}, ${ref.fnv})` : `det: identical to det_vectors.json (${ref.engine}, ${ref.fnv})`);
  }
  console.log(bad.length || diff ? 'det: FAIL' : 'det: PASS');
  process.exit(bad.length || diff ? 1 : 0);
}

module.exports = { inputs, compute, accuracy, hex, unhex, fnv, SEQ };
if (require.main === module) main();
