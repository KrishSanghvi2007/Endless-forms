/* ================= Levels 5–8 ================= */
function crossDist(g1, g2) { const pa = g => g === 'AA' ? 1 : g === 'Aa' ? 0.5 : 0, a = pa(g1), b = pa(g2); return [a * b, a * (1 - b) + (1 - a) * b, (1 - a) * (1 - b)]; }
function matingDist(f, rule) { const G = ['AA', 'Aa', 'aa'], out = [0, 0, 0]; let tot = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) { if (rule === 'assort' && i !== j) continue; if (rule === 'dis' && i === j) continue; if (rule === 'self' && i !== j) continue; const w = rule === 'random' ? f[i] * f[j] : rule === 'dis' ? f[i] * f[j] : f[i]; if (!w) continue; tot += w; const d = crossDist(G[i], G[j]); for (let k = 0; k < 3; k++) out[k] += w * d[k]; } return out.map(v => v / (tot || 1)); }
function squareGeo(A) { const L = Math.min(A.w - 90, A.h * 0.56, 380); return { L, x: (A.w - L) / 2 + 14, y: A.y + 42 }; }
function drawSquare(c, G, p, hi, o = {}) {
  const q = 1 - p, L = G.L, tiles = [['AA', 0, 0, p, p], ['Aa', p, 0, q, p], ['Aa', 0, p, p, q], ['aa', p, p, q, q]];
  c.fillStyle = Pal.A; c.fillRect(G.x, G.y - 18, L * p, 12); c.fillStyle = Pal.a; c.fillRect(G.x + L * p, G.y - 18, L * q, 12); c.fillStyle = Pal.A; c.fillRect(G.x - 18, G.y, 12, L * p); c.fillStyle = Pal.a; c.fillRect(G.x - 18, G.y + L * p, 12, L * q);
  ink(c, 'egg: A ' + (L * p > 60 ? '(p)' : ''), G.x + L * p / 2, G.y - 30, 11.5, Pal.ink, 'center', 700); ink(c, 'a', G.x + L * p + L * q / 2, G.y - 30, 11.5, Pal.ink, 'center', 700);
  c.save(); c.translate(G.x - 30, G.y + L * p / 2); c.rotate(-Math.PI / 2); ink(c, 'sperm: A', 0, 0, 11.5, Pal.ink, 'center', 700); c.restore(); c.save(); c.translate(G.x - 30, G.y + L * p + L * q / 2); c.rotate(-Math.PI / 2); ink(c, 'a', 0, 0, 11.5, Pal.ink, 'center', 700); c.restore();
  tiles.forEach(([g, tx, ty, tw, th], k) => { const on = !hi || hi.includes(k); const x = G.x + tx * L, y = G.y + ty * L, w = tw * L, h = th * L; c.globalAlpha = on ? 1 : 0.18; if (g === 'Aa') { c.fillStyle = Pal.A; c.fillRect(x + 1, y + 1, w - 2, (h - 2) / 2); c.fillStyle = Pal.a; c.fillRect(x + 1, y + h / 2, w - 2, (h - 2) / 2); } else { c.fillStyle = g === 'AA' ? Pal.A : Pal.a; c.fillRect(x + 1, y + 1, w - 2, h - 2); } c.globalAlpha = 1; if (on && w > 44 && h > 30) { const v = tw * th; plate(c, x + w / 2 - 34, y + h / 2 - 15, 68, 30, 8, 0.9); ink(c, g === 'AA' ? 'p × p' : g === 'aa' ? 'q × q' : 'p × q', x + w / 2, y + h / 2 - 5, 11, Pal.ink, 'center', 700, 'serif'); ink(c, pct(v), x + w / 2, y + h / 2 + 8, 11, Pal.ink, 'center', 700); } });
}

