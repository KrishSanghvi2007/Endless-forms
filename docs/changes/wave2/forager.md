# Wave 2: The Forager (`forager`)

Unit agent: senior game developer and evolutionary biologist. Files: `games/endless-forms/source/v2/forager.js` (`CH_FORAGER_V2`, 124 KB raw, 38 KB gzip), `tests/oracle_forager.js`, `tests/forager_shots.py`, `tests/forager_paths.py`. No engine file, legacy file or other unit's file was edited. Nothing was committed. The legacy chapter (`CH_FORAGER` in `ch3.js` and `ch9.js`) is untouched and still plays under `?v1=1`.

Specs followed: D6 (binding), D5 §3 (checklist) and §4 item 8, D1 §3.7 and G1–G12, D2 §2–§3 and §15, D4 §4.1 (great tit), §5.3 (the Forager juice rows), API_v2 with §13–§14, `engine_integration.md`, `lessons_batch1.md`.

## What I built

**Role:** a behaving animal whose rule then competes as a gene (D1 G1, role 2). You are one great tit through one day on one map, then a winter night. **Place:** the Hedge. **The second:** take or pass. Caterpillars appear one at a time ahead of the bird; tap one to carry it home, tap the hedge to let it pass; in the orchard, tap the next tree to fly on; at night, tap a feeder. **The minute:** one stretch of hedge, one tree, one hawk round, one evening. **The level:** one new variable each, across the day under a moving sun (the sun is the clock). **The boss:** a winter night where survival, not rate, is the currency.

Encounters are **sequential**: the next caterpillar is drawn only when it appears (a per-tick hazard), so nothing in the state foretells it and a look-ahead bot has nothing to look at (the R7 A63 fault). Time spent deciding is free: the sun is charged only for searching and for each 2 s trip home, so the rule depends on time accounting, not reflexes (D1 untimed rule). The legacy `Math.min(1, eff)` cap is gone, and no star is a "% of best".

| Level | Adds | What happens | Prediction (gesture on the live graph) | Stars it can give |
|---|---|---|---|---|
| L1 The hedgerow (morning; 3 stretches, 85 s of sun) | prey choice | Big caterpillars (3 food) and small ones (1 food) appear one at a time, each in view for 1.2 s; each one taken costs a 2 s trip into the nest box, where four chicks gape and fatten. Big ones scarce (6 a minute), then common (36), then small ones swarm (90 a minute). The first caterpillar is a big one that waits for you. | After big ones were scarce, then common: drag the big-caterpillar rate at which small ones stop paying (15 a minute). Then, as small ones start to swarm: drag the switch point again (it does not move). | Discover (40 food; small ones taken while scarce, passed once big ones are common); Predict (both inside ±4 a minute). |
| L2 The orchard (midday; near trees, then far) | travel time | The tit feeds itself; in each tree catches come at a rate that falls as the tree empties (expected gain 6(1 − e^(−t/4))). Tap the next tree to fly on. Flights of 2 s, then 10 s (long flights shown faster than the sun counts them). Each round opens with a flight and ends at a departure, so every tree costs one flight. | After three near trees: drag the best time to leave (3.4 s). After two far trees: again (6.5 s). Only then does the tangent draw itself from minus the flight time, each time you leave. | Discover (36 eaten; mean far stay ≥ near stay + 1.5 s); Predict (both inside ±0.9 s and ±1.3 s). |
| L3 The hawk (afternoon; 2 rounds of 35 s) | predation risk | The take-or-pass verb again: hedge caterpillars are safe, field caterpillars are out in the open. A field trip exposes you; a sparrowhawk stoops at a rate set so a trip carries a 1% danger (hawk rare), then 50% (hawk hunting). Half of stoops strike home: feathers, a ghost ring, and your mate (a narrower breast stripe) finishes the day. | After the rare-hawk round: drag the danger per field trip at which field caterpillars stop paying (19%). | Discover (10 food; field taken while the hawk is rare, passed while it hunts, not caught); Predict (inside ±7 points). |
| L4 Your rule (evening; 4 trees, then 30 years) | inheritance of the rule | A last orchard run with trees twice as far apart (4 s). Your median stay becomes one founder lineage (haloed) in a flock of 200, beside "quick" (2 s) and "patient" (10 s) birds. Each year young come in proportion to e^(10 × relative catch rate) (×N), and 30% shift by half a second. Forty tits flit among five trees, each at its own leaving time: quick ones flit, patient ones linger; a dot histogram on the ground reflows each year. | With the founders on the histogram: drag where the flock's leaving time will settle (the tangent for 4 s flights, 4.6 s; counted only if closer to it than to the near-tree answer, 3.4 s). This is D1's "travel time doubles: drag your new leaving point". | Discover (your lineage holds half the flock at year 30); Transfer (the settle point). |
| L5 Winter night, boss (4 evenings × 10 visits) | a survival threshold | A steady feeder (always 2 seeds) and a lucky one (0 or 4: same mean). Reach the night line by nightfall or the night is too long. Two nights are safe (steady feeding reaches the line), two are short (only luck can). The sun sinks with each visit; at night the reserve gauge burns down to dawn or a ghost ring. | At each short night's start: drag your chance of surviving tonight with your best play (75% and 34%, exact by dynamic programming). | Discover (both safe nights and at least one short one survived); Transfer (choices give up ≤ 10 points of dawn chance against best play, and one odds call inside ±12 points). |

