/* ================= Chapter: The Census (Hardy–Weinberg and what breaks it) ================= */
const GC = ['#2f5f8f', '#8fb0c8', '#efe6d0'];
const CH_CENSUS = {
  id: 'census',
  theme: { cab: '#eef2f4', hud: '#e0e8ec', text: '#1e2a33', dim: 'rgba(30,42,51,.68)', line: 'rgba(30,42,51,.2)', acc: '#3f6fa3', hi: '#b8562b', meter: '#4f8a6a', inv: '#f6f9fa' },
  intro: {
    hook: 'If a population mates at random and nothing else is going on, genotype proportions follow directly from allele frequencies: p², 2pq and q². That is the Hardy–Weinberg rule, and its real power is as a null model. When a census departs from it, something is happening.',
    how: 'Level 1: sample snails, twenty at a time, and decide whether heterozygotes are too few, too many, or as expected. Level 2: choose where and whom to sample, then name the cause.',
    goal: 'A star for each level solved without a wrong call, and a third for doing both with 400 or fewer snails sampled.'
  },
  real: 'G. H. Hardy and Wilhelm Weinberg derived the rule independently in 1908. Its departures are diagnostic. Self-fertilising plants and inbred animals show too few heterozygotes. So do samples that unknowingly pool two populations with different allele frequencies — the Wahlund effect (1928). Too many heterozygotes among adults, but not among newborns, is the signature of heterozygote advantage: Anthony Allison (1954) showed that in malarial regions of Africa, people carrying one sickle-cell allele survived malaria better than either homozygote.',
  maths: 'With allele frequency p (and q = 1 − p), expected genotypes are p² AA, 2pq Aa, q² aa. The inbreeding coefficient F = 1 − observed ÷ expected heterozygosity: positive means a deficit, negative an excess. A χ² test with one degree of freedom asks how surprising the counts would be under Hardy–Weinberg; with twenty snails even large departures are often not significant. Pooling two populations with frequencies p₁ and p₂ produces a heterozygote deficit equal to 2 × variance of p between them, even if each is in perfect Hardy–Weinberg on its own.',
  ideas: ['<p>Each snail has two copies of a shell-colour gene: dark (AA), banded (Aa) or pale (aa). From the allele frequency you can predict how many of each you should see.</p><p>Small samples mislead. Keep sampling until the pattern is clear — but every snail costs you. The Numbers tab gives a χ² test.</p>', '<p>Three ways to break Hardy–Weinberg, three fingerprints. Inbreeding lowers heterozygosity everywhere, in every age class. Two separate populations lumped together look inbred when pooled, but each one alone is fine. Heterozygote advantage adds heterozygotes by selection: newborns are as expected, survivors are not.</p><p>Sample where and whom you need to tell them apart.</p>'],
  start() { this.lv = 0; this.res = []; this.samples = 0; this.beginLevel(); },
  gfreq(kind, p, x) { const q = 1 - p; if (kind === 'def') return [p * p + x * p * q, 2 * p * q * (1 - x), q * q + x * p * q]; if (kind === 'exc') return [(1 - x) * p, x, (1 - x) * q]; return [p * p, 2 * p * q, q * q]; },
  beginLevel() {
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; this.ci = 0; this.wrong = 0;
    this.cases = this.lv === 0 ? shuffle([{ ans: 'fits', strata: { all: this.gfreq('hw', 0.6) } }, { ans: 'few', strata: { all: this.gfreq('def', 0.5, 0.45) } }, { ans: 'many', strata: { all: this.gfreq('exc', 0.5, 0.72) } }, { ans: 'fits', strata: { all: this.gfreq('hw', 0.3) } }])
      : shuffle([{ ans: 'inbreed', strata: { north: this.gfreq('def', 0.5, 0.5), south: this.gfreq('def', 0.5, 0.5), newborns: this.gfreq('def', 0.5, 0.5), adults: this.gfreq('def', 0.5, 0.5) } }, { ans: 'wahlund', strata: { north: this.gfreq('hw', 0.85), south: this.gfreq('hw', 0.15), newborns: null, adults: null } }, { ans: 'hetadv', strata: { north: this.gfreq('exc', 0.5, 0.72), south: this.gfreq('exc', 0.5, 0.72), newborns: this.gfreq('hw', 0.5), adults: this.gfreq('exc', 0.5, 0.78) } }]);
    this.newCase();
  },
  newCase() {
    this.C = this.cases[this.ci]; this.obs = {}; this.dots = []; const L = this.lv === 0;
    const samp = L ? '<button class="btn" data-s="all">Sample 20 snails</button>' : ['north', 'south', 'newborns', 'adults'].map(k => '<button class="btn" data-s="' + k + '" style="flex:1 1 44%">Sample 20 ' + k + '</button>').join('');
    const diag = L ? [['few', 'Too few heterozygotes'], ['fits', 'As expected'], ['many', 'Too many heterozygotes']] : [['inbreed', 'Inbreeding'], ['wahlund', 'Two populations pooled'], ['hetadv', 'Heterozygote advantage']];
    HUD.set('<div class="hud-goal"><span><b>' + (L ? 'Level 1: Read the census' : 'Level 2: Find the cause') + '</b> — village ' + (this.ci + 1) + ' of ' + this.cases.length + '</span><b id="cs-n"></b></div><div class="hud-line" id="cs-st"></div><div class="hud-row">' + samp + '</div><div class="hud-row">' + diag.map(([k, t]) => '<button class="btn primary" data-d="' + k + '" style="flex:1 1 30%;font-size:13px">' + t + '</button>').join('') + '</div>');
    $('hud').querySelectorAll('[data-s]').forEach(b => b.onclick = () => this.sample(b.dataset.s)); $('hud').querySelectorAll('[data-d]').forEach(b => b.onclick = () => this.diagnose(b.dataset.d)); this.upd();
  },
  draw1(f) { const r = R(); return r < f[0] ? 0 : r < f[0] + f[1] ? 1 : 2; },
  sample(k) {
    const S = this.C.strata; let f = S[k]; if (!f) { const a = S.north, b = S.south; f = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]; }
    const o = this.obs[k] || (this.obs[k] = [0, 0, 0]); for (let i = 0; i < 20; i++) { const g = this.draw1(f); o[g]++; this.dots.push({ k, g, x: R(), y: R() }); }
    this.samples += 20; Snd.click(); this.upd();
  },
  pooled() { const t = [0, 0, 0]; for (const k in this.obs) for (let i = 0; i < 3; i++) t[i] += this.obs[k][i]; return t; },
  stat(o) { const n = o[0] + o[1] + o[2]; if (!n) return null; const p = (2 * o[0] + o[1]) / (2 * n), q = 1 - p, E = [p * p * n, 2 * p * q * n, q * q * n], x2 = E.reduce((a, e, i) => a + (e > 0 ? (o[i] - e) ** 2 / e : 0), 0), He = 2 * p * q, Ho = o[1] / n; return { n, p, E, x2, pv: 2 * (1 - normCdf(Math.sqrt(x2))), F: He > 0 ? 1 - Ho / He : 0, Ho, He }; },
  upd() {
    $('cs-n').textContent = this.samples + ' sampled'; const keys = Object.keys(this.obs);
    HUD.line('cs-st', keys.length ? keys.map(k => { const o = this.obs[k], s = this.stat(o); return (this.lv ? '<b>' + k + '</b>: ' : '') + 'dark ' + o[0] + ', banded ' + o[1] + ', pale ' + o[2] + ' — banded expected about ' + s.E[1].toFixed(0) + ' of ' + s.n; }).join('<br>') : 'No snails sampled yet in this village.');
  },
  diagnose(d) {
    const ok = d === this.C.ans; if (!ok) this.wrong++; ok ? Snd.chime() : Snd.miss();
    const expl = { fits: 'Genotypes matched p², 2pq, q².', few: 'There were fewer heterozygotes than random mating predicts.', many: 'There were more heterozygotes than random mating predicts.', inbreed: 'Every sample, north or south, young or old, was short of heterozygotes: relatives were mating.', wahlund: 'North and south were each in Hardy–Weinberg, with very different allele frequencies; pooled, they looked inbred.', hetadv: 'Newborns matched Hardy–Weinberg; adults had extra heterozygotes, because heterozygotes survived better.' }[this.C.ans];
    toast((ok ? '<b>Correct.</b> ' : '<b>Not this time.</b> ') + expl);
    this.ci++; if (this.ci < this.cases.length) { this.newCase(); return; }
    const pass = this.wrong === 0; this.res.push({ lv: this.lv, pass }); if (pass) Snd.star(); this.lv++;
    if (this.lv < 2) Cards.open({ cls: 'intro', html: '<h3>' + (pass ? 'Level passed' : 'Interesting result') + '</h3><p>' + (pass ? 'Every village read correctly.' : this.wrong + ' wrong call' + (this.wrong > 1 ? 's' : '') + '.') + ' You have sampled ' + this.samples + ' snails so far.</p><h4>Level 2: Find the cause</h4><p>Three villages, three different reasons for departing from Hardy–Weinberg. You can now sample the north and south halves separately, or newborns and adults separately.</p>', buttons: [{ t: 'Next level', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const s = this.res.filter(r => r.pass).length, stars = s + (s === 2 && this.samples <= 400 ? 1 : 0); End.show(this, { stars, title: stars + ' of 3 stars', insight: 'Hardy–Weinberg is dull on purpose: it is what genotypes look like when nothing interesting is happening. You sampled ' + this.samples + ' snails. Too few heterozygotes everywhere meant inbreeding; too few only when north and south were pooled meant two populations (the Wahlund effect); too many among adults but not newborns meant selection for heterozygotes — the sickle-cell signature. The skill is in sampling the right subset: the same pooled numbers could come from any of these causes.' }); }
  },
  update() { },
  draw(c, w, h) {
    c.fillStyle = '#e8ece2'; c.fillRect(0, 0, w, h); const L2 = this.lv === 1, fh = h * 0.58;
    c.fillStyle = '#cfd9c0'; c.fillRect(0, 0, w, fh); if (L2) { c.fillStyle = 'rgba(63,111,163,.08)'; c.fillRect(0, 0, w, fh / 2); ink(c, 'north', 10, 18, 12, '#1e2a33', 'left', 'b', 'italic'); ink(c, 'south', 10, fh / 2 + 18, 12, '#1e2a33', 'left', 'b', 'italic'); c.strokeStyle = 'rgba(30,42,51,.3)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(0, fh / 2); c.lineTo(w, fh / 2); c.stroke(); c.setLineDash([]); }
    const r = rng(this.ci * 17 + this.lv); for (let i = 0; i < 70; i++) { c.fillStyle = 'rgba(120,120,110,.25)'; c.beginPath(); c.arc(r() * w, r() * fh, 3, 0, TAU); c.fill(); }
    for (const d of this.dots) { let y = d.y * fh; if (L2) y = d.k === 'north' ? d.y * fh / 2 : d.k === 'south' ? fh / 2 + d.y * fh / 2 : d.y * fh; const x = d.x * w, sz = d.k === 'newborns' ? 3.5 : d.k === 'adults' ? 6.5 : 5; c.fillStyle = GC[d.g]; c.beginPath(); c.arc(x, y, sz, 0, TAU); c.fill(); c.strokeStyle = 'rgba(30,42,51,.5)'; c.lineWidth = 1; c.stroke(); if (d.g === 1) { c.fillStyle = GC[0]; c.beginPath(); c.arc(x, y, sz, Math.PI / 2, Math.PI * 1.5); c.fill(); } }
    const o = this.pooled(), s = this.stat(o), y0 = h - 22, bh = h - fh - 50, labs = ['dark AA', 'banded Aa', 'pale aa'];
    if (!s) { ink(c, 'sampled snails appear in the field, coloured by genotype', w / 2, fh + bh / 2 + 20, 13, 'rgba(30,42,51,.6)', 'center', 'b', 'italic'); return; }
    const mx = Math.max(...o, ...s.E) || 1; for (let i = 0; i < 3; i++) { const x = w * (0.2 + i * 0.3); c.fillStyle = GC[i]; c.strokeStyle = 'rgba(30,42,51,.5)'; const hh = bh * o[i] / mx; c.fillRect(x - 24, y0 - hh, 22, hh); c.strokeRect(x - 24, y0 - hh, 22, hh); const he = bh * s.E[i] / mx; c.setLineDash([3, 3]); c.strokeRect(x + 2, y0 - he, 22, he); c.setLineDash([]); ink(c, labs[i], x, y0 + 15, 11, '#1e2a33', 'center', 'b'); }
    ink(c, 'solid: observed (all samples pooled)   dashed: Hardy–Weinberg expectation', w / 2, fh + 16, 11, 'rgba(30,42,51,.7)', 'center', 'b');
  },
  notes() {
    const rows = []; for (const k of Object.keys(this.obs)) { const s = this.stat(this.obs[k]); rows.push([(this.lv ? k : 'Your sample') + ' (' + s.n + ')', 'F = ' + s.F.toFixed(2), 'Allele frequency p = ' + s.p.toFixed(2) + '. Heterozygotes observed ' + pct(s.Ho) + ', expected ' + pct(s.He) + '. χ² = ' + s.x2.toFixed(2) + ', p = ' + s.pv.toFixed(3) + '.']); }
    if (this.lv === 1 && Object.keys(this.obs).length > 1) { const s = this.stat(this.pooled()); rows.push(['All samples pooled', 'F = ' + s.F.toFixed(2), 'Pooling can create a deficit that exists in no single group.']); }
    rows.push(['Snails sampled in total', this.samples + '', 'Third star: 400 or fewer across both levels.']);
    return { idea: this.ideas[Math.min(1, this.lv)], stats: rows, charts: [] };
  }
};

/* ================= Chapter: The Clinic (antibiotic resistance) ================= */
const CH_CLINIC = {
  id: 'clinic', DAYS: 10,
  theme: { cab: '#eef4f3', hud: '#dfeae8', text: '#1b2e2c', dim: 'rgba(27,46,44,.68)', line: 'rgba(27,46,44,.2)', acc: '#c2453d', hi: '#2a7f8a', meter: '#3a8a5a', inv: '#f5faf9' },
  intro: {
    hook: 'A patient arrives with a billion bacteria. Among them, by pure chance, a handful already carry a mutation that shrugs off the drug. Every dose you give is a selection experiment.',
    how: 'Each day, choose the treatment; the day passes and the bacteria respond. Level 1: one drug, low or high dose. Level 2: two drugs, alone or together. The immune system can mop up a small infection on its own.',
    goal: 'In each level, cure the patient within ten days without exceeding the drug-toxicity limit. A star per level, and a third for finding the gentlest cure in both (toxicity 6 and 9).'
  },
  real: 'Resistance is not caused by antibiotics; it is selected by them. Mutants resistant to most single drugs are already present in large infections, and doses high enough to stop susceptible cells but too low to stop partly resistant ones — the “mutant selection window” — favour them most (Drlica and Zhao 2007). Tuberculosis showed early why single drugs fail: streptomycin alone produced resistance within months in the 1940s, and multi-drug regimens became standard because a cell resistant to two drugs at once is vanishingly rare. How long a course should be is still debated: “always finish the course” has been questioned for some infections (Llewelyn et al. 2017), and the answer depends on the pathogen and the patient’s own defences.',
  maths: 'Here susceptible cells multiply 8-fold a day and resistant ones 7-fold (resistance has a cost). A low dose kills 98% of susceptible cells but only 10% of resistant ones; a high dose kills 99.9% of susceptible and 98% of resistant cells. In level 2, each drug kills 99% of the cells it works on. About one division in a hundred million produces a new resistant mutant. Once the total falls below 100,000 cells, the immune system removes 90% a day. With two drugs, a cell needs two independent mutations to resist both: about one in 10¹⁶, so in a billion cells there is almost certainly none.',
  ideas: ['<p>Two kinds of cell: susceptible (green) and resistant (red). A low dose clears the green ones and hands the red ones an empty field. A high dose kills both, but it is toxic, and your budget of toxicity is limited.</p><p>The immune system can finish off a small infection. Your job is to get it small, fast, without selecting resistance.</p>', '<p>Now you have two drugs. Some cells already resist drug A, some resist drug B, but almost none resist both. Either drug alone clears most cells and selects the ones that resist it.</p><p>Together, the drugs leave almost nothing to select.</p>'],
  start() { this.lv = 0; this.res = []; this.beginLevel(); },
  beginLevel() {
    $('bar-gen').textContent = 'level ' + (this.lv + 1) + ' of 2'; this.day = 0; this.tox = 0; this.log = []; this.over = false; this.anim = null;
    if (this.lv === 0) { this.P = { S: 1e9, R: 10 }; this.BUD = 8; } else { this.P = { S: 1e9, A: 10, B: 10, AB: 0 }; this.BUD = 18; }
    const opts = this.lv === 0 ? [['none', 'No drug'], ['low', 'Low dose'], ['high', 'High dose']] : [['none', 'None'], ['A', 'Drug A'], ['B', 'Drug B'], ['AB', 'A + B']];
    HUD.set('<div class="hud-goal"><span><b>' + (this.lv ? 'Level 2: Two drugs' : 'Level 1: The course') + '</b></span><b id="cl-d"></b></div><div class="meter"><i id="cl-t" style="background:#c2453d"></i></div><div class="hud-line" id="cl-st"></div><div class="hud-row">' + opts.map(([k, t]) => '<button class="btn' + (k === 'high' || k === 'AB' ? ' primary' : '') + '" data-o="' + k + '">' + t + '</button>').join('') + '</div>');
    $('hud').querySelectorAll('[data-o]').forEach(b => b.onclick = () => this.treat(b.dataset.o)); this.hist = [this.total()]; this.upd();
  },
  total() { return Object.values(this.P).reduce((a, b) => a + b, 0); },
  TOX: { none: 0, low: 1, high: 2, A: 2, B: 2, AB: 3 },
  step(o) {
    const P = this.P, mu = 1e-8;
    if (this.lv === 0) { const newR = P.S * 7 * mu; let S = P.S * 8, Rr = P.R * 7 + newR; if (o === 'low') { S *= 0.02; Rr *= 0.9; } if (o === 'high') { S *= 0.001; Rr *= 0.02; } const T = S + Rr; if (T > 1e10) { S *= 1e10 / T; Rr *= 1e10 / T; } this.P = { S, R: Rr }; }
    else { const nA = P.S * 7 * mu, nB = P.S * 7 * mu, nAB = (P.A + P.B) * 7 * mu; let S = P.S * 8, A = P.A * 7 + nA, B = P.B * 7 + nB, AB = P.AB * 6 + nAB; const kA = o === 'A' || o === 'AB', kB = o === 'B' || o === 'AB'; if (kA) { S *= 0.01; B *= 0.01; } if (kB) { S *= 0.01; A *= 0.01; } const T = S + A + B + AB; if (T > 1e10) { const f = 1e10 / T; S *= f; A *= f; B *= f; AB *= f; } this.P = { S, A, B, AB }; }
    if (this.total() < 1e5) for (const k in this.P) this.P[k] *= 0.1;
    for (const k in this.P) if (this.P[k] < 0.5) this.P[k] = 0;
  },
  treat(o) {
    if (this.over || this.anim) return; this.tox += this.TOX[o]; this.step(o); this.day++; this.log.push(o); this.hist.push(this.total()); this.anim = { t: 0 }; Snd.click();
    const cured = this.total() < 1, dead = this.total() >= 5e9 && this.day > 3;
    if (cured || this.day >= this.DAYS || this.tox > this.BUD) { this.over = true; const ok = cured && this.tox <= this.BUD; setTimeout(() => { if (App.mode === this) this.endLevel(ok, cured); }, 1200); }
    this.upd();
  },
  resist() { return this.lv === 0 ? this.P.R / Math.max(1, this.total()) : (this.P.A + this.P.B + this.P.AB) / Math.max(1, this.total()); },
  upd() {
    $('cl-d').textContent = 'day ' + this.day + ' of ' + this.DAYS; $('cl-t').style.width = pct(clamp(this.tox / this.BUD, 0, 1));
    const T = this.total(), lg = T >= 1 ? Math.log10(T).toFixed(1) : '0';
    HUD.line('cl-st', 'Bacteria: <b>10^' + lg + '</b> (' + (T < 1 ? 'cleared' : T < 1e5 ? 'the immune system can handle this' : 'too many for the immune system') + '). Resistant share: <b>' + pct(this.resist()) + '</b>. Toxicity used: <b>' + this.tox + ' of ' + this.BUD + '</b>.');
    $('hud').querySelectorAll('[data-o]').forEach(b => b.disabled = this.over);
  },
  endLevel(ok, cured) {
    const n = this.log.length, note = ok ? 'Cured on day ' + n + ' with toxicity ' + this.tox + '. ' : cured ? 'Cured, but the drugs themselves did too much harm (toxicity ' + this.tox + ').' : 'Not cured: the infection ' + (this.resist() > 0.5 ? 'is now mostly resistant — the treatment selected the mutants that were there from the start.' : 'was still too large for the immune system.');
    const lesson = this.lv === 0 ? ' A low dose sits in the selection window: it clears the susceptible majority and leaves resistant cells an empty body to fill. Hitting hard early, then letting the immune system finish, leaves nothing to select.' : ' Either drug alone selects the cells that already resist it. Together, a cell would need both mutations at once, about one in ten million billion.';
    this.res.push({ lv: this.lv, pass: ok, tox: this.tox, note: note + lesson }); if (ok) Snd.star(); else Snd.miss(); this.lv++;
    if (this.lv < 2) Cards.open({ cls: 'intro', html: '<h3>' + (ok ? 'Patient cured' : 'Treatment failed') + '</h3><p>' + note + lesson + '</p>', buttons: [{ t: 'Next patient', primary: true, fn: () => { Cards.close(); this.beginLevel(); } }] });
    else { const s = this.res.filter(r => r.pass).length, stars = s + (s === 2 && this.res[0].tox <= 6 && this.res[1].tox <= 9 ? 1 : 0); End.show(this, { stars, title: s + ' of 2 patients cured', insight: 'Resistance is not caused by antibiotics; it is already there, and antibiotics select it. ' + this.res.map(r => r.note).join(' '), leg: legP([['#c2453d', 'resistant share']]), chart: null }); }
  },
  update(dt) { if (this.anim) { this.anim.t += dt; if (this.anim.t > 0.8) this.anim = null; } },
  draw(c, w, h) {
    const g = c.createRadialGradient(w / 2, h * 0.42, 10, w / 2, h * 0.42, Math.min(w, h) * 0.5); g.addColorStop(0, '#fbf6e4'); g.addColorStop(1, '#e9e2c6'); c.fillStyle = '#dde8e6'; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.4, Rr = Math.min(w, h) * 0.34; c.fillStyle = g; c.beginPath(); c.arc(cx, cy, Rr, 0, TAU); c.fill(); c.strokeStyle = 'rgba(27,46,44,.3)'; c.lineWidth = 3; c.stroke();
    const T = this.total(), n = T < 1 ? 0 : Math.round(clamp(Math.log10(T + 1) * 22, 3, 240)), r = rng(this.day * 13 + this.lv), keys = Object.keys(this.P), cols = { S: '#5c9a4a', R: '#c2453d', A: '#d08a3a', B: '#8a5ab0', AB: '#b0203a' };
    const shares = keys.map(k => this.P[k] / Math.max(1, T)); for (let i = 0; i < n; i++) { const a = r() * TAU, d = Math.sqrt(r()) * Rr * 0.92; let u = r(), k = keys[0]; for (let j = 0; j < keys.length; j++) { if (u < shares[j]) { k = keys[j]; break; } u -= shares[j]; } const minShow = this.P[k] > 0; if (!minShow) continue; c.fillStyle = cols[k]; c.save(); c.translate(cx + Math.cos(a) * d, cy + Math.sin(a) * d); c.rotate(a * 3); c.beginPath(); c.ellipse(0, 0, 4, 2, 0, 0, TAU); c.fill(); c.restore(); }
    if (this.anim) { c.fillStyle = 'rgba(194,69,61,' + (0.25 * (1 - this.anim.t / 0.8)) + ')'; c.beginPath(); c.arc(cx, cy, Rr, 0, TAU); c.fill(); }
    ink(c, this.lv ? 'green: susceptible  orange: resists A  purple: resists B  crimson: resists both' : 'green: susceptible   red: resistant', w / 2, cy + Rr + 20, 11, 'rgba(27,46,44,.75)', 'center', 'b');
    const H = this.hist || [], y0 = h - 16, gh = h - (cy + Rr + 34) - 20; if (H.length > 1 && gh > 30) { const X = i => 30 + (w - 50) * i / this.DAYS, Y = v => y0 - gh * clamp(Math.log10(v + 1) / 10, 0, 1); c.strokeStyle = 'rgba(27,46,44,.25)'; c.beginPath(); c.moveTo(30, Y(1e5)); c.lineTo(w - 20, Y(1e5)); c.stroke(); ink(c, 'immune system copes below here', w - 20, Y(1e5) - 4, 10, 'rgba(27,46,44,.6)', 'right', 'b', 'italic'); c.strokeStyle = '#1b2e2c'; c.lineWidth = 2; c.beginPath(); H.forEach((v, i) => { i ? c.lineTo(X(i), Y(v)) : c.moveTo(X(i), Y(v)); }); c.stroke(); }
  },
  notes() { const rows = Object.keys(this.P).map(k => [{ S: 'Susceptible cells', R: 'Resistant cells', A: 'Resist drug A only', B: 'Resist drug B only', AB: 'Resist both' }[k], this.P[k] < 1 ? '0' : '10^' + Math.log10(this.P[k]).toFixed(1), '']); rows.push(['Treatment so far', this.log.join(', ') || '—', ''], ['Toxicity', this.tox + ' of ' + this.BUD, 'Low 1, high 2 a day; single drug 2, both 3.']); return { idea: this.ideas[Math.min(1, this.lv)], stats: rows, charts: [] }; }
};
