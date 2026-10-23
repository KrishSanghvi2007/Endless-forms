# Wave 2: The Royal Line (`royal`, new)

*Unit builder, 21 October 2026 (session 2). Spec: D3 §5.2. Binding: D6, including the 21 October addendum (own world, intro card, accent). File: `games/endless-forms/source/v2/royal.js` (≈ 1,230 lines, ≈ 120 KB raw). Tests: `tests/oracle_royal.js`, `tests/royal_shots.py`, `tests/royal_paths.py`. Not yet reviewed by the three reviewers or gated; nothing committed by the builder.*

## What I built

**World (D6 decision 7).** Two rooms, neither beetle nor blue/yellow:
- **Morgan's fly room, 1910** (L1–L3): walnut panelling, a tall window onto a violet dusk over rooftops, a workbench, milk bottles of banana mash with cotton plugs, and a green-shaded brass bench lamp. Flies are drawn top-down in natural paint (tan body, banded abdomen in females, a dark rounded tip in males, as in real *Drosophila*); eyes are brick red or white. Eye colour reads by luminance as well as hue, and sex by abdomen shape and the ♀/♂ trays.
- **The portrait gallery** (boss): burgundy damask, a picture rail, gold oval frames for women and gold square frames for men (pedigree convention: circle ♀, square ♂, filled square for an affected man), sepia busts with foxing.
- Accent `#7A2E3E` (gallery burgundy). The allele inks (blue +, amber w) appear only in the X-copy jars and the allele charts.
- `content.intro` = {game 29 words, biology 25, how 27}; 00_entry draws the card.

| # | Level (adds one thing) | Verb (per second) | Minute | Prediction gesture | Stars offered |
|---|---|---|---|---|---|
| L1 | **Morgan's bottles** — sex: the reciprocal cross | drag a female bottle onto a male bottle (or key 1–6 then the dock "Red ♂" / "White ♂"); 40 flies hatch one by one into a four-tray plate (♀ red, ♀ white, ♂ red, ♂ white) | one cross from a six-vial budget; new bottles join the shelf | before the F2-type and the reverse cross hatch: drag the white share of sons (x-axis, the cross's row) | Discover (F1, F2, a white-eyed daughter and the reverse cross within six vials), Predict (both asks within ±0.12) |
| L2 | **The zigzag** — a population over generations | watch a cage of 1,000 of each sex beside an autosomal control; tap to speed up | a generation every 1.25 s, then 0.75 s | drag the next white share of sons or daughters on the trace (5 asks; voided if "no change" would hit) | Predict (4 of 5 within ±0.06), Transfer (a new cage: drag where both sexes settle, ±0.05) |
| L3 | **The lamp** — selection on males only (mutation returns white) | sweep the lamp beam over the courtship dish; a white-eyed male under it for 0.2 s stumbles and loses the female; battery 2.8 s, shrinking 15% a round | five courtship rounds, then 60 generations at speed | drag where the share of white-eyed males settles (y-axis, generation 65; scored within a factor of 1.5) | Discover (catch at least half the white-eyed males shown), Predict (balance) |
| L4 boss | **The Queen's carriers** — evidence from sons | drag a brass slider to set each woman's carrier chance, then Seal | one woman: prior, her sons step out, posterior, the exact plaque | final: share of women with red–green colour blindness (x-axis 0–5%, ±0.3 points) | Discover (certain carriers ≥ 90%; odds lowered after unaffected sons), Transfer (11 of 12 judgments within 10 points of the exact posterior, and the colour-blind share) |

**Boss inverts the lesson.** Levels 1–3 treat a carrier as a fixed genotype; the boss shows a carrier status as a probability that each son moves (`boss.inverts`).

**Unit stars** (`unitStars`): Discover in two of L1, L3, boss; Predict in two of L1–L3; Transfer = L2 and the boss.

**Juice (from `Sim.run` only):** pour of parent flies into the cross bottle, a fly arcing to its tray per hatch, sparks on a new bottle, a banner and chime on the first white-eyed daughter, stumble burst + "×" pop + hit-stop on a caught male, an exposure ring that fills under the beam, a flash in untimed mode, sons walking in (a shake on an affected son), a gold ring and sparks on sealing within 10 points.

