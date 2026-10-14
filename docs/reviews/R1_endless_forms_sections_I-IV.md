# Review R1: Endless Forms, Sections I–IV (Heredity, Chance, Selection, Games)

*Reviewer: evolutionary biologist and game designer agent (code read; no screenshots). This is raw reviewer output, kept for reference. Its science claims were later fact-checked: see `R7_factcheck_R1_endless_forms_sections_I-IV.md`, which takes precedence wherever the two disagree.*

**Code map.** The registry is in `ui.js` and the `ALL` list is in `boot.js`.

| Chapter | File |
|---|---|
| Mendel, Casino | `ch1.js` |
| Scribe, Sieve, Jaws | `ch2.js` |
| Cross, Castaways | `ch4.js` |
| Hawks | `ch5.js` |
| Census | `ch13.js` |
| Bats (Blood Debts) | `ch15.js` |
| Fancier, Coalescent | `ch16.js` |
| Sex | `ch17.js` |
| Landscape | `ch25.js` |
| Lichen, Soot, Bitter | `hunt.js` (Hunt engine) |

**The main pattern.** The chapters the designer likes (Lichen/Soot, Bitter, Jaws, Hawks) are the ones where *the player's own behaviour is the selective force*, and the player can see the population change because of what they did. The weak chapters are menus and quizzes: press a button, read a chart, name the answer. In those the model is often fine, but the player stands outside it.

---

## I. HEREDITY

### Mendel's Garden
- **What the player does:** taps two of six purple plants (or one plant twice to self it) and gets ten seeds. Within eight crosses, they label each plant as pure or carrier.
- **Science:** correct as far as it goes. What is missing:
  - It covers one locus with complete dominance only.
  - There is no 3:1 or 9:3:3:1 reasoning, no independent assortment, no incomplete dominance or codominance, and no sex linkage.
  - Sampling error is never made explicit.
- **Fun:** a logic puzzle with one optimal answer (test-cross everything with W). Once you see that, it plays like a form.
- **Visual:** static plants and seed rows. Pleasant but inert.
- **Redesign, "Seed Detective":**
  - Each case has hidden genotypes for 2–3 genes, possibly linked or X-linked.
  - Every cross costs a season and money.
  - Offspring arrive as a live, growing count, and the player must decide when the evidence is enough (a χ²/likelihood meter fills as they watch).
  - Escalation: dominance → incomplete dominance → two genes → epistasis (9:7) → sex linkage.
  - Visual hook: Punnett squares that assemble themselves from the flowers.

### The Scribe
- **What the player does:** a timed typing game, tapping the complementary base. A wrong tap becomes a substitution and a timeout becomes a deletion. The protein is then classified as silent, missense, nonsense or frameshift.
- **Science:**
  - "Slipping when slow" misrepresents polymerase slippage, which depends on sequence (repeats, homopolymer runs), not time pressure.
  - "Works if ≤1 missense" is arbitrary.
  - Mutation is framed only as an error to avoid. The game never conveys mutation's randomness relative to need, per-genome rates, the distribution of fitness effects (DFE), the speed–accuracy trade-off in proofreading, or transitions vs transversions.
- **Fun:** a typing test. Success means making *no* mutations, so the biology only appears when the player fails.
- **Redesign, "Fidelity":**
  - The player tunes polymerase speed against proofreading.
  - Each mutation flows into a population of cells where the DFE plays out: most errors do nothing, some kill the cell, and roughly one in a thousand wins.
  - Escalation: a mutator strain under stress hitchhikes with a beneficial mutation.
  - Visual: a branching cell lineage coloured by fitness effect.

### Crossing Over
- **What the player does:**
  - L1: place crossovers to build the best gamete.
  - L2: drag genes into the order implied by recombination fractions.
  - L3: pick a rare recombinant crop that has shed a bad linked gene (linkage drag).
- **Science:** sound, with two issues.
  - L1 implies the cell *chooses* where crossovers go; it should stress that crossovers fall at random.
  - Missing: map distance stops being additive at large distances (Haldane mapping function), interference, chiasmata being required for segregation, and population-level linkage disequilibrium.
