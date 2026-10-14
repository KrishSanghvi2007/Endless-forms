/* ================= Levels 9–13: breaking the equilibrium ================= */
function fieldRect(A, frac0, frac1) { return { x: 20, y: A.y + A.h * frac0, w: A.w - 40, h: A.h * (frac1 - frac0) }; }

/* ================= Level 9: The bird ================= */
Game.reg({
  id: 'l9', title: 'The bird', sub: 'Selection, and why recessives hide',
  enter() { this.score = 0; this.gen = 1; this.qs = [0.5]; this.mode = 'intro'; this.setPop([10, 20, 10]); Lens.show(true, 'phen'); stepper(this); this.next(); },
  setPop(c) { this.pop = shuffle(countsToList(c)); this.alive = this.pop.map(() => true); },
  q() { const c = listCounts(this.pop.filter((g, i) => this.alive[i])); return 1 - pOf(c); },
  steps: [
    function () { quiz(this, 'Hardy–Weinberg assumes <b>no selection</b>. Here a bird hunts beetles, and it can only see <b>colour</b> — phenotype, not genotype. Yellow beetles are easy for it to spot. If the bird takes mostly yellow beetles, which allele becomes rarer?', [['a', 'a'], ['A', 'A'], ['none', 'Neither']], 'a', 'Every yellow beetle eaten removes two a alleles.', () => this.next()); },
    function () { this.mode = 'hunt'; this.bites = 10; this.timer = 12; UI.say('<b>You are the bird.</b> Generation ' + this.gen + ' of 3. Lower the share of a alleles, <b>q</b>, from 0.50 to <b>0.30 or less</b>. Ten bites per generation; tap beetles to eat them. You may peek with the genotype lens, but the bird can’t, so you can only hunt through the phenotype lens.'); UI.ctl(UI.row(UI.btn('Done hunting', () => this.endHunt()))); }
  ],
  tap(x, y) { if (this.mode !== 'hunt') return; const A = Stage.area(), pts = this.fieldPts(A), i = hitList(pts, x, y, k => this.alive[k]); if (i < 0) return; if (Lens.mode === 'geno') { Snd.bad(); UI.toast('The bird sees only colour. Switch to the <b>Phenotype</b> lens to hunt.'); return; } this.alive[i] = false; this.bites--; Snd.pop(); FX.ring(pts[i].x, pts[i].y, Pal.accent, 22); if (this.bites <= 0) this.endHunt(); },
  hot() { if (this.mode !== 'hunt') return []; const pts = this.fieldPts(Stage.area()); return pts.filter((p, i) => this.alive[i]); },
  fieldPts(A) { return field(this.pop.length, fieldRect(A, 0.04, 0.66), 31 + this.gen, { max: 22 }); },
  endHunt() {
    if (this.mode !== 'hunt') return; this.mode = 'review'; const q = this.q(); UI.say('The survivors have <b>q = ' + fx2(q) + '</b>. They breed at random, so their offspring are in Hardy–Weinberg proportions for this <b>new</b> q.');
    UI.ctl(UI.row(UI.btn('Let the survivors breed', () => { const c = hwCounts(1 - q, 40); this.setPop(c); this.qs.push(q); this.gen++; const A = Stage.area(); this.fieldPts(A).forEach((P, i) => { if (i % 5 === 0) FX.ring(P.x, P.y, phenCol(this.pop[i]), 14); }); if (q <= 0.3 + 1e-9 || this.gen > 3) { const ok = q <= 0.3 + 1e-9; if (ok) this.score++; UI.say((ok ? '<b>Goal reached:</b> q = ' + fx2(q) + '. ' : 'Three generations, and q = ' + fx2(q) + '. ') + 'Selection changes allele frequencies by changing who breeds.'); UI.ctl(UI.row(UI.btn('What if you kept going?', () => this.partB(), 'primary'))); } else { this.mode = 'hunt'; this.bites = 10; this.timer = 12; UI.say('Generation <b>' + this.gen + ' of 3</b>, q = ' + fx2(q) + '. Hunt again.'); UI.ctl(UI.row(UI.btn('Done hunting', () => this.endHunt()))); } }, 'primary')));
  },
  partB() { this.mode = 'sim'; Lens.set('phen', true); quiz(this, 'Suppose the bird eats <b>every</b> yellow beetle, every generation, starting from q = 0.5. After <b>20 generations</b>, will the a allele be gone?', [['gone', 'Yes, gone'], ['rare', 'No: rare, but still there'], ['back', 'It bounces back']], 'rare', 'Watch why.', () => { this.simQ = [0.5]; this.simT = 0; this.mode = 'simrun'; UI.say('Every yellow beetle removed, every generation…'); UI.ctl(); }); },
  update(dt) {
    if (this.mode === 'hunt') { this.timer -= dt; if (this.timer <= 0) { this.timer = 12; this.endHunt(); } }
    if (this.mode === 'simrun') { this.simT += dt; if (this.simT > 0.22) { this.simT = 0; const q = last(this.simQ); this.simQ.push(q / (1 + q)); this.setPop(hwCounts(1 - last(this.simQ), 60)); if (this.simQ.length > 20) { this.mode = 'simdone'; const qq = last(this.simQ); Lens.show(true, 'geno'); UI.say('After 20 generations q = <b>' + fx3(qq) + '</b> — small, but not zero, and falling ever more slowly. Look through the genotype lens: almost every a allele left is inside a <b>blue carrier</b>. Of all the a copies, <b>' + pct(1 - qq) + '</b> are in heterozygotes, where the bird cannot see them.'); UI.ctl(UI.row(UI.btn('Finish', () => finishLevel('l9', 1 + this.score, '<p><b>Selection changes allele frequencies</b> by changing who survives and breeds. But selection acts on phenotypes, and a recessive allele shows only in aa. As a recessive allele becomes rare, nearly all its copies hide in heterozygotes — a share equal to p — so selection against it slows to a crawl. That is why harmful recessive alleles linger in populations, where new mutations keep topping them up.</p>'), 'primary'))); } } }
  },
  draw(c) {
    const A = Stage.area();
    if (this.mode === 'simrun' || this.mode === 'simdone') { const pts = field(this.pop.length, fieldRect(A, 0.04, 0.58), 77, { max: 18 }); this.pop.forEach((g, i) => beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { rot: pts[i].rot, ring: this.mode === 'simdone' && g === 'Aa' ? Pal.accent : null })); lineChart(c, 46, A.y + A.h * 0.68, A.w - 80, A.h * 0.2, [{ d: this.simQ, col: Pal.a, wd: 3 }], { n: 21, title: 'q over 20 generations of eating every yellow beetle', yl: ['0', '0.5'] }); return; }
    const pts = this.fieldPts(A); this.pop.forEach((g, i) => { if (this.alive[i]) beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { rot: pts[i].rot }); else { c.fillStyle = hexA(Pal.ink, 0.15); c.beginPath(); c.arc(pts[i].x, pts[i].y, 3, 0, TAU); c.fill(); } });
    lineChart(c, 46, A.y + A.h * 0.74, Math.min(220, A.w * 0.45), A.h * 0.14, [{ d: this.qs.concat(this.mode === 'hunt' || this.mode === 'review' ? [this.q()] : []), col: Pal.a, wd: 3 }], { n: 5, ref: 0.6, title: 'q by generation (goal ≤ 0.30)', yl: ['0', '0.5'] });
    if (this.mode === 'hunt') ink(c, this.bites + ' bites · ' + Math.ceil(this.timer) + ' s', A.w - 24, A.y + A.h * 0.78, 16, Pal.ink, 'right', 700, 'serif');
  }
});

