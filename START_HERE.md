# START HERE: handoff for the next session

*Written 15 October 2026 at the end of session 1, when the designer's usage ran low and work was paused deliberately. Every finished piece of work is committed and pushed. This file is the status page; `GAME_BIBLE.md` is the full reference, and `CLAUDE.md` holds the coding rules.*

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

## 3. What has been done (session 1)

| Stage | Result | Where |
|---|---|---|
| Repo organised | `games/`, `docs/`, `archive/` (the original zip), `tools/workflows/`; test scripts portable | — |
| Expert reviews | R1–R8: four section critiques, two visual reviews (≈300 screenshots), technology, curriculum (101-concept coverage matrix), and four adversarial science fact-checks | `docs/reviews/` |
| Wave 1: science sweep | About 300 logged corrections across all 48 chapters and the Equilibrium game. Each set of corrections was reviewed by a second agent; all 48 chapters still behave as before | `docs/changes/science_sweep_G1–G7.md` |
| Design | D0 brief → D1–D4 (two rounds with an integrator) → D5 decisions → D6 designer decisions | `docs/design/` |
| Master critique | 16k words: verdict, 7 root causes, chapter verdicts, corrections table, roadmap | `docs/CRITIQUE.md` |
| Wave 2: engine | v2 plug-in engine (details below the table) | `source/v2/0*.js`, `zz_v1switch.js`, `core.js`/`ui.js` additions; contract in `docs/design/API_v2.md`; logs in `docs/changes/wave2/engine_*.md` |
| Wave 2, Batch 1 (gated) | **The Lichen Wood, The Black Country, Hawks and Doves, Equilibrium (HW, 8 levels), Drift Casino.** Each was built, reviewed (playtest/art, science, design), fixed and passed the release gate (node check, text lint, oracle, bots, monkey at 3 seeds and 2 sizes, console check, legacy goldens) | `source/v2/lichen.js`, `soot.js`, `hawks.js`, `mixer.js`, `casino.js`; logs `docs/changes/wave2/<id>.md` |
| Lessons | A coordinator fixed shared engine bugs and wrote rules for the next builders | `docs/changes/wave2/lessons_batch1.md` |
| Shipped files | `games/endless-forms/Endless_Forms_v2.html` (**play this**: legacy chapters plus the five v2 units); `Endless_Forms_v1.html` (classic, science-fixed); `games/equilibrium-hw/Equilibrium_HW_v2.html` (classic, science-fixed) | — |

The Wave 2 engine adds:
- `Det` bit-exact maths
- Save v2 with an adapter chain
- `Events` with CSV export
- `Fx` juice, `Ghost` hand, `Lbl`, `Live` region and `Pal` colour-blind-safe tokens
- `LiveGraph`, `Predict` and other widgets
- the entry and onboarding flow, and the act plan rewrite
- hunt extensions, creature rigs and scenes
- golden trajectories, text lint, bot sweep and oracle runner

**`?v1=1`** in the URL plays the untouched classic chapters.

## 4. What is NOT done: exact status of Batch 2+3

| Unit (id) | File | Status |
|---|---|---|
| Left Jaw, Right Jaw (`jaws`) | `source/v2_wip/jaws.js` | **Draft complete with its own tests; not reviewed or gated.** Kept out of the build in `v2_wip/` |
| The Forager (`forager`) | `source/v2_wip/forager.js` | Same as jaws |
| Bitter Wings (`bitter`) | `source/v2_wip/bitter.js` | Draft: sim and view written; tests and screenshots were mid-way |
| The Raffle (`raffle`) | — | Not started (spec D1 §3.5) |
| Alarm Call (`alarm`) | — | Not started (D1 §3.6) |
| The Clinic (`clinic`) | — | Not started (D1 §3.8) |
| Switches (`switch`) | — | Not started (D1 §3.9) |
| The Scribe (`scribe`) | — | Not started (D3 "Scribe") |
| The Leaky Tap (`tap`, new) | — | Not started (D3 "Leaky Tap") |
| The Royal Line (`royal`, new) | — | Not started (D3 "Royal Line") |
| Gene Swamping (`swamp`, new) | — | Not started (D3 "Gene Swamping") |
| The Dig (`dig`, new) | — | Not started (D3 "The Dig") |
| `docs/PLAYTEST_GUIDE.md` | — | Not written (D6 decision 4; the final-integration step writes it) |
| Tangled Bank science sweep (G8) | — | Not started; needed before Tangled Bank material is reused |

## 5. How to continue (recommended)

**Option A, one command (needs multi-agent orchestration enabled, e.g. the user says "ultracode"):**
run the saved workflow `tools/workflows/4_continue_wave2.js` with the Workflow tool (`scriptPath`). First edit its `ROOT` constant if the repo path differs (check with `pwd`; it may be `/home/user/endless-forms`). It:
1. builds the 12 remaining units. The three drafts are moved from `v2_wip/` into `v2/` and finished, not rewritten.
2. runs each through playtest, science and design reviews, then a fix round and a release gate.
3. ships `Endless_Forms_v2.html`, writes `docs/PLAYTEST_GUIDE.md`, updates this file and the bible, then commits and pushes.

To do a subset, pass `args: {only: ['jaws','forager','bitter']}`. It is long, roughly 50 agents, so check usage first. Doing the three drafts first is the cheapest high-value step.

**Option B, by hand, one unit at a time:**
1. `git mv source/v2_wip/jaws.js source/v2/jaws.js`
2. Read `docs/changes/wave2/jaws.md` and `lessons_batch1.md`.
3. Build: `V2_ONLY='0*,zz_*,jaws.js' python3 build.py /tmp/j.html`.
4. Run `node tests/oracle.js /tmp/j.html jaws` (see `docs/design/API_v2.md` §11 for the exact runner and lint commands), the monkey at 3 seeds, and look at screenshots.
5. Review the unit against D5 §3 (the 14-item checklist) and D6.
6. Commit.

**After Wave 2:**
- the designer and colleagues playtest (with `PLAYTEST_GUIDE.md`);
- act on their feedback;
- then Wave A: the remaining spine rebuilds (D2 §4 triage table, D3 specs), in tiers, gated by playtests;
- later: the TypeScript/Pixi spike, the teacher layer (LTI/SCORM, dashboard), and hosting.

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
- **Workflow scripts** from this session are in `tools/workflows/`:
  1. `1_critique_and_design.js`
  2. `2_science_sweep_wave1.js`
  3. `3_redesign_wave2.js` (the full original Wave 2)
  4. `4_continue_wave2.js` (the trimmed continuation)
- **Every session:** add a dated entry to `GAME_BIBLE.md` §13, update this file's §3–4 tables, and commit and push often. The stop hook demands a clean tree.
