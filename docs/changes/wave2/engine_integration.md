# Wave 2: engine integration

Role: integration engineer for the Wave 2 engine. I built the full game with every v2 file, fixed what broke between files, ran every gate, and wrote a throwaway chapter to prove the whole chain works. Contract: `docs/design/API_v2.md` (now with a §13 that lists where the code differs) and the package logs `engine_E1.md` … `engine_E7.md`.

## What I changed

| File | Change | Why |
|---|---|---|
| `v2/00_entry.js` (`Sim`) | `Sim.run` now returns the events of live `Sim.act` calls made since the last frame, before the step events. `Sim.act` still returns them, for inspection. | **Cross-file bug.** The skeleton, and every unit copied from it, juices from `Sim.run` and ignores `Sim.act`'s return. During a replay, actions are applied inside `Sim.run`, so their events came out there. Live, they were lost. A live peck showed no dust, no "+1" and no sound, while the replay of the same run did. Now there is one channel, and live and replay show the same juice in the same order. The replay and state tests in `selftest_e4` still pass bit for bit. |
| `v2/01_widgets.js` (`LiveGraph`) | `wgPcts`: shares are rounded by largest remainder in the pq bar, its table and its spoken summary, the tri table, the XHud table and the Predict read-out. | The pq bar read "A 48% · a 53%" (101%) in the integration run. A professor will notice that. |
| `boot.js` | An unknown `?lab=` id falls through to `?unit=`. | With `01_widgets.js` in the build, `?lab=x&dev=1&unit=casino` left the player on the title screen. That was E2's `url` self-test failure, put down earlier to "the URL run". |
| `tests/vmgame.js` | Selectors now match descendant (`' '`) and child (`'>'`) combinators. | The stub matched only the last part of a selector. So `'#sh-tabs button'` matched every button, and in Node boot gave `#btn-begin` a Notes-tab handler (E4's finding). |
| `tests/selftest_e2.js`, `tests/selftest_e2.py` | The menu check expects "Act 0" when `ACT_PLAN` is present ("I" without it). The timer run now removes the rAF shim. | The menu check was out of date once `00_entry.js` landed (E4, E5). With the shim in vclock, the timer run was testing rAF twice (E7). |
| `tests/selftest_e7.js` | The skeleton must lint clean. A planted long sentence must be caught. | The test used to *require* the skeleton's lint errors. |
| `docs/design/v2_chapter_skeleton.js` | Four sentences split to ≤ 18 words. Added a luminance encoding for the scored `dark` trait (hue lint). The pq ask uses `axis.rev`, so the ghost sits on the A\|a split (E5's finding). Transfer is now scored against the expectation, within the predict tolerance. Predict counts the first two asks, and the boss ask counts only for Transfer. Star lines updated. | Every unit starts from this file. Before: 5 lint errors, a ghost 10% off the split, and a random bot earning three stars on the boss (E7's finding). Now: lint clean, oracle 9/9, and no bot earns three stars on seeds 1–40. |
| `tests/selftest_integ.py`, `tests/fixtures/integ_fixture.js` (new) | The integration smoke and the throwaway chapter, built only into private copies of `source/`. They are never in `source/v2`. | So the next integrator can re-run this pass with one command. |
| `docs/design/API_v2.md` | Integration status line; `isV2` in §1.3; the Sim event channel in §6.1 and §9.1; the Predict gesture in §7.2; the monkey baseline in §11.1; new **§13**, which lists every difference, package by package. | "Update API_v2.md where reality differs." |

## Checks run on the full build (every v2 file; `wave2/integ.html`)

| Check | Result |
|---|---|
| `node --check` on every engine file and on the built `game.js` | clean |
| Load order: 18 partial builds (each v2 file alone, each 01/02 file with only the 00 files, `0*`, `01_*,02_*`, none), each loaded headless under `''`, `?v1=1`, `?dev=1`, `?teacher=1` and `?projector=1` | no load error in any of them. No two files export the same name, and no top-level code reaches a same- or higher-numbered file. |
| `python3 tests/golden.py check` | **48 ok** |
| `python3 tests/golden.py check --v1` | **48 ok** |
| `tests/monkey.py legacy 1` (390×780) on the full build | **46 of 48** reach the end card. `cross` and `landscape` are stuck: the known baseline. No errors. |
| The same on the pre-wave build `games/endless-forms/Endless_Forms_v1.html` | Every run fails the monkey's offline gate (that build loads Google Fonts). Behind the gate the statuses are **identical**: 46 end, with the same two stuck. **No new failures.** |
| `node tests/lint_text.js` | 0 errors, 0 warnings over all 10 engine files |
| `node tests/det.js` | matches `det_vectors.json` |
| Node self-tests `selftest_e1, e3, e4, e5, e6, e7` | 114, 156, 158, 282, 386, 78 passed; 0 failed |
| Chromium self-tests `selftest_e1_browser, e2, e3, e4, e5, e6, e7` | all PASS (E2: 152 of 152, after the fixes above) |
| `?v1=1` | golden 48 ok; smoke below; the deep link to a v2 unit is ignored; the legacy menu has numerals and ★ text |
| Size | 1,457 KB raw, **552 KB gzip** (D5 budget 700 KB). The pre-wave build was 262 KB gzip; embedded fonts are about 154 KB of it. |

## Smoke and the throwaway chapter (`python3 tests/selftest_integ.py`): 64 ok, 0 failed

- **Smoke** at 390×780 and 1280×720, with and without `?v1=1`: the title loads, a real click on Begin opens the menu ("Act 0 The Wood", or "I Heredity" under `?v1=1`), and a legacy intro card opens. No console errors or warnings, no error box, no NaN or undefined on any canvas, and no network requests.
- **Fixture** (`integtest`, at both sizes):
  - `V2.push` and `PLAN_ADD` register it. Its menu row plays level 0 at once, in the v2 layout, with no intro card.
  - `HUD.say` shows firstWords. Four real clicks eat four beetles, with Fx bursts, "+1" pops and dashed rings coming from `Sim.run`'s events.
  - At dusk a `Predict.ask` opens on the strip's pq chart. A real mouse drag moves the ghost to the expectation, and a click on the ghost commits through `Sim.act`. `Predict.reveal` puts the band on the expectation, and the prediction is sim state.
  - The level card opens with `lvl v2` and `data-stars="2"`, with Next level last and a drawn chart. The strip trace is inked. Next level plays level 1. The end card opens with `end v2` and `data-stars="3"`.
  - Saved: `Save.d.s2 = 7`, `lv = [3, 7]`, `stars = 3`, `done = 1`, all in `localStorage` `ef_v2`. After a reload the menu row reads "3 of 3 stars".
  - Events logged open ×2, ≥ 20 acts, predicts and level ×2. No `Lbl`, `Whisper`, `HUD`, `Dock`, chart or `Fx` warnings.
- **Monkey** on `skeleton,integtest` × seeds 1–3 × 390×780, 1024×768 and 1280×720 on a full build: **18 of 18** reach the end card.
- **Deep links** on a full build, at both sizes: `?unit=…&level=&seed=`, `?teacher=1`, `?projector=1`, `?cvd=deut`, `?lab=…&dev=1` and `?lab=nope&dev=1&unit=skeleton`. No errors.

## The engine: what is solid, what is weak

**Solid.**
- Legacy is provably frozen: golden 48/48 in both modes, and monkey parity with the pre-wave build.
- Determinism holds end to end. Det is bit-exact across Node, Chromium and a Python port. A run is (seed, level, actions). Replays reproduce the whole state through the frame loop, and snapshots thaw into What if? runs.
- Every package has its own self-test, about 1,170 Node and 270 browser checks, and all pass together in one build.
- Partial builds never break, so units can still be built in parallel.
- The game is fully offline and inside the size budget.

**Weak, in order of risk.**
1. **Hunt-mode v2 chapters have no replay, Freezer, What if? or bot sweep.** Hunt state is not a Sim snapshot. The favourites (Lichen, Black Country, Bitter Wings, Leaky Tap, Gene Swamping) are Hunt chapters, so D5's "What if?" and bot gates cannot yet be met for them.
2. **Contract drift.** Each package deviated sensibly, but §13 is now long. The Sim event bug shows that the skeleton, the contract and the code can disagree without any test noticing. Unit agents should copy the skeleton, which is now clean, and read §13.
3. **Predict on a phone.** A tap within 24 px of the ghost commits, so a small nudge needs a drag or the arrow keys. The strip that expands for an ask covers the canvas for 1.5 s after the commit, and taps in that window land on the strip. Both work, but playtests should watch for them.
4. **Not built yet:** a settings screen (Calm, Readable, untimed and left-hand exist in the save, with no toggle); act locks from `needs`; the station map; the axe-core pass (D5 gate 11); an enforced 70-words-per-screen rule; `Events.lat()` assertions; the FCR-8b DOM label layer.
5. **Hard to maintain.** `01_widgets.js` is 127 KB in one file, and much of the engine is written in long dense lines, which makes it hard to review. The vm DOM stub is an approximation; E2's and E4's browser runs cover what it cannot.
6. E3 saw one unexplained golden divergence (`soot`, step 1300) under heavy load, and it never recurred. It did not appear in this pass.

## Notes for unit agents
- Juice from `Sim.run`'s events only (§6.1). Copy the skeleton as it is now.
- Use `isV2(ch)`, never `ch.v2`.
- Run `python3 tests/selftest_integ.py` and the golden check after any change to an engine file.
