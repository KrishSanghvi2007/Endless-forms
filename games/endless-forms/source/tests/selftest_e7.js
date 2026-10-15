/* E7 self-test (Node): the test harnesses themselves. API_v2 §2 gives each engine package a self-test.
     node tests/selftest_e7.js               builds a private copy of source/ with the fixtures, then tests
     node tests/selftest_e7.js --build-only  prints the path of that private build (tests/selftest_e7.py uses it)
   The private build holds the legacy game, the v2 engine files (0*, zz_*), the contract skeleton (docs/design/
   v2_chapter_skeleton.js) and tests/fixtures/e7_fixture.js. It never touches source/game.js or source/v2.
   Covers: vmgame (all 48 legacy chapters run headless; virtual time; seeded Math.random; storage; ?search), the rAF shim
   in vclock.js, lint_text rules (budgets, sentences, spelling, agency, shape, source rules), the bot sweep (pass and a
   planted three-star bot), the oracle runner (pass, fail, missing), and det.js (stable, catches a bad Det, matches the
   stored vectors). Exit 1 on any failure. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm'), { execFileSync } = require('child_process');
const TESTS = __dirname, SRC = path.dirname(TESTS), ROOT = path.resolve(SRC, '../../..');

function privateBuild() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ef_e7_'));
  for (const f of fs.readdirSync(SRC)) if (f.endsWith('.js') && f !== 'game.js' || f === 'shell.html' || f === 'build.py') fs.copyFileSync(path.join(SRC, f), path.join(tmp, f));
  fs.mkdirSync(path.join(tmp, 'v2'));
  for (const f of fs.readdirSync(path.join(SRC, 'v2'))) if (/^(0\d|zz)_.*\.js$/.test(f)) fs.copyFileSync(path.join(SRC, 'v2', f), path.join(tmp, 'v2', f));
  fs.copyFileSync(path.join(ROOT, 'docs/design/v2_chapter_skeleton.js'), path.join(tmp, 'v2', 'skeleton.js'));
  fs.copyFileSync(path.join(TESTS, 'fixtures', 'e7_fixture.js'), path.join(tmp, 'v2', 'e7fixture.js'));
  const out = path.join(tmp, 'e7_selftest.html');
  execFileSync('python3', ['build.py', out], { cwd: tmp, env: Object.assign({}, process.env, { V2_ONLY: '0*,zz_*,skeleton.js,e7fixture.js' }), stdio: 'pipe' });
  return out;
}
if (process.argv.indexOf('--build-only') >= 0) { console.log(privateBuild()); process.exit(0); }

let passes = 0, fails = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL', m); } };
const html = process.argv[2] && !process.argv[2].startsWith('--') ? path.resolve(process.argv[2]) : privateBuild();
const { load, runSim, mulberry, makeClock } = require('./vmgame');

/* ---------- 1. vmgame ---------- */
{
  const G = load(html), TB = G.TB;
  for (const k of ['App', 'Hunt', 'REG', 'ORDER', 'Gen', 'seed', 'R', 'Save', 'Stage', 'Cards', 'Det', 'Url', 'Hooks', 'HUD', 'Dock', 'Strip']) ok(TB[k] != null, 'vmgame: TB.' + k);
  const legacy = Object.keys(TB.REG).filter(k => TB.REG[k].v2 !== true);
  ok(legacy.length === 48, 'vmgame: 48 legacy chapters registered (' + legacy.length + ')');
  ok(TB.REG.skeleton && TB.REG.skeleton.v2 === true && TB.REG.e7fix && TB.REG.e7fix.v2 === true, 'vmgame: the fixtures registered as v2');
  const bad = [];
  for (const id of legacy) { TB.Cards.close(); try { TB.App.play(TB.REG[id]); G.advance(2000); } catch (e) { bad.push(id + ' ' + e.message); } if (G.errors.length || G.errorBox()) { bad.push(id + ' ' + String(G.errors[0] || G.errorBox()).slice(0, 120)); G.errors.length = 0; G.document.getElementById('err').style.display = 'none'; } }
  ok(!bad.length, 'vmgame: every legacy chapter starts and runs 2 s headless ' + bad.slice(0, 3).join(' | '));
  const t0 = G.now(); let fired = 0; G.window.setTimeout(() => fired++, 100); G.advance(99); ok(!fired, 'vmgame: timers wait for advance'); G.advance(1); ok(fired === 1 && G.now() === t0 + 100, 'vmgame: a timer fires on time');
  let frames = 0; const f = () => { frames++; if (frames < 50) G.window.requestAnimationFrame(f); }; G.window.requestAnimationFrame(f); G.advance(400);
  ok(frames === 10, 'vmgame: requestAnimationFrame runs at the legacy 40 ms cadence (' + frames + ' frames in 400 ms)');
  const G2 = load(html), G3 = load(html);
  const r2 = vm.runInContext('[Math.random(), Math.random()]', G2.window), r3 = vm.runInContext('[Math.random(), Math.random()]', G3.window);
  ok(r2.join() === r3.join(), 'vmgame: Math.random is seeded, so two loads agree');
  G2.TB.Save.d.quick = true; G2.TB.Save.save(); ok(G2.store.size > 0 && G2.TB.Save.adapter.kind === 'local', 'vmgame: localStorage works (' + G2.TB.Save.adapter.kind + ')');
  ok(load(html, { search: '?v1=1' }).TB.Url.v1 === true && load(html, { search: 'unit=e7fix&seed=5' }).TB.Url.seed === 5, 'vmgame: search reaches Url');
  const c = makeClock(); const order = []; c.setTimeout(() => order.push('b'), 20); c.setTimeout(() => order.push('a'), 10); c.setTimeout(() => order.push('c'), 20); c.advance(30);
  ok(order.join('') === 'abc', 'vmgame: timers run in time order, ties in creation order');
}

