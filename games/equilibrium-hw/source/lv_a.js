/* ================= Level index, title, levels 1–4 ================= */
const CHAPTERS = [
  { n: 'I. Alleles in a population', d: 'What a population is made of, allele by allele.', lv: ['l1', 'l2', 'l3'] },
  { n: 'II. Where the equation comes from', d: 'Random mating, step by step, builds p² + 2pq + q².', lv: ['l4', 'l5', 'l6', 'l7'] },
  { n: 'III. The Hardy–Weinberg world', d: 'What a population looks like when nothing is changing it.', lv: ['l8'] },
  { n: 'IV. Breaking the equilibrium', d: 'One assumption at a time, and what each one does.', lv: ['l9', 'l10', 'l11', 'l12', 'l13', 'l14', 'l15'] },
  { n: 'V. Using Hardy–Weinberg', d: 'Detective work with real populations.', lv: ['l16', 'l17', 'cases'] }
];
const LV = {
  l1: ['Two copies each', 'Genotype, phenotype, dominance'], l2: ['Break into alleles', 'p and q describe alleles, not beetles'], l3: ['Dominant isn’t common', 'Dominance and frequency are different things'],
  l4: ['The gamete pool', 'Random mating is random drawing'], l5: ['Why p²?', 'Two independent draws multiply'], l6: ['Why 2pq?', 'Two routes to a heterozygote'], l7: ['One generation', 'Equilibrium in one round of mating'],
  l8: ['Equilibrium Island', 'The five assumptions and the null model'],
  l9: ['The bird', 'Selection, and why recessives hide'], l10: ['The slow ray', 'Mutation'], l11: ['The bridge', 'Migration'], l12: ['Five tiny islands', 'Genetic drift'], l13: ['Volcano and castaways', 'Bottlenecks and founders'], l14: ['The matchmaker', 'Non-random mating'], l15: ['Evolving, or just unbalanced?', 'Disequilibrium is not evolution'],
  l16: ['Invisible carriers', 'Counting what you cannot see'], l17: ['Real populations', 'Testing equilibrium with real data'], cases: ['The case files', 'Eight mystery populations']
};
const ORDER = CHAPTERS.flatMap(c => c.lv);
const unlocked = id => Save.d.all || ORDER.indexOf(id) === 0 || !!Save.d.done[ORDER[ORDER.indexOf(id) - 1]];
function finishLevel(id, stars, html) {
  Save.star(id, stars); Snd.star(); const nx = ORDER[ORDER.indexOf(id) + 1];
  UI.card({ title: LV[id][0] + ': complete', html: '<div class="stars">' + starStr(stars) + '</div>' + html, buttons: [{ t: 'All levels', fn: () => Game.go('map') }].concat(nx ? [{ t: 'Next: ' + LV[nx][0], primary: true, fn: () => Game.go(nx) }] : []) });
}

/* ---- title: the equation, and the three beetles it describes ---- */
Game.reg({
  id: 'title', noPanel: true, noTop: true,
  enter() { $('titlecard').classList.add('on'); }, exit() { $('titlecard').classList.remove('on'); },
  draw(c, w, h) {
    const y = h * 0.52, s = clamp(w / 11, 26, 52), xs = [w / 2 - s * 3, w / 2, w / 2 + s * 3], terms = ['p²', '2pq', 'q²'], cols = [Pal.A, Pal.ink, Pal.a];
    ['AA', 'Aa', 'aa'].forEach((g, i) => { beetle(c, xs[i], y, s, g, { lens: 'geno' }); ink(c, terms[i], xs[i], y - s * 1.75, Math.round(s * 0.8), cols[i], 'center', 600, 'serif'); ink(c, g, xs[i], y + s * 1.2, 15, Pal.ink, 'center', 700, 'serif'); });
    ink(c, '+', (xs[0] + xs[1]) / 2, y - s * 1.75, Math.round(s * 0.6), Pal.muted, 'center', 500, 'serif'); ink(c, '+', (xs[1] + xs[2]) / 2, y - s * 1.75, Math.round(s * 0.6), Pal.muted, 'center', 500, 'serif');
    ink(c, '= 1', xs[2] + s * 1.6, y - s * 1.75, Math.round(s * 0.6), Pal.muted, 'center', 500, 'serif');
  }
});

