/* ================= Chapter: Hawks and Doves (evolutionarily stable strategies) ================= */
const CH_HAWKS = {
  id: 'hawks', N: 10,
  theme: { cab: '#f4e4cf', hud: '#ead2b3', text: '#3a2415', dim: 'rgba(58,36,21,.68)', line: 'rgba(58,36,21,.2)', acc: '#b3322a', hi: '#4f7a3a', meter: '#8a5d10', inv: '#fbf2e4' },
  intro: {
    hook: 'Two hermit crabs, one empty shell. Each can escalate — fight until one is hurt — or display and back down if the other escalates. You are one crab in a population of hawks and doves, and you never know which you’ll meet.',
    how: 'For each contest, choose Hawk (escalate) or Dove (display). The population’s mix is shown, and it evolves: whichever strategy is paying better becomes more common.',
    goal: 'Three levels. A star for each where your choices earn at least 85% of the best possible on average.'
  },
  real: 'John Maynard Smith and George Price (1973) introduced the evolutionarily stable strategy, a strategy that, once common, cannot be beaten by a rare alternative. The hawk–dove game is its simplest example: when injury costs more than the prize is worth, neither pure strategy is stable, and the population settles where hawks make up V ÷ C of contests: either as a mix of pure hawks and doves, or with every animal playing hawk with that probability. Real animals often settle contests by arbitrary asymmetries instead. Nick Davies (1978) found that male speckled wood butterflies defending a sunspot almost always kept it against intruders, as if following “owner wins”; later work showed residents often have other advantages too.',
  maths: 'With prize V and injury cost C: a hawk meeting a hawk expects (V − C) ÷ 2; a hawk meeting a dove gets V; a dove meeting a hawk gets 0; two doves share, V ÷ 2 each. If hawks make up a share p, a hawk expects p(V − C)/2 + (1 − p)V and a dove (1 − p)V/2. These are equal at p* = V ÷ C. Below p*, hawks do better and spread; above it, doves do. If V > C, hawk always pays better and takes over. The bourgeois strategy — hawk as owner, dove as intruder — is stable too: against other bourgeois players it never fights, yet it always wins at home.',
  ideas: [
    '<p>A fight with another hawk is a gamble: half the time you win the shell, half the time you are injured. A display against a hawk means losing the shell, but nothing worse. Against a dove, a hawk wins outright.</p><p>So hawk is great when hawks are rare and terrible when they’re common. Keep an eye on the mix.</p>',
    '<p>Now the prize is big and fights are cheap. Is backing down ever worth it?</p>',
    '<p>Now every contest has an <b>owner</b> — the crab already in the shell — and an <b>intruder</b>. Some crabs follow a rule: fight when you own it, back off when you don’t. You know your role.</p>'
  ],
  LV: [{ V: 4, C: 10, p: 0.85 }, { V: 8, C: 4, p: 0.25 }, { V: 4, C: 10, f: [0.35, 0.35, 0.3] }],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() {
    const L = this.LV[this.lv]; this.k = 0; this.gain = 0; this.best = 0; this.log = []; this.real = 0; this.anim = null;
    if (this.lv < 2) { this.p = L.p; this.hist = [L.p]; } else { this.f = L.f.slice(); this.hist = [this.f.slice()]; }
    HUD.set('<div class="hud-goal"><span><b>Level ' + (this.lv + 1) + '</b>: prize ' + L.V + ', injury −' + L.C + '</span><b id="hd-k"></b></div><div class="meter"><i id="hd-bar"></i></div><div class="hud-line" id="hd-st"></div><div class="hud-row"><button class="btn" id="hd-d">Dove: display</button><button class="btn primary" id="hd-h">Hawk: escalate</button></div>');
    $('hd-d').onclick = () => this.play(0); $('hd-h').onclick = () => this.play(1);
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 3'; this.next();
  },
  next() { this.role = this.lv === 2 ? (R() < 0.5 ? 'owner' : 'intruder') : null; this.opp = this.draw_opp(); this.ready = true; this.upd(); },
  draw_opp() { if (this.lv < 2) return R() < this.p ? 'H' : 'D'; const r = R(); return r < this.f[0] ? 'H' : r < this.f[0] + this.f[1] ? 'D' : 'B'; },
  oppAct(o, myRole) { return o === 'H' ? 1 : o === 'D' ? 0 : (myRole === 'owner' ? 0 : 1); },
  pay(a, b, L) { return a && b ? (L.V - L.C) / 2 : a && !b ? L.V : !a && b ? 0 : L.V / 2; },
  exp(a) { const L = this.LV[this.lv]; if (this.lv < 2) return this.p * this.pay(a, 1, L) + (1 - this.p) * this.pay(a, 0, L); const f = this.f; return f[0] * this.pay(a, 1, L) + f[1] * this.pay(a, 0, L) + f[2] * this.pay(a, this.role === 'owner' ? 0 : 1, L); },
  upd() {
    const L = this.LV[this.lv]; $('hd-k').textContent = 'contest ' + Math.min(this.k + 1, this.N) + ' of ' + this.N;
    if (this.lv < 2) { $('hd-bar').style.width = pct(this.p); $('hd-bar').style.background = '#b3322a'; HUD.line('hd-st', 'Hawks in the population: <b>' + pct(this.p) + '</b>. Your total so far: <b>' + this.real + '</b>.'); }
    else { const f = this.f; $('hd-bar').style.width = pct(f[0] + f[2]); $('hd-bar').style.background = 'linear-gradient(90deg,#b3322a ' + pct(f[0] / (f[0] + f[2] + 1e-9)) + ',#4f7a3a 0)'; HUD.line('hd-st', 'Population: hawks <b>' + pct(f[0]) + '</b>, doves <b>' + pct(f[1]) + '</b>, owner-wins <b>' + pct(f[2]) + '</b>. You are the <b>' + this.role + '</b>.'); }
    const dis = !this.ready; $('hd-d').disabled = dis; $('hd-h').disabled = dis;
  },
  play(a) {
    if (!this.ready) return; this.ready = false; const L = this.LV[this.lv], b = this.oppAct(this.opp, this.role);
    let r; if (a && b) r = R() < 0.5 ? L.V : -L.C; else if (!a && !b) r = R() < 0.5 ? L.V : 0; else r = this.pay(a, b, L);
    const e = this.exp(a), eb = Math.max(this.exp(0), this.exp(1)), ew = Math.min(this.exp(0), this.exp(1));
    this.gain += e - ew; this.best += eb - ew; this.real += r; this.log.push({ a, b, r, e, eb, p: this.lv < 2 ? this.p : null });
    this.anim = { t: 0, a, b, r }; a ? Snd.peck() : Snd.click(); this.upd();
  },
  evolve() {
    const L = this.LV[this.lv];
    if (this.lv < 2) { const eH = this.p * (L.V - L.C) / 2 + (1 - this.p) * L.V, eD = (1 - this.p) * L.V / 2; this.p = clamp(this.p + 3 * this.p * (1 - this.p) * (eH - eD) / (L.V + L.C), 0.01, 0.99); this.hist.push(this.p); return; }
    const f = this.f, act = (s, role) => s === 0 ? 1 : s === 1 ? 0 : (role === 'owner' ? 1 : 0), W = [0, 1, 2].map(s => { let w = 0; for (let t = 0; t < 3; t++) w += f[t] * 0.5 * (this.pay(act(s, 'owner'), act(t, 'intruder'), L) + this.pay(act(s, 'intruder'), act(t, 'owner'), L)); return w + L.C; });
    const wb = f.reduce((a, v, i) => a + v * W[i], 0), nf = f.map((v, i) => v * Math.pow(W[i] / wb, 3)), s = nf.reduce((a, b) => a + b, 0); this.f = nf.map(v => Math.max(0.005, v / s)); this.hist.push(this.f.slice());
  },
  update(dt) {
    if (!this.anim) return; this.anim.t += dt;
    if (this.anim.t > 1.6) { this.anim = null; this.k++; this.evolve(); if (this.k >= this.N) this.endLevel(); else this.next(); }
  },
  endLevel() {
    const eff = this.best > 0 ? this.gain / this.best : 1, pass = eff >= 0.85, L = this.LV[this.lv];
    const note = this.lv === 0 ? 'Hawks fell from 85% to ' + pct(this.p) + ' of the population, close to the stable mix V ÷ C = ' + pct(L.V / L.C) + '. There, hawks and doves earn the same, so neither can take over.' : this.lv === 1 ? 'With a big prize and cheap fights, escalating always paid, and hawks rose to ' + pct(this.p) + '. When V > C, hawk is the only stable strategy.' : 'Owner-wins rose to ' + pct(this.f[2]) + '. Against owner-wins crabs, fighting as an intruder means meeting a hawk and fighting as owner means meeting a dove — so the best reply is to follow the same rule. An arbitrary convention became stable.';
    this.res.push({ lv: this.lv, eff, pass, note, hist: this.hist.slice() }); if (pass) Snd.star();
    this.lv++;
    if (true) { this.nextCard(pass, eff, note); } else if (false) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>Your choices earned ' + pct(Math.min(1, eff)) + ' of the best possible.</p><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const stars = this.res.filter(r => r.pass).length; End.show(this, { stars, title: stars + ' of 3 levels', insight: 'No strategy is simply best: its payoff depends on what everyone else is doing. The population settles where no alternative can do better — an evolutionarily stable strategy. ' + this.res.map(r => r.note).join(' '), leg: legP([['#b3322a', 'level 1: hawks'], ['#8a5d10', 'level 2: hawks'], ['#4f7a3a', 'level 3: owner-wins']]), chart: cv => lineChart(cv, { theme: 'paper', series: [{ d: this.res[0].hist, c: '#b3322a' }, { d: this.res[1].hist, c: '#8a5d10' }, { d: this.res[2].hist.map(f => f[2]), c: '#4f7a3a' }], y0: 0, y1: 1, refs: [{ v: 0.4, label: 'V ÷ C' }], fy: v => pct(v), x0l: 'start', xl: 'end' }), cap: 'How each population evolved while you played.' }); }
  },
  crab(c, x, y, s, col, facing, mode, t) {
    c.save(); c.translate(x, y); c.scale(s * facing, s);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 22, 13, 0, 0, TAU); c.fill();
    for (let i = 0; i < 3; i++) { c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(-8 + i * 8, 10); c.lineTo(-14 + i * 8, 22); c.stroke(); }
    const up = mode === 'hawk' ? -18 - Math.abs(Math.sin(t * 20)) * 6 : mode === 'dove' ? -8 - Math.sin(t * 8) * 10 : -6;
    c.fillStyle = mode === 'hawk' ? '#d9482f' : '#f0d9a0'; c.beginPath(); c.ellipse(24, up, 14, 8, -0.5, 0, TAU); c.fill(); c.strokeStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(14, -4); c.lineTo(20, up + 4); c.stroke();
    c.fillStyle = '#111'; c.beginPath(); c.arc(8, -16, 3, 0, TAU); c.arc(-2, -16, 3, 0, TAU); c.fill();
    c.restore();
  },
  draw(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6e7cc'); g.addColorStop(1, '#dcc39a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(120,90,50,.18)'; for (let i = 0; i < 70; i++) { c.beginPath(); c.arc((i * 71) % w, (i * 37) % h, 1.5, 0, TAU); c.fill(); }
    const cy = h * 0.52, s = clamp(w / 380, 0.9, 1.4), A = this.anim, t = A ? A.t : App.t;
    c.fillStyle = '#e9e2d0'; c.strokeStyle = '#a58d63'; c.lineWidth = 2; c.beginPath(); c.moveTo(w / 2 - 16, cy + 8); c.quadraticCurveTo(w / 2, cy - 22, w / 2 + 16, cy + 8); c.closePath(); c.fill(); c.stroke();
    const oppLabel = { H: 'a hawk', D: 'a dove', B: 'an owner-wins crab' }[this.opp];
    const myMode = A ? (A.a ? 'hawk' : 'dove') : 'idle', opMode = A ? (A.b ? 'hawk' : 'dove') : 'idle', close = A ? Math.min(1, A.t * 2) : 0;
    this.crab(c, w * 0.26 + close * 20, cy, s, '#d07a2e', 1, myMode, t); this.crab(c, w * 0.74 - close * 20, cy, s, '#6a7f8a', -1, opMode, t + 1);
    ink(c, 'you' + (this.role ? ', the ' + this.role : ''), w * 0.26, cy + 50 * s, 13, '#3a2415', 'center', 'b', 600);
    ink(c, A ? 'it was ' + oppLabel : 'who is it?', w * 0.74, cy + 50 * s, 13, '#3a2415', 'center', 'b', 'italic');
    if (A && A.t > 0.7) { const good = A.r > 0; ink(c, (A.r > 0 ? '+' : '') + A.r, w / 2, cy - 50, 26, good ? '#4f7a3a' : A.r < 0 ? '#b3322a' : '#8a7a60', 'center', 'd', 600); ink(c, A.a && A.b ? (A.r > 0 ? 'you won the fight' : 'you were injured') : A.a ? 'it backed down' : A.b ? 'you backed down' : (A.r > 0 ? 'it gave up after the display' : 'you gave up after the display'), w / 2, cy - 26, 13, '#3a2415', 'center', 'b', 'italic'); }
  },
  notes() {
    const L = this.LV[Math.min(2, this.lv)], rows = [['Prize and injury', 'V = ' + L.V + ', C = ' + L.C, ''], ['Expected payoff now: hawk', this.exp(1).toFixed(2), 'Averaged over who you might meet.'], ['Expected payoff now: dove', this.exp(0).toFixed(2), '']];
    if (this.lv < 2) rows.push(['Stable share of hawks', L.V >= L.C ? '100%' : pct(L.V / L.C), 'Where hawk and dove earn the same: V ÷ C.']);
    rows.push(['Your choices so far', this.best > 0 ? pct(Math.min(1, this.gain / this.best)) + ' of best' : '—', 'Scored on expected payoff, so luck in a single fight doesn’t count against you.']);
    return { idea: this.ideas[Math.min(2, this.lv)], stats: rows, charts: [] };
  }
};

