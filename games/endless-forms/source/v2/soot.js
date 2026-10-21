/* ================= v2/soot.js: The Black Country (CH_SOOT_V2; D1 §3.1 L4–L6, D5 §4 item 2, D6) =================
   The Wood arc, part two. The player is again the jay hunting the wood's 120 moths (role: selective environment), now
   with one dominant carbonaria allele C that is epistatic over the Lichen Wood's three pale patterns.
     L4 The Black Country  soot settles; one tagged carbonaria origin (8 Cc moths, p = 1/30); you eat what you can see,
                           so black passes half fast because every C copy shows. Gene-pool lens at dusk (survivors' copies).
     L5 Clean air (boss)   the chimneys stop and the bark is clean by generation 3; black now stands out, yet pale starts
                           slowly, because its copies hide inside black moths, then plunges. Both levels ask when black
                           crosses half, from symmetric starts (6.6% of the favoured colour), so rise and fall are compared
                           over the same span; the slow-cleaning bark adds a little more, and a What if? lever removes it.
     L6 The evidence       investigator: mark–release–recapture in a sooty and a clean wood on a stock of moths and nights
                           (Kettlewell 1953/1955; Majerus 2001–07, Cook et al. 2012); predict, gather evidence, conclude.
   Per-second verb: tap a moth to peck it (beak shadow 90 ms, three dust puffs, chick pop). Minute: one morning, then
   dusk in the canvas (other jays, eggs tinted by parent colour, winter cull, survivors into the in-scene drawer chart).
   Science: carbonaria arose once (no recurrent mutation; G2); a black migrant arrives only if carbonaria is lost before
   black passes half (G2); one pale migrant a generation; the copy share sits below the black share; selection on the
   player's catches is ×N stronger than in nature (MODEL cards). Every prediction is scored against the expectation for
   the player's own fitted rule (D1 G10), never the realised run; L6's verdict is scored against the posterior from the
   player's own recaptures (expected Brier score).
   Notation (D2 §15): blue allele C (carbonaria, dominant), amber allele c (typica); p = C share, q = c share.
   Engine use: Gen (det layout), Det, Sim, Predict, LiveGraph, GenePoolLens, Rig ('moth', 'chick', 'tit'), Fx, Lbl,
   Whisper, Live, Ghost, Freezer. Load rule: top level touches only legacy objects (Gen, V2, TAKE, MODEL, …, Url) and
   nothing from the 00_, 01_ or 02_ files outside functions; every engine call is behind a typeof guard. */

/* ---------- constants and pure helpers (Det-safe: + − × ÷ and Det only; no R() here) ---------- */
const SOOTK = {
  N: 120, TRUNK: 30, QUOTA: 12, CHICKS: 4, TIMES: [10, 9], MISS: 0.5, LOOKS: 20, KP: 2, MIG: 1,
  CLEAN: { T: 0.70, H: 0.85, M: 0.60 }, DIRTY: { T: 0.13, H: 0.36, M: 0.12 },
  BLACK: { tone: 0.06, hue: 0.38, mot: 0.12 }, HUE: 0.84, MOT: { band: 0.55, mottle: 0.78, speck: 0.68 },
  WOOD: { pA: 0.18, pB: 0.23, tone: [0.72, 0.07] },   // the default L3 wood (D1 §3.1 checked shares 0.33/0.27/0.41)
  // symmetric starts: L4 opens at about 6.6% black (8 Cc moths, p = 1/30); L5 at about 6.6% pale (p = 0.742, 93% black), jittered by seed
  // so no fixed guess fits b1. Over the same span (6.6% → half of the favoured colour) the two levels compare dominance fairly
  CARRIERS: 8, P5: 0.742, P5J: 0.03, MIGTONE: 0.74,
  SOOT4: [1], SOOT5: [0.6, 0.3, 0],
  GENS: [8, 16, 0], DUSK: 2.0, DAWN: 1.4, POST: 0.7, ASKMAX: 40, NIGHT: 3.8, TALLY: 1.2, YEARS: 4, Y0: [1860, 1956],
  // L6 (designed): chance a bird hunting by sight takes a resting moth after dawn; a packed batch draws birds to the spot
  // and widens the gap (crowdM matched, crowdX mismatched), so the evidence sets packed batches aside; stock = batches bred
  L6: { match: 0.25, mismatch: 0.55, crowdM: 0.05, crowdX: 0.15, budget: 8, per: 4, nb: 5, np: 5, stock: 24, delta: 0.05 },
  // L6 tree: branch joints in the virtual 390 × 540 stage (moths rest under them in nature)
  JOINTS: [[150, 214], [246, 300], [150, 392], [240, 452]], TREE: { x0: 120, x1: 270, y0: 120, y1: 500 },
  // asks: level → generation → spec
  // (first: the level's first ask has no soft timer; b2 and b3 are asked when a real change is due, so "no change" misses)
  ASK: [
    // L4 asks early and mid-rise (1, 2, 4, 5), so the climax (black passing half, about generation 6) plays without a pause
    { 1: { id: 'a1', kind: 'x', chart: 0, lo: 1, hi: 20, tol: 2, hud: 'askX50a', first: true }, 2: { id: 'a2', kind: 'tri', chart: 1, tol: 0.08, hud: 'askTri' },
      4: { id: 'a3', kind: 'y', chart: 0, lo: 0, hi: 1, tol: 0.06, hud: 'askY' }, 5: { id: 't4', kind: 'y', chart: 0, lo: 0, hi: 1, tol: 0.07, hud: 'askRec' } },
    { 1: { id: 'b1', kind: 'x', chart: 0, lo: 1, hi: 30, tol: 2, hud: 'askX50', first: true }, 2: { id: 't5', kind: 'tri', chart: 1, tol: 0.07, hud: 'askMorph' },
      b3: { id: 'b3', kind: 'tri', chart: 1, tol: 0.08, hud: 'askTri' }, b2: { id: 'b2', kind: 'y', chart: 0, lo: 0, hi: 1, tol: 0.05, hud: 'askY5' } },
    {}
  ],
  TOLPX: 13, TOLCAP: 1.6,   // on a small chart the band is at least 13 px (a fingertip), never more than 1.6 × the science band
  PRED: [['a1', 'a2', 'a3'], ['b1', 'b2', 'b3'], ['c1', 'c2']], TRANS: ['t4', 't5', null],
  lay: null
};
function sootLay() {
  if (!SOOTK.lay) SOOTK.lay = Gen.layout([
    { k: 'carb', kind: 'dom', n: 1, p0: 0, mu: 0, back: 0, det: true },   // one origin: no recurrent mutation (G2)
    { k: 'mA', kind: 'dom', n: 1, p0: 0.18, mu: 0, det: true },          // A_ dark-banded
    { k: 'mB', kind: 'dom', n: 1, p0: 0.23, mu: 0, det: true },          // aaB_ pale-mottled; aabb grey-speckled
    { k: 'tone', n: 4, m0: 0.72, s0: 0.07, mu: 0.02, msd: 0.03, ve: 0.03, det: true }]);
  return SOOTK.lay;
}
function sootWood(w) {   // the saved L3 wood (Save.res 'wood': freqs[0] = A, freqs[1] = B, tone [mean, sd]) or the default
  const D = SOOTK.WOOD, ok = v => typeof v === 'number' && isFinite(v);
  if (!w) return { pA: D.pA, pB: D.pB, tone: D.tone.slice(), saved: false };
  const f = w.freqs || [], t = w.tone || [];
  return { pA: ok(f[0]) ? clamp(f[0], 0.03, 0.85) : D.pA, pB: ok(f[1]) ? clamp(f[1], 0.03, 0.85) : D.pB,
    tone: [ok(t[0]) && t[0] > 0.3 && t[0] < 0.98 ? t[0] : D.tone[0], ok(t[1]) ? clamp(t[1], 0.02, 0.2) : D.tone[1]], saved: true };
}
function sootEnv(soot) { const A = SOOTK.CLEAN, B = SOOTK.DIRTY; return { T: lerp(A.T, B.T, soot), H: lerp(A.H, B.H, soot), M: lerp(A.M, B.M, soot) }; }
function sootCamo(tone, hue, mot, soot) {   // the Lichen match (Det.exp): 1 = perfectly hidden on this bark
  const e = sootEnv(soot), dt = (tone - e.T) / 0.5, dh = (hue - e.H) / 0.7, dm = (mot - e.M) / 0.7;
  return Det.exp(-1.2 * (dt * dt + 0.7 * dh * dh + 0.35 * dm * dm));
}
function sootDetect(black, tone, morph, soot) {   // designed detectability: what stands out is found
  const K = SOOTK; return 0.04 + 1 - (black ? sootCamo(K.BLACK.tone, K.BLACK.hue, K.BLACK.mot, soot) : sootCamo(tone, K.HUE, K.MOT[morph] || 0.68, soot));
}
// expected catches when k moths are taken one at a time in proportion to number × weight (black nb at wb, pale np at wp)
function sootSplit(nb, np, wb, wp, k) {
  let eb = 0, ep = 0, cb = nb, cp = np; const whole = Math.floor(k), frac = k - whole;
  for (let i = 0; i <= whole; i++) {
    const step = i < whole ? 1 : frac; if (!(step > 0)) break;
    const tot = cb * wb + cp * wp; if (!(tot > 1e-12)) break;
    let db = step * cb * wb / tot, dp = step - db;
    if (db > cb) { dp += db - cb; db = cb; } if (dp > cp) { db = Math.min(cb, db + dp - cp); dp = cp; }
    eb += db; ep += dp; cb -= db; cp -= dp;
  }
  return [eb, ep];
}
// the player's rule: weight of black against pale on a bark class, fitted from the mornings (Wallenius: ρ = ln(1−r_b)/ln(1−r_p)),
// shrunk towards the designed rule by KP pseudo-moths; no mornings in that class → the designed weight ratio
function sootRho(morn, cls, soot, toneP) {
  const ms = (morn || []).filter(m => (m.soot >= 0.5) === (cls === 'soot'));
  if (!ms.length) return sootDetect(true, 0, 'speck', soot) / sootDetect(false, toneP, 'speck', soot);
  let eb = 0, nb = 0, ep = 0, np = 0, pb = 0, pp = 0;
  for (const m of ms) { eb += m.eb; nb += m.nb; ep += m.ep; np += m.np; pb += m.pb; pp += m.pp; }
  const K = SOOTK.KP * ms.length, rb = clamp((eb + K * pb / ms.length) / (nb + K), 0.002, 0.98), rp = clamp((ep + K * pp / ms.length) / (np + K), 0.002, 0.98);
  return clamp(Det.log(1 - rb) / Det.log(1 - rp), 0.001, 1000);
}
// expected dawn black shares for the next n generations, starting from today's survivors (C share p)
function sootProject(p, n, sootOf, rhoOf, k, dom, mig) {
  const N = SOOTK.N, f = 1 - (mig == null ? SOOTK.MIG : mig) / N, out = []; let q = p * f;
  for (let i = 0; i < n; i++) {
    const B = dom ? 1 - (1 - q) * (1 - q) : q * q; out.push(B);
    const x = sootOf(i), rho = rhoOf(x), nb = SOOTK.TRUNK * B, np = SOOTK.TRUNK - nb, e = sootSplit(nb, np, rho, 1, Math.min(k, SOOTK.TRUNK));
    const wb = nb > 1e-9 ? 1 - e[0] / nb : 1, wp = np > 1e-9 ? 1 - e[1] / np : 1;
    let qn = q;
    if (dom) { const wbar = B * wb + (1 - B) * wp; if (wbar > 0) qn = q * wb / wbar; }
    else { const wbar = q * q * wb + (1 - q * q) * wp; if (wbar > 0) qn = (q * q * wb + q * (1 - q) * wp) / wbar; }
    q = qn * f;
  }
  return out;
}
function sootPhi(x) {   // standard normal CDF (Abramowitz–Stegun 7.1.26 with Det.exp)
  const z = Math.abs(x) / 1.4142135623730951, t = 1 / (1 + 0.3275911 * z);
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Det.exp(-z * z);
  return x >= 0 ? 0.5 * (1 + y) : 0.5 * (1 - y);
}
function sootTriErr(a, b) {   // Euclidean distance in a unit-side simplex (as Predict.err 'tri')
  const n = v => { const s = (+v[0] || 0) + (+v[1] || 0) + (+v[2] || 0) || 1; return [(+v[0] || 0) / s, (+v[1] || 0) / s, (+v[2] || 0) / s]; };
  const x = n(a), y = n(b), d0 = x[0] - y[0], d1 = x[1] - y[1], d2 = x[2] - y[2]; return Math.sqrt((d0 * d0 + d1 * d1 + d2 * d2) / 2);
}
const sootFed = s => s.need > 0 ? s.fed / s.need : 0;
const sootMix = wd => { const x = (1 - wd.pA) * (1 - wd.pA), y = (1 - wd.pB) * (1 - wd.pB); return [1 - x, x * (1 - y), x * y]; };   // pale patterns expected from a wood (HW)

