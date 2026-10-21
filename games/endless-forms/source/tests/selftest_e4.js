/* E4 self-test: v2/00_entry.js and v2/zz_v1switch.js (API_v2 §6, §10) in a Node vm (tests/vmgame.js).
     node tests/selftest_e4.js [--keep] [--build-only]
   Builds a private copy of source/ with the engine files (0*, zz_*) plus two test-only fixture units written below
   ('e4fix', added through PLAN_ADD, and a stand-in for the new id 'royal'), then checks: the act plan, retitles, the
   App.open / End.show / App.go / App.playLevel wraps, the v2 level and end cards, Sim (fixed step, no step after the
   result, exact replays), Snap, Freezer, Replay, ResultCode, Begin into the Wood, and that ?v1=1 changes nothing.
   Exit 1 on any failure. The browser-side checks (timings, focus, Calm, screenshots) are in selftest_e4.py. */
'use strict';
const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { load } = require('./vmgame');
const SRC = path.join(__dirname, '..');

let fails = 0, passes = 0;
const ok = (c, m) => { if (c) passes++; else { fails++; console.log('FAIL', m); } };
const eq = (a, b, m) => ok(a === b, m + ' (got ' + JSON.stringify(a) + ', want ' + JSON.stringify(b) + ')');
const words = s => String(s).split(/\s+/).filter(Boolean).length;

/* ---------- the fixture units (test-only; never copied into source/v2) ---------- */
const FIXTURE = String.raw`
const CH_E4FIX_V2 = {
  id: 'e4fix', v2: true, role: 'environment', place: 'wood', plan: ['E4 Fixture', 'Entry test'],
  intro: { goal: 'Tap until the target; the level then ends.' },
  content: {
    firstWords: 'Tap anywhere.', hud: { n: '{n} taps to go.' },
    interesting: { flat: 'Nothing moved before you finished. Why?' },
    levers: { half: 'Half target', double: 'Double target' },
    take: 'Each tap is one step toward the target.',
    body: 'You reached the target. Every tap counted once, and the clock kept its own time.',
    stars: { discover: 'Reach the target.', predict: 'Tap on the half-second.', transfer: 'Finish the boss level.' },
    model: [
      { level: 0, simulated: 'A counter of taps.', simplification: 'Nothing else happens.', params: [{ name: 'target', value: 5, tag: 'designed' }, { name: 'generations', value: 3, tag: 'xN', real: 'decades' }], cannot: 'Anything about real birds.', nature: 'Real counts are noisy.', contested: false, refs: ['e4-1'] },
      { level: 2, simulated: 'The boss counter.', simplification: 'Still nothing else.', params: [{ name: 'target', value: 7, tag: 'realistic' }], cannot: 'Any evolution.', nature: 'Bosses invert lessons.', contested: true, refs: ['e4-2'] }
    ],
    why: {
      real: ['One. Two two. Three three three. Four four four four. Five five five five five. Six six six six six six. Seven seven seven seven seven seven seven. Eight eight eight eight eight eight eight eight. Nine nine nine nine nine nine nine nine nine. Ten ten ten ten ten ten ten ten ten ten. Eleven eleven eleven eleven eleven eleven eleven eleven eleven eleven eleven. Twelve twelve twelve twelve twelve twelve twelve twelve twelve twelve twelve twelve.'],
      maths: ['The target is n plus the level.']
    }
  },
  P: { need: { v: 5, tag: 'designed', min: 2, max: 9, label: 'target' } },
  levels: [{ name: 'One', adds: 'taps', codes: ['B1'], minutes: 1 }, { name: 'Two', adds: 'a higher target', codes: ['B1'], minutes: 1 }, { name: 'Boss', adds: 'the boss', codes: ['B1'], minutes: 1 }],
  keys: { Space: 'tap' }, untimed: true,
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      this.s = { level, need: 5 + level, taps: 0, t: 0, gen: 0, draws: [], lever: null, steps: 0, log: [] };
      if (o && o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.s.lever = o.thaw.lever; this.s.need = o.thaw.lever === 'half' ? Math.max(1, this.s.taps + 1) : this.s.need * 2; }
    },
    step(dt) { const s = this.s; s.steps++; s.t += dt; if (Math.floor(s.t * 2) > s.gen) { s.gen++; s.draws.push(R()); return [{ k: 'gen', gen: s.gen }]; } return []; },
    act(a) { const s = this.s; if (a.k === 'tap') { s.taps++; s.draws.push(R()); return [{ k: 'tap' }]; } return []; },
    result() { const s = this.s; if (s.taps < s.need) return null; return { mask: 1 | (s.level === 2 ? 4 : 0) | (s.taps === s.need && s.gen % 2 ? 2 : 0) & 0, outcome: {}, interesting: s.gen < 1 ? 'flat' : null }; },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() { return [{ k: 'tap' }]; },
    bots: { alwaysA(s, acts) { return acts[0]; }, alwaysB() { return null; }, greedy(s, acts) { return acts[0]; }, threshold() { return null; } }
  },
  stars: { discover: s => s.taps >= s.need, predict: () => false, transfer: (s, n) => n === 2 },
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    this.level = n; this.ended = false; Sim.start(this, n, o);
    Dock.set([{ id: 'tap', label: 'Tap', key: 'T', primary: true, fn: () => Sim.act(this, { k: 'tap' }) }]);
    HUD.say(this.content.firstWords, this.sim.s.need);
  },
  update(dt) {
    const ev = Sim.run(this, dt);
    for (const e of ev) if (e.k === 'gen') Freezer.put(this.id, e.gen, this.sim.snapshot());
    const r = this.sim.result();
    if (r && !this.ended) {
      this.ended = true; const last = Freezer.list(this.id).slice(-1)[0];
      End.show(this, { level: this.level, mask: r.mask, final: this.level === this.levels.length - 1, interesting: r.interesting,
        whatIf: last ? { gen: last.gen, levers: ['half', 'double'] } : null, chart: cv => { this.charted = (this.charted || 0) + 1; } });
    }
  },
  draw(c, w, h) { c.fillStyle = '#334'; c.fillRect(0, 0, w, h); },
  tap() { Sim.act(this, { k: 'tap' }); },
  onKey(k) { if (k === ' ') Sim.act(this, { k: 'tap' }); },
  notes() { return { stats: [['Taps', String(this.sim.s.taps), '']], charts: [] }; }
};
V2.push(CH_E4FIX_V2);
PLAN_ADD.push({ sec: 'Dev', entry: ['e4fix', 'E4 fixture', 'Test harness'] });
const CH_E4ROYAL_V2 = Object.assign({}, CH_E4FIX_V2, { id: 'royal', plan: ['Royal Stand-in', 'X test'], sim: Object.assign({}, CH_E4FIX_V2.sim) });
V2.push(CH_E4ROYAL_V2);
`;

