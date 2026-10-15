/* ================= v2/01_widgets.js: the shared widgets (API_v2 §7; D1 §2.1 behaviour; D4 §2, §4.2, §5, §8 look) =================
   LiveGraph     the live strip charts (dots, pq, trace, tri, scatter, xhud, deme, price, tree, genome). Realised solid 3 px,
                 expected dashed ink 2 px, "you" a diamond; drawn by the strip through Hooks.chart; never pauses the game.
                 LiveGraph.table(spec) is the data twin, LiveGraph.map(cv, spec) the geometry for gestures.
   Predict       a prediction is a gesture on the live graph: tap or drag the ghost, tap it again (or Enter) to commit, or let the
                 soft timer commit it. The commit goes through Sim.act, so replays and bots reproduce it. Then the band hatches in.
   GenePoolLens  LOOK / GENES / JARS over any population (key L).    Invasion  your rule as a lineage, drawn only through WF.
   Ledger, Pin, Evidence, Chips, PedigreeView, DemeMap, PriceBars, TreeView, SceneLab (dev only).
   Rules: nothing here calls R() except Invasion, through WF (it is simulation); no Math.exp/log/pow/sin/cos; every hook is a
   no-op for a legacy chapter and nothing is registered under ?v1=1; cross-file names (Pal, Fx, Sim, Strip, Replay…) are
   read inside functions behind typeof guards, so a V2_ONLY build without them still loads. */

/* ---------- small helpers (all prefixed wg: one scope is shared with every file) ---------- */
let wgEpoch = 1;   // advances on every live frame and every pointer, key or click event; Hooks.play keeps what start() made
const wgNow = () => performance.now();
const wgV2 = () => typeof App !== 'undefined' && App.scr === 'play' && isV2(App.ch);
const wgCalm = () => typeof Fx !== 'undefined' && !!Fx.calm;
const wgLive = s => { if (typeof Live !== 'undefined' && Live.say) Live.say(s); };
const wgEsc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
const wgClone = v => { try { return v == null ? v : JSON.parse(JSON.stringify(v)); } catch (e) { return null; } };
const wgSum = a => { let s = 0; for (const x of a || []) s += +x || 0; return s; };
// shares → whole numbers that add up to tot (largest remainder), so a bar never reads 48% + 53%
const wgPcts = (vals, tot = 100) => { const t = wgSum(vals); if (!(t > 0)) return (vals || []).map(() => 0); const raw = (vals || []).map(v => Math.max(0, +v || 0) / t * tot), out = raw.map(Math.floor); let left = Math.round(tot - wgSum(out)); raw.map((v, i) => [v - out[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { out[i]++; left--; } }); return out; };
const wgFin = v => typeof v === 'number' && isFinite(v);
const wgTheme0 = () => typeof Pal !== 'undefined' && Pal.theme ? Pal.theme : 'dusk';
// fallback inks when 00_tokens.js is not in the build (D4 §2.1, §2.3)
const WG_INK = {
  dusk: { ground: '#152120', surface: '#1C2A28', text: '#E8DFC9', text2: '#B9B29F', A: '#6B97FF', a: '#F2C94C', sel: '#F46034', drift: '#CF81A2', mut: '#5AE2B5', mig: '#7CC4F0', ink: '#1B1612', paper: '#E8DFC9' },
  paper: { ground: '#F4EEDD', surface: '#E8DFC9', text: '#29211B', text2: '#5C4F44', A: '#2F5FD0', a: '#E8B416', sel: '#C4430A', drift: '#B5588C', mut: '#38B07A', mig: '#7CC4F0', ink: '#1B1612', paper: '#F4EEDD' }
};
const WG_LINE = { A: '#2F5FD0', a: '#AD7B00', sel: '#C4430A', drift: '#B5588C', mut: '#0A9662', mig: '#438BB4' };
// the inks of one theme (charts on an end card are drawn in 'paper' while the game is in Dusk, so this never reads Pal.theme)
function wgT(theme) {
  const th = theme === 'paper' || theme === 'projector' ? theme : 'dusk', P = typeof Pal !== 'undefined' && Pal.INK ? Pal : null;
  const I = P && P.INK[th] ? P.INK[th] : WG_INK[th === 'dusk' ? 'dusk' : 'paper'], L = P && P.LINE ? P.LINE : WG_LINE;
  const proj = th === 'projector' || (typeof Stage !== 'undefined' && Stage.layout === 'projector');
  return { th, I, proj, tk: proj ? 20 : 12, lb: proj ? 22 : 14, k: proj ? 1.5 : 1,
    fill: r => !r || r === 'ink' ? I.text : I[r] || I.text,                               // filled marks
    line: r => !r || r === 'ink' ? I.text : th === 'dusk' ? I[r] || I.text : L[r] || I.text };   // thin lines (Paper's darker column)
}
function wgRgba(h, a) {
  const s = String(h).replace('#', ''), f = s.length === 3 ? s.split('').map(x => x + x).join('') : s;
  return 'rgba(' + parseInt(f.slice(0, 2), 16) + ',' + parseInt(f.slice(2, 4), 16) + ',' + parseInt(f.slice(4, 6), 16) + ',' + a + ')';
}
// allele fill for index 0..11 in a given theme (D4 §2.2 rule 7): blue, amber, paper-white, ink-black × plain, stripe, dots
function wgAllele(T, i) {
  i = Math.max(0, i | 0) % 12; const b = i % 4, fill = b === 0 ? T.I.A : b === 1 ? T.I.a : b === 2 ? T.I.paper : T.I.ink;
  const text = typeof Pal !== 'undefined' && Pal.best ? Pal.best(fill, ['#FFFFFF', T.I.ink]) : b === 0 || b === 3 ? '#FFFFFF' : T.I.ink;
  return { fill, over: ['plain', 'stripe', 'dots'][Math.floor(i / 4)], letter: 'ABCDEFGHIJKL'[i], text, outline: b === 3 ? T.I.paper : T.I.ink };
}
const wgFam = k => typeof fxFam !== 'undefined' ? fxFam[k] : k === 'm' ? 'monospace' : 'Georgia, serif';
function wgFont(c, px, fam, wt) { c.font = (wt || 400) + ' ' + Math.round(px) + 'px ' + wgFam(fam || 'm'); }
// the one text routine of this file (engine text: ticks, titles, end labels, chips). o: {align, base, fam, wt, halo}
function wgText(c, s, x, y, px, col, o) {
  o = o || {}; s = String(s); wgFont(c, px, o.fam, o.wt); c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'middle';
  if (o.halo) { c.lineJoin = 'round'; c.lineWidth = 3; c.strokeStyle = o.halo; c.strokeText(s, x, y); }
  c.fillStyle = col; c.fillText(s, x, y);
}
function wgW(c, s, px, fam, wt) { wgFont(c, px, fam, wt); return c.measureText(String(s)).width; }
function wgPill(c, s, x, y, px, T, o) {   // paper pill with ink text, centred on (x, y) unless o.align
  o = o || {}; const w = wgW(c, s, px, 'b', 600) + px, h = Math.round(px * 1.45), x0 = o.align === 'left' ? x : o.align === 'right' ? x - w : x - w / 2;
  c.fillStyle = T.I.paper; rrect(c, x0, y - h / 2, w, h, h / 2); c.fill(); c.lineWidth = 1; c.strokeStyle = wgRgba(T.I.ink, 0.5); c.stroke();
  wgText(c, s, x0 + w / 2, y + 0.5, px, T.I.ink, { align: 'center', fam: 'b', wt: 600 }); return { x: x0, y: y - h / 2, w, h };
}
function wgHatch(c, x, y, w, h, col, gap, lw) {   // 45° hatching clipped to a rectangle (D4: state without colour)
  if (!(w > 0) || !(h > 0)) return;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.strokeStyle = col; c.lineWidth = lw || 1; c.beginPath();
  for (let k = -h; k < w; k += gap || 6) { c.moveTo(x + k, y + h); c.lineTo(x + k + h, y); }
  c.stroke(); c.restore();
}
function wgDiamond(c, x, y, r, stroke, fill, lw) {
  c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); } c.lineWidth = lw || 2; c.strokeStyle = stroke; c.stroke();
}
// line markers by entity (D4 §2.1): A circle, a square, selection triangle, drift hollow circle, mutation plus, migration arrowhead
function wgMark(c, role, x, y, r, col, bg) {
  c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 2; c.beginPath();
  if (role === 'a') { c.rect(x - r, y - r, 2 * r, 2 * r); c.fill(); }
  else if (role === 'sel') { c.moveTo(x, y - r * 1.15); c.lineTo(x + r, y + r * 0.75); c.lineTo(x - r, y + r * 0.75); c.closePath(); c.fill(); }
  else if (role === 'drift') { c.arc(x, y, r, 0, TAU); c.fillStyle = bg; c.fill(); c.stroke(); }
  else if (role === 'mut') { c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); c.lineWidth = 2.5; c.stroke(); }
  else if (role === 'mig') { c.moveTo(x + r, y); c.lineTo(x - r, y - r * 0.85); c.lineTo(x - r * 0.35, y); c.lineTo(x - r, y + r * 0.85); c.closePath(); c.fill(); }
  else { c.arc(x, y, r, 0, TAU); c.fill(); }
}
function wgArrow(c, x1, y1, x2, y2, col, lw, head) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L, hd = head || Math.max(6, lw * 2.6);
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw; c.lineCap = 'butt';
  c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2 - ux * hd * 0.8, y2 - uy * hd * 0.8); c.stroke();
  c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - ux * hd - uy * hd * 0.55, y2 - uy * hd + ux * hd * 0.55); c.lineTo(x2 - ux * hd + uy * hd * 0.55, y2 - uy * hd - ux * hd * 0.55); c.closePath(); c.fill();
}
function wgFmt(f, v) {   // axis formats: function, 'pct', 'int', or up to two decimals
  if (typeof f === 'function') { try { return String(f(v)); } catch (e) { return String(v); } }
  if (!wgFin(v)) return '–';
  let s;
  if (f === 'pct') s = Math.round(v * 100) + '%';
  else if (f === 'int') s = String(Math.round(v));
  else { const a = Math.abs(v); s = String(a >= 100 || Number.isInteger(v) ? Math.round(v) : a >= 10 ? Math.round(v * 10) / 10 : Math.round(v * 100) / 100); }
  return s.replace('-', '−');
}
const wgMag = x => { let m = 1; if (!(x > 0)) return 1; while (m > x) m /= 10; while (m * 10 <= x) m *= 10; return m; };
function wgTicks(lo, hi, n) {   // round tick values inside [lo, hi]
  const span = hi - lo; if (!(span > 0) || n < 2) return [lo, hi];
  const raw = span / n, mag = wgMag(raw), m = raw / mag, st = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * mag, out = [];
  for (let k = Math.ceil(lo / st - 1e-9); k * st <= hi + st * 1e-9; k++) out.push(Math.abs(k * st) < st * 1e-9 ? 0 : Math.round(k * st / mag * 1e6) / 1e6 * mag);
  return out.length >= 2 ? out : [lo, hi];
}
function wgNice(lo, hi) {   // an auto range widened to round ends
  if (!(hi > lo)) return [lo, lo + 1]; const raw = (hi - lo) / 4, mag = wgMag(raw), m = raw / mag, st = (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * mag;
  return [Math.floor(lo / st + 1e-9) * st, Math.ceil(hi / st - 1e-9) * st];
}
function wgNorm3(f) {   // barycentric [a, b, c], clamped and normalised
  const a = Math.max(0, +(f && f[0]) || 0), b = Math.max(0, +(f && f[1]) || 0), cc = Math.max(0, +(f && f[2]) || 0), t = a + b + cc;
  return t > 0 ? [a / t, b / t, cc / t] : [1 / 3, 1 / 3, 1 / 3];
}
// triangle geometry: corner 0 bottom-left, 1 top, 2 bottom-right. For HW, f = [AA, Aa, aa]: across = share of a, up = Aa
function wgTri(x0, base, size) {
  const H = size * 0.8660254037844386;
  return { x0, base, size, H,
    P(f) { const q = wgNorm3(f); return [x0 + (q[1] / 2 + q[2]) * size, base - q[1] * H]; },
    inv(x, y) { const b = clamp((base - y) / H, 0, 1), cc = (x - x0) / size - b / 2; return wgNorm3([1 - b - cc, b, cc]); } };
}

/* ---------- XY frame shared by trace, dots, scatter and genome ---------- */
function wgAx(a, lo, hi) {
  a = a || {}; let l = a.lo != null ? +a.lo : lo, h = a.hi != null ? +a.hi : hi;
  if (!wgFin(l)) l = 0; if (!wgFin(h) || h <= l) h = l + 1;
  return { lo: l, hi: h, label: a.label || '', fmt: a.fmt };
}
function wgXY(w, h, spec, T, c, d) {   // d: {xlo, xhi, ylo, yhi, labels}; ticks sit inside the plot (D4 §4.2), end labels in a right margin
  const pad = T.proj ? 8 : 4, tk = T.tk, top = pad + (spec.title ? tk + 5 : 0);
  let rm = 0; if (!T.compact) for (const s of d.labels || []) if (s) rm = Math.max(rm, wgW(c, s, tk, 'b', 600) + 22); rm = Math.min(rm, Math.round(w * 0.32));   // compact: no end-label margin
  const bot = tk + 5 + pad, plot = { x: pad, y: top, w: Math.max(12, w - 2 * pad - rm), h: Math.max(12, h - top - bot) };
  const xs = wgAx(spec.x, d.xlo, d.xhi), ys = wgAx(spec.y, d.ylo, d.yhi), G = { w, h, pad, tk, plot, xs, ys, rm };
  G.X = v => plot.x + (v - xs.lo) / (xs.hi - xs.lo) * plot.w; G.Y = v => plot.y + plot.h - (v - ys.lo) / (ys.hi - ys.lo) * plot.h;
  G.ix = px => xs.lo + (px - plot.x) / plot.w * (xs.hi - xs.lo); G.iy = py => ys.lo + (plot.y + plot.h - py) / plot.h * (ys.hi - ys.lo);
  return G;
}
function wgAxes(c, G, spec, T, o) {   // frame: designed dashed, real solid (D4 disclosure marks); bare axes when unset
  o = o || {}; const p = G.plot, I = T.I, tk = G.tk, xs = G.xs, ys = G.ys;
  c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.55);
  if (spec.frame === 'designed' || spec.frame === 'real') { c.setLineDash(spec.frame === 'real' ? [] : [4, 3]); c.strokeRect(p.x + 0.5, p.y + 0.5, p.w - 1, p.h - 1); c.setLineDash([]); }
  else { c.beginPath(); c.moveTo(p.x + 0.5, p.y); c.lineTo(p.x + 0.5, p.y + p.h - 0.5); c.lineTo(p.x + p.w, p.y + p.h - 0.5); c.stroke(); }
  if (!o.noX) {   // x ticks under the plot; the axis label in the middle when it fits
    const ty = p.y + p.h + 3 + tk / 2, lab = xs.label, lw = lab ? wgW(c, lab, tk, 'b', 600) : 0, lx0 = p.x + p.w / 2 - lw / 2, boxes = [];
    const xt = o.xticks || (p.w > 260 ? wgTicks(xs.lo, xs.hi, 4) : [xs.lo, xs.hi]);
    xt.forEach((v, k) => {
      const s = o.xfmt ? o.xfmt(v) : wgFmt(xs.fmt, v), x = G.X(v), w = wgW(c, s, tk); let x0 = x - w / 2;
      if (x0 < p.x) x0 = p.x; if (x0 + w > p.x + p.w) x0 = p.x + p.w - w;
      if (lab && k > 0 && k < xt.length - 1 && x0 < lx0 + lw + 6 && x0 + w > lx0 - 6) return;
      if (boxes.some(b => x0 < b[1] + 6 && x0 + w > b[0] - 6)) return;
      boxes.push([x0, x0 + w]); wgText(c, s, x0, ty, tk, I.text2);
      c.beginPath(); c.moveTo(x, p.y + p.h); c.lineTo(x, p.y + p.h - 4); c.stroke();
    });
    if (lab && !T.compact && !boxes.some(b => lx0 < b[1] + 6 && lx0 + lw > b[0] - 6)) wgText(c, lab, lx0, ty, tk, I.text2, { fam: 'b', wt: 600 });
  }
  if (!o.noY && T.compact) {   // compact (folded phone strip): tick marks only; the numbers and the label are in the open strip and Show data
    for (const v of [ys.lo, ys.hi]) { const y = G.Y(v); c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + 4, y); c.stroke(); }
  } else if (!o.noY) {   // y ticks inside the plot at the left; the label rides on the top tick
    const yt = p.h > 110 ? wgTicks(ys.lo, ys.hi, 3) : [ys.lo, ys.hi];
    yt.forEach((v, k) => {
      const y = G.Y(v); c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + 4, y); c.stroke();
      let s = wgFmt(ys.fmt, v); if (k === yt.length - 1 && ys.label) s += ' ' + ys.label;
      const base = y <= p.y + tk ? 'top' : y >= p.y + p.h - tk ? 'bottom' : 'middle';
      wgText(c, s, p.x + 6, base === 'top' ? y + 2 : base === 'bottom' ? y - 2 : y, tk, I.text2, { base, halo: I.surface });
    });
  }
}
function wgTitle(c, G, spec, T, right) {   // the chart's own title (≤ 4 words); right: legend items [{draw(c, x, y), text}]
  if (!spec.title) return; const y = G.pad + T.tk / 2 + 1, tw = wgW(c, spec.title, T.tk, 'b', 700);
  wgText(c, spec.title, G.pad, y, T.tk, T.I.text2, { fam: 'b', wt: 700 });
  if (!right || !right.length) return;
  let x = G.w - G.pad; const items = right.slice().reverse();
  for (const it of items) { const w = wgW(c, it.text, T.tk, 'b', 600) + 16; if (x - w < G.pad + tw + 10) break; x -= w; it.draw(c, x + 5, y); wgText(c, it.text, x + 13, y, T.tk, T.I.text, { fam: 'b', wt: 600 }); x -= 8; }
}
function wgTarget(c, G, tg, axis, T) {   // target band, hatched (D4 §4.2)
  if (!tg || !wgFin(+tg.lo) || !wgFin(+tg.hi)) return; const p = G.plot, col = wgRgba(T.I.text, 0.4);
  if (axis === 'x') { const a = clamp(G.X(+tg.lo), p.x, p.x + p.w), b = clamp(G.X(+tg.hi), p.x, p.x + p.w); wgHatch(c, Math.min(a, b), p.y, Math.abs(b - a), p.h, col, 6); }
  else { const a = clamp(G.Y(+tg.lo), p.y, p.y + p.h), b = clamp(G.Y(+tg.hi), p.y, p.y + p.h); wgHatch(c, p.x, Math.min(a, b), p.w, Math.abs(b - a), col, 6); }
}
function wgEnds(c, G, items, T) {   // direct end labels in the right margin, nudged apart; marker in the entity colour, words in text ink
  if (!items.length || G.rm < 24 || T.compact) return; const p = G.plot, tk = G.tk, gap = tk + 2, x = p.x + p.w + 6, maxW = G.rm - 20;
  items.sort((a, b) => a.y - b.y);
  for (const it of items) it.ly = clamp(it.y, p.y + tk / 2, p.y + p.h - tk / 2);
  for (let i = 1; i < items.length; i++) if (items[i].ly < items[i - 1].ly + gap) items[i].ly = items[i - 1].ly + gap;
  const over = items[items.length - 1].ly - (p.y + p.h - tk / 2); if (over > 0) for (const it of items) it.ly -= over;
  for (const it of items) {
    let s = String(it.text); while (s.length > 3 && wgW(c, s, tk, 'b', 600) > maxW) s = s.slice(0, -2) + '…';
    if (it.dash) { c.setLineDash([3, 2]); c.lineWidth = 2; c.strokeStyle = it.col; c.beginPath(); c.moveTo(x, it.ly); c.lineTo(x + 8, it.ly); c.stroke(); c.setLineDash([]); }
    else if (it.you) wgDiamond(c, x + 4, it.ly, 4, T.I.text, T.I.surface, 1.5); else wgMark(c, it.role, x + 4, it.ly, 3.5, it.col, T.I.surface);
    wgText(c, s, x + 12, it.ly, tk, T.I.text, { fam: 'b', wt: 600 });
  }
}
function wgYou(c, G, you, T, kind) {   // the common "you" field: {x, y, label} or a number
  if (you == null) return; const p = G.plot; let x, y;
  if (typeof you === 'number') { if (kind === 'y') { x = G.nextX != null ? G.X(G.nextX) : p.x + p.w - 8; y = G.Y(you); } else { x = G.X(you); y = p.y + p.h; } }
  else { x = G.X(+you.x); y = you.y != null ? G.Y(+you.y) : p.y + p.h; }
  x = clamp(x, p.x, p.x + p.w); y = clamp(y, p.y, p.y + p.h); const r = 6 * T.k;
  wgDiamond(c, x, y, r, T.I.text, T.I.surface, 2); if (T.compact) return;   // compact: the diamond alone
  const lab = (you && you.label) || 'you', right = x + r + 40 < G.w;
  wgText(c, lab, right ? x + r + 3 : x - r - 3, y - r, T.tk, T.I.text, { align: right ? 'left' : 'right', fam: 'b', wt: 700, halo: T.I.surface });
}