- **Fun:** three unrelated mini-tasks. L2 is a paper exercise; L3 is the best idea.
- **Redesign, "Introgression Breeder":**
  - Backcross a resistance gene from a wild relative into an elite crop.
  - Crossovers land at random. The player screens seedlings with affordable markers, and wild DNA visibly shrinks around the target gene.
  - Mapping comes for free, because good screening requires knowing which markers sit near the target.

### The Census
- **What the player does:** samples snails 20 at a time and judges heterozygotes as too few, as expected, or too many. L2 lets the player sample by stratum and diagnose inbreeding, a Wahlund effect or heterozygote advantage.
- **Science:** the best science in this slice. Gaps:
  - Drift, migration and assortative mating are not offered as causes.
  - The key point is never stated: *allele frequencies can change while HW proportions still hold*, so passing an HWE test does not mean "no evolution".
  - There is no sense of statistical power.
- **Fun:** clicking buttons and reading a stats line.
- **Redesign, "Field Geneticist":**
  - The player drags a quadrat over a living map of snail colonies with hidden structure (a river, an inbred valley).
  - Expected and observed bars update live.
  - The player explains each deviation by marking it on the map (for example, drawing the boundary for a Wahlund effect).

### The Coalescent
- **What the player does:** predicts with a slider when lineages meet, then watches the trace. L3 labels tree shapes with demographic histories.
- **Science:**
  - The numbers are right: a pair coalesces in about N generations (haploid units), and a whole sample in about 2N(1−1/n).
  - Missing: mutations on branches as the observable (segregating sites, SFS, Tajima's D), and sweeps that also produce star-like trees (a confound worth teaching).
- **Fun:** guess a number, then watch an animation.
- **Redesign, "Who's Your Daddy":**
  - A Wright–Fisher grid runs forward.
  - The player *drags* a present-day individual's lineage back through its parents, and lineages snap together where they merge.
  - Then mutations are dropped on the branches, and the player infers the history from an alignment alone (expansion or bottleneck, sweep or neutral).

---

## II. CHANCE

### Drift Casino
- **What the player does:** bets chips on 30-generation bead-jar resampling runs. Twists add selection and a disaster.
- **Science:** good, including the croupier's two misconceptions. Missing:
  - fixation probability equals starting frequency
  - mean time to fixation is about 4Ne generations
  - a beneficial allele fixes with probability of only about 2s
  - Ne vs census N
- **Fun:** betting is a strong frame, but nothing happens between bets.
- **Redesign:**
  - Let the player *shape the odds*: buy a bottleneck, set jar size, add migration.
  - Add "longshot" bets on a new beneficial mutation fixing.
  - Show a fan of trajectories, like a Galton board.

### The Castaways
- **What the player does:** L1 picks a storm size and taps to found islands. L2 is Isle Royale wolves with a "Bring a migrant" button.
- **Science:** correct. Missing:
  - heterozygosity loss of about 1/(2N) per generation
  - the one-migrant-per-generation rule
  - purging
  - outbreeding depression
  - the founder-speciation debate
- **Fun:** one tap, then waiting.
- **Redesign, "Conservation Manager":**
  - A 5-island metapopulation runs over 100 generations.
  - Each island shows a heterozygosity health bar and F.
  - Translocations cost budget and carry disease risk.
  - Escalation: climate shocks, an outbreeding-depression trap, and genetic rescue that overshoots (one Isle Royale migrant's genes swept the pack).

### Why Sex?
- **What the player does:** chooses asexual or sexual reproduction for each block of 5 generations. L1 is Muller's ratchet. L2 combines two beneficial mutations before a "parasite" arrives.
- **Science, significant problems:**
  - The player switches the *whole population's* mode. The real puzzle is why an asexual *mutant* fails to invade a sexual population despite the twofold advantage. The game hides that, and turns it into a group choice.
  - The cost of sex is reduced to "half the births". It should be the cost of males, or of meiosis.
  - L2 is labelled as a parasite level but models Fisher–Muller, not Red Queen host–parasite coevolution.
  - Missing: Hill–Robertson interference, Kondrashov's deterministic mutation hypothesis, *Potamopyrgus* evidence, and asexual lineages as young twigs on the tree.
- **Fun:** a two-button toggle and a meter.
- **Redesign, "Invasion":**
  - The player is an asexual clone invading a sexual pond and wins at first, doubling every generation.
  - Then the ratchet clicks: the mutation-free class visibly empties.
  - Parasites lock onto the clone's single genotype while sexual hosts reshuffle away.
  - Each level tests one hypothesis (ratchet, Red Queen, Fisher–Muller).

---

## III. SELECTION

### The Lichen Wood (favourite)
- **What the player does:** a bird tapping visible moths on bark against a 12-second clock. Survivors breed, with polygenic tone, hue and mottling.
- **Science:** good. It teaches R = h²S, realised heritability and environmental variance. Two issues:
  - It cites Bond & Kamil's *apostatic* selection, but the model has a single target and simply converges, so the cited result is not reproduced.
  - Selection intensity is unrealistically high (about half eaten each generation). Say so.
- **Why it works:** the player is the selective agent, the feedback is visible each morning, and the results feel earned.
- **Visual:** procedural bark and moth sprites are the strongest art in the game.
- **Tweaks:**
  - Add two bark types so a polymorphism can evolve.
  - Give the player a search image that decays, so apostatic selection *emerges*.
  - Vary h² by level, so low heritability feels sticky.

### The Black Country (favourite)
- **What the player does:** the same hunt. Soot darkens the bark, the dominant *carbonaria* allele rises, then the Clean Air Act reverses it.
- **Science:** accurate (the *cortex* TE insertion around 1819; van't Hof et al. 2016; Cook et al. 2012). Missing:
  - the asymmetry between dominant and recessive alleles: a dominant allele rises fast when rare but slows near fixation, while a recessive allele responds slowly when rare
  - the lag in the decline
  - migration from cleaner woods
- **Visual:** the soot crossfade is excellent.
- **Tweak:** add a "Kettlewell 1950s" mark–release–recapture mode, to teach how the evidence was gathered and why it was disputed (and later vindicated by Majerus).

### The Fancier
- **What the player does:** taps 6 of 24 birds to breed. L2 is Belyaev's foxes, with correlated traits arising through a shared genetic factor.
- **Science:** Missing:
  - the selection plateau
  - inbreeding from only 6 breeders
  - trade-offs, such as fancy-breed health problems
  - naming the neural-crest hypothesis
- **Fun:** "pick the biggest". There is no tension.
- **Redesign, "Show Ring":**
  - The judge's brief changes each round.
  - A pedigree shows F accumulating.
  - Hidden pleiotropic costs appear.
  - Two breeders give a fast response but crash fertility; twelve are slow but sustainable.

### The Sieve
- **What the player does:** draws a survival curve over finches arranged by beak depth. Missions are directional, stabilising and disruptive selection.
- **Science:**
  - Disruptive selection widens variance only with high h² and/or assortative mating; under random mating the gain mostly collapses each generation. Make that explicit.
  - Missing: Lande–Arnold gradients.
  - The player draws fitness directly instead of letting it emerge from ecology.
- **Fun:** drawing is a good verb, but the player is drawing the answer.
- **Redesign, "Seed Rain":**
  - The player controls the *environment* (hard and soft seeds, drought and rain).
  - The fitness function emerges and is plotted afterwards.
  - Challenge: produce a target selection shape using only ecology.

### Bitter Wings (favourite)
- **What the player does:** hunts palewings among 8 toxic bitterwings. Eating a bitterwing costs 3 seconds. Palewings evolve towards red and black.
- **Science:** good Batesian mimicry, driven by the player's learned avoidance. Problems:
  - The negative frequency dependence it claims is *not enforced*: the models are fixed and the player's memory never fades.
  - Missing: Müllerian mimicry, imperfect mimicry, and the problem of how aposematism originates when its first carriers are rare.
- **Why it works:** the bitter mouthful is a felt cost, so the player's hesitation is real.
- **Tweaks:**
  - As mimics become common, the signal should degrade and the player's avoidance should weaken, so that mimicry collapses (frequency dependence *felt*).
  - Add a Müllerian convergence level.

### The Landscape
- **What the player does:** L1: tap fitter neighbouring genotypes on a hypercube, with up to 5 reveals. L2: classify gene pairs by their epistasis value ε (a quiz).
- **Science:**
  - The player *chooses* among uphill steps. Real adaptive walks are stochastic, with fixation probability roughly proportional to effect size, and reveals give a foresight that evolution doesn't have.
  - Missing:
    - how peaks get crossed: drift in small populations, double mutants, neutral networks
    - sign epistasis and reciprocal sign epistasis as the cause of multiple peaks
    - empirical landscapes (Weinreich et al. 2006, β-lactamase)
- **Redesign, "Valley Crossing":**
  - A 3D terrain with a *population cloud* on it.
  - The player controls N, μ and environmental shifts.
  - A large population climbs reliably but gets stuck on a local peak; a small one drifts across valleys.
  - Final level: Weinreich's real five-mutation landscape.

---

## IV. GAMES ANIMALS PLAY

### Left Jaw, Right Jaw (favourite)
- **What the player does:** the player is the prey and taps left or right to guard a flank. The left/right ratio updates each season.
- **Science:** a good negative frequency-dependent loop. Caveat: the genetics of jaw laterality are doubtful (Raffini & Meyer 2019 point to a large plastic or behavioural component). Say so plainly.
- **Why it works:** a reflex game where adaptation emerges from the player. Weakness: 60 identical taps with no build-up.
- **Tweaks:**
  - Manage several prey fish at once, so attention becomes the scarce resource.
  - Plot the oscillation live behind the play.
  - Final level: a second polymorphic predator, creating a rock–paper–scissors dynamic.

### Hawks and Doves (favourite)
- **What the player does:** picks Hawk or Dove for each contest. L2 has V > C; L3 adds Bourgeois.
- **Science:** payoffs, the V/C equilibrium and Bourgeois are all correct. Problems:
  - **Key flaw: the player's choices have no effect on the population.** Each round is just "compute the expected payoff and press it".
  - It does not distinguish a mixed ESS from a stable polymorphism of pure strategies.
  - There is no invasion test, which is the actual definition of an ESS.
- **Redesign, "Invader":**
  - The player designs a strategy (a probability of playing Hawk, or a conditional rule) and drops mutants into a resident population.
  - The tournament plays out visibly on a beach of crabs fighting over shells.
  - Later levels add asymmetries, Retaliator/assessment and resource-holding power.

### Blood Debts
- **What the player does:** one bat in a roost of 8 decides whether to share or refuse. Opponents follow fixed strategies with memory. L2 adds noise.
- **Science:**
  - Wilkinson 1984 also found kinship effects.
  - Carter's later work favours social bonds and "insurance networks" over strict tit-for-tat.
  - Missing: the iterated Prisoner's Dilemma structure (the shadow of the future), Axelrod's tournament, partner choice, and why reciprocity is rare in nature.
- **Redesign:**
  - Readable faces and relationship threads that thicken over time.
  - Grooming to build bonds, with kin present in the roost.
  - Final level: the player *writes* a strategy and enters an Axelrod-style tournament.

---

## Missing from Sections I–IV, with game pitches
1. **Mutation–selection balance and genetic load.** *"Leaky Bucket":* q̂ ≈ u/s for a dominant deleterious allele, and q̂ ≈ √(u/s) for a recessive one.
2. **Heterozygote advantage (sickle cell).** *"Malaria Belt":* paint malaria onto a map and watch HbS track it.
3. **Meiotic drive.** Partially covered by The Selfish Spindle; cross-reference it.
4. **Gene flow vs selection, and clines.** *"Migration Line":* cline width scales as ∝ σ/√s, and local adaptation is swamped above a threshold.
5. **Price equation and Fisher's fundamental theorem.** *"Partition"* (The Commons partly covers this).
6. **Effective population size.** *"Ne Detective":* skewed sex ratios, fluctuating population size, variance in reproductive success.
7. **Rock–paper–scissors.** *"Throat Colors":* Sinervo's side-blotched lizards.
8. **Clonal interference and diminishing returns.** *"Lenski Flask"*.
9. **Assortative mating vs inbreeding**, and how each differs from drift.
10. **Polygenic architecture and GWAS.** *"Many Small Genes"*.

## Recommendations across chapters
- Turn quizzes into systems: Census L2, Landscape L2, Coalescent L3, Cross L2 and the "name what changed" step in Fancier L2.
- Put the player inside the selective process. The hunt template works: apply it to Sieve, Hawks and Why Sex?.
- Escalate within each chapter, ending with a "boss" scenario that inverts the lesson (for example, Bitter Wings ending in mimicry collapse).
- The menu chapters (Sex, Census, Landscape, Coalescent, Fancier, Hawks) need living animated scenes, not a HUD plus a histogram.
