# Wave 2: The Leaky Tap (`tap`)

*Unit builder, 21 October 2026. New id `tap` (already in `ACT_PLAN`, Act 4 "Forces", needs `soot`). File `games/endless-forms/source/v2/tap.js` (`CH_TAP_V2`, 83 KB raw, 27 KB gzip). Tests: `tests/oracle_tap.js`, `tests/tap_shots.py`, `tests/tap_paths.py`. Spec: D3 §5.3, D5 §4 item 14, D6 (incl. the 21 Oct addendum), lessons_batch1. Not yet reviewed by the three reviewers or Coordinator A; not committed (the coordinator commits).*

## What I built

**World (D6 decision 7).** A windswept kittiwake cliff at sunset: violet-to-coral sky, low sun, slate sea with a sun path, far headlands speckled with other colonies, a dark slate-violet cliff rim-lit coral, six ledges of mud-cup nests with standing kittiwake parents. The player is a **great black-backed gull** (a real predator of kittiwake chicks), drawn as a dark shadow with a heavy yellow bill and red gonys spot (D4 RC2 rule). Its own nest of two mottled chicks sits on the cliff-top grass with meal pips. On the shore shelf a **rain-fed rock pool is the tap**: a small rain cloud drips new harmful copies in (mutation), a crack leaks the copies your catches remove (selection), and the water level is q. In the recessive levels a dark pocket under the overhang holds the copies hidden in carriers; under the lens it shows in the allele ink. The boss adds a **rusty drum** on the rocks trickling into the pool. Accent `#9A4C7E` (sunset plum). No beetles; blue and amber appear only in the lens's genotype discs, the carrier pocket under the lens and the a-share line (allele read-outs).

**Phenotype without colour.** An unsteady chick (the affected phenotype) stands up and totters at the ledge lip with flapping wing stubs and motion arcs; steady chicks stay hunkered in the cup and only lift their heads now and then (a lure, not a target). CVD-safe by posture and motion.

**Model.** A colony of N = 2,000 chicks a generation as genotype counts (AA, Aa, aa). Each generation: selection (affected chicks die with probability s, binomial), mutation A → a at μ per copy (binomial on A copies), then Wright–Fisher sampling of N chicks at Hardy–Weinberg (multinomial). The gull hunts a stretch of 48 nests drawn from the colony each season; its catch share of the unsteady chicks there is the colony's s ("the other black-backs hunt the rest of the cliff as you do"). Stars and predictions read a deterministic recursion (selection then mutation) run alongside with the same s and μ, never the realised run.

| Level | Adds | Per-second verb | Prediction gesture | Stars offered |
|---|---|---|---|---|
| L1 The drip | mutation against selection (a fully dominant, h = 1) | tap a tottering chick to dive (6 dives a dusk, 4 dusks; the catch resolves when the gull arrives 0.27 s later, so a chick that tucks in is a miss) | drag where q settles (y on the q trace, axis 0–0.25, ghost starts at the top); then 30 generations run at your s; then one dusk at balance | Discover (8 meals, or all there are) + Predict (q̂ ±30%) |
| L2 Hidden copies | recessive (h = 0); the lens shows genotypes and blocks dives | dive; L toggles the lens | drag where q settles (axis 0–0.6) | Discover (4 meals or all there are, and the lens used) + Predict |
| L3 The warden's net | relaxed selection (s = 0) | watch the net lapse; then dive in a two-dusk feast | drag on the generation axis when q will double (kind x, axis 0–60) | Discover (6 feast meals or all there are) + Predict (doubling ±30%) |
| L4 The load (boss) | genetic load; harder hunting; a mutagen | six seasons of 5 generations; dive each season; two more gulls join after season 1; tap the drum (or D) to shut it | after the gulls join: drag where the load settles (per 1,000, axis 0–60) | Discover (drum shut after the gulls join, load ≤ 60% of the starting line) + Transfer (load ±20%) |

