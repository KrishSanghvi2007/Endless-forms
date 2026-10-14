/* ================= Equilibrium v2: engine ================= */
const $ = id => document.getElementById(id);
const TAU = Math.PI * 2, R = Math.random;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const pick = a => a[(R() * a.length) | 0];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
const mean = a => a.reduce((s, x) => s + x, 0) / (a.length || 1);
const pct = (v, d = 0) => (v * 100).toFixed(d) + '%';
const fx2 = v => (+v).toFixed(2), fx3 = v => (+v).toFixed(3);
const ease = t => 1 - Math.pow(1 - t, 3), easeIO = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const last = a => a[a.length - 1];
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function binom(n, p) { let k = 0; for (let i = 0; i < n; i++) if (R() < p) k++; return k; }
const SERIF = '"Iowan Old Style","Palatino Linotype",Palatino,"Book Antiqua",Georgia,serif', SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';

/* ---- genetics: counts are [AA, Aa, aa] ---- */
const hwExp = p => [p * p, 2 * p * (1 - p), (1 - p) * (1 - p)];
const pOf = c => { const N = c[0] + c[1] + c[2]; return N ? (2 * c[0] + c[1]) / (2 * N) : 0; };
const frac = c => { const N = (c[0] + c[1] + c[2]) || 1; return c.map(v => v / N); };
function hwCounts(p, N) { const e = hwExp(p).map(f => f * N), c = e.map(Math.floor); const rem = N - c[0] - c[1] - c[2]; const o = e.map((v, i) => [v - c[i], i]).sort((a, b) => b[0] - a[0]); for (let k = 0; k < rem; k++) c[o[k % 3][1]]++; return c; }
function countsToList(c) { const L = []; for (let i = 0; i < c[0]; i++) L.push('AA'); for (let i = 0; i < c[1]; i++) L.push('Aa'); for (let i = 0; i < c[2]; i++) L.push('aa'); return L; }
const listCounts = L => { const c = [0, 0, 0]; for (const g of L) c[g === 'AA' ? 0 : g === 'Aa' ? 1 : 2]++; return c; };
const gtOf = (a, b) => a === b ? (a === 'A' ? 'AA' : 'aa') : 'Aa';
const gamete = g => g === 'AA' ? 'A' : g === 'aa' ? 'a' : (R() < 0.5 ? 'A' : 'a');
const allelesOf = g => g === 'AA' ? ['A', 'A'] : g === 'aa' ? ['a', 'a'] : ['A', 'a'];
const GI = { AA: 0, Aa: 1, aa: 2 };
function wfNext(par, N) { const out = []; for (let i = 0; i < N; i++) out.push(gtOf(gamete(pick(par)), gamete(pick(par)))); return out; }
const chi2 = (obs, p) => { const N = obs[0] + obs[1] + obs[2], E = hwExp(p).map(f => f * N); return { E, x2: obs.reduce((s, o, i) => s + (E[i] > 0 ? (o - E[i]) ** 2 / E[i] : 0), 0) }; };

