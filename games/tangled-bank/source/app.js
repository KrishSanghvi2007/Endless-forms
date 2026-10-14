/* ================= APP ================= */
CH_LICHEN.intro.basis = 'Alan Bond and Alan Kamil’s blue jays, hunting digital moths (2002).';
CH_SOOT.intro.basis = 'the peppered moth, Biston betularia, in industrial Britain.';
CH_BITTER.intro.basis = 'Henry Walter Bates’s Amazonian butterflies (1862).';
const CHAPTERS = [CH_LICHEN, CH_SOOT, CH_BITTER, CH_ARIPO, CH_ISLAND, CH_COMMONS];
const CLADES = [{ name: 'You are the predator', tree: [[0, 1], 2] }, { name: 'You are the environment', tree: [[3, 4], 5] }];

function introHTML(ch) {
  const i = ch.intro;
  return '<h3>' + ch.title + '</h3><p class="kicker">Chapter ' + ch.num + '. ' + ch.concept + '</p><p>' + i.premise + '</p><p><b>Your part.</b> ' + i.part + '</p><p class="goal"><b>Goal.</b> ' + i.goal + '</p><p class="basis">Based on ' + i.basis + '</p>';
}

const App = {
  scr: 'title', mode: null, ch: null,
  go(scr) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 'scr-' + scr)); this.scr = scr;
    if (scr === 'tree') Tree.render();
    if (scr === 'play') Stage.resize();
  },
  open(ch) { Cards.open({ cls: 'intro', html: introHTML(ch), buttons: [{ t: 'Back', fn: () => Cards.close() }, { t: 'Begin', primary: true, fn: () => { Cards.close(); this.play(ch); } }] }); },
  play(ch) {
    this.ch = ch; this.mode = null; this.go('play');
    $('bar-title').innerHTML = '<span class="n">' + ch.num + '</span>' + ch.title;
    $('speed').style.display = ch.mode === 'hunt' ? 'none' : 'flex';
    Stage.resize();
    this.mode = ch.mode === 'hunt' ? Hunt : Steward; this.mode.start(ch); Stage.resize(); setTimeout(() => Stage.resize(), 60);
  },
  exit() { if (this.mode === Hunt) Hunt.state = 'idle'; this.mode = null; Cards.close(); this.go('tree'); }
};

const Tree = {
  render() {
    const rows = $('tree-rows'); let h = '', tot = 0;
    for (const cl of CLADES) {
      h += '<div class="clade">' + cl.name + '</div>';
      for (const i of cl.tree.flat()) { const ch = CHAPTERS[i], st = Save.d.stars[ch.id] || 0; tot += st; h += '<button class="tip" data-i="' + i + '"><span class="num">' + ch.num + '</span><span class="tt"><b>' + ch.title + '</b><i>' + ch.concept + '</i></span><span class="st" aria-label="' + st + ' of 3 stars">' + '★'.repeat(st) + '<span class="off">' + '★'.repeat(3 - st) + '</span></span></button>'; }
    }
    rows.innerHTML = h;
    $('tree-stars').textContent = tot ? tot + ' of 18 stars earned. Any chapter, any order.' : 'Six chapters. Start anywhere; the first is the gentlest.';
    rows.querySelectorAll('.tip').forEach(b => b.onclick = () => { Snd.init(); Snd.resume(); Snd.click(); App.open(CHAPTERS[+b.dataset.i]); });
    setTimeout(() => this.svg(), 30);
  },
  svg() {
    const svg = $('tree-svg'), rows = $('tree-rows'); if (!svg || !rows.offsetHeight) return;
    const y = {}; rows.querySelectorAll('.tip').forEach(b => { y[+b.dataset.i] = b.offsetTop + b.offsetHeight / 2; });
    const H = rows.offsetTop + rows.offsetHeight; svg.setAttribute('height', H); svg.style.height = H + 'px';
    const TX = 54, PX = 40, CX = 26, RX = 10; let p = '';
    const line = (x1, y1, x2, y2) => { p += 'M' + x1 + ' ' + y1.toFixed(1) + 'L' + x2 + ' ' + y2.toFixed(1); };
    const cy = CLADES.map(cl => {
      const [[a, b], c] = cl.tree;
      line(PX, y[a], TX, y[a]); line(PX, y[b], TX, y[b]); line(PX, y[a], PX, y[b]); const py = (y[a] + y[b]) / 2;
      line(CX, py, PX, py); line(CX, y[c], TX, y[c]); line(CX, py, CX, y[c]); const v = (py + y[c]) / 2;
      line(RX, v, CX, v); return v;
    });
    line(RX, cy[0], RX, cy[1]); line(2, (cy[0] + cy[1]) / 2, RX, (cy[0] + cy[1]) / 2);
    let dots = '';
    for (const i in y) { const st = Save.d.stars[CHAPTERS[i].id] || 0; dots += '<circle cx="' + TX + '" cy="' + y[i].toFixed(1) + '" r="4" fill="' + (st ? '#cf9a33' : '#152120') + '" stroke="' + (st ? '#cf9a33' : 'rgba(232,223,201,.6)') + '" stroke-width="1.5"/>'; }
    svg.innerHTML = '<path d="' + p + '" fill="none" stroke="rgba(232,223,201,.5)" stroke-width="1.5" stroke-linecap="round"/>' + dots;
  }
};