`content.boss.inverts`: "Survival, not rate, is the currency now: when steady falls short, gamble." L1–L4 reward rate; a rate-maximiser is indifferent between the feeders (same mean), but near starvation the gamble is the only hope and ahead of the line it can only hurt.

**Unit stars** (`ch.unitStars`): Discover = Discover in two of L1–L4 and the night Discover ("chicks fledged and the night survived", D1); Predict = Predict in two of L1–L3; Transfer = both L4 and L5 Transfers ("the boss, plus travel time doubles", D1). No level offers all three bits.

**What if? (the freezer).** Each level card freezes the finished level and offers two levers; one round reruns at ×4 by one fixed rule, and the card's words are filled from that run, with the model's expectation beside the realised number:

| Level | Levers |
|---|---|
| L1 | Take everything; Big ones only (the swarm stretch) |
| L2 | Leave at 2s; Leave at 10s (the far orchard) |
| L3 | Brave the hawk (every field caterpillar while it hunts); No hawk |
| L4 | No mutation (the flock stops at the best founder); Trees far apart (flights of 20 s: it settles at 8.4 s) |
| L5 | Always steady; Always lucky (exact chance of dawn for the fixed rule, against best play) |

**Juice (D4 §5.3, Forager rows).**
- *Appear (T1):* the caterpillar pops onto a pale leaf (120 ms) with a ring and two leaf flecks, a tick; a ring drains over the 1.2 s it stays in view.
- *Take:* peck burst of leaf flecks and the peck sound; the tit darts to the caterpillar, it dangles from the bill (`Rig 'tit'` carry), the bird flies an arc into the nest box with a faint motion trail.
- *Delivery:* the chicks gape as the tit nears (last part of the way home); the caterpillar arcs into the hungriest gape (350 ms), the chick squashes 10% and fattens (`Rig 'chick'` fed), "+3" pops and a peep plays; five pips over each chick fill.
- *Pass:* the caterpillar shrinks back into the leaf (250 ms) with a swish. A take-or-pass ledger in the grass grows one token per encounter (filled taken, hollow passed; big row, small row).
- *Orchard:* each catch is a peck burst and "+1" where the tit hops in the canopy; the canopy pales as it is picked over; leaving is a wing sound and a camera pan whose length grows with the flight; the in-scene gain card draws a staircase per tree and, once predicted, the tangent (500 ms, ease-out, hollow circle at the touching point).
- *Hawk:* the sparrowhawk circles with its shadow sweeping the field while it hunts; a stoop dives at the tit (350 ms); a miss is a feather puff, a 5 px shake and "The hawk missed!"; a strike is hit-stop, a feather burst, a shake and a dashed ghost ring.
- *Flock:* a tick each year, the histogram reflows, the crowd's rhythm visibly evens out.
- *Night:* seeds fly from the feeder into the reserve gauge ("+2", "+4" with sparks, an empty puff for 0); nightfall dims the scene, the moon crosses, the gauge burns down; dawn is a ring and a chime, starvation a ghost ring.
- *Level end (L1, L3):* the fed chicks hop to the rim and fly off; a chick that went short becomes a ghost ring in the cup.
- *Level start (T3):* a banner with the level name. A tap or Space speeds gaps, nights and the flock ×3. *Calm:* no shake, no trail, no wriggle, no snow drift.

