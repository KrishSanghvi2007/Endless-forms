/* ================= v2/00_fx.js: juice, labels, voice (FCR-4, 7, 8a, 9; D4 §3, §5, §7, §8; API_v2 §5.3) =================
   Fx: tweens, five particle kinds, number pops, rings, shake, hit-stop, juice tiers, the frame-time governor, Calm.
   Layer: a cached crowd canvas. Ghost: the 3 s ghost-hand demonstration. Lbl: the only route for canvas words.
   Live: the polite screen-reader line. Whisper: the one-slot toast (core.js's toast is rebound to it). Txt: placeholders
   and word counts. Snd2: the new WebAudio voices, each with a visual twin.
   Rules: nothing here calls R() (cosmetic jitter uses Fx.rnd); every frame hook is a no-op for a legacy chapter, so legacy
   runs are untouched; no Math.exp/log/pow/sin/cos (tables, polynomials and Det instead). Under ?v1=1 toast stays legacy. */

/* the one text routine of this file: Lbl, pops and key caps draw words through it */
function fxText(c, s, x, y, px, col, align, fam, weight) {
  c.font = (weight || 600) + ' ' + Math.round(px) + 'px ' + fam; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillStyle = col;
  c.fillText(s, x, y);
}
const fxNow = () => performance.now();
const fxV2 = () => typeof App !== 'undefined' && !!App.ch && App.ch.v2 === true;
const fxPal = (k, d) => typeof Pal !== 'undefined' ? Pal[k] : d;
const fxFam = (() => { let f = null; const css = (k, d) => { try { const v = getComputedStyle(document.body).getPropertyValue(k).trim(); return v || d; } catch (e) { return d; } };
  return { get b() { return (f || (f = { b: css('--fb', 'Georgia, serif'), m: css('--fm', 'monospace'), d: css('--fd', 'Georgia, serif') })).b; }, get m() { this.b; return f.m; }, get d() { this.b; return f.d; }, reset() { f = null; } }; })();