/* ---------- 2. vclock.js rAF shim ---------- */
{
  const q = []; const win = { addEventListener() { } };
  const ctx = { window: win, performance: { now: () => 0 }, Date: { now: () => 0 }, CanvasRenderingContext2D: function () { } };
  ctx.CanvasRenderingContext2D.prototype.fillText = () => { };
  vm.createContext(ctx); vm.runInContext('window.performance = performance;' + fs.readFileSync(path.join(SRC, 'vclock.js'), 'utf8'), ctx);
  ok(typeof win.requestAnimationFrame === 'function' && typeof win.cancelAnimationFrame === 'function', 'vclock: defines the rAF shim');
  let n = 0, last = -1; const step = t => { n++; last = t; win.requestAnimationFrame(step); }; win.requestAnimationFrame(step); win.__advance(200);
  ok(n === 5 && last === 200, 'vclock: rAF fires inside __advance every 40 ms with performance.now() (' + n + ' frames, t = ' + last + ')');
  const id = win.requestAnimationFrame(() => q.push(1)); win.cancelAnimationFrame(id); win.__advance(100); ok(!q.length, 'vclock: cancelAnimationFrame cancels');
}

/* ---------- 3. lint_text ---------- */
{
  const L = require('./lint_text'), G = load(html), TB = G.TB;
  ok(L.words('Eat {n} of {m} beetles — now.') === 6 && L.words('<b>two</b> words') === 2, 'lint: word count ({placeholder} = 1, dashes and tags ignored)');
  const fix = L.lintChapter(TB.REG.e7fix, { CVD: TB.CVD });
  ok(!fix.errors.length, 'lint: the clean fixture passes ' + fix.errors.slice(0, 3).join(' | '));
  const sk = L.lintChapter(TB.REG.skeleton, { CVD: TB.CVD });   // the skeleton is copied by every unit, so it must lint clean
  ok(!sk.errors.length, 'lint: the contract skeleton passes ' + sk.errors.slice(0, 3).join(' | '));
  const skBody = TB.REG.skeleton.content.body; TB.REG.skeleton.content.body = 'Your meals were the selection, and the survivors’ copies became the next gene pool, so the share climbed on pale sand and fell on dark sand.';
  ok(L.lintChapter(TB.REG.skeleton, { CVD: TB.CVD }).errors.some(e => /sentence of \d+ words/.test(e)), 'lint: finds an over-long sentence planted in the skeleton'); TB.REG.skeleton.content.body = skBody;
  const base = () => JSON.parse(JSON.stringify(Object.assign({}, TB.REG.e7fix, { sim: undefined, stars: undefined }), (k, v) => typeof v === 'function' ? undefined : v));
  const bad = (mut, re, msg) => { const ch = base(); mut(ch); ch.sim = TB.REG.e7fix.sim; ch.stars = TB.REG.e7fix.stars; const r = L.lintChapter(ch, {}); ok(r.errors.some(e => re.test(e)), 'lint catches ' + msg + ' ' + (r.errors.length ? '' : '(no errors)')); };
  bad(ch => { ch.content.hud.tap = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen'; }, /hud\.tap: 16 words > 15/, 'a 16-word HUD line');
  bad(ch => { ch.content.whispers.miss = 'Only bark there and nothing else to see here'; }, /whispers\.miss: 9 words > 8/, 'a 9-word whisper');
  bad(ch => { ch.content.labels.you = 'you are here now'; }, /labels\.you: 4 words > 3/, 'a 4-word label');
  bad(ch => { ch.content.take = 'The moths changed color over time.'; }, /US spelling "color"/, 'US spelling (color)');
  bad(ch => { ch.content.body = 'You realize the pale dots spread.'; }, /US spelling "realize"/, 'US spelling (-ize)');
  bad(ch => { ch.content.body = 'The moths learned to hide on the bark.'; }, /intentions/, 'agency ("the moths learned")');
  bad(ch => { ch.content.body = 'Over the season you evolved a paler wood.'; }, /never the evolving lineage/, 'agency ("you evolved")');
  bad(ch => { ch.content.why.real = ['Mutations are copying errors, nothing more.']; }, /copying errors/, 'a D0 "never" phrase');
  bad(ch => { ch.content.body = 'One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen.'; }, /sentence of 19 words/, 'a 19-word sentence');
  bad(ch => { ch.P.N.tag = 'xN'; }, /must say the real value/, 'an xN parameter without real');
  bad(ch => { ch.P.N.tag = 'guess'; }, /tag "guess"/, 'a bad parameter tag');
  bad(ch => { ch.levels = ch.levels.slice(0, 2); }, /2 levels; a unit has 3–6/, 'too few levels');
  bad(ch => { ch.content.model = []; }, /content\.model: missing/, 'a missing MODEL card');
  bad(ch => { ch.intro.goal = 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen'; }, /intro\.goal: 16 words/, 'a long intro goal');
  { const ch = base(); ch.content.body = 'The pale dots grew in size and the prize was a paler wood.'; ch.sim = TB.REG.e7fix.sim; ch.stars = TB.REG.e7fix.stars; ok(!L.lintChapter(ch, {}).errors.length, 'lint: "size" and "prize" are not US spellings'); }
  { const ch = base(); delete ch.sim; delete ch.stars; ok(L.lintChapter(ch, {}).errors.some(e => /sim: missing/.test(e)) && L.lintChapter(ch, {}).errors.some(e => /stars\.discover/.test(e)), 'lint: a non-Hunt chapter needs sim and stars'); }
  if (TB.CVD) { const ch = base(); ch.encodings = [{ k: 'A', rgb: [200, 60, 50], channels: ['colour'] }, { k: 'a', rgb: [60, 160, 60], channels: ['colour'] }]; ch.starTraits = ['A']; ch.sim = TB.REG.e7fix.sim; ch.stars = TB.REG.e7fix.stars; const r = L.lintChapter(ch, { CVD: TB.CVD }); ok(r.errors.some(e => /under deut/.test(e)) && r.errors.some(e => /hue lint/.test(e)), 'lint: CVD pairs (red/green under deut) and the hue lint'); }
  const S = (src, file) => L.lintSource(file || 'zebra.js', src);
  ok(S("const CH = { draw(c) { c.fillText('hi', 1, 2); } };").errors.some(e => /direct fillText/.test(e)), 'lint: direct fillText in a chapter file');
  ok(!S("const Lbl = { put(c) { c.fillText('hi', 1, 2); } };", '00_fx.js').errors.length, 'lint: fillText allowed in an engine file');
  ok(S('const f = x => Math.exp(-x);').errors.some(e => /Math\.exp/.test(e)), 'lint: Math.exp outside ghost-only');
  ok(!S('const G = {\n  // ghost-only. Kimura\n  kimura(p) { return Math.exp(-p) + Math.log(p); },\n  neutral(p) { return p; }   // ghost-only\n};').errors.length, 'lint: ghost-only functions may use Math.exp/log');
  ok(S('const G = {\n  // ghost-only\n  a(p) { return p; },\n  b(p) { return Math.sin(p); }\n};').errors.some(e => /Math\.sin/.test(e)), 'lint: the ghost-only mark covers one function, not the next');
  ok(S('const CH = { sim: { step() { return Math.random(); } } };').errors.some(e => /Math\.random/.test(e)), 'lint: Math.random in a sim');
  ok(S('const CH = { sim: { step() { document.title = 1; Stage.w; } } };').errors.filter(e => /inside sim/.test(e)).length === 2, 'lint: DOM and view objects inside sim');
  ok(S('const CH = { sim: { step() { return Date.now(); } } };').errors.some(e => /Date\.now/.test(e)), 'lint: Date.now in a sim');
  ok(S('const URL = 1;').errors.some(e => /never declare URL/.test(e)), 'lint: a const URL declaration');
  ok(S("const s = 'Math.exp(1) fillText(';\n// Math.pow(2, 3) in a comment\nconst t = x ** 2;").errors.length === 0, 'lint: strings, comments and integer ** are ignored');
  ok(S('const t = x ** 0.5;').errors.some(e => /non-integer exponent/.test(e)), 'lint: ** 0.5');
  const fx = fs.readFileSync(path.join(TESTS, 'fixtures', 'e7_fixture.js'), 'utf8');
  ok(!S(fx, 'e7fixture.js').errors.length, 'lint: the fixture source is clean ' + S(fx, 'e7fixture.js').errors.slice(0, 2).join(' | '));
}

/* ---------- 4. bots ---------- */
{
  const B = require('./bots'), TB = load(html).TB, TBc = load(html, { search: '?e7cheat=1' }).TB;
  ok(B.seedList('1-3,7').join() === '1,2,3,7', 'bots: seed lists');
  const r = B.sweep(TB, TB.REG.e7fix, { seeds: B.seedList('1-5') });
  ok(!r.fail && r.rows.length === 3 && r.rows.every(x => Object.keys(x.cells).length === 5), 'bots: the fixture sweep passes with 3 levels × 5 bots');
  const c = B.sweep(TBc, TBc.REG.e7fix, { seeds: B.seedList('1-5') });
  ok(c.fail && c.rows[2].cells.greedy.three.length === 5 && !c.rows[0].cells.greedy.three.length, 'bots: a planted three-star greedy bot on the boss level is caught');
  ok(/FAIL level 2: greedy earned three stars/.test(B.table(c)), 'bots: the table names the failing bot and level');
  const s0 = TB.R.state(); const a = runSim(TB, TB.REG.skeleton, 0, { seed: 3, policy: TB.REG.skeleton.sim.bots.greedy }), b = runSim(TB, TB.REG.skeleton, 0, { seed: 3, policy: TB.REG.skeleton.sim.bots.greedy });
  ok(JSON.stringify(a.s.hist) === JSON.stringify(b.s.hist) && a.ticks === b.ticks, 'bots: runSim is deterministic for a seed');
  ok(s0 !== undefined && a.s.log.length === a.acts, 'bots: runSim logs every action as [tick, action]');
  const capped = runSim(TB, TB.REG.e7fix, 0, { seed: 1, policy: () => null, cap: 30 });
  ok(capped.capped && capped.ticks === 30 && !capped.result, 'bots: the tick cap stops a run that never ends');
  ok(B.sweep(TB, TB.REG.e7fix, { seeds: [1], bots: ['idle', 'nosuchbot'] }).rows[0].cells.nosuchbot.missing, 'bots: a missing bot hook is reported, not run');
}

/* ---------- 5. oracle runner ---------- */
(async () => {
  const O = require('./oracle');
  const r = await O.runOracle(html, 'skeleton');
  ok(r.fail === 0 && r.pass >= 8, 'oracle: the skeleton oracle passes (' + r.pass + ' passed, ' + r.fail + ' failed) ' + r.out.filter(l => /FAIL/.test(l)).join(' | '));
  const tmp = path.join(os.tmpdir(), 'oracle_e7tmp_' + process.pid + '.js');
  fs.writeFileSync(tmp, "module.exports = async (G, t) => { t.ok(G.ch.id === 'e7fix', 'id'); t.near(1, 2, 0.5, 'far'); t.eq({a: [1]}, {a: [1]}, 'eq'); const s = G.reset(0, 4); t.ok(s.dots.length === 12, 'reset'); };");
  const f = await O.runOracle(html, 'e7fix', { file: tmp }); fs.unlinkSync(tmp);
  ok(f.pass === 3 && f.fail === 1 && f.out.some(l => /FAIL far \(got 1, want 2 ± 0.5\)/.test(l)), 'oracle: failures are counted and explained');
  const m = await O.runOracle(html, 'e7fix', { file: path.join(os.tmpdir(), 'no_such_oracle.js') });
  ok(m.fail === 1 && /no oracle file/.test(m.out.join()), 'oracle: a missing oracle file fails');

  /* ---------- 6. det ---------- */
  const D = require('./det'), TB = load(html).TB;
  const a = D.compute(TB.Det, TB.seed, TB.R), b = D.compute(TB.Det, TB.seed, TB.R);
  ok(JSON.stringify(a) === JSON.stringify(b) && a.v.length === 1000, 'det: 1,000 vectors, identical on a second run');
  ok(!D.accuracy(a.v).length, 'det: Det within 1e-14 of Math ' + D.accuracy(a.v).slice(0, 2).join(' | '));
  const sloppy = Object.assign({}, TB.Det, { exp: x => TB.Det.exp(x) * (1 + 1e-12) });
  ok(D.accuracy(D.compute(sloppy, TB.seed, TB.R).v).length > 0, 'det: the accuracy check catches a Det.exp off by 1e-12');
  ok(D.unhex(D.hex(-0)) === 0 && Object.is(D.unhex(D.hex(-0)), -0) && D.unhex(D.hex(5e-324)) === 5e-324, 'det: hex round trip keeps -0 and subnormals');
  const file = path.join(TESTS, 'det_vectors.json');
  if (fs.existsSync(file)) { const ref = JSON.parse(fs.readFileSync(file, 'utf8')); ok(JSON.stringify(ref.v) === JSON.stringify(a.v) && ref.seq.gauss.join() === a.seq.gauss.join(), 'det: this build matches tests/det_vectors.json bit for bit'); }
  else ok(false, 'det: tests/det_vectors.json is missing (run node tests/det.js once)');

  console.log(`selftest_e7: ${passes} passed, ${fails} failed` + (process.argv[2] ? '' : ` (private build ${html})`));
  process.exit(fails ? 1 : 0);
})().catch(e => { console.log('FAIL selftest threw', e && e.stack || e); process.exit(1); });
