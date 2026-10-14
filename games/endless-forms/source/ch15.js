/* ================= Chapter: Blood Debts (reciprocal altruism) ================= */
const BATN = ['Ada', 'Bo', 'Cy', 'Dee', 'Eli', 'Fay', 'Gus', 'Hal'];
const CH_BATS = {
  id: 'bats', NIGHTS: 16,
  theme: { cab: '#14121c', hud: '#1e1b28', text: '#ece6f2', dim: 'rgba(236,230,242,.66)', line: 'rgba(236,230,242,.16)', acc: '#b0303a', hi: '#e0b870', meter: '#c4707e', inv: '#14121c' },
  intro: {
    hook: 'Vampire bats that miss two nights of blood can starve. Roost-mates who fed well can save them by regurgitating a meal — and a meal is worth far more to a starving bat than it costs a full one. You are a bat in a roost of eight, and you will not always find food.',
    how: 'Each night, hungry roost-mates may beg from you: share or refuse. When you fail to feed, you beg from them, and they remember how you treated them. Some share with anyone, some with those who shared, some with no one. Nobody wears a label.',
    goal: 'Survive sixteen nights in each level. A third star for being a true reciprocator: feeding bats that help at least six times, and cheats no more than three.'
  },
  real: 'Gerald Wilkinson (1984) found that vampire bats regurgitate blood to hungry roost-mates, and that bats were more likely to feed those who had fed them. Later experiments by Gerald Carter and Wilkinson (2013) showed that past help received predicted sharing better than relatedness did, and that bats with more sharing partners coped better when one was removed. Robert Axelrod and W. D. Hamilton (1981) showed that simple reciprocity — tit for tat — can resist exploitation in repeated interactions. When mistakes happen, strict tit for tat locks into cycles of retaliation; a strategy that sometimes forgives does better (Nowak and Sigmund 1992).',
  maths: 'Here a hunt fails 35% of the time, a failed night costs 30 hours of reserves, and a bat dies at zero; a successful hunt restores 60. Sharing costs the donor 6 hours but gives the recipient 24, because blood is worth most to the hungriest. That asymmetry is what makes reciprocity pay: if help given now is returned later, both partners gain far more than they spend. Cheats gain by taking without giving, unless others stop giving to them. In level 2, a bat that intends to help fails 20% of the time when its own reserves are low, so a refusal is not always a betrayal.',
  ideas: ['<p>Blood is cheap to give when you are full and priceless when you are starving. That makes swapping help worthwhile — if the favour is returned.</p><p>The roost is watching: bats help those who have fed them, and those with a good record of sharing. Turning away a known cheat does not count against you.</p><p>Watch who helps you when you beg. The Numbers tab keeps a ledger of every exchange.</p>', '<p>Now even willing partners sometimes cannot help: they are starving themselves. If you punish every refusal, you may cut off a friend who would have helped next time. If you never punish, cheats feed on you.</p>'],
  start() { this.lv = 0; this.res = []; this.wasted = 0; this.good = 0; this.beginLevel(); },
  beginLevel() {
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; const strat = shuffle(['recip', 'recip', 'recip', 'cheat', 'cheat', 'gener', 'grudge']);
    this.bats = BATN.slice(0, 7).map((n, i) => ({ n, s: strat[i], h: 48, alive: true, gaveMe: 0, iGave: 0, iRefused: 0, refusedMe: 0, x: 0.12 + (i % 4) * 0.25, y: 0.2 + ((i / 4) | 0) * 0.28 }));
    this.me = { h: 48, alive: true }; this.night = 0; this.queue = []; this.msg = ''; this.phase = 'ready'; this.fedTonight = true;
    HUD.set('<div class="hud-goal"><span><b>' + (this.lv ? 'Level 2: Honest mistakes' : 'Level 1: The roost') + '</b></span><b id="bt-n"></b></div><div class="meter"><i id="bt-h" style="background:#b0303a"></i></div><div class="hud-line" id="bt-st"></div><div class="hud-row" id="bt-row"></div>');
    this.upd();
  },
  noise() { return this.lv === 1 ? 0.2 : 0; },
  willing(b, toMe) {
    if (!b.alive || b.h < 24) return false; if (b.s === 'cheat') return false; if (b.s === 'gener') return true; if (b.s === 'grudge') return b.iRefused === 0;
    const asks = this.bats.reduce((a, o) => a + (o.s === 'cheat' ? 0 : o.iGave + o.iRefused), 0), gives = this.bats.reduce((a, o) => a + (o.s === 'cheat' ? 0 : o.iGave), 0), standing = asks ? gives / asks : null;
    const ok = b.iGave > 0 && b.iGave >= b.iRefused || (standing != null && standing >= 0.5) || (standing == null && R() < 0.25); return ok && !(b.h < 40 && R() < this.noise() * 2.5);
  },
  PF: 0.35, NC: 30, DC: 6, DG: 24,
  nightStart() {
    if (this.phase !== 'ready') return; this.night++; this.msg = ''; this.genUsed = false;
    for (const b of this.bats) if (b.alive) { if (R() > this.PF) b.h = 60; else b.h -= this.NC; }
    this.fedTonight = R() > this.PF; if (this.fedTonight) this.me.h = 60; else this.me.h -= this.NC;
    for (const b of shuffle(this.bats.filter(x => x.alive && x.h < 30))) { if (R() < 0.5) continue; const d = shuffle(this.bats.filter(o => o !== b && o.alive && o.h >= 36 && ((o.s === 'gener' && !this.genUsed) || (o.s === 'recip' || o.s === 'grudge') && b.s !== 'cheat')))[0]; if (d) { if (d.s === 'gener') this.genUsed = true; d.h -= this.DC; b.h += this.DG; } }
    this.queue = shuffle(this.bats.filter(b => b.alive && b.h < 30)).slice(0, 2);
    if (!this.fedTonight) { const donors = shuffle(this.bats.filter(b => this.willing(b) && !(b.s === 'gener' && this.genUsed))).slice(0, 2); for (const d of donors) { d.h -= this.DC; this.me.h += this.DG; d.gaveMe++; } for (const b of this.bats) if (b.alive && !donors.includes(b)) b.refusedMe++; this.msg = donors.length ? 'You failed to feed. <b>' + donors.map(d => d.n).join('</b> and <b>') + '</b> shared with you.' : 'You failed to feed, and nobody shared with you.'; }
    else this.msg = 'You fed well tonight.';
    this.phase = this.queue.length ? 'ask' : 'end'; Snd.dawn(); this.check(); this.upd();
  },
  decide(share) {
    const b = this.queue.shift(); if (!b) return;
    if (share) { this.me.h -= this.DC; b.h += this.DG; b.iGave++; if (b.s === 'cheat') this.wasted++; else this.good++; Snd.chime(); this.msg = 'You shared with ' + b.n + '.'; } else { b.iRefused++; Snd.click(); this.msg = 'You refused ' + b.n + '.'; }
    if (!this.queue.length) this.phase = 'end'; this.check(); this.upd();
  },
  check() {
    for (const b of this.bats) if (b.alive && b.h <= 0) { b.alive = false; toast(b.n + ' starved.'); }
    if (this.me.h <= 0) { this.me.alive = false; this.phase = 'over'; this.finishLevel(false); return; }
    if (this.phase === 'end') { this.phase = 'ready'; if (this.night >= this.NIGHTS) { this.phase = 'over'; this.finishLevel(true); } }
  },
  upd() {
    $('bt-n').textContent = 'night ' + this.night + ' of ' + this.NIGHTS; $('bt-h').style.width = pct(clamp(this.me.h / 60, 0, 1)); const row = $('bt-row'); if (!row) return;
    const b = this.queue[0]; let line = this.msg + ' Your reserves: <b>' + Math.max(0, this.me.h) + ' hours</b>.';
    if (this.phase === 'ask' && b) { line += '<br><b>' + b.n + '</b> is starving (' + Math.max(0, b.h) + ' h left) and begs from you.'; row.innerHTML = '<button class="btn" id="bt-no">Refuse</button><button class="btn primary" id="bt-yes">Share blood</button>'; $('bt-no').onclick = () => this.decide(false); $('bt-yes').onclick = () => this.decide(true); }
    else if (this.phase === 'ready') { row.innerHTML = '<button class="btn primary" id="bt-go">Fly out to hunt</button>'; $('bt-go').onclick = () => this.nightStart(); }
    else row.innerHTML = '';
    HUD.line('bt-st', line);
  },
  finishLevel(ok) {
    const note = ok ? 'You survived ' + this.NIGHTS + ' nights' : 'You starved on night ' + this.night;
    const partners = this.bats.filter(b => b.gaveMe > 0).map(b => b.n + ' (' + { recip: 'a reciprocator', cheat: 'a cheat', gener: 'generous to all', grudge: 'a grudger' }[b.s] + ')');
    const full = note + (partners.length ? '; those who fed you: ' + partners.join(', ') + '.' : '.') + ' The cheats were ' + this.bats.filter(b => b.s === 'cheat').map(b => b.n).join(' and ') + '.';
    this.res.push({ lv: this.lv, pass: ok, note: full }); ok ? Snd.star() : Snd.miss(); this.lv++;
    setTimeout(() => {
      if (App.mode !== this) return;
      if (this.lv < 2) Cards.open({ cls: 'intro', html: '<h3>' + (ok ? 'Level passed' : 'Interesting result') + '</h3><p>' + full + '</p><h4>Level 2: Honest mistakes</h4><p>A new roost. This time, even bats that want to help will sometimes refuse, because they are too hungry themselves.</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
      else { const s = this.res.filter(r => r.pass).length, stars = s + (s === 2 && this.wasted <= 3 && this.good >= 6 ? 1 : 0); End.show(this, { stars, title: s + ' of 2 levels survived', insight: 'Helping pays when help comes back, and blood is worth most to the hungriest bat. ' + this.res.map(r => r.note).join(' ') + ' You fed roost-mates who help ' + this.good + ' time' + (this.good === 1 ? '' : 's') + ' and cheats ' + this.wasted + ' time' + (this.wasted === 1 ? '' : 's') + '. Reciprocity works by remembering; under noise, it works best when it also forgives.' }); }
    }, 900);
  },
  update() { },
  draw(c, w, h) {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0e0c14'); g.addColorStop(1, '#221d2c'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = '#2a2433'; c.beginPath(); c.moveTo(0, 0); for (let x = 0; x <= w; x += 20) c.lineTo(x, 22 + Math.sin(x * 0.07) * 10 + (x % 60 === 0 ? 14 : 0)); c.lineTo(w, 0); c.fill();
    const s = clamp(w / 380, 0.9, 1.3), bat = (x, y, col, hung, lab, hrs, dead) => { c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = dead ? 0.25 : 1; c.fillStyle = col; c.beginPath(); c.ellipse(0, 6, 6, 9, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(-16, 8 + (hung ? 4 : 0), -8, 18); c.lineTo(-4, 10); c.fill(); c.beginPath(); c.moveTo(5, 0); c.quadraticCurveTo(16, 8 + (hung ? 4 : 0), 8, 18); c.lineTo(4, 10); c.fill(); c.beginPath(); c.moveTo(-3, 15); c.lineTo(-5, 19); c.lineTo(-1, 16); c.moveTo(3, 15); c.lineTo(5, 19); c.lineTo(1, 16); c.fill(); c.fillStyle = '#ff6060'; c.beginPath(); c.arc(-2, 11, 0.9, 0, TAU); c.arc(2, 11, 0.9, 0, TAU); c.fill(); c.restore(); c.globalAlpha = 1; c.strokeStyle = 'rgba(236,230,242,.25)'; c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, 28); c.stroke(); ink(c, lab, x, y + 38 * s, 12, dead ? 'rgba(236,230,242,.4)' : '#ece6f2', 'center', 'b', 600); if (!dead) { const k = clamp(hrs / 60, 0, 1); c.fillStyle = 'rgba(236,230,242,.15)'; c.fillRect(x - 14, y + 44 * s, 28, 4); c.fillStyle = k < 0.4 ? '#e05050' : '#b0303a'; c.fillRect(x - 14, y + 44 * s, 28 * k, 4); } };
    for (const b of this.bats) { const asking = this.phase === 'ask' && this.queue[0] === b; bat(b.x * w, b.y * h + 40, asking ? '#8a5a6a' : '#5a4a62', asking, b.n, b.h, !b.alive); if (asking) ink(c, 'begging you', b.x * w, b.y * h + 22, 11, '#e0b870', 'center', 'b', 'italic'); }
    bat(w / 2, h * 0.78, '#8a3a44', !this.fedTonight, 'you', this.me.h, !this.me.alive);
  },
  notes() {
    const rows = this.bats.map(b => [b.n + (b.alive ? '' : ' (dead)'), 'fed you ' + b.gaveMe + ', refused you ' + b.refusedMe, 'You shared with ' + b.n + ' ' + b.iGave + ' time' + (b.iGave === 1 ? '' : 's') + ' and refused ' + b.iRefused + '. Reserves ' + Math.max(0, b.h) + ' h.']);
    return { idea: this.ideas[Math.min(1, this.lv)], stats: rows, charts: [] };
  }
};
