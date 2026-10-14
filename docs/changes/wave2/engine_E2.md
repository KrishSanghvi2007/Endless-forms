# Wave 2, work package E2: the shell (`ui.js`, `shell.html`, `boot.js`)

Files: `games/endless-forms/source/ui.js`, `shell.html`, `boot.js` (owned), plus the new self-test `tests/selftest_e2.js` (the in-page suite) and `tests/selftest_e2.py` (its Chromium runner).

Contract: `docs/design/API_v2.md` §4, with D5 §5.3, D4 §3, §6.1, §7 and §8. Everything in §4 marked [B0] or [B0-simple] is in. Two items marked "by B1" are in as well: the Greek and symbols font pack and the Readable pack.

## Read this first: test `ch.v2 === true`, never `ch.v2`

Legacy `CH_NEST` (`ch11.js`) uses `this.v2` as a visit counter. It is 0 at first, then 1 to 12 during level 2, and it stays at 12 for level 3, the end card and any replay. So any check written as `if (ch.v2)` treats The Nest as a v2 chapter halfway through a run. My first draft did exactly that: on a resize, the Nest switched to the v2 layout, the stage shrank from 709 px to 548 px, and the golden check failed at step 850. E1's log reports the same failure from that draft.

- `ui.js` now defines `const isV2 = ch => !!ch && ch.v2 === true;` (also `EXPORT.isV2`). Every shell path uses it.
- **Every package needs the same rule.** API_v2 §1.3 says every wrap starts `if (!ch.v2) return orig…`. For The Nest, that wrap would fire. The worst cases are E4's `End.show` wrap (the Nest's end card comes after level 2) and E4's `App.open` wrap (a replay starts with `v2 = 12`). E3's `00_tokens.js` already uses `isV2`. **Architect:** please change §1.3 and §9 to `ch.v2 === true` or `isV2(ch)`. The golden check catches the misfire in `nest`.
- `tests/selftest_e2.js` has a regression case for this.

## What I built

