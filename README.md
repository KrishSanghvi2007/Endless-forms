# Endless Forms

Browser games that teach undergraduate evolutionary biology by letting the player *cause* evolution (as the predator, the doctor, the breeder) and then see what happened and why. Designed by Krish Sanghvi (evolutionary biology, University of Oxford) with Claude.

The repo holds three games and the plan to merge them into one:

| Game | File | What it is |
|---|---|---|
| **Endless Forms** | `games/endless-forms/Endless_Forms_v1.html` | 48 short chapter-games in 11 sections, from Mendel to deep time |
| **Equilibrium** | `games/equilibrium-hw/Equilibrium_HW_v2.html` | A 17-level Hardy–Weinberg course plus Case Files |
| **Tangled Bank** | `games/tangled-bank/Tangled_Bank_v1.html` | The first prototype: hunt mode and Steward mode (you are the environment) |

The goal is one combined, enjoyable, scientifically correct game that teaches every concept through play and visuals, for professors and teachers to use. Expert reviews found most chapters too much like worksheets; a redesign is planned and has not been built yet.

## Play

Open any `.html` file above in a modern browser, on a phone or a desktop. Each game is one self-contained file: no install, no server. Progress is saved in the browser. (The files still load fonts from Google, so they look plainer offline.)

The shipped files date from 11 October 2026. About 300 science corrections made since then are in the source but not yet in these files. Rebuild them (below) to get the corrected versions.

## Where to read next

- **`GAME_BIBLE.md`**: the single reference for the project: vision, principles, every chapter's status and verdict, science fixes still to apply, art rules, build and test, roadmap, decisions log and open questions.
- **`docs/CRITIQUE.md`**: the master critique and improvement plan, condensed from all the reviews.
- **`docs/design/D5_design_decisions.md`**: the binding design decisions for the rebuild.
- **`CLAUDE.md`**: instructions for coding agents.

## Repo layout

```
games/endless-forms/   Endless_Forms_v1.html (shipped) and source/ (core.js, hunt.js, ui.js, ch1–ch29.js, ch99.js, boot.js, shell.html, build.py, tests/, v2/)
games/equilibrium-hw/  Equilibrium_HW_v2.html and source/ (engine.js, lv_a–lv_d.js, build.py, tests/); v1_archive/
games/tangled-bank/    Tangled_Bank_v1.html and source/ (core.js, hunt.js, steward.js, app.js, build.py, tests/)
docs/                  CRITIQUE.md, ORIGINAL_README.md, design/ (D0–D5), reviews/ (R1–R8), changes/ (science sweep logs), design-history/
archive/               the original upload
```

## Build

Each game is plain JavaScript drawn on an HTML canvas. `build.py` joins the source files into one HTML file. Run it from the game's `source/` folder:

```
cd games/endless-forms/source && python3 build.py ../Endless_Forms_v1.html
cd games/equilibrium-hw/source && python3 build.py && cp Equilibrium_HW_v2.html ../
cd games/tangled-bank/source  && python3 build.py ../Tangled_Bank_v1.html
```

Running `python3 build.py` with no argument writes `source/<Game>.html` and `source/game.js`. These are build outputs, ignored by git. Never edit a built file by hand.

## Test

Tests use Python and Playwright (Chromium):

```
pip install playwright pillow && playwright install chromium
cd games/endless-forms/source
python3 build.py                              # tests load source/Endless_Forms_v1.html by default
python3 tests/monkey.py lichen,hawks 1,2      # auto-play chapters (ids) with seeds; reports errors, NaN on screen, softlocks
GAME_HTML=/abs/path/to/build.html python3 tests/monkey.py jaws 1   # test a specific build
```

A virtual clock (`vclock.js`) runs minutes of play in seconds. Other scripts in `tests/` are model-calibration checks (`t*.py`) and screenshot generators (`shots*.py`).

## Licence

MIT (see `LICENSE`). The licence for the published app is still to be decided.
