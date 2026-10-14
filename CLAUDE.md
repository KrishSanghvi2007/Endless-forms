# CLAUDE.md

Evolution teaching games (Endless Forms, Equilibrium, Tangled Bank) being merged into one game, *Endless Forms*.

## Read first
1. `GAME_BIBLE.md`: state, rules, next steps. Start at §10 "NEXT SESSION: start here".
2. `docs/design/D5_design_decisions.md`: binding build rules; §3 is the acceptance checklist.
3. Open other `docs/` files only when the bible points you there. Precedence: designer > D5 > owning D-doc > CRITIQUE > reviews.

## Commands (run build.py from the game's source/ folder)
```
cd games/endless-forms/source && python3 build.py                       # -> source/Endless_Forms_v1.html + game.js (gitignored)
cd games/endless-forms/source && python3 build.py ../Endless_Forms_v1.html  # rebuild the shipped file
cd games/equilibrium-hw/source && python3 build.py && cp Equilibrium_HW_v2.html ../
cd games/tangled-bank/source && python3 build.py ../Tangled_Bank_v1.html
python3 tests/monkey.py lichen,soot 1,2,3                                 # from source/; ids and seeds
GAME_HTML=/abs/path.html python3 tests/monkey.py jaws 1                   # test a specific build
```
Playwright: `p.chromium.launch(executable_path='/opt/pw-browsers/chromium')` in the cloud sandbox (test scripts detect it). `tests/smoke.py` is broken (`fSRC` NameError); use the monkey.

## Rules
- Never hand-edit a built HTML file or `game.js`. Edit source, run `build.py`, test, then update the shipped file deliberately.
- Redesigned or new Endless Forms chapters go in `source/v2/` (one file each), registered with `V2.push(CH_X_V2)`; brand-new ids also need `PLAN_ADD.push({...})` (see `ui.js`). Never redeclare an existing `const`: one IIFE, one SyntaxError breaks everything.
- Don't rewrite legacy `ch*.js` to redesign; `?v1=1` must keep v1 playable. Shell edits to `core.js`/`ui.js` stay additive.
- v2 code: `sim` with plain-JSON state, seeded `R()` only, `Det` maths between random draws and scores, words in one `content` object, text budget per D4.
- Keep the science honest. Check `docs/changes/` before "fixing" anything. Follow D0 §3: tag unrealistic parameters ×N, give contested ideas no star, never say individuals "evolve", "choose" or "need". Use only sourced data. Log every science change in a `docs/changes/` sweep file.
- The player is never the organism dialling its own heritable trait (bible §3).
- Test every change: monkey the touched chapters at several seeds (all 48 for shell changes) with no errors, NaN or new stuck states. Run calibration scripts for model changes.
- Every session: add a dated entry to the bible's decisions log (§13), tick its checklists (§6, §10) and keep it under ~6,000 words. Record designer decisions only when the designer made them.
- Scratch builds and screenshots go in your scratchpad, not the repo.