/* ---- level index ---- */
Game.reg({
  id: 'map', noPanel: true, title: 'Levels', sub: 'Each level adds one idea',
  enter() {
    const body = $('lv-body'); let html = ''; const n = ORDER.filter(id => Save.d.done[id]).length;
    html += '<p class="chp" style="margin-top:6px">Levels complete: <b>' + n + ' of ' + ORDER.length + '</b>.</p>';
    CHAPTERS.forEach(ch => { html += '<h2>' + ch.n + '</h2><p class="chp">' + ch.d + '</p>'; ch.lv.forEach(id => { const k = ORDER.indexOf(id) + 1, on = unlocked(id), st = Save.d.stars[id] || 0; html += '<button class="lv' + (on ? '' : ' locked') + '" data-id="' + id + '"><span class="n">' + (id === 'cases' ? '★' : k) + '</span><span class="t"><b>' + LV[id][0] + '</b><span>' + LV[id][1] + '</span></span><span class="s">' + (Save.d.done[id] ? '★'.repeat(st) : on ? '' : 'locked') + '</span></button>'; }); });
    body.innerHTML = html; $('levels').classList.add('on'); $('levels').scrollTop = 0;
    body.querySelectorAll('.lv').forEach(b => b.onclick = () => { Snd.unlock(); Snd.click(); const id = b.dataset.id; if (!unlocked(id)) { UI.toast('Finish <b>' + LV[ORDER[ORDER.indexOf(id) - 1]][0] + '</b> first.'); return; } Game.go(id); });
  },
  exit() { $('levels').classList.remove('on'); }
});

