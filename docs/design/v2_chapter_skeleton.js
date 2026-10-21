/* v2 chapter skeleton: the smallest complete Wave 2 unit, written against docs/design/API_v2.md.
   NOT built: it lives in docs/design/. To try it, copy to source/v2/skeleton.js and build with
     V2_ONLY='0*,zz_*,skeleton.js' python3 build.py $OUT
   To start a real unit: copy to v2/<name>.js, rename CH_SKELETON_V2 and the id, delete the PLAN_ADD
   line if the id is already in ACT_PLAN (API_v2 §10), and replace the model, words and view.

   The toy: beetles on sand carry one colour locus (A dark, dominant; a pale). You are the gull (role:
   environment). You eat the beetles you can see; the survivors breed at dusk; you predict tomorrow's
   share of a copies on the gene-pool bar. L1 pale sand; L2 adds dark migrants; boss: the sand darkens. */

const SKEL = {
  // ---- all words (API_v2 §9.2); lint_text.js checks every budget ----
  content: {
    firstWords: 'You are a gull. Tap a beetle you can see.',
    intro: {   // the opening description card (D6 decision 8, API_v2 §15): 1–2 sentences, ≤ 35 words each
      game: 'You are a gull on a beach, feeding chicks on beetles. The beetles you miss breed at dusk.',
      biology: 'Natural selection: you eat the beetles you can see. The hidden colour leaves more young, so its copies spread.',
      how: 'Tap a beetle you can see to eat it. At dusk, drag the diamond to predict tomorrow’s share, then lock it in.'
    },
    hud: { eat: 'Eat {n} of {m} beetles before the tide turns.', dusk: 'Dusk. Drag the marker: where will the a share be tomorrow?', wait: 'The survivors breed.' },
    whispers: { miss: 'Only sand there.', fed: 'The chicks are fed.', drag: 'Drag the diamond first.' },
    labels: { you: 'you', dark: 'dark', pale: 'pale' },
    panels: [{ id: 'hidden', text: 'Dark beetles carry at least one A copy. Pale beetles carry two a copies. Each time you eat the dark ones, the survivors hold a larger share of a copies. Tomorrow’s beetles are drawn from those survivors. Nobody chooses to be pale. The ones you could not see simply left more young.' }],
    interesting: { flat: 'The a share barely moved. Did you eat the beetles you could see, or at random?', swamp: 'Migrants keep bringing A copies back. Selection and migration pull in opposite directions.' },
    levers: { novar: 'No variation', noinherit: 'No inheritance' },
    take: 'Predators that eat what they see make the hidden form common.',
    body: 'Your meals were the selection. The survivors’ copies became the next gene pool. So the a share climbed on pale sand and fell on dark sand.',
    law: { title: 'Seen means eaten' },
    boss: { inverts: 'On dark sand the pale beetles stand out, so the a share falls.' },
    stars: { discover: 'Feed the chicks and watch the a share climb.', predict: 'Your first two predictions inside the band.', transfer: 'On dark sand, predict the fall inside the band.' },
    model: [
      { level: 0, simulated: 'One colour gene, two copies per beetle, random mating among survivors.', simplification: 'Visibility depends only on colour.', params: [{ name: 'beetles', value: 40, tag: 'designed' }, { name: 'generations', value: 5, tag: 'xN', real: 'decades' }], cannot: 'Learning by the gull, or other predators.', nature: 'Sand-coloured beetles and mice on pale dunes show the same pattern.', contested: false, refs: ['skel-1'] }
    ],
    why: { real: ['Pale beach mice on Florida dunes and dark mice on inland soils match their ground. Birds of prey take the mismatched ones.'], maths: ['Say the survivors carry a share q of a copies. If they mate at random, the expected a share among their young is also q.'] }
  }
};

