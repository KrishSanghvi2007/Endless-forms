/* ================= Chapter: The Forager (central place, diet choice, marginal value) ================= */
const CH_FORAGER = {
  id: 'forager',
  theme: { cab: '#f2eed8', hud: '#e9e2c3', text: '#2f2a17', dim: 'rgba(47,42,23,.68)', line: 'rgba(47,42,23,.2)', acc: '#2e6e8e', hi: '#b5652b', meter: '#5c8a3a', inv: '#f7f3e3' },
  intro: {
    hook: 'Every meal costs time: time to find it, time to handle it, time to travel. Animals that spend time well raise more young. Three birds, three decisions.',
    how: 'Level 1: a starling carrying grubs to its chicks. Level 2: a great tit choosing between big and small worms on a conveyor. Level 3: a thrush deciding when to leave a berry bush. Tap food to take it; the buttons tell you when to move on.',
    goal: 'Each level earns a star if you gather food at 80% or more of the best possible rate.'
  },
  real: 'Alex Kacelnik (1984) trained wild starlings to collect mealworms from a feeder at different distances from their nests. The farther the feeder, the more worms they carried per trip, close to the optimum. John Krebs and colleagues (1977) gave great tits a conveyor belt of large and small mealworm pieces: when large ones were common the birds mostly ignored the small ones, however many small ones came by. (Mostly, not always: the tits still took some small pieces, a “partial preference” the simple model does not predict.) Eric Charnov’s marginal value theorem (1976) predicts when any forager should leave a depleting patch — when its current rate of gain falls to the average rate it can expect in the habitat as a whole.',
  maths: 'Levels 1 and 3 are the same theorem. With travel time T and a gain curve that slows as the patch (or the beak) fills, the best number to take, k, maximises k ÷ (T + time spent gathering k). Longer travel pushes the best k up. Level 2 is the optimal diet model: rank prey by profitability (energy ÷ handling time); add the next-best prey only if its profitability beats the rate you’d get by ignoring it, λE ÷ (1 + λh) for the better prey. The abundance of the worse prey never enters the rule.',
  ideas: [
    '<p>A starling gathering grubs for its chicks can only carry so many, and each extra grub is harder to find with a beakful already. So every trip is a trade: <b>keep searching</b> for one more, or <b>fly home</b> now.</p><p>Travel is dead time. When the nest is far, it pays to make each trip count.</p>',
    '<p>Worms pass on a belt. Eating one takes the same time whatever its size, and while you eat, others go by.</p><p>A big worm is worth three small ones. Taking a small worm is only worth it if you’re unlikely to miss a big one while you chew. Watch how often big ones come — not how many small ones there are.</p>',
    '<p>Berries get harder to find the longer you stay at a bush. Moving on costs travel time with nothing to eat.</p><p>Leave too early and you waste time travelling. Stay too long and you waste time picking over a stripped bush. The best moment to leave depends on how far away the next bush is.</p>'
  ],
  A: 0.4, BK: 0.6, RX: 0.35, BA: 0.32, BG: 1.38,
  start() {
    this.lv = 0; this.res = []; this.fx = []; this.beginLevel();
  },
  beginLevel() {
    this.round = 0; this.logs = [];
    if (this.lv === 0) this.rounds = [{ T: 1.5, dur: 40, name: 'Near patch' }, { T: 5, dur: 45, name: 'Far patch' }];
    else if (this.lv === 1) this.rounds = [{ lL: 0.12, lS: 0.8, dur: 22, name: 'Big worms scarce' }, { lL: 0.9, lS: 0.8, dur: 22, name: 'Big worms common' }];
    else this.rounds = [{ T: 1.5, dur: 36, name: 'Bushes close together' }, { T: 6, dur: 42, name: 'Bushes far apart' }, { T: 3, dur: 48, name: 'Rich and poor bushes', mixed: true }];
    const titles = ['Level 1: Feeding the chicks', 'Level 2: The conveyor', 'Level 3: Berry bushes'];
    const btn = this.lv === 0 ? 'Fly to the nest' : this.lv === 2 ? 'Move to the next bush' : '';
    HUD.set('<div class="hud-goal"><span><b>' + titles[this.lv] + '</b></span><b id="fg-time"></b></div><div class="hud-line" id="fg-st"></div>' + (btn ? '<div class="hud-row"><button class="btn primary" id="fg-go">' + btn + '</button></div>' : ''));
    if (btn) $('fg-go').onclick = () => this.leave();
    this.beginRound();
  },
  beginRound() {
    const Rd = this.rounds[this.round]; this.t = 0; this.state = 'intro'; this.st = 1.4; this.got = 0; this.trips = []; this.cycles = []; this.cyc0 = 0; this.load = 0; this.items = []; this.energy = 0; this.busy = 0; this.seq = [];
    this.nextIn = this.delay(0); this.fly = 0; this.away = 0; $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 5';
    if (this.lv === 1) { this.spawn = { L: -Math.log(R()) / Rd.lL, S: -Math.log(R()) / Rd.lS }; } if (this.lv === 2) this.newBush();
    this.upd();
  },
  delay(k) { return this.lv === 0 ? this.A * (1 + this.BK * k) : this.bq ? this.bq[0] * Math.pow(this.bq[1], k) : this.BA * Math.pow(this.BG, k); },
  newBush() { const Rd = this.rounds[this.round]; this.bq = Rd && Rd.mixed ? (R() < 0.5 ? [0.2, 1.22, 'rich'] : [0.55, 1.7, 'poor']) : null; this.nextIn = this.delay(0); },
  optRate(T) {
    const Rd = this.rounds[this.round]; if (Rd && Rd.mixed) { const cum = (a, g, k) => { let s = 0; for (let i = 0; i < k; i++) s += a * Math.pow(g, i) + this.RX; return s; }; let best = 0, bk = ''; for (let kr = 1; kr <= 20; kr++) for (let kp = 1; kp <= 12; kp++) { const r = (kr + kp) / 2 / (T + (cum(0.2, 1.22, kr) + cum(0.55, 1.7, kp)) / 2); if (r > best) { best = r; bk = kr + ' rich, ' + kp + ' poor'; } } return [best, bk]; } let best = 0, bk = 1, cum = 0; for (let k = 1; k <= (this.lv === 0 ? 10 : 20); k++) { cum += this.delay(k - 1) + this.RX; const r = k / ((this.lv === 0 ? 2 * T : T) + cum); if (r > best) { best = r; bk = k; } } return [best, bk]; },
  upd() {
    const Rd = this.rounds[this.round]; if (!Rd || !$('fg-time')) return; const left = Math.max(0, Rd.dur - this.t);
    $('fg-time').textContent = left.toFixed(0) + ' s'; const go = $('fg-go');
    if (this.lv === 0) { HUD.line('fg-st', Rd.name + ' (' + Rd.T + ' s each way). In the beak: <b>' + this.load + '</b> of 10. Delivered: <b>' + this.got + '</b>.'); if (go) go.disabled = this.state !== 'patch' || this.load === 0; }
    else if (this.lv === 1) HUD.line('fg-st', Rd.name + '. Energy eaten: <b>' + this.energy + '</b>. Big worm = 6, small = 2; each takes 1.2 s to eat.' + (this.busy > 0 ? ' <b>Chewing…</b>' : ''));
    else { HUD.line('fg-st', Rd.name + ' (' + Rd.T + ' s to travel). Berries this bush: <b>' + this.load + '</b>. Total: <b>' + this.got + '</b>.'); if (go) go.disabled = this.state !== 'patch'; }
  },
  leave() {
    if (this.state !== 'patch') return; Snd.click();
    if (this.lv === 0) { if (!this.load) return; this.state = 'fly'; this.fly = 0; }
    else { this.trips.push(this.load); this.state = 'fly'; this.fly = 0; }
    this.items = []; this.upd();
  },
  tap(x, y) {
    if (this.state !== 'patch') return;
    if (this.lv === 1) { if (this.busy > 0) { this.fx.push({ k: 'txt', x, y: y - 10, s: 'still chewing', t: 0, d: 0.7 }); return; } }
    let best = null, bd = 30 * 30; for (const it of this.items) { if (it.gone) continue; const dx = it.x - x, dy = it.y - y, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = it; } }
    if (!best) return; best.gone = true; Snd.peck();
    if (this.lv === 0) { this.load++; this.nextIn = this.load >= 10 ? 1e9 : this.delay(this.load); if (this.load >= 10) toast('Beak full. Fly home.'); }
    else if (this.lv === 1) { this.energy += best.big ? 6 : 2; this.busy = 1.2; this.seq.push({ t: this.t, big: best.big, took: true }); best.took = true; }
    else { this.load++; this.got++; this.nextIn = this.delay(this.load); }
    this.upd();
  },
  update(dt) {
    for (const f of this.fx) f.t += dt; this.fx = this.fx.filter(f => f.t < f.d);
    if (this.state === 'intro') { this.st -= dt; if (this.st <= 0) this.state = 'patch'; return; }
    if (this.state === 'done') return;
    const Rd = this.rounds[this.round]; if (!Rd) return; this.t += dt;
    if (this.lv === 1) {
      this.busy = Math.max(0, this.busy - dt);
      for (const k of ['L', 'S']) { this.spawn[k] -= dt; if (this.spawn[k] <= 0) { this.spawn[k] = -Math.log(R()) / (k === 'L' ? Rd.lL : Rd.lS); this.items.push({ big: k === 'L', p: 0, x: -30, y: 0, born: this.t }); this.seq.push({ t: this.t, big: k === 'L', arrive: true }); } }
      for (const it of this.items) { it.p += dt / 3.2; it.x = lerp(-30, Stage.w + 30, it.p); it.y = Stage.h * 0.62; } this.items = this.items.filter(it => it.p < 1.05 && !it.gone);
    } else if (this.state === 'patch') {
      if (!this.items.some(i => !i.gone) && this.nextIn < 1e8) { this.nextIn -= dt; if (this.nextIn <= 0) { this.items.push(this.lv === 0 ? { x: Stage.w * (0.6 + R() * 0.32), y: Stage.h * (0.55 + R() * 0.3), t: 0 } : this.berrySpot()); this.nextIn = 1e8; } }
      for (const it of this.items) it.t = (it.t || 0) + dt;
    } else if (this.state === 'fly') {
      this.fly += dt; const T = Rd.T;
      if (this.lv === 0 && this.fly >= T && !this.deliv) { this.deliv = true; this.got += this.load; this.trips.push(this.load); this.load = 0; Snd.dawn(); }
      if (this.fly >= (this.lv === 0 ? 2 * T : T)) { this.cycles.push({ n: last(this.trips), d: this.t - this.cyc0, q: this.bq ? this.bq[2] : null }); this.cyc0 = this.t; this.state = 'patch'; this.deliv = false; this.load = 0; this.nextIn = this.delay(0); if (this.lv === 2) { this.bush = (this.bush || 0) + 1; this.newBush(); } }
    }
    if (this.t >= Rd.dur) this.endRound();
    this.upd();
  },
  berrySpot() { const a = R() * TAU, r = Math.sqrt(R()) * 0.8; return { x: Stage.w * 0.5 + Math.cos(a) * r * Stage.w * 0.28, y: Stage.h * 0.46 + Math.sin(a) * r * Stage.h * 0.24, t: 0 }; },
  dietBest() {
    // replay the arrival sequence under the two classic rules; each item is catchable from arrival for 3.2 s
    const arr = this.seq.filter(s => s.arrive), sim = gen => { let free = 0, e = 0; for (const a of arr) { if (!gen && !a.big) continue; const t = Math.max(a.t, free); if (t <= a.t + 3.0 && t < this.rounds[this.round].dur) { e += a.big ? 6 : 2; free = t + 1.2; } } return e; };
    return Math.max(sim(true), sim(false));
  },
  endRound() {
    if (this.state === 'done') return; const Rd = this.rounds[this.round]; let eff, rec;
    if (this.lv === 1) { const best = this.dietBest(); eff = best ? this.energy / best : 1; rec = { name: Rd.name, energy: this.energy, best, eff, small: this.seq.filter(s => s.took && !s.big).length, big: this.seq.filter(s => s.took && s.big).length }; }
    else { const [opt, bk] = this.optRate(Rd.T), cn = this.cycles.reduce((a, c) => a + c.n, 0), cd = this.cycles.reduce((a, c) => a + c.d, 0), rate = cd > 0 ? cn / cd : this.got / Rd.dur; eff = rate / opt; rec = { name: Rd.name, T: Rd.T, rate, opt, bk, eff, loads: this.trips.slice(), mean: this.trips.length ? mean(this.trips) : 0 }; }
    this.logs.push(rec); this.state = 'done'; this.items = [];
    toast(Rd.name + ': <b>' + pct(Math.min(1, eff)) + '</b> of the best possible rate.');
    setTimeout(() => { if (App.mode !== this) return; this.round++; if (this.round < this.rounds.length) this.beginRound(); else this.endLevel(); }, 1600);
  },
  endLevel() {
    const eff = mean(this.logs.map(l => Math.min(1, l.eff))); this.res.push({ lv: this.lv, eff, logs: this.logs.slice(), pass: eff >= 0.8 });
    if (eff >= 0.8) Snd.star();
    this.lv++; if (this.lv < 5) { Cards.open({ cls: 'intro', html: '<h3>' + (eff >= 0.8 ? 'Level passed' : 'Interesting result') + '</h3><p>' + this.levelNote(last(this.res)) + '</p>' + (this.lv === 3 ? '<h4>Level 4: Danger</h4><p>Your chicks need a set number of grubs this round. The open meadow is rich but a hawk hunts over it; the hedge is safe but poor. Keeping your head up spots the hawk sooner but slows your feeding. Tap a patch to move there; tap Dive the moment the hawk stoops.</p>' : this.lv === 4 ? '<h4>Level 5: The long night</h4><p>You are a junco at dusk. You must finish the day with enough reserves to survive the night. Two feeders give the same food on average: one always gives 2 seeds, the other gives 0 or 4 at random. Your reserves and the night’s needs change each evening.</p>' : '') + '', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] }); }
    else this.end();
  },
  levelNote(r) {
    if (r.lv === 0) { const [a, b] = r.logs; return 'You carried ' + a.mean.toFixed(1) + ' grubs per trip from the near patch and ' + b.mean.toFixed(1) + ' from the far one. The best loads were ' + a.bk + ' and ' + b.bk + '. Overall you managed ' + pct(Math.min(1, r.eff)) + ' of the best rate.'; }
    if (r.lv === 1) { const [a, b] = r.logs; return 'When big worms were scarce you took ' + a.small + ' small worms; when they were common, ' + b.small + '. The best rule takes small worms only when big ones are scarce, even though small ones arrived just as often both times. Overall ' + pct(Math.min(1, r.eff)) + ' of the best.'; }
    const [a, b, cc] = r.logs; return 'You picked ' + a.mean.toFixed(1) + ' berries per bush when bushes were close, and ' + b.mean.toFixed(1) + ' when they were far apart; the best were ' + a.bk + ' and ' + b.bk + '. With rich and poor bushes mixed, the best was ' + cc.bk + ': leave every bush when it drops to the same rate, which means staying longer where the picking is good. Overall ' + pct(Math.min(1, r.eff)) + ' of the best rate.';
  },
  end() {
    const stars = this.res.filter(r => r.pass).length, [l1, , l3] = this.res;
    const insight = 'Every level asked the same question in a different form: what is my time worth? The starling should carry more per trip when the nest is far (you carried ' + l1.logs[0].mean.toFixed(1) + ' near and ' + l1.logs[1].mean.toFixed(1) + ' far). The great tit should ignore small worms only when big ones are common, whatever the number of small ones. The thrush should leave a bush when its current rate drops to the average it can expect elsewhere — later when bushes are far apart. Selection shapes these decisions because animals that spend time well raise more young.';
    End.show(this, { stars, title: stars + ' of 3 levels at 80% or better', insight, leg: legP([['#2e6e8e', 'your average per trip or bush'], ['#b5652b', 'the best']]), chart: cv => barChart(cv, { groups: [l1.logs[0], l1.logs[1], l3.logs[0], l3.logs[1]].map((l, i) => ({ label: ['grubs near', 'grubs far', 'berries close', 'berries far'][i], parts: [{ v: l.mean, c: '#2e6e8e' }] })).concat([]) }), cap: 'Loads per trip (level 1) and berries per bush (level 3). Best: ' + [l1.logs[0].bk, l1.logs[1].bk, l3.logs[0].bk, l3.logs[1].bk].join(', ') + '.' });
  },
  draw(c, w, h) {
    const Rd = this.rounds[this.round]; if (!Rd || this.lv > 2) { this.sky(c, w, h); return; }
    if (this.lv === 0) this.drawStarling(c, w, h, Rd); else if (this.lv === 1) this.drawBelt(c, w, h, Rd); else this.drawBush(c, w, h, Rd);
    for (const f of this.fx) { c.globalAlpha = 1 - f.t / f.d; ink(c, f.s, f.x, f.y - f.t * 20, 13, '#2f2a17', 'center', 'b', 'italic'); c.globalAlpha = 1; }
    if (this.state === 'intro') { c.fillStyle = 'rgba(242,238,216,.8)'; c.fillRect(0, 0, w, h); ink(c, Rd.name, w / 2, h / 2, 24, '#2f2a17', 'center', 'd', 600); }
  },
  sky(c, w, h) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#cfe4ef'); g.addColorStop(0.5, '#e8f0dc'); g.addColorStop(0.52, '#9fbf6a'); g.addColorStop(1, '#7ea254'); c.fillStyle = g; c.fillRect(0, 0, w, h); },
  bird(c, x, y, s, col, flap) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 11, 6.5, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(9, -4, 4.5, 0, TAU); c.fill(); c.fillStyle = '#e1a93a'; c.beginPath(); c.moveTo(13, -4); c.lineTo(19, -3); c.lineTo(13, -2); c.fill(); c.fillStyle = col; c.beginPath(); c.moveTo(-3, -2); c.lineTo(-10, -2 - 10 * flap); c.lineTo(4, -3); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(10.5, -5, 1.1, 0, TAU); c.fill(); c.restore(); },
  drawStarling(c, w, h, Rd) {
    this.sky(c, w, h); const nx = w * 0.12, ny = h * 0.46, px = w * 0.76;
    c.fillStyle = '#6b4a2a'; c.fillRect(nx - 5, ny - 10, 10, h * 0.6); c.fillStyle = '#4f6d2d'; c.beginPath(); c.arc(nx, ny - 40, 34, 0, TAU); c.fill();
    c.fillStyle = '#8a6a3a'; c.beginPath(); c.ellipse(nx, ny - 8, 18, 8, 0, 0, TAU); c.fill();
    for (let i = 0; i < 4; i++) { const op = 0.5 + 0.5 * Math.sin(App.t * 9 + i); c.fillStyle = '#e3b34a'; c.beginPath(); c.moveTo(nx - 10 + i * 7, ny - 12); c.lineTo(nx - 7 + i * 7, ny - 20 - op * 5); c.lineTo(nx - 4 + i * 7, ny - 12); c.fill(); }
    ink(c, 'nest: ' + this.got + ' delivered', nx, ny + 22, 12, '#2f2a17', 'center', 'b', 'italic');
    const dist = Rd.T / 5; c.strokeStyle = 'rgba(47,42,23,.3)'; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(nx + 30, ny - 30); c.lineTo(px - 20, ny - 30); c.stroke(); c.setLineDash([]);
    ink(c, Rd.T + ' s each way', (nx + px) / 2, ny - 38, 12, 'rgba(47,42,23,.7)', 'center', 'b', 'italic');
    c.fillStyle = 'rgba(90,70,40,.25)'; c.beginPath(); c.ellipse(w * 0.76, h * 0.7, w * 0.2, h * 0.17, 0, 0, TAU); c.fill();
    for (const it of this.items) { if (it.gone) continue; const k = Math.min(1, it.t * 4); c.fillStyle = '#efe0c0'; c.strokeStyle = '#8a6d45'; c.lineWidth = 1; c.save(); c.translate(it.x, it.y); c.rotate(Math.sin(App.t * 6 + it.x) * 0.4); c.beginPath(); c.ellipse(0, 0, 9 * k, 4 * k, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
    let bx = px - 30, by = h * 0.58, flap = 0.5 + 0.5 * Math.sin(App.t * 18);
    if (this.state === 'fly') { const T = Rd.T, f = this.fly < T ? this.fly / T : 1 - (this.fly - T) / T; bx = lerp(px - 30, nx + 20, f); by = lerp(h * 0.58, ny - 25, f) - Math.sin(f * Math.PI) * 30; }
    else flap = 0;
    this.bird(c, bx, by, 1.4, '#2d2d3a', flap); for (let i = 0; i < this.load; i++) { c.fillStyle = '#efe0c0'; c.beginPath(); c.ellipse(bx + 26 + (i % 4) * 3, by - 5 + ((i / 4) | 0) * 3, 3, 1.5, 0.3, 0, TAU); c.fill(); }
  },
  drawBelt(c, w, h, Rd) {
    this.sky(c, w, h); const by = h * 0.62; c.fillStyle = '#5b5145'; c.fillRect(0, by - 16, w, 32); c.fillStyle = '#6f6456'; for (let x = -((App.t * 60) % 30); x < w; x += 30) c.fillRect(x, by - 16, 14, 32);
    for (const it of this.items) { if (it.gone) continue; c.fillStyle = '#e8c98a'; c.strokeStyle = '#8a6d45'; c.lineWidth = 1; const L = it.big ? 20 : 8; c.beginPath(); c.ellipse(it.x, it.y, L, it.big ? 5 : 3.5, 0, 0, TAU); c.fill(); c.stroke(); }
    const s = 1.8; this.bird(c, w * 0.5, by - 60, s, '#3b5b8a', 0); c.fillStyle = '#f1e6c8'; c.beginPath(); c.ellipse(w * 0.5 - 4, by - 55, 8, 5, 0, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(w * 0.5 + 16, by - 69, 3, 0, TAU); c.fill();
    if (this.busy > 0) { c.strokeStyle = '#b5652b'; c.lineWidth = 3; c.beginPath(); c.arc(w * 0.5, by - 100, 12, -Math.PI / 2, -Math.PI / 2 + TAU * this.busy / 1.2); c.stroke(); ink(c, 'chewing', w * 0.5, by - 118, 12, '#2f2a17', 'center', 'b', 'italic'); }
    ink(c, 'tap a worm as it passes', w / 2, h - 16, 12, 'rgba(47,42,23,.6)', 'center', 'b', 'italic');
  },
  drawBush(c, w, h, Rd) {
    this.sky(c, w, h); const cx = w * 0.5, cy = h * 0.46;
    if (this.state === 'fly') { const k = this.fly / Rd.T; c.save(); c.translate(-k * w, 0); }
    const rich = this.bq && this.bq[2] === 'rich', poor = this.bq && this.bq[2] === 'poor', bs = poor ? 0.75 : 1; c.fillStyle = poor ? '#6b7a45' : '#3f6a2c'; c.beginPath(); c.ellipse(cx, cy, w * 0.32 * bs, h * 0.27 * bs, 0, 0, TAU); c.fill(); if (this.bq) ink(c, rich ? 'a rich bush' : 'a poor bush', cx, cy - h * 0.29, 13, '#2f2a17', 'center', 'b', 600); c.fillStyle = poor ? '#7a8a50' : '#4d7b35'; for (let i = 0; i < 26; i++) { const a = i * 2.4, r = (i % 5) / 5; c.beginPath(); c.ellipse(cx + Math.cos(a) * r * w * 0.26, cy + Math.sin(a) * r * h * 0.22, 14, 9, a, 0, TAU); c.fill(); }
    for (const it of this.items) { if (it.gone) continue; const k = Math.min(1, it.t * 5); c.fillStyle = '#f4e6c8'; c.beginPath(); c.arc(it.x, it.y, 8.5 * k, 0, TAU); c.fill(); c.fillStyle = '#d0304f'; c.beginPath(); c.arc(it.x, it.y, 6.5 * k, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(it.x - 2, it.y - 2, 1.6 * k, 0, TAU); c.fill(); }
    if (this.state === 'fly') { c.restore(); c.save(); c.translate((1 - this.fly / Rd.T) * w, 0); c.fillStyle = '#3f6a2c'; c.beginPath(); c.ellipse(cx, cy, w * 0.32, h * 0.27, 0, 0, TAU); c.fill(); c.restore(); }
    this.bird(c, w * 0.18, h * 0.78, 1.5, '#7a5a3a', this.state === 'fly' ? 0.5 + 0.5 * Math.sin(App.t * 18) : 0);
    ink(c, 'next bush: ' + Rd.T + ' s away', w - 12, h - 14, 12, 'rgba(47,42,23,.65)', 'right', 'b', 'italic');
  },
  notes() {
    const Rd = this.rounds[this.round], rows = [['Level', (this.lv + 1) + ' of 5: ' + ['central-place foraging', 'diet choice', 'patch leaving'][Math.min(2, this.lv)], '']];
    if (this.lv !== 1 && Rd) { const [opt, bk] = this.optRate(Rd.T), el = Math.max(1, this.t); rows.push(['Your rate so far', (this.cycles.length ? this.cycles.reduce((a, c) => a + c.n, 0) / this.cycles.reduce((a, c) => a + c.d, 0) : this.got / el).toFixed(2) + ' per s', 'Measured over completed round trips.'], ['Best possible rate here', opt.toFixed(2) + ' per s', 'Reached by taking ' + bk + ' per ' + (this.lv === 0 ? 'trip' : 'bush') + ', allowing about a third of a second to react to each item.'], ['Next item appears after', this.delay(this.load).toFixed(2) + ' s', 'Rises with each item taken: the diminishing returns that make leaving worthwhile.']); if (this.trips.length) rows.push([this.lv === 0 ? 'Your loads so far' : 'Berries per bush so far', this.trips.join(', '), '']); }
    if (this.lv === 1 && Rd) { const thr = Rd.lL * 6 / (1 + Rd.lL * 1.2); rows.push(['Big worm profitability', '5.0 per s', '6 energy ÷ 1.2 s.'], ['Small worm profitability', '1.7 per s', '2 energy ÷ 1.2 s.'], ['Rate from big worms alone', thr.toFixed(2) + ' per s', 'λE ÷ (1 + λh), with big worms arriving ' + Rd.lL + ' per second. Take small worms only if 1.7 beats this.']); }
    this.res.forEach(r => rows.push(['Level ' + (r.lv + 1) + ' result', pct(Math.min(1, r.eff)), r.pass ? 'Star earned.' : 'Below 80%.']));
    return { idea: this.ideas[Math.min(2, this.lv)], stats: rows, charts: [] };
  }
};

/* ================= Chapter: Two Sizes (evolution of anisogamy) ================= */
const CH_GAMETES = {
  id: 'gametes', N: 300, M: 10, NB: 36, XLO: Math.log2(0.02), XHI: Math.log2(2.5),
  theme: { cab: '#07233a', hud: '#0b304f', text: '#e0f0fa', dim: 'rgba(224,240,250,.66)', line: 'rgba(224,240,250,.16)', acc: '#e0913a', hi: '#f5c46a', meter: '#5fc0d8', inv: '#07233a' },
  intro: {
    hook: 'Long ago, sea creatures released sex cells that were all the same size. Your lineage has the same budget as everyone else, and one thing to decide: split it into many small sex cells, or a few large ones. Any two cells can fuse, and the zygote survives only if together they carry enough food.',
    how: 'Drag the slider to set your cells’ size, then spawn. You see how many zygotes your lineage made and how many survived. The rest of the sea evolves too.',
    goal: 'Grow your lineage from 2% of the population to 20% within twelve spawnings. Three stars at 40%.'
  },
  real: 'Geoff Parker, Robin Baker and Vic Smith (1972) showed how two sexes can arise from a population whose sex cells are all alike. If zygote survival rises steeply with its total provisioning, selection is disruptive: tiny cells win on numbers, large cells win on provisioning, and middling cells lose on both. The population splits into microgametes and macrogametes: sperm and eggs, males and females. Green algae in the Volvox family show every step, from same-sized gametes in Gonium and Pandorina to eggs and sperm in Volvox, and larger colonies tend to be more anisogamous. This is not the only route: when sex cells struggle to find each other at all, the same split can be favoured (Lehtonen and Kokko 2011).',
  maths: 'Each individual has a fixed budget M split into M ÷ m cells of size m. A cell fuses with a random partner from the pool, and the zygote survives with probability f(m + m′), which rises steeply with total size. Fitness is (M ÷ m) × average f(m + m′). A very small m multiplies the number of tickets; a large m guarantees survival whatever the partner. The middle is the worst of both, so selection pushes sizes to the extremes, and once big cells exist, small ones profit from them: a small cell that happens to fuse with a big one makes a zygote that survives, and small cells are so numerous that many do. (Fusion here is random: no cell chooses its partner.)',
  idea: '<p>Everyone has the same budget. <b>Small cells</b> mean many lottery tickets, but a zygote made from two small cells starves. <b>Large cells</b> mean few tickets, but each one carries enough food to survive almost whatever it fuses with.</p><p>What pays depends on what everyone else is doing. If the sea is full of small cells, a lineage that provisions the zygote does well. If it’s full of big ones, a tiny cell can ride on someone else’s food.</p>',
  surv(S) { const q = S * S; return q * q / (q * q + 1); },
  start() {
    this.pop = []; for (let i = 0; i < this.N; i++) this.pop.push(clamp(Math.log2(0.5) + 0.18 * gauss(), this.XLO, this.XHI));
    this.share = 0.02; this.x = Math.log2(0.5); this.gen = 0; this.log = []; this.hist = [this.histo()]; this.anim = 0; this.last = null; this.after = null;
    this.parts = []; for (let i = 0; i < 90; i++) this.parts.push({ x: R(), y: R(), v: R() * TAU, k: R() });
    HUD.set(HUD.meterHTML('Your lineage’s share of the sea') + '<div class="slider-row"><span>small</span><input type="range" id="gm-x" min="0" max="100" step="1" aria-label="Your sex-cell size"><span>large</span></div><div class="hud-line" id="gm-st"></div><div class="hud-row"><button class="btn primary" id="gm-go">Spawn</button></div>');
    const sl = $('gm-x'); sl.value = Math.round((this.x - this.XLO) / (this.XHI - this.XLO) * 100);
    sl.oninput = () => { this.x = this.XLO + sl.value / 100 * (this.XHI - this.XLO); this.upd(); };
    $('gm-go').onclick = () => this.spawn(); this.upd();
  },
  sz(x) { return Math.pow(2, x); },
  bin(x) { return clamp(Math.floor((x - this.XLO) / (this.XHI - this.XLO) * this.NB), 0, this.NB - 1); },
  histo() { const hb = new Array(this.NB).fill(0); for (const x of this.pop) hb[this.bin(x)]++; return hb; },
  pool() { // gamete-weighted distribution over bins, including the player's lineage
    const w = new Array(this.NB).fill(0), sizes = []; for (let b = 0; b < this.NB; b++) sizes.push(this.sz(this.XLO + (b + 0.5) / this.NB * (this.XHI - this.XLO)));
    const nPop = this.N * (1 - this.share); for (const x of this.pop) w[this.bin(x)] += (this.M / this.sz(x)) * (1 - this.share);
    w[this.bin(this.x)] += (this.M / this.sz(this.x)) * this.share * this.N;
    const tot = w.reduce((a, b) => a + b, 0); return { p: w.map(v => v / tot), sizes };
  },
  fit(x, P) { const m = this.sz(x); let e = 0; for (let b = 0; b < this.NB; b++) if (P.p[b]) e += P.p[b] * this.surv(m + P.sizes[b]); return { n: this.M / m, e, w: this.M / m * e }; },
  step(withPlayer) {
    const P = this.pool(), ws = this.pop.map(x => this.fit(x, P).w), me = this.fit(this.x, P), popMean = mean(ws);
    const wbar = popMean * (1 - this.share) + me.w * this.share;
    const newShare = withPlayer ? clamp(this.share * me.w / wbar, 0, 0.98) : this.share;
    const kids = []; let tot = 0; const cum = ws.map(v => tot += v);
    for (let i = 0; i < this.N; i++) { const r = R() * tot; let lo = 0, hi = cum.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < r) lo = mid + 1; else hi = mid; } let x = this.pop[lo]; x += R() < 0.06 ? 0.9 * gauss() : 0.12 * gauss(); kids.push(clamp(x, this.XLO, this.XHI)); }
    this.pop = kids; return { me, popMean, wbar, newShare };
  },
  spawn() {
    if (this.anim > 0 || this.gen >= 12) return; const r = this.step(true), s0 = this.share; this.share = r.newShare; this.gen++;
    this.last = { gen: this.gen, x: this.x, n: r.me.n, e: r.me.e, w: r.me.w, popMean: r.popMean, s0, s1: this.share };
    this.log.push(this.last); this.hist.push(this.histo()); this.anim = 1.3; Snd.flood(); this.upd();
    if (this.gen >= 12) setTimeout(() => { if (App.mode === this) this.finale(); }, 1500);
  },
  finale() { this.after = { t: 0, g: 0 }; HUD.line('gm-st', 'Twelve spawnings done. Now watch the sea evolve on its own for 80 generations…'); $('gm-go').disabled = true; },
  upd() {
    HUD.meter(clamp(this.share / 0.4, 0, 1), 0.5, pct(this.share) + ' (goal 20%)'); const m = this.sz(this.x);
    let s = 'Your cells: size <b>' + m.toFixed(2) + '</b>, so <b>' + Math.round(this.M / m) + '</b> of them from your budget. Spawning ' + Math.min(this.gen + 1, 12) + ' of 12.';
    if (this.last) s += '<br>Last spawning: <b>' + pct(this.last.e) + '</b> of your zygotes survived; per head you left ' + (this.last.w / this.last.popMean).toFixed(2) + ' × the sea’s average.';
    HUD.line('gm-st', s); $('gm-go').disabled = this.anim > 0 || this.gen >= 12; $('bar-gen').textContent = 'spawning ' + this.gen + ' of 12';
  },
  update(dt) {
    if (this.anim > 0) { this.anim -= dt; if (this.anim <= 0) this.upd(); }
    for (const p of this.parts) { p.v += (R() - .5) * dt * 2; p.x = (p.x + Math.cos(p.v) * dt * 0.02 + 1) % 1; p.y = (p.y + Math.sin(p.v) * dt * 0.02 + 1) % 1; }
    if (this.after) { this.after.t += dt; while (this.after.t > 0.08 && this.after.g < 80) { this.after.t -= 0.08; this.step(false); this.after.g++; if (this.after.g % 4 === 0) this.hist.push(this.histo()); } if (this.after.g >= 80 && !this.after.done) { this.after.done = true; setTimeout(() => { if (App.mode === this) this.end(); }, 900); } }
  },
  end() {
    const s = this.share, stars = s >= 0.4 ? 3 : s >= 0.3 ? 2 : s >= 0.2 ? 1 : 0, hb = last(this.hist);
    const lo = hb.slice(0, this.NB / 2).reduce((a, b) => a + b, 0), hi = hb.slice(this.NB / 2).reduce((a, b) => a + b, 0), mids = this.log.map(l => this.sz(l.x));
    const insight = 'Your lineage ended at ' + pct(s) + ' of the sea. Your sizes ran ' + mids.map(v => v.toFixed(2)).join(', ') + '. Middle-sized cells were never the answer: they are too few to win on numbers and too small to provision a zygote alone. Left to itself, the sea ' + (lo > 20 && hi > 20 ? 'split into two camps — many tiny cells and a group of large ones. Those are sperm and eggs: the origin of males and females.' : 'moved toward the extremes; given more time it splits into many tiny cells and a group of large ones — sperm and eggs.');
    End.show(this, { stars, title: pct(s) + ' of the sea', insight, chart: cv => this.histChart(cv, 'paper', hb), cap: 'Sex-cell sizes across the population after 80 more generations without you (log scale).' });
  },
  histChart(cv, th, hb) { histChart(cv, { theme: th, lo: 0, hi: 1, bins: this.NB, layers: [{ v: hb.flatMap((n, b) => new Array(n).fill((b + 0.5) / this.NB)), c: th === 'paper' ? '#2f6f8f' : '#5fc0d8' }], l0: 'tiny', l1: 'large' }); },
  draw(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0d4a6b'); g.addColorStop(1, '#062236'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(180,230,255,.05)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(w * (i / 6) + Math.sin(App.t * .3 + i) * 20, 0); c.lineTo(w * (i / 6 + 0.08), 0); c.lineTo(w * (i / 6 + 0.02), h * 0.7); c.fill(); }
    const hb = last(this.hist), P = this.pool(), H0 = h * 0.62;
    for (const p of this.parts) { const b = Math.min(this.NB - 1, Math.floor(p.k * this.NB)); if (P.p[b] < 0.004 && p.k < 0.95) continue; const mine = p.k > 0.95; const x = mine ? this.x : this.XLO + (b + 0.5) / this.NB * (this.XHI - this.XLO), r = 1 + 5 * Math.sqrt(this.sz(x) / 2.5); c.fillStyle = mine ? '#f5c46a' : 'rgba(200,235,255,.55)'; c.beginPath(); c.arc(p.x * w, p.y * H0, r, 0, TAU); c.fill(); }
    if (this.anim > 0) { c.fillStyle = 'rgba(245,196,106,' + (0.25 * this.anim) + ')'; c.fillRect(0, 0, w, H0); }
    const y0 = H0 + 10, hh = h - y0 - 26, mx = Math.max(10, ...hb), bw = (w - 30) / this.NB;
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, y0 - 6, w, h - y0 + 6);
    for (let b = 0; b < this.NB; b++) { const v = hb[b] / mx * hh; c.fillStyle = 'rgba(95,192,216,.8)'; c.fillRect(15 + b * bw + 1, y0 + hh - v, bw - 2, v); }
    const xm = 15 + (this.x - this.XLO) / (this.XHI - this.XLO) * (w - 30); c.strokeStyle = '#f5c46a'; c.lineWidth = 2; c.beginPath(); c.moveTo(xm, y0 - 4); c.lineTo(xm, y0 + hh); c.stroke(); ink(c, 'you', xm, y0 - 8, 12, '#f5c46a', 'center', 'b', 600);
    ink(c, 'tiny cells', 15, h - 8, 11, 'rgba(224,240,250,.6)', 'left', 'b', 'italic'); ink(c, 'the sea’s sex-cell sizes', w / 2, h - 8, 11, 'rgba(224,240,250,.6)', 'center', 'b', 'italic'); ink(c, 'large cells', w - 15, h - 8, 11, 'rgba(224,240,250,.6)', 'right', 'b', 'italic');
    if (this.after) ink(c, 'generation ' + this.after.g + ' without you', w / 2, 24, 15, '#e0f0fa', 'center', 'd', 600);
  },
  notes() {
    const P = this.pool(), me = this.fit(this.x, P), ws = this.pop.map(x => this.fit(x, P).w), mw = mean(ws);
    const probe = [0.05, 0.3, 0.6, 1.2, 2.0].map(m => { const f = this.fit(Math.log2(m), P); return [m, f.w / mw]; });
    const rows = [['Your cell size', this.sz(this.x).toFixed(2), 'The budget is 10 per individual, so size 0.5 gives 20 cells.'], ['Your cells', Math.round(me.n) + '', ''], ['Survival of your zygotes against today’s sea', pct(me.e), 'Depends on who your cells are likely to fuse with.'], ['Your success per head vs average', (me.w / mw).toFixed(2) + ' ×', 'Above 1, your lineage grows.']];
    probe.forEach(([m, r]) => rows.push(['If you chose size ' + m, r.toFixed(2) + ' × average', '']));
    return { idea: this.idea, stats: rows, charts: [{ title: 'The sea’s sex-cell sizes now', draw: cv => this.histChart(cv, 'paper', last(this.hist)) }, { title: 'Your lineage’s share', draw: (cv, th) => lineChart(cv, { theme: th, series: [{ d: [0.02].concat(this.log.map(l => l.s1)), c: '#b5652b' }], y0: 0, y1: Math.max(0.5, this.share), refs: [{ v: 0.2, label: 'goal' }], fy: v => pct(v), x0l: 'start', xl: 'spawning ' + this.log.length }) }] };
  }
};

