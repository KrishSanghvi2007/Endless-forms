/* ================= Chapter: The Selfish Spindle (segregation distortion, meiotic drive, gene drive) ================= */
function binomP(k, n) { const lf = x => { let s = 0; for (let i = 2; i <= x; i++) s += Math.log(i); return s; }, pr = i => Math.exp(lf(n) - lf(i) - lf(n - i) - n * Math.LN2), pk = pr(k); let p = 0; for (let i = 0; i <= n; i++) if (pr(i) <= pk + 1e-12) p += pr(i); return Math.min(1, p); }
const CH_SPINDLE = {
  id: 'spindle',
  theme: { cab: '#1b1a2e', hud: '#242340', text: '#ece8f6', dim: 'rgba(236,232,246,.66)', line: 'rgba(236,232,246,.16)', acc: '#e07a3a', hi: '#8fd0c8', meter: '#c9a84a', inv: '#1b1a2e' },
  intro: {
    hook: 'Mendel’s first law says each of a parent’s two copies has a fair, 50% chance of reaching each offspring. Some stretches of DNA cheat. Level 1: discover a cheater from litter counts. Level 2: be a selfish chromosome in an egg’s first division. Level 3: harness cheating to crash a population of malaria mosquitoes.',
    how: 'Level 1: breed carriers, then say who cheats and how often. Level 2: tap Reorient to swing your chromosome toward the egg; the cell divides without warning. Level 3: release drive mosquitoes into the cage and watch what evolves.',
    goal: 'A star for each level: a correct diagnosis, at least 7 of 10 eggs, and a crashed cage within 20 generations.'
  },
  real: 'The mouse t-haplotype is transmitted to over 90% of the offspring of carrier males, because it poisons sperm that lack it; carrier females transmit it normally. It persists in wild mice despite killing or sterilising the homozygotes (Lyon 2003). In female meiosis only one of four products becomes the egg, and centromeres compete for it: in mice, chromosomes with larger centromeres are preferentially kept in the egg (Chmátal et al. 2014), exploiting an asymmetric spindle (Akera et al. 2017). Such drive is thought to explain why centromere proteins evolve unusually fast (Malik and Henikoff 2001). Engineered CRISPR drives copy themselves onto the partner chromosome: one targeting the doublesex gene crashed caged Anopheles gambiae populations within about ten generations without resistance arising (Kyrou et al. 2018), while earlier drives against less constrained targets were defeated by resistant mutations.',
  maths: 'Level 1: with a fair ratio, the number of carrier pups in n follows a binomial distribution; an exact test asks how often chance alone would give a count as extreme. Eight pups cannot tell 75% from 50% with confidence; twenty-four usually can. Level 2: without drive the egg keeps your chromosome half the time; each reorientation also risks an attachment error that kills the egg if it is unresolved when the cell divides. Level 3: a homing drive converts the wild copy in 95% of heterozygous germlines, so it spreads far faster than Mendel allows. Females with two broken doublesex copies are sterile. When repair fails, it sometimes creates a working but uncuttable copy: a resistant allele, which spreads because it restores female fertility. A conserved target leaves almost no room for working mutations.',
  ideas: ['<p>A heterozygous parent should pass each of its two chromosomes to half its offspring. Here, one chromosome carries a visible marker: curly whiskers.</p><p>Breed carriers of each sex with normal mates and count. A single litter of eight can mislead you; the Numbers tab gives an exact test of each count against 50:50.</p>', '<p>In female meiosis, one set of chromosomes goes into the egg and the other into a tiny polar body that is thrown away. Which homolog goes where is normally a coin toss.</p><p>A selfish centromere can tilt the toss: it detaches and reattaches until it faces the egg. But every detachment risks an error, and an unresolved error when the cell divides makes an egg with the wrong number of chromosomes.</p>', '<p>A homing drive cuts the partner chromosome and copies itself in, so carriers pass it to nearly all their young. Females with two broken copies of the target gene cannot lay eggs.</p><p>When the cut is repaired wrongly, it can create a working copy the drive can no longer cut. If such a copy keeps females fertile, it spreads — and the population recovers.</p>'],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() { $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 3'; [this.begin1, this.begin2, this.begin3][this.lv].call(this); },
  finishLevel(pass, note) {
    this.res.push({ lv: this.lv, pass, note }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 3) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const stars = this.res.filter(r => r.pass).length; End.show(this, { stars, title: stars + ' of 3 levels', insight: 'Genes are not obliged to play fair. ' + this.res.map(r => r.note).join(' ') + ' Selfish elements spread even when they harm the organism carrying them, and the rest of the genome evolves to suppress them — an arms race inside every body. We can now build them on purpose.' }); }
  },
  /* ---- level 1: diagnose the cheat ---- */
  SCEN: [{ who: 'fathers', pf: 0.9, pm: 0.5, str: '90%' }, { who: 'mothers', pf: 0.5, pm: 0.75, str: '75%' }, { who: 'neither', pf: 0.5, pm: 0.5, str: '50%' }],
  begin1() {
    this.sc = pick(this.SCEN); this.lit = []; this.budget = 6; this.ansWho = null; this.ansStr = null; this.litShow = null;
    HUD.set('<div class="hud-goal"><span><b>Level 1: A cheating chromosome</b></span><b id="sp-b"></b></div><div class="hud-line" id="sp-st"></div><div class="hud-row"><button class="btn" id="sp-f">Breed a carrier father</button><button class="btn" id="sp-m">Breed a carrier mother</button></div><div class="hud-row"><button class="btn" id="sp-who">Who cheats: ?</button><button class="btn" id="sp-str">How often: ?</button><button class="btn primary" id="sp-ck">Check</button></div>');
    $('sp-f').onclick = () => this.breed('f'); $('sp-m').onclick = () => this.breed('m');
    $('sp-who').onclick = () => { const o = [null, 'fathers', 'mothers', 'neither']; this.ansWho = o[(o.indexOf(this.ansWho) + 1) % 4]; Snd.click(); this.upd1(); };
    $('sp-str').onclick = () => { const o = [null, '50%', '75%', '90%']; this.ansStr = o[(o.indexOf(this.ansStr) + 1) % 4]; Snd.click(); this.upd1(); };
    $('sp-ck').onclick = () => this.check1(); this.upd1();
  },
  tally(sex) { const L = this.lit.filter(l => l.sex === sex); return [L.reduce((a, l) => a + l.k, 0), L.reduce((a, l) => a + l.n, 0)]; },
  upd1() {
    $('sp-b').textContent = this.budget + ' litters left'; const [kf, nf] = this.tally('f'), [km, nm] = this.tally('m');
    HUD.line('sp-st', 'Carrier fathers: <b>' + kf + ' of ' + nf + '</b> pups curly. Carrier mothers: <b>' + km + ' of ' + nm + '</b>. (Their mates are never curly.)');
    $('sp-who').textContent = 'Who cheats: ' + (this.ansWho || '?'); $('sp-str').textContent = 'How often: ' + (this.ansStr || '?');
    $('sp-f').disabled = $('sp-m').disabled = this.budget <= 0; $('sp-ck').disabled = !this.ansWho || !this.ansStr;
  },
  breed(sex) { if (this.budget <= 0) return; const p = sex === 'f' ? this.sc.pf : this.sc.pm; let k = 0; const pups = []; for (let i = 0; i < 8; i++) { const c = R() < p; pups.push(c); if (c) k++; } this.lit.push({ sex, n: 8, k }); this.budget--; this.litShow = { sex, pups, t: 0 }; Snd.dawn(); this.upd1(); },
  check1() {
    const S = this.sc, ok = this.ansWho === S.who && (S.who === 'neither' ? this.ansStr === '50%' : this.ansStr === S.str);
    const note = 'The truth: ' + (S.who === 'neither' ? 'neither parent cheats — the chromosome is transmitted fairly.' : 'carrier ' + S.who + ' pass the curly chromosome to about ' + S.str + ' of their young, the other sex a fair 50%.') + (ok ? ' You read it correctly.' : ' Your call was different.') + ' Reciprocal crosses — the same chromosome through a father and through a mother — are how drive systems like the t-haplotype were pinned down.';
    this.finishLevel(ok, note);
  },
  /* ---- level 2: centromere drive ---- */
  begin2() {
    this.oo = 0; this.log2 = [];
    HUD.set('<div class="hud-goal"><span><b>Level 2: The spindle</b></span><b id="sp-b"></b></div><div class="hud-line" id="sp-st"></div><div class="hud-row"><button class="btn primary" id="sp-re">Reorient</button></div>');
    $('sp-re').onclick = () => this.reorient(); this.newOo();
  },
  newOo() { this.o = R() < 0.5 ? 1 : -1; this.t = 0; this.T = 3.8 + R() * 3; this.err = null; this.done2 = false; this.flipT = 0; this.upd2(); },
  upd2() { $('sp-b').textContent = 'egg ' + Math.min(this.oo + 1, 10) + ' of 10'; const won = this.log2.filter(l => l.mine && l.ok).length, bad = this.log2.filter(l => !l.ok).length; HUD.line('sp-st', this.done2 ? this.msg2 : 'Your chromosome (orange) faces the <b>' + (this.o > 0 ? 'egg' : 'polar body') + '</b>.' + (this.err != null ? ' <b>An attachment error is being repaired.</b>' : '') + ' So far: <b>' + won + '</b> eggs carry you; your mother has lost <b>' + bad + '</b> egg' + (bad === 1 ? '' : 's') + ' to errors.'); $('sp-re').disabled = this.done2; },
  reorient() { if (this.done2) return; if (R() < 0.22) this.err = this.t; this.o = R() < 0.72 ? 1 : -1; this.flipT = 0.3; Snd.click(); this.upd2(); },
  update2(dt) {
    if (this.done2) return; this.t += dt; if (this.flipT > 0) this.flipT -= dt;
    if (R() < dt * 0.55) { this.o = -this.o; this.flipT = 0.3; }
    if (this.err != null && this.t - this.err > 0.9) this.err = null;
    if (this.t >= this.T) {
      this.done2 = true; const ok = this.err == null, mine = this.o > 0; this.log2.push({ ok, mine }); this.msg2 = !ok ? 'Anaphase with an error unresolved: the egg has the wrong number of chromosomes and dies.' : mine ? 'Anaphase: your chromosome went into the egg.' : 'Anaphase: your chromosome went to the polar body and is thrown away.';
      ok && mine ? Snd.chime() : Snd.miss(); this.upd2();
      setTimeout(() => { if (App.mode !== this || this.lv !== 1) return; this.oo++; if (this.oo >= 10) { const n = this.log2.filter(l => l.mine && l.ok).length, e = this.log2.filter(l => !l.ok).length; this.finishLevel(n >= 7, 'Your chromosome reached ' + n + ' of 10 eggs, where a fair one gets 5 — and your mother lost ' + e + ' egg' + (e === 1 ? '' : 's') + ' to errors. Notice who paid. When your chromosome faced the polar body it had nothing to lose by gambling: an egg it was about to lose anyway is no cost to it. The cost fell on the mother. That is why selfish elements can spread while harming the organism, and why the rest of the genome evolves to suppress them.'); } else this.newOo(); }, 1500);
    } else if (((this.t * 10) | 0) % 2 === 0) this.upd2();
  },
  /* ---- level 3: gene drive ---- */
  H: 0.95, EPS: 0.5, K: 600,
  begin3() { this.round3 = 0; this.r3 = []; this.cage(); },
  cage() {
    this.target = this.round3 === 0 ? 'variable' : null; this.gen = 0; this.rel = 0; this.hist3 = []; this.auto = false; this.over3 = false; this.acc3 = 0;
    this.pop = []; for (let i = 0; i < this.K; i++) this.pop.push({ m: i % 2 === 0, g: ['W', 'W'] });
    HUD.set('<div class="hud-goal"><span><b>Level 3: Gene drive</b> — cage ' + (this.round3 + 1) + ' of 2</span><b id="sp-b"></b></div><div class="meter"><i id="sp-bar" style="background:#8fd0c8"></i></div><div class="hud-line" id="sp-st"></div><div class="hud-row" id="sp-tg"></div><div class="hud-row"><button class="btn primary" id="sp-rel">Release 100 drive males</button></div>');
    const tg = $('sp-tg'); if (this.round3 === 1) { tg.innerHTML = '<button class="btn" data-t="variable">Target: a variable gene</button><button class="btn" data-t="dsx">Target: doublesex (conserved)</button>'; tg.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { if (this.rel) return; this.target = b.dataset.t; Snd.click(); this.upd3(); }); } else tg.style.display = 'none';
    $('sp-rel').onclick = () => this.release(); this.record3(); this.upd3();
  },
  rho() { return this.target === 'dsx' ? 0.0008 : 0.35; },
  sterile(g) { const bad = a => a === 'D' || a === 'N'; return bad(g[0]) && bad(g[1]); },
  gam(g) {
    const [a, b] = g, hasD = a === 'D' || b === 'D', hasW = a === 'W' || b === 'W';
    if (hasD && hasW) { if (R() < (1 + this.H) / 2) return 'D'; if (R() < this.EPS) return R() < this.rho() ? 'R' : 'N'; return 'W'; }
    return R() < 0.5 ? a : b;
  },
  step3() {
    const F = this.pop.filter(x => !x.m && !this.sterile(x.g)), M = this.pop.filter(x => x.m);
    if (!F.length || !M.length) { this.pop = []; return; }
    const eggs = F.length * 50, n = Math.round(eggs * 0.2 / (1 + eggs * 0.2 / this.K)), next = [];
    for (let i = 0; i < n; i++) { const mo = pick(F), fa = pick(M); next.push({ m: R() < 0.5, g: [this.gam(mo.g), this.gam(fa.g)] }); }
    this.pop = next; this.gen++;
  },
  freqs() { const c = { W: 0, D: 0, R: 0, N: 0 }; for (const x of this.pop) { c[x.g[0]]++; c[x.g[1]]++; } const t = 2 * this.pop.length || 1; return { W: c.W / t, D: c.D / t, R: c.R / t, N: c.N / t }; },
  record3() { const f = this.freqs(), fert = this.pop.filter(x => !x.m && !this.sterile(x.g)).length; this.hist3.push({ n: this.pop.length, fert, D: f.D, R: f.R }); },
  release() { if (this.over3 || this.rel >= 3 || !this.target) return; for (let i = 0; i < 100; i++) this.pop.push({ m: true, g: ['D', 'D'] }); this.rel++; this.auto = true; Snd.flood(); toast('100 drive males released into the cage.'); this.upd3(); },
  upd3() {
    const L = last(this.hist3); $('sp-b').textContent = 'generation ' + this.gen + ' of 20'; $('sp-bar').style.width = pct(clamp(L.n / this.K, 0, 1));
    HUD.line('sp-st', (this.target ? 'Target: <b>' + (this.target === 'dsx' ? 'doublesex, a conserved gene' : 'a variable gene') + '</b>. ' : '<b>Choose a target first.</b> ') + 'Mosquitoes: <b>' + L.n + '</b>, fertile females <b>' + L.fert + '</b>. Drive copies ' + pct(L.D) + ', resistant copies ' + pct(L.R) + '. Releases used: ' + this.rel + ' of 3.');
    $('sp-rel').disabled = this.over3 || this.rel >= 3 || !this.target; $('sp-tg').querySelectorAll('[data-t]').forEach(b => { b.classList.toggle('sel', b.dataset.t === this.target); b.disabled = this.rel > 0; });
  },
  update3(dt) {
    if (!this.auto || this.over3) return; this.acc3 += dt; if (this.acc3 < 1.1) return; this.acc3 = 0;
    this.step3(); this.record3(); this.upd3(); const L = last(this.hist3);
    if (L.fert === 0 || L.n < 5 || this.gen >= 20) {
      this.over3 = true; const crashed = L.fert === 0 || L.n < 5; this.r3.push({ target: this.target, crashed, gen: this.gen, rel: this.rel, R: L.R });
      toast(crashed ? '<b>The cage population has collapsed</b> in generation ' + this.gen + '.' : 'Twenty generations: the population survived. Resistant copies: ' + pct(L.R) + '.');
      setTimeout(() => { if (App.mode !== this || this.lv !== 2) return; this.round3++; if (this.round3 < 2) { Cards.open({ cls: 'intro', html: '<h3>Cage 2</h3><p>' + (crashed ? 'That drive crashed the cage — this time.' : 'Resistant copies spread: females carrying one working, uncuttable copy stayed fertile, and the population bounced back.') + ' In the second cage you choose the target.</p>', buttons: [{ t: 'Set up cage 2', primary: true, fn: () => { Cards.close(); this.cage(); } }] }); } else { const r = this.r3[1]; this.finishLevel(r.crashed, 'Cage 1 (variable target): ' + (this.r3[0].crashed ? 'crashed' : 'rescued by resistance, which reached ' + pct(this.r3[0].R)) + '. Cage 2 (' + (r.target === 'dsx' ? 'doublesex' : 'variable target') + '): ' + (r.crashed ? 'crashed in generation ' + r.gen : 'survived') + '. A drive can only win if the population cannot evolve a working copy it cannot cut; conserved targets leave almost no such escape.'); } }, 1600);
    }
  },
  update(dt) { if (this.lv === 1) this.update2(dt); if (this.lv === 2) this.update3(dt); if (this.litShow) this.litShow.t += dt; },
  mouse(c, x, y, s, curly, col) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col || '#b9aaa0'; c.beginPath(); c.ellipse(0, 0, 14, 8, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(13, -2, 7, 5, 0.2, 0, TAU); c.fill(); c.fillStyle = '#e8b0b0'; c.beginPath(); c.arc(10, -8, 3.5, 0, TAU); c.fill(); c.strokeStyle = col || '#b9aaa0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-14, 1); c.quadraticCurveTo(-24, 6, -30, -2); c.stroke(); c.strokeStyle = curly ? '#e07a3a' : 'rgba(40,40,40,.7)'; c.lineWidth = 1; for (const d of [-2, 0, 2]) { c.beginPath(); c.moveTo(19, -1 + d); if (curly) c.bezierCurveTo(24, -6 + d, 26, 4 + d, 30, -1 + d); else c.lineTo(30, -1 + d * 2); c.stroke(); } c.fillStyle = '#111'; c.beginPath(); c.arc(15, -4, 1.1, 0, TAU); c.fill(); c.restore(); },
  draw(c, w, h) {
    const g = c.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h * 0.45, Math.max(w, h) * 0.8); g.addColorStop(0, '#2c2a4a'); g.addColorStop(1, '#141326'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const s = clamp(w / 380, 0.9, 1.4);
    if (this.lv === 0) {
      ink(c, 'carrier fathers', w * 0.27, 30, 13, '#ece8f6', 'center', 'b', 600); ink(c, 'carrier mothers', w * 0.73, 30, 13, '#ece8f6', 'center', 'b', 600);
      this.mouse(c, w * 0.27, h * 0.16, s * 1.3, true, '#a89a8e'); this.mouse(c, w * 0.73, h * 0.16, s * 1.2, true, '#c4b3a6');
      const L = this.litShow; if (L) { ink(c, 'latest litter, from a carrier ' + (L.sex === 'f' ? 'father' : 'mother'), w / 2, h * 0.36, 13, 'rgba(236,232,246,.8)', 'center', 'b', 'italic'); L.pups.forEach((cur, i) => { const k = clamp((L.t - i * 0.12) / 0.3, 0, 1); if (k <= 0) return; c.globalAlpha = k; this.mouse(c, w * (0.14 + (i % 4) * 0.24), h * (0.46 + ((i / 4) | 0) * 0.12), s * 0.8, cur); c.globalAlpha = 1; }); }
      const [kf, nf] = this.tally('f'), [km, nm] = this.tally('m'), bar = (x, k, n, lab) => { const H2 = h * 0.18, y0 = h * 0.94; c.fillStyle = 'rgba(236,232,246,.1)'; c.fillRect(x - 22, y0 - H2, 44, H2); if (n) { c.fillStyle = '#e07a3a'; c.fillRect(x - 22, y0 - H2 * k / n, 44, H2 * k / n); } c.strokeStyle = '#ece8f6'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x - 28, y0 - H2 / 2); c.lineTo(x + 28, y0 - H2 / 2); c.stroke(); c.setLineDash([]); ink(c, lab + (n ? ': ' + pct(k / n) : ''), x, y0 + 14, 11, 'rgba(236,232,246,.8)', 'center', 'b'); };
      bar(w * 0.3, kf, nf, 'fathers'); bar(w * 0.7, km, nm, 'mothers'); ink(c, 'dashed line: a fair 50%', w / 2, h * 0.94 - h * 0.18 - 6, 10, 'rgba(236,232,246,.55)', 'center', 'b', 'italic');
      return;
    }
    if (this.lv === 1) {
      const cx = w / 2, cy = h * 0.47, Rr = Math.min(w, h) * 0.36; c.fillStyle = 'rgba(240,220,200,.12)'; c.beginPath(); c.arc(cx, cy, Rr, 0, TAU); c.fill(); c.strokeStyle = 'rgba(240,220,200,.35)'; c.lineWidth = 2; c.stroke();
      ink(c, 'polar body side (discarded)', cx, cy - Rr - 10, 12, 'rgba(236,232,246,.7)', 'center', 'b', 'italic'); ink(c, 'egg side (kept)', cx, cy + Rr + 20, 12, '#8fd0c8', 'center', 'b', 600);
      const top = cy - Rr * 0.8, bot = cy + Rr * 0.8; c.strokeStyle = 'rgba(143,208,200,.35)'; c.lineWidth = 1; for (let k = -5; k <= 5; k++) { c.beginPath(); c.moveTo(cx + k * 3, top); c.quadraticCurveTo(cx + k * 16, cy, cx + k * 3, bot); c.stroke(); }
      const tilt = this.flipT > 0 ? Math.sin((this.flipT / 0.3) * Math.PI) * 0.8 : 0, dy = 18 * this.o, dx = 30 * Math.sin(tilt);
      const drawCh = (x, y, col) => { c.fillStyle = col; rrect(c, x - 9, y - 16, 18, 32, 8); c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, y, 10, 3, 0, 0, TAU); c.fill(); };
      drawCh(cx + dx, cy + dy, '#e07a3a'); drawCh(cx - dx, cy - dy, '#9a96b8');
      if (this.err != null) { c.strokeStyle = '#ff6b6b'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 34, 0, TAU); c.stroke(); ink(c, 'error!', cx + 40, cy - 30, 13, '#ff6b6b', 'left', 'b', 600); }
      const k = clamp(this.t / this.T, 0, 1); c.strokeStyle = '#c9a84a'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, Rr + 8, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - k)); c.stroke();
      ink(c, 'the cell is preparing to divide', w / 2, 22, 12, 'rgba(236,232,246,.65)', 'center', 'b', 'italic');
      return;
    }
    const L = last(this.hist3) || { n: 0 }, r = rng(this.gen * 7 + this.round3), cw = w - 40, chh = h * 0.55;
    c.strokeStyle = 'rgba(236,232,246,.35)'; c.lineWidth = 2; c.strokeRect(20, 20, cw, chh); for (let x = 20; x < 20 + cw; x += 12) { c.strokeStyle = 'rgba(236,232,246,.07)'; c.beginPath(); c.moveTo(x, 20); c.lineTo(x, 20 + chh); c.stroke(); }
    const show = Math.min(300, this.pop.length); for (let i = 0; i < show; i++) { const x = this.pop[i], px = 26 + r() * (cw - 12), py = 26 + r() * (chh - 12) + Math.sin(App.t * 6 + i) * 2, col = x.g.includes('R') ? '#8fd0c8' : x.g.includes('D') ? '#e07a3a' : '#bdb8d6'; c.fillStyle = col; c.beginPath(); c.ellipse(px, py, x.m ? 2 : 3, 1.3, 0, 0, TAU); c.fill(); }
    ink(c, 'orange: carries the drive   teal: carries a resistant copy   pale: wild type', w / 2, 20 + chh + 18, 11, 'rgba(236,232,246,.75)', 'center', 'b');
    const H3 = this.hist3, y0 = h - 12, gh = h - (20 + chh + 34) - 16; if (H3.length > 1 && gh > 30) { const X = i => 20 + cw * i / 20, Y = v => y0 - gh * v; c.strokeStyle = '#ece8f6'; c.lineWidth = 2; c.beginPath(); H3.forEach((e, i) => { const y = Y(e.n / (this.K * 1.2)); i ? c.lineTo(X(i), y) : c.moveTo(X(i), y); }); c.stroke(); c.strokeStyle = '#e07a3a'; c.beginPath(); H3.forEach((e, i) => { i ? c.lineTo(X(i), Y(e.D)) : c.moveTo(X(i), Y(e.D)); }); c.stroke(); c.strokeStyle = '#8fd0c8'; c.beginPath(); H3.forEach((e, i) => { i ? c.lineTo(X(i), Y(e.R)) : c.moveTo(X(i), Y(e.R)); }); c.stroke(); }
  },
  notes() {
    if (this.lv === 0) { const rows = []; for (const [sex, lab] of [['f', 'Carrier fathers'], ['m', 'Carrier mothers']]) { const [k, n] = this.tally(sex); rows.push([lab, n ? k + ' of ' + n + ' curly (' + pct(k / n) + ')' : 'no litters yet', n ? 'Exact binomial test against 50:50: p = ' + binomP(k, n).toFixed(3) + '. Below 0.05, chance alone rarely gives a count this uneven.' : '']); } return { idea: this.ideas[0], stats: rows, charts: [] }; }
    if (this.lv === 1) { const won = this.log2.filter(l => l.mine && l.ok).length; return { idea: this.ideas[1], stats: [['Eggs won so far', won + ' of ' + this.log2.length, 'A fair chromosome averages half.'], ['Each reorientation', '72% faces the egg', 'But 22% start an attachment error that takes about a second to repair. An unresolved error kills the egg — a loss for the mother, and for you only if you were going to win it.'], ['Spontaneous flips', 'about one every 2 s', 'The pair wobbles on the spindle.']], charts: [] }; }
    const L = last(this.hist3); return { idea: this.ideas[2], stats: [['Generation', this.gen + ' of 20', ''], ['Population', L.n + '', 'The cage holds about 600.'], ['Fertile females', L.fert + '', 'Females with two broken copies of the target gene lay no eggs.'], ['Drive copies', pct(L.D), 'Homing converts the partner copy in 95% of carriers’ germlines.'], ['Resistant copies', pct(L.R), 'Working, uncuttable copies from faulty repair: ' + (this.target === 'dsx' ? 'very rare for a conserved gene.' : 'common for a variable gene.')]], charts: this.hist3.length > 1 ? [{ title: 'The cage, generation by generation', leg: legP([['#6b6590', 'population ÷ 600'], ['#e07a3a', 'drive copies'], ['#2f7f7a', 'resistant copies']]), draw: (cv, th) => lineChart(cv, { theme: th, series: [{ d: this.hist3.map(e => e.n / this.K), c: '#6b6590' }, { d: this.hist3.map(e => e.D), c: '#e07a3a' }, { d: this.hist3.map(e => e.R), c: '#2f7f7a' }], y0: 0, y1: 1.2, fy: v => v.toFixed(1), x0l: 'gen 0', xl: 'gen ' + (this.hist3.length - 1) }) }] : [] };
  }
};
