# Wave 2 Batch 1: lessons for the next twelve unit builders

*Coordinator (technical design lead), 15 October 2026. For the builders of Batch 2 (`bitter`, `jaws`, `forager`, `raffle`, `alarm`, `clinic`, `switch`) and Batch 3 (`scribe`, `tap`, `royal`, `swamp`, `dig`). Read it after D6, D5 §3 and API_v2 §13–§14, and before you copy any code. The five Batch 1 units are your worked examples: `v2/lichen.js`, `v2/soot.js`, `v2/hawks.js`, `v2/mixer.js` (Equilibrium, id `census`) and `v2/casino.js`, with their logs in this folder.*

Precedence is unchanged: the designer > D6 > D5 > D1–D4 > API_v2 (whose §13–§14 and the code win over its own §§3–9). Line numbers below are as of this commit; search for the name if they have moved.

---

## 0. Ten rules, if you read nothing else

1. **Build a headless `sim` chapter, never Hunt mode.** Hunt chapters have no replay, Freezer, What if? or bot sweep, so they cannot pass D5 §3. All five units are sim chapters; the Wood and the Black Country kept the Hunt *look* on a sim (§1.1). This applies to D5's Hunt-mode specs too (Leaky Tap, Gene Swamping, Bitter Wings).
2. **A run is (seed, level, actions).** Anything from outside the sim (a saved resident, a URL flag, a setting, a measurement of the layout) enters as a *logged action*, never as a read inside `reset` or `step` (§1.6).
3. **Juice from `Sim.run`'s events only.** Never juice the return value of `Sim.act`: the next `Sim.run` hands the same events out again.
4. **A prediction must need a decision.** Start the ghost away from every plausible answer, pass `needMove: true`, score against the expectation, and count an ask only when "no change" would miss (§1.3, §2).
5. **Give each level only the stars it can award, and test the union.** No level may offer all three. Your oracle must also check that no bot's union across the unit reaches three stars (§1.4).
6. **Choose every result text from what happened.** A What if? or Interesting text written in advance will be wrong for some runs, and a reviewer will find the run (§1.5).
7. **Never show the answer during the ask.** No dashed expectation, no V/C rope, no habitat edge, no "h²" row until the reveal (§2).
8. **Design for the phone first.** The strip covers the scene when it opens; the dock holds four buttons at most; the HUD wraps to three lines at 390 px (§2, §4).
9. **Science words are claims.** Every claim gets a `refs` id, every unrealistic number a ×N tag, and every result line is checked against the model's own output in the oracle (§2).
10. **Done means D5 §3 lines 1–13, the D6 playtest script, a review round and a log** (§5).

---

## 1. Patterns that worked (with code references)

### 1.1 A sim chapter with a hunt's look
- The Wood re-implements the bag, egg tray, trunks, ghost jays, search image, untimed looks and the bird's rule inside its sim, and reuses the view pieces: `Rig` (moth, chick), `Pin`, `Predict`, `LiveGraph`, `Fx`, `Ghost`, `Lbl`, `Whisper`, `Live`, `Snd2`, `Freezer`, `Layer`, `Save.res` (`lichen.md`, deviation 1).
- The Black Country keeps `barkTex`, `mothSprite` through `Rig 'moth'`, the fixed virtual 390 × 540 placement and `Det` camouflage (`HuntX.camo`) on a headless sim (`soot.md`, deviation 1).
- Port E6's helpers (fitted search-image `b`, `HuntX.camo`) into your sim rather than calling Hunt. Example: `fitB` at `lichen.js:426`.

### 1.2 The view reads the sim; the sim never reads the view
- `sim.s` is plain JSON; `snapshot()`/`restore()` are the two lines every unit copies (`lichen.js:587`).
- The view keeps its own clocks for flights and banners; when it must hold the story (a phone strip open over the dusk), it calls `Sim.run(this, 0)` until it is ready (`lichen.js:733`). Holding with dt 0 still delivers pending live-action events.

