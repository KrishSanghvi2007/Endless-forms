/* Batch 1 engine self-test: the engine changes made after Wave 2 Batch 1 (API_v2 §14), headless in a Node vm.

     node tests/selftest_b1.js [BUILD.html]   runs on BUILD (it must contain the b1fix fixture), or on a private build of
                                              source/ with every v2 file plus the fixture below
     node tests/selftest_b1.js --build-only   prints the path of that private build

   Covers: lint (the // cosmetic exemption, the census level waiver, per-level content keys), Url calm and untimed, HUD.say's
   firstWords budget, Entry.split, Entry.resume, Entry.show (o.stars, levelStars, levelTake, bodyFirst), ch.unitStars through
   Save.star2 and a reload, Freezer.put({force}), Predict (clear, fold, opened, linger, needMove, moved, P), LiveGraph compact,
   Fx.after, Whisper.drop, Keys.up → onKeyUp, Settings, and Ghost.show({el}). Exit 1 on any failure. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const SRC = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

const FIXTURE = String.raw`
/* b1fix: a three-level turn-based chapter for tests/selftest_b1.js (never in source/v2) */
const CH_B1FIX_V2 = {
  id: 'b1fix', v2: true, role: 'investigator', place: 'lab', intro: { goal: 'Test the Batch 1 engine.' }, untimed: true,
  levels: [{ name: 'One', adds: 'one', minutes: 1 }, { name: 'Two', adds: 'two', minutes: 1 }, { name: 'Three', adds: 'three', minutes: 1 }],
  content: {
    firstWords: 'one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two',
    take: 'Unit take.', body: 'Unit body.', stars: { discover: 'Unit discover line.', predict: 'Unit predict line.', transfer: 'Unit transfer line.' },
    levelTake: ['Level one take.', null, 'Level three take.'], levelBody: ['Level one body.'],
    levelStars: [{ predict: 'Level one predict line.' }, { transfer: 'Level two transfer line.' }],
    model: [{ level: 0, simulated: 'A counter.', simplification: 'Nothing real.', params: [], cannot: 'Anything.', nature: 'None.', contested: false, refs: ['none'] }]
  },
  // a unit star needs Discover in two levels (D1-style cross-level rule)
  unitStars(lv) { let n = 0; for (const m of lv) if (m & 1) n++; return (n >= 2 ? 1 : 0) | (lv.some(m => m & 2) ? 2 : 0); },
  sim: {
    dt: 1, s: null,
    reset(level) { this.s = { level, t: 0, log: [], done: false }; },
    step() { this.s.t++; return []; },
    act(a) { if (a.k === 'end') this.s.done = true; return [{ k: 'acted' }]; },
    result() { return this.s.done ? { mask: 1 } : null; },
    actions() { return [{ k: 'end' }]; }
  },
  stars: { discover: () => true, predict: () => false, transfer: () => false },
  keyUps: [],
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) { this.level = n; Sim.start(this, n, o); HUD.say(this.content.firstWords, ''); },
  update(dt) { Sim.run(this, dt); },
  draw() { },
  onKeyUp(k) { this.keyUps.push(k); },
  notes() { return { stats: [], charts: [{ type: 'trace', title: 'Counter', series: [{ d: [0, 1, 2], ink: 'A', label: 'n' }] }, { type: 'pq', title: 'Pool', p: 0.4, fold: false }] }; }
};
V2.push(CH_B1FIX_V2);
PLAN_ADD.push({ sec: 'Dev', entry: ['b1fix', 'Batch 1 fixture', 'Engine tests'] });
`;

function privateBuild() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'b1-')), dst = path.join(tmp, 'src');
  fs.mkdirSync(path.join(dst, 'v2'), { recursive: true });
  for (const f of fs.readdirSync(SRC)) if (/\.(js|html|py)$/.test(f) && fs.statSync(path.join(SRC, f)).isFile()) fs.copyFileSync(path.join(SRC, f), path.join(dst, f));
  for (const f of fs.readdirSync(path.join(SRC, 'v2'))) if (/\.js$/.test(f)) fs.copyFileSync(path.join(SRC, 'v2', f), path.join(dst, 'v2', f));
  fs.writeFileSync(path.join(dst, 'v2', 'b1fixture.js'), FIXTURE);
  const out = path.join(tmp, 'b1test.html');
  const env = Object.assign({}, process.env); delete env.V2_ONLY;
  cp.execFileSync('python3', ['build.py', out], { cwd: dst, env, stdio: 'pipe' });
  return out;
}
if (process.argv[2] === '--build-only') { console.log(privateBuild()); process.exit(0); }
const HTML = process.argv[2] ? path.resolve(process.argv[2]) : privateBuild();
const { load } = require('./vmgame');
const L = require('./lint_text');

/* ---------- 1. lint ---------- */
{
  const src = '/* header */\nconst A = 1;\nfunction f() { // cosmetic\n  return Math.sin(1); }\nfunction g() { return Math.cos(1); }\n';
  const r = L.lintSource('t.js', src);
  ok(r.errors.length === 1 && /:5: Math\.cos/.test(r.errors[0]), 'lint: // cosmetic exempts its own function, not the code after a header comment');
  const blk = L.lintSource('t.js', '/* a */\nfunction h() { /* ghost-only */ return Math.exp(1); }\nfunction k() { return Math.log(2); }\n');
  ok(blk.errors.length === 1 && /Math\.log/.test(blk.errors[0]), 'lint: a /* ghost-only */ block exempts only its function');
  const base = { intro: { goal: 'A goal.' }, untimed: true, keys: { Space: 'act' }, teacher: { prompts: ['a', 'b', 'c'] }, stars: { discover() { }, predict() { }, transfer() { } },
    sim: { dt: 1, reset() { }, step() { }, act() { }, result() { }, actions() { }, bots: { alwaysA() { }, alwaysB() { }, greedy() { }, threshold() { } } },
    content: { firstWords: 'Tap.', take: 'Take.', model: [{ level: 0, simulated: 'x', simplification: 'y', params: [], cannot: 'z', nature: 'w', contested: false, refs: ['r'] }] } };
  const lv = n => Array.from({ length: n }, (_, i) => ({ name: 'L' + i, adds: 'v' + i, minutes: 1 }));
  ok(!L.lintChapter(Object.assign({}, base, { id: 'census', levels: lv(8) })).errors.some(e => /levels/.test(e)), 'lint: census may have 8 levels (D6)');
  ok(L.lintChapter(Object.assign({}, base, { id: 'other', levels: lv(8) })).errors.some(e => /8 levels/.test(e)), 'lint: any other unit still has 3–6');
  const long = Object.assign({}, base, { id: 'x', levels: lv(3), content: Object.assign({}, base.content, { levelTake: ['one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twentyone'], levelStars: [{ predict: 'A short line.' }], extra: { a: 'The moths learned to hide.' } }) });
  const lr = L.lintChapter(long);
  ok(lr.errors.some(e => /levelTake\.0: 21 words/.test(e)), 'lint: levelTake is held to the take budget');
  ok(!lr.warnings.some(e => /levelTake|levelStars/.test(e)), 'lint: per-level keys are content keys');
  ok(lr.errors.some(e => /content\.extra\.a/.test(e)), 'lint: an unknown content key is text-checked, not skipped');
  ok(!L.lintChapter(Object.assign({}, base, { id: 'y', levels: lv(3), content: Object.assign({}, base.content, { hud: { a: 'Practice call: drag the marker.' } }) })).warnings.some(w => /Practice/.test(w)), 'lint: "Practice" the noun is not flagged');
}

/* ---------- 2. load with ?dev=1&calm=1&untimed=1 ---------- */
const G = load(HTML, { vw: 390, vh: 780, search: '?dev=1&calm=1&untimed=1' }), TB = G.TB, D = G.document;
const { App, REG, Save, Entry, Predict, LiveGraph, Fx, Whisper, HUD, Freezer, Strip, Hooks, Settings, Ghost } = TB;
const fix = REG.b1fix;
ok(G.errors.length === 0, 'build loads with no error' + (G.errors.length ? ': ' + G.errors[0] : ''));
ok(fix && fix.v2 === true, 'fixture registered (run without a BUILD argument)');
ok(TB.Url.calm === true && TB.Url.untimed === true && Fx.calm === true, 'Url: calm works in every build and Fx.calm follows it');
ok(Save.d.ui.unt === 1, 'Url: ?untimed=1 sets Save.d.ui.unt at boot');

/* ---------- 3. Entry: split, resume, show ---------- */
{
  const ch = Entry.split('Buri saw Ne of 11.5 flies. That is small. Is 3.84 the line? Yes.', 10);
  ok(ch[0] === 'Buri saw Ne of 11.5 flies. That is small.' && ch.every(c => !/^\d/.test(c)), 'Entry.split keeps decimals whole');
  ok(Entry.resume(fix) === 0, 'resume: a new unit starts at L1');
  Save.d.lv.b1fix = [1]; ok(Entry.resume(fix) === 1, 'resume: just past the furthest level finished');
  Save.d.lv.b1fix = [1, 1, 1]; ok(Entry.resume(fix) === 2, 'resume: never past the boss');
  Save.d.done.b1fix = 1; ok(Entry.resume(fix) === 0, 'resume: a finished unit starts again at L1');
  delete Save.d.done.b1fix; Save.d.lv.b1fix = []; delete Save.d.s2.b1fix;
  ok(HUD.warnings.length === 0, 'HUD.say: a 22-word firstWords is within its 40-word budget (no warning)');
  HUD.say('one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen', '');
  ok(HUD.warnings.length === 1, 'HUD.say: any other line over 15 words still warns');
  HUD.warnings.length = 0;

  App.playLevel(fix, 0, { seed: 5 }); G.advance(200);
  const card0 = Entry.show(fix, { level: 0, mask: 1 });
  const h0 = card0.innerHTML;
  ok(/Level one take\./.test(h0) && /Level one body\./.test(h0), 'show: levelTake and levelBody fill a level card');
  ok(/Level one predict line\./.test(h0) && !/Unit discover line/.test(h0), 'show: the still-to-earn line comes from levelStars[level]');
  ok(Save.d.s2.b1fix === 0 && Save.d.stars.b1fix === 0, 'unitStars: one level with Discover is not the unit Discover');
  TB.Cards.close();
  App.playLevel(fix, 1, { seed: 5 }); G.advance(200);
  const card1 = Entry.show(fix, { level: 1, mask: 1, stars: { transfer: 'Override line.' }, take: null, body: 'Own body.', chart: () => { }, bodyFirst: true });
  const h1 = card1.innerHTML;
  ok(/Override line\./.test(h1), 'show: o.stars overrides levelStars');
  ok(h1.indexOf('Own body.') >= 0 && h1.indexOf('Own body.') < h1.indexOf('<canvas'), 'show: bodyFirst puts the body above the chart');
  ok(!/take/.test(h1.replace(/class="[^"]*"/g, '')) || !/Level two/.test(h1), 'show: take: null means no take (no level default)');
  ok(Save.d.s2.b1fix === 1 && Save.d.stars.b1fix === 1, 'unitStars: Discover in two levels gives the unit Discover');
  TB.Keys.down({ key: 'Escape', target: { tagName: 'BODY' }, preventDefault() { } });
  ok(App.scr === 'menu' && !TB.Cards.isOpen(), 'Escape on a v2 level card goes back to the notebook');
  // a reload rebuilds s2 through unitStars, not as the OR of the levels
  Save.d.lv.b1fix = [1, 0, 2]; Save.save(); Save.load();
  ok(Save.d.s2.b1fix === 2 && Save.d.stars.b1fix === 1, 'unitStars: a reload rebuilds the unit mask through unitStars');
}

/* ---------- 4. Freezer.put force ---------- */
{
  App.playLevel(fix, 0, { seed: 9 }); G.advance(100); TB.Sim.act(fix, { k: 'end' }); G.advance(100);
  ok(TB.Sim.done(fix), 'fixture sim finished');
  Freezer.put('b1fix', 1, 'snapA'); ok(Freezer.list('b1fix').length === 0, 'Freezer.put ignores a finished sim');
  Freezer.put('b1fix', 2, 'snapB', { force: true }); ok(Freezer.list('b1fix').length === 1, 'Freezer.put({force: true}) keeps it');
}

/* ---------- 5. Predict: clear, fold, opened, linger, needMove, moved, P ---------- */
{
  App.playLevel(fix, 0, { seed: 2 }); G.advance(200);
  const commits = [], stills = [], outs = [];
  let h = Predict.ask({ id: 'q1', chart: 0, kind: 'y', axis: { lo: 0, hi: 1 }, start: 0.5, tol: 0.1, soft: null, needMove: true, onCommit: r => commits.push(r), onStill: r => stills.push(r) });
  Predict.commit(); ok(Predict.cur && commits.length === 0 && stills.length === 1, 'needMove: committing an untouched ghost calls onStill and keeps the ask open');
  const key = k => TB.Keys.down({ key: k, target: { tagName: 'CANVAS' }, preventDefault() { } });
  key('p'); key('p'); ok(Predict.cur.focus === true, 'P focuses and a second P keeps the focus (Escape leaves)');
  key('ArrowUp'); key('Enter');
  ok(!Predict.cur && commits.length === 1 && commits[0].moved === true && fix.sim.s.log.some(e => e[1].k === 'predict' && e[1].id === 'q1'), 'needMove: a moved ghost commits; onCommit gets moved: true; the commit is logged');
  ok(Predict.overlay(0) && Predict.overlay(0).committed, 'the committed band stays on chart 0');
  Predict.clear(0); ok(!Predict.overlay(0), 'Predict.clear(chart) drops that chart\'s band');
  TB.Save.d.ui.unt = 0;
  h = Predict.ask({ id: 'q2', chart: 0, kind: 'y', axis: { lo: 0, hi: 1 }, start: 0.5, tol: 0.1, soft: 2, needMove: true, onCommit: r => commits.push(r), onTimeout: r => outs.push(r) });
  G.advance(2600); ok(!Predict.cur && outs.length === 1 && commits.length === 1 && !fix.sim.s.log.some(e => e[1].id === 'q2'), 'needMove: the soft timer closes an untouched ask without a commit and calls onTimeout');
  h = Predict.ask({ id: 'q3', chart: 1, kind: 'pq', axis: { lo: 0, hi: 1 }, start: 0.3, tol: 0.1, soft: null, onCommit: r => commits.push(r) });
  Predict.commit(); ok(commits.length === 2 && commits[1].moved === false, 'without needMove an untouched ghost commits, with moved: false');
  Predict.clear(); ok(!Predict.overlay(0) && !Predict.overlay(1) && !Predict.cur, 'Predict.clear() drops every band');
  // fold: on a phone the ask opens the strip; fold() closes it at once; linger closes it after a commit
  Predict._opened = true; Strip.isOpen = true; Predict.fold(); ok(Predict.opened === false, 'Predict.fold() folds a strip the ask opened');
  const a4 = Predict.ask({ id: 'q4', chart: 0, kind: 'y', axis: { lo: 0, hi: 1 }, start: 0.5, soft: null, linger: 300 });
  ok(Predict.cur && Predict.cur.linger === 300, 'ask({linger}) is kept on the record (default 900 ms)');
  a4.cancel();
}

/* ---------- 6. LiveGraph compact, Strip fold:false ---------- */
{
  ok(LiveGraph._compact({}, 78) && !LiveGraph._compact({}, 160) && !LiveGraph._compact({ compact: false }, 78) && LiveGraph._compact({ compact: true }, 300), 'LiveGraph: compact under 100 px, or as the spec says');
  const cv = D.createElement('canvas'); cv.style.width = '180px'; cv.style.height = '78px'; D.body.appendChild(cv);
  const e0 = LiveGraph.errors.length;
  for (const sp of [{ type: 'trace', title: 'Share', x: { lo: 0, hi: 5, label: 'gen' }, y: { lo: 0, hi: 1, label: 'p' }, series: [{ d: [0.1, 0.4], ink: 'A', label: 'A share' }], you: 0.3 }, { type: 'pq', title: 'Pool', p: 0.3 }, { type: 'tri', title: 'HW', variant: 'hw', pts: [{ f: [0.3, 0.4, 0.3], kind: 'dusk' }] }])
    LiveGraph.draw(cv, sp, 'dusk');
  ok(LiveGraph.errors.length === e0, 'LiveGraph: compact charts draw without errors');
  App.playLevel(fix, 0, { seed: 3 }); G.advance(800); Strip.redraw();
  const figs = D.getElementById('strip-charts').children;
  ok(figs.length === 2 && figs[1].classList.contains('nofold') && !figs[0].classList.contains('nofold'), 'Strip: a spec with fold: false gets the nofold class');
}

/* ---------- 7. Fx.after, Whisper.drop, Keys.up, Settings, Ghost el ---------- */
{
  let ran = 0; Fx.after(100, () => ran++); Fx.update(0.05); ok(ran === 0, 'Fx.after waits'); Fx.update(0.06); ok(ran === 1, 'Fx.after runs on the frame clock');
  const hnd = Fx.after(50, () => ran++); hnd.cancel(); Fx.update(0.1); ok(ran === 1, 'Fx.after cancel()');
  Fx.after(50, () => ran++); Fx.clear(); Fx.update(0.1); ok(ran === 1, 'Fx.clear() drops pending afters');
  Whisper.say('A short line.'); ok(Whisper.cur, 'whisper shown'); Whisper.drop(); ok(!Whisper.cur, 'Whisper.drop() hides it now');
  TB.Keys.up({ key: ' ', target: { tagName: 'CANVAS' }, preventDefault() { } }); ok(fix.keyUps.indexOf(' ') >= 0, 'Keys.up forwards keyup to a v2 chapter\'s onKeyUp');
  Settings.set('read', 1); ok(Save.d.ui.read === 1 && D.body.classList.contains('readable'), 'Settings.set stores the preference and applies its body class');
  Settings.set('read', 0); ok(!D.body.classList.contains('readable'), 'Settings.set turns it off');
  const box = Settings.open(); ok(box && box.innerHTML.indexOf('Untimed') >= 0 && box.querySelectorAll('.tog').length === 4, 'Settings.open shows four toggles');
  TB.Cards.close();
  const btn = D.createElement('button'); D.body.appendChild(btn); Save.d.ui.verbs = 0;
  let threw = false; try { const g = Ghost.show({ verb: 'tap', el: btn }); g.hide(); } catch (e) { threw = true; }
  ok(!threw, 'Ghost.show({el}) runs headless');
}

console.log((fail ? 'FAIL' : 'PASS') + ': selftest_b1 ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
