/* ================= v2/mixer.js: Equilibrium (id 'census', CH_HWE_V2), the one Hardy–Weinberg chapter (D6) =================
   D6 (binding): one chapter, eight levels of rising conceptual complexity, replacing the legacy Census by id (legacy stays at
   ?v1=1). Hardy–Weinberg is the null model of population genetics, and every force shows itself as a departure from it.
   The beetle is the anchor organism; it wears its genotype one allele per wing case (blue A, amber a). L6 borrows Norway rats
   (warfarin resistance) for heterozygote advantage, the only non-beetle level.

     L0 Two copies each   tag beetles; copies fly into jars; Yule's bet on a 30-generation time-lapse     (C1, B1)
     L1 The tumbler       crank eggs and sperm onto the p × q square; the 2pq tiles collapse into bars      (C1)
     L2 One generation    lopsided pens cranked once land on the HW curve; unequal sexes take two         (C1, A1)
     L3 The census        drag a quadrat; χ² with 1 df; small samples fit almost anything                 (A1, A2)
     L4 Close relatives   a valve on the tumbler: brother–sister matings; F; like-mates-like at one gene  (C6)
     L5 Two demes         sample, then draw a line: the Wahlund deficit vanishes when the sample is split  (C5)
     L6 The bait-layer    lay warfarin against rats: newborns fit HW, adults show a heterozygote excess    (C9, C7)
     L7 Case files (boss) diagnose five populations with a field-day budget; fit is not stasis; carriers  (A1, C2, C5, A2)

   Code shape (API_v2 §9, D5 decisions 22–24): a headless sim with plain-JSON state, seeded R() only (WF and Gen for the
   draws), so a run is (seed, level, actions); every word in EQ_C; tunables in P; the view juices only from Sim.run's events.
   Load rule: top-level code touches only legacy objects and lower-numbered v2 files (Pal, Fx, Rig, LiveGraph are read
   inside functions, behind typeof guards). */

/* ================= words (API_v2 §9.2; D4 budgets; British spelling; tests/lint_text.js) ================= */
const EQ_C = {
  firstWords: 'Each beetle carries two copies of a colour gene. Tap one to open it.',
  intro: {   // the opening description card (D6 decision 8; 00_entry.js Intro): 1–2 sentences, ≤ 35 words each
    game: 'You are a field geneticist studying beetles, and later rats. Count gene copies, crank the gamete tumbler, sample the field and diagnose what is happening to each population.',
    biology: 'Hardy–Weinberg is the null model: random mating with no forces gives genotype shares p², 2pq and q². Inbreeding, structure and selection each leave their own departure; drift can shift p while the fit holds.',
    how: 'Tap beetles, crank the tumbler and drag the quadrat; the ghost hand shows each new control. Drag a marker to predict, then press Lock in.'
  },
  hud: {
    sort: 'Sort its copies: tap the A jar or the a jar.',
    guess: 'Half look blue. What share of all copies are A? Drag p, then tap it.',
    tag: 'Tag beetles. The jars count copies, not beetles. {n} of {m} tagged.',
    reveal: 'Every beetle opened: {a}% of copies are A, yet {b}% of beetles look blue.',
    yule: 'Yule bet blue would rise to 75%. Where will blue be in 30 generations?',
    lapse: 'Thirty generations of random mating in all 20,000 beetles. Watch the blue share.',
    done0: 'Nothing pushed blue up. Dominant does not mean common.',
    crank: 'Two hoppers: eggs and sperm. Turn the crank to pair them.',
    askHet: 'Before you crank 40 pairs: what share will be Aa? Drag the Aa bar.',
    c40: 'Crank to 40 pairs. Each pair lands in its cell of the square.',
    collapse: 'Both mixed cells stack in the Aa bar: ×2, the 2 in 2pq.',
    lever: 'Set any p with the p buttons, then spin 400 pairs.',
    spin: 'Now 400 pairs at p = {p}. Hold the crank, or press Spin.',
    settle: 'At 400 pairs the bars sit on the dashed p², 2pq and q².',
    pen0: 'Twenty AA and twenty aa. No heterozygotes at all.',
    pen1: 'Your pen: tap a parent to change it. Then press Done.',
    pen2: 'Forty heterozygotes, and nothing else.',
    pen3: 'Females carry p = 0.9, males p = 0.3. Two different hoppers.',
    pen4: 'Now these young mate with each other.',
    askTri: 'Tap the triangle where their young will land, then tap again to lock in.',
    crankGen: 'Crank one generation: {n} of {m} young.',
    land: 'One generation, and the young sit on the curve. p stayed at {p}.',
    land3: 'Off the curve. Let these young mate once more.',
    land4: 'On the curve at p = {p}. It took two generations, not one.',
    sample: 'Drag the quadrat over the beach. {t} s of field time for both beaches.',
    sampleN: '{n} genotyped. χ² above 3.84 is significant at 5%: 1 in 20 by chance.',
    sampleD: '{n} genotyped. Above 3.84, the pooled sample departs at the 5% level.',
    verdict: 'How sure are you that this beach departs? Drag, then tap.',
    census: 'The full census: all {n} beetles. Heterozygotes are {f}% short of 2pq.',
    censusFit: 'The full census: all {n} beetles. Heterozygotes match 2pq.',
    south: 'South beach. {t} s of field time left.',
    valve: 'The valve can keep families apart. Flip it to Families.',
    crankF: 'Brothers mate with sisters. Watch the head spots too. {n} of {m} families.',
    askH: 'Two more generations of relatives. Where will the colour Aa bar be?',
    toMix: 'Flip the valve back to Mix: random mating again.',
    askAa: 'One generation of random mating. Where will the Aa bar be? Drag it.',
    crankM: 'Mixing again. Crank: {n} of {m} families.',
    goal: 'Goal: fewer colour heterozygotes, second gene untouched. Set the valve, then crank.',
    crankG: 'Valve: {v}. Watch both genes. {n} of {m} families.',
    goalOk: 'Goal met: colour heterozygotes fell, and the second gene stayed on Hardy–Weinberg.',
    goalNo: 'Goal missed. Only colour-matched mating spares the second gene.',
    named: 'F, the inbreeding coefficient: heterozygotes are {f}% short of 2pq.',
    wrongValve: 'Flip the valve to {m} to crank.',
    demes: 'A new beach. Drag the quadrat to find out what lives where.',
    deficit: 'Too few heterozygotes. Relatives, or two groups? Draw a split line.',
    split: 'One side χ² {a}, other side χ² {b}. Redraw, or press Done.',
    splitFit: 'Both halves fit. The deficit was in your pooling, not the beetles.',
    askMix: 'The demes mix for one generation. Where will the young’s Aa bar be?',
    mixed: 'One generation of mixing. The young sit on Hardy–Weinberg.',
    place: 'Rats raid your grain. Tap to lay bait: {c} grain a tray a night.',
    plan: 'Season {g}. Keep, add or lift trays: each costs {c} grain a night.',
    night: 'Night {g}. A rat that meets bait eats it six times in ten.',
    fast: 'Seasons pass with your bait. Tap to add or lift a tray.',
    dusk: 'Season {g}. The newborns sit on the Hardy–Weinberg curve.',
    dawn: 'Dawn. Bait reached {k}% of susceptible rats. {n} rats reached the grain.',
    askAdult: 'Before the survivors show: tap the triangle where tonight’s adults will sit.',
    askQ: 'Bait kills {a}% of AA; vitamin lack kills {b}% of aa. Where will q settle?',
    withdraw: 'Warfarin is withdrawn. Where will q be after eight seasons without it?',
    nobait: 'No bait. Resistant aa rats still pay for vitamin K.',
    whatif: 'What if? Ten seasons with one thing changed.',
    caseIntro: 'Case {c} of 5. Sample, buy tests with field days, then diagnose.',
    caseSample: 'Drag the quadrat to sample. {d} field days left for all cases.',
    caseTests: 'Buy a test, or Diagnose. {d} field days left.',
    dx: 'What is going on? Pick a cause, then how sure you are.',
    closed: 'Case closed: {c}.',
    carrier: 'Last beach: only looks count. Amber beetles are aa. Drag the quadrat.',
    askCar: '{a}% of beetles are amber. What share carry one hidden a? Drag the Aa bar.',
    carDone: 'The genes lens: {c}% carry one hidden a copy.',
    over: 'Done.'
  },
  whispers: {
    copies: 'Two copies: one per wing case.', dominant: 'Aa looks blue: A is dominant.', skittish: 'The beetles are getting skittish.',
    jar: 'That copy is {a}: the other jar.', square: 'Each cell: one egg, one sperm.', pStays: 'p did not move.', small: 'Small samples fit almost anything.',
    shrug: 'One a copy is enough to resist warfarin.', vitK: 'Too little vitamin K for an aa rat.', grain: 'A rat reached the grain.',
    days: 'Not enough field days.', valve: 'Valve: {m}.', trays: 'Four trays is the most.', tap: 'Tap a parent to change it.',
    wobble: 'Small samples wobble even when p is still.',
    split: 'Each side tested alone.', short: 'Draw a longer line.', more: 'Sample at least {n} beetles.', second: 'Tap a second point for a line.'
  },
  labels: {
    jarA: 'A copies', jara: 'a copies', eggs: 'Eggs', sperm: 'Sperm', crank: 'Crank', AA: 'AA', Aa: 'Aa', aa: 'aa', BB: 'BB', Bb: 'Bb', bb: 'bb',
    parents: 'parents', young: 'young', chi: 'χ²', line: '3.84', departs: 'departs', fits: 'fits', north: 'North beach', southB: 'South beach',
    grain: 'Grain', bait: 'Bait', mix: 'Mix', fam: 'Families', like: 'Like colour', p: 'p', q: 'q',
    n: 'n = {n}', time: '{t} s', days: '{d} days', season: 'Season {g}', blue: 'blue', amber: 'amber', female: 'Females', male: 'Males',
    newborn: 'newborns', adult: 'adults', west: 'west', east: 'east', y: 'year {y}', drag: 'Drag me', you: 'you', exp: 'expected',
    real: 'observed', gene2: 'second gene', colour: 'colour gene', looks: 'looks', copies: 'copies', xN: '×N', pairs: '{n} pairs',
    secs: '{n} s', lost: '{n} lost', popBlue: '{x}% blue overall', census: '{n} beetles here', perYear: '{n} a year', baitCost: 'Bait {n} grain',
    qhat: 'q̂', tray1: '1 tray', trayN: '{n} trays', blueA: 'blue (A)', amberA: 'amber (a)', done: 'Done', twice: '×2'
  },
  interesting: {
    yule: 'You backed Yule: dominant should spread. Blue stayed near half. With random mating, nothing pushes a dominant allele up.',
    het: 'Your Aa guess missed. Aa forms two ways: egg A with sperm a, and egg a with sperm A.',
    parents: 'Your young landed where the parents were. Random mating rebuilds heterozygotes in one generation; only p carries over.',
    small: 'Your sample fitted Hardy–Weinberg. The full census did not. Failing to reject is not proof.',
    drifted: 'p wandered a little by chance in this small population. Inbreeding itself does not move p.',
    goal: 'Families cut heterozygotes at both genes. Only colour-matched mating spares the second gene.',
    line: 'Your line cut across both demes, so each side was still a pooled sample.',
    bait: 'Resistance barely rose: too few susceptible rats met the bait.',
    slow: 'Without bait, q fell ever more slowly: rare a copies hide in Aa rats.',
    cases: 'Some populations that fitted Hardy–Weinberg were evolving. A fit can hide drift, and migrants who have already bred in.',
    nostir: 'Without stirring, eggs met sperm from their own layer. Heterozygotes fell short while p stayed put.',
    nocost: 'With no vitamin-K cost, resistance kept spreading. The cost is what holds q in the middle.',
    nowarf: 'Without warfarin, resistant rats only paid the cost, and q fell.'
  },
  levers: { nostir: 'No stirring', nocost: 'No vitamin cost', nowarf: 'No warfarin' },
  take: 'Hardy–Weinberg is the null model: genotypes follow from copies. A departure points to a cause; a fit rules nothing out.',
  body: 'You solved {k} of 5 cases. Inbreeding cut heterozygotes and pooled demes made a deficit; heterozygote advantage killed homozygotes, so adults had extra heterozygotes. Drift and migration, with migrants breeding in before each census, fitted Hardy–Weinberg every year, yet p moved. A fit is not stasis.',
  law: { title: 'The null model' },
  boss: { inverts: 'A population can fit Hardy–Weinberg and still be evolving.' },
  stars: {
    discover: 'Make each pattern happen: sort the jars, crank, sample, split, solve.',
    predict: 'Land your predictions inside the band.',
    transfer: 'Comes later: unequal sexes, rats without bait, and the case files.'
  },
  captions: {
    L0: 'p and q count copies, not beetles. A dominant allele can be the rare one.',
    L1: 'Random mating is two independent draws: p², 2pq and q² fall out of the square.',
    L2: 'One generation of random mating restores Hardy–Weinberg proportions, if the sexes start with the same p.',
    L3: 'Hardy–Weinberg is a null model you test. Small samples fit almost anything.',
    L4: 'Inbreeding cuts heterozygotes at every gene while p stays put. Like-mates-like cuts them at one gene.',
    L5: 'Pooling two demes makes a heterozygote deficit that neither deme has.',
    L6: 'Selection pushes adults off the curve; their young land back on it, at a new q. Heterozygote advantage holds both alleles at q̂ = s₁/(s₁ + s₂).',
    L7: 'A good fit does not mean nothing is happening.',
    whatif: 'What if? The frozen moment, with one thing changed.',
    live0: 'Tagged {n} beetles. Jars: A {a}, a {b}.', live1: '{n} pairs. AA {x}, Aa {y}, aa {z}.',
    live2: 'Young landed: AA {x}%, Aa {y}%, aa {z}%.', live3: '{n} beetles genotyped. χ² {c}.',
    live6: 'Season {g}. q {q}. Grain lost {n}.', live7: 'Case {c}: {r}.',
    car: 'q = √{a} = {q}, so carriers 2pq = {c}%.',
    grain6: 'You lost {g} grain to rats and bait. The best fixed bait here was {k}, losing about {o}.'
  },
  panels: [
    { id: 'L0', text: 'Each beetle carries two copies of the colour gene, one per wing case. An Aa beetle looks blue, because A is dominant. So half the beetles looked blue while only 30% of the copies were A. Random mating did not change that share in thirty generations: dominance alone moves nothing.' },
    { id: 'L1', text: 'An egg carries A with chance p, and so does a sperm. Two independent draws give AA with chance p × p. A heterozygote can form two ways, egg A with sperm a or the reverse, so Aa is 2pq. Forty pairs scatter around those values; four hundred sit on them.' },
    { id: 'L2', text: 'Whatever the starting mix, one round of random mating put the young on the curve. Genotypes are rebuilt from the gamete pool each generation, and the pool depends only on p. When the sexes start with different p, the first young land off the curve. The next generation lands on it.' },
    { id: 'L3', text: 'A χ² test asks whether the genotype counts could come from Hardy–Weinberg proportions. With two alleles it has one degree of freedom, so 3.84 is the 5% line. A small sample rarely crosses it, even when the beach truly departs. Not rejecting Hardy–Weinberg never proves it.' },
    { id: 'L4', text: 'Brothers mating with sisters made heterozygotes scarcer every generation, while the copies in the jars stayed level. F measures that deficit: Aa = 2pq(1 − F). One generation of random mating removed it. Colour-matched mating cut heterozygotes only at the colour gene; the second gene stayed on Hardy–Weinberg.' },
    { id: 'L5', text: 'Each deme was in Hardy–Weinberg, but at very different p. Pooled, the sample had too few heterozygotes, as if relatives were mating. The deficit equals twice the variance in p between demes: the Wahlund effect. Split at the right line and it vanishes. Let the demes mix, and it is gone in one generation.' },
    { id: 'L6', text: 'Warfarin killed susceptible AA rats; resistant aa rats needed far more vitamin K. Heterozygotes did best, so both alleles stayed. One a copy resists warfarin, yet only aa pays the cost. Dominance belongs to a trait, not a letter. Newborns sat on the curve; adults had extra heterozygotes.' }
  ],
  model: [
    { level: 0, simulated: 'Forty beetles on the beach stand for a population of 20,000 that mates at random for thirty generations.', simplification: 'One gene with two alleles, A fully dominant; generations do not overlap.', params: [{ name: 'p', value: 0.3, tag: 'designed' }, { name: 'population', value: '20,000', tag: 'designed' }, { name: 'generations', value: 30, tag: 'designed' }], cannot: 'Selection, mutation or migration, which would move p.', nature: 'Hardy answered Yule in 1908: with random mating a dominant allele keeps its frequency.', contested: false, refs: ['hardy1908', 'weinberg1908', 'edwards2008'] },
    { level: 1, simulated: 'Each half-turn draws one egg and one sperm. Each is A with chance p, from pools that never run out.', simplification: 'Infinite gamete pools, drawn with replacement.', params: [{ name: 'p', value: '0.3, then yours', tag: 'designed' }, { name: 'pairs', value: '40, 400', tag: 'designed' }], cannot: 'A finite population, where p drifts between generations and small ones show a slight heterozygote excess.', nature: 'Sea urchins shed eggs and sperm into the water, close to random draws at most genes. Gamete-recognition genes such as bindin are an exception.', contested: false, refs: ['hardy1908'] },
    { level: 2, simulated: 'Parents drop their copies into the hoppers; 100 young are drawn from them.', simplification: 'An autosomal gene, random mating, discrete generations.', params: [{ name: 'young per round', value: 100, tag: 'designed' }, { name: 'p_f, p_m', value: '0.9, 0.3', tag: 'designed' }], cannot: 'Genes on the X, which approach equilibrium slowly with the sexes leapfrogging. See The Royal Line.', nature: 'Equal allele frequencies in the two sexes are needed for a one-generation return.', contested: false, refs: ['hardy1908', 'weinberg1908'] },
    { level: 3, simulated: 'Each beach holds 500 beetles; your quadrat genotypes the ones inside it without error.', simplification: 'Each beach has a one-in-two chance of a heterozygote shortfall of 15–25%; otherwise it is in Hardy–Weinberg.', params: [{ name: 'beetles a beach', value: 500, tag: 'designed' }, { name: 'shortfall if it departs', value: '15–25%', tag: 'designed' }, { name: 'field time', value: '45 s for both', tag: 'designed' }], cannot: 'Genotyping errors or null alleles, which also fake deficits.', nature: 'Hardy–Weinberg tests on samples of a few dozen detect only large departures.', contested: false, refs: ['lewontin1959'] },
    { level: 4, simulated: 'Twenty-four families of four. Each generation a brother and a sister pair up, or partners are drawn at random.', simplification: 'Two unlinked genes; like-colour mating sorts couples by colour only.', params: [{ name: 'families', value: 24, tag: 'designed' }, { name: 'young a couple', value: 4, tag: 'designed' }], cannot: 'Inbreeding depression, where inbred young survive worse.', nature: 'Self-fertilising plants show heterozygote deficits at every gene; colour-matched mating affects only colour genes.', contested: false, refs: ['wright1921'] },
    { level: 5, simulated: 'Two demes of beetles, each in Hardy–Weinberg, meet along a wavy boundary you cannot see.', simplification: 'No migration between demes until you mix them. Beetles show their genes only once sampled.', params: [{ name: 'p in the demes', value: '0.85, 0.2', tag: 'designed' }, { name: 'beetles', value: 600, tag: 'designed' }], cannot: 'A gradual cline, where no single line splits the sample cleanly.', nature: 'Wahlund described the pooled deficit in 1928.', contested: false, refs: ['wahlund1928'] },
    { level: 6, simulated: 'Sixty-four rats run each night. A rat that meets a tray eats the bait six times in ten. Susceptible AA rats that eat it die. Each aa rat dies of vitamin-K shortage with chance 0.5.', simplification: 'Here heterozygotes pay nothing, so resistance hides and fades slowly. Welsh heterozygotes also paid a cost (fitness about 0.77 without warfarin; Partridge 1979). Resistance there fell within two years.', params: [{ name: 'rats', value: 64, tag: 'designed' }, { name: 's₂ (aa cost)', value: 0.5, tag: 'designed' }, { name: 'start q', value: 0.05, tag: 'designed' }, { name: 'bait cost', value: '4 grain a tray a night', tag: 'designed' }, { name: 'seasons', value: 18, tag: 'xN', real: 'one season is one rat generation; real spread took years' }], cannot: 'Newer anticoagulants, or other resistance mutations at the same gene.', nature: 'Warfarin resistance settled at intermediate frequencies in Welsh rat populations in the 1970s.', contested: false, refs: ['greaves1977', 'bishop1977', 'partridge1979', 'pelz2005'] },
    { level: 7, simulated: 'Five populations, each with one hidden cause or none. Then one beach where only looks can be counted.', simplification: 'One cause a case, at a strength you can detect. Migrants arrive just after each census and breed in, so you never count a fresh migrant. Counted with residents, fresh migrants would show a deficit, as two demes do. The selection case is heterozygote advantage; other selection can leave a deficit, or none.', params: [{ name: 'field days', value: 8, tag: 'designed' }, { name: 'small islands', value: '30–40 beetles', tag: 'designed' }, { name: 'migrants a year', value: '25%', tag: 'designed' }], cannot: 'Several causes at once, as in most real populations.', nature: 'Carrier estimates from √aa assume Hardy–Weinberg; inbreeding makes them too high.', contested: false, refs: ['hardy1908', 'wahlund1928'] }
  ],
  why: {   // one chunk a level (index = level); the card for level n shows real[n] and maths[n]
    real: [
      'In 1908 Udny Yule wondered why a dominant trait did not climb towards three in four. G. H. Hardy replied with the rule; Wilhelm Weinberg found it the same year. Yule’s own 1902 paper had found the 1:2:1 balance; his 1908 remark was a slip.',
      'Broadcast spawners such as sea urchins release eggs and sperm into the sea. Their pairing is close to random draws at most genes. Gamete-recognition genes such as bindin are an exception.',
      'The rule holds for one autosomal gene when the sexes start with equal p. A gene on the X chromosome approaches equilibrium slowly, the sexes leapfrogging each other. The Royal Line follows that.',
      'Small samples have little power: many genuine departures pass unnoticed in samples of a few dozen. Very large samples flag even tiny departures. Lewontin and Cockerham (1959) showed that tests on adults detect only strong selection.',
      'Self-fertilising plants and inbred zoo animals show heterozygote deficits at many genes at once. Mating by one trait, as in some flowers and birds, affects only the genes behind that trait.',
      'Sten Wahlund described the effect in 1928. Geneticists now look for population structure before blaming inbreeding. The between-deme share of variance, F_ST, comes later in the game.',
      'Warfarin resistance in Norway rats comes from changes in the VKORC1 gene. On Welsh farms in the 1970s, resistant homozygotes fared badly from vitamin-K shortage. Heterozygotes paid a smaller cost. Resistance settled at an intermediate frequency, then fell fast when warfarin stopped.',
      'If a recessive condition such as cystic fibrosis affects 1 birth in 2,500, then q ≈ 1/50. About 1 person in 25 is then a carrier. The estimate assumes Hardy–Weinberg.'
    ],
    maths: [
      'Let A have frequency p and a have q = 1 − p. Random mating gives AA p², Aa 2pq and aa q². Blue beetles are AA plus Aa: 1 − q². With p = 0.3 that is 0.51.',
      'Each cell of the square has an area equal to its chance. The AA cell is p by p. The two Aa cells are p by q each, so together 2pq. The cells add to (p + q)² = 1.',
      'Young get an egg from the female pool (p_f) and a sperm from the male pool (p_m). Aa = p_f q_m + q_f p_m. Young of both sexes now share one p = (p_f + p_m)/2, so their own young land on the curve.',
      'χ² adds (observed − expected)² ÷ expected over AA, Aa and aa. Three classes, minus one for the total, minus one for estimating p, leaves one degree of freedom. The 5% line is 3.84. χ² is only rough when an expected count is below five. Stopping the moment it crosses 3.84 inflates false alarms.',
      'With inbreeding coefficient F, AA = p² + Fpq, Aa = 2pq(1 − F) and aa = q² + Fpq; p is unchanged. Brother–sister mating raises F to 0.25, 0.375 and 0.5 over three generations.',
      'Pool two equal demes with p₁ and p₂. Their own heterozygotes are 2p₁q₁ and 2p₂q₂. The pooled expectation uses their mean p. The shortfall is 2Var(p) = (p₁ − p₂)²/2.',
      'Fitnesses are AA 1 − s₁, Aa 1, aa 1 − s₂. The share q rises while rare. It stops where an A copy and an a copy do equally well. That is p s₁ = q s₂, so q̂ = s₁/(s₁ + s₂). Without bait, Δq ≈ −s₂pq²/(1 − s₂q²): slow when q is small.',
      'Only aa shows, so the aa share is q² and q = √aa. Carriers are 2pq. Inbreeding raises aa above q², so √aa then overestimates q. Relatives give the same F at every gene. Two demes give an F that differs from gene to gene and vanishes within each area.'
    ]
  }
};

/* ================= numbers (seconds; designed values, disclosed in P and the MODEL cards) ================= */
const EQK = {
  ASKMAX: 30,
  L0: { comp: [4, 16, 20], need: 12, sortN: 5, sortT: 8, tag1T: 25, tagT: 30, post: 0.9, revealT: 2.6, lapseT: 4.5, gens: 30, popN: 20000, done: 1.4 },
  L1: { p: 0.3, first: 4, small: 40, big: 400, slow: 9, fast: 45, col: 3.0, colT: 1.8, idle: 25 },
  L2: { pens: [[20, 0, 20], [32, 0, 8], [0, 40, 0]], femF: [16, 4, 0], femM: [0, 12, 8], young: 100, show: 1.4, land: 1.6, rate: 30, idle: 25, buildT: 30 },
  L3: { N: 500, beaches: [{ p: 0.5 }, { p: 0.4 }], pool: 45, reserve: 10, wait: 15, max: 300, rate: 10, hw: 0.12, hh: 0.1, census: 2.8, move: 1.2, tol: 0.2 },
  L4: { fams: 24, sched: ['fam', 'fam', 'fam', 'mix', 'goal', 'goal'], rate: 10, valveT: 12, idle: 25 },
  L5: { N: 600, p: [0.85, 0.2], time: 25, wait: 15, need: 60, rate: 10, splitT: 40, mix: 2.6, young: 200 },
  L6: { N: 64, comp: [58, 6, 0], s2: 0.5, seasons: 10, after: 8, trays: 4, r: 24, eat: 0.6, cost: 4, W: 360, H: 300, burrows: [70, 130, 190, 250], gx: 346,
        dusk: 1.0, place: 3, place1: 10, dawn: 1.6, breed: 0.6, night: 3.5, dur0: 2.0, dur1: 0.8, maxNight: 10, lapse: 4, lapseW: 5, askAt: 4, tolH: 0.08,
        best: [0, 0.25, 0.4, 0.55, 0.61] },   // best: bait reach s₁ for 0–4 well-placed trays at an eating chance of 0.6 (measured on the rat paths)
  L7: { days: 8, cost: { area: 1, age: 1, gene: 1, year: 2 }, base: 120, rate: 10, N: 300, tiny: 30, small: 40, smallP: 0.35, intro: 1.4, closed: 2.8, sampleT: 90, dxT: 35, carN: 400, carQ: 0.3, carNeed: 60, carT: 14, carMax: 200 }
};
const EQ_CAUSES = ['inb', 'wah', 'sel', 'drift', 'mig', 'none'];
const EQ_CAUSE_NAME = { inb: 'Relatives', wah: 'Two demes', sel: 'Selection', drift: 'Drift', mig: 'Migration', none: 'Nothing' };

/* ================= the maths (pure; shared by the sim, the stars and tests/oracle_census.js) ================= */
const EQ = {
  hw(p) { const q = 1 - p; return [p * p, 2 * p * q, q * q]; },
  inb(p, F) { const q = 1 - p; return [p * p + F * p * q, 2 * p * q * (1 - F), q * q + F * p * q]; },
  n(c) { return c[0] + c[1] + c[2]; },
  p(c) { const n = c[0] + c[1] + c[2]; return n ? (2 * c[0] + c[1]) / (2 * n) : 0; },
  frac(c) { const n = c[0] + c[1] + c[2]; return n ? [c[0] / n, c[1] / n, c[2] / n] : [0, 0, 0]; },
  // χ² for genotype counts with p estimated from the sample: 1 degree of freedom (3 classes − 1 total − 1 estimated p)
  chi(c) {
    const n = c[0] + c[1] + c[2]; if (n < 1) return 0;
    const p = (2 * c[0] + c[1]) / (2 * n), E = EQ.hw(p).map(f => f * n); let x = 0;
    for (let i = 0; i < 3; i++) if (E[i] > 1e-9) x += (c[i] - E[i]) * (c[i] - E[i]) / E[i];
    return x;
  },
  Fhat(c) { const n = EQ.n(c), p = EQ.p(c), He = 2 * p * (1 - p); return n && He > 0 ? 1 - (c[1] / n) / He : 0; },
  triErr(a, b) { const d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2]; return Math.sqrt((d0 * d0 + d1 * d1 + d2 * d2) / 2); },
  // heterozygote advantage with q the resistant (a) copy share: AA 1 − s1, Aa 1, aa 1 − s2
  sel(q, s1, s2) { const p = 1 - q, w = p * p * (1 - s1) + 2 * p * q + q * q * (1 - s2); return w > 0 ? (p * q + q * q * (1 - s2)) / w : q; },
  proj(q, n, s1, s2) { for (let i = 0; i < n; i++) q = EQ.sel(q, s1, s2); return q; },
  adults(f, s1, s2) { const a = [f[0] * (1 - s1), f[1], f[2] * (1 - s2)], t = a[0] + a[1] + a[2]; return t > 0 ? [a[0] / t, a[1] / t, a[2] / t] : [1 / 3, 1 / 3, 1 / 3]; },
  sibF(t) { let a = 0, b = 0; for (let i = 0; i < t; i++) { const c = (1 + 2 * b + a) / 4; a = b; b = c; } return b; },   // full-sib mating (Wright 1921)
  wahlund(p1, p2) { return (p1 - p2) * (p1 - p2) / 2; },   // 2Var(p) for two equal demes
  // whole counts summing to n from shares (largest remainder), so a designed population is exact
  counts(f, n) { const raw = f.map(v => v * n), out = raw.map(Math.floor); let left = n - out[0] - out[1] - out[2]; raw.map((v, i) => [v - out[i], i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]).forEach(([, i]) => { if (left > 0) { out[i]++; left--; } }); return out; },
  geno(g, a, b) { return (g[a] < 0.5 ? 1 : 0) + (g[b] < 0.5 ? 1 : 0); },       // a Gen genome → 0 AA, 1 Aa, 2 aa (1.0 = A)
  tally(g) { const c = [0, 0, 0]; for (const x of g) c[x]++; return c; },
  r2(v) { return Math.round(v * 100) / 100; },
  pct(v) { return Math.round(v * 100); }
};

/* ================= the eight levels' simulations (headless: R(), Det, WF, Gen only; plain-JSON state) =================
   Each entry: init(S, s), step(S, s, dt, ev), act(S, s, a, ev), after(S, s, id, ev) (a prediction was committed),
   expect(S, s, id) (the expectation for the parameters in force, computed at scoring time), actions(S, s), bot(name, S, s, acts),
   lever(S, s, k) (What if?), interesting(S, s). S is CH_HWE_V2.sim. */