const Title = {
  segs: null, t: 0, key: '',
  build(w, h) {
    const r = rng(1859), segs = [];
    const grow = (x, y, a, len, depth, t0) => {
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len, t1 = t0 + 0.18 + len / 420;
      const tip = depth >= 8 || y2 < h * 0.04 || (depth > 3 && r() < 0.1);
      segs.push({ x, y, x2, y2, t0, t1, w: Math.max(0.7, 2.8 - depth * 0.3), tip, dead: tip && r() < 0.3 });
      if (tip) return;
      grow(x2, y2, a - (0.2 + r() * 0.4), len * (0.72 + r() * 0.16), depth + 1, t1);
      grow(x2, y2, a + (0.2 + r() * 0.4), len * (0.72 + r() * 0.16), depth + 1, t1);
    };
    grow(w * 0.7, h * 0.6, -Math.PI / 2 - 0.12, h * 0.11, 0, 0.15);
    this.segs = segs; this.key = w + 'x' + h; this.end = Math.max(...segs.map(s => s.t1)) + 0.2;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) this.t = this.end;
  },
  tick(dt) {
    const cv = $('title-cv'); if (!cv) return; const { c, w, h } = fitCanvas(cv);
    if (this.key !== w + 'x' + h) { this.build(w, h); }
    if (this.drawn && this.t > this.end) return;
    this.t += dt; c.clearRect(0, 0, w, h); c.lineCap = 'round';
    for (const s of this.segs) {
      if (this.t < s.t0) continue; const k = clamp((this.t - s.t0) / (s.t1 - s.t0), 0, 1);
      c.strokeStyle = 'rgba(232,223,201,' + (0.28 + 0.3 * (s.w / 2.8)) + ')'; c.lineWidth = s.w;
      c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(lerp(s.x, s.x2, k), lerp(s.y, s.y2, k)); c.stroke();
      if (s.tip && k >= 1) { if (s.dead) { c.strokeStyle = 'rgba(232,223,201,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(s.x2 - 3, s.y2); c.lineTo(s.x2 + 3, s.y2); c.stroke(); } else { c.fillStyle = '#cf9a33'; c.beginPath(); c.arc(s.x2, s.y2, 2.2, 0, TAU); c.fill(); } }
    }
    if (this.t > this.end) this.drawn = true;
  }
};

function showErr(e) { const el = $('err'); el.style.display = 'block'; el.textContent = 'Something broke: ' + (e && (e.stack || e.message) || e) + '\n(Tap to dismiss.)'; el.onclick = () => el.style.display = 'none'; }
window.addEventListener('error', e => showErr(e.error || e.message));

let lastT = performance.now();
function frame() {
  const now = performance.now(), dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
  try {
    if (App.scr === 'title') Title.tick(dt);
    else if (App.scr === 'play' && App.mode) { Stage.ctx.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0); App.mode.update(dt); if (App.mode) App.mode.draw(); }
  } catch (e) { showErr(e); App.mode = null; }
  setTimeout(frame, 16);
}

function boot() {
  Save.load(); Snd.on = Save.d.snd !== false;
  Stage.init();
  $('btn-begin').onclick = () => { Snd.init(); Snd.resume(); Snd.click(); App.go('tree'); };
  $('btn-title').onclick = () => { Title.t = 0; Title.drawn = false; App.go('title'); };
  const sb = $('btn-snd'); const sl = () => { sb.textContent = Snd.on ? 'Sound on' : 'Sound off'; sb.setAttribute('aria-pressed', Snd.on ? 'true' : 'false'); }; sl();
  sb.onclick = () => { Snd.on = !Snd.on; Save.d.snd = Snd.on; Save.save(); sl(); Snd.init(); Snd.click(); };
  $('bar-back').onclick = () => App.exit();
  document.querySelectorAll('#speed button').forEach(b => b.onclick = () => { Snd.click(); if (App.mode === Steward) Steward.setSpeed(+b.dataset.s); });
  window.addEventListener('resize', () => { if (App.scr === 'tree') Tree.svg(); });
  // content validation on boot: every chapter must be complete
  for (const ch of CHAPTERS) { for (const k of ['id', 'mode', 'num', 'title', 'concept', 'intro']) if (!ch[k]) throw new Error('Chapter missing ' + k + ': ' + ch.title); for (const k of ['premise', 'part', 'goal', 'basis', 'real']) if (!ch.intro[k]) throw new Error('Chapter ' + ch.id + ' intro missing ' + k); }
  App.go('title'); frame();
}
window.TB = { App, Hunt, Steward, CHAPTERS, Gen, seed, R, Save, Stage, Cards };
boot();