/* ================= LiveGraph (API_v2 §7.1) ================= */
const LiveGraph = {
  warnings: [], errors: [], T: {},   // T: type → {lay(w, h, spec, T, c) → geometry, draw(c, G, spec, T), rows(spec) → {head, rows}, say(spec)}
  /* Compact mode (Batch 1, asked by all five units): a chart under 100 CSS px tall (the folded 112 px phone strip) drops its
     title, legend, end labels, axis labels, y numbers and "you" words, keeping marks, lines, x numbers and the Predict ghost.
     spec.compact: true or false overrides the height rule. Types read T.compact to drop their own extra words. */
  _compact(spec, h) { return spec.compact != null ? !!spec.compact : h < 100; },
  draw(cv, spec, theme) {
    if (!cv || !spec || !cv.getContext) return;
    const f = fitCanvas(cv), c = f.c, T = wgT(theme || wgTheme0()), ty = this.T[spec.type];
    T.compact = this._compact(spec, f.h); const sp = T.compact && spec.title ? Object.assign({}, spec, { title: '' }) : this._cap(cv, spec);
    c.clearRect(0, 0, f.w, f.h); c.save();
    try {
      if (!ty) { wgText(c, spec.title || 'Graph', f.w / 2, f.h / 2, T.tk, T.I.text2, { align: 'center', fam: 'b' }); return; }
      const G = ty.lay(f.w, f.h, sp, T, c); G.type = spec.type;
      ty.draw(c, G, sp, T);
      wgTitle(c, G, sp, T, G.legend);
      const i = spec.chart != null ? spec.chart : this._index(cv), ov = i >= 0 && typeof Predict !== 'undefined' ? Predict.overlay(i) : null;
      if (ov) Predict._draw(c, G, sp, T, ov);
      cv._lg = { spec, G, theme: T.th, i };
      const lab = this._aria(spec); if (lab && cv.setAttribute && cv.getAttribute('aria-label') !== lab) cv.setAttribute('aria-label', lab);
    } catch (e) { this._err(e); } finally { c.restore(); }
  },
  map(cv, spec) {   // → {X, Y, ix, iy, plot, …}; tri adds {P, inv}, pq adds {bar}
    const ty = this.T[spec && spec.type]; if (!cv || !ty) return null;
    const r = this._size(cv), T = wgT(cv._lg ? cv._lg.theme : wgTheme0()), c = cv.getContext('2d');
    T.compact = this._compact(spec, r.h); const sp = T.compact && spec.title ? Object.assign({}, spec, { title: '' }) : this._cap(cv, spec);
    c.save(); try { return ty.lay(r.w, r.h, sp, T, c); } finally { c.restore(); }
  },
  table(spec) {   // the data twin behind "Show data" (≤ 60 rows)
    const ty = this.T[spec && spec.type]; if (!ty || !ty.rows) return '';
    let r = null; try { r = ty.rows(spec); } catch (e) { return ''; }
    if (!r || !r.rows || !r.rows.length) return '';
    let rows = r.rows; const more = rows.length > 60 ? rows.length - 60 : 0; if (more) rows = rows.slice(-60);
    const cap = '<caption>' + wgEsc(spec.title || spec.type) + (spec.frame === 'real' && spec.source ? ' (' + wgEsc(spec.source) + ')' : '') + '</caption>';
    return '<table class="lg-data">' + cap + '<tr>' + r.head.map(x => '<th scope="col">' + wgEsc(x) + '</th>').join('') + '</tr>' +
      (more ? '<tr><td colspan="' + r.head.length + '">' + more + ' earlier rows not shown</td></tr>' : '') +
      rows.map(row => '<tr>' + row.map((x, k) => k ? '<td class="mono">' + wgEsc(x) + '</td>' : '<th scope="row">' + wgEsc(x) + '</th>').join('') + '</tr>').join('') + '</table>';
  },
  sig(spec) {   // a fast hash of the spec's data (functions skipped) plus the Predict state; the strip skips unchanged redraws
    const F = this._f || (this._f = new Float64Array(1)), U = this._u || (this._u = new Uint32Array(F.buffer)); let h = 2166136261, n = 0;
    const mix = x => { h = Math.imul(h ^ x, 16777619); };
    const walk = (v, d) => {
      if (++n > 60000 || d > 8) return;
      if (v == null) { mix(1); return; }
      const t = typeof v;
      if (t === 'number') { F[0] = v; mix(U[0]); mix(U[1]); return; }
      if (t === 'string') { mix(v.length + 11); for (let i = 0; i < v.length; i++) mix(v.charCodeAt(i)); return; }
      if (t === 'boolean') { mix(v ? 3 : 2); return; }
      if (t !== 'object') return;
      if (Array.isArray(v) || ArrayBuffer.isView(v)) { mix(v.length + 7); for (let i = 0; i < v.length; i++) walk(v[i], d + 1); return; }
      for (const k in v) { const x = v[k]; if (typeof x === 'function') continue; walk(k, d + 1); walk(x, d + 1); }
    };
    walk(spec, 0); return (h >>> 0).toString(36) + '.' + (typeof Predict !== 'undefined' ? Predict.ver : 0);
  },
  _cap(cv, spec) {   // the strip's own caption already shows this title: draw no second one in the canvas
    const fig = cv && cv.parentNode, cap = fig && fig.firstChild;
    if (!spec.title || !cap || cap.tagName !== 'FIGCAPTION' || cap.textContent !== spec.title) return spec;
    let shown = false; try { shown = getComputedStyle(cap).display !== 'none'; } catch (e) { shown = false; }
    return shown ? Object.assign({}, spec, { title: '' }) : spec;
  },
  _index(cv) { if (typeof Strip === 'undefined' || !Strip.canvas) return -1; for (let i = 0; i < 12; i++) { const k = Strip.canvas(i); if (!k) return -1; if (k === cv) return i; } return -1; },
  _size(cv) { const r = cv.getBoundingClientRect ? cv.getBoundingClientRect() : null; return { w: Math.max(10, (r && r.width) || cv.clientWidth || cv.width || 10), h: Math.max(10, (r && r.height) || cv.clientHeight || cv.height || 10) }; },
  _aria(spec) { const ty = this.T[spec.type]; let s = ''; try { s = ty && ty.say ? ty.say(spec) : ''; } catch (e) { s = ''; } return (spec.title || 'Graph') + (s ? ': ' + s : ''); },
  _warn(s) { if (this.warnings.indexOf(s) < 0 && this.warnings.length < 50) this.warnings.push(s); },
  _err(e) { this.errors.push(String(e && e.stack || e)); if (this.errors.length === 1 && typeof showErr === 'function') showErr(e); }
};

/* ---- trace: realised solid with a marker, replicates as a thin fan, expected dashed, events as marks ---- */
LiveGraph.T.trace = {
  pts(d, x0, st) { const out = []; if (!d) return out; for (let i = 0; i < d.length; i++) { const v = d[i]; if (Array.isArray(v)) out.push([+v[0], wgFin(+v[1]) && v[1] != null ? +v[1] : null]); else out.push([x0 + i * st, v != null && wgFin(+v) ? +v : null]); } return out; },
  ext(spec) {
    const x0 = spec.x && spec.x.lo != null ? +spec.x.lo : 0, st = (spec.x && +spec.x.step) || 1; let xl = Infinity, xh = -Infinity, yl = Infinity, yh = -Infinity, lastX = null;
    const eat = (d, main) => { let lx = null; for (const p of this.pts(d, x0, st)) { if (p[0] < xl) xl = p[0]; if (p[0] > xh) xh = p[0]; if (p[1] != null) { lx = p[0]; if (p[1] < yl) yl = p[1]; if (p[1] > yh) yh = p[1]; } } if (main && lx != null && (lastX == null || lx > lastX)) lastX = lx; };
    for (const s of spec.series || []) eat(s.d, true); for (const g of spec.ghost || []) eat(g.d); for (const f of spec.fan || []) eat(f);
    return { x0, st, xl, xh, yl, yh, lastX };
  },
  lay(w, h, spec, T, c) {
    const e = this.ext(spec), labels = [];
    for (const s of spec.series || []) if (s.label || s.you) labels.push(s.label || 'you');
    for (const g of spec.ghost || []) if (g.label) labels.push(g.label);
    const G = wgXY(w, h, spec, T, c, { xlo: wgFin(e.xl) ? e.xl : 0, xhi: wgFin(e.xh) && e.xh > e.xl ? e.xh : (wgFin(e.xl) ? e.xl : 0) + 1, ylo: Math.min(0, wgFin(e.yl) ? wgNice(e.yl, e.yh)[0] : 0), yhi: wgFin(e.yh) && e.yh > 0 ? wgNice(Math.min(0, e.yl), e.yh)[1] : 1, labels });
    G.x0 = e.x0; G.st = e.st; G.nextX = e.lastX != null ? e.lastX + e.st : null; return G;
  },
  path(c, G, pts) { c.beginPath(); let on = false; for (const q of pts) { if (q[1] == null) { on = false; continue; } const x = G.X(q[0]), y = G.Y(q[1]); if (on) c.lineTo(x, y); else { c.moveTo(x, y); on = true; } } },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, series = spec.series || [], ends = [];
    wgTarget(c, G, spec.target, 'y', T); wgAxes(c, G, spec, T);
    if (series.filter(s => s.ink && s.ink !== 'ink').length > 3) LiveGraph._warn('trace "' + (spec.title || '') + '": more than 3 hued series');
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip(); c.lineJoin = 'round'; c.lineCap = 'round';
    c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.3); c.setLineDash([2, 3]);
    for (const m of spec.marks || []) { const x = G.X(+m); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); }
    c.setLineDash([]); c.strokeStyle = wgRgba(I.text2, 0.42);
    for (const f of spec.fan || []) { this.path(c, G, this.pts(f, G.x0, G.st)); c.stroke(); }
    c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.setLineDash([6, 4]);
    for (const g of spec.ghost || []) { const pts = this.pts(g.d, G.x0, G.st); this.path(c, G, pts); c.stroke(); const l = pts.filter(q => q[1] != null).pop(); if (l && g.label) ends.push({ y: G.Y(l[1]), text: g.label, col: I.text, dash: true }); }
    c.setLineDash([]);
    const tips = [];
    for (const s of series) {
      const pts = this.pts(s.d, G.x0, G.st), col = T.line(s.ink); c.lineWidth = (s.you ? 3.5 : 3) * T.k; c.strokeStyle = col; this.path(c, G, pts); c.stroke();
      const l = pts.filter(q => q[1] != null).pop(); if (!l) continue; const x = G.X(l[0]), y = G.Y(l[1]); tips.push([x, y, s, col]);
      if (s.label || s.you) ends.push({ y, text: s.label || 'you', col, role: s.ink, you: s.you });
    }
    c.restore();
    if (G.nextX != null) { const x = G.X(G.nextX - G.st); if (x > p.x + 2 && x < p.x + p.w - 2) { c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.35); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, p.y + p.h); c.stroke(); } }   // playhead
    for (const [x, y, s, col] of tips) { if (y < p.y - 1 || y > p.y + p.h + 1) continue; if (s.you) wgDiamond(c, x, y, 6 * T.k, I.text, I.surface, 2); else wgMark(c, s.ink, x, y, 3.5 * T.k, col, I.surface); }
    wgEnds(c, G, ends, T); wgYou(c, G, spec.you, T, 'y');
  },
  rows(spec) {
    const e = this.ext(spec), S = spec.series || [], Gh = spec.ghost || [], cols = S.map(s => this.pts(s.d, e.x0, e.st)).concat(Gh.map(g => this.pts(g.d, e.x0, e.st)));
    const head = [(spec.x && spec.x.label) || 'x'].concat(S.map((s, i) => s.label || (s.you ? 'you' : 'series ' + (i + 1))), Gh.map((g, i) => (g.label || 'expected') + (Gh.length > 1 ? ' ' + (i + 1) : '') + ' (expected)'));
    const xsSet = new Map(); for (const col of cols) for (const q of col) if (!xsSet.has(q[0])) xsSet.set(q[0], 1);
    const xs = Array.from(xsSet.keys()).sort((a, b) => a - b), fy = spec.y && spec.y.fmt, fx = spec.x && spec.x.fmt;
    return { head, rows: xs.map(x => [wgFmt(fx, x)].concat(cols.map(col => { const q = col.find(r => r[0] === x); return q && q[1] != null ? wgFmt(fy, q[1]) : ''; }))) };
  },
  say(spec) { const fy = spec.y && spec.y.fmt; return (spec.series || []).map(s => { const d = (s.d || []).filter(v => v != null); const l = d[d.length - 1]; return (s.label || 'series') + ' ' + wgFmt(fy, Array.isArray(l) ? l[1] : l); }).join(', '); }
};

/* ---- dots: a dot histogram; eaten hollow, spared solid, offspring hatched; S arrow in selection ink, R arrow ink ---- */
LiveGraph.T.dots = {
  ext(spec) { let lo = Infinity, hi = -Infinity; for (const g of spec.groups || []) for (const v of g.v || []) if (wgFin(v)) { if (v < lo) lo = v; if (v > hi) hi = v; } if (!wgFin(lo)) { lo = 0; hi = 1; } if (hi <= lo) hi = lo + 1; return wgNice(lo, hi); },
  lay(w, h, spec, T, c) {
    const e = this.ext(spec), G = wgXY(w, h, spec, T, c, { xlo: e[0], xhi: e[1], ylo: 0, yhi: 1, labels: [] });
    G.bins = Math.max(2, Math.min(60, spec.bins || 16));
    G.legend = (spec.groups || []).filter(g => g.label).map(g => ({ text: g.label, draw: (cc, x, y) => this.dot(cc, x, y, 4, g.style, T) }));
    return G;
  },
  counts(vals, G) { const nb = G.bins, xs = G.xs, a = new Array(nb).fill(0); for (const v of vals || []) if (wgFin(v)) a[clamp(Math.floor((v - xs.lo) / (xs.hi - xs.lo) * nb), 0, nb - 1)]++; return a; },
  dot(c, x, y, r, style, T) {
    const col = T.I.text; c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (style === 'hollow') { c.lineWidth = Math.max(1, Math.min(1.5, r * 0.4)); c.strokeStyle = col; c.stroke(); return; }
    if (style === 'hatched') {
      c.lineWidth = Math.max(1, Math.min(1.5, r * 0.4)); c.strokeStyle = col; c.stroke();
      if (r >= 3) { c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.lineWidth = Math.max(0.8, r * 0.28); c.beginPath(); for (let k = -2; k <= 2; k++) { c.moveTo(x - r + k * r * 0.7, y + r); c.lineTo(x + r + k * r * 0.7, y - r); } c.stroke(); c.restore(); }
      else { c.beginPath(); c.arc(x, y, r * 0.45, 0, TAU); c.fillStyle = col; c.fill(); }
      return;
    }
    c.fillStyle = col; c.fill();
  },
  bar(c, x, y, w, h, style, T) {
    if (h <= 0) return; const col = T.I.text;
    if (style === 'hollow') { c.lineWidth = 1; c.strokeStyle = col; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); }
    else if (style === 'hatched') { c.lineWidth = 1; c.strokeStyle = col; c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); wgHatch(c, x, y, w, h, col, 4); }
    else { c.fillStyle = col; c.fillRect(x, y, w, h); }
  },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, nb = G.bins, bw = p.w / nb, groups = spec.groups || [], cnt = groups.map(g => this.counts(g.v, G));
    wgTarget(c, G, spec.target, 'x', T); wgAxes(c, G, spec, T, { noY: true });
    const gc = Array.isArray(spec.ghost) ? this.counts(spec.ghost, G) : null;
    let mx = 1; for (let i = 0; i < nb; i++) { let s = 0; for (const a of cnt) s += a[i]; mx = Math.max(mx, s, gc ? gc[i] : 0); }
    const top = p.y + (spec.arrows ? (spec.arrows.S && spec.arrows.R ? 2 : 1) * (G.tk + 4) + 2 : 3), avail = Math.max(6, p.y + p.h - 1 - top);
    const r = Math.min(bw / 2 - 0.5, avail / (2 * mx), 7 * T.k), base = p.y + p.h - 1;
    for (let i = 0; i < nb; i++) {
      let k = 0, y = base; const cx = p.x + (i + 0.5) * bw;
      groups.forEach((g, gi) => {
        const n = cnt[gi][i]; if (!n) return;
        if (r >= 1.6) for (let j = 0; j < n; j++, k++) this.dot(c, cx, base - r - k * 2 * r, r * 0.9, g.style, T);
        else { const hh = n / mx * avail; this.bar(c, p.x + i * bw + 0.5, y - hh, Math.max(1, bw - 1), hh, g.style, T); y -= hh; }
      });
    }
    c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.setLineDash([5, 3]);   // expected: dashed outline histogram or a dashed mean line
    if (gc) { const u = r >= 1.6 ? 2 * r : avail / mx; c.beginPath(); for (let i = 0; i < nb; i++) { const y = base - gc[i] * u, x = p.x + i * bw; if (i === 0) c.moveTo(x, base); c.lineTo(x, y); c.lineTo(x + bw, y); } c.lineTo(p.x + p.w, base); c.stroke(); }
    else if (wgFin(spec.ghost)) { const x = G.X(spec.ghost); c.beginPath(); c.moveTo(x, p.y); c.lineTo(x, base); c.stroke(); }
    c.setLineDash([]);
    if (spec.marker && wgFin(+spec.marker.v)) { const x = clamp(G.X(+spec.marker.v), p.x, p.x + p.w); c.lineWidth = 1.5; c.strokeStyle = I.text; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, top); c.lineTo(x, base); c.stroke(); c.setLineDash([]); if (spec.marker.label) wgText(c, spec.marker.label, x + 3, top + G.tk / 2, G.tk, I.text, { fam: 'b', wt: 600, halo: I.surface }); }
    const A = spec.arrows; let ay = p.y + G.tk / 2 + 3;   // S and R arrows above the dots
    for (const key of ['S', 'R']) {
      const a = A && A[key]; if (!a || !wgFin(+a[0]) || !wgFin(+a[1])) continue;
      const x1 = clamp(G.X(+a[0]), p.x, p.x + p.w), x2 = clamp(G.X(+a[1]), p.x, p.x + p.w), col = key === 'S' ? T.line('sel') : I.text;
      if (Math.abs(x2 - x1) > 3) wgArrow(c, x1, ay, x2, ay, col, 2.5 * T.k, 7 * T.k); else { c.fillStyle = col; c.beginPath(); c.arc(x1, ay, 3, 0, TAU); c.fill(); }
      const lx = x2 >= x1 ? Math.min(x1, x2) - 3 : Math.max(x1, x2) + 3; wgText(c, key, lx, ay, G.tk, I.text, { align: x2 >= x1 ? 'right' : 'left', fam: 'b', wt: 700, halo: I.surface });
      ay += G.tk + 4;
    }
    wgYou(c, G, spec.you, T, 'x');
  },
  rows(spec) {
    const e = this.ext(spec), G = { bins: Math.max(2, Math.min(60, spec.bins || 16)), xs: wgAx(spec.x, e[0], e[1]) }, gs = spec.groups || [], cnt = gs.map(g => this.counts(g.v, G)), bw = (G.xs.hi - G.xs.lo) / G.bins, f = G.xs.fmt;
    const rows = []; for (let i = 0; i < G.bins; i++) { if (!cnt.some(a => a[i])) continue; rows.push([wgFmt(f, G.xs.lo + i * bw) + '–' + wgFmt(f, G.xs.lo + (i + 1) * bw)].concat(cnt.map(a => String(a[i])))); }
    return { head: [(spec.x && spec.x.label) || 'bin'].concat(gs.map((g, i) => g.label || 'group ' + (i + 1))), rows };
  },
  say(spec) { return (spec.groups || []).map(g => (g.label || 'group') + ' ' + (g.v || []).length).join(', '); }
};