### 1.3 Predictions that need a decision
- **Start off the answer.** The Wood's histogram ghost starts at the axis's left end, its triangle ghost on the band–mottle edge (`lichen.md`, review "What changed most"). Soot starts time asks at the next generation and triangles at a corner (`soot.md`, deviation 10).
- **An untouched ghost is no prediction.** Before this round the Wood sent a logged `void` action from `onCommit` when the ghost had not moved (`lichen.js:755–770`, sim side `lichen.js:355`) and its Lock in whispers "Drag the diamond first." (`lockIn`, `lichen.js:767`). The engine now does this for you: `Predict.ask({needMove: true, onStill, onTimeout})` (API §14.3). In `onTimeout`, send your own `{k: 'void', id}` if your sim waits for an answer.
- **No soft auto-commit at a default.** Census and Casino pass `soft: null` on every ask and let the sim time the ask out with no answer and no lecture (`mixer.js:1165`, `casino.js:902`).
- **Ask only when the answer moves.** Hawks counts a Predict only when the expectation is at least two bands from the value at the ask (`HK_real`, `hawks.js:192`); Soot asks "black share tomorrow?" only when ≥ 8 points of change are due (`soot.md`, deviation 9 and review 34); the Wood counts an L2 ask only when "no change" would miss and the hit lies at least halfway from "no change" to the expectation.
- **Score against the expectation, never the realised run.** Exact chains (Casino's crash-aware bins), deterministic recursions (Soot's dominant-allele recursion), or Monte-Carlo replays. For replays, prefer a **private PRNG** seeded from state (`rng(seed)` from `core.js`), as the Wood does (`replay`, `lichen.js:506`): `R()` and the run stay untouched. Hawks seeds its 200 replays from `R()` after the level has ended (`mc`, `hawks.js:539`); that works only because nothing draws after it.
- **Phones:** the ask expands the strip; fold it as soon as the payoff should play (`Predict.fold()`, or `linger` on the ask; Census folds 250 ms after Lock in, Casino at once, the Wood holds its dusk for 1.5 s on purpose).

### 1.4 Stars and bots
- Stars are pure functions of the final sim state (`stars: {discover(s, n), …}`), read against the expectation for the parameters in force.
- Give each level its own lesson-true star bits and its own "still to earn" line: `content.levelStars[n]` or `End.show(ch, {stars})` (API §14.1). Lichen, Hawks and Casino all built this by hand before.
- For D1's cross-level rules ("Predict on two of three levels") write `ch.unitStars(levelMasks)` (API §14.1). No Batch 1 unit uses it yet; Batch 2 should.
- **Add bots for your own exploits**, not only the five generic ones. The Wood sweeps ten (`lazy`, `centre`, `auto`, `visual`, `idle`), Soot nine (`midpoint`, `copynow`, `marker`), Hawks seven (`doveNoChange`, `hawkNoChange`). Each was written after a reviewer found a fixed strategy that earned stars. Put them in `sim.bots` so `tests/bots.py --bots …` runs them.
- Use fine bot grids (0.01, 5 eggs, 0.1 in a triangle) so rounding is never a lucky answer (`lichen.md`, review D3).
- The oracle should also assert that an expert policy earns every star the unit offers (Census: "an expert earns every star", Casino: "skilled play earns D+P … on every seed").