/* ================= Level 1: Two copies each ================= */
Game.reg({
  id: 'l1', title: 'Two copies each', sub: 'Genotype, phenotype, dominance',
  enter() { this.al = ['A', 'a']; this.made = new Set(); this.score = 0; this.mode = 'build'; this.reveal = null; Lens.set('geno', true); stepper(this); this.next(); },
  geo() { const A = Stage.area(), s = clamp(Math.min(A.h * 0.2, A.w * 0.2), 36, 84); return { A, s, x: A.w / 2, y: A.y + A.h * 0.5 }; },
  steps: [
    function () { UI.say('Every beetle carries <b>two copies</b> of the colour gene, one from each parent. Here you can see them: <b>one on each wing case</b>. Each copy is an <b>allele</b>: <span class="A">A</span> (blue) or <span class="a">a</span> (yellow). <b>Tap a wing case</b> to swap its allele, and make all three combinations.'); this.nb = UI.btn('Next', () => this.next(), 'primary'); this.nb.disabled = true; UI.ctl(UI.row(this.nb)); this.track(); },
    function () { this.mode = 'trio'; this.seenPhen = false; Lens.show(true, 'geno'); UI.say('The pair of alleles is the beetle’s <b>genotype</b>: AA, Aa or aa. What you see from outside is its <b>phenotype</b>. A is <b>dominant</b>: one copy is enough to colour the whole beetle blue. Use the lens at the top to look at these three from the outside.'); this.nb = UI.btn('Next', () => this.next(), 'primary'); this.nb.disabled = true; UI.ctl(UI.row(this.nb)); },
    function () { this.mode = 'read'; Lens.show(false); Lens.set('phen', true); this.pop = shuffle(['AA', 'AA', 'Aa', 'Aa', 'Aa', 'aa', 'aa', 'Aa']); this.qi = 0; this.ask(); }
  ],
  onLens(m) { if (this.mode === 'trio' && m === 'phen') { this.seenPhen = true; this.nb.disabled = false; UI.say('From outside, <b>AA and Aa look identical</b>: both blue. The a allele in Aa is still there — the beetle is a <b>carrier</b> — but you cannot see it. Only aa beetles show a.'); } },
  track() { const g = gtOf(this.al[0], this.al[1]); this.made.add(g); if (this.nb) this.nb.disabled = this.made.size < 3; },
  ask() { const g = this.pop[this.qi], ans = g === 'aa' ? 'aa' : 'cant'; UI.say('Out in the field you only see phenotypes. Beetle <b>' + (this.qi + 1) + ' of 8</b> (circled): what is its genotype?'); UI.ctl(UI.choices([['AA', 'AA'], ['Aa', 'Aa'], ['aa', 'aa'], ['cant', 'Can’t tell']], k => this.answer(k, ans, g))); },
  answer(k, ans, g) {
    if (this.mode !== 'read') return; const ok = k === ans; if (ok) { this.score++; Snd.good(); } else Snd.bad(); this.reveal = { i: this.qi, t: 0 };
    UI.say((ok ? '<b>Right.</b> ' : '<b>Not quite.</b> ') + (g === 'aa' ? 'Yellow can only mean aa.' : 'It was <b>' + g + '</b> — but from outside a blue beetle could be AA or Aa, so “can’t tell” is the honest answer.'));
    this.qi++; UI.ctl(UI.row(UI.btn(this.qi < 8 ? 'Next beetle' : 'Finish', () => { if (this.qi < 8) this.ask(); else { this.mode = 'done'; finishLevel('l1', this.score >= 7 ? 3 : this.score >= 5 ? 2 : 1, '<p>You read <b>' + this.score + ' of 8</b> beetles.</p><p>A <b>genotype</b> is the pair of alleles; a <b>phenotype</b> is what shows. A <b>dominant</b> allele hides a recessive one, so a blue beetle may secretly carry a. Hardy–Weinberg will let you count those hidden carriers — later.</p>'); } }, 'primary')));
  },
  tap(x, y) { if (this.mode !== 'build') return; const G = this.geo(), ey = G.y + G.s * 0.14; if (((x - G.x) / (G.s * 0.45)) ** 2 + ((y - ey) / (G.s * 0.62)) ** 2 > 1) return; const k = x < G.x ? 0 : 1; this.al[k] = this.al[k] === 'A' ? 'a' : 'A'; Snd.pop(); FX.ring(G.x + (k ? 1 : -1) * G.s * 0.2, ey, AC(this.al[k]), 24); this.track(); },
  hot() { if (this.mode !== 'build') return []; const G = this.geo(); return [{ x: G.x - G.s * 0.2, y: G.y + G.s * 0.14 }, { x: G.x + G.s * 0.2, y: G.y + G.s * 0.14 }]; },
  update(dt) { if (this.reveal) { this.reveal.t += dt; if (this.reveal.t > 2.2) this.reveal = null; } },
  draw(c) {
    const G = this.geo();
    if (this.mode === 'build') { const g = gtOf(this.al[0], this.al[1]); beetle(c, G.x, G.y, G.s, g, { lens: 'geno', al: this.al }); ink(c, 'genotype ' + g, G.x, G.y - G.s * 1.35, 16, Pal.ink, 'center', 700, 'serif'); ink(c, 'tap a wing case', G.x, G.y + G.s * 1.05, 12, Pal.muted, 'center', 600); ['AA', 'Aa', 'aa'].forEach((k, i) => { const x = G.x + (i - 1) * 50, y = G.A.y + 24; beetle(c, x, y, 12, k, { lens: 'geno', alpha: this.made.has(k) ? 1 : 0.25 }); ink(c, k, x, y + 20, 11, Pal.ink, 'center', 700, 'serif'); }); return; }
    if (this.mode === 'trio') { const s = clamp(G.s * 0.7, 28, 60); ['AA', 'Aa', 'aa'].forEach((g, i) => { const x = G.x + (i - 1) * s * 2.6; beetle(c, x, G.y, s, g); ink(c, Lens.mode === 'geno' ? g : (g === 'aa' ? 'yellow' : 'blue'), x, G.y + s * 1.25, 15, Pal.ink, 'center', 700, 'serif'); }); return; }
    const pts = field(8, { x: G.A.x + 20, y: G.A.y + 10, w: G.A.w - 40, h: G.A.h - 20 }, 11, { max: 34 });
    this.pop.forEach((g, i) => { const rv = this.reveal && this.reveal.i === i; beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { lens: rv ? 'geno' : 'phen', rot: pts[i].rot, ring: this.mode === 'read' && i === this.qi ? Pal.accent : null }); });
  }
});

