/* ================= Chapter: Crossing Over (recombination, mapping, linkage drag) ================= */
const MOMC = '#e0795b', DADC = '#3f9c94', WILDC = '#e08a2e', CROPC = '#5e9a45';
const CH_CROSS = {
  id: 'cross',
  theme: { cab: '#f5f0e8', hud: '#ebe3d6', text: '#2e2620', dim: 'rgba(46,38,32,.68)', line: 'rgba(46,38,32,.2)', acc: '#3a6ea5', hi: '#c0573e', meter: '#5b8c5a', inv: '#f7f3ec' },
  intro: {
    hook: 'Before a sex cell forms, each pair of chromosomes — one from mum, one from dad — lines up and swaps segments. The swap points are crossovers. They are why you are not a copy of either parent’s chromosomes, and why genes sitting close together tend to travel together.',
    how: 'Level 1: tap the gaps between genes to place crossovers and build the best sex cell. Level 2: drag genes onto a chromosome in the order their recombination rates imply. Level 3: breed crops, and pick the rare plant where a crossover cut away a bad gene.',
    goal: 'One star per level.'
  },
  real: 'Thomas Hunt Morgan’s fly lab realised that genes on the same chromosome are inherited together unless a crossover separates them. In 1913 his undergraduate Alfred Sturtevant turned that into the first genetic map: the rarer the recombinants between two genes, the closer they sit. Plant breeders live with the same arithmetic. A resistance gene brought in from a wild relative drags its wild neighbours with it — “linkage drag” — and breaking the link takes many generations of hunting for rare recombinants.',
  maths: 'The recombination frequency between two genes is the share of offspring carrying a new combination. For nearby genes it is close to the distance in map units (1 cM = 1% recombination). For distant genes, two crossovers between them restore the original combination, so the measured frequency undercounts and never exceeds 50%. Under Haldane’s model, r = ½(1 − e^(−2d)) for distance d in Morgans. In level 3, a plant only helps if a crossover fell between two genes 5 cM apart: about 1 offspring in 40.',
  ideas: [
    '<p>A sex cell gets one strand, stitched from both parental chromosomes. Each <b>crossover</b> switches which parent the strand copies from.</p><p>Crossovers are few: usually one to three per chromosome. So the best combination is not always reachable.</p>',
    '<p>Two genes far apart on a chromosome are often separated by a crossover; two genes close together rarely are. So the <b>recombination rate</b> between two genes measures their distance.</p><p>Find the two genes that recombine most: they are the ends. Then fill in the middle.</p>',
    '<p>The wild plant’s resistance gene <b>R</b> sits just 5 map units from a wild gene <b>D</b> that ruins the fruit. Each generation you cross your chosen plant back to the crop. Only a crossover falling in that small gap separates R from D.</p><p>Look for a plant whose orange (wild) segment covers R but stops before D.</p>'
  ],
  POS: [0.12, 0.31, 0.5, 0.69, 0.88],
  PUZ: [{ g: [[1, 1, 0, 0, 0], [0, 0, 1, 1, 1]], k: 1 }, { g: [[1, 0, 0, 1, 1], [0, 1, 1, 0, 0]], k: 2 }, { g: [[1, 0, 1, 0, 1], [0, 1, 0, 1, 0]], k: 2 }],
  GENES: [['y', 'yellow body', 0], ['w', 'white eyes', 1.5], ['v', 'vermilion eyes', 33], ['m', 'miniature wings', 36.1], ['r', 'rudimentary wings', 54.5]],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() {
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 3';
    if (this.lv === 0) { this.pi = 0; this.checks = 0; this.newPuzzle(); }
    else if (this.lv === 1) { this.tok = shuffle(this.GENES.map((g, i) => ({ i, x: null }))); this.tok.forEach((t, j) => t.tray = j); this.drag = null; this.checks = 0; this.hud2(); }
    else { this.gen = 0; this.parent = [[0, 1]]; this.kids = []; this.made = false; this.breed(); this.hud3(); }
  },
  /* level 1 */
  newPuzzle() { this.co = new Set(); this.st = 0; const P = this.PUZ[this.pi]; P.best = this.bestOf(P); this.hud1(); },
  strand(P, co, st) { const out = []; let s = st; for (let j = 0; j < 5; j++) { if (j > 0 && co.has(j - 1)) s = 1 - s; out.push(s); } return out; },
  score(P, co, st) { return this.strand(P, co, st).reduce((a, s, j) => a + P.g[s][j], 0); },
  bestOf(P) { let b = 0; for (let m = 0; m < 16; m++) { const co = new Set([0, 1, 2, 3].filter(i => m >> i & 1)); if (co.size > P.k) continue; for (const st of [0, 1]) b = Math.max(b, this.score(P, co, st)); } return b; },
  hud1() {
    const P = this.PUZ[this.pi];
    HUD.set('<div class="hud-goal"><span><b>Level 1: Build a sex cell</b> — puzzle ' + (this.pi + 1) + ' of 3</span><b id="co-n"></b></div><div class="hud-line" id="co-st"></div><div class="hud-row"><button class="btn" id="co-sw">Take the other strand</button><button class="btn primary" id="co-ck">Check</button></div>');
    $('co-sw').onclick = () => { this.st = 1 - this.st; Snd.click(); this.upd1(); }; $('co-ck').onclick = () => this.check1(); this.upd1();
  },
  upd1() { const P = this.PUZ[this.pi]; $('co-n').textContent = this.co.size + ' of ' + P.k + ' crossover' + (P.k > 1 ? 's' : ''); HUD.line('co-st', 'Tap a gap between two genes to place a crossover. Stars mark good versions of a gene. Your sex cell carries <b>' + this.score(P, this.co, this.st) + '</b> of 5.'); },
  check1() {
    const P = this.PUZ[this.pi], s = this.score(P, this.co, this.st); this.checks++;
    if (s >= P.best) { Snd.star(); toast(P.best === 5 ? 'All five good genes in one sex cell.' : 'Four is the best possible here: with only two crossovers, you can’t reach every alternating gene.'); this.pi++; if (this.pi >= 3) { this.finishLevel(this.checks <= 5, 'You solved the three puzzles with ' + this.checks + ' checks.'); } else this.newPuzzle(); }
    else { Snd.miss(); toast('This sex cell carries ' + s + '. ' + (P.best === 5 ? 'All five are possible.' : 'You can do better than ' + s + '.')); }
  },
  geo1(w, h) { return { x0: 24, x1: w - 24, yM: h * 0.2, yD: h * 0.36, yG: h * 0.66 }; },
  /* level 2 */
  rf(a, b) { const d = Math.abs(this.GENES[a][2] - this.GENES[b][2]) / 100; return 50 * (1 - Math.exp(-2 * d)); },
  hud2() {
    HUD.set('<div class="hud-goal"><span><b>Level 2: Sturtevant’s map</b></span><b id="co-n"></b></div><div class="hud-line">The table gives recombination between each pair of fruit-fly genes, from test crosses. Drag all five genes onto the chromosome in order.</div><div class="hud-row"><button class="btn primary" id="co-ck">Check my map</button></div>');
    $('co-ck').onclick = () => this.check2(); this.upd2();
  },
  upd2() { const n = this.tok.filter(t => t.x != null).length; $('co-n').textContent = n + ' of 5 placed'; $('co-ck').disabled = n < 5; },
  check2() {
    this.checks++; const ord = this.tok.slice().sort((a, b) => a.x - b.x).map(t => t.i), ok = ord.every((v, i) => v === i) || ord.every((v, i) => v === 4 - i);
    if (ok) { Snd.star(); this.finishLevel(this.checks <= 2, 'Order ' + ord.map(i => this.GENES[i][0]).join(' – ') + ', right' + (this.checks === 1 ? ' first time' : ' on check ' + this.checks) + '. Now add up the short hops: y–w, w–v, v–m, m–r make ' + (this.rf(0, 1) + this.rf(1, 2) + this.rf(2, 3) + this.rf(3, 4)).toFixed(0) + '%, but y–r measures only ' + this.rf(0, 4).toFixed(0) + '%. Double crossovers between distant genes hide recombination.'); }
    else { Snd.miss(); toast('Not yet. Which two genes recombine most? Those are the ends.'); }
  },
  geo2(w, h) { return { tx: 14, ty: 12, tw: w - 28, th: h * 0.42, ly: h * 0.62, lx0: 30, lx1: w - 30, trayY: h * 0.86 }; },
  tokPos(t, G, w) { return t.x != null ? { x: t.x, y: G.ly } : { x: w * (0.14 + t.tray * 0.18), y: G.trayY }; },
  down(x, y) { if (this.lv === 1) { const G = this.geo2(Stage.w, Stage.h); for (const t of this.tok) { const p = this.tokPos(t, G, Stage.w); if (Math.hypot(p.x - x, p.y - y) < 26) { this.drag = t; t.dx = x; t.dy = y; return; } } } else this.tap(x, y); },
  move(x, y) { if (this.drag) { this.drag.dx = x; this.drag.dy = y; } },
  up(x, y) { if (!this.drag) return; const G = this.geo2(Stage.w, Stage.h), t = this.drag; this.drag = null; if (Math.abs(y - G.ly) < 60) { t.x = clamp(x, G.lx0, G.lx1); Snd.click(); } else t.x = null; this.upd2(); },
  /* level 3 */
  RP: 40, DP: 45,
  wildAt(chr, x) { let s = 0; for (const [p, v] of chr) if (p <= x) s = v; return s; },
  gamete(chr) { // chr: list of [start, wild?] breakpoints; crossover with an all-crop homolog
    const n = poisson(1.0), cps = []; for (let i = 0; i < n; i++) cps.push(R() * 100); cps.sort((a, b) => a - b);
    let onM = R() < 0.5; const pts = [0, ...cps], out = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = i + 1 < pts.length ? pts[i + 1] : 100; if (onM) { out.push([a, this.wildAt(chr, a)]); for (const [p, v] of chr) if (p > a && p < b) out.push([p, v]); } else out.push([a, 0]); onM = !onM; }
    const clean = []; for (const s of out) if (!clean.length || last(clean)[1] !== s[1]) clean.push(s); return clean;
  },
  breed() { this.kids = []; for (let i = 0; i < 20; i++) this.kids.push(this.gamete(this.parent)); this.gen++; },
  wildLen(chr) { let L = 0; for (let i = 0; i < chr.length; i++) if (chr[i][1]) L += (i + 1 < chr.length ? chr[i + 1][0] : 100) - chr[i][0]; return L; },
  hud3() { HUD.set('<div class="hud-goal"><span><b>Level 3: Linkage drag</b></span><b id="co-n"></b></div><div class="hud-line" id="co-st"></div>'); this.upd3(); },
  upd3() { $('co-n').textContent = 'generation ' + this.gen + ' of 6'; HUD.line('co-st', this.made ? 'Done.' : 'Twenty offspring from your last pick. Orange is wild chromosome, green is crop. Tap a plant that carries <b>R</b> to breed from, or the one that has R without <b>D</b>.'); },
  geo3(w, h) { const cols = 2, rows = 10, cw = (w - 30) / cols, rh = (h - 44) / rows; return { cols, rows, cw, rh, x0: 15, y0: 34 }; },
  tap(x, y) {
    if (this.lv === 0) { const G = this.geo1(Stage.w, Stage.h); if (y < G.yM - 20 || y > G.yD + 20) return; const P = this.PUZ[this.pi]; for (let j = 0; j < 4; j++) { const gx = G.x0 + (this.POS[j] + this.POS[j + 1]) / 2 * (G.x1 - G.x0); if (Math.abs(x - gx) < (G.x1 - G.x0) * 0.09) { if (this.co.has(j)) this.co.delete(j); else if (this.co.size < P.k) this.co.add(j); else { toast('Only ' + P.k + ' crossover' + (P.k > 1 ? 's' : '') + ' here. Tap one to remove it.'); return; } Snd.click(); this.upd1(); return; } } }
    if (this.lv === 2 && !this.made) {
      const G = this.geo3(Stage.w, Stage.h), col = Math.floor((x - G.x0) / G.cw), row = Math.floor((y - G.y0) / G.rh), i = row * G.cols + col; if (col < 0 || col >= G.cols || row < 0 || row >= G.rows || !this.kids[i]) return;
      const k = this.kids[i], hasR = this.wildAt(k, this.RP), hasD = this.wildAt(k, this.DP);
      if (!hasR) { Snd.miss(); toast('That plant lost R. Pick one that still carries resistance.'); return; }
      if (!hasD) { this.made = true; Snd.star(); this.win = { gen: this.gen, drag: this.wildLen(k) }; this.upd3(); setTimeout(() => { if (App.mode === this) this.finishLevel(true, 'In generation ' + this.gen + ' you found a plant with R but not D. A crossover had fallen in the 5-unit gap between them: about 1 offspring in 40 is like that.'); }, 900); return; }
      if (this.gen >= 6) { Snd.miss(); this.made = true; this.upd3(); setTimeout(() => { if (App.mode === this) this.finishLevel(false, 'Six generations passed without a plant that broke the R–D link. Genes 5 units apart are separated in only about one offspring in forty.'); }, 700); return; }
      this.parent = k; Snd.click(); this.breed(); this.upd3();
    }
  },
  finishLevel(pass, note) {
    this.res.push({ lv: this.lv, pass, note }); this.lv++;
    if (this.lv < 3) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const stars = this.res.filter(r => r.pass).length; End.show(this, { stars, title: stars + ' of 3 levels', insight: 'Crossovers shuffle the chromosomes you pass on, so good versions of genes can be brought together — but only a few swaps happen per chromosome, and genes close together rarely get separated. ' + this.res.map(r => r.note).join(' ') }); }
  },
  update() { },
  draw(c, w, h) {
    c.fillStyle = '#f8f3ea'; c.fillRect(0, 0, w, h);
    if (this.lv === 0) {
      const G = this.geo1(w, h), P = this.PUZ[this.pi]; if (!P) return; const X = f => G.x0 + f * (G.x1 - G.x0);
      const chrom = (y, col, lab) => { c.fillStyle = col; rrect(c, G.x0, y - 11, G.x1 - G.x0, 22, 11); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(X(0.4), y, 5, 11, 0, 0, TAU); c.fill(); ink(c, lab, G.x0, y - 18, 12, 'rgba(46,38,32,.7)', 'left', 'b', 'italic'); };
      chrom(G.yM, MOMC, 'from mum'); chrom(G.yD, DADC, 'from dad');
      for (let j = 0; j < 5; j++) for (const [s, y] of [[0, G.yM], [1, G.yD]]) { const good = P.g[s][j]; if (good) { c.fillStyle = '#f4c542'; c.font = font(18, 'b'); c.textAlign = 'center'; c.fillText('★', X(this.POS[j]), y + 6); } else { c.fillStyle = 'rgba(30,20,15,.35)'; c.beginPath(); c.arc(X(this.POS[j]), y, 3, 0, TAU); c.fill(); } }
      for (let j = 0; j < 5; j++) ink(c, 'ABCDE'[j], X(this.POS[j]), G.yD + 32, 13, '#2e2620', 'center', 'd', 600);
      for (let j = 0; j < 4; j++) { const gx = X((this.POS[j] + this.POS[j + 1]) / 2); if (this.co.has(j)) { c.strokeStyle = '#3a6ea5'; c.lineWidth = 4; c.beginPath(); c.moveTo(gx - 12, G.yM); c.lineTo(gx + 12, G.yD); c.moveTo(gx + 12, G.yM); c.lineTo(gx - 12, G.yD); c.stroke(); } else { c.strokeStyle = 'rgba(58,110,165,.3)'; c.setLineDash([3, 4]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx, G.yM + 12); c.lineTo(gx, G.yD - 12); c.stroke(); c.setLineDash([]); } }
      const sd = this.strand(P, this.co, this.st); ink(c, 'your sex cell', G.x0, G.yG - 20, 13, 'rgba(46,38,32,.75)', 'left', 'b', 'italic');
      for (let j = 0; j < 5; j++) { const a = j === 0 ? G.x0 : X((this.POS[j - 1] + this.POS[j]) / 2), b = j === 4 ? G.x1 : X((this.POS[j] + this.POS[j + 1]) / 2); c.fillStyle = sd[j] ? DADC : MOMC; c.fillRect(a, G.yG - 11, b - a, 22); if (P.g[sd[j]][j]) { c.fillStyle = '#f4c542'; c.font = font(18, 'b'); c.textAlign = 'center'; c.fillText('★', X(this.POS[j]), G.yG + 6); } }
      ink(c, this.score(P, this.co, this.st) + ' of 5 good', G.x1, G.yG + 36, 15, '#2e2620', 'right', 'd', 600);
    } else if (this.lv === 1) {
      const G = this.geo2(w, h), n = 5, cw = G.tw / (n + 0.6), ch = Math.min(28, G.th / (n + 0.5));
      for (let i = 0; i < n; i++) { ink(c, this.GENES[i][0], G.tx + cw * (i + 1.1), G.ty + ch * 0.8, 15, '#3a6ea5', 'center', 'd', 600); ink(c, this.GENES[i][0], G.tx + cw * 0.35, G.ty + ch * (i + 1.8), 15, '#3a6ea5', 'center', 'd', 600); }
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const x = G.tx + cw * (j + 1.1), y = G.ty + ch * (i + 1.8); if (i === j) ink(c, '—', x, y, 12, 'rgba(46,38,32,.3)', 'center', 'm'); else if (j > i) { const v = this.rf(i, j); c.fillStyle = 'rgba(58,110,165,' + (v / 50 * 0.5) + ')'; c.fillRect(x - cw / 2 + 2, y - ch * 0.7, cw - 4, ch - 3); ink(c, v.toFixed(1) + '%', x, y, 12, '#2e2620', 'center', 'm'); } }
      c.strokeStyle = '#8a7f72'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(G.lx0, G.ly); c.lineTo(G.lx1, G.ly); c.stroke();
      ink(c, 'X chromosome', G.lx0, G.ly - 16, 12, 'rgba(46,38,32,.7)', 'left', 'b', 'italic'); ink(c, 'drag genes here', w / 2, G.trayY - 30, 12, 'rgba(46,38,32,.55)', 'center', 'b', 'italic');
      for (const t of this.tok) { const p = this.drag === t ? { x: t.dx, y: t.dy } : this.tokPos(t, G, w); c.fillStyle = '#3a6ea5'; c.beginPath(); c.arc(p.x, p.y, 18, 0, TAU); c.fill(); ink(c, this.GENES[t.i][0], p.x, p.y + 6, 17, '#fff', 'center', 'd', 600); if (t.x == null && this.drag !== t) ink(c, this.GENES[t.i][1].split(' ')[0], p.x, p.y + 34, 10, 'rgba(46,38,32,.6)', 'center', 'b'); }
    } else {
      const G = this.geo3(w, h), X0 = f => f / 100;
      ink(c, 'R: resistance (keep)', 15, 20, 12, '#2e2620', 'left', 'b', 600); ink(c, 'D: bitter fruit (lose)', w - 15, 20, 12, '#a8263f', 'right', 'b', 600);
      this.kids.forEach((k, i) => {
        const col = i % G.cols, row = (i / G.cols) | 0, x = G.x0 + col * G.cw + 6, y = G.y0 + row * G.rh + G.rh * 0.25, bw = G.cw - 16, bh = Math.max(7, G.rh * 0.42);
        for (let s = 0; s < k.length; s++) { const a = k[s][0], b = s + 1 < k.length ? k[s + 1][0] : 100; c.fillStyle = k[s][1] ? WILDC : CROPC; c.fillRect(x + bw * a / 100, y, bw * (b - a) / 100, bh); }
        const rx = x + bw * this.RP / 100, dx = x + bw * this.DP / 100; c.fillStyle = '#2e2620'; c.fillRect(rx - 1, y - 3, 2, bh + 6); c.fillStyle = '#a8263f'; c.fillRect(dx - 1, y - 3, 2, bh + 6);
        const good = this.wildAt(k, this.RP) && !this.wildAt(k, this.DP); if (this.made && good) { c.strokeStyle = '#3a6ea5'; c.lineWidth = 2; c.strokeRect(x - 3, y - 5, bw + 6, bh + 10); }
      });
    }
  },
  notes() {
    const rows = [['Level', (this.lv + 1) + ' of 3', '']];
    if (this.lv === 0) { const P = this.PUZ[this.pi]; if (P) rows.push(['Best possible here', P.best + ' of 5', 'Computed over every allowed placement of crossovers.'], ['Crossovers allowed', P.k + '', 'Real chromosomes usually get one to three, and a crossover makes another nearby less likely (interference).']); }
    if (this.lv === 1) for (let i = 0; i < 4; i++) rows.push([this.GENES[i][0] + ' – ' + this.GENES[i + 1][0], this.rf(i, i + 1).toFixed(1) + '%', this.GENES[i][1] + ' to ' + this.GENES[i + 1][1] + '.']);
    if (this.lv === 2) { rows.push(['Distance between R and D', '5 map units', 'A crossover lands in the gap in about 5% of sex cells; half of those keep R.'], ['Chance a given offspring has R without D', 'about 2.5%', 'So among 20 offspring, about 40% of generations produce one.']); if (this.kids.length) rows.push(['Offspring carrying R this generation', this.kids.filter(k => this.wildAt(k, this.RP)).length + ' of 20', 'About half, as Mendel predicts.']); }
    this.res.forEach(r => rows.push(['Level ' + (r.lv + 1), r.pass ? 'passed' : 'not passed', r.note]));
    return { idea: this.ideas[Math.min(2, this.lv)], stats: rows, charts: [] };
  }
};

