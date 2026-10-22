# Wave 2: Left Jaw, Right Jaw (`jaws`)

Unit agent: senior game developer and evolutionary biologist. Files: `games/endless-forms/source/v2/jaws.js` (`CH_JAWS_V2`, 90 KB raw, 29 KB gzip), `tests/oracle_jaws.js`, `tests/jaws_shots.py`, `tests/jaws_paths.py`. No engine file, legacy file or other unit's file was edited. Nothing was committed. The legacy chapter (`CH_JAWS` in `ch2.js`) is untouched and still plays under `?v1=1`.

Specs followed: D6 (binding), D5 §3 (checklist) and §4 item 7, D1 §3.3 and G1–G12, D2 §3 and §15, D4 §2.2 rules 3–4, §4.1, §5.3 (the Jaws juice rows), API_v2 with §13–§14, `engine_integration.md`, `lessons_batch1.md`.

## What I built

**Role:** the selective environment (D1 G1, role 1). You are the school's vigilance in Lake Tanganyika. **Place:** the Lake. **The second:** a scale-eater (*Perissodus*) rises out of the murk behind a fish; tap that fish's left or right flank to slide a guard plate onto it (120 ms, lasts 1.2 s, two plates at most from L2). You see *which* fish is threatened, but not the jaw: the attacker veers to its flank only in the last 0.16 s, too late to react, so you guard the side most bites come from. **The minute:** a season of 12–20 attacks, then dusk. Scale-eaters leave young in proportion to the scales they ate, so the commoner side, which you guard, goes hungry. **The level:** one new variable each. **The boss:** a new world where rarity is no shield.

Each scale-eater carries a continuous jaw twist (a `Gen` additive locus: four loci, `det: true`, h² set through `ve`). Its chance of striking the right flank is a steep logistic of twist (mostly one-flanked, D1). The twist histogram lies on the lake floor, one dot per fish, left-strikers left of the dashed line.

| Level | Adds | What happens | Prediction (gesture on the live graph) | Stars it can give |
|---|---|---|---|---|
| L1 One fish (6 seasons × 12 attacks) | frequency dependence (h² 0.9, ×N) | One fish, one plate. Right-strikers start at about 85%. Guarding the right starves them; left-strikers feed, breed and become common; the share crosses 50:50 and swings back. The first scale-eater waits for your first guard. | After a season, drag next season's right-striker share on the trace (practice). | Discover: block 55% and see the share cross 50:50 and come back. |
| L2 The school (7 × 16) | scarce guards (three fish, two plates) | Waves of one or two attackers at different fish. Your triage is the selection; the young answer last season's guards, so the share overshoots. Starts with left-strikers at 18%. | Next season's share; counted only where no change, back to 50:50 and the mirror image all miss. | Discover (block half, full swing); Predict (two of three in the band). |
| L3 Partly inherited (6 × 18) | low heritability (h² 0.25, realistic) | The same school; development sets most of the twist. At dusk the floor and strip show the fed (solid) and hungry (hollow) twists with the S arrow. | Drag where the young's mean twist will land (R = h²S, the Wood L2 echo, lessons §7). | Discover (block half; the share moves 8 points towards 50:50); Predict. |
| L4 Two hunters (6 × 20) | a second species (a striped scale-eater) | Plain starts at about 85% right-strikers, striped at 30%. One plate blocks both, so both are pushed the same way each season and their swings line up. | Drag the *striped* share next season (it moves with the plain one, even away from 50:50). | Discover (block half; the two move together in ≥ 4 seasons, apart in ≤ 1); Predict. |
| L5 The lizard wheel, boss (8 seasons) | rock–paper–scissors | 150 side-blotched lizards (24 drawn on the rocks). You are a blue mate-guarder (haloed) with a female. Yellow sneakers creep in from a side (tap that side to lunge, timed); orange usurpers stride in and cannot be stopped. Your block rate sets blue's payoff against yellow (2b − 1); w = exp(5·(Mx)), three of each morph arrive each season. | Tap the morph triangle where the rocks will be next season (counted only off the corners and off the current point). | Discover (a full turn: B → O → Y → B); Transfer (two of three triangle calls in the band). |

`content.boss.inverts`: "Rarity is no shield here: a morph rises when the morph it beats is common."