const EQ_SIMS = { sim: {   // one sim: {…} block, so the lint checks it as simulation code

/* ---- L0 Two copies each: open beetles, sort their copies into jars; Yule's bet; 30 generations of random mating ---- */
0: {
  init(S, s) {
    const K = EQK.L0, p0 = S.P('p0'), comp = Math.abs(p0 - 0.3) < 1e-9 ? K.comp.slice() : EQ.counts(EQ.hw(p0), 40), codes = [];
    for (let c = 0; c < 3; c++) for (let k = 0; k < comp[c]; k++) codes.push(c);
    EQ.shuffle(codes);
    s.bs = codes.map(c => ({ c, tag: 0, h: c === 1 ? (R() < 0.5 ? 1 : 0) : 0 }));
    s.p = EQ.p(comp); s.jar = [0, 0]; s.manual = 0; s.sorted = 0; s.open = -1; s.left = []; s.openK = 0; s.lapsed = 0; s.acc = 0;
    s.big = Array.from(WF.multinom(K.popN, EQ.hw(s.p))); s.blue = [(s.big[0] + s.big[1]) / K.popN];
    S.go(s, 'tag1');
  },
  alleles(b) { return b.c === 0 ? [0, 0] : b.c === 2 ? [1, 1] : b.h ? [1, 0] : [0, 1]; },
  tag(S, s, i, ev, auto) {   // the first few beetles open and wait for you to sort their two copies; later ones pour in by themselves
    const b = s.bs[i]; if (!b || b.tag || s.open >= 0) return; b.tag = 1; const a = this.alleles(b);
    if (!auto && s.sorted < EQK.L0.sortN) { s.open = i; s.left = a.slice(); s.openK = s.tick; ev.push({ k: 'open', i, a }); return; }
    s.jar[a[0]]++; s.jar[a[1]]++;
    if (!auto) s.manual++; ev.push({ k: 'tag', i, a, auto: !!auto });
    if (s.phase === 'tag1') S.go(s, 'post1');
  },
  jar(S, s, j, c, ev, auto) {   // one copy into jar j; c = the copy you dragged (optional). A wrong jar bounces the copy back
    if (s.open < 0) return; const k = c != null ? (c === j ? s.left.indexOf(c) : -1) : s.left.indexOf(j);
    if (k < 0) { ev.push({ k: 'bounce', i: s.open, j, c: c != null ? c : s.left[0] }); return; }
    const two = s.left.length === 2; s.left.splice(k, 1); s.jar[j]++; ev.push({ k: 'sort', i: s.open, a: j, idx: k, two, auto: !!auto });
    if (!s.left.length) { const i = s.open; s.open = -1; s.manual++; s.sorted++; ev.push({ k: 'sorted', i }); if (s.phase === 'tag1') S.go(s, 'post1'); }
  },
  flush(S, s, ev) { while (s.open >= 0 && s.left.length) this.jar(S, s, s.left[0], null, ev, true); },   // an idle sorter: the copies drop in by themselves
  step(S, s, dt, ev) {
    const K = EQK.L0;
    if (s.open >= 0 && !s.unt && (s.tick - s.openK) * S.dt > K.sortT) this.flush(S, s, ev);
    if (s.phase === 'tag1' && !s.unt && s.t > K.tag1T && s.open < 0) { const i = s.bs.findIndex(b => !b.tag); this.tag(S, s, i, ev, true); }
    else if (s.phase === 'post1' && s.t > K.post) { S.ask(s, ev, 'guess', 'x', { chart: 0, start: 0.5, tol: 0.08 }); S.go(s, 'guess'); }
    else if (s.phase === 'tag' && s.open < 0 && (s.manual >= K.need || (!s.unt && s.t > K.tagT))) {
      s.bs.forEach((b, i) => { if (!b.tag) this.tag(S, s, i, ev, true); });
      ev.push({ k: 'revealAll' }); S.go(s, 'reveal');
    }
    else if (s.phase === 'tag' && s.open >= 0 && !s.unt && s.t > K.tagT) this.flush(S, s, ev);
    else if (s.phase === 'reveal' && s.t > K.revealT) { S.ask(s, ev, 'yule', 'y', { chart: 1, at: K.gens, start: 0.75, tol: 0.06 }); S.go(s, 'yule'); }
    else if (s.phase === 'lapse') {
      s.acc += dt; const per = K.lapseT / K.gens;
      while (s.acc >= per && s.blue.length <= K.gens) { s.acc -= per; this.gen(S, s, ev); }
      if (s.blue.length > K.gens) { s.lapsed = 1; S.go(s, 'done0'); ev.push({ k: 'lapsed' }); }
    }
    else if (s.phase === 'done0' && s.t > K.done) S.go(s, 'over');
  },
  gen(S, s, ev) {   // one generation of random mating in the big population; the forty on the beach are redrawn from it
    const N = EQK.L0.popN, p = EQ.p(s.big);
    s.big = Array.from(WF.multinom(N, EQ.hw(p))); s.blue.push((s.big[0] + s.big[1]) / N);
    const vis = WF.multinom(s.bs.length, EQ.frac(s.big)), codes = [];
    for (let c = 0; c < 3; c++) for (let k = 0; k < vis[c]; k++) codes.push(c);
    EQ.shuffle(codes); s.bs.forEach((b, i) => { b.c = codes[i]; b.h = R() < 0.5 ? 1 : 0; });
    ev.push({ k: 'gen', g: s.blue.length - 1 });
  },
  act(S, s, a, ev) {
    if (s.phase !== 'tag1' && s.phase !== 'tag') return;
    if (a.k === 'tag') this.tag(S, s, a.i | 0, ev, false);
    else if (a.k === 'jar') this.jar(S, s, a.j ? 1 : 0, a.c == null ? null : (a.c ? 1 : 0), ev, false);
  },
  after(S, s, id) { if (id === 'guess') S.go(s, 'tag'); else if (id === 'yule') { s.acc = -0.35; S.go(s, 'lapse'); } },   // the lapse waits for the phone's sheet to fold
  expect(S, s, id) { return id === 'guess' ? s.p : s.blue[0]; },
  actions(S, s) {
    const out = []; if (s.phase !== 'tag1' && s.phase !== 'tag') return out;
    if (s.open >= 0) return [{ k: 'jar', j: 0 }, { k: 'jar', j: 1 }];
    for (let i = 0; i < s.bs.length && out.length < 6; i++) if (!s.bs[i].tag) out.push({ k: 'tag', i });
    return out;
  },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) { const v = name === 'greedy' ? (s.ask.id === 'yule' ? s.blue[0] : 0.5) : name === 'alwaysA' ? 0 : name === 'alwaysB' ? 1 : 0.5; return S.near(pr, v); }
    if (s.open >= 0) return name === 'alwaysB' ? acts[1] : acts.find(a => a.j === s.left[0]) || null;   // bots can sort; alwaysB always picks the a jar
    return name === 'threshold' && s.manual >= 6 ? null : acts[0] || null;
  },
  interesting(S, s) { return s.pred.yule != null && s.pred.yule > s.blue[0] + 0.12 ? 'yule' : null; }
},

/* ---- L1 The tumbler: each half-turn pairs one egg and one sperm onto the p × q square ---- */
1: {
  init(S, s) { s.p = S.P('p0'); s.cnt = [0, 0, 0, 0]; s.pairs = []; s.spin = 0; s.spinT = 0; s.acc = 0; s.idle = 0; s.target = EQK.L1.first; s.nostir = 0; s.lever = 0; s.pset = 0; S.go(s, 'c4'); },
  geno(s) { return [s.cnt[0], s.cnt[1] + s.cnt[2], s.cnt[3]]; },
  pair(s, ev) {
    const e = R() < s.p ? 0 : 1, sp = s.nostir && R() < 0.6 ? e : (R() < s.p ? 0 : 1), code = e * 2 + sp;
    s.pairs.push(code); s.cnt[code]++; s.lever = 0; ev.push({ k: 'pair', e, sp, n: s.pairs.length });
  },
  cranking(s) { return s.phase === 'c4' || s.phase === 'c40' || s.phase === 'spin'; },
  step(S, s, dt, ev) {
    const K = EQK.L1;
    if (this.cranking(s)) {
      s.idle += dt; if (!s.spin && !s.unt && s.idle > K.idle) { s.spin = 1; s.spinT = 0; ev.push({ k: 'autospin' }); }
      if (s.spin) { s.spinT += dt; const rate = s.phase === 'spin' ? Math.min(K.fast, K.slow + s.spinT * 22) : K.slow; s.acc += rate * dt; while (s.acc >= 1 && s.pairs.length < s.target) { s.acc -= 1; this.pair(s, ev); } }
      if (s.pairs.length >= s.target) this.reached(S, s, ev);
    }
    else if (s.phase === 'col1' && s.t > K.col) { S.go(s, 'spin'); s.target = K.big; s.spinT = 0; s.acc = 0; s.lever = 1; ev.push({ k: 'vial' }); }   // before the 400: you may set the hoppers to any p
    else if (s.phase === 'col2' && s.t > K.col) S.go(s, 'done1');
    else if (s.phase === 'done1' && s.t > 1.2) S.go(s, 'over');
  },
  reached(S, s, ev) {
    s.spin = 0; s.acc = 0;
    if (s.phase === 'c4') { S.ask(s, ev, 'het', 'y', { chart: 0, at: 1, start: 0.2, tol: 0.05 }); S.go(s, 'askHet'); }
    else if (s.phase === 'c40') { S.go(s, 'col1'); ev.push({ k: 'collapse', n: s.pairs.length }); }
    else if (s.phase === 'spin') { S.go(s, 'col2'); ev.push({ k: 'collapse', n: s.pairs.length }); }
  },
  act(S, s, a, ev) {
    if (!this.cranking(s)) return;
    if (a.k === 'setp') { if (!s.lever || s.phase !== 'spin') return; const v = Math.round(Math.max(0.1, Math.min(0.9, +a.v || 0)) * 20) / 20; if (Math.abs(v - s.p) < 1e-9) return; s.p = v; s.pset = 1; s.pairs = []; s.cnt = [0, 0, 0, 0]; s.spin = 0; s.acc = 0; s.idle = 0; ev.push({ k: 'setp', p: v }); return; }
    if (a.k === 'crank') { s.idle = 0; const n = Math.max(1, Math.min(3, a.n | 0)); for (let k = 0; k < n && s.pairs.length < s.target; k++) this.pair(s, ev); if (s.pairs.length >= s.target) this.reached(S, s, ev); }
    else if (a.k === 'spin') { s.idle = 0; s.spin = a.on ? 1 : 0; s.spinT = 0; }
  },
  after(S, s, id) { if (id === 'het') { S.go(s, 'c40'); s.target = EQK.L1.small; } },
  expect(S, s) { return 2 * s.p * (1 - s.p); },
  actions(S, s) { if (!this.cranking(s)) return []; const out = [{ k: 'crank', n: 1 }, { k: 'spin', on: !s.spin }]; if (s.lever && s.phase === 'spin') out.push({ k: 'setp', v: EQ.r2(s.p - 0.1) }, { k: 'setp', v: EQ.r2(s.p + 0.1) }); return out; },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) { const g = this.geno(s), n = g[0] + g[1] + g[2]; return S.near(pr, name === 'greedy' ? (n ? g[1] / n : 0.5) : name === 'alwaysA' ? 0 : name === 'alwaysB' ? 1 : 0.5); }
    if (name === 'threshold' && s.lever && s.p < 0.45) return acts.find(a => a.k === 'setp' && a.v > s.p) || null;
    if (name === 'greedy') return acts.find(a => a.k === 'spin' && a.on) || null;
    return acts.find(a => a.k === 'crank') || null;
  },
  lever(S, s, k) { if (k === 'nostir') { s.nostir = 1; s.lever = 0; } },   // What if? keeps p as it was frozen
  interesting(S, s) { if (s.whatif === 'nostir') return 'nostir'; return s.pred.het != null && Math.abs(s.pred.het - 2 * s.p * (1 - s.p)) > 0.1 ? 'het' : null; }
},

/* ---- L2 One generation: lopsided pens cranked once; then unequal sexes, which take two generations ---- */
2: {
  init(S, s) { s.round = 0; s.gen = 0; s.rec = []; s.spin = 0; s.acc = 0; this.setRound(S, s, 0); },
  setRound(S, s, r) {
    const K = EQK.L2; s.round = r; s.gen = 0;
    if (r < 3) { s.par = K.pens[r].slice(); s.pf = s.pm = EQ.p(s.par); s.parF = null; s.parM = null; }
    else { s.parF = K.femF.slice(); s.parM = K.femM.slice(); s.par = [s.parF[0] + s.parM[0], s.parF[1] + s.parM[1], s.parF[2] + s.parM[2]]; s.pf = EQ.p(s.parF); s.pm = EQ.p(s.parM); }
    s.pen = []; for (let g = 0; g < 3; g++) for (let k = 0; k < s.par[g]; k++) s.pen.push(g);   // the pen in drawing order (round 1: yours to change)
    s.young = [0, 0, 0]; s.ny = 0; s.spin = 0; s.idle = 0; S.go(s, r === 1 ? 'build' : 'show');
  },
  cycle(s, i) { if (i < 0 || i >= s.pen.length) return; s.pen[i] = (s.pen[i] + 1) % 3; const c = [0, 0, 0]; for (const g of s.pen) c[g]++; s.par = c; s.pf = s.pm = EQ.p(c); },
  kid(s, ev) { const e = R() < s.pf ? 0 : 1, sp = R() < s.pm ? 0 : 1, c = e + sp; s.young[c]++; s.ny++; ev.push({ k: 'young', c, e, sp, n: s.ny }); },
  step(S, s, dt, ev) {
    const K = EQK.L2;
    if (s.phase === 'build') { if (!s.unt && s.t > K.buildT) { S.go(s, 'show'); ev.push({ k: 'built' }); } }
    else if (s.phase === 'show' && s.t > K.show) {
      if (s.round === 3 && s.gen === 1) S.go(s, 'crank');
      else { S.ask(s, ev, 'r' + s.round, 'tri', { chart: 0, start: EQ.frac(s.par), tol: 0.06 }); S.go(s, 'ask'); }
    }
    else if (s.phase === 'crank') {
      s.idle += dt; if (!s.spin && !s.unt && s.idle > K.idle) { s.spin = 1; ev.push({ k: 'autospin' }); }
      if (s.spin) { s.acc += K.rate * dt; while (s.acc >= 1 && s.ny < K.young) { s.acc -= 1; this.kid(s, ev); } }
      if (s.ny >= K.young) this.landed(S, s, ev);
    }
    else if (s.phase === 'land' && s.t > K.land) {
      if (s.round < 3) this.setRound(S, s, s.round + 1);
      else if (s.gen === 0) { s.gen = 1; s.par = s.young.slice(); s.pen = []; for (let g = 0; g < 3; g++) for (let k = 0; k < s.par[g]; k++) s.pen.push(g); s.pf = s.pm = EQ.p(s.par); s.parF = s.parM = null; s.young = [0, 0, 0]; s.ny = 0; S.go(s, 'show'); }
      else S.go(s, 'done2');
    }
    else if (s.phase === 'done2' && s.t > 1.2) S.go(s, 'over');
  },
  landed(S, s, ev) { s.spin = 0; s.acc = 0; s.rec.push({ round: s.round, gen: s.gen, par: EQ.frac(s.par), young: EQ.frac(s.young), p0: EQ.p(s.par), p1: EQ.p(s.young) }); S.go(s, 'land'); ev.push({ k: 'landed', f: EQ.frac(s.young) }); },
  act(S, s, a, ev) {
    if (s.phase === 'build') { if (a.k === 'cycle') { this.cycle(s, a.i | 0); s.t = Math.min(s.t, EQK.L2.buildT - 8); ev.push({ k: 'cycle', i: a.i | 0, g: s.pen[a.i | 0] }); } else if (a.k === 'built') { S.go(s, 'show'); ev.push({ k: 'built' }); } return; }
    if (s.phase !== 'crank') return;
    if (a.k === 'crank') { s.idle = 0; const n = Math.max(1, Math.min(3, a.n | 0)); for (let k = 0; k < n && s.ny < EQK.L2.young; k++) this.kid(s, ev); if (s.ny >= EQK.L2.young) this.landed(S, s, ev); }
    else if (a.k === 'spin') { s.idle = 0; s.spin = a.on ? 1 : 0; }
  },
  after(S, s) { S.go(s, 'crank'); },
  expect(S, s, id) { if (id === 'r3') { const f = s.pf, m = s.pm; return [f * m, f * (1 - m) + (1 - f) * m, (1 - f) * (1 - m)]; } return EQ.hw(EQ.p(s.par)); },
  actions(S, s) {
    if (s.phase === 'build') { const out = [{ k: 'built' }]; for (let i = 0; i < s.pen.length; i += 7) out.push({ k: 'cycle', i }); return out; }
    return s.phase === 'crank' ? [{ k: 'crank', n: 2 }, { k: 'spin', on: !s.spin }] : [];
  },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) {
      if (name === 'greedy') return S.near(pr, EQ.hw((s.pf + s.pm) / 2));        // the HW point at the parents' mean p
      if (name === 'threshold') return S.near(pr, EQ.frac(s.par));              // "no change": the parents' own point
      return name === 'alwaysA' ? pr[0] : pr[pr.length - 1];
    }
    if (s.phase === 'build') return name === 'random' ? null : acts.find(a => a.k === 'built');
    return name === 'greedy' ? acts.find(a => a.k === 'spin' && a.on) || null : acts.find(a => a.k === 'crank') || null;
  },
  interesting(S, s) { let k = 0; for (const r of s.rec) if (r.round < 3 && s.pred['r' + r.round] && EQ.triErr(s.pred['r' + r.round], r.par) < 0.06) k++; return k >= 2 ? 'parents' : null; }
},

/* ---- shared field sampling (L3, L5, L7): a quadrat genotypes the unsampled beetles inside it, nearest first ---- */
field: {
  make(n) { return { x: [], y: [], g: [], sm: [], d: [], m: [] }; },
  inQ(s, f, i) { const K = EQK.L3; return Math.abs(f.x[i] - s.q.x) <= K.hw && Math.abs(f.y[i] - s.q.y) <= K.hh; },
  next(s, f) { let bi = -1, bd = 9; for (let i = 0; i < f.x.length; i++) { if (f.sm[i] || !this.inQ(s, f, i)) continue; const d = (f.x[i] - s.q.x) * (f.x[i] - s.q.x) + (f.y[i] - s.q.y) * (f.y[i] - s.q.y); if (d < bd) { bd = d; bi = i; } } return bi; },
  // advance the quadrat: rate beetles a second; fn(i) records one; → number sampled this tick
  scan(s, f, dt, rate, cap, fn) {
    if (s.q.x < 0) return 0; s.acc += rate * dt; let k = 0;
    while (s.acc >= 1 && s.n < cap) { const i = this.next(s, f); if (i < 0) { s.acc = Math.min(s.acc, 0.999); break; } s.acc -= 1; f.sm[i] = 1; s.n++; k++; fn(i); }
    return k;
  },
  grid(s) { const out = []; for (const x of [0.2, 0.5, 0.8]) for (const y of [0.22, 0.5, 0.78]) out.push({ k: 'quad', x, y }); return out; },
  place(s, a) { s.q.x = Math.max(0, Math.min(1, +a.x || 0)); s.q.y = Math.max(0, Math.min(1, +a.y || 0)); s.idle = 0; },
  pos(f, n, fx) { for (let i = 0; i < n; i++) { const p = fx ? fx(i) : [0.04 + 0.92 * R(), 0.06 + 0.88 * R()]; f.x.push(p[0]); f.y.push(p[1]); f.sm.push(0); } }
},

/* ---- L3 The census: quadrat sampling on two beaches with one shared field clock, χ² with 1 df, a verdict, then the census ----
   Each beach departs (a heterozygote shortfall) with chance one half, independently, so neither the order nor the first census
   gives the second answer away. The verdict is scored against what your own sample can support: the posterior chance that the
   beach departs, given its genotype counts (prior 1/2, the shortfall uniform over the setting's ±25%). After 40 beetles
   "I can't tell" is the right answer; after 300 the sample usually decides. */
3: {
  init(S, s) {
    const K = EQK.L3, F0 = S.P('F');
    s.beaches = K.beaches.map(B => ({ p: B.p, F: R() < 0.5 ? EQ.r2(F0 * (0.75 + 0.5 * R())) : 0 }));
    s.pool = K.pool; s.beach = 0; s.res = []; this.make(S, s, 0);
  },
  make(S, s, b) {   // genotypes drawn beetle by beetle; a fitting beach is redrawn until its census fits, a departing one until it shows its shortfall
    const K = EQK.L3, B = s.beaches[b], f = EQ_FIELD.make(); EQ_FIELD.pos(f, K.N);
    let g = [];
    for (let k = 0; k < 60; k++) { g = []; for (let i = 0; i < K.N; i++) g.push(EQ.draw(EQ.inb(B.p, B.F))); const c = EQ.tally(g); if (B.F > 0 ? Math.abs(EQ.Fhat(c) - B.F) < 0.04 : Math.abs(EQ.Fhat(c)) < 0.035) break; }
    f.g = g; s.f = f; s.F = B.F; s.obs = [0, 0, 0]; s.n = 0; s.chiH = []; s.q = { x: -1, y: -1 }; s.clock = 0; s.acc = 0; s.idle = 0; s.full = null;
    S.go(s, 'sample');
  },
  floor(s) { return s.beach === 0 ? EQK.L3.reserve : 0; },   // the first beach leaves some field time for the second
  step(S, s, dt, ev) {
    const K = EQK.L3;
    if (s.phase === 'sample') {
      if (!s.clock && s.t > K.wait) s.clock = 1;   // the clock starts with your first quadrat (or after a long wait)
      if (s.clock && !s.unt) s.pool = Math.max(this.floor(s), s.pool - dt);
      EQ_FIELD.scan(s, s.f, dt, K.rate, K.max, i => { const g = s.f.g[i]; s.obs[g]++; const x = EQ.chi(s.obs); s.chiH.push([s.n, EQ.r2(x)]); ev.push({ k: 'samp', i, g, n: s.n }); });
      if ((!s.unt && s.clock && s.pool <= this.floor(s) + 1e-9 && s.n >= 20) || s.n >= K.max) this.end(S, s, ev);
      else if (!s.unt && s.clock && s.pool <= this.floor(s) + 1e-9 && s.n < 20) this.force(s, ev);
    }
    else if (s.phase === 'census' && s.t > K.census) S.go(s, s.beach === 0 ? 'move' : 'done3');
    else if (s.phase === 'move' && s.t > K.move) { s.beach = 1; this.make(S, s, 1); ev.push({ k: 'beach', b: 1 }); }
    else if (s.phase === 'done3' && s.t > 1.2) S.go(s, 'over');
  },
  force(s, ev) { const f = s.f; for (let i = 0; i < f.x.length && s.n < 20; i++) if (!f.sm[i] && R() < 0.1) { f.sm[i] = 1; s.n++; s.obs[f.g[i]]++; s.chiH.push([s.n, EQ.r2(EQ.chi(s.obs))]); ev.push({ k: 'samp', i, g: f.g[i], n: s.n }); } },
  end(S, s, ev) { S.ask(s, ev, 'v' + s.beach, 'x', { chart: 1, start: 0.5, tol: EQK.L3.tol }); S.go(s, 'verdict'); },
  act(S, s, a, ev) {
    if (s.phase !== 'sample') return;
    if (a.k === 'quad') { EQ_FIELD.place(s, a); s.clock = 1; }
    else if (a.k === 'finish' && s.n >= 20) this.end(S, s, ev);
  },
  after(S, s, id, ev) {
    const all = EQ.tally(s.f.g), Fc = EQ.Fhat(all);
    s.full = { n: s.f.g.length, F: Fc, c: all };
    s.res.push({ n: s.n, x2: EQ.r2(EQ.chi(s.obs)), F: EQ.r2(EQ.Fhat(s.obs)), full: EQ.r2(Fc), dep: s.F > 0, post: EQ.r2(this.post(S, s.obs)) });
    S.go(s, 'census'); ev.push({ k: 'census', F: Fc });
  },
  post(S, c) {   // P(this beach departs | your sample's counts): Bayes with prior 1/2 and the shortfall uniform over 0.75–1.25 × F
    const n = EQ.n(c); if (n < 1) return 0.5;
    const p = Math.min(0.99, Math.max(0.01, EQ.p(c))), F0 = S.P('F'), ll = f => c[0] * Det.log(Math.max(1e-12, f[0])) + c[1] * Det.log(Math.max(1e-12, f[1])) + c[2] * Det.log(Math.max(1e-12, f[2]));
    const l0 = ll(EQ.hw(p)), ks = [0.75, 0.875, 1, 1.125, 1.25]; let alt = 0;
    for (const k of ks) alt += Det.exp(Math.min(600, ll(EQ.inb(p, F0 * k)) - l0)) / ks.length;
    return alt / (alt + 1);
  },
  expect(S, s) { return this.post(S, s.obs); },
  actions(S, s) { if (s.phase !== 'sample') return []; const out = EQ_FIELD.grid(s); if (s.n >= 20) out.push({ k: 'finish' }); return out; },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) return S.near(pr, name === 'greedy' ? (EQ.chi(s.obs) > 3.84 ? 1 : 0) : name === 'alwaysA' ? 0 : name === 'alwaysB' ? 1 : 0.5);
    const g = acts.filter(a => a.k === 'quad');
    if (name === 'greedy') { const j = Math.floor(s.tick / 45) % g.length; return s.q.x === g[j].x && s.q.y === g[j].y ? null : g[j]; }
    if (name === 'alwaysA') return s.q.x < 0 ? g[0] : null;
    return name === 'threshold' && s.n >= 40 ? acts.find(a => a.k === 'finish') || null : (s.q.x < 0 ? g[4] : null);
  },
  interesting(S, s) { return s.res.some(r => r.dep && r.x2 < 3.84 && r.n < 120) ? 'small' : null; }
},

/* ---- L4 Close relatives: a valve on the tumbler; brother–sister matings; F; like-mates-like at one gene ---- */
4: {
  lay() { return Gen.layout([{ k: 'col', kind: 'dom', n: 1, p0: 0.7, mu: 0, det: true }, { k: 'mk', kind: 'dom', n: 1, p0: 0.4, mu: 0, det: true }]); },
  init(S, s) {
    const lay = this.lay(); s.fams = [];   // each founding family: four full sibs from an unrelated pair, so F climbs 0.25, 0.375, 0.5
    for (let i = 0; i < EQK.L4.fams; i++) { const m = Gen.genome(lay), d = Gen.genome(lay), f = []; for (let k = 0; k < 4; k++) f.push(Gen.mate(lay, m, d)); s.fams.push(f); }
    s.mode = 'mix'; s.gen = 0; s.couple = 0; s.next = []; s.pairs = null; s.spin = 0; s.acc = 0; s.idle = 0;
    s.hist = [this.stats(s)]; s.want = EQK.L4.sched[0]; S.go(s, 'valve');
  },
  stats(s) {
    const c = [0, 0, 0], m = [0, 0, 0];
    for (const f of s.fams) for (const g of f) { c[EQ.geno(g, 0, 2)]++; m[EQ.geno(g, 1, 3)]++; }
    return { c, m, p: EQ.p(c), pm: EQ.p(m), mode: s.mode };
  },
  pairUp(S, s) {   // the generation's couples: [family of the sister, family of the brother]
    const n = s.fams.length, idx = []; for (let i = 0; i < n; i++) idx.push(i);
    if (s.mode === 'fam') s.pairs = idx.map(i => [i, i]);
    else if (s.mode === 'mix') { const perm = EQ.shuffle(idx.slice()); s.pairs = idx.map(i => [i, perm[i]]); }
    else {
      const blue = g => g[0] > 0.5 || g[2] > 0.5, F = { b: [], a: [] }, M = { b: [], a: [] };
      for (let i = 0; i < n; i++) { F[blue(s.fams[i][0]) ? 'b' : 'a'].push(i); M[blue(s.fams[i][2]) ? 'b' : 'a'].push(i); }
      for (const k of ['b', 'a']) { EQ.shuffle(F[k]); EQ.shuffle(M[k]); }
      const out = [], lf = [], lm = [];
      for (const k of ['b', 'a']) { const m = Math.min(F[k].length, M[k].length); for (let j = 0; j < m; j++) out.push([F[k][j], M[k][j]]); lf.push(...F[k].slice(m)); lm.push(...M[k].slice(m)); }
      for (let j = 0; j < lf.length; j++) out.push([lf[j], lm[j]]);
      s.pairs = out;
    }
    s.couple = 0; s.next = []; s.pairMode = s.mode;
  },
  couple(S, s, ev) {
    const lay = this.lay(), pr = s.pairs[s.couple], mom = s.fams[pr[0]][0], dad = s.fams[pr[1]][2], kids = [];
    for (let k = 0; k < 4; k++) kids.push(Gen.mate(lay, mom, dad));
    s.next.push(kids); ev.push({ k: 'couple', i: s.couple, fi: pr[0], mi: pr[1], kids: kids.map(g => [EQ.geno(g, 0, 2), EQ.geno(g, 1, 3)]) });
    s.couple++;
    if (s.couple >= s.pairs.length) {
      s.fams = s.next; s.next = []; s.couple = 0; s.gen++; const st = this.stats(s); st.mode = s.pairMode || s.mode; s.hist.push(st); s.spin = 0; s.acc = 0;
      ev.push({ k: 'gen', g: s.gen });
      const sch = EQK.L4.sched;
      if (s.gen === 1) { S.ask(s, ev, 'h3', 'y', { chart: 1, start: st.c[1] / EQ.n(st.c), tol: 0.06 }); S.go(s, 'askH'); }   // where will the colour Aa bar be after two more generations?
      else if (s.gen >= sch.length) S.go(s, 'done4');
      else if (sch[s.gen] !== sch[s.gen - 1]) { s.want = sch[s.gen]; S.go(s, 'valve'); }
      else this.pairUp(S, s);
    }
  },
  ok(s) { return s.mode === s.want || s.want === 'goal'; },   // the goal generations take any valve: your choice
  step(S, s, dt, ev) {
    const K = EQK.L4;
    if (s.phase === 'valve') {
      if (this.ok(s)) {
        if (s.gen === 3) { const st = s.hist[s.hist.length - 1]; S.ask(s, ev, 'aa', 'y', { chart: 1, at: 1, start: st.c[1] / EQ.n(st.c), tol: 0.06 }); S.go(s, 'askAa'); }
        else { this.pairUp(S, s); S.go(s, 'crank'); }
      } else if (!s.unt && s.t > K.valveT) { s.mode = s.want; ev.push({ k: 'valve', m: s.mode, auto: true }); }
    }
    else if (s.phase === 'crank') {
      if (!this.ok(s)) return;
      s.idle += dt; if (!s.spin && !s.unt && s.idle > K.idle) { s.spin = 1; ev.push({ k: 'autospin' }); }
      if (s.spin) { s.acc += K.rate * dt; while (s.acc >= 1 && s.phase === 'crank') { s.acc -= 1; this.couple(S, s, ev); } }
    }
    else if (s.phase === 'done4' && s.t > 1.4) S.go(s, 'over');
  },
  act(S, s, a, ev) {
    if (a.k === 'valve' && ['mix', 'fam', 'like'].indexOf(a.m) >= 0 && s.phase !== 'over' && s.phase !== 'done4') { if (s.mode !== a.m) { s.mode = a.m; ev.push({ k: 'valve', m: a.m }); if (s.phase === 'crank' && s.couple === 0) this.pairUp(S, s); } }   // a new valve before the first couple re-pairs the generation
    else if (s.phase === 'crank' && this.ok(s)) {
      if (a.k === 'crank') { s.idle = 0; const n = Math.max(1, Math.min(3, a.n | 0)); for (let k = 0; k < n && s.phase === 'crank'; k++) this.couple(S, s, ev); }
      else if (a.k === 'spin') { s.idle = 0; s.spin = a.on ? 1 : 0; }
    }
  },
  after(S, s) { this.pairUp(S, s); S.go(s, 'crank'); },
  expect(S, s, id) { if (id === 'h3') { const p = s.hist[1].p; return 2 * p * (1 - p) * (1 - EQ.sibF(3)); } const p = s.hist[3].p; return 2 * p * (1 - p); },   // 2pq(1 − F) with F = 0.5 after three sib generations
  goal(s) { const h = s.hist.slice(5); return h.length === 2 && h.every(x => x.mode === 'like'); },
  actions(S, s) {
    if (s.phase === 'over' || s.phase === 'done4') return [];
    const out = ['mix', 'fam', 'like'].filter(m => m !== s.mode).map(m => ({ k: 'valve', m }));
    if (s.phase === 'crank' && this.ok(s)) out.push({ k: 'crank', n: 2 }, { k: 'spin', on: !s.spin });
    return out;
  },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) { const st = s.hist[s.hist.length - 1]; return S.near(pr, name === 'greedy' ? st.c[1] / EQ.n(st.c) : name === 'alwaysA' ? 0 : name === 'alwaysB' ? 1 : 0.5); }   // greedy: "no change"
    if (name === 'alwaysA' || name === 'alwaysB') return acts[0] || null;
    if (!this.ok(s)) return acts.find(a => a.k === 'valve' && a.m === s.want) || null;
    if (name === 'threshold' && s.want === 'goal' && s.mode !== 'fam' && s.couple === 0) return acts.find(a => a.k === 'valve' && a.m === 'fam') || null;
    return name === 'greedy' ? acts.find(a => a.k === 'spin' && a.on) || null : acts.find(a => a.k === 'crank') || null;
  },
  interesting(S, s) { if (s.hist.length > 6 && !this.goal(s)) return 'goal'; return s.hist.length > 3 && Math.abs(s.hist[3].p - s.hist[0].p) > 0.04 ? 'drifted' : null; }
},