/* ---- pq: the 100% stacked allele bar, numerals ≥ 14 px; three or more alleles as lettered chips ---- */
LiveGraph.T.pq = {
  parts(spec) {
    const p = clamp(+spec.p || 0, 0, 1), ps = spec.parts && spec.parts.length ? spec.parts.map((q, i) => ({ v: Math.max(0, +q.v || 0), allele: q.allele != null ? q.allele : i, label: q.label })) : [{ v: p, allele: 0 }, { v: 1 - p, allele: 1 }];
    const t = wgSum(ps.map(q => q.v)); if (t > 0) for (const q of ps) q.v /= t; return ps;
  },
  lay(w, h, spec, T, c) {
    const pad = T.proj ? 8 : 4, tk = T.tk, top = pad + (spec.title ? tk + 5 : 0), bot = tk + 6 + pad, avail = Math.max(10, h - top - bot);
    const bh = clamp(Math.round(avail * 0.62), 14, T.proj ? 56 : 36), bar = { x: pad + 9, w: Math.max(20, w - 2 * pad - 18), h: bh, y: Math.round(top + (avail - bh) / 2) };
    const G = { w, h, pad, tk, bar, plot: { x: bar.x, y: bar.y, w: bar.w, h: bar.h } };
    G.X = f => bar.x + clamp(f, 0, 1) * bar.w; G.ix = px => clamp((px - bar.x) / bar.w, 0, 1); G.Y = () => bar.y + bar.h / 2; G.iy = () => 0;
    return G;
  },
  draw(c, G, spec, T) {
    const b = G.bar, I = T.I, ps = this.parts(spec), many = ps.length > 2, px = Math.max(14, T.lb); let x = b.x;
    for (const q of ps) {
      const w = q.v * b.w, A = wgAllele(T, q.allele); q.x = x; q.w = w; q.A = A;
      if (w > 0.3) { c.fillStyle = A.fill; c.fillRect(x, b.y, w, b.h); if (A.over !== 'plain') { c.save(); c.beginPath(); c.rect(x, b.y, w, b.h); c.clip(); if (A.over === 'stripe') wgHatch(c, x, b.y, w, b.h, A.outline === I.paper ? I.paper : I.ink, 5, 1.5); else { c.fillStyle = I.ink; for (let yy = b.y + 3; yy < b.y + b.h; yy += 5) for (let xx = x + 3; xx < x + w; xx += 5) { c.beginPath(); c.arc(xx, yy, 1, 0, TAU); c.fill(); } } c.restore(); } }
      x += w;
    }
    wgTarget(c, { plot: b, X: G.X, Y: () => 0 }, spec.target, 'x', T);
    c.lineWidth = 1.5; c.strokeStyle = I.ink; c.strokeRect(b.x, b.y, b.w, b.h);
    for (const q of ps) if (q.x > b.x + 0.5 && q.w > 0.3) { c.beginPath(); c.moveTo(q.x, b.y); c.lineTo(q.x, b.y + b.h); c.stroke(); }
    if (T.th === 'dusk') { c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.5); c.strokeRect(b.x - 1.5, b.y - 1.5, b.w + 3, b.h + 3); }
    // numerals inside each segment when they fit, else the letter alone, else nothing (the table has them)
    const pc = wgPcts(ps.map(q => q.v));
    for (const [qi, q] of ps.entries()) {
      const name = q.label || (many ? q.A.letter : q.allele === 0 ? 'A' : q.allele === 1 ? 'a' : q.A.letter), full = name + ' ' + pc[qi] + '%', cx = q.x + q.w / 2, cy = b.y + b.h / 2;
      if (b.h < px + 2) continue;
      if (wgW(c, full, px, 'm', 700) + 8 < q.w) wgText(c, full, cx, cy, px, q.A.text, { align: 'center', wt: 700 });
      else if (wgW(c, name, px, 'b', 700) + 6 < q.w) wgText(c, name, cx, cy, px, q.A.text, { align: 'center', fam: 'b', wt: 700 });
    }
    if (wgFin(spec.ghost)) { const gx = G.X(spec.ghost); c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(gx, b.y - 6); c.lineTo(gx, b.y + b.h + 6); c.stroke(); c.setLineDash([]); }
    if (spec.n != null) wgText(c, spec.n + (spec.x_linked ? ' X copies' : ' copies'), b.x + b.w, b.y + b.h + 4 + G.tk / 2, G.tk, I.text2, { align: 'right' });
    if (wgFin(spec.you)) { const yx = G.X(spec.you); wgDiamond(c, yx, b.y - 2, 6 * T.k, I.text, I.surface, 2); }
  },
  rows(spec) { const ps = this.parts(spec), pc = wgPcts(ps.map(q => q.v)), nc = spec.n != null ? wgPcts(ps.map(q => q.v), Math.round(+spec.n || 0)) : null; return { head: ['allele', 'share', 'copies'], rows: ps.map((q, i) => [q.label || (ps.length > 2 ? 'ABCDEFGHIJKL'[q.allele % 12] : q.allele === 0 ? 'A' : 'a'), pc[i] + '%', nc ? String(nc[i]) : '']).concat(wgFin(spec.ghost) ? [['expected first share', Math.round(spec.ghost * 100) + '%', '']] : []) }; },
  say(spec) { const ps = this.parts(spec), pc = wgPcts(ps.map(q => q.v)); return ps.map((q, i) => (q.label || (q.allele === 0 ? 'A' : q.allele === 1 ? 'a' : 'ABCDEFGHIJKL'[q.allele % 12])) + ' ' + pc[i] + '%').join(', '); }
};

/* ---- tri: de Finetti triangle with the dashed HW curve, or a neutral simplex; dawn hollow, dusk filled, you a diamond ---- */
LiveGraph.T.tri = {
  lay(w, h, spec, T, c) {
    const pad = T.proj ? 8 : 4, tk = T.tk, big = h >= 150, top = pad + (big && spec.title ? tk + 8 : 3), bot = pad + (big ? tk + 6 : 3);
    const cn = this.corners(spec), lw = Math.max(wgW(c, cn[0], tk, 'b', 700), wgW(c, cn[2], tk, 'b', 700)) + 8;
    const size = Math.max(16, Math.min(w - 2 * pad - 2 * lw, (h - top - bot) / 0.8660254037844386)), H = size * 0.8660254037844386;
    const G = Object.assign(wgTri((w - size) / 2, top + (h - top - bot + H) / 2, size), { w, h, pad, tk, big });
    G.plot = { x: G.x0, y: G.base - H, w: size, h: H }; return G;
  },
  corners(spec) { return spec.corners || (spec.variant === 'simplex' ? ['A', 'B', 'C'] : ['AA', 'Aa', 'aa']); },
  frame(c, G, T, hw, cn) {
    const I = T.I, k = T.k, A = G.P([1, 0, 0]), B = G.P([0, 1, 0]), C = G.P([0, 0, 1]);
    c.lineWidth = 1.5 * k; c.strokeStyle = wgRgba(I.text, 0.85); c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.lineTo(C[0], C[1]); c.closePath(); c.stroke();
    if (hw) { c.setLineDash([5, 4]); c.lineWidth = 2 * k; c.strokeStyle = I.text; c.beginPath(); for (let j = 0; j <= 48; j++) { const p = 1 - j / 48, q = 1 - p, xy = G.P([p * p, 2 * p * q, q * q]); if (j) c.lineTo(xy[0], xy[1]); else c.moveTo(xy[0], xy[1]); } c.stroke(); c.setLineDash([]); }
    const o = { fam: 'b', wt: 700, halo: I.surface };
    if (G.big) { wgText(c, cn[0], A[0], A[1] + 4 + G.tk / 2, G.tk, I.text, Object.assign({ align: 'center' }, o)); wgText(c, cn[2], C[0], C[1] + 4 + G.tk / 2, G.tk, I.text, Object.assign({ align: 'center' }, o)); }
    else { wgText(c, cn[0], A[0] - 5, A[1] - 2, G.tk, I.text, Object.assign({ align: 'right' }, o)); wgText(c, cn[2], C[0] + 5, C[1] - 2, G.tk, I.text, o); }
    wgText(c, cn[1], B[0] + 7, B[1] + G.tk / 2, G.tk, I.text, o);
  },
  pt(c, G, T, f, kind, label) {
    const I = T.I, k = T.k, xy = G.P(f), x = xy[0], y = xy[1];
    if (kind === 'you') wgDiamond(c, x, y, 6 * k, I.text, I.surface, 2);
    else if (kind === 'ghost') { c.setLineDash([3, 2]); c.lineWidth = 2; c.strokeStyle = I.text; c.beginPath(); c.arc(x, y, 6 * k, 0, TAU); c.stroke(); c.setLineDash([]); }
    else if (kind === 'dawn') { c.beginPath(); c.arc(x, y, 5 * k, 0, TAU); c.fillStyle = I.surface; c.fill(); c.lineWidth = 2; c.strokeStyle = I.text; c.stroke(); }
    else { c.beginPath(); c.arc(x, y, 5 * k, 0, TAU); c.fillStyle = I.text; c.fill(); }
    const lab = kind === 'you' && !label ? 'you' : label;
    if (lab) { const right = x + 50 < G.w; wgText(c, lab, right ? x + 9 : x - 9, y - 7, G.tk, I.text, { align: right ? 'left' : 'right', fam: 'b', wt: 600, halo: I.surface }); }
  },
  draw(c, G, spec, T) {
    const I = T.I; this.frame(c, G, T, spec.variant !== 'simplex', this.corners(spec));
    const tr = spec.trail || []; if (tr.length > 1) { c.lineWidth = 1.5 * T.k; c.strokeStyle = I.text; c.beginPath(); tr.forEach((f, j) => { const xy = G.P(f); if (j) c.lineTo(xy[0], xy[1]); else c.moveTo(xy[0], xy[1]); }); c.stroke(); c.fillStyle = I.text; for (const f of tr) { const xy = G.P(f); c.beginPath(); c.arc(xy[0], xy[1], 1.8, 0, TAU); c.fill(); } }
    if (Array.isArray(spec.ghost)) this.pt(c, G, T, spec.ghost, 'ghost');
    for (const q of spec.pts || []) this.pt(c, G, T, q.f, q.kind, q.label);
    if (Array.isArray(spec.you)) this.pt(c, G, T, spec.you, 'you');
  },
  rows(spec) { const cn = this.corners(spec); return { head: ['point'].concat(cn), rows: (spec.pts || []).map(q => [q.label || q.kind || 'point'].concat(wgPcts(wgNorm3(q.f)).map(v => v + '%'))) }; },
  say(spec) { return (spec.pts || []).map(q => (q.label || q.kind) + ' ' + wgPcts(wgNorm3(q.f)).map(v => v + '%').join(' ')).join('; '); }
};

/* ---- scatter: shapes carry categories (disc solid, square barred, triangle dotted); dashed reference line; > 500 points as hatched cells ---- */
function wgShape(c, shape, x, y, r, fill, I) {
  c.beginPath();
  if (shape === 'square') c.rect(x - r, y - r, 2 * r, 2 * r);
  else if (shape === 'tri') { c.moveTo(x, y - r * 1.2); c.lineTo(x + r * 1.1, y + r * 0.8); c.lineTo(x - r * 1.1, y + r * 0.8); c.closePath(); }
  else c.arc(x, y, r, 0, TAU);
  c.fillStyle = fill; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.ink; c.stroke();
  if (shape === 'square') { c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r, y); c.stroke(); }
  else if (shape === 'tri') { c.beginPath(); c.arc(x, y + r * 0.1, Math.max(1, r * 0.3), 0, TAU); c.fillStyle = I.ink; c.fill(); }
}
LiveGraph.T.scatter = {
  all(spec) { const out = []; (spec.series || []).forEach((s, si) => { for (const q of s.pts || []) if (q && wgFin(+q[0]) && wgFin(+q[1])) out.push([+q[0], +q[1], si]); }); return out; },
  lay(w, h, spec, T, c) {
    const a = this.all(spec).concat(spec.fit || [], Array.isArray(spec.ghost) ? spec.ghost : []); let xl = Infinity, xh = -Infinity, yl = Infinity, yh = -Infinity;
    for (const q of a) { if (!wgFin(+q[0]) || !wgFin(+q[1])) continue; xl = Math.min(xl, +q[0]); xh = Math.max(xh, +q[0]); yl = Math.min(yl, +q[1]); yh = Math.max(yh, +q[1]); }
    if (!wgFin(xl)) { xl = 0; xh = 1; yl = 0; yh = 1; } const dx = (xh - xl) * 0.04 || 0.5, dy = (yh - yl) * 0.06 || 0.5, nx = wgNice(xl - dx, xh + dx), ny = wgNice(yl - dy, yh + dy);
    const G = wgXY(w, h, spec, T, c, { xlo: nx[0], xhi: nx[1], ylo: ny[0], yhi: ny[1], labels: [] });
    G.legend = (spec.series || []).filter(s => s.label).map(s => ({ text: s.label, draw: (cc, x, y) => wgShape(cc, s.shape, x, y, 4, s.ink ? T.fill(s.ink) : T.I.text2, T.I) }));
    return G;
  },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, all = this.all(spec), S = spec.series || [], r = 4 * T.k;
    wgTarget(c, G, spec.target, 'y', T); wgAxes(c, G, spec, T);
    c.save(); c.beginPath(); c.rect(p.x, p.y, p.w, p.h); c.clip();
    c.lineWidth = 1.5; c.strokeStyle = I.text; c.setLineDash([5, 4]); c.beginPath();
    if (spec.ref === 'diag') { const lo = Math.max(G.xs.lo, G.ys.lo), hi = Math.min(G.xs.hi, G.ys.hi); c.moveTo(G.X(lo), G.Y(lo)); c.lineTo(G.X(hi), G.Y(hi)); }
    else if (spec.ref === 'zero' || spec.ref === 'origin') { c.moveTo(p.x, G.Y(0)); c.lineTo(p.x + p.w, G.Y(0)); if (spec.ref === 'origin') { c.moveTo(G.X(0), p.y); c.lineTo(G.X(0), p.y + p.h); } }
    else if (spec.ref === 'mean' && all.length) { const m = wgSum(all.map(q => q[1])) / all.length; c.moveTo(p.x, G.Y(m)); c.lineTo(p.x + p.w, G.Y(m)); }
    c.stroke(); c.setLineDash([]);
    if (all.length <= 500) for (const q of all) { const s = S[q[2]]; wgShape(c, s.shape, G.X(q[0]), G.Y(q[1]), r, s.ink ? T.fill(s.ink) : I.text2, I); }
    else {   // too many points: hatched density cells
      const gx = Math.max(4, Math.round(p.w / 14)), gy = Math.max(3, Math.round(p.h / 14)), cell = new Array(gx * gy).fill(0); let mx = 1;
      for (const q of all) { const i = clamp(Math.floor((G.X(q[0]) - p.x) / p.w * gx), 0, gx - 1), j = clamp(Math.floor((G.Y(q[1]) - p.y) / p.h * gy), 0, gy - 1); mx = Math.max(mx, ++cell[j * gx + i]); }
      for (let j = 0; j < gy; j++) for (let i = 0; i < gx; i++) { const n = cell[j * gx + i]; if (!n) continue; const x = p.x + i * p.w / gx, y = p.y + j * p.h / gy; wgHatch(c, x, y, p.w / gx, p.h / gy, I.text, clamp(Math.round(12 - 9 * n / mx), 3, 12), 1); c.lineWidth = 0.5; c.strokeStyle = wgRgba(I.text, 0.4); c.strokeRect(x, y, p.w / gx, p.h / gy); }
      if (!this._said) { this._said = 1; LiveGraph._warn('scatter: over 500 points shown as density cells'); }
    }
    const line = (pts, dash) => { const q = pts.filter(v => v && wgFin(+v[0]) && wgFin(+v[1])).slice().sort((a, b) => a[0] - b[0]); if (q.length < 2) return; c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.setLineDash(dash ? [6, 4] : []); c.beginPath(); q.forEach((v, j) => { if (j) c.lineTo(G.X(+v[0]), G.Y(+v[1])); else c.moveTo(G.X(+v[0]), G.Y(+v[1])); }); c.stroke(); c.setLineDash([]); };
    if (spec.fit) line(spec.fit, false); if (Array.isArray(spec.ghost)) line(spec.ghost, true);
    c.restore(); wgYou(c, G, spec.you, T, 'x');
  },
  rows(spec) { const fx = spec.x && spec.x.fmt, fy = spec.y && spec.y.fmt, S = spec.series || []; return { head: ['series', (spec.x && spec.x.label) || 'x', (spec.y && spec.y.label) || 'y'], rows: this.all(spec).map(q => [S[q[2]].label || 'series ' + (q[2] + 1), wgFmt(fx, q[0]), wgFmt(fy, q[1])]) }; },
  say(spec) { return this.all(spec).length + ' points'; }
};