**The live graph.** Rung 0–1 in the scene: the chicks fattening, the take-or-pass ledger, the gain card above the orchard, the flock's histogram on the ground, the reserve gauge with its night line. In the strip (one chart folded on a phone, two on desktop), all realised solid, expectations dashed only after you commit, your call a diamond:
- L1: *When to take small* (your stretches as dots at their big-caterpillar rate; after the first ask the "big only" and "take all" long-run rates crossing at 15 a minute; after the second, the swarm's "take all" line, crossing at the same place) and *Food per second carried* (profitability bars, then what passing small ones earns in this stretch).
- L2, L4 run: *Gain in a tree* (the current tree's staircase, past trees faint, your leaving points, your mean; after the ask the expected curve and the tangent from minus the flight time) and *Rate if you leave* (your trees' realised rates; after the ask the rate curve and its peak).
- L3: *Food against danger* (your rounds; after the ask both rules' exact expectations crossing at 19%) and *Food this round* (your deliveries against the round's seconds; after the ask both rules' expected curves for this round's hawk).
- L4 flock: *Leaving times* (dot histogram: your lineage solid, others hollow) and *Lineage shares*.
- L5: *Tonight's reserve* (your trajectory against the night line) and *Chance tonight* (one row per night: best play's chance once under way, your outcome).
- Cards: the diet crossing (L1), the gain and tangent (L2), food against danger (L3), lineage shares (L4), and for the boss best play's chance per night beside how each night went.

I registered one chart type from my file, `fg_xy` (axes, dashed expectation lines with end labels, staircases, dots, bars, a tangent that draws itself, the you-diamond, a data-table twin).

**Accessibility.** Keys: Space takes (orchard: Stay in untimed), → passes or flies on, 1 and 2 pick the feeders, P/arrows/Enter place and lock a prediction, Space speeds a gap. Untimed mode (Settings or `?untimed=1`, entered as a logged action): caterpillars wait for take or pass; time in a tree moves only by Stay, half a second at a time; predictions have no soft timer. Hawk outcomes never depend on reflexes. Live-region lines for each caterpillar, tree, year and evening. Colour vision: prey value is size plus a pale side stripe; field versus hedge is position; lineages are the you-halo and marker shape; no hue carries a score (CVD and hue lints pass; mono and deuteranopia screenshots below).

**Learning layer.** Outside `?v1=1`: `TAKE.forager`, `MODEL.forager`, `RECALL.forager` and `BRIDGE.forager` (from Hawks and Doves, the unit before it: "your fighting habit became a gene; here your foraging habit does"). There is no `TRANSFER.forager`. The only `ch99.js` entry for this id is its TAKE line, now overwritten. D1's echo holds: Raffle L3 ↔ Forager L2, the tangent.

## D5 §3 checklist (as amended by D6)

| # | Line | Status |
|---|---|---|
| 1 | Core verb | `role: 'animal'`; take or pass, feedback on the next frame; act-to-juice median 3–9 ms, max 13 ms (`Events.lat`); no control sets a heritable trait (the flock inherits your *behaviour*). |
| 2 | First 10 seconds | No card; 23 words; ghost hand after the 1.6 s banner; the first caterpillar is big and waits, and a tap off it does not lose it (oracle). Playtest median not measured. |
| 3 | Predict inside play | 1–2 asks in every level, on the strip, scored by distance to the model's expectation; `needMove`, ghost at the far end of the axis; band after commit. |
| 4 | Escalation | 5 levels, one `adds` each; bot sweep PASS (7 bots, 40 seeds, timed and untimed). |
| 5 | Boss | Inverts rate-maximising (`content.boss.inverts`). |
| 6 | Live graph | `notes()` charts; the strip never pauses play; realised solid, expected dashed, you a diamond; no expectation or tangent before the commit. |
| 7 | Juice | T1/T2/T3 via `Fx.tier`; D4 Forager rows (gape, arc into the gape, squash and fatten, the tangent drawing itself, hawk shakes); every sound with a visual twin; Calm path; draw p95 ≤ 4.7 ms at 4× throttle. |
| 8 | Text budget | Lint 0 errors, 0 warnings; no `fillText`; no `Math.exp/log/pow/sin/cos` (Det throughout). |
| 9 | Science honesty | MODEL card per level, ×N tags (danger, stoop success, selection, mutation, years) and ×N chips in the scene; the boss card is `contested: true`; refs ids; oracles pass; Coordinator A sign-off pending. |
| 10 | Teacher hook | Three prompts (one a model critique), `teacherStep` (skip the years, speed a gap), `resultBits` (30-bit code), class pool `trace`, instructor note below; CSV and projector from the engine. |
| 11 | Accessibility | Keyboard map, untimed hedge and orchard, P/arrows for every drag, live region, data tables, CVD and hue lints, mono and deut shots. axe-core not run (offline). |
| 12 | Learning layer | TAKE, MODEL, RECALL, BRIDGE rewritten outside `?v1=1`; no TRANSFER existed; star migration and `done` by the engine. |
| 13 | Monkey | 9 of 9 at 390×780, 1024×768 and 1280×720; golden 47 ok + 1 skipped, `--v1` 48 ok. |
| 14 | Playtest | Replaced by the designer-and-colleagues script below (D6 decision 4); not yet run. |