/* ---- palette ---- */
const Pal = {};
function readPal() { const cs = getComputedStyle(document.documentElement); for (const k of ['ground1', 'ground2', 'ink', 'muted', 'accent', 'A', 'a', 'body', 'plate', 'good']) Pal[k] = cs.getPropertyValue('--' + k).trim() || '#888888'; const th = document.documentElement.dataset.theme; Pal.dark = th === 'dark' || (th !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches); Bg.dirty = true; }
function hexRGB(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
const hexA = (h, a) => { const [r, g, b] = hexRGB(h); return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'; };
const AC = al => al === 'A' ? Pal.A : Pal.a;
const phenCol = g => g === 'aa' ? Pal.a : Pal.A;

/* ---- drawing primitives ---- */
function ink(c, txt, x, y, size, col, align = 'center', weight = 600, fam) { c.font = weight + ' ' + size + 'px ' + (fam === 'serif' ? SERIF : SANS); c.fillStyle = col; c.textAlign = align; c.textBaseline = 'middle'; c.fillText(txt, x, y); }
function rrect(c, x, y, w, h, r) { r = Math.max(0, Math.min(r, w / 2, h / 2)); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function plate(c, x, y, w, h, r = 12, a = 0.92) { c.fillStyle = hexA(Pal.plate, a); rrect(c, x, y, w, h, r); c.fill(); c.strokeStyle = hexA(Pal.ink, 0.1); c.lineWidth = 1; c.stroke(); }
function token(c, x, y, r, al, a = 1) { c.globalAlpha = a; c.fillStyle = AC(al); c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = hexA(Pal.ink, 0.35); c.lineWidth = 1; c.stroke(); if (r >= 6) ink(c, al, x, y + 0.5, Math.round(r * 1.2), al === 'A' ? '#fff' : '#2a2200', 'center', 700, 'serif'); c.globalAlpha = 1; }

/* a top-down beetle wearing its two alleles on its wing cases */
function beetle(c, x, y, s, g, o = {}) {
  const lens = o.lens || Lens.mode, al = o.al || allelesOf(g), cl = lens === 'geno' ? AC(al[0]) : phenCol(g), cr = lens === 'geno' ? AC(al[1]) : phenCol(g);
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); if (o.alpha != null) c.globalAlpha = o.alpha;
  c.strokeStyle = Pal.body; c.lineWidth = Math.max(1, s * 0.07); c.lineCap = 'round';
  if (s >= 8) for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { const yy = -s * 0.15 + k * s * 0.3; c.beginPath(); c.moveTo(sd * s * 0.3, yy); c.lineTo(sd * s * 0.62, yy + (k - 1) * s * 0.18); c.lineTo(sd * s * 0.7, yy + (k - 1) * s * 0.3 + s * 0.08); c.stroke(); }
  if (s >= 10) { c.beginPath(); c.moveTo(-s * 0.08, -s * 0.72); c.lineTo(-s * 0.22, -s * 0.98); c.moveTo(s * 0.08, -s * 0.72); c.lineTo(s * 0.22, -s * 0.98); c.stroke(); }
  c.fillStyle = Pal.body; c.beginPath(); c.ellipse(0, -s * 0.66, s * 0.17, s * 0.13, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(0, -s * 0.42, s * 0.3, s * 0.16, 0, 0, TAU); c.fill();
  const ey = s * 0.14, rx = s * 0.4, ry = s * 0.56;
  c.fillStyle = cl; c.beginPath(); c.moveTo(0, ey - ry); c.ellipse(0, ey, rx, ry, 0, -Math.PI / 2, Math.PI / 2, true); c.closePath(); c.fill();
  c.fillStyle = cr; c.beginPath(); c.moveTo(0, ey - ry); c.ellipse(0, ey, rx, ry, 0, -Math.PI / 2, Math.PI / 2, false); c.closePath(); c.fill();
  c.strokeStyle = hexA('#000000', 0.45); c.lineWidth = Math.max(0.8, s * 0.05); c.beginPath(); c.ellipse(0, ey, rx, ry, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(0, ey - ry); c.lineTo(0, ey + ry); c.stroke();
  if (lens === 'geno' && s >= 15 && !o.noLetters) { ink(c, al[0], -rx * 0.48, ey, Math.round(s * 0.42), al[0] === 'A' ? '#fff' : '#2a2200', 'center', 700, 'serif'); ink(c, al[1], rx * 0.48, ey, Math.round(s * 0.42), al[1] === 'A' ? '#fff' : '#2a2200', 'center', 700, 'serif'); }
  c.restore();
  if (o.ring) { c.strokeStyle = o.ring; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, s * 0.95, 0, TAU); c.stroke(); }
}
const elytra = (P, s) => [{ x: P.x - s * 0.2, y: P.y + s * 0.14 }, { x: P.x + s * 0.2, y: P.y + s * 0.14 }];

/* ---- layout ---- */
function field(n, Rc, seed = 1, o = {}) {
  const r = rng(seed), cols = Math.max(2, Math.round(Math.sqrt(n * Rc.w / Math.max(1, Rc.h)))), rows = Math.max(1, Math.ceil(n / cols)), cw = Rc.w / cols, ch = Rc.h / rows, s = clamp(Math.min(cw, ch) * 0.4, 5, o.max || 24);
  const pts = []; for (let i = 0; i < n; i++) pts.push({ x: Rc.x + ((i % cols) + 0.5 + (r() - 0.5) * 0.3) * cw, y: Rc.y + (((i / cols) | 0) + 0.5 + (r() - 0.5) * 0.25) * ch, s, rot: (r() - 0.5) * 0.7 }); return pts;
}
function hitList(pts, x, y, ok) { let bi = -1, bd = 1e9; pts.forEach((p, i) => { if (ok && !ok(i)) return; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; bi = i; } }); return bi >= 0 && bd < Math.max(18, pts[bi].s * 1.1) ? bi : -1; }
function jarSlots(Rc, n) { let r = 10; for (; r > 1.5; r -= 0.5) { const cols = Math.floor((Rc.w - 4) / (2 * r + 1.5)), rows = Math.floor((Rc.h - 4) / (2 * r + 1.5)); if (cols * rows >= n) break; } const cols = Math.max(1, Math.floor((Rc.w - 4) / (2 * r + 1.5))), out = []; for (let k = 0; k < n; k++) out.push({ x: Rc.x + 2 + r + (k % cols) * (2 * r + 1.5), y: Rc.y + Rc.h - 2 - r - ((k / cols) | 0) * (2 * r + 1.5), r }); return out; }
function drawJar(c, Rc, al, n, tot) { c.strokeStyle = hexA(AC(al), 0.9); c.lineWidth = 2; rrect(c, Rc.x, Rc.y, Rc.w, Rc.h, 10); c.stroke(); c.fillStyle = hexA(AC(al), 0.08); c.fill(); ink(c, al + ' alleles', Rc.x + Rc.w / 2, Rc.y - 11, 13, Pal.ink, 'center', 700); if (n != null) ink(c, n + (tot ? '  (' + pct(n / tot) + ')' : ''), Rc.x + Rc.w / 2, Rc.y + Rc.h + 13, 13, Pal.ink, 'center', 700); }

/* the "break into alleles" animation: every wing case flies to its jar */
function makeSplit(pop, pts, jarA, jarB) {
  const toks = [], sA = [], sB = []; pop.forEach((g, i) => { const P = pts[i], E = elytra(P, P.s), al = allelesOf(g); al.forEach((a, k) => toks.push({ al: a, x0: E[k].x, y0: E[k].y, i })); });
  const nA = toks.filter(t => t.al === 'A').length, slA = jarSlots(jarA, nA), slB = jarSlots(jarB, toks.length - nA); let ia = 0, ib = 0;
  toks.forEach(t => { const s = t.al === 'A' ? slA[ia++] : slB[ib++]; t.x1 = s.x; t.y1 = s.y; t.r = s.r; });
  return { toks, t: 0, dir: 0, nA, na: toks.length - nA, jarA, jarB, update(dt) { this.t = clamp(this.t + this.dir * dt / 1.4, 0, 1); }, done() { return this.t >= 1; },
    draw(c) { const n = this.toks.length; this.toks.forEach((t, k) => { const kk = clamp(this.t * 1.6 - (k / n) * 0.6, 0, 1), e = easeIO(kk); if (this.t <= 0) return; token(c, lerp(t.x0, t.x1, e), lerp(t.y0, t.y1, e) - Math.sin(e * Math.PI) * 30, lerp(Math.max(3, t.r * 0.8), t.r, e), t.al); }); } };
}

/* ---- bars ---- */
function genoBar(c, x, y, w, h, f, o = {}) {
  let cx = x; const cols = [Pal.A, null, Pal.a], labs = ['AA', 'Aa', 'aa'];
  for (let i = 0; i < 3; i++) { const ww = w * clamp(f[i], 0, 1); if (ww < 0.5) continue; if (i === 1) { c.fillStyle = Pal.A; c.fillRect(cx, y, ww, h / 2); c.fillStyle = Pal.a; c.fillRect(cx, y + h / 2, ww, h / 2); } else { c.fillStyle = cols[i]; c.fillRect(cx, y, ww, h); } if (ww > 34 && o.labels !== false) ink(c, labs[i] + ' ' + pct(f[i]), cx + ww / 2, y + h / 2, 11.5, i === 2 ? '#2a2200' : '#fff', 'center', 700); cx += ww; }
  c.strokeStyle = hexA(Pal.ink, 0.35); c.lineWidth = 1; c.strokeRect(x, y, w, h);
  if (o.exp) { let ex = x; for (let i = 0; i < 2; i++) { ex += w * o.exp[i]; c.fillStyle = Pal.ink; c.beginPath(); c.moveTo(ex, y - 2); c.lineTo(ex - 5, y - 9); c.lineTo(ex + 5, y - 9); c.closePath(); c.fill(); } if (o.expLabel) ink(c, o.expLabel, x + w, y - 16, 10.5, Pal.muted, 'right', 600); }
  if (o.title) ink(c, o.title, x, y - (o.exp ? 22 : 10), 11.5, Pal.muted, 'left', 700);
}
function alleleBar(c, x, y, w, h, p, o = {}) { c.fillStyle = Pal.A; c.fillRect(x, y, w * p, h); c.fillStyle = Pal.a; c.fillRect(x + w * p, y, w * (1 - p), h); c.strokeStyle = hexA(Pal.ink, 0.35); c.lineWidth = 1; c.strokeRect(x, y, w, h); if (w * p > 46) ink(c, 'p ' + fx2(p), x + w * p / 2, y + h / 2, 11.5, '#fff', 'center', 700); if (w * (1 - p) > 46) ink(c, 'q ' + fx2(1 - p), x + w * p + w * (1 - p) / 2, y + h / 2, 11.5, '#2a2200', 'center', 700); if (o.title) ink(c, o.title, x, y - 10, 11.5, Pal.muted, 'left', 700); }
function lineChart(c, x, y, w, h, series, o = {}) {
  plate(c, x - 10, y - 10, w + 20, h + (o.title ? 38 : 20), 12);
  c.strokeStyle = hexA(Pal.ink, 0.25); c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + h); c.lineTo(x + w, y + h); c.stroke();
  if (o.ref != null) { const ry = y + h - h * o.ref; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x, ry); c.lineTo(x + w, ry); c.stroke(); c.setLineDash([]); }
  const n = Math.max(2, o.n || Math.max(2, ...series.map(s => s.d.length)));
  for (const s of series) { if (!s.d.length) continue; c.strokeStyle = s.col; c.lineWidth = s.wd || 2.4; c.beginPath(); s.d.forEach((v, i) => { const X = x + w * i / (n - 1), Y = y + h - h * clamp(v, 0, 1); i ? c.lineTo(X, Y) : c.moveTo(X, Y); }); c.stroke(); }
  if (o.title) ink(c, o.title, x + w / 2, y + h + 15, 11.5, Pal.muted, 'center', 600);
  if (o.yl) { ink(c, o.yl[1], x - 4, y + 2, 10, Pal.muted, 'right', 600); ink(c, o.yl[0], x - 4, y + h, 10, Pal.muted, 'right', 600); }
}