const Fx = (() => {
  const parts = [], rings = [], pops = [], tws = [], flashes = [], afters = [];
  let shake = null, hs = 0, lastShake = -1e9, lastT3 = -1e9, gov = 0, slow = 0, govCalm = false, rnd = rng(1859), t0 = 0;
  let lastFrame = -1e9, pumping = false, lastVis = -1e9, mq = null, epoch = 1, errs = 0;
  const ev = k => { lastVis = fxNow(); if (typeof Snd2 !== 'undefined') Snd2._seen(); if (typeof Events !== 'undefined' && Events.debug) Events.emit('fx', { k }); };
  // easing: arrivals ease-out-cubic, travel ease-in-out-cubic, UI pops a spring (k 170, c 22), timers linear (D4 §5.1)
  let SPR = null;
  const spring = t => {
    if (!SPR) { SPR = new Float64Array(121); let x = 0, v = 0; const h = 1 / 2400; for (let i = 0; i <= 120; i++) { SPR[i] = x; for (let j = 0; j < 12; j++) { v += (170 * (1 - x) - 22 * v) * h; x += v * h; } } const e = SPR[120]; for (let i = 0; i <= 120; i++) SPR[i] /= e; }
    const f = Math.max(0, Math.min(1, t)) * 120, i = Math.floor(f); return i >= 120 ? 1 : SPR[i] + (SPR[i + 1] - SPR[i]) * (f - i);
  };
  const EASE = { linear: t => t, out: t => 1 - (1 - t) * (1 - t) * (1 - t), inout: t => t < 0.5 ? 4 * t * t * t : 1 - (2 - 2 * t) * (2 - 2 * t) * (2 - 2 * t) / 2, spring };
  let DIRS = null;   // 32 unit vectors from Det, built once
  const dir = i => { if (!DIRS) { DIRS = []; for (let k = 0; k < 32; k++) DIRS.push([Det.cos(k * TAU / 32), Det.sin(k * TAU / 32)]); } return DIRS[((i % 32) + 32) % 32]; };
  const KINDS = { dust: 300, scale: 1300, spark: 280, droplet: 650, egg: 700 }, DEFINK = { dust: '#CFC4AC', scale: '#E9E2CF', droplet: '#B9D2DA', egg: '#EFE6CC' }, SPRITES = new Map();
  const out3 = EASE.out;
  const tri = p => { p = p - Math.floor(p); return p < 0.25 ? 4 * p : p < 0.75 ? 2 - 4 * p : 4 * p - 4; };   // triangle wave, period 1

  const F = {
    errors: [], EASE,
    get epoch() { return epoch; },
    rnd() { return rnd(); },
    get calm() {
      if (govCalm) return true;
      try { if (Save.d && Save.d.ui && Save.d.ui.calm) return true; } catch (e) { }
      if (typeof Url !== 'undefined' && Url.calm) return true;
      if (!mq && typeof window !== 'undefined' && window.matchMedia) try { mq = window.matchMedia('(prefers-reduced-motion: reduce)'); } catch (e) { mq = { matches: false }; }
      return !!(mq && mq.matches);
    },
    get gov() { return gov; },
    get squash() { return !this.calm && gov < 2; },   // rigs and chapters skip squash-and-stretch when false
    get count() { return parts.length; },
    cap() { const big = typeof Stage !== 'undefined' && (Stage.layout === 'desktop' || Stage.layout === 'projector'); return (big ? 300 : 150) >> (gov >= 1 ? 1 : 0); },

    // → {cancel(), done}; props numeric; a newer tween on the same property takes it over
    tween(obj, props, ms, ease, done) {
      ev('tween'); ms = ms > 0 ? ms : 1; const keys = Object.keys(props || {}).filter(k => typeof props[k] === 'number');
      for (const t of tws) if (t.obj === obj) for (const k of keys) { const i = t.keys.indexOf(k); if (i >= 0) { t.keys.splice(i, 1); t.from.splice(i, 1); t.to.splice(i, 1); } }
      const calm = this.calm, tw = { obj, keys, from: keys.map(k => +obj[k] || 0), to: keys.map(k => props[k]), ms: Math.max(1, calm ? Math.min(ms, 120) : ms), age: 0, ease: EASE[calm ? 'linear' : ease] || EASE.out, done, dead: false, born: epoch };
      tw.h = { cancel() { tw.dead = true; }, get done() { return tw.dead || tw.age >= tw.ms; } };
      tws.push(tw); this._kick(); return tw.h;
    },
    // dust | scale | spark | droplet | egg; o: {ink, spread}. Calm: static stamps that fade in over 150 ms
    burst(kind, x, y, n, o) {
      if (!KINDS[kind]) kind = 'dust'; o = o || {}; ev('burst:' + kind);
      n = Math.max(1, Math.round(n == null ? 8 : n)); if (gov >= 1) n = Math.ceil(n / 2);
      const cap = this.cap(), calm = this.calm, base = Math.floor(rnd() * 32);
      while (parts.length + n > cap && parts.length) parts.shift();
      for (let i = 0; i < n && i < cap; i++) {
        const d = dir(base + Math.round(i * 32 / n) + (calm ? 0 : Math.floor(rnd() * 3) - 1));
        parts.push({ k: kind, x: x, y: y, ux: d[0], uy: d[1], sp: 0.7 + 0.6 * rnd(), vr: (rnd() - 0.5) * 8, age: 0, life: calm ? 450 : KINDS[kind], calm, ink: o.ink || null, s: o.spread || 1, born: epoch, i });
      }
    },
    // number pop-up: ≥ 16 px mono bold ink on a paper pill, ▲/▼ by sign; rises 24 px over 700 ms; numbers within 150 ms and 28 px merge
    pop(text, x, y, sign, o) {
      ev('pop'); text = String(text); sign = sign > 0 ? 1 : sign < 0 ? -1 : 0; const t = fxNow(), num = s => /^[+\-−]?\d+$/.test(s) ? +s.replace('−', '-') : null;
      for (const p of pops) if (t - p.t < 150 && Math.abs(p.x - x) < 28 && Math.abs(p.y - y) < 28 && p.sign === sign) {
        const a = num(p.text), b = num(text);
        if (a != null && b != null) { const s = a + b; p.text = s > 0 ? '+' + s : s < 0 ? '−' + (-s) : '0'; } else p.text = text;
        p.age = Math.min(p.age, 60); return;
      }
      pops.push({ text, x, y, sign, age: 0, t, born: epoch, size: (o && o.size) || 16 });
    },
    // ripple ring (solid, 400 ms) or the dashed 2 s "gone" ghost ring; o: {dashed, ms, ink, lw}
    ring(x, y, r, o) { o = o || {}; ev('ring'); rings.push({ x, y, r: r || 16, dashed: !!o.dashed, ms: o.ms || (o.dashed ? 2000 : 400), ink: o.ink || null, lw: o.lw || 2, age: 0, born: epoch }); },
    // only for costs the player pays: ≤ 1 per 600 ms, two cycles, scaled to the stage (5 px at 390 px); none in Calm
    shake(px, ms) {
      if (this.calm) return false; const t = fxNow(); if (t - lastShake < 600) return false;
      ev('shake'); lastShake = t; const k = typeof Stage !== 'undefined' && Stage.u ? Math.max(1, Math.min(2, Stage.u / 390)) : 1;
      shake = { px: (px == null ? 5 : px) * k, ms: ms || 180, age: 0 }; return true;
    },
    hitstop(ms) { ev('hitstop'); hs = Math.max(hs, ms == null ? 50 : ms); },
    // whole-stage flash (≤ 2 bright flashes a second, WCAG 2.3.1; none in Calm) or o.edge: corners darken (luminance only)
    flash(o) {
      o = o || {}; const t = fxNow();
      if (!o.edge) { if (this.calm) return false; let k = 0; for (const f of flashes) if (!f.edge && t - f.t < 1000) k++; if (k >= 2) return false; }
      ev('flash'); flashes.push({ ink: o.ink || (o.edge ? '#000000' : '#FFFFFF'), alpha: o.alpha == null ? (o.edge ? 0.2 : 0.25) : o.alpha, ms: o.ms || 250, edge: !!o.edge, age: 0, t, born: epoch }); return true;
    },
    // juice tiers: T1 160, T2 600, T3 1200 ms; T3 at most once per 3 s; a repeat and Calm get the 300 ms version
    tier(t, fn) {
      const full = t === 3 ? 1200 : t === 2 ? 600 : 160, now = fxNow(); let ms = full;
      if (t === 3) { if (now - lastT3 < 3000) ms = 300; else lastT3 = now; }
      if (this.calm) ms = Math.min(ms, 300);
      ev('tier' + t); if (fn) fn(ms); return ms;
    },

    update(dt) {
      const d = hs > 0 ? 0 : Math.max(0, dt) * 1000;
      for (let i = parts.length - 1; i >= 0; i--) if ((parts[i].age += d) >= parts[i].life) parts.splice(i, 1);
      for (let i = rings.length - 1; i >= 0; i--) if ((rings[i].age += d) >= rings[i].ms) rings.splice(i, 1);
      for (let i = pops.length - 1; i >= 0; i--) if ((pops[i].age += d) >= 700) pops.splice(i, 1);
      for (let i = flashes.length - 1; i >= 0; i--) if ((flashes[i].age += d) >= flashes[i].ms) flashes.splice(i, 1);
      if (shake && (shake.age += d) >= shake.ms) shake = null;
      for (let i = 0; i < afters.length; i++) { const a = afters[i]; if (a.dead) { afters.splice(i--, 1); continue; } if ((a.left -= d) <= 0) { afters.splice(i--, 1); a.dead = true; try { a.fn(); } catch (e) { this._err(e); } } }
      this._tweens(d);
    },
    _tweens(d) {
      for (let i = 0; i < tws.length; i++) {
        const t = tws[i]; if (t.dead) { tws.splice(i--, 1); continue; }
        t.age += d; const p = Math.min(1, t.age / t.ms), e = p >= 1 ? 1 : t.ease(p);
        for (let k = 0; k < t.keys.length; k++) t.obj[t.keys[k]] = p >= 1 ? t.to[k] : t.from[k] + (t.to[k] - t.from[k]) * e;
        if (p >= 1) { t.dead = true; tws.splice(i--, 1); if (t.done) try { t.done(t.obj); } catch (e2) { this._err(e2); } }
      }
    },
    // tweens keep running while the stage is paused or a card is open (count-ups on cards): a small pump takes over from the frame hook
    _kick() {
      if (pumping) return; pumping = true; let last = fxNow();
      const step = () => {
        if (!tws.length) { pumping = false; return; }
        const n = fxNow(); if (n - lastFrame > 60) this._tweens(Math.min(50, n - last)); last = n;
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(step); else setTimeout(step, 16);
      };
      if (typeof requestAnimationFrame === 'function') requestAnimationFrame(step); else setTimeout(step, 16);
    },
    pre(c) {
      if (typeof Lbl !== 'undefined') Lbl.list.length = 0;
      if (!fxV2() || !shake) return;
      const p = shake.age / shake.ms, a = shake.px * (1 - p);
      c.translate(a * tri(2 * p), 0.4 * a * tri(2 * p + 0.25));
    },
    draw(c) {
      if (!parts.length && !rings.length && !pops.length && !flashes.length) return;
      c.save();
      const P = fxPal('paper', '#E8DFC9'), I = fxPal('ink', '#1B1612');
      for (const r of rings) {
        const p = r.age / r.ms, rr = r.dashed || this.calm ? r.r : r.r * (0.6 + 0.4 * out3(p)), al = r.dashed ? (p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4) : 1 - p;
        c.globalAlpha = Math.max(0, al); c.setLineDash(r.dashed ? [5, 4] : []);
        c.beginPath(); c.arc(r.x, r.y, rr, 0, TAU);
        if (r.ink) { c.lineWidth = r.lw; c.strokeStyle = r.ink; c.stroke(); } else { c.lineWidth = r.lw + 2; c.strokeStyle = I; c.stroke(); c.lineWidth = r.lw; c.strokeStyle = P; c.stroke(); }
      }
      c.setLineDash([]);
      for (const q of parts) this._part(c, q, P, I);
      for (const f of flashes) {
        const p = f.age / f.ms, al = f.alpha * (this.calm ? 1 : 1 - p), w = Stage.w, h = Stage.h; c.globalAlpha = Math.max(0, al);
        if (f.edge) { const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, f.ink); c.fillStyle = g; } else c.fillStyle = f.ink;
        c.fillRect(-20, -20, w + 40, h + 40);
      }
      for (const p of pops) {
        const k = p.age / 700, rise = this.calm ? 0 : 24 * out3(Math.min(1, k)), al = p.age < 400 ? 1 : 1 - (p.age - 400) / 300;
        const px = Math.max(16, p.size) * (typeof Stage !== 'undefined' && Stage.layout === 'projector' ? 1.4 : 1), y = p.y - rise;
        c.globalAlpha = Math.max(0, al); c.font = '700 ' + Math.round(px) + 'px ' + fxFam.m;
        const tw = c.measureText(p.text).width, ic = p.sign ? px * 0.7 : 0, w = tw + ic + px * 0.7, h = px * 1.4, x0 = p.x - w / 2;
        c.fillStyle = P; rrect(c, x0, y - h / 2, w, h, h / 2); c.fill(); c.lineWidth = 1; c.strokeStyle = I; c.stroke();
        if (p.sign) { const tx = x0 + px * 0.35 + ic / 2 - 1, s = px * 0.3; c.fillStyle = I; c.beginPath(); if (p.sign > 0) { c.moveTo(tx - s, y + s * 0.7); c.lineTo(tx + s, y + s * 0.7); c.lineTo(tx, y - s * 0.9); } else { c.moveTo(tx - s, y - s * 0.7); c.lineTo(tx + s, y - s * 0.7); c.lineTo(tx, y + s * 0.9); } c.closePath(); c.fill(); }
        fxText(c, p.text, x0 + px * 0.35 + ic + tw / 2, y + 1, px, I, 'center', fxFam.m, 700);
      }
      c.restore();
    },
    _part(c, q, P, I) {
      const p = q.age / q.life, s = q.s;
      if (q.calm) {   // static stamp
        const x = q.x + q.ux * 12 * s, y = q.y + q.uy * 12 * s; c.globalAlpha = Math.min(1, q.age / 150);
        this._shape(c, q, x, y, 0, P, I); return;
      }
      let x = q.x, y = q.y, rot = 0, al = 1;
      if (q.k === 'dust') { const d = 16 * q.sp * s * out3(p); x += q.ux * d; y += q.uy * d - 6 * p; al = 0.75 * (1 - p); }
      else if (q.k === 'scale') { const d = 24 * s * out3(Math.min(1, q.age / 300)), sink = q.age > 300 ? 40 * EASE.inout(Math.min(1, (q.age - 300) / 1000)) : 0; x += q.ux * d; y += q.uy * d + sink; rot = q.vr * q.age / 1000; al = q.age > q.life - 200 ? (q.life - q.age) / 200 : 1; }
      else if (q.k === 'spark') { al = 1 - p; }
      else if (q.k === 'droplet') { const t = q.age / 1000; x += q.ux * 40 * q.sp * s * t; y += (-70 * q.sp + 250 * t) * t * s; al = p > 0.7 ? (1 - p) / 0.3 : 1; }
      else if (q.k === 'egg') { x += q.ux * 10 * s * out3(Math.min(1, p * 2)); y += (-48 * p * (1 - p) + 14 * p) * s; al = p > 0.85 ? (1 - p) / 0.15 : 1; }
      c.globalAlpha = Math.max(0, al); this._shape(c, q, x, y, rot, P, I, p);
    },
    // flakes, droplets and eggs draw from small sprites baked once per kind, ink and (flakes) one of 16 turns; a path fill and
    // stroke per particle was twice as slow on a 4×-throttled software canvas. Dust and sparks stay paths (cheaper unscaled).
    _sprite(k, ink, I, step) {
      const key = k + (step || 0) + ink + I; let s = SPRITES.get(key); if (s) return s;
      const W = k === 'scale' ? 12 : 9, H = k === 'scale' ? 12 : k === 'egg' ? 10 : 9, cv = mkCanvas(W * 2, H * 2), c = cv.getContext('2d');
      c.scale(2, 2); c.fillStyle = ink; c.strokeStyle = I; c.lineWidth = 1; c.beginPath();
      if (k === 'scale') { c.translate(6, 6); c.rotate(step * TAU / 32); c.ellipse(0, 0, 5, 2.6, 0, 0, TAU); }
      else if (k === 'egg') c.ellipse(4.5, 5, 3, 4, 0, 0, TAU);
      else c.arc(4.5, 4.5, 3, 0, TAU);
      c.fill(); c.stroke();
      s = { cv, w: W, h: H }; SPRITES.set(key, s); return s;
    },
    _shape(c, q, x, y, rot, P, I, p) {
      const k = q.k;
      if (k === 'spark') { const d0 = q.calm ? 4 : 6 + 16 * out3(p || 0), d1 = d0 + 7; c.strokeStyle = q.ink || fxPal('mut', '#5AE2B5'); c.lineWidth = 2; c.beginPath(); c.moveTo(q.x + q.ux * d0, q.y + q.uy * d0); c.lineTo(q.x + q.ux * d1, q.y + q.uy * d1); c.stroke(); return; }
      if (k === 'dust') { const r = 3 + 6 * (p == null ? 0.5 : p); c.fillStyle = q.ink || DEFINK.dust; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); return; }
      const step = k === 'scale' ? ((Math.round(rot * 16 / TAU * 2) % 16) + 16) % 16 : 0;   // a flake is symmetric under a half turn
      const s = this._sprite(k, q.ink || DEFINK[k], I, step); c.drawImage(s.cv, x - s.w / 2, y - s.h / 2, s.w, s.h);
    },
    // fn after ms of live stage time (the frame clock: paused with the stage, frozen by hit-stop, dropped by clear); → {cancel()}
    // For telegraph-then-act juice (Batch 1 request): Fx.after(90, () => Fx.burst('dust', x, y)). View only: never touch the sim here.
    after(ms, fn) { const a = { left: Math.max(0, +ms || 0), fn, dead: false, born: epoch }; if (typeof fn === 'function') afters.push(a); return { cancel() { a.dead = true; }, get done() { return a.dead; } }; },
    // everything (the default) or, with false, only what was made before the current epoch (a new level keeps what its start() made)
    clear(all) {
      all = all !== false;
      const keep = a => { for (let i = a.length - 1; i >= 0; i--) if (all || a[i].born < epoch) a.splice(i, 1); };
      keep(parts); keep(rings); keep(pops); keep(flashes); keep(afters);
      for (const t of tws) if (all || t.born < epoch) t.dead = true;
      shake = null; hs = 0;
    },
    // governor: update + draw over 20 ms for 30 frames in a row → halve particles → no squash → Calm (this session only)
    govern(ms) {
      if (ms > 20) { if (++slow >= 30) { slow = 0; if (gov < 3) gov++; if (gov >= 3) govCalm = true; } } else slow = 0;
      return gov;
    },
    _err(e) { this.errors.push(String(e && e.stack || e)); if (errs++ < 3 && typeof showErr === 'function') showErr(e); },
    // hook bodies (registered below)
    _dt(d) { if (!fxV2()) return d; t0 = fxNow(); if (hs > 0) { hs -= d * 1000; return 0; } return d; },
    _frame(dt, c) {
      lastFrame = fxNow(); epoch++;
      if (!fxV2()) { if (tws.length) this._tweens(Math.max(0, dt) * 1000); return; }
      try {
        this.update(dt); this.draw(c);
        if (typeof Ghost !== 'undefined') { c.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0); Ghost._draw(c, dt); }   // the hand never shakes
        if (typeof Snd2 !== 'undefined') Snd2._check();
        if (dt > 0 && t0) { this.govern(fxNow() - t0); t0 = 0; }
      } catch (e) { this._err(e); }
    },
    _play(ch) { rnd = rng(((typeof App !== 'undefined' && App.seed) || 1859) ^ 0x2F6B); fxFam.reset(); this.clear(false); },
    _exit() { this.clear(true); },
    _input(kind) { this.lastInput = kind; epoch++; },
    lastInput: 'pointer',
    get lastVis() { return lastVis; }
  };
  return F;
})();

