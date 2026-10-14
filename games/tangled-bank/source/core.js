/* ================= CORE ================= */
const TAU = Math.PI * 2;
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
let _s = 1;
function seed(n) { _s = (n >>> 0) || 1; }
function R() { _s |= 0; _s = _s + 0x6D2B79F5 | 0; let t = Math.imul(_s ^ _s >>> 15, 1 | _s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
seed((Date.now() ^ (Math.random() * 1e9)) >>> 0);
function rng(sv) { let s = (sv >>> 0) || 1; return function () { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss() { let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * R()); }
function poisson(l) { if (l <= 0) return 0; if (l > 30) return Math.max(0, Math.round(l + Math.sqrt(l) * gauss())); const L = Math.exp(-l); let k = 0, p = 1; do { k++; p *= R(); } while (p > L); return k - 1; }
function pick(a) { return a[(R() * a.length) | 0]; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0; const t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function mean(a) { if (!a.length) return 0; let s = 0; for (const x of a) s += x; return s / a.length; }
function wpick(w) { let t = 0; for (const x of w) t += x; let r = R() * t; for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; } return w.length - 1; }
const pct = x => Math.round(x * 100) + '%';
const f2 = x => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(2);
const $ = id => document.getElementById(id);

/* ---------- genetics: diploid, additive, free recombination ----------
   trait spec: {k, n (loci), m0, s0 (initial genetic mean/sd), mu (per-locus mutation prob), msd (effect sd), ve (environmental sd)}
   kind 'dom': one biallelic locus, allele 1 dominant. kind 'count': loci hold counts of deleterious mutations. */
const Gen = {
  layout(specs) { let o = 0; const T = {}; for (const s of specs) { s.off = o; o += s.n; T[s.k] = s; } return { specs, T, L: o }; },
  genome(lay, over) {
    const L = lay.L, g = new Float32Array(L * 2);
    for (const s of lay.specs) {
      const o = (over && over[s.k]) || {};
      for (let i = 0; i < s.n; i++) {
        const j = s.off + i;
        if (s.kind === 'dom') { const p = o.p != null ? o.p : s.p0; g[j] = R() < p ? 1 : 0; g[L + j] = R() < p ? 1 : 0; }
        else if (s.kind === 'count') { const c = s.c0f ? s.c0f(i) : (s.c0 || 0); g[j] = Math.min(s.cap || 99, poisson(c)); g[L + j] = Math.min(s.cap || 99, poisson(c)); }
        else { const m = o.m != null ? o.m : s.m0, sd = o.s != null ? o.s : s.s0, n2 = s.n * 2; g[j] = m / n2 + sd / Math.sqrt(n2) * gauss(); g[L + j] = m / n2 + sd / Math.sqrt(n2) * gauss(); }
      }
    }
    return g;
  },
  mate(lay, a, b) { const L = lay.L, c = new Float32Array(L * 2); this._gam(lay, a, c, 0); this._gam(lay, b, c, L); return c; },
  _gam(lay, g, out, off) {
    const L = lay.L;
    for (const s of lay.specs) {
      for (let i = 0; i < s.n; i++) {
        const j = s.off + i; let a = R() < 0.5 ? g[j] : g[L + j];
        if (s.kind === 'dom') { if (a < 0.5) { if (R() < s.mu) a = 1; } else if (s.back && R() < s.back) a = 0; }
        else if (s.kind === 'count') { a = Math.min(s.cap || 99, a + poisson(s.u)); }
        else if (R() < s.mu) a += s.msd * gauss();
        out[off + j] = a;
      }
    }
  },
  add(lay, g, k) { const s = lay.T[k], L = lay.L; let v = 0; for (let i = 0; i < s.n; i++) v += g[s.off + i] + g[L + s.off + i]; return v; },
  ph(lay, g, k) { const s = lay.T[k]; return clamp(this.add(lay, g, k) + (s.ve || 0) * gauss(), s.lo != null ? s.lo : 0, s.hi != null ? s.hi : 1); },
  dom(lay, g, k) { const s = lay.T[k]; return g[s.off] > 0.5 || g[lay.L + s.off] > 0.5; },
  cnt(lay, g, k, i) { const s = lay.T[k]; return g[s.off + i] + g[lay.L + s.off + i]; },
  freq(lay, pop, k) { const s = lay.T[k]; let c = 0; for (const x of pop) c += x.g[s.off] + x.g[lay.L + s.off]; return pop.length ? c / (2 * pop.length) : 0; }
};

/* ---------- colour ---------- */
function hsl2rgb(h, s, l) { h = (((h % 360) + 360) % 360) / 360; const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; const f = t => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255]; }
const css = (c, a) => a == null ? 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')' : 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + a + ')';
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }

/* ---------- value noise ---------- */
function makeNoise(sv) {
  const r = rng(sv), P = new Uint8Array(512), p = []; for (let i = 0; i < 256; i++) p.push(i);
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
  const V = new Float32Array(256); for (let i = 0; i < 256; i++) V[i] = r();
  return function (x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const a = V[P[P[X] + Y]], b = V[P[P[X + 1] + Y]], c = V[P[P[X] + Y + 1]], d = V[P[P[X + 1] + Y + 1]];
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
function fbm(n, x, y, o) { let s = 0, a = 0.5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * n(x * f, y * f); t += a; a *= 0.5; f *= 2.03; } return s / t; }

/* ---------- sound (WebAudio, synthesised) ---------- */
const Snd = {
  ctx: null, on: true,
  init() { if (this.ctx) return; try { const A = window.AudioContext || window.webkitAudioContext; if (A) this.ctx = new A(); } catch (e) { this.ctx = null; } },
  resume() { try { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) { } },
  env(g, t, a, d, v) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); },
  tone(f, d, type, v, f2v) { if (!this.on || !this.ctx) return; try { const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2v) o.frequency.exponentialRampToValueAtTime(f2v, t + d); this.env(g, t, 0.006, d, v || 0.08); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.05); } catch (e) { } },
  noise(d, v, fq, q) { if (!this.on || !this.ctx) return; try { const c = this.ctx, t = c.currentTime, n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), a = b.getChannelData(0); for (let i = 0; i < n; i++) a[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = fq || 2000; f.Q.value = q || 1; const g = c.createGain(); this.env(g, t, 0.004, d, v || 0.1); s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); } catch (e) { } },
  peck() { this.noise(0.05, 0.25, 3000, 2); this.tone(820, 0.05, 'triangle', 0.05, 480); },
  miss() { this.tone(170, 0.09, 'sine', 0.05, 120); },
  bitter() { this.tone(210, 0.38, 'sawtooth', 0.045, 85); this.noise(0.32, 0.05, 520, 0.7); },
  chime() { this.tone(660, 0.5, 'sine', 0.06); setTimeout(() => this.tone(990, 0.6, 'sine', 0.05), 120); },
  star() { [523, 659, 784].forEach((f, i) => setTimeout(() => this.tone(f, 0.5, 'sine', 0.06), i * 110)); },
  click() { this.tone(1300, 0.025, 'square', 0.015); },
  flood() { this.noise(1.5, 0.12, 380, 0.5); },
  dawn() { this.tone(1568, 0.12, 'sine', 0.025, 1760); setTimeout(() => this.tone(2093, 0.1, 'sine', 0.02, 1976), 140); }
};