| Area | API | Notes |
|---|---|---|
| Plumbing | `EXPORT`, `Hooks {pre, frame, dt, play, exit, key, chart, chartPointer}`, `runHooks` | `runHooks` catches a hook that throws, reports it once with `showErr` and drops it from the list, so a bad plug-in cannot stop a chapter. A `Hooks.dt` result is used only when it is a number ≥ 0. |
| URL | `Url {q, unit, level, seed, teacher, projector, locks, cvd, lab, v1, dev, theme, calm, link(o), lock(unit, key, def)}` | Parsed once by hand, with no `URLSearchParams`, so it also runs in a Node `vm`. With no `location`, every field takes its default. `dev` is true for `file:` or `?dev=1`. `theme`, `calm` and `lab` are read only in dev builds. `link` puts unit, level and seed first, writes `true` as 1, drops null or false values, and writes locks as `k:v,k:v`. |
| `App` | `seed`, `playLevel(ch, n, o)`, `play(ch)`, `exit()`, `go(scr)` | `play` follows §4.2. It reads and clears `App._o`. The seed comes from `o.seed`, else `?seed=` when `?unit=` names this unit, else a fresh seed for v2. A legacy run is not reseeded. Then it calls `mode.start(ch, o)` (a legacy chapter gets `start(ch)` exactly as before), then `Hooks.play`, then `Events.emit('open', {level})` (guarded). `exit` runs `Hooks.exit(ch)`. `go` clears the v2 layout on every screen except play. |
| Frame loop (FCR-2) | `frame()` | Same body and the same `dt` formula. It runs on `requestAnimationFrame`. Order: setTransform; if live, `Hooks.dt`, then `update` (called `Teacher.speed` times for v2 only); if still live, `Hooks.pre`, `draw`, `Hooks.frame`; then the 2 Hz strip poll (v2 only). |
| `Stage` | `u` (getter), `layout`, `zones {hud, thumb, graph}`, `rezone()`, `hit(x, y, pts, rmin = 22)` | These are added to the `core.js` object from `ui.js`. `Stage.resize` is wrapped: it re-applies the v2 layout class first, then runs the legacy resize, then recomputes the zones. `zones.graph` is the part of the canvas that the expanded phone strip covers, else null. |
| v2 layout (FCR-1) | `Layout.kind/apply/clear`, `body[data-layout]`, `#scr-play.v2` | All five classes, from CSS grid only. Phone portrait: bar 48, canvas, strip 112, dock 72; at 390×780 the canvas is 548 px. Tablet portrait: the same with a 200 px strip. Desktop: canvas 7/12, with strip and dock in the 5/12 column, max width 1,600. Phone landscape (w > h and h < 600): 62/38. Projector: 60/40. The HUD line overlays the top 56 px of the canvas. Legacy chapters keep the 560 px column. |
| HUD | `HUD.say(text, num)`, `HUD.warnings` | Builds `#hud-say` on first use and writes to the DOM only when the text changes. In dev builds, lines over 15 words go into `HUD.warnings`. |
| Dock | `Dock.set(buttons)`, `Dock.update(id, patch)`, `Dock.key(k)`, `Dock.warnings` | Buttons: `{id, label, key, fn, primary, disabled, why, busy, pressed, aria}`, or `{id, el}` for a ready-made control such as `GenePoolLens.control()`. A disabled button gets `aria-disabled` and stays focusable; tapping it shows `why`. FCR-5: when every choice is disabled, all of them show a busy sweep, never grey together. Focus survives `set` and `update`. Key hints show as `<kbd>`, hidden on touch screens. In dev builds, labels over 2 words go into `Dock.warnings`. |
| Strip | `Strip.redraw()`, `Strip.canvas(i)`, `Strip.open(bool)`, plus `poll`, `reset`, `toggle`, `showData` | Polls `App.mode.notes()` at 2 Hz for v2 chapters only, including while paused, and never sets `App.paused`. A typed spec is drawn by `Hooks.chart(cv, spec, theme)` and skipped when `LiveGraph.sig(spec)`, the theme and the canvas size are all unchanged. A legacy spec is drawn by `spec.draw(cv, 'paper')` on a paper plate. "Show data" opens the stats table plus `LiveGraph.table(spec)` for each typed spec. Pointer events on the strip canvases go to `Hooks.chartPointer(i, 'down' / 'move' / 'up', x, y, cv)`. On a phone, tapping the grip or pressing G expands the strip over the canvas (up to 60%, also by dragging). |
| Notes | `Notes.open()` | Returns at once for v2. `#notes-btn` is hidden for v2, and a "Levels" button replaces it. |
| Teacher (FCR-10) | `Teacher {on, speed, revealed, frozen, toggle, step, setSpeed, reveal, freeze, copySeed, key, sync}` | A 48 px `#teacher` strip with play/pause, step, speed (v2 only), a seed chip that copies `Url.link({unit, level, seed})`, reveal and freeze. `step` calls `ch.teacherStep()` or runs `update(1/30)`, then draws once and stays paused. `freeze` pauses, calls `ch.freezeAsk()` and emits `freeze`; R resumes and reveals. In projector mode the strip is 64 px. |
| Keys (D4 §8) | `Keys.down`, `Keys.mute`, `Keys.help` | Order: `Hooks.key`, then teacher keys (when on), then global keys (M mute, ? help, G strip), then dock keys, then `App.mode.onKey(e.key, e)`. Keys typed into inputs are ignored. Space and Enter on a focused button go to that button. ? opens a card listing `ch.keys`, the dock keys, and the global and teacher keys; Escape or ? closes it. |
| Level select (D2-2) | `LevelSelect.open(ch)` | Opened from a "Levels" button on each v2 menu row and in the v2 play bar. 48 px chips L1…Ln; the boss chip has a double outline. The suggested level is filled, a locked level is hatched, and a played level shows its star count. A line underneath gives the level name and minutes. A locked chip explains on the first tap and plays on the second ("jump ahead"). Teacher mode unlocks every level. |
| Menu | `Menu.render` | A section with an act number is headed `Act N`; a section with `act: null` shows its name alone; a legacy section keeps its numeral. Stars are inline SVG with an aria-label, outline when unearned (legacy ★ text under `?v1=1`). |
| Fonts (FCR-3) | `<style id="ef-fonts">` | Embedded WOFF2. Core pack: Fraunces (variable 400–800), Spectral 400, 600 and 400 italic, IBM Plex Mono 400. Greek and symbols pack: Noto Serif 400 and 600 and Noto Sans Mono 400, limited by `unicode-range` to Greek, arrows, ▲ ▼ ◆, ⅛, †, √, ≈ and super- and subscripts. Readable pack: Atkinson Hyperlegible 400 and 700. The Google Fonts `<link>` is gone. Families are set only through `--fd`, `--fb` and `--fm`; the symbol faces sit second in each stack. |
| Prefs | `Shell.prefs()` | Sets body classes from `Save.d.ui`: `readable` (Atkinson, no italics, line height 1.6, tracking +0.04em), `calm` (also `?calm=1` in dev builds) and `lh` (a mirrored dock). It runs at boot, on each `App.play` and on `Save.onLoad`, which also re-renders the menu. None of it applies under `?v1=1`. |
| Accessibility (FCR-5) | CSS | Focus ring in `--v-text` with a 2 px ground gap (dark ink on paper cards). A disabled `.btn` is dashed and hatched at full text contrast, not 0.38 opacity. A `#live` polite region (`.sr-only`) and a `#whisper` slot inside `#stage` (top-left, below the HUD in v2; hidden while a card is open via `:has`). Animations stop under reduced motion and Calm. Both CSS changes are off under `?v1=1` (`html.v1`). |
| v2 card hooks | CSS | `.card.v2` (480 px), `.take` (28 px Fraunces), `.stars-i .star` (36 px), `.interesting`, `.chips` and `.chip` (44 px), `.code` (20 px mono), and a sticky `.card-btns` action bar. 00_entry.js can use these and `starSVG(n, of)`. |
| `boot.js` | `Shell.init()`, deep links, `window.TB` | `TB` = the legacy keys plus `Det`, `Events` (guarded with `typeof`), `Url`, `Teacher`, `Hooks`, `HUD`, `Dock` and `Strip`, then `Object.assign(…, EXPORT)`. `EXPORT` from `ui.js` adds `isV2`, `Layout`, `Keys`, `LevelSelect` and `starSVG`. After `App.go('title')`, `?lab=&dev=1` calls `SceneLab.open` (guarded), else `?unit=` calls `App.playLevel(REG[unit], level || 0, {seed})`. |