/* ---------- Layer: a DPR-aware cached canvas (≤ 2,000 dots), redrawn only when its members change (D4 §1.4) ---------- */
function Layer(w, h) {
  const L = {
    cv: null, c: null, w: 0, h: 0, d: 1,
    resize(w2, h2) {
      const d = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1); w2 = Math.max(1, Math.ceil(w2 || 1)); h2 = Math.max(1, Math.ceil(h2 || 1));
      if (this.cv && w2 === this.w && h2 === this.h && d === this.d) return this;
      this.w = w2; this.h = h2; this.d = d;
      if (!this.cv) this.cv = mkCanvas(1, 1);
      this.cv.width = Math.round(w2 * d); this.cv.height = Math.round(h2 * d); this.c = this.cv.getContext('2d'); return this;
    },
    redraw(fn) { const c = this.c; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.cv.width, this.cv.height); c.setTransform(this.d, 0, 0, this.d, 0, 0); fn(c, this.w, this.h); return this; },
    blit(c, x, y) { c.drawImage(this.cv, x || 0, y || 0, this.w, this.h); return this; },
    // one path per fill: pts [[x, y] | {x, y, fill}], o {r, fill, stroke, lw}
    dots(pts, o) {
      o = o || {}; if (pts.length > 2000 && Layer.warnings.length < 20) Layer.warnings.push('layer: ' + pts.length + ' dots (budget 2,000)');
      return this.redraw(c => {
        const by = new Map(), r = o.r || 2;
        for (const p of pts) { const f = (p && p.fill) || o.fill || '#E8DFC9', a = by.get(f) || []; a.push(p); by.set(f, a); }
        for (const [f, a] of by) {
          c.beginPath(); for (const p of a) { const x = p.x != null ? p.x : p[0], y = p.y != null ? p.y : p[1]; c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
          c.fillStyle = f; c.fill(); if (o.stroke) { c.lineWidth = o.lw || 1; c.strokeStyle = o.stroke; c.stroke(); }
        }
      });
    }
  };
  return L.resize(w, h);
}
Layer.warnings = [];