### 1.5 Words chosen from the run
- Hawks picks each What if? text from the realised end against the thawed point, with an honest alternative for every lever (`wiText`, `hawks.js:601`), and the oracle checks every shown text against its own run (8 plans × 30 seeds).
- Soot chooses `flat_idle`, `flat_ate`, `flat`, `lost_chance`, `lost_ate` from catch rates and the recorded cause of a loss (`soot.js:604–605`).
- The Wood names realised h² only when 0 < R/S ≤ 1; otherwise "Chance swamped the response this time" (`lichen.md`, review S6, Wave 1 G2 #4).
- Dynamic numbers enter through `Txt.f` placeholders; plural helpers avoid "1 chips" (Casino).

### 1.6 Determinism hygiene: outside inputs become logged actions
- **Saved residents.** Soot starts every run from the default wood; a saved Lichen wood enters as a logged `{k: 'lw', w}` action at tick 0 (`soot.js:475`, sent at `soot.js:730`). Seed links, teacher mode, replays and thaws ignore the save, so a shared seed is the same on every machine.
- **Layout measurements.** Soot widens a thin tolerance band to 13 px on a phone through a logged `{k: 'tolfloor'}` action (`soot.js:474`, `soot.js:824`), so a replay scores the same. Bots never send it.
- **Settings.** The Wood turns untimed mode on with a logged `{k: 'unt', on}` action (`lichen.js:363`). Reading `Save.d.ui.unt` inside `step` (as `docs/design/v2_chapter_skeleton.js` still does) makes a replay depend on the replayer's settings: read it in the view and log it.
- **Levels replay alone.** Soot L5 starts canonical rather than from the player's L4 end, and Casino's purse resets each level, so level select, teacher seeds, result codes and the Freezer all work (`soot.md` deviation 7; `casino.md` review "Purse resets").

### 1.7 Investigator levels in the canvas, through `Sim.act`
The DOM `Evidence` widget's purchases are view-level, and its samples would draw `R()` outside the sim. Soot L6 (mark–release–recapture, power meter, Brier-scored verdict against a posterior from the player's own data, `posterior6`, `soot.js:564`) and Census L7 (an in-scene test shelf with a field-day budget) both drew the instruments on the canvas and routed every purchase through `Sim.act`. Do the same until `Evidence` takes an `onBuy` that logs.

### 1.8 A felt cost that grows with evolution
- The Wood charges search time per peck, 0.6 s × the moth's camouflage, so breakfast gets harder as the moths get better hidden (`lichen.md`, review 4). Before that, 350–800 ms per peck fed every morning and 1 s fed none: a cliff, not a slope.
- Casino's croupier reprices the rule you just beat; Census's bait trays cost grain and the card compares your losses with the best fixed bait; Hawks' Discover needs the expected payoff of your own picks, not luck.

### 1.9 Charts, cards and the teacher hook
- Register a missing chart type from your own file, guarded and prefixed: `if (typeof LiveGraph !== 'undefined' && LiveGraph.T && !LiveGraph.T.lw_bars) LiveGraph.T.lw_bars = {…}` (`lichen.js:1339`; also `hk_hist` `hawks.js:1282`, `eq_bars` and `eq_axis` `mixer.js:2162`). Build them from `wgXY`, `wgAxes`, `wgText`, `wgHatch`, `wgDiamond`, and read `T.compact` for the folded strip.
- Debrief charts on cards: realised solid, expected dashed, your call a diamond (Hawks plots "your call" as its own series so its label never collides).
- `resultBits(s, level)` packs 30 bits for assignment links (`lichen.js:673`, `soot.js:708`, `mixer.js:1086`, `casino.js:878`). Document your bit map in a comment.
- `freezeAsk()` and `teacherStep()` make projector mode useful (Casino's unscored "where will it end?" marker; Soot's step to the next dawn, `soot.js:936`).
- The learning layer is rewritten only outside `?v1=1`: `if (!Url.v1) { TAKE.x = …; MODEL.x = …; RECALL.x = …; BRIDGE.x = …; }` at the end of the file (`lichen.js:1385`, `soot.js:1317`, `hawks.js:1306`, `mixer.js:2223`, `casino.js:1612`).