## Deviations from API_v2, and why

1. **`isV2(ch)` (`ch.v2 === true`)** in place of `ch.v2`. See the section at the top.
2. **Frame scheduling under the virtual clock.** When `window.__advance` exists and `requestAnimationFrame` is still native, `frame()` uses `setTimeout(frame, 16)`. A native rAF never fires inside one synchronous `__advance`, so until E7's shim is in `vclock.js`, `tests/monkey.py` would freeze. Both paths give the same virtual 40 ms cadence. Once the shim is in, the loop uses rAF. The self-test runs both paths.
3. **Teacher mode seeds legacy runs** with a fresh seed, so the seed chip can share a reproducible link for any unit. The same `R()` calls happen in the same order; only the starting state changes. `Teacher.on` is `Url.teacher && !Url.v1`.
4. **Dock keys** run after the global keys and before `onKey`, which §4.7 does not cover. The dock also accepts `{id, el}` and the extra fields `why`, `busy` and `pressed`, and uses `aria-disabled` rather than `disabled`, so locked buttons stay focusable and can say why.
5. **`Hooks.chartPointer` types** are `'down'`, `'move'` and `'up'`; x and y are CSS px of the canvas. `move` is forwarded only while a pointer is down, as on the stage.
6. **Throwing hooks are dropped** and reported, not left to kill the chapter (they still show the error box, so tests still fail on them).
7. **`Url` details.** A negative `level` reads as null. `seed` is `>>> 0` (uint32), matching `seed()`. A boolean parameter is true unless it is `0`, `false`, `no` or `off`, so `?teacher` alone turns teacher mode on.
8. **All five layout classes** are built, not only phone portrait and desktop, because each is a few lines of grid CSS.
9. **The HUD overlay** is at least 56 px and may grow to 45% of the canvas, so a v2 Hunt chapter that still writes Hunt's legacy panel is not clipped. It ignores pointer events except on controls inside it.
10. **Base `App.open` falls back for v2.** If `00_entry.js` is missing (a partial `V2_ONLY` build), it calls `playLevel(ch, 0)` instead of showing an intro card that would read "undefined". E4's outer wrap takes over when present.
11. **Level select calls `Save.migrate(id)`** when it exists, because it enters a unit without `App.open`. E1's `star2` migrates too, so this is belt and braces.
12. **Font packs.** The core pack adds Spectral italic 400 (+13 KB), because the legacy UI sets kickers, section heads and the quote in italic. Plex Mono is Google's latin file, unmodified, because IBM reserves the name "Plex" and subsetting counts as modifying the font. Fraunces and Spectral are subset with pyftsubset; Noto Serif is instanced to static 400 and 600. The Greek and symbols pack is 21.5 KB, more than D4's 13.3 KB estimate. There are no metric-matched fallback faces: a data URI cannot go missing, and `font-display: block` hides the decode, which takes milliseconds.
13. **Readable mode CSS and `Shell.prefs`** are not in §4. I added them because the Readable pack now ships. A settings toggle still has to set `Save.d.ui.read`.
14. **Legacy UX under FCR-5.** Off under `?v1=1`: legacy disabled buttons now look hatched (still disabled), the focus ring has changed, and the menu has vector stars. None of this moves layout, and the golden check confirms it.
15. **Shell slots for E3.** `#whisper` (inside `#stage`) and `#live` (`aria-live="polite"`, `.sr-only`) are in `shell.html`. `00_fx.js` should look them up with `$('whisper')` and `$('live')` rather than create second copies.
16. **Strip captions.** A typed spec's caption is hidden, because LiveGraph draws its own title; it stays as the canvas aria-label. A legacy plate shows its caption.
17. **Under `?v1=1`, keys** run only `Hooks.key`; no global or teacher keys.