const CH_SKELETON_V2 = {
  id: 'skeleton', v2: true, role: 'environment', place: 'beetle', accent: '#7A6A52',   // the chapter's chrome tint (D6 decision 7, API_v2 §15); ≥ ΔE 8 from every data ink
  intro: { goal: 'Feed your chicks; watch the hidden colour spread.' },
  content: SKEL.content,
  P: {
    N: { v: 40, tag: 'designed', min: 20, max: 80, label: 'beetles' },
    gens: { v: 5, tag: 'xN', min: 3, max: 8, real: 'about 20', label: 'generations' },
    quota: { v: 12, tag: 'designed', min: 6, max: 20, label: 'meals a day' },
    time: { v: 15, tag: 'designed', min: 8, max: 30, label: 'seconds a day' },
    m: { v: 0.15, tag: 'xN', min: 0, max: 0.4, real: 'below 0.05', label: 'migrants' }
  },
  levels: [
    { name: 'Pale sand', adds: 'colour selection', codes: ['B1'], minutes: 3 },
    { name: 'Migrants', adds: 'migration', codes: ['B4'], minutes: 3 },
    { name: 'Dark sand', adds: 'reversed ground', codes: ['B1'], minutes: 3 }
  ],
  keys: { ArrowLeft: 'previous beetle', ArrowRight: 'next beetle', Space: 'eat beetle', P: 'predict' },
  untimed: true,
  teacher: { prompts: ['What share of a copies do you expect after one day?', 'Why does the a share rise faster when pale is rare?', 'What does this model leave out about real gulls?'], pool: 'trace' },
  encodings: [{ k: 'A', rgb: [47, 95, 208], channels: ['colour', 'letter'] }, { k: 'a', rgb: [232, 180, 22], channels: ['colour', 'letter'] },
              { k: 'dark', rgb: [74, 66, 60], channels: ['luminance'] }],   // the scored trait is carried by luminance, never hue alone
  starTraits: ['dark'],

  // ---- headless simulation (API_v2 §9.3): R(), Det, Gen, WF only; no DOM ----
  sim: {
    dt: 1 / 30, s: null,
    lay() { return Gen.layout([{ k: 'col', kind: 'dom', n: 1, p0: 0.5, mu: 0, det: true }]); },
    reset(level, o) {
      const P = CH_SKELETON_V2.P, lay = this.lay();
      this.s = { level, gen: 1, gens: P.gens.v, quota: P.quota.v, time: P.time.v, eaten: 0, fedDays: 0, phase: 'hunt', duskT: 0,
                 darkSand: level === 2, m: level >= 1 ? P.m.v : 0, pop: [], pred: {}, asks: [], ask: null,
                 hist: [], noinherit: false, log: [] };
      if (o && o.thaw) { this.restore(o.thaw.snap); this.s.log = []; this.lever(o.thaw.lever); return; }   // What if?: frozen generation, one lever changed
      for (let i = 0; i < P.N.v; i++) this.s.pop.push(this.born(Gen.genome(lay, { col: { p: 0.5 } })));
      this.s.hist.push(this.q());
    },
    born(g) { return { g, x: 0.06 + 0.88 * R(), y: 0.12 + 0.8 * R(), alive: true }; },
    dark(b) { return Gen.dom(this.lay(), b.g, 'col'); },
    q(list) { const pop = (list || this.s.pop); let a = 0; for (const b of pop) a += (b.g[0] < 0.5 ? 1 : 0) + (b.g[1] < 0.5 ? 1 : 0); return pop.length ? a / (2 * pop.length) : 0; },
    visible(b) { return this.dark(b) !== this.s.darkSand; },
    lever(k) {
      const s = this.s;
      if (k === 'novar') { const g = s.pop[0].g; for (const b of s.pop) b.g = g.slice(); }
      if (k === 'noinherit') s.noinherit = true;
    },
    step(dt) {
      const s = this.s, ev = [];
      if (s.phase === 'hunt') {
        if (!(Save.d.ui && Save.d.ui.unt)) s.time -= dt;
        if (s.time <= 0 || s.eaten >= s.quota) { s.phase = 'dusk'; s.duskT = 0; s.ask = { id: 'g' + s.gen, kind: 'pq', lo: 0, hi: 1, tol: 0.08 }; s.asks.push(s.ask.id); ev.push({ k: 'dusk' }); }
      } else if (s.phase === 'dusk') {
        s.duskT += dt;
        const answered = !s.ask || s.pred[s.ask.id] != null;
        if (answered || ((!(Save.d.ui && Save.d.ui.unt)) && s.duskT > 8)) { s.ask = null; this.breed(); ev.push({ k: 'bred', gen: s.gen }); }
      }
      return ev;
    },
    breed() {
      const s = this.s, P = CH_SKELETON_V2.P, lay = this.lay();
      const surv = s.pop.filter(b => b.alive), par = surv.length >= 2 ? surv : s.pop;
      s.expect = s.expect || {}; s.expect['g' + s.gen] = (1 - s.m) * this.q(par) + s.m * 0.1;   // migrants carry a at 0.1
      const kids = [];
      for (let i = 0; i < P.N.v; i++) {
        let g;
        if (i < Math.round(s.m * P.N.v)) g = Gen.genome(lay, { col: { p: 0.9 } });          // dark migrants (p = share of A)
        else if (s.noinherit) g = Gen.genome(lay, { col: { p: 0.5 } });
        else { const a = par[(R() * par.length) | 0], b = par[(R() * par.length) | 0]; g = Gen.mate(lay, a.g, b.g); }
        kids.push(this.born(g));
      }
      s.pop = kids; s.gen++; s.eaten = 0; s.time = P.time.v; s.phase = s.gen > s.gens ? 'over' : 'hunt';
      s.hist.push(this.q());
    },
    act(a) {
      const s = this.s, ev = [];
      if (a.k === 'tap' && s.phase === 'hunt') {
        const b = s.pop[a.i];
        if (b && b.alive) { b.alive = false; s.eaten++; ev.push({ k: 'eaten', i: a.i }); if (s.eaten === s.quota) { s.fedDays++; ev.push({ k: 'fed' }); } }
        else { s.time -= 0.5; ev.push({ k: 'miss' }); }
      }
      if (a.k === 'predict' && s.ask && a.id === s.ask.id) s.pred[a.id] = Math.min(1, Math.max(0, +a.v));
      return ev;
    },
    result() {
      const s = this.s; if (s.phase !== 'over') return null;
      const st = CH_SKELETON_V2.stars, n = s.level;
      const mask = (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      const moved = Math.abs(s.hist[s.hist.length - 1] - s.hist[0]);
      return { mask, outcome: { q0: s.hist[0], q1: s.hist[s.hist.length - 1] }, interesting: moved < 0.05 ? 'flat' : (n === 1 && moved < 0.15 ? 'swamp' : null) };
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = [];
      if (s.phase === 'hunt') s.pop.forEach((b, i) => { if (b.alive) out.push({ k: 'tap', i }); });
      if (s.ask) for (let v = 0; v <= 10; v++) out.push({ k: 'predict', id: s.ask.id, v: v / 10 });
      return out;
    },
    bots: {   // (s, acts, rnd) → action | null; 'random' is generic
      alwaysA(s, acts) { return acts.find(a => a.k === 'predict' && a.v === 0) || acts.find(a => a.k === 'tap') || null; },
      alwaysB(s, acts) { return acts.find(a => a.k === 'predict' && a.v === 1) || null; },
      greedy(s, acts) { const sim = CH_SKELETON_V2.sim, q = sim.q(); return acts.find(a => a.k === 'predict' && Math.abs(a.v - Math.round(q * 10) / 10) < 1e-9) || acts.find(a => a.k === 'tap' && sim.visible(s.pop[a.i])) || null; },
      threshold(s, acts) { const sim = CH_SKELETON_V2.sim; return acts.find(a => a.k === 'predict' && a.v === 0.5) || acts.find(a => a.k === 'tap' && sim.dark(s.pop[a.i]) === (sim.q() > 0.5)) || null; }
    }
  },

  // ---- stars against the expectation, never the realised run (API_v2 §9.1) ----
  stars: {   // pure functions of the final sim state; the sim never imports view widgets
    discover: (s, n) => s.fedDays >= s.gens - 1 && (n === 2 ? s.hist[0] - s.hist[s.hist.length - 1] : s.hist[s.hist.length - 1] - s.hist[0]) >= 0.15,
    predict: (s) => s.asks.length >= 2 && s.asks.slice(0, 2).every(id => s.pred[id] != null && Math.abs(s.pred[id] - (s.expect || {})[id]) <= 0.08),   // the boss ask counts for transfer, not twice
    transfer: (s, n) => { const id = s.asks[2], e = (s.expect || {})[id]; return n === 2 && id != null && s.pred[id] != null && e != null && e < s.hist[0] && Math.abs(s.pred[id] - e) <= 0.08; }   // boss: predicted the fall, against the expectation
  },

  // ---- view: lifecycle, input, juice, words ----
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    this.level = n; this._ended = false; this._asking = null; this.cursor = 0;
    Sim.start(this, n, o);
    if (typeof Dock !== 'undefined') Dock.set([{ id: 'lens', label: 'Gene pool', key: 'L', fn: () => { this.showGenes = !this.showGenes; } }]);
    this.hud();
    if (n === 0 && typeof Ghost !== 'undefined') this.ghost = Ghost.show({ verb: 'tap', at: () => this.ghostAt(), until: () => this.sim.s.eaten > 0 });
  },
  hud() {
    const s = this.sim.s, C = this.content;
    const text = s.phase === 'hunt' ? (s.gen === 1 && s.eaten === 0 && this.level === 0 ? C.firstWords : Txt.f(C.hud.eat, { n: s.quota - s.eaten, m: s.quota })) : s.phase === 'dusk' ? C.hud.dusk : C.hud.wait;
    HUD.say(text, Math.round(this.sim.q() * 100) + '% a');
  },
  ghostAt() { const s = this.sim.s, i = s.pop.findIndex(b => b.alive && this.sim.visible(b)); return i < 0 ? [Stage.w / 2, Stage.h / 2] : [s.pop[i].x * Stage.w, s.pop[i].y * Stage.h]; },
  update(dt) {
    const ev = Sim.run(this, dt);
    for (const e of ev) this.juice(e);
    const s = this.sim.s;
    if (s.ask && this._asking !== s.ask.id) {
      this._asking = s.ask.id;
      // the ghost starts off every plausible answer (0% a) and needMove stops an untouched ghost scoring (lessons_batch1 §2);
      // the sim's own 8 s dusk timeout then breeds with no prediction
      Predict.ask({ id: s.ask.id, chart: 0, kind: 'pq', axis: { lo: 0, hi: 1, rev: true }, start: 0, needMove: true, tol: s.ask.tol, soft: (Save.d.ui && Save.d.ui.unt) ? null : 6,
        onStill: () => Whisper.say(this.content.whispers.drag, 'drag') });
    }
    if (ev.length) this.hud();
    const r = this.sim.result();
    if (r && !this._ended) {
      this._ended = true;
      const final = this.level === this.levels.length - 1, last = Freezer.list(this.id).slice(-1)[0];
      End.show(this, { level: this.level, mask: r.mask, final, interesting: r.interesting,
        whatIf: last ? { gen: last.gen, levers: ['novar', 'noinherit'] } : null,
        chart: cv => LiveGraph.draw(cv, this.notes().charts[1], 'paper') });
    }
  },
  juice(e) {
    const s = this.sim.s;
    if (e.k === 'eaten') { const b = s.pop[e.i]; Fx.burst('dust', b.x * Stage.w, b.y * Stage.h, 6); Snd.peck(); Fx.pop('+1', b.x * Stage.w, b.y * Stage.h - 20, 1); }
    if (e.k === 'miss') { Whisper.say(this.content.whispers.miss, 'miss'); Snd.miss(); }
    if (e.k === 'fed') Whisper.say(this.content.whispers.fed, 'fed');
    if (e.k === 'dusk') Fx.tier(2, ms => Snd2.play('dusk'));
    if (e.k === 'bred') { Freezer.put(this.id, e.gen, this.sim.snapshot()); Live.say(Txt.f('Generation {g}. a share {q}%.', { g: e.gen, q: Math.round(this.sim.q() * 100) })); }
  },
  tap(x, y) {
    const s = this.sim.s, r = this.size() / 2, pts = s.pop.map(b => b.alive ? { x: b.x * Stage.w, y: b.y * Stage.h, r } : { x: -1e4, y: -1e4 });
    Sim.act(this, { k: 'tap', i: Stage.hit(x, y, pts) });
  },
  onKey(k) {
    const s = this.sim.s, alive = s.pop.map((b, i) => b.alive ? i : -1).filter(i => i >= 0); if (!alive.length) return;
    if (k === 'ArrowRight' || k === 'ArrowLeft') this.cursor = (this.cursor + (k === 'ArrowRight' ? 1 : alive.length - 1)) % alive.length;
    if (k === ' ' || k === 'Enter') Sim.act(this, { k: 'tap', i: alive[this.cursor % alive.length] });
  },
  draw(c, w, h) {
    const s = this.sim.s, sand = s.darkSand ? '#4A423C' : Pal.place('beetle').ground;
    c.fillStyle = sand; c.fillRect(0, 0, w, h);
    const size = this.size();
    s.pop.forEach((b, i) => {
      if (!b.alive) return;
      const ph = { dark: this.sim.dark(b) ? 1 : 0, a: [b.g[0] > 0.5 ? 0 : 1, b.g[1] > 0.5 ? 0 : 1] };   // a: 0 = A, 1 = a
      if (typeof Rig !== 'undefined') Rig.draw(c, 'beetle', ph, b.x * w, b.y * h, { size, id: i, genes: !!this.showGenes });
      else Pal.genotype(c, b.x * w, b.y * h, size / 2, ph.a[0], ph.a[1]);
    });
    Lbl.put('you', this.content.labels.you, w - 40, 24, { size: 14 });
  },
  size() { return typeof Rig !== 'undefined' ? Rig.size('actor') : Math.max(27, 0.07 * Stage.u); },
  notes() {
    const s = this.sim.s, q = this.sim.q();
    return {
      stats: [['Generation', s.gen + ' of ' + s.gens, ''], ['a copies', Math.round(q * 100) + '%', 'Share of colour-gene copies that are a.']],
      charts: [
        { type: 'pq', title: 'Gene pool', p: 1 - q, n: 2 * s.pop.length, frame: 'designed' },
        { type: 'trace', title: 'a share', x: { lo: 1, hi: s.gens + 1, label: 'generation' }, y: { lo: 0, hi: 1, label: 'a share' },
          series: [{ d: s.hist, ink: 'a', label: 'a', you: false }], frame: 'designed' }
      ]
    };
  }
};
V2.push(CH_SKELETON_V2);
PLAN_ADD.push({ sec: 'Dev', entry: ['skeleton', 'Skeleton', 'Contract demo'] });
