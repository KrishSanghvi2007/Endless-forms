/* ================= Learning layer: predict, explain, transfer, retrieve ================= */
const TAKE = {
  mendel: 'Recessive alleles can hide in plain sight — and a well-chosen cross makes them show.',
  scribe: 'Mutation is random with respect to need: it supplies variation, not solutions.',
  cross: 'Chromosomes are inherited in chunks, not gene by gene.',
  census: 'Hardy–Weinberg is useful because departures from it tell you what to investigate.',
  coal: 'Run backwards, every genealogy collapses to a common ancestor, and its shape records history.',
  casino: 'In finite populations chance alone changes allele frequencies, fastest when populations are small.',
  castaways: 'A few founders carry only a chance sample of their source population’s genes.',
  sex: 'Sex is costly, but recombination lets selection separate good genes from bad.',
  lichen: 'Selection happens when variants consistently leave different numbers of descendants because of how they differ.',
  soot: 'A dominant allele is exposed to selection at once; a recessive one can hide in heterozygotes.',
  fancier: 'Selecting on one trait changes every trait genetically correlated with it.',
  sieve: 'The shape of selection — directional, stabilising, disruptive — decides what happens to a trait’s distribution.',
  bitter: 'Harmless mimics borrow protection from a warning signal that others pay for.',
  landscape: 'Because mutations interact, the order in which they arrive shapes where evolution can go.',
  jaws: 'When the rare type does better, selection keeps variation alive.',
  hawks: 'The best strategy depends on what everyone else is doing.',
  bats: 'Helping pays when help comes back, and remembering who helped keeps it stable.',
  brood: 'Every offspring has one mother and one father, so selection favours equal investment in sons and daughters — unless brothers compete for mates.',
  gametes: 'Eggs and sperm may have begun as a split between provisioning and numbers.',
  lek: 'A costly signal can stay honest when it costs individuals in poor condition more, so the best display rises with quality.',
  raffle: 'When sperm compete, how much to send depends on the rivals already there, and on those likely to follow.',
  spindle: 'Some genes spread by cheating at meiosis, even when they harm the organism.',
  meadow: 'Pollinators shape flowers, and sometimes flowers shape their pollinators in return.',
  alarm: 'Helping relatives can spread genes for helping: rb > c.',
  nest: 'Parents and offspring agree on much, but not on everything.',
  commons: 'Cooperation can lose within every group and still win overall.',
  many: 'Multicellularity can begin when selection acts on groups of cells, and lasts only if cells are kept from cheating.',
  livefast: 'Every life is a budget: effort spent now is not available later.',
  forager: 'Good foraging weighs gain against time, travel and risk.',
  crowd: 'Where to go depends on where everyone else goes, and on what their choices reveal.',
  plastic: 'Plasticity pays only when the environment varies and the cues are reliable enough.',
  clinic: 'Antibiotics select resistance; at most they speed up the random mutation and gene transfer that supply it.',
  virulence: 'Virulence is not a pathogen’s aim but a side effect of how it exploits its host and spreads.',
  lock: 'In host–parasite coevolution, no defence stays good for long.',
  guest: 'Partners stay honest when cheating is punished or when their fates are tied.',
  switch: 'Big changes in form often come from changing where and when genes are switched on.',
  copy: 'Genomes grow by copying — selfish copies and useful duplicates alike.',
  sweep: 'Selection leaves footprints in the diversity around the genes it favoured.',
  clock: 'Neutral differences tick like a clock, but the clock must be calibrated and corrected.',
  river: 'Isolation lets populations accumulate incompatibilities; contact can reinforce the barrier.',
  fruits: 'Divergence without barriers needs mating to follow the ecological split.',
  ring: 'Species boundaries need not be sharp, and interbreeding need not be transitive.',
  double: 'Doubling the genome can create a species in a single generation.',
  arch: 'Competition can push similar species apart; beaks follow food.',
  tree: 'Trees show shared ancestry, not a ladder of progress.',
  web: 'A species’ importance is measured by its effects, not its numbers.',
  islands: 'Species richness is a balance between arrivals and losses.',
  fire: 'Communities are assembled by history as well as by rules.'
};
const BRIDGE = {
  cross: 'In Mendel’s Garden, two genes could assort independently. Do they always?',
  census: 'Mendel predicts the ratios in a single cross. What should a whole population look like?',
  coal: 'So far you have followed genes forward, from parents to offspring. Now run time backwards.',
  castaways: 'In the Drift Casino you saw what small numbers do. Now strand a handful of founders on an island.',
  sex: 'In small populations, chance can lose even the best genomes. Can sex get them back?',
  soot: 'In the Lichen Wood you were the predator. Now the forest itself changes.',
  sieve: 'Before, your hunting was the selection. Now you draw the selection directly.',
  landscape: 'Selection climbs uphill. But which hill?',
  spindle: 'Mendel’s first law says each copy gets a fair chance. Some genes cheat.',
  commons: 'In Alarm Call, relatedness made helping pay. These microbes are not kin. Can cooperation still spread?',
  clinic: 'Selection needs variation — and in a billion bacteria, the variation is already there.',
  lock: 'In Left Jaw, Right Jaw, the rare type had the edge. Now two species drive each other’s frequencies.',
  sweep: 'Selection changes allele frequencies, and leaves a scar on the genome.',
  clock: 'Neutral mutations drift to fixation at a roughly steady rate. Can we tell time with them?',
  river: 'Small populations drift apart, and isolated ones accumulate differences. What happens when they meet?',
  fruits: 'In The Sieve, killing the middle birds never split the flock for long. What would?',
  arch: 'Selection follows food, and competitors change what food is left.',
  tree: 'You have watched lineages change and split. Now read the branching pattern they leave.'
};
const TRANSFER = {
  soot: { from: 'lichen', q: 'In the Lichen Wood, moths that matched pale, lichen-covered bark survived your hunting. Now soot blackens the trunks. Which moths do you expect to increase?', opts: [['dark', 'Dark ones'], ['pale', 'Pale ones'], ['none', 'No change']], ans: 'dark', why: 'The principle transfers: moths that match the background are harder for predators to find. On sooty bark, that is the dark form.' },
  castaways: { from: 'casino', q: 'A mainland population is half blue-eyed. Five founders reach an island. Will the island start at the mainland’s 50%?', opts: [['yes', 'Yes, the same 50%'], ['no', 'Not necessarily: it could easily differ'], ['less', 'Always below 50%']], ans: 'no', why: 'Five founders are a tiny sample. They cannot even be exactly half blue-eyed: the island starts at 0, 20, 40, 60, 80 or 100% blue, and more than a third of the time it starts at 20% or below, or at 80% or above. That sampling accident is the founder effect.' },
  cross: { from: 'mendel', q: 'Two genes sit right next to each other on the same chromosome. In a two-gene cross, will they assort independently?', opts: [['yes', 'Yes, like any two genes'], ['no', 'No, they tend to travel together'], ['male', 'Only in males']], ans: 'no', why: 'Genes close together on one chromosome are usually inherited together; only a crossover between them separates them.' },
  fruits: { from: 'sieve', q: 'Suppose every winter you killed the middle-sized birds. Would that alone split one population into two species?', opts: [['yes', 'Yes, given time'], ['no', 'No: mating refills the middle'], ['small', 'Only if the flock is small']], ans: 'no', why: 'As long as big and small birds mate with each other, their chicks are middle-sized again. Splitting needs mating to follow the ecological divide. Disruptive selection can sometimes favour choosier mating, but how often that happens in nature is debated.' },
  clinic: { from: 'lichen', q: 'A billion bacteria include a few resistant mutants before any drug is given. What does an antibiotic do?', opts: [['make', 'Creates resistance mutations'], ['sel', 'Selects the resistant cells'], ['all', 'Makes every cell a little resistant']], ans: 'sel', why: 'Like your hunting in the Lichen Wood, the drug removes some variants and leaves others to breed. The resistant cells were already there.' },
  lock: { from: 'jaws', q: 'In Left Jaw, Right Jaw, the rarer fish did better, with a one-season lag. Now parasites that match the commonest host type are favoured, but their numbers take a few generations to catch up. What happens to host types?', opts: [['one', 'The commonest takes over'], ['cycle', 'They rise and fall in turn'], ['flat', 'They settle at equal shares']], ans: 'cycle', why: 'The rare-type advantage now comes with a longer delay, so host types overshoot further and chase each other in cycles. With no delay at all they would tend to settle at equal shares.' }
};
const RECALL = {
  mendel: { q: 'A purple plant crossed with a white plant gives ten purple seeds. How strong is the evidence that it carries no white allele?', opts: [['proof', 'Proof'], ['strong', 'Strong, not proof'], ['none', 'None']], ans: 'strong', why: 'A carrier would give ten purple seeds only about 1 time in 1,024. Strong evidence — but evidence, not proof.' },
  cross: { q: 'Two genes are 1 map unit (1 cM) apart. Roughly what share of gametes are recombinant between them?', opts: [['1', '1%'], ['10', '10%'], ['50', '50%']], ans: '1', why: 'One map unit is defined as 1% recombination.' },
  census: { q: 'A pooled sample has too few heterozygotes, yet each subpopulation on its own fits Hardy–Weinberg. What is going on?', opts: [['w', 'Two populations pooled'], ['i', 'Inbreeding'], ['h', 'Heterozygote advantage']], ans: 'w', why: 'Pooling groups with different allele frequencies creates a heterozygote deficit that exists in neither: the Wahlund effect.' },
  coal: { q: 'In a population of N gene copies, how many generations back do two lineages meet, on average?', opts: [['n', 'About N'], ['2', 'About 2'], ['n2', 'About N²']], ans: 'n', why: 'Each generation back they share a parent with probability 1/N, so they meet after about N generations on average.' },
  casino: { q: 'Two neutral alleles start at 50:50. Which population usually reaches fixation sooner?', opts: [['20', 'N = 20'], ['2000', 'N = 2,000'], ['same', 'Same speed']], ans: '20', why: 'Drift is faster in small populations: each generation’s sampling error is larger.' },
  sex: { q: 'Why does an asexual population lose its least-mutated class for good?', opts: [['r', 'Nothing can rebuild it'], ['s', 'Selection removes it'], ['m', 'Mutation is faster']], ans: 'r', why: 'In a small population the best class is lost by chance, and without recombination only rare back-mutations could rebuild it: Muller’s ratchet.' },
  lichen: { q: 'Survivors were 10 points better camouflaged than average; their offspring were 4 points better. What is the realised heritability?', opts: [['04', '0.4'], ['4', '4'], ['01', '0.1']], ans: '04', why: 'Response ÷ selection differential: R/S = 4/10 = 0.4.' },
  fancier: { q: 'You select only for tameness, and ear shape changes too. What is the simplest explanation?', opts: [['g', 'A genetic correlation'], ['e', 'The environment changed'], ['d', 'Drift']], ans: 'g', why: 'If the same genes affect both traits, selecting on one moves the other: a correlated response.' },
  sieve: { q: 'Selection kills the extremes at both ends. What happens to the mean and the spread?', opts: [['n', 'Spread narrows'], ['m', 'Mean moves'], ['w', 'Spread widens']], ans: 'n', why: 'Stabilising selection trims the tails and leaves the mean where it was.' },
  hawks: { q: 'Fights cost more than the prize is worth. At the evolutionarily stable state, are there some hawks, none, or only hawks?', opts: [['some', 'Some hawks'], ['none', 'No hawks'], ['all', 'Only hawks']], ans: 'some', why: 'A mix: hawks at frequency V/C, where V is the prize and C the cost of a fight.' },
  jaws: { q: 'Why does neither left- nor right-jawed fish take over?', opts: [['rare', 'The rarer type does better'], ['eq', 'They are equally fit'], ['mut', 'Mutation restores balance']], ans: 'rare', why: 'Prey guard against the common type, so the rare one eats better: negative frequency dependence.' },
  brood: { q: 'Sons cost twice as much to raise as daughters. What should parents make?', opts: [['d', 'Twice as many daughters'], ['e', 'Equal numbers'], ['s', 'More sons']], ans: 'd', why: 'Fisher: equal total investment in each sex, so twice as many of the cheaper sex.' },
  alarm: { q: 'A call costs the caller 0.1 and gives each listener 0.3. Does calling pay for one full sibling (r = 0.5)?', opts: [['y', 'Yes'], ['n', 'No'], ['c', 'Only for cousins']], ans: 'y', why: 'rb = 0.5 × 0.3 = 0.15, which is more than c = 0.1.' },
  spindle: { q: 'A selfish centromere gambles and causes an egg with the wrong chromosome number. Who pays most?', opts: [['m', 'The mother'], ['c', 'The centromere'], ['n', 'Nobody']], ans: 'm', why: 'The driver often had nothing to lose; the mother loses the egg. That is why the rest of the genome evolves suppressors.' },
  commons: { q: 'Producers of a public good lose ground inside every group. How can they increase overall?', opts: [['g', 'Producer-rich groups grow faster'], ['m', 'Mutation'], ['n', 'They cannot']], ans: 'g', why: 'The between-group term of Price’s equation can outweigh the within-group term.' },
  livefast: { q: 'Where outside dangers are high, should animals invest more in early or in late reproduction?', opts: [['e', 'Early'], ['l', 'Late'], ['s', 'It makes no difference']], ans: 'e', why: 'If you probably will not survive to next year, effort saved for next year is mostly wasted.' },
  plastic: { q: 'When does growing a costly defence only in response to a cue pay?', opts: [['r', 'When the cue is reliable'], ['a', 'Always'], ['n', 'Never']], ans: 'r', why: 'An unreliable cue should be ignored; then a fixed strategy does better.' },
  clinic: { q: 'Why do two-drug combinations hold off resistance better than one drug?', opts: [['two', 'A cell needs two mutations at once'], ['str', 'Two drugs are stronger'], ['tox', 'They are less toxic']], ans: 'two', why: 'Cells resistant to each drug exist already; cells resistant to both are vanishingly rare, unless one plasmid carries both resistances.' },
  virulence: { q: 'According to Paul Ewald, why might a mosquito-borne pathogen evolve higher virulence than one spread by touch?', opts: [['s', 'Sick hosts still transmit'], ['m', 'Mosquitoes prefer it'], ['r', 'It replicates less']], ans: 's', why: 'A bed-ridden host can still infect mosquitoes, so harming it costs the pathogen less. It is a hypothesis with mixed support: myxoma, spread by mosquitoes, still became somewhat less deadly, because mosquitoes bite only living rabbits.' },
  lock: { q: 'In a Red Queen cycle, which host type is the best one for a parasite to match next season?', opts: [['next', 'The one not yet hit hard'], ['now', 'The commonest now'], ['rare', 'The rarest']], ans: 'next', why: 'The common host is under heavy attack and about to fall; the rising one will be common next.' },
  switch: { q: 'Why do enhancer mutations often have fewer side effects than coding mutations?', opts: [['one', 'An enhancer acts in one tissue'], ['small', 'Enhancers are small'], ['rare', 'They are rare']], ans: 'one', why: 'The protein is used everywhere the gene is on; an enhancer often controls just one tissue.' },
  ring: { q: 'Neighbouring populations interbreed all the way round a ring, but the two ends do not. One species or two?', opts: [['1', 'One'], ['2', 'Two'], ['n', 'Neither label fits cleanly']], ans: 'n', why: 'Interbreeding is not transitive around a ring: species boundaries can be gradients.' },
  double: { q: 'A new tetraploid is crossed with its diploid parent. What are the offspring?', opts: [['t', 'Mostly sterile triploids'], ['f', 'Fertile tetraploids'], ['d', 'Fertile diploids']], ans: 't', why: 'Three sets cannot pair evenly in meiosis, so triploids are mostly sterile: a strong barrier, formed in a single generation.' },
  fruits: { q: 'Why does mating on the host fruit help host races form?', opts: [['m', 'Choosing a host is choosing mates'], ['f', 'The fruit changes their genes'], ['s', 'It makes selection weaker']], ans: 'm', why: 'One trait does two jobs, so recombination cannot break the link between habitat and mate choice.' }
};
const MODEL = {
  lichen: 'Moth colour is built from many additive genes plus developmental noise, with free recombination and random mating. Real wing-pattern genetics often involves a few genes of large effect.',
  soot: 'History compressed: the game condenses more than a century of change into a few generations, and your progress sets the timing of the Clean Air Act. Historically, clean-air legislation did not wait for moth frequencies. Carbonaria is treated as a single dominant allele that arose once, as in real peppered moths, and one migrant moth joins each generation.',
  bitter: 'Resemblance is a polygenic additive trait; you, the predator, are the only source of selection.',
  sieve: 'Beak depth is represented by ten additive loci plus environmental variation, with random mating. Real beak shape in Darwin’s finches involves interacting developmental genes such as BMP4, ALX1 and HMGA2.',
  fancier: 'In this model, tameness is genetically correlated with ear and coat traits by design: most loci that raise tameness also soften ears and break up pigment. The game demonstrates a correlated response; it does not test why such correlations exist in real foxes, where several explanations have been proposed and the causes remain debated.',
  casino: 'Beads are haploid, generations do not overlap, and every jar is refilled by sampling with replacement: the Wright–Fisher model.',
  coal: 'A haploid Wright–Fisher population: each individual picks one parent at random from the generation before.',
  census: 'Samples are drawn from fixed genotype frequencies; real populations are also shaped by migration, drift and sampling bias.',
  sex: 'Harmful mutations have equal, multiplicative effects and recombination is free. Real mutation effects vary enormously, and real sexual populations pay the cost of males in more complicated ways.',
  fruits: 'A haploid, deterministic two-gene model with soft selection on each fruit. Real apple maggot flies are diploid, and some of their timing genes lie in inversions that arose long ago in Mexican populations.',
  clinic: 'Bacterial counts are expected values, kill rates are fixed per dose, and the immune system is a simple threshold. Real pharmacology and resistance mechanisms are far more varied. Resistance arises here only by new mutation, as in tuberculosis; in many other bacteria it also spreads between cells on plasmids.',
  virulence: 'Transmission, death and recovery trade off through fixed, assumed curves, and the epidemic is a simple model of 140 rabbits. Real trade-offs like these have been measured in only a few systems.',
  bats: 'Roost-mates follow fixed strategies with memory of your behaviour. Real vampire bats build long-term bonds shaped by kinship, familiarity and reciprocity together.',
  many: 'Cluster size is a single heritable trait, and sinking speed and growth cost follow simple formulas. In level 2, cheaters arise many thousands of times more often than real mutation would make them, so that you can see them.',
  double: 'Pollen reaches only neighbouring squares, and every plant uses its own pollen half the time. Tetraploids are 1.8 times as likely as diploids to seed a square. Selfing and vigour both help new polyploids in some real species but not all. Triploids here are fully sterile; real ones occasionally make viable gametes, a “triploid bridge” to tetraploidy.',
  lock: 'Matching-alleles infection with four genotypes and deterministic updates. Real host–parasite genetics is rarely this strictly matched.',
  guest: 'Cheaters grow 1.4 times as fast per unit of oxygen, and new nodules are drawn from a soil pool your choices shape. Real sanctions are partial and vary among plants.',
  arch: 'Seed supply and beak use are smooth curves, and competitors share each seed size in proportion to how well they handle it.',
  islands: 'Immigration and extinction are straight lines in species number, with invented rate constants.',
  fire: 'Succession is a deterministic chain of replacements, and diversity is Shannon evenness weighted by plant cover. That makes diversity peak at an intermediate fire interval by construction; real diversity–disturbance patterns come in many shapes.',
  landscape: 'Fitness comes from an NK model: five sites, each interacting with two others, with random contributions.',
  crowd: 'Food is shared equally, or by competitive weight, and the crowd moves toward the ideal free distribution, with some noise.',
  raffle: 'In level 1, rival sperm counts are known exactly, every sperm is an equal ticket, and no male mates after you. In many real species the last male has an advantage and females mate again, so even a virgin is worth some sperm.',
  alarm: 'Relatedness is read straight from collars, every sister counts as r = ½, and a call’s cost and benefit are fixed numbers. Real litters often have several fathers. In level 2 a helper gains only through extra siblings; real Seychelles warbler helpers often lay eggs of their own.',
  nest: 'In level 1, food arrives at a fixed rate and eggs themselves cost nothing, so a spare chick you choose not to feed costs you nothing. In level 2 the parent’s choice is a lottery weighted by begging. Real eggs cost the mother, and how parents respond to begging evolves too.',
  commons: 'Both levels are computed exactly, with no drift. In level 1 the jars are mixed by hand, so producers share jars with other producers far more often than chance would give, and that assortment is what lets them spread: a producer’s own good returns only 0.8 ÷ 20 = 0.04 to itself, less than its cost of 0.2. In level 2, groups are founded at random from a very large population, and each producer gets back its own share of the good, 1/k, which is why producers can spread there without relatives.',
  brood: 'The population’s share of males is scripted: each season it moves toward Fisher’s equilibrium (one male per female, then one male per two females once sons cost double), whatever you lay. It does not evolve from the mothers’ choices, as it would in nature. In the figs the other mothers always lay the stable share of sons, (n − 1) ÷ 2n.'
};

