/* ================= v2/01_scenes.js: rung-0 scenes, Petri and Strata (D4 §4.3; D3 Scribe and Dig; API_v2 §8.3) =================
   Work package E6. Petri: agar plates (top down), a 5 × 4 plate grid with count pills, the velvet replica-plating stamp,
   Erlenmeyer flasks with a six-step turbidity ramp and a 4 × 3 rack. Strata: a cliff section of patterned layers with
   fossils and torn unconformities, a zircon decay clock, a log-time ruler with "≈" joins and a range chart (found solid,
   inferred hatched). Everything is drawn in the Field Plate style: ink outlines, luminance and pattern rather than hue
   (amber against agar is 1.5:1, so a variant colony is carried by its second ring, D4 §4.3). Canvas words go through
   Lbl.put. Nothing here draws R(); colony and layer jitter come from a hash, so a scene is a pure function of its spec.
   Load rule: 01_rig sorts first, so Rig may be used inside functions (fossils); Lbl, Fx and Pal are read inside functions
   behind typeof guards. Nothing is wired to a hook, so legacy runs and ?v1=1 are untouched. */

const SceneKit = (() => {
  const INK = '#1B1612', PAPER = '#E8DFC9', AGAR = '#EDE3C8', AGAR2 = '#D9CCA8';
  const pal = (k, d) => typeof Pal !== 'undefined' && Pal[k] ? Pal[k] : d;
  const calm = () => typeof Fx !== 'undefined' && !!Fx.calm;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : 0);
  const hrnd = s => { let h = (s >>> 0) || 1; return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; }; };   // cosmetic, from a hash
  const label = (c, id, text, x, y, o) => { if (typeof Lbl !== 'undefined') return Lbl.put(id, text, x, y, Object.assign({ c }, o)); return null; };   // words on the canvas being drawn
  const hatch = (c, x, y, w, h, col, gap, lw) => { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.beginPath(); for (let k = -h; k < w + h; k += gap) { c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); } c.lineWidth = lw || 1; c.strokeStyle = col; c.stroke(); c.restore(); };
  const ease = t => 1 - (1 - t) * (1 - t) * (1 - t);
  return { INK, PAPER, AGAR, AGAR2, pal, calm, now, hrnd, label, hatch, ease };
})();

