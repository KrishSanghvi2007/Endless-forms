> **D6 overrides:** read `docs/design/D6_designer_decisions.md` (the designer's binding decisions of 14 Oct 2026) before this file.

# API_v2. The Wave 2 engine contract (Batch 0)

*Lead engineer, Wave 2. Implements D5 §5 (binding) for `games/endless-forms/source`. D5 overrides this file on any design point; this file overrides D1–D4 on any code point. Every name, signature and default below is the contract: build to it, and change it only by editing this file and saying so in the commit.*

**Status tags.** **[B0]** lands in Batch 0, before any Batch 1 unit merges. **[B0-simple]** lands in Batch 0 as the simple first version described; the full version follows without changing the signature. **[by Bn]** is specified now and must land before Batch *n* starts. **[later]** is a reserved name only.

**Contents.** 1 Ground rules · 2 Work packages · 3 `core.js` · 4 `ui.js`, `shell.html`, `boot.js` · 5 `00_tokens`, `00_cvd`, `00_fx`, `00_wf` · 6 `00_entry`, `zz_v1switch` · 7 `01_widgets` · 8 `02_hunt_ext`, `01_rig`, `01_scenes` · 9 The v2 chapter contract · 10 The act plan · 11 Testing recipe · 12 Deviations from D5 · 13 Where the built engine differs from §§3–9 (integration) · 14 Engine changes after Batch 1 · 15 The opening description card and the chapter accent (D6 decisions 7–8)

**Integration status (14 Oct 2026).** All Batch 0 engine files are built and integrated. Where the code and the sections below disagree, **§13 and the code win**; §13 lists every difference, package by package, and points to the logs in `docs/changes/wave2/`.

**Batch 1 status (15 Oct 2026).** Five units are built on this engine (`lichen`, `soot`, `hawks`, `census` in `v2/mixer.js`, `casino`). The engine requests they shared are in **§14**, which wins over §§3–13 where they differ. Unit builders also read `docs/changes/wave2/lessons_batch1.md`.

---

## 1. Ground rules (every package, every unit)

1. **One scope.** `build.py` joins `core.js`, `hunt.js`, `ui.js`, `ch1…ch29.js`, `ch99.js`, `v2/*.js` (sorted by name), `boot.js` into one `'use strict'` IIFE. Every module is a top-level `const Name = {…}` (or a `function` declaration) visible to every later file. Never redeclare a legacy name; new chapters are `CH_<ID>_V2`.
2. **Load order.** v2 files sort: `00_cvd, 00_entry, 00_fx, 00_tokens, 00_wf, 01_rig, 01_scenes, 01_widgets, 02_hunt_ext, 03_redqueen`, chapter files (lower-case letters), `zz_v1switch`. **Top-level code may touch only legacy objects (`core.js`, `hunt.js`, `ui.js`, `ch*.js`) and lower-numbered v2 files.** Same-number files reference each other only inside functions (note `00_fx` sorts before `00_tokens`). A missing module (a `V2_ONLY` build) must not throw at load: guard cross-file calls made at runtime with `typeof X !== 'undefined'`.
3. **Legacy is frozen behaviour.** `tests/golden.py` fingerprints all 48 legacy chapters (§11). Every shell edit and every plug-in must leave `python3 tests/golden.py check <build>` at **48 ok**, and `--v1` at 48 ok once `zz_v1switch.js` exists. Concretely, for a chapter without `v2: true`:
   - the play screen at < 1024 px keeps today's geometry (`Stage.w`, `Stage.h` identical at 390×780), `#hud` content and the `#bar-gen` text;
   - `frame()` delivers the same `dt` sequence and calls `update` then `draw` exactly as today;
   - nothing calls `R()` that did not before (cosmetic randomness uses `Fx.rnd`, never `R()`); nothing reseeds unless asked (`App.playLevel` with a seed, or `?seed=` for that unit);
   - legacy objects are wrapped, never mutated in place (no edits to `CH_*` fields, `ch.theme`, `Hunt` state); every wrap starts `if (!isV2(ch)) return orig.apply(this, arguments)`. **Test `isV2(ch)` (`ch.v2 === true`, from `ui.js`), never `ch.v2`:** legacy `CH_NEST` uses `this.v2` as a visit counter (0 to 12), so a truthiness test turns The Nest into a v2 chapter halfway through a run;
   - card DOM (`.card`, `.card-btns button`, `.end`), `#scene`, `#hud`, `#bar-gen`, `#err` and `window.TB` keep their meaning.
4. **`?v1=1` is the legacy game.** Every plug-in that changes legacy UX (whisper, theme adapter, entry wraps, PLAN rewrite, new save key) checks `Url.v1` at its top level and stays inert.
5. **Determinism.** A run is `(build, seed, actions)`. The simulation draws only from the shared `R()`. Any value between an `R()` draw and a scored or encoded outcome uses `Det` (§3.2) or `+ − × ÷ Math.sqrt Math.floor Math.round Math.abs` and comparisons, never `Math.exp/log/pow/sin/cos/tan/atan2` or `**` with a non-integer exponent. Expectation curves that need them (Kimura, decline ghosts) are drawn only as ghosts and live in functions marked `// ghost-only`.
6. **Words.** All player-facing text lives in the chapter's `content` object (§9) and obeys D4's budgets; canvas text only through `Lbl.put`. British spelling; D0 agency rules ("variants are selected, populations evolve"). `tests/lint_text.js` enforces it.
7. **Exports for tests.** `ui.js` defines `const EXPORT = {}`; a v2 module that tests need adds itself (`EXPORT.Fx = Fx;`). `boot.js` builds `window.TB = Object.assign({…legacy keys…}, EXPORT)`.
8. **Never declare `URL`** (or `Map`, `Set`, `Node`, `Event`): it would shadow the browser global inside the IIFE and break `URL.createObjectURL` for CSV downloads. The URL-parameter module is `Url`.
9. **Builds.** Never build to the shared default output. `build.py` always also writes `source/game.js`, which other agents overwrite: tests load the HTML you pass, never `source/game.js`.

---

## 2. Engine work packages and file ownership

One agent per package. **Edit only your files.** Need a change in someone else's file: message its owner; if blocked, write the call behind a `typeof` guard and note it in your report.

| Pkg | Owner files (exclusive) | Delivers (sections) | Depends on |
|---|---|---|---|
| **E1** core | `core.js` | `R.state/restore`, `Det`, `Gen` extensions, `Save` v2 + adapter + `Save.res`, `Events` (§3) | — |
| **E2** shell | `ui.js`, `shell.html`, `boot.js` | `EXPORT`, `Hooks`, `Url`, `App.play/playLevel`, rAF `frame`, `Stage.u/zones/hit/layout`, v2 layout (strip, dock, HUD line), `Strip`, `Dock`, `HUD.say`, Notes no-op, `Teacher`, keys, act-aware `Menu`, deep links, embedded fonts (FCR-1, 2, 3, 5, 10; D2-1, D2-2) (§4) | E1 for `Events` (guarded) |
| **E3** look | `v2/00_tokens.js`, `v2/00_cvd.js`, `v2/00_fx.js`, `v2/00_wf.js` | `Pal`, `CVD`, `Fx`, `Layer`, `Ghost`, `Lbl`, `Live`, `Txt`, `Whisper` (toast rebind), `Snd2`, `WF` (FCR-4, 6, 7, 8a, 9, 11; D2-6) (§5) | E2 `Hooks`, `Url` |
| **E4** entry | `v2/00_entry.js`, `v2/zz_v1switch.js` | act `PLAN` rewrite, `Entry`, `App.open`/`App.go`/`End.show` wraps, v2 level and end cards, `Sim`, `Snap`, `Freezer`, `Replay`, `ResultCode`, `?v1=1` (FCR-12, D2-8) (§6, §10) | E1 `Save.star2/migrate`, E2 `Url`, E3 `Ghost` (all guarded) |
| **E5** widgets | `v2/01_widgets.js` | `LiveGraph`, `Predict`, `GenePoolLens`, `Invasion`, `Ledger`, `Pin`, `Evidence`, `Chips`, `SceneLab` [B0]; `DemeMap` [by B3]; `PedigreeView` [by B2]; `PriceBars`, `TreeView` [later] (§7) | E2 `Hooks`, `Strip`; E3 `Pal`, `WF`, `Fx` |
| **E6** world | `v2/02_hunt_ext.js`, `v2/01_rig.js`, `v2/01_scenes.js` | Hunt extensions (D1 §2.2 + `migrants`, `lens`), `Rig` + moth, beetle, hermit crab [B0], D5 §4 rigs [by B2], `Petri`, `Strata` [by B3] (§8) | E1 `Det`, E3 `Fx/Layer/Pal`, E5 `GenePoolLens/Predict/Pin` |
| **E7** tests | `vclock.js`, `tests/monkey.js`, `tests/monkey.py`, `tests/lint_text.js`, `tests/vmgame.js`, `tests/oracle.js`, `tests/det.js`, `tests/bots.py` (+ `tests/bots.js`), `tests/shots.py`; optionally `build.py` (one line: write `game.js` beside the output file when an output path is given) | rAF shim, v2-aware monkey at three viewports, text lint, Node vm loader, oracle runner, Det cross-check, five-bot sweep, screenshot harness, Mendel monkey timeout fixed in the monkey or waived with a note (§11) | E2 `EXPORT` |
| Architect | `tests/golden.py`, `tests/golden.js`, `tests/golden_init.js`, `tests/golden/*`, this file, `docs/design/v2_chapter_skeleton.js` | golden trajectories; contract changes | — |

**Day-1 plumbing (land first, so others can build):** E1 `R.state/restore`, `Det`, an `Events` stub (`emit` appends, `csv` returns ''); E2 `EXPORT`, `Hooks`, `Url`, `App.playLevel`, `App.play` reading `App._o`; E7 the rAF shim in `vclock.js`.

**Package acceptance.** Golden check 48 ok (and `--v1` 48 ok once E4 lands); monkey on all 48 ids no worse than the §11 baseline; `node --check` clean; your section's oracle or self-test passes; no lint failures in your files. Each engine package also owns and ships `tests/selftest_e<N>.js` (Node, via `tests/vmgame.js`) covering its maths (Det, WF, Chips scoring, Snap round trip, PLAN completeness, Save size and import). Unit agents own `v2/<unit>.js` and `tests/oracle_<id>.js`.

---

## 3. `core.js` (E1)

### 3.1 RNG state [B0]
```js
R.state()      // → int32, the current state of R()
R.restore(s)   // sets it; snapshots and replays use these
```

### 3.2 `Det`: bit-exact transcendental maths [B0]
```js
Det.exp(x)  Det.log(x)  Det.sin(x)  Det.cos(x)
Det.pow(x, y)    // x > 0, or x < 0 with integer y; |y| ≤ 64 integer → exponentiation by squaring, else exp(y·log x)
Det.gauss()      // Box–Muller: let u = 0; while (u === 0) u = R(); return Math.sqrt(-2 * Det.log(u)) * Det.cos(TAU * R());
Det.poisson(l)   // the legacy poisson() algorithm with Det.exp and Det.gauss: same R() draws
```
- Only `+ − × ÷`, `Math.sqrt/floor/round/abs/trunc`, comparisons and typed-array bit views (for the exponent in `log`). Fixed evaluation order (Horner), so results are identical in every engine.
- `exp`: k = Math.round(x·LOG2E); r = (x − k·LN2_HI) − k·LN2_LO (fdlibm split constants); degree-13 Taylor in Horner form; scale by an exact table of powers of two. `log`: m·2^e with m ∈ [√½, √2) via a `Float64Array`/`Uint32Array` view (scale subnormals by 2^54 first); s = (m−1)/(m+1), odd series to s²¹; e·LN2_HI + (series + e·LN2_LO). `sin/cos`: n = Math.round(x·2/π), three-part Cody–Waite reduction, quadrant, Taylor to r¹⁷ on |r| ≤ π/4; valid for |x| ≤ 1e5.
- Accuracy: relative error ≤ 1e-14 against `Math` over the ranges in `tests/det.js`; special values as `Math` (NaN, ±Infinity, 0, underflow to 0, overflow to Infinity).
- `tests/det.js` (E7) checks accuracy and writes or compares `tests/det_vectors.json` (1,000 inputs and outputs as hex), so Firefox and WebKit can be compared later.

### 3.3 `Gen` extensions [B0 for 2, 3, 5 and `det`; later for 1, 4]
Legacy bodies stay byte for byte. Each public function gets one first line, e.g. `mate(lay, a, b, o) { if (lay.x) return this._mateX(lay, a, b, o || {}); …legacy… }`; likewise `genome` and `ph`. A legacy layout draws exactly the same `R()` calls as today.

```js
Gen.layout(specs)              // legacy fields + lay.x = any spec has det|kind:'multi'|ploidy|track|link|fx
                               //   lay.det = any spec has det:true; lay.nextId = 1; lay.sexed = any ploidy:'X'|'hap'
Gen.genome(lay, over, o)       // o = {sex:'f'|'m'} required when lay.sexed
Gen.mate(lay, mom, dad, o)     // o = {sex} when lay.sexed (mother first!)
Gen.mateX(lay, mom, dad, sex)  // = Gen.mate(lay, mom, dad, {sex})
Gen.hap(lay, mom)              // haplodiploid son from an unfertilised egg
Gen.clone(lay, g)              // asexual copy (mutation still applies), new id, pa = [g.id, 0]
Gen.allele(lay, g, k, i = 0)   // → [a1, a2] for locus i of trait k; −1 = absent copy
Gen.mph(lay, g, k)             // multi-allele phenotype class (below)
Gen.mfreq(lay, pop, k)         // → Float64Array(alleles): copy frequencies (absent copies skipped)
Gen.freq(lay, pop, k)          // legacy; on an X or hap trait counts present copies only
Gen.pack(lay, g) / Gen.unpack(lay, arr)   // plain-JSON form incl. id, pa, lin (for sim snapshots)
```
- **`_mateX` reproduces `_gam` exactly** for the legacy kinds (`dom`, `count`, additive): same draws, same order, with `Det.gauss`/`Det.poisson` in place of `gauss`/`poisson` when `lay.det`. So `det: true` changes only the last bits, never the sequence. `genome` and `ph` under `lay.x` likewise.
- **`det: true`** (any spec): Det maths everywhere in Gen for that layout. Every v2 layout sets it (`02_hunt_ext` adds it for v2 Hunt chapters).
- **Ext 2, multi-allele** `{k, kind:'multi', n:1, alleles:K, p0:[…K] (default uniform), dom:[order] | codom:true, mu:0}`: allele index stored as an integer-valued float. `genome`: one `R()` per copy (inversion over p0). `mate`: one `R()` for the copy choice; if `mu > 0` one `R()` for whether it mutates and one to pick another allele uniformly. Phenotype class: `Gen.mph(lay, g, k)` → most dominant allele index under `dom`, or the sorted pair `"a1/a2"` under `codom`.
- **Ext 3, ploidy** `ploidy:'X'`: a female carries two copies; a male has copy 2 = −1. A daughter takes a random copy of each maternal locus plus the father's copy 1; a son takes the maternal copy and −1. `ploidy:'hap'`: males from `Gen.hap` have −1 in every copy 2; a −1 copy is never transmitted, and choosing between one real copy and −1 draws no `R()`. `ploidy:4` [later].
- **Ext 5, track** `track:true`: genomes carry expandos `g.id` (from `lay.nextId++`), `g.pa = [motherId, fatherId]` and `g.lin = Uint32Array(2·L)`, the founder lineage id of each copy (copied with the transmitted copy). No `R()`.
- **Ext 1, link** `{link:{chr, cM:[…]}}` and **Ext 4, fx** `{fx:[{k, w}]}` [later, Wave B / Wave A]: `layout` accepts them; `_mateX` throws `Error('Gen ext link: not yet')` until built.

### 3.4 `Save` v2 and the storage adapter [B0; IndexedDB B0-simple]
```js
Save.k                      // 'ef_v2'; 'endlessforms_v1' when ?v1=1 (read location.search inside load())
Save.d = { schema: 2,
  stars: {},                // id → 0..3 (legacy Menu reads it; v2 writes popcount of s2[id])
  s2: {}, lv: {},           // id → unit mask; id → [mask per level]   (Discover 1, Predict 2, Transfer 4)
  v1stars: {}, done: {},    // pre-v2 best moved here on first v2 play; id → 1 when the unit end card was shown
  res: {},                  // place → base64 resident snapshot (≤ 128 chars)
  ui: { th: 'dusk', calm: 0, read: 0, hap: 0, lh: 0, verbs: 0, unt: 0, real: 0 },  // theme, Calm, Readable, haptics, left hand, verb bits, untimed, Realistic
  rev: {},                  // concept code → Leitner box
  quick: false, snd: true, opens: 0 }   // legacy fields stay top level because legacy code reads them
Save.load()                 // adapter read; first run imports stars, quick, snd, done, opens from 'endlessforms_v1' (never deletes it)
Save.save()                 // adapter write; never throws
Save.star(id, n)            // legacy, unchanged
Save.star2(id, level, mask) // lv[id][level] |= mask; s2[id] |= mask; stars[id] = popcount(s2[id]); save; → stars[id]
Save.migrate(id)            // once per id: v1stars[id] = stars[id] || 0; stars[id] = popcount(s2[id] || 0)
Save.code() / Save.fromCode(str)   // copyable save code (base64url JSON) / import; → bool
Save.size()                 // JSON length; must stay ≤ 3500
Save.adapter                // {kind: 'scorm'|'local'|'memory', idb: bool}
Save.onLoad(fn)             // called again if the async IndexedDB mirror turns out newer
```
- **Adapter order:** SCORM 1.2 `API` or 2004 `API_1484_11` (search `window.parent` up to 7 levels, then `opener`; `cmi.suspend_data`) → `localStorage` in try/catch → memory plus `Save.code()`. **[B0-simple] IndexedDB** is a write-behind mirror (`ef` database, `save` store, key `d`, with a `t` stamp); read at boot only when the synchronous stores were empty or threw. Gate: a save survives in an iframe where `localStorage` throws.
- **Resident snapshots** (≤ 96 bytes binary, base64 ≤ 128 chars): `Save.res.put(place, snap)`, `Save.res.get(place)` → snap | null. Layout, little-endian: `u8 version=1 | u16 N | u16 gen | u32 seed | u8 nf | nf×u8 freq (round(p·255)) | u8 toneMean | u8 toneSd (×255) | u8 np | np×(u16 id + 8 bytes caller-packed genome)`, with nf ≤ 16 and np ≤ 4. `snap = {N, gen, seed, freqs: [p…], tone: [mean, sd], pins: [{id, bytes: Uint8Array(8)}]}`.

### 3.5 `Events` [B0]
```js
Events.emit(type, data = {}) // → rec {t: Math.round(performance.now()), type, unit, level, seed, ...data}; ring buffer of 5000
Events.on(type | '*', fn)    // → off()
Events.log                   // the array
Events.csv()                 // header t,type,unit,level,seed,data ; data as JSON
Events.clear()
Events.debug                 // true in tests: also logs 'fx'
Events.lat()                 // ms from each 'act' to the next 'fx' (debug only); CI asserts ≤ 200
```
`unit` = `App.ch && App.ch.id`, `level` = `App.ch && App.ch.level`, `seed` = `App.seed` (read inside the function; `App` lives in `ui.js`). Types: `open {level}`, `act {a}`, `predict {id, kind, value, expect, err, tol, hit}`, `outcome {k, v}`, `level {n, mask}`, `star {mask, stars}`, `whatif {gen, lever}`, `reveal {}`, `freeze {}`, `fx {k}`. Legacy code never emits except `open` from `App.play`.

---

## 4. `ui.js`, `shell.html`, `boot.js` (E2)

### 4.1 Plumbing [B0, day 1]
```js
const EXPORT = {};
const Hooks = {
  pre: [],            // fn(c, w, h)      before App.mode.draw (shake transform)
  frame: [],          // fn(dt, c, w, h)  after App.mode.draw; only while the stage is live (no pause, no card)
  dt: [],             // fn(dt) → dt      before update (hit-stop); legacy dt passes through unchanged
  play: [],           // fn(ch, o)        after App.mode.start
  exit: [],           // fn(ch)           in App.exit
  key: [],            // fn(e) → true if handled; runs before Teacher and chapter keys
  chart: null,        // (cv, spec, theme) → void       set by 01_widgets (LiveGraph.draw)
  chartPointer: null  // (i, type, x, y, cv) → void     set by Predict while an ask is open
};
const Url = { unit, level, seed, teacher, projector, locks, cvd, lab, v1, dev, theme, calm, q,
              link(o) /* → share URL string */, lock(unit, key, def) /* → number */ };
```
`Url` parses `location.search` once (`''` when `location` is undefined, as in Node). `level`, `seed` are integers or null; `teacher`, `projector`, `v1` booleans; `locks=census.N:40,casino.Ne:12` → `{'census.N': 40, …}`; `dev` = `file:` protocol or `?dev=1`; `theme`, `calm` and `lab` are honoured only when `dev`.

### 4.2 `App` [B0]
```js
App.seed                       // the seed of the current run
App.playLevel(ch, n, o = {})   // App._o = {...o, level: n}; App.play(ch)
App.play(ch)                   // legacy body, plus: const o = App._o || {}; App._o = null;
                               //  seed: o.seed ?? (Url.unit === ch.id ? Url.seed : null) ?? (ch.v2 ? fresh() : null)
                               //  if not null: seed(s), App.seed = s     (legacy without a seed: no reseed)
                               //  mode.start(ch, o); Hooks.play; Events.emit('open', {level: o.level || 0})
App.exit()                     // legacy, plus Hooks.exit
```
`ch99.js` wraps `App.play(ch)` and drops a second argument, so **options travel only through `App.playLevel`**. `fresh()` = `(Date.now() ^ (Math.random() * 1e9)) >>> 0 || 1`.

### 4.3 `frame()` [B0]
Same body, scheduled by `requestAnimationFrame(frame)` (fallback `setTimeout(frame, 16)`); `dt` formula unchanged. Order: `Title.tick` | (`setTransform`; if live: `d = Hooks.dt…(dt)`, `update(d)` ×`Teacher.speed` for v2 only; if live: `Hooks.pre`, `draw`, `Hooks.frame`). `vclock.js` shims rAF as `fn => setTimeout(() => fn(performance.now()), 16)` (E7), which keeps the legacy cadence; `tests/golden_init.js` does the same.

### 4.4 `Stage` [B0]
```js
Stage.u                  // getter: Math.min(Stage.w, 1.2 * Stage.h)
Stage.layout             // 'legacy' | 'phone' | 'phone-land' | 'tablet' | 'desktop' | 'projector'
Stage.zones              // {hud, thumb, graph}: {x, y, w, h} in canvas px, recomputed on resize
                         //   hud = top 56 px (no targets); thumb = bottom 35% (actions); graph = null unless the strip overlaps
Stage.hit(x, y, pts, rmin = 22)   // pts [{x, y, r?}] → index of the nearest centre within max(rmin, r), else −1
```

### 4.5 v2 layout, strip, dock, HUD line (FCR-1) [B0-simple]
For `ch.v2` only, `#scr-play` gets class `v2` and `document.body.dataset.layout` is set (D4 §6.1): phone portrait (< 600 px): bar 48, canvas, strip 112 (drag up to 60%), dock 72; phone landscape: canvas 62% left, rail 38%; desktop (≥ 1024): canvas 7/12, strip and dock 5/12, max width 1600; projector (`?projector=1`): canvas 60%, strip 40%. The 560 px cap stays for legacy chapters. **Simple first version:** phone portrait and desktop; landscape and tablet fall back to them.
```js
HUD.say(text, num)      // v2 HUD line in #hud: text (≤ 15 words) + one live number in mono
Dock.set(buttons)       // [{id, label (≤ 2 words), key, fn, primary, disabled, aria}] → #dock (never inside #hud)
Dock.update(id, patch)
Strip.redraw()          // force a redraw now (Predict drags); otherwise polls App.mode.notes() at 2 Hz
Strip.canvas(i)         // → canvas of notes().charts[i] | null
Strip.open(bool)        // phone: expand / collapse
```
The strip draws each `notes().charts[i]` with `Hooks.chart(cv, spec, theme)` when `spec.type` is set, else legacy `spec.draw(cv, 'paper')`; skips a redraw when `LiveGraph.sig(spec)` is unchanged; shows `stats` as a table behind "Show data"; never sets `App.paused`. It forwards pointer events on its canvases to `Hooks.chartPointer`.

### 4.6 Notes, buttons, fonts [B0]
- `Notes.open()` returns at once when `App.ch.v2`; `#notes-btn` is hidden for v2.
- FCR-5: choice buttons are never disabled together; focus ring `--text` with a ground gap; star icons as inline SVG in v2 cards and the menu (legacy cards keep `.stars` text).
- FCR-3: embedded WOFF2 Core pack (Fraunces, Spectral, Plex Mono) as `@font-face` data URIs; delete the Google Fonts `<link>`. Greek and Readable packs [by B1]. Font families are set only through `--fd`, `--fb`, `--fm` (the golden harness pins those three to system fonts, so font changes cannot move legacy layout under test).

### 4.7 `Teacher` and keys (FCR-10) [B0-simple]
```js
Teacher.on                  // Url.teacher
Teacher.speed               // 1 | 4 | 16 (v2 chapters only)
Teacher.toggle()  Teacher.step()  Teacher.setSpeed(n)  Teacher.reveal()  Teacher.freeze()
Teacher.revealed            // chapters show hidden ghosts when true
```
A 48 px `#teacher` strip when on: play/pause, step, speed, seed chip (copies `Url.link({unit, level, seed})`), reveal, freeze. Keys: Space play/pause, → step, `[` `]` speed, S seed, R reveal, F freeze (pen `N` later). `step` calls `ch.teacherStep()` if defined (one generation), else runs `update(1/30)`. `freeze` sets `App.paused = true`, calls `ch.freezeAsk()` if defined, `Events.emit('freeze')`; R resumes.
Keydown order: `Hooks.key` → Teacher keys (when on) → global (M mute, ? help listing `ch.keys`, G strip) → `App.mode.onKey(key, e)`. Ignore keys typed into inputs.

### 4.8 `Menu`, boot, deep links [B0]
- `Menu.render` labels a section `'Act ' + p.act` when `p.act != null`, else today's numeral; a section with `act: null` reads `p.n` alone.
- `boot.js`: `window.TB` keeps `App, Hunt, REG, ORDER, Gen, seed, R, Save, Stage, Cards, Notes, End` and adds `Det, Events, Url, Teacher, Hooks, HUD, Dock, Strip`, then `Object.assign(…, EXPORT)`. After `App.go('title')`: if `Url.lab` and `Url.dev` → `SceneLab.open(Url.lab)` (guarded); else if `Url.unit` and `REG[Url.unit]` → `App.playLevel(REG[Url.unit], Url.level || 0, {seed: Url.seed})`.
- Projector: `Url.projector` sets `documentElement.dataset.theme = 'projector'` and the projector layout class.

---

## 5. Look and maths plug-ins (E3)

### 5.1 `00_tokens.js`: `Pal` (FCR-6) [B0]
Injects `<style id="ef-tokens">` with D4 §2.3's values under a **`--v-` prefix** (`--v-ground, --v-surface, --v-text, --v-text2, --v-A, --v-a, --v-sel, --v-drift, --v-mut, --v-mig, --v-ink, --v-accent`, plus `--v-place-<id>`), keyed on `[data-theme=paper]`, `[data-theme=projector]` (Dusk default). The prefix keeps legacy `--ink`, `--paper` intact.
```js
Pal.theme                       // 'dusk' | 'paper' | 'projector'
Pal.A Pal.a Pal.sel Pal.drift Pal.mut Pal.mig Pal.ink Pal.paper Pal.text Pal.text2 Pal.ground Pal.surface Pal.accent Pal.ochre  // getters (fill column)
Pal.line(role)                  // Paper's darker line ink for 'A'|'a'|'sel'|'drift'|'mut'|'mig' (= fill in Dusk)
Pal.place(id)                   // → {id, name, ground, lava?, anchor}; ids: wood beetle streams shore lake meadow hedge pond fig valley outer warren reef coast farm cliff lab expeditions
Pal.setTheme(t)                 // data-theme + Save.d.ui.th
Pal.token(c, x, y, r, allele, o)        // D4 §2.2.1 disc: fill, 1.5 px ink outline, letter when r ≥ 7 (14 px), o.oneCopy draws the bar (o.bar = 'Y'|'W'|'')
Pal.genotype(c, x, y, r, a1, a2, o)     // split disc: a1 left, a2 right; a2 = −1 → one token with a bar
Pal.allele(i)                   // fill for allele index 0..11: blue, amber, paper-white, ink-black × plain|stripe|dots overlays, + letter A–L
```
`applyTheme` wrap: for `App.ch.v2`, clear the legacy theme and set `#scr-play`'s ground from `Pal.place(ch.place)`; for legacy, map the theme's cabinet colour to the nearest place ground (CSS only). Inert under `Url.v1`.

### 5.2 `00_cvd.js`: `CVD` (FCR-11) [B0]
```js
CVD.apply(kind)                 // 'deut'|'prot'|'trit'|'mono'|null: SVG feColorMatrix (Machado, severity 1) over #stage, #strip, #cards; run at load from Url.cvd
CVD.sim(rgb, kind) → rgb        // [r, g, b] 0..255
CVD.dE(rgb1, rgb2) → number     // CIEDE2000
CVD.pairs(encodings) → [{a, b, kind, dE}]   // encodings [{k, rgb, channels:['colour','shape','pattern','letter','marker','luminance']}]:
                                //   every pair separable only by colour must have dE ≥ 8 under normal and all three sims
```

### 5.3 `00_fx.js`: juice, labels, voice (FCR-4, 7, 8a, 9) [B0]
Registers `Fx.pre` on `Hooks.pre`, `Fx.update`/`Fx.draw` on `Hooks.frame`, a hit-stop on `Hooks.dt`, and `Fx.clear` on `Hooks.play`/`Hooks.exit`. Nothing here calls `R()`.
```js
Fx.rnd()                        // own PRNG (rng(…)), reseeded on Hooks.play; for cosmetic jitter only
Fx.calm                         // getter: Save.d.ui.calm || prefers-reduced-motion || (Url.dev && Url.calm)
Fx.tween(obj, props, ms, ease = 'out', done)   // ease 'linear'|'out'|'inout'|'spring' → {cancel()}; frame-rate independent
Fx.burst(kind, x, y, n = 8, o)  // 'dust'|'scale'|'spark'|'droplet'|'egg'; pool ≤ 150 (≤ 300 when Stage.layout is desktop)
Fx.pop(text, x, y, sign = 0)    // ≥ 16 px mono bold ink, ▲/▼ vector icon by sign; rises 24 px over 700 ms; merges within 150 ms
Fx.ring(x, y, r, o)             // o.dashed (the 2 s "gone" ghost ring), o.ms, o.ink
Fx.shake(px = 5, ms = 180)      // ≤ 1 per 600 ms; no-op in Calm
Fx.hitstop(ms = 50)
Fx.tier(t, fn)                  // calls fn(ms): T1 160, T2 600, T3 1200; T3 at most once per 3 s, else and in Calm fn(300)
Fx.update(dt)  Fx.draw(c)  Fx.pre(c)  Fx.clear()   // governor: frame time > 20 ms for 30 frames → halve particles → no squash → Calm
Layer(w, h)                     // → {cv, c, w, h, redraw(fn(c, w, h)) → this, blit(c, x = 0, y = 0) → this, resize(w, h)}; DPR-aware cached layer, ≤ 2000 dots
Ghost.show({verb, at, to, until})   // verb 'tap'|'drag'|'hold'|'draw'|'slide'|'toggle'|'sweep'|'pour'; at/to: () → [x, y]; until: () → bool
                                // 3 s loop, replays every 4 s until the first pointer or key input or until(); Calm: static arrow + ring
                                // → {hide()}; sets the verb's bit in Save.d.ui.verbs (tap 1, drag 2, hold 4, draw 8, slide 16, toggle 32, sweep 64, pour 128)
Ghost.hide()
Lbl.put(id, text, x, y, o)      // o: {size = 14, align = 'center', base = 'middle', pill = true, c = Stage.ctx, ink, bg}
                                // size < 12 → drawn at 12 + warning; > 3 words → warning; warnings in Lbl.warnings (dev)
Live.say(text)                  // polite #live region; ≤ 1 line per 3 s (a newer pending line replaces the older)
Whisper.say(text, key)          // one slot; same key replaces; 2.4 s; hidden while an end or level card is open; > 8 words → Whisper.warnings
toast = msg => Whisper.say(msg) // rebinds core.js's toast (legacy HTML allowed); skipped under Url.v1
Txt.f(str, vars)                // '{n} of {m} eaten' → filled; Txt.words(str) → count (a {placeholder} counts as one word)
Snd2.play(name)                 // 'sieve'|'tick'|'dusk'|'wing'|'count'|'interesting'|'tock'|'scale'|'peep'|'crack'|'swish'|'pour' (D4 §5.2); respects Snd.on; muted in projector
Snd2.buzz(kind)                 // 'tick'|'hit'|'cost'|'star'; opt-in (Save.d.ui.hap), off in Calm
```
Export `Fx, Layer, Ghost, Lbl, Live, Whisper, Txt, Snd2` via `EXPORT`.

### 5.4 `00_wf.js`: `WF` (D2-6) [B0]
Haploid Wright–Fisher and sampling on the shared `R()`, Det-safe and bit-exact.
```js
WF.binom(n, p)        // p ≤ 0 → 0; p ≥ 1 → n; p > ½ → n − binom(n, 1 − p).
                      //   n·p < 30: inversion: u = R(); f = q^n (squaring); k = 0; c = f;
                      //             while (u > c && k < n) { f *= (n − k) / (k + 1) * p / q; k++; c += f; }   (1 draw)
                      //   else: Math.floor(n·p + 0.5 + Math.sqrt(n·p·q) · Det.gauss()), clamped to [0, n]  (2 draws; MODEL: "normal approximation above n·p = 30")
WF.multinom(n, ps)    // Int32Array, conditional binomials in index order
WF.hyper(N, K, n)     // successes in n draws without replacement (n sequential draws)
WF.sample(arr, k)     // k distinct items (partial Fisher–Yates)
WF.step(counts, w, N, o)   // x_i ∝ counts_i · w_i; o.mu: rate to each other type, or o.M: K×K matrix; then multinom(N, x) → Int32Array
WF.run(counts, w, N, gens, o)   // → [Int32Array per generation]; w may be a function (x, gen) → weights
WF.freqs(counts)      // Float64Array of shares
WF.ghost.kimura(p0, Ne, s)  WF.ghost.neutral(p0)  WF.ghost.decay(H0, Ne, t)   // ghost-only (Math.exp allowed)
```

---

## 6. Entry, cards, replays (E4)

### 6.1 `00_entry.js` [B0]
- **PLAN rewrite** (unless `Url.v1`): replace `PLAN`'s contents in place with `ACT_PLAN` (§10). Assert at load that every legacy id is present (`reg()` throws otherwise). `boot.js` recomputes `ORDER` after `PLAN_ADD`.
- **`App.open` wrap** (outermost): `ch.v2` → `Save.migrate(ch.id)`, `App.playLevel(ch, 0)`; skips the intro, TRANSFER and RECALL cards. Legacy → previous `App.open`.
- **Begin** (D2 §9): a capture listener on `#btn-begin` sets `Entry.begin = true`; an `App.go` wrap consumes it: going to `'menu'` with `REG.lichen.v2` and no `Save.d.done.lichen` → `App.playLevel(REG.lichen, 0)` instead (exiting the Wood still reaches the menu).
- **`End.show` wrap**: legacy → previous. For `ch.v2`, `o` is:
  ```js
  {level, mask, final, title?, take?, body?, chart?: cv => void, interesting?: key, whatIf?: {gen, levers: [key…]}, why?: {real, maths}}
  ```
  It calls `Save.star2(ch.id, level, mask)`, `Events.emit('level', {n: level, mask})`, then opens a card with `cls: final ? 'end v2' : 'lvl v2'`, `data-stars` (unit stars after this level) and `aria-label` "2 of 3 stars", inline SVG stars counting up (700 ms), TAKE (≤ 20 words) or the Interesting result (≤ 25 words), one chart, body (≤ 60). Buttons, primary last: final → Notebook, Why?, What if?, **Next unit**; level → Why?, What if?, Replay level, **Next level** (`App.playLevel(ch, level + 1)`). Why? toggles `content.why` and the level's MODEL card in 60-word chunks. A final card sets `Save.d.done[ch.id] = 1`. Defaults come from `ch.content`.
- **`Sim`**, the fixed-step driver every v2 chapter uses:
  ```js
  Sim.start(ch, n, o)   // App.seed already set; ch.sim.reset(n, o) (reset handles o.thaw: restore the snapshot, apply the lever); tick = 0; o.replay → queue logged actions
  Sim.run(ch, dt)       // first the events of live Sim.act calls since the last run; then while acc ≥ sim.dt: apply replayed actions
                        //   due this tick, ev.push(...sim.step(sim.dt)), tick++ (≤ 8 ticks per call; a bigger backlog is dropped) → ev[]
                        //   a finished sim (result() not null) never steps again
  Sim.act(ch, a)        // sim.s.log.push([tick, a]); Events.emit('act', {a}); → sim.act(a) (ev[], for inspection only); ignored while a replay runs
  Sim.tick(ch)          // → the current tick;  also Sim.log(ch), Sim.replaying(ch), Sim.thawed(ch), Sim.done(ch)
  ```
  **One event channel.** View code juices from `Sim.run`'s events only. They include a live action's events (handed out again on the next frame, ≤ 40 ms later) and a replayed action's events (applied inside `run`), so a live run and its replay show the same juice in the same order. Juicing `Sim.act`'s return value as well would double it.
- **`Snap`**: `Snap.enc(obj)` → JSON string with typed arrays as `{"$f32": […]}` / `{"$u32": […]}`; `Snap.dec(str)` inverse; exact round trip.
- **`Freezer`** (session memory, ≤ 8 vials per unit): `Freezer.put(id, gen, snap)`, `Freezer.list(id)` → `[{gen, snap}]`, `Freezer.thaw(id, gen, lever)` → `App.playLevel(REG[id], REG[id].level, {thaw: {gen, snap, lever}})` and `Events.emit('whatif', {gen, lever})`. **[B0-simple]** What if? on the level card offers the last vial's levers as chips; the drawer UI comes later.
- **`Replay`**: `Replay.encode(seed, level, log)` → `'R1.' + base64url(JSON)`; `Replay.decode(code)` → `{seed, level, log}` | null; `Replay.play(ch, code)` → `App.playLevel(ch, level, {seed, replay: log})`.
- **`ResultCode`** [B0-simple]: `ResultCode.make(bits30)` → six Crockford base-32 characters, shown "K7M 2QX"; `ResultCode.read(str)` → bits | null. Chapters supply `resultBits(s)` [later].

### 6.2 `zz_v1switch.js` [B0]
Under `Url.v1`: `V2.length = 0; PLAN_ADD.length = 0;` (00_entry already skipped the rewrite and `Save` uses the old key). Otherwise apply v2 retitles: for each chapter in `V2` with `plan: [title, subtitle]`, overwrite that `PLAN` entry's `[1]` and `[2]` before `boot.js` registers it.

---

## 7. Widgets (`01_widgets.js`, E5)

### 7.1 `LiveGraph` [B0: dots, pq, trace, tri, scatter, xhud; by B3: deme; later: price, tree, genome]
```js
LiveGraph.draw(cv, spec, theme)   // theme 'dusk'|'paper'|'projector'; sets Hooks.chart at load
LiveGraph.map(cv, spec)           // → {X(v), Y(v), ix(px), iy(py), plot: {x, y, w, h}} for gestures; tri: {P([a, b, c]) → [x, y], inv(x, y) → [a, b, c]}
LiveGraph.table(spec)             // → '<table>' data twin
LiveGraph.sig(spec)               // → string; the strip skips redraws when unchanged
```
Common spec fields: `{type, title (≤ 4 words), x: {lo, hi, label, fmt}, y: {lo, hi, label, fmt}, frame: 'designed'|'real', source, target: {lo, hi} (hatched), you, ghost}`. Realised solid 3 px with a marker, expected dashed ink 2 px, "you" a diamond labelled "you", ≤ 3 hued series, ticks inside the plot at ≥ 12 px, colour follows the entity (`ink: 'A'|'a'|'sel'|'drift'|'mut'|'mig'|'ink'`). A Predict ghost for this chart is read from `Predict.overlay(chartIndex)` and drawn automatically.

| `type` | Extra fields | Notes |
|---|---|---|
| `dots` | `bins = 16, groups: [{v: [values], style: 'hollow'|'solid'|'hatched', label}], arrows: {S: [from, to], R: [from, to]}, marker: {v, label}` | eaten hollow, spared solid, offspring hatched; S arrow selection ink, R ink |
| `pq` | `p` or `parts: [{v, allele, label}]`, `n` (copies), `ghost` (expected p), `x_linked` ("X copies") | 100% stacked bar, numerals ≥ 14 px; > 2 alleles → lettered chips |
| `trace` | `series: [{d: [], ink, label, you}]`, `fan: [[…]…]` (thin replicates), `ghost: [{d: [], label}]`, `marks: [x…]` | direct end labels |
| `tri` | `variant: 'hw'|'simplex'`, `corners`, `pts: [{f: [a, b, c], kind: 'dawn'|'dusk'|'you'|'ghost', label}]`, `trail: [[a, b, c]…]` | hw draws the dashed HW curve; simplex has neutral lettered corners, no hue |
| `scatter` | `series: [{pts: [[x, y]…], shape: 'disc'|'square'|'tri', ink, label}]`, `ref: 'diag'|'zero'|'origin'|'mean'`, `fit: [[x, y]…]` | ≤ 500 points, else hatched density cells |
| `xhud` | `female: [AA, Aa, aa], pf, pm, trail: [[pf, pm]…]` | D4 §4.2 chart 4 XHud: female triangle, male p bar, p̄ tick, gap chip, hollow ghost point |
| `deme` | `demes: [{x, y, p, N, label}], links: [{a, b, m}], mode: 'map'|'world'` | discs 40–56 px with p\|q bars; arrows 1–6 px by m |
| `price`, `tree`, `genome` | [later] | |

### 7.2 `Predict` [B0]
Predictions are **simulation state**: the sim opens `s.ask = {id, kind, lo, hi, tol}`; the view calls `Predict.ask`; the commit goes through `Sim.act(ch, {k: 'predict', id, v})`, so replays and bots reproduce it. The expectation is computed by the sim at scoring time, never stored where a bot can read it.
```js
Predict.ask({id, chart = 0, kind, axis: {lo, hi}, start, tol, soft = 6, onCommit})
        // kind 'x'|'y'|'pq'|'tri'|'time'; soft: seconds before the current ghost commits (null in untimed mode); → {cancel(), active}
        // a tap off the ghost moves it there; a drag moves it; a tap ON the ghost (within 24 px) commits; releasing a drag never commits
        // keys: P focus, arrows move (Shift ×5), Enter or Space commits, Escape leaves; Predict.commit() for a Dock button
        // on commit: Sim.act(App.ch, {k: 'predict', id, v}); Events.emit('predict', …); onCommit({id, v}); the band hatches in around
        //   YOUR mark (± tol); Predict.reveal(id, expect, tol) then moves it onto the expectation. On a phone the strip expands for
        //   the ask (opt out: expand: false) and folds 1.5 s after the commit; axis.rev measures a pq value from the right-hand end
Predict.overlay(i)        // → {v, committed, band: [lo, hi] | null} | null
Predict.reveal(id, expect, tol)   // after scoring: draws the band around the expectation
Predict.err(kind, v, expect)      // distance in axis units ('tri': Euclidean in simplex coordinates)
Predict.score(results, need = 2)  // results [{err, tol}] → true when ≥ need are within tolerance (the Predict star)
```

### 7.3 Other widgets
```js
// GenePoolLens [B0] — LOOK / GENES / JARS (D1 §2.1, D4 §4.1 rule 6)
const lens = GenePoolLens.create({items: () => [{x, y, r, a: [a1, a2]}], jar: {x, y, w, h}, letters: ['A', 'a'], blocksTaps: false});
lens.mode; lens.set('look'|'genes'|'jars'); lens.cycle();  // key L
lens.draw(c);  lens.q();                                     // share of copy index 1 (absent −1 copies skipped)
GenePoolLens.control(lens) → HTMLElement                     // 44 px segmented control for the dock

// Invasion [B0] — your rule as a lineage (D1 G7); draws only through WF
const inv = Invasion.create({rules: [{id, label, letter}], you: 0, N: 200, gens: 40, start: [counts], w: (x, gen) => [w_i], mu: 0});
inv.step() → counts;  inv.run(n);  inv.hist;  inv.done;  inv.draw(c, rect);  inv.spec() → trace spec (your share solid, start share dashed)

// Ledger [B0] — memory tiles (D4 rule 11)
const L = Ledger.create({n: 10});  L.push({glyph, good, t});  L.draw(c, x, y, {gen});  L.items   // age: fresh 0, hatched 1–2, dashed ≥ 3

// Pin [B0] — 450 ms hold pins an individual (≤ 4)
Pin.press(ind, x, y);  Pin.release();  Pin.list;  Pin.isPinned(id);  Pin.clear();
Pin.draw(c, locate: id => [x, y] | null, kids: id => [[x, y]…])   // paper halo + threads; Pin.update runs on Hooks.frame

// Evidence [B0-simple] — investigator budget (D1 §2.1, D4 §4.2); DOM, keyboard-ordered
const ev = Evidence.create({budget, instruments: [{id, name, cost, sample: n => data}], hypotheses: [{id, label}],
                            power: bought => 0..1, posterior: bought => ({id: p}), truth});
ev.buy(id) → data | null;  ev.left;  ev.bought;  ev.conclude(hid, conf /* .5 .6 .7 .8 .9 */) → {brier, ghost};  ev.mount(el)

// Chips [B0] — distribution bet (D3 §9.3)
const bet = Chips.create({bins: [{lo, hi, label}], chips: 10, odds: [naive probabilities]});
bet.add(i);  bet.remove(i);  bet.dist() → [q_i];  bet.draw(c, rect);  bet.hit(x, y) → i | −1
Chips.score(q, o) = 2·q[o] − Σ q_i²            // quadratic proper score of outcome bin o
Chips.expected(q, expect) = Σ_o expect[o]·Chips.score(q, o)   // stars read this, never the realised run

// PedigreeView [by B2] — tags, path counting, multiple paternity (D4 §4.2)
const pv = PedigreeView.create({nodes: [{id, sex: 'f'|'m'|'u', parents: [motherId, fatherId], pheno, dead, absent, blaze, human}]});
pv.layout(rect);  pv.draw(c);  pv.hit(x, y) → id;  pv.tag(id, '1/2'|'1/4'|'1/8'|'0');  pv.tags;  pv.r(a, b) → exact r;  pv.path(a, b) → [ids]

// DemeMap [by B3]: DemeMap.draw(c, rect, spec) (the `deme` spec), DemeMap.hit(x, y) → deme index
// PriceBars [later, Wave A]: PriceBars.draw(c, rect, {between, within, total})
// TreeView [later]: TreeView.create({nodes, rooted}).spin(id).reroot(id).draw(c, rect)
```

### 7.4 `SceneLab` [B0-simple, dev only]
`SceneLab.open(id)` (from `?lab=<id>&dev=1`): `App.playLevel(REG[id], Url.level || 0, {seed: Url.seed})` plus a DOM panel: one slider per `ch.P` entry (min, max, tag chip), seed box, level chips, a replay box (paste → `Replay.play`), "Copy replay". A slider writes `ch.P[key].v` and restarts the level.

---

## 8. Hunt extensions, rigs, scenes (E6)

### 8.1 `02_hunt_ext.js` [B0 except `species`, `net`]
Wraps `Hunt.start, morning, tap, update, endRound, interlude, nextGen, draw` (outermost, after `ch99.js`). **Every wrapper is a pass-through unless `this.ch.v2`.** Under `ch.v2`: `det: true` is added to every trait spec; `Hn.quick = false`; `Hn._pAsked = true` (disarms ch99's Lichen card); `interlude` is replaced by in-canvas dusk (`ch.dusk(Hn, rec, done)` if defined, else survivors slide into chart 0 over 600 ms, then `done()` → `nextGen`); a long press on an item calls `Pin.press`. `ch.match` in a v2 chapter uses `Det.exp`. Fields, all opt-in on the chapter config:

| Field | Behaviour |
|---|---|
| `bag: {need, chicks}` | catches feed a HUD row of `chicks` round-robin (`need / chicks` each); at dusk a shortfall starves ⌈short ÷ (need/chicks)⌉ chicks (ghost ring); `Hn.bag = {fed, starved}` |
| `barks: [{tex(w, h, d, sv) → {cv, T, H}, mask: {scale, cut}}]` | backgrounds composited through a `makeNoise` mask; `Hn.barkAt(x, y)` → index; `ch.match(ph, barkIndex)` |
| `searchImage: {streak, switchCost, glintAfter}` | catching the same `ch.morph(ph)` as last time refunds `streak` s; switching costs `switchCost` s (refocus blur); after `glintAfter` s without a catch the most conspicuous item glints |
| `trunks: {n, hunted, ghost: {jays, bmin: 0.5, bmax: 3}}` | moths resettle at random over n trunks each night; you hunt one; at dusk ghost jays take each other trunk's catch with share ∝ dᵢ·aᵢ^b (`Det.pow`), b fitted by maximum likelihood from your last 3 mornings and clamped; `Hn.ghostB` |
| `modelCount(Hn)`, `toxicity(Hn)` | functions replacing `ch.models` and `ch.bitterCost` |
| `lens: {blocksTaps}` | a `GenePoolLens` over the items (key L); while not LOOK, taps are ignored when `blocksTaps` |
| `overproduce: {eggs, K}` | at `nextGen` survivors lay `eggs` young (random pairs, `Gen.mate`), shown as a cached egg `Layer` at the true ratio; a random cull leaves K |
| `predict: {kind, tol, from}` | at dusk opens `s.ask`-style `Predict.ask` with `ch.expect(Hn)`; dusk waits for the commit or the soft timer |
| `untimed: {looks}` | when `Save.d.ui.unt`: no clock; each tap spends a look; the world pauses on a tell |
| `detectRule` | non-visual path: the player sets the bird's detection rule (a dock slider); the bird hunts by it |
| `migrants: {m, from(Hn) → genome}` | at dawn round(m·N) residents, chosen with `R()`, are replaced by migrants; `ind.mig = true` |
| `species: [{key, N, traits, toxic, cost, sprite, phen}]` | [by B2] several populations, each bred from its own survivors |
| `net: {width, mesh}` | [later] |

### 8.2 `01_rig.js` [B0: API, moth, beetle, hermit crab; by B2: the D5 §4 list]
```js
Rig.def(species, {develop?(lay, g) → ph, recipe(ph, o) → {w, h, parts: [{op: 'ellipse'|'bezier'|'poly'|'path', …, fill, stroke, lw, clip}]}, quant: {tone: 8, '*': 4}, tier})
Rig.bake(species, ph, d = 1, o) → canvas   // cached by quantised recipe key; cv.cw, cv.ch = CSS size
Rig.draw(c, species, ph, x, y, o)          // o: {size, rot, flip, id (seeded ±8% scale and pose jitter), halo, state: 'idle'|'alert'|'gone', t}
Rig.size(tier) → px                        // hero 0.12u, actor 0.07u, crowd 0.03u (Stage.u)
Rig.species() → [names]
```
Batch 0: `moth` (wraps `mothSprite`; `ph = {tone, hue, mot, band, morph, carb}`; adds banding, mottle and speckle stencils and a C/c thorax badge), `beetle` (port `beetle()` from `equilibrium-hw/source/engine.js`; `ph = {a: [a1, a2], dark: 0..1}` with 0 = A, 1 = a, −1 absent; `o.genes` draws the allele halves on the wing cases), `crab` (wraps `CH_HAWKS.crab`; `ph = {claw: 'up'|'down', lum: 0..1}`). By Batch 2 (D5 §4): fossil set, dung fly, feral fowl, side-blotched lizard and its ground, stickleback, Seychelles warbler, four crustaceans; each needs its D4 row (squint feature, channels, tier). Other species are ported by the unit that first needs them, as `Rig.def` calls in its own file.

### 8.3 `01_scenes.js` [by B3; Petri by B3 for the Scribe, Strata by B3 for the Dig]
```js
Petri.plate(c, x, y, r, {colonies: [{x, y, variant}], count, jackpot})   // agar disc; variants amber + second ring
Petri.grid(c, rect, plates)                                               // up to 20 plates, 5×4 at 56 px, count pills
Petri.velvet(from, to, done)                                              // 250 ms stamp tween; returns the colony links
Petri.flask(c, x, y, {turbidity: 0..5, label})   Petri.rack(c, rect, flasks)
Strata.section(c, rect, {layers: [{thick, pattern, lum, fossils: [{x, kind}]}], erosion})
Strata.zircon(c, x, y, {n: 20, parents})   Strata.ruler(c, rect, {decades, marks})   Strata.range(c, rect, taxa)
```

---

## 9. The v2 chapter contract (D5 §5.4)

### 9.1 Fields
```js
const CH_X_V2 = {
  id, v2: true,                         // id from §10; a legacy id replaces the old chapter
  plan: ['Title', 'Concept'],           // optional retitle applied by zz_v1switch (§6.2)
  role: 'environment' | 'animal' | 'investigator' | 'experimenter',
  place: 'wood',                        // Pal.place id
  accent: '#6F8A45',                    // the chapter's chrome tint (D6 decision 7, §15)
  mode: undefined | 'hunt',             // 'hunt' → run by Hunt + 02_hunt_ext
  intro: {goal},                        // ≤ 15 words; boot.js requires it; the map caption
  content: {…},                         // all words (9.2)
  P: {key: {v, tag: 'realistic'|'designed'|'xN', min, max, real, label}},
  levels: [{name, adds, codes: ['A1'], minutes}],   // 3–6; adds names exactly one new variable
  level: 0,                             // set by startLevel
  sim: {…},                             // headless simulation (9.3)
  start(ch, o) { this.startLevel(o.level || 0, o); },
  startLevel(n, o) {…},                 // Sim.start, view state, Dock.set, HUD.say, Ghost.show
  update(dt) {…},                       // const ev = Sim.run(this, dt); juice from ev ONLY (it holds live Sim.act events too); end check
  draw(c, w, h) {…},                    // world from sim.s; Lbl.put for words; Fx draws itself
  down(x, y) / move(x, y) / up(x, y) / tap(x, y),   // → Sim.act(this, {k: …}); do not juice its return value: the next Sim.run hands the same events out
  onKey(key, e),  keys: {Space: 'act', ArrowLeft: 'move', L: 'lens'},  // keys: map for help and audit (≤ 4 words each)
  notes() { return {stats: [[label, value, meaning]], charts: [spec…]}; },   // LiveGraph specs; boot.js requires notes
  untimed: true,                        // implements Save.d.ui.unt for timed verbs
  stars: {discover: (s, n) => bool, predict: (s, n) => bool, transfer: (s, n) => bool},
  teacherStep(), freezeAsk(),           // optional (§4.7)
  encodings: [{k, rgb, channels}], starTraits: ['tone'],   // CVD and hue lints
  teacher: {prompts: [3 strings, rising Bloom level, one a model critique], pool: 'trace'}
};
V2.push(CH_X_V2);
```
Hunt-mode v2 chapters keep the legacy Hunt config fields (`traits, N, cap, roundTime, phen, makeBg, env, objective, sprite, focus, summary, stars, what, endChart`) plus §8.1's fields; `sim` may be omitted for a Hunt chapter, which records actions through `Sim.act` on `Hunt` taps [B0-simple: replay support for Hunt chapters later].

### 9.2 `content`
```js
content = {
  intro: {game, biology, how},   // required: the opening description card, 1–2 sentences ≤ 35 words each (D6 decision 8, §15)
  firstWords,                    // ≤ 40 words: HUD before the first action (with the ghost hand)
  hud: {key: '≤ 15 words, {n} placeholders'},
  whispers: {key: '≤ 8 words'},
  labels: {key: '≤ 3 words'},    // canvas, via Lbl.put
  panels: [{id, text}],          // 35–60 words, one idea, picture already changed
  interesting: {key: '≤ 25 words'},
  levers: {key: '≤ 3 words'},    // What if? chips
  take: '≤ 20 words',  body: '≤ 60 words',  law: {title: '≤ 4 words'},
  boss: {inverts: '≤ 15 words'},
  stars: {discover, predict, transfer},   // ≤ 15 words each, shown on the end card
  model: [{level, simulated, simplification, params: [{name, value, tag, real}], cannot, nature, contested: false, refs: ['id']}],
  why: {real: ['≤ 60 words'…], maths: ['≤ 60 words'…]}
};
```
Sentences ≤ 18 words; a screen ≤ 70 words on a phone. Dynamic numbers enter through `Txt.f` placeholders, never string concatenation in code.

### 9.3 `sim`
```js
sim = {
  dt: 1 / 30,                   // fixed tick in s (turn-based units: 1, and step = one turn)
  s: null,                      // plain JSON (typed arrays allowed; Snap encodes them). No DOM, canvas, functions or Fx.
  reset(level, o) {},           // build s; R() already seeded; o.thaw = {snap, lever}, o.P = parameter overrides; s.log = []
  step(dt) { return []; },      // advance one tick; return view events [{k: 'eaten', i}, …]
  act(a) { return []; },        // apply action a (plain JSON); {k: 'predict', id, v} stores s.pred[id] = v
  result() {},                  // null while running; at the end {mask, outcome: {…}, interesting: key | null}
  snapshot() { return Snap.enc({s: this.s, rs: R.state()}); },
  restore(str) { const o = Snap.dec(str); this.s = o.s; R.restore(o.rs); },
  actions() { return []; },     // legal actions now, including {k: 'predict', id, v} options while s.ask is open
  bots: {alwaysA(s, acts, rnd), alwaysB(…), greedy(…), threshold(…)}   // 'random' is generic: uniform over actions()
};
```
Rules: `sim` uses `R()`, `Det`, `WF`, `Gen` only, so `tests/oracle.js` and `tests/bots.py` can run it headless in Node. Scoring reads `stars.*(s, level)` against the **expectation** for the parameters in force. A What if? restores a frozen snapshot, applies one lever and reruns.

### 9.4 Lifecycle
`App.open` (00_entry wrap) → `App.playLevel(ch, 0)` → `App.play` seeds → `ch.start` → `startLevel(n, o)` → `Sim.start` → each frame `update(dt)` → `Sim.run` → events → juice → `sim.result()` → `End.show(ch, {level, mask, final, …})` → level card → `App.playLevel(ch, n + 1)` → … → final card sets `done`. Freeze a vial every few generations with `Freezer.put(id, gen, sim.snapshot())`. Lichen L3 writes `Save.res.put('wood', …)`.

### 9.5 Worked skeleton
`docs/design/v2_chapter_skeleton.js` is a complete minimal unit (`CH_SKELETON_V2`, id `skeleton`, added through `PLAN_ADD` under a "Dev" section): beetles on a canvas, a two-allele `Gen` locus with `det: true`, the player as a gull eating beetles it can see, a dusk breed, one `Predict.ask` per generation on a `pq` chart, three levels, a MODEL card, stars from the sim, bots, keyboard and untimed paths. Copy it to `v2/<name>.js`, rename the identifiers and the id, and replace the model.

---

## 10. The act plan (D2 §3; written by `00_entry.js`)

Ids unchanged; every legacy id appears once; the five Batch 1–3 new ids are listed so their units need only `V2.push`. Titles and subtitles are today's, except the two D2 §3 subtitle fixes (Lek, Meadow). A rebuild that renames a unit sets `plan` on its chapter (§6.2). In `needs`, a number is an act and a string a unit id; a unit's own `needs` overrides its act's. Other future ids (`extinct, pedigree, lottery, …`) are added here when their batch starts. **D6 (designer, 14 Oct 2026) overrides this section:** one Hardy–Weinberg chapter (`census`, titled Equilibrium), no `mixer`, and no human-population topics (`malaria`, `ooa` and the Manhattan Hunt are withdrawn).

```js
const ACT_PLAN = [
  { act: 0, n: 'The Wood', needs: [], c: [
    ['lichen', 'The Lichen Wood', 'Natural selection', { spine: 1 }]] },
  { act: 1, n: 'Ancestry and evidence', needs: [0], c: [
    ['tree', 'Tree Thinking', 'Phylogeny and convergence', { spine: 1 }],
    ['dig', 'The Dig', 'Fossils and deep time', {}]] },
  { act: 2, n: 'Heredity', needs: [0], c: [
    ['mendel', 'Mendel’s Garden', 'Inheritance and dominance', { spine: 1 }],
    ['scribe', 'The Scribe', 'Mutation', { spine: 1 }],
    ['cross', 'Crossing Over', 'Recombination and linkage', {}],
    ['fancier', 'The Fancier', 'Artificial selection', {}]] },
  { act: 3, n: 'The gene pool', needs: [2], c: [
    ['census', 'Equilibrium', 'Hardy–Weinberg and what breaks it', { spine: 1 }],   // D6: ONE Hardy–Weinberg chapter (v2/mixer.js), replaces the Census
    ['royal', 'The Royal Line', 'X-linked inheritance', { needs: ['census'] }]] },
  { act: 4, n: 'Forces', needs: [3], c: [
    ['soot', 'The Black Country', 'A changing world', { spine: 1 }],
    ['casino', 'Drift Casino', 'Genetic drift', { spine: 1 }],
    ['castaways', 'The Castaways', 'Bottlenecks and genetic rescue', {}],   // Batch 1: founders open Drift Casino L4
    ['tap', 'The Leaky Tap', 'Mutation–selection balance', { needs: ['soot'] }],
    ['swamp', 'Gene Swamping', 'Migration against selection', { needs: ['soot'] }]] },
  { act: 5, n: 'Adaptation and coevolution', needs: [4], c: [
    ['bitter', 'Bitter Wings', 'Mimicry', { spine: 1 }],
    ['jaws', 'Left Jaw, Right Jaw', 'Frequency-dependent selection', { spine: 1 }],
    ['hawks', 'Hawks and Doves', 'Evolutionarily stable strategies', { spine: 1 }],
    ['sieve', 'The Sieve', 'Three shapes of selection', {}],
    ['lock', 'Lock and Key', 'The Red Queen', {}],
    ['landscape', 'The Landscape', 'Peaks, valleys and epistasis', {}]] },
  { act: 6, n: 'Behaviour and life history', needs: [5], c: [
    ['forager', 'The Forager', 'Optimal foraging', { spine: 1 }],
    ['crowd', 'The Crowd', 'Choosing where to feed', {}],
    ['livefast', 'Live Fast', 'Life-history trade-offs', {}],
    ['plastic', 'Shape-shifters', 'Plasticity and reaction norms', {}]] },
  { act: 7, n: 'Sex', needs: [5], c: [
    ['sex', 'Why Sex?', 'Muller’s ratchet', { spine: 1 }],
    ['raffle', 'The Raffle', 'Sperm competition', { spine: 1 }],
    ['gametes', 'Two Sizes', 'Eggs and sperm', {}],
    ['lek', 'The Lek', 'Mate choice and honest signals', {}],
    ['brood', 'Fisher’s Brood', 'Sex ratio', {}],
    ['spindle', 'The Selfish Spindle', 'Meiotic drive', {}],
    ['meadow', 'The Meadow', 'Pollinators and plant mating', {}]] },
  { act: 8, n: 'Cooperation and conflict', needs: [6, 7], c: [
    ['alarm', 'Alarm Call', 'Kin selection', { spine: 1 }],
    ['commons', 'The Commons', 'Levels of selection', { spine: 1 }],
    ['nest', 'The Nest', 'Parents and offspring', {}],
    ['bats', 'Blood Debts', 'Reciprocal altruism', {}],
    ['many', 'Many Become One', 'Multicellularity', {}],
    ['guest', 'The Guest', 'Symbiosis and mutualism', {}]] },
  { act: 9, n: 'Genomes and development', needs: [1, 4], c: [
    ['switch', 'Switches', 'Evo-devo', { spine: 1 }],
    ['coal', 'The Coalescent', 'Common ancestry', { spine: 1 }],
    ['copy', 'Copy and Paste', 'Jumping genes and duplication', {}],
    ['sweep', 'The Sweep', 'Selective sweeps', {}],
    ['clock', 'The Clock', 'Neutral evolution', {}]] },
  { act: 10, n: 'Species and macroevolution', needs: [1, 4, 5], c: [
    ['river', 'The River', 'Allopatric speciation', { spine: 1 }],
    ['arch', 'The Archipelago', 'Radiation and competition', { spine: 1 }],
    ['fruits', 'Two Fruits', 'Sympatric speciation', {}],
    ['ring', 'The Ring', 'Ring species', {}],
    ['double', 'Doubling', 'Polyploid speciation', {}]] },
  { act: 11, n: 'Applied evolution', needs: [9, 10], c: [
    ['clinic', 'The Clinic', 'Antibiotic resistance', { spine: 1, needs: [4] }],
    ['virulence', 'The Pathogen', 'Evolution of virulence', {}]] },
  { act: null, n: 'Appendix: the field guide', needs: [], c: [
    ['web', 'The Food Web', 'Trophic cascades', { appendix: 1 }],
    ['islands', 'Islands', 'Island biogeography', { appendix: 1 }],
    ['fire', 'After the Fire', 'Succession', { appendix: 1 }]] }
];   // 52 ids: 48 legacy + royal, tap, swamp, dig (D6 withdrew mixer)
```
Retitles that land with their rebuild (`plan` on the v2 chapter; D3 headers): `fancier` The Breeder · `sieve` Seed Rain · `landscape` Twelve Flasks · `livefast` The Slow Island · `plastic` The Pond · `lek` The Strutting Ground · `brood` The Fig · `castaways` Genetic Rescue. The Lek returns to "Mate choice and runaway" only when the Strutting Ground models runaway.

---

## 11. Testing recipe

### 11.1 For every agent
```sh
cd /home/user/Endless-forms/games/endless-forms/source
OUT=/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/<you>.html
V2_ONLY='0*,zz_*,<unit>.js' python3 build.py $OUT               # engine files (00_, 01_, 02_ …) + your file; omit V2_ONLY for everything
node --check v2/<unit>.js
GAME_HTML=$OUT python3 tests/monkey.py <id> 1,2,3                # 390×780; plays to the end card
GAME_HTML=$OUT python3 tests/monkey.py <id> 1,2,3 --vp 1024x768,1280x720   # E7 adds --vp
node tests/lint_text.js $OUT <id>          # budgets, sentences ≤ 18 words, British spelling, agency phrases, direct fillText, Math.exp/log/pow/sin/cos in v2 files
node tests/oracle.js $OUT <id>             # runs tests/oracle_<id>.js headless (tests/vmgame.js)
python3 tests/bots.py $OUT <id> --seeds 1-20   # five-bot sweep; fails if any bot earns 3 stars in a level
python3 tests/shots.py $OUT <id> --vp 390x780,1024x768,1280x720 --cvd mono,deut --out $(dirname $OUT)/shots_<id>
python3 tests/golden.py check $OUT         # 48 legacy chapters unchanged (ids your file replaces are skipped)
python3 tests/golden.py check $OUT --v1    # once zz_v1switch.js exists: all 48 must match under ?v1=1
```
Known legacy monkey baseline (seed 1, 390×780): **46/48** reach the end card with E7's monkey (it now takes `mendel`, `fancier` and usually `double` to the end); `cross` and `landscape` report stuck (monkey.py `KNOWN` also accepts `double`). The pre-wave build `games/endless-forms/Endless_Forms_v1.html` reaches the same 46 behind the monkey's offline gate, which it fails only because it still loads Google Fonts. Do not "fix" these in chapter files you do not own.

### 11.2 Golden trajectories (architect; done)
- `tests/golden.py record [HTML]` plays each legacy id from seed 7 for 3,000 steps (150 ms each) under virtual time with `Math.random` seeded, WebAudio off and the network blocked, and writes `tests/golden/<id>.json` (a hash per top-level state key and of the HUD text every 50 steps, card texts, end cards, errors) plus `_meta.json` (browser version, git commit). Default HTML: a private legacy-only build of the current source.
- `check [HTML]` exits 1 on any divergence and names the first diverging step, the state keys and the HUD text before and after. New state keys are ignored (noted with `--verbose`); function-valued keys, DOM nodes, canvases and the PLAN-derived `title`, `concept`, `num` are not hashed.
- Determinism proven: two full records (4 and 3 parallel jobs) were identical, and `check` passes against a build from a different path (`games/endless-forms/Endless_Forms_v1.html`). `selftest` repeats the proof.
- Robust to the planned shell edits, each tested on a scratch build at 48 ok: `frame()` on `requestAnimationFrame`, a PLAN rewritten into a different order with a changed subtitle, and different font families (the harness pins `--fd`, `--fb`, `--fm` to system fonts). It still catches real changes: adding 0.04 s to Hunt's morning clock fails `lichen` at step 0 on `m.time`.
- Goldens are per machine and browser (Chromium 141 in this container, recorded from commit ac168f4); on another machine re-record from that commit first.
- Re-record only to change legacy behaviour on purpose (a science fix): `record --ids <id>`, and say why in the commit.

### 11.3 What E7 builds
- `tests/vmgame.js`: `load(htmlPath, {search})` → `{TB, window}`. Extracts the IIFE from the HTML, runs it in `vm` with DOM, canvas (no-op proxy), storage, `performance` and `requestAnimationFrame` stubs. Game code must therefore not need real layout at load, and `sim` code must not touch the DOM.
- `tests/oracle.js <html> <id>`: requires `tests/oracle_<id>.js`, which exports `function (G, t)` with `G = {TB, ch, sim, Det, WF, Gen, seed, R}` and `t.ok(cond, msg)`, `t.near(x, y, tol, msg)`, `t.eq(a, b, msg)`; prints a pass/fail line per assertion; exit 1 on failure.
- `tests/bots.py <html> <id> --seeds a-b`: for each level and bot (always-A, always-B, random, greedy, threshold), runs the sim headless (`reset → act/step → result`) with a tick cap of 2 × the level's minutes; prints a bot × level table of star masks; exit 1 if any mask has 3 bits.
- `tests/monkey.js` v2 support: reads `data-stars` on `.card.end`, clicks `#hud` and `#dock` buttons, never opens Notes for `ch.v2`, drags on `#strip` canvases, treats `.card.lvl` as a level card (clicks the last button), fails a v2 run on `Lbl.warnings` or `Whisper.warnings`; `--vp` viewports.
- `tests/lint_text.js <html> [id]`, `tests/det.js`, `tests/shots.py`, the rAF shim in `vclock.js`, and the Mendel timeout fixed in the monkey or waived with a written reason.

---

## 12. Deviations from D5, and why

| D5 says | This contract | Why |
|---|---|---|
| `Save.d.ui` holds `snd` | `snd` (and `quick`, `opens`, `done`) stay top level; `ui` adds `unt` and `real` | legacy `boot.js`, `hunt.js`, `ch99.js` read them there |
| `URL` module | `Url` | a `const URL` shadows the browser's `URL`, needed for CSV downloads |
| `App.playLevel` "calls `ch.startLevel(n, o)`" | via `App._o` and `App.play` → `ch.start(ch, o)` → `startLevel` | `ch99.js` wraps `App.play(ch)` and drops a second argument |
| tokens CSS on `:root` | `--v-` prefix | D4's `--ink` would overwrite the shell's `--ink` used by legacy cards |
| sim `{step, act, snapshot, restore}` | adds `dt, s, reset, result, actions, bots` | fixed-step replays, headless oracles and the bot sweep need them |
| `Gen.layout` sets `lay.x` for extension fields | also for `det: true`, through `_mateX` | keeps `_gam` byte for byte while giving every v2 layout Det maths with the same draws |
| interim desktop panel for all chapters (D4 §6.1) | v2 chapters only in Batch 0 | polling legacy `notes()` could change legacy runs; no desktop golden yet |

---

## 13. Where the built engine differs from §§3–9 (integration, 14 Oct 2026)

The engine packages E1–E7 each logged their deviations (`docs/changes/wave2/engine_E1.md` … `engine_E7.md`); the integration pass (`engine_integration.md`) checked them together and fixed the cross-file breaks. This section is the short list a unit author needs. **Where it disagrees with §§3–9, this section and the code win.**

### 13.1 Everywhere
| Contract said | The engine does | Why |
|---|---|---|
| `if (!ch.v2) return orig…` | `if (!isV2(ch))`, i.e. `ch.v2 === true` | The Nest counts visits in `this.v2` (E2). |
| juice from `Sim.run`; `Sim.act` returns ev[] | `Sim.run` also returns the events of live `Sim.act` calls; juice from `Sim.run` only | Without it, live taps showed no juice while replays did (integration). |
| percentages on charts | shares are rounded by largest remainder, so a bar reads 48% + 52%, never 48% + 53% | integration |

### 13.2 `core.js` (E1)
- A legacy layout returns exactly `{specs, T, L}`; `lay.x`, `lay.det`, `lay.sexed`, `lay.nextId` exist only on extension layouts (the golden harness hashes `Hunt.lay`).
- The stored save is a **compact form**, not `JSON.stringify(Save.d)`; `Save.size()` measures the stored string (worst case 3,213 characters). New `ui` or top-level fields cost space: keep them short and store them only when set.
- base64url **without padding** for snapshots and save codes; `Save.res.put` returns the string (≤ 92 characters).
- `Gen.pack` → `{v: [2L values], id?, pa?, lin?, sex?}`; `Gen.unpack` takes that or a plain array. Sexed layouts store `g.sex` and throw without `o.sex`. `Gen.hap` needs every trait to have `ploidy`.
- `star2` migrates first (a deep link reaches `playLevel` without `App.open`). Under SCORM there is no v1 import and no IndexedDB mirror. `fromCode` replaces the save.
- `'fx'` events are dropped unless `Events.debug`; `lat()` returns null for an act with no fx after it.

### 13.3 Shell (E2)
- Throwing hooks are reported once and dropped. `Hooks.dt` results are used only when a number ≥ 0. `Hooks.chartPointer(i, 'down'|'move'|'up', x, y, cv)` in CSS px; `move` only while a pointer is down.
- Under vclock with a native rAF, `frame()` uses `setTimeout(frame, 16)`; with the shim it uses rAF (same 40 ms virtual cadence).
- `Teacher.on` = `Url.teacher && !Url.v1`, and teacher mode seeds legacy runs too (same draws, new start state).
- `Dock.set` buttons also take `{id, el}`, `why`, `busy`, `pressed`; a disabled button is `aria-disabled` (focusable; a tap shows `why`). Dock keys run after global keys, before `onKey`.
- `LevelSelect.open(ch)` ("Levels" on each v2 menu row and in the v2 play bar); `Shell.prefs()` sets `readable`, `calm`, `lh` body classes from `Save.d.ui`. Fonts: Core, Greek-and-symbols and Readable packs are embedded.
- `boot.js`: `?lab=<id>&dev=1` opens SceneLab; an unknown lab id falls through to `?unit=` (integration).

### 13.4 Look and maths (E3)
- `Pal.allele(i)` returns `{fill, overlay, over, letter, text, outline}` (its `toString()` is the fill). `Pal.place(id)` adds `raw`, `plate`; unknown ids fall back to the Lab.
- The legacy theme adapter maps cabinets by hue (light cabinets to the Lab plate) and applies only when text keeps ≥ 4.5:1. `#scr-play.v2` remaps the shell's legacy CSS variables onto the `--v-` tokens.
- `CVD.apply` filters `#app, #cards, #toasts, #sheet`; `CVD.pairs` returns failures only (`{all: true}` for every pair); extra lints `hue`, `gamut`, `agree`, `lint(ch)`.
- `Fx.clear()` clears everything; on `Hooks.play` only effects made before the new level began (input/frame epoch), so what `startLevel` creates survives. Extras: `Fx.flash` (≤ 2 a second, none in Calm), `Fx.squash`, `Fx.count`, `Fx.errors`. Calm caps tiers at 300 ms; hit-stop also freezes particles.
- Outside v2 chapters the whisper sits in `#toasts`, queues up to three lines and keeps the old toast duration; the 8-word warning applies only in v2 play.
- `Ghost.show(o)` → `{hide(), active, shown}` (`shown: false` when the verb is known, in teacher mode or under `?v1=1`); `o.key`, `o.say`, `o.pop`, `o.force`. `Snd2` twins via `{x, y}`; `Save.d.ui.cc` adds captions.
- `WF.binom(n ≤ 0)` draws nothing; `multinom` normalises; `run` returns gens + 1 rows; ghosts take `ploidy` (default 1); extra `WF.ghost.absorb`.

### 13.5 Entry, cards, replays (E4)
- Level cards show `o.take`/`o.body` only when passed (the unit's TAKE and body default on the final card). The first star the unit still lacks shows its `content.stars` line. Why? and What if? appear only when there is something to show.
- `Freezer` vials carry level and seed; `list(id)` gives the current level's vials; a fresh start of a level clears them; `put` ignores a finished sim.
- `Snap` handles all nine typed-array kinds, Gen expandos and non-finite numbers. `ResultCode.show(code)` formats "K7M 2QX"; the code row shows only for chapters with `resultBits(s, level)` on an assignment link (`?unit=…&seed=…`).
- A legacy-shaped `End.show(ch, {stars, insight})` on a v2 chapter opens a v2 card but records no stars.

### 13.6 Widgets (E5)
- **Predict:** see §7.2 (tap the ghost to commit; the band hatches around your mark, then `reveal` moves it). `overlay(i)` returns the whole ask record. `Events` `predict` is emitted at commit and again at reveal (`reveal: true`). The soft timer counts real seconds while the stage is live, never commits while a pointer is down, and is off in untimed mode whatever the chapter passes. A tap within 24 px of the ghost commits, so a small nudge needs a drag or the arrow keys.
- `LiveGraph` also draws `deme`, `price`, `tree`, `genome` (spec in E5's log); a typed chart skips its own title when the strip's caption shows it; the top y tick carries the axis label ("1 A share").
- `Evidence` purchases are view-level: a chapter whose `sample(n)` draws `R()` must route buys through `Sim.act` (`onBuy`). `Chips.dist` divides by the stake. `Invasion` also takes `payoff`, `M`, `from`. `GenePoolLens` takes `key` (default L), `names`, `onChange`.

### 13.7 Hunt, rigs, scenes (E6)
- Hunt-mode v2 chapters get `ch.startLevel(n, o, Hn)` **before** the population is built (set `N, cap, roundTime, traits, maxGen` and §8.1 fields per level), and end with `End.show(ch, {level, mask, final, …ch.result(Hn, o)})`, the mask coming from `ch.stars.{discover, predict, transfer}(Hn, level, o)`.
- Moths are placed in a fixed virtual 390 × 540 stage below the HUD band, so runs are viewport-independent. Hunt actions are logged through `Sim.act`, but **Hunt chapters have no replay, Freezer or bot sweep yet**.
- §8.1 fields gained options: `trunks.ghost.{d, catch}`, `predict.{axis, chart, start, soft, at, every, until}` (and `from` may be a function), `untimed.bitterLooks`, `migrants.mark`, `lens.{k, letters, names}`, `species[].{kills, rig, init}`; `toxicity` may return `{s, starve}`. `Hn.bag` adds `need, chicks, total`. Ids come from a session-wide `HuntX.uid`.
- `HuntX.WORDS` holds default HUD, whisper and label words; override each key in `content`. `HuntX.camo(ph, T, o)` is the Lichen match with `Det.exp`.
- `Rig.draw` options add `notch, alert, genes, letters, alpha`; `Rig` adds `row, paints, recipe, has, clear, cached, pixels, ground, defGround`. The moth uses 32 tone bins and no ink outline (tone is what is selected). All D5 §4 rigs and both Batch 3 scenes exist.

### 13.8 Tests (E7) and the integration pass
- The monkey seeds `R()` and `Math.random` per run, fails v2 runs on `Lbl`, `Whisper`, `HUD` and `Dock` warnings, and blocks the network. The lint uses -ise spelling and exempts `// cosmetic` as well as `// ghost-only`.
- `tests/vmgame.js` now matches descendant and child selectors (`'#sh-tabs button'` no longer matches every button).
- `docs/design/v2_chapter_skeleton.js` now lints clean, asks for the a share with `axis.rev`, scores Transfer against the expectation, and passes the five-bot sweep on seeds 1–40.
- Every engine package ships `tests/selftest_e<N>.js` (and a Chromium runner); run them all after an engine change, plus `python3 tests/selftest_integ.py` (the integration smoke: title, Begin and a legacy card at 390×780 and 1280×720, with and without `?v1=1`; then `tests/fixtures/integ_fixture.js` registered, played through Sim, LiveGraph, Predict, Fx and both v2 cards, and its stars saved and reloaded).

---

## 14. Engine changes after Batch 1 (coordinator, 15 Oct 2026)

Every change below is additive and v2-only (or a test fix): golden 43 ok + 5 replaced (48 ok under `?v1=1`), and the five units still pass their oracles, bots and monkey. `tests/selftest_b1.js` covers all of it (55 checks). Why each exists: `docs/changes/wave2/lessons_batch1.md` §3.

### 14.1 Stars across levels
- **`ch.unitStars(levelMasks) → mask`** (optional). `Save.star2` and the save loader build the unit mask with it instead of the OR of the level masks, so D1's cross-level rules can be written: `unitStars(lv) { const d = lv.filter(m => m & 1).length; return (d >= 2 ? 1 : 0) | … }`. `levelMasks` is a copy of `Save.d.lv[id]` (one 0–7 mask per level played; 0 for an unplayed level below the furthest one). Without it, nothing changes.
- **Per-level star lines.** `End.show(ch, {…, stars: {discover, predict, transfer}})`, else `content.levelStars[level]`, else `content.stars`. The card's "still to earn" line names the first missing star that has a line, so give a level only the stars it can award. (Lichen, Hawks and Casino used to swap `content.stars` around `End.show`; they now use this.)

### 14.2 Cards (`00_entry.js`)
- **Per-level words.** On a level card (not the final card, not a thawed What if? run), an undefined `o.take`, `o.body` or `o.why` is filled from `content.levelTake[level]`, `content.levelBody[level]` or `content.levelWhy[level]` (`{real, maths}`). Pass `null` to show nothing. The lint knows these keys and their budgets (take 20, body 60, why 60 a chunk, star lines 15), plus `whatifBody` (60), `live` (25, warning) and `data` (text checks only). Any other unknown content key is now text-checked too.
- **`o.bodyFirst: true`** puts the body above the chart (a boss card whose words matter more than its chart on a phone).
- Why? and What if? panels scroll to the middle of the card when opened (they used to open under the sticky buttons on a phone).
- `Entry.split` no longer breaks Why? chunks at a decimal point ("11.5").
- **Resume.** Opening a v2 unit from the menu (and Begin into the Wood) starts just past the furthest level finished (`Entry.resume(ch)`), or at L1 once the unit is done. "Levels" still reaches any level.
- `Freezer.put(id, gen, snap, {force: true})` keeps a snapshot of a finished sim (for levers that change the ending).
- `ACT_PLAN`: The Castaways' subtitle is "Bottlenecks and genetic rescue" (its founder level now opens Drift Casino L4).

### 14.3 Predict (`01_widgets.js`)
```js
Predict.ask({…, needMove, onStill, onTimeout, linger})
  // needMove: an untouched ghost never commits. A tap on it, Enter or Predict.commit() calls onStill({id}) instead (whisper
  //   "drag first" in your words); the soft timer closes the ask without a commit and calls onTimeout({id, moved: false}) —
  //   send your own logged action (e.g. {k: 'void', id}) so the sim knows there was no prediction
  // linger: ms the phone strip stays open after a commit (default 900, was 1500); 0 folds at once
  // onCommit({id, v, moved})   moved: the player dragged, tapped off the ghost or used the arrows
Predict.clear(chart)   // drop the ghost, band and expectation on one chart index; clear() drops all (use when a chart changes meaning)
Predict.fold()         // fold the phone strip now if an ask opened it and no ask is active
Predict.opened         // true while the strip is open because an ask opened it
```
P now always focuses the ghost (a second P no longer unfocuses; Escape leaves). Units must not touch `Predict._by`, `_opened` or `_exit` (Census and Casino now use the calls above).

### 14.4 LiveGraph compact mode
A chart under 100 CSS px tall (the folded 112 px phone strip) is drawn compact: no title, legend, end labels, axis labels, y numbers or "you" words; marks, lines, x numbers and the Predict ghost stay. `spec.compact: true | false` overrides the height rule; a custom type reads `T.compact`. A chart spec with **`fold: false`** is hidden while the phone strip is folded and shown when it opens, so the folded strip can show one readable chart instead of two thin ones.

### 14.5 Shell, look and keys
- **`HUD.say(text, num, {first})`**: `content.firstWords` (detected, or `first: true`) may run to 40 words (D4 §3); every other line warns above 15.
- **Whisper** sits 8 px under the HUD's real height (it used to sit at a fixed 64 px, under a wrapped HUD). A chapter with `whisperAt: 'centre'` gets a top-centre slot. **`Whisper.drop()`** hides the current line now.
- **`Fx.after(ms, fn) → {cancel()}`**: a timer on the live frame clock (paused with the stage, frozen by hit-stop, dropped by `Fx.clear` and on a new level), for telegraph-then-act juice. View only.
- **`Ghost.show({verb, el})`**: `el` (an element or a function returning one) rings a DOM control such as a dock button, with the hand. Use it to teach an action that lives only in the dock.
- **Keys:** `Hooks.keyup` and a chapter's **`onKeyUp(key, e)`** (v2 only), so a key can be held (Space in a war of attrition). Escape closes the Levels and Settings popovers; on a v2 level or end card it returns to the notebook (reopening the unit resumes).
- **Settings card** (`Settings.open()`, `Settings.set(k, on)`): Untimed, Calm, Readable and Left-handed, stored in `Save.d.ui` (`unt`, `calm`, `read`, `lh`). Reached from the menu footer and the Levels popover; hidden under `?v1=1`. Untimed is read when a level starts.
- **`?calm=1` and `?untimed=1` work in every build** (they were dev-only); `?untimed=1` sets `Save.d.ui.unt` at boot. `Url.untimed` is the parsed flag.

### 14.6 Tests
- `tests/lint_text.js`: the `// cosmetic` / `// ghost-only` exemption no longer starts at a file's header comment (a block comment may not run past its own `*/`); `LEVEL_WAIVER = {census: 8}` (D6); the per-level content keys above; "Practice" the noun is no longer flagged.
- `tests/selftest_b1.js` (new): the whole of §14, headless.
- `tests/selftest_e2.js` and `tests/selftest_integ.py` no longer assume Lichen and Casino are legacy chapters: E2's legacy checks use the first still-legacy chapter (Lichen, else an appendix chapter), and the integration smoke follows Begin into the live Wood before it checks the menu. Both now pass on a full build with every unit (they failed 11 and 1 checks there before).

### 14.7 Still open (not built)
Hunt-mode replay, Freezer and bot sweep (no Batch 1 unit used Hunt mode; see the lessons); crowd-tier rigs (moth rest pose, hermit crab, beetle); `Pal.allele` B and I reuse the two data inks; a banner allowing 5-word level names; a "?" state for the `pq` chart; the class tournament and class-pool charts; projector-scaled strip charts; an empty-dock state (fill an empty dock with a `{id, el}` status element meanwhile); act locks from `needs`; the station map; axe-core. The primary button stays carmine (D4 §6); never use it to encode a choice (Hawks).

---

## 15. The opening description card and the chapter accent (D6 decisions 7–8, 21 Oct 2026)

D6's addendum overrides D5 decision 18 ("no card before the first action"): **every v2 chapter opens with a short description card**, and each chapter tints the shared chrome with its own accent colour. `00_entry.js` (`Intro`) draws both for every v2 chapter; a unit supplies only words and a colour. Log: `docs/changes/wave2/intro_card.md`.

### 15.1 What a unit supplies
```js
const CH_X_V2 = {
  id, v2: true, place, accent: '#6F8A45',   // #rrggbb; the chapter's chrome tint. Not a data ink: keep it ≥ ΔE 8 from them (CVD.gamut)
  content: {
    intro: {                                 // required (tests/lint_text.js errors without it)
      game:    'What you are and what is happening.',      // 1–2 sentences, ≤ 35 words each (sentences ≤ 18 words)
      biology: 'The idea the chapter teaches, in plain words.',
      how:     'The controls and the goal.'
    },
    firstWords, …                            // unchanged: the HUD line and the ghost hand still teach the first action
  }
};
```
- Write for the whole unit (the card shows whichever level the player starts at), plain British English, D0 agency rules ("populations evolve"; never "individuals evolve, choose or need"). The text lint checks the budget, sentences, spelling and agency; more than two sentences is a warning.
- Without `content.intro` the card falls back to `intro.goal` as "The game" (and the lint fails). Without `accent` it uses the shell's carmine `Intro.DEF`.

### 15.2 When the card shows
- On **entering** a v2 chapter from outside it: the menu (`App.open`, including resume), **Begin** into the Lichen Wood, **Next unit**, Levels from the menu, and `?unit=` links. The `App.playLevel` wrap opens it *after* `startLevel` has run, so the level's world is drawn once behind the dimmed card (`Intro.peek`), and a card pauses the stage (`stageLive`): the sim, the soft Predict timers, `Fx.after` timers and the ghost hand all wait.
- **Not** on Next level, Replay level, Levels from inside the chapter, What if? thaws (`o.thaw`), replays (`o.replay`), under `?v1=1`, with `?intro=0`, or while `Intro.off` is true (scripted screenshot tools may set `TB.Intro.off = true`).
- **Play** (or Enter, Space, Escape) closes it and the level starts. The opening card also has **Notebook** (back to the menu).
- The dock's **"?"** button (`#dock .ef-q`, `data-id="ef-intro"`, first in the dock, outside `Dock.items`) or the **?** key reopens it during play, which pauses the level; **Resume** (or Enter, Space, Escape, ?) continues and returns focus to "?". On a fine pointer the reopened card also offers **Keys** (the old ? list, `Keys.help`). In legacy chapters the ? key still opens the keys list.

### 15.3 Engine details a unit may rely on
- **The ghost hand survives the card.** Pointer and key input on the card, and on "?", is stopped in a window capture listener registered before `00_fx.js`'s, so `Ghost._input` and `Fx._input` never see it: a demo started by `startLevel` still plays once the card closes, and the unit's own `Ghost.show` handle stays valid.
- `Dock.set` is wrapped to put "?" back after every call; do not count `#dock` children, use `Dock.items`. The dock still holds at most four of the unit's own buttons.
- **Chrome tint** (`Intro.chrome`, on `Hooks.play`): `#scr-play` gets class `ef-tint`, `--ef-acc` (the accent) and `--ef-surf` (the dusk surface with 8–16% of the accent, chosen so `--v-text` keeps ≥ 7:1 and `--v-text2` ≥ 4.5:1). The bar gets a 3 px accent rule underneath, the dock one on top, and the strip, dock and HUD take `--ef-surf` as `--s-surface`. LiveGraph halos still use `Pal.surface`, which differs by at most 16% of the accent.
- **Card colours** (`Intro.tint(ch)`): the header band and the Play button use the accent, darkened or lightened until their text keeps ≥ 4.5:1; the part labels use the accent darkened to ≥ 4.5:1 on the card's paper; the card body is paper with 7% of the accent.
- **Accessibility:** `role="dialog"`, `aria-modal`, `aria-labelledby` (the title) and `aria-describedby` (the three parts); Play takes focus; Tab cycles inside the card; Play carries `aria-keyshortcuts="Enter Space"`; "?" carries `aria-label="About this chapter"`, `aria-haspopup="dialog"`, `aria-keyshortcuts="?"`. A live-region line names the chapter.
- **Layout:** phone first (390 × 780 fits without scrolling at ~100 words), max width 480 px on desktop, a compact variant under 700 px of height, 56 px Play button.
- `EXPORT.Intro` (`TB.Intro`): `open(ch, {first})`, `go()`, `on()`, `tint(ch)`, `off`.

### 15.4 Tests
- `tests/monkey.js` fails a v2 run whose chapter does not open on the card (`no-intro`), checks the card's text for NaN/undefined, presses Play (or Enter), and now and then presses "?" mid-level and resumes. Its report adds `intros`.
- `tests/lint_text.js`: `content.intro.{game, biology, how}` required, ≤ 35 words each (`BUDGET.intro`).
- Screenshot tools that drive a unit through `App.playLevel` from the title screen will meet the card: click `[data-play]`, or load with `?intro=0`.