/* ---------- save ---------- */
const Save = {
  k: 'tangledbank_v1', d: { stars: {}, quick: false, snd: true },
  load() { try { const s = localStorage.getItem(this.k); if (s) { const o = JSON.parse(s); if (o && typeof o === 'object') this.d = Object.assign(this.d, o); if (!this.d.stars) this.d.stars = {}; } } catch (e) { } },
  save() { try { localStorage.setItem(this.k, JSON.stringify(this.d)); } catch (e) { } },
  star(id, n) { if (n > (this.d.stars[id] || 0)) { this.d.stars[id] = n; this.save(); } }
};

/* ---------- UI helpers ---------- */
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = msg; $('toasts').appendChild(t); setTimeout(() => t.classList.add('out'), 3200); setTimeout(() => t.remove(), 3800); }
function starStr(n) { return '★'.repeat(n) + '<span class="off">' + '★'.repeat(3 - n) + '</span>'; }
const Cards = {
  open(o) {
    const layer = $('cards'); layer.innerHTML = '';
    const box = document.createElement('div'); box.className = 'card ' + (o.cls || ''); box.innerHTML = o.html;
    const row = document.createElement('div'); row.className = 'card-btns';
    for (const b of o.buttons || []) {
      const bt = document.createElement('button'); bt.className = 'btn' + (b.primary ? ' primary' : ''); bt.textContent = b.t;
      bt.addEventListener('click', () => { if (box.dataset.armed !== '1') return; Snd.click(); if (b.fn) b.fn(); });
      row.appendChild(bt);
    }
    box.appendChild(row); layer.appendChild(box); layer.classList.add('on');
    setTimeout(() => { box.dataset.armed = '1'; }, 380); // ghost-tap guard: taps from the scene can't hit a fresh card
    if (o.onOpen) requestFrame(() => o.onOpen(box));
    return box;
  },
  close() { const l = $('cards'); l.classList.remove('on'); l.innerHTML = ''; },
  isOpen() { return $('cards').classList.contains('on'); }
};
function requestFrame(fn) { setTimeout(fn, 20); }

