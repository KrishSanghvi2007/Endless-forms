/* ================= Chapter: Mendel's Garden (inheritance) ================= */
const PURPLE = '#8a58b8', WHITEF = '#f1ece0';
function drawPea(c, x, fy, purple, s, glow) {
  c.save(); c.translate(x, fy); c.scale(s, s);
  if (glow) { c.fillStyle = 'rgba(207,154,51,.22)'; c.beginPath(); c.arc(0, 16, 30, 0, TAU); c.fill(); c.strokeStyle = '#cf9a33'; c.lineWidth = 2; c.stroke(); }
  c.strokeStyle = '#5f8a3c'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 46); c.quadraticCurveTo(-4, 26, 0, 6); c.stroke();
  c.fillStyle = '#6f9a45'; c.beginPath(); c.ellipse(-9, 30, 8, 4, -0.6, 0, TAU); c.fill(); c.beginPath(); c.ellipse(9, 22, 8, 4, 0.6, 0, TAU); c.fill();
  c.strokeStyle = '#7da852'; c.lineWidth = 1; c.beginPath(); c.arc(12, 36, 3, 0, 4.5); c.stroke();
  const f = purple ? PURPLE : WHITEF, f2c = purple ? '#6d3f96' : '#d9d2c2';
  c.fillStyle = f; c.beginPath(); c.ellipse(0, -2, 9.5, 8, 0, 0, TAU); c.fill();
  c.fillStyle = f2c; c.beginPath(); c.ellipse(-5, 5, 5, 4, -0.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(5, 5, 5, 4, 0.4, 0, TAU); c.fill();
  c.fillStyle = purple ? '#caa8e6' : '#fffaf0'; c.beginPath(); c.ellipse(0, -4, 4, 3, 0, 0, TAU); c.fill();
  c.restore();
}
const CH_MENDEL = {
  id: 'mendel',
  intro: {
    hook: 'Six pea plants have purple flowers. Some of them secretly carry the instructions for white, hidden under the purple. One plant, W, is white through and through.',
    how: 'Tap one plant, then another, to cross-pollinate them: ten seeds grow and flower below. Tap the same plant twice to let it pollinate itself. When you’re sure, tap the label under each purple plant to mark it pure or carrier, then check.',
    goal: 'Mark all six correctly using at most eight crosses. Three stars if you need five or fewer.'
  },
  real: 'Gregor Mendel crossed pea plants in his monastery garden in Brno in the 1850s and 1860s. From ratios like three purple to one white he inferred that each plant carries two copies of each hereditary factor, hands one at random to each offspring, and that one version can mask the other. The test cross you used — crossing an unknown with a white plant — is still how breeders and geneticists unmask carriers.',
  maths: 'Call the purple copy P and the white copy p. A carrier (Pp) makes P and p pollen and eggs in equal numbers, so crossed with white (pp) half its seeds are Pp (purple) and half pp (white). The chance a carrier gives ten purple seeds in a row with a white partner is (½)¹⁰, about 1 in 1000. Two carriers give white a quarter of the time, (½)×(½), which is Mendel’s 3 : 1. A pure plant (PP) never gives white, whatever its partner.',
  idea: '<p>Every plant carries <b>two copies</b> of the flower-colour gene, one inherited from each parent. The purple copy (P) masks the white copy (p), so a purple plant is either <b>pure</b> (PP) or a <b>carrier</b> (Pp). The white plant must be pp: white only shows when nothing masks it.</p><p>Each seed gets <b>one copy from each parent</b>, picked at random. So a white seed needs a white copy from both sides.</p><p>That tells you which crosses are informative. Ask yourself which partner hides nothing.</p>',
  start() {
    const carriers = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 2 + ((R() * 3) | 0));
    this.pl = []; for (let i = 0; i < 6; i++) this.pl.push({ n: 'ABCDEF'[i], g: carriers.includes(i) ? shuffle([1, 0]) : [1, 1], mark: null });
    this.pl.push({ n: 'W', g: [0, 0], white: true });
    this.sel = null; this.log = []; this.budget = 8; this.tray = null; this.pollen = null; this.revealed = false; this.t = 0;
    HUD.set('<div class="hud-goal"><span>Crosses left</span><b id="md-left"></b></div><div class="hud-line" id="md-st"></div><div class="hud-row"><button class="btn primary" id="md-check" disabled>Check my marks</button></div>');
    $('md-check').onclick = () => this.check(); this.status('Tap a plant to choose the first parent.'); this.upd();
  },
  status(t) { HUD.line('md-st', t); },
  upd() { $('md-left').textContent = this.budget + ' of 8'; $('md-check').disabled = !this.pl.slice(0, 6).every(p => p.mark) || this.revealed; },
  pos(i, w, h) { const s = clamp(Math.min(w / 390, h / 520), 0.8, 1.35); return i < 4 ? { x: w * (0.13 + 0.245 * i), fy: h * 0.07 + 18 * s, s } : { x: w * [0.22, 0.48, 0.79][i - 4], fy: h * 0.33 + 14 * s, s }; },
  tap(x, y) {
    if (this.revealed) return; const w = Stage.w, h = Stage.h;
    for (let i = 0; i < 6; i++) { const { x: px, fy, s } = this.pos(i, w, h); if (x > px - 38 && x < px + 38 && y > fy + 56 * s && y < fy + 56 * s + 30) { const p = this.pl[i]; p.mark = p.mark == null ? 'pure' : p.mark === 'pure' ? 'carrier' : null; Snd.click(); this.upd(); return; } }
    for (let i = 0; i < 7; i++) { const { x: px, fy, s } = this.pos(i, w, h); if (Math.hypot(x - px, y - (fy + 18 * s)) < 32 * s) { this.pick(i); return; } }
    if (this.sel != null) { this.sel = null; this.status('Choice cleared. Tap a plant to choose the first parent.'); }
  },
  pick(i) {
    if (this.pollen) return;
    if (this.sel == null) { this.sel = i; Snd.click(); this.status('<b>' + this.pl[i].n + '</b> chosen. Now tap its partner, or tap ' + this.pl[i].n + ' again to let it pollinate itself.'); return; }
    if (this.budget <= 0) { toast('No crosses left. Mark each plant, then check.'); this.sel = null; return; }
    const a = this.sel, b = i; this.sel = null; this.budget--;
    const kids = []; for (let k = 0; k < 10; k++) kids.push([pick(this.pl[a].g), pick(this.pl[b].g)]);
    this.pollen = { a, b, t: 0 }; this.pending = { a, b, kids }; Snd.peck(); this.upd();
  },
  nm(p) { return p.a === p.b ? this.pl[p.a].n + ' selfed' : this.pl[p.a].n + ' × ' + this.pl[p.b].n; },
  whites(p) { return p.kids.filter(k => k[0] + k[1] === 0).length; },
  update(dt) {
    this.t += dt;
    if (this.pollen) { this.pollen.t += dt; if (this.pollen.t > 0.75) { const p = this.pending; this.pollen = null; this.tray = Object.assign({ t: 0 }, p); this.log.push(p); if (this.confNote) this.confNote(p); const wh = this.whites(p); this.status('<b>' + this.nm(p) + '</b>: ' + (10 - wh) + ' purple, ' + wh + ' white.' + (this.budget === 0 ? ' No crosses left: mark each plant, then check.' : ' Tap two more plants to cross again.')); Snd.dawn(); } }
    if (this.tray) this.tray.t += dt;
  },
  draw(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dfe7c9'); g.addColorStop(1, '#cdd8b0'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rng(9); c.fillStyle = 'rgba(120,95,60,.22)'; for (let i = 0; i < 90; i++) { c.beginPath(); c.ellipse(r() * w, r() * h * 0.6, 2 + r() * 5, 1 + r() * 2, r() * 3, 0, TAU); c.fill(); }
    for (let i = 0; i < 7; i++) {
      const { x, fy, s } = this.pos(i, w, h), p = this.pl[i], purple = !p.white;
      drawPea(c, x, fy, purple, s, this.sel === i || (this.pollen && (this.pollen.a === i || this.pollen.b === i)));
      ink(c, p.n, x, fy - 14 * s, 15, '#27351f', 'center', 'd', 600);
      if (p.white) { ink(c, 'white', x, fy + 60 * s + 14, 13, 'rgba(39,53,31,.7)', 'center', 'b', 'italic'); continue; }
      const by = fy + 56 * s; let lab = 'mark ?', fill = 'rgba(39,53,31,.06)', tc = 'rgba(39,53,31,.7)';
      if (p.mark === 'pure') { lab = 'pure'; fill = '#2f7f7a'; tc = '#f4efe2'; } else if (p.mark === 'carrier') { lab = 'carrier'; fill = '#b8862a'; tc = '#211a12'; }
      c.fillStyle = fill; rrect(c, x - 34, by, 68, 26, 13); c.fill(); c.strokeStyle = 'rgba(39,53,31,.3)'; c.lineWidth = 1; c.stroke();
      ink(c, lab, x, by + 18, 13, tc, 'center', 'b', 600);
      if (this.revealed) { ink(c, (p.g[0] ? 'P' : 'p') + (p.g[1] ? 'P' : 'p') + (p.ok ? '  ✓' : '  ✗'), x, by + 44, 14, p.ok ? '#1f7a6e' : '#b8323f', 'center', 'm', 500); }
    }
    if (this.revealed) { const { x, fy, s } = this.pos(6, w, h); ink(c, 'pp', x, fy + 56 * s + 34, 14, '#27351f', 'center', 'm', 500); }
    if (this.pollen) {
      const A = this.pos(this.pollen.a, w, h), B = this.pos(this.pollen.b, w, h), k = clamp(this.pollen.t / 0.7, 0, 1);
      for (let j = 0; j < 8; j++) { const kk = clamp(k * 1.3 - j * 0.04, 0, 1), x = lerp(B.x, A.x, kk) + Math.sin(j * 2 + kk * 9) * 6, y = lerp(B.fy, A.fy, kk) - Math.sin(kk * Math.PI) * 40; c.fillStyle = 'rgba(190,140,30,.95)'; c.beginPath(); c.arc(x, y, 2, 0, TAU); c.fill(); }
    }
    const y0 = h * 0.62, th = h - y0 - 8; c.fillStyle = 'rgba(39,53,31,.05)'; rrect(c, 8, y0, w - 16, th, 10); c.fill(); c.strokeStyle = 'rgba(39,53,31,.18)'; c.stroke();
    if (!this.tray) { ink(c, 'Seeds from your crosses will grow here.', w / 2, y0 + th / 2, 14, 'rgba(39,53,31,.6)', 'center', 'b', 'italic'); return; }
    const T = this.tray, wh = this.whites(T);
    ink(c, 'Seeds from ' + this.nm(T), 20, y0 + 22, 15, '#27351f', 'left', 'd', 600);
    ink(c, (10 - wh) + ' purple, ' + wh + ' white', w - 20, y0 + 22, 14, 'rgba(39,53,31,.75)', 'right', 'b');
    const cols = 5, cw = (w - 40) / cols, s2 = clamp(th / 150, 0.5, 0.8);
    T.kids.forEach((k, i) => {
      const gx = 20 + cw * (i % cols) + cw / 2, gy = y0 + 42 + ((i / cols) | 0) * (th - 50) / 2, gr = clamp((T.t - i * 0.05) / 0.4, 0, 1); if (gr <= 0) return;
      c.save(); c.translate(gx, gy + 46 * s2 * (1 - gr)); c.scale(1, gr); drawPea(c, 0, 0, k[0] + k[1] > 0, s2, false); c.restore();
      if (this.revealed) ink(c, (k[0] ? 'P' : 'p') + (k[1] ? 'P' : 'p'), gx, gy + 50 * s2 + 8, 11, 'rgba(39,53,31,.8)', 'center', 'm');
    });
  },
  check() {
    this.revealed = true; let ok = 0; for (const p of this.pl.slice(0, 6)) { p.ok = (p.mark === 'carrier') === (p.g[0] + p.g[1] === 1); if (p.ok) ok++; }
    const used = 8 - this.budget, all = ok === 6, stars = all ? (used <= 5 ? 3 : used <= 6 ? 2 : 1) : 0; this.upd();
    this.status(all ? 'All six right.' : ok + ' of 6 right. Genotypes are now shown under each plant.');
    const wrong = this.pl.slice(0, 6).find(p => !p.ok);
    const insight = all ? 'Every call right, in ' + used + ' cross' + (used === 1 ? '' : 'es') + '. The white plant hides nothing, so crossed with a carrier it lets the carrier’s hidden white copy show up in about half the seeds. And any two purple plants that throw even one white seed must both be carriers — which is how you can clear two plants with one cross.'
      : 'Plant ' + wrong.n + ' was ' + (wrong.g[0] + wrong.g[1] === 1 ? 'a carrier' : 'pure') + '. Hidden copies only show when two of them meet in one seed. A carrier crossed with a pure plant never gives white, so that cross can’t tell the two apart; the white plant can.';
    setTimeout(() => { if (App.mode === this) this.afterL1(all, used, insight); }, 1500);
  },
  chart(cv) { barChart(cv, { groups: this.log.map(p => ({ label: this.nm(p).replace(' selfed', '⊗').replace(' × ', '×'), parts: [{ v: this.whites(p), c: '#b9ae94' }, { v: 10 - this.whites(p), c: PURPLE }] })) }); },
  notes() {
    const rows = this.log.map(p => { const wh = this.whites(p), hasW = this.pl[p.a].white || this.pl[p.b].white; return [this.nm(p), (10 - wh) + ' purple, ' + wh + ' white', wh ? 'White seeds mean both parents handed over a hidden white copy.' : hasW ? 'No white in ten: almost certainly pure. A carrier would give about half white; ten purples in a row from a carrier has a 1-in-1024 chance.' : 'No white: at least one parent is probably pure. This cross can’t say which.']; });
    rows.unshift(['Crosses used', (8 - this.budget) + ' of 8', '']);
    return { idea: this.idea, stats: rows, charts: this.log.length ? [{ title: 'Your crosses', leg: legP([[PURPLE, 'purple seeds'], ['#b9ae94', 'white seeds']]), draw: cv => this.chart(cv) }] : [] };
  }
};