/* ================= Level 2: Break into alleles ================= */
Game.reg({
  id: 'l2', title: 'Break into alleles', sub: 'p and q describe alleles, not beetles',
  enter() { this.score = 0; this.ri = 0; Lens.set('geno', true); this.round(); },
  lay(n) { const A = Stage.area(), port = A.w < A.h * 1.1; return port ? { F: { x: 20, y: A.y + 8, w: A.w - 40, h: A.h * 0.48 }, J1: { x: 24, y: A.y + A.h * 0.62, w: (A.w - 72) / 2, h: A.h * 0.3 }, J2: { x: 48 + (A.w - 72) / 2, y: A.y + A.h * 0.62, w: (A.w - 72) / 2, h: A.h * 0.3 } } : { F: { x: 20, y: A.y + 10, w: A.w * 0.52, h: A.h - 30 }, J1: { x: A.w * 0.6, y: A.y + 30, w: A.w * 0.17, h: A.h - 70 }, J2: { x: A.w * 0.8, y: A.y + 30, w: A.w * 0.17, h: A.h - 70 } }; },
  round() {
    const R = this.ri; this.sp = null; this.sp2 = null; this.pts = null; this.pts2 = null;
    if (R === 0) { this.pop = shuffle(countsToList([8, 8, 4])); this.guess = 20; UI.say('Here are <b>20 beetles</b>. Count the alleles, not the beetles: how many <span class="A">A</span> alleles are in this population altogether?'); const v = document.createElement('b'); v.className = 'fx'; v.style.minWidth = '60px'; v.style.textAlign = 'center'; v.style.alignSelf = 'center'; const upd = () => { v.textContent = this.guess + ' A'; }; upd(); const st = d => UI.btn((d > 0 ? '+' : '−') + Math.abs(d), () => { this.guess = clamp(this.guess + d, 0, 40); upd(); }); UI.ctl(UI.row(st(-5), st(-1), v, st(1), st(5)), UI.row(this.go = UI.btn('Break into alleles', () => this.split(), 'primary'))); }
    else if (R === 1) { this.pop = shuffle(countsToList([9, 22, 19])); this.guess = 0.5; UI.say('Now <b>50 beetles</b>. Before breaking them up, estimate <b>p</b>: the share of all alleles that are A.'); UI.ctl(UI.slider({ label: 'p', min: 0, max: 1, step: 0.01, value: 0.5, fmt: fx2, oninput: v => { this.guess = v; } }), UI.row(this.go = UI.btn('Break into alleles', () => this.split(), 'primary'))); }
    else { this.pop = shuffle(countsToList([0, 20, 0])); this.pop2 = shuffle(countsToList([10, 0, 10])); UI.say('Two populations. On the left, <b>20 Aa</b> beetles. On the right, <b>10 AA and 10 aa</b>.'); UI.ctl(UI.row(UI.btn('Which has more A alleles?', () => quiz(this, 'Which population has more A alleles?', [['L', 'The left'], ['R', 'The right'], ['S', 'They have the same']], 'S', 'Each has 20 A alleles out of 40. Break them up to see it.', () => this.split()), 'primary'))); }
  },
  split() {
    if (this.sp && this.sp.dir) return; if (this.go) this.go.disabled = true; const L = this.lay();
    if (this.ri < 2) { const pts = field(this.pop.length, L.F, 5 + this.ri, { max: 24 }); this.sp = makeSplit(this.pop, pts, L.J1, L.J2); this.sp.dir = 1; this.pts = pts; }
    else { const A = Stage.area(), half = (A.w - 60) / 2, top = { y: A.y + 8, h: A.h * 0.42 }, F1 = { x: 20, y: top.y, w: half, h: top.h }, F2 = { x: 40 + half, y: top.y, w: half, h: top.h }, jh = A.h * 0.36, jy = A.y + A.h * 0.56, jw = (half - 14) / 2;
      this.pts = field(20, F1, 7); this.pts2 = field(20, F2, 8); this.sp = makeSplit(this.pop, this.pts, { x: 20, y: jy, w: jw, h: jh }, { x: 34 + jw, y: jy, w: jw, h: jh }); this.sp2 = makeSplit(this.pop2, this.pts2, { x: 40 + half, y: jy, w: jw, h: jh }, { x: 54 + half + jw, y: jy, w: jw, h: jh }); this.sp.dir = 1; this.sp2.dir = 1; }
    Snd.pop(); this.waiting = true; UI.ctl();
  },
  update(dt) { if (this.sp) this.sp.update(dt); if (this.sp2) this.sp2.update(dt); if (this.waiting && this.sp && this.sp.done() && (!this.sp2 || this.sp2.done())) { this.waiting = false; this.reveal(); } },
  reveal() {
    const S = this.sp, n = S.nA + S.na, p = S.nA / n;
    if (this.ri === 0) { const ok = this.guess === S.nA; if (ok) { this.score++; Snd.good(); } else Snd.bad(); UI.say('<b>' + S.nA + '</b> A alleles and <b>' + S.na + '</b> a alleles: 40 in all, two per beetle. You said ' + this.guess + (ok ? ' — exactly.' : '.') + ' Each AA beetle gave two A, each Aa gave one. The share of A is <b>p = ' + S.nA + ' ÷ 40 = ' + fx2(p) + '</b>, and the share of a is <b>q = ' + fx2(1 - p) + '</b>. Together they make 1.'); }
    else if (this.ri === 1) { const ok = Math.abs(this.guess - p) <= 0.03; if (ok) { this.score++; Snd.good(); } else Snd.bad(); UI.say('The jars hold <b>' + S.nA + '</b> A and <b>' + S.na + '</b> a, so <b>p = ' + fx2(p) + '</b> and <b>q = ' + fx2(1 - p) + '</b>. You said ' + fx2(this.guess) + (ok ? ' — close.' : '.') + ' Notice there are more beetles carrying A (31) than not (19), yet A is the <b>minority</b> allele: most carriers have just one copy.'); }
    else { UI.say('Same jars: <b>20 A and 20 a</b> on both sides, so both have <b>p = 0.50</b> — from completely different beetles. <b>p and q describe the gene pool, not the beetles.</b> They say nothing yet about how alleles are packaged into genotypes; that is what the rest of the game is about.'); }
    UI.ctl(UI.row(UI.btn(this.ri < 2 ? 'Next population' : 'Finish', () => { this.ri++; if (this.ri < 3) this.round(); else finishLevel('l2', Math.max(1, this.score), '<p>Counting the jars is all there is to an <b>allele frequency</b>. In shorthand:</p><div class="big-eq">p = (2 × AA + Aa) ÷ 2N</div><p>q = 1 − p. And the lesson of the last pair: very different populations can share the same p.</p>'); }, 'primary')));
  },
  draw(c) {
    const L = this.lay();
    if (this.ri < 2) { const pts = this.pts || field(this.pop.length, L.F, 5 + this.ri, { max: 24 }); const a = this.sp ? 1 - this.sp.t : 1; this.pop.forEach((g, i) => beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { rot: pts[i].rot, alpha: Math.max(0.12, a) })); drawJar(c, L.J1, 'A', this.sp && this.sp.done() ? this.sp.nA : null, this.sp && this.sp.done() ? this.sp.nA + this.sp.na : 0); drawJar(c, L.J2, 'a', this.sp && this.sp.done() ? this.sp.na : null, this.sp && this.sp.done() ? this.sp.nA + this.sp.na : 0); if (this.sp) this.sp.draw(c); return; }
    const A = Stage.area(), half = (A.w - 60) / 2; const P1 = this.pts || field(20, { x: 20, y: A.y + 8, w: half, h: A.h * 0.42 }, 7), P2 = this.pts2 || field(20, { x: 40 + half, y: A.y + 8, w: half, h: A.h * 0.42 }, 8); const a = this.sp ? 1 - this.sp.t : 1;
    this.pop.forEach((g, i) => beetle(c, P1[i].x, P1[i].y, P1[i].s, g, { rot: P1[i].rot, alpha: Math.max(0.12, a) })); this.pop2.forEach((g, i) => beetle(c, P2[i].x, P2[i].y, P2[i].s, g, { rot: P2[i].rot, alpha: Math.max(0.12, a) }));
    c.strokeStyle = hexA(Pal.ink, 0.2); c.beginPath(); c.moveTo(A.w / 2, A.y + 6); c.lineTo(A.w / 2, A.y + A.h - 6); c.stroke();
    if (this.sp) { const d = this.sp.done(); drawJar(c, this.sp.jarA, 'A', d ? this.sp.nA : null); drawJar(c, this.sp.jarB, 'a', d ? this.sp.na : null); drawJar(c, this.sp2.jarA, 'A', d ? this.sp2.nA : null); drawJar(c, this.sp2.jarB, 'a', d ? this.sp2.na : null); this.sp.draw(c); this.sp2.draw(c); }
  }
});