/* ---------- Txt: placeholders and word counts (D4 §3; a {placeholder} counts as one word) ---------- */
const Txt = {
  warnings: [],
  f(str, vars) {
    return String(str == null ? '' : str).replace(/\{(\w+)\}/g, (m, k) => {
      const v = vars ? vars[k] : undefined;
      if (v == null || (typeof v === 'number' && !isFinite(v))) { if (this.warnings.length < 50) this.warnings.push('Txt.f: no value for {' + k + '}'); return m; }
      return typeof v === 'number' ? (Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100)) : String(v);
    });
  },
  words(str) { return String(str == null ? '' : str).replace(/<[^>]*>/g, ' ').replace(/\{\w+\}/g, 'X').split(/\s+/).filter(w => /[0-9A-Za-z\u00C0-\u024F\u0370-\u03FF]/.test(w)).length; },
  strip(str) { return String(str == null ? '' : str).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim(); }
};

/* ---------- Lbl: every canvas word (≥ 12 px, ≤ 3 words, paper pill). FCR-8b will route the same calls to DOM spans ---------- */
const Lbl = {
  warnings: [], list: [], _seen: {}, _w: new Map(),
  // o: {size = 14, align = 'center', base = 'middle', pill = true, c = Stage.ctx, ink, bg, mono, weight} → box {x, y, w, h}
  put(id, text, x, y, o) {
    o = o || {}; const c = o.c || (typeof Stage !== 'undefined' ? Stage.ctx : null); if (!c) return null;
    text = String(text == null ? '' : text); let size = o.size || 14;
    if (size < 12) { this._warn(id, text, 'size ' + size + ' px (min 12)'); size = 12; }
    if (Txt.words(text) > 3) this._warn(id, text, 'over 3 words');
    if ((typeof Stage !== 'undefined' && Stage.layout === 'projector') || (typeof Pal !== 'undefined' && Pal.theme === 'projector')) size = Math.round(Math.max(size * 1.4, size + 8));
    const fam = o.mono ? fxFam.m : fxFam.b, wt = o.weight || 600, key = wt + size + fam + '|' + text;
    c.save(); c.font = wt + ' ' + size + 'px ' + fam;
    let tw = this._w.get(key); if (tw == null) { tw = c.measureText(text).width; if (this._w.size > 500) this._w.clear(); this._w.set(key, tw); }
    const pill = o.pill !== false, padX = pill ? size * 0.5 : 0, bw = tw + 2 * padX, bh = pill ? Math.round(size * 1.45) : size * 1.2;
    const align = o.align || 'center', base = o.base || 'middle';
    const bx = align === 'left' ? x : align === 'right' ? x - bw : x - bw / 2, by = base === 'top' ? y : base === 'bottom' || base === 'alphabetic' ? y - bh : y - bh / 2;
    if (pill) { c.fillStyle = o.bg || fxPal('paper', '#E8DFC9'); rrect(c, bx, by, bw, bh, bh / 2); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.35)'; c.stroke(); }
    fxText(c, text, bx + bw / 2, by + bh / 2 + 0.5, size, o.ink || (pill ? fxPal('ink', '#1B1612') : fxPal('text', '#E8DFC9')), 'center', fam, wt);
    c.restore();
    const box = { x: bx, y: by, w: bw, h: bh }; this.list.push({ id, text, x, y, size, box }); return box;
  },
  _warn(id, text, why) {
    const k = id + '|' + text + '|' + why; if (this._seen[k] || this.warnings.length >= 100) return; this._seen[k] = 1;
    this.warnings.push({ id, text, why }); if (typeof Url !== 'undefined' && Url.dev && typeof console !== 'undefined') console.warn('Lbl.put ' + id + ': ' + why + ' — ' + text);
  }
};