/* ================= Level 5: Why p²? ================= */
Game.reg({
  id: 'l5', title: 'Why p²?', sub: 'Two independent draws multiply',
  TG: [{ g: 'AA', v: 0.36 }, { g: 'aa', v: 0.04 }, { g: 'AA', v: 0.81 }, { g: 'aa', v: 0.25 }],
  enter() { this.p = 0.5; this.score = 0; this.ti = -1; this.hi = [0]; stepper(this); this.next(); },
  steps: [
    function () { UI.say('Picture <b>every possible offspring</b> as this square. Across the top: the egg’s allele, A with chance <b>p</b> (blue) and a with chance <b>q</b>. Down the side: the sperm’s allele, the same way. An offspring is <b>AA</b> only if <b>both</b> draws are A — the top-left corner, whose area is <b>p × p</b>. Drag p and watch the corner.'); UI.ctl(UI.slider({ label: 'p', min: 0.05, max: 0.95, step: 0.01, value: this.p, fmt: fx2, oninput: v => { this.p = v; } }), UI.row(UI.btn('Play: hit the target', () => this.next(), 'primary'))); },
    function () { this.target(); }
  ],
  target() {
    this.ti++; if (this.ti >= this.TG.length) { finishLevel('l5', this.score >= 4 ? 3 : this.score >= 2 ? 2 : 1, '<p>You hit <b>' + this.score + ' of 4</b> targets first time.</p><p>Two independent draws multiply: an offspring is AA with chance <b>p × p = p²</b> and aa with chance <b>q × q = q²</b>. To make AA 36% you needed p = 0.6, because 0.6 × 0.6 = 0.36.</p>'); return; }
    const T = this.TG[this.ti]; this.hi = T.g === 'AA' ? [0] : [3]; this.first = true; this.tries = 0;
    UI.say('<b>Target ' + (this.ti + 1) + ' of 4:</b> set p so that exactly <b>' + pct(T.v) + '</b> of offspring are <b>' + T.g + '</b>.');
    UI.ctl(UI.slider({ label: 'p', min: 0.05, max: 0.95, step: 0.01, value: 0.5, fmt: fx2, oninput: v => { this.p = v; } }), UI.row(UI.btn('Lock it in', () => this.check(), 'primary'))); this.p = 0.5;
  },
  check() { const T = this.TG[this.ti], v = T.g === 'AA' ? this.p * this.p : (1 - this.p) ** 2, ok = Math.abs(v - T.v) <= 0.012; if (ok) { if (this.first) this.score++; Snd.good(); FX.text(Stage.w / 2, Stage.area().y + 20, 'On target', Pal.good, 20); UI.toast((T.g === 'AA' ? 'p = ' + fx2(this.p) + ', and p × p = ' : 'q = ' + fx2(1 - this.p) + ', and q × q = ') + pct(v) + '.'); this.target(); } else { this.first = false; this.tries++; Snd.bad(); if (this.tries >= 3) { const sol = T.g === 'AA' ? Math.sqrt(T.v) : 1 - Math.sqrt(T.v); this.p = sol; UI.toast('Here’s the answer: p = ' + fx2(sol) + ', because ' + (T.g === 'AA' ? fx2(sol) + ' × ' + fx2(sol) : fx2(1 - sol) + ' × ' + fx2(1 - sol)) + ' = ' + pct(T.v) + '.', 5000); this.target(); return; } UI.toast('That gives ' + pct(v) + '. ' + (v > T.v ? 'Too big' : 'Too small') + ' — adjust p and try again.'); } },
  draw(c) { const A = Stage.area(), G = squareGeo(A); drawSquare(c, G, this.p, this.hi); if (this.ti >= 0 && this.ti < 4) { const T = this.TG[this.ti]; ink(c, 'target: ' + T.g + ' = ' + pct(T.v), A.w / 2, G.y + G.L + 26, 16, Pal.accent, 'center', 700, 'serif'); } }
});

