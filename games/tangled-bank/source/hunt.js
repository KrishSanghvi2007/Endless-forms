/* ================= HUNT MODE: the player is the predator ================= */
// Moth and bark colours live in one space: t = tone (0 dark .. 1 pale), h = hue (0 warm brown .. 1 lichen grey-green).
function t2rgb(t, h) { return hsl2rgb(lerp(30, 84, h), lerp(0.36, 0.10, h), 0.07 + 0.80 * clamp(t, 0, 1)); }

function barkTex(w, h, d, sv, soot) {
  const W = Math.round(w * d), H = Math.round(h * d), cv = mkCanvas(W, H), c = cv.getContext('2d'), im = c.createImageData(W, H), D = im.data;
  const n1 = makeNoise(sv), n2 = makeNoise(sv + 11), n3 = makeNoise(sv + 23), n4 = makeNoise(sv + 37);
  let sT = 0, sH = 0;
  for (let y = 0; y < H; y++) {
    const Y = y / d;
    for (let x = 0; x < W; x++) {
      const X = x / d;
      const f = fbm(n1, X * 0.05, Y * 0.011, 3), ridge = 1 - Math.abs(f * 2 - 1), crack = smooth(0.80, 0.96, ridge);
      const l = fbm(n2, X * 0.05, Y * 0.05, 4), sp = n3(X * 0.55, Y * 0.55), bl = n4(X * 0.14, Y * 0.14);
      let t, hh;
      if (!soot) {
        const cov = smooth(0.30, 0.44, l + 0.12 * (bl - 0.5));
        const tb = 0.40 + 0.14 * (f - 0.5) + 0.08 * (sp - 0.5), hb = 0.48;
        const tl = 0.78 + 0.18 * (bl - 0.5) + 0.16 * (sp - 0.5) + 0.06 * (l - 0.5), hl = 0.93 + 0.12 * (bl - 0.5);
        t = lerp(tb, tl, cov) - 0.34 * crack * (1 - cov * 0.6); hh = lerp(hb, hl, cov);
      } else {
        t = 0.13 + 0.08 * (f - 0.5) + 0.07 * (sp - 0.5) + 0.05 * (bl - 0.5) - 0.08 * crack + 0.05 * smooth(0.7, 0.8, ridge) * (1 - crack);
        hh = 0.36 + 0.12 * (bl - 0.5);
      }
      t = clamp(t, 0, 1); hh = clamp(hh, 0, 1); sT += t; sH += hh;
      const rgb = t2rgb(t, hh), i = (y * W + x) * 4; D[i] = rgb[0]; D[i + 1] = rgb[1]; D[i + 2] = rgb[2]; D[i + 3] = 255;
    }
  }
  c.putImageData(im, 0, 0);
  return { cv, T: sT / (W * H), H: sH / (W * H) };
}

function mothSprite(ph, d, sv) {
  const r = rng(sv), W = 38, H = 30, cv = mkCanvas(W * d, H * d), c = cv.getContext('2d');
  c.scale(d, d); c.translate(W / 2, H / 2 + 2);
  const t = ph.tone, h = ph.hue, m = ph.mot, sc = 0.92 + r() * 0.16;
  c.scale(sc, sc);
  const wings = () => {
    c.beginPath();
    for (const s of [-1, 1]) { c.moveTo(0, -6); c.bezierCurveTo(s * 5, -9, s * 14, -6.5, s * 16.5, 4); c.bezierCurveTo(s * 12, 7.5, s * 6, 8.5, 0, 6.5); c.closePath(); }
  };
  wings(); c.fillStyle = css(t2rgb(t, h)); c.fill();
  c.save(); wings(); c.clip();
  const n = 16 + Math.round(46 * m);
  for (let i = 0; i < n; i++) {
    const x = (r() * 2 - 1) * 16.5, y = -9 + r() * 17, dt = (r() - 0.62) * 0.95 * m;
    c.fillStyle = css(t2rgb(clamp(t + dt, 0, 1), h)); c.beginPath(); c.ellipse(x, y, 0.5 + r() * 1.5 * (0.5 + m), 0.4 + r() * 0.9, r() * 3, 0, TAU); c.fill();
  }
  c.strokeStyle = css(t2rgb(clamp(t - 0.3 * m - 0.06, 0, 1), h), 0.55); c.lineWidth = 0.8;
  for (const yy of [-1.8, 3.2]) { c.beginPath(); for (let x = -17; x <= 17; x += 2) { const y = yy + Math.sin(x * 0.9 + r() * 0.8) * 1.1 + Math.abs(x) * 0.13; if (x === -17) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }
  c.restore();
  wings(); c.strokeStyle = css(t2rgb(t * 0.8, h), 0.18); c.lineWidth = 0.6; c.stroke();
  c.fillStyle = css(t2rgb(t * 0.72, h)); c.beginPath(); c.ellipse(0, 1, 1.7, 6.6, 0, 0, TAU); c.fill();
  c.strokeStyle = css(t2rgb(t * 0.6, h), 0.8); c.lineWidth = 0.6; c.beginPath(); c.moveTo(-0.6, -5.5); c.quadraticCurveTo(-3, -9, -5.5, -9.8); c.moveTo(0.6, -5.5); c.quadraticCurveTo(3, -9, 5.5, -9.8); c.stroke();
  cv.cw = W; cv.ch = H; return cv;
}

const LEAF = [226, 212, 158], INKBLK = [26, 22, 24], WARN = [206, 36, 44];
function flySprite(ph, d, sv) {
  const r = rng(sv), W = 42, H = 36, cv = mkCanvas(W * d, H * d), c = cv.getContext('2d');
  c.scale(d, d); c.translate(W / 2, H / 2);
  const ground = mix(LEAF, INKBLK, ph.dark), patch = mix(ground, WARN, ph.red), sc = 0.9 + r() * 0.18;
  c.scale(sc, sc);
  const wing = (s, fore) => {
    c.beginPath();
    if (fore) { c.moveTo(0, -2); c.bezierCurveTo(s * 5, -12, s * 15, -14, s * 17.5, -10.5); c.bezierCurveTo(s * 17, -3, s * 13, 1.5, 0, 2); }
    else { c.moveTo(0, 1); c.bezierCurveTo(s * 7, 1, s * 13.5, 4, s * 11.5, 10); c.bezierCurveTo(s * 8, 13.5, s * 3, 11, 0, 7); }
    c.closePath();
  };
  for (const s of [-1, 1]) for (const fore of [false, true]) {
    wing(s, fore); c.fillStyle = css(ground); c.fill();
    c.save(); wing(s, fore); c.clip();
    if (fore) { c.fillStyle = css(patch); c.beginPath(); c.ellipse(s * 9.5, -6, 6.8, 2.8, s * -0.45, 0, TAU); c.fill(); }
    else { c.fillStyle = css(patch, 0.9); for (const [x, y] of [[6, 6], [8.8, 8.4]]) { c.beginPath(); c.arc(s * x, y, 1.7, 0, TAU); c.fill(); } }
    c.strokeStyle = css(mix(ground, [0, 0, 0], 0.5), 0.35); c.lineWidth = 0.5;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(0, fore ? -1 : 2); c.lineTo(s * (fore ? 16 : 11), fore ? -11 + k * 3.5 : 4 + k * 2.6); c.stroke(); }
    c.restore();
  }
  c.fillStyle = css(mix(INKBLK, ground, 0.25)); c.beginPath(); c.ellipse(0, 2, 1.6, 7, 0, 0, TAU); c.fill();
  c.strokeStyle = css(INKBLK, 0.8); c.lineWidth = 0.6; c.beginPath(); c.moveTo(-0.5, -4.5); c.quadraticCurveTo(-2.5, -10, -4.5, -12); c.moveTo(0.5, -4.5); c.quadraticCurveTo(2.5, -10, 4.5, -12); c.stroke();
  cv.cw = W; cv.ch = H; return cv;
}

