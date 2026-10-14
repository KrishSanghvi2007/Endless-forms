/* ================= Depth pass: Mendel level 2 — two genes and hidden linkage ================= */
function chi3p(x) { const z = Math.sqrt(Math.max(0, x)); return clamp(2 * (1 - normCdf(z)) + Math.sqrt(2 * x / Math.PI) * Math.exp(-x / 2), 0, 1); }
(function () {
  const M = CH_MENDEL, base = { start: M.start, tap: M.tap, update: M.update, draw: M.draw, notes: M.notes };
  M.intro.goal = 'Level 1: find the carriers among six plants within eight crosses. Level 2: work out two genes in four plants, and whether those genes are linked. A star for each level, and a third for solving both in 12 crosses or fewer.';
  M.maths += ' With two genes, a plant carrying one hidden copy of each, crossed with a double recessive, gives four kinds of seed. If the genes sit on different chromosomes they come out 1 : 1 : 1 : 1. If they sit close together on one chromosome, the two parental combinations dominate and the recombinants are rare. A χ² test with three degrees of freedom asks how surprising the counts would be under 1 : 1 : 1 : 1.';
  M.real += ' The first hint of linkage came in 1905, when William Bateson, Edith Saunders and Reginald Punnett crossed sweet peas and found that purple flowers and long pollen grains stayed together far more often than Mendel’s independent assortment allowed. They could not explain it; Morgan’s fly lab did, six years later, with chromosomes.';
  M.start = function () { this.lv = 0; this.l1 = null; base.start.call(this); };
  M.tap = function (x, y) { if (this.lv === 1) return this.tap2(x, y); base.tap.call(this, x, y); };
  M.update = function (dt) { if (this.lv === 1) return this.update2(dt); base.update.call(this, dt); };
  M.draw = function (c, w, h) { if (this.lv === 1) return this.draw2(c, w, h); base.draw.call(this, c, w, h); };
  M.notes = function () { if (this.lv === 1) return this.notes2(); return base.notes.call(this); };
  M.afterL1 = function (all, used, insight) {
    this.l1 = { all, used, insight }; if (all) Snd.star();
    Cards.open({ cls: 'intro', html: '<h3>' + (all ? 'Level 1 passed' : 'Level 1 over') + '</h3><p>' + insight + '</p><h4>Level 2: Two genes</h4><p>Four new plants, all purple-flowered with round seeds. Each may hide a white copy, a wrinkled copy, both or neither. Your tester, T, is white and wrinkled. Work out each plant’s two genes — and whether the two genes are linked on one chromosome or inherited independently.</p>', buttons: [{ t: 'Start level 2', primary: true, fn: () => { Cards.close(); this.begin2(); } }] });
  };
  M.begin2 = function () {
    this.lv = 1; this.sel = null; this.pollen = null; this.tray = null; this.log2 = []; this.budget = 8; this.revealed = false; this.linkAns = null;
    this.linked = R() < 0.5; this.rr = this.linked ? 0.08 : 0.5;
    const kinds = shuffle([['het', 'hom'], ['hom', 'het'], ['hom', 'hom'], ['het', 'het']]).slice(0, 3); kinds.push(['het', 'het']); shuffle(kinds);
    this.pl2 = kinds.map((k, i) => {
      const P = k[0] === 'het' ? [1, 0] : [1, 1], Rr = k[1] === 'het' ? [1, 0] : [1, 1], rep = k[0] === 'het' && k[1] === 'het' && R() < 0.5;
      return { n: 'WXYZ'[i], h: [[P[0], rep ? Rr[1] : Rr[0]], [P[1], rep ? Rr[0] : Rr[1]]], mk: { c: null, s: null }, rep };
    });
    this.pl2.push({ n: 'T', h: [[0, 0], [0, 0]], tester: true });
    HUD.set('<div class="hud-goal"><span><b>Level 2: Two genes</b></span><b id="md-left"></b></div><div class="hud-line" id="md-st"></div><div class="hud-row"><button class="btn" id="md-link">Genes: ?</button><button class="btn primary" id="md-check" disabled>Check</button></div>');
    $('md-link').onclick = () => { this.linkAns = this.linkAns == null ? 'independent' : this.linkAns === 'independent' ? 'linked' : null; Snd.click(); this.upd2(); };
    $('md-check').onclick = () => this.check2(); this.status2('Tap two plants to cross them; sixteen seeds grow. Tap the labels to mark each gene.'); this.upd2();
  };
  M.status2 = function (t) { HUD.line('md-st', t); };
  M.upd2 = function () { $('md-left').textContent = this.budget + ' crosses left'; $('md-link').textContent = 'Genes: ' + (this.linkAns || '?'); $('md-check').disabled = this.revealed || this.linkAns == null || !this.pl2.slice(0, 4).every(p => p.mk.c && p.mk.s); };
  M.pos2 = function (i, w, h) { const s = clamp(Math.min(w / 420, h / 560), 0.72, 1.2); return { x: w * (0.1 + 0.2 * i), fy: h * 0.06 + 16 * s, s }; };
  M.gam2 = function (h) { const a = R() < 0.5 ? 0 : 1; return [h[a][0], R() < this.rr ? h[1 - a][1] : h[a][1]]; };
  M.tap2 = function (x, y) {
    if (this.revealed) return; const w = Stage.w, h = Stage.h;
    for (let i = 0; i < 4; i++) { const { x: px, fy, s } = this.pos2(i, w, h), b1 = fy + 52 * s, P = this.pl2[i]; if (Math.abs(x - px) < 36) { if (y > b1 && y < b1 + 24) { P.mk.c = P.mk.c == null ? 'pure' : P.mk.c === 'pure' ? 'carrier' : null; Snd.click(); this.upd2(); return; } if (y > b1 + 27 && y < b1 + 51) { P.mk.s = P.mk.s == null ? 'pure' : P.mk.s === 'pure' ? 'carrier' : null; Snd.click(); this.upd2(); return; } } }
    for (let i = 0; i < 5; i++) { const { x: px, fy, s } = this.pos2(i, w, h); if (Math.hypot(x - px, y - (fy + 16 * s)) < 30 * s) { this.pick2(i); return; } }
    this.sel = null;
  };
  M.pick2 = function (i) {
    if (this.pollen) return;
    if (this.sel == null) { this.sel = i; Snd.click(); this.status2('<b>' + this.pl2[i].n + '</b> chosen. Now tap its partner, or the same plant to self it.'); return; }
    if (this.budget <= 0) { toast('No crosses left. Mark the genes, decide on linkage, then check.'); this.sel = null; return; }
    const a = this.pl2[this.sel], b = this.pl2[i], kids = []; this.sel = null; this.budget--;
    for (let k = 0; k < 16; k++) { const g1 = this.gam2(a.h), g2 = this.gam2(b.h); kids.push({ c: g1[0] || g2[0], s: g1[1] || g2[1], g: [g1, g2] }); }
    this.pollen = { t: 0 }; this.pending = { a: a.n, b: b.n, kids }; Snd.peck(); this.upd2();
  };
  M.classes = function (kids) { const k = [0, 0, 0, 0]; for (const q of kids) k[(q.c ? 0 : 2) + (q.s ? 0 : 1)]++; return k; };
  M.update2 = function (dt) { if (this.pollen) { this.pollen.t += dt; if (this.pollen.t > 0.7) { this.pollen = null; this.tray = Object.assign({ t: 0 }, this.pending); this.log2.push(this.pending); const k = this.classes(this.pending.kids); this.status2('<b>' + this.pending.a + ' × ' + this.pending.b + '</b>: purple round ' + k[0] + ', purple wrinkled ' + k[1] + ', white round ' + k[2] + ', white wrinkled ' + k[3] + '.'); Snd.dawn(); } } if (this.tray) this.tray.t += dt; };
  M.seed = function (c, x, y, r, round) { c.fillStyle = '#c9b46a'; c.strokeStyle = '#8a7a3a'; c.lineWidth = 1; c.beginPath(); if (round) c.arc(x, y, r, 0, TAU); else { for (let k = 0; k <= 12; k++) { const a = k / 12 * TAU, rr = r * (0.75 + 0.25 * Math.cos(a * 3 + 1)); if (k) c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); else c.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } } c.fill(); c.stroke(); };
  M.draw2 = function (c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dfe7c9'); g.addColorStop(1, '#cdd8b0'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 5; i++) {
      const P = this.pl2[i], { x, fy, s } = this.pos2(i, w, h), purple = !P.tester;
      drawPea(c, x, fy, purple, s, this.sel === i); this.seed(c, x + 16 * s, fy + 42 * s, 5 * s, !P.tester); ink(c, P.n, x, fy - 14 * s, 15, '#27351f', 'center', 'd', 600);
      if (P.tester) { ink(c, 'white,', x, fy + 64 * s, 11, 'rgba(39,53,31,.7)', 'center', 'b', 'italic'); ink(c, 'wrinkled', x, fy + 78 * s, 11, 'rgba(39,53,31,.7)', 'center', 'b', 'italic'); continue; }
      const b1 = fy + 52 * s;
      [['c', 'colour', b1], ['s', 'shape', b1 + 27]].forEach(([k, lab, by]) => { const v = P.mk[k]; c.fillStyle = v === 'pure' ? '#2f7f7a' : v === 'carrier' ? '#b8862a' : 'rgba(39,53,31,.07)'; rrect(c, x - 35, by, 70, 23, 11); c.fill(); c.strokeStyle = 'rgba(39,53,31,.3)'; c.lineWidth = 1; c.stroke(); ink(c, lab + (v ? ': ' + v : ' ?'), x, by + 16, 11, v ? '#f7f3e6' : 'rgba(39,53,31,.75)', 'center', 'b', 600); });
      if (this.revealed) { const hs = P.h, pc = hs[0][0] + hs[1][0], rc = hs[0][1] + hs[1][1], okc = (P.mk.c === 'carrier') === (pc === 1), oks = (P.mk.s === 'carrier') === (rc === 1); ink(c, (pc === 2 ? 'PP' : 'Pp') + ' ' + (rc === 2 ? 'RR' : 'Rr') + (okc && oks ? ' ✓' : ' ✗'), x, b1 + 68, 12, okc && oks ? '#1f7a6e' : '#b8323f', 'center', 'm', 500); if (pc === 1 && rc === 1) ink(c, P.rep ? 'Pr / pR' : 'PR / pr', x, b1 + 82, 11, 'rgba(39,53,31,.75)', 'center', 'm'); }
    }
    if (this.pollen) { c.fillStyle = 'rgba(190,140,30,.9)'; for (let j = 0; j < 8; j++) { c.beginPath(); c.arc(w * (0.2 + 0.6 * ((this.pollen.t * 1.4 + j * 0.1) % 1)), h * 0.34 - Math.sin(j) * 10, 2, 0, TAU); c.fill(); } }
    const y0 = h * 0.5, th = h - y0 - 8; c.fillStyle = 'rgba(39,53,31,.05)'; rrect(c, 8, y0, w - 16, th, 10); c.fill(); c.strokeStyle = 'rgba(39,53,31,.18)'; c.stroke();
    if (!this.tray) { ink(c, 'Sixteen seeds from each cross grow here.', w / 2, y0 + th / 2, 14, 'rgba(39,53,31,.6)', 'center', 'b', 'italic'); return; }
    const T = this.tray, k = this.classes(T.kids); ink(c, T.a + ' × ' + T.b, 18, y0 + 20, 15, '#27351f', 'left', 'd', 600);
    ink(c, 'purple round ' + k[0] + ', purple wrinkled ' + k[1] + ', white round ' + k[2] + ', white wrinkled ' + k[3], w - 16, y0 + 20, 11, 'rgba(39,53,31,.8)', 'right', 'b');
    const cw = (w - 30) / 8, s2 = clamp(th / 190, 0.45, 0.62);
    T.kids.forEach((q, i) => { const gx = 15 + cw * (i % 8) + cw / 2, gy = y0 + 34 + ((i / 8) | 0) * (th - 44) / 2, gr = clamp((T.t - i * 0.03) / 0.35, 0, 1); if (gr <= 0) return; c.save(); c.translate(gx, gy + 40 * s2 * (1 - gr)); c.scale(1, gr); drawPea(c, 0, 0, q.c, s2, false); c.restore(); this.seed(c, gx + 9, gy + 44 * s2, 4, q.s); });
  };
  M.check2 = function () {
    this.revealed = true; let ok = true; for (const P of this.pl2.slice(0, 4)) { const pc = P.h[0][0] + P.h[1][0], rc = P.h[0][1] + P.h[1][1]; if ((P.mk.c === 'carrier') !== (pc === 1) || (P.mk.s === 'carrier') !== (rc === 1)) ok = false; }
    const linkOk = (this.linkAns === 'linked') === this.linked; ok = ok && linkOk; const used2 = 8 - this.budget; this.upd2();
    this.status2((ok ? 'All correct.' : 'Not quite: genotypes are now shown.') + ' The genes were <b>' + (this.linked ? 'linked, 8 map units apart' : 'independent') + '</b>.');
    const s1 = this.l1 && this.l1.all ? 1 : 0, s2 = ok ? 1 : 0, s3 = s1 && s2 && this.l1.used + used2 <= 12 ? 1 : 0;
    const dh = this.log2.filter(L => { const A = this.pl2.find(p => p.n === L.a), B = this.pl2.find(p => p.n === L.b); const dbl = p => p.h[0][0] + p.h[1][0] === 1 && p.h[0][1] + p.h[1][1] === 1; return (dbl(A) && B.tester) || (dbl(B) && A.tester); });
    const insight = (this.l1 && this.l1.all ? 'Level 1: every carrier found. ' : '') + (ok ? 'Level 2: both genes in all four plants, and the linkage question, right. ' : 'Level 2 had a wrong call. ') + 'The decisive cross was a plant hiding both recessives crossed with the tester' + (dh.length ? ' (you made ' + dh.length + ')' : ' — which you never made') + '. If the genes assort independently it gives all four kinds of seed equally; if they are linked, two kinds dominate and the other two are rare recombinants. Which two dominate depends on how the parent’s copies were arranged, so a linked plant can look like either pattern of “parental” types.';
    setTimeout(() => { if (App.mode === this) End.show(this, { stars: s1 + s2 + s3, title: (s1 + s2) + ' of 2 levels solved', insight, leg: legP([[PURPLE, 'purple round'], ['#b38fd0', 'purple wrinkled'], ['#c9b46a', 'white round'], ['#8a7a3a', 'white wrinkled']]), chart: cv => barChart(cv, { groups: this.log2.map(L => { const k = this.classes(L.kids); return { label: L.a + '×' + L.b, parts: [{ v: k[0], c: PURPLE }, { v: k[1], c: '#b38fd0' }, { v: k[2], c: '#c9b46a' }, { v: k[3], c: '#8a7a3a' }] }; }) }), cap: 'Seed classes from each level-2 cross.' }); }, 1800);
  };
  M.notes2 = function () {
    const rows = [['Crosses used in level 2', (8 - this.budget) + ' of 8', '']];
    for (const L of this.log2) { const k = this.classes(L.kids), n = 16, ex = n / 4, x2 = k.reduce((a, v) => a + (v - ex) * (v - ex) / ex, 0); rows.push([L.a + ' × ' + L.b, k.join(' : '), 'Purple round : purple wrinkled : white round : white wrinkled. ' + (k.every(v => v > 0) ? 'If this were a 1 : 1 : 1 : 1 test cross, χ² = ' + x2.toFixed(1) + ', p = ' + chi3p(x2).toFixed(3) + '. Small p means the four classes are too uneven for independent genes.' : 'Some classes are empty: at least one parent carries no hidden copy of one of the genes.')]); }
    return { idea: '<p>Now each plant has two genes: flower colour (purple P masks white p) and seed shape (round R masks wrinkled r). Each plant might hide either recessive, both, or neither.</p><p>The tester T hides nothing: it is white and wrinkled, pp rr. Cross a plant with T and every hidden recessive shows up in its seeds.</p><p>A plant hiding <b>both</b> recessives, crossed with T, gives four kinds of seed. Equal numbers mean the genes are inherited independently. Two big classes and two small ones mean they are <b>linked</b>: close together on one chromosome, and rarely separated by a crossover.</p>', stats: rows, charts: [] };
  };
})();

