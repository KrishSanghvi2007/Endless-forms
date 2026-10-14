/* ================= registration + boot ================= */
const last = a => a.length ? a[a.length - 1] : null;
CH_LICHEN.focusName = 'wing tone (0 dark, 1 pale)';
CH_LICHEN.idea = '<p>Three ingredients make natural selection, and you supply the third. <b>Variation:</b> the moths differ in colour. <b>Inheritance:</b> offspring resemble their parents. <b>Differential survival:</b> the moths you can see get eaten.</p><p>Nobody decides what the moths should look like. You just eat what you notice, and the survivors breed. Over generations the population drifts toward whatever you fail to notice.</p><p>Offspring only partly resemble their parents: a moth can be pale by luck of development rather than by genes. That is why the population moves less each generation than the difference between survivors and the rest. The Numbers tab measures both.</p>';
CH_LICHEN.maths = 'The breeder’s equation, R = h²S. S, the selection differential, is how different the survivors were from their whole generation. R, the response, is how far the next generation moved. The ratio R/S, the realised heritability h², is the share of the survivors’ difference that was genetic. Your run’s value is in the Notes. Selection also uses up variation, which is why the response slows as the moths converge on the bark.';
CH_SOOT.focusName = 'share of black moths';
CH_SOOT.idea = '<p>Colour here comes mostly from <b>one gene</b> with two versions. Carbonaria (C) is dominant: a moth with one or two copies is black. A pale moth has two typica copies.</p><p>Watch the bark. When it changes, the same hunter — you — selects in the opposite direction. Selection has no goal: it favours whatever fits the world as it is today.</p><p>Because C is dominant, pale copies can hide inside black moths. The Numbers tab counts the copies as well as the moths.</p>';
CH_SOOT.maths = 'With a dominant allele at gene frequency q, the share of black moths is 1 − (1 − q)². When black is favoured, every C copy is visible to selection, so it spreads fast at first. The last pale copies sit mostly in black heterozygotes, invisible to you, so typica is never quite eliminated. When pale is favoured again, those hidden copies are the reserve it recovers from.';
CH_SOOT.noteExtra = H => { const q = Gen.freq(H.lay, H.pop, 'carb'); return [['Carbonaria gene copies', pct(q), 'Share of all copies of the colour gene that are the black version.'], ['Black moths', pct(CH_SOOT.black(H.pop)), 'Higher than the copy share alone would suggest, because one copy is enough to make a moth black: 1 − (1 − q)².'], ['Soot on the bark', pct(H.env.soot || 0), '']]; };
CH_BITTER.focusName = 'resemblance to bitterwings';
CH_BITTER.idea = '<p>Bitterwings are toxic and say so with black and red. You learn that the hard way, and from then on you hesitate at anything that looks like one.</p><p>Palewings are harmless. Any palewing that happens to look a little like a bitterwing gets a little of that hesitation, and survives a little more often. Nobody is copying anybody on purpose: your caution does the selecting.</p>';
CH_BITTER.maths = 'The mimic’s advantage depends on the predator’s memory of the model. Each bitter mouthful strengthens avoidance of the pattern; each harmless look-alike you eat weakens it. That makes Batesian mimicry negatively frequency-dependent: it pays best when mimics are rare relative to their models.';
CH_BITTER.noteExtra = H => [['Bitter mouthfuls so far', H.bitterTotal + '', 'Each one costs you three seconds, and teaches you what to avoid.']];
const TH = (cab, hud, text, acc, hi, meter, light) => ({ cab, hud, text, dim: text.replace('rgb(', 'rgba(').replace(')', ',.66)'), line: text.replace('rgb(', 'rgba(').replace(')', light ? ',.22)' : ',.16)'), acc, hi, meter, inv: light ? '#f6f2e6' : cab });
CH_MENDEL.theme = TH('#eef0e2', '#e2e7cf', 'rgb(39,53,31)', '#6d3f96', '#8a5d10', '#5f8a3c', true);
CH_SCRIBE.theme = TH('#0d1a2a', '#13243a', 'rgb(221,233,243)', '#c9474f', '#7fc27f', '#4f8fc4');
CH_CASINO.theme = TH('#0c2a1e', '#0f3526', 'rgb(243,231,195)', '#b8323f', '#e2b64b', '#4f8fc4');
CH_SOOT.theme = TH('#1b1816', '#25211e', 'rgb(236,228,214)', '#8e2d2d', '#c9a44a', '#8e9a97');
CH_SIEVE.theme = TH('#efe2c4', '#e6d4ab', 'rgb(58,44,26)', '#b5562b', '#8a5d10', '#4d7c6e', true);
CH_BITTER.theme = TH('#132217', '#1a2e1f', 'rgb(238,241,220)', '#c0282d', '#e2c34a', '#8bb85a');
CH_JAWS.theme = TH('#0c2c34', '#103842', 'rgb(226,241,240)', '#cf6a38', '#f0c060', '#7ec3c9');
CH_BROOD.theme = TH('#28192a', '#321f33', 'rgb(244,231,238)', '#b8862a', '#e8b460', '#8aa0b8');
const ALL = [CH_MENDEL, CH_SCRIBE, CH_CROSS, CH_CASINO, CH_CAST, CH_LICHEN, CH_SOOT, CH_SIEVE, CH_BITTER, CH_JAWS, CH_HAWKS, CH_BROOD, CH_GAMETES, CH_RAFFLE, CH_ALARM, CH_FORAGER, CH_RIVER, CH_LEK, CH_MEADOW, CH_NEST, CH_SPINDLE, CH_CENSUS, CH_CLINIC, CH_PATHO, CH_BATS, CH_FANCY, CH_COAL, CH_SEX, CH_LIVE, CH_PLASTIC, CH_CROWD, CH_RING, CH_DOUBLE, CH_FRUITS, CH_COMMONS, CH_LOCK, CH_GUEST, CH_MANY, CH_LAND, CH_SWITCH, CH_SWEEP, CH_CLOCK, CH_COPY, CH_ARCH, CH_TREE, CH_WEB, CH_ISL, CH_FIRE];
ALL.forEach(reg);

function boot() {
  Save.load(); Snd.on = Save.d.snd !== false;
  Stage.init();
  $('btn-begin').onclick = () => { Snd.init(); Snd.resume(); Snd.click(); App.go('menu'); };
  $('btn-title').onclick = () => { Title.t = 0; Title.drawn = false; App.go('title'); };
  const sb = $('btn-snd'); const sl = () => { sb.textContent = Snd.on ? 'Sound on' : 'Sound off'; sb.setAttribute('aria-pressed', Snd.on ? 'true' : 'false'); }; sl();
  sb.onclick = () => { Snd.on = !Snd.on; Save.d.snd = Snd.on; Save.save(); sl(); Snd.init(); Snd.click(); };
  $('bar-back').onclick = () => App.exit();
  $('notes-btn').onclick = () => Notes.open();
  $('sh-x').onclick = () => Notes.close();
  document.querySelectorAll('#sh-tabs button').forEach(b => b.onclick = () => { Notes.tab = b.dataset.t; Snd.click(); Notes.render(); });
  for (const id in REG) { const ch = REG[id]; for (const k of ['start', 'update', 'draw', 'notes']) if (ch.mode !== 'hunt' && typeof ch[k] !== 'function') throw new Error('Chapter ' + id + ' lacks ' + k); if (!ch.intro || !ch.intro.goal) throw new Error('Chapter ' + id + ' lacks intro'); }
  App.go('title'); frame();
}
window.TB = { App, Hunt, REG, ORDER, Gen, seed, R, Save, Stage, Cards, Notes, End };
boot();