/* ---- intro bridges ---- */
{ const _intro = introHTML; introHTML = function (ch) { const h = _intro(ch), B = BRIDGE[ch.id]; return B ? h.replace('</p>', '</p><p style="font-style:italic;opacity:.85">' + B + '</p>') : h; }; }

/* ---- question card used for transfer and retrieval ---- */
function askCard(Q, next) {
  Cards.open({ cls: 'intro', html: '<h3>' + (Q.title || 'Predict first') + '</h3>' + (Q.kicker ? '<p class="kicker">' + Q.kicker + '</p>' : '') + '<p>' + Q.q + '</p>', buttons: Q.opts.map(([k, t]) => ({ t, fn: () => { const ok = k === Q.ans; ok ? Snd.chime() : Snd.miss(); Cards.open({ cls: 'intro', html: '<h3>' + (ok ? 'Right' : 'Not quite') + '</h3><p>' + Q.why + '</p>', buttons: [{ t: 'Continue', primary: true, fn: () => { Cards.close(); next(); } }] }); } })) });
}
{ const _open = App.open.bind(App);
  App.open = function (ch) {
    const done = Save.d.done || {}, T = TRANSFER[ch.id];
    if (T && done[T.from] && REG[T.from]) return askCard(Object.assign({ title: 'Predict first', kicker: 'Carrying over from ' + REG[T.from].title }, T), () => _open(ch));
    Save.d.opens = (Save.d.opens || 0) + 1; Save.save();
    const cands = Object.keys(RECALL).filter(id => done[id] && id !== ch.id && REG[id]);
    if (cands.length && Save.d.opens % 3 === 0) { const id = pick(cands); return askCard(Object.assign({ title: 'Remember?', kicker: 'From ' + REG[id].title }, RECALL[id]), () => _open(ch)); }
    _open(ch);
  };
}

