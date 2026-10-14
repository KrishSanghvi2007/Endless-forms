# Wave 2, work package E3: look, juice and maths plug-ins

Files (owned): `games/endless-forms/source/v2/00_tokens.js`, `v2/00_cvd.js`, `v2/00_fx.js`, `v2/00_wf.js`.
Tests (new, E3's own, as API_v2 §2 asks): `tests/selftest_e3.js` (Node vm), `tests/selftest_e3.py` with `tests/selftest_e3_page.js` (Chromium).

Contract: `docs/design/API_v2.md` §5 (with §1 ground rules), D5 decisions 13–19 and 21–24, D4 §1.3, §2, §3, §5, §7, §8. Everything in §5 is in. Where I differed from the contract, it is listed under "Deviations".

## What I built

| File | Module | What it does |
|---|---|---|
| `00_tokens.js` | `Pal` | D4 §2.3 tokens are injected as `<style id="ef-tokens">` under the `--v-` prefix (Dusk on `:root`, then `[data-theme=paper]`, `[data-theme=projector]`), plus `--v-line-<role>` and `--v-place-<id>`. There are getters for `A a sel drift mut mig ink paper text text2 ground surface accent ochre`. `Pal.line(role)` gives Paper's darker line ink (in Dusk it equals the fill). `Pal.place(id)` covers D4's 16 places and 2 layers. Painted grounds are dimmed ×0.88 in Dusk; the Lab and Expeditions plates are not. `Pal.setTheme(t)` sets `data-theme` and `Save.d.ui.th`. `Pal.allele(i)` gives 4 fills × 3 overlays with letters A–L, the letter ink (white or ink, whichever has more contrast) and the outline. `Pal.token` draws a disc with a 1.5 px outline and a letter only when r ≥ 7. Overlay tokens get a plain field under the letter. `oneCopy` adds the 3 px bar, with Y/W from 20 px. `Pal.genotype` draws a split disc (a1 left, a2 right). An absent copy (−1) gives one token with the bar. Colour helpers: `rgb hex mix lum contrast oklab okd rgba nearest`. |
| `00_tokens.js` | theme adapter | `applyTheme` is wrapped (inert under `?v1=1`). A v2 chapter gets no legacy theme, and the ground of `Pal.place(ch.place)` goes behind its canvas (`#scr-play[data-place]`, `--v-place`). Inside `#scr-play.v2`, the shell's own variables (`--cab --cab2 --paper --paper-dim --ink --line`) follow the v2 tokens, so the bar, HUD, strip and dock stay readable in Paper and Projector. A legacy chapter with a theme gets the nearest place ground as its chrome `--cab`, plus `--cab2` mixed 8% toward its text. This only happens when its own text still clears 4.5:1 on both; otherwise nothing changes. |
| `00_cvd.js` | `CVD` | `apply(kind)` puts an SVG `feColorMatrix` over the game: Machado 2009, severity 1.0, in linear RGB, for deut, prot, trit and mono. It runs at load from `Url.cvd`. `sim(rgb, kind)`. `dE` is CIEDE2000, checked against Sharma, Wu & Dalal (2005). `pairs(encodings)` returns the colour-only pairs that fall under ΔE 8 in normal vision or any of the three simulations. The extra lints are `hue(ch)` (star traits with no non-hue channel), `gamut(paints)` (natural paint within ΔE 8 of a data ink in either theme), `agree(c1, c2, kind)` (D4's ≥ 0.9 moth–bark agreement) and `lint(ch)`. |
| `00_fx.js` | `Fx` | `tween` (eases `linear`, `out` cubic, `inout` cubic, and `spring` with k 170, c 22 from a pre-integrated table, 0.7% overshoot). `burst` has five kinds: dust, scale, spark, droplet, egg. The pool holds 150, or 300 on desktop and projector. `pop` gives ≥ 16 px mono bold ink on a paper pill with a vector ▲/▼; it rises 24 px over 700 ms and fades from 400 ms; numbers within 150 ms and 28 px merge. `ring` is a 400 ms solid ripple or the dashed 2 s "gone" ring. `shake` is two cycles, at most one per 600 ms, scaled to the stage, and off in Calm. `hitstop`. `tier` gives 160, 600 or 1200 ms; a T3 within 3 s, or a T3 in Calm, gets 300 ms. The governor steps after 30 frames over 20 ms of update + draw: it halves particles, then drops squash (`Fx.squash`), then enters Calm. `calm` is true for `Save.d.ui.calm`, `prefers-reduced-motion`, dev `?calm=1` or the governor. `rnd` is a cosmetic PRNG reseeded from `App.seed` on every play. Also `flash` (see deviation 9). It registers `Hooks.pre` (shake), `Hooks.frame` (update, draw, ghost, sound-twin check, governor), `Hooks.dt` (hit-stop), `Hooks.play` and `Hooks.exit`. |
| `00_fx.js` | `Layer` | `Layer(w, h)` returns `{cv, c, w, h, redraw(fn), blit(c, x, y), resize(w, h), dots(pts, o)}`. DPR is capped at 2. `dots` draws one path per fill and warns above 2,000 dots. |
| `00_fx.js` | `Ghost` | `show({verb, at, to, until, key, say, pop, force})` returns `{hide(), active, shown}`. It runs a 3 s loop every 4 s: enter from the bottom edge (600 ms), travel on a bezier (400 ms), pause 150 ms, then press (scale 0.85, ripple 200 ms). The consequence step is the chapter's `pop(c, k)` or a ring. Then it fades. A pulsing ring (1.2 s) marks the target. There are distinct paths for tap/toggle, drag/slide/draw/sweep (with a dashed trail) and hold/pour (with a fill ring and drips). The hand is a 60 × 72 px paper-and-ink glyph, baked once and drawn at 60% opacity, and it never shakes. Calm shows a static arrow and ring. A keyboard player sees a key cap. The first pointer or key input or `until()` hides it. It is shown once per verb per profile (`Save.d.ui.verbs`), comes back on `?`, and is off in teacher mode and under `?v1=1`. Each show writes one line to the live region. |
| `00_fx.js` | `Lbl` | `put(id, text, x, y, o)` returns its box. Defaults: 14 px, a paper pill with ink text, 600 weight. A size under 12 is drawn at 12 and warns; over 3 words warns. Projector sizes are max(×1.4, +8) (14 → 22, 12 → 20). Width measurements are cached. `Lbl.list` holds the current frame's labels, for FCR-8b's DOM layer and for tests. |
| `00_fx.js` | `Live` | `say(text)` writes to `#live` (E2's polite region), at most one line per 3 s. A newer pending line replaces the older one, and a repeated line is still announced. |
| `00_fx.js` | `Whisper`, `toast` | `say(text, key)`. While a v2 chapter plays, a whisper takes one slot in E2's in-canvas `#whisper`, replaces the previous whisper, lasts 2.4 s, is hidden under end and level cards (E2's CSS), and over 8 words it is logged in `Whisper.warnings`. The rebound `toast` sends every legacy and shell toast through it (skipped under `?v1=1`), with legacy HTML allowed. On the menu and in legacy chapters, see deviation 11. Each whisper is also written to the live region. |
| `00_fx.js` | `Txt` | `f('{n} of {m}', vars)`: integers as they are, other numbers to 2 decimals; a missing value leaves `{n}` visible and warns. `words` counts a placeholder as one word, ignores dashes and strips HTML. `strip`. |
| `00_fx.js` | `Snd2` | The twelve D4 §5.2 voices (`sieve tick dusk wing count interesting tock scale peep crack swish pour`) on `Snd.ctx`. `count` takes `o.i` (+1 semitone per tick) and `pour` takes `o.left` (330 Hz sliding to 262 Hz). At most 3 voices; they follow `Snd.on` and are muted in projector mode. Noise comes from a seeded buffer, never `Math.random`. Visual twins: pass `{x, y}` and the sound draws its own twin (for example `scale` gives six flakes, `tock` a 14 px ring, `dusk` a corner dim); otherwise any `Fx` call within 250 ms counts. A sound with no twin goes into `Snd2.warnings`. `buzz(kind)`: haptics patterns tick 8, hit 18, cost 2×25 and star 10-20-30 ms; opt-in through `Save.d.ui.hap` and off in Calm. |
| `00_wf.js` | `WF` | `binom` is exactly the §5.4 algorithm: inversion with one `R()` when n·p < 30, a rounded normal with `Det.gauss` (two draws) above that, and the p > ½ symmetry. `multinom` (conditional binomials in index order; zero weights get nothing), `hyper` (one draw per item), `sample` (partial Fisher–Yates), `step` (weights, then `o.mu` or `o.M`, then multinom), `run` (rows 0…gens, `o.stop`), `freqs`. Ghost-only functions (`Math.exp` allowed there and nowhere else): `kimura(p0, Ne, s, ploidy = 1)`, `neutral`, `decay(H0, Ne, t, ploidy = 1)`, `absorb(p0, Ne, ploidy = 1)`. |

Exports via `EXPORT` (so on `window.TB`): `Pal CVD Fx Layer Ghost Lbl Live Whisper Txt Snd2 WF`, plus `Snd` and `toast`, which calls whatever `toast` is bound to, for tests.

**Rules kept.**
- Nothing calls `R()` except `WF`.
- Every frame hook returns at once for a legacy chapter, and `Hooks.dt` passes legacy `dt` through untouched.
- `00_fx`, `00_tokens` and `00_cvd` contain no `Math.exp/log/pow/sin/cos/random`. They use Det, tables, polynomials and their own atan2 instead. `00_wf` uses `Math.exp` only inside `WF.ghost`.
- There are exactly two `fillText` calls: `fxText` in `00_fx.js` (Lbl, pops, key caps) and `Pal._glyph` in `00_tokens.js` (token letters). `lint_text.js` checks `fillText` only in chapter files, so engine files need no exemption.
- The colour metrics (`Pal.oklab`, `CVD`'s CIELAB) use `Math.cbrt` and are marked `// cosmetic`, which E7's lint honours.
- Top-level code touches only legacy objects (`Hooks`, `Url`, `Save`, `EXPORT`, `applyTheme`, `toast`). Cross-file names are used only inside functions, behind `typeof` guards.

## Deviations from API_v2 (and why)

1. **`Pal.allele(i)` returns an object** `{fill, overlay, over, letter, text, outline}`, not a bare fill. Its `toString()` returns the fill, so `c.fillStyle = Pal.allele(i)` still works for callers that expect a colour.
2. **`Pal.place(id)`** also returns `raw` (the undimmed hex) and `plate`. `ground` is the colour for the current theme. An unknown id falls back to the Lab.
3. **Legacy theme adapter.** Plain OKLab distance sent every dark legacy cabinet to the Warren, because every legacy cabinet is darker than every place ground. So the adapter works like this:
   - A light cabinet (L > 0.8) maps to the Lab plate.
   - Any other cabinet matches a painted ground by hue, with lightness weighted 0.1.
   - The change is applied only if the chapter's own text keeps ≥ 4.5:1 against both the new `--cab` and `--cab2`.

   Result for the 47 themed legacy chapters: 35 map to Lab, 6 to Outer Islands (navy: scribe, sex, jaws, gametes, spindle, river), 4 to Warren (soot, bats, brood, virulence) and 2 to Pond (casino, bitter). The worst text contrast is 5.6:1. Chapters with no theme (the lichen hunt) keep the Dusk cabinet. Only CSS changes. The canvases are untouched, so the golden check cannot see it.
4. **Chrome remap.** `#scr-play.v2` maps the shell's legacy variable names onto the `--v-` tokens. Without this, the Paper theme would put the shell's light text on paper.
5. **The theme does not follow `prefers-color-scheme`.** `Save.d.ui.th` defaults to `'dusk'`, so a saved choice cannot be told apart from the default. The order is: `?projector=1`, then dev `?theme=`, then `Save.d.ui.th`. A settings toggle (E2/E4) can call `Pal.setTheme`.
6. **CVD filter scope.** The filter covers `#app`, `#cards`, `#toasts` and `#sheet`, a superset of `#stage, #strip, #cards`, so the bar, HUD and dock are simulated in `mono`/`deut` screenshots too. It also works under `?v1=1`, because it is an opt-in preview.
7. **`CVD.pairs`** returns failures only (`{all: true}` returns every colour-only pair). A shared shape, pattern, letter, marker, size, position or motion channel separates a pair. A shared `luminance` channel counts only if ΔL* ≥ 8 in all four vision types. Distances are CIEDE2000 as the API says; D4 measured in OKLab ×100. The threshold is 8 in both.
8. **`Fx.clear()`** with no argument clears everything. The `Hooks.play` path clears only what was made before the new level began (an "epoch" that advances on every frame and on every pointer, key or click event). This matters because `App.play` calls `mode.start` before `Hooks.play`: effects, ghosts and whispers that `startLevel` creates survive, and the previous level's do not.
9. **Additions:**
   - `Fx.flash(o)`: at most two bright flashes a second (WCAG 2.3.1), none in Calm. `{edge: true}` darkens the corners by luminance (the Bitter Wings cost) and is not a flash.
   - `Fx.squash`, `Fx.count`, `Fx.cap()`, `Fx.govern(ms)`, `Fx.EASE`, `Fx.epoch`, `Fx.lastInput`, `Fx.errors`.
10. **Timing details:**
    - In Calm, `Fx.tier` returns `min(ms, 300)`, so T1 stays at 160 ms.
    - Hit-stop also freezes particles and tweens.
    - The governor measures update + draw time (from the `dt` hook to the frame hook), not the frame interval, which is a fixed 40 ms under vclock. Its Calm lasts for the session only and is never saved.
    - Tweens keep running while a card pauses the stage, through a small rAF pump, so count-ups on cards work.
11. **Whisper outside v2 chapters.** On the menu and in legacy chapters the single slot sits where the old toasts did: in `#toasts`, above cards.
    - Lines queue (up to three) instead of replacing each other, so no legacy teaching toast is lost.
    - Each line shows for max(3.2 s, 1.2 s + 0.32 s a word), capped at 8 s, never shorter than the old toast's 3.2 s.
    - The 8-word warning applies only while a v2 chapter plays.

    Under `?v1=1` the legacy toast function is untouched.
12. **Ghost:**
    - The verb bit is set when the demonstration is shown.
    - `?` replays it through a keydown capture listener; the help card still opens.
    - A 400 ms delay lets the scene appear first; the hand enters well within 3 s.
    - The default live-region line is engine text ("Demo: tap the ringed spot."). A chapter overrides it with `o.say`.
    - `o.key` enables the key cap, and `o.pop(c, k)` draws the chapter's own consequence.
13. **Snd2:** `o.x, o.y` draws the twin. `Save.d.ui.cc` (a new optional ui field, stored only when set) adds a caption chip.
14. **WF:**
    - `binom` with n ≤ 0 returns 0 without a draw.
    - `multinom` normalises its weights.
    - `run` returns gens + 1 rows, starting with generation 0.
    - `step` accepts a weight function and defaults N to the current total.
    - The ghosts take an explicit `ploidy` (default 1, haploid; Ne counts individuals), and there is an extra `absorb` ghost (the Casino's 1.39N).

## Test results

| Test | Result |
|---|---|
| `node --check` on the four files and the two test scripts | clean |
| `node tests/selftest_e3.js` | **156 passed, 0 failed.** Covers: WF draw counts, matching the spec text draw for draw, binomial mean, variance and exact pmf, multinom, hyper, sample, step and run, neutral fixation = start share, absorption time ≈ 1.39N, Kimura fixation for one new beneficial copy (20,000 runs), heterozygosity decay, and no transcendental `Math` outside the ghosts. Pal: themes, line inks, places and dimming, D4's measured contrasts re-checked (Dusk inks ≥ 5.2:1, text 12.5/13.7:1, every ground ≥ 4:1 against ink or paper outline), alleles, tokens and genotypes on a recording canvas, CSS. CVD: atan2 within 1e-14, 11 Sharma CIEDE2000 pairs to 1e-4, grey invariance, the Paper fills pass all 15 pairs in every simulation, the lizard throats fail by colour alone under deuteranopia and pass with a pattern, and the hue, gamut and agreement lints. Fx: tweens, spring overshoot, the no-`R()` guarantee, caps, the three governor levels, tiers, the shake and flash limits, hit-stop, Calm, pop merging, legacy pass-through, epoch clearing. Lbl warnings and the projector size, the Live rate limit, the Ghost verb bits, `until`, Layer, Snd2 twin warnings, the toast rebind (and its absence under `?v1=1`), and the source rules. |
| `python3 tests/selftest_e3.py BUILD` (Chromium, virtual time, network blocked) | **PASS.** core 34/34, cvd deut 2/2, cvd mono 2/2, v1 3/3, desktop 3/3, perf 1×, perf 4× |
| D5 §2 performance gate (cached 2,000-dot layer + 150 moving scale flakes, DPR 2, software canvas, flushed) | **1.4 ms a frame at 1×, 7.0–8.2 ms at a 4× CPU throttle.** D4 measured 5.9 ms on its machine. Before I baked the particles into sprites (pre-rotated flakes) it was 14.9 ms at 4×. |
| `python3 tests/golden.py check` on `V2_ONLY='00_tokens.js,00_cvd.js,00_fx.js,00_wf.js'` | **48 ok** (final build), and **48 ok with `--v1`**. An earlier build also gave 48/48 and 48/48. One intermediate run under heavy parallel load (two monkeys and screenshot jobs at once) showed a single `soot` divergence at step 1300 in the background texture's size-dependent `tg`. It did not reproduce in four reruns, including one under a 4-core CPU burn. The change between those builds was v2-only drawing code. I could not find a mechanism and record it as a harness flake to watch. |
| `tests/monkey.py` on all 48 legacy ids (seed 1), plus 14 favourites and others on seed 2 with the final build | **45 of 48** reach the end card. `cross`, `landscape` and `double` are stuck, which is the known baseline. 14 of 14 on seed 2. |
| `tests/selftest_e2.py` (E2's shell test) on my build | **PASS** (all 7 runs) |
| `node tests/lint_text.js BUILD` (E7) | **0 errors, 0 warnings** on all four files. Before I marked the two colour-metric functions `// cosmetic` it gave 4 `Math.cbrt` warnings. |
| `tests/vmgame.js` (E7's Node loader) on my build, with no query, `?v1=1` and `?cvd=deut&projector=1` | loads with no errors; all modules present; WF and Pal work headless |

Screenshots for visual review are in my scratchpad (`wave2/e3/vis_{dusk,paper,calm,deut}.png`). They show tokens, genotypes, the 12-allele set, labels, pops, rings, the five particle kinds, the ghost hand mid-press, the Calm arrow and the deuteranopia filter.

## Notes for other packages

- **E4:** `Ghost.show` returns an inert handle (`shown: false`) when the verb is already known, in teacher mode or under `?v1=1`. `Fx.tween(obj, {v: n}, 600, 'out')` works for count-ups on cards. E2's CSS already hides `#whisper` under any open card.
- **E5:** `Pal[role]` and `Pal.line(role)` for chart inks. `Pal.allele(i)` stringifies to its fill. `Pal.token` and `Pal.genotype` for jars and lenses. `WF.step` and `WF.run` for Invasion. Pass `Pal.theme` to `LiveGraph` (E2's strip already does).
- **E6:** `Layer` for crowds and egg trays. `Fx.squash` tells rigs when to drop squash-and-stretch. `Fx.burst('egg' | 'scale' | …)`. Use `Fx.rnd()`, never `R()`, for cosmetic jitter.
- **E7:**
  - The lint already passes: `WF.ghost` is marked `ghost-only`, and the colour metrics are marked `cosmetic`.
  - The monkey should fail on `Lbl.warnings`, `Whisper.warnings` and `Snd2.warnings` (each holds v2-context entries only).
  - `Fx.errors` should stay empty.
- **Architect:** deviations 1, 3, 8, 11 and 14 change behaviour the contract describes; please fold them into API_v2 §5.
