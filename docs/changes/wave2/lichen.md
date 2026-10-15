# Wave 2: The Lichen Wood (`lichen`, the template pilot)

Unit agent: senior game developer and evolutionary biologist. Files: `games/endless-forms/source/v2/lichen.js` (`CH_LICHEN_V2`, about 1,250 lines), `tests/oracle_lichen.js`, `tests/lichen_shots.py`, `tests/lichen_smoke.py`. No engine file, legacy file or other unit's file was edited. Nothing was committed.

Specs followed: D6 (binding), D5 §3 (the 14-line checklist) and §4 item 1, D1 §3.1 and §5, D2 §8, §9, §11, §13, §15, D4 §3–§8, API_v2 with §13, `engine_integration.md`.

## What I built

**Role:** the selective environment (a bird with four hungry chicks). **Place:** the Wood. **Per-second verb:** scan the bark and peck a moth. **The minute:** a 12 s morning, then an in-canvas dusk (survivors lay eggs into a tray, a random winter cull, the young fly to their places). **Escalation:** each level adds one variable. **Boss:** apostatic selection keeps three looks alive, which inverts L1's lesson that selection makes one best form.

| Level | Adds | What happens | Prediction (gesture on the live graph) | Stars it can give |
|---|---|---|---|---|
| L0 Too many moths (3 generations) | overproduction | Morning 1: 8 conspicuous moths, a 20 s clock (12 s ÷ 0.6), quota 4. The first tap always lands, and misses cost nothing. 4 survivors lay 300 eggs; the cull leaves 30. Mornings 2–3: 30 moths, quota 15. A ghost hand shows press-and-hold: the pinned moth keeps its look for life (paper halo, then a specimen card), with threads to its young. | Dusk 2, before the cull: drag the line to the number of eggs that will see spring (practice, no star). | Discover: chicks fed on 2 of 3 mornings and a moth pinned. |
| L1 The Lichen Wood (5) | heritable shade | One pale lichen bark (shade 0.85). Polygenic shade, four additive loci, h² = 0.8 set through environmental noise. Moths start at shade 0.30 (35% camouflage). As they get better hidden, breakfast gets harder. | Dusks 1–3: drag the ghost to where the young's mean will land on the dot histogram. After the third, the HUD names R/S as h². | Discover: chicks fed on 4 of 5 mornings and camouflage up ≥ 15 points. Predict: 2 of 3 inside the band. |
| L2 Mixed diets (4) | environmental variance | The same genes, but larval diet adds unheritable variation (h² ≈ 0.3, shown in the HUD). At each hatch every young moth lands beside the leaf it fed on: a paler or darker leaf shifted its shade. | Dusks 1–3: the same gesture. Predictions must shrink to about a third of S. | Discover: chicks fed on 3 of 4 mornings and mean S ≥ 8 points. Predict: 2 of 3 inside the band. |
| L3 Two barks (6, boss) | three looks | 120 moths on four trunks (two birch, two oak). Dark-banded (A_) and pale-mottled (aaB_) are dominant; grey-speckled (aabb) starts at 80%. You hunt one trunk a morning, alternating birch and oak. Search image: the same look again refunds ½ s; a switch costs ¾ s and a refocus veil. At dusk three ghost jays hunt the other trunks with your own rule, fitted as *b*, while their thumbnails show what each takes. | Dusk 3: tap the morph triangle where the wood will be after generation 6. It is scored against 200 replays at your fitted *b*. | Discover: chicks fed on 4 of 6 mornings and all three looks ≥ 10% at the end. Transfer: the triangle inside the band. |

**What if? (the freezer).** Each level card offers levers that thaw the last frozen generation and change one thing.
- L1 and L2 replay the last generation with **No variation** (every moth gets the mean genome, so S = R = 0), **No inheritance** (the young come from the whole generation, eaten or not, so E[R] = 0) or **Eat at random** (your beak lands on a random moth, so E[S] = 0). Each gets an Interesting result. A correct "No inheritance" prediction (the young return to the old mean) earns Transfer: D1's "What if h² = 0?" gesture.
- L3's levers run fourteen generations with the jays on all four trunks: **No search image** (*b* = 1, drift), **Eat the rare** (*b* = 0.5, the common look takes over) and **One hides better** (mottle 40% better hidden, at your *b*: it becomes the commonest, but apostatic hunting keeps the others). You tap the triangle first, and the band shows the expectation from 200 replays.