/* ---- end card: takeaway line, completion record ---- */
{ const _es = End.show.bind(End);
  End.show = function (ch, o) {
    Save.d.done = Save.d.done || {}; Save.d.done[ch.id] = 1; Save.save();
    let ins = o.insight || ''; if (ch._extra) { ins += ch._extra; ch._extra = null; }
    if (TAKE[ch.id]) ins = '<span style="display:block;font-weight:700;font-style:italic;font-size:1.06em;margin-bottom:8px">' + TAKE[ch.id] + '</span>' + ins;
    return _es(ch, Object.assign({}, o, { insight: ins }));
  };
}

/* ---- Notes: three kinds of truth ---- */
{ const _nr = Notes.render.bind(Notes);
  Notes.render = function () {
    _nr(); if (this.tab !== 'idea') return; const ch = App.ch; if (!ch) return;
    const real = (ch.intro && ch.intro.real) || ch.real || '', model = MODEL[ch.id], mth = ch.maths || '';
    $('sh-body').insertAdjacentHTML('beforeend', '<div style="margin-top:14px;border-top:1px solid rgba(0,0,0,.15);padding-top:8px">' + (TAKE[ch.id] ? '<p><b>The principle.</b> ' + TAKE[ch.id] + '</p>' : '') + '<details><summary><b>In this model</b></summary>' + (model ? '<p>' + model + '</p>' : '') + (mth ? '<p>' + mth + '</p>' : '') + '</details>' + (real ? '<details><summary><b>In nature</b></summary><p>' + real + '</p></details>' : '') + '</div>');
  };
}