/* ================= Level 10: The slow ray (mutation) ================= */
Game.reg({
  id: 'l10', title: 'The slow ray', sub: 'Mutation',
  enter() { this.score = 0; this.p = 0.5; this.mu = 1e-5; this.gen = 0; this.run = 0; this.ps = [0.5]; this.flip = []; stepper(this); this.next(); },
  steps: [
    function () { quiz(this, 'Mutation turns an <b>A</b> allele into an <b>a</b> at a realistic rate of about <b>1 in 100,000</b> copies per generation. Starting from p = 0.5, how much will p fall in <b>1,000 generations</b>?', [['005', 'About 0.005'], ['05', 'About 0.05'], ['5', 'About 0.5']], '005', 'p falls by a fraction μ each generation: after 1,000 generations, by about 1%, from 0.500 to 0.495.', () => this.next()); },
    function () { UI.say('This jar is the gene pool. Run 1,000 generations at the realistic rate and watch for flipped alleles.'); UI.ctl(UI.row(UI.btn('Run 1,000 generations', b => { b.disabled = true; this.go(1000, 1e-5, () => this.next()); }, 'primary'))); },
    function () { UI.say('p moved from 0.500 to <b>' + fx3(this.p) + '</b>: in this jar of 100 alleles, about <b>half an allele</b> changed in a thousand generations. Now turn the dial up to a fantasy rate, a thousand times faster, and run 100 generations.'); this.muv = -2; UI.ctl(UI.slider({ label: 'rate', min: -6, max: -1, step: 0.5, value: -2, fmt: v => '1 in ' + Math.round(Math.pow(10, -v)).toLocaleString('en-GB'), oninput: v => { this.muv = v; } }), UI.row(UI.btn('Run 100 generations', b => { b.disabled = true; this.go(100, Math.pow(10, this.muv), () => this.next()); }, 'primary'))); },
    function () { quiz(this, 'At 1 in ' + Math.round(1 / this.mu).toLocaleString('en-GB') + ', p fell to <b>' + fx2(this.p) + '</b>. Which statement is right?', [['src', 'Mutation is the source of new alleles, but on its own changes frequencies very slowly'], ['fast', 'Mutation is the main reason allele frequencies change quickly'], ['none', 'Mutation never changes allele frequencies']], 'src', 'Real mutation rates are tiny, so over a few generations Hardy–Weinberg can ignore them. Over evolutionary time, mutation supplies every new allele that selection and drift then act upon.', () => finishLevel('l10', 1 + this.score, '<p>Mutation changes allele frequencies by turning one allele into another: <span class="fx">p<sub>t</sub> = p<sub>0</sub>(1 − μ)<sup>t</sup></span>. At real rates of about 1 in 100,000, that takes tens of thousands of generations to matter. Its real role is creative: <b>every allele began as a mutation</b>. (This model ignores back mutation, a to A, which in reality stops p sinking all the way to zero.)</p>')); }
  ],
  go(n, mu, done) { this.mu = mu; this.run = n; this.left = n; this.done = done; this.acc = 0; Snd.pop(); },
  update(dt) {
    if (this.left > 0) { const per = Math.max(1, Math.round(this.run / 60)); this.acc += dt; if (this.acc > 0.03) { this.acc = 0; const before = Math.round(this.p * 100); for (let k = 0; k < per && this.left > 0; k++) { this.p *= (1 - this.mu); this.left--; this.gen++; } this.ps.push(this.p); const after = Math.round(this.p * 100); if (after < before) for (let k = after; k < before; k++) this.flip.push({ i: k, t: 0 }); if (this.left === 0 && this.done) { const d = this.done; this.done = null; d(); } } }
    this.flip.forEach(f => f.t += dt); this.flip = this.flip.filter(f => f.t < 1.2);
  },
  draw(c) {
    const A = Stage.area(), J = { x: A.w / 2 - Math.min(150, A.w * 0.4), y: A.y + 30, w: Math.min(300, A.w * 0.8), h: A.h * 0.42 }, sl = jarSlots(J, 100), nA = Math.round(this.p * 100);
    plate(c, J.x - 8, J.y - 8, J.w + 16, J.h + 16, 12, 0.5); sl.forEach((s, k) => token(c, s.x, s.y, s.r, k < nA ? 'A' : 'a')); this.flip.forEach(f => { const s = sl[f.i]; if (s) FX.ring && (c.strokeStyle = hexA(Pal.accent, 1 - f.t / 1.2), c.lineWidth = 3, c.beginPath(), c.arc(s.x, s.y, s.r + 4 + f.t * 10, 0, TAU), c.stroke()); });
    ink(c, 'p = ' + fx3(this.p) + '   generation ' + this.gen.toLocaleString('en-GB'), A.w / 2, J.y - 14, 15, Pal.ink, 'center', 700, 'serif');
    lineChart(c, 46, A.y + A.h * 0.62, A.w - 80, A.h * 0.24, [{ d: this.ps, col: Pal.A, wd: 3 }], { n: Math.max(2, this.ps.length), title: 'p over every generation run so far', yl: ['0', '1'] });
  }
});

