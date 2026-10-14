# R7: Fact-check of R3 (Endless Forms, Sections VIII–XI, learning layer, UI)

*Adversarial science fact-check of `R3_endless_forms_sections_VIII-XI_and_UI.md`. Where R3 and this file disagree, this file takes precedence.*

**Method.**
- I read R3 line by line and pulled out every claim about what the game says or does, and every scientific statement or citation R3 makes itself.
- I checked each game claim against the source: `ch6.js` (River), `ch13.js` (Clinic), `ch14.js` (Pathogen), `ch20.js` (Ring, Doubling), `ch21.js` (Two Fruits), `ch22.js` (Lock and Key), `ch23.js` (Guest), `ch25.js` (Switches), `ch26.js` (Sweep, Clock), `ch27.js` (Copy and Paste, Archipelago), `ch28.js` (Tree Thinking, Food Web), `ch29.js` (Islands, After the Fire), `ch99.js` (learning layer), `ui.js` and `core.js`.
- I re-ran the chapter models in Node using the game's own equations and constants: Lock and Key dynamics, the Pathogen optima, every possible Clinic treatment sequence (brute force), Two Fruits, After the Fire, and the Islands level 2 levers. The numbers quoted below come from those runs.
- I then searched the same chapters for science errors R3 did not mention, concentrating on `real`, `maths`, `ideas`, hooks and end-card text.

**Verdict key.**
- **CONFIRMED**: correct as stated.
- **PARTLY RIGHT**: the correction column says what to change.
- **WRONG**: the correction column says why.

**Headline.**
- R3's own science and citations are almost all correct. Every paper it cites exists with the stated authors and year.
- Its main weakness is that it often says the game "lacks" something the game's `real` text already contains: the Mexican origin of the *Rhagoletis* inversions, the messiness of the ring species, the Yellowstone debate, and myxoma as the anchor case. It also misdescribes some UI facts.
- R3 missed several real errors. The most serious are:
  - The Clock pairs species names with random dates. Level 2 dates "plants and animals" at 150–520 Myr; the real split is about 1.5 billion years ago.
  - In Switches, target 4 says losing abd-A gives a fly legs on its abdomen. It does not.
  - In The Ring, the warbler song gradient is the wrong shape.
  - The Pathogen contradicts itself about mosquitoes and myxoma.
  - Lock and Key drives host genotypes to frequencies of 10⁻⁷, which undercuts its own lesson that the Red Queen keeps variation alive.
  - The Clinic's line "let the immune system finish" is contradicted by the Clinic's own model.

---

## 1. Claims R3 makes, checked

### VIII. Coevolution and disease