function build() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ef_e4_'));
  for (const f of fs.readdirSync(SRC)) if (f.endsWith('.js') || f === 'shell.html' || f === 'build.py') fs.copyFileSync(path.join(SRC, f), path.join(tmp, f));
  fs.mkdirSync(path.join(tmp, 'v2'));
  for (const f of fs.readdirSync(path.join(SRC, 'v2'))) if (/^(0.*|zz_.*)\.js$/.test(f)) fs.copyFileSync(path.join(SRC, 'v2', f), path.join(tmp, 'v2', f));
  fs.writeFileSync(path.join(tmp, 'v2', 'e4fix.js'), FIXTURE);
  const out = path.join(tmp, 'e4_selftest.html');
  cp.execFileSync('python3', ['build.py', out], { cwd: tmp, env: Object.assign({}, process.env, { V2_ONLY: '' }), stdio: 'pipe' });
  return { tmp, out };
}

const { tmp, out } = build();
if (process.argv.includes('--build-only')) { console.log(out); process.exit(0); }   // selftest_e4.py drives this build in Chromium
const LEGACY = ['mendel', 'scribe', 'cross', 'census', 'coal', 'casino', 'castaways', 'sex', 'lichen', 'soot', 'fancier', 'sieve', 'bitter', 'landscape', 'jaws', 'hawks', 'bats', 'brood', 'gametes', 'lek', 'raffle', 'spindle', 'meadow', 'alarm', 'nest', 'commons', 'many', 'livefast', 'forager', 'crowd', 'plastic', 'lock', 'clinic', 'virulence', 'guest', 'switch', 'copy', 'sweep', 'clock', 'river', 'fruits', 'ring', 'double', 'arch', 'tree', 'web', 'islands', 'fire'];
const card = G => G.document.querySelector('#cards .card');
const cardOpen = G => G.document.getElementById('cards').classList.contains('on') ? card(G) : null;
// play the unit's own first dock button until a level or end card opens; a description card (D6 decision 8) is closed with Play
const untilCard = (G, TB) => { for (let k = 0; k < 3000; k++) { const c = cardOpen(G); if (c && !c.classList.contains('ef-intro')) return c; if (c) TB.Intro.go(); else TB.Dock.items[0]._el.click(); G.advance(60); } return null; };
const btns = c => [...c.querySelector('.card-btns').children];
const arm = G => G.advance(400);   // Cards' ghost-tap guard arms a card after 380 ms