/* ---- L5 Two demes: a pooled sample shows a deficit; a line splits it; mixing restores HW in one generation ---- */
5: {
  // the hidden deme boundary: one of four directions (across, down, two diagonals), wavy, either way round; never drawn until the end
  LINES: [[[0, 0.5], [1, 0.5]], [[0.5, 0], [0.5, 1]], [[0, 0.1], [1, 0.9]], [[0, 0.9], [1, 0.1]]],   // the four straight lines keys 1–4 draw
  wob(s, t) { return (s.orient > 1 ? 0.06 : 0.07) * Det.sin(6.283185307179586 * (1.6 * t + s.phi)); },
  edge(s, t) { const w = this.wob(s, t); return s.orient === 0 ? [t, 0.5 + w] : s.orient === 1 ? [0.5 + w, t] : s.orient === 2 ? [t, 0.1 + 0.8 * t + w] : [t, 0.9 - 0.8 * t + w]; },   // steep enough diagonals that no other straight line sorts 85%
  deme(s, x, y) { const d = s.orient === 1 ? (x < 0.5 + this.wob(s, y) ? 0 : 1) : (y < this.edge(s, x)[1] ? 0 : 1); return d ^ s.flip; },
  line(s) { const out = []; for (let k = 0; k <= 16; k++) out.push(this.edge(s, k / 16)); return out; },
  init(S, s) {
    const K = EQK.L5, f = EQ_FIELD.make(); s.phi = R(); s.orient = Math.floor(R() * 4); s.flip = R() < 0.5 ? 1 : 0;
    EQ_FIELD.pos(f, K.N);
    for (let i = 0; i < K.N; i++) { const d = this.deme(s, f.x[i], f.y[i]); f.d.push(d); f.g.push(EQ.draw(EQ.hw(K.p[d]))); }
    s.f = f; s.obs = [0, 0, 0]; s.n = 0; s.q = { x: -1, y: -1 }; s.time = K.time; s.clock = 0; s.acc = 0; s.idle = 0; s.splits = []; s.young = null; s.over15 = 0;
    S.go(s, 'sample');
  },
  side(pts, x, y) {   // which side of the drawn polyline (nearest segment, sign of the cross product)
    let bd = 1e9, sgn = 1;
    for (let k = 0; k + 1 < pts.length; k++) {
      const ax = pts[k][0], ay = pts[k][1], bx = pts[k + 1][0], by = pts[k + 1][1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1e-9;
      let u = ((x - ax) * dx + (y - ay) * dy) / L2; const ext = k === 0 ? -50 : 0, ext2 = k === pts.length - 2 ? 51 : 1; u = Math.max(ext, Math.min(ext2, u));
      const px = ax + u * dx, py = ay + u * dy, d = (x - px) * (x - px) + (y - py) * (y - py);
      if (d < bd) { bd = d; sgn = dx * (y - ay) - dy * (x - ax) >= 0 ? 1 : 0; }
    }
    return sgn;
  },
  split(S, s, pts, ev, auto) {
    const f = s.f, a = [[0, 0, 0], [0, 0, 0]]; let agree = 0, m = 0;
    for (let i = 0; i < f.x.length; i++) { if (!f.sm[i]) continue; const sd = this.side(pts, f.x[i], f.y[i]); a[sd][f.g[i]]++; m++; if (sd === f.d[i]) agree++; }
    const acc = m ? Math.max(agree, m - agree) / m : 0, rec = { pts, acc: EQ.r2(acc), x2: [EQ.r2(EQ.chi(a[0])), EQ.r2(EQ.chi(a[1]))], c: a, n: [EQ.n(a[0]), EQ.n(a[1])], auto: !!auto };
    rec.fit = rec.n[0] >= 15 && rec.n[1] >= 15 && rec.x2[0] < 3.84 && rec.x2[1] < 3.84;
    s.splits.push(rec); ev.push({ k: 'split', i: s.splits.length - 1, fit: rec.fit });
  },
  step(S, s, dt, ev) {
    const K = EQK.L5;
    if (s.phase === 'sample') {
      if (!s.clock && s.t > K.wait) s.clock = 1;   // the clock starts with your first quadrat (or after a long wait)
      if (!s.unt && s.clock) s.time = Math.max(0, s.time - dt);
      EQ_FIELD.scan(s, s.f, dt, K.rate, 220, i => { s.obs[s.f.g[i]]++; ev.push({ k: 'samp', i, g: s.f.g[i], n: s.n }); });
      if (!s.unt && s.time <= 0 && s.n < K.need) { s.over15 += dt; if (s.over15 > 15) { for (let i = 0; i < s.f.x.length && s.n < K.need; i++) if (!s.f.sm[i] && R() < 0.2) { s.f.sm[i] = 1; s.n++; s.obs[s.f.g[i]]++; ev.push({ k: 'samp', i, g: s.f.g[i], n: s.n }); } } }
      if ((!s.unt && s.time <= 0 && s.n >= K.need) || s.n >= 220) this.toSplit(S, s, ev);
    }
    else if (s.phase === 'split' && !s.unt && s.t > K.splitT) { if (!s.splits.length) this.split(S, s, [[0.5, 0], [0.5, 1]], ev, true); this.toAsk(S, s, ev); }
    else if (s.phase === 'mix' && s.t > K.mix) S.go(s, 'done5');
    else if (s.phase === 'done5' && s.t > 1.2) S.go(s, 'over');
  },
  toSplit(S, s, ev) { S.go(s, 'split'); ev.push({ k: 'deficit', x2: EQ.chi(s.obs) }); },
  toAsk(S, s, ev) { S.ask(s, ev, 'mix', 'y', { chart: 0, at: 1, start: s.obs[1] / Math.max(1, s.n), tol: 0.06 }); S.go(s, 'askMix'); },
  act(S, s, a, ev) {
    if (s.phase === 'sample') { if (a.k === 'quad') { EQ_FIELD.place(s, a); s.clock = 1; } else if (a.k === 'finish' && s.n >= EQK.L5.need) this.toSplit(S, s, ev); }
    else if (s.phase === 'split') {
      if (a.k === 'split' && Array.isArray(a.pts) && a.pts.length >= 2 && s.splits.length < 8) this.split(S, s, a.pts.slice(0, 32).map(p => [+p[0] || 0, +p[1] || 0]), ev, false);
      else if (a.k === 'done' && s.splits.length) this.toAsk(S, s, ev);
    }
  },
  after(S, s, id, ev) {   // one generation of random mating across the whole beach
    const f = s.f, N = f.x.length, y = [0, 0, 0], cp = i => { const g = f.g[i]; return g === 0 ? 0 : g === 2 ? 1 : (R() < 0.5 ? 0 : 1); };
    for (let k = 0; k < EQK.L5.young; k++) { const a = cp(Math.floor(R() * N)), b = cp(Math.floor(R() * N)); y[a + b]++; }
    s.young = y; S.go(s, 'mix'); ev.push({ k: 'mixed' });
  },
  pAll(s) { const c = [0, 0, 0]; for (const g of s.f.g) c[g]++; return EQ.p(c); },
  expect(S, s) { const p = this.pAll(s); return 2 * p * (1 - p); },
  actions(S, s) {
    if (s.phase === 'sample') { const out = EQ_FIELD.grid(s); if (s.n >= EQK.L5.need) out.push({ k: 'finish' }); return out; }
    if (s.phase === 'split') { const out = this.LINES.map(pts => ({ k: 'split', pts })); if (s.splits.length) out.push({ k: 'done' }); return out; }
    return [];
  },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) return S.near(pr, name === 'greedy' ? s.obs[1] / Math.max(1, s.n) : name === 'alwaysA' ? 0 : name === 'alwaysB' ? 1 : 0.5);
    if (s.phase === 'split') return s.splits.length ? acts.find(a => a.k === 'done') : (name === 'greedy' ? acts[2] : name === 'threshold' ? acts[0] : acts[1]);   // fixed lines: right only when the hidden edge runs that way
    const g = acts.filter(a => a.k === 'quad');
    if (name === 'greedy') { const j = Math.floor(s.tick / 40) % g.length; return s.q.x === g[j].x && s.q.y === g[j].y ? null : g[j]; }
    return s.q.x < 0 ? g[name === 'alwaysA' ? 0 : 4] : (s.n >= EQK.L5.need ? acts.find(a => a.k === 'finish') || null : null);
  },
  interesting(S, s) { const best = s.splits.reduce((m, r) => Math.max(m, r.acc), 0); return s.splits.length && best < 0.75 ? 'line' : null; }
},

/* ---- L6 The bait-layer: warfarin against rats; newborns fit HW, adults show a heterozygote excess ----
   Each season you choose how much bait to lay (0–4 trays, each costing grain every night) and where. A rat that passes a tray
   eats the bait with chance 0.6; a susceptible AA rat that eats it turns back and dies. So your bait reach s₁ is a choice,
   q settles at your own q̂ = s₁/(s₁ + s₂), and the farmer's score is grain: rats at the sacks plus the bait itself. Seasons
   1–3 run at your pace; after the q̂ ask, seasons 4–10 run three times faster with your bait (tap to change it). */
6: {
  lay() { return Gen.layout([{ k: 'vk', kind: 'dom', n: 1, p0: 0.95, mu: 0, det: true }]); },   // 1.0 = A (susceptible), 0 = a (resistant)
  mk(a1, a2) { const g = new Float32Array(2); g[0] = a1; g[1] = a2; return g; },
  init(S, s) {
    const K = EQK.L6, comp = K.comp, gs = [];
    for (let k = 0; k < comp[0]; k++) gs.push(this.mk(1, 1)); for (let k = 0; k < comp[1]; k++) gs.push(R() < 0.5 ? this.mk(1, 0) : this.mk(0, 1)); for (let k = 0; k < comp[2]; k++) gs.push(this.mk(0, 0));
    EQ.shuffle(gs); s.rats = gs.map(g => this.rat(g)); s.s2 = S.P('s2');
    s.season = 1; s.trays = []; s.hist = []; s.s1 = []; s.q = [this.q(s.rats)]; s.grain = 0; s.grainT = 0; s.baitT = 0; s.auto = false; s.fast = 1; s.endSeason = 0; s.T = 0; s.rec = null;
    S.go(s, 'dusk');
  },
  rat(g) { return { g, c: EQ.geno(g, 0, 1), st: 'wait', b: 0, y1: 0, bend: 0, t0: 0, dur: 3, u: 0, ate: 0, met: 0, et: 0, x: 14, y: 150, dead: 0 }; },
  q(rats) { let a = 0; for (const r of rats) a += r.c; return rats.length ? a / (2 * rats.length) : 0; },
  counts(rats) { const c = [0, 0, 0]; for (const r of rats) c[r.c]++; return c; },
  P0(r) { const K = EQK.L6; return [14, K.burrows[r.b]]; },
  at(r, u) { const K = EQK.L6, a = this.P0(r), c = [K.gx, r.y1], m = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2 + r.bend], v = 1 - u; return [v * v * a[0] + 2 * u * v * m[0] + u * u * c[0], v * v * a[1] + 2 * u * v * m[1] + u * u * c[1]]; },
  speed(s) { return s.auto ? EQK.L6.lapseW : s.fast; },
  baited(s) { return !s.auto && s.season <= EQK.L6.seasons; },
  night(S, s) {
    const K = EQK.L6, n = s.rats.length, f = this.speed(s), span = K.night / f;
    s.rats.forEach((r, i) => { r.b = Math.floor(R() * 4); r.y1 = 80 + R() * 170; r.bend = (R() - 0.5) * 140; r.t0 = (i / n) * span + R() * 0.25 / f; r.dur = (K.dur0 + R() * K.dur1) / f; r.st = 'wait'; r.u = 0; r.ate = 0; r.met = 0; r.et = 0; r.dead = 0; const p = this.P0(r); r.x = p[0]; r.y = p[1]; });
    s.T = 0; s.grain = 0; s.nightTrays = s.trays.length; if (this.baited(s)) s.baitT += s.trays.length * K.cost;   // tonight's bait is paid for as it goes down
    S.go(s, 'night');
  },
  step(S, s, dt, ev) {
    const K = EQK.L6, f = this.speed(s);
    if (s.phase === 'dusk' && s.t > (f > 1 ? 0.3 : s.season === 1 ? 1.0 : K.dusk)) { if (s.season === 5 && !s.auto) ev.push({ k: 'vial', g: s.season }); S.go(s, s.auto ? 'go' : 'place'); if (s.auto) this.night(S, s); }
    else if (s.phase === 'place') {   // untimed: the rats wait for Release
      const due = s.season === 1 ? ((s.trays.length && s.t > 2.5) || s.t > K.place1) : s.t > (f > 1 ? 0.5 : K.place);
      if (!s.unt && due) this.night(S, s);
    }
    else if (s.phase === 'night') {
      s.T += dt; let live = 0;
      for (let i = 0; i < s.rats.length; i++) {
        const r = s.rats[i];
        if (r.st === 'wait') { if (s.T >= r.t0) r.st = 'run'; else { live++; continue; } }
        if (r.st === 'run') {
          r.u = Math.min(1, r.u + dt / r.dur); const p = this.at(r, r.u); r.x = p[0]; r.y = p[1];
          if (!r.ate && !s.auto) for (let j = 0; j < s.trays.length; j++) {   // each tray met once a night; a rat eats with chance 0.6 (some are bait-shy)
            const t = s.trays[j]; if (r.met & (1 << j)) continue;
            if ((t.x - r.x) * (t.x - r.x) + (t.y - r.y) * (t.y - r.y) < K.r * K.r) { r.met |= 1 << j; if (R() < K.eat) { r.ate = 1; r.st = 'eat'; r.et = 0; ev.push({ k: 'eat', i, c: r.c, j }); break; } }
          }
          if (r.st === 'run' && r.u >= 1) { r.st = 'grain'; s.grain++; ev.push({ k: 'grain', i }); }
        } else if (r.st === 'eat') { r.et += dt; if (r.et > 0.5 / f) { r.st = r.c === 0 ? 'sick' : 'run'; ev.push({ k: r.c === 0 ? 'sick' : 'shrug', i, c: r.c }); } }
        else if (r.st === 'sick') { r.u = Math.max(0, r.u - dt / (r.dur * 2)); const p = this.at(r, r.u); r.x = p[0]; r.y = p[1]; if (r.u <= 0) r.st = 'home'; }
        if (r.st === 'run' || r.st === 'eat' || r.st === 'sick') live++;
      }
      if (!live || s.T > K.maxNight / f) this.dawn(S, s, ev);
    }
    else if (s.phase === 'dawn' && s.t > (f > 1 ? 0.5 : K.dawn)) this.breed(S, s, ev);
    else if (s.phase === 'done6' && s.t > 1.4) S.go(s, 'over');
  },
  dawn(S, s, ev) {
    const nb = this.counts(s.rats); let aaAte = 0;
    for (const r of s.rats) {
      if (r.c === 0) { if (s.auto ? R() < s.s1w : r.ate) { r.dead = 1; aaAte++; } }
      else if (r.c === 2 && R() < (s.auto ? s.s2w : s.s2)) r.dead = 2;
    }
    const ad = this.counts(s.rats.filter(r => !r.dead)), s1t = nb[0] ? aaAte / nb[0] : 0;
    s.rec = { season: s.season, nb, ad, s1: EQ.r2(s1t), grain: s.grain, trays: s.nightTrays | 0, q: this.q(s.rats) };
    if (this.baited(s)) { s.s1.push(s1t); s.grainT += s.grain; }
    ev.push({ k: 'dawn', s1: s1t });
    if (s.season === 3 && !s.auto && !s.whatif) { S.ask(s, ev, 'adult', 'tri', { chart: 1, start: EQ.frac(nb), tol: 0.07 }); S.go(s, 'askAdult'); }
    else S.go(s, 'dawn');
  },
  breed(S, s, ev) {
    const K = EQK.L6, lay = this.lay(), surv = s.rats.filter(r => !r.dead), par = surv.length >= 2 ? surv : s.rats.slice(0, 2), N = K.N, kids = [];
    for (let i = 0; i < N; i++) { const m = par[Math.floor(R() * par.length)], d = par[Math.floor(R() * par.length)]; kids.push(this.rat(Gen.mate(lay, m.g, d.g))); }
    s.hist.push(s.rec); s.rats = kids; s.season++; s.q.push(this.q(kids)); ev.push({ k: 'bred', g: s.season, q: this.q(kids) });
    if (s.auto) { if (s.season >= s.endSeason) S.go(s, 'done6'); else S.go(s, 'dusk'); return; }
    if (s.season === K.askAt && !s.askedH && !s.whatif) { s.askedH = 1; S.ask(s, ev, 'qhat', 'y', { chart: 0, at: K.seasons, start: s.q[s.q.length - 1], tol: K.tolH }); S.go(s, 'askQ'); return; }
    if (s.season > K.seasons) { S.ask(s, ev, 'wd', 'y', { chart: 0, at: K.seasons + K.after + 1, start: s.q[s.q.length - 1], tol: 0.06 }); S.go(s, 'askWd'); return; }
    S.go(s, 'dusk');
  },
  act(S, s, a, ev) {
    const K = EQK.L6, open = s.phase === 'dusk' || s.phase === 'place' || s.phase === 'night';
    if (a.k === 'tray' && !s.auto && open) {
      const x = Math.max(30, Math.min(K.W - 24, +a.x || 0)), y = Math.max(34, Math.min(K.H - 18, +a.y || 0)), i = a.i | 0;
      if (i >= s.trays.length) { if (s.trays.length < K.trays) { s.trays.push({ x, y }); ev.push({ k: 'tray', i: s.trays.length - 1, add: 1 }); } else ev.push({ k: 'full' }); }
      else { s.trays[i].x = x; s.trays[i].y = y; }
    }
    else if (a.k === 'untray' && !s.auto && (s.phase === 'dusk' || s.phase === 'place')) { const i = a.i | 0; if (i >= 0 && i < s.trays.length) { const t = s.trays.splice(i, 1)[0]; ev.push({ k: 'untray', x: t.x, y: t.y }); } }
    else if (a.k === 'release' && s.phase === 'place') this.night(S, s);
  },
  after(S, s, id) {
    if (id === 'adult') S.go(s, 'dawn');
    else if (id === 'qhat') { s.fast = EQK.L6.lapse; S.go(s, 'dusk'); }
    else if (id === 'wd') { s.auto = true; s.fast = 1; s.whatif = s.whatif || null; s.s1w = 0; s.s2w = s.s2; s.endSeason = EQK.L6.seasons + EQK.L6.after + 1; s.trays = []; S.go(s, 'dusk'); }
  },
  meanS1(s, n) { const a = s.s1.slice(0, n); let t = 0; for (const v of a) t += v; return a.length ? t / a.length : 0; },
  qhat(s1, s2) { return s1 + s2 > 0 ? s1 / (s1 + s2) : 0; },
  expect(S, s, id) {
    if (id === 'adult') return EQ.adults(EQ.frac(s.rec.nb), s.rec.s1, s.s2);
    if (id === 'qhat') return this.qhat(this.meanS1(s, s.s1.length), s.s2);
    return EQ.proj(s.q[s.q.length - 1], EQK.L6.after, 0, s.s2);
  },
  // the farmer's debrief: the best fixed number of well-placed trays over the ten baited seasons, from the expected recursion
  best(s) {
    const K = EQK.L6; let bk = 0, bg = 1e9;
    for (let k = 0; k <= K.trays; k++) { let q = s.q[0], g = 0; const s1 = K.best[k]; for (let t = 0; t < K.seasons; t++) { const p = 1 - q; g += K.N - s1 * K.N * p * p + k * K.cost; q = EQ.sel(q, s1, s.s2); } if (g < bg - 1e-9) { bg = g; bk = k; } }
    return { k: bk, g: Math.round(bg) };
  },
  actions(S, s) {
    if (s.auto || !(s.phase === 'dusk' || s.phase === 'place' || s.phase === 'night')) return [];
    const out = [], i = Math.min(s.trays.length, EQK.L6.trays - 1);
    for (const x of [70, 130, 190, 250, 310]) for (const y of [80, 150, 220]) out.push({ k: 'tray', i, x, y });
    if (s.phase !== 'night') for (let j = 0; j < s.trays.length; j++) out.push({ k: 'untray', i: j });
    if (s.phase === 'place') out.push({ k: 'release' });
    return out;
  },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) {
      if (name === 'greedy') return S.near(pr, s.ask.kind === 'tri' ? EQ.frac(s.rec.nb) : s.q[s.q.length - 1]);   // "no change": newborns, or today's q
      if (name === 'threshold') return S.near(pr, s.ask.kind === 'tri' ? [0.25, 0.5, 0.25] : 0.5);
      return name === 'alwaysA' ? pr[0] : pr[pr.length - 1];
    }
    if (name === 'greedy') { const spots = [[230, 160], [250, 200], [250, 120], [270, 240]]; if (s.trays.length < 4) { const p = spots[s.trays.length]; return { k: 'tray', i: s.trays.length, x: p[0], y: p[1] }; } return s.phase === 'place' ? { k: 'release' } : null; }   // the most bait, best placed
    if (name === 'threshold') return s.trays.length < 1 ? { k: 'tray', i: 0, x: 180, y: 150 } : (s.phase === 'place' ? { k: 'release' } : null);
    return name === 'alwaysA' ? acts[0] || null : null;
  },
  lever(S, s, k) { s.auto = true; s.fast = 1; s.trays = []; s.s2w = k === 'nocost' ? 0 : s.s2; s.s1w = k === 'nowarf' ? 0 : Math.max(0.3, this.meanS1(s, s.s1.length)); s.endSeason = s.season + 10; S.go(s, 'dusk'); },
  interesting(S, s) {
    if (s.whatif) return s.whatif === 'nocost' ? 'nocost' : 'nowarf';
    let mx = 0; for (let i = 0; i <= EQK.L6.seasons && i < s.q.length; i++) mx = Math.max(mx, s.q[i]);
    if (mx < 0.15) return 'bait';
    return s.pred.wd != null && !s.hits.wd ? 'slow' : null;
  }
},

/* ---- L7 Case files (boss): five hidden causes, a field-day budget, then a looks-only beach for carriers ---- */
7: {
  // the five cases: drift and migration once each (the boss's inversion), plus three drawn with repeats from relatives, two demes, selection and Nothing
  init(S, s) { const o = ['drift', 'mig'], more = ['inb', 'wah', 'sel', 'none']; for (let k = 0; k < 3; k++) o.push(more[Math.floor(R() * more.length)]); s.order = EQ.shuffle(o); s.ci = 0; s.days = S.P('days'); s.dx = []; s.car = null; this.newCase(S, s); S.go(s, 'intro'); },
  need(s) { return s.cs ? Math.min(20, Math.round(0.4 * s.cs.N)) : 20; },   // a small island's diagnose gate
  newCase(S, s) {   // every case on the same kind of island; only the census size (shown) and the hidden cause differ
    const K = EQK.L7, cause = s.order[s.ci], sm = () => (R() < 0.5 ? K.tiny : K.small), N = cause === 'drift' ? sm() : R() < K.smallP ? sm() : K.N, f = EQ_FIELD.make();   // drifting islands are small; some small islands are not drifting
    EQ_FIELD.pos(f, N);
    const pY = cause === 'mig' || cause === 'drift' ? [0.5] : [0.5, 0.5, 0.5, 0.5];   // p each year; only drift and migration move it
    if (cause === 'drift') for (let y = 1; y < 4; y++) pY.push(WF.binom(2 * N, pY[y - 1]) / (2 * N));
    else if (cause === 'mig') { pY[0] = 0.3; for (let y = 1; y < 4; y++) pY.push(WF.binom(2 * N, 0.75 * pY[y - 1] + 0.25 * 0.9) / (2 * N)); }   // migrants arrive after each census and breed in
    for (let i = 0; i < N; i++) {
      const west = f.x[i] < 0.5, gf = cause === 'inb' ? EQ.inb(0.5, 0.3) : cause === 'wah' ? EQ.hw(west ? 0.8 : 0.2) : cause === 'sel' ? EQ.adults(EQ.hw(0.5), 0.5, 0.5) : EQ.hw(pY[0]);
      const gm = cause === 'inb' ? EQ.inb(0.5, 0.3) : cause === 'wah' ? EQ.hw(west ? 0.35 : 0.65) : EQ.hw(0.5);   // two demes differ a little at the second gene too
      f.g.push(EQ.draw(gf)); f.m.push(EQ.draw(gm)); f.d.push(west ? 0 : 1);
    }
    s.cs = { cause, f, years: pY, tests: {}, obs: [0, 0, 0], mobs: [0, 0, 0], N };
    s.f = f; s.obs = s.cs.obs; s.n = 0; s.q = { x: -1, y: -1 }; s.acc = 0; s.idle = 0;
  },
  newborn(cs, i) { const c = cs.cause; return EQ.draw(c === 'inb' ? EQ.inb(0.5, 0.3) : c === 'wah' ? EQ.hw(i % 2 ? 0.2 : 0.8) : EQ.hw(cs.years[c === 'drift' || c === 'mig' ? 1 : 0])); },   // this year's young become next year's adults
  test(S, s, key, ev) {
    const K = EQK.L7, cs = s.cs, f = cs.f, cost = K.cost[key];
    if (cs.tests[key] || s.n < this.need(s)) return;
    if (s.days < cost) { ev.push({ k: 'nodays' }); return; }
    s.days -= cost; const pick = list => list[Math.floor(R() * list.length)], tiny = cs.N <= K.small, m = tiny ? 12 : 50;
    let r = null;
    if (key === 'area') { const W = [], E = []; for (let i = 0; i < f.x.length; i++) (f.d[i] ? E : W).push(i); const a = [0, 0, 0], b = [0, 0, 0]; for (let k = 0; k < m; k++) { a[f.g[pick(W)]]++; b[f.g[pick(E)]]++; } r = { groups: [a, b] }; }
    else if (key === 'age') { const a = [0, 0, 0], b = [0, 0, 0]; for (let k = 0; k < m; k++) { a[this.newborn(cs, k)]++; b[f.g[Math.floor(R() * f.x.length)]]++; } r = { groups: [a, b] }; }
    else if (key === 'gene') { r = { groups: [cs.mobs.slice()] }; }
    else if (key === 'year') { const ny = Math.min(60, cs.N), ps = cs.years.map(p => { const c = [0, 0, 0]; for (let k = 0; k < ny; k++) c[EQ.draw(EQ.hw(p))]++; return c; }); r = { groups: ps, p: ps.map(c => EQ.r2(EQ.p(c))), n: ny }; }
    cs.tests[key] = r; ev.push({ k: 'test', key });
  },
  step(S, s, dt, ev) {
    const K = EQK.L7;
    if (s.phase === 'intro' && s.t > K.intro) S.go(s, 'csample');
    else if (s.phase === 'csample') {
      const cs = s.cs, cap = Math.min(K.base, cs.N);
      EQ_FIELD.scan(s, s.f, dt, K.rate, cap, i => { cs.obs[s.f.g[i]]++; cs.mobs[s.f.m[i]]++; ev.push({ k: 'samp', i, g: s.f.g[i], n: s.n }); });
      if (!s.unt && s.t > K.sampleT) { if (s.n < this.need(s)) this.force(s, this.need(s)); S.go(s, 'dx'); ev.push({ k: 'dxopen' }); }
    }
    else if (s.phase === 'dx' && !s.unt && s.t > K.dxT) this.diagnose(S, s, -1, 0.5, ev);
    else if (s.phase === 'closed' && s.t > K.closed) {
      s.ci++;
      if (s.ci < 5) { this.newCase(S, s); S.go(s, 'intro'); }
      else this.carrier(S, s);
    }
    else if (s.phase === 'carrier') {
      const c = s.car;
      EQ_FIELD.scan(s, s.f, dt, K.rate, K.carMax, i => { c.obs[s.f.g[i] === 2 ? 1 : 0]++; ev.push({ k: 'samp', i, g: s.f.g[i], n: s.n, looks: 1 }); });
      if ((s.t > K.carT && s.n >= K.carNeed) || s.n >= K.carMax || (!s.unt && s.t > K.carT + 20)) {
        if (s.n < K.carNeed) this.force(s, K.carNeed, true);
        S.ask(s, ev, 'car', 'y', { chart: 0, at: 1, start: c.obs[1] / Math.max(1, s.n), tol: 0.04 }); S.go(s, 'askCar');
      }
    }
    else if (s.phase === 'creveal' && s.t > 2.8) S.go(s, 'done7');
    else if (s.phase === 'done7' && s.t > 1.4) S.go(s, 'over');
  },
  force(s, need, looks) {   // an idle player: the quadrat drops at random until enough are counted
    const f = s.f, want = need || 20;
    for (let i = 0; i < f.x.length && s.n < want; i++) if (!f.sm[i]) { f.sm[i] = 1; s.n++; if (looks) s.car.obs[f.g[i] === 2 ? 1 : 0]++; else { s.cs.obs[f.g[i]]++; s.cs.mobs[f.m[i]]++; } }
  },
  carrier(S, s) {
    const K = EQK.L7, cnt = EQ.counts(EQ.hw(1 - K.carQ), K.carN), codes = [];
    for (let c = 0; c < 3; c++) for (let k = 0; k < cnt[c]; k++) codes.push(c);
    EQ.shuffle(codes); const f = EQ_FIELD.make(); EQ_FIELD.pos(f, K.carN); f.g = codes;
    s.car = { obs: [0, 0], true: cnt }; s.cs = null; s.f = f; s.n = 0; s.q = { x: -1, y: -1 }; s.acc = 0; S.go(s, 'carrier');
  },
  diagnose(S, s, c, conf, ev) {
    const truth = EQ_CAUSES.indexOf(s.cs.cause), cf = Math.max(0.5, Math.min(0.95, +conf || 0.5)); let brier = 0;
    for (let i = 0; i < 6; i++) { const fi = c < 0 ? 1 / 6 : i === c ? cf : (1 - cf) / 5, o = i === truth ? 1 : 0; brier += (fi - o) * (fi - o); }
    const rec = { c, conf: cf, truth, ok: c === truth, brier: EQ.r2(brier), cause: s.cs.cause, bought: Object.keys(s.cs.tests) };
    s.dx.push(rec); S.go(s, 'closed'); ev.push({ k: 'closed', ok: rec.ok, cause: s.cs.cause, c });
  },
  act(S, s, a, ev) {
    if ((s.phase === 'csample' || s.phase === 'carrier') && a.k === 'quad') EQ_FIELD.place(s, a);
    else if (s.phase === 'csample' && a.k === 'test') this.test(S, s, a.key, ev);
    else if (s.phase === 'csample' && a.k === 'diag' && s.n >= this.need(s)) { S.go(s, 'dx'); ev.push({ k: 'dxopen' }); }
    else if (s.phase === 'dx' && a.k === 'back') S.go(s, 'csample');
    else if (s.phase === 'dx' && a.k === 'dx') this.diagnose(S, s, Math.max(0, Math.min(5, a.c | 0)), a.conf, ev);
  },
  after(S, s, id, ev) { S.go(s, 'creveal'); ev.push({ k: 'creveal' }); },
  expect(S, s) { const c = s.car, q = Math.sqrt(c.obs[1] / Math.max(1, c.obs[0] + c.obs[1])); return 2 * q * (1 - q); },
  actions(S, s) {
    if (s.phase === 'csample') { const out = EQ_FIELD.grid(s); if (s.n >= this.need(s)) { for (const key of ['area', 'age', 'gene', 'year']) if (!s.cs.tests[key] && s.days >= EQK.L7.cost[key]) out.push({ k: 'test', key }); out.push({ k: 'diag' }); } return out; }
    if (s.phase === 'dx') { const out = []; for (let c = 0; c < 6; c++) for (const conf of [0.5, 0.7, 0.9]) out.push({ k: 'dx', c, conf }); return out; }
    if (s.phase === 'carrier') return EQ_FIELD.grid(s);
    return [];
  },
  bot(name, S, s, acts) {
    const pr = acts.filter(a => a.k === 'predict');
    if (pr.length) { const c = s.car, n = c.obs[0] + c.obs[1]; return S.near(pr, name === 'greedy' ? c.obs[1] / Math.max(1, n) : name === 'alwaysA' ? 0 : name === 'alwaysB' ? 1 : 0.5); }   // greedy: carriers = the amber share
    if (s.phase === 'dx') {
      if (name === 'greedy') { const x = EQ.chi(s.cs.obs), F = EQ.Fhat(s.cs.obs), c = x > 3.84 ? (F > 0 ? 0 : 2) : 5; return acts.find(a => a.c === c && a.conf === 0.7); }   // the pooled test alone
      if (name === 'threshold') return acts.find(a => a.c === 0 && a.conf === 0.9);
      return name === 'alwaysA' ? acts[0] : acts[acts.length - 1];
    }
    const g = acts.filter(a => a.k === 'quad');
    if (s.phase === 'csample' && s.n >= Math.min(s.cs.N, name === 'greedy' ? 100 : 40)) { if (name === 'greedy' && !s.cs.tests.year && s.days >= 2 && s.ci < 2) return acts.find(a => a.k === 'test' && a.key === 'year') || acts.find(a => a.k === 'diag'); return acts.find(a => a.k === 'diag') || null; }
    if (name === 'greedy') { const j = Math.floor(s.tick / 30) % g.length; return s.q.x === g[j].x && s.q.y === g[j].y ? null : g[j]; }
    return s.q.x < 0 ? g[name === 'alwaysA' ? 0 : 4] : null;
  },
  interesting(S, s) { return s.dx.some(r => (r.cause === 'drift' || r.cause === 'mig') && r.c === 5) ? 'cases' : null; }
},
rnd: {
  shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; },
  draw(f) { const u = R(); return u < f[0] ? 0 : u < f[0] + f[1] ? 1 : 2; }   // one genotype from shares (one R())
}
} };
const EQ_LV = [0, 1, 2, 3, 4, 5, 6, 7].map(k => EQ_SIMS.sim[k]);
const EQ_FIELD = EQ_SIMS.sim.field;
EQ.shuffle = EQ_SIMS.sim.rnd.shuffle; EQ.draw = EQ_SIMS.sim.rnd.draw;

