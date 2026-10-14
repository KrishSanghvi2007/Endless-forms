/* ================= Forager levels 4 and 5 ================= */
(function () {
  const F = CH_FORAGER, base = { beginLevel: F.beginLevel, update: F.update, draw: F.draw, tap: F.tap, notes: F.notes, levelNote: F.levelNote, upd: F.upd };
  F.intro.how = 'Five levels, each adding a complication: carrying food home, handling time, rich and poor patches, a hawk overhead, and a cold night that punishes coming up short. Tap food to take it; the buttons tell you when to move on.';
  F.intro.goal = 'Each level is passed at 80% or more of the best possible (levels 1–3), by feeding your chicks and surviving (level 4), or by making the choices that give the best chance of surviving the night (level 5). One star for passing one level, two for three, three for all five.';
  F.real += ' Predation changes everything: foraging animals routinely give up food to reduce risk, feeding less in the open and scanning more when predators are about (Lima and Dill 1990). And the currency is not always rate: Thomas Caraco and colleagues (1980) found that yellow-eyed juncos preferred a steady food source when they were on track to meet their overnight needs, but switched to a variable one when they were not — the energy-budget rule (Stephens 1981). Later tests have been mixed: most animals tested avoid variable amounts of food, and many do not switch when their reserves run short (Kacelnik and Bateson 1996).';
  F.maths += ' Level 4: a round only counts if you survive it and bring home enough; the best plan is the least risky one that still meets the target, so vigilance and cover are worth their cost only when the hawk is common. Level 5: with t trials left and reserves e, the chance of surviving is computed backwards from the night: V(e, t) = max[V(e + 2, t − 1), ½V(e, t − 1) + ½V(e + 4, t − 1)]. When steady feeding is enough, variance can only hurt you; when it isn’t, variance is your only hope.';
  F.ideas.push('<p>The meadow is rich and exposed; the hedge is safe and poor. With your head down you feed fast but see the hawk late; with your head up you see it in time but feed slowly.</p><p>Your chicks need a set number of grubs. Hiding all round is safe but starves them; feeding recklessly may leave them with no parent. The right balance depends on how often the hawk comes.</p>', '<p>Two feeders give the same food on average. One always gives 2 seeds; the other gives 0 or 4.</p><p>Averages don’t keep you alive overnight — reaching the threshold does. Ask each time: if I play safe from here, do I make it?</p>');
  F.beginLevel = function () { if (this.lv === 3) return this.begin4(); if (this.lv === 4) return this.begin5(); base.beginLevel.call(this); };
  F.update = function (dt) { if (this.lv === 3) return this.update4(dt); if (this.lv === 4) return; base.update.call(this, dt); };
  F.draw = function (c, w, h) { if (this.lv === 3) return this.draw4(c, w, h); if (this.lv === 4) return this.draw5(c, w, h); base.draw.call(this, c, w, h); };
  F.tap = function (x, y) { if (this.lv === 3) return this.tap4(x, y); if (this.lv === 4) return; base.tap.call(this, x, y); };
  F.notes = function () { if (this.lv === 3) return this.notes4(); if (this.lv === 4) return this.notes5(); return base.notes.call(this); };
  F.upd = function () { if (this.lv >= 3) return; base.upd.call(this); };
  F.levelNote = function (r) {
    if (r.lv === 4) return 'Of the decisions that mattered, you made the better choice ' + pct(Math.min(1, r.eff)) + ' of the time. When steady feeding would carry you over the threshold, the gamble could only hurt; when it could not, the gamble was your only chance.';
    if (r.lv === 3) return r.logs.map(l => l.name + ': ' + (l.alive ? l.food + ' grubs for ' + l.need + ' needed' : 'caught by the hawk') + (l.alive && l.food >= l.need ? '.' : ' — the chicks went short.')).join(' ') + ' When the hawk was rare, feeding head-down in the open was worth the small risk. When it was common, head-up feeding, cover, or both paid for themselves.';
    if (r.lv === 4) return 'Your choices gave ' + pct(Math.min(1, r.eff)) + ' of the best possible chance of surviving the nights. When steady feeding would carry you over the threshold, the gamble could only hurt; when it could not, the gamble was your only chance.';
    return base.levelNote.call(this, r);
  };
  /* ---- level 4: predation and vigilance ---- */
  F.R4 = [{ name: 'The hawk is rare', lam: 0.006, need: 32, dur: 35 }, { name: 'The hawk is hunting', lam: 0.08, need: 20, dur: 35 }];
  F.begin4 = function () {
    this.round = 0; this.logs = []; $('bar-gen').textContent = 'level 4 of 5';
    HUD.set('<div class="hud-goal"><span><b>Level 4: Danger</b></span><b id="fg-time"></b></div><div class="hud-line" id="fg-st"></div><div class="hud-row"><button class="btn" id="fg-head">Head down</button><button class="btn primary" id="fg-dive">Dive!</button></div>');
    $('fg-head').onclick = () => { this.headUp = !this.headUp; Snd.click(); this.upd4(); }; $('fg-dive').onclick = () => this.dive(); this.round4();
  };
  F.round4 = function () { this.t = 0; this.food = 0; this.place = 'open'; this.mv = 0; this.headUp = false; this.hawk = null; this.nextHawk = -Math.log(R()) / this.R4[this.round].lam; this.grub = null; this.nextIn = 0.8; this.cover = 0; this.alive = true; this.done4 = false; this.intro4 = 1.4; this.upd4(); };
  F.upd4 = function () { const Rd = this.R4[this.round]; const tm = $('fg-time'); if (!tm) return; tm.textContent = Math.max(0, Rd.dur - this.t).toFixed(0) + ' s'; $('fg-head').textContent = this.headUp ? 'Head up (watching)' : 'Head down (feeding)'; $('fg-head').classList.toggle('sel', this.headUp); $('fg-dive').disabled = !(this.hawk && this.hawk.ph === 'warn'); HUD.line('fg-st', Rd.name + '. Grubs: <b>' + this.food + '</b> of ' + Rd.need + ' needed. You are ' + (this.mv > 0 ? 'moving' : this.cover > 0 ? 'hiding in cover' : 'in ' + (this.place === 'open' ? 'the open meadow' : 'the hedge')) + '. Tap the other patch to move.'); };
  F.delay4 = function () { const base = this.place === 'open' ? 0.55 : 1.5; return base * (this.headUp ? 1.5 : 1); };
  F.warn = function () { return this.headUp ? 1.3 : 0.5; };
  F.exposed = function () { return (this.place === 'open' || this.mv > 0) && this.cover <= 0; };
  F.dive = function () { if (!(this.hawk && this.hawk.ph === 'warn')) return; this.cover = 1.5; this.grub = null; Snd.click(); this.upd4(); };
  F.tap4 = function (x, y) {
    if (!this.alive || this.done4 || this.intro4 > 0) return; const w = Stage.w;
    if (this.grub && Math.hypot(x - this.grub.x, y - this.grub.y) < 28 && this.mv <= 0 && this.cover <= 0) { this.food++; this.grub = null; this.nextIn = this.delay4(); Snd.peck(); this.upd4(); return; }
    const want = x < w * 0.35 ? 'hedge' : 'open'; if (want !== this.place && this.mv <= 0) { this.mv = 1; this.place = want; this.grub = null; Snd.click(); this.upd4(); }
  };
  F.update4 = function (dt) {
    if (this.done4) return; if (this.intro4 > 0) { this.intro4 -= dt; return; }
    const Rd = this.R4[this.round]; this.t += dt; if (this.mv > 0) { this.mv -= dt; if (this.mv <= 0) this.nextIn = this.delay4(); } if (this.cover > 0) { this.cover -= dt; if (this.cover <= 0) this.nextIn = this.delay4(); }
    if (!this.hawk) { this.nextHawk -= dt; if (this.nextHawk <= 0) this.hawk = { ph: 'circle', t: 0 }; }
    else { const H = this.hawk; H.t += dt; if (H.ph === 'circle' && H.t > 0.8) { if (this.exposed()) { H.ph = 'warn'; H.t = 0; Snd.bitter(); } else { this.hawk = null; this.nextHawk = -Math.log(R()) / Rd.lam; } } else if (H.ph === 'warn' && H.t > this.warn()) { if (this.exposed()) { this.alive = false; this.hawk = { ph: 'strike', t: 0 }; Snd.bitter(); this.end4(); return; } this.hawk = null; this.nextHawk = -Math.log(R()) / Rd.lam; } }
    if (this.mv <= 0 && this.cover <= 0 && !this.grub) { this.nextIn -= dt; if (this.nextIn <= 0) { const w = Stage.w, h = Stage.h; this.grub = this.place === 'open' ? { x: w * (0.45 + R() * 0.5), y: h * (0.55 + R() * 0.35) } : { x: w * (0.05 + R() * 0.25), y: h * (0.55 + R() * 0.35) }; } }
    if (this.t >= Rd.dur) this.end4(); else this.upd4();
  };
  F.end4 = function () {
    if (this.done4) return; this.done4 = true; const Rd = this.R4[this.round]; this.logs.push({ name: Rd.name, food: this.food, need: Rd.need, alive: this.alive });
    toast(this.alive ? (this.food >= Rd.need ? 'Chicks fed: <b>' + this.food + '</b> grubs.' : 'Only ' + this.food + ' of ' + Rd.need + ' grubs. The chicks went hungry.') : '<b>Caught.</b> Your chicks are on their own.');
    setTimeout(() => { if (App.mode !== this) return; this.round++; if (this.round < 2) this.round4(); else { const pass = this.logs.every(l => l.alive && l.food >= l.need); this.res.push({ lv: 3, eff: pass ? 1 : 0.5, pass, logs: this.logs.slice() }); if (pass) Snd.star(); this.lv++; this.endLevelCard(); } }, 1800);
  };
  F.endLevelCard = function () { const r = last(this.res); Cards.open({ cls: 'intro', html: '<h3>' + (r.pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + this.levelNote(r) + '</p>' + (this.lv === 4 ? '<h4>Level 5: The long night</h4><p>You are a junco at dusk. You must finish the day with enough reserves to survive the night. Two feeders give the same food on average: one always gives 2 seeds, the other gives 0 or 4 at random. Your reserves and the night’s needs change each evening.</p>' : ''), buttons: [{ t: this.lv < 5 ? 'Next level' : 'See results', primary: true, fn: () => { Cards.close(); if (this.lv < 5) this.beginLevel(); else this.end(); } }] }); };
  F.draw4 = function (c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#cfe4ef'); g.addColorStop(0.45, '#e8f0dc'); g.addColorStop(0.47, '#a7c46e'); g.addColorStop(1, '#86a855'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#3d5a2a'; c.fillRect(0, h * 0.4, w * 0.33, h * 0.6); for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(w * 0.16 + Math.cos(i) * w * 0.14, h * 0.45 + (i % 4) * h * 0.13, 22, 0, TAU); c.fillStyle = i % 2 ? '#35502a' : '#46683a'; c.fill(); }
    ink(c, 'hedge: safe, poor', w * 0.17, h * 0.38, 12, '#2f2a17', 'center', 'b', 600); ink(c, 'open meadow: rich, exposed', w * 0.68, h * 0.44, 12, '#2f2a17', 'center', 'b', 600);
    if (this.grub) { c.fillStyle = '#efe0c0'; c.strokeStyle = '#8a6d45'; c.beginPath(); c.ellipse(this.grub.x, this.grub.y, 9, 4, Math.sin(App.t * 6) * 0.4, 0, TAU); c.fill(); c.stroke(); }
    const bx = this.place === 'open' ? w * 0.62 : w * 0.18, by = h * 0.7 - (this.mv > 0 ? 20 : 0); if (this.alive) { c.globalAlpha = this.cover > 0 ? 0.35 : 1; this.bird(c, bx, by, 1.5, '#7a5a3a', this.mv > 0 ? 0.5 + 0.5 * Math.sin(App.t * 18) : 0); c.globalAlpha = 1; if (this.headUp) { c.strokeStyle = 'rgba(46,110,142,.6)'; c.lineWidth = 1.5; c.beginPath(); c.arc(bx + 12, by - 12, 12, -2.6, -0.5); c.stroke(); } }
    if (this.hawk) { const H = this.hawk, k = H.ph === 'circle' ? 0 : H.ph === 'warn' ? clamp(H.t / this.warn(), 0, 1) : 1, hx = lerp(w * 0.5 + Math.cos(App.t) * w * 0.3, bx, k), hy = lerp(h * 0.12, by - 10, k * k); c.fillStyle = 'rgba(40,30,20,.9)'; c.beginPath(); c.moveTo(hx - 30, hy); c.quadraticCurveTo(hx, hy - 14, hx + 30, hy); c.quadraticCurveTo(hx, hy + 6, hx - 30, hy); c.fill(); if (H.ph === 'warn') ink(c, 'DIVE!', w / 2, h * 0.3, 22, '#a8263f', 'center', 'd', 600); }
    if (this.intro4 > 0) { c.fillStyle = 'rgba(242,238,216,.8)'; c.fillRect(0, 0, w, h); ink(c, this.R4[this.round].name, w / 2, h / 2, 22, '#2f2a17', 'center', 'd', 600); }
  };
  F.notes4 = function () { const Rd = this.R4[this.round] || this.R4[1]; return { idea: this.ideas[3], stats: [['Hawk visits', (Rd.lam * 60).toFixed(1) + ' per minute', 'It only stoops if you are exposed when it passes.'], ['Warning you get', this.warn().toFixed(2) + ' s', 'Head up: 1.3 s. Head down: 0.5 s — about a human reaction time.'], ['Time per grub, head down', 'open ' + (0.55).toFixed(2) + ' s, hedge 1.5 s', 'Plus your reaction time.'], ['Time per grub, head up', 'open ' + (0.55 * 1.5).toFixed(2) + ' s, hedge ' + (1.5 * 1.5).toFixed(2) + ' s', 'Vigilance costs feeding.'], ['Needed this round', Rd.need + ' grubs', 'A hard target: surviving is not enough, and neither is feeding if you do not survive.']], charts: [] }; };
  /* ---- level 5: risk-sensitive foraging ---- */
  F.N5 = [{ e: 4, need: 22 }, { e: 2, need: 28 }, { e: 0, need: 20 }, { e: 6, need: 30 }, { e: 3, need: 24 }], F.T5 = 10;
  F.V5 = function (e, t, need) { const key = e + ',' + t + ',' + need; this._v = this._v || {}; if (key in this._v) return this._v[key]; let v; if (t === 0) v = e >= need ? 1 : 0; else v = Math.max(this.V5(e + 2, t - 1, need), 0.5 * this.V5(e, t - 1, need) + 0.5 * this.V5(e + 4, t - 1, need)); return this._v[key] = v; };
  F.Q5 = function (a, e, t, need) { return a === 0 ? this.V5(e + 2, t - 1, need) : 0.5 * this.V5(e, t - 1, need) + 0.5 * this.V5(e + 4, t - 1, need); };
  F.begin5 = function () {
    this.night = 0; this.gotV = 0; this.bestV = 0; this.dec = 0; this.cor = 0; this.nights = []; $('bar-gen').textContent = 'level 5 of 5';
    HUD.set('<div class="hud-goal"><span><b>Level 5: The long night</b></span><b id="fg-time"></b></div><div class="meter"><i id="fg-res" style="background:#5c8a3a"></i><em id="fg-need"></em></div><div class="hud-line" id="fg-st"></div><div class="hud-row"><button class="btn" id="fg-s">Steady feeder: 2</button><button class="btn primary" id="fg-g">Lucky feeder: 0 or 4</button></div>');
    $('fg-s').onclick = () => this.feed(0); $('fg-g').onclick = () => this.feed(1); this.night5();
  };
  F.night5 = function () { const N = this.N5[this.night]; this.e = N.e; this.tl = this.T5; this.last5 = null; this.upd5(); };
  F.upd5 = function () { const N = this.N5[this.night], mx = N.need + 12; $('fg-time').textContent = 'evening ' + (this.night + 1) + ' of ' + this.N5.length; $('fg-res').style.width = pct(Math.min(1, this.e / mx)); $('fg-need').style.left = 'calc(' + pct(N.need / mx) + ' - 1px)'; HUD.line('fg-st', 'Reserves <b>' + this.e + '</b>; you need <b>' + N.need + '</b> by nightfall. Feeding visits left: <b>' + this.tl + '</b>.' + (this.last5 ? ' Last visit: ' + this.last5 + '.' : '')); $('fg-s').disabled = $('fg-g').disabled = this.tl <= 0; };
  F.feed = function (a) {
    if (this.tl <= 0) return; const N = this.N5[this.night], q = this.Q5(a, this.e, this.tl, N.need), qb = Math.max(this.Q5(0, this.e, this.tl, N.need), this.Q5(1, this.e, this.tl, N.need));
    if (qb > 0) { this.gotV += q; this.bestV += qb; } const q0 = this.Q5(0, this.e, this.tl, N.need), q1 = this.Q5(1, this.e, this.tl, N.need); if (Math.abs(q0 - q1) >= 0.05) { this.dec++; if (q >= Math.max(q0, q1) - 1e-9) this.cor++; }
    const gain = a === 0 ? 2 : (R() < 0.5 ? 0 : 4); this.e += gain; this.tl--; this.last5 = (a === 0 ? 'steady feeder, ' : 'lucky feeder, ') + gain + ' seeds'; Snd.peck(); this.upd5();
    if (this.tl <= 0) { const ok = this.e >= N.need; this.nights.push({ ok, e: this.e, need: N.need }); toast(ok ? 'You made it through the night.' : '<b>Too little.</b> The night was too long for your reserves.'); setTimeout(() => { if (App.mode !== this) return; this.night++; if (this.night < this.N5.length) this.night5(); else { const eff = this.dec ? this.cor / this.dec : 1, pass = eff >= 0.85; this.res.push({ lv: 4, eff, pass, nights: this.nights.slice() }); if (pass) Snd.star(); this.lv++; this.endLevelCard(); } }, 1500); }
  };
  F.draw5 = function (c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a4a6a'); g.addColorStop(0.6, '#b99a8a'); g.addColorStop(0.62, '#e8eef2'); g.addColorStop(1, '#cfd9df'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((i * 73 + App.t * 10) % w, (i * 41 + App.t * 25) % (h * 0.62), 1.4, 0, TAU); c.fill(); }
    const fx = [w * 0.28, w * 0.72]; ['steady: always 2', 'lucky: 0 or 4'].forEach((t, k) => { c.fillStyle = '#6b4a2a'; c.fillRect(fx[k] - 3, h * 0.45, 6, h * 0.3); c.fillStyle = k ? '#b0482b' : '#2e6e8e'; rrect(c, fx[k] - 28, h * 0.4, 56, 22, 6); c.fill(); ink(c, t, fx[k], h * 0.4 + 40, 12, '#f4f0e6', 'center', 'b', 600); });
    this.bird(c, w * 0.5, h * 0.8, 1.8, '#4a4f5a', 0); const N = this.N5[Math.min(this.night, this.N5.length - 1)];
    ink(c, 'reserves ' + this.e + ' / ' + N.need + ' needed', w / 2, h * 0.93, 14, '#2f2a17', 'center', 'd', 600);
    if (this.e + 2 * this.tl >= N.need && this.tl > 0) ink(c, 'steady feeding from here would be enough', w / 2, h * 0.2, 13, '#f4f0e6', 'center', 'b', 'italic'); else if (this.tl > 0) ink(c, 'steady feeding from here would fall short', w / 2, h * 0.2, 13, '#f4e0c0', 'center', 'b', 'italic');
  };
  F.notes5 = function () { const N = this.N5[Math.min(this.night, this.N5.length - 1)]; return { idea: this.ideas[4], stats: [['Reserves and need', this.e + ' of ' + N.need, ''], ['Visits left', this.tl + '', ''], ['Survival chance if steady now', pct(this.tl ? this.Q5(0, this.e, this.tl, N.need) : this.e >= N.need ? 1 : 0), 'Then playing the best way after.'], ['Survival chance if lucky now', pct(this.tl ? this.Q5(1, this.e, this.tl, N.need) : this.e >= N.need ? 1 : 0), ''], ['Decisions that mattered, got right', this.dec ? this.cor + ' of ' + this.dec : '—', 'Only visits where one feeder gives a clearly better survival chance count. Luck at the lucky feeder does not.']], charts: [] }; };
  /* ---- chapter end over five levels ---- */
  F.end = function () {
    const n = this.res.filter(r => r.pass).length, stars = n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0;
    const insight = 'You passed ' + n + ' of 5 levels. Each level added something that moves the optimum. Travel time makes each trip worth more food; handling time makes poor prey worth skipping when good prey are common; patch quality sets how long to stay; predators make some food not worth its risk, and vigilance worth its cost; and when survival depends on reaching a threshold, the best choice depends on your state, not just on averages. Optimal foraging is not one rule but a way of asking what an animal’s time and risk are worth.';
    End.show(this, { stars, title: n + ' of 5 levels passed', insight, leg: legP([['#5c8a3a', 'passed'], ['#b5652b', 'not passed']]), chart: cv => barChart(cv, { groups: this.res.map(r => ({ label: 'L' + (r.lv + 1), parts: [{ v: Math.min(1, r.eff), c: r.pass ? '#5c8a3a' : '#b5652b' }] })) }), cap: 'Share of the best achieved in each level.' });
  };
})();

/* ================= Raffle level 2: seminal fluid and sexual conflict ================= */
(function () {
  const Q = CH_RAFFLE, base = { update: Q.update, draw: Q.draw, notes: Q.notes };
  Q.intro.hook += ' Then, in level 2, what you add to the sperm: seminal fluid proteins that change how the female behaves — for your benefit, not necessarily hers.';
  Q.intro.goal = 'Level 1: at least 96% of the best sperm plan. Level 2: at least 90% of your best seminal-fluid doses. Three stars need 99% and 97%.';
  Q.real += ' Seminal fluid is not just a carrier. In Drosophila melanogaster, the sex peptide transferred with sperm makes a female lay more eggs and refuse other males for about a week — and repeated exposure to seminal fluid shortens her life (Chapman et al. 1995; Wigby and Chapman 2005). William Rice (1996) let males evolve for 41 generations against females that could not evolve in return: the males became better at sperm competition and more harmful to their mates. What is best for a male’s paternity need not be best for the female, and each sex’s adaptations become the other’s problem.';
  Q.maths += ' Level 2 model: a dose x (0 to 1) raises her egg-laying by 50% × x for a week, delays her remating from its usual day by a factor (1 + 0.8x), and shortens her remaining life by 50% × x². Eggs laid before she remates are yours; after, a new male fathers 80% of them. Your best dose maximises your eggs; hers maximises her total eggs. The gap between the two is the sexual conflict. (Here she cannot speed up her own laying, so even she gains from a small dose; that is a simplification of the model.)';
  const FEM = [{ age: 'young', L0: 30, rem: 6, riv: 'few rivals about' }, { age: 'young', L0: 30, rem: 2, riv: 'rivals everywhere' }, { age: 'old', L0: 8, rem: 2, riv: 'rivals everywhere' }, { age: 'old', L0: 8, rem: 6, riv: 'few rivals about' }, { age: 'young', L0: 30, rem: 3.5, riv: 'some rivals' }];
  Q.K = { egg: 0.5, rem: 0.8, life: 0.5 };
  Q.life = function (F, x) { const K = this.K, L = F.L0 * (1 - K.life * x * x), rm = F.rem * (1 + K.rem * x); let mine = 0, hers = 0; const days = []; for (let d = 0; d < Math.ceil(L); d++) { const frac = Math.min(1, L - d), rate = 10 * (d < 7 ? 1 + K.egg * x : 1) * frac, p = d < rm ? 1 : 0.2; mine += rate * p; hers += rate; days.push({ rate, p }); } return { mine, hers, L, rm, days }; };
  Q.opt = function (F, who) { let bx = 0, bv = -1; for (let x = 0; x <= 1.0001; x += 0.05) { const r = this.life(F, x), v = who === 'm' ? r.mine : r.hers; if (v > bv) { bv = v; bx = x; } } return [bx, bv]; };
  Q.end = function () {
    const O = this.optimum(), mine = this.log.reduce((a, l) => a + l.eggs, 0); this.l1e = mine / O.eggs; this.l1O = O; this.l1mine = mine; if (this.l1e >= 0.96) Snd.star();
    Cards.open({ cls: 'intro', html: '<h3>Level 1 ' + (this.l1e >= 0.96 ? 'passed' : 'over') + '</h3><p>You fertilised ' + mine.toFixed(1) + ' eggs, ' + pct(this.l1e) + ' of the best plan. In a crowded raffle each extra ticket buys only a sliver; with no rivals, and no male coming after you, one ticket wins everything.</p><h4>Level 2: What else is in the ejaculate</h4><p>Now you also choose a dose of seminal fluid proteins for five females. A bigger dose makes her lay more eggs now and delays the day she accepts another male — but it shortens her life. You see your eggs and hers.</p>', buttons: [{ t: 'Start level 2', primary: true, fn: () => { Cards.close(); this.begin2(); } }] });
  };
  Q.begin2 = function () {
    this.lv = 1; this.j = 0; this.x = 5; this.log2 = []; this.anim2 = null;
    HUD.set('<div class="hud-goal"><span id="rf-who"></span><b id="rf-left"></b></div><div class="hud-line" id="rf-st"></div><div class="hud-row"><div class="stepper"><button id="rf-m" aria-label="Less">−</button><span id="rf-s" style="min-width:110px;text-align:center;font-size:15px"></span><button id="rf-p" aria-label="More">+</button></div><button class="btn primary" id="rf-go">Mate</button></div>');
    $('rf-m').onclick = () => { this.x = Math.max(0, this.x - 1); Snd.click(); this.upd2(); }; $('rf-p').onclick = () => { this.x = Math.min(10, this.x + 1); Snd.click(); this.upd2(); }; $('rf-go').onclick = () => this.mate2(); this.upd2();
  };
  Q.upd2 = function () { const F = FEM[this.j]; if (!F) return; $('rf-who').innerHTML = 'Female ' + (this.j + 1) + ' of 5: <b>' + F.age + '</b>, ' + F.riv; $('rf-left').textContent = ''; $('rf-s').innerHTML = 'dose <b>' + this.x + '</b> of 10'; $('rf-go').disabled = !!this.anim2; if (!this.anim2) HUD.line('rf-st', (F.age === 'young' ? 'She has about 30 days of laying ahead. ' : 'She has about 8 days left. ') + (F.rem < 3 ? 'With rivals everywhere, she would normally remate within a couple of days.' : F.rem > 5 ? 'With few rivals about, she would not normally remate for about a week.' : 'She would normally remate after three or four days.')); $('bar-gen').textContent = 'level 2 of 2'; };
  Q.mate2 = function () {
    if (this.anim2 || this.j >= 5) return; const F = FEM[this.j], x = this.x / 10, r = this.life(F, x), [mx, mv] = this.opt(F, 'm'), [fx, fv] = this.opt(F, 'f'), baseline = this.life(F, 0).mine;
    this.log2.push({ F, x, mine: r.mine, hers: r.hers, mv, fv, mx, fx, baseline, r }); this.anim2 = { t: 0 }; Snd.peck();
    HUD.line('rf-st', 'You fathered <b>' + r.mine.toFixed(0) + '</b> of her eggs (your best dose: ' + Math.round(mx * 10) + ', for ' + mv.toFixed(0) + '). She laid <b>' + r.hers.toFixed(0) + '</b> in all; the dose best for her was ' + Math.round(fx * 10) + ', giving ' + fv.toFixed(0) + '.'); $('rf-go').disabled = true;
  };
  Q.update = function (dt) { if (this.lv !== 1) return base.update.call(this, dt); if (!this.anim2) return; this.anim2.t += dt; if (this.anim2.t > 4) { this.anim2 = null; this.j++; if (this.j >= 5) this.end2(); else this.upd2(); } };
  Q.end2 = function () {
    const L = this.log2, got = L.reduce((a, l) => a + l.mine - l.baseline, 0), best = L.reduce((a, l) => a + l.mv - l.baseline, 0), e2 = best > 0 ? got / best : 1, harm = L.reduce((a, l) => a + (l.fv - l.hers), 0);
    const s1 = this.l1e >= 0.96 ? 1 : 0, s2 = e2 >= 0.9 ? 1 : 0, s3 = this.l1e >= 0.99 && e2 >= 0.97 ? 1 : 0;
    const insight = 'Level 1: ' + pct(this.l1e) + ' of the best sperm plan. Level 2: your doses earned ' + pct(Math.min(1, e2)) + ' of what your best doses would have gained. Your best doses were ' + L.map(l => Math.round(l.mx * 10)).join(', ') + '; hers were ' + L.map(l => Math.round(l.fx * 10)).join(', ') + '. Across the five females, your choices cost them ' + harm.toFixed(0) + ' eggs compared with the doses best for them. The conflict was largest for young females, whose shortened future costs her far more than it costs you, since many of those later eggs would have gone to rivals anyway; with an old female and few rivals, your best dose and hers coincided, and there was no conflict at all. That gap between his best and hers is sexual conflict, and it can drive an arms race: females evolve resistance, males evolve more potent proteins.';
    End.show(this, { stars: s1 + s2 + s3, title: 'Sperm, seminal fluid and conflict', insight, leg: legP([['#3b7fa0', 'your dose'], ['#c2453d', 'best for you'], ['#5b8c5a', 'best for her']]), chart: cv => { const { c, w, h } = fitCanvas(cv); c.clearRect(0, 0, w, h); const gw = w / 5; L.forEach((l, i) => { [[l.x, '#3b7fa0'], [l.mx, '#c2453d'], [l.fx, '#5b8c5a']].forEach(([v, col], k) => { const bh = (h - 24) * v; c.fillStyle = col; c.fillRect(i * gw + gw * 0.15 + k * gw * 0.24, h - 18 - bh, gw * 0.2, bh); }); c.fillStyle = 'rgba(29,45,54,.75)'; c.font = font(10, 'b'); c.textAlign = 'center'; c.fillText(l.F.age + (l.F.rem < 3 ? ', crowded' : ''), i * gw + gw / 2, h - 5); }); }, cap: 'Seminal-fluid dose for each female: yours, your best, and hers.' });
  };
  Q.draw = function (c, w, h) {
    if (this.lv !== 1) return base.draw.call(this, c, w, h);
    const g = c.createRadialGradient(w / 2, h * 0.4, 20, w / 2, h * 0.4, Math.max(w, h) * 0.7); g.addColorStop(0, '#f6eef0'); g.addColorStop(1, '#d9e4e8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const F = FEM[Math.min(this.j, 4)], x = this.x / 10, L = this.log2[this.j] && this.anim2 ? this.log2[this.j].r : this.life(F, x), maxD = 30, x0 = 18, bw = (w - 36) / maxD, yb = h * 0.62;
    ink(c, 'her remaining life, day by day', x0, h * 0.14, 13, 'rgba(29,45,54,.75)', 'left', 'b', 'italic');
    for (let d = 0; d < Math.ceil(F.L0); d++) { const day = L.days[d]; if (!day) { c.fillStyle = 'rgba(29,45,54,.12)'; c.fillRect(x0 + d * bw + 1, yb - 40, bw - 2, 40); continue; } const hh = day.rate * 8; c.fillStyle = day.p === 1 ? '#3b7fa0' : 'rgba(130,130,130,.7)'; c.fillRect(x0 + d * bw + 1, yb - hh, bw - 2, hh); }
    c.strokeStyle = 'rgba(29,45,54,.35)'; c.beginPath(); c.moveTo(x0, yb + 1); c.lineTo(x0 + maxD * bw, yb + 1); c.stroke();
    if (L.rm < L.L) { const rx = x0 + L.rm * bw; c.strokeStyle = '#c2453d'; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(rx, yb - 150); c.lineTo(rx, yb + 6); c.stroke(); c.setLineDash([]); ink(c, 'she remates', rx + 4, yb - 140, 11, '#c2453d', 'left', 'b', 600); }
    ink(c, 'blue: eggs you father   grey: a rival’s   shaded: days lost to your seminal fluid', w / 2, yb + 22, 11, 'rgba(29,45,54,.7)', 'center', 'b');
    ink(c, 'yours ' + L.mine.toFixed(0) + '    hers ' + L.hers.toFixed(0), w / 2, yb + 48, 16, '#1d2d36', 'center', 'd', 600);
  };
  Q.notes = function () {
    if (this.lv !== 1) return base.notes.call(this); const F = FEM[Math.min(this.j, 4)], x = this.x / 10, r = this.life(F, x);
    return { idea: '<p>Seminal fluid proteins make a female lay faster and turn other males away — both good for your paternity. They also shorten her life. The cost to you is small when most of her later eggs would have gone to rivals anyway, or when she has little life left.</p><p>Watch how the best dose for you and the best dose for her diverge.</p>', stats: [['This female', F.age + ', ' + F.riv, ''], ['Your eggs at this dose', r.mine.toFixed(0), 'Eggs laid before she remates, plus 20% of those after.'], ['Her eggs at this dose', r.hers.toFixed(0), ''], ['She remates on day', r.rm < r.L ? r.rm.toFixed(1) : 'never', ''], ['Her remaining life', r.L.toFixed(1) + ' days', 'Down from ' + F.L0 + '.']], charts: [] };
  };
})();
(function () { const st = CH_RAFFLE.start; CH_RAFFLE.start = function () { this.lv = 0; st.call(this); }; })();
