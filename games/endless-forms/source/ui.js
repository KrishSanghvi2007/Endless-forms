/* ================= ENDLESS FORMS: framework ================= */
const PLAN = [
  { n: 'Heredity', c: [['mendel', 'Mendel’s Garden', 'Inheritance and dominance'], ['scribe', 'The Scribe', 'Mutation'], ['cross', 'Crossing Over', 'Recombination and linkage'], ['census', 'The Census', 'Hardy–Weinberg and what breaks it'], ['coal', 'The Coalescent', 'Common ancestry']] },
  { n: 'Chance', c: [['casino', 'Drift Casino', 'Genetic drift'], ['castaways', 'The Castaways', 'Founders, bottlenecks and rescue'], ['sex', 'Why Sex?', 'Muller’s ratchet']] },
  { n: 'Selection', c: [['lichen', 'The Lichen Wood', 'Natural selection'], ['soot', 'The Black Country', 'A changing world'], ['fancier', 'The Fancier', 'Artificial selection'], ['sieve', 'The Sieve', 'Three shapes of selection'], ['bitter', 'Bitter Wings', 'Mimicry'], ['landscape', 'The Landscape', 'Peaks, valleys and epistasis']] },
  { n: 'Games animals play', c: [['jaws', 'Left Jaw, Right Jaw', 'Frequency-dependent selection'], ['hawks', 'Hawks and Doves', 'Evolutionarily stable strategies'], ['bats', 'Blood Debts', 'Reciprocal altruism']] },
  { n: 'Sex', c: [['brood', 'Fisher’s Brood', 'Sex ratio'], ['gametes', 'Two Sizes', 'Eggs and sperm'], ['lek', 'The Lek', 'Mate choice and runaway'], ['raffle', 'The Raffle', 'Sperm competition'], ['spindle', 'The Selfish Spindle', 'Meiotic drive'], ['meadow', 'The Meadow', 'Pollination and fertilisation']] },
  { n: 'Families and societies', c: [['alarm', 'Alarm Call', 'Kin selection'], ['nest', 'The Nest', 'Parents and offspring'], ['commons', 'The Commons', 'Levels of selection'], ['many', 'Many Become One', 'Multicellularity']] },
  { n: 'Lives and behaviour', c: [['livefast', 'Live Fast', 'Life-history trade-offs'], ['forager', 'The Forager', 'Optimal foraging'], ['crowd', 'The Crowd', 'Choosing where to feed'], ['plastic', 'Shape-shifters', 'Plasticity and reaction norms']] },
  { n: 'Coevolution and disease', c: [['lock', 'Lock and Key', 'The Red Queen'], ['clinic', 'The Clinic', 'Antibiotic resistance'], ['virulence', 'The Pathogen', 'Evolution of virulence'], ['guest', 'The Guest', 'Symbiosis and mutualism']] },
  { n: 'Genomes and development', c: [['switch', 'Switches', 'Evo-devo'], ['copy', 'Copy and Paste', 'Jumping genes and duplication'], ['sweep', 'The Sweep', 'Selective sweeps'], ['clock', 'The Clock', 'Neutral evolution']] },
  { n: 'Species', c: [['river', 'The River', 'Allopatric speciation'], ['fruits', 'Two Fruits', 'Sympatric speciation'], ['ring', 'The Ring', 'Ring species'], ['double', 'Doubling', 'Polyploid speciation']] },
  { n: 'Deep time and ecology', c: [['arch', 'The Archipelago', 'Radiation and competition'], ['tree', 'Tree Thinking', 'Phylogeny and convergence'], ['web', 'The Food Web', 'Trophic cascades'], ['islands', 'Islands', 'Island biogeography'], ['fire', 'After the Fire', 'Succession']] }
];
const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
const ORDER = []; PLAN.forEach(p => p.c.forEach(c => ORDER.push(c[0])));
const REG = {};
function chNum(id) { return ORDER.indexOf(id) + 1; }
function reg(ch) { const e = PLAN.flatMap(p => p.c).find(c => c[0] === ch.id); if (!e) throw new Error('Unknown chapter ' + ch.id); ch.title = e[1]; ch.concept = e[2]; ch.num = chNum(ch.id); REG[ch.id] = ch; }

const HUD = {
  set(html) { $('hud').innerHTML = html; },
  meterHTML(label) { return '<div class="hud-goal"><span id="m-l">' + label + '</span><b id="m-v"></b></div><div class="meter"><i id="m-i"></i><em id="m-e"></em></div>'; },
  meter(v, goal, txt, col) { const i = $('m-i'); if (!i) return; i.style.width = pct(clamp(v, 0, 1)); if (col) i.style.background = col; const e = $('m-e'); if (goal == null) e.style.display = 'none'; else { e.style.display = ''; e.style.left = 'calc(' + pct(goal) + ' - 1px)'; } $('m-v').textContent = txt; },
  line(id, html) { const e = $(id); if (e) e.innerHTML = html; }
};

