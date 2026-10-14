/* E7 self-test fixture: a tiny v2 chapter built only on the E2 shell (HUD.say, Dock, the strip, Cards), so the monkey,
   bots, lint and shots harnesses can be tested before 00_entry.js and 01_widgets.js land. NEVER copied into source/v2:
   tests/selftest_e7.js builds it into a private copy of source/ as v2/e7fixture.js.
   It opens contract-shaped cards itself (API_v2 §6.1): '.card.lvl.v2' with Why?, What if?, Replay level, Next level, and
   '.card.end.v2' with data-stars. ?e7warn=1 writes an over-budget HUD line (HUD.warnings); ?e7cheat=1 lets the greedy
   bot earn three stars, so the bot sweep has something to catch. */
const CH_E7FIX_V2 = {
  id: 'e7fix', v2: true, role: 'environment', place: 'wood',
  intro: { goal: 'Tap the pale dots; press the dock button now and then.' },
  content: {
    firstWords: 'Tap a pale dot. Press the dock button now and then.',
    hud: { tap: 'Tap {n} more dots.', done: 'Level done.' },
    whispers: { miss: 'Only bark there.' },
    labels: { you: 'you' },
    panels: [{ id: 'one', text: 'Each dot you tap is removed from the wood. The dots you leave behind are the ones that breed, so the next generation looks more like them. Nobody chooses what survives. The tapper removes what it notices, and the population moves away from whatever is easy to see.' }],
    interesting: { flat: 'The share barely moved. Did you tap at random?' },
    levers: { novar: 'No variation' },
    take: 'What the tapper notices disappears; what it misses becomes common.',
    body: 'Your taps were the selection. The dots you missed bred, so the next wood held more of them.',
    law: { title: 'Seen means eaten' },
    boss: { inverts: 'On dark bark the pale dots stand out instead.' },
    stars: { discover: 'Tap at least half of the dots.', predict: 'Press the button once per level.', transfer: 'Finish the boss level.' },
    model: [{ level: 0, simulated: 'Dots removed by taps.', simplification: 'No genetics at all.', params: [{ name: 'dots', value: 12, tag: 'designed' }], cannot: 'Anything about inheritance.', nature: 'Birds take conspicuous prey.', contested: false, refs: ['e7-1'] }],
    why: { real: ['Birds eat the prey they can see.'], maths: ['Each tap removes one dot.'] }
  },
  P: { N: { v: 12, tag: 'designed', min: 6, max: 30, label: 'dots' } },
  levels: [{ name: 'Pale bark', adds: 'tapping', codes: ['B1'], minutes: 1 }, { name: 'Button', adds: 'the button', codes: ['B1'], minutes: 1 }, { name: 'Boss', adds: 'dark bark', codes: ['B1'], minutes: 1 }],
  keys: { Space: 'tap a dot', P: 'press' },
  untimed: true,
  teacher: { prompts: ['What do you expect to happen?', 'Why does the share move?', 'What does this model leave out?'], pool: 'trace' },
  encodings: [{ k: 'pale', rgb: [230, 220, 190], channels: ['colour', 'shape'] }, { k: 'dark', rgb: [60, 50, 40], channels: ['colour', 'shape'] }],
  starTraits: ['pale'],
  sim: {
    dt: 1 / 30, s: null,
    reset(level) { const N = CH_E7FIX_V2.P.N.v; this.s = { level, need: 6 + 2 * level, taps: 0, presses: 0, t: 0, dots: [], log: [] }; for (let i = 0; i < N; i++) this.s.dots.push({ x: 0.1 + 0.8 * R(), y: 0.2 + 0.7 * R(), alive: true }); },
    step(dt) { this.s.t += dt; return []; },
    act(a) {
      const s = this.s;
      if (a.k === 'tap') { const d = s.dots[a.i]; if (d && d.alive) { d.alive = false; s.taps++; return [{ k: 'eaten', i: a.i }]; } return [{ k: 'miss' }]; }
      if (a.k === 'press') { s.presses++; return [{ k: 'press' }]; }
      return [];
    },
    result() {
      const s = this.s; if (s.taps + s.presses < s.need && s.t < 50) return null;
      const st = CH_E7FIX_V2.stars, n = s.level;
      return { mask: (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0), outcome: {}, interesting: null };
    },
    actions() { const s = this.s, out = [{ k: 'press' }]; s.dots.forEach((d, i) => { if (d.alive) out.push({ k: 'tap', i }); }); return out; },
    bots: {
      alwaysA(s, acts) { return acts.find(a => a.k === 'tap') || null; },
      alwaysB(s, acts) { return acts.find(a => a.k === 'press') || null; },
      greedy(s, acts) { const cheat = typeof Url !== 'undefined' && Url.q.e7cheat; if (cheat && s.presses === 0) return acts.find(a => a.k === 'press'); return acts.find(a => a.k === 'tap') || null; },
      threshold(s, acts) { return s.taps < 2 ? acts.find(a => a.k === 'tap') || null : null; }
    }
  },
  stars: {
    discover: (s) => s.taps >= s.dots.length / 2,
    predict: (s) => s.presses === 1,
    transfer: (s, n) => n === 2 && s.taps + s.presses >= s.need && (typeof Url !== 'undefined' && !!Url.q.e7cheat)
  },
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n) {
    this.level = n; this.ended = false; this.stripHits = this.stripHits || 0; this.cursor = 0;
    this.sim.reset(n, {});
    Dock.set([{ id: 'press', label: 'Press', key: 'P', primary: true, fn: () => this.act({ k: 'press' }) }, { id: 'lens', label: 'Lens', key: 'L', fn: () => { this.lens = !this.lens; } }]);
    Hooks.chartPointer = (i, type) => { if (type === 'down') CH_E7FIX_V2.stripHits++; };
    this.hud();
  },
  act(a) { const ev = this.sim.act(a); this.sim.s.log.push([0, a]); this.hud(); return ev; },
  hud() {
    const s = this.sim.s, left = Math.max(0, s.need - s.taps - s.presses);
    if (Url.q.e7warn) HUD.say('This line is far too long for the HUD because it runs on past the fifteen word budget that D4 sets.', left);
    else HUD.say(Txt0(this.content.hud.tap, { n: left }), left);
  },
  update(dt) {
    this.sim.step(dt);
    const r = this.sim.result();
    if (r && !this.ended) {
      this.ended = true;
      const final = this.level === this.levels.length - 1, ch = this, n = this.level;
      CH_E7FIX_V2.stars2 = (CH_E7FIX_V2.stars2 || 0) | r.mask;
      const pc = m => (m & 1 ? 1 : 0) + (m & 2 ? 1 : 0) + (m & 4 ? 1 : 0);
      const btns = final
        ? [{ t: 'Notebook', fn: () => App.exit() }, { t: 'Why?', fn: () => { ch.why = (ch.why || 0) + 1; } }, { t: 'Next unit', primary: true, fn: () => App.exit() }]
        : [{ t: 'Why?', fn: () => { ch.why = (ch.why || 0) + 1; } },
          { t: 'What if?', fn: () => { const c = document.querySelector('#cards .card'); if (c && !c.querySelector('.chips')) { const d = document.createElement('div'); d.className = 'chips'; const b = document.createElement('button'); b.className = 'chip'; b.textContent = ch.content.levers.novar; b.onclick = () => { ch.whatifs = (ch.whatifs || 0) + 1; App.playLevel(ch, n, { seed: App.seed, lever: 'novar' }); }; d.appendChild(b); c.insertBefore(d, c.querySelector('.card-btns')); } } },
          { t: 'Replay level', fn: () => App.playLevel(ch, n) }, { t: 'Next level', primary: true, fn: () => App.playLevel(ch, n + 1) }];
      const box = Cards.open({ cls: final ? 'end v2' : 'lvl v2', html: '<h3>' + (final ? 'Unit complete' : 'Level ' + (n + 1) + ' done') + '</h3><p class="take">' + this.content.take + '</p>', buttons: btns });
      box.dataset.stars = String(pc(CH_E7FIX_V2.stars2));
    }
  },
  draw(c, w, h) {
    c.fillStyle = this.level === 2 ? '#3d352e' : '#cdd3b4'; c.fillRect(0, 0, w, h);
    for (const d of this.sim.s.dots) if (d.alive) { c.fillStyle = '#e6dcbe'; c.beginPath(); c.arc(d.x * w, d.y * h, 22, 0, TAU); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 1.5; c.stroke(); }
  },
  tap(x, y) {
    const pts = this.sim.s.dots.map(d => d.alive ? { x: d.x * Stage.w, y: d.y * Stage.h, r: 22 } : null);
    const i = Stage.hit(x, y, pts); this.act({ k: 'tap', i });
  },
  onKey(k) { const s = this.sim.s; if (k === ' ') { const i = s.dots.findIndex(d => d.alive); if (i >= 0) this.act({ k: 'tap', i }); } if (k === 'p' || k === 'P') this.act({ k: 'press' }); },
  notes() { const s = this.sim.s; return { stats: [['Taps', s.taps + ' of ' + s.need, '']], charts: [{ title: 'Taps', draw: cv => { const f = fitCanvas(cv); f.c.fillStyle = '#556'; f.c.fillRect(0, 0, f.w * Math.min(1, s.taps / s.need), f.h); } }] }; }
};
function Txt0(str, vars) { return typeof Txt !== 'undefined' && Txt.f ? Txt.f(str, vars) : str.replace(/\{(\w+)\}/g, (m, k) => vars[k]); }
V2.push(CH_E7FIX_V2);
PLAN_ADD.push({ sec: 'Dev', entry: ['e7fix', 'E7 fixture', 'Test harness'] });
