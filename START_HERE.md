# START HERE: handoff for the next session

*Updated 23 October 2026 at the end of session 4 (session 3 ended 22 October, session 2 on 21 October; first written 15 October at the end of session 1). Every finished piece of work is committed and pushed. This file is the status page; `GAME_BIBLE.md` is the full reference, and `CLAUDE.md` holds the coding rules.*

---

## 0. First five minutes

1. **Branch.** All work is on **`claude/evolution-game-critique-9m7vmx`**. `main` holds only the initial commit. If the new session runs on a different branch, bring this work in first, or you will see an empty repo:
   ```
   git fetch origin claude/evolution-game-critique-9m7vmx
   git merge origin/claude/evolution-game-critique-9m7vmx   # or: git checkout -B <new-branch> origin/claude/evolution-game-critique-9m7vmx
   ```
   (Better still, the designer merges that branch into `main` through a pull request first.)
2. **Read, in this order:**
   1. This file.
   2. `docs/design/D6_designer_decisions.md` (the designer's binding answers; one page).
   3. `GAME_BIBLE.md` (§1–3 for the vision, §8 for build and test).
   4. `docs/changes/wave2/lessons_batch1.md` (§0, the ten rules), before writing any v2 code.
3. **Check the build works:**
   ```
   cd games/endless-forms/source && python3 build.py /tmp/ef.html
   sh tests/dup_globals.sh && node tests/lint_text.js /tmp/ef.html --quiet
   GAME_HTML=/tmp/ef.html python3 tests/monkey.py v2 1
   ```
   Each run should report `"status": "end"` (23 of 23 at the end of session 4). In the cloud sandbox, Playwright needs `executable_path='/opt/pw-browsers/chromium'`; the test scripts detect this themselves.

---

## 1. The vision (one paragraph)

**Endless Forms** is one game, used by professors and their students, in which an undergraduate learns all of evolutionary biology by *doing* it. The player is the selective force (the bird eating moths, the doctor dosing patients), or a behaving animal whose rule then competes as an allele, or an investigator with a budget. The player sees the population respond before any number or word appears. The design rules:
- It must be **fun first**, with a physical verb every second, rising stakes and a twist at the end.
- It must be **scientifically correct**, with a MODEL card that says what is simplified, exaggerated parameters tagged ×N, and contested ideas presented as contested.
- It must be **visual**: the concept lives in the picture, and a live graph grows inside the scene.
- It must **not be clunky**: no more than 40 words before the first action, and a ghost hand demonstrates instead of a text card.

The game merges three older prototypes: Endless Forms (48 chapters), Equilibrium (a Hardy–Weinberg course, now one chapter) and Tangled Bank (the earliest engine). It ships as a single offline HTML file. The licence is MIT.

## 2. The designer's decisions (D6, binding)

1. The name is just *Endless Forms*; no "field station" branding.
2. Hardy–Weinberg is **one chapter**, "Equilibrium" (id `census`), now 5 levels of rising conceptual complexity after the decision-9 simplification. It is built: `v2/mixer.js`.
3. Cuts accepted: Food Web, Islands and After the Fire move to the appendix, and every level-2 quiz goes.
4. Platform: plain JavaScript and Canvas2D now; TypeScript/PixiJS decided later by a spike. No Unity or Godot.
5. Playtesting is done by the designer and colleagues. There is no student recruitment and no ethics process for now.
6. **No controversial topics.** Malaria Coast, Out of Africa, Human Variation and the human-GWAS game are withdrawn. Heterozygote advantage is taught with warfarin-resistant rats.
7. MIT licence.

Still open (ask the designer when they have played the build):
- Do the redesigned favourites keep what they loved?
- Are the ghost jays in Wood L3 honest enough?
- Where should the app be hosted?

---

## 3. What has been done

### Session 1 (14–15 Oct)
- **Setup and docs:** repo organised; expert reviews R1–R8 and fact-checks; Wave 1 science sweep (about 300 corrections); design documents D0–D5; `docs/CRITIQUE.md`.
- **Engine:** the Wave 2 v2 engine (`source/v2/0*.js`; contract in `docs/design/API_v2.md`).
- **Batch 1:** five units built, reviewed, fixed and gated: Lichen Wood, Black Country, Hawks and Doves, Equilibrium (the one Hardy–Weinberg chapter, `v2/mixer.js`, id `census`) and Drift Casino.

### Session 2 (21 Oct): designer feedback, then the remaining units
**Designer feedback (D6 addendum, decisions 7–8):**
- **7. Each chapter has its own world:** its own organism, place, palette and accent colour. Blue and amber are used only inside genotype read-outs, and beetles appear only in Equilibrium.
- **8. Every chapter opens with a description card** (`content.intro = {game, biology, how}`), with a "?" button in the dock to reopen it.

**Engine:** the card is built in `00_entry.js` (API_v2 §15; log `docs/changes/wave2/intro_card.md`). The five Batch 1 units gained card text and accents. Drift Casino was reskinned as a riverboat saloon with anoles in place of beetles; Hawks and Black Country lost their blue and amber.

**Units in session 2** (all in `source/v2/`, logs in `docs/changes/wave2/<id>.md`):

| Unit (id) | World | Status |
|---|---|---|
| Bitter Wings (`bitter`) | Neotropical forest edge, jacamar, Heliconius-style models | Built; self-reviewed (playtest, science, D5 §3); all tests pass |
| The Forager (`forager`) | English hedgerow and orchard through one May day | Same as Bitter Wings |
| Left Jaw, Right Jaw (`jaws`) | Lake Tanganyika shallows, scale-eating cichlids | Same as Bitter Wings |
| The Raffle (`raffle`) | Cow pasture, dung flies, brass raffle drums | Same as Bitter Wings |
| Alarm Call (`alarm`) | Sierra meadow at Tioga Pass, Belding's ground squirrels; Seychelles warbler boss | Same as Bitter Wings |
| The Clinic (`clinic`) | Night ward and glowing microscope views; plasmid bay | Same as Bitter Wings |
| Switches (`switch`) | Dark-field fluorescence "monster workshop"; stickleback lake boss | Same as Bitter Wings |
| The Scribe (`scribe`) | Night microbiology bench; DFE, Luria–Delbrück, replica plating | Same as Bitter Wings |
| The Royal Line (`royal`, new) | Sepia portrait gallery and Morgan's fly room | Built by its builder; external playtest and science reviews done, **but their 19 findings are NOT yet applied**: `docs/changes/wave2/royal_review_pending.md` |
| The Leaky Tap (`tap`, new) | Seabird cliff at sunset | Built and self-tested; **external review interrupted** |
| Gene Swamping (`swamp`, new) | Lava and sand, pocket mice, owl | Built and self-tested; **no external review yet** |
| The Dig (`dig`, new) | Cliff strata, fossils, zircon clock | Built and self-tested; **no external review yet** |

**Integration fix:** `swamp.js` and `switch.js` both declared `SW_C`, which crashed the full build; it is renamed to `SWP_C` in swamp. New guard: `sh tests/dup_globals.sh` fails on any duplicate top-level name. **Run it after every unit.**

**Shipped:** `games/endless-forms/Endless_Forms_v2.html`, rebuilt from all v2 files. Monkey, seed 1: 18 of 18 reach the end card (17 v2 units plus Mendel).

### Session 3 (22 Oct): simplicity and real biology
**The designer's verdict:** the new worlds and UI are great; make every chapter unique like this. Some gameplay is uninteresting, confusing or too complicated. Recorded as D6 decisions 9 and 10 (binding):
- **9. Simple beats clever.** Remove the "drag the diamond/marker" prediction interludes unless one is the aha (at most one, trivial to grasp). One verb per chapter, normally 3–4 levels. Show the key number or equation plainly, with a one-line meaning. No unexplained controls.
- **10. Real biology, not symbols.** Show real organisms, cells, gametes and processes, not chips, tickets, marbles or dots. Abstract read-outs sit only beside the biology.

**Simplification pass:**

| Units | Status |
|---|---|
| lichen, soot, hawks, census (Equilibrium), casino, bitter, jaws, forager | **Done** (decision 9; casino and census also got decision-10 notes). Each unit's log has a "Simplification (D6 decision 9)" section |
| raffle, alarm, switch | Simplification **started but interrupted** at the 2-hour stop. The partial edits still pass oracle and monkey, so they are kept. **Finish them, including decision 10 for the raffle: show sperm in the spermathecae, not a drum.** Snapshots of the partial files: `source/v2_wip/*_simplify_partial.js.txt` |
| scribe | Partial edit broke its oracle, so it was **reverted** to the session-2 version. The partial is kept in `v2_wip/scribe_simplify_partial.js.txt` |
| clinic, royal, tap, swamp, dig | **Not simplified yet.** The royal review findings are still pending (`royal_review_pending.md`); tap, swamp and dig still need external review |

**New chapters planned but NOT started:** Mendel's Garden, Why Sex?, Tree Thinking, The Commons, The River, The Archipelago. Their worlds, science guard-rails and full prompts are in `tools/workflows/6_simplify_and_build_wave_a.js` (the `NEW` array). The machine has 4 CPUs, so a workflow runs only about 2–3 agents at once; budget about 60–90 minutes per unit.

### Session 4 (23 Oct): simplification finished, six new chapters, integration
**Simplification (D6 decisions 9 and 10) finished** for every remaining unit. Each log has a "Simplification" section.
- **raffle:** the drum is gone. Sperm visibly enter the female's spermathecae, and eggs are fertilised as they pass. Now 3 levels.
- **alarm:** 3 levels. The sisters' face blazes were cut as a designed symbol.
- **switch, clinic, scribe:** 4 levels each, with one prediction.
- **royal:** the 19 findings in `royal_review_pending.md` were verified and applied. 4 levels, one prediction (the reverse cross).
- **tap, swamp, dig:** self-reviewed as playtester and biologist (no external review), then simplified. tap fixed a real bug: an ask that never held the sim.

**Six new chapters built**, each in its own world, with an intro card, 3–4 levels, one verb and at most one prediction:

| Unit (id) | World | Levels |
|---|---|---|
| Mendel's Garden (`mendel`, replaces the legacy chapter) | Mendel's abbey garden in Brno, pea flowers, a ledger | 3 |
| Tree Thinking (`tree`) | A Victorian museum at night, a brass tree of life | 4 |
| The Commons (`commons`) | A microscope lab, *Pseudomonas* in droplets, gold siderophore | 4 |
| Why Sex? (`sex`) | A New Zealand lake, mud snails and a trematode | 3 |
| The River (`river`) | A misty rainforest river, tree frogs, a log bridge | 3 |
| The Archipelago (`arch`) | The Galápagos from the sky, Darwin's finches | 4 |

**Integration check** (full build, every v2 file):
- `dup_globals` is clean, `lint_text` reports 0 errors (4 warnings), and a Playwright load at 390×780 and 1280×720 shows no console errors.
- All 22 unit oracles pass.
- The monkey (seed 1, 390×780) takes **23 of 23** v2 chapters to the end card.
- No integration fixes were needed, and nothing moved to `v2_wip/`.

**Shipped:** `games/endless-forms/Endless_Forms_v2.html` (about 3.8 MB), rebuilt from all v2 files.

**Playtest guide:** `docs/PLAYTEST_GUIDE.md` (D6 decision 4). It covers how to open the game, then gives a 5-minute script and a feedback form for each of the 23 chapters.

## 4. What is NOT done

1. **The designer-and-colleagues playtest.** Send the shipped file and `docs/PLAYTEST_GUIDE.md`, then fold the feedback into the units. This is the next gate.
2. **External reviews.** tap, swamp and dig, and the six new chapters, have only self-reviews (playtester, art director, adversarial biologist). Run an independent science review and a D5 §3 release gate on the full build. Reuse the review prompts in `tools/workflows/5_units_tap_royal_swamp_dig.js`.
3. **Science sign-off items flagged by builders** (see each log's "needs sign-off"):
   - Alarm: the numbers in Sherman 1985 and Hanken & Sherman's 78%.
   - Scribe: the Sanjuán 2004 DFE split and the Jónsson 2017 figures.
   - Jaws: Kusche 2012, Boileau 2015 and the Lee 2015 diet wording.
   - Switches: the Averof & Patel 1997 species.
   - Casino: Kolbe 2012 and Censky 1998.
   - Mendel: the 705 : 224 and 315 : 108 : 101 : 32 counts and the molecular notes.
   - Why Sex?: page numbers for Jokela & Lively 1995 and King et al. 2009, and a primary source for the *Microphallus* life cycle.
   - Tree, Commons, Archipelago: each log has a "Needs sign-off" list.
4. **Engine requests** collected in unit logs:
   - a Predict "set" or choice kind (Archipelago adds a second vote)
   - the phone strip left open when a sim closes its own prediction
   - the card's "still to earn" line naming a star already earned
   - a Petri palette option and a forest place in `00_tokens.js`
   - the boss card's y-axis title overlapping a tick
   - `Predict.reveal`'s "you" and "expected" labels overprinting at 100% (Royal L1)
5. **File size.** Units run about 100–130 KB raw against a ~90 KB guide, and the full build is about 3.8 MB. Compress art or fonts before hosting.
6. **The remaining legacy chapters** (D2 §4 triage). Each must be rebuilt in its own world, simple (decision 9) and showing real biology (decision 10). Still legacy in the menu:
   - Act 2: Crossing Over, The Fancier (→ The Breeder)
   - Act 4: The Castaways. Its L1 is already in Drift Casino; L2 Isle Royale becomes Genetic Rescue.
   - Act 5: The Sieve, Lock and Key, The Landscape
   - Act 6: The Crowd, Live Fast, Shape-shifters
   - Act 7: Two Sizes, The Lek, Fisher's Brood, The Selfish Spindle, The Meadow
   - Act 8: The Nest, Blood Debts, Many Become One, The Guest
   - Act 9: The Coalescent (★ spine), Copy and Paste, The Sweep, The Clock
   - Act 10: Two Fruits, The Ring, Doubling
   - Act 11: The Pathogen
   - The appendix chapters (Food Web, Islands, After the Fire) stay demoted.

   The Tangled Bank G8 science sweep is also still due.
7. **GAME_BIBLE length.** It is about 7,200 words against the ~6,000 target. §4 (the legacy inventory) is the place to trim.
8. **Ask the designer** after they play:
   - Do the favourites keep what they loved?
   - Are the ghost jays honest?
   - Is any chapter still too complicated, or still too symbolic?
   - Where should the game be hosted?

## 5. How to continue (recommended)

**Session 5 plan (in order):**
1. **Collect the playtest feedback** from `docs/PLAYTEST_GUIDE.md` forms and apply it unit by unit. Fix the lowest fun or clarity scores first.
2. **Run external reviews** for tap, swamp, dig and the six new chapters, plus a fix round. Clear the science sign-off list (§4 item 3).
3. **Build the next legacy chapters.** Start with the spine unit The Coalescent, then Crossing Over, The Breeder (Fancier), Genetic Rescue (Castaways L2) and The Sweep, then the Act 7 and Act 8 chapters. Give each builder:
   - a WORLD line (a distinct organism, place, palette and accent)
   - `content.intro`
   - 3–4 levels, one verb, at most one prediction, and the key equation shown plainly
   - real organisms, not tokens
   - SCIENCE guard-rails from D3

   The `NEW` array in `tools/workflows/6_simplify_and_build_wave_a.js` is the template for these prompts.
4. **After every unit,** build into your scratchpad with `V2_ONLY`. At the end, do a full build, then run `sh tests/dup_globals.sh`, `lint_text`, every oracle and `monkey.py v2 1`. Ship `Endless_Forms_v2.html` only after that.

## 6. Key facts and gotchas

- **Build:**
  - `build.py` joins `core.js, hunt.js, ui.js, ch1…ch29, ch99, v2/*.js (sorted), boot.js` into one strict IIFE. A single syntax error breaks the whole game.
  - Default output is `source/Endless_Forms_v2.html` (gitignored). Ship with `python3 build.py ../Endless_Forms_v2.html`.
  - `V2_ONLY='0*,zz_*,<file>'` builds only the engine and one unit, so parallel agents don't break each other.
  - `v2_wip/` is never built.
- **Tests:**
  - `GAME_HTML=<built file>` points any test at a specific build.
  - Legacy auto-player limits are known and pre-existing: mendel and fancier time out; cross, landscape and double get stuck.
  - The text lint flags Equilibrium's 8 levels (D6 allows them).
  - `tests/smoke.py` is broken; use the monkey.
- **Rules that reviewers enforce** (lessons §0):
  - sim chapters, not Hunt mode
  - a run is (seed, level, actions)
  - juice only from sim events
  - predictions need a decision
  - no level offers all three stars
  - result text chosen from what happened
  - never show the answer during the ask
  - phone first
  - every science claim has a ref
- **Science:** check `docs/changes/` before "fixing" anything; an R7 fact-check overrides its review. Never say individuals "evolve", "choose" or "need".
- **Precedence:** designer > D6 > D5 > D1–D4 > API_v2 > CRITIQUE > reviews.
- **Duplicate globals:** every v2 file shares one IIFE. Prefix your top-level names with the unit id, and run `sh tests/dup_globals.sh`.
- **Opening card:** scripted tests must click `[data-play]`, or load with `?intro=0`. The card ignores taps for about 800 ms. The dock's first child is now "?", so select buttons with `[data-id]`.
- **Workflow scripts** from the sessions are in `tools/workflows/`:
  1. `1_critique_and_design.js`
  2. `2_science_sweep_wave1.js`
  3. `3_redesign_wave2.js` (the full original Wave 2)
  4. `4_continue_wave2.js` (session-1 continuation; now superseded: those units are built)
  5. `5_units_tap_royal_swamp_dig.js` (session 2: build, review and fix the four new games; reuse its review and fix stages)
  6. `6_simplify_and_build_wave_a.js` (session 3: the simplification pass and the six Wave A chapter prompts, in its `NEW` array)
  7. `7_session4.js` (session 4: finish the simplifications, build the six chapters, integrate, write the playtest guide)
- **Every session:** add a dated entry to `GAME_BIBLE.md` §13, update this file's §3–4 tables, and commit and push often. The stop hook demands a clean tree.