/* ================= Chapter: Drift Casino (genetic drift) ================= */
function binomDraw(N, p) { if (N * p * (1 - p) > 20) return clamp(Math.round(N * p + Math.sqrt(N * p * (1 - p)) * gauss()), 0, N); let k = 0; for (let i = 0; i < N; i++) if (R() < p) k++; return k; }
const CH_CASINO = {
  id: 'casino',
  intro: {
    hook: 'Each jar holds beads of two colours. Every generation a fresh jar is filled by copying beads from the old one at random. No colour is better than the other; it is pure chance. The croupier sets the odds — and he believes two wrong things about how jars change.',
    how: 'Pick an outcome and a stake, then run thirty generations of copying and watch. Each bet shows what it pays.',
    goal: 'Turn 100 chips into 250 over ten jars. Later jars add twists the croupier ignores: an advantage for one colour, and a disaster. Three stars at 400.'
  },
  real: 'This is genetic drift: in any finite population, which individuals happen to leave offspring is partly luck, so gene frequencies wander even when no variant is better than another. Sewall Wright and R. A. Fisher worked out its mathematics in the 1920s and 30s, and Motoo Kimura built the neutral theory of molecular evolution on it. Drift is why small, isolated populations — island species, zoo populations, the founders of a new colony — lose genetic variation fast.',
  maths: 'Two results beat the croupier. First, a neutral variant’s chance of eventually taking over equals its current frequency: a colour at 80% wins 80% of the time. Second, drift’s speed scales with population size: the chance that two beads in the next jar were copied from the same parent is 1/N, so variation (heterozygosity, 2pq) shrinks by a factor of (1 − 1/N) each generation. A jar of 300 barely changes in thirty generations; a jar of 6 is usually settled within ten.',
  idea: '<p>In the first jars, nothing is selected. Each new bead copies a random bead from the jar before. Yet the colours wander, because a random sample never matches its source exactly.</p><p>Two things decide how the wandering ends. Think about what the <b>starting share</b> of a colour should mean for its chances — and about how much a jar of 6 can wobble compared with a jar of 300.</p><p>The croupier thinks every jar is a coin toss, and that every jar settles as fast as a jar of 20.</p>',
  TABLES: [[20, 0.5], [10, 0.8], [200, 0.5], [12, 0.25], [6, 0.5], [40, 0.3, 0.15], [6, 0.3, 0.15], [300, 0.7], [200, 0.5, 0, [3, 2]], [8, 0.9]], T: 30, STAKES: [10, 25, 50],
  wf(n, cur, s, nxt) { const p = n / cur, q = s ? p * (1 + s) / (1 + p * s) : p; return binomDraw(nxt, q); },
  sim(N, p, runs, s, bn) { let b = 0, r = 0; for (let k = 0; k < runs; k++) { let n = Math.round(N * p), cur = N; for (let t = 0; t < this.T && n > 0 && n < cur; t++) { const nx = bn && t + 1 === bn[0] ? bn[1] : N; n = this.wf(n, cur, s || 0, nx); cur = nx; } if (n === cur) b++; else if (n === 0) r++; } return [b / runs, r / runs, 1 - (b + r) / runs]; },
  start() {
    this.i = 0; this.chips = 100; this.results = []; this.bet = null; this.stake = 25; this.run = null;
    if (!this.naiveMix) this.naiveMix = this.sim(20, 0.5, 3000)[2];
    this.newTable();
  },
  newTable() {
    const [N, p, s, bn] = this.TABLES[this.i]; this.N = N; this.cur = N; this.p0 = p; this.s = s || 0; this.bn = bn || null; this.n = Math.round(N * p); this.trace = [this.n / N]; this.gen = 0; this.run = null; this.bet = null; this.resolved = false;
    this.truth = this.sim(N, p, 2500, this.s, this.bn);
    const nb = (1 - this.naiveMix) / 2, naive = [nb, nb, this.naiveMix];
    this.mult = naive.map(q => Math.max(1.1, Math.round(0.9 / q * 10) / 10));
    this.naive = naive; this.order = shuffle([...Array(N).keys()]); this.layout = null;
    this.stake = Math.min(this.stake, this.chips);
    this.hud(); $('bar-gen').textContent = 'jar ' + (this.i + 1) + ' of ' + this.TABLES.length;
  },
  hud() {
    const lab = ['Blue takes over', 'Red takes over', 'Still mixed at 30'];
    HUD.set('<div class="hud-goal"><span>Chips</span><b id="dc-chips" class="big">' + this.chips + '</b></div><div class="hud-line" id="dc-st"></div>' +
      '<div class="hud-row">' + lab.map((t, k) => '<button class="btn" data-b="' + k + '">' + t + ' <span class="mono">×' + this.mult[k].toFixed(1) + '</span></button>').join('') + '</div>' +
      '<div class="hud-row"><span style="font-size:14px;color:var(--paper-dim)">Stake</span>' + this.STAKES.map(v => '<button class="btn" data-s="' + v + '" style="flex:0 0 58px">' + v + '</button>').join('') + '<button class="btn primary" id="dc-go">Run</button></div>');
    $('hud').querySelectorAll('[data-b]').forEach(b => b.onclick = () => { if (this.run || this.resolved) return; this.bet = +b.dataset.b; Snd.click(); this.refresh(); });
    $('hud').querySelectorAll('[data-s]').forEach(b => b.onclick = () => { if (this.run || this.resolved) return; this.stake = Math.min(+b.dataset.s, this.chips); Snd.click(); this.refresh(); });
    $('dc-go').onclick = () => this.go();
    this.refresh();
  },
  refresh() {
    $('dc-chips').textContent = this.chips;
    $('hud').querySelectorAll('[data-b]').forEach(b => b.classList.toggle('sel', +b.dataset.b === this.bet));
    $('hud').querySelectorAll('[data-s]').forEach(b => { b.classList.toggle('sel', +b.dataset.s === this.stake); b.disabled = +b.dataset.s > this.chips; });
    const go = $('dc-go');
    if (this.resolved) { go.textContent = this.i >= this.TABLES.length - 1 || this.chips < 10 ? 'Cash out' : 'Next jar'; go.disabled = false; }
    else { go.textContent = this.run ? 'Running…' : 'Run'; go.disabled = !!this.run || this.bet == null; }
    if (!this.run && !this.resolved) HUD.line('dc-st', 'Jar ' + (this.i + 1) + ': <b>' + this.N + ' beads</b>, ' + pct(this.p0) + ' blue. ' + (this.s ? '<b>Twist: blue beads get copied ' + pct(this.s) + ' more often.</b> ' : '') + (this.bn ? '<b>Twist: at generation ' + this.bn[0] + ' a disaster leaves just ' + this.bn[1] + ' beads, then the jar refills.</b> ' : '') + (this.bet == null ? 'Choose a bet.' : 'Stake ' + this.stake + ' on “' + ['blue takes over', 'red takes over', 'still mixed'][this.bet] + '”.'));
  },
  go() {
    if (this.resolved) { if (this.i >= this.TABLES.length - 1 || this.chips < 10) this.finish(); else { this.i++; this.newTable(); } return; }
    if (this.bet == null || this.run) return; this.run = { t: 0 }; Snd.click(); this.refresh();
  },
  update(dt) {
    if (!this.run) return; this.run.t += dt;
    const per = this.N >= 100 ? 0.13 : 0.17;
    while (this.run && this.run.t > per) {
      this.run.t -= per; this.gen++; const nx = this.bn && this.gen === this.bn[0] ? this.bn[1] : this.N; this.n = this.wf(this.n, this.cur, this.s, nx); this.cur = nx; this.trace.push(this.n / this.cur); this.order = shuffle(this.order);
      if (this.gen % 3 === 0) Snd.click();
      if (this.n === 0 || this.n === this.cur || this.gen >= this.T) this.resolve();
    }
  },
  resolve() {
    const out = this.n === this.cur ? 0 : this.n === 0 ? 1 : 2, win = out === this.bet, d = win ? Math.round(this.stake * (this.mult[this.bet] - 1)) : -this.stake;
    this.chips += d; this.run = null; this.resolved = true;
    this.results.push({ N: this.N, p: this.p0, out, win, d, gen: this.gen, trace: this.trace.slice(), truth: this.truth, naive: this.naive, chips: this.chips });
    if (win) Snd.star(); else Snd.miss();
    const words = ['Blue took over', 'Red took over', 'Still mixed at 30'][out] + (out < 2 ? ' at generation ' + this.gen : '');
    HUD.line('dc-st', '<b>' + words + '.</b> You ' + (win ? 'won ' + d : 'lost ' + (-d)) + '. True chances from 2,500 simulated jars: blue ' + pct(this.truth[0]) + ', red ' + pct(this.truth[1]) + ', mixed ' + pct(this.truth[2]) + '. The croupier priced them ' + pct(this.naive[0]) + ', ' + pct(this.naive[1]) + ', ' + pct(this.naive[2]) + '.');
    this.refresh();
  },
  finish() {
    const c = this.chips, stars = c >= 400 ? 3 : c >= 320 ? 2 : c >= 250 ? 1 : 0;
    const insight = 'You finished with ' + c + ' chips. The croupier’s two mistakes are the two rules of drift. A colour’s chance of taking over equals its current share — a jar that starts 80% blue ends all blue about 80% of the time, not half. And drift is fast only in small jars: a jar of 6 settles within a few generations, while a jar of 300 hardly moves in thirty. That is why small populations lose variation quickly and big ones hold on to it. The twists add two more rules. An advantage decides the outcome only when the population is big enough for it to beat chance: a 15% edge nearly guarantees victory in a jar of 40, but in a jar of 6 it barely beats a coin toss (selection wins when N × s is well above 1). And one disaster can undo everything: a jar of 200 squeezed through 2 beads — a single founding pair — is, for that moment, a jar of 2, and half the time it comes out one colour.';
    End.show(this, { stars, title: c >= 250 ? 'You beat the house' : 'The house won', insight, leg: legP([['#2f7f7a', 'small jars (under 25)'], ['#8a5d10', 'large jars (100 or more)'], ['#6b5f52', 'jar of 20']]), chart: cv => this.traceChart(cv), cap: 'Blue’s share in every jar you played, generation by generation.' });
  },
  traceChart(cv) { lineChart(cv, { theme: 'paper', series: this.results.map(r => ({ d: r.trace, c: r.N < 25 && r.N !== 20 ? '#2f7f7a' : r.N >= 100 ? '#8a5d10' : '#6b5f52', w: 1.6 })), y0: 0, y1: 1, xmax: this.T, fy: v => pct(v), x0l: 'gen 0', xl: 'gen 30' }); },
  draw(c, w, h) {
    c.fillStyle = '#1b2422'; c.fillRect(0, 0, w, h);
    const g = c.createRadialGradient(w / 2, h * 0.3, 20, w / 2, h * 0.3, w); g.addColorStop(0, 'rgba(60,90,70,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const jw = Math.min(w * 0.62, 260), jh = Math.min(h * 0.46, 250), jx = (w - jw) / 2, jy = 26;
    c.fillStyle = 'rgba(200,225,230,.07)'; rrect(c, jx, jy, jw, jh, 22); c.fill(); c.strokeStyle = 'rgba(220,235,235,.45)'; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(220,235,235,.25)'; rrect(c, jx + jw * 0.18, jy - 12, jw * 0.64, 14, 5); c.fill();
    const N = this.cur || this.N, cols = Math.ceil(Math.sqrt(N * jw / jh)), rows = Math.ceil(N / cols), cs = Math.min((jw - 24) / cols, (jh - 24) / rows), r = Math.max(1.5, cs * 0.42);
    const ox = jx + (jw - cols * cs) / 2 + cs / 2, oy = jy + jh - 12 - rows * cs + cs / 2;
    for (let k = 0; k < N; k++) { const idx = this.order[k % this.order.length] % N, blue = idx < this.n, cx = ox + (k % cols) * cs, cy = oy + ((k / cols) | 0) * cs; c.fillStyle = blue ? '#4f8fc4' : '#c23a4a'; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill(); }
    ink(c, 'generation ' + this.gen, jx, jy + jh + 22, 13, 'rgba(232,223,201,.7)', 'left', 'm');
    ink(c, pct(this.n / N) + ' blue' + (N !== this.N ? ' (only ' + N + ' left!)' : ''), jx + jw, jy + jh + 22, 16, '#8fc0e6', 'right', 'd', 600);
    const cy0 = jy + jh + 36, ch = h - cy0 - 10, cx0 = 34, cw = w - 48;
    if (ch > 40) {
      c.strokeStyle = 'rgba(232,223,201,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(cx0, cy0); c.lineTo(cx0, cy0 + ch); c.lineTo(cx0 + cw, cy0 + ch); c.stroke();
      c.setLineDash([3, 4]); c.beginPath(); c.moveTo(cx0, cy0 + ch * (1 - this.p0)); c.lineTo(cx0 + cw, cy0 + ch * (1 - this.p0)); c.stroke(); c.setLineDash([]);
      ink(c, '100%', cx0 - 4, cy0 + 8, 10, 'rgba(232,223,201,.6)', 'right', 'm'); ink(c, '0', cx0 - 4, cy0 + ch, 10, 'rgba(232,223,201,.6)', 'right', 'm');
      c.strokeStyle = '#8fc0e6'; c.lineWidth = 2; c.beginPath(); this.trace.forEach((v, t) => { const x = cx0 + cw * t / this.T, y = cy0 + ch * (1 - v); if (t) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
    }
  },
  notes() {
    const p = this.n / this.N, rows = [['Jar', (this.i + 1) + ' of ' + this.TABLES.length + ', ' + this.N + ' beads', this.s ? 'Blue is copied ' + pct(this.s) + ' more often: N × s = ' + (this.N * this.s).toFixed(1) + '. Selection beats drift when this is well above 1.' : this.bn ? 'A bottleneck to ' + this.bn[1] + ' beads at generation ' + this.bn[0] + '. Effective size is dominated by the smallest generation (it is the harmonic mean).' : ''], ['Generation', this.gen + ' of ' + this.T, ''], ['Blue share now', pct(p), 'Its chance of eventually taking over the jar is exactly this share. Drift has no memory.'], ['Variation left (2pq)', (2 * p * (1 - p)).toFixed(3), 'Highest (0.5) at a 50:50 mix, zero once one colour has taken over.'], ['Expected loss per generation', pct(1 / this.N), 'On average variation shrinks by 1/N each generation: the chance two new beads copied the same parent.']];
    this.results.forEach((r, k) => rows.push(['Jar ' + (k + 1) + ' (' + r.N + ' beads, ' + pct(r.p) + ' blue)', (r.win ? '+' : '−') + Math.abs(r.d), ['Blue took over', 'Red took over', 'Still mixed'][r.out] + '. True chances: blue ' + pct(r.truth[0]) + ', mixed ' + pct(r.truth[2]) + '.']));
    return { idea: this.idea, stats: rows, charts: this.results.length ? [{ title: 'Every jar so far', leg: legP([['#2f7f7a', 'small jars'], ['#8a5d10', 'large jars'], ['#6b5f52', 'jar of 20']]), draw: cv => this.traceChart(cv) }, { title: 'Your chips', draw: (cv, th) => lineChart(cv, { theme: th, series: [{ d: [100].concat(this.results.map(r => r.chips)), c: '#a8263f' }], y0: 0, y1: Math.max(300, ...this.results.map(r => r.chips)), refs: [{ v: 200, label: '200' }], fy: v => Math.round(v) + '', x0l: 'start', xl: 'jar ' + this.results.length }) }] : [] };
  }
};

/* ================= Chapter: Fisher's Brood (sex ratio) ================= */
const CH_BROOD_V1 = {
  id: 'brood', B: 4,
  intro: {
    hook: 'You are a wasp mother laying a brood of ten, and you choose how many will be sons. A disease has just wiped out most of the males around you: only one adult in five is male.',
    how: 'Use − and + to set your sons, then lay the brood. You score grandchildren. After six seasons the rules change: you’ll lay inside a fig.',
    goal: 'Collect at least 80% of the best possible grandchildren over ten seasons. Three stars at 96%.'
  },
  real: 'R. A. Fisher’s argument (1930) explains why most species produce sons and daughters in roughly equal numbers even though a few males could fertilise every female. Every offspring has exactly one mother and one father, so if one sex is scarce, each member of it has more offspring, and parents that produce the scarce sex are favoured until it isn’t scarce. W. D. Hamilton (1967) showed where the argument breaks: when brothers compete with each other for mates, as in fig wasps whose males never leave the fig they hatched in, mothers should lay mostly daughters — and fig wasps do.',
  maths: 'In the open population, a daughter gives you B = 4 grandchildren and a son gives 4 × (females ÷ males), because all the males together father exactly as many young as all the females mother. With one male per four females a son is worth 16; at 1:1 sons and daughters are worth the same. In the fig, your sons share only this fig’s females with the other mother’s sons, so each extra son mostly steals matings from his own brothers. Hamilton’s rule for n mothers sharing a patch is to make (n − 1) ÷ 2n sons: with two mothers, a quarter.',
  idea: '<p>Every grandchild has exactly <b>one mother and one father</b>. So all the males in the population, together, father exactly as many young as all the females mother.</p><p>That means the value of a son depends on how many males there are. If males are rare, each one fathers many young; if they’re common, each fathers few. A daughter’s value doesn’t change: she always has her own brood.</p><p>Everyone else is evolving too. Watch what happens to the share of males as mothers respond.</p>',
  start() {
    this.season = 1; this.m = 0.2; this.sons = 5; this.total = 0; this.best = 0; this.log = []; this.anim = null;
    HUD.set('<div class="hud-goal"><span id="fb-ctx"></span><b id="fb-season"></b></div><div class="hud-line" id="fb-st"></div><div class="hud-row"><div class="stepper"><button id="fb-m" aria-label="Fewer sons">−</button><span id="fb-mix" style="min-width:132px;text-align:center;font-size:15px"></span><button id="fb-p" aria-label="More sons">+</button></div><button class="btn primary" id="fb-go">Lay brood</button></div>');
    $('fb-m').onclick = () => { if (this.anim) return; this.sons = Math.max(0, this.sons - 1); Snd.click(); this.upd(); };
    $('fb-p').onclick = () => { if (this.anim) return; this.sons = Math.min(10, this.sons + 1); Snd.click(); this.upd(); };
    $('fb-go').onclick = () => this.lay(); this.upd();
  },
  fig() { return this.season > 6; },
  value(s) { const d = 10 - s; if (!this.fig()) return this.B * (d + s * (1 - this.m) / this.m); return this.B * (d + (s > 0 ? s * (d + 5) / (s + 5) : 0)); },
  bestS() { let bs = 0, bv = -1; for (let s = 0; s <= 10; s++) { const v = this.value(s); if (v > bv + 1e-9) { bv = v; bs = s; } } return [bs, bv]; },
  upd() {
    $('fb-mix').innerHTML = '<b>' + this.sons + '</b> sons, <b>' + (10 - this.sons) + '</b> daughters'; $('fb-go').disabled = !!this.anim;
    $('fb-season').textContent = 'season ' + Math.min(this.season, 10) + ' of 10'; $('bar-gen').textContent = '';
    $('fb-ctx').innerHTML = this.fig() ? 'Inside the fig' : 'Males in the population: <b>' + pct(this.m) + '</b>';
    if (!this.anim) HUD.line('fb-st', this.log.length ? 'Last brood: <b>' + last(this.log).v.toFixed(0) + '</b> grandchildren. Total so far ' + this.total.toFixed(0) + '.' : 'Grandchildren are the only currency.');
  },
  lay() {
    if (this.anim || this.season > 10) return;
    const s = this.sons, v = this.value(s), [bs, bv] = this.bestS(), fig = this.fig();
    const sonVal = fig ? (s > 0 ? this.B * (10 - s + 5) / (s + 5) : this.B * (10 - s + 5) / 5) : this.B * (1 - this.m) / this.m;
    this.total += v; this.best += bv; this.log.push({ season: this.season, m: this.m, s, v, bs, bv, fig, sonVal });
    this.anim = { t: 0, s, sonVal, v }; Snd.peck();
    HUD.line('fb-st', 'Each son fathers <b>' + sonVal.toFixed(1) + '</b> grandchildren; each daughter mothers <b>' + this.B + '</b>. This brood: <b>' + v.toFixed(0) + '</b>.');
    this.upd();
  },
  update(dt) {
    if (!this.anim) return; this.anim.t += dt;
    if (this.anim.t > 2.2) {
      this.anim = null;
      if (!this.fig()) this.m = clamp(this.m + 0.4 * (0.5 - this.m) + 0.012 * gauss(), 0.05, 0.95);
      this.season++;
      if (this.season === 7) Cards.open({ cls: 'intro', html: '<h3>Into the fig</h3><p>From now on you lay inside a fig with one other mother. She lays five sons and five daughters every time.</p><p>Fig wasp sons are wingless: they never leave the fig. They mate only with the females inside it — their own sisters and the other mother’s daughters — and then die.</p>', buttons: [{ t: 'Carry on', primary: true, fn: () => Cards.close() }] });
      if (this.season > 10) { this.finish(); return; }
      this.upd();
    }
  },
  finish() {
    const e = this.total / this.best, stars = e >= 0.96 ? 3 : e >= 0.88 ? 2 : e >= 0.8 ? 1 : 0;
    const open = this.log.filter(l => !l.fig), fig = this.log.filter(l => l.fig);
    const insight = 'You collected ' + pct(e) + ' of the best possible grandchildren. In the open population males started rare, so each son was worth ' + open[0].sonVal.toFixed(0) + ' grandchildren against a daughter’s 4 — and as every mother cashed in on sons, the share of males climbed to ' + pct(last(open).m) + ', where a son and a daughter are worth the same. That is Fisher’s principle: the rarer sex is always the better investment, so evolution balances them. In the fig your sons competed with their own brothers for the same few females, and the best brood had just ' + fig[0].bs + ' son' + (fig[0].bs === 1 ? '' : 's') + '.';
    End.show(this, { stars, title: 'Ten seasons laid', insight, leg: legP([['#4f6478', 'males in the population'], ['#a8263f', 'sons in your broods']]), chart: cv => this.chart(cv, 'paper'), cap: 'Seasons 7 to 10 were in the fig, where the population share no longer applies.' });
  },
  chart(cv, th) { lineChart(cv, { theme: th, series: [{ d: this.log.filter(l => !l.fig).map(l => l.m), c: '#4f6478' }, { d: this.log.map(l => l.s / 10), c: '#a8263f' }], y0: 0, y1: 1, xmax: 9, refs: [{ v: 0.5, label: '1 : 1' }], fy: v => pct(v), x0l: 'season 1', xl: 'season 10' }); },
  draw(c, w, h) {
    const fig = this.fig(); c.fillStyle = fig ? '#2a1f24' : '#26331f'; c.fillRect(0, 0, w, h);
    const r = rng(3);
    if (!fig) {
      const n = 60, males = Math.round(n * this.m);
      for (let i = 0; i < n; i++) { const x = 20 + r() * (w - 40), y = 20 + r() * (h * 0.5), male = i < males, bob = Math.sin(App.t * 3 + i) * 1.5; c.fillStyle = male ? '#8aa0b8' : '#cf9a33'; c.beginPath(); c.ellipse(x, y + bob, male ? 3 : 4, male ? 2 : 2.6, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(232,223,201,.35)'; c.beginPath(); c.ellipse(x - 1, y + bob - 3, 2.5, 1.2, -0.5, 0, TAU); c.ellipse(x + 1, y + bob - 3, 2.5, 1.2, 0.5, 0, TAU); c.fill(); }
      ink(c, 'the population: ' + pct(this.m) + ' male', 14, h * 0.5 + 40, 13, 'rgba(232,223,201,.7)', 'left', 'b', 'italic');
    } else {
      const cx = w / 2, cy = h * 0.33, R0 = Math.min(w, h) * 0.3; const g = c.createRadialGradient(cx, cy, 10, cx, cy, R0); g.addColorStop(0, '#d9b98a'); g.addColorStop(0.7, '#9b4f63'); g.addColorStop(1, '#5c2d3c'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(250,235,200,.5)'; for (let i = 0; i < 70; i++) { const a = r() * TAU, rr = R0 * (0.3 + r() * 0.6); c.beginPath(); c.ellipse(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 1.2, a, 0, TAU); c.fill(); }
      for (let i = 0; i < 10; i++) { const a = i / 10 * TAU + 0.3, x = cx + Math.cos(a) * R0 * 0.55, y = cy + Math.sin(a) * R0 * 0.55; c.fillStyle = i < 5 ? 'rgba(138,160,184,.55)' : 'rgba(207,154,51,.55)'; c.beginPath(); c.arc(x, y, 3.2, 0, TAU); c.fill(); }
      ink(c, 'the fig: the other mother’s brood is faded', cx, cy + R0 + 22, 13, 'rgba(232,223,201,.7)', 'center', 'b', 'italic');
    }
    const by = h * 0.8, sp = Math.min(30, (w - 40) / 10);
    ink(c, 'your brood', w / 2, by - 26, 13, 'rgba(232,223,201,.75)', 'center', 'b', 'italic');
    for (let i = 0; i < 10; i++) {
      const son = i < this.sons, x = w / 2 + (i - 4.5) * sp; let y = by;
      if (this.anim) { const k = clamp((this.anim.t - i * 0.05) / 0.8, 0, 1); y = by - (son ? 1 : 0.35) * k * (fig ? h * 0.3 : h * 0.35) * Math.sin(k * Math.PI / 2); }
      c.fillStyle = son ? '#8aa0b8' : '#cf9a33'; c.beginPath(); c.ellipse(x, y, 7, 10, 0, 0, TAU); c.fill(); ink(c, son ? '♂' : '♀', x, y + 5, 12, '#1a1a1a', 'center', 'b', 600);
    }
    if (this.anim && this.anim.t > 0.9) { const a = clamp((this.anim.t - 0.9) * 2, 0, 1); c.globalAlpha = a; ink(c, '+' + this.anim.v.toFixed(0) + ' grandchildren', w / 2, by + 38, 20, '#e8dfc9', 'center', 'd', 600); c.globalAlpha = 1; }
  },
  notes() {
    const fig = this.fig(), sonV = fig ? this.B * (10 - this.sons + 5) / (this.sons + 5) : this.B * (1 - this.m) / this.m;
    const rows = [['Season', Math.min(this.season, 10) + ' of 10', fig ? 'In the fig.' : 'Open population.'], fig ? ['Females in the fig', (10 - this.sons + 5) + '', 'Your daughters plus the other mother’s five.'] : ['Males in the population', pct(this.m), 'Other mothers are evolving too: when sons pay, more mothers make sons.'], ['A son is worth now', sonV.toFixed(1) + ' grandchildren', fig ? 'Females in the fig ÷ sons in the fig, times 4. Adding a son shares the same females among more brothers.' : '4 × females ÷ males.'], ['A daughter is worth', this.B + ' grandchildren', 'Always four.'], ['Your grandchildren', this.total.toFixed(0), ''], ['Best possible so far', this.best.toFixed(0), ''], ['Efficiency', this.best ? pct(this.total / this.best) : '—', 'Your total as a share of the best possible.']];
    return { idea: this.idea, stats: rows, charts: this.log.length ? [{ title: 'Males in the population and in your broods', leg: legP([['#4f6478', 'population'], ['#a8263f', 'your broods']]), draw: cv => this.chart(cv, 'paper') }] : [] };
  }
};
