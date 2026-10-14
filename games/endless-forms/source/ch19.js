/* ================= Chapter: The Crowd (where to feed when others choose too) ================= */
const CH_CROWD = {
  id: 'crowd',
  theme: { cab: '#e6eef2', hud: '#d6e3ea', text: '#1a2a33', dim: 'rgba(26,42,51,.68)', line: 'rgba(26,42,51,.2)', acc: '#d0703a', hi: '#2f6f9f', meter: '#4f8a5a', inv: '#f2f7f9' },
  intro: {
    hook: 'The best place to feed depends on where everyone else is feeding. Level 1: twenty-four sticklebacks and two feeders. Level 2: some of the fish are bigger than you. Level 3: birds choosing between berry bushes, each with a private clue and a view of who went where before them.',
    how: 'Levels 1 and 2: each round, choose a feeder. Level 3: choose a bush after seeing your clue and the choices of the birds ahead of you.',
    goal: 'A star for each level where your choices earn at least 90% of the best possible, judged on what you could know, not on luck.'
  },
  real: 'Manfred Milinski (1979) fed sticklebacks at two ends of a tank at rates of 2:1; within minutes the fish split roughly 2:1 between the ends, so each got about the same intake — the ideal free distribution predicted by Stephen Fretwell and Henry Lucas (1970). When competitors differ in ability, the distribution matches competitive weights rather than numbers (Sutherland and Parker 1985), and weaker animals can do best by avoiding the richest patch. Copying others is useful but can go wrong: once early choices outweigh any one individual’s own information, everyone after follows the crowd whatever their own evidence — an information cascade (Bikhchandani, Hirshleifer and Welch 1992). Luc-Alain Giraldeau and colleagues (2002) argued that animals copying each other’s choices of food patches and mates are exposed to the same trap.',
  maths: 'Level 1: your intake at a feeder is its rate divided by the number of fish there, including you. At the ideal free distribution intake is equal everywhere, which happens when the numbers match the rates. Level 2: intake is shared in proportion to competitive weight (a big fish counts as two), so equalise rate per unit of weight. Level 3: each clue is right 65% of the time. A choice made before a cascade reveals that bird’s clue; after two net clues point the same way, later birds rationally ignore their own clue, and their choices reveal nothing. The Bayesian choice is to add the revealed clues to your own and follow the majority, with your own clue breaking a tie.',
  ideas: ['<p>Food drops at two feeders. Your share at a feeder is its rate divided by the number of fish there, you included. The crowd moves too, so the best feeder changes.</p>', '<p>Now eight of the fish are big, and each takes twice a small fish’s share. Count weight, not heads.</p>', '<p>One bush is good and one is poor, but nobody knows which. Each bird gets a private clue that is right 65% of the time, and sees where the birds before it went. Early choices tell you about those birds’ clues. Later choices may just be copying.</p>'],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() {
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 3'; this.round = 0; this.got = 0; this.best = 0; this.msg = ''; this.anim = null;
    if (this.lv < 2) { this.N = 10; this.nA = 12; this.bigA = 4; this.side = null; HUD.set('<div class="hud-goal"><span><b>' + (this.lv ? 'Level 2: Big fish' : 'Level 1: Two feeders') + '</b></span><b id="cr-n"></b></div><div class="hud-line" id="cr-st"></div><div class="hud-row"><button class="btn" id="cr-a">Left feeder</button><button class="btn" id="cr-b">Right feeder</button></div>'); $('cr-a').onclick = () => this.choose('A'); $('cr-b').onclick = () => this.choose('B'); this.upd(); }
    else { this.N = 8; this.newTrial(); }
  },
  rates() { if (this.lv === 1) return [30, 15]; return this.round < 5 ? [30, 15] : [10, 30]; },
  weights() { if (this.lv === 0) return [this.nA, 24 - this.nA]; const smallA = this.nA - this.bigA; return [this.bigA * 2 + smallA, (8 - this.bigA) * 2 + (24 - this.nA - (8 - this.bigA))]; },
  counts() { return [this.nA, 24 - this.nA]; },
  upd() {
    $('cr-n').textContent = 'round ' + Math.min(this.round + 1, this.N) + ' of ' + this.N; const [ra, rb] = this.rates(), [na, nb] = this.counts();
    HUD.line('cr-st', (this.msg ? this.msg + '<br>' : '') + 'Left feeder: <b>' + ra + '</b> pellets a minute, ' + na + ' fish' + (this.lv ? ' (' + this.bigA + ' big)' : '') + '. Right feeder: <b>' + rb + '</b> a minute, ' + nb + ' fish' + (this.lv ? ' (' + (8 - this.bigA) + ' big)' : '') + '.');
    $('cr-a').disabled = $('cr-b').disabled = !!this.anim;
  },
  choose(s) {
    if (this.anim || this.round >= this.N) return; const [ra, rb] = this.rates(), [wa, wb] = this.weights(), ia = ra / (wa + 1), ib = rb / (wb + 1), mine = s === 'A' ? ia : ib, bestv = Math.max(ia, ib), worst = Math.min(ia, ib);
    this.got += mine - worst + 1e-6; this.best += bestv - worst + 1e-6; this.side = s; this.anim = { t: 0 };
    this.msg = 'Your intake: <b>' + mine.toFixed(2) + '</b> pellets a minute (' + (mine >= bestv - 1e-9 ? 'the better feeder' : 'the other feeder gave ' + bestv.toFixed(2)) + ').'; mine >= bestv - 1e-9 ? Snd.chime() : Snd.miss();
    this.round++;
    // the crowd responds
    const [ra2, rb2] = this.round < this.N ? (this.lv === 1 ? [30, 15] : this.round < 5 ? [30, 15] : [10, 30]) : [ra, rb];
    if (this.lv === 0) { const target = Math.round(24 * ra2 / (ra2 + rb2)); this.nA = clamp(this.nA + Math.round((target - this.nA) * (0.4 + R() * 0.3)) + (R() < 0.3 ? (R() < 0.5 ? -2 : 2) : 0), 2, 22); }
    else { this.bigA = clamp(this.bigA + (R() < 0.5 ? -1 : 1) * (1 + ((R() * 2) | 0)), 1, 7); const tw = 40 * ra2 / (ra2 + rb2), smallA = clamp(Math.round(tw - this.bigA * 2 + (R() - 0.5) * 6), 0, 16); this.nA = this.bigA + smallA; }
    this.upd(); if (this.round >= this.N) setTimeout(() => { if (App.mode === this) this.finish(); }, 1300);
  },
  finish(note) {
    const eff = this.got / this.best, pass = eff >= 0.9; note = note || (this.lv === 0 ? 'The crowd settled near the ideal free distribution — about twice as many fish at the feeder with twice the food — and tracked it when the rates switched. At that point every feeder pays the same, so there is nothing left to gain by moving.' : 'With big fish counting double, the rich feeder was often worse for a small fish than its food rate suggested. The crowd balances competitive weight, not numbers.');
    this.res.push({ lv: this.lv, eff, pass, note }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 3) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>You earned ' + pct(Math.min(1, eff)) + ' of the best possible.</p><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const stars = this.res.filter(r => r.pass).length; End.show(this, { stars, title: stars + ' of 3 levels', insight: 'Where to go depends on where others go, and on what their choices can tell you. ' + this.res.map(r => r.note).join(' ') }); }
  },
  /* level 3: information cascade */
  newTrial() {
    this.good = R() < 0.5 ? 1 : -1; this.pos = 2 + ((R() * 7) | 0); this.prior = []; let d = 0;
    for (let i = 1; i < this.pos; i++) { const sg = R() < 0.65 ? this.good : -this.good; let a; if (Math.abs(d) >= 2) a = Math.sign(d); else { const t = d + sg; a = t === 0 ? sg : Math.sign(t); d += sg; } this.prior.push(a); }
    this.dInfo = d; this.sig = R() < 0.65 ? this.good : -this.good; this.anim = { t: 0 };
    HUD.set('<div class="hud-goal"><span><b>Level 3: Follow the crowd?</b></span><b id="cr-n"></b></div><div class="hud-line" id="cr-st"></div><div class="hud-row"><button class="btn" id="cr-a">Left bush</button><button class="btn" id="cr-b">Right bush</button></div>');
    $('cr-a').onclick = () => this.pick3(1); $('cr-b').onclick = () => this.pick3(-1); this.upd3();
  },
  upd3() { $('cr-n').textContent = 'bird ' + Math.min(this.round + 1, this.N) + ' of ' + this.N; const L = this.prior.filter(a => a > 0).length, Rr = this.prior.length - L; HUD.line('cr-st', (this.msg ? this.msg + '<br>' : '') + 'You are bird <b>' + this.pos + '</b> in line. Before you: <b>' + L + '</b> went left, <b>' + Rr + '</b> right (in order: ' + this.prior.map(a => a > 0 ? 'L' : 'R').join(' ') + '). Your own clue says: <b>' + (this.sig > 0 ? 'left' : 'right') + '</b>.'); },
  pick3(a) {
    const t = this.dInfo + this.sig, opt = t === 0 ? this.sig : Math.sign(t), ok = a === opt; this.got += ok ? 1 : 0; this.best += 1; const right = a === this.good;
    this.msg = 'The good bush was on the <b>' + (this.good > 0 ? 'left' : 'right') + '</b>. ' + (ok ? 'Your choice was the best bet given what you knew' : 'The best bet given what you knew was ' + (opt > 0 ? 'left' : 'right')) + (Math.abs(this.dInfo) >= 2 ? ' — the birds ahead had already formed a cascade, so only their first few choices carried information.' : '.');
    right ? Snd.chime() : Snd.miss(); this.round++; if (this.round >= this.N) { this.finish('Early choices reveal early birds’ clues; once two more pointed one way than the other, everyone after copied, and their choices told you nothing new. That is how a whole flock can end up at the poorer bush.'); return; } this.newTrial();
  },
  update(dt) { if (this.anim) { this.anim.t += dt; if (this.anim.t > 1.2) { this.anim = null; if (this.lv < 2 && $('cr-a')) this.upd(); } } },
  draw(c, w, h) {
    if (this.lv < 2) {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#a8cbd8'); g.addColorStop(1, '#5a8ea3'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const [ra, rb] = this.rates(), [na] = this.counts(), fy = h * 0.12; [[w * 0.2, ra], [w * 0.8, rb]].forEach(([x, r]) => { c.fillStyle = '#e8e2d0'; c.fillRect(x - 16, fy - 10, 32, 14); ink(c, r + '/min', x, fy - 16, 12, '#1a2a33', 'center', 'b', 600); for (let i = 0; i < r / 5; i++) { const px = x + ((i * 37) % 30) - 15, py = (fy + ((App.t * 60 + i * 23) % (h * 0.5))); c.fillStyle = '#c9a040'; c.beginPath(); c.arc(px, py, 2, 0, TAU); c.fill(); } });
      const r = rng(this.round * 3 + this.lv); for (let i = 0; i < 24; i++) { const atA = i < na, big = this.lv === 1 && (atA ? i < this.bigA : i - na < 8 - this.bigA), bx = (atA ? w * 0.2 : w * 0.8) + (r() - 0.5) * w * 0.3, by = h * 0.3 + r() * h * 0.5 + Math.sin(App.t * 3 + i) * 3, sz = big ? 1.7 : 1; c.fillStyle = big ? '#6a7a5a' : '#8a9a7a'; c.beginPath(); c.ellipse(bx, by, 9 * sz, 4 * sz, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(bx - 9 * sz, by); c.lineTo(bx - 14 * sz, by - 4 * sz); c.lineTo(bx - 14 * sz, by + 4 * sz); c.fill(); }
      if (this.side) { const bx = this.side === 'A' ? w * 0.2 : w * 0.8, by = h * 0.86; c.fillStyle = '#d0703a'; c.beginPath(); c.ellipse(bx, by, 10, 5, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(bx - 10, by); c.lineTo(bx - 16, by - 5); c.lineTo(bx - 16, by + 5); c.fill(); ink(c, 'you', bx, by + 18, 12, '#1a2a33', 'center', 'b', 600); }
      return;
    }
    c.fillStyle = '#e6eef2'; c.fillRect(0, 0, w, h); const bushY = h * 0.3; [[w * 0.22, 'left'], [w * 0.78, 'right']].forEach(([x]) => { c.fillStyle = '#4f7a4a'; for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(x + Math.cos(k) * 22, bushY + Math.sin(k * 1.7) * 14, 24, 0, TAU); c.fill(); } c.fillStyle = '#a0304a'; for (let k = 0; k < 10; k++) { c.beginPath(); c.arc(x + Math.cos(k * 2.3) * 28, bushY + Math.sin(k * 1.9) * 18, 3, 0, TAU); c.fill(); } });
    const k = this.anim ? clamp(this.anim.t / 1.2, 0, 1) : 1; this.prior.forEach((a, i) => { const tx = a > 0 ? w * 0.22 : w * 0.78, sx = w / 2, sy = h * 0.85, prog = clamp(k * this.prior.length - i, 0, 1), x = sx + (tx + (i % 3 - 1) * 14 - sx) * prog, y = sy + (bushY - 40 - ((i / 3) | 0) * 12 - sy) * prog; c.fillStyle = '#3a3a4a'; c.beginPath(); c.moveTo(x - 6, y); c.quadraticCurveTo(x, y - 6, x + 6, y); c.quadraticCurveTo(x, y - 2, x - 6, y); c.fill(); ink(c, '' + (i + 1), x, y + 12, 10, '#1a2a33', 'center', 'b'); });
    c.fillStyle = '#d0703a'; c.beginPath(); c.arc(w / 2, h * 0.85, 8, 0, TAU); c.fill(); ink(c, 'you (bird ' + this.pos + ')', w / 2, h * 0.85 + 22, 12, '#1a2a33', 'center', 'b', 600); ink(c, 'your clue: ' + (this.sig > 0 ? '← left' : 'right →'), w / 2, h * 0.72, 13, '#d0703a', 'center', 'b', 'italic');
  },
  notes() {
    if (this.lv < 2) { const [ra, rb] = this.rates(), [wa, wb] = this.weights(); return { idea: this.ideas[this.lv], stats: [['Left: your intake if you join', (ra / (wa + 1)).toFixed(2), 'Rate ÷ (' + (this.lv ? 'competitive weight' : 'fish') + ' there + you).'], ['Right: your intake if you join', (rb / (wb + 1)).toFixed(2), ''], ['Ideal free split', Math.round(24 * ra / (ra + rb)) + ' : ' + (24 - Math.round(24 * ra / (ra + rb))), this.lv ? 'In weight, not heads.' : 'Numbers in proportion to food.']], charts: [] }; }
    return { idea: this.ideas[2], stats: [['Informative clues revealed by earlier birds', (this.dInfo > 0 ? '+' : '') + this.dInfo + ' toward left', 'Choices made before a cascade reveal clues; after it, choices are copying.'], ['Your clue', this.sig > 0 ? 'left' : 'right', 'Right 65% of the time.']], charts: [] };
  }
};
