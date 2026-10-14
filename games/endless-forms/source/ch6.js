/* ================= Chapter: The River (allopatric speciation, the snowball, reinforcement) ================= */
function normCdf(z) { const t = 1 / (1 + 0.2316419 * Math.abs(z)), d = 0.3989423 * Math.exp(-z * z / 2), p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274)))); return z > 0 ? 1 - p : p; }
const CH_RIVER = {
  id: 'river', P: 0.15, HV: 0.55, ISO: 0.2, BUDGET: 30, DRY: 0.04, NM: 6,
  theme: { cab: '#10262a', hud: '#163338', text: '#e3efe9', dim: 'rgba(227,239,233,.66)', line: 'rgba(227,239,233,.16)', acc: '#d8843a', hi: '#8fc9d8', meter: '#7fb069', inv: '#10262a' },
  intro: {
    hook: 'A river has cut a snail species in two. On each bank, new mutations spread and settle, harmless where they arose. But some combinations of a west-bank change and an east-bank change have never been tested together — and in a hybrid, they clash.',
    how: 'Level 1: for three river splits, decide each epoch whether to wait, spend an epoch on a lab test cross, or let the banks meet. Meet too soon and hybrids thrive, the populations fuse, and the divergence is lost. Level 2: you are a female frog where two young species overlap, choosing mates by their calls; each night jumps many generations ahead.',
    goal: 'Level 1: split three species within 30 epochs; a second star for 22 or fewer. Level 2: raise at least 4.2 clutches’ worth of healthy young in six nights.'
  },
  real: 'William Bateson (1909), Theodosius Dobzhansky (1936) and H. J. Muller (1942) saw how two populations can become unable to interbreed without either passing through an unfit stage: each side fixes changes that work fine with its own genes, and the damage appears only when the two sets are combined in a hybrid. Allen Orr (1995) showed these incompatibilities should “snowball” — grow faster than linearly with divergence — and fruit-fly and wild-tomato crosses have since found evidence for it (Matute et al. 2010; Moyle and Nakazato 2010). Where young species meet and hybrids are unfit, selection can sharpen mate choice (reinforcement): Jerry Coyne and Allen Orr (1989) found that Drosophila species pairs living together discriminate more strongly than pairs living apart, and in the southeastern US, chorus frogs’ calls diverge where two species share breeding ponds (Lemmon 2009).',
  maths: 'If each side has fixed k new mutations, there are k × k west–east pairs that have never met. If each pair is incompatible with a small probability p, the expected number of clashes is p k²: double the time apart and you get four times the incompatibilities. Here hybrid viability is 0.55 raised to the number of clashes, and two populations count as separate species once hybrids survive less than 20% as well as purebreds. With p = 0.15 and each clash cutting survival to 55%, three clashes are enough (0.55³ ≈ 17%), which takes about four or five epochs on average, with a lot of luck either way.',
  ideas: [
    '<p>Each epoch, each bank fixes one new mutation. None of them is harmful at home. The danger is in <b>combinations</b>: a west-bank change might clash with an east-bank change. You can’t see which pairs clash until hybrids are made.</p><p>The number of untested pairs grows as the <b>square</b> of the time apart. Isolation comes slowly, then all at once.</p><p>A lab test cross costs an epoch but tells you how hybrids fare, without risking a merger.</p>',
    '<p>Here the two species meet, and hybrid tadpoles mostly die. Every mating with the wrong species wastes a clutch.</p><p>Females that are picky about calls leave more healthy young, so pickiness spreads, and males whose calls are distinctive get chosen more. Each night here comes many generations after the last: watch the two calls pull apart over the generations — extra divergence that doesn’t happen where the species live apart.</p>'
  ],
  start() { this.lv = 0; this.res = []; this.fx = []; this.beginLevel(); },
  beginLevel() { if (this.lv === 0) this.begin1(); else this.begin2(); },
  /* level 1 */
  begin1() {
    this.pair = 0; this.E = 0; this.done = []; this.fused = 0; this.newPair();
    HUD.set(HUD.meterHTML('Epochs used (budget 30)') + '<div class="hud-line" id="rv-st"></div><div class="hud-row"><button class="btn" id="rv-w">Wait an epoch</button><button class="btn" id="rv-t">Lab test cross</button><button class="btn primary" id="rv-m">Let them meet</button></div>');
    $('rv-w').onclick = () => this.wait(); $('rv-t').onclick = () => this.test(); $('rv-m').onclick = () => this.meet(); this.upd1();
  },
  newPair() { this.k = 0; this.W = []; this.Ea = []; this.D = []; this.tested = null; this.mixing = null; this.pairE0 = this.E; },
  viab() { return Math.pow(this.HV, this.D.length); },
  wait(forced) {
    if (this.mixing || this.E >= this.BUDGET) return; this.E++; this.k++;
    const w = this.k, e = this.k; this.W.push(w); this.Ea.push(e);
    for (const x of this.Ea) if (R() < this.P) this.D.push([w, x]);
    for (const x of this.W) if (x !== w && R() < this.P) this.D.push([x, e]);
    this.tested = null; Snd.click();
    if (!forced && R() < this.DRY) { toast('Drought: the river has dried up. The banks meet whether you like it or not.'); this.meet(true); return; }
    this.upd1(); if (this.E >= this.BUDGET && !this.mixing) this.end1();
  },
  test() { if (this.mixing || this.E >= this.BUDGET) return; this.E++; let n = 0; for (let i = 0; i < 20; i++) if (R() < this.viab()) n++; this.tested = { n, k: this.k }; Snd.dawn(); this.upd1(); if (this.E >= this.BUDGET) this.end1(); },
  meet(forced) {
    if (this.mixing) return; const v = this.viab(), ok = v < this.ISO; this.mixing = { t: 0, ok, v, forced }; ok ? Snd.star() : Snd.flood();
    this.log1 = this.log1 || []; this.log1.push({ k: this.k, d: this.D.length, v, ok });
  },
  upd1() {
    HUD.meter(this.E / this.BUDGET, 22 / 30, this.E + ' of 30');
    let s = 'River ' + (this.pair + 1) + ' of 3. Apart for <b>' + this.k + '</b> epoch' + (this.k === 1 ? '' : 's') + ': ' + this.k + ' changes on each bank, <b>' + this.k * this.k + '</b> untested pairings.';
    if (this.tested) s += ' Lab cross: <b>' + this.tested.n + ' of 20</b> hybrid eggs hatched' + (this.tested.n / 20 < this.ISO ? ' — that looks like two species.' : '.') + '';
    s += ' Species so far: <b>' + this.done.length + '</b>.'; HUD.line('rv-st', s);
    const dis = !!this.mixing || this.E >= this.BUDGET; ['rv-w', 'rv-t', 'rv-m'].forEach(id => $(id).disabled = dis); $('bar-gen').textContent = 'level 1 of 2';
  },
  update1(dt) {
    if (!this.mixing) return; this.mixing.t += dt;
    if (this.mixing.t > 2.4) {
      const M = this.mixing; this.mixing = null;
      if (M.ok) { this.done.push({ k: this.k, d: this.D.length, E: this.E - this.pairE0 }); toast('<b>Two species.</b> Hybrids hatched ' + pct(M.v) + ' as well as purebreds: ' + this.D.length + ' clashing pairs among ' + this.k * this.k + '.'); this.pair++; if (this.pair >= 3) { this.end1(); return; } this.newPair(); }
      else { this.fused++; toast('<b>They fused.</b> Hybrids hatched ' + pct(M.v) + ' as well as purebreds, genes flowed, and the ' + this.k + ' epochs of divergence blurred away. This river starts again.'); this.newPair(); }
      this.upd1(); if (this.E >= this.BUDGET) this.end1();
    }
  },
  end1() {
    if (this.l1done) return; this.l1done = true; const n = this.done.length, pass = n >= 3, bonus = pass && this.E <= 22;
    const note = pass ? 'You split three species in ' + this.E + ' epochs' + (this.fused ? ', after ' + this.fused + ' fusion' + (this.fused > 1 ? 's' : '') : '') + '. The clashes were ' + this.done.map(d => d.d + ' among ' + d.k * d.k + ' pairs').join(', ') + ': incompatibilities pile up with the square of the time apart.' : 'Only ' + n + ' of 3 rivers produced species before time ran out' + (this.fused ? ', with ' + this.fused + ' fusion' + (this.fused > 1 ? 's' : '') : '') + '.';
    this.res.push({ lv: 0, pass, bonus, note }); if (pass) Snd.star();
    Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p><p>Neither bank ever had a harmful mutation. Reproductive isolation emerged purely from combinations that had never been tried.</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.lv = 1; this.beginLevel(); } }] });
  },
  /* level 2: reinforcement */
  begin2() {
    this.night = 0; this.mu = [50, 55]; this.allo = [50, 55]; this.sd = 4; this.score = 0; this.nights = []; this.muHist = [this.mu.slice()];
    HUD.set('<div class="hud-goal"><span><b>Level 2: The chorus</b></span><b id="rv-n"></b></div><div class="hud-line" id="rv-st"></div><div class="hud-row"><button class="btn" id="rv-x">Next male</button><button class="btn primary" id="rv-y">Mate with him</button></div>');
    $('rv-x').onclick = () => this.skip(); $('rv-y').onclick = () => this.accept(); $('bar-gen').textContent = 'level 2 of 2'; this.newNight();
  },
  newNight() { this.males = []; for (let i = 0; i < this.NM; i++) { const sp = R() < 0.5 ? 0 : 1; this.males.push({ sp, rate: this.mu[sp] + this.sd * gauss() }); } this.mi = 0; this.out = null; this.play(); this.upd2(); },
  play() { const m = this.males[this.mi]; if (!m || !Snd.ctx || !Snd.on) return; const n = 7; for (let i = 0; i < n; i++) setTimeout(() => Snd.tone(1900, 0.018, 'square', 0.03), i * 1000 / (m.rate / 4)); },
  upd2() { $('rv-n').textContent = 'night ' + Math.min(this.night + 1, 6) + ' of 6'; HUD.line('rv-st', this.out ? this.out : 'Male ' + (this.mi + 1) + ' of ' + this.NM + ' tonight. Compare his call with your species’ call at the top. Healthy clutches so far: <b>' + this.score.toFixed(1) + '</b>.'); $('rv-x').disabled = $('rv-y').disabled = !!this.out; },
  skip() { if (this.out) return; this.mi++; Snd.click(); if (this.mi >= this.NM) { this.finishNight(null); return; } this.play(); this.upd2(); },
  accept() { if (this.out) return; this.finishNight(this.males[this.mi]); },
  finishNight(m) {
    const v = m == null ? 0 : m.sp === 0 ? 1 : 0.2; this.score += v; this.nights.push({ v, sp: m ? m.sp : null, rate: m ? m.rate : null, mu: this.mu.slice() });
    this.out = m == null ? 'You waited too long: the chorus ended and you laid no eggs tonight.' : m.sp === 0 ? 'He was your species: a healthy clutch.' : 'He was the other species. Most of the hybrid tadpoles died: 0.2 of a clutch.';
    m && m.sp === 0 ? Snd.chime() : Snd.miss(); this.upd2();
    const gap = this.mu[1] - this.mu[0], ov = 2 * normCdf(-gap / (2 * this.sd)), d = 3 * ov; this.mu = [this.mu[0] - d, this.mu[1] + d]; this.muHist.push(this.mu.slice());
    setTimeout(() => { if (App.mode !== this) return; this.night++; if (this.night >= 6) this.end2(); else this.newNight(); }, 2200);
  },
  end2() {
    const pass = this.score >= 4.2, gap0 = 5, gap1 = this.mu[1] - this.mu[0]; this.res.push({ lv: 1, pass, note: 'You raised ' + this.score.toFixed(1) + ' clutches’ worth of healthy young. Over many generations, where the species met, their calls pulled apart from ' + gap0 + ' to ' + gap1.toFixed(0) + ' pulses per second; where they live apart the gap stayed at 5.' });
    const stars = (this.res[0].pass ? 1 : 0) + (this.res[0].bonus ? 1 : 0) + (pass ? 1 : 0);
    End.show(this, { stars, title: stars + ' of 3 stars', insight: 'Speciation here needed no designer and no unfit intermediate. ' + this.res[0].note + ' ' + this.res[1].note + ' That extra divergence in sympatry is reinforcement: once hybrids are unfit, selection favours choosier females and more distinct calls, which can complete isolation.', leg: legP([['#2f7f7a', 'your species’ call'], ['#b5652b', 'the other species’ call'], ['#8a8a8a', 'the same pair, living apart']]), chart: cv => lineChart(cv, { theme: 'paper', series: [{ d: this.muHist.map(m => m[0]), c: '#2f7f7a' }, { d: this.muHist.map(m => m[1]), c: '#b5652b' }, { d: this.muHist.map(() => 50), c: '#8a8a8a', dash: [4, 3] }, { d: this.muHist.map(() => 55), c: '#8a8a8a', dash: [4, 3] }], y0: 35, y1: 75, fy: v => v.toFixed(0), x0l: 'night 1', xl: 'night 6' }), cap: 'Average call pulse rates, night by night; each night is many generations after the last.' });
  },
  update(dt) { if (this.lv === 0) this.update1(dt); },
  wave(c, x, y, w, rate, col, t) { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); const spacing = w / (rate * 0.35); for (let px = 0; px <= w; px++) { const ph = (px / spacing) % 1, amp = ph < 0.35 ? Math.sin(ph / 0.35 * Math.PI) * 14 * Math.sin(px * 1.3 + t * 30) : 0; c.lineTo(x + px, y + amp); } c.stroke(); },
  draw(c, w, h) {
    c.fillStyle = '#1b3a2e'; c.fillRect(0, 0, w, h);
    if (this.lv === 0) {
      const H = h * 0.56; c.fillStyle = '#2d5a3c'; c.fillRect(0, 0, w, H); c.strokeStyle = 'rgba(160,200,150,.12)'; for (let i = 1; i < 8; i++) { c.beginPath(); c.ellipse(w * 0.2, H * 0.5, i * 18, i * 12, 0.3, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(w * 0.82, H * 0.45, i * 16, i * 11, -0.4, 0, TAU); c.stroke(); }
      const M = this.mixing, mk = M ? clamp(M.t / 2, 0, 1) : 0, rw = (M ? 1 - mk : 1) * 18;
      if (rw > 0.5) { c.strokeStyle = '#4f9fbf'; c.lineWidth = rw; c.lineCap = 'round'; c.beginPath(); c.moveTo(w * 0.5, 0); c.bezierCurveTo(w * 0.42, H * 0.3, w * 0.6, H * 0.6, w * 0.5, H); c.stroke(); }
      const r = rng(this.pair * 31 + 7);
      for (let i = 0; i < 44; i++) {
        const west = i % 2 === 0; let x = west ? w * (0.05 + r() * 0.36) : w * (0.59 + r() * 0.36); const y = H * (0.08 + r() * 0.84);
        if (M) { if (M.ok) x = lerp(x, w * 0.5 + (west ? -1 : 1) * (8 + r() * 20), mk * 0.5); else x = lerp(x, w * (0.1 + r() * 0.8), mk); }
        const base = west ? [90, 150, 210] : [220, 160, 70], tint = M && !M.ok ? mix(base, [150, 155, 140], mk) : base;
        c.fillStyle = css(tint); c.beginPath(); c.arc(x, y, 5.5, 0, TAU); c.fill(); c.strokeStyle = 'rgba(20,30,25,.55)'; c.lineWidth = 1; for (let s = 0; s < Math.min(this.k, 6); s++) { c.beginPath(); c.arc(x, y, 1.5 + s * 0.7, 0, 4); c.stroke(); }
      }
      if (M && M.ok) { c.fillStyle = 'rgba(240,120,90,' + (0.5 * mk) + ')'; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(w * 0.5 + (r() - .5) * 20, H * (0.1 + r() * 0.8), 3, 0, TAU); c.fill(); } ink(c, 'hybrids fail: a narrow hybrid zone', w * 0.5, H - 10, 12, '#f4d3c6', 'center', 'b', 'italic'); }
      // genome panel with clash web
      const gy0 = H + 22, gy1 = h - 26, n = Math.max(6, this.k), sx = (w - 40) / n, X = i => 20 + sx * (i - 0.5);
      ink(c, 'west bank changes', 12, gy0 - 6, 12, 'rgba(227,239,233,.7)', 'left', 'b', 'italic'); ink(c, 'east bank changes', 12, gy1 + 18, 12, 'rgba(227,239,233,.7)', 'left', 'b', 'italic');
      const reveal = !!(this.tested || M);
      if (reveal) { c.lineWidth = 2; for (const [a, b] of this.D) { c.strokeStyle = 'rgba(240,110,90,.85)'; c.beginPath(); c.moveTo(X(a), gy0 + 10); c.lineTo(X(b), gy1 - 10); c.stroke(); } }
      else if (this.k) { c.strokeStyle = 'rgba(227,239,233,.06)'; c.lineWidth = 1; for (let a = 1; a <= this.k; a++) for (let b = 1; b <= this.k; b++) { c.beginPath(); c.moveTo(X(a), gy0 + 10); c.lineTo(X(b), gy1 - 10); c.stroke(); } }
      for (let i = 1; i <= this.k; i++) { c.fillStyle = '#5a9ad2'; rrect(c, X(i) - sx * 0.35, gy0, sx * 0.7, 12, 3); c.fill(); c.fillStyle = '#dca048'; rrect(c, X(i) - sx * 0.35, gy1 - 12, sx * 0.7, 12, 3); c.fill(); }
      if (!reveal && this.k) ink(c, this.k * this.k + ' untested pairings: clashes hidden', w / 2, (gy0 + gy1) / 2 + 4, 13, 'rgba(227,239,233,.6)', 'center', 'b', 'italic');
      return;
    }
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0b1a24'); g.addColorStop(1, '#16302a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,250,220,.7)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((i * 97) % w, (i * 41) % (h * 0.3), 0.8, 0, TAU); c.fill(); }
    ink(c, 'your species’ call', 14, 34, 12, 'rgba(227,239,233,.75)', 'left', 'b', 'italic'); this.wave(c, 14, 58, w - 28, this.mu[0], '#7fd0c0', App.t);
    const m = this.males[this.mi];
    if (m && !this.out) { ink(c, 'male ' + (this.mi + 1) + ' is calling', 14, h * 0.4 - 22, 12, 'rgba(227,239,233,.75)', 'left', 'b', 'italic'); this.wave(c, 14, h * 0.4, w - 28, m.rate, '#f1e4c6', App.t); }
    const fx = w * 0.5, fy = h * 0.72; c.fillStyle = '#3f7a4a'; c.beginPath(); c.ellipse(fx, fy, 34, 22, 0, 0, TAU); c.fill(); c.fillStyle = '#5a9a5c'; c.beginPath(); c.ellipse(fx, fy - 6, 28, 14, 0, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(fx - 12, fy - 16, 4, 0, TAU); c.arc(fx + 12, fy - 16, 4, 0, TAU); c.fill();
    if (m && !this.out) { const bx = w * 0.82, by = h * 0.62, puff = 8 + 6 * Math.abs(Math.sin(App.t * m.rate * 0.1)); c.fillStyle = m.sp ? '#6f8a45' : '#4f8a55'; c.beginPath(); c.ellipse(bx, by, 22, 14, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(240,235,200,.8)'; c.beginPath(); c.arc(bx - 14, by + 6, puff, 0, TAU); c.fill(); }
    if (this.out) ink(c, this.out, w / 2, h * 0.44, 14, '#f1e4c6', 'center', 'b', 600);
  },
  notes() {
    if (this.lv === 0) { const rows = [['Epochs used', this.E + ' of 30', ''], ['Changes per bank', this.k + '', ''], ['Untested west–east pairings', this.k * this.k + '', 'Grows as the square of the time apart.'], ['Expected clashes', (this.P * this.k * this.k).toFixed(1), 'p × k², with p = 0.15. Separate species need about 3 (0.55³ ≈ 17% hybrid survival).'], ['Species split so far', this.done.length + ' of 3', ''], ['Fusions', this.fused + '', 'Each one throws away a river’s divergence.']]; return { idea: this.ideas[0], stats: rows, charts: [] }; }
    const gap = this.mu[1] - this.mu[0]; return { idea: this.ideas[1], stats: [['Night', Math.min(this.night + 1, 6) + ' of 6', ''], ['Average calls (pulses per second)', this.mu[0].toFixed(1) + ' vs ' + this.mu[1].toFixed(1), 'Yours vs the other species. Where they live apart: 50 vs 55.'], ['Overlap between the two calls', pct(2 * normCdf(-gap / (2 * this.sd))), 'Share of males whose call could pass for the other species.'], ['Healthy clutches', this.score.toFixed(1) + '', 'Own species: 1. Hybrid: 0.2. No mate: 0.']], charts: [] };
  }
};

/* ================= Chapter: The Lek (mate choice under uncertainty; honest signals) ================= */
const CH_LEK = {
  id: 'lek', MU: 0.5, SQ: 0.18,
  theme: { cab: '#f1e6d6', hud: '#e6d5bd', text: '#3a2b1c', dim: 'rgba(58,43,28,.68)', line: 'rgba(58,43,28,.2)', acc: '#b0482b', hi: '#557a4a', meter: '#c28a2e', inv: '#fbf5ec' },
  intro: {
    hook: 'At dawn, male sage-grouse gather on a lek and strut, inflating yellow air sacs on their chests. Level 1: you are a female, and every male you inspect costs time in the open. Level 2: you are a male, and every second of strutting draws eyes — the females’ and the eagles’.',
    how: 'Level 1: males display one at a time; accept one or move on. There is no going back. Level 2: press and hold anywhere on the lek to strut; let go to stop. Your body condition changes each season.',
    goal: 'A star for each level where your decisions earn at least 85% of the best possible. Three stars need both levels at 95%.'
  },
  real: 'Female sage-grouse visiting a lek mate overwhelmingly with a few males, and the males they choose display at higher rates (Gibson and Bradbury 1985). Display is energetically expensive (Vehrencamp, Bradbury and Gibson 1989), so it could reveal a male’s condition. Amotz Zahavi (1975) argued that signals stay honest because they are costly, and Alan Grafen (1990) showed when that can work: if the same display costs a weak male more than a strong one, the best display for each male rises with his quality, so the signal reveals it. Level 1 treats choosiness as an optimal-stopping problem: accept a male if he is better than what you can expect from continuing to search, after paying the cost of searching. Real hens have more freedom: they compare males side by side, revisit leks over several days and often copy other hens’ choices (Gibson, Bradbury and Vehrencamp 1991).',
  maths: 'Level 1: a display reading x is quality plus noise. The best guess of his quality shrinks the reading toward the average by the cue’s reliability, σq² ÷ (σq² + σn²). With n males still to come, accept if that guess beats the value of continuing, which is computed backwards from the last male. Level 2: your expected payoff is (share of the females’ attention) × (chance of surviving): d ÷ (d + 5) × e^(−0.02 d² ÷ c²) for display d and condition c. The best display is about 2 for a poor male, 4 for an average one and 7 for a prime one.',
  ideas: [
    '<p>A male’s display is an imperfect guide to his quality. On a clear morning it tells you a lot; in fog, very little. Each extra male you inspect costs you, and there are only eight.</p><p>So be choosy early, less choosy as the lek empties, more choosy when the display is trustworthy and searching is cheap.</p>',
    '<p>Females prefer the male who displays hardest. But strutting draws eagles, and a male in poor condition pays far more for the same display than a male in prime condition.</p><p>Find the display that pays best for the body you have. Watch whether the best display depends on your condition — that dependence is what keeps the signal honest.</p>'
  ],
  SEASONS1: [{ noise: 0.06, cost: 0.02, name: 'Clear morning, few eagles' }, { noise: 0.25, cost: 0.02, name: 'Fog: displays are hard to read' }, { noise: 0.06, cost: 0.07, name: 'Clear, but eagles are hunting' }, { noise: 0.25, cost: 0.07, name: 'Fog and eagles' }, { noise: 0.1, cost: 0.035, name: 'An ordinary morning' }],
  CONDS: [1, 0.5, 2, 1, 0.5, 2],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() {
    this.i = 0; this.got = 0; this.best = 0; this.log = [];
    if (this.lv === 0) { HUD.set('<div class="hud-goal"><span id="lk-s"></span><b id="lk-k"></b></div><div class="hud-line" id="lk-st"></div><div class="hud-row"><button class="btn" id="lk-n">Next male</button><button class="btn primary" id="lk-a">Choose him</button></div>'); $('lk-n').onclick = () => this.next1(); $('lk-a').onclick = () => this.accept1(); this.season1(); }
    else { HUD.set('<div class="hud-goal"><span id="lk-s"></span><b id="lk-k"></b></div><div class="meter"><i id="lk-bar" style="background:#c28a2e"></i></div><div class="hud-line" id="lk-st"></div>'); this.season2(); }
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2';
  },
  /* level 1: optimal stopping */
  season1() { const S = this.SEASONS1[this.i]; this.males = []; for (let k = 0; k < 8; k++) { const q = clamp(this.MU + this.SQ * gauss(), 0, 1); this.males.push({ q, x: clamp(q + S.noise * gauss(), 0, 1) }); } this.j = 0; this.out = null; this.V = this.values(S); this.upd1(); },
  post(x, S) { const rel = this.SQ * this.SQ / (this.SQ * this.SQ + S.noise * S.noise); return this.MU + rel * (x - this.MU); },
  values(S) { // V[n] = expected value of the search with n males left to see, including this one, before paying for him; Monte Carlo over readings
    const xs = []; for (let k = 0; k < 4000; k++) xs.push(clamp(this.MU + this.SQ * gauss() + S.noise * gauss(), 0, 1)); const ps = xs.map(x => this.post(x, S));
    const V = [0]; for (let n = 1; n <= 8; n++) { const cont = V[n - 1] - S.cost; let s = 0; for (const p of ps) s += n === 1 ? p : Math.max(p, cont); V.push(s / ps.length - (n === 8 ? 0 : 0)); } return V;
  },
  upd1() { const S = this.SEASONS1[this.i]; $('lk-s').innerHTML = '<b>' + S.name + '</b>'; $('lk-k').textContent = 'season ' + (this.i + 1) + ' of 5'; HUD.line('lk-st', this.out || 'Male ' + (this.j + 1) + ' of 8. Each male you look at costs ' + Math.round(S.cost * 100) + ' points of offspring health.' + (this.j === 7 ? ' He is the last one.' : '')); $('lk-n').disabled = !!this.out || this.j >= 7; $('lk-a').disabled = !!this.out; },
  next1() { if (this.out || this.j >= 7) return; this.j++; Snd.click(); this.upd1(); },
  accept1() {
    if (this.out) return; const S = this.SEASONS1[this.i], m = this.males[this.j], cost = S.cost * (this.j + 1), real = m.q - cost;
    let js = 7; for (let k = 0; k < 8; k++) if (k === 7 || this.post(this.males[k].x, S) >= this.V[7 - k] - S.cost) { js = k; break; }
    const expMine = this.post(m.x, S) - cost, bestExp = this.post(this.males[js].x, S) - S.cost * (js + 1), worst = Math.min(expMine, bestExp, this.MU - S.cost * 8);
    this.got += Math.max(0, expMine - worst); this.best += Math.max(1e-6, bestExp - worst); this.log.push({ j: this.j, q: m.q, x: m.x, real, expMine, bestExp });
    this.out = 'You chose male ' + (this.j + 1) + '. His true quality: <b>' + pct(m.q) + '</b>; search cost ' + pct(cost) + '. On what you could see, your choice was worth ' + pct(expMine) + '; the best strategy, facing the same males, would have taken male ' + (js + 1) + ' for ' + pct(bestExp) + '.'; Snd.chime(); this.upd1();
    setTimeout(() => { if (App.mode !== this) return; this.i++; if (this.i >= 5) this.endLevel(); else this.season1(); }, 2600);
  },
  /* level 2: the handicap strut */
  pay(d, c) { return d / (d + 5) * Math.exp(-0.02 * d * d / (c * c)); },
  bestD(c) { let bd = 0, bv = 0; for (let d = 0; d <= 10; d += 0.05) { const v = this.pay(d, c); if (v > bv) { bv = v; bd = d; } } return [bd, bv]; },
  season2() { this.d = 0; this.hold = false; this.out = null; this.eagle = 0; this.upd2(); },
  cname(c) { return c < 0.8 ? 'poor' : c > 1.5 ? 'prime' : 'average'; },
  upd2() { const c = this.CONDS[this.i]; $('lk-s').innerHTML = 'Your condition this season: <b>' + this.cname(c) + '</b>'; $('lk-k').textContent = 'season ' + (this.i + 1) + ' of 6'; $('lk-bar').style.width = pct(this.d / 10); HUD.line('lk-st', this.out || 'Press and hold on the lek to strut. Display so far: <b>' + this.d.toFixed(1) + '</b> of 10. Let go to stop.'); },
  down() { if (this.lv === 1 && !this.out) { this.hold = true; } },
  up() { if (this.lv === 1 && this.hold && !this.out) { this.hold = false; this.settle(); } },
  settle() {
    const c = this.CONDS[this.i], v = this.pay(this.d, c), [bd, bv] = this.bestD(c), lived = R() < Math.exp(-0.02 * this.d * this.d / (c * c));
    this.got += v; this.best += bv; this.log.push({ c, d: this.d, v, bd, bv, lived }); this.eagle = lived ? 0 : 1.6;
    this.out = (lived ? 'You survived the morning. ' : 'An eagle took you. ') + 'Display ' + this.d.toFixed(1) + ': expected payoff ' + (v / bv * 100).toFixed(0) + '% of the best for a ' + this.cname(c) + ' male, which strutted about ' + bd.toFixed(1) + '.';
    lived ? Snd.chime() : Snd.bitter(); this.upd2();
    setTimeout(() => { if (App.mode !== this) return; this.i++; if (this.i >= 6) this.endLevel(); else this.season2(); }, 3000);
  },
  update(dt) { if (this.lv === 1 && this.hold && !this.out) { this.d = Math.min(10, this.d + dt * 2.6); if (this.d >= 10) { this.hold = false; this.settle(); } else this.upd2(); } if (this.eagle > 0) this.eagle -= dt; },
  endLevel() {
    const eff = this.best > 0 ? this.got / this.best : 0, pass = eff >= 0.85, great = eff >= 0.95;
    const note = this.lv === 0 ? 'Your choices earned ' + pct(Math.min(1, eff)) + ' of the best strategy’s expected value. The best strategy accepts high readings early on clear mornings, and settles faster in fog or when eagles make each look expensive.' : 'Your displays earned ' + pct(Math.min(1, eff)) + ' of the best. The best display was about ' + this.bestD(0.5)[0].toFixed(1) + ' in poor condition, ' + this.bestD(1)[0].toFixed(1) + ' in average and ' + this.bestD(2)[0].toFixed(1) + ' in prime: the same display is cheap for a strong male and ruinous for a weak one, so each male’s best display reveals his condition.';
    this.res.push({ lv: this.lv, pass, great, note, eff, log: this.log.slice() }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 2) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const s = this.res.filter(r => r.pass).length, stars = s === 2 && this.res.every(r => r.great) ? 3 : s; const L2 = last(this.res).log; End.show(this, { stars, title: stars + ' of 3 stars', insight: 'Choosing and being chosen are both decisions under uncertainty. ' + this.res.map(r => r.note).join(' ') + ' Honest signals are not a matter of good character: they are what selection produces when signals cost the weak more.', leg: legP([['#b0482b', 'your display']]), chart: cv => barChart(cv, { groups: L2.map(l => ({ label: this.cname(l.c), parts: [{ v: l.d, c: '#b0482b' }] })) }), cap: 'Your display each season in level 2. Best: poor about 2, average about 4, prime about 7.' }); }
  },
  bird(c, x, y, s, disp, col) {
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 18, 11, 0, 0, TAU); c.fill();
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 - 0.9 + k * 0.3; c.strokeStyle = '#3d3326'; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -2); c.lineTo(-12 + Math.cos(a) * (10 + 16 * disp), -2 + Math.sin(a) * (10 + 16 * disp)); c.stroke(); }
    c.fillStyle = '#f1efe6'; c.beginPath(); c.ellipse(6, 2, 8 + 4 * disp, 7 + 3 * disp, 0, 0, TAU); c.fill();
    if (disp > 0.05) { c.fillStyle = '#e8c33a'; c.beginPath(); c.ellipse(4, 3, 3.5 * disp + 1, 4 * disp + 1, 0, 0, TAU); c.ellipse(9, 3, 3.5 * disp + 1, 4 * disp + 1, 0, 0, TAU); c.fill(); }
    c.fillStyle = col; c.beginPath(); c.arc(14, -8, 5, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(16, -9, 1.2, 0, TAU); c.fill(); c.restore();
  },
  draw(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f3c9a0'); g.addColorStop(0.4, '#efe0c4'); g.addColorStop(1, '#b9ad85'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(110,120,90,.4)'; for (let i = 0; i < 40; i++) { const x = (i * 71) % w, y = h * 0.45 + (i * 37) % (h * 0.5); c.beginPath(); c.ellipse(x, y, 12, 6, 0, 0, TAU); c.fill(); }
    const s = clamp(w / 360, 0.9, 1.4);
    if (this.lv === 0) {
      const S = this.SEASONS1[Math.min(this.i, 4)]; if (!this.males) return;
      for (let k = 0; k < 8; k++) { const m = this.males[k], x = w * (0.1 + (k % 4) * 0.27), y = h * (0.52 + ((k / 4) | 0) * 0.24), active = k === this.j, seen = k < this.j; c.globalAlpha = active ? 1 : seen ? 0.25 : 0.55; this.bird(c, x, y, s * (active ? 1.15 : 0.8), active || seen ? m.x : 0.1, '#6d5a44'); c.globalAlpha = 1; if (active || seen) ink(c, 'display ' + Math.round(m.x * 10), x, y + 30 * s, 12, '#3a2b1c', 'center', 'm'); if (this.out && k === this.j) ink(c, 'quality ' + Math.round(m.q * 10), x, y + 44 * s, 12, '#b0482b', 'center', 'm', 600); }
      if (S.noise > 0.2) { c.fillStyle = 'rgba(235,235,230,.45)'; c.fillRect(0, 0, w, h); }
      if (S.cost > 0.05) { const ex = (App.t * 40) % (w + 80) - 40; c.fillStyle = 'rgba(40,30,20,.8)'; c.beginPath(); c.moveTo(ex - 24, 40); c.quadraticCurveTo(ex, 28, ex + 24, 40); c.quadraticCurveTo(ex, 46, ex - 24, 40); c.fill(); }
      ink(c, 'displays are ' + (S.noise > 0.2 ? 'hard to read today' : 'easy to read today'), w / 2, h * 0.14, 14, '#3a2b1c', 'center', 'b', 'italic');
      return;
    }
    const c0 = this.CONDS[Math.min(this.i, 5)], fem = clamp(this.d / 8, 0, 1);
    for (let k = 0; k < 4; k++) { const x = w * (0.15 + k * 0.23) + Math.sin(App.t + k) * 3, y = h * 0.34; c.fillStyle = '#9a8a70'; c.beginPath(); c.ellipse(x, y, 12, 7, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(x + (w / 2 - x) * 0.05 + 9, y - 5, 4, 0, TAU); c.fill(); }
    ink(c, 'females watching: ' + Math.round(fem * 100) + '% interested', w / 2, h * 0.24, 13, '#3a2b1c', 'center', 'b', 'italic');
    const size = c0 < 0.8 ? 0.85 : c0 > 1.5 ? 1.25 : 1; this.bird(c, w / 2, h * 0.64, s * 1.6 * size, this.d / 10, c0 < 0.8 ? '#7d6e5a' : '#5a4735');
    const risk = 1 - Math.exp(-0.02 * this.d * this.d / (c0 * c0)); c.fillStyle = 'rgba(40,30,20,' + (0.2 + 0.7 * risk) + ')'; const ex = w * 0.8, ey = h * 0.1 + 20 * Math.sin(App.t * 2); c.beginPath(); c.moveTo(ex - 30, ey); c.quadraticCurveTo(ex, ey - 14, ex + 30, ey); c.quadraticCurveTo(ex, ey + 6, ex - 30, ey); c.fill();
    ink(c, 'eagle risk ' + pct(risk), ex, ey + 24, 12, '#3a2b1c', 'center', 'm');
    if (this.eagle > 0) { c.fillStyle = 'rgba(120,20,20,' + (this.eagle / 3) + ')'; c.fillRect(0, 0, w, h); }
  },
  notes() {
    if (this.lv === 0) { const S = this.SEASONS1[Math.min(this.i, 4)], rel = this.SQ * this.SQ / (this.SQ * this.SQ + S.noise * S.noise), m = this.males && this.males[this.j]; const rows = [['How reliable is a display today', pct(rel), 'Share of the variation in display that reflects real quality.'], ['Cost of each look', Math.round(S.cost * 100) + ' points', '']]; if (m) rows.push(['This male’s display', Math.round(m.x * 10) + ' of 10', ''], ['Best guess of his quality', pct(this.post(m.x, S)), 'Display pulled toward the average by the reliability.'], ['Value of looking further', pct(this.V[7 - this.j] - S.cost), 'What the best strategy expects from the remaining males, after paying for them. Accept if your guess beats this.']); return { idea: this.ideas[0], stats: rows, charts: [] }; }
    const c = this.CONDS[Math.min(this.i, 5)], [bd] = this.bestD(c);
    return { idea: this.ideas[1], stats: [['Your condition', this.cname(c), ''], ['Current display', this.d.toFixed(1), ''], ['Share of attention', pct(this.d / (this.d + 5)), 'Display ÷ (display + 5): other males display too.'], ['Chance of surviving it', pct(Math.exp(-0.02 * this.d * this.d / (c * c))), 'Costs rise with display squared, divided by condition squared.']], charts: [{ title: 'Payoff by display, for each condition', leg: legP([['#8a6a4a', 'poor'], ['#b0482b', 'average'], ['#557a4a', 'prime']]), draw: (cv, th) => lineChart(cv, { theme: th, series: [0.5, 1, 2].map((cc, k) => ({ d: Array.from({ length: 41 }, (_, i) => this.pay(i / 4, cc)), c: ['#8a6a4a', '#b0482b', '#557a4a'][k] })), y0: 0, y1: 0.6, fy: v => v.toFixed(1), x0l: 'display 0', xl: 'display 10' }) }] };
  }
};
