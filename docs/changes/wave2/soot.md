# Wave 2: The Black Country (`soot`)

*Unit build, 14 Oct 2026. File `games/endless-forms/source/v2/soot.js` (`CH_SOOT_V2`, replaces legacy `CH_SOOT` by id; `?v1=1` still plays the legacy chapter). Tests I own: `tests/oracle_soot.js`, `tests/soot_shots.py`, `tests/soot_paths.py`. Spec: D1 §3.1 (Wood arc L4–L6), D5 §4 item 2 and §3, D6, D4 §5.3, D2 §8 and §15. No engine file was edited.*

## What I built

The player is again the jay of the Lichen Wood (role `environment`; L6 is the investigator). The wood is the one the Lichen Wood saved (`Save.res.get('wood')`: A and B copy shares and shade), or a default L3 wood (A 0.18, B 0.23, shade 0.72 ± 0.07, which gives D1's checked morph shares 0.33/0.27/0.41). Teacher mode ignores the save, so shared seeds stay canonical.

| Level (in-unit) | D1 | Adds | The minute | Predictions (gestures on the live graph) | Stars |
|---|---|---|---|---|---|
| 1 The Black Country | L4 | a dominant black allele | Soot settles (4 s haze, ≤ 40 flecks, chimneys smoking). One tagged origin: 12 Cc moths, p = 0.05. You hunt the 30 moths on your trunk (12 s, 12 meals feed 4 chicks); three designed jays copy your choices on the other three trunks. Dusk: other trunks' losses, eggs at the true ratio (dot = 4 eggs), winter cull in six batches, survivors' black share as a diamond in the in-scene drawer chart. 8 generations, ≈ 1848–1890. | a1 *When will black pass 75%?* (time, ±2 gen; the rebuilt TRANSFER.soot); a2 *tap the triangle where tomorrow's newborns sit* (HW, ±0.08); a3 *black share tomorrow?* with the survivors' copies in the jars (±0.06) | D: chicks fed ≥ 70% and black passed 75%. P: 2 of a1–a3. T: t4 *what if black needed two copies? black share tomorrow* (±0.07), counted once black has risen |
| 2 Clean air (boss) | L5 | reversed bark | Clean Air Act 1956: the chimneys stop, lichen regrows over three generations (bark 0.75 → 0). Black now stands out, yet lingers (92, 94, 93, 92, 89, 85 … % expected) before plunging. Up to 16 generations; ends at the dusk after black first dawns below half. | b1 *When will black fall below half?* (time, ±2); b3 *tap the triangle* at gen 4 (the dusk dot now sits *below* the HW curve); b2 *black share tomorrow?* asked when a change of ≥ 8 points is due (±0.05) | D: fed ≥ 60% and black fell below half. P: 2 of b1–b3. T: t5 *which patterns will the pale moths show?* on the morph simplex (the Lichen Wood mix is marked; ±0.08) |
| 3 The evidence | L6 | a field budget | Mark–release–recapture in a sooty wood (1953) and a clean wood (1955). Tap the tree to release batches of 5 black + 5 pale (≤ 4 a night; under a branch = natural site; an open trunk or a crowded spot adds risk to both colours). Run the night: darkness, two great tits at first light, ghost rings, survivors fly into a Robinson light trap, tally card. 8 nights. A power meter (hatched to 80%) shows the chance the design reveals both differences. | c1, c2 *Before dawn: what share of the survivors will be black?* (first night in each wood, ±0.1) | D: both woods released and the reversal shows in your own tallies. P: c1 and c2. T: the verdict "Camouflage" (four idea cards, each drawn as what it predicts in each wood) at ≥ 70% confidence with ≥ 80% power |

**Per-second verb.** Tap a moth: the jay's head-and-beak shadow closes on it (90 ms telegraph), three dust puffs and a dashed ghost ring, the moth lifts 6 px and fades (≈ 300 ms), "+1" pops on the chick row and the chick squashes (220 ms), crunch. Measured act → first `Fx` call: 40 ms (`Events.lat`). A miss: one puff, "−½ s", a 4 px timer flinch. L6's verb is the release tap (dust, ring, wing sound, a whisper naming the site).

**Boss.** `content.boss.inverts`: "Black rose in a flash; with clean air, pale returns in slow motion." The player now eats black moths all morning and still finds the wood black the next day, because pale needs two typica copies and most of them hide in black Cc moths. What if? levers on the level cards rerun from the earliest frozen generation: *Two copies needed* (L4; absorbs Equilibrium L9: carbonaria crawls), *No soot*, *Pale dominant* (L5: fast return), *No migrants*.

**Live graph** (`notes()`): L4–L5 trace of black moths (solid ink) and C copies (solid blue) with the 1 − (1 − p)² ghost lying on the black line at dawn, the expected path dashed after a1/b1, and the HW triangle with dawn (hollow) and dusk (filled) dots and a trail; L6 trace of the black share of survivors per night per wood around a dashed 50% line. The in-scene drawer at the foot of the canvas is the same story in natural paint: one column per generation, black below, pale above, a paper diamond for the survivors. Gene-pool lens (Look / Genes / Jars, key L) at dusk: tokens on the trunk's survivors, the rest of the wood's survivors fly into the jars from the skyline; jars give q.

**Words.** All in `content` (lint clean). Learning layer for v2 only (guarded by `Url.v1`): TAKE, BRIDGE, MODEL and a new RECALL card overwritten; `TRANSFER.soot` deleted (rebuilt as a1). ch99's `CH_SOOT.intro.how` compression note moved into the MODEL cards.

## Science claims (refs ids in the MODEL cards)

| Claim on screen | Source / check |
|---|---|
| Carbonaria is one jumping-gene insertion in the cortex gene, about 1819; one origin | van't Hof et al. 2016 *Nature* 534:102 (`vanthof2016`); G2 sweep (mu 0, rescue migrant); oracle 2 |
| First black moth Manchester 1848; ~98% black by 1895 | already verified in G2 |
| Rise s ≈ 0.2–0.33 a year; decline s ≈ 0.1–0.2 | Haldane 1924; Cook 2003; Saccheri et al. 2008 (D2 §11 values); the game's ≈ 40% predation is tagged ×N ("selection ×2", "×3" chips) |
| Black share = 1 − (1 − p)²; the copy share is below the black share | oracle 3 (2,108 dawns: mean residual −0.0002, spread 0.018; p < B at every dawn) |
| With pale at 4%, 80% of typica copies sit in Cc moths | algebra (2pq / (2pq + 2q²) = p) in Why? |
| Kettlewell recaptured 27.5% of black and 13% of pale moths in Birmingham, 1953 | 447 carbonaria / 137 typica released, 123 / 18 recaptured (`kettlewell1955`; checked against two sources); Dorset figures left out (sources disagree) |
| Majerus released 4,864 moths at natural sites; birds took more black moths; daily s ≈ 0.1 | Cook, Grant, Saccheri & Mallet 2012 *Biol Lett* 8:609 (`cook2012`) |
| Critics questioned Kettlewell's densities and trunk releases | Majerus 1998 (`majerus1998`); **Contested** pill on screen and in the L6 MODEL card; no star depends on it |
| Clean Air Act 1956 | history |

Coordinator A has not yet signed these off.

## Deviations from the spec, and why

1. **A Sim chapter, not Hunt mode.** The integration log says Hunt-mode v2 chapters have no replay, Freezer, What if? or bot sweep, all of which D5 §3 requires. The unit keeps the Hunt look (`barkTex`, `mothSprite` through `Rig 'moth'`, the virtual 390 × 540 placement, Det camouflage) on a headless `sim`.
2. **TRANSFER.soot became the timeline gesture "When will black pass 75%?"** (D1's own L4 prediction), not a tone-histogram mean. One generation moves the mean tone by about 0.04, less than any fair tolerance, so "no change" would pass. It is asked at the first sooty dusk, so the hunt comes first (ghost hand within 3 s).
3. **Lichen regrows in three generations after the first clean-air morning, not about five.** With five (and the first morning fully sooty) black climbed back to 97% and failed to fall below half within 16 generations in about 1 seed in 5; with three the expected path lingers for six generations and crosses at about gen 10, which still shows the lag.
4. **L6 is drawn in the canvas and runs through `Sim.act`**, not the DOM `Evidence` widget: the widget's purchases are view-level and its samples would draw `R()` outside the sim (API §13.6). Its power meter and the Brier-style posterior are reproduced. Idea cards and confidence pips are on the canvas (five dock buttons truncated on a phone).
5. **The boss is L5, the last level is L6** (D1 and D5 §4 order). D5 §3.5 asks the last level to invert the lesson; L6's twist is that selection which felt total from the jay's seat is a modest edge you must measure in two woods. Flag for Coordinator B.
6. **Notation: D2 wins over D1's "q = 0.05".** C is blue (p, carbonaria, 0.05 at the start), c is amber (q); the jars print q for typica. Screen text says "C copies".
7. **L5 starts canonical** (p = 0.72, 92% black, from the seed and the saved wood), not from the player's L4 end, so a level is (seed, actions) and replays, teacher seeds and level select work (D2 persistence rule). The wood's patterns and shade carry through.
8. **The other trunks' jays copy a per-colour catch rate** fitted from your trunk (shrunk to the designed rule by 2 pseudo-moths), not D1's dᵢ·aᵢᵇ search-image rule; D1 gives soot no search image.
9. **"Black share tomorrow?" in L5 is asked when a real change is due** (≥ 8 points) or at the last dusk; on the plateau "no change" would otherwise score.
10. **Prediction ghosts start away from the answer** (time asks at next generation, triangles off-centre, the morph triangle at a corner) so tapping the ghost is never a free hit.
11. **Non-visual path:** "Auto" lets the jay hunt by contrast (most conspicuous moth every 0.6 s; key A, dock button in untimed mode or for keyboard users). D2 §13's adjustable threshold is not built.
12. Dusk is 2.0 s (D4 asks about 1.7 s for the tray); `plan` is unchanged.

## Engine requests (not implemented; local helpers used instead)

1. Document the `wood` resident layout. I read `freqs[0]` = A copy share, `freqs[1]` = B copy share, `tone` = [mean, sd] on the 0 dark–1 pale scale, as `v2/lichen.js` now writes it; pins are ignored.
2. `LiveGraph` `pq`: a no-data or "?" state (it always prints a percentage), so a share can be asked without showing it.
3. `Fx.after(ms, fn)` on the frame clock for telegraph-then-act juice (I queue effects in `update`).
4. Phone strip: two 112 px charts side by side are unreadable; one chart a row, or swipe.
5. Hunt-mode replay, Freezer and bot sweep, so the Wood arc can share one hunt loop.
6. The dock's primary button is carmine; D4 rule 7 says no red or green (check the token).

## Tests (scratch build `V2_ONLY='0*,zz_*,soot.js'`)

- `node tests/lint_text.js … soot`: **0 errors, 0 warnings.**
- `node tests/oracle.js … soot`: **30 passed, 0 failed.** Determinism and snapshot replay; 12 Cc at start; no C copy without a parent over every breeding, a black migrant only as the logged rescue (eat-black bird: rescues in 46 of 60 runs); dawn black share = 1 − (1 − p)² (2,108 dawns); C share below black share at every dawn; tomorrow's p = survivors' p × (1 − 1/N), z-score SD 0.98 (the dominant-allele recursion within sampling error, L4 and L5); a3, t4 and a2 expectations equal the mean of 400 breedings from the same survivors; rise 5.1 generations vs fall 8.2 (sharp-eyed bird, 60 seeds); L5 finishable in 59 of 60 seeds; the L5 MODEL card's trajectory is the model's own projection; L6 power needs both woods, reaches 0.89 with three nights each, the posterior favours camouflage (> 0.9) in 99 of 100 seeds and one wood cannot separate camouflage from "black is tougher"; marking the expectation earns Predict in 20 of 20 seeds.
- `python3 tests/bots.py … soot --seeds 1-40`: **PASS**, no bot earns three stars (best masks: L4 greedy D, threshold D-T; L5 random DP-, greedy D-T; L6 greedy D-T). `--untimed` (seeds 1–15): PASS.
- `tests/monkey.py soot 1,2,3 --vp 390x780,1024x768,1280x720`: **9 of 9 reach the end card** (no error, no bad text, no warnings; ≤ 24 words on screen).
- `tests/golden.py check`: **47 ok, 1 skipped** (soot replaced); `--v1`: **48 ok**.
- `tests/soot_paths.py`: peck latency 40 ms; keyboard play (arrows, Space, A) feeds the chicks; What if? *Two copies needed* thaws gen 2 with black re-read as p² and shows its Interesting result; untimed + Calm uses looks and waits for predictions; teacher step advances generations; the saved wood reaches the sim; `?v1=1` plays the legacy chapter with its cards.
- Full build with every v2 file (engine, `lichen.js`, `soot.js`): loads headless, both chapters v2, no collisions.
- Draw time under 4× CPU throttle: median 3–4 ms; frame interval median ≈ 24 ms on a DPR-2 phone and ≈ 18–27 ms on desktop (lichen.js: 44 ms phone); 60 fps unthrottled. The bark, haze and vignette are one cached layer.

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/soot/`: `soot_390x780_*.png` and `soot_1280x720_*.png` (31 each: L4 opening haze, peck, dusk eggs and cull, each prediction and reveal, jars, level cards; L5 clean air, morph triangle, HW triangle, clean-bark hunt; L6 release, prediction, night, birds, trap, data, idea cards, verdict, end card), `sheet_phone.png`, `sheet_desk.png`, `cvd/` (mono and deut), `x/` (peck frames, keyboard, What if?, untimed, teacher, `?v1=1`).

## Instructor note (one page)

- **Objectives.** Selection on a dominant allele is fast at first because every copy shows; the return of a recessive phenotype is slow because its copies hide in heterozygotes; Hardy–Weinberg proportions return at birth even under strong selection; a field claim needs a comparison (two woods) and enough data (power). Codes C7, C1, D1, B1, A2, A3, A5.
- **Equations behind Why?** black = 1 − (1 − p)²; share of typica copies hidden = p; Δ per generation from survivors' copies.
- **Parameters.** 120 moths, 30 hunted a morning, 12 meals (≈ 40% predation, ×2–×3 real s), one pale migrant a generation, L6 nightly survival 75% vs 45% (gap ×3).
- **Simplifications.** Designed jays copy the player; generations compressed (≈ 6 years each rising, 3 falling); every L6 survivor recaptured.
- **Star rules.** See the table above; all predictions are scored against the expectation for the player's own hunting.
- **Timing.** About 10–12 minutes.
- **Discussion prompts** (`teacher.prompts`): why black moths rose faster than carbonaria copies; why black fell more slowly than it rose; what the copying jays assume about real birds (model critique).

## Designer-and-colleagues playtest script (D6 decision 4)

1. Play L4 without instructions; note the time to the first peck and whether the soot haze reads as soot.
2. At the first dusk, say aloud when you think black will pass 75%, then drag. Did the expected path surprise you?
3. In L5, say why the wood is still black after three mornings of eating black moths.
4. In L6, try to call it after one wood. What would convince a sceptic?
5. Rate enjoyment 1–5 per level; flag any moment you were idle or asked how long was left.

## Open

Coordinator A sign-off on the claims; axe-core pass; class-pool chart wiring; a settings toggle for untimed mode (engine).

## Review round (14 Oct 2026)

Three reviewers (playtest and art, science, design) raised 40 issues. I checked each one against the code, my own runs (greedy and new exploit bots, 40–60 seeds) and screenshots at 390 × 780, 360 × 640 and 1280 × 720. I fixed 35, fixed 2 in part, and rejected 3 with a reason. Where this section and the sections above differ, this section is current. Files touched: `v2/soot.js`, `tests/oracle_soot.js`, `tests/soot_shots.py`, `tests/soot_paths.py` and this log. No engine file was edited.

**Main design change: a fair rise-and-fall comparison.** The science reviewer was right. The old boss claim relied on uneven thresholds (rise to 75%, fall to 50%) and on the bark lag. Both levels now ask when black crosses **half**, from **symmetric starts**: L4 opens at 6.7% black (8 Cc moths, p = 1/30), and L5 at 6.7% pale on average (p = 0.742 ± 0.03 by seed). Soot now settles in the first morning (`SOOT4 [1]`), and the bark is clean by generation 3 (`SOOT5 [0.6, 0.3, 0]`). Designed projection: black reaches half in 5 generations, pale on bark clean at once in 6, and pale with the slow-cleaning bark in 8. Sharp-eyed bot, 60 seeds: 4.8, 6.0 and 8.0 generations. The screen and the cards now say it plainly: dominance makes pale start slowly, then plunge, and the bark adds about 2 generations. A new What if? lever, *Instant clean bark*, removes the lag so the player can see each part separately.

### Playtest and art

| # | Issue | Verdict | Action |
|---|---|---|---|
| 1 | a3 jars hidden behind the phone strip (high) | Right | On a phone, a chart-0 ask (a1, a3, t4, b1, b2, c1, c2) shows **one chart** in a strip about one figure high. The open strip drops from 356 px to about 228 px, so the jars sit in view above it (shots `L4_11_ask_jars` at 390 × 780 and 360 × 640). `jarBox()` now always clamps to the visible slice, using `Stage.zones.graph`. If the slice is under 72 px (for example with Show data open), the jars fold into one p\|q bar with C, c and q pills. Show data restores the full strip. |
| 2 | Night result shown before the night plays (high) | Right | The tally card, the strip trace and the stats now use a display copy that updates on the `tally` event. "Sent" shows at release. "Back" counts up over 0.8 s as the survivors reach the trap (`L6_05_birds`: 0/0; `L6_07_tally_countup`). |
| 3 | No feedback on the verdict (high) | Right | After Submit, each idea card fills to the posterior from the player's own recaptures, with a % label. The fill is hatched when design power was under 80%. The HUD says "Your data: Camouflage 97%. You said 80%.", or "… Too few moths to be sure." below 0.8. The data table adds a "Your data" row. |
| 4 | L6 dock overflows on a phone | Right | Labels are now Sooty, Clean, Night (aria "Run the night") and Decide. The stock moved from the HUD to the power panel. Measured overflow is 0 px for all four buttons, enabled and locked (`soot_paths` 3c). |
| 5 | Any stage tap skips the dusk | Right | Stage taps no longer skip. Only Skip or Enter does. Checked: a tap 100 ms into the dusk leaves the dusk running. |
| 6 | One release tap is unexplained; black moths unseen on soot | Right | Each tap pops a "5 + 5 moths" pill. Every released moth has a mark ring (paper on black, ink on pale), kept while it flies to the trap. The tally has "back/sent" column heads. The ring is a screen mark, not paint on the moth: Kettlewell's dots were on the underside. |
| 7 | Dusk eggs look the same whatever happened | Right | Each egg dot is tinted by its parent's colour: dark with a paper rim for black parents (below), cream for pale (above), as in the drawer. "Dot: 4 eggs" kept. The optional slide into the drawer was not built. |
| 8 | Bands too thin for a thumb | Right, fixed differently | Once the chart has laid out, the view sends a logged `tolfloor` action: the band is at least 13 px on that chart, capped at 1.6 × the science band. Because it is in the log, a replay scores the same. Bots never send it. On desktop nothing changes. |
| 9 | t5 is a quiz with no context; t4 at season end | Right | t5 has a setup line ("Black hid the patterns from the bird. Tap: …"). In L5 generation 1 the pattern triangle shows the wood's mix before the soot. At t5 the triangle is blank, and the point returns with the reveal. **Rejected:** a ghost hand to the marker, which would give the answer away (design issue 34). L4 asks were moved to generations 1, 2, 4 and 5, so t4 now comes mid-rise. Its answer is then far from the middle of the axis, and the climax plays without a pause. |
| 10 | What if? rerun is unexplained and slow | Right | The HUD says "What if: Two copies needed? The jay hunts by contrast." while the rerun auto-hunts. Reruns start in Auto by default (Auto in the dock hands control back), ask nothing, and run at about 5 s a generation (about 30 s to the card). The w_recessive text now matches the trace: black stayed rare. |
| 11 | L6 end card repeats the dominance take | Right | End cards now take a per-level take and body (`content.levelTake`, `levelBody`). L6: "Two woods and enough moths showed the reversal. One wood cannot." |
| 12 | Lens control does nothing during the hunt | Right | The Look/Genes/Jars control now shows only from dusk to the next dawn. Key L during the hunt still whispers why. |
| 13 | First prediction auto-commits silently | Right | The first ask of each level (a1, b1, c1) is untimed. On a soft timeout an untouched marker whispers "Time up: your marker stayed put." |
| 14 | LiveGraph label collisions | Engine | `v2/01_widgets.js` is not mine, so this is an engine request (end-label nudge, y title outside the plot). Mitigated here: phone asks now show a single larger chart. |
| 15 | Primary button is carmine | Engine | This is a token in an engine file. It was already logged as engine request 6. Not changed here. |
| 16 | Empty right pane on desktop L6 | Rejected (low) | The pane layout and figure heights are the engine's. A desktop-only second chart would split what phone and desktop show. The pane sizing is logged as an engine request. |
| 17 | "Black stayed rare" can contradict the chart; idle play is not nudged | Right | The card text is now chosen from the run, using catch rates on sooty mornings: `flat_idle` (few meals), `flat_ate` (black eaten as often as pale) or `flat`. A whisper "You have not tapped a moth yet." follows two idle mornings. |
| 18 | The hunt has no pressure; the peck is soft | Partly | Mornings are now 10 s in L4 and 9 s in L5 (was 12). The strike has a one-frame scale punch and a white flash (none in Calm). The felt cost still needs the designer playtest at generations 6–8 (script item 1). |

### Science

| # | Issue | Verdict | Action |
|---|---|---|---|
| 19 | The boss lesson rested on the thresholds and the bark lag (high) | Right | See the main change above. Every text that made the claim was rewritten: take, body, panel, boss, the stuck text, BRIDGE, teacher prompt 2 and a new Why? pace chunk. Law title: "Dominance shapes the pace". Oracle 6 now compares the rise with an L5 run under *Instant clean bark* from a fixed start, and checks the lag on its own. Oracle 7 checks that the Why? numbers (5, 6, 2) are the model's projections. |
| 20 | *Pale dominant* re-reads genotypes, so black drops at once (high) | Right | The lever now re-draws carbonaria genotypes in HW at p = √B. Black (CC) keeps the frozen share: the largest jump over 20 seeds was 0.000. w_paledom now reads "Same bird, same black share. With pale dominant, every typica copy showed, so its copies spread fast." *Two copies needed* stays a comparison at equal allele frequency, and its text says so ("Same copies, but black now needs two"). |
| 21 | "Lost while the bark was still pale" is wrong | Right | The cause is recorded at the rescue: no carrier survived (`lost_ate`), or none of the young inherited a copy (`lost_chance`, drift). The text is chosen from that, as in G2 correction 6. "Most new copies vanish like that" is gone. Oracle checked: 21 eaten and 19 chance in 40 rescued runs, and every rescued run that never passed half got a cause-specific card. |
| 22 | The trunk whisper repeats a refuted claim | Right | The whisper now reads "Open trunk: used, but less than branches." Trunk risk was removed: the site is now flavour only. "In nature" now names release density and daytime release as the main criticisms. |
| 23 | L6 judged power, not the data | Right | `posterior6()` now uses the player's own recaptures. Each wood's gap is about N(d̂, se²) under flat priors. An idea fixes its sign in each wood (\|d\| ≤ 0.05 counts as no difference), and the rest is "fits none". Transfer requires camouflage, a posterior of at least 0.8, and an expected Brier score within 0.012 of the best pip. Power is design feedback only. 'weak' now fires when the camouflage posterior is below 0.8, and reads "Your data could not yet separate the ideas. More moths in both woods would." |
| 24 | MODEL cards mix mortality with s | Right | The cards now list "eaten each morning: 12 of 30" as designed. A separate row, "selection against the conspicuous colour (s)", reads "about 0.4, rising to 0.9 as it gets rare" (L4) and "… 0.8" (L5), tagged ×N. Chips: ×2–4 and ×3–6. Measured realised s by generation (greedy, 40 seeds): L4 0.43 → 0.91; L5 0.38 → 0.77. |
| 25 | "Birds take some before dawn" | Right | Now "Birds hunting by sight take some after dawn; every survivor is recaptured the next night." The parameters are renamed "survival to the trap, matched / mismatched". |
| 26 | The card is tagged Contested | Right | `contested: false`. The canvas pill still says "Methods debated". "In nature" says Majerus's re-test confirmed the result. why.real now says "the main cause is well tested" and the single origin was "inferred from DNA". |
| 27 | "Lichen returns" framing | Right | Now "Bark lightens" and "Soot washes off and the bark lightens". "In nature" adds that the decline often began before lichens came back. |
| 28 | w_recessive mixes up moths and copies | Right | Reworded (see 20). |
| 29 | Stat tooltips assume dominance | Right | The text is chosen by `s.dom`: two copies make a moth black; the copy share is above the black share; carbonaria copies hidden in pale Cc moths. |
| 30 | L5 card says four generations in one place and three in another | Right | One figure everywhere: the bark is clean by generation 3, and the parameter reads "bark cleaning: 2 generations". |
| 31 | The start year contradicts 1848 | Right | The year now reads ≈1860 at the start, and both levels use 4 years a generation. L4 shows a "history compressed" chip, and the card says the run starts at the copy that escaped loss. |
| 32 | Interesting texts state causes unchecked | Right | flat, stuck and w_nomig are now chosen from the run (catch rates; whether black crossed half). New: `stuck_pale`, `stuck_idle`, `w_nomig_slow`. |
| 33 | Take treats a phenotype as an allele | Right | Now "Pale copies hid in black heterozygotes and returned slowly." |

### Design

| # | Issue | Verdict | Action |
|---|---|---|---|
| 34 | Bots can three-star L5 (high) | Right | b1 axis is now 1–30, and the L5 start is jittered by seed. b3 is gated like b2: it is asked only when the newborn point is ≥ 0.12 from today's dawn dot (b2 when ≥ 0.10 of change is due). The t5 marker is hidden during the ask. Without a saved Lichen wood, L5 draws a wood whose pattern mix is ≥ 0.12 from even thirds; the default mix sits next to the triangle's centre, so "tap the middle" would pass. New bots `midpoint`, `copynow` and `marker` are in `sim.bots`. Sweep of 9 bots × 40 seeds: **no three stars**. Best L5 cells are D (greedy, midpoint, copynow, marker) and DP (random); the old D-T for the centre-tapper is gone. b1 tolerance stays ±2: generations are whole numbers, so ±1.5 would mean ±1. |
| 35 | L6 has no decision that can go wrong | Partly | Done: the verdict is Brier-scored against the posterior, so high confidence on thin data costs the star, and so does a timid call on strong data ('overconf' / 'underconf'). Card order is shuffled by seed, and keys 1–4 follow it. A bred stock of 24 batches binds: only an even split of the whole stock reaches 80% power. A packed batch draws birds and widens the gap (+0.05 matched, +0.15 mismatched, designed), so the evidence sets it aside, and the tally says "set aside n". **Rejected:** a fifth idea card, "The release method made the gap", which would change the level's question (setting packed batches aside makes the method count instead). Also rejected: setting the birds' risk from the player's L4–L5 rule, which would make L6 depend on earlier levels and break (seed, actions) replay. |
| 36 | The wood comes from the local save, so replays diverge | Right | Every run now starts from the default wood. A saved wood enters as a logged `lw` action at tick 0, so a replay code rebuilds it on any machine. Seed links, teacher mode, replays and thaws ignore the save entirely. Oracle: the logged action replays bit for bit, and a run without it never reads the save. |
| 37 | Rise and fall never shown together; dates contradict | Right | After b1, the L5 trace draws L4's rise mirrored onto it ("rise mirrored": the designed rise from the same distance to the edge, with no migrant). Both levels use 4 years a generation. **Rejected:** seeding L5 from the player's L4 end, which would break level select, teacher seeds and replays (deviation 7). |
| 38 | The L5 plateau has no pressure | Partly | Mornings are 9 s, and the plateau is about one generation shorter (two-generation bark lag). Quota growth was not built: it would change selection strength mid-level, against the expectations the stars use. |
| 39 | "one dominant gene" | Right | Now "one dominant allele sets the pace". |
| 40 | Teacher hook incomplete | Partly | `resultBits(s, level)` packs 30 bits. All levels: level and star mask. L4/L5: crossing generation, meals fed %, last dawn black %, rescues. L6: idea, confidence, power %, camouflage posterior %, batches used. Assignment links show a result code (`L4_14_level_card`). **Not done:** the class-pool chart has no engine consumer yet, and there is no instructor-notes location yet. Both are engine or doc requests. |

### A bug found on the way

Renaming the morning length to `TIMES` left `breed()` setting `s.time` to undefined. From generation 2 the clock would have read NaN and a human's morning would never end. Bots end mornings by quota, which hid it. The idle-bot oracle check caught it, and it is fixed.

### Tests after the round (scratch build `V2_ONLY='0*,zz_*,soot.js'`, plus a full build with every v2 file)

- `node tests/oracle.js … soot`: **46 passed, 0 failed**, on both builds. New checks: logged wood and canonical runs; rescue cause and card; idle card; symmetric starts; dominance alone (4.8 vs 6.0 generations) and the lag on its own (8.0); L4 (59/60) and L5 (59/60) finishable; card path and Why? pace numbers; stock binds; packed batches set aside; posterior strong, one-wood and thin cases (93, 100 and 94 of 100 seeds); Brier scoring; *Pale dominant* keeps the black share; *Instant clean bark*; fingertip floor and its cap.
- `node tests/lint_text.js … soot`: 0 errors. 2 warnings: `levelTake` and `levelBody` are not API_v2 §9.2 keys. They are checked as text and are inside the take and body budgets.
- `python3 tests/bots.py … soot --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,midpoint,copynow,marker,idle`: **PASS**. `--untimed` (seeds 1–15): PASS.
- A player who marks every expectation and states a calibrated confidence gets three stars in L4 39/40, L5 39/40 and L6 37/40. The L6 misses are seeds where even the whole stock gave a posterior under 0.8.
- `tests/monkey.py soot 1,2,3 --vp 390x780,1280x720`: **6 of 6 end**. `--calm` at 390 × 780: 3 of 3.
- `tests/golden.py check`: 47 ok, 1 skipped (soot replaced). `--v1` on the five v2-replaced ids: 5 ok.
- `tests/soot_paths.py`: peck latency 40 ms; keyboard play; What if? HUD and auto rerun; dusk tap ignored; L6 dock overflow 0 px; untimed and Calm; teacher step; the saved wood reaches the sim; `?v1=1` plays the legacy chapter.
- Screenshots: `/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/soot/review/` holds `shots/` (35 per viewport), `small/` (360 × 640), `x/` (What if?, dock, Show data p\|q bar), and `sheet_390x780.png` and `sheet_1280x720.png`.

### Still open

Designer playtest of the 10 s and 9 s mornings, and of whether the late-generation hungry whisper fires (issue 18). Engine requests: LiveGraph label nudge, primary token, pane sizing, class pool. Coordinator A sign-off on the changed claims (symmetric starts, realised s, posterior model).
