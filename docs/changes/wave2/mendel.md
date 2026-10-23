# Mendel's Garden (`mendel`): Wave 2 build log

*Session 4, 23 October 2026. File: `games/endless-forms/source/v2/mendel.js` (CH_MENDEL_V2, replaces the legacy `mendel`; the legacy chapter still plays at `?v1=1`). Tests: `tests/oracle_mendel.js`, `tests/mendel_shots.py`. Inputs: D6 (decisions 7–10 bind), D3 §4.2, D2 §4 triage, lessons_batch1 §0, Wave 1 sweeps G1, G3, G6.*

## 1. What it is

**World (D6 decision 7).** The Augustinian abbey garden in Brno in the 1850s: a cream stucco wall with a terracotta tile coping and leaded arched windows, a sage hedge, a potting bench of terracotta pots, pea plants climbing hazel sticks, a dark seed bed (L1, L2) or a linen-covered table with terracotta saucers (L3), and the monk's ledger in sepia ink on cream paper. Herbarium-watercolour drawing: soft washes, ink edges, side-view pea flowers (broad standard, two wings, keel, calyx), compound leaves with leaflet pairs, broad stipules and curling tendrils. Accent `#7B3F98` (pea-flower violet). The blue and amber data inks are not used.

**Real biology, not symbols (decision 10).** The player watches and acts on real plants and real processes: pollen on a sable brush, a pod that swells on the mother plant and splits, peas that are sown and grow into seedlings whose buds open purple or white, and peas whose own shape and colour show in the pod (round/wrinkled, yellow/green). The abstract read-outs (ledger counts, a Punnett square, (½)ⁿ, 9 : 3 : 3 : 1, the strip's bar chart) sit beside the biology, never instead of it.

**Role and the one verb (decision 9).** The player is the gardener (an experimenter), never a plant. One verb throughout: **brush pollen from one flower onto another** (drop it on the same flower to self it). Drag, or tap the donor then the receiver. Two shortcuts keep the verb obvious: in L2 a tap on a purple plant tests it with the white tester; in L3 a tap on either parent crosses them and a tap on the hybrid selfs it. Calls (pure or carrier; breeds true or hides wrinkled) are made on the pot's tag, or by tapping the plant once the crosses are used up.

**Opening card (decision 8).** `content.intro = {game, biology, how}` (24, 30 and 23 words).

## 2. Levels (3; each teaches one idea)

| L | Name | Idea | What happens | Key number, shown plainly |
|---|---|---|---|---|
| 1 | The vanishing white | Dominance and segregation | Purple line × white line: every seed flowers purple, and the hybrid is potted up. Self the hybrid: white comes back. 6 crosses; the level ends after 4 selfs of the hybrid. | Ledger: yours against ¾ : ¼ and Mendel's 705 : 224; Punnett square with **¼ = ½ × ½**; HUD "¼ white = ½ × ½: each parent passes its hidden white half the time." |
| 2 | Pure or carrier? | The test cross; evidence is not proof | Five purple plants, 1–4 carriers (seeded). Each test with the white tester gives 4 seedlings. One white flower settles a carrier (auto-called). 8 crosses, then call the rest and press Done; the genotypes are revealed. | Ledger: **(½)ⁿ**, "if a carrier", and for the last plant tested "(½)⁴ = 1 in 16"; each column "1 in 16" / "white!"; HUD "D: 4 purple in a row. A carrier does that 1 time in 16." |
| 3 | Two genes | Independent assortment; new mixtures | Round yellow × wrinkled green: every pea round and yellow (tray "first cross, all RrYy"). Self the hybrid: peas sort into four saucers. After 4 selfs the abbot's round green pea is potted; test it (with wrinkled green, or selfed) and call it. 10 crosses. | Ledger columns under the saucers: yours, expected **9 : 3 : 3 : 1**, Mendel's 315 : 108 : 101 : 32; tray "1 in 256" for the round green pea's test. |

**The one prediction (decision 9).** Only in L1, and it is the chapter's aha: at the first selfed hybrid, before the pod splits, "what share will be white?" with three dock buttons (None, A quarter, A half). The closed pod carries the label "how many white?". It is untimed; the pod waits. Scored against the expectation ¼, never the realised count. No drag-the-marker interludes anywhere.

## 3. Stars, bots, oracle

- **One star a level** (no level offers two): L1 Predict (call ¼), L2 Discover (all five calls right), L3 Transfer (call the round green pea right *on strong evidence*: a hider would have shown no wrinkled pea at most 1 time in 16, or a wrinkled pea was seen). The unit's stars are the OR of the levels (no `unitStars`), so a level card never names a star the player just earned.
- **Bots** (`sim.bots`): alwaysA (first cross every time, calls all pure, answers None), alwaysB (last cross, calls all carrier, answers ½), greedy (answers ½, one test each, one selfed pod), threshold (answers None, calls without testing), guessQuarter, and expert (oracle only). Sweep, seeds 1–40: no bot earns three stars in any level; the oracle checks that no bot's union across the unit reaches three.
- **Oracle** (`node tests/oracle.js BUILD mendel`, 44 checks): ¼ white from a selfed hybrid (8,000 seeds), 1 : 2 : 1 underneath, ½ from hybrid × white, pure lines breed true; carrier × white gives ½, a pod of 4 is all purple 1/16 of the time, a pure plant never gives white; 1–4 carriers per garden; "1 in k" = 2ⁿ; 9 : 3 : 3 : 1 (16,000 peas) with shape independent of colour; the abbot's pea is RR 1 time in 3; its tests give ½ (tester) or ¼ (selfed) wrinkled; (½)⁸ = 1/256 and (¾)⁸ ≈ 0.10; Mendel's numbers in the words; the question opens once, at the first selfed hybrid, and the pod waits; one star a level; expert earns Predict 60/60, Discover 58/60 (a carrier can hide in 8 seeds, and 8 crosses is tight), Transfer 60/60; no-test strategies never earn Discover or Transfer; one selfed pod never certifies a pea; determinism and snapshot replay; every Interesting text matches its run (310 runs, 11 keys).

## 4. Science notes (and Wave 1 corrections honoured)

- **G1 (ch1.js:22):** "inferred what we would now put this way: two copies…" (Mendel wrote pure lines as A, not AA; Olby 1979); "the test cross is a standard way for breeders… carriers are now often found with DNA tests". The L2 MODEL card says both.
- **G1/G6 (`confNote`):** never "99.9% confident it is pure". Every evidence line is a likelihood: "a carrier does that 1 time in 16". The L2 card says "All-purple results never prove a plant pure; they make a hidden carrier unlikely". RECALL.mendel: "Strong evidence, but evidence, not proof".
- **G1 (selfed rows):** a selfed carrier gives white ¼ per seed; in L3 the selfed test of the abbot's pea uses (¾)ⁿ and is flagged as weak (Interesting `self`), and Transfer needs ≤ 1/16.
- **G3 #42:** independent assortment: "on different chromosomes"; the L3 MODEL card names linked genes as what the model cannot show (Crossing Over). Seed shape (R, linkage group V) and seed colour (I, linkage group I) really are on different chromosomes (Blixt 1975; Reid and Ross 2011), so unlike the legacy L2 no fictional linkage is shown.
- **G3 (χ² on 16 seeds):** no χ² test in this rebuild (D6 decision 9); the noise around 3 : 1 is shown by the ledger and the Interesting `scatter` text ("Mendel counted 929 plants").
- **Mendel's numbers:** 705 violet : 224 white, 3.15 : 1 (his experiment 3; flower colour goes with seed-coat colour); 315 : 108 : 101 : 32 from 556 peas (the round/wrinkled × yellow/green cross). Fisher (1936) vs Franklin et al. (2008) appears once, in a Why? chunk, as debated, with no star.
- **Molecular notes:** white = a broken A, a bHLH regulator of anthocyanin (Hellens et al. 2010); wrinkled = SBEI broken by a transposon-like insertion (Bhattacharyya et al. 1990); green = a broken stay-green gene, the I locus (Armstead et al. 2007).
- **Agency (D0 §3):** plants carry, pass on, hide (copies), breed true; no "chooses", "needs" or individual "evolves". The lint passes.
- **×N and designed values:** a generation in about 4 s (×N, real: one growing season); 8 peas a pod (L1, L3) and 4 a test pod (L2, designed, so evidence builds slowly; real pods hold up to about 10); 6/8/10 crosses (designed); 1–4 carriers of 5 (designed).
- **Designed look, not a claim:** all L3 plants have white flowers (seed-colour lines with clear seed coats read best); nothing in the text depends on it.

**Refs** (ids in the MODEL cards): mendel1866: Mendel G. 1866. *Versuche über Pflanzen-Hybriden.* Verh. Naturforsch. Ver. Brünn 4: 3–47. hellens2010: Hellens RP et al. 2010. Identification of Mendel's white flower character. *PLoS ONE* 5: e13230. bhattacharyya1990: Bhattacharyya MK, Smith AM, Ellis THN, Hedley C, Martin C. 1990. *Cell* 60: 115–122. armstead2007: Armstead I et al. 2007. Cross-species identification of Mendel's I locus. *Science* 315: 73. blixt1975: Blixt S. 1975. Why didn't Gregor Mendel find linkage? *Nature* 256: 206. reid2011: Reid JB, Ross JJ. 2011. Mendel's genes: toward a full molecular characterization. *Genetics* 189: 3–10. olby1979: Olby R. 1979. Mendel no Mendelian? *Hist. Sci.* 17: 53–72. Also cited in text: Fisher RA 1936, *Ann. Sci.* 1: 115–137; Franklin A, Edwards AWF, Fairbanks DJ, Hartl DL, Seidenfeld T 2008, *Ending the Mendel–Fisher Controversy*.

## 5. Deviations from D3 §4.2 (D6 decision 9 overrides the spec's complexity)

| D3 asked for | Built | Why |
|---|---|---|
| Five levels: carrier hunt, noise bands at n = 10/50/500, two genes with linkage, 9 : 7 epistasis, a χ² "tidy gardener" boss | Three levels: 3 : 1, the test cross, 9 : 3 : 3 : 1 plus the abbot's pea | 3–4 levels, one idea each. Linkage lives in Crossing Over; epistasis and the Fisher debate are cut (the debate keeps one Why? line, no star). |
| Confidence sliders, Brier score | Pure / carrier tags; the evidence shown as "1 in 2ⁿ" | No unexplained controls; the key number carries the uncertainty. |
| A prediction on most levels | One three-button question in L1 | Decision 9: one prediction, only the aha. |
| Tester with three flowers a season | A cross budget (6/8/10) | One felt cost, easy to read in the HUD ("4 left"). |
| Snapdragon 1 : 2 : 1 transfer | The abbot's round green pea | Transfer to a new gene and a breeder's question, with the same verb. |
| What if? levers | None | Nothing to rerun that teaches more than the next cross; keeps the card short. |

## 6. Tests run (all on `V2_ONLY='0*,zz_*,mendel.js'` builds in the scratchpad)

- `sh tests/dup_globals.sh`: ok (every top-level name is prefixed `MG_`/`MG`/`CH_MENDEL_V2`).
- `node tests/lint_text.js BUILD mendel`: 0 errors, 0 warnings (source and content).
- `node tests/oracle.js BUILD mendel`: 44 passed.
- `python3 tests/bots.py BUILD mendel --seeds 1-40`: PASS.
- Monkey: seeds 1, 2, 3 at 390×780 and 1280×720 reach the end card (about 1,250 steps each); seeds 4–6 with `--calm`; seed 7 with `?untimed=1`; legacy `?v1=1` seed 1 reaches its end. No console errors, NaN, warnings or stuck states.
- Screenshots of every level and phase at both sizes, plus a deuteranope view of L3 (`?cvd=deut`): `scratchpad/s3/mendel/`.

## 7. Playtest script (designer and colleagues, about 7 minutes)

1. Open Mendel's Garden. Read the card aloud: can you say what you will do before pressing Play?
2. **L1.** Without help, make the first cross. Did the hand's drag make sense? When every seedling flowers purple, say where white went. When asked "what share will be white?", answer before the pod opens. Watch the white flowers return. Look at the ledger: does "¼ = ½ × ½" explain what you saw? Did your count match ¼? (It often will not exactly; does the card's line about Mendel's 929 plants help?)
3. **L2.** Test the plants. When a white flower appears, does it feel certain? When a plant gives four purples, read "1 in 16". Decide where to spend your last crosses. Call every plant and press Done. Was any call a gamble you knew you were taking?
4. **L3.** Cross the parents, then self the hybrid until the abbot's pea appears. Point to the two "new mixtures". Does 9 : 3 : 3 : 1 in the ledger line up with the saucers? Test the round green pea: why is the wrinkled green plant the better tester than selfing?
5. Feedback: Was anything confusing or fiddly? Did the garden feel like a real place with real plants? Was any number on screen unexplained? Which moment, if any, was the "aha"?

## 8. Open items

- **Engine:** the level card's star row shows the unit's stars; with one star a level that now reads correctly. The Ghost "tap" demo for the self in L1 uses `force: true` (a second demo in one level).
- **Size:** 97 KB raw (guide about 90 KB).
- **Needs sign-off:** the 705 : 224 and 315 : 108 : 101 : 32 counts and their attributions; the one-line molecular notes (Hellens 2010, Bhattacharyya 1990, Armstead 2007).

## 9. Review round (23 October 2026, same session)

*Reviewer as playtester, art director and adversarial biologist. Played every level with Playwright at 390×780 and 1280×720 (plus `?cvd=deut` on L3); shots in `scratchpad/s3/rv_mendel/`.*

**Verdict before fixes.** The world is distinct and real (abbey wall, terracotta pots, side-view pea flowers, pods that split, peas that are sown or sorted). One verb, three levels, one prediction (the L1 aha), key numbers on the ledger. Colour-blind safe: purple/white by luminance, yellow/green by luminance (checked under deuteranopia), wrinkled by outline. No softlocks found: every level ends when the crosses run out (L1, L3 without the abbot's pea) or after calls and Done (L2, L3). The model numbers check out (705 : 224 = 3.15 : 1; 705 + 224 = 929; 315 + 108 + 101 + 32 = 556; (½)⁴ = 1/16, (½)⁸ = 1/256, (¾)⁸ ≈ 0.10; 1 in 3 round green peas is RR). The problems were small but real:

| # | Problem found | Fix |
|---|---|---|
| 1 | **The self was the one unexplained control.** HUD said "drop its pollen on its own flower" (a drag onto itself, which a player cannot see), while the ghost demonstrated a single *tap*, which only loaded the brush. | In L1, a tap on the hybrid's flower selfs it (as in L3). HUD "Now self the hybrid: tap its flower."; ghost line "Demo: tap the hybrid's flower to self it."; intro *how* "…or tap a hybrid to self it." `tests/mendel_shots.py` now selfs the L1 hybrid with a real pointer tap and fails if it does not. |
| 2 | **Science wording, key1.** "each parent passes its hidden white half the time" is muddled for a *selfed* plant (one parent). | "¼ white = ½ × ½: pollen and egg each carry white half the time." |
| 3 | **Overclaim, Interesting `scatter`.** "12 white in 32 is far from a quarter": 12 vs 8 expected is about 1.6 SD (n = 32, p = ¼), and the trigger (|w/n − ¼| ≥ 0.12) fired at about 1.1 SD for n = 16. | Text "{w} white in {n}, where a quarter is {e}. Small samples scatter…"; trigger: at least 3 off the expected count (n ≥ 16). Oracle checks the new rule and `e`. |
| 4 | **Overclaim, Interesting `nowg`.** "a few dozen peas often miss it": 32 peas miss a 1-in-16 class only 13% of the time. | "No wrinkled green pea in {n}. It is 1 pea in 16, so {n} peas miss it {pc}% of the time." with pc = 100 × (15/16)ⁿ from the run (60% for 8, 13% for 32). Oracle checks pc. |
| 5 | **L3 key number had no plain meaning on screen during play** (9 : 3 : 3 : 1 only in the ledger; ¾ × ¾ only in Why?). | HUD for about 4 s after the first selfed hybrid: "¾ round × ¾ yellow = 9/16 round yellow: the genes sort on their own." (as key1 does in L1). |
| 6 | **L2: calling was never explained until the crosses ran out.** | A one-time whisper after the first all-purple test: "Tap its tag: pure or carrier?" |
| 7 | **Phone, L3:** the "Round yellow" and "Wrinkled green" tags overlapped. | On narrow screens L3 gives the parents wider slots (1.1 : 1.1 : 0.85 : 0.95) and tags drop to 12 px. |
| 8 | **Phone, L2:** the fourth seedling of plant E was clipped by the bed frame. | Test columns 6 px narrower. |

**Checked and kept.** The single three-button prediction (decision 9; it is the chapter's aha and needs no drag). Greedy (one 4-seed test per plant, call the rest pure) earns Discover on about 80% of seeds: honest, since each untested carrier slips through 1 time in 16, and the card names the risk. The L3 Transfer star is mostly earned by bots that happen to run the right test cross (the wrinkled-green tester is the first legal cross); that is the lesson, not an exploit. Real pea flowers self before they open (the MODEL card says Mendel removed anthers to cross). Mendel's 705 : 224 is his seed-coat experiment, whose colour goes with violet flowers (§4).

**Tests after fixes** (build `V2_ONLY='0*,zz_*,mendel.js'`): oracle 44/44; `lint_text` 0 errors, 0 warnings; `bots.py --seeds 1-40` PASS; monkey seeds 1, 2, 3 at 390×780 and 1280×720 all reach "Unit complete", no console errors; `dup_globals` ok; `mendel_shots.py` at both sizes and `?cvd=deut`, 0 errors.
