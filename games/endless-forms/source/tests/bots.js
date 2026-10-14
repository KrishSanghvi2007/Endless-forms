/* tests/bots.js: the five-bot sweep (D5 §3.4; API_v2 §9.3, §11.3). Usually run through tests/bots.py.

     node tests/bots.js BUILD.html <id> [--seeds 1-20] [--bots alwaysA,alwaysB,random,greedy,threshold] [--levels 0,2]
                                        [--every K] [--untimed] [--json]

   For each level and bot, for each seed: seed R(), sim.reset(level), then each tick ask the bot for an action from
   sim.actions() (null = do nothing), sim.act it, sim.step(sim.dt), until sim.result() or 2 × the level's minutes.
   Bots are the chapter's sim.bots.{alwaysA, alwaysB, greedy, threshold}(s, acts, rnd); 'random' is generic (uniform
   over actions()); 'idle' (never acts) may be added with --bots. rnd is a seeded PRNG of the bot's own, never R().
   Cells show the best star mask over the seeds (D discover, P predict, T transfer) and the mean stars.
   Exit 1 if any bot earns three stars in any level on any seed, or a sim throws. A missing bot hook is a warning. */
'use strict';
const { load, runSim, mulberry } = require('./vmgame');
const BOTS = ['alwaysA', 'alwaysB', 'random', 'greedy', 'threshold'];
const pop = m => ((m & 1) ? 1 : 0) + ((m & 2) ? 1 : 0) + ((m & 4) ? 1 : 0);
const letters = m => ((m & 1) ? 'D' : '-') + ((m & 2) ? 'P' : '-') + ((m & 4) ? 'T' : '-');
function seedList(s) {
  const out = []; for (const part of String(s || '1-20').split(',')) { const m = part.match(/^\s*(\d+)\s*(?:-\s*(\d+))?\s*$/); if (!m) continue; const a = +m[1], b = m[2] ? +m[2] : a; for (let k = a; k <= b; k++) out.push(k); }
  return out;
}
function policyFor(ch, name) {
  if (name === 'random') return (s, acts, rnd) => acts[Math.floor(rnd() * acts.length)];
  if (name === 'idle') return () => null;
  const f = ch.sim.bots && ch.sim.bots[name]; return typeof f === 'function' ? f : null;
}

function sweep(TB, ch, o) {
  o = o || {}; const seeds = o.seeds || seedList('1-20'), bots = o.bots || BOTS;
  const levels = o.levels || (ch.levels || []).map((l, i) => i);
  const rows = [], warnings = [];
  for (const lv of levels) {
    const row = { level: lv, name: ((ch.levels || [])[lv] || {}).name || '', cells: {} };
    for (const [bi, b] of bots.entries()) {
      const pol = policyFor(ch, b);
      if (!pol) { row.cells[b] = { missing: true }; if (lv === levels[0]) warnings.push(`sim.bots.${b} is not defined`); continue; }
      const cell = { masks: [], best: 0, mean: 0, three: [], capped: 0, errors: [] };
      for (const sd of seeds) {
        try {
          const r = runSim(TB, ch, lv, { seed: sd, policy: pol, every: o.every, untimed: o.untimed, rnd: mulberry(sd * 1000003 + bi * 7919 + lv) });
          const m = r.result ? (r.result.mask | 0) & 7 : 0; cell.masks.push(m);
          if (r.capped) cell.capped++;
          if (pop(m) > pop(cell.best)) cell.best = m;
          if (pop(m) === 3) cell.three.push(sd);
        } catch (e) { cell.errors.push(`seed ${sd}: ${String(e && e.message || e)}`); cell.masks.push(0); }
      }
      cell.mean = cell.masks.reduce((a, m) => a + pop(m), 0) / Math.max(1, cell.masks.length);
      row.cells[b] = cell;
    }
    rows.push(row);
  }
  const fail = rows.some(r => Object.values(r.cells).some(c => (c.three && c.three.length) || (c.errors && c.errors.length)));
  return { id: ch.id, seeds: [seeds[0], seeds[seeds.length - 1], seeds.length], bots, rows, warnings, fail };
}

function table(res) {
  const W = 12, pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, n), lines = [];
  lines.push(`bots: ${res.id}  seeds ${res.seeds[0]}-${res.seeds[1]} (${res.seeds[2]})  cell = best mask (D discover, P predict, T transfer) and mean stars`);
  lines.push(pad('level', 22) + res.bots.map(b => pad(b, W)).join(''));
  for (const r of res.rows) {
    lines.push(pad(r.level + ' ' + r.name, 22) + res.bots.map(b => {
      const c = r.cells[b]; if (c.missing) return pad('n/a', W);
      if (c.errors.length) return pad('ERROR', W);
      return pad(letters(c.best) + ' ' + c.mean.toFixed(1) + (c.three.length ? ' 3★×' + c.three.length : '') + (c.capped ? ' cap' + c.capped : ''), W + (c.three.length ? 6 : 0));
    }).join(''));
  }
  for (const r of res.rows) for (const b of res.bots) { const c = r.cells[b]; if (c.three && c.three.length) lines.push(`  FAIL level ${r.level}: ${b} earned three stars on seed(s) ${c.three.slice(0, 8).join(', ')}`); if (c.errors && c.errors.length) lines.push(`  FAIL level ${r.level}: ${b} threw: ${c.errors[0]}`); }
  res.warnings.forEach(w => lines.push('  warn ' + w));
  lines.push(res.fail ? `bots ${res.id}: FAIL` : `bots ${res.id}: PASS (no bot earned three stars)`);
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2), opt = k => { const i = args.indexOf(k); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
  const has = k => { const i = args.indexOf(k); if (i < 0) return false; args.splice(i, 1); return true; };
  const seeds = seedList(opt('--seeds') || '1-20'), bots = (opt('--bots') || BOTS.join(',')).split(',').filter(Boolean);
  const lv = opt('--levels'), every = +(opt('--every') || 1), untimed = has('--untimed'), json = has('--json');
  const html = args[0], id = args[1];
  if (!html || !id) { console.log('usage: node tests/bots.js BUILD.html <id> [--seeds 1-20] [--bots …] [--levels 0,1] [--every K] [--untimed] [--json]'); process.exit(2); }
  const TB = load(html).TB, ch = TB.REG[id];
  let res;
  if (!ch) res = { id, fail: true, error: `no chapter "${id}" in this build` };
  else if (ch.v2 !== true) res = { id, fail: false, skipped: 'legacy chapter (no headless sim)' };
  else if (!ch.sim) res = { id, fail: false, skipped: 'no sim (a Hunt-mode chapter: replay and bots for Hunt come later, API_v2 §9.1)' };
  else res = sweep(TB, ch, { seeds, bots, every, untimed, levels: lv ? lv.split(',').map(Number) : null });
  if (json) console.log(JSON.stringify(res));
  else if (res.rows) console.log(table(res));
  else console.log(`bots ${id}: ${res.error ? 'FAIL ' + res.error : 'SKIP ' + res.skipped}`);
  process.exit(res.fail ? 1 : 0);
}

module.exports = { sweep, table, seedList, BOTS };
if (require.main === module) main();
