/* ================= Chapter: The Meadow (pollination syndromes; Darwin's orchid) ================= */
const FCOL = { white: '#f4f1e6', yellow: '#e8c33a', blue: '#5a7fd0', red: '#d0373f' };
const VIS = {
  bee: { name: 'bumblebees', night: false, col: { white: 0.6, yellow: 0.8, blue: 1, red: 0.15 }, sh: [0.6, 1, 0.35], nec: 1.3, eff: [0.5, 1, 0.6], k: 0.85 },
  fly: { name: 'hoverflies', night: false, col: { white: 0.9, yellow: 1, blue: 0.4, red: 0.1 }, sh: [1, 0.4, 0.05], nec: 1.05, eff: [0.35, 0.3, 0.1], k: 0.3 },
  bird: { name: 'hummingbirds', night: false, col: { white: 0.2, yellow: 0.3, blue: 0.2, red: 1 }, sh: [0.1, 0.5, 1], nec: 1.8, eff: [0.2, 0.6, 1], k: 0.7 },
  moth: { name: 'hawkmoths', night: true, col: { white: 1, yellow: 0.5, blue: 0.2, red: 0.1 }, sh: [0.1, 0.4, 1], nec: 1.5, eff: [0.2, 0.5, 1], k: 0.8 },
  rob: { name: 'nectar robbers', night: false }
};
const MEADOWS = [
  { name: 'Alpine meadow', ab: { bee: 1.0, fly: 1.2, bird: 0, moth: 0.1, rob: 0 }, sky: ['#bcd8e8', '#dfeccf'], ground: '#7fa25a' },
  { name: 'Cloud-forest edge', ab: { bee: 0.6, fly: 0.4, bird: 1.0, moth: 0.2, rob: 0.6 }, sky: ['#a9c7b8', '#cfe0c0'], ground: '#4f7d3c' },
  { name: 'Desert at night', ab: { bee: 0.2, fly: 0.2, bird: 0.1, moth: 1.2, rob: 0.1 }, sky: ['#1c2440', '#3a3a52'], ground: '#6d6248' }
];
const SHAPES = ['open dish', 'short tube', 'long tube'];
const CH_MEADOW = {
  id: 'meadow',
  theme: { cab: '#f3f0e3', hud: '#e6ead4', text: '#26301c', dim: 'rgba(38,48,28,.68)', line: 'rgba(38,48,28,.2)', acc: '#c2475a', hi: '#3f7fb0', meter: '#6a9a3a', inv: '#faf8ef' },
  intro: {
    hook: 'A flower is an advertisement and a lock. It must attract animals that will carry its pollen to another flower of its own species — not to a rival species, and not away in a thief’s belly. Level 1: design flowers for three very different pollinator communities. Level 2: an orchid and its moth in an arms race.',
    how: 'Level 1: set colour, shape, opening time and nectar, then bloom. The visit log shows who came and whether they carried your pollen home. You get three seasons per meadow. Level 2: choose your spur length each generation; the moths evolve in reply.',
    goal: 'Level 1: average 85% of the best possible seed set across the three meadows. Level 2: earn 85% of the best each generation. Three stars need 95% in both.'
  },
  real: 'Flowers pollinated by the same kind of animal converge on similar “syndromes”: bee flowers tend to be blue or yellow with landing platforms, hummingbird flowers red and tubular with dilute nectar (hummingbirds learn colours rather than being born preferring red; red may persist partly because bees barely see it: Raven 1972), hawkmoth flowers white, scented, night-opening and long-tubed. Syndromes are tendencies, not rules — many flowers are visited by several kinds of animal — but they reflect real differences in what visitors see, reach and carry. In 1862 Darwin examined the Madagascan orchid Angraecum sesquipedale, whose nectar sits at the bottom of a spur about 30 cm long, and predicted a moth with a tongue long enough to reach it. Xanthopan morganii praedicta was described in 1903; it is now usually ranked as a species of its own, Xanthopan praedicta (Minet et al. 2021). L. Anders Nilsson (1988) showed the mechanism in other orchids: shortening the spur reduced pollen transfer, because moths no longer had to press in deeply. Whether Angraecum’s spur escalated step by step with its moth, or long spurs evolved when plants shifted to already long-tongued moths, is still debated (Wasserthal 1997).',
  maths: 'Level 1: seed set ≈ Σ over visitor types of abundance × attraction to your design × pollen moved per visit × constancy, the chance the visitor’s next flower is your species. Generalists that visit anything waste your pollen on other species. Lots of nectar attracts more visitors but costs you a fifth of your flowers, and long, nectar-rich tubes draw robbers who bite through the base. Level 2: a moth only picks up pollinia if its tongue is shorter than your spur, so pollination ≈ Φ((spur − mean tongue) ÷ 2 cm), while seed production falls by 1.2% per centimetre of spur. Your best spur sits a few centimetres beyond the average tongue — and moth tongues evolve longer in reply, because longer-tongued moths reach more nectar.',
  ideas: ['<p>Every visitor has its own tastes: which colours it sees and likes, which shapes it can reach into, whether it flies by day or night, how much it cares about nectar. And every visitor has its own <b>loyalty</b>: a faithful visitor carries your pollen to another flower like yours; a fickle one drops it on whatever it visits next.</p><p>Read the visit log. It tells you who came, and who was worth having.</p>', '<p>A hawkmoth only picks up your pollen if it has to push its head deep into the flower — that is, if its tongue is <b>shorter</b> than your spur. But moths with longer tongues get more nectar, so over the generations tongues evolve longer. Your spur has to stay ahead, and every centimetre costs you.</p>'],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() { if (this.lv === 0) this.begin1(); else this.begin2(); },
  /* level 1 */
  begin1() {
    this.mi = 0; this.d = { col: 'yellow', sh: 0, night: false, lots: false }; this.results = []; this.newMeadow();
    HUD.set('<div class="hud-goal"><span id="md-mn"></span><b id="md-se"></b></div><div class="hud-row" id="md-opts"></div><div class="hud-line" id="md-st"></div><div class="hud-row"><button class="btn primary" id="md-go">Bloom</button></div>');
    $('md-go').onclick = () => this.bloom(); this.opts(); this.upd1();
  },
  newMeadow() { this.season = 0; this.best = 0; this.log = null; this.anim = null; this.seen = {}; $('bar-gen').textContent = 'level 1 of 2'; },
  opts() {
    const d = this.d, b = (k, t) => '<button class="btn" data-o="' + k + '" style="flex:1 1 44%;min-height:38px;padding:6px 8px">' + t + '</button>';
    $('md-opts').innerHTML = b('col', 'Colour: ' + d.col) + b('sh', 'Shape: ' + SHAPES[d.sh]) + b('night', d.night ? 'Opens at night' : 'Opens by day') + b('lots', d.lots ? 'Lots of nectar' : 'A little nectar');
    $('md-opts').querySelectorAll('[data-o]').forEach(x => x.onclick = () => { if (this.anim) return; const k = x.dataset.o, cols = ['white', 'yellow', 'blue', 'red']; if (k === 'col') d.col = cols[(cols.indexOf(d.col) + 1) % 4]; else if (k === 'sh') d.sh = (d.sh + 1) % 3; else d[k] = !d[k]; Snd.click(); this.opts(); });
  },
  seeds(d, M, detail) {
    const flowers = d.lots ? 0.8 : 1; let tot = 0; const out = [];
    for (const k of ['bee', 'fly', 'bird', 'moth']) { const V = VIS[k], a = M.ab[k] || 0; if (!a || V.night !== d.night) { out.push({ k, visits: 0, good: 0 }); continue; } const pref = V.col[d.col] * V.sh[d.sh] * (d.lots ? V.nec : 1), visits = a * pref * flowers, good = visits * V.eff[d.sh] * V.k; tot += good; out.push({ k, visits, good }); }
    let robbed = 0; if (!d.night && d.sh === 2 && d.lots && M.ab.rob) { robbed = 0.55 * M.ab.rob; tot *= 1 - robbed; }
    out.push({ k: 'rob', visits: robbed ? M.ab.rob * 2 : 0, good: 0, robbed }); return detail ? { tot, out } : tot;
  },
  optimum(M) { let best = 0; for (const col of ['white', 'yellow', 'blue', 'red']) for (let sh = 0; sh < 3; sh++) for (const night of [false, true]) for (const lots of [false, true]) best = Math.max(best, this.seeds({ col, sh, night, lots }, M)); return best; },
  upd1() { const M = MEADOWS[this.mi]; $('md-mn').innerHTML = '<b>' + M.name + '</b>'; $('md-se').textContent = 'season ' + Math.min(this.season + 1, 3) + ' of 3'; HUD.line('md-st', this.anim ? 'Your flowers are open. Watch who comes, and who carries your pollen on to your own species (✓) or wastes it (✗).' : this.log ? this.logText() : 'Design your flower, then bloom. Who lives here is for you to find out.'); $('md-go').disabled = !!this.anim; },
  logText() { const L = this.log, S = Math.round(L.tot * 100); return 'Seed set: <b>' + S + '</b>. ' + L.out.filter(o => o.visits > 0.01).map(o => o.k === 'rob' ? '<b>Robbers</b> bit through ' + pct(o.robbed) + ' of your flowers.' : '<b>' + VIS[o.k].name + '</b>: ' + Math.round(o.visits * 40) + ' visits, ' + Math.round(o.good * 40) + ' carried pollen to your species.').join(' ') + (L.out.every(o => o.visits < 0.01) ? ' Nothing visited.' : ''); },
  bloom() {
    if (this.anim) return; const M = MEADOWS[this.mi], L = this.seeds(this.d, M, true); this.log = L; this.best = Math.max(this.best, L.tot); for (const o of L.out) if (o.visits > 0.01) this.seen[o.k] = 1;
    this.anim = { t: 0, bugs: [] }; for (const o of L.out) { const n = Math.min(14, Math.round(o.visits * 6)); for (let i = 0; i < n; i++) this.anim.bugs.push({ k: o.k, good: R() < (o.visits ? o.good / o.visits : 0), x0: R(), y0: R(), t0: R() * 1.2, tx: 0.2 + R() * 0.6 }); }
    Snd.dawn(); this.upd1();
  },
  update(dt) {
    if (this.lv === 1) return; if (!this.anim) return; this.anim.t += dt; if (this.anim.t < 2.8) return; this.anim = null; this.season++;
    this.upd1(); if (this.season >= 3) { const opt = this.optimum(MEADOWS[this.mi]); this.results.push({ name: MEADOWS[this.mi].name, best: this.best, opt, eff: this.best / opt }); toast(MEADOWS[this.mi].name + ': your best season reached <b>' + pct(Math.min(1, this.best / opt)) + '</b> of the best possible flower.'); this.mi++; if (this.mi >= 3) { this.end1(); return; } this.newMeadow(); this.log = null; }
    this.upd1();
  },
  end1() {
    const eff = mean(this.results.map(r => Math.min(1, r.eff))), pass = eff >= 0.85, great = eff >= 0.95;
    const note = 'Across the three meadows your best flowers reached ' + this.results.map(r => pct(Math.min(1, r.eff))).join(', ') + ' of the best possible. The winning designs differ because the pollinators differ: faithful bumblebees in the mountains, hummingbirds (and robbers) at the forest edge, hawkmoths in the desert night. Hoverflies visit a lot, but here they carry little pollen and waste much of it on other species.';
    this.res.push({ lv: 0, eff, pass, great, note }); if (pass) Snd.star();
    Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.lv = 1; this.beginLevel(); } }] });
  },
  /* level 2: Darwin's orchid */
  begin2() {
    this.gen = 0; this.mu = 18; this.sp = 22; this.hist = []; this.got = 0; this.bestSum = 0; this.anim2 = null; $('bar-gen').textContent = 'level 2 of 2';
    HUD.set('<div class="hud-goal"><span><b>Level 2: Darwin’s orchid</b></span><b id="md-se"></b></div><div class="slider-row"><span>10 cm</span><input type="range" id="md-sp" min="10" max="45" step="0.5" aria-label="Spur length"><span>45 cm</span></div><div class="hud-line" id="md-st"></div><div class="hud-row"><button class="btn primary" id="md-go">Flower</button></div>');
    const sl = $('md-sp'); sl.value = this.sp; sl.oninput = () => { this.sp = +sl.value; this.upd2(); }; $('md-go').onclick = () => this.flower(); this.upd2();
  },
  pay2(L, mu) { return normCdf((L - mu) / 2) * (1 - 0.012 * L); },
  best2(mu) { let bl = 10, bv = 0; for (let L = 10; L <= 45; L += 0.1) { const v = this.pay2(L, mu); if (v > bv) { bv = v; bl = L; } } return [bl, bv]; },
  upd2() { $('md-se').textContent = 'generation ' + Math.min(this.gen + 1, 8) + ' of 8'; const pol = normCdf((this.sp - this.mu) / 2); HUD.line('md-st', this.anim2 ? this.anim2.msg : 'Spur <b>' + this.sp.toFixed(1) + ' cm</b>. The moths’ tongues average <b>' + this.mu.toFixed(1) + ' cm</b>. At this length ' + pct(pol) + ' of visits would pick up your pollinia, and the spur costs you ' + pct(0.012 * this.sp) + ' of your seeds.'); $('md-go').disabled = !!this.anim2; },
  flower() {
    if (this.anim2) return; const v = this.pay2(this.sp, this.mu), [bl, bv] = this.best2(this.mu); this.got += v; this.bestSum += bv; this.hist.push({ sp: this.sp, mu: this.mu, v, bv, bl });
    const pol = normCdf((this.sp - this.mu) / 2), mu0 = this.mu; this.mu += 2.2 * pol + 0.25 * gauss(); if (this.sp < mu0) this.mu += 0.3;
    this.anim2 = { t: 0, msg: 'Pollinated on ' + pct(pol) + ' of visits: ' + pct(v / bv) + ' of the best possible this generation (best spur ' + bl.toFixed(1) + ' cm). Moths that reached your nectar bred more: tongues now average ' + this.mu.toFixed(1) + ' cm.' }; Snd.chime(); this.upd2();
  },
  update2(dt) { if (!this.anim2) return; this.anim2.t += dt; if (this.anim2.t > 3.2) { this.anim2 = null; this.gen++; if (this.gen >= 8) { this.end2(); return; } this.upd2(); } },
  end2() {
    const eff = this.got / this.bestSum, pass = eff >= 0.85, great = eff >= 0.95, H = this.hist;
    this.res.push({ lv: 1, eff, pass, great, note: 'Your spur went from ' + H[0].sp.toFixed(0) + ' to ' + last(H).sp.toFixed(0) + ' cm while the moths’ tongues went from 18 to ' + this.mu.toFixed(0) + ' cm: an arms race in which each side’s adaptation is the other’s new environment.' });
    const stars = (this.res[0].pass ? 1 : 0) + (pass ? 1 : 0) + (this.res[0].great && great ? 1 : 0);
    End.show(this, { stars, title: stars + ' of 3 stars', insight: this.res[0].note + ' ' + last(this.res).note + ' Darwin saw the orchid’s 30 cm spur and predicted its moth forty years before anyone found it; the moth was not seen visiting the orchid until the 1990s (Wasserthal 1997).', leg: legP([['#c2475a', 'your spur'], ['#3f7fb0', 'moths’ average tongue'], ['#6a9a3a', 'best spur for that generation']]), chart: cv => lineChart(cv, { theme: 'paper', series: [{ d: H.map(x => x.sp), c: '#c2475a' }, { d: H.map(x => x.mu), c: '#3f7fb0' }, { d: H.map(x => x.bl), c: '#6a9a3a', dash: [4, 3] }], y0: 10, y1: 45, fy: v => v.toFixed(0) + ' cm', x0l: 'gen 1', xl: 'gen 8' }), cap: 'Spur and tongue lengths, generation by generation.' });
  },
  flowerSprite(c, x, y, s, d) {
    c.save(); c.translate(x, y); c.scale(s, s); c.strokeStyle = '#4f7d3c'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 30); c.lineTo(0, 4); c.stroke(); const fc = FCOL[d.col];
    if (d.sh === 0) { c.fillStyle = fc; for (let k = 0; k < 5; k++) { const a = k / 5 * TAU; c.beginPath(); c.ellipse(Math.cos(a) * 7, Math.sin(a) * 7, 6, 4, a, 0, TAU); c.fill(); } c.fillStyle = '#c98a2a'; c.beginPath(); c.arc(0, 0, 3.5, 0, TAU); c.fill(); }
    else { const L = d.sh === 1 ? 10 : 20; c.fillStyle = fc; c.beginPath(); c.moveTo(-3, 4); c.lineTo(-5, -L); c.quadraticCurveTo(0, -L - 8, 5, -L); c.lineTo(3, 4); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 1; c.stroke(); }
    if (d.lots) { c.fillStyle = 'rgba(255,240,150,.9)'; c.beginPath(); c.arc(0, d.sh ? -2 : 0, 1.8, 0, TAU); c.fill(); }
    c.restore();
  },
  bug(c, k, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (k === 'bee' || k === 'rob') { c.fillStyle = k === 'rob' ? '#1d1d24' : '#e0b030'; c.beginPath(); c.ellipse(0, 0, 6, 4.5, 0, 0, TAU); c.fill(); if (k === 'bee') { c.fillStyle = '#222'; c.fillRect(-1, -4, 2, 8); } c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(-1, -5, 4, 2, -0.4, 0, TAU); c.fill(); }
    else if (k === 'fly') { c.fillStyle = '#d9a02a'; c.beginPath(); c.ellipse(0, 0, 4, 2.5, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(0, -3, 3, 1.5, 0, 0, TAU); c.fill(); }
    else if (k === 'bird') { c.fillStyle = '#2f8a5a'; c.beginPath(); c.ellipse(0, 0, 6, 3.5, 0, 0, TAU); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(6, -1); c.lineTo(14, -1); c.stroke(); c.fillStyle = 'rgba(200,230,210,.6)'; c.beginPath(); c.ellipse(-1, -4, 5, 2, -0.3, 0, TAU); c.fill(); }
    else { c.fillStyle = '#8a7a6a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-12, -6); c.lineTo(-10, 6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, 0); c.lineTo(12, -6); c.lineTo(10, 6); c.closePath(); c.fill(); c.fillStyle = '#6a5a4a'; c.beginPath(); c.ellipse(0, 0, 3, 7, 0, 0, TAU); c.fill(); }
    c.restore();
  },
  draw(c, w, h) {
    if (this.lv === 1) return this.draw2(c, w, h);
    const M = MEADOWS[Math.min(this.mi, 2)], g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, M.sky[0]); g.addColorStop(0.55, M.sky[1]); g.addColorStop(0.56, M.ground); g.addColorStop(1, M.ground); c.fillStyle = g; c.fillRect(0, 0, w, h);
    if (this.mi === 0) { c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(0, h * 0.4); c.lineTo(w * 0.3, h * 0.12); c.lineTo(w * 0.55, h * 0.4); c.lineTo(w * 0.8, h * 0.18); c.lineTo(w, h * 0.4); c.fill(); }
    if (this.mi === 2) { c.fillStyle = '#f3ecd0'; c.beginPath(); c.arc(w * 0.8, h * 0.14, 16, 0, TAU); c.fill(); }
    const r = rng(this.mi * 13 + 1), others = ['white', 'yellow', 'blue', 'red'];
    for (let i = 0; i < 22; i++) { const x = r() * w, y = h * (0.62 + r() * 0.34); this.flowerSprite(c, x, y, 0.8, { col: others[(r() * 4) | 0], sh: (r() * 3) | 0 }); }
    const s = clamp(w / 360, 1, 1.6); for (let i = 0; i < 5; i++) this.flowerSprite(c, w * (0.2 + i * 0.15), h * 0.72 + (i % 2) * 18, s * 1.3, this.d);
    ink(c, 'your flowers are the large ones', w / 2, h * 0.97, 11, this.mi === 2 ? 'rgba(240,240,230,.8)' : 'rgba(38,48,28,.7)', 'center', 'b', 'italic');
    if (this.anim) { const A = this.anim; for (const b of A.bugs) { const k = clamp((A.t - b.t0) / 1.2, 0, 1); if (k <= 0) continue; const tx = w * b.tx, ty = h * 0.7, x = lerp(b.x0 < 0.5 ? -20 : w + 20, tx, k), y = lerp(h * b.y0 * 0.5, ty, k) - Math.sin(k * Math.PI) * 30; this.bug(c, b.k, x, y, s); if (k >= 1 && b.k !== 'rob') ink(c, b.good ? '✓' : '✗', x, y - 12, 12, b.good ? '#2f7a2f' : '#b83240', 'center', 'b', 600); } }
  },
  draw2(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#15202e'); g.addColorStop(1, '#23303a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const cm = (h * 0.7) / 45, ox = w * 0.38, oy = h * 0.12;
    c.fillStyle = '#f4f1e6'; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU - Math.PI / 2; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(a - 0.2) * 38, oy + Math.sin(a - 0.2) * 38); c.lineTo(ox + Math.cos(a) * 48, oy + Math.sin(a) * 48); c.lineTo(ox + Math.cos(a + 0.2) * 38, oy + Math.sin(a + 0.2) * 38); c.fill(); }
    c.strokeStyle = '#d7e8c8'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox, oy + this.sp * cm); c.stroke(); c.fillStyle = 'rgba(255,240,150,.9)'; c.beginPath(); c.arc(ox, oy + this.sp * cm, 4, 0, TAU); c.fill();
    ink(c, 'spur ' + this.sp.toFixed(1) + ' cm', ox + 10, oy + this.sp * cm, 12, '#d7e8c8', 'left', 'm');
    const mx = w * 0.68; this.bug(c, 'moth', mx, oy, 2.2); c.strokeStyle = '#c9a36a'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, oy + 10); c.lineTo(mx, oy + 10 + this.mu * cm); c.stroke();
    ink(c, 'tongue', w - 10, oy + 10 + this.mu * cm - 8, 12, '#e8d4a8', 'right', 'm'); ink(c, this.mu.toFixed(1) + ' cm', w - 10, oy + 10 + this.mu * cm + 8, 12, '#e8d4a8', 'right', 'm');
    for (let v = 10; v <= 45; v += 5) { c.fillStyle = 'rgba(230,230,220,.25)'; c.fillRect(8, oy + v * cm, 12, 1); ink(c, v + '', 24, oy + v * cm + 4, 10, 'rgba(230,230,220,.5)', 'left', 'm'); }
    if (this.hist.length) { const H = this.hist; c.strokeStyle = 'rgba(194,71,90,.6)'; c.lineWidth = 1.5; c.beginPath(); H.forEach((x, i) => { const px = w * 0.55 + i * 10, py = oy + x.sp * cm; if (i) c.lineTo(px, py); else c.moveTo(px, py); }); c.stroke(); }
  },
  notes() {
    if (this.lv === 0) { const M = MEADOWS[Math.min(this.mi, 2)], rows = [['Meadow', M.name, 'Season ' + Math.min(this.season + 1, 3) + ' of 3.'], ['Your best seed set here', Math.round(this.best * 100) + '', 'Your score for a meadow is your best season.']]; for (const k of Object.keys(this.seen)) if (k !== 'rob') { const V = VIS[k]; rows.push([V.name, (V.night ? 'night' : 'day') + ' fliers', 'Loyalty to one flower species: ' + pct(V.k) + '. Pollen moved per visit is highest on a ' + SHAPES[V.eff.indexOf(Math.max(...V.eff))] + '.']); } if (this.seen.rob) rows.push(['Nectar robbers', 'day', 'They bite through long tubes to reach rich nectar, moving no pollen.']); this.results.forEach(r => rows.push([r.name, pct(Math.min(1, r.eff)), 'Best season as a share of the best possible design.'])); return { idea: this.ideas[0], stats: rows, charts: [] }; }
    const [bl] = this.best2(this.mu); return { idea: this.ideas[1], stats: [['Moths’ average tongue', this.mu.toFixed(1) + ' cm', 'Spread: about 2 cm either way.'], ['Visits that pick up your pollinia', pct(normCdf((this.sp - this.mu) / 2)), 'Only moths with tongues shorter than your spur press in deep enough.'], ['Cost of your spur', pct(0.012 * this.sp) + ' of seeds', '1.2% per centimetre.'], ['Best spur against these moths', bl.toFixed(1) + ' cm', '']], charts: this.hist.length ? [{ title: 'The race so far', leg: legP([['#c2475a', 'spur'], ['#3f7fb0', 'tongue']]), draw: (cv, th) => lineChart(cv, { theme: th, series: [{ d: this.hist.map(x => x.sp), c: '#c2475a' }, { d: this.hist.map(x => x.mu), c: '#3f7fb0' }], y0: 10, y1: 45, fy: v => v.toFixed(0), x0l: 'gen 1', xl: 'gen ' + this.hist.length }) }] : [] };
  }
};
CH_MEADOW.update = (function (u) { return function (dt) { if (this.lv === 1) return this.update2(dt); return u.call(this, dt); }; })(CH_MEADOW.update);
