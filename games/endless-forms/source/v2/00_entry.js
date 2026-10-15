/* ================= v2 entry: act plan, wraps, level and end cards, Sim, Snap, Freezer, Replay, ResultCode =================
   Work package E4 (docs/design/API_v2.md §6.1, §10; D5 §5.4; D4 FCR-12; D2 §3, §9, §11).
   Load rule: top-level code here touches only legacy objects (core.js, ui.js, ch99.js) and 00_cvd. Pal, Fx, Live, Snd2 and
   LiveGraph sort later, so they are called only inside functions, behind typeof guards.
   Legacy is frozen: every wrap passes a chapter without v2 === true straight to the previous function (isV2, because
   legacy CH_NEST uses this.v2 as a counter). Under ?v1=1 this file defines its modules but rewrites and wraps nothing. */

/* ---------- the act plan (D2 §3, with D6: one Hardy–Weinberg chapter, no mixer, no human-population units) ----------
   Ids unchanged; every legacy id appears once. [id, title, subtitle, {spine, needs, appendix}]. In needs, a number is an
   act and a string a unit id; a unit's own needs override its act's. Retitles land with each rebuild (ch.plan, zz_v1switch). */
const ACT_PLAN = [
  { act: 0, n: 'The Wood', needs: [], c: [
    ['lichen', 'The Lichen Wood', 'Natural selection', { spine: 1 }]] },
  { act: 1, n: 'Ancestry and evidence', needs: [0], c: [
    ['tree', 'Tree Thinking', 'Phylogeny and convergence', { spine: 1 }],
    ['dig', 'The Dig', 'Fossils and deep time', {}]] },
  { act: 2, n: 'Heredity', needs: [0], c: [
    ['mendel', 'Mendel’s Garden', 'Inheritance and dominance', { spine: 1 }],
    ['scribe', 'The Scribe', 'Mutation', { spine: 1 }],
    ['cross', 'Crossing Over', 'Recombination and linkage', {}],
    ['fancier', 'The Fancier', 'Artificial selection', {}]] },
  { act: 3, n: 'The gene pool', needs: [2], c: [
    ['census', 'Equilibrium', 'Hardy–Weinberg and what breaks it', { spine: 1 }],
    ['royal', 'The Royal Line', 'X-linked inheritance', { needs: ['census'] }]] },
  { act: 4, n: 'Forces', needs: [3], c: [
    ['soot', 'The Black Country', 'A changing world', { spine: 1 }],
    ['casino', 'Drift Casino', 'Genetic drift', { spine: 1 }],
    ['castaways', 'The Castaways', 'Bottlenecks and genetic rescue', {}],   // founders now open Drift Casino L4 (Batch 1)
    ['tap', 'The Leaky Tap', 'Mutation–selection balance', { needs: ['soot'] }],
    ['swamp', 'Gene Swamping', 'Migration against selection', { needs: ['soot'] }]] },
  { act: 5, n: 'Adaptation and coevolution', needs: [4], c: [
    ['bitter', 'Bitter Wings', 'Mimicry', { spine: 1 }],
    ['jaws', 'Left Jaw, Right Jaw', 'Frequency-dependent selection', { spine: 1 }],
    ['hawks', 'Hawks and Doves', 'Evolutionarily stable strategies', { spine: 1 }],
    ['sieve', 'The Sieve', 'Three shapes of selection', {}],
    ['lock', 'Lock and Key', 'The Red Queen', {}],
    ['landscape', 'The Landscape', 'Peaks, valleys and epistasis', {}]] },
  { act: 6, n: 'Behaviour and life history', needs: [5], c: [
    ['forager', 'The Forager', 'Optimal foraging', { spine: 1 }],
    ['crowd', 'The Crowd', 'Choosing where to feed', {}],
    ['livefast', 'Live Fast', 'Life-history trade-offs', {}],
    ['plastic', 'Shape-shifters', 'Plasticity and reaction norms', {}]] },
  { act: 7, n: 'Sex', needs: [5], c: [
    ['sex', 'Why Sex?', 'Muller’s ratchet', { spine: 1 }],
    ['raffle', 'The Raffle', 'Sperm competition', { spine: 1 }],
    ['gametes', 'Two Sizes', 'Eggs and sperm', {}],
    ['lek', 'The Lek', 'Mate choice and honest signals', {}],
    ['brood', 'Fisher’s Brood', 'Sex ratio', {}],
    ['spindle', 'The Selfish Spindle', 'Meiotic drive', {}],
    ['meadow', 'The Meadow', 'Pollinators and plant mating', {}]] },
  { act: 8, n: 'Cooperation and conflict', needs: [6, 7], c: [
    ['alarm', 'Alarm Call', 'Kin selection', { spine: 1 }],
    ['commons', 'The Commons', 'Levels of selection', { spine: 1 }],
    ['nest', 'The Nest', 'Parents and offspring', {}],
    ['bats', 'Blood Debts', 'Reciprocal altruism', {}],
    ['many', 'Many Become One', 'Multicellularity', {}],
    ['guest', 'The Guest', 'Symbiosis and mutualism', {}]] },
  { act: 9, n: 'Genomes and development', needs: [1, 4], c: [
    ['switch', 'Switches', 'Evo-devo', { spine: 1 }],
    ['coal', 'The Coalescent', 'Common ancestry', { spine: 1 }],
    ['copy', 'Copy and Paste', 'Jumping genes and duplication', {}],
    ['sweep', 'The Sweep', 'Selective sweeps', {}],
    ['clock', 'The Clock', 'Neutral evolution', {}]] },
  { act: 10, n: 'Species and macroevolution', needs: [1, 4, 5], c: [
    ['river', 'The River', 'Allopatric speciation', { spine: 1 }],
    ['arch', 'The Archipelago', 'Radiation and competition', { spine: 1 }],
    ['fruits', 'Two Fruits', 'Sympatric speciation', {}],
    ['ring', 'The Ring', 'Ring species', {}],
    ['double', 'Doubling', 'Polyploid speciation', {}]] },
  { act: 11, n: 'Applied evolution', needs: [9, 10], c: [
    ['clinic', 'The Clinic', 'Antibiotic resistance', { spine: 1, needs: [4] }],
    ['virulence', 'The Pathogen', 'Evolution of virulence', {}]] },
  { act: null, n: 'Appendix: the field guide', needs: [], c: [
    ['web', 'The Food Web', 'Trophic cascades', { appendix: 1 }],
    ['islands', 'Islands', 'Island biogeography', { appendix: 1 }],
    ['fire', 'After the Fire', 'Succession', { appendix: 1 }]] }
];   // 52 ids: 48 legacy + royal, tap, swamp, dig

