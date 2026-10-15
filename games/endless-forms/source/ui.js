/* ================= ENDLESS FORMS: framework ================= */
/* Wave 2 shell (docs/design/API_v2.md §4). Every v2 path is gated on isV2(ch): a legacy chapter must play exactly as
   before (tests/golden.py checks all 48), and ?v1=1 shows none of the new UI. */
const EXPORT = {};   // v2 modules that tests need add themselves (EXPORT.Fx = Fx); boot.js merges this into window.TB
const Hooks = {
  pre: [],            // fn(c, w, h)      before App.mode.draw (shake transform)
  frame: [],          // fn(dt, c, w, h)  after App.mode.draw, only while the stage is live (no pause, no card)
  dt: [],             // fn(dt) → dt      before update (hit-stop); legacy dt passes through unchanged
  play: [],           // fn(ch, o)        after App.mode.start
  exit: [],           // fn(ch)           in App.exit
  key: [],            // fn(e) → true if handled; runs before Teacher and chapter keys
  keyup: [],          // fn(e) → true if handled; runs before App.mode.onKeyUp (v2 only), so a chapter can hold a key (Batch 1)
  chart: null,        // (cv, spec, theme) → void         set by 01_widgets (LiveGraph.draw)
  chartPointer: null  // (i, type, x, y, cv) → void       set by Predict while an ask is open; type 'down'|'move'|'up', x and y in CSS px of cv
};
/* A v2 chapter has v2 === true. Test it strictly: legacy CH_NEST (ch11.js) uses this.v2 as a visit counter (0…12). */
const isV2 = ch => !!ch && ch.v2 === true;
/* A plug-in hook that throws is reported once and dropped, so it cannot take a chapter down with it. */
function runHooks(list, ...a) { for (let i = 0; i < list.length; i++) { try { list[i](...a); } catch (e) { list.splice(i--, 1); showErr(e); } } }

/* URL parameters (D2-1), parsed once. 'level' and 'seed' are integers or null; theme and lab only in dev builds.
   calm and untimed work in every build (Batch 1: playtesters need them without a dev build; untimed sets Save.d.ui.unt at boot). */