## Science claims, with references (for Coordinator A)

| Claim on screen or in a card | Where | Reference (id) |
|---|---|---|
| Include a poorer prey only if its profitability beats the rate from better prey alone; how common the poorer prey is does not enter the rule | L1 take, body, Why? maths | Charnov 1976, *Am Nat* 110: 141 (attack strategy); Stephens & Krebs 1986, *Foraging Theory* (`stephens1986`) |
| Great tits given large and small mealworm pieces on a conveyor became choosy when large pieces were common, whatever the small-piece rate; some still took a few small ones (partial preferences) | L1 MODEL, Why? real | Krebs, Erichsen, Webber & Charnov 1977, *Anim Behav* 25: 30 (`krebs1977`) |
| Leave a patch when its gain rate falls to the habitat's long-run average; longer travel means longer stays (the tangent from minus the travel time) | L2 take, Why? maths | Charnov 1976, *Theor Popul Biol* 9: 129 (`charnov1976`) |
| Captive great tits stayed longer in mealworm patches when travel (lids) took longer, slightly longer than predicted | L2 MODEL, Why? real | Cowie 1977, *Nature* 268: 137 (`cowie1977`); "slightly longer than predicted" to check |
| Kacelnik 1984 is a starling study (central-place load size); this tit carries single prey and does not model it | header, D1 §6 | Kacelnik 1984, *J Anim Ecol* 53: 283 (cited, not modelled) |
| Animals give up food to lower predation risk: they feed nearer cover and scan more when predators are about | L3 take, MODEL | Lima & Dill 1990, *Can J Zool* 68: 619 (`limadill1990`) |
| Sparrowhawks take many small woodland birds; most attacks fail ("often under 10%" in the ×N tag) | L3 MODEL, Why? real | Newton 1986, *The Sparrowhawk* (`newton1986`); the success figure to check (Rudebeck 1950–51, *Oikos*, is the classic source) |
| Real birds tune leaving times by experience as well; selection shapes learning rules | L4 MODEL, Why? real | Stephens & Krebs 1986 |
| Yellow-eyed juncos chose a steady tray when on track for the night and a variable one when short (the energy-budget rule) | boss MODEL, Why? real | Caraco, Martindale & Whittam 1980, *Anim Behav* 28: 820 (`caraco1980`); Stephens 1981, *Anim Behav* 29: 628 (`stephens1981`) |
| The energy-budget rule is contested: most animals tested avoid variable amounts, and many do not switch when short | boss MODEL (`contested: true`), Why? real | Kacelnik & Bateson 1996, *Am Zool* 36: 402 (`kacelnik1996`) |

