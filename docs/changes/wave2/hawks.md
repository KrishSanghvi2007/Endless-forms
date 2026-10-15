# Wave 2: Hawks and Doves (`hawks`)

Unit agent: senior game developer and evolutionary biologist. Files: `games/endless-forms/source/v2/hawks.js` (`CH_HAWKS_V2`, about 1,060 lines), `tests/oracle_hawks.js`, `tests/hawks_shots.py`, `tests/hawks_paths.py`. No engine file, legacy file or other unit's file was edited. Nothing was committed. The legacy chapter (`ch5.js` with the `ch10.js` wrappers) is untouched and still plays under `?v1=1`.

Specs followed: D6 (binding), D5 §3 (the 14-line checklist) and §4 item 3, D1 §3.4 and G1–G12, D2 §8, §11, §15, D4 §2–§8 (Hawks rows in §2.2 rule 4 and §5.3), API_v2 with §13, `engine_integration.md`.

## What I built

**Role:** a behaving animal (D1 G1, role 2). You are one hermit crab. Your choices become a rule, and from L2 on your young carry it into a beach of 150 crabs. **Place:** the Shore. **The second:** a rival scuttles in; you play **Hawk** (escalate) or **Dove** (display, back off if it escalates). You choose by tapping the rival (Hawk) or your own crab (Dove), with the dock buttons, or with ←/→, H or D. You cannot read the rival's rule until it acts. **The minute:** four duels, then a tide. The wash runs over the beach and every lineage is resized by its payoff (Wright–Fisher through `WF`). **The level:** one new variable each. **The boss:** a war of attrition in which no fixed habit is stable.

Your rule is your Hawk share over your last eight duels in each context. Your lineage plays it, and rivals are drawn from the whole beach, so as your lineage spreads you meet your own kin ("your own kin!"; the kin wear the you-halo).

| Level | Adds | What happens | Prediction (gesture on the live graph) | Stars it can give |
|---|---|---|---|---|
| L1 The tide pool (12 duels, 3 tides) | fight payoffs (V = 4, C = 10) | 85% of crabs are hawks. Hawk against hawk costs 10 half the time, so hawks fall towards V/C. You are a crab here; no lineage yet. | After tide 1, drag the hawk share at the last tide (practice; band and expectation shown). | Discover: you tried Hawk and saw hawks fall ≥ 15 points. |
| L2 The mutant (32, 8) | your rule as a lineage | An all-dove beach; you are one haloed crab. Your hawks spread, start fighting each other, and stall near V/C. A V/C rope appears once you have called it. | After tide 1, drag the hawk share at the last tide. | Discover: hawks (all your kin) pass 20%. Predict: within ±0.08 of the expectation. |
| L3 The unbeatable beach (20, 5) | mixing within each crab | Every resident hawks 40% of the time (natural paint, claws flicking up and down). Your rule seeds 15 crabs. Hawk and Dove pay the same here; any other rule loses once common. Then a **new beach** appears: shells worth 6, injuries 8, half hawks. | The new beach's hawk share at its last tide, then 8 tides run in fast forward. | Discover: you tried a rule ≥ 0.25 from the residents'. Transfer: the new beach within ±0.08 of 0.75. |
| L4 Big shells (20, 5) | a prize worth more than a fight costs (V = 8, C = 4) | Hawk beats Dove against anyone; hawks take the beach and the mean payoff falls from 3.9 to 2. | After tide 1, drag the mean payoff at the last tide. | Discover: hawks up ≥ 25 points while the mean payoff fell ≥ 0.8. Predict: within ±0.4. |
| L5 Sizing up (32, 8) | the rival's size | Each rival is up to two size steps bigger or smaller (drawn at hero size, ±16% a step); a bigger crab usually wins an escalated fight. Your rule becomes conditional. An assessor rule invades the blind beach. | After tide 2, drag your kin share at the last tide. | Discover: your rule fights smaller rivals more than bigger ones (gap ≥ 0.5) and your kin reach 15%. Predict: within ±0.07. |
| L6 War of attrition, boss (18 duels, 6 tides) | time instead of fights | No fighting. Hold to rap on the shell (2.5 raps a second; each rap costs 1; the shell is worth 10). Each crab commits to a quitting point; the more persistent wins and both pay the shorter count. The beach starts with an 8-rap habit, is beaten by crabs holding longer, then spreads out towards the ESS. | After tide 1, drag the beach's average quitting point (practice). | Discover: ≥ 3 shells won while the beach's spread grew past 4 raps. Transfer: your last eight holds are so unpredictable that no rival rule gains more than 1.25 on them. |

`content.boss.inverts`: "In L2 fixed types made a stable mix; here only unpredictable quitting is stable."

**What if? (the freezer).** Every tide is frozen. The level card offers two levers that thaw the last frozen tide, change one thing and let the beach run five more tides in fast forward, ending in an Interesting result:

| Level | Levers |
|---|---|
| L1 | Cheap fights (C = 2: hawks take over); Costly fights (C = 20: hawks near 0.2) |
| L2 | Cheap fights; You play Dove (nothing changes) |
| L3 | Start common (your rule at 30%+: it shrinks); Pure types (40% pure hawks: every duel goes the same way) |
| L4 | Costly fights (C = 12: hawks near 2/3); Start all doves (hawks still win; payoffs still fall) |
| L5 | An assessor (invades); Fight bigger (the reverse rule shrinks) |
| L6 | Fixed habit (9 raps: exploited); Random holds (exponential-like: holds its own) |