/* ---------- Snap: sim state ⇄ JSON string, exact (typed arrays and their expandos, NaN, ±Infinity, −0) ----------
   A typed array becomes {"$f32": [...]} (also $f64 $i8 $u8 $c8 $i16 $u16 $i32 $u32), with any expandos (Gen's g.id, g.pa,
   g.lin) under "x". A non-finite number or −0 becomes {"$n": "NaN" | "Infinity" | "-Infinity" | "-0"}. Functions are dropped,
   as in JSON. Doubles survive JSON exactly, and a float32 widened to a double does too, so the round trip is bit-exact. */
const Snap = {
  _T: { Float32Array: '$f32', Float64Array: '$f64', Int8Array: '$i8', Uint8Array: '$u8', Uint8ClampedArray: '$c8', Int16Array: '$i16', Uint16Array: '$u16', Int32Array: '$i32', Uint32Array: '$u32' },
  _C: { $f32: Float32Array, $f64: Float64Array, $i8: Int8Array, $u8: Uint8Array, $c8: Uint8ClampedArray, $i16: Int16Array, $u16: Uint16Array, $i32: Int32Array, $u32: Uint32Array },
  enc(obj) { return JSON.stringify(this._pack(obj)); },
  dec(str) { return this._unpack(JSON.parse(str)); },
  _num(v) { return v !== v ? { $n: 'NaN' } : v === Infinity ? { $n: 'Infinity' } : v === -Infinity ? { $n: '-Infinity' } : v === 0 && 1 / v < 0 ? { $n: '-0' } : v; },
  _pack(v) {
    if (typeof v === 'number') return this._num(v);
    if (typeof v === 'function' || typeof v === 'symbol' || v === undefined) return undefined;
    if (v === null || typeof v !== 'object') return v;
    const tag = ArrayBuffer.isView(v) ? this._T[Object.prototype.toString.call(v).slice(8, -1)] : null;
    if (tag) {
      const o = { [tag]: Array.from(v, x => this._num(x)) }, ks = Object.keys(v);
      if (ks.length > v.length) { const x = {}; for (const k of ks) if (!/^\d+$/.test(k)) x[k] = v[k]; o.x = this._pack(x); }
      return o;
    }
    if (Array.isArray(v)) return v.map(x => { const p = this._pack(x); return p === undefined ? null : p; });
    if (typeof v.toJSON === 'function') return this._pack(v.toJSON());
    const o = {}; for (const k of Object.keys(v)) { const p = this._pack(v[k]); if (p !== undefined) o[k] = p; }
    return o;
  },
  _unpack(v) {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(x => this._unpack(x));
    const ks = Object.keys(v);
    if (ks.length === 1 && ks[0] === '$n') return v.$n === '-0' ? -0 : Number(v.$n);
    const tag = ks.find(k => this._C[k]);
    if (tag && ks.length <= 2 && (ks.length === 1 || ks.indexOf('x') >= 0)) {
      const a = this._C[tag].from(v[tag], x => this._unpack(x));
      if (v.x) Object.assign(a, this._unpack(v.x));
      return a;
    }
    const o = {}; for (const k of ks) o[k] = this._unpack(v[k]);
    return o;
  }
};

