# Wave 2: Equilibrium (`census`, the one Hardy–Weinberg chapter)

Unit agent: senior game developer and evolutionary biologist. Files: `games/endless-forms/source/v2/mixer.js` (`CH_HWE_V2`, id `census`, about 2,000 lines), `tests/oracle_census.js`, `tests/census_shots.py`, `tests/census_paths.py`. No engine file, legacy file or other unit's file was edited. Nothing was committed. The chapter replaces the legacy Census by id, so saves and `reg()` keep working; `?v1=1` still plays the legacy chapter.

Specs followed: D6 "Spec: the Equilibrium chapter" (binding), D3 §3.1 (Mixer) and §4.3 (Census) for detail, D2 §5, §11, §15, D5 §3 (the 14-line checklist) and §4, D4 §2–§8, API_v2 with §13, `engine_integration.md`. Reused: the old Equilibrium `engine.js` ideas (`hwExp`, the jar effect, the tile collapse, the de Finetti triangle, its beetle via `Rig 'beetle'`), and legacy `ch13.js` (sampling by stratum, newborns against adults, the Wahlund case).

## What I built

**Title** "Equilibrium", subtitle "Hardy–Weinberg and what breaks it" (D6). **Role** investigator (with experimenter levels). **Place** Beetle Isle, with the Lab for the tumbler and a farmyard for L6. **Anchor** the beetle, wearing one allele per wing case (blue A, amber a). The rat is the boss organism for L6 only.

One idea a level, each with a physical per-second verb and a prediction gesture on the live graph:

| L | Name (adds) | Verb and scene | Aha | Prediction (gesture) | Stars it can give |
|---|---|---|---|---|---|
| 0 | Two copies each (allele copies) | 40 beetles roam the beach (they get skittish as you tag). Tap one: its wing cases flip open and both copies fly into the A and a jars (+1 pops, clink). After 12 tags every beetle opens and 80 copies pour into the jars. Then 30 generations of random mating run as a time-lapse while the beetles re-roll their looks. | Half the beetles look blue, yet only 30% of copies are A; blue stays at 51% (Yule's error). | After the first tag: drag p on a bare 0–1 axis (a commit, not scored; shown on the debrief). Yule's bet: drag the blue share at generation 30 (the ghost starts at Yule's 75%; ±0.06). | D: 12 beetles tagged and the time-lapse watched. P: Yule's bet. |
| 1 | The tumbler (random pairing of gametes) | Lab bench: egg and sperm hoppers at p = 0.3, a glass drum, a crank (tap = one half-turn, circle-drag, hold or Spin). Each pair flies egg + sperm into the drum; the zygote drops into its cell of the p × q square. At 40 pairs the four cells slide into three bars (the two Aa cells merge); then a 400-pair spin. | The square is the equation; 2pq has a 2 because Aa forms two ways. | Before cranking: drag the Aa bar (±0.05 of 2pq = 0.42). | D: 400 pairs. P: the Aa bar. What if? "No stirring". |
| 2 | One generation (any starting mix) | A pen of parents: 20 AA + 20 aa; 32/0/8; 40 Aa; then females at p_f 0.9 and males at p_m 0.3 in two hoppers. Crank 100 young per round into a tray. | One round of random mating puts the young on the curve; p stays. Unequal sexes land off the curve (0.27/0.66/0.07) and need a second generation. | Tap the de Finetti triangle where the young will land, each round (the ghost starts at the parents' own point; ±0.06). | D: all rounds. P: 2 of the 3 autosomal taps. T: the unequal-sex tap. |
| 3 | The census (a χ² test) | Drag a quadrat (rope and stakes) over 500 beetles; beetles inside are genotyped at 10 a second and their tokens fly into an in-scene gauge (AA/Aa/aa against dashed expectation, and a χ² bar with the 3.84 line). 30 s of field time per beach. North beach has F = 0.2; south beach is in HW. At the end, the full census genotypes every beetle in a ripple. | Small samples fit almost anything: at n = 40 the north beach usually "fits"; at 300, or in the full census, it does not. | Before the census: drag your verdict on a fits HW–departs axis, for each beach (±0.3 of the truth). | D: ≥ 150 sampled on the north beach (or χ² past 3.84). P: both verdicts. |
| 4 | Close relatives (inbreeding) | The tumbler with a three-position valve: Mix, Families (the drum shows compartments), Like colour. 24 families of four full sibs in burrows, each beetle also carrying an unlinked second gene (pale or dark head spots). Crank couples; their eggs collect in a nursery and hatch into the burrows each generation. Three generations of Families, one of Mix, two of Like colour. The jars (p) stay level. | Inbreeding hides heterozygotes at every gene while p stays put; one generation of mixing removes it. Like-mates-like hides them at the colour gene only. F is named once here. | After generation 1: drag p for two generations on (±0.06). After generation 3, valve back to Mix: drag the Aa bar for the next generation (±0.06 of 2pq). | D: all six generations with a ≥ 20% deficit at generation 3. P: both. |
| 5 | Two demes (population structure) | A beach of dunes and marsh meeting along a wavy line (never drawn). Sample with the quadrat: the pooled sample has a big deficit. Then draw a line to split the sample (or tap two points, or press 1–3): each side gets its own χ² pill, and sampled beetles wear side rings. | The deficit was in your pooling: each deme fits. | The first line drawn is the prediction (scored by how many sampled beetles it sorts by deme, ≥ 85%). Then: "Let the demes mix for one generation: drag the Aa bar" (±0.06 of 2p̄q̄). | D: a split where both sides fit while the pool departs. P: the first line and the mix bar. |
| 6 | The bait-layer (selection on rats) | A farmyard at night. Tap to lay up to four warfarin trays, drag them into the rats' runs. 64 rats run from four burrows to the grain sacks. A susceptible AA rat that eats bait turns back and is gone at dawn; resistant Aa and aa rats shrug it off (pops) and reach the grain. At dawn each aa rat dies of vitamin-K shortage with chance 0.5. Survivors breed (Gen) to 64 newborns. Ten baited seasons, then warfarin is withdrawn for eight. | Newborns sit on the curve; adults show extra heterozygotes. Resistance rises, then stalls at q̂ = s₁/(s₁ + s₂), where s₁ is your own bait reach. Without bait it declines ever more slowly. Felt cost: grain losses climb as resistance spreads. | Season 3, before the survivors show: tap the triangle where tonight's adults will sit (±0.07). After season 4: drag q at season 10 (±0.08). After season 10: drag q after eight seasons without warfarin (±0.06). | D: q passed 0.2 and an adult heterozygote excess. P: the adult triangle and q at season 10. T: the decline. What if? "No vitamin cost", "No warfarin". |
| 7 | Case files, boss (hidden causes) | Five populations, one hidden cause each, in random order: relatives (family clumps), two demes (dunes and marsh, west and east), selection (a nursery patch), drift (a 24-beetle islet), migration (a mainland strip with arriving rafts). Sample with the quadrat, then buy tests from an in-scene instrument shelf with a 12-day budget: By area (1 day), By age (1), Gene two (1), Next year (2). Diagnose on six cause cards with a confidence (50–90%). The case closes with a stamp and the hidden cause drawn. Then a last beach where only looks count. | Fit is not stasis: drift and migration fit HW every year while p moves. | A diagnosis with confidence per case. Carriers: from the amber share, drag the Aa bar (q = √aa, carriers 2pq; ±0.04). | D: ≥ 4 of 5 cases right. P: the carrier estimate. T: drift and migration both right at ≥ 70% confidence. |

**Boss** (`content.boss.inverts`): "A population can fit Hardy–Weinberg and still be evolving." Earlier levels teach that departures reveal causes; the boss inverts it: two of the five cases fit and are evolving.

**Juice** (D4 §5). T1 on every verb within one frame of `Sim.run`'s events: tag (ring, scale burst, two tokens flying 0.5 s into jar slots, +1 pops, click), crank (egg and sperm tokens into the drum, the zygote dropping into its cell with a ring), quadrat (beetle pop, dust, tokens flying into the in-scene gauge), valve (ring, dust, tock), tray (ring, dust), line (ring). T2 per generation or round: the 2pq tile collapse (1.4 s), the census ripple, the nursery hatch, the young landing in the tray, dawn. T3 level banners. Shake only for a cost you pay (a wrong case, no field days left). Every sound has a visual twin; Calm shortens flights and drops the lift.

**The live graph.** In the scene (rung 0–1): jars of tokens (L0), the square and bars (L1), the pen and the tray (L2), the gauge (L3, L5, L7), the jars and the nursery (L4), the side rings and χ² pills (L5), the copies bar (L6), the p-by-year sparkline (L7). In the strip (`notes()`): pq bars, traces with dashed expectations, the HW triangle (parents filled, young hollow; newborns hollow, adults filled; pooled below the curve, sides on it), and a new `eq_bars` chart of observed genotype bars against dashed expectations. Realised solid, expected dashed, your mark a diamond (Predict).

**Learning layer** (outside `?v1=1`): `TAKE.census`, `BRIDGE.census`, `MODEL.census` and `RECALL.census` rewritten; `TRANSFER.census` deleted if present. Star migration and `Save.d.done` come from `00_entry.js`.

**Keyboard and access.** L0 arrows and Enter tag; Space or Enter cranks, S spins, V turns the valve; arrows move the quadrat (Shift ×2.5) and a tap places it; L5 1–3 draw canned lines and two taps make a straight line; L6 Enter lays a tray, arrows move it, N releases the rats, L toggles the genes lens; L7 1–4 buy tests, N diagnoses, 1–6 pick a cause, arrows set confidence, Enter commits. Untimed mode stops field clocks and ask timeouts and makes the rats wait for Release. Every chart has a data table (LiveGraph rows); the live region speaks a line a generation.

## Science claims, with references (for Coordinator A)

| Claim on screen or in a card | Where | Reference |
|---|---|---|
| Random mating gives p², 2pq, q²; a dominant allele keeps its frequency (Hardy's reply to Yule, 1908) | L0, L1 cards, Why? | Hardy 1908, *Science* 28:49; Weinberg 1908; Edwards 2008, *Genetics* 179:1143 |
| Aa forms two ways (egg A × sperm a, and the reverse), so Aa = 2pq | L1 | as above |
| One generation of random mating restores HW for an autosomal gene when the sexes start equal; unequal sexes need two (0.27/0.66/0.07, then HW at 0.6) | L2 | Hartl & Clark, *Principles of Population Genetics*; R7-R4 B8 (0.27/0.66/0.07) |
| X-linked genes approach equilibrium slowly, the sexes leapfrogging | L2 MODEL and Why? (points to The Royal Line) | Jennings 1916; Hartl & Clark |
| χ² for genotype counts with two alleles has 1 df; 3.84 is the 5% line | L3 | Emigh 1980, *Biometrics* 36:627; textbooks |
| Small samples rarely detect a real departure (n = 40, F = 0.2: about 20% power) | L3 | R7-R4 B31; oracle measures 19% |
| HW tests on adults detect only strong selection | L3 Why? | Lewontin & Cockerham 1959, *Evolution* 13:561 |
| Inbreeding: Aa = 2pq(1 − F), p unchanged; brother–sister mating gives F = 0.25, 0.375, 0.5 | L4 | Wright 1921, *Genetics* 6:111; Falconer & Mackay 1996 |
| Mating by a trait changes genotype frequencies only at genes behind it; an unlinked gene stays in HW | L4 | Wright 1921; Crow & Kimura 1970 |
| Pooled demes show a deficit equal to 2Var(p) (Wahlund effect) | L5, L7 | Wahlund 1928, *Hereditas* 11:65 |
| Heterozygote advantage holds both alleles at q̂ = s₁/(s₁ + s₂) | L6 | Fisher 1922; textbooks |
| A rare recessive is lost slowly: Δq = −spq²/(1 − sq²) | L6 | Haldane 1924; textbooks |
| Warfarin resistance in Norway rats comes from VKORC1 changes; resistant homozygotes need much more vitamin K; resistance settled at intermediate frequencies in Welsh populations in the 1970s | L6 Why?, MODEL | Rost et al. 2004, *Nature* 427:537; Pelz et al. 2005, *Genetics* 170:1839; Greaves, Redfern, Ayres & Gill 1977, *Genet. Res.* 30:257; Bishop, Hartley & Partridge 1977, *Heredity* 39:389 (**verify page numbers**) |
| Newborns fit HW while adults depart under viability selection | L6, L7 | textbooks |
| Drift and juvenile migration change p while each generation stays in HW | L7 | textbooks; D6 guard-rail ("drift does not by itself create HW departures in a large sample") |
| q = √aa and carriers 2pq assume HW; cystic fibrosis at 1 in 2,500 births gives q ≈ 1/50 and about 1 in 25 carriers | L7 card, Why? | textbook arithmetic (no population or ancestry named, D6 decision 5) |

Nothing on screen is contested, so no Contested pill is shown. The rat parameters (s₂ = 0.5, 64 rats, start q = 0.05) are designed and tagged; the 18 seasons are ×N ("decades").

## Deviations from the spec, and why

1. **Eight levels** (D6, binding) where D5 §3 and `tests/lint_text.js` allow 3–6: the lint reports one error, "8 levels". Engine request 1.
2. **Not a Hunt chapter.** A headless `sim` for every level (D5 decision 23), so replays, the Freezer, What if? and the bot sweep work. Gen draws the individual matings (L4 families, L6 rats); large populations are sampled with `WF.multinom`.
3. **Rats' notation.** A is the susceptible wild type (first-named), a the resistant copy, so q is resistance and q̂ = s₁/(s₁ + s₂) as D6 writes it. The cost of resistance is recessive (aa only), heterozygotes pay nothing (designed; real heterozygotes need a little extra vitamin K, said in the MODEL card).
4. **s₁ is your own bait reach.** The predictions use the expectation for the parameters in force: your realised mean s₁ so far, not a fixed value. The q question asks for season 10 (a projection) rather than q̂ itself, which the trajectory has not reached by then for weak baiting.
5. **L0's looks-only p is a commit, not scored** (D3); its band is not revealed until the jars fill. Yule's bet carries the Predict star.
6. **L1 asks for one bar (Aa)**, not three (D6 "draw the three genotype bars"): three sequential asks were slow, and 2pq is the idea.
7. **L3's verdict is a confidence on a 0–1 axis**, scored against the truth (within 0.3), not a two-option call (D5 decision 9). The full census then reveals the truth. Two beaches (one departs, one fits).
8. **L4 adds an unlinked second gene** so the contrast between inbreeding (every gene) and like-mates-like (one gene) shows in one chart. The founding families are full sibs of unrelated pairs, so F follows 0.25, 0.375, 0.5.
9. **L5's first drawn line is the scored prediction**; later lines are free. A Predict ask (mixing) was added so the level has one on the live graph.
10. **L7 scores Discover by correct diagnoses** (≥ 4 of 5) rather than D3's Brier ≤ 0.15; the Brier score is recorded per case. The tests are an in-scene shelf, not the DOM `Evidence` widget (its purchases are view-level, and the samples must draw `R()` inside the sim; same reason as soot).
11. **Stars per level**, OR-ed into the unit (as the Wood). Transfer can be earned only in L2, L6 and L7, so the bot sweep passes by construction in the other levels.
12. **What if?** only in L1 (no stirring) and L6 (no vitamin cost, no warfarin). Realistic mode is not built (no ×N parameter except the seasons).

## Engine requests (nothing was edited; local helpers instead)

1. `tests/lint_text.js`: allow D6's eight levels for `census` (today one error).
2. `Predict.clear(chart)`: a committed band stays on its chart index; when a chart changes type (L3's verdict axis back to the χ² trace) it is drawn on the wrong chart. I delete `Predict._by[i]` behind a guard.
3. A bars chart with expected ghosts and a bare 0–1 axis: I registered `LiveGraph.T.eq_bars` and `eq_axis` from `mixer.js`, using `wgXY`, `wgAxes`, `wgText`.
4. `firstWords` may be 40 words in the lint, but `HUD.say` warns above 15 and the monkey fails on that warning, so firstWords is effectively 15.
5. Unit-level star functions (the Wood's request 1).
6. The dock overflows on a phone with five buttons (L7's tests moved to an in-scene shelf).
7. A crowd tier for `Rig 'beetle'` (no legs, no letters): I draw a mini beetle for crowds of 300–600, cached as sprites, with the still crowd in a `Layer`. A shared crowd renderer would help every chapter with big populations.
8. `Evidence` with purchases routed through `Sim.act`.

## Tests

All runs on the build `V2_ONLY='0*,zz_*,mixer.js' python3 build.py /tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/census.html` (final build copied to `census_monkey.html`).

| Test | Command | Result |
|---|---|---|
| Text lint | `node tests/lint_text.js census.html census` | mixer.js source clean; 1 error, "8 levels; a unit has 3–6" (D6 mandates eight; engine request 1); 0 warnings |
| Oracle (science) | `node tests/oracle.js census.html census` | **91 passed, 0 failed** |
| Bot sweep | `python3 tests/bots.py census.html census --seeds 1-20` | **PASS**: no bot earned three stars in any level (table below) |
| Monkey | `python3 tests/monkey.py census 1,2,3 --vp 390x780,1280x720 --html census_monkey.html` | **6 of 6 runs reached the end card** ("Unit complete"), no warnings or errors, no stuck states; 390×780 seeds 1–3: 6,373 / 7,079 / 5,541 steps; 1280×720: 9,731 / 10,023 / 8,545 steps; longest on-screen line 25 words |
| Input paths | `python3 tests/census_paths.py census.html` | **22 ok, 0 failed** (act-to-juice 20–120 ms; keyboard on L0, L1, L3, L6, L7; untimed; Calm; What if?; `?v1=1`) |
| Scripted playthrough | `python3 tests/census_shots.py census.html OUT --vp 390x780 / 1280x720 --whatif` | every level reaches its card with real clicks and drags; no HUD, Lbl, Dock or Whisper warnings, no console errors; CVD passes (`?cvd=deut`, `?cvd=mono`) also clean |
| Golden (other chapters) | `python3 tests/golden.py check` and `--v1` | 47 ok, 1 skipped (census, replaced by v2); `--v1`: 48 ok |

The oracle checks the maths directly (p², 2pq, χ², Fhat, 2Var(p), q̂, Δq, √aa) and then each level's sim against theory: L0 blue share stays at 0.51 over 30 generations; L1 10⁵ pairs give p², 2pq, q² and "no stirring" gives a deficit; L2 0.27/0.66/0.07 then HW with p 0.48; L3 power at n = 40 about 19%, at 300 about 99%, false alarms on the south beach ≤ 8%; L4 H/H₀ follows 0.75, 0.625, 0.5 with p unchanged, the marker gene hides heterozygotes under Families but not under Like colour, one generation of Mix restores HW; L5 the pooled deficit equals 2Var(p) and each deme fits; L6 the game's q tracks the deterministic recursion (mean residual −0.0003), newborns fit while adults show a heterozygote excess, q declines without bait; L7 each cause leaves its fingerprint and the carrier estimate is 0.42; determinism and snapshot/restore; an expert policy earns every star.

```
level                 alwaysA     alwaysB     random      greedy      threshold
0 Two copies each     D-- 1.0     D-- 1.0     DP- 1.1     DP- 2.0     -P- 1.0
1 The tumbler         D-- 1.0     D-- 1.0     DP- 1.2     D-- 1.0     D-- 1.0
2 One generation      D-- 1.0     D-- 1.0     D-- 1.0     DP- 2.0     D-- 1.0
3 The census          D-- 0.3     D-- 0.2     D-- 0.2     DP- 2.0     D-- 0.2
4 Close relatives     --- 0.0     --- 0.0     D-- 0.9     -P- 0.9     D-- 0.9
5 Two demes           D-- 0.3     D-- 0.3     DP- 0.8     D-- 0.6     D-- 0.1
6 The bait-layer      D-- 0.8     --- 0.0     D-T 1.1     D-- 1.0     D-- 0.9
7 Case files          --- 0.0     --- 0.0     -P- 0.1     --- 0.0     -P- 0.1
```

**Frame cost** (headless Chromium, 4× CPU throttle, `scratchpad/wave2/census/perf.py`). The beach levels draw 300–600 beetles. Drawing every beetle every frame cost 78 ms a frame at 1280×720 and 216 ms on a 390×780 phone at 2× pixels (L3). Now about one beetle in seven shuffles on the spot each frame and the rest sit in a cached layer that is rebuilt only when what they show changes (newly sampled beetles draw live until the next rebuild, at most every 1.2 s). L3 is now 24 ms (desktop) and 39 ms (phone) a frame; L5 27 / 44 ms; L7 17 / 29 ms; L0 and L6 stay at 17 ms. JavaScript draw time is 2–4 ms median at 4× throttle.

## Screenshots

All under `/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/census/` (file names `L<level>_<moment>_<viewport>.png`):

- `phone/`: the full scripted run at 390×780 with What if? (every level, every ask and reveal, every card, the L1 and L6 What if? cards).
- `desktop/`: the same at 1280×720.
- `phone7/`, `p357/`, `d357/`: L3, L5, L6 and L7 again after the last fixes, phone and desktop.
- `cvd_deut/` (390×780, L0, L4, L6) and `cvd_mono/` (1280×720, L1, L7).
- Contact sheets: `d_L0.png` … `d_L7.png` (desktop, per level), `p7_L6.png`, `p7_L7.png`, `p357_a.png`, `d357_a.png`, `cvd_a.png`, `cvd_b.png`.

What I fixed after looking: crowd beetles in the field levels and the family burrows (Rig beetles were unreadable at 300+); a taller L2 pen; L1 row labels "sperm A / a"; fewer triangle labels; L6 drawn over the full canvas with bigger rats and at most six waiting at each burrow mouth; L5 side rings only on sampled beetles; L7 tests moved from the dock to an in-scene shelf, the quadrat parked above it; bar-chart labels hidden when they do not fit; on a phone the shelf icons shrink so "Gene two" and "Next year" clear them; in the short strip, group names sit under their bars and percentages and tick labels are dropped (Show data has them); test results ("west χ² 7.0", "newborns χ² 0.3") sit above the shelf; the L7 chart grows its top so a tall Aa bar keeps its label. Under `?cvd=mono` blue and amber stay apart by lightness (L* about 62 against 82) and by the split wing cases; there is no extra pattern channel.

## Instructor note (one page)

**In one line:** students build Hardy–Weinberg from beetles' wing cases, crank it out of a gamete tumbler, test it with a quadrat and χ², break it three ways (relatives, pooled demes, warfarin selection on rats), and finish as detectives who learn that a population can fit Hardy–Weinberg and still be evolving.

**Timing:** about 20 minutes for a confident student (eight levels of 1.5–4 minutes; every level ends on a card that saves). Split it over two sessions after L3 if needed.

**Before (2 min):** "If most beetles on a beach look blue, are most copies of the colour gene blue?" and "Does a dominant allele become more common over time?"

**During (a shared seed works: `?unit=census&level=N&seed=S`):**
- Stop on the L0 card and ask why 50% blue beetles hold only 30% A copies.
- On the L1 card, ask why the Aa bar is 2pq, not pq.
- In L3, ask a pair to stop at 40 beetles and another at 300, then compare χ².
- In L5, freeze (`?teacher=1`, F) after the pooled sample and ask "relatives or structure?" before anyone draws a line.
- In L6, ask why the resistant share stops rising although the farmer keeps baiting.

**Discussion prompts (rising Bloom; `teacher.prompts`):**
1. Why do half the beetles look blue when only 30% of copies are A?
2. A population fits Hardy–Weinberg. Name two forces that could still be acting.
3. Which Hardy–Weinberg assumption is least true for your study species? (model critique)

**Misconceptions targeted:** dominant means common (L0); genotype shares are guessed rather than built from p (L1); it takes many generations to reach HW (L2); a fit proves HW (L3); inbreeding changes allele frequencies (L4); a deficit always means inbreeding (L5); selection shows in newborns, and a resistance gene spreads to fixation (L6); HW fit means no evolution (L7).

**Equations behind Why?:** p², 2pq, q²; χ² with 1 df; Aa = 2pq(1 − F) and the full-sib F series; 2Var(p); q̂ = s₁/(s₁ + s₂); Δq = −spq²/(1 − sq²); q = √aa and carriers 2pq.

**Projector:** `?projector=1`; the triangle in the strip is the class picture (`teacher.pool: 'tri'`). For playtests, `?teacher=1` opens every level in the chooser; without it, a second tap on a locked level jumps to it.

## Designer-and-colleagues playtest script (D6 decision 4)

1. Start from the menu (Act 3, Equilibrium). Note the time to the first tag and whether you guessed p near 0.5 before the jars filled.
2. In L1, say aloud what share will be Aa before cranking. Did the tile collapse make the 2 in 2pq obvious?
3. In L2, did the unequal-sex round surprise you? Could you place the young off the curve?
4. In L3, did you stop sampling early? Did the full census change your verdict?
5. In L4, did the jars staying level while the Aa bar shrank read clearly? Did you notice the second gene?
6. In L5, could you find the hidden edge from your sampled genotypes alone, and did both χ² pills fall below 3.84?
7. In L6, how did it feel when the bait stopped working? Did you predict where q would settle?
8. In L7, which test did you buy first, and why? Did any fitting case fool you?
9. Rate enjoyment 1–5 per level; flag any moment you were idle or wanted to skip.

## Review round (playtest/art, science, design reviewers)

Files touched: `v2/mixer.js`, `tests/oracle_census.js`, `tests/census_paths.py`, `tests/census_shots.py`, this log. No engine, legacy or other unit file. Nothing committed. Where this section and the sections above disagree, this one is current.

### What changed in play (summary)

| L | Before | Now |
|---|---|---|
| 0 | One tap sent both copies to the jars. | Tapping opens a beetle; you sort each copy yourself (drag it to a jar, tap a jar, or keys 1/2; a wrong jar bounces it back). The first five beetles are sorted by hand, then copies pour in. p stays 0.3; every line says "half look blue". During the time-lapse the pill and jars show all 20,000 beetles. |
| 1 | 400-pair spin was pure watching. | Before the 400, `p −` / `p +` (keys [ ]) set the hoppers to any p; the count restarts. The tile collapse takes 1.8 s, holds to 3 s, and ends with the two Aa tiles stacked in the Aa bar under a "×2" tag. |
| 2 | Five canned crank rounds. | Round 2 is your own pen: tap parents to change them (arrows + Enter), then Done. The HW curve is hidden while you predict and until round 1's young land. A 100-parent pen packs 20 × 5 split coins. |
| 3 | Fixed beaches (north departs, south fits), exact counts, verdict scored against the truth. | Each beach departs with chance ½, independently; genotypes drawn beetle by beetle. One 45 s field clock for both beaches (it starts at your first quadrat; the first beach leaves 10 s). The verdict is scored against the posterior chance that the beach departs given your own sample (prior ½), so "can't tell" after 40 beetles is right. The census reports the shortfall, not a χ². |
| 4 | Asked p (read off the bar) and the post-Mix Aa bar with its answer dashed. | Ask 1: the colour Aa bar after two more sib generations, scored on 2pq(1 − F₃). Ask 2: the Aa bar after Mix, dashes hidden. The last two generations are yours: goal "fewer colour heterozygotes, second gene untouched"; only Like colour meets it, and Discover needs it. |
| 5 | Habitat edge painted; beetles' looks gave the demes away; key 3 was the answer. | Neutral sand; unsampled beetles are shapes (genes show once sampled); the hidden edge runs one of four ways, either way round; keys 1–4 draw four directions. The edge is drawn only after mixing. The mixing ask uses a fresh "young" group with no dashes. |
| 6 | Four free trays caught almost every rat; 10 slow seasons; no decision after season 1. | Each tray costs 4 grain a night; a rat that meets bait eats it six times in ten; tap a tray to lift it. Seasons 1–3 at your pace, then the q̂ ask (scored on your own s₁ from seasons 1–3), then seasons 4–10 at 4× with your bait (tap to change it), then the withdrawal at 5×. The card shows your grain lost against the best fixed bait (computed from the recursion). About 80–90 s. |
| 7 | Each cause had its own picture; five distinct causes; 12 days. | One island picture for every case; the census size is a stat ("40 beetles here"); small islands may or may not drift. Drift and migration once each, plus three from relatives, two demes, selection and Nothing (repeats allowed). 8 field days. Two demes now differ a little at gene two too. |

### Issue → action

**Playtest and art**

| Issue | Sev. | Action |
|---|---|---|
| Untouched asks auto-committed at the wrong-answer default ("You backed Yule") | high | Fixed. `soft: null` on every ask; the sim's 30 s timeout scores no answer, cancels the ghost and shows no Interesting text. Oracle: an idle L0 run has no Yule answer and no lecture. Paths: no commit after 12 s. |
| L6 boring, no placement decision, 198 s | high | Fixed (redesign above). Coverage measured: four best trays s₁ 0.61 (was 1.00), one tray 0.24. Baited seasons stay 10 because q̂ needs them to settle, but 4–10 run at 4×: 81 s in the scripted run. |
| Phone sheet hides the payoff; lingers 1.5 s | high | Fixed from the unit: the sheet folds 250 ms after Lock in (`foldSheet`), and the census ripple, the L5 mix and the L0 lapse start 0.35 s later. Paths: sheet closed within 400 ms. Moving the gestures onto the scene is left for a later wave. |
| L2 100-parent pen unreadable | med | Fixed: 20 × 5 split coins (`penSlots`). |
| L5 Finish never unlocked (dock signature) | med | Fixed: the signature uses each level's own gate. Paths: Finish unlocks at 60. |
| Dashed expectation visible before predicting (L2, L4, L5) | med | Fixed: hidden while asking; L2 curve hidden until round 1's young land. |
| L7 scenery names the cause; elimination; budget never bites | med | Fixed (L7 above). Scene-reader policy: 0 of 40 runs solve 4 of 5. |
| L5 habitat cue | med | Fixed (L5 above). A fixed line is right in 11 of 40 seeds. |
| Crank verb has no agency | med | Partly: L2 pen builder and L1 hopper lever; Spin stays. L4 now has the valve goal. |
| L3 exact counts, χ² = 0.0 | med | Fixed: drawn per beetle; a fitting census is redrawn until its shortfall is under 3.5% (χ² ≈ 0.1–0.6), a departing one until it is within 0.04 of its F. |
| L0 lapse pill and jars show the noisy 40 | med | Fixed: the population value ("51% blue overall"); jars from the population's p. |
| HUD wraps to 3 lines at 390 px | low | Shortened L1 crank (11 words), L4 valve (10), L5 deficit (11) and the new lines; whisper anchoring is the engine's `Whisper` (not changed). |
| Strip triangle labels overlap; halo clipped | low | Point labels drop in the folded phone strip; axis asks sit on the axis line (`at` 0.45), clear of the canvas edge; the old adult-triangle mark is cleared after its season. |
| L1 bars clipped at 70% | low | Fixed: the top grows with the tallest bar. |
| L1 collapse too quick, nothing to point at | low | Fixed: 1.8 s collapse, held, "×2" tag on the stacked Aa tiles. |
| What if? "No stirring" starts blank | low | Fixed: the thawed square and bars redraw at once; the lever is off in the thaw. |
| Field clocks run during the demo | low | Fixed: L3 and L5 clocks start at the first quadrat (or after 15 s). |
| L7 Diagnose lock gives no number; islet gate | low | Fixed: "Sample at least {n} beetles"; small islands need 12–16. |
| ?cvd=mono crowd beetles grey-on-grey | low | Fixed: amber wing cases carry a dark dot in crowd sprites (and families). |
| L1/L2 ghost hand late | low | The crank demo now uses its own verb (hold), so it shows on first visit; timing is the engine's Ghost. |
| L4 head spots unnoticed; p drifts | low | HUD "Watch the head spots too"; spots larger; the drift note fires at |Δp| > 0.04 and says "small population". |
| L6 low contrast, ring blobs | low | Lighter yard; at most three dashed rings a burrow, then "×n". |
| Projector triangle small; chooser has no names; no skip | low | Rejected for this unit: the strip and chooser are `ui.js`/engine (engine request 9 below). The playtest note now documents `?teacher=1` and the second-tap jump. |

**Science**

| Issue | Sev. | Action |
|---|---|---|
| Migration case is really a Wahlund mixture | high | Kept D6's boss line (binding) with the timing stated: migrants arrive just after each census and breed in, so no fresh migrant is counted (MODEL L7, body, interesting text "a fit can hide drift, and migrants who have already bred in"); counted with residents they would show a deficit. Newborns now come from next year's p. Oracle: adults and newborns of the migration case both fit. |
| Body: "selection made extra" | high | Fixed: "heterozygote advantage killed homozygotes, so adults had extra heterozygotes"; MODEL L7 says other selection can leave a deficit or none. |
| Gene two identical in both demes | med | Fixed: p 0.35/0.65 at gene two; pooled F ≈ 0.09 (oracle 0.10) against 0.36; vanishes by area; Why? maths says so. |
| L6 recessive cost presented as the rats' history | med | Fixed: MODEL says heterozygotes pay nothing here; Welsh heterozygotes paid about 0.77 (Partridge 1979) and resistance fell within two years; `partridge1979` added; Why? updated. |
| Caption L6 "reshapes adults, not newborns" | med | Fixed as suggested. |
| "χ² above 3.84 means it departs" | med | Fixed: "significant at 5%: 1 in 20 by chance"; stats "evidence of a departure (5% level)"; maths adds the optional-stopping warning. |
| L3 verdict rewards the misconception | med | Fixed: posterior scoring (oracle: 0.63/0.32 after 40, 0.97/0.05 after 300). |
| maths[6] q̂ condition | med | Fixed: "an A copy and an a copy do equally well: p s₁ = q s₂". |
| χ² caveat (expected < 5) dropped | low | Restored in L3 maths. |
| Discover by optional stopping | low | Fixed: a sample of ≥ 150 only. |
| L3 "your sample fitted" fires falsely | low | Fixed: only for a departing beach whose sample χ² < 3.84 and n < 120. |
| "Real tests have little power" | low | Fixed: small samples, and very large ones flag tiny departures. |
| Census reported as χ² | low | Fixed: "Heterozygotes are {f}% short of 2pq" or "match 2pq". |
| Caption L2 missing the equal-sexes condition | low | Fixed. |
| "Inbreeding hides heterozygotes" | low | Fixed: "cuts"; "hidden" kept for carriers. |
| TAKE "every force leaves its fingerprint" | low | Fixed: "A departure points to a cause; a fit rules nothing out." |
| maths[2] individuals' p | low | Fixed. |
| MODEL L1 "without replacement adds noise" | low | Fixed. |
| Teacher prompt "most beetles" | low | Fixed: "half". |
| L6 A/a and dominance | low | One-line note on screen (first shrug whisper) and in the card: dominance belongs to a trait, not a letter. Letters kept so q̂ = s₁/(s₁ + s₂) reads as in D6. |
| p by year unlabelled | low | Fixed: "{n} a year", a ±2 SE band, the whisper "Small samples wobble even when p is still", chart title "p in yearly samples". |
| Yule nuance | low | Added. |
| Sea urchins and bindin | low | Fixed. |

**Design**

| Issue | Sev. | Action |
|---|---|---|
| L3 verdict ignores the evidence | high | Fixed with the reviewer's second option (a proper score against the posterior given your own n and counts), random independent departures and a shared field clock. I kept the verdict axis rather than the χ²-landing drag: the census is now reported as a shortfall (science reviewer), and a χ² landing for a whole census would contradict that. Oracle: "20 beetles, then departs, fits" earns Predict in 0 of 40 seeds (was 20 of 20); a confident call after 40 beetles in 0 of 40. |
| L4/L5 predictions show their answer | high | Fixed (dashes hidden; L5 asks about a fresh young group). Oracle checks the new L4 expectation against the sim. |
| L7 solvable by pictures | high | Fixed; scene-reader in the oracle (0 of 40). |
| L6 dominant strategy; Discover rewards resistance | high | Fixed: no full coverage (burrow mouths 0.60, mid-yard 0.61), a grain trade-off with the best fixed bait shown on the card, Discover = an adult excess seen and q within 0.12 of your own q̂ by season 10. |
| L4 asks do not test inbreeding; scripted valve | med | Fixed (L4 above). |
| L0 automates the sorting | med | Fixed (L0 above); p kept 0.3, "half" throughout. |
| L5 split is read off the screen | med | Fixed (L5 above); HUD is a question. |
| ×N never drawn in play | low | Fixed: an in-scene "×N" chip by the season label; stats say one season is one rat generation. |
| MODEL L7 migration assumption | low | Fixed (above). |
| A/a meaning changes in L6 | low | See the science row. |
| F shown in L3 | low | Fixed: L3 says "shortfall"; F is named once, in the L4 HUD. |
| land4 hard-coded p = 0.6 | low | Fixed: templated. |
| Final card shows the L7 caption, not the unit TAKE | low | Fixed. |
| No resultBits | low | Added: level, stars, ask hits, and per level the key bet (L7: correct diagnoses, summed confidence, carrier bet). |

### Tests after the review

Build: `V2_ONLY='0*,zz_*,mixer.js' python3 build.py …/scratchpad/wave2/census_final.html`.

| Test | Result |
|---|---|
| Text lint | mixer.js clean; the one known error, "8 levels" (D6) |
| Oracle | **119 passed, 0 failed** (new: no auto-commit, sorting, lever, builder, random beaches, per-beetle censuses, posterior after 40 and 300, the two L3 exploits, 2pq(1 − F₃), valve goal, hidden-edge directions and a fixed line, L6 coverage and trade-off, q̂ from your own bait, gene-two F, case draw, small islands, scene-reader, migration timing) |
| Bot sweep (seeds 1–20) | **PASS**, no bot three-stars (table below) |
| Monkey, seeds 1–3 × 390×780 and 1280×720 | **6 of 6 reached the end card**, no warnings; longest on-screen text 24 words |
| Input paths | **36 ok, 0 failed** (adds sorting by tap, drag and keys; no soft commit; the phone sheet folds; lever; builder; L3 clock; L5 Finish and keys 1–4; L6 lift a tray; L7 lock text) |
| Golden (other chapters) | `golden.py check`: 47 ok, 1 skipped (census, replaced by v2); `--v1`: 48 ok (legacy Census untouched) |
| Scripted playthrough, phone and desktop, with What if? | every level reaches its card; no Lbl, Whisper, HUD or Dock warnings; no console errors. Level times (scripted): 19, 25, 44, 47, 22, 21, 81, 251 s |

```
level                 alwaysA     alwaysB     random      greedy      threshold
0 Two copies each     D-- 1.0     D-- 0.9     DP- 1.1     DP- 2.0     -P- 1.0
1 The tumbler         D-- 1.0     D-- 1.0     DP- 1.2     D-- 1.0     D-- 1.0
2 One generation      D-- 1.0     D-- 1.0     D-- 1.0     DP- 2.0     D-- 1.0
3 The census          --- 0.0     -P- 0.1     -P- 0.1     DP- 1.6     -P- 0.2
4 Close relatives     --- 0.0     --- 0.0     D-- 0.2     --- 0.0     --- 0.0
5 Two demes           --- 0.0     D-- 0.3     DP- 0.5     D-- 0.1     DP- 0.7
6 The bait-layer      D-- 0.5     --- 0.0     D-T 1.1     D-- 0.8     D-- 0.6
7 Case files          --- 0.0     --- 0.0     -P- 0.1     --- 0.0     -P- 0.1
```

Screenshots: `scratchpad/wave2/census_rr/phone/` and `…/desktop/` (full scripted runs with What if?), contact sheets `s_L0.png`, `s_L12.png`, `s_L345.png`, `s_L67.png`, `s2_a.png`, `s_d1.png`.

### New engine requests

9. Projector: scale strip charts with the strip; show locked level names in the chooser; a documented playtest unlock flag.
10. `Predict`: a public `fold()` (or a shorter linger) for the phone sheet; this unit sets `Predict._opened` itself.
11. `Whisper`: anchor below the HUD's real height when the HUD wraps.

## Simplification (D6 decisions 9 and 10), 22 October 2026

Eight levels became five: **Two copies each, The tumbler, The census, Close relatives, The bait-layer** (2235 → ~1560 lines). The engine keeps the old sim keys through `EQ_MAP = [0, 1, 3, 4, 6]`, so each kept sim is untouched. `reset` maps the shown level to its key.

**Removed or merged, and why**
- **One generation (old L2) is cut.** The tumbler already shows Hardy–Weinberg proportions arising in one round of random mating. Its "any starting mix" point is now one MODEL line on The tumbler. That line also covers unequal sexes (equilibrium takes two generations) and X-linked genes (pointing to the Royal Line).
- **Two demes (old L5, the Wahlund effect) is cut.** It was a second inference task beside The census. Close relatives keeps the heterozygote-deficit idea (2pqF).
- **Case files (old L7) is cut.** It was a five-case quiz whose skill was reading picture tells. The bait-layer is now the last level and gets the unit card.
- **Prediction interludes:** one is left, the aha on The tumbler, "what share will be Aa?" (2pq). The L0 post-tag ask became a reveal: "Yule bet blue would climb to 75%. Watch." Yule's 75% line stays on screen through the 30-generation lapse. Nothing else on The census asks first. The verdict comes after the full count. The bait-layer's q̂ ask became a reveal: after season 10 the HUD shows `q̂ = s₁/(s₁ + s₂) = {v}: here AA and aa deaths balance` from the player's own bait reach. The game then withdraws the bait automatically for 8 seasons (the slow recessive decline the Leaky Tap lesson promises).
- **Key numbers shown plainly:** `p² + 2pq + q² = 1. Here: {a}% + {b}% + {c}%.` and q̂ as above. The census shows its full n (500).
- **Controls:** the starting-p slider on The tumbler, the levers row, and the pens, split, case and dx tools are gone. Close relatives offers only Mix and Families. The bait-layer offers only tray placement.

**Real biology (D6 decision 10):** the tumbler is now anchored in beetles. A female and a male beetle sit beside the two hoppers and shed gametes into them. Eggs are drawn as cream cells with an allele nucleus, sperm as head and tail. Each turn draws one egg and one sperm, which fuse into a zygote cell on the square and in the nursery. The jars of L0 stay as the readout beside the tagged beetles.

**Stars rebalanced:** Discover on every level. Predict on The tumbler (the het call). Transfer on The bait-layer (q at season 10 within 0.12 of the shown q̂). Expert masks are [1, 3, 1, 1, 5], 7 in the union.

**Tests:** oracle 76 passed. The L6 settle check now uses the steady-baiting greedy bot: mean gap 0.06, while the threshold bot is still approaching at 0.125. There are pure-maths checks for unequal sexes and carriers. census_paths 35 ok (L1 ask, gametes and zygotes present, quadrat, valve, trays). Bots on seeds 1–40: no bot earns three stars. Monkey seeds 1, 2 and 3 at both viewports: all reach the end card with no errors. lint_text and dup_globals are clean. Screenshot fixes: the "% look blue", Yule and gen labels moved to the right, clear of the whisper. Screenshots are in `s3/simp_hawks_census_casino/census/`.

**Cross-unit notes:** the Gene Swamping lesson pointed to Equilibrium L7's migration case, which is now cut, so it should point to its own level instead. The Royal Line still owns X-linkage. The Leaky Tap promise (slow decline of a recessive) is kept by the automatic withdrawal coda.