**Ghost hand:** L1 drags the wild female onto the white male; L3 sweeps across the dish; boss slides the brass slider.

## D5 §3 checklist (as amended by D6)

| Line | Status |
|---|---|
| 1 sim chapter, (seed, level, actions) | yes: plain-JSON `s`, `R()`/`Det`/`WF` only; settings (untimed, faster) enter as logged actions; replay oracle passes on all 4 levels |
| 2 verb within 200 ms | hatch juice on the event frame; beam catch on the tick it reaches 0.2 s exposure |
| 3 felt cost grows | vials (L1); battery shrinks 15% a round while white males get rarer among red ones (L3); fewer clues per woman (boss) |
| 4 3–6 levels, each adds one variable | 4 levels |
| 5 predictions need a decision | `needMove`, ghosts start at "no change" (or the naive midpoint for the transfer, 4% for colour blindness); zigzag asks voided when "no change" would hit; the lamp share for the balance ask is chosen so "no change" misses (oracle) |
| 6 no level offers all three stars | oracle; bot sweep |
| 7 result texts chosen from the run | `interesting()` keys from what happened; What if? bodies filled from the What if? run |
| 8 answer hidden during the ask | the zigzag average line appears only after the asks; the transfer cage's mean is not drawn until scored; the chart's expected ticks appear after commit; the boss plaque only after Seal |
| 9 MODEL card per level with ×N tags and refs | mutation ×1000 tagged on canvas and in MODEL; refs per level |
| 10 phone first | 390 × 780 layouts for every level (screenshots); dock ≤ 3 unit buttons |
| 11 live graph in the strip | `ry_xy` chart type registered from this file |
| 12 learning layer | TAKE, MODEL, RECALL, BRIDGE set outside `?v1=1` |
| 13 tests | below |

## Science claims, with references (for Coordinator A)

| Claim (where) | Reference |
|---|---|
| Morgan found a white-eyed male in 1910; F1 all red; F2 3,470 red-eyed and 782 white-eyed flies, every white one male; white-eyed mothers give white sons (MODEL L1, levelWhy 0) | Morgan TH 1910, *Science* 32:120–122 (F2: 2,459 red ♀, 1,011 red ♂, 782 white ♂) |
| White-eyed flies survive less well than red-eyed (MODEL L1 `cannot`) | Morgan 1910 (deficit of whites); Reed & Reed 1950 |
| X-linked recursion q_m′ = q_f, q_f′ = (q_f + q_m)/2; the gap becomes −½ of itself; (2q_f + q_m)/3 invariant (L2) | Hartl & Clark 2007, *Principles of Population Genetics* 4th ed., ch. on X-linked genes; exact in the oracle |
| White-eyed *Drosophila* males mate less successfully than red-eyed males; cages lose the white allele (MODEL L3) | Sturtevant AH 1915, *J Anim Behav* 5:351–366; Reed SC & Reed EW 1950, *Evolution* 4:34–42 |
| Mutation–selection balance with selection on hemizygous males: male incidence ≈ 3μ/s (L3) | Haldane JBS 1935, *J Genet* 31:317–326 (haemophilia mutation rate); oracle: 0.0592 vs 0.06 (s = ½), 0.1184 vs 0.12 (s = ¼), 0.0296 vs 0.03 (s = 1) |
| Spontaneous per-gene mutation rates near 10⁻⁵ or lower; the game's 10⁻² is ×1000 (MODEL L3, canvas tag) | standard; Drosophila visible-mutation rates ~10⁻⁵–10⁻⁶ |
| The royal disease was haemophilia B, an F9 variant; Alexandra carried it, Alexei had it (MODEL L4) | Rogaev EI et al. 2009, *Science* 326:817 |
| Pedigree facts: Alice (1843–78) sons Ernst Ludwig (unaffected) and Friedrich (haemophilia); Helena (1846–1923) adult sons Christian Victor and Albert unaffected (Harald died at 8 days, left out); Helena Victoria (1870–1948) no children; Leopold had haemophilia, so his daughter Alice of Albany (1883–1981) was an obligate carrier, her son Rupert affected; Victoria of Hesse (1863–1950) sons George and Louis unaffected; Alix (1872–1918) son Alexei affected | standard genealogies; Rogaev et al. 2009 for the Romanov line |
| No cases known among Victoria's ancestors; it may have begun as a new mutation (why.real) | worded as "may"; widely stated |
| Bayesian carrier risk: daughter of a carrier ½; n unaffected sons → 1/(1 + 2ⁿ); an affected son or father → 1 (boss) | exact in the oracle |
| ≈ 8% of northern European men, ≈ 0.4% of women have red–green colour blindness; q² predicts 0.64%; lower because protan and deutan variants sit at two genes (why.real) | Birch J 2012, *J Opt Soc Am A* 29:313–320 |