/* ---------- Live: the polite live region, at most one line per 3 s; a newer pending line replaces the older (FCR-8a) ---------- */
const Live = {
  log: [], gap: 3000, _last: -1e9, _pend: null, _tm: 0,
  say(text) {
    text = Txt.strip(text); if (!text) return; const t = fxNow();
    if (!this._pend && t - this._last >= this.gap) { this._write(text); return; }
    this._pend = text; if (!this._tm) this._tm = setTimeout(() => { this._tm = 0; const s = this._pend; this._pend = null; if (s) this._write(s); }, Math.max(0, this._last + this.gap - t));
  },
  _el() {
    if (typeof document === 'undefined') return null; let el = document.getElementById('live');
    if (!el && document.body) { el = document.createElement('div'); el.id = 'live'; el.className = 'sr-only'; el.setAttribute('aria-live', 'polite'); el.setAttribute('aria-atomic', 'true'); document.body.appendChild(el); }
    return el;
  },
  _write(text) {
    const el = this._el(); this._last = fxNow();
    if (el) el.textContent = el.textContent === text ? text + '\u00A0' : text;   // a repeated line is still announced
    this.log.push({ t: Math.round(this._last), text }); if (this.log.length > 200) this.log.shift();
  },
  clear() { if (this._tm) clearTimeout(this._tm); this._tm = 0; this._pend = null; }
};

/* ---------- Whisper: one slot, ≤ 8 words, 2.4 s, inside the canvas, hidden under end and level cards (FCR-4) ----------
   While a v2 chapter plays, a new whisper replaces the old one. Elsewhere (menu, legacy chapters) the same single slot sits
   where the old toasts did, above cards, queues up to three lines so no legacy teaching text is lost, and gives each line at
   least the old toast's 3.2 s (longer lines get reading time: 1.2 s + 0.32 s a word, at most 8 s). */
const Whisper = {
  warnings: [], log: [], ms: 2400, cur: null, q: [], _tm: 0,
  say(text, key) { this._show(String(text == null ? '' : text), key == null ? null : key, false); },
  _toast(msg) { this._show(String(msg == null ? '' : msg), null, true); },
  _ctx() { return typeof App !== 'undefined' && App.scr === 'play' && fxV2(); },
  _show(s, key, html) {
    const v2 = this._ctx(), words = Txt.words(s);
    if (!Txt.strip(s)) return;
    if (v2 && words > 8 && this.warnings.length < 100 && this.warnings.indexOf(s) < 0) this.warnings.push(s);
    const item = { s, key, html, v2, born: Fx.epoch, ms: v2 ? this.ms : Math.max(3200, Math.min(8000, 1200 + 320 * words)) };
    const cur = this.cur, live = cur && cur.el && (cur.v2 ? cur.el.isConnected : cur.el.isConnected && !cur.out);
    if (live && key != null && cur.key === key && cur.v2 === v2) { this._fill(cur.el, item); cur.s = s; this._arm(cur, item.ms); Live.say(s); return; }   // same key: refresh in place
    if (live && !v2 && !cur.v2) { this.q.push(item); if (this.q.length > 3) this.q.shift(); return; }
    this._put(item);
  },
  _fill(el, item) { if (item.html) el.innerHTML = item.s; else el.textContent = item.s; },
  _put(item) {
    this._drop();
    let el = null;
    if (typeof document !== 'undefined') {
      if (item.v2) el = document.getElementById('whisper');
      if (!el) { const box = document.getElementById('toasts'); if (box) { el = document.createElement('div'); el.className = 'toast'; box.appendChild(el); item.v2 = false; } }
    }
    item.el = el; this.cur = item; if (el) { this._fill(el, item); if (item.v2) this._place(el); }
    this._arm(item, item.ms); Live.say(item.s);
    this.log.push({ t: Math.round(fxNow()), text: Txt.strip(item.s), v2: item.v2 }); if (this.log.length > 100) this.log.shift();
  },
  _arm(item, ms) { if (this._tm) clearTimeout(this._tm); this._tm = setTimeout(() => this._end(item), ms); },
  // v2: sit 8 px under the HUD as it is now (it wraps to two or three lines on a phone), not at a fixed 64 px; a chapter with
  // whisperAt: 'centre' gets a top-centre slot (Lichen's chick row sits top-left)
  _place(el) {
    try { const hud = document.getElementById('hud'), h = hud && hud.offsetHeight > 0 ? hud.offsetHeight : 56; el.style.top = Math.round(h + 8) + 'px'; el.classList.toggle('ctr', !!(App.ch && App.ch.whisperAt === 'centre')); } catch (e) { }
  },
  drop() { this._drop(); },   // hide the current line now (a queued legacy toast still follows); clear(true) empties the queue too
  _end(item) {
    if (this.cur !== item) return; this._tm = 0;
    const el = item.el;
    if (el && item.v2) el.textContent = '';
    else if (el) { item.out = true; el.classList.add('out'); setTimeout(() => el.remove(), 500); }
    this.cur = null; const nx = this.q.shift(); if (nx) this._put(nx);
  },
  _drop() {
    if (this._tm) clearTimeout(this._tm); this._tm = 0; const c = this.cur; this.cur = null; if (!c || !c.el) return;
    if (c.v2) c.el.textContent = ''; else c.el.remove();
  },
  // a new level drops what came before it (kept: lines its start() just wrote); all = true empties everything
  clear(all) {
    const e = Fx.epoch; this.q = all ? [] : this.q.filter(x => x.born >= e);
    if (this.cur && (all || this.cur.born < e)) { this._drop(); const nx = this.q.shift(); if (nx) this._put(nx); }
  }
};