/* ================= Petri ================= */
const Petri = {
  _cache: new Map(),
  /* agar disc on the paper plate. o.colonies [{x, y, variant, r}] with x, y in plate units (−1…1 from the centre), o.count
     (a pill ≥ 14 px; true = the number of colonies), o.jackpot (dashed ring and a bold count), o.drug (the plate is hatched
     at the rim: a selective plate), o.label. Colonies are cached per plate spec, so a 20-plate grid stays one blit each. */
  plate(c, x, y, r, o) {
    o = o || {}; const K = SceneKit, cols = o.colonies || [], ink = K.INK;
    c.save();
    c.beginPath(); c.arc(x, y, r + 3, 0, TAU); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = ink; c.stroke();   // the glass dish
    c.beginPath(); c.arc(x, y, r, 0, TAU); c.fillStyle = K.AGAR; c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.35)'; c.stroke();
    if (o.drug) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.arc(x, y, r * 0.86, 0, TAU, true); c.clip(); K.hatch(c, x - r, y - r, 2 * r, 2 * r, 'rgba(27,22,18,.45)', 4, 1); c.restore(); }
    const key = r.toFixed(1) + '|' + cols.map(q => (q.x * 100 | 0) + ',' + (q.y * 100 | 0) + (q.variant ? 'v' : '') + (q.r || '')).join(';');
    let lay = this._cache.get(key);
    if (!lay && typeof Layer === 'function') {
      lay = Layer(2 * r + 4, 2 * r + 4).redraw(cc => this._colonies(cc, r + 2, r + 2, r, cols));
      this._cache.set(key, lay); if (this._cache.size > 96) this._cache.delete(this._cache.keys().next().value);
    }
    if (lay) lay.blit(c, x - r - 2, y - r - 2); else this._colonies(c, x, y, r, cols);
    if (o.jackpot) { c.setLineDash([6, 4]); c.beginPath(); c.arc(x, y, r + 7, 0, TAU); c.lineWidth = 2; c.strokeStyle = SceneKit.pal('text', K.PAPER); c.stroke(); c.setLineDash([]); }
    c.restore();
    const n = o.count === true ? cols.length : o.count;
    if (n != null) K.label(c, 'petri-n', String(n), x + r * 0.72, y - r * 0.72, { size: o.jackpot ? 16 : 14, mono: true, weight: o.jackpot ? 800 : 600 });
    if (o.label) K.label(c, 'petri-l', o.label, x, y + r + 14, { size: 12, pill: false });
    return { x, y, r };
  },
  _colonies(c, x, y, r, cols) {
    const px = Math.max(4, Math.min(6, r * 0.09));
    c.beginPath(); for (const q of cols) if (!q.variant) { const cx = x + q.x * r * 0.9, cy = y + q.y * r * 0.9, s = q.r || px; c.moveTo(cx + s, cy); c.arc(cx, cy, s, 0, TAU); }
    c.fillStyle = '#F7F2E4'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = SceneKit.INK; c.stroke();
    for (const q of cols) if (q.variant) {   // amber fill plus a second ring: the ring carries it, not the hue
      const cx = x + q.x * r * 0.9, cy = y + q.y * r * 0.9, s = q.r || px;
      c.beginPath(); c.arc(cx, cy, s, 0, TAU); c.fillStyle = SceneKit.pal('a', '#F2C94C'); c.fill(); c.lineWidth = 1.5; c.strokeStyle = SceneKit.INK; c.stroke();
      c.beginPath(); c.arc(cx, cy, s + 2.5, 0, TAU); c.lineWidth = 1.2; c.stroke();
    }
  },
  /* up to 20 plates, 5 × 4 at 56 px (smaller if the rect is small), each with its count pill → [{x, y, r}] for hit tests */
  grid(c, rect, plates) {
    const n = Math.min(20, (plates || []).length), cols = 5, rows = Math.max(1, Math.ceil(n / cols));
    const cell = Math.min(rect.w / cols, rect.h / rows, 72), r = Math.max(14, Math.min(28, cell / 2 - 6)), out = [];
    const x0 = rect.x + (rect.w - cols * cell) / 2 + cell / 2, y0 = rect.y + (rect.h - rows * cell) / 2 + cell / 2;
    for (let i = 0; i < n; i++) {
      const p = plates[i] || {}, x = x0 + (i % cols) * cell, y = y0 + Math.floor(i / cols) * cell;
      this.plate(c, x, y, r, Object.assign({ count: p.count == null ? true : p.count }, p)); out.push({ x, y, r });
    }
    return out;
  },
  /* the velvet: a 56 px block lowers over the master plate (250 ms), lifts and stamps each replica in turn (250 ms each).
     from = {x, y, r, colonies}; to = a plate or plates {x, y, r, keep?(colony) → bool (default: variants only, as on a drug
     plate)}. → {links: [[x1, y1, x2, y2]…] (the same colony on master and replica), prints: [[colony…] per plate], done,
     draw(c)}; the chapter calls draw(c) each frame until done. Calm: no motion, the prints appear at once. */
  velvet(from, to, done) {
    const K = SceneKit, tos = Array.isArray(to) ? to : [to], steps = 1 + tos.length, D = K.calm() ? 0 : 250, t0 = K.now();
    const prints = tos.map(p => (from.colonies || []).filter(q => (p.keep || (z => !!z.variant))(q)));
    const links = []; tos.forEach((p, i) => { for (const q of prints[i]) links.push([from.x + q.x * from.r * 0.9, from.y + q.y * from.r * 0.9, p.x + q.x * p.r * 0.9, p.y + q.y * p.r * 0.9]); });
    const h = { links, prints, stamped: D ? 0 : tos.length, done: !D, _fired: false,
      draw(c) {
        const t = (K.now() - t0) / Math.max(1, D), k = Math.min(steps, Math.floor(t)), f = t - k;
        this.stamped = Math.min(tos.length, Math.max(0, k)); if (t >= steps) this.stamped = tos.length;
        if (!this.done && t >= steps) { this.done = true; }
        if (this.done && !this._fired) { this._fired = true; if (done) try { done(this); } catch (e) { } }
        if (this.done) return;
        const p = k === 0 ? from : tos[k - 1], s = 28, lift = f < 0.5 ? 1 - f * 2 : (f - 0.5) * 2, y = p.y - 6 - 18 * lift;
        c.save(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(p.x, p.y + 4, s * (1 - 0.3 * lift), s * 0.3, 0, 0, TAU); c.fill();
        rrect(c, p.x - s, y - s * 0.55, 2 * s, s * 1.1, 6); c.fillStyle = '#CFC6B4'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = K.INK; c.stroke();
        K.hatch(c, p.x - s + 3, y - s * 0.55 + 3, 2 * s - 6, s * 1.1 - 6, 'rgba(27,22,18,.25)', 3, 0.8); c.restore();
      } };
    if (!D && done) { h._fired = true; try { done(h); } catch (e) { } }
    return h;
  },
  /* Erlenmeyer flask at 0.12u (47 px at 390); turbidity 0–5 is a luminance ramp with matching hatch density, so it reads in
     mono; o.label (the generation, "g 31,000") under it; o.ring draws the you-halo */
  flask(c, x, y, o) {
    o = o || {}; const K = SceneKit, s = o.size || (typeof Stage !== 'undefined' && Stage.u ? Math.max(40, Stage.u * 0.12) : 47), tb = clamp(Math.round(o.turbidity || 0), 0, 5);
    const w = s * 0.62, nh = s * 0.32, nw = s * 0.16, top = y - s / 2, bot = y + s / 2;
    const shape = () => { c.beginPath(); c.moveTo(x - nw / 2, top); c.lineTo(x - nw / 2, top + nh); c.lineTo(x - w / 2, bot - 4); c.quadraticCurveTo(x - w / 2, bot, x - w / 2 + 4, bot); c.lineTo(x + w / 2 - 4, bot); c.quadraticCurveTo(x + w / 2, bot, x + w / 2, bot - 4); c.lineTo(x + nw / 2, top + nh); c.lineTo(x + nw / 2, top); c.closePath(); };
    c.save(); shape(); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill();
    c.save(); shape(); c.clip(); const ly = top + nh + (bot - top - nh) * 0.25, L = [0.94, 0.82, 0.70, 0.58, 0.46, 0.34][tb], v = Math.round(255 * L);
    c.fillStyle = 'rgb(' + v + ',' + Math.round(v * 0.97) + ',' + Math.round(v * 0.88) + ')'; c.fillRect(x - w, ly, 2 * w, bot - ly);
    if (tb) K.hatch(c, x - w / 2, ly, w, bot - ly, 'rgba(27,22,18,.35)', 9 - tb * 1.3, 0.9);
    c.restore(); shape(); c.lineWidth = 1.5; c.strokeStyle = K.INK; c.stroke();
    c.beginPath(); c.moveTo(x - nw / 2 - 2, top); c.lineTo(x + nw / 2 + 2, top); c.lineWidth = 3; c.stroke();
    if (o.ring) { c.beginPath(); c.arc(x, y, s * 0.62, 0, TAU); c.lineWidth = 5; c.strokeStyle = K.INK; c.stroke(); c.lineWidth = 3; c.strokeStyle = K.pal('paper', K.PAPER); c.stroke(); }
    c.restore();
    if (o.label) K.label(c, 'flask-l', o.label, x, bot + 12, { size: 12, mono: true });
    return { x, y, r: s / 2 };
  },
  /* a 4 × 3 rack (188 px wide at 390) → [{x, y, r}] */
  rack(c, rect, flasks) {
    const n = Math.min(12, (flasks || []).length), cols = 4, rows = 3, cw = rect.w / cols, chh = rect.h / rows, s = Math.min(cw * 0.9, chh * 0.62, 60), out = [];
    c.save(); c.fillStyle = 'rgba(27,22,18,.12)'; for (let r = 0; r < rows; r++) c.fillRect(rect.x + 4, rect.y + (r + 1) * chh - chh * 0.12, rect.w - 8, 3); c.restore();
    for (let i = 0; i < n; i++) { const x = rect.x + (i % cols + 0.5) * cw, y = rect.y + (Math.floor(i / cols) + 0.42) * chh; out.push(this.flask(c, x, y, Object.assign({ size: s }, flasks[i]))); }
    return out;
  }
};

