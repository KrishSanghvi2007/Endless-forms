/* ================= Chapter: The Scribe (mutation) ================= */
const GCODE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG', GB = 'TCAG';
const AA3 = { F: 'Phe', L: 'Leu', S: 'Ser', Y: 'Tyr', C: 'Cys', W: 'Trp', P: 'Pro', H: 'His', Q: 'Gln', R: 'Arg', I: 'Ile', M: 'Met', T: 'Thr', N: 'Asn', K: 'Lys', V: 'Val', A: 'Ala', D: 'Asp', E: 'Glu', G: 'Gly', '*': 'stop' };
const BCOL = { A: '#5aa05a', T: '#c9474f', G: '#cf9a33', C: '#4f8fc4' }, COMP = { A: 'T', T: 'A', G: 'C', C: 'G' };
function codonAA(c) { if (c.length < 3) return null; return GCODE[16 * GB.indexOf(c[0]) + 4 * GB.indexOf(c[1]) + GB.indexOf(c[2])]; }
function translate(s) { const out = []; for (let i = 0; i + 3 <= s.length; i += 3) { const a = codonAA(s.slice(i, i + 3)); out.push(a); if (a === '*') break; } return out; }
const CH_SCRIBE = {
  id: 'scribe',
  intro: {
    hook: 'You are DNA polymerase, the enzyme that copies genes before a cell divides. Read the template strand and build its partner: A pairs with T, G pairs with C.',
    how: 'Tap the base that pairs with the glowing one. A wrong tap is a substitution; if you run out of time, the enzyme slips and skips a base. Then watch the cell read your copy.',
    goal: 'Copy three genes, each faster than the last. Keep at least two of the three proteins working. Three stars if all three work.'
  },
  real: 'Real DNA polymerases misplace roughly one base in every 10,000 to 100,000, then proofread their own work and hand over to mismatch-repair enzymes, bringing the final error rate down to about one in a billion or so per base per division. Across a whole genome that still adds up: large sequencing studies find that each child typically carries several dozen new mutations. The number rises with parental age, especially the father’s, because sperm-making cells keep dividing throughout a man’s life. Kong et al. (2012) estimated about two extra mutations per year of paternal age; later work also found a smaller maternal-age effect (Jónsson et al. 2017), and rates vary among studies and families. Replication errors are only one source: DNA damage, repair, recombination and transposable elements all create mutations too.',
  maths: 'The genetic code has 64 three-letter codons but only 20 amino acids plus “stop”, so most amino acids have several codons that differ only in the third letter. A random substitution at a third position is silent about 70% of the time; at a first or second position it almost always changes the amino acid. Deleting a single base shifts every codon after it (a frameshift), which usually ruins everything downstream.',
  idea: '<p>A gene is read in three-letter <b>codons</b>, each naming one amino acid. The protein is the chain of amino acids.</p><p>A <b>mutation</b> is any change in DNA sequence. Copying mistakes like the ones you are about to make are one way mutations arise; damaged DNA, faulty repair and jumping genes are others. Some change nothing, because several codons name the same amino acid. Some swap one amino acid for another. Some create a <b>stop</b> codon and cut the protein short. A skipped base shifts the whole reading frame.</p><p>Mistakes happen whether or not they would help. That is why mutation is called <b>random</b>: random with respect to what the organism needs.</p>',
  GENES: ['ATGGCTAAAGGCTTCCGAGAATGGCACTAA', 'ATGTCCGAACTGAAATACGGTCCCATCTGA', 'ATGAAGCGTTTAGACGGCTGGTATCCATAG'], PER: [1.6, 1.1, 0.8],
  start() {
    this.round = 0; this.results = []; this.state = 'copy'; this.newRound();
    HUD.set('<div class="hud-goal"><span id="sc-l"></span><b id="sc-r"></b></div><div class="timer" style="height:6px;border-radius:3px;background:rgba(232,223,201,.12);overflow:hidden;margin:6px 0"><i id="sc-t" style="display:block;height:100%;background:var(--ochre);transform-origin:left"></i></div><div class="hud-row" id="sc-keys">' + 'ATGC'.split('').map(b => '<button class="btn" data-k="' + b + '" style="font:600 22px var(--fd);color:' + BCOL[b] + ';border-color:' + BCOL[b] + '">' + b + '</button>').join('') + '</div><div class="hud-row"><button class="btn primary" id="sc-next" style="display:none">Next gene</button></div><div class="hud-line">A pairs with T. G pairs with C.</div>');
    $('hud').querySelectorAll('[data-k]').forEach(b => b.onclick = () => this.key(b.dataset.k)); $('sc-next').onclick = () => this.next(); this.upd();
  },
  newRound() { this.gene = this.GENES[this.round]; this.pos = 0; this.typed = ''; this.events = []; this.tb = this.PER[this.round]; this.state = 'copy'; this.reveal = 0; },
  upd() { $('sc-l').textContent = 'Gene ' + (this.round + 1) + ' of 3'; $('sc-r').textContent = this.state === 'copy' ? 'base ' + Math.min(this.pos + 1, 30) + ' of 30' : ''; $('sc-keys').style.display = this.state === 'copy' ? 'flex' : 'none'; $('sc-next').style.display = this.state === 'read' ? '' : 'none'; $('sc-next').textContent = this.round >= 2 ? 'See what you made' : 'Next gene'; },
  key(b) { if (this.state !== 'copy' || App.paused) return; const want = this.gene[this.pos]; this.typed += b; if (b !== want) { this.events.push({ i: this.pos, k: 'sub', from: want, to: b }); Snd.miss(); } else Snd.click(); this.advance(); },
  advance() { this.pos++; this.tb = this.PER[this.round]; if (this.pos >= 30) this.finishCopy(); this.upd(); },
  update(dt) { if (this.state === 'copy') { this.tb -= dt; const t = $('sc-t'); if (t) t.style.transform = 'scaleX(' + clamp(this.tb / this.PER[this.round], 0, 1) + ')'; if (this.tb <= 0) { this.events.push({ i: this.pos, k: 'del', from: this.gene[this.pos] }); Snd.bitter(); this.advance(); } } else this.reveal += dt; },
  classify() {
    const orig = translate(this.gene), mine = translate(this.typed), del = this.events.find(e => e.k === 'del'), subs = this.events.filter(e => e.k === 'sub');
    const r = { orig, mine, silent: 0, missense: 0, nonsense: 0, frameshift: !!del && del.i < 27, startLost: this.typed.slice(0, 3) !== 'ATG', stopLost: false, third: 0, thirdSilent: 0 };
    if (!r.frameshift) for (const e of subs) { const ci = (e.i / 3) | 0, a0 = orig[ci], a1 = codonAA(this.typed.slice(ci * 3, ci * 3 + 3)); if (e.i % 3 === 2) r.third++; if (a1 === a0) { r.silent++; if (e.i % 3 === 2) r.thirdSilent++; } else if (a1 === '*') r.nonsense++; else if (a0 === '*') r.stopLost = true; else r.missense++; }
    r.works = !r.frameshift && !r.startLost && r.nonsense === 0 && r.missense <= 1;
    r.verdict = r.startLost ? 'No start signal: this protein is never made.' : r.frameshift ? 'A skipped base shifted the reading frame: everything after it is gibberish.' : r.nonsense ? 'A stop codon appeared early: the protein is cut short and useless.' : r.missense > 1 ? r.missense + ' amino acids changed: the protein probably no longer folds properly.' : r.missense === 1 ? 'One amino acid changed. The protein probably still works, maybe a little differently.' : subs.length ? 'Every mistake was silent: same amino acids, same protein.' : 'A perfect copy.';
    return r;
  },
  finishCopy() { this.state = 'read'; this.reveal = 0; const r = this.classify(); r.errors = this.events.length; this.results.push(r); Snd.dawn(); this.upd(); },
  next() { if (this.round >= 2) { this.end(); return; } this.round++; this.newRound(); this.upd(); },
  end() {
    const w = this.results.filter(r => r.works).length, stars = w >= 3 ? 3 : w;
    const E = this.results.reduce((a, r) => a + r.errors, 0), S = this.results.reduce((a, r) => a + r.silent, 0), M = this.results.reduce((a, r) => a + r.missense, 0), X = this.results.filter(r => r.nonsense || r.frameshift || r.startLost).length;
    const insight = 'You made ' + E + ' mistake' + (E === 1 ? '' : 's') + ' in 90 bases' + (E ? ': ' + S + ' silent, ' + M + ' changed an amino acid, and ' + X + ' gene' + (X === 1 ? '' : 's') + ' ended up broken by an early stop, a skipped base or a lost start.' : '.') + ' Mutations are simply copying errors, and they happen without regard to whether they would help. The genetic code softens some of them — a slip in the third letter of a codon is often silent — but of the mistakes that change anything, most make things worse. Rarely, one helps, and that rare one is what selection can work with.';
    End.show(this, { stars, title: w + ' of 3 proteins working', insight, leg: legP([['#2f7f7a', 'silent'], ['#b8862a', 'amino acid changed'], ['#a8263f', 'stop, skip or lost start']]), chart: cv => barChart(cv, { groups: this.results.map((r, i) => ({ label: 'gene ' + (i + 1), parts: [{ v: r.silent, c: '#2f7f7a' }, { v: r.missense, c: '#b8862a' }, { v: (r.nonsense || r.frameshift || r.startLost) ? 1 : 0, c: '#a8263f' }] })) }), cap: 'Your mistakes in each gene, by what they did to the protein.' });
  },
  draw(c, w, h) {
    c.fillStyle = '#172322'; c.fillRect(0, 0, w, h);
    const tile = Math.min(34, (w - 20) / 9.2), cx = w / 2, midY = h * 0.34;
    if (this.state === 'copy') {
      ink(c, 'template strand', 12, midY - tile - 16, 12, 'rgba(232,223,201,.6)', 'left', 'b', 'italic');
      ink(c, 'your copy', 12, midY + tile + 30, 12, 'rgba(232,223,201,.6)', 'left', 'b', 'italic');
      for (let k = -4; k <= 4; k++) {
        const i = this.pos + k; if (i < 0 || i >= 30) continue; const x = cx + k * (tile + 4) - tile / 2, tb = COMP[this.gene[i]];
        c.globalAlpha = k === 0 ? 1 : 0.55; c.fillStyle = BCOL[tb]; rrect(c, x, midY - tile - 4, tile, tile, 6); c.fill(); ink(c, tb, x + tile / 2, midY - tile / 2 + 3, 18, '#101814', 'center', 'd', 600);
        if (k < 0) { const e = this.events.find(e => e.i === i), got = e && e.k === 'del' ? '·' : this.typed[i - this.events.filter(e => e.k === 'del' && e.i < i).length]; if (got && got !== '·') { c.fillStyle = BCOL[got]; rrect(c, x, midY + 4, tile, tile, 6); c.fill(); ink(c, got, x + tile / 2, midY + tile / 2 + 11, 18, '#101814', 'center', 'd', 600); if (e) { c.strokeStyle = '#ff9aa9'; c.lineWidth = 2; rrect(c, x - 2, midY + 2, tile + 4, tile + 4, 7); c.stroke(); } } else { ink(c, 'skipped', x + tile / 2, midY + tile / 2 + 8, 10, '#ff9aa9', 'center', 'b'); } }
        c.globalAlpha = 1;
      }
      c.strokeStyle = '#cf9a33'; c.lineWidth = 2; rrect(c, cx - tile / 2 - 5, midY - tile - 9, tile + 10, tile * 2 + 18, 10); c.stroke();
      ink(c, 'codon ' + (((this.pos / 3) | 0) + 1) + ' of 10, letter ' + (this.pos % 3 + 1), cx, midY + tile + 58, 13, 'rgba(232,223,201,.7)', 'center', 'b');
      return;
    }
    const r = last(this.results), orig = r.orig, mine = r.mine, bw = (w - 20) / 10, k = clamp(this.reveal / 2.2, 0, 1);
    ink(c, 'The cell reads your copy', w / 2, 34, 18, '#e8dfc9', 'center', 'd', 600);
    ink(c, 'original protein', 10, 70, 12, 'rgba(232,223,201,.6)', 'left', 'b', 'italic'); ink(c, 'your protein', 10, 142, 12, 'rgba(232,223,201,.6)', 'left', 'b', 'italic');
    for (let i = 0; i < 10; i++) {
      const x = 10 + i * bw; c.fillStyle = 'rgba(232,223,201,.12)'; rrect(c, x + 2, 78, bw - 4, 40, 6); c.fill(); ink(c, AA3[orig[i]] || '', x + bw / 2, 103, 12, '#e8dfc9', 'center', 'm');
      if (i / 10 > k) continue; const a = mine[i];
      if (a == null) { ink(c, '—', x + bw / 2, 175, 14, 'rgba(232,223,201,.4)', 'center', 'm'); continue; }
      const col = a === orig[i] ? (this.typed.slice(i * 3, i * 3 + 3) === this.gene.slice(i * 3, i * 3 + 3) ? 'rgba(232,223,201,.12)' : '#2f7f7a') : a === '*' || r.frameshift ? '#a8263f' : '#b8862a';
      c.fillStyle = col; rrect(c, x + 2, 150, bw - 4, 40, 6); c.fill(); ink(c, AA3[a] || '?', x + bw / 2, 175, 12, '#f4efe2', 'center', 'm');
    }
    if (k >= 1) { c.font = font(15, 'b'); c.fillStyle = r.works ? '#8fd6c9' : '#ff9aa9'; c.textAlign = 'center'; wrapText(c, (r.works ? 'Working. ' : 'Broken. ') + r.verdict, w / 2, 230, w - 40, 21); }
    const lg = [['#2f7f7a', 'silent change'], ['#b8862a', 'different amino acid'], ['#a8263f', 'stop or frameshift']]; lg.forEach(([cc, t], i) => { c.fillStyle = cc; c.fillRect(20, h - 70 + i * 20, 12, 12); ink(c, t, 40, h - 60 + i * 20, 12, 'rgba(232,223,201,.75)', 'left', 'b'); });
  },
  notes() {
    const rows = []; const E = this.results.reduce((a, r) => a + r.errors, 0) + (this.state === 'copy' ? this.events.length : 0), done = this.results.length * 30 + (this.state === 'copy' ? this.pos : 0);
    rows.push(['Your error rate', done ? (E / done * 100).toFixed(1) + '% per base' : '—', 'A real polymerase with proofreading and repair: about 0.0000001% per base.']);
    this.results.forEach((r, i) => rows.push(['Gene ' + (i + 1), r.works ? 'working' : 'broken', r.errors + ' mistake' + (r.errors === 1 ? '' : 's') + ': ' + r.silent + ' silent, ' + r.missense + ' amino-acid change' + (r.missense === 1 ? '' : 's') + (r.nonsense ? ', an early stop' : '') + (r.frameshift ? ', a frameshift' : '') + (r.startLost ? ', a lost start' : '') + '.']));
    const T3 = this.results.reduce((a, r) => a + r.third, 0), T3s = this.results.reduce((a, r) => a + r.thirdSilent, 0);
    if (T3) rows.push(['Third-letter mistakes that were silent', T3s + ' of ' + T3, 'The code is redundant in the third letter, so many slips there change nothing.']);
    return { idea: this.idea, stats: rows, charts: [] };
  }
};