/* ---------- 1. the act plan, retitles, menu ---------- */
{
  const G = load(out), TB = G.TB, PLAN_ = TB.ACT_PLAN; G.advance(200);
  eq(PLAN_.length, 13, 'ACT_PLAN has acts 0–11 and the appendix');
  const actIds = PLAN_.flatMap(p => p.c.map(c => c[0]));
  eq(actIds.length, 52, 'ACT_PLAN lists 52 ids');
  eq(new Set(actIds).size, 52, 'every ACT_PLAN id appears once');
  ok(LEGACY.every(id => actIds.indexOf(id) >= 0), 'every legacy id is in ACT_PLAN');
  ok(['royal', 'tap', 'swamp', 'dig'].every(id => actIds.indexOf(id) >= 0) && actIds.indexOf('mixer') < 0, 'the new ids are listed and mixer is withdrawn (D6)');
  eq(TB.ORDER.join(), actIds.concat(['e4fix']).join(), 'ORDER follows the acts, then PLAN_ADD');
  ok(LEGACY.every(id => TB.REG[id] && !TB.isV2(TB.REG[id])), 'all 48 legacy chapters stay registered');
  const ent = id => PLAN_.flatMap(p => p.c).find(c => c[0] === id);
  eq(ent('census')[1], 'Equilibrium', 'census is titled Equilibrium (D6)');
  eq(ent('lek')[2], 'Mate choice and honest signals', 'Lek subtitle fix (D2 §3)');
  eq(ent('meadow')[2], 'Pollinators and plant mating', 'Meadow subtitle (D5 §2)');
  eq(PLAN_[11].n, 'Applied evolution', 'Act 11 is Applied evolution (D6)');
  eq(PLAN_[12].act, null, 'the appendix has act null');
  eq(TB.REG.e4fix.title, 'E4 Fixture', 'retitle reaches a PLAN_ADD entry');
  eq(TB.REG.royal.title, 'Royal Stand-in', 'retitle reaches a PLAN entry');
  eq(TB.REG.royal.concept, 'X test', 'retitle sets the subtitle');
  eq(ent('royal')[1], 'The Royal Line', 'ACT_PLAN itself is never retitled');
  eq(TB.REG.census.title, 'Equilibrium', 'the legacy census chapter reads its title from the plan');
  TB.App.go('menu');
  const mb = G.document.getElementById('menu-body').innerHTML;
  ok(/Act 0/.test(mb) && /Act 11/.test(mb) && /Appendix: the field guide/.test(mb), 'the menu shows act headings and the appendix');
  for (const id of ['tap', 'swamp', 'dig']) ok(new RegExp('class="chap soon"[^>]*data-id="' + id + '"').test(mb), 'unbuilt unit ' + id + ' shows as in preparation');
  const soon = G.document.getElementById('menu-body').querySelectorAll('.chap').find(b => b.dataset.id === 'dig');
  soon.click(); G.advance(50);
  ok(/still being written/.test(G.document.getElementById('whisper').textContent + G.document.getElementById('toasts').textContent), 'tapping an unbuilt unit says it is still being written');
  eq(TB.App.scr, 'menu', 'an unbuilt unit does not open');
  ok(!!G.document.getElementById('ef-entry'), 'the card style is injected');
  ok(G.errors.length === 0 && !G.errorBox(), 'no errors at load (' + G.errors.join('; ') + ')');
}

/* ---------- 2. Snap ---------- */
{
  const G = load(out), { Snap } = G.TB, W = globalThis;   // Node typed arrays: Snap reads the type by its tag, so a foreign realm works too
  const g = new W.Float32Array([0.1, -0, 3e38, 1e-45, NaN]); g.id = 7; g.pa = [3, 4]; g.lin = new W.Uint32Array([14, 15]);
  const o = { a: 1, neg: -0, inf: -Infinity, nan: NaN, s: 'x', b: true, n: null, f: () => 1, u: undefined, arr: [1, undefined, () => 0, -0],
    g, f64: new W.Float64Array([Math.PI, -1e-310, Infinity]), i8: new W.Int8Array([-128, 127]), u8: new W.Uint8Array([255]), c8: new W.Uint8ClampedArray([9]),
    i16: new W.Int16Array([-32768]), u16: new W.Uint16Array([65535]), i32: new W.Int32Array([-2147483648]), u32: new W.Uint32Array([4294967295]), deep: { x: [{ y: new W.Float32Array([1.5]) }] } };
  const back = Snap.dec(Snap.enc(o));
  const same = (a, b) => Object.is(a, b);
  ok(same(back.neg, -0) && same(back.inf, -Infinity) && Number.isNaN(back.nan) && back.s === 'x' && back.b === true && back.n === null, 'Snap keeps −0, −Infinity, NaN and plain values');
  ok(!('f' in back) && !('u' in back) && back.arr.length === 4 && back.arr[1] === null && back.arr[2] === null && same(back.arr[3], -0), 'Snap drops functions as JSON does');
  const bitsEq = (x, y) => x.constructor.name === y.constructor.name && x.length === y.length && Array.from(x).every((v, i) => same(v, y[i]));
  ok(['g', 'f64', 'i8', 'u8', 'c8', 'i16', 'u16', 'i32', 'u32'].every(k => bitsEq(back[k], o[k])), 'Snap round-trips every typed array kind bit for bit');
  ok(back.g.id === 7 && back.g.pa.join() === '3,4' && bitsEq(back.g.lin, g.lin), 'Snap keeps genome expandos (id, pa, lin)');
  ok(bitsEq(back.deep.x[0].y, o.deep.x[0].y), 'Snap reaches nested typed arrays');
  eq(Snap.enc(Snap.dec(Snap.enc(o))), Snap.enc(o), 'Snap.enc ∘ dec is the identity on its output');
}

