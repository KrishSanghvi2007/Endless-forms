# D1. The favourites, redesigned, and the gold-standard chapter template

*Lead game designer with an evolutionary biologist. **Round 2**, revised after Coordinator B's cross-review of D1–D4. Follows `D0_design_brief.md` (D0 wins any disagreement), its §3, and the cross-cutting decisions recorded by Coordinator B (cited below as "binding decision"). New claims are listed in §6 for Coordinator A. Code references are to `games/endless-forms/source/` as of sweep G7. Numbers marked **(checked)** come from simulations run for this revision (`scratchpad/d1r2/`: `wood_l12.py`, `wood_l3*.py`, `lizard3.py`); they are model results, not field data, and the oracles in §3 restate them so anyone can rerun them.*

## 0. What this document decides

- **One rule explains the favourites and becomes the template:** *the player pursues the selective agent's own goal (a meal, a shell, chicks, a cured patient); evolution happens to the population as a by-product the player sees, predicts and explains.* Lichen Wood ("camouflage reaches 75%") and Bitter Wings ("resemblance reaches 70%") now star the prey's goal, which no bird wants; the redesigns score the bird's meal.
- **The template (G1–G12) binds every Wave 2 spec.** D3 owns every non-favourite unit (binding decision); D1 reviews each D3 spec against G1–G12 before build, in D3's order (Mixer and Drift Casino first). A unit that cannot name a per-second verb with feedback within 200 ms, and a felt cost that grows as the population adapts, is built as Tangled Bank scenario cards (G3).
- **Ownership.** D2 schedules (its Phase 1 slice is Lichen, Soot, Mixer, Casino, Hawks) and approves organisms. D4 owns every look; colours and shapes here follow D4's rulings: "yours" is the **you-halo**, never gold; two-strategy rules are blue/amber plus a shape; three-morph systems keep natural paint with pattern and letters; entities read by the player are ≥7% of the stage unit; canvas text ≥12 px.

## 1. Compliance with D0

### 1.1 How RC1–RC7 are removed

| RC | Removed by |
|---|---|
| RC1: the player calculates; the population does not respond | Every level ends in a population change the player caused. In-world currencies (chicks fed, eggs fathered, kin alive, patients cured) replace "% of best"; optima only in the debrief; invasion views run on real choices. The Clinic's plan strip is retired for live dosing. A bot sweep (G12) fails any level a fixed strategy can three-star. |
| RC2: the player is the evolving organism | The player is the selective environment (Wood, Bitter, Jaws L1–4, Clinic, Switches L6), a behaving animal whose rule then competes as an allele (Hawks, Raffle, Alarm, Forager, Jaws boss), or an investigator with a budget (Wood L6). |
| RC3: text before play | First action within 10 s, after at most 40 words; predictions are gestures; dusk replaces interlude cards; `TRANSFER.soot` and `TRANSFER.clinic` are rebuilt as each chapter's opening prediction gesture (D2 §8), then deleted as cards. |
| RC4: the concept is in the caption | Actors ≥7% of the stage unit; graphs form out of the organisms; the lens, drum, ward map and larva carry the concepts. |
| RC5: no escalation, a dominant strategy | 4–6 levels, one new variable each, ending in a boss that inverts the lesson; a bot sweep in CI; the G3 fun gate. |
| RC6: model, text and evidence disagree | A MODEL card per level with ×N tags; contested ideas (hit hard, the energy-budget rule, smaller ejaculates at high competition, imperfect-mimicry explanations, Pitx1 "fragile DNA") scored only inside the model. Every "the immune system helps" line now has a parameter that makes it true. |
| RC7: no spine | Shared widgets (§2.1) and planned echoes: Wood L2 ↔ Jaws L3 (heritability); Black Country ↔ Switches L6 (slow recessive start); Black Country → Lottery of the New (the surviving copy); Raffle L3 ↔ Forager L2 (the tangent); Wood L3 ↔ Jaws L5 (the morph triangle); Bitter L4 → Tangled Pairs (the supergene); Clinic L3 → the Tumour side quest (adaptive dosing). |

### 1.2 Section 3 is respected

All models and text obey D0 §3. Carbonaria has one origin; it enters as one tagged copy, shown at q = 0.05 with the disclosure that this conditions on the copy that escaped loss, and its copy share is shown below the black share. Batesian mimics do best while rare relative to models. The hawk whistle is cheap and self-preserving (its cost is negative in the model) and the coyote trill costly and nepotistic. Relatedness is identity by descent, on average, with multiply sired litters. Hermit crabs fight over shells, and a mixed ESS is separated from a polymorphism. Jaw twist is continuous, mostly one-flanked, with low heritability. Losing abd-A gives legless A1-like segments; a Ubx change in A1 gives legs; Hox genes are "selector genes"; regulation explains "many" changes of form; Pitx1 loss removes pelvic spines. Antibiotics mostly select resistance that already exists. The rock–paper–scissors cycle has an input floor (D0 guardrail). Contested ideas earn no star. Unrealistic parameters carry ×N tags, history is labelled compressed, expected values are dashed ghosts.

---

## 2. The gold-standard chapter template

Every Wave 2 chapter, D1's or D3's, meets G1–G12; §3's favourites are worked examples; D4 owns layout.