/* ================= Chapter: The Sieve (directional, stabilising, disruptive) ================= */
const CH_SIEVE = {
  id: 'sieve', N: 240, NB: 24, LO: 0.1, HI: 0.9,
  traits: [{ k: 'beak', n: 10, m0: 0.45, s0: 0.10, mu: 0.02, msd: 0.03, ve: 0.06 }],
  intro: {
    hook: 'Two hundred and forty ground finches, lined up by beak depth. Each winter, the seeds that are left decide who survives — and you decide the seeds.',
    how: 'Draw a survival curve with your finger in the band above the finches: high means that beak size survives the winter, low means it starves. Then run the winter. Survivors breed.',
    goal: 'Three missions of six winters, one star each: move the average, narrow the spread, widen it. At least 30% must survive each winter.'
  },
  real: 'Peter and Rosemary Grant watched this happen on Daphne Major in the Galápagos. In the 1977 drought only large, hard seeds remained; medium ground finches with deeper beaks survived, and the next generation’s beaks were measurably deeper (Boag and Grant 1981). Stabilising selection is everywhere once you look: human babies of middling birth weight historically survived best (Karn and Penrose 1951). Disruptive selection is rarer to catch. In black-bellied seedcrackers in Cameroon, small-billed and large-billed birds specialise on soft and hard seeds, and their two bill sizes are kept apart by a single gene (Smith 1993).',
  maths: 'Selection acts on the phenotype in one generation (S), and the population responds in the next according to heritability (R = h²S), exactly as in the Lichen Wood. Directional selection moves the mean. Stabilising selection removes both tails, reducing variance; disruptive selection removes the middle, increasing it. But with many genes and random mating, two extreme parents have middling offspring, so disruptive selection widens the distribution without splitting it into two peaks. Splitting needs mates that resemble each other, or a single gene of big effect.',
  idea: '<p>Selection is a sieve with holes of different sizes. What passes depends on the <b>shape</b> of the survival curve you draw, not on anything the birds want.</p><p><b>Directional</b> selection favours one end and moves the average. <b>Stabilising</b> selection favours the middle and trims the spread. <b>Disruptive</b> selection favours both ends and widens it.</p><p>Watch the offspring after each winter. They are pulled back toward the middle, because part of every bird’s beak size is luck, not genes.</p>',
  MISSIONS: [
    { k: 'dir', t: 'Drought', d: 'Only big, hard seeds are left. Raise the average beak depth past 11.0 mm.', test: (S, M) => S.mean >= 0.625, prog: (S, M) => clamp((S.mean - M.m0) / (0.625 - M.m0), 0, 1) },
    { k: 'stab', t: 'A steady year', d: 'Keep the average within 0.3 mm of where it starts, but cut the spread by 12%.', test: (S, M) => S.sd <= 0.88 * M.s0 && Math.abs(S.mean - M.m0) <= 0.0375, prog: (S, M) => clamp((M.s0 - S.sd) / (0.12 * M.s0), 0, 1) },
    { k: 'dis', t: 'Two kinds of seed', d: 'Only tiny and huge seeds are left. Widen the spread by 40%.', test: (S, M) => S.sd >= 1.4 * M.s0, prog: (S, M) => clamp((S.sd - M.s0) / (0.4 * M.s0), 0, 1) }
  ], WINTERS: 6,
  mm(z) { return (6 + 8 * z).toFixed(1); },
  start() {
    this.lay = Gen.layout(this.traits.map(s => Object.assign({}, s)));
    this.pop = []; for (let i = 0; i < this.N; i++) this.pop.push(this.mk(Gen.genome(this.lay)));
    this.fit = new Array(this.NB).fill(1); this.mi = 0; this.got = []; this.log = []; this.anim = null; this.lastPt = null;
    this.beginMission();
  },
  mk(g) { return { g, z: Gen.ph(this.lay, g, 'beak') }; },
  stats(pop) { const zs = pop.map(x => x.z), m = mean(zs); return { mean: m, sd: Math.sqrt(mean(zs.map(z => (z - m) ** 2))), n: pop.length }; },
  beginMission() {
    const M = this.MISSIONS[this.mi], s = this.stats(this.pop); M.m0 = s.mean; M.s0 = s.sd; M.target = s.mean; M.fail = null; this.winter = 0; this.fit.fill(1);
    HUD.set(HUD.meterHTML('<b>' + M.t + '.</b> ' + M.d) + '<div class="hud-line" id="sv-st"></div><div class="hud-row"><button class="btn" id="sv-reset">Flatten curve</button><button class="btn primary" id="sv-go">Run the winter</button></div>');
    $('sv-reset').onclick = () => { this.fit.fill(1); Snd.click(); this.upd(); }; $('sv-go').onclick = () => this.run();
    this.upd();
  },
  bin(z) { return clamp(Math.floor((z - this.LO) / (this.HI - this.LO) * this.NB), 0, this.NB - 1); },
  expected() { let s = 0; for (const x of this.pop) s += this.fit[this.bin(x.z)]; return s / this.pop.length; },
  upd() {
    const M = this.MISSIONS[this.mi], S = this.stats(this.pop), e = this.expected(); if (!M) return;
    HUD.meter(M.prog(S, M), null, 'winter ' + this.winter + ' of ' + (M.winters || this.WINTERS));
    HUD.line('sv-st', 'Average <b>' + this.mm(S.mean) + ' mm</b>, spread (SD) <b>' + (8 * S.sd).toFixed(2) + ' mm</b>' + (M.k !== 'dir' ? ' (started ' + (8 * M.s0).toFixed(2) + ')' : '') + '. This curve lets about <b>' + pct(e) + '</b> survive.' + (e < 0.3 ? ' Too harsh: the population would crash.' : ''));
    if (M.delta) HUD.line('sv-st', 'Average <b>' + this.mm(S.mean) + ' mm</b>; the best beak is now <b>' + this.mm(M.target) + ' mm</b>, ' + (8 * (M.target - S.mean)).toFixed(2) + ' mm ahead (starvation beyond 1 mm). This curve lets about <b>' + pct(e) + '</b> survive.' + (e < 0.3 ? ' Too harsh.' : ''));
    $('sv-go').disabled = !!this.anim || e < 0.3; $('bar-gen').textContent = 'mission ' + (this.mi + 1) + ' of ' + this.MISSIONS.length;
  },
  geo(w, h) { return { bx: 14, bw: w - 28, by: 28, bh: h * 0.26, hy0: h * 0.36, hy1: h - 34 }; },
  down(x, y) { this.lastPt = null; this.paint(x, y); },
  move(x, y) { this.paint(x, y); },
  up() { this.lastPt = null; this.upd(); },
  paint(x, y) {
    if (this.anim) return; const G = this.geo(Stage.w, Stage.h); const v = clamp(1 - (y - G.by) / G.bh, 0, 1), b = clamp(Math.floor((x - G.bx) / G.bw * this.NB), 0, this.NB - 1);
    if (this.lastPt) { const [b0, v0] = this.lastPt, n = Math.abs(b - b0); for (let k = 0; k <= n; k++) { const bb = b0 + Math.sign(b - b0) * k; this.fit[bb] = n ? lerp(v0, v, k / n) : v; } } else this.fit[b] = v;
    this.lastPt = [b, v]; this.upd();
  },
  run() {
    if (this.anim || this.expected() < 0.3) return;
    const before = this.stats(this.pop); for (const x of this.pop) x.dead = R() >= this.fit[this.bin(x.z)];
    const surv = this.pop.filter(x => !x.dead); if (surv.length < 4) return;
    this.anim = { t: 0, before, surv: this.stats(surv) }; Snd.flood(); this.upd();
  },
  update(dt) {
    if (!this.anim) return; this.anim.t += dt;
    if (this.anim.t > 1.4 && !this.anim.bred) {
      this.anim.bred = true; const surv = this.pop.filter(x => !x.dead), kids = [];
      for (let i = 0; i < this.N; i++) { const a = pick(surv); let b = pick(surv); if (b === a) b = pick(surv); kids.push(this.mk(Gen.mate(this.lay, a.g, b.g))); }
      this.pop = kids; this.winter++; const after = this.stats(this.pop), M = this.MISSIONS[this.mi];
      this.log.push({ mission: M.k, before: this.anim.before, surv: this.anim.surv, after, fit: this.fit.slice() });
      if (M.delta) { M.target += M.delta; const lag = M.target - after.mean; if (Math.abs(lag) > 0.125) { toast(M.t + ': the best beak moved ' + (8 * lag).toFixed(1) + ' mm ahead of the average. The population starved.'); M.fail = this.winter; this.nextMission(); } else if (this.winter >= M.winters) { this.got.push(M.k); Snd.star(); toast('<b>★</b> ' + M.t + ': kept up for ' + M.winters + ' winters.'); this.nextMission(); } else this.upd(); }
      else if (M.test(after, M)) { this.got.push(M.k); Snd.star(); toast('<b>★</b> ' + M.t + ': done in ' + this.winter + ' winter' + (this.winter > 1 ? 's' : '') + '.'); this.nextMission(); }
      else if (this.winter >= this.WINTERS) { toast(M.t + ': out of winters.'); this.nextMission(); }
      else this.upd();
    }
    if (this.anim && this.anim.t > 2.0) { this.anim = null; this.upd(); }
  },
  nextMission() { this.anim = null; this.mi++; if (this.mi >= this.MISSIONS.length) { this.end(); return; } this.beginMission(); },
  end() {
    const n = this.got.length, d = this.log.filter(l => l.mission === 'dis');
    const insight = 'You completed ' + n + ' of 3 missions. Directional selection moved the average; stabilising selection trimmed both tails, but only slowly, because every generation of chicks refills them: genes reshuffle, and luck of development adds its own spread; disruptive selection widened the spread. Notice what disruptive selection didn’t do: it never split the finches into two separate peaks. With many genes and random mating, two extreme parents have middling chicks, so the middle keeps refilling. Two peaks need mates that choose alike, or a single gene of large effect — the seedcrackers’ trick. The moving target sets a speed limit: selection can drag a population only as fast as heritable variation and survivable losses allow, and faster change leaves it behind.';
    End.show(this, { stars: n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0, title: n + ' of 5 missions', insight, leg: legP([['#2f7f7a', 'average beak depth'], ['#8a5d10', 'spread (SD × 4, to share the scale)']]), chart: cv => this.chart(cv, 'paper'), cap: 'After each winter. Missions run left to right.' });
  },
  chart(cv, th) { const L = this.log; lineChart(cv, { theme: th, series: [{ d: L.map(l => 6 + 8 * l.after.mean), c: '#2f7f7a' }, { d: L.map(l => 8 + 8 * 4 * l.after.sd), c: '#8a5d10', dash: [4, 3] }], y0: 7, y1: 14, fy: v => v.toFixed(0) + ' mm', x0l: 'winter 1', xl: 'winter ' + Math.max(1, L.length) }); },
  draw(c, w, h) {
    c.fillStyle = '#2a2a1e'; c.fillRect(0, 0, w, h); const G = this.geo(w, h);
    c.fillStyle = 'rgba(232,223,201,.05)'; rrect(c, G.bx, G.by, G.bw, G.bh, 8); c.fill(); c.strokeStyle = 'rgba(232,223,201,.2)'; c.lineWidth = 1; c.stroke();
    ink(c, 'survives', G.bx + 6, G.by + 14, 11, 'rgba(232,223,201,.55)', 'left', 'b', 'italic'); ink(c, 'starves', G.bx + 6, G.by + G.bh - 6, 11, 'rgba(232,223,201,.55)', 'left', 'b', 'italic');
    if (this.winter === 0 && !this.anim && this.fit.every(v => v === 1)) ink(c, 'draw here with your finger', G.bx + G.bw / 2, G.by + G.bh / 2 + 5, 14, 'rgba(232,223,201,.55)', 'center', 'b', 'italic');
    c.strokeStyle = '#cf9a33'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath();
    for (let b = 0; b < this.NB; b++) { const x = G.bx + (b + 0.5) / this.NB * G.bw, y = G.by + (1 - this.fit[b]) * G.bh; if (b) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke();
    const cols = new Array(this.NB).fill(0), cw = G.bw / this.NB; let mx = 1; for (const x of this.pop) mx = Math.max(mx, ++cols[this.bin(x.z)]); cols.fill(0);
    const r = Math.max(1.4, Math.min(cw * 0.42, (G.hy1 - G.hy0) / mx / 2.1)), k = this.anim ? clamp(this.anim.t / 1.1, 0, 1) : 0;
    for (const x of this.pop) {
      const b = this.bin(x.z), n = cols[b]++, px = G.bx + (b + 0.5) * cw, py = G.hy1 - r - n * r * 2.1, f = this.fit[b];
      if (x.dead && k > 0) { c.globalAlpha = 1 - k; c.fillStyle = '#a8263f'; c.beginPath(); c.arc(px, py + k * 20, r, 0, TAU); c.fill(); c.globalAlpha = 1; continue; }
      c.fillStyle = css(mix([168, 38, 63], [232, 223, 201], f)); c.beginPath(); c.arc(px, py, r, 0, TAU); c.fill();
    }
    c.strokeStyle = 'rgba(232,223,201,.3)'; c.beginPath(); c.moveTo(G.bx, G.hy1 + 2); c.lineTo(G.bx + G.bw, G.hy1 + 2); c.stroke();
    ink(c, this.mm(this.LO) + ' mm', G.bx, G.hy1 + 18, 11, 'rgba(232,223,201,.6)', 'left', 'm'); ink(c, 'beak depth', G.bx + G.bw / 2, G.hy1 + 18, 11, 'rgba(232,223,201,.6)', 'center', 'b', 'italic'); ink(c, this.mm(this.HI) + ' mm', G.bx + G.bw, G.hy1 + 18, 11, 'rgba(232,223,201,.6)', 'right', 'm');
    const S = this.stats(this.pop), mx0 = G.bx + (S.mean - this.LO) / (this.HI - this.LO) * G.bw; c.strokeStyle = '#8fd6c9'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(mx0, G.hy0 - 4); c.lineTo(mx0, G.hy1); c.stroke(); c.setLineDash([]);
    { const M = this.MISSIONS[this.mi]; if (M && M.delta) { const tx = G.bx + (M.target - this.LO) / (this.HI - this.LO) * G.bw; c.strokeStyle = '#e0a030'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx, G.hy0 - 8); c.lineTo(tx, G.hy1); c.stroke(); c.lineWidth = 1; ink(c, 'best beak now', tx, G.hy0 - 12, 11, '#e0a030', 'center', 'b', 600); } }
  },
  notes() {
    const S = this.stats(this.pop), rows = [['Average beak depth', this.mm(S.mean) + ' mm', ''], ['Spread (standard deviation)', (8 * S.sd).toFixed(2) + ' mm', 'About two-thirds of birds lie within one SD of the average.'], ['This curve would let survive', pct(this.expected()), 'At least 30% must survive.']];
    const L = last(this.log); if (L) { const Sd = L.surv.mean - L.before.mean, Rd = L.after.mean - L.before.mean; rows.push(['Last winter: selection differential (S)', (8 * Sd >= 0 ? '+' : '−') + Math.abs(8 * Sd).toFixed(2) + ' mm', 'Survivors’ average minus everyone’s average.'], ['Last winter: response (R)', (8 * Rd >= 0 ? '+' : '−') + Math.abs(8 * Rd).toFixed(2) + ' mm', 'Chicks’ average minus their parents’ generation.']); if (Math.abs(Sd) > 0.01) rows.push(['Realised heritability (R ÷ S)', (Rd / Sd).toFixed(2), 'The genetic share of the survivors’ difference.']); rows.push(['Last winter: spread before, survivors, chicks', [L.before.sd, L.surv.sd, L.after.sd].map(v => (8 * v).toFixed(2)).join(' → ') + ' mm', 'Chicks partly regain spread that selection removed, because genes reshuffle and luck of development adds its own.']); }
    return { idea: this.idea, stats: rows, charts: this.log.length ? [{ title: 'Average and spread after each winter', leg: legP([['#2f7f7a', 'average'], ['#8a5d10', 'spread, scaled']]), draw: cv => this.chart(cv, 'paper') }] : [] };
  }
};