/* ---- reset per-play flags ---- */
{ const _play = App.play.bind(App); App.play = function (ch) { Hunt._pAsked = false; Hunt._pred = null; Hunt._pFed = false; return _play(ch); }; }

/* ---- Lichen Wood: predict, then see S and R ---- */
{ const _il = Hunt.interlude, _ng = Hunt.nextGen;
  Hunt.interlude = function (rec) {
    if (!this.ch || this.ch.id !== 'lichen' || this._pAsked) return _il.call(this, rec);
    this._pAsked = true; const H = this, f = x => H.ch.focus.get(x.ph), surv = H.pop.filter(x => !x.eaten); H._pS = surv.length ? mean(surv.map(f)) - mean(H.pop.map(f)) : 0;
    const go = p => () => { H._pred = p; Cards.close(); _il.call(H, rec); };
    Cards.open({ cls: 'intro', html: '<h3>Predict first</h3><p>Before the survivors breed: which moths will be commoner in the next generation?</p>', buttons: [{ t: 'Better camouflaged', fn: go('better') }, { t: 'More conspicuous', fn: go('worse') }, { t: 'No change', fn: go('same') }] });
  };
  Hunt.nextGen = function () {
    const had = this._pred && !this._pFed && this.ch && this.ch.id === 'lichen', r = _ng.apply(this, arguments);
    if (had && this.lastRec && this.lastRec.R != null) {
      // S and R on the same 0–1 dark-to-pale tone scale as dawnLine, Notes and the end card; on this pale bark, paler means better hidden at the start
      this._pFed = true; const S = this._pS, Rr = this.lastRec.R, dir = Rr >= 0.005 ? 'better' : Rr <= -0.005 ? 'worse' : 'same', held = this._pred === dir,
        cmp = v => Math.abs(v) < 0.005 ? 'about the same tone as' : Math.abs(v).toFixed(2) + (v > 0 ? ' paler than' : ' darker than'), Sd = +S.toFixed(2), h = Math.abs(Sd) >= 0.04 ? +Rr.toFixed(2) / Sd : null, // threshold and ratio use the values shown, so the wording never contradicts the numbers
        share = h == null ? 'You selected too gently this morning to say how much was inherited.' : h < 0 ? 'In thirty moths, chance swamped the response this time.' : h > 1 ? 'Chance in who bred with whom made the response larger than the selection this time.' : 'About ' + Math.round(100 * h) + '% of the difference was inherited. One morning in thirty moths is a noisy measure; the season’s end adds them all up.';
      if (this.state === 'dawn' && !this.sync) Cards.open({ cls: 'intro', html: '<h3>' + (held ? 'Your prediction held' : 'Interesting result') + '</h3><p>The moths you spared were ' + cmp(S) + ' their whole generation: that is the selection, S. Their young came out ' + cmp(Rr) + ' that generation: the response, R. On this pale bark, paler is better hidden.</p><p>' + share + '</p>', buttons: [{ t: 'On to the morning', primary: true, fn: () => Cards.close() }] });
      else toast('<b>' + (held ? 'Prediction held.' : 'Interesting result.') + '</b> Spared moths ' + cmp(S).replace(/ than$| as$/, '') + ', young ' + cmp(Rr).replace(/ than$| as$/, '') + '.');
    }
    return r;
  };
}