### 1.10 Input
- The tap targets are the actors, not in-canvas buttons (Hawks: tap the rival to fight, yourself to display; the arena is split in two so a near miss still counts).
- Every hold has a tap alternative and a key; Hawks made Space a true hold with a key hook that swallows `e.repeat` plus a keyup listener (`hawks.js:939–950`). Use the engine's `onKeyUp` now (API §14.5).
- A long press that pins must not swallow a peck: the Wood allows `Pin.press` only when `sim.canPin(s)` (`lichen.js:358`, `lichen.js:979`).
- A non-visual path that does not solve the level: the Wood's Auto-hunt defaults to b = 1 and earns the boss Discover only by chance (10 of 40 seeds).

---

## 2. Pitfalls the reviewers caught again and again

Every unit had three reviewers (playtest and art, science, design). These came up in three or more units. Check your build against each before you ask for review.

| Pitfall | Units hit | What fixed it |
|---|---|---|
| **The ghost starts on an answer**, so Lock in (or the soft timer) earns Predict for no input | Lichen, Soot, Census, Casino | Start off every plausible answer; `needMove: true`; `soft: null` or a timeout that scores nothing |
| **"No change" passes the prediction** on a plateau or with weak selection | Lichen, Soot, Hawks | Ask only when the expected change exceeds the band; require the hit to be closer to the expectation than to "no change" |
| **The answer is visible during the ask** (dashed expectation, V/C rope, h² row, habitat edge, scenery that names the cause) | Lichen, Census (L2, L4, L5, L7), Hawks | Reveal ladder: draw expectations only after the commit; neutral scenery; test with a "scene-reader" bot (Census: 0 of 40 solve L7 from pictures) |
| **A fixed strategy earns stars** (always bait everywhere, tap the middle, copy the croupier, a fixed 5-founder bet) | Census L6, Soot L5–L6, Lichen boss, Casino L4, Hawks L1–L4 | A real trade-off (grain, budget, search time); jittered starts; per-level star bits; exploit bots in the sweep |
| **Result text fixed in advance** and wrong for some runs | Lichen ("One hides better"), Soot (`flat`, `stuck`), Hawks (every What if?), Casino ("most letters lost") | Choose the text from the run; the oracle checks each shown text against its own run |
| **Science wording**: "barely moved" (undoes Wave 1 G1), "selection favours the common look", "lichen returns", a phenotype called an allele, causes stated unchecked, realised h² shown above 1 without a caveat | all five | Say what the model did, in its units; ×N tags on every unrealistic number (mutation rate, selection strength, eggs); `contested: true` only for contested *science*, not for criticised *methods* (Soot review 26) |
| **Unit-wide star hints on level cards** naming stars the level cannot give | Lichen, Hawks, Casino | `content.levelStars[n]` or `End.show(ch, {stars})` |
| **The phone strip hides the payoff** (the hatch, the run, the jars) | Lichen, Census, Casino, Soot | Fold the strip on commit (`Predict.fold()`, `linger`); hold the story until it folds; show one chart while folded (`fold: false` on the rest) |
| **Dead time**: unskippable dusks, long fast-forwards, waiting with nothing to do | Lichen, Hawks, Census L6, Casino L1 | ×3 dusk on a tap after the first; 4×–5× fast-forward for settled seasons; "Same bets"; no event bought after a bet (it changes the outcome but not the bet) |
| **Automation where a verb should be** (one tap sorted both copies, a 400-pair spin, the first duel played for you) | Census L0–L2, Hawks L1 | The first five sorted by hand, hopper levers, a pen builder; the first duel of each level waits for ever |
| **Text over budget on a phone**: HUD lines wrapping to three lines, dock labels truncated, five dock buttons | Soot, Census, Casino, Hawks | HUD asks of 7–11 words; dock labels ≤ 2 words, ≤ 4 buttons on a phone; move tests and prices onto the canvas |
| **Colour as identity**: the primary (carmine) button used for one of two choices | Hawks | Both choices wear their data ink with a glyph; neither is primary |
| **Determinism leaks**: the local save shaping a run, a purse carried across levels, settings read inside the sim | Soot, Casino (rejected), skeleton | Logged actions (§1.6) |
| **Lint and budget conflicts**: firstWords allowed 40 words but `HUD.say` warned above 15 (three units cut firstWords to 15); `// cosmetic` silently not exempting | Hawks, Census, Casino | Fixed in the engine and lint this round (API §14.5–14.6) |