/* ---------- 3. ResultCode, Replay ---------- */
{
  const G = load(out), { ResultCode: RC, Replay } = G.TB;
  eq(RC.make(0), '000000', 'make(0)');
  eq(RC.make(0x3fffffff), 'ZZZZZZ', 'make(2^30 − 1)');
  eq(RC.make(0x40000000 + 5), RC.make(5), 'make keeps only 30 bits');
  let rt = true; for (let i = 0; i < 2000; i++) { const b = Math.floor(Math.random() * 0x40000000); if (RC.read(RC.make(b)) !== b) rt = false; }
  ok(rt, 'read(make(b)) = b for 2,000 values');
  const c = RC.make(123456789);
  eq(RC.show(c), c.slice(0, 3) + ' ' + c.slice(3), 'show groups 3 + 3');
  eq(RC.read(RC.show(c).toLowerCase()), 123456789, 'read ignores case and the space');
  eq(RC.read('1I L-0O0'), RC.read('111000'), 'read maps I, L to 1 and O to 0');
  ok(RC.read('ABCDE') === null && RC.read('ABCDEFG') === null && RC.read('UUUUUU') === null && RC.read(null) === null, 'read rejects bad codes');
  ok(/^[0-9A-HJKMNP-TV-Z]{6}$/.test(RC.make(987654321)), 'make uses the Crockford alphabet');
  const log = [[0, { k: 'tap' }], [12, { k: 'predict', id: 'g1', v: 0.35 }], [40, { k: 'tap', note: 'é ü ✓' }]];
  const code = Replay.encode(4000000000, 2, log), r = Replay.decode(code);
  ok(code.startsWith('R1.') && /^R1\.[A-Za-z0-9_-]+$/.test(code), 'Replay.encode → R1. + base64url');
  ok(r && r.seed === 4000000000 && r.level === 2 && JSON.stringify(r.log) === JSON.stringify(log), 'Replay round trip (seed, level, log; UTF-8)');
  ok(JSON.stringify(Replay.decode(code.slice(0, 10) + '\n ' + code.slice(10))) === JSON.stringify(r), 'Replay.decode ignores whitespace');
  const b64 = s => 'R1.' + Buffer.from(s).toString('base64url');
  ok([null, '', 'R2.abc', 'R1.!!', b64('[1,2]'), b64('[1,-1,[]]'), b64('[1,0,[[-1,{}]]]'), b64('{"a":1}'), b64('not json')].every(x => Replay.decode(x) === null), 'Replay.decode rejects malformed codes');
}

/* ---------- 4. Sim: fixed step, ≤ 8 ticks, no step after the result, exact replay ---------- */
{
  const G = load(out), TB = G.TB, { Sim, Snap } = TB, ch = TB.REG.e4fix;
  TB.seed(99); Sim.start(ch, 0, {});
  eq(Sim.tick(ch), 0, 'Sim.start resets the tick');
  ok(Array.isArray(ch.sim.s.log) && ch.level === 0, 'Sim.start sets ch.level and keeps s.log');
  Sim.run(ch, 0.1); eq(Sim.tick(ch), 3, 'Sim.run steps floor(dt / sim.dt) ticks');
  Sim.run(ch, 5); eq(Sim.tick(ch), 11, 'Sim.run takes at most 8 ticks per call and drops the backlog');
  Sim.run(ch, 0.02); eq(Sim.tick(ch), 11, 'a dropped backlog is not carried over');
  const evs = []; const off = TB.Events.on('act', r => evs.push(r));
  const ev = Sim.act(ch, { k: 'tap' });
  ok(ev.length === 1 && ev[0].k === 'tap', 'Sim.act returns the sim view events');
  ok(JSON.stringify(ch.sim.s.log[0]) === JSON.stringify([11, { k: 'tap' }]), 'Sim.act logs [tick, action]');
  ok(evs.length === 1 && evs[0].a.k === 'tap', 'Sim.act emits act');
  off();
  // a scripted run: taps at fixed ticks, then compare against its replay
  const script = [2, 5, 5, 9, 30, 31];   // ticks at which to tap; uneven frame times make some frames take two ticks
  const runLive = () => {
    TB.seed(4242); Sim.start(ch, 1, {}); const todo = script.slice();
    for (let f = 0; f < 400 && !ch.sim.result(); f++) { while (todo.length && todo[0] <= Sim.tick(ch)) { todo.shift(); Sim.act(ch, { k: 'tap' }); } Sim.run(ch, 1 / 30 + (f % 3) * 0.013); }
    return { s: Snap.enc(ch.sim.s), rs: TB.R.state(), tick: Sim.tick(ch) };
  };
  const live = runLive(), log = JSON.parse(JSON.stringify(ch.sim.s.log));
  ok(ch.sim.result() !== null, 'the scripted run finishes');
  const t0 = Sim.tick(ch), steps0 = ch.sim.s.steps; Sim.run(ch, 0.2);
  ok(Sim.tick(ch) === t0 && ch.sim.s.steps === steps0, 'a finished sim never steps again');
  TB.seed(4242); Sim.start(ch, 1, { replay: log });
  ok(Sim.replaying(ch), 'a replay queue is pending');
  const before = ch.sim.s.taps; Sim.act(ch, { k: 'tap' }); eq(ch.sim.s.taps, before, 'live input is dropped while a replay drives');
  for (let f = 0; f < 400 && !ch.sim.result(); f++) Sim.run(ch, 0.05);
  eq(Snap.enc(ch.sim.s), live.s, 'a replay reproduces the sim state and its log exactly');
  eq(TB.R.state(), live.rs, 'a replay reproduces the R() state');
  eq(Sim.tick(ch), live.tick, 'a replay ends on the same tick');
  ok(!Sim.replaying(ch), 'the replay queue empties');
  // a chapter without a sim (Hunt mode, B0-simple) still logs actions
  const hunt = { id: 'h', v2: true };
  Sim.start(hunt, 0, {}); Sim.act(hunt, { k: 'tap', i: 3 });
  ok(Sim.log(hunt).length === 1 && Sim.run(hunt, 1).length === 0, 'Sim logs actions for a chapter without a sim');
}