/* ---------- all words (API_v2 §9.2; D4 budgets; British spelling) ---------- */
const SOOT_C = {
  firstWords: 'Soot is falling. You are the jay: tap moths you see to feed your chicks.',
  intro: {   // the opening description card (D6 decision 8; 00_entry.js Intro): 1–2 sentences, ≤ 35 words each
    game: 'You are a jay in a wood near the mills as soot blackens the bark. Eat the moths you spot to feed your chicks, then test the story in the field.',
    biology: 'Industrial melanism: a dominant allele, carbonaria, makes moths black and spreads fast on sooty bark. When the air clears, pale copies hidden in black moths return slowly at first.',
    how: 'Tap a moth to peck it, or steer the beak with the arrows and Space. Predict when black passes half; in the last level, mark, release and recapture moths.'
  },
  hud: {
    hunt: 'Feed the chicks: {n} more moths.', dawn: 'Generation {g}. {line}',
    dusk: 'Dusk. The moths you missed lay eggs.', post: 'The survivors pair up.', wait: 'The season is over.',
    askX50a: 'When will black moths pass half? Drag the marker on the graph.',
    askTri: 'Tap the triangle where tomorrow’s newborns will sit.',
    askY: 'Survivors’ copies are in the jars. Drag: black share tomorrow?',
    askRec: 'What if black needed two copies? Drag: black share tomorrow.',
    l5: 'Clean air. Soot washes off and the bark lightens. Feed the chicks.',
    askX50: 'When will black fall below half? Drag the marker on the graph.',
    askMorph: 'Black hid the patterns from the bird. Tap: which patterns will pale moths show?',
    askY5: 'Drag: black share tomorrow? Mind the hidden pale copies.',
    whatif: 'What if: {lever}? The jay hunts by contrast.',
    l6: 'Tap the tree to release marked moths.',
    l6more: 'Release up to four batches, then run the night.',
    l6ask: 'Before dawn: what share of the survivors will be black?',
    night: 'Night. Birds hunt at first light.', tally: 'Survivors counted in the light trap.',
    conclude: 'Which idea fits your data? Pick one, then your confidence.', out: 'No moths or nights left. Make your call.',
    submit: 'Pick an idea and a confidence, then submit.', done: 'Your verdict is in.',
    verdict: 'Your data: {idea} {a}%. You said {b}%.', thin: 'Your data: {idea} {a}%. Too few moths to be sure.'
  },
  whispers: {
    miss: 'Only bark there.', fed: 'All four chicks fed.', hungry: 'A chick went hungry.', lost: 'Carbonaria lost. A black moth flies in.',
    mig: 'A pale moth flies in.', pass: 'Black passed half.', below: 'Black fell below half.', lens: 'Genes show after the hunt.',
    auto: 'The jay hunts by contrast.', manual: 'You hunt again.', crowd: 'Packed moths draw birds. Sceptics set them aside.',
    trunk: 'Open trunk: used, but less than branches.', branch: 'Under a branch: a common resting spot.', full: 'Four batches tonight. Run the night.',
    none: 'Release some moths first.', stock: 'No moths left to release.', wood: 'Release here before switching woods.', locked: 'Locked in.',
    idle: 'You have not tapped a moth yet.', timeup: 'Time up: your marker stayed put.'
  },
  labels: {
    gen: 'Generation {g}', soot: 'Soot settles', smog: 'Black with soot', clear: 'Clean Air Act', lichen: 'Bark lightens', clean: 'Clean bark',
    eggs: 'Dot: 4 eggs', jays: 'Other trunks −{n}', line50: 'Half black', year: '≈{y}', compressed: 'history compressed', sooty: 'Sooty wood', cleanw: 'Clean wood',
    xn4: 'selection ×2–4', xn5: 'selection ×3–6', xn6: 'gap ×3', debate: 'Methods debated', trap: 'Light trap', power: 'Power {n}%', nights: '{n} nights', stock: '{n} batches',
    tally: '{a}/{b}', hBack: 'back', hSent: 'sent', aside: 'set aside {n}', batch: '5 + 5 moths', mirror: 'rise mirrored', you: 'you', tomorrow: 'tomorrow', black: 'black', pale: 'pale',
    lens: 'Gene pool', auto: 'Auto', lock: 'Lock in', skip: 'Skip', night: 'Night', conclude: 'Decide', back: 'Back', submit: 'Submit',
    hRev: 'Camouflage', hBlack: 'Black tougher', hPale: 'Pale tougher', hNone: 'No difference', pct: '{n}%',
    c50: '50%', c60: '60%', c70: '70%', c80: '80%', c90: '90%', wSoot: 'Sooty', wClean: 'Clean'
  },
  panels: [
    { id: 'dominance', text: 'One carbonaria copy makes a moth black. So every black moth shows the bird its C, and selection acts on every copy at once. Pale needs two typica copies. When pale is rare, most typica copies sit unseen inside black moths. At first, selection barely reaches them.' }
  ],
  interesting: {
    flat: 'Black did not pass half. You took pale moths only a little more often than black. Eat the moths that stand out.',
    flat_ate: 'You took black moths as often as pale ones, so carbonaria could not spread. Black did not pass half.',
    flat_idle: 'You ate few moths, so there was little selection. Black did not pass half.',
    lost_ate: 'The black moths were eaten, so carbonaria was lost. A migrant from the city brought it back.',
    lost_chance: 'By chance, none of the young inherited carbonaria. A migrant from the city brought it back.',
    stuck: 'Black stayed above half. Pale copies hid in black moths, and the bark cleaned slowly.',
    stuck_pale: 'You took pale moths as often as black ones, so pale could not return. Black stayed above half.',
    stuck_idle: 'You ate few moths, so there was little selection. Black stayed above half.',
    onewood: 'One wood cannot tell camouflage from toughness. Kettlewell compared a sooty and a clean wood for that reason.',
    weak: 'Your data could not yet separate the ideas. More moths in both woods would.',
    wrong: 'Your data pointed elsewhere. Look at both woods: the favoured colour swaps with the bark.',
    overconf: 'Right idea, but you were bolder than your data. Match your confidence to the evidence.',
    underconf: 'Right idea, and your data were stronger than your confidence. With this much evidence, say so.',
    crowded: 'Packed batches drew birds and widened the gap. Critics said this of Kettlewell, so they were set aside.',
    w_recessive: 'Same copies, but black now needs two. Most carbonaria copies hid in pale Cc moths, so black stayed rare.',
    w_nosoot: 'On clean bark black moths stood out, so carbonaria stayed rare. The same copy needs the right bark.',
    w_paledom: 'Same bird, same black share. With pale dominant, every typica copy showed, so its copies spread fast.',
    w_nolag: 'With clean bark at once, pale still began slowly, because its copies hid in black moths. The slow cleaning added more delay.',
    w_nomig: 'Without migrants pale still returned. The copies hidden in black moths were enough.',
    w_nomig_slow: 'Without migrants pale returned more slowly. Black had not fallen below half by the end.'
  },
  levers: { recessive: 'Two copies needed', nosoot: 'No soot', paledom: 'Pale dominant', nolag: 'Instant clean bark', nomig: 'No migrants' },
  take: 'One dominant copy shows at once, so black rose fast. Pale copies hid in black heterozygotes and returned slowly.',
  body: 'Your meals were the selection. On soot you found pale moths, so carbonaria spread, and every copy showed. With clean air you hunted black moths, but pale needs two copies. Most typica copies sat hidden in black moths, so pale began slowly, then plunged. The slow-cleaning bark added delay.',
  levelTake: ['Every C copy shows in a black moth, so selection saw them all and black passed half fast.',
    'Pale copies hid in black moths, so pale began slowly, then plunged. The slow-cleaning bark added delay.',
    'Two woods and enough moths showed the reversal. One wood cannot.'],
  levelBody: [null, null,
    'In the sooty wood black moths came back more often; in the clean wood pale ones did. Only that comparison rules out “black is tougher”. Packed releases inflate the gap, so fair tests space them out.'],
  law: { title: 'Dominance shapes the pace' },
  boss: { inverts: 'Black passed half fast; with clean air, pale wins half back more slowly.' },
  stars: {
    discover: 'Feed your chicks while the wood changes colour.',
    predict: 'Get two predictions inside the band.',
    transfer: 'Apply the rule to a new case, inside the band.'
  },
  model: [
    { level: 0, simulated: 'A wood of 120 moths. You hunt the 30 on one trunk. Three designed jays copy your choices on the other trunks. Survivors pair at random; winter leaves 120 young.',
      simplification: 'Colour is one gene: carbonaria (C) is dominant over typica (c). The Lichen Wood patterns sit hidden under black. Soot settles in the first morning. History is compressed: the run starts at 8 carriers, the copy that escaped loss.',
      params: [{ name: 'moths', value: '120', tag: 'designed' }, { name: 'eaten each morning', value: '12 of 30, about 40%', tag: 'designed' },
        { name: 'selection against the conspicuous colour (s)', value: 'about 0.4, rising to 0.9 as it gets rare', tag: 'xN', real: 's about 0.2–0.33 a year' },
        { name: 'generations', value: '8, about 4 years each', tag: 'xN', real: 'one a year' }, { name: 'carbonaria at start', value: 'p = 0.033 (8 carriers)', tag: 'designed', real: 'one copy, about 1819' },
        { name: 'pale migrants', value: '1 a generation', tag: 'designed' }],
      cannot: 'The first copy’s long odds. Most new beneficial copies are lost by chance; this model starts after one escaped.',
      nature: 'Carbonaria is one jumping-gene insertion in the cortex gene, dated to about 1819 (van’t Hof et al. 2016). The first black moth was recorded in Manchester in 1848. By 1895 about 98% there were black.',
      contested: false, refs: ['vanthof2016', 'haldane1924', 'cook2003'] },
    { level: 1, simulated: 'The same wood after the Clean Air Act of 1956. Soot washes off and the bark is clean by generation 3. You hunt as before.',
      simplification: 'Pale needs two typica copies, so most typica copies sit unseen in black moths. Expected % black from a 93% start: 93, 94, 92, 89, 86, 80, 71, 57, 35 and 4.',
      params: [{ name: 'eaten each morning', value: '12 of 30, about 40%', tag: 'designed' },
        { name: 'selection against the conspicuous colour (s)', value: 'about 0.4, rising to 0.8 as it gets rare', tag: 'xN', real: 's about 0.1–0.2 a year' },
        { name: 'bark cleaning', value: '2 generations', tag: 'xN', real: 'decades; lichen slower still' },
        { name: 'generations', value: 'up to 16, about 4 years each', tag: 'xN', real: 'one a year' }, { name: 'pale migrants', value: '1 a generation', tag: 'designed' }],
      cannot: 'Migration between many woods, which sped the real decline in some places and slowed it in others.',
      nature: 'After clean-air laws, black moths declined across Britain over decades. Selection against them was about 0.1–0.2 a year (Cook 2003; Saccheri et al. 2008). The decline often began before lichens came back: cleaner, lighter bark was enough.',
      contested: false, refs: ['cook2003', 'saccheri2008', 'cook2012'] },
    { level: 2, simulated: 'Marked moths released in a sooty and a clean wood. Birds hunting by sight take some after dawn; every survivor is recaptured the next night.',
      simplification: 'Survival differs by colour against bark (designed). Packed batches draw birds and widen the gap, so the evidence sets them aside. You have 24 batches of moths and 8 nights.',
      params: [{ name: 'survival to the trap, matched', value: '75%', tag: 'xN', real: 'a smaller daily gap, s about 0.1' }, { name: 'survival to the trap, mismatched', value: '45%', tag: 'xN', real: 'see above' },
        { name: 'packed batch', value: '−5% matched, −15% mismatched', tag: 'designed' }, { name: 'stock', value: '24 batches, 8 nights', tag: 'designed' },
        { name: 'moths a batch', value: '5 black, 5 pale', tag: 'designed' }],
      cannot: 'Moths flying away, uneven recapture, or moths choosing their own resting sites. Real studies had to correct for these.',
      nature: 'Kettlewell recaptured 27.5% of black and 13% of pale moths in sooty Birmingham in 1953. Critics later questioned his release densities and daytime releases. Majerus released 4,864 moths at natural sites. Birds still took more black moths, confirming the result (Cook et al. 2012).',
      contested: false, refs: ['kettlewell1955', 'majerus1998', 'cook2012'] }
  ],
  why: {
    real: ['The peppered moth is a textbook case because the main cause is well tested. Birds take moths that stand out. Soot darkened the bark, black spread; clean air reversed it. The allele has been mapped, its single origin inferred from DNA, and bird predation measured in the field.'],
    maths: ['Call the carbonaria copy share p. With random mating, black moths are 1 − (1 − p)², because only cc moths are pale. At the start, p = 0.033, that is 6.6% black: one copy is enough.',
      'Pale moths are (1 − p)². When pale is 4%, typica copies are 20%, and 80% of them sit in black Cc moths. A bird cannot see them, so the return starts slowly.',
      'Same span, same bird: black went from 7% to half in about 5 generations. On bark clean at once, pale needs about 6, because its copies hide in black moths. The slow-cleaning bark adds about 2 more.']
  }
};