/* ---- xhud: X-linked HUD (D4 §4.2 chart 4): female triangle, male p bar with p_f marker and the p̄ tick, gap chip ---- */
LiveGraph.T.xhud = {
  lay(w, h, spec, T, c) {
    const pad = T.proj ? 8 : 4, tk = T.tk, top = pad + (h >= 150 && spec.title ? tk + 8 : 3), barH = 14 * T.k, chip = tk + 12, lw = wgW(c, 'aa', tk, 'b', 700) + 10;
    const size = Math.max(16, Math.min(w - 2 * pad - 2 * lw, (h - top - barH - chip - 14) / 0.8660254037844386)), H = size * 0.8660254037844386, x0 = (w - size) / 2;
    const G = Object.assign(wgTri(x0, top + H, size), { w, h, pad, tk, big: false }), bar = { x: x0, y: top + H + 8, w: size, h: barH };
    G.bar = bar; G.plot = { x: x0, y: top, w: size, h: H }; G.X = f => bar.x + clamp(f, 0, 1) * bar.w; G.ix = px => clamp((px - bar.x) / bar.w, 0, 1);
    return G;
  },
  draw(c, G, spec, T) {
    const I = T.I, pf = clamp(+spec.pf || 0, 0, 1), pm = clamp(+spec.pm || 0, 0, 1), qf = 1 - pf, qm = 1 - pm, b = G.bar;
    LiveGraph.T.tri.frame(c, G, T, false, ['AA', 'Aa', 'aa']);
    LiveGraph.T.tri.pt(c, G, T, [pf * pm, pf * qm + qf * pm, qf * qm], 'ghost');   // female genotypes expected from (p_f, p_m): a point, not the HW curve
    if (spec.female) LiveGraph.T.tri.pt(c, G, T, spec.female, 'dusk');
    const tr = (spec.trail || []).slice(-8);   // leapfrog: p_f above the bar, p_m below, older steps smaller
    tr.forEach((q, j) => { const s = 0.8 + 1.6 * (j + 1) / tr.length; c.fillStyle = I.text; c.beginPath(); c.arc(G.X(q[0]), b.y - 4, s, 0, TAU); c.fill(); c.fillRect(G.X(q[1]) - s, b.y + b.h + 2, 2 * s, 2 * s); });
    c.fillStyle = T.I.A; c.fillRect(b.x, b.y, b.w * pm, b.h); c.fillStyle = T.I.a; c.fillRect(b.x + b.w * pm, b.y, b.w * qm, b.h);
    c.lineWidth = 1.5; c.strokeStyle = I.ink; c.strokeRect(b.x, b.y, b.w, b.h);
    const pbar = (2 * pf + pm) / 3, tx = G.X(pbar); c.lineWidth = 2; c.strokeStyle = I.text; c.beginPath(); c.moveTo(tx, b.y - 5); c.lineTo(tx, b.y + b.h + 5); c.stroke();
    c.beginPath(); c.arc(G.X(pf), b.y + b.h / 2, 5 * T.k, 0, TAU); c.fillStyle = I.paper; c.fill(); c.lineWidth = 2; c.strokeStyle = I.ink; c.stroke();
    const gap = pf - pm; wgText(c, 'pf − pm = ' + wgFmt(null, Math.round(gap * 100) / 100), b.x + b.w / 2, b.y + b.h + 10 + G.tk / 2, G.tk, I.text, { align: 'center' });
  },
  rows(spec) { const pf = +spec.pf || 0, pm = +spec.pm || 0, f = spec.female ? wgNorm3(spec.female) : null; return { head: ['measure', 'value'], rows: (f ? (pf3 => [['females AA', pf3[0] + '%'], ['females Aa', pf3[1] + '%'], ['females aa', pf3[2] + '%']])(wgPcts(f)) : []).concat([['p in females', wgFmt(null, pf)], ['p in males', wgFmt(null, pm)], ['p̄ = (2pf + pm)/3', wgFmt(null, (2 * pf + pm) / 3)], ['gap pf − pm', wgFmt(null, pf - pm)]]) }; },
  say(spec) { return 'p in females ' + wgFmt(null, +spec.pf || 0) + ', in males ' + wgFmt(null, +spec.pm || 0); }
};

/* ================= DemeMap (by B3): demes as discs with a p|q bar, migration arrows 1–6 px by m ================= */
const DemeMap = {
  _last: null,
  lay(rect, spec, T) {
    const ds = spec.demes || [], Nmax = Math.max(1, ...ds.map(d => +d.N || 0)), lab = T.tk + 4, sc = Math.min(1, (rect.h - lab) / (56 * T.k), rect.w / Math.max(1, ds.length) / (60 * T.k));
    const pts = ds.map(d => { const D = Math.max(14, (40 + 16 * clamp((+d.N || Nmax) / Nmax, 0, 1)) * T.k * sc), r = D / 2; return { x: rect.x + r + clamp(+d.x || 0, 0, 1) * Math.max(0, rect.w - D), y: rect.y + r + clamp(+d.y || 0, 0, 1) * Math.max(0, rect.h - D - lab), r }; });
    return { rect, pts, plot: rect };
  },
  paint(c, G, spec, T) {
    const I = T.I, ds = spec.demes || [], L = spec.links || [], mmax = Math.max(1e-9, ...L.map(l => +l.m || 0));
    for (const l of L) {
      const a = G.pts[l.a], b = G.pts[l.b]; if (!a || !b || !(+l.m > 0)) continue;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / d, uy = dy / d, two = L.some(o => o.a === l.b && o.b === l.a), off = two ? 4 : 0;
      const lw = 1 + 5 * clamp(+l.m / mmax, 0, 1);
      wgArrow(c, a.x + ux * (a.r + 2) - uy * off, a.y + uy * (a.r + 2) + ux * off, b.x - ux * (b.r + 3) - uy * off, b.y - uy * (b.r + 3) + ux * off, T.line('mig'), lw, Math.max(6, lw * 2.4));
    }
    ds.forEach((d, i) => {
      const P = G.pts[i], p = clamp(+d.p || 0, 0, 1), bw = P.r * 1.44, bh = Math.max(6, P.r * 0.44);
      c.beginPath(); c.arc(P.x, P.y, P.r, 0, TAU); c.fillStyle = I.surface; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.text; c.stroke();
      c.fillStyle = I.A; c.fillRect(P.x - bw / 2, P.y - bh / 2, bw * p, bh); c.fillStyle = I.a; c.fillRect(P.x - bw / 2 + bw * p, P.y - bh / 2, bw * (1 - p), bh);
      c.lineWidth = 1; c.strokeStyle = I.ink; c.strokeRect(P.x - bw / 2, P.y - bh / 2, bw, bh);
      if (d.label) wgText(c, d.label, P.x, P.y + P.r + 2 + T.tk / 2, T.tk, I.text, { align: 'center', fam: 'b', wt: 600, halo: I.surface });
    });
  },
  draw(c, rect, spec, theme) { const T = wgT(theme || wgTheme0()), G = this.lay(rect, spec || {}, T); this.paint(c, G, spec || {}, T); this._last = G; return G; },
  hit(x, y) { const G = this._last; return G ? Stage.hit(x, y, G.pts, 22) : -1; }
};
LiveGraph.T.deme = {
  lay(w, h, spec, T) { const pad = T.proj ? 8 : 4, top = pad + (spec.title ? T.tk + 5 : 0); const G = DemeMap.lay({ x: pad + 2, y: top + 2, w: w - 2 * pad - 4, h: h - top - pad - 2 }, spec, T); return Object.assign(G, { w, h, pad, tk: T.tk }); },
  draw(c, G, spec, T) { DemeMap.paint(c, G, spec, T); },
  rows(spec) { return { head: ['deme', 'p', 'N'], rows: (spec.demes || []).map((d, i) => [d.label || 'deme ' + (i + 1), wgFmt(null, +d.p || 0), d.N != null ? String(d.N) : '']).concat((spec.links || []).map(l => ['migration ' + ((spec.demes[l.a] || {}).label || l.a) + ' → ' + ((spec.demes[l.b] || {}).label || l.b), 'm = ' + wgFmt(null, +l.m || 0), ''])) }; },
  say(spec) { return (spec.demes || []).map((d, i) => (d.label || 'deme ' + (i + 1)) + ' p ' + wgFmt(null, +d.p || 0)).join(', '); }
};

/* ================= PriceBars (Wave A): one force at two levels; between solid selection ink, within hatched, total ink ================= */
const PriceBars = {
  draw(c, rect, o, theme) { this.paint(c, rect, o || {}, wgT(theme || wgTheme0())); },
  paint(c, r, o, T) {
    const I = T.I, vals = [+o.between || 0, +o.within || 0, +o.total || 0], names = o.labels || ['between', 'within', 'total'], lab = T.tk + 6;
    const pos = Math.max(0, ...vals), neg = Math.max(0, ...vals.map(v => -v)), span = pos + neg || 1, hh = r.h - lab - 2 * (T.tk + 2), y0 = r.y + T.tk + 2 + hh * pos / span, cw = r.w / 3;
    vals.forEach((v, i) => {
      const bw = Math.min(cw * 0.5, 64 * T.k), x = r.x + i * cw + (cw - bw) / 2, h = Math.abs(v) / span * hh, y = v >= 0 ? y0 - h : y0;
      if (i === 0) { c.fillStyle = T.fill('sel'); c.fillRect(x, y, bw, h); c.lineWidth = 1.5; c.strokeStyle = I.ink; c.strokeRect(x, y, bw, h); }
      else if (i === 1) { wgHatch(c, x, y, bw, h, T.line('sel'), 5, 1.5); c.lineWidth = 2; c.strokeStyle = T.line('sel'); c.strokeRect(x, y, bw, h); }
      else { c.fillStyle = I.text; c.fillRect(x, y, bw, h); }
      wgText(c, wgFmt(o.fmt, v), x + bw / 2, v >= 0 ? y - 2 - T.tk / 2 : y + h + 2 + T.tk / 2, T.tk, I.text, { align: 'center' });
      wgText(c, names[i], x + bw / 2, r.y + r.h - lab / 2, T.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
    });
    c.lineWidth = 1; c.strokeStyle = I.text; c.beginPath(); c.moveTo(r.x, y0); c.lineTo(r.x + r.w, y0); c.stroke();
  }
};
LiveGraph.T.price = {
  lay(w, h, spec, T) { const pad = T.proj ? 8 : 4, top = pad + (spec.title ? T.tk + 5 : 0); return { w, h, pad, tk: T.tk, plot: { x: pad, y: top, w: w - 2 * pad, h: h - top - pad } }; },
  draw(c, G, spec, T) { PriceBars.paint(c, G.plot, spec, T); },
  rows(spec) { return { head: ['level', 'change'], rows: [['between groups', wgFmt(spec.fmt, +spec.between || 0)], ['within groups', wgFmt(spec.fmt, +spec.within || 0)], ['total', wgFmt(spec.fmt, +spec.total || 0)]] }; },
  say(spec) { return 'between ' + wgFmt(spec.fmt, +spec.between || 0) + ', within ' + wgFmt(spec.fmt, +spec.within || 0) + ', total ' + wgFmt(spec.fmt, +spec.total || 0); }
};

/* ================= TreeView: a rectangular tree; spin a node, reroot on a branch, Fitch step count ================= */
const TreeView = {
  create(o) {
    o = o || {}; const info = {}, adj = {}, len = {}, ek = (a, b) => a < b ? a + '|' + b : b + '|' + a; let root = null;
    for (const n of o.nodes || []) { info[n.id] = { id: n.id, label: n.label != null ? String(n.label) : '' }; adj[n.id] = []; }
    for (const n of o.nodes || []) { if (n.parent == null || !info[n.parent]) { if (root == null) root = n.id; continue; } adj[n.id].push(n.parent); adj[n.parent].push(n.id); if (n.t != null) len[ek(n.id, n.parent)] = +n.t; }
    const tv = {
      info, adj, len, root, rooted: o.rooted !== false, flip: {}, par: {}, pos: {}, vroot: null, tips: [],
      useLen: (o.nodes || []).filter(n => n.parent != null && info[n.parent]).every(n => n.t != null) && (o.nodes || []).length > 1,
      orient() { this.par = {}; const st = [this.root]; this.par[this.root] = null; while (st.length) { const x = st.pop(); for (const y of this.adj[x] || []) if (y !== this.par[x] && !(y in this.par)) { this.par[y] = x; st.push(y); } } return this; },
      kids(id) { const k = (this.adj[id] || []).filter(y => this.par[y] === id); return this.flip[id] ? k.reverse() : k; },
      spin(id) { if (this.info[id]) this.flip[id] = !this.flip[id]; return this; },
      reroot(id) {   // root on the branch above id (a virtual root splits it), as phylogenetics programs do
        if (!this.info[id] || id === this.root) return this;
        if (this.vroot != null) { const v = this.vroot, [a, b] = this.adj[v]; const L = (this.len[ek(v, a)] || 0) + (this.len[ek(v, b)] || 0); this.adj[a] = this.adj[a].map(x => x === v ? b : x); this.adj[b] = this.adj[b].map(x => x === v ? a : x); if (this.useLen) this.len[ek(a, b)] = L; delete this.adj[v]; delete this.info[v]; this.root = a; this.vroot = null; this.orient(); if (id === v) return this; }
        const p = this.par[id]; if (p == null) { this.root = id; return this.orient(); }
        const v = '__root', L = this.len[ek(id, p)];
        this.adj[id] = this.adj[id].map(x => x === p ? v : x); this.adj[p] = this.adj[p].map(x => x === id ? v : x); this.adj[v] = [id, p]; this.info[v] = { id: v, label: '' };
        if (L != null) { this.len[ek(v, id)] = L / 2; this.len[ek(v, p)] = L / 2; }
        this.root = v; this.vroot = v; return this.orient();
      },
      _len(a, b) { return this.useLen ? this.len[ek(a, b)] || 0 : 1; },
      layout(rect, c, T) {
        T = T || wgT(wgTheme0()); const tips = [], hgt = {}, dep = {}; this.pos = {}; this.tips = tips; if (this.root == null || !this.info[this.root]) return this;
        const walk = (id, d) => { dep[id] = d; const ks = this.kids(id); if (!ks.length) { tips.push(id); hgt[id] = 0; return 0; } let m = 0; for (const k of ks) m = Math.max(m, walk(k, d + this._len(id, k)) + this._len(id, k)); hgt[id] = m; return m; };
        const H = walk(this.root, 0) || 1, Dm = Math.max(1e-9, ...tips.map(t => dep[t]));
        let lw = 0; if (c) for (const t of tips) lw = Math.max(lw, wgW(c, this.info[t].label, T.tk, 'b', 600)); lw = Math.min(lw + 6, rect.w * 0.4);
        const x0 = rect.x + (this.rooted ? 12 : 3), x1 = Math.max(x0 + 10, rect.x + rect.w - lw - 4), dy = rect.h / Math.max(1, tips.length);
        tips.forEach((id, i) => { this.pos[id] = { x: this.useLen ? x0 + dep[id] / Dm * (x1 - x0) : x1, y: rect.y + dy * (i + 0.5) }; });
        const place = id => { const ks = this.kids(id); if (!ks.length) return this.pos[id]; const ps = ks.map(place); this.pos[id] = { x: this.useLen ? x0 + dep[id] / Dm * (x1 - x0) : x0 + (H - hgt[id]) / H * (x1 - x0), y: (ps[0].y + ps[ps.length - 1].y) / 2 }; return this.pos[id]; };
        place(this.root); this.tips = tips; this.x0 = x0; return this;
      },
      draw(c, rect, o2) {
        o2 = o2 || {}; const T = o2.T || wgT(o2.theme || wgTheme0()), I = T.I; this.layout(rect, c, T);
        c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.lineCap = 'square'; c.beginPath();
        const edge = id => { const p = this.pos[id], ks = this.kids(id); if (!ks.length) return; const a = this.pos[ks[0]], b = this.pos[ks[ks.length - 1]]; c.moveTo(p.x, a.y); c.lineTo(p.x, b.y); for (const k of ks) { const q = this.pos[k]; c.moveTo(p.x, q.y); c.lineTo(q.x, q.y); edge(k); } };
        edge(this.root); const r0 = this.pos[this.root]; if (this.rooted && r0) { c.moveTo(r0.x - 10, r0.y); c.lineTo(r0.x, r0.y); } c.stroke();
        for (const key in this.pos) { if (!this.info[key]) continue; const id = this.info[key].id, p = this.pos[key], tip = !this.kids(id).length; if (tip) wgText(c, this.info[id].label, p.x + 4, p.y, T.tk, I.text, { fam: 'b', wt: 600 }); else { c.beginPath(); c.arc(p.x, p.y, (o2.sel === id ? 5 : 3) * T.k, 0, TAU); c.fillStyle = o2.sel === id ? I.surface : I.text; c.fill(); if (o2.sel === id) { c.lineWidth = 2; c.stroke(); } } }
        return this;
      },
      hit(x, y) { let best = null, bd = 22 * 22; for (const id in this.pos) { if (!this.info[id]) continue; const p = this.pos[id], dx = p.x - x, dy = p.y - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = this.info[id].id; } } return best; },
      steps(states) {   // Fitch parsimony on the current tree: states {tipId: state}; polytomies take the commonest state
        let n = 0; const fit = id => { const ks = this.kids(id); if (!ks.length) { const s = states[id]; return s == null ? null : [String(s)]; } const sets = ks.map(fit).filter(Boolean); if (!sets.length) return null; const cnt = {}; for (const s of sets) for (const x of s) cnt[x] = (cnt[x] || 0) + 1; let m = 0; for (const x in cnt) m = Math.max(m, cnt[x]); n += sets.length - m; return Object.keys(cnt).filter(x => cnt[x] === m); };
        fit(this.root); return n;
      }
    };
    if (root == null && o.nodes && o.nodes.length) tv.root = o.nodes[0].id;
    return tv.orient();
  }
};
LiveGraph.T.tree = {
  lay(w, h, spec, T, c) {
    const pad = T.proj ? 8 : 4, top = pad + (spec.title ? T.tk + 5 : 0), tv = TreeView.create({ nodes: spec.nodes, rooted: spec.rooted !== false });
    if (spec.root != null) tv.reroot(spec.root); for (const id of spec.spin || []) tv.spin(id);
    const plot = { x: pad, y: top, w: w - 2 * pad, h: h - top - pad }; tv.layout(plot, c, T); return { w, h, pad, tk: T.tk, plot, tv };
  },
  draw(c, G, spec, T) { G.tv.draw(c, G.plot, { T, sel: spec.sel }); },
  rows(spec) { const tv = TreeView.create({ nodes: spec.nodes, rooted: spec.rooted !== false }); if (spec.root != null) tv.reroot(spec.root); for (const id of spec.spin || []) tv.spin(id); tv.layout({ x: 0, y: 0, w: 100, h: 100 }); return { head: ['tip', 'order'], rows: tv.tips.map((t, i) => [tv.info[t].label || String(t), String(i + 1)]) }; },
  say(spec) { return (spec.nodes || []).length + ' nodes'; }
};

/* ---- genome: a skyline by position (D4 §4.2 chart 8): chromosomes alternate by luminance; ≤ 1 mark per 2 px column ---- */
LiveGraph.T.genome = {
  lay(w, h, spec, T, c) {
    const ch = spec.chroms || [], pts = spec.pts || []; let xl = Infinity, xh = -Infinity, yh = 0;
    for (const q of ch) { xl = Math.min(xl, +q.lo); xh = Math.max(xh, +q.hi); } for (const q of pts) { if (!wgFin(+q[0])) continue; xl = Math.min(xl, +q[0]); xh = Math.max(xh, +q[0]); yh = Math.max(yh, +q[1] || 0); }
    if (spec.thr && wgFin(+spec.thr.v)) yh = Math.max(yh, +spec.thr.v);
    if (!wgFin(xl)) { xl = 0; xh = 1; } return wgXY(w, h, spec, T, c, { xlo: xl, xhi: xh > xl ? xh : xl + 1, ylo: 0, yhi: wgNice(0, (yh || 1) * 1.05)[1], labels: [] });
  },
  cols(G, pts) { const n = Math.max(1, Math.floor(G.plot.w / 2)), out = new Float64Array(n).fill(-Infinity); for (const q of pts || []) { if (!wgFin(+q[0]) || !wgFin(+q[1])) continue; const i = clamp(Math.floor((G.X(+q[0]) - G.plot.x) / 2), 0, n - 1); if (+q[1] > out[i]) out[i] = +q[1]; } return out; },
  draw(c, G, spec, T) {
    const p = G.plot, I = T.I, ch = spec.chroms || [], thr = spec.thr && wgFin(+spec.thr.v) ? +spec.thr.v : null;
    wgAxes(c, G, spec, T, { noX: !!ch.length });
    ch.forEach((q, i) => { const a = G.X(+q.lo), b = G.X(+q.hi); c.fillStyle = wgRgba(I.text, i % 2 ? 0.25 : 0.6); c.fillRect(a, p.y + p.h - 5, b - a, 5); if (i % 2 === 0 && q.label) wgText(c, q.label, (a + b) / 2, p.y + p.h + 3 + G.tk / 2, G.tk, I.text2, { align: 'center' }); });
    const col = this.cols(G, spec.pts), r = 2 * T.k;
    if (spec.prev) { const pc = this.cols(G, spec.prev); c.lineWidth = 1; c.strokeStyle = I.text; c.setLineDash([3, 3]); c.beginPath(); let on = false; for (let i = 0; i < pc.length; i++) { if (!wgFin(pc[i])) { on = false; continue; } const x = p.x + i * 2 + 1, y = G.Y(pc[i]); if (on) c.lineTo(x, y); else { c.moveTo(x, y); on = true; } } c.stroke(); c.setLineDash([]); }
    for (let i = 0; i < col.length; i++) {
      if (!wgFin(col[i])) continue; const x = p.x + i * 2 + 1, y = clamp(G.Y(col[i]), p.y, p.y + p.h);
      c.fillStyle = I.text; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      if (thr != null && col[i] > thr) { c.lineWidth = 1.5; c.strokeStyle = T.line('sel'); c.beginPath(); c.arc(x, y, r + 3, 0, TAU); c.stroke(); wgMark(c, 'sel', x, y - r - 9, 3.5, T.line('sel'), I.surface); }
    }
    if (thr != null) { const y = G.Y(thr); c.lineWidth = 1.5; c.strokeStyle = I.text; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke(); c.setLineDash([]); if (spec.thr.label) wgPill(c, spec.thr.label, p.x + p.w - 4, y, G.tk, T, { align: 'right' }); }
    c.lineWidth = 2; c.strokeStyle = I.text; for (const t of spec.truth || []) { const x = G.X(+t); c.beginPath(); c.moveTo(x, p.y + p.h + 1); c.lineTo(x, p.y + p.h + 7); c.stroke(); }
  },
  rows(spec) { const top = (spec.pts || []).filter(q => wgFin(+q[1])).slice().sort((a, b) => b[1] - a[1]).slice(0, 20); return { head: ['position', (spec.y && spec.y.label) || 'value'], rows: top.map(q => [wgFmt(spec.x && spec.x.fmt, +q[0]), wgFmt(spec.y && spec.y.fmt, +q[1])]).concat(spec.thr ? [['threshold', wgFmt(null, +spec.thr.v)]] : []) }; },
  say(spec) { return (spec.pts || []).length + ' sites'; }
};

