/* Integration fixture (Wave 2 engine integration): a throwaway v2 chapter, NEVER copied into source/v2.
   tests/selftest_integ.py builds it into a private copy of source/ as v2/integtest.js, with every engine file, and proves
   that a v2 chapter registers (V2.push + PLAN_ADD), plays a level through Sim, shows a LiveGraph in the strip, takes a
   Predict gesture, fires Fx juice from Sim.run's events, opens the v2 level and end cards and saves stars via Save.star2.
   Toy: 20 beetles; tap 4 to eat; at dusk predict tomorrow's A share; 2 days per level; 2 levels (so lint_text flags
   "2 levels": it is a fixture, not a unit). */
const CH_INTEGTEST_V2 = {
  id: 'integtest', v2: true, role: 'environment', place: 'beetle',
  intro: { goal: 'Eat beetles, then predict the gene pool.' },
  content: {
    firstWords: 'Tap a beetle to eat it.',
    intro: { game: 'A throwaway test unit: beetles on sand.', biology: 'It tests the engine, not the biology.', how: 'Tap beetles to eat them, then predict at dusk.' },
    hud: { eat: 'Eat {n} more beetles.', dusk: 'Dusk. Mark tomorrow’s A share.', wait: 'The survivors breed.' },
    whispers: { miss: 'Only sand there.' },
    labels: { you: 'you' },
    panels: [],
    interesting: { flat: 'The A share hardly moved.' },
    levers: { novar: 'No variation' },
    take: 'What you eat shapes the next gene pool.',
    body: 'The survivors’ copies became the next gene pool.',
    law: { title: 'Seen means eaten' },
    boss: { inverts: 'The sand darkens.' },
    stars: { discover: 'Eat four beetles each day.', predict: 'Both marks inside the band.', transfer: 'Predict on dark sand.' },
    model: [{ level: 0, simulated: 'One colour gene.', simplification: 'Visibility is colour only.', params: [{ name: 'beetles', value: 20, tag: 'designed' }],
              cannot: 'Learning.', nature: 'Beach mice match their sand.', contested: false, refs: [] }],
    why: { real: ['Pale mice live on pale dunes.'], maths: ['The young inherit the survivors’ share.'] }
  },
  P: { N: { v: 20, tag: 'designed', min: 10, max: 40, label: 'beetles' } },
  levels: [{ name: 'Pale sand', adds: 'selection', codes: ['B1'], minutes: 1 }, { name: 'Dark sand', adds: 'reversed ground', codes: ['B1'], minutes: 1 }],
  keys: { Space: 'eat beetle', P: 'predict' },
  untimed: true,
  encodings: [{ k: 'A', rgb: [47, 95, 208], channels: ['colour', 'letter'] }, { k: 'a', rgb: [232, 180, 22], channels: ['colour', 'letter'] }],
  sim: {
    dt: 1 / 30, s: null,
    lay() { return Gen.layout([{ k: 'col', kind: 'dom', n: 1, p0: 0.5, mu: 0, det: true }]); },
    reset(level, o) {
      const lay = this.lay();
      this.s = { level, gen: 1, gens: 2, quota: 4, eaten: 0, fedDays: 0, phase: 'hunt', duskT: 0, dark: level === 1, pop: [], pred: {}, asks: [], ask: null, expect: {}, hist: [], log: [] };
      if (o && o.thaw) { this.restore(o.thaw.snap); this.s.log = []; return; }
      for (let i = 0; i < 20; i++) this.s.pop.push(this.born(Gen.genome(lay, { col: { p: 0.5 } })));
      this.s.hist.push(this.p());
    },
    born(g) { return { g, x: 0.1 + 0.8 * R(), y: 0.25 + 0.55 * R(), alive: true }; },
    p(list) { const pop = list || this.s.pop; let A = 0; for (const b of pop) A += (b.g[0] > 0.5 ? 1 : 0) + (b.g[1] > 0.5 ? 1 : 0); return pop.length ? A / (2 * pop.length) : 0; },
    step(dt) {
      const s = this.s, ev = [];
      if (s.phase === 'hunt' && s.eaten >= s.quota) { s.phase = 'dusk'; s.duskT = 0; s.ask = { id: 'L' + s.level + 'g' + s.gen, kind: 'pq', tol: 0.1 }; s.asks.push(s.ask.id); ev.push({ k: 'dusk' }); }
      else if (s.phase === 'dusk') { s.duskT += dt; if (s.pred[s.ask.id] != null) { s.ask = null; this.breed(); ev.push({ k: 'bred', gen: s.gen }); } }
      return ev;
    },
    breed() {
      const s = this.s, lay = this.lay(), par = s.pop.filter(b => b.alive);
      s.expect['L' + s.level + 'g' + s.gen] = this.p(par);
      const kids = [];
      for (let i = 0; i < 20; i++) { const a = par[(R() * par.length) | 0], b = par[(R() * par.length) | 0]; kids.push(this.born(Gen.mate(lay, a.g, b.g))); }
      s.pop = kids; s.gen++; s.eaten = 0; s.fedDays++; s.phase = s.gen > s.gens ? 'over' : 'hunt'; s.hist.push(this.p());
    },
    act(a) {
      const s = this.s, ev = [];
      if (a.k === 'tap' && s.phase === 'hunt') { const b = s.pop[a.i]; if (b && b.alive) { b.alive = false; s.eaten++; ev.push({ k: 'eaten', i: a.i }); } else ev.push({ k: 'miss' }); }
      if (a.k === 'predict' && s.ask && a.id === s.ask.id) s.pred[a.id] = Math.min(1, Math.max(0, +a.v));
      return ev;
    },
    result() {
      const s = this.s; if (s.phase !== 'over') return null;
      const st = CH_INTEGTEST_V2.stars, n = s.level;
      return { mask: (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0), outcome: {}, interesting: null };
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() { const s = this.s, out = []; if (s.phase === 'hunt') s.pop.forEach((b, i) => { if (b.alive) out.push({ k: 'tap', i }); }); if (s.ask) for (let v = 0; v <= 10; v++) out.push({ k: 'predict', id: s.ask.id, v: v / 10 }); return out; },
    bots: {}
  },
  stars: {
    discover: s => s.fedDays >= s.gens,
    predict: s => s.asks.every(id => s.pred[id] != null && Math.abs(s.pred[id] - s.expect[id]) <= 0.1),
    transfer: (s, n) => n === 1 && s.asks.length >= 2 && s.pred[s.asks[1]] != null
  },
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    this.level = n; this._ended = false; this._asking = null; this.fx = { bursts: 0, pops: 0 };
    Sim.start(this, n, o);
    Dock.set([{ id: 'commit', label: 'Lock in', key: 'Enter', fn: () => Predict.commit() }]);
    this.hud();
  },
  hud() { const s = this.sim.s, C = this.content; HUD.say(s.phase === 'hunt' ? (s.eaten === 0 && s.gen === 1 ? C.firstWords : Txt.f(C.hud.eat, { n: s.quota - s.eaten })) : s.phase === 'dusk' ? C.hud.dusk : C.hud.wait, Math.round(this.sim.p() * 100) + '% A'); },
  update(dt) {
    const ev = Sim.run(this, dt); for (const e of ev) this.juice(e);
    const s = this.sim.s;
    if (s.ask && this._asking !== s.ask.id) { this._asking = s.ask.id; this._expectNow = this.sim.p(s.pop.filter(b => b.alive)); Predict.ask({ id: s.ask.id, chart: 0, kind: 'pq', axis: { lo: 0, hi: 1 }, start: 0.5, tol: s.ask.tol, soft: null, onCommit: r => Predict.reveal(r.id, this._expectNow, s.ask ? s.ask.tol : 0.1) }); }
    if (ev.length) this.hud();
    const r = this.sim.result();
    if (r && !this._ended) {
      this._ended = true; const final = this.level === this.levels.length - 1;
      End.show(this, { level: this.level, mask: r.mask, final, chart: this.notes().charts[1] });
    }
  },
  juice(e) {
    const s = this.sim.s, w = Stage.w, h = Stage.h;
    if (e.k === 'eaten') { const b = s.pop[e.i]; Fx.burst('dust', b.x * w, b.y * h, 6); Fx.pop('+1', b.x * w, b.y * h - 20, 1); Fx.ring(b.x * w, b.y * h, 14, { dashed: true }); this.fx.bursts++; this.fx.pops++; }
    if (e.k === 'miss') Whisper.say(this.content.whispers.miss, 'miss');
    if (e.k === 'bred') Freezer.put(this.id, e.gen, this.sim.snapshot());
  },
  tap(x, y) { const s = this.sim.s, pts = s.pop.map(b => b.alive ? { x: b.x * Stage.w, y: b.y * Stage.h, r: 16 } : { x: -1e4, y: -1e4 }); Sim.act(this, { k: 'tap', i: Stage.hit(x, y, pts) }); },
  onKey(k) { const s = this.sim.s; if (k === ' ') { const i = s.pop.findIndex(b => b.alive); if (i >= 0) Sim.act(this, { k: 'tap', i }); } },
  draw(c, w, h) {
    const s = this.sim.s; c.fillStyle = s.dark ? '#4A423C' : Pal.place('beetle').ground; c.fillRect(0, 0, w, h);
    s.pop.forEach((b, i) => { if (!b.alive) return; const a = [b.g[0] > 0.5 ? 0 : 1, b.g[1] > 0.5 ? 0 : 1]; Rig.draw(c, 'beetle', { a, dark: a[0] === 1 && a[1] === 1 ? 0 : 1 }, b.x * w, b.y * h, { size: 32, id: i }); });
    Lbl.put('you', this.content.labels.you, w - 40, 76, { size: 14 });
  },
  notes() {
    const s = this.sim.s, p = this.sim.p();
    return { stats: [['Day', s.gen + ' of ' + s.gens, ''], ['A copies', Math.round(p * 100) + '%', '']],
      charts: [{ type: 'pq', title: 'Gene pool', p, n: 2 * s.pop.length, frame: 'designed' },
               { type: 'trace', title: 'A share', x: { lo: 1, hi: s.gens + 1, label: 'day' }, y: { lo: 0, hi: 1, label: 'A share' }, series: [{ d: s.hist.slice(), ink: 'A', label: 'A' }], frame: 'designed' }] };
  }
};
V2.push(CH_INTEGTEST_V2);
PLAN_ADD.push({ sec: 'Dev', entry: ['integtest', 'Integration test', 'Engine fixture'] });