/* ================= Level 11: The bridge (migration) ================= */
Game.reg({
  id: 'l11', title: 'The bridge', sub: 'Migration',
  enter() { this.score = 0; this.pW = 0.9; this.pE = 0.2; this.m = 0.25; this.gen = 0; this.hist = [[0.9, 0.2]]; this.walk = 0; stepper(this); this.next(); Lens.show(true, 'phen'); },
  lay() { const A = Stage.area(), port = A.w < A.h; return port ? { W: { x: 20, y: A.y + 8, w: A.w - 40, h: A.h * 0.24 }, E: { x: 20, y: A.y + A.h * 0.42, w: A.w - 40, h: A.h * 0.24 }, br: 'v', chart: { x: 46, y: A.y + A.h * 0.75, w: A.w - 80, h: A.h * 0.14 } } : { W: { x: 20, y: A.y + 10, w: A.w * 0.38, h: A.h * 0.55 }, E: { x: A.w * 0.6, y: A.y + 10, w: A.w * 0.38, h: A.h * 0.55 }, br: 'h', chart: { x: 46, y: A.y + A.h * 0.72, w: A.w - 80, h: A.h * 0.16 } }; },
  steps: [
    function () { quiz(this, 'Hardy–Weinberg assumes <b>no migration</b>. Two islands: <b>West</b> has p = 0.9 (mostly A), <b>East</b> has p = 0.2. A bridge opens, and next season <b>a quarter</b> of East’s breeders are migrants from West. What will East’s p be?', [['375', '0.375'], ['55', '0.55'], ['2', 'Still 0.2'], ['9', '0.9']], '375', 'Three quarters of East’s alleles are still East’s (0.75 × 0.2 = 0.15) and a quarter come from West (0.25 × 0.9 = 0.225): 0.15 + 0.225 = 0.375.', () => this.next()); },
    function () { UI.say('Now run it. Set what share of each island’s breeders cross the bridge each season, and watch the migrants walk.'); UI.ctl(UI.slider({ label: 'migrants', min: 0, max: 0.5, step: 0.05, value: this.m, fmt: v => Math.round(v * 100) + '% a season', oninput: v => { this.m = v; } }), UI.row(this.gb = UI.btn('Run a season', () => this.season(), 'primary'), this.nb = UI.btn('Next', () => this.next()))); this.nb.disabled = true; },
    function () { quiz(this, 'If the bridge stays open for good, what happens in the end?', [['same', 'Both islands end up with the same p'], ['swap', 'They swap allele frequencies'], ['apart', 'They drift further apart']], 'same', 'Each season pulls the two islands toward each other; with the bridge open long enough they meet in the middle (the two islands are the same size) — here at p = 0.55.', () => finishLevel('l11', 1 + this.score, '<p><b>Migration moves alleles between populations</b>, pulling each island’s allele frequency toward the other’s: <span class="fx">p′ = (1 − m) p + m p<sub>migrants</sub></span>. It only changes anything when the migrants differ genetically from the residents — and it is a major reason neighbouring populations stay alike.</p>')); }
  ],
  season() {
    if (this.walk > 0) return; if (this.nb) this.nb.disabled = true; const L = this.lay(), n = Math.round(this.m * 20), W = field(20, L.W, 5), E = field(20, L.E, 6), cW = hwCounts(this.pW, 20), cE = hwCounts(this.pE, 20), gW = countsToList(cW), gE = countsToList(cE);
    for (let k = 0; k < n; k++) { const a = W[k], b = E[k]; FX.fly(a.x, a.y, b.x, b.y, null, 1.2, null, { g: gW[k], s: a.s, lens: Lens.mode, lift: 0, delay: k * 0.05 }); FX.fly(b.x, b.y, a.x, a.y, null, 1.2, null, { g: gE[k], s: b.s, lens: Lens.mode, lift: 0, delay: k * 0.05 }); }
    this.walk = 1.3 + n * 0.05; const nW = (1 - this.m) * this.pW + this.m * this.pE, nE = (1 - this.m) * this.pE + this.m * this.pW; this.pend = [nW, nE];
  },
  update(dt) { if (this.walk > 0) { this.walk -= dt; if (this.walk <= 0) { this.walk = 0; [this.pW, this.pE] = this.pend; this.hist.push([this.pW, this.pE]); this.gen++; Snd.pop(); if (this.si !== 1) return; UI.say('Season ' + this.gen + ': West p = <b>' + fx3(this.pW) + '</b>, East p = <b>' + fx3(this.pE) + '</b>. ' + (this.m === 0 ? 'With the bridge closed, nothing changes.' : 'They are converging.')); if (this.gen >= 3) this.nb.disabled = false; UI.ctl(UI.slider({ label: 'migrants', min: 0, max: 0.5, step: 0.05, value: this.m, fmt: v => Math.round(v * 100) + '% a season', oninput: v => { this.m = v; } }), UI.row(UI.btn('Run a season', () => this.season(), 'primary'), this.nb)); } } },
  draw(c) {
    const L = this.lay(); const W = field(20, L.W, 5), E = field(20, L.E, 6), gW = countsToList(hwCounts(this.pW, 20)), gE = countsToList(hwCounts(this.pE, 20)), hide = this.walk > 0 ? Math.round(this.m * 20) : 0;
    for (const [Rc, nm, p] of [[L.W, 'West', this.pW], [L.E, 'East', this.pE]]) { c.fillStyle = hexA(Pal.good, 0.1); rrect(c, Rc.x - 6, Rc.y - 6, Rc.w + 12, Rc.h + 12, 26); c.fill(); ink(c, nm + '  p = ' + fx2(p), Rc.x + 8, Rc.y + 6, 13, Pal.ink, 'left', 700, 'serif'); }
    c.strokeStyle = hexA(Pal.ink, 0.35); c.lineWidth = 6; c.setLineDash([2, 6]); c.beginPath(); if (L.br === 'v') { c.moveTo(Stage.w / 2, L.W.y + L.W.h + 4); c.lineTo(Stage.w / 2, L.E.y - 4); } else { c.moveTo(L.W.x + L.W.w + 4, L.W.y + L.W.h / 2); c.lineTo(L.E.x - 4, L.E.y + L.E.h / 2); } c.stroke(); c.setLineDash([]);
    gW.forEach((g, i) => { if (i < hide) return; beetle(c, W[i].x, W[i].y, W[i].s, g, { rot: W[i].rot }); }); gE.forEach((g, i) => { if (i < hide) return; beetle(c, E[i].x, E[i].y, E[i].s, g, { rot: E[i].rot }); });
    lineChart(c, L.chart.x, L.chart.y, L.chart.w, L.chart.h, [{ d: this.hist.map(h => h[0]), col: Pal.A, wd: 3 }, { d: this.hist.map(h => h[1]), col: Pal.a, wd: 3 }], { n: Math.max(6, this.hist.length), title: 'p on West (blue) and East (yellow), season by season', yl: ['0', '1'] });
  }
});