/* ================= Predict (API_v2 §7.2): a gesture on the live graph, scored by distance ================= */
const Predict = {
  ver: 0, cur: null, _by: {}, _prev: null, _last: 0, _rq: 0, _opened: false,
  ask(o) {
    o = o || {}; if (this.cur) this._close(this.cur);
    const kind = o.kind || 'y', ax = Object.assign({ lo: 0, hi: 1 }, o.axis), chart = o.chart || 0;
    const unt = !!(typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt), soft = unt ? null : o.soft === undefined ? 6 : o.soft;
    const start = o.start != null ? o.start : kind === 'tri' ? [1 / 3, 1 / 3, 1 / 3] : (ax.lo + ax.hi) / 2;
    const rec = { id: o.id, chart, kind, ax, v: this._norm(kind, start, ax), tol: o.tol, soft: soft > 0 ? soft : null, left: soft > 0 ? soft : null, at: o.at, active: true, committed: false,
      band: null, expect: null, hatch: 1, born: wgEpoch, onCommit: o.onCommit, down: false, focus: typeof Fx !== 'undefined' && Fx.lastInput === 'key',
      linger: o.linger != null ? Math.max(0, +o.linger || 0) : 900, needMove: !!o.needMove, onStill: o.onStill, onTimeout: o.onTimeout, moved: false };
    this._by[chart] = rec; this.cur = rec;
    if (Hooks.chartPointer !== this._ptrFn) { this._prev = Hooks.chartPointer; Hooks.chartPointer = this._ptrFn; }
    if (o.expand !== false && typeof Strip !== 'undefined' && Strip.phone && Strip.phone() && !Strip.isOpen && Strip.open) { Strip.open(true); this._opened = true; }   // a 78 px chart is too small to drag on
    wgLive(o.say || 'Prediction open. Press P, then arrows and Enter.');
    this._bump(); this._redraw(true);
    const self = this;
    return { get active() { return rec.active; }, get v() { return rec.v; }, cancel() { self._close(rec); }, commit() { self._commit(rec); } };
  },
  overlay(i) { return this._by[i] || null; },   // → {v, committed, band, expect, kind, ax, active, left, soft, focus, hatch, moved} | null
  get opened() { return this._opened; },        // true while the phone strip is open because an ask opened it (fold() closes it)
  commit(id) { const r = this.cur; if (r && (id == null || r.id === id)) this._commit(r); },
  cancel(id) { const r = this.cur; if (r && (id == null || r.id === id)) this._close(r); },
  // drop the ghost, band and expectation drawn on one chart index (or on every chart): use it when a chart changes meaning
  // mid-level (a new table, the verdict axis back to a trace), so an old band never sits on the new chart (Batch 1 request)
  clear(chart) {
    if (chart == null) { this._exit(); return; }
    const r = this._by[chart]; if (!r) return;
    if (this.cur === r) { this.cur = null; this._unhook(); }
    delete this._by[chart]; this._bump(); this._redraw(true);
  },
  // fold the phone strip now if an ask opened it and no other ask is active (instead of waiting for the linger after a commit)
  fold() { if (!this._opened || this.cur) return; this._opened = false; if (typeof Strip !== 'undefined' && Strip.isOpen && Strip.open && wgV2()) Strip.open(false); },
  reveal(id, expect, tol) {
    let r = null; for (const k in this._by) if (this._by[k].id === id) r = this._by[k];
    if (!r) return null; if (r.active) this._commit(r, 'force');
    if (tol != null) r.tol = tol; r.expect = Array.isArray(expect) ? expect.slice() : +expect;
    r.band = this._band0(r.kind, r.expect, r.tol); r.hatch = wgCalm() ? 1 : 0;
    const err = this.err(r.kind, r.v, r.expect), hit = r.tol != null && err <= r.tol; r.err = err; r.hit = hit;
    if (typeof Events !== 'undefined' && Events.emit) Events.emit('predict', { id, kind: r.kind, value: r.v, expect: r.expect, err, tol: r.tol, hit, reveal: true });
    this._bump(); this._redraw(true); return { err, hit };
  },
  err(kind, v, e) {   // distance in axis units; 'tri': Euclidean in a unit-side simplex (corner to corner = 1)
    if (kind === 'tri') { const a = wgNorm3(v), b = wgNorm3(e), d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2]; return Math.sqrt((d0 * d0 + d1 * d1 + d2 * d2) / 2); }
    return Math.abs(+v - +e);
  },
  score(results, need) { need = need == null ? 2 : need; let n = 0; for (const r of results || []) if (r && r.err != null && r.tol != null && r.err <= r.tol) n++; return n >= need; },

  _norm(kind, v, ax) {
    if (kind === 'tri') return wgNorm3(v);
    const lo = Math.min(ax.lo, ax.hi), hi = Math.max(ax.lo, ax.hi); return wgFin(+v) ? clamp(+v, lo, hi) : (lo + hi) / 2;
  },
  _band0(kind, c, tol) { return tol == null ? null : kind === 'tri' ? { c, r: tol } : [c - tol, c + tol]; },
  _bump() { this.ver++; },
  _redraw(now) {   // a drag redraws the strip at most once per 15 ms, with a trailing redraw
    if (typeof Strip === 'undefined' || !Strip.redraw || !wgV2()) return; const t = wgNow();
    if (now || t - this._last >= 15) { this._last = t; Strip.redraw(); return; }
    if (!this._rq) this._rq = setTimeout(() => { this._rq = 0; this._last = wgNow(); if (wgV2()) Strip.redraw(); }, 16);
  },
  _set(r, v) { if (v == null) return; r.v = this._norm(r.kind, v, r.ax); r.moved = true; if (r.left != null) r.left = Math.max(r.left, 2); this._bump(); this._redraw(); },
  _val(G, r, x, y) {   // pointer → value in axis units
    const ax = r.ax, k = r.kind;
    if (k === 'tri') return G.inv ? G.inv(x, y) : null;
    if (k === 'pq') { const b = G.bar || G.plot, f = b ? clamp((x - b.x) / b.w, 0, 1) : clamp(x / G.w, 0, 1); return ax.lo + (ax.rev ? 1 - f : f) * (ax.hi - ax.lo); }
    if (k === 'y') return G.iy && G.plot ? G.iy(y) : ax.hi - clamp(y / G.h, 0, 1) * (ax.hi - ax.lo);
    return G.ix && G.plot ? G.ix(x) : ax.lo + clamp(x / G.w, 0, 1) * (ax.hi - ax.lo);
  },
  _pos(G, r, v) {   // value → where the ghost sits on this chart
    v = v === undefined ? r.v : v; const k = r.kind, ax = r.ax;
    if (k === 'tri') { if (!G.P) return null; const p = G.P(v); return { x: p[0], y: p[1] }; }
    if (k === 'pq') { const b = G.bar || G.plot; if (!b) return null; let f = (v - ax.lo) / (ax.hi - ax.lo || 1); if (ax.rev) f = 1 - f; return { x: b.x + clamp(f, 0, 1) * b.w, y: b.y + b.h / 2, vert: [b.y - 6, b.y + b.h + 6] }; }
    const p = G.plot; if (!p || !G.X) return null;
    if (k === 'y') { const at = r.at != null ? r.at : G.nextX; return { x: clamp(at != null ? G.X(at) : p.x + p.w - 10, p.x + 8, p.x + p.w - 8), y: clamp(G.Y(v), p.y, p.y + p.h), horiz: true }; }
    return { x: clamp(G.X(v), p.x, p.x + p.w), y: r.at != null && G.Y ? clamp(G.Y(r.at), p.y, p.y + p.h) : p.y + p.h, vline: true };
  },
  _ptr(i, type, x, y, cv) {
    const r = this.cur;
    if (!r || !r.active || i !== r.chart) { if (this._prev) this._prev(i, type, x, y, cv); return; }
    const L = cv && cv._lg; if (!L) return; const G = L.G;
    if (type === 'down') { const g = this._pos(G, r), R0 = 24 * (L.theme === 'projector' ? 1.5 : 1); r.down = true; r.drag = false; r.x0 = x; r.y0 = y; r.onGhost = !!g && (x - g.x) * (x - g.x) + (y - g.y) * (y - g.y) <= R0 * R0; if (!r.onGhost) this._set(r, this._val(G, r, x, y)); }
    else if (type === 'move' && r.down) { if (!r.drag && Math.abs(x - r.x0) + Math.abs(y - r.y0) > 5) r.drag = true; if (r.drag) this._set(r, this._val(G, r, x, y)); }
    else if (type === 'up' && r.down) { r.down = false; if (r.onGhost && !r.drag) this._commit(r); }   // tap the ghost again to commit
  },
  _commit(r, how) {   // how: 'timer' (the soft timer ran out), 'force' (reveal), else a tap on the ghost, a key or commit()
    if (!r || !r.active) return;
    if (r.needMove && !r.moved && how !== 'force') {   // needMove: an untouched ghost is no prediction
      if (how === 'timer') { this._close(r); if (r.onTimeout) try { r.onTimeout({ id: r.id, moved: false }); } catch (e) { LiveGraph._err(e); } }
      else { if (r.left != null) r.left = Math.max(r.left, 2); if (r.onStill) try { r.onStill({ id: r.id }); } catch (e) { LiveGraph._err(e); } this._bump(); }
      return;
    }
    r.active = false; r.committed = true; r.focus = false; r.down = false; r.left = null;
    if (this.cur === r) { this.cur = null; this._unhook(); }
    const v = Array.isArray(r.v) ? r.v.slice() : r.v, ch = typeof App !== 'undefined' ? App.ch : null;
    try { if (ch && typeof Sim !== 'undefined' && Sim.act) Sim.act(ch, { k: 'predict', id: r.id, v }); else if (ch && ch.sim && ch.sim.act) ch.sim.act({ k: 'predict', id: r.id, v }); } catch (e) { LiveGraph._err(e); }
    if (typeof Events !== 'undefined' && Events.emit) Events.emit('predict', { id: r.id, kind: r.kind, value: v, tol: r.tol });
    r.band = this._band0(r.kind, v, r.tol); r.hatch = wgCalm() ? 1 : 0;   // the band hatches in around your mark; reveal() moves it to the expectation
    if (typeof Snd !== 'undefined' && Snd.click) Snd.click();
    if (this._opened) setTimeout(() => this.fold(), r.linger);   // the strip we opened folds after linger ms (default 900: the band hatches in over 400 ms) unless another ask follows
    if (r.onCommit) try { r.onCommit({ id: r.id, v, moved: !!r.moved }); } catch (e) { LiveGraph._err(e); }
    this._bump(); this._redraw(true);
  },
  _close(r) { if (!r) return; r.active = false; if (this.cur === r) { this.cur = null; this._unhook(); } if (this._by[r.chart] === r && !r.committed) delete this._by[r.chart]; this._bump(); this._redraw(true); },
  _unhook() { if (Hooks.chartPointer === this._ptrFn) Hooks.chartPointer = this._prev || null; this._prev = null; },
  _key(e) {   // P focuses the ghost; arrows move it (Shift ×5); Enter or Space commits; Escape leaves
    const r = this.cur; if (!r || !r.active || !wgV2() || (typeof Cards !== 'undefined' && Cards.isOpen())) return false;
    const k = e.key || '';
    if (k === 'p' || k === 'P') { r.focus = true; wgLive('Prediction ' + this._say(r) + '. Arrows move it, Enter commits.'); this._bump(); this._redraw(true); return true; }   // P focuses (never toggles off: Escape leaves)
    if (!r.focus) return false;
    if (k === 'Enter' || k === ' ') { this._commit(r); return true; }
    if (k === 'Escape') { r.focus = false; this._bump(); this._redraw(true); return true; }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[k]; if (!d) return false;
    const big = e.shiftKey ? 5 : 1;
    if (r.kind === 'tri') { const U = wgTri(0, 0, 1), p = U.P(r.v), st = 0.02 * big; this._set(r, U.inv(p[0] + d[0] * st, p[1] - d[1] * st)); }
    else { const st = (r.ax.hi - r.ax.lo) / 50 * big, s = r.kind === 'y' ? d[1] || d[0] : d[0] || d[1]; this._set(r, r.v + s * st * (r.kind === 'pq' && r.ax.rev ? -1 : 1)); }
    wgLive(this._say(r)); return true;
  },
  _say(r) { return r.kind === 'tri' ? wgPcts(r.v).map(x => x + '%').join(', ') : wgFmt(null, r.v); },
  _frame(dt) {   // soft timer (real seconds, only while the stage is live) and the band's hatch-in (400 ms)
    const r = this.cur;
    if (r && r.active && r.left != null && !r.down) { const b = Math.ceil(r.left * 2); r.left -= Math.max(0, dt); if (r.left <= 0) this._commit(r, 'timer'); else if (Math.ceil(r.left * 2) !== b) this._bump(); }
    let anim = false; for (const k in this._by) { const q = this._by[k]; if (q.band && q.hatch < 1) { q.hatch = Math.min(1, q.hatch + Math.max(0, dt) / 0.4); anim = true; } }
    if (anim) { this._bump(); this._redraw(); }
  },
  _play() { for (const k in this._by) if (this._by[k].born < wgEpoch) { if (this._by[k] === this.cur) { this.cur = null; this._unhook(); } delete this._by[k]; } if (!this.cur) this._opened = false; this._bump(); },
  _exit() { this.cur = null; this._by = {}; this._opened = false; this._unhook(); this._bump(); },
  _draw(c, G, spec, T, r) {   // the ghost on a chart: band, expectation, guide, 44 px halo with the soft countdown, hollow diamond, "you"
    const g = this._pos(G, r); if (!g) return;
    const I = T.I, big = T.proj && typeof Teacher !== 'undefined' && Teacher.frozen, k = big ? 3 : T.k, R0 = (big ? 60 : 22 * T.k), d = 7 * k, p = G.plot;
    c.save();
    if (r.band) this._drawBand(c, G, r, T);
    if (r.expect != null) { const e = this._pos(G, r, r.expect); if (e) { c.setLineDash([6, 3]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.beginPath(); if (r.kind === 'tri') c.arc(e.x, e.y, 6 * T.k, 0, TAU); else if (e.horiz) { c.moveTo(p.x, e.y); c.lineTo(p.x + p.w, e.y); } else if (e.vert) { c.moveTo(e.x, e.vert[0] - 4); c.lineTo(e.x, e.vert[1] + 4); } else { c.moveTo(e.x, p.y); c.lineTo(e.x, p.y + p.h); } c.stroke(); c.setLineDash([]); } }
    c.setLineDash([3, 3]); c.lineWidth = 1.5; c.strokeStyle = I.text; c.beginPath();
    if (g.horiz) { c.moveTo(p.x, g.y); c.lineTo(p.x + p.w, g.y); } else if (g.vline) { c.moveTo(g.x, p.y); c.lineTo(g.x, p.y + p.h); } else if (g.vert) { c.moveTo(g.x, g.vert[0]); c.lineTo(g.x, g.vert[1]); }
    c.stroke(); c.setLineDash([]);
    if (r.active) {
      c.beginPath(); c.arc(g.x, g.y, R0, 0, TAU); c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.5); c.stroke();
      if (r.soft && r.left != null) { c.beginPath(); c.arc(g.x, g.y, R0, -TAU / 4, -TAU / 4 + TAU * clamp(r.left / r.soft, 0, 1)); c.lineWidth = 2.5; c.strokeStyle = I.text; c.stroke(); }
      if (r.focus) { c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = I.text; c.strokeRect(g.x - R0 - 4, g.y - R0 - 4, 2 * R0 + 8, 2 * R0 + 8); c.setLineDash([]); }
    }
    wgDiamond(c, g.x, g.y, d, I.text, r.committed ? I.text2 : I.surface, 2);
    const right = g.x + d + 34 < G.w, ly = g.vert ? g.vert[0] - T.tk / 2 - 1 : g.y - d - 3; wgText(c, 'you', right ? g.x + (g.vert ? 2 : d + 3) : g.x - (g.vert ? 2 : d + 3), Math.max(T.tk / 2 + 1, ly), T.tk, I.text, { align: right ? 'left' : 'right', fam: 'b', wt: 700, halo: I.surface });
    c.restore();
  },
  _drawBand(c, G, r, T) {   // hatched tolerance band; grows from its centre while hatch < 1
    const col = wgRgba(T.I.text, 0.55), e = clamp(r.hatch, 0, 1), p = G.plot;
    if (r.kind === 'tri') { if (!G.P) return; const q = G.P(r.band.c), rad = Math.max(2, r.band.r * G.size * e); c.save(); c.beginPath(); c.arc(q[0], q[1], rad, 0, TAU); c.clip(); wgHatch(c, q[0] - rad, q[1] - rad, 2 * rad, 2 * rad, col, 5); c.restore(); c.beginPath(); c.arc(q[0], q[1], rad, 0, TAU); c.lineWidth = 1; c.strokeStyle = col; c.stroke(); return; }
    const m = (r.band[0] + r.band[1]) / 2, a = this._pos(G, r, m - (m - r.band[0]) * e), b = this._pos(G, r, m + (r.band[1] - m) * e); if (!a || !b) return;
    if (r.kind === 'pq') { const B = G.bar || p; wgHatch(c, Math.min(a.x, b.x), B.y - 5, Math.max(2, Math.abs(b.x - a.x)), B.h + 10, col, 5); return; }
    if (r.kind === 'y') wgHatch(c, p.x, Math.min(a.y, b.y), p.w, Math.max(2, Math.abs(b.y - a.y)), col, 5); else wgHatch(c, Math.min(a.x, b.x), p.y, Math.max(2, Math.abs(b.x - a.x)), p.h, col, 5);
  }
};
Predict._ptrFn = (i, type, x, y, cv) => Predict._ptr(i, type, x, y, cv);