/* ---------- 5. App.open, star migration, the level card, Why?, What if?, Freezer, the end card ---------- */
{
  const G = load(out), TB = G.TB, { App, Save, Freezer, Replay, Events } = TB, ch = TB.REG.e4fix;
  G.advance(200);
  Save.d.stars.e4fix = 3; const opens = Save.d.opens;
  App.open(ch); G.advance(100);
  ok(App.scr === 'play' && App.ch === ch && ch.level === 0, 'App.open plays a v2 unit at level 0');
  ok(cardOpen(G) && card(G).classList.contains('ef-intro'), 'a v2 unit opens on its description card (D6 decision 8), not the legacy intro');
  ok(!card(G).classList.contains('intro'), 'the legacy intro card is skipped'); TB.Intro.go(); ok(!cardOpen(G), 'Play closes the description card');
  ok(Save.d.v1stars.e4fix === 3 && Save.d.stars.e4fix === 0, 'App.open migrates the old best to v1stars');
  eq(Save.d.opens, opens, 'ch99 TRANSFER/RECALL wrap is bypassed (opens unchanged)');
  // ch99 would ask a TRANSFER question for soot once lichen is done; a v2 soot must skip it
  Save.d.done.lichen = 1; const vsoot = Object.assign({}, ch, { id: 'soot', title: 'Soot', num: 1 });
  App.open(vsoot); G.advance(100);
  ok(App.ch === vsoot && (!cardOpen(G) || card(G).classList.contains('ef-intro')), 'a v2 unit skips ch99 question cards (only its description card)'); TB.Intro.go();
  delete Save.d.done.lichen;
  // the level card
  App.open(ch); G.advance(100); TB.Intro.go(); G.advance(1100);
  const L0 = [...Events.log];
  for (let i = 0; i < 5; i++) { TB.Dock.items[0]._el.click(); G.advance(60); }   // the unit's own first button (the dock's "?" sits outside Dock.items)
  G.advance(100);
  let c = cardOpen(G);
  ok(!!c && c.classList.contains('lvl') && c.classList.contains('v2') && !c.classList.contains('end'), 'level card: class lvl v2');
  eq(c.dataset.stars, '1', 'level card: data-stars is the unit stars');
  eq(c.querySelector('.ef-stars').getAttribute('aria-label'), '1 of 3 stars: Discover', 'level card: the stars carry an aria-label');
  eq(c.getAttribute('role'), 'dialog', 'level card is a dialog');
  eq(btns(c).map(b => b.textContent).join('|'), 'Why?|What if?|Replay level|Next level', 'level card buttons, primary last');
  eq(btns(c)[3].getAttribute('aria-label'), 'Next level: Two', 'Next level names the next level');
  ok(btns(c)[3].classList.contains('primary'), 'Next level is primary');
  eq(c.querySelector('h3').textContent, 'Level 1 done', 'level card title');
  ok(/Predict: Tap on the half-second\./.test(c.textContent), 'the first missing star shows its criterion');
  ok(!c.querySelector('.take') && !c.querySelector('.body'), 'a level card does not repeat the unit TAKE and body');
  eq(ch.charted, 1, 'the card draws its one chart');
  ok(JSON.stringify(Save.d.lv.e4fix) === '[1]' && Save.d.s2.e4fix === 1 && Save.d.stars.e4fix === 1, 'Save.star2 recorded the level mask');
  const newEv = Events.log.slice(L0.length);
  ok(newEv.some(e => e.type === 'level' && e.n === 0 && e.mask === 1) && newEv.some(e => e.type === 'star' && e.mask === 1 && e.stars === 1), 'level and star events');
  const rp = Replay.decode(c.dataset.replay);
  ok(rp && rp.seed === App.seed && rp.level === 0 && rp.log.length === 5 && rp.log.every(e => e[1].k === 'tap'), 'the card carries the run as a replay code');
  ok(Freezer.list('e4fix').length >= 1, 'the run froze vials');
  arm(G);
  // Why?: ≤ 60-word chunks, In nature → The maths → The model (with ×N chip)
  const why = btns(c)[0]; why.click(); G.advance(20);
  const wp = c.querySelector('.why');
  ok(!wp.hidden && why.getAttribute('aria-expanded') === 'true', 'Why? opens the panel');
  const seen = [];
  for (let k = 0; k < 20; k++) {
    seen.push({ h: wp.querySelector('h4').textContent, p: wp.querySelector('p').textContent, chips: wp.querySelectorAll('.pchip').map(x => x.textContent).join('; ') });
    const nx = wp.querySelectorAll('[data-go]').find(b => b.dataset.go === '1');
    if (!nx || nx.disabled) break; nx.click();
  }
  ok(seen.length >= 5, 'Why? pages through ' + seen.length + ' chunks');
  ok(seen.every(x => words(x.p) <= 60), 'every Why? chunk is ≤ 60 words');
  eq(seen[0].h, 'In nature', 'Why? starts with In nature');
  ok(seen[0].p.startsWith('One.') && seen[1].h === 'In nature' && !/^One/.test(seen[1].p), 'a long why.real paragraph is split at sentence ends');
  ok(seen.some(x => x.h === 'The maths'), 'Why? includes The maths');
  const m = seen.find(x => x.h === 'The model');
  ok(!!m && /target 5 designed/.test(m.chips) && /generations 3 ×N, real decades/.test(m.chips), 'MODEL card params carry tags and the ×N chip');
  ok(seen.some(x => x.h === 'What it cannot show') && !seen.some(x => /Contested/.test(x.h)), 'level 1 uses the level-0 MODEL card');
  why.click(); ok(wp.hidden && why.getAttribute('aria-expanded') === 'false', 'Why? toggles closed');
  // What if?: chips thaw the last vial
  const wi = btns(c)[1]; wi.click();
  const chips = c.querySelectorAll('.chip');
  ok(!c.querySelector('.chips').hidden && chips.map(b => b.textContent).join('|') === 'Half target|Double target', 'What if? shows the lever chips');
  const nWhat = Events.log.length, vialGen = Freezer.list('e4fix').slice(-1)[0].gen, seed0 = App.seed;
  chips[1].click(); G.advance(50);
  ok(!cardOpen(G) && App.ch === ch && ch.sim.s.lever === 'double' && ch.level === 0, 'a lever chip thaws the vial with that lever');
  eq(App.seed, seed0, 'a thaw keeps the run seed');
  ok(Events.log.slice(nWhat).some(e => e.type === 'whatif' && e.gen === vialGen && e.lever === 'double'), 'whatif event');
  ok(Freezer.list('e4fix').length >= 1, 'a thaw keeps the level vials');
  untilCard(G, TB);
  c = cardOpen(G);
  ok(c.classList.contains('lvl') && c.dataset.replay == null, 'a thawed run has no replay code (it is not (seed, level, log))');
  arm(G);
  // Replay level and Freezer clearing
  btns(c)[2].click(); G.advance(50);
  ok(App.ch === ch && ch.level === 0 && ch.sim.s.lever === null, 'Replay level restarts the level fresh');
  eq(Freezer.list('e4fix').length, 0, 'a fresh start empties that level’s vials');
  // the Freezer limit and levels
  for (let g = 1; g <= 11; g++) Freezer.put('e4fix', g, 's' + g);
  eq(Freezer.list('e4fix').length, 8, 'at most 8 vials per unit');
  eq(Freezer.list('e4fix')[0].gen, 4, 'the oldest vials go first');
  Freezer.put('e4fix', 11, 'again'); eq(Freezer.list('e4fix').slice(-1)[0].snap, 'again', 'a vial for the same generation is replaced');
  eq(Freezer.list('e4fix', 1).length, 0, 'list(id, level) filters by level');
  ok(Freezer.thaw('e4fix', 99, 'half') === false, 'thaw of a missing vial is refused');
  // finish levels 1 and 2: Next level, then the end card
  untilCard(G, TB);
  arm(G); btns(cardOpen(G))[3].click(); G.advance(50);
  eq(ch.level, 1, 'Next level plays level 2');
  untilCard(G, TB);
  arm(G); btns(cardOpen(G)).slice(-1)[0].click(); G.advance(1200);
  eq(ch.level, 2, 'then the boss');
  untilCard(G, TB);
  c = cardOpen(G);
  ok(c.classList.contains('end') && c.classList.contains('v2') && !c.classList.contains('lvl'), 'final card: class end v2');
  eq(c.dataset.stars, '2', 'final card: data-stars counts Discover and Transfer');
  eq(c.querySelector('.ef-stars').getAttribute('aria-label'), '2 of 3 stars: Discover, Transfer', 'final card aria-label');
  eq(Save.d.done.e4fix, 1, 'the final card sets Save.d.done');
  eq(c.querySelector('h3').textContent, 'Unit complete', 'final card title');
  ok(c.querySelector('.take').textContent === ch.content.take && c.querySelector('.body').textContent === ch.content.body, 'final card: TAKE and body from content');
  eq(btns(c).map(b => b.textContent).join('|'), 'Why?|What if?|Notebook', 'final card with no next unit: Notebook is primary');
  arm(G); btns(c)[0].click();
  const wp2 = c.querySelector('.why'); let contested = false;
  for (let k = 0; k < 20; k++) { if (/Contested/.test(wp2.querySelector('h4').textContent)) contested = true; const nx = wp2.querySelectorAll('[data-go]').find(b => b.dataset.go === '1'); if (!nx || nx.disabled) break; nx.click(); }
  ok(contested, 'the boss MODEL card shows the Contested pill');
  btns(c).slice(-1)[0].click(); G.advance(50);
  eq(App.scr, 'menu', 'Notebook returns to the menu');
  // the royal stand-in has a next registered unit (soot), so its final card offers Next unit
  const roy = TB.REG.royal;
  App.playLevel(roy, 2); G.advance(100); if (TB.Intro.box()) TB.Intro.go(); G.advance(1200);   // the description card first (D6 decision 8)
  untilCard(G, TB);
  c = cardOpen(G);
  eq(btns(c).map(b => b.textContent).join('|'), 'Notebook|Why?|What if?|Next unit', 'final card buttons with a next unit');
  eq(btns(c)[3].getAttribute('aria-label'), 'Next unit: The Black Country', 'Next unit names the next registered unit in act order');
  arm(G); btns(c)[3].click(); G.advance(50);
  c = cardOpen(G);
  ok(!!c && c.classList.contains('intro') && /The Black Country/.test(c.textContent), 'Next unit opens a legacy unit through its intro card');
  ok(G.errors.length === 0 && !G.errorBox(), 'no errors in the card flow (' + G.errors.join('; ') + ')');
  ok(Save.size() <= 3500, 'save stays ≤ 3,500 characters (' + Save.size() + ')');
}