**Juice (D4 §5.3).**
- *Peck:* a press telegraph (a bird shadow grows for 90 ms from pointerdown), then a beak strike, three dust puffs and a dashed ghost ring. The moth lifts 6 px and fades over 300 ms. "+1" pops on the fed chick, which squashes for 220 ms.
- *Miss:* one puff, a 4 px timer flinch and "−½ s".
- *Morning:* moths flutter in from the edges with beating wings and settle. Each dawn has a warm wash and a "Generation N" banner; each level has a T3 banner.
- *Dusk:* a cool wash; survivors wear a paper ring; dashed arcs carry each mother's batch into the egg tray (20 ms stagger, a cached Layer, "Dot = 2 eggs" above 600); the cull runs in six batches with a frost flash and a "−270" pop; the kept eggs fly up and open into moths.
- *The boss:* "+½ s" and "−¾ s" pops; a "Same look ×N" pill.
- *Numbers:* S and R pop as numbers on the in-scene gauge.
- *Sound:* every sound has a visual twin (peck, miss, dawn, dusk, count, tock, tick, peep).
- *Calm:* fades instead of flights and a static ghost-hand arrow; no shake anywhere, because the bird pays no cost.

**The live graph, in the scene and in the strip.**
- *In the scene (rung 1):* a camouflage gauge from black to the bark's shade. It gets one tick a generation and its marker creeps towards the bark. In the boss it is a patterned share bar with B/M/S swatches.
- *In the strip, L0:* eggs/spring/eaten bars, plus this morning's dot histogram with the pinned moth marked.
- *In the strip, L1–L2:* a dot histogram (eaten hollow, spared solid, young hatched; the S arrow in selection ink, R in ink; the bark marker), plus a mean-camouflage trace (realised solid, expected dashed).
- *In the strip, L3:* the morph simplex with its trail, plus the diet–availability scatter with the diagonal and your fitted curve.
- *End cards:* each carries the level's chart. The boss card shows your call (diamond), the expectation (dashed ring) and the trail.

**Accessibility.**
- *Keyboard:* arrows move a focus ring, Enter or Space pecks, Shift+Enter pins, B toggles the bird's rule, and P or Enter predicts (Lock in on the dock).
- *Untimed mode:* 20 looks a morning; in the boss a switch costs a look.
- *The non-visual path, the bird's rule:* the bird takes the most conspicuous moth above your threshold; in the boss it prefers the common look with strength *b*.
- *Screen readers:* the live region speaks one line a generation, and every chart has a data table behind "Show data".
- *Colour vision:* shade is luminance and the boss looks are pattern plus letter, so the CVD and hue lints pass.

**Persistence (for `soot`).** After L3 the wood is written with `Save.res.put('wood', …)`. Fields: N; gen; seed; `freqs = [p_A, p_B]` (copy shares of the band and mottle alleles); `tone = [mean, sd]` of shade, including the boss looks' designed shade offsets; and up to four pinned moths, packed into 8 bytes each (byte 0 holds the A1 A2 B1 B2 bits; bytes 1–4 hold the four shade loci, both copies summed, ×255). It is 55 bytes with four pins, inside the ≤ 96-byte limit.

**Learning layer (D5 §3 item 12).** Outside `?v1=1`, `TAKE.lichen`, `MODEL.lichen` and `RECALL.lichen` are rewritten to match v2. Lichen has no `BRIDGE` entry and no `TRANSFER` card. The legacy `Hunt.interlude` patch never fires, because the v2 Wood is not a Hunt chapter. Star migration and `Save.d.done` come from `00_entry.js`. Under `?v1=1` the legacy Hunt-mode Wood is untouched (golden `--v1`: 48 ok).

## Science claims, with references (for Coordinator A)

| Claim on screen or in a card | Where | Reference |
|---|---|---|
| Moths lay hundreds of eggs each, and most young die before they breed (overproduction; the cull is chance) | L0 MODEL, ×N tag on "eggs per place" | Majerus 1998, *Melanism: Evolution in Action* (OUP); Darwin 1859, ch. 3 |
| Breeders write R = h²S; h² is the inherited share of the variation | L1 MODEL, Why? maths, HUD "named" line | Lush 1937, *Animal Breeding Plans*; Falconer & Mackay 1996, *Introduction to Quantitative Genetics* |
| Heritability falls as selection and drift use up additive variance (shown per generation) | L1 MODEL, strip stats | Falconer & Mackay 1996; Bulmer 1971, *Am Nat* 105: 201 (to check) |
| A smaller response when much variation is environmental | L2 MODEL, TAKE | Falconer & Mackay 1996 |
| Real peppered moth colour rests mostly on one gene; the black form spread in industrial Britain after 1848 | Why? real; L1 MODEL "In nature" | van't Hof et al. 2016, *Nature* 534: 102; Majerus 1998 (first black specimen, Manchester 1848) |
| Jays form search images | L3 MODEL | Pietrewicz & Kamil 1979, *Science* 204: 1332 |
| Blue jays hunting digital moths kept several looks alive (apostatic selection) | L3 MODEL, Why? real | Bond & Kamil 1998, *Nature* 395: 594; Bond & Kamil 2002, *Nature* 415: 609 |
| Under catch share ∝ dᵢ·aᵢ^b the looks settle where dᵢ·aᵢ^(b−1) is equal, so aᵢ ∝ dᵢ^(−1/(b−1)) | oracle note; "One hides better" | Model result (derivation in the oracle; 0.46 at b = 2 for a 40% better-hidden look, simulated 0.47) |
| "Designed: your rule stands in for every jay in the wood" | L3 MODEL simplification | D5 §2 ruling (ghost jays); open designer question D5 §7.3 |

