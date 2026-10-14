# Review R3: Endless Forms, Sections VIII–XI, the learning layer and the UI

*Reviewer: evolutionary biologist and game designer agent (code read; visual comments come from reading the draw code). This is raw reviewer output, kept for reference. Its science claims were later fact-checked: see `R7_factcheck_R3_endless_forms_sections_VIII-XI_and_UI.md`, which takes precedence wherever the two disagree.*

**Code map.** The `PLAN` in `core.js` registers each chapter with `reg()`.

| Section | Chapter | File |
|---|---|---|
| VIII | Lock and Key (lock) | ch22 |
| VIII | The Clinic (clinic) | ch13 |
| VIII | The Pathogen (virulence) | ch14 |
| VIII | The Guest (guest) | ch23 |
| IX | Switches (switch) | ch25 |
| IX | Copy and Paste (copy) | ch27 |
| IX | The Sweep (sweep), The Clock (clock) | ch26 |
| X | The River (river) | ch6 |
| X | Two Fruits (fruits) | ch21 |
| X | The Ring (ring), Doubling (double) | ch20 |
| XI | The Archipelago (arch) | ch27 |
| XI | Tree Thinking (tree), The Food Web (web) | ch28 |
| XI | Islands (islands), After the Fire (fire) | ch29 |

## The pattern behind "boring"

Almost every chapter has the same two-level shape:
- **Level 1** is a small parameter puzzle: a slider or a few buttons, "run", then read a number.
- **Level 2** is often a multiple-choice quiz (`QZ.begin`, or "predict, then run"). This is true of the Archipelago, Food Web, Islands, Fire, Two Fruits (both levels), the Guest, the Clock, Copy L2 and Switches L2.

So the core verb for most of the game is "read a paragraph, then pick a button".
- Feedback is prose (HUD, toasts, end cards), not something happening on screen.
- There is almost no escalation within a chapter.
- Visuals are a flat background plus a line chart.

The models underneath are often good and carefully parameterised. The trouble is that the player only ever sees them as text.

## VIII. Coevolution and disease

**Lock and Key (Red Queen)**
- *What you do.*
  - L1: each season, pick one of four parasite keys to target a host lock, in a matching-alleles model where h′ ∝ h·e^(−6q).
  - L2: set a newt-eating snake's toxin resistance with a slider.
- *Science.* The model is sound, but:
  - The player acts as a forecaster, not a parasite lineage.
  - The chapter never shows the Red Queen's real payoff: an argument for sex (Hamilton), which bridges to "Why Sex?".
  - L2 has the right trade-off (resistance slows the snake; Brodie) but drops geographic mosaic coevolution (Thompson).
- *Feel.* Choosing which key comes next is one deduction, repeated. The slider level is just optimisation.
- *Visuals.* Four coloured lines on a chart. There are no organisms.
- *Redesign.*
  - Give the player a population of parasite keys on a field of host doors.
  - Locks visibly rotate toward whatever is rare.
  - Escalation: sexual hosts recombine their locks and outpace the parasite. That one move teaches both the Red Queen and why sex helps.

**The Clinic (favourite)**
- *What you do.* For 10 days, pick no drug, low dose or high dose. L2 offers drug A, drug B, or A+B. There is a toxicity budget, and the immune system clears 90% a day below 10⁵ cells.
- *Science.* Mostly good: standing resistance, a cost of resistance, combination therapy needing double mutants. Problems:
  - It preaches "hit hard early" as settled. That doctrine is contested: Read, Day & Huijben 2011 argue aggressive treatment can maximise resistance when resistance is already present, and shorter courses are now often preferred. The end card should flag this.
  - Resistance arises only by point mutation. There is no horizontal gene transfer (HGT) or plasmids, which drive much clinical resistance.
  - There is no pharmacokinetics and no adherence, and day-by-day dose switching is not how treatment works.
  - There are no hospital-level stakes (cycling, mixing, collateral sensitivity).