/* ================= Level 6: Why 2pq? ================= */
Game.reg({
  id: 'l6', title: 'Why 2pq?', sub: 'Two routes to a heterozygote',
  enter() { this.score = 0; this.cells = [null, null, null, null]; this.mode = 'board'; this.p = 0.6; this.col = 0; this.done = false; stepper(this); this.next(); },
  board() { const A = Stage.area(), L = Math.min(A.w - 100, A.h * 0.6, 340), x = (A.w - L) / 2 + 20, y = A.y + 46; return { L, x, y, cw: L / 2 }; },
  steps: [
    function () { UI.say('An egg can carry A or a; so can a sperm. That makes <b>four</b> possible pairings. <b>Tap each cell</b> to breed that egg with that sperm.'); },
    function () { quiz(this, 'Look at the board. How many of the four routes produce an <b>Aa</b> beetle?', [['1', 'One'], ['2', 'Two'], ['4', 'Four']], '2', 'A from the egg with a from the sperm — <b>or</b> a from the egg with A from the sperm. Two routes, each with chance p × q.', () => this.next()); },
    function () { this.mode = 'square'; UI.say('Here is the same idea as areas. The two pink-and-blue tiles are the two routes to Aa, each with area <b>p × q</b>. Press <b>Collect the tiles</b> to stack all four into one bar.'); UI.ctl(UI.slider({ label: 'p', min: 0.1, max: 0.9, step: 0.01, value: this.p, fmt: fx2, oninput: v => { if (!this.col) this.p = v; } }), UI.row(this.cb = UI.btn('Collect the tiles', b => { b.disabled = true; this.col = 0.0001; Snd.pop(); }, 'primary'))); },
    function () { UI.say('The four tiles fill one bar of length 1: <span class="fx">p² + pq + pq + q² = <b>p² + 2pq + q²</b> = 1</span>. The heterozygote share is <b>2pq</b> because there are two ways to be one. This bar is the <b>Hardy–Weinberg equation</b>.'); UI.ctl(UI.row(UI.btn('Use it', () => this.next(), 'primary'))); },
    function () { this.mode = 'pred'; this.pred(); }
  ],
  tap(x, y) { if (this.mode !== 'board' || this.si !== 0) return; const B = this.board(), i = Math.floor((x - B.x) / B.cw), j = Math.floor((y - B.y) / B.cw); if (i < 0 || i > 1 || j < 0 || j > 1) return; const k = j * 2 + i; if (this.cells[k]) return; const egg = j === 0 ? 'A' : 'a', sp = i === 0 ? 'A' : 'a'; this.cells[k] = gtOf(egg, sp); Snd.pop(); FX.ring(B.x + (i + 0.5) * B.cw, B.y + (j + 0.5) * B.cw, Pal.ink, 30); if (this.cells.every(Boolean)) setTimeout(() => { if (this.si === 0) this.next(); }, 600); },
  hot() { if (this.mode !== 'board' || this.si !== 0) return []; const B = this.board(); return [0, 1, 2, 3].filter(k => !this.cells[k]).map(k => ({ x: B.x + ((k % 2) + 0.5) * B.cw, y: B.y + (((k / 2) | 0) + 0.5) * B.cw })); },
  pred() {
    const p = 0.3, q = 0.7, opts = shuffle([['ok', hwExp(p)], ['no2', [p * p, p * q, q * q]], ['flat', [p, 0, q]], ['eq', [1 / 3, 1 / 3, 1 / 3]]]);
    UI.say('<b>Forecast:</b> a gene pool has <b>p = 0.3</b>. Which bar shows its offspring?'); const grid = document.createElement('div'); grid.className = 'optgrid';
    opts.forEach(([k, v], i) => { const b = document.createElement('button'); b.className = 'optc'; b.setAttribute('aria-label', 'Option ' + (i + 1)); b.innerHTML = '<div class="mini">' + v.map((x, j) => '<span style="height:' + Math.max(2, x * 66) + 'px;background:' + (j === 1 ? 'linear-gradient(' + Pal.A + ' 50%, ' + Pal.a + ' 50%)' : j === 0 ? Pal.A : Pal.a) + '"><i>' + Math.round(x * 100) + '%</i></span>').join('') + '</div><div style="display:flex;justify-content:space-around;font:600 12px var(--serif)"><span>AA</span><span>Aa</span><span>aa</span></div>'; b.onclick = () => { if (this.done) return; this.done = true; Snd.click(); const ok = k === 'ok'; if (ok) { this.score++; Snd.good(); } else Snd.bad(); UI.say((ok ? '<b>Right.</b> ' : '<b>Not quite.</b> ') + 'p² = 0.09, 2pq = 2 × 0.3 × 0.7 = 0.42, q² = 0.49. ' + (k === 'no2' ? 'That bar forgot the second route: it adds up to only 79%.' : '')); UI.ctl(UI.row(UI.btn('Finish', () => finishLevel('l6', 1 + this.score, '<p>A heterozygote can form two ways, so its share is <b>2pq</b>. The four tiles of the square add up to <span class="fx">(p + q)² = p² + 2pq + q² = 1</span>: <b>the Hardy–Weinberg equation is just the probabilities of drawing two alleles at random from the gene pool.</b></p>'), 'primary'))); }; grid.appendChild(b); });
    UI.ctl(grid);
  },
  update(dt) { if (this.col > 0 && this.col < 1) { this.col = Math.min(1, this.col + dt / 1.6); if (this.col >= 1 && this.si === 2) this.next(); } },
  draw(c) {
    const A = Stage.area();
    if (this.mode === 'board') { const B = this.board(); ink(c, 'sperm A', B.x + B.cw * 0.5, B.y - 14, 12, Pal.ink, 'center', 700); ink(c, 'sperm a', B.x + B.cw * 1.5, B.y - 14, 12, Pal.ink, 'center', 700); ink(c, 'egg A', B.x - 36, B.y + B.cw * 0.5, 12, Pal.ink, 'center', 700); ink(c, 'egg a', B.x - 36, B.y + B.cw * 1.5, 12, Pal.ink, 'center', 700);
      for (let k = 0; k < 4; k++) { const i = k % 2, j = (k / 2) | 0, x = B.x + i * B.cw, y = B.y + j * B.cw; plate(c, x + 3, y + 3, B.cw - 6, B.cw - 6, 12, 0.7); const egg = j ? 'a' : 'A', sp = i ? 'a' : 'A'; token(c, x + 16, y + 16, 9, egg); token(c, x + B.cw - 16, y + 16, 9, sp); if (this.cells[k]) { beetle(c, x + B.cw / 2, y + B.cw * 0.56, B.cw * 0.24, this.cells[k], { lens: 'geno' }); ink(c, this.cells[k], x + B.cw / 2, y + B.cw - 14, 13, Pal.ink, 'center', 700, 'serif'); if (this.cells[k] === 'Aa' && this.si >= 1) { c.strokeStyle = Pal.accent; c.lineWidth = 3; rrect(c, x + 3, y + 3, B.cw - 6, B.cw - 6, 12); c.stroke(); } } else ink(c, 'tap', x + B.cw / 2, y + B.cw / 2, 13, Pal.muted, 'center', 600); } return; }
    const G = squareGeo(A), p = this.p, q = 1 - p, L = G.L, t = easeIO(clamp(this.col, 0, 1)), by = G.y + L + 54, bh = 34;
    if (t <= 0) { drawSquare(c, G, p, null); return; }
    const src = [[0, 0, p, p, 'AA'], [p, 0, q, p, 'Aa'], [0, p, p, q, 'Aa'], [p, p, q, q, 'aa']], dst = [[0, p * p], [p * p, p * q], [p * p + p * q, p * q], [p * p + 2 * p * q, q * q]];
    src.forEach(([sx, sy, sw, sh, g], k) => { const x = lerp(G.x + sx * L, G.x + dst[k][0] * L, t), y = lerp(G.y + sy * L, by, t), w = lerp(sw * L, dst[k][1] * L, t), h = lerp(sh * L, bh, t); if (g === 'Aa') { c.fillStyle = Pal.A; c.fillRect(x + 1, y + 1, w - 2, (h - 2) / 2); c.fillStyle = Pal.a; c.fillRect(x + 1, y + h / 2, w - 2, (h - 2) / 2); } else { c.fillStyle = g === 'AA' ? Pal.A : Pal.a; c.fillRect(x + 1, y + 1, w - 2, h - 2); } });
    if (t >= 1) { const labs = [['p²', 0, p * p], ['2pq', p * p, 2 * p * q], ['q²', p * p + 2 * p * q, q * q]]; labs.forEach(([s, a, w]) => { ink(c, s, G.x + (a + w / 2) * L, by + bh + 18, 20, Pal.ink, 'center', 600, 'serif'); ink(c, pct(w), G.x + (a + w / 2) * L, by - 12, 12, Pal.ink, 'center', 700); }); ink(c, '= 1', G.x + L + 26, by + bh / 2, 18, Pal.ink, 'center', 600, 'serif'); }
  }
});