/* ---------- Sim: the fixed-step driver of every v2 chapter (API_v2 §6.1, §9.3) ----------
   A run is (seed, level, actions). Each action is logged as [tick, a], where tick counts the steps taken so far, and is
   applied before step number tick, as tests/vmgame.js runSim does. A finished sim (result() not null) never steps again,
   so a live run, its replay and the headless bots stay in step. While a replay queue is pending, live input is dropped.
   View events reach the chapter through Sim.run only: a live Sim.act's events are handed out again by the next run, the
   same place a replayed action's events appear, so juice from Sim.run looks the same live and in a replay. */
const Sim = {
  _st: new WeakMap(),   // ch → {tick, acc, queue, log, thaw}
  _get(ch) { let st = this._st.get(ch); if (!st) { st = { tick: 0, acc: 0, queue: [], log: [], thaw: false, pend: [] }; this._st.set(ch, st); } return st; },
  start(ch, n, o) {   // App.seed is already set; sim.reset(level, o) handles o.thaw itself
    o = o || {}; const st = this._get(ch), sim = ch.sim;
    ch.level = n | 0; st.tick = 0; st.acc = 0; st.log = []; st.thaw = !!o.thaw; st.pend = [];
    st.queue = Array.isArray(o.replay) ? o.replay.filter(e => Array.isArray(e) && e.length >= 2).map(e => [e[0] | 0, e[1]]) : [];
    if (sim && typeof sim.reset === 'function') { sim.reset(ch.level, o); if (sim.s && !Array.isArray(sim.s.log)) sim.s.log = []; }
    return st;
  },
  run(ch, dt) {   // → view events; ≤ 8 ticks per call, a larger backlog is dropped rather than allowed to spiral
    // Live actions' events (from Sim.act since the last call) come first, so view code juices from Sim.run alone and a
    // live run and its replay (where queued actions are applied inside run) produce the same events in the same order.
    const sim = ch.sim, st = this._get(ch), ev = st.pend.length ? st.pend.splice(0) : [];
    if (!sim || typeof sim.step !== 'function' || !sim.s) return ev;
    const h = sim.dt || 1 / 30; let n = 0;
    st.acc += Math.max(0, +dt || 0);
    while (st.acc >= h) {
      if (n >= 8) { st.acc = 0; break; }
      st.acc -= h;
      while (st.queue.length && st.queue[0][0] <= st.tick) this._push(ev, this._apply(ch, st, st.queue.shift()[1]));
      if (this.done(ch)) { st.acc = 0; break; }
      this._push(ev, sim.step(h)); st.tick++; n++;
    }
    return ev;
  },
  act(ch, a) {   // → the sim's view events for this action (for inspection); the next Sim.run delivers them again for juice
    const st = this._get(ch);
    if (st.queue.length) return [];
    const ev = this._apply(ch, st, a); this._push(st.pend, ev); return ev;
  },
  tick(ch) { return this._get(ch).tick; },
  log(ch) { const s = ch.sim && ch.sim.s; return s && Array.isArray(s.log) ? s.log : this._get(ch).log; },   // a Hunt chapter without a sim logs here
  replaying(ch) { return this._get(ch).queue.length > 0; },
  thawed(ch) { return this._get(ch).thaw; },
  done(ch) { const sim = ch.sim; return !!(sim && sim.s && typeof sim.result === 'function' && sim.result()); },
  _apply(ch, st, a) {
    this.log(ch).push([st.tick, a]);
    if (typeof Events !== 'undefined' && Events.emit) Events.emit('act', { a });
    const sim = ch.sim; return sim && sim.s && typeof sim.act === 'function' ? sim.act(a) || [] : [];
  },
  _push(ev, list) { if (list && list.length) for (const e of list) ev.push(e); }
};

/* ---------- Freezer: session memory of frozen generations, ≤ 8 vials per unit (D1 G9; [B0-simple]) ----------
   Each vial remembers the level and seed it came from. list(id) gives the vials of the unit's current level; a fresh,
   non-thaw start of a level empties that level's vials (the App.playLevel wrap below), so What if? always thaws this run.
   put() ignores a snapshot taken once the sim has finished (it could only thaw into the same end card) unless o.force is set:
   a unit whose levers change the ending may freeze its final state (Batch 1). */