## Notes for other packages

- **E3:** `isV2`, `Url.projector`, `Url.theme` and `Url.calm` are ready. `documentElement.dataset.theme = 'projector'` is set while `ui.js` loads. `body.calm` mirrors `Save.d.ui.calm` (and dev `?calm=1`) for CSS. `Stage.layout === 'desktop'` is the trigger for your particle pool of 300.
- **E4:** use `isV2(ch)` in the `App.open`, `App.go` and `End.show` wraps (The Nest!). `starSVG(n, of)` and the `.card.v2` CSS hooks are available. Cards with `cls: 'lvl v2'` or `'end v2'` get the sticky action bar. `App.playLevel(ch, n, {seed, thaw, replay})` passes every option to `ch.start(ch, o)`.
- **E5:** `Hooks.chart` and `Hooks.chartPointer` are wired. The theme argument is `Pal.theme` when E3 is present, else `'dusk'` (or `'projector'`). `Strip.redraw()` redraws every chart now. `Strip.canvas(i)` returns the canvas or null.
- **E6:** in a v2 Hunt chapter, call `HUD.say` rather than leaving `Hunt.panel()`'s HTML in `#hud`, and set chapter actions with `Dock.set`.
- **E7:** with the rAF shim in `vclock.js`, `frame()` runs on it (see deviation 2). The dock buttons are `#dock button`. A locked one has `aria-disabled="true"` and is not `disabled`, so the monkey can click it; nothing happens except a whisper.
- **Chapter authors:** `ch.keys` feeds the help card. `onKey(e.key, e)` receives `' '` for Space and `'ArrowLeft'` and so on, unchanged. Do not use the top 56 px of the canvas for targets (`Stage.zones.hud`). Keep actors out of `Stage.zones.graph` when it is set.

