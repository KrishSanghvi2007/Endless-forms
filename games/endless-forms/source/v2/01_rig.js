/* ================= v2/01_rig.js: Rig, procedural creature rigs (D4 §1.2, §1.4, §4.1, §4.4; D5 §4; API_v2 §8.2) =================
   Work package E6. A rig turns a phenotype into a look: recipe(ph) gives JSON parts (ellipse, circle, poly, bezier, line,
   path, rect, dots, glyph, token, geno), bake() rasterises them once into a cache keyed on the quantised phenotype, and
   draw() blits the cached canvas with a transform (position, rotation, flip, ±8% scale and pose seeded by the individual's
   id). The same recipes port to Pixi unchanged (D4 §1.4).
   Field Plate style (D4 §1.2): flat natural paint, a 1.5 px ink outline, one highlight and one shadow; eyes are a dot with a
   specular. Data inks (Pal.A, Pal.a) appear only on beetle wing cases (the GENES look), the moth's C/c badge and the
   two-type hermit crab (D4 §2.2 rules 2–4). Natural paint stays ≥ ΔE 8 from every data ink (tests/selftest_e6.js runs the
   gamut lint on Rig.paints()). Words never go on a rig; a rig's letters (O, B, Y on lizard throats) are vector glyphs.
   Rules: nothing here calls R() or Math.random (an individual's jitter is a hash of its id); angles use Det, so no
   view-only maths escapes the lint. Load rule: top-level code touches only legacy objects (core.js, hunt.js, ch*.js);
   Pal, Fx and Stage are read inside functions, behind typeof guards. Nothing here is wired to a hook, so legacy runs and
   ?v1=1 are untouched. */

