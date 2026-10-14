# D2. Game structure and production roadmap

*Creative director. Follows the binding brief D0. D2 owns the triage of every existing unit; acts, prerequisites and course routes; whether a concept gets its own game; the notation table; concept codes and the item bank; the teacher-feature roadmap; and the schedule for framework change requests. D1 designs the favourites and the template, D3 the rebuilds and new games, D4 the look, layout and recurring-organism proposal. Section 17 answers D0's three requirements.*

---

## 0. Decisions in brief

1. **One product, Endless Forms, on one world, the Tangled Bank.** The player is the new keeper of a field station on a living island coast. Endless Forms is the game, the Tangled Bank is the world and its sandbox, Equilibrium is Act 3.
2. **Twelve acts plus a capstone sandbox, laid out as a hub.** A 22-unit spine (about 6 hours) passes through every act and every favourite; the full core is 59 units (about 15 hours); courses take named routes.
3. **Triage:** no Endless Forms chapter is cut outright, but every level-2 quiz is; Equilibrium L10–L11 are cut and replaced; Food Web, Islands and After the Fire leave the core path.
4. **Equilibrium stops being a separate product.** It becomes Act 3 (four units) plus parts of three Act 4 units, merged with the Census, on one organism with one notation.
5. **The learning loop lives in the simulation.** Predictions are gestures, explanations are interventions, transfer is a rerun. Notes is retired.
6. **Score what could be known:** Discover, Predict and Transfer stars; no "% of best"; no star for a click.
7. **Teacher mode starts in Phase 0**, in the plain-JS shell.

---

## 1. The frame: three options, one choice