/* ---------- Ghost: the ghost-hand demonstration (FCR-9; D4 §7) ----------
   3 s loop that replays every 4 s until the first pointer or key input or until(); once per verb per profile
   (Save.d.ui.verbs), again on '?'; off in teacher mode. Calm: a static arrow and ring. A keyboard user sees a key cap. */
const Ghost = (() => {
  const BITS = { tap: 1, drag: 2, hold: 4, draw: 8, slide: 16, toggle: 32, sweep: 64, pour: 128 };
  const SAY = { tap: 'Demo: tap the ringed spot.', drag: 'Demo: drag from the ring.', hold: 'Demo: press and hold the ring.', draw: 'Demo: draw from the ring.', slide: 'Demo: slide along the track.', toggle: 'Demo: tap to switch.', sweep: 'Demo: sweep across.', pour: 'Demo: hold to pour.' };
  const DRAG = { drag: 1, slide: 1, draw: 1, sweep: 1 }, HOLD = { hold: 1, pour: 1 };
  let cur = null, last = null, replay = false, hand = null, dom = null;
  // o.el (an element, or () → element): the ghost rings that control in the DOM (a dock button) instead of a canvas point
  const domEl = () => {
    if (dom || typeof document === 'undefined' || !document.createElement || !document.body) return dom;
    dom = document.createElement('div'); dom.id = 'ghost-dom'; dom.setAttribute('aria-hidden', 'true');
    const ring = document.createElement('i'); ring.className = 'gd-ring'; dom.appendChild(ring);
    const im = document.createElement('img'); im.alt = ''; try { hand = hand || bake(); im.src = hand.toDataURL(); } catch (e) { } dom.appendChild(im);
    document.body.appendChild(dom); return dom;
  };
  const domHide = () => { if (dom && dom.style) dom.style.display = 'none'; };
  const domShow = o => {   // → true when shown
    const el = typeof o.el === 'function' ? o.el() : o.el, r = el && el.getBoundingClientRect ? el.getBoundingClientRect() : null, d = domEl();
    if (!d || !r || !(r.width > 0)) { domHide(); return false; }
    d.style.display = 'block'; d.style.left = Math.round(r.left + r.width / 2) + 'px'; d.style.top = Math.round(r.top + r.height / 2) + 'px'; return true;
  };
  const inert = { hide() { }, active: false, shown: false };
  const out3 = Fx.EASE.out, inout = Fx.EASE.inout, hump = p => 4 * p * (1 - p);
  const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  const bez = (a, c, b, k) => { const u = 1 - k; return [u * u * a[0] + 2 * u * k * c[0] + k * k * b[0], u * u * a[1] + 2 * u * k * c[1] + k * k * b[1]]; };
  function bake() {   // a pointing hand, 60 × 72 CSS px, fingertip hotspot at (14, 1); paper fill, ink outline, drawn once at DPR 2
    const cv = mkCanvas(120, 144), c = cv.getContext('2d'), P = '#F4EEDD', I = '#1B1612';
    c.scale(2, 2); c.lineWidth = 2; c.strokeStyle = I; c.fillStyle = P; c.lineJoin = 'round';
    const piece = f => { c.beginPath(); f(); c.fill(); c.stroke(); };
    piece(() => rrect(c, 6, 26, 42, 42, 13));
    piece(() => c.ellipse(7, 46, 7, 12, -0.45, 0, TAU));
    piece(() => rrect(c, 39, 30, 10, 16, 5)); piece(() => rrect(c, 30, 25, 10, 18, 5)); piece(() => rrect(c, 20, 22, 11, 20, 5));
    piece(() => rrect(c, 8, 1, 12, 36, 6));
    return cv;
  }
  const G = {
    BITS,
    get active() { return !!cur; },
    get last() { return last; },
    show(o) {
      o = Object.assign({ verb: 'tap' }, o);
      if ((typeof Url !== 'undefined' && Url.v1) || (typeof Teacher !== 'undefined' && Teacher.on)) return inert;
      const bit = BITS[o.verb] || 1, ui = Save.d && Save.d.ui;
      last = o; if (ui && (ui.verbs & bit) && !o.force) return inert;
      if (ui) { ui.verbs |= bit; Save.save(); }
      const me = { o, t: -400, born: Fx.epoch, at: fxNow() }; cur = me;
      Live.say(o.say || SAY[o.verb] || SAY.tap);
      if (typeof Events !== 'undefined' && Events.debug) Events.emit('fx', { k: 'ghost' });
      return { hide() { if (cur === me) { cur = null; domHide(); } }, get active() { return cur === me; }, shown: true };
    },
    hide() { cur = null; domHide(); },
    _clear(all) { if (cur && (all || cur.born < Fx.epoch)) { cur = null; domHide(); } if (all) replay = false; },
    _input(e) {
      if (e.type === 'keydown') { const k = e.key || ''; if (k === '?') { if (last) replay = true; return; } if (/^(Shift|Control|Alt|Meta|Tab|CapsLock)$/.test(k)) return; }
      if (cur && fxNow() - cur.at > 150) { cur = null; domHide(); }
    },
    _draw(c, dt) {
      if (!cur) { if (replay && last && !Cards.isOpen()) { replay = false; this.show(Object.assign({}, last, { force: true })); } if (!cur) { domHide(); return; } }
      const o = cur.o; if (o.until && o.until()) { cur = null; domHide(); return; }
      if (o.el) { cur.t += Math.max(0, dt) * 1000; domShow(o); if (!o.at) return; }
      cur.t += Math.max(0, dt) * 1000;
      const P = o.at ? o.at() : null; if (!P) return;
      const Q = o.to ? o.to() || [P[0] + 80, P[1]] : [P[0] + 80, P[1]];
      const I = '#1B1612', W = '#F4EEDD', t = cur.t, h = Stage.h;
      c.save();
      // pulsing ring on the target (1.2 s)
      const pr = Fx.calm ? 0 : (Math.max(0, t) % 1200) / 1200, rr = Fx.calm ? 22 : 16 + 12 * pr;
      c.globalAlpha = Fx.calm ? 0.9 : 0.9 * (1 - pr); c.beginPath(); c.arc(P[0], P[1], rr, 0, TAU); c.lineWidth = 4; c.strokeStyle = I; c.stroke(); c.lineWidth = 2; c.strokeStyle = W; c.stroke();
      if (Fx.calm) {   // a static arrow
        const drag = !!DRAG[o.verb], tail = drag ? P : [P[0] + 46, P[1] + 46], to = drag ? Q : P, dx = to[0] - tail[0], dy = to[1] - tail[1], L = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / L, uy = dy / L;
        const tip = drag ? to : [P[0] - ux * 14, P[1] - uy * 14];   // a tap arrow stops short of the ring
        c.globalAlpha = 0.95; c.lineCap = 'round';
        for (const [lw, col] of [[7, I], [3.5, W]]) { c.lineWidth = lw; c.strokeStyle = col; c.beginPath(); c.moveTo(tail[0], tail[1]); c.lineTo(tip[0], tip[1]); c.moveTo(tip[0], tip[1]); c.lineTo(tip[0] - ux * 12 - uy * 8, tip[1] - uy * 12 + ux * 8); c.moveTo(tip[0], tip[1]); c.lineTo(tip[0] - ux * 12 + uy * 8, tip[1] - uy * 12 - ux * 8); c.stroke(); }
        c.restore(); return;
      }
      if (t < 0) { c.restore(); return; }
      const tau = t % 4000; let pos = null, al = 0.6, sc = 1, ripple = null, trail = null, fill = null;
      const S = [P[0] + 60, h + 40], M = [P[0] + 46, P[1] + 64], C = [P[0] + 50, P[1] + 16];
      if (tau < 600) { pos = lerp2(S, M, out3(tau / 600)); al = 0.6 * Math.min(1, tau / 200); }
      else if (tau < 1000) pos = bez(M, C, P, inout((tau - 600) / 400));
      else if (tau < 1150) pos = P;
      else if (DRAG[o.verb]) {
        const mv = o.verb === 'sweep' ? 350 : 700, k = Math.min(1, Math.max(0, (tau - 1250) / mv)), e = inout(k), nx = -(Q[1] - P[1]), ny = Q[0] - P[0], nl = Math.sqrt(nx * nx + ny * ny) || 1;
        const at = (q) => { const b = lerp2(P, Q, q), w = o.verb === 'draw' ? 18 * hump(q) * (1 - 2 * q) : o.verb === 'sweep' ? -24 * hump(q) : 0; return [b[0] + nx / nl * w, b[1] + ny / nl * w]; };
        pos = tau < 1250 ? P : at(e); sc = tau < 1250 ? 1 - 0.15 * Math.min(1, (tau - 1150) / 100) : k < 1 ? 0.85 : 0.85 + 0.15 * Math.min(1, (tau - 1250 - mv) / 120);
        if (tau >= 1250) trail = [P, at, e];
        if (k >= 1) { const rp = (tau - 1250 - mv) / 200; if (rp < 1) ripple = [pos, rp]; const f = (tau - 1250 - mv - 200) / 1000; if (f > 0) al = 0.6 * Math.max(0, 1 - f); }
      } else if (HOLD[o.verb]) {
        pos = P; const k = (tau - 1150) / 900;
        if (k < 1) { sc = 0.85; fill = Math.max(0, k); } else { sc = 0.85 + 0.15 * Math.min(1, (k - 1) * 9); const f = (tau - 2050) / 950; al = 0.6 * Math.max(0, 1 - f); }
      } else {
        pos = P;
        if (tau < 1350) { const k = (tau - 1150) / 200; sc = 1 - 0.15 * hump(k); ripple = [P, k]; }
        else if (tau < 1600) { const k = (tau - 1350) / 250; if (o.pop) try { o.pop(c, k); } catch (e) { } else ripple = [P, 0.5 + k / 2]; }
        else { const f = (tau - 1600) / 1400; al = 0.6 * Math.max(0, 1 - f); pos = [P[0], P[1] + 10 * f]; }
      }
      if (tau >= 3000) al = 0;
      if (trail && al > 0) { c.globalAlpha = al; c.setLineDash([5, 5]); c.lineWidth = 3; c.strokeStyle = W; c.beginPath(); c.moveTo(P[0], P[1]); for (let i = 1; i <= 12; i++) { const q = trail[1](trail[2] * i / 12); c.lineTo(q[0], q[1]); } c.stroke(); c.setLineDash([]); }
      if (fill != null) { c.globalAlpha = 0.9; c.lineWidth = 4; c.strokeStyle = W; c.beginPath(); c.arc(P[0], P[1], 26, -TAU / 4, -TAU / 4 + TAU * fill); c.stroke(); if (o.verb === 'pour') { c.fillStyle = W; for (let i = 0; i < 4; i++) { const y = ((tau / 6 + i * 12) % 48); c.beginPath(); c.arc(P[0] + 2, P[1] + 30 + y, 2.5, 0, TAU); c.fill(); } } }
      if (ripple && ripple[1] >= 0 && ripple[1] <= 1) { c.globalAlpha = 1 - ripple[1]; c.lineWidth = 2; c.strokeStyle = W; c.beginPath(); c.arc(ripple[0][0], ripple[0][1], 6 + 22 * ripple[1], 0, TAU); c.stroke(); }
      if (pos && al > 0) {
        c.globalAlpha = al;
        if (Fx.lastInput === 'key' && o.key) {   // key cap for keyboard players
          const name = typeof keyName === 'function' ? keyName(o.key) : String(o.key), w = Math.max(44, 14 + name.length * 10), x = P[0] + 26, y = P[1] + 22, s = sc;
          c.fillStyle = W; c.strokeStyle = I; c.lineWidth = 2; rrect(c, x, y, w * s, 36 * s, 6); c.fill(); c.stroke();
          fxText(c, name, x + w * s / 2, y + 18 * s, 15, I, 'center', fxFam.m, 600);
        } else {
          hand = hand || bake(); const k = sc; c.drawImage(hand, pos[0] - 14 * k, pos[1] - 1 * k, 60 * k, 72 * k);
        }
      }
      c.restore();
    }
  };
  return G;
})();