const Url = (() => {
  const L = typeof location !== 'undefined' ? location : null, q = {};
  const dec = s => { try { return decodeURIComponent(s.replace(/\+/g, ' ')); } catch (e) { return s; } };
  for (const kv of String((L && L.search) || '').replace(/^\?/, '').split('&')) { if (!kv) continue; const i = kv.indexOf('='); q[dec(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '' : dec(kv.slice(i + 1)); }
  const int = v => v != null && /^\s*-?\d+\s*$/.test(v) ? parseInt(v, 10) : null, on = v => v != null && !/^(0|false|no|off)$/i.test(v);
  const dev = !!(L && L.protocol === 'file:') || q.dev === '1', locks = {}, lv = int(q.level), sd = int(q.seed);
  for (const p of String(q.locks || '').split(',')) { const i = p.lastIndexOf(':'), v = i > 0 ? parseFloat(p.slice(i + 1)) : NaN; if (isFinite(v)) locks[p.slice(0, i).trim()] = v; }
  return {
    q, dev, locks, unit: q.unit || null, level: lv != null && lv >= 0 ? lv : null, seed: sd == null ? null : sd >>> 0,
    teacher: on(q.teacher), projector: on(q.projector), v1: on(q.v1),
    cvd: /^(deut|prot|trit|mono)$/.test(q.cvd || '') ? q.cvd : null,
    lab: dev && q.lab ? q.lab : null, theme: dev && /^(dusk|paper|projector)$/.test(q.theme || '') ? q.theme : null, calm: q.calm != null && on(q.calm),
    untimed: q.untimed != null && on(q.untimed),
    link(o) {   // → share URL: unit, level, seed first, then any other keys; true → 1, objects (locks) → 'k:v,k:v'
      o = o || {}; const ps = [], base = L ? String(L.href).split(/[?#]/)[0] : '';
      const put = (k, v) => { if (v == null || v === false || v === '') return; if (v === true) v = 1; else if (typeof v === 'object') v = Object.keys(v).map(x => x + ':' + v[x]).join(','); ps.push(encodeURIComponent(k) + '=' + encodeURIComponent(v)); };
      for (const k of ['unit', 'level', 'seed']) put(k, o[k]);
      for (const k in o) if (k !== 'unit' && k !== 'level' && k !== 'seed') put(k, o[k]);
      return base + (ps.length ? '?' + ps.join('&') : '');
    },
    lock(unit, key, def) { const v = this.locks[unit + '.' + key]; return v != null ? v : def; }
  };
})();
if (typeof document !== 'undefined' && document.documentElement) { const de = document.documentElement; if (Url.v1) de.classList.add('v1'); if (Url.projector) de.dataset.theme = 'projector'; }

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
const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII'];
/* Redesign plug-ins (v2/*.js, loaded after the ch*.js files):
   V2.push(CH_X)  registers a chapter; an existing id replaces the old version.
   PLAN_ADD.push({ sec: 'Heredity', entry: ['id', 'Title', 'Concept'], after: 'census' })  adds a NEW chapter to the menu
   (a new sec name creates a new section at the end; omit after to append). Applied in boot.js before registration. */
const V2 = [], PLAN_ADD = [];
const ORDER = []; PLAN.forEach(p => p.c.forEach(c => ORDER.push(c[0])));
const REG = {};
function chNum(id) { return ORDER.indexOf(id) + 1; }
function reg(ch) { const e = PLAN.flatMap(p => p.c).find(c => c[0] === ch.id); if (!e) throw new Error('Unknown chapter ' + ch.id); ch.title = e[1]; ch.concept = e[2]; ch.num = chNum(ch.id); REG[ch.id] = ch; }

const HUD = {
  set(html) { $('hud').innerHTML = html; },
  meterHTML(label) { return '<div class="hud-goal"><span id="m-l">' + label + '</span><b id="m-v"></b></div><div class="meter"><i id="m-i"></i><em id="m-e"></em></div>'; },
  meter(v, goal, txt, col) { const i = $('m-i'); if (!i) return; i.style.width = pct(clamp(v, 0, 1)); if (col) i.style.background = col; const e = $('m-e'); if (goal == null) e.style.display = 'none'; else { e.style.display = ''; e.style.left = 'calc(' + pct(goal) + ' - 1px)'; } $('m-v').textContent = txt; },
  line(id, html) { const e = $(id); if (e) e.innerHTML = html; },
  /* v2 HUD line over the top 56 px of the stage: one sentence (≤ 15 words) and one live number in mono.
     The chapter's content.firstWords (shown before the first action) may run to 40 words (D4 §3); the HUD grows to fit. */
  say(text, num, o) {   // o.first: this is the before-first-action line (≤ 40 words); also detected when text is content.firstWords
    let el = $('hud-say');
    if (!el) { $('hud').innerHTML = '<div id="hud-say" class="hud-say"><span></span><b class="mono"></b></div>'; el = $('hud-say'); }
    const t = text == null ? '' : String(text), n = num == null ? '' : String(num);
    if (el.firstChild.textContent !== t) {
      el.firstChild.textContent = t;
      const C = App.ch && App.ch.content, first = !!(o && o.first) || (!!C && typeof C.firstWords === 'string' && t === C.firstWords);
      if (Url.dev && wordCount(t) > (first ? 40 : 15) && HUD.warnings.indexOf(t) < 0) HUD.warnings.push(t);
    }
    if (el.lastChild.textContent !== n) el.lastChild.textContent = n;
  },
  warnings: []   // dev builds: HUD lines over budget
};
const wordCount = s => String(s).split(/\s+/).filter(Boolean).length;

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
  open() { if (isV2(App.ch)) return; /* v2: the live strip shows notes(); the sheet is retired */ if (!App.mode || !App.mode.notes || Cards.isOpen()) return; App.paused = true; $('sheet').classList.add('on'); $('sh-title').textContent = 'Notes: ' + App.ch.title; this.render(); Snd.click(); },
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

/* v2 layout classes (D4 §6.1, API_v2 §4.5). Only a v2 chapter gets them; legacy chapters keep the 560 px column. */
const Layout = {
  kind() {
    if (Url.projector) return 'projector';
    const w = window.innerWidth || 390, h = window.innerHeight || 780;
    if (w > h && h < 600) return 'phone-land';
    return w >= 1024 ? 'desktop' : w >= 600 ? (h >= w ? 'tablet' : 'desktop') : 'phone';
  },
  apply(ch) {
    const b = document.body, v2 = isV2(ch), k = v2 ? this.kind() : 'legacy';
    $('scr-play').classList.toggle('v2', v2); Stage.layout = k;
    if (!v2) { if (b.dataset.layout) delete b.dataset.layout; return; }
    if (b.dataset.layout !== k) b.dataset.layout = k;
  },
  clear() { $('scr-play').classList.remove('v2'); if (document.body.dataset.layout) delete document.body.dataset.layout; Stage.layout = 'legacy'; }
};

function freshSeed() { return (Date.now() ^ (Math.random() * 1e9)) >>> 0 || 1; }
const App = {
  scr: 'title', mode: null, ch: null, paused: false, seed: null, _o: null,
  go(scr) {
    if (scr !== 'play') Layout.clear();
    document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 'scr-' + scr)); this.scr = scr;
    if (scr === 'menu') Menu.render();
    if (scr === 'play') Stage.resize();
  },
  open(ch) { if (isV2(ch)) { this.playLevel(ch, 0); return; } /* fallback: 00_entry.js wraps open() outermost for v2 */ Cards.open({ cls: 'intro', html: introHTML(ch), buttons: [{ t: 'Back', fn: () => Cards.close() }, { t: 'Begin', primary: true, fn: () => { Cards.close(); this.play(ch); } }] }); },
  /* Options travel only through playLevel: ch99.js wraps App.play(ch) and drops a second argument. */
  playLevel(ch, n, o) { this._o = Object.assign({}, o, { level: n || 0 }); this.play(ch); },
  play(ch) {
    const o = this._o || {}; this._o = null;
    Notes.close(); Cards.close(); { const tc = document.getElementById('toasts'); if (tc) tc.innerHTML = ''; } this.ch = ch; this.mode = null; this.paused = false;
    Shell.prefs(); Layout.apply(ch); if (isV2(ch)) { Strip.reset(); Dock.set([]); }
    this.go('play'); applyTheme(ch.theme);
    $('bar-title').innerHTML = '<span class="n">' + ch.num + '</span>' + ch.title; $('bar-gen').textContent = ''; $('hud').innerHTML = '';
    Stage.resize();
    // Seed: an explicit option, else ?seed= for this unit, else a fresh one for v2 (and in teacher mode, so the seed chip works); a legacy run is never reseeded otherwise
    let s = o.seed != null ? o.seed : Url.unit === ch.id && Url.seed != null ? Url.seed : null;
    if (s == null && (isV2(ch) || Teacher.on)) s = freshSeed();
    if (s != null) { s >>>= 0; seed(s); }
    this.seed = s; Teacher.reset();
    this.mode = ch.mode === 'hunt' ? Hunt : ch;
    if (isV2(ch)) this.mode.start(ch, o); else this.mode.start(ch);
    runHooks(Hooks.play, ch, o);
    if (typeof Events !== 'undefined' && Events.emit) Events.emit('open', { level: o.level || 0 });
  },
  exit() { const ch = this.ch; if (this.mode === Hunt) Hunt.state = 'idle'; if (this.mode && this.mode.stop) this.mode.stop(); this.mode = null; Notes.close(); Cards.close(); runHooks(Hooks.exit, ch); this.go('menu'); }
};

/* Star icons (FCR-5): inline SVG, outline when unearned; the count is in the aria-label. Legacy cards keep their ★ text. */
function starSVG(n, of) {
  of = of || 3; let h = '';
  for (let i = 0; i < of; i++) h += '<svg class="star' + (i < n ? '' : ' off') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.6l2.8 6 6.6.7-4.9 4.5 1.4 6.5L12 17l-5.9 3.3 1.4-6.5-4.9-4.5 6.6-.7z"/></svg>';
  return '<span class="stars-i" role="img" aria-label="' + n + ' of ' + of + ' stars">' + h + '</span>';
}
const Menu = {
  render() {
    let h = '', tot = 0, built = 0;
    PLAN.forEach((p, pi) => {
      // act-aware heading: 'Act 3' when the section has an act number, the name alone when act is null, else the legacy numeral
      h += '<div class="part"><h3>' + (p.act === null ? '' : '<span>' + (p.act != null ? 'Act ' + p.act : ROM[pi]) + '</span>') + p.n + '</h3></div>';
      for (const [id, t, c] of p.c) {
        const ch = REG[id], st = Save.d.stars[id] || 0; tot += st; if (ch) built++;
        const stars = Url.v1 ? '★'.repeat(st) + '<span class="off">' + '★'.repeat(3 - st) + '</span>' : starSVG(st);
        const row = '<button class="chap' + (ch ? '' : ' soon') + (st ? ' won' : '') + '" data-id="' + id + '"' + (ch ? '' : ' aria-disabled="true"') + '><span class="no">' + chNum(id) + '</span><span class="tt"><b>' + t + '</b><i>' + c + '</i></span><span class="st">' + (ch ? stars : 'in preparation') + '</span></button>';
        h += isV2(ch) && ch.levels && ch.levels.length > 1 && !Url.v1 ? '<div class="chap-row">' + row + '<button class="lv-open" data-lv="' + id + '" aria-label="Levels of ' + t + '">Levels</button></div>' : row;
      }
    });
    $('menu-body').innerHTML = h;
    $('menu-stars').textContent = built + ' of ' + ORDER.length + ' chapters ready' + (tot ? '. ' + tot + ' of ' + built * 3 + ' stars earned.' : '. Start anywhere.');
    $('menu-body').querySelectorAll('.chap').forEach(b => b.onclick = () => { const ch = REG[b.dataset.id]; if (!ch) { toast('This chapter is still being written.'); return; } Snd.init(); Snd.resume(); Snd.click(); App.open(ch); });
    $('menu-body').querySelectorAll('.lv-open').forEach(b => b.onclick = () => { Snd.init(); Snd.resume(); Snd.click(); LevelSelect.open(REG[b.dataset.lv]); });
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

/* ---------- Stage additions (API_v2 §4.4): u, layout, zones, hit ---------- */
Object.defineProperty(Stage, 'u', { get() { return Math.min(this.w, 1.2 * this.h); }, configurable: true });   // D4's size unit
Stage.layout = 'legacy';   // 'legacy' | 'phone' | 'phone-land' | 'tablet' | 'desktop' | 'projector'
Stage.zones = { hud: { x: 0, y: 0, w: 1, h: 1 }, thumb: { x: 0, y: 0, w: 1, h: 1 }, graph: null };   // canvas px; hud has no targets, thumb holds actions
Stage.rezone = function () {
  const w = this.w, h = this.h, z = this.zones, ty = Math.round(h * 0.65), st = $('strip');
  z.hud = { x: 0, y: 0, w, h: Math.min(56, h) }; z.thumb = { x: 0, y: ty, w, h: h - ty }; z.graph = null;
  if (this.cv && st && st.classList.contains('open')) {   // the expanded phone strip overlaps the canvas: keep actors out of this rect
    const a = this.cv.getBoundingClientRect(), b = st.getBoundingClientRect(), x0 = Math.max(a.left, b.left), x1 = Math.min(a.right, b.right), y0 = Math.max(a.top, b.top), y1 = Math.min(a.bottom, b.bottom);
    if (x1 > x0 && y1 > y0) z.graph = { x: x0 - a.left, y: y0 - a.top, w: x1 - x0, h: y1 - y0 };
  }
};
Stage.hit = function (x, y, pts, rmin) {   // → index of the nearest centre within max(rmin, p.r), else −1
  const m = rmin == null ? 22 : rmin; let best = -1, bd = Infinity;
  for (let i = 0; i < pts.length; i++) { const p = pts[i]; if (!p) continue; const dx = p.x - x, dy = p.y - y, d = dx * dx + dy * dy, r = Math.max(m, p.r || 0); if (d <= r * r && d < bd) { bd = d; best = i; } }
  return best;
};
{ const _rs = Stage.resize; Stage.resize = function () { if (App.scr === 'play' && isV2(App.ch)) Layout.apply(App.ch); const r = _rs.apply(this, arguments); this.rezone(); return r; }; }

const keyName = k => ({ ' ': 'Space', Spacebar: 'Space', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓' })[k] || (String(k).length === 1 ? String(k).toUpperCase() : String(k));
const sameKey = (a, b) => { const n = s => s === ' ' || s === 'Spacebar' ? 'space' : String(s).toLowerCase(); return n(a) === n(b); };

/* ---------- Dock: the v2 action row, under the strip (never inside #hud) ---------- */
const Dock = {
  items: [], warnings: [],
  set(buttons) {   // [{id, label (≤ 2 words), key, fn, primary, disabled, why, busy, pressed, aria}] or {id, el} for a ready-made control
    const box = $('dock'), a = document.activeElement, had = a && box.contains(a) ? a.dataset.id : null;
    this.items = (buttons || []).map(b => Object.assign({}, b)); box.innerHTML = '';
    for (const b of this.items) {
      const el = b.el || document.createElement('button');
      if (!b.el) { el.type = 'button'; el.addEventListener('click', () => this.press(b)); }
      el.dataset.id = b.id; b._el = el; box.appendChild(el);
    }
    this.paint();
    if (had) { const f = this.items.find(b => b.id === had); if (f) f._el.focus(); }
  },
  update(id, patch) { const b = this.items.find(x => x.id === id); if (b) { Object.assign(b, patch); this.paint(); } },
  paint() {
    const own = this.items.filter(b => !b.el), allOff = own.length > 1 && own.every(b => b.disabled);   // FCR-5: choices never grey out together
    for (const b of own) {
      const el = b._el;
      el.className = 'btn' + (b.primary ? ' primary' : '') + (b.busy || (b.disabled && allOff) ? ' busy' : b.disabled ? ' locked' : '');
      el.textContent = b.label || '';
      if (b.key) { const k = document.createElement('kbd'); k.textContent = keyName(b.key); el.appendChild(k); el.setAttribute('aria-keyshortcuts', keyName(b.key) === 'Space' ? 'Space' : b.key); } else el.removeAttribute('aria-keyshortcuts');
      const attr = (n, v) => v == null ? el.removeAttribute(n) : el.setAttribute(n, v);
      attr('aria-label', b.aria || null); attr('aria-pressed', b.pressed == null ? null : String(!!b.pressed)); attr('aria-disabled', b.disabled ? 'true' : null); attr('title', b.why || null);
      if (Url.dev && wordCount(b.label || '') > 2 && this.warnings.indexOf(b.label) < 0) this.warnings.push(b.label);
    }
  },
  press(b) { if (b.disabled) { if (b.why) toast(b.why); return; } Snd.click(); if (b.fn) b.fn(b); },
  key(k) { const b = this.items.find(x => x.key && !x.el && sameKey(x.key, k)); if (!b) return false; this.press(b); return true; }
};

/* ---------- Strip: the live graphs (D5 decision 10). Polls App.mode.notes() at 2 Hz; never pauses the game ---------- */
const Strip = {
  t: 0, sigs: [], isOpen: false, data: false, _tbl: '',
  init() {
    const g = $('strip-grip'), st = $('strip'); let y0 = 0, h0 = 0, drag = false, down = false;
    if (!g || !g.addEventListener) return;
    g.addEventListener('pointerdown', e => { down = true; drag = false; y0 = e.clientY; h0 = st.offsetHeight; try { g.setPointerCapture(e.pointerId); } catch (_) { } });
    g.addEventListener('pointermove', e => {
      if (!down || !this.phone()) return; const dy = e.clientY - y0; if (!drag && Math.abs(dy) < 6) return; drag = true;
      const max = Math.round($('scr-play').clientHeight * 0.6), h = clamp(h0 - dy, 112, Math.max(112, max));
      st.classList.add('open'); st.style.height = h + 'px';
    });
    const up = () => { if (!down) return; down = false; if (!drag) { this.open(!this.isOpen); return; } const big = st.offsetHeight > 124; if (!big) st.style.height = ''; this.open(big, true); };
    g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
    $('strip-data').onclick = () => this.showData(!this.data);
  },
  phone() { return /^(phone|tablet)$/.test(document.body.dataset.layout || ''); },
  reset() { this.t = 0; this.sigs = []; this._tbl = ''; $('strip-charts').innerHTML = ''; $('strip-table').innerHTML = ''; this.showData(false); this.open(false); },
  tick(dt) { if ((this.t += dt) >= 0.5) { this.t = 0; this.poll(false); } },
  theme() { return typeof Pal !== 'undefined' && Pal.theme ? Pal.theme : document.documentElement.dataset.theme === 'projector' ? 'projector' : 'dusk'; },
  poll(force) {
    const m = App.mode; if (App.scr !== 'play' || !isV2(App.ch) || !m || !m.notes) return;
    const n = m.notes() || {}, cs = n.charts || [], box = $('strip-charts'), th = this.theme();
    if (box.children.length !== cs.length) this.build(cs.length);
    cs.forEach((spec, i) => {
      const fig = box.children[i], cv = fig.lastChild, typed = !!(spec.type && Hooks.chart), cap = spec.title || '';
      if (fig.firstChild.textContent !== cap) { fig.firstChild.textContent = cap; cv.setAttribute('aria-label', cap || 'graph'); }
      fig.classList.toggle('plate', !typed);   // legacy draw(cv, 'paper') charts sit on a paper plate
      fig.classList.toggle('nofold', spec.fold === false);   // hidden while the phone strip is folded (CSS); shown when it opens
      const sig = typed && typeof LiveGraph !== 'undefined' && LiveGraph.sig ? LiveGraph.sig(spec) + '|' + th + '|' + cv.clientWidth + 'x' + cv.clientHeight : null;
      if (!force && sig != null && sig === this.sigs[i]) return;
      this.sigs[i] = sig;
      if (typed) Hooks.chart(cv, spec, th); else if (spec.draw) spec.draw(cv, 'paper');
    });
    if (this.data) this.table(n, cs);
  },
  build(k) {
    const box = $('strip-charts'); box.innerHTML = ''; this.sigs = [];
    for (let i = 0; i < k; i++) {
      const fig = document.createElement('figure'), cap = document.createElement('figcaption'), cv = document.createElement('canvas'); let down = false;
      cv.setAttribute('role', 'img'); fig.append(cap, cv); box.appendChild(fig);
      const fwd = (type, e) => { if (!Hooks.chartPointer) return; const r = cv.getBoundingClientRect(); Hooks.chartPointer(i, type, e.clientX - r.left, e.clientY - r.top, cv); e.preventDefault(); };
      cv.addEventListener('pointerdown', e => { if (Cards.isOpen()) return; down = true; try { cv.setPointerCapture(e.pointerId); } catch (_) { } fwd('down', e); });
      cv.addEventListener('pointermove', e => { if (down) fwd('move', e); });
      const up = e => { if (!down) return; down = false; fwd('up', e); };
      cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    }
  },
  table(n, cs) {   // the data twin behind "Show data": the stats rows, then LiveGraph's table for each typed chart
    let h = (n.stats || []).map(r => '<tr><th scope="row">' + r[0] + '</th><td class="mono">' + r[1] + '</td><td>' + (r[2] || '') + '</td></tr>').join('');
    if (h) h = '<table>' + h + '</table>';
    if (typeof LiveGraph !== 'undefined' && LiveGraph.table) for (const s of cs) if (s.type) h += LiveGraph.table(s);
    if (h !== this._tbl) { this._tbl = h; $('strip-table').innerHTML = h || '<p>Numbers appear once something has happened.</p>'; }
  },
  redraw() { this.poll(true); },
  canvas(i) { const f = $('strip-charts').children[i]; return f ? f.lastChild : null; },
  open(b, keepH) {   // phone and tablet: expand over the canvas (up to 60%) or collapse to 112 px
    const st = $('strip'); this.isOpen = !!b && this.phone();
    st.classList.toggle('open', this.isOpen); if (!this.isOpen || !keepH) st.style.height = '';
    $('strip-grip').setAttribute('aria-expanded', String(this.isOpen)); $('strip-grip').setAttribute('aria-label', this.isOpen ? 'Shrink the graphs' : 'Enlarge the graphs');
    this.sigs = []; Stage.rezone(); if (App.mode) requestFrame(() => this.poll(true));
  },
  toggle() { if (this.phone()) this.open(!this.isOpen); else { const c = this.canvas(0); if (c) { c.tabIndex = -1; c.focus(); } } },
  showData(b) {
    this.data = !!b; this._tbl = ''; const t = $('strip-table'), btn = $('strip-data');
    t.hidden = !this.data; btn.textContent = this.data ? 'Hide data' : 'Show data'; btn.setAttribute('aria-expanded', String(this.data));
    if (this.data && this.phone() && !this.isOpen) this.open(true);
    if (this.data) this.poll(true);
  }
};

/* ---------- Teacher strip and keys (FCR-10): play/pause, step, speed, seed link, reveal, freeze ---------- */
const Teacher = {
  on: Url.teacher && !Url.v1, speed: 1, revealed: false, frozen: false,
  init() {
    if (!this.on) return; document.body.classList.add('teacher');
    $('t-play').onclick = () => this.toggle(); $('t-step').onclick = () => this.step(); $('t-seed').onclick = () => this.copySeed();
    $('t-reveal').onclick = () => this.reveal(); $('t-freeze').onclick = () => this.freeze();
    document.querySelectorAll('#t-speed button').forEach(b => b.onclick = () => this.setSpeed(+b.dataset.s));
    this.sync();
  },
  reset() { this.revealed = false; this.frozen = false; this.sync(); },
  live() { return App.scr === 'play' && !!App.mode && !Cards.isOpen(); },
  emit(type, d) { if (typeof Events !== 'undefined' && Events.emit) Events.emit(type, d || {}); },
  toggle() { if (!this.live()) return; App.paused = !App.paused; this.frozen = false; this.sync(); },
  step() {   // one generation (ch.teacherStep) or one 1/30 s tick, then leave the stage paused
    if (!this.live()) return; App.paused = true;
    try {
      const ch = App.ch; if (ch && typeof ch.teacherStep === 'function') ch.teacherStep(); else App.mode.update(1 / 30);
      if (App.mode && !Cards.isOpen()) { const c = Stage.ctx, w = Stage.w, h = Stage.h; c.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0); runHooks(Hooks.pre, c, w, h); App.mode.draw(c, w, h); runHooks(Hooks.frame, 0, c, w, h); }
      if (isV2(App.ch)) Strip.poll(true);
    } catch (e) { showErr(e); App.mode = null; }
    this.sync();
  },
  setSpeed(n) { this.speed = n === 4 || n === 16 ? n : 1; this.sync(); },
  reveal() { if (this.frozen) { this.frozen = false; App.paused = false; this.revealed = true; } else this.revealed = !this.revealed; this.emit('reveal', { on: this.revealed }); this.sync(); },
  freeze() { if (!this.live()) return; App.paused = true; this.frozen = true; const ch = App.ch; if (ch && typeof ch.freezeAsk === 'function') ch.freezeAsk(); this.emit('freeze'); this.sync(); },
  copySeed() { const ch = App.ch; if (!ch || App.seed == null) return; copyText(Url.link({ unit: ch.id, level: isV2(ch) ? ch.level || 0 : null, seed: App.seed })); toast('Seed link copied.'); },
  key(K) {
    const sp = [1, 4, 16], i = sp.indexOf(this.speed);
    switch (K) {
      case ' ': this.toggle(); return true;
      case 'ArrowRight': this.step(); return true;
      case '[': this.setSpeed(sp[Math.max(0, i - 1)]); return true;
      case ']': this.setSpeed(sp[Math.min(2, i + 1)]); return true;
      case 'S': this.copySeed(); return true;
      case 'R': this.reveal(); return true;
      case 'F': this.freeze(); return true;
    }
    return false;
  },
  sync() {
    if (!this.on || typeof document === 'undefined' || !$('teacher')) return;
    const v2 = isV2(App.ch);
    $('t-play').textContent = App.paused ? 'Play' : 'Pause'; $('t-play').setAttribute('aria-pressed', String(!App.paused));
    $('t-speed').style.display = v2 ? '' : 'none';
    document.querySelectorAll('#t-speed button').forEach(b => { const on = +b.dataset.s === this.speed; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); });
    $('t-seed').textContent = 'seed ' + (App.seed != null ? App.seed : '—'); $('t-seed').disabled = App.seed == null;
    $('t-reveal').setAttribute('aria-pressed', String(this.revealed)); $('t-freeze').setAttribute('aria-pressed', String(this.frozen));
  }
};
function copyText(s) {
  const fall = () => { const t = document.createElement('textarea'); t.value = s; t.setAttribute('readonly', ''); t.style.cssText = 'position:fixed;left:-9999px;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) { } t.remove(); };
  try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(s).catch(fall); return; } } catch (e) { }
  fall();
}

/* ---------- Keys (D4 §8): Hooks.key → teacher keys → global (M, ?, G) → dock keys → App.mode.onKey(key, e) ---------- */
const Keys = {
  down(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    const t = e.target || {}, tag = t.tagName || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || t.isContentEditable) return;   // keys typed into inputs are the input's
    for (let i = 0; i < Hooks.key.length; i++) { try { if (Hooks.key[i](e)) { e.preventDefault(); return; } } catch (err) { Hooks.key.splice(i--, 1); showErr(err); } }
    if (Url.v1) return;
    const k = e.key || '', K = k.length === 1 ? k.toUpperCase() : k, play = App.scr === 'play' && !!App.mode, card = Cards.isOpen(), help = card && !!document.querySelector('#cards .card.help');
    if ((k === ' ' || k === 'Enter') && /^(BUTTON|A|SUMMARY)$/.test(tag)) return;   // let the focused control act
    if (help && (k === 'Escape' || k === '?')) { Cards.close(); return; }
    if (card && k === 'Escape' && document.querySelector('#cards .card.levels, #cards .card.settings')) { Cards.close(); return; }   // popovers close on Escape
    if (card && k === 'Escape' && play && document.querySelector('#cards .card.lvl.v2, #cards .card.end.v2')) { App.exit(); return; }   // a v2 level or end card: back to the notebook (reopening resumes)
    if (play && !card && Teacher.on && Teacher.key(K)) { e.preventDefault(); return; }
    if (K === 'M') { this.mute(); return; }
    if (k === '?') { if (!card) this.help(); return; }
    if (!play || card) return;
    const v2 = isV2(App.ch);
    if (v2 && K === 'G') { Strip.toggle(); e.preventDefault(); return; }
    if (v2 && Dock.key(k)) { e.preventDefault(); return; }
    if (App.mode.onKey) { App.mode.onKey(k, e); if (k === ' ' || /^Arrow/.test(k)) e.preventDefault(); }
  },
  up(e) {   // keyup: Hooks.keyup, then a v2 chapter's onKeyUp(key, e) (a held Space, a released arrow); never under ?v1=1
    if (Url.v1 || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
    const t = e.target || {}, tag = t.tagName || '';
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || t.isContentEditable) return;
    for (let i = 0; i < Hooks.keyup.length; i++) { try { if (Hooks.keyup[i](e)) { e.preventDefault(); return; } } catch (err) { Hooks.keyup.splice(i--, 1); showErr(err); } }
    if (App.scr === 'play' && App.mode && isV2(App.ch) && !Cards.isOpen() && typeof App.mode.onKeyUp === 'function') { App.mode.onKeyUp(e.key || '', e); if (e.key === ' ') e.preventDefault(); }
  },
  mute() {
    Snd.on = !Snd.on; Save.d.snd = Snd.on; Save.save(); Snd.init();
    const sb = $('btn-snd'); if (sb) { sb.textContent = Snd.on ? 'Sound on' : 'Sound off'; sb.setAttribute('aria-pressed', String(Snd.on)); }
    toast(Snd.on ? 'Sound on.' : 'Sound off.');
  },
  help() {   // the keys for this screen: the chapter's map, its dock, then the global and teacher keys
    const ch = App.scr === 'play' && App.mode ? App.ch : null, rows = [], seen = {}, add = (k, d) => { const n = keyName(k); if (!seen[n] && d) { seen[n] = 1; rows.push([n, d]); } };
    if (ch && ch.keys) for (const k in ch.keys) add(k, ch.keys[k]);
    if (isV2(ch)) for (const b of Dock.items) if (b.key) add(b.key, b.label);
    if (Teacher.on && ch) [[' ', 'play or pause'], ['ArrowRight', 'one step'], ['[ ]', 'slower, faster'], ['S', 'copy seed link'], ['R', 'reveal'], ['F', 'freeze and ask']].forEach(r => add(r[0], r[1]));
    add('M', 'sound on or off'); if (isV2(ch)) add('G', 'graphs'); add('?', 'this list');
    Cards.open({ cls: 'help', html: '<h3>Keys</h3><table class="keys">' + rows.map(r => '<tr><th><kbd>' + r[0] + '</kbd></th><td>' + r[1] + '</td></tr>').join('') + '</table>', buttons: [{ t: 'Close', primary: true, fn: () => Cards.close() }] });
  }
};

/* ---------- Level select (D2-2, D4 §6.2): chips L1…, the boss double-outlined; a locked level plays on a second tap ---------- */
const LevelSelect = {
  jump: {},
  open(ch) {
    if (!ch) return; if (!ch.levels || !ch.levels.length) { App.open(ch); return; }
    const lv = (Save.d.lv && Save.d.lv[ch.id]) || [], n = ch.levels.length, done = !!(Save.d.done && Save.d.done[ch.id]);
    const isOpen = i => i === 0 || Teacher.on || done || lv[i - 1] != null, pop = m => (m & 1) + (m >> 1 & 1) + (m >> 2 & 1);
    let next = 0; while (next < n - 1 && lv[next] != null) next++;
    const chips = ch.levels.map((L, i) => '<button class="lvchip' + (i === n - 1 ? ' boss' : '') + (isOpen(i) ? '' : ' locked') + (i === next ? ' next' : '') + '" data-n="' + i + '" aria-label="Level ' + (i + 1) + ': ' + L.name + (isOpen(i) ? ', ' + pop(lv[i] || 0) + ' of 3 stars' : ', locked') + '">L' + (i + 1) + (lv[i] ? '<i>' + pop(lv[i]) + '</i>' : '') + '</button>').join('');
    const box = Cards.open({ cls: 'levels v2', html: '<h3>' + ch.title + '</h3><div class="lvrow">' + chips + '</div><p class="lvline"><span></span> <span class="mins mono"></span></p>', buttons: [{ t: 'Settings', fn: () => Settings.open() }, { t: 'Back', fn: () => Cards.close() }] });
    const line = box.querySelector('.lvline'), show = i => { const L = ch.levels[i]; line.firstChild.textContent = L.name; line.lastChild.textContent = L.minutes ? L.minutes + ' min' : ''; };
    show(next);
    box.querySelectorAll('.lvchip').forEach(b => {
      const i = +b.dataset.n; b.addEventListener('focus', () => show(i)); b.addEventListener('mouseenter', () => show(i));
      b.addEventListener('click', () => {
        if (box.dataset.armed !== '1') return; show(i);
        if (!isOpen(i) && !this.jump[ch.id + i]) { this.jump[ch.id + i] = 1; toast('Finish L' + i + ' first, or tap again to jump.'); return; }
        Snd.click(); Cards.close(); if (typeof Save.migrate === 'function') Save.migrate(ch.id); App.playLevel(ch, i);
      });
    });
  }
};

/* ---------- Settings (Batch 1 engine request): Untimed, Calm, Readable, Left-handed, stored in Save.d.ui ----------
   Reached from the menu footer and the Levels popover. Untimed is read when a level starts, so it applies from the next
   level; the others apply at once. ?calm=1 and ?untimed=1 do the same from a link (playtests). Hidden under ?v1=1. */
const Settings = {
  ROWS: [['unt', 'Untimed', 'No clocks. Takes effect when a level starts.'], ['calm', 'Calm', 'Less motion and no shake.'],
    ['read', 'Readable', 'A plainer font with more space.'], ['lh', 'Left-handed', 'Action buttons in reverse order.']],
  open() {
    if (Url.v1 || !Save.d) return; const ui = Save.d.ui || (Save.d.ui = {});
    const rows = this.ROWS.map(([k, name, what]) => '<div class="setrow"><span><b>' + name + '</b><small>' + what + '</small></span><button type="button" class="tog" data-k="' + k + '" aria-pressed="' + (ui[k] ? 'true' : 'false') + '" aria-label="' + name + '">' + (ui[k] ? 'On' : 'Off') + '</button></div>').join('');
    const box = Cards.open({ cls: 'settings v2', html: '<h3>Settings</h3>' + rows, buttons: [{ t: 'Done', primary: true, fn: () => Cards.close() }] });
    box.querySelectorAll('.tog[data-k]').forEach(b => b.addEventListener('click', () => { if (box.dataset.armed !== '1') return; this.set(b.dataset.k, !ui[b.dataset.k]); b.setAttribute('aria-pressed', String(!!ui[b.dataset.k])); b.textContent = ui[b.dataset.k] ? 'On' : 'Off'; Snd.click(); }));
    return box;
  },
  set(k, on) { const ui = Save.d.ui || (Save.d.ui = {}); ui[k] = on ? 1 : 0; Save.save(); Shell.prefs(); }
};

/* ---------- wiring, called from boot() after Stage.init() ---------- */
const Shell = {
  init() {
    window.addEventListener('keydown', e => Keys.down(e)); window.addEventListener('keyup', e => Keys.up(e));
    Teacher.init(); Strip.init();
    $('lv-btn').onclick = () => { if (App.ch) LevelSelect.open(App.ch); };
    { const sb = $('btn-set'); if (sb) sb.onclick = () => { Snd.init(); Snd.click(); Settings.open(); }; }
    if (Url.untimed && !Url.v1 && Save.d && Save.d.ui && !Save.d.ui.unt) { Save.d.ui.unt = 1; Save.save(); }   // ?untimed=1 (playtests)
    this.prefs(); if (typeof Save.onLoad === 'function') Save.onLoad(() => { this.prefs(); if (App.scr === 'menu') Menu.render(); });
  },
  prefs() {   // body classes from Save.d.ui: readable (Atkinson), calm (no motion), lh (left-handed dock); none under ?v1=1
    const ui = (!Url.v1 && Save.d.ui) || {}, b = document.body;
    b.classList.toggle('readable', !!ui.read); b.classList.toggle('calm', !!ui.calm || Url.calm); b.classList.toggle('lh', !!ui.lh);
  }
};
EXPORT.isV2 = isV2; EXPORT.Layout = Layout; EXPORT.Keys = Keys; EXPORT.LevelSelect = LevelSelect; EXPORT.starSVG = starSVG; EXPORT.Settings = Settings;

function showErr(e) { const el = $('err'); el.style.display = 'block'; el.textContent = 'Something broke: ' + (e && (e.stack || e.message) || e) + '\n(Tap to dismiss.)'; el.onclick = () => el.style.display = 'none'; }
window.addEventListener('error', e => showErr(e.error || e.message));

/* FCR-2: the loop runs on requestAnimationFrame. Under tests/vclock.js without its rAF shim a native rAF never fires inside a
   synchronous __advance, so the loop keeps the legacy 16 ms timer there (both reach the same virtual 40 ms cadence). */
let lastT = performance.now(), nextFrame = null;
function pickFrame() {
  const raf = typeof requestAnimationFrame === 'function', virt = typeof window !== 'undefined' && typeof window.__advance === 'function';
  return raf && !(virt && /\[native code\]/.test(String(requestAnimationFrame))) ? f => requestAnimationFrame(f) : f => setTimeout(f, 16);
}
const stageLive = () => !(App.paused || Cards.isOpen());
function frame() {
  const now = performance.now(), dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now; App.t = (App.t || 0) + dt;
  try {
    if (App.scr === 'title') Title.tick(dt);
    else if (App.scr === 'play' && App.mode) {
      const c = Stage.ctx, v2 = isV2(App.ch); c.setTransform(Stage.dpr, 0, 0, Stage.dpr, 0, 0);
      if (stageLive()) {
        let d = dt;
        for (let i = 0; i < Hooks.dt.length; i++) { try { const r = Hooks.dt[i](d); if (typeof r === 'number' && r >= 0) d = r; } catch (e) { Hooks.dt.splice(i--, 1); showErr(e); } }
        for (let k = v2 ? Teacher.speed : 1; k > 0 && App.mode && stageLive(); k--) App.mode.update(d);   // teacher speed: v2 only
      }
      if (App.mode && stageLive()) { runHooks(Hooks.pre, c, Stage.w, Stage.h); App.mode.draw(c, Stage.w, Stage.h); runHooks(Hooks.frame, dt, c, Stage.w, Stage.h); }
      if (v2 && App.mode) Strip.tick(dt);
    }
  } catch (e) { showErr(e); App.mode = null; }
  (nextFrame || (nextFrame = pickFrame()))(frame);
}

/* small drawing helpers shared by chapters */
function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function font(px, kind, weight) { const f = getComputedStyle(document.body).getPropertyValue(kind === 'd' ? '--fd' : kind === 'm' ? '--fm' : '--fb'); return (weight || '') + ' ' + px + 'px ' + f; }
function ink(c, s, x, y, px, col, align, kind, weight) { c.font = font(px, kind, weight); c.fillStyle = col || '#e8dfc9'; c.textAlign = align || 'left'; c.fillText(s, x, y); }
