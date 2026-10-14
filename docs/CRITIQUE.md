# Endless Forms: master critique and improvement plan

*For Krish, from the supervising editor. This is the one document to read first. It condenses eight expert reviews (R1–R8, with R5 in two parts) and four R7 fact-checks, seven science-sweep logs (G1–G7 and their reviews) and six design documents (D0–D5) into one verdict and one plan. Where a review and its R7 fact-check disagree, the fact-check wins. Where design documents disagree, D5 (the binding design record) wins. Section 10 lists every detailed report and ends with a glossary of the labels used here (sweeps, template rules, tiers, waves, P0–P2). Appendix A holds the full corrections table; Appendix B the build constraints. Written 14 October 2026.*

---

## 1. Executive summary

### The verdict

Your judgement is right, and the reviews say exactly where it holds. Most of the 48 Endless Forms chapters are worksheets with a game skin. The player reads 110–140 words, moves a slider or picks one of three buttons, and reads a number. The population rarely responds to anything the player does. Half the chapters show a small icon on an empty field, with the concept carried by 8–11 px captions. Equilibrium is the best teacher of the three games and the least like a game (about 80% panels and multiple-choice questions). Tangled Bank has the best art and engine but its Steward mode is "flip a toggle, then wait".

The science underneath is mostly sound. R7 confirmed 71 of 103 claims in the first review outright, and every number in the second review reproduced from the game's own code. But the fact-checks list about 90 errors the reviewers themselves missed, on top of those the reviewers found. Most are wording; a few are serious: fiddler crabs fighting over shells, the Census end card saying Hardy–Weinberg means "nothing interesting is happening", Alarm Call charging the costs of the hawk whistle and the coyote trill the wrong way round, a Clock that paired species with random dates, a Switches target that teaches wrong developmental biology, and Equilibrium's backwards migration explanation. Seven science sweeps have since made about 300 logged corrections. **They are in the source files only: the shipped single-file games (`Endless_Forms_v1.html`, `Equilibrium_HW_v2.html`, both dated 11 October) still contain the old errors, and Tangled Bank has had no sweep at all.**

Measured against a full undergraduate course of 101 concepts, R8 rates the three games as covering 15 well, 37 thinly and 24 with problems, and missing 25, including mutation–selection balance, sex linkage, fossils, deep time, mass extinction and human evolution; F_ST appears nowhere either. R7 corrects one rating: effective population size is thin, not missing (one Notes line on the harmonic mean in the Casino's bottleneck jar). §6 maps every gap to the unit and phase that fills it.

Your favourites are the exception. All nine share four things today: a direct physical verb, a cost you feel in time or risk, cause and effect you see at once, and skill under pressure. Four of them (the Lichen Wood and Black Country, Bitter Wings, Left Jaw/Right Jaw and the Clinic) also follow one deeper rule: **you pursue a predator's (or doctor's) own goal, and evolution happens to the population as a by-product you see the next morning.** That rule is now the template for everything. The other five lack it today: Hawks' population ignores your choices, the Raffle, Alarm Call and the Forager optimise one animal with no evolving population, and Switches has no population at all. The redesign adds it to them through the invasion view or a population level (§5).

### Seven root causes

| # | Root cause | Produces | Evidence |
|---|---|---|---|
| RC1 | **The player calculates; the population does not respond.** Optimisation worksheets with corner solutions. | Boring | "Set a slider, earn % of best" appears 13 times. Fisher's Brood is solved by 10, 10, 10, 0, 0, 0 sons in 198 of 200 runs. Holding Two Sizes at "tiny" scores 49% (three stars need 40%). Hawks' `evolve()` ignores the player's choice. Notes print the optimum in at least 12 chapters. |
| RC2 | **The player is the evolving organism**, dialling its own heritable trait. | Incorrect (rehearses need-driven evolution, misconception 1) | Two Sizes, The Meadow, Lock and Key L2, The Pathogen, Archipelago L1, Live Fast L1–2. |
| RC3 | **Text and quizzes come before play, or replace it.** | Boring, clunky | Intros of 109 (median, I–VI) to 143 words (mean, VII–XI); up to three text cards before the first action; twelve levels are quizzes; Equilibrium's Case Files state their own answers. |
| RC4 | **The concept is in the caption, not the picture.** | Not visual | Actors 20–30 px on a 390 px canvas; 31 of 43 sized canvas labels in ch20–29 are 10–11 px; Islands' sea stays empty; no Food Web web; most chapters in ch18–29 (all but Doubling and the Guest) return no Notes graph (`charts: []`); no particle system. |
| RC5 | **No escalation, no stakes, a dominant strategy.** | Boring | Mendel: a fixed recipe (test-cross with W, plus purple × purple crosses that throw white) always wins; test-crossing everything with W is a guaranteed two stars. Clinic: one optimal course. Jaws: 60 identical taps. Equilibrium L13 scores `const ok = true`. |
| RC6 | **Model, text and evidence disagree**; contested ideas scored as settled; unrealistic numbers unlabelled. | Incorrect | Why Sex? charged no real twofold cost; Lock and Key drove hosts to 10⁻⁷; "hit hard early", Ewald's hypothesis and the intermediate disturbance hypothesis rewarded as rules. |
| RC7 | **Three games, no spine.** Three engines, three looks, duplicated topics, no order. | Clunky | Hardy–Weinberg, drift, founders, the Commons, life history and sexual selection each taught twice in different notation; 48 menu rows and "Start anywhere"; Coalescent before Drift Casino; tree reading at chapter 45; a 560 px column on desktop. |

### The ten highest-impact changes