Medical genetics is told neutrally (D6 decision 5); no human-population content beyond the colour-vision figure.

## Deviations from the spec, and why

1. **L1 asks one number per key cross, not four bars per hatch** (D3: "drag four bars"). One distance-scored gesture on the cross's row (white share of sons) is the discriminating quantity (autosomal answer 25% or 0 vs X-linked 50% or 100%), fits a phone strip and avoids a two-option feel. Daughters' shares are plotted as squares beside it.
2. **L1 is an investigation with a budget.** The player must find how to make a white-eyed daughter (F1 daughter × white male) within six vials; the asks open on the first F2-type and reverse crosses, whenever they occur.
3. **L2's transfer is "where does a new cage settle?"**, testing the invariant 2:1 weighting; the colour-vision transfer gesture moved to the end of the boss (D3 lists it as a transfer gesture).
4. **L3 lamp share after the manual rounds is ½ unless "no change" would already be inside the band; then ¼, else all.** Lessons rule 4; the HUD names the share. Scored within a factor of 1.5 (D3).
5. **Boss score is distance to the exact posterior, not a Brier score against truth.** Several women's true status is unknown (Helena, Helena Victoria), so a Brier score against outcomes is not computable honestly; "within 10 points on 11 of 12 judgments" replaces "Brier ≤ 0.15". A bot that sets 1 after an affected son and 0 after unaffected sons fails it (two misses).
6. **The de Finetti triangle (xhud) is not used.** Its ghost point shows the next generation's female genotypes during the zigzag asks (the answer). The scene's X-copy jars and a two-bar chart carry the per-sex read-out instead.
7. **New-stock genotypes are the expected class mix** (MODEL simplification), so later crosses use exact expectations.
8. **Six women, not the whole pedigree.** Victoria's carrier status is given (Leopold); Vicky and Louise are left out (sons who died young, no children).

## Engine requests (nothing edited)

- `wgAxes` has no explicit y-tick list; the odds chart widens its range instead.
- `Lbl.put` cannot draw a two-line label; staggered shelf labels on a phone instead.
- `Ghost.show` has no "slide" demo distinct from drag on a canvas slider (works with `verb: 'slide'`).

## Tests (build `V2_ONLY='0*,zz_*,royal.js' python3 build.py <scratchpad>/royal.html`)