**G1 Role.** One of four roles (amended by binding decision):
1. the **selective environment** (predator, drug, lake);
2. a **behaving animal** (crab, squirrel, bird, male fly) whose rule then reappears as an allele in a visible population (the invasion view, G7);
3. an **investigator with a budget** (Wood L6; D2's Census; D3's Dig and Pseudoreplication Trap);
4. an **experimenter who releases a variant** and lets selection decide (D3's Two Sizes, Lottery of the New, Placenta).

In roles 3 and 4 the data come from a visible simulated population and the player never picks winners. The player never dials an organism's own heritable trait.

**G2 Goal = the agent's goal.** Score in an in-world currency; evolution is what the player notices, not what they are paid for. As the population evolves the player's job usually gets harder: the arms race all the favourites share.

**G3 Three loops (mandatory in every spec).** Each spec states the **second** (the verb, with feedback within 200 ms), the **minute** (one generation or round, ending in a visible population change) and the **level** (one new variable). Each loop contains a decision that can go wrong. **Fun gate (binding decision):** a unit with no per-second verb, or no felt cost that grows as the population adapts, is built as Tangled Bank scenario cards; a unit that fails the five-student "boring" flag twice is demoted to scenario cards or the appendix.

**G4 The first 10 seconds.** No card before the first action; at most 40 words in the HUD strip over a 3 s ghost-hand demo (D4 §7); the first action cannot fail; generation 1 is the tutorial; vocabulary follows the phenomenon.

**G5 Prediction is a gesture.** Before each reveal the player drags a ghost marker onto the live graph (a histogram mean, timeline crossing, share bar, triangle point or map region), scored by distance in the graph's units against a tolerance band revealed afterwards. A two-option choice is not a gesture: where the lesson is a direction (which pattern moves, which call is costly), the gesture places a magnitude whose sign or position carries the direction.

**G6 Live graph and reveal ladder.** One live graph per chapter, beside the canvas on desktop and in D4's pull-up strip on phones; it never pauses play. Realised values solid, the expected ghost dashed, a "you" marker. Every level reveals in this order: (1) the world changes; (2) the sprites slide into the graph; (3) a number appears in the HUD; (4) its name; (5) the equation, behind a "Why?" chip. The Notes sheet UI is retired; `notes()` survives as the LiveGraph data provider (G12).

**G7 Invasion view (behaving-animal chapters).** A 60–90 s second act: the player's rule, fitted from the action log (e.g. P(Hawk | role)), seeds a lineage wearing the you-halo among AI rules; the player predicts, then watches 20–50 generations at speed. Animals behave *as if* they optimise, with nobody computing. Haploid lineages run on the shared seeded Wright–Fisher helper `WF` (§2.1); `Gen` stays the only diploid engine.

**G8 MODEL card.** Every level has a card behind a chip: what is simulated; the key simplification; a parameter table tagged "realistic", "designed" or "×N"; what the model cannot show; "In nature", including the debate. Every claim carries a `refs` id. Contested ideas carry a badge, and no star depends on them.

**G9 Failure.** "Interesting result" in ≤25 words (D4), then a **What if?** button. What if? is the freezer (D2 §1, adopted): "thaw the generation-4 sample, change one thing" (h² = 0, twice the models, no standing resistance). Loss is visible on the canvas: a ghost ring where a squirrel was, an empty nest, a turbid dish. No on-screen human death anywhere; patient outcomes are tallies on pictograms (D4 rule 10).

**G10 Stars, scored on understanding.** **Discover:** the in-world goal is met and the phenomenon witnessed (detected automatically, e.g. "three morphs persisted for 4 generations"). **Predict:** at least two of three gesture predictions within tolerance, always scored against the **expected** outcome given what the player could see (replays at the player's own fitted rule where the rule matters), never the realised run; this holds in Realistic mode too. **Transfer:** the boss, or a new-situation gesture, solved. Speed counts only where efficiency is the concept (Forager, Raffle). Accessibility and Calm settings never reduce stars.

**G11 Teacher hooks** (D2 roadmap, D4 layout). Projector mode (16:9, high contrast, answers hidden, keys for pause, step, speed, reveal); a shared-seed link; a class pool where each student's run is one dot or line on the projected graph; three discussion questions rising in Bloom level, one a model critique; CSV export; a one-page instructor note.

**G12 Engineering** (checked against `build.py`, `ui.js`, `ch99.js`, `hunt.js`, `boot.js`).
1. **One scope.** `build.py` joins `core.js`, `hunt.js`, `ui.js`, `ch1`–`ch29`, `ch99`, then `v2/*.js` sorted by file name, then `boot.js`, inside one `'use strict'` IIFE. A v2 file cannot redeclare `const CH_LICHEN` (a SyntaxError that breaks the whole build): use new names (`CH_LICHEN_V2`) and register with `V2.push(...)`; the same `id` replaces the old chapter at `reg()`.
2. **Load order.** Prefix shared files with numbers: `00_fx.js`, `01_widgets.js`, `02_hunt_ext.js`; chapter files (letters) sort after them. A `const` is in the temporal dead zone until its line runs, so a top-level reference from an earlier-sorting file throws; unnumbered names would do exactly that (`00_hunt_ext` sorts before `00_widgets`).
3. **Boot checks.** `boot.js` throws unless every chapter has `intro.goal` and every non-Hunt chapter has `start`, `update`, `draw` and `notes`. Keep `intro.goal` (≤15 words; reused as the map caption) and keep `notes()` as the LiveGraph data provider (`{charts, stats}`), which D4's interim desktop layout mounts live.
4. **Entry and end (FCR-12).** `App.open` always shows the intro card, and `ch99.js` wraps it with TRANSFER and RECALL cards. v2 files load after `ch99`, so a wrap in `v2/00_fx.js` is the outermost: for any chapter with `ch.v2` it runs the star migration (item 8) and calls `App.play(ch)` directly. `End.show` is wrapped the same way to draw the v2 end card; because that skips ch99's end wrap, the v2 wrap must set `Save.d.done[id] = 1` itself, or RECALL and later TRANSFER gestures never see the chapter as done.
5. **Hunt.** `02_hunt_ext.js` wraps `Hunt.interlude` (outermost, after ch99), so `ch.v2` chapters run dusk in the canvas; this also bypasses ch99's Lichen predict card. `Hunt.endRound` skips `interlude` when `Save.d.quick` is set, so v2 `setup()` forces `Hn.quick = false`. ch99's `Hunt.nextGen` wrap stays inert because `_pred` is never set.
6. **Engines.** Every `Gen` extension (linked loci, multi-allele, ploidy, lineage ids) is opt-in and draws no extra `R()` when absent, so v1 golden trajectories do not change. `Gen` is the only diploid engine.
7. **Code shape.** A `sim` object (`step`, `act`, `snapshot`) with plain JSON state, no DOM, seeded `R()` only, and an action log, so a run is `(seed, actions)`; all words in one content object; tunables in `P` as `{v, tag, min, max}`.
8. **Learning layer (D0 §6.2).** Overwrite `TAKE` (≤20 words), `MODEL`, `RECALL` and `BRIDGE`. Rebuild each `TRANSFER` whose target is a favourite (`soot`, `clinic`) as that chapter's opening gesture, then `delete TRANSFER[id]`. ch99's patches to old objects are lost with them (`CH_SOOT.intro.how`'s compression note moves to the soot MODEL card). On first v2 play move `Save.d.stars[id]` to `Save.d.v1stars[id]` and clear it, because `Save.star` only raises; D2's versioned save key supersedes this when it ships in Phase 0.
9. **v1 stays reachable.** `?v1=1` makes `v2/zz_v1switch.js` (sorts last) empty `V2` before `boot.js` registers it, and switches to a separate save key, so v1 and v2 run side by side for golden trajectories and the star migration (R6 §6 Stage 0).
10. **Scene lab (R6 §7).** `?lab=<id>` (dev builds only) opens a chapter with a DOM panel of sliders generated from `P`, a seed box, and a replay box that loads `(seed, actions)`, so the designer can tune a boring level by feel; a classroom bug report is a pasted replay code.
11. **Tests.** A Node oracle (`tests/oracle_<id>.js`); a **bot sweep** (always-A, always-B, random, greedy-now, fixed threshold) where no bot earns three stars; a monkey pass; screenshots at 390×780, 1024×768, 1280×720; golden trajectories of the ten v1 favourites recorded **before** any v2 replacement lands.
12. **Access.** A keyboard map (arrows, 1–9, space), a tap alternative to every drag, an untimed mode for every reflex chapter (specified per favourite in §3), and for camouflage the non-visual detection-rule path (D2 §13).

### 2.1 Shared widgets (D1 behaviour, D4 look)

In `v2/01_widgets.js`.
- `LiveGraph`: draws D4's chart set (its six types plus the scatter and GenomeStrip added by binding decision): dot-histogram (eaten hollow, spared solid, offspring hatched; S and R arrows), allele bar p|q, trace with ghost, triangle (de Finetti with the HW curve, or a morph/strategy simplex without it, with trail), PriceBars, tree and deme map, scatter, GenomeStrip. Takes `ghost` and `you`; a data-table twin for screen readers.
- `Predict`: `Predict.ask({kind, axis, tol})` puts a draggable ghost on the live graph and returns the error; a soft 6 s timer in timed modes.
- `GenePoolLens`: LOOK, GENES (two lettered allele tokens per organism) and JARS (alleles fly into jars showing q), porting the jar effect from `equilibrium-hw/source/engine.js`; paired with a triangle HUD plotting the population at dawn (after mating) and dusk (after selection).
- `Invasion`: `Invasion.run({rules, you, gens, payoff})`: a strip of 200 tokens; your lineage haloed against a dashed neutral expectation.
- `WF`: one seeded Wright–Fisher/multinomial helper for haploid lineages (Invasion, Lottery of the New, Casino jars).
- `Ledger`: the last 10 outcomes of a risky act (taste, call, dose); old tiles fade, standing in for memory.
- `PriceBars`: ported from `tangled-bank/source/steward.js` for D3's Commons rebuild.
- `Pin` (moved out of the Hunt extension, binding decision): long-press pins an individual of any population, Hunt or `Gen`-backed (D3's Lottery, Harvest, Slow Island); its phenotype is fixed for life, a thread runs to its offspring, and D2's specimen drawer reads it.
- `Evidence` (new; adopted from D2's Census and D3's Pseudoreplication Trap, Manhattan Hunt and Sweep decoys): buy instruments from a budget (field days), a power meter computed from the simulated effect and n, and a conclusion with confidence scored by Brier score against the model's truth. Used by Wood L6 and those units; D1 owns its behaviour.
- `PedigreeView` (new): a family tree with identity-by-descent path counting, multiple paternity, tags the player places, and hollowed nodes for the dead. Used by Alarm's peace time and by D2's Pedigree, D3's Royal Line, Invisible Carriers and Hive.
- `SceneLab` (dev only): G12 item 10.

### 2.2 Hunt extensions (D1 owns)

In `v2/02_hunt_ext.js`, wrapping `Hunt` methods the way `ch9.js` and `ch10.js` wrap chapters. Every field is opt-in, so old chapters run unchanged:
- `bag:{need, chicks}`: a morning quota feeds a HUD row of chicks; a shortfall starves one.
- `barks:[{tex, mask}]`: backgrounds composited through a `makeNoise` mask; `match()` uses the bark under each moth.
- `searchImage:{streak, switchCost, glintAfter}`: the same morph again is quicker; switching costs a refocus blur.
- `trunks:{n, hunted, ghost}` (new): the wood has n trunks; the player hunts one per morning; at dusk the others are hunted by ghost jays that replay the player's fitted diet rule (§3.1, L3).
- `species:[{key, N, traits, toxic, cost, sprite}]`: several evolving populations, each bred from its own survivors.
- `modelCount(Hn)`, `toxicity(Hn)`: model numbers and taste costs that change within a level.
- `lens`: the gene-pool lens on Hunt populations (`Pin` is now generic).
- `overproduce:{eggs, K}`: survivors lay eggs at dusk, drawn as crowd-tier batched dots at the simulation's true 10:1 ratio (D4); a winter cull removes eggs at random down to K.
- `predict:{kind, tol, from}`: a dusk prediction gesture.
- `untimed:{looks}` and `detectRule`: an attention budget in place of the clock, and the non-visual path in which the player sets the bird's detection rule and watches it select (D2 §13).
- `net:{width, mesh}` (new, for D3's Harvest): a swept net in place of the tap.

---

## 3. The nine favourites

Each entry gives D3's size key for its chapter file (S, M or L) and its TAKE line (≤20 words, D4).

### 3.1 The Wood: The Lichen Wood and The Black Country (one arc, two ids, the template pilot)

**Keep.** The procedural bark (`barkTex`), `mothSprite` and the soot crossfade; the 12 s morning and the half-second miss penalty; S, R and h² from the player's own hunting; the arms race (better-hidden moths mean harder breakfasts).

**Fix.** *Science:* apostatic selection cited but not modelled (R7 A29); h² fixed near 0.95; S measured on tone while the player is asked about camouflage (G6 #3); no lag in the Black Country (bark cleans 40% a generation); dominance only in words; overproduction invisible (N fixed at 30; R8 D2); nothing follows an individual; the title says the Black Country while the premise says Lancashire (R7-R4 C10/D17). *Feel:* stars pay for the moths' goal; text cards for prediction and interludes; no escalation.

**World.** A wood in the Black Country, near Birmingham, where Kettlewell ran his 1953 release experiment. The Archive card carries the first recorded black specimen (Manchester, 1848) and Manchester's ~98% black by 1895.

**One genome across both ids (binding decision).**
- *Tone:* polygenic, additive (4 `Gen` loci); `ve` set per level to give the stated h².
- *Morph loci:* two dominant loci in a hierarchy: A_ dark-banded, aaB_ pale-mottled, aabb grey-speckled. Morphs differ by banding, mottle and speckle stencils (a pattern channel), never by hue.
- *Carbonaria:* a third dominant locus C, epistatic over everything (C_ is black whatever A, B and tone).
- In L0–L2 every moth is aabb cc, so only tone varies. The rare morphs arrive in L3 with the wider wood. `soot` starts from the player's saved L3 wood: its tone background, morph loci and pinned lineages, plus one tagged carbonaria origin. Teacher mode forces the canonical seed.

**Core loop.** *Second:* scan, tap, peck burst (beak shadow 90 ms, three dust puffs, D4 §5.3); the same morph is quicker to catch again. *Minute:* a 12 s morning with a quota that feeds four chicks; then dusk plays in the canvas: spared moths lay eggs (300 batched dots for the 30 places on the trunk in view), a random winter cull leaves K, the morning's moths slide into the live graph with S and R arrows, and on prediction generations the player drags a ghost. *Level:* one lever each. The `lichen` id holds L0–L3 in a **15-minute time box** (3, 5, 4 and 6 generations; about 10.5 minutes of play for a competent player, leaving slack); `soot` holds L4–L6.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L0 Too many moths (Act 0 hook; 3 gens) | Morning 1: 8 conspicuous moths, the clock at ×0.6 (20 s), quota 4: it cannot fail (D4 §7). Four survivors lay 300 eggs; the winter cull leaves 30. Mornings 2–3: 30 moths, quota 15; pin a moth. | Most moths die whatever you do; the pinned moth never changes colour, while its young vary around it. | Overproduction and carrying capacity; individuals don't transform, proportions shift (misconceptions 1 and 3). "I only tilt which ones die." |
| L1 The Lichen Wood (5 gens) | One pale bark (tone 0.85 on the 0–1 dark-to-pale scale); one morph; tone starts at mean 0.30, every moth darker than the bark; h² = 0.8 set through `ve`; hue and mottle fixed. What if? buttons (D2 §9, folded in): **no variation**, **no inheritance** (h² = 0), **eat at random**. | Three histogram predictions (drag the offspring-mean ghost); then R/S is named. Each What if? thaws the last generation and reruns it: no variation or eating at random gives "Interesting result: nothing moved"; no inheritance resets the young to the old mean. | R = h²S on the camouflage index the meter shows. With one bark and every moth darker than it, the index (tone ÷ 0.85) is a linear function of additive genotype plus noise, so the breeder's equation applies. Selection needs variation, inheritance and differential survival (D2's Act 0 goal). |
| L2 Mixed diets (4 gens) | Larval diet adds environmental variance: `ve` raised so h² ≈ 0.3 ("designed") | Strong S, but predictions overshoot until the player shrinks them. | "Selection moves only what is inherited." |
| L3 Two barks (boss; 6 gens) | The whole wood: 120 moths on four trunks (two birch, two oak), K = 120. Your 30 join 90 from the other trunks. Grey-speckled aabb is the common start (80%); dark-banded A_ and pale-mottled aaB_ are 10% each and **dominant**, so selection on them shows at once. Search image on. You hunt one trunk a morning (30 moths, quota 15); at dusk three ghost jays hunt the other trunks at ×4 in thumbnails, replaying your diet rule. | Tap a point on the morph triangle for generation 6 (most tap near the best-hidden corner, or near the start). The streak bonus pays for hunting the common morph; your diet dots sit above the diagonal; the rare morphs rise and all three persist. Scored against 200 replays at your own fitted rule. | Apostatic selection maintains a polymorphism (Bond & Kamil 1998, 2002). This inverts L1: selection need not produce one best form. "I kept the rare ones alive by hunting what was easy." |
| L4 The Black Country (Act 4) | Opening gesture (TRANSFER.soot rebuilt, D2 §8): soot settles over your 120-moth L3 wood (D2's dark-bark rerun), and before the first sooty morning you drag the tone-histogram ghost to where tomorrow's moths will be. Carbonaria enters as one tagged origin shown at q = 0.05, labelled "history compressed: the copy that escaped loss", with an echo link to Lottery of the New. Gene-pool lens; one pale migrant a generation from cleaner woods. | Predict when black passes 75%; in GENES view, pale copies glow inside black heterozygotes. | Every C copy shows, so the rise is fast; the copy share sits below the black share; the triangle dot leaves the HW curve at dusk and returns at dawn ("a good fit at dawn doesn't mean no selection"). |
| L5 Clean air (boss) | Soot stops; lichen regrows over about 5 generations ("history compressed") | Predict when black falls below 50%. Players expect a mirror of the rise; instead black lingers (for example 95% → 93% → 91% → 86%) before plunging, and the three pale morphs you kept in L3 reappear, because C was epistatic over them. | Pale shows only in cc moths (two typica copies), so the decline lags for genetic as well as ecological reasons. "It rose in a flash and fell in slow motion." |
| L6 The evidence (Transfer; investigator role) | Kettlewell (Birmingham 1953, Dorset 1955), then Majerus (2001–2007; Cook et al. 2012). The `Evidence` widget samples the population **you** evolved in L4–L5 (D2's persistence plus D3's Dig: "you make the record"); AI birds; a small true survival difference. | Buy release density, resting sites (natural or trunk) and sample size within a budget, watching the power meter; then state a conclusion with confidence (Brier-scored). | How the evidence was gathered and why it was disputed (Cook et al. 2012). |

**L3's ghost jays.** Moths resettle at random across the four trunks each night. The trunk you hunt holds 30 moths; the other three trunks are hunted the same morning by three jays that use your rule: on each trunk, the catch share of morph *i* is proportional to *d_i* × *a_i*^*b*, where *a_i* is its share on that trunk, *d_i* its designed mean detectability over the two barks (within ±10% of each other), and *b* your search-image strength, fitted by maximum likelihood from your last three mornings (45 catches) and clamped to 0.5–3. The live graph's diet–availability scatter shows your dots and that fitted curve, so *b* > 1 is visible as the apostatic signature. The MODEL card says plainly: "designed: your rule stands in for every jay in the wood". `soot` uses the same jays, fitted on black against the pale morphs.

**Why these numbers (checked).**
- *K = 30 cannot hold three morphs.* With a bot that always takes the commonest morph, a morph is lost by generation 20 in 20% of 600 seeds when the rare morphs are dominant, and 47% when one is the double recessive (the round-1 design). A one-migrant-a-generation floor only cuts the 20% to 13%. A softer search image (*b* = 2) loses a morph in 40% of seeds (25% with the floor).
- *One trunk of 120 with the rest unhunted is too weak.* All three morphs stay above 10% (generations 6–20) in only 40% of seeds; grey-speckled is still 66% at generation 6.
- *The specified design passes.* 120 moths with ghost jays at *b* = 2: all three morphs stay above 10% from generation 6 to 20 in 98% of 400 seeds, and none is lost (mean shares at generation 6: 0.33, 0.27, 0.41). At *b* = 1.5 the figure is 84%.
- *The failure branches are real.* With no search image (*b* = 1) drift loses a morph in 82% of seeds, and if one morph is 40% better hidden it takes over (86% by generation 20); a bird that eats the rare (*b* = 0.5) loses both rare morphs in every seed. These are L3's What if? reruns.
- *L1–L2 obey the breeder's equation.* Over 500 seeds with a soft visibility bot, mean R/S is 0.74–0.77 in L1 against a mean per-generation h² of 0.71–0.74. h² starts at 0.8 and falls as selection and drift use up additive variance, so the HUD shows each generation's h². In L2, R/S is 0.30–0.31 against an h² of 0.28–0.29. Fewer than 1% of moths ever reach the bark's tone.

**Screen and juice.** Moths ≈8% of the stage unit (the bark scrolls on phones) with real banding, speckle and mottle; D4 §5.3's timings are acceptance criteria (beak shadow 90 ms, three puffs in 300 ms, chick pop 220 ms, egg dots at a 20 ms stagger, Calm-mode equivalents); soot particles (≤40 flecks); lichen regrowing as `barkTex`'s coverage threshold rises; eggs blinking out; a chick row that fattens. Every sound has a visual twin. Tone is luminance and hue is never selected, so colour-blind players face the same task; morph identity rides on pattern (R8 §4 shape channel; D4 rule 5).

**Live graph.** L0: egg and survivor bars. L1–L2: the dot-histogram. L3: the morph triangle with trail, plus the diet–availability scatter (each morning adds three dots: a morph's share of your catch against its share on the trunk, with your fitted curve). L4–L5: black share (solid), q (dashed) and the 1 − (1 − q)² ghost.

**Stars.** *Lichen:* Discover = chicks fed and three morphs present at the end of L3; Predict = three of four histogram predictions within 0.5 SD; Transfer = the L3 triangle prediction plus a "What if h² = 0?" gesture. *Soot:* Discover = carbonaria rose and fell; Predict = the opening ghost and both timelines within ±2 generations; Transfer = a correct, adequately powered conclusion in L6.

**Untimed and non-visual.** Untimed: a morning is 20 looks instead of 12 s; each tap or miss spends one, and the search image still decays per moth eaten (D2 §13). Non-visual: the player sets the bird's detection rule (a contrast threshold, then in L3 a preference for the commonest morph) and watches it select, while the live region narrates each generation (D4 §8).

**Teacher hooks.** A class pool of realised h² spreads around the true value (sampling noise); a class pool of fitted *b* against morphs kept. Questions: "Your h² came out at 1.2: is that possible?" "Why did black fall more slowly than it rose?" "The ghost jays copy you: what does that assume about real jays?"

**In this model / in nature.** *Model:* you eat half of each generation (×N); in Realistic mode random deaths (weather, parasitoids) dilute your catches so that s matches the cited values (rise about 0.2–0.33, Haldane 1924; decline 0.1–0.2, labelled separately), time-lapsed with a disclosure, while you still choose what to eat; the Lichen moths are a designed polygenic species (real *Biston* colour is mostly one locus); the ghost jays and the search image are designed; history is compressed. *Nature:* jays form search images (Pietrewicz & Kamil 1979); blue jays hunting digital moths maintained a polymorphism (Bond & Kamil 1998, 2002); carbonaria is one transposon insertion of about 1819 (van't Hof et al. 2016); the decline took decades at s ≈ 0.1–0.2 (Cook 2003; Saccheri et al. 2008).

**TAKE.** *lichen:* "Selection keeps what the predator misses; only the inherited part of that difference reaches the next generation." *soot:* "One dominant copy shows at once, so black rose fast; pale hid in heterozygotes and returned slowly."

**Build.** `v2/lichen.js` (`CH_LICHEN_V2`, size M) and `v2/soot.js` (`CH_SOOT_V2`, M) in `mode:'hunt'` with the Hunt extensions (`02_hunt_ext.js`, L, shared). Morphs and carbonaria are three `Gen` `dom` loci with the epistasis in `phen()`; `Gen` is unchanged. `soot`'s What if? reruns L4 with carbonaria recessive, absorbing Equilibrium L9. Rewrite `TAKE` and `MODEL`; rebuild `TRANSFER.soot` as L4's opening gesture, then delete it. Oracles:
1. L1–L2: mean R/S within ±0.05 of the generation's h² (from its additive variance) over 500 seeds; ≤1% of moths at the bark's tone.
2. L3 at K = 120: with the switching bot at *b* = 2, all three morphs stay ≥10% from generation 6 to 20 in ≥95% of 400 seeds; at *b* = 1 the polymorphism is lost in most seeds.
3. Soot: dawn black share = 1 − (1 − q)² within sampling error.
4. A scripted competent player finishes `lichen` within 15 minutes of virtual clock.

### 3.2 Bitter Wings

**Keep.** The felt cost (3 s retch, tint, shake); colour-blind-safe luminance coding; `leafTex` and `flySprite`; hesitation as the selective force.

**Fix.** The 8:24 model-to-mimic ratio never changes, so frequency dependence is never tested (R7 A42); no memory cue; no Müllerian mimicry, imperfect mimicry or origin of warning colours; the goal is the prey's resemblance.

**Core loop.** *Second:* look, hesitate, tap. *Minute:* a morning with a quota of 12 that feeds the chicks; each taste of a warning-coloured insect adds a bitter or tasty tile to the **taste ledger**, and tiles fade after about two mornings (designed); at dusk the survivors breed. *Level:* the model count, the toxicity, or a second toxic species.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Bitter lessons | 8 models; 24 palewings start cream | Predict the resemblance in 4 generations; the ledger fills with bitter tiles. | Batesian mimicry evolves out of your learned avoidance. |
| L2 Too many liars | Mimics start where L1 ended; the models' food plant wilts, so models fall 8 → 2, then recover to 12 | Mark where on the mimics-per-model axis protection will fail; then live through the collapse and recovery (below). | Mimics do best when rare relative to models (Lindström et al. 1997). "The coat that saved them yesterday got them eaten today." |
| L3 Deadly models | Mild days (1.5 s retch) alternate with deadly days (6 s, and a chick goes hungry) | Predict whether rough mimics survive; a broad resemblance spread persists. | Strong toxicity holds protection up. Relaxed selection on accuracy is one explanation of imperfect mimicry (Sherratt 2002; contested). |
| L4 Two poisons | Bitterwings (red-black band; 24) and sourwings (yellow-black spots; 8), both mildly toxic; tasting kills. Each learned pattern wears a faint halo on the pattern axis: your generalisation width. The patterns start **outside** each other's halo. Sourwings carry a large-effect locus (a supergene allele that moves the pattern most of the way to a band; a 5% standing variant, "history compressed"); polygenic modifiers then refine it. | Predict **which pattern moves**: drag a meeting marker along the pattern axis (scored by distance; the truth sits near the bitterwing pattern). Banded sourwings land inside your bitterwing halo and stop costing you mouthfuls; intermediates outside both halos are eaten as novel; the rare species moves and the common one barely does. | Müllerian mimicry: shared costs of predator learning and positive frequency dependence (Müller 1879). Advergence: the rarer species converges on the commoner (Mallet 1999). Turner's two-step: a large jump, then refinement (Turner 1977). What if? starts the patterns inside one halo, where gradual convergence works (Balogh & Leimar 2005). Echo: D3's Tangled Pairs (Act 9) dissects this supergene. |
| L5 The first warning (boss) | A toxic green insect on two islands with a rare bright mutant; eggs scattered on A, in sibling clusters on B | Predict where bright spreads. It dies out on A; on B one taste teaches you to spare the siblings. | Inverts L1–L2: for a warning signal, rare is bad; aggregation is one solution (Alatalo & Mappes 1996). |

**What collapse feels like (D0 Q6).** The ledger turns to ticks, red-and-black stops feeling dangerous, your chicks fatten on mimics and the advantage line dives through zero; then the models and the retches return. The bluff is called, then the bank refills.

**Screen.** Ledger tiles carry glyphs as well as colour; the toxic species differ in pattern and luminance, not only hue; the wilting plant shows models falling; tasted models stagger off (D4's memory cue: the warning-wing icon thickens per bitter taste, and the avoid-ring cracks when mimics outnumber models).

**Live graph.** L1: the resemblance histogram. L2–L3: a daily scatter of mimics per model against the survival of good relative to poor mimics, with a zero line. L4: each species' distance moved along the pattern axis (two traces), and bitter mouthfuls per morning. L5: bright frequency on each island.

**Stars.** Discover: chicks fed, collapse and recovery witnessed. Predict: the collapse threshold within ±1 mimic per model, and the L4 meeting point within tolerance. Transfer: the boss, plus a gesture for a partly clustered third island.

**Untimed mode.** A morning is 24 looks; a tap spends one, and a bitter mouthful spends three (the retch). The ledger and its fading are unchanged.

**Teacher hooks.** The class votes eat or skip as one predator. Questions: "Why can't every palewing be a perfect mimic?" "Is Müllerian mimicry altruism?" "Why does the rarer species do the moving?"

**In this model / in nature.** *Model:* you are the only predator; memory fade, toxicities and the generalisation halo are designed; tasting always kills in L4–L5. *Nature:* many tasted insects survive; mimicry often rests on a few large-effect loci or supergenes (*Heliconius numata* P; Joron et al. 2011); selection in a warning-colour hybrid zone has been measured (Mallet & Barton 1989).

**TAKE.** "Mimics borrow protection that models pay for; two defended species share the cost, and the rarer one converges."

**Build.** `v2/bitter.js` (`CH_BITTER_V2`, M) with `species`, `modelCount`, `toxicity`, `bag` and `Ledger`; the 70% objective is dropped. Oracles: a Bayesian bot predator's mimic advantage falls as models are removed; in L4, with the large-effect allele, the rarer pattern moves at least three times as far as the commoner over 8 generations, and with only small-effect variation starting outside the halo, convergence stalls (the two-step test).

### 3.3 Left Jaw, Right Jaw

**Keep.** Adaptation emerging from a reflex; the guard swing, scale bursts and scars; faster seasons.

**Fix.** 60 identical taps; laterality modelled as discrete and fully heritable (G2 item 9); the oscillation is never shown live; the predator is tiny and its jaw not visibly bent; no attention scarcity, no untimed mode.

**Core loop.** *Second:* among 3–5 prey fish, a scale-eater darts in from one side; tap that fish's flank to raise its guard, which lasts 1.2 s, with at most two up at once, so attention is the scarce resource. *Minute:* a season of 20 attacks, with the scale-eaters' continuous **twist histogram** drawn faintly on the lake floor. *Level:* more fish, lower h², another species, or a new world.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 One fish | 1 prey; h² = 0.9 (×N) | Guard, and watch the share swing. | The rare type feeds better: negative frequency dependence. |
| L2 The school | 3 fish, 2 guards | Tap where the next peak will be. You guard the common side on every fish. | Your triage is the selection; a one-season lag makes the swing overshoot. |
| L3 Partly inherited | h² = 0.25 (realistic) | Predict the amplitude; the swings are smaller and slower. | Echoes Wood L2: little heritability, little response. |
| L4 Two hunters | A second scale-eater species shares the prey | Predict whether their swings align; they synchronise, because your guards select both. | Coupling through a shared selective agent (a model prediction; see §6). |
| L5 The lizard wheel (boss) | Side-blotched lizards (Sinervo & Lively 1996): 150 males; you are a blue-throated mate-guarder; yellow sneakers come from the flanks and can be blocked with the same reflex; orange usurpers cannot. Each season 3 males of each morph arrive from neighbouring rocks (a 2% input floor; D0 guardrail, D3 §4). | Predict the next morph by tapping the strategy triangle, whose corners are lettered O, B, Y; the population orbits B → O → Y → B. | Rock–paper–scissors: no stable point, a fixed cycle order. Inverts L1–L4: what counts is whom you beat, not rarity. Your block rate sets blue's payoff against yellow: block badly and yellow beats blue, and the wheel stops at yellow, held off fixation only by the floor. |

**Lizard model (checked).** Fitness wᵢ = exp(5 × (Mx)ᵢ), where M scores +1 for the morph each one beats and −1 for the one that beats it (strength designed, ×N), with the 3-per-morph floor: the period is 5.1 ± 0.1 seasons over 300 seeds, close to the 4–5 years reported in the field. Without the floor a morph is lost in all 300 runs, at a median of season 2, which is why the floor is not optional. Blue's entry against yellow is 2 × (block rate) − 1.

**Screen.** Prey fish at 3× their current size, scale-eaters at 2× with visibly twisted mouths; bites throw scales and leave scars; the oscillation line scrolls faintly through the water. The lizards keep natural paint and differ by throat **pattern** (O solid bib, B barred, Y striped; D4 ruling), because three morphs cannot wear the two allele inks.

**Live graph.** Right-striker share against a dashed 50:50 line; the twist histogram; the L5 triangle and trail.

**Stars.** Discover: at least 70% of attacks blocked in L1–L4 (scales kept) and one full swing seen. Predict: two of three peak predictions. Transfer: keep the wheel turning for 6 seasons (one full turn) and predict the next morph.

**Untimed mode (D0 Q7).** Each wave freezes on a "tell" (scale-eaters waiting at the edge, twist visible); the player places two guard tokens and the wave resolves. Attention scarcity survives without reflexes.

**Teacher hooks.** The class shouts left or right for a projected fish. Questions: "If twist weren't inherited, would the ratio still swing?" "Why does the lizard cycle run one way?" "Why does the model need lizards arriving from other rocks?"

**In this model / in nature.** *Model:* selection is exaggerated; a season is a generation; the input floor is designed. *Nature:* Hori (1993) found a period of about 5 years; heritability is about 0.2 (Lee, Heim & Meyer 2015) with a large developmental role (Raffini & Meyer 2019); whether the distribution has one mode or two is debated.

**TAKE.** "When the rare type does better, variation persists; when each type beats another, frequencies chase each other round."

**Build.** `v2/jaws.js` (`CH_JAWS_V2`, M) reuses the `CH_JAWS.draw` fish and guard; twist is a `Gen` additive locus with `ve` tuned to the target h². Oracles: against a "guard the commoner side" bot, selection on right-strikers has the opposite sign to p − ½; lizards cycle with period 5 ± 1 seasons with the floor and lose a morph within a few seasons without it.

### 3.4 Hawks and Doves

**Keep.** Correct payoffs, V/C, Bourgeois, assessment, war of attrition; the crab duel.

**Fix.** `evolve()` ignores the player (R7 A51), so play is "compute the expected value and press"; no invasion test; mixed ESS and polymorphism never told apart; tiny crabs on an empty beach; both buttons grey out; the 20 s cap piles strategies at the cap.

**How play moves the population (D0 Q2).** The duel is the camera; the beach is the stage. Your lineage's rule is how often you played Hawk in each context over your last eight duels. Your descendants wear the you-halo and play it among 150 crabs; every four duels a tide (one generation) resizes lineages by payoff. Opponents come from the beach, so as your lineage spreads you increasingly fight your own descendants.

**Core loop.** *Second:* size up the rival, Hawk or Dove. *Minute:* four duels, then a tide. *Level:* new residents, V/C, roles or persistence.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The tide pool | 150 crabs, 85% hawks; V = 4, C = 10 | Six duels; feel the cost of hawk against hawk. | The payoffs. |
| L2 The mutant | An all-dove beach; you are one haloed crab | Predict the final hawk share. Your lineage spreads, then stalls near 40%. | A polymorphism of pure strategies at V/C. "My hawks ended up mostly fighting each other." |
| L3 The unbeatable beach | Every resident plays Hawk with probability 0.4 | Try any rule; the invasion-fitness meter (your payoff minus the residents') sits at zero, then falls as your lineage grows. | The ESS definition: no rare rule does better. L2's 40%, now inside each crab: a mixed ESS. |
| L4 Big shells | V = 8, C = 4 | Predict the beach's mean payoff. Hawks take over while everyone's payoff falls. | Selection does not maximise group welfare. |
| L5 Owners and sizes | Roles and rival size | Your rule becomes conditional; Bourgeois and assessors invade. | Conditional strategies and resource-holding potential. The reverse rule ("intruders win") is stable in theory but rare in nature. |
| L6 War of attrition (boss) | Hold to display; cap raised to 40 s (exceeded by only 1.8% of an exponential with mean 10 s) | Your holding times are your lineage; any habit (always quit at 8 s) is exploited by a mutant quitting at 8.5 s. | A true mixed ESS: only unpredictability is stable. Inverts L2. |

**Screen.** 150 crabs on the sand. Hawk and Dove are inherited rules, so they wear blue and amber (D4 rule 4) plus a shape: hawks raise claws, doves lower them. Background contests spark (hawk against hawk) or scuttle (a dove retreating); the foreground duel is drawn at 3×; each tide washes some crabs away and scatters hatchlings. Buttons never grey out together: the next rival walks in while the last fight resolves.

**Live graph.** Hawk share against a dashed V/C line; the invasion-fitness meter; in L6, a holding-time histogram against an exponential ghost.

**Stars.** Discover: your lineage spreads in L2 and you witness the L4 tragedy. Predict: the L2 share within ±8 points and the direction of the L4 payoff (as a dragged mean-payoff ghost). Transfer: judge whether a new beach (V = 6, C = 8, 50% hawks) is at its ESS, and pass L6.

**Teacher hooks.** A class tournament (R8): the projected beach evolves from students' P(Hawk). Questions: "Can you tell 40% hawks from crabs that each fight 40% of the time?" "Why doesn't evolution prevent the L4 tragedy?"

**In this model / in nature.** *Model:* payoffs are symbolic; with N = 150, drift is visible. *Nature:* hermit crabs assess shells and rivals (Elwood & Briffa 2001); stags assess before fighting (Clutton-Brock et al. 1979).

**TAKE.** "Hawks spread until fighting stops paying; the stable mix is where hawks and doves do equally well."

**Build.** `v2/hawks.js` (`CH_HAWKS_V2`, M) is a new object; the `ch10.js` wrappers are bypassed, so L4–L5 are re-implemented on purpose, reusing `crab()`, `pay()`, `pay4()` and `pw()`; lineages run on `WF`. Oracles: with no player, the beach reaches V/C; a rare pure invader into the mixed-ESS beach has negative mean fitness over 200 seeds.

### 3.5 The Raffle

**Keep.** The ticket-share rule (your tickets ÷ all tickets) and the budget tension across females; eggs taking their father's pattern. The v1 life-bar plot leaves with the seminal-fluid level for D3's Skaters (binding decision), which reuses `ch9.js`'s `life()`.

**Fix.** No male mates after you, forcing "spend nothing on virgins" (R7 A20); hidden rivals scored against an omniscient plan (A22); no precedence; a decorative race on the palest screen (12 px sperm, red–green chart); "% of best" hides real differences (an even split scores 90%: 62.2 of 68.8 eggs); allocation is typed, not felt.

**The picture (D0 Q6): the Drum.** The female's sperm store is a glass raffle drum filling 40% of the canvas. Every sperm is a ticket: yours striped and haloed, each rival's dotted or solid (D4). Eggs pass a gate one at a time, each pulling a ticket on a thread and taking that father's pattern; the expected share is a dashed ghost on the egg row. From L3, a later male's tickets enter at the top and flush out earlier ones near the gate: displacement seen, not stated.

**Core loop.** *Second:* **hold to pour**: while held, tickets stream into the drum and a shared budget meter for the whole queue drains; release to stop (feedback in under 200 ms: tickets tumble, the meter falls). L3 uses the same hold for mating duration. *Minute:* one female, ending in the draw. *Level:* a new rule.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The fair raffle | 6 females in a visible queue; a budget of 100 | Before female 4 (five rivals' tickets visible), drag your expected share on the egg row; then hold to pour. | Your tickets ÷ all tickets: crowded drums give diminishing returns. |
| L2 Who comes next? | Cards show rivals before her and the chance of one after; only three females ahead are visible | Hold to pour against the shared meter. The best plan gives a virgin at 90% risk of a later male about 22 units, one at 20% risk about 1. | Ejaculates rise with the risk of rivals to come (Parker 1990); scored against the best plan given what you could see. |
| L3 The dung pat | *Scathophaga*: the last male fertilises about 80% | Hold to mate as your tickets flush out earlier ones with diminishing returns; release to search. Predict the best duration; the tangent then draws itself, as in the Forager. | Mating duration as a marginal-value problem (Parker & Stuart 1976). |
| L4 The hen decides (boss) | Feral fowl; you are a subordinate rooster, and some hens eject your sperm (the drum leaks) | Predict which hens give you the most paternity. | Cryptic female choice (Pizzari & Birkhead 2000). This inverts the raffle: the drum is hers. |

**Screen.** The drum, with tickets rattling down a tube into it; the egg row beneath; pat flies at least 7% of the stage unit; charts in blue and amber plus pattern.

**Live graph.** Eggs fathered against an expected ghost; allocation bars (the information-matched best plan only at the debrief); the L3 gain curve and tangent.

**Stars.** Discover: eggs above a threshold in L1–L3. Predict: share predictions within ±10 points. Transfer: the boss, plus an allocation gesture (a held pour) for a new female profile.

**Teacher hooks.** The class allocates by hand, then compares with the debrief. Questions: "Why might a virgin get more sperm than a mated female?" "Who controls paternity?"

**In this model / in nature.** *Model:* tickets are equal; the risk of later rivals is a known probability. *Nature:* spending more when rivals are present is well supported; spending less at very high competition is not (Kelly & Jennions 2011; contested).

**TAKE.** "Paternity is a raffle: your share is your tickets ÷ all tickets, and the drum may be hers."

**Build.** `v2/raffle.js` (`CH_RAFFLE_V2`, M) reuses `optimum()` and `opt()`. The L2 benchmark is an expectation over the hidden queue. After L2 an invasion view pits your rule (a + b·rivals + c·risk) against "even split" and "virgin-miser". Oracle: greedy allocation within 1% of the Lagrange optimum.

### 3.6 Alarm Call

**Keep.** The 1.8–3 s decision with the predator closing in; reading kin; Hamilton's rule in Belding's ground squirrels.

**Fix.** Nobody dies; collars give every sister r = ½ and are 2 px rings on 30 px squirrels; the costs (corrected in G3) are told, not discovered; v1 still gives the hawk whistle a positive cost although Sherman's data make it negative (G3 review); L2 is a worksheet counting only indirect fitness; no invasion view.

**Kin in two seconds (D0 Q3).** Inference and decision are split. In untimed **peace time** litters emerge from natal burrows, each pup wearing its father's face blaze (a designed marker), so two blazes in a litter mean half-sisters (r = ¼); the player places tags on a `PedigreeView`. In the timed attack squirrels wear the player's tags (letters on ear flags: ½, ¼, ⅛, 0), not the truth: the 2 s decision reads conclusions already reached, and tagging mistakes cost lives. No collars (binding decision; D4 draws the flags and blazes).

**Deaths.** A hawk lifts its victim away (shadow, feather puff); a coyote leaves dust and a darkened burrow; the victim leaves a ghost ring (D4). Its pedigree node hollows and its caller-allele tokens leave the colony jar. If you die, you continue as your daughter.

**Core loop.** *Second:* read tags, call or stay silent. *Minute:* one spring (peace, then 4 attacks). *Level:* new evidence or context.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Peace and the coyote | 14 squirrels with a known pedigree; coyotes only; the only call is the trill: cost C = 0.22 to you, and each warned neighbour avoids B = 0.4 of risk | Call or stay silent; relatives die when you misjudge. | rB > C, on screen: call when Σr × 0.4 > 0.22, e.g. one sister and one cousin (0.625) but not one cousin alone. |
| L2 Who's my sister? | Tag a new spring's litters; multiple paternity | The attacks use your tags. | Identity by descent, inferred, on average. "Half-sisters count half." |
| L3 The hawk | Hawks arrive with a second call, the whistle. Its cost is hidden and **negative** in the model: whistlers are caught less often than silent squirrels (set from Sherman 1985, about 2% against 28%). A tally of callers and silent squirrels caught, by predator, fills as you play. | Drag a cost marker for each call onto the Hamilton ledger's axis, then test over 10 attacks. The whistle's marker belongs at or below zero, the trill's at 0.22. | The whistle pays the caller even with no kin near, so it may be selfish; only the trill needs kin (Sherman 1985). Testing an adaptive hypothesis. |
| L4 The colony map | Invasion view: your thresholds become sex-limited calling alleles across 6 burrow clusters and 15 seasons; males disperse | Drag the female and male calling-rate ghosts for season 15. | Calling pays for females, who live among kin, not for dispersing males (Sherman 1977). |
| L5 Help or breed (boss) | Seychelles warbler; a saturated island; female helpers can lay eggs in the nest they help at | Each spring, help or disperse. Score counts direct plus indirect gene copies. | This inverts L1–L4: co-breeding gives helpers direct reproduction, so helping can pay even when the nestlings are not close kin (Richardson et al. 2001; Richardson, Burke & Komdeur 2002; Komdeur 1992). |

**Screen.** Squirrels at least 7% of the stage unit; ear-flag tags as letters; calls as ink rings (a thin straight ring for the whistle, and the caller bolts; a wavy ring for the trill, and the caller freezes: shape, not sound alone); a large hawk shadow; a coyote stalking the grass.

**Live graph.** A **Hamilton ledger** per attack (rB stacked by relative, against a line at C; from L3 the whistle's C line sits at or below zero); the L3 catch tally by predator; L4 calling rates in females against males.

**Stars.** Discover: kin alive and caller copies above a threshold, sex difference seen. Predict: the two L3 cost markers (sign and rough size) and the L4 calling rates. Transfer: the boss, plus "if females dispersed and males stayed, who would call?" as a dragged pair of rates.

**Untimed mode.** Each attack freezes at the tell (the predator at the meadow edge); the player reads tags and decides; costs and benefits are unchanged. Calm mode shows a static band with a countdown arc (D4).

**Teacher hooks.** The class votes on a projected attack. Questions: "Your sister 'shares half your genes': what does that mean?" (misconception 10). "Is the whistle altruistic? What evidence would decide?"

**In this model / in nature.** *Model:* costs and benefits are fixed; the whistle's negative cost is set from catch rates; the face blazes are designed. *Nature:* paternity was found genetically (Hanken & Sherman 1981); females treat full and half-sisters differently (Holmes & Sherman 1982); 44% of female warbler helpers bred, producing about 15% of young (Richardson et al. 2001).

**TAKE.** "Warn relatives when relatedness times benefit beats your cost; a call that saves the caller needs no kin."

**Build.** `v2/alarm.js` (`CH_ALARM_V2`, M) reuses `squirrel()` at actor size and the corrected `genRound` costs, with `PedigreeView` for peace time. Oracles: the trill boundary is exactly ΣrB = C; the whistle bot calls at r = 0.

### 3.7 The Forager

**Keep.** Diminishing returns the player feels; leaving under a clock; fear of the hawk; the risk-sensitive night.

**Fix.** Simultaneous items on the conveyor let look-ahead beat the scored "best", hidden by the `Math.min(1, eff)` cap (R7 A63); L1 and L3 are one mechanic; a tiny bird; Notes print the optimum; five disconnected birds; the adaptationist step is never shown; round 1 gave the tit a starling's beakful.

**One day, one map (D0 Q4).** One great tit's day on one panorama (nest, hedgerow, orchard, field) under a moving sun. The great tit is the Act 6 anchor and the Hedge's resident, and recurs in D3's Song School and the Race boss (binding decision). One variable changes per act, and each act draws its own curve from the player's data. **Encounters are sequential on the hedgerow:** prey appear one at a time ahead of the hopping bird after random search intervals, each visible for 1.2 s; take it or let it pass; eating locks the bird behind a chewing bar. Every catch is carried home one at a time, so travel from the nest is part of every act.

**Core loop.** *Second:* take or skip. *Minute:* one trip or one tree. *Level:* one act of the day.

| # | Act | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Morning: the hedgerow | Big and small caterpillars arrive in sequence; big ones scarce, then common. The ghost-hand dawn trip is the tutorial. | Take or skip; profitability bars rank the prey. Drag the big-prey encounter rate at which small prey stop being worth taking. | The zero–one rule: whether to take small prey depends on how often big ones come, not on how common small ones are. Real tits show partial preferences (Krebs et al. 1977). |
| L2 Midday: the orchard | Rich and poor trees at different flight times from the nest | Predict when you will leave; your departure dots appear against the tangent drawn from your own data. | The marginal value theorem (Charnov 1976); travel time sets the tangent's origin. |
| L3 Afternoon: the hawk | Vigilance or feeding; hedge or open ground | Chicks need N grubs; the hawk is rare, then common. | Predation risk shifts the best choice (Lima & Dill 1990). |
| L4 Your rule as a gene | Invasion view: your L2 leaving rule against "leave after 5" and "leave at 10 s" | Predict the winner, then watch 30 generations. | Selection makes birds behave as if they compute tangents. |
| L5 Winter night (boss) | A survival threshold; steady against variable feeders at dusk | Choose feeders to survive the night. | Near starvation the gamble makes sense: survival, not rate, is the currency. Scored inside the model only; the energy-budget rule is contested (Kacelnik & Bateson 1996). |

**Screen.** The bird at least 10% of the stage unit, one caterpillar dangling from its beak; chicks that gape and fatten; dusk grading and a hawk shadow; the gain curve drawing itself from the player's own pecks.

**Live graph.** Take/skip dots on profitability bars; a gain curve per orchard tree with the tangent drawn from travel time; L4 lineage share.

**Stars.** Discover: chicks fledged and the night survived. Predict: the L1 switch rate and the L2 leaving time. Transfer: the boss, plus "travel time doubles: drag your new leaving point."

**Untimed mode.** On the hedgerow each prey waits for take or skip; search and handling time are charged to the sun's position, so the rule depends on time accounting, not reflexes. The orchard and the hawk run on the same sun clock.

**Teacher hooks.** A class orchard puts everyone's leaving times on one curve. Questions: "Birds don't calculate tangents; why do they act as if they do?" "Why might tits still take small worms?"

**In this model / in nature.** *Model:* gain curves are designed; the bird knows its travel times; the boss is solved by dynamic programming. *Nature:* Cowie (1977) tested the MVT in great tits and Krebs et al. (1977) the diet rule; Kacelnik (1984) tested central-place load size in **starlings** carrying beakfuls to chicks, a prediction this tit does not model; Caraco et al. (1980) tested risk sensitivity in juncos.

**TAKE.** "Good foragers act as if they weigh gain against time; selection, not calculation, builds the rule."

**Build.** `v2/forager.js` (`CH_FORAGER_V2`, M) reuses `delay()`, `optRate()`, the diet rule λE/(1 + λh), the hawk level and the V(e, t) recursion from `ch3.js` and `ch9.js`, and drops the cap. Oracle: for G(1 − e^(−t/τ)) with τ = 4, the best stay is 3.4 s at T = 2 and 6.5 s at T = 10.

### 3.8 The Clinic

**Keep.** Clear doses; a real toxicity-versus-cure trade-off; failure you can read (the dish turns turbid); the TB anchor and combination therapy.

**Fix.** One optimal sequence per level (R7 CL6); daily dose switching without pharmacokinetics or adherence; no horizontal gene transfer (CL4), ward or visible selection window; only "hit hard" works; red against green carries meaning; "let the immune system finish" has no model parameter (net growth ×0.8 a day; R7-R3 M8).

**Core loop (live from L1).** *Second:* tap a bed (in L1, the dish) to give a dose, or hold for a high dose; within 200 ms liquid fills the dish and susceptible cells shrink. *Minute:* a day ticks every ~1.5 s (2 s in L1); the concentration curve draws live up to "now" against two lines, the susceptible MIC and the mutant-prevention concentration, with the **mutant selection window** hatched between them; it never previews the future. Staff time is a shared meter refilled each day; a dose, a hygiene round or a swab spends it. *Level:* one new factor. The v1 plan strip is retired: a plan drawn against a previewed curve reduces play to "minimise the hatched area", a worksheet (RC1).

**Host defence (designed, ×N).** Untreated growth is ×8 a day. Immune clearance removes 99% a day while the load is below 10⁵ cells and saturates above it. So an infection below 10⁵ clears on its own within days, and the drug's job is to push the load under that line before resistant cells can hold it up. Every "the immune system helps" line is then true in the model. The MODEL card adds that in TB the immune system contains rather than clears, and treatment lasts months.

**Ward and pathogen (D0 Q5).** A 6-bed bay (L4) and a 12-bed ward (L5). The pathogen is KPC-carrying *Klebsiella pneumoniae*, whose carbapenemase plasmids move between Enterobacterales and between patients; it stays separate from the chromosomal TB story (CL4). The Clinic sits on Act 11's map but opens after Act 4 (binding decision).

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The course | TB, one drug, one bed. Opening gesture (TRANSFER.clinic rebuilt, D2 §8): the dish holds 10⁹ cells with a few resistant ones already present; drag where the resistant share will be after day 1 ("in the Lichen Wood you were the predator; now the drug is"). | Dose live; predict the resistant share at day 10; watch the curve sit in the window. | The mutant selection window (Drlica & Zhao 2007): doses inside the window enrich resistant mutants that already exist. The drug mostly selects; it rarely creates. |
| L2 Two drugs, a forgetful patient | Combination therapy; the patient misses 15% of doses (tagged) | Missed doses leave gaps in the live curve. | Combinations tolerate lapses; a single drug plus lapses means time spent in the window. |
| L3 Already there | Two beds under one staff meter: one patient with 3% standing resistance, one with none | Dose both live; in this model containment wins for the first, hitting hard for the second. | Competitive release: whether resistance is already present decides (Read, Day & Huijben 2011; contested, scored on showing when each wins). D3's Tumour side quest reuses this module and echoes this level. |
| L4 The bay | 6 beds; a KPC plasmid; tools: hand hygiene (staff time), 2 isolation beds, screening swabs | Contain the spread. | Resistance travels between bacteria and between beds; the patient is not resistant, their bacteria are. A plasmid persists only if transfer outpaces its cost plus loss (Stewart & Levin 1977); outbreaks are traced by sequencing (Snitkin et al. 2012). |
| L5 The long winter (boss) | 12 beds, 90 compressed days; restrict the drug | Predict the decline. Resistance barely falls, because the plasmid's cost has been compensated. | This inverts "stop using it and it disappears" (Andersson & Hughes 2010). |

**Screen.** Susceptible cells blue and smooth, resistant cells amber and spiked (D4 inks: amber is the variant allele), plasmids as ink loops inside cells; infection as dish turbidity and a heart-trace strip, not red; a ward map of beds with load bars, plasmid icons and contact lines following staff; patients who deteriorate move to intensive care as a tally on pictograms; no on-screen death.

**Live graph.** Log load against the 10⁵ immune line; resistant share; in L5, ward prevalence against a dashed "no transfer" ghost.

**Stars.** Discover: cures in L1–L2, window seen. Predict: the opening share, the day-10 share and the L5 decline. Transfer: L4 containment, and the right regimen for a new culture (inside the model; contested).

**Teacher hooks.** Teams treat one ward on a shared seed (R8). Questions: "When might 'hit hard' backfire?" "'My body became resistant': what is actually resistant?" (misconception 12).

**In this model / in nature.** *Model:* one-compartment pharmacokinetics; designed MICs and immune clearance; transfer rates tagged ×N; mutants Poisson-drawn before treatment, so plates differ Luria–Delbrück style, and arising at the same rate during it (no stress-induced mutation). *Nature:* the best course length is still debated (Llewelyn et al. 2017); sub-inhibitory doses can raise mutation and gene-transfer rates (Cirz et al. 2005; Beaber et al. 2004), hence "mostly selected, rarely created".

**TAKE.** "Antibiotics mostly select resistance that already exists; doses that sit inside the window enrich it."

**Build.** `v2/clinic.js` (`CH_CLINIC_V2`, L) reuses the TB `step()`, adds a pharmacokinetic module (exported for D3's Tumour) and an agent-based ward. Oracles: untreated growth; double mutants at about the product of the single-mutant rates; an untreated load below 10⁵ clears within 5 days; a fixed-schedule bot cannot three-star L3.

### 3.9 Switches

**Keep.** A construction toy with instant causation; posterior prevalence; the Pitx1 lesson (enhancer modularity against coding pleiotropy).

**Fix.** No A1 column, so target 4 teaches wrong biology (R7 M2; G2); colinearity stated but never played; crude ellipse flies; L2 is one choice plus a quiz; no selection step.

**Core loop.** *Second:* paint a cell or drag a gene's boundary. *Minute:* the larva's denticle belts change, then the adult hatches. *Level:* a new rule or body plan.

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

**TAKE.** "Hox selector genes set segment identity; changing where a gene switches on changes form with fewer side effects."

**Build.** `v2/switch.js` (`CH_SWITCH_V2`, M) reuses `SEG`, `HOX`, `ident()` and the Pitx1 options, and rebuilds `fly()`; the lake uses a `Gen` `dom` locus. Oracle: the identity table for every grid state.

---

## 4. Answers to D0 §8 (D1)

1. **Pilot:** yes; the Wood exercises every template element. Build it as a plain-JS v2 plug-in first (§2, G12), then R6's TS/Pixi spike ports it.
2. **Hawks:** the duel sets the lineage rule; the beach plays it (§3.4).
3. **Alarm:** untimed peace-time tagging on a `PedigreeView`; ear-flag tags carry the player's inferences into the 2 s attack; deaths as snatches, ghost rings and hollowed pedigree nodes (§3.6).
4. **Forager:** no blur (one variable per act); the hedgerow makes encounters sequential (§3.7).
5. **Clinic:** 6-bed bay, 12-bed ward; KPC *K. pneumoniae*; live dosing (§3.8).
6. **Raffle:** the Drum, filled by holding to pour; mimicry collapse in §3.2.
7. **Jaws:** yes; untimed guard tokens (§3.3).
8. **Switches:** Canvas2D is enough (§3.9).

## 5. Pilot gates and build order

**Wood gates (five-player tests).** Median first action under 10 s (ghost hand within 3 s; the first morning cannot fail); median Act 0 under 15 minutes; at least 60% explain S and R after L1; most see the rare morphs rise in L3; no bot earns three stars; every Interesting result ≤25 words; Calm mode complete; D4 §5.3's peck and dusk timings met; 60 fps with 300 egg dots plus particles. These gates cannot be judged until FCR-1 (layout), FCR-7 (`fx.js`) and FCR-9 (ghost hand) exist (binding decision).

**Order.** D2 schedules. Its Phase 1 slice comes first: Lichen, Soot, Mixer, Casino, Hawks. The remaining favourites follow in this order: Bitter (Hunt extensions) → Jaws (triangle) → Forager → Raffle (tangent) → Alarm (`PedigreeView`) → Clinic → Switches. In parallel D1 reviews D3's specs in D3's order (Mixer and Casino first, then the spine rebuilds, then the P0 games).

**Sizes (D3's key).** `lichen` M, `soot` M, `bitter` M, `jaws` M, `hawks` M, `raffle` M, `alarm` M, `forager` M, `clinic` L, `switch` M; shared `00_fx` M, `01_widgets` L, `02_hunt_ext` L.

## 6. New claims to verify before build (Coordinator A)

Claim, then source to check:
- Jays form search images: Pietrewicz & Kamil 1979, *Science*.
- Apostatic selection by blue jays maintains a polymorphism in digital moths: Bond & Kamil 1998 and 2002, *Nature*.
- The peppered moth's rise had s ≈ 0.33 (Haldane 1924); the decline s ≈ 0.1–0.2 (Cook 2003; Saccheri et al. 2008).
- Kettlewell's 1953 release ran in a Birmingham wood and his 1955 one in Dorset; Majerus's 2001–2007 experiment was published by Cook et al. 2012, *Biol Lett*.
- Peppered moths lay hundreds of eggs: a standard source.
- Aggregation lets warning signals spread: Alatalo & Mappes 1996, *Nature*.
- Imperfect mimicry and relaxed selection: Sherratt 2002, *Behav Ecol* 13:821 (round 1 wrongly gave *Proc R Soc B*).
- Selection in a warning-colour hybrid zone: Mallet & Barton 1989, *Evolution*.
- Müllerian advergence (the rarer species converges): Mallet 1999, *Evol Ecol* 13:777. Two-step convergence: Turner 1977, *Evol Biol* 10. Gradual convergence within the generalisation width: Balogh & Leimar 2005, *Proc R Soc B*. The *H. numata* supergene: Joron et al. 2011, *Nature*.
- Two scale-eater species swing together: Hori 1993 (else Jaws L4 is labelled a model prediction).
- The lizard cycle's order (B → O → Y) and period of about 4–5 years: Sinervo & Lively 1996, *Nature*, whose data span six years; check whether the 4–5-year figure comes from later papers. The model's period is 5 seasons with a 2% input floor (checked).
- Share of multiply sired Belding's litters: Hanken & Sherman 1981.
- Whistlers are caught less often than silent squirrels, about 2% against 28%: Sherman 1985, *Behav Ecol Sociobiol* 17:313 (figures as cited by Coordinator B).
- Seychelles warbler co-breeding: Richardson et al. 2001, *Mol Ecol* 10:2263 (44% of female helpers bred, about 15% of young); the direct-benefits analysis: Richardson, Burke & Komdeur 2002, *Evolution*; Komdeur 1992, *Nature*.
- Great tits feeding nestlings mostly carry one prey per trip (the reason round 1's beakful level is cut); Kacelnik 1984, *J Anim Ecol*, is a starling study.
- A great tit test of the MVT: Cowie 1977, *Nature*; of the diet rule: Krebs et al. 1977, *Anim Behav*.
- KPC plasmid transfer within a hospital: Conlan et al. 2014, *Sci Transl Med*; outbreak tracing: Snitkin et al. 2012, *Sci Transl Med*.
- Plasmid persistence requires transfer to beat cost plus loss: Stewart & Levin 1977, *Genetics*.
- Sub-inhibitory antibiotics raise mutation and transfer rates: Cirz et al. 2005, *PLoS Biol* 3:e176; Beaber et al. 2004, *Nature* 427:72.
- Compensated costs keep resistance after withdrawal: Andersson & Hughes 2010; Sundqvist et al. 2010.
- Crustacean Hox boundaries track body plans: Averof & Patel 1997, *Nature*.
- Left-biased pelvic vestiges: Shapiro et al. 2004.

## 7. Conflicts with the other design docs, resolved

| Conflict | Resolution |
|---|---|
| D2 §8 rebuilds `TRANSFER.soot`; round 1 deleted it | D2's version: soot L4 opens with "drag where tomorrow's moths will be". `TRANSFER.clinic` gets the same treatment in Clinic L1. |
| D2 §9's Act 0: two morphs, a dark-bark rerun at 10:00, intervention switches | Three morphs (D1); the switches and "eat at random" become L1 What if? buttons; the dark-bark rerun opens soot L4. |
| D2 §9 "the bark holds 30 moths" | Carrying capacity is a random winter cull (binding decision). |
| D4 §7 first morning ×0.6 with 8 actors; round 1 opened with 30 | Adopted in L0. |
| Starling or great tit for Act 6 and the Hedge | Great tit; Kacelnik 1984 cited as a starling study. |
| D4 rule 8: "yours" is the you-halo | Adopted for shells, lineages, tickets and the Invasion strip. |
| D4 §4.1 kin collars against D1 ear-flag tags | D1's tags, drawn by D4. |
| Clinic blue/orange against D4 inks | Susceptible blue and smooth, resistant amber and spiked. |
| D4 rule 4 cannot dress three lizard morphs | Natural paint, throat pattern, O/B/Y corner letters. |
| Raffle L4 duplicates D3's Skaters | Moved to the Skaters with the life-bar plot. |
| Clinic L3 duplicates D3's Tumour L3 | The Tumour is a side quest reusing the Clinic's pharmacokinetic module and echoing L3. |
| D3's Tangled Pairs, a second mimicry hunt | Placed in Act 9 after Bitter Wings, with its insects; Bitter L4 makes the supergene's first jump and Tangled Pairs dissects it. |
| D1's `scatter` and `map` against D4's six charts | D4 adds the scatter and GenomeStrip; `map` is D4's tree-and-deme map. |
| Build order | D2's slice first; D1's order covers only the favourites after it. |
| D2 §3's side quest "Kettlewell's Recapture" | It is Wood L6; I propose it is not built twice (D2 decides). |
| D3 §5 asks D1 for a Hunt net verb | Added as `net` (§2.2). |

## 8. Ideas adopted from colleagues

- **D2:** the freezer as the in-world What if? (G9); persistence of the resident population (Wood L3 → soot → L6); the Act 0 switches; `TRANSFER` as a first gesture; the versioned save key and URL parameters (G12); the non-visual detection-rule path (D2 §13).
- **D3:** the size key (§5); Lottery of the New as the explanation of the single surviving carbonaria origin (soot L4 echo); Tangled Pairs and Red Fire for the supergene mechanism (Bitter L4); the Dig's "you make the record" (Wood L6); Stewart & Levin and Snitkin et al. for the ward (Clinic L4).
- **D4:** the first morning, ghost hand, ≤25-word Interesting result, Calm mode and peck/dusk timings as acceptance criteria (§5); the you-halo; ear-flag and throat-pattern drawing; the scatter and GenomeStrip; the memory-cue icon in Bitter Wings.
- **Shared widgets generalised from D2 and D3:** `Evidence` (from D2's Census, D3's Pseudoreplication Trap, Manhattan Hunt and Sweep decoys) and `PedigreeView` (for D2's Pedigree and D3's Royal Line, Invisible Carriers and Hive).

## 9. Disagreements with integrator

No item is refused. Three are done by a different route, with reasons.
1. **Wood L3 mechanism.** Neither suggested option passed the oracle in my runs. A one-migrant floor at K = 30 still loses a morph in 13% of seeds with a perfect commonest-first bot and 25% with a realistic search image. Hunting one trunk of a 120-moth wood with the other 90 unhunted keeps all three morphs above 10% in only 40%. The design keeps the 120-moth wood and the one hunted trunk, and has ghost jays replay the player's fitted rule on the other trunks: 98%. The player stays the cause, because the jays copy the player's own rule.
2. **Clinic L1 is live too** (one bed, 2 s a day), not only L2 onward. A planned L1 against a previewed curve would keep the very worksheet the feedback removes.
3. **Forager:** beyond citing Kacelnik 1984 as a starling study, round 1's L1 (a tit carrying beakfuls along a load curve) is cut. Great tits feeding nestlings mostly carry single prey, and that level duplicated the orchard's tangent (the original "L1 and L3 are one mechanic" fault). If Coordinator A finds tits load several prey routinely, L1 returns as in round 1, with the starling label.

## 10. Revision notes (round 2)

- **Wood:** set in the Black Country, with Manchester 1848 on the Archive card; one persistence genome (tone background, A/B morph loci, epistatic carbonaria C_); L1–L2 use one bark, a tone-linear camouflage index and h² set through `ve`, with hue unselected; L3 moves to a 120-moth, four-trunk wood with a recessive common morph, dominant rare morphs and ghost jays; Act 0 time-boxed (3/5/4/6 generations, first morning 8 moths at ×0.6); D2's switches as L1 What if? buttons; `TRANSFER.soot` rebuilt as L4's opening gesture; carbonaria enters as one tagged origin at q = 0.05; L6 samples the player's own population; untimed and detection-rule paths; Realistic-mode scaling; all oracles rerun at the real N (checked numbers in §3.1).
- **Bitter Wings:** L4 starts the patterns outside the generalisation width and uses a supergene allele for the first jump; the prediction is now "which pattern moves" (advergence); untimed mode added.
- **Jaws:** a 2% input floor, a period of 5 seasons (checked), throat patterns with O/B/Y letters.
- **Hawks:** 150 crabs from L1; you-halo; blue/amber plus claws.
- **Raffle:** four levels (seminal fluid → Skaters); "your tickets ÷ all tickets"; hold to pour against a shared budget meter.
- **Alarm:** L1 coyotes and trill only; the whistle first appears in L3 with a hidden negative cost; the 0.08 figure is deleted; L5 wording fixed; `PedigreeView`; untimed mode.
- **Forager:** great tit kept; Kacelnik cited as starlings; the beakful level cut (§9); an untimed hedgerow.
- **Clinic:** "doses inside the window enrich resistant mutants that already exist"; designed immune clearance makes "the immune system helps" true; live dosing from L1 with staff time; blue-smooth and amber-spiked cells; `TRANSFER.clinic` rebuilt as L1's opening gesture; Tumour echo.
- **Template:** G1 adds the investigator and experimenter roles; G3 loops and the fun gate are mandatory; G5 forbids two-option "gestures"; G9 uses the freezer and D4's text limits; G10 scores against expectation; G12 now states the real plug-in mechanics (one IIFE, new identifiers, numbered prefixes, boot checks, `notes()` as data provider, the outermost `App.open` and `End.show` wraps with `done` bookkeeping, the `quick` trap, zero-cost `Gen` extensions, `?v1=1`, the scene lab, Stage 0 golden trajectories); `Pin`, `Evidence`, `PedigreeView` and `WF` are shared widgets; `trunks` and `net` are Hunt extensions.
- **§6** corrects Sherratt 2002's journal and adds sources for the new claims. §7 records every resolved conflict, and §8 credits each borrowed idea.
