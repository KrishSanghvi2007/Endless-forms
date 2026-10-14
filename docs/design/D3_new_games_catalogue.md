# D3. New games catalogue

*Designer D3. Follows D0 (binding) and D2's placements: D3 designs new and rebuilt games, D2 places them, D1 owns the favourites, the template and Hunt, and D4 owns the look. Sources: R1–R8, the R7 fact-checks (which win), design history 01–02, sweep logs G1–G7, and the `Gen` and Hunt code.*

---

## 0. Summary

- **33 new games** in 16 curriculum areas (8 P0, 18 P1, 7 P2), listed in section 2 and specified in section 3.
- **Further must-haves become levels** of existing or rebuilt units, so nothing duplicates a chapter (section 4).
- **The player's role.** The selective force, the environment, the mutational lottery or a budgeted researcher; never an organism setting its own trait. Behaving-animal games (Skaters, Hive) end with an invasion view.
- **Engine.** Five `Gen` extensions and five shared widgets carry most games (section 5).

---

## 1. Rules every entry follows

1. **D1's template applies to every game:**
   - three to five levels and an inverting boss;
   - a prediction gesture scored by distance;
   - distributions animated on the canvas;
   - "Interesting result" failures;
   - a MODEL panel;
   - a "What if?" rerun, a sandbox lever, an oracle test and a keyboard path.
