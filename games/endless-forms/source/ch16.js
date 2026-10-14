/* ================= Chapter: The Fancier (artificial selection, correlated responses) ================= */
const CH_FANCY = {
  id: 'fancier', NP: 24, KEEP: 6,
  theme: { cab: '#f3ead8', hud: '#e8dcc2', text: '#33271a', dim: 'rgba(51,39,26,.68)', line: 'rgba(51,39,26,.2)', acc: '#a0522d', hi: '#4a6fa0', meter: '#6a8a3a', inv: '#fbf6ec' },
  intro: {
    hook: 'Darwin opened the Origin not with finches but with pigeons: breeders had made pouters, fantails and tumblers from one wild species simply by choosing which birds to breed. Level 1: breed for a bigger crest. Level 2: breed silver foxes for one thing only — tameness — and watch what else changes.',
    how: 'Tap to choose six breeders from the twenty-four in front of you, then breed. Their young replace them.',
    goal: 'Level 1: average crest past 70% within seven generations. Level 2: average tameness past 75% within eight. A third star for correctly naming what else changed.'
  },
  real: 'Dmitry Belyaev began selecting farmed silver foxes for tameness in 1959, breeding only the calmest animals each generation. Within about ten generations some foxes wagged their tails and sought human contact; soon after came piebald coats, floppy ears, curled tails and shortened snouts, though nobody had selected for any of them (Trut 1999). The same “domestication syndrome” appears in dogs, pigs, cattle and rabbits. Researchers have proposed several explanations for these correlated traits, including developmental links through the neural crest cells that build pigment, cartilage and parts of the face (Wilkins et al. 2014); the causes remain debated, as does how much of the syndrome was already present in the farm stock (Lord et al. 2020). In this game, the genetic correlation is built into the model.',
  maths: 'The response to selection is R = h²S: the selection differential S (how much better your chosen breeders are than average) times heritability h². Choosing the top quarter of a normal distribution gives S of about 1.3 standard deviations. A second trait responds too, in proportion to its genetic correlation with the one you select: the correlated response is h₁ h₂ r_G S ÷ σ₁. In level 2, most genes that raise tameness also make ears softer and coats patchier.',
  ideas: ['<p>Each pigeon’s crest is partly its genes and partly luck of development. Choose the biggest crests and the next generation is bigger — but only by the genetic part of the difference.</p>', '<p>You can measure each fox’s tameness, and you breed only for that. But genes do more than one thing. Watch the ears and the coats of each new litter.</p>'],
  start() { this.lv = 0; this.res = []; this.quiz = null; this.beginLevel(); },
  beginLevel() {
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; this.gen = 1; this.hist = []; this.sel = new Set();
    this.lay = Gen.layout(this.lv === 0 ? [{ k: 'crest', n: 8, m0: 0.3, s0: 0.1, mu: 0.02, msd: 0.04, ve: 0.08 }] : [{ k: 'core', n: 8, m0: 0.25, s0: 0.1, mu: 0.02, msd: 0.04 }, { k: 'tpriv', n: 3, m0: 0, s0: 0.05, mu: 0.02, msd: 0.03 }, { k: 'epriv', n: 3, m0: 0.05, s0: 0.05, mu: 0.02, msd: 0.03 }]);
    this.pop = []; for (let i = 0; i < this.NP; i++) this.pop.push(this.mk(Gen.genome(this.lay)));
    this.MAXG = this.lv === 0 ? 7 : 8; this.TGT = this.lv === 0 ? 0.7 : 0.75;
    HUD.set(HUD.meterHTML(this.lv === 0 ? 'Average crest' : 'Average tameness') + '<div class="hud-line" id="fa-st"></div><div class="hud-row"><button class="btn" id="fa-auto">Clear choices</button><button class="btn primary" id="fa-go">Breed</button></div>');
    $('fa-auto').onclick = () => { this.sel.clear(); Snd.click(); this.upd(); }; $('fa-go').onclick = () => this.breed(); this.record(); this.upd();
  },
  mk(g) { if (this.lv === 0) return { g, a: Gen.ph(this.lay, g, 'crest') }; const c = Gen.add(this.lay, g, 'core'), tp = Gen.add(this.lay, g, 'tpriv'), ep = Gen.add(this.lay, g, 'epriv'); return { g, a: clamp(c + tp + 0.08 * gauss(), 0, 1), ears: clamp(0.8 * c + ep - 0.1 + 0.06 * gauss(), 0, 1), coat: clamp(0.9 * c + 0.5 * ep - 0.15 + 0.07 * gauss(), 0, 1) }; },
  record() { this.hist.push({ a: mean(this.pop.map(x => x.a)), ears: this.lv ? mean(this.pop.map(x => x.ears)) : null, coat: this.lv ? mean(this.pop.map(x => x.coat)) : null }); },
  upd() { const H = last(this.hist); HUD.meter(H.a, this.TGT, pct(H.a) + ' (goal ' + pct(this.TGT) + ')'); HUD.line('fa-st', 'Generation <b>' + this.gen + '</b> of ' + this.MAXG + '. Chosen: <b>' + this.sel.size + ' of ' + this.KEEP + '</b>. Tap animals to choose breeders' + (this.lv ? ' — each fox’s tameness score is shown.' : '.')); $('fa-go').disabled = this.sel.size !== this.KEEP; },
  cell(i, w, h) { const cols = 6, rows = 4, cw = w / cols, ch = h / rows; return { x: (i % cols) * cw + cw / 2, y: ((i / cols) | 0) * ch + ch / 2, cw, ch }; },
  tap(x, y) { for (let i = 0; i < this.pop.length; i++) { const c = this.cell(i, Stage.w, Stage.h); if (Math.abs(x - c.x) < c.cw / 2 && Math.abs(y - c.y) < c.ch / 2) { if (this.sel.has(i)) this.sel.delete(i); else if (this.sel.size < this.KEEP) this.sel.add(i); else { toast('Six breeders already chosen. Tap one to drop it.'); return; } Snd.click(); this.upd(); return; } } },
  breed() {
    if (this.sel.size !== this.KEEP) return; const par = [...this.sel].map(i => this.pop[i]), kids = [];
    for (let i = 0; i < this.NP; i++) { const a = pick(par); let b = pick(par); if (b === a) b = pick(par); kids.push(this.mk(Gen.mate(this.lay, a.g, b.g))); }
    const S = mean(par.map(x => x.a)) - last(this.hist).a; this.pop = kids; this.sel.clear(); this.gen++; this.record(); const R = last(this.hist).a - this.hist[this.hist.length - 2].a; this.lastSR = { S, R };
    Snd.dawn(); this.upd();
    if (last(this.hist).a >= this.TGT) this.endLevel(true); else if (this.gen > this.MAXG) this.endLevel(false);
  },
  endLevel(pass) {
    const H = this.hist, n = this.gen - 1; this.res.push({ lv: this.lv, pass, n }); if (pass) Snd.star();
    if (this.lv === 0) { this.lv++; Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>Average crest went from ' + pct(H[0].a) + ' to ' + pct(last(H).a) + ' in ' + n + ' generations. Each generation moved by only part of the difference between your breeders and the rest — the heritable part.</p><h4>Level 2: Belyaev’s foxes</h4><p>Farmed silver foxes, mostly wary or aggressive. Each fox has been tested for tameness. Breed only the tamest, and keep an eye on everything else.</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] }); return; }
    const d = [last(H).ears - H[0].ears, last(H).coat - H[0].coat];
    Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Tame foxes' : 'Interesting result') + '</h3><p>Tameness went from ' + pct(H[0].a) + ' to ' + pct(last(H).a) + '. You chose on nothing else. Did anything else change?</p>', buttons: [{ t: 'Nothing else', fn: () => this.answer(false, d) }, { t: 'Ears and coats changed', primary: true, fn: () => this.answer(true, d) }] });
  },
  answer(said, d) {
    Cards.close(); const changed = d[0] > 0.08 || d[1] > 0.08, ok = said === changed; this.quiz = ok; if (ok) Snd.star();
    const stars = this.res.filter(r => r.pass).length + (ok ? 1 : 0), H = this.hist;
    End.show(this, { stars, title: stars + ' of 3 stars', insight: 'Artificial selection is natural selection with a human choosing the survivors: the response is the heritable part of the difference you select. In the foxes, floppy-eared scores went from ' + pct(H[0].ears) + ' to ' + pct(last(H).ears) + ' and patchy coats from ' + pct(H[0].coat) + ' to ' + pct(last(H).coat) + ', though you never chose on them. Most of the genes that raise tameness here also soften ears and break up pigment — pleiotropy — so selecting on one trait drags the others with it, as in Belyaev’s farm.', leg: legP([['#a0522d', 'tameness'], ['#4a6fa0', 'floppy ears'], ['#6a8a3a', 'patchy coat']]), chart: cv => lineChart(cv, { theme: 'paper', series: [{ d: H.map(x => x.a), c: '#a0522d' }, { d: H.map(x => x.ears), c: '#4a6fa0' }, { d: H.map(x => x.coat), c: '#6a8a3a' }], y0: 0, y1: 1, fy: v => pct(v), x0l: 'gen 1', xl: 'gen ' + H.length }), cap: 'Level 2 averages, generation by generation.' });
  },
  update() { },
  draw(c, w, h) {
    c.fillStyle = this.lv ? '#e9e4d2' : '#efe4cc'; c.fillRect(0, 0, w, h);
    this.pop.forEach((x, i) => {
      const C = this.cell(i, w, h), sel = this.sel.has(i), s = Math.min(C.cw, C.ch) / 60;
      c.fillStyle = sel ? 'rgba(160,82,45,.18)' : 'rgba(51,39,26,.04)'; rrect(c, C.x - C.cw / 2 + 2, C.y - C.ch / 2 + 2, C.cw - 4, C.ch - 4, 6); c.fill(); if (sel) { c.strokeStyle = '#a0522d'; c.lineWidth = 2; c.stroke(); }
      c.save(); c.translate(C.x, C.y + 4 * s); c.scale(s, s);
      if (this.lv === 0) { c.fillStyle = '#9aa0a8'; c.beginPath(); c.ellipse(0, 6, 14, 9, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(9, -6, 6, 0, TAU); c.fill(); c.fillStyle = '#d9a03a'; c.beginPath(); c.moveTo(14, -6); c.lineTo(19, -5); c.lineTo(14, -4); c.fill(); const cr = x.a; c.fillStyle = '#e8e2d6'; for (let k = 0; k < 7; k++) { const a = -2.6 + k * 0.35; c.beginPath(); c.ellipse(9 + Math.cos(a) * (5 + 10 * cr), -8 + Math.sin(a) * (5 + 10 * cr), 2 + 2 * cr, 5 * cr + 1, a, 0, TAU); c.fill(); } c.fillStyle = '#111'; c.beginPath(); c.arc(11, -7, 1, 0, TAU); c.fill(); }
      else { const pie = x.coat, ear = x.ears; c.fillStyle = '#6b6f78'; c.beginPath(); c.ellipse(-2, 8, 15, 8, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(10, -4, 8, 0, TAU); c.fill(); if (pie > 0.25) { c.fillStyle = '#f1ede4'; for (let k = 0; k < Math.round(pie * 6); k++) { c.beginPath(); c.ellipse(-8 + k * 4, 6 + (k % 2) * 4, 3 + pie * 2, 2.5, 0.3, 0, TAU); c.fill(); } } c.fillStyle = '#5a5e66'; for (const sx of [5, 13]) { c.save(); c.translate(sx, -10); c.rotate(ear * 1.4 * (sx < 9 ? -1 : 1)); c.beginPath(); c.moveTo(-3, 0); c.lineTo(0, -9); c.lineTo(3, 0); c.fill(); c.restore(); } c.fillStyle = '#111'; c.beginPath(); c.arc(14, -5, 1.2, 0, TAU); c.fill(); }
      c.restore();
      ink(c, (this.lv ? 'tame ' : 'crest ') + Math.round(x.a * 100), C.x, C.y + C.ch / 2 - 6, 10, '#33271a', 'center', 'm');
    });
  },
  notes() { const H = last(this.hist), rows = [['Generation', this.gen + ' of ' + this.MAXG, ''], [this.lv ? 'Average tameness' : 'Average crest', pct(H.a), 'Goal ' + pct(this.TGT) + '.']]; if (this.lastSR) rows.push(['Last selection differential (S)', f2(this.lastSR.S), 'Your breeders minus the generation’s average.'], ['Last response (R)', f2(this.lastSR.R), 'The next generation’s change. R ÷ S estimates heritability: ' + (Math.abs(this.lastSR.S) > 0.01 ? (this.lastSR.R / this.lastSR.S).toFixed(2) : '—') + '.']); if (this.lv) rows.push(['Average ear softness', pct(H.ears), 'Not selected.'], ['Average coat patchiness', pct(H.coat), 'Not selected.']); return { idea: this.ideas[this.lv], stats: rows, charts: this.hist.length > 1 ? [{ title: 'Averages by generation', leg: legP([['#a0522d', this.lv ? 'tameness' : 'crest'], ['#4a6fa0', 'ears'], ['#6a8a3a', 'coat']]), draw: (cv, th) => lineChart(cv, { theme: th, series: [{ d: this.hist.map(x => x.a), c: '#a0522d' }].concat(this.lv ? [{ d: this.hist.map(x => x.ears), c: '#4a6fa0' }, { d: this.hist.map(x => x.coat), c: '#6a8a3a' }] : []), y0: 0, y1: 1, fy: v => pct(v), x0l: 'gen 1', xl: 'gen ' + this.hist.length }) }] : [] }; }
};

/* ================= Chapter: The Coalescent (genealogies backward in time) ================= */
const CH_COAL = {
  id: 'coal', N: 20,
  theme: { cab: '#f1efe8', hud: '#e4e1d4', text: '#262a33', dim: 'rgba(38,42,51,.68)', line: 'rgba(38,42,51,.2)', acc: '#2f6f8f', hi: '#b8562b', meter: '#6a8a3a', inv: '#f8f7f2' },
  intro: {
    hook: 'Look back far enough and any two people share an ancestor. Genetics lets us run evolution backwards: follow two gene copies into the past, generation by generation, until they merge. Level 1: when do two lineages meet? Level 2: when does the whole sample meet? Level 3: read history from the shape of the tree.',
    how: 'Levels 1 and 2: set your prediction with the slider, then trace the lineages back. Level 3: label each tree with the population history that made it.',
    goal: 'Levels 1 and 2 are passed if your predictions average within a factor of two of the truth; level 3 if all three trees are labelled correctly.'
  },
  real: 'John Kingman (1982) showed that the genealogy of a sample, traced backward, has simple mathematics: in a population of N gene copies, any two lineages merge on average N generations ago, with an exponential spread. All of the mitochondrial DNA in living humans traces to one woman who lived perhaps 150,000–200,000 years ago — “mitochondrial Eve” — who was not the only woman alive, merely the one whose mitochondrial line happened not to die out (Cann, Stoneking and Wilson 1987). Because genealogies are shaped by population size, their shapes record history: a population that expanded recently has a star-like tree, and a bottleneck pulls many lineages together at once. Methods such as the pairwise sequentially Markovian coalescent (Li and Durbin 2011) read human population history from a single genome this way.',
  maths: 'In each generation back, a pair of lineages has a 1 in N chance of sharing a parent, so their merging time is roughly exponential with mean N (here N = 20). With n lineages there are n(n − 1)/2 pairs, so merges come fast at first; the last two lineages alone take on average N generations, and the whole sample’s common ancestor is about 2N(1 − 1/n) generations back — for twenty lineages, 38. Most of the depth of a tree is the wait for its final merge.',
  ideas: ['<p>Every individual has one parent in the generation before (think of a mitochondrial or Y-chromosome line). Follow two lineages back: each generation there is a small chance they pick the same parent, and then they are one.</p><p>How long, on average, in a population of twenty?</p>', '<p>Now follow all twenty lineages back. Many pairs merge quickly; then the few remaining lineages take ages to find each other.</p>', '<p>Three populations, three histories. A population that grew recently was tiny in the past, so lineages collapse together far back but stay separate near the present. A bottleneck crushes many lineages together at one moment. A steady population merges them gradually.</p>'],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  sim(sizes) { const G = sizes.length - 1, par = []; for (let g = 0; g < G; g++) { const a = []; for (let i = 0; i < sizes[g]; i++) a.push((R() * sizes[g + 1]) | 0); par.push(a); } return { sizes, par }; },
  trace(P, idx) { let cur = idx.slice(), g = 0; const paths = idx.map(i => [i]); const mergeGen = []; while (new Set(cur).size > 1 && g < P.par.length) { const prev = new Set(cur).size; cur = cur.map(i => P.par[g][i]); cur.forEach((v, k) => paths[k].push(v)); g++; if (new Set(cur).size < prev) mergeGen.push(g); } return { paths, T: g, merges: mergeGen }; },
  beginLevel() {
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 3'; this.trial = 0; this.errs = []; this.shown = null;
    if (this.lv < 2) { this.nTrials = this.lv === 0 ? 5 : 3; this.guess = this.lv === 0 ? 20 : 38; HUD.set('<div class="hud-goal"><span><b>' + (this.lv ? 'Level 2: The whole sample' : 'Level 1: Two lineages') + '</b></span><b id="co-n"></b></div><div class="slider-row"><span>0</span><input type="range" id="co-g" min="1" max="120" step="1" aria-label="Your prediction in generations"><span>120</span></div><div class="hud-line" id="co-st"></div><div class="hud-row"><button class="btn primary" id="co-go">Trace back</button></div>'); const sl = $('co-g'); sl.value = this.guess; sl.oninput = () => { this.guess = +sl.value; this.upd(); }; $('co-go').onclick = () => this.go(); this.newTrial(); }
    else { this.hists = shuffle(['constant', 'expansion', 'bottleneck']); this.labels = [null, null, null]; this.trees = this.hists.map(k => { const sz = []; for (let g = 0; g <= 160; g++) sz.push(k === 'constant' ? 20 : k === 'expansion' ? (g <= 14 ? 20 : 3) : (g >= 8 && g <= 10 ? 2 : 20)); const P = this.sim(sz); return { P, tr: this.trace(P, [...Array(20).keys()]) }; });
      HUD.set('<div class="hud-goal"><span><b>Level 3: Read the trees</b></span><b></b></div><div class="hud-line">Tap each tree’s label to cycle it: steady size, recent expansion, or past bottleneck.</div><div class="hud-row"><button class="btn primary" id="co-ck">Check</button></div>'); $('co-ck').onclick = () => this.check3(); }
  },
  newTrial() { this.P = this.sim(new Array(161).fill(this.N)); this.idx = this.lv === 0 ? shuffle([...Array(this.N).keys()]).slice(0, 2) : [...Array(this.N).keys()]; this.shown = null; this.upd(); },
  upd() { $('co-n').textContent = 'trial ' + Math.min(this.trial + 1, this.nTrials) + ' of ' + this.nTrials; HUD.line('co-st', this.shown ? this.shown.msg : 'Your prediction: <b>' + this.guess + '</b> generations back until ' + (this.lv ? 'all twenty lineages share one ancestor.' : 'the two highlighted lineages meet.')); $('co-go').textContent = this.shown ? (this.trial + 1 >= this.nTrials ? 'Finish' : 'Next trial') : 'Trace back'; },
  go() {
    if (this.shown) { this.trial++; if (this.trial >= this.nTrials) return this.endLevel(); return this.newTrial(); }
    const tr = this.trace(this.P, this.idx), ratio = Math.max(this.guess, tr.T) / Math.max(1, Math.min(this.guess, tr.T)); this.errs.push({ g: this.guess, T: tr.T, ratio });
    this.shown = { tr, t: 0, msg: 'They met <b>' + tr.T + '</b> generations back. You predicted ' + this.guess + ' (off by a factor of ' + ratio.toFixed(1) + '). Average so far: ' + mean(this.errs.map(e => e.T)).toFixed(0) + ' generations.' }; Snd.dawn(); this.upd();
  },
  endLevel() {
    const gm = Math.exp(mean(this.errs.map(e => Math.log(e.ratio)))), pass = gm <= 2, avg = mean(this.errs.map(e => e.T));
    const note = this.lv === 0 ? 'Pairs met on average ' + avg.toFixed(0) + ' generations back (theory: about 20, the population size), but single cases ranged widely — the merging time is exponential, so surprises are normal.' : 'The whole sample met on average ' + avg.toFixed(0) + ' generations back (theory: about 38), only about twice as long as a single pair, because most of the time is spent waiting for the last two lineages.';
    this.res.push({ lv: this.lv, pass, note }); if (pass) Snd.star(); this.lv++;
    Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>Your predictions were off by a typical factor of ' + gm.toFixed(1) + '.</p><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
  },
  check3() {
    if (this.labels.some(l => !l)) { toast('Label all three trees first.'); return; } const ok = this.labels.every((l, i) => l === this.hists[i]); this.res.push({ lv: 2, pass: ok, note: ok ? 'You read all three histories from tree shape alone.' : 'The histories were: ' + this.hists.join(', ') + '.' }); if (ok) Snd.star(); else Snd.miss();
    const stars = this.res.filter(r => r.pass).length; End.show(this, { stars, title: stars + ' of 3 levels', insight: 'Traced backward, genes coalesce. ' + this.res.map(r => r.note).join(' ') + ' A recent expansion leaves a star: lineages stay apart through the big recent population and collapse together deep in the small past. A bottleneck leaves a knot where many lineages merge at once. Reading these shapes from DNA is how we reconstruct population history, including our own.' });
  },
  update(dt) { if (this.shown) this.shown.t += dt; },
  tap(x, y) { if (this.lv !== 2) return; const i = Math.floor(x / (Stage.w / 3)); if (y > Stage.h - 60) { const o = [null, 'constant', 'expansion', 'bottleneck']; this.labels[i] = o[(o.indexOf(this.labels[i]) + 1) % 4]; Snd.click(); } },
  drawTree(c, P, idx, tr, x0, y0, w, h, k, col, gMax) {
    const X = (g, i) => x0 + (i + 0.5) / P.sizes[g] * w, Y = g => y0 + h - h * g / gMax;
    c.fillStyle = 'rgba(38,42,51,.14)'; for (let g = 0; g <= gMax; g += Math.max(1, Math.round(gMax / 40))) for (let i = 0; i < P.sizes[g]; i++) { c.beginPath(); c.arc(X(g, i), Y(g), 1.4, 0, TAU); c.fill(); }
    if (!tr) { idx.forEach(i => { c.fillStyle = col; c.beginPath(); c.arc(X(0, i), Y(0), 4, 0, TAU); c.fill(); }); return; }
    const steps = Math.min(tr.T, Math.floor(k)); c.strokeStyle = col; c.lineWidth = 1.6;
    tr.paths.forEach(p => { c.beginPath(); for (let g = 0; g <= Math.min(steps, p.length - 1); g++) { const x = X(g, p[g]), y = Y(g); g ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.fillStyle = col; c.beginPath(); c.arc(X(0, p[0]), Y(0), 3.5, 0, TAU); c.fill(); });
    if (k >= tr.T) { const p = tr.paths[0], x = X(tr.T, p[tr.T]), y = Y(tr.T); c.fillStyle = '#b8562b'; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); }
  },
  draw(c, w, h) {
    c.fillStyle = '#f5f3ec'; c.fillRect(0, 0, w, h);
    if (this.lv < 2) {
      const gMax = this.shown ? Math.max(40, this.shown.tr.T + 5) : 60; ink(c, 'present', 8, h - 6, 11, 'rgba(38,42,51,.6)', 'left', 'b', 'italic'); ink(c, gMax + ' generations ago', 8, 14, 11, 'rgba(38,42,51,.6)', 'left', 'b', 'italic');
      const gy = h - 24 - (h - 44) * Math.min(this.guess, gMax) / gMax; c.strokeStyle = 'rgba(47,111,143,.6)'; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(0, gy); c.lineTo(w, gy); c.stroke(); c.setLineDash([]); ink(c, 'your prediction', w - 8, gy - 4, 11, '#2f6f8f', 'right', 'b', 600);
      this.drawTree(c, this.P, this.idx, this.shown && this.shown.tr, 10, 20, w - 20, h - 44, this.shown ? this.shown.t * 25 : 0, '#2f6f8f', gMax); return;
    }
    const tw = w / 3; this.trees.forEach((T, i) => { const gMax = Math.max(20, T.tr.T + 2); this.drawTree(c, T.P, [...Array(20).keys()], T.tr, i * tw + 4, 14, tw - 8, h - 90, 999, ['#2f6f8f', '#6a8a3a', '#b8562b'][i], gMax); const lab = this.labels[i]; c.fillStyle = lab ? '#2f6f8f' : 'rgba(38,42,51,.08)'; rrect(c, i * tw + 6, h - 52, tw - 12, 40, 8); c.fill(); ink(c, lab ? { constant: 'steady size', expansion: 'recent expansion', bottleneck: 'past bottleneck' }[lab] : 'tap to label', i * tw + tw / 2, h - 27, 12, lab ? '#fff' : 'rgba(38,42,51,.7)', 'center', 'b', 600); });
  },
  notes() { return { idea: this.ideas[Math.min(2, this.lv)], stats: this.lv < 2 ? [['Population size', this.N + ' gene copies', 'Each generation, a pair of lineages merges with probability 1/20.'], ['Expected pair merging time', '20 generations', 'With a large spread: about a third of pairs take more than 20.'], ['Expected time to a common ancestor of all 20', 'about 38 generations', '2N(1 − 1/n).']].concat(this.errs.map((e, i) => ['Trial ' + (i + 1), e.T + ' (you said ' + e.g + ')', ''])) : [['Trees', '3', 'Each drawn from twenty present-day lineages. Time runs upward; the orange dot is the common ancestor.']], charts: [] }; }
};