/* ================= Fisher's Brood, rebuilt: 1 : 1, costly sons, local mate competition ================= */
const CH_BROOD = {
  id: 'brood', B: 4,
  intro: {
    hook: 'You are a wasp mother laying a brood in ten egg-slots, choosing how many will be sons. Three acts: first the open population, where a disease has just killed most males; then a change that makes sons twice as big; then figs, where brothers never leave home.',
    how: 'Use − and + to set your sons, then lay. You score grandchildren. Read each season’s situation carefully: the best brood changes.',
    goal: 'Collect at least 80% of the best possible grandchildren over twelve seasons. Three stars at 95%.'
  },
  real: 'R. A. Fisher (1930) explained why most species make sons and daughters in roughly equal numbers: every offspring has one mother and one father, so the rarer sex always has more offspring per head, until it isn’t rare. His argument is really about investment: if sons cost twice as much to make, mothers should make half as many of them. W. D. Hamilton (1967) showed that when brothers compete with each other for mates — as in fig wasps, whose wingless males never leave their fig — mothers should lay mostly daughters, and fewer so as more mothers share a fig. Allen Herre (1985) found exactly that across fig-wasp species: the more foundresses typically share a fig, the more sons each lays.',
  maths: 'Open population: a daughter is worth B = 4 grandchildren; a son is worth 4 × (females ÷ males). When sons cost two egg-slots, compare value per slot: a son pays only if he is worth more than two daughters, so the population settles at one male per two females by number, equal by investment. Figs with n mothers: the stable share of sons is (n − 1) ÷ 2n: none beyond one fertile son with one mother, a quarter with two, a third with three, three-eighths with four. With a single foundress, unmated daughters could only lay sons, so you need at least one son.',
  ideas: ['<p>Every grandchild has one mother and one father. So all the males together father as many young as all the females mother, and a son’s worth depends on how scarce males are. A daughter is always worth four.</p><p>Everyone else is evolving too: when sons pay, more mothers make sons.</p>', '<p>Sons are now twice as big: each son takes two egg-slots. A son has to be worth more than <b>two</b> daughters to be the better use of space. Watch where the population settles now.</p>', '<p>Inside a fig, your sons never leave: they compete with each other, and with the other mothers’ sons, for the fig’s females. Every extra son mostly steals matings from his own brothers.</p><p>But you must lay at least enough sons to mate your daughters. How many mothers share the fig changes the answer.</p>'],
  FIGN: [1, 2, 4, 2, 1, 3],
  start() {
    this.season = 1; this.m = 0.2; this.sons = 5; this.total = 0; this.best = 0; this.log = []; this.anim = null;
    HUD.set('<div class="hud-goal"><span id="fb-ctx"></span><b id="fb-season"></b></div><div class="hud-line" id="fb-st"></div><div class="hud-row"><div class="stepper"><button id="fb-m" aria-label="Fewer sons">−</button><span id="fb-mix" style="min-width:132px;text-align:center;font-size:15px"></span><button id="fb-p" aria-label="More sons">+</button></div><button class="btn primary" id="fb-go">Lay brood</button></div>');
    $('fb-m').onclick = () => { if (this.anim) return; this.sons = Math.max(0, this.sons - 1); Snd.click(); this.upd(); };
    $('fb-p').onclick = () => { if (this.anim) return; this.sons = Math.min(this.maxS(), this.sons + 1); Snd.click(); this.upd(); };
    $('fb-go').onclick = () => this.lay(); this.upd();
  },
  act() { return this.season <= 3 ? 0 : this.season <= 6 ? 1 : 2; },
  cost() { return this.act() === 1 ? 2 : 1; },
  maxS() { return Math.floor(10 / this.cost()); },
  nF() { return this.FIGN[this.season - 7]; },
  value(s) {
    const d = 10 - this.cost() * s;
    if (this.act() < 2) return this.B * (d + s * (1 - this.m) / this.m);
    const n = this.nF(), f = (n - 1) / (2 * n), So = (n - 1) * 10 * f, Do = (n - 1) * 10 * (1 - f), S = s + So, D = d + Do;
    return S <= 0 ? this.B * d * 0.3 : this.B * (d + s * D / S);
  },
  bestS() { let bs = 0, bv = -1; for (let s = 0; s <= this.maxS(); s++) { const v = this.value(s); if (v > bv + 1e-9) { bv = v; bs = s; } } return [bs, bv]; },
  upd() {
    this.sons = Math.min(this.sons, this.maxS()); const d = 10 - this.cost() * this.sons;
    $('fb-mix').innerHTML = '<b>' + this.sons + '</b> son' + (this.sons === 1 ? '' : 's') + ', <b>' + d + '</b> daughter' + (d === 1 ? '' : 's'); $('fb-go').disabled = !!this.anim;
    $('fb-season').textContent = 'season ' + Math.min(this.season, 12) + ' of 12';
    const a = this.act(); $('fb-ctx').innerHTML = a === 2 ? 'Inside a fig with <b>' + this.nF() + '</b> mother' + (this.nF() > 1 ? 's' : '') : 'Males in the population: <b>' + pct(this.m) + '</b>' + (a === 1 ? ' (sons cost two slots)' : '');
    if (!this.anim) HUD.line('fb-st', this.log.length ? 'Last brood: <b>' + last(this.log).v.toFixed(0) + '</b> grandchildren' + (last(this.log).v >= last(this.log).bv - 0.01 ? ', the best possible.' : ' (best was ' + last(this.log).bv.toFixed(0) + ').') : 'Grandchildren are the only currency.');
  },
  lay() {
    if (this.anim || this.season > 12) return;
    const s = this.sons, v = this.value(s), [bs, bv] = this.bestS(); this.total += v; this.best += bv;
    this.log.push({ season: this.season, act: this.act(), m: this.m, s, share: s * this.cost() / 10, bs, bshare: bs * this.cost() / 10, v, bv, n: this.act() === 2 ? this.nF() : null });
    this.anim = { t: 0, v }; Snd.peck(); HUD.line('fb-st', 'This brood: <b>' + v.toFixed(0) + '</b> grandchildren. The best brood here had ' + bs + ' son' + (bs === 1 ? '' : 's') + ' (' + bv.toFixed(0) + ').'); this.upd();
  },
  update(dt) {
    if (!this.anim) return; this.anim.t += dt; if (this.anim.t < 2.2) return; this.anim = null;
    const a = this.act(); if (a < 2) { const tgt = a === 0 ? 0.5 : 1 / 3; this.m = clamp(this.m + 0.45 * (tgt - this.m) + 0.01 * gauss(), 0.05, 0.95); }
    this.season++;
    if (this.season === 4) Cards.open({ cls: 'intro', html: '<h3>Big sons</h3><p>A change in the host plant means sons now grow twice as large as daughters. Each son takes <b>two</b> egg-slots of your ten.</p><p>Watch the population, and compare a son’s value with two daughters’.</p>', buttons: [{ t: 'Carry on', primary: true, fn: () => Cards.close() }] });
    if (this.season === 7) Cards.open({ cls: 'intro', html: '<h3>Into the figs</h3><p>From now on you lay inside a fig, and sons are back to normal size. Your wingless sons never leave: they mate only with the females in this fig, then die.</p><p>Each season the number of mothers sharing your fig changes. The other mothers have had a long time to evolve: they lay the brood that is best for them.</p>', buttons: [{ t: 'Carry on', primary: true, fn: () => Cards.close() }] });
    if (this.season > 12) { this.finish(); return; } this.upd();
  },
  finish() {
    const e = this.total / this.best, stars = e >= 0.95 ? 3 : e >= 0.88 ? 2 : e >= 0.8 ? 1 : 0, L = this.log, open = L.filter(l => l.act === 0), big = L.filter(l => l.act === 1), fig = L.filter(l => l.act === 2);
    const insight = 'You collected ' + pct(e) + ' of the best possible. When males were rare, sons were gold, and as every mother cashed in, the share of males climbed to ' + pct(last(open).m) + '. When sons cost two slots, the population settled near ' + pct(last(big).m) + ' males by number — equal investment, not equal numbers, just as Fisher’s argument says. In the figs, the best brood tracked the number of mothers: ' + fig.map(f => f.n + ' mother' + (f.n > 1 ? 's' : '') + ', ' + f.bs + ' son' + (f.bs === 1 ? '' : 's')).join('; ') + '. That is Hamilton’s (n − 1) ÷ 2n.';
    End.show(this, { stars, title: 'Twelve seasons laid', insight, leg: legP([['#a8263f', 'your sons (share of slots)'], ['#2f7f7a', 'best brood'], ['#4f6478', 'males in population']]), chart: cv => lineChart(cv, { theme: 'paper', series: [{ d: L.map(l => l.share), c: '#a8263f' }, { d: L.map(l => l.bshare), c: '#2f7f7a', dash: [4, 3] }, { d: L.filter(l => l.act < 2).map(l => l.m), c: '#4f6478' }], y0: 0, y1: 1, xmax: 11, refs: [{ v: 0.5, label: '1 : 1' }], fy: v => pct(v), x0l: 'season 1', xl: 'season 12' }), cap: 'Seasons 1–3 open population, 4–6 big sons, 7–12 figs.' });
  },
  draw(c, w, h) {
    const a = this.act(); c.fillStyle = a === 2 ? '#2a1f24' : a === 1 ? '#2b2a1c' : '#26331f'; c.fillRect(0, 0, w, h); const r = rng(3 + this.season);
    if (a < 2) {
      const n = 60, males = Math.round(n * this.m);
      for (let i = 0; i < n; i++) { const x = 20 + r() * (w - 40), y = 20 + r() * (h * 0.5), male = i < males, bob = Math.sin(App.t * 3 + i) * 1.5, big = male && a === 1 ? 1.5 : 1; c.fillStyle = male ? '#8aa0b8' : '#cf9a33'; c.beginPath(); c.ellipse(x, y + bob, (male ? 3 : 4) * big, (male ? 2 : 2.6) * big, 0, 0, TAU); c.fill(); }
      ink(c, 'the population: ' + pct(this.m) + ' male', 14, h * 0.5 + 40, 13, 'rgba(232,223,201,.7)', 'left', 'b', 'italic');
    } else {
      const n = this.nF(), cx = w / 2, cy = h * 0.33, R0 = Math.min(w, h) * 0.3, g = c.createRadialGradient(cx, cy, 10, cx, cy, R0); g.addColorStop(0, '#d9b98a'); g.addColorStop(0.7, '#9b4f63'); g.addColorStop(1, '#5c2d3c'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R0, 0, TAU); c.fill();
      for (let k = 1; k < n; k++) for (let i = 0; i < 10; i++) { const aa = (k * 10 + i) * 2.39996, rr = R0 * (0.3 + 0.55 * ((k * 10 + i) % 7) / 7); c.fillStyle = i < Math.round(10 * (n - 1) / (2 * n)) ? 'rgba(138,160,184,.55)' : 'rgba(207,154,51,.55)'; c.beginPath(); c.arc(cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr, 3, 0, TAU); c.fill(); }
      ink(c, n === 1 ? 'you are alone in this fig' : (n - 1) + ' other mother' + (n > 2 ? 's’' : '’s') + ' broods (faded)', cx, cy + R0 + 22, 13, 'rgba(232,223,201,.75)', 'center', 'b', 'italic');
    }
    const by = h * 0.8, sp = Math.min(30, (w - 40) / 10); ink(c, 'your ten egg-slots', w / 2, by - 26, 13, 'rgba(232,223,201,.75)', 'center', 'b', 'italic');
    let slot = 0; const drawEgg = (son, idx) => { const cs = son ? this.cost() : 1, x = w / 2 + (slot + cs / 2 - 5) * sp; let y = by; if (this.anim) { const k = clamp((this.anim.t - idx * 0.05) / 0.8, 0, 1); y = by - (son ? 1 : 0.35) * k * h * 0.3 * Math.sin(k * Math.PI / 2); } c.fillStyle = son ? '#8aa0b8' : '#cf9a33'; c.beginPath(); c.ellipse(x, y, 7 * cs + (cs - 1) * 3, 10, 0, 0, TAU); c.fill(); ink(c, son ? '♂' : '♀', x, y + 5, 12, '#1a1a1a', 'center', 'b', 600); slot += cs; };
    for (let i = 0; i < this.sons; i++) drawEgg(true, i); for (let i = 0; i < 10 - this.cost() * this.sons; i++) drawEgg(false, this.sons + i);
    if (this.anim && this.anim.t > 0.9) { c.globalAlpha = clamp((this.anim.t - 0.9) * 2, 0, 1); ink(c, '+' + this.anim.v.toFixed(0) + ' grandchildren', w / 2, by + 38, 20, '#e8dfc9', 'center', 'd', 600); c.globalAlpha = 1; }
  },
  notes() {
    const a = this.act(), s = this.sons, rows = [['Season', Math.min(this.season, 12) + ' of 12', ['Open population.', 'Sons cost two slots.', 'Inside a fig.'][a]]];
    if (a < 2) rows.push(['Males in the population', pct(this.m), ''], ['A son is worth', (this.B * (1 - this.m) / this.m).toFixed(1) + ' grandchildren', '4 × females ÷ males.'], ['A daughter is worth', '4 grandchildren', a === 1 ? 'A son uses two slots, so compare him with two daughters: 8.' : '']);
    else { const n = this.nF(); rows.push(['Mothers in this fig', n + '', ''], ['Their sons', ((n - 1) * 10 * (n - 1) / (2 * n)).toFixed(1), 'Each lays the evolutionarily stable brood, (n − 1) ÷ 2n sons.'], ['Value of your next son', (this.value(Math.min(this.maxS(), s + 1)) - this.value(s)).toFixed(1) + ' grandchildren', 'Adding a son costs you one daughter (4) and gains him a share of the fig’s females.']); }
    rows.push(['Your grandchildren', this.total.toFixed(0), ''], ['Efficiency', this.best ? pct(this.total / this.best) : '—', '']);
    return { idea: this.ideas[a], stats: rows, charts: this.log.length ? [{ title: 'Your broods and the best', leg: legP([['#a8263f', 'yours'], ['#2f7f7a', 'best']]), draw: cv => lineChart(cv, { theme: 'paper', series: [{ d: this.log.map(l => l.share), c: '#a8263f' }, { d: this.log.map(l => l.bshare), c: '#2f7f7a', dash: [4, 3] }], y0: 0, y1: 1, xmax: 11, fy: v => pct(v), x0l: 'season 1', xl: 'season 12' }) }] : [] };
  }
};