2. **D0's text budget:** first action within 10 s, after at most 40 words; picture before number; no star for a click.
3. **Honesty:** ×N tags, "history compressed", real data kept in the Archive, Contested badges with no star for a side.
4. **Science gate.** Coordinator A checks every game before build. *Verify* flags a claim that still needs a primary source.
5. **Size key** (one `v2/*.js` file; today's two-chapter `ch13.js` is 23 KB): **S** 15–25 KB with existing engines only; **M** 25–45 KB plus one widget or `Gen` extension; **L** over 45 KB plus a new module.

---

## 2. Catalogue at a glance

Acts are D2's; "prop." marks units D2 has not yet placed. Waves follow D2 §16.

| # | Title | P | Size | Act | Wave |
|---|---|---|---|---|---|
| 1 | The Scribe (rebuild) | P0 | M | 2 | A |
| 2 | The Royal Line | P0 | M | 2 | A |
| 3 | The Leaky Tap | P0 | S | 4 | A |
| 4 | Malaria Coast | P0 | M | 4 | A |
| 5 | Gene Swamping | P0 | M | 4 | A |
| 6 | Lottery of the New | P1 | S | 4 | A |
| 7 | Tangled Pairs | P1 | M | 4 prop. | A |
| 8 | The Ellipse | P1 | M | 5 prop. | A |
| 9 | Silent Letters | P1 | M | 9 prop. | C |
| 10 | The Manhattan Hunt | P2 | M | 9 side | C |
| 11 | Song School | P2 | S | 6 side | B |
| 12 | The Skaters | P1 | M | 7 prop. | B |
| 13 | The Warm Nest | P1 | M | 7 side | B |
| 14 | The Cleaning Station | P1 | M | 8 prop. | B |
| 15 | The Hive | P1 | M | 8 | B |
| 16 | Red Fire | P2 | S | 8 side | B |
| 17 | The Placenta | P2 | S | 8 side | B |
| 18 | The Selection Shadow | P1 | M | 6 (Slow Island) | B |
| 19 | The Tumour | P1 | M | 11 | C |
| 20 | The Toolkit | P2 | M | 9 side | C |
| 21 | Islands of Divergence | P1 | M | 10 prop. | C |
| 22 | The Dig | P0 | M | 1 | A |
| 23 | Extinction Roulette | P0 | M | 10 | C |
| 24 | Pseudoreplication Trap | P1 | M | 10 | C |
| 25 | The Drunkard's Walk | P1 | S | 10 prop. | C |
| 26 | Drifting Continents | P2 | M | 10 side | C |
| 27 | Out of Africa | P0 | L | 11★ | C |
| 28 | Human Variation | P1 | M | 11 gated | C |
| 29 | The Refuge | P1 | M | 11 prop. | C |
| 30 | The Harvest | P1 | M | 11 prop. | C |
| 31 | The Race | P1 | M | 11 prop. | C |
| 32 | Twelve Flasks | P1 | M | 5 prop. | A |
| 33 | The First Pond | P2 | M | 8 side | C |

The twelve proposed core units add about three hours; if D2 caps the core near 15 hours, 25, 30 and 31 become side quests first.

---

## 3. The catalogue

### 3.1 Population genetics and mutation

#### 1. The Scribe (rebuild of `scribe`)
**P0 · M · Act 2★.** Replaces the typing test.
- **Concept.** Mutation is blind to need. The distribution of fitness effects (DFE) is mostly neutral or harmful, with rare winners. Sources are copying errors, damage and faulty repair. *Confronts* misconceptions 5 and 16.
- **Role.** The keeper of a lab bench: grows lines, adds phage, presses velvet. The player never places a mutation.
- **Loop.**
  - *L1.* Mutations land at random on a gene "necklace" on each dividing cell. The player follows lineages, and their fates fill a DFE histogram whose shape the player predicted beforehand.
  - *L2 (Luria–Delbrück).* Twenty tubes meet phage at a time the player picks. Jackpot plates refute induced resistance, which would give Poisson counts. The player estimates μ from the share of empty plates.
  - *L3 (replica plating).* Resistant colonies sit at the same spots on every drug plate. *Twist:* Lederberg's indirect selection builds a resistant line whose ancestors never met the drug.
  - *Boss.* The food changes. A mutation that was neutral in L1 now wins; the mutation rate has not changed.
- **Picture.** Necklace beads coloured by source; glowing jackpots; velvet stamping identical dot patterns.
- **Graph.** The player's DFE against the literature's (ghost); colony counts against a Poisson ghost.
- **Case.** Luria & Delbrück 1943; Lederberg & Lederberg 1952; VSV single mutants about 40% lethal, 30% deleterious, 27% neutral (Sanjuán et al. 2004, *verify*); beneficial fraction 10⁻²–10⁻⁵ (Eyre-Walker & Keightley 2007), so the game uses 10⁻³ and tags higher rates ×N; Gao et al. 2019.
- **Model.** Mutation probability U per division; effects lethal, neutral, deleterious s ~ Gamma(0.3) or beneficial s ~ Exp(0.02); μ̂ = −ln p₀ / N_t. *Oracle:* variance/mean ≈ 1 if resistance were induced, ≫ 1 when it is pre-existing.

#### 2. The Royal Line
**P0 · M · Act 2.** Follows the Mixer's X-linked boss round.
- **Concept.** X-linkage and why it misses Hardy–Weinberg in one generation. *Confronts* "HW in one generation, always" and "sex-linked means only males".
- **Role.** Morgan's fly-room breeder, then the environment, then a counsellor.
- **Loop.**
  - *L1.* Reciprocal crosses with Morgan's white-eyed male. The player places predicted eye-colour bars per sex before hatching.
  - *L2 (The Spiral).* Carrier females meet normal males. On the triangle HUD, the male dot jumps to the female's old value each generation; the gap halves and flips, so the dots spiral in. The player taps the next position. An autosomal control jumps in one step.
  - *L3.* The player turns up the light, in which white-eyed males court poorly. The allele lingers, because two-thirds of copies hide in females. Male incidence settles at 3μ/s, Haldane's 1935 route to a human mutation rate.
  - *Boss.* Carriers of haemophilia B in Queen Victoria's pedigree, called with confidence and Brier-scored. A mother of three unaffected sons is less likely a carrier.
  - *Transfer.* About 8% of men have colour-vision deficiency; the player predicts women's share as q² (≈0.6%; observed ≈0.5%).
- **Picture.** Large-eyed flies; the X as a glowing rod handed down the pedigree.
- **Graph.** p_f and p_m as a damped zigzag against an autosomal ghost.
- **Case.** Morgan 1910; Rogaev et al. 2009 (haemophilia B in the Romanovs); Haldane 1935.
- **Model.** p_m′ = p_f; p_f′ = (p_f + p_m)/2; p̄ = (2p_f + p_m)/3 is invariant. *Oracle:* the gap ratio is −½ per generation.

#### 3. The Leaky Tap
**P0 · S · Act 4.** Replaces Equilibrium L10.
- **Concept.** Mutation–selection balance and genetic load. *Confronts* "selection removes harmful alleles" and "medicine will soon wreck the gene pool".
- **Role.** The environment sets the drain (removal of affected beetles) and the mutagen tap (μ, ×N).
- **Loop.**
  - *L1.* Drips turn random wing cases yellow. For a dominant allele, the player holds q in a band, finding q̂ ≈ μ/(hs) after a ghost prediction.
  - *L2.* Made recessive, the same allele rises about 300-fold (√(μ/s) against μ/s at μ = 10⁻⁵, s = 1). The genotype lens shows carriers filling a submerged tank.
  - *L3.* Treatment sets s ≈ 0. The player predicts when q doubles: it rises by about μ a generation, which the years counter shows as millennia.
  - *Twist.* Load is μ (recessive) or about 2μ (dominant) whatever s is.
  - *Boss.* Cystic fibrosis (q ≈ 0.02) cannot be reached with realistic μ and s ≈ 1, and one old allele, ΔF508, makes up about 70% of European CF alleles. The Interesting result offers past heterozygote advantage and founder drift (Contested).
- **Picture.** A tap, a drain and a submerged carrier tank behind a wall.
- **Graph.** q(t) against an equilibrium ghost; log bars for μ/s and √(μ/s).
- **Case.** About 80% of achondroplasia cases are new FGFR3 G380R mutations, at a rate of order 10⁻⁵ (Bellus et al. 1995). Also PKU (q ≈ 0.01) and Haldane 1937.
- **Model.** Fitnesses 1, 1−hs and 1−s, plus mutation μ(1−q). *Oracle:* equilibria within 10% of the formulas.

#### 4. Malaria Coast
**P0 · M · Act 4.**
- **Concept.** Heterozygote advantage, G×E, and HW as a null model. *Confronts* misconception 11 ("p is still, so nothing is selected") and "harmful alleles are on their way out".
- **Role.** The environment paints malaria (swamps, rain, irrigation) along a coast, later drains it.
- **Loop.**
  - *L1.* In one village the player drags a predicted q̂, then sets malaria. Children die by genotype. The newborn dot sits on the HW curve and the adult dot above it.
  - *L2.* Across ten villages, the HbS map follows the malaria the player painted; migration blurs its edges.
  - *L3.* The Census instruments return: newborns fit HW; adults show heterozygote excess.
  - *Twist.* HbC protects mainly as CC, so while rare it is nearly invisible to selection. HbS holds the coast for centuries.
  - *Boss.* The player drains the swamp and predicts the decline. HbS falls ever more slowly (Δq ≈ −tq²).
- **Picture.** Mosquitoes rising from painted swamps; a red-cell inset that sickles. Villages are abstract, with no ethnic labels.
- **Graph.** The q map over the malaria map; triangle dots; q(t) against an s/(s+t) ghost.
- **Case.** Allison 1954; Piel et al. 2010 (local HbS frequencies above 0.15, *verify*); Williams et al. 2005 (HbAS about 90% protective against severe malaria, *verify*); Modiano et al. 2001 (risk down about 29% in AC, 93% in CC). Equilibrium's unsourced counts are not reused.
- **Model.** AA 1−s(x), AS 1, SS 1−t; q̂ = s/(s+t); A/S/C alleles; migration m. *Oracle:* q̂; newborns pass χ².

#### 5. Gene Swamping
**P0 · M · Act 4.** Replaces Equilibrium L11.
- **Concept.** Migration against selection, clines, F_ST. *Confronts* misconception 8 and "gene flow always helps".
- **Role.** The environment builds ferries (m), lays lava (selection) and sets the wind (σ).
- **Loop.**
  - *L1.* A lava isle and a sand isle share one ferry. The player predicts the threshold; local adaptation collapses near m ≈ s.
  - *L2.* A coastal cline. The player measures its width with a caliper, then predicts it after doubling bird pressure or halving σ. *Twist:* wind pushes the cline downwind.
  - *L3.* Five islands with a live F_ST bar and ancestry bars.
  - *Boss.* Keep five islands polymorphic and locally adapted for 100 generations with two ferries. Nm ≈ 1 limits drift but does not protect adaptation, so the ferries must link similar habitats.
- **Picture.** Beetles on black lava and pale sand; laden ferries; wind arrows.
- **Graph.** The cline against a σ/√s ghost; F_ST against 1/(1+4Nm).
- **Case.** Lake Erie water snakes keep banding through mainland gene flow (King & Lawson 1995); copper-tolerant *Agrostis* at mine edges (McNeilly 1968).
- **Model.** q′ = (1−m)q_sel + m·q_mig; swamping at m ≳ s (Haldane 1930); cline width ≈ c·σ/√s; F_ST = Var(p)/p̄q̄. *Oracle:* width scales as σ/√s.

#### 6. Lottery of the New
**P1 · S · Act 4.**
- **Concept.** A new beneficial copy fixes with probability ≈ 2s (2hs; ×Ne/N); Haldane's sieve; |Ne·s| ≈ 1 marks the nearly neutral class. *Confronts* "better mutations spread".
- **Role.** The mutational lottery and the island keeper: the player releases copies and sets Ne, but never picks the winners.
- **Loop.**
  - *L1.* A hundred copies with s = 0.02 rise as sparks. The player dials how many will fix: about four.
  - *L2.* Dominant copies (h = 0.9) establish about nine times as often as recessive ones (h = 0.1). *Twist:* from standing variation the sieve weakens (Orr & Betancourt 2001).
  - *L3.* At s = −0.002, Ne = 50 fixes the allele about as often as a neutral one; Ne = 5,000 almost never does. The player places the boundary.
  - *Boss.* Predict which of two islands accumulates more slightly harmful substitutions: the small one.
- **Picture.** Each copy a rising spark; lost ones fizzle; pin one to follow it.
- **Graph.** P(fix) against Ne·s, with the Kimura curve, the 1/2N line and the player's dots.
- **Case.** Haldane 1927; Kimura 1962; Ohta 1973; Turner 1977.
- **Model.** u = (1−e^(−4Nₑsp))/(1−e^(−4Nₑs)). *Oracle:* 2s over 10,000 seeds.

#### 7. Tangled Pairs
**P1 · M · Act 4, proposed after Gene Swamping.**
- **Concept.** Linkage disequilibrium (D, r²), its decay at (1−ρ)^t, hitchhiking, and supergenes. *Confronts* "genes are always inherited independently".
- **Role.** The bird, hunting with a favourite's Hunt loop.
- **Loop.**
  - *L1.* Butterflies carry a forewing band and a hindwing ray at two loci. The player's bird has learned two noxious models, so recombinants look edible. A ferry brings the other mimicry race, and LD jumps. The player predicts D five generations on with the bird off.
  - *L2.* Eating holds the combinations at ρ = 0.01 but not at ρ = 0.5.
  - *L3.* A neutral marker hitchhikes.
  - *Boss.* An inversion spreads because it keeps the good pair together (Kirkpatrick & Barton 2006): a supergene.
- **Picture.** Chromosome strips under the butterflies, with an inversion bracket.
- **Graph.** D against a (1−ρ)^t ghost; a 2×2 haplotype grid.
- **Case.** *Heliconius numata* P (Joron et al. 2011).
- **Model.** Two-locus haplotypes with selection through Hunt detection. *Oracle:* free decay matches (1−ρ)^t.

### 3.2 Quantitative genetics

#### 8. The Ellipse
**P1 · M · Act 5, proposed after Seed Rain.**
- **Concept.** Δz̄ = Gβ, Lande–Arnold gradients and lines of least resistance. *Confronts* "selection on one trait moves only that trait".
- **Role.** The environment sets seed size, seed hardness and predators.
- **Loop.** The field is a trait plane in which birds stand at their beak depth and width.
  - *L1.* Uncorrelated traits: the β arrow (from survivors) and the response arrow line up.
  - *L2.* The G ellipse tilts, and selection on depth drags width along. The player draws the response before breeding.
  - *L3.* The target lies off the long axis, so the player must aim selection away from it for Gβ to hit.
  - *Twist.* With antagonistic correlation, a large S yields almost nothing (Etterson & Shaw 2001).
  - *Boss.* G evolves, and the cloud travels along g_max (Schluter 1996).
- **Picture and graph.** Beaks drawn to scale crack visible seeds; the trait plane shows the G ellipse, β and the response arrow, predicted against realised.
- **Case.** Lande & Arnold 1983; Grant & Grant 1995.
- **Model.** Pleiotropic additive loci, so G emerges; β = P⁻¹S. *Oracle:* the one-generation response matches Gβ.

### 3.3 Molecular evolution and genomics

#### 9. Silent Letters
**P1 · M · Act 9, proposed before The Clock.**
- **Concept.**
  - Neutral substitution rate = μ, whatever N.
  - dN/dS separates purifying from positive selection.
  - Small Ne admits slightly harmful changes.
  - *Confronts* misconception 8.
- **Role.** The environment, here the protein's job; mutations rain at random.
- **Loop.**
  - *L1.* A big and a small population race substitution counters. The player predicts a leader; they tie, because more mutations arise in the big population but fewer fix.
  - *L2.* The player assigns regions as active site, surface or switched off (a pseudogene). The dN/dS meter reads about 0.01, 0.3 and 1.
  - *L3.* A virus arrives. A few contact sites exceed 1, and the player finds them on a budget. *Twist:* the gene-wide average stays below 1.
  - *Boss.* A small-Ne lineage shows a higher dN/dS (Lottery L3).
- **Picture.** Codon tiles pop pale (synonymous) or bold (nonsynonymous); the protein ribbon twitches.
- **Graph.** Cumulative dN and dS; per-site dN/dS along the gene.
- **Case.** Kimura 1968; Li, Gojobori & Nei 1981; Hughes & Nei 1988 (MHC); Sawyer et al. 2005 (TRIM5α); Popadin et al. 2007.
- **Model.** Codons with κ = 2 and Kimura fixation; Nei–Gojobori counting. *Oracle:* the neutral rate equals μ across N.

#### 10. The Manhattan Hunt
**P2 · M · Act 9 side quest** (D2's GWAS hunt).
- **Concept.** Polygenic traits, GWAS power, stratification and portability. *Confronts* "a gene for height".
- **Role.** A geneticist with a sampling budget.
- **Loop.**
  - *L1.* One Mendelian peak.
  - *L2.* A trait built from 2,000 tiny effects stays flat at n = 2,000; buying samples raises the skyline.
  - *L3.* A false peak caused by stratification ("chopsticks") is removed with principal components.
  - *Boss.* A score built in sample A fails in sample B.
- **Picture, graph, model.** A skyline rising as samples arrive; Manhattan plot and variance explained against n; y = Σβg + e with β ~ N(0, h²/M), tests at 5×10⁻⁸.
- **Case.** Yengo et al. 2022 (about 12,000 SNPs explain 40–45% of height variance in European-ancestry samples); Hamer & Sirota 2000; Berg et al. 2019; Martin et al. 2019.
- **Framing.** As for Human Variation (section 6, Q3).

### 3.4 Behaviour and cultural evolution

Behaviour is already well covered; its gaps are culture and the rock–paper–scissors boss (section 4).

#### 11. Song School
**P2 · S · Act 6 side quest.**
- **Concept.** Cultural evolution: copying error, dialect drift, conformity. *Confronts* "inherited behaviour is genetic".
- **Role.** The environment: city noise and forest.
- **Loop.**
  - *L1.* The player predicts where a dialect border will settle.
  - *L2.* Noise masks low notes, so higher songs are copied more.
  - *L3.* The conformity bias decides whether a new ending dies or sweeps.
  - *Boss.* A gene with the same advantage would need millennia to cross a continent; the song takes about 20 years.
- **Picture, graph, model.** Singing birds on a dialect map; share of each variant over time; agents copy within a radius, with error rate e and a conformity exponent.
- **Case.** Marler & Tamura 1964; Slabbekoorn & Peet 2003; Otter et al. 2020.

### 3.5 Sex and sexual selection

#### 12. The Skaters
**P1 · M · Act 7, proposed.**
- **Concept.** Sexual conflict: an interlocus arms race, its population cost, and intralocus conflict. *Confronts* misconception 9.
- **Role.** A female water strider, then the invasion view, then the environment (the mating system).
- **Loop.**
  - *L1.* The player skates to food and shakes off lunging males. Struggling costs time; so does accepting.
  - *L2.* In the invasion view, clasper and spine alleles escalate while the mating rate stays flat, because relative armament decides contests. The player predicts it first.
  - *L3.* A clasping allele lowers daughters' fecundity and gathers on the X.
  - *Boss.* Enforced monogamy: harm and resistance fall, and the population grows.
- **Picture.** Surface dimples and their shadows; claspers and spines in a zoom inset.
- **Graph.** Male persistence against female resistance as a path.
- **Case.** Arnqvist & Rowe 2002 (15 *Gerris* species); Holland & Rice 1999; Chippindale et al. 2001.
- **Model.** P(mate) = logistic(x − y); under monogamy, male fitness = his mate's fecundity. *Oracle:* x and y fall under monogamy.

#### 13. The Warm Nest
**P1 · M · Act 7 side quest.**
- **Concept.** Temperature-dependent sex determination (TSD), Fisherian balance, Charnov–Bull, climate risk. *Confronts* "sex is always chromosomal".
- **Role.** The climate and the beach.
- **Loop.**
  - *L1.* Shade and sun set hatchling sex (pivotal temperature about 29 °C).
  - *L2.* Rare males are worth more, so heritable shade-nesting spreads. The heritability of pivotal temperature is Contested.
  - *L3.* In a lizard whose warm-born males do better, TSD wins (Warner & Shine 2008).
  - *Boss.* Warming makes hatchlings 99% female, and the player's tools buy only time. *Twist:* heat feminises ZZ dragons, and the W can vanish in a generation (Holleley et al. 2015).
- **Picture and graph.** A beach cross-section with nests glowing by temperature; sex ratio against temperature, and cohort ratio against a 1:1 ghost.
- **Case.** Jensen et al. 2018; Charnov & Bull 1977.
- **Model.** P(female) = logistic((T − T_piv)/w); offspring value ∝ 1/(share of its sex).

### 3.6 Social evolution

#### 14. The Cleaning Station
**P1 · M · Act 8, proposed.**
- **Concept.** Cooperation beyond kin and reciprocity: partner choice, reputation, punishment, assortment (West, Griffin & Gardner 2007). *Confronts* misconception 9 and "cooperation means altruism".
- **Role.** A client fish whose choices select cleaner strategies; then the environment.
- **Loop.**
  - *L1.* Cheating cleaners bite, costing a jolt and lost time. The player's visits reward honesty, after predicting mean cheating ten generations on.
  - *L2.* Clients watch each other's visits. *Twist:* a rule of cheating only when unobserved spreads.
  - *L3.* Males punish cheating females, and punishment spreads because it raises the punisher's own income.
  - *Boss.* Siderophore producers lose to cheats in shaken broth. In still broth they cluster with kin and win, with Price bars showing between and within. Here cooperation pays relatives, and strong altruism needs that assortment.
- **Picture, graph, model.** A reef with visible parasites and an audience ring; cheating distribution over time, then Price bars; cleaner payoff = parasites eaten + mucus × cheat rate × P(unseen).
- **Case.** Bshary & Schäffer 2002; Bshary & Grutter 2006; Raihani, Grutter & Bshary 2010; Griffin, West & Buckling 2004; Kümmerli et al. 2009.

#### 15. The Hive
**P1 · M · Act 8.**
- **Concept.** Eusociality: queen–worker conflict, policing, monogamy. *Confronts* misconception 10 and "haplodiploidy explains it".
- **Role.** The worker force rears or eats eggs; its rule then competes as an allele.
- **Loop.**
  - *L1.* Eggs carry patriline colours and letters, and a family tree gives relatedness by descent, on average. With a single-mated queen, nephews (0.375) beat brothers (0.25).
  - *L2.* The queen mates ten times. Nephews fall to about 0.15, and policing spreads only above two matings.
  - *L3.* Workers favour 3:1 investment, the queen 1:1. Colonies split by mating number.
  - *Boss.* Diploid termites are eusocial. The tree points to lifetime monogamy.
- **Picture, graph, model.** A comb with patriline-lettered eggs; relatedness bars against mating number; a policing allele invading by haplodiploid inclusive fitness.
- **Case.** Trivers & Hare 1976; Ratnieks 1988; Boomsma & Grafen 1991; Wenseleers & Ratnieks 2006; Hughes et al. 2008.

#### 16. Red Fire
**P2 · S · Act 8 side quest.**
- **Concept.** Greenbeards, and why they are rare.
- **Role.** The workers' rule as the selective force: Gp-9 Bb workers kill BB queens.
- **Loop.** The killing rule spreads. Boss: when recombination separates beard from behaviour, falsebeards dissolve the greenbeard unless both sit in a supergene.
- **Picture and model.** Workers sniffing queens; two loci (beard, behaviour) linked at recombination ρ.
- **Case.** Keller & Ross 1998; Wang et al. 2013.

#### 17. The Placenta
**P2 · S · Act 8 side quest.**
- **Concept.** Imprinting and the kinship theory.
- **Role.** The gene's view, through invasion. The player releases paternal-copy mutants that demand more growth and maternal-copy mutants that demand less, and watches each invade.
- **Loop.** A polyandry dial scales the conflict. Boss: knock out either side. Without Igf2 the pup is about 60% size; without Igf2r it overgrows (*verify*).
- **Contested.** The theory fits Igf2, not every imprinted gene.
- **Picture and model.** A tug-of-war across the placenta; each parental copy's optimal demand set by its relatedness to future siblings.
- **Case.** Haig & Westoby 1989; DeChiara et al. 1990.

### 3.7 Life history

#### 18. The Selection Shadow
**P1 · M · Act 6, inside The Slow Island (D2).**
- **Concept.** The force of selection falls with age; mutation accumulation; antagonistic pleiotropy. *Confronts* misconception 6 and "ageing is wear and tear".
- **Role.** The environment: foxes, islands, hazards aimed at particular ages.
- **Loop.** Mutation cards land at random on an age conveyor.
  - *L1.* Late-acting harm piles up in the shadow. The player predicts the force-of-selection curve before it is drawn from survivorship.
  - *L2.* "Free youth, pay later" cards sweep.
  - *L3.* A fox-free island slows ageing (Austad: about 25% longer life). *Twist:* a hawk that takes only juveniles does not speed ageing.
  - *Boss.* High-predation guppies do not age faster (Reznick et al. 2004; Contested, Abrams 1993).
- **Picture and graph.** Slow Island's grey-furred old animals on the conveyor; Hamilton's s(x) beside mutation load per age.
- **Case.** Medawar 1952; Williams 1957; Hamilton 1966; Jones et al. 2014.
- **Model.** TB's age-structured `count` loci; s(x) ∝ Σ_{y≥x} e^(−ry) l(y) m(y).

### 3.8 Coevolution, disease and medicine

#### 19. The Tumour
**P1 · M · Act 11** (D2's evolutionary-medicine unit).
- **Concept.** Cancer as somatic evolution, competitive release, adaptive therapy, Peto's paradox. *Confronts* misconception 12 and "the strongest dose is best".
- **Role.** The oncologist.
- **Loop.**
  - *L1.* Clones branch within one body, and a biopsy misses some.
  - *L2.* At maximum dose the tumour shrinks, then resistant clones regrow. The player predicts when.
  - *L3.* Threshold dosing keeps sensitive cells suppressing resistant ones (Contested: small pilots).
  - *Boss.* Elephants carry about 20 TP53 copies.
- **Picture.** Hexagonal tissue coloured by clone, with the clone tree beside it.
- **Graph.** Burden by clone, with dose bars.
- **Case.** Gerlinger et al. 2012; Gatenby et al. 2009; Zhang et al. 2017; Abegglen et al. 2015.
- **Model.** Lotka–Volterra competition with a cost of resistance. *Oracle:* threshold dosing beats maximum dose when the cost is above zero.

### 3.9 Evo-devo

#### 20. The Toolkit
**P2 · M · Act 9 side quest.**
- **Concept.** Deep homology and co-option.
- **Role.** An experimenter on the Switches grid.
- **Loop.**
  - *L1.* Mouse Pax6 grows fly eyes in fly discs.
  - *L2.* Distal-less marks legs, tube feet and fins.
  - *L3.* Co-option has pleiotropic costs.
  - *Boss.* Octopus and vertebrate eyes: shared genes, convergent organs.
- **Picture and model.** Imaginal discs sprouting eyes; a gene-to-structure switchboard on Switches' grid.
- **Case.** Halder, Callaerts & Gehring 1995; Panganiban et al. 1997; Shubin, Tabin & Carroll 2009.

### 3.10 Speciation

#### 21. Islands of Divergence
**P1 · M · Act 10, proposed.**
- **Concept.** Speciation genomics: islands under gene flow, recombination, F_ST against d_xy. *Confronts* "an F_ST peak is a speciation gene".
- **Role.** The environment controls valley gene flow and selection on plumage loci.
- **Loop.**
  - *L1.* A genome scan fills in live, with peaks only at the selected loci. The player predicts where.
  - *L2.* A selected locus moved into a recombination cold spot widens its island.
  - *L3.* Cutting gene flow turns islands into continents.
  - *Boss.* A decoy peak from background selection in a cold spot. The player must check d_xy first; false positives cost points.
- **Picture and graph.** Crows across a valley above a chromosome skyline; F_ST and d_xy along the genome.
- **Case.** Poelstra et al. 2014 (crows); Cruickshank & Hahn 2014; Burri et al. 2015.
- **Model.** Two demes with migration m; mapped selected loci; linked `count` loci. *Oracle:* far from selected loci, F_ST ≈ 1/(1+4Nm).

Hybrid speciation and a real radiation go into the Archipelago (section 4).

### 3.11 Macroevolution and phylogenetics

#### 22. The Dig
**P0 · M · Act 1.**
- **Concept.** Fossils, dating, deep time; the hominin bush. *Confronts* misconceptions 13 and 14, and "gaps disprove evolution".
- **Role.** First the environment that makes the record, then a palaeontologist with five field seasons.
- **Loop.**
  - *L1.* The player floods a living lakeside. Only fast-buried, hard-bodied animals in low-oxygen mud fossilise. Uplift and erosion then strip layers, so the record the player made is biased and gappy.
  - *L2.* The player taps zircons in ash beds as parent atoms decay, then gestures the age of a fossil between two beds.
  - *L3.* Given fish at about 385 Myr and tetrapods at about 365 Myr, the player picks 375-Myr river deposits on a geological map: finding Tiktaalik rewards inference.
  - *Boss.* A log-time pinch from 4.0 Gyr to 300 kyr, placing whale and hominin fossils by gesture. *Homo naledi* overlaps early *H. sapiens*, so the ladder becomes a bush. The player's earlier generation counts appear as marks.
- **Picture.** A cliff whose layers the player builds; zircon decay clocks; a log-time ruler.
- **Graph.** A range chart filled by the player's finds.
- **Case.** Daeschler, Shubin & Jenkins 2006; Gingerich et al. 2001; MacFadden 2005; Dirks et al. 2017.
- **Model.** Burial probability as f(sediment, oxygen, hardness); N = N₀e^(−λt). *Oracle:* dates within their confidence intervals.

#### 23. Extinction Roulette
**P0 · M · Act 10.**
- **Concept.** Mass against background extinction, selectivity, recovery, diversification rates. *Confronts* "the unfit go extinct".
- **Role.** The environment as killer: climate, then the asteroid.
- **Loop.**
  - *L1.* A slow shift kills narrow-range specialists, and the trait–survival scatter slopes. The player predicts which traits count.
  - *L2.* After the impact the scatter mostly flattens; survivors are small, burrowing, seed-eating and broad-ranged ("wanted: luck").
  - *L3.* The LTT slope jumps, then slows as niches fill; recovery takes about 10 Myr. *Twist:* Signor–Lipps makes the sudden extinction look gradual.
  - *Boss.* The sixth extinction: about 100 extinctions per million species-years against a background of about 0.1.
- **Picture.** A clade spindle with a roulette wheel at the boundary.
- **Graph.** Diversity through time; trait–survival scatters, background against mass.
- **Case.** Raup 1991; Jablonski 1986; Kirchner & Weil 2000; Signor & Lipps 1982; Pimm et al. 2014.
- **Model.** Birth–death with trait-dependent μ; λ = λ₀(1 − D/K). *Oracle:* the LTT slope is λ − μ.

#### 24. Pseudoreplication Trap
**P1 · M · Act 10.**
- **Concept.** Comparative methods, testing adaptive hypotheses, key innovations. *Confronts* misconception 17 and "species are independent data points".
- **Role.** First evolution on a tree, then a researcher with a budget.
- **Loop.**
  - *L1.* Independent traits evolve on a two-clade tree to r ≈ 0.8: the player has generated a false result.
  - *L2.* Contrasts drawn at the nodes dissolve it.
  - *L3.* Primate testis size against mating system survives contrasts.
  - *L4.* Bought sister-group pairs show plant-feeders richer in 11 of 13.
  - *Boss.* An evidence budget, scored on calibration.
- **Picture, graph, model.** A tree of drawn animals beside the scatter; raw and contrast scatters side by side; Brownian motion with Felsenstein contrasts.
- **Case.** Felsenstein 1985; Harcourt et al. 1981; Mitter, Farrell & Wiegmann 1988; Losos et al. 1998.

#### 25. The Drunkard's Walk
**P1 · S · Act 10, proposed.**
- **Concept.** Passive against driven trends; evolution is not progress. *Confronts* misconception 7.
- **Role.** The environment sets the wall (minimum size) and any hidden selection.
- **Loop.**
  - *L1.* Lineages walk from the wall. The maximum climbs while the mode stays bacterial; the player predicts the histogram first.
  - *L2.* A subclade test separates driven from passive runs.
  - *L3.* Mammal descendants are about 9% larger on average (Alroy 1998).
  - *Boss.* All tips are equally old, and bacteria have run the most generations.
- **Picture, graph, model.** Lineage dots stumbling away from a cliff wall; a histogram with max, mean and mode lines; a reflecting random walk with optional drift.
- **Case.** Stanley 1973; McShea 1994; Gould 1996.

Tree reading is the Act 1 Tree Thinking rebuild (section 4).

### 3.12 Biogeography

#### 26. Drifting Continents
**P2 · M · Act 10 side quest.**
- **Concept.** Vicariance against dispersal.
- **Role.** Plate tectonics and sea level.
- **Loop.**
  - *L1.* Pangaea splits, and the tree splits with it.
  - *L2.* At low sea level Wallace's line holds.
  - *L3.* Panama closes (about 2.8 Ma).
  - *Boss.* The ratite tree is too young for vicariance, and the kiwi's sister is the elephant bird.
- **Picture and model.** Draggable continents with the tree redrawn live; lineages split by connectivity and disperse by distance on dated nodes.
- **Case.** O'Dea et al. 2016; Mitchell et al. 2014.

### 3.13 Human evolution

#### 27. Out of Africa
**P0 · L · Act 11★.**
- **Concept.** Serial founder effects, archaic admixture, dating by LD, introgressed adaptation, convergent lactase persistence. *Confronts* "humans stopped evolving" and "Neanderthals left no descendants".
- **Role.** The environment: corridors (sea level, ice, desert), frontier capacity, later altitude and herding.
- **Loop.**
  - *L1.* Bands bud off carrying jars of 12 allele colours. Colours vanish faster than heterozygosity falls. The player draws the H-against-distance line first; it comes out straight.
  - *L2.* Neanderthal segments enter and recombination chops them. The player dates contact by matching tract lengths.
  - *L3.* Segments near genes are purged (alleles from a small-Ne population). At altitude, Denisovan EPAS1 sweeps.
  - *Boss.* Lactase persistence sweeps twice, through different mutations. Its cause is Contested.
- **Picture.** Campfire bands on a map, and patterned Neanderthal segments. People are drawn without ethnic markers.
- **Graph.** H against distance with Ramachandran's ghost; a tract-length histogram.
- **Case.** Ramachandran et al. 2005; Prüfer et al. 2014 (1.5–2.1%); Sankararaman et al. 2012, 2014; Juric et al. 2016; Huerta-Sánchez et al. 2014; Tishkoff et al. 2007; Evershed et al. 2022.
- **Model.** Founder chain (N_f founders, growth to K); mean tract ≈ 1/(ρt). *Oracle:* the H decline per step.

#### 28. Human Variation
**P1 · M · Act 11, gated on section 6, Q3.**
- **Concept.** Clines, isolation by distance, apportionment. *Confronts* "humans divide into discrete races".
- **Role.** The environment (UV), then a surveyor.
- **Loop.**
  - *L1.* UV drives pigmentation alleles. Light skin arises twice through different loci, and both dark and light alleles are old in Africa.
  - *L2.* Every border the player draws misclassifies most people near it.
  - *L3.* The player's samples show most variation lies within populations, and that many loci together can still identify ancestry. Neither fact implies races.
- **Picture, graph, model.** A continuous map and a border pen; allele frequency against distance; stepping stones with selection proportional to UV.
- **Case.** Lewontin 1972; Rosenberg et al. 2002; Jablonski & Chaplin 2000; Crawford et al. 2017; Edwards 2003.

### 3.14 Applied evolution

#### 29. The Refuge
**P1 · M · Act 11, proposed.**
- **Concept.** Bt resistance; high dose plus refuge; dominance as a lever. *Confronts* misconception 12.
- **Role.** A farm planner paints Bt fields and refuges, using pattern as well as colour.
- **Loop.**
  - *L1.* With all fields Bt, rare recessive R takes over; the player predicts when.
  - *L2.* Refuge moths mate with RR survivors, and their RS offspring die on Bt; the triangle shows it.
  - *L3.* A low dose lets RS survive and the refuges fail. *Twist:* refuges placed too far away also fail.
  - *Boss.* Bt plus sterile releases eradicated US pink bollworm.
- **Picture and graph.** Fields in two patterns under moth clouds; q_R against a no-refuge ghost, with the triangle HUD.
- **Case.** Gould 1998; Tabashnik et al. 2013, 2021.
- **Model.** Fitness on Bt: SS 0, RS h, RR 1; refuge cost c.

#### 30. The Harvest
**P1 · M · Act 11, proposed.**
- **Concept.** Harvest-induced evolution. *Confronts* "evolution is too slow to matter".
- **Role.** The fleet sweeps a net (a Hunt net verb, to D1); then the manager.
- **Loop.**
  - *L1.* The mesh takes the biggest fish, and size and yield fall within four generations. A pinned fish never changes; the school does.
  - *L2.* Quotas and reserves shift maturation. *Twist:* slot limits restore size.
  - *Boss.* In Gorongosa, tusklessness, X-linked and lethal to males, rose from about 18% to about 51% of females under war-time poaching.
- **Picture, graph, model.** A school swept by a net, then elephants carrying X rods; size distribution and yield per generation; additive size and maturation under a harvest function.
- **Case.** Conover & Munch 2002; Olsen et al. 2004; Campbell-Staton et al. 2021.

#### 31. The Race
**P1 · M · Act 11, proposed.**
- **Concept.** Evolutionary rescue, critical rate, lag. *Confronts* misconception 1.
- **Role.** The environment sets how fast conditions worsen; later the player adds corridors.
- **Loop.**
  - *L1.* Yeast in rising salt follow a U-shaped population curve; the player predicts the bottom.
  - *L2.* Faster change outruns adaptation.
  - *L3.* Larger, connected populations are rescued more often.
  - *Boss.* Selection for early laying in great tits grew while laying did not advance. The player diagnoses why.
- **Picture, graph, model.** Flasks with a dipping population bar; N(t) with an extinction line, and the trait chasing a moving optimum; Gaussian fitness around θ(t) = kt.
- **Case.** Gomulkiewicz & Holt 1995; Bell & Gonzalez 2009, 2011; Lynch & Lande 1993; Visser et al. 1998.

### 3.15 Experimental evolution and the nature of science

#### 32. Twelve Flasks
**P1 · M · Act 5, proposed.** D3 recommends splitting D2's Valley Crossing: it keeps landscapes, three N regimes and Weinreich; Twelve Flasks takes Lenski's experiment, the origin of D2's freezer.
- **Concept.** Diminishing returns, clonal interference, parallelism, mutators, contingency. *Confronts* "evolution cannot be observed".
- **Role.** The technician transfers, freezes and thaws, and never chooses mutations.
- **Loop.**
  - *L1.* Daily 1:100 transfers. Rival clones interfere. The player draws the fitness curve; it slows but never stops.
  - *L2.* The same genes are hit in many flasks, and mutators appear (the Scribe's fluctuation test).
  - *L3.* Competition assays with red and white colonies.
  - *Boss.* One flask goes cloudy at about 31,000 generations. Citrate use re-evolves only in replays from clones after about 20,000.
- **Picture and model.** Twelve shaken flasks and a labelled freezer; asexual Wright–Fisher with diminishing-returns benefits, a ×100 mutator, and citrate gated on a potentiating mutation.
- **Graph.** Twelve fitness lines against a power-law ghost.
- **Case.** Lenski et al. 1991; Gerrish & Lenski 1998; Blount et al. 2008; Wiser et al. 2013; Tenaillon et al. 2016.

**Misconceptions confronted** (R8 §3 numbers):

| # | Misconception | Confronted in |
|---|---|---|
| 1 | Need-driven evolution | Race, Warm Nest, every role rule |
| 2 | Acquired traits are inherited | Breeder gym; cave fish |
| 3 | Individuals transform | Pin lens (D1) in Lottery, Harvest, Selection Shadow |
| 4 | Variation is noise | Ellipse, Gene Swamping |
| 5, 16 | Mutation on demand; always harmful | Scribe, Twelve Flasks |
| 6 | Fitness means long life | Selection Shadow, Skaters |
| 7, 13, 14 | Ladder; fixed types; deep time | Tree Thinking, Dig, Drunkard's Walk, Extinction Roulette |
| 8 | Everything is adaptive | Lottery, Silent Letters, Pseudoreplication Trap |
| 9 | Good of the species | Skaters, Cleaning Station |
| 10 | r is the share of genes | Hive |
| 11 | HW means no evolution | Malaria Coast, Leaky Tap |
| 12 | Bodies become resistant | Refuge, Tumour |
| 15 | High h² means fixed | Breeder |
| 17 | Models are reality | Pseudoreplication Trap; Contested bosses |

### 3.16 Origin of life and major transitions

#### 33. The First Pond
**P2 · M · Act 8 side quest.**
- **Concept.** The error threshold, parasites, compartments, conflict suppression. *Confronts* "evolution builds complexity by default".
- **Role.** The environment: transfers, copying fidelity, waves, oxygen.
- **Loop.**
  - *L1.* Selected for speed alone, the RNA shrinks.
  - *L2.* Beyond length ≈ ln σ/u, the master sequence melts.
  - *L3.* Waves make dividing vesicles, and Price bars show protocells beating parasites.
  - *Boss.* Uniparental inheritance tames selfish symbionts.
- **Contested.** RNA world against metabolism-first.
- **Picture, graph, model.** Molecules copying on clay, then vesicles; genome length and Price bars; quasispecies and stochastic-corrector models.
- **Case.** Mills, Peterson & Spiegelman 1967; Eigen 1971; Szathmáry & Demeter 1987; Hurst & Hamilton 1992.

---

## 4. Must-haves delivered as levels, not new games

| Concept | Host (owner) | The level |
|---|---|---|
| Ne, P0 | Drift Casino (D2 merge, D3 levels) | "Buri's Bottles": 107 lines of 8♂ + 8♀ give Ne ≈ 11.5 (Buri 1956). Then a 9:1 sex ratio (Ne = 14.4 from 40), crash years (harmonic mean) and equal families (Ne ≈ 2N). Boss: a zoo holding 90% H for 50 generations, scored on alleles kept |
| ABO, P0 | Invisible Carriers (D3) | "Blood Bank": (p+q+r)² tiling; r = √O |
| Acquired traits; h² × environment; non-genetic inheritance, P0 | The Breeder (D3) | A gym whose trained parents' young reset; a small-RNA mark fading over a few generations (Rechavi et al. 2014); feed moving both the mean and h²; parent–offspring slope = h² |
| Trait loss, P0 | Seed Rain (D3) | Lights off: cave-fish eyes regress. Vision costs about 5–15% of resting metabolism (Moran et al. 2015, *verify*); shh pleiotropy (Yamamoto et al. 2004); which matters more is contested |
| Tree reading, P0 | Tree Thinking, Act 1 (D3) | Rotate nodes; node-counting and convergence traps; outgroups; long-branch attraction; an HGT gene tree |
| HGT, P0 | Clinic (D1) | Plasmids persist only if conjugation beats cost plus loss (Stewart & Levin 1977); KPC outbreak tracing (Snitkin et al. 2012) |
| Bateman, OSR, runaway, lek paradox, P1 | Strutting Ground (D3 design) | Pipefish brooding toggle (Jones et al. 2000). The OSR is not the sole driver (Kokko & Jennions 2008). Runaway through preference–ornament LD |
| Self-incompatibility, P1 | Meadow L3 (D3) | Rare S-alleles sire more seed; about 45 alleles in *Oenothera organensis* (Emerson 1939) |
| Gene trees, ILS, SFS, P1 | Coalescent (D3) | in about 30% of the genome, gorilla is closer to human or to chimp than they are to each other (Scally et al. 2012); Tajima's D with decoys |
| Brood parasitism, P1 | Nest boss (D3) | "The Cuckoo": acceptance thresholds (Reeve 1989; Davies & Brooke 1989) |
| Hybridisation, radiation, P1 | Archipelago (D3) | Big Bird lineage (Lamichhaney et al. 2018). Boss: turbidity merges Lake Victoria cichlids (Seehausen et al. 1997, 2008) |
| Vaccines, P1 | Pathogen (D3) | Leaky vaccines favour hotter strains (Read et al. 2015) |
| Rock–paper–scissors, P2 | Jaws boss (D1; D3 model) | Orange > blue > yellow > orange (Sinervo & Lively 1996; *verify* period). Needs a mutation floor (D0 guardrail) |
| Müllerian mimicry, apostatic selection, overproduction | Bitter Wings, Lichen Wood (D1) | As in D0 §4 |

---

## 5. Shared engine and widget requests

D2 schedules these; D4 sets the look. All extend `Gen` or Hunt; none forks them.

**`Gen` extensions:**
1. **Linked loci:** map positions, an obligate crossover, inversion flags. Today's `_gam` recombines every locus freely. Needed by Tangled Pairs, Red Fire, Islands of Divergence and Out of Africa, and by the Sweep and Crossing Over rebuilds.
2. **Multi-allele loci:** ABO, A/S/C, 12 alleles, S-alleles.
3. **Ploidy:** X-linked males and haplodiploidy.
4. **Pleiotropic loci.**
5. **Lineage tracking.**

**Widgets:** DemeMap (demes, migration, per-deme triangle dots); TreeView (rotate, birth–death, contrasts); GenomeStrip (alignments, scans); Petri (plates, flasks, tissue); Strata (layers, decay clocks).

**Hunt (D1):** a net verb.

Every game's oracle joins R6's suite.

---

## 6. Compliance with D0

### How this catalogue removes RC1–RC7

| RC | Fix |
|---|---|
| RC1 | A population visibly answers every act. Optima (Gβ, q̂, 2s) appear only in the debrief, beside the player's prediction. |
| RC2 | By primary role, the player is the environment in 23 games, a selective agent in 4, the mutational lottery or a mutant releaser in 2, an animal with an invasion view in 2, and a researcher in 2. Nobody sets their own heritable trait. |
| RC3 | Every game opens on an action, with gesture predictions and no multiple-choice questions. |
| RC4 | Each entry names the on-canvas object carrying its concept: jars, tank, spiral dots, segments, velvet prints. |
| RC5 | Every game has escalating levels and an inverting boss. Budgeted, stochastic inference is scored on calibration. |
| RC6 | Every game has a sourced case and an oracle, with ×N tags, Contested badges, *verify* flags and no unsourced Equilibrium data. |
| RC7 | One `Gen`, Hunt, triangle, Price bars and jars, placed in D2's acts, with callbacks: Scribe → Twelve Flasks; Lottery → Silent Letters → Out of Africa; Gene Swamping → Malaria Coast → Refuge; Royal Line → Skaters → Harvest. |

### Respecting D0 section 3

This catalogue respects every constraint in D0 §3:
- **Mutation:** three blind sources; a beneficial fraction of 10⁻²–10⁻⁵.
- **Hardy–Weinberg:** a null model. In Malaria Coast p is stable while adults sit above the curve; Royal Line tests the one-generation conditions.
- **Drift:** 2s, 2hs, Ne thresholds and |Ne·s| ≈ 1.
- **Bottlenecks:** scored on alleles kept.
- **Agency:** variants are selected; populations evolve.
- **Kin:** relatedness by descent, on average.
- **Cooperation:** direct benefits are not altruism; strong altruism needs assortment.
- **Cycles:** a mutation floor.
- **Contested topics:** badged, with no star for a side.

### Answers to D0's questions for D3

1. **Game or level?**
   - *Standalone units of 10–20 minutes:* Scribe, Royal Line, Leaky Tap, Malaria Coast, Gene Swamping, Dig, Extinction Roulette, Out of Africa.
   - *Levels:* Ne, ABO, the gym, cave fish, HGT (D1), overproduction (D1), tree reading.
2. **Deep time without quizzes.** The player makes the record (burial, erosion, the asteroid, the plates). Inference is a budgeted search: where to dig, which sister groups to buy. Every placement in time is a gesture scored by distance, against data the player generated.
3. **Human variation.** Coordinator A plus two external reviewers, a human population geneticist and a scholar of race and science, sign off before build. They use the ASHG 2018 statement and the NASEM 2023 report. Rules:
   - variation is continuous and clinal;
   - ancestry is not race;
   - adaptive differences are shown only for documented traits;
   - no group ranking;
   - no between-group polygenic scores;
   - no ethnic markers;
   - student-sensitivity interviews in the pilot.
4. **Quiz chapters.** Following D2, every level-2 quiz is cut.
   - Archipelago → seed supply and a cichlid boss.
   - Two Fruits → a fly swarm with a draggable inversion.
   - Guest L2 → a playable symbiont, including the *Wolbachia* exception.
   - Clock → Silent Letters' substitution rain on a tree.
   - Copy and Paste → genome-as-city.
   - Coalescent L3 → alignment inference.
   - Islands, Food Web and After the Fire → appendix. After the Fire returns only once rescored on flat and monotonic landscapes.
5. **Engine reuse.**
   - *Hunt:* Tangled Pairs, Harvest.
   - *`Gen`:* 19 games.
   - *Triangle HUD:* Royal Line, Leaky Tap, Malaria Coast, Gene Swamping, Refuge.
   - *Price bars:* Cleaning Station, First Pond.
   - *Census instruments:* Malaria Coast.
   - *Casino jars:* Lottery, Out of Africa.
   - *Slow Island model:* Selection Shadow.
   - *Switches grid:* Toolkit.
