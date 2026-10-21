# Switches (`switch`): Wave 2 unit log

*Unit builder, 21 October 2026. File `games/endless-forms/source/v2/switch.js` (`CH_SWITCH_V2`, replaces legacy `CH_SWITCH` in `ch25.js`; `?v1=1` still plays the legacy chapter). Tests: `tests/oracle_switch.js`, `tests/switch_shots.py`, `tests/switch_paths.py`. Spec: D1 §3.9, D5 §4 item 12, D6 (incl. 21 Oct addendum), sweep G2 rows for ch25.js. Not committed; nothing outside these four files was edited.*

## 1. What was built

**World (D6 addendum 7).** A dark-field fluorescence microscope: a black field of view with dust and an aperture ring; embryos stained in five fluorophore inks (Scr cyan, Antp lime, Ubx magenta, abd-A violet, Abd-B coral) that add towards white where they overlap; the larva's denticle belts shine white as in a real dark-field cuticle prep; the adult unfolds as glowing line art, each segment tinted by the gene that set it. The boss moves to a cold, clear lake (teal-black water, light shafts, weed bed). Accent `#D63CC4` (stain magenta). Blue/amber allele inks appear only in the L6 allele-share graph (deletion share in ink `a`).

**Feel.** The designer loved the construction-toy feel, so the bench is a "monster workshop": tap or drag-paint cells and the embryo stain changes at once; Hatch plays larva → pupal case → three cracks → adult (D4 §5.3 timing: ≈1.9 s first time, 1.1 s after, tap to skip, crossfade in Calm). Failed orders hatch as monsters (four-winged, legless, antennae on the thorax) against the order's dashed ghost, with a tick or ring per segment.

| L | Name | Adds (one variable) | Verb | Prediction gesture | Stars it can give |
|---|---|---|---|---|---|
| 1 | Paint the segments | the gene furthest back wins (posterior prevalence) | tap/drag cells (Ubx off/low/high); Hatch | `Predict.ask` y on the "Legs per fly" chart: leg pairs of two heat-shock/deletion vials (Ubx everywhere 0, Ubx deleted 4, whole BX-C deleted 6; ghost starts at 7) | D (3 orders built: bithorax, Antennapedia, halteres-for-wings), P (both vials exact) |
| 2 | Legs on the abdomen? | Hox genes that stop legs | tap segments to mark legs; paint; Hatch | in-canvas set: mark every legged segment after deleting abd-A (answer: no new legs), then after Lewis's whole-complex deletion (T1–A8); Hamming ≤ 1 over both | D (legs on A1 built by Ubx low or off in A1), P |
| 3 | Colinearity | the order on the chromosome | drag each gene's front-edge tab (or tap a lane); Hatch | rebuild 4 of 5 one-edge mutants; first-try match scored by identity | D (3 of 4 rebuilt), P (3 of 4 first try) |
| 4 | Body plans | other arthropod bodies | drag the Ubx/abd-A edge along the thorax; Check | `Predict.ask` x on the "Feeding legs" scatter your three builds made: mantis shrimp (5 pairs) → edge T6 | D (brine shrimp, woodlouse, lobster built), T (mantis edge exact) |
| 5 | The circuit board | enhancers against coding changes | tap a switch on the Pitx1 board (3 enhancer chips, 2 exon changes), mark tissues, Lock in; Send | in-canvas set: mark which of pituitary, jaw, pelvis go dark before each test; ≥ 3 different tests, ≤ 1 mismatch | D (tested the pelvic enhancer and a coding change, then sent the clean one), P |
| 6 | The lake (boss) | selection in a population | tap open water (trout) or weeds (nymphs); tap a predator to remove | `Predict.ask` y on the deletion-share trace: share at generation askGen + H (H 12/15/18 by seed), then after the trout return (2–4 trout, 8–20 generations by seed) | P (first call, counted), T (second call, counted) |

`content.boss.inverts`: "You set switches by hand; in the lake, predators select which switch spreads, and slowly." Unit stars (`unitStars`, D1 §3.9): Discover = L1 D; Predict = a bench call (L2, L3 or L5 P) **and** the L6 curve; Transfer = L4 T **and** L6 T. No level offers all three.

## 2. Model and science claims (for Coordinator A)