/* ---- the de Finetti triangle: horizontal = share of a alleles, height = share of heterozygotes ---- */
const Fin = {
  geo(x, y, size) { const H = size * 0.866; return { x, y, size, H, AA: { x, y: y + H }, aa: { x: x + size, y: y + H }, Aa: { x: x + size / 2, y } }; },
  pt(G, f) { return { x: G.AA.x + (f[1] * 0.5 + f[2]) * G.size, y: G.AA.y - f[1] * G.H }; },
  inv(G, x, y) { const h = (G.AA.y - y) / G.H, xr = (x - G.AA.x) / G.size, faa = xr - h / 2, fAA = 1 - h - faa; if (h < -0.02 || faa < -0.02 || fAA < -0.02) return null; return [clamp(fAA, 0, 1), clamp(h, 0, 1), clamp(faa, 0, 1)]; },
  draw(c, G, o = {}) {
    plate(c, G.x - 22, G.y - 30, G.size + 44, G.H + 70, 14);
    c.strokeStyle = hexA(Pal.ink, 0.5); c.lineWidth = 1.5; c.beginPath(); c.moveTo(G.AA.x, G.AA.y); c.lineTo(G.Aa.x, G.Aa.y); c.lineTo(G.aa.x, G.aa.y); c.closePath(); c.stroke();
    c.strokeStyle = Pal.good; c.lineWidth = 2.5; c.beginPath(); for (let k = 0; k <= 60; k++) { const P = this.pt(G, hwExp(1 - k / 60)); k ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); } c.stroke();
    ink(c, 'all AA', G.AA.x, G.AA.y + 14, 11, Pal.ink, 'center', 700); ink(c, 'all aa', G.aa.x, G.aa.y + 14, 11, Pal.ink, 'center', 700); ink(c, 'all Aa', G.Aa.x, G.Aa.y - 12, 11, Pal.ink, 'center', 700);
    if (o.axis !== false) { ink(c, 'share of a alleles →', G.x + G.size / 2, G.AA.y + 30, 10.5, Pal.muted, 'center', 600); ink(c, 'HW curve', G.x + G.size * 0.5, G.AA.y - G.H * 0.5 + 12, 10.5, Pal.good, 'center', 700); }
    if (o.trail && o.trail.length > 1) { c.strokeStyle = hexA(o.trailCol || Pal.accent, 0.7); c.lineWidth = 2; c.setLineDash([3, 3]); c.beginPath(); o.trail.forEach((f, k) => { const P = this.pt(G, f); k ? c.lineTo(P.x, P.y) : c.moveTo(P.x, P.y); }); c.stroke(); c.setLineDash([]); }
    for (const q of (o.pts || [])) { const P = this.pt(G, q.f); c.fillStyle = q.col || Pal.accent; c.beginPath(); c.arc(P.x, P.y, q.r || 6, 0, TAU); c.fill(); c.strokeStyle = Pal.plate; c.lineWidth = 2; c.stroke(); if (q.label) ink(c, q.label, P.x + 10, P.y - 10, 11, Pal.ink, 'left', 700); }
    if (o.pred) { const P = this.pt(G, o.pred); c.strokeStyle = Pal.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(P.x - 7, P.y - 7); c.lineTo(P.x + 7, P.y + 7); c.moveTo(P.x + 7, P.y - 7); c.lineTo(P.x - 7, P.y + 7); c.stroke(); ink(c, 'your guess', P.x, P.y + 16, 10.5, Pal.ink, 'center', 700); }
  }
};