/* ================= Chapter: Left Jaw, Right Jaw (negative frequency dependence) ================= */
const CH_JAWS = {
  id: 'jaws', SEASONS: 6, ATT: 10,
  intro: {
    hook: 'In Lake Tanganyika, the cichlid Perissodus microlepis lives on scales bitten from other fish. Each scale-eater’s jaw is bent to one side, so it can only ever strike one flank of its prey. The trait is inherited.',
    how: 'You are the prey. Tap the left or right half of the screen to swing your guard to that flank. Scale-eaters dart in from the sides; a guarded flank blocks the bite. Swinging the guard takes a moment.',
    goal: 'Survive six seasons, each faster than the last, taking bites on no more than 45% of attacks. Three stars at 25%.'
  },
  real: 'Michio Hori (1993) followed scale-eaters in Lake Tanganyika for a decade and found that the ratio of left- to right-jawed fish oscillated around 50:50 with a period of about five years. Whichever type was more common was guarded against more often by its prey, fed less well and left fewer young, so the rarer type rose. The genetics of jaw direction turned out to be more complicated than Hori first assumed, but the frequency-dependent dynamics have held up.',
  maths: 'Call p the share of scale-eaters that strike your right flank. Their success depends on p itself: the more common they are, the more you guard the right, the lower their success. Fitness falling as a type becomes common is negative frequency dependence. It has a stable point at 50:50, but because each generation responds to what the prey learned last season, the population overshoots and oscillates around it.',
  idea: '<p>Each scale-eater can only strike one side. You learn which side attacks come from most, and you guard it.</p><p>That makes the <b>common</b> type bad at feeding and the <b>rare</b> type good at it. The rare type leaves more offspring, and becomes common, and then you start guarding against it.</p><p>No type wins for long. Watch the balance swing.</p>',
  start() {
    this.p = 0.8; this.season = 1; this.guard = 1; this.gT = 0; this.gTo = 1; this.hist = [0.8]; this.log = []; this.totalB = 0; this.totalA = 0; this.fx = []; this.scars = [];
    HUD.set('<div class="hud-goal"><span>Strikes at your right flank</span><b id="jw-p"></b></div><div class="meter"><i id="jw-bar" style="background:#8aa0b8"></i></div><div class="hud-line" id="jw-st"></div>');
    this.newSeason();
  },
  newSeason() { this.k = 0; this.gap = 1.4; this.a = null; this.sb = { bL: 0, bR: 0, aL: 0, aR: 0 }; this.inter = 0; this.scars = []; this.upd(); },
  upd() { $('jw-p').textContent = pct(this.p); $('jw-bar').style.width = pct(this.p); $('bar-gen').textContent = 'season ' + Math.min(this.season, 6) + ' of 6'; HUD.line('jw-st', 'Attack ' + Math.min(this.k + 1, this.ATT) + ' of ' + this.ATT + ' this season. Bites so far: <b>' + this.totalB + '</b> of ' + this.totalA + ' attacks.'); },
  tap(x) { const s = x < Stage.w / 2 ? -1 : 1; if (s !== this.gTo) { this.gTo = s; this.gT = 0.22; Snd.click(); } },
  update(dt) {
    for (const f of this.fx) f.t += dt; this.fx = this.fx.filter(f => f.t < f.d);
    if (this.gT > 0) { this.gT -= dt; if (this.gT <= 0) this.guard = this.gTo; }
    if (this.inter > 0) { this.inter -= dt; if (this.inter <= 0) { if (this.season > 6) this.end(); else this.newSeason(); } return; }
    if (this.a) {
      const A = this.a; A.t += dt;
      if (!A.done && A.t >= A.T) {
        A.done = true; const blocked = this.gT <= 0 && this.guard === A.side; this.totalA++; if (A.side > 0) this.sb.aR++; else this.sb.aL++;
        if (blocked) { Snd.peck(); this.fx.push({ k: 'block', side: A.side, t: 0, d: 0.5 }); } else { this.totalB++; if (A.side > 0) this.sb.bR++; else this.sb.bL++; Snd.bitter(); this.fx.push({ k: 'bite', side: A.side, t: 0, d: 0.7 }); this.scars.push({ side: A.side, y: A.y }); }
        A.blocked = blocked; this.upd();
      }
      if (A.t > A.T + 0.45) { this.a = null; this.k++; this.gap = 0.3 + R() * 0.55; if (this.k >= this.ATT) this.endSeason(); }
    } else { this.gap -= dt; if (this.gap <= 0) { const side = R() < this.p ? 1 : -1; this.a = { side, t: 0, T: Math.max(0.4, 0.66 - 0.05 * this.season), y: (R() - 0.5) * 0.5 }; } }
  },
  endSeason() {
    const s = this.sb, sR = s.aR ? s.bR / s.aR : 0.5, sL = s.aL ? s.bL / s.aL : 0.5, wR = 1 + 1.6 * sR, wL = 1 + 1.6 * sL, p0 = this.p;
    this.p = clamp(this.p * wR / (this.p * wR + (1 - this.p) * wL) + 0.015 * gauss(), 0.04, 0.96);
    this.log.push({ season: this.season, p0, p: this.p, bR: s.bR, aR: s.aR, bL: s.bL, aL: s.aL, wR, wL }); this.hist.push(this.p);
    toast('Season ' + this.season + ': right-flank strikers fed on ' + s.bR + ' of ' + s.aR + ' tries, left-flank on ' + s.bL + ' of ' + s.aL + '. Their young: <b>' + pct(this.p) + '</b> right-flank strikers.');
    this.season++; this.inter = 2.2; this.upd();
  },
  end() {
    const bs = this.totalB / Math.max(1, this.totalA), stars = bs <= 0.25 ? 3 : bs <= 0.35 ? 2 : bs <= 0.45 ? 1 : 0, ps = this.hist;
    const insight = 'You took bites on ' + pct(bs) + ' of attacks. Meanwhile the scale-eaters’ balance went ' + ps.filter((_, i) => i % 2 === 0 || i === ps.length - 1).map(pct).join(', ') + ' over the seasons. Whenever one type was common, you learned to guard its side, so the rare type fed better and left more young. That is negative frequency-dependent selection: being rare is an advantage, so neither type can take over, and the ratio swings around 50:50 — as Hori saw over ten years in Lake Tanganyika.';
    End.show(this, { stars, title: 'Six seasons survived', insight, chart: cv => this.chart(cv, 'paper'), cap: 'Share of scale-eaters striking your right flank, season by season.' });
  },
  chart(cv, th) { lineChart(cv, { theme: th, series: [{ d: this.hist, c: '#4f6478', w: 2.5 }], y0: 0, y1: 1, refs: [{ v: 0.5, label: '50:50' }], fy: v => pct(v), x0l: 'start', xl: 'season ' + (this.hist.length - 1) }); },
  draw(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1d4f58'); g.addColorStop(1, '#16333a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(200,230,230,.06)'; c.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = (i * 67 + (App.t * 8) % 67) % h; c.beginPath(); c.moveTo(0, y); c.quadraticCurveTo(w / 2, y + 10, w, y); c.stroke(); }
    c.fillStyle = 'rgba(232,223,201,.05)'; c.fillRect(0, 0, w / 2, h);
    ink(c, 'tap: guard left', w * 0.25, h - 14, 12, 'rgba(232,223,201,.45)', 'center', 'b', 'italic'); ink(c, 'tap: guard right', w * 0.75, h - 14, 12, 'rgba(232,223,201,.45)', 'center', 'b', 'italic');
    const cx = w / 2, cy = h * 0.47, s = clamp(Math.min(w, h) / 380, 0.8, 1.4);
    c.save(); c.translate(cx, cy); c.scale(s, s);
    c.fillStyle = '#b7c3bd'; c.beginPath(); c.moveTo(0, -95); c.bezierCurveTo(36, -70, 38, 40, 0, 70); c.bezierCurveTo(-38, 40, -36, -70, 0, -95); c.fill();
    c.fillStyle = '#95a39c'; c.beginPath(); c.moveTo(0, 66); c.lineTo(-20, 100); c.lineTo(20, 100); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(60,80,76,.35)'; c.lineWidth = 1; for (let i = -60; i < 50; i += 9) { c.beginPath(); c.moveTo(-22, i); c.quadraticCurveTo(0, i + 6, 22, i); c.stroke(); }
    for (const sc of this.scars) { c.fillStyle = 'rgba(160,60,70,.6)'; c.beginPath(); c.ellipse(sc.side * 24, sc.y * 90, 5, 3, 0, 0, TAU); c.fill(); }
    c.fillStyle = '#111'; c.beginPath(); c.arc(-10, -72, 3, 0, TAU); c.arc(10, -72, 3, 0, TAU); c.fill();
    const gk = this.gT > 0 ? 1 - this.gT / 0.22 : 1, gs = this.gT > 0 ? this.gTo : this.guard;
    c.globalAlpha = 0.25 + 0.6 * gk; c.fillStyle = '#cf9a33'; c.beginPath(); c.moveTo(gs * 28, -40); c.quadraticCurveTo(gs * (58 * gk + 20), 0, gs * 28, 45); c.quadraticCurveTo(gs * 36, 0, gs * 28, -40); c.fill(); c.globalAlpha = 1;
    c.restore();
    if (this.a) {
      const A = this.a, k = clamp(A.t / A.T, 0, 1), side = A.side, tx = cx + side * 30 * s, sx = side > 0 ? w + 40 : -40, y = cy + A.y * 90 * s;
      let x = lerp(sx, tx + side * 22, k * k); if (A.done) x = tx + side * (22 + (A.t - A.T) * (A.blocked ? 300 : 120));
      c.save(); c.translate(x, y); c.scale(-side * s, s);
      c.fillStyle = '#3b4a3f'; c.beginPath(); c.ellipse(0, 0, 26, 7, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(22, 0); c.lineTo(36, -8); c.lineTo(36, 8); c.closePath(); c.fill();
      c.fillStyle = '#d9d0a8'; c.beginPath(); c.moveTo(-26, 0); c.quadraticCurveTo(-30, -side * 7, -24, -side * 9); c.lineTo(-20, -2); c.fill(); c.fillStyle = '#eee'; c.beginPath(); c.arc(-17, -2, 1.8, 0, TAU); c.fill();
      c.restore();
    }
    for (const f of this.fx) { const k = f.t / f.d, x = cx + f.side * 34 * s; if (f.k === 'bite') { c.fillStyle = 'rgba(220,230,225,' + (1 - k) + ')'; for (let i = 0; i < 7; i++) { const a = i * 0.9; c.beginPath(); c.ellipse(x + f.side * k * 30 + Math.cos(a) * k * 18, cy + Math.sin(a) * k * 26, 3, 2, a, 0, TAU); c.fill(); } } else { c.strokeStyle = 'rgba(207,154,51,' + (1 - k) + ')'; c.lineWidth = 3; c.beginPath(); c.arc(x, cy, 20 + k * 30, -1, 1); if (f.side < 0) { c.beginPath(); c.arc(x, cy, 20 + k * 30, Math.PI - 1, Math.PI + 1); } c.stroke(); } }
    if (this.inter > 0 && this.season <= 6) { c.fillStyle = 'rgba(12,18,17,.55)'; c.fillRect(0, 0, w, h); ink(c, 'Season ' + this.season, w / 2, h / 2 - 8, 28, '#e8dfc9', 'center', 'd', 600); ink(c, 'The scale-eaters have bred.', w / 2, h / 2 + 20, 15, 'rgba(232,223,201,.8)', 'center', 'b', 'italic'); }
  },
  notes() {
    const rows = [['Right-flank strikers', pct(this.p), 'Heritable jaw direction. This is the gene frequency that evolves.'], ['Your bites taken', this.totalB + ' of ' + this.totalA, '']];
    const L = last(this.log); if (L) rows.push(['Last season: right-flank success', L.aR ? pct(L.bR / L.aR) : '—', 'Share of their strikes that landed.'], ['Last season: left-flank success', L.aL ? pct(L.bL / L.aL) : '—', ''], ['Last season: relative fitness, right ÷ left', (L.wR / L.wL).toFixed(2), 'Above 1, right-flank strikers gain share next season; below 1, they lose it.']);
    return { idea: this.idea, stats: rows, charts: this.hist.length > 1 ? [{ title: 'Right-flank strikers, season by season', draw: cv => this.chart(cv, 'paper') }] : [] };
  }
};