/* ================= view helpers (pure arithmetic; cosmetic randomness from a hash, never R()) ================= */
const EQV = {
  dist(x, y) { return Math.sqrt(x * x + y * y); },
  hash(i, k) { let h = Math.imul((i | 0) ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul((k | 0) + 0x632BE5AB, 0xC2B2AE35); h ^= h >>> 13; h = Math.imul(h, 0x5BD1E995); h ^= h >>> 15; return (h >>> 0) / 4294967296; },
  rng(seed) { let a = seed >>> 0 || 1; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
  atan2(y, x) {   // a polynomial atan2 (|error| < 0.01 rad), for headings only
    const ax = Math.abs(x), ay = Math.abs(y), mx = Math.max(ax, ay), mn = Math.min(ax, ay); if (mx < 1e-9) return 0;
    const a = mn / mx, s2 = a * a; let r = ((-0.0464964749 * s2 + 0.15931422) * s2 - 0.327622764) * s2 * a + a;
    if (ay > ax) r = 1.5707963267948966 - r; if (x < 0) r = 3.141592653589793 - r; return y < 0 ? -r : r;
  },
  clamp(v, a, b) { return v < a ? a : v > b ? b : v; },
  lerp(a, b, t) { return a + (b - a) * t; },
  easeOut(t) { t = EQV.clamp(t, 0, 1); return 1 - (1 - t) * (1 - t) * (1 - t); },
  easeIO(t) { t = EQV.clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) * (-2 * t + 2) * (-2 * t + 2) / 2; },
  pal(k, d) { return typeof Pal !== 'undefined' && Pal[k] ? String(Pal[k]) : d; },
  rgba(h, a) { const s = String(h).replace('#', ''), f = s.length === 3 ? s.split('').map(x => x + x).join('') : s; return 'rgba(' + parseInt(f.slice(0, 2), 16) + ',' + parseInt(f.slice(2, 4), 16) + ',' + parseInt(f.slice(4, 6), 16) + ',' + a + ')'; },
  jh(A) { return Math.round(EQV.clamp(A.h * 0.2, 76, 120)); },
  tok(r, max) { let t = 9; while (t > 3) { const cols = Math.floor((r.w - 8) / (2 * t + 1.5)), rows = Math.floor((r.h - 8) / (2 * t + 1.5)); if (cols * rows >= max) break; t -= 0.5; } return t; },
  INK: '#1B1612', SIL: '#9C8A70', PAPER: '#F4EEDD', SAND: '#C9B283', SAND2: '#B39C6E', LAB: '#F4EEDD', SOIL: '#6E5A45', NIGHT: '#2E2620', WATER: '#36504F', MARSH: '#8A8A66', DUNE: '#D8C9A0'
};

/* ================= the chapter ================= */
const CH_HWE_V2 = {
  id: 'census', v2: true, plan: ['Equilibrium', 'Hardy–Weinberg and what breaks it'],
  role: 'investigator', place: 'beetle', accent: '#7D5BA6',   // the chapter's chrome tint (D6 decision 7)
  intro: { goal: 'Find what keeps genotypes in balance, and what breaks it.' },
  content: EQ_C,
  P: {
    p0: { v: 0.3, tag: 'designed', min: 0.1, max: 0.9, label: 'p on Beetle Isle' },
    F: { v: 0.2, tag: 'designed', min: 0.05, max: 0.4, label: 'shortfall if departing' },
    s2: { v: 0.5, tag: 'designed', min: 0.1, max: 0.9, label: 'vitamin-K cost s₂' },
    days: { v: 8, tag: 'designed', min: 6, max: 25, label: 'field days' }
  },
  levels: [
    { name: 'Two copies each', adds: 'allele copies', codes: ['C1', 'B1'], minutes: 2 },
    { name: 'The tumbler', adds: 'random pairing of gametes', codes: ['C1'], minutes: 2 },
    { name: 'One generation', adds: 'any starting mix', codes: ['C1', 'A1'], minutes: 3 },
    { name: 'The census', adds: 'a χ² test', codes: ['A1', 'A2'], minutes: 3 },
    { name: 'Close relatives', adds: 'inbreeding', codes: ['C6'], minutes: 3 },
    { name: 'Two demes', adds: 'population structure', codes: ['C5'], minutes: 3 },
    { name: 'The bait-layer', adds: 'selection on rats', codes: ['C9', 'C7'], minutes: 4 },
    { name: 'Case files', adds: 'hidden causes', codes: ['A1', 'C2', 'C5', 'A2'], minutes: 5 }
  ],
  keys: { ArrowLeft: 'move', ArrowRight: 'move', ArrowUp: 'move', ArrowDown: 'move', Space: 'crank or act', Enter: 'tag or choose', S: 'spin', V: 'turn the valve', N: 'next step', L: 'gene lens', P: 'predict', 1: 'A jar, or choice', 2: 'a jar, or choice', '[': 'lower p', ']': 'raise p', Backspace: 'lift a tray' },
  untimed: true,
  teacher: { prompts: ['Why do half the beetles look blue when only 30% of copies are A?', 'A population fits Hardy–Weinberg. Name two forces that could still be acting.', 'Which Hardy–Weinberg assumption is least true for your study species?'], pool: 'tri' },
  encodings: [{ k: 'A', rgb: [47, 95, 208], channels: ['colour', 'letter'] }, { k: 'a', rgb: [232, 180, 22], channels: ['colour', 'letter'] }],
  starTraits: [],
  maths: EQ, lv: EQ_LV,   // for tests/oracle_census.js

  /* ---------------- headless simulation (API_v2 §9.3) ---------------- */
  sim: {
    dt: 1 / 30, s: null,
    P(k) { const P = CH_HWE_V2.P[k]; return P ? +P.v : 0; },
    H() { return EQ_LV[this.s.level]; },
    go(s, phase) { s.phase = phase; s.t = 0; },
    ask(s, ev, id, kind, o) {
      o = o || {}; s.ask = { id, kind, chart: o.chart || 0, lo: 0, hi: 1, at: o.at, start: o.start, tol: o.tol }; s.askT = 0;
      if (s.asks.indexOf(id) < 0) s.asks.push(id); ev.push({ k: 'ask', id });
    },
    near(acts, v) {   // the predict option nearest to v (bots)
      let best = acts[0], bd = 1e9;
      for (const a of acts) { const d = Array.isArray(v) ? EQ.triErr(a.v, v) : Math.abs(a.v - v); if (d < bd) { bd = d; best = a; } }
      return best;
    },
    reset(level, o) {
      o = o || {};
      if (o.thaw && o.thaw.snap) {   // What if?: the frozen moment, one lever changed (D1 G9)
        this.restore(o.thaw.snap); const s = this.s; s.log = []; s.whatif = o.thaw.lever; s.ask = null;
        const H = EQ_LV[s.level]; if (H.lever) H.lever(this, s, o.thaw.lever); return;
      }
      if (o.P) for (const k in o.P) if (CH_HWE_V2.P[k]) CH_HWE_V2.P[k].v = o.P[k];
      this.s = { level, phase: 'start', t: 0, T: 0, tick: 0, asks: [], pred: {}, exp: {}, hits: {}, err: {}, ask: null, askT: 0, log: [], whatif: null,
                 unt: !!(typeof Save !== 'undefined' && Save.d && Save.d.ui && Save.d.ui.unt) };
      EQ_LV[level].init(this, this.s);
    },
    step(dt) {
      const s = this.s, ev = []; if (!s || s.phase === 'over') return ev;
      s.tick++; s.t += dt;
      if (s.ask) { if (!s.unt) { s.askT += dt; if (s.askT > EQK.ASKMAX) this.commit(s, s.ask.id, null, ev); } return ev; }
      this.H().step(this, s, dt, ev);
      return ev;
    },
    commit(s, id, v, ev) {
      const A = s.ask, H = EQ_LV[s.level]; if (!A || A.id !== id) return;
      const e = H.expect(this, s, id), tri = A.kind === 'tri';
      let val = v;
      if (val != null) val = tri ? (Array.isArray(val) && val.length === 3 ? (t => [val[0] / t, val[1] / t, val[2] / t])(Math.max(1e-9, (+val[0] || 0) + (+val[1] || 0) + (+val[2] || 0))) : null) : Math.max(A.lo, Math.min(A.hi, +val));
      if (val != null && !tri && !isFinite(val)) val = null;
      const err = val == null ? 9 : tri ? EQ.triErr(val, e) : Math.abs(val - e);
      s.pred[id] = val; s.exp[id] = tri ? e.map(EQ.r2) : EQ.r2(e); s.err[id] = EQ.r2(err); s.hits[id] = err <= A.tol;
      s.ask = null; ev.push({ k: 'reveal', id, e, tol: A.tol, hit: s.hits[id], none: val == null });
      H.after(this, s, id, ev);
    },
    act(a) {
      const s = this.s, ev = []; if (!s || !a || s.phase === 'over') return ev;
      if (a.k === 'predict') { if (s.ask && a.id === s.ask.id) this.commit(s, a.id, a.v, ev); return ev; }
      if (s.ask) return ev;
      this.H().act(this, s, a, ev);
      return ev;
    },
    result() {
      const s = this.s; if (!s || s.phase !== 'over') return null;
      const st = CH_HWE_V2.stars, n = s.level, H = EQ_LV[n];
      const mask = s.whatif ? 0 : (st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0);
      return { mask, outcome: { level: n, hits: Object.assign({}, s.hits) }, interesting: H.interesting ? H.interesting(this, s) : null };
    },
    snapshot() { return Snap.enc({ s: this.s, rs: R.state() }); },
    restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
    actions() {
      const s = this.s; if (!s || s.phase === 'over') return [];
      if (s.ask) {
        const A = s.ask, out = [];
        if (A.kind === 'tri') { for (let i = 0; i <= 10; i++) for (let j = 0; j <= 10 - i; j++) out.push({ k: 'predict', id: A.id, v: [i / 10, j / 10, EQ.r2(1 - i / 10 - j / 10)] }); }
        else for (let i = 0; i <= 20; i++) out.push({ k: 'predict', id: A.id, v: i / 20 });
        return out;
      }
      return this.H().actions(this, s) || [];
    },
    bots: {
      alwaysA(s, acts, rnd) { return EQ_LV[s.level].bot('alwaysA', CH_HWE_V2.sim, s, acts, rnd); },
      alwaysB(s, acts, rnd) { return EQ_LV[s.level].bot('alwaysB', CH_HWE_V2.sim, s, acts, rnd); },
      greedy(s, acts, rnd) { return EQ_LV[s.level].bot('greedy', CH_HWE_V2.sim, s, acts, rnd); },
      threshold(s, acts, rnd) { return EQ_LV[s.level].bot('threshold', CH_HWE_V2.sim, s, acts, rnd); }
    }
  },

  /* ---------------- stars: pure functions of the final state, scored against the expectation (D1 G10) ---------------- */
  stars: {
    discover: (s, n) => {
      if (s.whatif) return false;
      if (n === 0) return s.manual >= EQK.L0.need && !!s.lapsed;
      if (n === 1) return s.pairs.length >= EQK.L1.big;
      if (n === 2) return s.rec.length >= 5;
      if (n === 3) return s.res.length >= 2 && s.res.some(r => r.n >= 150);   // a big enough sample; not a χ² that once crossed 3.84
      if (n === 4) { const h = s.hist[3]; return s.gen >= EQK.L4.sched.length && !!h && h.c[1] / EQ.n(h.c) <= 0.8 * 2 * h.p * (1 - h.p) && EQ_LV[4].goal(s); }
      if (n === 5) return EQ.chi(s.obs) > 3.84 && s.splits.some(r => r.fit && !r.auto);
      if (n === 6) {   // the adult excess seen, and q settled near your own q̂ by season 10 (not "breed the most resistance")
        const K = EQK.L6, ex = s.hist.some(h => h.season <= K.seasons && h.ad[1] / Math.max(1, EQ.n(h.ad)) > h.nb[1] / Math.max(1, EQ.n(h.nb)) + 0.03);
        return ex && s.q.length > K.seasons && Math.abs(s.q[K.seasons] - EQ_LV[6].qhat(EQ_LV[6].meanS1(s, K.seasons), s.s2)) <= 0.12;
      }
      return s.dx.filter(r => r.ok).length >= 4;
    },
    predict: (s, n) => {
      if (s.whatif) return false;
      const H = s.hits;
      if (n === 0) return !!H.yule;
      if (n === 1) return !!H.het;
      if (n === 2) return (H.r0 ? 1 : 0) + (H.r1 ? 1 : 0) + (H.r2 ? 1 : 0) >= 2;
      if (n === 3) return !!(H.v0 && H.v1);
      if (n === 4) return !!(H.h3 && H.aa);
      if (n === 5) return !!(H.mix && s.splits[0] && !s.splits[0].auto && s.splits[0].acc >= 0.85);
      if (n === 6) return !!(H.adult && H.qhat);
      return !!H.car;
    },
    transfer: (s, n) => {
      if (s.whatif) return false;
      if (n === 2) return !!s.hits.r3;
      if (n === 6) return !!s.hits.wd;
      if (n === 7) return ['drift', 'mig'].every(c => s.dx.some(r => r.cause === c && r.ok && r.conf >= 0.7));
      return false;
    }
  },

  /* teacher result code (D5 §3 item 10; ?unit=census&seed=S): 30 bits. 0–2 level, 3–5 star mask, 6–9 the level's prediction hits
     (in ask order), then per level: L0 Yule bet %; L1 Aa bet %; L2 young-landing error × 100; L3 both verdicts × 20 and the two
     sample sizes ÷ 10; L4 the 2pq(1 − F) bet % and the goal; L5 first-line accuracy %; L6 q̂ bet % and grain lost ÷ 10;
     L7 correct diagnoses, summed confidence × 10 and the carrier bet %. */
  resultBits(s, level) {
    if (!s) return 0;
    const n = Math.max(0, Math.min(7, level | 0)), st = this.stars, c = (v, hi) => Math.max(0, Math.min(hi, Math.round(+v || 0))), P = s.pred || {};
    let bits = n | ((st.discover(s, n) ? 1 : 0) | (st.predict(s, n) ? 2 : 0) | (st.transfer(s, n) ? 4 : 0)) << 3;
    (s.asks || []).slice(0, 4).forEach((id, k) => { if (s.hits && s.hits[id]) bits |= 1 << (6 + k); });
    const pc = v => c(100 * (v == null ? 0 : v), 127);
    if (n === 0) bits |= pc(P.yule) << 10;
    else if (n === 1) bits |= pc(P.het) << 10;
    else if (n === 2) bits |= c(100 * ((s.err && s.err.r0) || 0), 127) << 10 | c(100 * ((s.err && s.err.r3) || 0), 127) << 17;
    else if (n === 3) bits |= c(20 * (P.v0 || 0), 31) << 10 | c(20 * (P.v1 || 0), 31) << 15 | c(((s.res[0] || {}).n || 0) / 10, 31) << 20 | c(((s.res[1] || {}).n || 0) / 10, 31) << 25;
    else if (n === 4) bits |= pc(P.h3) << 10 | (EQ_LV[4].goal(s) ? 1 : 0) << 17;
    else if (n === 5) bits |= c(100 * ((s.splits[0] || {}).acc || 0), 127) << 10 | pc(P.mix) << 17;
    else if (n === 6) bits |= pc(P.qhat) << 10 | c(((s.grainT || 0) + (s.baitT || 0)) / 10, 127) << 17;
    else bits |= c(s.dx.filter(d => d.ok).length, 7) << 10 | c(10 * s.dx.reduce((t, d) => t + (d.c >= 0 ? d.conf : 0), 0), 63) << 13 | pc(P.car) << 19;
    return bits >>> 0;
  },

  /* ================= view: lifecycle, juice, cards, HUD, dock, input (juice only from Sim.run's events) ================= */
  start(ch, o) { this.startLevel((o && o.level) || 0, o || {}); },
  startLevel(n, o) {
    o = o || {}; this.level = n; this._ended = false; this._pend = false; this._asking = null; this._dockSig = ''; this._phase = '';
    this.v = { t: 0, fly: [], open: {}, landed: 0, sq: null, sqKey: '', bg: null, bgKey: '', crank: 0, drum: 0, spinHold: null, press: null, banner: null,
      pulse: 0, col: 0, jarShown: [0, 0], quadSent: 0, trayDrag: -1, traySent: 0, stroke: null, focus: 0, dxSel: -1, dxConf: 0.7, lens: n === 6 ? 'look' : 'genes',
      flash: {}, nursery: [], couple: -1, coupleT: 0, eat: {}, gone: [], revealT: -1, cenT: -1, mixT: -1, closedT: -1, popT: {}, hatchT: -1, yearsShown: 0, kidPop: {},
      sheetT: 0, sheetWas: false, bounce: null, tok: null, penFocus: 0, colTag: 0 };
    Sim.start(this, n, o);
    const s = this.sim.s;
    if (s.whatif) this.v.lens = 'look';
    if (n === 1 && s.pairs) this.v.landed = s.pairs.length;   // a thawed vial redraws its square and bars at once
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
    this.dock(); this.hud();
    const name = s.whatif ? (this.content.levers[s.whatif] || this.levels[n].name) : this.levels[n].name;
    if (typeof Fx !== 'undefined') Fx.tier(3, ms => { this.v.banner = { text: name, t: 0, ms: Math.max(900, ms + 300) }; });
    if (typeof Ghost !== 'undefined' && !s.whatif) {
      const G = { verb: 'tap', key: 'Enter' };
      if (n === 0) Object.assign(G, { at: () => this.ghost0(), until: () => this.sim.s.manual > 0 || this.sim.s.phase !== 'tag1' });
      else if (n === 1 || n === 2) Object.assign(G, { verb: 'hold', key: 'Space', at: () => this.knob(), until: () => { const q = this.sim.s; return n === 1 ? q.pairs.length > 0 : q.ny > 0 || q.round > 0; } });   // its own verb, so the crank's demo shows (L0 used tap)
      else if (n === 4) Object.assign(G, { verb: 'toggle', key: 'V', at: () => this.valvePos('fam'), until: () => this.sim.s.mode === 'fam' });
      else if (n === 6) Object.assign(G, { at: () => this.yardPt(120, 150), until: () => this.sim.s.trays.length > 0 });
      else Object.assign(G, { verb: 'drag', key: 'ArrowRight', at: () => this.quadPark(), to: () => this.fieldPt(0.5, 0.45), until: () => this.sim.s.q && this.sim.s.q.x >= 0 });
      Ghost.show(G);
    }
  },
  update(dt) {
    const v = this.v, ev = Sim.run(this, dt), s = this.sim.s; if (!s) return;
    v.t += dt;
    for (const e of ev) this.juice(e);
    for (const f of v.fly) f.t += dt;
    for (let i = v.fly.length - 1; i >= 0; i--) { const f = v.fly[i]; if (f.t >= f.d) { if (f.land) f.land(f); v.fly.splice(i, 1); } }
    v.pulse = Math.max(0, v.pulse - dt * 2.5);
    if (v.banner) { v.banner.t += dt * 1000; if (v.banner.t > v.banner.ms) v.banner = null; }
    if (s.phase === 'col1' || s.phase === 'col2') v.col = Math.min(1, s.t / EQK.L1.colT); else v.col = Math.max(0, v.col - dt * 3);
    if (v.sheetT && v.t >= v.sheetT) { v.sheetT = 0; this.foldSheet(); }
    if (v.spinHold && !v.spinHold.on && v.t - v.spinHold.t0 > 0.35 && !v.spinHold.moved) { v.spinHold.on = true; Sim.act(this, { k: 'spin', on: true }); }
    const spinning = s.spin && !s.ask;
    v.drum += dt * (spinning ? 7 : 0.6); if (spinning) v.crank += dt * 7;
    if (s.ask && this._asking !== s.ask.id) this.openAsk();
    if (!s.ask && this._asking) this._asking = null;
    if (this._phase !== s.phase) { this._phase = s.phase; this.phaseIn(s.phase); }
    this.dock(); this.hud();
    const r = this.sim.result();
    if (r && !this._ended) { if (!this._pend) { this._pend = true; return; } this._ended = true; this.finish(r); }
  },
  phaseIn(ph) {
    const s = this.sim.s, v = this.v;
    const late = v.sheetWas ? 0.35 : 0;   // on a phone the payoff waits for the prediction sheet to fold
    if (ph === 'reveal' || ph === 'census' || ph === 'creveal') v.revealT = v.t + (ph === 'reveal' ? 0 : late);
    if (ph === 'mix') v.mixT = v.t + late;
    if (ph === 'closed') v.closedT = v.t;
    if ((ph === 'land') && this.level === 2) v.hatchT = v.t;
    if (ph === 'dx') { v.dxSel = -1; v.dxConf = 0.7; }
    if (ph === 'intro' && this.level === 7) { v.yearsShown = 0; v.banner = { text: 'Case ' + (s.ci + 1) + ' / 5', t: 0, ms: 1200 }; }
    if (ph === 'move' || (ph === 'sample' && this.level === 3 && s.beach === 1)) v.banner = { text: this.content.labels.southB, t: 0, ms: 1200 };
    if (ph === 'carrier') v.banner = { text: this.content.labels.looks, t: 0, ms: 1000 };
    if (typeof Strip !== 'undefined' && Strip.redraw) Strip.redraw();
  },
  openAsk() {
    const s = this.sim.s, A = s.ask; this._asking = A.id; if (typeof Predict === 'undefined') return;
    // no soft timer: an untouched guess is never committed for you (the sim's 30 s timeout scores no answer, with no lecture)
    const o = { id: A.id, chart: A.chart, kind: A.kind, axis: { lo: A.lo, hi: A.hi }, start: A.start, tol: A.tol, soft: null };
    if (A.at != null || A.kind === 'y' || A.kind === 'x') o.at = this.askAt(A);
    Predict.ask(o); this.v.sheetWas = !!Predict.opened; this.dock();
    if (typeof Live !== 'undefined') Live.say(this.hudText());
  },
  askAt(A) {   // where the ghost sits: on the asked bar of an eq_bars chart, or on the bare axis line (0.45 up) so its halo has room
    const L = this.level;
    if (A.kind === 'x') return 0.45;
    if (A.kind === 'y' && L === 5) { const g = this.notes().charts[0].groups; return this.barAt(g.length - 1, 1); }   // the young's own bar, a fresh group
    if (A.kind === 'y' && (L === 1 || L === 4 || L === 7)) return this.barAt(0, 1);
    return A.at;
  },
  foldSheet() { if (typeof Predict !== 'undefined') Predict.fold(); },   // fold the phone sheet Predict opened, about 250 ms after a commit, so the payoff plays in view
  barAt(g, b) { return g * 3.7 + b + 0.5; },   // x of bar b in group g on an eq_bars chart (three bars a group, a 0.7 gap)
  finish(r) {
    const s = this.sim.s, n = this.level, C = this.content, o = { level: n, mask: r.mask, final: n === 7, interesting: r.interesting };
    if (!s.whatif) {
      o.take = n === 7 ? C.take : C.captions['L' + n];   // the unit's own thesis on the final card
      const pn = C.panels.find(p => p.id === 'L' + n); if (pn) o.body = pn.text;
      if (n === 6) { const b = EQ_LV[6].best(s); o.body += ' ' + Txt.f(C.captions.grain6, { g: Math.round(s.grainT + s.baitT), k: b.k === 1 ? C.labels.tray1 : Txt.f(C.labels.trayN, { n: b.k }), o: b.g }); }   // the knowable optimum
      if (n === 7) o.body = Txt.f(C.body, { k: s.dx.filter(d => d.ok).length });
      o.why = { real: [C.why.real[n]], maths: [C.why.maths[n]] };
      const vial = typeof Freezer !== 'undefined' ? Freezer.list(this.id).slice(-1)[0] : null;
      if (vial && n === 1) o.whatIf = { gen: vial.gen, levers: ['nostir'] };
      if (vial && n === 6) o.whatIf = { gen: vial.gen, levers: ['nocost', 'nowarf'] };
    } else { o.body = C.captions.whatif; o.why = { real: [C.why.real[n]], maths: [C.why.maths[n]] }; }
    const spec = this.cardChart();
    if (spec) { o.chart = cv => LiveGraph.draw(cv, spec, 'paper'); o.chartLabel = spec.title; }
    End.show(this, o);
  },
  cardChart() { const ch = this.notes().charts, n = this.level; return ch[[1, 0, 0, 0, 1, 1, 0, 0][n]] || ch[0]; },

  /* ---------- juice: every Sim.run event gets a visual within one frame; every sound a visual twin ---------- */
  juice(e) {
    const s = this.sim.s, v = this.v, F = typeof Fx !== 'undefined' ? Fx : null, n = this.level, C = this.content;
    const snd = (k, x, y) => { if (typeof Snd2 !== 'undefined') Snd2.play(k, x != null ? { x, y } : undefined); };
    if (e.k === 'reveal') v.sheetT = v.t + 0.25;   // fold the phone sheet soon, so the payoff is not hidden
    if (e.k === 'reveal' && e.none) { if (typeof Predict !== 'undefined') Predict.cancel(e.id); return; }   // timed out untouched: no mark, no score, no lecture
    if (e.k === 'reveal' && e.id === 'guess') { this.clearAsk(0); if (typeof Snd !== 'undefined' && Snd.click) Snd.click(); return; }   // the looks-only guess is a commit, not scored: no band yet (the jars reveal it)
    if (e.k === 'reveal') { if (typeof Predict !== 'undefined') Predict.reveal(e.id, e.e, e.tol); if (F) Fx.tier(1, () => {}); if (e.hit && F) Fx.pop('✓', Stage.w - 40, this.hudH() + 24, 1); return; }
    if (e.k === 'ask') { snd('tock', Stage.w - 36, this.hudH() + 18); return; }
    if (e.k === 'vial') { if (!s.whatif && typeof Freezer !== 'undefined') Freezer.put(this.id, e.g || 1, this.sim.snapshot()); return; }
    if (e.k === 'autospin') { this.whisper('square'); return; }
    if (n === 0) return this.juice0(e, F, snd);
    if (n === 1 || n === 2) return this.juiceLab(e, F, snd);
    if (n === 4) return this.juice4(e, F, snd);
    if (n === 6) return this.juice6(e, F, snd);
    return this.juiceField(e, F, snd);
  },
  clearAsk(i) {   // a committed ask's band stays on its chart; when that chart changes type, drop it
    const ov = typeof Predict !== 'undefined' ? Predict.overlay(i) : null; if (ov && !ov.active) Predict.clear(i);
  },
  whisper(k, vars) { const t = this.content.whispers[k]; if (t && typeof Whisper !== 'undefined') Whisper.say(vars ? Txt.f(t, vars) : t, 'eq-' + k); },
  fly(o) { const f = Object.assign({ t: -(o.delay || 0), d: 0.45, lift: 30, r: 7 }, o); if (typeof Fx !== 'undefined' && Fx.calm) { f.d = 0.15; f.lift = 0; f.t = Math.max(f.t, -0.05); } this.v.fly.push(f); },

  /* ---------- HUD line, the live number, the dock ---------- */
  T(k, vars) { return Txt.f(this.content.hud[k], vars || {}); },
  hudText() {
    const s = this.sim.s, n = this.level, ph = s.phase, T = (k, x) => this.T(k, x), L = this.content.labels;
    if (n === 0) {
      if (s.open >= 0) return T('sort');
      if (ph === 'tag1' || ph === 'post1') return this.content.firstWords;
      if (ph === 'guess') return T('guess'); if (ph === 'tag') return T('tag', { n: s.manual, m: EQK.L0.need });
      if (ph === 'reveal') return T('reveal', { a: EQ.pct(s.p), b: Math.round(100 * s.bs.filter(b => b.c < 2).length / s.bs.length) });
      if (ph === 'yule') return T('yule'); if (ph === 'lapse') return T('lapse'); return T('done0');
    }
    if (n === 1) {
      if (ph === 'c4') return T('crank'); if (ph === 'askHet') return T('askHet'); if (ph === 'c40') return T('c40');
      if (ph === 'col1') return T('collapse'); if (ph === 'spin') return s.lever ? T('lever') : T('spin', { p: s.p.toFixed(2) }); return T('settle');
    }
    if (n === 2) {
      if (ph === 'build') return T('pen1');
      if (ph === 'show') return s.round === 3 && s.gen === 1 ? T('pen4') : T('pen' + s.round);
      if (ph === 'ask') return T('askTri'); if (ph === 'crank') return T('crankGen', { n: s.ny, m: EQK.L2.young });
      if (ph === 'land') return s.round === 3 ? (s.gen === 0 ? T('land3') : T('land4', { p: EQ.p(s.young).toFixed(2) })) : T('land', { p: EQ.p(s.par).toFixed(2) });
      return T('land4', { p: EQ.p(s.par).toFixed(2) });
    }
    if (n === 3) {
      const t = Math.ceil(s.pool);
      if (ph === 'sample') return s.n ? T('sampleN', { n: s.n }) : (s.beach ? T('south', { t }) : T('sample', { t }));
      if (ph === 'verdict') return T('verdict');
      if (ph === 'census' && s.full) { const f = Math.round(100 * s.full.F); return f >= 6 ? T('census', { n: s.full.n, f }) : T('censusFit', { n: s.full.n }); }
      return T('south', { t });
    }
    if (n === 4) {
      const m = { mix: L.mix, fam: L.fam, like: L.like };
      if (ph === 'valve') return s.gen === 0 ? T('valve') : s.want === 'mix' ? T('toMix') : T('goal');
      if (ph === 'askH') return T('askH'); if (ph === 'askAa') return T('askAa');
      if (ph === 'crank') {
        if (!EQ_LV[4].ok(s)) return T('wrongValve', { m: m[s.want] });
        if (s.want === 'goal') return s.couple === 0 && s.gen === 4 ? T('goal') : T('crankG', { v: m[s.mode], n: s.couple, m: EQK.L4.fams });
        if (s.gen === 3 && s.couple === 0 && s.mode === 'mix') { const h = s.hist[3]; return T('named', { f: Math.max(0, Math.round(100 * (1 - h.c[1] / EQ.n(h.c) / Math.max(1e-6, 2 * h.p * (1 - h.p))))) }); }
        return s.mode === 'fam' ? T('crankF', { n: s.couple, m: EQK.L4.fams }) : T('crankM', { n: s.couple, m: EQK.L4.fams });
      }
      return EQ_LV[4].goal(s) ? T('goalOk') : T('goalNo');
    }
    if (n === 5) {
      if (ph === 'sample') return s.n ? T('sampleD', { n: s.n }) : T('demes');
      if (ph === 'split') { const r = s.splits[s.splits.length - 1]; if (!r) return T('deficit'); return r.fit ? T('splitFit') : T('split', { a: r.x2[0].toFixed(1), b: r.x2[1].toFixed(1) }); }
      if (ph === 'askMix') return T('askMix'); return T('mixed');
    }
    if (n === 6) {
      const c = EQK.L6.cost;
      if (s.whatif) return T('whatif'); if (s.auto) return T('nobait');
      if (ph === 'askAdult') return T('askAdult'); if (ph === 'askWd') return T('withdraw');
      if (ph === 'askQ') return T('askQ', { a: EQ.pct(EQ_LV[6].meanS1(s, s.s1.length)), b: EQ.pct(s.s2) });
      if (s.fast > 1 && ph !== 'dawn') return T('fast');
      if (ph === 'dusk') return T('dusk', { g: s.season }); if (ph === 'place') return s.season === 1 ? T('place', { c }) : T('plan', { g: s.season, c });
      if (ph === 'night') return T('night', { g: s.season });
      if (ph === 'dawn' && s.rec) return T('dawn', { k: EQ.pct(s.rec.s1), n: s.rec.grain });
      return T('dusk', { g: s.season });
    }
    if (ph === 'intro') return T('caseIntro', { c: s.ci + 1 });
    if (ph === 'csample') return s.n >= EQ_LV[7].need(s) ? T('caseTests', { d: s.days }) : T('caseSample', { d: s.days });
    if (ph === 'dx') return T('dx');
    if (ph === 'closed') { const d = s.dx[s.dx.length - 1]; return T('closed', { c: EQ_CAUSE_NAME[d ? d.cause : 'none'] }); }
    if (ph === 'carrier') return T('carrier');
    if (ph === 'askCar') return T('askCar', { a: s.car ? Math.round(100 * s.car.obs[1] / Math.max(1, s.car.obs[0] + s.car.obs[1])) : 0 });
    return T('carDone', { c: s.car ? Math.round(100 * s.car.true[1] / EQK.L7.carN) : 0 });
  },
  hudNum() {
    const s = this.sim.s, n = this.level, L = this.content.labels;
    if (n === 0) return s.phase === 'lapse' || s.phase === 'done0' ? 'gen ' + (s.blue.length - 1) : Txt.f(L.n, { n: s.manual });
    if (n === 1) return Txt.f(L.pairs, { n: s.pairs.length });
    if (n === 2) return 'p ' + EQ.p(s.par).toFixed(2);
    if (n === 3 || n === 5) return s.phase === 'sample' && !s.unt ? Txt.f(L.secs, { n: Math.ceil(n === 3 ? s.pool : s.time) }) : Txt.f(L.n, { n: s.n });
    if (n === 4) return 'p ' + s.hist[s.hist.length - 1].p.toFixed(2);
    if (n === 6) return 'q ' + (s.q[s.q.length - 1] || 0).toFixed(2);
    if (s.phase === 'carrier' || s.phase === 'askCar' || s.phase === 'creveal' || s.phase === 'done7') return Txt.f(L.n, { n: s.n });
    return Txt.f(L.days, { d: s.days });
  },
  hud() { if (typeof HUD === 'undefined' || !HUD.say) return; const t = this.hudText(); HUD.say(t, this.hudNum()); if (t !== this._lastHud) { this._lastHud = t; } },
  dock() {
    if (typeof Dock === 'undefined' || !Dock.set || App.mode !== this) return;
    const s = this.sim.s, n = this.level, L = this.content.labels, ph = s.phase, b = [], need = n === 3 ? 20 : n === 5 ? EQK.L5.need : n === 7 ? EQ_LV[7].need(s) : 20;
    const sig = [n, ph, !!s.ask, s.spin, s.mode, s.n >= need, s.days, s.splits ? s.splits.length : 0, s.trays ? s.trays.length : 0, this.v.lens, s.cs ? Object.keys(s.cs.tests).join() : '', s.lever, s.p, s.fast].join('|');
    if (sig === this._dockSig) return; this._dockSig = sig;
    if (s.ask) b.push({ id: 'commit', label: 'Lock in', key: 'Enter', primary: true, fn: () => { if (typeof Predict !== 'undefined') Predict.commit(s.ask && s.ask.id); } });
    else if ((n === 1 && (ph === 'c4' || ph === 'c40' || ph === 'spin')) || (n === 2 && ph === 'crank') || (n === 4 && ph === 'crank')) {
      b.push({ id: 'crank', label: L.crank, key: ' ', primary: !s.spin, fn: () => Sim.act(this, { k: 'crank', n: 1 }) });
      b.push({ id: 'spin', label: s.spin ? 'Stop' : 'Spin', key: 'S', pressed: !!s.spin, fn: () => Sim.act(this, { k: 'spin', on: !this.sim.s.spin }) });
      if (n === 1 && s.lever && ph === 'spin') {   // the hopper lever: any p for the 400
        b.push({ id: 'pdn', label: 'p −', key: '[', disabled: s.p <= 0.1 + 1e-9, why: 'p is at its lowest.', fn: () => Sim.act(this, { k: 'setp', v: EQ.r2(this.sim.s.p - 0.1) }) });
        b.push({ id: 'pup', label: 'p +', key: ']', disabled: s.p >= 0.9 - 1e-9, why: 'p is at its highest.', fn: () => Sim.act(this, { k: 'setp', v: EQ.r2(this.sim.s.p + 0.1) }) });
      }
    }
    if (n === 2 && ph === 'build') b.push({ id: 'built', label: L.done, key: 'N', primary: true, fn: () => Sim.act(this, { k: 'built' }) });
    if (n === 4 && !s.ask && ph !== 'over' && ph !== 'done4') b.push({ id: 'valve', label: 'Valve', key: 'V', primary: ph === 'valve', fn: () => this.cycleValve() });
    if ((n === 3 || n === 5) && ph === 'sample') b.push({ id: 'finish', label: 'Finish', key: 'N', disabled: s.n < need, why: Txt.f(this.content.whispers.more, { n: need }), fn: () => Sim.act(this, { k: 'finish' }) });
    if (n === 5 && ph === 'split') b.push({ id: 'done', label: 'Done', key: 'N', primary: true, disabled: !s.splits.length, why: this.content.whispers.short, fn: () => Sim.act(this, { k: 'done' }) });
    if (n === 6 && !s.ask && !s.auto) { if (ph === 'place') b.push({ id: 'release', label: 'Release', key: 'N', primary: true, fn: () => Sim.act(this, { k: 'release' }) }); b.push({ id: 'lens', label: this.v.lens === 'look' ? 'Genes' : 'Look', key: 'L', fn: () => { this.v.lens = this.v.lens === 'look' ? 'genes' : 'look'; this._dockSig = ''; this.dock(); } }); }
    if (n === 7 && ph === 'csample') b.push({ id: 'diag', label: 'Diagnose', key: 'N', primary: s.n >= need, disabled: s.n < need, why: Txt.f(this.content.whispers.more, { n: need }), fn: () => Sim.act(this, { k: 'diag' }) });
    if (n === 7 && ph === 'dx') b.push({ id: 'back', label: 'Back', key: 'Escape', fn: () => Sim.act(this, { k: 'back' }) });
    Dock.set(b);
  },
  cycleValve() { const s = this.sim.s, order = ['mix', 'fam', 'like'], m = order[(order.indexOf(s.mode) + 1) % 3]; Sim.act(this, { k: 'valve', m }); },

  /* ---------- input: taps, drags, holds; keyboard paths for every verb ---------- */
  down(x, y) {
    const s = this.sim.s, v = this.v, n = this.level; v.press = { x, y, t: v.t, moved: false };
    if (n === 0 && s.open >= 0) { const k = this.tokHit(x, y); if (k >= 0) { v.press.tok = { k, c: s.left[k] }; v.tok = { k, x, y }; return; } }   // press a copy to drag it to a jar
    if ((n === 1 || n === 2 || n === 4) && this.crankable()) { const k = this.knob(), d = this.drumGeo(); if (k && (EQV.dist(x - k[0], y - k[1]) < 34 || EQV.dist(x - d.cx, y - d.cy) < d.r + 10)) v.spinHold = { t0: v.t, on: false, moved: false, px: x - d.cx, py: y - d.cy, acc: 0 }; }
    if (n === 4) { const vk = this.valveHit(x, y); if (vk) { Sim.act(this, { k: 'valve', m: vk }); v.press = null; return; } }
    if (n === 7 && s.phase === 'csample' && this.shelfHit(x, y)) return;
    if ((n === 3 || n === 5 || n === 7) && s.q && (s.phase === 'sample' || s.phase === 'csample' || s.phase === 'carrier')) { const r = this.quadRect(); if (r && x >= r.x - 14 && x <= r.x + r.w + 14 && y >= r.y - 14 && y <= r.y + r.h + 14) v.press.quad = { dx: x - (r.x + r.w / 2), dy: y - (r.y + r.h / 2) }; }
    if (n === 5 && s.phase === 'split') v.stroke = [[x, y]];
    if (n === 6 && !s.auto) { const i = this.trayHit(x, y); if (i >= 0) v.trayDrag = i; }
  },
  move(x, y) {
    const s = this.sim.s, v = this.v, n = this.level, p = v.press; if (!p) return;
    if (Math.abs(x - p.x) + Math.abs(y - p.y) > 10) p.moved = true;
    if (p.tok && v.tok) { v.tok.x = x; v.tok.y = y; return; }
    if (v.spinHold) {
      const d = this.drumGeo(), h = v.spinHold, nx = x - d.cx, ny = y - d.cy, l0 = EQV.dist(h.px, h.py), l1 = EQV.dist(nx, ny);
      const da = l0 > 8 && l1 > 8 ? Math.abs(h.px * ny - h.py * nx) / (l0 * l1) : 0;   // sin of the turned angle: small steps, so ≈ the angle
      h.px = nx; h.py = ny; if (p.moved) { h.moved = true; if (h.on) { h.on = false; Sim.act(this, { k: 'spin', on: false }); } }
      h.acc += da; v.crank += da;
      while (h.acc >= 3.14159) { h.acc -= 3.14159; Sim.act(this, { k: 'crank', n: 1 }); }
    }
    if (p.quad) { const fp = this.fieldUnit(x - p.quad.dx, y - p.quad.dy); if (v.t - v.quadSent > 0.08) { v.quadSent = v.t; Sim.act(this, { k: 'quad', x: fp[0], y: fp[1] }); } p.qx = fp; }
    if (v.stroke && s.phase === 'split') { const l = v.stroke[v.stroke.length - 1]; if (EQV.dist(x - l[0], y - l[1]) > 8 && v.stroke.length < 64) v.stroke.push([x, y]); }
    if (v.trayDrag >= 0) { const q = this.yardUnit(x, y); v.trayGhost = q; if (v.t - v.traySent > 0.06) { v.traySent = v.t; Sim.act(this, { k: 'tray', i: v.trayDrag, x: q[0], y: q[1] }); } }
  },
  up(x, y) {
    const s = this.sim.s, v = this.v, n = this.level, p = v.press; v.press = null;
    if (v.spinHold) { const h = v.spinHold; v.spinHold = null; if (h.on) Sim.act(this, { k: 'spin', on: false }); else if (!h.moved && p && !p.moved) Sim.act(this, { k: 'crank', n: 1 }); return; }
    if (!p) return;
    if (p.tok) { v.tokDrop = v.tok ? [v.tok.x, v.tok.y] : null; v.tok = null; const j = this.jarHit(x, y); if (j >= 0) Sim.act(this, { k: 'jar', j, c: p.tok.c }); v.tokDrop = null; return; }   // dropped on a jar: in, or a bounce; dropped elsewhere: it floats back
    if (p.quad && p.qx) { Sim.act(this, { k: 'quad', x: p.qx[0], y: p.qx[1] }); return; }
    if (v.trayDrag >= 0) { const i = v.trayDrag; v.trayDrag = -1; v.trayGhost = null; if (!p.moved) { this.tap(x, y); return; } const q = this.yardUnit(x, y); Sim.act(this, { k: 'tray', i, x: q[0], y: q[1] }); return; }   // a tap on a tray (no drag) lifts it
    if (v.stroke && n === 5 && s.phase === 'split') {
      const st = v.stroke; v.stroke = null; let len = 0; for (let i = 1; i < st.length; i++) len += EQV.dist(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
      if (len < 60) { if (len > 24) this.whisper('short'); else this.tap(x, y); return; }
      const pts = []; const step = Math.max(1, Math.floor(st.length / 24)); for (let i = 0; i < st.length; i += step) pts.push(this.fieldUnit(st[i][0], st[i][1]).map(EQ.r2));
      const l = this.fieldUnit(st[st.length - 1][0], st[st.length - 1][1]).map(EQ.r2); pts.push(l);
      v.lastStroke = st; Sim.act(this, { k: 'split', pts }); return;
    }
    if (!p.moved) this.tap(x, y);
  },
  tap(x, y) {
    const s = this.sim.s, v = this.v, n = this.level;
    if (n === 0 && (s.phase === 'tag1' || s.phase === 'tag')) {
      if (s.open >= 0) { const j = this.jarHit(x, y); if (j >= 0) Sim.act(this, { k: 'jar', j }); return; }   // tap a jar: the next copy of that kind goes in, or bounces
      const i = this.hit0(x, y); if (i >= 0) Sim.act(this, { k: 'tag', i }); else this.whisper('copies'); return;
    }
    if (n === 2 && s.phase === 'build') { const i = this.penHit(x, y); if (i >= 0) { v.penFocus = i; Sim.act(this, { k: 'cycle', i }); } else this.whisper('tap'); return; }
    if (n === 7 && s.phase === 'csample') { const key = this.shelfHit(x, y); if (key) { const need = EQ_LV[7].need(s); if (s.n < need) this.whisper('more', { n: need }); else Sim.act(this, { k: 'test', key }); return; } }
    if ((n === 3 || n === 5 || n === 7) && (s.phase === 'sample' || s.phase === 'csample' || s.phase === 'carrier')) { const A = this.fieldRect(); if (x >= A.x && x <= A.x + A.w && y >= A.y && y <= A.y + A.h) { const fp = this.fieldUnit(x, y); Sim.act(this, { k: 'quad', x: fp[0], y: fp[1] }); } return; }
    if (n === 5 && s.phase === 'split') {   // two taps make a straight line: the tap alternative to drawing one (D5 §3.11)
      const fp = this.fieldUnit(x, y);
      if (!v.tapLine) { v.tapLine = fp; this.whisper('second'); return; }
      const a = v.tapLine; v.tapLine = null; if (EQV.dist(a[0] - fp[0], a[1] - fp[1]) < 0.08) return;
      Sim.act(this, { k: 'split', pts: [a.map(EQ.r2), fp.map(EQ.r2)] }); return;
    }
    if (n === 7 && s.phase === 'dx') { const h = this.dxHit(x, y); if (h) { if (h.c != null) { v.dxSel = h.c; if (typeof Snd !== 'undefined') Snd.click(); } else if (h.conf != null && v.dxSel >= 0) { v.dxConf = h.conf; Sim.act(this, { k: 'dx', c: v.dxSel, conf: h.conf }); } } return; }
    if (n === 6 && !s.auto && (s.phase === 'dusk' || s.phase === 'place' || s.phase === 'night')) {
      const q = this.yardUnit(x, y); if (q[0] < 22 || q[0] > EQK.L6.W - 10) return;
      const hit = this.trayHit(x, y);
      if (hit >= 0 && s.phase !== 'night') { Sim.act(this, { k: 'untray', i: hit }); return; }   // tap a tray to lift it (it costs grain every night)
      if (s.trays.length < EQK.L6.trays) Sim.act(this, { k: 'tray', i: s.trays.length, x: q[0], y: q[1] }); else this.whisper('trays');
    }
  },
  onKey(k, e) {
    const s = this.sim.s, v = this.v, n = this.level; if (!s || s.ask) return;
    const key = k.length === 1 ? k.toLowerCase() : k;
    if (n === 0 && s.open >= 0 && (key === '1' || key === '2')) { Sim.act(this, { k: 'jar', j: key === '1' ? 0 : 1 }); return; }   // 1: the A jar, 2: the a jar
    if (n === 1 && (key === '[' || key === ']') && s.lever) { Sim.act(this, { k: 'setp', v: EQ.r2(s.p + (key === ']' ? 0.1 : -0.1)) }); return; }
    if (n === 2 && s.phase === 'build') {
      const m = s.pen.length; if (key === 'ArrowRight' || key === 'ArrowDown') v.penFocus = (v.penFocus + 1) % m; else if (key === 'ArrowLeft' || key === 'ArrowUp') v.penFocus = (v.penFocus + m - 1) % m;
      else if (key === 'Enter' || key === ' ') Sim.act(this, { k: 'cycle', i: v.penFocus }); else if (key === 'n') Sim.act(this, { k: 'built' });
      v.penKeys = true; return;
    }
    if (n === 6 && !s.auto && (key === 'Backspace' || key === 'Delete') && s.trays.length) { Sim.act(this, { k: 'untray', i: s.trays.length - 1 }); return; }
    if (n === 0 && (s.phase === 'tag1' || s.phase === 'tag')) {
      const open = s.bs.map((b, i) => b.tag ? -1 : i).filter(i => i >= 0); if (!open.length) return;
      if (key === 'ArrowRight' || key === 'ArrowDown') v.focus = (v.focus + 1) % open.length; else if (key === 'ArrowLeft' || key === 'ArrowUp') v.focus = (v.focus + open.length - 1) % open.length;
      else if (key === 'Enter' || key === ' ') Sim.act(this, { k: 'tag', i: open[v.focus % open.length] });
      v.focusOn = true; return;
    }
    if ((n === 1 || n === 2 || n === 4) && key === 'Enter') { if (this.crankable()) Sim.act(this, { k: 'crank', n: 1 }); return; }
    if (n === 4 && key === 'v') { this.cycleValve(); return; }
    if ((n === 3 || n === 5 || n === 7) && s.q && /^Arrow/.test(key) && (s.phase === 'sample' || s.phase === 'csample' || s.phase === 'carrier')) {
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[key], st = e && e.shiftKey ? 0.2 : 0.08;
      const x = s.q.x < 0 ? 0.5 : s.q.x + d[0] * st, y = s.q.y < 0 ? 0.5 : s.q.y + d[1] * st; Sim.act(this, { k: 'quad', x: Math.max(0.05, Math.min(0.95, x)), y: Math.max(0.05, Math.min(0.95, y)) }); return;
    }
    if (n === 5 && s.phase === 'split' && /^[1-4]$/.test(key)) { Sim.act(this, { k: 'split', pts: EQ_LV[5].LINES[+key - 1] }); return; }   // across, down, and the two diagonals
    if (n === 6 && !s.auto && /^Arrow/.test(key) && s.trays.length) { const t = s.trays[s.trays.length - 1], d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[key]; Sim.act(this, { k: 'tray', i: s.trays.length - 1, x: t.x + d[0], y: t.y + d[1] }); return; }
    if (n === 6 && !s.auto && (key === 'Enter' || key === ' ') && s.trays.length < EQK.L6.trays) { const spots = [[200, 150], [200, 90], [200, 210], [200, 260]][s.trays.length]; Sim.act(this, { k: 'tray', i: s.trays.length, x: spots[0], y: spots[1] }); return; }
    if (n === 7 && s.phase === 'csample' && /^[1-4]$/.test(key)) { Sim.act(this, { k: 'test', key: ['area', 'age', 'gene', 'year'][+key - 1] }); return; }
    if (n === 7 && s.phase === 'dx') {
      if (/^[1-6]$/.test(key)) { v.dxSel = +key - 1; return; }
      if (key === 'ArrowRight' || key === 'ArrowUp') v.dxConf = Math.min(0.9, EQ.r2(v.dxConf + 0.1)); else if (key === 'ArrowLeft' || key === 'ArrowDown') v.dxConf = Math.max(0.5, EQ.r2(v.dxConf - 0.1));
      else if ((key === 'Enter' || key === ' ') && v.dxSel >= 0) Sim.act(this, { k: 'dx', c: v.dxSel, conf: v.dxConf });
    }
  },
  crankable() { const s = this.sim.s, n = this.level; return !s.ask && ((n === 1 && (s.phase === 'c4' || s.phase === 'c40' || s.phase === 'spin')) || (n === 2 && s.phase === 'crank') || (n === 4 && s.phase === 'crank' && s.mode === s.want)); },

  /* ================= geometry ================= */
  hudH() { return (typeof Stage !== 'undefined' && Stage.zones && Stage.zones.hud && Stage.zones.hud.h) || 56; },
  area() { const W = Stage.w, H = Stage.h, top = this.hudH() + 6; return { x: 10, y: top, w: Math.max(60, W - 20), h: Math.max(60, H - top - 10) }; },
  U() { return (typeof Stage !== 'undefined' && Stage.u) || 390; },
  // beach (L0): the field above the jars
  jarRect() { const A = this.area(), jh = EQV.jh(A), w = Math.min(A.w * 0.44, 220), gap = Math.min(24, A.w * 0.06), y = A.y + A.h - jh - 22; return { y, h: jh, w, a: { x: A.x + A.w / 2 - gap / 2 - w, y, w, h: jh }, b: { x: A.x + A.w / 2 + gap / 2, y, w, h: jh } }; },
  field0() { const A = this.area(), J = this.jarRect(); return { x: A.x + 8, y: A.y + 44, w: A.w - 16, h: Math.max(80, J.y - A.y - 62) }; },
  sz0() { return Math.round(EQV.clamp(0.08 * this.U(), 28, 42)); },
  pos0(i) {
    const F = this.field0(), s = this.sim.s, t = this.v.t, b = s.bs[i], hx = 0.08 + 0.84 * EQV.hash(i, 1), hy = 0.1 + 0.8 * EQV.hash(i, 2);
    const sp = (0.32 + 0.022 * Math.min(12, s.manual)) * (b && b.tag ? 0.45 : 1), w1 = 0.7 + 0.6 * EQV.hash(i, 3), w2 = 1.3 + 0.9 * EQV.hash(i, 4), f1 = 6.28 * EQV.hash(i, 5), f2 = 6.28 * EQV.hash(i, 6);
    const ux = hx + 0.07 * Det.sin(t * sp * w1 + f1) + 0.03 * Det.sin(t * sp * w2 * 1.7 + f2), uy = hy + 0.06 * Det.cos(t * sp * w1 * 0.8 + f2) + 0.025 * Det.sin(t * sp * w2 + f1);
    const dx = 0.07 * w1 * Det.cos(t * sp * w1 + f1) + 0.051 * w2 * Det.cos(t * sp * w2 * 1.7 + f2), dy = -0.048 * w1 * Det.sin(t * sp * w1 * 0.8 + f2) + 0.025 * w2 * Det.cos(t * sp * w2 + f1);
    return [F.x + F.w * EQV.clamp(ux, 0.03, 0.97), F.y + F.h * EQV.clamp(uy, 0.03, 0.97), EQV.atan2(dy * F.h, dx * F.w) + 1.5707963];
  },
  hit0(x, y) { const s = this.sim.s, r = Math.max(24, this.sz0() * 0.75); let bi = -1, bd = r * r; s.bs.forEach((b, i) => { if (b.tag) return; const p = this.pos0(i), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < bd) { bd = d; bi = i; } }); return bi; },
  ghost0() { const s = this.sim.s, i = s.bs.findIndex(b => !b.tag); return i < 0 ? null : this.pos0(i).slice(0, 2); },
  // L0 sorting: the open beetle's copies hover above it until you send each to a jar
  tokPos(k) { const s = this.sim.s, sz = this.sz0(); if (s.open < 0) return null; const p = this.pos0(s.open), one = s.left.length === 1; return [p[0] + (one ? 0 : (k ? 0.5 : -0.5) * sz), p[1] - 0.95 * sz]; },
  tokHit(x, y) { const s = this.sim.s; for (let k = 0; k < s.left.length; k++) { const t = this.tokPos(k); if (t && EQV.dist(x - t[0], y - t[1]) < 26) return k; } return -1; },
  jarHit(x, y) { const J = this.jarRect(); for (const [j, r] of [[0, J.a], [1, J.b]]) if (x >= r.x - 12 && x <= r.x + r.w + 12 && y >= r.y - 24 && y <= r.y + r.h + 24) return j; return -1; },
  // L2: the pen, one slot per parent, in the sim's own order (s.pen); a big pen (100 young turned parents) packs 20 × 5 coins
  penSlots() {
    const s = this.sim.s, P = this.penGeo(), list = [];
    if (s.parF) { for (const [cnt, sex] of [[s.parF, 0], [s.parM, 1]]) for (let g = 0; g < 3; g++) for (let k = 0; k < cnt[g]; k++) list.push([g, sex]); }
    else for (const g of s.pen || []) list.push([g, 0]);
    const big = list.length > 50, inset = s.parF ? 72 : 0, cols = big ? 20 : 10, rows = Math.max(1, Math.ceil(list.length / cols)), cw = (P.w - inset) / cols, chh = P.h / rows;
    const sz = big ? Math.max(4, Math.min(cw, chh) * 0.4) : Math.round(EQV.clamp(Math.min(cw, chh) * 0.95, 14, 34));
    return list.map((q, k) => ({ g: q[0], sex: q[1], x: P.x + inset + cw * ((k % cols) + 0.5), y: P.y + chh * (Math.floor(k / cols) + 0.5), sz, coin: big }));
  },
  penHit(x, y) { const sl = this.penSlots(); let bi = -1, bd = 1e9; sl.forEach((q, i) => { const d = EQV.dist(x - q.x, y - q.y); if (d < Math.max(18, q.sz * 0.7) && d < bd) { bd = d; bi = i; } }); return bi; },
  // lab (L1, L2, L4): hoppers, drum, square / pen / families
  drumGeo() {
    const A = this.area(), n = this.level, m = Math.min(A.w, A.h * 0.95);
    if (n === 1) { const r = Math.round(EQV.clamp(m * 0.13, 34, 70)); return { cx: A.x + A.w / 2, cy: A.y + 16 + r * 1.35, r }; }
    if (n === 2) { const r = Math.round(EQV.clamp(m * 0.085, 26, 46)); return { cx: A.x + A.w / 2, cy: A.y + 34 + A.h * 0.3 + r * 1.25, r }; }
    const r = Math.round(EQV.clamp(m * 0.1, 28, 52)); return { cx: A.x + A.w * 0.3, cy: A.y + 14 + r * 1.3, r };
  },
  knob() { const d = this.drumGeo(), L = d.r * 1.32, a = this.v.crank; return [d.cx + L * Det.cos(a), d.cy + L * Det.sin(a)]; },
  hoppers() { const d = this.drumGeo(), w = Math.round(EQV.clamp(d.r * 1.25, 40, 84)), h = Math.round(w * 1.15), gap = d.r * 1.55 + w * 0.6; return { a: { x: d.cx - gap - w / 2, y: d.cy - h * 0.62, w, h }, b: { x: d.cx + gap - w / 2, y: d.cy - h * 0.62, w, h } }; },
  sqGeo() { const A = this.area(), d = this.drumGeo(), top = d.cy + d.r * 1.55 + 22, room = A.y + A.h - top - 96, S = Math.round(EQV.clamp(Math.min(A.w * 0.62, room), 120, 330)); return { x: A.x + A.w / 2 - S / 2 + 10, y: top, S }; },
  barGeo1() { const A = this.area(), q = this.sqGeo(), y = q.y + q.S + 28; return { x: A.x + A.w / 2 - Math.min(A.w * 0.36, 170), y, w: Math.min(A.w * 0.72, 340), h: Math.max(44, A.y + A.h - y - 18) }; },
  // field levels (L3, L5, L7)
  fieldRect() { const A = this.area(); return { x: A.x + 2, y: A.y + 48, w: A.w - 4, h: A.h - 54 }; },
  fieldPt(ux, uy) { const F = this.fieldRect(); return [F.x + ux * F.w, F.y + uy * F.h]; },
  fieldUnit(x, y) { const F = this.fieldRect(); return [EQV.clamp((x - F.x) / F.w, 0, 1), EQV.clamp((y - F.y) / F.h, 0, 1)]; },
  quadRect() { const s = this.sim.s, F = this.fieldRect(), K = EQK.L3; if (!s.q) return null; const q = s.q.x < 0 ? this.parkUnit() : [s.q.x, s.q.y]; return { x: F.x + (q[0] - K.hw) * F.w, y: F.y + (q[1] - K.hh) * F.h, w: 2 * K.hw * F.w, h: 2 * K.hh * F.h, parked: s.q.x < 0 }; },
  parkUnit() { return this.level === 7 ? [0.86, 0.66] : [0.86, 0.86]; },   // L7: above the instrument shelf
  quadPark() { const u = this.parkUnit(); return this.fieldPt(u[0], u[1]); },
  szF() { return Math.round(EQV.clamp(0.043 * this.U(), 15, 21)); },
  // yard (L6): a virtual 360 × 300 yard, letterboxed
  yardGeo() { const A = this.area(), K = EQK.L6, k = Math.min(A.w / K.W, (A.h - 8) / K.H); return { k, ox: A.x + (A.w - K.W * k) / 2, oy: A.y + 4 + (A.h - 8 - K.H * k) / 2 }; },
  yardPt(x, y) { const g = this.yardGeo(); return [g.ox + x * g.k, g.oy + y * g.k]; },
  yardUnit(x, y) { const g = this.yardGeo(); return [(x - g.ox) / g.k, (y - g.oy) / g.k]; },
  trayHit(x, y) { const s = this.sim.s, g = this.yardGeo(), r = Math.max(26, EQK.L6.r * g.k); let bi = -1, bd = r * r; s.trays.forEach((t, i) => { const p = this.yardPt(t.x, t.y), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < bd) { bd = d; bi = i; } }); return bi; },
  // L4: the valve and the families
  valvePos(m) { const d = this.drumGeo(), i = ['mix', 'fam', 'like'].indexOf(m), w = Math.min(96, (this.area().w - 20) / 3.2); return [d.cx - w + i * w, d.cy + d.r * 1.55 + 18]; },
  valveHit(x, y) { for (const m of ['mix', 'fam', 'like']) { const p = this.valvePos(m); if (Math.abs(x - p[0]) < 46 && Math.abs(y - p[1]) < 24) return m; } return null; },
  famGeo() {
    const A = this.area(), top = this.valvePos('mix')[1] + 26, land = A.w > A.h * 1.05, cols = land ? 8 : 6, rows = 24 / cols, nurse = 46;
    const h = A.y + A.h - top - nurse - 8, cw = A.w / cols, ch = h / rows; return { x: A.x, y: top, cols, rows, cw, ch, ny: A.y + A.h - nurse, nh: nurse };
  },
  famSlot(i) { const G = this.famGeo(), c = i % G.cols, r = Math.floor(i / G.cols); return { x: G.x + c * G.cw + 3, y: G.y + r * G.ch + 3, w: G.cw - 6, h: G.ch - 6 }; },
  // L7: the diagnosis cards
  dxGeo() { const F = this.fieldRect(), w = Math.min(F.w - 24, 420), cw = (w - 12) / 2, ch = Math.min(64, (F.h - 150) / 3), x = F.x + (F.w - w) / 2, y = F.y + 34; return { x, y, w, cw, ch, py: y + 3 * (ch + 8) + 30 }; },
  dxHit(x, y) {
    const G = this.dxGeo();
    for (let c = 0; c < 6; c++) { const cx = G.x + (c % 2) * (G.cw + 12), cy = G.y + Math.floor(c / 2) * (G.ch + 8); if (x >= cx && x <= cx + G.cw && y >= cy && y <= cy + G.ch) return { c }; }
    const pw = Math.min(64, (G.w - 16) / 5); for (let k = 0; k < 5; k++) { const px = G.x + (G.w - 5 * pw) / 2 + k * pw; if (x >= px && x <= px + pw - 6 && y >= G.py && y <= G.py + 46) return { conf: 0.5 + 0.1 * k }; }
    return null;
  },

  /* ================= drawing ================= */
  draw(c, W, H) {
    const s = this.sim.s; if (!s) return;
    const n = this.level;
    if (n === 0) this.draw0(c, W, H);
    else if (n === 1) this.draw1(c, W, H);
    else if (n === 2) this.draw2(c, W, H);
    else if (n === 4) this.draw4(c, W, H);
    else if (n === 6) this.draw6(c, W, H);
    else this.drawField(c, W, H);
    this.drawFly(c);
    this.drawBanner(c, W, H);
  },
  bg(c, W, H, key, fn) {
    const v = this.v, k = key + '|' + Math.round(W) + 'x' + Math.round(H) + '|' + (typeof Pal !== 'undefined' ? Pal.theme : '');
    if (v.bgKey !== k || !v.bg) { v.bgKey = k; if (typeof Layer !== 'undefined') v.bg = Layer(W, H).redraw((cc, w, h) => fn(cc, w, h)); else { v.bg = null; } }
    if (v.bg) v.bg.blit(c, 0, 0); else fn(c, W, H);
  },
  lbl(id, text, x, y, o) { if (typeof Lbl === 'undefined') return null; return Lbl.put(id, text, x, y, Object.assign({ c: Stage.ctx }, o || {})); },
  drawBanner(c, W, H) { const b = this.v.banner; if (!b) return; const a = b.t < 200 ? b.t / 200 : b.t > b.ms - 250 ? Math.max(0, (b.ms - b.t) / 250) : 1; c.save(); c.globalAlpha = a; this.lbl('eq-banner', b.text, W / 2, H * 0.44, { size: 22, weight: 700 }); c.restore(); },
  drawFly(c) {
    for (const f of this.v.fly) {
      if (f.t < 0) continue; const k = EQV.easeIO(f.t / f.d), x = EQV.lerp(f.x0, f.x1, k), y = EQV.lerp(f.y0, f.y1, k) - Det.sin(k * 3.14159) * f.lift;
      if (f.geno) Pal.genotype(c, x, y, f.r, f.geno[0], f.geno[1], { letter: '' }); else if (typeof Pal !== 'undefined') Pal.token(c, x, y, f.r, f.a, { letter: f.r >= 7 ? undefined : '' });
    }
  },
  sand(c, W, H, seed, o) {   // Beetle Isle's sand: speckle, ripples and shells (natural paint, kept away from the data inks)
    o = o || {}; const rnd = EQV.rng(seed || 7), g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, o.top || '#CDB98B'); g.addColorStop(1, o.bot || '#BBA373');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 90; i++) { const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * 1.3; c.fillStyle = rnd() < 0.5 ? 'rgba(90,70,40,.16)' : 'rgba(255,250,235,.22)'; c.fillRect(x, y, r, r); }
    c.lineWidth = 1.2; for (let i = 0; i < W * H / 9000; i++) { const x = rnd() * W, y = rnd() * H, w = 30 + rnd() * 70; c.strokeStyle = 'rgba(255,248,230,.18)'; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w / 2, y - 5, x + w, y); c.stroke(); }
    for (let i = 0; i < W * H / 26000; i++) { const x = rnd() * W, y = rnd() * H; c.fillStyle = '#E9DFC8'; c.beginPath(); c.ellipse(x, y, 3 + rnd() * 2, 2 + rnd() * 1.5, rnd() * 3, 0, 6.283); c.fill(); c.strokeStyle = 'rgba(80,60,40,.35)'; c.lineWidth = 0.8; c.stroke(); }
  },
  labPlate(c, W, H) { c.fillStyle = EQV.LAB; c.fillRect(0, 0, W, H); c.strokeStyle = 'rgba(27,22,18,.06)'; c.lineWidth = 1; for (let x = 0; x < W; x += 22) { c.beginPath(); c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); c.stroke(); } for (let y = 0; y < H; y += 22) { c.beginPath(); c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); c.stroke(); } },
  beetle(c, x, y, size, a, genes, o) {
    o = o || {}; if (typeof Rig !== 'undefined' && Rig.has && Rig.has('beetle')) return Rig.draw(c, 'beetle', { a }, x, y, Object.assign({ size, genes }, o));
    Pal.genotype(c, x, y, size * 0.35, genes ? a[0] : (a[0] === 0 || a[1] === 0 ? 0 : 1), genes ? a[1] : (a[0] === 0 || a[1] === 0 ? 0 : 1), { letter: '' });
  },
  mini(c, x, y, size, a, genes, rot, noRing, sil) {   // a crowd beetle (D4 §4.1 rule 6): head and split wing cases, no legs or letters; sil: not yet sampled
    const A = EQV.pal('A', '#6B97FF'), B = EQV.pal('a', '#F2C94C'), dom = a[0] === 0 || a[1] === 0;
    const l = sil ? EQV.SIL : genes ? (a[0] ? B : A) : (dom ? A : B), r = sil ? EQV.SIL : genes ? (a[1] ? B : A) : (dom ? A : B), ring = !!(genes && !noRing && !sil);
    const cr = Det.cos(rot), sr = Det.sin(rot), dl = !sil && l === B, dr = !sil && r === B;   // amber wing cases carry a dark dot: a pattern channel for ?cvd=mono
    const sp = this.miniSprite(size, l, r, ring, dl, dr);   // a field holds 300–600 of these: blit a cached sprite instead of six antialiased paths each
    if (sp) { const k = size / sp.sz; c.save(); c.transform(cr * k, sr * k, -sr * k, cr * k, x, y); c.drawImage(sp.L.cv, -sp.half, -sp.half, 2 * sp.half, 2 * sp.half); c.restore(); return; }
    c.save(); c.transform(cr, sr, -sr, cr, x, y); this.miniPaths(c, size, l, r, ring, dl, dr, sil); c.restore();
  },
  miniPaths(c, size, l, r, ring, dl, dr, sil) {
    const rx = size * 0.32, ry = size * 0.42;
    c.fillStyle = sil ? 'rgba(43,36,32,.55)' : '#2B2420'; c.beginPath(); c.ellipse(0, -ry * 1.05, rx * 0.55, rx * 0.45, 0, 0, 6.283); c.fill();
    c.fillStyle = l; c.beginPath(); c.moveTo(0, -ry); c.ellipse(0, 0, rx, ry, 0, -1.5708, 1.5708, true); c.closePath(); c.fill();
    c.fillStyle = r; c.beginPath(); c.moveTo(0, -ry); c.ellipse(0, 0, rx, ry, 0, -1.5708, 1.5708, false); c.closePath(); c.fill();
    c.fillStyle = 'rgba(27,22,18,.6)'; if (dl) { c.beginPath(); c.arc(-rx * 0.45, ry * 0.1, Math.max(0.9, size * 0.06), 0, 6.283); c.fill(); } if (dr) { c.beginPath(); c.arc(rx * 0.45, ry * 0.1, Math.max(0.9, size * 0.06), 0, 6.283); c.fill(); }
    c.lineWidth = 1.2; c.strokeStyle = sil ? 'rgba(27,22,18,.45)' : EQV.INK; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 6.283); c.stroke(); c.beginPath(); c.moveTo(0, -ry); c.lineTo(0, ry); c.stroke();
    if (ring) { c.lineWidth = 2; c.strokeStyle = 'rgba(244,238,221,.8)'; c.beginPath(); c.ellipse(0, 0, rx + 2, ry + 2, 0, 0, 6.283); c.stroke(); }
  },
  miniSprite(size, l, r, ring, dl, dr) {   // sprites keyed by colours, ring, dots and a 2 px size bucket; drawn at 1.5× the Layer's own pixel ratio so a pop to 1.5× stays crisp
    if (typeof Layer !== 'function') return null;
    const sz = Math.max(4, Math.round(size / 2) * 2), sil = l === EQV.SIL, key = l + '|' + r + '|' + (ring ? 1 : 0) + (dl ? 1 : 0) + (dr ? 1 : 0) + '|' + sz, C = EQV.sprites || (EQV.sprites = {});
    let sp = C[key]; if (sp) return sp;
    if (Object.keys(C).length > 160) { EQV.sprites = {}; return null; }
    const half = Math.ceil(sz * 0.62 + 4), up = 1.5;
    try { const L = Layer(2 * half * up, 2 * half * up).redraw(cc => { cc.scale(up, up); cc.translate(half, half); this.miniPaths(cc, sz, l, r, ring, dl, dr, sil); }); sp = C[key] = { L, half, sz }; } catch (e) { return null; }
    return sp;
  },
  jar(c, r, a, n, max, label) {   // a glass jar of allele tokens: the rung-0 chart of p (D4 §4.2)
    const ink = EQV.INK; c.save();
    c.fillStyle = 'rgba(244,238,221,.28)'; rrect(c, r.x, r.y, r.w, r.h, 10); c.fill(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke();
    c.fillStyle = 'rgba(244,238,221,.5)'; c.fillRect(r.x + 6, r.y - 5, r.w - 12, 6); c.strokeRect(r.x + 6, r.y - 5, r.w - 12, 6);
    const tr = EQV.tok(r, max), cols = Math.max(1, Math.floor((r.w - 8) / (2 * tr + 1.5)));
    for (let k = 0; k < Math.min(n, max); k++) { const cx = r.x + 4 + tr + (k % cols) * (2 * tr + 1.5), cy = r.y + r.h - 4 - tr - Math.floor(k / cols) * (2 * tr + 1.5); Pal.token(c, cx, cy, tr, a, { letter: tr >= 7 ? undefined : '', lw: 1 }); }
    c.restore();
    this.lbl('eq-jar' + a, label + ' ' + n, r.x + r.w / 2, r.y + r.h + 12, { size: 13 });
  },
  jarSlot(r, a, k, max) { const tr = EQV.tok(r, max), cols = Math.max(1, Math.floor((r.w - 8) / (2 * tr + 1.5))); return [r.x + 4 + tr + (k % cols) * (2 * tr + 1.5), r.y + r.h - 4 - tr - Math.floor(k / cols) * (2 * tr + 1.5), tr]; },

  /* ---------- L0: the beach and the jars ---------- */
  draw0(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels, sz = this.sz0(), J = this.jarRect();
    this.bg(c, W, H, 'sand0', (cc, w, h) => this.sand(cc, w, h, 11));
    const lapse = s.phase === 'lapse' || s.phase === 'done0';
    s.bs.forEach((b, i) => {
      const p = this.pos0(i), op = v.open[i], k = op != null ? EQV.clamp((v.t - op) / 0.22, 0, 1) : 1, sc = op != null ? 1 + 0.3 * (1 - k) : 1, pl = lapse ? 1 + 0.12 * v.pulse : 1;
      const a = EQ_LV[0].alleles(b);
      if (b.tag) { c.save(); c.beginPath(); c.arc(p[0], p[1], sz * 0.62 * sc, 0, 6.283); c.lineWidth = 3; c.strokeStyle = 'rgba(244,238,221,.75)'; c.stroke(); c.restore(); }
      this.beetle(c, p[0], p[1], sz * sc * pl, a, !!b.tag, { rot: p[2], id: i });
      if (v.focusOn && !b.tag) { const open = s.bs.map((q, j) => q.tag ? -1 : j).filter(j => j >= 0); if (open[v.focus % open.length] === i) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 2.5; c.strokeStyle = EQV.INK; c.strokeRect(p[0] - sz * 0.7, p[1] - sz * 0.7, sz * 1.4, sz * 1.4); c.restore(); } }
    });
    // during the lapse the pill and the jars show all 20,000 (copies scaled to 80 tokens); the forty here are a fresh sample each generation
    const blue = s.bs.filter(b => b.c < 2).length, pp = EQ.p(s.big), jarN = lapse ? [Math.round(80 * pp), 80 - Math.round(80 * pp)] : v.jarShown;
    this.lbl('eq-looks', lapse ? Txt.f(L.popBlue, { x: EQ.pct(s.blue[s.blue.length - 1]) }) : Math.round(100 * blue / s.bs.length) + '% look blue', 16, this.area().y + 16, { align: 'left', size: 13 });
    if (lapse) this.lbl('eq-gen', 'gen ' + (s.blue.length - 1), Stage.w - 16, this.area().y + 16, { align: 'right', size: 13, mono: true });
    this.jar(c, J.a, 0, jarN[0], 80, L.jarA); this.jar(c, J.b, 1, jarN[1], 80, L.jara);
    if (s.open >= 0) {   // the open beetle's copies, waiting to be sorted; the jars pulse
      const pu = 0.5 + 0.5 * Det.sin(v.t * 6); c.save(); c.setLineDash([6, 4]); c.lineWidth = 2 + pu; c.strokeStyle = EQV.INK;
      for (const r of [J.a, J.b]) { rrect(c, r.x - 4, r.y - 4, r.w + 8, r.h + 8, 12); c.stroke(); } c.restore();
      s.left.forEach((a, k) => {
        let t = this.tokPos(k); if (v.tok && v.tok.k === k) t = [v.tok.x, v.tok.y];
        const bo = v.bounce && v.t - v.bounce.t < 0.4 && v.bounce.c === a ? 6 * Det.sin((v.t - v.bounce.t) * 50) * (1 - (v.t - v.bounce.t) / 0.4) : 0;
        c.save(); c.beginPath(); c.arc(t[0] + bo, t[1], 14, 0, 6.283); c.fillStyle = 'rgba(244,238,221,.85)'; c.fill(); c.restore();
        Pal.token(c, t[0] + bo, t[1], 11, a, { lw: 1.5 });
      });
    }
  },
  jarFromBeetles() { const out = [0, 0]; for (const b of this.sim.s.bs) { const a = EQ_LV[0].alleles(b); out[a[0]]++; out[a[1]]++; } return out; },
  juice0(e, F, snd) {
    const s = this.sim.s, v = this.v, J = this.jarRect(), sz = this.sz0();
    if (e.k === 'tag') {
      const p = this.pos0(e.i); v.open[e.i] = v.t; const delay = e.auto && s.phase === 'reveal' ? 0.02 * (e.i % 40) : e.auto ? 0.03 * (e.i % 40) : 0.12;
      if (F && !e.auto) { Fx.ring(p[0], p[1], sz * 0.8); Fx.burst('scale', p[0], p[1], 5); snd('scale', p[0], p[1]); if (s.manual === 1) this.whisper('copies'); else if (s.bs[e.i].c === 1 && !v.saidDom) { v.saidDom = 1; this.whisper('dominant'); } if (s.manual === 8) this.whisper('skittish'); }
      e.a.forEach((a, j) => {
        const k = v.jarShown[a] + v.fly.filter(f => f.jar === a).length, slot = this.jarSlot(a ? J.b : J.a, a, k, 80);
        this.fly({ a, jar: a, x0: p[0] + (j ? 0.18 : -0.18) * sz, y0: p[1] + 0.07 * sz, x1: slot[0], y1: slot[1], r: Math.max(6, slot[2] + 2), d: 0.5, delay: delay + j * 0.06, lift: 40,
          land: () => { v.jarShown[a]++; if (F && !e.auto) { Fx.pop('+1', slot[0], slot[1] - 14, 0); } if (!e.auto && typeof Snd !== 'undefined' && Snd.click) Snd.click(); } });
      });
      return;
    }
    if (e.k === 'open') { const p = this.pos0(e.i); v.open[e.i] = v.t; if (F) { Fx.ring(p[0], p[1], sz * 0.8); Fx.burst('scale', p[0], p[1], 5); } snd('scale', p[0], p[1]); if (s.sorted === 0) this.whisper('copies'); return; }
    if (e.k === 'bounce') { v.bounce = { t: v.t, c: e.c }; snd('tock'); this.whisper('jar', { a: e.c ? this.content.labels.amberA : this.content.labels.blueA }); return; }
    if (e.k === 'sort') {   // one copy flies from above the beetle into its jar
      const p = this.pos0(e.i), sz0 = this.sz0(), from = v.tokDrop || [p[0] + (e.two ? (e.idx ? 0.5 : -0.5) : 0) * sz0, p[1] - 0.95 * sz0], k = v.jarShown[e.a] + v.fly.filter(f => f.jar === e.a).length, slot = this.jarSlot(e.a ? J.b : J.a, e.a, k, 80);
      this.fly({ a: e.a, jar: e.a, x0: from[0], y0: from[1], x1: slot[0], y1: slot[1], r: Math.max(6, slot[2] + 2), d: 0.4, lift: 30, land: () => { v.jarShown[e.a]++; if (F) Fx.pop('+1', slot[0], slot[1] - 14, 0); if (typeof Snd !== 'undefined' && Snd.click) Snd.click(); } });
      return;
    }
    if (e.k === 'sorted') { if (s.bs[e.i].c === 1 && !v.saidDom) { v.saidDom = 1; this.whisper('dominant'); } if (s.manual === 8) this.whisper('skittish'); return; }
    if (e.k === 'revealAll') { if (F) { Fx.tier(2, () => {}); Fx.flash({ edge: true }); } snd('count'); return; }
    if (e.k === 'gen') { v.pulse = 1; if (F && e.g % 5 === 0) Fx.tier(1, () => {}); if (e.g % 10 === 0) snd('tick'); return; }
    if (e.k === 'lapsed') { if (F) Fx.tier(2, () => {}); snd('dusk'); if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.captions.live0, { n: s.manual, a: s.jar[0], b: s.jar[1] })); }
  },

  /* ---------- the lab: hoppers, the tumbling drum, the crank ---------- */
  hopper(c, r, p, label, k) {
    const ink = EQV.INK; c.save();
    c.beginPath(); c.moveTo(r.x, r.y); c.lineTo(r.x + r.w, r.y); c.lineTo(r.x + r.w * 0.62, r.y + r.h); c.lineTo(r.x + r.w * 0.38, r.y + r.h); c.closePath();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.fill(); c.save(); c.clip();
    const tr = Math.max(4, Math.round(r.w / 11)), rows = Math.ceil(r.h / (2 * tr)), rnd = EQV.rng(k * 31 + 5);
    for (let j = 0; j < rows; j++) for (let i = 0; i < 6; i++) { const x = r.x + tr + i * (r.w - 2 * tr) / 5 + (j % 2 ? tr * 0.5 : 0), y = r.y + r.h - tr - j * tr * 1.7; Pal.token(c, x, y, tr, rnd() < p ? 0 : 1, { letter: '', lw: 1 }); }
    c.restore(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke(); c.restore();
    this.lbl('eq-hop' + k, label, r.x + r.w / 2, r.y - 12, { size: 13 });
    this.lbl('eq-hp' + k, 'p ' + p.toFixed(2), r.x + r.w / 2, r.y + r.h + 13, { size: 12, mono: true });
  },
  drum(c, d, mode) {
    const v = this.v, ink = EQV.INK, a = v.drum; c.save();
    c.beginPath(); c.arc(d.cx, d.cy, d.r, 0, 6.283); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill(); c.lineWidth = 3; c.strokeStyle = ink; c.stroke();
    c.save(); c.beginPath(); c.arc(d.cx, d.cy, d.r - 2, 0, 6.283); c.clip();
    for (let k = 0; k < 10; k++) { const ang = a * (0.6 + 0.07 * k) + k * 0.63, rr = d.r * (0.35 + 0.45 * EQV.hash(k, 9)); Pal.token(c, d.cx + rr * Det.cos(ang), d.cy + rr * Det.sin(ang) * 0.9, Math.max(4, d.r * 0.11), k % 3 === 0 ? 0 : 1, { letter: '', lw: 1 }); }
    c.restore();
    const walls = mode === 'fam' ? 12 : mode === 'like' ? 2 : 4; c.lineWidth = mode === 'mix' ? 1.5 : 2.5; c.strokeStyle = mode === 'mix' ? 'rgba(27,22,18,.45)' : ink;
    for (let k = 0; k < walls; k++) { const ang = a * 0.5 + k * 6.283 / walls; c.beginPath(); c.moveTo(d.cx, d.cy); c.lineTo(d.cx + d.r * Det.cos(ang), d.cy + d.r * Det.sin(ang)); c.stroke(); }
    c.beginPath(); c.arc(d.cx, d.cy, 5, 0, 6.283); c.fillStyle = ink; c.fill();
    c.fillStyle = '#8C7A63'; c.beginPath(); c.moveTo(d.cx - 12, d.cy + d.r - 2); c.lineTo(d.cx + 12, d.cy + d.r - 2); c.lineTo(d.cx + 6, d.cy + d.r + 14); c.lineTo(d.cx - 6, d.cy + d.r + 14); c.closePath(); c.fill(); c.lineWidth = 1.5; c.strokeStyle = ink; c.stroke();
    const kb = this.knob(); c.lineWidth = 5; c.lineCap = 'round'; c.strokeStyle = ink; c.beginPath(); c.moveTo(d.cx, d.cy); c.lineTo(kb[0], kb[1]); c.stroke(); c.lineWidth = 3; c.strokeStyle = '#B9A27A'; c.stroke();
    c.beginPath(); c.arc(kb[0], kb[1], 12, 0, 6.283); c.fillStyle = '#E8DFC9'; c.fill(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke();
    if (this.crankable() && !this.sim.s.spin) { c.beginPath(); c.arc(kb[0], kb[1], 18 + 3 * Det.sin(v.t * 5), 0, 6.283); c.lineWidth = 1.5; c.strokeStyle = 'rgba(27,22,18,.5)'; c.stroke(); }
    c.restore();
  },
  chute(d) { return [d.cx, d.cy + d.r + 14]; },
  // L1 square: cells sized by p; a cached layer of zygote dots
  cellRect(e, sp) { const q = this.sqGeo(), p = this.sim.s.p, S = q.S; return { x: q.x + (e ? p * S : 0), y: q.y + (sp ? p * S : 0), w: (e ? 1 - p : p) * S, h: (sp ? 1 - p : p) * S }; },
  dotAt(i, code) { const r = this.cellRect(code >> 1, code & 1), pad = 4; return [r.x + pad + EQV.hash(i, 21) * Math.max(1, r.w - 2 * pad), r.y + pad + EQV.hash(i, 22) * Math.max(1, r.h - 2 * pad)]; },
  draw1(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels, d = this.drumGeo(), hp = this.hoppers(), q = this.sqGeo(), S = q.S, p = s.p;
    this.bg(c, W, H, 'lab', (cc, w, h) => this.labPlate(cc, w, h));
    this.hopper(c, hp.a, p, L.eggs, 1); this.hopper(c, hp.b, p, L.sperm, 2); this.drum(c, d, 'mix');
    const col = v.col, tint = (g, a) => g === 0 ? EQV.rgba(EQV.pal('A', '#6B97FF'), a) : g === 2 ? EQV.rgba(EQV.pal('a', '#F2C94C'), a) : null;
    const B = this.barGeo1(), sh = this.shares1(), bars = this.barRects(B, sh);
    for (const code of [0, 1, 2, 3]) {
      const r = this.cellRect(code >> 1, code & 1), g = code === 0 ? 0 : code === 3 ? 2 : 1, tgt = g === 0 ? bars[0] : g === 2 ? bars[2] : (code === 1 ? { x: bars[1].x, y: bars[1].y + bars[1].h / 2, w: bars[1].w, h: bars[1].h / 2 } : { x: bars[1].x, y: bars[1].y, w: bars[1].w, h: bars[1].h / 2 });
      const k = EQV.easeIO(col), x = EQV.lerp(r.x, tgt.x, k), y = EQV.lerp(r.y, tgt.y, k), w = EQV.lerp(r.w, tgt.w, k), h = EQV.lerp(r.h, tgt.h, k);
      if (g === 1) { c.fillStyle = EQV.rgba(EQV.pal('A', '#6B97FF'), 0.16 + 0.5 * col); c.fillRect(x, y, w / 2, h); c.fillStyle = EQV.rgba(EQV.pal('a', '#F2C94C'), 0.2 + 0.5 * col); c.fillRect(x + w / 2, y, w / 2, h); }
      else { c.fillStyle = tint(g, 0.18 + 0.5 * col); c.fillRect(x, y, w, h); }
      c.lineWidth = 1.5; c.strokeStyle = EQV.INK; c.strokeRect(x, y, w, h);
    }
    if (col < 0.6) {
      const key = S + '|' + q.x + '|' + q.y + '|' + p;
      if (!v.sq || v.sqKey !== key) { v.sqKey = key; v.landed = Math.min(v.landed, s.pairs.length); v.sq = typeof Layer !== 'undefined' ? Layer(Stage.w, Stage.h) : null; v.sqN = 0; }
      if (v.sq) { while (v.sqN < v.landed) { const i = v.sqN, pt = this.dotAt(i, s.pairs[i]), code = s.pairs[i]; Pal.genotype(v.sq.c, pt[0], pt[1], S > 220 ? 4 : 3.2, code >> 1, code & 1, { letter: '' }); v.sqN++; } c.save(); c.globalAlpha = 1 - col / 0.6; v.sq.blit(c, 0, 0); c.restore(); }
      this.lbl('eq-eA', 'egg A', q.x + p * S / 2, q.y - 12, { size: 12, pill: false, ink: EQV.INK }); this.lbl('eq-ea', 'egg a', q.x + p * S + (1 - p) * S / 2, q.y - 12, { size: 12, pill: false, ink: EQV.INK });
      this.lbl('eq-sA', 'sperm A', q.x - 8, q.y + p * S / 2, { size: 12, align: 'right', pill: false, ink: EQV.INK }); this.lbl('eq-sa', 'sperm a', q.x - 8, q.y + p * S + (1 - p) * S / 2, { size: 12, align: 'right', pill: false, ink: EQV.INK });
    }
    this.bars(c, B, sh, s.asks.indexOf('het') >= 0 && !s.ask ? EQ.hw(p) : null, 'b1');
    if (col > 0.85) { const r = bars[1]; c.save(); c.lineWidth = 2; c.strokeStyle = EQV.INK; c.beginPath(); c.moveTo(r.x - 4, r.y + r.h / 2); c.lineTo(r.x + r.w + 4, r.y + r.h / 2); c.stroke(); c.restore(); this.lbl('eq-x2', this.content.labels.twice, r.x + r.w + 22, r.y + r.h / 2, { size: 15, weight: 700 }); }   // the two Aa tiles stacked: the 2 in 2pq
  },
  shares1() { const s = this.sim.s, n = this.v.landed || 0; if (!n) return [0, 0, 0]; const c = [0, 0, 0]; for (let i = 0; i < n && i < s.pairs.length; i++) { const k = s.pairs[i]; c[k === 0 ? 0 : k === 3 ? 2 : 1]++; } return [c[0] / n, c[1] / n, c[2] / n]; },
  barRects(B, sh) { const bw = Math.min(46, B.w / 5), out = []; for (let g = 0; g < 3; g++) { const x = B.x + B.w * (g + 0.5) / 3 - bw / 2, h = Math.max(1, sh[g] * (B.h - 16) / 0.6); out.push({ x, y: B.y + B.h - 16 - Math.min(B.h - 16, h), w: bw, h: Math.min(B.h - 16, h) }); } return out; },
  bars(c, B, sh, exp, id) {   // three genotype bars in the scene (rung 1): realised solid, expected dashed
    const R0 = this.barRects(B, sh), ink = EQV.INK, base = B.y + B.h - 16, names = ['AA', 'Aa', 'aa'];
    c.save(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.4)'; c.beginPath(); c.moveTo(B.x, base + 0.5); c.lineTo(B.x + B.w, base + 0.5); c.stroke();
    R0.forEach((r, g) => {
      if (r.h > 0.5) { if (g === 1) { c.fillStyle = EQV.pal('A', '#6B97FF'); c.fillRect(r.x, r.y, r.w / 2, r.h); c.fillStyle = EQV.pal('a', '#F2C94C'); c.fillRect(r.x + r.w / 2, r.y, r.w / 2, r.h); } else { c.fillStyle = g ? EQV.pal('a', '#F2C94C') : EQV.pal('A', '#6B97FF'); c.fillRect(r.x, r.y, r.w, r.h); } c.lineWidth = 1.5; c.strokeStyle = ink; c.strokeRect(r.x, r.y, r.w, r.h); }
      if (exp) { const ey = base - Math.min(B.h - 16, exp[g] * (B.h - 16) / 0.6); c.setLineDash([5, 3]); c.lineWidth = 2; c.strokeStyle = ink; c.beginPath(); c.moveTo(r.x - 8, ey); c.lineTo(r.x + r.w + 8, ey); c.stroke(); c.setLineDash([]); }
      this.lbl('eq-' + id + g, names[g], r.x + r.w / 2, base + 9, { size: 12, pill: false, ink });
      if (sh[g] > 0) this.lbl('eq-' + id + 'v' + g, Math.round(sh[g] * 100) + '%', r.x + r.w / 2, r.y - 10, { size: 12, mono: true });
    });
    c.restore();
  },
  juiceLab(e, F, snd) {
    const s = this.sim.s, v = this.v, d = this.drumGeo(), hp = this.hoppers(), ch = this.chute(d);
    if (e.k === 'pair' || e.k === 'young') {
      const busy = v.fly.length > 18, quick = s.spin && (this.level === 1 ? s.phase === 'spin' : true);
      if (!quick && !busy) { this.fly({ a: e.e, x0: hp.a.x + hp.a.w / 2, y0: hp.a.y + hp.a.h, x1: d.cx - 4, y1: d.cy, d: 0.22, lift: 14, r: 7 }); this.fly({ a: e.sp, x0: hp.b.x + hp.b.w / 2, y0: hp.b.y + hp.b.h, x1: d.cx + 4, y1: d.cy, d: 0.22, lift: 14, r: 7 }); }
      if (this.level === 1) {
        const i = e.n - 1, pt = this.dotAt(i, e.e * 2 + e.sp);
        if (busy && quick) { v.landed = Math.max(v.landed, e.n); return; }
        this.fly({ geno: [e.e, e.sp], x0: ch[0], y0: ch[1], x1: pt[0], y1: pt[1], d: quick ? 0.22 : 0.3, delay: quick ? 0 : 0.22, lift: 10, r: quick ? 5 : 8, land: () => { v.landed = Math.max(v.landed, i + 1); if (!quick && F) { Fx.ring(pt[0], pt[1], 8); if (typeof Snd !== 'undefined' && Snd.click) Snd.click(); } } });
        if (!quick && F) Fx.burst('egg', ch[0], ch[1], 3);
        if (e.n === 1) this.whisper('square');
      } else {
        this.youngList(); this.v.yl[e.n - 1] = [e.e, e.sp];
        const T = this.trayGeo(), slot = this.traySlot(T, e.n - 1);
        this.fly({ geno: [e.e, e.sp], x0: ch[0], y0: ch[1], x1: slot[0], y1: slot[1], d: quick ? 0.2 : 0.3, delay: quick ? 0 : 0.2, lift: 10, r: slot[2], land: () => { v.kids = Math.max(v.kids || 0, e.n); } });
        if (!quick && F) Fx.burst('egg', ch[0], ch[1], 3);
      }
      return;
    }
    if (e.k === 'collapse') { if (F) { Fx.tier(2, () => {}); } snd('sieve'); return; }
    if (e.k === 'setp') { v.landed = 0; v.sq = null; v.sqN = 0; const hp = this.hoppers(); if (F) { Fx.ring(hp.a.x + hp.a.w / 2, hp.a.y + hp.a.h / 2, 26); Fx.ring(hp.b.x + hp.b.w / 2, hp.b.y + hp.b.h / 2, 26); } snd('tock'); return; }
    if (e.k === 'cycle') { const q = this.penSlots()[e.i]; if (q && F) Fx.ring(q.x, q.y, q.sz * 0.6); snd('tock'); return; }
    if (e.k === 'built') { if (F) Fx.tier(1, () => {}); return; }
    if (e.k === 'landed') { if (F) { Fx.tier(2, () => {}); const T = this.trayGeo(); Fx.ring(T.x + T.w / 2, T.y + T.h / 2, Math.min(T.w, T.h) / 2); } snd('count'); v.kids = s.ny; if (this.level === 2 && s.round < 3 && typeof Live !== 'undefined') { const f = e.f; Live.say(Txt.f(this.content.captions.live2, { x: EQ.pct(f[0]), y: EQ.pct(f[1]), z: EQ.pct(f[2]) })); } if (this.level === 2 && s.round < 3) this.whisper('pStays'); return; }
  },

  /* ---------- L2: the pen, the hoppers, the tray of young ---------- */
  penGeo() { const A = this.area(); return { x: A.x + 8, y: A.y + 30, w: A.w - 16, h: Math.round(A.h * 0.3) }; },
  trayGeo() { const A = this.area(), d = this.drumGeo(), y = d.cy + d.r + 38; return { x: A.x + 8, y, w: A.w - 16, h: Math.max(60, Math.min(A.h * 0.36, A.y + A.h - y - 6)) }; },
  traySlot(T, k) { const cols = 20, rows = 5, cw = T.w / cols, chh = T.h / rows, r = Math.max(4, Math.min(cw, chh) * 0.38); return [T.x + cw * ((k % cols) + 0.5), T.y + chh * (Math.floor(k / cols) % rows + 0.5), r]; },
  draw2(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels, d = this.drumGeo(), hp = this.hoppers(), P = this.penGeo(), T = this.trayGeo();
    this.bg(c, W, H, 'lab', (cc, w, h) => this.labPlate(cc, w, h));
    c.save(); c.fillStyle = 'rgba(110,90,69,.12)'; rrect(c, P.x, P.y, P.w, P.h, 12); c.fill(); c.lineWidth = 1.5; c.strokeStyle = 'rgba(27,22,18,.5)'; c.stroke();
    c.fillStyle = 'rgba(110,90,69,.08)'; rrect(c, T.x, T.y, T.w, T.h, 12); c.fill(); c.stroke(); c.restore();
    this.lbl('eq-pen', L.parents, P.x + 10, P.y - 12, { align: 'left', size: 13 }); this.lbl('eq-tray', L.young, T.x + 10, T.y - 12, { align: 'left', size: 13 });
    const build = s.phase === 'build';
    this.penSlots().forEach((q, k) => {   // a big pen (the 100 young of the unequal-sexes round) packs split coins, as the tray does
      const a = q.g === 0 ? [0, 0] : q.g === 2 ? [1, 1] : [0, 1];
      if (q.coin) Pal.genotype(c, q.x, q.y, q.sz, a[0], a[1], { letter: '' }); else this.beetle(c, q.x, q.y, q.sz, a, true, { id: k + 100 * s.round, state: 'idle', t: v.t });
      if (build && v.penKeys && v.penFocus === k) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 2.5; c.strokeStyle = EQV.INK; c.strokeRect(q.x - q.sz * 0.6, q.y - q.sz * 0.6, q.sz * 1.2, q.sz * 1.2); c.restore(); }
    });
    if (build) this.lbl('eq-pencount', s.par.join(' / '), P.x + P.w - 10, P.y - 12, { align: 'right', size: 12, mono: true });
    if (s.parF) { c.save(); c.setLineDash([5, 4]); c.lineWidth = 1.5; c.strokeStyle = EQV.INK; c.beginPath(); c.moveTo(P.x + 4, P.y + P.h / 2); c.lineTo(P.x + P.w - 4, P.y + P.h / 2); c.stroke(); c.restore(); this.lbl('eq-fem', L.female, P.x + 8, P.y + P.h * 0.25, { align: 'left', size: 12 }); this.lbl('eq-mal', L.male, P.x + 8, P.y + P.h * 0.75, { align: 'left', size: 12 }); }
    this.hopper(c, hp.a, s.pf, s.parF ? L.female : L.eggs, 1); this.hopper(c, hp.b, s.pm, s.parF ? L.male : L.sperm, 2); this.drum(c, d, 'mix');
    const shown = Math.min(s.ny, v.kids || 0), yl = this.youngList();
    for (let k = 0; k < shown && k < yl.length; k++) { const sl = this.traySlot(T, k), g = yl[k]; Pal.genotype(c, sl[0], sl[1], sl[2], g[0], g[1], { letter: '' }); }
  },
  youngList() {   // the young in birth order, recorded from the sim's events (cleared each round)
    const s = this.sim.s, key = s.round + '|' + s.gen; if (this.v.ylKey !== key) { this.v.ylKey = key; this.v.yl = []; this.v.kids = 0; }
    return this.v.yl;
  },

  /* ---------- L4: the valve, the families, the nursery ---------- */
  draw4(c, W, H) {
    const s = this.sim.s, v = this.v, L = this.content.labels, d = this.drumGeo(), A = this.area();
    this.bg(c, W, H, 'lab', (cc, w, h) => this.labPlate(cc, w, h));
    this.drum(c, d, s.mode);
    for (const m of ['mix', 'fam', 'like']) {   // the valve: three labelled positions; the lever points at the current one
      const p = this.valvePos(m), on = s.mode === m, want = s.phase === 'valve' && s.want === m && !on;
      this.lbl('eq-v' + m, L[m], p[0], p[1], { size: 13, weight: on ? 700 : 500, bg: on ? '#E8DFC9' : 'rgba(244,238,221,.55)', ink: EQV.INK });
      if (on) { c.save(); c.lineWidth = 2.5; c.strokeStyle = EQV.INK; c.beginPath(); c.moveTo(p[0] - 30, p[1] + 13); c.lineTo(p[0] + 30, p[1] + 13); c.stroke(); c.restore(); }
      if (want) { c.save(); c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = EQV.INK; c.strokeRect(p[0] - 44, p[1] - 15, 88, 30); c.restore(); }
    }
    const st = s.hist[s.hist.length - 1], jw = Math.min(70, A.w * 0.16), jh = Math.min(96, d.r * 2), jx = A.x + A.w - 2 * jw - 22, jy = d.cy - jh / 2;   // the jars: copies of the colour gene stay level
    for (const [k, share] of [[0, st.p], [1, 1 - st.p]]) {
      const x = jx + k * (jw + 12); c.save(); c.fillStyle = 'rgba(255,255,255,.4)'; rrect(c, x, jy, jw, jh, 8); c.fill();
      const fh = (jh - 6) * share; c.fillStyle = k ? EQV.pal('a', '#F2C94C') : EQV.pal('A', '#6B97FF'); c.fillRect(x + 3, jy + jh - 3 - fh, jw - 6, fh);
      c.lineWidth = 2; c.strokeStyle = EQV.INK; rrect(c, x, jy, jw, jh, 8); c.stroke(); c.restore();
      this.lbl('eq-j4' + k, (k ? 'a ' : 'A ') + Math.round(share * 100) + '%', x + jw / 2, jy + jh + 12, { size: 12, mono: true });
    }
    const G = this.famGeo(), sz = Math.round(EQV.clamp(Math.min(G.cw / 2.3, G.ch / 2.4), 13, 26)), cp = v.couple;
    for (let i = 0; i < s.fams.length; i++) {
      const R0 = this.famSlot(i), fam = s.fams[i], hot = cp && v.t - cp.t < 0.5 && (cp.fi === i || cp.mi === i);
      c.save(); c.fillStyle = hot ? 'rgba(110,90,69,.32)' : 'rgba(110,90,69,.16)'; rrect(c, R0.x, R0.y, R0.w, R0.h, 8); c.fill(); c.restore();
      fam.forEach((g, k) => {
        const x = R0.x + R0.w * (k % 2 ? 0.72 : 0.28), y = R0.y + R0.h * (k < 2 ? 0.3 : 0.72) + 1.2 * Det.sin(v.t * (1.4 + 0.3 * (k % 3)) + i * 1.7 + k), a = [g[0] > 0.5 ? 0 : 1, g[2] > 0.5 ? 0 : 1];
        this.mini(c, x, y, sz * 1.15, a, true, 0, true);
        const m1 = g[1] > 0.5, m2 = g[3] > 0.5, r = Math.max(3.4, sz * 0.17), hy = y - sz * 0.62;   // the second gene: a pale or dark spot each side of the head
        c.save(); c.beginPath(); c.arc(x - r * 0.9, hy, r, 0, 6.283); c.fillStyle = m1 ? '#F4EEDD' : '#1B1612'; c.fill(); c.lineWidth = 1; c.strokeStyle = EQV.INK; c.stroke();
        c.beginPath(); c.arc(x + r * 0.9, hy, r, 0, 6.283); c.fillStyle = m2 ? '#F4EEDD' : '#1B1612'; c.fill(); c.stroke(); c.restore();
      });
      if (cp && v.t - cp.t < 0.5 && cp.fi === i) { const R1 = this.famSlot(cp.mi), x0 = R0.x + R0.w * 0.28, y0 = R0.y + R0.h * 0.3, x1 = R1.x + R1.w * 0.28, y1 = R1.y + R1.h * 0.72; c.save(); c.lineWidth = 2.5; c.strokeStyle = EQV.INK; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2, Math.min(y0, y1) - 30, x1, y1); c.stroke(); c.restore(); }
    }
    c.save(); c.fillStyle = 'rgba(244,238,221,.7)'; rrect(c, A.x + 4, G.ny, A.w - 8, G.nh - 4, 8); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.35)'; c.stroke(); c.restore();
    const nn = v.nursery.length, cw = (A.w - 16) / 24, hk = v.hatchT >= 0 ? EQV.clamp((v.t - v.hatchT) / 0.6, 0, 1) : 0;
    v.nursery.forEach((kids, i) => kids.forEach((q, k) => {
      const nx = A.x + 8 + cw * (i + 0.5) + (k % 2 ? 3 : -3), ny = G.ny + 12 + Math.floor(k / 2) * 10, R1 = this.famSlot(i), tx = R1.x + R1.w * (k % 2 ? 0.72 : 0.28), ty = R1.y + R1.h * (k < 2 ? 0.3 : 0.72);
      const x = EQV.lerp(nx, tx, EQV.easeIO(hk)), y = EQV.lerp(ny, ty, EQV.easeIO(hk)); Pal.genotype(c, x, y, Math.max(3.5, Math.min(cw * 0.22, 6)), q[0] === 2 ? 1 : 0, q[0] === 0 ? 0 : 1, { letter: '' });
    }));
    if (hk >= 1) { v.nursery = []; v.hatchT = -1; }
    if (!nn) this.lbl('eq-nur', 'eggs', A.x + A.w / 2, G.ny + G.nh / 2 - 2, { size: 12, pill: false, ink: 'rgba(27,22,18,.55)' });
  },
  juice4(e, F, snd) {
    const v = this.v, s = this.sim.s;
    if (e.k === 'couple') { v.couple = { fi: e.fi, mi: e.mi, t: v.t }; if (v.hatchT >= 0) { v.nursery = []; v.hatchT = -1; } v.nursery[e.i] = e.kids; const R0 = this.famSlot(e.fi); if (F && (!s.spin || e.i % 4 === 0)) { Fx.burst('egg', R0.x + R0.w / 2, R0.y + R0.h / 2, 3); } if (!s.spin && typeof Snd !== 'undefined' && Snd.click) Snd.click(); return; }
    if (e.k === 'gen') { v.hatchT = v.t; if (F) Fx.tier(2, () => {}); snd('count'); return; }
    if (e.k === 'valve') { const p = this.valvePos(e.m); if (F) { Fx.ring(p[0], p[1], 26); Fx.burst('dust', p[0], p[1], 4); } snd('tock', p[0], p[1]); this.whisper('valve', { m: this.content.labels[e.m] }); }
  },

  /* ---------- the field levels: L3 census, L5 two demes, L7 case files ---------- */
  fieldBg(c, W, H) {
    const s = this.sim.s, n = this.level, F = this.fieldRect();
    if (n === 3) { this.bg(c, W, H, 'sand3' + s.beach, (cc, w, h) => this.sand(cc, w, h, 31 + s.beach * 7, s.beach ? { top: '#CBB68A', bot: '#B59E70' } : null)); return; }
    if (n === 5) { this.bg(c, W, H, 'demes', (cc, w, h) => this.demesBg(cc, w, h, F)); return; }
    this.bg(c, W, H, 'case', (cc, w, h) => this.caseBg(cc, w, h, F));
  },
  demesBg(c, W, H, F) {   // neutral sand with marram everywhere: no habitat edge, so the split must come from your sampled genotypes
    this.sand(c, W, H, 53, { top: '#D6C59B', bot: '#CDBA8C' });
    this.tufts(c, F, 99, 120);
  },
  tufts(c, F, seed, n) { const rnd = EQV.rng(seed); for (let i = 0; i < n; i++) { const x = F.x + rnd() * F.w, y = F.y + rnd() * F.h; c.strokeStyle = 'rgba(120,104,60,.5)'; c.lineWidth = 1.3; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + k * 3, y - 6, x + k * 5, y - 11); c.stroke(); } } },
  caseBg(c, W, H, F) {   // one island for every case (no picture tells): marram, a channel, a reed edge, a nursery corner and burrows in all
    const rnd = EQV.rng(61);
    this.sand(c, W, H, 61);
    this.tufts(c, F, 63, 70);
    c.fillStyle = EQV.WATER; c.fillRect(0, F.y, 12, F.h); c.fillStyle = 'rgba(96,104,82,.22)'; c.fillRect(F.x + F.w * 0.62, F.y + F.h * 0.7, F.w * 0.38, F.h * 0.3);
    const nx = F.x + F.w * 0.86, ny = F.y + F.h * 0.12; c.fillStyle = 'rgba(244,238,221,.45)'; c.beginPath(); c.ellipse(nx, ny, 30, 18, 0, 0, 6.283); c.fill();
    c.fillStyle = 'rgba(80,62,40,.16)'; for (let k = 0; k < 9; k++) { c.beginPath(); c.ellipse(F.x + (0.1 + 0.8 * rnd()) * F.w, F.y + (0.15 + 0.7 * rnd()) * F.h, 9, 6, 0, 0, 6.283); c.fill(); }
  },
  drawField(c, W, H) {
    const s = this.sim.s, v = this.v, n = this.level, F = this.fieldRect(), f = s.f, sz = this.szF(), L = this.content.labels;
    this.fieldBg(c, W, H);
    const reveal = (s.phase === 'census' || s.phase === 'creveal' || s.phase === 'done7') && v.revealT >= 0, cx = F.x + F.w / 2, cy = F.y + F.h / 2, maxd = EQV.dist(F.w / 2, F.h / 2);
    const looksOnly = n === 7 && !s.cs, mixK = n === 5 && v.mixT >= 0 ? EQV.easeIO((v.t - v.mixT) / 2.2) : 0, N = f.x.length;
    const splitOn = n === 5 && s.splits.length > 0 && s.phase === 'split', sp = splitOn ? s.splits[s.splits.length - 1] : null, geneOn = n === 7 && !!(s.cs && s.cs.tests.gene);
    const one = (cc, i, wob, still) => {   // one crowd beetle; still = drawn into the cached layer (no wobble, no pop)
      let x = F.x + f.x[i] * F.w, y = F.y + f.y[i] * F.h;
      if (mixK > 0) { const j = Math.floor(EQV.hash(i, 41) * N); x = EQV.lerp(x, F.x + f.x[j] * F.w, mixK * 0.5); y = EQV.lerp(y, F.y + f.y[j] * F.h, mixK * 0.5); }
      if (wob) { x += 1.5 * Det.sin(v.t * (0.8 + EQV.hash(i, 7)) + i); y += 1.2 * Det.cos(v.t * (0.7 + EQV.hash(i, 8)) + i * 1.3); }
      const g = f.g[i], a = g === 0 ? [0, 0] : g === 2 ? [1, 1] : (EQV.hash(i, 9) < 0.5 ? [0, 1] : [1, 0]);
      // a beetle shows its genes once sampled (looks only, on the carrier beach); unsampled ones are shapes in the marram,
      // so the scene never gives away what only sampling should tell (L5's demes, L7's causes). The census ripple opens every one.
      let open = !!f.sm[i] && !looksOnly, sil = !f.sm[i]; if (reveal && EQV.dist(x - cx, y - cy) / maxd < (v.t - v.revealT) / 1.4) { open = true; sil = false; }
      if (n === 5 && mixK > 0) { open = true; sil = false; }
      const pop = !still && v.popT[i] != null ? EQV.clamp((v.t - v.popT[i]) / 0.25, 0, 1) : 1, sc = 1 + 0.5 * (1 - pop);
      this.mini(cc, x, y, sz * sc, a, open, (EQV.hash(i, 10) - 0.5) * 2.4, splitOn, sil);
      if (f.sm[i] && looksOnly && !reveal) { cc.save(); cc.beginPath(); cc.arc(x, y, sz * 0.62, 0, 6.283); cc.lineWidth = 2; cc.strokeStyle = 'rgba(244,238,221,.85)'; cc.stroke(); cc.restore(); }
      if (geneOn && f.sm[i]) { const m = f.m[i], r = 2.6; cc.save(); cc.beginPath(); cc.arc(x - r, y - sz * 0.6, r, 0, 6.283); cc.fillStyle = m === 2 ? '#1B1612' : '#F4EEDD'; cc.fill(); cc.lineWidth = 0.8; cc.strokeStyle = EQV.INK; cc.stroke(); cc.beginPath(); cc.arc(x + r, y - sz * 0.6, r, 0, 6.283); cc.fillStyle = m === 0 ? '#F4EEDD' : '#1B1612'; cc.fill(); cc.stroke(); cc.restore(); }
      if (splitOn && f.sm[i]) { const sd = EQ_LV[5].side(sp.pts, f.x[i], f.y[i]); cc.save(); cc.beginPath(); cc.arc(x, y, sz * 0.64, 0, 6.283); cc.lineWidth = 2.5; if (sd) cc.setLineDash([3, 2]); cc.strokeStyle = sd ? EQV.INK : '#F4EEDD'; cc.stroke(); cc.restore(); }
    };
    // A field holds 300–600 beetles. About one in seven shuffles on the spot every frame; the rest sit still in a cached layer,
    // rebuilt only when what they show changes (a sample, a test, a new case). Reveal waves and the L5 mixing run fully live.
    const act = i => EQV.hash(i, 12) < 0.14, live = (mixK > 0 && mixK < 1) || (reveal && v.t - v.revealT < 1.6) || typeof Layer !== 'function';
    if (live) { for (let i = 0; i < N; i++) one(c, i, act(i), false); }
    else {
      let h = 7, hs = 7; for (let i = 0; i < N; i++) { h = (h * 31 + f.g[i] * 3 + (geneOn ? f.m[i] * 7 : 0)) | 0; hs = (hs * 31 + (f.sm[i] ? 1 : 0)) | 0; }
      const key = [Math.round(W), Math.round(H), F.x, F.y, F.w, F.h, sz, N, h, f.x[0], f.y[N - 1], s.phase, looksOnly ? 1 : 0, mixK, reveal ? 1 : 0, splitOn ? s.splits.length : 0, geneOn ? 1 : 0, EQV.pal('A', '#6B97FF'), EQV.pal('a', '#F2C94C'), s.ci, s.beach].join(',');
      let build = v.crowdKey !== key || !v.crowd || !v.crowdSm || v.crowdSm.length !== N;
      if (!build && hs !== v.crowdHs) { let d = 0; for (let i = 0; i < N; i++) if ((f.sm[i] ? 1 : 0) !== v.crowdSm[i]) d++; build = d > 60 || v.t - v.crowdT > 1.2; }   // newly sampled beetles draw live until the next rebuild
      if (build) { v.crowdKey = key; v.crowdHs = hs; v.crowdT = v.t; v.crowdSm = Uint8Array.from(f.sm, x => (x ? 1 : 0)); v.crowd = v.crowd ? v.crowd.resize(W, H) : Layer(W, H); v.crowd.redraw(cc => { for (let i = 0; i < N; i++) if (!act(i)) one(cc, i, false, true); }); }
      v.crowd.blit(c, 0, 0);
      const cs0 = v.crowdSm;
      for (let i = 0; i < N; i++) if (act(i) || (f.sm[i] ? 1 : 0) !== cs0[i] || (v.popT[i] != null && v.t - v.popT[i] < 0.26)) one(c, i, act(i), false);   // popping or changed beetles redraw over their still copy
    }
    if (n === 5) this.drawSplit(c, F);
    if (n === 7) this.drawCase(c, F);
    const Q = this.quadRect(); if (Q && (s.phase === 'sample' || s.phase === 'csample' || s.phase === 'carrier')) this.drawQuad(c, Q);
    if (n === 3 || n === 5 || (n === 7 && s.cs)) this.drawGauge(c);
    if (n === 7) this.drawDays(c);
    if (n === 7 && s.phase === 'csample') this.drawShelf(c);
    if (n === 7 && s.phase === 'dx') this.drawDx(c, F);
  },
  drawQuad(c, Q) {
    const v = this.v, ink = EQV.INK; c.save();
    c.lineWidth = 5; c.strokeStyle = ink; c.strokeRect(Q.x, Q.y, Q.w, Q.h); c.lineWidth = 2.5; c.strokeStyle = '#E8DFC9'; c.strokeRect(Q.x, Q.y, Q.w, Q.h);
    for (const [x, y] of [[Q.x, Q.y], [Q.x + Q.w, Q.y], [Q.x, Q.y + Q.h], [Q.x + Q.w, Q.y + Q.h]]) { c.beginPath(); c.arc(x, y, 5, 0, 6.283); c.fillStyle = '#8C6E4A'; c.fill(); c.lineWidth = 1.5; c.strokeStyle = ink; c.stroke(); }
    if (!Q.parked) { const k = (v.t * 1.6) % 1, y = Q.y + 4 + k * (Q.h - 8); c.strokeStyle = 'rgba(244,238,221,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(Q.x + 4, y); c.lineTo(Q.x + Q.w - 4, y); c.stroke(); }
    c.restore();
    if (Q.parked) this.lbl('eq-drag', this.content.labels.drag, Q.x + Q.w / 2, Q.y - 14, { size: 13 });
  },
  sampleCounts() { const s = this.sim.s; return this.level === 7 ? (s.cs ? s.cs.obs : [0, 0, 0]) : s.obs; },
  drawGauge(c) {   // in the scene (rung 1): your sample's AA, Aa, aa against the dashed expectation, and the χ² needle with the 3.84 line
    const s = this.sim.s, A = this.area(), ob = this.sampleCounts(), n = EQ.n(ob), w = Math.min(160, A.w * 0.42), x = A.x + A.w - w - 6, y = A.y + 4, h = 36, ink = EQV.INK;
    c.save(); c.fillStyle = 'rgba(244,238,221,.82)'; rrect(c, x - 6, y - 2, w + 12, h + 8, 8); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.35)'; c.stroke();
    const f = EQ.frac(ob), e = EQ.hw(EQ.p(ob)), bw = 12;
    for (let g = 0; g < 3; g++) {
      const bx = x + 4 + g * (bw + 6), bh = 26 * f[g] / 0.7, by = y + 30 - bh;
      if (n) { if (g === 1) { c.fillStyle = EQV.pal('A', '#6B97FF'); c.fillRect(bx, by, bw / 2, bh); c.fillStyle = EQV.pal('a', '#F2C94C'); c.fillRect(bx + bw / 2, by, bw / 2, bh); } else { c.fillStyle = g ? EQV.pal('a', '#F2C94C') : EQV.pal('A', '#6B97FF'); c.fillRect(bx, by, bw, bh); } c.lineWidth = 1; c.strokeStyle = ink; c.strokeRect(bx, by, bw, bh); const ey = y + 30 - 26 * e[g] / 0.7; c.setLineDash([3, 2]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx - 3, ey); c.lineTo(bx + bw + 3, ey); c.stroke(); c.setLineDash([]); }
    }
    const gx = x + 64, gw = w - 70, x2 = n ? EQ.chi(ob) : 0, vmax = 15, X = v => gx + Math.min(1, v / vmax) * gw;
    c.fillStyle = 'rgba(27,22,18,.12)'; c.fillRect(gx, y + 18, gw, 10); if (typeof wgHatch === 'function') wgHatch(c, X(3.84), y + 18, gx + gw - X(3.84), 10, 'rgba(27,22,18,.45)', 4);
    c.fillStyle = ink; c.fillRect(gx, y + 18, Math.max(1, X(x2) - gx), 10); c.lineWidth = 2; c.beginPath(); c.moveTo(X(3.84), y + 14); c.lineTo(X(3.84), y + 32); c.stroke();
    c.restore();
    this.lbl('eq-chi', 'χ² ' + x2.toFixed(1), gx + gw / 2, y + 8, { size: 12, pill: false, ink, mono: true });
  },

  /* ---------- L5: the drawn line and each side's test ---------- */
  drawSplit(c, F) {
    const s = this.sim.s, v = this.v, ink = EQV.INK;
    const line = (pts, dash, w) => { if (!pts || pts.length < 2) return; c.save(); c.lineWidth = w + 3; c.strokeStyle = 'rgba(244,238,221,.8)'; c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); c.lineWidth = w; c.strokeStyle = ink; if (dash) c.setLineDash([7, 5]); c.stroke(); c.restore(); };
    if (v.stroke) line(v.stroke, false, 2.5);
    if (v.tapLine && s.phase === 'split') { const p = this.fieldPt(v.tapLine[0], v.tapLine[1]); c.save(); c.beginPath(); c.arc(p[0], p[1], 7, 0, 6.283); c.fillStyle = '#F4EEDD'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = ink; c.stroke(); c.restore(); }
    const sp = s.splits[s.splits.length - 1];
    if (sp && (s.phase === 'split' || s.phase === 'askMix')) {
      const pts = sp.pts.map(p => this.fieldPt(p[0], p[1])); line(pts, true, 2.5);
      const a = pts[0], b = pts[pts.length - 1], nx = b[1] - a[1], ny = -(b[0] - a[0]), l = EQV.dist(nx, ny) || 1, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, o = 46;
      const p1 = [EQV.clamp(mx + nx / l * o, F.x + 50, F.x + F.w - 50), EQV.clamp(my + ny / l * o, F.y + 20, F.y + F.h - 20)], p0 = [EQV.clamp(mx - nx / l * o, F.x + 50, F.x + F.w - 50), EQV.clamp(my - ny / l * o, F.y + 20, F.y + F.h - 20)];
      this.lbl('eq-s1', 'χ² ' + sp.x2[1].toFixed(1), p1[0], p1[1], { size: 13, mono: true, bg: sp.x2[1] < 3.84 ? '#E8DFC9' : '#C9B9A0' });
      this.lbl('eq-s0', 'χ² ' + sp.x2[0].toFixed(1), p0[0], p0[1], { size: 13, mono: true, bg: sp.x2[0] < 3.84 ? '#E8DFC9' : '#C9B9A0' });
    }
    if (s.phase === 'split' && !s.splits.length && !v.stroke && typeof Ghost !== 'undefined' && !v.splitGhost) { v.splitGhost = 1; Ghost.show({ verb: 'draw', key: '1', force: true, at: () => this.fieldPt(0.08, 0.12), to: () => this.fieldPt(0.4, 0.12), until: () => this.sim.s.splits.length > 0 }); }   // the demo draws in a corner, not along the answer
    if ((s.phase === 'mix' || s.phase === 'done5' || s.phase === 'over') && v.mixT >= 0 && v.t > v.mixT) line(EQ_LV[5].line(s).map(p => this.fieldPt(p[0], p[1])), true, 2);   // the hidden edge, shown at last
  },

  /* ---------- L7: days, tests, the diagnosis cards, the closed case ---------- */
  shelfGeo() { const F = this.fieldRect(), w = Math.min(F.w - 16, 460), tw = (w - 18) / 4; return { x: F.x + (F.w - w) / 2, y: F.y + F.h - 66, w, tw, h: 58 }; },
  shelfHit(x, y) { const G = this.shelfGeo(); if (y < G.y || y > G.y + G.h) return null; for (let k = 0; k < 4; k++) { const tx = G.x + k * (G.tw + 6); if (x >= tx && x <= tx + G.tw) return ['area', 'age', 'gene', 'year'][k]; } return null; },
  drawShelf(c) {   // the instrument shelf (D4 Evidence look): icon, two words, a cost chip; bought tiles are pressed, unaffordable ones hollow
    const s = this.sim.s, G = this.shelfGeo(), ink = EQV.INK, K = EQK.L7, nm = { area: 'By area', age: 'By age', gene: 'Gene two', year: 'Next year' };
    ['area', 'age', 'gene', 'year'].forEach((key, k) => {
      const x = G.x + k * (G.tw + 6), bought = !!s.cs.tests[key], can = !bought && s.n >= EQ_LV[7].need(s) && s.days >= K.cost[key];
      c.save(); c.globalAlpha = can || bought ? 1 : 0.55; c.fillStyle = bought ? '#C9B9A0' : 'rgba(244,238,221,.94)'; rrect(c, x, G.y, G.tw, G.h, 9); c.fill(); c.lineWidth = bought ? 3 : 1.5; c.strokeStyle = ink; c.stroke();
      const nar = G.tw < 100, ix = x + (nar ? 12 : 16), iy = G.y + 18; c.lineWidth = 2; c.strokeStyle = ink;
      if (nar) { c.translate(ix, iy); c.scale(0.72, 0.72); c.translate(-ix, -iy); }   // narrow tiles: a smaller icon tucked left so the two words clear it
      if (key === 'area') { c.beginPath(); c.moveTo(ix, iy - 9); c.lineTo(ix, iy + 9); c.stroke(); c.strokeRect(ix - 9, iy - 7, 18, 14); }
      else if (key === 'age') { c.beginPath(); c.arc(ix - 4, iy + 2, 3.5, 0, 6.283); c.stroke(); c.beginPath(); c.arc(ix + 5, iy, 6, 0, 6.283); c.stroke(); }
      else if (key === 'gene') { for (const dx of [-5, 5]) { c.beginPath(); c.arc(ix + dx, iy, 4.5, 0, 6.283); c.fillStyle = dx < 0 ? '#F4EEDD' : ink; c.fill(); c.stroke(); } }
      else { c.strokeRect(ix - 8, iy - 7, 16, 14); c.beginPath(); c.moveTo(ix - 8, iy - 2); c.lineTo(ix + 8, iy - 2); c.stroke(); }
      c.restore();
      this.lbl('eq-sh' + k, nm[key], G.tw < 100 ? x + 11 + G.tw / 2 : x + G.tw / 2 + 8, G.y + 18, { size: 12, pill: false, ink, weight: 700 });
      this.lbl('eq-sc' + k, (k + 1) + ' · ' + K.cost[key] + (K.cost[key] > 1 ? ' days' : ' day'), x + G.tw / 2, G.y + 42, { size: 12, mono: true, bg: bought ? '#E8DFC9' : '#E8DFC9' });
    });
  },
  drawDays(c) {
    const s = this.sim.s, A = this.area(), tot = this.P.days.v, r = 6, x0 = A.x + 8, y = A.y + 14;
    c.save(); for (let k = 0; k < tot; k++) { const x = x0 + k * (2 * r + 3); c.beginPath(); c.arc(x + r, y, r, 0, 6.283); if (k < s.days) { c.fillStyle = '#8C6E4A'; c.fill(); } c.lineWidth = 1.5; c.strokeStyle = EQV.INK; c.stroke(); } c.restore();
    if (s.cs) { this.lbl('eq-case', 'Case ' + (s.ci + 1) + ' / 5', x0, y + 22, { align: 'left', size: 12 }); this.lbl('eq-cen', Txt.f(this.content.labels.census, { n: s.cs.N }), x0, y + 42, { align: 'left', size: 12 }); }   // the census size is a stat, not a picture
  },
  drawCase(c, F) {
    const s = this.sim.s, v = this.v, cs = s.cs, ink = EQV.INK, L = this.content.labels; if (!cs) return;
    const yb = s.phase === 'csample' ? this.shelfGeo().y - 14 : F.y + F.h - 16;   // result tags sit above the instrument shelf while it is out
    if (cs.tests.area) { c.save(); c.setLineDash([6, 4]); c.lineWidth = 2; c.strokeStyle = ink; c.beginPath(); c.moveTo(F.x + F.w / 2, F.y + 6); c.lineTo(F.x + F.w / 2, F.y + F.h - 6); c.stroke(); c.restore(); const ga = cs.tests.area.groups; this.lbl('eq-tw', L.west + ' χ² ' + EQ.chi(ga[0]).toFixed(1), F.x + F.w * 0.25, yb, { size: 12, mono: true }); this.lbl('eq-te', L.east + ' χ² ' + EQ.chi(ga[1]).toFixed(1), F.x + F.w * 0.75, yb, { size: 12, mono: true }); }
    if (cs.tests.year) {   // p by year as a small in-scene sparkline: the flip-book of four censuses
      const ps = cs.tests.year.p, w = 120, h = 40, x0 = F.x + F.w / 2 - w / 2, y0 = F.y + 6;
      c.save(); c.fillStyle = 'rgba(244,238,221,.9)'; rrect(c, x0 - 8, y0 - 4, w + 16, h + 26, 8); c.fill(); c.lineWidth = 1; c.strokeStyle = 'rgba(27,22,18,.4)'; c.stroke();
      c.lineWidth = 2.5; c.strokeStyle = EQV.pal('A', '#6B97FF'); c.beginPath(); ps.forEach((p, k) => { const x = x0 + k * w / 3, y = y0 + h - p * h; if (k) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
      ps.forEach((p, k) => { const x = x0 + k * w / 3, y = y0 + h - p * h; c.beginPath(); c.arc(x, y, 3.5, 0, 6.283); c.fillStyle = EQV.pal('A', '#6B97FF'); c.fill(); c.lineWidth = 1.5; c.strokeStyle = ink; c.stroke(); });
      c.setLineDash([3, 3]); c.lineWidth = 1; c.strokeStyle = ink; c.beginPath(); c.moveTo(x0, y0 + h / 2); c.lineTo(x0 + w, y0 + h / 2); c.stroke(); c.setLineDash([]);
      const m = (ps[0] + ps[1] + ps[2] + ps[3]) / 4, se = 2 * Math.sqrt(Math.max(0.01, m * (1 - m)) / (2 * cs.tests.year.n));   // ±2 SE: how much a still p wobbles in a sample this size
      c.fillStyle = 'rgba(27,22,18,.1)'; c.fillRect(x0, y0 + h - Math.min(1, m + se) * h, w, 2 * se * h); c.restore();
      this.lbl('eq-ty', Txt.f(L.perYear, { n: cs.tests.year.n }), F.x + F.w / 2, y0 + h + 12, { size: 12, pill: false, ink });
    }
    if (cs.tests.age) { const g = cs.tests.age.groups; this.lbl('eq-ta', L.newborn + ' χ² ' + EQ.chi(g[0]).toFixed(1), F.x + 10, yb - 24, { align: 'left', size: 12, mono: true }); this.lbl('eq-tb', L.adult + ' χ² ' + EQ.chi(g[1]).toFixed(1), F.x + 10, yb, { align: 'left', size: 12, mono: true }); }
    if (cs.cause === 'mig' && s.phase === 'closed') { c.save(); const col = EQV.pal('mig', '#7CC4F0'); for (let k = 0; k < 4; k++) { const y = F.y + F.h * (0.2 + 0.2 * k), x = F.x + 30 + ((v.t * 40 + k * 30) % 80); c.lineWidth = 3; c.strokeStyle = col; c.beginPath(); c.moveTo(x - 24, y); c.lineTo(x, y); c.stroke(); c.fillStyle = col; c.beginPath(); c.moveTo(x + 8, y); c.lineTo(x - 2, y - 6); c.lineTo(x - 2, y + 6); c.closePath(); c.fill(); } c.restore(); }
    if (s.phase === 'closed') {   // the hidden cause, drawn: families, the deme line, the nursery, the islet's size, the migrants
      const ca = cs.cause, f = cs.f;
      c.save(); c.setLineDash([5, 4]); c.lineWidth = 2; c.strokeStyle = ink;
      if (ca === 'inb') for (let i = 0; i < 30 && i < f.x.length; i++) { c.beginPath(); c.ellipse(F.x + f.x[i] * F.w, F.y + f.y[i] * F.h, 0.07 * F.w, 0.06 * F.h, 0, 0, 6.283); c.stroke(); }
      if (ca === 'wah') { c.beginPath(); c.moveTo(F.x + F.w / 2, F.y + 4); c.lineTo(F.x + F.w / 2, F.y + F.h - 4); c.stroke(); }
      c.restore();
      if (ca === 'wah') { this.lbl('eq-rw', 'p 0.8', F.x + F.w * 0.25, F.y + F.h * 0.8, { size: 13, mono: true }); this.lbl('eq-re', 'p 0.2', F.x + F.w * 0.75, F.y + F.h * 0.8, { size: 13, mono: true }); }
      if (ca === 'sel') this.lbl('eq-rs', 'newborns fit', F.x + F.w * 0.86, F.y + F.h * 0.12 + 30, { size: 12 });
      if (ca === 'drift') this.lbl('eq-rd', Txt.f(L.census, { n: cs.N }), F.x + F.w / 2, F.y + F.h * 0.72, { size: 13 });
      if (ca === 'drift' || ca === 'mig') this.lbl('eq-rf', 'Fits, yet evolving', F.x + F.w / 2, F.y + F.h * 0.46 + 52, { size: 13, weight: 700 });
      const d = s.dx[s.dx.length - 1], k = EQV.easeOut((v.t - v.closedT) / 0.35), cx = F.x + F.w / 2, cy = F.y + F.h * 0.46;
      c.save(); c.translate(cx, cy); c.rotate(-0.08); c.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); c.globalAlpha = k;
      c.fillStyle = 'rgba(244,238,221,.92)'; rrect(c, -110, -34, 220, 68, 10); c.fill(); c.lineWidth = 3; c.strokeStyle = ink; c.stroke(); c.restore();
      this.causeIcon(c, d.truth, cx - 78, cy, 16);
      this.lbl('eq-cl', EQ_CAUSE_NAME[d.cause], cx + 14, cy - 8, { size: 18, weight: 700, pill: false, ink });
      this.lbl('eq-cl2', d.ok ? 'your call: right' : d.c < 0 ? 'no call' : 'you: ' + EQ_CAUSE_NAME[EQ_CAUSES[d.c]].toLowerCase(), cx + 14, cy + 14, { size: 12, pill: false, ink });
    }
  },
  causeIcon(c, k, x, y, r) {   // D4 force icons: linked rings (non-random mating), split discs (demes), sieve (selection), scattered dots (drift), arrow (migration), empty ring
    const ink = EQV.INK; c.save(); c.lineWidth = 2; c.strokeStyle = ink;
    if (k === 0) { c.beginPath(); c.arc(x - r * 0.35, y, r * 0.55, 0, 6.283); c.stroke(); c.beginPath(); c.arc(x + r * 0.35, y, r * 0.55, 0, 6.283); c.stroke(); }
    else if (k === 1) { c.beginPath(); c.arc(x - r * 0.5, y, r * 0.42, 0, 6.283); c.fillStyle = EQV.pal('A', '#6B97FF'); c.fill(); c.stroke(); c.beginPath(); c.arc(x + r * 0.5, y, r * 0.42, 0, 6.283); c.fillStyle = EQV.pal('a', '#F2C94C'); c.fill(); c.stroke(); }
    else if (k === 2) { c.fillStyle = EQV.pal('sel', '#F46034'); c.beginPath(); c.moveTo(x - r, y - r * 0.7); c.lineTo(x + r, y - r * 0.7); c.lineTo(x, y + r * 0.8); c.closePath(); c.fill(); c.stroke(); }
    else if (k === 3) { c.fillStyle = EQV.pal('drift', '#CF81A2'); for (const [dx, dy] of [[-0.6, -0.4], [0.2, -0.6], [0.6, 0.2], [-0.2, 0.5], [-0.7, 0.4]]) { c.beginPath(); c.arc(x + dx * r, y + dy * r, r * 0.22, 0, 6.283); c.fill(); c.stroke(); } }
    else if (k === 4) { const col = EQV.pal('mig', '#7CC4F0'); c.lineWidth = 4; c.strokeStyle = col; c.beginPath(); c.moveTo(x - r, y); c.lineTo(x + r * 0.4, y); c.stroke(); c.fillStyle = col; c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + r * 0.2, y - r * 0.6); c.lineTo(x + r * 0.2, y + r * 0.6); c.closePath(); c.fill(); c.lineWidth = 1.5; c.strokeStyle = ink; c.stroke(); }
    else { c.beginPath(); c.arc(x, y, r * 0.7, 0, 6.283); c.stroke(); }
    c.restore();
  },
  drawDx(c, F) {
    const v = this.v, G = this.dxGeo(), ink = EQV.INK;
    c.save(); c.fillStyle = 'rgba(27,22,18,.45)'; c.fillRect(F.x, F.y, F.w, F.h); c.restore();
    for (let k = 0; k < 6; k++) {
      const x = G.x + (k % 2) * (G.cw + 12), y = G.y + Math.floor(k / 2) * (G.ch + 8), sel = v.dxSel === k;
      c.save(); c.fillStyle = sel ? '#F4EEDD' : 'rgba(232,223,201,.94)'; rrect(c, x, y, G.cw, G.ch, 10); c.fill(); c.lineWidth = sel ? 3 : 1.5; c.strokeStyle = ink; c.stroke(); c.restore();
      this.causeIcon(c, k, x + 26, y + G.ch / 2, Math.min(14, G.ch * 0.28));
      this.lbl('eq-dx' + k, (k + 1) + ' ' + EQ_CAUSE_NAME[EQ_CAUSES[k]], x + 50, y + G.ch / 2, { align: 'left', size: 14, pill: false, ink, weight: sel ? 700 : 600 });
    }
    const pw = Math.min(64, (G.w - 16) / 5), x0 = G.x + (G.w - 5 * pw) / 2;
    this.lbl('eq-dxc', v.dxSel >= 0 ? 'How sure?' : 'Pick a cause', G.x + G.w / 2, G.py - 14, { size: 13 });
    for (let k = 0; k < 5; k++) {
      const conf = 0.5 + 0.1 * k, x = x0 + k * pw, on = v.dxSel >= 0, cur = Math.abs(conf - v.dxConf) < 0.01;
      c.save(); c.globalAlpha = on ? 1 : 0.45; c.fillStyle = cur ? '#F4EEDD' : 'rgba(232,223,201,.94)'; rrect(c, x, G.py, pw - 6, 44, 8); c.fill(); c.lineWidth = cur ? 3 : 1.5; c.strokeStyle = ink; c.stroke(); c.restore();
      this.lbl('eq-dxp' + k, Math.round(conf * 100) + '%', x + (pw - 6) / 2, G.py + 22, { size: 13, pill: false, ink, mono: true });
    }
  },
  juiceField(e, F, snd) {
    const s = this.sim.s, v = this.v, f = s.f, Fr = this.fieldRect(), sz = this.szF();
    if (e.k === 'samp') {
      v.popT[e.i] = v.t; const x = Fr.x + f.x[e.i] * Fr.w, y = Fr.y + f.y[e.i] * Fr.h;
      if (F && (e.n % 3 === 0 || !s.spin)) Fx.burst('dust', x, y, 2);
      if (!e.looks && v.fly.length < 14) { const A = this.area(), w = Math.min(160, A.w * 0.42), gx = A.x + A.w - w - 6 + 4 + e.g * 18 + 6, gy = A.y + 20; const a = e.g === 0 ? 0 : e.g === 2 ? 1 : null; if (a == null) this.fly({ geno: [0, 1], x0: x, y0: y, x1: gx, y1: gy, d: 0.4, r: 5, lift: 24 }); else this.fly({ a, x0: x, y0: y, x1: gx, y1: gy, d: 0.4, r: 5, lift: 24 }); }
      if (e.n % 4 === 0 && typeof Snd !== 'undefined' && Snd.click) Snd.click();
      if (this.level === 3 && e.n === 40 && EQ.chi(s.obs) < 3.84) this.whisper('small');
      return;
    }
    if (e.k === 'census' || e.k === 'creveal') { if (F) { Fx.tier(2, () => {}); Fx.flash({ edge: true }); } snd('count'); if (typeof Live !== 'undefined') Live.say(this.hudText()); return; }
    if (e.k === 'deficit') { if (F) Fx.tier(2, () => {}); snd('sieve'); return; }
    if (e.k === 'split') { if (F) { const r = s.splits[e.i]; Fx.tier(1, () => {}); const p = this.fieldPt(r.pts[0][0], r.pts[0][1]); Fx.ring(p[0], p[1], 20); } snd(e.fit ? 'count' : 'tock'); this.whisper('split'); return; }
    if (e.k === 'mixed') { if (F) Fx.tier(2, () => {}); snd('dusk'); return; }
    if (e.k === 'test') { if (F) Fx.tier(1, () => {}); snd('scale'); if (e.key === 'year' && !v.saidWob) { v.saidWob = 1; this.whisper('wobble'); } return; }
    if (e.k === 'nodays') { this.whisper('days'); if (F) Fx.shake(4, 160); return; }
    if (e.k === 'dxopen') { snd('tock'); return; }
    if (e.k === 'closed') { if (F) { Fx.tier(2, () => {}); if (!e.ok) Fx.shake(4, 160); } snd(e.ok ? 'count' : 'interesting'); if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.captions.live7, { c: s.ci + 1, r: EQ_CAUSE_NAME[e.cause] })); return; }
    if (e.k === 'beach') { v.revealT = -1; this.clearAsk(1); return; }
  },

  /* ---------- L6: the farmyard at night ---------- */
  yardBg(c, W, H) {
    const g = this.yardGeo(), K = EQK.L6, rnd = EQV.rng(5), k = g.k, X = x => g.ox + x * k, Y = y => g.oy + y * k;
    c.fillStyle = '#7A6852'; c.fillRect(0, 0, W, H);   // a dusty yard, light enough for dark rats to read
    for (let i = 0; i < W * H / 120; i++) { const x = rnd() * W, y = rnd() * H; c.strokeStyle = rnd() < 0.5 ? 'rgba(201,178,131,.22)' : 'rgba(20,16,12,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 7, y + (rnd() - 0.5) * 3); c.stroke(); }
    for (const by of K.burrows) for (let j = 0; j < 4; j++) { c.strokeStyle = 'rgba(201,178,131,.08)'; c.lineWidth = 10 * k; c.beginPath(); c.moveTo(X(14), Y(by)); c.quadraticCurveTo(X(180), Y(by + (j - 1.5) * 40), X(K.gx), Y(90 + j * 50)); c.stroke(); }
    c.fillStyle = '#5C5048'; c.fillRect(X(0), 0, 22 * k, H); for (let y = Y(0) - Math.ceil(Y(0) / (18 * k)) * 18 * k; y < H; y += 18 * k) { c.strokeStyle = 'rgba(20,16,12,.4)'; c.lineWidth = 1; c.strokeRect(X(0), y, 22 * k, 18 * k); }
    for (const by of K.burrows) { c.fillStyle = '#120E0B'; c.beginPath(); c.ellipse(X(16), Y(by), 9 * k, 12 * k, 0, 0, 6.283); c.fill(); }
    for (let j = 0; j < 7; j++) { const sx = X(K.gx - 6 + (j % 2) * 10), sy = Y(70 + j * 30); c.fillStyle = '#B9A27A'; c.beginPath(); c.ellipse(sx, sy, 16 * k, 13 * k, 0, 0, 6.283); c.fill(); c.lineWidth = 1.5; c.strokeStyle = EQV.INK; c.stroke(); c.strokeStyle = 'rgba(27,22,18,.4)'; c.beginPath(); c.moveTo(sx - 8 * k, sy - 9 * k); c.lineTo(sx + 8 * k, sy - 9 * k); c.stroke(); }
    const rg = c.createRadialGradient(X(K.W * 0.55), Y(K.H * 0.3), 20, X(K.W * 0.55), Y(K.H * 0.45), Math.max(W, H) * 0.75); rg.addColorStop(0, 'rgba(232,223,201,.1)'); rg.addColorStop(1, 'rgba(0,0,0,.28)'); c.fillStyle = rg; c.fillRect(0, 0, W, H);
  },
  draw6(c, W, H) {
    const s = this.sim.s, v = this.v, g = this.yardGeo(), K = EQK.L6, ink = EQV.INK, L = this.content.labels, k = g.k;
    this.bg(c, W, H, 'yard', (cc, w, h) => this.yardBg(cc, w, h));
    s.trays.forEach((t, i) => {
      const p = this.yardPt(t.x, t.y), r = K.r * k;
      c.save(); c.beginPath(); c.arc(p[0], p[1], r, 0, 6.283); c.fillStyle = 'rgba(232,223,201,.08)'; c.fill(); c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeStyle = 'rgba(232,223,201,.45)'; c.stroke(); c.setLineDash([]);
      c.beginPath(); c.ellipse(p[0], p[1], r * 0.55, r * 0.4, 0, 0, 6.283); c.fillStyle = '#9C9890'; c.fill(); c.lineWidth = 2; c.strokeStyle = ink; c.stroke();
      c.fillStyle = '#5E5A54'; for (let j = 0; j < 7; j++) { c.beginPath(); c.arc(p[0] + (EQV.hash(j, i) - 0.5) * r * 0.7, p[1] + (EQV.hash(j, i + 9) - 0.5) * r * 0.45, Math.max(1.5, r * 0.07), 0, 6.283); c.fill(); }
      c.restore();
    });
    const night = s.phase === 'night', sz = Math.round(EQV.clamp(40 * k, 30, 56)), genes = v.lens === 'genes';
    s.rats.forEach((r, i) => {
      let x, y, rot = 0, sick = r.st === 'sick', show = true;
      if (night && r.st !== 'wait') { if (r.st === 'grain' || r.st === 'home') show = false; x = r.x; y = r.y; const nx = this.ratAhead(r); rot = EQV.atan2(nx[1] - r.y, nx[0] - r.x) + (sick ? 3.14159 : 0); }
      else if (night) { const row = Math.floor(i / 4); if (row >= 6) show = false; x = 32 + (row % 3) * 12; y = K.burrows[r.b] - 8 + Math.floor(row / 3) * 12; }   // a few wait at the burrow mouth; the rest are inside
      else { const b = i % 4, row = Math.floor(i / 4); x = 32 + (row % 3) * 12; y = K.burrows[b] - 8 + Math.floor(row / 3) * 12; if (r.dead || row >= 6) show = false; }
      if (!show) return;
      const p = this.yardPt(x, y), eat = r.st === 'eat';
      const big = night && r.st !== 'wait'; this.rat(c, p[0], p[1] + (eat ? Det.sin(v.t * 30) : 0), big ? sz : sz * 0.62, rot, sick, i, v.t);
      if (genes && (big || i % 2 === 0)) Pal.genotype(c, p[0], p[1] - (big ? sz * 0.55 : sz * 0.4), Math.max(5, big ? sz * 0.2 : sz * 0.14), r.c >= 1 && EQV.hash(i, 3) < 0.5 ? 1 : (r.c === 2 ? 1 : 0), r.c === 0 ? 0 : (r.c === 2 ? 1 : (EQV.hash(i, 3) < 0.5 ? 0 : 1)), { letter: '' });
    });
    const per = {};   // at most three dashed rings at each burrow, then a ×n badge, so a big dawn does not blur into a blob
    for (const gq of v.gone) { const a = 1 - (v.t - gq.t) / 2; if (a <= 0 || v.t < gq.t) continue; const kb = gq.y; per[kb] = (per[kb] || 0) + 1; if (per[kb] > 3) continue; const p = this.yardPt(gq.x + (per[kb] - 1) * 9, gq.y); c.save(); c.globalAlpha = a; c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeStyle = '#F4EEDD'; c.beginPath(); c.arc(p[0], p[1], sz * 0.36, 0, 6.283); c.stroke(); c.restore(); }
    for (const kb in per) if (per[kb] > 3) { const p = this.yardPt(64, +kb); this.lbl('eq-gn' + kb, '×' + per[kb], p[0] + 6, p[1], { size: 12, mono: true }); }
    v.gone = v.gone.filter(gq => v.t - gq.t < 2);
    const q = s.q[s.q.length - 1] || 0, A = this.area(), bw = Math.min(150, A.w * 0.36), bx = A.x + A.w - bw - 8, by = A.y + 8;   // the copies bar of this season's newborns (rung 1)
    c.save(); c.fillStyle = EQV.pal('A', '#6B97FF'); c.fillRect(bx, by, bw * (1 - q), 14); c.fillStyle = EQV.pal('a', '#F2C94C'); c.fillRect(bx + bw * (1 - q), by, bw * q, 14); c.lineWidth = 1.5; c.strokeStyle = '#E8DFC9'; c.strokeRect(bx, by, bw, 14); c.restore();
    this.lbl('eq-q6', 'q ' + q.toFixed(2), bx + bw * (1 - q / 2), by + 28, { size: 12, mono: true });
    this.lbl('eq-se', Txt.f(L.season, { g: Math.min(s.season, K.seasons + K.after + 1) }), A.x + 8, A.y + 14, { align: 'left', size: 12 });
    this.lbl('eq-xn', L.xN, A.x + 90, A.y + 14, { size: 12, mono: true, bg: '#E8DFC9' });   // ×N: one season is one rat generation (the MODEL card says so)
    if (!s.auto) this.lbl('eq-tr', Txt.f(L.baitCost, { n: s.trays.length * K.cost }), A.x + 8, A.y + 34, { align: 'left', size: 12, mono: true });
    if (s.grainT || s.grain || s.baitT) this.lbl('eq-gr', Txt.f(L.lost, { n: s.grainT + s.baitT + (night && !s.auto ? s.grain : 0) }), this.yardPt(K.gx, 40)[0] - 10, this.yardPt(K.gx, 40)[1], { align: 'right', size: 12 });
    if (v.trayGhost && v.trayDrag >= 0) { const p = this.yardPt(v.trayGhost[0], v.trayGhost[1]); c.save(); c.beginPath(); c.arc(p[0], p[1], K.r * k, 0, 6.283); c.setLineDash([3, 3]); c.lineWidth = 2; c.strokeStyle = '#E8DFC9'; c.stroke(); c.restore(); }
  },
  ratAhead(r) { const u = r.st === 'sick' ? Math.max(0, r.u - 0.02) : Math.min(1, r.u + 0.02); return EQ_LV[6].at(r, u); },
  rat(c, x, y, size, rot, sick, i, t) {
    if (typeof Rig !== 'undefined' && Rig.has && Rig.has('eqrat')) { Rig.draw(c, 'eqrat', { sick: sick ? 1 : 0, leg: Math.floor(t * 10 + i) % 2 }, x, y, { size, rot, id: i }); return; }
    c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = sick ? '#9A8E84' : '#6E6056'; c.beginPath(); c.ellipse(0, 0, size * 0.42, size * 0.2, 0, 0, 6.283); c.fill(); c.restore();
  },
  juice6(e, F, snd) {
    const s = this.sim.s, v = this.v;
    if (e.k === 'tray') { const t = s.trays[e.i], p = this.yardPt(t.x, t.y); if (F) { Fx.ring(p[0], p[1], 22); Fx.burst('dust', p[0], p[1], 5); } snd('tock', p[0], p[1]); return; }
    if (e.k === 'full') { this.whisper('trays'); return; }
    if (e.k === 'untray') { const p = this.yardPt(e.x, e.y); if (F) { Fx.ring(p[0], p[1], 18, { dashed: true, ms: 500 }); } snd('tock', p[0], p[1]); return; }
    if (e.k === 'eat') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F) Fx.burst('dust', p[0], p[1], 3); if (typeof Snd !== 'undefined' && Snd.peck) Snd.peck(); return; }
    if (e.k === 'shrug') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F) { Fx.pop(e.c === 2 ? 'aa' : 'Aa', p[0], p[1] - 22, 0); } if (!v.saidShrug) { v.saidShrug = 1; this.whisper('shrug'); } return; }
    if (e.k === 'sick') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F) Fx.ring(p[0], p[1], 16, { dashed: true, ms: 900 }); return; }
    if (e.k === 'grain') { const r = s.rats[e.i], p = this.yardPt(r.x, r.y); if (F && !s.auto) { Fx.pop('−1', p[0] - 14, p[1], -1); } if (!s.auto && !v.saidGrain) { v.saidGrain = 1; this.whisper('grain'); } return; }
    if (e.k === 'dawn') {
      if (F) Fx.tier(2, () => {}); snd('dusk');
      s.rats.forEach((r, i) => { if (!r.dead) return; const b = r.b, x = 30 + (i % 4) * 8, y = EQK.L6.burrows[b]; v.gone.push({ x: r.dead === 1 && r.st === 'home' ? 20 : x, y, t: v.t + (r.dead === 2 ? 0.4 : 0) }); });
      if (s.rats.some(r => r.dead === 2) && !v.saidK) { v.saidK = 1; this.whisper('vitK'); }
      return;
    }
    if (e.k === 'bred') { if (e.g === 5) this.clearAsk(1); if (F) Fx.tier(1, () => {}); if (typeof Live !== 'undefined') Live.say(Txt.f(this.content.captions.live6, { g: e.g, q: e.q.toFixed(2), n: s.grainT + s.baitT })); return; }   // the adult-triangle mark leaves once its season is over
  },

  /* ================= the live strip: notes() feeds LiveGraph (D5 decision 10); realised solid, expected dashed ================= */
  notes() {
    const s = this.sim.s, v = this.v || {}, n = this.level, L = this.content.labels; if (!s) return { stats: [], charts: [] };
    const bars3 = (c, exp, kinds) => { const f = EQ.frac(c), N = EQ.n(c); return (kinds || ['AA', 'Aa', 'aa']).map((k, i) => ({ k, v: N ? f[i] : null, exp: exp ? exp[i] : null })); };
    const small = typeof Strip !== 'undefined' && Strip.phone && Strip.phone() && !Strip.isOpen;   // the folded phone strip: point labels would overlap
    const tri = (pts, trail, noCurve) => ({ type: 'tri', title: 'Genotypes', variant: noCurve ? 'simplex' : 'hw', corners: ['AA', 'Aa', 'aa'], pts: small ? pts.map(q => Object.assign({}, q, { label: '' })) : pts, trail: trail || [], frame: 'designed' });
    const stats = [], ch = [];
    if (n === 0) {
      const jn = (v.jarShown || [0, 0]), tot = jn[0] + jn[1];
      if (s.phase === 'guess' || tot === 0) ch.push({ type: 'eq_axis', title: 'Share of A copies', ends: ['0', '1'], frame: 'designed' });
      else ch.push({ type: 'pq', title: 'Copies in the jars', p: jn[0] / tot, n: tot, you: s.pred.guess != null && (s.phase === 'reveal' || s.phase === 'yule' || s.phase === 'lapse' || s.phase === 'done0' || s.phase === 'over') ? s.pred.guess : null, ghost: s.phase === 'reveal' || s.phase === 'yule' || s.phase === 'lapse' || s.phase === 'done0' || s.phase === 'over' ? s.p : null, frame: 'designed' });
      const gh = s.exp.yule != null ? [{ d: [[0, s.blue[0]], [EQK.L0.gens, s.blue[0]]], label: L.exp }] : [];
      ch.push({ type: 'trace', title: 'Blue beetles', x: { lo: 0, hi: EQK.L0.gens, label: 'generation' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: s.blue.slice(), ink: 'A', label: L.blue }], ghost: gh, frame: 'designed' });
      stats.push(['Copies', 'A ' + s.jar[0] + ', a ' + s.jar[1], 'Each beetle carries two copies.'], ['Blue', EQ.pct(s.blue[s.blue.length - 1]) + '%', 'AA and Aa look blue.']);
    }
    else if (n === 1) {
      const c = [0, 0, 0], nn = Math.min(v.landed || 0, s.pairs.length); for (let i = 0; i < nn; i++) { const k = s.pairs[i]; c[k === 0 ? 0 : k === 3 ? 2 : 1]++; }
      const done = s.exp.het != null, e = EQ.hw(s.p);
      const tall = nn ? Math.max(c[0], c[1], c[2]) / nn : 0;
      ch.push({ type: 'eq_bars', title: 'Genotypes', groups: [{ label: '', bars: bars3(c, done ? e : null) }], y: { lo: 0, hi: Math.min(1, Math.max(0.7, Math.ceil((tall + 0.05) * 10) / 10)), fmt: 'pct' }, frame: 'designed' });
      const tr = []; let a = 0; for (let i = 0; i < nn; i++) { const k = s.pairs[i]; if (k === 1 || k === 2) a++; if (i >= 3 && ((i + 1) % Math.max(1, Math.floor(nn / 60)) === 0 || i === nn - 1)) tr.push([i + 1, a / (i + 1)]); }
      ch.push({ type: 'trace', title: 'Aa share as you crank', x: { lo: 0, hi: s.pairs.length > EQK.L1.small || s.phase === 'col1' || s.phase === 'spin' ? EQK.L1.big : EQK.L1.small, label: 'pairs' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: tr, ink: 'ink', label: 'Aa' }], ghost: done ? [{ d: [[0, e[1]], [EQK.L1.big, e[1]]], label: '2pq' }] : [], frame: 'designed' });
      stats.push(['Pairs', String(s.pairs.length), 'Each pair: one egg and one sperm.'], ['Expected', 'AA ' + EQ.pct(e[0]) + '%, Aa ' + EQ.pct(e[1]) + '%, aa ' + EQ.pct(e[2]) + '%', 'p², 2pq and q².']);
    }
    else if (n === 2) {
      const landed = s.phase === 'land' || s.phase === 'done2' || s.phase === 'over', par = EQ.frac(s.par), pts = [{ f: par, kind: 'dusk', label: landed || s.ask ? '' : L.parents }], yf = EQ.frac(s.young);
      for (const r of s.rec) if (r.round !== s.round || r.gen !== s.gen) pts.push({ f: r.young, kind: 'dawn', label: '' });
      if (s.ny) pts.push({ f: yf, kind: 'dawn', label: landed ? L.young : '' });
      ch.push(tri(pts, s.ny ? [par, yf] : [], !!s.ask || (s.round === 0 && !landed)));   // the curve is the answer: hidden until the young land
      ch.push({ type: 'eq_bars', title: 'Parents and young', groups: [{ label: L.parents, bars: bars3(s.par) }, { label: L.young, bars: bars3(s.young, landed ? EQ.hw(EQ.p(s.young)) : null) }], y: { lo: 0, hi: 1, fmt: 'pct' }, frame: 'designed' });
      stats.push(['Parents', s.par.join(' / '), 'AA / Aa / aa in the pen.'], ['p', EQ.p(s.par).toFixed(2), 'The same in parents and young.']);
    }
    else if (n === 3) {
      const groups = [{ label: 'sample', bars: bars3(s.obs, EQ.n(s.obs) ? EQ.hw(EQ.p(s.obs)) : null) }];
      if (s.full && (s.phase === 'census' || s.phase === 'move' || s.phase === 'done3' || s.phase === 'over')) groups.push({ label: 'census', bars: bars3(s.full.c, EQ.hw(EQ.p(s.full.c))) });
      ch.push({ type: 'eq_bars', title: 'Observed and expected', groups, y: { lo: 0, hi: 0.7, fmt: 'pct' }, frame: 'designed' });
      if (s.phase === 'verdict' || s.phase === 'census' || s.phase === 'move' || s.phase === 'done3' || s.phase === 'over') ch.push({ type: 'eq_axis', title: 'How sure: departs', ends: ['fits HW', 'departs'], frame: 'designed' });
      else { const d = s.chiH.filter((q, i) => i % Math.max(1, Math.floor(s.chiH.length / 80)) === 0 || i === s.chiH.length - 1), mx = d.reduce((m, q) => Math.max(m, q[1]), 0), hi = Math.min(30, Math.max(8, Math.ceil(mx * 1.15))); ch.push({ type: 'trace', title: 'χ² as you sample', x: { lo: 0, hi: EQK.L3.max, label: 'beetles' }, y: { lo: 0, hi, label: '' }, series: [{ d, ink: 'ink', label: 'χ²' }], target: { lo: 3.84, hi }, marks: [40], frame: 'designed' }); }
      stats.push(['Sampled', String(s.n), 'Beetles genotyped on this beach.'], ['Field time', Math.ceil(s.pool) + ' s', 'Left for both beaches.'], ['χ²', EQ.chi(s.obs).toFixed(2), 'Above 3.84: evidence of a departure (5% level).'], ['Shortfall', EQ.pct(EQ.Fhat(s.obs)) + '%', 'Heterozygotes short of 2pq in your sample.']);
    }
    else if (n === 4) {
      const h = s.hist[s.hist.length - 1];
      ch.push({ type: 'pq', title: 'Colour copies', p: h.p, n: 2 * 96, frame: 'designed' });
      ch.push({ type: 'eq_bars', title: 'Two genes', groups: [{ label: L.colour, bars: bars3(h.c, s.ask ? null : EQ.hw(h.p)) }, { label: L.gene2, bars: bars3(h.m, EQ.hw(h.pm), ['BB', 'Bb', 'bb']) }], y: { lo: 0, hi: 0.8, fmt: 'pct' }, frame: 'designed' });   // the colour gene's dashed 2pq waits until you commit
      stats.push(['Generation', String(s.gen), 'Valve: ' + this.content.labels[s.mode] + '.'], ['F', EQ.Fhat(h.c).toFixed(2), 'Colour heterozygotes short of 2pq.'], ['F, gene two', EQ.Fhat(h.m).toFixed(2), 'The unlinked second gene.']);
    }
    else if (n === 5) {
      const asking = !!s.ask, groups = [{ label: 'pooled', bars: bars3(s.obs, EQ.n(s.obs) && !asking ? EQ.hw(EQ.p(s.obs)) : null) }], sp = s.splits[s.splits.length - 1];
      if (s.young && (s.phase === 'mix' || s.phase === 'done5' || s.phase === 'over')) { const pA = EQ_LV[5].pAll(s); groups.push({ label: L.young, bars: bars3(s.young, EQ.hw(pA)) }); }
      else if (asking) groups.push({ label: L.young, bars: [{ k: 'AA', v: null, exp: null }, { k: 'Aa', v: null, exp: null }, { k: 'aa', v: null, exp: null }] });   // a fresh group with no dashes: the young's bar
      else if (sp) for (const k of [0, 1]) groups.push({ label: k ? 'other side' : 'one side', bars: bars3(sp.c[k], EQ.n(sp.c[k]) ? EQ.hw(EQ.p(sp.c[k])) : null) });
      ch.push({ type: 'eq_bars', title: 'Observed and expected', groups, y: { lo: 0, hi: 0.8, fmt: 'pct' }, frame: 'designed' });
      const pts = []; if (EQ.n(s.obs)) pts.push({ f: EQ.frac(s.obs), kind: 'dusk', label: 'pooled' });
      if (sp) for (const k of [0, 1]) if (EQ.n(sp.c[k])) pts.push({ f: EQ.frac(sp.c[k]), kind: 'dawn', label: '' });
      if (s.young && groups.length > 1 && groups[1].label === L.young) pts.push({ f: EQ.frac(s.young), kind: 'dawn', label: L.young });
      ch.push(tri(pts));
      stats.push(['Sampled', String(s.n), 'Beetles genotyped.'], ['χ² pooled', EQ.chi(s.obs).toFixed(2), 'Above 3.84: evidence of a departure (5% level).']);
      if (sp) stats.push(['χ² each side', sp.x2[0].toFixed(2) + ' and ' + sp.x2[1].toFixed(2), 'Your split, ' + Math.round(sp.acc * 100) + '% on the right side.']);
    }
    else if (n === 6) {
      const K6 = EQK.L6, gh = []; if (s.exp.qhat != null) { const st = K6.askAt, m = EQ_LV[6].meanS1(s, st - 1), d = [[st, s.q[st - 1]]]; let q = s.q[st - 1]; for (let k = st + 1; k <= K6.seasons + 1; k++) { q = EQ.sel(q, m, s.s2); d.push([k, q]); } gh.push({ d, label: L.exp }); gh.push({ d: [[st, s.exp.qhat], [K6.seasons + 1, s.exp.qhat]], label: L.qhat }); }
      if (s.exp.wd != null) { const st = EQK.L6.seasons + 1, d = [[st, s.q[st - 1]]]; let q = s.q[st - 1]; for (let k = st + 1; k <= st + EQK.L6.after; k++) { q = EQ.sel(q, 0, s.s2); d.push([k, q]); } gh.push({ d, label: '' }); }
      ch.push({ type: 'trace', title: 'Resistant share q', x: { lo: 1, hi: EQK.L6.seasons + EQK.L6.after + 1, label: 'season' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: s.q.slice(), ink: 'a', label: 'q' }], ghost: gh, marks: [EQK.L6.seasons + 0.5], frame: 'designed' });
      const R0 = s.rec, nb = EQ.frac(this.sim.H().counts(s.rats)), pts = [];
      if (R0 && (s.phase === 'dawn' || s.phase === 'askAdult')) { pts.push({ f: EQ.frac(R0.nb), kind: 'dawn', label: L.newborn }); if (s.phase === 'dawn') pts.push({ f: EQ.frac(R0.ad), kind: 'dusk', label: L.adult }); }
      else pts.push({ f: nb, kind: 'dawn', label: L.newborn });
      ch.push(tri(pts, s.hist.map(h => EQ.frac(h.ad))));
      stats.push(['Season', String(s.season), 'One rat generation (×N: real spread took years).'], ['q', (s.q[s.q.length - 1] || 0).toFixed(2), 'Share of resistant a copies in newborns.'], ['Grain lost', String(s.grainT + s.baitT), 'Rats at the sacks ' + s.grainT + ', bait ' + s.baitT + '.']);
      if (R0) stats.push(['Bait reach', EQ.pct(R0.s1) + '%', 'Susceptible AA rats that ate bait (s₁).']);
    }
    else {
      if (s.cs) {
        const cs = s.cs, groups = [{ label: 'sample', bars: bars3(cs.obs, EQ.n(cs.obs) ? EQ.hw(EQ.p(cs.obs)) : null) }], last = Object.keys(cs.tests).pop(), T = last ? cs.tests[last] : null;
        if (T && last !== 'year') { const names = last === 'area' ? [L.west, L.east] : last === 'age' ? [L.newborn, L.adult] : [L.gene2]; T.groups.forEach((g, i) => groups.push({ label: names[i], bars: bars3(g, EQ.hw(EQ.p(g)), last === 'gene' ? ['BB', 'Bb', 'bb'] : null) })); }
        let mx = 0; for (const g of groups) for (const b of g.bars) mx = Math.max(mx, b.v || 0, b.exp || 0);
        ch.push({ type: 'eq_bars', title: 'Observed and expected', groups, y: { lo: 0, hi: Math.min(1, Math.max(0.8, Math.ceil((mx + 0.12) * 10) / 10)), fmt: 'pct' }, frame: 'designed' });
        if (cs.tests.year) ch.push({ type: 'trace', title: 'p in yearly samples', x: { lo: 1, hi: 4, label: 'year' }, y: { lo: 0, hi: 1, fmt: 'pct' }, series: [{ d: cs.tests.year.p.slice(), ink: 'A', label: 'p' }], frame: 'designed' });
        else { const pts = EQ.n(cs.obs) ? [{ f: EQ.frac(cs.obs), kind: 'dusk', label: 'sample' }] : []; if (T && last !== 'gene') T.groups.forEach(g => pts.push({ f: EQ.frac(g), kind: 'dawn', label: '' })); ch.push(tri(pts)); }
        stats.push(['Case', (s.ci + 1) + ' of 5', 'One hidden cause, or none.'], ['Census', String(cs.N), 'Beetles on this island.'], ['Field days', String(s.days), 'Tests cost days.'], ['χ²', EQ.chi(cs.obs).toFixed(2), 'Your sample against Hardy–Weinberg.']);
        if (cs.tests.year) stats.push(['p by year', cs.tests.year.p.join(', '), 'Samples of ' + cs.tests.year.n + ' each year; small samples wobble.']);
      } else if (s.car) {
        const c = s.car, N = c.obs[0] + c.obs[1], rev = s.phase === 'creveal' || s.phase === 'done7' || s.phase === 'over', t = c.true, TN = EQK.L7.carN;
        const bars = rev ? [{ k: 'AA', v: t[0] / TN, exp: null }, { k: 'Aa', v: t[1] / TN, exp: s.exp.car != null ? s.exp.car : null }, { k: 'aa', v: t[2] / TN, exp: null }] : [{ k: 'AA', v: null, exp: null }, { k: 'Aa', v: null, exp: null }, { k: 'aa', v: N ? c.obs[1] / N : null, exp: null }];
        ch.push({ type: 'eq_bars', title: 'Looks only', groups: [{ label: '', bars }], y: { lo: 0, hi: 0.8, fmt: 'pct' }, frame: 'designed' });
        ch.push({ type: 'pq', title: 'Looks counted', parts: [{ v: c.obs[0], allele: 0, label: L.blue }, { v: c.obs[1], allele: 1, label: L.amber }], n: N, frame: 'designed' });
        stats.push(['Counted', String(N), 'Looks only: blue or amber.'], ['Amber', N ? EQ.pct(c.obs[1] / N) + '%' : '—', 'aa beetles: q² of the beach.']);
      }
    }
    return { stats, charts: ch };
  }
};

