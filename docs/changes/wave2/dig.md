# The Dig (`dig`, new): build log

*Wave 2, Batch 3 unit. File `games/endless-forms/source/v2/dig.js` (`CH_DIG_V2`), tests `tests/oracle_dig.js` and `tests/dig_shots.py`. Spec: D3 §5.6, D5 §4 item 17, D6 (with the 21 October addendum). Built 21 October 2026. Not yet reviewed (playtest/art, science, design) and not gated; not committed.*

## 1. What was built

**World (D6 addendum 7).** A seaside cliff at golden hour: chalk over ochre sandstone, slate shale and a pale ash bed, with the sun low over a slate sea. The palette is chalk white, ochre, slate and ammonite rust; the chrome accent is rust `#9C4A2C` (CIEDE2000 ≥ 9 from every data ink; the nearest is `sel`). No beetles. Blue and amber appear nowhere. The opening card supplies `content.intro = {game, biology, how}`.

**Roles.** In L0 the player is the flood that makes the record (environment). From L1 they are a palaeontologist with a hammer, a laser and a brush (investigator). `role: 'investigator'`.

| L | Name | Adds (one variable) | Per-second verb | Prediction gesture | Stars offered |
|---|---|---|---|---|---|
| 0 | The flood | burial | hold to pour mud on a Devonian sea floor; mud is short (1.6 s an epoch); a still, oxygen-free epoch arrives at random | drag the share of all 48 animals the cliff will keep (±0.035; must beat "everything buried keeps") | D (Lagerstätte: 2 soft bodies buried in still water and 16 animals in all), P |
| 1 | The clock | radioactive decay | hold (or the Run fast toggle) to run time over a 64-atom U-235 zircon; then tap or sweep ash-zircon atoms to test them, and Date it | (a) at one half-life, when will 16 atoms be left (conditional expectation, ±150 Myr; must beat linear); (b) read the ash's age off the decay curve (±12%; must beat a linear reading) | P |
| 2 | Bracket the fish | atoms counted | tap each ash bed with the hammer, then sweep the laser over 40-atom spots on two zircons; 70 spots in all | at 400 atoms on a zircon, drag the error bar four times the atoms would give (expect half; must beat a quarter and no change) | D (both dates tight: 2(σ_up + σ_lo) at the true ages ≤ 82 Myr, ≥ 10 spots each), P |
| 3 | Where to dig | a predicted in-between form | tap an outcrop on the field map, then brush the dig square; five seasons | after season 1: drag the age of in-between forms, given finned fish at 385 and four legs at 365 (±4 Myr; must beat both 385 and 365) | D (two seasons in 375-Myr river rock), P |
| 4 | Deep time (boss) | a log time scale | drag eight cards (zircon 4.4 Gyr … H. naledi) onto a log ribbon from Earth's formation to now; your Lichen Wood's years show as a tick | drag the halfway point of Earth's history (2.27 Gyr; ±0.12 log units; must beat the ribbon's visual middle) | T (7 of 8 within half a log step), P |