`content.boss.inverts`: "Harder selection does not cut the load; only a smaller drip does." The boss's drip varies by seed (μ total 0.014, 0.02 or 0.026, half from rain and half from the drum), so no fixed answer fits every run; L3 opens at the balance of one of three earlier catch rates (q0 0.258, 0.2 or 0.158) for the same reason.

**Unit stars** (`unitStars`): Discover = Discover in two of L1–L3 and the boss; Predict = two of the three predictions; Transfer = the boss gesture. No level offers all three.

**What if?** (Freezer, final state; the sim rewinds to the stored start of the first time-lapse): L1 *Half the catch*, *Real drip* (μ = 10⁻⁵); L2 *Make a dominant*, *Real drip*; L3 *Longer net* (90 generations), *Real drip*; L4 *No extra gulls* (drum shut at generation 10), *Shut drum early* (generation 5). Bodies are filled from the rerun (`whatifBody`), and the oracle checks each lever moves the run the way its body says.

**Juice** (from `Sim.run` events only): dive = T1 + swish and a stooping silhouette with a motion trail; catch = feather burst, +1 pop, ring, wing sound, chick carried to the gull's nest, a leak trickle at the crack; miss = dashed ghost ring at the nest; each generation = rain drops and splashes into the pool, leak drops sized by removals, a tick every second generation; net, lift and the gulls' arrival = banners and T2 rings; drum shut = shake, sparks, T3 ring, crack sound.

**Learning layer** (outside `?v1=1`): `TAKE.tap`, `MODEL.tap`, `RECALL.tap` (load under harder hunting), `BRIDGE.tap` (from the Black Country).

## D5 §3 checklist (as amended by D6)

1. Core verb: role `environment` (the selective agent); tap to dive with feedback in one frame; nothing sets a chick's heritable trait. ✔
2. First seconds: the D6 opening card (game, biology, how; 21, 25, 22 words), then a 14-word first line and the ghost hand on a tottering chick; the first dive on a tottering chick cannot fail (oracle 11). ✔
3. Predict inside play on the live graph in every level, scored by distance against the recursion; `needMove`, ghost starts at the axis end; an ask counts only when "no change" would miss (and a hit must sit nearer the answer than "no change"). ✔
4. Four levels, each adding one variable; bot sweep passes (below). ✔
5. Boss inverts the lesson. ✔
6. Live graph: q trace (realised solid, expected dashed only after the commit) and "Drip against leak" (copies in and out a generation, which meet at balance); boss: load per 1,000 with the drip line and the keeper's goal band shown only after the ask. ✔
7. Juice tiers, Calm path (no wobble/flap/glitter animation, static gull), sounds paired with visuals. ✔
8. Text lint: 0 errors, 0 warnings. ✔
9. MODEL card per level with tagged parameters (μ ×2000 against 10⁻⁴–10⁻⁶ per gene), "Drip ×2000" chip in the scene, refs. Coordinator A sign-off: **not yet**.
10. Teacher hook: seed links, `resultBits`, three prompts (one a model critique), `teacherStep` (faster), pool `trace`. Projector moment: the boss load chart. ✔ (class-pool chart is an engine gap, as for every unit.)
11. Keyboard: arrows move a nest cursor (drawn when the last input was a key), Space dives, L lens, E end dusk, D shut drum, P predict; untimed mode (chicks freeze; spend six dives or End dusk; a 60 s attention cap); live-region lines; `mono` and `deut` shots. axe-core not run (engine gap).
12. Learning layer overwritten; new id, so no legacy TRANSFER or ch99 patch to handle. ✔
13. Monkey 3 seeds × 390×780 and 1280×720: all reach the end card. Golden: see Tests.
14. Replaced by the playtest script below (D6 decision 4).

## Science claims, with references (for Coordinator A)