- `node --check v2/royal.js`: clean.
- `node tests/lint_text.js $OUT royal`: 0 errors, 0 warnings.
- `node tests/oracle.js $OUT royal` (full, and `RY_FAST=1`): **48 passed, 0 failed** — gap ratio −½ exact; p̄ invariant; realised gap ratio and p̄ drift; autosomal control in one step; balance 3μ/s ± 10% for s = ¼, ½, 1; realised lamp cage settles at the predicted balance (ratio 1.06); white-eyed females near q²; exact boss posteriors and 1/(1 + 2ⁿ); Morgan's crosses in X-linked proportions (F2 sons 48%, backcross 46%/52%, reverse all sons white); ask expectations = the recursion from the realised state; ghosts never start inside the band; L3 "no change" always misses; replay of the action log on all four levels; snapshots; expert earns every offered star (L1 3, L2 6, L3 3, boss 5); no level offers three; no bot's union reaches three unit stars; untimed lamp; What if? runs earn nothing and match their lever; result texts; intro card.
- `python3 tests/bots.py $OUT royal --seeds 1-20 --bots alwaysA,alwaysB,random,greedy,threshold,lazy,bestNoThink`: **PASS**, best masks L1 DP- (random, one seed), L2 --T, L3 D--/-P-, boss ---; also `--untimed` (seeds 1–30) PASS. The L3 lamp share keeps "no change" at least ×1.8 outside the band, so a nudge from the start never scores (an untimed sweep found this).
- `python3 tests/royal_paths.py`: **0 failed** — real drag cross; drop elsewhere does nothing; keys + dock cross; untimed lamp waits and a tap flashes; a pointer sweep catches males and drains the battery; Enter before the slider seals nothing; arrows + Enter seal; What if? "Autosomal gene" from the card; Calm; `?v1=1` has no v2 Royal Line.
- Monkey `GAME_HTML=$OUT python3 tests/monkey.py royal 1,2,3 --vp 390x780,1280x720`: **6 of 6 runs reach the end card**, no warnings (an earlier run stuck once at 1280 × 720 on the first cross, because a blind tapper rarely hits two small bottles in turn; the dock path "Next ♀ / Red ♂ / White ♂" fixed it and is also the keyboard path; dock labels kept to two words).
- `resultBits` and `notes()` checked headless on every level.

## Screenshots

`tests/royal_shots.py` writes every level and phase at 390 × 780 and 1280 × 720 to the scratchpad (`royal/s*`). Fixes made after looking:
1. L1 phone: bottles were tiny and labels overlapped; the cross bottle sat on the goals row → new band layout (shelf, band with cross bottle + notebook + vials, plate), staggered labels, a four-female shelf.
2. L1 chart: rows ran bottom-up with clashing labels → cross 1 on the top row, own row numbers, legend at the foot.
3. L2: unsigned-hash bug (`>>` on a 32-bit hash) left the control cage empty on some generations → `>>>`.
4. L2: the X-copy jars ran off the phone screen → a fixed-width read-out panel under the cage.
5. L2: a ring flashed on every generation and looked like a lens artefact → removed.
6. L3: flies too small to tell white eyes → larger flies and eyes; battery and tally moved to the dish's foot on a phone.
7. Boss: side curls drawn at eye height looked like huge eyes → hair over the ears, small eyes, a mouth, a pearl band.
8. Boss: plaques and labels collided on a phone → stacked layout, the rail removed (the strip chart holds it), the "two worlds" Bayes bar drawn in the slider's place after Seal.
9. L1 desktop: the banner covered the shelf → banners sit over the bench (L1) or the portrait (boss).
10. HUD and top bar disagreed on the generation → the bar shows the HUD number.

## Instructor note (one page)

**What students do.** Repeat Morgan's 1910 crosses with a vial budget (and discover the backcross that makes a white-eyed daughter); predict the white share of sons; watch the X-linked approach to equilibrium leapfrog beside an autosomal control; act as a lamp that selects only white-eyed males and predict the mutation–selection balance; then compute exact carrier odds for six women in Queen Victoria's family.

**Key ideas.** Hemizygous males show recessive X-linked alleles; sons' X comes from the mother; the reciprocal cross differs; q_m′ = q_f, q_f′ = (q_f + q_m)/2; the gap halves and flips; p̄ = (2q_f + q_m)/3; every hemizygous male exposes the allele, so selection purges a recessive X-linked allele much faster than an autosomal one (Δq ≈ −sq/3 against −sq²), and mutation holds it at a far lower balance, 3μ/s against √(μ/s) (corrected 23 Oct 2026: the first draft said the opposite); incidence q in men and q² in women; Bayesian updating from sons.

**Prompts (rising Bloom).** (1) Why do X-linked recessive conditions show far more often in men? (2) Why is a recessive X-linked allele purged faster than an autosomal one, yet never lost? (3) This pedigree ignores new mutations and X inactivation: when would that mislead a genetic counsellor?

