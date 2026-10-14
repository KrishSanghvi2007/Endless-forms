/* ================= Hawks and Doves levels 4 (assessment) and 5 (war of attrition) ================= */
(function () {
  const H = CH_HAWKS, base = { beginLevel: H.beginLevel, update: H.update, draw: H.draw, play: H.play, notes: H.notes };
  H.intro.how = 'Five levels. In the first three, choose Hawk or Dove for each contest while the population evolves around you. Level 4 adds size and prize value. Level 5 has no fights at all: hold to keep displaying, and let go to give up.';
  H.intro.goal = 'A level is passed at 85% or more of the best possible on average. One star for one level, two for three, three for all five.';
  H.real += ' Contests are usually settled by assessment rather than arbitrary rules: red deer stags roar and walk in parallel before fighting, and fights mostly happen between evenly matched stags (Clutton-Brock and Albon 1979; Clutton-Brock et al. 1979), as Geoff Parker’s idea of resource-holding potential predicts. When there is nothing to assess, contests become wars of attrition: Maynard Smith (1974) showed that the stable strategy is to persist for a random, exponentially distributed time, so that no opponent can predict when you will quit (Bishop and Cannings 1978).';
  H.maths += ' Level 4: an escalated fight is won with probability 1 ÷ (1 + e^(1.3Δ)), where Δ is how much larger the opponent is. Escalating against a hawk is worth p × V − (1 − p) × C; against a dove it is worth V; an assessor escalates only against rivals no larger than itself. Level 5: both display at a cost of 1 per second; the one who persists longer wins V = 10. Against a population that quits at one fixed time, persisting a little longer always pays. The only stable answer is to quit at random, with an exponential distribution of mean V ÷ cost, and against that every persistence time earns the same.';
  H.intro.real = H.real; // the 'In nature' text: ch5 levels 1–3 overwrite this.real with the score, and the Notes and end card read intro.real first
  H.ideas.push('<p>Now you can see how big your rival is, and how good the shell is. Big rivals usually win fights; a big shell is worth more risk.</p><p>Some crabs follow an evolved rule: fight only rivals no larger than themselves. Can you do better than a fixed rule?</p>', '<p>No fighting here: two butterflies spiral over a sunspot until one gives up. Displaying costs both of them, second by second; the one who lasts longer gets the spot.</p><p>If everyone quits at the same moment, just outlast them. But everyone else can learn that trick too. Watch how long the population now holds on.</p>');
  H.beginLevel = function () { if (this.lv === 3) return this.begin4(); if (this.lv === 4) return this.begin5(); base.beginLevel.call(this); };
  H.update = function (dt) { if (this.lv === 3) return this.update4(dt); if (this.lv === 4) return this.update5(dt); base.update.call(this, dt); };
  H.draw = function (c, w, h) { if (this.lv === 3) return this.draw4(c, w, h); if (this.lv === 4) return this.draw5(c, w, h); base.draw.call(this, c, w, h); };
  H.play = function (a) { if (this.lv === 3) return this.play4(a); base.play.call(this, a); };
  H.notes = function () { if (this.lv === 3) return this.notes4(); if (this.lv === 4) return this.notes5(); return base.notes.call(this); };
  H.down = function () { if (this.lv === 4) this.hold5(true); };
  H.up = function () { if (this.lv === 4) this.hold5(false); };
  H.tap = function () { };
  H.nextCard = function (pass, eff, note) {
    const intro = this.lv === 3 ? '<h4>Level 4: Sizing up</h4><p>Now rivals come in different sizes, and shells in two values. Bigger crabs usually win fights. Some of the population follow an assessor rule: fight only rivals no larger than themselves.</p>' : this.lv === 4 ? '<h4>Level 5: The war of attrition</h4><p>Two speckled wood butterflies, one sunspot, no fighting. Press and hold to keep displaying; each second costs you both. Let go and you give up. The one who lasts longer wins a prize worth 10.</p>' : '';
    Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>Your choices earned ' + pct(Math.min(1, eff)) + ' of the best possible.</p><p>' + note + '</p>' + intro, buttons: [{ t: this.lv < 5 ? 'Next level' : 'See results', primary: true, fn: () => { Cards.close(); if (this.lv < 5) this.beginLevel(); else this.finalEnd(); } }] });
  };
  H.finalEnd = function () {
    const n = this.res.filter(r => r.pass).length, stars = n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0;
    End.show(this, { stars, title: n + ' of 5 levels passed', insight: 'No strategy is simply best: its payoff depends on what everyone else does, and the population settles where nothing rare can do better. ' + this.res.map(r => r.note).join(' '), leg: legP([['#4f7a3a', 'passed'], ['#b3322a', 'not passed']]), chart: cv => barChart(cv, { groups: this.res.map(r => ({ label: 'L' + (r.lv + 1), parts: [{ v: Math.min(1, r.eff), c: r.pass ? '#4f7a3a' : '#b3322a' }] })) }), cap: 'Share of the best possible, by level.' });
  };
  /* ---- level 4: assessment ---- */
  H.C4 = 8;
  H.begin4 = function () {
    this.k = 0; this.gain = 0; this.best = 0; this.tally4 = 0; this.anim = null; this.f4 = [0.4, 0.4, 0.2]; this.hist = [this.f4.slice()]; $('bar-gen').textContent = 'level 4 of 5';
    HUD.set('<div class="hud-goal"><span><b>Level 4: Sizing up</b></span><b id="hd-k"></b></div><div class="meter"><i id="hd-bar"></i></div><div class="hud-line" id="hd-st"></div><div class="hud-row"><button class="btn" id="hd-d">Dove: display</button><button class="btn primary" id="hd-h">Hawk: escalate</button></div>');
    $('hd-d').onclick = () => this.play(0); $('hd-h').onclick = () => this.play(1); this.next4();
  };
  H.pw = function (d) { return 1 / (1 + Math.exp(1.3 * d)); };
  H.next4 = function () { this.d4 = [-2, -1, 0, 1, 2][(R() * 5) | 0]; this.V4 = R() < 0.5 ? 2 : 8; const r = R(), f = this.f4; this.opp = r < f[0] ? 'H' : r < f[0] + f[1] ? 'D' : 'A'; this.ready = true; this.upd4(); };
  H.pay4 = function (a, oppEsc, d, V) { if (a && oppEsc) { const p = this.pw(d); return p * V - (1 - p) * this.C4; } if (a) return V; if (oppEsc) return 0; return V / 2; };
  H.exp4 = function (a, d, V, f) { f = f || this.f4; return f[0] * this.pay4(a, true, d, V) + f[1] * this.pay4(a, false, d, V) + f[2] * this.pay4(a, d >= 0, d, V); };
  H.upd4 = function () { const f = this.f4; $('hd-k').textContent = 'contest ' + Math.min(this.k + 1, 10) + ' of 10'; $('hd-bar').style.width = pct(f[2]); $('hd-bar').style.background = '#4f7a3a'; HUD.line('hd-st', 'Rival is <b>' + (this.d4 > 0 ? 'bigger than you' + (this.d4 > 1 ? ', much' : '') : this.d4 < 0 ? 'smaller than you' + (this.d4 < -1 ? ', much' : '') : 'your size') + '</b>; the shell is <b>' + (this.V4 > 4 ? 'a big one (8)' : 'small (2)') + '</b>. Population: hawks ' + pct(f[0]) + ', doves ' + pct(f[1]) + ', assessors ' + pct(f[2]) + '.'); $('hd-d').disabled = $('hd-h').disabled = !this.ready; };
  H.play4 = function (a) {
    if (!this.ready) return; this.ready = false; const d = this.d4, V = this.V4, oppEsc = this.opp === 'H' || (this.opp === 'A' && d >= 0);
    let r; if (a && oppEsc) r = R() < this.pw(d) ? V : -this.C4; else if (!a && !oppEsc) r = R() < 0.5 ? V : 0; else r = this.pay4(a, oppEsc, d, V);
    const e = this.exp4(a, d, V), e0 = this.exp4(0, d, V), e1 = this.exp4(1, d, V); this.gain += e - Math.min(e0, e1); this.best += Math.max(e0, e1) - Math.min(e0, e1); this.tally4 += r;
    this.anim = { t: 0, a, b: oppEsc ? 1 : 0, r }; a ? Snd.peck() : Snd.click(); this.upd4();
  };
  H.evolve4 = function () {
    const f = this.f4, W = [0, 1, 2].map(s => { let w = 0, n = 0; for (const d of [-2, -1, 0, 1, 2]) for (const V of [2, 8]) { const esc = s === 0 ? 1 : s === 1 ? 0 : (d <= 0 ? 1 : 0); w += f[0] * this.pay4(esc, true, d, V) + f[1] * this.pay4(esc, false, d, V) + f[2] * this.pay4(esc, d >= 0, d, V); n++; } return w / n + this.C4; });
    const wb = f.reduce((a, v, i) => a + v * W[i], 0), nf = f.map((v, i) => v * Math.pow(W[i] / wb, 3)), s = nf.reduce((a, b) => a + b, 0); this.f4 = nf.map(v => Math.max(0.01, v / s)); this.hist.push(this.f4.slice());
  };
  H.update4 = function (dt) { if (!this.anim) return; this.anim.t += dt; if (this.anim.t > 1.6) { this.anim = null; this.k++; this.evolve4(); if (this.k >= 10) this.end4(); else this.next4(); } };
  H.end4 = function () { const eff = this.best > 0 ? this.gain / this.best : 1, pass = eff >= 0.85; const note = 'Assessors rose from 20% to ' + pct(this.f4[2]) + '. Fighting pays against smaller rivals and for bigger prizes; backing down pays against bigger rivals. A rule that reads the rival beats both blind strategies, which helps explain why so many real contests begin with sizing up.'; this.res.push({ lv: 3, eff, pass, note }); if (pass) Snd.star(); this.lv++; this.nextCard(pass, eff, note); };
  H.draw4 = function (c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6e7cc'); g.addColorStop(1, '#dcc39a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const cy = h * 0.52, s = clamp(w / 380, 0.9, 1.3), A = this.anim, t = A ? A.t : App.t, close = A ? Math.min(1, A.t * 2) : 0, sv = this.V4 > 4 ? 1.6 : 0.9;
    c.fillStyle = '#e9e2d0'; c.strokeStyle = '#a58d63'; c.lineWidth = 2; c.beginPath(); c.moveTo(w / 2 - 16 * sv, cy + 8); c.quadraticCurveTo(w / 2, cy - 22 * sv, w / 2 + 16 * sv, cy + 8); c.closePath(); c.fill(); c.stroke();
    this.crab(c, w * 0.26 + close * 20, cy, s, '#d07a2e', 1, A ? (A.a ? 'hawk' : 'dove') : 'idle', t); this.crab(c, w * 0.74 - close * 20, cy, s * (1 + 0.18 * this.d4), '#6a7f8a', -1, A ? (A.b ? 'hawk' : 'dove') : 'idle', t + 1);
    ink(c, 'you', w * 0.26, cy + 52 * s, 13, '#3a2415', 'center', 'b', 600); ink(c, A ? { H: 'a hawk', D: 'a dove', A: 'an assessor' }[this.opp] : 'size him up', w * 0.74, cy + 52 * s * (1 + 0.1 * this.d4), 13, '#3a2415', 'center', 'b', 'italic');
    if (A && A.t > 0.7) ink(c, (A.r > 0 ? '+' : '') + A.r, w / 2, cy - 60, 26, A.r > 0 ? '#4f7a3a' : A.r < 0 ? '#b3322a' : '#8a7a60', 'center', 'd', 600);
  };
  H.notes4 = function () { const d = this.d4, V = this.V4; return { idea: this.ideas[3], stats: [['Rival size', d > 0 ? d + ' larger' : d < 0 ? -d + ' smaller' : 'equal', 'Chance you win an escalated fight: ' + pct(this.pw(d)) + '.'], ['Prize', V + '', 'Injury costs 8.'], ['Expected payoff: hawk', this.exp4(1, d, V).toFixed(2), 'Averaged over hawks, doves and assessors.'], ['Expected payoff: dove', this.exp4(0, d, V).toFixed(2), ''], ['Your choices so far', this.best > 0 ? pct(Math.min(1, this.gain / this.best)) + ' of best' : '—', '']], charts: [] }; };
  /* ---- level 5: war of attrition ---- */
  H.V5 = 10; H.NB5 = 40; H.DT5 = 0.5;
  H.begin5 = function () {
    this.k = 0; this.gain = 0; this.best = 0; this.hold = false; this.tt = 0; this.anim = null; this.phase = 'wait'; $('bar-gen').textContent = 'level 5 of 5';
    this.f5 = new Array(this.NB5).fill(0.001); this.f5[8] = 1; this.f5[7] = 0.3; this.f5[9] = 0.3; this.norm5(); this.hist5 = [this.mean5()];
    HUD.set('<div class="hud-goal"><span><b>Level 5: The war of attrition</b></span><b id="hd-k"></b></div><div class="meter"><i id="hd-bar" style="background:#8a5d10"></i></div><div class="hud-line" id="hd-st"></div>'); this.upd5();
  };
  H.norm5 = function () { const s = this.f5.reduce((a, b) => a + b, 0); this.f5 = this.f5.map(v => v / s); };
  H.mean5 = function () { return this.f5.reduce((a, v, i) => a + v * (i + 0.5) * this.DT5, 0); };
  H.payT = function (t, u) { return t > u ? this.V5 - u : t < u ? -t : this.V5 / 2 - t; };
  H.exp5 = function (t) { let e = 0; this.f5.forEach((v, i) => { e += v * this.payT(t, (i + 0.5) * this.DT5); }); return e; };
  H.best5 = function () { let bt = 0, bv = -1e9; for (let i = 0; i <= this.NB5; i++) { const t = i * this.DT5 + 0.01, v = this.exp5(t); if (v > bv) { bv = v; bt = t; } } return [bt, Math.max(0, bv)]; };
  H.upd5 = function () { $('hd-k').textContent = 'contest ' + Math.min(this.k + 1, 8) + ' of 8'; $('hd-bar').style.width = pct(clamp(this.tt / 20, 0, 1)); HUD.line('hd-st', this.phase === 'wait' ? 'Press and hold anywhere to start displaying. The population now gives up after <b>' + this.mean5().toFixed(1) + ' s</b> on average.' : this.phase === 'show' ? 'Displaying: <b>' + this.tt.toFixed(1) + ' s</b>, costing you that much. Let go to give up.' : this.msg5); };
  H.hold5 = function (on) {
    if (this.phase === 'wait' && on) { this.phase = 'show'; this.tt = 0; const r = R(); let acc = 0, i = 0; for (; i < this.NB5; i++) { acc += this.f5[i]; if (r <= acc) break; } this.opT = (Math.min(i, this.NB5 - 1) + R()) * this.DT5; Snd.click(); this.upd5(); }
    else if (this.phase === 'show' && !on) this.settle5(false);
  };
  H.settle5 = function (oppQuit) {
    const t = this.tt, u = this.opT, won = oppQuit, pay = won ? this.V5 - u : -t, [bt, bv] = this.best5(); let e = this.exp5(t); if (won) { for (let i = 0; i <= this.NB5; i++) { const tau = i * this.DT5 + 0.01; if (tau >= t) e = Math.max(e, this.exp5(tau)); } } const worst = Math.min(0, e);
    this.gain += e - worst; this.best += bv - worst; this.phase = 'done';
    this.msg5 = (won ? 'Your rival gave up after ' + u.toFixed(1) + ' s: you win the spot, net <b>' + pay.toFixed(1) + '</b>.' : 'You gave up after ' + t.toFixed(1) + ' s: net <b>' + pay.toFixed(1) + '</b>.') + ' Against this population the best persistence was about ' + bt.toFixed(1) + ' s.';
    won ? Snd.chime() : Snd.miss(); this.upd5(); setTimeout(() => { if (App.mode !== this || this.lv !== 4) return; this.evolve5(); this.k++; if (this.k >= 8) this.end5(); else { this.phase = 'wait'; this.upd5(); } }, 2400);
  };
  H.evolve5 = function () {
    for (let step = 0; step < 6; step++) {
      const W = this.f5.map((_, i) => this.exp5((i + 0.5) * this.DT5) + this.V5), wb = this.f5.reduce((a, v, i) => a + v * W[i], 0);
      let nf = this.f5.map((v, i) => v * W[i] / wb); nf = nf.map((v, i) => 0.9 * v + 0.05 * (nf[i - 1] || 0) + 0.05 * (nf[i + 1] || 0) + 0.0005); this.f5 = nf; this.norm5();
    }
    this.hist5.push(this.mean5());
  };
  H.update5 = function (dt) { if (this.phase === 'show') { this.tt += dt; if (this.tt >= this.opT) this.settle5(true); else if (this.tt > 30) this.settle5(false); else this.upd5(); } };
  H.end5 = function () { const eff = this.best > 0 ? this.gain / this.best : 1, pass = eff >= 0.8; const note = 'The population’s average persistence went from ' + this.hist5[0].toFixed(1) + ' s to ' + last(this.hist5).toFixed(1) + ' s, and its spread widened: quitting at a predictable time is exploitable, so persistence evolves toward an unpredictable, exponential spread whose mean is the prize divided by the cost per second.'; this.res.push({ lv: 4, eff, pass, note }); if (pass) Snd.star(); this.lv++; this.nextCard(pass, eff, note); };
  H.draw5 = function (c, w, h) {
    const g = c.createRadialGradient(w / 2, h * 0.4, 10, w / 2, h * 0.4, Math.max(w, h) * 0.7); g.addColorStop(0, '#fff3c8'); g.addColorStop(0.35, '#b8c78a'); g.addColorStop(1, '#3e5a30'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const t = App.t, sp = this.phase === 'show', fly = (x, y, col, a) => { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col; for (const sgn of [-1, 1]) { c.beginPath(); c.ellipse(sgn * 9, -3, 9, 6, sgn * 0.4, 0, TAU); c.fill(); c.beginPath(); c.ellipse(sgn * 7, 6, 6, 4, sgn * 0.3, 0, TAU); c.fill(); } c.fillStyle = '#2a2016'; c.fillRect(-1.2, -8, 2.4, 16); c.fillStyle = '#f2e3b0'; for (const sgn of [-1, 1]) { c.beginPath(); c.arc(sgn * 11, -4, 1.6, 0, TAU); c.fill(); } c.restore(); };
    const r = sp ? 40 : 0, a = t * 3; fly(w / 2 + Math.cos(a) * r - (sp ? 0 : 60), h * 0.4 + Math.sin(a) * r * 0.7, '#8a5d2a', a); fly(w / 2 - Math.cos(a) * r + (sp ? 0 : 60), h * 0.4 - Math.sin(a) * r * 0.7, '#6a4a2a', -a);
    ink(c, 'the sunspot', w / 2, h * 0.4 + 70, 12, 'rgba(40,30,20,.7)', 'center', 'b', 'italic');
    const x0 = 20, x1 = w - 20, y0 = h - 30, hh = h * 0.2, bw = (x1 - x0) / this.NB5, mx = Math.max(...this.f5);
    this.f5.forEach((v, i) => { const bh = hh * v / mx; c.fillStyle = 'rgba(58,36,21,.45)'; c.fillRect(x0 + i * bw + 0.5, y0 - bh, bw - 1, bh); });
    ink(c, 'when the population gives up (0 to 20 s)', w / 2, y0 + 16, 11, 'rgba(40,30,20,.7)', 'center', 'b', 'italic');
    if (sp) { const x = x0 + (this.tt / this.DT5) * bw; c.strokeStyle = '#b3322a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y0 - hh - 6); c.lineTo(x, y0); c.stroke(); ink(c, this.tt.toFixed(1) + ' s', x, y0 - hh - 10, 12, '#b3322a', 'center', 'm'); }
  };
  H.notes5 = function () { const [bt, bv] = this.best5(); return { idea: this.ideas[4], stats: [['Prize', this.V5 + '', 'Each second of display costs 1.'], ['Population’s average persistence', this.mean5().toFixed(1) + ' s', 'The stable answer: an exponential spread with mean prize ÷ cost = 10 s. Here no rival can hold on past 20 s, so some of the population piles up at 20 s.'], ['Best persistence right now', bt.toFixed(1) + ' s', 'Expected net ' + bv.toFixed(2) + '. Against the stable spread, every persistence time earns the same.'], ['Your choices so far', this.best > 0 ? pct(Math.min(1, this.gain / this.best)) + ' of best' : '—', 'Scored on expected payoff against the population at that moment.']], charts: [{ title: 'Average persistence, contest by contest', draw: (cv, th) => lineChart(cv, { theme: th, series: [{ d: this.hist5, c: '#8a5d10' }], y0: 0, y1: 12, refs: [{ v: 10, label: 'V ÷ cost' }], fy: v => v.toFixed(0) + ' s', x0l: 'start', xl: 'now' }) }] }; };
})();

/* ================= The Sieve: moving optimum missions ================= */
(function () {
  const S = CH_SIEVE;
  S.MISSIONS.push(
    { k: 'track', t: 'A slow warming', d: 'Each winter, the best beak moves 0.25 mm deeper. Keep the average within 1 mm of it for eight winters.', delta: 0.25 / 8, winters: 8, test: () => false, prog: (St, M) => clamp(this_winter(S) / 8, 0, 1) },
    { k: 'track2', t: 'A fast change', d: 'Now the best beak moves 0.55 mm a winter. Keep up for six winters, if you can: this is near the limit of what selection can do.', delta: 0.55 / 8, winters: 6, test: () => false, prog: (St, M) => clamp(this_winter(S) / 6, 0, 1) }
  );
  function this_winter(ch) { return ch.winter || 0; }
  S.intro.goal = 'Five missions, each a different shape of selection: move the average, narrow the spread, widen it, then track a moving target — slowly, then fast. At least 30% must survive each winter. One star for one mission, two for three, three for all five.';
  S.maths += ' The last two missions ask how fast a population can follow a moving optimum. Each winter the response is at most h² × S, and S is capped by how many can be allowed to die; as selection uses up variation, the maximum response shrinks. If the environment moves faster than that, the population falls ever further behind. In nature the limit usually bites sooner: a population that lags too far behind loses so many young that it shrinks, which sets a critical rate of environmental change beyond which it dies out (Lynch and Lande 1993).';
  S.real += ' Whether wild populations can keep pace with climate change is this question, though in the wild much of the tracking is done by plasticity rather than evolution. In a Dutch great tit population, laying dates did not advance over 23 years of warming springs, while the caterpillar peak that feeds their chicks moved earlier and selection for early laying grew stronger (Visser et al. 1998).';
})();