/* ---------- the strip's two extra chart types (engine request: a 'bars' type with expected ghosts, and a bare 0–1 axis) ---------- */
if (typeof LiveGraph !== 'undefined' && LiveGraph.T) {
  LiveGraph.T.eq_bars = {
    n(spec) { return Math.max(3, (spec.groups || []).length * 3.7 - 0.7); },
    lay(w, h, spec, T, c) { const G = wgXY(w, h, spec, T, c, { xlo: 0, xhi: this.n(spec), ylo: 0, yhi: (spec.y && spec.y.hi) || 1, labels: [] }); return G; },
    fill(T, k) { const I = T.I; return { AA: [I.A, I.A], Aa: [I.A, I.a], aa: [I.a, I.a], BB: [I.paper, I.paper], Bb: [I.paper, I.ink], bb: [I.ink, I.ink], blue: [I.A, I.A], amber: [I.a, I.a] }[k] || null; },
    draw(c, G, spec, T) {
      const p = G.plot, I = T.I, base = p.y + p.h, slot = G.X(1) - G.X(0), bw = Math.min(28 * T.k, slot * 0.64);
      const many = (spec.groups || []).length > 1, tight = many && p.h < 64 * (T.k || 1);   // a short strip with several groups: name the groups under them, drop the per-bar text
      wgAxes(c, G, spec, T, { noX: true, noY: p.h < 3 * G.tk });   // a strip too short for two tick labels drops them (Show data has the numbers)
      (spec.groups || []).forEach((g, gi) => {
        (g.bars || []).forEach((b, bi) => {
          const cx = G.X(gi * 3.7 + bi + 0.5), x = cx - bw / 2, f = this.fill(T, b.k);
          if (b.v != null && f) { const y = G.Y(clamp(b.v, 0, G.ys.hi)), hh = base - y; if (hh > 0.4) { c.fillStyle = f[0]; c.fillRect(x, y, bw / 2, hh); c.fillStyle = f[1]; c.fillRect(x + bw / 2, y, bw / 2, hh); c.lineWidth = 1.5; c.strokeStyle = b.k === 'bb' ? I.paper : I.ink; c.strokeRect(x, y, bw, hh); }
            if (!tight && y - G.tk - 2 > p.y + G.tk) wgText(c, Math.round(b.v * 100) + '%', cx, y - G.tk / 2 - 2, G.tk, I.text, { align: 'center', wt: 700, halo: I.surface }); }
          else if (b.v == null) { const y = G.Y(G.ys.hi * 0.55); c.setLineDash([3, 3]); c.lineWidth = 1.2; c.strokeStyle = I.text2; c.strokeRect(x, y, bw, base - y); c.setLineDash([]); wgText(c, '?', cx, (y + base) / 2, G.tk + 2, I.text2, { align: 'center', fam: 'b', wt: 700 }); }
          if (b.exp != null) { const ey = G.Y(clamp(b.exp, 0, G.ys.hi)); c.setLineDash([5, 3]); c.lineWidth = 2 * T.k; c.strokeStyle = I.text; c.beginPath(); c.moveTo(x - 5, ey); c.lineTo(x + bw + 5, ey); c.stroke(); c.setLineDash([]); }
          const lab = b.label || b.k; if (!(tight && g.label) && wgW(c, lab, G.tk, 'b', 600) + 3 < slot) wgText(c, lab, cx, base + 3 + G.tk / 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600 });
        });
      });
      (spec.groups || []).forEach((g, gi) => {   // group names last, haloed, so a tall bar never hides them
        if (g.label && many && wgW(c, g.label, G.tk, 'b', 600) < slot * 3.4) wgText(c, g.label, G.X(gi * 3.7 + 1.5), tight ? base + 3 + G.tk / 2 : p.y + G.tk / 2 + 2, G.tk, I.text2, { align: 'center', fam: 'b', wt: 600, halo: I.surface });
      });
    },
    rows(spec) { const rows = []; for (const g of spec.groups || []) for (const b of g.bars || []) rows.push([(g.label ? g.label + ' ' : '') + (b.label || b.k), b.v == null ? '?' : Math.round(b.v * 100) + '%', b.exp == null ? '' : Math.round(b.exp * 100) + '%']); return { head: ['genotype', 'observed', 'expected'], rows }; },
    say(spec) { return (spec.groups || []).map(g => (g.label ? g.label + ': ' : '') + (g.bars || []).map(b => (b.label || b.k) + ' ' + (b.v == null ? 'unknown' : Math.round(b.v * 100) + '%')).join(', ')).join('; '); }
  };
  LiveGraph.T.eq_axis = {
    lay(w, h, spec, T, c) { return wgXY(w, h, spec, T, c, { xlo: 0, xhi: 1, ylo: 0, yhi: 1, labels: [] }); },
    draw(c, G, spec, T) {
      const p = G.plot, I = T.I, y = p.y + p.h * 0.55, e = spec.ends || ['0', '1'];
      c.lineWidth = 2; c.strokeStyle = I.text; c.beginPath(); c.moveTo(p.x, y); c.lineTo(p.x + p.w, y); c.stroke();
      for (let k = 0; k <= 4; k++) { const x = G.X(k / 4); c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y - (k % 2 ? 4 : 7)); c.lineTo(x, y + (k % 2 ? 4 : 7)); c.stroke(); }
      wgText(c, e[0], p.x, y + 10 + G.tk / 2, G.tk, I.text2, { align: 'left', fam: 'b', wt: 600 }); wgText(c, e[1], p.x + p.w, y + 10 + G.tk / 2, G.tk, I.text2, { align: 'right', fam: 'b', wt: 600 });
      wgText(c, '50%', G.X(0.5), y + 10 + G.tk / 2, G.tk, I.text2, { align: 'center' });
    },
    rows() { return { head: ['', ''], rows: [] }; },
    say(spec) { return (spec.ends || []).join(' to '); }
  };
}