/* ================= Level 12: Five tiny islands (drift) ================= */
Game.reg({
  id: 'l12', title: 'Five tiny islands', sub: 'Genetic drift',
  enter() { this.score = 0; this.N = 10; this.lines = null; this.t = 0; this.sizes = new Set(); this.tries = 0; Lens.set('geno', true); stepper(this); this.next(); },
  sim(N) { const L = []; for (let k = 0; k < 5; k++) { let p = 0.5; const d = [p]; for (let g = 0; g < 30; g++) { p = binom(2 * N, p) / (2 * N); d.push(p); } L.push(d); } return L; },
  run(N, done) { this.N = N; this.lines = this.sim(N); this.t = 0; this.done = done; Snd.pop(); },
  steps: [
    function () { quiz(this, 'Hardy–Weinberg assumes a <b>very large population</b>. Here are five islands, each with just <b>10 beetles</b> and p = 0.5 — no selection, no migration, no mutation. After 30 generations, what will they look like?', [['same', 'All still near 0.5'], ['spread', 'Scattered — some may have lost an allele'], ['allA', 'All lost the a allele']], 'spread', 'Each generation is a random sample of the last. Watch.', () => { UI.say('Thirty generations on five islands of 10…'); UI.ctl(); this.run(10, () => this.next()); }); },
    function () { const lost = this.lines.filter(d => { const e = last(d); return e === 0 || e === 1; }).length; UI.say('Nothing chose a direction, yet the islands scattered, and <b>' + lost + ' of 5</b> lost an allele for good. That is <b>genetic drift</b>: chance in sampling. Now compare sizes: run the five islands with 100 and with 1,000 beetles each.'); this.sizes.add(10); this.nb = UI.btn('Next', () => this.next(), 'primary'); this.nb.disabled = true; UI.ctl(UI.row(...[10, 100, 1000].map(N => UI.btn(N + ' beetles', () => { if (this.t < 3.2 && this.lines && !this.idle()) return; this.run(N, () => { this.sizes.add(N); this.nb.disabled = this.sizes.size < 3; }); })), this.nb)); },
    function () { UI.say('The bigger the population, the smaller the wobble. <b>Challenge:</b> choose the smallest island size that keeps <b>both alleles alive on at least 4 of the 5 islands</b> for 30 generations.'); this.N = 20; UI.ctl(UI.slider({ label: 'beetles', min: 4, max: 200, step: 1, value: 20, fmt: v => v + ' each', oninput: v => { this.N = v; } }), UI.row(this.cb = UI.btn('Run the challenge', () => { this.cb.disabled = true; this.tries++; this.run(this.N, () => this.judge()); }, 'primary'))); }
  ],
  idle() { return !this.done; },
  judge() { const kept = this.lines.filter(d => { const e = last(d); return e > 0 && e < 1; }).length, ok = kept >= 4; if (ok) { this.score++; Snd.good(); } else Snd.bad(); UI.say('With <b>' + this.N + '</b> beetles per island, both alleles survived on <b>' + kept + ' of 5</b>. ' + (ok ? 'Success.' : 'Not enough — drift was too strong.') + ' On average an island loses a share <span class="fx">1 ÷ 2N</span> of its heterozygosity every generation.'); UI.ctl(UI.row(!ok && this.tries < 4 ? UI.btn('Try another size', () => this.steps[2].call(this)) : null, UI.btn('Finish', () => finishLevel('l12', 1 + this.score + (this.sizes.size >= 3 ? 1 : 0) > 3 ? 3 : 1 + this.score + (this.sizes.size >= 3 ? 1 : 0), '<p><b>Genetic drift</b> is change by chance: each generation’s alleles are a random sample of the last generation’s. It has no direction, it is strongest in small populations, and it can remove an allele entirely. Hardy–Weinberg assumes an infinitely large population to rule it out. In real populations what counts is the <b>effective</b> size, N<sub>e</sub>: uneven sex ratios, booms and busts and unequal family sizes make it smaller than the head count, often far smaller.</p>'), 'primary'))); },
  update(dt) { if (this.lines) { this.t += dt; if (this.t > 3.2 && this.done) { const d = this.done; this.done = null; d(); } } },
  draw(c) {
    const A = Stage.area(), n = this.lines ? Math.min(31, 1 + Math.floor(this.t / 3 * 30)) : 1, cols = [Pal.A, Pal.a, Pal.accent, Pal.good, Pal.muted], iw = (A.w - 40) / 5;
    for (let k = 0; k < 5; k++) { const x = 20 + k * iw, y = A.y + 6, h = A.h * 0.3, p = this.lines ? this.lines[k][n - 1] : 0.5, show = Math.min(this.N, 12), pop = countsToList(hwCounts(p, show)), pts = field(show, { x: x + 4, y: y + 14, w: iw - 8, h: h - 18 }, 40 + k, { max: 12 }); c.fillStyle = hexA(cols[k], 0.12); rrect(c, x + 2, y, iw - 4, h, 14); c.fill(); pop.forEach((g, i) => beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { lens: 'geno', noLetters: true })); ink(c, 'p ' + fx2(p), x + iw / 2, y + h + 12, 12, Pal.ink, 'center', 700); }
    if (this.lines) lineChart(c, 46, A.y + A.h * 0.42, A.w - 80, A.h * 0.42, this.lines.map((d, k) => ({ d: d.slice(0, n), col: cols[k], wd: 2.4 })), { n: 31, ref: 0.5, title: 'p on each island over 30 generations (' + this.N + ' beetles each)', yl: ['0', '1'] });
  }
});

