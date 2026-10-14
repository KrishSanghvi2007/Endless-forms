/* ================= v2/02_hunt_ext.js: Hunt extensions (D1 §2.2; D5 decision 22, §2 "Hunt extensions"; API_v2 §8.1) =================
   Work package E6. Hunt is WRAPPED here, never forked: start, mk, morning, tap, update, endRound, interlude, nextGen,
   finish, draw, panel, updPanel, notes and ensureBg each pass straight to the legacy function unless the chapter has
   v2 === true (isV2, because legacy CH_NEST uses this.v2 as a counter). The wrappers sit outside ch99.js's, so a v2 chapter
   also bypasses ch99's Lichen predict card. down, move, up and onKey are getters that read undefined for a legacy chapter,
   so Stage still calls legacy Hunt.tap on pointerdown exactly as before.
   Under v2: every trait spec gets det: true (Det maths in Gen, same draws); quick is off; _pAsked is set; the dusk card is
   replaced by an in-canvas dusk (eggs and cull, survivors slide into chart 0, a Predict gesture), unless the chapter
   brings ch.dusk(Hn, rec, done); juice follows D4 §5.3 (beak shadow 90 ms, three dust puffs, chick pop 220 ms, eggs on a
   20 ms stagger, cull in six batches); words come from ch.content with short defaults below; the HUD is one HUD.say line.
   Opt-in fields on the chapter: bag, barks, searchImage, trunks, modelCount, toxicity, lens, overproduce, predict, untimed,
   detectRule, migrants, species (API_v2 §8.1 table). A long press on a moth pins it (Pin, 450 ms); arrows and Enter hunt
   from the keyboard and Shift+Enter pins; Save.d.ui.unt swaps the clock for looks; the detection rule is the non-visual path (D2 §13).
   Hunt-mode v2 hooks on the chapter (all optional): startLevel(n, o, Hn) before the population is built (set N, cap,
   roundTime, traits, maxGen per level); founder(Hn, i); mate(Hn, a, b); morph(ph); match(ph, barkIndex) (use HuntX.camo,
   which is Det.exp); expect(Hn, rec); stars {discover, predict, transfer}(Hn, level) or legacy stars(Hn, o); result(Hn, o)
   → End.show fields; interesting(Hn, o); notes(Hn); dock(Hn); hudLine(Hn, text, num); onTaste(Hn, item, bitter); onKey.
   Load rule: top-level code touches only legacy objects (Hunt, Gen, Save, Stage, App, isV2) and lower v2 files; everything
   from 00_* and 01_* is called inside functions behind typeof guards, so a V2_ONLY build without them does not throw. */