Science guard-rails specific to what comes next:
- **Heterozygote advantage lives only in Equilibrium L7** (warfarin-resistant rats, D6 decision 5). Malaria Coast, Out of Africa, Human Variation and the Manhattan Hunt are withdrawn; human examples are limited to uncontroversial medical genetics (haemophilia in a historical pedigree, cystic fibrosis carriers).
- **Notation is D2 §15.** Soot made D2 win over D1 ("C is blue, p, carbonaria"); Census kept A = susceptible, a = resistant so q̂ = s₁/(s₁ + s₂) reads as D6 writes it, and says on screen that dominance belongs to a trait, not a letter.
- **F is named once, in Equilibrium L4** ("F, the inbreeding coefficient"); D5 decision 5 reserves the formal treatment for the Pedigree.
- **Leaky Tap's Discover star** returns load to the mutation line "μ or 2μ", not "μ" (GAME_BIBLE §6).

---

## 3. Engine changes made this round

All are in API_v2 §14; `tests/selftest_b1.js` covers them. In short:

| Change | Asked by | Use it for |
|---|---|---|
| `ch.unitStars(levelMasks)` | Lichen, Hawks, Census, Casino | D1's cross-level star rules |
| `End.show(ch, {stars, bodyFirst})`; `content.levelTake/levelBody/levelWhy/levelStars` read by level | Lichen, Hawks, Casino, Soot | Per-level card words without swapping `content` |
| Why? and What if? panels scroll into view; `Entry.split` keeps decimals | Lichen, Hawks, Casino | — |
| Opening a unit resumes past the furthest level finished | Hawks | — |
| `Freezer.put(…, {force: true})` | Lichen | Freezing a final state |
| `Predict.ask({needMove, onStill, onTimeout, linger})`, `onCommit({moved})`, `Predict.clear(chart)`, `Predict.fold()`, `Predict.opened`; P always focuses | Lichen, Census, Casino, Soot | Predictions that need a decision; charts that change meaning; phones |
| LiveGraph compact mode under 100 px; `spec.fold: false` | all five | A readable folded phone strip |
| `HUD.say(text, num, {first})` allows firstWords 40 words | Hawks, Census, Casino | — |
| Whisper under the HUD's real height; `whisperAt: 'centre'`; `Whisper.drop()` | Lichen, Census, Casino | — |
| `Fx.after(ms, fn)` | Soot | Telegraph-then-act juice on the frame clock |
| `Ghost.show({el})` | Hawks, Casino | Teaching a dock-only action |
| `Hooks.keyup`, `onKeyUp(key, e)`; Escape closes popovers and leaves a v2 level card for the notebook | Hawks, Lichen | Holding a key; a way out of a card |
| Settings card (Untimed, Calm, Readable, Left-handed); `?calm=1`, `?untimed=1` in every build | Lichen, Hawks, Soot, integration | Playtests by the designer and colleagues |
| Lint: exemption regex, census 8-level waiver, per-level keys, unknown keys text-checked | Hawks, Casino, Census, Lichen | — |

The units were updated to the public calls where that was a straight swap: Census and Casino no longer touch `Predict._by`, `_opened` or `_exit`; Lichen, Hawks and Casino no longer swap `content.stars`; Lichen passes `linger: 1500` to keep its tuned dusk; one Lichen sentence was split (the fixed lint now checks `levelWhy`). The skeleton's ask now starts off the answer with `needMove`.

**Still open** (API §14.7): Hunt-mode replay; crowd-tier rigs (moth rest pose, hermit crab, beetle); `Pal.allele` B and I reuse data inks; 5-word banners; a "?" state for `pq`; class tournament and class-pool charts; projector-scaled strip charts; an empty-dock state; act locks from `needs`; the station map; axe-core (not available offline). Work round them in your own file, note it in your log under "Engine requests", and do not edit engine files.