- *Why it works.* The decisions are clear, the trade-off is real, and failure is legible: the infection turns red.
- *Why it is thin.* Each level has an obvious optimal sequence. Once found, replaying it means nothing.
- *Redesign.*
  - A ward of 6–10 patients over a season, each with a hidden resistance profile (culture tests cost time).
  - Plasmids jump between patients sharing a bay, and a resistance map of the ward evolves.
  - Tools: cycling, combinations, isolation beds.
  - Show drug concentration curves sweeping over the cells, so the player sees the **mutant selection window**.
  - Escalation: one patient → ward → a decade of hospital policy.

**The Pathogen (virulence)**
- *What you do.* Set a replication-rate slider each season and read R₀. Twists: vector transmission, and co-infection.
- *Science.* The trade-off model is right. Two issues:
  - Ewald's vector-borne hypothesis has mixed support, yet it is presented as clean.
  - The myxoma story (virulence fell to intermediate, then rabbits evolved resistance and virulence rose again; Kerr et al. 2017) should be the anchor.
- *Feel.* A slider that searches for a peak.
- *Redesign.* A Plague-Inc-style outbreak through a warren network, where the strain's replication rate is heritable. Hosts that die too fast become dead ends on the map. Escalation: imperfect vaccines that select for higher virulence (Marek's disease; Read et al. 2015), vectors, and co-infection.

**The Guest (mutualism)**
- *What you do.*
  - L1: allocate 12 oxygen units across nodules using noisy nitrogen readings, as host sanctions against cheating rhizobia (Kiers et al. 2003). This is a good explore/exploit puzzle.
  - L2: predict outcomes of vertical vs horizontal transmission (a quiz).
- *Missing:* partner choice vs sanctions, and mutualism breakdown.
- *Redesign.* Keep L1, but render a growing root with nodules that swell or wither. Make L2 a playable symbiont with a toggle for transmission mode.

## IX. Genomes and development

**Switches (favourite)**
- *What you do.* L1: toggle a 4×5 Hox-by-segment grid, then press Hatch to build target flies (bithorax, Antennapedia). L2: pick one of four Pitx1 mutations, then answer a question.
- *Science.*
  - The hook says "take the spines off a stickleback". The Pitx1 pelvic enhancer deletion removes the *pelvic* spines and girdle, not the dorsal spines (Chan et al. 2010). Fix the wording.
  - Only five segments and a subset of genes are modelled. Ubx acts in T3 and A1. These are acceptable simplifications if labelled.
  - **Colinearity**, the most striking fact, is never shown.
  - There is no deep homology, and cis vs trans evolution appears only as a quiz item.