function leafTex(w, h, d, sv) {
  const r = rng(sv), cv = mkCanvas(w * d, h * d), c = cv.getContext('2d'); c.scale(d, d);
  c.fillStyle = '#2c4020'; c.fillRect(0, 0, w, h);
  const pal = [[63, 94, 39], [86, 119, 47], [111, 138, 56], [47, 74, 34], [122, 138, 62], [74, 103, 40], [98, 112, 50]], brown = [[122, 90, 46], [96, 70, 38], [140, 108, 58]];
  const n = Math.round(w * h / 230);
  const leaf = (L, Wd, ox, oy) => { c.beginPath(); c.moveTo(-L / 2 + ox, oy); c.quadraticCurveTo(ox, -Wd + oy, L / 2 + ox, oy); c.quadraticCurveTo(ox, Wd + oy, -L / 2 + ox, oy); c.closePath(); };
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, L = 16 + r() * 28, Wd = L * (0.26 + r() * 0.16), a = r() * TAU;
    const col = r() < 0.13 ? brown[(r() * brown.length) | 0] : pal[(r() * pal.length) | 0], sh = 0.78 + r() * 0.38;
    c.save(); c.translate(x, y); c.rotate(a);
    c.fillStyle = 'rgba(0,0,0,0.2)'; leaf(L, Wd, 1.5, 1.8); c.fill();
    c.fillStyle = css(col.map(v => v * sh)); leaf(L, Wd, 0, 0); c.fill();
    c.strokeStyle = css(col.map(v => v * sh * 0.72), 0.8); c.lineWidth = 0.7; c.beginPath(); c.moveTo(-L / 2, 0); c.lineTo(L / 2, 0); c.stroke();
    c.restore();
  }
  for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h, rr = 20 + r() * 50, g = c.createRadialGradient(x, y, 0, x, y, rr); g.addColorStop(0, 'rgba(240,235,170,0.10)'); g.addColorStop(1, 'rgba(240,235,170,0)'); c.fillStyle = g; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  return cv;
}