/* ---------- Snd2: the new voices (D4 §5.2). Every sound has a visual twin: pass {x, y} and the twin is drawn here,
   or call any Fx effect within 250 ms, else Snd2.warnings records the sound. ≤ 3 voices; Snd.on; muted in projector mode ---------- */
const Snd2 = (() => {
  const CAP = { sieve: 'sieve', tick: 'tick', dusk: 'dusk', wing: 'wings', count: 'tick', interesting: 'chime', tock: 'tock', scale: 'scales', peep: 'peep', crack: 'crack', swish: 'swish', pour: 'pour' };
  let ends = [], pending = null, nbuf = null, nctx = null, noff = 0;
  const env = (g, t, a, d, v) => { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
  const osc = (c, t, type, f0, f1, d, v, a) => { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + d); env(g, t, a || 0.005, d, v); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + (a || 0.005) + d + 0.05); return g; };
  const noise = (c, t, d, v, type, f0, f1, q) => {
    if (!nbuf || nctx !== c) { nctx = c; nbuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = nbuf.getChannelData(0), r = rng(2024); for (let i = 0; i < a.length; i++) a[i] = r() * 2 - 1; }
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = nbuf; s.loop = true;
    f.type = type || 'bandpass'; f.frequency.setValueAtTime(f0, t); if (f1) f.frequency.linearRampToValueAtTime(f1, t + d); f.Q.value = q || 1;
    env(g, t, 0.004, d, v); s.connect(f); f.connect(g); g.connect(c.destination); noff = (noff + 0.137) % 0.8; s.start(t, noff); s.stop(t + d + 0.05); return g;
  };
  const DEF = {   // each returns its length in s
    sieve: (c, t) => { noise(c, t, 0.22, 0.08, 'bandpass', 800, 2400, 4); return 0.22; },
    tick: (c, t) => { osc(c, t, 'sine', 2400, 0, 0.04, 0.05); return 0.04; },
    dusk: (c, t) => { osc(c, t, 'sine', 110, 0, 1.05, 0.045, 0.15); osc(c, t, 'sine', 165, 0, 1.05, 0.03, 0.15); return 1.2; },
    wing: (c, t) => { const g = noise(c, t, 0.5, 0.06, 'bandpass', 1200, 0, 1), l = c.createOscillator(), lg = c.createGain(); l.frequency.value = 4; lg.gain.value = 0.03; l.connect(lg); lg.connect(g.gain); l.start(t); l.stop(t + 0.55); return 0.5; },
    count: (c, t, o) => { osc(c, t, 'sine', 880 * Det.pow(2, Math.max(0, Math.min(24, o.i | 0)) / 12), 0, 0.02, 0.05); return 0.02; },
    interesting: (c, t) => { osc(c, t, 'triangle', 392, 330, 0.4, 0.06); return 0.4; },
    tock: (c, t) => { osc(c, t, 'triangle', 600, 0, 0.06, 0.08, 0.002); noise(c, t, 0.02, 0.03, 'bandpass', 1800, 0, 2); return 0.06; },
    scale: (c, t) => { noise(c, t, 0.12, 0.07, 'bandpass', 5600, 0, 0.8); return 0.12; },
    peep: (c, t) => { osc(c, t, 'sine', 2600, 2000, 0.12, 0.04); osc(c, t + 0.18, 'sine', 2600, 2000, 0.12, 0.04); return 0.3; },
    crack: (c, t) => { noise(c, t, 0.025, 0.1, 'highpass', 2500, 0, 0.7); return 0.025; },
    swish: (c, t) => { noise(c, t, 0.25, 0.07, 'bandpass', 400, 1200, 2); return 0.25; },
    pour: (c, t, o) => { const left = o.left == null ? 1 : Math.max(0, Math.min(1, o.left)); osc(c, t, 'sine', 262 + 68 * left, 0, 0.12, 0.04); return 0.12; }
  };
  const TWIN = {   // visual twins (D4 §5.2: every sound is mirrored)
    sieve: o => Fx.ring(o.x, o.y, 18, { ink: fxPal('sel', '#F46034') }), tick: o => Fx.burst('spark', o.x, o.y, 4), dusk: () => Fx.flash({ edge: true, alpha: 0.25, ms: 1200 }),
    wing: o => Fx.burst('dust', o.x, o.y, 3), count: o => Fx.ring(o.x, o.y, 10, { ms: 200 }), interesting: o => Fx.ring(o.x, o.y, 30, { ms: 600 }), tock: o => Fx.ring(o.x, o.y, 14, { ms: 200 }),
    scale: o => Fx.burst('scale', o.x, o.y, 6), peep: o => Fx.ring(o.x, o.y, 8, { ms: 240 }), crack: o => Fx.ring(o.x, o.y, 10, { ms: 150 }), swish: o => Fx.burst('dust', o.x, o.y, 4), pour: o => Fx.burst('droplet', o.x, o.y, 2)
  };
  const S = {
    warnings: [], log: [], caps: CAP, names: Object.keys(DEF), voices: 3,
    get muted() { return !Snd.on || (typeof Url !== 'undefined' && Url.projector); },
    // name, o: {x, y (draws the twin), twin: false, i (count step), left (pour budget 0..1)} → true if it sounded
    play(name, o) {
      o = o || {};
      if (!DEF[name]) { if (this.warnings.length < 50) this.warnings.push('unknown sound: ' + name); return false; }
      if (o.x != null && o.y != null && o.twin !== false) {
        TWIN[name](o);
        try { if (Save.d && Save.d.ui && Save.d.ui.cc) Fx.pop(CAP[name], o.x, o.y - 28, 0); } catch (e) { }
      } else if (fxNow() - Fx.lastVis > 120) pending = { name, t: fxNow() };
      this.log.push(name); if (this.log.length > 100) this.log.shift();
      const c = Snd.ctx; if (this.muted || !c) return false;
      try {
        const t = c.currentTime; ends = ends.filter(e => e > t); if (ends.length >= this.voices) return false;
        ends.push(t + DEF[name](c, t, o)); return true;
      } catch (e) { return false; }
    },
    // haptics: opt-in (Save.d.ui.hap), off in Calm, never the only cue
    buzz(kind) {
      const P = { tick: 8, hit: 18, cost: [25, 60, 25], star: [10, 60, 20, 60, 30] }[kind];
      try { if (!P || !(Save.d && Save.d.ui && Save.d.ui.hap) || Fx.calm || typeof navigator === 'undefined' || !navigator.vibrate) return false; return !!navigator.vibrate(P); } catch (e) { return false; }
    },
    _seen() { pending = null; },
    _check() { if (pending && fxNow() - pending.t > 250) { if (this.warnings.length < 50) this.warnings.push('no visual twin: ' + pending.name); pending = null; } }
  };
  return S;
})();

/* ---------- wiring: hooks (ui.js), input listeners, the toast rebind ---------- */
Hooks.pre.push(c => Fx.pre(c));
Hooks.frame.push((dt, c) => Fx._frame(dt, c));
Hooks.dt.push(d => Fx._dt(d));
Hooks.play.push(ch => { Fx._play(ch); Ghost._clear(false); Whisper.clear(false); });
Hooks.exit.push(() => { Fx._exit(); Ghost._clear(true); Whisper.clear(true); Live.clear(); });
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('pointerdown', e => { Fx._input('pointer'); Ghost._input(e); }, true);
  window.addEventListener('keydown', e => { if (!/^(Shift|Control|Alt|Meta)$/.test(e.key || '')) Fx._input('key'); Ghost._input(e); }, true);
  window.addEventListener('click', () => Fx._input(Fx.lastInput), true);
}
if (!Url.v1) toast = msg => Whisper._toast(msg);   // FCR-4: one slot; legacy HTML allowed
Object.assign(EXPORT, { Fx, Layer, Ghost, Lbl, Live, Whisper, Txt, Snd2, Snd, toast: msg => toast(msg) });   // toast and Snd for tests (toast calls the current binding)