| Claim (where) | Model check | Reference |
|---|---|---|
| A harmful allele settles where new mutations replace the copies selection removes; q̂ ≈ μ/(h·s) for a dominant or partly dominant allele (L1 take, levelWhy) | oracle 1: within 10% for s 0.2–0.95 (h = 1); within 15% for h = 0.2, 0.5 at μ = 0.002 | Haldane 1935 J. Genet. 31:317; Crow & Kimura 1970 *An Introduction to Population Genetics Theory* |
| A recessive allele settles at q̂ ≈ √(μ/s), far higher, mostly in carriers (L2) | oracle 1, 4: recursion within 10%; the WF colony's long-run mean within 8% | Crow & Kimura 1970 |
| At a real μ of 10⁻⁵ and s = 1 the recessive balance is about 316 times the dominant one (levelWhy L2) | oracle 3 | arithmetic from the above |
| Most harmful mutations are partly recessive (h often 0.1–0.3), so even small h pulls q far below √(μ/s) (L2 MODEL) | — | Agrawal & Whitlock 2011 Genetics 187:553; Simmons & Crow 1977 Annu. Rev. Genet. 11:49 |
| Carriers of a rare recessive condition such as cystic fibrosis far outnumber people who have it (L2 MODEL, "In nature"; D6 decision 5 allows CF carriers) | — | standard medical genetics (2pq ≫ q²) |
| Haldane used this balance to estimate the mutation rate of the haemophilia gene (L1 MODEL, levelWhy; D6 allows haemophilia) | — | Haldane 1935 |
| Without selection q rises by μ(1 − q) a generation; doubling from balance takes roughly q/μ generations: 15 here, about 450 at μ = 10⁻⁵, s = 0.5 (L3) | oracle 3, 5 (450 exactly from the recursion; colony within 0.01 of it after 30 generations) | Lahti et al. 2009 TREE 24:487 (relaxed selection); Crow 1997 PNAS 94:8380 |
| At balance the load (share of chicks lost to the allele) is μ for a recessive and 2μ for a dominant, whatever s (boss, take, why) | oracle 2: per 1,000 at μ = 0.02: dominant 39.6–41.5, recessive 20.0, for s 0.2–0.95 | Haldane 1937 Am. Nat. 71:337; Muller 1950 Am. J. Hum. Genet. 2:111 |
| Harder hunting spikes the load, which returns to the drip line; halving μ halves it (boss) | oracle 6, for all three boss drips | follows from the above |
| Herring gulls nesting near steel mills had raised germline (minisatellite) mutation rates (boss MODEL, "In nature") | — | Yauk & Quinn 1996 PNAS 93:12137 |
| Great black-backed gulls take kittiwake chicks (the world) | — | general seabird ecology; Coordinator A to confirm or swap for a cited source |

Parameters tagged on the MODEL cards: μ 0.02 ×2000 (real 10⁻⁴ to 10⁻⁶ per gene); boss μ 0.014–0.026 ×N; colony 2,000 designed; s = your catch rate, designed by play; h 1 and 0 designed (real h often 0.1–0.3); net 30 generations designed; the drum's share and the two extra gulls designed. The boss's "load per 1,000" is the expected share for the current q and s (the meter) with the realised deaths as the trace.

**Wording rules kept:** never "the chicks need", "evolve" for individuals, or "selection wants"; the allele, not the chick, is selected; "a harmful allele, a" with "dominance belongs to the trait" handled by stating h in each level.

## Deviations from the spec, and why