/* ---- lens ---- */
const Lens = {
  mode: 'geno',
  init() { document.querySelectorAll('#lens button').forEach(b => b.onclick = () => { Snd.click(); this.set(b.dataset.l); }); },
  show(on, mode) { $('lens').classList.toggle('on', !!on); if (mode) this.set(mode, true); },
  set(m, quiet) { this.mode = m; document.querySelectorAll('#lens button').forEach(b => b.classList.toggle('sel', b.dataset.l === m)); if (!quiet && Game.scene && Game.scene.onLens) Game.scene.onLens(m); }
};

/* ---- background: a quiet field, nothing moves ---- */
const Bg = { dirty: true, off: null,
  build() { const w = Stage.w, h = Stage.h; this.off = document.createElement('canvas'); this.off.width = Math.max(1, Math.round(w * Stage.dpr)); this.off.height = Math.max(1, Math.round(h * Stage.dpr)); const c = this.off.getContext('2d'); c.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0); const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, Pal.ground1); g.addColorStop(1, Pal.ground2); c.fillStyle = g; c.fillRect(0, 0, w, h); const r = rng(3); c.fillStyle = hexA(Pal.ink, Pal.dark ? 0.035 : 0.045); for (let i = 0; i < w * h / 900; i++) c.fillRect(r() * w, r() * h, 1.4, 1.4); this.dirty = false; },
  draw(c, w, h) { if (this.dirty || !this.off) this.build(); c.drawImage(this.off, 0, 0, w, h); } };

