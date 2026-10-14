/* ================= Chapter: Many Become One (origin of multicellularity) ================= */
const CH_MANY = {
  id: 'many', M: 140, DAYS: 10, T0: 2, VA: 0.25, NZ: 0.06, CO: 0.02, GOAL: 16, MU2: 0.06,
  theme: { cab: '#f0ece2', hud: '#e4ddcc', text: '#2a2418', dim: 'rgba(42,36,24,.68)', line: 'rgba(42,36,24,.2)', acc: '#c08a2a', hi: '#b0473a', meter: '#5a8a4a', inv: '#f9f6ef' },
  intro: {
    hook: 'Every animal and plant descends from single cells that began to stay together. Level 1: select yeast for sinking fast, and watch many-celled “snowflakes” evolve. Level 2: grow an organism from one cell while cheating cells try to take it over.',
    how: 'Level 1: each day, start the settling and tap Transfer when you choose; only clusters at the bottom are kept. Level 2: tap the red cheater cells to make them self-destruct — but not the healthy ones.',
    goal: 'Level 1: average cluster size of 16 cells within ten days, without losing the line. Level 2: a full-grown body with no more than 10% cheaters. A third star for level 2 with no healthy cells lost and at most 5% cheaters.'
  },
  real: 'William Ratcliff, Michael Travisano and colleagues (2012) let brewer’s yeast settle in a tube each day and transferred only the bottom of the culture. Within about sixty days, every replicate line had evolved “snowflake” clusters that form because daughter cells fail to separate; the clusters later evolved higher rates of programmed cell death, which snaps off small propagules. Being many brings a new conflict: a cell that divides without restraint can outcompete its neighbours inside the body. Cancer is one form of this, and bodies police it with apoptosis, immune surveillance and development from a single cell, which gives each generation a fresh start with every cell related (Michod 2007; Aktipis et al. 2015).',
  maths: 'Level 1: a cluster’s sinking speed grows with its size to the power 2/3 (bigger clusters have less drag per cell), but big clusters grow more slowly, because their inner cells get less food. Transferring early keeps only the fastest-sinking clusters — strong selection, but few survivors; transferring late keeps many clusters but selects weakly. Level 2: a cheater lineage doubles about twice as often as normal cells, so an unchecked cheater appearing early can make up most of a body.',
  ideas: ['<p>Each yeast lineage has a characteristic cluster size, passed to its descendants with small changes. Big clusters sink faster. Every day the culture settles, and you decide when to take the bottom.</p><p>Wait too long and you keep single cells too; move too soon and you may keep too few to recover.</p>', '<p>The body grows by cell division. Now and then a mutation makes a cell that divides twice as fast and does no work. Its descendants spread through the body unless they are removed.</p>'],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() { $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; this.lv === 0 ? this.begin1() : this.begin2(); },
  /* level 1 */
  begin1() {
    this.day = 1; this.pop = []; for (let i = 0; i < this.M; i++) this.pop.push({ g: R() < 0.9 ? 1 : 2 + ((R() * 3) | 0), x: R() }); this.phase = 'ready'; this.t = 0; this.hist = [this.meanG()]; this.msg = '';
    HUD.set('<div class="hud-goal"><span><b>Level 1: Snowflake yeast</b></span><b id="mb-d"></b></div><div class="meter"><i id="mb-m" style="background:#c08a2a"></i><em style="left:calc(50% - 1px)"></em></div><div class="hud-line" id="mb-st"></div><div class="hud-row"><button class="btn" id="mb-go">Start settling</button><button class="btn primary" id="mb-tr">Transfer now</button></div>');
    $('mb-go').onclick = () => this.settle(); $('mb-tr').onclick = () => this.transfer(); this.upd1();
  },
  meanG() { return mean(this.pop.map(c => c.g)); },
  speed(c) { return this.VA + (1 - this.VA) * Math.pow(c.g / 24, 2 / 3); },
  settle() { if (this.phase !== 'ready') return; this.phase = 'settling'; this.t = 0; this.pop.forEach(c => { c.v = this.speed(c) * (1 - this.NZ + 2 * this.NZ * R()); c.x = R(); }); Snd.flood(); this.upd1(); },
  atBottom() { return this.pop.filter(c => c.v * this.t / this.T0 >= 0.92); },
  upd1() { $('mb-d').textContent = 'day ' + Math.min(this.day, this.DAYS) + ' of ' + this.DAYS; const mg = this.meanG(); $('mb-m').style.width = pct(clamp(mg / 24, 0, 1)); HUD.line('mb-st', (this.msg ? this.msg + '<br>' : '') + 'Average cluster: <b>' + mg.toFixed(1) + ' cells</b> (goal ' + this.GOAL + ').' + (this.phase === 'settling' ? ' Clusters at the bottom: <b>' + this.atBottom().length + '</b> of ' + this.M + '.' : '')); $('mb-go').disabled = this.phase !== 'ready'; $('mb-tr').disabled = this.phase !== 'settling'; },
  transfer() {
    if (this.phase !== 'settling') return; const keep = this.atBottom(); this.phase = 'ready';
    if (keep.length < 3) { this.msg = 'Only ' + keep.length + ' cluster' + (keep.length === 1 ? '' : 's') + ' had reached the bottom: too few to restart the culture. The line is lost.'; Snd.miss(); return this.end1(false); }
    const gr = c => Math.pow(1.95 - this.CO * c.g, 5), ws = keep.map(gr), next = [];
    for (let i = 0; i < this.M; i++) { const p = keep[wpick(ws)]; let g = p.g; if (R() < 0.15) g = clamp(g + (R() < 0.65 ? 1 + ((R() * 3) | 0) : -1), 1, 24); next.push({ g, x: R() }); }
    this.pop = next; this.msg = 'Day ' + this.day + ': you kept ' + keep.length + ' of ' + this.M + ' clusters.'; this.day++; this.hist.push(this.meanG()); Snd.chime();
    if (this.meanG() >= this.GOAL) return this.end1(true); if (this.day > this.DAYS) return this.end1(false); this.upd1();
  },
  end1(pass) { this.res.push({ lv: 0, pass, note: pass ? 'Snowflakes evolved: clusters averaged ' + this.meanG().toFixed(1) + ' cells by day ' + (this.day - 1) + '.' : 'The line ' + (this.pop.length && this.day > this.DAYS ? 'stayed mostly small (' + this.meanG().toFixed(1) + ' cells).' : 'was lost.') }); if (pass) Snd.star(); this.lv++; Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + last(this.res).note + ' Selection for sinking favoured cells that stay stuck to their daughters, even though big clusters grow more slowly. How early you transferred set how hard selection pushed — and how close you came to losing everything.</p><h4>Level 2: Cheater cells</h4><p>Now grow a body from one cell. Mutations will make cheaters (red) that divide twice as fast. Tap them to trigger their self-destruction.</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] }); },
  /* level 2 */
  begin2() {
    this.cells = [{ x: 0.5, y: 0.45, ch: false, t: 0 }]; this.kills = 0; this.bad = 0; this.done2 = false; this.clock = 0;
    HUD.set('<div class="hud-goal"><span><b>Level 2: Cheater cells</b></span><b id="mb-d"></b></div><div class="meter"><i id="mb-m" style="background:#5a8a4a"></i></div><div class="hud-line" id="mb-st"></div>'); this.upd2();
  },
  upd2() { const n = this.cells.length, ch = this.cells.filter(c => c.ch).length; $('mb-d').textContent = n + ' of 96 cells'; $('mb-m').style.width = pct(clamp(n / 96, 0, 1)); HUD.line('mb-st', 'Cheaters: <b>' + ch + '</b> (' + pct(n ? ch / n : 0) + '). Cheaters removed: ' + this.kills + '. Healthy cells lost by mistake: <b>' + this.bad + '</b>.'); },
  tap(x, y) {
    if (this.lv !== 1 || this.done2) return; let bi = -1, bd = 1e9; this.cells.forEach((c, i) => { const p = this.cpos(c, Stage.w, Stage.h), d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; bi = i; } });
    if (bi < 0 || bd > 16) return; const c = this.cells[bi]; this.cells.splice(bi, 1); if (c.ch) { this.kills++; Snd.chime(); } else { this.bad++; Snd.miss(); } this.upd2();
  },
  cpos(c, w, h) { const cx = w / 2, cy = h * 0.45, s = Math.min(w, h) * 0.42; return { x: cx + (c.x - 0.5) * s * 2, y: cy + (c.y - 0.45) * s * 2 }; },
  update(dt) {
    if (this.lv === 0 && this.phase === 'settling') { this.t += dt; if (((this.t * 10) | 0) % 2 === 0) this.upd1(); if (this.t > this.T0 * 3) { this.t = this.T0 * 3; } return; }
    if (this.lv !== 1 || this.done2) return; this.clock += dt;
    for (const c of this.cells) c.t += dt * (c.ch ? 2 : 1);
    const born = []; for (const c of this.cells) if (c.t >= 1.1) { c.t = 0; if (this.cells.length + born.length >= 96) break; const a = R() * TAU, r = 0.03; const k = { x: clamp(c.x + Math.cos(a) * r, 0.05, 0.95), y: clamp(c.y + Math.sin(a) * r, 0.08, 0.82), ch: c.ch || R() < this.MU2, t: R() * 0.3 }; born.push(k); }
    this.cells.push(...born);
    for (let it = 0; it < 2; it++) for (let i = 0; i < this.cells.length; i++) for (let j = i + 1; j < this.cells.length; j++) { const a = this.cells[i], b = this.cells[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1e-4, m = 0.034; if (d < m) { const push = (m - d) / 2, ux = dx / d, uy = dy / d; a.x -= ux * push; a.y -= uy * push; b.x += ux * push; b.y += uy * push; } }
    if (born.length) this.upd2();
    if (this.cells.length >= 96 || this.clock > 40 || !this.cells.length) { this.done2 = true; const n = this.cells.length, ch = this.cells.filter(c => c.ch).length, f = n ? ch / n : 1, pass = n >= 96 && f <= 0.1, great = pass && this.bad === 0 && f <= 0.05; this.res.push({ lv: 1, pass, great, note: 'Your body reached ' + n + ' cells, ' + pct(f) + ' of them cheaters; you removed ' + this.kills + ' cheaters and lost ' + this.bad + ' healthy cells by mistake.' }); if (pass) Snd.star(); else Snd.miss(); const stars = this.res.filter(r => r.pass).length + (great ? 1 : 0); setTimeout(() => { if (App.mode !== this) return; End.show(this, { stars, title: stars + ' of 3 stars', insight: 'Multicellularity begins when selection acts on groups of cells rather than single ones — as for settling snowflakes — and it lasts only if the group can stop its own cells from cheating. ' + this.res.map(r => r.note).join(' ') + ' Starting each generation from a single cell helps too: every cell in the body is then a clone, and a cheater lineage cannot pass into the next generation’s body unless it becomes the germ line.' }); }, 700); }
  },
  draw(c, w, h) {
    c.fillStyle = '#ece6d8'; c.fillRect(0, 0, w, h);
    if (this.lv === 0) { const tx = w * 0.3, tw = w * 0.4, ty = 20, th = h * 0.78; c.fillStyle = 'rgba(230,220,180,.5)'; rrect(c, tx, ty, tw, th, 16); c.fill(); c.strokeStyle = 'rgba(42,36,24,.4)'; c.lineWidth = 2; c.stroke(); c.fillStyle = 'rgba(192,138,42,.15)'; c.fillRect(tx + 2, ty + th * 0.92, tw - 4, th * 0.08 - 2); ink(c, 'bottom: kept', tx + tw + 6, ty + th * 0.96, 11, '#c08a2a', 'left', 'm', 600);
      for (const cl of this.pop) { const y = this.phase === 'settling' ? clamp(cl.v * this.t / this.T0, 0, 0.99) : 0.05 + cl.x * 0.1, x = tx + 10 + (cl.x != null ? cl.x : 0.5) * (tw - 20), r = 1.5 + Math.sqrt(cl.g) * 1.3; c.fillStyle = '#b89a50'; for (let k = 0; k < Math.min(cl.g, 7); k++) { c.beginPath(); c.arc(x + Math.cos(k * 1.9) * (k ? r * 0.5 : 0), ty + th * y + Math.sin(k * 1.9) * (k ? r * 0.5 : 0), 2 + (cl.g > 4 ? 0.6 : 0), 0, TAU); c.fill(); } }
      const H = this.hist, y0 = h - 10, gh = h * 0.12; if (H.length > 1) { c.strokeStyle = '#c08a2a'; c.lineWidth = 2; c.beginPath(); H.forEach((v, i) => { const x = 20 + (w - 40) * i / this.DAYS, y = y0 - gh * v / 24; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); } return; }
    c.fillStyle = 'rgba(90,138,74,.08)'; c.beginPath(); c.arc(w / 2, h * 0.45, Math.min(w, h) * 0.44, 0, TAU); c.fill();
    for (const cl of this.cells) { const p = this.cpos(cl, w, h); c.fillStyle = cl.ch ? '#d0473a' : '#8ab87a'; c.beginPath(); c.arc(p.x, p.y, 7, 0, TAU); c.fill(); c.strokeStyle = 'rgba(42,36,24,.4)'; c.lineWidth = 1; c.stroke(); c.fillStyle = 'rgba(42,36,24,.35)'; c.beginPath(); c.arc(p.x, p.y, 2, 0, TAU); c.fill(); }
  },
  notes() { if (this.lv === 0) return { idea: this.ideas[0], stats: [['Average cluster', this.meanG().toFixed(1) + ' cells', 'Goal ' + this.GOAL + '.'], ['Growth of a 1-cell vs 12-cell lineage', Math.pow(1.95 - this.CO, 5).toFixed(0) + '× vs ' + Math.pow(1.95 - 12 * this.CO, 5).toFixed(0) + '× a day', 'Big clusters grow more slowly.'], ['Sinking speed', '∝ size^(2/3)', '']], charts: [] }; const n = this.cells.length, ch = this.cells.filter(c => c.ch).length; return { idea: this.ideas[1], stats: [['Cells', n + '', ''], ['Cheaters', ch + '', 'Divide twice as often as healthy cells.'], ['Mutation to cheating', pct(this.MU2) + ' of divisions', '']], charts: [] }; }
};