**Juice (D4 §5).**
- *Pick (T1):* your crab turns blue with claws up (Hawk) or amber with claws down (Dove), squashes for 220 ms, and gets a ring and a "tock" (40 ms act-to-juice, measured).
- *Clash:* the crabs lunge and meet in the middle at 0.16 s. A paper impact star, dark sparks and a crack follow. An injury costs you a 5 px shake, a 50 ms hit-stop and a falling "−10"; a win gives "+4". A retreating dove scuttles back in a dust puff. The prize shell slides to the winner. A kin rival is haloed when revealed.
- *The next rival* walks in while the last fight settles, and a pick made during a clash is queued. Buttons never grey out.
- *Tide (T2):* a wash rolls down the beach and draws back. Crabs that left no young become dashed rings; hatchlings pop in from egg bursts, anywhere on the beach. A new groyne post rises, painted to the new share.
- *Level (T3):* a banner with the level name.
- *Boss:* each rap is a tock and a claw strike. A blue cursor slides along the in-scene ruler, so every crab left of it is one you would outlast. When you let go, the rival's limit is ringed on the ruler and shown in a pill ("it: 8").
- *Calm:* no lunges, shake or waves; crossfades and static marks instead.

**The live graph, in the scene and in the strip.**
- *In the scene (rung 0–1):* a row of groyne posts, one per tide, each painted to the hawk share (blue) or your kin share (hatched paper), with a dashed V/C rope once it can no longer give an answer away. In the boss, a rap ruler stacks every crab's quitting point as dots, with your holds as diamonds.
- *In the strip:*
  - L1, L2: the hawk share (your kin under it in L2), and what Hawk and Dove each pay per duel. The two pay lines cross at V/C.
  - L3: the invasion test (your edge over the residents as your lineage share grows: zero when rare, negative once common) and your kin share; then the new beach and its payoffs.
  - L4: the mean payoff and the hawk share.
  - L5: your kin share and your rule (P(Hawk) against smaller, equal and bigger rivals, against the beach's 0.4).
  - L6: a quitting-point histogram (bars of crabs, your holds as diamonds, the ESS shape as a dashed ghost once you have called it) and the exploit meter with a hatched safe zone.
- *Level cards:* what happened (solid), the expectation (dashed) and your call (diamond).

**Accessibility.**
- *Keys:* ←/D Dove, →/H Hawk, Space raps or stops, P and arrows move the prediction, Enter locks it in.
- *Tap alternatives:* to every drag (Predict) and to the hold (tap to start, tap to stop).
- *Untimed mode:* rivals, predictions and the boss wait for you. Timed mode defaults to Dove after 3 s, and to walking away after 4 s in the boss.
- *Screen readers:* one live-region line per duel and per tide, and a data table behind "Show data" (including the custom histogram).
- *Colour vision:* Hawk/Dove are blue/amber plus claw shape (D4 rule 4); mixing crabs and the boss keep natural paint. The CVD and hue lints pass.
- *Projector, teacher, deep links:* `?unit=hawks&level=N&seed=S` works.

**Learning layer (D5 §3 item 12).** Outside `?v1=1`, `TAKE.hawks`, `MODEL.hawks`, `RECALL.hawks` and a new `BRIDGE.hawks` (the Jaws echo, D2 §3) are rewritten. There is no `TRANSFER.hawks`. The `ch10.js` wrappers patch only the legacy object, which v2 bypasses (L4–L5 are re-implemented on purpose, as D1 asks). Star migration and `Save.d.done` come from `00_entry.js`.

## Science claims, with references (for Coordinator A)

| Claim on screen or in a card | Where | Reference |
|---|---|---|
| Hawk v hawk (V − C)/2, hawk v dove V, dove v hawk 0, dove v dove V/2; hawk and dove pay the same at a hawk share V/C | Why? maths, L1–L2, oracle | Maynard Smith & Price 1973, *Nature* 246: 15; Maynard Smith 1982, *Evolution and the Theory of Games* (CUP) |
| An ESS is a rule that, once common, no rare rule can beat | Why? maths, L3 take | Maynard Smith & Price 1973 |
| At a mixed ESS every rule in its support earns the residents' payoff, so a rare mutant only drifts; once common it does worse | L3 MODEL, invasion test, oracle | Bishop & Cannings 1978, *J Theor Biol* 70: 85; Maynard Smith 1982 |
| Selection on individuals need not raise the average: with V > C hawks take over and the mean payoff falls to (V − C)/2 | L4 MODEL, take, oracle | Maynard Smith 1982 |
| Assessment of resource-holding potential: a rule that reads the rival beats blind fighting | L5 MODEL, take | Parker 1974, *J Theor Biol* 47: 223 |
| Hermit crabs size up shells and rivals before and during fights | Why? real, L4 MODEL | Elwood & Briffa 2001, *Adv Study Behav* 30: 53 |
| Red deer stags roar and walk in parallel before fighting; most fights are between evenly matched stags | Why? real | Clutton-Brock, Albon, Gibson & Guinness 1979, *Anim Behav* 27: 211 |
| Speckled wood residents usually keep their sunspot; later work found residents often have other advantages; "intruders win" is stable in theory but rare in nature | Why? real | Davies 1978, *Anim Behav* 26: 138; Maynard Smith 1982 (later work, e.g. Stutt & Willmer 1998, to check) |
| War of attrition: against any fixed quitting point, holding a little longer pays; the ESS is a random (exponential) quitting time with mean V/c | Why? maths, L6 MODEL, oracle | Maynard Smith 1974, *J Theor Biol* 47: 209; Bishop & Cannings 1978 |
| An exponential of mean 10 exceeds 40 with chance e^−4 = 1.8% | the 40-rap cap (D1) | arithmetic (oracle) |
| Fighting hermit crabs rap their shell against the rival's; rapping uses energy reserves | Why? real, L6 MODEL | Briffa & Elwood 2004, *Proc R Soc B* 271: 373 |

Model results the oracle checks (designed parameters, not field data):
- the 150-crab beach settles at 0.39–0.40 hawks from 85% or from 8 hawks (hawks lost by chance in 3 of 60 runs from 8);
- an assessor earns 2.17 against 1.20 on the 40/60 beach, and the reverse rule 0.23;
- one size step smaller wins an escalated fight with chance 0.119 (designed, k = 2);
- the model's own long-run WOA quitting points average 9.93 raps (V/c = 10, capped at 40), and every common quitting point earns within 0.37 of the others.

Nothing on screen is contested, so no Contested pill is shown. Every MODEL card has `contested: false` and refs ids (`msp1973, ms1974, ms1982, bc1978, parker1974, cb1979, eb2001, be2004`). Each card tags every parameter designed or ×N. On screen, "×4 generations" (×6 in L2, ×5 in the boss) sits beside the tide counter. **Coordinator A has not yet signed these claims off.** The Davies follow-up citation is marked "to check".

## Deviations from the spec, and why

1. **L5 is "Sizing up" (rival size only), not "Owners and sizes".** D5 §3.4 requires one new variable per level, and roles × sizes would make six contexts the player cannot fill in eight duels each. Ownership, Bourgeois and the paradoxical rule move to Why? (real). Size gives a first-order invasion that is visible in one level. Ownership alone would be neutral when rare at the H/D mix and would invade only by drift.
2. **L1 has 12 duels (3 tides), not six.** One tide is too few to see hawks fall. L1's prediction is practice (no star), because the unit's Predict belongs to L2/L4/L5.
3. **L3 seeds your rule at 15 crabs, not one, and ends with D1's "new beach" transfer** (V = 6, C = 8, 50% hawks), which D1 lists among the stars. From one crab a rule at the mixed ESS only drifts and never shows the second ESS condition. The invasion-test chart shows both conditions (zero when rare, falling once common) and the lineage visibly shrinks.
4. **Your lineage's floor.** "You are one haloed crab": your own crab never dies, so your lineage never drops below 1 (designed, on the MODEL card). In L5 the rule starts as a brood of six and never drops below three: from one crab a perfect assessor still failed to invade within the level in about 20% of runs, by drift. That is honest biology, but it would make Discover a lottery.
5. **Generations per tide** are 4 (L1, L3–L5), 6 (L2) and 5 (boss), all ×N. At 4, L2's lineage had not reached its plateau by tide 8 (mean 0.34 against V/C = 0.4); at 6 it reaches 0.385 and stalls, which is the lesson.
6. **Stars are per level** (the Lichen approach). D1's unit stars need several levels at once (Predict = L2 and L4; Transfer = new beach and L6). Unit stars are an OR of level masks, so that cannot be expressed (engine request 1). No level offers all three bits.
7. **The scored expectation is a Monte-Carlo mean** of 200 Wright–Fisher replays from the beach at the ask, with the rule the player actually used at each tide. A deterministic recursion overshot by 0.05 when a lineage starts from one crab (the oracle caught it). The replays draw from `R()` after the level is over, so a run stays (seed, actions). The boss's practice call uses a deterministic projection.
8. **L4's prediction is the mean payoff by distance** (±0.4), not just its direction. A distance in payoff units carries the direction (G5), and "no change" or the axis midpoint both miss.
9. **The boss is a sealed war of attrition.** Each crab commits to a quitting point, and neither shows it until you let go. This is the strategic form Maynard Smith analysed: the contest ends at the first quit, so a pre-committed time is the whole strategy. It also lets your actual holds be your lineage's rule without censoring. Time runs in raps (2.5 a second; cap 40 = 16 s), not seconds. The boss Transfer is measured as exploitability: the most any single quitting rule could gain on your last eight holds, which must be ≤ 1.25. Exponential-like holds score 0.8; a fixed habit scores 5–7.
10. **No in-canvas buttons.** The dock holds Hawk and Dove. On the canvas the crabs are the tap targets, so the ghost hand can demonstrate the first action (tap the rival).
11. **The rival's rule is hidden until it acts** (natural paint, then blue or amber). Otherwise every duel is a best response to a known type and the game's problem disappears.
12. **L2's V/C rope and line appear only after your call is locked**, and at the end the expectation replaces them (reveal ladder).

## Engine requests (nothing was edited; local helpers instead)

1. **Unit-level star functions** (as Lichen asked): `ch.unitStars(levelMasks)`, so D1's cross-level star rules can be written.
2. **A histogram chart type with an expectation curve.** I registered `LiveGraph.T.hk_hist` from `hawks.js`, using `wgXY`, `wgAxes`, `wgDiamond`, `wgYou` and `wgText`.
3. **The ghost hand cannot point at the dock.** `Ghost` draws only on the stage canvas, so an action that lives only in the dock cannot be demonstrated. A DOM-anchored ghost (`at: element`) would let units keep choices in the dock alone.
4. **No keyup reaches chapters** (`Keys` forwards keydown only), so Space cannot be held. The boss uses Space as tap-to-start/tap-to-stop (the D5 ruling for holds).
5. **The lint's exemption regex:** in `lintSource`, the block-comment alternative `/\*[^]*?\b(cosmetic)\b…/` starts at a file's first `/* … */` header and lazily swallows everything up to the first `// cosmetic` marker. So the marker never exempts a function in a file that opens with a block comment. I used `Det.sin/cos` in the view instead.
6. **Conflicting budgets:** `firstWords` allows 40 words, but `HUD.say` warns above 15 and the monkey fails on that warning. I cut `firstWords` to 14 words.
7. **An empty dock** (during fast-forward phases) leaves a blank 72 px bar on phones. A "dock hidden" state would help.
8. **The crab rig at crowd size:** the shell dominates, so a Dove's amber body is small at 14–16 px. A crowd-tier pose with a larger tinted body and claw would help (`01_rig.js` owner).

## Tests (build: `V2_ONLY='0*,zz_*,hawks.js'`, scratch `wave2/hawks.html`; also the full build with every v2 file)

- `node --check` on `v2/hawks.js` and `tests/oracle_hawks.js`: **clean.**
- `node tests/lint_text.js … hawks`: **0 errors, 0 warnings** (budgets, sentences ≤ 18 words, British spelling, agency, CVD and hue lints, no `fillText`, no `Math.exp/log/pow/sin/cos`).
- `node tests/oracle.js … hawks`: **54 passed, 0 failed.**
  - *Payoffs:* the payoff table; hawk = dove = 1.2 at V/C.
  - *D5 line A (no player reaches V/C):* deterministic 0.400 from 85% and from 5%; 150 crabs give 0.394 from 85% and 0.398 from 8 hawks.
  - *D5 line B (a rare pure invader into the mixed-ESS beach has negative mean fitness over 200 seeds):* Hawk −9.9e-3, Dove −4.5e-3. At 20% of the beach a pure lineage shrinks (30 → 12.7 Hawk, 30 → 20.2 Dove over 20 generations).
  - *Bishop–Cannings:* edge exactly 0 when rare and −5f(r − 0.4)² once common.
  - *Per level:* L2 ends at 0.385 hawks with Discover in ≥ 90%; L3's new beach ends at 0.745; L4 has 99% hawks and a mean payoff of 2.03; L5's assessor reaches 60% while the reverse rule stays at 2.6%.
  - *The boss:* one rap more beats any habit; exploitability is 5.0 for a fixed habit and 0.8 for exponential-like holds; the long-run ESS averages 9.93 raps; the beach spreads in 100% of runs.
  - *Determinism:* determinism, snapshot restore and log replay are exact.
  - *Scoring:* the expectation matches 300 independent replays (0.318 against 0.319); marking the expectation earns Predict in 100% of runs, "no change" in 0 of 90.
  - *Bots:* every bot finishes every level; no bot earns three stars in a level.
  - *What if?:* the What if? levers behave as described.
- `python3 tests/bots.py … hawks --seeds 1-40`: **PASS.** Best masks:

  | Level | alwaysA | alwaysB | random | greedy | threshold |
  |---|---|---|---|---|---|
  | L1 | D | – | D | D | D |
  | L2 | D | – | DP | D | D |
  | L3 | D | D | DT | – | D |
  | L4 | D | D | DP | D | D |
  | L5 | P | – | P | D | DP |
  | L6 | D | D | D | DT | D |

  - `--untimed` (seeds 1–15): PASS.
  - *Unit-wide (oracle, 20 seeds):* alwaysA 2, alwaysB 1, greedy 1, threshold 2. A uniformly random clicker lucks into all three unit stars on about 1 seed in 20 (a 17% band hit in L3 plus a Predict hit elsewhere); no level ever gives it three.
  - *Greedy:* the myopic best-reply bot earns the boss Transfer on 1 seed in 40. Chasing the beach's best reply in a war of attrition makes its holds genuinely irregular.
- `tests/monkey.py hawks 1,2,3 --vp 390x780,1024x768,1280x720`: **9 of 9 reach the end card.** No errors, no bad text, no warnings, ≤ 26 words in the HUD, What if? exercised. On the full build (every v2 file), 2 of 2.
- `tests/golden.py check`: **47 ok, 1 skipped** (hawks replaced). `--v1`: **48 ok.**
- `tests/hawks_paths.py`: **24 ok, 0 failed.** It covers:
  - real canvas taps (rival = Hawk, your crab = Dove), arrows, H, D, and P/arrows/Enter for the prediction;
  - act-to-juice latency 40 ms;
  - the Hawk and Dove buttons never both disabled (125 samples);
  - What if? "Cheap fights" thawing to 0.93 hawks with its Interesting result;
  - untimed waits (duel 9 s, prediction 20 s, boss);
  - the boss hold (2 s = 5 raps), tap-to-start/tap-to-stop and Space;
  - Calm plus a deep link, and teacher mode;
  - `?v1=1` opening the legacy chapter's intro card.
- **Performance:** update plus draw costs a median of 3.5 ms (p90 6.0 ms) at 4× CPU throttle on a 390×780 phone at DPR 2, and 2.9 ms at 1280×720. That is 150 crowd crabs blitted from baked sprites plus the duel.
- **Not run:** axe-core (not available offline); a designer-and-colleagues playtest (D6 decision 4).

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/hawks/`:
- `final/`: every level at 390×780 and 1280×720 (`L<n>_{start,clash,tide,mid,hold,ask,askmoved,committed,nbrun,card,why}_<vp>.png`).
- `calm/`: L1 and L6 under reduced motion.
- `cvd/`: L2, L5 and L6 in mono and deuteranopia at both sizes.
- `frames/`: a hawk-against-hawk clash frame by frame (`hh_sheet.png`) and a tide (`tide_sheet.png`).
- Contact sheets: `sheet_a.png`, `sheet_b.png`, `sheet_cvd.png`, `sheet_desk.png`.

I looked at them and fixed what looked wrong:
- in-canvas Hawk/Dove pads duplicated the dock (removed; the crabs became the tap targets);
- the duel crabs were small (now 0.27u, up to 150 px);
- the tide counter sat under the HUD;
- new lineages hatched in the bottom rows only (keepers are now random);
- the boss tally overlapped the ruler (now pills over the crabs and a cursor on the ruler);
- stale crabs and live buttons showed during fast-forward (now a lapse panel and an empty dock);
- the lunges never touched (they now meet, with an impact star and dark sparks);
- the rule chart's tick labels repeated "same";
- the L2 chart drew your kin over the hawks.

## Instructor note (one page)

**In one line:** students play a hermit crab choosing Hawk or Dove. Their choices become a rule their young inherit, and they watch it spread, stall at V/C, fail to beat a mixed ESS, win where prizes dwarf costs, and finally lose to its own predictability in a war of attrition.

**Timing:** about 10 minutes for a confident student (a random player takes 6 minutes of game time), 15 at most. Each level ends on a card that auto-saves.

**Before (2 min):** "If fights cost more than the shell is worth, will hawks disappear?"

**During (8 min, a shared seed works):**
- On the L2 card, ask why the lineage stopped near 40% when hawks win every fight against doves.
- In L3, ask what makes this beach unbeatable.
- On the L4 card, ask why nobody switches back to Dove.

**Discussion prompts (rising Bloom; `teacher.prompts`):**
1. Why did hawks decline on the tide pool, and where did they stop?
2. Can you tell 40% hawks from crabs that each fight 40% of the time?
3. Real crabs grow, learn and remember rivals. Which missing piece would most change these results? (A model critique.)

**Misconceptions targeted:**
- the best strategy is fixed (L1–L2: it depends on what others do);
- evolution maximises the good of the group (L4);
- a mixed population and mixing individuals are different things at equilibrium (L2 against L3);
- a winning habit stays winning (the boss).

**Projector:** `?projector=1`, or `?teacher=1` for play, step, speed, seed and freeze. **Deep link:** `?unit=hawks&level=N&seed=S`.

**Playtest script (designer and colleagues, D6 decision 4):**
1. Begin at L1 and note the time to the first choice.
2. In L2, note whether the stall near 40% surprises you, and whether you noticed fighting your own kin.
3. In L3, try pure Hawk and watch the invasion test.
4. In the boss, note whether the exploit meter made "be unpredictable" clear before the end card did.
5. Mark any moment you wanted to skip, and rate enjoyment out of 5.

## Review round (15 October 2026)

Three reviewers (playtest and art, science, design) raised 39 issues. I checked each one against the code and fixed the real ones, blockers and highs first. Files edited: `v2/hawks.js`, `tests/oracle_hawks.js`, `tests/hawks_paths.py` and `tests/hawks_shots.py`. No other file was touched and nothing was committed.

**This section replaces the earlier parts of this log where they differ.** The main changes:
- L5 is now **Owners** (Bourgeois), not Sizing up. Rival size moved to a What if? lever.
- L2 starts from a **brood of four**.
- Your young inherit your rule **by cohort**.
- L4 lasts **three tides**.
- The boss's **Transfer** is calibrated against the ESS.
- Every What if? result is now **chosen from what happened**.

### Levels after this round

| Level | What changed | Stars it can give |
|---|---|---|
| L1 The tide pool (12 duels) | The call is labelled practice. The card says "Practice call: off by 0.08. No star rides on this one." | Discover: try Hawk, then out-earn the average crab as hawks fall by ≥ 15 points. |
| L2 The mutant (32 duels) | A brood of four, floor two. | Discover: hawks pass 20% and you out-earn the average crab. Predict: within ±0.08, only when the share really changes. |
| L3 The unbeatable beach (20 duels + new beach) | An edge readout sits in the scene. | Discover (unchanged). Transfer: the new beach. |
| L4 Big shells (12 duels) | Three tides. "mean pay 3.9" shows in the scene. | Discover: hawks rise, the mean payoff falls, and you played what pays. Predict: mean payoff, only when it really changes. |
| L5 Owners (32 duels) | Each duel one crab owns the shell at random; owning does not change who wins. Your rule is P(Hawk) as owner and as intruder. Your brood of 25 hatches at tide 2 with your first eight duels. | Discover: a convention you seeded (owner-wins or intruder-wins) holds a third of the beach. Predict: kin share, only when it really changes. |
| L6 War of attrition (18 holds) | Calibrated Transfer and an honest body text. | Discover (unchanged). Transfer: over your last 12 holds, no rival rule gains more than 2.5, and sd ≥ 0.7 × mean. |

### Issue → action

**Playtest and art**

| # | Issue | Verdict | Action |
|---|---|---|---|
| 1 | The first duel is played for you; "Too slow" is overwritten (high) | Fixed | The first duel of every level waits for ever, in the boss too. Later rivals wait 5.5 s (was 3 s), and the boss waits 6 s. A solid arc on each dashed ring shrinks as the clock runs; the boss has a small arc on the rap ellipse. In `juice()` "slow" now wins over every other line, and the live-region line starts with it. The ghost hand stays until your first pick. Checked in the browser: the whisper log ends "Too slow, so you displayed." |
| 2 | L2 has a dead stretch from one founder (high) | Fixed | `you: 4, floor: 2`. Hawks are under 10% after tide 3 in 4% of 80 seeds (was about 25–50%), and the median tide to reach 10% is 2. The MODEL card shows "your start 4 crabs" and "your floor 2 crabs". The ask after tide 1 now comes when the hawk share is a few per cent, not 1%. |
| 3 | Your rule is invisible (high) | Fixed | Eight pips sit under your crab: blue filled for Hawk, amber hollow for Dove, newest on the right, labelled "rule: 5/8 hawk" ("picks:" in L1, "owner:"/"intruder:" in L5 for this duel's role). The L2 HUD swaps to "Your newest young play your last eight picks. Watch the ringed crabs." after tide 1. L3 shows "your edge −0.18" with a bar in the scene, from `rec.adv`. |
| 4 | The Hawk button is the crimson primary (medium) | Fixed | Both buttons wear their ink (`Pal.INK[theme].A/a`) with text in `Pal.best` contrast. Hawk has a claws-up glyph and Dove a claws-down glyph. Neither is primary. During a call the dock holds only "Lock in" (primary), so a stray tap cannot queue a pick. |
| 5 | Taps off the crabs do nothing (medium) | Fixed | The arena is two halves: the nearer crab wins. A tap on the prize shell, or on the beach above, pulses both rings and whispers "Tap the rival to fight, yourself to display." once per level. |
| 6 | Holding Space is uncontrollable (medium) | Fixed | A `Hooks.key` hook swallows `e.repeat`, and a capture-phase `keyup` listener releases the hold, so Space is a true hold. A quick tap latches, as the pointer does. The HUD says "Hold to rap, or hold Space." Checked: Space held for 2 s with eight repeat keydowns gives one hold of 4 raps. |
| 7 | A double tap pre-answers the next sized duel (medium) | Fixed | In levels with a cue (L5 roles, and sizes under What if?) picks are never queued: a tap during the clash whispers "Wait for the next rival." Elsewhere a second tap within 0.3 s of the clash is a double tap, not a pick. The cue is in the labels ("you · owner" / "rival · owner"), and the live region says "You own this shell." at the face. |
| 8 | L1 practice unmarked; star hints are unit-level (medium) | Fixed | L1's HUD reads "Practice: drag the marker…", and its card prints how far off the call was. Each card names only the stars its level can give. `C.stars` is swapped in `finish()` and restored, the way Lichen does it. Each level has its own Discover line. |
| 9 | V and C never shown; V/C and ESS undefined; the L2 HUD goes stale (medium) | Fixed | Every duel scene shows "shell 4" and "injury 10" chips (L4: 8 and 4; boss: "shell 10", "rap costs 1"). The L2 card says "V/C is shell ÷ injury". The L3 card says "evolutionarily stable strategy (ESS)". The stale L2 HUD line is gone (see 3). |
| 10 | No settings screen (medium) | Partly fixed; engine request | Hawks now honours `?untimed=1` in every build (checked in the browser). A settings card and `?calm=1` outside dev builds belong to the shell, and `docs/PLAYTEST_GUIDE.md` is not mine: see engine requests 9–10. |
| 11 | The collapsed strip is unreadable (medium) | Partly fixed; peek rejected | Each level now has one in-scene readout: rule pips, the edge bar (L3), "mean pay" (L4), "rivals gain" (boss), chips. I did not auto-open the strip at each tide: on a phone `Strip.open` overlays 60% of the canvas and would hide the tide wash, the moment the beach changes. Hiding legends while the strip is closed is LiveGraph's job: engine request 11. |
| 12 | The boss card leads with the L2 lesson; no Replay (medium) | Fixed | The final card's headline is `captions.take5`: "A habit gets beaten by one rap more. What lasts is a spread of quitting points no rival can read." The L2 take stays on the L2 card. A "Replay level" button is added to the final card, and Why? scrolls its panel into view. The body still needs a scroll on a phone, because the engine puts it below the chart. |
| 13 | Mono crowd is a grey mass (low) | Fixed | Crowd hawks carry a dark raised-claw tick, a luminance twin of blue that reads in `?cvd=mono` (`cvd/` shots). |
| 14 | L4 is a demo (low) | Fixed | Three tides (12 duels). The scene shows the mean pay falling tide by tide (3.9 → 2.3), and Discover now needs you to play what pays (always Dove never earns it). |
| 15 | Pills read as identities (low) | Fixed | The pills say "tap: fight" and "tap: display" on neutral paper. They show only for the first four duels, or after a miss. |
| 16 | Polish | Fixed | "1 rap". "Let go" stays above the arena's bottom. Pops start below the chip row. The chips moved off the posts to the top of the arena. On the debrief your call is a series with its own end label, so "your call" and "expected" no longer overlap. The score reads "payoff +4". |
| 17 | No way out of a level card; re-entry restarts at L1 (low) | Engine request | This is the shell's card and `App.open`. A Notebook button on Hawks cards alone would be inconsistent with the other units: engine request 12. |

**Science**

| # | Issue | Verdict | Action |
|---|---|---|---|
| 18 | "Inverts L2" is false; a mix of fixed quitters is a stable ESS mix too (high) | Fixed | `body` now reads: "No single quitting point is safe: once it is common, a crab holding one rap longer beats it. What lasts is a spread… The beach got there with crabs that differ; your lineage could only by varying its holds." `boss.inverts` reads: "In L4 one rule took the beach. Here no single rule is ever stable." The L6 MODEL simplification and `why.maths[2]` say that fixed quitters with the ESS spread are just as stable. The oracle's equal-payoff check (spread 0.37) is now cited for exactly that. **Flag for the D1 owner:** D1 §3.4 L6 ("only unpredictability is stable. Inverts L2") needs the same correction. |
| 19 | The boss Transfer does not reward the ESS (high) | Fixed | The new test is exploitability ≤ 2.5 over your last 12 holds, plus sd ≥ 0.7 × mean. In the oracle (4,000 sets each), holds drawn at random from the ESS pass 73%; uniform 0–20 passes 20%; uniform 1–25 passes 8%; a fixed habit and alternating 5/15 pass 0%. A player who quits at random from the ESS earns Transfer in 65% of runs (was 8%). The texts now read "Hard to exploit now. Rivals gain little.", "hold so unpredictably that rivals gain little" and the "hard to exploit" zone. The "Random holds" lever now draws eight holds from the ESS. |
| 20 | The L5 card's win chance is backwards (high) | Fixed | The card now lists "1 step smaller: 0.12", "1 step bigger: 0.88" and "2 steps smaller or bigger: 0.02 or 0.98", on the Owners card for the size lever. The oracle binds these values to `sim.pw`. |
| 21 | What if? texts ignore what happened (high) | Fixed | `wiText()` picks the text from the realised end against the thawed point, with an honest alternative for each lever (cheap/cheapSome/cheapNone, costly/costlyFar/costlyLow, common/commonNear/commonLucky, costly4/costly4Far/costly4None, allDove/allDoveSlow/allDoveNone, sizes/sizesDown, intruder/intruderDown, habitW/habitWslow, random6/random6Down/random6Flat). L2 and L4 levers thaw tide 1 (`wi`), so "Costly fights" thaws before doves are lost. "Habit beach" makes the whole beach hold 9 raps. The oracle checks each shown text against its own run (8 plans × 30 seeds, all match). |
| 22 | Hermit crab natural history (medium) | Fixed | "An attacker raps its shell against the defender's to evict it (Elwood and Briffa 2001). The winner takes the shell. The main cost is energy (Briffa and Elwood 2004). Here C stands for any cost of escalating." L6 now says "No injuries: both crabs rap". The L1 card says the empty shell is a designed simplification. |
| 23 | `nomix` text is wrong (medium) | Fixed | "Pure hawks and doves at 40% pay every rule the same as before. Follow one crab over many duels to tell them apart." |
| 24 | L6 nature omits the assessment debate (medium) | Fixed | Added: "Real shell fights are not a pure war of attrition. Defenders judge how hard the attacker raps (Briffa and colleagues 1998). Most real contests involve some assessment." New refs: `bed1998`, `be2000`, `te2003`, `ae2009`. I kept `contested: false`. The WOA theory the stars score is settled maths; what is debated is how well it fits real fights, and the card now says so in words. |
| 25 | L2 and L3 nature are theory (low) | Fixed | L3: Brockmann, Grafen and Dawkins 1979 (digger wasps dig or enter, pay about equally, each wasp does both), plus "In many animals boldness is consistent within individuals (Bell and colleagues 2009)". L2: Hori 1993 scale-eaters, with a pointer to Left Jaw, Right Jaw. L4 also gained a real case (fig wasps; Hamilton 1979; Enquist and Leimar 1990). |
| 26 | "Reverse rule" means two things (low) | Fixed | The sized "reverse" lever is gone. Why? says "The paradoxical rule, intruders win". The new L5 lever "Intruders win" is that rule. |
| 27 | L5 hawk share is an unweighted mean (low) | Fixed | Contexts are weighted by frequency: sizes 0.4/0.2/0.4, roles 0.5/0.5 (`HK_CTX`, `hp()`). The oracle checks that an assessor escalates in 60%, not 67%. |
| 28 | V/C needs V < C (low) | Fixed | Added to `why.maths[0]`: "This needs V < C. If V ≥ C, Hawk always pays more and hawks take over (L4)." |
| 29 | Housekeeping (low) | Fixed | New refs `davies1978` and `stutt1998`; Stutt and Willmer 1998 is now cited. The L1 card says "Counts use a normal approximation above n·p = 30". The ×N field reads "about 1/700 (two tides a day, a generation a year)". "A hawk wins every shell". Every card now lists baseline fitness B; the boss card lists selection strength and generations a tide. |

**Design**

| # | Issue | Verdict | Action |
|---|---|---|---|
| 30 | The core loop is "press the bigger number" (high) | Fixed (1–3); 4 declined | (1) "Hawk pays / Dove pays" leave the strip and stats while you play; they return on the card. (2) "pts" becomes "payoff". (3) Discover in L1, L2 and L4 needs the in-world goal, scored on the expected payoff of your picks, not luck. A new stat, "You vs average", shows it. (4) I did not add the size cue to L1–L4: each level adds one variable (D5 §3.4), and a cue in L1 would break the "hidden rival" problem the first levels teach. |
| 31 | Predict is self-fulfilling (high) | Fixed; unit stars still an engine request | A call counts only when the expectation is at least two bands from its value at the ask (`HK_real`). New bots `doveNoChange` and `hawkNoChange`: with greedy, they earn Predict in 0 of 360 runs. Marking the expectation still earns it in 100% when the change is real. "Two of three Predicts" and "both Transfers" need `ch.unitStars` (engine request 1, still open). |
| 32 | The boss Transfer is miscalibrated (high) | Fixed | See 19. |
| 33 | Bourgeois was lost (high) | Fixed | L5 is now Owners (D1's "Owners and sizes", with one new variable as D5 asks). Owner-wins is neutral when rare and favoured once common: edge 0.36 at 30%, 0.72 at 60%. From a brood of 25 it holds a third of the beach in 78% of runs and is lost by drift in 4 of 60. A blind rule ends at 12%. The strip shows the hawk–dove–convention simplex (the Jaws echo). Size moved to the "Sizes matter" lever, where an assessor invades in 30 of 30 runs. "Intruders win" is the paradoxical lever. |
| 34 | The boss does not invert the lesson (medium) | Fixed | See 18. The inversion is now true: in L4 one rule takes the beach; in the WOA no single rule is ever stable. |
| 35 | The lineage's rule is overwritten (medium) | Fixed | Cohort inheritance. At each tide your newest brood (floor size) takes your current rule. Older kin keep theirs as cohorts, merged to the nearest eighth and all haloed. The expectation replays the same inheritance. In the oracle, Hawk then Dove leaves hawks at 0.38, and a Hawk cohort survives in 100% of runs (was 0.00, every crab reprogrammed). Disclosed on the L2 card; the L5 card says the brood hatches with your first eight duels. |
| 36 | What if? rewrites the record (medium) | Fixed | A thaw keeps every realised record and appends one point marked `wi` at the thawed tide. The strip draws a dotted mark there. Posts show the changed point. Thawed runs reveal no expectations. Texts follow the outcome (see 21). |
| 37 | The L5 card's win chance (medium) | Fixed | See 20. |
| 38 | MODEL cards miss B, β and generations a tide (low) | Fixed | See 29. |
| 39 | The class tournament is missing (low) | Deviation; engine request | Not built. It needs a projector-mode import of students' result codes as lineages on one beach (engine request 13). The teacher pool stays `trace`. |

### Tests after this round (build `V2_ONLY='0*,zz_*,hawks.js'`, scratch `wave2/hawks.html`)

- `node --check` and `lint_text.js`: **0 errors, 3 warnings.** The warnings flag "Practice" as a possible verb; it is the British noun, so I kept it. Clean on the full build too.
- `oracle.js hawks`: **70 passed, 0 failed.** New lines cover:
  - the brood and floor; cohorts; Owners (neutral when rare, favoured when common, never fights itself, a mirror rule);
  - the size lever, and the card bound to `pw`;
  - the Transfer calibration; timers and queues;
  - the expectation replays with cohorts;
  - no-change bots (0 of 360); the Big shells Discover needing Hawk;
  - What if? texts against their runs; record kept.
- `bots.py --seeds 1-40` with `alwaysA, alwaysB, random, greedy, threshold, doveNoChange, hawkNoChange`: **PASS** (no bot earns three stars in any level). `--untimed`: PASS.
  - The greedy best-reply bot earns the boss Transfer in 17 of 40 runs: chasing a spread beach's best reply makes genuinely spread holds.
  - The threshold bot plays owner-wins in L5 and earns its Predict on 4 of 40 seeds, by calling the axis midpoint.
  - Unit-wide, a random clicker lucks into all three stars on 2 of 20 seeds (no level gives it three).
- `monkey.py hawks 1,2,3 --vp 390x780,1280x720`: **6 of 6 reach the end card**, What if? exercised, HUD ≤ 25 words.
- `hawks_paths.py`: **40 ok, 0 failed.** The 16 new checks cover:
  - the first rival waiting 10 s;
  - a shell tap giving a hint and no pick; the arena halves;
  - the Hawk ink and glyph, not primary;
  - "Too slow" kept as the last word;
  - Lock in alone during a call; "Practice";
  - `?untimed=1`;
  - no blind pick in Owners; the owner label;
  - Space held with OS repeats is one hold;
  - the boss card's Replay level and headline.
- `golden.py check --v1`: **48 ok.** `golden.py check`: 47 ok, 1 skipped (hawks replaced).
- Screenshots: `scratchpad/wave2/hawks/review/` at 360×640, 390×780 and 1280×720, plus `cvd-mono`, `cvd-deut` and Calm. I looked at them and fixed what I found:
  - the chips and tap pills collided at 360×640 (the arena now reserves 24 px for chips and a pips row);
  - the "owner" pill collided with the tap pills (the owner now shows in the crab labels);
  - an overlong L5 HUD line;
  - pops rising into the chips;
  - "your edge −0.00";
  - a Dove glyph that read as a car.

### New engine requests (nothing was edited)

9. A Settings card (Untimed, Calm, Readable, Left-handed) reachable from the title or menu.
10. Honour `?calm=1` and `?untimed=1` in every build, not only dev builds. Mention them in `docs/PLAYTEST_GUIDE.md` (not my file).
11. LiveGraph: drop in-chart legends and titles while the phone strip is collapsed.
12. Level cards: a Notebook button and a working Escape/back. `App.open` should resume at the next unfinished level.
13. A projector-mode class tournament: import students' result codes (P(Hawk | role)) as lineages on one beach (D1 §3.4, R8).
14. `End.show`: put the body above the chart on the final card, or let a unit choose, so the boss text is not below the fold on a phone.

Engine request 1 (`ch.unitStars`) is still open, and it is now the only thing between this build and D1's "two of three Predicts" rule.

### Instructor note: changes

- **L5 is Owners.** Ask "Owning a shell makes no crab stronger, so why does owner-wins spread?" Then try "Intruders win" under What if?: in theory it spreads just as well, but in nature it is rare.
- **The boss's lesson:** no single quitting point is ever stable. A beach of differing fixed quitters with the ESS spread is as stable as crabs that each vary. This contrasts with L4, where one rule (Hawk) takes the beach.
- **Misconceptions** now include "an arbitrary convention cannot be stable" (L5) and "your crabs change when you change" (the cohorts in L2).
- **Playtest:** colleagues without a settings screen can add `?untimed=1` to turn the clocks off.