1. **Make the player the selective agent in every unit**, or a behaving animal whose rule then competes as an allele in a visible population. Never the organism setting its own trait. Score in the agent's currency (chicks fed, patients cured), never "% of best" (D5 decisions 6–7).
2. **Fix the favourites before adding anything.** The Lichen Wood pilots the template as a 15-minute Act 0 hook, then the Black Country, then the other seven (D5 decision 4).
3. **No text before play.** "Begin" drops you into the live Wood with a ghost hand within 3 s and at most 40 words. Every level-2 quiz is cut. Predictions become gestures on a live graph, scored by distance (D5 decisions 9, 15, 18).
4. **One live graph that never pauses** replaces the Notes sheet. The picture changes before any number appears; optima appear only in the debrief (D5 decision 10).
5. **One product on one world.** *Endless Forms* on a Tangled Bank field station: twelve acts plus a sandbox capstone, a 22-unit spine (about 6 hours), Equilibrium absorbed as Act 3, every duplicate merged (D2).
6. **One look, readable at phone size.** "Field Plate": painted grounds by place, flat actors at least 7% of the stage, canvas text at least 12 px, fixed colour-blind-safe data inks with no red/green, a desktop layout that uses the width (D4).
7. **Juice that carries meaning.** Three timed feedback tiers, particles tied to concepts, every sound mirrored visually, a Calm mode (D4 §5).
8. **A science-honesty system.** A MODEL card per level tagging every parameter realistic, designed or ×N; a Contested badge with no star for picking a side; oracle tests and a bot sweep in CI; a fact-check sign-off before text freezes. And ship the sweeps: rebuild the HTML files now.
9. **Fill the curriculum gaps with eight P0 games** (The Scribe rebuilt around mutation's fitness effects, Royal Line, Leaky Tap, Malaria Coast, Gene Swamping, The Dig, Extinction Roulette, Out of Africa), plus effective population size in the Drift Casino (D3).
10. **Build the teacher layer from the start:** level select, projector mode, shared seeds and result codes, CSV export, instructor notes, concept codes, a save system that survives LMS iframes; LTI and SCORM later (D2 §12).

**Where things stand.** Reviews, fact-checks, sweeps and design are done. No v2 code exists yet (`source/v2/` is empty), no student has played anything, and the design documents now run to about 94,000 words. The biggest risk is now paper: build the Wood, put it in front of five students and you, and let that test decide how much of the rest is right. Session 3 cannot start until you make the first three decisions below.

### Decisions needed from you (D5 §7)

- **Before Session 3:** (1) accept one product called *Endless Forms* on a Tangled Bank field station, with Equilibrium as Act 3; (2) accept the cuts (Food Web, Islands and After the Fire to the appendix; every level-2 quiz); (3) approve the platform plan: plain JavaScript through Wave C, with TypeScript and PixiJS decided by the one-week spike (§8 says what each outcome changes).
- **Before the slice gate:** (4) recruit 10–12 new undergraduates and five-student boring testers, and check whether ethics approval is needed; (5) judge the ghost jays (§5) and the favourites' changes by playing the pilot.
- **Before Wave A:** (6) nominate the two humans on the sensitive-content panel, a population geneticist and a scholar of race and science (§6); (7) choose a licence and hosting for the published app.

---

## 2. What already works (protect it)

### Why the favourites work

All nine share four things today (D0 §2, D1 §0):
- **The manipulation is direct.** Tap the moth, guard the flank, toggle the Hox cell, dose the patient.
- **The cost is felt, not computed.** A bitter mouthful costs 3 s; a 12 s morning runs out; the hawk closes in within 1.8–3 s; grubs thin out on the bush; the dish turns turbid.
- **Cause and effect show at once.** The moth vanishes, the duel resolves, the fly hatches with legs where you put them.
- **Skill under pressure.** Search, reflex, timing or reading kin against a clock.

Four of the nine (the Wood and Black Country, Bitter Wings, Jaws and the Clinic) also have the loop the redesign makes universal:
- **You cause the selection.** You are the bird, the doctor, the prey's flank guard. Nobody tells you what evolves; your own behaviour does it.
- **The population visibly answers**, by the next morning or the next round. In the other five it does not: Hawks' population follows a script whatever you choose, the Raffle, Alarm Call and the Forager have no evolving population, and Switches has none at all. That is why D1 gives these five an invasion view or a population level.
- **Evolution makes your job harder.** Better-hidden moths mean harder breakfasts. That arms race is what makes the favourites games.

| Favourite | Why it works | Visual quality (R5a score of 10, or R5b rank) |
|---|---|---|
| The Lichen Wood | Search-and-tap is a real skill; S, R and heritability come from your own hunting | 8.5 |
| The Black Country | Same verb; the soot crossfade is the payoff | 8.5 |
| Bitter Wings | The felt 3 s cost makes your hesitation the selective force; colour-blind-safe by luminance | 9.0 (best) |
| Left Jaw, Right Jaw | Adaptation emerges from a reflex | 6.5 |
| Hawks and Doves | Correct payoffs, V/C, Bourgeois, assessment, war of attrition | 5.0 |
| The Raffle | One clear rule and a budget that creates tension across females | 4.5 |
| Alarm Call | Time pressure plus reading kin | 5.5 |
| The Forager | You feel diminishing returns and leave under a clock; fear of the hawk | 13th of 24 |
| The Clinic | Clear doses, a real trade-off, failure you can read | 6th of 24 |
| Switches | A construction toy with instant, visible causation | 10th of 24 |

Lichen, Black Country and Bitter Wings are both loved and the best-looking. Jaws, Alarm, Hawks and the Raffle are conceptually loved but visually under-built: the best candidates for an art pass, because the idea is already right.

### Assets to build on

- **Engines.** `Hunt` (config-driven, behind the three best chapters) and `Gen` (seeded diploid engine) become the only genetics engines. Seeded `R()` makes runs replayable; `vclock.js` and `monkey.js` already let tests play every chapter.
- **Equilibrium's visual inventions:** the beetle wearing one allele on each wing case, the phenotype/genotype lens, alleles flying into jars ("the best animation in the game"), the p² area square, the 2pq tile collapse, the de Finetti triangle as a map, one-idea panels of 35–60 words.
- **Tangled Bank:** procedural bark and leaf litter, the live Price bars ("the single best piece of conceptual visualisation", R4), the Slow Island's evolved senescence, Steward mode as a sandbox.
- **Charts that carry the concept:** Census dots against a dashed Hardy–Weinberg ghost, the Two Sizes bimodal sea, the Why Sex? ratchet histogram, the Sieve dot-histogram, the Spindle L2 diagram.
- **Real verbs hidden in weak chapters:** Mendel's likelihood inference, Census sampling cost and power, Spindle L1's binomial detective, Doubling L1's cytotype exclusion, Guest L1's sanctions puzzle, Sweep L1's search, Commons L1's Simpson's paradox, the Casino's predict-before-bet.
- **Learning content and identity:** the 48 one-line TAKE principles, the "principle / in this model / in nature" structure, the field-notebook shell and title tree.

---

## 3. Root-cause critique

### 3.1 Game design and fun

**The worksheet pattern.** In 13 chapters the core verb is "set a slider, press Run, earn a percentage of the best possible" (Brood, Two Sizes, Raffle, Lek, Meadow, Nest, Live Fast, Crowd, Lock, Pathogen, Archipelago, Fire, Guest). That is a mechanic duplicated, not a concept, and R8 calls it the main source of "boring".

**Corner solutions and dominant strategies.** Good decisions are continuous, uncertain and depend on what happened last time. Many of the current ones collapse:
- Brood acts 1–2: 10, 10, 10, 0, 0, 0 sons wins in 198 of 200 seeded runs, because the payoff is linear in sons.
- Two Sizes: "tiny" for all 12 spawnings gives 49% of the sea in 20 of 20 runs.
- Live Fast: the dynamic-programming optimum for foxes is 100% effort at every age.
- The Nest: eggs are free, so a bigger clutch never lowers the score.
- The Meadow L2: the best spur is always mean tongue plus about 4.5 cm.
- The Clinic: every minimum-toxicity cure is high, high, then two low doses.
- The Raffle: an even split already scores 90%.
- The Forager conveyor: a simple "biggest on the belt" policy beats the scored "best" in 38–60% of rounds; a `Math.min(1, eff)` cap hides it.
- Equilibrium L8 and L15 use each answer label once, so the last answer is free; L12 passes at any population size.

**The population ignores the player.** Hawks' `evolve()`, Lock and Key L1 and the Brood and Crowd populations follow scripts whatever you do. Evolution is narrated, not caused.

**No escalation, no boss.** In sections VIII–XI most chapters share one shape: a parameter puzzle, then a multiple-choice quiz. Across the game twelve levels are quizzes (in Archipelago, Food Web, Islands, Fire, Two Fruits, Guest, Copy, Switches, Landscape, Coalescent, Shape-shifters, Live Fast). Jaws' 60 taps speed up but never change.

**The fix (D1's template rules, binding).** This document calls them T1–T12; D1 numbers them G1–G12, but here G1–G8 always means a science sweep. Every unit names three loops: a per-second verb with feedback within 200 ms, a minute that ends in a visible population change, and a level that adds exactly one variable. Every unit ends in a boss that inverts its own lesson. A five-bot sweep (always-A, always-B, random, greedy, fixed threshold) runs in CI; no bot may earn three stars. A unit that cannot name a per-second verb, or that five students flag as boring twice, becomes Tangled Bank scenario cards instead of a game (the demotion rule).

### 3.2 Learning design

**The misconception risk is a design choice.** The six "set your own trait" chapters rehearse the need-driven reasoning that research finds hardest to shift (Bishop & Anderson 1990). The hunt chapters do the opposite, and they are your favourites. Behaviour chapters (Forager, Hawks, Alarm, Raffle) may legitimately cast you as the animal, but each needs a second act in which your rule becomes an allele competing in a visible population: the "invasion view". Without it, they teach that animals compute optima.

**Prediction and recall sit outside play.** The `ch99.js` learning layer has excellent one-line principles, but its "Predict first" (TRANSFER) and "Remember?" (RECALL) are cards shown before play. RECALL fires on every third opening, chosen at random, with no record of errors and no spacing. Items are three-option choices with weak distractors. The fix: predictions as gestures inside the simulation (drag the histogram ghost, tap the triangle), and recall as a spaced, concept-coded review deck with distractors from the CINS and ACORNS misconception inventories (D2 §8).

**Stars reward clicks and the prey's goal.** Equilibrium gives stars for quiz answers. Lichen Wood ("camouflage reaches 75%") and Bitter Wings ("resemblance reaches 70%") pay for the prey's goal, which no bird wants. New stars: Discover (cause the phenomenon), Predict (gestures near the *expected* outcome, never the realised run), Transfer (the boss or a new context). No star for a click, for a side on contested science, or lost to accessibility settings (D5 decision 8).

**Expected and realised are mixed without labels.** Equilibrium uses exact `hwCounts` in some levels and sampling in others. Every chart should show the expectation as a dashed ghost and the realised run as a solid line.

**Threshold concepts and missing confrontations** (R8 §3): overproduction is invisible because hunts hold N constant; nothing follows one individual, so "individuals transform" is never challenged; acquired-trait inheritance is never confronted; tree reading comes 45th. D1's Act 0 adds overproduction with a winter cull and a pinned moth whose colour never changes while its population does; D3's Breeder adds a "gym" level where trained parents' offspring reset.

### 3.3 Scientific accuracy

The models are mostly right. The errors cluster in four places: text that overclaims its citation, models that contradict their own text, unlabelled exaggerated parameters, and contested ideas scored as settled.

**Corrections.** Appendix A lists 68 verified corrections, each confirmed by an R7 fact-check or by a sweep's own simulation or literature check. In short: 36 are fully fixed in source (fiddler crabs, the Census end card, Alarm Call's call costs, the Clock's dates, Equilibrium's migration text). 25 Endless Forms and Equilibrium items are still open, mostly where the text is fixed but the model or mechanic needs a redesign (Why Sex?'s twofold cost, Bitter Wings' fixed ratio, Jaws' fully heritable trait, Hawks' scripted population, the Lek and Meadow subtitles). Seven sit in Tangled Bank, which no sweep has touched. **None of the fixes reaches players until `Endless_Forms_v1.html` and `Equilibrium_HW_v2.html` are rebuilt from source.**

**Two more outstanding items.** About 22 chapters still have no MODEL caveat (G6 lists them). And no science sweep exists for Tangled Bank; D5 requires one (G8) before the Commons or Slow Island is built.

**Reviewers sometimes called things "missing" that the game already has.** R7 found about 15 such stale claims in R1 alone. Do not re-add: Mendel L2 (two genes, linkage, χ²), Haldane's mapping function, the one-migrant rule, the neutral fixation rule, *Potamopyrgus*, the neural-crest hypothesis, sign epistasis and Weinreich 2006, Hawks L4–L5, the Sieve's moving-optimum missions, the Mexican origin of the *Rhagoletis* inversions, the ring-species caveat, the Yellowstone debate and myxoma as the Pathogen's anchor.

**Rules for all new content** (D0 §3, binding): contested ideas ("hit hard", the virulence trade-off, Ewald, the intermediate disturbance hypothesis, the Yellowstone cascade, the domestication syndrome, Kondrashov, smaller ejaculates at high competition, the energy-budget rule) carry a Contested badge and no star for a side. Every unrealistic parameter shows "×N" on screen. Designed data and real data are labelled. Variants are selected and populations evolve; individuals never "evolve", "choose" or "need".

### 3.4 Visuals and feel

**Quality swings from painted to wireframe.** Bitter Wings scores 9.0, the Lichen Wood and Black Country 8.5; the Fancier scores 3.0 (24 near-identical grey pigeons whose crests differ by 2–3 px), the Landscape 3.5 (circles with 8 px numbers, no height), the Scribe 3.5. Moving from chapter 13 to 14 feels like changing apps (R5a). In sections VII–XI the concept usually lives in the paragraph: the Islands sea stays empty after "Let species arrive"; the Archipelago finch has the same beak at 5.2 and 14.8 mm; After the Fire has no flame; the Food Web draws no web; Switches draws the target fly identical to a wrong result (R5b).

**Actors are too small.** Bats 25 px, squirrels about 30, sperm 12, pollinators 8, Brood dots 4, Commons dots 3, on a 390 px canvas. Backdrops fill 100% of the canvas and actors 5%.

**Text is too small and too dense.** Canvas micro-type of 8–11 px, often at 60% alpha. End-card charts sit below the fold.

**Colour carries meaning that about 1 in 12 men of European ancestry confuse** (red/green colour-vision deficiency; fewer in many other populations). Red/green or orange/green distinguishes the key categories in Crossing Over L3, Many L2, the Commons cells and Price bars, the Raffle and Fancier charts, the Clinic, Lock and Key, Equilibrium L12 and every pass/fail bar. Alarm Call's relatedness is a 2 px ring on a 30 px squirrel.

**Feedback is sound and text.** About 300 `Snd.*` calls and no particle system. In a classroom with sound off, a correct answer is a toast and a number. Nothing fledges or dies on screen.

**Three looks.** Endless Forms has 39 per-chapter canvas themes; Equilibrium has its own palette and system fonts; Tangled Bank is the same shell at a higher art level. No organism recurs.

**The fix (D4, binding through D5).** One look, "Field Plate": a ground painted per place (16 places, a Lab plate, an Expeditions map), flat outlined actors at least 7% of the stage (heroes 12%), fixed data inks with a second channel (letter, shape, pattern), organisms in natural paint, humans as one-ink pictograms never shown dying. Juice in three timed tiers (120–200 ms per action, 400–800 ms per generation, 0.8–1.5 s per level), shake only for costs the player pays.

### 3.5 UX, onboarding and clunkiness

- **No way in.** Title, then 48 text rows ("Start anywhere"), then a 109–143-word card with no art, then play. Mendel's first action is buried in sentence four.
- **Three text walls.** A TRANSFER or RECALL question card, its answer card, then the intro card can all precede the first tap.
- **End cards of 200–260 words**, with the primary button clipped off the bottom of a phone screen.
- **Notes pauses play, covers 72% of the screen, and its Graphs tab is often empty.** Most chapters in ch18–29 (all but Doubling and the Guest) return `charts: []`; in the ten I–VI chapters R5a opened, the tab still read "Graphs appear once there is some history" (Mendel's fills only after the first cross).
- **Toasts stack** (up to three, not de-duplicated) over the board and over end cards ("Label all three trees first" three times over the Coalescent title).
- **Both choice buttons grey out together** in Hawks, Alarm and the Lek, so the screen looks broken. Locked stars are about 1.7:1 contrast.
- **Desktop is a 560 px phone column**, leaving 56% of a 1280 px screen empty and cutting the title tree; Tangled Bank's Steward chart starts below the fold.
- **No level select, no replay of one level, no keyboard path** (zero keyboard handlers; about 30 `aria-` labels in the shipped file, mostly on sliders and ± steppers), no untimed mode for reflex chapters.
- **Fonts load from Google**, so "no internet" is false offline and each load sends the student's IP address to Google.
- **The loop runs on `setTimeout`**, not `requestAnimationFrame`.

**The fix (D2 §9, D4 §6–8).** "Begin" drops straight into the live Wood, and each later unit adds at most one new verb. One 8-word whisper replaces toasts. End cards carry a TAKE line of at most 20 words, a 60-word body and one chart, with "Why?" holding the rest. The live graph sits beside the canvas on desktop. WCAG 2.2 AA per unit: keyboard map, tap alternative to every drag, untimed mode, narration, a data-table twin for every chart.

### 3.6 Structure and curriculum coverage

**Coverage** (R8, 101 concepts in 15 strands): 15 well, 37 thinly, 24 with problems, 25 missing (R7 moves effective population size from missing to thin). Phylogeny, macroevolution and human evolution contain 9 of the 25 gaps and no concept covered well. Section XI, "Deep Time and Ecology", contains no deep time; the Food Web and After the Fire contain no evolutionary process. A student who finished every chapter could not answer standard exam questions on F_ST, mutation–selection balance, fossils, mass extinction, comparative methods or human origins, and would have met Ne only as one Notes line on the harmonic mean in the Casino's bottleneck jar. §6 maps each gap to a unit and a phase.

**Duplicates.** Hardy–Weinberg (Equilibrium and the Census), drift and founders (Casino, Eq L12, Eq L13, Castaways L1), selection against a recessive (Black Country, Eq L9), inbreeding in four places with F never named consistently, the three hunt chapters ported twice, the Commons and life history in both Endless Forms and Tangled Bank (Tangled Bank's models are better), sexual selection in the Lek and Aripo.

**Sequencing bugs.** The Coalescent (chapter 5) precedes the Drift Casino (6) though its bridge assumes drift; Why Sex? sits before selection; the Census diagnoses heterozygote advantage before the Selection section; tree reading is chapter 45.

**The fix (D2).** Twelve acts plus a sandbox, laid out as a hub on one station map: 0 The Wood; 1 Ancestry and evidence; 2 Heredity; 3 Equilibrium (the gene pool); 4 Forces; 5 Adaptation and coevolution; 6 Behaviour and life history; 7 Sex; 8 Cooperation and conflict; 9 Genomes and development; 10 Species and macroevolution; 11 Applied and human; then the Tangled Bank sandbox. Act 0 comes first; Acts 1 and 2 open together; later acts open when their prerequisites are met. A 22-unit spine (about 6 hours) passes through every act and every favourite; the full core is 63 units (about 16 hours) before the boring test trims it. Anchor organisms recur per act (moth, beetle, hermit crab and cichlid, great tit, guppy, ground squirrel, finch). Courses take named routes (first-year, population genetics, behavioural ecology, Equilibrium, macroevolution and humans).

### 3.7 What makes it one game

Sixty-three good lessons are not yet one game. D2 joins them in six ways:
- **One map with residents** (D2 §2). Each of the twelve places keeps a resident population with its generation count. The moths you shape in Act 0 are the moths the soot reaches in Act 4, and the moths in the sandbox.
- **Collections that record understanding** (D2 §6): a bestiary page per species, filled with your own data beside the Archive's real data; a specimen drawer of pinned individuals that never changed while their populations did; Laws of the Bank cards, earned only by a Transfer star.
- **Tools that accumulate** (D2 §6–7). Each unit unlocks one lever in the Tangled Bank sandbox (predator, soot, volcano, ferries, mutagen tap, drugs), which grows into the capstone. Scenario cards (Challenge, Experiment, Lecture demo, Assessment) reuse it.
- **Act-level tests.** From Act 2, each act ends in a field problem that uses only that act's tools (D2 §6).
- **An expert mode.** Field mode tags every speed-up; Realistic mode removes them, as the expert challenge and the lesson in scale (D2 §11).
- **A light story.** The previous keeper's margin question for each act, shown on the map, never as a card (D2 §2).

Refused on purpose: coins, energy, daily rewards, loot and speed leaderboards. The player collects knowledge and populations, nothing else; the only class board is optional and ranks prediction calibration (D2 §6).

---

## 4. Chapter-by-chapter verdicts

Verdicts follow D2's triage. KEEP means keep and polish. DEMOTE means the unit leaves the core path for an optional appendix. "★" marks the 22-unit spine. Acts are D2's.

### Endless Forms

| # | Chapter | Current core verb | Biggest problem | Verdict | One-line redesign (act) |
|---|---|---|---|---|---|
| 1 | Mendel's Garden | Tap two plants to cross; label pure or carrier | A fixed recipe (test-cross with W, plus purple × purple crosses that throw white) always wins; test-crossing all six with W is a guaranteed two stars; inert plants | KEEP | Sow, watch seeds pop, stop and call with Brier-scored confidence; each cross costs a season (2★) |
| 2 | The Scribe | Timed typing of complementary bases | Mutation framed as an error to avoid; no fitness effects | REBUILD | Tag mutation sparks to build a distribution of fitness effects; Luria–Delbrück plates; replica plating (2★) |
| 3 | Crossing Over | Place crossovers; order genes; pick a recombinant | The player places crossovers; L2 is a paper exercise | REBUILD | Introgression breeder: crossovers fall at random, you probe seedlings with markers (2) |
| 4 | The Census | Sample 20 snails; judge the heterozygote count | Buttons and a stats line; duplicates Equilibrium | MERGE (host) | Investigator buys instruments with field days; randomised hidden causes; Wahlund boss (3★) |
| 5 | The Coalescent | Slider guess, then watch; label tree shapes | Guess-then-watch; placed before drift | REBUILD, move | Drag a lineage back through a Wright–Fisher grid; mutations on branches; decoys (9★) |
| 6 | Drift Casino | Bet chips on jar runs | Nothing happens between bets | MERGE (host) | Chips as a calibrated distribution against an adapting croupier; Buri's bottles for Ne; 12-allele volcano boss (4★) |
| 7 | The Castaways | Pick a storm size; "bring a migrant" | One tap, then waiting | MERGE (split) | L1 into the Casino's founder level; L2 Isle Royale into Genetic Rescue (11) |
| 8 | Why Sex? | Toggle the whole pond sexual or asexual | Group choice; no real twofold cost | REBUILD, move | Play a parasite infecting matching snails; a clone invades a sexual pond (7★) |
| 9 | The Lichen Wood | Tap moths in a 12 s morning | Apostatic selection cited, not modelled; fixed N hides overproduction | KEEP | Act 0 hook: overproduction and winter cull, pinned moth, heritability by level, three morphs (0★) |
| 10 | The Black Country | Same hunt as soot arrives | Dominance only in words; no lag in the decline | KEEP | Inherits your Act 0 moths; one tagged carbonaria origin; gene-pool lens; lagging decline; evidence level (4★) |
| 11 | The Fancier | Tap 6 of 24 birds to breed | No tension; identical pigeons (visual 3.0) | REBUILD → The Breeder | Drag breeders from a parade; plateau, rising F, pleiotropic costs, the "gym" level (2) |
| 12 | The Sieve | Draw a survival curve | You draw the answer | REBUILD → Seed Rain | Sow seed mixes and call weather; fitness emerges; cave-fish trait loss; G-matrix levels (5) |
| 13 | Bitter Wings | Hunt mimics; bitter mouthful costs 3 s | Fixed model:mimic ratio | KEEP | Taste ledger; models crash and recover; Müllerian advergence; aggregation boss (5★) |
| 14 | The Landscape | Tap a fitter neighbour; epistasis quiz | Foresight evolution lacks; wireframe | REBUILD → Twelve Flasks | Transfer, freeze and thaw twelve lines on a hidden rugged landscape; three N regimes (5) |
| 15 | Left Jaw, Right Jaw | Tap left or right to guard | 60 identical taps; fully heritable trait | KEEP | Several fish and two guards; heritability 0.9 then 0.25; lizard rock–paper–scissors boss (5★) |
| 16 | Hawks and Doves | Pick Hawk or Dove | Choices never move the population | KEEP | Your rule seeds a lineage among 150 hermit crabs; invasion meter; mixed ESS vs polymorphism (5★) |
| 17 | Blood Debts | Share or refuse | Fixed opponents; no bonds or kin | REBUILD | Share, groom, refuse in a roost with kin and bonds; write-your-rule tournament (8) |
| 18 | Fisher's Brood | Set sons with ±, press Lay | Linear payoff, scripted population, no wasp | REBUILD → The Fig | Foundress lays and fertilises or not (haplodiploidy); local mate competition (7) |
| 19 | Two Sizes | Size slider, Spawn ×12 | Holding "tiny" wins | REBUILD | Experimenter releases mutant gametes into the sea (7) |
| 20 | The Lek | Next or Choose; hold to strut | No runaway despite the subtitle | MERGE with TB Aripo → The Strutting Ground | Walk the hen, hold to strut, hunt males; sex ratio to runaway, handicap and lek paradox (7) |
| 21 | The Raffle | Type sperm splits across six females | No later rivals; hidden rivals scored against an omniscient plan; palest screen | KEEP | The Drum: hold to pour against one budget; later-male risk; dung-fly precedence; cryptic-choice boss (7★) |
| 22 | The Selfish Spindle | Breed and name; Reorient; pick a target | L2 is luck; L3 one obvious choice | KEEP L1, REBUILD L2–3 | Keep the binomial detective; a centromere arms race; drive releases on a map (7) |
| 23 | The Meadow | Cycle flower traits; spur slider | You design flowers (misconception 1) | REBUILD | Play the pollinator; S-alleles; subtitle changes only when pollinators evolve too (7) |
| 24 | Alarm Call | Read collars; Call or Silent in 1.8–3 s | Nobody dies; collars give every sister r = ½ | KEEP | Untimed pedigree tagging; your tags drive 2 s attacks; hidden negative whistle cost; Seychelles warbler boss (8★) |
| 25 | The Nest | Choose clutch; tap chicks; Quiet, Call or Scream | Eggs free; passive parent | REBUILD | Costly eggs; begging against an evolving parent rule; cuckoo boss (8) |
| 26 | The Commons | Two toggles; group size ± | L2 weak altruism taught as altruism | MERGE with TB Commons | Keep L1 (Simpson's paradox); TB haystack model and live Price bars; self-benefit dial (8★) |
| 27 | Many Become One | Time the transfer; whack cheaters | Whack-a-mole at 6% cheaters per division | REBUILD | Transfer and split propagules; play the single-cell bottleneck (8) |
| 28 | Live Fast | Effort slider; egg size; r or K | Corner optima; imposed ageing | MERGE into TB Slow Island | Fox catching by age; senescence evolves (6) |
| 29 | The Forager | Tap grubs; conveyor; leave bushes | Look-ahead beats the scored optimum; five unconnected birds | KEEP | One great tit's day: sequential prey, orchard tangent from your data, hawk, invasion, winter night (6★) |
| 30 | The Crowd | Left or Right feeder; cascade puzzles | Crowd scripted to the ideal free distribution | REBUILD | Swim one fish among 24 following a local rule; the distribution and undermatching emerge (6) |
| 31 | Shape-shifters | Helmet or No; multiple choice | Worksheet then quiz | REBUILD → The Pond | Hunt water fleas as a phantom midge larva (*Chaoborus*) whose kairomone induces helmets; defended fleas slip from your grip; reaction norms compete; a specialist lineage crashes (6) |
| 32 | Lock and Key | Pick which key to target; resistance slider | You forecast, then set the snake's own trait | REBUILD | Play the parasite larva (L1), then a garter snake whose strikes select on newt toxicity; toxic newts paralyse you for 3 s (5) |
| 33 | The Clinic | Pick a daily dose | One optimal sequence; no pharmacokinetics, plasmids or ward | KEEP | Live dosing against the mutant selection window; adherence; standing resistance; plasmid bay (11★, opens after Act 4) |
| 34 | The Pathogen | Replication-rate slider | You set virulence | REBUILD | Vet vaccinates rabbits; strains compete across the warren; leaky-vaccine level (11) |
| 35 | The Guest | Ration oxygen to nodules; quiz | L2 is a quiz | KEEP L1, REBUILD L2 | Keep sanctions; release a strain under vertical or horizontal transmission (8) |
| 36 | Switches | Toggle a Hox grid, Hatch; Pitx1 pick | No A1 column, so target 4 teaches wrong biology | KEEP | A1 column, two-level Ubx, colinearity fan, crustacean boundaries, Pitx1 circuit, stickleback boss (9★) |
| 37 | Copy and Paste | Crosses plus questions; accept or reject mutations | Two quizzes | REBUILD | Genome as city: place maternal piRNA silencers; bet on duplicate fates (9) |
| 38 | The Sweep | Sequence 7 of 40 windows; label panels | L2 labelling quiz | KEEP L1, REBUILD L2 | Decoy genome scans with a false-positive cost (9) |
| 39 | The Clock | Date slider and correction toggle | Arithmetic with a slider | REBUILD (merged with Silent Letters) | Place calibrations; dN/dS; fast-rodent trap; small-Ne boss (9) |
| 40 | The River | Wait, test or let the banks meet | Little to see; call divergence scripted | REBUILD | Hold the ford; incompatibilities flash in hybrids; reinforcement from heritable preference (10★) |
| 41 | Two Fruits | Six predictions, then a run | Entirely a quiz | REBUILD | Grower picks infested fruit; fly swarm on two trees; draggable inversion (10) |
| 42 | The Ring | Test-cross search; sort song cards | Static, clean ring | REBUILD | Walk a salamander round the valley; a hidden internal break (10) |
| 43 | Doubling | Plant tetraploids; pair chromosomes | L2 implies somatic doubling | KEEP L1, REBUILD L2 | Keep cytotype exclusion; meiosis with unreduced gametes (10) |
| 44 | The Archipelago | Beak slider; quiz | Radiation without radiating; you set the beak | REBUILD | Drag storms across islands; beaks evolve; the "Big Bird" hybrid lineage; cichlid boss (10★) |
| 45 | Tree Thinking | Questions on a tree; parsimony | A quiz at chapter 45 | REBUILD, move | Spin nodes, count to common ancestors, convergence traps, first in Act 1 (1★) |
| 46 | The Food Web | Three removal experiments; quiz | No evolutionary process; invented data | DEMOTE | Ecology appendix |
| 47 | Islands | Area and distance sliders; quiz | Ecology, not evolution; empty sea | DEMOTE | Appendix; its reserve-design idea moves to Genetic Rescue |
| 48 | After the Fire | Fire-interval slider; predictions | Rewards the intermediate disturbance hypothesis by construction | DEMOTE (gated) | Ships only when rescored on humped, flat and monotonic landscapes |

D3 now names a per-second verb for each of D2's eight doubtful units (The Crowd, The Pond, Two Fruits, The Ring, Copy and Paste, Genetic Rescue, Guest L2 and Doubling L2); they still face the five-student boring test, and two boring flags send a unit to scenario cards.

### Equilibrium (17 levels and Case Files)

| Levels | Current core verb | Biggest problem | Verdict | One-line redesign |
|---|---|---|---|---|
| L1–L3 Two copies; Break into alleles; Dominant isn't common | Classify beetles; guess a count; watch jars; one MCQ | Mostly reading; "can't tell" is right 6 times in 8 | MERGE → The Mixer | Lens-tag 300 roaming beetles; Yule's 3:1 bet runs flat at 51% (3★) |
| L4–L6 Gamete pool; Why p²; Why 2pq | Draw buttons; slider to target; tap cells | A clicker and guess-and-check | MERGE → The Mixer | Crank a tumbler; zygotes fill the p × q square; unequal-sex twist |
| L7 One generation | Tap a prediction on the triangle | Rounding moved p (fixed in G7) | KEEP as Mixer boss | Triangle taps, then an X-linked population that misses the one-step landing |
| L8 Equilibrium Island, L15, L17, Case Files | Toggles; mystery islands; one label each; read counts | Answers in the prompts; no felt power | MERGE → The Census | Evidence budget, randomised causes at realistic strengths, confidence scored |
| L9 The bird | Tap static beetles | Static field; flat ground | MERGE → The Black Country | Dominant against recessive runs in the Hunt engine |
| L10 The slow ray | MCQ and two Run buttons | Inert | CUT | Replaced by The Leaky Tap |
| L11 The bridge | MCQ and a migration slider | Nothing opposes migration | CUT | Replaced by Gene Swamping |
| L12–L13 Five tiny islands; Volcano | Size buttons, slider; watch | Any N passes; free point; shows heterozygosity, not allele loss | MERGE → Drift Casino | Buri's bottles; 12-allele bottleneck scored on alleles kept |
| L14 The matchmaker | Pair beetles; three mating buttons | F never named; three models under one label | REBUILD → The Pedigree | F by path counting; a disassortative run that moves p |
| L16 Invisible carriers | MCQs and a slider | Quiz-shaped | KEEP → Invisible Carriers | Genetic counsellor; cousin risk with F; ABO "Blood Bank"; inbreeding boss |

Equilibrium survives as a course route and a downloadable "classic" build until Act 3 ships, not as a separate codebase.

### Tangled Bank

| Unit | Current core verb | Biggest problem | Verdict | One-line redesign |
|---|---|---|---|---|
| Lichen Wood, Black Country, Bitter Wings (hunt) | Hunt | Duplicates of Endless Forms; TB keeps `mu: 0.01` and five other unswept text errors (Appendix A) | MERGE into EF | TB art feeds D1's favourites |
| Streams of Aripo (steward) | One transplant button, two toggles, wait 160 generations | Three decisions in ten minutes; wrong linkage text | MERGE → The Strutting Ground | Choose as a female guppy, then zoom out to the population |
| The Slow Island (steward) | Found a colony, toggle foxes, wait | Mostly watching; misstates Austad | KEEP (host) | Absorbs Live Fast; you are the fox catching by age (6) |
| The Commons (steward) | Rain and founder sliders; time floods | Works: timing floods is a real decision | KEEP model (host) | Price bars become a shared widget; merges with EF Commons (8) |
| Steward mode | Set conditions, watch | Toggle and wait | KEEP → capstone | A map of linked places; one tool unlocked per unit; scenario cards |

**Spec fixes found in this review.** Four design-document lines are wrong and must be corrected before their units are built:
- **The Pond (D3 §6.6)** makes the player a fish, but its own citations (Tollrian 1995; Agrawal, Laforsch & Tollrian 1999) concern helmets and neckteeth induced by, and protecting against, *Chaoborus* larvae, which handle prey and drop defended ones. Fish swallow *Daphnia* whole; their cues mainly shift size at maturity and vertical migration. Make the player a *Chaoborus* larva (the current game already names phantom midges, `ch18.js` line 73). A fish level would need its own system and citation (fish-induced spines in *Daphnia lumholtzi*, or vertical migration).
- **The Leaky Tap (D3 §5.3)**: the Discover star says "the load returned to μ". In L1 the allele is dominant, so the load settles at 2μ; write "returned to the mutation line (μ or 2μ)". D3's boss row is already right.
- **Bitter Wings L4 (D1 §3.2)** calls the sourwings' large-effect locus "a supergene allele". Müllerian advergence between co-mimics runs through unlinked large-effect loci (*optix*, *WntA*, *cortex* in *Heliconius erato* and *melpomene*): Turner's two-step model. Write "a large-effect allele"; keep "supergene" for Tangled Pairs and polymorphic mimicry (*H. numata* P; Joron et al. 2011).
- **Lock and Key (D2 §4, row 32)** still says "the player sets newt toxicity", which breaks D5 decision 6. D3 §6.2, the owning spec, is right: the player is a garter snake whose strikes select on toxicity.

---

## 5. The nine favourites

Each redesign keeps the felt cost and direct verb and adds depth. Full specs, oracles and checked numbers are in D1 §3; the "Looks like" clauses are D4 §5.3's visual payoffs, which matter most for the four favourites §2 calls visually under-built (Jaws, Alarm, Hawks and the Raffle).

- **The Lichen Wood and the Black Country** (D1 §3.1; one moth genome across both). L0 opens with 8 conspicuous moths on a slowed clock that cannot fail; 300 eggs are culled at random to 30, so overproduction is visible; you pin a moth that never changes while its population does. L1 sets heritability at 0.8, with "What if?" reruns (no variation, no inheritance, eat at random); L2 drops it to about 0.3. The L3 boss is a 120-moth, four-trunk wood with three morphs, where your search image keeps rare morphs alive (apostatic selection); three "ghost jays" replay your own fitted rule on the trunks you are not hunting. The Black Country inherits your wood: one tagged carbonaria origin, shown at q = 0.05 as compressed history ("the copy that escaped loss"; one copy in the 120-moth wood would be q ≈ 0.004), a gene-pool lens, a decline that lingers before it plunges, and an evidence level on Kettlewell and Majerus. *Looks like:* a beak shadow and three dust puffs on each peck; 300 egg dots in a tray at dusk, culled to 30 in six batches; a soot haze rising over 4 s; the pinned moth wears a paper halo and a thread to its young (D4 §5.3). *Your call (D5 Q3): are ghost jays honest enough for a flagship level?*
- **Bitter Wings** (§3.2). A taste ledger stands for the bird's memory. Models fall from 8 to 2 and recover to 12, so mimicry collapses and returns. Deadly days make imperfect mimics survivable. A Müllerian level shows the rarer species converging on the commoner via a large-effect allele (Turner's two-step convergence). Boss: a rare warning colour spreads only where eggs are clustered. *Looks like:* a bitter mouthful staggers off alive while the screen shakes and the corners darken; ledger tiles age from solid to hatched to dashed; a dashed avoid-ring around the models cracks when mimics outnumber them.
- **Left Jaw, Right Jaw** (§3.3). Three to five prey fish and at most two guards make attention the scarce resource. Twist becomes a continuous trait at heritability 0.9, then a realistic 0.25. Boss: side-blotched lizards cycle rock–paper–scissors with a period of about 5 seasons. *Looks like:* a crescent guard plate slides onto the flank; a bite that lands bursts six scale flakes and leaves a scar on that flank, and at season end the twist histogram builds itself from the scars.
- **Hawks and Doves** (§3.4). The duel is the camera; 150 hermit crabs are the stage. Your Hawk frequency in each context seeds a haloed lineage that spreads or stalls each tide. Levels separate a polymorphism of pure strategies from a mixed ESS, show hawks taking over while everyone's payoff falls, and end with a war of attrition where only unpredictability is stable. *Looks like:* the duel is a ×3 hero over 150 crabs held in a cached layer; hawks are blue with claws up, doves amber and low; your lineage wears a halo; a luminance wipe marks each tide.
- **The Raffle** (§3.5). The female's sperm store becomes a glass raffle drum. Hold to pour from one budget across a visible queue of females, with a known risk of later males; then dung-fly last-male precedence as a marginal-value problem; boss: the hen ejects your sperm (cryptic female choice). *Looks like:* your tickets are striped and haloed, rivals' dotted or solid; a later male's tickets flush earlier ones out near the gate; each egg takes its father's pattern in a dye bloom.
- **Alarm Call** (§3.6). Untimed peace time: tag kin on a family tree from fathers' face blazes, with multiply sired litters. The 2 s attacks use your tags, and mistakes cost lives (a hawk lifts the victim; a ghost ring remains). The hawk whistle has a hidden negative cost you must discover. Boss: Seychelles warblers, where helpers breed too. *Looks like:* a whistle is a thin straight ring and the caller bolts; a trill is a wavy ring and the caller freezes; a killed squirrel leaves a ghost ring and a hollowed node on the pedigree.
- **The Forager** (§3.7). One great tit's day on one map. Prey arrive one at a time on the hedgerow (fixing the conveyor flaw); in the orchard the marginal-value tangent is drawn from your own data; then the hawk; then your leaving rule competes as an allele; boss: surviving a winter night. *Looks like:* chicks gape and fatten as you deliver, and an unfed one stays thin; the gain curve draws itself as you feed, and the tangent is drawn only after you leave.
- **The Clinic** (§3.8). Live dosing from L1 against the drug-concentration curve, with the mutant selection window hatched. Designed immune clearance makes "the immune system helps" true in the model. Then missed doses, standing resistance, a six-bed bay with a KPC plasmid, and a boss where resistance stays after the drug is withdrawn because its cost has been compensated. Opens after Act 4. *Looks like:* smooth blue susceptible cells and spiked amber resistant ones in a dark-field dish; the mutant selection window hatched between dashed MIC and MPC lines; plasmids as ink loops arcing between cells.
- **Switches** (§3.9). An A1 column and two Ubx levels fix the abd-A error; colinearity becomes a mechanic; crustacean body plans; a Pitx1 enhancer circuit board scored on side effects; boss: a stickleback lake where a recessive pelvic-loss allele starts slowly. *Looks like:* a 1.4 s hatching in which the pupal case cracks head to tail and limbs grow segment by segment in colinear order; the target sits as a dashed specimen plate pinned in the corner, so it no longer looks like a result.

*Your call (D5 Q2): do these keep what you loved? Play the Wood pilot before the other favourites are built.*

---

## 6. New concepts to add

D5 decision 4 freezes all P1 and P2 games until tiers 1–3 are approved: the slice's Mixer and Casino, the other spine rebuilds, and the P0 games and hosts (glossary, §10). In practice the P1 core units ship in Waves B and C and the P2 side quests after the pilot. Specs are in D3 (§5 for P0, §7 for P1/P2).

### P0: core, built in Wave A

| Area | Unit | One-line pitch |
|---|---|---|
| Heredity | **The Scribe** (rebuild) | Tag random mutation sparks to see most do nothing, some kill, a rare few win; jackpot plates prove mutants existed before the drug |
| Heredity | **The Royal Line** | Morgan's reciprocal crosses, the X-linked zigzag toward equilibrium, and Queen Victoria's carriers as Bayesian risk |
| Heredity | **The Breeder** (host) | Artificial selection with a plateau and inbreeding, plus a "gym" level where trained parents' young reset (acquired traits are not inherited) |
| Gene pool | **The Pedigree** and **Invisible Carriers** (hosts) | F by path counting; q = √aa; ABO blood groups; cousin risk |
| Population genetics | **The Leaky Tap** | As a dusk gull you purge a harmful allele; it settles at μ/(hs), or far higher when recessive; the load settles at about 2μ (μ if fully recessive), however strong selection is |
| Population genetics | **Gene Swamping** | Hunt on lava while ferries bring pale migrants; adaptation is swamped once migration reaches selection; clines and F_ST |
| Population genetics | **Malaria Coast** | Paint malaria onto a coast; newborns sit on the HW curve, adults above it; the only home of heterozygote advantage |
| Population genetics | Drift Casino's Ne levels (host) | Buri's 107 bottles drift like 11.5 flies, not 16 |
| Selection | **Seed Rain** cave-fish level (host) | Trait loss in the dark, with you as the environment |
| Deep time | **The Dig** | Pour mud to make a biased record, date ash by tapping decays, choose dig sites to find an intermediate, place fossils on a log-time ruler |
| Deep time | **Extinction Roulette** | Shield lineages from background extinction; the predictors fail at the impact; today's extinction is selective again |
| Humans | **Out of Africa** | Open climate corridors; each founder band loses alleles; heterozygosity falls with distance |
| Applied | Clinic plasmid ward (favourite) | Horizontal gene transfer between beds |

Malaria Coast and Out of Africa (and later Human Variation and the Manhattan Hunt) need a sensitive-content panel to sign off before build and again before release. Its members are Coordinator A (the AI science fact-check agent that signs off every claim) and two people you must nominate: a human population geneticist and a scholar of race and science. *Your call (D5 Q4): can you nominate the two humans?*

### P1: core, frozen until tiers 1–3 are approved (ships in Waves B–C)

| Area | Unit | One-line pitch |
|---|---|---|
| Population genetics | **Lottery of the New** | Bet on which new beneficial copies fix (about 2s); Haldane's sieve; the nearly neutral boundary |
| Sex | **The Skaters** | A female water strider fights off lunging males while clasper and anti-clasper alleles escalate |
| Social | **The Cleaning Station** | Clients punish cheating cleaners; reputation collapses when the audience leaves |
| Social | **The Hive** | Workers police each other's eggs as the queen's mating number rises |
| Genomes | **Tangled Pairs** | Your hunting holds mimicry alleles together; an inversion becomes a supergene |
| Macroevolution | **Pseudoreplication Trap** | A correlation you generated dissolves under independent contrasts |
| Humans | **Human Variation** (gated) | Every border you draw misclassifies most people near it |
| Applied | **The Refuge** | Paint Bt fields and refuges to slow resistance in bollworms |

Lenski's experiment is not frozen: it arrives in Wave B as **Twelve Flasks**, the rebuild of The Landscape.

### P2: side quests after the pilot

Song School (cultural evolution), The Warm Nest (temperature sex determination), Red Fire (greenbeards), The Placenta (imprinting), The First Pond (origin of life), The Toolkit (deep homology), The Manhattan Hunt (GWAS, gated), Islands of Divergence (genome scans), Drifting Continents (biogeography), The Harvest (fishing-induced evolution; Gorongosa tusklessness), The Race (great tits and warming), The Tumour (cancer and adaptive dosing). The Drunkard's Walk (passive versus driven trends) ships as scenario cards because it has no per-second verb.

### Where each missing concept lands

R8 rated 25 concepts missing (R7 moves Ne to thin). This is where each is first taught, at what priority, and in which phase it first ships (§9). "Slice" is Phase 1; Waves A–C are Phase 2.

| R8 code | Concept | Unit and level | Priority | First ships |
|---|---|---|---|---|
| A4 | Deep time, dating | The Dig L2 (zircon decays) and boss (log-time ruler) | P0 | Wave A |
| B2 | Sex linkage, multiple alleles | Mixer boss (an X-linked population); The Royal Line; Invisible Carriers L3 (ABO "Blood Bank") | spine; P0 | Slice (Mixer boss); Wave A |
| B7 | Non-genetic inheritance | Breeder L2's What if? ("a mark that fades"); Song School (cultural inheritance) | P0 host; P2 | Wave A (one What if?); after the pilot |
| C3 | Effective population size (thin, per R7) | Drift Casino L3 (Buri's bottles); `clock` boss (small Ne) | spine | Slice |
| C8 | Mutation–selection balance, load | The Leaky Tap, L1 to boss; Royal Line L3 (incidence 3μ/s) | P0 | Wave A |
| D2 | Overproduction, limited resources | Lichen Wood L0 (300 eggs culled to 30) | favourite | Slice |
| D8 | Testing adaptive hypotheses | Act 5 field problem "Adaptive or not?" (named in D2 §3, not yet specified); Pseudoreplication Trap | field problem; P1 | Unscheduled; Wave C |
| E7 | Sex determination | The Warm Nest | P2 | After the pilot |
| E8 | Plant mating systems | The Pedigree L3 (pin and thrum); The Meadow L3 (S-alleles) and boss (selfing) | P0 host; rebuild | Wave A; Wave B |
| F5 | Eusociality | The Hive | P1 | Wave B |
| I5 | Horizontal gene transfer | Clinic L4 (KPC plasmid bay) and boss | favourite | Wave A |
| I6 | Polygenic traits, GWAS | The Manhattan Hunt (gated) | P2 | After the pilot |
| I7 | Gene trees vs species trees | Coalescent boss | spine | Wave A |
| J3 | Deep homology, novelty | The Toolkit | P2 | After the pilot |
| K6 | Hybridisation | Archipelago L4 ("Big Bird") and boss (cichlid hybrid swarms) | spine | Wave A |
| L3 | Comparative method | Pseudoreplication Trap | P1 | Wave C |
| L4 | Fossil record | The Dig L1 (a biased record) and L3 (where to dig) | P0 | Wave A |
| L6 | Mass extinction | Extinction Roulette L2 (the impact) and boss | P0 | Wave A |
| L7 | Historical biogeography | Drifting Continents | P2 | After the pilot |
| L8 | Origin of life | The First Pond | P2 | After the pilot |
| M1 | Hominin record | The Dig boss (hominin fossils on the log-time ruler) | P0 | Wave A (one level) |
| M2 | Out of Africa | Out of Africa L1 | P0, gated | Wave A |
| M3 | Archaic admixture | Out of Africa L2–L3 | P0, gated | Wave A |
| M5 | Human variation and "race" | Human Variation | P1, gated | Wave C |
| N6 | Evolutionary medicine | No unit of its own; parts in Malaria Coast, Invisible Carriers, the Leaky Tap's achondroplasia gesture and the Clinic; The Tumour | P0 parts; P2 | Wave A (parts); after the pilot |

The 6-hour spine reaches eight of the 25: overproduction, Ne, a first X-linked population, horizontal gene transfer, gene trees, hybridisation, Out of Africa and archaic admixture.

**Still open after Wave A.** Nine gaps have no unit until later: eusociality (Wave B); the comparative method, testing adaptive hypotheses and human variation (Wave C); sex determination, GWAS, deep homology, historical biogeography and the origin of life (side quests after the pilot). Testing adaptive hypotheses also waits on Act 5's field problem, which no wave schedules yet. Four more ship thin: non-genetic inheritance (one What if?), plant mating systems (one Pedigree level until the Meadow in Wave B), the hominin record (one boss level) and evolutionary medicine (scattered levels, no unit). A professor who needs any of these before Wave C ships should plan a lecture or a scenario card for it.

**Thin concepts, and where they deepen.** R8 rated 37 concepts thin; these matter most for exams. (The 24 "problem" ratings are the corrections in Appendix A and the REBUILD verdicts in §4.)
- Reading trees (L1): Tree Thinking, rebuilt and moved to Act 1 (spine, Wave A).
- Gene flow, F_ST, clines (C5): Gene Swamping (Wave A) and Act 4's field problem, "highest F_ST".
- Balancing selection (C9): Malaria Coast (heterozygote advantage), Jaws' lizard boss, the Meadow's S-alleles.
- The coalescent (C10): rebuilt and moved after drift (spine, Wave A).
- Linkage disequilibrium and hitchhiking (C11): Tangled Pairs (Wave C).
- Fitness as relative reproductive success (D3): the Wood's egg tray and cull (slice).
- Modes of selection (D4): Seed Rain (Wave A).
- Artificial selection and correlated response (D9, D5): The Breeder L1, L4 and the Belyaev boss (Wave A).
- Genotype to phenotype and G×E (B5): Breeder L3 (environment against genes; Wave A); The Pond's reaction norms (Wave B).
- Experimental evolution (A6): Twelve Flasks (Wave B).
- Detecting selection (I3): Coalescent L4 (Tajima's D; Wave A); `clock` L2–L3 (dN/dS; Wave C).
- Radiation and character displacement (L5, O1): Archipelago L3 and boss (Wave A).
- Recent human adaptation (M4): Out of Africa L3 (EPAS1) and boss (lactase) (Wave A).
- Senescence (G6): The Slow Island (Wave B).

---

## 7. Making it a product for professors

R8 found that teachers cannot adopt the games today. Their needs, and what D2 and D1 schedule:

| Need | Today | Build | When |
|---|---|---|---|
| Syllabus alignment | None | Concept codes (R8's A1–O4) on every level, crosswalked to Futuyma & Kirkpatrick, Herron & Freeman, AP Biology Units 5 and 7, IB, AQA and OCR A-level, the QAA benchmark; searchable ("everything on drift") | Phase 0 |
| 10–20 minute activities | Chapters of 3–15 min; random interruptions | Each unit fits a class slot; a lecture-insert card per unit: 2 min predict, 8 play on a shared seed, 3 pair talk, 2 exit item | Each unit |
| Projector mode | Phone column, low-alpha text, sound-led feedback | 16:9, high contrast, type ×1.4, answers hidden; pause, step one generation, speed, seed, reveal, pen, "freeze and ask" | Phase 0–1 |
| Assignable sequences | No level select | Level select; assignments (units, levels, order, parameter locks) as a link or QR code that works in the offline file | Phase 0–1 |
| Shared worlds | None | Seed links; six-character result codes the teacher's screen aggregates; a live class pool (every student's drift line in one projected fan) once the server exists | Phase 1; pool Phase 3 |
| Sandbox parameters | None | N, s, h, h², μ, m, V/C, r, B, C exposed with "realistic" or "×N" tags; replicates side by side; scenario cards with share codes | Phase 1; editor Phase 3 |
| Data export | None | CSV of predictions, wrong options chosen (a misconception report), time and stars per concept; raw run trajectories | Phase 0 |
| Instructor notes and prompts | Scattered in `maths` text | One page per unit: objectives, equations, parameters, simplifications, star rules, known student errors, answer key, timing; three prompts rising in Bloom level, one a model critique | Each unit |
| Assessment | None | A 25-item pre/post test from CINS, GeDI, CANS, MUM, EvoDevoCI and the Genetics Concept Assessment; normalised gain per concept | Draft Phase 0 |
| Saves in an LMS | `localStorage` only | Storage adapter: SCORM `suspend_data`, then IndexedDB, then `localStorage`, then a save code | Phase 0 |
| Accessibility | No keyboard; colour-only cues | WCAG 2.2 AA per unit; an external audit and a VPAT before publication | Each unit; audit Phase 3 |
| LMS integration | None | LTI 1.3 Advantage (deep linking, grade return) with a SCORM fallback; xAPI-shaped events; a dashboard of prediction accuracy and misconceptions | Phase 3 |
| Privacy | Google Fonts leak student IPs | Embedded fonts; no third-party requests; no names, emails or ages by default; delete by class | Phase 0 (fonts) |
| Stability and evidence | Content changes between builds; untested | Version-pinned yearly releases with a changelog and a science-validation statement; a two-course pilot (n ≈ 200) against an active-learning comparison | Phase 4–5 |

R6 also flags that US public universities fall under the ADA Title II web accessibility rule (WCAG 2.1 AA). The 2024 DOJ rule (28 CFR 35.200) set 24 April 2026 for public entities serving 50,000 people or more, which covers state universities, and 26 April 2027 for smaller ones. A DOJ interim final rule of 20 April 2026 moved these to 26 April 2027 and 26 April 2028; it took comments until 22 June 2026, so confirm the final dates in the Federal Register before publication. Either way, US public universities will already be bound by the time the app is published, so WCAG 2.1 AA conformance is a condition of adoption, not later polish.

---

## 8. Technology

**Recommendation.** Stay in plain JavaScript and Canvas2D for all of Wave 2 (the slice and Waves A–C; D5 decision 21), written in a migration-ready shape, and decide on TypeScript plus PixiJS only after a one-week spike ports the rebuilt Lichen Wood. The long-term target (R6) is a web-first, offline-capable TypeScript app: a pure seeded simulation core with no DOM, PixiJS for scenes, a thin Svelte DOM shell for menus, cards and charts, Three.js loaded lazily for at most two or three scenes, shipped as a PWA plus a single-file offline build, with LTI 1.3 and SCORM. Do not adopt Godot or Unity; use Blender only offline, to render art. The visual weakness the reviews found is an art and game-feel problem, not an engine problem: the best-looking chapters already run in Canvas2D, and the whole 48-chapter game is 251 KB gzipped, smaller than any engine runtime.

| Option | Good for | Cost or risk here | Verdict |
|---|---|---|---|
| Vanilla JS and Canvas2D (today) | No toolchain; runs from `file://`; Wave 2 can start now | One global scope, no types; i18n, accessibility, LMS and tests all hand-built | **Now, through Wave C** (D5 decision 21): v2 plug-ins in migration-ready shape |
| TypeScript + Vite + PixiJS (+ Svelte shell) | Types and modules suit agents; GPU sprites, particles, filters; accessible DOM text beside the canvas | Toolchain; you would read TS, not JS | **Target**, if the Stage 1 spike passes |
| Phaser instead of Pixi | Scenes, tweens, input and audio built in | Most of it unused or already written; heavier | Acceptable alternative; never both |
| Godot 4 | Free, open, diffable scenes | Web runtime commonly reported at 8–10 MB; canvas only, so no DOM text, browser translation or screen-reader tree | **No** (at most a throwaway spike) |
| Unity | Strong 3D and mobile | WebGL payload and load time far above this game; same opaque canvas; editor-bound scenes; vendor-trust history | **No** |
| Three.js moments | A real height-map for fitness landscapes (Twelve Flasks), perhaps an embryo axis or a tree | Easy to overuse; 3D is harder to make accessible | **Later, lazy-loaded, at most three scenes.** D1 finds Canvas2D enough for Switches |
| Blender as pipeline | Batch-render organisms to sprite sheets with headless scripts | Not an engine | **Yes, offline art only** |

**What the spike decides.** Because D5 keeps every v2 unit in plain JavaScript through Wave C and defers the port to Phase 3, the Phase 1 spike sets the Phase 3 target, not Wave A's language.
- *If it passes:* Phase 3 builds a TypeScript and Svelte shell with Pixi views. Each v2 unit's `sim` object moves into the TypeScript package under `allowJs` almost unchanged (plain-JSON state, seeded `R()`, no DOM), but its Canvas2D drawing is rewritten for Pixi: about 60 view rewrites. Neither R6 nor D2 estimates this. If a view rewrite costs a third of building the unit, the port is about 20 M-equivalents, roughly seven weeks at the waves' pace of 3 a week (an editor's estimate, not a measurement).
- *If it fails:* Canvas2D stays behind the same view interface, and only the shell, saves and LMS layers move to TypeScript in Phase 3.
- *The alternative you can choose instead:* if the spike passes, write every unit from Wave A on in TypeScript against the same `sim` contract, and build the Stage 2 shell before Wave A. That avoids the second pass but brings the toolchain forward by about three months and overrides D5 decision 21.

R6, the technology specialist, disagreed with the D5 plan: it rated plain JS "legacy host only, fixes only" and wanted new work in TypeScript from the start. D5 overruled it to keep the offline single file and the toolchain-free build working while the template is still being proved. Approving one of these routes is decision 3 in §1.

**Constraints that bind Wave 2 now** are agent-level build rules from D5 (one `v2/` file per chapter, seeded plain-JSON state, bit-exact `Det` maths, a 96-byte resident snapshot, a 60 fps gate under 4× throttle). They are listed in Appendix B.

**Migration path** (R6 §6, no rewrite freeze):
1. **Stage 0, hygiene:** `package.json`, Vite, TypeScript in allow-JS mode, Vitest, CI running today's Playwright tests; embedded fonts; `requestAnimationFrame` loop; golden seeded trajectories of the ten favourite ids.
2. **Wave 2 in plain JS:** the slice and Waves A–C as v2 plug-ins in the current build; `?v1=1` keeps the old game reachable.
3. **Stage 1, the go/no-go spike:** port the v2 Lichen Wood to TypeScript, Pixi and a Svelte HUD. Pass if it holds 60 fps at 4× throttle, meets the size budget and axe-core, and you say it feels better. If Pixi fails, keep Canvas2D behind the same view interface.
4. **Stage 2 (Phase 3):** a TypeScript shell hosts legacy chapters in an iframe (`TB.App.play` is already exported) while menus, saves, events and the PWA move over.
5. **Stage 3 (Phase 3):** move `Gen`, the random-number generator and Equilibrium's maths into a shared simulation package; port units wave by wave, cheaply, because v2 code already follows the rules.
6. **Stage 4–5:** LTI, SCORM, class mode, accessibility audit, a pilot translation; then Three.js scenes, a Blender art pass and, only if asked, a Capacitor store listing.

---

## 9. Roadmap

Gates, not dates, govern. Session counts are rough estimates at the current agent-assisted pace; D2's calendar estimates are in brackets.

| Phase | Content | Gate | Sessions (rough) |
|---|---|---|---|
| 0 Foundations [3–5 weeks] | Rebuild shipped files; Tangled Bank sweep (G8); golden trajectories; additive shell edits; the plug-in layer (palette, juice, ghost hand, entry, widgets, Hunt extensions); layout; teacher strip; lints, oracles, bot sweep; scene lab; concept codes | All 48 chapters pass the monkey in the new shell; golden trajectories unchanged; a save survives where `localStorage` throws; Mixer and Casino specs approved | 2–3 |
| 1 Vertical slice [6–8 weeks] | Lichen Wood (Act 0), Black Country, Hawks and Doves, The Mixer, Drift Casino; a three-place map, moth bestiary, sandbox with three tools and five cards; 30-item review deck; projector, level select, assignment links, export. Stage 1 TS/Pixi spike in parallel | Think-aloud tests with 10–12 new undergraduates: median first action under 10 s; 70% start the next unit unprompted; median enjoyment at least 4/5; prediction error falls across levels; you call it fun; 60 fps on a low-end Chromebook | 3–4, plus playtests |
| 2A Wave A [10–12 weeks] | The other seven favourites; the spine rebuilds (Mendel, Tree Thinking, Scribe, Census, Why Sex?, Commons, Coalescent, River, Archipelago, Out of Africa); the P0 games and hosts | 20-student route playtest; no unit below 3.5/5; review accuracy rises across sessions | 6–8 |
| 2B Wave B [6–8 weeks] | The rest of Acts 1–8 (19 units including Lottery, Skaters, Hive, Cleaning Station) | As above | 4–5 |
| 2C Wave C [5–6 weeks] | The rest of Acts 9–11 and the full sandbox | As above | 3–4 |
| 3 Platform [3–4 months] | TypeScript shell; LTI and SCORM; class mode; dashboard; live pool; scenario editor; external accessibility audit; pilot translation | Three lecturers run two inserts each unaided; zero serious axe-core violations | 4–6 |
| 4 Pilot [one term] | Two courses, n ≈ 200, ethics approval, pre-registered analysis against an active-learning comparison | Normalised gain at least 0.3 on targeted concepts and 0.1 above the comparison; need-based explanations halved | Real-world |
| 5 Publish | Yearly pinned release (PWA, single file, SCORM, LTI); teacher site; science-validation statement; VPAT; open pilot data | Adoption and reuse | Ongoing |

**Definition of done for every unit** (D5 §3, 14 lines): one of the four roles and a per-second verb; no card before the first action; a gesture prediction per level; 3–6 escalating levels and an inverting boss; a never-pausing live graph; juice timings; the text budget lint; a MODEL card and fact-check sign-off; teacher hooks; WCAG 2.2 AA; the learning layer rewritten; a monkey pass at three screen sizes; a five-student test with no boring flag.

### The next three sessions

**Session 1: ship what is fixed, and lay the safety net.**
1. Rebuild `games/endless-forms/Endless_Forms_v1.html` and `games/equilibrium-hw/Equilibrium_HW_v2.html` from the swept source. The shipped files still say "fiddler crabs", still print "undefined" in the Black Country intro and still explain Equilibrium's migration backwards. Run the monkey on all 48 chapters and targeted checks on the changed ones.
2. Run science sweep G8 on Tangled Bank's `hunt.js` and `steward.js`: `mu: 0.01` (line 332); the backwards dominance card (369); the Lichen heritability card that prints up to 200% and blames "developmental luck" (316–318); the Black Country end card that omits the typica immigrant (381) and the Lancashire premise (327); Bitter Wings' "only work while they are rare" (392, repeated at 421); the Aripo linkage text; Austad's 25%.
3. Apply the small open text items: the Lek and Meadow subtitle patch; `MODEL.lock`'s missing 4% mixing input (keep "deterministic"); the Lichen card's negative heritability, shown as "too noisy to measure" below 0.
4. Record golden seeded trajectories of the ten favourite ids before any v2 file lands; add the `?v1=1` switch.
5. Make D5's additive shell edits: `Det` maths, the `Save` v2 schema and storage adapter, `Events.emit` with CSV export, `requestAnimationFrame`, embedded WOFF2 fonts, `App.playLevel` and URL parameters. Fix Mendel's long-standing monkey timeout.

**Session 2: the plug-in layer and the test harness.**
1. Build `00_tokens.js` (palette, colour-vision preview), `00_fx.js` (juice tiers, cached crowd layer, ghost hand, label routing, live region, whisper), `00_entry.js` ("Begin" into the Wood, v2 end card, the act-based menu), `00_wf.js` (seeded Wright–Fisher helper).
2. Build the first widgets (`LiveGraph`, `Predict`, `Pin`, `GenePoolLens`, `Chips`) and the Hunt extensions the Wood needs (`bag`, `overproduce`, `searchImage`, `trunks`, `predict`, `untimed`, `detectRule`, `migrants`).
3. Land the Stage layout (desktop classes, live strip) and the button and star fixes.
4. Write `tests/lint_text.js`, the Node oracle harness, the five-bot sweep, screenshot baselines (three sizes plus monochrome and deuteranopia) and the Canvas2D performance gate.
5. Add the scene lab (`?lab=<id>`) so you can tune a level by feel.

**Session 3: the Wood pilot.**
1. Build `v2/lichen.js` (L0–L3) and `v2/soot.js` (L4–L6) to D5 Batch 1, with D1 oracles 1–4, MODEL cards, TAKE lines, untimed and non-visual paths, the 15-minute time box checked by a scripted player, and ch99's old Lichen interlude and Black Country transfer card retired.
2. Run D1's Wood gates with five players: median first action under 10 s, at least 60% explain S and R after L1, most see the rare morphs rise in L3, no bot earns three stars, 60 fps with 300 egg dots plus particles.
3. You play it. If it is not fun, stop and fix the template before anything else is built. If it passes, start the TypeScript/Pixi spike on it and move on to Hawks, the Mixer and the Casino.

### Decisions needed from you

The seven decisions, with deadlines, are in §1 after "Where things stand". The first three gate Session 3.

---

## 10. Index of detailed reports

| File | What it holds | Read it when |
|---|---|---|
| `docs/ORIGINAL_README.md` | Your original overview and six design principles | Always. Principles 1, 3, 4 and 5 hold unchanged; D5 amends two. Principle 2 ("the player is the selective environment") becomes four roles: environment, behaving animal whose rule then competes as an allele, investigator with a budget, and experimenter releasing a variant, because behaviour chapters need you to be the animal yet must not teach that animals compute optima (RC1, RC2). Principle 6 ("compared with the exact optimum") now scores in the agent's own currency and shows the knowable optimum only in the debrief, because "% of best" turned play into calculation (RC1) |
| `docs/reviews/R1_endless_forms_sections_I-IV.md` | Expert review of Heredity, Chance, Selection, Games | Redesigning those chapters (read with its R7 fact-check) |
| `docs/reviews/R2_endless_forms_sections_V-VII.md` | Review of Sex, Families, Lives; the worksheet pattern; invasion view | Behaviour chapters |
| `docs/reviews/R3_endless_forms_sections_VIII-XI_and_UI.md` | Review of Coevolution to Deep Time, learning layer and UI | Later sections and the shell |
| `docs/reviews/R4_equilibrium_hw_and_tangled_bank.md` | Level-by-level Equilibrium and Tangled Bank review; Mixer, Saboteur, Leaky Tap ideas | Act 3 and the sandbox |
| `docs/reviews/R5a_visual_review_sections_I-VI.md` | Visual and UX review with screenshots, rankings, colour-vision checks | Art and layout, chapters 1–27 |
| `docs/reviews/R5b_visual_review_sections_VII-XI_HW_TB.md` | Same for chapters 28–48, Equilibrium, Tangled Bank | Art and layout, later chapters |
| `docs/reviews/R6_technology_and_platform.md` | Platform recommendation, architecture, LMS, privacy, migration | Any technology decision |
| `docs/reviews/R7_factcheck_R1…` to `R7_factcheck_R4…` | Adversarial science checks that override R1–R4; correction lists | Before writing any science text |
| `docs/reviews/R8_curriculum_coverage_and_teacher_needs.md` | 101-concept coverage matrix, misconceptions, teacher needs, act structure | Curriculum and teacher features |
| `docs/changes/science_sweep_G1.md` … `G7.md` | What each sweep changed, rejected and left for redesign; tests | Checking whether a fix is already in source |
| `docs/changes/review_G1.md`, `review_G3.md`, `review_G4.md` | Reviewer follow-up fixes on three sweeps | Same |
| `docs/design/D0_design_brief.md` | Root causes RC1–RC7; verified science constraints; text budget | The rules every design follows |
| `docs/design/D1_favourites_redesign.md` | The template rules (T1–T12 here; D1 numbers them G1–G12); full specs of the nine favourites; shared widgets | Building any unit, especially a favourite |
| `docs/design/D2_game_structure_and_roadmap.md` | The world, acts, triage of every unit, scoring, teacher mode, notation table, roadmap | Structure and scheduling |
| `docs/design/D3_new_games_catalogue.md` | Specs for 45 rebuilds and new games; frozen P1/P2 entries; engine requests | Building any non-favourite unit |
| `docs/design/D4_art_direction_and_ux.md` | Field Plate look, data inks, type and text budget, juice, layout, onboarding, accessibility | Anything visual |
| `docs/design/D5_design_decisions.md` | The binding decisions, gold-standard checklist and Wave 2 build list | First, before building anything |
| `docs/design-history/01`–`04` | Your original idea lists, earlier reviewer feedback, the HW brief | Background |

### Glossary

- **R1–R8, D0–D5:** the reviews and design documents above. "D1 §3.2" means section 3.2 of D1; "R7-R1 D18" means item D18 in R7's fact-check of R1.
- **Sweep G1–G8:** a science sweep, a logged correction pass over the game source. G1–G7 are done on Endless Forms and Equilibrium; G8 (Tangled Bank) has not run. "Fixed (G2)" means fixed in source by sweep G2.
- **Template rules T1–T12:** D1's rules every unit must meet (role, the agent's goal, three loops, the first 10 seconds, gesture predictions, the live graph, the invasion view, the MODEL card, failure, stars and more). D1 calls them G1–G12.
- **Act:** one of the twelve parts of the game (0 The Wood to 11 Applied and human), each a group of units on the station map; the sandbox capstone follows them.
- **Spine:** the 22 starred units (about 6 hours) that pass through every act and every favourite; the first-year route.
- **Slice:** Phase 1's vertical slice: Lichen Wood, Black Country, Hawks and Doves, the Mixer and the Drift Casino, with a small map, sandbox and teacher tools.
- **Wave:** Wave 1 was the science sweeps. Wave 2 is the v2 build: the slice, then Waves A (the rest of the spine plus P0), B (the rest of Acts 1–8) and C (Acts 9–11 and the full sandbox).
- **Tier 1–5:** D2's order for writing specs: 1 the slice's Mixer and Casino; 2 the other spine rebuilds; 3 the P0 games and their host units; 4 the other 23 rebuilds; 5 the frozen P1/P2 games.
- **P0, P1, P2:** D3's priority for new concepts. P0 is core and built in Wave A; P1 is core but frozen until tiers 1–3 are approved, then built in Waves B–C; P2 are side quests after the pilot.
- **MODEL card:** a panel on every level saying what is simulated, the key simplification and each parameter tagged realistic, designed or ×N (exaggerated N times).
- **Invasion view:** a second act in which the player's fitted rule seeds a lineage that competes in a visible population.
- **Oracle and bot sweep:** an oracle is an automated test that a model reproduces a known result; the bot sweep plays every level with five fixed strategies, none of which may earn three stars.
- **M-equivalent:** D2's unit of build effort (a small unit 0.6, medium 1, large 1.8).
- **Coordinator A and B:** the two AI agents of the design round. A fact-checks every science claim before text freezes and sits on the sensitive-content panel; B integrated D1–D4 and wrote D5.

---

## Appendix A. Corrections table (verified items only)

*Moved here from §3.3.*

Every row was confirmed by an R7 fact-check or by a sweep's own simulation or literature check. "Fixed (G*n*)" means applied in source by sweep G*n*. **None of these fixes reaches players until `Endless_Forms_v1.html` and `Equilibrium_HW_v2.html` are rebuilt from source.** "Open" items need a redesign or a further edit.

| Chapter | Problem | Fix | Source | Status |
|---|---|---|---|---|
| Mendel (learning layer) | "Call it pure with 99.9% confidence" confuses P(data \| carrier) with P(pure \| data) | "A carrier would do this only 1 time in 1,024" | R7-R1 D18; R7-R3 M30 | Fixed (G6) |
| The Scribe | "Mutations are simply copying errors" | Copying errors, DNA damage and faulty repair, all blind to need (Gao et al. 2019) | R7-R1 D3 | Fixed (G2) |
| The Scribe | A timeout "slips" and deletes a base; real slippage depends on repeats, not haste | Text corrected; mechanic still a timer | R7-R1 A5 | Text fixed (G2); mechanic open (rebuild) |
| Crossing Over | L1 implies the cell places crossovers; L2's "Sturtevant's map" uses modern positions | Positions are chance, with hotspots; labelled a modern map | R7-R1 A8, B4, D19 | Fixed (G1) |
| The Census | End card: HW is "what genotypes look like when nothing interesting is happening"; Allison's carriers "survived malaria better" | HW is a null model, and a good fit does not mean no evolution; carriers had fewer, milder infections | R7-R1 D2; Allison 1954 | Fixed (G1) |
| Drift Casino | Notes give fixation chance = current share even in selection jars; "a 15% edge barely beats a coin toss in a jar of 6" | Neutral jars only; simulated 52% against a neutral 33% | R7-R1 D4, D6 | Fixed (G1) |
| The Castaways | "Most harmful mutations are recessive" | "At least partly recessive" (h ≈ 0.25) | R7-R1 D21 | Fixed (G1) |
| Why Sex? | Fathers chosen at random, so sexual load was e^(−2U); sex looked like meltdown (31% extinct) | Fitness-weighted fathers give e^(−U) | G1 simulation | Fixed (G1, model) |
| Why Sex? | "Twofold cost built in", but the population cap makes sex free while mean fitness exceeds 0.4 | Text now honest; real fix is a clone invading a sexual pond | R7-R1 D5 | Text fixed (G1); model open |
| Why Sex? L2 | Labelled a parasite level; is Fisher–Muller | Named Fisher–Muller; scored on the share carrying both mutations | R7-R1 A26 | Fixed (G1) |
| The Fancier | Correlated response missing σ₂ | CR₂ = h₁h₂r_G(S/σ₁)σ₂ | R7-R1 D10 | Fixed (G1) |
| Lichen Wood | "Drifts toward" (that is chance); response slows "because variation is used up"; end card printed −100% and >100% heritability | "Evolves"; mainly because S shrinks; values of 100% or more explained as sampling noise; show negative values as "too noisy to measure" until the redesign | R7-R1 D14–15; R7-R4 C7; R5a | Partly fixed (G2, G6): >100% explained; negative values still printed as "passed on" (`hunt.js` `what()`; open, G2 log "Still open") |
| Lichen Wood | Cites apostatic selection (Bond & Kamil) but the model has one optimum | Text hedged; model needs search image, three morphs, two barks (D1 L3) | R7-R1 A29 | Text fixed (G2); model open |
| Black Country (EF) | Recurrent carbonaria mutation at 1% per gamete against a single 1819 origin | `mu: 0`; carbonaria seeded at q = 0.05 (at least one copy); a rescue migrant | R7-R1 D16; R7-R4 A11 | Fixed (G2) |
| Black Country | Per-generation card says carbonaria copies exceed the black share (backwards) | Copies are below the black share; the pale allele hides | R7-R4 C2 | Fixed in EF (G2); open in Tangled Bank `hunt.js:369` |
| Black Country | Intro reads "How to play. undefined" | Patch now targets the right field | R5a | Fixed (G2); still in shipped HTML |
| Black Country | Titled for Birmingham, set in Lancashire | Set in the Black Country (D1) | R7-R4 C10 | Open (v2 Wood) |
| Bitter Wings | "Mimics only work while rare" | "Best while rare relative to models" (Lindström et al. 1997) | R7-R1 D13 | Fixed (G2) |
| Bitter Wings | 8:24 model–mimic ratio never changes, so frequency dependence is never tested | Variable model count (D1 L2) | R7-R1 A42 | Open |
| Left Jaw, Right Jaw | "Only ever strikes one flank … inherited"; Notes call the share a gene frequency | "Mostly one flank, partly inherited" (h² ≈ 0.2) | R7-R1 D7, B31 | Text fixed (G2); model still discrete and fully heritable, open |
| Hawks and Doves | Fiddler crabs fighting over shells | Hermit crabs (Elwood & Briffa 2001) | R7-R1 D1 | Fixed (G2, G3) |
| Hawks and Doves | Player's choices do not move the population; mixed ESS and polymorphism conflated | Text distinguishes them; invasion play in D1 | R7-R1 A51–52 | Text fixed (G2); play open |
| Blood Debts | Partner-removal result credited to Carter 2013; 35% nightly failure | Carter & Wilkinson 2015, Carter et al. 2017; juvenile rate, adults ~7% | R7-R1 D8–9 | Fixed (G2) |
| The Sieve | "Two extreme parents have middling offspring" | Parents from opposite extremes | R7-R1 D11 | Fixed (G2) |
| Switches | Target 4: losing abd-A gives legs on the abdomen | abd-A loss gives legless A1-like segments; Ubx loss in A1 gives legs (Lewis 1978) | R7-R3 M2 | Correction card added (G2); grid still teaches it, open (D1 A1 column) |
| Switches | "Most" change is regulatory; Hox "atop the hierarchy"; "spines" (dorsal) | "Many"; selector genes; pelvic spines | R7-R3 M11–12, SW2 | Fixed (G2) |
| Alarm Call | Hawk whistle charged the highest cost and coyote trill the lowest, opposite to Sherman | Whistle 0.08, trill 0.22 | R7-R2 A38 | Fixed (G3); Sherman implies a negative whistle cost, open (D1 L3) |
| Alarm Call | Maths text inherited from v1 (cost 0.18); "half your genes" | Cost-general; "shares half by descent, on average" | R7-R2 C1 | Fixed (G2) |
| Alarm Call L2 | "Breeding won with half-siblings" is false in spring 3 | Breed when 1.5q > 1.2r | R7-R2 C2 | Fixed (G3) |
| Alarm Call | Every sister r = ½; litters are multiply sired | Disclosed; pedigree tagging in D1 | R7-R2 A39 | Text fixed (G3); model open |
| Fisher's Brood | Diploid ESS used for haplodiploid figs; "found exactly that" | Haplodiploid ESS (n−1)(2n−1)/[n(4n−1)] stated | R7-R2 A8 | Text fixed (G3); scripted population open |
| The Raffle | "Spend nothing on virgins" holds only because no male mates later; dung flies are last-male; the fall in the hump has weak support (Kelly & Jennions 2011) | Caveats and a MODEL card added | R7-R2 A20–21, C10 | Text fixed (G3, G6); model open |
| Two Sizes | Holding "tiny" wins | Experimenter releases mutants (D3) | R7-R2 A12 | Open (rebuild) |
| The Forager | Simultaneous conveyor lets a simple policy beat the scored optimum | Sequential encounters (D1) | R7-R2 A63 | Open (rebuild) |
| The Nest | Eggs free; maths text contradicts the code | Disclosed; text matches code | R7-R2 A42, C7 | Text fixed (G3 review); model open |
| Selfish Spindle | "Poisons sperm that lack it"; overstated test power | Damages all sperm, rescues carriers; 61% power at 24 pups | R7-R2 C11–12 | Fixed (G3) |
| The Commons | L2 teaches weak altruism as altruism; says random groups act like kin; misdescribes Chuang et al. 2009 | Weak altruism named; random groups contain no kin; a signal that switches on resistance in every cell | R7-R2 A47–51 | Fixed (G4, G6) |
| The Crowd L2 | Crowd aims at total weight 40, not 32 | 32 | R7-R2 C3 | Fixed (G4, model) |
| Lock and Key | Hosts fall to 10⁻⁷ and collapse to one type, contradicting "keeps variation alive" | Strength 4; each season 4% of the population is replaced by an even mix of types (mutation and migration), a floor of about 1% per type | R7-R3 M6 | Fixed (G4, model); MODEL card omits the 4% mixing input, open (add it; "deterministic" is correct and stays) |
| Live Fast | Smith–Fretwell misstated; Williams 1966 for senescence; ageing imposed | Corrected; Williams 1957; ageing disclosed | R7-R2 C4–5, A58 | Text fixed (G4); model open (Slow Island) |
| Shape-shifters | Conservative and diversified bet-hedging conflated | Both named | R7-R2 C6, A71 | Fixed (G4) |
| Many Become One | Cheaters arise at 6% per division (10⁴–10⁵ too high), undisclosed | Disclosed on screen and MODEL card | R7-R2 A54, C20 | Fixed (G4, G6) |
| Lek; Meadow | Subtitles promise runaway and fertilisation; neither exists | "Mate choice and honest signals"; "Pollinators and plant mating" | R7-R2 A15, A32; D2 §3, §18 | **Open** (`ui.js` line 7 unchanged) |
| The Clinic | "The immune system can mop up a small infection" (model nets ×0.8 a day, about 39 days to clear); "hit hard" as settled; "not caused by antibiotics" | Text matches model; Read, Day & Huijben 2011 added; "mostly selected" | R7-R3 M8–10, CL2 | Fixed (G1); D1's v2 makes the immune claim true with designed clearance |
| The Clinic | No horizontal gene transfer | MODEL discloses; plasmid ward in v2 | R7-R3 CL4 | Text fixed (G6); open |
| The Pathogen | Mosquito season raises the optimum while the text says myxoma virulence fell; Ewald stated as settled; text says replication speeds clearance | Ewald a hypothesis with mixed support; text matches model | R7-R3 M4–5, PA2 | Fixed (G5, G6) |
| The Clock | Dates shuffled independently of species names (plants–animals given 150–520 Myr) | Fixed real pairs (7, 29, 55; 160, 312, 430 Myr) | R7-R3 M1 | Fixed (G5, code) |
| The Ring | Warbler song gradient wrong shape; "clean ring" hook | Simple in the south, complex at both northern ends; hedged | R7-R3 M3, M20–21 | Fixed (G5, code) |
| Tree Thinking | "Lives in water" scored as uniting whales and hippos (convergent) | Replaced by a SINE character | R7-R3 M14–15 | Fixed (G5) |
| Food Web | Non-*Pisaster* removal results invented | Labelled illustrative | R7-R3 M27 | Fixed (G5) |
| Islands | Extinction threshold conflated with extinction debt | Both named | R7-R3 M19 | Fixed (G5) |
| After the Fire | Oaks as the fire-sensitive climax; a three-stage chain guarantees a diversity hump | Shade-tolerant maples; disclosed; rescoring needed | R7-R3 M16, FI2 | Text fixed (G5); scoring open (gated) |
| Doubling | No unreduced gametes; auto- and allopolyploidy unnamed; 1.8× vigour called "a little" | Named and stated | R7-R3 DB2–3, M28 | Fixed (G5) |
| Archipelago | Daphne 1977 "alone"; reversal in 1983 | "No large ground finches"; dry year 1985 | R7-R3 M22–23 | Fixed (G5) |
| Equilibrium L8 | Migration explanation backwards | "Migrants carrying mostly a" | R7-R4 A1–2 | Fixed (G7); still in shipped HTML |
| Equilibrium L14, Guide, Case Files | "Non-random mating never changes allele frequencies" | True only for inbreeding and equal-fertility assortment; disassortative mating moves p | R7-R4 A3, C4 | Fixed (G7) |
| Equilibrium L9 | The bird can eat through the genotype lens | Taps refused under the genotype lens | R7-R4 A6 | Fixed (G7, code) |
| Equilibrium L7 | Integer rounding moves p while text says "exactly" | Population with exact integer counts | R7-R4 C1 | Fixed (G7, code) |
| Equilibrium L13 | Lost alleles "cannot come back"; castaway choice is a free point | Return by immigration or, slowly, mutation | R7-R4 C6, A30 | Text fixed (G7); free point open |
| Equilibrium L17 | Sickle-cell counts have no traceable source | Do not reuse (D0 §3) | R7-R4 B29 | Open |
| Equilibrium L8, L14, L15 | One label ("non-random mating"), three different models | Relabelled; one model per label in The Pedigree | R7-R4 A10, C5 | Relabelled (G7); unify open |
| Tangled Bank Black Country | `mu: 0.01` recurrent carbonaria | Set to 0 | R7-R4 A11 | **Open** (verified at `hunt.js:332`) |
| Tangled Bank Aripo | "Choosy females carry the genes of the colourful males"; preference "drifted" | Their offspring carry both; linkage disequilibrium; indirect selection | R7-R4 A13, C11 | **Open** |
| Tangled Bank Slow Island | Objective says Austad found 1.5× lifespan | About 25% longer | R7-R4 C3 | **Open** |
| Tangled Bank Lichen Wood | End card prints realised heritability up to 200% (R/S clamped to [−1, 2]) and calls the gap "developmental luck"; the model's true h² is about 0.95 | Cap or explain as sampling noise, as EF now does | R7-R4 C7 | **Open** (`hunt.js:316–318`) |
| Tangled Bank Black Country | End card credits the pale comeback only to hidden heterozygote copies; the code also adds one typica immigrant a generation | Name the immigrant | R7-R4 C9 | **Open** (`hunt.js:381`; immigrant at `hunt.js:349`) |
| Tangled Bank Black Country | Premise "Lancashire, 1848" under the title "The Black Country" | Set in the Black Country; the 1848 specimen was from Manchester | R7-R4 C10 | **Open** (`hunt.js:327`) |
| Tangled Bank Bitter Wings | "Mimics only work while they are rare", repeated on the end card | "Best while rare relative to models", as EF's G2 fix | R7-R4 A44 | **Open** (`hunt.js:392`, `421`) |

---

## Appendix B. Build constraints that bind Wave 2 now (D5)

*Moved here from §8. Full detail in D5 §1 and §5.*

- One `v2/` file per chapter, plain JS, no 3D, no CDN.
- `Gen` is the only diploid engine; `Hunt` is wrapped, never forked.
- Each chapter is a `sim` object (step, act, snapshot, restore) with plain-JSON state and seeded `R()` only, so a run is (seed, actions).
- All words sit in one content object; parameters are tagged realistic, designed or ×N.
- Any value between a random draw and a scored outcome uses bit-exact `Det` maths, never `Math.exp` or `log`, so result codes match across browsers.
- A resident population snapshot is at most 96 bytes, so saves fit SCORM 1.2's 4,096 characters.
- Performance gate: a 2,000-dot cached layer plus up to 150 moving sprites at 60 fps under a 4× CPU throttle.