/* ================= Chapter: The Castaways (founder effect; inbreeding depression and genetic rescue) ================= */
const HAPC = ['#d1495b', '#edae49', '#00798c', '#30638e', '#8a9a5b'], HAPF = [0.4, 0.25, 0.18, 0.12, 0.05];
const CH_CAST = {
  id: 'castaways', L: 80, S: 0.05, HD: 0.2, NM: 10, K: 30, U: 0.2, GROW: 1.8, Q0: 0.2,
  theme: { cab: '#e6eeea', hud: '#d9e5de', text: '#1c302d', dim: 'rgba(28,48,45,.68)', line: 'rgba(28,48,45,.2)', acc: '#c2552d', hi: '#2a6f7a', meter: '#6a8f3a', inv: '#f2f7f4' },
  intro: {
    hook: 'Small populations are ruled by accident. Level 1: a storm blows a few birds from the mainland to an empty island. Level 2: a small, isolated wolf pack is slowly being poisoned by its own relatedness.',
    how: 'Level 1: choose the storm’s size, then tap the mainland flock to strike. Found three islands and watch each grow. Level 2: time passes on its own; tap “Bring a migrant” to let a mainland wolf cross the ice.',
    goal: 'Level 1: make at least two islands whose most common colour differs from the mainland’s. Level 2: keep the pack alive for 60 generations; a second star for doing it with four migrants or fewer.'
  },
  real: 'Founder effects are written into island faunas everywhere, and into human populations too: the Amish of Pennsylvania, descended from a few hundred founders, carry some rare recessive disorders at unusually high frequencies. Florida panthers shrank to about 25 animals by the early 1990s, with kinked tails, heart defects and failing sperm; eight female pumas were brought in from Texas in 1995, and within a decade genetic diversity had roughly doubled and numbers tripled (Johnson et al. 2010). On Isle Royale, a single wolf that crossed the ice in 1997 rescued the pack for a time — until his own descendants became inbred in turn.',
  maths: 'A founding group is a small sample, so its gene frequencies can differ wildly from the source: that is sampling error, the same process as drift. In a small population, relatives inevitably mate, so offspring increasingly inherit two copies of the same ancestral gene. Most harmful mutations are recessive and hidden in carriers; inbreeding exposes them, lowering fitness (inbreeding depression). One migrant brings unrelated copies, and its offspring are carriers rather than sufferers. A classic rule of thumb is about one migrant per generation to keep a small population from drifting apart (Mills and Allendorf 1996).',
  ideas: [
    '<p>A storm picks up whoever happens to be underneath. A <b>few</b> birds are a poor sample of the mainland: rare colours can end up common, common ones can be lost entirely.</p><p>Then the island grows from those founders alone, and drifts further. Small storms make islands that differ from the mainland — and from each other.</p>',
    '<p>Every wolf carries a few harmful versions of genes, usually hidden because they’re <b>recessive</b>: one good copy covers for one bad one. In a small pack everyone is related, so pups increasingly get two copies of the same bad version. That is <b>inbreeding depression</b>.</p><p>A migrant brings unrelated genes. Its pups are carriers, not sufferers. Watch the pack’s health when one arrives.</p>'
  ],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() { if (this.lv === 0) this.begin1(); else this.begin2(); },
  /* level 1 */
  begin1() {
    this.flock = []; for (let i = 0; i < 160; i++) { let r = R(), h = 0; while (h < 4 && r > HAPF[h]) { r -= HAPF[h]; h++; } this.flock.push({ h, x: 0.05 + R() * 0.5, y: 0.1 + R() * 0.75, a: R() * TAU }); }
    this.islands = []; this.size = 1; this.storm = null; this.grow = null; $('bar-gen').textContent = 'level 1 of 2';
    HUD.set('<div class="hud-goal"><span><b>Level 1: Castaways</b></span><b id="ca-n"></b></div><div class="hud-row"><span style="font-size:14px">Storm size</span>' + ['small', 'medium', 'large'].map((t, i) => '<button class="btn" data-z="' + i + '">' + t + '</button>').join('') + '</div><div class="hud-line" id="ca-st"></div>');
    $('hud').querySelectorAll('[data-z]').forEach(b => b.onclick = () => { this.size = +b.dataset.z; Snd.click(); this.upd1(); }); this.upd1();
  },
  rad() { return [0.045, 0.085, 0.15][this.size]; },
  upd1() { $('ca-n').textContent = this.islands.length + ' of 3 islands'; $('hud').querySelectorAll('[data-z]').forEach(b => b.classList.toggle('sel', +b.dataset.z === this.size)); HUD.line('ca-st', this.grow ? 'The island grows from its founders, generation by generation.' : this.islands.length >= 3 ? 'All three islands founded.' : 'Tap the mainland flock to strike with the storm. Birds under it are blown to island ' + (this.islands.length + 1) + '.'); },
  top(counts) { let b = 0; for (let i = 1; i < 5; i++) if (counts[i] > counts[b]) b = i; return b; },
  strike(fx, fy) {
    if (this.grow || this.islands.length >= 3) return; const r = this.rad(), caught = this.flock.filter(b => Math.hypot((b.x - fx) * 1.3, b.y - fy) < r);
    if (caught.length < 2) { toast('Only ' + caught.length + ' bird' + (caught.length === 1 ? '' : 's') + ' under the storm. A colony needs a pair at least; try somewhere busier.'); return; }
    Snd.flood(); this.storm = { x: fx, y: fy, t: 0 };
    const pop = caught.map(b => b.h); this.grow = { pop, gen: 0, t: 0, founders: pop.slice(), hist: [] }; this.upd1();
  },
  step1() { const G = this.grow, N = Math.min(60, Math.round(G.pop.length * 1.8)), nx = []; for (let i = 0; i < N; i++) nx.push(pick(G.pop)); G.pop = nx; G.gen++; },
  counts(pop) { const c = [0, 0, 0, 0, 0]; for (const h of pop) c[h]++; return c; },
  /* level 2 */
  begin2() {
    this.gen = 0; this.mig = 0; this.log = []; this.acc = 0; this.over = false; this.arrive = 0;
    this.pack = []; for (let i = 0; i < 22; i++) this.pack.push(this.wolf(this.Q0, 0.35));
    for (let g = 0; g < 3; g++) this.breed2(); this.gen = 0; this.log = [this.stat2()];
    $('bar-gen').textContent = 'level 2 of 2';
    HUD.set(HUD.meterHTML('Pack health (average fitness)') + '<div class="hud-line" id="ca-st"></div><div class="hud-row"><button class="btn primary" id="ca-mig">Bring a migrant across the ice</button></div>');
    $('ca-mig').onclick = () => this.migrant(); this.upd2();
  },
  wolf(q, hz) { // genome: L deleterious loci (0/1 per copy), NM neutral marker loci (allele ids)
    const g = { d: new Uint8Array(this.L * 2), m: new Uint8Array(this.NM * 2) };
    for (let i = 0; i < this.L * 2; i++) g.d[i] = R() < q ? 1 : 0;
    for (let i = 0; i < this.NM * 2; i++) g.m[i] = hz < 0.5 ? (R() < 0.8 ? 0 : 1 + ((R() * 2) | 0)) : (R() * 8) | 0;
    return this.pheno(g);
  },
  pheno(g) { let w = 1; for (let i = 0; i < this.L; i++) { const k = g.d[2 * i] + g.d[2 * i + 1]; if (k === 2) w *= 1 - this.S; else if (k === 1) w *= 1 - this.HD * this.S; } g.w = w; g.x = 0.62 + R() * 0.3; g.y = 0.2 + R() * 0.6; g.a = R() * TAU; return g; },
  child(a, b) { const g = { d: new Uint8Array(this.L * 2), m: new Uint8Array(this.NM * 2) }; for (let i = 0; i < this.L; i++) { g.d[2 * i] = a.d[2 * i + (R() < 0.5 ? 0 : 1)]; g.d[2 * i + 1] = b.d[2 * i + (R() < 0.5 ? 0 : 1)]; } for (let i = 0; i < this.NM; i++) { g.m[2 * i] = a.m[2 * i + (R() < 0.5 ? 0 : 1)]; g.m[2 * i + 1] = b.m[2 * i + (R() < 0.5 ? 0 : 1)]; } for (const k of [0, 1]) if (R() < this.U) g.d[2 * ((R() * this.L) | 0) + k] = 1; return this.pheno(g); },
  breed2() {
    const P = this.pack; if (P.length < 2) { this.pack = []; return; }
    const w = P.map(x => x.w), wb = mean(w), N = Math.min(this.K, poisson(P.length * this.GROW * wb)), kids = [];
    for (let i = 0; i < N; i++) { const a = P[wpick(w)]; let b = P[wpick(w)], t = 0; while (b === a && t++ < 5) b = P[wpick(w)]; if (a === b) continue; const k = this.child(a, b); k.x = lerp(a.x, b.x, 0.5) + (R() - .5) * 0.05; k.y = lerp(a.y, b.y, 0.5) + (R() - .5) * 0.05; kids.push(k); }
    this.pack = kids; this.gen++;
  },
  stat2() { const P = this.pack; if (!P.length) return { n: 0, w: 0, H: 0, q: 0 }; let het = 0, q = 0; for (const x of P) { for (let i = 0; i < this.NM; i++) if (x.m[2 * i] !== x.m[2 * i + 1]) het++; for (let i = 0; i < this.L * 2; i++) q += x.d[i]; } return { n: P.length, w: mean(P.map(x => x.w)), H: het / (P.length * this.NM), q: q / (P.length * this.L * 2), mig: this.mig }; },
  migrant() { if (this.over || this.lv !== 1) return; const m = this.wolf(0.03, 1); m.x = 0.05; m.y = 0.5; m.mig = 1.5; this.pack.push(m); this.mig++; this.arrive = 1.5; Snd.chime(); toast('A mainland wolf crossed the ice.'); this.upd2(); },
  upd2() { const s = last(this.log) || this.stat2(); HUD.meter(s.w, 0.7, pct(s.w)); HUD.line('ca-st', 'Generation <b>' + this.gen + '</b> of 60. Wolves: <b>' + s.n + '</b>. Migrants brought: <b>' + this.mig + '</b>. Genetic diversity: ' + pct(s.H) + '.'); },
  update(dt) {
    if (this.lv === 0) {
      for (const b of this.flock) { b.a += (R() - .5) * dt * 5; b.x = clamp(b.x + Math.cos(b.a) * dt * 0.05, 0.04, 0.56); b.y = clamp(b.y + Math.sin(b.a) * dt * 0.05, 0.08, 0.86); }
      if (this.storm) { this.storm.t += dt; if (this.storm.t > 1.2) this.storm = null; }
      if (this.grow) { const G = this.grow; G.t += dt; if (G.t > 0.9 && G.gen < 25) { G.t -= 0.12; this.step1(); G.hist.push(this.counts(G.pop)); } if (G.gen >= 25 && G.t > 1.2) { this.islands.push({ founders: G.founders, pop: G.pop, hist: G.hist }); this.grow = null; this.upd1(); if (this.islands.length >= 3) setTimeout(() => { if (App.mode === this) this.end1(); }, 1300); } }
      return;
    }
    if (this.over) return; this.arrive = Math.max(0, this.arrive - dt);
    for (const x of this.pack) { x.a += (R() - .5) * dt * 3; x.x = clamp(x.x + Math.cos(x.a) * dt * 0.03, 0.55, 0.95); x.y = clamp(x.y + Math.sin(x.a) * dt * 0.03, 0.12, 0.88); }
    this.acc += dt; if (this.acc > 1.1) { this.acc = 0; this.breed2(); this.log.push(this.stat2()); this.upd2(); if (!this.pack.length || this.gen >= 60) this.end2(); }
  },
  end1() {
    const mt = this.top(this.counts(this.flock.map(b => b.h))), diff = this.islands.filter(I => this.top(this.counts(I.pop)) !== mt).length, pass = diff >= 2;
    const note = this.islands.map((I, k) => 'Island ' + (k + 1) + ' had ' + I.founders.length + ' founders and ended with ' + this.counts(I.pop).filter(v => v).length + ' of 5 colours.').join(' ') + (pass ? ' Two or more islands ended up dominated by a colour that is not the mainland’s commonest.' : ' Too few islands departed from the mainland: bigger storms bring a fairer sample.');
    this.res.push({ lv: 0, pass, note }); if (pass) Snd.star();
    Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p><p>Nothing was selected here. Every difference between the islands is sampling luck, first in who was blown across and then in who happened to breed.</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.lv = 1; this.beginLevel(); } }] });
  },
  end2() {
    this.over = true; const s = last(this.log), alive = s.n > 0 && this.gen >= 60, stars2 = alive ? (this.mig <= 4 ? 2 : 1) : 0;
    const note = alive ? 'The pack survived 60 generations with ' + this.mig + ' migrant' + (this.mig === 1 ? '' : 's') + '. Health ended at ' + pct(s.w) + '.' : 'The pack died out in generation ' + this.gen + '.';
    this.res.push({ lv: 1, pass: stars2 > 0, stars: stars2, note });
    const stars = (this.res[0].pass ? 1 : 0) + stars2;
    End.show(this, { stars, title: alive ? 'The pack survived' : 'The pack is gone', insight: note + ' ' + this.res[0].note.split('. ')[0] + '. Small populations suffer twice: chance decides which genes they keep, and relatedness exposes hidden harmful recessives. In a pack this small, mildly harmful versions drift to fixation because selection can barely see them, and purging cannot remove what everyone carries. A migrant’s pups carry unrelated copies that mask them, and the slide stalls. That is genetic rescue, and it has saved real populations, from Florida panthers to Isle Royale’s wolves.', leg: legP([['#6a8f3a', 'health'], ['#2a6f7a', 'genetic diversity'], ['#c2552d', 'migrants (ticks)']]), chart: cv => this.chart(cv, 'paper'), cap: 'The wolf pack, generation by generation.' });
  },
  chart(cv, th) { const L = this.log, marks = []; for (let i = 1; i < L.length; i++) if (L[i].mig > L[i - 1].mig) marks.push(i); lineChart(cv, { theme: th, series: [{ d: L.map(s => s.w), c: '#6a8f3a' }, { d: L.map(s => s.H), c: '#2a6f7a', dash: [4, 3] }], marks, y0: 0, y1: 1, fy: v => pct(v), x0l: 'gen 0', xl: 'gen ' + (L.length - 1) }); },
  pie(c, x, y, r, counts) { const tot = counts.reduce((a, b) => a + b, 0) || 1; let a0 = -Math.PI / 2; counts.forEach((v, i) => { if (!v) return; const a1 = a0 + v / tot * TAU; c.fillStyle = HAPC[i]; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, a0, a1); c.closePath(); c.fill(); a0 = a1; }); c.strokeStyle = 'rgba(28,48,45,.4)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); },
  draw(c, w, h) {
    const sea = c.createLinearGradient(0, 0, w, 0); sea.addColorStop(0, '#9cc4c8'); sea.addColorStop(1, '#6fa3ad'); c.fillStyle = sea; c.fillRect(0, 0, w, h);
    if (this.lv === 0) {
      const H = h * 0.78; c.fillStyle = '#c8b98a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * 0.6, 0); c.quadraticCurveTo(w * 0.66, H * 0.5, w * 0.6, H); c.lineTo(0, H); c.fill(); c.fillStyle = '#8fae6a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(w * 0.58, 0); c.quadraticCurveTo(w * 0.64, H * 0.5, w * 0.58, H - 4); c.lineTo(0, H - 4); c.fill();
      c.fillStyle = '#c8b98a'; c.beginPath(); c.ellipse(w * 0.84, H * 0.45, w * 0.12, H * 0.2, 0, 0, TAU); c.fill(); c.fillStyle = '#8fae6a'; c.beginPath(); c.ellipse(w * 0.84, H * 0.45, w * 0.105, H * 0.18, 0, 0, TAU); c.fill();
      for (const b of this.flock) { c.fillStyle = HAPC[b.h]; c.beginPath(); c.ellipse(b.x * w, b.y * H, 4.2, 3, b.a, 0, TAU); c.fill(); }
      if (this.storm) { const k = this.storm.t / 1.2; c.fillStyle = 'rgba(60,70,80,' + (0.55 * (1 - k)) + ')'; c.beginPath(); c.ellipse(this.storm.x * w, this.storm.y * H, this.rad() * w / 1.3 + k * 20, this.rad() * H + k * 20, 0, 0, TAU); c.fill(); }
      if (this.grow) { const cts = this.counts(this.grow.pop); let k = 0; cts.forEach((v, i) => { for (let j = 0; j < v; j++, k++) { const a = k * 2.4, r = Math.sqrt(k) * 3.4; c.fillStyle = HAPC[i]; c.beginPath(); c.arc(w * 0.84 + Math.cos(a) * r, H * 0.45 + Math.sin(a) * r, 2.6, 0, TAU); c.fill(); } }); ink(c, 'generation ' + this.grow.gen, w * 0.84, H * 0.45 + H * 0.2 + 16, 12, '#1c302d', 'center', 'b', 'italic'); }
      else if (!this.islands.length) ink(c, 'empty island', w * 0.84, H * 0.45 + 4, 12, 'rgba(28,48,45,.6)', 'center', 'b', 'italic');
      c.fillStyle = 'rgba(242,247,244,.85)'; c.fillRect(0, H, w, h - H);
      const py = H + (h - H) / 2 - 6, pr = Math.min(22, (h - H) / 2 - 12);
      this.pie(c, w * 0.14, py, pr, this.counts(this.flock.map(b => b.h))); ink(c, 'mainland', w * 0.14, py + pr + 14, 11, '#1c302d', 'center', 'b');
      for (let k = 0; k < 3; k++) { const I = this.islands[k], x = w * (0.4 + k * 0.2); if (I) { this.pie(c, x, py, pr, this.counts(I.pop)); ink(c, 'island ' + (k + 1) + ' (' + I.founders.length + ')', x, py + pr + 14, 11, '#1c302d', 'center', 'b'); } else { c.strokeStyle = 'rgba(28,48,45,.25)'; c.setLineDash([3, 3]); c.beginPath(); c.arc(x, py, pr, 0, TAU); c.stroke(); c.setLineDash([]); } }
      return;
    }
    c.fillStyle = '#e9f2f5'; c.fillRect(0, 0, w * 0.45, h); c.strokeStyle = 'rgba(160,190,200,.6)'; for (let i = 0; i < 18; i++) { c.beginPath(); c.moveTo(i * 23 % (w * 0.45), (i * 53) % h); c.lineTo(i * 23 % (w * 0.45) + 14, (i * 53) % h + 4); c.stroke(); }
    ink(c, 'ice bridge from the mainland', w * 0.22, 20, 12, 'rgba(28,48,45,.7)', 'center', 'b', 'italic');
    c.fillStyle = '#5f7f4a'; c.beginPath(); c.ellipse(w * 0.75, h * 0.5, w * 0.24, h * 0.42, 0, 0, TAU); c.fill(); c.fillStyle = '#4b6b3a'; for (let i = 0; i < 30; i++) { c.beginPath(); c.arc(w * (0.58 + (i * 37 % 34) / 100), h * (0.15 + (i * 53 % 70) / 100), 6, 0, TAU); c.fill(); }
    for (const x of this.pack) { const px = x.x * w, py = x.y * h, sick = 1 - x.w; c.save(); c.translate(px, py); c.rotate(x.a); c.fillStyle = css(mix([150, 150, 150], [110, 90, 80], clamp(sick * 1.5, 0, 1))); c.beginPath(); c.ellipse(0, 0, 8, 3.8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(8, 0, 3.6, 2.8, 0, 0, TAU); c.fill(); c.strokeStyle = c.fillStyle; c.lineWidth = 2; c.beginPath(); c.moveTo(-7, 0); c.quadraticCurveTo(-11, sick > 0.5 ? 4 : 1, -13, sick > 0.5 ? 6 : 1); c.stroke(); c.restore(); }
    if (this.arrive > 0) { const k = 1 - this.arrive / 1.5; c.fillStyle = '#e7e2d6'; c.beginPath(); c.ellipse(lerp(w * 0.05, w * 0.6, k), h * 0.5, 9, 4, 0, 0, TAU); c.fill(); }
  },
  notes() {
    if (this.lv === 0) { const rows = [['Mainland colours', HAPF.map(pct).join(', '), 'Red, amber, teal, blue, olive.']]; this.islands.forEach((I, k) => rows.push(['Island ' + (k + 1), I.founders.length + ' founders', 'Founders: ' + this.counts(I.founders).join(', ') + '. After 25 generations: ' + this.counts(I.pop).join(', ') + '.'])); return { idea: this.ideas[0], stats: rows, charts: [] }; }
    const s = last(this.log) || this.stat2();
    return { idea: this.ideas[1], stats: [['Generation', this.gen + ' of 60', ''], ['Wolves', s.n + '', 'The island can hold 30.'], ['Health (average fitness)', pct(s.w), 'Each harmful version costs 5% in two copies and 1% in one. Eighty genes add up, and in a pack this small, selection can barely see such mild effects.'], ['Harmful copies per gene', pct(s.q), 'Share of gene copies that are harmful versions.'], ['Genetic diversity', pct(s.H), 'Share of marker genes where a wolf carries two different versions. Mainland wolves: about 88%.'], ['Migrants brought', this.mig + '', '']], charts: this.log.length > 1 ? [{ title: 'Health and diversity', leg: legP([['#6a8f3a', 'health'], ['#2a6f7a', 'diversity']]), draw: cv => this.chart(cv, 'paper') }] : [] };
  }
};
CH_CAST.tap = function (x, y) { if (this.lv === 0) { const H = Stage.h * 0.78; if (y < H && x < Stage.w * 0.6) this.strike(x / Stage.w, y / H); } };