**Projector moment.** In the boss, the class sets Helena's posterior together before Seal (most say 0 or 50%; the plaque says 20%).

**Model limits.** Discrete generations, random mating, no viability cost of white eyes, ×1000 mutation rate, no X inactivation, no new mutations in the pedigree.

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open The Royal Line from the menu; read the card (≤ 100 words); press Play. Does the fly room feel like 1910 and unlike Equilibrium?
2. L1: drag the wild female onto Morgan's male. Then try to get a white-eyed daughter without a hint. How many vials did it take? Was the reverse cross's result a surprise?
3. L2: before generation 1, predict the sons. Did you expect them to copy their white-eyed fathers?
4. L3: sweep the lamp. Does it feel like a game (whack-a-mole) and does the white allele's persistence surprise you?
5. Boss: is Helena's 20% clear after the reveal? Is the "two worlds" bar readable on a phone?
6. Check: any text you could not read at 390 px? Any moment with nothing to do for more than 3 s?

## Session status

Built; oracle (48/48), bots (timed and untimed), paths (11/11), lint (clean) and monkey (6/6 at two sizes) pass on the unit build; screenshots looked at and fixed over three rounds (final set in the scratchpad `royal/final`). Still to do: the three-reviewer round, the full-build checks (`golden.py check` legacy 48 and `--v1`), a 1024 × 768 monkey pass, `?cvd=mono/deut` screenshot pass, and Coordinator A sign-off on the claims table.

## Simplification (D6 decision 9), 23 October 2026

Before changing anything I played all four levels at 390 × 780 (and later at 360 × 640, 780 × 390 and 1280 × 720); the screenshots are in the session scratchpad (`s3/simp_royal_tap/royal0` before, `royal1`–`royal3` after). The fly room, the lamp dish, the gallery, the portraits and the juice stay. What was heavy:
- **Seven prediction interludes, on three kinds of gesture** (two in L1, five zigzag asks plus a "new cage" transfer in L2, a balance ask in L3, a colour-blindness ask at the end of the boss). On a phone the strip covered the cage before the player had seen it.
- **L2 had no verb of its own**: the player watched and was quizzed.
- **The lamp had two limits at once** (a 6 s round and a shrinking battery), and the battery label collided with the pills on small phones.
- **The L1 hints used jargon** ("Next: the F2") and the shelf named bottles "Cross 2 ♀", so a player could waste vials not knowing which bottle was the F1 daughter.

### What was removed or merged, and why

| Removed or changed | Where | Why |
|---|---|---|
| The F2 ask ("F1 daughters × red males: white sons?") | L1 | **One prediction is kept for the chapter: the reverse cross** ("White-eyed mothers × red-eyed fathers: what share of their sons will have white eyes?"). It is the aha: under an autosomal model the answer would be "none, as in the F1"; on the X every son is white. The ghost starts at 0% ("as in the F1"), outside the ±12-point band. It carries the Predict star. |
| Five zigzag asks and the "new cage" transfer ask | L2 | Replaced by a verb and the key equation shown plainly. **Tap Breed** (the dock button, the cage, Space or Enter) breeds each of the first four generations; the HUD reads the rule with that generation's numbers ("Sons copy their mothers: 50%. Daughters average both parents: 50%."), and the X-copy read-out has the equations beside its rows (q♀′ = (q♀+q♂)÷2, q♂′ = q♀). Generations 5–10 then run, and the HUD names the settling point: "Both settle at (2q♀ + q♂) ÷ 3 = 33%: females hold two X copies." A generation breeds by itself after 6 s untouched, so play never stalls. The male line on the strip chart is now dashed, so the leapfrog reads in the folded phone strip. |
| The balance ask (and the ½ / ¼ / all lamp share chosen to dodge "no change") | L3 | The lamp now always catches half the white males after the five rounds (P.s = 0.5). While the 60 generations run the HUD says "Every white-eyed male is exposed to the lamp, so white is purged fast", then shows the key number: "Balance: q♂ ≈ 3μ ÷ s = 3 × 0.01 ÷ 0.5 = 6.0%". The chart draws the 3μ ÷ s line from generation 25. |
| The lamp battery (timed play) | L3 | The 6 s round is the only limit; the beam stays on while the pointer is down. The battery survives only as the flash budget in untimed play (labelled "Flashes"), where something must end a round. The catch tally is labelled ("caught 2/12") and sits under the pills, or above the dish on short screens; "Mutation ×1000" moves to the top left on a phone. |
| The colour-blindness ask at the end of the boss | Boss | A transfer gesture that was not the boss's idea. The q-in-men, q²-in-women point stays where it already lived: L3's card body and the boss's Why? card (8% of men, q² = 0.64% predicted, about 0.4% seen because two genes are involved). |
| Helena Victoria's second judgment | Boss | She had no children, so the player was made to re-set the slider with no new evidence. Her "after sons" chance now seals itself at her prior ("No sons, so nothing new: her chance stays 10%"), and it is not scored. The boss now has **11** judgments. |
| Hint texts and bottle labels | L1 | The HUD names the next pair ("Next, the F2: cross an F1 ♀ bottle with a wild red-eyed male.", "Next: cross an F1 ♀ bottle with the white-eyed male.", "Last: cross the white-eyed ♀ bottle with a red-eyed male."). New bottles are labelled "F1 ♀" and "F2 ♀" by the cross that made them. |