---

## 4. Performance and size

**Frame time** (headless Chromium, 4× CPU throttle, DPR 2 phone at 390 × 780):

| Unit | Before | After | What did it |
|---|---|---|---|
| Lichen | draw 271–541 ms | median 2 ms, p95 4–5 ms | bark textures pre-baked once in `startLevel`, not per frame |
| Census (300–600 beetles) | 216 ms phone, 78 ms desktop | 39 / 24 ms frame (L3), JS draw 2–4 ms | still crowd cached in a `Layer`, about one beetle in seven shuffling each frame, rebuilt at most every 1.2 s; a mini crowd sprite instead of `Rig 'beetle'` |
| Hawks (150 crabs + duel) | — | 3.5 ms median, 6.0 p90 | crowd blitted from baked sprites per look and size (`sprite`, `hawks.js:770`) |
| Soot | — | draw 3–4 ms | bark, haze and vignette in one cached layer |

Rules that follow: bake anything static in `startLevel` (and on resize), never per frame; draw crowds from a cached `Layer` plus ≤ 150 live sprites; `Rig` at crowd size is unreadable for beetles and crabs, so draw a simpler crowd sprite; measure with a 4× throttle before review, not after.

**Size.** The full build is now **784 KB gzip** (2.2 MB raw): the engine-only build was 552 KB, and each unit adds 38–65 KB gzip (Lichen, Soot and Hawks about 120 KB raw each, Casino 150 KB, Equilibrium 215 KB). D5's budget is 700 KB gzip by the end of Wave A and 1.2 MB in full, so **Batch 1 alone has passed the Wave A figure**, and twelve more units at this size would reach about 1.3 MB. Aim for **≤ 90 KB raw (≈ 30 KB gzip) per unit**: no duplicated helpers (use the engine), compact data tables, no dead code from earlier designs. The coordinator has flagged the budget for the designer (lazy-loading units is a Phase 3 PWA option); until it changes, size is part of review.

**Test time.** The monkey takes 4,000–11,000 steps per unit (Census at 1280 × 720 is the slowest). Provide fast modes for heavy oracles (`LW_FAST=1`, `DC_FAST=1`) and keep the full oracle under 20 minutes.

---

## 5. Definition of done

A unit is done when all of this is true, in this order:

1. **D5 §3 lines 1–13 pass**, as amended by D6: line 4 allows 3–6 levels (Equilibrium alone has 8); line 14 is replaced by a **designer-and-colleagues playtest script** in your log (D6 decision 4; no students).
2. **The commands pass** (build to your scratch path with `V2_ONLY='0*,zz_*,<file>.js'`, then once on a full build with every v2 file):
   ```sh
   node --check v2/<file>.js
   node tests/lint_text.js $OUT <id>                       # 0 errors; warnings explained in the log
   node tests/oracle.js $OUT <id>                          # science vs theory, determinism, snapshot, replay, expert policy, unit-wide bot union
   python3 tests/bots.py $OUT <id> --seeds 1-40 [--bots …] # no bot earns three stars in a level; also --untimed
   GAME_HTML=$OUT python3 tests/monkey.py <id> 1,2,3 --vp 390x780,1024x768,1280x720   # every run reaches the end card
   python3 tests/golden.py check $OUT                      # every legacy id you do not replace is ok (yours is skipped)
   python3 tests/golden.py check $OUT --v1                 # 48 ok: ?v1=1 still plays the legacy chapter
   ```
   plus your own `tests/<id>_paths.py` (real clicks, keys, untimed, Calm, teacher, What if?, `?v1=1`) and `tests/<id>_shots.py` (every level and phase at 390 × 780 and 1280 × 720, plus `?cvd=mono` and `?cvd=deut`). **Look at the screenshots** and fix what looks wrong; every Batch 1 log lists 6–10 fixes found that way.