/* ================= Chapter: The Raffle (sperm competition) ================= */
const CH_RAFFLE = {
  id: 'raffle', B: 100, EGGS: 20, RIV: [0, 2, 1, 5, 0, 3], RS: 20,
  theme: { cab: '#e9f0f2', hud: '#dce7eb', text: '#1d2d36', dim: 'rgba(29,45,54,.68)', line: 'rgba(29,45,54,.2)', acc: '#c2453d', hi: '#8a5d10', meter: '#3b7fa0', inv: '#f4f8fa' },
  intro: {
    hook: 'You are a male with a limited supply of sperm for the whole season: 100 units across six matings. Each female may already carry sperm from rival males, and her eggs are fertilised like a raffle: every sperm is a ticket.',
    how: 'Before each mating you learn how many rivals got there first. Set your ejaculate with − and +, then mate and watch the race. You score fertilised eggs.',
    goal: 'Fertilise at least 94% as many eggs as the best possible plan. Three stars at 99%.'
  },
  real: 'Geoff Parker’s studies of dung flies in the 1970s founded the study of sperm competition, and his raffle models predict how males should spend a limited supply. (Dung flies themselves are not a fair raffle: the last male to mate fertilises about 80% of the eggs. The raffle is the simplest case.) Many males adjust as the models predict: Drosophila males that have recently encountered rivals mate for longer and win a larger share of paternity (Bretman, Fricke and Chapman 2009) and transfer more seminal fluid proteins (Wigby et al. 2009), and male fowl allocate more sperm to more fecund females and less to females they have already mated with (Pizzari et al. 2003).',
  maths: 'In a fair raffle your share of the eggs is s ÷ (s + R), where s is your ejaculate and R the rivals’ sperm already present. Your gain from one more unit is R ÷ (s + R)². With no rivals, R = 0 and any sperm at all wins every egg, so spend the minimum. (That holds only because, in this game, no male mates after you. If a virgin may mate again later, even she is worth some sperm: Parker’s “risk” models.) With some rivals, extra sperm buys a lot. With many rivals, each extra unit buys only a small slice of a crowded raffle. The best plan equalises the gain from the last unit spent across all females: s = √(R ÷ λ) − R.',
  idea: '<p>Each female’s eggs go to sperm in proportion to numbers: a raffle. Your share is <b>your sperm ÷ all sperm</b>.</p><p>You have a fixed supply, so every unit spent on one female is a unit you can’t spend on another. Ask where one more unit buys the most eggs.</p><p>A virgin female is a raffle with only your tickets in it. (In this game, no male mates with her after you.)</p>',
  start() {
    this.i = 0; this.left = this.B; this.s = 15; this.log = []; this.anim = null; this.rv = this.RIV.map(n => n * this.RS);
    HUD.set('<div class="hud-goal"><span id="rf-who"></span><b id="rf-left"></b></div><div class="hud-line" id="rf-st"></div><div class="hud-row"><div class="stepper"><button id="rf-m" aria-label="Less">−</button><span id="rf-s" style="min-width:92px;text-align:center;font-size:15px"></span><button id="rf-p" aria-label="More">+</button></div><button class="btn primary" id="rf-go">Mate</button></div>');
    $('rf-m').onclick = () => { this.s = Math.max(1, this.s - (this.s > 5 ? 5 : 1)); Snd.click(); this.upd(); };
    $('rf-p').onclick = () => { this.s = Math.min(this.maxS(), this.s + (this.s >= 5 ? 5 : 1)); Snd.click(); this.upd(); };
    $('rf-go').onclick = () => this.mate(); this.upd();
  },
  maxS() { return Math.max(1, this.left - (this.RIV.length - this.i - 1)); },
  upd() {
    const n = this.RIV[this.i]; this.s = clamp(this.s, 1, this.maxS());
    $('rf-who').innerHTML = 'Female ' + Math.min(this.i + 1, 6) + ' of 6: <b>' + (n === 0 ? 'a virgin' : n + ' rival' + (n > 1 ? 's' : '') + ' before you') + '</b>';
    $('rf-left').textContent = this.left + ' units left'; $('rf-s').innerHTML = '<b>' + this.s + '</b> units';
    $('rf-go').disabled = !!this.anim || this.i >= 6;
    if (!this.anim) HUD.line('rf-st', this.log.length ? 'Last female: you fertilised <b>' + last(this.log).eggs.toFixed(1) + '</b> of 20 eggs. Total ' + this.log.reduce((a, l) => a + l.eggs, 0).toFixed(1) + '.' : 'She is a virgin: no rival sperm at all. You have 100 units for six females, so keep something back.');
    $('bar-gen').textContent = '';
  },
  mate() {
    if (this.anim || this.i >= 6) return; const R0 = this.rv[this.i], s = this.s, share = s / (s + R0), eggs = this.EGGS * share;
    this.log.push({ i: this.i, n: this.RIV[this.i], R: R0, s, share, eggs }); this.left -= s; this.anim = { t: 0, s, R: R0 }; Snd.peck();
    HUD.line('rf-st', 'You put in ' + s + ' units against ' + R0 + '. Your share of the raffle: <b>' + pct(share) + '</b>.'); this.upd();
  },
  update(dt) {
    if (!this.anim) return; this.anim.t += dt;
    if (this.anim.t > 2.6) { this.anim = null; this.i++; if (this.i >= 6) { this.end(); return; } this.s = Math.min(this.maxS(), Math.max(1, Math.round(this.left / (6 - this.i)))); this.upd(); HUD.line('rf-st', (this.rv[this.i] ? 'Rival sperm already in her: about ' + this.rv[this.i] + ' units.' : 'She is a virgin: no rival sperm at all.') + ' You have ' + this.left + ' left for ' + (6 - this.i) + ' females.'); }
  },
  optimum() {
    const Rv = this.rv, f = lam => Rv.map(R => R === 0 ? 1 : Math.max(1, Math.sqrt(R / lam) - R));
    let lo = 1e-6, hi = 10; for (let k = 0; k < 80; k++) { const mid = Math.sqrt(lo * hi), tot = f(mid).reduce((a, b) => a + b, 0); if (tot > this.B) lo = mid; else hi = mid; }
    const s = f(hi); return { s, eggs: s.reduce((a, v, i) => a + this.EGGS * v / (v + Rv[i]), 0) };
  },
  end() {
    const O = this.optimum(), mine = this.log.reduce((a, l) => a + l.eggs, 0), e = mine / O.eggs, stars = e >= 0.99 ? 3 : e >= 0.97 ? 2 : e >= 0.94 ? 1 : 0;
    const v = this.log.filter(l => l.n === 0).map(l => l.s), five = this.log.find(l => l.n === 5), two = this.log.find(l => l.n === 2);
    const insight = 'You fertilised ' + mine.toFixed(1) + ' eggs, ' + pct(e) + ' of the best plan’s ' + O.eggs.toFixed(1) + '. The best plan spends almost nothing on virgins (you spent ' + v.join(' and ') + '), the most on females with a few rivals (best ' + Math.round(O.s[1]) + ' units against two rivals; you spent ' + two.s + '), and less again against five rivals (best ' + Math.round(O.s[3]) + '; you spent ' + five.s + '). In a crowded raffle each extra ticket buys only a sliver. That hump — more sperm as competition rises, then less as it becomes hopeless — is Parker’s prediction. The rise is well supported: males of many species spend more when a rival is present. The fall is much harder to find in real animals (Kelly and Jennions 2011).';
    End.show(this, { stars, title: mine.toFixed(1) + ' eggs fertilised', insight, leg: legP([['#3b7fa0', 'your ejaculate'], ['#c2453d', 'the best plan']]), chart: cv => this.chart(cv, O), cap: 'Units spent on each female, by number of rivals before you.' });
  },
  chart(cv, O) { O = O || this.optimum(); const L = this.log; const { c, w, h } = fitCanvas(cv); c.clearRect(0, 0, w, h); const n = this.RIV.length, gw = w / n, mx = Math.max(40, ...O.s, ...L.map(l => l.s)); for (let i = 0; i < n; i++) { const x = i * gw + gw * 0.18, bw = gw * 0.3, H = h - 24; const a = L[i] ? L[i].s : 0, b = O.s[i]; c.fillStyle = '#3b7fa0'; c.fillRect(x, 6 + H * (1 - a / mx), bw, H * a / mx); c.fillStyle = '#c2453d'; c.fillRect(x + bw + 2, 6 + H * (1 - b / mx), bw, H * b / mx); c.fillStyle = 'rgba(29,45,54,.75)'; c.font = font(11, 'b'); c.textAlign = 'center'; c.fillText(this.RIV[i] + ' rival' + (this.RIV[i] === 1 ? '' : 's'), i * gw + gw / 2, h - 5); } },
  draw(c, w, h) {
    const g = c.createRadialGradient(w / 2, h * 0.45, 20, w / 2, h * 0.45, Math.max(w, h) * 0.7); g.addColorStop(0, '#f6eef0'); g.addColorStop(1, '#d9e4e8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(29,45,54,.15)'; c.lineWidth = 1; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(w / 2, h * 0.45, 40 + i * 30, 0, TAU); c.stroke(); }
    const ex = w * 0.78, ey = h * 0.42; c.fillStyle = '#f0d9a8'; c.strokeStyle = '#b89a5a';
    const n = this.RIV[Math.min(this.i, 5)] || 0, A = this.anim, done = A && A.t > 1.8, share = A ? A.s / (A.s + A.R) : 0;
    for (let k = 0; k < 20; k++) { const a = k * 2.39996, r = 10 * Math.sqrt(k + 1); const x = ex + Math.cos(a) * r, y = ey + Math.sin(a) * r * 1.2; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fillStyle = done ? (k < Math.round(share * 20) ? '#3b7fa0' : '#a7a7a7') : '#f0d9a8'; c.fill(); c.stroke(); }
    ink(c, 'her 20 eggs', ex, ey + 78, 12, 'rgba(29,45,54,.7)', 'center', 'b', 'italic');
    const riv = A ? A.R : this.rv[Math.min(this.i, 5)], mine = A ? A.s : this.s, tot = Math.min(160, Math.round((riv + mine) * 0.9)), myN = Math.round(tot * mine / Math.max(1, riv + mine));
    const r = rng(this.i * 97 + 3);
    for (let k = 0; k < tot; k++) {
      const me = k < myN, y0 = h * (0.15 + r() * 0.6), sp = 0.35 + r() * 0.3; let x;
      if (me) { const t = A ? A.t : 0; x = lerp(-10, ex - 40 - r() * 30, clamp(t * sp, 0, 1)); } else x = ex - 60 - r() * w * 0.35;
      c.strokeStyle = me ? '#3b7fa0' : 'rgba(110,110,110,.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x - 6, y0 + Math.sin(App.t * 14 + k) * 3, x - 12, y0); c.stroke(); c.fillStyle = me ? '#3b7fa0' : '#8a8a8a'; c.beginPath(); c.ellipse(x + 2, y0, 3, 2, 0, 0, TAU); c.fill();
    }
    ink(c, n ? n + ' rival male' + (n > 1 ? 's' : '') + '’ sperm (grey)' : 'no rival sperm', 14, h - 34, 13, 'rgba(29,45,54,.75)', 'left', 'b', 'italic');
    ink(c, 'yours (blue)', 14, h - 16, 13, '#3b7fa0', 'left', 'b', 600);
  },
  notes() {
    const R0 = this.rv[Math.min(this.i, 5)], s = this.s, O = this.optimum();
    const rows = [['Rival sperm in this female', R0 + ' units', 'Each rival left about 20.'], ['Your share at ' + s + ' units', pct(s / (s + R0)), 's ÷ (s + R).'], ['Eggs gained by one more unit', R0 === 0 ? 'none' : (this.EGGS * R0 / (s + R0) / (s + R0)).toFixed(2), 'The marginal gain, 20 × R ÷ (s + R)². Spend where this is highest.'], ['Units left', this.left + '', '']];
    this.log.forEach(l => rows.push(['Female ' + (l.i + 1) + ' (' + l.n + ' rivals)', l.s + ' units, ' + l.eggs.toFixed(1) + ' eggs', 'Best plan: ' + Math.round(O.s[l.i]) + ' units.']));
    return { idea: this.idea, stats: rows, charts: this.log.length ? [{ title: 'Your spending so far', leg: legP([['#3b7fa0', 'yours'], ['#c2453d', 'best plan']]), draw: cv => this.chart(cv, O) }] : [] };
  }
};
