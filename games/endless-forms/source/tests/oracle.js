/* tests/oracle.js: run a unit's science oracle headless (API_v2 §11.3).

     node tests/oracle.js BUILD.html <id>[,<id>…] [--search '?locks=…']
     node tests/oracle.js BUILD.html all          every tests/oracle_<id>.js whose chapter is in the build

   tests/oracle_<id>.js (owned by the unit's author) exports function (G, t), which may be async:
     G = {TB, ch, sim, Det, WF, Gen, seed, R, window,
          reset(level, seed, o) → sim.s          seed R() and sim.reset(level, o)
          run(level, {seed, bot, policy, cap, every, untimed, P}) → {result, ticks, acts, s, capped}
                                                 the headless driver bots.py uses; bot: a name in sim.bots, or 'random'
          bot(name) → policy(s, acts, rnd)        load(search) → a fresh G (own vm, own Save)}
     t.ok(cond, msg)  t.near(x, y, tol, msg)  t.eq(a, b, msg)  t.note(msg)
   Prints a line per assertion and a summary; exit 1 on any failed assertion, a throw, or a missing oracle file. */
'use strict';
const fs = require('fs'), path = require('path');
const { load, runSim } = require('./vmgame');

function makeG(html, id, search) {
  const V = load(html, { search }), TB = V.TB, ch = TB.REG[id];
  if (!ch) throw new Error(`no chapter "${id}" in this build`);
  const bot = name => {
    if (name === 'random' || !name) return (s, acts, rnd) => acts[Math.floor(rnd() * acts.length)];
    const f = ch.sim && ch.sim.bots && ch.sim.bots[name]; if (!f) throw new Error(`${id}: sim.bots.${name} is not defined`); return f;
  };
  return {
    TB, ch, sim: ch.sim, Det: TB.Det, WF: TB.WF, Gen: TB.Gen, seed: TB.seed, R: TB.R, window: V.window, vm: V,
    reset(level, seed, o) { TB.seed(seed == null ? 1 : seed); ch.level = level; ch.sim.reset(level, o || {}); return ch.sim.s; },
    run(level, o) { o = Object.assign({}, o); if (!o.policy && o.bot) o.policy = bot(o.bot); return runSim(TB, ch, level, o); },
    bot,
    load: s => makeG(html, id, s == null ? search : s)
  };
}

function tester(out) {
  const st = { pass: 0, fail: 0 };
  const line = (good, msg, detail) => { if (good) st.pass++; else st.fail++; out.push((good ? '  ok   ' : '  FAIL ') + msg + (good || !detail ? '' : ' (' + detail + ')')); return good; };
  const canon = v => JSON.stringify(v, (k, x) => x && typeof x === 'object' && !Array.isArray(x) && !ArrayBuffer.isView(x) ? Object.fromEntries(Object.keys(x).sort().map(q => [q, x[q]])) : ArrayBuffer.isView(x) ? Array.from(x) : x);
  return {
    st,
    t: {
      ok: (c, msg) => line(!!c, msg || 'ok'),
      near: (x, y, tol, msg) => line(typeof x === 'number' && Math.abs(x - y) <= tol, msg || 'near', `got ${x}, want ${y} ± ${tol}`),
      eq: (a, b, msg) => { const A = canon(a), B = canon(b); return line(A === B, msg || 'eq', `got ${A.slice(0, 120)}, want ${B.slice(0, 120)}`); },
      note: msg => out.push('  note ' + msg)
    }
  };
}

async function runOracle(html, id, o) {
  o = o || {}; const out = [], file = o.file || path.join(__dirname, 'oracle_' + id + '.js');
  const { st, t } = tester(out);
  if (!fs.existsSync(file)) { out.push(`  FAIL no oracle file ${path.relative(process.cwd(), file)}`); st.fail++; return { id, out, ...st }; }
  try {
    delete require.cache[require.resolve(file)];
    const fn = require(file); if (typeof fn !== 'function') throw new Error('oracle file must export function (G, t)');
    await fn(makeG(html, id, o.search), t);
  } catch (e) { st.fail++; out.push('  FAIL threw: ' + String(e && e.stack || e).split('\n').slice(0, 4).join(' | ')); }
  return { id, out, ...st };
}

async function main() {
  const args = process.argv.slice(2), si = args.indexOf('--search'); let search = '';
  if (si >= 0) { search = args[si + 1] || ''; args.splice(si, 2); }
  const html = args[0]; let ids = args[1] ? args[1].split(',').filter(Boolean) : null;
  if (!html || !ids) { console.log('usage: node tests/oracle.js BUILD.html <id>[,<id>…]|all [--search QUERY]'); process.exit(2); }
  if (ids.length === 1 && ids[0] === 'all') {
    const REG = load(html).TB.REG;
    ids = fs.readdirSync(__dirname).map(f => (f.match(/^oracle_(.+)\.js$/) || [])[1]).filter(id => id && REG[id]);
    if (!ids.length) { console.log('oracle: no tests/oracle_<id>.js matches a chapter in this build'); process.exit(0); }
  }
  let fails = 0;
  for (const id of ids) {
    const r = await runOracle(html, id, { search });
    console.log(`oracle ${id}:`); r.out.forEach(l => console.log(l));
    console.log(`oracle ${id}: ${r.pass} passed, ${r.fail} failed`);
    fails += r.fail;
  }
  process.exit(fails ? 1 : 0);
}

module.exports = { runOracle, makeG };
if (require.main === module) main();