/* ================= Level 13: Volcano and castaways ================= */
Game.reg({
  id: 'l13', title: 'Volcano and castaways', sub: 'Bottlenecks and founders',
  enter() { this.score = 0; this.mode = 'main'; this.pop = shuffle(countsToList([15, 30, 15])); this.surv = null; this.chosen = []; this.hist = null; Lens.show(true, 'phen'); stepper(this); this.next(); },
  steps: [
    function () { quiz(this, 'A volcano erupts. Only <b>4 beetles</b> survive. Within a few generations their descendants number 60 again. Will the <b>genetic diversity</b> come back too?', [['yes', 'Yes, with the numbers'], ['no', 'No — it stays low for a long time']], 'no', 'Numbers can recover in a few generations. Lost alleles come back only with immigrants or, far more slowly (over a great many generations), through new mutations.', () => this.erupt()); }
  ],
  erupt() {
    this.mode = 'erupt'; this.surv = shuffle([...Array(60).keys()]).slice(0, 4); this.t = 0; Snd.bad(); UI.say('The eruption…'); UI.ctl();
    const sv = this.surv.map(i => this.pop[i]); let cur = sv.slice(), N = 4; const H0 = 0.5, hist = [{ N: 60, H: H0 }, { N: 4, H: 2 * pOf(listCounts(cur)) * (1 - pOf(listCounts(cur))) }]; let He = hist[1].H;
    for (const n of [8, 16, 32, 60, 60, 60]) { cur = wfNext(cur, n); He = He * (1 - 1 / (2 * N)); N = n; const p = pOf(listCounts(cur)); hist.push({ N: n, H: Math.min(He, 2 * p * (1 - p)) }); }
    this.hist = hist; this.final = cur;
  },
  update(dt) { if (this.mode === 'erupt') { this.t += dt; if (this.t > 1.6) { this.mode = 'recover'; this.t = 0; } } else if (this.mode === 'recover') { this.t += dt; if (this.t > 2.4) { this.mode = 'recovered'; const H = last(this.hist).H; UI.say('Sixty beetles again — but diversity (the share of heterozygotes expected) is <b>' + pct(H / 0.5) + '</b> of what it was. The four survivors carried only a sample of the old gene pool, and the small generations after them lost more by drift. <b>Numbers recovered; genetic diversity did not.</b>'); UI.ctl(UI.row(UI.btn('Now: castaways', () => this.castaway(), 'primary'))); } } },
  castaway() { this.mode = 'pick'; this.pop = shuffle(countsToList([15, 30, 15])); this.chosen = []; Lens.show(false); Lens.set('phen', true); UI.say('A storm will carry <b>5 beetles</b> to an empty island. You choose them — but like the storm, you can only see colours. <b>Tap 5 beetles.</b> The mainland has p = 0.50.'); UI.ctl(); },
  tap(x, y) { if (this.mode !== 'pick') return; const A = Stage.area(), pts = field(60, fieldRect(A, 0.04, 0.62), 51, { max: 20 }), i = hitList(pts, x, y, k => !this.chosen.includes(k)); if (i < 0) return; this.chosen.push(i); Snd.pop(); if (this.chosen.length === 5) this.found(); },
  hot() { if (this.mode !== 'pick') return []; const pts = field(60, fieldRect(A0(), 0.04, 0.62), 51, { max: 20 }); return pts.filter((p, i) => !this.chosen.includes(i)); },
  found() {
    this.mode = 'island'; const mine = this.chosen.map(i => this.pop[i]), pm = pOf(listCounts(mine)); const others = [0, 1].map(() => shuffle(this.pop.slice()).slice(0, 5)); this.islands = [mine].concat(others).map(f => { let cur = f.slice(), d = [pOf(listCounts(cur))]; for (let g = 0; g < 20; g++) { cur = wfNext(cur, Math.min(30, 5 + g * 3)); d.push(pOf(listCounts(cur))); } return d; }); this.t = 0;
    Lens.set('geno', true); const ok = true; this.score++;
    UI.say('Your five founders had <b>p = ' + fx2(pm) + '</b> (the mainland: 0.50). Two other storms took their own five. Watch the three islands over 20 generations as they grow.');
    UI.ctl(UI.row(UI.btn('Finish', () => finishLevel('l13', 1 + this.score, '<p>A <b>bottleneck</b> and a <b>founder event</b> are both drift at its most extreme: a handful of individuals carry a random sample of the gene pool. Numbers can bounce back; lost alleles return only with immigrants or, far more slowly (over a great many generations), through new mutations. Rare alleles go first, so a bottleneck strips the number of alleles faster than it strips heterozygosity. And each founded island starts with its own accidental allele frequency.</p>'), 'primary')));
  },
  draw(c) {
    const A = Stage.area(), pts = field(60, fieldRect(A, 0.04, 0.62), 51, { max: 20 });
    if (this.mode === 'main' || this.mode === 'erupt' || this.mode === 'pick') { const k = this.mode === 'erupt' ? clamp(this.t / 1.2, 0, 1) : 0; this.pop.forEach((g, i) => { const sv = this.surv && this.surv.includes(i); beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { rot: pts[i].rot, alpha: this.mode === 'erupt' && !sv ? 1 - k : 1, ring: (this.mode === 'erupt' && sv) || this.chosen.includes(i) ? Pal.accent : null }); }); if (this.mode === 'erupt') { c.fillStyle = hexA('#7a3a1a', 0.25 * (1 - k)); c.fillRect(0, A.y, A.w, A.h * 0.66); } if (this.mode === 'pick') ink(c, this.chosen.length + ' of 5 chosen', A.w / 2, A.y + A.h * 0.66, 15, Pal.ink, 'center', 700, 'serif'); return; }
    if (this.mode === 'recover' || this.mode === 'recovered') { const H = this.hist, n = this.mode === 'recover' ? Math.min(H.length, 2 + Math.floor(this.t / 2.4 * (H.length - 1))) : H.length, cur = this.final, show = this.mode === 'recovered' ? cur : cur.slice(0, Math.min(60, H[n - 1].N)); const pp = field(show.length, fieldRect(A, 0.04, 0.5), 52, { max: 18 }); show.forEach((g, i) => beetle(c, pp[i].x, pp[i].y, pp[i].s, g, { rot: pp[i].rot })); lineChart(c, 46, A.y + A.h * 0.6, A.w - 80, A.h * 0.26, [{ d: H.slice(0, n).map(h => h.N / 60), col: Pal.ink, wd: 3 }, { d: H.slice(0, n).map(h => h.H / 0.5), col: Pal.accent, wd: 3 }], { n: H.length, title: 'population size (dark) and genetic diversity (red), relative to before', yl: ['0', '100%'] }); return; }
    if (this.mode === 'island') { this.t += 0.016; const n = Math.min(21, 1 + Math.floor(this.t * 6)), cols = [Pal.accent, Pal.A, Pal.a]; lineChart(c, 46, A.y + A.h * 0.12, A.w - 80, A.h * 0.6, this.islands.map((d, k) => ({ d: d.slice(0, n), col: cols[k], wd: k ? 2 : 3.5 })), { n: 21, ref: 0.5, title: 'p on your island (red) and two others, over 20 generations', yl: ['0', '1'] }); }
  }
});
function A0() { return Stage.area(); }