/* ---- stage ---- */
const Stage = {
  w: 0, h: 0, dpr: 1, down: null,
  init() { this.cv = $('cv'); this.c = this.cv.getContext('2d'); addEventListener('resize', () => this.resize()); this.resize(); this.bind(); },
  resize() { this.dpr = Math.min(2, window.devicePixelRatio || 1); this.w = window.innerWidth; this.h = window.innerHeight; this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr); this.cv.style.width = this.w + 'px'; this.cv.style.height = this.h + 'px'; Bg.dirty = true; if (Game.scene && Game.scene.resize) Game.scene.resize(); },
  area() { const tp = $('top'), ln = $('lens'), pn = $('panel'); let t = tp.classList.contains('hide') ? 0 : tp.getBoundingClientRect().bottom; if (ln.classList.contains('on')) t = Math.max(t, ln.getBoundingClientRect().bottom); const b = pn.classList.contains('hide') ? this.h : pn.getBoundingClientRect().top; return { x: 0, y: t + 6, w: this.w, h: Math.max(160, b - t - 12) }; },
  bind() {
    const pos = e => { const r = this.cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    this.cv.addEventListener('pointerdown', e => { Snd.unlock(); if (UI.modal) return; const [x, y] = pos(e); this.down = { x, y }; const S = Game.scene; if (S && S.down) S.down(x, y); });
    this.cv.addEventListener('pointermove', e => { if (!this.down) return; const [x, y] = pos(e); const S = Game.scene; if (S && S.move) S.move(x, y); });
    const up = e => { if (!this.down) return; const [x, y] = pos(e), d = this.down; this.down = null; const S = Game.scene; if (S && S.up) S.up(x, y); if (Math.hypot(x - d.x, y - d.y) < 14 && S && S.tap) S.tap(x, y); };
    this.cv.addEventListener('pointerup', up); this.cv.addEventListener('pointercancel', () => { this.down = null; });
  }
};