const Rig = (() => {
  const DEFS = {}, GROUNDS = {}, CACHE = new Map(), MAX = 900, PIX = 12e6;   // the bake cache: ≤ 900 canvases and ≤ 12 M pixels (≈ 48 MB), oldest out first
  let pix = 0;
  const INK = '#1B1612', PAPER = '#E8DFC9';
  const pal = (k, d) => typeof Pal !== 'undefined' && Pal[k] ? Pal[k] : d;
  const theme = () => typeof Pal !== 'undefined' && Pal.theme ? Pal.theme : 'dusk';
  const dpr = () => typeof Stage !== 'undefined' && Stage.dpr ? Stage.dpr : 1;
  const hash = v => { const s = String(v); let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995); return (h ^ h >>> 15) >>> 0; };
  const cosD = a => Det.cos(a), sinD = a => Det.sin(a);
  const hex = h => { const x = String(h).replace('#', ''), f = x.length === 3 ? x.split('').map(q => q + q).join('') : x; return [0, 2, 4].map(i => parseInt(f.slice(i, i + 2), 16)); };
  const mixc = (a, b, t) => { const p = hex(a), q = hex(b); return '#' + p.map((v, i) => ('0' + Math.round(v + (q[i] - v) * clamp(t, 0, 1)).toString(16)).slice(-2)).join(''); };
  const alpha = (h, a) => { const p = hex(h); return 'rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',' + a + ')'; };

  /* ---- part constructors: coordinates in rig units, origin at the centre of the w × h box; lw in CSS px ---- */
  const E = (x, y, rx, ry, fill, o) => Object.assign({ op: 'ellipse', x, y, rx, ry, fill }, o);
  const C = (x, y, r, fill, o) => Object.assign({ op: 'circle', x, y, r, fill }, o);
  const P = (pts, fill, o) => Object.assign({ op: 'poly', pts, fill }, o);
  const B = (pts, fill, o) => Object.assign({ op: 'bezier', pts, fill, close: true }, o);
  const L = (pts, stroke, lw, o) => Object.assign({ op: 'line', pts, stroke, lw }, o);
  const D = (d, fill, o) => Object.assign({ op: 'path', d, fill }, o);
  const OL = { stroke: INK, lw: 1.5 };   // the actor outline
  const eye = (x, y, r) => [C(x, y, r, INK), C(x + r * 0.35, y - r * 0.35, Math.max(0.45, r * 0.38), PAPER)];   // dot with a specular
  const inkLine = (pts, col, lw) => [L(pts, INK, lw + 1.5, { cap: 'round' }), L(pts, col, lw, { cap: 'round' })];   // a limb: ink edge, paint core

  /* ---- path building and painting ---- */
  function trace(c, p) {
    c.beginPath(); const a = p.pts;
    switch (p.op) {
      case 'ellipse': c.ellipse(p.x || 0, p.y || 0, Math.max(0.01, p.rx), Math.max(0.01, p.ry == null ? p.rx : p.ry), p.rot || 0, p.a0 == null ? 0 : p.a0, p.a1 == null ? TAU : p.a1, !!p.ccw); if (p.a0 != null) c.closePath(); break;
      case 'circle': c.arc(p.x || 0, p.y || 0, Math.max(0.01, p.r), 0, TAU); break;
      case 'poly': case 'line': c.moveTo(a[0], a[1]); for (let i = 2; i + 1 < a.length; i += 2) c.lineTo(a[i], a[i + 1]); if (p.op === 'poly' && p.close !== false) c.closePath(); break;
      case 'bezier': c.moveTo(a[0], a[1]); for (let i = 2; i + 5 < a.length; i += 6) c.bezierCurveTo(a[i], a[i + 1], a[i + 2], a[i + 3], a[i + 4], a[i + 5]); if (p.close) c.closePath(); break;
      case 'rect': if (p.r) rrect(c, p.x, p.y, p.w, p.h, p.r); else c.rect(p.x, p.y, p.w, p.h); break;
      case 'dots': for (let i = 0; i + 2 < a.length; i += 3) { c.moveTo(a[i] + a[i + 2], a[i + 1]); c.arc(a[i], a[i + 1], a[i + 2], 0, TAU); } break;
      case 'path':
        for (const s of p.d) {
          const k = s[0];
          if (k === 'M') c.moveTo(s[1], s[2]); else if (k === 'L') c.lineTo(s[1], s[2]); else if (k === 'Q') c.quadraticCurveTo(s[1], s[2], s[3], s[4]);
          else if (k === 'C') c.bezierCurveTo(s[1], s[2], s[3], s[4], s[5], s[6]); else if (k === 'A') c.arc(s[1], s[2], s[3], s[4], s[5], !!s[6]);
          else if (k === 'E') c.ellipse(s[1], s[2], s[3], s[4], s[5] || 0, s[6], s[7], !!s[8]); else if (k === 'Z') c.closePath();
        }
        break;
    }
  }
  // letters as strokes, so a rig never draws text: O, B, Y (lizard throats), C and c (carbonaria), A and a
  const GLYPH = {
    O: [['E', 0, 0, 0.36, 0.5, 0, 0, TAU]], C: [['A', 0, 0, 0.45, 0.8, 5.48]], c: [['A', 0.02, 0.18, 0.32, 0.85, 5.43]],
    B: [['M', -0.3, -0.5], ['L', -0.3, 0.5], ['M', -0.3, -0.5], ['C', 0.42, -0.5, 0.42, 0, -0.3, 0], ['M', -0.3, 0], ['C', 0.5, 0, 0.5, 0.5, -0.3, 0.5]],
    Y: [['M', -0.36, -0.5], ['L', 0, 0], ['L', 0.36, -0.5], ['M', 0, 0], ['L', 0, 0.5]],
    A: [['M', -0.38, 0.5], ['L', 0, -0.5], ['L', 0.38, 0.5], ['M', -0.22, 0.12], ['L', 0.22, 0.12]],
    a: [['A', -0.02, 0.2, 0.28, 0, TAU], ['M', 0.26, -0.1], ['L', 0.26, 0.5]]
  };
  function glyph(c, ch, x, y, h, col, lw) {
    const g = GLYPH[ch]; if (!g) return;
    c.save(); c.translate(x, y); c.scale(h, h); c.beginPath();
    for (const s of g) { if (s[0] === 'M') c.moveTo(s[1], s[2]); else if (s[0] === 'L') c.lineTo(s[1], s[2]); else if (s[0] === 'C') c.bezierCurveTo(s[1], s[2], s[3], s[4], s[5], s[6]); else if (s[0] === 'A') { c.moveTo(s[1] + s[3] * cosD(s[4]), s[2] + s[3] * sinD(s[4])); c.arc(s[1], s[2], s[3], s[4], s[5]); } else if (s[0] === 'E') { c.moveTo(s[1] + s[3], s[2]); c.ellipse(s[1], s[2], s[3], s[4], s[5], s[6], s[7]); } }
    c.lineWidth = lw / h; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.stroke(); c.restore();
  }
  function paint(c, parts, u) {   // u = rig units per CSS px
    for (const p of parts) {
      if (!p) continue;
      if (Array.isArray(p)) { paint(c, p, u); continue; }
      if (p.op === 'g') { c.save(); c.translate(p.x || 0, p.y || 0); if (p.rot) c.rotate(p.rot); if (p.sx || p.sy) c.scale(p.sx || 1, p.sy || p.sx || 1); paint(c, p.parts, u / (p.sx || 1)); c.restore(); continue; }
      if (p.op === 'glyph') { glyph(c, p.ch, p.x, p.y, p.h, p.col || INK, (p.lw || 1.6) * u); continue; }
      if (p.op === 'token' || p.op === 'geno') { tokenPart(c, p, u); continue; }
      c.save(); if (p.alpha != null) c.globalAlpha *= p.alpha;
      trace(c, p);
      if (p.fill) { c.fillStyle = p.fill; c.fill(p.rule || 'nonzero'); }
      if (p.kids) { c.save(); c.clip(); paint(c, p.kids, u); c.restore(); if (p.stroke) trace(c, p); }
      if (p.stroke) { c.lineWidth = (p.lw || 1.5) * u; c.strokeStyle = p.stroke; c.lineCap = p.cap || 'round'; c.lineJoin = 'round'; if (p.dash) c.setLineDash(p.dash.map(v => v * u)); c.stroke(); }
      c.restore();
    }
  }
  function tokenPart(c, p, u) {   // allele tokens through Pal (D4 §2.2 rule 1–2); without Pal, plain discs
    if (typeof Pal === 'undefined') { trace(c, { op: 'circle', x: p.x, y: p.y, r: p.r }); c.fillStyle = PAPER; c.fill(); return; }
    c.save(); c.lineWidth = 1.5 * u;
    if (p.op === 'geno') Pal.genotype(c, p.x, p.y, p.r, p.a1, p.a2, { letter: '' }); else Pal.token(c, p.x, p.y, p.r, p.a, { letter: '' });
    c.restore();
  }

  /* ---- quantised cache key (D4 §1.4: 8 bins for tone, 4 for each other trait unless the rig says otherwise) ---- */
  function quant(def, ph) {
    const Q = def.quant || {}, out = {}, keys = Object.keys(ph || {}).sort();
    for (const k of keys) {
      const v = ph[k];
      if (typeof v === 'number' && isFinite(v) && !Number.isInteger(v)) { const n = Q[k] || Q['*'] || 4; out[k] = Math.round(clamp(v, 0, 1) * (n - 1)) / (n - 1); }
      else if (typeof v === 'function') continue;
      else out[k] = Array.isArray(v) ? Array.from(v) : v;
    }
    return out;
  }
  const keyOf = q => { let s = ''; for (const k in q) s += k + ':' + (Array.isArray(q[k]) ? q[k].join(',') : q[k]) + ';'; return s; };

  const R0 = {
    def(species, d) {   // {recipe(ph, o) → {w, h, parts, anchors} | paint(c, ph, o) with w, h; develop?; quant; tier; row; paints}
      if (!d || (typeof d.recipe !== 'function' && typeof d.paint !== 'function')) throw new Error('Rig.def ' + species + ': needs recipe or paint');
      DEFS[species] = Object.assign({ tier: 'actor', quant: { tone: 8, '*': 4 } }, d); for (const k of [...CACHE.keys()]) if (k.startsWith(species + '|')) { const c0 = CACHE.get(k); pix -= c0.width * c0.height; CACHE.delete(k); }
      return DEFS[species];
    },
    has(species) { return !!DEFS[species]; },
    species() { return Object.keys(DEFS); },
    row(species) { const d = DEFS[species]; return d ? Object.assign({ species, tier: d.tier }, d.row || {}) : null; },
    paints() { const out = {}; for (const k in DEFS) if (DEFS[k].paints) out[k] = DEFS[k].paints.slice(); return out; },
    develop(species, lay, g) { const d = DEFS[species]; return d && d.develop ? d.develop(lay, g) : null; },
    size(tier) { const u = typeof Stage !== 'undefined' && Stage.u >= 100 ? Stage.u : 390; return Math.round((tier === 'hero' ? 0.12 : tier === 'crowd' ? 0.03 : 0.07) * u); },   // before layout: the 390 px phone
    recipe(species, ph, o) { const d = DEFS[species]; if (!d) throw new Error('Rig: unknown species ' + species); return d.recipe ? d.recipe(quant(d, ph), o || {}) : { w: d.w, h: d.h, parts: [] }; },
    // → a canvas of the rig at o.size CSS px (its longer side), device scale d; cv.cw, cv.ch = CSS size; cv.anchors in CSS px from the centre
    bake(species, ph, d, o) {
      o = o || {}; d = d > 0 ? d : 1; const def = DEFS[species]; if (!def) throw new Error('Rig: unknown species ' + species);
      const q = quant(def, ph || {}), key = species + '|' + keyOf(q) + '|' + (o.size ? Math.round(o.size) : 0) + '@' + (Math.round(d * 4) / 4) + (o.genes ? '|g' : '') + (o.letters ? '|l' : '') + '|' + theme();
      let cv = CACHE.get(key); if (cv) { CACHE.delete(key); CACHE.set(key, cv); return cv; }
      const rc = def.recipe ? def.recipe(q, o) : { w: def.w, h: def.h }, s = o.size ? o.size / Math.max(rc.w, rc.h) : 1, pad = 2.5 / s;
      const W = rc.w + 2 * pad, H = rc.h + 2 * pad; cv = mkCanvas(W * s * d, H * s * d); const c = cv.getContext('2d');
      c.scale(cv.width / W, cv.height / H); c.translate(W / 2, H / 2);
      if (def.paint) def.paint(c, q, { u: 1 / s, s, d, genes: !!o.genes, letters: !!o.letters, sv: hash(key) >>> 0 }); else paint(c, rc.parts || [], 1 / s);
      cv.cw = W * s; cv.ch = H * s; cv.s = s; cv.anchors = {};
      for (const k in rc.anchors || {}) cv.anchors[k] = [rc.anchors[k][0] * s, rc.anchors[k][1] * s];
      CACHE.set(key, cv); pix += cv.width * cv.height;
      while ((CACHE.size > MAX || pix > PIX) && CACHE.size > 1) { const k0 = CACHE.keys().next().value, c0 = CACHE.get(k0); pix -= c0.width * c0.height; CACHE.delete(k0); }
      return cv;
    },
    // o: {size, rot, flip, id, halo, notch, state: 'idle'|'alert'|'gone', t (s, idle phase clock), alert (0..1), genes, letters, alpha}
    // → {x, y, r, anchors: {name: [x, y]}} in canvas px (anchors follow the transform), for tags, threads and hit tests
    draw(c, species, ph, x, y, o) {
      o = o || {}; const def = DEFS[species]; if (!def) return null;
      const size = o.size || this.size(def.tier), calm = typeof Fx !== 'undefined' && Fx.calm;
      let sc = 1, rot = o.rot || 0, dy = 0;
      if (o.id != null) { const h = hash(o.id); sc = 1 + ((h & 255) / 255 - 0.5) * 0.16; rot += (((h >>> 8) & 255) / 255 - 0.5) * 0.3 * (def.pose == null ? 1 : def.pose); }
      if (o.state === 'gone') { c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = pal('text', PAPER); c.beginPath(); c.arc(x, y, size * 0.5, 0, TAU); c.stroke(); c.restore(); return { x, y, r: size * 0.5, anchors: {} }; }
      if (o.state === 'idle' && !calm && o.t != null) { const h = hash((o.id == null ? 0 : o.id) + 'i'), f = 0.6 + 0.6 * ((h & 1023) / 1023); dy = -size * 0.02 * (0.5 + 0.5 * sinD(TAU * f * o.t + (h >>> 10) % 628 / 100)); }
      if (o.state === 'alert') sc *= 1 + 0.1 * clamp(o.alert == null ? 1 : o.alert, 0, 1);
      const dq = Math.max(1, Math.ceil(dpr() * sc * 2) / 2), cv = this.bake(species, ph, dq, { size, genes: o.genes, letters: o.letters });
      c.save(); c.translate(x, y + dy); if (rot) c.rotate(rot); const fx = o.flip ? -sc : sc; c.scale(fx, sc);
      if (o.alpha != null) c.globalAlpha *= o.alpha;
      c.drawImage(cv, -cv.cw / 2, -cv.ch / 2, cv.cw, cv.ch); c.restore();
      const r = size * 0.5 * sc, cr = cosD(rot), sr = sinD(rot), an = {};
      for (const k in cv.anchors) { const a = cv.anchors[k], ax = a[0] * fx, ay = a[1] * sc; an[k] = [x + ax * cr - ay * sr, y + dy + ax * sr + ay * cr]; }
      if (o.notch && o.id != null) {   // D4 §4.1 rule 4: one micro-mark per individual, at an angle seeded by its id (off by default: it would betray camouflage)
        const a = (hash(o.id + 'n') % 628) / 100, nx = x + cosD(a) * r * 0.78, ny = y + dy + sinD(a) * r * 0.78;
        c.save(); c.beginPath(); c.moveTo(nx - 3 * sinD(a), ny + 3 * cosD(a)); c.lineTo(nx + 3 * cosD(a), ny + 3 * sinD(a)); c.lineTo(nx + 3 * sinD(a), ny - 3 * cosD(a)); c.closePath(); c.fillStyle = pal('paper', PAPER); c.fill(); c.lineWidth = 1; c.strokeStyle = INK; c.stroke(); c.restore();
      }
      if (o.halo) { c.save(); c.beginPath(); c.arc(x, y + dy, r + 3, 0, TAU); c.lineWidth = 5; c.strokeStyle = INK; c.stroke(); c.lineWidth = 3; c.strokeStyle = pal('paper', PAPER); c.stroke(); c.restore(); }
      return { x, y: y + dy, r, anchors: an };
    },
    clear() { CACHE.clear(); pix = 0; },
    get pixels() { return pix; },
    get cached() { return CACHE.size; },
    // grounds that belong to a rig (the side-blotched lizard's rocks): → {cv, T}; baked once, never in the frame loop
    defGround(name, fn) { GROUNDS[name] = fn; },
    ground(name, w, h, d, seed) { const f = GROUNDS[name]; if (!f) throw new Error('Rig.ground: unknown ' + name); return f(w, h, d || 1, seed == null ? 1 : seed); },
    grounds() { return Object.keys(GROUNDS); },
    _: { E, C, P, B, L, D, OL, eye, inkLine, mixc, alpha, hash, glyph, paint, INK, PAPER }
  };
  return R0;
})();
EXPORT.Rig = Rig;