const Hunt = {
  sync: false,
  start(ch) {
    this.ch = ch; this.lay = Gen.layout(ch.traits.map(s => Object.assign({}, s)));
    this.gen = 1; this.hist = []; this.total = 0; this.bitterTotal = 0; this.quick = !!Save.d.quick;
    this.fx = []; this.shake = 0; this.tint = 0; this.state = 'idle'; this.items = []; this.lastRec = null;
    this.pop = []; for (let i = 0; i < ch.N; i++) this.pop.push(this.mk(Gen.genome(this.lay, ch.init)));
    this.phase = {}; if (ch.setup) ch.setup(this);
    this.bgKey = ''; this.spriteD = 0; this.panel(); this.morning();
  },
  mk(g) { return { g, ph: this.ch.phen(this.lay, g), sv: (R() * 4294967295) >>> 0, eaten: false }; },
  texD() { return Math.min(2, Stage.dpr); },
  ensureBg() {
    const k = Math.round(Stage.w) + 'x' + Math.round(Stage.h) + '@' + this.texD();
    if (k !== this.bgKey) { this.bgKey = k; this.bg = this.ch.makeBg(Stage.w, Stage.h, this.texD()); this.env = this.ch.env(this); this.obj = this.ch.objective(this); this.updPanel(); }
    if (this.spriteD !== this.texD()) { this.spriteD = this.texD(); for (const it of this.items) it.spr = null; }
    for (const it of this.items) if (!it.spr) it.spr = this.ch.sprite(it.ind.ph, this.spriteD, it.ind.sv);
  },
  onResize() { /* background regenerates lazily in draw */ },
  morning() {
    const ch = this.ch; this.env = ch.env(this); this.obj = ch.objective(this);
    const nm = ch.models || 0, pts = this.places(this.pop.length + nm); let i = 0;
    this.items = [];
    for (const ind of this.pop) { this.items.push({ ind, kind: 'prey', x: pts[i].x, y: pts[i].y, rot: ch.rot(), alive: true }); i++; }
    for (let m = 0; m < nm; m++) { this.items.push({ ind: { ph: ch.modelPh(), sv: (R() * 4294967295) >>> 0 }, kind: 'model', x: pts[i].x, y: pts[i].y, rot: ch.rot(), alive: true }); i++; }
    shuffle(this.items);
    this.eaten = 0; this.bitter = 0; this.time = ch.roundTime; this.state = 'dawn'; this.st = 0;
    this.dawnLine = ch.dawnLine ? ch.dawnLine(this) : '';
    this.updPanel(); if (!this.sync) Snd.dawn();
  },
  places(n) {
    const W = Math.max(200, Stage.w), H = Math.max(200, Stage.h), m = 20, pts = [], minD = Math.min(36, Math.sqrt(W * H / n) * 0.62);
    for (let k = 0; k < n; k++) {
      let best = null, bd = -1;
      for (let t = 0; t < 40; t++) {
        const p = { x: m + R() * (W - 2 * m), y: m + R() * (H - 2 * m) }; let dmin = 1e9;
        for (const q of pts) { const dx = q.x - p.x, dy = q.y - p.y, dd = dx * dx + dy * dy; if (dd < dmin) dmin = dd; }
        if (dmin > minD * minD) { best = p; break; } if (dmin > bd) { bd = dmin; best = p; }
      }
      pts.push(best);
    }
    return pts.map(p => ({ x: p.x / W, y: p.y / H }));
  },
  tap(px, py) {
    if (this.state === 'dawn') { this.st = 99; return; }
    if (this.state !== 'hunt') return;
    const W = Stage.w, H = Stage.h; let best = null, bd = 23 * 23;
    for (const it of this.items) { if (!it.alive) continue; const dx = it.x * W - px, dy = it.y * H - py, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = it; } }
    if (!best) { this.time -= this.ch.missCost; this.fx.push({ k: 'miss', x: px, y: py, t: 0, d: 0.5 }); this.fx.push({ k: 'txt', x: px, y: py - 14, t: 0, d: 0.8, s: '−½ s', c: '#e8dfc9' }); Snd.miss(); this.updPanel(); return; }
    best.alive = false; best.fade = 1;
    if (best.kind === 'model') {
      this.time -= this.ch.bitterCost; this.bitter++; this.bitterTotal++; this.tint = 1; this.shake = 0.7;
      this.fx.push({ k: 'txt', x: best.x * W, y: best.y * H - 16, t: 0, d: 1.3, s: 'Bitter! −3 s', c: '#e4ec7a' }); Snd.bitter();
    } else {
      this.eaten++; this.total++; best.ind.eaten = true;
      this.fx.push({ k: 'peck', x: best.x * W, y: best.y * H, t: 0, d: 0.45 }); if (!this.sync) Snd.peck();
    }
    this.updPanel();
    if (this.eaten >= this.ch.cap) this.endRound();
  },
  endRound() {
    if (this.state !== 'hunt') return;
    this.state = 'dusk'; const ch = this.ch, f = ch.focus;
    const all = this.pop, eaten = all.filter(x => x.eaten), surv = all.filter(x => !x.eaten);
    const vals = all.map(x => f.get(x.ph)), ev = eaten.map(x => f.get(x.ph)), sv = surv.map(x => f.get(x.ph));
    const rec = { gen: this.gen, obj: this.obj.value, eaten: eaten.length, bitter: this.bitter, mAll: mean(vals), mEat: ev.length ? mean(ev) : null, mSurv: mean(sv), S: mean(sv) - mean(vals), vals, ev, sv, env: Object.assign({}, this.env), R: null };
    if (ch.recExtra) ch.recExtra(this, rec, eaten, surv);
    this.hist.push(rec); this.lastRec = rec;
    if (this.sync) { this.nextGen(); return; }
    setTimeout(() => { if (App.mode !== this || this.state !== 'dusk') return; if (this.quick) this.nextGen(); else this.interlude(rec); }, 700);
  },
  interlude(rec) {
    const s = this.ch.summary(this, rec);
    Cards.open({
      cls: 'interlude',
      html: '<h3>' + s.title + '</h3>' + (s.leg || '') + '<canvas></canvas><p>' + s.text + '</p><label class="chk"><input type="checkbox" id="quickchk"> Skip these summaries</label>',
      buttons: [{ t: 'Let the survivors breed', primary: true, fn: () => { const q = $('quickchk'); if (q && q.checked) { this.quick = true; Save.d.quick = true; Save.save(); } Cards.close(); this.nextGen(); } }],
      onOpen: box => { const cv = box.querySelector('canvas'); if (s.bars) barChart(cv, s.bars); else histChart(cv, s.hist); }
    });
  },
  nextGen() {
    if (this.state !== 'dusk') return;
    const ch = this.ch, surv = this.pop.filter(x => !x.eaten), par = surv.length >= 2 ? surv : this.pop;
    const kids = [];
    for (let i = 0; i < ch.N; i++) { const a = pick(par); let b = pick(par), tr = 0; while (b === a && tr++ < 6) b = pick(par); kids.push(this.mk(Gen.mate(this.lay, a.g, b.g))); }
    const prev = this.lastRec; this.pop = kids; this.gen++;
    prev.mOff = mean(kids.map(x => ch.focus.get(x.ph))); prev.R = prev.mOff - prev.mAll;
    if (ch.onBred) ch.onBred(this);
    const o = ch.objective(this); this.obj = o;
    if (!this.sync && this.quick) { const q = ch.quickLine ? ch.quickLine(this, prev) : ''; if (q) toast(q); }
    if (o.done || this.gen > ch.maxGen) { this.finish(o); return; }
    this.morning();
  },
  finish(o) {
    this.state = 'done'; const ch = this.ch; this.hist.push({ gen: this.gen, obj: o.value, final: true });
    const stars = ch.stars(this, o); if (stars) Save.star(ch.id, stars); this.stars = stars;
    if (this.sync) return;
    if (stars) Snd.star(); else Snd.chime();
    const next = CHAPTERS[CHAPTERS.indexOf(ch) + 1];
    const btns = [{ t: 'Play again', fn: () => { Cards.close(); App.play(ch); } }, { t: 'Notebook', fn: () => App.exit() }];
    if (next) btns.push({ t: 'Next: ' + next.title, primary: true, fn: () => { Cards.close(); App.open(next); } });
    Cards.open({
      cls: 'end',
      html: '<h3>' + (o.done ? 'Chapter complete' : 'The season is over') + '</h3><div class="stars">' + starStr(stars) + '</div>' + (ch.endLeg || '') + '<canvas></canvas><p class="cap">' + ch.chartCap + '</p><h4>What happened</h4><p>' + ch.what(this) + '</p><h4>The real thing</h4><p class="basis">' + ch.intro.real + '</p>',
      buttons: btns,
      onOpen: box => ch.endChart(box.querySelector('canvas'), this)
    });
  },
  panel() {
    $('panel').innerHTML = '<div class="hp"><div class="timer"><i id="h-tbar"></i></div><div class="row"><span><b id="h-eaten">0</b> of ' + this.ch.cap + ' eaten</span><span id="h-time" class="mono">' + this.ch.roundTime.toFixed(1) + ' s</span></div>' +
      '<div class="obj-l"><span id="h-objl"></span><b id="h-objv"></b></div><div class="meter"><i id="h-objbar"></i><em id="h-objtick"></em></div><div class="obj-s" id="h-objs"></div></div>';
  },
  updPanel() {
    if (!$('h-eaten')) return;
    $('h-eaten').textContent = this.eaten || 0;
    const o = this.obj || { label: '', value: 0, goal: 1, text: '' };
    $('h-objl').textContent = o.label; $('h-objv').textContent = pct(o.value) + (o.below ? '  (goal under ' + pct(o.goal) + ')' : '  (goal ' + pct(o.goal) + ')');
    $('h-objbar').style.width = pct(clamp(o.value, 0, 1)); $('h-objtick').style.left = 'calc(' + pct(o.goal) + ' - 1px)';
    $('h-objbar').style.background = o.below ? 'var(--carmine)' : 'var(--teal)';
    $('h-objs').textContent = o.text; this.updTimer();
    $('bar-gen').textContent = 'gen ' + this.gen;
  },
  updTimer() { const b = $('h-tbar'); if (!b) return; const f = clamp(this.time / this.ch.roundTime, 0, 1); b.style.transform = 'scaleX(' + f + ')'; b.style.background = f < 0.25 ? 'var(--carmine)' : 'var(--ochre)'; $('h-time').textContent = Math.max(0, this.time).toFixed(1) + ' s'; },
  update(dt) {
    this.fx = this.fx.filter(f => (f.t += dt) < f.d);
    if (this.tint > 0) this.tint = Math.max(0, this.tint - dt * 1.3); if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.2);
    for (const it of this.items) if (it.fade != null && it.fade > 0) it.fade -= dt * 3;
    if (this.state === 'dawn') { this.st += dt; if (this.st > 1.6) { this.state = 'hunt'; } }
    else if (this.state === 'hunt') { this.time -= dt; if (this.time <= 0) { this.time = 0; this.updTimer(); this.endRound(); } else this.updTimer(); }
  },
  draw() {
    const c = Stage.ctx, W = Stage.w, H = Stage.h; this.ensureBg();
    c.save(); if (this.shake > 0) c.translate((R() - .5) * 9 * this.shake, (R() - .5) * 9 * this.shake);
    this.bg.draw(c, W, H, this.env);
    for (const it of this.items) {
      if (!it.alive && !(it.fade > 0)) continue; const s = it.spr; if (!s) continue;
      c.save(); c.translate(it.x * W, it.y * H); c.rotate(it.rot);
      if (!it.alive) { const f = Math.max(0, it.fade); c.globalAlpha = f; c.scale(1 + (1 - f) * 0.35, 1 + (1 - f) * 0.35); }
      c.drawImage(s, -s.cw / 2, -s.ch / 2, s.cw, s.ch); c.restore();
    }
    for (const f of this.fx) {
      const k = f.t / f.d;
      if (f.k === 'peck') {
        c.save(); c.translate(f.x, f.y); c.globalAlpha = 1 - k; const o = 9 * (1 - Math.min(1, k * 2.5));
        c.fillStyle = '#e3b64c'; c.strokeStyle = '#2a211b'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(-3, -14 - o); c.lineTo(3, -14 - o); c.lineTo(0, -2 - o * 0.3); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(-3, 14 + o); c.lineTo(3, 14 + o); c.lineTo(0, 2 + o * 0.3); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = 'rgba(232,223,201,0.9)'; for (let i = 0; i < 6; i++) { const a = i * 1.05 + 0.3, rr = 6 + k * 22; c.beginPath(); c.ellipse(Math.cos(a) * rr, Math.sin(a) * rr, 2.6, 1, a, 0, TAU); c.fill(); }
        c.restore();
      } else if (f.k === 'miss') {
        c.save(); c.globalAlpha = 1 - k; c.strokeStyle = '#e8dfc9'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(f.x - 5, f.y - 5); c.lineTo(f.x + 5, f.y + 5); c.moveTo(f.x + 5, f.y - 5); c.lineTo(f.x - 5, f.y + 5); c.stroke(); c.restore();
      } else if (f.k === 'txt') {
        c.save(); c.globalAlpha = 1 - k * k; c.font = '600 15px ' + getComputedStyle(document.body).getPropertyValue('--fd'); c.textAlign = 'center';
        c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillText(f.s, f.x + 1, f.y - k * 22 + 1); c.fillStyle = f.c; c.fillText(f.s, f.x, f.y - k * 22); c.restore();
      }
    }
    if (this.tint > 0) { c.fillStyle = 'rgba(150,170,20,' + (0.28 * this.tint) + ')'; c.fillRect(-12, -12, W + 24, H + 24); }
    c.restore();
    if (this.state === 'dawn') {
      const a = this.st < 1.1 ? 0.62 : 0.62 * Math.max(0, 1 - (this.st - 1.1) / 0.5);
      c.fillStyle = 'rgba(12,18,17,' + a + ')'; c.fillRect(0, 0, W, H);
      const ta = this.st < 1.1 ? Math.min(1, this.st * 3) : Math.max(0, 1 - (this.st - 1.1) / 0.5);
      c.globalAlpha = ta; c.fillStyle = '#e8dfc9'; c.textAlign = 'center';
      c.font = '600 30px ' + getComputedStyle(document.body).getPropertyValue('--fd'); c.fillText('Generation ' + this.gen, W / 2, H / 2 - 6);
      c.font = 'italic 15px ' + getComputedStyle(document.body).getPropertyValue('--fb'); c.fillStyle = 'rgba(232,223,201,.8)';
      const line = this.dawnLine || 'Dawn. Find them before the light goes flat.'; wrapText(c, line, W / 2, H / 2 + 22, Math.min(320, W - 40), 19);
      c.globalAlpha = 1;
    }
  }
};
function wrapText(c, s, x, y, mw, lh) { const words = s.split(' '); let line = '', yy = y; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > mw && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = t; } if (line) c.fillText(line, x, yy); }