/* ---------- 5b. the result code on an assignment link (?unit=&seed=; B0-simple) ---------- */
{
  const G = load(out, { search: '?unit=e4fix&seed=77' }), TB = G.TB, ch = TB.REG.e4fix;
  ch.resultBits = (s, n) => s.taps * 1000 + n * 7 + 3;
  G.advance(100); if (TB.Intro.box()) TB.Intro.go(); G.advance(1500);
  ok(TB.App.scr === 'play' && TB.App.ch === ch && TB.App.seed === 77, 'the deep link plays the unit with its seed');
  untilCard(G, TB);
  const c = cardOpen(G), code = c.querySelector('.code');
  ok(!!code && TB.ResultCode.read(code.textContent) === 5003, 'the card shows the result code of resultBits (' + (code && code.textContent) + ')');
  arm(G); const cpb = c.querySelector('.coderow').querySelector('button'); cpb.click();
  eq(cpb.textContent, 'Copied', 'Copy confirms on the button');
  TB.Cards.close(); delete ch.resultBits;
  TB.App.playLevel(ch, 0); G.advance(100); if (TB.Intro.box()) TB.Intro.go(); G.advance(1200);
  untilCard(G, TB);
  ok(!cardOpen(G).querySelector('.coderow'), 'no result code without resultBits');
}