/* ================= Strata ================= */
const Strata = {
  PATTERNS: ['silt', 'sand', 'shale', 'limestone', 'ash'],
  /* a cliff section. spec.layers bottom (oldest) to top: [{thick, pattern, lum (0..1), fossils: [{x (0..1), kind, lum, wear}]}];
     thicknesses are normalised to the rect. Layers differ by luminance (steps ≥ 0.06 L) and pattern, never hue (D4 §4.3).
     spec.erosion: [{layer, amp}] tears the top of that layer: a gap in the record, drawn as a jagged ink line.
     → [{y0, y1}] per layer, for hit tests and placing fossils by gesture. */
  section(c, rect, spec) {
    spec = spec || {}; const K = SceneKit, Ls = spec.layers || [], tot = Ls.reduce((s, l) => s + Math.max(0, +l.thick || 0), 0) || 1, out = [];
    let yb = rect.y + rect.h;
    const tears = {}; for (const e of spec.erosion || []) tears[e.layer] = e.amp == null ? 0.5 : e.amp;
    const edge = (i, y) => { const amp = tears[i], pts = []; const r = K.hrnd(977 + i * 131); for (let x = 0; x <= rect.w; x += 8) pts.push([rect.x + x, y + (amp ? (r() - 0.5) * 2 * amp * 10 : 0)]); return pts; };
    const tops = [];
    for (let i = 0; i < Ls.length; i++) { const h = Math.max(0, +Ls[i].thick || 0) / tot * rect.h; tops.push(edge(i, yb - h)); out.push({ y0: yb - h, y1: yb }); yb -= h; }
    for (let i = 0; i < Ls.length; i++) {
      const l = Ls[i], top = tops[i], bottom = i ? tops[i - 1] : [[rect.x, rect.y + rect.h], [rect.x + rect.w, rect.y + rect.h]];
      c.save(); c.beginPath(); top.forEach((p, j) => j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); for (let j = bottom.length - 1; j >= 0; j--) c.lineTo(bottom[j][0], bottom[j][1]); c.closePath();
      const lum = clamp(l.lum == null ? 0.7 - 0.07 * (i % 4) : l.lum, 0.35, 0.9), v = Math.round(255 * lum); c.fillStyle = 'rgb(' + v + ',' + Math.round(v * 0.95) + ',' + Math.round(v * 0.86) + ')'; c.fill();
      c.clip(); this._pattern(c, l.pattern || this.PATTERNS[i % 5], rect.x, out[i].y0 - 12, rect.w, out[i].y1 - out[i].y0 + 24, lum, i); c.restore();
      c.beginPath(); top.forEach((p, j) => j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.lineWidth = tears[i] ? 2.5 : 1; c.strokeStyle = tears[i] ? K.INK : 'rgba(27,22,18,.45)'; c.stroke();
      for (const f of l.fossils || []) if (typeof Rig !== 'undefined' && Rig.has('fossil')) { const fy = (out[i].y0 + out[i].y1) / 2; Rig.draw(c, 'fossil', { kind: f.kind, lum: f.lum == null ? Math.min(0.95, lum + 0.12) : f.lum, wear: f.wear || 0 }, rect.x + clamp(f.x, 0, 1) * rect.w, fy, { size: Math.max(27, Math.min(44, (out[i].y1 - out[i].y0) * 0.9)), id: f.id != null ? f.id : f.kind + i }); }
    }
    c.save(); c.strokeStyle = K.INK; c.lineWidth = 1.5; c.strokeRect(rect.x, rect.y, rect.w, rect.h); c.restore();
    return out;
  },
  _pattern(c, kind, x, y, w, h, lum, seed) {   // silt dots, sand speckle, shale lines, limestone bricks, ash stars (ink at fixed alpha)
    const r = SceneKit.hrnd(seed * 7919 + kind.length), ink = lum > 0.55 ? 'rgba(27,22,18,.42)' : 'rgba(240,232,212,.5)';
    c.fillStyle = ink; c.strokeStyle = ink; c.lineWidth = 1; c.beginPath();
    if (kind === 'silt') for (let i = 0; i < w * h / 70; i++) { const px = x + r() * w, py = y + r() * h; c.moveTo(px + 0.9, py); c.arc(px, py, 0.9, 0, TAU); }
    else if (kind === 'sand') for (let i = 0; i < w * h / 26; i++) { const px = x + r() * w, py = y + r() * h, s = 0.5 + r() * 0.8; c.moveTo(px + s, py); c.arc(px, py, s, 0, TAU); }
    else if (kind === 'ash') for (let i = 0; i < w * h / 180; i++) { const px = x + r() * w, py = y + r() * h; for (let k = 0; k < 3; k++) { const dx = [3, 1.5, -1.5][k], dy = [0, 2.6, 2.6][k]; c.moveTo(px - dx, py - dy); c.lineTo(px + dx, py + dy); } }
    if (kind === 'silt' || kind === 'sand') c.fill();
    if (kind === 'shale') for (let yy = y + 3; yy < y + h; yy += 4) { let xx = x; while (xx < x + w) { const len = 10 + r() * 26; c.moveTo(xx, yy); c.lineTo(Math.min(x + w, xx + len), yy); xx += len + 3 + r() * 5; } }
    if (kind === 'limestone') for (let row = 0, yy = y; yy < y + h; yy += 9, row++) { c.moveTo(x, yy); c.lineTo(x + w, yy); for (let xx = x + (row % 2) * 9; xx < x + w; xx += 18) { c.moveTo(xx, yy); c.lineTo(xx, yy + 9); } }
    if (kind === 'ash' || kind === 'shale' || kind === 'limestone') c.stroke();
  },
  /* the zircon clock: n atoms (default 20) in a 5 × 4 grid; parent atoms solid, daughters hollow; o.label ("½ left") under it.
     o.flash: index of an atom that is decaying now (a ring). → [{x, y, r}] for taps. */
  zircon(c, x, y, o) {
    o = o || {}; const K = SceneKit, n = o.n || 20, parents = clamp(o.parents == null ? n : o.parents | 0, 0, n), cols = 5, rows = Math.ceil(n / cols), s = o.cell || 22, r = s * 0.36, out = [];
    const w = cols * s + 16, h = rows * s + 16;
    c.save(); c.beginPath(); c.moveTo(x, y - h / 2 - 10); c.lineTo(x + w / 2, y - h / 2 + 6); c.lineTo(x + w / 2, y + h / 2 - 6); c.lineTo(x, y + h / 2 + 10); c.lineTo(x - w / 2, y + h / 2 - 6); c.lineTo(x - w / 2, y - h / 2 + 6); c.closePath();
    c.fillStyle = 'rgba(232,223,201,.9)'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = K.INK; c.stroke();
    for (let i = 0; i < n; i++) {
      const ax = x - (cols - 1) * s / 2 + (i % cols) * s, ay = y - (rows - 1) * s / 2 + Math.floor(i / cols) * s, solid = i < parents;
      c.beginPath(); c.arc(ax, ay, r, 0, TAU); if (solid) { c.fillStyle = K.INK; c.fill(); } c.lineWidth = 1.5; c.strokeStyle = K.INK; c.stroke();
      if (o.flash === i) { c.beginPath(); c.arc(ax, ay, r + 4, 0, TAU); c.lineWidth = 2; c.stroke(); }
      out.push({ x: ax, y: ay, r: Math.max(r, 11) });
    }
    c.restore();
    if (o.label) K.label(c, 'zircon-l', o.label, x, y + h / 2 + 22, { size: 14, mono: true });
    return out;
  },
  /* the log-time ruler: equal-width decade panels (each a linear 10-part scale), oldest on the left, joined by "≈" marks
     (each ≈ means ×10). spec = {decades: [loExp, hiExp] (years; default [3, 10]), marks: [{t, kind: 'you'|'truth'|'tick', label}],
     window: [t1, t2] (the zoom bracket)}. → {X(t) → x, T(x) → t} for gestures. */
  ruler(c, rect, spec) {
    spec = spec || {}; const K = SceneKit, ds = spec.decades || [3, 10], lo = ds[0] | 0, hi = Math.max(lo + 1, ds[1] | 0), n = hi - lo, gap = 10, pw = (rect.w - gap * (n - 1)) / n, y = rect.y + rect.h * 0.45;
    const panel = e => rect.x + (hi - 1 - e) * (pw + gap);   // decade [10^e, 10^(e+1)] → its panel's left edge
    const X = t => { if (!(t > 0)) return rect.x + rect.w; let e = 0, p = 1; while (p * 10 <= t && e < 40) { p *= 10; e++; } e = clamp(e, lo, hi - 1); p = 1; for (let i = 0; i < e; i++) p *= 10; const f = clamp((t - p) / (9 * p), 0, 1); return panel(e) + (1 - f) * pw; };   // linear within a decade
    const p10 = e => { let p = 1; for (let i = 0; i < e; i++) p *= 10; return p; };
    const T = x => { for (let e = hi - 1; e >= lo; e--) { const x0 = panel(e); if (x >= x0 - gap / 2 && x <= x0 + pw + gap / 2) return p10(e) + 9 * p10(e) * clamp(1 - (x - x0) / pw, 0, 1); } return x < rect.x + rect.w / 2 ? p10(hi) : p10(lo); };
    c.save(); c.strokeStyle = K.pal('text', K.PAPER); c.fillStyle = c.strokeStyle; c.lineWidth = 2;
    for (let e = lo; e < hi; e++) {
      const x0 = panel(e); c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + pw, y); c.stroke();
      c.lineWidth = 1; c.beginPath(); for (let k = 0; k <= 9; k++) { const xx = x0 + pw - k / 9 * pw, tall = k === 0 || k === 9 ? 9 : k === 4 ? 6 : 4; c.moveTo(xx, y - tall); c.lineTo(xx, y + tall); } c.stroke(); c.lineWidth = 2;
      if (e > lo) { const gx = x0 + pw + gap / 2; c.beginPath(); for (const dy of [-3, 3]) { c.moveTo(gx - 5, y + dy + 1.5); c.quadraticCurveTo(gx - 2.5, y + dy - 2.5, gx, y + dy); c.quadraticCurveTo(gx + 2.5, y + dy + 2.5, gx + 5, y + dy - 1.5); } c.lineWidth = 1.5; c.stroke(); c.lineWidth = 2; }
    }
    c.restore();
    for (let e = lo; e <= hi; e++) { const x = e === hi ? panel(hi - 1) : panel(e) + pw, t = Math.round(Det.pow(10, e)); K.label(c, 'ruler-' + e, this.fmt(t), x, y + 20, { size: 12, mono: true, pill: false }); }
    if (spec.window) { const a = X(spec.window[0]), b = X(spec.window[1]); c.save(); c.strokeStyle = K.pal('text', K.PAPER); c.lineWidth = 2; c.beginPath(); c.moveTo(a, y - 14); c.lineTo(a, y - 18); c.lineTo(b, y - 18); c.lineTo(b, y - 14); c.stroke(); c.restore(); }
    for (const m of spec.marks || []) {
      const x = X(m.t); c.save();
      if (m.kind === 'you') { c.beginPath(); c.moveTo(x, y - 16); c.lineTo(x + 7, y - 9); c.lineTo(x, y - 2); c.lineTo(x - 7, y - 9); c.closePath(); c.fillStyle = K.pal('surface', '#1C2A28'); c.fill(); c.lineWidth = 2; c.strokeStyle = K.pal('text', K.PAPER); c.stroke(); }
      else if (m.kind === 'truth') { c.setLineDash([4, 3]); c.beginPath(); c.moveTo(x, y - 18); c.lineTo(x, y + 10); c.lineWidth = 2; c.strokeStyle = K.pal('text', K.PAPER); c.stroke(); }
      else { c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y + 6); c.lineWidth = 2; c.strokeStyle = K.pal('text', K.PAPER); c.stroke(); }
      c.restore();
      if (m.label) K.label(c, 'ruler-m', m.label, x, y - 30, { size: 12 });
    }
    return { X, T, y };
  },
  fmt(t) { return t >= 1e9 ? Math.round(t / 1e8) / 10 + ' Gyr' : t >= 1e6 ? Math.round(t / 1e5) / 10 + ' Myr' : t >= 1e3 ? Math.round(t / 100) / 10 + ' kyr' : Math.round(t) + ' yr'; },
  /* range chart: one bar per taxon on a shared time axis (rect.lo, rect.hi; old on the left); the found part solid, the
     inferred part hatched (the Signor–Lipps smear). taxa: [{label, found: [t0, t1], inferred: [t0, t1]}]. → [{y, x0, x1}] */
  range(c, rect, taxa) {
    const K = SceneKit, n = Math.max(1, (taxa || []).length), lo = rect.lo != null ? rect.lo : 0, hi = rect.hi != null ? rect.hi : 1, X = t => rect.x + (hi - t) / ((hi - lo) || 1) * rect.w, row = Math.min(28, rect.h / n), bh = Math.max(8, row * 0.45), out = [];
    const text = K.pal('text', K.PAPER);
    (taxa || []).forEach((tx, i) => {
      const y = rect.y + (i + 0.5) * row;
      if (tx.inferred) { const a = X(Math.max(tx.inferred[0], tx.inferred[1])), b = X(Math.min(tx.inferred[0], tx.inferred[1])); K.hatch(c, a, y - bh / 2, Math.max(1, b - a), bh, text, 4, 1); c.save(); c.setLineDash([3, 3]); c.lineWidth = 1; c.strokeStyle = text; c.strokeRect(a, y - bh / 2, b - a, bh); c.restore(); }
      if (tx.found) { const a = X(Math.max(tx.found[0], tx.found[1])), b = X(Math.min(tx.found[0], tx.found[1])); c.save(); c.fillStyle = text; c.fillRect(a, y - bh / 2, Math.max(2, b - a), bh); c.restore(); out.push({ y, x0: a, x1: b }); } else out.push({ y, x0: null, x1: null });
      if (tx.label) K.label(c, 'range-l', tx.label, rect.x - 6, y, { size: 12, align: 'right', pill: false });
    });
    return out;
  }
};
Object.assign(EXPORT, { Petri, Strata });