function huntEndChart(cv, Hn, goal, below, col) {
  const d = Hn.hist.map(r => r.obj);
  lineChart(cv, { theme: 'paper', series: [{ d, c: col || '#2f7f7a', w: 2.5 }], y0: 0, y1: 1, refs: [{ v: goal, label: (below ? 'goal under ' : 'goal ') + pct(goal), c: '#a8263f' }], fy: v => pct(v), x0l: 'gen 1', xl: 'gen ' + (d.length) });
}

/* ---------- Chapter I: crypsis ---------- */
const CH_LICHEN = {
  id: 'lichen', mode: 'hunt', num: 'I', title: 'The Lichen Wood', concept: 'Camouflage',
  intro: {
    premise: 'Moths spend the day pressed flat against bark. The ones you can’t see live to breed, and their offspring inherit their looks — roughly.',
    part: 'You’re a bird with twelve seconds of morning. Tap moths to eat them, up to fifteen a morning. Tapping bare bark costs half a second.',
    goal: 'Camouflage reaches 75%: the average moth closely matching the lichen. Three stars by generation 10.',
    real: 'Bond and Kamil (2002) let blue jays hunt digital moths on a screen. The moths the jays missed were bred for the next screen, and the population evolved camouflage — and a spread of different looks, because jays hunt with a search image for whatever is common. Here, you were the jay.'
  },
  traits: [{ k: 'tone', n: 8, m0: 0.30, s0: 0.13, mu: 0.03, msd: 0.05, ve: 0.03 }, { k: 'hue', n: 6, m0: 0.22, s0: 0.13, mu: 0.03, msd: 0.05, ve: 0.03 }, { k: 'mot', n: 4, m0: 0.30, s0: 0.13, mu: 0.03, msd: 0.05, ve: 0.03 }],
  N: 30, cap: 15, roundTime: 12, missCost: 0.5, maxGen: 16, target: { T: 0.70, H: 0.85, M: 0.6 },
  phen(lay, g) { return { tone: Gen.ph(lay, g, 'tone'), hue: Gen.ph(lay, g, 'hue'), mot: Gen.ph(lay, g, 'mot') }; },
  rot() { return (R() - 0.5) * 0.8; },
  sprite(ph, d, sv) { return mothSprite(ph, d, sv); },
  makeBg(w, h, d) { const tx = barkTex(w, h, d, 4242, false); this.target.T = tx.T; this.target.H = tx.H; return { draw: (c, W, H) => c.drawImage(tx.cv, 0, 0, W, H) }; },
  env() { return { T: this.target.T, H: this.target.H }; },
  match(ph) { const T = this.target; const d2 = ((ph.tone - T.T) / 0.5) ** 2 + 0.7 * ((ph.hue - T.H) / 0.7) ** 2 + 0.35 * ((ph.mot - T.M) / 0.7) ** 2; return Math.exp(-1.2 * d2); },
  focus: { get: ph => ph.tone },
  objective(Hn) { const v = mean(Hn.pop.map(x => this.match(x.ph))); return { label: 'Camouflage', value: v, goal: 0.75, done: v >= 0.75, text: 'Moths breed from whoever you miss. Stars at generations 10, 13 and 16.' }; },
  stars(Hn, o) { return !o.done ? 0 : Hn.gen <= 10 ? 3 : Hn.gen <= 13 ? 2 : 1; },
  dawnLine(Hn) { const r = Hn.lastRec; if (!r || r.R == null) return 'Dawn. Find them before the light goes flat.'; return 'The offspring came out ' + Math.abs(r.R).toFixed(2) + (r.R >= 0 ? ' paler' : ' darker') + ' on average than their parents’ generation.'; },
  quickLine(Hn, r) { return 'Offspring ' + Math.abs(r.R).toFixed(2) + (r.R >= 0 ? ' paler' : ' darker') + '. Camouflage <b>' + pct(Hn.obj.value) + '</b>.'; },
  summary(Hn, rec) {
    const T = this.target.T;
    return {
      title: 'Generation ' + rec.gen + ': morning over',
      leg: '<div class="leg"><span><i style="background:rgba(41,33,27,.25)"></i>whole population</span><span><i style="background:#a8263f"></i>the ones you ate</span><span><i style="background:#b07a14;height:2px"></i>bark</span></div>',
      hist: { lo: 0, hi: 1, bins: 18, layers: [{ v: rec.vals, c: 'rgba(41,33,27,.25)' }, { v: rec.ev, c: '#a8263f' }], marker: T, l0: 'dark', l1: 'pale' },
      text: rec.eaten ? 'You ate ' + rec.eaten + '. On the dark-to-pale scale they averaged ' + (rec.mEat).toFixed(2) + '; the moths you missed averaged ' + rec.mSurv.toFixed(2) + ', and the bark sits at ' + T.toFixed(2) + '. Only the missed moths breed.' : 'You ate nothing, so every moth breeds and nothing is selected.'
    };
  },
  endChart(cv, Hn) { huntEndChart(cv, Hn, 0.75); },
  chartCap: 'Population camouflage by generation.',
  what(Hn) {
    let S = 0, Rr = 0; for (const r of Hn.hist) if (r.R != null) { S += r.S; Rr += r.R; }
    const h2 = Math.abs(S) > 0.04 ? clamp(Rr / S, -1, 2) : null;
    let s = 'Summed over the run, the moths you spared were ' + Math.abs(S).toFixed(2) + (S >= 0 ? ' paler' : ' darker') + ' than their generations — the selection differential, S. Their offspring moved ' + Math.abs(Rr).toFixed(2) + ' — the response, R. ';
    if (h2 != null) s += 'So about ' + Math.round(h2 * 100) + '% of what you selected was passed on: the realised heritability, in breeders’ shorthand R = h²S. The rest was developmental luck — moths paler than their genes, spared for something they couldn’t pass on.';
    else s += 'You didn’t push hard enough in one direction to measure heritability.';
    return s;
  }
};