/* ---------- 6. legacy pass-through ---------- */
{
  const G = load(out), TB = G.TB, { App, End, Save } = TB; G.advance(200);
  App.open(TB.REG.mendel); G.advance(50);
  let c = cardOpen(G);
  ok(!!c && c.classList.contains('intro') && !c.classList.contains('v2') && Save.d.v1stars.mendel == null, 'a legacy unit keeps its intro card and is not migrated');
  TB.Cards.close();
  End.show(TB.REG.mendel, { stars: 2, insight: 'Legacy insight.' }); G.advance(50);
  c = cardOpen(G);
  ok(c.classList.contains('end') && !c.classList.contains('v2') && c.dataset.stars == null, 'a legacy end card is untouched');
  ok(/Recessive alleles can hide/.test(c.textContent) && /Legacy insight\./.test(c.textContent), 'ch99 still prepends the legacy TAKE');
  ok(Save.d.stars.mendel === 2 && Save.d.done.mendel === 1, 'legacy stars and done are recorded as before');
  ok(/★★/.test(c.querySelector('.stars').textContent), 'legacy stars stay ★ text');
  eq(btns(c)[2].textContent, 'Next: The Scribe', 'legacy Next follows the act order');
  // The Nest counts visits in this.v2 (0…12); a number is not v2
  const nest = TB.REG.nest; nest.v2 = 12; TB.Cards.close();
  End.show(nest, { stars: 1, insight: 'x' }); c = cardOpen(G);
  ok(c.classList.contains('end') && !c.classList.contains('v2'), 'The Nest (v2 = 12) keeps the legacy end card');
  TB.Cards.close(); App.open(nest); G.advance(50); c = cardOpen(G);
  ok(!!c && c.classList.contains('intro'), 'The Nest (v2 = 12) keeps its intro card');
  nest.v2 = 0;
}

/* ---------- 7. Begin into the Wood ---------- */
{
  // vmgame matches '#sh-tabs button' on its last part, so boot.js hands every button a Notes-tab onclick in the stub DOM;
  // put back boot.js's own Begin handler (App.go('menu')) and click, so 00_entry.js's capture listener does the work
  const begin = (G) => { const b = G.document.getElementById('btn-begin'); b.onclick = () => G.TB.App.go('menu'); b.click(); G.advance(50); return G.TB.App; };
  let G = load(out);
  eq(begin(G).scr, 'menu', 'Begin goes to the menu while the Wood is the legacy chapter');
  G = load(out); const TB = G.TB, fake = TB.REG.e4fix, legacy = TB.REG.lichen;
  TB.REG.lichen = fake;   // stand in for v2/lichen.js
  let A = begin(G);
  ok(A.scr === 'play' && A.ch === fake && fake.level === 0 && cardOpen(G) && card(G).classList.contains('ef-intro'), 'Begin goes straight into the live Wood, behind its description card (D6 decision 8)');
  TB.Intro.go(); ok(!cardOpen(G), 'Play starts the Wood');
  ok(TB.Save.d.v1stars.e4fix != null, 'Begin migrates the Wood stars');
  A.exit(); eq(A.scr, 'menu', 'exiting the Wood reaches the menu');
  TB.App.go('title'); A = begin(G); eq(A.scr, 'play', 'Begin again, Wood unfinished: the Wood');
  A.exit(); TB.Save.d.done.lichen = 1; TB.App.go('title'); A = begin(G);
  eq(A.scr, 'menu', 'Begin after the Wood is done: the menu');
  TB.App.go('title'); delete TB.Save.d.done.lichen; TB.App.go('menu'); eq(TB.App.scr, 'menu', 'a plain App.go(menu) never diverts');
  TB.REG.lichen = legacy;
}