| Claim on screen | Reference (id) |
|---|---|
| In each segment the most posterior Hox gene switched on usually sets identity (posterior prevalence); the grid ranks Abd-B > abd-A > Ubx > Antp > Scr; no Hox → antennae | Duboule & Morata 1994 Trends Genet 10:358 (duboule1994); Struhl 1981 Nature 292:635 (struhl1981) |
| bithorax flies with four wings; Contrabithorax-like gain makes T2 T3-like; whole-BX-C deletion makes segments behind T2 T2-like; colinearity | Lewis 1978 Nature 276:565 (lewis1978) |
| Antp switched on in the head turns antennae into legs | Schneuwly, Klemenz & Gehring 1987 Nature 325:816 (schneuwly1987) |
| Ubx everywhere makes the thorax A1-like; abdomen unchanged | González-Reyes & Morata 1990 Cell 61:515 (gonzalezreyes1990) |
| Losing abd-A gives legless, A1-like segments (fixes G2's "abd-A legs" bug) | Sánchez-Herrero et al. 1985 Nature 313:108 (sanchezherrero1985) |
| Abdominal Hox proteins repress Distal-less | Vachon et al. 1992 Cell 71:437 (vachon1992) |
| Larval identity is read from the cuticle (denticle belts, Keilin's organs) | Nüsslein-Volhard & Wieschaus 1980 Nature 287:795 (nussleinvolhard1980) |
| Hox colinearity shared with mice and other animals | McGinnis & Krumlauf 1992 Cell 68:283 (mcginnis1992) |
| Crustacean Ubx/abd-A front edge tracks maxilliped number; brine shrimp edge T1 (0), woodlouse T2 (1), lobster T4 (3) | Averof & Patel 1997 Nature 388:682 (averof1997); Averof & Akam 1995 Nature 376:420 (averof1995) |
| Changing Ubx in an amphipod shifts which legs look like feeding legs | Liubicich et al. 2009 PNAS 106:13892; Pavlopoulos et al. 2009 PNAS 106:13897 |
| Mantis shrimp: 5 maxilliped pairs (anatomy); its edge at T6 is **the rule's prediction**, tagged designed, HUD says "If the rule holds" | textbook anatomy; extrapolation flagged |
| Pitx1 pelvic enhancer deletions remove pelvic spines, protein intact; deletions show positive selection; repeat-rich DNA "may" raise their rate | Chan et al. 2010 Science 327:302 (chan2010); Shapiro et al. 2004 Nature 428:717 (shapiro2004) |
| Pelvic reduction maps to Pitx1, largely recessive | Shapiro et al. 2004; Cresko et al. 2004 PNAS 101:6050 (cresko2004) |
| Mice lacking Pitx1: hindlimb and pituitary defects | Szeto et al. 1999 Genes Dev 13:484 (szeto1999) |
| Enhancer vs coding change and pleiotropy; how much evolution runs through enhancers is debated | Carroll 2005 PLoS Biol 3:e245 (carroll2005); Stern & Orgogozo 2008 Evolution 62:2155 (stern2008); Hoekstra & Coyne 2007 Evolution 61:995 (in Why?) |
| Fish predators reject spiny sticklebacks; insect predators and low calcium proposed as causes of spine loss (**Contested** pill on L6) | Hoogland, Morris & Tinbergen 1956 Behaviour 10:205; Reimchen 1980 Can J Zool 58:1232; Bell et al. 1993 Evolution 47:906; Marchinko 2009 Evolution 63:127 |
| A rare recessive is exposed only in q² homozygotes: Δq ≈ s q²(1 − q); dominant starts faster | Haldane 1924 (haldane1924) |

**Tagged parameters.** L6 mutation intact→deleted 0.01 per copy per generation (×N), ±8 survival points per predator (×N), 26–74 generations (×N), N = 200 (designed). L1 Ubx two doses, 7 columns, 5 of 8 Hox genes (designed). L5 fates (no pituitary = not viable; weaker protein dims all tissues) designed.

**Model simplifications stated on MODEL cards:** Antp on from T2 back (hidden behind posterior genes); Scr one segment wide; Ubx low up to T3 and high from A1 (designed); edges snap to whole segments, no parasegments; adults drawn although most such flies die as embryos; Ubx/abd-A read as one stain; Pitx1 drawn as a simple board with three tissues.

**Items for Coordinator A to check:** (1) the exact species list in Averof & Patel 1997 (we present woodlouse T2 and lobster T4 as representative of their 1- and 3-maxilliped groups); (2) Liubicich/Pavlopoulos wording kept deliberately general; (3) Marchinko 2009 is cited as support for insect-predator selection on spines, inside a Contested card.

**Deliberate model choices made while building (science).**
- First draft had Antp on in T1 (to make Scr loss give T2-like T1). Posterior prevalence then made wild-type T1 T2-like (a bug found in the judged-fly screenshot). Fixed: Antp from T2; Scr-loss and "Antp front edge into the head" mutants dropped from L3 because a front-edge model cannot express them honestly (real T1 co-expresses Scr and Antp).
- "Antp everywhere" vial dropped for the same reason (its T1 outcome is not clean in the literature); vials are Ubx everywhere, Ubx deleted, whole-BX-C deleted, each with a direct source.
- L3 mutant "bxbxd" (Ubx edge to A2–A7) is described by its phenotype (four wings, legs on A1), not as a named allele.

## 3. Deviations from the spec, with reasons

1. **D6 intro card** replaces "no card before the first action" (D6 8). The ghost hand still demonstrates on Ubx/T3.
2. **Predictions in L2, L3, L5 are in-canvas gestures** (marking a set of segments or tissues; a first-try edge drag scored by identity), not `Predict.ask`: Predict has no set kind. They are logged sim actions, need a decision (Lock in refuses an empty mark set), and are scored against the model. L1, L4, L6 use `Predict.ask` with `needMove`, `soft: null` and a sim timeout that scores nothing.
3. **L6 runs 26–74 generations** with a seed-varied horizon (H 12/15/18), trout count (2–4) and tail (8/14/20), so a fixed guess cannot farm the curve (see §5). The trout return once the deletion reaches 60% (or 16 generations after the first call's target), so the second question always starts from a common deletion.
4. **Role** is `experimenter`; L6 makes the player the selective environment (stocking predators), as D1 says.
5. **Level count 6** (D5 3–6 allowed).
6. **Size**: 131 KB raw, 40 KB gzip (lessons ask ≤ 90 KB raw). Comparable to other Batch 2 units (38–65 KB gzip); the four painters (fly, larva, crustacean, fry/lake) are most of it. Flagged for the coordinator.
7. **What if?** only in L6 (levers: dominant deletion, no new mutations); the bench levels have no freezer meaning, so the card omits the button (API §13.5).

## 4. Engine requests (not done; worked round in this file)

- A `set` kind for `Predict` (mark several items, Hamming scored) would let L2/L5 live on the strip.
- An empty-dock state: L6 shows a disabled "Season set" button while predators are locked.
- A `forest`/`microscope` place id; `place: 'lab'` used.

## 5. Tests (final numbers, scratch build `V2_ONLY='0*,zz_*,switch.js'`)

| Check | Result |
|---|---|
| `node --check v2/switch.js` | clean |
| `node tests/lint_text.js $OUT switch` | 0 errors, 0 warnings (also on a full build with every v2 file) |
| `node tests/oracle.js $OUT switch` | **38 passed, 0 failed** (identity: all 48 states × 7 columns against an independent reference, 4,000 random grids; named mutants; every order solvable; L3 one-edge mutants; L4/L5 rules; L6 recursion vs simulation p6 0.53 vs 0.52, t6 within 0.05; dominant > 2× recessive early; trout balance √(μ/s) = 0.177 exact; determinism; snapshot 9 KB; replay from log (lake and bench); expert earns all 3 unit stars on 8 seeds; no level offers 3 stars; What if? thaws; bot unit union ≤ 0–2) |
| `python3 tests/bots.py $OUT switch --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,naive` (and `--untimed`) | PASS; best cells: random D/T/P ≤ 0.3 mean; threshold (middle guesses) L6 P+T 0.2 mean; no 3-star level |
| `GAME_HTML=$OUT python3 tests/monkey.py switch 1,2,3 --vp 390x780,1024x768,1280x720` | **9 of 9 reach the end card**, no warnings, no NaN, ≤ 24 visible words |
| `tests/golden.py check $OUT` / `--v1` | 47 ok + 1 skipped / 48 ok |
| `tests/switch_paths.py $OUT` | 14 ok (keyboard-only build, untimed ask stays open, Calm hatch, teacher step, What if? chip thaws and reaches a card, `?v1=1` legacy chapter) |
| `tests/switch_shots.py $OUT OUT --vp 390x780,1280x720 --cvd mono,deut --intro` | 140 screenshots, no errors or label/whisper warnings |

**Known soft spot.** A fixed L6 guess lands within tolerance on up to ~46% of seeds for one of the two calls (answers cluster because the recessive curve is flat early); the oracle bounds it at 50%, and the unit Predict/Transfer stars also need L2/L3/L5 and L4. Tolerances are 0.07 (first call) and 0.05 (second).

## 6. Self-review (playtester/art director, adversarial biologist, D5 §3)

| Issue found (screenshots or reading) | Verdict | Action |
|---|---|---|
| Wild-type T1 hatched as T2 (Antp beat Scr) | blocker | Antp from T2; L3 pool and vials re-chosen (§2) |
| Order "ticket" thumbnail unreadable and overlapping the embryo | high | order drawn as a pulsing dashed ghost fly behind the embryo, aligned with the columns |
| Crustaceans were thin worms with tiny legs; huge empty phone area | high | redrawn: body ×1.2, limbs ×1.3, swimmerets, carapace, claw; rail lower; dashed ghost of the ordered feeding legs |
| Pitx1 chip labels overlapped; traces crossed | high | short labels inside chips; jaw chip moved under the jaw so no traces cross; a dashed "protein bus" from the exons to all three tissues shows pleiotropy |
| Lake fish looked like insects; nymphs hidden; dock added all nymphs to one spot | high | new stickleback sprite (shaded body, plates, small dorsal spines, pelvic spine), 48 visible fish of 200, nymphs above the labels, counts moved to the top, dock reads counts at click time |
| "That is the fly" for crustaceans; "hatching" a mantis | medium | crustacean texts ("That is the body plan", "The rule's prediction for the mantis shrimp") |
| L3 "off" tab and label off-screen on phones | medium | board uses 7.7 columns in L3; "off" label to the left |
| L2 card chart empty at the end | medium | last fly kept at `over` |
| L1 vial ask opened a strip with an empty identity chart | medium | during vials the strip shows only "Legs per fly" |
| Constant "100%" bot won L6 P | high | horizons spread and capped below saturation; tolerance tightened |
| Random sends earned L5 Discover by luck | medium | Discover needs the pelvic enhancer and a coding change tested first |
| BX-C shown as an acronym in a HUD | low | "Deleted: Ubx, abd-A, Abd-B" |
| Mantis edge presented as fact | science | HUD "If the rule holds"; MODEL tag designed |
| Agency lint: "predators decide" | science | "predators select" |

D5 §3: lines 1–13 pass except 11's axe-core (not available offline) and 9's Coordinator A sign-off (pending). Line 14 is the playtest script below.

## 7. Instructor note (one page)

**Concepts.** Hox genes as selector genes; posterior prevalence; Hox genes repress legs in the abdomen (and abd-A loss gives legless A1-like segments, a classic misconception); colinearity; Hox boundary shifts in crustacean evolution; cis-regulatory modularity vs coding pleiotropy (Pitx1); selection on a recessive allele in context (slow start, slow loss, mutation–selection balance teaser).
**Running it.** 20–25 minutes. Projector: `?unit=switch&level=N&teacher=1` (teacher Step advances the lake by generations). Result codes on assignment links (`?unit=switch&seed=…`): bits = level, stars, orders/tests, the two predictions, mismatches.
**Discussion prompts.** (1) In a segment where Ubx and abd-A are both on, which sets what grows? (2) Why are whole-segment changes rare in evolution, while enhancer changes are common? (3) This model has five genes and seven segments: what does it hide about real Hox regulation? (model critique)
**Misconceptions to watch.** "Delete abd-A → legs" (L2 trap); "Painting Antp/Ubx everywhere changes every segment" (L1 vials); "Any mutation that removes the pelvis will do" (L5); "A favoured allele spreads fast" (L6 recessive start) and "the trout will clear it" (it lingers in carriers, topped up by mutation).
**Class-pool chart.** `teacher.pool: 'trace'` (the L6 deletion-share trace).

## 8. Designer-and-colleagues playtest script (D6 decision 4)

1. Open Switches from the menu; read the card; press Play. *Note:* is the microscope world clear in 5 s? Does the ghost hand make the first tap obvious?
2. L1: build the three orders. Hatch at least one wrong fly on purpose. *Rate 1–5:* how much fun is painting and hatching? Is the larva → adult sequence satisfying or slow?
3. L1 vials: predict the leg pairs. *Ask:* did the idea "the gene furthest back wins" land before or after the vial?
4. L2: mark legs after deleting abd-A. *Note* whether the player expected abdominal legs (the trap). Then build legs on A1.
5. L3: rebuild the mutants. *Ask:* did the chromosome fan make colinearity visible? Was dragging the tabs comfortable on a phone?
6. L4: build the three crustaceans; predict the mantis shrimp. *Ask:* did the feeding-leg graph feel like evidence?
7. L5: test at least one enhancer and one coding change; send the clean one. *Ask:* did the "protein bus" explain why coding changes hit every tissue?
8. L6: stock the lake, predict twice. *Ask:* was the slow start a surprise? Did the trout question feel fair? Try What if? → Dominant deletion.
9. *Overall:* enjoyment 1–5; any moment of boredom (where); any text you skipped; anything that felt scientifically off.