| Spec (D3 §5.3 / D5) | Built | Why |
|---|---|---|
| Hunt mode | headless sim with a hunt's look | lessons rule 1: replay, Freezer, What if? and bots need a sim |
| Beetle Isle beetles; gull as the predator of beetles | kittiwake cliff; black-backed gull hunting kittiwake chicks | D6 addendum decision 7: each chapter its own world; beetles belong to Equilibrium; the task brief names a gull colony at sunset |
| "Slow, soft-shelled beetles before they burrow"; 10 dives a dusk, 12 s | unsteady chicks tottering at the ledge lip; 6 dives a dusk, 12 s (8 s in the boss), catch resolved on arrival | same mechanic in the new world; 6 dives keeps s between about 0.4 and 0.95 instead of always 1 |
| μ 2 × 10⁻³ ×200, N 400 | μ 0.02 ×2000, N 2,000 | at 2 × 10⁻³ a dominant balance is 3 copies on a 48-nest stretch (nothing to hunt) and drift swamps the balance; both tagged |
| Achondroplasia Transfer gesture | dropped | D6 decision 5 limits human examples to haemophilia and CF carriers; Transfer is the boss load gesture |
| Load "returns to μ or 2μ" in the boss | boss is recessive (μ line); the 2μ dominant case is in the take, the Why maths and the oracle | one allele per boss keeps the chart readable; lessons §2 asks only that Discover allow "μ or 2μ" |
| Realistic mode on the projector | the "Real drip" What if? in L1–L3 | Realistic mode is not an engine setting yet; the levers give the same textbook numbers |
| Predict q̂ ±30% "against μ/(hs) and √(μ/s)" | scored against the exact recursion's fixed point (within 3% of the formulas at these values) | lessons: score against the model in force |
| Untimed: "beetles pause at their burrows" | chicks freeze in their dusk-start posture; 6 dive tokens or End dusk; 60 s cap | same logic; the cap keeps untimed bots from stalling |
| Prediction asked after the colony responds | the ask comes at the end of the season, before the colony's first generation | otherwise a perfect hunter's dominant colony is already at balance and "a bit lower than now" passes |

## Engine requests (nothing edited)

- A `gull` rig (kittiwake adult and chick, a predatory gull silhouette) for later seabird units; drawn locally here.
- Realistic mode as a setting that units read through a logged action.
- A class-pool chart and axe-core (as for every unit).

## Tests (build: `V2_ONLY='0*,zz_*,tap.js' python3 build.py <scratch>/tap.html`)

- `node --check v2/tap.js`: clean.
- `node tests/lint_text.js $OUT tap`: 0 errors, 0 warnings.
- `node tests/oracle.js $OUT tap`: **53 passed, 0 failed** (balances, loads, real-μ values, WF colony against the recursion, drip = leak at balance, relaxed selection and doubling, boss spike/return/halving for all three drips, determinism, replay of every level, snapshot round trip (7 KB), expert earns every offered star in ≥ 80% of seeds, no level offers three, no bot union reaches three unit stars, "no change" never earns Predict, a non-diving gull cannot earn Predict, first dive cannot fail, untimed ends, lens blocks dives, every What if? lever, the intro card). `TP_FAST=1` for a quick run.
- `python3 tests/bots.py $OUT tap --seeds 1-20 --bots alwaysA,alwaysB,random,greedy,threshold,lensAlways,line,halfNow,expert`: PASS. Best masks: alwaysA/alwaysB/lensAlways nothing in L1–L3; random at most one star per level by luck; greedy and threshold D only (threshold, line and halfNow get D in the boss by shutting the drum after the gulls); line and halfNow earn Predict in L3 on some seeds (the "q ÷ μ" rule of thumb is the lesson); expert DP, DP, DP, DT. `--untimed --seeds 1-10`: PASS.
- `GAME_HTML=$OUT python3 tests/monkey.py tap 1,2,3 --vp 390x780,1280x720`: **6 of 6 runs reach the end card**, no errors, no NaN text.
- `python3 tests/tap_paths.py`: 11 ok (opening card; a real canvas tap catches; arrows; L blocks Space; E; D; `?untimed=1` freezes chicks; Calm at 1280×720 to the card; What if? card reports its own numbers; `?v1=1` has no tap).
- `python3 tests/golden.py check $OUT`: **48 ok**; `--v1`: **48 ok**.
- Final build: monkey 6 of 6 again after the last edits; oracle (fast) 53 of 53; lint clean.

## Screenshots