const HuntX = {
  WORDS: {   // defaults; a chapter overrides any of these in its content (same groups and keys)
    hud: { hunt: '{n} of {m} eaten.', auto: 'The bird hunts by your rule. {n} of {m} eaten.', ask: 'Predict: drag the ghost on the graph.', dusk: 'Dusk. The ones you missed breed.', eggs: 'Eggs at dusk. Winter keeps only some.', wait: 'Season over.' },
    whispers: { refocus: 'New look: refocus.', streak: 'Same look: quicker.', lens: 'Switch the lens to Look.', looks: 'No looks left.', bitter: 'Bitter! Spat out.', starve: 'A chick went hungry.', pinned: 'Pinned.' },
    labels: { chart: 'This morning', eaten: 'Eaten', spared: 'Spared', young: 'Young', target: 'Bark', trunk: 'Trunk {n}', dot: 'Dot = {n} eggs', auto: 'Bird rule', rule: 'Detect at', commit: 'Lock in', looks: '{n} looks', secs: '{n} s', gen: 'Generation', s: 'Selection S', r: 'Response R', b: 'Fitted b' },
    live: { gen: 'Generation {g}. Morning.', dusk: 'Dusk. {s} survivors breed.', narrate: 'Generation {g}: the bird took {n}.' }
  },
  w(H, group, key, vars) {
    const C = (H && H.ch && H.ch.content) || {}, g = C[group] || {}, s = g[key] != null ? g[key] : (this.WORDS[group] || {})[key];
    return s == null ? '' : typeof Txt !== 'undefined' ? Txt.f(s, vars || {}) : String(s).replace(/\{(\w+)\}/g, (m, k) => vars && vars[k] != null ? vars[k] : m);
  },
  whisper(H, key) { if (H.sync) return; const s = this.w(H, 'whispers', key); if (!s) return; if (typeof Whisper !== 'undefined') Whisper.say(s, 'hunt-' + key); else toast(s); },
  say(H, key, vars) { if (!H.sync && typeof Live !== 'undefined') Live.say(this.w(H, 'live', key, vars)); },
  fx() { return typeof Fx !== 'undefined' ? Fx : null; },
  calm() { return typeof Fx !== 'undefined' && !!Fx.calm; },
  unt() { try { return !!(Save.d && Save.d.ui && Save.d.ui.unt); } catch (e) { return false; } },
  looks(ch) { const u = ch.untimed; return u && typeof u === 'object' && u.looks > 0 ? u.looks | 0 : Math.max(4, Math.round((ch.cap || 10) * 4 / 3)); },
  layout(traits) { return Gen.layout((traits || []).map(s => Object.assign({}, s, { det: true }))); },
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  // camouflage match with Det.exp (the legacy Lichen formula; D5 decision 24): T = {T, H, M}, o = {a, w: [tone, hue, mot]}
  camo(ph, T, o) {
    o = o || {}; const w = o.w || [1, 0.7, 0.35], dt = (ph.tone - T.T) / 0.5, dh = ((ph.hue == null ? T.H : ph.hue) - T.H) / 0.7, dm = ((ph.mot == null ? (T.M || 0) : ph.mot) - (T.M || 0)) / 0.7;
    return Det.exp(-(o.a == null ? 1.2 : o.a) * (w[0] * dt * dt + w[1] * dh * dh + w[2] * dm * dm));
  },
  morph(H, ph) { return typeof H.ch.morph === 'function' ? String(H.ch.morph(ph)) : '*'; },
  counts(H, items, plus) {   // alive focal prey on screen by morph (plus one item that is being eaten now)
    const n = {}; for (const it of items) if ((it.alive || it === plus) && it.kind === 'prey' && !it.sp) { const m = this.morph(H, it.ind.ph); n[m] = (n[m] || 0) + 1; }
    return n;
  },
  sample(n, k) { const a = []; for (let i = 0; i < n; i++) a.push(i); k = Math.min(n, Math.max(0, k | 0)); for (let i = 0; i < k; i++) { const j = i + ((R() * (n - i)) | 0), t = a[i]; a[i] = a[j]; a[j] = t; } return a.slice(0, k); },
  act(H, a) { if (!H.sync && typeof Sim !== 'undefined' && Sim.act) try { Sim.act(H.ch, a); } catch (e) { } },
  spBy(H, key) { const X = H.x; if (!X) return null; for (const S of X.sp) if (S.key === key) return S; return null; },
  clear(H) { for (const k of ['x', 'bag', 'ghostB', 'preds', 'lens']) if (Object.prototype.hasOwnProperty.call(H, k)) delete H[k]; },

  /* ---------- start: the v2 path of Hunt.start (a level of a v2 Hunt chapter) ---------- */
  start(H, ch, o) {
    const n = Math.max(0, o.level | 0); ch.level = n; H.ch = ch;
    const X = H.x = { level: n, o, t: 0, fx: [], preds: [], mornings: [], diet: null, si: null, looks: null, looks0: null, dk: null, brood: null, eggs: null, pend: null,
      press: null, focus: null, auto: false, autoT: 0, ruleV: 0.5, ruleEl: null, glint: null, flinch: 0, veil: 0, chickPop: [], sp: [], jays: null, trunk: null, specimens: {}, starveExtra: 0, barkN: null, barkT: null };
    if (!H.sync && typeof Sim !== 'undefined' && Sim.start) try { Sim.start(ch, n, o); } catch (e) { }
    if (typeof ch.startLevel === 'function') ch.startLevel(n, o, H);
    if (ch.detectRule) X.ruleV = ch.detectRule.v == null ? 0.5 : ch.detectRule.v;
    if (ch.barks) X.barkN = ch.barks.map((b, i) => i && b.mask ? makeNoise(b.mask.seed != null ? b.mask.seed : 7001 + 31 * i) : null);
    H.lay = this.layout(ch.traits);
    H.gen = 1; H.hist = []; H.total = 0; H.bitterTotal = 0; H.quick = false; H._pAsked = true;
    H.fx = []; H.shake = 0; H.tint = 0; H.state = 'idle'; H.items = []; H.lastRec = null;
    H.bag = ch.bag ? { need: ch.bag.need, chicks: ch.bag.chicks, fed: new Array(ch.bag.chicks).fill(0), starved: 0, total: 0 } : null; H.ghostB = null; H.preds = X.preds;
    H.pop = []; for (let i = 0; i < ch.N; i++) H.pop.push(H.mk(typeof ch.founder === 'function' ? ch.founder(H, i) : Gen.genome(H.lay, ch.init)));
    for (const sp of ch.species || []) { const lay = this.layout(sp.traits), S = { key: sp.key, spec: sp, lay, pop: [] }; X.sp.push(S); for (let i = 0; i < sp.N; i++) S.pop.push(this.mkSp(H, S, Gen.genome(lay, sp.init))); }
    H.phase = {}; if (ch.setup) ch.setup(H);
    H.bgKey = ''; H.spriteD = 0;
    this.lensSetup(H); this.dock(H);
    H.panel(); H.morning();
    if (!H.sync && n === 0 && ch.ghost !== false && typeof Ghost !== 'undefined') Ghost.show({ verb: 'tap', at: () => { const it = this.nearest(H, Stage.w / 2, Stage.h * 0.55); return it ? [it.x * Stage.w, it.y * Stage.h] : null; }, until: () => H.total > 0 || H.state === 'dusk' });
  },
  uid: 1,   // individual ids are unique for the session, so a pin kept across levels never lands on a stranger (ids never reach the sim)
  tag(H, ind) { if (H.x) ind.id = this.uid++; return ind; },
  mkSp(H, S, g) { return { g, ph: S.spec.phen(S.lay, g), sv: (R() * 4294967295) >>> 0, eaten: false, id: this.uid++, sp: S.key }; },

  /* ---------- morning ---------- */
  morning(H) {
    const ch = H.ch, X = H.x;
    if (H.gen > 1 && ch.migrants) this.migrate(H);
    H.env = ch.env ? ch.env(H) : {}; H.obj = ch.objective(H);
    let shown = H.pop; X.trunk = null;
    if (ch.trunks) shown = this.resettle(H);
    const nm = typeof ch.modelCount === 'function' ? Math.max(0, ch.modelCount(H) | 0) : (ch.models || 0), spi = [];
    for (const S of X.sp) for (const ind of S.pop) spi.push([S, ind]);
    const pts = this.places(H, shown.length + spi.length + nm), rot = () => typeof ch.rot === 'function' ? ch.rot() : 0; let i = 0;
    H.items = [];
    for (const ind of shown) { H.items.push({ ind, kind: 'prey', x: pts[i].x, y: pts[i].y, rot: rot(), alive: true }); i++; }
    for (const [S, ind] of spi) { H.items.push({ ind, kind: S.spec.toxic ? 'toxic' : 'prey', sp: S.key, x: pts[i].x, y: pts[i].y, rot: rot(), alive: true }); i++; }
    for (let m = 0; m < nm; m++) { H.items.push({ ind: { ph: ch.modelPh(), sv: (R() * 4294967295) >>> 0, id: 'm' + m }, kind: 'model', x: pts[i].x, y: pts[i].y, rot: rot(), alive: true }); i++; }
    shuffle(H.items);
    H.eaten = 0; H.bitter = 0; H.time = ch.roundTime; H.state = 'dawn'; H.st = 0; H.dawnLine = '';
    X.looks = this.unt() ? this.looks(ch) : null; X.looks0 = X.looks;
    X.si = ch.searchImage ? { last: null, run: 0, idle: 0 } : null; X.glint = null; X.focus = null;
    X.diet = { avail: this.counts(H, H.items), catches: [] };
    if (H.bag) H.bag.fed = new Array(ch.bag.chicks).fill(0);
    H.updPanel(); if (!H.sync) { Snd.dawn(); this.say(H, 'gen', { g: H.gen }); }
  },
  /* legacy places() in a fixed virtual stage (390 × 540, the phone canvas), below the HUD band and the chick row, returned in
     stage fractions: the R() draws, and so the run, never depend on the viewport (legacy places() used the live canvas) */
  places(H, n) {
    const W = 390, Hh = 540, m = 22, top = 104, span = Hh - top - m, pts = [], minD = Math.min(36, Math.sqrt(W * span / Math.max(1, n)) * 0.62);
    for (let k = 0; k < n; k++) {
      let best = null, bd = -1;
      for (let t = 0; t < 40; t++) {
        const p = { x: m + R() * (W - 2 * m), y: top + R() * span }; let dmin = 1e9;
        for (const q of pts) { const dx = q.x - p.x, dy = q.y - p.y, dd = dx * dx + dy * dy; if (dd < dmin) dmin = dd; }
        if (dmin > minD * minD) { best = p; break; } if (dmin > bd) { bd = dmin; best = p; }
      }
      pts.push(best);
    }
    return pts.map(p => ({ x: p.x / W, y: p.y / Hh }));
  },
  migrate(H) {   // at dawn round(m·N) residents, chosen with R(), are replaced by migrants (ind.mig = true)
    const M = H.ch.migrants, N = H.pop.length, m = typeof M.m === 'function' ? M.m(H) : M.m, k = Math.min(N, Math.round((+m || 0) * N));
    H.x.migrants = 0; if (k <= 0 || typeof M.from !== 'function') return;
    for (const i of this.sample(N, k)) { const ind = H.mk(M.from(H)); ind.mig = true; H.pop[i] = ind; }
    H.x.migrants = k;
  },
  resettle(H) {   // each night every moth settles on a random trunk, an equal share on each; you hunt one
    const T = H.ch.trunks, n = Math.max(1, T.n | 0), idx = H.pop.map((_, i) => i);
    shuffle(idx); idx.forEach((j, k) => { H.pop[j].trunk = k % n; });
    const t = typeof T.hunted === 'function' ? T.hunted(H) | 0 : (T.hunted | 0); H.x.trunk = ((t % n) + n) % n;
    return H.pop.filter(ind => ind.trunk === H.x.trunk);
  },

  /* ---------- the hunt: taps, catches, search image, bag ---------- */
  nearest(H, px, py, r) {
    const W = Stage.w, Hh = Stage.h; let best = null, bd = r == null ? Infinity : r * r;
    for (const it of H.items) { if (!it.alive) continue; const dx = it.x * W - px, dy = it.y * Hh - py, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = it; } }
    return best;
  },
  tap(H, px, py, how) {
    const ch = H.ch, X = H.x;
    if (H.state === 'dawn') H.state = 'hunt';   // the first action cannot fail: a tap at dawn starts the morning and counts
    if (H.state !== 'hunt') return false;
    if (H.lens && H.lens.blocks()) { this.whisper(H, 'lens'); return false; }
    const best = this.nearest(H, px, py, 23), W = Stage.w, Hh = Stage.h;
    this.act(H, { k: how || 'tap', x: Math.round(px / W * 1000) / 1000, y: Math.round(py / Hh * 1000) / 1000 });
    if (X.looks != null) X.looks--;
    if (!best) {
      if (X.looks == null) H.time -= ch.missCost == null ? 0.5 : ch.missCost;
      X.flinch = 1; const F = this.fx(); if (F) { F.tier(1); F.burst('dust', px, py, 1); }
      if (!H.sync) Snd.miss(); H.updPanel(); this.checkLooks(H); return false;
    }
    this.eat(H, best); return true;
  },
  eat(H, it) {
    const ch = H.ch, X = H.x, W = Stage.w, Hh = Stage.h, x = it.x * W, y = it.y * Hh, F = this.fx();
    if (X.diet && it.kind === 'prey' && !it.sp) X.diet.catches.push({ m: this.morph(H, it.ind.ph), avail: this.counts(H, H.items, it) });
    it.alive = false; X.focus = null; if (F) F.tier(1);
    if (it.kind === 'model' || it.kind === 'toxic') {   // a bitter mouthful: the insect staggers off alive, you pay (D4 §5.3)
      const S = it.sp ? this.spBy(H, it.sp) : null, tox = typeof ch.toxicity === 'function' ? ch.toxicity(H, it) : S && S.spec.cost != null ? S.spec.cost : ch.bitterCost == null ? 3 : ch.bitterCost;
      const s = tox && typeof tox === 'object' ? +tox.s || 0 : +tox || 0, starve = tox && typeof tox === 'object' ? tox.starve | 0 : 0;
      if (X.looks != null) X.looks -= (ch.untimed && ch.untimed.bitterLooks != null ? ch.untimed.bitterLooks : 2); else H.time -= s;
      H.bitter++; H.bitterTotal++; it.flee = 1; X.starveExtra += starve;
      if (S && S.spec.kills) it.ind.eaten = true;
      if (F) { F.shake(5, 180); F.flash({ edge: true }); F.hitstop(50); }
      if (!H.sync) Snd.bitter(); this.whisper(H, 'bitter');
      if (typeof ch.onTaste === 'function') ch.onTaste(H, it, true);
    } else {
      H.eaten++; H.total++; it.ind.eaten = true; it.fade = 1;
      X.fx.push({ k: 'shadow', x, y, age: 0 });   // the beak shadow grows for 90 ms, then three dust puffs and a ghost ring
      if (H.bag) this.feed(H);
      if (X.si) this.searchImage(H, it);
      if (!H.sync) Snd.peck();
      if (it.sp && typeof ch.onTaste === 'function') ch.onTaste(H, it, false);
    }
    H.updPanel();
    if (H.eaten >= ch.cap) H.endRound(); else this.checkLooks(H);
  },
  checkLooks(H) { const X = H.x; if (X.looks != null && X.looks <= 0 && H.state === 'hunt') { this.whisper(H, 'looks'); H.endRound(); } },
  feed(H) {   // catches feed the chick row round-robin; "+1" pops on the chick and it squashes (220 ms)
    const b = H.bag, k = (H.eaten - 1) % b.chicks, X = H.x; b.fed[k]++; X.chickPop[k] = 1;
    if (H.sync) return; const p = this.chickPos(H, k), F = this.fx(); if (F) F.pop('+1', p[0], p[1] - 18, 1);
    if (typeof Snd2 !== 'undefined') Snd2.play('peep', { x: p[0], y: p[1], twin: false });
  },
  searchImage(H, it) {   // the same morph again is quicker (streak refunds time); a switch costs time and a refocus veil
    const S = H.ch.searchImage, X = H.x, m = this.morph(H, it.ind.ph), si = X.si;
    if (si.last != null && m === si.last) { if (X.looks == null) H.time = Math.min(H.ch.roundTime, H.time + (S.streak || 0)); si.run++; if (si.run === 3) this.whisper(H, 'streak'); }
    else if (si.last != null) { if (X.looks == null) H.time -= S.switchCost || 0; else if (S.switchCost > 0) X.looks--; X.veil = 1; si.run = 1; this.whisper(H, 'refocus'); }
    else si.run = 1;
    si.last = m; si.idle = 0; X.glint = null;
  },
  consp(H, it) { const ch = H.ch; return typeof ch.match === 'function' ? 1 - ch.match(it.ind.ph, this.barkAtN(H, it.x, it.y)) : 0.5; },
  mostConspicuous(H) { let best = null, bc = -Infinity; for (const it of H.items) if (it.alive && it.kind === 'prey') { const c = this.consp(H, it); if (c > bc) { bc = c; best = it; } } return best; },
  autoHunt(H) {   // the non-visual path: the bird takes the most conspicuous moth above your detection threshold
    const ch = H.ch, D = ch.detectRule, X = H.x, live = H.items.filter(it => it.alive);
    let it = null;
    if (typeof D.pick === 'function') it = D.pick(H, live, X.ruleV);
    else { let bc = -1; for (const q of live) { const c = this.consp(H, q); if (c >= X.ruleV && c > bc) { bc = c; it = q; } } }
    if (!it) { if (X.looks != null || H.time < 0.05) H.endRound(); return; }
    this.act(H, { k: 'auto', i: H.items.indexOf(it), v: X.ruleV });
    if (X.looks != null) X.looks--;
    this.eat(H, it);
  },

  /* ---------- dusk: ghost jays, the bag, eggs and cull, the slide into the graph, the prediction ---------- */
  preDusk(H) {   // runs at endRound, before the record is made, so the jays' catches count in S
    const ch = H.ch, X = H.x;
    if (ch.trunks && X.diet) this.ghostJays(H);
    if (H.bag) {
      const per = ch.bag.need / ch.bag.chicks, short = Math.max(0, ch.bag.need - H.eaten);
      const k = Math.min(ch.bag.chicks, (short > 0 ? Math.ceil(short / per - 1e-9) : 0) + X.starveExtra);
      X.starveExtra = 0; H.bag.starved = k; H.bag.total += k;
    }
  },
  dOf(H, m) { const g = ((H.ch.trunks || {}).ghost || {}).d; if (typeof g === 'function') return +g(m) || 1; if (g && g[m] != null) return +g[m]; return 1; },
  /* maximum likelihood b for "catch share of morph i ∝ dᵢ·aᵢ^b", over every catch of the last mornings (each catch drawn from
     what was left on the trunk), on a 0.01 grid in [lo, hi]; Det maths, so the fit is bit-exact. A flat likelihood → 1. */
  fitB(H, ms, lo, hi) {
    const obs = []; for (const m of ms || []) for (const c of m.catches || []) if (c.avail[c.m] > 0) obs.push(c);
    if (!obs.length) return clamp(1, lo, hi);
    const ll = b => {
      let s = 0;
      for (const o of obs) { let tot = 0, den = 0; for (const k in o.avail) tot += o.avail[k]; for (const k in o.avail) if (o.avail[k] > 0) den += this.dOf(H, k) * Det.pow(o.avail[k] / tot, b); s += Det.log(this.dOf(H, o.m)) + b * Det.log(o.avail[o.m] / tot) - Det.log(den); }
      return s;
    };
    let best = clamp(1, lo, hi), bv = -Infinity, v0 = null, flat = true;
    for (let i = 0; i <= 250; i++) { const b = lo + (hi - lo) * i / 250, v = ll(b); if (v0 == null) v0 = v; else if (Math.abs(v - v0) > 1e-9) flat = false; if (v > bv + 1e-12) { bv = v; best = b; } }
    return flat ? clamp(1, lo, hi) : Math.round(best * 1000) / 1000;
  },
  ghostJays(H) {   // designed: three ghost jays replay your fitted rule on the trunks you did not hunt (D1 §3.1, L3)
    const T = H.ch.trunks, G = T.ghost || {}, X = H.x, n = Math.max(1, T.n | 0);
    X.mornings.push(X.diet); while (X.mornings.length > 3) X.mornings.shift();
    const b = this.fitB(H, X.mornings, G.bmin == null ? 0.5 : G.bmin, G.bmax == null ? 3 : G.bmax), take = G.catch != null ? Math.max(0, (typeof G.catch === 'function' ? G.catch(H) : G.catch) | 0) : H.eaten;
    H.ghostB = b; X.jays = [];
    for (let t = 0; t < n; t++) {
      if (t === X.trunk) continue;
      const on = H.pop.filter(ind => ind.trunk === t && !ind.eaten), got = [];
      for (let k = 0; k < take && on.length; k++) {
        const cnt = {}; for (const ind of on) { const m = this.morph(H, ind.ph); cnt[m] = (cnt[m] || 0) + 1; }
        const keys = Object.keys(cnt), w = keys.map(m => this.dOf(H, m) * Det.pow(cnt[m] / on.length, b)); let sum = 0; for (const v of w) sum += v;
        let u = R() * sum, j = 0; for (; j < keys.length - 1; j++) { u -= w[j]; if (u < 0) break; }
        const pool = on.filter(ind => this.morph(H, ind.ph) === keys[j]), vic = pool[(R() * pool.length) | 0];
        vic.eaten = true; on.splice(on.indexOf(vic), 1); got.push(keys[j]);
      }
      X.jays.push({ trunk: t, got, left: on.map(ind => this.morph(H, ind.ph)) });
    }
  },
  annotate(H, rec) { if (!rec || rec._x) return; const X = H.x; rec._x = 1; rec.level = X.level; rec.starved = H.bag ? H.bag.starved : null; rec.ghostB = H.ghostB; rec.trunk = X.trunk; rec.looks = X.looks; rec.migrants = X.migrants || 0; rec.jays = X.jays ? X.jays.map(j => ({ trunk: j.trunk, got: j.got.length })) : null; },
  dusk(H, rec) {
    const ch = H.ch, X = H.x; if (!X || H.state !== 'dusk') return;
    this.annotate(H, rec); X.focus = null;
    if (H.bag && H.bag.starved && !H.sync) { const F = this.fx(); for (const k of this.starvedIdx(H)) { const p = this.chickPos(H, k); if (F) F.ring(p[0], p[1], 15, { dashed: true }); } this.whisper(H, 'starve'); }
    if (typeof ch.dusk === 'function') { X.dk = { phase: 'chapter', t: 0 }; ch.dusk(H, rec, () => { if (H.x === X && H.state === 'dusk') { X.dk = null; H.nextGen(); } }); return; }
    X.dk = { phase: 'start', t: 0, rec };
    this.say(H, 'dusk', { s: H.pop.filter(x => !x.eaten).length });
    const F = this.fx(); if (F) F.tier(2);   // the dusk is a T2 beat; its sound's visual twin is the dusk itself
    if (typeof Snd2 !== 'undefined' && !H.sync) Snd2.play('dusk', { x: Stage.w / 2, y: Stage.h / 2, twin: false });
    this.toPhase(H, ch.overproduce ? 'eggs' : 'slide');
  },
  wantAsk(H) {
    const P = H.ch.predict; if (!P || H.sync || typeof Predict === 'undefined') return false;
    if (typeof P.from === 'function') return !!P.from(H);
    const f = P.from == null ? 1 : P.from; return H.gen >= f && (!P.every || (H.gen - f) % P.every === 0) && (P.until == null || H.gen <= P.until);
  },
  toPhase(H, ph) {
    const X = H.x, k = X.dk; if (!k) return;
    k.phase = ph; k.t = 0;
    if (ph === 'eggs') { X.brood = this.breed(H); this.eggsStart(H); }
    else if (ph === 'slide') { k.dur = this.calm() ? 0.15 : 0.6; for (const it of H.items) if (it.alive && it.kind === 'prey') it.slide = 0; if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw(); }
    else if (ph === 'ask') this.openAsk(H);
    else if (ph === 'done') { X.dk = null; X.eggs = null; this.dock(H); H.nextGen(); return; }
    this.dock(H); H.updPanel();
  },
  duskStep(H, dt) {
    const X = H.x, k = X.dk; if (!k || k.phase === 'chapter') return;
    k.t += dt;
    if (k.phase === 'eggs') { const E = X.eggs; if (!E || k.t >= E.total) this.toPhase(H, 'slide'); else this.eggsStep(H); }
    else if (k.phase === 'slide') { for (const it of H.items) if (it.slide != null) it.slide = clamp(k.t / k.dur, 0, 1); if (k.t >= k.dur) this.toPhase(H, this.wantAsk(H) ? 'ask' : 'done'); }
    else if (k.phase === 'ask') { if (k.committed || !k.handle || (!k.handle.active && k.t > 0.1)) this.toPhase(H, 'done'); }
  },
  openAsk(H) {
    const ch = H.ch, P = ch.predict, X = H.x, k = X.dk, id = 'L' + X.level + 'g' + H.gen;
    k.id = id; k.committed = false;
    k.handle = Predict.ask({ id, chart: P.chart || 0, kind: P.kind || 'x', axis: P.axis || { lo: 0, hi: 1 }, start: typeof P.start === 'function' ? P.start(H) : P.start, tol: P.tol, soft: P.soft, at: P.at,
      onCommit: r => this.committed(H, id, r.v) });
  },
  committed(H, id, v) {   // the expectation for the parameters in force is computed here, at scoring time, and kept out of Hn
    const X = H.x, k = X.dk; if (!k || k.id !== id || k.committed) return;
    k.committed = true; const P = H.ch.predict;
    this._exp.set(X, typeof H.ch.expect === 'function' ? H.ch.expect(H, k.rec) : null);
    X.pend = { id, v, gen: H.gen, tol: P.tol, kind: P.kind || 'x' };
  },
  _exp: new WeakMap(),
  reveal(H) {   // after breeding: the band moves to the expectation; the record joins Hn.preds (for the Predict star)
    const X = H.x, p = X.pend; if (!p) return; X.pend = null; p.expect = this._exp.get(X); this._exp.delete(X);
    let r = null; if (p.expect != null && typeof Predict !== 'undefined') r = Predict.reveal(p.id, p.expect, p.tol);
    const err = r ? r.err : p.expect != null && typeof Predict !== 'undefined' ? Predict.err(p.kind, p.v, p.expect) : null;
    X.preds.push({ gen: p.gen, id: p.id, kind: p.kind, v: p.v, expect: p.expect, err, tol: p.tol, hit: err != null && p.tol != null && err <= p.tol });
  },

  /* ---------- overproduction: eggs at the true ratio, a random winter cull to K (D1 §3.1 L0; D4 §5.3) ---------- */
  mateG(H, a, b) { return typeof H.ch.mate === 'function' ? H.ch.mate(H, a, b) : Gen.mate(H.lay, a.g, b.g); },
  breed(H) {   // all R() draws for the next generation happen here, at one fixed point of the dusk
    const ch = H.ch, O = ch.overproduce, surv = H.pop.filter(x => !x.eaten), par = surv.length >= 2 ? surv : H.pop;
    const E = Math.max(1, Math.round(typeof O.eggs === 'function' ? O.eggs(H) : O.eggs || par.length * 10)), K = Math.min(E, Math.max(1, Math.round(typeof O.K === 'function' ? O.K(H) : O.K || ch.N)));
    const eggs = [], pairs = [], mom = [];
    for (let i = 0; i < E; i++) { const a = pick(par); let b = pick(par), tr = 0; while (b === a && tr++ < 6) b = pick(par); eggs.push(this.mateG(H, a, b)); pairs.push([a.id, b.id]); mom.push(par.indexOf(a)); }
    const keep = this.sample(E, K).sort((x, y) => x - y);
    return { eggs, pairs, mom, keep, par, E, K };
  },
  eggsStart(H) {   // the tray: 12 px ovals at a 14 px pitch, 25 across, at the foot of the canvas; ≤ 600 dots, else "1 dot = n eggs"
    const X = H.x, B = X.brood, W = Stage.w, Hh = Stage.h, calm = this.calm(), per = Math.max(1, Math.ceil(B.E / 600)), dots = Math.ceil(B.E / per);
    const cols = 25, pitch = Math.max(8, Math.min(14, (W - 24) / cols)), rows = Math.ceil(dots / cols), tw = cols * pitch, th = rows * pitch;
    const order = B.eggs.map((_, i) => i).sort((a, b) => B.mom[a] - B.mom[b] || a - b), kept = new Set(B.keep);
    const slots = [];   // dot j holds eggs order[j·per … ]: it lands with its mother's batch and survives if any of its eggs is kept
    for (let j = 0; j < dots; j++) { const es = order.slice(j * per, (j + 1) * per); slots.push({ x: (W - tw) / 2 + (j % cols + 0.5) * pitch, y: Hh - th - 10 + (Math.floor(j / cols) + 0.5) * pitch, mom: B.mom[es[0]], keep: es.some(e => kept.has(e)), land: 0, gone: false }); }
    const moms = [], seen = {};
    const nm = new Set(slots.map(q => q.mom)).size, stag = Math.min(0.02, 0.6 / Math.max(1, nm));   // 20 ms apart, the whole flight ≤ 0.9 s
    for (const s of slots) if (!seen[s.mom]) { seen[s.mom] = 1; const ind = B.par[s.mom], it = H.items.find(q => q.ind === ind && q.alive); moms.push({ mom: s.mom, vis: !!it, x0: it ? it.x * W : 0, y0: it ? it.y * Hh : 0, x1: s.x, y1: s.y, t0: calm ? 0 : moms.length * stag }); }
    const landEnd = calm ? 0.05 : (moms.length ? moms[moms.length - 1].t0 + 0.3 : 0), culled = slots.filter(s => !s.keep);
    const batches = calm ? [culled] : [0, 1, 2, 3, 4, 5].map(b => culled.filter((_, i) => i % 6 === b));
    X.eggs = { tray: { x: (W - tw) / 2, y: Hh - th - 10, w: tw, h: th, pitch }, per, slots, moms, batches, landEnd, cullDur: calm ? 0.15 : 0.6, total: landEnd + (calm ? 0.25 : 0.6) + 0.35, landed: -1, culled: -1, layer: null };
    if (typeof Snd2 !== 'undefined' && !H.sync) { const F = this.fx(); if (F) F.tier(2); Snd2.play('count', { x: W / 2, y: Hh - th / 2 - 10, twin: false }); }   // twin: the tray
  },
  eggsStep(H) {   // which batches have landed and been culled at this moment of the dusk; the layer redraws only on a change
    const X = H.x, E = X.eggs, t = X.dk.t; let landed = 0;
    for (const m of E.moms) if (t >= m.t0 + (this.calm() ? 0 : 0.3)) landed++;
    const cb = t < E.landEnd ? 0 : Math.min(E.batches.length, Math.floor((t - E.landEnd) / (E.cullDur / E.batches.length)) + 1);
    if (landed !== E.landed || cb !== E.culled) {
      E.landed = landed; E.culled = cb; const on = {}; for (let i = 0; i < landed; i++) on[E.moms[i].mom] = 1;
      for (let b = 0; b < E.batches.length; b++) for (const s of E.batches[b]) s.gone = b < cb;
      for (const s of E.slots) s.land = on[s.mom] ? 1 : 0;
      E.dirty = true;
    }
  },

  /* ---------- the next generation ---------- */
  nextGen(H) {
    if (H.state !== 'dusk') return;
    const ch = H.ch, X = H.x, prev = H.lastRec; X.dk = null; this.annotate(H, prev);
    const kids = [];
    if (ch.overproduce) { const B = X.brood || this.breed(H); X.brood = null; X.eggs = null; for (const i of B.keep) { const kid = H.mk(B.eggs[i]); kid.pa = B.pairs[i]; kids.push(kid); } X.lastBrood = { E: B.E, K: B.K, parents: B.par.length }; }
    else { const surv = H.pop.filter(x => !x.eaten), par = surv.length >= 2 ? surv : H.pop; for (let i = 0; i < ch.N; i++) { const a = pick(par); let b = pick(par), tr = 0; while (b === a && tr++ < 6) b = pick(par); const kid = H.mk(this.mateG(H, a, b)); kid.pa = [a.id, b.id]; kids.push(kid); } }
    for (const S of X.sp) { const surv = S.pop.filter(x => !x.eaten), par = surv.length >= 2 ? surv : S.pop, next = []; for (let i = 0; i < S.spec.N; i++) { const a = pick(par); let b = pick(par), tr = 0; while (b === a && tr++ < 6) b = pick(par); const kid = this.mkSp(H, S, Gen.mate(S.lay, a.g, b.g)); kid.pa = [a.id, b.id]; next.push(kid); } S.pop = next; }
    H.pop = kids; H.gen++;
    if (prev && ch.focus) { prev.mOff = mean(kids.map(x => ch.focus.get(x.ph))); prev.R = prev.mOff - prev.mAll; }
    if (ch.onBred) ch.onBred(H);
    const o = ch.objective(H); H.obj = o;
    this.reveal(H);
    if (!H.sync && typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    if (o.done || H.gen > ch.maxGen) { H.finish(o); return; }
    H.morning();
  },
  mask(H, o) {
    const st = H.ch.stars, lv = H.x.level;
    if (typeof st === 'function') { const n = clamp(st(H, o) | 0, 0, 3); return (1 << n) - 1; }
    if (st && typeof st === 'object') return (st.discover && st.discover(H, lv, o) ? 1 : 0) | (st.predict && st.predict(H, lv, o) ? 2 : 0) | (st.transfer && st.transfer(H, lv, o) ? 4 : 0);
    return 0;
  },
  finish(H, o) {   // a v2 level ends on the v2 level or end card (00_entry.js), with Discover, Predict and Transfer bits
    H.state = 'done'; const ch = H.ch, X = H.x; H.hist.push({ gen: H.gen, obj: o.value, final: true });
    const lv = X.level, final = lv >= (ch.levels ? ch.levels.length : 1) - 1, mask = this.mask(H, o);
    H.stars = (mask & 1) + (mask >> 1 & 1) + (mask >> 2 & 1);
    if (H.sync) return;
    this.dock(H);
    const base = { level: lv, mask, final };
    if (typeof ch.interesting === 'function') base.interesting = ch.interesting(H, o);
    if (typeof ch.endChart === 'function') base.chart = cv => ch.endChart(cv, H);
    End.show(ch, Object.assign(base, typeof ch.result === 'function' ? ch.result(H, o) || {} : {}));
  },

  /* ---------- update ---------- */
  update(H, dt) {
    const X = H.x, ch = H.ch; if (!X) return; X.t += dt;
    for (const it of H.items) { if (it.fade != null && it.fade > 0) it.fade -= dt / 0.3; if (it.flee != null && it.flee > 0) it.flee = Math.max(0, it.flee - dt / 0.6); }
    const F = this.fx();
    for (let i = X.fx.length - 1; i >= 0; i--) { const f = X.fx[i]; f.age += dt; if (!f.done && f.age >= 0.09) { f.done = true; if (F) { F.burst('dust', f.x, f.y, 3); F.ring(f.x, f.y, 14, { dashed: true }); } } if (f.age > 0.3) X.fx.splice(i, 1); }
    X.flinch = Math.max(0, X.flinch - dt * 5); X.veil = Math.max(0, X.veil - dt / 0.3);
    for (let k = 0; k < X.chickPop.length; k++) if (X.chickPop[k] > 0) X.chickPop[k] = Math.max(0, X.chickPop[k] - dt / 0.22);
    if (H.state === 'dawn') { H.st += dt; if (H.st > 0.5) H.state = 'hunt'; H.updPanel(); }
    else if (H.state === 'hunt') {
      if (X.looks == null) { H.time -= dt; if (H.time <= 0) { H.time = 0; H.updPanel(); H.endRound(); return; } }
      const S = ch.searchImage; if (X.si && S.glintAfter > 0) { X.si.idle += dt; if (!X.glint && X.si.idle >= S.glintAfter) X.glint = this.mostConspicuous(H); }
      if (X.auto && ch.detectRule) { X.autoT += dt; if (X.autoT >= (X.looks == null ? 0.6 : 0.35)) { X.autoT = 0; this.autoHunt(H); } }
      if (H.state === 'hunt') H.updPanel();
    } else if (H.state === 'dusk') this.duskStep(H, dt);
  },

  /* ---------- HUD, dock, notes ---------- */
  hud(H) {
    if (H.sync || typeof HUD === 'undefined' || !HUD.say) return;
    const ch = H.ch, X = H.x, C = ch.content || {}; if (!X) return;
    let text, num = '';
    if (H.state === 'dusk') { const k = X.dk; text = this.w(H, 'hud', k && k.phase === 'ask' ? 'ask' : k && k.phase === 'eggs' ? 'eggs' : 'dusk'); }
    else if (H.state === 'done') text = this.w(H, 'hud', 'wait');
    else {
      text = X.level === 0 && H.gen === 1 && !H.total && C.firstWords ? C.firstWords : this.w(H, 'hud', X.auto ? 'auto' : 'hunt', { n: H.eaten || 0, m: ch.cap });
      num = X.looks != null ? this.w(H, 'labels', 'looks', { n: Math.max(0, X.looks) }) : this.w(H, 'labels', 'secs', { n: Math.max(0, isFinite(H.time) ? H.time : ch.roundTime).toFixed(1) });
    }
    if (typeof ch.hudLine === 'function') { const r = ch.hudLine(H, text, num); if (r) { text = r[0]; num = r[1]; } }
    HUD.say(text, num);
    const g = $('bar-gen'); if (g && g.textContent !== 'gen ' + H.gen) g.textContent = 'gen ' + H.gen;
  },
  dock(H) {   // chapter buttons, then the lens control, the bird-rule toggle and slider, and "Lock in" while a prediction is open
    if (H.sync || typeof Dock === 'undefined' || !Dock.set || App.mode !== H) return;
    const ch = H.ch, X = H.x, b = [];
    if (typeof ch.dock === 'function') for (const q of ch.dock(H) || []) b.push(q);
    if (H.lens && typeof GenePoolLens !== 'undefined' && GenePoolLens.control) b.push({ id: 'lens', el: H.lens.ctl || GenePoolLens.control(H.lens) });
    if (ch.detectRule && H.state !== 'done') { b.push({ id: 'auto', label: this.w(H, 'labels', 'auto'), key: 'B', pressed: X.auto, fn: () => { X.auto = !X.auto; this.act(H, { k: 'auto', on: X.auto }); this.dock(H); H.updPanel(); } }); if (X.auto) b.push({ id: 'rule', el: this.ruleEl(H) }); }
    const k = X.dk; if (k && k.phase === 'ask' && !k.committed) b.push({ id: 'commit', label: this.w(H, 'labels', 'commit'), key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(k.id); } });
    Dock.set(b);
  },
  ruleEl(H) {   // the detection threshold: a labelled range input (keyboard: arrows), its value in mono
    const D = H.ch.detectRule, X = H.x; if (X.ruleEl) return X.ruleEl;
    const box = document.createElement('label'), sp = document.createElement('span'), inp = document.createElement('input'), out = document.createElement('output');
    box.className = 'hx-rule'; sp.textContent = D.label || this.w(H, 'labels', 'rule');
    inp.type = 'range'; inp.min = String(D.min == null ? 0 : D.min); inp.max = String(D.max == null ? 1 : D.max); inp.step = String(D.step == null ? 0.05 : D.step); inp.value = String(X.ruleV);
    const show = () => { out.textContent = (Math.round(X.ruleV * 100) / 100).toFixed(2); };
    inp.addEventListener('input', () => { X.ruleV = +inp.value; show(); this.act(H, { k: 'rule', v: X.ruleV }); });
    show(); box.append(sp, inp, out); X.ruleEl = box; return box;
  },
  notes(H) {   // the live strip: a dot-histogram of this morning (eaten hollow, spared solid, young hatched) with S and R arrows
    const ch = H.ch; if (typeof ch.notes === 'function') return ch.notes(H);
    const X = H.x, r = H.lastRec, f = ch.focus, val = x => f ? f.get(x.ph) : 0, L = k => this.w(H, 'labels', k), groups = [];
    if (r && r.ev) { groups.push({ v: r.ev, style: 'hollow', label: L('eaten') }, { v: r.sv, style: 'solid', label: L('spared') }); if (r.R != null) groups.push({ v: H.pop.map(val), style: 'hatched', label: L('young') }); }
    else groups.push({ v: H.pop.map(val), style: 'solid', label: L('spared') });
    const spec = { type: 'dots', title: L('chart'), x: { lo: 0, hi: 1, label: ch.focusName || '' }, groups, frame: 'designed' };
    if (r && r.mAll != null) spec.arrows = r.R != null ? { S: [r.mAll, r.mSurv], R: [r.mAll, r.mOff] } : { S: [r.mAll, r.mSurv] };
    if (ch.target && ch.target.T != null) spec.marker = { v: ch.target.T, label: L('target') };
    const stats = [[L('gen'), String(H.gen), '']];
    if (r && r.S != null) stats.push([L('s'), f2(r.S), '']); if (r && r.R != null) stats.push([L('r'), f2(r.R), '']); if (H.ghostB != null) stats.push([L('b'), String(H.ghostB), '']);
    return { stats, charts: [spec] };
  },

  /* ---------- lens ---------- */
  lensSetup(H) {
    const ch = H.ch, Z = ch.lens; H.lens = null;
    if (!Z || typeof GenePoolLens === 'undefined') return;
    const s = Z.k && H.lay.T[Z.k], L = H.lay.L, conv = v => v === -1 ? -1 : s.kind === 'multi' ? v : v > 0.5 ? 0 : 1;   // a dom locus: copy 1 = the dominant allele A (ink index 0)
    const alle = ind => typeof Z.alleles === 'function' ? Z.alleles(ind) : s ? [conv(ind.g[s.off]), conv(ind.g[L + s.off])] : [];
    H.lens = GenePoolLens.create({ items: () => { const W = Stage.w, Hh = Stage.h, out = []; for (const it of H.items) if (it.alive && it.kind === 'prey' && !it.sp) out.push({ x: it.x * W, y: it.y * Hh, r: 14, a: alle(it.ind) }); return out; },
      get jar() { const z = Stage.zones && Stage.zones.thumb; return z ? { x: 16, y: z.y + 18, w: Stage.w - 32, h: Math.max(48, z.h - 44) } : { x: 16, y: Stage.h * 0.66, w: Stage.w - 32, h: Stage.h * 0.24 }; },
      letters: Z.letters || ['A', 'a'], names: Z.names, blocksTaps: !!Z.blocksTaps, label: Z.label });
  },

  /* ---------- backgrounds: barks composited through a makeNoise mask (Hn.barkAt) ---------- */
  ensureBg(H) {
    const ch = H.ch, d = H.texD(), key = Math.round(Stage.w) + 'x' + Math.round(Stage.h) + '@' + d;
    if (key !== H.bgKey) { H.bgKey = key; H.bg = typeof ch.makeBg === 'function' ? ch.makeBg(Stage.w, Stage.h, d) : ch.barks ? this.barkBg(H, Stage.w, Stage.h, d) : this.plainBg(H); H.env = ch.env ? ch.env(H) : {}; H.obj = ch.objective(H); H.updPanel(); }
    if (H.spriteD !== d) { H.spriteD = d; for (const it of H.items) it.spr = null; }
    for (const it of H.items) if (!it.spr) it.spr = this.sprite(H, it.ind.ph, d, it.sp ? this.spBy(H, it.sp).spec : null, it.kind === 'model', it.ind.sv);
  },
  plainBg(H) { const g = typeof Pal !== 'undefined' ? Pal.place(H.ch.place).ground : '#8F9A7E'; return { draw: (c, W, Hh) => { c.fillStyle = g; c.fillRect(0, 0, W, Hh); } }; },
  barkV(H, i, nx, ny) { const m = H.ch.barks[i].mask || {}, s = m.scale || 3; return fbm(H.x.barkN[i], nx * s, ny * s * 1.5, 3); },
  barkAtN(H, nx, ny) {   // the topmost bark under a point (normalised stage coordinates), from the same noise as the picture
    const X = H.x, B = H.ch && H.ch.barks; if (!X || !B || !X.barkN) return 0; let k = 0;
    for (let i = 1; i < B.length; i++) if (X.barkN[i] && this.barkV(H, i, nx, ny) > (B[i].mask.cut == null ? 0.5 : B[i].mask.cut)) k = i;
    return k;
  },
  barkBg(H, w, h, d) {
    const B = H.ch.barks, X = H.x, tex = B.map((b, i) => b.tex(w, h, d, b.seed != null ? b.seed : 4242 + 101 * i)), cv = mkCanvas(w * d, h * d), c = cv.getContext('2d');
    X.barkT = tex.map(t => ({ T: t.T, H: t.H })); c.drawImage(tex[0].cv, 0, 0, cv.width, cv.height);
    for (let i = 1; i < B.length; i++) {
      if (!X.barkN[i]) continue;
      const mw = Math.max(2, Math.ceil(w / 4)), mh = Math.max(2, Math.ceil(h / 4)), m = mkCanvas(mw, mh), mc = m.getContext('2d'), im = mc.createImageData(mw, mh), Dd = im.data, cut = B[i].mask.cut == null ? 0.5 : B[i].mask.cut;
      if (Dd && Dd.length === mw * mh * 4) for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) { const a = smooth(cut - 0.025, cut + 0.025, this.barkV(H, i, (x + 0.5) / mw, (y + 0.5) / mh)); Dd[(y * mw + x) * 4 + 3] = Math.round(255 * a); }
      mc.putImageData(im, 0, 0);
      const t = mkCanvas(cv.width, cv.height), tc = t.getContext('2d'); tc.drawImage(tex[i].cv, 0, 0, t.width, t.height); tc.globalCompositeOperation = 'destination-in'; tc.drawImage(m, 0, 0, t.width, t.height);
      c.drawImage(t, 0, 0);
    }
    return { draw: (cc, W, Hh) => cc.drawImage(cv, 0, 0, W, Hh), T: X.barkT };
  },
  sprite(H, ph, d, spec, model, sv) {   // the chapter's sprite(), else its rig through Rig.bake, else a plain disc
    const ch = H.ch, src = spec || ch;
    if (model && typeof ch.modelSprite === 'function') return ch.modelSprite(ph, d, sv);
    if (typeof src.sprite === 'function') return src.sprite(ph, d, sv);
    const rig = src.rig || ch.rig; if (rig && typeof Rig !== 'undefined' && Rig.has(rig)) return Rig.bake(rig, ph, d, { size: src.rigSize || ch.rigSize });
    const cv = mkCanvas(28 * d, 28 * d), c = cv.getContext('2d'); c.scale(d, d); c.beginPath(); c.arc(14, 14, 11, 0, TAU); c.fillStyle = '#B9B29F'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke(); cv.cw = 28; cv.ch = 28; return cv;
  },

  /* ---------- input: long press pins, a tap eats, arrows and Enter hunt from the keyboard ---------- */
  down(H, x, y) {
    const X = H.x; if (!X) return;
    if ((H.state === 'hunt' || H.state === 'dawn') && typeof Pin !== 'undefined') { const it = this.nearest(H, x, y, 23); if (it && it.kind === 'prey' && it.ind.id != null) { X.press = { x, y, it, moved: false }; Pin.press(it.ind, x, y); return; } }
    H.tap(x, y);
  },
  move(H, x, y) { const p = H.x && H.x.press; if (p && !p.moved && Math.abs(x - p.x) + Math.abs(y - p.y) > 14) { p.moved = true; if (typeof Pin !== 'undefined') Pin.release(); } },
  up(H) { const X = H.x, p = X && X.press; if (!p) return; X.press = null; const pinned = !p.moved && typeof Pin !== 'undefined' && Pin.release(); if (pinned) { this.whisper(H, 'pinned'); return; } H.tap(p.x, p.y); },
  onKey(H, k, e) {
    const ch = H.ch, X = H.x; if (!X) return;
    if (typeof ch.onKey === 'function' && ch.onKey(k, e, H)) return;
    if (H.state !== 'hunt' && H.state !== 'dawn') return;
    const W = Stage.w, Hh = Stage.h, cur = X.focus && X.focus.alive ? X.focus : null;
    const D = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (D) {
      if (!cur) { X.focus = this.nearest(H, W / 2, Hh * 0.55); return; }
      let best = null, bs = Infinity;
      for (const it of H.items) { if (!it.alive || it === cur) continue; const dx = (it.x - cur.x) * W, dy = (it.y - cur.y) * Hh, along = dx * D[0] + dy * D[1]; if (along <= 2) continue; const s = along + 2 * Math.abs(dx * D[1] - dy * D[0]); if (s < bs) { bs = s; best = it; } }
      if (best) X.focus = best; return;
    }
    if (k === 'Enter' && e && e.shiftKey && cur && typeof Pin !== 'undefined') {   // Shift+Enter pins the focused moth: the hold, without holding
      Pin.press(cur.ind, cur.x * W, cur.y * Hh); if (Pin.hold) { Pin.hold.t = Pin.HOLD; Pin.update(0); } if (Pin.release()) this.whisper(H, 'pinned'); return;
    }
    if (k === 'Enter' || k === ' ') { if (!cur) { X.focus = this.nearest(H, W / 2, Hh * 0.55); return; } H.tap(cur.x * W, cur.y * Hh); }
  },

  /* ---------- drawing ---------- */
  chickPos(H, k) { return [26 + k * 32, this.hudH() + 22]; },
  starvedIdx(H) { const b = H.bag; if (!b || !b.starved) return []; return b.fed.map((f, i) => [f, i]).sort((a, c) => a[0] - c[0] || c[1] - a[1]).slice(0, b.starved).map(q => q[1]); },
  draw(H) {
    const c = Stage.ctx, W = Stage.w, Hh = Stage.h, ch = H.ch, X = H.x; if (!ch || !X) return;
    H.ensureBg(); H.bg.draw(c, W, Hh, H.env);
    const calm = this.calm(), desk = Stage.layout === 'desktop' || Stage.layout === 'projector', sx = desk ? W + 40 : W / 2, sy = desk ? Hh / 2 : Hh + 40;
    for (const it of H.items) {
      const s = it.spr; if (!s) continue;
      let x = it.x * W, y = it.y * Hh, a = 1, sc = 1;
      if (!it.alive) {
        if (it.flee > 0) { const f = 1 - it.flee; x += (calm ? 0 : f * 70) * (it.x < 0.5 ? -1 : 1); y -= calm ? 0 : f * 40; a = it.flee; }
        else if (it.fade > 0) { a = it.fade; y -= calm ? 0 : (1 - it.fade) * 6; }
        else continue;
      } else if (it.slide > 0) { const e = 1 - (1 - it.slide) * (1 - it.slide) * (1 - it.slide); if (calm) a = 1 - it.slide; else { x = lerp(x, sx, e); y = lerp(y, sy, e); sc = 1 - 0.5 * e; } }
      c.save(); c.translate(x, y); if (it.rot) c.rotate(it.rot); if (a < 1) c.globalAlpha = Math.max(0, a); if (sc !== 1) c.scale(sc, sc); c.drawImage(s, -s.cw / 2, -s.ch / 2, s.cw, s.ch); c.restore();
      if (it.alive && it.ind.mig && ch.migrants && ch.migrants.mark) this.migMark(c, x, y - s.ch / 2 - 4);
    }
    if (H.lens && H.lens.mode !== 'look' && H.state !== 'dusk') H.lens.draw(c);
    if (X.glint && X.glint.alive && H.state === 'hunt') this.glint(c, X.glint.x * W, X.glint.y * Hh, X.t, calm);
    if (X.veil > 0 && !calm) { c.fillStyle = 'rgba(232,223,201,' + (0.28 * X.veil).toFixed(3) + ')'; c.fillRect(0, 0, W, Hh); }
    for (const f of X.fx) { const p = Math.min(1, f.age / 0.09), al = f.age < 0.09 ? 0.38 : 0.38 * Math.max(0, 1 - (f.age - 0.09) / 0.2), r = calm ? 16 : 6 + 12 * p; c.save(); c.globalAlpha = al; c.fillStyle = '#1B1612'; c.beginPath(); c.ellipse(f.x + 3, f.y + 2, r * 1.2, r * 0.8, 0.3, 0, TAU); c.fill(); c.restore(); }
    if (X.focus && X.focus.alive) { const x = X.focus.x * W, y = X.focus.y * Hh; c.save(); c.setLineDash([5, 4]); c.lineWidth = 4; c.strokeStyle = '#1B1612'; c.strokeRect(x - 24, y - 24, 48, 48); c.lineWidth = 2; c.strokeStyle = '#F4EEDD'; c.strokeRect(x - 24, y - 24, 48, 48); c.restore(); }
    this.drawPins(H, c);
    if (H.bag) this.drawChicks(H, c);
    if (X.dk && X.jays && X.dk.phase !== 'chapter') this.drawJays(H, c);
    if (X.eggs) this.drawEggs(H, c);
    if (H.state === 'hunt' || H.state === 'dawn') this.drawTimer(H, c);
    if (ch.trunks && X.trunk != null && typeof Lbl !== 'undefined') Lbl.put('hx-trunk', this.w(H, 'labels', 'trunk', { n: X.trunk + 1 }), W - 12, this.hudH() + 22, { align: 'right', size: 13, c });
    if (H.state === 'dawn' && !calm) { const g = typeof Pal !== 'undefined' ? Pal.ground : '#152120'; c.save(); c.globalAlpha = 0.45 * Math.max(0, 1 - H.st / 0.5); c.fillStyle = g; c.fillRect(0, 0, W, Hh); c.restore(); }
  },
  migMark(c, x, y) { const col = typeof Pal !== 'undefined' ? Pal.mig : '#7CC4F0'; c.save(); c.beginPath(); c.moveTo(x - 6, y); c.lineTo(x + 4, y); c.moveTo(x + 1, y - 3.5); c.lineTo(x + 5, y); c.lineTo(x + 1, y + 3.5); c.lineCap = 'round'; c.lineWidth = 4.5; c.strokeStyle = '#1B1612'; c.stroke(); c.lineWidth = 2.5; c.strokeStyle = col; c.stroke(); c.restore(); },
  glint(c, x, y, t, calm) {   // the most conspicuous moth catches the eye: four rays turning on a paper ring (Calm: still)
    c.save(); c.translate(x, y); if (!calm) c.rotate(t * 1.5); c.lineCap = 'round';
    for (const [lw, col] of [[4, '#1B1612'], [2, '#F4EEDD']]) { c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.arc(0, 0, 20, 0, TAU); for (let i = 0; i < 4; i++) { const a = i * TAU / 4, cx = Det.cos(a), sy = Det.sin(a); c.moveTo(cx * 24, sy * 24); c.lineTo(cx * 30, sy * 30); } c.stroke(); }
    c.restore();
  },
  drawTimer(H, c) {   // a thin linear bar under the HUD band; a miss flinches it 4 px (D4 §5.3)
    const X = H.x, W = Stage.w, y = this.hudH() + 2, f = X.looks != null ? clamp(X.looks / Math.max(1, X.looks0), 0, 1) : clamp(H.time / H.ch.roundTime, 0, 1), dx = X.flinch > 0 ? (X.flinch > 0.5 ? 4 : -4) * X.flinch : 0;
    c.save(); c.fillStyle = 'rgba(27,22,18,.55)'; c.fillRect(8, y, W - 16, 6); c.fillStyle = typeof Pal !== 'undefined' ? Pal.paper : '#E8DFC9'; c.fillRect(9 + dx, y + 1, (W - 18) * f, 4); c.restore();
  },
  drawChicks(H, c) {   // the bag's chick row: fattening with each catch, gaping while hungry, a ghost ring for a starved chick
    const b = H.bag, X = H.x, per = b.need / b.chicks, starved = H.state === 'dusk' ? this.starvedIdx(H) : [];
    for (let k = 0; k < b.chicks; k++) {
      const p = this.chickPos(H, k), fed = Math.min(1, b.fed[k] / per);
      if (starved.indexOf(k) >= 0) { c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = typeof Pal !== 'undefined' ? Pal.text : '#E8DFC9'; c.beginPath(); c.arc(p[0], p[1], 13, 0, TAU); c.stroke(); c.restore(); continue; }
      if (typeof Rig !== 'undefined' && Rig.has('chick')) Rig.draw(c, 'chick', { fed, gape: H.state === 'hunt' && fed < 1 }, p[0], p[1], { size: 28, state: X.chickPop[k] > 0 ? 'alert' : null, alert: X.chickPop[k] });
      else { c.beginPath(); c.arc(p[0], p[1], 9 + 3 * fed, 0, TAU); c.fillStyle = '#B9AF9E'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke(); }
    }
  },
  drawJays(H, c) {   // dusk thumbnails of the other trunks: what the ghost jays left (solid) and took (dashed rings), by morph shape
    const X = H.x, W = Stage.w, y0 = this.hudH() + 14, bw = 76, bh = 54, keys = [], left = !H.bag;   // top band: left-aligned unless the chick row is there
    for (const j of X.jays) for (const m of j.left.concat(j.got)) if (keys.indexOf(m) < 0) keys.push(m);
    const shape = (m, x, y, r, solid) => { const i = keys.indexOf(m) % 3; c.beginPath(); if (i === 0) c.arc(x, y, r, 0, TAU); else if (i === 1) c.rect(x - r, y - r, 2 * r, 2 * r); else { c.moveTo(x, y - r * 1.2); c.lineTo(x + r * 1.1, y + r * 0.8); c.lineTo(x - r * 1.1, y + r * 0.8); c.closePath(); } if (solid) { c.fillStyle = '#E8DFC9'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke(); } else { c.setLineDash([2, 2]); c.lineWidth = 1; c.strokeStyle = '#E8DFC9'; c.stroke(); c.setLineDash([]); } };
    X.jays.forEach((j, n) => {
      const x0 = left ? 12 + n * (bw + 6) : W - 12 - (n + 1) * (bw + 6), all = j.left.map(m => [m, 1]).concat(j.got.map(m => [m, 0])), cols = 8;
      c.save(); c.fillStyle = 'rgba(27,22,18,.55)'; rrect(c, x0, y0, bw, bh, 6); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke();
      all.forEach(([m, alive], i) => shape(m, x0 + 7 + (i % cols) * 8.8, y0 + 8 + Math.floor(i / cols) * 9, 2.8, alive)); c.restore();
    });
  },
  drawEggs(H, c) {
    const X = H.x, E = X.eggs, k = X.dk, t = k ? k.t : 1e9, tr = E.tray, calm = this.calm();
    if (E.dirty || !E.layer) {
      E.dirty = false; const draw = (cc, ox, oy) => { cc.beginPath(); for (const s of E.slots) if (s.land && !s.gone) { const x = s.x - ox, y = s.y - oy; cc.moveTo(x + 4.6, y); cc.ellipse(x, y, 4.6, 5.8, 0, 0, TAU); } cc.fillStyle = '#EFE6CC'; cc.fill(); cc.lineWidth = 1; cc.strokeStyle = '#1B1612'; cc.stroke(); };
      if (typeof Layer === 'function') { E.layer = E.layer || Layer(tr.w + 16, tr.h + 16); E.layer.redraw(cc => draw(cc, tr.x - 8, tr.y - 8)); } else E.direct = draw;
    }
    c.save(); c.fillStyle = 'rgba(27,22,18,.45)'; rrect(c, tr.x - 8, tr.y - 8, tr.w + 16, tr.h + 16, 8); c.fill(); c.restore();
    if (E.layer) E.layer.blit(c, tr.x - 8, tr.y - 8); else if (E.direct) E.direct(c, 0, 0);
    if (!calm) for (const m of E.moms) { const p = (t - m.t0) / 0.3; if (!m.vis || p <= 0 || p >= 1) continue; const e = p * p * (3 - 2 * p), mx = (m.x0 + m.x1) / 2, my = Math.min(m.y0, m.y1) - 40, x = (1 - e) * (1 - e) * m.x0 + 2 * (1 - e) * e * mx + e * e * m.x1, y = (1 - e) * (1 - e) * m.y0 + 2 * (1 - e) * e * my + e * e * m.y1; c.save(); c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeStyle = '#E8DFC9'; c.beginPath(); c.moveTo(m.x0, m.y0); c.quadraticCurveTo(lerp(m.x0, mx, e), lerp(m.y0, my, e), x, y); c.stroke(); c.restore(); c.beginPath(); c.ellipse(x, y, 4.6, 5.8, 0, 0, TAU); c.fillStyle = '#EFE6CC'; c.fill(); c.lineWidth = 1; c.strokeStyle = '#1B1612'; c.stroke(); }
    if (E.per > 1 && typeof Lbl !== 'undefined') Lbl.put('hx-dot', this.w(H, 'labels', 'dot', { n: E.per }), tr.x + tr.w, tr.y - 18, { align: 'right', size: 13, c });
  },
  drawPins(H, c) {   // a pinned moth keeps its look for life: while it is on the bark it wears the halo; once gone it stays as a specimen card
    if (typeof Pin === 'undefined' || !Pin.list.length) return;
    const X = H.x, W = Stage.w, Hh = Stage.h, slot = {}, d = H.texD();
    const on = id => { for (const it of H.items) if (it.alive && it.ind.id === id && !(it.slide > 0)) return [it.x * W, it.y * Hh, 18]; return null; };
    let n = 0;
    for (const p of Pin.list) {
      if (on(p.id)) continue;
      const x = W - 34, y = this.hudH() + 100 + n * 64; n++; slot[p.id] = [x, y, 24];
      const spr = X.specimens[p.id] || (X.specimens[p.id] = p.ph ? this.sprite(H, p.ph, d, null, false, 1859) : null);
      c.save(); c.fillStyle = typeof Pal !== 'undefined' ? Pal.paper : '#E8DFC9'; rrect(c, x - 26, y - 24, 52, 48, 6); c.fill(); c.lineWidth = 1.5; c.strokeStyle = '#1B1612'; c.stroke();
      if (spr) c.drawImage(spr, x - spr.cw / 2, y - spr.ch / 2, spr.cw, spr.ch); c.restore();
    }
    Pin.draw(c, id => on(id) || slot[id] || null, id => { const out = []; for (const it of H.items) if (it.alive && it.ind.pa && it.ind.pa.indexOf(id) >= 0) out.push([it.x * W, it.y * Hh]); return out; });
  }
};
EXPORT.HuntX = HuntX;