The four levels stay (each teaches one idea: the reciprocal cross, the X-linked approach to equilibrium, selection on hemizygous males against mutation, Bayesian carrier risk). Equilibrium's MODEL card points here for the leapfrogging sexes, so the zigzag level is kept, now short and tap-driven. `content.intro.how` now reads "Drag a female bottle onto a male bottle to cross them; once, drag on the chart to predict. Later you breed a cage, sweep a lamp and set carrier odds."

### Stars, re-balanced

| Level | Discover | Predict | Transfer |
|---|---|---|---|
| L1 Morgan's bottles | white-eyed daughter and reverse cross within six vials (unchanged) | **the one prediction**: the reverse cross's white sons, ±12 points (was both key crosses) | — |
| L2 The zigzag | — | — (was 4 of 5 zigzag asks) | — (was the new cage) |
| L3 The lamp | catch at least half the white-eyed males (unchanged) | — (was the balance ask) | — |
| Boss | every certain carrier marked, odds lowered after unaffected sons (unchanged; now counts 11 judgments) | — | **10 of 11** odds within 10 points (was 11 of 12 plus the colour-blind share) |

Unit stars: Discover in two of L1, L3 and the boss; Predict = L1; Transfer = the boss. No level offers all three. L2 offers no star: it is a short demonstration with one verb, and its card shows no "still to earn" line.

### The 19 review findings (`royal_review_pending.md`), verified