`tests/tap_shots.py` (expert policy, real drags on the strip) at 390×780 and 1280×720, plus `?cvd=deut` and `?cvd=mono` of L2's lens, into the session scratchpad `tap/`. Fixes made after looking:
1. Guano streaks drawn as wide bars read as poles: now thin, short, faint streaks; vertical fissures added to the cliff face.
2. The rain cloud and its labels sat on the lowest ledge: the shore band is now reserved (≥ 86 px on a phone), cloud, pool and labels inside it.
3. Kittiwake parents lying flat read as extra chicks: redrawn standing, one nest in four, behind the cup.
4. Chicks too small to tap on a phone: radius raised to 0.3 of the nest pitch (12 px at 390 wide).
5. The pool looked like an empty pit at balance: a per-level scale puts each balance mid-pool (L1 opens brimming), lighter water, a sun-lit rim.
6. "Drip against leak" was dwarfed by the first generation's purge: fixed y range of four times the drip; the first spike runs off the top.
7. The level banner hid under the whisper and the generation label: banner moved onto the upper cliff; the canvas generation label dropped (the bar shows it).
8. The boss shots showed the drum shut the moment the gulls arrived (the expert policy), so the spike-and-return never showed: the expert now waits a season.
9. HUD showed "fed 7/0" in the boss: the meal counter shows only when a season has a quota.
10. The four-line first HUD line on a phone: cut to 14 words.

## Instructor note (one page)

**What students do.** They are a great black-backed gull. Each dusk they dive on kittiwake chicks that totter at the ledge edge (the harmful phenotype); their catch share becomes the colony's selection coefficient s. A rain-fed rock pool shows the allele's share: rain drips new copies in (mutation), the crack leaks the copies removed (selection).

**The four ideas.** (1) A harmful dominant allele settles at q̂ ≈ μ/(hs); at balance the copies removed equal the copies dripped in. (2) The same allele, recessive, settles near √(μ/s), far higher, because most copies sit in carriers selection cannot see (the lens shows them, and blocks diving). (3) Relaxed selection raises q only by about μ a generation: the game's ×2000 drip doubles it in about 15 generations; a real drip would take about 450. (4) The boss: two more gulls hunt, the load spikes and comes back to the same line, μ; only shutting a mutagen drum that doubles the drip halves it (Haldane–Muller).

**Exaggerations.** μ is ×2000 so balances are visible on 48 nests; the colony is 2,000; dominance is all-or-none; one gene, one predator. Each MODEL card says so.

**Discussion prompts.** (1) Why does a recessive harmful allele settle at a higher frequency than a dominant one? (2) Medicine lets people with a recessive condition have children. How fast does that raise the allele's frequency? (3) Model critique: this model has one gene and one predator. What would many harmful genes, each with its own drip, change?

**Projector.** Play the boss with the class predicting the load before the gulls arrive; the realised load returning to the drip line is the moment.

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open *The Leaky Tap* from the menu (Act 4). Read the card (≈ 70 words). Do you know what to tap before the ghost hand shows you?
2. L1: hunt four dusks. Did the misses (chick tucked in before you arrived) feel fair? Predict where q settles. Was your prediction a guess or a calculation?
3. Watch the pool drain and the two lines on "Drip against leak" meet. Then dive once more at balance: did the scarcity of meals land?
4. L2: try the lens. Did "carriers you cannot see" come across, and did losing dive time make you think before using it?
5. L3: predict the doubling time. Then the net lifts: was the feast fun, and did the purge read?
6. L4: when the gulls join, predict the load. Did the return to the line surprise you? How long before you looked for another way to lower the load? Was the drum findable without the hint?
7. Rate enjoyment 1–5 and name the most boring 20 seconds. Did anything look like a beetle chapter?

- Frame cost (headless Chromium, 4× CPU throttle, L2 with the lens on, 48 genotype discs): draw median 9.1 ms (390×780 at DPR 2) and 9.5 ms (1280×720); the static sky, sea, cliff, ledges and cups are baked once per size. A change in the HUD's wrapped height re-bakes the background once (about 100 ms at 4× throttle); quantising that key is a small follow-up.
- Full build with every v2 file present today: `tap` registers and the monkey reaches the end card (seed 4).

## Still open

- The three-reviewer round and Coordinator A's sign-off of the claims table.
- A cited source for black-backed gulls taking kittiwake chicks (the world's premise).
- Designer-and-colleagues playtest (script above).
