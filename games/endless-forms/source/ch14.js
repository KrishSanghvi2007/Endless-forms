/* ================= Chapter: The Pathogen (evolution of virulence) ================= */
const CH_PATHO = {
  id: 'virulence',
  theme: { cab: '#241a1c', hud: '#2e2224', text: '#f1e6e4', dim: 'rgba(241,230,228,.66)', line: 'rgba(241,230,228,.16)', acc: '#d0573f', hi: '#e8b44a', meter: '#7fb3a8', inv: '#241a1c' },
  intro: {
    hook: 'Virus strains differ in how fast they replicate inside a host. A fast strain is shed more and is harder to clear, but it kills its host sooner — and a dead host infects no one. Each season you pick the strain. Which one spreads best?',
    how: 'Each season, set the strain’s replication rate with the slider and release it into the warren. You see how many new infections each case causes (R₀). The world changes every season.',
    goal: 'Two levels of two seasons each. A star for each level where you reach 90% of the best possible, and a third for 97% in both.'
  },
  real: 'Myxoma virus was released in Australia in 1950 to control rabbits. The original strain killed more than 99% of infected rabbits; within a few years the commonest field strains were somewhat less lethal, because rabbits that died within days passed on less virus than rabbits that lived for weeks with mosquito-bitten lesions (Fenner and Ratcliffe 1965). Rabbits then evolved resistance, and the virus responded: later strains became more virulent again, some suppressing the rabbit immune system (Kerr et al. 2017). Paul Ewald argued that selection should favour more harmful strains in pathogens carried by vectors or water, since immobile hosts still transmit them. The evidence is mixed, and a vector removes only the cost of an immobile host, not of a dead one: myxoma, carried by mosquitoes, still evolved down from its release strain because mosquitoes bite only living rabbits, although its field strains stayed highly lethal. When several strains share a host, the fastest-replicating strain usually wins within it, pushing virulence up. The trade-off behind all this is well supported in only a few systems, myxoma and HIV among them, and is still debated (Alizon et al. 2009).',
  maths: 'R₀ = β(v) ÷ (μ + α(v) + γ(v)): transmission per day, divided by the rate at which infections end through natural death μ, death from the disease α, or recovery γ. Replicating faster (v) raises transmission with diminishing returns, but raises disease death steeply (α ∝ v²), so R₀ peaks at an intermediate v. Stronger host immunity (bigger γ) is best countered by replicating faster. If sick hosts stop moving, transmission falls as v rises; a mosquito removes that penalty. With co-infection, a strain’s share of a shared host is v ÷ (v + v_rival), which rewards replicating faster than would be best alone. The best rate shown is the best reply to a rival at the solo optimum; if every strain played it, the evolutionarily stable rate would be a little higher still. In nature co-infection does not always raise virulence: where strains share secreted products, it can lower it (Brown, Hochberg and Grenfell 2002).',
  ideas: ['<p>A slow strain lets its host live long, but it is barely shed and easily cleared. A fast strain is shed a lot and is harder to clear — but only briefly, before the host dies.</p><p>The best rate is the one that maximises the number of new infections per infection, R₀. It depends on how the host fights back.</p>', '<p>Now two new twists. When mosquitoes carry the virus, a bed-ridden rabbit infects as well as a healthy one, as long as it is alive. And when a rabbit carries two strains at once, the faster strain takes most of the shared host.</p>'],
  SEAS: [{ name: 'A new virus in the warren', g: 0.6, vec: false, co: 0 }, { name: 'The rabbits evolve resistance', g: 1.6, vec: false, co: 0 }, { name: 'Carried by mosquitoes', g: 1.0, vec: true, co: 0 }, { name: 'Crowded warrens: double infections', g: 1.0, vec: false, co: 0.6 }],
  b: 4, k: 0.4, a: 1.2, mu: 0.1,
  parts(v, S) { const beta = this.b * v / (v + this.k) * (S.vec ? 1 : 1 - 0.5 * v), alpha = this.a * v * v, gam = S.g / (1 + 2 * v); return { beta, alpha, gam, R0: beta / (this.mu + alpha + gam) }; },
  fit(v, S) { const R0 = this.parts(v, S).R0; if (!S.co) return R0; const vr = this.bestV({ g: S.g, vec: S.vec, co: 0 })[0]; return R0 * ((1 - S.co) + S.co * 2 * v / (v + vr)); },
  bestV(S) { let bv = 0, bf = -1; for (let v = 0.01; v <= 1.0001; v += 0.01) { const f = this.fit(v, S); if (f > bf) { bf = f; bv = v; } } return [bv, bf]; },
  start() { this.lv = 0; this.res = []; this.si = 0; this.v = 0.5; this.log = []; this.beginLevel(); },
  beginLevel() { $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; this.si = this.lv * 2; this.newSeason(); },
  newSeason() {
    const S = this.SEAS[this.si]; this.sim = null;
    HUD.set('<div class="hud-goal"><span><b>' + S.name + '</b></span><b id="pa-s">season ' + (this.si + 1) + ' of 4</b></div><div class="slider-row"><span>slow</span><input type="range" id="pa-v" min="1" max="100" step="1" aria-label="Replication rate"><span>fast</span></div><div class="hud-line" id="pa-st"></div><div class="hud-row"><button class="btn primary" id="pa-go">Release</button></div>');
    const sl = $('pa-v'); sl.value = Math.round(this.v * 100); sl.oninput = () => { this.v = +sl.value / 100; this.upd(); }; $('pa-go').onclick = () => this.release(); this.upd();
  },
  upd() { const S = this.SEAS[this.si], P = this.parts(this.v, S); HUD.line('pa-st', this.sim && this.sim.msg ? this.sim.msg : 'Replication <b>' + Math.round(this.v * 100) + '%</b>: a host sheds this strain at ' + P.beta.toFixed(2) + ' new infections a day and stays infectious for about <b>' + (1 / (this.mu + P.alpha + P.gam)).toFixed(1) + ' days</b>.' + (S.co ? ' Most rabbits also carry a rival strain.' : '')); $('pa-go').disabled = !!this.sim; $('pa-v').disabled = !!this.sim; },
  release() {
    if (this.sim) return; const S = this.SEAS[this.si], P = this.parts(this.v, S), f = this.fit(this.v, S), [bv, bf] = this.bestV(S); this.log.push({ si: this.si, v: this.v, f, bv, bf, R0: P.R0 });
    const N = 140, pop = []; for (let i = 0; i < N; i++) pop.push({ st: i < 3 ? 'I' : 'S', x: R(), y: R(), d: 0 });
    this.sim = { t: 0, day: 0, pop, beta: P.beta * (S.co ? f / P.R0 : 1), end: this.mu + P.alpha + P.gam, dieF: (this.mu + P.alpha) / (this.mu + P.alpha + P.gam), msg: null, hist: [] }; Snd.flood(); this.upd();
  },
  update(dt) {
    const Sm = this.sim; if (!Sm || Sm.msg) return; Sm.t += dt; if (Sm.t < 0.12) return; Sm.t = 0; Sm.day++;
    const I = Sm.pop.filter(x => x.st === 'I').length, Sn = Sm.pop.filter(x => x.st === 'S'), N = Sm.pop.length, pInf = 1 - Math.exp(-Sm.beta * I / N);
    for (const x of Sn) if (R() < pInf) x.st = 'I2'; for (const x of Sm.pop) { if (x.st === 'I' && R() < Sm.end) x.st = R() < Sm.dieF ? 'D' : 'Rc'; } for (const x of Sm.pop) if (x.st === 'I2') x.st = 'I';
    Sm.hist.push(Sm.pop.filter(x => x.st === 'I').length);
    if (!Sm.pop.some(x => x.st === 'I') || Sm.day >= 60) {
      const L = last(this.log), dead = Sm.pop.filter(x => x.st === 'D').length, eff = L.f / L.bf; L.eff = eff;
      Sm.msg = 'R₀ = <b>' + L.R0.toFixed(2) + '</b>' + (this.SEAS[this.si].co ? ' (the strain’s fitness with rivals ' + L.f.toFixed(2) + ')' : '') + '. The epidemic infected ' + (N - Sm.pop.filter(x => x.st === 'S').length) + ' of ' + N + ' rabbits and killed ' + dead + '. The best replication here was about <b>' + Math.round(L.bv * 100) + '%</b>: you reached ' + pct(Math.min(1, eff)) + ' of its fitness.';
      eff > 0.95 ? Snd.chime() : Snd.miss(); this.upd();
      setTimeout(() => { if (App.mode !== this) return; this.si++; this.sim = null; if (this.si % 2 === 0) this.endLevel(); else this.newSeason(); }, 3200);
    }
  },
  endLevel() {
    const L = this.log.filter(l => Math.floor(l.si / 2) === this.lv), eff = mean(L.map(l => Math.min(1, l.eff || 0))), pass = eff >= 0.9, great = eff >= 0.97;
    const note = this.lv === 0 ? 'Early on the best strain replicated at about ' + Math.round(L[0].bv * 100) + '%; once rabbits fought back harder, faster replication paid (' + Math.round(L[1].bv * 100) + '%). Neither the gentlest nor the deadliest strain spreads best.' : 'With mosquitoes, a sick rabbit still infects, so the best rate rose to about ' + Math.round(L[0].bv * 100) + '%. With double infections, strains compete inside each rabbit and the best rose to about ' + Math.round(L[1].bv * 100) + '% — more harmful than the rate that would maximise R₀.';
    this.res.push({ lv: this.lv, eff, pass, great, note }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 2) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>You reached ' + pct(eff) + ' of the best possible.</p><p>' + note + '</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const s = this.res.filter(r => r.pass).length, stars = s + (this.res.every(r => r.great) ? 1 : 0); End.show(this, { stars, title: s + ' of 2 levels', insight: 'Virulence is not a pathogen’s goal but a side effect of how it spreads. ' + this.res.map(r => r.note).join(' '), leg: legP([['#d0573f', 'your replication rate'], ['#7fb3a8', 'best']]), chart: cv => barChart(cv, { groups: this.log.map((l, i) => ({ label: 'season ' + (i + 1), parts: [{ v: l.v, c: '#d0573f' }] })) }), cap: 'Your replication rate each season. Best: ' + this.log.map(l => Math.round(l.bv * 100) + '%').join(', ') + '.' }); }
  },
  draw(c, w, h) {
    const S = this.SEAS[Math.min(this.si, 3)], g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5a6a3a'); g.addColorStop(1, '#3f4a2a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rng(7); c.fillStyle = 'rgba(200,190,120,.12)'; for (let i = 0; i < 60; i++) { c.beginPath(); c.ellipse(r() * w, r() * h, 8, 3, r() * 3, 0, TAU); c.fill(); }
    const pop = this.sim ? this.sim.pop : null, col = { S: '#c9b48a', I: '#e04a3a', Rc: '#8fb6c8', D: 'rgba(40,30,30,.6)' };
    if (pop) for (const x of pop) { const px = 12 + x.x * (w - 24), py = 12 + x.y * (h * 0.7 - 24) + (x.st === 'I' ? Math.sin(App.t * 8 + x.x * 40) * 1.5 : 0); c.fillStyle = col[x.st]; c.beginPath(); c.ellipse(px, py, 5, 3.5, 0, 0, TAU); c.fill(); if (x.st !== 'D') { c.beginPath(); c.ellipse(px - 3, py - 4, 1.2, 3, -0.3, 0, TAU); c.ellipse(px - 1, py - 4, 1.2, 3, 0.2, 0, TAU); c.fill(); } }
    else ink(c, 'the warren waits', w / 2, h * 0.35, 14, 'rgba(241,230,228,.6)', 'center', 'b', 'italic');
    if (S.vec) { c.fillStyle = 'rgba(20,20,20,.7)'; for (let i = 0; i < 12; i++) { const mx = (i * 83 + App.t * 30) % w, my = (i * 37) % (h * 0.6) + Math.sin(App.t * 5 + i) * 6; c.beginPath(); c.arc(mx, my, 1.5, 0, TAU); c.fill(); } }
    const y0 = h - 14, gh = h * 0.24, xs = w - 40; c.strokeStyle = 'rgba(241,230,228,.3)'; c.beginPath(); c.moveTo(20, y0); c.lineTo(20 + xs, y0); c.stroke();
    const vs = []; for (let v = 0.01; v <= 1; v += 0.02) vs.push([v, this.fit(v, S)]); const mx = Math.max(...vs.map(p => p[1])) || 1;
    c.strokeStyle = '#e8b44a'; c.lineWidth = 2; c.beginPath(); vs.forEach(([v, f], i) => { const x = 20 + xs * v, y = y0 - gh * f / mx; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke();
    const xv = 20 + xs * this.v; c.strokeStyle = '#d0573f'; c.lineWidth = 2; c.beginPath(); c.moveTo(xv, y0); c.lineTo(xv, y0 - gh - 4); c.stroke(); ink(c, 'you', xv, y0 - gh - 8, 11, '#d0573f', 'center', 'b', 600);
    ink(c, this.log.some(l => l.si === this.si) ? 'fitness across replication rates (revealed)' : 'replication rate: slow → fast', w / 2, y0 + 12, 10, 'rgba(241,230,228,.6)', 'center', 'b', 'italic');
    if (!this.log.some(l => l.si === this.si)) { c.fillStyle = 'rgba(46,34,36,.85)'; c.fillRect(20, y0 - gh - 2, xs, gh); ink(c, 'the fitness curve is revealed after you release', w / 2, y0 - gh / 2, 11, 'rgba(241,230,228,.55)', 'center', 'b', 'italic'); c.strokeStyle = '#d0573f'; c.beginPath(); c.moveTo(xv, y0); c.lineTo(xv, y0 - gh - 4); c.stroke(); }
  },
  notes() { const S = this.SEAS[Math.min(this.si, 3)], P = this.parts(this.v, S); return { idea: this.ideas[Math.min(1, this.lv)], stats: [['Transmission per day (β)', P.beta.toFixed(2), S.vec ? 'Mosquitoes: sick hosts transmit as well as healthy ones.' : 'Sick hosts move less, so very fast replication cuts transmission.'], ['Death from disease (α)', P.alpha.toFixed(2) + ' per day', 'Rises with the square of replication.'], ['Recovery (γ)', P.gam.toFixed(2) + ' per day', 'Host immunity; faster replication resists it.'], ['R₀', P.R0.toFixed(2), 'New infections per infection in a fully susceptible warren.']].concat(this.log.map(l => ['Season ' + (l.si + 1), Math.round(l.v * 100) + '% (best ' + Math.round(l.bv * 100) + '%)', ''])), charts: [] }; }
};