/* ================= GenePoolLens (API_v2 §7.3): LOOK / GENES / JARS (D1 §2.1, D4 §4.1 rule 6) ================= */
const GenePoolLens = {
  MODES: ['look', 'genes', 'jars'], NAMES: { look: 'Look', genes: 'Genes', jars: 'Jars' }, _active: null,
  create(o) {
    o = o || {}; const self = this;
    const L = {
      o, mode: 'look', t0: 0, ctl: null, key: o.key === undefined ? 'L' : o.key, ch: typeof App !== 'undefined' ? App.ch : null,
      set(m) { if (self.MODES.indexOf(m) < 0 || m === this.mode) return this; this.mode = m; this.t0 = wgNow(); self._sync(this); wgLive('Lens: ' + (o.names || self.NAMES)[m] + '.'); if (o.onChange) o.onChange(m); return this; },
      cycle() { return this.set(self.MODES[(self.MODES.indexOf(this.mode) + 1) % 3]); },
      blocks() { return !!o.blocksTaps && this.mode !== 'look'; },
      items() { try { return (o.items && o.items()) || []; } catch (e) { return []; } },
      counts() { const n = []; for (const it of this.items()) for (const a of it.a || []) if (a >= 0) n[a] = (n[a] || 0) + 1; for (let i = 0; i < n.length; i++) n[i] = n[i] || 0; return n; },
      q() { const n = this.counts(), t = wgSum(n); return t ? (n[1] || 0) / t : 0; },   // share of copy index 1; absent (−1) copies skipped
      draw(c) { if (this.mode === 'genes') self._genes(c, this); else if (this.mode === 'jars') self._jars(c, this); }
    };
    this._active = L; return L;
  },
  control(lens) {   // a 44 px segmented control for the dock: {id: 'lens', el: GenePoolLens.control(lens)}
    const box = document.createElement('div'); box.className = 'lens-ctl'; box.setAttribute('role', 'radiogroup'); box.setAttribute('aria-label', (lens.o && lens.o.label) || 'Gene pool lens');
    for (const m of this.MODES) { const b = document.createElement('button'); b.type = 'button'; b.dataset.m = m; b.setAttribute('role', 'radio'); b.textContent = ((lens.o && lens.o.names) || this.NAMES)[m]; b.addEventListener('click', () => { lens.set(m); if (typeof Snd !== 'undefined' && Snd.click) Snd.click(); }); box.appendChild(b); }
    if (lens.key) box.setAttribute('aria-keyshortcuts', lens.key);
    lens.ctl = box; this._sync(lens); return box;
  },
  _sync(L) { if (!L.ctl) return; for (const b of L.ctl.children) b.setAttribute('aria-checked', String(b.dataset.m === L.mode)); },
  _key(e) { const L = this._active; if (!L || !L.key || !wgV2() || L.ch !== App.ch || (typeof Cards !== 'undefined' && Cards.isOpen())) return false; if (!sameKey(e.key || '', L.key)) return false; L.cycle(); return true; },
  _letter(L, a) { const ls = L.o.letters; return ls && ls[a] != null ? ls[a] : undefined; },
  _genes(c, L) {   // two lettered tokens per organism; one token with a bar for a one-copy genotype; split halves for a crowd
    if (typeof Pal === 'undefined') return;
    for (const it of L.items()) {
      const a = it.a || [], r = it.r || 10; if (!a.length) continue;
      if (r < 10) { Pal.genotype(c, it.x, it.y, Math.max(4, r * 0.8), a[0], a.length > 1 ? a[1] : -1, { letter: '' }); continue; }
      const tr = clamp(r * 0.45, 7, 13), one = a.length < 2 || a[0] < 0 || a[1] < 0;
      if (one) { const al = a[0] >= 0 ? a[0] : a[1]; Pal.token(c, it.x, it.y, tr, al, { oneCopy: true, bar: it.bar || '', letter: this._letter(L, al) }); continue; }
      Pal.token(c, it.x - tr * 0.95, it.y, tr, a[0], { letter: this._letter(L, a[0]) }); Pal.token(c, it.x + tr * 0.95, it.y, tr, a[1], { letter: this._letter(L, a[1]) });
    }
  },
  _slots(R, n) {   // the Equilibrium jar layout: rows from the bottom, the largest token that fits
    let r = 10; for (; r > 2; r -= 0.5) { const cols = Math.floor((R.w - 4) / (2 * r + 1.5)), rows = Math.floor((R.h - 4) / (2 * r + 1.5)); if (cols * rows >= n) break; }
    const cols = Math.max(1, Math.floor((R.w - 4) / (2 * r + 1.5))), out = [];
    for (let k = 0; k < n; k++) out.push({ x: R.x + 2 + r + (k % cols) * (2 * r + 1.5), y: R.y + R.h - 2 - r - Math.floor(k / cols) * (2 * r + 1.5), r });
    return out;
  },
  _jars(c, L) {   // copies fly to jars over ≤ 1.2 s (Calm: in place); the jars are p and q
    const J = L.o.jar; if (!J || typeof Pal === 'undefined') return;
    const T = wgT(wgTheme0()), I = T.I, items = L.items(), K = Math.max(2, (L.o.letters || []).length, ...items.map(it => Math.max(-1, ...(it.a || [])) + 1));
    const gap = 8, jw = (J.w - gap * (K - 1)) / K, jars = [], toks = [], by = [];
    for (let k = 0; k < K; k++) { jars.push({ x: J.x + k * (jw + gap), y: J.y, w: jw, h: J.h }); by.push([]); }
    for (const it of items) (it.a || []).forEach((a, j) => { if (a >= 0 && a < K) { const t = { a, x0: it.x + (j ? 1 : -1) * Math.max(4, (it.r || 10) * 0.45), y0: it.y }; toks.push(t); by[a].push(t); } });
    by.forEach((list, k) => { const sl = this._slots(jars[k], list.length); list.forEach((t, i) => { t.x1 = sl[i].x; t.y1 = sl[i].y; t.r = sl[i].r; }); });
    for (let k = 0; k < K; k++) { const j = jars[k], col = T.line(k === 0 ? 'A' : k === 1 ? 'a' : 'ink'); rrect(c, j.x, j.y, j.w, j.h, 8); c.fillStyle = wgRgba(I.surface, 0.85); c.fill(); c.lineWidth = 2; c.strokeStyle = col; c.stroke(); }
    const p = wgCalm() ? 1 : clamp((wgNow() - L.t0) / 1200, 0, 1), n = toks.length, out3 = t => 1 - (1 - t) * (1 - t) * (1 - t);
    toks.forEach((t, i) => { const kk = clamp(p * 1.6 - (i / Math.max(1, n)) * 0.6, 0, 1), e = out3(kk), x = lerp(t.x0, t.x1, e), y = lerp(t.y0, t.y1, e) - 4 * e * (1 - e) * 30; Pal.token(c, x, y, lerp(Math.max(3, t.r * 0.8), t.r, e), t.a, { letter: t.r >= 7 ? this._letter(L, t.a) : '' }); });
    const tot = n || 1;
    for (let k = 0; k < K; k++) { const j = jars[k], lt = this._letter(L, k) || (k === 0 ? 'A' : k === 1 ? 'a' : 'ABCDEFGHIJKL'[k]); wgPill(c, lt + ' ' + by[k].length, j.x + j.w / 2, j.y + j.h + 4 + T.lb * 0.75, T.lb, T); }
    if (K === 2) wgPill(c, 'q = ' + (Math.round(by[1].length / tot * 100) / 100), J.x + J.w / 2, J.y - 4 - T.lb * 0.75, T.lb, T);
  }
};

/* ================= Invasion (API_v2 §7.3): your rule as a lineage among other rules; draws only through WF ================= */
const Invasion = {
  create(o) {
    o = o || {}; const rules = o.rules || [], K = Math.max(1, rules.length), N = o.N || 200, w = o.w || o.payoff;
    let start = o.start ? o.start.map(x => Math.max(0, Math.round(+x || 0))) : null;
    if (!start) { start = []; for (let i = 0; i < K; i++) start.push(Math.floor(N / K) + (i < N % K ? 1 : 0)); }
    const inv = {
      o, rules, you: o.you || 0, N, gens: o.gens || 40, gen: 0, counts: start.slice(), hist: [start.slice()],
      get done() { return this.gen >= this.gens || wgSum(this.counts) === 0; },
      share(i, row) { row = row || this.counts; const t = wgSum(row); return t ? row[i] / t : 0; },
      step() { if (this.done) return this.counts; if (typeof WF === 'undefined') throw new Error('Invasion needs v2/00_wf.js'); const next = WF.step(this.counts, w || null, this.N, { mu: o.mu || 0, M: o.M, gen: this.gen }); this.counts = Array.from(next); this.gen++; this.hist.push(this.counts.slice()); return this.counts; },
      run(n) { const m = n == null ? this.gens - this.gen : n; for (let i = 0; i < m && !this.done; i++) this.step(); return this.counts; },
      save() { return { gen: this.gen, hist: this.hist.map(r => r.slice()) }; },   // plain JSON for sim snapshots; Invasion.create({…, from})
      spec(so) {   // trace spec: your share solid, the start share dashed (a neutral rule's expected share)
        so = so || {}; const d = this.hist.map(r => this.share(this.you, r)), s0 = d[0] || 0;
        return { type: 'trace', title: so.title || '', x: { lo: 0, hi: Math.max(1, this.gens), label: so.xlabel || '' }, y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed',
          series: [{ d, ink: so.ink || 'ink', label: so.label || (rules[this.you] && rules[this.you].label) || 'you', you: true }], ghost: [{ d: d.map(() => s0), label: so.ghostLabel || '' }] };
      },
      draw(c, R, d2) { Invasion._draw(c, this, R, d2 || {}); }
    };
    if (o.from && o.from.hist && o.from.hist.length) { inv.hist = o.from.hist.map(r => r.slice()); inv.gen = o.from.gen != null ? o.from.gen : inv.hist.length - 1; inv.counts = inv.hist[inv.hist.length - 1].slice(); }
    return inv;
  },
  run(o) { const inv = this.create(o); inv.run(); return inv; },   // D5's Invasion.run({rules, you, gens, payoff})
  _draw(c, inv, R, o) {   // up to 200 tokens in four rows, grouped by rule; two rules in blue and amber, three or more as patterned lettered discs
    const T = wgT(o.theme || wgTheme0()), I = T.I, K = inv.rules.length, tot = wgSum(inv.counts), M = Math.min(200, tot), rows = o.rows || 4, legend = T.tk + 8;
    if (!M) return; const cols = Math.ceil(M / rows), cell = Math.max(3, Math.min(R.w / cols, (R.h - legend) / rows)), r = Math.max(1.5, cell * 0.4);
    const want = inv.counts.map(n => n / tot * M), got = want.map(Math.floor); let left = M - wgSum(got);
    want.map((v, i) => [v - got[i], i]).sort((a, b) => b[0] - a[0]).forEach(([f, i]) => { if (left > 0) { got[i]++; left--; } });
    let n = 0; const x0 = R.x + (R.w - cols * cell) / 2 + cell / 2, y0 = R.y + cell / 2;
    for (let t = 0; t < K; t++) for (let j = 0; j < got[t]; j++, n++) { const x = x0 + Math.floor(n / rows) * cell, y = y0 + (n % rows) * cell; this._tok(c, x, y, r, t, K, T, inv.rules[t]); if (t === inv.you) { c.beginPath(); c.arc(x, y, r + 1.5, 0, TAU); c.lineWidth = r >= 6 ? 3 : 1.5; c.strokeStyle = I.paper; c.stroke(); } }
    let lx = R.x; const ly = R.y + rows * cell + legend / 2 + 2;
    inv.rules.forEach((ru, t) => { const s = (ru.label || ru.id || '') + (t === inv.you ? ' (you)' : ''), w = wgW(c, s, T.tk, 'b', 600) + 22; if (lx + w > R.x + R.w + 1) return; this._tok(c, lx + 6, ly, 6, t, K, T, ru); if (t === inv.you) { c.beginPath(); c.arc(lx + 6, ly, 7.5, 0, TAU); c.lineWidth = 1.5; c.strokeStyle = I.paper; c.stroke(); } wgText(c, s, lx + 16, ly, T.tk, I.text, { fam: 'b', wt: 600 }); lx += w + 6; });
    if (tot > M) wgText(c, '1 dot = ' + wgFmt(null, tot / M), R.x + R.w, R.y - T.tk / 2 - 2, T.tk, I.text2, { align: 'right' });
  },
  _tok(c, x, y, r, t, K, T, rule) {
    const I = T.I; c.beginPath(); c.arc(x, y, r, 0, TAU);
    if (K <= 2) { c.fillStyle = t === 0 ? I.A : I.a; c.fill(); c.lineWidth = r >= 4 ? 1.5 : 1; c.strokeStyle = I.ink; c.stroke(); return; }
    c.fillStyle = I.paper; c.fill(); c.save(); c.clip(); c.strokeStyle = I.ink; c.fillStyle = I.ink; c.lineWidth = Math.max(0.8, r / 5);
    const pat = t % 4; c.beginPath();
    if (pat === 1) for (let k = -2; k <= 2; k++) { c.moveTo(x - r + k * r * 0.6, y + r); c.lineTo(x + r + k * r * 0.6, y - r); }
    else if (pat === 2) { for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { c.moveTo(x + i * r * 0.55 + r * 0.14, y + j * r * 0.55); c.arc(x + i * r * 0.55, y + j * r * 0.55, Math.max(0.6, r * 0.14), 0, TAU); } c.fill(); }
    else if (pat === 3) { c.moveTo(x - r, y); c.lineTo(x + r, y); c.moveTo(x, y - r); c.lineTo(x, y + r); }
    c.stroke(); c.restore(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.lineWidth = 1.2; c.strokeStyle = I.ink; c.stroke();
    if (r >= 7) wgText(c, (rule && rule.letter) || 'ABCDEFGHIJKL'[t % 12], x, y + 0.5, Math.max(12, r * 1.1), I.ink, { align: 'center', fam: 'd', wt: 700, halo: I.paper });
  }
};

/* ================= Ledger (API_v2 §7.3): memory tiles; age by fill, not transparency (D4 rule 11) ================= */
const Ledger = {
  create(o) {
    o = o || {};
    return {
      n: o.n || 10, items: [],
      push(it) { this.items.push(Object.assign({ t: 0 }, it)); while (this.items.length > this.n) this.items.shift(); return this; },
      age(it, gen) { return gen == null ? 0 : Math.max(0, gen - (it.t || 0)); },   // fresh 0, hatched 1–2, dashed ≥ 3
      clear() { this.items.length = 0; return this; },
      draw(c, x, y, d) {
        d = d || {}; const T = wgT(d.theme || wgTheme0()), I = T.I, s = (d.size || 28) * T.k, g = 4, cols = d.cols || this.n;
        this.items.forEach((it, k) => {
          const a = this.age(it, d.gen), tx = x + (k % cols) * (s + g), ty = y + Math.floor(k / cols) * (s + g);
          rrect(c, tx, ty, s, s, 4); c.fillStyle = I.paper; c.fill();
          if (a >= 1 && a <= 2) { c.save(); rrect(c, tx, ty, s, s, 4); c.clip(); wgHatch(c, tx, ty, s, s, wgRgba(I.ink, 0.4), 5); c.restore(); }
          rrect(c, tx + 0.5, ty + 0.5, s - 1, s - 1, 4); c.lineWidth = a === 0 ? 2 : 1.5; c.setLineDash(a >= 3 ? [4, 3] : []); c.strokeStyle = I.ink; c.stroke(); c.setLineDash([]);
          if (typeof it.glyph === 'function') it.glyph(c, tx + s / 2, ty + s * 0.44, s * 0.5); else if (it.glyph) wgText(c, it.glyph, tx + s / 2, ty + s * 0.44, Math.max(12, s * 0.42), I.ink, { align: 'center', fam: 'b', wt: 700 });
          c.lineWidth = 2; c.strokeStyle = I.ink; c.beginPath(); const bx = tx + s - 4, by = ty + s - 4;
          if (it.good) { c.moveTo(bx - 8, by - 3); c.lineTo(bx - 5, by); c.lineTo(bx, by - 6); } else { c.moveTo(bx - 6, by - 6); c.lineTo(bx, by); c.moveTo(bx, by - 6); c.lineTo(bx - 6, by); }
          c.stroke();
        });
        const n = this.items.length; return { x, y, w: Math.min(n, cols) * (s + g) - g, h: Math.ceil(n / cols) * (s + g) - g };
      }
    };
  }
};

/* ================= Pin (API_v2 §7.3): a 450 ms hold pins an individual (≤ 4); its look is kept for life ================= */
const Pin = {
  list: [], hold: null, max: 4, HOLD: 450, _ch: null,
  press(ind, x, y) { if (!ind || ind.id == null) return; this.hold = { ind, x, y, t: 0, done: false }; },
  release() { const h = this.hold; this.hold = null; return !!(h && h.done); },
  isPinned(id) { return this.list.some(p => p.id === id); },
  unpin(id) { const i = this.list.findIndex(p => p.id === id); if (i >= 0) this.list.splice(i, 1); return i >= 0; },
  clear() { this.list.length = 0; this.hold = null; },
  _pin(ind) {   // a second hold on a pinned individual unpins it; a fifth pin replaces the oldest
    if (this.unpin(ind.id)) { wgLive('Unpinned.'); return; }
    this.list.push({ id: ind.id, ph: wgClone(ind.ph !== undefined ? ind.ph : ind.g !== undefined ? ind.g : null), label: ind.label || null, t: wgNow() });
    while (this.list.length > this.max) this.list.shift();
    if (typeof Fx !== 'undefined' && Fx.ring) Fx.ring(this.hold.x, this.hold.y, 26, { ms: 400 });
    wgLive('Pinned.');
  },
  update(dt) { const h = this.hold; if (!h || h.done) return; h.t += Math.max(0, dt) * 1000; if (h.t >= this.HOLD) { h.done = true; this._pin(h.ind); } },
  draw(c, locate, kids) {   // threads to the young, then a 3 px paper halo with an ink edge
    const T = wgT(wgTheme0()), I = T.I;
    for (const p of this.list) {
      const at = locate ? locate(p.id) : null; if (!at) continue; const ks = kids ? kids(p.id) || [] : [];
      c.lineWidth = 3; c.strokeStyle = wgRgba(I.ink, 0.6); c.beginPath(); for (const k of ks) { c.moveTo(at[0], at[1]); c.lineTo(k[0], k[1]); } c.stroke();
      c.lineWidth = 1.5; c.strokeStyle = I.paper; c.stroke();
      const r = at[2] || 18; c.beginPath(); c.arc(at[0], at[1], r + 2, 0, TAU); c.lineWidth = 4.5; c.strokeStyle = I.ink; c.stroke(); c.lineWidth = 3; c.strokeStyle = I.paper; c.stroke();
    }
  },
  _ring(c) {   // the filling hold ring, drawn after the chapter on Hooks.frame
    const h = this.hold; if (!h || h.done || h.t < 60) return; const T = wgT(wgTheme0()), f = clamp(h.t / this.HOLD, 0, 1);
    c.save(); c.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0); c.beginPath(); c.arc(h.x, h.y, 26, -TAU / 4, -TAU / 4 + TAU * f); c.lineWidth = 6; c.strokeStyle = T.I.ink; c.stroke(); c.lineWidth = 3.5; c.strokeStyle = T.I.paper; c.stroke(); c.restore();
  },
  _play(ch) { if (this._ch !== ch) this.clear(); this._ch = ch; this.hold = null; }
};