const Freezer = {
  max: 8, _v: {},
  _lv(id, level) { if (level != null) return level | 0; const ch = REG[id]; return ch && ch.level != null ? ch.level | 0 : 0; },
  put(id, gen, snap, o) {
    const L = this._v[id] || (this._v[id] = []), level = this._lv(id), i = L.findIndex(v => v.level === level && v.gen === gen);
    if (REG[id] && Sim.done(REG[id]) && !(o && o.force)) return L.length;
    if (i >= 0) L.splice(i, 1);
    L.push({ gen, snap, level, seed: App.seed });
    while (L.length > this.max) L.shift();
    return L.length;
  },
  list(id, level) { const lv = this._lv(id, level); return (this._v[id] || []).filter(v => v.level === lv).map(v => ({ gen: v.gen, snap: v.snap })); },
  clear(id, level) { if (level == null) delete this._v[id]; else if (this._v[id]) this._v[id] = this._v[id].filter(v => v.level !== (level | 0)); },
  thaw(id, gen, lever) {   // → true when a vial was found and its level restarted with one lever changed
    const ch = REG[id], lv = this._lv(id), v = (this._v[id] || []).filter(x => x.level === lv && x.gen === gen).pop();
    if (!ch || !v) return false;
    App.playLevel(ch, v.level, { seed: v.seed == null ? undefined : v.seed, thaw: { gen: v.gen, snap: v.snap, lever } });
    if (typeof Events !== 'undefined' && Events.emit) Events.emit('whatif', { gen: v.gen, lever });
    return true;
  }
};

/* ---------- Replay: 'R1.' + base64url(JSON [seed, level, log]) ---------- */
const Replay = {
  encode(seed, level, log) { return 'R1.' + Save._b64e(Save._utf8e(JSON.stringify([seed >>> 0, level | 0, log || []]))); },
  decode(code) {   // → {seed, level, log} | null
    try {
      const m = /^R1\.([A-Za-z0-9_-]+)$/.exec(String(code == null ? '' : code).replace(/\s+/g, '')); if (!m) return null;
      const a = JSON.parse(Save._utf8d(Save._b64d(m[1])));
      if (!Array.isArray(a) || a.length !== 3 || !Number.isInteger(a[0]) || !Number.isInteger(a[1]) || a[1] < 0 || !Array.isArray(a[2])) return null;
      if (!a[2].every(e => Array.isArray(e) && e.length === 2 && Number.isInteger(e[0]) && e[0] >= 0)) return null;
      return { seed: a[0] >>> 0, level: a[1], log: a[2] };
    } catch (e) { return null; }
  },
  play(ch, code) { const r = this.decode(code); if (!r || !ch) return false; App.playLevel(ch, r.level, { seed: r.seed, replay: r.log }); return true; }
};

/* ---------- ResultCode: 30 bits ⇄ six Crockford base-32 characters, shown "K7M 2QX" ([B0-simple]) ---------- */
const ResultCode = {
  A: '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
  make(bits) { let b = (bits >>> 0) & 0x3fffffff, s = ''; for (let i = 0; i < 6; i++) { s = this.A[b & 31] + s; b >>>= 5; } return s; },
  show(code) { const c = String(code); return c.slice(0, 3) + ' ' + c.slice(3); },
  read(str) {   // → bits | null; case, spaces and hyphens ignored; I and L read as 1, O as 0
    const t = String(str == null ? '' : str).toUpperCase().replace(/[\s-]+/g, '').replace(/[IL]/g, '1').replace(/O/g, '0');
    if (!/^[0-9A-HJKMNP-TV-Z]{6}$/.test(t)) return null;
    let b = 0; for (const c of t) b = b * 32 + this.A.indexOf(c);
    return b;
  }
};