/* ---- Black Country: say that history is compressed ---- */
CH_SOOT.intro.how = (CH_SOOT.intro.how || CH_SOOT.intro.part || '') + ' History is compressed: a century of industrial change plays out in a few generations, and your progress sets the timing of the Clean Air Act.';

/* ---- Mendel: make the strength of evidence explicit ---- */
CH_MENDEL.confNote = function (p) {
  const A = this.pl[p.a], B = this.pl[p.b], wh = this.whites(p);
  if (p.a === p.b) { if (!A.white) toast(wh ? 'A white seed proves this plant carries white: no uncertainty left.' : 'Ten purple seeds from a selfed plant. If it were a carrier, that would happen about 1 time in 18 (¾¹⁰): suggestive, not proof.'); return; }
  if (A.white === B.white) return;
  toast(wh ? 'A white seed proves the purple plant is a carrier: no uncertainty left.' : 'Ten purple seeds with a white partner. A carrier would give that only about 1 time in 1,024 (½¹⁰), so calling it pure is a very safe bet, though still not proof.');
};

/* ---- Drift Casino: predict before you bet ---- */
{ const CQ = {
    1: { q: 'Jar of 10 beads, blue at 80%. Nothing favours either colour. What is blue’s chance of eventually taking over?', opts: [['80', 'About 80%'], ['50', 'About 50%'], ['100', 'Certain']], ans: '80', why: 'For a neutral allele, the chance of eventually fixing equals its starting frequency.' },
    2: { q: 'Jar of 200 beads at 50:50. After thirty generations, what is most likely?', opts: [['mix', 'Still mixed'], ['fix', 'One colour gone'], ['blue', 'Blue ahead']], ans: 'mix', why: 'Drift is slow in large populations: thirty generations is short for 200 beads.' },
    5: { q: 'Now blue beads copy themselves 15% more often, starting at 30% in a jar of 40. Blue’s chance of taking over is…', opts: [['up', 'Well above 30%'], ['same', 'Still 30%'], ['sure', 'Certain']], ans: 'up', why: 'Selection tilts the odds, though in a small jar chance can still defeat it.' },
    8: { q: 'A jar of 200 at 50:50 crashes to 2 beads for a moment, then regrows. The chance that one colour takes over within thirty generations…', opts: [['up', 'Rises sharply'], ['same', 'Barely changes'], ['down', 'Falls']], ans: 'up', why: 'A bottleneck is a burst of extreme drift: two beads may well be the same colour.' }
  };
  const _nt = CH_CASINO.newTable;
  CH_CASINO.newTable = function () { _nt.call(this); const Q = CQ[this.i]; if (!Q) return; askCard(Object.assign({ title: 'Predict before you bet' }, Q), () => { }); };
}

