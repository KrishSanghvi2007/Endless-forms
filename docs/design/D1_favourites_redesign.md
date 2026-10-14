# D1. The favourites, redesigned, and the gold-standard chapter template

*Lead game designer with an evolutionary biologist. Follows `D0_design_brief.md` (D0 wins any disagreement) and its §3. New claims are listed in §6 for Coordinator A. Code references are to `games/endless-forms/source/` after sweeps G1–G6.*

## 0. What this document decides

- **One rule explains the favourites and becomes the template:** *the player pursues the selective agent's own goal (a meal, a shell, chicks, a cured patient); evolution happens to the population as a by-product the player sees, predicts and explains.* Lichen Wood ("camouflage reaches 75%") and Bitter Wings ("resemblance reaches 70%") now star the prey's goal, which no bird wants; the redesigns score the bird's meal.
- **Ownership.** D2 confirms these chapters stay on the core path and approves the organisms. D4 owns all look decisions; colours, shapes and sizes here are behaviour requirements only (a second channel besides hue, entities ≥7% of canvas width, text ≥12 px).

## 1. Compliance with D0

### 1.1 How RC1–RC7 are removed

| RC | Removed by |
|---|---|
| RC1: the player calculates; the population does not respond | Every level ends in a population change the player caused. In-world currencies (chicks fed, eggs fathered, kin alive, patients cured) replace "% of best"; optima only in the debrief; invasion views run on real choices. A bot sweep (G12) fails any level a fixed strategy can three-star. |
| RC2: the player is the evolving organism | The player is the selective environment (Wood, Bitter, Jaws L1–4, Clinic, Switches L6) or a behaving animal whose rule then competes as an allele (Hawks, Raffle, Alarm, Forager, Jaws boss). |
| RC3: text before play | First action within 10 s, after at most 40 words; predictions are gestures; dusk replaces interlude cards; `TRANSFER.soot` and `TRANSFER.clinic` deleted. |
| RC4: the concept is in the caption | Actors at least 7% of canvas width; graphs form out of the organisms; the lens, drum, ward map and larva carry the concepts. |
| RC5: no escalation, a dominant strategy | 4–6 levels, one new variable each, ending in a boss that inverts the lesson; a bot sweep in CI. |
| RC6: model, text and evidence disagree | A MODEL card per level with ×N tags; contested ideas (hit hard, the energy-budget rule, smaller ejaculates at high competition, imperfect-mimicry explanations, Pitx1 "fragile DNA") scored only inside the model. |
| RC7: no spine | Shared widgets (live graph, gene-pool lens and triangle, prediction gesture, invasion view, ledger) and planned echoes: Wood L2 ↔ Jaws L3 (heritability), Black Country ↔ Switches L6 (slow recessive start), Raffle L3 ↔ Forager L3 (the tangent), Jaws boss ↔ Hawks (the simplex). |

### 1.2 Section 3 is respected

All models and text obey D0 §3: carbonaria has one origin, its copy share shown below the black share; Batesian mimics do best while rare relative to models; the whistle is cheap and self-preserving, the trill costly and nepotistic; relatedness is identity by descent, on average, with multiply sired litters; hermit crabs fight over shells, and mixed ESS and polymorphism are separated; jaw twist is continuous, mostly one-flanked, with low heritability; losing abd-A gives legless A1-like segments, a Ubx change in A1 gives legs; Hox genes are "selector genes"; regulation explains "many" changes of form; Pitx1 loss removes pelvic spines. Contested ideas earn no star. Unrealistic parameters carry ×N tags, history is labelled compressed, and expected values are dashed ghosts.

---

## 2. The gold-standard chapter template

Every Wave 2 chapter meets G1–G12; §3's favourites are worked examples; D4 owns layout.

**G1 Role.** The player is the selective environment (predator, drug, lake) or a behaving animal (crab, squirrel, bird, male fly) whose rule then reappears as an allele in a visible population (the **invasion view**, G7). The player never dials an organism's own heritable trait.

**G2 Goal = the agent's goal.** Score in an in-world currency; evolution is what the player notices, not what they are paid for. As the population evolves the player's job usually gets harder: the arms race all the favourites share.

**G3 Three loops.** Each spec states the **second** (the verb, with feedback within 200 ms), the **minute** (one generation or round, ending in a visible population change) and the **level** (one new variable). Each loop contains a decision that can go wrong.

**G4 The first 10 seconds.** No card before the first action; at most 40 words in a HUD strip over a 3 s ghost-hand demo; generation 1 is the tutorial; vocabulary follows the phenomenon.

**G5 Prediction is a gesture.** Before each reveal the player drags a ghost marker onto the live graph (a histogram mean, timeline crossing, share bar, triangle point or map region), scored by distance in the graph's units against a tolerance band revealed afterwards. No multiple-choice predictions.

**G6 Live graph and reveal ladder.** One live graph per chapter, beside the canvas on desktop and in a pull-up tab on phones; it never pauses play. It follows the Census pattern: realised values solid, the expected ghost dashed, a "you" marker. Every level reveals in this order: (1) the world changes; (2) the sprites slide into the graph, so the plot forms from the organisms; (3) a number appears in the HUD; (4) its name; (5) the equation, behind a "Why?" chip. The Notes graphs tab is retired for these chapters.

**G7 Invasion view (behaving-animal chapters).** A 60–90 s second act: the player's rule, fitted from the action log (e.g. P(Hawk | role)), seeds a gold lineage among AI rules; the player predicts, then watches 20–50 generations at speed. Animals behave *as if* they optimise, with nobody computing.

**G8 MODEL card.** Every level has a card behind a chip: what is simulated; the key simplification; a parameter table tagged "realistic", "designed" or "×N"; what the model cannot show; "In nature", including the debate. Every claim carries a `refs` id. Contested ideas carry a badge, and no star depends on them.