Model results the oracle checks (designed parameters, not field data):
- the best stay is **3.431 s at T = 2 and 6.545 s at T = 10** for 6(1 − e^(−t/4)) (D5's 3.4 and 6.5), matching a brute-force maximum of gain ÷ (T + t); 4.585 s at T = 4;
- in the sim, a fixed stay at the tangent beats stays 3 s shorter and 3.5 s longer in the far orchard (0.303 against 0.265 and 0.285 caterpillars a second; model 0.292);
- the long-run "take all" and "big only" rates cross at 0.25 a second (15 a minute) for small-prey rates of 0.2, 0.5, 1.5 and 4 a second; in the sim the zero–one rule feeds the chicks 59.1 food against 51.0 (take everything) and 56.8 (big only);
- a Monte-Carlo look-ahead bot (40 rollouts per choice of the rest of the stretch) gets 56.3 food against the rule's 58.9; a giving-up-time bot in the orchard 48.1 against the tangent rule's 51.6 (D5: a look-ahead bot cannot beat the scored rule);
- the hawk round's expectation (an exact forward pass of the sim's own discrete chain) matches realised rounds within sampling error at dangers of 1%, 20% and 50%, for both rules; the two rules tie at 18.8% danger per trip;
- with mutation the flock's mean leaving time is within 0.5 s of the tangent by year 30 in 120 of 120 runs, from founders at 1.5–12 s; without mutation it settles at the best founder in 80 of 80 runs with a clear best;
- the winter-night programme gives 0.7539 (2 seeds, line 24) and 0.3438 (2, line 28); ahead of the line the gamble never beats steady feeding; best play survives 3.15 of 4 nights against an expected 3.10.

**Coordinator A has not yet signed these claims off**; two details are marked "to check".

## Deviations from the spec, and why