/* ================= Level 7: One generation ================= */
Game.reg({
  id: 'l7', title: 'One generation', sub: 'Equilibrium in one round of mating',
  POPS: [[20, 0, 20], [32, 0, 8], [0, 40, 0]],
  enter() { this.score = 0; this.ri = -1; this.pred = null; this.anim = null; Lens.set('geno', true); stepper(this); this.next(); },
  lay() { const A = Stage.area(), port = A.w < A.h * 1.1; if (port) { const sz = Math.min(A.w - 80, A.h * 0.5); return { F: { x: 20, y: A.y + 6, w: A.w - 40, h: A.h * 0.28 }, bar: { x: 30, y: A.y + A.h * 0.32 + 6, w: A.w - 60 }, T: Fin.geo((A.w - sz) / 2, A.y + A.h * 0.4 + 30, sz) }; } const sz = Math.min(A.w * 0.4, A.h * 0.7); return { F: { x: 20, y: A.y + 10, w: A.w * 0.45, h: A.h * 0.6 }, bar: { x: 30, y: A.y + A.h * 0.7 + 20, w: A.w * 0.42 }, T: Fin.geo(A.w * 0.52, A.y + 40, sz) }; },
  steps: [
    function () { this.setPop([20, 0, 20]); UI.say('This triangle is a <b>map of every possible population</b>. Each corner is a population of only one genotype. <b>Left to right</b> is the share of a alleles; <b>height</b> is the share of heterozygotes. The <b>green curve</b> is where Hardy–Weinberg proportions sit. The red dot is this population: half AA, half aa, no heterozygotes — on the floor of the triangle.'); UI.ctl(UI.row(UI.btn('Start predicting', () => this.next(), 'primary'))); },
    function () { this.round(); }
  ],
  setPop(c) { this.cnt = c; this.pop = shuffle(countsToList(c)); this.f = frac(c); this.trail = [this.f.slice()]; },
  round() { this.ri++; if (this.ri >= 3) { finishLevel('l7', this.score >= 3 ? 3 : this.score >= 2 ? 2 : 1, '<p>You placed <b>' + this.score + ' of 3</b> populations correctly.</p><p>One round of random mating moves a population <b>straight up or down</b> onto the Hardy–Weinberg curve — and then it stays. It never moves <b>sideways</b>, because mating only reshuffles alleles; it does not change how many of each there are. <b>Sideways motion means allele frequencies are changing: that is evolution.</b> Keep this map in mind for the rest of the game.</p>'); return; }
    if (this.ri > 0) this.setPop(this.POPS[this.ri]); this.pred = null; this.gens = 0; const c = this.cnt;
    UI.say('Population ' + (this.ri + 1) + ' of 3: <b>' + c[0] + ' AA, ' + c[1] + ' Aa, ' + c[2] + ' aa</b>. <b>Tap the triangle</b> where you think it will be after <b>one generation</b> of random mating.'); this.rb = UI.btn('Run one generation', () => this.gen(), 'primary'); this.rb.disabled = true; UI.ctl(UI.row(this.rb));
  },
  tap(x, y) { if (this.si !== 1 || this.gens > 0 || this.anim) return; const L = this.lay(), f = Fin.inv(L.T, x, y); if (!f) return; this.pred = f; Snd.pop(); this.rb.disabled = false; },
  hot() { if (this.si !== 1 || this.gens > 0) return []; const L = this.lay(), p = pOf(this.cnt); return [Fin.pt(L.T, hwExp(p)), Fin.pt(L.T, [0.3, 0.3, 0.4])]; },
  gen() {
    if (this.anim) return; const p = pOf(this.cnt), nc = hwCounts(p, 40), from = this.f.slice(), to = frac(nc); this.anim = { t: 0, from, to }; this.cnt = nc; this.pop = shuffle(countsToList(nc)); this.f = to; this.gens++; Snd.pop(); UI.ctl();
    if (this.gens === 1) { const L = this.lay(), P = Fin.pt(L.T, to), Q = Fin.pt(L.T, this.pred), d = Math.hypot(P.x - Q.x, P.y - Q.y) / L.T.size, ok = d < 0.09; if (ok) this.score++; this.ok = ok; }
  },
  update(dt) { if (this.anim) { this.anim.t += dt / 1.1; if (this.anim.t >= 1) { this.trail.push(this.anim.to.slice()); this.anim = null; this.after(); } } },
  after() {
    const p = pOf(this.cnt), f = this.f;
    if (this.gens === 1) { (this.ok ? Snd.good : Snd.bad).call(Snd); UI.say((this.ok ? '<b>Good call.</b> ' : '<b>Here is where it went.</b> ') + 'After one generation: <b>' + pct(f[0]) + ' AA, ' + pct(f[1]) + ' Aa, ' + pct(f[2]) + ' aa</b> — exactly p², 2pq and q² for p = ' + fx2(p) + '. The dot moved <b>straight ' + (this.ri === 2 ? 'down' : 'up') + '</b> onto the curve. Run another generation.'); UI.ctl(UI.row(UI.btn('Another generation', () => this.gen(), 'primary'))); }
    else { UI.say('It did not move at all. Once on the curve, random mating keeps a population there: <b>equilibrium</b>. And it never moved sideways: <b>p stayed ' + fx2(p) + '</b> the whole time.'); UI.ctl(UI.row(UI.btn(this.ri < 2 ? 'Next population' : 'Finish', () => this.round(), 'primary'))); }
  },
  draw(c) {
    const L = this.lay(), pts = field(40, L.F, 9 + this.ri, { max: 20 }); this.pop.forEach((g, i) => beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { rot: pts[i].rot }));
    genoBar(c, L.bar.x, L.bar.y, L.bar.w, 16, this.anim ? this.anim.from : this.f, { title: 'genotypes' });
    const cur = this.anim ? this.anim.from.map((v, i) => lerp(v, this.anim.to[i], easeIO(this.anim.t))) : this.f;
    Fin.draw(c, L.T, { trail: this.trail.concat([cur]), pts: [{ f: cur, col: Pal.accent, r: 7 }], pred: this.pred });
  }
});