**G9 Failure.** "Interesting result", one sentence of reason, and a **What if?** button rerunning the last generation with one change (h² = 0, twice the models, no standing resistance). Loss is visible on the canvas: a dead squirrel, an empty nest, a red ward bed.

**G10 Stars, scored on understanding.** **Discover:** the in-world goal is met and the phenomenon witnessed (detected automatically, e.g. "three morphs persisted for 4 generations"). **Predict:** at least two of three gesture predictions within tolerance. **Transfer:** the boss, or a new-situation gesture, solved. Speed counts only where efficiency is the concept (Forager, Raffle).

**G11 Teacher hooks** (D2 roadmap, D4 layout). Projector mode (16:9, high contrast, answers hidden, keys for pause, step, speed, reveal); a shared-seed link; a class pool where each student's run is one dot or line on the projected graph; three discussion questions rising in Bloom level, one a model critique; CSV export; a one-page instructor note.

**G12 Engineering.**
- **Code:** one `v2/<id>.js` per chapter (`V2.push`); a `sim` object (`step`, `act`, `snapshot`) with plain JSON state, no DOM, seeded `R()` only, and an action log, so a run is `(seed, actions)`; all words in one content object; tunables in `P` as `{v, tag}`.
- **Tests:** a Node oracle (`tests/oracle_<id>.js`); a **bot sweep** (always-A, always-B, random, greedy-now, fixed threshold) where no bot earns three stars; a monkey pass; screenshots at 390×780, 1024×768, 1280×720.
- **Access:** a keyboard map (arrows, 1–9, space), a tap alternative to every drag, an untimed mode for every reflex chapter.
- **Learning layer (D0 §6.2):** overwrite `TAKE`, `MODEL`, `RECALL` and `BRIDGE`; `delete TRANSFER[id]`; re-implement or drop each `ch99.js` patch on purpose; on first play move `Save.d.stars[id]` to `Save.d.v1stars[id]` and clear it, because `Save.star` only ever raises the stored value.

### 2.1 Shared widgets (D1 behaviour, D4 look)

In `v2/00_widgets.js` (the prefix makes it load first, since `build.py` sorts `v2/` files).

- `LiveGraph`: Kinds `hist` (all, eaten, spared and offspring layers, S and R arrows), `line`, `ternary` (de Finetti triangle or strategy simplex, with trail), `scatter`, `map`; takes `ghost` and `you`; a data-table twin for screen readers.
- `Predict`: `Predict.ask({kind, axis, tol})` puts a draggable ghost on the live graph and returns the error; a soft 6 s timer in timed modes.
- `GenePoolLens`: LOOK, GENES (two lettered allele dots per organism) and JARS (alleles fly into jars showing q), porting the jar effect from `equilibrium-hw/source/engine.js`. Paired with a triangle HUD plotting the population at dawn (after mating) and dusk (after selection).
- `Invasion`: `Invasion.run({rules, you, gens, payoff})`: a strip of 200 tokens; the gold lineage against a dashed neutral expectation.
- `Ledger`: The last 10 outcomes of a risky act (taste, call, dose); old tiles fade, standing in for memory.
- `PriceBars`: Ported from `tangled-bank/source/steward.js` for D3's Commons rebuild.

### 2.2 Hunt extensions (D1 owns)

These go in `v2/00_hunt_ext.js`, which wraps `Hunt` methods the way `ch9.js` and `ch10.js` wrap chapters. Every field is opt-in, so old chapters run unchanged:
- `bag:{need, chicks}`: a morning quota feeds a HUD row of chicks; a shortfall starves one.
- `barks:[{tex, mask}]`: backgrounds composited through a `makeNoise` mask; `match()` uses the bark under each moth.
- `searchImage:{streak, switchCost, glintAfter}`: the same morph again is quicker; switching costs a refocus blur.
- `species:[{key, N, traits, toxic, cost, sprite}]`: several evolving populations, each bred from its own survivors.
- `modelCount(Hn)`, `toxicity(Hn)`: model numbers and taste costs that change within a level.
- `lens`, `pin`: the gene-pool lens; long-press pins an individual, fixed in phenotype for life, with threads to its offspring.
- `overproduce:{eggs, K}`: survivors lay eggs at dusk; a winter wipe culls at random to K.
- `predict:{kind, tol, from}`, `untimed`: a dusk prediction gesture; an attention budget in place of the clock.

Dusk replaces `Hunt.interlude` cards. The `ch99.js` Lichen hook fires on id `'lichen'`; disarm it with `Hn._pAsked = true` in `setup()`, which runs after `App.play` resets the flag.

---

## 3. The nine favourites

### 3.1 The Wood: The Lichen Wood and The Black Country (one arc, two ids, the template pilot)

**Keep.** The procedural bark (`barkTex`), `mothSprite` and the soot crossfade; the 12 s morning and the half-second miss penalty; S, R and h² from the player's own hunting; the arms race (better-hidden moths mean harder breakfasts).