/* ---------- the Norway rat (L6 only): a natural-paint rig, ≥ ΔE 8 from the data inks; faces right ---------- */
if (typeof Rig !== 'undefined' && Rig.def) {
  const { E, C, L, P, OL, eye, INK } = Rig._;
  Rig.def('eqrat', {
    tier: 'actor', pose: 0.4,
    row: { scene: 'farm', squint: 'long body, pointed snout, long thin tail', channels: ['genotype badge above (GENES lens)', 'pale and hunched when poisoned'] },
    paints: ['#6E6158', '#9B9089', '#A3928A', '#8A7A70'],
    recipe(ph) {
      const body = ph.sick ? '#9B9089' : '#6E6158', ear = '#8A7A70', tail = '#A3928A', lg = ph.leg ? 3 : -3, ol = Object.assign({}, OL);
      return { w: 64, h: 30, parts: [
        L([-20, 2, -30, 4, -38, -2, -44, -8], INK, 3.4, { cap: 'round' }), L([-20, 2, -30, 4, -38, -2, -44, -8], tail, 2, { cap: 'round' }),
        E(-12 + lg, 9, 4, 2.6, body, ol), E(8 - lg, 9, 4, 2.6, body, ol),
        E(-4, 0, 19, ph.sick ? 8.5 : 10, body, Object.assign({}, ol, { kids: [E(-6, 5, 16, 5, 'rgba(0,0,0,.16)'), E(-8, -5, 9, 3, 'rgba(255,255,255,.14)')] })),
        P([12, -7, 28, 0, 12, 6], body, ol), E(15, -1, 8, 6.5, body, ol),
        C(11, -8, 4, ear, ol), ...eye(18, -3, 1.7), C(28, 0, 1.6, INK),
        L([24, 1, 31, -2], 'rgba(27,22,18,.6)', 0.8), L([24, 2, 31, 4], 'rgba(27,22,18,.6)', 0.8)
      ] };
    }
  });
}

/* ---------- the learning layer (D5 §3 item 12): overwritten for v2, untouched under ?v1=1 ---------- */
if (!Url.v1) {
  TAKE.census = EQ_C.take;
  BRIDGE.census = 'Mendel predicts one cross. What does a whole population of random crosses look like?';
  MODEL.census = 'One gene, two alleles, discrete generations. Beetles mate at random unless a level changes one thing: relatives mating, two demes, warfarin selection on rats, drift on a tiny island or migrants arriving.';
  RECALL.census = { q: 'A beach has 9% amber (aa) beetles and mates at random. About what share carry one hidden a?', opts: [['42', 'About 42%'], ['9', 'About 9%'], ['30', 'About 30%']], ans: '42', why: 'q = √0.09 = 0.3, so carriers are 2pq = 2 × 0.7 × 0.3 = 0.42.' };
  if (typeof TRANSFER !== 'undefined' && TRANSFER.census) delete TRANSFER.census;
}
V2.push(CH_HWE_V2);
