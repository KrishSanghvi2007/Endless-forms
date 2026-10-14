# D2. Game structure and production roadmap

*Creative director. Round 2, revised after Coordinator B's cross-review of D1–D4. Follows the binding brief D0 and the integrator's cross-cutting decisions. D2 owns: the triage of every existing unit; acts, prerequisites and course routes; whether a concept gets its own game; the notation table; concept codes, syllabus tags and the item bank; the teacher-feature roadmap; and the schedule for framework change requests (FCRs) and design specs. D1 designs the favourites and the template, and reviews every spec against G1–G12. D3 specs every other unit. D4 owns look, layout and the recurring-organism rigs. Section 17 answers D0's three requirements; section 18 lists disagreements with the integrator; section 19 holds the revision notes.*

---

## 0. Decisions in brief

1. **One product, Endless Forms, on one world, the Tangled Bank.** The player is the new keeper of a field station on a living island coast. Endless Forms is the game, the Tangled Bank is the world and its sandbox, and Equilibrium becomes Act 3.
2. **Twelve acts plus a capstone sandbox, laid out as a hub.** A 22-unit spine (about 6 hours) passes through every act and every favourite. The full core is 63 units (about 16 hours) before the fun gate trims it. There are 12 side quests and one scenario-card set (the Drunkard's Walk), and courses take named routes.
3. **Who designs what.** D1 designs the nine favourites (ten ids, since the Wood has two). D3 specs every other unit, in five tiers that gate the phases (§16.1). P1 and P2 new games stay frozen until tiers 1–3 exist.
4. **Triage.** Every level-2 quiz is cut. Equilibrium L10–L11 are cut and replaced. Food Web, Islands and After the Fire leave the core path. A **demotion rule** replaces round 1's "no chapter is cut outright": a unit with no per-second verb, or one that fails the five-student "boring" flag twice, becomes scenario cards or appendix material (§4).
5. **Equilibrium stops being a separate product.** It becomes Act 3 (Mixer, Census, Pedigree, Invisible Carriers, Royal Line) plus five Act 4 units. Heterozygote advantage waits for Malaria Coast, after selection has been taught.
6. **The learning loop lives in the simulation.** Predictions are gestures, explanations are interventions, transfer is a rerun. The Notes sheet is retired; `notes()` survives as the live graph's data provider.
7. **Score what could be known.** Discover, Predict and Transfer stars, scored against the expectation, never the realised run. No "% of best" and no star for a click.
8. **Teacher mode and a storage adapter start in Phase 0**, in the plain-JS shell.

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

**Choice: A, with B as its interface and C as its replay mechanic.** The notebook shell (paper cards, phylogeny spine, title tree, Fraunces/Spectral identity) becomes the keeper's notebook and bestiary. Lenski's freezer is the in-world reason for replays and shared seeds: every unit freezes a sample every few generations, and "What if?" thaws one and changes a single thing. The freezer appears in Act 0 as a drawer. **Twelve Flasks** (Act 5) gives it its origin story, since Lenski froze his lines every 500 generations, and it is the first unit where a replay is itself the experiment (citrate replays; D3 #32).

---

## 2. The world: the Bank, the Lab and the Expeditions

The station map has three layers, one per kind of truth.

- **The Bank (the model world).** About twelve places, each named once (R8 counted five confusable island settings): the Wood (peppered moths), Beetle Isle (the allele-wearing beetle), the Streams (guppies), the Shore (hermit crabs), the Lake (cichlids), the Meadow (flowers, pollinators, ground squirrels), the Hedge (great tits, nests), the Pond (*Daphnia*), the Fig Grove, the Valley (salamanders), the Outer Islands (finches, opossums), the Warren (rabbits). Each place keeps a **resident population** as plain-JSON `Gen` state with its history, shown with a generation count and years beside it ("214 generations since you arrived"), which serves threshold concept 3, scale.
- **The Lab (controlled experiments):** Mendel's garden, the Mixer's hoppers, the twelve flasks, plates, the sequencer.
- **The Expeditions (real cases):** pins on a world map for the Black Country (1848–1960), the Aripo River, Daphne Major, Isle Royale, myxoma in Australia, the malaria belt, the fossil cliffs and Out of Africa. Each carries "history compressed" and ×N tags and ends in the **Archive**, the station's room of real data (Majerus, the Grants, Allison 1954, Lenski). The first recorded black moth, Manchester 1848, is on the Black Country's Archive card (R7-R4 D17).

**Persistence rule.** Every level starts from a canonical seeded state, so shared seeds stay reproducible. Selected units then write back to the resident population, so the moths you shaped in Act 0 are the moths the soot reaches in Act 4 and the moths in the sandbox. Teacher mode forces canonical starts. A resident snapshot must fit in 512 bytes (quantised genomes), so saves fit SCORM 1.2 (§12).

**Persistence genome (Wood to Black Country).** The Wood species is designed, not real *Biston*, and its genome is defined so that the soot chapter can inherit it:
- a **polygenic background**: additive tone loci plus the two `dom` morph loci of D1's three morphs (A_, aaB_, aabb), carried forward with any pinned lineages;
- a separate **carbonaria locus C**, epistatic over all of them: any C_ moth is black whatever its background.
- Carbonaria enters as one tagged origin, shown at q = 0.05 with the chip "history compressed: the copy that escaped loss". That chip links to Lottery of the New's 2s lesson (most new beneficial copies are lost).
- The chapter keeps the title "The Black Country" and is set there.

**Look.** One illustration style, with palettes per place rather than per chapter (D4's "Field Plate" ruling).

**Recurring organisms (D4 proposes, D2 approves).** Requirements:
- one anchor species per act, appearing in at least two of its units and in the sandbox;
- the beetle in every HW-lens unit of Acts 3–4, unless the real system is the point (moths, humans, Morgan's flies in Royal Line);
- no species drawn twice in different styles.

Approved anchors: moth (Acts 0, 4), pea and fruit fly (2), beetle (3–4), hermit crab and cichlid (5), **great tit (6)**, guppy (7), ground squirrel (8), fruit fly (9), finch (10), bacteria and humans (11). The great tit replaces round 1's starling. It recurs in the Forager (Krebs et al. 1977; Cowie 1977), Song School (Slabbekoorn & Peet 2003) and the Race boss (Visser et al. 1998). Kacelnik 1984 stays in the Forager's "In nature" panel, cited as a starling study. D4 updates the rig list and the Hedge.

**Narrative.** The previous keeper (fictional) left one margin question per act, shown on the map, never as a card: "The moths on the north trunks are paler than last spring. Who chose?" No cutscenes, no dialogue.

---

## 3. Structure: twelve acts, one spine, many routes

The order follows R8 §5: tree reading in Act 1, the Coalescent after drift, Why Sex? after selection, and heterozygote advantage after Forces. ★ marks the spine; "new" marks D3 games; † marks a D3 game that absorbs an existing unit or another proposal.

| Act | Units (★ spine) | Needs | Min |
|---|---|---|---|
| 0 The Wood | ★The Lichen Wood (L0–L3 hook) | — | 15 |
| 1 Ancestry and evidence | ★Tree Thinking; The Dig (new) | 0 | 30 |
| 2 Heredity | ★Mendel's Garden; ★The Scribe; Crossing Over; The Breeder | 0 | 60 |
| 3 Equilibrium: the gene pool | ★The Mixer; ★The Census; The Pedigree; Invisible Carriers; The Royal Line (new, after the Mixer) | 2 | 65 |
| 4 Forces | ★The Black Country; ★Drift Casino; Lottery of the New, The Leaky Tap, Gene Swamping, Malaria Coast (all new) | 3 | 85 |
| 5 Adaptation and coevolution | ★Bitter Wings; ★Left Jaw, Right Jaw; ★Hawks and Doves; Seed Rain (with the Ellipse as L4 and boss); Lock and Key; Twelve Flasks (new†, absorbs Valley Crossing); field problem "Adaptive or not?" | 4 | 105 |
| 6 Behaviour and life history | ★The Forager; The Crowd; The Slow Island (absorbs Live Fast and D3's "Selection Shadow"); The Pond | 5 | 60 |
| 7 Sex | ★Why Sex?; ★The Raffle; Two Sizes; The Strutting Ground; The Fig; The Selfish Spindle; The Meadow; The Skaters (new†, absorbs Raffle L4) | 5 | 115 |
| 8 Cooperation and conflict | ★Alarm Call; ★The Commons (with the siderophore boss); The Nest; Blood Debts; Many Become One; The Guest; The Hive (new); The Cleaning Station (new, new boss) | 6, 7 | 115 |
| 9 Genomes and development | ★Switches; ★The Coalescent; Copy and Paste; Tangled Pairs (new, before the Sweep); The Sweep; The Clock (id `clock`, merged with Silent Letters) | 1, 4 | 90 |
| 10 Species and macroevolution | ★The River; ★The Archipelago; Two Fruits; The Ring; Doubling; Extinction Roulette (new); Pseudoreplication Trap (new) | 1, 4, 5 | 100 |
| 11 Applied and human | ★The Clinic (opens after Act 4); ★Out of Africa (new); The Pathogen; Genetic Rescue; Human Variation (new, gated); The Refuge (new, opens after Act 4) | 9, 10 | 95 |
| Capstone | The Tangled Bank sandbox | grows from Act 0 | open |
| Appendix | Ecology field guide: The Food Web, Islands, After the Fire | — | optional |

**Side quests** (12), unlocked from their place once their host is done: Song School (Hedge, after the Forager), The Warm Nest, Red Fire, The Placenta, The First Pond, The Toolkit (after Switches), The Manhattan Hunt, Islands of Divergence, Drifting Continents, The Harvest, The Race and The Tumour (after Clinic L3; it reuses the Clinic's pharmacokinetic module). The Drunkard's Walk, the integrator's thirteenth, ships as a scenario card (§7), because it has no per-second verb. Kettlewell's Recapture is no longer a side quest; it is Wood L6 (D1).

**Hub, not line.** Act 0 comes first. Acts 1 and 2 then open together, so a slow Act 1 never blocks Heredity. Act 3 needs Act 2 and Act 4 needs Act 3. From Act 5 on, any act whose prerequisites (the Needs column) are met is open. The station glows a suggested next unit. A locked unit opens with "Jump ahead", which warns once and is logged. Teacher-assigned units are always open.

**Unit-level prerequisites.** By default a unit needs its act's prerequisites. Exceptions:
- **The Clinic and The Refuge** stay on Act 11's map but open after Act 4. Resistance is core first-year content (misconception 12; 76% of respondents in the WHO 2015 multi-country survey thought the body becomes resistant) and needs only Acts 2 and 4.
- **The Royal Line** needs the Mixer, whose X-linked boss round leads into it.
- **Invisible Carriers** needs The Pedigree, because its boss uses F.
- **The Leaky Tap, Gene Swamping and Malaria Coast** need The Black Country (selection first).
- **Lottery of the New** needs the Drift Casino, whose chip-betting verb it reuses.
- **Tangled Pairs** needs Bitter Wings, whose insects it uses.

**Callback edges.** The map draws planned echoes as dashed "callback" edges, and after a unit the station suggests the echoing unit if it is open, otherwise the next spine unit.
- *D1's echoes:* Wood L2 ↔ Jaws L3 (heritability); Black Country ↔ Switches L6 (a slow recessive start); Raffle L3 ↔ Forager L3 (the tangent); Jaws boss ↔ Hawks (the simplex).
- *D3's chains:* Scribe → Twelve Flasks; Lottery → Clock → Out of Africa; Gene Swamping → Malaria Coast → Refuge; Royal Line → Skaters → Harvest.
- *D2's additions:* Census → Malaria Coast (the Census instruments return in its L3); Lock and Key → Why Sex? (the parasite model); Drift Casino → Coalescent; Clinic L3 → Tumour; Commons ↔ Cleaning Station.

**Course routes** (shareable presets):
- *First-year evolution:* the spine (22 units, about 6 h).
- *Population genetics:* Acts 2–4 and 9 (21 units).
- *Behavioural ecology:* Acts 5–8 (26 units).
- *Equilibrium:* Act 3 plus Black Country, Drift Casino, Leaky Tap, Gene Swamping and Malaria Coast (10 units, about 2¼ h).
- *Macroevolution and humans:* Acts 1, 10 and 11 (15 units).

**Concept placement for D0's gap list.**
- X-linkage gets its own unit, the Royal Line, in Act 3.
- ABO becomes the "Blood Bank" level of Invisible Carriers: q_O = √(share of type O) is the logic of q = √aa.
- The gym level (misconception 2) goes into The Breeder, and cave-fish eye loss into Seed Rain, so the player stays the environment.
- The G matrix (D3's Ellipse) becomes Seed Rain's L4 and boss.
- LD, hitchhiking and supergenes go to Tangled Pairs (Act 9).
- The neutral rate, dN/dS and the small-Ne boss become levels of `clock`.
- Sexual conflict goes to The Skaters; siderophores to the Commons boss; senescence theory to The Slow Island; Lenski's experiment and the freezer to Twelve Flasks; Bt refuges to The Refuge; cancer to the Tumour side quest.
- The Cuckoo is the Nest's boss. Lock and Key keeps both levels, and Why Sex? reuses its parasite model with an explicit bridge, which resolves the Red Queen duplicate.
- Gene trees versus species trees is a Coalescent level; hybridisation goes into the Archipelago.

**Subtitles (D0 §4).**
- The Lek's "Mate choice and runaway" becomes **"Mate choice and honest signals"** until The Strutting Ground models runaway (preference–ornament LD). Then it becomes "Mate choice and runaway".
- The Meadow's "Pollination and fertilisation" becomes **"Pollination and coevolution"**, with one condition (§18).
- Both are a two-line `v2/00` patch, because `PLAN` entries in `ui.js` are mutable arrays and v2 files run before `boot.js`. They ship in Phase 0.

---

## 4. Triage of every existing unit

The verdicts:
- **KEEP & POLISH:** the core is kept; levels may be added.
- **REBUILD:** the model or idea is kept; the play is redesigned.
- **MERGE, DEMOTE** (appendix or side quest) and **CUT**.

"Spec" names the designer: D1 (favourites), or D3 with its spec tier (§16.1).

**Demotion rule** (replaces "no Endless Forms chapter is cut outright"). A unit leaves the core and becomes Tangled Bank scenario cards or appendix material if either:
- its spec cannot name a per-second verb with feedback within 200 ms, plus a felt cost that grows as the population adapts (G1 as amended, G3; see §18 for null-model units); or
- it fails the five-student "boring" flag twice.

Its TAKE line, concept codes and review items survive in the cards. These sketches do not yet name such a verb, so D3 must show one first: The Crowd, The Pond, Two Fruits, The Ring, Copy and Paste, Genetic Rescue, Guest L2 and Doubling L2.

**Endless Forms (48)**

| # | Unit | Verdict | Act | Spec | Reason |
|---|---|---|---|---|---|
| 1 | Mendel's Garden | KEEP & POLISH | 2★ | D3·2 | Best inference verb (likelihood, L2 χ²). A season cost per cross and calibrated confidence calls kill "test-cross everything with W". |
| 2 | The Scribe | REBUILD | 2★ | D3·3 | A typing test treating mutation as error (misconceptions 5, 16); becomes a DFE lineage plus Luria–Delbrück plates (D3 #1). |
| 3 | Crossing Over | REBUILD | 2 | D3·4 | The player places crossovers; becomes an introgression breeder with random crossovers. Keep L1–L2 diagrams. |
| 4 | The Census | MERGE (host) | 3★ | D3·2 | Best HW detective; absorbs Equilibrium L8, L15, L17 and Case Files; its heterozygote-advantage case moves to Malaria Coast (§5). |
| 5 | The Coalescent | REBUILD, MOVE | 9★ | D3·2 | Preceded drift; guess-then-watch. Drag lineages back through a Wright–Fisher grid; mutations on branches, gene trees, Tajima's D with decoys. |
| 6 | Drift Casino | MERGE (host) | 4★ | D3·1 | Strong frame, empty between bets; absorbs Equilibrium L12–L13 and Castaways L1. Carries the neutral rule, Ne and allelic richness. |
| 7 | The Castaways | MERGE (split) | 4, 11 | D3·1, D3·4 | L1 → Drift Casino; L2 Isle Royale → Genetic Rescue. |
| 8 | Why Sex? | REBUILD, MOVE | 7★ | D3·2 | Switches the whole pond, with no real twofold cost (R7 D5); a clone invades a sexual pond. |
| 9 | The Lichen Wood | KEEP & POLISH | 0★ | D1 | The hook: L0–L3 in 15 minutes: overproduction with a winter cull, pinning, h² by level, three morphs under apostatic selection. |
| 10 | The Black Country | KEEP & POLISH | 4★ | D1 | Inherits the Act 0 moths; gene-pool lens, carrier tail, one carbonaria origin; absorbs Equilibrium L9; TRANSFER.soot rebuilt as L4's opening gesture; Kettlewell and Majerus as L6. |
| 11 | The Fancier | REBUILD → The Breeder | 2 | D3·3 | Visual 3.0, no tension; changing briefs, F, plateau, the P0 gym level, h² falling in a better environment. |
| 12 | The Sieve | REBUILD → Seed Rain | 5 | D3·3 | The player draws the answer; now sets seeds and weather, and fitness emerges. Keep the split challenge; add the P0 cave-fish level and the Ellipse (L4, boss). |
| 13 | Bitter Wings | KEEP & POLISH | 5★ | D1 | Variable model:mimic ratio, Müllerian level, visible predator memory. |
| 14 | The Landscape | REBUILD → Twelve Flasks | 5 | D3·4 | Foresighted uphill picks. Twelve Flasks absorbs it: the rugged landscape becomes the flasks' hidden fitness landscape, and the three N regimes become a level (Weissman et al. 2009). |
| 15 | Left Jaw, Right Jaw | KEEP & POLISH | 5★ | D1 | Several fish, live oscillation, lizard rock–paper–scissors boss, low-h² trait. |
| 16 | Hawks and Doves | KEEP & POLISH | 5★ | D1 | The player's strategy invades a beach full of hermit crabs. |
| 17 | Blood Debts | REBUILD | 8 | D3·4 | Fixed strategies; bonds, kin in the roost, partner choice, a write-your-rule tournament. |
| 18 | Fisher's Brood | REBUILD → The Fig | 7 | D3·4 | Linear payoff, scripted population; fertilise-or-not laying, local mate competition, the haplodiploid ESS. |
| 19 | Two Sizes | REBUILD | 7 | D3·4 | Solved by holding "tiny"; the player is the experimenter releasing mutants into the PBS sea. |
| 20 | The Lek | MERGE with TB Aripo → The Strutting Ground | 7 | D3·4 | No runaway despite its subtitle; one campaign from OSR and Bateman to runaway, handicap (keep L2) and the lek paradox. |
| 21 | The Raffle | KEEP & POLISH | 7★ | D1 | A visible queue, remating, precedence, the Drum; allocation becomes "hold to pour" against a budget meter; L4 (sexual conflict) moves to The Skaters. |
| 22 | The Selfish Spindle | KEEP L1, REBUILD L2–3 | 7 | D3·4 | L1's binomial detective is a real verb; L2 is luck, L3 one obvious choice. |
| 23 | The Meadow | REBUILD | 7 | D3·4 | The player designs flowers (misconception 1); becomes the pollinator community, with S-alleles; pollinators must evolve too (§18). |
| 24 | Alarm Call | KEEP & POLISH | 8★ | D1 | Kin from a family tree, consequences on screen, correct cost signs. |
| 25 | The Nest | REBUILD | 8 | D3·4 | Free eggs; costly eggs, begging against an evolving parent rule, cuckoo boss. |
| 26 | The Commons | MERGE with TB Commons | 8★ | D3·2 | Keep EF L1 (Simpson's paradox); the TB model and Price bars replace L2; a self-benefit dial; the siderophore boss from the Cleaning Station. |
| 27 | Many Become One | REBUILD | 8 | D3·4 | Whack-a-mole at 6% cheaters per division; play the single-cell bottleneck. |
| 28 | Live Fast | MERGE into TB Slow Island | 6 | D3·4 | Corner optima, imposed ageing; The Slow Island evolves senescence. |
| 29 | The Forager | KEEP & POLISH | 6★ | D1 | One great tit's day on one map; the MVT tangent from the player's own data. |
| 30 | The Crowd | REBUILD | 6 | D3·4 | Scripted to the IFD; fish follow a local rule so the IFD and undermatching emerge. |
| 31 | Shape-shifters | REBUILD → The Pond | 6 | D3·4 | Worksheet then quiz; draw a reaction norm, watch a specialist lineage crash. |
| 32 | Lock and Key | REBUILD | 5 | D3·4 | The player forecasts, then sets snake resistance; parasites on host doors; the player sets newt toxicity. |
| 33 | The Clinic | KEEP & POLISH | 11★ | D1 | Ward, plasmid pathogen, mutant selection window, containment level; doses live from L2 (tap beds as days tick). Opens after Act 4. |
| 34 | The Pathogen | REBUILD | 11 | D3·4 | The player sets virulence; strains compete across a warren; leaky-vaccine level. |
| 35 | The Guest | KEEP L1, REBUILD L2 | 8 | D3·4 | L1 sanctions puzzle is a real verb; L2 is a quiz. |
| 36 | Switches | KEEP & POLISH | 9★ | D1 | A1 column, colinearity as a mechanic, a drawn larva, Pitx1 circuit. |
| 37 | Copy and Paste | REBUILD | 9 | D3·4 | Two quizzes; genome-as-city with maternal piRNA. |
| 38 | The Sweep | KEEP L1, REBUILD L2 | 9 | D3·4 | L1 search is good; L2 becomes decoy scans with a false-positive cost, on the `Evidence` widget. |
| 39 | The Clock | REBUILD, MERGE with Silent Letters | 9 | D3·4 | Arithmetic with a slider. One unit, id `clock`: neutral rate = μ, then dN/dS, positive-selection sites, the clock on a tree with a fast-rodent trap, and a small-Ne boss. |
| 40 | The River | REBUILD | 10★ | D3·2 | Keep the Orr snowball (Contested) and make it visible; reinforcement from heritable preference. |
| 41 | Two Fruits | REBUILD | 10 | D3·4 | All prediction quiz; a fly swarm on two trees and a draggable inversion. |
| 42 | The Ring | REBUILD | 10 | D3·4 | Walk a salamander round the valley; a hidden internal break. |
| 43 | Doubling | KEEP L1, REBUILD L2 | 10 | D3·4 | Minority cytotype exclusion is rare and good; L2 becomes meiosis with unreduced gametes. |
| 44 | The Archipelago | REBUILD | 10★ | D3·2 | Radiation without radiating; the player sets seed supply across islands; hybridisation (Big Bird) and a cichlid turbidity boss. |
| 45 | Tree Thinking | REBUILD, MOVE | 1★ | D3·2 | Chapter 45 and a quiz; drag-and-rotate trees, node-counting and convergence traps. |
| 46 | The Food Web | DEMOTE | Appendix | — | No evolutionary process (R8); invented removals labelled "illustrative". |
| 47 | Islands | DEMOTE | Appendix | — | Ecology, not evolution; its SLOSS idea feeds Genetic Rescue. |
| 48 | After the Fire | DEMOTE, gated | Appendix | — | Rewards the IDH as a rule; ships only once rescored on flat and monotonic landscapes. |

**Every level-2 quiz is cut as a quiz** (Archipelago, Food Web, Islands, Fire, Two Fruits, Guest, Copy L1 questions, Switches L2, Landscape L2, Coalescent L3, Shape-shifters L2, Live Fast L3). Their content returns as gestures or review items.

**Equilibrium (17 levels and Case Files)**

| Levels | Verdict | Act | Spec | Reason |
|---|---|---|---|---|
| L1–L3 | MERGE → The Mixer | 3★ | D3·1 | Lens, jars and Yule's failed prediction in 3 minutes of play. |
| L4–L6 | MERGE → The Mixer | 3★ | D3·1 | Hoppers fill the p² square; tile collapse kept; unequal-sex twist. |
| L7 | KEEP as Mixer boss | 3★ | D3·1 | Spatial prediction on the triangle (rounding fixed in G7); its X-linked round leads to the Royal Line (G7 #12). |
| L8, L15, L17, Case Files | MERGE → The Census | 3★ | D3·2 | One detective with an evidence budget and randomised causes (G7 #4, #8, #9). |
| L9 | MERGE → The Black Country | 4 | D1 | Dominant against recessive runs in the Hunt engine (G7 #5). |
| L10 | CUT | — | — | Inert; replaced by The Leaky Tap (D3·3). |
| L11 | CUT | — | — | Nothing opposes migration; replaced by Gene Swamping (D3·3). |
| L12–L13 | MERGE → Drift Casino | 4 | D3·1 | Buri's 107 bottles, Ne puzzles, a 12-allele bottleneck scored on alleles kept, drawn with at most 4 hues and then patterns or letters (D4 rule 7; G7 #2, #3). |
| L14 | REBUILD → The Pedigree | 3 | D3·3 | F by path counting; one mating model per label (G7 found three); a disassortative run from p = 0.8 (G7 #1). |
| L16 | KEEP & POLISH → Invisible Carriers | 3 | D3·3 | Genetic counsellor, cousin risk with F, the Blood Bank level, the inbreeding boss. |

**Tangled Bank**

| Unit | Verdict | Where | Reason |
|---|---|---|---|
| Lichen Wood, Black Country, Bitter Wings | MERGE into EF | — | Duplicates; TB art and the `mu: 0.01` fix feed D1. |
| Streams of Aripo | MERGE → The Strutting Ground | 7 | Its painted streams become a sandbox place. |
| The Slow Island | KEEP (host), D3·4 | 6 | Evolves senescence; absorbs Live Fast and D3's "Selection Shadow" levels under one name; Austad's result is about 25% longer life. |
| The Commons | KEEP model (host) | 8 | Price bars become a shared widget (D1 `PriceBars`). |
| Steward mode | KEEP → capstone | Sandbox | §7. |

### 4.1 D3's new games, placed

| # (D3) | Game | Status | Act | Wave | Notes |
|---|---|---|---|---|---|
| 1 | The Scribe | Core ★ (rebuild) | 2 | A | P0 |
| 2 | The Royal Line | Core | 3 | A | P0; after the Mixer |
| 3 | The Leaky Tap | Core | 4 | A | P0 |
| 4 | Malaria Coast | Core | 4 | A | P0; the only home of heterozygote advantage; sensitive-content gate |
| 5 | Gene Swamping | Core | 4 | A | P0 |
| 6 | Lottery of the New | Core | 4 | B | P1; owns the 2s rule |
| 7 | Tangled Pairs | Core | 9 | C | P1; before the Sweep; Bitter Wings' insects |
| 8 | The Ellipse | Merged | 5 | A | Seed Rain L4 and boss |
| 9 | Silent Letters | Merged | 9 | C | Part of `clock` |
| 10 | The Manhattan Hunt | Side quest | 9 | after pilot | Sensitive-content gate |
| 11 | Song School | Side quest | 6 | after pilot | Great tit |
| 12 | The Skaters | Core | 7 | B | P1; absorbs Raffle L4 |
| 13 | The Warm Nest | Side quest | 7 | after pilot | |
| 14 | The Cleaning Station | Core | 8 | B | P1; needs a new boss (its siderophore boss moves to the Commons) |
| 15 | The Hive | Core | 8 | B | P1 |
| 16 | Red Fire | Side quest | 8 | after pilot | |
| 17 | The Placenta | Side quest | 8 | after pilot | |
| 18 | The Selection Shadow | Merged | 6 | B | Is The Slow Island |
| 19 | The Tumour | Side quest | 11 | after pilot | Reuses the Clinic's PK module; echoes Clinic L3 |
| 20 | The Toolkit | Side quest | 9 | after pilot | |
| 21 | Islands of Divergence | Side quest | 10 | after pilot | |
| 22 | The Dig | Core | 1 | A | P0 |
| 23 | Extinction Roulette | Core | 10 | A | P0; extinction rate is δ, not μ |
| 24 | Pseudoreplication Trap | Core | 10 | C | P1; `Evidence` widget |
| 25 | The Drunkard's Walk | Scenario card | 10 | B | No per-second verb (§4 rule) |
| 26 | Drifting Continents | Side quest | 10 | after pilot | |
| 27 | Out of Africa | Core ★ | 11 | A | P0; at most 4 hues, then patterns or letters; sensitive-content gate |
| 28 | Human Variation | Core, gated | 11 | C | P1; sensitive-content gate |
| 29 | The Refuge | Core | 11 | C | P1; opens after Act 4 |
| 30 | The Harvest | Side quest | 11 | after pilot | |
| 31 | The Race | Side quest | 11 | after pilot | Great tit boss (Visser et al. 1998) |
| 32 | Twelve Flasks | Core | 5 | B | P1; absorbs Valley Crossing; the freezer's origin |
| 33 | The First Pond | Side quest | 8 | after pilot | |

---

## 5. Act 3: Equilibrium and the Census, and what D3's specs must teach

**The overlap.** Equilibrium has the better derivation: lens, jars, area square, tile collapse, triangle. The Census has the better detective: sampling cost, strata, a correct p-value, and Wahlund = 2Var(p). They use different organisms and notation.

**The resolution.** Act 3 is titled "Equilibrium" and opens with Equilibrium's title equation over three beetles. It has five units, on Beetle Isle except where the real system is the point. D2 sets what each must teach and the constraints; D3 writes the spec at D1 §3 depth; D1 reviews it against G1–G12.

1. **The Mixer** (D3·1, about 12 minutes, in the slice).
   - *Must teach:* HW proportions follow from allele frequencies after one generation of random mating; HW is a null model; and it holds in one generation only for an autosomal locus with equal allele frequencies in the sexes and discrete generations (D0 §3).
   - *Content to keep:* carriers found with the genotype lens; alleles flying to jars; Yule's prediction failing on screen; egg and sperm hoppers filling a square whose sides are p and q, with the 2pq tiles collapsing; the unequal-sex twist (allele frequencies equalise in one generation, genotypes reach HW in the second); the triangle prediction as boss, ending in an X-linked round that does not land in one step and leads to the Royal Line.
   - *Constraints:* at most three teaching panels of 35–60 words, each after the picture has changed. D3 must name a per-second verb; this is the riskiest unit in the slice, because nothing adapts in a null model (§18).
2. **The Census** (D3·2, about 15 minutes).
   - *Role:* the investigator with a budget (G1 as amended). The data come from a visible, simulated beetle population. The player buys instruments with field days through D1's `Evidence` widget: genotype n beetles, split by region or by age, genotype a second unlinked marker, re-genotype a sample, count arrivals, mark–recapture. The player then gives a diagnosis with a confidence, Brier-scored against the posterior given the evidence bought.
   - *Hidden causes,* drawn at random per case at realistic strengths, limited to what is taught by Act 3 or is not evolution:
     - none (a true fit), including low-power samples (n = 40 against 30,000);
     - relatives mating: a deficit at every locus, in every stratum and age class (the Census shows the fingerprint; The Pedigree, next, names it F);
     - pooled demes (Wahlund): each deme fits, and the pool shows a deficit equal to 2Var(p);
     - real-data artefacts (G1): a null allele, or allelic dropout as a genotyping error. Both give an apparent deficit at one marker only, so the second-marker instrument separates them from inbreeding and pooling, and re-genotyping exposes dropout.
   - *Excluded:* heterozygote advantage and any selection, which wait for Malaria Coast (R8 §5). Drift does not create a lasting departure, and assortative mating moves only trait-linked loci, so neither is a saboteur (G1; R7-R1 A12, B7).
   - *A phenotype-only case:* a dominant trait where only phenotypes can be counted, so HW must be assumed to estimate q and cannot be tested (G7 #8). It hands over to Invisible Carriers.
   - *Boss: a Wahlund deficit from two hidden demes.* The deficit appears in every age class and at both markers, so it looks like inbreeding. The demes do not split north and south but along a boundary the player must find. Within each deme the samples fit and the deficit, 2Var(p), vanishes.
3. **The Pedigree** (D3·3, about 12 minutes). F is named once, here, with H_o = 2pq(1 − F), and the same symbol is used everywhere after.
   - Path counting on D1's `PedigreeView`.
   - One mating model per label: G7 found three (genotype assortment in L8, colour assortment in L14 and L15).
   - Colour assortment leaves an unlinked locus on the HW curve, while inbreeding lowers heterozygosity at every locus (G7 #1).
   - Disassortative mating moves p: a run from p = 0.8 toward 1 Aa : 1 aa, as in *Primula* heterostyly (D0 §3; Wright 1939).
4. **Invisible Carriers** (D3·3, about 10 minutes; needs The Pedigree).
   - q = √aa, which assumes HW; cousin risk with F = 1/16.
   - The Blood Bank: ABO with p_A, p_B and q_O, tiled as (p_A + p_B + q_O)², so q_O = √(share of type O).
   - *Boss:* cousin marriage raises aa above q² (aa = q² + Fpq), so √aa overestimates q, and the player corrects the estimate with The Pedigree's F.
   - The two bosses no longer overlap: the Census boss is a Wahlund deficit, this one is inbreeding.
5. **The Royal Line** (D3·3, about 15 minutes; needs the Mixer). D3 #2 as catalogued, moved from Act 2 because its spiral uses the triangle and HW proportions. It uses D4's X-linked HUD variant and the hemizygous-male convention (§15).

**Heterozygote advantage is taught once, in Malaria Coast (Act 4),** after The Black Country has introduced selection: newborns sit on the HW curve and adults sit above it, and the Census instruments return in its L3. This fixes R8's sequencing bug (the old Census L2 diagnosed heterozygote advantage before the Selection section) and removes the round-1 duplicate between the Census boss and Malaria Coast.

After Act 3, the phenotype/genotype/jar lens and the triangle mini-map become **HUD widgets** in every population unit and the sandbox (D1 behaviour, D4 look). Hardy–Weinberg becomes the instrument panel for the rest of the game.

**Does Equilibrium survive standalone?** As a route, yes, exportable as its own single-file build. As a codebase, no. In Phase 0, `Equilibrium_HW_v2.html` is rebuilt so that it carries the G7 corrections (G7 #13). It stays downloadable as "classic" until Act 3 ships, then is archived. Its maths (`hwExp`, `wfNext`, `chi2`) moves into the shared genetics module as special cases of `Gen`.

---

## 6. Progression and meta-game

**What the player collects: knowledge and populations, nothing else.**
- **The bestiary.** One page per species, filled with the player's own data, plus its MODEL card. The moth page stacks the tone histograms of every generation you hunted, then the Archive's real frequencies, marked "real".
- **The specimen drawer.** Press and hold to pin any individual (D1's shared `Pin`). Its page shows that it never changed while its population did (misconception 3).
- **Laws of the Bank.** The TAKE lines (at most 20 words each, D4) as cards, earned only by a Transfer star. "Antibiotics select resistance; they rarely create it" is earned by winning the Clinic's transfer level.
- **Tools.** Each unit unlocks one sandbox lever: predator (Act 0), soot and Clean Air (Black Country), volcano (Drift Casino), ferries (Gene Swamping), mutagen tap (Leaky Tap), replicate bench (Twelve Flasks), captive pens (Genetic Rescue), drugs (Clinic).
- **The title tree** gains a tip per completed unit: a record of what the student understands.

**Gates.** The prerequisite graph and, from Act 2, an end-of-act **field problem**: a sandbox scenario using only that act's tools. Act 4's problem: "Make five islands as different as you can (highest F_ST) for 200 generations while every island keeps both alleles", using the volcano, soot and ferries. It differs from Gene Swamping's boss, which asks for local adaptation. Field problems are the act-level transfer test.

**Refused:** coins, energy, daily rewards, speed leaderboards, loot. An optional class board ranks prediction calibration only.

**Layout requests to D4** (screens D2 specifies that have no layout yet):
- **Station map:** places, the glowing suggested unit, prerequisite edges solid and callback edges dashed, locked units hatched with their reason.
- **Bestiary page:** the player's histograms above the Archive's real data.
- **Specimen drawer:** pinned individuals with generation stamps and threads to descendants.
- **Laws of the Bank:** a card wall.
- **Field Review card:** an item, a confidence slider, a mini-simulation slot.
- **Scenario-card face:** title, one sentence, tool icons, goal, share code and QR.
- **Teacher assignment builder.**

---

## 7. The Tangled Bank sandbox and scenario cards

**Where it sits: everywhere, and at the end.** After Act 0 the sandbox is one place with one tool. It grows with every unit into the capstone: Steward mode generalised to a map of linked places where the player places predators, ferries, soot, floods, drugs and pens. Any population opens with the gene-pool lens and triangle dot, any structured one with Price bars, and any lineage can be frozen, thawed and rerun beside replicates. It is also the lecture tool.

**Scenario card format.** JSON: `{id, title, prompt (≤40 words), places, populations, tools, parameters with locks and realism tags, seed, duration, prediction gesture, goal predicate, stars, debrief prompts, concept codes}`. The face shows a title, one sentence, tool icons, a measurable goal and a share code with QR (layout by D4). Four kinds:
- **Challenge:** "Make carbonaria rise and fall within 80 generations without migration."
- **Experiment:** no goal; predict first, then run replicates. "Halve N. Sketch the fan first."
- **Lecture demo:** teacher-run, stepped, answer hidden until "reveal".
- **Assessment:** fixed seed, scored prediction, no feedback until submitted.

Designers write the first 40 cards, starting with Seed Rain's "split the flock", the Casino's predict-before-bet and the Drunkard's Walk (passive against driven trends) as an Experiment card. **A unit demoted under §4 becomes a card set:** its model, its best "What if?" runs as Experiments, and its boss as a Challenge. Teachers get an editor in Phase 3.

---

## 8. The learning loop inside play

Predict → act → observe → explain → transfer stays the spine of every level (README principle 1), with no step on a text card.

| Step | How | Replaces |
|---|---|---|
| Predict | A gesture: drag the ghost where p will go, place the histogram ghost, tap the triangle, put chips on the fan. Scored by distance to the expected outcome. | TRANSFER cards; MCQ predictions |
| Act | The verb: hunt, release a mutant, set the weather, open a ferry, dose a ward. | Sliders and Run |
| Observe | The picture changes first (moths vanish, chicks fledge), then the live graph, always visible, never pausing: realised solid, expected as a dashed ghost, a "you" marker. | Notes → Graphs, empty in every chapter checked (D0 §5.5) |
| Explain | By intervention: a What if? button flips one thing (no variation, no inheritance, no migration) and reruns from the freezer; mark the cause on the map. Once per act, an optional one-sentence "explain why" scored ACORNS-style. | 200-word end cards |
| Transfer | "What if?" reruns one changed parameter; each unit's last level moves to a new organism or to trait loss (Nehm & Ha 2011). | — |

**Each part of `ch99.js`** (v2 files load after it, so each is handled on purpose; D0 §6.2):
- **TAKE:** kept as Laws of the Bank; rewritten where a rebuild makes the old line false.
- **BRIDGE:** becomes the selected unit's caption on the map (at most 25 words), never part of the intro.
- **TRANSFER:** `delete TRANSFER[id]` removes each card, and each of the six questions returns as the target unit's first gesture:
  - *soot:* "which moths will increase?" becomes L4's opening prediction, dragging the histogram where tomorrow's moths will be (D2 owns the requirement, D1 builds it);
  - *castaways:* the Casino's founder level opens by dragging the island's starting share;
  - *cross, fruits and lock:* the openings of Crossing Over, Two Fruits and Lock and Key;
  - *clinic:* Clinic L1's day-10 resistant-share prediction.
- **RECALL:** becomes the **Field Review**, a five-box Leitner deck keyed on concept codes: at most five items a visit, at the station, never on opening a unit. Distractors come from CINS and ACORNS; every item asks for confidence; many are mini-simulations.
- **MODEL:** a card per unit (assumptions, ×N tags, what it cannot show, principle / model / nature) behind a chip on the live HUD and in the debrief. The 22 missing ones are written with each redesign (G6).
- **Patches to old objects** (`CH_SOOT.intro.how`, `CH_MENDEL.confNote`, `CH_CASINO.newTable`, the Lichen `Hunt.interlude`): re-implemented as standard gestures or dropped. D1 disarms the Lichen hook with `Hn._pAsked = true`.

**The Notes sheet is retired.** Its parts go to the live graph, the MODEL chip and the bestiary. `notes()` itself survives as the `LiveGraph` data provider, because `boot.js` requires it on every non-Hunt chapter. No optimum appears during play.

**Entry and end cards.** `App.open` always shows the intro card, and `ch99` wraps it. FCR-12 adds an outermost `v2/00` wrap that sends any chapter with `ch.v2` straight to `App.play`, and gives `End.show` the same treatment (§16.3). End cards follow D4's limits: TAKE at most 20 words, body at most 60, one chart above the fold, stars that count up, then "What if?", "Why?", "Notebook", "Next". An Interesting result is at most 25 words.

---

## 9. Onboarding: the first fifteen minutes

Act 0 is the only onboarding. D1 owns the content of the Lichen Wood; D2 owns what it must teach and the interface grammar it installs. The `lichen` id holds L0–L3 in a 15-minute time box, with generations of about 40 s (a 12 s morning plus dusk). The dark-bark rerun moves to `soot`.

| Time | What happens | Installs |
|---|---|---|
| 0:00 | Title tree, Darwin's line, one button: "Begin". No menu, no card. | — |
| 0:05 | The Wood. A ghost hand taps the most conspicuous moth on a 3 s loop. HUD: "You are a bird. Tap a moth." | First action within 10 s |
| 0:10 | **L0, morning 1:** 8 conspicuous moths and a slowed clock (×0.6). It cannot fail (D4). Each catch feeds a chick in the HUD row. | The verb; the agent's goal |
| 1:00 | **Dusk:** each survivor lays dozens of eggs (about 300 in all). A random winter cull leaves 30, so most die whatever you did. | Overproduction; carrying capacity as a random cull |
| 1:45 | Press and hold a moth to pin it. Over the next mornings it never changes; its young vary around it; the histogram moves. | Misconception 3 |
| 3:00 | **L1:** polygenic tone, h² ≈ 0.9. Drag a ghost bar to predict tomorrow's mean, three times; then S and R are named. | Prediction gesture; R = h²S |
| 5:30 | **What if? buttons in L1:** "no variation" (selection stops dead), "no inheritance" (offspring reset to the old mean), "eat at random" (Interesting result: "Nothing moved. Why?"). | Explain by intervention; misconception 4; failure as data; the freezer |
| 7:00 | **L2:** mixed diets lower h² to about 0.3 ("designed"). Predictions overshoot until the player shrinks them. | Heritability limits response |
| 10:00 | **L3 boss:** birch and oak patches, three morphs, search image on, 80% starting as one morph. Predict the commonest morph after 6 generations; the rare morphs rise and all three persist. | Apostatic selection; a preview of frequency dependence |
| 14:00 | End card; the map unfolds: the Wood, a moth page with your histograms, a sandbox with one tool. | The world |

By minute 14 the player has met every interface element used later. Each later unit introduces at most one new one.

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
- **Predict:** the gesture lands near the **expected** outcome given what the player could see. Where chance matters, scoring uses the expectation (a neutral jar's fixation chance is its starting share), never the realised run. Confidence calls use a Brier score (Mendel, Census, Royal Line boss).
- **Transfer:** succeed at the "What if?" or new-context level.

**Compare with the knowable optimum, after the round.** The debrief shows three marks on one axis:
- your call;
- the best call possible with the information you had (Bayes, dynamic programming or a closed form; README principle 6);
- what happened.

The Forager's tangent is drawn from your own patch data; the Census compares your diagnosis with the posterior given the evidence you bought.

**Rules.**
- No star for a multiple-choice click.
- No "% of best": in-world currencies instead (granddaughters dispersing, fledglings, patients cleared, alleles kept).
- Speed counts only where efficiency is the concept (foraging rate).
- On contested science (hit-hard dosing, Ewald, the IDH, the Yellowstone cascade) the star is for showing when each answer wins, never for picking one.
- Accessibility settings never reduce stars.
- **Bot sweep (D1 G12):** no fixed strategy (always-A, always-B, random, greedy-now, fixed threshold) earns three stars in any level. This is part of the definition of done.

**Difficulty.** Three to five escalating levels end in a boss that inverts the lesson (D0 template). After two failures the game offers one lever to try.

**Two global settings: Field and Realistic.**
- **Field** is the default; its ×N speed-ups are tagged.
- **Realistic** removes them:
  - *Model-driven units* (Drift Casino, Lottery of the New, Leaky Tap, Gene Swamping): it applies fully, with realistic N, μ and s, so most new beneficial copies are lost.
  - *Hunt units:* the player's own eating is the selection, so the player still sets its direction. The simulation scales its strength to the cited real s and time-lapses the unplayed generations between mornings with the player's fitted detection rule. A chip discloses it: "Realistic: your catches set which moths birds find; strength scaled to s ≈ 0.25; 4 generations a morning". Catches are never silently discarded, since each one moves the fitted rule.
  - *Two cited values, labelled separately:* the rise of carbonaria, s ≈ 0.2–0.33 per generation (Haldane 1924; about 50 generations from 1848 to 1895); the decline, s ≈ 0.1–0.2 (Cook 2003; Saccheri et al. 2008).
  - Stars score against the expectation for the parameters in force, so Realistic never costs a star. Units with no ×N parameter (Mixer, Tree Thinking) do not offer it.
  - Realistic mode is both the expert challenge and the lesson in scale.

---

## 12. Student mode and teacher mode

**Student mode** (default, anonymous, offline): the map with assigned units glowing, the bestiary, the drawer and the Field Review, a save code, and "export my data" (a CSV of runs and predictions) for lab reports. Joining a class by code and nickname is optional and stores nothing identifying.

**Saves never rely on `localStorage` alone** (R6 §5, §8 rule 8). From Phase 0, `Save` (`core.js:99`) writes through a storage adapter that tries, in order:
1. SCORM `suspend_data`, when an LMS API is found;
2. IndexedDB;
3. `localStorage` inside try/catch;
4. memory plus a save code the student can copy (iPad Safari can evict site storage).

The whole save fits SCORM 1.2's 4,096-character `suspend_data`: stars, progress and resident snapshots of at most 512 bytes each. Anything larger falls back to seed plus canonical start.

**Teacher mode** (a toggle, not an account):
- **Level select** and "unlock all".
- **Assignments** (units, levels, order, parameter locks) shared as a link or QR code. Everything rides in the URL, so it works in the offline single file.
- **Shared seeds.** The live pool (every student's Drift Casino line joining one projected fan) needs the Phase 3 server. Until then students type a six-character result code that the teacher's screen aggregates.
- **Determinism for shared seeds** (R6 §4 rule 4). `+ − × ÷ √` are bit-exact across browsers; `Math.exp`, `log`, `pow` and `sin` may not be. In any unit offering shared seeds or result codes, no transcendental function sits between an `R()` draw and an outcome:
  - fitnesses are written as products and ratios (1 + s, 1 − hs);
  - binomial and multinomial draws use the shared helper's inversion by comparison;
  - curves that need exp (Kimura's fixation curve, the decline ghost) are drawn only as ghosts;
  - CI runs the golden trajectories and result codes in Chromium, Firefox and WebKit and fails on any difference.
- **Projector mode:** 16:9, high contrast, large type, answers hidden; pause, step one generation, speed, seed, reveal, pen; "freeze and ask" poses a prediction to the room.
- **Sandbox parameters:** N, s, h, h², μ, m, σ, V/C, r, B and C with "realistic" or "×N" tags; replicates side by side.
- **Dashboard** (Phase 3): prediction accuracy per concept, a misconception report, stuck points, time, normalised gain per concept.
- **Per unit:** instructor notes (objectives, codes, equations, parameters, simplifications, star rules, known errors, answer key, timing) and three discussion prompts rising in Bloom level, one of them a model critique.
- **Pre/post test:** 25 concept-tagged items drawn from CINS, GeDI, CANS, MUM, EvoDevoCI and the Genetics Concept Assessment.
- **Stability:** version-pinned releases per academic year, a changelog, a science-validation statement.

**Concept codes.** Every level carries R8 codes (A1–O4) and misconception numbers (1–17); the review bank, dashboard, search and pre/post test key on them.

**Syllabus tags (R8 §4).** A crosswalk maps each R8 concept code to:
- textbook chapters: Futuyma & Kirkpatrick, *Evolution* 4th ed.; Herron & Freeman, *Evolutionary Analysis* 5th ed.; Zimmer & Emlen, *Evolution: Making Sense of Life*;
- AP Biology Units 5 (Heredity) and 7 (Natural Selection);
- IB Biology (2025 guide) D3.2, D4.1 and A4.1;
- AQA A-level Biology 3.7 and OCR A 6.1;
- the QAA Biosciences benchmark statement (2023).

Levels inherit tags from their codes, so tagging is done once per code (about 100 rows), not once per level (about 250). This powers the teacher search ("everything on drift", "AP 7.5"). The crosswalk is built in Phase 0, its item numbers are checked against each current specification then, and a teacher of each syllabus reviews it before the Phase 4 pilot.

---

## 13. Accessibility

WCAG 2.2 AA (R6 §4.6), designed in from Phase 0:
- **Keyboard** path for every action, a single-pointer alternative for every drag, a `keys` field in the contract.
- **Untimed mode** for every reflex unit (Lichen Wood, Black Country, Bitter Wings, Jaws, Alarm Call, Forager, Spindle) that keeps the selective logic: the bird's search image still decays per moth eaten.
- **Colour:** Okabe–Ito-derived data inks plus a second channel (letter, shape, pattern, luminance); blue A and amber a with letters; D4's colour-vision preview (`?cvd=`, FCR-11) and its CI check on each chapter's declared encodings.
- **Text:** nothing below 12 px on canvas (linted in CI); labels as DOM overlays (FCR-8), so zoom, translation and screen readers work.
- **Non-visual play:** a live region narrates ("Generation 12: 62% of moths are dark"); every chart has a data-table twin. Camouflage hunts get an equivalent path: the player sets the predator's detection rule and watches it select, so the player is still the cause.
- **Sound** optional, captioned and mirrored visually; a Calm path for every effect; nothing flashes faster than D4's limit; 44 px targets; projector contrast.

---

## 14. Voice and tone

**The keeper's notebook:** a curious, exact naturalist, second person, present tense, short sentences, warm and dry, never cute.
- **Agency (D0 §3):** variants are selected, populations evolve. Never "the moths learned" or "you evolved". The player is the bird, the weather or the doctor.
- **Honesty:** ×N on every unrealistic number; "real" and "designed" on data; a "Contested" badge on contested ideas.
- **Failure is "Interesting result",** then the reason, in at most 25 words. Never "Wrong".
- **No on-screen human death anywhere:** tallies on pictograms (D4), including Malaria Coast, the Clinic and Out of Africa.
- **Pictures before numbers; one idea per sentence; humour in names and margins, never in the science.**

Examples. HUD: "Eat the moths you can see. Nobody chooses what survives." Margin: "Half the beetles carry amber. None of them show it. How many?" Interesting result: "You ate hard and the moths barely moved. Much of their colour is luck of development."

---

## 15. One notation table

Binding on every unit, card, chart and teacher note (D0 §7, and the integrator's ruling that this table binds D1, D3 and D4).

| Symbol | Meaning | Rule |
|---|---|---|
| p, q | Frequencies of A (blue) and a (amber) | Alleles, never individuals; a letter on every token |
| p_A, p_B, q_O | Frequencies with three or more alleles (ABO) | Subscript the allele; q_O = √(share of type O); never r |
| AA, Aa, aa | Genotypes | Expected p², 2pq, q² drawn as a dashed ghost |
| X-linked loci | Females AA, Aa, aa; hemizygous males A or a | A male is one token with a Y bar, never AA; p_f and p_m for the sexes; p̄ = (2p_f + p_m)/3 |
| H_e, H_o | Expected and observed heterozygosity | H_e = 2pq; under inbreeding H_o = 2pq(1 − F) |
| F, F_ST | Inbreeding coefficient; between-deme share of variance | F named once (The Pedigree); F_ST = Var(p)/p̄q̄ |
| d_xy | Absolute divergence between two populations (mean differences per site) | Shown beside F_ST, which is relative |
| N, Ne | Census and effective size | Drift rates, thresholds and \|Ne·s\| always use Ne |
| s, h | Selection coefficient; dominance | "h" always labelled "dominance", never heritability |
| μ, ν | Forward and back mutation rate per copy per generation | Always with a realism tag; μ never means extinction |
| m, σ | Migration share per generation; dispersal distance (SD of parent–offspring distance) | Cline width scales as σ/√s |
| K | Carrying capacity | Act 0: the winter cull's survivors; Extinction Roulette: "K (species)" |
| w, w̄ | Relative and mean fitness | Fitness is reproductive success, not strength |
| S, R, h² | Selection differential, response, heritability | R = h²S; heritability always written h² |
| V, C | Prize; cost of a fight | ESS at V/C |
| r, B, C | Relatedness by descent; benefit; cost of helping | rB > C; r is "shared by descent, on average". C is the fight cost in Hawks and Doves and the altruism cost in kin units; a unit uses one, and its MODEL card says which |
| ρ | Recombination fraction | Never r, which is relatedness |
| R₀ | Pathogen reproductive number | Always subscripted, never bare R |
| r_m | Intrinsic growth rate | Never bare r |
| λ, δ | Speciation and extinction rates per lineage per Myr | Net diversification λ − δ; never μ for extinction |
| dN/dS | Ratio of nonsynonymous to synonymous substitutions per site | 1 neutral, below 1 purifying, above 1 positive selection |
| 2s | Fixation chance of a new beneficial copy ≈ 2s (2hs; ×Ne/N) | Owned by Lottery of the New. The Drift Casino carries the neutral rule (fixation chance = starting share), Ne and allelic richness |
| Raffle share | "your tickets ÷ all tickets" | Never written s/(s+R), which collides with s and R above |

---

## 16. Production roadmap

Each phase ends at a gate. Durations are estimates at the current agent-assisted pace.

### 16.1 Spec pipeline (who designs what, and what each spec gates)

Every spec is written at D1 §3 depth: core loop with G3's three loops (second, minute, level), a level table (predict → do → observe → aha), screen, live graph, stars, teacher hooks, "in this model / in nature", and build and oracle. D1 reviews each against G1–G12 before build. D3 owns every non-favourite unit.

| Tier | Units | Gates |
|---|---|---|
| 1 | The Mixer, Drift Casino | Start of Phase 1 (the slice cannot be built without them) |
| 2 | Remaining spine rebuilds: Tree Thinking, Mendel's Garden, The Census, Why Sex?, The Commons, The Coalescent, The River, The Archipelago | Start of Wave A |
| 3 | P0 new games: The Scribe, The Royal Line, The Leaky Tap, Malaria Coast, Gene Swamping, The Dig, Extinction Roulette, Out of Africa; plus the rebuild hosts of P0 levels: The Breeder (gym), Seed Rain (cave fish), Invisible Carriers (Blood Bank), and The Pedigree (its F is used by Invisible Carriers' boss) | Start of Wave A |
| 4 | Other rebuilds and merges (23): Crossing Over, Lock and Key, Twelve Flasks (absorbing Valley Crossing), The Crowd, The Slow Island, The Pond, Two Sizes, The Strutting Ground, The Fig, Spindle L2–3, The Meadow, The Nest, Blood Debts, Many Become One, Guest L2, Copy and Paste, Sweep L2, `clock`, Two Fruits, The Ring, Doubling L2, The Pathogen, Genetic Rescue | Each unit's wave |
| 5 | P1/P2 new games, **frozen until tiers 1–3 exist**: Lottery of the New, The Skaters, The Cleaning Station (with its new boss), The Hive, Tangled Pairs, Pseudoreplication Trap, Human Variation, The Refuge; then the 12 side quests | Each unit's wave |

The reason for this order: the designer's complaint is that the existing games are boring, so fixing them comes before adding 33 new ones. Timing: D3 writes tier 1 during Phase 0, and tiers 2–3 (20 specs) during Phase 1. Tiers 4–5 are written during Wave A.

### 16.2 Engine rules

- **`Gen` stays the only diploid Mendelian engine.** Its extensions (D3: linked loci, multi-allele loci, ploidy, pleiotropy, lineage tracking) are opt-in and consume no extra `R()` calls when absent, so the legacy golden trajectories do not change.
- **D1's `Invasion` widget** (haploid strategy lineages) is allowed, provided it draws through the one shared seeded Wright–Fisher/multinomial helper (`v2/00_wf.js`) on the shared `R()`. The Drift Casino, Lottery and Twelve Flasks use the same helper.
- **Plug-in engineering:**
  - `ch*.js` and `v2/*.js` are joined into one strict IIFE, so v2 chapters use new identifiers (`CH_LICHEN_V2`) and `V2.push`.
  - Files take numbered prefixes (`00_entry`, `00_fx`, `00_wf`, `01_widgets`, `02_hunt_ext`) to avoid temporal-dead-zone errors.
  - A wrap in a `v2/00` file is outermost, because v2 loads after `ch99`.
  - `boot.js` throws unless every non-Hunt chapter has `notes()` and every chapter has `intro.goal`, so v2 chapters keep them: `notes()` feeds the live graph, and a one-line goal stays even though FCR-12 skips the intro card.

### 16.3 Phase 0: Foundations (3–5 weeks, alongside the science sweep)

Framework work, reconciled with D4's FCR list. "Plug-in" means a `v2/00` file with no shell edit.

| Item | What | Route |
|---|---|---|
| FCR-1 | Stage layout classes, live strip, dock; replaces the 560 px cap | `shell.html`, `ui.js` |
| FCR-2 | `requestAnimationFrame` loop (`ui.js:151`) | `ui.js` |
| FCR-3 | Embedded WOFF2 fonts, metric-matched fallbacks | `shell.html` |
| FCR-4 | One-slot whisper replaces toasts (`core.js:107`) | `core.js` |
| FCR-5 | Button and star states, focus ring; choice buttons never greyed together | `ui.js`, shell CSS |
| FCR-6 | `tokens.css`, `Pal` mirror, legacy theme adapter | Plug-in (injected style) |
| FCR-7 | `fx.js`: tween, particles, pop-ups, shake, governor; `Snd` v2 | Plug-in `00_fx.js` |
| FCR-8 | DOM label layer, virtual cursor, live region | Shell (a layer inside the Stage) |
| FCR-9 | Ghost-hand layer | Plug-in `00_fx.js` |
| FCR-10 | Teacher strip, projector theme | Shell, `ui.js` |
| FCR-11 | Colour-vision preview (`?cvd=`) and visual-regression harness | Plug-in plus tests |
| FCR-12 | v2 entry without the intro card; the v2 end card | Plug-in `00_entry.js`, wrapping `App.open` and `End.show` outermost |
| D2-1 | URL parameters: `unit`, `level`, `seed`, `teacher`, `projector`, `locks`, `cvd`, `lab` | `boot.js` |
| D2-2 | Level select through a `startLevel(n)` contract field | `ui.js` |
| D2-3 | `Events.emit()` log (unit, level, seed, actions, predictions, outcomes) with CSV export | `core.js` |
| D2-4 | Versioned star schema per unit: a change moves the old best to `v1stars` (D1 G12) | `core.js` `Save` |
| D2-5 | Storage adapter (§12) | `core.js` `Save` |
| D2-6 | Shared Wright–Fisher/multinomial helper; the determinism rule; cross-browser result-code CI | Plug-in `00_wf.js`, tests |
| D2-7 | Scene-lab route (`?lab=1`): `P` sliders, seed and a replay box, so the designer can tune "is it boring?" by feel (R6 §7) | Plug-in |
| D2-8 | Subtitle patch (§3) | Plug-in `00_entry.js` |

**Also in Phase 0:**
- the v2 contract extended per D0 §6.4 (`sim` with step, act and snapshot; a content object; tagged params; `keys`; concept codes; minutes);
- concept codes on all 48 chapters and the syllabus crosswalk;
- the notation table and item-bank schema, and a 25-item pre/post draft;
- Node oracle tests (R6 §4.3), and golden trajectories for the ten favourites in three browsers;
- screenshots at 390×780, 1024×768 and 1280×720, plus `mono` and `deut`;
- `Equilibrium_HW_v2.html` rebuilt with the G7 text (G7 #13);
- D3's tier-1 specs.

*Gate:*
- all 48 chapters pass the monkey in the new shell; oracles pass; every chapter carries codes;
- golden trajectories are unchanged in all three browsers;
- a save survives in an iframe where `localStorage` throws;
- FCR-1, 7 and 9 work, so D1's Wood pilot gates can be judged;
- D1 has approved the Mixer and Drift Casino specs.

### 16.4 Phase 1: Vertical slice (6–8 weeks)

*Entry:* the Phase 0 gate, including the approved tier-1 specs.

The slice proves the frame, the template and the teacher loop, as v2 plug-ins:
- Act 0 Lichen Wood (D1, piloting the template);
- the Black Country, inheriting the Act 0 moths through the persistence genome, with the gene-pool lens (D1);
- the Mixer and the merged Drift Casino (D3);
- Hawks and Doves with invasion (D1);
- a map with three places, the moth bestiary page, a sandbox with three tools and five cards;
- a 30-item Field Review;
- projector mode, level select, assignment links and export.

Size: 2 L + 3 M units (§16.5). In parallel, R6's Stage 1 spike ports the **v2** Lichen Wood to TypeScript and Pixi as the migration go/no-go. D3 writes the tier 2–3 specs.

*Gate:*
- think-aloud playtests with 10–12 new undergraduates: median time to first action under 10 s; at least 70% start the next unit unprompted; median enjoyment at least 4 of 5; prediction error falls across each unit's levels; normalised gain at least 0.3 on six matched pre/post items;
- D1's five-player Wood gates: at least 60% explain S and R after L1; most see the rare morph rise in L3; no bot earns three stars; 60 fps with 300 eggs plus particles;
- the Mixer passes the "boring" flag;
- the designer calls it fun;
- 60 fps on a low-end Chromebook.

### 16.5 Phase 2: Content waves (5–7 months)

**Sizing (D3's key).** Waves are budgeted in M-equivalents, not unit counts: S = 0.6, M = 1, L = 1.8, from the midpoints of D3's file-size ranges (S 15–25 KB, M 25–45 KB, L over 45 KB). Sizes for rebuilds are D2's provisional estimates until D3's specs confirm them. The slice is 6.6 M-eq in 6–8 weeks including platform work; waves then run at about 3 M-eq a week.

- **Wave A: the rest of the spine, plus P0 only** (27 units, about 29 M-eq, 10–12 weeks). Entry: tiers 2–3 approved.
  - *D1 favourites:* Bitter Wings, Jaws, Switches, Raffle (M); Forager, Alarm Call, Clinic (L).
  - *D3 spine:* Mendel (S); Tree Thinking, Scribe, Census, Why Sex?, Commons, Coalescent, River (M); Archipelago, Out of Africa (L).
  - *P0 games:* Leaky Tap (S); Royal Line, Malaria Coast, Gene Swamping, Dig, Extinction Roulette (M).
  - *P0 hosts:* Pedigree, Invisible Carriers (S); Breeder, Seed Rain (M).
  - If the wave runs over, Seed Rain's Ellipse levels slip to Wave B first.
  - No P1 proposal is in Wave A.
- **Wave B: the rest of Acts 1–8** (19 units, about 18 M-eq, 6–8 weeks): Crossing Over, Lock and Key, Twelve Flasks, Lottery of the New, The Crowd, The Slow Island, The Pond, Two Sizes, The Strutting Ground (L), The Fig, The Selfish Spindle, The Meadow, The Skaters, The Nest, Blood Debts, Many Become One, The Guest, The Hive, The Cleaning Station; and the Drunkard's Walk card.
- **Wave C: the rest of Acts 9–11 and the full sandbox** (12 units plus the capstone, about 13 M-eq, 5–6 weeks): Copy and Paste, Tangled Pairs, The Sweep, `clock`, Two Fruits, The Ring, Doubling, Pseudoreplication Trap, The Pathogen, Genetic Rescue, Human Variation, The Refuge.
- **After the pilot** (about 12 M-eq): the 12 side quests and the appendix, in yearly releases.

**Definition of done.** A unit ships only when it has all of the following:
- D1 template compliance, including G3's three loops in the spec;
- a per-second verb (§4);
- an oracle test and a bot sweep with no fixed strategy at three stars;
- a keyboard path, and an untimed mode where needed;
- a MODEL card;
- concept codes (and so syllabus tags);
- at least five review items;
- instructor notes and three prompts;
- screenshots at three sizes plus `mono` and `deut`;
- D4's colour-vision CI check on its declared encodings, and the canvas-text (≥ 12 px) and hit-area (≥ 44 px) lints;
- the cross-browser determinism check if it offers shared seeds;
- Coordinator A's sign-off;
- a five-student playtest with no "boring" flag (a level where most testers idle or ask how long is left).

A unit that fails the boring flag twice is demoted (§4).

**Sensitive-content gate** (D3's Human Variation review, generalised). Malaria Coast and Out of Africa (Wave A), Human Variation (Wave C) and the Manhattan Hunt (side quest) need sign-off before build and again before release. The panel is Coordinator A, a human population geneticist and a scholar of race and science, working from the ASHG 2018 statement and the NASEM 2023 report (D3 §6 Q3).

*Gate per wave:* a 20-student playtest of the wave's route; review-item accuracy rising across sessions; no unit below 3.5 of 5 for enjoyment.

### 16.6 Phases 3–5

**Phase 3: Teacher features and platform (3–4 months, overlapping Wave C).** R6 Stages 2–3: the TypeScript shell hosting legacy and v2 units, then porting v2 plug-ins, which is cheap because they follow the migration rules. Also: class mode, LTI 1.3 with a SCORM fallback (the storage adapter already exists), xAPI events, the dashboard, the live pool, the scenario editor, an external accessibility audit with screen-reader users, and a pilot translation.
*Gate:* three lecturers run two lecture inserts each, unaided; the misconception report matches a hand-scored sample; zero serious axe-core violations.

**Phase 4: Pilot (one term).** Two courses, n ≈ 200 (R8 §4), ethics approval, a pre-registered analysis: the 25-item test plus CINS and GeDI, against an active-learning comparison (HHMI BioInteractive), with embedded items and ACORNS explanations scored by EvoGrader.
*Success:* normalised gain (Hake 1998) of at least 0.3 on targeted concepts and 0.1 above the comparison; need-based explanations halved; at least 70% voluntary continuation; three of four instructors would reuse it.

**Phase 5: Publish.** A version-pinned yearly release (PWA, single offline file, SCORM, LTI listing), a teacher site with route guides, instructor notes and the syllabus search, a science-validation statement, a VPAT and open pilot data. Side quests ship in these releases. From then on, success means adoption, reuse and gains that hold in new courses.

---

## 17. Compliance with D0

### How D2 removes the root causes

| RC | D2's structural fix |
|---|---|
| RC1 Player calculates; population does not respond | All 13 "slider, % of best" chapters rebuilt or merged; "% of best" banned; optima only in the debrief; every behavioural unit ends with an invasion view; the demotion rule removes any unit without a per-second verb. |
| RC2 Player is the evolving organism | The frame's default role is keeper of the environment, plus the two amended roles (budgeted investigator, variant-releasing experimenter); the six offending chapters rebuilt with R8's reframes; need language banned by the voice rules. |
| RC3 Text before play | No card before the first action (FCR-12); BRIDGE on the map, TRANSFER as first gestures, RECALL as a station deck; level-2 quizzes cut; Equilibrium's panels compressed into a 12-minute Mixer; D4's text limits. |
| RC4 Concept in the caption | Live graph instead of the Notes sheet; picture before number; HW lens and triangle as HUD; readable creature sizes (D4). |
| RC5 No escalation; dominant strategy | Escalating levels and an inverting boss in every unit; a bot sweep in the definition of done; act field problems; randomised Census causes; Realistic mode; scoring against the knowable optimum. |
| RC6 Model, text, evidence disagree | A science gate and a sensitive-content gate in the definition of done; MODEL cards; ×N tags; Contested badges; oracle tests; designed and real data separated by geography; heterozygote advantage taught only after selection. |
| RC7 Three games, no spine | One world, one diploid engine (`Gen`), Hunt, one notation table, anchor organisms, a prerequisite graph with unit-level exceptions and callback edges, every duplicate merged, trees in Act 1, the Coalescent after drift, level select, projector mode. |

### Respecting D0 section 3

This document respects every constraint in D0 section 3. Where structure touches the science:
- Act 3 presents Hardy–Weinberg as a null model and states the one-generation conditions; the Royal Line tests them.
- Heterozygote advantage waits until after Forces (Malaria Coast), and the Census's hidden causes exclude drift and assortative mating as saboteurs.
- The Pedigree shows disassortative mating moving p.
- The Drift Casino carries the neutral rule and Ne and scores bottlenecks on allelic richness, with at most four hues and then patterns or letters. Lottery of the New carries the 2s rule.
- The Black Country keeps one carbonaria origin, labelled as compressed history.
- Hawks uses hermit crabs; Alarm Call uses Sherman's cost signs and identity by descent; the Commons separates weak from strong altruism.
- After the Fire cannot ship while it rewards the IDH; contested topics carry no star for a side.
- Agency language is fixed in §14; every unrealistic parameter wears ×N; Realistic mode labels the rise and decline values separately.
- Every new claim goes to Coordinator A before build. D2's own claims are the Realistic-mode s values (Haldane 1924; Cook 2003; Saccheri et al. 2008), the WHO 2015 survey figure, and the syllabus item numbers.

### Answers to D0's questions for D2

1. **Core and appendix:** 63 core units (about 16 h) before the fun gate trims it; a spine of 22 (about 6 h); three ecology units in the appendix; 12 side quests and the Drunkard's Walk as cards; a demotion rule instead of a promise that nothing is cut (§3, §4).
2. **HW merge:**
   - L1–L7 become the Mixer; L8, L15, L17 and the Case Files join the Census; L14 becomes The Pedigree; L16 becomes Invisible Carriers.
   - L9 goes to The Black Country and L12–L13 to the Drift Casino.
   - L10–L11 are replaced by the Leaky Tap and Gene Swamping.
   - Heterozygote advantage goes to Malaria Coast.
   - Equilibrium survives as a route and an exportable build, not as a codebase (§5).
3. **Game or hub:** a hub of acts on one map. Acts 1 and 2 open after Act 0, Acts 3 and 4 follow in order, and later acts are open once their prerequisites are met. The Clinic and the Refuge open after Act 4. R2's campaigns become Acts 6–8 (§3).
4. **Sandbox:** it opens after Act 0, grows with every unit and completes as the capstone. Scenario cards are JSON in four kinds, and demoted units become card sets (§7).
5. **Act 0:** variation, inheritance and differential reproduction; overproduction with carrying capacity as a random winter cull; individuals fixed while proportions change; no variation, no selection (as What if? buttons); apostatic selection keeping three morphs; the whole interface grammar (§9).
6. **Wave 2 order:** the order is set out below (§16).
   - *Phases:* Phase 0 (R6 Stage 0 plus all twelve FCRs) → slice (Lichen, Black Country, Mixer, Drift Casino, Hawks) → Wave A (the rest of the spine plus P0) → Wave B (the rest of Acts 1–8) → Wave C (the rest of Acts 9–11 and the sandbox) → side quests after the pilot.
   - *Spec tiers* gate each step.
   - *Migration:* the Stage 1 spike ports the v2 Lichen during Phase 1; Stage 2 follows the slice gate; Stage 3 ports v2 units wave by wave. Content never freezes.
7. **Shell changes now:** the Phase 0 table in §16.3. FCR-6, 7, 9, 11 and 12 ship as `v2/00` plug-ins; FCR-1–5, 8 and 10 need shell or `ui.js` edits.

---

## 18. Disagreements with integrator

1. **The felt-cost clause cannot apply as written to null-model and investigator units.** The template amendment demotes any unit lacking "a felt cost that grows as the population adapts".
   - *The problem:* in the Mixer, the Census, The Pedigree, Tree Thinking and the Coalescent nothing adapts; the population is a null model or a historical record. Read literally, the clause would demote half of Act 3, including two spine units and a slice unit.
   - *D2's ruling:* for these units the clause means "a felt cost that grows as the level gets harder" (field days, sample budget, sweeps per season, time), and the per-second-verb clause applies unchanged. This keeps the gate's purpose (no worksheets) without demoting the Hardy–Weinberg spine.
   - *For D3:* the Mixer must still name its verb. One candidate: the player sweeps a net through the gamete cloud with a limited number of sweeps per season, each catch pairs an egg and a sperm, and the token lands in the p² square within 200 ms, so small catches scatter around p² before converging.
2. **"Pollination and coevolution" needs the same truth condition as "runaway".** It is accepted as the Meadow's subtitle, but it is true only if the rebuilt Meadow lets the pollinators evolve too: for example, pollinator tongue length as a lineage in an invasion view, alongside the evolving flowers and S-alleles. With flowers evolving to a fixed pollinator community, it is one-sided selection, not coevolution. So the condition goes into D3's tier-4 spec for the Meadow. Until it is met, the subtitle reads "Pollinators and plant mating".

---

## 19. Revision notes (round 2)

- **Ownership and gates:** D3 specs every non-favourite unit in five tiers; tier 1 (Mixer, Drift Casino) gates Phase 1, tiers 2–3 gate Wave A, and P1/P2 games are frozen until tiers 1–3 exist. A Spec column is added to the triage table (§4, §16.1).
- **Placement:**
  - Royal Line moves to Act 3.
  - Skaters, Cleaning Station, Refuge, Twelve Flasks and Tangled Pairs are placed; the binding merges are applied.
  - 12 side quests, plus the Drunkard's Walk as a scenario card; all 33 D3 games are placed (§4.1).
  - Core: 63 units, about 16 h.
- **Unlocking:** Acts 1 and 2 both open after Act 0. Unit-level prerequisites are added (Clinic and Refuge open after Act 4), and callback edges are drawn on the map (§3).
- **Hardy–Weinberg order:** Census boss = Wahlund deficit; Invisible Carriers boss = inbreeding. Heterozygote advantage only in Malaria Coast. The Census gains null alleles, genotyping error and a phenotype-only case (§5).
- **Act 0 and persistence:**
  - The winter cull replaces "the bark holds 30 moths".
  - Three morphs; the dark-bark rerun moves to `soot`, and TRANSFER.soot becomes L4's opening gesture.
  - The persistence genome is defined, with an epistatic carbonaria locus (§2, §8, §9).
- **Notation:** q_O; H_o = 2pq(1 − F); new rows for σ, d_xy, dN/dS, λ, δ, r_m, K, hemizygous males, C, 2s ownership and the Raffle share (§15).
- **Realistic mode:** defined for Hunt units; the rise and decline s are labelled separately (§11).
- **Phase 0 and roadmap:**
  - All twelve FCRs are scheduled.
  - Added: storage adapter, determinism rule with cross-browser CI, shared Wright–Fisher helper, scene lab, syllabus crosswalk, the Equilibrium rebuild (G7 #13) and the subtitle patch.
  - Wave A is the spine plus P0 only; waves are sized with D3's S/M/L key.
  - The definition of done adds the bot sweep, colour-vision CI, lints and a sensitive-content gate (§12, §16).
- **Also:** the demotion rule; the subtitle decisions; the great tit as Act 6 anchor; `Gen` as the only diploid engine; D4's text limits; Twelve Flasks as the freezer's origin; layout requests to D4 (§6).