/* ================= Level 3: Dominant isn't common ================= */
Game.reg({
  id: 'l3', title: 'Dominant isn’t common', sub: 'Dominance and frequency are different things',
  enter() { this.pop = shuffle(countsToList([2, 16, 32])); this.score = 0; this.sp = null; this.rev = -1; Lens.set('phen', true); stepper(this); this.next(); },
  lay() { const A = Stage.area(), port = A.w < A.h * 1.1; return port ? { F: { x: 20, y: A.y + 8, w: A.w - 40, h: A.h * 0.5 }, J1: { x: 24, y: A.y + A.h * 0.63, w: (A.w - 72) / 2, h: A.h * 0.3 }, J2: { x: 48 + (A.w - 72) / 2, y: A.y + A.h * 0.63, w: (A.w - 72) / 2, h: A.h * 0.3 } } : { F: { x: 20, y: A.y + 10, w: A.w * 0.52, h: A.h - 30 }, J1: { x: A.w * 0.6, y: A.y + 30, w: A.w * 0.17, h: A.h - 70 }, J2: { x: A.w * 0.8, y: A.y + 30, w: A.w * 0.17, h: A.h - 70 } }; },
  steps: [
    function () { quiz(this, 'In this population <b>blue is dominant</b>: 18 beetles are blue and 32 are yellow. Which allele do you think is more common?', [['A', 'A, the dominant one'], ['a', 'a, the recessive one'], ['eq', 'They’re about equal']], 'a', 'Let’s check by breaking every beetle into its alleles — including the hidden ones.', () => this.next()); },
    function () { const L = this.lay(); this.pts = field(50, L.F, 13, { max: 22 }); this.sp = makeSplit(this.pop, this.pts, L.J1, L.J2); this.sp.dir = 1; this.wait = 'split'; UI.say('Breaking into alleles…'); UI.ctl(); },
    function () { UI.say('<b>20 A and 80 a</b>: the recessive allele makes up <b>80%</b> of the gene pool. Dominance only describes what happens <b>inside a heterozygote</b> — which allele shows. It says nothing about how common an allele is. (The idea that dominant alleles must spread was exactly the puzzle Hardy was asked to solve in 1908.)'); UI.ctl(UI.row(UI.btn('Put the beetles back', () => { this.sp.dir = -1; this.wait = 'back'; UI.ctl(); }, 'primary'))); },
    function () { this.guess = 9; UI.say('There are <b>18 blue beetles</b>. How many of them are secretly carrying an a allele?'); UI.ctl(UI.slider({ label: 'carriers', min: 0, max: 18, step: 1, value: 9, fmt: v => v + ' of 18', oninput: v => { this.guess = v; } }), UI.row(UI.btn('Reveal with the genotype lens', b => { b.disabled = true; this.rev = 0; Lens.set('geno', true); Lens.show(true); const ok = Math.abs(this.guess - 16) <= 2; if (ok) { this.score++; Snd.good(); } else Snd.bad(); setTimeout(() => { UI.say('<b>16 of the 18</b> blue beetles are Aa carriers; only 2 are AA. You said ' + this.guess + (ok ? ' — close.' : '.') + ' When a recessive allele is common, most beetles that show the dominant colour are carriers. When it is rare, the opposite — as you will see.'); UI.ctl(UI.row(UI.btn('Finish', () => finishLevel('l3', 1 + this.score, '<p><b>Dominant does not mean common.</b> Dominance describes which allele shows in a heterozygote; frequency is how much of the gene pool an allele makes up. Here the dominant allele was only 20% of the pool, and nearly every blue beetle was a hidden carrier.</p>'), 'primary'))); }, 900); }, 'primary'))); }
  ],
  update(dt) { if (this.sp) this.sp.update(dt); if (this.wait === 'split' && this.sp.done()) { this.wait = null; this.next(); } if (this.wait === 'back' && this.sp.t <= 0) { this.wait = null; this.sp = null; this.next(); } if (this.rev >= 0) this.rev += dt; },
  draw(c) {
    const L = this.lay(), pts = this.pts || field(50, L.F, 13, { max: 22 }), a = this.sp ? 1 - this.sp.t : 1;
    this.pop.forEach((g, i) => { const shown = this.rev >= 0 && this.rev > (i / 50) * 0.8; beetle(c, pts[i].x, pts[i].y, pts[i].s, g, { rot: pts[i].rot, alpha: Math.max(0.12, a), lens: shown ? 'geno' : 'phen', ring: shown && g === 'Aa' ? Pal.accent : null }); });
    if (this.sp) { const d = this.sp.done(); drawJar(c, L.J1, 'A', d ? this.sp.nA : null, 100); drawJar(c, L.J2, 'a', d ? this.sp.na : null, 100); this.sp.draw(c); }
    else if (this.rev < 0) { const blue = this.pop.filter(g => g !== 'aa').length; ink(c, blue + ' blue, ' + (50 - blue) + ' yellow', L.F.x + L.F.w / 2, L.F.y + L.F.h + 18, 15, Pal.ink, 'center', 700, 'serif'); }
  }
});