/* ---------- the wraps (outermost: after ch99.js) ---------- */
{
  const H = Hunt, O = {};
  for (const k of ['start', 'mk', 'morning', 'tap', 'update', 'endRound', 'interlude', 'nextGen', 'finish', 'draw', 'panel', 'updPanel', 'notes', 'ensureBg']) O[k] = H[k];
  H.start = function (ch, o) { if (!isV2(ch)) { HuntX.clear(this); return O.start.apply(this, arguments); } return HuntX.start(this, ch, o || {}); };
  H.mk = function (g) { const ind = O.mk.apply(this, arguments); return isV2(this.ch) ? HuntX.tag(this, ind) : ind; };
  H.morning = function () { return isV2(this.ch) ? HuntX.morning(this) : O.morning.apply(this, arguments); };
  H.tap = function (x, y) { return isV2(this.ch) ? HuntX.tap(this, x, y) : O.tap.apply(this, arguments); };
  H.update = function (dt) { return isV2(this.ch) ? HuntX.update(this, dt) : O.update.apply(this, arguments); };
  H.endRound = function () { if (!isV2(this.ch)) return O.endRound.apply(this, arguments); if (this.state !== 'hunt') return; HuntX.preDusk(this); return O.endRound.apply(this, arguments); };
  H.interlude = function (rec) { return isV2(this.ch) ? HuntX.dusk(this, rec) : O.interlude.apply(this, arguments); };
  H.nextGen = function () { return isV2(this.ch) ? HuntX.nextGen(this) : O.nextGen.apply(this, arguments); };
  H.finish = function (o) { return isV2(this.ch) ? HuntX.finish(this, o) : O.finish.apply(this, arguments); };
  H.draw = function () { return isV2(this.ch) ? HuntX.draw(this) : O.draw.apply(this, arguments); };
  H.panel = function () { return isV2(this.ch) ? HuntX.hud(this) : O.panel.apply(this, arguments); };
  H.updPanel = function () { return isV2(this.ch) ? HuntX.hud(this) : O.updPanel.apply(this, arguments); };
  H.notes = function () { return isV2(this.ch) ? HuntX.notes(this) : O.notes.apply(this, arguments); };
  H.ensureBg = function () { return isV2(this.ch) ? HuntX.ensureBg(this) : O.ensureBg.apply(this, arguments); };
  Object.defineProperty(H, 'barkAt', { configurable: true, writable: true, enumerable: false, value: function (x, y) { return HuntX.barkAtN(this, x / Math.max(1, Stage.w), y / Math.max(1, Stage.h)); } });
  // pointer and key handlers exist only for a v2 chapter: for a legacy one these read undefined, so Stage calls tap() as before
  const input = { down(x, y) { HuntX.down(this, x, y); }, move(x, y) { HuntX.move(this, x, y); }, up(x, y) { HuntX.up(this, x, y); }, onKey(k, e) { HuntX.onKey(this, k, e); } };
  for (const k in input) Object.defineProperty(H, k, { configurable: true, enumerable: false, get() { return isV2(this.ch) && HuntX.live(this) ? input[k] : undefined; } });
  HuntX.live = h => typeof App !== 'undefined' && App.mode === h;
}
if (!Url.v1) {
  if (typeof document !== 'undefined' && document.head && document.createElement && !document.getElementById('ef-hunt')) {
    const st = document.createElement('style'); st.id = 'ef-hunt';
    st.textContent = '.hx-rule{display:flex;align-items:center;gap:8px;min-height:44px;padding:0 8px;font:600 14px/1 var(--fb);color:inherit}.hx-rule input{width:120px;min-height:44px;accent-color:var(--v-text,#E8DFC9)}.hx-rule output{font-family:var(--fm);min-width:3em}.hx-rule input:focus-visible{outline:2px solid var(--v-text,#E8DFC9);outline-offset:2px}';
    document.head.appendChild(st);
  }
  Hooks.exit.push(() => { const X = Hunt.x; if (X) { X.dk = null; X.press = null; X.focus = null; } });
}