- *Why it works.* A genuine construction toy with instant, visible causation.
- *Why it falls short.* Four targets, then a quiz. The fly is drawn with crude ellipses.
- *Redesign, "Monster Workshop."*
  - Paint expression domains (including gradients) onto an embryo, then watch the larva and adult animate into being.
  - Unlock new body plans: crustacean appendage shifts, snake limb loss.
  - L2 becomes a regulatory circuit board: cut or copy Pitx1 enhancer modules and watch the pituitary, jaw and pelvis light up or fail. Score by pleiotropic damage.
  - Escalation: fly wing spots (Prud'homme et al. 2006, *yellow* enhancers) and butterfly eyespots.

**Copy and Paste**
- *What you do.* L1: P×M fly crosses (hybrid dysgenesis), then questions. L2: accept or reject eight mutations in a duplicated gene (subfunctionalisation).
- *Science.* Correct (maternal piRNA; duplication–degeneration–complementation, DDC). It underplays the commonest fate of duplicates, pseudogenisation, and neofunctionalisation gets a single item. Missing: the TE share of genomes, transposon domestication (RAG1/2, syncytin) and whole-genome duplication.
- *Feel.* Two quizzes in disguise.
- *Redesign, genome-as-city.* TEs copy themselves along a chromosome strip. The player is the host deploying piRNA silencers that spread only via the egg. Then duplicate a gene, watch mutations hit both copies, and bet on each copy's fate.

**The Sweep**
- *What you do.* L1: sequence 7 of 40 windows to locate a diversity valley (a good Battleship-style search). L2: label three panels as hard sweep, soft sweep or neutral.
- *Science.* Correct: valley width scales with s/r. Missing: background selection that mimics sweeps, demographic confounds, and SFS/Tajima's D.
- *Redesign.* Show the forward simulation, with haplotype bars hitchhiking and recombination chopping and recolouring them. Then add genome scans with decoys (bottlenecks, background selection) and a false-positive penalty.

**The Clock**
- *What you do.* Read difference counts, set a date slider, and optionally toggle a Jukes–Cantor correction.
- *Science.* Correct but narrow. No rate variation among lineages, no generation-time effect, no calibration uncertainty, no relative rate test.
- *Feel.* Arithmetic with a slider: the dullest chapter in this slice.
- *Redesign.*
  - An animated tree with substitution ticks popping along the branches.
  - Fossil calibrations become uncertain bars the player places.
  - A fast-clock "suspect" lineage (rodents) must be detected with a relative rate test.
  - Saturation shows as sites flickering back to old states.

## X. Species

**The River**
- *What you do.* L1: for each split, wait, pay for a test cross, or let the banks meet. L2: a female frog chooses mates by call (reinforcement).
- *Science.* The Orr snowball (incompatibilities growing roughly with k²) is correctly implemented.
- *Feel.* L1 is an optimal-stopping problem with little to see. L2 is more embodied.
- *Redesign.* Two diverging populations fix mutations shown as glyphs. Hybrids flash wherever an incompatible pair occurs (Dobzhansky–Muller incompatibilities). The player opens and closes the river with a dam, and call frequencies pull apart in the contact zone.

**Two Fruits**
- *What you do.* Six predictions, then a 150-generation run: entirely a quiz.
- *Science.* *Rhagoletis* is right: apple flies emerge earlier, and host fidelity is the "magic trait". Missing: the inversions came from introgression from Mexican populations (Feder et al. 2003).
- *Redesign.* An agent swarm of flies on two trees. The player toggles mating mode and drags an inversion bracket onto the chromosome, then watches linkage disequilibrium build or get shredded by recombination.

**The Ring**
- *What you do.* L1: a test-cross binary search for the break. L2: sort song cards by swapping.
- *Science.* It presents *Ensatina* and greenish warblers as clean rings. Both are messier: historical fragmentation, and a gap in the warbler ring (Alcaide et al. 2014). Say so; it strengthens the "species are fuzzy" message.
- *Redesign.* Walk a salamander around the valley, breeding with each neighbour. Offspring morph gradually until courtship fails at the far end.

**Doubling**
- *What you do.* L1: plant 10 tetraploids on a grid (minority cytotype exclusion). L2: pair chromosomes in a hybrid, then double.
- *Science.* Good. L1 teaches a rarely taught concept. It omits unreduced gametes, the usual real route, and does not clearly name autopolyploidy vs allopolyploidy.
- *Redesign.* Extend L1 into a campaign. Make L2 a tactile meiosis minigame where unpaired chromosomes visibly scatter. Then breed bread wheat (AABBDD).

## XI. Deep time and ecology

- **The Archipelago.**
  - *Now:* L1 is a beak slider against a seed curve with a competitor; L2 is a three-question quiz. The science is accurate, including character displacement in 2004–05.
  - *Problem:* this is "adaptive radiation" without any radiation.
  - *Redesign:* multi-island colonisation, with finches hopping between islands, beaks evolving, competitors displacing each other and niches filling. Hybridisation can create a lineage (the "Big Bird" lineage; Lamichhaney et al. 2018).
- **Tree Thinking.**
  - *Now:* L1 is five questions on a tree; L2 is four-taxon parsimony three times. The maths is correct, but it is a worksheet.
  - *Missing:* rooting and outgroups, long-branch attraction, comparative methods.
  - *Redesign:* drag tips onto a tree, rotate nodes to break the "ladder" illusion, and get a live step count with characters mapped onto the branches. Add a convergence hunt.
- **The Food Web.**
  - *Now:* L1 is a three-experiment Paine keystone search, which is fine. L2 is a cascade quiz.
  - *Redesign:* a living tidepool where mussels carpet the rock over time. Add a Yellowstone level, noting that the clean wolf–aspen story is contested, which makes a good critical-thinking hook.
- **Islands.**
  - *Now:* L1 tunes area and distance sliders to hit species targets. L2 is a metapopulation quiz.
  - *Redesign:* a mainland emitter drops species onto islands while arrivals and extinctions flicker. The player designs a reserve network under a budget (SLOSS debate, corridors), with occupancy shown live.
- **After the Fire.**
  - *Now:* L1 is a fire-interval slider with a Shannon evenness score. L2 is priority-effect predictions.
  - *Problem:* the text hedges on the intermediate disturbance hypothesis, which is good (Fox 2013 argues it should be abandoned), but the game still rewards it as a rule.
  - *Redesign:* the player is a fire manager painting burns onto a landscape and is scored on biodiversity and wildfire risk. A seeding minigame shows arrival order flipping the outcome.

## The learning layer (ch99.js)

- **"Predict first" (TRANSFER)** hijacks `App.open`: you get a quiz card before you even see the intro. "Remember?" (RECALL) fires on every third chapter opening, picked at random. That can mean a quiz, an intro card, then a Notes explanation: **three text walls before the first interaction**.
- **Recall is not spaced repetition.** It does not track errors and gives no reward.
- **The TAKE line** is prepended to end cards that already run 150–250 words.
- **What to change:**
  - Fold predictions into play: freeze the sim and have the player drag a prediction line onto the chart.
  - Move "Remember?" into a Notebook review deck with streaks.
  - Cap intros at about 40 words plus one animated how-to-play demo.

## Shared UI and engine (ui.js, core.js)

- **The HUD is a text sink.** In Switches, the target fly is written out as a sentence instead of being drawn.
- **Feedback is mostly read, not felt.** `Snd.chime` and `Snd.miss` are the only juice. There is no screen shake, no particles, no number pop-ups, no tweened state changes and no win animation, and stars appear only on the end card.
- **Navigation is linear.** You cannot replay a single level, and the real explanations are hidden behind the Notes button.
- **No visual identity per chapter.** Chapters share the same canvas, lineChart and barChart helpers, so they blur together. There are almost no characters or creatures.
- **Onboarding is all text.** Nothing demonstrates the controls, and the first action is never highlighted.

## Missing undergraduate concepts, with game pitches
1. **Mass extinction and macroevolution.** *Extinction Roulette*: background extinction is selective; mass extinction is "wanted: luck" (Raup). Recovery comes through radiations.
2. **Adaptive radiation proper.** A cichlid lake: jaw and colour traits diverge into niches, with sexual selection on colour.
3. **Human evolution.** *Out of Africa*: serial founder effects (diversity declines with distance from Africa), Neanderthal and Denisovan introgression, and sweeps for lactase persistence and high-altitude adaptation (EPAS1).
4. **Phylogenetic comparative methods.** *Pseudoreplication Trap*: independent contrasts dissolve a fake correlation.
5. **Population structure and Fst.** *Islands of Alleles*: migration between demes, Fst on a live map, the one-migrant-per-generation rule, STRUCTURE-style plots.
6. **Quantitative genetics.** *Breeder's Equation*: G-matrix ellipses, correlated responses, Lande–Arnold, parent–offspring regression.
7. **GWAS.** A Manhattan-plot hunt: stratification false positives, missing heritability.
8. **Diversification rates and key innovations.** Lineage-through-time plots and birth–death trees.
9. **Origin of life and major transitions.** Replicators in compartments, and Eigen's error threshold.
10. **Horizontal gene transfer.** Plasmids spreading as network contagion.
11. **Biogeography and vicariance.** Drifting continents, Wallace's line.
12. **Senescence.** Mutation accumulation and antagonistic pleiotropy.
13. **Experimental evolution.** Lenski's long-term E. coli lines, citrate evolving through historical contingency, replays from the freezer.

**Overall.**
- **The models** are mostly correct and well cited.
- **Science fixes:**
  - the stickleback "spines" wording
  - "hit hard" presented as settled
  - clean ring species
  - the IDH rewarded as a rule
  - no HGT in the Clinic
  - Ewald's hypothesis presented as clean
- **Why it is not fun:**
  - quiz-shaped levels
  - prose feedback
  - no agents on screen
  - no escalation within chapters
- **What to keep and expand:** Clinic, Switches, Doubling L1, Guest L1 and Sweep L1 have real verbs; grow them into multi-stage campaigns.
- **What to replace:** the quiz level 2s (Archipelago, Food Web, Islands, Fire, Fruits, Clock, Copy) should become playable simulations.
