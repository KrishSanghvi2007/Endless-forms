# The River (`river`): Wave 2 rebuild

*Session 4, 23 October 2026. File `games/endless-forms/source/v2/river.js` (`CH_RIVER_V2`, prefix `RV_`/`rv`). Replaces the legacy chapter of the same id; `ch6.js` stays playable at `?v1=1`. Tests: `tests/oracle_river.js`, `tests/river_shots.py`. Spec: D3 §4.7 and D2 §4 triage, simplified by D6 decisions 9 and 10.*

## 1. What the chapter is now

**World (D6 decision 7).** A misty tropical river through rainforest: three layers of pale canopy, hanging vines, ferns and broad leaves on both banks, drifting mist bands, a teal-grey river with flowing ripples. A flood has split one tree frog population. Over the epochs the north bank's frogs turn orange with a dark side stripe and the south bank's teal with pale spots (from a shared ancestral green), and their calls drift apart. Contact levels are played at night (moon, fireflies), when frogs breed. Accent `#2F7A5C` (jungle green). The allele inks are not used.

**Role and verb (D6 decision 9).** The player is the environment (D1 role): a fallen, mossy log that bridges the banks. One verb in every level: **tap the log** (or the river, the dock button, or Space) to lay it across or lift it away. `F` or the dock's "Faster" runs time at ×3. No other controls.

**Real biology (D6 decision 10).** The main picture is always frogs: males calling (vocal sacs swell, rings spread; closer rings = a faster call), frogs hopping onto the log, egg masses in the water, healthy tadpoles by each bank, and hybrid tadpoles that carry one parent's look on each half and grey and sink when a clash kills them. The abstract read-outs sit **beside** the biology in a field-notebook panel: the hybrid gene-pair grid (rows north changes, columns south changes) with the key equations, or the contact-zone bars. On desktop the panel also shows a hybrid frog in portrait, one parent's look on each half.

| L | Name | One idea | What happens | Aha |
|---|---|---|---|---|
| 1 | The snowball | Time apart: Dobzhansky–Muller incompatibilities snowball as k² (Orr 1995; Contested) | Epochs tick; each bank fixes one change; the grid grows a row and a column. Lay the log when hybrids should fail: frogs cross, a hybrid clutch hatches, the grid reveals which pairs clash, and each clash kills 45% of the surviving tadpoles. 20% or more survive → the frogs merge (they turn green again) and the split restarts. Below 20% → two species. | The one prediction (§3): at 3 changes per bank (9 pairs), how many pairs at 6? Untested pairs, and expected clashes, quadruple when the time apart doubles. |
| 2 | The contact zone | Contact between young species whose hybrids die: reinforcement (Dobzhansky 1940; Hoskin et al. 2005) | Two young species (5 changes per bank, 4 clashes, hybrid survival 9%). Lay the log and keep it down: each night females mate; matings across the log give hybrid clutches that die. Choosy females waste fewer clutches, so the choosy share and the call gap grow, night by night. Upstream (the same species, never in contact) only drifts. On night 12 the river dries and the banks join for good. | The tempting move (lift the log to stop the waste) is the wrong one: contact plus hybrid death builds the barrier. |
| 3 | Too soon? (boss) | When contact begins | One 18-epoch season does both: keep the banks apart until hybrids should fail, then lay the log in time for choosiness to spread before the dry season. | Inverts L2: "Contact built the barrier last level. Too soon, contact erases the split." |

**Key numbers, plainly.** L1 panel: `untested pairs 6×6 = 36`, `expected clashes 0.15×36 ≈ 5.4`, `hybrid survival 0.55^5.4 ≈ 4%` (0.55 to the expected clashes; changed in the review round from the true mean E[0.55^C], see below), then after the reveal `0.55^3 = 17%`, and the red line "species below 20%". L2–L3 panel: choosy females %, call gap % (drawn as two pulse trains), wasted clutches % against the goal line. The HUD carries the one-line meaning ("Apart: 36 gene pairs never tested in one body", "Matings across the river waste clutches: hybrid tadpoles die").

## 2. The model (all in `sim`, R() and + − × ÷ only)