/* ---- The Sieve: a secret sixth challenge ---- */
CH_SIEVE.stats = function (pop) { const zs = pop.map(x => x.z), m = mean(zs), v = mean(zs.map(z => (z - m) ** 2)), sd = Math.sqrt(v), sk = sd > 0 ? mean(zs.map(z => (z - m) ** 3)) / (sd ** 3) : 0, ku = v > 0 ? mean(zs.map(z => (z - m) ** 4)) / (v * v) : 3; return { mean: m, sd, n: pop.length, bc: (sk * sk + 1) / ku }; };
CH_SIEVE.MISSIONS.push({ k: 'split', t: 'Secret challenge: two populations', d: 'Can you turn this flock into two separate groups, with a gap in the middle that lasts? Draw any survival curve you like.', test: (S, M) => S.bc >= 0.62, prog: (S, M) => clamp((S.bc - 0.4) / 0.22, 0, 1) });
CH_SIEVE.intro.goal += ' A secret sixth challenge waits at the end.';
{ const _se = CH_SIEVE.end;
  CH_SIEVE.end = function () { const split = this.got.includes('split'); this.got = this.got.filter(k => k !== 'split'); this._extra = split ? ' And you split the flock, at least for now: a gap opened in the middle. Notice how extreme the survivors had to be, and how quickly middle-sized chicks reappear.' : ' <b>Interesting result</b> on the secret challenge: killing the middle birds never split the flock for long. Each spring, big-beaked and small-beaked birds paired up and hatched middle-sized chicks. Disruptive selection alone is not speciation: mating has to follow the split (see Two Fruits).'; return _se.call(this); };
}