/* ================= Level 8: Equilibrium Island ================= */
const SWITCHES = [['mate', 'Random mating'], ['sel', 'No selection'], ['mut', 'No mutation'], ['mig', 'No migration'], ['big', 'Large population']];
function islandStep(f, sw) {
  let p = f[0] + f[1] / 2;
  if (!sw.mut) p *= 0.97; if (!sw.mig) p = 0.85 * p + 0.15 * 0.1;
  let off = sw.mate ? hwExp(p) : matingDist(hwExp(p).map((v, i) => 0.5 * v + 0.5 * f[i]), 'assort');
  if (!sw.mate) off = matingDist(f, 'assort').map((v, i) => 0.6 * v + 0.4 * hwExp(p)[i]);
  if (!sw.big) { const n = 16, c = [0, 0, 0]; for (let k = 0; k < n; k++) { const u = R(); c[u < off[0] ? 0 : u < off[0] + off[1] ? 1 : 2]++; } off = frac(c); }
  if (!sw.sel) { const w = [1, 1, 0.55], s = off.map((v, i) => v * w[i]), t = s[0] + s[1] + s[2]; off = s.map(v => v / t); }
  return off;
}
Game.reg({
  id: 'l8', title: 'Equilibrium Island', sub: 'The five assumptions and the null model',
  enter() { this.sw = { mate: 1, sel: 1, mut: 1, mig: 1, big: 1 }; this.f = hwExp(0.6); this.trail = [this.f.slice()]; this.run = 0; this.score = 0; this.mi = -1; Lens.set('geno', true); stepper(this); this.next(); },
  lay() { const A = Stage.area(), port = A.w < A.h * 1.1; if (port) { const sz = Math.min(A.w - 80, A.h * 0.5); return { F: { x: 20, y: A.y + 4, w: A.w - 40, h: A.h * 0.26 }, bar: { x: 30, y: A.y + A.h * 0.31, w: A.w - 60 }, T: Fin.geo((A.w - sz) / 2, A.y + A.h * 0.4 + 26, sz) }; } const sz = Math.min(A.w * 0.4, A.h * 0.7); return { F: { x: 20, y: A.y + 10, w: A.w * 0.45, h: A.h * 0.6 }, bar: { x: 30, y: A.y + A.h * 0.72 + 20, w: A.w * 0.42 }, T: Fin.geo(A.w * 0.52, A.y + 40, sz) }; },
  swRow(hidden, locked) { const d = document.createElement('div'); d.className = 'sw'; SWITCHES.forEach(([k, t]) => { const b = document.createElement('button'); b.className = hidden ? '' : this.sw[k] ? 'on' : 'off'; b.textContent = hidden ? '?' : (this.sw[k] ? '✓ ' : '✗ ') + t; if (locked) b.disabled = true; if (!hidden && !locked) b.onclick = () => { Snd.click(); this.sw[k] = this.sw[k] ? 0 : 1; b.className = this.sw[k] ? 'on' : 'off'; b.textContent = (this.sw[k] ? '✓ ' : '✗ ') + t; }; d.appendChild(b); }); return d; },
  steps: [
    function () { UI.say('Hardy–Weinberg makes five assumptions. On this island, all five hold: each switch is green. Run twenty generations and watch the dot.'); UI.ctl(this.swRow(false, true), UI.row(UI.btn('Run 20 generations', b => { b.disabled = true; this.go(20, () => this.next()); }, 'primary'))); },
    function () { UI.say('Nothing moved — not the dot, not p. That is the point of Hardy–Weinberg: it is the <b>null model</b>, what a population looks like when nothing is changing it. Now experiment. Flip any switch and run: watch <b>which way</b> the dot goes.'); UI.ctl(this.swRow(false), UI.row(UI.btn('Run 12 generations', () => { this.trail = [this.f.slice()]; this.go(12); }), UI.btn('Reset the island', () => { this.f = hwExp(0.6); this.trail = [this.f.slice()]; }), UI.btn('Start the mystery rounds', () => this.next(), 'primary'))); },
    function () { this.mystery(); }
  ],
  go(n, done) { this.run = n; this.acc = 0; this.done = done; },
  mystery() {
    this.mi++; if (this.mi >= 4) { finishLevel('l8', this.score >= 4 ? 3 : this.score >= 2 ? 2 : 1, '<p>You diagnosed <b>' + this.score + ' of 4</b> islands from the dot’s movement alone.</p><table><tr><th>Broken assumption</th><th>On the map</th></tr><tr><td>Selection</td><td>slides steadily along the curve</td></tr><tr><td>Migration</td><td>slides toward the migrants’ allele frequency</td></tr><tr><td>Small population</td><td>wanders at random along the curve</td></tr><tr><td>Non-random mating</td><td>drops below the curve; p stays put</td></tr><tr><td>Mutation</td><td>creeps along the curve, very slowly in reality</td></tr></table>'); return; }
    if (this.mi === 0) this.order = shuffle(['sel', 'mig', 'big', 'mate']); const k = this.order[this.mi]; this.sw = { mate: 1, sel: 1, mut: 1, mig: 1, big: 1 }; this.sw[k] = 0; this.secret = k; this.f = hwExp(0.6); this.trail = [this.f.slice()];
    UI.say('<b>Mystery island ' + (this.mi + 1) + ' of 4.</b> One assumption has been secretly broken. Watch the dot for twelve generations.'); UI.ctl(this.swRow(true));
    this.go(12, () => { UI.say('Which assumption was broken?'); UI.ctl(UI.choices(SWITCHES.map(([kk, t]) => [kk, t]), a => { const ok = a === this.secret; if (ok) { this.score++; Snd.good(); } else Snd.bad(); const exp = { sel: 'Selection against aa drove the dot steadily along the curve toward fewer a alleles.', mig: 'Migrants with few a alleles pulled the dot along the curve toward their allele frequency.', big: 'In a tiny population, chance made the dot wander back and forth along the curve.', mate: 'Like-with-like mating dropped the dot <b>below</b> the curve: fewer heterozygotes, same p.' }[this.secret]; UI.say((ok ? '<b>Right.</b> ' : '<b>Not quite:</b> it was <b>' + SWITCHES.find(s => s[0] === this.secret)[1].toLowerCase() + '</b> that was broken. ') + exp); UI.ctl(UI.row(UI.btn('Next island', () => this.mystery(), 'primary'))); })); });
  },
  update(dt) { if (this.run > 0) { this.acc += dt; if (this.acc > 0.28) { this.acc = 0; this.f = islandStep(this.f, this.sw); this.trail.push(this.f.slice()); if (this.trail.length > 40) this.trail.shift(); this.run--; if (this.run === 0 && this.done) { const d = this.done; this.done = null; d(); } } } },
  draw(c) {
    const L = this.lay(), cnt = hwCounts(0, 0), n = 40, c3 = [Math.round(this.f[0] * n), Math.round(this.f[1] * n)]; c3.push(Math.max(0, n - c3[0] - c3[1])); const pop = countsToList(c3), pts = field(pop.length, L.F, 21, { max: 18 }); pop.forEach((g, i) => beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { rot: pts[i].rot }));
    genoBar(c, L.bar.x, L.bar.y, L.bar.w, 16, this.f, { title: 'genotypes  (p = ' + fx2(this.f[0] + this.f[1] / 2) + ')', exp: hwExp(this.f[0] + this.f[1] / 2) });
    Fin.draw(c, L.T, { trail: this.trail, pts: [{ f: this.f, col: Pal.accent, r: 7 }] });
  }
});