- **Snowball.** Each epoch apart, each bank fixes change k; the 2k − 1 new north–south pairs are each drawn once, with chance 0.15, as a clash (hidden until hybrids form). Hybrid survival 0.55^clashes; species line 20% (legacy `ch6.js` values: `P 0.15, HV 0.55, ISO 0.2`). The call gap drifts 1.4% per change apart.
- **Contact.** Equal numbers, full mixing. A plain female mates across with probability ½; a choosy female ½(1 − a), a = gap ÷ (gap + 5). Wasted clutches = across × (1 − hybrid survival). Each night in contact: p′ = p·W₁ ÷ (p·W₁ + (1 − p)·W₀) with W = 1 − across·(1 − w); the gap grows 2.2·p′·(1 − w). The contact reach is deterministic (no drift), so the realised state equals the expectation the stars read. Upstream only drifts (binomial on 200 copies; gap random walk ±0.3).
- **Merging.** Contact with hybrid survival ≥ 20% merges the banks (all-or-nothing, designed); L1 and L3 restart the split from zero.
- **Tuning (Node runs, `scratchpad/s3/rvproto`).** L2: 12 nights of contact → 10.1% wasted, 11 → 11.7%, 10 → 13.7%, none → 42.8%. L3 (18 epochs, goal 13%): joining at 5–8 changes per bank works; joining at 4 risks a merger (44% chance of species) that leaves too little season; joining at 9+ leaves too few nights.