3. **Act-to-juice latency ≤ 200 ms** (Batch 1 measured 20–120 ms through `Events`), frame time as §4.
4. **A review round**: three reviewers (playtest and art, science, design). Answer every issue in a table (issue, verdict, action) in your log; fix blockers and highs; reject with a reason, never silently.
5. **The log** `docs/changes/wave2/<id>.md` has: what you built (a level table with adds, verb, prediction gesture, stars), science claims with references for Coordinator A, deviations from the spec with reasons, engine requests, tests with numbers, screenshots, an instructor note (one page) and the playtest script. Copy the shape of `hawks.md` or `casino.md`.
6. **Nothing else edited.** Only your unit file and your tests (`tests/oracle_<id>.js`, `tests/<id>_*.py`). Never commit; the coordinator does.

---

## 6. How the units connect

### 6.1 Resident hand-offs (`Save.res`)
Only one exists so far. **`'wood'`**: written by the Lichen Wood after its boss (`lichen.js:809`), read by the Black Country (`sootWood`, `soot.js:62`).

| Field | Meaning |
|---|---|
| `N`, `gen`, `seed` | population size, generation reached, the run's seed |
| `freqs[0]`, `freqs[1]` | copy shares of the band allele A and the mottle allele B |
| `tone[0]`, `tone[1]` | mean and SD of shade on the 0 dark – 1 pale scale (the boss looks' shade included) |
| `pins` (≤ 4) | pinned moths, 8 bytes each: byte 0 the A1 A2 B1 B2 bits, bytes 1–4 the four shade loci (both copies summed, × 255); Soot ignores them |

55 bytes with four pins (limit 96). The reader must validate (Soot accepts tone means 0.3–0.98, else the default L3 wood) and must bring it in as a logged action (§1.6). A new resident needs a place id (`Pal.place`), a documented layout in your log and in this table, and a reader that falls back to a default.

### 6.2 Where the units sit (ACT_PLAN, `00_entry.js`)
| Act | Batch 1 | Batch 2–3 units in the same act |
|---|---|---|
| 0 The Wood | `lichen` (Begin drops straight into it while it is unfinished) | — |
| 1 Ancestry and evidence | — | `dig` |
| 2 Heredity | — | `scribe` |
| 3 The gene pool | `census` (Equilibrium, file `mixer.js`) | `royal` (needs `census`) |
| 4 Forces | `soot`, `casino` | `tap`, `swamp` (both need `soot`) |
| 5 Adaptation and coevolution | `hawks` | `bitter`, `jaws` |
| 6 Behaviour and life history | — | `forager` |
| 7 Sex | — | `raffle` |
| 8 Cooperation and conflict | — | `alarm` |
| 9 Genomes and development | — | `switch` |
| 11 Applied evolution | — | `clinic` (needs act 4) |

A rebuilt legacy chapter keeps its id and replaces the old one through `V2.push`; `?v1=1` keeps the old one. A retitle goes in `plan: [title, subtitle]` on your chapter.

### 6.3 Promises other units already make about yours
- **Jaws:** `BRIDGE.hawks` says "In Left Jaw, Right Jaw the rarer fish did better", and Hawks L5's simplex is "the Jaws echo". Keep negative frequency dependence visible in Jaws, or rewrite `BRIDGE.hawks` with the coordinator.
- **Royal Line:** Equilibrium's L2 MODEL card says X-linked genes approach equilibrium slowly, the sexes leapfrogging, and points to The Royal Line. Show the p_f/p_m zigzag and the slow approach.
- **Leaky Tap:** Equilibrium L6 shows a rare recessive lost slowly (Δq = −spq²/(1 − sq²)); Soot shows dominance setting the pace. The Tap's recessive balance √(μ/s) and "load returns to μ or 2μ whatever s" build on both; keep D2 §15 notation.
- **Gene Swamping:** Equilibrium L7's migration case has migrants arriving just after each census and breeding in, so the population fits HW while p moves. Swamping's migration ink, arrows and m values should not contradict it.
- **Castaways:** founders are now Drift Casino L4 (its subtitle is "Bottlenecks and genetic rescue"); `TRANSFER.castaways` was kept so the legacy chapter opens as before.
- **BRIDGE chain so far:** Lichen → Soot ("You were the jay…"), Soot → Casino, Mendel → Equilibrium, Jaws → Hawks. Write your BRIDGE from the unit before yours in the act plan.

---

## 7. Notes for each Batch 2–3 unit

- **Bitter Wings:** a sim with the Hunt look (as Soot). The taste `Ledger` is memory, so its decay is sim state. Models 8 → 2 → 12 must change the expectation the stars read. "A large-effect allele", not "supergene" (GAME_BIBLE §6).
- **Left Jaw, Right Jaw:** keep the Hawks bridge true (§6.3). A twist locus with h² 0.9 (×N) then 0.25 is the Wood's L1/L2 pattern; reuse its "test rule" for Predict.
- **The Forager:** the look-ahead bot must not beat the scored rule (D5 acceptance); write it as a sim bot. One great tit's day is long: plan fast-forwards.
- **The Raffle:** the L2 benchmark is an expectation over the hidden queue; score against it, never the realised queue. A hold-to-pour verb needs a tap alternative.
- **Alarm Call:** `PedigreeView` exists; untimed tagging first. Sherman 1985 figures need Coordinator A's sign-off.
- **The Clinic:** large unit; budget the file size (§4). Plasmid bay and live dosing are view-heavy; keep the PK model in the sim.
- **Switches:** a construction toy; the identity table is the oracle (every grid state). The larva is drawn before the adult.
- **The Scribe:** Luria–Delbrück needs 10⁴-seed oracles: give it a fast mode. `Petri` scenes exist.
- **The Leaky Tap:** D5 says Hunt mode; build a sim (rule 1). Discover is "μ or 2μ".
- **The Royal Line:** haemophilia in a historical pedigree is allowed (D6 decision 5); posteriors must be exact (D5).
- **Gene Swamping:** `DemeMap` and the `deme` chart exist; F_ST ≈ 1/(1 + 4Nm) is the oracle line.
- **The Dig:** `Strata` scenes exist; the log-time boss reads the player's Act 0 generation tick, so it is a resident read: bring it in as a logged action.

---

## 8. Follow-ups for the Batch 1 units (their owners, not Batch 2)

- **Hawks:** adopt `unitStars` for D1's "two of three Predicts" and "both Transfers"; today a random clicker's union reaches three unit stars on 2 of 20 seeds (no single level gives three). The Space hold can move to `onKeyUp`.
- **Lichen:** D1's unit rules (Predict on three of four histograms; Transfer on the triangle plus "What if h² = 0?") can now be written with `unitStars`; `chipsInView` is redundant with the engine's scroll and can go.
- **Census, Casino:** `needMove` can replace `soft: null` plus the sim timeout where the timeout exists only to stop an untouched ghost scoring.
- **Skeleton:** read untimed in the view and log it (§1.6).
- **All five:** Coordinator A has not signed off the science claims; the designer-and-colleagues playtests have not run; axe-core has not run.

---

## 9. Quick reference

```sh
cd /home/user/Endless-forms/games/endless-forms/source
OUT=/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/<you>.html
V2_ONLY='0*,zz_*,<file>.js' python3 build.py $OUT          # never build to the shared default output
node tests/selftest_b1.js                                  # after any engine change (coordinator only)
python3 tests/selftest_integ.py                            # integration smoke (coordinator only)
```
Copy `docs/design/v2_chapter_skeleton.js` for the shape, then take patterns from the Batch 1 unit closest to yours: a hunt (Lichen, Soot), a behaving animal with a lineage (Hawks), an investigator with a budget (Soot L6, Census L3 and L7), a bet on a distribution (Casino).