**Fix.** *Science:* apostatic selection cited but not modelled (R7 A29); h² fixed near 0.95; S measured on tone while the player is asked about camouflage (G6 #3); no lag in the Black Country (bark cleans 40% a generation); dominance only in words; overproduction invisible (N fixed at 30; R8 D2); nothing follows an individual. *Feel:* stars pay for the moths' goal; text cards for prediction and interludes; no escalation.

**Core loop.** Second: scan, tap, peck burst; the same morph is quicker to catch again. Minute: a 12 s morning with a quota of 15 that feeds four chicks; then dusk plays in the canvas: the spared moths lay eggs on the bark, a winter wipe culls them at random to 30, the morning's moths slide into the histogram (eaten, spared, offspring, with S and R arrows), and from L1 the player drags a ghost bar to predict the offspring mean. Level: 4–8 generations, one lever each; the `lichen` id holds L0–L3 and `soot` holds L4–L6.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L0 Too many moths (Act 0 hook) | 3 mornings; about 300 eggs culled to 30; a pin | Hunt and pin a moth. Most die whatever you do; the pinned moth never changes colour, while its young vary around it. | Overproduction and carrying capacity; individuals don't transform, proportions shift (misconceptions 1 and 3). "I only tilt which ones die." |
| L1 The Lichen Wood | Polygenic tone, hue and mottle; h² ≈ 0.9 | Three histogram predictions; then R/S is named. | R = h²S, on the same camouflage index the meter shows. |
| L2 Mixed diets | Environmental variance raised so h² ≈ 0.3 ("designed") | Strong S, but predictions overshoot until the player shrinks them. | "Selection moves only what is inherited." |
| L3 Two barks (boss) | Birch and oak patches; three morphs (pale-mottled, dark-banded, grey-speckled) plus polygenic modifiers; search image on; 80% start as one morph | Predict the commonest morph after 6 generations (most pick the best-hidden). The streak bonus pays for hunting the common morph; the rare ones rise and all three persist. | Apostatic selection maintains a polymorphism (Bond & Kamil 1998, 2002). This inverts L1: selection need not produce one best form. "I kept the rare ones alive by hunting what was easy." |
| L4 The Black Country | Soot; carbonaria one dominant allele at q = 0.05; gene-pool lens; one migrant a generation flies in | Predict when black passes 75%; in GENES view, pale copies glow inside black heterozygotes. | Every C copy shows, so the rise is fast; the copy share sits below the black share; the triangle dot leaves the HW curve at dusk and returns at dawn ("a good fit at dawn doesn't mean no selection"). |
| L5 Clean air (boss) | Soot stops; lichen regrows over about 5 generations ("history compressed") | Predict when black falls below 50%. Players expect a mirror of the rise; black runs 95% → 93% → 91% → 86% before plunging. | Pale is recessive and shows only in rare tt moths, so the decline lags for genetic as well as ecological reasons. "It rose in a flash and fell in slow motion." |
| L6 The evidence (Transfer) | Kettlewell, then Majerus; marked moths; AI birds; a small true difference in survival | Choose release density, resting sites and sample size within a budget, watching a power meter, then conclude. | How the evidence was gathered and why it was disputed (Cook et al. 2012). |

**Screen and juice.** Moths at least 7% of canvas width (the bark scrolls on phones) with real banding, speckle and mottle; a beak shadow before each peck; soot particles; lichen regrowing as `barkTex`'s coverage threshold rises; eggs blinking out; a chick row that fattens. Every sound (dawn chorus, crunch, a tick when a search image locks on) has a visual twin.

**Live graph.** L0: egg and survivor bars. L1–L2: the histogram. L3: morph frequencies plus a **diet–availability plot** (each morning adds a dot: a morph's share of your catch against its share on the bark); dots above the diagonal for the common morph are the apostatic signature. L4–L5: black share (solid), q (dashed) and the 1 − (1 − q)² ghost.

**Stars.** *Lichen:* Discover = chicks fed and three morphs present at the end of L3; Predict = three of four histogram predictions within 0.5 SD; Transfer = the L3 morph prediction plus a "What if h² = 0?" gesture. *Soot:* Discover = carbonaria rose and fell; Predict = both timelines within ±2 generations; Transfer = a correct, adequately powered conclusion in L6.

**Teacher hooks.** A class pool of realised h² spreads around the true value (sampling noise). Questions: "Your h² came out at 1.2: is that possible?" "Why did black fall more slowly than it rose?"

**In this model / in nature.** *Model:* you eat half of each generation (×N); the Lichen moths are a designed polygenic species (real *Biston* colour is mostly one locus); the search image is simulated; history is compressed. *Nature:* jays form search images (Pietrewicz & Kamil 1979); carbonaria is one transposon insertion of about 1819 (van't Hof et al. 2016); the decline took decades at s ≈ 0.1–0.2 (Cook 2003; Saccheri et al. 2008).

**Build.** `v2/lichen.js` and `v2/soot.js` in `mode:'hunt'` with the Hunt extensions. The three morphs are two existing `dom` loci in a dominance hierarchy (A_, aaB_, aabb); Gen is unchanged. `soot` starts from the player's saved Act 0 moths (D2's persistence rule; canonical seed in teacher mode), and its What if? reruns L4 with carbonaria recessive, absorbing Equilibrium L9. Drop the `ch99.js` predict card and `TRANSFER.soot`; rewrite `TAKE` and `MODEL`. Oracles: mean R ≈ h²S over 500 seeds; dominant phenotype share = 1 − (1 − q)²; a "hunt the commonest" bot keeps all three morphs above 10% for 20 generations.

### 3.2 Bitter Wings

**Keep.** The felt cost (3 s retch, tint, shake); colour-blind-safe luminance coding; `leafTex` and `flySprite`; hesitation as the selective force.

**Fix.** The 8:24 model-to-mimic ratio never changes, so frequency dependence is never tested (R7 A42); no memory cue; no Müllerian mimicry, imperfect mimicry or origin of warning colours; the goal is the prey's resemblance.

**Core loop.** Second: look, hesitate, tap. Minute: a morning with a quota of 12 that feeds the chicks; each taste of a warning-coloured insect adds a bitter or tasty tile to the **taste ledger**, and tiles fade after about two mornings (designed); at dusk the survivors breed. Level: the model count, the toxicity, or a second toxic species.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Bitter lessons | 8 models; 24 palewings start cream | Predict the resemblance in 4 generations; the ledger fills with bitter tiles. | Batesian mimicry evolves out of your learned avoidance. |
| L2 Too many liars | Mimics start where L1 ended; the models' food plant wilts, so models fall 8 → 2, then recover to 12 | Mark where on the mimics-per-model axis protection will fail; then live through the collapse and recovery (below). | Mimics do best when rare relative to models (Lindström et al. 1997). "The coat that saved them yesterday got them eaten today." |
| L3 Deadly models | Mild days (1.5 s retch) alternate with deadly days (6 s, and a chick goes hungry) | Predict whether rough mimics survive; a broad resemblance spread persists. | Strong toxicity holds protection up. Relaxed selection on accuracy is one explanation of imperfect mimicry (Sherratt 2002; contested). |
| L4 Two poisons | Bitterwings (red-black band) and sourwings (yellow-black spots), both mildly toxic, both evolving; tasting kills | Predict where the two patterns converge. The rarer pattern loses more per head and moves toward the commoner one, while your bitter mouthfuls fall. | Müllerian mimicry: positive frequency dependence and shared costs of predator learning (Müller 1879). |
| L5 The first warning (boss) | A toxic green insect on two islands with a rare bright mutant; eggs scattered on A, in sibling clusters on B | Predict where bright spreads. It dies out on A; on B one taste teaches you to spare the siblings. | Inverts L1–L2: for a warning signal, rare is bad; aggregation is one solution (Alatalo & Mappes 1996). |

**What collapse feels like (D0 Q6).** The ledger turns to ticks, red-and-black stops feeling dangerous, your chicks fatten on mimics and the advantage line dives through zero; then the models and the retches return. The bluff is called, then the bank refills.

**Screen.** Ledger tiles carry glyphs as well as colour; the toxic species differ in pattern and luminance, not only hue; the wilting plant shows models falling; tasted models stagger and drop.

**Live graph.** L1: the resemblance histogram. L2–L3: a daily scatter of mimics per model against the survival of good relative to poor mimics, with a zero line. L4: the distance between the two patterns, and bitter mouthfuls per morning. L5: bright frequency on each island.

**Stars.** Discover: chicks fed, collapse and recovery witnessed. Predict: the collapse threshold within ±1 mimic per model, and the convergence direction. Transfer: the boss, plus a gesture for a partly clustered third island.

**Teacher hooks.** The class votes eat or skip as one predator. Questions: "Why can't every palewing be a perfect mimic?" "Is Müllerian mimicry altruism?"

**In this model / in nature.** *Model:* you are the only predator; memory fade and toxicities are designed; tasting always kills in L4–L5. *Nature:* many tasted insects survive; mimicry often rests on a few large-effect loci or supergenes; selection in a warning-colour hybrid zone has been measured (Mallet & Barton 1989).

**Build.** `v2/bitter.js` with `species`, `modelCount`, `toxicity`, `bag` and `Ledger`; the 70% objective is dropped. Oracle: a Bayesian bot predator's mimic advantage falls as models are removed.

### 3.3 Left Jaw, Right Jaw

**Keep.** Adaptation emerging from a reflex; the guard swing, scale bursts and scars; faster seasons.

**Fix.** 60 identical taps; laterality modelled as discrete and fully heritable (G2 item 9); the oscillation is never shown live; the predator is tiny and its jaw not visibly bent; no attention scarcity, no untimed mode.

**Core loop.** Second: among 3–5 prey fish, a scale-eater darts in from one side; tap that fish's flank to raise its guard, which lasts 1.2 s, with at most two up at once, so attention is the scarce resource. Minute: a season of 20 attacks, with the scale-eaters' continuous **twist histogram** drawn faintly on the lake floor. Level: more fish, lower h², another species, or a new world.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 One fish | 1 prey; h² = 0.9 (×N) | Guard, and watch the share swing. | The rare type feeds better: negative frequency dependence. |
| L2 The school | 3 fish, 2 guards | Tap where the next peak will be. You guard the common side on every fish. | Your triage is the selection; a one-season lag makes the swing overshoot. |
| L3 Partly inherited | h² = 0.25 (realistic) | Predict the amplitude; the swings are smaller and slower. | Echoes Wood L2: little heritability, little response. |
| L4 Two hunters | A second scale-eater species shares the prey | Predict whether their swings align; they synchronise, because your guards select both. | Coupling through a shared selective agent (a model prediction; see §6). |
| L5 The lizard wheel (boss) | Side-blotched lizards (Sinervo & Lively 1996): you are a blue mate-guarder; yellow sneakers come from the flanks and can be blocked with the same reflex; orange usurpers cannot. | Predict the next morph on a strategy triangle; the population orbits blue → orange → yellow. | Rock–paper–scissors: no stable point, a fixed cycle order. Inverts L1–L4: what counts is whom you beat, not rarity. Your blocking is one edge: block badly and yellow beats blue, and the wheel breaks. |

**Screen.** Prey fish at 3× their current size, scale-eaters at 2× with visibly twisted mouths; bites throw scales and leave scars; the oscillation line scrolls faintly through the water; lizard morphs differ by pattern as well as colour.

**Live graph.** Right-striker share against a dashed 50:50 line; the twist histogram; the L5 triangle and trail.

**Stars.** Discover: at least 70% of attacks blocked in L1–L4 (scales kept) and one full swing seen. Predict: two of three peak predictions. Transfer: keep the wheel turning for 6 seasons and predict the next morph.

**Untimed mode (D0 Q7).** Each wave freezes on a "tell" (scale-eaters waiting at the edge, twist visible); the player places two guard tokens and the wave resolves. Attention scarcity survives without reflexes.

**Teacher hooks.** The class shouts left or right for a projected fish. Questions: "If twist weren't inherited, would the ratio still swing?" "Why does the lizard cycle run one way?"

**In this model / in nature.** *Model:* selection is exaggerated; a season is a generation. *Nature:* Hori (1993) found a period of about 5 years; heritability is about 0.2 (Lee, Heim & Meyer 2015) with a large developmental role (Raffini & Meyer 2019); whether the distribution has one mode or two is debated.

**Build.** `v2/jaws.js` reuses the `CH_JAWS.draw` fish and guard; twist is a Gen additive locus with `ve` tuned to the target h²; in the lizards' 3×3 payoff matrix, blue's payoff against yellow is the player's block rate. Oracle: against a "guard the commoner side" bot, selection on right-strikers has the opposite sign to p − ½.

### 3.4 Hawks and Doves

**Keep.** Correct payoffs, V/C, Bourgeois, assessment, war of attrition; the crab duel.

**Fix.** `evolve()` ignores the player (R7 A51), so play is "compute the expected value and press"; no invasion test; mixed ESS and polymorphism never told apart; tiny crabs on an empty beach; both buttons grey out; the 20 s cap piles strategies at the cap.

**How play moves the population (D0 Q2).** The duel is the camera; the beach is the stage. Your lineage's rule is how often you played Hawk in each context over your last eight duels. Your descendants (gold-banded shells) play it among 150 crabs; every four duels a tide (one generation) resizes lineages by payoff. Opponents come from the beach, so as your lineage spreads you increasingly fight your own descendants.

**Core loop.** Second: size up the rival, Hawk or Dove. Minute: four duels, then a tide. Level: new residents, V/C, roles or persistence.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The tide pool | 30 crabs, 85% hawks; V = 4, C = 10 | Six duels; feel the cost of hawk against hawk. | The payoffs. |
| L2 The mutant | An all-dove beach; you are one gold crab | Predict the final hawk share. Your lineage spreads, then stalls near 40%. | A polymorphism of pure strategies at V/C. "My hawks ended up mostly fighting each other." |
| L3 The unbeatable beach | Every resident plays Hawk with probability 0.4 | Try any rule; the invasion-fitness meter (your payoff minus the residents') sits at zero, then falls as your lineage grows. | The ESS definition: no rare rule does better. L2's 40%, now inside each crab: a mixed ESS. |
| L4 Big shells | V = 8, C = 4 | Predict the beach's mean payoff. Hawks take over while everyone's payoff falls. | Selection does not maximise group welfare. |
| L5 Owners and sizes | Roles and rival size | Your rule becomes conditional; Bourgeois and assessors invade. | Conditional strategies and resource-holding potential. The reverse rule ("intruders win") is stable in theory but rare in nature. |
| L6 War of attrition (boss) | Hold to display; cap raised to 40 s (exceeded by only 1.8% of an exponential with mean 10 s) | Your holding times are your lineage; any habit (always quit at 8 s) is exploited by a mutant quitting at 8.5 s. | A true mixed ESS: only unpredictability is stable. Inverts L2. |

**Screen.** 150 crabs on the sand: hawks raise claws, doves lower them (shape as well as colour). Background contests spark (hawk against hawk) or scuttle (a dove retreating); the foreground duel is drawn at 3×; each tide washes some crabs away and scatters hatchlings. Buttons never grey out together: the next rival walks in while the last fight resolves.

**Live graph.** Hawk share against a dashed V/C line; the invasion-fitness meter; in L6, a holding-time histogram against an exponential ghost.

**Stars.** Discover: your lineage spreads in L2 and you witness the L4 tragedy. Predict: the L2 share within ±8 points and the direction of the L4 payoff. Transfer: judge whether a new beach (V = 6, C = 8, 50% hawks) is at its ESS, and pass L6.

**Teacher hooks.** A class tournament (R8): the projected beach evolves from students' P(Hawk). Questions: "Can you tell 40% hawks from crabs that each fight 40% of the time?" "Why doesn't evolution prevent the L4 tragedy?"

**In this model / in nature.** *Model:* payoffs are symbolic; with N = 150, drift is visible. *Nature:* hermit crabs assess shells and rivals (Elwood & Briffa 2001); stags assess before fighting (Clutton-Brock et al. 1979).

**Build.** `v2/hawks.js` is a new object; the `ch10.js` wrappers are bypassed, so L4–L5 are re-implemented on purpose, reusing `crab()`, `pay()`, `pay4()` and `pw()`. Oracles: with no player, the beach reaches V/C; a rare pure invader into the mixed-ESS beach has negative mean fitness over 200 seeds.

### 3.5 The Raffle

**Keep.** s/(s + R) and the budget tension across females; the L2 life-bar plot; eggs taking their father's colour.

**Fix.** No male mates after you, forcing "spend nothing on virgins" (R7 A20); hidden rivals scored against an omniscient plan (A22); no precedence; a decorative race on the palest screen (12 px sperm, red–green chart); "% of best" hides real differences (an even split scores 90%: 62.2 of 68.8 eggs).

**The picture (D0 Q6): the Drum.** The female's sperm store is a glass raffle drum filling 40% of the canvas. Every sperm is a ticket: yours gold and striped, each rival's another colour and pattern. Eggs pass a gate one at a time, each pulling a ticket on a thread and taking that father's colour; the expected share is a dashed ghost on the egg row. From L3, a later male's tickets enter at the top and flush out earlier ones near the gate: displacement seen, not stated.

**Core loop.** Second: set the ejaculate; tickets pour in. Minute: one female, ending in the draw. Level: a new rule.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The fair raffle | 6 females in a visible queue; 100 units | Before female 4 (five rivals), drag your expected share; then allocate. | s/(s + R): crowded drums give diminishing returns. |
| L2 Who comes next? | Cards show rivals before her and the chance of one after; only three females ahead are visible | Allocate. The best plan gives a virgin at 90% risk of a later male about 22 units, one at 20% risk about 1. | Ejaculates rise with the risk of rivals to come (Parker 1990); scored against the best plan given what you could see. |
| L3 The dung pat | *Scathophaga*: the last male fertilises about 80% | Hold to mate as your tickets flush out earlier ones with diminishing returns; release to search. Predict the best duration; the tangent then draws itself, as in the Forager. | Mating duration as a marginal-value problem (Parker & Stuart 1976). |
| L4 What else is in the ejaculate | *Drosophila* seminal-fluid levels and life bars | Choose doses. An invasion view then runs 20 generations with and without female counter-evolution. | Sexual conflict (Chapman et al. 1995; Rice 1996). |
| L5 The hen decides (boss) | Feral fowl; you are a subordinate rooster, and some hens eject your sperm (the drum leaks) | Predict which hens give you the most paternity. | Cryptic female choice (Pizzari & Birkhead 2000). This inverts the raffle: the drum is hers. |

**Screen.** The drum, with tickets rattling down a tube into it; the egg row beneath; pat flies at least 7% of canvas width; charts in blue and orange plus pattern.

**Live graph.** Eggs fathered against an expected ghost; allocation bars (the information-matched best plan only at the debrief); the L3 gain curve and tangent; L4 life bars.

**Stars.** Discover: eggs above a threshold in L1–L3. Predict: share predictions within ±10 points. Transfer: the boss, plus an allocation gesture for a new female profile.

**Teacher hooks.** The class allocates by hand, then compares with the debrief. Questions: "Why might a virgin get more sperm than a mated female?" "Who controls paternity?"

**In this model / in nature.** *Model:* tickets are equal; the risk of later rivals is a known probability. *Nature:* spending more when rivals are present is well supported; spending less at very high competition is not (Kelly & Jennions 2011; contested).

**Build.** `v2/raffle.js` reuses `optimum()` and `ch9.js`'s `life()` and `opt()`. The L2 benchmark is an expectation over the hidden queue. After L2 an invasion view pits your rule (a + b·rivals + c·risk) against "even split" and "virgin-miser". Oracle: greedy allocation within 1% of the Lagrange optimum.

### 3.6 Alarm Call

**Keep.** The 1.8–3 s decision with the predator closing in; reading kin; Hamilton's rule in Belding's ground squirrels.

**Fix.** Nobody dies; collars give every sister r = ½ and are 2 px rings on 30 px squirrels; the costs (corrected in G3) are told, not discovered; L2 is a worksheet counting only indirect fitness; no invasion view.

**Kin in two seconds (D0 Q3).** Inference and decision are split. In untimed **peace time** litters emerge from natal burrows, each pup wearing its father's face blaze (a designed marker), so two blazes in a litter mean half-sisters (r = ¼); the player tags squirrels on a pedigree panel. In the timed attack squirrels wear the player's tags, not the truth: the 2 s decision reads conclusions already reached, and tagging mistakes cost lives.

**Deaths.** A hawk lifts its victim away (shadow, feather puff); a coyote leaves dust and a darkened burrow. The victim's pedigree node greys out and its gold caller-allele tokens leave the colony jar. If you die, you continue as your daughter.

**Core loop.** Second: read tags, call or stay silent. Minute: one spring (peace, then 4 attacks). Level: new evidence or context.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Peace and alarm | 14 squirrels with a known pedigree; whistle costs 0.08, trill costs 0.22 | Call or stay silent; relatives die when you misjudge. | rB > C, on screen. |
| L2 Who's my sister? | Tag a new spring's litters; multiple paternity | The attacks use your tags. | Identity by descent, inferred, on average. "Half-sisters count half." |
| L3 Two calls | Costs hidden; a tally of callers and silent squirrels caught, by predator | Predict which call is costly, then test it over 10 attacks. | Whistlers escape *more* often (Sherman 1985), so the whistle may be selfish; only the trill needs kin. Testing an adaptive hypothesis. |
| L4 The colony map | Invasion view: your thresholds become sex-limited calling alleles across 6 burrow clusters and 15 seasons; males disperse | Predict which sex ends up calling more. | Calling pays for females, who live among kin, not for dispersing males (Sherman 1977). |
| L5 Help or breed (boss) | Seychelles warbler; a saturated island; helpers can lay eggs in the nest | Each spring, help or disperse. Score counts direct plus indirect gene copies. | This inverts L1–L4: helping can pay with no kin present (Richardson et al. 2001; Komdeur 1992). |

**Screen.** Squirrels at least 7% of canvas width; tags as letters on ear flags ("½", "¼", "⅛", "0"); calls as rings (short and sharp for the whistle, long and wavy for the trill); a large hawk shadow; a coyote stalking the grass.

**Live graph.** A **Hamilton ledger** per attack (rB stacked by relative, against a line at C); the L3 catch tally by predator; L4 calling rates in females against males.

**Stars.** Discover: kin alive and caller copies above a threshold, sex difference seen. Predict: which call is costly (L3), which sex calls more (L4). Transfer: the boss, plus "if females dispersed and males stayed, who would call?"

**Teacher hooks.** The class votes on a projected attack. Questions: "Your sister 'shares half your genes': what does that mean?" (misconception 10). "Is the whistle altruistic? What evidence would decide?"

**In this model / in nature.** *Model:* costs and benefits are fixed; the face blazes are designed. *Nature:* paternity was found genetically (Hanken & Sherman 1981); females treat full and half-sisters differently (Holmes & Sherman 1982); 44% of female warbler helpers bred (Richardson et al. 2001).

**Build.** `v2/alarm.js` reuses `squirrel()` at 2× and the corrected `genRound` costs, plus a pedigree generator. Oracle: the call boundary is exactly ΣrB = C.

### 3.7 The Forager

**Keep.** Diminishing returns the player feels; leaving under a clock; fear of the hawk; the risk-sensitive night.

**Fix.** Simultaneous items on the conveyor let look-ahead beat the scored "best", hidden by the `Math.min(1, eff)` cap (R7 A63); L1 and L3 are one mechanic; a tiny bird; Notes print the optimum; five disconnected birds; the adaptationist step is never shown.

**One day, one map (D0 Q4).** One great tit's day on one panorama (nest, hedgerow, orchard, field) under a moving sun. It does not blur the MVT lesson: each act holds all but one variable fixed and draws its own gain curve from the player's data. **Encounters become sequential on the hedgerow:** prey appear one at a time ahead of the hopping bird after random search intervals, each visible for 1.2 s; take it or let it pass; eating locks the bird behind a chewing bar.

**Core loop.** Second: take or skip. Minute: one trip or one tree. Level: one act of the day.

| # | Act | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Dawn: beakfuls | Near and far patches; grubs carried to chicks | Predict the best load for the far patch; the tangent snaps onto your own data points. | Central-place foraging (Kacelnik 1984). |
| L2 Morning: the hedgerow | Big and small caterpillars arrive in sequence; big ones scarce, then common | Take or skip; profitability bars rank the prey. | The zero–one rule: whether to take small prey depends on how often big ones come. Real tits show partial preferences (Krebs et al. 1977). |
| L3 Midday: the orchard | Rich and poor trees; varying travel times | Predict when you will leave; your departure dots appear against the tangent. | The marginal value theorem (Charnov 1976). |
| L4 Afternoon: the hawk | Vigilance or feeding; hedge or open ground | Chicks need N grubs; the hawk is rare, then common. | Predation risk shifts the best choice (Lima & Dill 1990). |
| L5 Your rule as a gene | Invasion view: your L3 leaving rule against "leave after 5" and "leave at 10 s" | Predict the winner, then watch 30 generations. | Selection makes birds behave as if they compute tangents. |
| L6 Winter night (boss) | A survival threshold; steady against variable feeders at dusk | Choose feeders to survive the night. | Near starvation the gamble makes sense: survival, not rate, is the currency. Scored inside the model only; the energy-budget rule is contested (Kacelnik & Bateson 1996). |

**Screen.** The bird at least 10% of canvas width with grubs dangling from its beak; chicks that gape and fatten; dusk grading and a hawk shadow; the gain curve drawing itself from the player's own pecks.

**Live graph.** A gain curve per act, tangent drawn from travel time; take/skip dots on profitability bars; L5 lineage share.

**Stars.** Discover: chicks fledged and the night survived. Predict: the L1 load and the L3 leaving time. Transfer: the boss, plus "travel time doubles: drag your new leaving point."

**Teacher hooks.** A class orchard puts everyone's leaving times on one curve. Questions: "Birds don't calculate tangents; why do they act as if they do?" "Why might tits still take small worms?"

**In this model / in nature.** *Model:* gain curves are designed; the bird knows its travel times; the boss is solved by dynamic programming. *Nature:* Cowie (1977) tested the MVT in great tits; Caraco et al. (1980) used juncos.

**Build.** `v2/forager.js` reuses `delay()`, `optRate()`, the diet rule λE/(1 + λh), the hawk level and the V(e, t) recursion from `ch3.js` and `ch9.js`, and drops the cap. Oracle: for G(1 − e^(−t/τ)) with τ = 4, the best stay is 3.4 s at T = 2 and 6.5 s at T = 10.

### 3.8 The Clinic

**Keep.** Clear doses; a real toxicity-versus-cure trade-off; failure you can read (the infection turns red); the TB anchor and combination therapy.

**Fix.** One optimal sequence per level (R7 CL6); daily dose switching without pharmacokinetics or adherence; no horizontal gene transfer (CL4), ward or visible selection window; only "hit hard" works; red against green carries meaning.

**Core loop.** Second: drag dose blocks (size, interval) onto a 10-day strip. Minute: run it; a concentration curve sweeps past two lines, the susceptible MIC and the mutant-prevention concentration, with the **mutant selection window** between them hatched, while cells die or multiply on the canvas. Level: one new factor.

**Ward and pathogen (D0 Q5).** A 6-bed bay (L4) and a 12-bed ward (L5). The pathogen is KPC-carrying *Klebsiella pneumoniae*, whose carbapenemase plasmids move between Enterobacterales and between patients; it stays separate from the chromosomal TB story (CL4).

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The course | TB, one drug | Predict the resistant share at day 10; watch the curve sit in the window. | The mutant selection window (Drlica & Zhao 2007): "low doses breed mutants". |
| L2 Two drugs, a forgetful patient | Combination therapy; each dose is missed with probability 15% (tagged) | Missed doses leave gaps in the curve. | Combinations tolerate lapses; a single drug plus lapses means time spent in the window. |
| L3 Already there | Two patients: one with 3% standing resistance, one with none | Choose aggressive or containing regimens; in this model containment wins for the first, hitting hard for the second. | Competitive release: whether resistance is already present decides (Read, Day & Huijben 2011; contested). |
| L4 The bay | 6 beds; a KPC plasmid; tools: hand hygiene (staff time), 2 isolation beds, screening swabs | Contain the spread. | Resistance travels between bacteria and between beds; the patient is not resistant, their bacteria are. |
| L5 The long winter (boss) | 12 beds, 90 compressed days; restrict the drug | Predict the decline. Resistance barely falls, because the plasmid's cost has been compensated. | This inverts "stop using it and it disappears" (Andersson & Hughes 2010). |

**Screen.** Susceptible cells as blue circles, resistant as orange spiked rods, plasmids as rings inside cells; a ward map of beds with load bars, plasmid icons and contact lines following staff; deteriorating patients go to intensive care; nobody dies on screen.

**Live graph.** Log load against the immune threshold; resistant share; in L5, ward prevalence against a dashed "no transfer" ghost.

**Stars.** Discover: cures in L1–L2, window seen. Predict: the day-10 share and the L5 decline. Transfer: the right regimen for a new culture, and L4 containment.

**Teacher hooks.** Teams treat one ward on a shared seed (R8). Questions: "When might 'hit hard' backfire?" "'My body became resistant': what is actually resistant?" (misconception 12).

**In this model / in nature.** *Model:* one-compartment pharmacokinetics; designed MICs; transfer rates tagged ×N; Poisson-drawn mutants, so plates differ Luria–Delbrück style. *Nature:* the best course length is still debated (Llewelyn et al. 2017).

**Build.** `v2/clinic.js` reuses the TB `step()` and adds a pharmacokinetic module and an agent-based ward. Oracles: untreated growth; double mutants at about the product of the single-mutant rates.

### 3.9 Switches

**Keep.** A construction toy with instant causation; posterior prevalence; the Pitx1 lesson (enhancer modularity against coding pleiotropy).

**Fix.** No A1 column, so target 4 teaches wrong biology (R7 M2; G2); colinearity stated but never played; crude ellipse flies; L2 is one choice plus a quiz; no selection step.

**Core loop.** Second: paint a cell or drag a gene's boundary. Minute: the larva's denticle belts change, then the adult hatches. Level: a new rule or body plan.

**Canvas2D is enough (D0 Q8).** A 2.5D side view: larva and adult built from segment templates with parametric appendages, morphing between states. No Three.js.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Paint the segments | Columns: head, T1, T2, T3, **A1**, A2–A7, A8. Rows: Scr, Antp, Ubx (off/low/high), abd-A, Abd-B. Ubx low gives T3 identity; Ubx high gives A1 (no legs). | Build bithorax and Antennapedia; the larva appears first, then the adult. | Selector genes; posterior prevalence. |
| L2 Legs on the abdomen? | Target: legs on A1 | Tap the segments you predict will grow legs without abd-A. None do; the real route is Ubx low in A1. | Losing abd-A gives legless A1-like segments (Sánchez-Herrero et al. 1985); a Ubx change in A1 gives T3-like legs (Lewis 1978). Hox genes *suppress* abdominal legs. |
| L3 Colinearity | A chromosome strip, with lines fanning out to each gene's boundary on the body | Given a mutant, find which boundary moved; crossed lines mean a transformation. | Gene order on the chromosome matches order along the body. |
| L4 Body plans | Four crustaceans | Shift the Ubx/abd-A boundary to turn thoracic legs into feeding legs. | Boundary shifts track crustacean body plans (Averof & Patel 1997). |
| L5 The circuit board | Pitx1 with pituitary, jaw and pelvic enhancers | Cut modules and watch tissues light up or fail; scored on pleiotropic damage. | Enhancers are modular; coding changes are pleiotropic. |
| L6 The lake (boss) | You set the predators: trout or dragonfly nymphs | A recessive pelvic-deletion allele arises by recurrent mutation (×N). Predict its frequency curve. | Selection depends on context, and a recessive allele starts slowly (an echo of the Black Country). |

**Screen.** A letter plus a colour in every gene cell; hatching (the pupal case cracks, wings unfold); an identity row (leg, wing, haltere, none) above the segments; a stickleback lake for the boss.

**Live graph.** The identity row and the colinearity fan; in L6, allele frequency against a dashed dominant ghost.

**Stars.** Discover: target flies built. Predict: the L2 taps (Hamming distance) and the L6 curve. Transfer: L4 and L6.

**Teacher hooks.** A mutant line-up: the class guesses the gene. Questions: "Why are whole-segment changes rare in evolution but enhancer changes common?" "If Hox genes switch legs off, why aren't legs everywhere?"

**In this model / in nature.** *Model:* five genes, seven segments, a designed two-level Ubx dose, no parasegments; many such flies would die as embryos, which is why biologists read the larval cuticle. *Nature:* the deletions show positive selection (Chan et al. 2010); "fragile DNA" is contested; pelvic vestiges are larger on the left (Shapiro et al. 2004).

**Build.** `v2/switch.js` reuses `SEG`, `HOX`, `ident()` and the Pitx1 options, and rebuilds `fly()`; the lake uses a Gen `dom` locus. Oracle: the identity table for every grid state.

---

## 4. Answers to D0 §8 (D1)

1. **Pilot:** yes; the Wood exercises every template element. Build it as a plain-JS v2 plug-in first, then R6's TS/Pixi spike ports it.
2. **Hawks:** the duel sets the lineage rule; the beach plays it (§3.4).
3. **Alarm:** untimed peace-time tagging; deaths as snatches and greyed pedigree nodes (§3.6).
4. **Forager:** no blur (one variable per act); the hedgerow makes encounters sequential (§3.7).
5. **Clinic:** 6-bed bay, 12-bed ward; KPC *K. pneumoniae* (§3.8).
6. **Raffle:** the Drum; mimicry collapse in §3.2.
7. **Jaws:** yes; untimed guard tokens (§3.3).
8. **Switches:** Canvas2D is enough (§3.9).

## 5. Pilot gates and build order

**Wood gates (five-player tests):** median first action under 10 s; at least 60% explain S and R after L1; most see the rare morph rise in L3; no bot earns three stars; 60 fps with 300 eggs plus particles.

**Suggested order (D2 decides):** Wood → Bitter (Hunt extensions) → Hawks → Jaws (triangle) → Forager → Raffle (tangent) → Alarm → Clinic → Switches.

## 6. New claims to verify before build (Coordinator A)

Claim, then source to check:
- Jays form search images: Pietrewicz & Kamil 1979, *Science*.
- Aggregation lets warning signals spread: Alatalo & Mappes 1996, *Nature*.
- Imperfect mimicry and relaxed selection: Sherratt 2002, *Proc R Soc B*.
- Selection in a warning-colour hybrid zone: Mallet & Barton 1989, *Evolution*.
- Two scale-eater species swing together: Hori 1993 (else Jaws L4 is labelled a model prediction).
- The lizard cycle's period: Sinervo & Lively 1996.
- Share of multiply sired Belding's litters: Hanken & Sherman 1981.
- A great tit test of the MVT: Cowie 1977, *Nature*.
- KPC plasmid transfer within a hospital: Conlan et al. 2014, *Sci Transl Med*.
- Compensated costs keep resistance after withdrawal: Andersson & Hughes 2010; Sundqvist et al. 2010.
- Crustacean Hox boundaries track body plans: Averof & Patel 1997, *Nature*.
- Left-biased pelvic vestiges: Shapiro et al. 2004.
- Peppered moths lay hundreds of eggs: a standard source.