1. **The orchard tit feeds itself** (D1: "every catch is carried home one at a time"). The marginal value theorem needs patches the bird leaves; a single-prey central-place trip from a depleting tree is a different model. Cowie's great tits, the MVT test D1 cites, fed themselves. The hedgerow and hawk levels carry every catch home.
2. **Near and far trees, all alike** (D1 L2: "rich and poor trees at different flight times"). One variable per level: travel time. Rich and poor trees would add patch quality; the levelWhy notes the general rule.
3. **The hawk level is "field or hedge", without vigilance** (D1 L3: "vigilance or feeding; hedge or open ground"). Two responses would add a second control; the take-or-pass verb carries the risk choice, and the MODEL card says vigilance is not modelled. Being caught ends your day and your mate finishes it; the cost is the rest of the day's food (future broods are not counted, which the third teacher prompt asks students to critique).
4. **Your rule as a gene comes from an evening run in L4 itself, against time rules, with mutation** (D1 L4: "your L2 leaving rule against 'leave after 5' and 'leave at 10 s'"). Levels replay alone (lessons §1.6), so the rule must come from that level's play. "Leave after 5" is a count rule that stalls in trees holding fewer than five; "quick 2 s" and "patient 10 s" are its time-rule counterparts. Mutation lets the flock find the tangent nobody computed (D1 G7's "as if they optimise"), which is the level's point.
5. **D1's transfer gesture "travel time doubles: drag your new leaving point" is L4's ask**, scored against the tangent for doubled flights and confirmed by the flock settling there.
6. **The boss is four scenario evenings, and Transfer reads the chance of dawn given up** (legacy: 85% of "decisions that mattered"). With the 0.05 threshold, best play can face no decision that "matters" on a lucky night (5% of seeds); the summed regret against best play is luck-free and exact. A night failed means "you continue as another tit from the flock" (as Alarm's "continue as your daughter").
7. **The diet rule is written bE ÷ (1 + bt)**, not λE ÷ (1 + λh): D2 §15 reserves λ for speciation and h for dominance.
8. **Danger, stoop success, selection strength, mutation and years are ×N**: real single-trip danger and sparrowhawk success are far lower, real selection on leaving rules far weaker.
9. **Long flights are shown faster than the sun counts them** (about ×3 at 10 s) to avoid dead time; the travel label and the sun show the real cost.
10. **The ask in L5 is the chance of dawn with best play**, not a feeder choice: a two-option gesture is not allowed (D1 G5), and the feeder choices are scored separately as regret.

## Engine requests (nothing was edited; local helpers instead)

1. **A general XY chart**: dashed expectation lines with end labels, staircases, dots, bars with category labels, a tangent that draws itself. I registered `LiveGraph.T.fg_xy` in `forager.js`; the Raffle's L3 tangent (D1 echo) could reuse it if it moved to `01_widgets.js`.
2. **A flying great tit**: the `tit` rig has one pose. I drew flight as a tilted rig with a faint motion trail; a wing-up pose in `01_rig.js` would read better.
3. **A sparrowhawk rig** (D4 lists the hawk shadow): I drew a silhouette and its ground shadow locally.
4. **`runSim`'s `untimed` flag** sets `Save.d.ui.unt` but units take untimed as a logged action (lessons §1.6), so every unit's bots must send `{k: 'unt'}` themselves; `runSim` could log it.
5. **The HUD's real height** (`hudH()`, measured twice a second, as Jaws did); `Stage.zones.hud.h` stays at 56 px when the HUD wraps.
6. **An empty dock** during gaps and nights leaves a blank bar on phones (lessons §3 still open).

## Tests (build: `V2_ONLY='0*,zz_*,forager.js'`, scratch `wave2/forager.html`; full build `wave2/forager_full.html`)

- `node --check` on `v2/forager.js` and `tests/oracle_forager.js`: **clean.**
- `node tests/lint_text.js … forager`: **0 errors, 0 warnings.** Full build (8 chapters, 18 files): 0/0.
- `node tests/oracle.js … forager`: **42 passed, 0 failed** (`FG_FAST=1` for fewer seeds): the MVT numbers, realised rates by stay, no future in the state, look-ahead and giving-up-time bots, the diet crossing and the zero–one rule in the sim, the hawk round's exact expectation, the flock with and without mutation, the night programme and the energy-budget rule, determinism, log replay in every level, snapshot round trip (631 characters), the expert earning every offered star (20/20, 20/20, 19/20, 20/20, 18/20), no level offering three, no bot's union reaching three unit stars, the first action that cannot fail, untimed hedge and orchard, What if? runs ending with no stars.
- `python3 tests/bots.py … forager --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,lazy,bestNoThink`: **PASS**, timed and `--untimed`. Best masks:

  | Level | alwaysA | alwaysB | random | greedy | threshold | lazy | bestNoThink |
  |---|---|---|---|---|---|---|---|
  | L1 | – | – | D | – | D | D | D |
  | L2 | – | – | – | D | – | – | D |
  | L3 | – | – | P | – | D | D | D |
  | L4 | – | – | T | D | D | D | D |
  | L5 | – | D | D | – | D | D | D |

  "threshold" and "bestNoThink" play the right rules and earn Discover by design; no fixed rule earns a Predict or Transfer except random's lucky drags (one level at a time; unit union at most 1 star for every bot). Random's Transfer in L5 was 1 in 200 at a 15-point regret limit, 0 in 200 at the shipped 10.
- `tests/monkey.py forager 1,2,3 --vp 390x780,1024x768,1280x720`: **9 of 9 reach the end card**, no errors, no bad text, no Lbl/Whisper/HUD/Dock warnings, ≤ 27 words visible in the HUD (firstWords), What if? exercised at 1280×720. Full build: 3 of 3 at 1024×768.
- `tests/golden.py check`: **47 ok, 1 skipped** (forager replaced); `--v1`: **48 ok.** Full build: 40 ok, 8 skipped (the units replaced so far); `--v1` 48 ok.
- `tests/forager_paths.py`: **18 ok, 0 failed** — a real tap on the first caterpillar and the food arriving after the trip, → passing and Space taking, the dock, untimed caterpillars waiting 4 s, the untimed orchard moving only by Stay, the boss to its card under `?calm=1` and `?teacher=1`, a What if? lever restarting L2 and its card reading its own run with no stars recorded, `?v1=1` opening the legacy chapter.
- **Latency:** act-to-juice median 3–9 ms, max 13 ms (`Events.lat`).
- **Performance** (headless Chromium, 4× CPU throttle, 390×780 at DPR 2): `draw` median 1.0–2.2 ms, p95 2.8–4.7 ms; frame interval median 17–24 ms. Backdrops and the hedge strip are baked once per size; rigs come from `Rig`'s cache.
- **Size:** 124 KB raw, 38 KB gzip — the same as Hawks and Lichen, above the lessons' ≈ 30 KB gzip aim (five different scenes; flagged for review).
- **Not run:** axe-core (offline); the designer-and-colleagues playtest (script below).

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/forager/`:
- `L1_{start,trip,deliver,gap,ask1,reveal1,ask2,reveal2,card}_{390x780,1280x720}.png`, `L1_fledge_390x780.png`, `L1_fledge2_390x780.png`;
- `L2_{start,fly,tree,ask1,reveal1,tangent,ask2,reveal2,card}_…`;
- `L3_{start,field,trip,deliver,gap,ask1,reveal1,card}_…`, `L3_stoop_miss_390x780.png`, `L3_caught_390x780.png`;
- `L4_{start,tree,fly,ask1,reveal1,gens3,gens20,card}_…`;
- `L5_{start,feed,night,ask1,reveal1,eve3,ask2,reveal2,card}_…`;
- `*_cvd-mono.png`, `*_cvd-deut.png` (L1, L3), `*_calm.png` (L1, L5).

I looked at them and fixed what looked wrong:
- white hedge "flowers" read as snow (now a few pink and white dog roses);
- the tit floated over the hedge (a perch twig) and over the winter scene (now perched on the branch);
- the hedge caterpillar was lost in the leaves (it now sits on a pale leaf; field ones cast a shadow);
- the caterpillar vanished before the tit reached it (it now stays until grabbed);
- the chick pips were white bars like teeth (now small dots);
- the field was a thin strip under the hedge in L3 (now a third of the scene, with the hawk's shadow sweeping it); the hedge and field labels sat on the nest box;
- the gain card drew a straight line from the origin (now a staircase per catch, past trees faint) and its label sat on the axis;
- forty heavy halos made the flock a cloud of rings (now 24 birds in canopy slots with a thin you-halo; trees larger);
- the desktop strip was half empty (a second chart per level: profitability bars, the rate curve, food this round);
- the boss card showed only the last night's reserve (now best play's chance per night beside your outcome; dots at 100% no longer clipped);
- the winter sun showed through the snow at nightfall, and the gauge read "13 of 22" while burning down (now hidden below the horizon, and a plain number at night);
- the round label named the next stretch during the switch-point ask; the "caught" banner covered the whisper.

## Instructor note (one page)

**In one line:** students play a great tit through one day. They discover by doing that small prey pay only when big ones are scarce, that longer flights mean longer stays, that danger is a cost in the same currency as food, that selection finds the marginal-value rule nobody computes, and that near starvation the gamble beats the steady option.

**Timing:** about 15 minutes (L1 3, L2 3–4, L3 3, L4 2–3, boss 3). Each level ends on a card that saves.

**Before (2 min):** "A bird can catch big or small caterpillars. If small ones become twice as common, should it take more of them?"

**During:**
- On the L1 card: why did the switch point stay at 15 a minute when small ones swarmed?
- In L2: drag your leaving time before the tangent appears; then compare near and far trees on the card.
- In L3: why is a 1-in-100 danger worth taking but a 1-in-2 danger not? Where between them is the tie?
- In L4: watch the crowd's rhythm even out. Who computed the tangent?
- In the boss: on a safe night, try the lucky feeder twice. What did it buy you?

**Discussion prompts (rising Bloom; `teacher.prompts`):**
1. Why do tits pass small caterpillars when big ones are common?
2. Birds do not calculate tangents. Why do they act as if they do? (Try What if? No mutation.)
3. This model counts only today's food. What would counting future broods change? (A model critique: the hawk level.)

**Misconceptions targeted:** "more prey means take more of it" (the zero–one rule); "stay until the patch is empty"; "animals compute optima"; "the average is all that matters" (the boss).

**Model limits to mention:** prey values and handling times are designed; the bird knows its flight times; vigilance and learning are not modelled; the hawk danger and selection are exaggerated (×N); the energy-budget rule is contested (Kacelnik & Bateson 1996).

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open Endless Forms, Act 6, The Forager. Read nothing first. Note the seconds to your first tap.
2. L1: play to the card. When did you start passing small caterpillars? Did the second prediction (small ones swarm) surprise you?
3. L2: did the slowing catches feel like a reason to leave? Did the far trees make you stay longer before the tangent appeared?
4. L3: did the hawk feel dangerous? Did you take field caterpillars in the first round?
5. L4: could you see quick and patient birds in the crowd? Did the histogram settle where you dragged it?
6. Boss: on a short night, when did you switch to the lucky feeder? Did the card's "points of dawn given up" make sense?
7. Try one What if? on any card. Did its words answer "what changed?"
8. Settings → Untimed: replay L1 and L2. Do they still feel like decisions?

Feedback form (1–5 unless stated): fun; clarity of the verb; did the switch point and the tangent feel discovered or told?; the boss's link to the day (words); any moment you were bored or wondered how long was left (where?); any science you doubt (where?).