Nothing in the unit is contested, so no Contested pill is shown. Every MODEL card has `contested: false` and refs ids.

## Deviations from the spec, and why

1. **Not a Hunt-mode chapter.** D5 lists Hunt extensions to reuse. The Wood keeps its own headless `sim` instead (D5 decision 23): Hunt chapters have no replay, Freezer, What if? or bot sweep (`engine_integration.md`, risk 1), and the template pilot has to meet those gates. It reuses `Rig` (moth, chick), `Pin`, `Predict`, `LiveGraph`, `Fx`, `Ghost`, `Lbl`, `Whisper`, `Live`, `Snd2`, `Freezer`, `Layer` and `Save.res`. It re-implements, inside the sim, the bag, the egg tray, the trunks, the ghost jays (E6's fitted-b likelihood, ported), the search image, untimed looks and the bird's rule. A run is (seed, level, actions); the oracle replays one bit for bit.
2. **Prediction tolerance.** D1 gives ±0.5 SD. Measured, that lets "no change" pass in L1 (83% of asks with a soft hunter) and L2. The band is now ±50% of the expected response h²S (floor 1.5 points), so in L1 "the young match the survivors" can pass (h² is high) and "no change" fails, while in L2 both naive answers fail. Measured hit rates: expectation 100%; L2 "young = survivors" 2%; "no change" 8% in L1 and 27% in L2 (it passes only when you selected weakly, so the true response is tiny). What-if bands are ±0.5 SD.
3. **Star mapping.** D1 defines the unit's three stars (Discover in the boss, Predict three of four histograms, Transfer the triangle plus "What if h² = 0?"). The engine ORs per-level masks, so I give each level its own lesson-true bits (table above). As a result no level can give three stars in normal play, and the bot sweep passes by construction; the oracle therefore also reports the unit-wide union per bot (best: D-T, D--, D-T, DP-, DP-, no bot reaches three). See engine request 1.
4. **L0's prediction** is a practice question (eggs that will see spring), with no star, because L0 should not grant the unit's Predict star.
5. **Boss looks also differ in shade** (band −0.13, mottle +0.13, designed; luminance, never hue). D1 says pattern only. At 30 px the stencils alone were hard to read on a phone, and the offsets make "two barks" real: band hides on oak, mottle on birch. The jays' designed mean detectabilities stay within ±10% (1.04, 0.96, 1.00).
6. **"One hides better"** runs at your fitted *b*, so the better-hidden look becomes the commonest but does not take over (the apostatic equilibrium). D1's "takes over, 86% by generation 20" is the *b* = 1 case, and the oracle checks both.
7. **The boss prediction comes at dusk 3** (D1 does not say when), after three mornings have fitted *b*.
8. **Realistic mode** (D2 §11) is not built; this is Field mode only, with the ×N tags.
9. **h² in the HUD:** hidden in L1 until R/S is named after the third prediction; shown in L2.
10. **Extra content keys** (`levelTake`, `levelBody`, `whatifBody`, `live`, `data`) hold the per-level card words, live-region lines and data-table words. The lint checks their spelling and sentences but warns that they are not API_v2 §9.2 keys, so the oracle checks their budgets.

## Engine requests (nothing was edited; local helpers instead)

1. **Unit-level star functions.** Unit stars are the OR of level masks, so an easy level can grant a unit star and D1's cross-level criteria cannot be expressed. Suggest `ch.unitStars(levels) → mask` (or a per-star "which levels count").
2. **A `bars` LiveGraph type.** I registered `LiveGraph.T.lw_bars` from `lichen.js`, using `wgXY`, `wgAxes`, `wgHatch` and `wgText`.
3. **The moth rig's rest silhouette** reads as a dome at 30 px. A delta-wing rest pose with visible antennae would read as a moth (owner of `01_rig.js`; it is shared with `soot`).
4. **Content keys** for level-card TAKE and body per level, What if? bodies, live-region lines and data-table words (lint warnings above).
5. **Whisper placement.** The one-slot whisper sits top-left, over the Wood's chick row. An anchor option (top-centre) would help.
6. **Freezer refuses a finished sim.** A unit that wants to freeze its final state must do it one phase early: the Wood freezes the boss's last hatch.
7. **Not run here:** axe-core, which is not available offline.

## Tests (build: `V2_ONLY='0*,zz_*,lichen.js'`, scratch `wave2/lichen.html`)

All runs used the final build `scratchpad/wave2/lichen_final.html`. It is byte-identical (`cmp`) to a fresh build of the current source.

| Check | Command | Result |
|---|---|---|
| Text and CVD lint | `node tests/lint_text.js BUILD lichen` | 0 errors, 5 warnings (content keys not in API_v2 §9.2, checked as text: `live`, `data`, `whatifBody`, `levelTake`, `levelBody`); lichen.js source clean |
| Oracle, full | `node tests/oracle_lichen.js BUILD` | **49/49** |
| Oracle, fast | `LW_FAST=1 node tests/oracle_lichen.js BUILD` | 49/49 |
| Bot sweep | `python3 tests/bots.py BUILD lichen --seeds 1-20` | PASS: no bot earns 3 stars in any level; the unit-wide union is reported and no bot reaches D+P+T |
| Monkey | `python3 tests/monkey.py lichen 1,2,3 --vp 390x780,1024x768,1280x720` | **9/9** reached the end card; no errors |
| Golden (legacy) | `python3 tests/golden.py check BUILD` | 47 ok, 0 failed, 1 skipped (the replaced chapter) |
| Golden `?v1=1` | `python3 tests/golden.py check BUILD --v1` | 48 ok, 0 failed |
| Smoke | `python3 tests/lichen_smoke.py BUILD` | **28/28** |
| Scripted play | `python3 tests/lichen_shots.py BUILD OUTDIR --vp 390x780,1280x720 --whatif` | all four levels; 3 unit stars; no errors or warnings; about 174 s virtual |
| Performance (4× CPU throttle) | `scratchpad/perf.py` | draw median about 2 ms, p95 4–5 ms, max 9–14 ms (it was 271–541 ms before the bark textures were pre-baked in `startLevel`) |

Oracle highlights:
- **Breeder's equation:** L1 R/S = 0.753 against the S-weighted h² of 0.756. L2: 0.268 against 0.265 (500 seeds each). The bark's share of the shift is ≤ 1%.
- **Boss (game sim):** b = 2 keeps every look in 97/100 runs. b = 1 loses a look in 93/100.
- **Boss (replay model, 400 seeds):** b = 2 keeps every look in 397/400. b = 0.5 loses both rare looks. The 'hidden' lever settles near the equilibrium share of 0.46, and b = 1 takes over. The mean shares at generation 6 are band 0.31, mottle 0.29, speck 0.40.
- **Levers:** novar gives S = R = 0 exactly. noinherit gives E[R] = 0. random gives E[S] = 0.
- **fitB:** recovers the jays' b. Replay is deterministic and draws nothing from R().
- **Prediction hit rates:** h²S scores 1.00. "Young = survivors" scores 0.02 in L2. "No change" scores 0.08 in L1 and 0.29 in L2.
- **Time box:** a competent player takes about 4.5 minutes, inside the 15-minute box.
- **Snapshot:** the resident snapshot is 55 bytes (≤ 96). `v2/soot.js` reads `Save.res.get('wood')` as freqs[0] = A, freqs[1] = B, tone [mean, sd], which matches what `resident()` writes.
- **Budgets:** every line is within the D4 word budgets.

Not run: axe-core (it is not available offline).

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/lichen/`:
- `final/`: every level and phase at 390×780 and 1280×720 (`L<n>_{start,hunt,mid,pin,eggs,cull,ask,ask_moved,hatch,jays,card}`, plus `L1_whatif_*` and `L3_whatif_{start,ask,auto,card}`).
- `calm/`: Calm and untimed (L0, L3; 20 images).
- `cvd/`: normal, mono and deuteranopia for L0–L3 at both viewports (24 images).
- `zoom2.png`: the three barks and the moth looks at 44 px.

I looked at them and fixed what looked wrong:
- jay thumbnails overlapping the egg tray (the jays now get their own 1.6 s before the eggs);
- the jays redrawn as ink silhouettes;
- share labels that overlapped (now swatches plus letters);
- birch too dark and olive (recalibrated to shade 0.81, grey);
- the final card body showing the wrong speck share;
- the specimen card over the gauge;
- the leaves redrawn as leaves;
- one settled frame drawn before each card.

## Instructor note (one page)

**In one line:** students are the bird. The moths they miss breed, and over 18 generations they watch camouflage evolve, measure how much of it is inherited (R = h²S), and then keep three looks alive by hunting the common one.

**Timing:** about 10 minutes for a confident student (a scripted player takes 4.5 minutes of game time), 15 at most. Each level ends on a card that auto-saves.

**Before (2 min):** "If birds eat the moths they can see, what will the next generation look like? Will every moth look the same in the end?"

**During (8 min, a shared seed works):** stop on the L1 card and ask what "R/S" measured. On the L2 card, ask why the young moved so little. In the boss, ask students to say which look they are hunting.

**Discussion prompts (rising Bloom):**
1. Where did the mean camouflage go each generation, and why?
2. One morning your realised h² came out above 1. How can that happen? (A small sample: which survivors happened to breed, and which copies they passed on.)
3. The ghost jays copy your rule. What does that assume about real jays? (A model critique.)

**Misconceptions targeted:**
- individuals change colour (the pinned moth never does);
- selection creates variation (What if? "No variation");
- everything selected is passed on (L2, and What if? "No inheritance");
- selection always yields one best form (the boss).

**Projector:** `?projector=1`, or `?teacher=1` for play/step/speed/seed/freeze. **Deep link:** `?unit=lichen&level=N&seed=S`.

**Playtest script (designer and colleagues, D6 decision 4):** Begin from the title. Note the time to the first tap, whether L1's third prediction lands, whether L2's predictions shrink, and whether you understood why all three looks survived the boss. Mark any moment you wanted to skip.

## Review round (14 October 2026)

Three reviewers (playtest and art, science, design) raised 49 issues. I checked each against the code and, where it was cheap, by measurement. Files touched: `v2/lichen.js`, `tests/oracle_lichen.js`, `tests/lichen_smoke.py`, `tests/lichen_shots.py` and this log. No engine, legacy or other unit file was edited. Nothing was committed. Pre-review copies are in `scratchpad/wave2/*_before_review.*`.

**What changed most.**
- *A prediction needs a decision.* The histogram ghost now starts off the data, at the axis's left end (0%). The triangle ghost starts on the band–mottle edge ("no speck at all"). Neither start can score. Lock in with an unmoved diamond whispers "Drag the diamond first." If the widget's 9 s soft timer (or a second tap on the ghost) commits an unmoved ghost, the view sends a `void` action and the player sees "No prediction: the diamond never moved."
- *Predict comes only from Mixed diets.* In L1 the misconception "the young match the survivors" passes whenever h² > 2/3, so L1's three asks are now practice: they are still scored, revealed and lead to naming R/S. In L2 an ask counts only when "no change" would miss (the test rule). A hit must also lie at least halfway from "no change" to the expectation. Transfer comes from the boss triangle or the "No inheritance" What if?, never from the boss levers.
- *The boss looks differ only in pattern (D1).* The per-look shade offsets (old deviation 5) are gone, and the jays' detectabilities are equal (`LW_D = [1, 1, 1]`). A hunter who eats what stands out now fits b ≈ 1, so conspicuousness is no longer read as frequency dependence. During a streak, the other looks fade by up to 50%: this is the drawn search image (designed, on the MODEL card).
- *Evolution makes the hunt harder.* In L1–L2 each peck costs search time, 0.6 s × the moth's camouflage (`P.find`, designed). Mornings are 14 s, and a morning counts as fed when at least three chicks are fed (80% of the quota). The pace is now a slope, not a cliff.
- *Phones.* After Lock in, the dusk holds (the sim takes no steps) while the strip shows the reveal. The cull or hatch then plays in full view once the strip closes (cap 2.4 s).

### Playtest and art

| # | Issue | Verdict | Action |
|---|---|---|---|
| 1 | High: a press of ≥ 450 ms pins in every level and swallows the peck | Confirmed (code) | `Pin.press` only when `sim.canPin(s)` (L0, mornings 2–3, not a What if?). The sim also refuses `pin` elsewhere. Elsewhere a long press is a peck, and Shift+Enter is a peck too. Smoke: a 700 ms press in L1 eats; a hold in L0 morning 2 pins. |
| 2 | High: the ghost starts on the survivors' mean, so Lock in alone earns Predict | Confirmed (L1 band) | Fixed as above (start at 0%, `void` on unmoved, Lock in asks for a drag, Predict only from L2). Oracle: unmoved commits over L0–L2 give 0 hits and 0 Predict/Transfer stars. Bots `lazy` and `idle` added. |
| 3 | High: the What if? card printed level averages as the replayed generation | Confirmed | The What if? body uses the last record's own S and R, with one line per lever: "R is zero apart from chance" (No inheritance), "both are zero apart from chance" (random), "S and R were both 0" (No variation). Oracle checks it against the record. |
| 4 | High: nothing gets harder as camouflage evolves; a cliff at 1 s a peck | Confirmed (measured: without the cost, 350–800 ms fed 60/60 mornings, 1000 ms fed 0/60) | Search time 0.6 s × camouflage, 14 s mornings in L1–L2, fed at ≥ 3 chicks. Darkest-first in L1: 650 ms eats 15.0 → 14.1 from gen 1 to 5, 800 ms 15.0 → 12.7, 1000 ms 13.0 → 11.2 (fed 70% of mornings). A "chunk" falls off the timer bar on each costly peck. The L1 first-morning HUD says "Hidden moths take longer to find." The value is a scene-lab slider for the designer playtest. |
| 5 | High: on phones the hatch plays behind the open strip | Confirmed (1.5 s close vs 0.9 s hatch) | View-only hold: after a commit on a phone with the strip open, `Sim.run` gets dt 0 until the strip closes; then the cull or hatch plays. Smoke: the hatch waits at t = 0 for 1 s with the strip open, then plays. The specimen card is clamped inside the scene. |
| 6 | High: What if? chips clipped under the sticky buttons at 390 and 360 px | Confirmed | `00_entry.js` is not mine. Workaround in `finish()`: after What if? opens, the chips scroll into view (`scrollIntoView({block: 'center'})`). Smoke at 360×640: every chip lies above the button row. **Engine request 8:** do this in `Entry.show` for every unit. |
| 7 | Medium: the press-and-hold demo never appears | Confirmed (`until` fired at dawn) | `until` is now pins > 0 or phase dusk, ask or over. Smoke: the hold ghost shows in L0 morning 2's hunt. |
| 8 | Medium: the boss card repeats L1's lesson; b is never explained | Confirmed | Boss TAKE is `boss.inverts`. The body says "You took the commonest look {pc}% of the time, when it made up {av}% of its trunk. Taking it more than its share helps the rare looks." b stays in the data table. |
| 9 | Medium: unmet-star hints were unit-wide and named unearnable stars | Confirmed | `content.levelStars[n]` names only the stars each level can give. `finish()` swaps it into `content.stars` while `End.show` builds the card. **Engine request 9:** per-level star hints and reachable stars. |
| 10 | Medium: every Why? opened on the boss jays | Confirmed | `o.why` per level from `content.levelWhy`: overproduction (L0), the peppered moth (L1), breeders and low h² (L2); the boss keeps the jays. Smoke checks L1. |
| 11 | Medium: an unexplained "Strength ×N" pill | Confirmed | It now names its parameter: "Eggs: ×N fewer" (L0), "Selection: ×N stronger" (L1–L2), "Years: ×N faster" (boss and the fast What if? run). It shows only over the tray, between the two tray labels. |
| 12 | Medium: "Bird rule" was the biggest button on the first screen and plays for you | Confirmed | Renamed "Auto-hunt", now a small dashed chip. It is offered from L0's second morning, from L1 on, or at once in untimed or readable mode. B works only when the chip is offered. |
| 13 | Medium: no way to switch on untimed mode | Confirmed (no writer of `ui.unt`) | Partly mine: after two hungry mornings in a level, the dock offers an "Untimed" chip (sim action `unt`, so replays hold). It writes `Save.d.ui.unt`. **Engine request 10:** a settings row (Untimed, Calm, Readable) in the menu or Levels popover. |
| 14 | Medium: "All four chicks fed." covered the nest | Confirmed | The whisper is dropped (the chicks hop and peep, and +1 pops). The "A chick went hungry" whisper is dropped too; the dusk HUD says it instead. |
| 15 | Low: L0's "starved" line talks about hidden moths | Confirmed | L0 uses `starved0`; the boss uses `starved3` (switch costs). |
| 16 | Low: "ghost" and "tap it" copy; the soft timer was silent | Confirmed | "Drag the diamond to where you expect the young to land, then press Lock in." The timer path says "No prediction: the diamond never moved." |
| 17 | Low: label collisions | Partly mine | Fixed: the boss card's "now" label is dropped when "you" is drawn; the −270 pop sits over the eggs; the Eggs count is drawn inside a full bar; the tray labels fade with the tray; the legend says "real". Not mine (LiveGraph and Predict): the diamond over the axis title, the truncated "expected" and the stacked S, R and "you" labels in the collapsed phone strip (**engine request 11**). |
| 18 | Low: the level banner covered the first moths and the ghost ring | Confirmed | Banners sit just under the HUD row; L0's ghost hand starts when the banner has gone (≈ 1.2 s, inside D2's 3 s). |
| 19 | Low: about 55 s of unskippable dusk | Agreed | After a level's first dusk, a tap or Space runs the dusk at ×3 (view-only: the dusk takes no actions). A "Tap: faster" pill shows. |
| 20 | Low: Escape does not close the Levels popover | Not my file | **Engine request 12** (`Cards.close` on Escape). |
| 21 | Low: moths read as domes at 32 px on a phone | Partly mine | Size raised to ≈ 37 px on a 390 px phone (0.095u, 36–50 px). The rest silhouette is `01_rig.js` (engine request 3 stands). |

### Science

| # | Issue | Verdict | Action |
|---|---|---|---|
| S1 | High: fitted b confounds bark conspicuousness with frequency dependence | Confirmed | Option (a): offsets removed, `LW_D` equal, MODEL card adds "The rule b lumps every reason you took a look more than its share." Oracle "visual hunter" (40 seeds): median fitted b 1.00, all looks kept in 30% (it was 0–2 of 40); with an 80% streak, 33% and b 0.92. All three looks share one shade distribution. Keeping all three needs a deliberate common-first hunt (b = 2: 97/100). |
| S2 | High: "One hides better" text fixed whatever happened | Confirmed | Chosen by outcome: `hidden` (all ≥ 10% and the hidden look leads), `hiddenMixed`, `hiddenWon` ("took over… did not take the common look often enough"), or `lost`/`vanished`. |
| S3 | Medium: "favours the common look" reads as selection favouring it | Confirmed | Replaced by the plain-words body above. |
| S4 | Medium: "No search image" was weak selection plus drift | Confirmed | Equal d, so b = 1 is pure drift; text: "The jays ate each look in proportion to its share. Only chance moved the looks." The MODEL card says the looks "hide equally well". |
| S5 | Medium: "random" and "No inheritance" denied drift | Confirmed | "No steady push. The survivors were a fair sample, so the mean moved only by chance." / "…the young came back to about the old average…" |
| S6 | Medium: realised h² named without the Wave 1 caveat (G2 #4, G6 #56) | Confirmed | Named only when 0 < R/S ≤ 1; above 1: "chance added to it this time"; ≤ 0 or S ≈ 0: "Chance swamped the response this time." The true h² stays beside it. |
| S7 | Medium: the undragged start passed, including under No inheritance | Confirmed | Start at 0%; No inheritance tolerance 0.4·\|S\| (floor 1 point) around the old mean, so the survivors' mean always misses. Oracle: 30/30 miss; the old mean lands 30/30. |
| S8 | Low: "Eat the rare… wiped them out" | Confirmed | "Eating the rare looks drove them down, and the commonest look is taking over" when the commonest gained, else `rareNo`. |
| S9 | Low: "One look vanished" at < 10%; the oracle counted dips as loss | Confirmed | `lost` = "fell below 10%"; `vanished` only at 0%. Both name chance as a cause. The oracle reports loss (share 0) separately: b = 2, 0/100 gone by gen 20; b = 1, 77/100. |
| S10 | Low: "small additive effects" with four loci; MODEL.lichen | Confirmed | "four genes of equal, additive effect"; cannot: "Real peppered moth colour, which rests mainly on one gene."; MODEL.lichen "keeps 30". |
| S11 | Low: h² also falls by drift | Confirmed | "…falls as selection and chance use up variation (there is no new mutation)." |
| S12 | Low: "moths you eat: half, birds take far fewer" | Confirmed | Renamed "strength of selection: half eaten (×N; usually much weaker in the wild, peppered moths s about 0.1 to 0.3 a generation)" in L0–L3, refs `haldane1924`, `cook2003`. |
| S13 | Low: "Jays form search images" generalised a blue jay result | Confirmed | "Blue jays form search images"; Why? says "probably because jays look hardest for what they have seen lately"; refs add `bond1999` (Bond & Kamil 1999). No Contested pill. |
| S14 | Low: survivors always lay 300 eggs; units; overwintering | Confirmed | L0 card: "However many survive, they lay 300 eggs between them"; ×N row "eggs per survivor: 20 (75 on the first morning), real hundreds per female"; HUD "Winter. Most young die, whatever you did." |
| S15 | Low: per-generation S and R read as totals; "rose" | Confirmed | "Camouflage went from {c0}% to {c1}%. Each generation your survivors were {s} points better hidden on average; their young kept {r}." S is no longer clamped. |
| S16 | Low: designed search-image costs missing from the card | Confirmed | Added as designed params (½ s quicker, ¾ s slower). |

### Design

| # | Issue | Verdict | Action |
|---|---|---|---|
| D1 | Blocker: L1 Predict for no input | Confirmed | See playtest 2. |
| D2 | Blocker: the trace showed the answer during the ask; L1's table listed h² early | Confirmed | An expected point is pushed only once R is revealed; L1 hides the h² row until it is named. Oracle checks both. |
| D3 | High: a fixed strategy reached D + P + T | Confirmed (the old per-level sweep passed by construction) | Transfer no longer comes from the boss levers. Predict is L2-only with the test and halfway rules. Bots `lazy`, `centre`, `auto`, `visual` and `idle` were added. Bot grids are finer (0.01, 5 eggs, 0.1 in the triangle), so rounding is never a lucky answer. The oracle fails if any bot's unit-wide union reaches D + P + T. Best unions over 20 seeds: alwaysA D-T, alwaysB D--, random D-T, greedy D--, threshold D-T, lazy D--, centre D-T, auto D--, visual D--, idle ---. **Kept:** a centre tap passes the boss triangle for a b ≈ 2 hunter, because the centre *is* the apostatic answer. It fails for b ≤ 1. |
| D4 | High: the boss inverts the lesson only for players who ignore what they see | Confirmed | See S1, plus the drawn search image. Soot's handover checked: the wood's tone mean is now ≈ 0.55, inside `sootWood`'s accepted 0.3–0.98, and soot reads no pins. |
| D5 | Medium: L1 Predict passes the full-inheritance misconception | Confirmed | Predict only from L2 (D1's cross-level rule needs engine request 1). |
| D6 | Medium: Auto-hunt's boss default b = 1.75 solved the boss | Confirmed | Default rule 0.2 (b = 1.0, shown on the slider). Hands-off Auto-hunt earns the boss Discover in 10 of 40 seeds, by chance. |
| D7 | Medium: L0's egg question was a reading test | Confirmed | In the asking generation K is hidden in the HUD ("300 eggs laid."), the tray label and the data table until the reveal. The player has to infer that the wood holds what it held. |
| D8 | Medium: "One hides better" | Confirmed | See S2. |
| D9 | Low: untagged MODEL parameters | Confirmed | Selection strength added to L2 and L3; search-image costs designed; offsets gone. |
| D10 | Low: thin teacher hook | Partly mine | Realised h² (R ÷ S) per generation in the strip after the reveal; `teacher.pools` declares D1's two pools (true vs realised h²; fitted b vs looks kept); `resultBits` gives a 30-bit result code on assignment links (layout in the code comment). The instructor note stays here: `PLAYTEST_GUIDE.md` is not my file (coordinator). |
| D11 | Low: Auto-hunt on the first frame | Confirmed | See playtest 12. |
| D12 | Low: unit-wide star hints; a hatched 95–100% target on the trace | Confirmed | levelStars; the target band is dropped. |

**Superseded in the sections above.** The star table now reads: L1 can give Discover and, via What if? No inheritance, Transfer; L2 can give Discover, Predict and that Transfer; L3 can give Discover and Transfer. Old deviation 2 (the ghost starts on the survivors' mean) and old deviation 5 (shade offsets) are withdrawn. Old deviation 6 still holds ("One hides better" runs at your b), but its text now follows the outcome. A fed morning is ≥ 3 chicks fed. L1–L2 mornings are 14 s.

### Engine requests added (nothing edited)
8. `Entry.show`: scroll the What if? chips into view on open (lichen does it locally).
9. Per-level star hints and per-level reachable stars on the card.
10. A settings row (Untimed, Calm, Readable) in the menu or the Levels popover.
11. LiveGraph and Predict on phones: the axis title under the diamond; short legends in the collapsed strip; S, R and "you" labels that stack.
12. Escape closes the Levels popover (`Cards.close`).
13. `Predict`: a `moved` flag in the `Sim.act` payload, or an option not to commit an unmoved ghost on its soft timer (lichen sends a `void` action from `onCommit` instead).

### Re-run (build `V2_ONLY='0*,zz_*,lichen.js'`, scratch `wave2/lichen_review.html`)

| Check | Result |
|---|---|
| Text and CVD lint | 0 errors, 7 warnings (non-API content keys `live`, `data`, `whatifBody`, `levelStars`, `levelTake`, `levelBody`, `levelWhy`, budget-checked by the oracle); lichen.js source clean |
| Oracle, fast (`LW_FAST=1`) | **75/75** (49 before) |
| Oracle, full | **75/75**. L1 R/S 0.753 vs S-weighted h² 0.756; L2 0.268 vs 0.265 (500 seeds); boss b = 2 keeps every look in 97/100 (game sim) and 393/400 (replay model) |
| Bot sweep, 10 bots × 20 seeds | PASS: no bot earns three stars in a level; no unit-wide union reaches D + P + T |
| Monkey, seeds 1–3 at 390×780 and 1280×720 | **6/6** reached the end card, no errors |
| Smoke | **47/47** (28 before) |
| Golden (legacy) | 47 ok, 0 failed, 1 skipped; `--v1` 48 ok |
| Scripted play with What if? (390×780, 1280×720) | all levels, no errors or warnings; L2 Predict earned by real drags; boss and No inheritance Transfers earned |

Screenshots: `scratchpad/wave2/lichen/review/` (106 images, both viewports, every level and phase, plus `L1_card_whatif_chips_360x640.png` and `L3_streak_fade_390x780.png`). I looked at them. Two collisions remain in the live strip and are engine-owned: "you" over "now" while you drag onto the current point in the triangle, and the collapsed phone strip's labels.