/* ---- feedback effects (only ones that carry meaning) ---- */
const FX = {
  ps: [],
  add(p) { this.ps.push(Object.assign({ t: 0, life: 1, delay: 0 }, p)); return p; },
  fly(x0, y0, x1, y1, al, life, done, o = {}) { return this.add(Object.assign({ kind: 'fly', x0, y0, x1, y1, x: x0, y: y0, al, life, done, lift: 24 }, o)); },
  update(dt) { for (const p of this.ps) { p.t += dt; const tt = p.t - p.delay; if (p.kind === 'fly') { const k = easeIO(clamp(tt / p.life, 0, 1)); p.x = lerp(p.x0, p.x1, k); p.y = lerp(p.y0, p.y1, k) - Math.sin(k * Math.PI) * p.lift; } if (tt >= p.life && p.done && !p.fired) { p.fired = true; p.done(p); } } this.ps = this.ps.filter(p => p.t - p.delay < p.life); },
  draw(c) { for (const p of this.ps) { if (p.t < p.delay) continue; const k = clamp((p.t - p.delay) / p.life, 0, 1); if (p.kind === 'fly') { if (p.g) beetle(c, p.x, p.y, p.s || 12, p.g, { lens: p.lens }); else token(c, p.x, p.y, p.r || 6, p.al); } else if (p.kind === 'ring') { c.strokeStyle = hexA(p.col, 0.8 * (1 - k)); c.lineWidth = 2.5; c.beginPath(); c.arc(p.x, p.y, 6 + k * (p.rad || 30), 0, TAU); c.stroke(); } else if (p.kind === 'text') { c.globalAlpha = 1 - k * k; ink(c, p.txt, p.x, p.y - k * 18, p.size || 18, p.col || Pal.ink, 'center', 800, 'serif'); c.globalAlpha = 1; } } },
  clear() { this.ps = []; },
  ring(x, y, col, rad = 30) { this.add({ kind: 'ring', x, y, col: col || Pal.accent, rad, life: 0.55 }); },
  text(x, y, txt, col, size) { this.add({ kind: 'text', x, y, txt, col, size, life: 1.2 }); }
};