/* ================= Alarm Call, rebuilt: inferred kinship, two predators, helpers ================= */
const CH_ALARM = Object.assign({}, CH_ALARM_V1, {
  id: 'alarm', B: 0.4, NR: 8,
  intro: {
    hook: 'You are a female Belding’s ground squirrel. Females stay near the burrow they were born in; males wander off and settle elsewhere. So the squirrels around you are a mix of family and strangers — and nobody is wearing a name tag.',
    how: 'Level 1: a predator is coming. Read the collars — each shows the burrow a squirrel was born in — and the predator, then Call or Stay silent before it arrives. Level 2: as a young bird each spring, choose whether to breed on your own or help your parents.',
    goal: 'At least 7 of 8 good choices in each level for a star each; a third star for 8 of 8 in level 1.'
  },
  real: 'Paul Sherman (1977) found that Belding’s ground squirrels calling at predators were mostly females surrounded by female kin, while males, which disperse, rarely called. The squirrels use two calls: a whistle for hawks, after which callers themselves usually escape, and a trill for coyotes and badgers, which warns relatives at a cost to the caller (Sherman 1985). W. D. Hamilton’s rule explains the pattern: help when relatedness times benefit exceeds cost. Helpers at the nest obey the same arithmetic: when Jan Komdeur (1992) moved Seychelles warblers to islands with empty territories, young birds that would have stayed home as helpers left to breed.',
  ideas: ['<p>Collars show the burrow each squirrel was born in. Yours is ochre. A female with an ochre collar grew up in your burrow: mother, sister or daughter, r = ½. A striped ochre collar means an aunt’s burrow: a cousin, r = ⅛. Grey collars are unrelated. Males you meet have almost all moved in from elsewhere.</p><p>Calling costs you risk and saves your neighbours risk. Against a <b>hawk</b>, calling exposes you badly (cost 0.22). Against a <b>coyote</b> you can call from a burrow mouth (cost 0.08). Each warned neighbour avoids 0.4 of risk. Call when relatedness around you × 0.4 is more than your cost.</p>', CH_ALARM_V1.ideas[1]],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  genRound() {
    const n = 2 + ((R() * 5) | 0), nb = [];
    for (let k = 0; k < n; k++) { const male = R() < 0.3, u = R(); let ring = male ? (u < 0.12 ? 'home' : 'none') : (u < 0.35 ? 'home' : u < 0.7 ? 'aunt' : 'none'); nb.push({ male, ring, r: ring === 'home' ? 0.5 : ring === 'aunt' ? 0.125 : 0 }); }
    const pred = R() < 0.5 ? 'hawk' : 'coyote'; return { nb, pred, c: pred === 'hawk' ? 0.22 : 0.08 };
  },
  beginLevel() {
    this.i = 0; this.right = 0; this.log = []; this.anim = null;
    if (this.lv === 0) { this.order = []; let tries = 0; while (this.order.length < this.NR && tries++ < 500) { const g = this.genRound(), s = g.nb.reduce((a, x) => a + x.r, 0) * this.B; if (Math.abs(s - g.c) > 0.015) this.order.push(g); } HUD.set('<div class="hud-goal"><span><b>Level 1: Read the collars</b></span><b id="al-k"></b></div><div class="hud-line" id="al-st"></div><div class="hud-row"><button class="btn" id="al-s">Stay silent</button><button class="btn primary" id="al-c">Call</button></div>'); }
    else HUD.set('<div class="hud-goal"><span><b>Level 2: Help or breed</b></span><b id="al-k"></b></div><div class="hud-line" id="al-st"></div><div class="hud-row"><button class="btn" id="al-s">Help at home</button><button class="btn primary" id="al-c">Breed on my own</button></div>');
    $('al-s').onclick = () => this.choose(0); $('al-c').onclick = () => this.choose(1); $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; this.round();
  },
  round() { this.t = 0; this.decided = false; this.pos = []; if (this.lv === 0) { const nb = this.order[this.i].nb; nb.forEach((q, k) => this.pos.push(Object.assign({ a: k / nb.length * TAU + 0.4, d: 0.23 + (k % 2) * 0.07 }, q))); } this.upd(); },
  sumR() { return this.order[this.i].nb.reduce((a, x) => a + x.r, 0); },
  upd() {
    $('al-k').textContent = (this.lv === 0 ? 'attack ' : 'spring ') + Math.min(this.i + 1, 8) + ' of 8';
    if (this.lv === 0) { const g = this.order[this.i]; HUD.line('al-st', this.decided ? '' : 'A <b>' + g.pred + '</b> is coming: calling costs you ' + g.c + '. ' + g.nb.length + ' squirrels nearby. ' + Math.max(0, this.lim() - this.t).toFixed(1) + ' s.'); }
    else CH_ALARM_V1.upd.call(this);
    $('al-s').disabled = $('al-c').disabled = this.decided;
  },
  choose(a) {
    if (this.decided) return;
    if (this.lv === 0) { this.decided = true; const g = this.order[this.i], gain = this.sumR() * this.B - g.c, best = gain > 0 ? 1 : 0; if (a === best) this.right++; this.log.push({ sum: this.sumR(), c: g.c, pred: g.pred, a, best, gain }); this.anim = { t: 0, a }; a ? Snd.chime() : Snd.click(); this.upd(); return; }
    CH_ALARM_V1.choose.call(this, a);
  },
  endLevel() {
    if (this.lv === 0) this.l1 = this.log.map(l => ({ need: l.c / this.B, sum: l.sum }));
    const pass = this.right >= 7, perfect = this.right === 8;
    const note = this.lv === 0 ? 'You made the gene-spreading call ' + this.right + ' times in 8. The same neighbours can justify a trill at a coyote but not a whistle at a hawk: the threshold was relatedness above ' + (0.22 / this.B).toFixed(2) + ' for hawks and ' + (0.08 / this.B).toFixed(2) + ' for coyotes.' : 'You chose well in ' + this.right + ' of 8 springs. Helping won with no good territory and full siblings in the nest; breeding won with a good territory, or when the nestlings were only half-siblings.';
    this.res.push({ lv: this.lv, pass, perfect, note }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 2) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const stars = this.res.filter(r => r.pass).length + (this.res[0] && this.res[0].perfect ? 1 : 0); End.show(this, { stars: Math.min(3, stars), title: 'Your genes, counted in relatives', insight: 'Nobody told you who was family: you read it from where they were born, which works because females stay home and males leave. ' + this.res.map(r => r.note).join(' ') + ' That is Hamilton’s rule, r × B > C, and it is why most altruism in nature is aimed at kin.', leg: legP([['#6d8a3a', 'relatedness nearby'], ['#8a3b2a', 'what calling needed']]), chart: cv => barChart(cv, { groups: (this.l1 || []).map((l, k) => ({ label: '' + (k + 1), parts: [{ v: l.sum, c: l.sum > l.need ? '#6d8a3a' : '#b9a58a' }] })) }), cap: 'Level 1: relatedness around you in each attack (green where calling paid).' }); }
  },
  draw(c, w, h) {
    if (this.lv !== 0) return CH_ALARM_V1.draw.call(this, c, w, h);
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dbe7ee'); g.addColorStop(0.35, '#eee7cb'); g.addColorStop(1, '#c8b77f'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.62, s = clamp(w / 360, 0.9, 1.4), A = this.anim, G = this.order[Math.min(this.i, this.order.length - 1)], called = A && A.a;
    const collar = (x, y, ring) => { c.lineWidth = 3; if (ring === 'none') { c.strokeStyle = '#8a8f96'; c.beginPath(); c.arc(x, y, 8 * s, 0, TAU); c.stroke(); return; } c.strokeStyle = '#d19a2e'; c.beginPath(); c.arc(x, y, 8 * s, 0, TAU); c.stroke(); if (ring === 'aunt') { c.strokeStyle = '#fff6df'; c.lineWidth = 1.5; for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.beginPath(); c.arc(x, y, 8 * s, a, a + 0.35); c.stroke(); } } };
    for (const p of this.pos) { const x = cx + Math.cos(p.a) * p.d * w, y = cy + Math.sin(p.a) * p.d * h * 0.5, hide = called && A.t > 0.4; if (hide) { c.fillStyle = '#5a4630'; c.beginPath(); c.ellipse(x, y + 6, 8, 3, 0, 0, TAU); c.fill(); continue; } this.squirrel(c, x, y, s * (p.male ? 1.65 : 1.5), p.male ? '#9a7a55' : '#b58a55', false); collar(x, y - 7 * s, p.ring); ink(c, p.male ? '♂' : '♀', x + 15 * s, y - 14 * s, 13, '#322a18', 'center', 'b', 600); if (A && A.t > 0.9) ink(c, p.r ? 'r ' + (p.r === 0.5 ? '½' : '⅛') : 'r 0', x, y + 30 * s, 10, 'rgba(50,42,24,.8)', 'center', 'm'); }
    this.squirrel(c, cx, cy, s * 1.9, '#c9913f', !!called); collar(cx, cy - 10 * s, 'home'); ink(c, 'you', cx, cy + 38 * s, 13, '#8a3b2a', 'center', 'd', 600);
    if (called && A.t < 1) { c.strokeStyle = 'rgba(138,59,42,' + (1 - A.t) + ')'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(cx, cy - 20, 14 + k * 12 + A.t * 40, -2.4, -0.7); c.stroke(); } }
    const hk = this.decided ? 1 : this.t / this.lim();
    if (G.pred === 'hawk') { const hx = lerp(-40, cx, hk), hy = lerp(h * 0.12, cy - 70, hk * hk); c.fillStyle = 'rgba(40,30,20,.85)'; c.beginPath(); c.moveTo(hx - 26, hy); c.quadraticCurveTo(hx, hy - 12, hx + 26, hy); c.quadraticCurveTo(hx, hy + 6, hx - 26, hy); c.fill(); }
    else { const hx = lerp(w + 40, cx + 60, hk), hy = h * 0.45; c.fillStyle = '#8a6a44'; c.beginPath(); c.ellipse(hx, hy, 22, 9, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(hx - 20, hy - 4); c.lineTo(hx - 34, hy - 10); c.lineTo(hx - 30, hy + 2); c.fill(); c.beginPath(); c.moveTo(hx - 28, hy - 8); c.lineTo(hx - 26, hy - 16); c.lineTo(hx - 22, hy - 8); c.fill(); c.strokeStyle = '#8a6a44'; c.lineWidth = 4; c.beginPath(); c.moveTo(hx + 20, hy); c.quadraticCurveTo(hx + 32, hy - 6, hx + 36, hy + 4); c.stroke(); }
    ink(c, 'collars: ochre = born in your burrow, striped = an aunt’s burrow, grey = elsewhere', w / 2, 18, 11, 'rgba(50,42,24,.75)', 'center', 'b', 'italic');
    if (A && A.t > 0.9) { const L = last(this.log); ink(c, L.a === L.best ? 'good call for your genes' : 'your genes lost out', cx, h * 0.18, 16, L.a === L.best ? '#4f6d2a' : '#8a3b2a', 'center', 'd', 600); ink(c, 'relatedness nearby ' + L.sum.toFixed(3).replace(/0+$/, '').replace(/\.$/, '') + '; calling needed more than ' + (L.c / this.B).toFixed(2), cx, h * 0.18 + 20, 12, '#322a18', 'center', 'b', 'italic'); }
  },
  notes() {
    if (this.lv === 0 && this.order) { const G = this.order[this.i]; return { idea: this.ideas[0], stats: [['Predator', G.pred, 'Cost of calling to you: ' + G.c + '.'], ['Relatedness needed to call', '> ' + (G.c / this.B).toFixed(2), 'Cost ÷ 0.4.'], ['Squirrels nearby', G.nb.length + '', G.nb.filter(x => x.male).length + ' male.'], ['Correct so far', this.right + ' of ' + this.log.length, '']], charts: [] }; }
    return CH_ALARM_V1.notes.call(this);
  }
});
