/* ================= Chapter: The Nest (parental investment, parent–offspring conflict, brood reduction) ================= */
const CH_NEST = {
  id: 'nest',
  theme: { cab: '#f2ece0', hud: '#e7dfcc', text: '#33291d', dim: 'rgba(51,41,29,.68)', line: 'rgba(51,41,29,.2)', acc: '#b8562b', hi: '#4a7a8c', meter: '#7a9a3a', inv: '#fbf7ee' },
  intro: {
    hook: 'Parents and offspring share genes, but not perfectly — and not their interests. Level 1: as a parent, decide how many eggs to lay and feed the chicks through three springs. Level 2: as a chick, decide how hard to beg. Level 3: as an egret, decide whether your chicks hatch together or one by one.',
    how: 'Level 1: set the clutch, then tap a chick whenever you arrive with food. Level 2: at each visit choose quiet, call or scream. Level 3: read the forecast and choose the hatching pattern.',
    goal: 'A star for each level where your choices earn at least 80% of the best possible.'
  },
  real: 'David Lack (1947) argued that birds lay the clutch that raises the most young; George Williams (1966) and Eric Charnov and John Krebs (1974) added that effort now costs the parent’s own future, so the best clutch is smaller than the most a parent could raise. Robert Trivers (1974) saw that offspring should want more than parents want to give: a chick values itself fully but a sibling at half, while the parent values them equally. Many birds hatch their eggs a day or more apart; in a lean year the eldest chicks monopolise food, or kill the youngest outright — facultatively in great egrets (Mock 1984), obligately in Nazca boobies, whose second egg is insurance that rarely survives if the first chick does (Anderson 1990).',
  maths: 'Level 1: a chick needs 6 feeds to fledge well, 4 to fledge at all. With F feeds available, the most fledglings come from floor(F ÷ 6) well-fed chicks; spreading food evenly over too many chicks can fledge none. In spring 3 your survival to next year is 0.9 − 0.0014 × (feeds)², worth 4 future fledglings. Level 2: your fitness counts your own survival plus half of each sibling’s; your parent counts all three equally. Level 3: hatching together yields 3 fledglings in a good year and 0.9 in a poor one; hatching staggered yields 2.6 and 1.9. Staggering wins unless a good year is more than 71% likely.',
  ideas: ['<p>Each chick needs about six beakfuls to fledge well. You bring food at a fixed rate. Lay too few eggs and you waste your effort; lay too many and they may all starve together.</p><p>When food is short, feeding everyone equally can be the worst choice. And when your own future depends on how hard you work now, the best number of chicks falls.</p>', '<p>You share half your genes with each full sibling. So a beakful that saves a starving sibling is worth half as much to you as one that saves you — and a beakful you don’t really need is worth more in a sibling’s mouth.</p><p>Your parent sees it differently: it values all three of you equally. Begging costs you energy, and the parent tends to feed whoever begs hardest.</p>', '<p>Chicks that hatch together are equals; chicks that hatch a day or two apart form a pecking order, and in a lean year the eldest take everything or kill the youngest.</p><p>That sounds grim, but it saves the brood in bad years and costs little in good ones. The forecast tells you how likely a good year is.</p>'],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() { $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 3'; if (this.lv === 0) this.begin1(); else if (this.lv === 1) this.begin2(); else this.begin3(); },
  /* ---- level 1 ---- */
  SP: [{ name: 'An ordinary spring', iv: 0.7 }, { name: 'A spring that turns cold', iv: 1.05, surprise: 'The weather has turned cold: you now find food far more slowly.' }, { name: 'A spring that costs you', iv: 0.7, cost: true }], DUR: 20,
  begin1() { this.s1 = 0; this.log1 = []; this.lay1(); },
  lay1() {
    const S = this.SP[this.s1]; this.phase = 'lay'; this.clutch = 4; this.chicks = []; this.feeds = 0;
    HUD.set('<div class="hud-goal"><span><b>Level 1: ' + S.name + '</b></span><b id="ns-k">spring ' + (this.s1 + 1) + ' of 3</b></div><div class="hud-line" id="ns-st"></div><div class="hud-row" id="ns-row"><div class="stepper"><button id="ns-m" aria-label="Fewer eggs">−</button><span id="ns-c" style="min-width:80px;text-align:center"></span><button id="ns-p" aria-label="More eggs">+</button></div><button class="btn primary" id="ns-go">Lay</button></div>');
    $('ns-m').onclick = () => { this.clutch = Math.max(1, this.clutch - 1); Snd.click(); this.upd1(); }; $('ns-p').onclick = () => { this.clutch = Math.min(7, this.clutch + 1); Snd.click(); this.upd1(); }; $('ns-go').onclick = () => this.startFeed(); this.upd1();
  },
  upd1() {
    const S = this.SP[this.s1]; if (this.phase === 'lay') { $('ns-c').innerHTML = '<b>' + this.clutch + '</b> egg' + (this.clutch > 1 ? 's' : ''); HUD.line('ns-st', 'You will bring food for ' + this.DUR + ' seconds, about one beakful every ' + this.SP[0].iv + ' s in a normal spring. A chick needs 6 beakfuls to fledge well, 4 to fledge at all.' + (S.cost ? ' <b>This spring, every beakful costs you: the harder you work, the less likely you are to see next spring.</b>' : '')); return; }
    HUD.line('ns-st', 'Time left <b>' + Math.max(0, this.DUR - this.t).toFixed(0) + ' s</b>. ' + (this.pending ? '<b>You have food: tap a chick.</b>' : 'Searching for food…') + ' Beakfuls given: ' + this.feeds + '.' + (S.cost ? ' Your chance of surviving to next spring: <b>' + pct(this.surv1(this.feeds)) + '</b>.' : ''));
  },
  surv1(f) { return clamp(0.9 - 0.0014 * f * f, 0, 1); },
  fl(f) { return f >= 6 ? 1 : f >= 4 ? 0.4 : 0; },
  startFeed() { const S = this.SP[this.s1]; this.phase = 'feed'; this.t = 0; this.pending = false; this.next = S.iv; this.chicks = Array.from({ length: this.clutch }, (_, i) => ({ f: 0, i })); $('ns-row').style.display = 'none'; if (S.surprise) toast(S.surprise); Snd.dawn(); this.upd1(); },
  bestVal1(S) { const F = Math.floor(this.DUR / (S.iv + 0.2)); let best = 0, bn = 1; for (let n = 1; n <= 7; n++) for (let used = 0; used <= F; used++) { const full = Math.min(n, Math.floor(used / 6)), rem = used - 6 * full, part = full < n && rem >= 4 ? 0.4 : 0, v = full + part + (S.cost ? 4 * this.surv1(used) : 0); if (v > best + 1e-9) { best = v; bn = n; } } return [best, bn]; },
  end1season() {
    const S = this.SP[this.s1], fled = this.chicks.reduce((a, c) => a + this.fl(c.f), 0), v = fled + (S.cost ? 4 * this.surv1(this.feeds) : 0), [bv, bn] = this.bestVal1(S);
    this.log1.push({ name: S.name, clutch: this.clutch, fled, v, bv, bn, feeds: this.feeds }); this.phase = 'done';
    toast(S.name + ': <b>' + fled.toFixed(1) + '</b> fledglings' + (S.cost ? ', and a ' + pct(this.surv1(this.feeds)) + ' chance of breeding again' : '') + '. Best possible: ' + bv.toFixed(1) + ' (with ' + bn + ' egg' + (bn > 1 ? 's' : '') + ').');
    setTimeout(() => { if (App.mode !== this) return; this.s1++; if (this.s1 < 3) this.lay1(); else { const eff = this.log1.reduce((a, l) => a + l.v, 0) / this.log1.reduce((a, l) => a + l.bv, 0); this.finishLevel(eff, 'Your springs: ' + this.log1.map(l => l.clutch + ' eggs, ' + l.fled.toFixed(1) + ' fledged (best ' + l.bn + ' eggs)').join('; ') + '. In the cold spring, concentrating food on some chicks beats sharing it among all. When effort costs your own future, the best clutch is smaller than the most you could raise.'); } }, 2400);
  },
  /* ---- level 2 ---- */
  begin2() {
    this.m = [2.2, 2.8, 1.4]; this.v2 = 0; this.gain2 = 0; this.best2 = 0; this.last2 = null; this.anim2 = null;
    HUD.set('<div class="hud-goal"><span><b>Level 2: Begging</b></span><b id="ns-k"></b></div><div class="hud-line" id="ns-st"></div><div class="hud-row"><button class="btn" data-b="0">Stay quiet</button><button class="btn" data-b="1">Call</button><button class="btn primary" data-b="2">Scream</button></div>');
    $('hud').querySelectorAll('[data-b]').forEach(b => b.onclick = () => this.beg(+b.dataset.b)); this.upd2();
  },
  S2(m) { return 1 / (1 + Math.exp(-2 * (m - 4))); },
  sibLevel(m) { return m < 3 ? 2 : m < 4 ? 1 : 0; },
  W2: [1, 3, 8], COST: [0, 0.05, 0.15],
  probs(a) { const lv = [a, this.sibLevel(this.m[1]), this.sibLevel(this.m[2])], w = lv.map((l, i) => this.W2[l] * Math.max(0.15, (5 - this.m[i]) / 5)), s = w.reduce((x, y) => x + y, 0); return w.map(x => x / s); },
  incl(m) { return this.S2(m[0]) + 0.5 * (this.S2(m[1]) + this.S2(m[2])); },
  qa(a) { const p = this.probs(a); let e = 0; for (let i = 0; i < 3; i++) { const m = this.m.slice(); m[0] -= this.COST[a]; m[i] += 1; e += p[i] * this.incl(m); } return e; },
  upd2() { $('ns-k').textContent = 'visit ' + Math.min(this.v2 + 1, 12) + ' of 12'; HUD.line('ns-st', 'You: <b>' + this.m[0].toFixed(1) + '</b>. Your sisters: <b>' + this.m[1].toFixed(1) + '</b> and <b>' + this.m[2].toFixed(1) + '</b> (4 and up is a good chance of fledging). Calling costs a little energy, screaming more.' + (this.last2 ? ' Last visit: ' + this.last2 + '.' : '')); $('hud').querySelectorAll('[data-b]').forEach(b => b.disabled = !!this.anim2); },
  beg(a) {
    if (this.anim2 || this.v2 >= 12) return; const q = [0, 1, 2].map(x => this.qa(x)), qb = Math.max(...q), qw = Math.min(...q); this.gain2 += q[a] - qw; this.best2 += qb - qw;
    const p = this.probs(a), r = R(); let who = 0, acc = 0; for (; who < 3; who++) { acc += p[who]; if (r <= acc) break; } who = Math.min(who, 2);
    const pv = [0, 1, 2].map(i => { const m = this.m.slice(); m[i] += 1; return this.S2(m[0]) + this.S2(m[1]) + this.S2(m[2]); }), parentPick = pv.indexOf(Math.max(...pv));
    this.m[0] -= this.COST[a]; this.m[who] += 1; this.m[1] -= this.COST[this.sibLevel(this.m[1])]; this.m[2] -= this.COST[this.sibLevel(this.m[2])];
    this.last2 = (who === 0 ? 'you got the beakful' : 'your sister ' + who + ' got it') + '; your parent would most have liked it to go to ' + (parentPick === 0 ? 'you' : 'sister ' + parentPick); this.anim2 = { t: 0, who, a }; a === 2 ? Snd.bitter() : Snd.click(); this.upd2();
  },
  update2(dt) { if (!this.anim2) return; this.anim2.t += dt; if (this.anim2.t > 1.3) { this.anim2 = null; this.v2++; if (this.v2 >= 12) { const eff = this.best2 > 0 ? this.gain2 / this.best2 : 1; this.finishLevel(eff, 'You ended at ' + this.m[0].toFixed(1) + ', your sisters at ' + this.m[1].toFixed(1) + ' and ' + this.m[2].toFixed(1) + ': your chance of fledging ' + pct(this.S2(this.m[0])) + ', theirs ' + pct(this.S2(this.m[1])) + ' and ' + pct(this.S2(this.m[2])) + '. The best begging tracked need: scream when you are hungry, go quiet when a starving sister would gain more from the food — but only when she would gain more than twice what you would. That factor of two, where your parent would see none, is parent–offspring conflict.'); } else this.upd2(); } },
  /* ---- level 3 ---- */
  FC: [0.5, 0.9, 0.2, 0.7, 0.4], OUT: { sync: [3, 0.9], async: [2.6, 1.9] },
  begin3() { this.s3 = 0; this.gain3 = 0; this.best3 = 0; this.log3 = []; this.show3 = null; HUD.set('<div class="hud-goal"><span><b>Level 3: Hatching order</b></span><b id="ns-k"></b></div><div class="hud-line" id="ns-st"></div><div class="hud-row"><button class="btn" id="ns-sy">Hatch together</button><button class="btn primary" id="ns-as">Hatch a day apart</button></div>'); $('ns-sy').onclick = () => this.hatch('sync'); $('ns-as').onclick = () => this.hatch('async'); this.upd3(); },
  ev3(opt, p) { const o = this.OUT[opt]; return p * o[0] + (1 - p) * o[1]; },
  upd3() { $('ns-k').textContent = 'season ' + Math.min(this.s3 + 1, 5) + ' of 5'; const p = this.FC[this.s3]; HUD.line('ns-st', this.show3 ? this.show3 : 'The forecast: <b>' + pct(p) + '</b> chance of a good fishing year. Choose before the eggs hatch.'); $('ns-sy').disabled = $('ns-as').disabled = !!this.show3; },
  hatch(opt) {
    if (this.show3) return; const p = this.FC[this.s3], good = R() < p, e = this.ev3(opt, p), es = this.ev3('sync', p), ea = this.ev3('async', p), fled = this.OUT[opt][good ? 0 : 1];
    this.gain3 += e - Math.min(es, ea); this.best3 += Math.max(es, ea) - Math.min(es, ea); this.log3.push({ p, opt, good, fled, best: es > ea ? 'sync' : 'async' });
    this.show3 = (good ? 'A good year. ' : 'A poor year. ') + (opt === 'async' ? (good ? 'All three fledged, the youngest a little light.' : 'The eldest chicks took the food and the youngest died early. Two fledged.') : (good ? 'All three fledged, strong and equal.' : 'Three equal chicks shared too little food; most of them starved.')) + ' Expected fledglings: together ' + es.toFixed(2) + ', staggered ' + ea.toFixed(2) + '.';
    this.anim3 = { t: 0, opt, good }; good ? Snd.chime() : Snd.miss(); this.upd3();
    setTimeout(() => { if (App.mode !== this) return; this.show3 = null; this.anim3 = null; this.s3++; if (this.s3 >= 5) { const eff = this.best3 > 0 ? this.gain3 / this.best3 : 1; this.finishLevel(eff, 'Staggered hatching was the better bet in ' + this.log3.filter(l => l.best === 'async').length + ' of 5 seasons: whenever a good year was less than about 71% likely. It costs a little in good years and saves the brood in bad ones.'); } else this.upd3(); }, 3200);
  },
  /* ---- shared ---- */
  finishLevel(eff, note) {
    const pass = eff >= 0.8; this.res.push({ lv: this.lv, eff, pass, note }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 3) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>Your choices earned ' + pct(Math.min(1, eff)) + ' of the best possible.</p><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const stars = this.res.filter(r => r.pass).length; End.show(this, { stars, title: stars + ' of 3 levels', insight: 'Families are cooperative and conflicted at once, because relatives share only some of their genes. ' + this.res.map(r => r.note).join(' '), leg: legP([['#7a9a3a', 'passed'], ['#b8562b', 'not passed']]), chart: cv => barChart(cv, { groups: this.res.map(r => ({ label: ['clutch', 'begging', 'hatching'][r.lv], parts: [{ v: Math.min(1, r.eff), c: r.pass ? '#7a9a3a' : '#b8562b' }] })) }), cap: 'Share of the best possible, by level.' }); }
  },
  update(dt) {
    if (this.lv === 0 && this.phase === 'feed') { this.t += dt; if (!this.pending) { this.next -= dt; if (this.next <= 0) { this.pending = true; Snd.click(); } } if (this.t >= this.DUR) this.end1season(); else this.upd1(); }
    if (this.lv === 1) this.update2(dt);
    if (this.anim3) this.anim3.t += dt;
  },
  chickPos(i, n, w, h) { const cx = w / 2, cy = h * 0.6, span = Math.min(w * 0.8, 70 * n); return { x: cx - span / 2 + span * (i + 0.5) / n, y: cy }; },
  tap(x, y) {
    if (this.lv !== 0 || this.phase !== 'feed' || !this.pending) return; const n = this.chicks.length; let best = null, bd = 50 * 50;
    this.chicks.forEach((c, i) => { const p = this.chickPos(i, n, Stage.w, Stage.h), d = (p.x - x) ** 2 + (p.y - 20 - y) ** 2; if (d < bd) { bd = d; best = c; } });
    if (!best) return; best.f++; this.feeds++; this.pending = false; this.next = this.SP[this.s1].iv; Snd.peck(); this.upd1();
  },
  chick(c, x, y, s, fed, gape, alive) { c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = alive ? 1 : 0.25; const sz = 0.7 + 0.08 * Math.min(fed, 6); c.fillStyle = '#c9b48a'; c.beginPath(); c.ellipse(0, 0, 12 * sz, 10 * sz, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -12 * sz, 7 * sz, 0, TAU); c.fill(); if (gape) { c.fillStyle = '#e8a33a'; c.beginPath(); c.moveTo(-5 * sz, -16 * sz); c.lineTo(0, -28 * sz); c.lineTo(5 * sz, -16 * sz); c.closePath(); c.fill(); c.fillStyle = '#d0404a'; c.beginPath(); c.ellipse(0, -18 * sz, 2.5 * sz, 4 * sz, 0, 0, TAU); c.fill(); } c.fillStyle = '#111'; c.beginPath(); c.arc(-3 * sz, -13 * sz, 1.2, 0, TAU); c.arc(3 * sz, -13 * sz, 1.2, 0, TAU); c.fill(); c.restore(); },
  nestBg(c, w, h) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dfe8d4'); g.addColorStop(1, '#c9d5b0'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#8a6a3a'; c.beginPath(); c.ellipse(w / 2, h * 0.66, w * 0.42, h * 0.12, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(80,55,25,.6)'; c.lineWidth = 2; for (let i = 0; i < 26; i++) { c.beginPath(); const a = i * 0.24; c.ellipse(w / 2, h * 0.66, w * (0.3 + (i % 5) * 0.02), h * (0.08 + (i % 5) * 0.008), 0, a, a + 0.9); c.stroke(); } },
  draw(c, w, h) {
    this.nestBg(c, w, h); const s = clamp(w / 380, 0.9, 1.4);
    if (this.lv === 0) {
      if (this.phase === 'lay') { for (let i = 0; i < this.clutch; i++) { const p = this.chickPos(i, this.clutch, w, h); c.fillStyle = '#e8e3d6'; c.strokeStyle = '#b8b0a0'; c.beginPath(); c.ellipse(p.x, p.y - 4, 10 * s, 13 * s, 0, 0, TAU); c.fill(); c.stroke(); } return; }
      const n = this.chicks.length; this.chicks.forEach((ch, i) => { const p = this.chickPos(i, n, w, h); this.chick(c, p.x, p.y, s * 1.3, ch.f, this.pending || Math.sin(App.t * 8 + i) > 0.6, true); const k = Math.min(1, ch.f / 6); c.fillStyle = 'rgba(51,41,29,.15)'; c.fillRect(p.x - 16, p.y + 26 * s, 32, 5); c.fillStyle = ch.f >= 6 ? '#7a9a3a' : ch.f >= 4 ? '#c9a13a' : '#b8562b'; c.fillRect(p.x - 16, p.y + 26 * s, 32 * k, 5); });
      const px = w * 0.85, py = h * 0.22; c.fillStyle = '#5a4a3a'; c.beginPath(); c.ellipse(px, py, 16, 9, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(px - 14, py - 5, 6, 0, TAU); c.fill(); if (this.pending) { c.fillStyle = '#efe0c0'; c.beginPath(); c.ellipse(px - 24, py - 4, 7, 3, 0.3, 0, TAU); c.fill(); ink(c, 'food! tap a chick', px - 10, py + 26, 12, '#33291d', 'center', 'b', 600); }
      return;
    }
    if (this.lv === 1) {
      const A = this.anim2; for (let i = 0; i < 3; i++) { const p = this.chickPos(i, 3, w, h), me = i === 0, gape = A ? (me ? A.a > 0 : this.sibLevel(this.m[i]) > 0) : Math.sin(App.t * 6 + i) > 0.5; this.chick(c, p.x, p.y, s * (1.2 + (me ? 0.15 : 0)), this.m[i] * 1.5, gape, true); ink(c, me ? 'you' : 'sister ' + i, p.x, p.y + 34 * s, 12, me ? '#b8562b' : '#33291d', 'center', 'b', 600); ink(c, this.m[i].toFixed(1), p.x, p.y + 48 * s, 11, 'rgba(51,41,29,.75)', 'center', 'm'); if (A && A.who === i && A.t > 0.3) ink(c, '+1', p.x, p.y - 50 * s, 18, '#7a9a3a', 'center', 'd', 600); }
      return;
    }
    const A = this.anim3, stag = A ? A.opt === 'async' : false;
    for (let i = 0; i < 3; i++) { const p = this.chickPos(i, 3, w, h), size = stag ? 1.4 - i * 0.2 : 1.2, dead = A && A.t > 1 && !A.good && ((stag && i === 2) || (!stag && i > 0 && A.t > 1.6)); if (A && !A.good && stag && i === 0 && A.t > 0.5 && A.t < 1) ink(c, 'peck', p.x + 30, p.y - 30, 12, '#b8562b', 'center', 'b', 600); this.chick(c, p.x, p.y, s * size, 5, false, !dead); }
    ink(c, 'great egret nest', w / 2, h * 0.18, 13, 'rgba(51,41,29,.7)', 'center', 'b', 'italic');
  },
  notes() {
    if (this.lv === 0) { const S = this.SP[Math.min(this.s1, 2)], [bv, bn] = this.bestVal1(S); return { idea: this.ideas[0], stats: [['Food this spring', 'one beakful every ' + S.iv + ' s', 'About ' + Math.floor(this.DUR / (S.iv + 0.2)) + ' beakfuls in all, allowing for your reaction time.'], ['Best clutch here', bn + ' eggs', 'Value ' + bv.toFixed(1) + (S.cost ? ', counting your own survival as worth 4 future fledglings.' : '.')], ['Beakfuls given', this.feeds + '', S.cost ? 'Your survival: ' + pct(this.surv1(this.feeds)) + '.' : '']].concat(this.log1.map(l => [l.name, l.clutch + ' eggs, ' + l.fled.toFixed(1) + ' fledged', 'Best: ' + l.bn + ' eggs, ' + l.bv.toFixed(1) + '.'])), charts: [] }; }
    if (this.lv === 1) { const q = [0, 1, 2].map(a => this.qa(a)); return { idea: this.ideas[1], stats: [['Your genes’ view of quiet / call / scream', q.map(v => v.toFixed(3)).join(' / '), 'Expected: your survival + ½ × each sister’s, after this visit.'], ['Fledging chance now', [0, 1, 2].map(i => pct(this.S2(this.m[i]))).join(', '), 'You, sister 1, sister 2.'], ['Your choices so far', this.best2 > 0 ? pct(Math.min(1, this.gain2 / this.best2)) + ' of best' : '—', '']], charts: [] }; }
    const p = this.FC[Math.min(this.s3, 4)]; return { idea: this.ideas[2], stats: [['Chance of a good year', pct(p), ''], ['Expected fledglings, together', this.ev3('sync', p).toFixed(2), '3 in a good year, 0.9 in a poor one.'], ['Expected fledglings, staggered', this.ev3('async', p).toFixed(2), '2.6 in a good year, 1.9 in a poor one.'], ['Break-even forecast', '71%', 'Above it, hatching together pays.']], charts: [] };
  }
};