/* ---- sound ---- */
const Snd = {
  ctx: null,
  unlock() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  tone(f, d = 0.15, type = 'sine', v = 0.05, delay = 0) { if (Save.d.mute || !this.ctx) return; try { const t0 = this.ctx.currentTime + delay, o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); o.connect(g); g.connect(this.ctx.destination); o.start(t0); o.stop(t0 + d + 0.03); } catch (e) { } },
  click() { this.tone(900, 0.05, 'triangle', 0.025); }, pop() { this.tone(520 + R() * 200, 0.07, 'sine', 0.03); },
  good() { this.tone(660, 0.13, 'sine', 0.05); this.tone(990, 0.18, 'sine', 0.045, 0.08); }, bad() { this.tone(233, 0.24, 'triangle', 0.045); },
  star() { [523, 659, 784].forEach((f, i) => this.tone(f, 0.26, 'sine', 0.045, i * 0.09)); }
};

/* ---- save ---- */
const Save = {
  k: 'equilibrium_hw_v2', d: { stars: {}, done: {}, mute: false, all: false, best: 0, theme: '' },
  load() { try { const s = localStorage.getItem(this.k); if (s) { const o = JSON.parse(s); if (o && typeof o === 'object') Object.assign(this.d, o); } } catch (e) { } if (!this.d.stars) this.d.stars = {}; if (!this.d.done) this.d.done = {}; },
  save() { try { localStorage.setItem(this.k, JSON.stringify(this.d)); } catch (e) { } },
  star(id, n) { if (n > (this.d.stars[id] || 0)) this.d.stars[id] = n; this.d.done[id] = 1; this.save(); }
};
const starStr = n => '★'.repeat(n) + '<span class="off">' + '★'.repeat(Math.max(0, 3 - n)) + '</span>';