/* ================= the rigs ================= */
{
  const { E, C, P, B, L, D, OL, eye, inkLine, mixc, alpha, INK, PAPER } = Rig._;
  const ol = o => Object.assign({}, OL, o);
  const inkA = () => typeof Pal !== 'undefined' ? Pal.A : '#6B97FF', inka = () => typeof Pal !== 'undefined' ? Pal.a : '#F2C94C';
  const alleleInk = a => a === 0 ? inkA() : a === 1 ? inka() : typeof Pal !== 'undefined' ? Pal.allele(a).fill : PAPER;

  /* ---- moth (Wood): wraps mothSprite; morph stencils (band, mottle, speckle), carbonaria, C/c badge in the GENES look ----
     ph = {tone, hue, mot, morph: 'band'|'mottle'|'speck' (or band: true), carb: bool, cg: [c1, c2] (0 = C, 1 = c)}. No ink outline: on bark the
     moth's own edge is the camouflage (D4 §1.2 lifts the outline rule where the ground's tone is the variable). Tone gets 32
     bins, not D4's 8: what the player sees must match what is scored, and 8 bins (ΔE ≈ 8 a step) would hide real differences. */
  const WINGS = c => { c.beginPath(); for (const s of [-1, 1]) { c.moveTo(0, -4); c.bezierCurveTo(s * 5, -7, s * 14, -4.5, s * 16.5, 6); c.bezierCurveTo(s * 12, 9.5, s * 6, 10.5, 0, 8.5); c.closePath(); } };
  Rig.def('moth', {
    w: 38, h: 30, tier: 'actor', quant: { tone: 32, hue: 8, mot: 4, '*': 4 },
    row: { scene: 'wood', squint: 'broad triangular wings, two antennae', channels: ['tone, and black carbonaria (luminance)', 'morph stencil (pattern: band, mottle, speck)', 'C/c badge (letter, GENES lens only)'] },
    paints: [],
    paint(c, ph, o) {
      const carb = !!ph.carb, t = carb ? 0.06 : ph.tone == null ? 0.5 : ph.tone, h = ph.hue == null ? 0.5 : ph.hue;
      const spr = mothSprite({ tone: t, hue: h, mot: carb ? 0.12 : ph.mot == null ? 0.3 : ph.mot }, o.s * o.d, o.sv);
      c.drawImage(spr, -19, -15, 38, 30);
      const m = carb ? '' : ph.morph === 'A' || ph.morph === 'band' || (ph.band && !ph.morph) ? 'band' : ph.morph === 'B' || ph.morph === 'mottle' ? 'mottle' : ph.morph === 'ab' || ph.morph === 'speck' ? 'speck' : '';
      if (m) {
        c.save(); WINGS(c); c.clip(); const r = rng(o.sv ^ 0x9e37), col = d => css(t2rgb(clamp(t + d, 0, 1), h));
        if (m === 'band') { c.fillStyle = col(-0.34); c.beginPath(); for (const s of [-1, 1]) { c.moveTo(s * 1.5, 0); c.lineTo(s * 17, 3); c.lineTo(s * 17, 6.5); c.lineTo(s * 1.5, 4.6); c.closePath(); } c.fill(); }
        if (m === 'mottle') { c.fillStyle = col(0.3); c.beginPath(); for (const s of [-1, 1]) for (const [x, y, a] of [[5, -1.5, 2.6], [10, 0.5, 2.2], [13.5, 4.5, 1.8], [7, 5, 2.4]]) { c.moveTo(s * x + a, y); c.ellipse(s * x, y, a, a * 0.75, 0.4 * s, 0, TAU); } c.fill(); }
        if (m === 'speck') { c.fillStyle = col(-0.36); c.beginPath(); for (let i = 0; i < 44; i++) { const x = (r() * 2 - 1) * 16.5, y = -5 + r() * 14, rr = 0.45 + r() * 0.5; c.moveTo(x + rr, y); c.arc(x, y, rr, 0, TAU); } c.fill(); }
        c.restore();
      }
      if (o.genes && Array.isArray(ph.cg)) Rig._.paint(c, [{ op: 'geno', x: 0, y: 2, r: 4.6, a1: ph.cg[0], a2: ph.cg[1] }], o.u);
    }
  });

  /* ---- beetle (Beetle Isle): ported from equilibrium-hw beetle(); allele halves on the wing cases ----
     ph = {a: [a1, a2] (0 = A, 1 = a, −1 absent), dark: 0..1 (natural paint, sand to lava) | undefined (Equilibrium's abstract
     beetle wears the phenotype ink, D4 §2.2 rule 3)}. o.genes: halves by allele with letters; a −1 copy is a hollow case
     and the one-copy bar (rule 2). */
  const SAND = '#C9B283', LAVA = '#3C3530', BODY = '#2B2420';
  Rig.def('beetle', {
    tier: 'actor', quant: { dark: 8, '*': 4 },
    row: { scene: 'beetle', squint: 'oval wing cases split down the middle, six legs', channels: ['allele halves on the wing cases (ink and letter, GENES look)', 'body tone (luminance, natural paint)'] },
    paints: [SAND, LAVA, BODY, mixc(SAND, LAVA, 0.5)],
    recipe(ph, o) {
      const s = 20, a = ph.a || [0, 0], ey = s * 0.14, rx = s * 0.4, ry = s * 0.56, parts = [], hasA = a[0] === 0 || a[1] === 0;
      const nat = ph.dark != null ? mixc(SAND, LAVA, ph.dark) : null, body = nat ? mixc(BODY, LAVA, 0.3) : BODY;
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const yy = -s * 0.15 + k * s * 0.3; parts.push(L([sd * s * 0.3, yy, sd * s * 0.62, yy + (k - 1) * s * 0.18, sd * s * 0.7, yy + (k - 1) * s * 0.3 + s * 0.08], body, 1.6)); }
      parts.push(L([-s * 0.08, -s * 0.72, -s * 0.22, -s * 0.98], body, 1.3), L([s * 0.08, -s * 0.72, s * 0.22, -s * 0.98], body, 1.3));
      parts.push(E(0, -s * 0.66, s * 0.17, s * 0.13, body), E(0, -s * 0.42, s * 0.3, s * 0.16, body, ol({ lw: 1 })));
      const one = a[0] < 0 || a[1] < 0, cl = o.genes ? (a[0] < 0 ? null : alleleInk(a[0])) : nat || (hasA ? inkA() : inka()), cr = o.genes ? (a[1] < 0 ? null : alleleInk(a[1])) : nat || (hasA ? inkA() : inka());
      const surf = typeof Pal !== 'undefined' ? Pal.surface : '#1C2A28';
      parts.push(D([['M', 0, ey - ry], ['E', 0, ey, rx, ry, 0, -Math.PI / 2, Math.PI / 2, true], ['Z']], cl || surf));
      parts.push(D([['M', 0, ey - ry], ['E', 0, ey, rx, ry, 0, -Math.PI / 2, Math.PI / 2, false], ['Z']], cr || surf));
      parts.push(E(-rx * 0.42, ey - ry * 0.42, rx * 0.2, ry * 0.2, 'rgba(255,255,255,.3)'), E(rx * 0.35, ey + ry * 0.5, rx * 0.45, ry * 0.28, 'rgba(0,0,0,.14)'));
      parts.push(E(0, ey, rx, ry, null, ol()), L([0, ey - ry, 0, ey + ry], INK, 1.2));
      if (o.genes) for (const [al, dx] of [[a[0], -0.48], [a[1], 0.48]]) if (al === 0 || al === 1) parts.push({ op: 'glyph', ch: al === 0 ? 'A' : 'a', x: rx * dx, y: ey, h: s * 0.36, col: al === 0 ? '#FFFFFF' : INK, lw: 1.7 });
      if (o.genes && one) parts.push({ op: 'rect', x: -s * 0.35, y: ey + ry + 2, w: s * 0.7, h: 2.2, fill: INK });
      return { w: s * 1.5, h: s * 2.15, parts };
    }
  });

  /* ---- hermit crab (Shore): claw geometry ported from CH_HAWKS.crab, plus the borrowed shell ----
     ph = {claw: 'up'|'down'|'idle', lum: 0..1 (carapace luminance), ink: 'A'|'a' (Hawk blue, Dove amber; two types only,
     D4 §2.2 rule 4)}. The shell keeps natural paint. Faces right; flip for the rival. */
  const SHELL = '#CDB596', SHELL2 = '#8F7757', CRAB0 = '#5D4A3B', CRAB1 = '#C2A385';
  Rig.def('crab', {
    tier: 'actor', quant: { lum: 6, '*': 4 },
    row: { scene: 'shore', squint: 'spiral shell with one big claw', channels: ['claw up or down (shape)', 'carapace luminance', 'Hawk blue or Dove amber body (two types only)'] },
    paints: [SHELL, SHELL2, CRAB0, CRAB1, mixc(CRAB0, CRAB1, 0.5)],
    recipe(ph) {
      const body = ph.ink === 'A' ? inkA() : ph.ink === 'a' ? inka() : mixc(CRAB0, CRAB1, ph.lum == null ? 0.5 : ph.lum);
      const up = ph.claw === 'up' ? -15 : ph.claw === 'down' ? 6 : -4, parts = [];
      for (let i = 0; i < 3; i++) parts.push(inkLine([6 + i * 6, 6, 9 + i * 7, 14, 6 + i * 8, 22], body, 2.6));
      parts.push(E(-13, -3, 21, 17, SHELL, ol({ rot: -0.35, kids: [D([['A', -10, -6, 11, 0.4, 5.6]], null, { stroke: SHELL2, lw: 2 }), D([['A', -14, -9, 5, 0.6, 5.4]], null, { stroke: SHELL2, lw: 1.8 }), E(-24, 6, 14, 10, 'rgba(0,0,0,.13)')] })));
      parts.push(E(-17, -11, 6, 3.4, 'rgba(255,255,255,.35)', { rot: -0.5 }));
      parts.push(E(5, 5, 7, 9, '#5A4634', { rot: -0.2 }));
      parts.push(E(11, 1, 10, 7.5, body, ol({ kids: [E(13, 5, 9, 4, 'rgba(0,0,0,.15)')] })));
      parts.push(inkLine([15, -1, 20, up + 4], body, 3.4));
      parts.push(E(25, up, 10, 6, body, ol({ rot: -0.5, kids: [E(27, up - 3, 5, 2, 'rgba(255,255,255,.28)', { rot: -0.5 })] })), L([22, up + 1.5, 32, up + 1.5 - 5], INK, 1.2));
      for (const ex of [12, 17]) { parts.push(L([ex, -5, ex + 2, -13], INK, 1.4)); parts.push(eye(ex + 2, -13.5, 2)); }
      return { w: 72, h: 52, parts, anchors: { claw: [25, up], top: [-13, -22] } };
    }
  });

  /* ---- three-spined stickleback (Lake; Switches boss): pelvic spine and lateral plates ----
     ph = {pelvis: 0..1 (spine length; 0 = absent, as in many freshwater populations), plates: 0..1 (low to complete armour),
     red: bool (breeding male throat, muted)}. Faces right. */
  const STK = '#8D9271', STK2 = '#D3D2BC', FIN = '#6F7356', RED = '#A9584A';
  Rig.def('stickleback', {
    tier: 'actor', quant: { pelvis: 5, plates: 5, '*': 4 },
    row: { scene: 'lake', squint: 'three dorsal spines on a slim fish', channels: ['pelvic spine length (shape)', 'lateral plate count (pattern)', 'breeding throat (bonus hue, never scored)'] },
    paints: [STK, STK2, FIN, RED],
    recipe(ph) {
      const body = [['M', 28, 0], ['C', 22, -9, 2, -11, -18, -4], ['L', -22, -1], ['L', -18, 3], ['C', 2, 10, 20, 8, 28, 0], ['Z']];
      const n = Math.round(4 + 28 * (ph.plates == null ? 1 : ph.plates)), plates = [], pl = ph.pelvis == null ? 1 : ph.pelvis;
      for (let i = 0; i < n; i++) { const x = 17 - i * 1.25; plates.push(L([x, -5, x - 1.2, 4], 'rgba(255,255,255,.45)', 0.8)); }
      const parts = [P([-21, -1, -31, -8, -28, 0, -31, 8], FIN, ol({ lw: 1.2 })), P([-2, 6, -9, 9, -5, 5], FIN)];
      for (const [x, y0, hgt] of [[13, -7.5, 10], [4, -9, 9], [-7, -6.5, 5]]) parts.push(P([x - 2, y0 + 1, x + 1, y0 - hgt, x + 2.2, y0 + 1], '#3E3B2F', ol({ lw: 1 })));
      parts.push(D(body, STK, ol({ kids: [E(4, 6, 24, 5, STK2), ph.red ? E(19, 4, 8, 4, RED) : null, ...plates, E(6, -6, 12, 2, 'rgba(255,255,255,.22)'), E(0, 8, 22, 3, 'rgba(0,0,0,.12)')] })));
      if (pl > 0.05) parts.push(P([5.5, 6, 7 - 12 * pl, 7 + 6 * pl, 9.5, 7.5], '#3E3B2F', ol({ lw: 1 })));
      parts.push(...eye(21, -2, 2.3), L([28, 0.5, 25.5, 1.4], INK, 1));
      return { w: 64, h: 30, parts, anchors: { pelvis: [7, 7], dorsal: [5, -14] } };
    }
  });

  /* ---- side-blotched lizard (Jaws L5, rock ground): throat morph by pattern, natural throat paint muted (D4 §2.2 rule 3–4) ----
     ph = {morph: 'O'|'B'|'Y'} (O solid orange bib, B barred blue, Y striped yellow). o.letters adds the O/B/Y glyph on a paper
     disc (actor size and up). The dark blotch behind the forelimb is the namesake squint feature. Faces right. */
  const LIZ = '#8B7459', LIZ2 = '#5F4D3C', LIZB = '#CDBF9F', THR = { O: '#D98E4A', B: '#4F78A8', Y: '#B8AE66' };
  Rig.def('lizard', {
    tier: 'actor', pose: 0.5,
    row: { scene: 'rocks', squint: 'long-tailed lizard with a dark blotch behind the foreleg', channels: ['throat pattern O solid, B barred, Y striped (pattern)', 'throat letter O, B, Y (letter)', 'throat paint (natural, muted; never the only cue)'] },
    paints: [LIZ, LIZ2, LIZB, THR.O, THR.B, THR.Y],
    recipe(ph, o) {
      const m = THR[ph.morph] ? ph.morph : 'O', parts = [];
      parts.push(B([-14, -3, -24, -3, -32, 2, -38, 6, -30, 5, -22, 4, -14, 5], LIZ, ol({ lw: 1.2 })));
      for (const [x, s] of [[12, 1], [-8, -1]]) parts.push(inkLine([x, 4, x + 3 * s, 10, x + 7 * s, 11], LIZ, 2.4), inkLine([x - 3, 4, x - 6 * s, 10, x - 10 * s + 4, 12], LIZ, 2.4));
      const thr = THR[m], marks = m === 'B' ? [L([17, 1, 17, 9], INK, 1.3), L([20.5, 1, 20.5, 9], INK, 1.3), L([24, 1, 24, 8], INK, 1.3)] : m === 'Y' ? [L([13, 3.6, 29, 3.6], INK, 1.2), L([13, 6.2, 28, 6.2], INK, 1.2)] : [];
      parts.push(D([['M', -15, -2], ['C', -6, -10, 8, -10, 15, -6], ['C', 22, -10, 31, -7, 34, -1.5], ['C', 33, 3, 28, 7.5, 19, 7.5], ['C', 8, 9.5, -6, 8.5, -15, 4.5], ['Z']], LIZ, ol({
        kids: [E(2, 6, 16, 3.5, LIZB), E(21, 5, 9, 4.2, thr, { kids: marks }), P([-10, -5, -6, -7.5, -2, -5, 2, -7.5, 6, -5, 10, -7.5, 14, -5], null, { stroke: LIZ2, lw: 1.4 }),
          C(7, 0, 3, '#2E2620'), E(4, -6, 13, 1.6, 'rgba(255,255,255,.2)'), E(2, 7, 16, 2, 'rgba(0,0,0,.12)'), L([34, -1.5, 25, 1.8], INK, 1)]
      })));
      parts.push(...eye(25.5, -3.2, 1.9));
      if (o.letters) parts.push(C(25, -12.5, 5.6, PAPER, ol({ lw: 1 })), { op: 'glyph', ch: m, x: 25, y: -12.5, h: 6.8, col: INK, lw: 1.6 });
      return { w: 74, h: 34, parts, anchors: { throat: [21, 5], head: [25, -12] } };
    }
  });
  // the lizard's ground: sandy rock (OKLab L 0.38–0.81, no blue or amber, texture within ±0.06 L; D4 §1.2)
  Rig.defGround('rocks', (w, h, d, seed) => {
    const W = Math.round(w * d), H = Math.round(h * d), cv = mkCanvas(W, H), c = cv.getContext('2d'), n = makeNoise(seed * 7 + 3), r = rng(seed * 13 + 5);
    c.fillStyle = '#A79A82'; c.fillRect(0, 0, W, H);
    const im = c.getImageData(0, 0, W, H), Dd = im.data;
    if (Dd && Dd.length === W * H * 4) for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) { const v = (fbm(n, x / d * 0.06, y / d * 0.06, 3) - 0.5) * 26, i = (y * W + x) * 4; Dd[i] = clamp(167 + v, 0, 255); Dd[i + 1] = clamp(154 + v, 0, 255); Dd[i + 2] = clamp(130 + v * 0.9, 0, 255); Dd[i + 3] = 255; }
    c.putImageData(im, 0, 0); c.scale(d, d);
    const k = Math.round(w * h / 9000);
    for (let i = 0; i < k; i++) {
      const x = r() * w, y = r() * h, s = 10 + r() * 26, m = 6 + Math.floor(r() * 4); c.beginPath();
      for (let j = 0; j < m; j++) { const a = j / m * TAU, rr = s * (0.7 + 0.3 * r()); if (j) c.lineTo(x + rr * Det.cos(a), y + rr * 0.7 * Det.sin(a)); else c.moveTo(x + rr, y); }
      c.closePath(); c.fillStyle = r() < 0.5 ? '#8D8170' : '#978B78'; c.fill(); c.lineWidth = 1.2; c.strokeStyle = 'rgba(27,22,18,.35)'; c.stroke();
      c.beginPath(); c.ellipse(x - s * 0.25, y - s * 0.22, s * 0.35, s * 0.16, -0.3, 0, TAU); c.fillStyle = 'rgba(255,255,255,.16)'; c.fill();
    }
    return { cv, T: 0.6 };
  });

  /* ---- Seychelles warbler (Alarm Call boss): slender, plain, long legs ----
     ph = {carry: bool (food in the bill: a helper feeding), ring: 0..3 (leg rings, identity), chick: bool, gape: bool}. */
  const WAR = '#7B7356', WAR2 = '#D6CEAE', WARW = '#666046', LEG = '#5B5348';
  Rig.def('warbler', {
    tier: 'actor',
    row: { scene: 'island scrub', squint: 'slim warbler with a long thin bill and long legs', channels: ['food in the bill (shape: a helper feeding)', 'leg rings (pattern: identity)', 'chick or adult (size)'] },
    paints: [WAR, WAR2, WARW, LEG, '#E3D6B4'],
    recipe(ph) {
      if (ph.chick) {
        const g = !!ph.gape, parts = [C(0, 6, 8.5, WAR, ol({ kids: [E(1, 9, 5.5, 4, WAR2), E(-3, 2, 3.5, 2, 'rgba(255,255,255,.25)')] })), C(1, -5, 6.2, WAR, ol())];
        parts.push(g ? P([5, -7, 15, -11, 7, -5, 15, -1, 5, -3], '#E3D6B4', ol({ lw: 1 })) : P([6, -6, 12, -5, 6, -3.5], LEG, ol({ lw: 0.8 })));
        parts.push(L([-1, -6, 2, -6.5], INK, 1.2));
        return { w: 30, h: 30, parts };
      }
      const parts = [P([-9, 4, -22, 8, -21, 11.5, -8, 7.5], WARW, ol({ lw: 1.1 }))];
      parts.push(L([0, 8, -1, 17, 2, 18], LEG, 1.4), L([3.5, 8, 4.5, 17, 7, 18], LEG, 1.4));
      for (let i = 0; i < (ph.ring | 0); i++) parts.push({ op: 'rect', x: -1.9 + 0.1 * i, y: 11 + i * 1.8, w: 2.2, h: 1.5, fill: i % 2 ? INK : PAPER, stroke: INK, lw: 0.6 });
      parts.push(E(0, 2, 11.5, 7.5, WAR, ol({ rot: -0.25, kids: [E(3, 6.5, 9, 4.5, WAR2), E(-3, -2, 6, 2, 'rgba(255,255,255,.18)')] })));
      parts.push(E(-2, 1.5, 8, 4.2, WARW, ol({ rot: -0.3, lw: 1, kids: [L([-8, 3, 2, -1], 'rgba(255,255,255,.25)', 0.8), L([-7, 5, 3, 1], 'rgba(255,255,255,.2)', 0.8)] })));
      parts.push(C(10, -5.5, 5.4, WAR, ol({ kids: [E(11, -3, 4, 2, WAR2)] })), P([14.5, -7, 23, -5.8, 14.5, -4.6], LEG, ol({ lw: 0.8 })), L([7.5, -6.5, 13, -6.8], 'rgba(255,255,255,.35)', 0.9));
      parts.push(...eye(11.5, -6.5, 1.4));
      if (ph.carry) parts.push(E(25, -5.2, 2.8, 1.5, '#3F3B2C', ol({ lw: 0.8 })), L([24, -4, 23.5, -2.5], INK, 0.7), L([26, -4, 26.5, -2.5], INK, 0.7));
      return { w: 50, h: 38, parts, anchors: { bill: [23, -6], leg: [0, 14] } };
    }
  });

  /* ---- yellow dung fly, Scathophaga (Raffle L3): furry males, smaller plain females; body size is the size channel ----
     ph = {sex: 'm'|'f', size: 0..1}. Top view, head up. The box is fixed so size reads as size. */
  const FLYM = '#AE8C49', FLYF = '#8A8A68', FLYH = '#D7C089';
  Rig.def('dungfly', {
    tier: 'actor', quant: { size: 6, '*': 4 },
    row: { scene: 'dung pat', squint: 'fuzzy-edged fly, wings folded over the back', channels: ['body size (size)', 'sex: furry golden male, plain greyer female (outline and luminance)'] },
    paints: [FLYM, FLYF, FLYH],
    recipe(ph) {
      const m = ph.sex !== 'f', f = (0.68 + 0.32 * (ph.size == null ? 0.5 : ph.size)) * (m ? 1 : 0.88), col = m ? FLYM : FLYF, parts = [];
      for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) parts.push(L([sd * 3, -6 + k * 4, sd * 10, -9 + k * 6, sd * 13, -6 + k * 8], INK, 1.1));
      if (m) { const hair = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, rx = i % 2 ? 6.4 : 5.8; hair.push(L([rx * Det.cos(a), 4 + 11 * Det.sin(a) * 0.9, (rx + 2.2) * Det.cos(a), 4 + 13 * Det.sin(a) * 0.9], FLYH, 1)); } parts.push(...hair); }
      parts.push(E(0, 6, 5.4, 10, col, ol({ kids: [L([-5, 3, 5, 3], 'rgba(0,0,0,.25)', 0.9), L([-5, 7, 5, 7], 'rgba(0,0,0,.25)', 0.9), L([-4.5, 11, 4.5, 11], 'rgba(0,0,0,.25)', 0.9)] })));
      parts.push(E(0, -4, 6, 6.2, col, ol({ kids: [E(-2, -6, 2.4, 1.8, 'rgba(255,255,255,.3)')] })), C(0, -12, 4, col, ol()), ...eye(-2.4, -13, 1.5), ...eye(2.4, -13, 1.5));
      for (const s of [-1, 1]) parts.push(E(s * 5, 6, 4.2, 11.5, alpha(PAPER, 0.42), { rot: s * 0.22, stroke: alpha(INK, 0.75), lw: 1, kids: [L([s * 3, -3, s * 6, 14], alpha(INK, 0.4), 0.6), L([s * 5, -3, s * 8, 12], alpha(INK, 0.35), 0.6)] }));
      return { w: 36, h: 40, parts: [{ op: 'g', x: 0, y: 0, sx: f, sy: f, parts }], anchors: { back: [0, 2 * f] } };
    }
  });

  /* ---- feral fowl (Raffle L4): comb size is the status channel; rooster or hen by comb and tail shape ----
     ph = {sex: 'm'|'f', comb: 0..1}. Faces right. Natural paint, comb muted away from the selection ink. */
  const FOWL = '#8A4F31', FOWL2 = '#A3683D', TAIL = '#2F2B2E', COMB = '#9A3A36', HEN = '#8D6B4C', HORN = '#C4AE7E';
  Rig.def('fowl', {
    tier: 'actor', quant: { comb: 5, '*': 4 },
    row: { scene: 'farm', squint: 'chicken with a comb and an arched tail', channels: ['comb size (size: status)', 'rooster or hen (comb and tail shape)'] },
    paints: [FOWL, FOWL2, TAIL, COMB, HEN, HORN],
    recipe(ph) {
      const m = ph.sex !== 'f', k = 0.35 + 0.95 * (ph.comb == null ? 0.5 : ph.comb) * (m ? 1 : 0.45), body = m ? FOWL : HEN, parts = [];
      if (m) for (const [dx, dy, lw] of [[0, 0, 3.2], [4, 5, 2.6], [8, 9, 2.2]]) parts.push(L([-12, -2 + dy * 0.2, -22 - dx, -26 + dy, -31 + dx * 0.4, -2 + dy * 0.5], TAIL, lw + 1.5, { cap: 'round' }), L([-12, -2 + dy * 0.2, -22 - dx, -26 + dy, -31 + dx * 0.4, -2 + dy * 0.5], TAIL, lw, { cap: 'round' }));
      else parts.push(P([-12, -1, -22, -12, -20, 4], body, ol()));
      parts.push(L([2, 16, 1, 27, 5, 28], HORN, 1.8), L([7, 16, 7, 27, 11, 28], HORN, 1.8));
      parts.push(E(0, 6, 17, 12, body, ol({ kids: [E(-2, 12, 14, 5, 'rgba(0,0,0,.15)'), E(-4, 0, 9, 3, 'rgba(255,255,255,.18)'), m ? E(-3, 4, 11, 6, FOWL2, { rot: 0.3 }) : null] })));
      parts.push(D([['M', 6, -2], ['C', 9, -10, 11, -14, 14, -17], ['L', 19, -14], ['C', 18, -8, 16, -2, 14, 4], ['Z']], m ? FOWL2 : body, ol()));
      const bumps = [];
      for (let i = 0; i < 4; i++) bumps.push(C(10.5 + i * 2.6, -20.5 - 2.4 * k * (i === 1 || i === 2 ? 1.25 : 0.8), 1.6 + 1.6 * k, COMB));
      parts.push(...bumps.map(b => Object.assign({}, b, { stroke: INK, lw: 1.5 })), ...bumps);
      parts.push(C(15, -14, 5.2, m ? FOWL2 : body, ol()), E(17.5, -7.5, 1.8 + 0.6 * k, 2.4 + 2.6 * k, COMB, ol({ lw: 1 })));
      parts.push(P([19.5, -15.5, 25, -13.5, 19.5, -11.5], HORN, ol({ lw: 0.9 })), ...eye(16.5, -15, 1.4));
      return { w: 66, h: 62, parts, anchors: { comb: [13, -23], cloaca: [-12, 8] } };
    }
  });

  /* ---- Belding's ground squirrel (Alarm Call): sentinel pose, the face blaze (D4 §4.1a) and an ear anchor for the tag ----
     ph = {pose: 'up'|'down', blaze: 'stripe'|'chevron'|'spot'|null (ΔL ≥ 0.2 on the fur), call: bool, age: 0..1 (pup to adult)}.
     The blaze is a designed cue; the chapter says so on screen. */
  const SQ = '#A2896A', SQ2 = '#D4C5A7', SQD = '#7A664E', BLZ = '#EEE5CF';
  Rig.def('squirrel', {
    tier: 'actor', quant: { age: 5, '*': 4 }, pose: 0.4,
    row: { scene: 'meadow', squint: 'upright sentinel squirrel with small ears and a short tail', channels: ['pose: upright alarm or foraging (shape)', 'father\'s face blaze: stripe, chevron, spot (luminance and shape, designed)', 'age (size)'] },
    paints: [SQ, SQ2, SQD, BLZ],
    recipe(ph) {
      const up = ph.pose !== 'down', f = 0.62 + 0.38 * (ph.age == null ? 1 : ph.age), parts = [];
      const hx = up ? 0 : 14, hy = up ? -14 : 2;
      const blaze = ph.blaze === 'stripe' ? [L([hx + (up ? 0 : 2), hy - 5.5, hx + (up ? 0 : 3.5), hy - 1.5], BLZ, 2.2)] : ph.blaze === 'chevron' ? [L([hx - 2.6 + (up ? 0 : 2), hy - 5, hx + (up ? 0 : 2), hy - 2.2, hx + 2.6 + (up ? 0 : 2), hy - 5], BLZ, 1.8)] : ph.blaze === 'spot' ? [C(hx + (up ? 0 : 2), hy - 3.6, 1.9, BLZ)] : [];
      if (up) {
        parts.push(E(-7, 19, 5, 3, SQD, ol({ rot: -0.4 })), E(0, 7, 9, 15, SQ, ol({ kids: [E(2, 9, 5, 11, SQ2), E(-4, 0, 3, 7, 'rgba(255,255,255,.18)'), E(6, 12, 5, 9, 'rgba(0,0,0,.12)')] })));
        parts.push(inkLine([-3, -1, 1, 2, 3, 0], SQ, 2), inkLine([3, -1, 6, 2, 7, 0], SQ, 2), inkLine([-4, 20, -6, 23], SQ, 2.2), inkLine([4, 20, 6, 23], SQ, 2.2));
        parts.push(C(-4.5, -19.5, 2.4, SQD, ol({ lw: 1 })), C(4.5, -19.5, 2.4, SQD, ol({ lw: 1 })), C(0, -14, 7, SQ, ol({ kids: [E(0, -10, 4.5, 3, SQ2), ...blaze] })));
        parts.push(...eye(-2.6, -15, 1.3), ...eye(2.6, -15, 1.3), C(0, -11.6, 1, INK));
        if (ph.call) parts.push(E(0, -9, 1.6, 1.2, '#3A2A22'));
      } else {
        parts.push(E(-15, 9, 5, 2.6, SQD, ol({ rot: 0.3 })), E(0, 8, 15, 8, SQ, ol({ kids: [E(2, 13, 11, 3.5, SQ2), E(-3, 3, 8, 2, 'rgba(255,255,255,.18)')] })));
        parts.push(inkLine([-8, 14, -9, 18], SQ, 2.2), inkLine([8, 14, 10, 18], SQ, 2.2), C(11, -3, 2.3, SQD, ol({ lw: 1 })), C(14, 2, 6.5, SQ, ol({ kids: [E(18, 4, 3, 2.5, SQ2), ...blaze] })));
        parts.push(...eye(16, 0, 1.3), C(20.3, 3, 1, INK));
      }
      const ear = up ? [-4.5, -23] : [11, -6];
      return { w: up ? 44 : 50, h: up ? 52 : 34, parts: [{ op: 'g', x: 0, y: 0, sx: f, sy: f, parts }], anchors: { ear: [ear[0] * f, ear[1] * f], nose: [(up ? 0 : 20) * f, (up ? -11 : 3) * f] } };
    }
  });

  /* ---- great tit (Hedge; Forager hero): black cap, white cheek, yellow breast with the black median stripe ----
     ph = {stripe: 0..1 (stripe width, the size channel), carry: bool (a caterpillar dangles from the bill)}. Breast paint is a
     muted green-yellow kept ≥ ΔE 8 from the amber ink. Faces right. */
  const TIT_Y = '#C2C467', TIT_B = '#7B8A55', TIT_W = '#7D8A97', TIT_K = '#1F1D1C', TIT_C = '#F1EEE4', CAT = '#6E7838';
  Rig.def('tit', {
    tier: 'actor', quant: { stripe: 6, '*': 4 },
    row: { scene: 'hedge', squint: 'round tit with black cap, white cheek and notched tail', channels: ['breast stripe width (size)', 'caterpillar in the bill (shape)'] },
    paints: [TIT_Y, TIT_B, TIT_W, TIT_K, TIT_C, CAT],
    recipe(ph) {
      const sw = 1 + 4.5 * (ph.stripe == null ? 0.5 : ph.stripe), parts = [];
      parts.push(P([-8, 4, -21, 6, -23, 9, -20.5, 8, -21, 11, -8, 8], TIT_W, ol({ lw: 1.1 })));
      parts.push(L([1, 10, 0, 17, 3, 18], TIT_W, 1.5), L([4, 10, 4.5, 17, 7, 18], TIT_W, 1.5));
      parts.push(E(0, 3, 11.5, 9, TIT_Y, ol({ rot: -0.15, kids: [E(-4, -3, 10, 5, TIT_B, { rot: -0.2 }), P([7 - sw * 0.4, -1, 7 + sw * 0.4, -1, 2 + sw * 0.5, 12, 2 - sw * 0.5, 12], TIT_K), E(2, 9, 9, 3, 'rgba(0,0,0,.12)')] })));
      parts.push(E(-4, 1.5, 8, 4.2, TIT_W, ol({ rot: -0.25, lw: 1, kids: [L([-10, 1.5, 1, -0.5], TIT_C, 1.1)] })));
      parts.push(C(9, -6, 6, TIT_K, ol({ kids: [E(10.5, -4.2, 3.6, 2.6, TIT_C)] })), P([14.5, -7, 18.5, -6, 14.5, -4.8], '#2A2622', ol({ lw: 0.8 })));
      parts.push(C(11.5, -7.5, 1.4, INK), C(12, -8, 0.6, PAPER));
      if (ph.carry) parts.push(B([18, -5.5, 20, -2, 17, 1, 19, 4.5, 19.4, 5, 18.6, 5.2, 17.8, 4.6], null, { stroke: INK, lw: 4 }), B([18, -5.5, 20, -2, 17, 1, 19, 4.5, 19.4, 5, 18.6, 5.2, 17.8, 4.6], null, { stroke: CAT, lw: 2.6 }));
      return { w: 48, h: 40, parts, anchors: { bill: [18, -6], breast: [3, 4] } };
    }
  });

  /* ---- nestling (the Hunt bag's chick row; Forager chicks): fattens when fed, gapes when hungry ----
     ph = {fed: 0..1, gape: bool}. A chick that starves is drawn by the caller as a dashed ghost ring (D4 §4.1 rule 5). */
  const CHK = '#8E8576', CHK2 = '#B9AF9E', GAPE = '#E5DAB8', GAPEIN = '#B97A5E';
  Rig.def('chick', {
    tier: 'actor', quant: { fed: 5, '*': 4 },
    row: { scene: 'nest', squint: 'round downy nestling with a wide bill', channels: ['fatness (size: fed or hungry)', 'gape open or shut (shape)'] },
    paints: [CHK, CHK2, GAPE, GAPEIN],
    recipe(ph) {
      const k = 0.78 + 0.32 * (ph.fed == null ? 0.5 : ph.fed), parts = [];
      parts.push(E(0, 6, 9 * k, 8, CHK2, ol({ kids: [E(-3, 2, 3, 2, 'rgba(255,255,255,.3)'), E(3, 10, 6, 3, 'rgba(0,0,0,.12)')] })));
      for (const a of [-2.4, -1.6, -0.8]) parts.push(L([0, -10, 2.2 * Det.cos(a), -10 + 3.4 * Det.sin(a)], CHK, 0.9));
      parts.push(C(0, -4, 6, CHK, ol()));
      parts.push(L([-4, -3.5, -2, -3.2], INK, 1), L([2, -3.2, 4, -3.5], INK, 1));
      parts.push(ph.gape ? P([-6.5, -8, 0, -13.5, 6.5, -8, 0, -6], GAPEIN, ol({ lw: 1, kids: [L([-6.5, -8, 0, -13.5, 6.5, -8], GAPE, 3), L([-6.5, -8, 0, -6, 6.5, -8], GAPE, 2.6)] })) : P([-4.5, -8.5, 0, -12, 4.5, -8.5, 0, -6.5], GAPE, ol({ lw: 1 })));
      return { w: 24, h: 30, parts, anchors: { bill: [0, ph.gape ? -12 : -4] } };
    }
  });

  /* ---- four crustaceans (Switches L4): how many thoracic legs are feeding legs (maxillipeds) ----
     Standard anatomy for the presets: brine shrimp 0 maxillipeds (11 leafy limbs), isopod 1 (7 walking legs), lobster 3
     (5 walking legs, the first a big claw), mantis shrimp 5 (the second raptorial; 3 walking legs). ph.maxi moves the
     boundary, as a Hox shift would; the link to Ubx/abd-A expression (Averof & Patel 1997) is the chapter's claim to cite.
     Maxillipeds are short and fold forward to the mouth; walking legs are long and jointed; the boundary reads as shape. */
  const CR = { artemia: ['#C7A27F', 11, 0, 'leaf'], isopod: ['#8E8B86', 8, 1, 'walk'], lobster: ['#6E5B45', 8, 3, 'walk'], mantis: ['#7B8358', 8, 5, 'walk'] };
  for (const sp in CR) {
    const [col, nT, maxi0, limb] = CR[sp], dark = mixc(col, INK, 0.35), pale = mixc(col, PAPER, 0.45);
    Rig.def(sp, {
      tier: 'actor', pose: 0.2,
      row: { scene: 'lab plate', squint: { artemia: 'slender shrimp with leafy legs and stalked eyes', isopod: 'flattened woodlouse with seven walking legs', lobster: 'lobster with one pair of big claws', mantis: 'mantis shrimp with folded raptorial claws' }[sp], channels: ['feeding legs against walking legs, segment by segment (shape: the Hox boundary)'] },
      paints: [col, dark, pale],
      recipe(ph) {
        const nMax = clamp(ph.maxi == null ? maxi0 : ph.maxi | 0, 0, nT), parts = [], segW = sp === 'artemia' ? 3.4 : 4, x0 = 16, abd = sp === 'artemia' ? 8 : 6;
        const tx = i => x0 - i * segW - segW / 2, bodyH = sp === 'isopod' ? 7 : 5.5;
        // limbs first, behind the body: feeding legs pale, short and folded forward; walking legs dark, long and jointed
        for (let i = 0; i < nT; i++) {
          const x = tx(i), feed = i < nMax;
          if (feed) { const big = sp === 'mantis' && i === 1; parts.push(...inkLine(big ? [x, 3, x + 6, 9, x + 12, 5, x + 16, 8] : [x, 3.5, x + 2.8, 7.5, x + 6, 6.5], pale, big ? 2.6 : 2)); }
          else if (limb === 'leaf') parts.push(E(x - 0.6, 8, 1.6, 4, pale, ol({ lw: 1, rot: 0.35 })));
          else if (sp === 'lobster' && i === nMax) parts.push(...inkLine([x, 3, x + 6, 10, x + 13, 10], dark, 2.6), E(x + 18, 9.5, 6.5, 3.4, dark, ol({ rot: -0.12, kids: [L([x + 15, 10, x + 24.5, 10], INK, 1)] })));
          else parts.push(...inkLine([x, 3, x - 1.5, 10, x - 4, 14], dark, 1.5));
        }
        const tail = x0 - nT * segW, aEnd = tail - abd * 3.2;
        if (sp !== 'artemia') for (let j = 0; j < Math.min(5, abd); j++) parts.push(...inkLine([tail - j * 3.2 - 1.6, 3, tail - j * 3.2 - 3.2, 6.5], dark, 1));
        const segs = [];
        for (let i = 0; i < nT; i++) segs.push(L([tx(i) - segW / 2, -bodyH, tx(i) - segW / 2, bodyH * 0.7], alpha(INK, 0.35), 0.8));
        for (let j = 1; j < abd; j++) segs.push(L([tail - j * 3.2, -bodyH * 0.85, tail - j * 3.2, bodyH * 0.6], alpha(INK, 0.3), 0.7));
        parts.push(P(sp === 'artemia' ? [aEnd + 1, 0, aEnd - 6, -3, aEnd - 4, 0, aEnd - 6, 3] : [aEnd + 1, -1, aEnd - 7, -5.5, aEnd - 8.5, 0, aEnd - 7, 5.5, aEnd + 1, 1], pale, ol({ lw: 1 })));
        parts.push(D([['M', x0 + 8, -bodyH * 0.6], ['C', x0 + 4, -bodyH * 1.25, x0 - 6, -bodyH * 1.2, tail, -bodyH], ['L', aEnd, -bodyH * 0.45], ['L', aEnd, bodyH * 0.3], ['L', tail, bodyH * 0.7], ['C', x0 - 4, bodyH * 0.9, x0 + 6, bodyH * 0.8, x0 + 8, bodyH * 0.2], ['Z']], col, ol({ kids: [...segs, E(x0 - 6, -bodyH * 0.7, 12, 1.5, 'rgba(255,255,255,.22)'), E(x0 - 10, bodyH * 0.7, 20, 2.2, 'rgba(0,0,0,.14)')] })));
        parts.push(L([x0 + 7, -2, x0 + 20, -10, x0 + 28, -8], dark, 1.1), L([x0 + 7, -1, x0 + 15, -6], dark, 1));
        if (sp === 'isopod') parts.push(...eye(x0 + 4, -3, 1.4)); else parts.push(L([x0 + 5, -3, x0 + 8, -7.5], INK, 1.2), ...eye(x0 + 8.5, -8, 1.6));
        const lo = aEnd - 9, hi = x0 + 29, cx = (lo + hi) / 2;
        return { w: hi - lo + 4, h: 30, parts: [{ op: 'g', x: -cx, y: -1, parts }], anchors: { boundary: [tx(nMax) + segW / 2 - cx, -bodyH - 3] } };
      }
    });
  }

  /* ---- the fossil set (Cliff: the Dig, Extinction Roulette): stone relief, ink outline, detail fading with wear ----
     ph = {kind: 'ammonite'|'trilobite'|'clam'|'brachiopod'|'fish'|'leaf'|'tooth'|'bone'|'worm'|'beetle'|'feather', lum: 0..1,
     wear: 0..1}. Soft-bodied kinds (worm, feather, beetle) are the ones a Lagerstätte keeps; a worm has a dashed edge. */
  const STONE0 = '#8F8676', STONE1 = '#D3C9B3';
  Rig.def('fossil', {
    tier: 'actor', pose: 0.6, quant: { lum: 5, wear: 4, '*': 4 },
    row: { scene: 'cliff', squint: 'one silhouette per kind: coil, three-lobed bug, fan shell, fish skeleton, leaf, tooth, bone, worm', channels: ['kind (shape)', 'preservation (detail, luminance)'] },
    paints: [STONE0, STONE1, mixc(STONE0, STONE1, 0.6)],
    recipe(ph) {
      const st = mixc(STONE0, STONE1, ph.lum == null ? 0.65 : ph.lum), det = alpha(INK, 0.6 * (1 - 0.8 * (ph.wear || 0))), lw = 1.1, k = ph.kind || 'ammonite', parts = [], hi = E(-6, -8, 7, 3, 'rgba(255,255,255,.22)', { rot: -0.5 }), lo = E(6, 9, 10, 4, 'rgba(0,0,0,.14)', { rot: -0.5 });
      const relief = (shape, kids) => parts.push(Object.assign(shape, ol({ fill: st, kids: [hi, lo, ...kids] })));
      if (k === 'ammonite') { const ribs = []; for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; ribs.push(L([9 * Det.cos(a), 9 * Det.sin(a), 17 * Det.cos(a + 0.12), 17 * Det.sin(a + 0.12)], det, 0.8)); } relief(C(0, 0, 17), [...ribs, C(1, 1, 9, null, { stroke: det, lw }), C(2, 1.5, 4.5, null, { stroke: det, lw }), C(2.6, 1.8, 1.6, det)]); }
      else if (k === 'trilobite') { const segs = []; for (let i = 0; i < 9; i++) segs.push(L([-9 + i * 0.2, -3 + i * 2.2, 9 - i * 0.2, -3 + i * 2.2], det, 0.9)); relief(D([['M', 0, -18], ['C', 12, -18, 15, -10, 14, -6], ['L', 17, 2], ['L', 11, -3], ['C', 11, 8, 6, 16, 0, 18], ['C', -6, 16, -11, 8, -11, -3], ['L', -17, 2], ['L', -14, -6], ['C', -15, -10, -12, -18, 0, -18], ['Z']]), [...segs, L([-3.5, -14, -3.5, 15], det, lw), L([3.5, -14, 3.5, 15], det, lw), E(0, -11, 4, 4.5, null, { stroke: det, lw }), C(-7, -9, 1.6, det), C(7, -9, 1.6, det)]); }
      else if (k === 'clam' || k === 'brachiopod') { const lines = []; if (k === 'clam') for (let i = 1; i < 6; i++) lines.push(D([['E', 0, 12, 16 * i / 6, 26 * i / 6, 0, Math.PI, TAU]], null, { stroke: det, lw: 0.9 })); else for (let i = -5; i <= 5; i++) lines.push(L([0, 13, i * 3.2, -12], det, 0.8)); relief(D([['M', -16, 12], ['C', -18, -6, -8, -17, 0, -17], ['C', 8, -17, 18, -6, 16, 12], ['Q', 0, 16, -16, 12], ['Z']]), [...lines, C(0, 13, 2.6, det)]); }
      else if (k === 'fish') { const ribs = []; for (let i = 0; i < 9; i++) ribs.push(L([-9 + i * 2.2, -5, -8 + i * 2.2, 5], det, 0.8)); relief(D([['M', 18, 0], ['C', 12, -8, -6, -8, -12, -2], ['L', -18, -8], ['L', -16, 0], ['L', -18, 8], ['L', -12, 2], ['C', -6, 8, 12, 8, 18, 0], ['Z']]), [...ribs, L([-13, 0, 12, 0], det, lw), C(13, -1, 1.8, null, { stroke: det, lw }), L([9, -5, 9, 5], det, lw)]); }
      else if (k === 'leaf') { const veins = []; for (let i = -6; i <= 6; i++) if (i) veins.push(L([0, i * 2.2, (i > 0 ? 1 : -1) * 0 + 8 * (i % 2 ? 1 : -1), i * 2.2 - 4], det, 0.7)); relief(D([['M', 0, -19], ['C', 12, -10, 12, 8, 0, 18], ['C', -12, 8, -12, -10, 0, -19], ['Z']]), [...veins, L([0, -18, 0, 19], det, lw)]); parts.push(L([0, 18, 1, 21], INK, 1.5)); }
      else if (k === 'tooth') { const ser = []; for (let i = 0; i < 6; i++) ser.push(L([-9 + i * 1.4, 8 - i * 4, -8 + i * 1.4, 8 - i * 4 - 1.2], det, 0.7), L([9 - i * 1.4, 8 - i * 4, 8 - i * 1.4, 8 - i * 4 - 1.2], det, 0.7)); relief(D([['M', 0, -16], ['L', 10, 9], ['Q', 0, 13, -10, 9], ['Z']]), [...ser, L([-9, 9, 9, 9], det, lw)]); }
      else if (k === 'bone') relief(D([['M', -12, -4], ['C', -20, -12, -22, 2, -15, 0], ['C', -22, 4, -16, 12, -12, 4], ['L', 12, 4], ['C', 16, 12, 22, 4, 15, 0], ['C', 22, 2, 20, -12, 12, -4], ['Z']]), [L([-10, -1, 10, -1], det, 0.8)]);
      else if (k === 'worm') { const segs = []; for (let i = 0; i < 13; i++) { const x = -16 + i * 2.7, y = -6 * Det.sin(i * 0.48); segs.push(L([x - 0.6, y - 4, x + 0.6, y + 4], det, 0.8)); } parts.push(B([-18, -1, -10, -14, 4, 4, 18, -10, 18, -3, 4, 12, -10, -6, -18, 5], st, { stroke: INK, lw: 1.3, dash: [3, 2], kids: segs })); }
      else if (k === 'beetle') relief(D([['M', 0, -16], ['C', 9, -16, 10, -6, 9, 6], ['C', 8, 14, 3, 17, 0, 17], ['C', -3, 17, -8, 14, -9, 6], ['C', -10, -6, -9, -16, 0, -16], ['Z']]), [L([0, -9, 0, 17], det, lw), L([-9, -9, 9, -9], det, lw), L([-11, -4, -16, -8], det, 0.9), L([11, -4, 16, -8], det, 0.9)]);
      else if (k === 'feather') { const barbs = []; for (let i = 0; i < 12; i++) barbs.push(L([0, -14 + i * 2.6, -7, -11 + i * 2.6], det, 0.6), L([0, -14 + i * 2.6, 7, -11 + i * 2.6], det, 0.6)); relief(D([['M', 0, -19], ['C', 9, -12, 8, 10, 1, 17], ['L', -1, 17], ['C', -8, 10, -9, -12, 0, -19], ['Z']]), [...barbs, L([0, -18, 0, 20], det, lw)]); }
      return { w: 44, h: 44, parts };
    }
  });
}