**Unit stars** (`ch.unitStars`, API §14.1, D1's cross-level rules): Discover in two of the four fish levels; Predict in two of L2–L4; Transfer only when the boss gave both its bits (wheel turned and triangle predicted). No level offers all three bits.

**What if? (the freezer).** Every dusk is frozen. The level card offers three levers that thaw the last season, change one thing and run eight seasons fast (twelve in the boss), ending in a text chosen from that run:

| Levels | Levers |
|---|---|
| L1–L4 | Guard evenly (no push: the share wanders by chance); No inheritance (young drawn afresh from the founders' mix: back to the start each season); Always right (steady selection: right-strikers keep falling) |
| L5 | No arrivals (a morph is lost; the wheel stops); Weak blocking (30%: yellow takes the rocks and stays); Block all (the wheel keeps turning) |

The auto seasons replay your own habit, fitted from your log: the share of attacks you reached, and how often your plate was on the commoner side.

**Juice (D4 §5.3, Jaws rows).**
- *Guard (T1):* a ring at the flank, the pale crescent plate slides on in 120 ms with ≤ 8% overshoot, a click, and an arc around the fish that drains over 1.2 s. A third plate slides the oldest off (120 ms). Crescent pips under the HUD show plates ready.
- *Block:* the plate flashes for 90 ms, a 14 px ring ripples (200 ms), "+1" rises, "tock"; the scale-eater recoils and flees with its twisted jaw showing. No shake.
- *Bite (a cost you pay):* 50 ms hit-stop, one 5 px shake, six scale flakes from `Fx.burst('scale')`, "−1", a scale sound; a pale scar stays on that flank for the season.
- *Telegraph:* a dashed ring in the murk where each attacker will rise (260 ms).
- *Dusk (T2):* the water dims, scars fly down into the floor histogram, the fed and hungry dots split; then the young hatch as pale fry rising from the weed and the histogram redraws. A tap or Space speeds a dusk ×3.
- *Level (T3):* a banner with the level name. Ambient: a distant school drifting in the murk, bubbles, light shafts and caustics.
- *Boss:* the blue male lunges 26 px to the tapped side; a blocked sneaker runs off in a dust puff (+1); a sneak and an orange usurper cost a shake and "−1".
- *Calm:* no shake; the flash becomes an outline thickening; caustics and sway stop.

**The live graph.** Rung 0 in the scene: the twist histogram on the lake floor (numbers appear only after the first season changed it), scars per flank, the lizards on the rocks. In the strip: L1–L4 a trace of right-strikers (a marker every season; plain disc and striped square in L4) against a dashed 50:50 line, and the twist dot-histogram (adults; fed solid, hungry hollow at dusk; young hatched; S and R arrows in L3). Boss: the O/B/Y simplex with its trail and a three-line share trace (disc, square, triangle). I registered one chart type, `jw_trace` (the engine's trace plus per-season markers), from `jaws.js`. Level cards: the trace (solid realised, dashed 50:50, your call a diamond); L3's card shows parents, young, S and R in one histogram.

**Accessibility.** Keys: ←/→ guard that flank of the threatened fish (1–3 pick a fish first); Space strikes in untimed mode and speeds a dusk; P, arrows and Enter place and lock a prediction; ←/→ lunge in the boss. Untimed mode (Settings, `?untimed=1`) freezes each wave behind its targets until Strike, and each sneaker until you lunge; predictions have no soft timer. The setting enters the run as a logged action (lessons §1.6). Live-region lines each season and each prediction. Colour vision: twist is shape (jaw bend) and position; lizard morphs are throat pattern plus letter (D4 rule 4); no hue carries a score (CVD and hue lints pass; mono and deuteranopia screenshots below).

**Learning layer.** Outside `?v1=1`: `TAKE.jaws`, `MODEL.jaws`, `RECALL.jaws`, and a new `BRIDGE.jaws` from Bitter Wings (the unit before it in Act 5). `BRIDGE.hawks` ("In Left Jaw, Right Jaw the rarer fish did better") stays true. There is no `TRANSFER.jaws`; legacy `TRANSFER.lock` cites Jaws' "one-season lag", which the model keeps. No `ch99.js` patch touched `CH_JAWS`.

## D5 §3 checklist (as amended by D6)

| # | Line | Status |
|---|---|---|
| 1 | Core verb | `role: 'environment'`; tap a flank, plate on in 120 ms; act-to-juice 40 ms measured; no control sets a scale-eater's trait. |
| 2 | First 10 seconds | No card; 17 words; ghost hand after the 1 s banner; the first scale-eater waits for your first guard (oracle). Playtest median not measured. |
| 3 | Predict inside play | One or more asks per level on the strip; scored by distance to the expectation; band after commit; `needMove`, ghost off the answer. |
| 4 | Escalation | 5 levels, one `adds` each; bot sweep PASS (7 bots, 40 seeds; untimed 20). |
| 5 | Boss | Inverts the rarity rule (`content.boss.inverts`). |
| 6 | Live graph | `notes()` charts; never pauses; realised solid, 50:50 dashed, you a diamond; floor numbers appear after the first change. |
| 7 | Juice | T1/T2/T3 via `Fx.tier`; D4 Jaws timings; every sound with a visual; Calm path; 60 fps median at 4× throttle. |
| 8 | Text budget | Lint 0/0; no `fillText`. |
| 9 | Science honesty | MODEL card per level, ×N chips in the scene, refs ids, oracles pass; Coordinator A sign-off pending. |
| 10 | Teacher hook | Three prompts (one a model critique), `teacherStep`, `resultBits` (30-bit code), class pool `trace`, instructor note below; CSV and projector come from the engine. |
| 11 | Accessibility | Keyboard map, untimed waves and sneakers, P/arrows for every drag, live region, data tables, CVD and hue lints, mono and deut shots. axe-core not run (offline). |
| 12 | Learning layer | TAKE, MODEL, RECALL, BRIDGE rewritten outside `?v1=1`; no TRANSFER.jaws existed; star migration and `done` by the engine. |
| 13 | Monkey | 9 of 9 at three viewports; golden 47 ok + 1 skipped, `--v1` 48 ok. |
| 14 | Playtest | Replaced by the designer-and-colleagues script below (D6 decision 4); not yet run. |

## Science claims, with references (for Coordinator A)

| Claim on screen or in a card | Where | Reference |
|---|---|---|
| *Perissodus microlepis* eats scales from other fish, attacking from behind; each fish's mouth is twisted to one side and it strikes mostly one flank | firstWords, L1 MODEL | Hori 1993, *Science* 260: 216; Takeuchi, Hori & Oda 2012, *PLoS ONE* 7: e29272 |
| Over about a decade the share of the two forms swung around 50:50 with a period of about five years; the commoner form fed less well | L1 MODEL, Why? real | Hori 1993 |
| Twist heritability is about 0.2, with a large developmental part; whether twist has one mode or two is debated | L3 MODEL, Why? real | Lee, Heim & Meyer 2015, *Ecol Evol* 5: 4277; Raffini & Meyer 2019, *Hydrobiologia* 832: 65 |
| Papers differ on which form to call "left"; we name each scale-eater by the flank it strikes | naming throughout | (convention note, no claim) |
| Two scale-eater species swing together because one defender selects both | L4 MODEL | **a model prediction**, labelled so on the card (D1 §6 asked whether Hori 1993 shows it; I did not rely on it) |
| A striped Tanganyika scale-eater mimics the fish it feeds on | L4 Why? real | *Plecodus straeleni*; to check (Hori & Watanabe 2000 or a standard source) |
| Side-blotched lizards: orange males usurp blue males' females, blue males guard against yellow sneakers, yellow males sneak past orange | boss MODEL, Why? real | Sinervo & Lively 1996, *Nature* 380: 240 |
| The morphs cycled blue → orange → yellow over about four to five years | boss MODEL | Sinervo & Lively 1996 (D1 §6: the 4–5-year figure may come from later papers; to check) |
| R = h²S; low heritability gives a small response | L3 take and Why? maths | Falconer & Mackay 1996 |

Model results the oracle checks (designed parameters, not field data):
- against the commoner-side bot, right-strikers' relative success and the selection differential on twist both oppose p − ½ in every season (439 of 439);
- that bot gives a full swing on every seed in L1 and L2; always guarding one side gives none;
- heritability in force 0.916 (L1) and 0.250 (L3); L3's pooled realised R/S 0.23 and R/Σh²S 1.05;
- the lizard wheel has a period of 5.08 ± 0.09 seasons with the floor (D1 checked 5.1); without the floor a morph is lost in every run, median season 3 (D1 said 2; my count starts after the first breeding); blocking under half leaves yellow in charge.

Nothing on screen is contested science, so no Contested pill is shown (`contested: false` on every card; the "one mode or two" debate is stated in L3's "In nature"). Every card tags its parameters designed, realistic or ×N, and the scene shows "Selection ×N" (fish) and "Strength ×N" (lizards). **Coordinator A has not yet signed these claims off**; two references are marked "to check".

## Deviations from the spec, and why

1. **The jaw is hidden until the strike, in both timed and untimed mode** (D1's untimed mode shows the twist at the tell). If you can read each attacker's jaw before it strikes, you guard each one individually, block rates become equal on both sides, and the frequency dependence the unit teaches vanishes. Prey cannot see a scale-eater coming from behind either. You see *which* fish is threatened; the flank is your call.
2. **Discover asks for 55% blocked (L1) and 50% (L2–L4), not 70%.** With the jaw hidden, a perfect commoner-side guard blocks max(p, 1 − p) of attacks, and the dynamics drive p towards 50:50; the best tracker averages about 65%. 70% would be reachable only by luck. Random guarding blocks at most 50% and shows no swing, so the swing condition, not the block rate, separates understanding from luck.
3. **L2's prediction is next season's share, not "tap where the next peak will be".** A peak-time ask depends on the player's future guarding; next season's share has an exact expectation (a Monte-Carlo replay of the breeding on a private PRNG). Asks count only where every fixed rule misses (no change, back to 50:50, the mirror image).
4. **L3's prediction is R = h²S on the twist histogram, not "predict the amplitude".** It is the Wood L2 pattern lessons §7 asks for and has an exact expectation; "the young match the fed group" and "no change" both miss.
5. **Generations do not overlap.** Real *Perissodus* generations overlap, which stretches real swings to about five years; here a season is a generation, so the swing overshoots and zigzags (MODEL card "cannot"). The one-season lag is what D1 L2 teaches.
6. **Selection is strong (young in proportion to scales eaten, with a 5% floor).** With a continuous, mostly polygenic twist, weaker selection only nudges the share towards 50:50 (a prototype with young ∝ 1 + 1.6 × success, the legacy rule, moved the share about 0.07 a season and never overshot); strong selection is tagged ×N.
7. **The boss is eight seasons** (D1: six for one turn). With a period of five, eight seasons give a full turn and three or more qualifying triangle asks on every seed tested (60 of 60).
8. **Two yellow sneakers can come at once when yellow is common** (chance 0.3 × yellow share), so one gets through. It makes the boss harder exactly when yellow is winning; the expectation the star reads uses the season's realised block rate.
9. **Role.** The contract allows one role; the unit is `environment`. In the boss you are a behaving animal (a blue male), as D1 specifies.

## Engine requests (nothing was edited; local helpers instead)

1. **A trace with per-point markers and a shape per series.** Two species or three morphs on one trace cannot be told apart without hue: every `ink: 'ink'` series gets the same marker. I registered `LiveGraph.T.jw_trace` (the engine trace plus disc, square and triangle markers at every point).
2. **A reference line on `trace`.** D1 asks for a dashed 50:50 line; I drew it as a `ghost` series labelled "50:50", which overloads "expected".
3. **The HUD's real height.** `Stage.zones.hud.h` stays at 56 px while the HUD wraps to three lines on a phone, so scene labels slid under it. I measure the HUD element (`hudH()`, twice a second).
4. **A plain female lizard.** The `lizard` rig always paints a male throat. I defined `jwfem` by repainting the orange throat of `Rig.recipe('lizard')` in body colour; a `sex: 'f'` option in `01_rig.js` would be cleaner.
5. **Fish rigs.** No cichlid rig exists. I defined `jwprey` (a prey cichlid from above) and `jwscaler` (a scale-eater from above, `tw` bends the head, `st` stripes) in `jaws.js`; they could move to `01_rig.js` for the Archipelago and the Harvest.
6. **An empty dock** during play leaves a blank bar on phones (lessons §3 still open).

## Tests (build: `V2_ONLY='0*,zz_*,jaws.js'`, scratch `wave2/jaws_final.html`)

- `node --check` on `v2/jaws.js` and `tests/oracle_jaws.js`: **clean.**
- `node tests/lint_text.js … jaws`: **0 errors, 0 warnings** (budgets, sentences ≤ 18 words, British spelling, agency, CVD and hue lints, no `fillText`, no `Math.exp/log/pow/sin/cos`). Also clean on the full build.
- `node tests/oracle.js … jaws`: **28 passed, 0 failed** (`JW_FAST=1` runs fewer seeds).
  - *D1/D5 acceptance:* against the commoner-side bot, right-strikers' relative success and S oppose p − ½ in 439 of 439 seasons; lizard period 5.08 ± 0.09 with the floor; a morph lost in every run without it (by season 4, median 3).
  - *Swings:* full swing on 100% of seeds with the commoner-side bot (L1, L2); 0% when always guarding right.
  - *Heritability:* 0.916 in force (L1), 0.250 (L3); pooled R/S 0.23 and R/Σh²S 1.05 in L3.
  - *Expectations the stars read:* next-season share against realised breeding replicates, max error 0.009; the lizard step against 2,000 realised steps, 0.0002.
  - *L4:* plain and striped move together on 40 of 40 seeds.
  - *Engineering:* determinism, log replay and snapshot round trip exact; the first scale-eater waits for your first guard; a random tapper gets past season 1.
  - *Stars:* the expert earns every star its level offers on 20 of 20 seeds in every level; no bot's union across the unit reaches three unit stars (alwaysA 0, alwaysB 0, random 0, greedy 1, threshold 1, lazy 1, mirror 1).
  - *Words from the run:* every What if? text matches its own run (six levers × 10 seeds), What if? runs earn no stars, and always guarding one side never earns Discover.
- `python3 tests/bots.py … jaws --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,lazy,mirror`: **PASS.** Best masks:

  | Level | alwaysA | alwaysB | random | greedy | threshold | lazy | mirror |
  |---|---|---|---|---|---|---|---|
  | L1 | – | – | – | D | D | D | D |
  | L2 | – | – | – | D | D | D | DP (2 of 40 seeds) |
  | L3 | – | D | – | D | D | D | D |
  | L4 | – | – | – | D | D | D | D |
  | L5 | D (1 in 10) | D (1 in 10) | D (1 in 10) | D | D | D | D |

  `--untimed` (seeds 1–20, final build): PASS. The commoner-side bot earns Discover by design: it *is* the behaviour that causes the swing. No fixed rule earns Predict or Transfer except "mirror" (predict the reflection about 50:50) on 2 of 40 L2 seeds; an ask counts only where no change, 50:50 and a near-exact mirror all miss.
- `tests/monkey.py jaws 1,2,3 --vp 390x780,1024x768,1280x720`: **9 of 9 reach the end card**, no errors, no bad text, no Lbl/Whisper/HUD/Dock warnings, ≤ 21 words in the HUD, What if? exercised. Full build (every v2 file): 1 of 1 (seed 1, 390×780). After the last view change: 6 of 6 (390×780, 1280×720), oracle (fast) 28 of 28, paths 24 of 24.
- `tests/golden.py check`: **47 ok, 1 skipped** (jaws replaced); `--v1`: **48 ok.** Full build: 41 ok, 7 skipped (the units replaced so far); `--v1` 48 ok.
- `tests/jaws_paths.py`: **24 ok, 0 failed** — real taps on a flank, arrows, 1–3 plus arrows, P/arrows/Enter predictions, a whole level by real input, act-to-juice latency **40 ms** (136 acts), the two-plate limit, What if? "Guard evenly" playing eight seasons with its Interesting result, untimed waves waiting 9 s for Strike, the untimed boss sneaker waiting for a lunge, the boss by arrow keys, Calm plus a deep link, teacher step resolving the season, `?v1=1` opening the legacy chapter.
- **Performance** (headless Chromium, 4× CPU throttle, other tests running): frame median 16.7 ms (60 fps), p95 22–30 ms at 390×780 DPR 2 and 19–20 ms at 1280×720; `draw` median 0.2–0.4 ms, p95 1.5–2.8 ms. The lake is baked once per size; the crowd of lizards is a `Layer` redrawn once a season.
- **Size:** `v2/jaws.js` 90.6 KB raw, 28.8 KB gzip (the lessons' budget is ≤ 90 KB raw, ≈ 30 KB gzip).
- **Prototype numbers behind the design** (scratch scripts, not shipped): with the legacy fitness rule (1 + 1.6 × success) the share drifted towards 50:50 by about 0.07 a season and never overshot; with young ∝ scales eaten (5% floor) a commoner-side guard crossed 50:50 and came back in ≥ 99% of 300 runs, probability matching in about 50%, random guarding in 5%, always-right in 0%.
- **Not run:** axe-core (not available offline); the designer-and-colleagues playtest (script below).

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/jaws/`:
- `L<n>_{start,strike,mid,dusk,ask,askmoved,committed,reveal,breed,card}_{390x780,1280x720}.png`: every level and phase at both sizes (boss: `intrude` instead of `strike`);
- `*_cvd-mono.png` (L1, L5), `*_cvd-deut.png` (L2, L5), `*_calm.png` (L1);
- `X_{sneaker,lunge,untimed,bite}_{390x780,1280x720}.png` and `X_fry2_390x780.png`: a yellow sneaker mid-approach, the lunge, an untimed frozen wave, a bite mid-burst, the fry hatching after the strip folds.

I looked at them and fixed what looked wrong:
- the guard pips looked like eggs in the corner (now crescents, the plate's own shape);
- scene labels sat under the wrapped three-line HUD (now measured from the HUD element);
- the lake was empty between attacks (a distant school, bubbles, light shafts and caustics);
- the dusk did not read as a dusk (the water dims; scars fly into the floor histogram);
- the young were invisible dark fry on dark water, and on a phone they hatched under the open strip (now pale fry that rise once the strip has folded);
- the lizards stood in two friezes at the top and bottom (now basking round the edge, clear of the arena, on a pale slab under the pair, with a "you" label over the haloed male);
- the L3 card showed only the share trace (now parents, young, S and R in one histogram, words first);
- an in-canvas "Strike" label covered a waiting attacker in untimed mode (removed; the dock and HUD carry it);
- the R-ask ghost started off the plot edge (now just inside it);
- the floor showed percentages before anything had changed (now words in season 1, numbers after the first breeding: the reveal ladder).

## Instructor note (one page)

**In one line:** students guard a school of cichlids against scale-eaters. Because they guard the side most bites come from, the rarer jaw feeds better, and the population swings around 50:50; then they see how heritability, a second species and a rock–paper–scissors game change that picture.

**Timing:** about 17 minutes (L1–L4 three to four minutes each, the boss about four). Each level ends on a card that saves.

**Before (2 min):** "If most scale-eaters strike the right flank, which ones leave more young next year?"

**During:**
- On the L1 card: why did the share overshoot 50:50 instead of settling?
- In L3: you selected just as hard; why did the young move so little?
- In L4: why does the striped species follow the plain one, even away from 50:50?
- In the boss: block badly for one season and watch yellow take over. Why does blue need your blocks?

**Discussion prompts (rising Bloom; `teacher.prompts`):**
1. If twist were not inherited, would the share still swing? (Try What if? No inheritance.)
2. Why does the lizard cycle run one way round?
3. Why does the model need lizards arriving from other rocks? (A model critique; try No arrivals.)

**Misconceptions targeted:** a stable polymorphism means equal fitness at all times; selection always fixes the best type; strong selection always gives a big response (L3); being rare is always an advantage (the boss).

**Model limits to mention:** a season is a generation (real swings take years because generations overlap); selection is far stronger than in the lake; prey vigilance is the player, not a learning rule; the striped-species synchrony is a model prediction.

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open Endless Forms, Act 5, Left Jaw, Right Jaw. Do not read anything first. Note the seconds to your first tap.
2. L1: play until the card. Did you notice the left-strikers rising? When did you switch sides?
3. L2: did two plates for three fish feel scarce? Did the prediction (drag the diamond) make sense without help?
4. L3: did the S and R arrows and the card's histogram make "little heritability, little response" visible?
5. L4: did the two lines moving together surprise you, and did you understand why?
6. Boss: did you understand why orange cannot be stopped? Try blocking badly for a season.
7. Try one What if? on any card. Did its result read as an answer to "what changed?"
8. Settings → Untimed: replay L2. Does it still feel like a decision?

Feedback form (1–5 unless stated): fun; clarity of the verb; did the swing feel caused by you?; the boss's link to the fish (words); any moment you were bored or wondered how long was left (where?); any science you doubt (where?).

---

## Session 2 (21 October 2026): finish, world, review and fixes

Unit agent (senior game developer, art director, evolutionary biologist). `git mv source/v2_wip/jaws.js source/v2/jaws.js`, then finished the draft rather than restarting. Files touched: `v2/jaws.js`, `tests/oracle_jaws.js`, `tests/jaws_paths.py`, `tests/jaws_shots.py`, this log. No engine, legacy or other unit file was edited; nothing was committed.

### D6 addendum (21 October) applied
- **Its own world (decision 7).** The lake was a flat blue gradient with olive fish; it now reads as the Lake Tanganyika shallows: turquoise water (`#62CFC6` → `#0F6170`), slanting sun shafts, a drifting net of **sun caustics** in the water and brighter on the sand (two copies of a baked cell-edge tile, composed at half resolution), rock piles furred with algae on both shores, pebbles along the shore line, a sand floor with ripples and **empty snail shells** (the lake's shell beds), a hazy far reef and a vignette. Palette teal / coral / sand: prey are sand-silver cichlids with coral fins; the scale-eaters are tawny with dark bars; the striped species (L4) wears bold bars. The boss gets its own world too: a sun-baked California hillside (warm wash over the rocks ground, coastal sage, warm vignette). Allele inks appear nowhere (twist is shape and position; lizard morphs are throat pattern plus letter).
- **Accent.** `accent: '#E2725B'` (coral). The engine tints the chrome with it; in the scene it marks the guard: the plate timer arc and the ready-plate pips are coral. Never a data ink.
- **Opening card (decision 8).** `content.intro = {game, biology, how}` (23, 30 and 25 words; every sentence ≤ 18 words). Checked in a browser: the card shows three labelled parts, the sim is paused under it (`s.T` stays 0), Play closes it, the dock "?" reopens it, and the ghost hand then demonstrates the first tap on the commoner flank while the first scale-eater waits.

### Review 1: playtester and art director (screenshots of every level and phase at 390 × 780 and 1280 × 720, plus juice moments)
| # | Issue | Verdict | Action |
|---|---|---|---|
| A1 | The world looked like every other chapter: muted blue water, olive fish, sand strip | High | New lake and boss worlds (above) |
| A2 | The scale-eater's jaw was barely visible; at quantisation the half-twisted jaws drew straight (the rig cache clamps non-integer traits to 0–1, so `tw = −0.5` became 0) | **Bug**, high | The rig now takes `tq` in 0–1; the head bends up to 0.72 rad and the jaw is a hook with pale lips and a dark gape opening towards the prey; scale-eaters drawn 10% larger |
| A3 | Scale flecks were a generic 6-flake burst | Medium | Bites tear 7 silver scales that spin, glint (they flatten and brighten as they turn), drift and sink onto the sand, where they fade; the bitten fish jolts away from the bite (0.3 s) |
| A4 | No moment marked the swing itself, the unit's aha | Medium | When a breeding carries the share past 50:50, "Left-strikers lead" / "Right-strikers lead" rises over that side of the floor histogram with a ring (from the `breed` event and the sim's own shares) |
| A5 | Long seasons of identical taps | Medium | A block streak ("Streak 4", from block events; a widening ring from three in a row); speed still rises each season |
| A6 | Caustics first drawn per frame doubled the phone frame time (42–48 ms vs 18 ms at 4× throttle, DPR 2) | High | Caustics composed at half resolution with the baked lake into one layer, refreshed about eight times a second and staggered over two frames: median frame 18–19 ms (same as without caustics), p95 48–53 ms; 1280 × 720 16.5 ms; boss 16.6 ms |
| A7 | Two and three series on one trace: the end labels all used a disc while the lines used disc, square and triangle | Medium | `jw_trace` now draws its own end labels with the matching marker (square, triangle, disc) |
| A8 | "crossing 50:50 1 times" | Low | Plural phrases (once, twice, *n* times) in `content.data.cross` |
| A9 | The first caustics looked like cracked tiles | Low | Softer, thinner net at 1.7× and 2.3× scale, depth-weighted alpha |
| A10 | Streak label over the 3-word label budget | Low | "Streak {n}" |

### Review 2: adversarial evolutionary biologist
| # | Issue | Verdict | Action |
|---|---|---|---|
| S1 | Laterality is partly plastic (Raffini & Meyer 2019): scale diet and striking experience make jaws more lopsided (Lee, Heim & Meyer 2015); the model's development term is random and use-independent | Must say so | L3 MODEL `cannot`: "Plasticity: in the lake, a diet of scales and practice at striking make jaws more lopsided." L3 "In nature" and Why? real updated; L1 `cannot` adds "jaws shaped by use" |
| S2 | Hori (1993) read the jaw as a single Mendelian locus; later work finds a continuous, partly heritable trait (Kusche, Lee & Meyer 2012) | Must say so | L1 "In nature" adds it; ref `kusche2012` |
| S3 | Prey vigilance as the mechanism is Hori's hypothesis, stated as fact | Fix | L2 MODEL and Why? now say "Hori proposed that prey watch the flank attacked most" |
| S4 | "Cycle over about four to five years" attributed to Sinervo & Lively (1996) is not clearly theirs (D1 §6 flagged it) | Fix | "Over several years of counts, Sinervo and Lively saw the morphs take turns: blue, then orange, then yellow." |
| S5 | L3 take "moved the young only a quarter of the way" was fixed text; realised R/S varies by run (lessons rule 6) | Fix | Take chosen from the run's pooled R/S: 0 < R/S ≤ 0.6 → "only part of the way"; ≤ 0 → "Chance swamped the response"; > 0.6 → "more than heritability predicts … chance" |
| S6 | L1 body "The side you guarded less fed better and left more young" was an unchecked causal claim | Fix | Replaced by the measured bite success on the rarer and the commoner side over the level |
| S7 | L1, L2 and L4 takes asserted a swing or synchrony that some runs do not show | Fix | `sim.take(s, n)`: the lesson take only when the run showed it (a full swing; synchrony ≥ 4 of seasons with ≤ 1 against); otherwise `content.data.takeNo[n]` |
| S8 | L2 body "so the swing overshoots" unconditional | Fix | The overshoot sentence lives only in the swing take; the body says "Each season's young answer the guards their parents met." |
| S9 | The striped species | Name it | *Plecodus straeleni* named in L4 Why?; ref `boileau2015` (aggressive mimicry). Synchrony stays labelled a model prediction |
| S10 | Negative frequency dependence, the lizard matrix (O > B > Y > O, blue vs yellow = 2b − 1), the 2% input floor, ×N tags | Checked | Correct and tagged; oracle unchanged and passing |

New references for Coordinator A: Kusche H, Lee HJ, Meyer A (2012) Mouth asymmetry in the textbook example of scale-eating cichlid fish is not a discrete dimorphism after all. *Proc R Soc B* 279: 4715. Boileau N et al. (2015) A complex mode of aggressive mimicry in a scale-eating cichlid fish. *Biol Lett* 11: 20150521. Lee, Heim & Meyer 2015: **to check** that the diet contrast is scales against other food, as now worded.

### Review 3: D5 §3 checklist (as amended by D6)
| # | Line | Status this session |
|---|---|---|
| 1 | Core verb | Unchanged; act-to-juice 40 ms max over 135 acts (paths) |
| 2 | First 10 seconds | The D6 opening card comes first (decision 8 overrides "no card"); the sim waits under it; ghost hand on the commoner flank after Play; the first wave still waits for the first guard (oracle) |
| 3 | Predict inside play | Unchanged; `needMove`, ghosts off the answer, band after commit |
| 4 | Escalation | 5 levels; bot sweep PASS (7 bots × 40 seeds) |
| 5 | Boss | Unchanged (`boss.inverts`) |
| 6 | Live graph | `jw_trace` end labels now match line markers |
| 7 | Juice | New flecks, jolt, streak and swing label all from `Sim.run` events; Calm stops caustic drift, fleck wobble and sway; 60 fps median at 1280 × 720 and 52–55 fps at phone DPR 2 under 4× throttle |
| 8 | Text budget | Lint 0 errors, 0 warnings (alternative takes and plural phrases live in `content.data`, which the lint checks as text) |
| 9 | Science honesty | S1–S9 fixed; Coordinator A sign-off still pending (three references to check) |
| 10 | Teacher hook | Unchanged; teacher step passes (after the opening card) |
| 11 | Accessibility | Unchanged keyboard map; untimed paths pass; `?cvd=deut` and `?cvd=mono` shots readable (no hue carries a score) |
| 12 | Learning layer | Unchanged |
| 13 | Monkey | 6 of 6 at 390 × 780 and 1280 × 720; golden 47 + 1 skipped, `--v1` 48 |

### Tests (build `V2_ONLY='0*,zz_*,jaws.js'`, scratch `jaws/jaws.html`)
- `node --check` clean; `tests/lint_text.js … jaws`: **0 errors, 0 warnings**.
- `node tests/oracle.js … jaws` (full): **29 passed, 0 failed**. New check 14: every level card's take matches its own run, recomputed from the raw records (192 runs: 112 lesson shown, 75 not, 5 chance-large), and the L1 body's rarer/commoner bite rates match an independent tally. Science numbers unchanged: commoner-side bot opposes p − ½ in 439/439 seasons; h² in force 0.916 and 0.250; L3 R/S 0.230, R/Σh²S 1.049; lizard period 5.08 ± 0.09; a morph lost in every run without the floor (median season 3).
- `tests/bots.py … --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,lazy,mirror`: **PASS**, same masks as session 1 (mirror DP on 2 of 40 L2 seeds).
- `tests/jaws_paths.py`: **30 ok, 0 failed** (new: the opening card's three parts, Play closes it, "?" reopens it; deep-link and teacher paths now pass the card first).
- `GAME_HTML=… tests/monkey.py jaws 1,2,3 --vp 390x780,1280x720`: **6 of 6 reach the end card**, no errors, no bad text, ≤ 21 words in the HUD. Full build (every v2 file, 21 Oct): builds, lint clean, monkey seed 1 at 390 × 780 reaches the end.
- `tests/golden.py check`: **47 ok, 1 skipped** (jaws); `--v1`: **48 ok**.
- `tests/jaws_shots.py`: 102 screenshots, 0 errors or Lbl/Whisper/HUD/Dock warnings.
- Size: `v2/jaws.js` 105 KB raw, 33.6 KB gzip (session 1: 90.6 / 28.8). **Over the ≤ 90 KB raw guide** by the world art (lake bake, caustics, rocks, boss hillside ≈ 9 KB) and the run-chosen words; flagged for the coordinator.

### Screenshots
`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/jaws/`: `final/` (every level and phase at 390 × 780 and 1280 × 720, plus `L1_intro_*`), `m/` and `m2/` (juice moments: pre-strike, bite, scale flecks, block, swing label), `cvd/` (deut and mono), `s0/` (session-1 look, for comparison).

### Engine requests (new)
1. The opening card ignores taps for its first moments; scripted tests must advance ~800 ms before clicking Play (documented in `jaws_paths.py`).
2. `Rig` quantisation clamps non-integer traits to 0–1 silently; a signed trait (−1…1) drew straight. A warning in `Rig.def` for out-of-range values would have caught it.

### Playtest script additions (D6 decision 4)
0. Before L1: read the opening card. Did "The game / The biology / How to play" tell you enough to make the first tap without the ghost hand?
9. Did the lake feel like a place of its own (water, light, rocks, shells)? Did you notice the scales tearing off and the "…-strikers lead" moment?

Not done here (coordinator's steps): the bible's §13 decisions log and checklists (only unit files were to be edited), Coordinator A's sign-off, the designer-and-colleagues playtest.

---

## Simplification (D6 decision 9), 22 October 2026

I played all five levels at 390 × 780 first (screenshots in the session scratchpad: `s3/simp_bitter_jaws_forager/before/jaws/`, then `after_jaws/` and `after_jaws2/`). The lake, the cichlids, the scale-eaters, the guard plates, the lizard rocks and the juice stayed. What made it heavy was the asking: up to 2 + 3 + 3 + 3 + 3 predictions on four kinds of gesture (a share diamond, a twist line, the striped share, the morph triangle). There was also a whole level, The school, whose idea ("the rare type rises, and the young overshoot") was already L1's. The one verb is still **tap the flank you expect to be bitten**.

### What was removed or merged, and why

| Removed or changed | Where | Why |
|---|---|---|
| Level "The school" (old L2) | — | It repeated L1's lesson with more pressure. Its three fish and two plates now arrive in L2 (Partly inherited), where the HUD already explains them ("Two guards, three fish"). Its overshoot explanation moved into L1's Why? maths. Its MODEL card was merged into L2's (3 prey fish, 2 guards). |
| L1's second practice ask | L1 | **Kept one prediction for the chapter**: "You guarded the commoner side. Where will right-strikers be next season?" It makes the aha: the guarded side falls, often past 50:50. It is asked once, only where "no change", "back to 50:50" and the mirror image all miss by more than 1.25 × the band. It now carries the Predict star. |
| The R = h²S ask (drag the young's mean twist) | L2 | The key equation is now **shown**. At each hatch the HUD reads "R = h²S = 0.25 × −0.78 ≈ −0.20: the young keep the inherited part", with that season's S and the model's h². The S and R arrows stay on the twist histogram. |
| The striped-share asks | L3 | At dusk the HUD gives the key line: "One guard blocks both species, so both lose on the same side." |
| The morph-triangle asks | Boss | A simplex gesture that did not make the aha. The triangle stays as a read-out. At each dusk the key number: "Blocked n% of sneakers. Blue beats yellow only above 50%: 2b − 1 > 0." |
| Dusk key number in L1 | L1 | "Left-strikers landed n% of bites, right-strikers m%. The better-fed jaw leaves more young." |

The levels are now **L1 One fish, L2 Partly inherited, L3 Two hunters, L4 The lizard wheel**. Internally each level runs a model kind (`JW_KIND = [0, 2, 3, 4]`, `s.kd`), so the kept levels' science code is unchanged. The intro card's "How to play" ends "Once, you drag a marker to predict."

### Stars, re-balanced

| Level | Discover | Predict | Transfer |
|---|---|---|---|
| L1 One fish | block 55%, share crosses 50:50 and back | **the one prediction** inside ±0.07 (was practice, no star) | — |
| L2 Partly inherited | block half, share moves 8 points to 50:50 | — (was 2 of 3 asks) | — |
| L3 Two hunters | block half, species move together | — (was 2 of 3 asks) | — |
| L4 The lizard wheel | **new:** block at least half the sneakers (blue beats yellow) | — | the wheel turns B → O → Y → B (was 2 of 3 triangle calls) |

Unit stars: Discover in two of the three fish levels, Predict = L1, Transfer = the boss. No level offers all three. The level card's "still to earn" line now names the unit's requirement when the level already earned that star (as in Bitter Wings), so the boss card no longer asks for a Discover you just earned.

### Science
No claim changed. The lizard model, period 5 ± 1 seasons with the floor, h² 0.9 (×N) against 0.25 (realistic), and the expectation behind the one ask (`expShare`) are all still checked by the oracle.

### Real biology (D6 decision 10)
Already met: real cichlids and scale-eaters, real side-blotched lizards. The twist dots on the lake floor and the strip charts are read-outs beside them.

### Tests
- `tests/oracle_jaws.js` updated for four levels (h² in force, L2's R/S ≈ 0.25 behind the key line, `expShare` calibrated in L1, synchrony in L3, the lizard checks, What if? texts, card takes). New check: only L1 asks, once. **31/31.**
- `tests/jaws_paths.py` (boss is level 3, the three-fish checks run in L2) passes with 0 failed. `tests/jaws_shots.py` now shoots four levels.
- Lint 0/0, `dup_globals` ok, bot sweep PASS (no bot earns three stars in a level; best unions D-T), monkey seeds 1–3 at 390 × 780 and 1280 × 720 reach the end card.