/* ---------- 8. ?v1=1 is the legacy game ---------- */
{
  const G = load(out, { search: '?v1=1' }), TB = G.TB; G.advance(200);
  eq(TB.ORDER.join(), LEGACY.join(), 'v1: the legacy order and sections');
  ok(!TB.REG.e4fix && TB.REG.royal == null, 'v1: no v2 chapters registered');
  ok(Object.values(TB.REG).every(ch => !TB.isV2(ch)), 'v1: every registered chapter is legacy');
  eq(TB.REG.census.title, 'The Census', 'v1: legacy titles');
  ok(!G.document.getElementById('ef-entry'), 'v1: no injected card style');
  eq(TB.Save.k, 'endlessforms_v1', 'v1: the legacy save key');
  TB.App.open(TB.REG.lichen); G.advance(50);
  ok(cardOpen(G) && card(G).classList.contains('intro'), 'v1: App.open shows the intro card');
  TB.Cards.close(); { const b = G.document.getElementById('btn-begin'); b.onclick = () => TB.App.go('menu'); b.click(); } G.advance(50);
  eq(TB.App.scr, 'menu', 'v1: Begin goes to the menu');
  TB.End.show(TB.REG.mendel, { stars: 1, insight: 'v1' }); G.advance(50);
  ok(card(G).classList.contains('end') && !card(G).classList.contains('v2'), 'v1: the legacy end card');
  ok(G.errors.length === 0 && !G.errorBox(), 'v1: no errors');
}

/* ---------- 9. a real contract unit: the architect's skeleton, played, frozen, thawed and replayed exactly ----------
   docs/design/v2_chapter_skeleton.js needs E5's Predict and LiveGraph; a three-line stub stands in until they land. */
const SKEL = path.join(SRC, '..', '..', '..', 'docs', 'design', 'v2_chapter_skeleton.js');
if (fs.existsSync(SKEL)) {
  fs.writeFileSync(path.join(tmp, 'v2', 'skeleton.js'), fs.readFileSync(SKEL, 'utf8'));
  if (!fs.existsSync(path.join(SRC, 'v2', '01_widgets.js'))) fs.writeFileSync(path.join(tmp, 'v2', '01_stub.js'),
    "const Predict = { ask() { return { cancel() { }, active: false }; }, overlay() { return null; } };\nconst LiveGraph = { draw() { }, sig: s => String(JSON.stringify(s).length), table: () => '' };\nHooks.chart = LiveGraph.draw;\n");
  const out2 = path.join(tmp, 'e4_skeleton.html');
  cp.execFileSync('python3', ['build.py', out2], { cwd: tmp, env: Object.assign({}, process.env, { V2_ONLY: '' }), stdio: 'pipe' });
  const G = load(out2), TB = G.TB, ch = TB.REG.skeleton; G.advance(1000);
  const play = () => { let f = 0; while (!cardOpen(G) && f++ < 20000) { const s = ch.sim.s; if (s.phase === 'hunt' && f % 7 === 0) { const i = s.pop.findIndex(b => b.alive && ch.sim.visible(b)); if (i >= 0) TB.Sim.act(ch, { k: 'tap', i }); } G.advance(40); } return cardOpen(G); };
  TB.App.playLevel(ch, 1, { seed: 12345 }); G.advance(100); ok(!!TB.Intro.box(), 'skeleton: entering the unit shows its description card'); TB.Intro.go(); G.advance(400);
  let c = play(); const live = TB.Snap.enc(ch.sim.s), code = c && c.dataset.replay;
  ok(!!c && c.classList.contains('lvl') && !!code, 'skeleton: level 2 ends on a level card with a replay code');
  ok(TB.Freezer.list('skeleton').length >= 4, 'skeleton: a vial per generation');
  TB.Cards.close(); TB.Replay.play(ch, code); G.advance(100);
  c = play();
  eq(TB.Snap.enc(ch.sim.s), live, 'skeleton: Replay.play reproduces the whole run through the frame loop');
  arm(G); btns(c).find(b => b.textContent === 'What if?').click();
  const vials = TB.Freezer.list('skeleton'), first = vials[0].gen, lastGen = vials[vials.length - 1].gen, nW = TB.Events.log.length;
  ok(lastGen < ch.sim.s.gen, 'skeleton: the finished state is not frozen (last vial ' + lastGen + ', final generation ' + ch.sim.s.gen + ')');
  c.querySelectorAll('.chip')[0].click(); G.advance(100);
  ok(!cardOpen(G) && ch.level === 1 && TB.Sim.thawed(ch) && ch.sim.s.gen === lastGen && TB.Events.log.slice(nW).some(e => e.type === 'whatif' && e.lever === 'novar'), 'skeleton: a What if? chip thaws the last vial with its lever and plays on');
  c = play(); ok(!!c && c.dataset.replay == null, 'skeleton: the What if? run reaches its card, with no replay code');
  TB.Cards.close(); ok(TB.Freezer.thaw('skeleton', first, 'noinherit'), 'skeleton: an earlier vial thaws too');
  G.advance(100); ok(!cardOpen(G) && ch.sim.s.noinherit === true, 'skeleton: that run plays on with its lever');
  c = play();
  ok(!!c && c.dataset.replay == null, 'skeleton: the thawed run reaches its card');
  ok(G.errors.length === 0 && !G.errorBox(), 'skeleton: no errors (' + G.errors.join('; ') + ')');
}

if (!process.argv.includes('--keep')) fs.rmSync(tmp, { recursive: true, force: true }); else console.log('build kept at', out);
console.log((fails ? 'FAIL' : 'PASS') + ': ' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
