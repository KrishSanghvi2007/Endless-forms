# Endless Forms: the game bible

> **Current status and the next steps live in `START_HERE.md`. Read it first.** As of 21 Oct 2026 the v2 engine and 17 v2 units (all 9 favourites, Equilibrium, Drift Casino, The Scribe and four new games) are built; play `games/endless-forms/Endless_Forms_v2.html`. Some sections below (§4, §10) still describe the pre-Wave-2 state; START_HERE's tables win.

*The single reference for anyone, human or agent, working on this repo. Read it instead of the ~200,000 words in `docs/`; open those only when a section here points you there. Last updated 2026-10-14. Keep it under about 6,000 words and update the decisions log (§13) every session.*

**Precedence when sources disagree:** the designer (Krish Sanghvi) > `docs/design/D6_designer_decisions.md` (the designer's binding answers, 14 Oct 2026) > `docs/design/D5_design_decisions.md` > the design document that owns the topic (D1 favourites, D2 structure, D3 other units, D4 look) > `docs/CRITIQUE.md` > reviews. An R7 fact-check beats the review it checks. D0 §3 rules on science.

---

## 1. Purpose and audience

Three browser games by Krish Sanghvi (evolutionary biologist, University of Oxford), built with Claude, teach undergraduate evolution. The designer's own verdict: overall the games are poor. Concepts are not always correct or fully worked out, many chapters are boring, many are not visually interesting, and the whole is clunky. Nine favourites are the exception (§5).

This bible serves coding and design agents (rules, state, commands, next steps), the designer (decisions, open questions, progress) and future collaborators (reviewers, playtesters, lecturers).

## 2. The vision

One combined game, *Endless Forms*, in which an undergraduate understands **every** concept from the three current games (Endless Forms, Tangled Bank, Equilibrium) and the gaps the reviews found, **through play and visuals alone**. It must be scientifically correct, genuinely enjoyable, not clunky, and good enough that professors and teachers adopt it: level select, projector mode, shared seeds, CSV export, instructor notes, LMS saves.

The agreed frame (D5 decisions 1–2, awaiting the designer's sign-off):
- The player is the new keeper of a field station on **the Tangled Bank**, a living coast with about 16 places (Wood, Beetle Isle, Shore, Lake, Meadow, Hedge, Pond, Outer Islands and others), a **Lab** for controlled experiments and an **Expeditions** map of real cases ending in the **Archive** of real data. Those three layers carry the three kinds of truth: model, experiment, nature.
- **Twelve acts plus a sandbox capstone**, laid out as a hub: 0 The Wood; 1 Ancestry and evidence; 2 Heredity; 3 Equilibrium (the gene pool); 4 Forces; 5 Adaptation and coevolution; 6 Behaviour and life history; 7 Sex; 8 Cooperation and conflict; 9 Genomes and development; 10 Species and macroevolution; 11 Applied and human; then the Tangled Bank sandbox.
- A **22-unit spine** (about 6 hours; the first-year route): Lichen Wood, Tree Thinking, Mendel's Garden, The Scribe, The Mixer, The Census, The Black Country, Drift Casino, Bitter Wings, Left Jaw Right Jaw, Hawks and Doves, The Forager, Why Sex?, The Raffle, Alarm Call, The Commons, Switches, The Coalescent, The River, The Archipelago, The Clinic, Out of Africa. The full core is 63 units (about 16 hours) before playtests trim it.
- **Persistence:** places keep resident populations (your Act 0 moths meet the soot in Act 4). Each unit unlocks one sandbox lever.
- **Refused on purpose:** coins, energy, loot, daily rewards, speed leaderboards.

Full structure: D2 §2–3.

## 3. Design pillars and principles

The designer's six principles (`docs/ORIGINAL_README.md`), as amended by D5:

1. **Predict → act → observe → explain → transfer.** Predictions are *gestures on the live graph* (drag a histogram ghost, tap the triangle), scored by distance against a tolerance band. Never a two-option choice. Explanation is intervention ("What if?" thaws a frozen generation and changes one thing). Transfer is a boss or a new context.
2. **The player is a selective force, never the evolving organism.** Four allowed roles (D1 G1): the *selective environment* (predator, drug, storm); a *behaving animal* whose rule then competes as an allele in a visible population (the "invasion view"); an *investigator with a budget*; an *experimenter who releases a variant*. The player never dials an organism's own heritable trait: that rehearses need-driven evolution, the hardest misconception to shift.
3. **Visuals carry concepts.** Every animation is information: alleles flying into jars *are* the allele frequency. The picture changes before any number appears. Reveal ladder: world changes → sprites slide into the graph → number → name → equation behind "Why?".
4. **Three kinds of truth.** Each unit separates *the principle*, *what this model assumes* (a MODEL card tagging every parameter realistic, designed or ×N) and *what happens in nature*, including the debate.
5. **Failure is data.** An "Interesting result" of ≤25 words, then What if?. Loss is visible (a ghost ring, an empty nest, a turbid dish); no human is ever shown dying.
6. **Scored on understanding.** The player pursues the agent's goal (chicks fed, patients cured) in that currency. No "% of best"; the knowable optimum appears only in the debrief. Three stars: **Discover** (cause the phenomenon), **Predict** (gestures near the *expected* outcome, never the realised run), **Transfer** (boss or new situation). No star for a click, for a side on contested science, or lost to accessibility settings.

**The favourites' loop is the template for every unit:** *you pursue the predator's (or doctor's) goal; evolution happens to the population as a by-product you see the next morning, and it makes your job harder.*

**Three loops per unit (D1 G3):** a per-second verb with feedback ≤200 ms; a minute ending in a visible population change; a level adding exactly one variable; 3–6 levels and a boss that inverts the lesson. **Fun gate:** no per-second verb, or two five-student "boring" flags, and the unit becomes scenario cards. **Bot sweep:** always-A, always-B, random, greedy and fixed-threshold bots never earn three stars.

The binding 14-line acceptance checklist for a finished unit is D5 §3.

## 4. What exists now

### 4.1 The three games

| Game | Shipped file | Source | What it is | Verdict |
|---|---|---|---|---|
| Endless Forms | `games/endless-forms/Endless_Forms_v1.html` (800 KB, 251 KB gzip, built 11 Oct) | `games/endless-forms/source/` | 48 chapter-minigames in 11 sections; Notes drawer; learning layer (`ch99.js`) | Mostly worksheets with a game skin; favourites strong. Becomes the product |
| Equilibrium | `games/equilibrium-hw/Equilibrium_HW_v2.html` | `games/equilibrium-hw/source/` | 17-level Hardy–Weinberg course plus Case Files | Best teacher, least like a game (~80% panels and MCQs). Becomes Act 3 |
| Tangled Bank | `games/tangled-bank/Tangled_Bank_v1.html` | `games/tangled-bank/source/` | Earliest prototype: 3 hunt, 3 Steward chapters | Best art and engine; Steward is "toggle and wait". Becomes world and sandbox |

**The shipped HTML files are stale.** Wave 1's ~300 science corrections are in source only: the shipped Endless Forms still says "fiddler crabs", and the shipped Equilibrium still explains migration backwards. Rebuild them first (§10). No v2 code exists (`source/v2/` is empty and untracked) and no student has played anything.

### 4.2 Endless Forms: the 48 chapters

Registry: `PLAN` (sections, ids, titles, subtitles) and `reg()` in `ui.js`; the `ALL` list in `boot.js`. Files are in `games/endless-forms/source/`. Verdicts are D2's triage (CRITIQUE §4): KEEP (polish), REBUILD, MERGE, DEMOTE (appendix). ★ = spine; brackets = target act.

| # | Sec. | id | Source | Now | Verdict and plan |
|---|---|---|---|---|---|
| 1 | I Heredity | `mendel` | ch1.js; L2 ch7.js | Cross peas, label pure or carrier; L2 linkage, χ² | KEEP: crosses cost a season, Brier-scored calls (2★) |
| 2 | I | `scribe` | ch2.js | Timed typing of complementary bases | REBUILD: tag mutation sparks; Luria–Delbrück plates (2★) |
| 3 | I | `cross` | ch4.js | Place crossovers, order genes | REBUILD: introgression breeder with marker probes (2) |
| 4 | I | `census` | ch13.js | Sample 20 snails, judge heterozygotes | MERGE host: evidence budget, Wahlund boss; absorbs Eq L8, L15, L17, Case Files (3★) |
| 5 | I | `coal` | ch16.js | Slider guess, then watch a genealogy | REBUILD, move after drift: drag a lineage back in time (9★) |
| 6 | II Chance | `casino` | ch1.js | Bet chips on drifting jars | MERGE host: chips as a distribution; Buri's bottles (Ne); 12-allele boss (4★) |
| 7 | II | `castaways` | ch4.js | Pick a storm size; bring a migrant | SPLIT: L1 to the Casino; L2 becomes Genetic Rescue (11) |
| 8 | II | `sex` | ch17.js | Toggle the pond sexual or asexual | REBUILD: play a parasite; a clone invades (7★) |
| 9 | III Selection | `lichen` | hunt.js (text in boot.js) | Tap moths on bark in a 12 s morning | KEEP, favourite: Act 0 hook L0–L3 (0★) |
| 10 | III | `soot` | hunt.js | Same hunt as soot comes and goes | KEEP, favourite: inherits the Act 0 moths (4★) |
| 11 | III | `fancier` | ch16.js | Tap 6 of 24 identical pigeons | REBUILD as The Breeder: plateau, F, "gym" level (2) |
| 12 | III | `sieve` | ch2.js; missions ch10.js | Draw a survival curve | REBUILD as Seed Rain: sow mixes, call weather (5) |
| 13 | III | `bitter` | hunt.js | Hunt mimics; a bitter mouthful costs 3 s | KEEP, favourite: taste ledger, model crash (5★) |
| 14 | III | `landscape` | ch25.js | Tap a fitter neighbour; quiz | REBUILD as Twelve Flasks (Lenski) (5) |
| 15 | IV Games | `jaws` | ch2.js | Tap left or right to guard | KEEP, favourite: several fish, lizard boss (5★) |
| 16 | IV | `hawks` | ch5.js; L4–5 ch10.js | Pick Hawk or Dove | KEEP, favourite: 150-crab beach, invasion (5★) |
| 17 | IV | `bats` | ch15.js | Share or refuse with fixed bats | REBUILD: kin, bonds, rule tournament (8) |
| 18 | V Sex | `brood` | ch7.js (`CH_BROOD_V1` in ch1.js unused) | Set sons with ±, press Lay | REBUILD as The Fig: haplodiploid foundress (7) |
| 19 | V | `gametes` | ch3.js | Size slider, spawn ×12 | REBUILD: release mutant gametes (7) |
| 20 | V | `lek` | ch6.js | Next or Choose; hold to strut | MERGE with TB Aripo as The Strutting Ground (7) |
| 21 | V | `raffle` | ch3.js; L2 ch9.js | Split sperm across six females | KEEP, favourite: the Drum, later-male risk (7★) |
| 22 | V | `spindle` | ch12.js | Breed and name drivers | KEEP L1, REBUILD L2–3 (7) |
| 23 | V | `meadow` | ch8.js | Cycle flower traits; spur slider | REBUILD: play the pollinator; S-alleles (7) |
| 24 | VI Families | `alarm` | ch7.js (extends `CH_ALARM_V1`, ch5.js) | Read kin; Call or Silent in 1.8–3 s | KEEP, favourite: pedigree tagging (8★) |
| 25 | VI | `nest` | ch11.js | Choose clutch; feed; beg | REBUILD: costly eggs, cuckoo boss (8) |
| 26 | VI | `commons` | ch22.js | Two toggles, group size ± | MERGE with TB Commons: Price bars (8★) |
| 27 | VI | `many` | ch24.js | Time transfers; whack cheaters | REBUILD: propagules, single-cell bottleneck (8) |
| 28 | VII Lives | `livefast` | ch18.js | Effort slider; r or K | MERGE into TB Slow Island (6) |
| 29 | VII | `forager` | ch3.js; L4–5 ch9.js | Tap grubs; leave bushes; hawk | KEEP, favourite: one great tit's day (6★) |
| 30 | VII | `crowd` | ch19.js | Left or right feeder | REBUILD: one fish among 24 (6) |
| 31 | VII | `plastic` | ch18.js | Helmet or no; quiz | REBUILD as The Pond (*Chaoborus* larva) (6) |
| 32 | VIII Coevol. | `lock` | ch22.js | Pick a key; resistance slider | REBUILD: parasite, then garter snake (5) |
| 33 | VIII | `clinic` | ch13.js | Pick a daily dose for 10 days | KEEP, favourite: live dosing, plasmid ward (11★, after Act 4) |
| 34 | VIII | `virulence` | ch14.js | Replication-rate slider (myxoma) | REBUILD: vet vaccinates rabbits (11) |
| 35 | VIII | `guest` | ch23.js | Ration oxygen to nodules; quiz | KEEP L1, REBUILD L2 (8) |
| 36 | IX Genomes | `switch` | ch25.js | Toggle a Hox grid, hatch a fly | KEEP, favourite: A1 column, stickleback boss (9★) |
| 37 | IX | `copy` | ch27.js | Crosses plus questions | REBUILD: genome as city (9) |
| 38 | IX | `sweep` | ch26.js | Sequence 7 of 40 windows | KEEP L1, REBUILD L2 (9) |
| 39 | IX | `clock` | ch26.js | Date slider; saturation toggle | REBUILD: calibrations, dN/dS (9) |
| 40 | X Species | `river` | ch6.js | Wait, test or let banks meet | REBUILD: hold the ford (10★) |
| 41 | X | `fruits` | ch21.js | Six predictions, then a run | REBUILD: draggable inversion (10) |
| 42 | X | `ring` | ch20.js | Test-cross search; song cards | REBUILD: walk round the valley (10) |
| 43 | X | `double` | ch20.js | Plant tetraploids | KEEP L1, REBUILD L2 (10) |
| 44 | XI Deep time | `arch` | ch27.js | Beak slider; quiz | REBUILD: drag storms; cichlid boss (10★) |
| 45 | XI | `tree` | ch28.js | Questions on a tree | REBUILD, move to Act 1 (1★) |
| 46 | XI | `web` | ch28.js | Removal experiments; quiz | DEMOTE to appendix |
| 47 | XI | `islands` | ch29.js | Area and distance sliders | DEMOTE to appendix |
| 48 | XI | `fire` | ch29.js | Fire-interval slider | DEMOTE until rescored |

Shared files: `core.js` (seeded `R()`/`seed()`, `Gen`, `Snd`, `Save`, `Cards`, `Stage`); `hunt.js` (`Hunt`); `ui.js` (`PLAN`, `End`, `Notes`, `App`, `Menu`, `frame()`); `ch27.js` also holds the `QZ` quiz helper; `ch99.js` is the learning layer (`TAKE`, `BRIDGE`, `TRANSFER`, `RECALL`, `MODEL`, keyed by id).

**New units (D3; final ids):** `mixer` The Mixer (slice), `royal` Royal Line, `tap` Leaky Tap, `malaria` Malaria Coast, `swamp` Gene Swamping, `dig` The Dig, `extinct` Extinction Roulette, `ooa` Out of Africa, `carriers` Invisible Carriers, `pedigree` The Pedigree. P1 (frozen) and P2 lists: CRITIQUE §6.

### 4.3 Equilibrium (17 levels and Case Files)

Level ids `l1`–`l17` and `cases` in `lv_a.js` (L1–L4), `lv_b.js` (L5–L8), `lv_c.js` (L9–L13), `lv_d.js` (L14–L17, cases); shared `engine.js` (`hwExp`, jars, triangle).

| Levels | Now | Verdict |
|---|---|---|
| L1 Two copies each, L2 Break into alleles, L3 Dominant isn't common | Classify beetles; watch jars; MCQ | MERGE into The Mixer: lens-tag roaming beetles |
| L4 Gamete pool, L5 Why p², L6 Why 2pq | Draw buttons; slider; tap cells | MERGE into The Mixer: crank a tumbler, fill the p × q square |
| L7 One generation | Tap a prediction on the triangle | KEEP as the Mixer boss, then an X-linked twist |
| L8 Equilibrium Island, L15 Evolving or unbalanced?, L17 Real populations, Case Files | Toggles; one label each; answers in the prompts | MERGE into The Census (evidence budget, randomised causes) |
| L9 The bird | Tap static beetles | MERGE into The Black Country |
| L10 The slow ray, L11 The bridge | MCQ and Run buttons | CUT; replaced by The Leaky Tap and Gene Swamping |
| L12 Five tiny islands, L13 Volcano and castaways | Size buttons; watch | MERGE into Drift Casino (Buri; alleles kept) |
| L14 The matchmaker | Pair beetles; mating buttons | REBUILD as The Pedigree (F by path counting) |
| L16 Invisible carriers | MCQs and a slider | KEEP as Invisible Carriers (q = √aa; ABO "Blood Bank") |

Equilibrium's best inventions must survive: the allele-wearing beetle, the phenotype/genotype lens, alleles flying into jars, the p² square, the 2pq tile collapse, the de Finetti triangle as a map, one-idea panels of 35–60 words. `games/equilibrium-hw/v1_archive/` holds the superseded snapdragon version.

### 4.4 Tangled Bank modes

`CHAPTERS` in `app.js`: hunt chapters in `hunt.js`, Steward chapters in `steward.js`; `core.js` is a fork of Endless Forms' core.

| Chapter (id) | Mode | Now | Verdict |
|---|---|---|---|
| The Lichen Wood (`lichen`), The Black Country (`soot`), Bitter Wings (`bitter`) | Hunt | Earlier copies of the EF hunts; unswept text | MERGE into EF; its art feeds the favourites |
| Streams of Aripo (`aripo`) | Steward | One transplant button, two toggles, 160 generations of waiting | MERGE into The Strutting Ground |
| The Slow Island (`island`) | Steward | Found a colony, toggle foxes, wait | KEEP as host; absorbs Live Fast |
| The Commons (`commons`) | Steward | Rain and founder sliders; time floods | KEEP the model; live Price bars become a shared widget |
| Steward mode itself | — | Set conditions, watch | KEEP as the capstone sandbox and scenario cards |

## 5. The favourites and why

The Lichen Wood / The Black Country (one arc, two ids), Bitter Wings, Left Jaw Right Jaw, Hawks and Doves, The Raffle, Alarm Call, The Forager, The Clinic, Switches. All share a direct verb, a felt cost, instant cause and effect, and skill under pressure. Fix them first (D5 decision 4). Specs: D1 §3; visual payoffs: D4 §5.3; build list: D5 §4.

| Favourite | Why it works | What it lacks | v2 plan (D5) |
|---|---|---|---|
| Lichen Wood | Search-and-tap; S, R, h² from your own hunting; visual 8.5/10 | Overproduction invisible; apostatic selection not modelled | `v2/lichen.js`: egg tray 300 → 30, pinned moth, three-morph boss, ghost jays |
| Black Country | Same verb; soot crossfade | Dominance only in words; no lag | `v2/soot.js`: inherits the wood; carbonaria q = 0.05; gene-pool lens |
| Bitter Wings | The 3 s bitter mouthful makes your hesitation the force; 9.0, best-looking | Fixed 8:24 model–mimic ratio | `v2/bitter.js`: taste ledger; models 8 → 2 → 12; Müllerian level |
| Left Jaw, Right Jaw | Adaptation emerges from a reflex | 60 identical taps; fully heritable | `v2/jaws.js`: 3–5 fish, h² 0.9 then 0.25, lizard boss |
| Hawks and Doves | Correct payoffs, V/C, Bourgeois, war of attrition | Population ignores you | `v2/hawks.js`: your rule seeds a lineage among 150 crabs |
| The Raffle | One clear rule; budget across females | No later rivals; visual 4.5 | `v2/raffle.js`: the Drum; dung-fly precedence |
| Alarm Call | Time pressure plus reading kin | Nobody dies; every sister r = ½ | `v2/alarm.js`: pedigree tagging; negative whistle cost |
| The Forager | Felt diminishing returns; leaving under a clock | Look-ahead beats the scored optimum | `v2/forager.js`: one great tit's day; sequential prey |
| The Clinic | Clear doses, real trade-off | One optimal course; no plasmids | `v2/clinic.js`: live dosing vs MIC/MPC; plasmid bay |
| Switches | Construction toy, instant causation | No A1 column: wrong biology | `v2/switch.js`: A1 column, colinearity, stickleback boss |

The Wood, Bitter Wings, Jaws and the Clinic already have the "evolution happens to the population" loop; Hawks, Raffle, Alarm and Forager gain it through the invasion view, Switches through a population level. Jaws, Alarm, Hawks and the Raffle need the art pass most.

## 6. Science: corrections still to apply

Wave 1 (sweeps G1–G7, `docs/changes/`) fixed about 300 items in source. Check a sweep log before "fixing" anything, and do not re-add the ~15 features reviewers wrongly called missing (CRITIQUE §3.3). Open items (paths under `games/`):

**Ship what is fixed**
- [ ] Rebuild `endless-forms/Endless_Forms_v1.html` and `equilibrium-hw/Equilibrium_HW_v2.html` from source (§8.2).

**Small text edits (Session 1)**
- [ ] Lek subtitle "Mate choice and runaway" → "Mate choice and honest signals"; Meadow "Pollination and fertilisation" → "Pollinators and plant mating" (`endless-forms/source/ui.js` line 7; ship as a `v2/00_*` patch mutating `PLAN`, D2 §3).
- [ ] `MODEL.lock` (`endless-forms/source/ch99.js` line 122): add the 4% per-season mixing input; keep "deterministic".
- [ ] Lichen end card `what()` (`endless-forms/source/hunt.js` ~lines 323–331): negative realised heritability still prints as "% passed on"; show "too noisy to measure" below 0.

**Tangled Bank sweep G8 (never run; required before the Commons or Slow Island is rebuilt)**
- [ ] `tangled-bank/source/hunt.js:332` carbonaria `mu: 0.01` → 0 (one origin, ~1819).
- [ ] `hunt.js:369` per-generation card says carbonaria copies exceed the black share (backwards).
- [ ] `hunt.js:316–318` heritability printed up to 200% and blamed on "developmental luck" (true h² ≈ 0.95).
- [ ] `hunt.js:381` end card omits the typica immigrant added at `:349`.
- [ ] `hunt.js:327` "Lancashire, 1848" under the title "The Black Country" (EF `hunt.js:342` has the same; fixed in the v2 Wood).
- [ ] `hunt.js:392` (and end card `:421`) "mimics only work while they are rare" → "best while rare relative to models".
- [ ] `steward.js:218` Aripo: "choosy females carry the genes of the colourful males", preference "drifted" → offspring carry both; linkage disequilibrium; indirect selection.
- [ ] `steward.js:288` Austad "1.5×" lifespan → about 25% longer.

**Design-doc lines wrong before their units are built (CRITIQUE §4)**
- [ ] D3 §6.6 The Pond: player is a *Chaoborus* larva, not a fish.
- [ ] D3 §5.3 Leaky Tap Discover star (line ~1051): "returned to the mutation line (μ or 2μ)", not "μ".
- [ ] D1 §3.2 Bitter Wings L4: "a large-effect allele", not "supergene" (keep "supergene" for Tangled Pairs).
- [ ] D2 §4 row 32 Lock and Key: player is a garter snake, never "sets newt toxicity".

**Needs the v2 redesign (tracked by D5's build list):** Why Sex? has no real twofold cost; Bitter Wings' fixed ratio; Jaws' discrete, fully heritable trait; Hawks' scripted population; apostatic selection in the Wood; Switches' abd-A grid (`ch25.js` `ident()`); Alarm's r = ½ sisters and negative whistle cost; Brood's scripted population; the Raffle's missing remating; Two Sizes' "tiny" wins; the Forager conveyor; the Nest's free eggs; Live Fast's imposed ageing; the Clinic's missing plasmids; After the Fire's rescoring; Equilibrium L13's free point and its three models under one "non-random mating" label. Equilibrium L17's sickle-cell counts (`lv_d.js:63`) have no traceable source: never reuse. About 22 chapters still lack a MODEL caveat (list in `docs/changes/science_sweep_G6.md`).

**Science rules for all new content (D0 §3, binding):**
- Variants are selected and populations evolve; individuals never "evolve", "choose" or "need".
- Every unrealistic parameter shows "×N"; compressed history shows "≈"; designed data sit in a dashed frame, real data in a solid frame with a source.
- Expected is a dashed ghost, realised a solid line.
- Contested ideas carry a Contested pill and no star: "hit hard early", the virulence trade-off, Ewald, the intermediate disturbance hypothesis, the Yellowstone cascade, the domestication syndrome, Kondrashov, smaller ejaculates at high competition, the energy-budget rule and others in D0 §3.
- HW is a null model, not "nothing happening"; disassortative mating moves p; the neutral fixation rule is for neutral alleles only (a new beneficial copy fixes with ≈2s); bottlenecks mainly lose allelic richness.
- Heterozygote advantage lives only in Malaria Coast; F is named once, in the Pedigree; D2 §15's notation table binds every unit.
- Every claim carries a `refs` id and is signed off by Coordinator A (§15) before its text freezes.

## 7. Art and UX rules (condensed from D4)

**One look, "Field Plate":** a painted ground per *place* (16 places plus a paper Lab plate and a flat Expeditions map); flat actors with a 1.5 px ink outline, one highlight, one shadow. This retires the 39 per-chapter themes. One rig per species, reused everywhere.

**Data inks have fixed meanings** (Dusk theme / Paper fill): allele A blue `#6B97FF`/`#2F5FD0` (letter A, circle marker); allele a amber `#F2C94C`/`#E8B416` (letter a, square); selection `#F46034`/`#C4430A` (sieve, triangle); drift `#CF81A2`/`#B5588C` (scattered dots, hollow circle); mutation `#5AE2B5`/`#38B07A` (spark, plus); migration `#7CC4F0` (arrow).
- Organisms keep natural paint, kept ≥ΔE 8 from the inks.
- No red/green anywhere. State is filled vs hollow, solid vs hatched.
- Hue never enters a star, score or prediction; continuous traits use luminance or size.
- Two heritable types may wear blue/amber; three or more keep natural paint plus pattern plus letter.
- A heterozygote is blue left, amber right, never blended; a one-copy genotype is one token with a bar.
- At most three hued series per chart. No pies.
- Expected is dashed ink, realised solid, "you" a diamond; your lineage wears a 3 px paper halo.
- Humans are one-ink pictograms; outcomes are tallies; no human shown dying.

**Sizes:** u = min(width, 1.2 × height). Read entities ≥0.07u (27 px on a phone); heroes ≥0.12u; hit areas ≥44 px; canvas text ≥12 px and ≤3 words, only through `Lbl.put` (planned in `v2/00_fx.js`). A crowd of up to 2,000 is one cached layer with ≤150 moving sprites.

**Text budget** (to be enforced by `tests/lint_text.js`, planned in D5 §5.5):

| Where | Limit |
|---|---|
| Before the first action | ≤40 words in the HUD over a ghost hand, no card |
| HUD line | ≤15 words plus one live number |
| Whisper (replaces stacked toasts) | ≤8 words, 2.4 s |
| Teaching panel | 35–60 words, one idea, picture already changed |
| Interesting result | ≤25 words plus What if? |
| End card | TAKE ≤20 words, body ≤60, one chart; "Why?" holds the rest |
| Whole screen | ≤70 words on a phone, ≤120 on desktop; sentences ≤18 words |

**Juice:**
- Three tiers: T1 per action 120–200 ms; T2 per generation 400–800 ms; T3 per level 0.8–1.5 s, at most once per 3 s.
- Three beats: telegraph 30–90 ms, act, settle 150–250 ms.
- Five particle kinds, each tied to a concept (dust, scale, spark, droplet, egg); number pop-ups in ink with ▲/▼.
- Shake only for costs the player pays: 5 px, 180 ms, at most one per 600 ms.
- Every sound has a visual twin; Calm mode for every effect.

**Layout and onboarding:**
- The live graph sits beside the canvas on desktop and in a 112 px pull-up strip on phones. It never pauses play.
- "Begin" drops straight into the live Wood: a ghost hand within 3 s and a first action that cannot fail. Each later unit adds at most one verb.
- Fonts (Fraunces, Spectral, IBM Plex Mono; Atkinson Hyperlegible for Readable mode) embedded as WOFF2, replacing today's Google Fonts link, which breaks offline play and leaks students' IPs.
- Themes: Dusk (default), Paper, Projector (`?projector=1`).
- WCAG 2.2 AA per unit: keyboard map, a tap alternative to every drag, untimed mode, a data-table twin for every chart.

## 8. Architecture, build and test

### 8.1 How Endless Forms is put together
- `build.py` concatenates `core.js`, `hunt.js`, `ui.js`, `ch*.js` in numeric order (ch1…ch29, ch99), then `v2/*.js` sorted by file name, then `boot.js`, into **one `'use strict'` IIFE**, and pastes it into `shell.html` at `/*__JS__*/`.
- Chapters are singleton objects (`const CH_X = {id, intro, start, update, draw, notes, …}`). `boot.js` throws at load unless every chapter has `intro.goal` and, unless `mode: 'hunt'`, `start`, `update`, `draw`, `notes`. Hunt chapters are config objects run by `Hunt`.
- Later files extend earlier chapters by wrapping methods: `ch9.js` adds Forager L4–5 and Raffle L2, `ch10.js` Hawks L4–5 and Sieve missions, `ch7.js` Mendel L2 and rebuilt Brood and Alarm, `ch99.js` the learning layer.
- `window.TB` exposes `App, Hunt, REG, ORDER, Gen, seed, R, Save, Stage, Cards, Notes, End` for tests. Saves use `localStorage` key `endlessforms_v1`. The loop runs on `setTimeout`, not `requestAnimationFrame`.
- **Wave 2 code shape (D5 §1, §5; binding):**
  - a `sim` object (`step`, `act`, `snapshot`, `restore`) with plain-JSON state and seeded `R()` only, so a run is (seed, actions);
  - all words in one `content` object; tunables in `P` as `{v, tag, min, max}`;
  - `Gen` is the only diploid engine, `WF` the only haploid helper; `Hunt` is wrapped, never forked;
  - any value between an `R()` draw and a scored outcome uses `Det` maths, never `Math.exp/log/pow/sin/cos`;
  - a resident snapshot is ≤96 bytes;
  - performance gate: a cached 2,000-dot layer plus ≤150 moving sprites at 60 fps under 4× CPU throttle.
- Equilibrium: `engine.js` + `lv_a`–`lv_d.js` (uses unseedable `Math.random`). Tangled Bank: `core.js`, `hunt.js`, `steward.js`, `app.js`.

### 8.2 Build (run from each `source/` folder; `build.py` uses relative paths)
```
cd games/endless-forms/source && python3 build.py                        # writes source/Endless_Forms_v1.html + source/game.js
cd games/endless-forms/source && python3 build.py ../Endless_Forms_v1.html   # rebuilds the SHIPPED file directly
cd games/equilibrium-hw/source && python3 build.py && cp Equilibrium_HW_v2.html ../   # no output-name argument
cd games/tangled-bank/source && python3 build.py ../Tangled_Bank_v1.html
```
The `source/*.html` and `source/game.js` outputs are **gitignored**; only the shipped copy one folder up is tracked. Never hand-edit either: edit source and rebuild. A clean build of today's EF source is about 827 KB.

### 8.3 Test
Requirements: `pip install playwright pillow`. In the cloud sandbox Chromium is at `/opt/pw-browsers/chromium`; every test script detects it, and your own scripts must call `p.chromium.launch(executable_path='/opt/pw-browsers/chromium')`. Elsewhere run `playwright install chromium`.

```
cd games/endless-forms/source
python3 tests/monkey.py lichen,soot,hawks 1,2,3     # chapter ids, seeds; 390×780; plays to the end card
GAME_HTML=/abs/path/build.html python3 tests/monkey.py jaws 1   # test a specific build
cd games/equilibrium-hw/source && python3 tests/monkey.py l1,l9,cases 1   # 390×780 and 1280×800
```
- Tests load `source/<Game>.html` by default, so **build first**, or point `GAME_HTML` at an absolute path (e.g. a scratch build).
- `vclock.js` is injected before load. It replaces timers and `performance.now`; `window.__advance(ms)` runs ms of game time instantly; `window.__errs` collects errors; `window.__bad` collects any `fillText` of NaN/undefined/Infinity.
- `tests/monkey.js` defines `window.__monkey(id, steps, seed, replays)`. It taps, drags, holds, moves sliders and opens Notes, and returns `{status: 'end'|'error'|'errbox'|'stuck'|'badtext'|'timeout', …}`.
- `t*.py` are model-calibration checks, `shots*.py` screenshot generators, `dbg*.py` debugging scripts. Today's monkey baseline is in §13.

### 8.4 Gotchas
- A v2 file that redeclares an existing `const` (e.g. `CH_LICHEN`) is a SyntaxError that breaks the whole build. Name it `CH_LICHEN_V2` and `V2.push` it.
- Top-level code in a v2 file may reference only legacy objects and v2 files that sort earlier (temporal dead zone). Number shared files: `00_`, `01_`, `02_`; chapter files use letters; `zz_v1switch.js` sorts last.
- `tests/smoke.py` (EF and TB) is broken: `fSRC` in `shot()` raises NameError, and it ignores `GAME_HTML`. Use the monkey.
- The monkey times out on `mendel` (known since the G3 review) and `fancier`. Fix or waive both before the Phase 0 gate.
- Equilibrium's `Math.random` makes its runs unrepeatable. Tangled Bank's `core.js` is a fork of EF's: EF fixes are not in it.
- Commit modified or untracked docs before building on them.

## 9. Technology decision status

| Question | Recommendation (D5, CRITIQUE §8) | Status |
|---|---|---|
| Language and renderer for Wave 2 | Plain JS + Canvas2D, one `v2/` file per chapter, no build toolchain, no CDN, no 3D (D5 decision 21) | Binding on agents now; **not yet approved by the designer** (§14, question 3) |
| Long-term stack | TypeScript + Vite + PixiJS scenes + thin Svelte DOM shell; PWA plus single-file offline build | Decided by a one-week Stage 1 spike porting the v2 Lichen Wood (60 fps at 4× throttle, size budget, axe-core, designer says it feels better). **Not decided** |
| Port timing | Phase 3, after Wave C | R6 disagreed: TypeScript from the start. The designer may choose that instead |
| Godot, Unity | No: 8–10 MB web runtimes, canvas-only, no screen-reader tree | Recommendation firm |
| Blender | Offline only, to render sprite sheets | Recommendation |
| Three.js | Later, lazy-loaded, at most three scenes (e.g. Twelve Flasks' landscape) | Deferred |
| LMS | LTI 1.3 Advantage, SCORM fallback, xAPI-shaped events; saves via a SCORM → IndexedDB → localStorage → save-code adapter | Phase 3; adapter in Phase 0 |
| Licence and hosting | Repo carries MIT (`LICENSE`) | **Not decided** for the published app |

The visual weakness is an art and game-feel problem, not an engine problem: the best-looking chapters already run in Canvas2D.

## 10. Roadmap

Gates, not dates (CRITIQUE §9; D2 §16).

| Phase | Content | Gate |
|---|---|---|
| 0 Foundations | Rebuild shipped files; G8 sweep; golden trajectories; additive shell edits (D5 §5.2–5.3); plug-ins (D5 §5.4); lints, oracles, bot sweep; scene lab `?lab=<id>` | All 48 chapters pass the monkey in the new shell; golden trajectories unchanged; a save survives when `localStorage` throws |
| 1 Vertical slice | Lichen Wood, Black Country, Hawks and Doves, The Mixer, Drift Casino; three-place map; small sandbox; teacher strip; TS/Pixi spike | 10–12 new undergraduates: first action <10 s, 70% start the next unit unprompted, enjoyment ≥4/5; the designer calls it fun; 60 fps on a low-end Chromebook |
| 2A Wave A | Other seven favourites; spine rebuilds; P0 games and hosts | 20-student route test; no unit <3.5/5 |
| 2B, 2C | Rest of Acts 1–8, then 9–11 and the full sandbox | As above |
| 3 Platform | TypeScript shell, LTI/SCORM, class mode, dashboard, accessibility audit | Three lecturers run inserts unaided |
| 4 Pilot | Two courses, n ≈ 200, ethics approval, pre-registered | Normalised gain ≥0.3 |
| 5 Publish | Yearly pinned releases, teacher site, VPAT | Adoption |

### NEXT SESSION: start here
**Superseded: use `START_HERE.md` §5.** The list below is the pre-Wave-2 plan, kept for history.
1. [ ] Read this file, then D5 §3–5. Run `git status`; commit any uncommitted docs.
2. [ ] Rebuild the shipped Endless Forms and Equilibrium files (§8.2). Confirm "fiddler" is gone from `Endless_Forms_v1.html` and the Black Country intro has no "undefined". Run the monkey on all 48 ids; compare with §13.
3. [ ] Apply the three small text edits and the G8 Tangled Bank sweep (§6). Log them in `docs/changes/science_sweep_G8.md`; rebuild Tangled Bank.
4. [ ] Record golden seeded trajectories of `lichen, soot, bitter, jaws, hawks, raffle, alarm, forager, clinic, switch`; add `?v1=1` (`v2/zz_v1switch.js`).
5. [ ] Start D5's additive shell edits (§8.1, Phase 0) and fix or waive Mendel's monkey timeout.
6. [ ] Ask the designer open questions 1–3 (§14). Session 3 (the Wood pilot, `v2/lichen.js` + `v2/soot.js`) cannot start without them.
7. [ ] Update §13 and tick boxes here and in §6.

Session 2 builds the plug-in layer and test harness. Session 3 builds the Wood pilot and puts it in front of five students and the designer. **If the Wood is not fun, stop and fix the template before building anything else.**

## 11. Repo map

```
README.md, CLAUDE.md, GAME_BIBLE.md   human intro, agent rules, this bible
LICENSE                               MIT
archive/Evolution_Games_original_upload.zip   the designer's original upload
docs/CRITIQUE.md                      master critique and plan (read after this file)
docs/ORIGINAL_README.md               designer's overview and six principles
docs/design/D0–D5                     design brief, favourites, structure, new games, art/UX, binding decisions
docs/reviews/R1–R8                    expert reviews; R7_* fact-checks override R1–R4
docs/changes/                         science sweep logs G1–G7 and review follow-ups
docs/design-history/01–04             original idea lists, early feedback, HW brief
games/endless-forms/Endless_Forms_v1.html      shipped single file (tracked)
games/endless-forms/source/           core.js hunt.js ui.js ch1–29.js ch99.js boot.js shell.html build.py vclock.js
games/endless-forms/source/v2/        Wave 2 plug-ins (empty)
games/endless-forms/source/tests/     monkey.py/.js, t*.py, shots*.py, dbg*.py, smoke.py (broken)
games/equilibrium-hw/                 Equilibrium_HW_v2.html; source/ engine.js lv_a–d.js; v1_archive/
games/tangled-bank/                   Tangled_Bank_v1.html; source/ core.js hunt.js steward.js app.js
```

## 12. Doc index

| Doc | What it is for | Read it when |
|---|---|---|
| `docs/CRITIQUE.md` | Verdict, root causes RC1–RC7, chapter verdicts, gaps, teacher needs, technology, roadmap; Appendix A corrections | Planning priorities |
| `docs/design/D5_design_decisions.md` | Binding decisions, resolved disputes, gold-standard checklist, Wave 2 build list, engine and plug-in API | Before building anything |
| `docs/design/D0_design_brief.md` | Root causes; verified science constraints (§3); text budget | Writing any science text or model |
| `docs/design/D1_favourites_redesign.md` | Template rules G1–G12; widgets and Hunt extensions; favourite specs with oracles | Building any unit |
| `docs/design/D2_game_structure_and_roadmap.md` | World, acts, triage, scoring, teacher mode, notation table (§15), roadmap | Structure, ordering, notation |
| `docs/design/D3_new_games_catalogue.md` | Specs for 45 rebuilds and new games; engine requests (§9) | Building a non-favourite unit |
| `docs/design/D4_art_direction_and_ux.md` | Places, inks, rigs, charts, juice timings, layout, accessibility | Anything visual |
| `docs/reviews/R1`–`R3` (+ R7 fact-checks) | Chapter reviews of sections I–IV, V–VII, VIII–XI and UI | Redesigning those chapters |
| `docs/reviews/R4` (+ R7) | Equilibrium and Tangled Bank | Act 3, the sandbox |
| `docs/reviews/R5a`, `R5b` | Visual review with scores and colour-vision checks | Art passes |
| `docs/reviews/R6` | Technology and platform | Any stack decision |
| `docs/reviews/R8` | 101-concept coverage, misconceptions, teacher needs | Curriculum and teacher features |
| `docs/changes/*` | What each sweep changed, rejected and deferred | Before fixing a "bug" that may already be fixed |
| `docs/ORIGINAL_README.md`, `docs/design-history/` | The designer's intent and early ideas | Background |

Labels: R = review, D = design doc, G1–G8 = science sweeps (D1's template rules are also G1–G12; context tells them apart), P0–P2 = new-concept priority, "slice" = Phase 1, Waves A–C = Phase 2.

## 13. Decisions log

*Append one dated entry per session: what changed, what was decided, by whom.*

- **2026-10-11** Initial commit; games uploaded as a zip (`archive/`).
- **2026-10-14** Repo reorganised into `games/`, `docs/`, `archive/`; three games imported with their source.
- **2026-10-14** Codebase prepared for parallel work: `v2/` plug-in folder; `V2` and `PLAN_ADD` registries (`ui.js`, applied in `boot.js`); portable Chromium launch and the `GAME_HTML` override in every test.
- **2026-10-14** Expert reviews R1–R8 and fact-checks R7 written.
- **2026-10-14** Wave 1 science sweeps G1–G7 applied to Endless Forms and Equilibrium **source** (~300 corrections). Shipped HTML not rebuilt; Tangled Bank not swept.
- **2026-10-14** Design round D0–D4 (two rounds), integrated into D5, which is binding on Wave 2 agents.
- **2026-10-14** `docs/CRITIQUE.md` produced: the master critique and plan.
- **2026-10-14** This bible, `README.md` and `CLAUDE.md` written.
- **2026-10-14** Monkey baseline on a clean scratch build of today's source (seed 1, 390×780): 43 of 48 chapters reach the end card with no JS error or NaN text. `mendel` and `fancier` time out. `cross` (L2 Sturtevant's map), `landscape` (L1) and `double` (L2) report "stuck": the HUD is unchanged for 600 steps, probably puzzles a random tapper cannot finish (unverified). A random tapper earned three stars in `gametes`, more evidence of RC5.
- **2026-10-14 — Designer decisions (D6, binding):** (1) the game is just called *Endless Forms*, with no "field station" branding; Hardy–Weinberg is folded in as **one chapter** ("Equilibrium", id `census`, levels of rising conceptual complexity, revised for undergraduates), and the `mixer` id is withdrawn; (2) cuts accepted; (3) platform plan accepted; (4) playtesting by the designer and colleagues, with no student recruitment for now; (5) **no controversial topics**: Malaria Coast, Out of Africa, Human Variation and the Manhattan Hunt are withdrawn, and heterozygote advantage is taught with warfarin-resistant rats; (6) MIT licence for now.
- **2026-10-14** Shipped `Endless_Forms_v1.html` and `Equilibrium_HW_v2.html` rebuilt from the swept source, so players get the Wave 1 corrections.

- **2026-10-15** Wave 2 engine built and integrated: `v2/0*.js`, `zz_v1switch.js`, and additive `core.js`/`ui.js` changes. Contract in `docs/design/API_v2.md`; golden trajectories in `tests/golden/`. Test tools: text lint, bot sweep, oracle runner.
- **2026-10-15** Wave 2 Batch 1 built, reviewed (playtest, science, design), fixed and gated: `lichen`, `soot`, `hawks`, `census` (Equilibrium, the one HW chapter, 8 levels, `v2/mixer.js`), `casino`. A coordinator wrote `docs/changes/wave2/lessons_batch1.md`.
- **2026-10-15** Shipped `games/endless-forms/Endless_Forms_v2.html`: legacy chapters plus the five v2 units. The monkey reached the end card in 7 of 7 smoke runs. `build.py` now defaults to `Endless_Forms_v2.html`.
- **2026-10-15** Session paused because of the designer's usage limit. Batch 2 drafts `jaws`, `forager` and `bitter` were parked in `source/v2_wip/` (not built). Raffle, Alarm, Clinic, Switch, Scribe, Tap, Royal, Swamp and Dig were not started. Workflow scripts were saved in `tools/workflows/`; `4_continue_wave2.js` resumes the job. See `START_HERE.md`.

- **2026-10-21** Designer feedback, recorded as the D6 addendum: (7) each chapter gets its own world, organism and palette, with blue and amber only in genotype read-outs and beetles only in Equilibrium; (8) every chapter opens with a description card (game, biology, how to play) and has a "?" button to reopen it.
- **2026-10-21** Opening card built (`00_entry.js`, API_v2 §15). Batch 1 retrofitted; Drift Casino reskinned as a riverboat saloon with anoles.
- **2026-10-21** Built as v2 units, each in its own world: bitter, forager, jaws, raffle, alarm, clinic, switch, scribe (self-reviewed and tested), plus the new games royal, tap, swamp and dig (built; external reviews partial; see `START_HERE.md` §4). All 9 designer favourites are now rebuilt. Full-build `SW_C` clash fixed; `tests/dup_globals.sh` added.

## 14. Open questions for the designer

The D5 §7 questions were answered on 14 Oct 2026; see D6. Still open:

1. **Favourites.** Do the redesigns (several fish in Jaws, a 150-crab beach, live dosing, one day for the Forager, untimed tagging) keep what you loved? Judge by playing the v2 build.
2. **Ghost jays.** Wood L3 keeps three morphs alive because designed jays copy your own rule on trunks you are not hunting. Honest enough for a flagship level?
3. **Hosting** for the published app (the licence is MIT).

## 15. Conventions for agents

**Where code goes**
- New or redesigned chapters go in `games/endless-forms/source/v2/`, one file per chapter (`v2/lichen.js`), beside numbered shared plug-ins (`00_fx.js`, `01_widgets.js`, `02_hunt_ext.js`; full manifest in D5 §5.1).
- Register with `V2.push(CH_X_V2)`: the same `id` replaces the old chapter.
- Add a brand-new chapter to the menu with `PLAN_ADD.push({sec: 'Heredity', entry: ['mixer', 'The Mixer', 'Hardy–Weinberg'], after: 'census'})`. A new `sec` name creates a section; omitting `after` appends.
- Follow D5 §5.4's chapter contract (`id, v2:true, role, place, intro:{goal}, content, P, levels, startLevel, sim, start, update, draw, notes, keys, untimed, stars`).
- Shell edits to `core.js`/`ui.js` must be additive (D5 §5.2–5.3) and must not change legacy golden trajectories.
- Do not edit the legacy `ch*.js` to redesign a chapter. Replace it via `V2`, so `?v1=1` keeps the old one reachable.

**How to work**
- Edit source, run `build.py`, test. Never hand-edit a built HTML file or `game.js`.
- Test a specific build with `GAME_HTML=/abs/path.html`. Put scratch builds in your scratchpad, so parallel agents don't overwrite each other's `source/*.html`.
- Science: check `docs/changes/` before fixing; log every science change in a sweep file (claim, fix, source, test); mark contested claims with a Contested pill, never a star; use only sourced data.
- Every unit must pass D5 §3 before it is called done.

**The critique ↔ design loop (two coordinators)**
Critique work (reviews, fact-checks, sweeps, playtests) and design work (D1–D4 specs, builds) talk only through two coordinator roles and this bible:
- **Coordinator A (science and critique liaison).** Condenses new critique into binding constraints (D0 §3, §6 here), fact-checks every claim before a unit's text freezes, sits on the sensitive-content panel, and moves findings from builds and playtests back into §6 and CRITIQUE.
- **Coordinator B (design integrator).** Reconciles design documents into D5. Records each ruling in D5 §2 and in §13 here, and checks every spec against D5 §3 and the critique's chapter verdicts (§4.2).

Designer agents read §3, §5–7 and the relevant critique rows before writing a spec; critic agents read the spec and D5 before reviewing it. Disagreements go to the coordinators, never silently into code.

**Updating this bible**
- Update it in the same commit as the work it describes: tick §6 and §10 boxes, change §4 verdicts or status, add a §13 entry (date, change, who decided), add new questions to §14.
- Keep it under about 6,000 words: replace stale text rather than appending, and link to `docs/` for detail.
- Never record a designer decision the designer has not made; mark it "pending".