/* ---------- charts ---------- */
function fitCanvas(cv) {
  const r = cv.getBoundingClientRect(), d = Math.min(3, window.devicePixelRatio || 1);
  const w = Math.max(10, Math.round(r.width * d)), h = Math.max(10, Math.round(r.height * d));
  if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  const c = cv.getContext('2d'); c.setTransform(d, 0, 0, d, 0, 0); return { c, w: Math.max(10, r.width), h: Math.max(10, r.height) };
}
const THEMES = { dark: { axis: 'rgba(232,223,201,.28)', text: 'rgba(232,223,201,.62)', ref: 'rgba(232,223,201,.5)' }, paper: { axis: 'rgba(41,33,27,.35)', text: 'rgba(41,33,27,.7)', ref: 'rgba(41,33,27,.55)' } };
function lineChart(cv, o) {
  const { c, w, h } = fitCanvas(cv), th = THEMES[o.theme || 'dark'];
  c.clearRect(0, 0, w, h);
  const L = 30, Rm = 8, T = 8, B = 17, pw = w - L - Rm, ph = h - T - B;
  let xmax = o.xmax || 1; for (const s of o.series) xmax = Math.max(xmax, s.d.length - 1);
  const X = i => L + pw * i / xmax, Y = v => T + ph * (1 - (v - o.y0) / (o.y1 - o.y0));
  if (o.bands) for (const b of o.bands) { c.fillStyle = b.c; for (let i = 0; i < b.d.length; i++) { const v = b.d[i]; if (!v) continue; c.globalAlpha = v; c.fillRect(X(i - 0.5), T, Math.max(1, pw / xmax), ph); } c.globalAlpha = 1; }
  c.strokeStyle = th.axis; c.lineWidth = 1; c.beginPath(); c.moveTo(L, T); c.lineTo(L, T + ph); c.lineTo(L + pw, T + ph); c.stroke();
  c.fillStyle = th.text; c.font = '10px ' + getComputedStyle(document.body).getPropertyValue('--fm');
  c.textAlign = 'right'; c.textBaseline = 'middle';
  const fy = o.fy || (v => (Math.round(v * 100) / 100) + '');
  c.fillText(fy(o.y1), L - 4, T + 3); c.fillText(fy(o.y0), L - 4, T + ph - 2);
  c.textBaseline = 'alphabetic'; c.textAlign = 'left'; c.fillText(o.x0l || '0', L, h - 4);
  c.textAlign = 'right'; c.fillText(o.xl || String(xmax), L + pw, h - 4);
  if (o.refs) for (const r of o.refs) { const y = Y(r.v); c.strokeStyle = r.c || th.ref; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(L, y); c.lineTo(L + pw, y); c.stroke(); c.setLineDash([]); if (r.label) { c.fillStyle = r.c || th.ref; c.textAlign = 'right'; c.textBaseline = 'bottom'; c.fillText(r.label, L + pw, y - 2); } }
  if (o.marks) for (const m of o.marks) { const x = X(m); c.strokeStyle = th.ref; c.beginPath(); c.moveTo(x, T + ph); c.lineTo(x, T + ph - 6); c.stroke(); }
  for (const s of o.series) {
    c.strokeStyle = s.c; c.lineWidth = s.w || 2; c.setLineDash(s.dash || []); c.lineJoin = 'round'; c.beginPath(); let on = false, lx = 0, ly = 0;
    for (let i = 0; i < s.d.length; i++) { const v = s.d[i]; if (v == null || isNaN(v)) { on = false; continue; } const x = X(i), y = Y(clamp(v, o.y0, o.y1)); if (!on) { c.moveTo(x, y); on = true; } else c.lineTo(x, y); lx = x; ly = y; }
    c.stroke(); c.setLineDash([]);
    if (on && !s.dash) { c.fillStyle = s.c; c.beginPath(); c.arc(lx, ly, 2.6, 0, TAU); c.fill(); }
  }
}
function histChart(cv, o) {
  const { c, w, h } = fitCanvas(cv), th = THEMES[o.theme || 'paper'];
  c.clearRect(0, 0, w, h);
  const L = 8, Rm = 8, T = 6, B = 18, pw = w - L - Rm, ph = h - T - B, nb = o.bins || 16;
  const bin = v => clamp(Math.floor((v - o.lo) / (o.hi - o.lo) * nb), 0, nb - 1);
  const counts = o.layers.map(ly => { const a = new Array(nb).fill(0); for (const v of ly.v) a[bin(v)]++; return a; });
  let mx = 1; for (const a of counts) for (const x of a) mx = Math.max(mx, x);
  const bw = pw / nb;
  o.layers.forEach((ly, k) => { c.fillStyle = ly.c; for (let i = 0; i < nb; i++) { const hh = ph * counts[k][i] / mx; if (hh > 0) c.fillRect(L + i * bw + 1, T + ph - hh, bw - 2, hh); } });
  c.strokeStyle = th.axis; c.beginPath(); c.moveTo(L, T + ph + 0.5); c.lineTo(L + pw, T + ph + 0.5); c.stroke();
  if (o.marker != null) { const x = L + pw * (o.marker - o.lo) / (o.hi - o.lo); c.strokeStyle = o.markerC || '#b07a14'; c.lineWidth = 2; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(x, T); c.lineTo(x, T + ph); c.stroke(); c.setLineDash([]); c.lineWidth = 1; }
  c.fillStyle = th.text; c.font = '11px ' + getComputedStyle(document.body).getPropertyValue('--fb'); c.textBaseline = 'alphabetic';
  c.textAlign = 'left'; c.fillText(o.l0 || '', L, h - 4); c.textAlign = 'right'; c.fillText(o.l1 || '', L + pw, h - 4);
  if (o.ml) { c.textAlign = 'center'; c.fillStyle = o.markerC || '#b07a14'; const x = L + pw * (o.marker - o.lo) / (o.hi - o.lo); c.fillText(o.ml, clamp(x, L + 30, L + pw - 30), h - 4); }
}
function barChart(cv, o) { // o.groups: [{label, parts:[{v,c}]}]
  const { c, w, h } = fitCanvas(cv), th = THEMES.paper;
  c.clearRect(0, 0, w, h);
  const T = 6, B = 18, ph = h - T - B, n = o.groups.length, gw = w / n;
  let mx = 1; for (const g of o.groups) { let s = 0; for (const p of g.parts) s += p.v; mx = Math.max(mx, s); }
  o.groups.forEach((g, i) => {
    let y = T + ph; const x = i * gw + gw * 0.25, bw = gw * 0.5;
    for (const p of g.parts) { const hh = ph * p.v / mx; c.fillStyle = p.c; c.fillRect(x, y - hh, bw, hh); y -= hh; }
    c.fillStyle = th.text; c.font = '12px ' + getComputedStyle(document.body).getPropertyValue('--fb'); c.textAlign = 'center'; c.fillText(g.label, i * gw + gw / 2, h - 4);
  });
}

/* ---------- stage ---------- */
const Stage = {
  cv: null, ctx: null, w: 1, h: 1, dpr: 1,
  init() {
    this.cv = $('scene'); this.ctx = this.cv.getContext('2d');
    window.addEventListener('resize', () => this.resize());
    try { if (window.ResizeObserver) new ResizeObserver(() => { const r = this.cv.parentElement.getBoundingClientRect(); if (Math.abs(r.width - this.w) > 1 || Math.abs(r.height - this.h) > 1) this.resize(); }).observe(this.cv.parentElement); } catch (e) { }
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
    this.cv.addEventListener('pointerdown', e => {
      Snd.init(); Snd.resume();
      const r = this.cv.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      if (App.mode && App.mode.tap && !Cards.isOpen()) App.mode.tap(x, y);
      e.preventDefault();
    }, { passive: false });
  },
  resize() {
    const p = this.cv.parentElement; if (!p) return; const r = p.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    this.dpr = Math.min(3, window.devicePixelRatio || 1); this.w = r.width; this.h = r.height;
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.cv.style.width = this.w + 'px'; this.cv.style.height = this.h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (App.mode && App.mode.onResize) App.mode.onResize();
  }
};