/* ================= Chapter: Alarm Call (kin selection, Hamilton's rule, helpers) ================= */
const REL = { mother: 0.5, daughter: 0.5, sister: 0.5, 'half-sister': 0.25, niece: 0.25, cousin: 0.125, stranger: 0 };
const CH_ALARM_V1 = {
  id: 'alarm', B: 0.4, C: 0.18, NR: 8,
  theme: { cab: '#f1ead2', hud: '#e5dcbc', text: '#322a18', dim: 'rgba(50,42,24,.68)', line: 'rgba(50,42,24,.2)', acc: '#8a3b2a', hi: '#3d6b8a', meter: '#6d8a3a', inv: '#faf6e8' },
  intro: {
    hook: 'You are a Belding’s ground squirrel. A hawk is coming. If you whistle, the squirrels around you dive for their burrows — but the hawk notices you. Who is near you matters: some are family, some are strangers.',
    how: 'Level 1: for each attack, choose Call or Stay silent before the hawk arrives. Level 2: you are a young bird each spring, choosing whether to breed on your own or help your parents raise more young.',
    goal: 'One star per level for choices that match what best spreads your genes: at least 7 of 8 in each. The hawk comes faster each time.'
  },
  real: 'Paul Sherman (1977) found that Belding’s ground squirrels calling at predators were mostly females surrounded by female relatives, while males, who move away from their birthplace, rarely called. W. D. Hamilton (1964) had explained why: genes for helping spread if the benefit to relatives, weighted by how related they are, exceeds the cost to the helper. The same arithmetic explains helpers at the nest. When Jan Komdeur (1992) moved Seychelles warblers to islands with empty territories, young birds that would have stayed home as helpers left to breed on their own.',
  maths: 'Hamilton’s rule: help when r × B > C, where r is relatedness, B the benefit to the relative and C the cost to you, all in offspring. Here calling cuts each neighbour’s risk of being caught by 0.4 and adds to your own, so calling pays when the neighbours’ relatedness, added up, is more than your cost ÷ 0.4. The same neighbours can justify a cheap call but not a costly one, and no number of strangers justifies any. A full sibling shares half your genes by descent, on average, the same as your own offspring, so raising siblings is worth as much as raising young of your own, gene for gene.',
  ideas: [
    '<p>Your genes are also in your relatives. A sister shares half of them on average (r = ½), a cousin one eighth, a stranger none beyond the population average.</p><p>Calling costs you something: risk. It saves your neighbours. It pays when <b>the relatedness around you, added up</b>, times the risk you save them, beats your own extra risk.</p>',
    '<p>Your own young share half your genes. So do your full brothers and sisters. Raising either is worth the same to your genes.</p><p>So the question each spring is practical: where can you raise more? A good territory of your own, or your parents’ nest? And watch whether this year’s nestlings are full siblings or half-siblings.</p>'
  ],
  ROUNDS: [['sister', 'sister'], ['stranger', 'stranger', 'stranger', 'stranger'], ['cousin', 'cousin'], ['daughter', 'stranger', 'stranger'], ['cousin', 'cousin', 'cousin', 'cousin', 'cousin'], ['half-sister'], ['mother', 'niece'], ['stranger', 'stranger', 'stranger', 'cousin'], ['niece', 'niece'], ['half-sister', 'cousin'], ['sister', 'stranger', 'stranger', 'stranger'], ['cousin', 'cousin', 'cousin']],
  YEARS: [{ vac: false, q: 0.1, sib: 'full' }, { vac: true, q: 0.8, sib: 'full' }, { vac: false, q: 0.15, sib: 'half' }, { vac: true, q: 0.35, sib: 'half' }, { vac: true, q: 0.3, sib: 'full' }, { vac: true, q: 0.6, sib: 'full' }, { vac: false, q: 0.05, sib: 'none' }, { vac: true, q: 0.25, sib: 'half' }],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() {
    this.i = 0; this.right = 0; this.log = []; this.anim = null;
    if (this.lv === 0) { this.order = shuffle(this.ROUNDS.slice()).slice(0, this.NR); HUD.set('<div class="hud-goal"><span><b>Level 1: The hawk</b></span><b id="al-k"></b></div><div class="hud-line" id="al-st"></div><div class="hud-row"><button class="btn" id="al-s">Stay silent</button><button class="btn primary" id="al-c">Call</button></div>'); $('al-s').onclick = () => this.choose(0); $('al-c').onclick = () => this.choose(1); }
    else { HUD.set('<div class="hud-goal"><span><b>Level 2: Help or breed</b></span><b id="al-k"></b></div><div class="hud-line" id="al-st"></div><div class="hud-row"><button class="btn" id="al-s">Help at home</button><button class="btn primary" id="al-c">Breed on my own</button></div>'); $('al-s').onclick = () => this.choose(0); $('al-c').onclick = () => this.choose(1); }
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; this.round();
  },
  round() { this.t = 0; this.decided = false; this.pos = []; if (this.lv === 0) { const nb = this.order[this.i]; nb.forEach((r, k) => { const a = k / nb.length * TAU + 0.4; this.pos.push({ rel: r, a, d: 0.23 + (k % 2) * 0.07 }); }); } this.upd(); },
  sumR() { return this.order[this.i].reduce((a, r) => a + REL[r], 0); },
  yearVals() { const Y = this.YEARS[this.i], own = 3 * Y.q * 0.5, help = Y.sib === 'none' ? 0 : 1.2 * (Y.sib === 'full' ? 0.5 : 0.25); return { own, help }; },
  upd() {
    const n = 8; $('al-k').textContent = (this.lv === 0 ? 'attack ' : 'spring ') + Math.min(this.i + 1, n) + ' of ' + n;
    if (this.lv === 0) HUD.line('al-st', this.decided ? '' : 'Near you: ' + this.order[this.i].map(r => '<b>' + r + '</b>').join(', ') + '. The hawk arrives in ' + Math.max(0, this.lim() - this.t).toFixed(1) + ' s.');
    else { const Y = this.YEARS[this.i]; HUD.line('al-st', this.decided ? '' : (Y.vac ? 'A territory is free. Its quality: <b>' + pct(Y.q) + '</b>.' : 'No good territory is free; you could only squat on a poor patch (<b>' + pct(Y.q) + '</b>).') + ' ' + (Y.sib === 'full' ? 'Your parents are nesting together again: the nestlings would be <b>full siblings</b>.' : Y.sib === 'half' ? 'Your mother has a new mate: the nestlings would be <b>half-siblings</b>.' : 'Your parents did not survive the winter: there is <b>no nest to help at</b>.')); }
    $('al-s').disabled = $('al-c').disabled = this.decided;
  },
  choose(a) {
    if (this.decided) return; this.decided = true;
    if (this.lv === 0) { const g = this.sumR() * this.B - this.C, best = g > 0 ? 1 : 0; if (a === best) this.right++; this.log.push({ nb: this.order[this.i], sum: this.sumR(), a, best, g }); this.anim = { t: 0, a }; a ? Snd.chime() : Snd.click(); }
    else { const v = this.yearVals(), best = v.own > v.help ? 1 : 0; if (a === best) this.right++; this.log.push({ y: this.YEARS[this.i], a, best, v }); this.anim = { t: 0, a }; Snd.click(); }
    this.upd();
  },
  update(dt) {
    if (!this.decided && this.lv === 0) { this.t += dt; if (this.t >= this.lim()) this.choose(0); else if (((this.t * 10) | 0) % 3 === 0) this.upd(); }
    if (this.anim) { this.anim.t += dt; if (this.anim.t > (this.lv === 0 ? 1.8 : 1.4)) { this.anim = null; this.i++; if (this.i >= 8) this.endLevel(); else this.round(); } }
  },
  lim() { return Math.max(1.8, 3.0 - 0.18 * this.i);
  },
  endLevel() {
    const pass = this.right >= 7;
    const note = this.lv === 0 ? 'You made the gene-spreading choice in ' + this.right + ' of 8 attacks. Calling paid whenever the relatedness around you added up to more than 0.45 — two sisters, or five cousins, but never a crowd of strangers.' : 'You chose well in ' + this.right + ' of 8 springs. Helping won when you had no good territory and the nestlings were full siblings; breeding won with a good territory, or when the nestlings were only half-siblings.';
    this.res.push({ lv: this.lv, pass, note, right: this.right }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 2) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const s = this.res.filter(r => r.pass).length, stars = s === 2 ? 3 : s; End.show(this, { stars, title: 'Your genes, counted in relatives', insight: 'A gene for helping spreads if the help lands on others likely to carry it. ' + this.res.map(r => r.note).join(' ') + ' That is Hamilton’s rule, r × B > C, and it explains alarm calls, helpers at the nest, and why most altruism in nature is aimed at family.', leg: legP([['#6d8a3a', 'call paid off'], ['#8a3b2a', 'call cost more than it saved']]), chart: cv => this.chart(cv), cap: 'Level 1: relatedness around you in each attack. The dashed line is where calling starts to pay.' }); }
  },
  squirrel(c, x, y, s, col, up) { c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.beginPath(); c.ellipse(0, 0, 7, up ? 11 : 8, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, up ? -12 : -9, 5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(-7, 6, 3, 7, 0.6, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(2, up ? -13 : -10, 1.2, 0, TAU); c.fill(); c.restore(); },
  draw(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#dbe7ee'); g.addColorStop(0.35, '#eee7cb'); g.addColorStop(1, '#c8b77f'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(90,110,50,.35)'; for (let i = 0; i < 90; i++) { const x = (i * 43) % w, y = h * 0.38 + (i * 29) % (h * 0.6); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2, y - 7); c.stroke(); }
    const cx = w / 2, cy = h * 0.62, s = clamp(w / 360, 0.9, 1.4);
    if (this.lv === 0) {
      const A = this.anim, called = A && A.a;
      for (const p of this.pos) { const x = cx + Math.cos(p.a) * p.d * w, y = cy + Math.sin(p.a) * p.d * h * 0.5, hide = called && A.t > 0.4; if (!hide) this.squirrel(c, x, y, s, '#b58a55', false); else { c.fillStyle = '#5a4630'; c.beginPath(); c.ellipse(x, y + 6, 8, 3, 0, 0, TAU); c.fill(); } const r = REL[p.rel]; ink(c, p.rel, x, y + 24 * s, 11, '#322a18', 'center', 'b', 600); ink(c, r ? 'r = ' + (r === 0.5 ? '½' : r === 0.25 ? '¼' : '⅛') : 'r = 0', x, y + 36 * s, 10, 'rgba(50,42,24,.7)', 'center', 'm'); }
      this.squirrel(c, cx, cy, s * 1.3, '#c9913f', !!called); ink(c, 'you', cx, cy + 30 * s, 13, '#8a3b2a', 'center', 'd', 600);
      if (called && A.t < 1) { c.strokeStyle = 'rgba(138,59,42,' + (1 - A.t) + ')'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(cx, cy - 20, 14 + k * 12 + A.t * 40, -2.4, -0.7); c.stroke(); } }
      const hk = this.decided ? 1 : this.t / this.lim(), hx = lerp(-40, cx, hk), hy = lerp(h * 0.12, cy - 70, hk * hk);
      c.fillStyle = 'rgba(40,30,20,.85)'; c.beginPath(); c.moveTo(hx - 26, hy); c.quadraticCurveTo(hx, hy - 12, hx + 26, hy); c.quadraticCurveTo(hx, hy + 6, hx - 26, hy); c.fill(); c.beginPath(); c.moveTo(hx + 4, hy - 2); c.lineTo(hx + 14, hy + 4); c.lineTo(hx + 4, hy + 5); c.fill();
      if (A && A.t > 0.9) { const L = last(this.log); ink(c, L.a === L.best ? 'good call for your genes' : 'your genes lost out', cx, h * 0.18, 16, L.a === L.best ? '#4f6d2a' : '#8a3b2a', 'center', 'd', 600); ink(c, 'relatedness nearby adds up to ' + L.sum.toFixed(3).replace(/0+$/, '').replace(/\.$/, ''), cx, h * 0.18 + 20, 12, '#322a18', 'center', 'b', 'italic'); }
    } else {
      const Y = this.YEARS[Math.min(this.i, 7)];
      c.fillStyle = '#6b4a2a'; c.fillRect(w * 0.22 - 5, h * 0.3, 10, h * 0.6); c.fillStyle = '#5a7d3a'; c.beginPath(); c.arc(w * 0.22, h * 0.28, 50, 0, TAU); c.fill();
      c.fillStyle = '#8a6a3a'; c.beginPath(); c.ellipse(w * 0.22, h * 0.36, 20, 8, 0, 0, TAU); c.fill(); ink(c, 'your parents’ nest', w * 0.22, h * 0.36 + 72, 12, '#322a18', 'center', 'b', 'italic');
      if (Y.sib !== 'none') for (let k = 0; k < 3; k++) { c.fillStyle = Y.sib === 'full' ? '#e3b34a' : '#c9b89a'; c.beginPath(); c.arc(w * 0.22 - 10 + k * 10, h * 0.34, 4, 0, TAU); c.fill(); }
      c.fillStyle = '#6b4a2a'; c.fillRect(w * 0.76 - 4, h * 0.36, 8, h * 0.54); c.fillStyle = Y.vac ? css(mix([150, 150, 110], [60, 130, 50], Y.q)) : 'rgba(120,110,90,.5)'; c.beginPath(); c.arc(w * 0.76, h * 0.33, 40, 0, TAU); c.fill();
      ink(c, Y.vac ? 'free territory' : 'poor patch', w * 0.76, h * 0.33 + 64, 12, '#322a18', 'center', 'b', 'italic');
      const A = this.anim; if (A && A.t > 0.4) { const L = last(this.log); ink(c, 'own young: ' + L.v.own.toFixed(2) + '   siblings: ' + L.v.help.toFixed(2), w / 2, h * 0.1, 13, '#322a18', 'center', 'm'); ink(c, L.a === L.best ? 'the better choice for your genes' : 'the other choice would have spread more of your genes', w / 2, h * 0.1 + 20, 13, L.a === L.best ? '#4f6d2a' : '#8a3b2a', 'center', 'b', 600); }
      this.squirrel(c, w * 0.5, h * 0.72, s * 1.2, '#7a8a9a', false); ink(c, 'you', w * 0.5, h * 0.72 + 28, 13, '#8a3b2a', 'center', 'd', 600);
    }
  },
  notes() {
    const rows = [];
    if (this.lv === 0 && this.order) { const s = this.sumR(); rows.push(['Relatedness around you', s.toFixed(3).replace(/0+$/, '').replace(/\.$/, ''), 'Sister, mother, daughter ½; half-sister, niece ¼; cousin ⅛; stranger 0.'], ['Genes saved by calling', (s * this.B).toFixed(3), 'Relatedness × 0.4, the risk each neighbour avoids.'], ['Genes risked by calling', this.C + '', 'Your own extra risk.'], ['Correct so far', this.right + ' of ' + this.log.length, '']); }
    if (this.lv === 1) { const v = this.yearVals(); rows.push(['Own young (in gene units)', v.own.toFixed(2), 'Territory quality × 3 young × ½ relatedness.'], ['Extra siblings (in gene units)', v.help.toFixed(2), '1.2 extra nestlings × relatedness (½ full, ¼ half).'], ['Correct so far', this.right + ' of ' + this.log.length, '']); }
    return { idea: this.ideas[Math.min(1, this.lv)], stats: rows, charts: [] };
  }
};
CH_ALARM_V1.endLevel = (function (orig) { return function () { if (this.lv === 0) this.l1 = this.log.map(l => l.sum); return orig.call(this); }; })(CH_ALARM_V1.endLevel);
CH_ALARM_V1.chart = function (cv) { const d = this.l1 || []; barChart(cv, { groups: d.map((v, i) => ({ label: '' + (i + 1), parts: [{ v, c: v > 0.45 ? '#6d8a3a' : '#8a3b2a' }] })) }); };