/* ================= Evidence (API_v2 §7.3, B0-simple): an investigator's budget, a power meter, a conclusion scored by Brier ================= */
const Evidence = {
  CONF: [0.5, 0.6, 0.7, 0.8, 0.9],
  snap(conf) { conf = +conf || 0.5; if (conf > 1) conf /= 100; let b = 0.5; for (const v of this.CONF) if (Math.abs(v - conf) < Math.abs(b - conf)) b = v; return b; },
  probs(ids, hid, conf) { const p = {}, n = ids.length; for (const id of ids) p[id] = id === hid ? (n > 1 ? conf : 1) : (1 - conf) / Math.max(1, n - 1); return p; },
  brier(p, truth, ids) { let s = 0; for (const id of ids) { const d = (+p[id] || 0) - (id === truth ? 1 : 0); s += d * d; } return s; },   // multi-category: 0 best, 2 worst
  create(o) {
    o = o || {}; const W = Object.assign({ left: 'days left', power: 'power', n: 'n', conclude: 'Conclude', day: 'day', days: 'days', you: 'you', best: 'evidence', brier: 'Brier' }, o.words);
    const H = o.hypotheses || [], ids = H.map(h => h.id);
    const ev = {
      o, W, budget: +o.budget || 0, left: +o.budget || 0, bought: [], pick: null, conf: null, done: null, el: null,
      inst(id) { return (o.instruments || []).find(i => i.id === id) || null; },
      count(id) { let n = 0; for (const b of this.bought) if (b.id === id) n++; return n; },
      can(id) { const i = this.inst(id); return !!i && !this.done && this.left >= (+i.cost || 0); },
      buy(id) {
        if (!this.can(id)) return null; const ins = this.inst(id); this.left -= +ins.cost || 0;
        const n = this.count(id) + 1, data = ins.sample ? ins.sample(n) : null, rec = { id, n, data }; this.bought.push(rec);
        if (o.onBuy) o.onBuy(rec); this.render(); return data;
      },
      power() { try { return clamp(+(o.power ? o.power(this.bought) : 0) || 0, 0, 1); } catch (e) { return 0; } },
      n() { if (o.n) return o.n(this.bought); let n = 0; for (const b of this.bought) n += Array.isArray(b.data) ? b.data.length : b.data && wgFin(b.data.n) ? b.data.n : 1; return n; },
      conclude(hid, conf) {
        if (ids.indexOf(hid) < 0 || this.done) return null; conf = Evidence.snap(conf);
        const p = Evidence.probs(ids, hid, conf), brier = Evidence.brier(p, o.truth, ids); let post = null;
        try { post = o.posterior ? o.posterior(this.bought) : null; } catch (e) { post = null; }
        const ghost = post ? { post, brier: Evidence.brier(post, o.truth, ids) } : null;
        this.done = { hid, conf, p, brier, ghost, hit: hid === o.truth };
        if (typeof Events !== 'undefined' && Events.emit) Events.emit('outcome', { k: 'evidence', v: { hid, conf, brier: Math.round(brier * 1000) / 1000 } });
        if (o.onConclude) o.onConclude(this.done); this.render(); return { brier, ghost, hit: this.done.hit };
      },
      mount(el) { this.el = el; this.render(); return el; },
      render() { if (this.el) Evidence._render(this); }
    };
    return ev;
  },
  _render(ev) {   // DOM, keyboard-ordered: budget row, instrument shelf, power meter, hypotheses, confidence, conclude (D4 §4.2)
    const el = ev.el, o = ev.o, W = ev.W; if (typeof document === 'undefined') return;
    const a = document.activeElement, fk = a && el.contains(a) && a.dataset ? a.dataset.k : null;
    const mk = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    const btn = (cls, k, txt, fn, on) => { const b = mk('button', cls, txt); b.type = 'button'; b.dataset.k = k; if (on != null) { b.setAttribute('role', 'radio'); b.setAttribute('aria-checked', String(!!on)); } b.addEventListener('click', fn); return b; };
    el.innerHTML = ''; el.classList.add('ev');
    const per = Math.max(1, Math.ceil(ev.budget / 20)), nd = Math.ceil(ev.budget / per), full = Math.round(ev.left / per), row = mk('div', 'ev-budget');
    row.setAttribute('role', 'img'); row.setAttribute('aria-label', ev.left + ' ' + W.left);
    for (let i = 0; i < nd; i++) row.appendChild(mk('i', i < full ? 'on' : ''));
    row.appendChild(mk('span', 'ev-left mono', ev.left + ' ' + W.left)); el.appendChild(row);
    const shelf = mk('div', 'ev-shelf'); shelf.setAttribute('role', 'group');
    for (const ins of o.instruments || []) {
      const cost = +ins.cost || 0, b = btn('ev-tile', 'i:' + ins.id, null, () => { if (!ev.can(ins.id)) { if (typeof toast === 'function' && ins.why) toast(ins.why); return; } if (typeof Snd !== 'undefined' && Snd.click) Snd.click(); ev.buy(ins.id); });
      b.appendChild(mk('b', '', ins.name)); b.appendChild(mk('span', 'ev-cost mono', cost + ' ' + (cost === 1 ? W.day : W.days)));
      const nb = ev.count(ins.id); if (nb) b.appendChild(mk('em', 'ev-n mono', '×' + nb)); if (!ev.can(ins.id)) b.setAttribute('aria-disabled', 'true'); shelf.appendChild(b);
    }
    el.appendChild(shelf);
    const pw = ev.power(), nx = Math.round(2 + 216 * pw), x80 = 2 + 216 * 0.8, pm = mk('div', 'ev-power'); pm.setAttribute('role', 'meter'); pm.setAttribute('aria-valuemin', '0'); pm.setAttribute('aria-valuemax', '100'); pm.setAttribute('aria-valuenow', String(Math.round(pw * 100))); pm.setAttribute('aria-label', W.power);
    pm.innerHTML = '<svg viewBox="0 0 220 28" width="220" height="28" aria-hidden="true"><defs><pattern id="ev-h" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" stroke-width="1"/></pattern></defs>' +
      '<rect x="2" y="6" width="' + (x80 - 2) + '" height="16" fill="url(#ev-h)"/><rect x="1.5" y="5.5" width="217" height="17" fill="none" stroke="currentColor"/><line x1="' + x80 + '" y1="1" x2="' + x80 + '" y2="27" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 2"/>' +
      '<path d="M' + nx + ' 2 l7 12 l-7 12 l-7 -12 z" fill="var(--v-surface,#1C2A28)" stroke="currentColor" stroke-width="2"/></svg>';
    pm.appendChild(mk('span', 'mono', W.power + ' ' + Math.round(pw * 100) + '%')); pm.appendChild(mk('span', 'mono', W.n + ' = ' + ev.n())); el.appendChild(pm);
    const hy = mk('div', 'ev-hyps'); hy.setAttribute('role', 'radiogroup');
    for (const h of o.hypotheses || []) hy.appendChild(btn('ev-hyp' + (ev.done && h.id === o.truth ? ' truth' : ''), 'h:' + h.id, h.label, () => { if (ev.done) return; ev.pick = h.id; ev.render(); }, (ev.done ? ev.done.hid : ev.pick) === h.id));
    el.appendChild(hy);
    const cf = mk('div', 'ev-conf'); cf.setAttribute('role', 'radiogroup');
    for (const v of Evidence.CONF) cf.appendChild(btn('ev-c mono', 'c:' + v, Math.round(v * 100) + (v === 0.9 ? '%+' : '%'), () => { if (ev.done) return; ev.conf = v; ev.render(); }, (ev.done ? ev.done.conf : ev.conf) === v));
    el.appendChild(cf);
    if (!ev.done) { const go = btn('btn primary ev-go', 'go', W.conclude, () => { if (ev.pick == null || ev.conf == null) return; ev.conclude(ev.pick, ev.conf); }); if (ev.pick == null || ev.conf == null) go.setAttribute('aria-disabled', 'true'); el.appendChild(go); }
    else {   // calibration pips: filled = how well your call scored; the dashed ghost = the best the evidence you bought allowed
      const pips = (b, cls, lab) => { const r2 = mk('div', 'ev-pips ' + cls), k = Math.round(10 * (1 - b / 2)); r2.setAttribute('role', 'img'); r2.setAttribute('aria-label', lab + ' ' + W.brier + ' ' + (Math.round(b * 100) / 100)); for (let i = 0; i < 10; i++) r2.appendChild(mk('i', i < k ? 'on' : '')); r2.appendChild(mk('span', 'mono', lab + ' ' + (Math.round(b * 100) / 100))); return r2; };
      el.appendChild(pips(ev.done.brier, 'you', W.you)); if (ev.done.ghost) el.appendChild(pips(ev.done.ghost.brier, 'ghost', W.best));
    }
    if (fk) { const f = el.querySelector('[data-k="' + fk + '"]'); if (f && f.focus) f.focus(); }
  }
};

/* ================= Chips (API_v2 §7.3): a distribution bet over bins, paid by a quadratic proper score (D3 §9.3) ================= */
const Chips = {
  create(o) {
    o = o || {}; const B = o.bins || [];
    return {
      bins: B, chips: o.chips || 10, odds: o.odds || null, n: B.map(() => 0), cursor: 0, focus: false, rects: [],
      get placed() { return wgSum(this.n); }, get left() { return this.chips - this.placed; },
      add(i) { if (!(i >= 0 && i < B.length) || this.left <= 0) return false; this.n[i]++; return true; },
      remove(i) { if (!(i >= 0 && i < B.length) || !(this.n[i] > 0)) return false; this.n[i]--; return true; },
      clear() { this.n = B.map(() => 0); return this; },
      dist() { return this.n.map(k => k / this.chips); },   // unplaced chips count as nothing, so placing them all scores best
      hit(x, y) { for (let i = 0; i < this.rects.length; i++) { const r = this.rects[i]; if (x >= r.x && x < r.x + r.w && y >= r.y && y <= r.y + r.h) return i; } return -1; },
      key(k) {   // ← → choose a bin; ↑ or + adds a chip, ↓ or − takes one back
        const n = B.length; if (!n) return false;
        if (k === 'ArrowLeft' || k === 'ArrowRight') { this.cursor = (this.cursor + (k === 'ArrowRight' ? 1 : n - 1)) % n; this.focus = true; return true; }
        if (k === 'ArrowUp' || k === '+' || k === '=') { this.focus = true; this.add(this.cursor); return true; }
        if (k === 'ArrowDown' || k === '-' || k === '−') { this.focus = true; this.remove(this.cursor); return true; }
        return false;
      },
      draw(c, R, d) {
        d = d || {}; const T = wgT(d.theme || wgTheme0()), I = T.I, n = B.length; if (!n) return; const cw = R.w / n, lab = T.tk + 8, base = R.y + R.h - lab;
        const r = clamp(Math.min(cw * 0.3, (base - R.y - T.tk - 8) / (this.chips * 1.5 + 1)), 5, 12 * T.k), step = r * 1.5;
        this.rects = [];
        for (let i = 0; i < n; i++) {
          const x = R.x + i * cw, cx = x + cw / 2; this.rects.push({ x, y: R.y, w: cw, h: R.h });
          if (this.odds) { const hh = clamp(+this.odds[i] || 0, 0, 1) * this.chips * step; if (hh > 0) { c.setLineDash([4, 3]); c.lineWidth = 1.5; c.strokeStyle = I.text; c.strokeRect(cx - r - 4, base - hh, 2 * r + 8, hh); c.setLineDash([]); } }
          for (let k = 0; k < this.n[i]; k++) { const cy = base - r - k * step; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fillStyle = I.paper; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.ink; c.stroke(); c.beginPath(); c.arc(cx, cy, r * 0.6, 0, TAU); c.lineWidth = 1; c.stroke(); }
          if (this.n[i]) wgText(c, String(this.n[i]), cx, base - r * 2 - (this.n[i] - 1) * step - 4 - T.tk / 2, T.tk, I.text, { align: 'center', wt: 700, halo: I.surface });
          if (this.focus && i === this.cursor) { c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = I.text; c.strokeRect(x + 2, R.y + 1, cw - 4, R.h - 2); c.setLineDash([]); }
          const bl = B[i].label != null ? B[i].label : wgFmt(null, B[i].lo) + '–' + wgFmt(null, B[i].hi);
          wgText(c, bl, cx, base + lab / 2 + 1, T.tk, I.text, { align: 'center', fam: 'b', wt: 600 });
        }
        c.lineWidth = 1.5; c.strokeStyle = I.text; c.beginPath(); c.moveTo(R.x, base + 0.5); c.lineTo(R.x + R.w, base + 0.5); c.stroke();
        if (d.showLeft !== false) { const lx = R.x + R.w - 8, ly = R.y + T.tk / 2 + 2; c.beginPath(); c.arc(lx, ly, 6, 0, TAU); c.lineWidth = 1.5; c.strokeStyle = I.text; c.stroke(); wgText(c, String(this.left), lx - 10, ly, T.tk, I.text, { align: 'right', wt: 700 }); }
      }
    };
  },
  score(q, o) { let s = 0; for (const x of q) s += x * x; return 2 * (q[o] || 0) - s; },
  expected(q, expect) { let e = 0; for (let o = 0; o < expect.length; o++) e += expect[o] * this.score(q, o); return e; }   // stars read this
};