| # | R3 claim | Verdict | Correction / source |
|---|---|---|---|
| LK1 | Lock L1 uses a matching-alleles model, h′ ∝ h·e^(−6q); the player picks one of four keys. | CONFIRMED | `ch22.js` `next1()`, `SA = SB = 6`. Parasites follow q′ ∝ q·e^(6h). |
| LK2 | Lock L2: set the snake's toxin resistance with a slider. | CONFIRMED | `begin2()`. Payoff = share of newts eaten − 0.06 × resistance. |
| LK3 | The player is a forecaster, not a parasite lineage. | CONFIRMED | The payoff is next season's frequency of the chosen host type (`pick1()`). The choice does not affect the dynamics at all. |
| LK4 | The chapter never shows the Red Queen as an argument for sex (Hamilton) and does not bridge to "Why Sex?". | PARTLY RIGHT | The end card does say the Red Queen "may be one reason sex persists". "Why Sex?" (`ch17.js`) already has a parasite level that cites Lively 1987. What is missing is an explicit link between the two chapters. Hamilton 1980 (*Oikos* 35:282) is correctly attributed. |
| LK5 | L2 has the right trade-off: resistance slows the snake (Brodie). | CONFIRMED | Brodie & Brodie 1999, *Evolution* 53:626. **However**, the game cites Brodie, Ridenhour & Brodie 2002 for the speed cost. That paper is about geographic hotspots and coldspots, not the speed cost. See missed error M7. |
| LK6 | L2 leaves out geographic mosaic coevolution (Thompson). | CONFIRMED | Thompson 2005, *The Geographic Mosaic of Coevolution*. The 2002 Brodie paper the game cites is itself the mosaic paper. |
| LK7 | Visuals are "four coloured lines on a chart. There are no organisms." | WRONG | `draw()` renders 40 host snails with coloured lock rings in L1, and 14 newts plus a crawling snake in L2. They are crude, but they are there. |
| CL1 | Clinic: 10 days; no drug / low / high dose; L2 offers A, B or A+B; toxicity budget; the immune system removes 90% a day below 10⁵ cells. | CONFIRMED | `ch13.js` `step()`, budgets 8 and 18. |
| CL2 | The Clinic preaches "hit hard early" as settled. | PARTLY RIGHT | The L1 lesson card says "Hitting hard early … leaves nothing to select", and the model enforces it: all 10 cures at the minimum toxicity of 6 open with high, high. But the `real` text already says course length "is still debated" (Llewelyn et al. 2017). What is missing is the specific argument against aggressive treatment (Read, Day & Huijben 2011). |
| CL3 | Read, Day & Huijben 2011 argue that aggressive treatment can maximise resistance when resistance is already present; shorter courses are now often preferred. | CONFIRMED | *PNAS* 108 Suppl 2:10871. Llewelyn et al. 2017, *BMJ* 358:j3418. |
| CL4 | Resistance arises only by point mutation; there is no horizontal gene transfer (HGT) or plasmids, which drive much clinical resistance. | CONFIRMED | Correct about the code, and HGT is central for Enterobacterales and for *S. aureus* (mecA). Caveat: the chapter's real-world anchor is tuberculosis, where resistance is entirely chromosomal. Add HGT as a separate pathogen or level; do not graft it onto the TB story. |
| CL5 | No pharmacokinetics, no adherence, no ward-level stakes; switching dose day by day is unrealistic. | CONFIRMED | None of these is in `ch13.js`. |
| CL6 | Each level has an obvious optimal sequence. | CONFIRMED | Brute force: L1's minimum toxicity is 6, and every optimal course is high, high, then two low doses. L2's minimum is 8, for example A, then A+B, then A+B. |
| CL7 | The "mutant selection window" concept. | CONFIRMED | Drlica & Zhao 2007, *Clin Infect Dis* 44:681. The game already cites it. |
| PA1 | Pathogen: set a replication-rate slider each season and read R₀; twists are vectors and co-infection. | CONFIRMED | `ch14.js` `SEAS`, `parts()`, `fit()`. |
| PA2 | "The trade-off model is right." | PARTLY RIGHT | It is the standard model (Anderson & May 1982; Alizon et al. 2009, *J Evol Biol* 22:245). But the trade-off hypothesis itself has firm support in only a few systems (myxoma; HIV set-point viral load, Fraser et al. 2007) and is contested (Ebert & Bull 2003, *Trends Microbiol* 11:15). The game should say so. |
| PA3 | Ewald's vector-borne hypothesis has mixed support but is presented as clean. | CONFIRMED | It is worse than R3 says. Myxoma is itself mosquito-borne, and it evolved *lower* virulence because mosquitoes pick virus up from lesions on living rabbits; the game's own `real` text says this. Yet season 3, "Mosquitoes arrive", raises the optimum from 0.42 to 0.52 (my run). See M4. |
| PA4 | The myxoma story (fall to intermediate virulence, rise after rabbits became resistant; Kerr et al. 2017) "should be the anchor". | PARTLY RIGHT | The science is correct (*PNAS* 114:9397). The critique is mostly wrong: the game already anchors on myxoma. Its seasons are "Early days in Australia" and "The rabbits evolve resistance", and its `real` text cites Fenner & Ratcliffe 1965 and Kerr et al. 2017. |
| PA5 | Imperfect vaccines select for higher virulence (Marek's disease; Read et al. 2015). | CONFIRMED | *PLoS Biol* 13:e1002198. |
| GU1 | Guest L1: allocate 12 oxygen units across nodules using noisy nitrogen readings, as host sanctions (Kiers et al. 2003). | CONFIRMED | `ch23.js` `grow1()`. Kiers et al. 2003, *Nature* 425:78. |
| GU2 | Guest L2 is a prediction quiz on vertical vs horizontal transmission. | CONFIRMED | `pred2()`. The maths m* = 0.5 − (1 − v)/(2v) is correct: setting dW/dm = 0 gives it. |
| GU3 | Partner choice vs sanctions, and mutualism breakdown, are missing. | CONFIRMED | Neither appears. |

### IX. Genomes and development

| # | R3 claim | Verdict | Correction / source |
|---|---|---|---|
| SW1 | Switches: a 4 × 5 Hox-by-segment grid with four target flies; L2 is a choice between four Pitx1 mutations, then a question. | CONFIRMED | `ch25.js` `TASKS`, `OPTS`. |
| SW2 | The hook "take the spines off a stickleback" is wrong: the Pitx1 enhancer deletion removes the pelvic spines and girdle, not the dorsal spines (Chan et al. 2010). | PARTLY RIGHT | Only the hook is loose. The L2 text, the `real` text and the drawing (dorsal spines kept) all say pelvic. Fix the hook only. Chan et al. 2010, *Science* 327:302. |
| SW3 | Only five segments are modelled; Ubx acts in T3 and A1; acceptable if labelled. | PARTLY RIGHT | The biology is right: Ubx specifies parasegments 5–6. But the simplification is not harmless. Treating Ubx as "T3 identity" in every segment produces a wrong answer in target 4. See M2. |
| SW4 | Colinearity is never shown. | PARTLY RIGHT | It is stated in `real` ("lie in the same order on the chromosome"), and the grid rows are in chromosomal order, but play never points this out. |
| SW5 | No deep homology; cis vs trans appears only as a quiz item. | PARTLY RIGHT | Deep homology is indeed absent. But L2 contrasts enhancer (cis-regulatory) changes with coding changes; that is about pleiotropy, not cis vs trans. Label it correctly. |
| SW6 | The fly is drawn with crude ellipses. | CONFIRMED | `fly()`. |
| SW7 | Fly wing spots via *yellow* enhancers (Prud'homme et al. 2006). | CONFIRMED | *Nature* 440:1050. The first paper was Gompel et al. 2005, *Nature* 433:481. |
| CP1 | Copy L1: P × M crosses (hybrid dysgenesis), then questions. L2: accept or reject eight mutations in a duplicated gene. | CONFIRMED | `ch27.js`. |
| CP2 | The science is correct: maternal piRNA, and the duplication–degeneration–complementation (DDC) model. | CONFIRMED | Brennecke et al. 2008, *Science* 322:1387. Force et al. 1999, *Genetics* 151:1531. Kidwell et al. 1977 is correctly described. |
| CP3 | The game underplays the commonest fate of duplicates, pseudogenisation. | PARTLY RIGHT | `real` says "the usual fate of one copy is to be lost", the end card says "Duplicated genes mostly decay", and L2 can end as "pseudogene". What is missing is a sense of the rate: a typical half-life of about 4 Myr (Lynch & Conery 2000, *Science* 290:1151). |
| CP4 | Neofunctionalisation gets a single item. | PARTLY RIGHT | It turns up as a random L2 event (35% chance for each eligible copy) plus one sentence in `real`. Thin, but it is in play. |
| CP5 | Missing: the transposable-element (TE) share of genomes, TE domestication (RAG1/2, syncytin), whole-genome duplication. | CONFIRMED | None of these appears anywhere in the source. The science is right: RAG came from a Transib transposon (Kapitonov & Jurka 2005); syncytins came from endogenous retrovirus env genes (Mi et al. 2000). |
| SP1 | Sweep L1: sequence 7 of 40 windows. L2: label panels hard / soft / neutral. | CONFIRMED | `ch26.js`. |
| SP2 | Valley width scales with s/r. | CONFIRMED | More exactly, the width is ≈ s / (2 r ln 2Ns) (Kaplan, Hudson & Langley 1989, *Genetics* 123:887). The game's form, π = 1 − e^(−x/Δ), matches the standard post-sweep approximation. |
| SP3 | Missing: background selection mimicking sweeps, demographic confounds, the site frequency spectrum (SFS) and Tajima's D. | CONFIRMED | None of these is in the source. Background selection: Charlesworth, Morgan & Charlesworth 1993, *Genetics* 134:1289. |
| CK1 | Clock: read difference counts, set a date slider, optionally toggle a Jukes–Cantor correction. | CONFIRMED | The toggle exists only in L2. The JC formula and the simulation (p = ¾(1 − e^(−4D/3))) are correct. |
| CK2 | No rate variation among lineages, no generation-time effect, no calibration uncertainty, no relative rate test. | PARTLY RIGHT | Rate variation and relaxed clocks are stated in `real` and on the end card ("faster in rodents than in hominids"). None of the four is in play, and generation time is never named. R3 also missed that the dates themselves are scrambled: see M1. |

### X. Species

| # | R3 claim | Verdict | Correction / source |
|---|---|---|---|
| RV1 | River L1: wait, pay for a test cross, or let the banks meet. L2: a female frog chooses mates by call (reinforcement). | CONFIRMED | `ch6.js`. |
| RV2 | The Orr snowball (incompatibilities growing roughly as k²) is correctly implemented. | CONFIRMED | `wait()` tests each new mutation against all of the other bank's mutations, giving k² cross-bank pairs. Orr 1995 counts K(K−1)/2 pairs across both lineages; the quadratic scaling is the same. The figure 0.55³ ≈ 17% is correct. |
| FR1 | Two Fruits is entirely a quiz: predictions, then a 150-generation run. | CONFIRMED | `ch21.js`. Six experiments, each with a prediction. |
| FR2 | Apple flies emerge earlier. | CONFIRMED | Apples ripen before hawthorns (Feder et al. 1994, *PNAS* 91:7990). |
| FR3 | Host fidelity is the "magic trait". | PARTLY RIGHT | Mating on the host makes host choice double as mate choice; that is a habitat-choice mechanism. But a magic trait must itself be under divergent selection (Servedio et al. 2011, *TREE* 26:389). In the game's model selection acts on timing, not on preference. Eclosion timing, which is under divergent selection and also isolates the races in time, is the stronger candidate (Feder & Filchak 1999). |
| FR4 | Missing: the inversions came by introgression from Mexican populations (Feder et al. 2003). | WRONG | `CH_FRUITS.real` says exactly this, with the same citation. The end card ("arrived from Mexico long ago") and `MODEL.fruits` repeat it. |
| RG1 | Ring L1: a test-cross binary search for the break. L2: sort song cards by swapping. | CONFIRMED | `ch20.js`. The interbreeding values (89 / 64 / 37 / 17% for 1–4 steps) are computed correctly from exp(−(d/3)²). |
| RG2 | The game presents *Ensatina* and greenish warblers as clean rings; it should say both are messier (Alcaide et al. 2014). | WRONG | `CH_RING.real` already says "Both cases are messier than the textbook picture" and cites Pereira & Wake 2009 and Alcaide et al. 2014. The critique holds only for the hook ("Neighbours interbreed all the way round") and the clean 12-site model. See M20. |
| RG3 | There was a gap in the warbler ring (Alcaide et al. 2014). | CONFIRMED | *Nature* 511:83. Gene flow around the ring was interrupted in the past, and there is limited hybridisation between the two end forms in Siberia. |
| DB1 | Doubling L1: plant 10 tetraploids (minority cytotype exclusion). L2: pair chromosomes, then double. | CONFIRMED | `CH_DOUBLE`. |
| DB2 | The chapter omits unreduced gametes, the usual real route. | CONFIRMED | Ramsey & Schemske 1998, *Annu Rev Ecol Syst* 29:467. The L2 button "Double the chromosomes" implies somatic doubling. |
| DB3 | It does not clearly name autopolyploidy vs allopolyploidy. | CONFIRMED | "Allopolyploids" appears once in `real`; "autopolyploid" appears nowhere. L1 is implicitly autopolyploid and L2 allopolyploid. |

### XI. Deep time and ecology

| # | R3 claim | Verdict | Correction / source |
|---|---|---|---|
| AR1 | Archipelago L1: a beak slider against a seed curve with a competitor. L2: a three-question quiz. | CONFIRMED | `ch27.js`. |
| AR2 | The science is accurate, including character displacement in 2004–05. | CONFIRMED | Grant & Grant 2006, *Science* 313:224. Two small wording errors R3 missed: M22 and M23. |
| AR3 | Hybridisation founded the "Big Bird" lineage (Lamichhaney et al. 2018). | CONFIRMED | *Science* 359:224. |
| TR1 | Tree L1: five questions. L2: four-taxon parsimony three times. The maths is correct. | CONFIRMED | `steps()` charges 1 or 2 changes for characters split 2 : 2 and treats all others as uninformative. Correct. But there are text and character-choice errors: M14 and M15. |
| TR2 | Missing: rooting and outgroups, long-branch attraction, comparative methods. | CONFIRMED | None of these is in the source. |
| WB1 | Food Web L1: a three-experiment Paine keystone search. L2: a cascade quiz. | CONFIRMED | `ch28.js`. Paine 1966 (15 → 8 species), Estes & Palmisano 1974, Estes et al. 1998 and Carpenter et al. 1985 are all correctly cited. |
| WB2 | "Add a Yellowstone level, noting that the clean wolf–aspen story is contested." | PARTLY RIGHT | The contested story is already there: L2 question 4 makes "debated" the correct answer, and `real` explains why. Only a full playable level is missing. |
| IS1 | Islands L1: area and distance sliders to hit targets. L2: a metapopulation quiz. | CONFIRMED | `ch29.js`. S* = P·I₀/(I₀ + E₀) and p* = h − e/c are both correct. |
| IS2 | Redesign around SLOSS and corridors. | PARTLY RIGHT | Corridors are already an L2 option ("colonisation ×1.5/×2"). SLOSS (single large or several small reserves) is absent. |
| FI1 | Fire L1: a fire-interval slider scored by Shannon evenness. L2: priority-effect predictions. | CONFIRMED | `CH_FIRE`. |
| FI2 | The text hedges on the intermediate disturbance hypothesis (Fox 2013) but still rewards it as a rule. | CONFIRMED | Fox 2013, *TREE* 28:86. The end card does say "in this model … though in nature the pattern varies". But a three-stage succession chain guarantees a hump; my runs put the best interval at 43 years (dry) and 19 years (wet). |
| PAT | Level 2 is a quiz in the Archipelago, Food Web, Islands, Fire, Two Fruits, Guest, Clock, Copy L2 and Switches L2. | PARTLY RIGHT | Wrong for the Clock: its L2 is the same slider estimate plus a correction toggle, not a quiz. Copy L2 is a binary accept/reject drill rather than a quiz. The rest are correct. R3's "what to replace" list repeats the Clock error. |

### Learning layer and UI

| # | R3 claim | Verdict | Correction / source |
|---|---|---|---|
| LL1 | "Predict first" (TRANSFER) hijacks `App.open`, so a quiz card comes before the intro. | PARTLY RIGHT | True, but only for six chapters (soot, castaways, cross, fruits, clinic, lock), and only once the source chapter has been completed (`ch99.js` lines 138–146). |
| LL2 | "Remember?" (RECALL) fires on every third chapter opening, picked at random. | CONFIRMED | `Save.d.opens % 3 === 0` and `pick(cands)`. |
| LL3 | This can mean three text walls: a quiz, an intro card, then a Notes explanation. | PARTLY RIGHT | The sequence is a question card, then an answer-and-explanation card, then the intro card. Notes are never opened automatically. TRANSFER and RECALL never both fire on the same opening. Still three text cards before play. |
| LL4 | Recall is not spaced repetition; it does not track errors and gives no reward. | CONFIRMED | Questions are picked at random from completed chapters, with no record of errors. |
| LL5 | The TAKE line is prepended to end cards that already run 150–250 words. | PARTLY RIGHT | TAKE is prepended (the `End.show` wrapper). In this slice the end-card paragraphs are about 80–160 words by static count; the `real` and `maths` text sits in collapsed sections. |
| UI1 | In Switches, the target fly is written out as a sentence instead of being drawn. | WRONG | The target fly is drawn at w × 0.25, labelled "target". The HUD repeats it as text. |
| UI2 | `Snd.chime` and `Snd.miss` are the only juice: no screen shake, particles, pop-ups or win animation. | PARTLY RIGHT | The game also uses `Snd.star`, `flood`, `dawn`, `click`, `peck` and `bitter`. `hunt.js` has screen shake (`shake = 0.7`), used by the favourites Lichen Wood and Bitter Wings. There are small animations: the River banks merging, the Clinic's red flash, the Pathogen epidemic, the Guest and Fruits trajectories. It is true that chapters VIII–XI have no particles, shake or pop-ups. |
| UI3 | Navigation is linear; you cannot replay a single level; the real explanations are hidden behind Notes. | PARTLY RIGHT | The menu says "Start anywhere" and opens any chapter. It is true there is no level select: "Play again" restarts the chapter. The `real` and `maths` text also appears on every end card under "The real thing" and "The numbers behind it". |
| UI4 | No visual identity per chapter; shared chart helpers; almost no creatures. | PARTLY RIGHT | The chart helpers are shared. But each chapter has its own colour theme (`theme`, applied by `applyTheme`), and many draw creatures: rabbits, flies, finches, frogs, fish, snails. |
| UI5 | Onboarding is all text. | CONFIRMED | `introHTML()` produces text only. |

### R3's "missing concepts" list

| # | Concept | Verdict | Note |
|---|---|---|---|
| MC1 | Mass extinction (Raup) | CONFIRMED absent | Raup 1991, *Extinction: Bad Genes or Bad Luck?*, is a correct reference. |
| MC2 | Adaptive radiation proper (cichlids) | CONFIRMED absent | Cichlids appear only as scale-eaters in Left Jaw, Right Jaw. |
| MC3 | Human evolution | PARTLY RIGHT | Lactase persistence (Bersaglieri 2004; Tishkoff 2007) and Tibetan high-altitude adaptation are already in The Sweep's text. Serial founder effects and archaic introgression are absent. |
| MC4 | Phylogenetic comparative methods | CONFIRMED absent | Felsenstein 1985 contrasts is the right reference. |
| MC5 | Population structure and Fst | PARTLY RIGHT | The Wahlund effect is in The Census; Fst is absent. The one-migrant-per-generation rule (Fst ≈ 1/(1 + 4Nm)) is correct. |
| MC6 | Quantitative genetics | PARTLY RIGHT | Realised heritability R/S is in the Lichen Wood, and correlated response in The Fancier. The G-matrix and Lande–Arnold 1983 are absent. |
| MC7–MC8 | GWAS; diversification rates | CONFIRMED absent | — |
| MC9 | Origin of life and major transitions | PARTLY RIGHT | "Many Become One" covers multicellularity. Eigen's error threshold is absent. |
| MC10–MC11 | HGT; biogeography and vicariance | CONFIRMED absent | — |
| MC12 | Senescence | PARTLY RIGHT | Live Fast covers extrinsic mortality and Austad's island opossums. Mutation accumulation and antagonistic pleiotropy are never named. |
| MC13 | Experimental evolution (Lenski) | PARTLY RIGHT | The Landscape (`ch25.js`) already cites Lenski's citrate line and potentiating mutations (Blount et al.). |

---

## 2. Game science errors R3 missed

Priority: **P1** factually wrong; **P2** misleading, overstated or internally inconsistent; **P3** nuance, citation or wording.

| # | Where | Problem | Fix / source | P |
|---|---|---|---|---|
| M1 | `ch26.js` `CH_CLOCK.beginLevel()` | `ts` (the dates) is shuffled, but the names are fixed by index. So "a pair of antelopes" can come out as 52 Myr and "two bat families" as 7 Myr. In L2, "plants and animals", "fungi and animals" and "two animal phyla" are given 150, 320 or 520 Myr. The real splits are roughly 1.5 Gyr, 1.0–1.5 Gyr and 550–700 Myr, and the slider stops at 800. Separately, "a pair of rodents' relatives" ticks at the same rate as everything else, although `real` says rodent clocks run faster. | Pair each date with a fixed, real pair (check TimeTree, Kumar et al. 2022). For example, L1: human–chimpanzee about 7, apes–Old World monkeys about 29, cats–dogs about 52 Myr. L2: marsupials–placentals about 160, mammals–reptiles about 320, jawed–jawless vertebrates about 500 Myr. Then add a fast-clock rodent pair as a deliberate trap. | P1 |
| M2 | `ch25.js` `TASKS[3]` and the `hatch()` message for task 4 | "Without abd-A … the abdomen becomes thorax-like, with legs." Wrong. Losing abd-A turns the abdominal segments into copies of A1, which has no legs (Sánchez-Herrero et al. 1985, *Nature* 313:108). Ubx and abd-A both repress the limb gene *Distal-less* in the abdomen (Vachon et al. 1992, *Cell* 71:437). Real "legs on the abdomen" come from losing Ubx regulation in A1 (bithoraxoid alleles: A1 develops like T3 and grows legs; Lewis 1978, *Nature* 276:565) or from deleting the whole bithorax complex (larval leg primordia in every abdominal segment). | Give A1 its own column and make target 4 "remove Ubx from A1". Or change the explanation: removing abd-A gives A1-like, legless segments. | P1 |
| M3 | `ch20.js` `song()`, `ideas[1]`, `check2()` note | The game says songs get "longer, richer, higher on one side, simpler on the other", and its card generator makes complexity rise steadily from one end of the ring to the other. In greenish warblers, songs are simplest in the south (the Himalayan middle of the ring) and become longer and more complex northward on **both** arms, in structurally different ways. The two Siberian ends therefore both sing complex songs, but different ones (Irwin 2000, *Evolution* 54:998; Irwin, Bensch & Price 2001, *Nature* 409:333). | Generate songs that are simple at the middle positions and complex at both ends, with a different structure on each arm, and fix both texts. *(Verify the details against Irwin 2000 before shipping.)* | P1 |
| M4 | `ch14.js` `SEAS[2]` ("Mosquitoes arrive"), the level 2 note, `real`; `ch99.js` `RECALL.virulence` | The chapter contradicts itself. `real` says myxoma virulence *fell* because mosquito transmission needs living, lesioned rabbits. Season 3 says mosquitoes *raise* the best virulence. Historically, mosquitoes were the vector from the 1950 release; the European rabbit flea was added from 1968. RECALL presents Ewald's argument as the settled answer. | Present Ewald's hypothesis as a hypothesis, with mixed support. Rename season 3 to a generic vector-borne or waterborne pathogen, not "Australia gets mosquitoes", and say outright that myxoma is the counterexample. Reword `RECALL.virulence` as "might … according to Ewald" and add the caveat to its explanation. | P1 |
| M5 | `ch14.js` `intro.hook`, `ideas[0]` | "The faster you replicate … the sooner it … fights you off" and "before it dies or clears you". In the model, recovery γ = g/(1 + 2v) *falls* as replication rises, and `maths` says faster replication counters immunity. | Make the text match the model: fast replication kills the host sooner but outruns clearance. | P2 |
| M6 | `ch22.js` `SA`, `SB` and `finish()` ("The Red Queen keeps genetic variation alive") | With selection strength 6, host types fall to frequencies of 1.1 × 10⁻⁷, 7 × 10⁻⁵ and 1.2 × 10⁻⁵ within 12 seasons. They return only because the model is deterministic with an infinite population. Over 24 seasons the system collapses to a single host type (minimum frequency 10⁻¹⁶). In any real population these genotypes would be lost, so the chapter's own dynamics contradict its lesson. | Add a mutation or immigration floor of about 1% per type per season, and lower the strength to 3–4. Tested: cycles persist and no type falls below 1%. Mention that strong matching-allele selection without such input erodes variation. | P2 |
| M7 | `ch22.js` `real` | The speed cost of resistance is credited to Brodie, Ridenhour & Brodie 2002. That paper is about the geographic mosaic. | Cite Brodie & Brodie 1999, *Evolution* 53:626 for the cost. Keep the 2002 paper for hotspots and coldspots. | P3 |
| M8 | `ch13.js` `intro.how` ("can mop up a small infection on its own") and the L1 lesson ("then letting the immune system finish") | In the model, 8-fold growth with 90% immune removal gives a net ×0.8 a day, so 5,000 cells need about 38 drug-free days to clear. Every toxicity-6 cure needs two late low doses after the opening high, high. | Either raise immune clearance (for example to 99% a day below 10⁵) or change the text to "high doses first, then low doses while the immune system helps". | P2 |
| M9 | `ch13.js` `intro.goal` | "The gentlest cure in both (toxicity 6 and 9)". The gentlest L2 cure is toxicity 8 (A, A+B, A+B). | Change the text to 8, or keep ≤ 9 as a threshold but stop calling 9 the gentlest. | P3 |
| M10 | `ch13.js` `real`, end insight; `ch99.js` `TAKE.clinic` | "Resistance is not caused by antibiotics." Mostly right, but antibiotics below the inhibitory dose can raise mutation rates (SOS response; Cirz et al. 2005, *PLoS Biol* 3:e176) and gene transfer (Beaber et al. 2004, *Nature* 427:72). The model itself also creates new mutants during treatment. | Add one clause: "… mostly selected, not created". | P3 |
| M11 | `ch25.js` `intro.hook` | "Most of evolution's big changes in form came not from new genes but from changing where and when old genes are switched on." Contested; coding changes and gene duplication are well documented (Hoekstra & Coyne 2007, *Evolution* 61:995). | Say "many", as `TAKE.switch` already does ("often"). | P2 |
| M12 | `ch25.js` `hatch()` interstitial | "Hox genes sit at the top of the developmental hierarchy." In flies they act downstream of the maternal, gap and pair-rule genes. | Call them "master selector genes for segment identity". | P3 |
| M13 | `ch25.js` L2 answer "b" and the end insight | Explains why the *same* enhancer keeps being hit (no side effects, fragile DNA) but never says *why losing spines is favoured*: positive selection in fresh water (Chan et al. 2010; insect predators grab spines, Reimchen 1980; low calcium). The fragile-site idea is a hypothesis ("may" in `real`) but is given as fact in the quiz. | Add the selection step, and hedge the fragile-site claim. | P2 |
| M14 | `ch28.js` `choose()` message, set 2 | "Three independent insertions … group whales with hippos." Only SINE 1 and SINE 2 are present in whale and hippo alone; SINE 3 is shared by whale, hippo and cow (which supports whales + hippos + ruminants, correctly, but is uninformative in this four-taxon set). | Say "two". | P2 |
| M15 | `ch28.js` `DATA[1]` | "Lives in water" is scored as a shared derived trait of whales and hippos. Their aquatic skin adaptations evolved independently (Springer et al. 2021, *Curr Biol* 31:2124), so this is the very convergence the chapter warns about. | Replace it with another retrotransposon insertion. Do not use the double-pulley astragalus: it unites all artiodactyls including whales, not whales with hippos. Or turn "lives in water" into an explicit convergence trap. | P2 |
| M16 | `ch29.js` `CH_FIRE` hook, `ideas[0]`, drawing | Oaks are cast as the fire-sensitive, shade-everything climax. In many systems oaks are fire-adapted and are maintained *by* fire, and fire exclusion lets shade-tolerant maples replace them (Nowacki & Abrams 2008, *BioScience* 58:123). | Rename the late stage "shade-tolerant trees (maple, beech)" or use a fire-sensitive conifer. | P2 |
| M17 | `ch29.js` `CH_FIRE.maths`, level 2 items | The Lotka–Volterra rules (both α > 1 → priority effect; one α > 1 → one winner) hold only with equal carrying capacities. The general conditions are α₁₂ vs K₁/K₂ and α₂₁ vs K₂/K₁. | Add "with equal carrying capacities". | P3 |
| M18 | `ch29.js` `CH_FIRE.maths` | Says diversity is Shannon evenness "averaged over 300 years". The code (`sum += H * v`) weights it by plant cover, as `MODEL.fire` and the notes say. | Make `maths` match the code. | P3 |
| M19 | `ch29.js` `CH_ISL.maths` and the L2 end insight | "If h falls below e/c, the species dies out … an extinction debt." This conflates the extinction *threshold* (h = e/c; Lande 1987, *Am Nat* 130:624) with the extinction *debt*, which is the time lag before doomed populations disappear (Tilman et al. 1994, *Nature* 371:65). | Name both: below the threshold the species is doomed; the debt is that it still looks present for a while. | P2 |
| M20 | `ch20.js` `CH_RING.intro.hook` | "Neighbours interbreed all the way round" contradicts the chapter's own `real` (genetic breaks within *Ensatina*; Pereira & Wake 2009, *Evolution* 63:2288). | Hedge the hook: "mostly", "as the classic picture has it". | P2 |
| M21 | `ch20.js` `CH_RING.real` | The two warbler end forms are said to coexist "without interbreeding". Rare hybrids are documented (Alcaide et al. 2014). | Say "rarely interbreeding". | P3 |
| M22 | `ch27.js` `CH_ARCH.begin2()` question 1 | "Medium ground finches are alone on the island" (1977). The cactus finch *G. scandens* also breeds on Daphne Major. | Say "no large ground finches lived there". | P3 |
| M23 | `ch27.js` question 2 | Presents the reversal as happening in 1983. Selection favoured small birds in the 1985 dry season that followed the 1982–83 El Niño (Gibbs & Grant 1987, *Nature* 327:511). | Say "In the dry years after the 1983 El Niño …". | P3 |
| M24 | `ch26.js` `CH_SWEEP.real` | Credits soft sweeps to Pennings & Hermisson (2006). The concept and the term come from Hermisson & Pennings 2005 (*Genetics* 169:2335); the 2006 papers extend it to recurrent mutation. | Cite both. | P3 |
| M25 | `ch26.js` `CH_CLOCK.real` | Credits haemoglobin *and cytochrome c* to Zuckerkandl & Pauling. The cytochrome c comparisons were Margoliash 1963 (*PNAS* 50:672). | Add Margoliash. | P3 |
| M26 | `ch23.js` `real`, L2 end note | "Passed only from parent to offspring … tends to evolve toward benefit." The major exception is maternally transmitted reproductive parasites, such as *Wolbachia* with cytoplasmic incompatibility and male killing (Werren et al. 2008, *Nat Rev Microbiol* 6:741). | Add "unless it can manipulate host reproduction". | P3 |
| M27 | `ch28.js` `CH_WEB.SP` | The removal results for whelk, mussel, barnacle, limpet and chiton (14, 17, 14, 13, 15 species) are invented, not Paine's data; Paine removed only *Pisaster*. | Label them "illustrative" in the notes. | P3 |
| M28 | `ch20.js` `CH_DOUBLE` notes; intro | The notes say tetraploids are "a little more vigorous", but `VIG = 1.8` makes them 80% more likely to seed a square. Triploids are presented as completely sterile; the "triploid bridge" is a real route to tetraploidy (Ramsey & Schemske 1998). | State the 1.8× advantage, and say "mostly sterile". | P3 |
| M29 | `ch14.js` level 2 co-infection | The "best" rate is a best response to a rival fixed at the solo optimum, not the evolutionarily stable rate, which would be higher still. Co-infection does not always raise virulence: shared public goods or spite can lower it (Brown, Hochberg & Grenfell 2002, *Trends Microbiol* 10:401). | Add one sentence of hedging in `maths`. | P3 |
| M30 | `ch99.js` `CH_MENDEL.confNote` | "You can call it pure with about 99.9% confidence" treats the chance of the data given a carrier (1/1,024) as the chance the plant is pure. With an F₂ prior of 1 pure : 2 carriers, the posterior is about 99.8%. Close, but the reasoning is wrong. | Say: "a carrier would give this only 1 time in 1,024". | P3 |
| M31 | `ch27.js` `CH_COPY` L2 ("A new beneficial function spreads") | Presented as deterministic. Most new beneficial mutations are lost by drift; the fixation probability is about 2s. | Say "is favoured and can spread". | P3 |

The remaining science in this slice checked out against the literature: Kidwell, Brennecke, Force, Bersaglieri, Tishkoff, Schmidt 2010, Orr 1995, Coyne & Orr 1989, Lemmon 2009, Bush 1969, Feder 1994/2003, Felsenstein 1981, Stebbins 1949, Irwin 2001, Wood 2009, Levin 1975, Ownbey 1950, *Spartina anglica* around 1890, Grant & Grant, Lack 1947, Baum 2005, Fitch 1971, Nikaido 1999, Paine 1966, Estes 1974/1998, Carpenter 1985, MacArthur & Wilson 1967, Simberloff & Wilson 1969, Levins 1969, Hanski, Connell 1978, Fox 2013, Peay 2012, Fukami 2015, Dybdahl & Lively 1998, Decaestecker 2007, Geffeney 2005, Fenner & Ratcliffe 1965, Kerr 2017, Kiers 2003, Bull, Molineux & Rice 1991, Herre 1993, Chan 2010, Lewis, Drlica & Zhao 2007, and Llewelyn 2017. The JC formula, the island equilibrium, Levins p*, the four-taxon parsimony rule, m* in The Guest, the ring interbreeding values and 0.55³ ≈ 17% are all arithmetically correct.

---

## 3. Corrections future agents must apply

Edit the source in `games/endless-forms/source/`, then rebuild `Endless_Forms_v1.html` with `build.py`.

**P1: factually wrong.**
1. **`ch26.js` `CH_CLOCK.beginLevel()`**: stop shuffling dates independently of names, and replace the named pairs with real ones whose dates match (M1). Raise the L2 slider maximum if any pair is older than 800 Myr.
2. **`ch25.js` Switches target 4**: rewrite the mechanics or the explanation so that losing abd-A gives A1-like, legless segments. If you keep "legs on the abdomen", get there through losing Ubx in A1 (bithoraxoid) (M2).
3. **`ch20.js` Ring L2**: regenerate the songs so they are simple at the southern middle and complex at both northern ends, in different ways. Fix `ideas[1]` and the `check2()` note (M3). Verify against Irwin 2000.
4. **`ch14.js` Pathogen**: fix the mosquito contradiction. Rename season 3, state that Ewald's idea is a hypothesis with mixed support, and name myxoma as the counterexample. Reword `ch99.js` `RECALL.virulence` (M4, PA3).

**P2: misleading or internally inconsistent.**
5. **`ch14.js`** hook and `ideas[0]`: faster replication *resists* clearance in this model (M5). Add one sentence to `real` that the trade-off hypothesis has limited empirical support (PA2).
6. **`ch22.js`**: add a 1% mutation or immigration floor and set `SA` and `SB` to 3–4, so that "keeps variation alive" is true of the model (M6).
7. **`ch13.js`**: fix "the immune system can mop up … on its own" and "letting the immune system finish" (M8). Add Read, Day & Huijben 2011 to `real` beside Llewelyn 2017 (CL2).
8. **`ch25.js`**: change "Most" to "Many" in the hook (M11), fix the hook wording to "pelvic spines" (SW2), add the selection step and hedge the fragile site in L2 (M13), and point out colinearity in play (SW4).
9. **`ch28.js`**: change "Three independent insertions" to "two" (M14), and replace the "lives in water" character (M15).
10. **`ch29.js`**: replace oaks as the fire-sensitive climax (M16), and separate extinction threshold from extinction debt (M19).
11. **`ch20.js`**: hedge the Ring hook (M20). In Doubling, name autopolyploidy and allopolyploidy and mention unreduced gametes (DB2, DB3).

**P3: citations and wording.**
12. **`ch22.js`** `real`: cite Brodie & Brodie 1999 for the speed cost (M7).
13. **`ch13.js`** `intro.goal`: the gentlest L2 cure is toxicity 8 (M9). In `real`, the end insight and `TAKE.clinic`, say "mostly selected, not created" (M10).
14. **`ch25.js`**: change "top of the developmental hierarchy" to "selector genes" (M12).
15. **`ch29.js`**: add "equal carrying capacities" to the Lotka–Volterra rules, and make the `maths` diversity definition match the code (M17, M18).
16. **`ch20.js`**: warbler end forms "rarely" interbreed (M21). In Doubling, state the 1.8× vigour advantage and say triploids are "mostly" sterile (M28).
17. **`ch27.js`**: Daphne 1977 "no large ground finches" (M22); "dry years after the 1983 El Niño" (M23); Copy L2 beneficial mutations "can spread" (M31).
18. **`ch26.js`**: cite Hermisson & Pennings 2005 (M24) and Margoliash 1963 (M25).
19. **`ch23.js`**: add the *Wolbachia* exception (M26).
20. **`ch28.js`** `CH_WEB`: label the non-*Pisaster* removal results as illustrative (M27).
21. **`ch14.js`** `maths`: the co-infection optimum is a best response, not the evolutionarily stable rate (M29).
22. **`ch99.js`** `CH_MENDEL.confNote`: do not equate P(data | carrier) with confidence that the plant is pure (M30).

**R3 advice to drop, because the game already does it:**
- adding the Mexican inversion origin to Two Fruits (FR4);
- adding a "messier rings" caveat to `real` (RG2);
- adding the Yellowstone controversy (WB2; only a full level is missing);
- making myxoma the Pathogen's anchor (PA4);
- adding corridors to Islands (IS2);
- the Clock as a "quiz level 2" (PAT).

When you build new levels from R3's ideas, start from these corrected facts, not R3's wording.