function introHTML(ch) {
  const i = ch.intro;
  return '<h3>' + ch.title + '</h3><p class="kicker">Chapter ' + ch.num + '. ' + ch.concept + '</p><p>' + (i.hook || i.premise) + '</p><p><b>How to play.</b> ' + (i.how || i.part) + '</p><p class="goal"><b>Goal.</b> ' + i.goal + '</p><p class="basis">Tap Notes during play for the idea, the numbers and the graphs. The game pauses while they’re open.</p>';
}

const End = {
  show(ch, o) {
    if (o.stars) Snd.star(); else Snd.chime();
    if (o.stars) Save.star(ch.id, o.stars);
    const idx = ORDER.indexOf(ch.id); let next = null;
    for (let k = idx + 1; k < ORDER.length; k++) if (REG[ORDER[k]]) { next = REG[ORDER[k]]; break; }
    const btns = [{ t: 'Play again', fn: () => { Cards.close(); App.play(ch); } }, { t: 'Notebook', fn: () => App.exit() }];
    if (next) btns.push({ t: 'Next: ' + next.title, primary: true, fn: () => { Cards.close(); App.open(next); } });
    const sci = (ch.intro && ch.intro.real) || ch.real || '', mth = ch.maths || '';
    Cards.open({
      cls: 'end',
      html: '<h3>' + (o.title || 'Chapter complete') + '</h3><div class="stars">' + starStr(o.stars || 0) + '</div><p class="insight">' + o.insight + '</p>' + (o.chart ? (o.leg || '') + '<canvas></canvas>' + (o.cap ? '<p class="cap">' + o.cap + '</p>' : '') : '') +
        (sci ? '<details><summary>The real thing</summary><p>' + sci + '</p></details>' : '') + (mth ? '<details><summary>The numbers behind it</summary><p>' + mth + '</p></details>' : ''),
      buttons: btns, onOpen: box => { if (o.chart) o.chart(box.querySelector('canvas')); }
    });
  }
};

const Notes = {
  tab: 'idea',
  open() { if (!App.mode || !App.mode.notes || Cards.isOpen()) return; App.paused = true; $('sheet').classList.add('on'); $('sh-title').textContent = 'Notes: ' + App.ch.title; this.render(); Snd.click(); },
  close() { if (!$('sheet').classList.contains('on')) return; $('sheet').classList.remove('on'); App.paused = false; lastT = performance.now(); },
  isOpen() { return $('sheet').classList.contains('on'); },
  render() {
    const n = App.mode.notes(), b = $('sh-body');
    document.querySelectorAll('#sh-tabs button').forEach(x => x.classList.toggle('on', x.dataset.t === this.tab));
    if (this.tab === 'idea') b.innerHTML = n.idea || '<p>No notes yet.</p>';
    else if (this.tab === 'num') b.innerHTML = (n.stats || []).map(r => '<div class="srow"><span class="l">' + r[0] + '</span><span class="v">' + r[1] + '</span>' + (r[2] ? '<span class="m">' + r[2] + '</span>' : '') + '</div>').join('') || '<p>Numbers appear once something has happened.</p>';
    else {
      const cs = n.charts || [];
      b.innerHTML = cs.map((c, i) => '<div class="gbox"><h5>' + c.title + '</h5>' + (c.leg || '') + '<canvas id="nc' + i + '"></canvas>' + (c.cap ? '<p style="font-size:13px;color:var(--ink2);margin:4px 0 0">' + c.cap + '</p>' : '') + '</div>').join('') || '<p>Graphs appear once there is some history.</p>';
      requestFrame(() => cs.forEach((c, i) => { const cv = $('nc' + i); if (cv) c.draw(cv, 'paper'); }));
    }
  }
};
const THEME_KEYS = { cab: '--cab', hud: '--cab2', text: '--paper', dim: '--paper-dim', line: '--line', acc: '--carmine', hi: '--ochre', meter: '--teal', inv: '--ink' };
function applyTheme(t) { const el = $('scr-play'); for (const k in THEME_KEYS) el.style.removeProperty(THEME_KEYS[k]); if (t) for (const k in t) if (THEME_KEYS[k]) el.style.setProperty(THEME_KEYS[k], t[k]); const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', (t && t.cab) || '#152120'); }
const legP = items => '<div class="leg">' + items.map(([c, t]) => '<span><i style="background:' + c + '"></i>' + t + '</span>').join('') + '</div>';

const App = {
  scr: 'title', mode: null, ch: null, paused: false,
  go(scr) {
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 'scr-' + scr)); this.scr = scr;
    if (scr === 'menu') Menu.render();
    if (scr === 'play') Stage.resize();
  },
  open(ch) { Cards.open({ cls: 'intro', html: introHTML(ch), buttons: [{ t: 'Back', fn: () => Cards.close() }, { t: 'Begin', primary: true, fn: () => { Cards.close(); this.play(ch); } }] }); },
  play(ch) {
    Notes.close(); Cards.close(); { const tc = document.getElementById('toasts'); if (tc) tc.innerHTML = ''; } this.ch = ch; this.mode = null; this.paused = false; this.go('play'); applyTheme(ch.theme);
    $('bar-title').innerHTML = '<span class="n">' + ch.num + '</span>' + ch.title; $('bar-gen').textContent = ''; $('hud').innerHTML = '';
    Stage.resize();
    this.mode = ch.mode === 'hunt' ? Hunt : ch; this.mode.start(ch);
  },
  exit() { if (this.mode === Hunt) Hunt.state = 'idle'; if (this.mode && this.mode.stop) this.mode.stop(); this.mode = null; Notes.close(); Cards.close(); this.go('menu'); }
};