/* ================= PedigreeView (by B2): kinship by path counting, multiple paternity, tags the player places ================= */
const PedigreeView = {
  TAGS: ['1/2', '1/4', '1/8', '0'], GLYPH: { '1/2': '½', '1/4': '¼', '1/8': '⅛', '0': '0' }, OX: [-34, 34, -34, 34], OY: [-34, -34, 34, 34],
  frac(x) { for (let n = 0; n <= 12; n++) { const d = 1 << n, m = x * d; if (Math.abs(m - Math.round(m)) < 1e-9) { let a = Math.round(m), b = d; while (a % 2 === 0 && b > 1 && a) { a /= 2; b /= 2; } return a === 0 ? '0' : b === 1 ? String(a) : a + '/' + b; } } return String(Math.round(x * 1000) / 1000); },
  create(o) {
    o = o || {}; const list = (o.nodes || []).map((n, i) => Object.assign({ i }, n)), by = new Map(); for (const n of list) by.set(n.id, n);
    const self = this;
    const pv = {
      nodes: list, tags: {}, pos: {}, s: 28, menu: null, focus: null, hl: null, rect: null, _kin: new Map(), _d: null,
      has(id) { return id != null && by.has(id); },
      par(id) { const n = by.get(id); return n && n.parents ? [n.parents[0], n.parents[1]] : [null, null]; },
      depths() {   // founders 0, children one below their lower parent; a partner from outside joins its mate's row
        const d = new Map(), get = id => { if (d.has(id)) return d.get(id); d.set(id, 0); const [m, f] = this.par(id); let v = 0; if (this.has(m)) v = Math.max(v, get(m) + 1); if (this.has(f)) v = Math.max(v, get(f) + 1); d.set(id, v); return v; };
        for (const n of list) get(n.id);
        const root = id => { const [m, f] = this.par(id); return !this.has(m) && !this.has(f); };
        for (let pass = 0; pass < 8; pass++) {
          let ch = false;
          for (const n of list) {
            const [m, f] = this.par(n.id);
            if (this.has(m) && this.has(f) && d.get(m) !== d.get(f)) { const v = Math.max(d.get(m), d.get(f)); for (const q of [m, f]) if (d.get(q) !== v && root(q)) { d.set(q, v); ch = true; } }
            const v = Math.max(this.has(m) ? d.get(m) + 1 : 0, this.has(f) ? d.get(f) + 1 : 0); if (d.get(n.id) < v) { d.set(n.id, v); ch = true; }
          }
          if (!ch) break;
        }
        this._d = d; this._kin.clear(); return d;
      },
      _ord(id) { if (!this._d) this.depths(); return this._d.get(id) * 1e5 + by.get(id).i; },
      kin(a, b) {   // kinship coefficient φ (exact for dyadic pedigrees): φ(a,a) = (1 + F_a)/2; else recurse on the younger
        if (!this.has(a) || !this.has(b)) return 0; if (!this._d) this.depths();
        const key = this._ord(a) < this._ord(b) ? a + '|' + b : b + '|' + a; if (this._kin.has(key)) return this._kin.get(key);
        let v; if (a === b) { const [m, f] = this.par(a); v = (1 + this.kin(m, f)) / 2; }
        else { const x = this._ord(a) >= this._ord(b) ? a : b, y = x === a ? b : a, [m, f] = this.par(x); v = (this.kin(m, y) + this.kin(f, y)) / 2; }
        this._kin.set(key, v); return v;
      },
      F(id) { const [m, f] = this.par(id); return this.kin(m, f); },
      r(a, b) { const k = this.kin(a, b), Fa = this.F(a), Fb = this.F(b); return Fa === 0 && Fb === 0 ? 2 * k : 2 * k / Math.sqrt((1 + Fa) * (1 + Fb)); },   // Wright's r; exact when neither is inbred
      path(a, b) {   // one shortest path up from a to a common ancestor and down to b: [a, …, ancestor, …, b]
        if (!this.has(a) || !this.has(b)) return []; if (a === b) return [a];
        const up = s => { const dist = new Map([[s, 0]]), prev = new Map(), q = [s]; while (q.length) { const x = q.shift(); for (const p of this.par(x)) if (this.has(p) && !dist.has(p)) { dist.set(p, dist.get(x) + 1); prev.set(p, x); q.push(p); } } return { dist, prev }; };
        const A = up(a), B = up(b); let best = null, bd = Infinity;
        for (const [k, da] of A.dist) if (B.dist.has(k) && da + B.dist.get(k) < bd) { bd = da + B.dist.get(k); best = k; }
        if (best === null) return [];
        const left = [best]; let x = best; while (x !== a) { x = A.prev.get(x); left.unshift(x); }
        x = best; while (x !== b) { x = B.prev.get(x); left.push(x); }
        return left;
      },
      show(a, b) { this.hl = a == null ? null : this.path(a, b); return this.hl; },
      tag(id, t) { if (!this.has(id)) return this; if (t == null) delete this.tags[id]; else this.tags[id] = t; return this; },
      layout(rect) {
        this.rect = rect; const d = this.depths(), rows = [], X = new Map(), mates = new Map();
        for (const n of list) { const [m, f] = this.par(n.id); if (this.has(m) && this.has(f)) { (mates.get(m) || mates.set(m, []).get(m)).push(f); (mates.get(f) || mates.set(f, []).get(f)).push(m); } (rows[d.get(n.id)] = rows[d.get(n.id)] || []).push(n); }
        const nrow = rows.length || 1, rh = rect.h / nrow; let minSp = Infinity;
        rows.forEach((row, k) => {
          if (!row) return;
          for (const n of row) { const [m, f] = this.par(n.id), xs = [m, f].filter(p => X.has(p)).map(p => X.get(p)); n._k = (xs.length ? wgSum(xs) / xs.length : (k === 0 ? 0 : 1e4)) + n.i * 1e-7; }
          for (const n of row) { const [m, f] = this.par(n.id); if (this.has(m) || this.has(f)) continue; const mt = (mates.get(n.id) || []).map(q => by.get(q)).find(q => q && d.get(q.id) === k && (this.has(this.par(q.id)[0]) || this.has(this.par(q.id)[1]))); if (mt) n._k = mt._k + 1e-8 * (1 + n.i / 1e4); }   // right after its mate, before the mate's next sibling
          row.sort((a, b) => a._k - b._k || a.i - b.i); const sp = rect.w / row.length; minSp = Math.min(minSp, sp);
          row.forEach((q, j) => { X.set(q.id, j / row.length); this.pos[q.id] = { x: rect.x + sp * (j + 0.5), y: rect.y + rh * (k + 0.5) }; });
        });
        this.s = clamp(Math.min(minSp * 0.6, rh * 0.42), 14, 28); return this;
      },
      hit(x, y) { let best = null, bd = Infinity; const R = Math.max(22, this.s / 2); for (const n of list) { const p = this.pos[n.id]; if (!p) continue; const dx = p.x - x, dy = p.y - y, q = dx * dx + dy * dy; if (q <= R * R && q < bd) { bd = q; best = n.id; } } return best; },
      tap(x, y) {   // the four-tag radial menu: tap a node to open it, tap a tag to place it
        if (this.menu != null) { const p = this.pos[this.menu]; for (let k = 0; k < 4; k++) { const dx = x - (p.x + self.OX[k]), dy = y - (p.y + self.OY[k]); if (dx * dx + dy * dy <= 22 * 22) { const id = this.menu; this.tag(id, self.TAGS[k]); this.menu = null; return { id, tag: self.TAGS[k] }; } } this.menu = null; }
        const id = this.hit(x, y); if (id != null) { this.menu = id; this.focus = id; return { id, menu: true }; } return null;
      },
      key(k) {   // arrows walk the nodes (a roving set), Enter opens the tag menu, 1–4 place ½ ¼ ⅛ 0, Escape closes
        if (this.menu != null) { const i = ['1', '2', '3', '4'].indexOf(k); if (i >= 0) { this.tag(this.menu, self.TAGS[i]); this.menu = null; return true; } if (k === 'Escape') { this.menu = null; return true; } }
        const ids = list.filter(n => this.pos[n.id]).map(n => n.id); if (!ids.length) return false;
        if (this.focus == null || !this.pos[this.focus]) { if (/^Arrow/.test(k)) { this.focus = ids[0]; return true; } }
        const f = this.pos[this.focus];
        if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowUp' || k === 'ArrowDown') {
          const sx = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0, sy = k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0; let best = null, bd = Infinity;
          for (const id of ids) { if (id === this.focus) continue; const p = this.pos[id], dx = p.x - f.x, dy = p.y - f.y; if (sx && (Math.abs(dy) > 2 || dx * sx <= 0)) continue; if (sy && dy * sy <= 2) continue; const q = sx ? Math.abs(dx) : Math.abs(dy) * 4 + Math.abs(dx); if (q < bd) { bd = q; best = id; } }
          if (best != null) this.focus = best; return true;
        }
        if ((k === 'Enter' || k === ' ') && this.focus != null) { this.menu = this.menu === this.focus ? null : this.focus; return true; }
        return false;
      },
      draw(c, d2) {
        d2 = d2 || {}; if (!this.rect) return; const T = wgT(d2.theme || wgTheme0()), I = T.I, h = this.s / 2;
        const pairs = new Map(), moff = new Map();
        for (const n of list) { const [m, f] = this.par(n.id); if (!this.has(m) && !this.has(f)) continue; const key = m + '|' + f; if (!pairs.has(key)) pairs.set(key, { m, f, kids: [] }); pairs.get(key).kids.push(n.id); }
        c.lineWidth = 2; c.strokeStyle = I.text; c.lineCap = 'butt';
        for (const P of pairs.values()) {   // a double line for a mating; each further sire of one mother sits 6 px higher
          const pm = this.pos[P.m], pf = this.pos[P.f]; let mx, my;
          if (pm && pf) { const k = moff.get(P.m) || 0; moff.set(P.m, k + 1); my = (pm.y + pf.y) / 2 - k * 6; const s = pm.x < pf.x ? 1 : -1, xa = pm.x + s * h, xb = pf.x - s * h; c.beginPath(); c.moveTo(xa, my - 1.5); c.lineTo(xb, my - 1.5); c.moveTo(xa, my + 1.5); c.lineTo(xb, my + 1.5); c.stroke(); mx = (pm.x + pf.x) / 2; }
          else { const p = pm || pf; mx = p.x; my = p.y + h; }
          const kp = P.kids.map(id => this.pos[id]).filter(Boolean); if (!kp.length) continue;
          const ky = Math.min(...kp.map(q => q.y)) - h, sb = my + (ky - my) / 2, xs = kp.map(q => q.x).concat([mx]);
          c.beginPath(); c.moveTo(mx, my + 1.5); c.lineTo(mx, sb); c.moveTo(Math.min(...xs), sb); c.lineTo(Math.max(...xs), sb); for (const q of kp) { c.moveTo(q.x, sb); c.lineTo(q.x, q.y - h); } c.stroke();
        }
        if (this.hl && this.hl.length > 1) {   // path counting: a 4 px ink path, one tick per step, and the path's ½ⁿ chip
          const ps = this.hl.map(id => this.pos[id]).filter(Boolean); c.lineWidth = 4 * T.k; c.strokeStyle = I.text; c.lineJoin = 'round'; c.beginPath(); ps.forEach((p, j) => { if (j) c.lineTo(p.x, p.y); else c.moveTo(p.x, p.y); }); c.stroke();
          for (let j = 1; j < ps.length; j++) { const a = ps[j - 1], b = ps[j], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, L = Math.sqrt(dx * dx + dy * dy) || 1; c.lineWidth = 2; c.beginPath(); c.moveTo(mx - dy / L * 7, my + dx / L * 7); c.lineTo(mx + dy / L * 7, my - dx / L * 7); c.stroke(); }
          const L = ps.length - 1, mid = ps[Math.floor(ps.length / 2)]; wgPill(c, L <= 3 ? ['', '½', '¼', '⅛'][L] : '1/' + (1 << L), mid.x + h + 18, mid.y, T.lb, T);
        }
        for (const n of list) this._node(c, n, T, h);
        if (this.focus != null && this.pos[this.focus]) { const p = this.pos[this.focus]; c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = I.text; c.strokeRect(p.x - h - 5, p.y - h - 5, 2 * h + 10, 2 * h + 10); c.setLineDash([]); }
        if (this.menu != null && this.pos[this.menu]) { const p = this.pos[this.menu]; for (let k = 0; k < 4; k++) { const x = p.x + self.OX[k], y = p.y + self.OY[k]; c.beginPath(); c.arc(x, y, 22, 0, TAU); c.fillStyle = I.paper; c.fill(); c.lineWidth = 1.5; c.strokeStyle = I.ink; c.stroke(); wgText(c, self.GLYPH[self.TAGS[k]], x, y + 1, 16 * T.k, I.ink, { align: 'center', wt: 700 }); } }
      },
      _node(c, n, T, h) {
        const p = this.pos[n.id]; if (!p) return; const I = T.I, gone = n.dead || n.absent;
        const shape = () => { c.beginPath(); if (n.sex === 'f') c.arc(p.x, p.y, h, 0, TAU); else if (n.sex === 'm') c.rect(p.x - h, p.y - h, 2 * h, 2 * h); else { const s = 0.8660254037844386; c.moveTo(p.x + h, p.y); c.lineTo(p.x + h / 2, p.y + h * s); c.lineTo(p.x - h / 2, p.y + h * s); c.lineTo(p.x - h, p.y); c.lineTo(p.x - h / 2, p.y - h * s); c.lineTo(p.x + h / 2, p.y - h * s); c.closePath(); } };
        const ph = n.pheno === 2 ? 'affected' : n.pheno === 1 ? 'carrier' : n.pheno;
        if (!gone) {   // open = unaffected, half amber = carrier, amber = affected (D4 rule 10 for people; the same code for animals)
          shape(); c.fillStyle = ph === 'affected' ? T.fill('a') : I.paper; c.fill();
          if (ph === 'carrier') { c.save(); shape(); c.clip(); c.fillStyle = T.fill('a'); c.fillRect(p.x, p.y - h, h, 2 * h); c.restore(); }
          if (n.geno && typeof Pal !== 'undefined' && h >= 10) Pal.genotype(c, p.x, p.y, h * 0.62, n.geno[0], n.geno[1] == null ? -1 : n.geno[1], { letter: h >= 14 ? undefined : '' });
        }
        shape(); c.lineWidth = 2; c.strokeStyle = gone ? I.text : I.ink; c.setLineDash(gone ? [4, 3] : []); c.stroke(); c.setLineDash([]);
        if (!gone && T.th === 'dusk') { c.lineWidth = 1; c.strokeStyle = wgRgba(I.text, 0.6); shape(); c.stroke(); }
        if (n.blaze) {   // the father's face blaze: stripe, chevron or spot, a designed cue (D4 4.1a)
          const bx = p.x + h + 7, by = p.y - h + 3; c.beginPath(); c.arc(bx, by, 7, 0, TAU); c.fillStyle = I.paper; c.fill(); c.lineWidth = 1; c.strokeStyle = I.ink; c.stroke(); c.fillStyle = I.ink; c.lineWidth = 2; c.beginPath();
          if (n.blaze === 'stripe') c.fillRect(bx - 1.5, by - 5, 3, 10); else if (n.blaze === 'chevron') { c.moveTo(bx - 4, by + 2); c.lineTo(bx, by - 3); c.lineTo(bx + 4, by + 2); c.stroke(); } else { c.arc(bx, by, 2.5, 0, TAU); c.fill(); }
        }
        const t = this.tags[n.id];
        if (t != null || this.untagged) {   // the player's inference on an ear-flag pill: ½ solid, ¼ dashed, ⅛ dotted, 0 no border; untagged hatched "?"
          const w = 26 * T.k, hh = 22 * T.k, x = p.x - w / 2, y = p.y - h - hh - 4; rrect(c, x, y, w, hh, 5); c.fillStyle = I.paper; c.fill();
          if (t == null) { c.save(); rrect(c, x, y, w, hh, 5); c.clip(); wgHatch(c, x, y, w, hh, wgRgba(I.ink, 0.35), 4); c.restore(); }
          if (t !== '0') { c.setLineDash(t === '1/4' ? [4, 2] : t === '1/8' ? [1.5, 2] : []); c.lineWidth = 1.5; c.strokeStyle = I.ink; rrect(c, x, y, w, hh, 5); c.stroke(); c.setLineDash([]); }
          wgText(c, t == null ? '?' : PedigreeView.GLYPH[t] || t, p.x, y + hh / 2 + 1, 16 * T.k, I.ink, { align: 'center', wt: 700 });
        }
      }
    };
    return pv;
  }
};

/* ================= SceneLab (API_v2 §7.4, dev only): sliders from ch.P, seed, levels, replay ================= */
const SceneLab = {
  el: null, ch: null,
  open(id) {
    const ch = typeof REG !== 'undefined' ? REG[id] : null; if (!ch) { if (typeof toast === 'function') toast('No unit called ' + id + '.'); return false; }
    this.ch = ch; App.playLevel(ch, Url.level || 0, { seed: Url.seed }); this.mount(); return true;
  },
  restart(o) { const ch = this.ch; if (!ch) return; o = o || {}; const lv = o.level != null ? o.level : ch.level || 0; App.playLevel(ch, lv, Object.assign({ seed: App.seed }, o)); this.sync(); },
  close() { if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el); this.el = null; },
  mount() {
    this.close(); const ch = this.ch, d = document, mk = (tag, cls, txt) => { const e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
    const box = mk('aside'); box.id = 'scenelab'; box.setAttribute('aria-label', 'Scene lab');
    const head = mk('div', 'sl-head'); head.appendChild(mk('b', '', 'Lab: ' + (ch.title || ch.id))); const x = mk('button', 'sl-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close the lab'); x.onclick = () => this.close(); head.appendChild(x); box.appendChild(head);
    for (const k in ch.P || {}) {   // one slider per parameter, with its tag chip
      const P = ch.P[k], row = mk('label', 'sl-row'), lo = P.min != null ? +P.min : 0, hi = P.max != null ? +P.max : Math.max(1, +P.v * 2 || 1), int = Number.isInteger(lo) && Number.isInteger(hi) && Number.isInteger(+P.v);
      const inp = mk('input'); inp.type = 'range'; inp.min = lo; inp.max = hi; inp.step = int ? 1 : (hi - lo) / 100; inp.value = P.v; inp.dataset.k = k;
      const out = mk('output', 'mono', String(P.v)); row.appendChild(mk('span', '', P.label || k)); row.appendChild(inp); row.appendChild(out);
      row.appendChild(mk('i', 'sl-tag' + (P.tag === 'designed' ? ' dashed' : ''), (P.tag === 'xN' ? '×N' : P.tag || '') + (P.real ? ' (real ' + P.real + ')' : '')));
      inp.oninput = () => { out.textContent = inp.value; }; inp.onchange = () => { P.v = +inp.value; this.restart(); };
      box.appendChild(row);
    }
    const seedRow = mk('div', 'sl-line'), si = mk('input', 'mono'); si.type = 'number'; si.id = 'sl-seed'; si.setAttribute('aria-label', 'Seed'); si.value = App.seed != null ? App.seed : '';
    const b = (t, fn) => { const e = mk('button', 'btn', t); e.type = 'button'; e.onclick = fn; return e; };
    seedRow.appendChild(mk('span', '', 'Seed')); seedRow.appendChild(si); seedRow.appendChild(b('Go', () => this.restart({ seed: (+si.value) >>> 0 }))); seedRow.appendChild(b('New', () => this.restart({ seed: freshSeed() }))); box.appendChild(seedRow);
    const lv = mk('div', 'sl-line sl-levels'); (ch.levels || [{}]).forEach((L, i) => { const e = b('L' + (i + 1), () => this.restart({ level: i })); e.classList.add('sl-lv'); e.dataset.n = i; if (L.name) e.title = L.name; lv.appendChild(e); }); box.appendChild(lv);
    const ta = mk('textarea', 'mono'); ta.rows = 2; ta.placeholder = 'R1.…'; ta.setAttribute('aria-label', 'Replay code'); box.appendChild(ta);
    const rr = mk('div', 'sl-line');
    rr.appendChild(b('Play replay', () => { if (typeof Replay === 'undefined') { toast('Replays need 00_entry.js.'); return; } const ok = Replay.play(ch, ta.value.trim()); if (ok === false || ok === null) toast('That replay code did not decode.'); this.sync(); }));
    rr.appendChild(b('Copy replay', () => { if (typeof Replay === 'undefined') { toast('Replays need 00_entry.js.'); return; } const log = typeof Sim !== 'undefined' && Sim.log ? Sim.log(ch) : ch.sim && ch.sim.s ? ch.sim.s.log : []; copyText(Replay.encode(App.seed, ch.level || 0, log || [])); toast('Replay copied.'); }));
    rr.appendChild(b('Copy link', () => { copyText(Url.link({ lab: ch.id, dev: 1, level: ch.level || 0, seed: App.seed })); toast('Lab link copied.'); }));
    box.appendChild(rr); d.body.appendChild(box); this.el = box; this.sync();
  },
  sync() { if (!this.el) return; const si = this.el.querySelector('#sl-seed'); if (si && App.seed != null) si.value = App.seed; const lv = this.ch ? this.ch.level || 0 : 0; this.el.querySelectorAll('.sl-lv').forEach(e => e.setAttribute('aria-pressed', String(+e.dataset.n === lv))); }
};

/* ---------- styles for the DOM widgets (lens control, Evidence, the lab); colours follow the v2 tokens ---------- */
const WG_CSS = '.lens-ctl{display:inline-flex;height:44px;border:1.5px solid currentColor;border-radius:22px;overflow:hidden;flex:0 0 auto}' +
  '.lens-ctl button{min-width:58px;min-height:41px;padding:0 12px;border:0;background:transparent;color:inherit;font:600 14px/1 var(--fb);cursor:pointer}' +
  '.lens-ctl button+button{border-left:1px solid currentColor}.lens-ctl button[aria-checked=true]{background:var(--v-text,#E8DFC9);color:var(--v-ground,#152120)}' +
  '.lens-ctl button:focus-visible,.ev button:focus-visible,#scenelab :focus-visible{outline:2px solid var(--v-text,#E8DFC9);outline-offset:2px}' +
  '.ev{display:flex;flex-direction:column;gap:10px;font:15px/1.35 var(--fb)}.ev-budget{display:flex;flex-wrap:wrap;align-items:center;gap:3px}' +
  '.ev-budget i{width:16px;height:16px;border-radius:50%;border:1.5px solid currentColor;box-sizing:border-box}.ev-budget i.on{background:currentColor}.ev-left{margin-left:8px;font-size:13px}' +
  '.ev-shelf,.ev-hyps,.ev-conf{display:flex;flex-wrap:wrap;gap:8px}.ev button{color:inherit;background:transparent;border:1.5px solid currentColor;border-radius:6px;cursor:pointer;font:600 14px/1.2 var(--fb)}' +
  '.ev-tile{position:relative;width:80px;min-height:64px;padding:6px 4px 4px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;gap:4px;text-align:center}' +
  '.ev-cost{font-size:12px;white-space:nowrap;border:1px solid currentColor;border-radius:9px;padding:0 5px}.ev-n{position:absolute;top:-9px;right:-7px;font-size:12px;font-style:normal;padding:0 4px;border:1px solid currentColor;border-radius:8px;background:var(--paper,#E8DFC9);color:var(--ink,#29211B)}' +
  '.ev-tile[aria-disabled=true],.ev-go[aria-disabled=true]{border-style:dashed;background:repeating-linear-gradient(45deg,transparent 0 4px,rgba(127,127,127,.28) 4px 6px)}' +
  '.ev-hyp{min-width:88px;min-height:64px;padding:6px 10px}.ev-hyp.truth{outline:3px double currentColor;outline-offset:2px}.ev-c{min-width:48px;min-height:44px}' +
  '.ev button[aria-checked=true]{background:var(--v-text,#E8DFC9);color:var(--v-ground,#152120)}.card .ev button[aria-checked=true]{background:var(--ink,#29211B);color:var(--paper,#E8DFC9)}' +
  '.ev-go{align-self:flex-start;min-height:44px;padding:0 18px}.ev-power{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:13px}' +
  '.ev-pips{display:flex;align-items:center;gap:3px;font-size:13px}.ev-pips i{width:12px;height:12px;border:1.5px solid currentColor;box-sizing:border-box}.ev-pips.you i.on{background:currentColor}.ev-pips.ghost i{border-style:dashed}.ev-pips.ghost i.on{border-style:solid;background:repeating-linear-gradient(45deg,currentColor 0 1.5px,transparent 1.5px 4px)}.ev-pips span{margin-left:8px}' +
  '#scenelab{position:fixed;top:8px;right:8px;z-index:60;width:280px;max-height:84vh;overflow:auto;padding:8px 10px;background:var(--v-surface,#1C2A28);color:var(--v-text,#E8DFC9);border:1px solid var(--v-text2,#B9B29F);border-radius:6px;font:13px/1.3 var(--fb);box-shadow:0 8px 24px rgba(0,0,0,.4)}' +
  '#scenelab .sl-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}#scenelab .sl-x{width:32px;height:32px;border:0;background:transparent;color:inherit;font-size:20px;cursor:pointer}' +
  '#scenelab .sl-row{display:grid;grid-template-columns:1fr auto;gap:2px 8px;align-items:center;margin:6px 0}#scenelab .sl-row input{grid-column:1/3;width:100%}#scenelab .sl-row output{grid-row:1;grid-column:2}' +
  '#scenelab .sl-tag{grid-column:1/3;justify-self:start;font-style:normal;font-size:12px;border:1px solid currentColor;border-radius:9px;padding:0 6px}#scenelab .sl-tag.dashed{border-style:dashed}' +
  '#scenelab .sl-line{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:8px 0}#scenelab input[type=number]{width:110px}#scenelab textarea{width:100%;box-sizing:border-box}' +
  '#scenelab .btn{min-height:32px;padding:0 10px}#scenelab .sl-levels button[aria-pressed=true]{outline:2px solid currentColor}';

/* ---------- wiring: the chart hook always; keys, frame, play and exit hooks only outside ?v1=1 ---------- */
Hooks.chart = (cv, spec, theme) => LiveGraph.draw(cv, spec, theme);
if (!Url.v1) {
  if (typeof document !== 'undefined' && document.head && document.createElement && !document.getElementById('ef-widgets')) { const st = document.createElement('style'); st.id = 'ef-widgets'; st.textContent = WG_CSS; document.head.appendChild(st); }
  Hooks.key.push(e => Predict._key(e) || GenePoolLens._key(e));
  Hooks.frame.push((dt, c) => { wgEpoch++; if (!wgV2()) return; Predict._frame(dt); Pin.update(dt); Pin._ring(c); });
  Hooks.play.push(ch => { Predict._play(); Pin._play(ch); });
  Hooks.exit.push(() => { Predict._exit(); Pin.clear(); GenePoolLens._active = null; });
  if (typeof window !== 'undefined' && window.addEventListener) for (const k of ['pointerdown', 'keydown', 'click']) window.addEventListener(k, () => { wgEpoch++; }, true);
}
Object.assign(EXPORT, { LiveGraph, Predict, GenePoolLens, Invasion, Ledger, Pin, Evidence, Chips, PedigreeView, DemeMap, PriceBars, TreeView, SceneLab });