| # | Finding | Verdict and action |
|---|---|---|
| P1 | Boss HUD counter "0/0" unlabelled | Real. Now "±10 pts n/m", hidden until the first seal. |
| P2 | L2 first ask after 1.4 s, strip hides the cage | Overtaken: the zigzag asks are gone; the level opens on the cage with "Tap Breed" and a ghost hand on the cage. |
| P3 | Helena Victoria re-set with no new evidence | Real. Her second chance seals itself and is not scored (above). |
| P4 | Lamp labels collide at 360 × 640 and 780 × 390 | Real. The battery is gone in timed play; the tally moved; "Mutation ×1000" moved to the top left on phones. Checked at both sizes. A transient whisper can still sit over the tally for a second on 360 × 640. |
| P5 | L1 banner over the goals and vials; vials shown three times | Real. On phones the banner sits over the empty plate and the in-scene "Vials" pill is dropped (the HUD and the tubes carry it); the tubes moved below the goals card. The 780 × 390 landscape bench stays cramped (the plate is cut off at the foot): not fixed here. |
| P6 | L1 chart points at 0% / 100% half-clipped; "you"/"expected" overprint | Partly fixed: the x range is inset (−5% to 105%) so the markers are whole. The "you"/"expected" pair at 100% is drawn by the engine's `Predict.reveal` and still touches on a phone (engine request). |
| P7 | Zigzag unreadable in the folded strip | Fixed in part: males dashed, females solid; the jars and the HUD now give the numbers each generation. |
| P8 | L1 bottles unnamed; HUD jargon | Real. Bottles "F1 ♀", "F2 ♀"; the HUD names the pair. |
| P9 | Two-worlds bar reversed against the slider | Real. The bar keeps the slider's 0% left / 100% right labels; "carrier" and "not carrier" are written inside their own fills. |
| P10 | Card chart y labels overprinted | Fixed for the odds chart (x range from 0, leaving room for the labels); the colour-vision chart is gone. |
| S1 | **L3 lesson backwards** ("selection on males alone removes white slowly") | **Real, high.** A recessive X-linked allele is exposed in every hemizygous male: Δq ≈ −sq/3 (linear) against −sq² for an autosomal recessive, and the balance is 3μ/s against √(μ/s) (Haldane 1935; Hartl & Clark 2007). Rewritten: chapter take ("A recessive gene on the X shows in sons and hides in daughters. Exposed in males, it is purged fast."), L3 take, L3 body (adds the autosomal √(μ ÷ s) for comparison, from the run's μ and s), the "No new mutations" What if? body, teacher prompt 2, a new L3 Why? chunk (μ = 10⁻⁵, s = ½: 0.45% autosomal against 0.006% on the X) and this log's instructor note. |
| S2 | "Mosaic carrier females" in a fly MODEL | Real (Drosophila compensates dosage by hyper-transcribing the male X; no X inactivation). Replaced by "any cost to white-eyed females". |
| S3 | q² = 0.64% labelled "exact" | Overtaken: the colour-vision ask and its chart are gone; the Why? card already says q² predicts 0.64% and about 0.4% is seen (two genes). |
| S4 | "It removes half of them" when the share could be ¼ or all | Overtaken: the share is always ½ now, and the "low"/"high" texts went with the ask. |
| S5 | "Exact" posteriors ignore daughters' and grandsons' evidence | Real. The boss MODEL simplification now says so. Scoring unchanged (Victoria of Hesse with Prince Philip's evidence would be ≈ 16%, inside 10 points of 20%). |
| S6 | Morgan 1910 did not name the X | Real. Now "By 1911 these crosses led him to place a gene on a chromosome, the X. Bridges proved it in 1916." (`bridges1916` added to the refs.) |
| S7 | "{a}% white" read as eye colour in the autosomal What if? | Real. Now "{a}% white copies". |

### Science
Changed claims are listed above (S1, S2, S5, S6, S7). The model, the recursion, the posteriors and the 3μ/s balance are unchanged and still checked by the oracle.

### Real biology (D6 decision 10)
Already met: real *Drosophila* with visible eye colour in milk bottles, a courtship dish, portraits of the real family. The X-copy rods and the charts are read-outs beside them.

### Tests (build `V2_ONLY='0*,zz_*,royal.js,tap.js' python3 build.py <scratch>/rt.html`)
- `tests/oracle_royal.js` updated: only the reverse cross asks, once; its ghost starts outside the band; the zigzag waits for a tap and breeds by itself after 6 s; timed lamp spends no battery; Helena Victoria seals herself and 11 judgments count; star offers `[3, 0, 1, 5]`; the realised lamp cage settles at the recursion's balance (`s.balE`); the autosomal What if? tolerance widened to 0.08 (10 generations of drift at N = 1,000 have SD ≈ 0.025). **51/51.**
- `tests/royal_paths.py`: 12 ok (a real tap on the cage and the dock "Breed" each breed a generation; the pointer sweep spends no battery). `tests/royal_shots.py` unchanged (the expert policy now taps Breed).
- Lint 0/0; `dup_globals` ok; bot sweep (seeds 1–20, 7 bots) PASS, best masks L1 DP- (random, rare), L2 ---, L3 D--, boss ---; untimed sweep PASS; monkey seeds 1–3 at 390 × 780 and 1280 × 720: 6 of 6 reach the end card.