**MODEL cards** (one per level) carry the tags: clash chance 0.15, survival per clash 0.55, species line 20%, discrimination half-point 5%, choosy start 10%, season 18 epochs (all designed); one epoch "thousands of generations" and one night "many generations" (×N, with a real value). L1 is Contested (the snowball's empirical support is mixed).

## 3. Simplicity (D6 decision 9): what was cut from D3 §4.7

- **One verb, one role.** D3 had the player as the river level (L1, boss) and as a female frog hopping to callers (L2–L3), then an invasion view. All levels now use the log; the frog's choosiness is an allele whose spread you watch, which also keeps bible §3 (the player never dials a heritable trait).
- **Three levels.** The Haldane's-rule boss (an X-linked clash pair) is cut: it needed a second mechanic and a two-bar prediction. It is named in the cards' "cannot show" lines only by omission; see §6.
- **One prediction, the aha.** The curve drag over epochs 1–8, the threshold-epoch marker and the L3 two-marker gap prediction are gone. The one ask is three big chips (12, 18 or 36 pairs) at 3 changes per bank, in a seeded order; time pauses until it is answered. The grid's frame grows with k, so the 6 × 6 outline never gives the answer away.
- **No test crosses, no drought gamble, no three rivers.** The legacy "wait / test cross / meet" menu became a single tap with a visible expectation; the season's end (the dry season) joins the banks if you never do.
- **The guppy rig** is gone; frogs are the only organism.

## 4. Stars and bots

| Level | Offers | Rule (pure function of the final state, against the expectation) |
|---|---|---|
| L1 | Discover | some join (not forced) came when expected hybrid survival was below 20%, by 7 changes per bank (chance may still merge them: the decision counts) |
| L1 | Predict | called 36 pairs |
| L2 | Discover | expected wasted clutches at the end ≤ 12% (no merger) |
| L3 | Transfer | two species, expected wasted ≤ 13%, every join made below 20% expected survival |

Unit: Discover = L1 and L2; Predict = L1; Transfer = L3. `tests/bots.py` (seeds 1–20): alwaysA `— | D | —`, alwaysB `P (by position) | — | —`, random `P | — | —`, greedy `D | D | T (0.8)`, threshold `— | — | —`. No bot earns three stars in a level or across the unit. Extra bots in `sim.bots`: `lifter` (lifts the log every other night), `late` (joins at 11 changes), `expert` (joins at expected survival < 10%, calls 36). The oracle also checks that no fixed strategy earns the Discover/Transfer it should not (12 cases).

## 5. Tests (23 October 2026)

- `node tests/oracle.js BUILD river`: **65 passed, 0 failed.** Covers D3's oracle lines (A: mean clashes 0.15·k² ± 10% for k = 2…8, doubling 4 → 8 gives ×4.02; B: the choosy allele rises only in contact with unfit hybrids, stays put with no contact or fully fit hybrids, faster the less fit the hybrids; upstream mean 12.5% from 10%), the expected-survival formula against Monte Carlo, mergers restarting, the L2 threshold, the prediction, determinism and snapshot replay for all three levels, expert stars (L3 29 of 30: one merger by bad luck at 6 changes), the bot sweep, every Interesting text against its run, and every What if? lever.
- `tests/lint_text.js BUILD river`: clean (0 errors, 0 warnings). `sh tests/dup_globals.sh`: ok.
- Monkey: `river 1,2,3` at 390×780 and 1280×720: 6 of 6 reach the end card; also seeds 4–5 Calm at 390×780, seed 6 `?untimed=1` at 1280×720, and `?v1=1` seeds 1–2 (legacy) all reach the end. No console errors.
- Screenshots: `tests/river_shots.py OUT` (plus `--fuse` for a merger, `--calm --query '?cvd=mono'`) — every level and phase at both sizes, looked at; fixes made after looking: frogs larger on phones, the grid frame no longer outlines the 6 × 6 answer during the ask, bank labels moved off the log, the canvas filled under the scene, bigger hybrid tadpoles and egg masses, female hops onto the log at night, the hybrid portrait in the desktop panel, a shorter first line (the phone HUD wrapped to four lines).

## 6. Science: claims, sources and legacy corrections kept

Wave 1 corrections from `science_sweep_G4.md` carried over: Bateson (1909) credited alongside Dobzhansky (1936) and Muller (1942); the snowball "found evidence" (Matute et al. 2010; Moyle and Nakazato 2010), with the missing snowball (Gourbière and Mallet 2010), never "confirmed"; reinforcement "can" sharpen preferences, and the sympatric–allopatric contrast has other explanations (Coyne and Orr 1989; Noor 1999); calls diverge across generations, never within a night or a lifetime (each night "stands for many generations", tagged ×N); no teleology ("selection favours choosier females", never "to finish the job"). R7-R3 RV2's check stands: k changes per bank give k² cross-bank pairs, the same quadratic scaling as Orr's K(K − 1)/2.

New claims, each with a `refs` id: Hoskin et al. 2005 (green-eyed tree frogs, *Litoria genimaculata*: the contact zone has more distinct calls and choosier females); Dobzhansky 1940 (reinforcement); Servedio and Noor 2003 (contact can end in reinforcement or a merger depending on hybrid fitness and gene flow); Coyne and Orr 2004 (time to speciation, for the ×N chip). The frogs' orange and teal colours are designed (said on the L1 MODEL card); the real lineages differ mainly in call. Wording follows D0 §3: populations fix changes and evolve; females with an allele "prefer" or "reject"; no individual chooses, needs or evolves.

**Not shown** (MODEL "cannot show"): clashes within one bank, three-gene clashes, ecological speciation (Two Fruits), polyploidy (Doubling), a cost of choosiness, swamping by migrants from far populations, stable hybrid zones and hybrid species. Haldane's rule was cut with its boss (D6 decision 9); The Royal Line's X-linkage stays its natural home if the designer wants it back.

## 7. Playtest script (designer and colleagues, D6 decision 4)

About 6 minutes. Phone and desktop.
1. Open The River. Read the card, press Play. *Without help:* can you say what the log does? (Expect: joins or separates the banks.)
2. L1: watch two or three epochs. Answer the pairs question. Was 36 a surprise? Then lay the log whenever you like. If they merged, say why (expect: hybrids survived too well, too few clashes). Try again. *Ask:* why does the grid grow faster than the epochs?
3. L2: lay the log. Watch the hybrid clutches die. Did you want to lift the log? Did you? At the end, compare the call gap at the log with upstream. *Ask:* where did the barrier come from?
4. L3: play the season. Did you feel the pull between waiting (safe) and joining (time for contact)? *Ask:* what goes wrong if you join too soon? too late?
5. Feedback (1–5): fun, clarity of the one verb, did the numbers in the panel help, did anything look like symbols rather than frogs, was anything confusing or too slow (try Faster).

## 8. Known issues and follow-ups

- The "found" clash marker on the strip chart is small when only one join exists.
- No teacher `freezeAsk`/`teacherStep` hooks yet; the teacher prompts and result code (30 bits: mask, join, mergers, wasted %, the call, call gap) are in.
- Calm mode stops the calls' rings and the mist.
- The shipped `Endless_Forms_v2.html` is not rebuilt here (other units are being edited in parallel).

## Review round (23 October 2026)

*Reviewer: playtester, art director and adversarial biologist, against D6 decisions 7–10. Played every level with Playwright (`tests/river_shots.py`, plus `--fuse` for a merger and `--calm --query '?cvd=mono'`) at 390 × 780 and 1280 × 720; shots in the session scratchpad (`s3/rv_river/`).*

**Verdict.** The world is distinct (misty rainforest, mossy log, orange-striped vs teal-spotted frogs, night contact), the verb is one tap, three levels, one prediction, and the abstract grid sits beside real frogs, eggs and tadpoles. The intro card reads in about 20 seconds and the HUD's first line plus the ghost hand make the log obvious. L2 is passive once the log is down, but that is the lesson (the tempting move is to lift it). Six real problems were found and fixed:

| # | Problem (what a player or a biologist would hit) | Fix |
|---|---|---|
| 1 | **The panel's numbers did not add up.** It showed `0.15×25 ≈ 3.8` expected clashes, then `hybrid survival ≈ 17%`; a student working 0.55^3.8 gets 10%. (17% was the true mean E[0.55^C], which Jensen's inequality lifts above 0.55^E[C]: honest but unexplained, against D6 decision 9 "show the key number plainly".) | The row now shows the sum it is: `0.55^3.8 ≈ 10%` (computed from the exponent on screen). `RV.tsurv` = 0.55^(p·k²) drives the stars, bots, What if? planner and the Interesting text. For p = 0.15 it crosses 20% and 10% at the same k (5 and 6) as the true mean, so no star, bot or tuning changed; the oracle asserts this. The Monte-Carlo check of E[0.55^C] stays as a model test. Star lines say "the panel's hybrid survival". |
| 2 | **The species line was missing on phones** (no room under three rows), so "0.55^3 = 17%" did not say why that means two species. | Rows shrink to fit a fourth line; "species below 20%" is drawn on every layout, in a darker red with words (not hue alone). |
| 3 | **The ghost hand crossed the answer chips** during the L1 prediction on a phone. | The hand steps aside while the ask is open and returns once after it (only if it was shown in the first place). |
| 4 | **"Still to earn: Discover — join once…" after the player had just done exactly that.** The unit's Discover needs L1 and L2 (`unitStars`), so the engine still listed it. | When the level's own Discover is earned, the line reads "Done here. Also end level 2 with 12% or fewer wasted clutches" (or the L1 counterpart). |
| 5 | **Colour-blind and mono:** untested grid cells (#B9C2B3) and tested-fine cells (#A8D08A) had almost the same luminance. | Untested cells darker (#9AA395), fine cells paler (#D6ECC2), clashes red with a white cross; checked under `?cvd=mono`. |
| 6 | **Words that did not match the run.** The unit card said "Contact while hybrids thrived merged the frogs" to players who never merged, and "Your season ended with —% of clutches wasted" if the season ended merged. | General present tense ("Contact while hybrids still thrive merges the frogs"), and a run-chosen ending: "…with {x}% of clutches wasted" or "…with the two banks merged into one population". |

**Science notes.** Hybrid tadpoles no longer flicker between the parents' looks (a symbol, not biology): each shows one parent's colours on each half, fixed; the desktop hybrid portrait likewise. Hoskin et al. (2005) is now stated as the paper found it: the contact-zone population became very choosy and is now isolated from its own lineage too (it was later described as *Litoria myola*; not named on screen). "Hybrid fitness and gene flow decide which" softened to "help decide which" (Servedio and Noor 2003 model both outcomes; other factors matter). Every other claim was checked against its source and stands: k × k cross-bank pairs (quadratic like Orr's K(K − 1)/2), the snowball's mixed evidence (Matute et al. 2010; Moyle and Nakazato 2010; Gourbière and Mallet 2010), reinforcement "can" sharpen preferences with alternatives named (Coyne and Orr 1989; Noor 1999), ×N tags on epochs and nights, D0 §3 wording.

**Left as is.** The small "found" marker on the strip; no teacher `freezeAsk` hooks; frog colours stay designed (MODEL card says so).

**Tests after the fixes.** `node tests/oracle.js BUILD river`: **67 passed, 0 failed** (2 new: the panel's survival at k = 4, 5, 6, and its thresholds agree with the true mean). `tests/lint_text.js`: clean. `sh tests/dup_globals.sh`: ok. `tests/bots.py river --seeds 1-20`: PASS (alwaysA `— | D | —`, alwaysB `P | — | —`, random `DP | — | —` at best on one seed (a lucky join and call; no unit union reaches three), greedy `D | D | T`, threshold `— | — | —`; lifter, late, expert also pass). Monkey `river 1,2,3` at 390 × 780 and 1280 × 720: 6 of 6 reach the end card, no console errors. Screenshot runs (normal, `--fuse`, calm + mono): 0 errors.