| Criterion | A. Field station on the Tangled Bank | B. The Notebook (today's shell) | C. The Freezer (an evolution lab) |
|---|---|---|---|
| Creatures persist across units | Yes: resident populations per place | No | Yes, as flask lines |
| Player's default role | Keeper of the environment (the D0 template role) | Varies | Experimenter who "designs" organisms: misconception risk |
| Sandbox capstone | The map *is* the sandbox | Bolted on | A bench of flasks, no ecology |
| Behaviour, ecology, deep time, humans | Places, Expeditions, Archive | Yes | Poorly: hermit crabs do not live in flasks |
| Designed versus real data | Built into the geography | Labels only | Strong, for experiments only |
| Teacher fit (seeds, replicates) | Good: a place or unit is an assignment | Good | Best |
| Canvas2D build cost | Medium | Low (exists) | Low to medium |
| Delight | High: a place you return to and change | Low: 48 rows | Medium |

**Choice: A, with B as its interface and C as its replay mechanic.** The notebook shell (paper cards, phylogeny spine, title tree, Fraunces/Spectral identity) becomes the keeper's notebook and bestiary. Lenski's freezer becomes the diegetic reason for replays and shared seeds: every unit freezes a sample each few generations, and "What if?" thaws one and changes a single thing.

---

## 2. The world: the Bank, the Lab and the Expeditions

The station map has three layers, one per kind of truth.

- **The Bank (the model world).** About twelve places, each named once (R8 counted five confusable island settings): the Wood (peppered moths), Beetle Isle (the allele-wearing beetle), the Streams (guppies), the Shore (hermit crabs), the Lake (cichlids), the Meadow (flowers, pollinators, ground squirrels), the Hedge (starlings, nests), the Pond (Daphnia), the Fig Grove, the Valley (salamanders), the Outer Islands (finches, opossums), the Warren (rabbits). Each place keeps a **resident population** as plain-JSON `Gen` state with its history, shown with a generation count and years beside it ("214 generations since you arrived"): threshold concept 3, scale.
- **The Lab (controlled experiments):** Mendel's garden, the Mixer's hoppers, flasks, plates, the sequencer.
- **The Expeditions (real cases):** pins on a world map for the Black Country 1848–1960, the Aripo River, Daphne Major, Isle Royale, myxoma in Australia, the malaria belt, the fossil cliffs, Out of Africa. Each carries "history compressed" and ×N tags and ends in the **Archive**, the station's room of real data (Majerus, the Grants, Allison 1954, Lenski).

**Persistence rule.** Every level starts from a canonical seeded state, so shared seeds stay reproducible. Selected units then write back to the resident population: the moths you shaped in Act 0 are the moths the soot reaches in Act 4 and the moths in the sandbox. Teacher mode can force canonical starts.

**Look.** D2 prefers one illustration style with palettes per place, not per chapter; D4 rules (D0 §5.8).

**Recurring organisms (D4 proposes, D2 approves).** Requirements: one anchor species per act, appearing in at least two of its units and in the sandbox; the beetle in every HW-lens unit of Acts 3–4 unless the real system is the point (moths, humans); no species drawn twice in different styles. Provisional anchors for D4 to confirm: moth (Acts 0, 4), pea and fruit fly (2), beetle (3–4), hermit crab and cichlid (5), starling (6), guppy (7), ground squirrel (8), fruit fly (9), finch (10), bacteria and humans (11).

**Narrative.** The previous keeper (fictional) left one margin question per act, shown on the map, never as a card: "The moths on the north trunks are paler than last spring. Who chose?" No cutscenes, no dialogue.

---

## 3. Structure: twelve acts, one spine, many routes

The order follows R8 §5, with tree reading in Act 1, the Coalescent after drift, and Why Sex? after selection. ★ marks the spine; "new" marks D3 games placed here.

| Act | Units (★ spine) | Needs | Min |
|---|---|---|---|
| 0 The Wood | ★The Lichen Wood (hook version) | — | 15 |
| 1 Ancestry and evidence | ★Tree Thinking; The Dig (new: strata, log-time zoom) | 0 | 30 |
| 2 Heredity | ★Mendel's Garden; ★The Scribe; Crossing Over; The Breeder; The Royal Line (new) | 0 | 75 |
| 3 Equilibrium: the gene pool | ★The Mixer; ★The Census; The Pedigree; Invisible Carriers | 2 | 55 |
| 4 Forces | ★The Black Country; ★Drift Casino; Lottery of the New; The Leaky Tap; Gene Swamping; Malaria Coast (all new) | 3 | 90 |
| 5 Adaptation and coevolution | ★Bitter Wings; ★Left Jaw, Right Jaw; ★Hawks and Doves; Seed Rain; Lock and Key; Valley Crossing; field problem "Adaptive or not?" | 4 | 95 |
| 6 Behaviour and life history | ★The Forager; The Crowd; The Slow Island; The Pond | 5 | 60 |
| 7 Sex | ★Why Sex?; ★The Raffle; Two Sizes; The Strutting Ground; The Fig; The Selfish Spindle; The Meadow | 5 | 105 |
| 8 Cooperation and conflict | ★Alarm Call; ★The Commons; The Nest; Blood Debts; Many Become One; The Guest; The Hive (new) | 6, 7 | 105 |
| 9 Genomes and development | ★Switches; ★The Coalescent; Copy and Paste; The Sweep; The Clock | 1, 4 | 75 |
| 10 Species and macroevolution | ★The River; ★The Archipelago; Two Fruits; The Ring; Doubling; Extinction Roulette (new); Pseudoreplication Trap (new) | 1, 4, 5 | 105 |
| 11 Applied and human | ★The Clinic; ★Out of Africa (new); The Pathogen; Genetic Rescue; Human Variation (new, after a dedicated fact-check) | 9, 10 | 75 |
| Capstone | The Tangled Bank sandbox | grows from Act 0 | open |
| Appendix | Ecology field guide: The Food Web, Islands, After the Fire | — | optional |

**Side quests**, unlocked from their place: The Warm Nest (sex determination), The Placenta (imprinting), Red Fire (greenbeards), Song School (cultural evolution), a GWAS Manhattan-plot hunt, Drifting Continents (biogeography), Kettlewell's Recapture, and an evolutionary-medicine unit, promoted to Act 11 if the pilot shows need.

**Hub, not line.** Acts 0–4 unlock in order, because each needs the last. From Act 5 any act whose prerequisites are met is open. The station glows a suggested next unit; a locked unit opens with "Jump ahead", which warns once and is logged. Teacher-assigned units are always open.

**Course routes** (shareable presets): *first-year evolution*, the spine (22 units, ~6 h); *population genetics*, Acts 2–4 and 9 (20 units); *behavioural ecology*, Acts 5–8 (24 units); *Equilibrium*, Act 3 plus Royal Line, Black Country, Drift Casino, Leaky Tap, Gene Swamping and Malaria Coast (10 units, ~2.5 h); *macroevolution and humans*, Acts 1, 10 and 11.

**Concept placement for D0's gap list.** X-linkage gets its own unit (Royal Line). ABO becomes the "Blood Bank" level of Invisible Carriers (r = √O is the logic of q = √aa). The gym level (misconception 2) goes into The Breeder and cave-fish eye loss into Seed Rain, so the player stays the environment. The Cuckoo is the Nest's boss. Lock and Key keeps both levels, and Why Sex? reuses its parasite model with an explicit bridge, resolving the Red Queen duplicate. Gene trees versus species trees is a Coalescent level; hybridisation goes into the Archipelago.

---

## 4. Triage of every existing unit

KEEP & POLISH: core kept, levels may be added. REBUILD: model or idea kept, play redesigned by D3. MERGE, DEMOTE (appendix or side quest), CUT. D1 owns the favourites.

**Endless Forms (48)**

| # | Unit | Verdict | Act | Reason |
|---|---|---|---|---|
| 1 | Mendel's Garden | KEEP & POLISH | 2★ | Best inference verb (likelihood, L2 χ²). A season cost per cross and calibrated confidence calls kill "test-cross everything". |
| 2 | The Scribe | REBUILD | 2★ | A typing test treating mutation as error (misconceptions 5, 16); becomes a DFE lineage plus Luria–Delbrück plates. |
| 3 | Crossing Over | REBUILD | 2 | The player places crossovers; becomes an introgression breeder with random crossovers. Keep L1–L2 diagrams. |
| 4 | The Census | MERGE (host) | 3★ | Best HW detective; absorbs Equilibrium L8, L15, L17 and Case Files (§5). |
| 5 | The Coalescent | REBUILD, MOVE | 9★ | Precedes drift; guess-then-watch. Drag lineages back through a Wright–Fisher grid. |
| 6 | Drift Casino | MERGE (host) | 4★ | Strong frame, empty between bets; absorbs Equilibrium L12–L13 and Castaways L1. |
| 7 | The Castaways | MERGE (split) | 4, 11 | L1 → Drift Casino; L2 Isle Royale → Genetic Rescue. |
| 8 | Why Sex? | REBUILD, MOVE | 7★ | Switches the whole pond, with no real twofold cost (R7 D5); a clone invades a sexual pond. |
| 9 | The Lichen Wood | KEEP & POLISH | 0★ | The hook; add overproduction, pinning, apostatic selection, h² by level. |
| 10 | The Black Country | KEEP & POLISH | 4★ | Gene-pool lens, carrier tail, one carbonaria origin; absorbs Equilibrium L9. |
| 11 | The Fancier | REBUILD → The Breeder | 2 | Visual 3.0, no tension; changing briefs, F, plateau, gym level, h² falling in a better environment. |
| 12 | The Sieve | REBUILD → Seed Rain | 5 | The player draws the answer; now sets seeds and weather, and fitness emerges. Keep the split challenge. |
| 13 | Bitter Wings | KEEP & POLISH | 5★ | Variable model:mimic ratio, Müllerian level, visible predator memory. |
| 14 | The Landscape | REBUILD → Valley Crossing | 5 | Foresighted uphill picks; a population cloud on a height map, three N regimes. |
| 15 | Left Jaw, Right Jaw | KEEP & POLISH | 5★ | Several fish, live oscillation, lizard rock–paper–scissors boss, low-h² trait. |
| 16 | Hawks and Doves | KEEP & POLISH | 5★ | The player's strategy invades a beach full of hermit crabs. |
| 17 | Blood Debts | REBUILD | 8 | Fixed strategies; bonds, kin in the roost, partner choice, a write-your-rule tournament. |
| 18 | Fisher's Brood | REBUILD → The Fig | 7 | Linear payoff, scripted population; fertilise-or-not laying, local mate competition. |
| 19 | Two Sizes | REBUILD | 7 | Solved by holding "tiny"; the player releases mutants into the PBS sea. |
| 20 | The Lek | MERGE with TB Aripo → The Strutting Ground | 7 | No runaway despite its subtitle; one campaign from OSR and Bateman to runaway, handicap (keep L2) and the lek paradox. |
| 21 | The Raffle | KEEP & POLISH | 7★ | A visible queue of females, remating, precedence, a real picture. |
| 22 | The Selfish Spindle | KEEP L1, REBUILD L2–3 | 7 | L1's binomial detective is a real verb; L2 is luck, L3 one obvious choice. |
| 23 | The Meadow | REBUILD | 7 | The player designs flowers (misconception 1); becomes the pollinator community, with S-alleles. |
| 24 | Alarm Call | KEEP & POLISH | 8★ | Kin from a family tree, deaths on screen, correct cost signs. |
| 25 | The Nest | REBUILD | 8 | Free eggs; costly eggs, begging against an evolving parent rule, cuckoo boss. |
| 26 | The Commons | MERGE with TB Commons | 8★ | Keep EF L1 (Simpson's paradox); TB model and Price bars replace L2; add a self-benefit dial. |
| 27 | Many Become One | REBUILD | 8 | Whack-a-mole at 6% cheaters per division; play the single-cell bottleneck. |
| 28 | Live Fast | MERGE into TB Slow Island | 6 | Corner optima, imposed ageing; Slow Island evolves senescence. |
| 29 | The Forager | KEEP & POLISH | 6★ | One day on one map; the MVT tangent from the player's own data. |
| 30 | The Crowd | REBUILD | 6 | Scripted to the IFD; fish follow a local rule so the IFD and undermatching emerge. |
| 31 | Shape-shifters | REBUILD → The Pond | 6 | Worksheet then quiz; draw a reaction norm, watch a specialist lineage crash. |
| 32 | Lock and Key | REBUILD | 5 | The player forecasts, then sets snake resistance; parasites on host doors; the player sets newt toxicity. |
| 33 | The Clinic | KEEP & POLISH | 11★ | Ward, plasmid pathogen, mutant selection window, a containment level. |
| 34 | The Pathogen | REBUILD | 11 | The player sets virulence; strains compete across a warren. |
| 35 | The Guest | KEEP L1, REBUILD L2 | 8 | L1 sanctions puzzle is a real verb; L2 is a quiz. |
| 36 | Switches | KEEP & POLISH | 9★ | A1 column, colinearity as a mechanic, a drawn larva, Pitx1 circuit. |
| 37 | Copy and Paste | REBUILD | 9 | Two quizzes; genome-as-city with maternal piRNA. |
| 38 | The Sweep | KEEP L1, REBUILD L2 | 9 | L1 search is good; L2 becomes decoy scans with a false-positive cost. |
| 39 | The Clock | REBUILD | 9 | Arithmetic with a slider; ticks on a tree, calibration bars, a fast-rodent trap. |
| 40 | The River | REBUILD | 10★ | Keep the Orr snowball and make it visible; reinforcement from heritable preference. |
| 41 | Two Fruits | REBUILD | 10 | All prediction quiz; a fly swarm on two trees and a draggable inversion. |
| 42 | The Ring | REBUILD | 10 | Walk a salamander round the valley; a hidden internal break. |
| 43 | Doubling | KEEP L1, REBUILD L2 | 10 | Minority cytotype exclusion is rare and good; L2 becomes meiosis with unreduced gametes. |
| 44 | The Archipelago | REBUILD | 10★ | Radiation without radiating; the player sets seed supply across islands. |
| 45 | Tree Thinking | REBUILD, MOVE | 1★ | Chapter 45 and a quiz; drag-and-rotate trees, node-counting and convergence traps. |
| 46 | The Food Web | DEMOTE | Appendix | No evolutionary process (R8); invented removals labelled "illustrative". |
| 47 | Islands | DEMOTE | Appendix | Ecology, not evolution; its SLOSS idea feeds Genetic Rescue. |
| 48 | After the Fire | DEMOTE, gated | Appendix | Rewards the IDH as a rule; ships only once rescored on flat and monotonic landscapes. |

**Every level-2 quiz is cut as a quiz** (Archipelago, Food Web, Islands, Fire, Two Fruits, Guest, Copy L1 questions, Switches L2, Landscape L2, Coalescent L3, Shape-shifters L2, Live Fast L3); their content returns as gestures or review items.

**Equilibrium (17 levels and Case Files)**

| Levels | Verdict | Act | Reason |
|---|---|---|---|
| L1–L3 | MERGE → The Mixer | 3★ | Lens, jars and Yule's failed prediction in 3 minutes of play. |
| L4–L6 | MERGE → The Mixer | 3★ | Hoppers fill the p² square; tile collapse kept; unequal-sex twist. |
| L7 | KEEP as Mixer boss | 3★ | Spatial prediction on the triangle (rounding fixed in G7); an X-linked round leads to Royal Line. |
| L8, L15, L17, Case Files | MERGE → The Census | 3★ | One detective with an evidence budget and randomised forces. |
| L9 | MERGE → The Black Country | 4 | Dominant versus recessive runs in the Hunt engine. |
| L10 | CUT | — | Inert; replaced by The Leaky Tap. |
| L11 | CUT | — | Nothing opposes migration; replaced by Gene Swamping. |
| L12–L13 | MERGE → Drift Casino | 4 | Buri's 107 bottles, Ne puzzles, a 12-allele bottleneck scored on alleles kept. |
| L14 | REBUILD → The Pedigree | 3 | F by path counting; one mating model per label (G7 found three); disassortative run from p = 0.8. |
| L16 | KEEP & POLISH → Invisible Carriers | 3 | Genetic counsellor, cousin marriage with F, ABO level. |

**Tangled Bank**

| Unit | Verdict | Where | Reason |
|---|---|---|---|
| Lichen Wood, Black Country, Bitter Wings | MERGE into EF | — | Duplicates; TB art and the `mu: 0.01` fix feed D1. |
| Streams of Aripo | MERGE → The Strutting Ground | 7 | Its painted streams become a sandbox place. |
| The Slow Island | KEEP (host) | 6 | Evolves senescence; absorbs Live Fast; Austad's result is ~25% longer life. |
| The Commons | KEEP model (host) | 8 | Price bars become a shared widget. |
| Steward mode | KEEP → capstone | Sandbox | §7. |

---

## 5. Equilibrium and the Census: one Act 3

**The overlap.** Equilibrium has the better derivation (lens, jars, area square, tile collapse, triangle). The Census has the better detective (sampling cost, strata, a correct p-value, Wahlund = 2Var(p)). They use different organisms and notation.

**The resolution.** Act 3, titled "Equilibrium" and opened by Equilibrium's title equation over three beetles, has four units on Beetle Isle:
1. **The Mixer** (about 12 minutes): carriers found with the genotype lens, alleles flying to jars, Yule's prediction failing on screen, egg and sperm hoppers filling a bin whose widths are p, the unequal-sex twist, the triangle prediction as boss.
2. **The Census** (15 minutes): R4's "Saboteur" on the Census mechanics. Hidden, randomised, realistic forces; instruments bought with field days (genotype n beetles, split by region or age, count arrivals, mark–recapture); a diagnosis with confidence, scored on calibration; low-power samples (n = 40 against 30,000). Boss: p never moves but adults sit above the curve. Genotyping does the counting the snails' codominance did.
3. **The Pedigree** (12 minutes): F is named once, here, and the same symbol is used everywhere after.
4. **Invisible Carriers** (10 minutes): q = √aa, cousin risk with F = 1/16, ABO, and a boss where hidden structure biases the estimate.

The phenotype/genotype/jar lens and the triangle mini-map then become **HUD widgets** in every population unit and the sandbox (D1 behaviour, D4 look). Hardy–Weinberg becomes the instrument panel for the rest of the game.

**Does Equilibrium survive standalone?** As a route, yes, exportable as its own single-file build. As a codebase, no: `Equilibrium_HW_v2.html` (with the G7 corrections copied into the shipped file) stays downloadable as "classic" until Act 3 ships, then is archived. Its maths (`hwExp`, `wfNext`, `chi2`) moves into the shared genetics module as special cases of `Gen`, the only genetics engine.

---

## 6. Progression and meta-game

**What the player collects: knowledge and populations, nothing else.**
- **The bestiary.** One page per species, filled with the player's own data (the moth page stacks the tone histograms of every generation you hunted, then the Archive's real frequencies, marked "real"), plus its MODEL card.
- **The specimen drawer.** Press and hold to pin any individual; its page shows it never changed while its population did (misconception 3).
- **Laws of the Bank.** The TAKE lines as cards earned only by a Transfer star. "Antibiotics select resistance; they rarely create it" is earned by winning the Clinic's transfer level.
- **Tools.** Each unit unlocks one sandbox lever: predator (Act 0), soot and Clean Air (Black Country), volcano (Drift Casino), ferries (Gene Swamping), mutagen tap (Leaky Tap), captive pens (Genetic Rescue), drugs (Clinic).
- **The title tree** gains a tip per completed unit: a record of what the student understands.

**Gates.** The prerequisite graph and, from Act 2, an end-of-act **field problem**: a sandbox scenario using only that act's tools (Act 4: "keep three alleles on five islands for 200 generations with two ferries"). Field problems are the act-level transfer test.

**Refused:** coins, energy, daily rewards, speed leaderboards, loot. An optional class board ranks prediction calibration only.

---

## 7. The Tangled Bank sandbox and scenario cards

**Where it sits: everywhere, and at the end.** After Act 0 the sandbox is one place with one tool. It grows with every unit into the capstone: Steward mode generalised to a map of linked places where the player places predators, ferries, soot, floods, drugs and pens. Any population opens with the gene-pool lens and triangle dot, any structured one with Price bars; any lineage can be frozen, thawed and rerun beside replicates. It is also the lecture tool.

**Scenario card format.** JSON: `{id, title, prompt (≤40 words), places, populations, tools, parameters with locks and realism tags, seed, duration, prediction gesture, goal predicate, stars, debrief prompts, concept codes}`. The face shows a title, one sentence, tool icons, a measurable goal and a share code with QR. Four kinds:
- **Challenge:** "Make carbonaria rise and fall within 80 generations without migration."
- **Experiment:** no goal; predict first, then run replicates. "Halve N. Sketch the fan first."
- **Lecture demo:** teacher-run, stepped, answer hidden until "reveal".
- **Assessment:** fixed seed, scored prediction, no feedback until submitted.

Designers write the first 40 cards, starting with the Sieve's "split the flock" and the Casino's predict-before-bet; teachers get an editor in Phase 3.

---

## 8. The learning loop inside play

Predict → act → observe → explain → transfer stays the spine of every level (README principle 1), with no step on a text card.

| Step | How | Replaces |
|---|---|---|
| Predict | A gesture: drag the ghost where p will go, place the histogram ghost, tap the triangle, put chips on the fan. Scored by distance to the expected outcome. | TRANSFER cards; MCQ predictions |
| Act | The verb: hunt, release a mutant, set the weather, open a ferry, dose a ward. | Sliders and Run |
| Observe | The picture changes first (moths vanish, chicks fledge), then the live graph, always visible, never pausing: realised solid, expected dashed ghost, a "you" marker. | Notes → Graphs, empty in every chapter checked (D0 §5.5) |
| Explain | By intervention: flip one switch (no variation, no inheritance, no migration) and rerun from the freezer; mark the cause on the map. Once per act, an optional one-sentence "explain why" scored ACORNS-style. | 200-word end cards |
| Transfer | "What if?" reruns one changed parameter; each unit's last level moves to a new organism or to trait loss (Nehm & Ha 2011). | — |

**Each part of `ch99.js`** (v2 files load after it, so each is handled on purpose; D0 §6.2):
- **TAKE:** kept as Laws of the Bank; rewritten where a rebuild makes the old line false.
- **BRIDGE:** becomes the selected unit's caption on the map (≤25 words), never part of the intro.
- **TRANSFER:** each of the six becomes the target unit's first action. Soot: before it arrives, drag the histogram where tomorrow's moths will be.
- **RECALL:** becomes the **Field Review**, a five-box Leitner deck keyed on concept codes, at most five items a visit, at the station, never on opening a unit. Distractors come from CINS and ACORNS; every item asks for confidence; many are mini-simulations.
- **MODEL:** a card per unit (assumptions, ×N tags, what it cannot show, principle / model / nature) behind a chip on the live HUD and in the debrief; the 22 missing ones are written with each redesign (G6).
- **Patches to old objects** (`CH_SOOT.intro.how`, `CH_MENDEL.confNote`, `CH_CASINO.newTable`, the Lichen `Hunt.interlude`): re-implemented as standard gestures or dropped; D1 decides for the Hunt.

**Notes is retired.** Its parts go to the live graph, the MODEL chip and the bestiary. No optimum appears during play. **End cards** follow D0: TAKE line, at most 60 words, one chart above the fold, counting stars, then "What if?", "Why?", "Notebook", "Next".

---

## 9. Onboarding: the first ten minutes

Act 0 is the only onboarding. D1 designs the Lichen Wood; D2 specifies what it must teach and the interface grammar it installs.

| Time | What happens | Installs |
|---|---|---|
| 0:00 | Title tree, Darwin's line, one button: "Begin". No menu. | — |
| 0:05 | The Wood. A ghost hand taps a moth for 3 s. HUD: "You are a bird. Eat the moths you can see." | First action within 10 s |
| 0:20 | Morning 1 (12 s); eaten moths pop. | The verb |
| 1:00 | Night: each survivor lays dozens of eggs; most caterpillars starve, because the bark holds 30 moths. | Overproduction, carrying capacity |
| 1:30 | Drag the ghost on the tone histogram: where will tomorrow's moths be? | Prediction gesture |
| 3:00 | Press and hold a moth to pin it: it never changes; the histogram does. | Misconception 3 |
| 5:00 | Eat at random: "Interesting result. Nothing moved. Why?" | Failure as data |
| 6:30 | Flip "no variation": selection stops dead. Flip "no inheritance": offspring reset. | Explain by intervention; misconception 4 |
| 9:00 | A second bark appears; your fading search image keeps two morphs alive. | Preview of frequency dependence |
| 10:00 | "What if the bark were dark?": a rerun from the freezer. | Transfer, freezer |
| 15:00 | End card; the map unfolds: the Wood, a moth page with your histograms, a sandbox with one tool. | The world |

By minute 10 the player has met every interface element used later. Each later unit introduces at most one new one.

---

## 10. Session length

- **A unit fits one 10–20-minute class slot:** three to five levels of 2–5 minutes, auto-saved after each level, resumable on another device with a save code. Each manifest declares its minutes.
- **No level runs 5 minutes without a decision**; long runs (150 generations) get a scrubber, not a wait.
- **Lecture inserts** (R8 §4) have one shape in every unit's instructor notes: 2 minutes predicting, 8 playing on a shared seed, 3 of pair talk, 2 for an exit item.
- **Home study:** an act is one to two hours.

---

## 11. Difficulty and scoring

**Stars mean understanding.** D1 owns the exact rules; this philosophy binds them.
- **Discover:** cause the phenomenon (the polymorphism holds, the ward stays clear).
- **Predict:** the gesture lands near the **expected** outcome given what the player could see. Where chance matters, scoring uses the expectation (a neutral jar's fixation chance is its starting share), never the realised run. Confidence calls use a Brier score (Mendel, Census).
- **Transfer:** succeed at the "What if?" or new-context level.

**Compare with the knowable optimum, after the round.** The debrief shows three marks on one axis: your call, the best call possible with the information you had (Bayes, dynamic programming, closed form: README principle 6), and what happened. The Forager's tangent is drawn from your own patch data; the Census compares your diagnosis with the posterior given the evidence you bought.

**Rules.** No star for a multiple-choice click. No "% of best": in-world currencies (granddaughters dispersing, fledglings, patients cleared, alleles kept). Speed counts only where efficiency is the concept (foraging rate). On contested science (hit-hard dosing, Ewald, the IDH, the Yellowstone cascade) the star is for showing when each answer wins, never for picking one. Accessibility settings never reduce stars.

**Difficulty.** Three to five escalating levels end in a boss that inverts the lesson (D0 template). After two failures the game offers one lever to try. Two global settings: **Field** (default, ×N speed-ups tagged) and **Realistic**, which removes them, so carbonaria needs about 50 generations, as from 1848 to 1895, and most new beneficial mutations are lost. Realistic mode is both the expert challenge and the lesson in scale.

---

## 12. Student mode and teacher mode

**Student mode** (default, anonymous, offline): the map with assigned units glowing, the bestiary, drawer and Field Review, a save code, and "export my data" (CSV of runs and predictions) for lab reports. Joining a class by code and nickname is optional and stores nothing identifying.

**Teacher mode** (a toggle, not an account):
- **Level select** and "unlock all".
- **Assignments** (units, levels, order, parameter locks) shared as a link or QR code; everything rides in the URL, so it works in the offline single file.
- **Shared seeds.** The live pool (every student's Drift Casino line joining one projected fan) needs the Phase 3 server; until then students type a six-character result code that the teacher's screen aggregates.
- **Projector mode:** 16:9, high contrast, large type, answers hidden; pause, step one generation, speed, seed, reveal, pen; "freeze and ask" poses a prediction to the room.
- **Sandbox parameters:** N, s, h, h², μ, m, V/C, r, B and C with "realistic" or "×N" tags; replicates side by side.
- **Dashboard** (Phase 3): prediction accuracy per concept, a misconception report, stuck points, time, normalised gain per concept.
- **Per unit:** instructor notes (objectives, codes, equations, parameters, simplifications, star rules, known errors, answer key, timing) and three discussion prompts rising in Bloom level, one a model critique.
- **Pre/post test:** 25 concept-tagged items drawn from CINS, GeDI, CANS, MUM, EvoDevoCI and the Genetics Concept Assessment.
- **Stability:** version-pinned releases per academic year, a changelog, a science-validation statement.

**Concept codes.** Every level carries R8 codes (A1–O4) and misconception numbers (1–17); the review bank, dashboard, search ("everything on drift") and pre/post test key on them.

---

## 13. Accessibility

WCAG 2.2 AA (R6 §4.6), designed in from Phase 0:
- **Keyboard** path for every action, a single-pointer alternative for every drag, a `keys` field in the contract.
- **Untimed mode** for every reflex unit (Lichen Wood, Black Country, Bitter Wings, Jaws, Alarm Call, Forager, Spindle) that keeps the selective logic: the bird's search image still decays per moth eaten.
- **Colour:** Okabe–Ito plus a second channel (letter, shape, pattern, luminance); blue A and yellow a with letters; a colour-vision preview in the dev build.
- **Text:** nothing below 12 px; labels as DOM overlays, so zoom, translation and screen readers work.
- **Non-visual play:** a live region narrates ("Generation 12: 62% of moths are dark"); every chart has a data-table twin. Camouflage hunts get an equivalent path: the player sets the predator's detection rule and watches it select, still the cause.
- **Sound** optional, captioned and mirrored visually; a reduced-motion path for every effect; nothing flashes faster than 3 Hz; 44 px targets; projector contrast.

---

## 14. Voice and tone

**The keeper's notebook:** a curious, exact naturalist, second person, present tense, short sentences, warm and dry, never cute.
- **Agency (D0 §3):** variants are selected, populations evolve. Never "the moths learned" or "you evolved". The player is the bird, the weather or the doctor.
- **Honesty:** ×N on every unrealistic number; "real" and "designed" on data; a "Contested" badge on contested ideas.
- **Failure is "Interesting result",** then the reason. Never "Wrong".
- **Pictures before numbers; one idea per sentence; humour in names and margins, never in the science.**

Examples. HUD: "Eat the moths you can see. Nobody chooses what survives." Margin: "Half the beetles carry yellow. None of them show it. How many?" Interesting result: "You ate hard and the moths barely moved. Much of their colour here is luck of development, and selection moves only what is inherited."

---

## 15. One notation table

Binding on every unit, card, chart and teacher note (D0 §7).

| Symbol | Meaning | Rule |
|---|---|---|
| p, q | Frequencies of A (blue) and a (yellow) | Alleles, never individuals; letter on every token |
| AA, Aa, aa | Genotypes | Expected p², 2pq, q² drawn as a dashed ghost |
| H_o, H_e | Observed, expected heterozygosity | H_e = 2pq; with inbreeding 2pq(1 − F) |
| F, F_ST | Inbreeding; between-deme share | F named once (The Pedigree); F_ST = Var(p)/p̄q̄ |
| N, Ne | Census and effective size | Drift rates and thresholds always use Ne |
| s, h | Selection coefficient; dominance | "h" always labelled "dominance" |
| μ, ν, m | Forward, back mutation; migration share | Always with a realism tag |
| w, w̄ | Relative and mean fitness | Fitness is reproductive success, not strength |
| S, R, h² | Selection differential, response, heritability | R = h²S; heritability always written h² |
| V, C | Prize, cost of a fight | ESS at V/C |
| r, B, C | Relatedness by descent; benefit; cost | rB > C; r is "shared by descent, on average" |
| ρ | Recombination fraction | Never r, which is relatedness |
| R₀ | Pathogen reproductive number | Always subscripted, never bare R |

---

## 16. Production roadmap

Each phase ends at a gate. Durations are estimates at the current agent-assisted pace.

**Phase 0: Foundations (3–5 weeks, alongside the sweep).** Framework change requests in the plain-JS shell (D4 lists, D2 schedules): a `requestAnimationFrame` loop; embedded WOFF2 fonts; de-duplicated toasts kept off the board; the 560 px cap replaced by canvas + live graph + teacher strip; URL parameters (`unit`, `level`, `seed`, `teacher`, `projector`, `locks`) parsed in `boot.js`; level select via a `startLevel(n)` contract field; an `Events.emit()` log (unit, level, seed, actions, predictions, outcomes) with CSV export; a versioned save key so new star schemes do not inherit old bests; the v2 contract extended per D0 §6.4 (`sim` with step/act/snapshot, content object, tagged params, `keys`, concept codes, minutes). Also: concept codes on all 48 chapters, the notation table, the item-bank schema, a 25-item pre/post draft, Node oracle tests (R6 §4.3), golden trajectories for the ten favourites, screenshots at 390×780, 1024×768 and 1280×720.
*Gate:* all 48 chapters pass the monkey in the new shell; oracles pass; every chapter carries codes.

**Phase 1: Vertical slice (6–8 weeks).** Proves frame, template and teacher loop, as v2 plug-ins: Act 0 Lichen Wood (D1, piloting the template); the Black Country with the gene-pool lens (D1); the Mixer and the merged Drift Casino (D3); Hawks and Doves with invasion (D1); a map with three places, the moth bestiary page, a sandbox with three tools and five cards; a 30-item Field Review; projector mode, level select, assignment links and export. In parallel, R6's Stage 1 spike ports the **v2** Lichen Wood to TypeScript and Pixi as the migration go/no-go.
*Gate:* think-aloud playtests with 10–12 new undergraduates: median time to first action under 10 s; at least 70% start the next unit unprompted; median enjoyment at least 4 of 5; prediction error falls across each unit's levels; normalised gain at least 0.3 on six matched pre/post items; the designer calls it fun; 60 fps on a low-end Chromebook.

**Phase 2: Content waves (5–8 months).** A unit ships only when it meets the **definition of done**: D1 template compliance, an oracle test, a keyboard path (and untimed mode where needed), a MODEL card, concept codes, at least five review items, instructor notes and three prompts, three screenshots, Coordinator A's sign-off, and a five-student playtest with no "boring" flag (a level where most testers idle or ask how long is left).
- **Wave A:** the remaining spine, then all of Acts 1–5, including the P0 games (The Scribe, Leaky Tap, Lottery of the New, Gene Swamping, Malaria Coast, Royal Line, The Dig, Tree Thinking).
- **Wave B:** Acts 6–8: every "set a slider" chapter rebuilt with an invasion view; The Hive.
- **Wave C:** Acts 9–11, Extinction Roulette, Out of Africa, Pseudoreplication Trap, Human Variation, the full sandbox, appendix and side quests.
*Gate per wave:* a 20-student playtest of the wave's route; review-item accuracy rising across sessions; no unit below 3.5 of 5 for enjoyment.

**Phase 3: Teacher features and platform (3–4 months, overlapping Wave C).** R6 Stages 2–3: the TypeScript shell hosting legacy and v2 units, then porting v2 plug-ins (cheap, since they follow the migration rules). Class mode, LTI 1.3 with SCORM fallback, xAPI events, dashboard, live pool, scenario editor, an external accessibility audit with screen-reader users, a pilot translation.
*Gate:* three lecturers run two lecture inserts each unaided; the misconception report matches a hand-scored sample; zero serious axe-core violations.

**Phase 4: Pilot (one term).** Two courses, n ≈ 200 (R8 §4), ethics approval, pre-registered analysis: the 25-item test plus CINS and GeDI, against an active-learning comparison (HHMI BioInteractive), with embedded items and ACORNS explanations scored by EvoGrader.
*Success:* normalised gain (Hake 1998) of at least 0.3 on targeted concepts and 0.1 above the comparison; need-based explanations halved; at least 70% voluntary continuation; three of four instructors would reuse it.

**Phase 5: Publish.** A version-pinned yearly release (PWA, single offline file, SCORM, LTI listing), a teacher site with route guides and instructor notes, a science-validation statement, a VPAT, open pilot data. Then success is adoption, reuse and gains that hold in new courses.

---

## 17. Compliance with D0

### How D2 removes the root causes

| RC | D2's structural fix |
|---|---|
| RC1 Player calculates; population does not respond | All 13 "slider, % of best" chapters rebuilt or merged; "% of best" banned; optima only in the debrief; Notes retired; every behavioural unit ends with an invasion view. |
| RC2 Player is the evolving organism | The frame's default role is keeper of the environment; the six offending chapters rebuilt with R8's reframes; need language banned by the voice rules. |
| RC3 Text before play | No card before the first action; BRIDGE on the map, TRANSFER as a first gesture, RECALL as a station deck; level-2 quizzes cut; Equilibrium's panels compressed into a 12-minute unit. |
| RC4 Concept in the caption | Live graph instead of Notes; picture before number; HW lens and triangle as HUD; readable creature sizes (D4). |
| RC5 No escalation; dominant strategy | Escalating levels and an inverting boss in every unit; act field problems; randomised saboteur forces; Realistic mode; scoring against the knowable optimum. |
| RC6 Model, text, evidence disagree | A science gate in the definition of done; MODEL cards; ×N tags; Contested badges; oracle tests; designed and real data separated by geography. |
| RC7 Three games, no spine | One world, one engine (`Gen`, Hunt), one notation, anchor organisms, a prerequisite graph, every duplicate merged, trees in Act 1, Coalescent after drift, level select, projector mode. |

### Respecting D0 section 3

This document respects every constraint in D0 section 3. Where structure touches the science: Act 3 presents Hardy–Weinberg as a null model and states the one-generation conditions; Drift Casino carries the 2s and Ne rules and scores bottlenecks on allelic richness; the Black Country keeps one carbonaria origin; Hawks uses hermit crabs; Alarm Call uses Sherman's cost signs and identity by descent; the Commons separates weak from strong altruism; After the Fire cannot ship while it rewards the IDH; contested topics carry no star for a side; agency language is fixed in §14; every unrealistic parameter wears ×N; every new claim goes to Coordinator A before build.

### Answers to D0's questions for D2

1. **Core and appendix:** 59 units (~15 h); spine 22 (~6 h); three ecology units in the appendix; P2 topics as side quests (§3).
2. **HW merge:** L1–L7 become the Mixer; L8, L15, L17 and Case Files join the Census; L9, L12–L13 go to Act 4; L10–L11 are replaced. Equilibrium survives as a route and an exportable build, not a codebase (§5).
3. **Game or hub:** a hub of acts on one map, ordered to Act 4, open after; R2's campaigns become Acts 6–8 (§3).
4. **Sandbox:** opens after Act 0, grows with every unit, completes as the capstone; scenario cards are JSON in four kinds (§7).
5. **Act 0:** variation, inheritance and differential reproduction; overproduction and carrying capacity; individuals fixed while proportions change; no variation, no selection; the whole interface grammar (§9).
6. **Wave 2 order:** slice (Lichen, Black Country, Mixer, Drift Casino, Hawks), spine, then Acts 1–5, 6–8, 9–11. Phase 0 is R6 Stage 0; the Stage 1 spike ports the v2 Lichen; Stage 2 follows the slice gate; Stage 3 ports v2 units wave by wave; content never freezes (§16).
7. **Shell changes now:** the Phase 0 list in §16.