/* ---------- Entry: v2 entry, Begin into the Wood, and the v2 level and end cards (FCR-12, D4 §6.1) ---------- */
const Entry = {
  begin: false,                 // set by the capture listener on #btn-begin; consumed by the next App.go
  STARS: [[1, 'discover', 'Discover'], [2, 'predict', 'Predict'], [4, 'transfer', 'Transfer']],
  STAR_PATH: 'M12 2.6l2.8 6 6.6.7-4.9 4.5 1.4 6.5L12 17l-5.9 3.3 1.4-6.5-4.9-4.5 6.6-.7z',   // the same star as ui.js starSVG
  enter(ch, n, o) { if (typeof Save.migrate === 'function') Save.migrate(ch.id); App.playLevel(ch, n || 0, o); },
  // where a unit opened from the menu starts: just past the furthest level finished, or L1 once the unit is done (Batch 1)
  resume(ch) {
    const n = (ch && ch.levels && ch.levels.length) || 1, d = Save.d || {}, lv = (d.lv && d.lv[ch.id]) || [];
    if (d.done && d.done[ch.id]) return 0;
    return Math.max(0, Math.min(n - 1, lv.length));
  },
  next(ch) { const i = ORDER.indexOf(ch.id); for (let k = i + 1; k < ORDER.length; k++) if (REG[ORDER[k]]) return REG[ORDER[k]]; return null; },
  calm() {
    if (typeof Fx !== 'undefined') return !!Fx.calm;
    try { return !!(Save.d.ui && Save.d.ui.calm) || !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  },
  esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); },
  pop(m) { return (m & 1) + (m >> 1 & 1) + (m >> 2 & 1); },
  split(text, max) {   // → chunks of ≤ max words, broken at sentence ends where possible; a stop inside a number (11.5) is not an end
    const t = String(text || '').trim(), out = [], sents = t ? t.split(/(?<=[.!?]["'’”)]*)\s+/) : [];
    let cur = [];
    const flush = () => { if (cur.length) out.push(cur.join(' ')); cur = []; };
    for (const s of sents) {
      const w = s.trim().split(/\s+/).filter(Boolean);
      if (cur.length + w.length > max) flush();
      while (w.length > max) out.push(w.splice(0, max).join(' '));
      cur = cur.concat(w);
    }
    flush(); return out;
  },
  model(ch, level) {   // the MODEL card in force at this level: the latest card whose level ≤ level
    const M = (ch.content && ch.content.model) || []; let best = null;
    for (const m of M) if (m && (m.level | 0) <= level && (!best || (m.level | 0) >= (best.level | 0))) best = m;
    return best;
  },
  chunks(ch, level, why) {   // Why?: In nature, The maths, then the level's MODEL card, each ≤ 60 words
    const W = why || (ch.content && ch.content.why) || {}, out = [];
    const add = (h, txt, extra) => this.split(txt, 60).forEach((t, i) => out.push(Object.assign({ h, t }, i ? {} : extra)));
    for (const t of [].concat(W.real || [])) add('In nature', t);
    for (const t of [].concat(W.maths || [])) add('The maths', t);
    const M = this.model(ch, level);
    if (M) {
      add('The model', [M.simulated, M.simplification].filter(Boolean).join(' '), { params: M.params || [], contested: !!M.contested });
      if (M.cannot) add('What it cannot show', M.cannot);
      if (M.nature) add('In nature', M.nature);
    }
    return out;
  },
  paramChip(p) {   // D4: an ×N chip on every unrealistic parameter
    const tag = p.tag === 'xN' ? '×N' : p.tag || '', real = p.tag === 'xN' && p.real != null ? ', real ' + p.real : '';
    return '<span class="pchip' + (p.tag === 'xN' ? ' xn' : '') + '">' + this.esc(p.name + ' ' + p.value) + ' <i>' + this.esc(tag + real) + '</i></span>';
  },
  starsHTML(now, fresh) {   // three named vector stars; the newly earned ones start hollow and count up
    const got = this.STARS.filter(s => now & s[0]).map(s => s[2]), n = got.length;
    const label = n + ' of 3 stars' + (n ? ': ' + got.join(', ') : '');
    return '<div class="ef-stars stars-i" role="img" aria-label="' + this.esc(label) + '">' + this.STARS.map(([b, k, name]) =>
      '<span class="ef-star" data-bit="' + b + '"><svg class="star' + (now & b && !(fresh & b) ? '' : ' off') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="' + this.STAR_PATH + '"/></svg><small>' + name + '</small></span>').join('') + '</div>';
  },

  /* End.show(ch, o) for a v2 chapter. o = {level, mask, final, title?, take?, body?, chart?: cv => void | LiveGraph spec,
     interesting?: key, whatIf?: {gen, levers: [key…]}, why?: {real, maths}, stars?: {discover, predict, transfer}, bodyFirst?}.
     Records the stars, then opens the card. Per-level words (Batch 1): when o.take, o.body or o.why is undefined on a level
     card of a fresh (not thawed) run, content.levelTake[level], levelBody[level] and levelWhy[level] fill in; the "still to
     earn" line reads o.stars, else content.levelStars[level], else content.stars, so it names only stars this level can give. */
  show(ch, o) {
    o = o || {};
    const C = ch.content || {}, L = ch.levels || [], level = Math.max(0, o.level != null ? o.level | 0 : ch.level | 0);
    const final = o.final != null ? !!o.final : level >= L.length - 1, mask = (o.mask | 0) & 7, d = Save.d;
    const prev = (d.s2 && d.s2[ch.id]) | 0;
    const stars = typeof Save.star2 === 'function' ? Save.star2(ch.id, level, mask) : (Save.star(ch.id, this.pop(mask)), d.stars[ch.id] || 0);
    const now = ((d.s2 && d.s2[ch.id]) | 0) || mask, fresh = now & ~prev;
    if (typeof Events !== 'undefined' && Events.emit) { Events.emit('level', { n: level, mask }); if (fresh) Events.emit('star', { mask: fresh, stars }); }
    if (final) { d.done = d.done || {}; d.done[ch.id] = 1; Save.save(); }

    const E = this.esc.bind(this), lvName = L[level] && L[level].name;
    const ik = o.interesting, itext = ik && C.interesting && C.interesting[ik];
    const per = (k, alt) => {   // o.take / o.body / o.why, else content.levelTake / levelBody / levelWhy [level] on a fresh level card
      if (o[k] !== undefined) return o[k];
      const list = C['level' + k[0].toUpperCase() + k.slice(1)];
      return !final && !Sim.thawed(ch) && Array.isArray(list) && list[level] != null ? list[level] : alt;
    };
    const take = per('take', null) != null ? per('take', null) : final ? C.take : null;
    let body = per('body', null) != null ? per('body', null) : final ? C.body : null;
    if (body == null && o.insight) body = String(o.insight).replace(/<[^>]*>/g, '');   // a legacy-shaped call
    const title = o.title || (final ? 'Unit complete' : 'Level ' + (level + 1) + ' done');
    const kick = final ? ch.title : lvName;
    const SL = o.stars || (Array.isArray(C.levelStars) && C.levelStars[level]) || C.stars;
    const miss = this.STARS.find(s => !(now & s[0]) && SL && SL[s[1]]);
    const chunks = this.chunks(ch, level, per('why', undefined));
    const vial = o.whatIf && Array.isArray(o.whatIf.levers) && o.whatIf.levers.length && Freezer.list(ch.id, level).some(v => v.gen === o.whatIf.gen) ? o.whatIf : null;
    const code = typeof ch.resultBits === 'function' && Url.unit === ch.id && Url.seed != null ? this.code(ch, level) : null;
    const uid = 'ef' + (++this._uid);

    let h = '<h3 id="' + uid + 'h">' + E(title) + '</h3>' + (kick ? '<p class="kicker">' + E(kick) + '</p>' : '') + this.starsHTML(now, fresh);
    if (miss) h += '<p class="still"><b>' + E(miss[2]) + ':</b> ' + E(SL[miss[1]]) + '</p>';
    if (itext) h += '<p class="interesting" id="' + uid + 'd"><b>Interesting result.</b> ' + E(itext) + '</p>';
    else if (take) h += '<p class="take" id="' + uid + 'd">' + E(take) + '</p>';
    if (body && o.bodyFirst) h += '<p class="body">' + E(body) + '</p>';   // bodyFirst: the words above the chart, in view on a phone
    if (o.chart) h += '<canvas role="img" aria-label="' + E(o.chartLabel || 'Graph of this level') + '"></canvas>';
    if (body && !o.bodyFirst) h += '<p class="body">' + E(body) + '</p>';
    if (chunks.length) h += '<div class="why" id="' + uid + 'w" hidden></div>';
    if (vial) h += '<div class="chips" id="' + uid + 'c" hidden>' + vial.levers.map(k => '<button type="button" class="chip" data-lever="' + E(k) + '">' + E((C.levers && C.levers[k]) || k) + '</button>').join('') + '</div>';
    if (code) h += '<div class="coderow"><span>Result code</span><b class="code">' + E(ResultCode.show(code)) + '</b><button type="button" class="btn" data-copy="' + code + '">Copy</button></div>';

    let box = null;
    const btnsOf = () => [...box.querySelector('.card-btns').children];
    const toggle = (sel, btnText) => {   // an opened panel scrolls into view: on a phone it opens under the sticky buttons
      const el = box.querySelector(sel), b = btnsOf().find(x => x.textContent === btnText); if (!el) return; el.hidden = !el.hidden; if (b) b.setAttribute('aria-expanded', String(!el.hidden));
      if (!el.hidden) setTimeout(() => { try { if (!el.hidden && el.scrollIntoView) el.scrollIntoView({ block: 'center', behavior: 'auto' }); } catch (e) { } }, 30);
      return el;
    };
    const why = { t: 'Why?', fn: () => { const el = toggle('.why', 'Why?'); if (el && !el.hidden) this.whyPage(el, chunks, 0); } };
    const whatIf = { t: 'What if?', fn: () => toggle('.chips', 'What if?') };
    const nx = final ? this.next(ch) : null, btns = [];
    if (final) {
      if (nx) btns.push({ t: 'Notebook', fn: () => App.exit() });
      if (chunks.length) btns.push(why);
      if (vial) btns.push(whatIf);
      btns.push(nx ? { t: 'Next unit', primary: true, fn: () => { Cards.close(); App.open(nx); } } : { t: 'Notebook', primary: true, fn: () => App.exit() });
    } else {
      if (chunks.length) btns.push(why);
      if (vial) btns.push(whatIf);
      btns.push({ t: 'Replay level', fn: () => this.enter(ch, level) });
      btns.push({ t: 'Next level', primary: true, fn: () => this.enter(ch, level + 1) });
    }
    box = Cards.open({ cls: final ? 'end v2' : 'lvl v2', html: h, buttons: btns, onOpen: b => this.drawChart(b, o.chart) });

    box.dataset.stars = String(stars); box.dataset.level = String(level);
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-labelledby', uid + 'h');
    if (itext || take) box.setAttribute('aria-describedby', uid + 'd');
    const log = ch.sim && ch.sim.s && Array.isArray(ch.sim.s.log) ? ch.sim.s.log : null;
    if (log && App.seed != null && !Sim.thawed(ch)) box.dataset.replay = Replay.encode(App.seed, level, log);
    const bs = btnsOf(), primary = bs[bs.length - 1];
    for (const b of bs) {
      const ctl = b.textContent === 'Why?' ? uid + 'w' : b.textContent === 'What if?' ? uid + 'c' : null;
      if (ctl) { b.setAttribute('aria-controls', ctl); b.setAttribute('aria-expanded', 'false'); }
    }
    if (primary && !final && L[level + 1]) primary.setAttribute('aria-label', 'Next level: ' + L[level + 1].name);
    if (primary && nx) primary.setAttribute('aria-label', 'Next unit: ' + nx.title);
    box.querySelectorAll('.chip[data-lever]').forEach(b => b.addEventListener('click', () => { if (box.dataset.armed === '1') { Snd.click(); Freezer.thaw(ch.id, vial.gen, b.dataset.lever); } }));
    const cp = box.querySelector('[data-copy]');   // the whisper is hidden under cards, so the button itself confirms
    if (cp) cp.addEventListener('click', () => { if (box.dataset.armed !== '1') return; copyText(cp.dataset.copy); cp.textContent = 'Copied'; if (typeof Live !== 'undefined' && Live.say) Live.say('Code copied.'); });

    this.countUp(box, fresh, itext);
    if (typeof Live !== 'undefined' && Live.say) Live.say(title + '. ' + stars + ' of 3 stars.');
    setTimeout(() => { try { if (Cards.isOpen() && document.querySelector('#cards .card') === box && primary) primary.focus({ preventScroll: true }); } catch (e) { } }, 400);   // after the ghost-tap guard arms the card
    return box;
  },
  _uid: 0,
  code(ch, level) { try { return ResultCode.make(ch.resultBits(ch.sim ? ch.sim.s : null, level)); } catch (e) { return null; } },
  drawChart(box, chart) {
    const cv = box.querySelector('canvas'); if (!cv || !chart) return;
    try { if (typeof chart === 'function') chart(cv); else if (chart.type && Hooks.chart) Hooks.chart(cv, chart, 'paper'); else if (chart.draw) chart.draw(cv, 'paper'); }
    catch (e) { cv.remove(); showErr(e); }
  },
  countUp(box, fresh, interesting) {   // D4 §5.1: new stars land 180 ms apart on rising notes, 700 ms in all; Calm: at once, no pop
    const bits = this.STARS.map(s => s[0]).filter(b => fresh & b), notes = [523.25, 659.25, 783.99], quiet = Url.projector;
    const land = (b, i, popIt) => {
      const st = box.querySelector('.ef-star[data-bit="' + b + '"]'), svg = st && st.firstChild; if (!svg) return;
      svg.classList.remove('off'); if (popIt) svg.classList.add('pop');
      if (!quiet) Snd.tone(notes[i % 3], 0.5, 'sine', 0.06);
    };
    if (!bits.length) { if (quiet) return; if (interesting && typeof Snd2 !== 'undefined') Snd2.play('interesting'); else Snd.chime(); return; }
    if (typeof Snd2 !== 'undefined' && Snd2.buzz) Snd2.buzz('star');
    const run = gap => bits.forEach((b, i) => { if (!gap) land(b, i, false); else setTimeout(() => land(b, i, true), 120 + i * gap); });
    if (this.calm()) run(0);
    else if (typeof Fx !== 'undefined' && Fx.tier) Fx.tier(3, ms => run(ms >= 600 ? 180 : 60));   // T3 at most once per 3 s, else the short version
    else run(180);
  },
  whyPage(el, chunks, i) {   // one ≤ 60-word chunk at a time, with previous and next
    const k = chunks[i], E = this.esc.bind(this), n = chunks.length; if (!k) return;
    el.innerHTML = '<h4>' + E(k.h) + (k.contested ? ' <span class="contested">Contested</span>' : '') + '</h4><p>' + E(k.t) + '</p>' +
      (k.params && k.params.length ? '<div class="pchips">' + k.params.map(p => this.paramChip(p)).join('') + '</div>' : '') +
      (n > 1 ? '<div class="why-nav">' + this.navBtn(-1, 'Previous part', i > 0) + '<span class="mono">' + (i + 1) + ' of ' + n + '</span>' + this.navBtn(1, 'Next part', i < n - 1) + '</div>' : '');
    el.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { this.whyPage(el, chunks, i + +b.dataset.go); const f = el.querySelector('[data-go="' + b.dataset.go + '"]:not([disabled])') || el.querySelector('[data-go]:not([disabled])'); if (f) f.focus(); }));
  },
  navBtn(dir, label, on) {   // D4 rule 9: arrows are vector icons, not font glyphs
    return '<button type="button" class="btn" data-go="' + dir + '" aria-label="' + label + '"' + (on ? '' : ' disabled') + '><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="' + (dir < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
  },
  css: '.card.v2 [hidden]{display:none!important}' +
    ':is(.card.lvl,.card.end).v2 .card-btns{gap:8px}:is(.card.lvl,.card.end).v2 .card-btns .btn{flex:1 1 auto;padding:11px 12px}' +   // secondaries share a row; a wrapped primary spans the next
    '.card.v2 .ef-stars{display:flex;gap:20px;margin:6px 0 6px}' +
    '.card.v2 .ef-star{display:flex;flex-direction:column;align-items:center;gap:2px;font:600 12px/1.2 var(--fb);color:var(--ink2)}' +
    '.card.v2 .ef-star small{font-size:12px}' +
    '.card.v2 .ef-star .star{width:36px;height:36px;transform-origin:50% 50%}' +
    '.card.v2 .star.pop{animation:ef-pop .34s cubic-bezier(.34,1.56,.64,1)}' +
    '@keyframes ef-pop{0%{transform:scale(.3)}100%{transform:scale(1)}}' +
    'body.calm .card.v2 .star.pop{animation:none}@media (prefers-reduced-motion:reduce){.card.v2 .star.pop{animation:none}}' +
    '.card.v2 .still{font-size:14px;color:var(--ink2)}' +
    '.card.v2 .why{border-top:1px solid rgba(41,33,27,.18);margin-top:8px;padding-top:8px}.card.v2 .why h4{margin:0 0 4px}' +
    '.card.v2 .why-nav{display:flex;align-items:center;gap:10px}.card.v2 .why-nav .btn{display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;padding:0 10px}' +
    '.card.v2 .pchips{display:flex;flex-wrap:wrap;gap:6px;margin:2px 0 8px}' +
    '.card.v2 .pchip{border:1.5px solid var(--ink);border-radius:12px;padding:2px 9px;font:500 13px/1.4 var(--fm)}.card.v2 .pchip i{font-style:normal;color:var(--ink2)}' +
    '.card.v2 .pchip.xn i{color:var(--ink);font-weight:700}' +
    '.card.v2 .contested{border:1.5px dashed var(--ink);border-radius:12px;padding:1px 8px;font:600 12px var(--fb);vertical-align:2px}' +
    '.card.v2 .coderow{display:flex;align-items:center;gap:12px;min-height:36px;margin:6px 0}.card.v2 .coderow span{font-size:13px;color:var(--ink2)}'
};

/* ---------- wiring (skipped under ?v1=1, which is the legacy game) ---------- */
if (!Url.v1) {
  // PLAN rewrite: the acts replace the legacy sections in place; boot.js applies PLAN_ADD and recomputes ORDER afterwards
  {
    const ids = PLAN.flatMap(p => p.c.map(c => c[0])), mine = ACT_PLAN.flatMap(p => p.c.map(c => c[0]));
    const missing = ids.filter(id => mine.indexOf(id) < 0), twice = mine.filter((id, i) => mine.indexOf(id) !== i);
    if (missing.length || twice.length) throw new Error('ACT_PLAN: ' + (missing.length ? 'missing ' + missing.join(', ') : '') + (twice.length ? ' twice ' + twice.join(', ') : ''));
    PLAN.length = 0;
    for (const p of ACT_PLAN) PLAN.push({ act: p.act, n: p.n, needs: p.needs.slice(), c: p.c.map(e => e.slice()) });   // copies: retitles never touch ACT_PLAN
    ORDER.length = 0; PLAN.forEach(p => p.c.forEach(c => ORDER.push(c[0])));
  }
  // App.open, outermost (after ch99's TRANSFER/RECALL wrap): a v2 unit skips the intro and question cards
  { const prev = App.open; App.open = function (ch) { if (!isV2(ch)) return prev.apply(this, arguments); Entry.enter(ch, Entry.resume(ch)); }; }
  // End.show: a v2 chapter gets the level or end card (ch99's TAKE wrap is bypassed, so done is set here)
  { const prev = End.show; End.show = function (ch, o) { if (!isV2(ch)) return prev.apply(this, arguments); return Entry.show(ch, o); }; }
  // App.playLevel: a fresh (non-thaw) start of a v2 level empties that level's freezer vials
  { const prev = App.playLevel; App.playLevel = function (ch, n, o) { if (isV2(ch) && !(o && o.thaw)) Freezer.clear(ch.id, n || 0); return prev.apply(this, arguments); }; }
  // Begin (D2 §9): straight into the live Wood while it is unfinished and rebuilt; exiting the Wood still reaches the menu
  {
    const prev = App.go;
    App.go = function (scr) {
      const b = Entry.begin; Entry.begin = false;
      const w = REG.lichen;
      if (b && scr === 'menu' && isV2(w) && !(Save.d.done && Save.d.done.lichen)) return Entry.enter(w, Entry.resume(w));
      return prev.apply(this, arguments);
    };
    const btn = typeof document !== 'undefined' && document.getElementById ? document.getElementById('btn-begin') : null;
    if (btn && btn.addEventListener) btn.addEventListener('click', () => { Entry.begin = true; }, true);
  }
  if (typeof document !== 'undefined' && document.head && document.createElement && !document.getElementById('ef-entry')) {
    const st = document.createElement('style'); st.id = 'ef-entry'; st.textContent = Entry.css; document.head.appendChild(st);
  }
}
Object.assign(EXPORT, { ACT_PLAN, Entry, Sim, Snap, Freezer, Replay, ResultCode });