/* ---------- Chapter II: industrial melanism ---------- */
const CH_SOOT = {
  id: 'soot', mode: 'hunt', num: 'II', title: 'The Black Country', concept: 'Industrial melanism',
  intro: {
    premise: 'Lancashire, 1848. Coal smoke is killing the lichen and staining the trees. A few peppered moths carry carbonaria, a single dominant mutation that turns them black.',
    part: 'Hunt as before and watch the bark. The soot arrives over a few generations; later, the air will clear. Each generation one pale moth flies in from cleaner woods.',
    goal: 'First, black moths reach 75%. Then, once the Clean Air Act cleans the trees, bring them back under 40%.',
    real: 'The first black peppered moth was recorded in Manchester in 1848; by 1895 about 98% there were black. Carbonaria turned out to be a jumping gene inserted into the gene cortex, dated to around 1819 (van’t Hof et al. 2016). After clean-air laws the black form declined across Britain, and Majerus’s six-year field experiment confirmed that birds take the conspicuous form (Cook et al. 2012).'
  },
  traits: [{ k: 'carb', n: 1, kind: 'dom', p0: 0.05, mu: 0.01, back: 0 }, { k: 'tone', n: 4, m0: 0.74, s0: 0.04, mu: 0.02, msd: 0.03, ve: 0.02 }, { k: 'hue', n: 4, m0: 0.84, s0: 0.06, mu: 0.02, msd: 0.04, ve: 0.02 }],
  N: 30, cap: 15, roundTime: 11, missCost: 0.5, maxGen: 24,
  tg: { lichen: { T: 0.70, H: 0.85 }, soot: { T: 0.12, H: 0.36 } },
  phen(lay, g) { const black = Gen.dom(lay, g, 'carb'); return black ? { black: true, tone: 0.05 + 0.05 * R(), hue: 0.38, mot: 0.12 } : { black: false, tone: Gen.ph(lay, g, 'tone'), hue: Gen.ph(lay, g, 'hue'), mot: 0.78 }; },
  rot() { return (R() - 0.5) * 0.8; },
  sprite(ph, d, sv) { return mothSprite(ph, d, sv); },
  makeBg(w, h, d) {
    const a = barkTex(w, h, d, 4242, false), b = barkTex(w, h, d, 4242, true);
    this.tg = { lichen: { T: a.T, H: a.H }, soot: { T: b.T, H: b.H } };
    return { draw: (c, W, H, env) => { c.drawImage(a.cv, 0, 0, W, H); if (env && env.soot > 0) { c.globalAlpha = env.soot; c.drawImage(b.cv, 0, 0, W, H); c.globalAlpha = 1; } } };
  },
  setup(Hn) { Hn.phase = { aGen: null, cleanGen: null, q0: Gen.freq(Hn.lay, Hn.pop, 'carb') }; },
  sootAt(Hn) { const g = Hn.gen, P = Hn.phase; let s = g <= 1 ? 0 : g === 2 ? 0.45 : g === 3 ? 0.8 : 1; if (P.cleanGen != null && g >= P.cleanGen) s = Math.max(0, 1 - 0.4 * (g - P.cleanGen + 1)); return s; },
  env(Hn) { const s = this.sootAt(Hn); return { soot: s, T: lerp(this.tg.lichen.T, this.tg.soot.T, s), H: lerp(this.tg.lichen.H, this.tg.soot.H, s) }; },
  black(pop) { return pop.length ? pop.filter(x => x.ph.black).length / pop.length : 0; },
  focus: { get: ph => ph.black ? 1 : 0 },
  onBred(Hn) {
    const lay = Hn.lay, s = lay.T.carb, g = Gen.genome(lay); g[s.off] = 0; g[lay.L + s.off] = 0; Hn.pop[(R() * Hn.pop.length) | 0] = Hn.mk(g);
    const f = this.black(Hn.pop), P = Hn.phase;
    if (P.aGen == null && f >= 0.75) { P.aGen = Hn.gen; P.cleanGen = Hn.gen + 2; if (!Hn.sync) toast('Black moths passed <b>75%</b>. Parliament passes a Clean Air Act: the trees start to clean in two generations.'); }
    if (P.cleanGen == null && Hn.gen >= 15) { P.cleanGen = Hn.gen; if (!Hn.sync) toast('The Clean Air Act passes. The trees are starting to clean.'); }
  },
  recExtra(Hn, rec, eaten, surv) { rec.q = Gen.freq(Hn.lay, Hn.pop, 'carb'); rec.eb = eaten.filter(x => x.ph.black).length; rec.ep = eaten.length - rec.eb; rec.sb = surv.filter(x => x.ph.black).length; rec.sp = surv.length - rec.sb; rec.soot = Hn.env.soot; },
  objective(Hn) {
    const f = this.black(Hn.pop), P = Hn.phase;
    if (P.aGen == null) return { label: 'Black moths', value: f, goal: 0.75, done: false, text: Hn.gen <= 1 ? 'The air is still clean. Soot comes soon.' : 'Goal 1 of 2: black moths reach 75%.' };
    const cleaning = P.cleanGen != null && Hn.gen >= P.cleanGen;
    return { label: 'Black moths', value: f, goal: 0.40, below: true, done: cleaning && f <= 0.40, text: cleaning ? 'Goal 2 of 2: the trees are cleaning. Bring black moths under 40% — three stars by generation 20.' : 'Goal 1 done. The Clean Air Act is coming.' };
  },
  stars(Hn, o) { const A = Hn.phase.aGen != null; if (!o.done) return A ? 1 : 0; return !A ? 1 : Hn.gen <= 20 ? 3 : 2; },
  dawnLine(Hn) { const s = Hn.env.soot, P = Hn.phase; if (Hn.gen === 1) return 'Clean lichen, for now. Black moths are rare mutants.'; if (P.cleanGen != null && Hn.gen >= P.cleanGen) return s > 0 ? 'The air is clearing; lichen creeps back.' : 'The bark is clean again.'; if (s > 0 && s < 1) return 'Soot is settling on the bark.'; if (s >= 1) return 'The trees are black with soot.'; return 'Clean lichen, for now.'; },
  quickLine(Hn) { return 'Black moths <b>' + pct(this.black(Hn.pop)) + '</b>.'; },
  summary(Hn, rec) {
    return {
      title: 'Generation ' + rec.gen + ': morning over',
      leg: '<div class="leg"><span><i style="background:rgba(41,33,27,.25)"></i>missed</span><span><i style="background:#a8263f"></i>eaten</span></div>',
      bars: { groups: [{ label: 'pale (typica)', parts: [{ v: rec.ep, c: '#a8263f' }, { v: rec.sp, c: 'rgba(41,33,27,.25)' }] }, { label: 'black (carbonaria)', parts: [{ v: rec.eb, c: '#a8263f' }, { v: rec.sb, c: 'rgba(41,33,27,.25)' }] }] },
      text: 'You ate ' + rec.ep + ' pale and ' + rec.eb + ' black moths. Carbonaria is now ' + pct(rec.q) + ' of gene copies — more than the black moths alone suggest would be hidden, because heterozygotes are black too.'
    };
  },
  endLeg: '<div class="leg"><span><i style="background:#2f7f7a"></i>black moths</span><span><i style="background:#8a5d10"></i>carbonaria copies</span><span><i style="background:rgba(41,33,27,.18)"></i>soot</span></div>',
  endChart(cv, Hn) {
    const d = Hn.hist.map(r => r.obj), q = Hn.hist.map(r => r.q != null ? r.q : null), soot = Hn.hist.map(r => r.env ? r.env.soot : 0);
    lineChart(cv, { theme: 'paper', bands: [{ c: 'rgba(41,33,27,.16)', d: soot }], series: [{ d, c: '#2f7f7a', w: 2.5 }, { d: q, c: '#8a5d10', w: 1.5, dash: [4, 3] }], y0: 0, y1: 1, refs: [{ v: 0.75, c: 'rgba(168,38,63,.7)' }, { v: 0.4, c: 'rgba(168,38,63,.7)' }], fy: v => pct(v), x0l: 'gen 1', xl: 'gen ' + d.length });
  },
  chartCap: 'Grey columns mark soot on the bark.',
  what(Hn) {
    const qs = Hn.hist.filter(r => r.q != null).map(r => r.q), q0 = Hn.phase.q0, qmax = qs.length ? Math.max(...qs) : q0, qn = Gen.freq(Hn.lay, Hn.pop, 'carb');
    const pale = 1 - this.black(Hn.pop);
    return 'Carbonaria started as ' + pct(q0) + ' of gene copies, peaked at ' + pct(qmax) + ' and ended at ' + pct(qn) + '. Dominance makes the two directions unequal. On the way up, every carbonaria copy showed, so you could select it hard. The pale allele never quite vanished, though: its recessive copies hid inside black heterozygotes, invisible to you — and that hidden reserve is what let the pale form return when the trees cleaned. Pale moths ended at ' + pct(pale) + ' of the population.';
  }
};