## Tests

| Test | Result |
|---|---|
| `node --check` on `ui.js`, `boot.js` and `tests/selftest_e2.js` | clean |
| `python3 tests/selftest_e2.py BUILD`: Chromium under vclock, network blocked, 7 page loads | **PASS: 152 checks.** Core runs twice (timer path and rAF path), 54 each; URL 9; teacher 17; desktop 6; projector 7; v1 5. Covers: Url parsing, link and lock; legacy isolation (no classes, hidden parts, 560 px, Notes works, no reseed); the Nest `v2` counter; `Stage.u` and `hit`; `playLevel` options, seed and `R()` sequence; phone geometry 48/548/112/72; HUD; Dock (locked, busy, keys, update); hook order and hit-stop; the 2 Hz strip poll without pausing; `Hooks.chart` and `chartPointer`; strip expand and `zones.graph`; Show data; key order and inputs; help; level select with jump-ahead; exit hooks; a throwing hook is dropped; menu stars; deep link with seed; teacher speed ×4, cap 16, pause, step, freeze, reveal and seed link; desktop 7/12 and projector 60/40 geometry; nothing new under `?v1=1`; zero external requests. |
| The same self-test on a build with E3's in-progress `00_tokens.js` and `00_wf.js` (`V2_ONLY='0*'`) | PASS |
| `python3 tests/golden.py check` (legacy-only build of the shared tree: E1's `core.js` and my three files) | **48 ok, 0 failed** |
| `python3 tests/golden.py check --v1` on the same build | **48 ok, 0 failed** |
| The same two checks on a build with the committed `core.js` and my files | 48 ok and 48 ok |
| `tests/monkey.py <all 48 ids> 1` (390×780) | **44 of 48 reach the end card.** `mendel` and `fancier` time out; `cross` and `double` are stuck. That is the §11 baseline (43 of 48), except that `landscape` reached the end this time. No errors, no NaN or undefined text. |
| Screenshots (phone, phone with the strip expanded and data shown, desktop, projector, phone landscape, level select, help, legacy with the teacher strip, menu) | Checked by eye. Files are in the scratchpad under `wave2/e2/shot_*.png`. |
| Size | Built HTML: 1,096 KB, 434 KB gzip (the legacy build was 834 KB, 264 KB gzip). The fonts add about 154 KB of WOFF2. That is within D5's 700 KB gzip budget for Wave A. |

Build used for these results: `V2_ONLY='__none__' python3 build.py …/scratchpad/wave2/e2.html` (legacy only, so other packages' unfinished files could not affect them). Fonts were fetched from fonts.googleapis.com; Fraunces and Spectral were subset with `pyftsubset --unicodes=U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+2013-2014,U+2018-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+2070-209F,U+20AC,U+2122,U+2190-2193,U+2212,U+221A,U+221D,U+2248,U+215B --flavor=woff2 --no-hinting --desubroutinize`. Licence notices are in the `ef-fonts` style comment (all SIL OFL 1.1).

## Not done (later, or other packages)

- The FCR-8b DOM label layer (it waits on `Lbl.put` from E3).
- The "pen" teacher key N.
- A settings screen to toggle Calm, Readable, left hand and untimed mode. The classes and save fields exist.
- Act locks and "needs" hints in the menu. The act headings are in; the station map replaces the menu later.
- An in-game credits line ("MIT licence", D6 decision 6). No credits screen exists yet. I can add a footer line to the title screen on request.
