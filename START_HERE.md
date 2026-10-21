# START HERE: handoff for the next session

*Updated 21 October 2026 at the end of session 2 (first written 15 October at the end of session 1). Every finished piece of work is committed and pushed. This file is the status page; `GAME_BIBLE.md` is the full reference, and `CLAUDE.md` holds the coding rules.*

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
   GAME_HTML=/tmp/ef.html python3 tests/monkey.py lichen,soot,hawks,census,casino 1
   ```
   Each should report `"status": "end"`. In the cloud sandbox, Playwright needs `executable_path='/opt/pw-browsers/chromium'`; the test scripts detect this themselves.

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
2. Hardy–Weinberg is **one chapter**, "Equilibrium" (id `census`), with 8 levels of rising conceptual complexity. It is built: `v2/mixer.js`.
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

**Shipped:** `games/endless-forms/Endless_Forms_v2.html`, rebuilt from all v2 files.

## 4. What is NOT done

1. **Reviews for the four new games.** Apply `royal_review_pending.md`. Then run the playtest and science review and a fix round for `tap`, `swamp` and `dig`; `tools/workflows/5_units_tap_royal_swamp_dig.js` has the review and fix prompts. All four still need the D5 §3 release gate on the full build.
2. **Science sign-off items flagged by builders** (see each log's "needs sign-off"):
   - Alarm: the numbers in Sherman 1985 and Hanken & Sherman's 78%.
   - Scribe: the Sanjuán 2004 DFE split and the Jónsson 2017 figures.
   - Jaws: Kusche 2012, Boileau 2015 and the Lee 2015 diet wording.
   - Switches: the Averof & Patel 1997 species.
   - Casino: Kolbe 2012 and Censky 1998.
3. **`docs/PLAYTEST_GUIDE.md`** for the designer and colleagues (D6 decision 4). Each unit log already ends with a playtest script, so collate them.
4. **Engine requests** collected in unit logs:
   - Predict "set" kind
   - the phone strip left open when a sim closes its own prediction
   - the card's "still to earn" naming a star already earned
   - a Petri palette option
   - a forest place in `00_tokens.js`
   - the boss card's y-axis title overlapping a tick
5. **File size.** Most units are 100–130 KB raw against a ~90 KB guide, and the full build is about 3.5 MB. Consider compressing art or fonts before hosting.
6. **Next content (Wave A, D2 §4 triage):** rebuild the remaining legacy chapters in tiers, each in its own world with an intro card. Next in line are the spine units: Tree Thinking, Mendel, Crossing Over, Why Sex?, The Commons, The Coalescent, The River, The Archipelago, then the rest. The Tangled Bank G8 science sweep is also still due.
7. **Ask the designer** after they play: do the favourites keep what they loved? Are the ghost jays honest? Should the guessable prediction questions be replaced (Bitter Wings island C, Switches L6)? Where should it be hosted?

## 5. How to continue (recommended)

1. **Bring the branch in** (§0). Build, then run `sh tests/dup_globals.sh` and the monkey on the 17 v2 ids.
2. **Finish item 1 of §4.** It is cheapest per unit; use parallel agents, one per unit, each with a playtest/art reviewer, a science reviewer and a fix round.
3. **Write `PLAYTEST_GUIDE.md`.** Ship `Endless_Forms_v2.html` and send it to the designer.
4. **Start Wave A** with a creative brief per unit: a distinct world, intro card text, D1 template, and the lessons file. The session-2 prompts (in this handoff's git history, and in `tools/workflows/`) are good templates: give each builder a WORLD line and SCIENCE guard-rails.

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
- **Every session:** add a dated entry to `GAME_BIBLE.md` §13, update this file's §3–4 tables, and commit and push often. The stop hook demands a clean tree.