/* ---------- Chapter III: Batesian mimicry ---------- */
const CH_BITTER = {
  id: 'bitter', mode: 'hunt', num: 'III', title: 'Bitter Wings', concept: 'Mimicry',
  intro: {
    premise: 'Bitterwings are loaded with toxins and wear black and red to say so. Palewings are cream-coloured, harmless and good to eat — and on green leaves they have nowhere to hide. Nothing stops a palewing from dressing like a bitterwing.',
    part: 'Eat palewings, up to twelve a morning. A bitterwing makes you retch and costs three seconds. Bitterwings stay as they are; palewings evolve.',
    goal: 'Palewings evolve a 70% resemblance to bitterwings. Three stars by generation 12.',
    real: 'Henry Walter Bates described palatable Amazonian butterflies copying toxic ones in 1862, three years after the Origin. Birds that learn a warning pattern the hard way then spare its look-alikes. The same logic runs in reverse: mimics only work while they are rare, because every harmless copy teaches predators that the warning is a bluff.'
  },
  traits: [{ k: 'red', n: 6, m0: 0.16, s0: 0.16, mu: 0.06, msd: 0.07, ve: 0.03 }, { k: 'dark', n: 6, m0: 0.13, s0: 0.15, mu: 0.06, msd: 0.07, ve: 0.03 }],
  N: 24, cap: 12, models: 8, roundTime: 12, missCost: 0.5, bitterCost: 3, maxGen: 20,
  phen(lay, g) { return { red: Gen.ph(lay, g, 'red'), dark: Gen.ph(lay, g, 'dark') }; },
  modelPh() { return { red: 0.97 + 0.03 * R(), dark: 0.95 + 0.05 * R(), model: true }; },
  rot() { return R() * TAU; },
  sprite(ph, d, sv) { return flySprite(ph, d, sv); },
  makeBg(w, h, d) { const t = leafTex(w, h, d, 777); return { draw: (c, W, H) => c.drawImage(t, 0, 0, W, H) }; },
  env() { return {}; },
  resem(ph) { return 1 - Math.sqrt(((1 - ph.red) ** 2 + (1 - ph.dark) ** 2) / 2); },
  focus: { get: ph => 1 - Math.sqrt(((1 - ph.red) ** 2 + (1 - ph.dark) ** 2) / 2) },
  setup(Hn) { Hn.phase = { r0: mean(Hn.pop.map(x => this.resem(x.ph))) }; },
  objective(Hn) { const v = mean(Hn.pop.map(x => this.resem(x.ph))); return { label: 'Resemblance to bitterwings', value: v, goal: 0.7, done: v >= 0.7, text: 'Black-and-red is a bitterwing; cream is a palewing. In between, you decide. Stars at generations 12, 16 and 20.' }; },
  stars(Hn, o) { return !o.done ? 0 : Hn.gen <= 12 ? 3 : Hn.gen <= 16 ? 2 : 1; },
  dawnLine(Hn) { if (Hn.gen === 1) return 'Eight bitterwings among them. You know what red and black means.'; const r = Hn.lastRec; return r && r.bitter ? 'You remember the taste. ' + r.bitter + ' bitter mouthful' + (r.bitter > 1 ? 's' : '') + ' yesterday.' : 'The palewings you spared have bred.'; },
  quickLine(Hn, r) { return 'Resemblance <b>' + pct(Hn.obj.value) + '</b>' + (r.bitter ? '. ' + r.bitter + ' bitter.' : '.'); },
  summary(Hn, rec) {
    return {
      title: 'Generation ' + rec.gen + ': morning over',
      leg: '<div class="leg"><span><i style="background:rgba(41,33,27,.25)"></i>all palewings</span><span><i style="background:#a8263f"></i>the ones you ate</span><span><i style="background:#b07a14;height:2px"></i>a perfect copy</span></div>',
      hist: { lo: 0, hi: 1, bins: 16, layers: [{ v: rec.vals, c: 'rgba(41,33,27,.25)' }, { v: rec.ev, c: '#a8263f' }], marker: 1, l0: 'plain cream', l1: 'bitterwing look' },
      text: 'You ate ' + rec.eaten + ' palewings' + (rec.bitter ? ' and ' + rec.bitter + ' bitterwing' + (rec.bitter > 1 ? 's' : '') : '') + '. The ones you ate looked ' + pct(rec.mEat || 0) + ' like bitterwings; the ones you spared, ' + pct(rec.mSurv) + '.'
    };
  },
  endChart(cv, Hn) { huntEndChart(cv, Hn, 0.7, false, '#a8263f'); },
  chartCap: 'Average resemblance of palewings to bitterwings.',
  what(Hn) {
    const r1 = mean(Hn.pop.map(x => this.resem(x.ph)));
    return 'Resemblance started at ' + pct(Hn.phase.r0) + ' and reached ' + pct(r1) + '. You paid ' + Hn.bitterTotal + ' bitter mouthful' + (Hn.bitterTotal === 1 ? '' : 's') + ' over the run. Every morning you ate the palewings that looked safest, and every morning the ones that made you hesitate bred. Your caution, not any intent of theirs, is what they evolved against. If you noticed yourself sampling red wings again once the copies were good, you felt the limit on Batesian mimicry: the signal is only worth copying while it stays honest.';
  }
};