/* ================= Level 4: The gamete pool ================= */
Game.reg({
  id: 'l4', title: 'The gamete pool', sub: 'Random mating is random drawing',
  enter() { this.score = 0; this.tally = [0, 0, 0]; this.kids = []; this.busy = 0; Lens.set('geno', true); const r = rng(41); this.pool = []; for (let i = 0; i < 40; i++) this.pool.push({ al: i < 28 ? 'A' : 'a', u: r(), v: r() }); stepper(this); this.next(); },
  lay() { const A = Stage.area(); return { pool: { x: 24, y: A.y + 22, w: A.w - 48, h: A.h * 0.3 }, egg: { x: A.w * 0.3, y: A.y + A.h * 0.42 }, sperm: { x: A.w * 0.7, y: A.y + A.h * 0.42 }, mid: { x: A.w / 2, y: A.y + A.h * 0.47 }, nest: { x: 24, y: A.y + A.h * 0.56, w: A.w - 48, h: A.h * 0.24 }, bar: { x: 24, y: A.y + A.h * 0.88, w: A.w - 48, h: 18 } }; },
  tokPos(k, L) { const t = this.pool[k]; return { x: L.pool.x + 12 + t.u * (L.pool.w - 24), y: L.pool.y + 12 + t.v * (L.pool.h - 24) }; },
  steps: [
    function () { quiz(this, 'This is the <b>gamete pool</b> of a population where <b>70% of alleles are A</b>. Each new beetle gets one allele from an <b>egg</b> and one from a <b>sperm</b>, each drawn from this pool at random. Which genotype will be most common among the offspring?', [['AA', 'AA'], ['Aa', 'Aa'], ['aa', 'aa'], ['eq', 'All equal']], 'AA', 'Let’s draw and see.', () => this.next()); },
    function () { UI.say('Draw eggs and sperm from the pool. Each pair becomes one offspring beetle below. Draw at least 100 and watch the bar.'); this.nb = UI.btn('Next', () => this.next(), 'primary'); this.nb.disabled = true; UI.ctl(UI.row(UI.btn('Draw 1', () => this.draw1(true, 0)), UI.btn('Draw 10', () => { for (let i = 0; i < 10; i++) this.draw1(true, i * 0.14); }), UI.btn('Draw 100', () => { for (let i = 0; i < 90; i++) this.draw1(false); for (let i = 0; i < 10; i++) this.draw1(true, i * 0.1); }), this.nb)); },
    function () { this.showExp = true; const f = frac(this.tally); UI.say('After ' + this.n() + ' offspring: <b>' + pct(f[0]) + ' AA, ' + pct(f[1]) + ' Aa, ' + pct(f[2]) + ' aa</b>. The black markers show where the bar settles with endless drawing: <b>49%, 42% and 9%</b>. Those are the <b>Hardy–Weinberg proportions</b> for p = 0.7, written <span class="fx">p² + 2pq + q²</span>. You found them by drawing from a pool; the next two levels show why those are the numbers.'); UI.ctl(UI.row(UI.btn('One more prediction', () => quiz(this, 'If the pool were <b>50% A and 50% a</b>, what share of offspring would be Aa?', [['25', '25%'], ['50', '50%'], ['75', '75%']], '50', 'Half the draws give two different alleles: A then a, or a then A. So half the offspring are Aa (2 × 0.5 × 0.5).', () => finishLevel('l4', 1 + this.score, '<p><b>Random mating is random drawing from the gene pool.</b> Draw two alleles, independently, again and again, and the offspring settle into fixed proportions set only by p: 49%, 42% and 9% for p = 0.7.</p>')), 'primary'))); }
  ],
  n() { return this.tally[0] + this.tally[1] + this.tally[2]; },
  draw1(vis, delay) {
    const L = this.lay(), i1 = (R() * 40) | 0, i2 = (R() * 40) | 0, a1 = this.pool[i1].al, a2 = this.pool[i2].al, g = gtOf(a1, a2);
    const add = () => { this.tally[GI[g]]++; this.kids.push(g); if (this.kids.length > 120) this.kids.shift(); if (this.nb) this.nb.disabled = this.n() < 100; };
    if (!vis) { add(); return; } const P1 = this.tokPos(i1, L), P2 = this.tokPos(i2, L);
    FX.fly(P1.x, P1.y, L.egg.x, L.egg.y, a1, 0.45, () => FX.fly(L.egg.x, L.egg.y, L.mid.x - 7, L.mid.y, a1, 0.3, null), { delay, lift: 0, r: 8 });
    FX.fly(P2.x, P2.y, L.sperm.x, L.sperm.y, a2, 0.45, () => FX.fly(L.sperm.x, L.sperm.y, L.mid.x + 7, L.mid.y, a2, 0.3, () => { add(); Snd.pop(); FX.ring(L.mid.x, L.mid.y, Pal.ink, 20); }), { delay, lift: 0, r: 8 });
  },
  draw(c) {
    const L = this.lay(); plate(c, L.pool.x, L.pool.y, L.pool.w, L.pool.h, 14, 0.6); ink(c, 'gene pool: 70% A, 30% a', L.pool.x + L.pool.w / 2, L.pool.y - 10, 12, Pal.muted, 'center', 700);
    this.pool.forEach((t, k) => { const P = this.tokPos(k, L); token(c, P.x, P.y, 7, t.al); });
    ink(c, 'egg', L.egg.x, L.egg.y + 18, 12, Pal.muted, 'center', 700); ink(c, 'sperm', L.sperm.x, L.sperm.y + 18, 12, Pal.muted, 'center', 700); c.strokeStyle = hexA(Pal.ink, 0.25); c.setLineDash([3, 3]); c.beginPath(); c.arc(L.egg.x, L.egg.y, 11, 0, TAU); c.moveTo(L.sperm.x + 11, L.sperm.y); c.arc(L.sperm.x, L.sperm.y, 11, 0, TAU); c.stroke(); c.setLineDash([]);
    const pts = field(120, L.nest, 3, { max: 10 }); this.kids.forEach((g, i) => beetle(c, pts[i].x, pts[i].y, Math.min(9, pts[i].s), g, { lens: 'geno', noLetters: true }));
    const n = this.n(); genoBar(c, L.bar.x, L.bar.y, L.bar.w, L.bar.h, n ? frac(this.tally) : [0, 0, 0], { title: n + ' offspring', exp: this.showExp ? hwExp(0.7) : null, expLabel: this.showExp ? '▼ where the bar settles' : '' });
  }
});