**Boss inversion** (`content.boss.inverts`): "Fossils in order are no ladder: several human relatives lived at once." After the halfway ask the ribbon opens a hominin span chart (Lucy's species, H. erectus, Neanderthals, H. naledi, H. sapiens, H. floresiensis): at 300 kyr at least four lineages overlap. The halfway ask is the second inversion: the visual middle of a log ribbon is about 200,000 years ago.

**Unit stars** (`unitStars`): Discover = L0 D and L3 D (D3: "a Lagerstätte; found the intermediate"); Predict = P in three of five levels; Transfer = L4 T.

**Code shape.** Headless `sim` with plain-JSON state, `R()` only, `Det` maths, `WF.binom` for spots; all words in `DG_TEXT`; juice only from `Sim.run` events; `Freezer`/What if? on L0 (levers: all still water, no erosion; body text filled from the rerun); `resultBits` documented; ghost hand on each level's first verb (hold, hold, tap then sweep, tap then sweep, drag); keyboard (Space hold/pour, arrows move mud or the ribbon cursor or the outcrop, Enter settle/date/done/place, 1/2 laser ×8, T test 8, F fast); untimed mode (a logged `unt` action) removes the epoch, ash, laser, pick, card and ask timers. Chart type `dg_xy` registered from the unit (bars, range rows, steps, dashed expectations, reversed and log x).

**Resident read (lessons §7).** L4 reads `Save.res.get('wood').gen` in the view and enters it as a logged `{k: 'wood', gen}` action (skipped for seed links, teacher mode, replays and thaws). Default 12 years.

## 2. Science claims and references (for Coordinator A)

| Claim (where) | Reference id | Notes |
|---|---|---|
| Hard parts buried fast keep far more often; soft tissue rots in days to weeks (L0, MODEL, why) | briggs2003 | Briggs D.E.G. 2003, *Annu. Rev. Earth Planet. Sci.* 31:275. D3 integrator fix honoured: "far more often", never "only". |
| Lagerstätten keep soft bodies where burial was fast and oxygen scarce; Hunsrück Slate (Devonian) | seilacher1985, bartels1998 | Seilacher, Reif & Westphal 1985 *Phil. Trans. R. Soc. B* 311:5; Bartels, Briggs & Brassel 1998 *The Fossils of the Hunsrück Slate*. |
| Keeping chances 50% shell, 35% bone, 2% soft (40% in still water) | — | Tagged ×N in MODEL: real chances are far lower for nearly every body. |
| Layer survives erosion 75% | — | designed. |
| U-235 half-life 704 Myr (703.8) | jaffey1971 | Jaffey et al. 1971 *Phys. Rev. C* 4:1889. U-238 4.468 Gyr is named in MODEL "cannot". |
| Zircon takes in uranium but almost no lead; lead today is radiogenic | schoene2014 | Schoene 2014, *Treatise on Geochemistry* 4.10. Simplification stated: one-step decay, no initial lead, no lead loss. |
| Counting error: SE of the lead share √(f(1−f)/n); four times the atoms halves the bar | schoene2014 | Oracle checks bias < 1% and 2SE coverage ≈ 95%. Atoms per spot (40) and per crystal (64) tagged ×N. |
| Superposition (Steno 1669); modern ash-bed zircon dates near 0.1% precision | steno1669, schoene2014 | |
| Finned fish (Panderichthys) near 385 Myr, early tetrapods near 365 Myr, Tiktaalik in 375-Myr river rock on Ellesmere Island, found 2004 after four seasons | daeschler2006, shubin2006 | Daeschler, Shubin & Jenkins 2006 *Nature* 440:757; Shubin, Daeschler & Jenkins 2006 *Nature* 440:764. "In-between form", never "missing link". Find chance 50% a season tagged ×N. |
| Earth 4.54 Gyr; Patterson 1956 | dalrymple2001, patterson1956 | Dalrymple 2001 *Geol. Soc. Lond. Spec. Publ.* 190:205. |
| Oldest zircon 4.4 Gyr (Jack Hills) | wilde2001 | Wilde et al. 2001 *Nature* 409:175 (card and why text). |
| First trilobites ≈ 521 Myr | hollingsworth2008 | card only. |
| End-Cretaceous impact 66 Myr | renne2013 | card only. |
| Whale with ankles ≈ 47 Myr | gingerich2001 | Gingerich et al. 2001 *Science* 293:2239. |
| Lucy 3.2 Myr; A. afarensis ≈ 3.9–2.9 Myr | johanson1979, kimbel2004 | card and span chart. |
| H. naledi 335–236 kyr | dirks2017 | Dirks et al. 2017 *eLife* 6:e24231. |
| Early H. sapiens, Jebel Irhoud, ≈ 315 kyr | hublin2017, richter2017 | Hublin et al. 2017 *Nature* 546:289; Richter et al. 2017 *Nature* 546:293. |
| Spans: H. erectus ≈ 1.9 Myr–110 kyr; Neanderthal lineage ≈ 430–40 kyr; H. floresiensis ≈ 100–50 kyr | rizal2020, arsuaga2014, higham2014, sutikna2016 | span chart; "spans that overlap say who lived at once, not ancestry" (MODEL). Coordinator: please confirm these rounded spans. |

Agency rules: no "evolve/choose/need" for individuals; "selection", "keeps", "decays". The Devonian sea uses "ammonoid" (true ammonites are later); the composite cliff is labelled a designed section.

## 3. Deviations from the spec, with reasons

1. **Five levels, not D3's four.** D3's "Clocks in ash" carried two ideas (decay, then dating error and bracketing). D5 §3 line 4 wants one variable a level, so L1 is decay and L2 is atoms counted (with superposition bracketing the fish).
2. **L0 predicts the share of individuals, not of species.** With 6 kinds a species share is nearly constant (shells always appear), so it needed no decision. Individuals depend on the player's burials; ±0.035 (D3 suggested ±0.15, which a constant 0.15 would always pass).
3. **Erosion is automatic** (D3: "drag to erode"). One verb per level; erosion is the sea's job, not the player's.
4. **U-235, not U-238, is the visible clock.** At 380 Myr U-238 has decayed only 6%, too little to see in 64 atoms; U-235 (704 Myr) gives 30–50%. Both are U–Pb clocks in zircon; MODEL says so.
5. **Atoms per spot and crystal are ×N.** Real analyses count millions; the error bars here are counting error only.
6. **Decision tests on the readings.** L1b and L2's asks have visible tools (the decay law, the 1,600-atom line). The decision is the reading itself (exponential, not linear; √n, not n); each must beat the named wrong rule.
7. **Stars are luck-free.** L0 D counts burials, L2 D uses error bars at the true ages, L3 D counts seasons in the right rock (a find is still random, as in nature).
8. **Size.** 128.6 KB raw, 38.1 KB gzip: above the 90 KB target in lessons §4 (each level draws its own scene). Candidate cuts for review: the `dg_xy` data-table rows, the golden-scene painter shared with L4.

## 4. Engine requests

None blocking. Noted: `Fx.pop` labels from two burials in the same 150 ms overlap; a merge offset would help. A Predict `kind: 'y'` ghost starts at the axis floor (start 0), which on the error-bar chart sits under the x labels.

## 5. Tests (21 October 2026)

- `node --check v2/dig.js`: clean. `node tests/lint_text.js <build> dig`: 0 errors, 4 warnings (unit-own content keys `cards`, `cardShort`, `finds`, `hominins`, checked as text).
- `DG_FAST=1 node tests/oracle.js <build> dig`: **60 passed, 0 failed**. Includes: kept share over 300 reruns 0.1977 vs expected 0.1991; atoms left at one half-life mean 32.09, variance 15.92 (binomial 32, 16); first-100-Myr decay counts variance/mean 0.98; zircon age bias −0.03% over 120 crystals; 2SE coverage 96.7%; in-between find rate 0.533 (model 0.5); determinism, log replay and snapshots on all five levels; the expert earns every star offered and all three unit stars; untimed completes; What if? earns nothing; no bot's unit union reaches three stars.
- `python3 tests/bots.py <build> dig --seeds 1-20 --bots alwaysA,alwaysB,random,greedy,threshold,still,naive,fixed`: **PASS** (no level gives three). Best masks: random D+P on L2 and L3 (both two-star levels); `fixed` (correct constants: 0.15, 1408, e/2, 375, 9.3) earns P on L2–L4; `still`/`naive` (true card ages, never predicting) earn D and T only.
- `GAME_HTML=<build> python3 tests/monkey.py dig 1,2,3 --vp 390x780,1280x720`: **6 of 6 reach the end card**, no errors, warnings, NaN or stuck states. Seed 4 on a build with every other v2 file (except `swamp.js`, see below) also ends.
- `tests/dig_shots.py` at 390×780 and 1280×720: 80 PNGs, 0 errors, no Lbl/Whisper/HUD warnings. Fixed from looking: an off-by-one canvas call (`paintSky`) that froze L1–L4; the L0 record stack was a wide empty band (now a compact stack under more sea); zircons in L2 overlapped (now 0.7 of the bed gap); the field map filled only half a phone (now full height); ribbon pin labels collided (now greedy rows above and below; "Earth forms" moves up when crowded); bush-chart labels sat on bars (now beside them); the Tiktaalik fins read as insect legs (now lobed fins with bones); pops now teach keep chances ("keeps ½", "rarely keeps") instead of repeating "buried"; the "uneven bursts" text fired on late long gaps (now chosen from the count at one half-life).
- `python3 tests/golden.py check <dig-only build>`: **48 ok, 0 failed** (114 s).
- **Full build note (not this unit):** a build with every v2 file fails to load because `v2/swamp.js` and `v2/switch.js` both declare `const SW_C`. Their owners must rename one.

## 6. Instructor note (one page)

**What students do.** Bury a sea floor and see how little the rock keeps; watch atoms decay one by one and read an age off the curve; spend a laser budget to bracket a fossil between two dated ash beds; use evolutionary reasoning to choose where to dig; then place fossils on a log ribbon and find that a "line" of fossils is a bush. Time: about 15 minutes.

**Key ideas.** Preservation bias and Lagerstätten; erosion gaps (a gap is not an absence); superposition; radiometric dating (half-life, D/P ratio, age = T½ log₂(n/u)); counting error ∝ 1/√n; evolutionary predictions (Tiktaalik); deep time on a log scale; overlapping hominin spans.

**Discussion prompts** (`teacher.prompts`): why shells and bones dominate the record; why more atoms improve an age only by a square root; why a gap in the record is not evidence against evolution (model critique: what our burial model leaves out).

**Cautions.** Keeping chances, atoms per crystal and find chances are exaggerated (×N chips). Span overlaps show coexistence, not ancestry.

## 7. Playtest script (designer and colleagues; D6 decision 4)

1. Open The Dig from the menu; read the card (≤ 100 words); press Play. Note: was the first verb clear within 10 s?
2. L0: pour on the still-water epoch. Did you notice it coming? Did the keep-chance pops change your prediction?
3. L1: did the "quarter left" answer surprise you? Could you read the ash age off the dashed curve?
4. L2: did you split the laser between the zircons on purpose? Did the √n question make sense?
5. L3: did you dig 375-Myr river rock after the prediction? Was an empty season frustrating or instructive?
6. L4: where did you put the halfway point before the reveal? Did the hominin bush land?
7. Rate fun (1–5), clarity (1–5), and name the dullest 30 seconds.