const CH_SOOT_V2 = {
  id: 'soot', v2: true, role: 'environment', place: 'wood', accent: '#A0623E',   // the chapter's chrome tint (D6 decision 7)
  intro: { goal: 'Feed your chicks as soot comes and goes; watch dominance set the pace.' },
  content: SOOT_C,
  P: {
    N: { v: 120, tag: 'designed', min: 60, max: 240, label: 'moths' },
    quota: { v: 12, tag: 'designed', min: 6, max: 18, label: 'meals a morning' },
    time: { v: 10, tag: 'designed', min: 8, max: 20, label: 'seconds a morning' },   // 9 in Clean air (SOOTK.TIMES)
    p0: { v: 0.033, tag: 'designed', min: 0.01, max: 0.2, real: 'one copy, about 1819', label: 'carbonaria at start' },
    gens: { v: 8, tag: 'xN', min: 6, max: 12, real: 'about 50 years', label: 'soot generations' }
  },
  levels: [
    { name: 'The Black Country', adds: 'a dominant black allele', codes: ['C7', 'D1', 'B1'], minutes: 5 },
    { name: 'Clean air', adds: 'reversed bark', codes: ['C7', 'C1'], minutes: 7 },
    { name: 'The evidence', adds: 'a field budget', codes: ['A3', 'A2', 'A5'], minutes: 6 }
  ],
  keys: { ArrowLeft: 'move the beak', ArrowRight: 'move the beak', ArrowUp: 'move the beak', ArrowDown: 'move the beak', Space: 'peck or release', A: 'auto hunt', L: 'gene pool lens', P: 'predict', N: 'run the night', W: 'switch wood' },
  untimed: true,
  teacher: { prompts: ['Why did the share of black moths rise faster than the share of carbonaria copies?', 'Black passed half faster than pale won half back. How much of that was dominance, and how much the slow-cleaning bark?', 'The other jays copy your choices. What does that assume about real birds?'], pool: 'trace' },
  encodings: [{ k: 'C', rgb: [47, 95, 208], channels: ['colour', 'letter'] }, { k: 'c', rgb: [232, 180, 22], channels: ['colour', 'letter'] },
    { k: 'black', rgb: [28, 26, 24], channels: ['luminance'] }, { k: 'pale', rgb: [196, 198, 178], channels: ['luminance', 'pattern'] }],
  starTraits: ['black'],

  /* ---------- headless simulation (API_v2 §9.3): R(), Det, Gen only ---------- */
  sim: {
    dt: 1 / 30, s: null,
    reset(level, o) {
      o = o || {}; const K = SOOTK;
      if (o.thaw) {   // a What if? rerun: the frozen dawn under the changed rule; the jay hunts by contrast (fast) unless the player takes over
        this.restore(o.thaw.snap); const t = this.s; t.log = []; t.thawed = true; t.thawGen = t.gen; t.autoAll = t.level < 2; this.lever(o.thaw.lever); return;
      }
      const wood = sootWood(o.wood);
      this.s = { level, wood, log: [], pred: {}, exp: {}, hit: {}, asks: [], ask: null, thawed: false, t: 0, nextId: 1,
        unt: !!(o.untimed != null ? o.untimed : (Save.d && Save.d.ui && Save.d.ui.unt)) };
      if (level === 2) { this.reset6(); return; }
      if (level === 1 && !wood.saved) {   // the default wood's pattern mix is close to even thirds, so "tap the middle" would pass t5:
        // without a saved Lichen wood, L5 draws a wood whose mix is clearly uneven (shown on the pattern triangle in generation 1)
        for (let k = 0; k < 8; k++) { wood.pA = 0.06 + 0.34 * R(); wood.pB = 0.06 + 0.39 * R(); if (sootTriErr(sootMix(wood), [1, 1, 1]) >= 0.12) break; }
      }
      const s = this.s, lay = sootLay();
      Object.assign(s, { gen: 1, gens: K.GENS[level], phase: 'dawn', dom: 'dom', mig: K.MIG, nosoot: false, auto: false, autoT: 0,
        quota: K.QUOTA, eaten: 0, eb: 0, ep: 0, time0: K.TIMES[level], time: K.TIMES[level], looks: K.LOOKS, fed: 0, need: 0, hungry: 0, rescues: 0, lostWhy: null,
        passed: null, crossGen: null, morn: [], hist: [], pop: [], trunk: [], pos: [], soot: 0, cursor: [195, 300] });
      const p5 = level !== 1 ? 0 : o.p5 != null ? +o.p5 : K.P5 + K.P5J * (2 * R() - 1);   // L5: about 90% black, jittered by seed
      const over = { carb: { p: p5 }, mA: { p: wood.pA }, mB: { p: wood.pB }, tone: { m: wood.tone[0], s: wood.tone[1] } };
      for (let i = 0; i < K.N; i++) s.pop.push(this.mk(Gen.genome(lay, over)));
      if (level === 0) {   // one tagged origin, shown at p = 1/30: eight Cc moths (the copy that escaped loss)
        const idx = s.pop.map((_, i) => i);
        for (let i = 0; i < K.CARRIERS; i++) { const j = i + ((R() * (idx.length - i)) | 0), t = idx[i]; idx[i] = idx[j]; idx[j] = t; s.pop[idx[i]].g[lay.T.carb.off] = 1; }
      }
      s.soot = this.sootAt(1); s.morph0 = this.morphExpect(s.pop);
      this.dawnRecord(); this.place();
      if (o.lever) this.lever(o.lever);   // tests: start a level under a What if? rule (e.g. 'nolag' for the dominance-only comparison)
    },
    mk(g) { const s = this.s; return { g, t: Gen.ph(sootLay(), g, 'tone'), id: s.nextId++, dead: 0, mig: 0 }; },
    sootAt(gen) {
      const s = this.s, K = SOOTK; if (s.nosoot || (s.level === 1 && s.nolag)) return 0;
      if (s.level === 0) return gen - 1 < K.SOOT4.length ? K.SOOT4[gen - 1] : 1;
      return gen - 1 < K.SOOT5.length ? K.SOOT5[gen - 1] : 0;
    },
    lever(k) {
      const s = this.s;
      if (k === 'recessive') s.dom = 'rec';   // the same copies read with black needing two: the textbook comparison at equal allele frequency
      if (k === 'paledom') { s.dom = 'rec'; this.regeno(s.hist && s.hist.length ? s.hist[s.hist.length - 1].B : this.stats(s.pop).B); }   // same black share, pale dominant
      if (k === 'nomig') s.mig = 0;
      if (k === 'nosoot') { s.nosoot = true; s.soot = 0; }
      if (k === 'nolag') { s.nolag = true; s.soot = this.sootAt(s.gen); }
      s.lever = k || null;
      if (s.hist && s.hist.length && k) { s.hist.pop(); this.dawnRecord(); }   // the frozen dawn, re-read under the changed rule
    },
    regeno(B) {   // carbonaria genotypes redrawn in HW at p = √B, so black (CC under pale dominance) keeps the frozen share B; other genes untouched
      const s = this.s, L = sootLay(), o = L.T.carb.off, n = s.pop.length, p = Math.sqrt(clamp(B, 0, 1));
      const nCC = Math.round(n * p * p), nCc = Math.min(n - nCC, Math.round(n * 2 * p * (1 - p))), idx = s.pop.map((_, i) => i);
      for (let i = n - 1; i > 0; i--) { const j = (R() * (i + 1)) | 0, t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      idx.forEach((j, r) => { const g = s.pop[j].g, k = r < nCC ? 2 : r < nCC + nCc ? 1 : 0; g[o] = k >= 1 ? 1 : 0; g[L.L + o] = k === 2 ? 1 : 0; });
    },
    /* genetics */
    cc(g) { const L = sootLay(), o = L.T.carb.off; return (g[o] > 0.5 ? 1 : 0) + (g[L.L + o] > 0.5 ? 1 : 0); },   // carbonaria copies 0..2
    black(m) { const n = this.cc(m.g); return this.s.dom === 'rec' ? n === 2 : n > 0; },
    morph(g) { const L = sootLay(); return Gen.dom(L, g, 'mA') ? 'band' : Gen.dom(L, g, 'mB') ? 'mottle' : 'speck'; },
    ph(m) { return this.black(m) ? { carb: true, tone: SOOTK.BLACK.tone } : { tone: m.t, hue: SOOTK.HUE, mot: SOOTK.MOT[this.morph(m.g)], morph: this.morph(m.g) }; },
    detect(m, soot) { return sootDetect(this.black(m), m.t, this.morph(m.g), soot == null ? this.s.soot : soot); },
    stats(list) {   // → {n, B, p, G: [CC, Cc, cc], hid, morph: [band, mottle, speck] among pale, tone}
      const n = list.length || 1; let b = 0, c = 0, G = [0, 0, 0], M = [0, 0, 0], np = 0, ts = 0;
      for (const m of list) { const k = this.cc(m.g); c += k; G[2 - k]++; if (this.black(m)) b++; else { np++; ts += m.t; const mo = this.morph(m.g); M[mo === 'band' ? 0 : mo === 'mottle' ? 1 : 2]++; } }
      return { n: list.length, B: b / n, p: c / (2 * n), G: G.map(x => x / n), hid: G[1] + 2 * G[2] > 0 ? G[1] / (G[1] + 2 * G[2]) : 0, morph: np ? M.map(x => x / np) : [1 / 3, 1 / 3, 1 / 3], tone: np ? ts / np : 0 };
    },
    morphExpect(list) {   // morph shares among pale moths expected from the hidden A and B allele frequencies (HW)
      const L = sootLay(), a = Gen.freq(L, list, 'mA'), b = Gen.freq(L, list, 'mB'), x = (1 - a) * (1 - a), y = (1 - b) * (1 - b);
      return [1 - x, x * (1 - y), x * y];
    },
    dawnRecord() { const s = this.s, st = this.stats(s.pop); s.hist.push({ gen: s.gen, soot: s.soot, B: st.B, p: st.p, G: st.G, hid: st.hid, morph: st.morph, tone: st.tone, dusk: null }); },
    place() {   // 30 moths on your trunk, spread in the fixed virtual 390 × 540 stage (viewport-independent draws)
      const s = this.s, K = SOOTK, idx = s.pop.map((_, i) => i);
      for (let i = 0; i < K.TRUNK; i++) { const j = i + ((R() * (idx.length - i)) | 0), t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      s.trunk = idx.slice(0, K.TRUNK); s.pos = [];
      const W = 390, H = 540, x0 = 24, x1 = 366, y0 = 112, y1 = 462, minD = Math.min(40, Math.sqrt((x1 - x0) * (y1 - y0) / K.TRUNK) * 0.62);
      for (let k = 0; k < K.TRUNK; k++) {
        let best = null, bd = -1;
        for (let t = 0; t < 40; t++) {
          const p = [x0 + R() * (x1 - x0), y0 + R() * (y1 - y0)]; let dmin = 1e9;
          for (const q of s.pos) { const dx = q[0] - p[0], dy = q[1] - p[1], dd = dx * dx + dy * dy; if (dd < dmin) dmin = dd; }
          if (dmin > minD * minD) { best = p; break; } if (dmin > bd) { bd = dmin; best = p; }
        }
        s.pos.push([best[0] / W, best[1] / H, (R() - 0.5) * 0.8]);
      }
    },
    alive(i) { const s = this.s, m = s.pop[s.trunk[i]]; return !!m && !m.dead; },
    mostVisible() { const s = this.s; let bi = -1, bv = -1; for (let i = 0; i < s.trunk.length; i++) if (this.alive(i)) { const v = this.detect(s.pop[s.trunk[i]]); if (v > bv + 1e-12) { bv = v; bi = i; } } return bi; },
    /* the morning */
    step(dt) {
      const s = this.s, K = SOOTK, ev = [];
      if (s.level === 2) return this.step6(dt, ev);
      s.t += dt;
      if (s.phase === 'dawn') { if (s.t >= (s.thawed ? 0.5 : K.DAWN)) this.toHunt(ev); }   // a What if? rerun runs fast (about 4 s a generation)
      else if (s.phase === 'hunt') {
        if (s.auto) { s.autoT += dt; if (s.autoT >= (s.thawed ? 0.2 : 0.6)) { s.autoT = 0; const i = this.mostVisible(); if (i >= 0) this.peck(i, ev); } }
        if (!s.unt) s.time -= dt;
        let left = 0; for (let i = 0; i < s.trunk.length; i++) if (this.alive(i)) left++;
        if (s.time <= 0 || left === 0 || s.eaten >= s.quota || (s.unt && s.looks <= 0)) this.endMorning(ev);
      }
      else if (s.phase === 'dusk') { if (s.t >= (s.thawed ? 0.9 : K.DUSK)) this.afterDusk(ev); }
      else if (s.phase === 'ask') { if (!s.unt && s.t >= K.ASKMAX) this.commit(s.ask.id, null, ev); }
      else if (s.phase === 'post') { if (s.t >= (s.thawed ? 0.4 : K.POST)) this.breedOrEnd(ev); }
      return ev;
    },
    toHunt(ev) { const s = this.s; s.phase = 'hunt'; s.t = 0; if (s.autoAll) { s.auto = true; s.autoT = 0; } ev.push({ k: 'hunt', gen: s.gen }); },
    peck(i, ev) {
      const s = this.s, m = s.pop[s.trunk[i]]; m.dead = 1; s.eaten++; s.looks--;
      if (this.black(m)) s.eb++; else s.ep++;
      ev.push({ k: 'peck', i, x: s.pos[i][0], y: s.pos[i][1], black: this.black(m), chick: (s.eaten - 1) % SOOTK.CHICKS, n: s.eaten });
      if (s.eaten === s.quota) ev.push({ k: 'fed' });
    },
    endMorning(ev) {
      const s = this.s, K = SOOTK, tr = s.trunk.map(j => s.pop[j]);
      let nb = 0, np = 0, Db = 0, Dp = 0;
      for (const m of tr) { if (this.black(m)) { nb++; Db += this.detect(m); } else { np++; Dp += this.detect(m); } }
      Db = nb ? Db / nb : sootDetect(true, 0, 'speck', s.soot); Dp = np ? Dp / np : sootDetect(false, s.wood.tone[0], 'speck', s.soot);
      const d = sootSplit(nb, np, Db, Dp, s.eaten), pb = nb ? d[0] / nb : 0, pp = np ? d[1] / np : 0;
      const rb = clamp((s.eb + K.KP * pb) / (nb + K.KP), 0, 0.95), rp = clamp((s.ep + K.KP * pp) / (np + K.KP), 0, 0.95);
      const onTrunk = {}; for (const j of s.trunk) onTrunk[j] = 1;
      let jb = 0, jp = 0;
      for (let j = 0; j < s.pop.length; j++) { if (onTrunk[j]) continue; const m = s.pop[j], b = this.black(m); if (R() < (b ? rb : rp)) { m.dead = 2; if (b) jb++; else jp++; } }
      s.morn.push({ gen: s.gen, soot: s.soot, nb, np, eb: s.eb, ep: s.ep, k: s.eaten, pb, pp });
      const got = Math.min(s.eaten, s.quota); s.fed += got; s.need += s.quota; s.hungry = Math.ceil((s.quota - got) / (s.quota / K.CHICKS) - 1e-9);
      const surv = s.pop.filter(m => !m.dead), st = this.stats(surv.length ? surv : s.pop), h = s.hist[s.hist.length - 1];
      h.dusk = { B: st.B, p: st.p, G: st.G, n: st.n, eb: s.eb, ep: s.ep, nb, np, jb, jp };
      s.phase = 'dusk'; s.t = 0; s.auto = false;
      ev.push({ k: 'dusk', jb, jp, hungry: s.hungry, surv: st.n, eaten: s.eaten });
    },
    afterDusk(ev) {
      const s = this.s; if (s.thawed) { s.phase = 'post'; s.t = 0; return; }   // a What if? rerun asks nothing: it shows the consequence
      let A = SOOTK.ASK[s.level][s.gen];
      if (s.level === 1 && !A) {   // b3 and b2 are asked when a real change is due (or at the last dusk), so copying today's value misses
        const K1 = SOOTK.ASK[1], h = s.hist[s.hist.length - 1], last = s.crossGen != null || s.gen >= s.gens;
        if (!s.pred.hasOwnProperty('b3') && s.gen >= 4 && (last || sootTriErr(this.expect(K1.b3), h.G) >= 0.12)) A = K1.b3;
        else if (!s.pred.hasOwnProperty('b2') && s.gen >= 5 && (last || Math.abs(this.expect(K1.b2) - h.B) >= 0.1)) A = K1.b2;
      }
      if (A && !s.pred.hasOwnProperty(A.id)) { s.ask = Object.assign({}, A, { gen: s.gen }); s.asks.push(A.id); (s.askAt || (s.askAt = {}))[A.id] = s.gen; s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id: A.id }); return; }
      s.phase = 'post'; s.t = 0;
    },
    commit(id, v, ev) {
      const s = this.s, A = s.ask; if (!A || A.id !== id) return;
      s.pred[id] = v == null ? null : Array.isArray(v) ? v.slice(0, 3).map(Number) : +v;
      const e = this.expect(A), tol = A.tolEff || A.tol; s.exp[id] = e;
      let err = Infinity;
      if (v != null) err = A.kind === 'tri' ? sootTriErr(v, e) : A.kind === 'x' && e >= A.hi ? (+v >= A.hi - tol ? 0 : Infinity) : Math.abs(+v - e);
      s.hit[id] = err <= tol + 1e-9;
      s.ask = null; s.phase = s.level === 2 ? 'nightgo' : 'post'; s.t = 0;
      ev.push({ k: 'pred', id, hit: s.hit[id], exp: e, tol, kind: A.kind });
    },
    /* the expectation for an ask, from what the player could see (survivors' copies; the rule fitted so far) */
    expect(A) {
      const s = this.s, K = SOOTK, N = K.N;
      if (s.level === 2) return this.expect6(A);
      const h = s.hist[s.hist.length - 1], d = h.dusk, p = d.p, f = 1 - K.MIG / N * (s.mig ? 1 : 0), q = 1 - p;
      const G = [f * p * p, f * 2 * p * q, f * q * q + (1 - f)];   // tomorrow's newborns: HW from the survivors, plus one pale migrant
      if (A.id === 'a2' || A.id === 'b3') return G;
      if (A.id === 'a3' || A.id === 'b2') return s.dom === 'rec' ? G[0] : 1 - G[2];
      if (A.id === 't4') return G[0];                              // if black needed two copies: CC only
      if (A.id === 't5') return s.morph0.slice();                  // the hidden patterns come back unchanged in expectation
      // a1, b1: the generation at whose dawn black first crosses the line, under the player's rule so far
      const tp = h.tone || s.wood.tone[0], rs = sootRho(s.morn, 'soot', 1, tp), rc = sootRho(s.morn, 'clean', 0, tp);
      const kbar = s.morn.length ? s.morn.reduce((a, m) => a + m.k, 0) / s.morn.length : K.QUOTA;
      const B = sootProject(p, 60, i => this.sootAt(s.gen + 1 + i), x => x >= 0.5 ? rs : rc, kbar, s.dom === 'dom', s.mig);
      for (let i = 0; i < B.length; i++) if (A.id === 'a1' ? B[i] >= 0.5 : B[i] < 0.5) return Math.min(A.hi, s.gen + 1 + i);
      return A.hi;
    },
    breedOrEnd(ev) {
      const s = this.s;
      const end = s.level === 0 ? s.gen >= s.gens : (s.crossGen != null || s.gen >= s.gens);
      if (end) { s.phase = 'over'; s.t = 0; ev.push({ k: 'over' }); return; }
      this.breed(ev);
    },
    breed(ev) {
      const s = this.s, K = SOOTK, lay = sootLay(), surv = s.pop.filter(m => !m.dead), par = surv.length >= 2 ? surv : s.pop, kids = [];
      for (let i = 0; i < K.N; i++) {
        const a = par[(R() * par.length) | 0]; let b = par[(R() * par.length) | 0], tr = 0;
        while (b === a && tr++ < 6) b = par[(R() * par.length) | 0];
        kids.push(this.mk(Gen.mate(lay, a.g, b.g)));
      }
      let rescue = false, mj = -1;
      if (s.mig > 0) {
        mj = (R() * K.N) | 0;
        const g = Gen.genome(lay, { carb: { p: 0 }, mA: { p: s.wood.pA }, mB: { p: s.wood.pB }, tone: { m: K.MIGTONE, s: 0.05 } });
        const lost = s.level === 0 && s.passed == null && kids.every((m, i) => i === mj || this.cc(m.g) === 0);
        if (lost) {   // carbonaria lost before black passed half: a black moth from the city (G2); the cause is recorded for the end card
          g[lay.T.carb.off] = 1; rescue = true; s.rescues++;
          if (!s.lostWhy) s.lostWhy = par.some(m => this.cc(m.g) > 0) ? 'chance' : 'ate';   // no carrier survived the morning, or none of the young inherited a copy
        }
        const m = this.mk(g); m.mig = 1; kids[mj] = m;
      }
      s.pop = kids; s.gen++; s.soot = this.sootAt(s.gen);
      s.eaten = 0; s.eb = 0; s.ep = 0; s.time = s.time0 || K.TIMES[s.level] || 10; s.looks = K.LOOKS; s.hungry = 0; s.autoT = 0;
      this.dawnRecord(); this.place();
      const h = s.hist[s.hist.length - 1], slot = s.trunk.indexOf(mj);
      s.phase = 'dawn'; s.t = 0;
      ev.push({ k: 'bred', gen: s.gen, B: h.B, mig: slot, rescue });
      if (s.level === 0 && s.passed == null && h.B >= 0.5) { s.passed = s.gen; ev.push({ k: 'pass', gen: s.gen }); }
      if (s.level === 1 && s.crossGen == null && h.B < 0.5) { s.crossGen = s.gen; ev.push({ k: 'cross', gen: s.gen }); }
    },
    act(a) {
      const s = this.s, ev = []; if (!a || !s) return ev;
      if (s.level === 2) return this.act6(a, ev);
      if (a.k === 'tap') {
        if (s.phase === 'dawn') this.toHunt(ev);
        if (s.phase !== 'hunt') return ev;
        const i = a.i | 0;
        if (i >= 0 && i < s.trunk.length && this.alive(i)) this.peck(i, ev);
        else { s.time -= SOOTK.MISS; s.looks--; ev.push({ k: 'miss' }); }
      } else if (a.k === 'skip') { if (s.phase === 'dusk') s.t = SOOTK.DUSK; else if (s.phase === 'dawn') this.toHunt(ev); }
      else if (a.k === 'auto') { s.auto = !!a.on && (s.phase === 'hunt' || s.phase === 'dawn'); if (!a.on) s.autoAll = false; s.autoT = 0; if (s.auto && s.phase === 'dawn') this.toHunt(ev); ev.push({ k: 'auto', on: s.auto }); }
      else if (a.k === 'predict' && s.ask && a.id === s.ask.id) this.commit(a.id, a.v, ev);
      else if (a.k === 'tolfloor') this.tolFloor(a);
      else if (a.k === 'lw' && s.gen === 1 && s.phase === 'dawn' && !s.eaten && !s.thawed) {   // the saved Lichen wood, logged so a replay rebuilds the same wood
        const log = s.log, unt = s.unt; this.reset(s.level, { wood: a.w, untimed: unt }); this.s.log = log; ev.push({ k: 'lw' });
      }
      return ev;
    },
    tolFloor(a) {   // the view's fingertip floor for the open band (logged, so a replay scores the same); capped at TOLCAP × the science band
      const s = this.s, A = s.ask; if (!A || a.id !== A.id || A.kind === 'x') return;
      A.tolEff = Math.max(A.tol, clamp(+a.v || 0, 0, SOOTK.TOLCAP * A.tol));
    },

    /* ---------- L6: mark, release, recapture ---------- */
    reset6() {
      const s = this.s, K = SOOTK.L6, order = ['rev', 'black', 'pale', 'none'], z = () => ({ nb: 0, sb: 0, np: 0, sp: 0, eb: 0, ep: 0 });
      for (let i = 3; i > 0; i--) { const j = (R() * (i + 1)) | 0, t = order[i]; order[i] = order[j]; order[j] = t; }   // the idea cards' order varies by seed
      Object.assign(s, { phase: 'place', wood6: 'soot', used: 0, budget: K.budget, stock: K.stock, batches: [], night: null, nights: [], hyp: null, conf: null, order6: order,
        data: { soot: z(), clean: z() }, aside: { soot: z(), clean: z() }, asked: { soot: 0, clean: 0 }, powerAt: 0, post: null, brier: null, gen: 1 });
    },
    site6(x, y) {   // x, y in the virtual 390 × 540 stage → {site, crowd}; the site is for the whisper only (moths rest on both)
      const s = this.s; let site = 'trunk';
      for (const j of SOOTK.JOINTS) { const dx = j[0] - x, dy = j[1] - y; if (dx * dx + dy * dy < 40 * 40) site = 'branch'; }
      let crowd = false; for (const b of s.batches) { const dx = b.x - x, dy = b.y - y; if (dx * dx + dy * dy < 44 * 44) { crowd = true; b.crowd = true; } }
      return { site, crowd };
    },
    risk6(wood, black, b) {   // a packed batch draws birds to the spot, and they take the moths that stand out most (designed)
      const K = SOOTK.L6, match = (wood === 'soot') === black;
      return clamp((match ? K.match : K.mismatch) + (b.crowd ? (match ? K.crowdM : K.crowdX) : 0), 0, 0.95);
    },
    act6(a, ev) {
      const s = this.s, K = SOOTK.L6, T = SOOTK.TREE;
      if (a.k === 'release' && s.phase === 'place') {
        if (s.used >= s.budget) return ev;
        if (s.stock <= 0) { ev.push({ k: 'stock' }); return ev; }
        if (s.batches.length >= K.per) { ev.push({ k: 'full' }); return ev; }
        const x = clamp(+a.x || 0, T.x0, T.x1), y = clamp(+a.y || 0, T.y0, T.y1), w = this.site6(x, y);
        s.batches.push({ x, y, site: w.site, crowd: w.crowd, nb: K.nb, np: K.np }); s.stock--;
        ev.push({ k: 'rel', j: s.batches.length - 1, x, y, site: w.site, crowd: w.crowd });
      } else if (a.k === 'wood' && s.phase === 'place') {
        if (s.batches.length) { ev.push({ k: 'woodno' }); return ev; }
        if (a.w === 'soot' || a.w === 'clean') { s.wood6 = a.w; ev.push({ k: 'wood', w: a.w }); }
      } else if (a.k === 'night' && s.phase === 'place') {
        if (!s.batches.length) { ev.push({ k: 'none' }); return ev; }
        if (!s.asked[s.wood6]) { const id = s.wood6 === 'soot' ? 'c1' : 'c2'; s.asked[s.wood6] = 1; s.ask = { id, kind: 'y', chart: 0, lo: 0, hi: 1, tol: 0.1, hud: 'l6ask', gen: s.used + 1, at: s.used + 1, first: id === 'c1' }; s.asks.push(id); s.phase = 'ask'; s.t = 0; ev.push({ k: 'ask', id }); return ev; }
        this.night6(ev);
      } else if (a.k === 'predict' && s.ask && a.id === s.ask.id) this.commit(a.id, a.v, ev);
      else if (a.k === 'tolfloor') this.tolFloor(a);
      else if (a.k === 'conclude' && s.phase === 'place') { s.phase = 'conclude'; s.t = 0; ev.push({ k: 'conclude' }); }
      else if (a.k === 'back' && s.phase === 'conclude' && s.used < s.budget && s.stock > 0) { s.phase = 'place'; s.t = 0; ev.push({ k: 'back' }); }
      else if (a.k === 'hyp' && s.phase === 'conclude' && ['rev', 'black', 'pale', 'none'].indexOf(a.h) >= 0) { s.hyp = a.h; ev.push({ k: 'hyp', h: a.h }); }
      else if (a.k === 'conf' && s.phase === 'conclude' && [0.5, 0.6, 0.7, 0.8, 0.9].indexOf(+a.v) >= 0) { s.conf = +a.v; ev.push({ k: 'conf', v: s.conf }); }
      else if (a.k === 'submit' && s.phase === 'conclude' && s.hyp && s.conf) {
        s.powerAt = this.power6(); s.post = this.posterior6(); s.brier = this.brier6(s.hyp, s.conf, s.post); s.phase = 'over'; s.t = 0; ev.push({ k: 'over' });
      }
      return ev;
    },
    night6(ev) {   // packed batches fly and are counted like the rest, but the evidence sets them aside (s.aside)
      const s = this.s, w = s.wood6, out = [];
      for (const b of s.batches) {
        const r = { x: b.x, y: b.y, site: b.site, crowd: b.crowd, black: [], pale: [] };
        for (let i = 0; i < b.nb; i++) r.black.push(R() < this.risk6(w, true, b) ? 0 : 1);
        for (let i = 0; i < b.np; i++) r.pale.push(R() < this.risk6(w, false, b) ? 0 : 1);
        const D = (b.crowd ? s.aside : s.data)[w]; D.nb += b.nb; D.np += b.np; D.sb += r.black.reduce((a, v) => a + v, 0); D.sp += r.pale.reduce((a, v) => a + v, 0);
        D.eb += this.risk6(w, true, b) * b.nb; D.ep += this.risk6(w, false, b) * b.np;   // expected deaths (for power)
        out.push(r);
      }
      s.night = { wood: w, out }; s.nights.push({ wood: w, n: s.batches.length, sb: out.reduce((a, r) => a + r.black.reduce((x, v) => x + v, 0), 0), sp: out.reduce((a, r) => a + r.pale.reduce((x, v) => x + v, 0), 0) }); s.used++; s.batches = []; s.phase = 'night'; s.t = 0;
      ev.push({ k: 'night', wood: w });
    },
    step6(dt, ev) {
      const s = this.s, K = SOOTK; s.t += dt;
      if (s.phase === 'nightgo') this.night6(ev);
      else if (s.phase === 'night' && s.t >= K.NIGHT) { s.phase = 'tally'; s.t = 0; ev.push({ k: 'tally' }); }
      else if (s.phase === 'tally' && s.t >= K.TALLY) { const out = s.used >= s.budget || s.stock <= 0; s.phase = out ? 'conclude' : 'place'; s.t = 0; ev.push({ k: s.phase, out }); }
      else if (s.phase === 'ask' && !s.unt && s.t >= K.ASKMAX) this.commit(s.ask.id, null, ev);
      return ev;
    },
    expect6(A) {   // expected black share among tonight's survivors, from tonight's batches
      const s = this.s, w = s.wood6; let sb = 0, sp = 0;
      for (const b of s.batches) { sb += b.nb * (1 - this.risk6(w, true, b)); sp += b.np * (1 - this.risk6(w, false, b)); }
      return sb + sp > 0 ? sb / (sb + sp) : 0.5;
    },
    power6() {   // design feedback: power to show both differences (sooty and clean) with a two-sided 5% test, at the true rates for the spaced releases made
      const s = this.s; let P = 1;
      for (const w of ['soot', 'clean']) {
        const D = s.data[w]; if (D.nb < 2 || D.np < 2) return 0;
        const pb = 1 - D.eb / D.nb, pp = 1 - D.ep / D.np, se = Math.sqrt(pb * (1 - pb) / D.nb + pp * (1 - pp) / D.np);
        P *= se > 0 ? sootPhi(Math.abs(pb - pp) / se - 1.96) : 0;
      }
      return P;
    },
    posterior6() {   // P(each idea | your spaced recaptures). Flat priors on survival, so each wood's gap d (black − pale) is about N(d̂, se²);
      // an idea fixes the sign of d in each wood (|d| ≤ δ counts as no difference); 'other' = patterns none of the four predicts
      const s = this.s, d = SOOTK.L6.delta, P = {};
      for (const w of ['soot', 'clean']) {
        const D = s.data[w];
        if (D.nb < 1 || D.np < 1) { P[w] = [1 / 3, 1 / 3, 1 / 3]; continue; }   // [black better, no difference, pale better]: no data, no opinion
        const pb = (D.sb + 1) / (D.nb + 2), pp = (D.sp + 1) / (D.np + 2), g = pb - pp, se = Math.sqrt(pb * (1 - pb) / (D.nb + 2) + pp * (1 - pp) / (D.np + 2));
        const B = sootPhi((g - d) / se), Pl = sootPhi((-d - g) / se); P[w] = [B, Math.max(0, 1 - B - Pl), Pl];
      }
      const out = { rev: P.soot[0] * P.clean[2], black: P.soot[0] * P.clean[0], pale: P.soot[2] * P.clean[2], none: P.soot[1] * P.clean[1] };
      out.other = Math.max(0, 1 - out.rev - out.black - out.pale - out.none);
      return out;
    },
    brier6(hyp, conf, post) {   // expected Brier score of "hyp, with confidence conf" under the posterior, minus the best pip's: 0 = calibrated
      const pr = c => { const p = (post && post[hyp]) || 0; return p * (1 - c) * (1 - c) + (1 - p) * c * c; };
      let best = Infinity; for (const c of [0.5, 0.6, 0.7, 0.8, 0.9]) best = Math.min(best, pr(c));
      return { score: pr(conf), regret: pr(conf) - best };
    },

    /* ---------- contract ---------- */
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_SOOT_V2.stars, n = s.level;
      const mask = s.thawed ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: n === 2 ? { hyp: s.hyp, conf: s.conf, power: s.powerAt, post: s.post ? s.post.rev : null } : { passed: s.passed, cross: s.crossGen, fed: sootFed(s) }, interesting: this.why(s) };
    },
    why(s) {   // the Interesting result, chosen from what actually happened in this run (catch rates, cause of a loss, the evidence)
      const n = s.level;
      if (s.thawed && s.lever) return s.lever === 'nomig' && s.crossGen == null ? 'w_nomig_slow' : 'w_' + s.lever;
      if (n === 2) {
        const one = !s.data.soot.nb || !s.data.clean.nb, aside = s.aside.soot.nb + s.aside.clean.nb, pr = s.post ? s.post.rev : 0, b = s.brier;
        if (one) return 'onewood';
        if (pr < 0.8) return 'weak';
        if (s.hyp !== 'rev') return 'wrong';
        if (b && b.regret > 0.012) return s.conf > pr ? 'overconf' : 'underconf';
        return aside >= 10 ? 'crowded' : null;   // two packed batches or more
      }
      const rate = cls => { let eb = 0, nb = 0, ep = 0, np = 0, k = 0; for (const m of s.morn) if ((m.soot >= 0.5) === (cls === 'soot')) { eb += m.eb; nb += m.nb; ep += m.ep; np += m.np; k += m.k; } return { rb: nb ? eb / nb : 0, rp: np ? ep / np : 0, k, n: s.morn.filter(m => (m.soot >= 0.5) === (cls === 'soot')).length }; };
      if (n === 0) {
        if (s.passed != null) return null;
        if (s.rescues) return s.lostWhy === 'chance' ? 'lost_chance' : 'lost_ate';
        const r = rate('soot'); return r.k < 0.25 * SOOTK.QUOTA * Math.max(1, r.n) ? 'flat_idle' : r.rb >= r.rp ? 'flat_ate' : 'flat';
      }
      if (s.crossGen != null) return null;
      const r = rate('clean'); return r.k < 0.25 * SOOTK.QUOTA * Math.max(1, r.n) ? 'stuck_idle' : r.rp >= r.rb ? 'stuck_pale' : 'stuck';
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s, out = []; if (!s) return out;
      if (s.ask) {
        const A = s.ask;
        if (A.kind === 'tri') { for (let i = 0; i <= 10; i++) for (let j = 0; i + j <= 10; j++) out.push({ k: 'predict', id: A.id, v: [i / 10, j / 10, (10 - i - j) / 10] }); }
        else if (A.kind === 'x') { for (let v = A.lo; v <= A.hi; v++) out.push({ k: 'predict', id: A.id, v }); }
        else for (let v = 0; v <= 20; v++) out.push({ k: 'predict', id: A.id, v: v / 20 });
        return out;
      }
      if (s.level === 2) {
        if (s.phase === 'place') {
          if (s.batches.length < SOOTK.L6.per && s.stock > 0) for (const p of [[150, 220], [246, 306], [150, 398], [240, 458], [195, 160], [210, 260], [180, 350], [200, 480]]) out.push({ k: 'release', x: p[0], y: p[1] });
          if (s.batches.length) out.push({ k: 'night' }); else out.push({ k: 'wood', w: s.wood6 === 'soot' ? 'clean' : 'soot' });
          out.push({ k: 'conclude' });
        } else if (s.phase === 'conclude') {
          for (const h of ['rev', 'black', 'pale', 'none']) out.push({ k: 'hyp', h });
          for (const v of [0.5, 0.6, 0.7, 0.8, 0.9]) out.push({ k: 'conf', v });
          if (s.hyp && s.conf) out.push({ k: 'submit' });
        }
        return out;
      }
      if (s.phase === 'hunt' || s.phase === 'dawn') { for (let i = 0; i < s.trunk.length; i++) if (this.alive(i)) out.push({ k: 'tap', i }); out.push({ k: 'tap', i: -1 }); }
      if (s.phase === 'dusk') out.push({ k: 'skip' });
      return out;
    },
    bots: {   // (s, acts, rnd) → action | null; 'random' is generic (uniform over actions())
      alwaysA(s, acts) { return acts.find(a => a.k === 'predict') || acts.find(a => a.k === 'tap' && a.i >= 0) || acts[0] || null; },
      alwaysB(s, acts) { const pr = acts.filter(a => a.k === 'predict'); if (pr.length) return pr[pr.length - 1]; const t = acts.filter(a => a.k === 'tap' && a.i >= 0); return t.length ? t[t.length - 1] : acts[acts.length - 1] || null; },
      greedy(s, acts) {   // eats the most visible moth; predicts no change (today's value); L6: releases everywhere, both woods, then calls it
        const sim = CH_SOOT_V2.sim;
        if (s.ask) {
          const A = s.ask, h = s.hist ? s.hist[s.hist.length - 1] : null, near = (v) => acts.reduce((b, a) => !b || Math.abs((Array.isArray(a.v) ? 0 : a.v) - v) < Math.abs((Array.isArray(b.v) ? 0 : b.v) - v) ? a : b, null);
          if (A.kind === 'tri') {   // what the player can see: today's genotype dot, or the patterns of the pale moths on the trunk
            let t = h.G; if (A.id === 't5') { const M = [0, 0, 0]; for (const j of s.trunk) { const m = s.pop[j]; if (!sim.black(m)) { const mo = sim.morph(m.g); M[mo === 'band' ? 0 : mo === 'mottle' ? 1 : 2]++; } } t = M[0] + M[1] + M[2] ? M : [1, 1, 1]; }
            return acts.reduce((b, a) => !b || sootTriErr(a.v, t) < sootTriErr(b.v, t) ? a : b, null);
          }
          if (A.kind === 'x') return near(s.gen);
          if (s.level === 2) return near(0.5);
          return near(h.B);
        }
        if (s.level === 2) {
          if (s.phase === 'conclude') return !s.hyp ? { k: 'hyp', h: 'rev' } : !s.conf ? { k: 'conf', v: 0.9 } : { k: 'submit' };
          if (s.phase === 'place') {
            const want = s.used % 2 === 0 ? 'soot' : 'clean', rel = acts.filter(a => a.k === 'release');
            if (!s.batches.length && s.wood6 !== want) return { k: 'wood', w: want };
            if (rel.length) return rel[s.batches.length % rel.length];
            return { k: 'night' };
          }
          return null;
        }
        if (s.phase === 'hunt' || s.phase === 'dawn') { const i = sim.mostVisible(); return i >= 0 ? { k: 'tap', i } : null; }
        return null;
      },
      midpoint(s, acts, rnd) {   // predicts the middle of every axis (the triangle's centre); hunts and investigates like greedy
        if (s.ask) { const A = s.ask; if (A.kind === 'tri') return acts.reduce((b, a) => !b || sootTriErr(a.v, [1, 1, 1]) < sootTriErr(b.v, [1, 1, 1]) ? a : b, null); const mid = A.kind === 'x' ? Math.round((A.lo + A.hi) / 2) : 0.5; return acts.reduce((b, a) => !b || Math.abs(a.v - mid) < Math.abs(b.v - mid) ? a : b, null); }
        return CH_SOOT_V2.sim.bots.greedy(s, acts, rnd);
      },
      copynow(s, acts, rnd) {   // predicts that tomorrow looks like today: today's dawn dot, today's black share, next generation for a crossing
        if (s.ask && s.level < 2 && s.ask.kind === 'x') { const v = Math.min(s.ask.hi, s.gen + 1); return acts.reduce((b, a) => !b || Math.abs(a.v - v) < Math.abs(b.v - v) ? a : b, null); }
        return CH_SOOT_V2.sim.bots.greedy(s, acts, rnd);
      },
      marker(s, acts, rnd) {   // taps whatever labelled point the live graph draws during the ask (the t5 exploit), else the middle
        if (s.ask && s.ask.kind === 'tri') {
          let pt = null; try { const ch = CH_SOOT_V2.notes().charts[s.ask.chart]; pt = ch && (ch.pts || []).find(q => q.label); } catch (e) { pt = null; }
          if (pt) return acts.reduce((b, a) => !b || sootTriErr(a.v, pt.f) < sootTriErr(b.v, pt.f) ? a : b, null);
        }
        return CH_SOOT_V2.sim.bots.midpoint(s, acts, rnd);
      },
      threshold(s, acts) {   // eats pale moths only (tone above 0.4); predicts the middle of each axis; L6: one wood, natural sites, concludes "camouflage" at 70%
        const sim = CH_SOOT_V2.sim;
        if (s.ask) { const A = s.ask; if (A.kind === 'tri') return { k: 'predict', id: A.id, v: [0.3, 0.4, 0.3] }; const mid = A.kind === 'x' ? Math.round((A.lo + A.hi) / 2) : 0.5; return acts.reduce((b, a) => !b || Math.abs(a.v - mid) < Math.abs(b.v - mid) ? a : b, null); }
        if (s.level === 2) {
          if (s.phase === 'conclude') return !s.hyp ? { k: 'hyp', h: 'rev' } : !s.conf ? { k: 'conf', v: 0.7 } : { k: 'submit' };
          if (s.phase === 'place') return s.batches.length < 2 ? acts.filter(a => a.k === 'release')[s.batches.length] || null : { k: 'night' };
          return null;
        }
        if (s.phase === 'hunt' || s.phase === 'dawn') { for (let i = 0; i < s.trunk.length; i++) if (sim.alive(i) && !sim.black(s.pop[s.trunk[i]]) && s.pop[s.trunk[i]].t > 0.4) return { k: 'tap', i }; }
        return null;
      }
    }
  },

  /* ---------- stars: pure functions of the final state, scored against expectations (D1 G10) ---------- */
  stars: {
    discover: (s, n) => n === 2 ? !!(s.data && s.data.soot.nb && s.data.clean.nb && s.data.soot.sb / s.data.soot.nb > s.data.soot.sp / s.data.soot.np && s.data.clean.sp / s.data.clean.np > s.data.clean.sb / s.data.clean.nb)
      : n === 0 ? s.passed != null && sootFed(s) >= 0.7 : s.crossGen != null && sootFed(s) >= 0.6,
    predict: (s, n) => { const ids = SOOTK.PRED[n] || []; let k = 0; for (const id of ids) if (s.hit && s.hit[id]) k++; return k >= 2; },
    // L6: camouflage, with the evidence behind it (posterior ≥ 0.8) and a confidence the evidence supports (expected Brier within 0.012 of the best pip)
    transfer: (s, n) => n === 2 ? s.hyp === 'rev' && !!s.post && s.post.rev >= 0.8 && !!s.brier && s.brier.regret <= 0.012
      : !!(s.hit && s.hit[SOOTK.TRANS[n]]) && (n !== 0 || s.passed != null)   // L4: the two-copy case only matters once black has risen
  },

  /* ---------- teacher hook (D5 §3.10): a 30-bit result code for assignment links (?unit=soot&seed=…) ----------
     bits 0–1 level, 2–4 star mask; L4/L5: 5–9 generation black crossed half (0 = never), 10–16 meals fed %, 17–23 last dawn
     black %, 24–28 carbonaria rescues; L6: 5–6 idea (camouflage 0, black tougher 1, pale tougher 2, no difference 3),
     7–9 confidence (0 none, 1–5 = 50–90%), 10–16 design power %, 17–23 posterior for camouflage %, 24–28 batches used */
  resultBits(s, level) {
    if (!s) return 0; const n = level == null ? s.level : level, r = this.sim.result(), mask = r ? r.mask & 7 : 0, pc = x => clamp(Math.round(100 * (+x || 0)), 0, 100);
    let b = (n & 3) | (mask << 2);
    if (n === 2) {
      const hi = Math.max(0, ['rev', 'black', 'pale', 'none'].indexOf(s.hyp)), ci = s.conf ? Math.round(s.conf * 10) - 4 : 0;
      b |= (hi << 5) | ((ci & 7) << 7) | (pc(s.powerAt) << 10) | (pc(s.post ? s.post.rev : 0) << 17) | ((clamp(SOOTK.L6.stock - (s.stock | 0), 0, 31)) << 24);
    } else {
      const g = n === 0 ? s.passed : s.crossGen, h = s.hist && s.hist[s.hist.length - 1];
      b |= ((clamp(g | 0, 0, 31)) << 5) | (pc(sootFed(s)) << 10) | (pc(h ? h.B : 0) << 17) | ((clamp(s.rescues | 0, 0, 31)) << 24);
    }
    return b >>> 0;
  },

  /* ---------- view ---------- */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._asked = null; this._endT = 0; this._solo = false; this._tolSent = null; this._lensEl = null; this._proj = null; this._mir = null; this.xHi = 0;
    Sim.start(this, n, Object.assign({}, o, { wood: null }));   // every run starts from the default wood; a saved wood enters as a logged action
    // The Lichen Wood's saved wood carries over, except where a run must be the same on every machine: seed links, teacher mode and replays.
    // It enters through Sim.act, so it is in the replay log and a replay code rebuilds the same wood anywhere (D1 G12.7, D5 §3.10).
    const canonical = (typeof Url !== 'undefined' && Url.seed != null) || (typeof Teacher !== 'undefined' && Teacher.on) || !!o.replay || !!o.thaw || n === 2;
    let wood = null; try { if (!canonical && Save.res && Save.res.get) wood = Save.res.get('wood'); } catch (e) { wood = null; }
    if (wood && wood.freqs && wood.tone) Sim.act(this, { k: 'lw', w: { freqs: [+wood.freqs[0], +wood.freqs[1]], tone: [+wood.tone[0], +wood.tone[1]] } });
    this.v = { t: 0, peck: {}, born: 0, dusk: null, flinch: 0, chickPop: [0, 0, 0, 0], soot: this.sim.s.soot != null ? this.sim.s.soot : 0, title: 1, lastTap: null,
      cursor: null, flecks: [], plumes: [], fxq: [], idle: 0, askT0: 0, shown: null, shownT: 1, shownFrom: null };
    if (n === 0 && !o.thaw) this.v.soot = 0;   // the opening: soot settles over the clean wood
    if (n === 2) this.v.shown = { data: JSON.parse(JSON.stringify(this.sim.s.data)), aside: JSON.parse(JSON.stringify(this.sim.s.aside)) };   // the tally card shows what the trap has counted
    this.lens = null;
    if (n < 2 && typeof GenePoolLens !== 'undefined') {
      this.lens = GenePoolLens.create({ items: () => this.lensItems(), jar: null, letters: ['C', 'c'], names: { look: 'Look', genes: 'Genes', jars: 'Jars' }, label: 'Gene pool lens',
        onChange: m => { const s = this.sim.s; if (m !== 'look' && (s.phase === 'hunt' || s.phase === 'dawn')) { if (typeof Whisper !== 'undefined') Whisper.say(this.content.whispers.lens, 'lens'); this.lens.set('look'); } } });
    }
    this.dock(); this.hud(true);
    if (typeof Ghost !== 'undefined' && n < 2) this.ghost = Ghost.show({ verb: 'tap', at: () => this.ghostAt(), until: () => this.sim.s.eaten > 0 || this.sim.s.phase !== 'hunt' && this.sim.s.phase !== 'dawn' });
    if (typeof Ghost !== 'undefined' && n === 2) this.ghost = Ghost.show({ verb: 'tap', at: () => this.px(SOOTK.JOINTS[0][0], SOOTK.JOINTS[0][1] + 6), until: () => this.sim.s.batches.length > 0 || this.sim.s.used > 0 });
    if (typeof Live !== 'undefined') Live.say(this.levels[n].name + '. ' + (n === 2 ? this.content.hud.l6 : n === 1 ? this.content.hud.l5 : this.content.firstWords));
    if (typeof Fx !== 'undefined') Fx.tier(3, () => { });
  },
  w(group, key, vars) { const s = (this.content[group] || {})[key]; return s == null ? '' : typeof Txt !== 'undefined' ? Txt.f(s, vars || {}) : String(s).replace(/\{(\w+)\}/g, (m, k) => vars && vars[k] != null ? vars[k] : m); },
  whisper(key) { if (typeof Whisper !== 'undefined') Whisper.say(this.w('whispers', key), 'soot-' + key); },
  px(x, y) { return [x / 390 * Stage.w, y / 540 * Stage.h]; },
  hudH() { return Math.max(56, this._hudPx || 0, (Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 0); },
  skyBottom() { return this.hudH() + 40; },
  dock() {
    if (typeof Dock === 'undefined') return;
    const s = this.sim.s, L = this.content.labels, b = [];
    if (s.level < 2) {
      // the lens control shows only when it can work: from dusk to the next dawn (in the hunt the genes are not shown)
      const lensNow = s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'post';
      if (lensNow && this.lens && typeof GenePoolLens !== 'undefined' && GenePoolLens.control) b.push({ id: 'lens', el: this._lensEl || (this._lensEl = GenePoolLens.control(this.lens)) });
      if (s.ask) b.push({ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } });
      else if (s.phase === 'dusk') b.push({ id: 'skip', label: L.skip, key: 'Enter', fn: () => Sim.act(this, { k: 'skip' }) });
      else if (s.unt || s.auto || s.thawed || (typeof Fx !== 'undefined' && Fx.lastInput === 'key')) b.push({ id: 'auto', label: L.auto, key: 'A', pressed: !!s.auto, aria: 'Let the jay hunt by contrast', disabled: !(s.phase === 'hunt' || s.phase === 'dawn'), why: this.w('whispers', 'lens'), fn: () => Sim.act(this, { k: 'auto', on: !s.auto }) });
    } else if (s.phase === 'conclude' || s.phase === 'over') {   // the ideas and the confidence pips are on the canvas; the dock goes back or submits
      if (s.used < s.budget && s.stock > 0) b.push({ id: 'back', label: L.back, disabled: s.phase !== 'conclude', fn: () => Sim.act(this, { k: 'back' }) });
      b.push({ id: 'submit', label: L.submit, key: 'Enter', primary: true, disabled: !(s.hyp && s.conf) || s.phase !== 'conclude', why: this.content.hud.submit, fn: () => Sim.act(this, { k: 'submit' }) });
    } else {   // four short labels: they must fit a 390 px dock without the label running under the next button
      b.push({ id: 'w-soot', label: L.wSoot, key: 'W', pressed: s.wood6 === 'soot', disabled: !!s.batches.length && s.wood6 !== 'soot', why: this.w('whispers', 'wood'), fn: () => Sim.act(this, { k: 'wood', w: 'soot' }) });
      b.push({ id: 'w-clean', label: L.wClean, pressed: s.wood6 === 'clean', disabled: !!s.batches.length && s.wood6 !== 'clean', why: this.w('whispers', 'wood'), fn: () => Sim.act(this, { k: 'wood', w: 'clean' }) });
      if (s.ask) b.push({ id: 'lock', label: L.lock, key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(); } });
      else b.push({ id: 'night', label: L.night, key: 'N', primary: true, aria: 'Run the night', disabled: !s.batches.length || s.phase !== 'place', why: this.w('whispers', 'none'), fn: () => Sim.act(this, { k: 'night' }) });
      b.push({ id: 'conclude', label: L.conclude, key: 'C', disabled: s.phase !== 'place', fn: () => Sim.act(this, { k: 'conclude' }) });
    }
    const sig = b.map(x => x.id + (x.pressed ? '+' : '') + (x.disabled ? '-' : '')).join(',');
    if (sig !== this._dockSig || !b.every(x => !x.el || x.el.isConnected)) { this._dockSig = sig; Dock.set(b); }
  },
  hud(force) {
    if (typeof HUD === 'undefined') return;
    const s = this.sim.s, C = this.content.hud, h = s.hist ? s.hist[s.hist.length - 1] : null;
    let text = '', num = '';
    if (s.level === 2) {
      text = s.ask ? C.l6ask : s.phase === 'night' ? C.night : s.phase === 'tally' ? C.tally : s.phase === 'conclude' ? (s.used >= s.budget || s.stock <= 0 ? C.out : C.conclude) : s.phase === 'over' ? this.verdictLine() : s.batches.length ? C.l6more : C.l6;
      num = this.w('labels', 'nights', { n: s.budget - s.used });   // the stock of moths sits on the power panel, so the HUD line keeps its room
    } else {
      if (s.ask) text = C[s.ask.hud];
      else if (s.thawed && s.lever && (s.gen === s.thawGen || s.autoAll) && s.phase !== 'over') text = this.w('hud', 'whatif', { lever: (this.content.levers || {})[s.lever] || s.lever });   // say what changed, while the jay hunts for you
      else if (s.phase === 'hunt' || s.phase === 'dawn') {
        if (s.gen === 1 && s.eaten === 0) text = s.level === 1 ? C.l5 : this.content.firstWords;
        else text = this.w('hud', 'hunt', { n: Math.max(0, s.quota - s.eaten) });
        num = s.eaten + '/' + s.quota;
      } else if (s.phase === 'dusk') text = C.dusk;
      else if (s.phase === 'post') text = C.post;
      else text = C.wait;
      if (!num && h && s.gen > 1) num = 'black ' + Math.round(h.B * 100) + '%';
    }
    if (force || text !== this._hudT || num !== this._hudN) { this._hudT = text; this._hudN = num; HUD.say(text, num); const el = typeof document !== 'undefined' && document.getElementById ? document.getElementById('hud') : null; this._hudPx = el && el.offsetHeight ? el.offsetHeight : 56; }
  },
  verdictLine() {   // "Your data: Camouflage 94%. You said 80%." — the evidence for the idea the player chose, from their own recaptures
    const s = this.sim.s, C = this.content.hud, P = s.post; if (!P || !s.hyp) return C.done;
    const key = { rev: 'hRev', black: 'hBlack', pale: 'hPale', none: 'hNone' }[s.hyp], v = { idea: this.w('labels', key), a: Math.round(100 * (P[s.hyp] || 0)), b: Math.round(100 * s.conf) };
    return this.w('hud', P.rev < 0.8 ? 'thin' : 'verdict', v);
  },
  ghostAt() { const s = this.sim.s; if (!s.trunk) return null; const i = this.sim.mostVisible(); if (i < 0) return null; const p = s.pos[i]; return [p[0] * Stage.w, p[1] * Stage.h]; },
  lensItems() {   // survivors on your trunk where they sit; the rest of the wood's survivors fly in from the top edge
    const s = this.sim.s, sim = this.sim, out = []; if (!s.trunk) return out;
    const r = this.size(), on = {}, ap = m => [this.sim.cc(m.g) >= 1 ? 0 : 1, this.sim.cc(m.g) === 2 ? 0 : 1];
    s.trunk.forEach((j, i) => { on[j] = 1; const m = s.pop[j]; if (m.dead) return; const p = s.pos[i]; out.push({ x: p[0] * Stage.w, y: p[1] * Stage.h, r, a: ap(m) }); });
    let k = 0; const top = this.hudH() + 8;
    for (let j = 0; j < s.pop.length; j++) { if (on[j] || s.pop[j].dead) continue; out.push({ x: 12 + (k * 37) % Math.max(40, Stage.w - 24), y: top + 6 * ((k * 7) % 4), r: 6, a: ap(s.pop[j]) }); k++; }
    return out;
  },
  size() { return Math.max(29, Math.min(64, 0.08 * Math.min(Stage.w, 1.2 * Stage.h))); },   // moths ≈ 8% of the stage unit (D1 §3.1)

  update(dt) {
    const ev = Sim.run(this, dt), s = this.sim.s, v = this.v; v.t += dt;
    for (const e of ev) this.juice(e);
    // smooth view state: soot crossfade, flinch, chick pops, the tally count-up
    const target = s.level === 2 ? (s.wood6 === 'soot' ? 1 : 0) : s.soot;
    const rate = s.level === 0 && s.gen === 1 ? 0.22 : 0.9;   // the opening haze takes about 4 s
    if (v.soot < target) v.soot = Math.min(target, v.soot + dt * rate); else if (v.soot > target) v.soot = Math.max(target, v.soot - dt * rate);
    v.flinch = Math.max(0, v.flinch - dt * 6); for (let k = 0; k < 4; k++) v.chickPop[k] = Math.max(0, v.chickPop[k] - dt / 0.22);
    v.born += dt; for (const i in v.peck) v.peck[i] += dt; v.shownT = Math.min(1, v.shownT + dt / 0.8);
    for (const q of v.fxq) if ((q.t -= dt) <= 0 && !q.done) { q.done = true; q.fn(); } v.fxq = v.fxq.filter(q => !q.done);
    this.cosmetic(dt);
    if (s.ask && this._asked !== s.ask.id) this.openAsk(s.ask);
    if (s.ask && this._tolSent !== s.ask.id && v.t - v.askT0 >= 0.4) {   // once the strip has laid out: the band is at least a fingertip wide on this chart
      const f = this.tolFloor(s.ask); if (f != null) { this._tolSent = s.ask.id; if (f > s.ask.tol + 1e-6) Sim.act(this, { k: 'tolfloor', id: s.ask.id, v: Math.round(f * 1000) / 1000 }); }
    }
    if (this._solo && typeof Strip !== 'undefined' && !Strip.isOpen) this._solo = false;
    if (this._compact && typeof Strip !== 'undefined' && Strip.data) { this._compact = false; try { document.getElementById('strip').style.height = ''; Stage.rezone(); } catch (e) { } }   // Show data wants the full strip
    this.hud(); this.dock();
    const r = this.sim.result();
    if (r && !this._ended) { this._endT += dt; if (this._endT > (typeof Fx !== 'undefined' && Fx.calm ? 0.3 : 1.2)) this.end(r); }
  },
  tolFloor(A) {   // TOLPX on the chart that holds this ask, in the ask's units; null until that chart has been drawn
    try {
      if (typeof Strip === 'undefined' || !Strip.canvas) return null;
      const cv = Strip.canvas(this._solo ? 0 : A.chart), L = cv && cv._lg, G = L && L.G; if (!G) return null;
      if (A.kind === 'tri' && G.P) { const a = G.P([1, 0, 0]), b = G.P([0, 1, 0]), dx = a[0] - b[0], dy = a[1] - b[1], side = Math.sqrt(dx * dx + dy * dy); return side > 20 ? SOOTK.TOLPX / side : null; }
      if (A.kind === 'y' && G.plot && G.plot.h > 20) return SOOTK.TOLPX / G.plot.h * ((A.hi - A.lo) || 1);
    } catch (e) { }
    return null;
  },
  openAsk(A) {
    const v = this.v; this._asked = A.id; v.askT0 = v.t; this._tolSent = null; if (typeof Predict === 'undefined') return;
    const s = this.sim.s, h = s.hist ? s.hist[s.hist.length - 1] : null, unt = !!(Save.d.ui && Save.d.ui.unt);
    let start = 0.5, axis = { lo: A.lo == null ? 0 : A.lo, hi: A.hi == null ? 1 : A.hi };
    if (A.kind === 'x') start = Math.min(A.hi, s.gen + 1);   // starts where tapping the ghost cannot be a free hit
    else if (A.kind === 'y') start = h ? h.B : 0.5;   // L6 has no hist: the ghost starts at even survival
    else if (A.kind === 'tri') start = A.id === 't5' ? [0.06, 0.06, 0.88] : [0.6, 0.3, 0.1];
    if (this.lens && (A.id === 'a3' || A.id === 'b2')) this.lens.set('jars');
    // on a phone a chart-0 ask shows that chart alone, in a strip one chart high, so the scene (the jars) stays in view above it
    this._solo = typeof Strip !== 'undefined' && Strip.phone && Strip.phone() && A.chart === 0;
    if (typeof Strip !== 'undefined') Strip.redraw();
    this._askSoft = unt || A.first ? null : 12;   // the level's first prediction is untimed: the player is still reading
    Predict.ask({ id: A.id, chart: A.chart, kind: A.kind, axis, start, tol: A.tol, at: A.at, soft: this._askSoft, say: this.content.hud[A.hud] });
    if (this._solo) this.compactStrip();
    if (typeof Snd2 !== 'undefined') Snd2.play('tick', { x: Stage.w / 2, y: Stage.h / 2 });
  },
  compactStrip() {   // the open phone strip is 60% of the screen; with one chart it needs only one figure's height
    try {
      const st = document.getElementById('strip'); if (!st || !Strip.isOpen || Strip.data) return;
      const vh = (typeof window !== 'undefined' && window.innerHeight) || 780, fig = clamp(0.24 * vh, 150, 260);
      st.style.height = Math.round(fig + 40) + 'px'; this._compact = true; Stage.rezone(); Strip.redraw();
    } catch (e) { }
  },
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, W = Stage.w, H = Stage.h;
    if (e.k === 'peck') {
      const x = e.x * W, y = e.y * H; v.peck[e.i] = 0;
      if (F) v.fxq.push({ t: F.calm ? 0 : 0.09, fn: () => { F.burst('dust', x, y, 3); F.ring(x, y, this.size() * 0.55, { dashed: true }); } });   // the beak shadow telegraphs for 90 ms, then three puffs
      Snd.peck(); const c = this.chickPos(e.chick); v.chickPop[e.chick] = 1; if (F) F.pop('+1', c[0], c[1] - 18, 1);
      if (this.ghost && this.ghost.hide) this.ghost.hide();
    } else if (e.k === 'miss') {
      const t = v.lastTap || [W / 2, H / 2]; if (F) { F.burst('dust', t[0], t[1], 1); F.pop('−½ s', t[0], t[1] - 16, -1); } v.flinch = 1; Snd.miss(); this.whisper('miss');
    } else if (e.k === 'fed') { this.whisper('fed'); if (typeof Snd2 !== 'undefined') Snd2.play('peep', { x: this.chickPos(0)[0], y: this.chickPos(0)[1] }); }
    else if (e.k === 'hunt') { v.title = Math.min(v.title, 0.25); }
    else if (e.k === 'auto') this.whisper(e.on ? 'auto' : 'manual');
    else if (e.k === 'dusk') {
      v.dusk = this.duskPlan(e); if (F) F.tier(2, () => { }); if (typeof Snd2 !== 'undefined') Snd2.play('dusk', { x: W / 2, y: H * 0.8 });
      if (e.hungry > 0) { this.whisper('hungry'); for (let k = SOOTK.CHICKS - e.hungry; k < SOOTK.CHICKS; k++) { const c = this.chickPos(k); if (F) F.ring(c[0], c[1], 15, { dashed: true }); } }
      if (!s.thawed && !s.auto) { v.idle = e.eaten ? 0 : v.idle + 1; if (v.idle >= 2) this.whisper('idle'); }   // a nudge for a player who has not played two mornings running
      if (typeof Live !== 'undefined') Live.say(Txt.f('Dusk. {n} moths survive to breed.', { n: e.surv }));
    } else if (e.k === 'ask') { if (typeof Live !== 'undefined') Live.say(this.content.hud[s.ask.hud]); }
    else if (e.k === 'pred') {
      let moved = true; if (typeof Predict !== 'undefined') { for (let i = 0; i < 3; i++) { const r = Predict.overlay(i); if (r && r.id === e.id) moved = !!r.moved; } Predict.reveal(e.id, e.exp, e.tol); }
      if (this._askSoft && !moved && v.t - v.askT0 >= this._askSoft - 0.25) this.whisper('timeup');
      if (typeof Snd2 !== 'undefined') Snd2.play(e.hit ? 'count' : 'tock', { x: W / 2, y: H / 2, i: 6 });
      this._asked = null; if (this.lens) this.lens.set('look');
    } else if (e.k === 'bred') {
      v.born = 0; v.title = 1; v.dusk = null; this._asked = null;
      if (typeof Freezer !== 'undefined' && !Sim.replaying(this)) Freezer.put(this.id, e.gen, this.sim.snapshot());
      if (e.rescue) this.whisper('lost'); else if (e.mig >= 0) this.whisper('mig');
      if (typeof Live !== 'undefined') Live.say(Txt.f('Generation {g}. Black moths {b}%.', { g: e.gen, b: Math.round(e.B * 100) }));
      if (typeof Snd !== 'undefined' && Snd.dawn) Snd.dawn();
    } else if (e.k === 'pass' || e.k === 'cross') {
      this.whisper(e.k === 'pass' ? 'pass' : 'below'); if (F) F.tier(3, ms => { const b = this.drawerBox(); F.ring(b.x + b.w - 20, b.y + b.h / 2, 26); });
    } else if (e.k === 'rel') {
      const p = this.px(e.x, e.y); if (F) { F.burst('dust', p[0], p[1], 3); F.ring(p[0], p[1], 26); F.pop(this.w('labels', 'batch'), p[0], p[1] - 36, 0); }   // what one tap releases
      if (typeof Snd2 !== 'undefined') Snd2.play('wing', { x: p[0], y: p[1] });
      this.whisper(e.crowd ? 'crowd' : e.site === 'trunk' ? 'trunk' : 'branch');
    } else if (e.k === 'full' || e.k === 'none' || e.k === 'woodno' || e.k === 'stock') { this.whisper(e.k === 'woodno' ? 'wood' : e.k); if (F) F.shake(3, 120); }
    else if (e.k === 'night') { v.night = { t: 0 }; if (typeof Snd2 !== 'undefined') Snd2.play('dusk', { x: W / 2, y: H / 2 }); }
    else if (e.k === 'tally') {   // only now does the card learn tonight's numbers, and they count up as the survivors reach the trap
      v.shownFrom = v.shown; v.shown = { data: JSON.parse(JSON.stringify(s.data)), aside: JSON.parse(JSON.stringify(s.aside)) }; v.shownT = F && F.calm ? 1 : 0;
      if (typeof Snd2 !== 'undefined') Snd2.play('count', { x: W / 2, y: H * 0.8, i: 3 }); if (F) F.tier(2, () => { });
      const n = s.night; if (n && typeof Live !== 'undefined') { let b = 0, p = 0, nb = 0, np = 0; for (const r of n.out) { b += r.black.reduce((a, x) => a + x, 0); p += r.pale.reduce((a, x) => a + x, 0); nb += r.black.length; np += r.pale.length; } Live.say(Txt.f('Recaptured {b} of {nb} black and {p} of {np} pale.', { b, nb, p, np })); }
    }
    else if (e.k === 'over') { if (typeof Snd2 !== 'undefined') Snd2.play('interesting', { x: W / 2, y: H / 2 }); if (s.level === 2 && typeof Live !== 'undefined') Live.say(this.verdictLine()); }
  },
  duskPlan(e) {   // egg tray and winter cull, drawn from the view's own RNG (cosmetic)
    const s = this.sim.s, rnd = typeof Fx !== 'undefined' ? () => Fx.rnd() : (() => { let k = 1; return () => (k = (k * 16807) % 2147483647) / 2147483647; })();
    const surv = []; s.trunk.forEach((j, i) => { if (!s.pop[j].dead) surv.push(i); });
    const order = []; for (let i = 0; i < 300; i++) order.push(i); for (let i = 299; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = order[i]; order[i] = order[j]; order[j] = t; }
    const cullAt = new Array(300).fill(-1); for (let k = 0; k < 270; k++) cullAt[order[k]] = (k % 6);   // six batches of 45
    // each dot is 4 eggs from one surviving parent, tinted by that parent's colour: pale parents' eggs above, black parents' below (as in the drawer)
    const par = s.pop.filter(m => !m.dead), nb = par.filter(m => this.sim.black(m)).length, dark = new Array(300).fill(false);
    const cut = par.length ? Math.round(300 * (par.length - nb) / par.length) : 300; for (let k = cut; k < 300; k++) dark[k] = true;
    return { surv, cullAt, dark, jb: e.jb, jp: e.jp };
  },
  cosmetic(dt) {   // cosmetic: soot flecks and chimney smoke (Fx.rnd only)
    const v = this.v, s = this.sim.s, rnd = typeof Fx !== 'undefined' ? () => Fx.rnd() : () => 0.5, calm = typeof Fx !== 'undefined' && Fx.calm;
    const smoking = s.level === 0 ? !s.nosoot : s.level === 1 ? false : s.wood6 === 'soot';
    if (!calm && s.level === 0 && v.soot < s.soot && v.flecks.length < 40 && rnd() < dt * 30) v.flecks.push({ x: rnd() * Stage.w, y: this.hudH() + 30, vx: 6 + 10 * rnd(), vy: 22 + 30 * rnd(), a: 0, life: 3 + 2 * rnd() });
    for (const f of v.flecks) { f.a += dt; f.x += f.vx * dt; f.y += f.vy * dt; }
    v.flecks = v.flecks.filter(f => f.a < f.life && f.y < Stage.h);
    if (!calm && smoking && v.plumes.length < 26 && rnd() < dt * 9) { const c = this.chimneys(); const k = (rnd() * c.length) | 0; v.plumes.push({ x: c[k][0], y: c[k][1], r: 3, a: 0, life: 3 + 2 * rnd(), vx: 9 + 6 * rnd() }); }
    for (const p of v.plumes) { p.a += dt; p.x += p.vx * dt; p.y -= 4 * dt; p.r += 3.2 * dt; }
    v.plumes = v.plumes.filter(p => p.a < p.life);
  },
  end(r) {
    this._ended = true; const final = this.level === this.levels.length - 1, last = typeof Freezer !== 'undefined' ? Freezer.list(this.id)[0] : null;   // What if? reruns from the earliest vial, so the change has generations to show
    const levers = this.level === 0 ? ['recessive', 'nosoot'] : this.level === 1 ? ['paledom', 'nolag', 'nomig'] : null, C = this.content;
    End.show(this, { level: this.level, mask: r.mask, final, interesting: r.interesting, whatIf: last && levers ? { gen: last.gen, levers } : null,
      take: (C.levelTake || [])[this.level] || null, body: (C.levelBody || [])[this.level] || null,
      chart: cv => { if (typeof LiveGraph !== 'undefined') LiveGraph.draw(cv, this.notes().charts[0], 'paper'); }, chartLabel: this.level === 2 ? 'Survivors by colour in each wood' : 'Black moths and carbonaria copies by generation' });
  },

  teacherStep() {   // Teacher → (step): run on to the next dawn, prediction or verdict
    for (let i = 0; i < 3000; i++) { const s = this.sim.s, ph = s.phase, g = s.gen; this.update(1 / 30); const t = this.sim.s; if (t.ask || (t.phase !== ph && (t.phase === 'dawn' || t.phase === 'place' || t.phase === 'conclude' || t.phase === 'over')) || t.gen !== g) break; }
  },

  /* ---------- input ---------- */
  tap(x, y) {
    const s = this.sim.s; this.v.lastTap = [x, y];
    if (s.level === 2) {
      if (s.phase === 'place') Sim.act(this, { k: 'release', x: x / Stage.w * 390, y: y / Stage.h * 540 });
      if (s.phase === 'conclude') { const L = this.concludeLayout(); for (const c of L.cards) if (x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.ht) Sim.act(this, { k: 'hyp', h: c.id }); for (const p of L.pips) if (Math.abs(x - p.x) <= p.r + 6 && Math.abs(y - p.y) <= p.r + 8) Sim.act(this, { k: 'conf', v: p.v }); }
      return;
    }
    if (s.phase !== 'hunt' && s.phase !== 'dawn') return;   // a late tap at dusk must not wipe the eggs: Skip (or Enter) does that
    const r = Math.max(22, this.size() * 0.6), pts = s.pos.map((p, i) => this.sim.alive(i) ? { x: p[0] * Stage.w, y: p[1] * Stage.h, r } : { x: -1e4, y: -1e4 });
    const i = Stage.hit ? Stage.hit(x, y, pts, 22) : -1;
    Sim.act(this, { k: 'tap', i });
  },
  onKey(k, e) {
    const s = this.sim.s, W = Stage.w, H = Stage.h, c = this.v.cursor || (this.v.cursor = [W / 2, H / 2]);
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[k];
    if (d) { c[0] = clamp(c[0] + d[0] * W * 0.06, 8, W - 8); c[1] = clamp(c[1] + d[1] * H * 0.06, this.hudH() + 40, H - 64); return true; }
    if (k === ' ' || k === 'Spacebar') { this.tap(c[0], c[1]); return true; }
    if ((k === 'a' || k === 'A') && s.level < 2) { Sim.act(this, { k: 'auto', on: !s.auto }); return true; }
    if ((k === 'n' || k === 'N') && s.level === 2) { Sim.act(this, { k: 'night' }); return true; }
    if ((k === 'w' || k === 'W') && s.level === 2) { Sim.act(this, { k: 'wood', w: s.wood6 === 'soot' ? 'clean' : 'soot' }); return true; }
    if ((k === 'c' || k === 'C') && s.level === 2) { Sim.act(this, { k: 'conclude' }); return true; }
    if (s.level === 2 && s.phase === 'conclude' && /^[1-9]$/.test(k)) { const d = +k; if (d <= 4) Sim.act(this, { k: 'hyp', h: (s.order6 || ['rev', 'black', 'pale', 'none'])[d - 1] }); else Sim.act(this, { k: 'conf', v: d / 10 }); return true; }
    return false;
  },

  /* ---------- drawing ---------- */
  barks(w, h) {   // the clean and sooty bark, baked once per canvas size (legacy barkTex; cached across levels)
    const d = w * h > 300000 ? 1 : Math.min(1.5, Stage.dpr || 1), key = Math.round(w) + 'x' + Math.round(h) + '@' + d;
    const C = SOOTK.bark || (SOOTK.bark = {});
    if (C.key !== key) { C.key = key; C.d = d; C.clean = barkTex(w, h, d, 4242, false).cv; C.soot = barkTex(w, h, d, 4242, true).cv; C.vig = null; C.g = null; C.g6 = null; }
    return C;
  },
  ground(w, h, soot, paint) {   // one cached layer: clean bark, sooty bark at the current haze, vignette (re-composited only when the haze moves a step)
    const B = this.barks(w, h), d = Math.min(2, Stage.dpr || 1), key = B.key + '|' + Math.round(clamp(soot, 0, 1) * 24) + (paint ? '|6' + this.skyBottom() : '');   // composited once at device resolution: one 1:1 blit a frame
    const L = paint ? (B.g6 || (B.g6 = {})) : (B.g || (B.g = {}));
    if (L.key !== key) {
      if (!L.cv || L.cv.width !== Math.round(w * d) || L.cv.height !== Math.round(h * d)) L.cv = mkCanvas(w * d, h * d);
      const g = L.cv.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, w, h);
      g.drawImage(B.clean, 0, 0, w, h); const a = Math.round(clamp(soot, 0, 1) * 24) / 24; if (a > 0) { g.globalAlpha = a; g.drawImage(B.soot, 0, 0, w, h); g.globalAlpha = 1; }
      if (paint) paint(g, B, a); else this.vignette(g, w, h);
      L.key = key;
    }
    return L.cv;
  },
  onResize() { },
  draw(c, w, h) {
    const s = this.sim.s; if (!s) return;
    if (s.level === 2) { this.draw6(c, w, h); return; }
    const v = this.v;
    c.drawImage(this.ground(w, h, v.soot), 0, 0, w, h);
    this.skyline(c, w, h, s.level === 0 ? 1 - (s.nosoot ? 1 : 0) : 0, v.soot);
    // timer strip
    const top = this.hudH() + 40, frac = s.phase === 'hunt' ? clamp(s.unt ? s.looks / SOOTK.LOOKS : s.time / (s.time0 || 10), 0, 1) : s.phase === 'dawn' ? 1 : 0;
    c.fillStyle = 'rgba(20,16,12,.45)'; c.fillRect(0, top, w, 5);
    c.fillStyle = frac < 0.25 ? '#D27A4C' : '#E8DFC9'; c.fillRect(v.flinch * 4, top, w * frac, 5);   // cream, rust when the morning is nearly over (never a data ink)
    // moths
    const size = this.size(), dusk = s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'post' || s.phase === 'over';
    const lensOn = this.lens && this.lens.mode !== 'look' && dusk;
    s.trunk.forEach((j, i) => {
      const m = s.pop[j], p = s.pos[i], x = p[0] * w, y = p[1] * h;
      if (m.dead) {
        const k = v.peck[i]; if (k == null || k > 0.45) return;   // the lift: 6 px up, swell, fade (≈ 300 ms)
        const tel = clamp(k / 0.09, 0, 1), lift = clamp((k - 0.09) / 0.3, 0, 1), strike = k >= 0.09 && k < 0.14 && !(typeof Fx !== 'undefined' && Fx.calm);
        if (typeof Rig !== 'undefined') Rig.draw(c, 'moth', this.sim.ph(m), x, y - 6 * lift, { size: size * (1 + 0.3 * lift) * (strike ? 1.15 : 1), rot: p[2], id: m.id, alpha: 1 - lift });
        if (strike) { c.fillStyle = 'rgba(255,250,235,.55)'; c.beginPath(); c.arc(x, y, size * 0.5, 0, TAU); c.fill(); }   // the strike: a one-frame punch and flash
        if (k < 0.2) {   // the jay's shadow over the moth: a head and beak closing in (telegraph 90 ms)
          c.save(); c.globalAlpha = 0.55 * (k < 0.09 ? tel : 1 - (k - 0.09) / 0.11); c.fillStyle = '#0A0806'; c.translate(x + 6, y - 4);
          c.beginPath(); c.ellipse(size * 0.6 * (1 - tel), -size * 0.5 * (1 - tel), size * 0.42, size * 0.3, -0.6, 0, TAU); c.fill();
          c.beginPath(); c.moveTo(-size * 0.05, 0); c.lineTo(size * (0.55 - 0.3 * tel), -size * 0.2); c.lineTo(size * (0.5 - 0.3 * tel), size * 0.08); c.closePath(); c.fill(); c.restore();
        }
        return;
      }
      const ph = this.sim.ph(m), born = clamp(v.born / 0.5, 0, 1);
      if (typeof Rig !== 'undefined') Rig.draw(c, 'moth', ph, x, y, { size, rot: p[2], id: m.id, alpha: born });
      if (m.mig && born < 1) { c.strokeStyle = 'rgba(232,223,201,' + (1 - born) + ')'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(w + 10, y - 40); c.quadraticCurveTo((x + w) / 2, y - 60, x, y); c.stroke(); c.setLineDash([]); }
    });
    if (dusk) this.drawDusk(c, w, h);
    if (lensOn) { if (this.lens.mode === 'jars') { const J = this.jarBox(); if (J.compact) this.drawPQ(c, J); else { this.lens.o.jar = J; this.lens.draw(c); } } else this.lens.draw(c); }
    if (s.phase === 'dawn' || v.title > 0) this.drawTitle(c, w, h);
    for (const f of v.flecks) { c.fillStyle = 'rgba(20,18,16,' + (0.8 * (1 - f.a / f.life)) + ')'; c.fillRect(f.x, f.y, 2.5, 2.5); }
    if (v.cursor && typeof Fx !== 'undefined' && Fx.lastInput === 'key') { const cu = v.cursor; c.strokeStyle = '#E8DFC9'; c.lineWidth = 2; c.beginPath(); c.arc(cu[0], cu[1], 16, 0, TAU); c.moveTo(cu[0] - 22, cu[1]); c.lineTo(cu[0] - 10, cu[1]); c.moveTo(cu[0] + 10, cu[1]); c.lineTo(cu[0] + 22, cu[1]); c.stroke(); }
    this.drawBand(c, w, h);
  },
  vignette(c, w, h) {
    const C = SOOTK.bark; if (!C.vig || C.vig.w !== w || C.vig.h !== h) {
      const cv = mkCanvas(w, h), g = cv.getContext('2d'), gr = g.createRadialGradient(w / 2, h * 0.55, Math.min(w, h) * 0.35, w / 2, h * 0.55, Math.max(w, h) * 0.8);
      gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.38)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); cv.w = w; cv.h = h; C.vig = cv;
    }
    c.drawImage(C.vig, 0, 0, w, h);
  },
  chimneys() { const w = Stage.w, y = this.hudH() + 36, xs = [0.08, 0.17, 0.31, 0.46, 0.62, 0.71, 0.86, 0.94]; return xs.map((f, i) => [f * w, y - 14 - (i % 3) * 5]); },
  skyline(c, w, h, smoky, soot) {   // a strip of the Black Country beyond the wood: a sulphur-brown sky, brick mills, chimneys and their smoke (D6 decision 7)
    const y0 = this.hudH(), y1 = y0 + 40;
    const sky = c.createLinearGradient(0, y0, 0, y1); sky.addColorStop(0, css(mix([196, 190, 176], [96, 80, 64], soot))); sky.addColorStop(1, css(mix([222, 212, 190], [150, 116, 82], soot)));
    c.fillStyle = sky; c.fillRect(0, y0, w, 40);
    const brick = css(mix([112, 72, 56], [52, 36, 30], Math.max(soot, smoky ? 0.5 : 0.2)));
    c.fillStyle = brick;
    c.beginPath(); c.moveTo(0, y1);   // saw-tooth mill roofs
    const roofs = [[0, 0.62], [0.06, 0.5], [0.12, 0.62], [0.18, 0.5], [0.24, 0.62], [0.36, 0.48], [0.44, 0.48], [0.52, 0.6], [0.66, 0.44], [0.72, 0.56], [0.8, 0.44], [0.86, 0.56], [0.92, 0.5], [1, 0.62]];
    for (const [f, k] of roofs) c.lineTo(f * w, y0 + 40 * k);
    c.lineTo(w, y1); c.closePath(); c.fill();
    for (const [x, yy] of this.chimneys()) { c.fillRect(x - 3, yy, 6, y1 - yy); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x - 4, yy, 8, 2); c.fillStyle = brick; }   // brick stacks with sooty caps
    c.fillStyle = 'rgba(232,196,140,' + (0.25 + 0.35 * soot) + ')';   // a few lit mill windows (natural paint)
    for (let i = 0; i < 14; i++) { const f = ((i * 2654435761) >>> 0) / 4294967296; c.fillRect(f * w, y0 + 40 * (0.66 + 0.18 * (i % 3) / 2), 2, 2); }
    for (const p of this.v.plumes) { c.fillStyle = 'rgba(48,42,38,' + (0.45 * (1 - p.a / p.life)) + ')'; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fill(); }
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, y1 - 1, w, 2);
    const s = this.sim.s, K = SOOTK;
    if (s.level < 2 && s.gen) {   // the same years per generation in both levels, so the rise and the fall can be compared on screen
      const y = K.Y0[s.level] + (s.gen - 1) * K.YEARS, yb = Lbl.put('year', this.w('labels', 'year', { y }), w - 8, y0 + 12, { size: 12, align: 'right', mono: true });
      Lbl.put('xn', this.w('labels', s.level === 0 ? 'xn4' : 'xn5'), (yb ? yb.x : w - 70) - 6, y0 + 12, { size: 12, align: 'right', mono: true });
      if (s.level === 0 && s.gen <= 2) Lbl.put('hc', this.w('labels', 'compressed'), w - 8, y0 + 30, { size: 12, align: 'right', mono: true });   // D0: the 12-carrier start is history compressed
    }
  },
  chickPos(k) { const H = Stage.h; return [24 + k * 30, H - 26]; },
  drawerBox() { const W = Stage.w, H = Stage.h, x = 146; return { x, y: H - 52, w: W - x - 12, h: 42 }; },
  jarBox() {   // always inside the slice of canvas the strip leaves visible (an open phone strip covers the lower stage); room for the pills above and below
    const W = Stage.w, H = Stage.h, g = Stage.zones && Stage.zones.graph, top = this.skyBottom() + 30, floor = (g && g.h > 0 ? g.y : H - 58) - 26, room = floor - top;
    const h = clamp(room, 24, H * 0.3);
    return { x: W * 0.14, y: floor - h, w: W * 0.72, h, compact: room < 72 };
  },
  drawPQ(c, J) {   // the jars folded into one p|q bar, for a slice too thin for jars: survivors' C copies (blue) and c copies (amber)
    const L = this.lens, n = L ? L.counts() : [0, 0], t = (n[0] || 0) + (n[1] || 0) || 1, f = (n[0] || 0) / t, y = J.y + J.h / 2 - 9;
    c.fillStyle = 'rgba(21,33,32,.86)'; rrect(c, J.x - 6, y - 24, J.w + 12, 60, 8); c.fill();
    c.fillStyle = 'rgb(47,95,208)'; c.fillRect(J.x, y, J.w * f, 18); c.fillStyle = 'rgb(232,180,22)'; c.fillRect(J.x + J.w * f, y, J.w * (1 - f), 18);
    c.strokeStyle = '#E8DFC9'; c.lineWidth = 1.5; c.strokeRect(J.x + 0.5, y + 0.5, J.w - 1, 17);
    Lbl.put('pq-C', 'C ' + (n[0] || 0), J.x, y + 28, { size: 12, align: 'left' }); Lbl.put('pq-c', 'c ' + (n[1] || 0), J.x + J.w, y + 28, { size: 12, align: 'right' });
    Lbl.put('pq-q', 'q = ' + Math.round((1 - f) * 100) / 100, J.x + J.w / 2, y - 12, { size: 12, mono: true });
  },
  drawBand(c, w, h) {   // the nest and the specimen drawer: one column per generation, black below and pale above (the in-scene graph)
    const s = this.sim.s, v = this.v, y0 = h - 58;
    c.fillStyle = 'rgba(21,33,32,.86)'; c.fillRect(0, y0, w, 58); c.fillStyle = 'rgba(232,223,201,.25)'; c.fillRect(0, y0, w, 1);
    for (let k = 0; k < SOOTK.CHICKS; k++) {
      const p = this.chickPos(k), per = s.quota / SOOTK.CHICKS;
      const got = Math.floor(s.eaten / SOOTK.CHICKS) + (k < s.eaten % SOOTK.CHICKS ? 1 : 0), f = clamp(got / per, 0, 1);
      const hungry = (s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'post') && k >= SOOTK.CHICKS - s.hungry;
      if (hungry) { c.strokeStyle = 'rgba(232,223,201,.7)'; c.setLineDash([4, 3]); c.lineWidth = 1.5; c.beginPath(); c.arc(p[0], p[1], 11, 0, TAU); c.stroke(); c.setLineDash([]); continue; }
      if (typeof Rig !== 'undefined') Rig.draw(c, 'chick', { fed: s.phase === 'hunt' || s.phase === 'dawn' ? f : 1, gape: s.phase === 'hunt' && f < 1 }, p[0], p[1], { size: 28, state: v.chickPop[k] > 0 ? 'alert' : null, alert: v.chickPop[k] });
    }
    const b = this.drawerBox(), n = Math.max(s.gens, s.hist.length + 1), cw = Math.min(16, (b.w - 4) / n), gap = Math.max(1, cw * 0.18);
    c.strokeStyle = 'rgba(232,223,201,.35)'; c.lineWidth = 1; c.strokeRect(b.x + 0.5, b.y + 0.5, b.w - 1, b.h - 1);
    const line = 0.5, ly = b.y + b.h - b.h * line;   // both levels: the half line
    s.hist.forEach((r, i) => {
      const x = b.x + 2 + i * cw, hb = b.h * r.B, cur = i === s.hist.length - 1, a = cur ? clamp(v.born / 0.4, 0, 1) : 1;
      c.globalAlpha = a; c.fillStyle = '#1C1A18'; c.fillRect(x, b.y + b.h - hb, cw - gap, hb);
      c.fillStyle = css(t2rgb(clamp(r.tone || 0.72, 0.5, 0.9), 0.84)); c.fillRect(x, b.y, cw - gap, b.h - hb);
      if (r.dusk) { const yd = b.y + b.h - b.h * r.dusk.B; c.fillStyle = '#E8DFC9'; c.beginPath(); c.moveTo(x + (cw - gap) / 2, yd - 3); c.lineTo(x + cw - gap, yd); c.lineTo(x + (cw - gap) / 2, yd + 3); c.lineTo(x, yd); c.closePath(); c.fill(); }
      c.globalAlpha = 1;
    });
    if (s.phase === 'dusk' || s.phase === 'ask' || s.phase === 'post') { const x = b.x + 2 + s.hist.length * cw; c.setLineDash([3, 2]); c.strokeStyle = 'rgba(232,223,201,.6)'; c.strokeRect(x + 0.5, b.y + 0.5, cw - gap - 1, b.h - 1); c.setLineDash([]); }
    c.setLineDash([4, 3]); c.strokeStyle = 'rgba(232,223,201,.8)'; c.beginPath(); c.moveTo(b.x, ly); c.lineTo(b.x + b.w, ly); c.stroke(); c.setLineDash([]);
    Lbl.put('line', this.w('labels', 'line50'), b.x + b.w - 4, ly, { size: 12, align: 'right' });
  },
  drawDusk(c, w, h) {   // dusk in the canvas: tint, other jays, the egg tray at the true ratio, the winter cull
    const s = this.sim.s, v = this.v, t = s.phase === 'dusk' ? s.t : 9, D = v.dusk;
    c.fillStyle = 'rgba(14,18,30,' + (0.32 * clamp(t / 0.5, 0, 1)) + ')'; c.fillRect(0, 0, w, h);
    if (!D || s.phase !== 'dusk') return;
    if (t < 1.2 && D.jb + D.jp > 0) Lbl.put('jays', this.w('labels', 'jays', { n: D.jb + D.jp }), 10, this.hudH() + 58, { size: 13, align: 'left' });
    const cols = 25, pitch = Math.min(12, (w - 40) / cols), tw = cols * pitch, tx = (w - tw) / 2, ty = h * 0.46, rows = 12;
    if (t > 0.25) {   // D4 §5.3: eggs at the true ratio (arcs, 20 ms stagger), then the winter cull in six batches; about 1.7 s
      const fill = clamp((t - 0.25) / 0.6, 0, 1), shown = Math.floor(300 * fill), cull = t > 1.0 ? Math.min(6, Math.floor((t - 1.0) / 0.1) + 1) : 0;
      c.fillStyle = 'rgba(21,33,32,.72)'; rrect(c, tx - 10, ty - 12, tw + 20, rows * pitch + 24, 10); c.fill();
      for (let k = 0; k < shown; k++) {
        if (D.cullAt[k] >= 0 && D.cullAt[k] < cull) continue;
        const x = tx + (k % cols) * pitch + pitch / 2, y = ty + Math.floor(k / cols) * pitch + pitch / 2;
        const dk = D.dark && D.dark[k]; c.fillStyle = dk ? '#1C1A18' : '#EFE6CC'; c.beginPath(); c.ellipse(x, y, pitch * 0.32, pitch * 0.4, 0, 0, TAU); c.fill();
        if (dk) { c.strokeStyle = 'rgba(232,223,201,.8)'; c.lineWidth = 1; c.stroke(); }   // a black parent's eggs: dark with a paper rim
      }
      Lbl.put('eggs', this.w('labels', 'eggs'), w / 2, ty + rows * pitch + 22, { size: 12 });
      if (t < 1.0) for (let q = 0; q < D.surv.length; q++) {   // one dashed arc per survivor, 20 ms stagger
        const a = clamp((t - 0.25 - q * 0.02) / 0.3, 0, 1); if (a <= 0 || a >= 1) continue;
        const p = s.pos[D.surv[q]], x0 = p[0] * w, y0 = p[1] * h, x1 = tx + ((q * 17) % cols) * pitch, y1 = ty + Math.floor(((q * 17) % 300) / cols) * pitch;
        c.strokeStyle = 'rgba(232,223,201,.7)'; c.setLineDash([3, 3]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 40, lerp(x0, x1, a), lerp(y0, y1, a)); c.stroke(); c.setLineDash([]);
      }
    }
  },
  drawTitle(c, w, h) {
    const s = this.sim.s, v = this.v; if (s.phase === 'dawn') v.title = Math.max(v.title, 0.6); else v.title = Math.max(0, v.title - 1 / 40);
    const a = clamp(v.title, 0, 1); if (a <= 0.02) return;
    c.globalAlpha = a; c.fillStyle = 'rgba(12,18,17,.45)'; c.fillRect(0, h * 0.42 - 34, w, 72);
    Lbl.put('gen', this.w('labels', 'gen', { g: s.gen }), w / 2, h * 0.42 - 6, { size: 26, pill: false, ink: '#E8DFC9', weight: 700 });
    const key = s.level === 0 ? (s.nosoot ? 'clean' : s.soot < 1 ? 'soot' : 'smog') : s.gen === 1 ? 'clear' : s.soot > 0 ? 'lichen' : 'clean';
    Lbl.put('sub', this.w('labels', key), w / 2, h * 0.42 + 22, { size: 14, pill: false, ink: '#E8DFC9' });
    c.globalAlpha = 1;
  },

  /* L6: a tree in the chosen wood, release batches, the night, the light trap, tallies and the power meter */
  draw6(c, w, h) {
    const s = this.sim.s, v = this.v, soot = clamp(v.soot, 0, 1), top = this.skyBottom();
    c.drawImage(this.ground(w, h, soot, (g, B, a) => this.tree6(g, w, h, B, a)), 0, 0, w, h);   // the far wood, the release tree and its branches: one cached layer
    this.skyline(c, w, h, s.wood6 === 'soot' ? 1 : 0, soot);
    const size = Math.max(20, this.size() * 0.72), ph = black => black ? { carb: true, tone: 0.06 } : { tone: 0.72, hue: SOOTK.HUE, mot: 0.68, morph: 'speck' };
    const spot = (bx, by, k) => { const p = this.px(bx, by), col = k % 5, row = Math.floor(k / 5); return [p[0] + (col - 2) * size * 0.62, p[1] + (row - 0.5) * size * 0.72]; };
    const ring = (x, y, bl) => { c.strokeStyle = bl ? 'rgba(232,223,201,.9)' : 'rgba(27,22,18,.75)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, size * 0.46, 0, TAU); c.stroke(); };   // marked: a ring so black moths read on soot
    for (const bt of s.batches) for (let k = 0; k < bt.nb + bt.np; k++) { const q = spot(bt.x, bt.y, k), bl = k % 2 === 0 && k / 2 < bt.nb; if (typeof Rig !== 'undefined') Rig.draw(c, 'moth', ph(bl), q[0], q[1], { size, rot: 0.25 * ((k % 3) - 1), id: 'b' + k + bt.x + bt.y }); ring(q[0], q[1], bl); }
    if ((s.phase === 'night' || s.phase === 'tally') && s.night) {
      const t = s.phase === 'night' ? s.t : SOOTK.NIGHT, dark = t < 1.0 ? t / 1.0 : t < 1.9 ? 1 : Math.max(0, 1 - (t - 1.9) / 0.5), tp = this.trapPos();
      s.night.out.forEach((r, bi) => {
        const moths = []; for (let k = 0; k < r.black.length + r.pale.length; k++) { const bl = k % 2 === 0 && k / 2 < r.black.length, idx = bl ? k / 2 : k - Math.min(r.black.length, Math.ceil(k / 2)); moths.push([bl, bl ? r.black[k / 2] : r.pale[Math.max(0, idx)]]); }
        moths.forEach(([bl, live], k) => {
          const q = spot(r.x, r.y, k), when = 2.0 + 0.07 * ((k * 3 + bi * 5) % 13), gone = !live && t > when;
          if (gone) { if (t < when + 1.2) { c.strokeStyle = 'rgba(232,223,201,' + (1 - (t - when) / 1.2) + ')'; c.setLineDash([4, 3]); c.lineWidth = 1.5; c.beginPath(); c.arc(q[0], q[1], size * 0.42, 0, TAU); c.stroke(); c.setLineDash([]); } return; }
          const fly = live && t > 2.9 ? clamp((t - 2.9 - 0.02 * k) / 0.6, 0, 1) : 0; if (fly >= 1) return;
          const mx = lerp(q[0], tp[0], fly), my = lerp(q[1], tp[1] - 12, fly) - 30 * Det.sin(Math.PI * fly);
          if (typeof Rig !== 'undefined') Rig.draw(c, 'moth', ph(bl), mx, my, { size: size * (1 - 0.45 * fly), id: 'n' + k + bi, rot: 0.25 * ((k % 3) - 1) });
          if (fly < 0.5) ring(mx, my, bl);
        });
      });
      c.fillStyle = 'rgba(6,8,20,' + (0.66 * dark) + ')'; c.fillRect(0, 0, w, h);
      if (dark > 0.6) { c.fillStyle = 'rgba(232,223,201,' + (0.6 * dark) + ')'; for (let k = 0; k < 18; k++) c.fillRect((k * 97) % w, top + (k * 53) % Math.max(20, h * 0.3), 1.5, 1.5); }
      if (t > 1.8 && t < 2.95 && typeof Rig !== 'undefined') {   // first light: two great tits work the trunk
        const k = (t - 1.8) / 1.15; Rig.draw(c, 'tit', {}, lerp(-30, w + 30, k), h * 0.34 + 40 * Det.sin(k * 6), { size: 46 }); Rig.draw(c, 'tit', { carry: true }, lerp(w + 30, -30, k), h * 0.62 + 30 * Det.sin(k * 5 + 1), { size: 42, flip: true });
      }
    }
    for (const bt of s.batches) {   // a packed batch's outline is drawn broken and amber: it will be set aside
      const p = this.px(bt.x, bt.y); c.strokeStyle = bt.crowd ? 'rgba(217,164,65,.95)' : 'rgba(232,223,201,.55)'; c.setLineDash(bt.crowd ? [2, 5] : [4, 4]); c.lineWidth = bt.crowd ? 2.5 : 1.5;
      c.beginPath(); c.ellipse(p[0], p[1], size * 1.8, size * 0.95, 0, 0, TAU); c.stroke(); c.setLineDash([]);
    }
    this.drawTrap(c, w, h);
    this.drawTally(c, w, h);
    this.drawPower(c, w, h);
    if (s.phase === 'conclude' || s.phase === 'over') this.drawConclude(c, w, h);
    const wb = Lbl.put('wood', this.w('labels', s.wood6 === 'soot' ? 'sooty' : 'cleanw'), 10, top + 16, { size: 14, align: 'left' });
    Lbl.put('xn', this.w('labels', 'xn6'), (wb ? wb.x + wb.w : 110) + 6, top + 16, { size: 12, align: 'left', mono: true });
    if (s.used > 0 || s.batches.some(b => b.crowd)) Lbl.put('debate', this.w('labels', 'debate'), 10, top + 86, { size: 12, align: 'left', ink: '#1B1612', bg: '#D9A441' });   // the Contested pill (D0 §3): no star depends on it
    if (v.cursor && typeof Fx !== 'undefined' && Fx.lastInput === 'key') { const cu = v.cursor; c.strokeStyle = '#E8DFC9'; c.lineWidth = 2; c.beginPath(); c.arc(cu[0], cu[1], 16, 0, TAU); c.stroke(); }
  },
  concludeLayout() {   // four idea cards (2 × 2, in the seed's order) and five confidence pips, in canvas px; card: {id, key, x, y, w, ht}
    const W = Stage.w, H = Stage.h, top = this.skyBottom() + 108, gap = 10, cw = Math.min(260, (W - 3 * gap) / 2), ch = clamp((H - top - 150) / 2, 64, 96), x0 = (W - 2 * cw - gap) / 2;
    const keys = { rev: 'hRev', black: 'hBlack', pale: 'hPale', none: 'hNone' }, order = this.sim.s.order6 || ['rev', 'black', 'pale', 'none'];
    const cards = order.map((id, i) => ({ id, key: keys[id], x: x0 + (i % 2) * (cw + gap), y: top + Math.floor(i / 2) * (ch + gap), w: cw, ht: ch }));
    const py = top + 2 * ch + gap + 34, pw = Math.min(64, (W - 40) / 5), pips = [0.5, 0.6, 0.7, 0.8, 0.9].map((v, i) => ({ v, x: W / 2 + (i - 2) * pw, y: py, r: 20 }));
    return { cards, pips };
  },
  drawConclude(c, w, h) {   // each idea drawn as what it predicts in each wood (▲ on the colour that survives better, = for neither); after Submit, each card fills to what your data say
    const s = this.sim.s, L = this.concludeLayout(), over = s.phase === 'over', P = over ? s.post : null;
    const pred = { rev: [1, -1], black: [1, 1], pale: [-1, -1], none: [0, 0] };   // +1: black survives better; −1: pale does
    c.fillStyle = 'rgba(10,14,13,.6)'; c.fillRect(0, this.skyBottom() + 96, w, h - this.skyBottom() - 96);
    for (const k of L.cards) {
      const sel = s.hyp === k.id, hh = k.ht;
      c.fillStyle = sel ? '#E8DFC9' : 'rgba(28,42,40,.95)'; rrect(c, k.x, k.y, k.w, hh, 10); c.fill();
      c.lineWidth = sel ? 3 : 1.2; c.strokeStyle = sel ? '#1B1612' : 'rgba(232,223,201,.55)'; c.stroke();
      const ink = sel ? '#1B1612' : '#E8DFC9';
      Lbl.put('h-' + k.id, this.w('labels', k.key), k.x + 10, k.y + 16, { size: 14, align: 'left', pill: false, ink, weight: 700 });
      pred[k.id].forEach((d, i) => {   // a mini plate per wood: bark swatch, a black and a pale moth square, an arrow on the favoured one
        const bx = k.x + 10 + i * (k.w - 20) / 2, by = k.y + 32, bw = (k.w - 30) / 2, bh = hh - 42;
        c.fillStyle = i === 0 ? '#2B2621' : '#B8B9A2'; rrect(c, bx, by, bw, bh, 6); c.fill();
        const sq = Math.min(14, bh * 0.36), ys = by + bh / 2 - sq / 2 + 4;
        c.fillStyle = '#121010'; c.fillRect(bx + bw * 0.28 - sq / 2, ys, sq, sq); c.fillStyle = css(t2rgb(0.74, 0.84)); c.fillRect(bx + bw * 0.72 - sq / 2, ys, sq, sq);
        c.strokeStyle = '#E8DFC9'; c.lineWidth = 1; c.strokeRect(bx + bw * 0.28 - sq / 2 + 0.5, ys + 0.5, sq - 1, sq - 1); c.strokeStyle = '#1B1612'; c.strokeRect(bx + bw * 0.72 - sq / 2 + 0.5, ys + 0.5, sq - 1, sq - 1);
        const ax = d > 0 ? bx + bw * 0.28 : d < 0 ? bx + bw * 0.72 : bx + bw / 2, ay = ys - 4;
        c.fillStyle = '#D9A441'; c.strokeStyle = '#1B1612';
        if (d) { c.beginPath(); c.moveTo(ax - 5, ay); c.lineTo(ax + 5, ay); c.lineTo(ax, ay - 8); c.closePath(); c.fill(); c.stroke(); }
        else { c.fillRect(ax - 5, ay - 7, 10, 2); c.fillRect(ax - 5, ay - 3, 10, 2); }
      });
      if (P) {   // the evidence bar: how strongly your recaptures support this idea (hatched when the design had under 80% power)
        const f = clamp(P[k.id] || 0, 0, 1), bx = k.x + 10, by = k.y + hh - 9, bw = k.w - 20;
        c.fillStyle = 'rgba(10,14,13,.55)'; c.fillRect(bx, by, bw, 6); c.fillStyle = '#D9A441'; c.fillRect(bx, by, bw * f, 6);
        if (s.powerAt < 0.8) { c.save(); c.beginPath(); c.rect(bx, by, bw * f, 6); c.clip(); c.strokeStyle = 'rgba(27,22,18,.7)'; c.lineWidth = 1; for (let q = -6; q < bw; q += 4) { c.beginPath(); c.moveTo(bx + q, by + 6); c.lineTo(bx + q + 6, by); c.stroke(); } c.restore(); }
        Lbl.put('p-' + k.id, this.w('labels', 'pct', { n: Math.round(f * 100) }), k.x + k.w - 10, k.y + 16, { size: 12, align: 'right', mono: true });
      }
    }
    for (const p of L.pips) {
      const sel = s.conf === p.v; c.beginPath(); c.arc(p.x, p.y, p.r, 0, TAU); c.fillStyle = sel ? '#E8DFC9' : 'rgba(28,42,40,.95)'; c.fill(); c.lineWidth = sel ? 3 : 1.2; c.strokeStyle = sel ? '#1B1612' : 'rgba(232,223,201,.6)'; c.stroke();
      Lbl.put('c-' + p.v, this.w('labels', 'c' + Math.round(p.v * 100)), p.x, p.y, { size: 12, pill: false, ink: sel ? '#1B1612' : '#E8DFC9', mono: true, weight: 700 });
    }
  },
  tree6(g, w, h, B, soot) {   // the far wood dimmed by distance; a lit trunk with side branches (moths rest under branches in nature)
    const top = this.skyBottom(), T = SOOTK.TREE, L = this.px(T.x0, 0)[0], R = this.px(T.x1, 0)[0];
    g.fillStyle = soot > 0.5 ? 'rgba(14,12,10,.62)' : 'rgba(20,30,22,.55)'; g.fillRect(0, 0, w, h);
    g.save(); g.beginPath(); g.moveTo(L + 6, top); g.lineTo(R - 6, top); g.quadraticCurveTo(R + 4, h * 0.7, R + 14, h); g.lineTo(L - 14, h); g.quadraticCurveTo(L - 4, h * 0.7, L + 6, top); g.closePath();
    g.clip(); g.drawImage(B.clean, 0, 0, w, h); if (soot > 0) { g.globalAlpha = soot; g.drawImage(B.soot, 0, 0, w, h); g.globalAlpha = 1; }
    const sh = g.createLinearGradient(L - 14, 0, R + 14, 0); sh.addColorStop(0, 'rgba(0,0,0,.5)'); sh.addColorStop(0.22, 'rgba(0,0,0,0)'); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)');
    g.fillStyle = sh; g.fillRect(L - 20, top, R - L + 40, h - top); g.restore();
    for (const j of SOOTK.JOINTS) {
      const p = this.px(j[0], j[1]), dir = j[0] < 195 ? -1 : 1, x0 = dir < 0 ? L + 4 : R - 4, x2 = dir < 0 ? -10 : w + 10, th = 13;
      g.fillStyle = soot > 0.5 ? '#2E2924' : '#8B917F'; g.beginPath(); g.moveTo(x0, p[1] - th - 6); g.quadraticCurveTo((x0 + x2) / 2, p[1] - th - 26, x2, p[1] - 44); g.lineTo(x2, p[1] - 30); g.quadraticCurveTo((x0 + x2) / 2, p[1] - 8, x0, p[1] + 4); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 1.5; g.stroke();
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(p[0], p[1] + 8, 26, 9, 0, 0, TAU); g.fill();   // the shade under the joint: a natural resting spot
    }
  },
  trapPos() { return [Stage.w * 0.5, Stage.h - 46]; },
  drawTrap(c, w, h) {   // a Robinson light trap at the foot of the tree
    const p = this.trapPos(), s = this.sim.s, glow = s.phase === 'night' || s.phase === 'tally';
    if (glow) { const g = c.createRadialGradient(p[0], p[1] - 14, 2, p[0], p[1] - 14, 70); g.addColorStop(0, 'rgba(255,240,200,.6)'); g.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = g; c.fillRect(p[0] - 70, p[1] - 84, 140, 140); }
    c.fillStyle = '#3B3530'; c.strokeStyle = '#1B1612'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(p[0] - 24, p[1] - 6); c.lineTo(p[0] + 24, p[1] - 6); c.lineTo(p[0] + 17, p[1] + 20); c.lineTo(p[0] - 17, p[1] + 20); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = glow ? '#FFF0C8' : '#B9B29F'; c.beginPath(); c.arc(p[0], p[1] - 15, 8, 0, TAU); c.fill(); c.stroke();
    if (!glow) Lbl.put('trap', this.w('labels', 'trap'), p[0] + 34, p[1] + 6, { size: 12, align: 'left' });
  },
  drawTally(c, w, h) {   // what the trap has counted in each wood (spaced batches), on a paper card: back of sent, by colour; counts up at the tally
    const s = this.sim.s, v = this.v, x0 = w - 128, y0 = this.skyBottom() + 6, sw = 12, S = v.shown || { data: s.data, aside: s.aside }, F0 = v.shownFrom || S, k = clamp(v.shownT, 0, 1);
    const num = (wd, f) => f === 'nb' || f === 'np' ? s.data[wd][f] : Math.round(lerp(F0.data[wd][f], S.data[wd][f], k)), set = wd => S.aside[wd].nb + S.aside[wd].np;   // sent is known at release; back counts up at the tally
    const hasAside = set('soot') + set('clean') > 0, H = hasAside ? 100 : 86;
    c.fillStyle = 'rgba(232,223,201,.94)'; rrect(c, x0 - 6, y0, 128, H, 8); c.fill(); c.strokeStyle = 'rgba(27,22,18,.4)'; c.lineWidth = 1; c.stroke();
    Lbl.put('t-hb', this.w('labels', 'hBack') + '/' + this.w('labels', 'hSent'), x0 + 18, y0 + 9, { size: 12, align: 'left', pill: false, ink: '#1B1612', weight: 600 });   // column heads
    [['soot', 'sooty'], ['clean', 'cleanw']].forEach(([wd, lab], r) => {
      const y = y0 + 22 + r * 34, cur = s.wood6 === wd;
      Lbl.put('t-' + wd, this.w('labels', lab), x0 + 2, y, { size: 12, align: 'left', pill: false, ink: '#1B1612', weight: cur ? 800 : 600 });
      c.fillStyle = '#1C1A18'; c.fillRect(x0 + 2, y + 11, sw, sw); c.fillStyle = css(t2rgb(0.72, 0.84)); c.fillRect(x0 + 60, y + 11, sw, sw); c.strokeStyle = '#1B1612'; c.strokeRect(x0 + 60.5, y + 11.5, sw - 1, sw - 1);
      Lbl.put('tb-' + wd, this.w('labels', 'tally', { a: num(wd, 'sb'), b: num(wd, 'nb') }), x0 + 18, y + 17, { size: 12, align: 'left', pill: false, ink: '#1B1612', mono: true });
      Lbl.put('tp-' + wd, this.w('labels', 'tally', { a: num(wd, 'sp'), b: num(wd, 'np') }), x0 + 76, y + 17, { size: 12, align: 'left', pill: false, ink: '#1B1612', mono: true });
    });
    if (hasAside) Lbl.put('t-aside', this.w('labels', 'aside', { n: set('soot') + set('clean') }), x0 + 2, y0 + 90, { size: 12, align: 'left', pill: false, ink: '#7A5A1A', weight: 600 });
  },
  drawPower(c, w, h) {   // the Evidence power meter (D4 §4.2 look): hatched to 80%, a diamond for the power of your design so far
    const pw = this.sim.power6(), x = 12, y = this.skyBottom() + 50, bw = Math.min(150, w * 0.36), bh = 12;
    c.fillStyle = 'rgba(21,33,32,.86)'; rrect(c, x - 6, y - 22, bw + 12, 42, 8); c.fill();
    c.save(); c.beginPath(); c.rect(x, y, bw * 0.8, bh); c.clip(); c.strokeStyle = 'rgba(232,223,201,.35)'; c.lineWidth = 1; for (let k = -bh; k < bw; k += 5) { c.beginPath(); c.moveTo(x + k, y + bh); c.lineTo(x + k + bh, y); c.stroke(); } c.restore();
    c.strokeStyle = '#E8DFC9'; c.lineWidth = 1.2; c.strokeRect(x + 0.5, y + 0.5, bw - 1, bh - 1);
    c.setLineDash([3, 2]); c.beginPath(); c.moveTo(x + bw * 0.8, y - 3); c.lineTo(x + bw * 0.8, y + bh + 3); c.stroke(); c.setLineDash([]);
    const dx = x + bw * clamp(pw, 0, 1); c.fillStyle = '#1C2A28'; c.beginPath(); c.moveTo(dx, y - 4); c.lineTo(dx + 7, y + bh / 2); c.lineTo(dx, y + bh + 4); c.lineTo(dx - 7, y + bh / 2); c.closePath(); c.fill(); c.stroke();
    Lbl.put('pw', this.w('labels', 'power', { n: Math.round(pw * 100) }), x, y - 11, { size: 12, align: 'left', pill: false, ink: '#E8DFC9' });
    Lbl.put('stk', this.w('labels', 'stock', { n: this.sim.s.stock }), x + bw, y - 11, { size: 12, align: 'right', pill: false, ink: '#E8DFC9', mono: true });   // the bred stock left
  },

  /* ---------- the live graph (notes() feeds the strip; never pauses) ---------- */
  notes() {
    const s = this.sim.s; if (!s) return { stats: [], charts: [] };
    if (s.level === 2) {   // the chart and the numbers learn a night's result at the tally, as the card does (no number before the change is seen)
      const P = this.sim.power6(), ser = [], live = s.phase === 'night' || s.phase === 'nightgo', nights = live ? s.nights.slice(0, -1) : s.nights;
      const S = (this.v && this.v.shown) || { data: s.data, aside: s.aside }, D = S.data, A = S.aside;
      for (const [wd, lab, ink] of [['soot', 'sooty', 'ink'], ['clean', 'clean', 'mig']]) {
        const d = []; nights.forEach((n, i) => { if (n.wood === wd && n.sb + n.sp > 0) d.push([i + 1, n.sb / (n.sb + n.sp)]); });
        if (d.length) ser.push({ d, ink, label: lab });
      }
      const trace = { type: 'trace', title: 'Black share of survivors', x: { lo: 1, hi: s.budget + 1, label: 'night', fmt: 'int' }, y: { lo: 0, hi: 1, label: 'black', fmt: 'pct' },
        series: ser, ghost: [{ d: [[1, 0.5], [s.budget + 1, 0.5]] }], frame: 'designed' };
      const row = (lab, wd) => [lab, D[wd].sb + '/' + D[wd].nb + ' black, ' + D[wd].sp + '/' + D[wd].np + ' pale', 'Came back of sent, spaced batches only.' + (A[wd].nb ? ' Set aside (packed): ' + (A[wd].nb + A[wd].np) + ' moths.' : '')];
      const stats = [['Nights left', String(s.budget - s.used), 'Each night takes up to four batches of 5 black and 5 pale moths.'], ['Moths left', s.stock + ' batches', 'The bred stock for every night.'],
        ['Power', Math.round(P * 100) + '%', 'Chance your design shows both differences, if they are real.'], row('Sooty wood', 'soot'), row('Clean wood', 'clean')];
      if (s.phase === 'over' && s.post) stats.push(['Your data', ['rev', 'black', 'pale', 'none'].map(k => this.w('labels', { rev: 'hRev', black: 'hBlack', pale: 'hPale', none: 'hNone' }[k]) + ' ' + Math.round(100 * s.post[k]) + '%').join(', '), 'How strongly your recaptures support each idea; the rest fits none of them.']);
      return { stats, charts: [trace] };
    }
    const H = s.hist, hi = Math.max(s.gens + 1, H.length + 1, this.xHi || 0), black = H.map(r => r.B), cop = H.map(r => r.p), dom = H.map(r => s.dom === 'rec' ? r.p * r.p : 1 - (1 - r.p) * (1 - r.p));
    const ghost = [{ d: dom.map((y, i) => [i + 1, y]) }];   // the black share expected from p: lies on the black line at dawn (named in the data table)
    const pj = this.proj(); if (pj) ghost.push({ d: pj, label: 'expected' });
    const mi = this.mirror(); if (mi) ghost.push({ d: mi, label: this.w('labels', 'mirror') });
    const ask = s.ask, xHi = ask && ask.kind === 'x' ? ask.hi : Math.max(hi, this.xHi || 0);
    const trace = { type: 'trace', title: 'Black moths', x: { lo: 1, hi: xHi, label: 'generation' }, y: { lo: 0, hi: 1, label: 'share', fmt: 'pct' },
      series: [{ d: black, ink: 'ink', label: 'black' }, { d: cop, ink: 'A', label: 'C' }], ghost, frame: 'designed', marks: s.passed ? [s.passed] : s.crossGen ? [s.crossGen] : [] };
    const h = H[H.length - 1], pts = [];
    H.slice(-6).forEach(r => { pts.push({ f: r.G, kind: 'dawn' }); if (r.dusk) pts.push({ f: r.dusk.G, kind: 'dusk' }); });
    let side = { type: 'tri', title: 'Genotypes', variant: 'hw', corners: ['CC', 'Cc', 'cc'], pts, trail: H.map(r => r.G), frame: 'designed' };
    // t5: the pattern triangle is blank while the ask is open (the player recalls the Lichen Wood mix); the Lichen Wood point appears with the reveal
    // L5 generation 1 shows the wood's pale patterns before the soot; at t5 (generation 2) the triangle is blank, and the point returns with the reveal
    const t5 = s.level === 1 && (s.gen === 1 || (ask && ask.id === 't5') || (s.askAt && s.askAt.t5 === s.gen && s.pred.hasOwnProperty('t5')));
    if (t5) side = { type: 'tri', title: 'Pale patterns', variant: 'simplex', corners: ['banded', 'mottled', 'speckled'], pts: ask && ask.id === 't5' ? [] : [{ f: s.morph0 || sootMix(s.wood), kind: 'dawn', label: s.wood.saved ? 'Lichen Wood' : 'before soot' }], frame: 'designed' };
    const two = s.dom === 'rec', solo = this._solo && typeof Strip !== 'undefined' && Strip.isOpen;
    return {
      stats: [['Generation', s.gen + ' of up to ' + s.gens, 'Each morning is one generation.'], ['Black moths', Math.round(h.B * 100) + '%', two ? 'At dawn. Two C copies make a moth black.' : 'At dawn. One C copy makes a moth black.'],
        ['C copies (p)', Math.round(h.p * 100) + '%', 'Share of colour-gene copies that are carbonaria. ' + (two ? 'Above the black share.' : 'Below the black share.')],
        two ? ['Carbonaria copies hidden', Math.round((h.p > 0 ? h.G[1] / (h.G[1] + 2 * h.G[0]) : 0) * 100) + '%', 'Share of carbonaria copies hidden in pale Cc moths.']
          : ['Pale copies hidden', Math.round(h.hid * 100) + '%', 'Share of typica copies sitting inside black moths.'], ['Meals', s.fed + ' of ' + s.need, 'Moths fed to the chicks so far.']],
      charts: solo ? [trace] : [trace, side]
    };
  },
  proj() {   // the expected trajectory revealed after a timing prediction (a1 or b1), from the gen it was asked
    const s = this.sim.s, id = s.level === 0 ? 'a1' : 'b1'; if (s.exp[id] == null) return null;
    if (this._proj && this._proj.id === id && this._proj.n === s.morn.length && this._proj.lv === s.level) return this._proj.d;
    const g0 = 1, h = s.hist[g0 - 1]; if (!h || !h.dusk) return null;
    const morn = s.morn.filter(m => m.gen <= g0), tp = h.tone || s.wood.tone[0], rs = sootRho(morn, 'soot', 1, tp), rc = sootRho(morn, 'clean', 0, tp);
    const kbar = morn.length ? morn.reduce((a, m) => a + m.k, 0) / morn.length : SOOTK.QUOTA, n = Math.max(2, Math.min(40, Math.ceil(s.exp[id]) + 2 - g0));
    const B = sootProject(h.dusk.p, n, i => this.sim.sootAt(g0 + 1 + i), x => x >= 0.5 ? rs : rc, kbar, s.dom === 'dom', s.mig), d = [[g0, h.B]].concat(B.map((y, i) => [g0 + 1 + i, y]));
    this.xHi = Math.min(s.level === 0 ? 20 : 30, Math.max(this.xHi || 0, Math.ceil(s.exp[id]) + 2));
    const cut = d.findIndex(q => s.level === 0 ? q[1] >= 0.5 : q[1] < 0.5); if (cut >= 0) d.length = Math.min(d.length, cut + 2);   // the line ends just past the crossing
    this._proj = { id, lv: s.level, n: s.morn.length, d }; return d;
  },
  mirror() {   // L5, after b1: L4's rise of a dominant colour, flipped onto this graph. Same start distance from 0 or 1, same bird (designed rule, 12 meals)
    const s = this.sim.s; if (s.level !== 1 || s.exp.b1 == null || s.thawed) return null;
    if (this._mir && this._mir.lv === s.level) return this._mir.d;
    const h0 = s.hist[0], p0 = 1 - Math.sqrt(clamp(h0.B, 0, 1)), tp = s.wood.tone[0];
    const up = sootProject(p0, 14, () => 1, x => sootRho([], 'soot', x, tp), SOOTK.QUOTA, true, 0), d = up.map((b, i) => [1 + i, 1 - b]);   // no migrant either way: a pure mirror
    const cut = d.findIndex(q => q[1] < 0.5); if (cut >= 0) d.length = Math.min(d.length, cut + 2);
    this._mir = { lv: s.level, d }; return d;
  }
};
V2.push(CH_SOOT_V2);
EXPORT.SOOT = { K: SOOTK, project: sootProject, split: sootSplit, rho: sootRho, detect: sootDetect, phi: sootPhi };   // for tests/oracle_soot.js

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.soot = SOOT_C.take;
  BRIDGE.soot = 'You were the jay in the Lichen Wood. Now soot blackens the bark, and one dominant allele sets the pace.';
  MODEL.soot = 'History compressed: about 4 years a generation in both levels. Carbonaria is one dominant allele that arose once. One pale migrant joins each generation; a black one only if carbonaria is lost early. You eat about 40% of each generation, far more than real birds.';
  RECALL.soot = { q: 'Black moths are 96% of a wood, and pale is now favoured. Why does pale return slowly at first?', opts: [['hid', 'Most pale copies hide in black moths'], ['mut', 'Pale needs new mutations'], ['dom', 'Pale is dominant']], ans: 'hid', why: 'Pale shows only with two typica copies. When pale is rare, most typica copies sit unseen in black Cc moths, so selection reaches few of them.' };
  delete TRANSFER.soot;   // rebuilt as L4's opening gesture: "When will black pass half?" on the live graph (D2 §8)
}