/* ---- interface ---- */
const UI = {
  modal: false,
  clear() { $('say').innerHTML = ''; $('ctl').innerHTML = ''; },
  say(h) { $('say').innerHTML = h; },
  ctl(...nodes) { const c = $('ctl'); c.innerHTML = ''; for (const n of nodes) if (n) c.appendChild(n); },
  btn(t, fn, cls) { const b = document.createElement('button'); b.className = 'btn' + (cls ? ' ' + cls : ''); b.innerHTML = t; b.addEventListener('click', () => { if (b.disabled) return; Snd.unlock(); Snd.click(); fn(b); }); return b; },
  row(...nodes) { const d = document.createElement('div'); d.className = 'row'; for (const n of nodes) if (n) d.appendChild(n); return d; },
  slider(o) { const w = document.createElement('label'); w.className = 'sld'; w.innerHTML = '<span class="sl-l">' + o.label + '</span><input type="range" min="' + o.min + '" max="' + o.max + '" step="' + o.step + '" value="' + o.value + '" aria-label="' + (o.aria || o.label) + '"><b class="sl-v"></b>'; const inp = w.querySelector('input'), v = w.querySelector('.sl-v'); const upd = () => { v.textContent = o.fmt ? o.fmt(+inp.value) : inp.value; if (o.oninput) o.oninput(+inp.value); }; inp.addEventListener('input', upd); upd(); w.inp = inp; return w; },
  choices(opts, fn, wide) { return UI.row(...opts.map(([k, t]) => UI.btn(t, b => { $('ctl').querySelectorAll('button').forEach(x => x.disabled = true); fn(k, b); }, wide ? 'wide' : ''))); },
  card(o) {
    const m = $('modal'); m.innerHTML = ''; const box = document.createElement('div'); box.className = 'card'; box.innerHTML = (o.title ? '<h2>' + o.title + '</h2>' : '') + (o.html || '');
    const row = document.createElement('div'); row.className = 'card-btns'; let armed = false; setTimeout(() => { armed = true; }, 330);
    for (const b of (o.buttons || [{ t: 'Continue', primary: true }])) { const el = document.createElement('button'); el.className = 'btn' + (b.primary ? ' primary' : ''); el.innerHTML = b.t; el.addEventListener('click', () => { if (!armed) return; Snd.unlock(); Snd.click(); UI.close(); if (b.fn) b.fn(); }); row.appendChild(el); }
    box.appendChild(row); m.appendChild(box); m.classList.add('on'); this.modal = true;
  },
  close() { $('modal').classList.remove('on'); $('modal').innerHTML = ''; this.modal = false; },
  toast(h, ms = 3800) { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = h; const box = $('toasts'); while (box.children.length >= 2) box.firstChild.remove(); box.appendChild(t); setTimeout(() => t.classList.add('out'), ms); setTimeout(() => t.remove(), ms + 450); },
  top(name, sub) { $('st-name').textContent = name || ''; $('st-sub').textContent = sub || ''; }
};
function stepper(S) { S.si = -1; S.next = function () { this.si++; const f = this.steps[this.si]; if (f) f.call(this); }; }
/* ask a question in the panel, then explain; the answer drives what happens next */
function quiz(S, q, opts, ans, why, after) { UI.say(q); UI.ctl(UI.choices(opts, k => { const ok = k === ans; if (ok) { S.score = (S.score || 0) + 1; Snd.good(); } else Snd.bad(); UI.say((ok ? '<b>Right.</b> ' : '<b>Not quite.</b> ') + why); UI.ctl(UI.row(UI.btn('Next', () => after(ok), 'primary'))); }, opts.some(o => o[1].length > 18))); }

/* ---- loop ---- */
const Game = {
  scenes: {}, scene: null, id: '', t: 0, last: 0,
  reg(s) { this.scenes[s.id] = s; },
  go(id, arg) {
    if (this.scene && this.scene.exit) this.scene.exit(); UI.close(); UI.clear(); FX.clear(); Lens.show(false);
    const S = this.scenes[id]; this.scene = S; this.id = id; $('levels').classList.remove('on');
    $('panel').classList.toggle('hide', !!S.noPanel); $('top').classList.toggle('hide', !!S.noTop); UI.top(S.title || '', S.sub || ''); S.enter(arg);
  },
  frame() {
    const now = performance.now(), dt = Math.min(0.05, this.last ? (now - this.last) / 1000 : 0.016); this.last = now; this.t += dt;
    const c = Stage.c; c.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0);
    try { Bg.draw(c, Stage.w, Stage.h); const S = this.scene; if (S) { if (!UI.modal && S.update) S.update(dt); if (S.draw) S.draw(c, Stage.w, Stage.h); } FX.update(dt); FX.draw(c); } catch (e) { showErr(e); }
    setTimeout(() => this.frame(), 16);
  }
};
function showErr(e) { const b = $('err'); if (b && b.style.display !== 'block') { b.style.display = 'block'; b.textContent = 'Something went wrong: ' + ((e && e.stack) || e); } }
window.addEventListener('error', e => showErr(e.error || e.message));