const Menu = {
  render() {
    let h = '', tot = 0, built = 0;
    PLAN.forEach((p, pi) => {
      h += '<div class="part"><h3><span>' + ROM[pi] + '</span>' + p.n + '</h3></div>';
      for (const [id, t, c] of p.c) {
        const ch = REG[id], st = Save.d.stars[id] || 0; tot += st; if (ch) built++;
        h += '<button class="chap' + (ch ? '' : ' soon') + (st ? ' won' : '') + '" data-id="' + id + '"' + (ch ? '' : ' aria-disabled="true"') + '><span class="no">' + chNum(id) + '</span><span class="tt"><b>' + t + '</b><i>' + c + '</i></span><span class="st">' + (ch ? '★'.repeat(st) + '<span class="off">' + '★'.repeat(3 - st) + '</span>' : 'in preparation') + '</span></button>';
      }
    });
    $('menu-body').innerHTML = h;
    $('menu-stars').textContent = built + ' of ' + ORDER.length + ' chapters ready' + (tot ? '. ' + tot + ' of ' + built * 3 + ' stars earned.' : '. Start anywhere.');
    $('menu-body').querySelectorAll('.chap').forEach(b => b.onclick = () => { const ch = REG[b.dataset.id]; if (!ch) { toast('This chapter is still being written.'); return; } Snd.init(); Snd.resume(); Snd.click(); App.open(ch); });
  }
};

const Title = {
  segs: null, t: 0, key: '',
  build(w, h) {
    const r = rng(1859), segs = [];
    const grow = (x, y, a, len, depth, t0) => {
      const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len, t1 = t0 + 0.16 + len / 440;
      const tip = depth >= 8 || y2 < h * 0.04 || (depth > 3 && r() < 0.1);
      segs.push({ x, y, x2, y2, t0, t1, w: Math.max(0.7, 2.8 - depth * 0.3), tip, dead: tip && r() < 0.3 });
      if (tip) return;
      grow(x2, y2, a - (0.2 + r() * 0.4), len * (0.72 + r() * 0.16), depth + 1, t1);
      grow(x2, y2, a + (0.2 + r() * 0.4), len * (0.72 + r() * 0.16), depth + 1, t1);
    };
    grow(w * 0.68, h * 0.58, -Math.PI / 2 - 0.1, h * 0.11, 0, 0.15);
    this.segs = segs; this.key = w + 'x' + h; this.end = Math.max(...segs.map(s => s.t1)) + 0.2; this.drawn = false;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) this.t = this.end;
  },
  tick(dt) {
    const cv = $('title-cv'); if (!cv) return; const { c, w, h } = fitCanvas(cv);
    if (this.key !== w + 'x' + h) this.build(w, h);
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
  const now = performance.now(), dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now; App.t = (App.t || 0) + dt;
  try {
    if (App.scr === 'title') Title.tick(dt);
    else if (App.scr === 'play' && App.mode) { Stage.ctx.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0); if (!(App.paused || Cards.isOpen())) App.mode.update(dt); if (App.mode && !(App.paused || Cards.isOpen())) App.mode.draw(Stage.ctx, Stage.w, Stage.h); }
  } catch (e) { showErr(e); App.mode = null; }
  setTimeout(frame, 16);
}

/* small drawing helpers shared by chapters */
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function font(px, kind, weight) { const f = getComputedStyle(document.body).getPropertyValue(kind === 'd' ? '--fd' : kind === 'm' ? '--fm' : '--fb'); return (weight || '') + ' ' + px + 'px ' + f; }
function ink(c, s, x, y, px, col, align, kind, weight) { c.font = font(px, kind, weight); c.fillStyle = col || '#e8dfc9'; c.textAlign = align || 'left'; c.fillText(s, x, y); }
