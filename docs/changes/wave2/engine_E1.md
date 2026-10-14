# Wave 2, work package E1: `core.js`

Files: `games/endless-forms/source/core.js` (owned), `games/endless-forms/source/tests/selftest_e1.js` and `tests/selftest_e1_browser.py` (new; API_v2 §2 gives each engine package its own self-test).

Contract: `docs/design/API_v2.md` §3 (and D5 §5.2). Everything in §3 marked [B0] or [B0-simple] is in, plus the Gen extensions marked "later" that cost little now (`hap`, `clone`, `track`). Legacy behaviour is unchanged: the golden check is 48 ok against this `core.js`.

## What I built

| Area | API | Notes |
|---|---|---|
| RNG state | `R.state()`, `R.restore(s)` | int32 state of the shared `R()`. |
| `Det` | `exp log sin cos pow gauss poisson` | Uses only `+ − × ÷`, `Math.sqrt/round/floor/trunc/abs` and a `Float64Array`/`Uint32Array` view (for the exponent in `log`, and to build an exact table of powers of two). The order is fixed (Horner). `exp`: fdlibm split of ln 2, degree-13 Taylor, scaling by 2^k, one rounding into the subnormals. `log`: m·2^e with m in [√½, √2] (subnormals scaled by 2^54 first), atanh series to s²¹. `sin/cos`: three-part Cody–Waite reduction, Taylor to r¹⁷ (sin) and r¹⁸ (cos). `pow`: squaring for integer \|y\| ≤ 64, else exp(y·log x). `gauss` and `poisson` are the legacy algorithms with `Det` inside: the same `R()` draws. |
| `Gen` | `layout genome mate mateX hap clone allele mph mfreq freq ph pack unpack` | The legacy bodies are unchanged byte for byte. `layout`, `genome`, `mate`, `ph` and `freq` each got one first line that sends extension layouts (`lay.x`) to `_layoutX`, `_genomeX`, `_mateX`, `_phX` or `_freqX`. `_gamX` and `_genomeX` make the same draws, in the same order, as `_gam` and `genome` for the legacy kinds (`dom`, `count`, additive); with `det: true` they use `Det.gauss`/`Det.poisson`. Ext 2 multi-allele, Ext 3 ploidy `'X'`/`'hap'` and Ext 5 tracking are built. Ext 1 `link` and Ext 4 `fx` are accepted by `layout`; `mate` throws `Gen ext link: not yet` / `Gen ext fx: not yet` (`ph` also throws for `fx`). `ploidy: 4` throws in `layout`. |
| `Save` v2 | `k d load save star star2 migrate code fromCode size adapter onLoad res.put res.get` | Key `ef_v2`. On first run it imports `stars, quick, snd, done, opens` from `endlessforms_v1` and never deletes that key. Adapters are tried in this order: SCORM 2004 `API_1484_11` or 1.2 `API` (searched through `window.parent` up to 7 levels, then `opener`; uses `cmi.suspend_data` and sets exit = suspend), then `localStorage` in try/catch, then memory plus `Save.code()`. IndexedDB (`ef` database, `save` store, key `d`, record `{t, s}`) is a write-behind mirror. It is read at boot only when the synchronous store was empty or threw; if it holds a save, that save is adopted, written back, and `onLoad` listeners run again. Writes wait until that read has finished, so the mirror cannot be overwritten first. `save()` never throws. |
| Resident snapshot | `Save.res.put(place, snap)` → base64url string; `Save.res.get(place)` → snap or null | The exact §3.4 byte layout. At most 69 bytes (nf ≤ 16, np ≤ 4), which is 92 characters. Out-of-range values are clamped, and extra freqs or pins are dropped. |
| `Events` | `emit on log csv clear debug lat` | `emit` stamps `{t, type, unit, level, seed}` and then adds the data fields. `unit`, `level` and `seed` are read from `App` when emit is called (safe in Node and before `ui.js`). A ring buffer keeps 5,000 records. `'fx'` is ignored unless `Events.debug`. `csv()`: header `t,type,unit,level,seed,data`, with data as JSON and RFC 4180 quoting. `lat()`: ms from each `act` to the next `fx`. |

### How the save is stored (for anyone reading `localStorage` or a save code)

`Save.d` in memory has exactly the contract shape. The stored string is a compact form, because the plain JSON of a full save comes to 5,917 characters in the worst case below, well over the 3,500 budget. The compact form:

```
{schema: 2, u: {id: 'S[.LLLL][!]'}, res: {place: b64}, ui: {non-default fields}, rev: {box: 'code code …'},
 quick: 1, snd: 0, opens: n, x: {any other top-level keys of Save.d}}
```

`S` is the legacy star count, or `v1stars` once the unit has been migrated. `.` marks a migrated unit and is followed by one octal digit (the star mask) per level. `!` means done. `s2` and a migrated unit's `stars` are rebuilt from the level masks on load. **Worst case** (60 units migrated with 6 levels of 7, legacy stars, done, 16 full snapshots, 100 review codes, every ui field set): **3,213 characters**, under 3,500 and under SCORM 1.2's 4,096. Most of it is the 16 snapshots (16 × 92 characters). New `ui` or top-level fields from other modules count against what is left, so keep them short.

## Deviations from API_v2 (and why)

1. **Legacy layouts carry no new fields.** `Gen.layout` returns exactly `{specs, T, L}` unless some spec uses an extension. On a legacy layout, `lay.x`, `lay.det`, `lay.sexed` and `lay.nextId` are absent, so they read as falsy. The golden harness hashes `Hunt.lay` deeply, so even `x: false` would change every Hunt fingerprint. Extension layouts have all four fields, plus `lay.track`.
2. **The stored save is compact**, not `JSON.stringify(Save.d)`. `Save.size()` measures the stored string. The reason is the 3,500 budget (see above).
3. **base64url without padding** for snapshots and save codes. The decoder also accepts `+ / =`. A snapshot costs ≤ 92 characters instead of 128.
4. **`Gen.pack`** returns `{v: [2L values], id?, pa?, lin?, sex?}`. `Gen.unpack` accepts that or a plain array of 2L values. It moves `lay.nextId` past any id it restores. A unit that needs ids of dead individuals to stay unique should store `lay.nextId` in its sim state.
5. **Sex is stored on the genome** (`g.sex = 'f' | 'm'`) on sexed layouts. `genome` and `mate` throw if a sexed layout gets no `o.sex`.
6. **Haplodiploidy.** `Gen.hap` throws unless every trait has a `ploidy`, because a haploid son with an autosomal diploid trait makes no sense. `Gen.mate` on `'hap'` traits makes diploid young of either sex. Haploid males come only from `Gen.hap`.
7. **Absent copies.** −1 means "absent" only on traits with `ploidy`, since an additive allele could legitimately be −1. On an additive X trait, a male's single copy counts once in `ph` (no dosage compensation). The legacy `Gen.add` and `Gen.cnt` are untouched, so they add −1 as a number. `Gen.dom` works unchanged.
8. **`star2` migrates first.** A `?unit=` deep link reaches `App.playLevel` without `App.open`. Without this, `star2` would overwrite a legacy best before it was moved to `v1stars`.
9. **Under SCORM**, there is no import from `endlessforms_v1` and no IndexedDB mirror. The LMS is authoritative, and on a shared classroom computer local storage may belong to another student. If the LMS refuses a write, a local copy is kept.
10. **`?v1=1`** uses the legacy key and the legacy record shape, with localStorage only (as the legacy game did). `Save.d` in memory still holds the v2 defaults (`ui`, `res`, …), so a v2 module that reads `Save.d.ui.calm` cannot crash under `?v1=1`. Only the legacy fields are written. `Save._v1()` reads `Url.v1` when `Url` exists, else `location.search`.
11. **`'fx'` events** are dropped entirely when `Events.debug` is false: they are not logged and listeners do not see them (cheap on every juice call). `lat()` returns `null` for an act that no fx followed. CI decides what that means.
12. **`fromCode` replaces** the save rather than merging it, which matches "resume on another device". It also accepts a legacy v1 record.
13. **Determinism caveat (honest).** `Det.poisson` (λ ≤ 30) loops until a running product falls below `Det.exp(−λ)`, where the legacy code compares with `Math.exp(−λ)`. The two values can differ in the last bit. So in principle the number of draws could differ when the product lands exactly between them, at about 1e-16 per call. In every test the sequences matched. Between `Det` builds there is no such issue: `Det` is bit-exact.
14. `Det.sin`/`Det.cos` beyond |x| = 1e5 stay deterministic but lose accuracy. `Det.pow(x, y)` for non-integer y has a relative error of about |y·ln x| × 1.1e-16, so it is ≤ 1e-14 while |y·ln x| ≲ 90.

## Notes for other packages

- **E2:** `boot.js` should add `Det` and `Events` to `window.TB`, as §4.8 says. My browser test injects them itself until then. `Save.onLoad(fn)` fires after `load()` and again if IndexedDB brings an older save back: re-render the menu there. `App.seed` and `App.ch.level` feed `Events`.
- **E4:** `Save.star2` returns the unit's stars and migrates by itself. `Save.d.done[id] = 1` is still yours to set. `Save.res.put/get` are ready for Lichen L3. Save codes use base64url with no padding (`Save._b64e/_b64d`, `_utf8e/_utf8d` can be reused for `Replay`).
- **E6:** `det: true` on any spec gives Det maths with the legacy draws, so `02_hunt_ext` only needs to add it to the copied specs.
- **E7:** the Det bit fingerprint (FNV-1a over 3,000 outputs) is `811a6df1` in Node 22, in Chromium 141, and in an independent CPython port of `Det` (same constants and operation order). That makes three implementations, two of them different language runtimes. The port is a 90-line Python file. I can add it as a reference for `tests/det.js` if you want it (it lives in my scratchpad as `det_ref.py`).

## Tests

| Test | Result |
|---|---|
| `node --check core.js` | clean |
| `node tests/selftest_e1.js` (Node vm, fresh context per scenario) | **114 passed, 0 failed.** Covers: R state; Det accuracy (worst relative error ≤ 1e-14 over 20,000 random inputs per function, plus pow over integers 1–64), special values, subnormals, overflow edge and bit fingerprint; Det.gauss/poisson against legacy (same `R()` state after 2,000 draws, values within 1e-13); Gen legacy layout shape; an x layout without det **bit-identical** to legacy over genome + 5 generations of mate + ph; a det layout with the same `R()` sequence, values equal up to float32 rounding; multi-allele draws, shares, dominance, codominance and mutation; X-linked sons and daughters, draw counts, freq/mfreq of present copies; haplodiploid sons and workers; tracking ids, parents and lineages; clone; pack/unpack through JSON; link/fx/ploidy-4 errors; Save import, migrate, star2, round trip, code, onLoad, snapshots (≤ 96 bytes, clamping), worst-case size, `?v1=1`, memory adapter, corrupt data, SCORM 1.2 and 2004 mocks two frames up; Events stamps, listeners, fx/debug, lat, CSV quoting, ring buffer, no-App case. |
| `python3 tests/selftest_e1_browser.py BUILD` (Chromium, served over http; run on the ac168f4-shell build and on the shared tree) | **9 of 9 ok on both:** Det fingerprint in Chromium; localStorage adapter; Events in the page; **D5 gate: in an iframe where localStorage throws, the save survives a reload** (memory adapter + IndexedDB mirror, adopted on reload); save code in memory mode; SCORM 1.2 API found two frames up, suspend_data and exit written, resumed after reload. |
| `python3 tests/golden.py check` on a build of **this `core.js` with `ui.js`, `boot.js` and `shell.html` from ac168f4** (the commit the goldens were recorded from), legacy only | **48 ok, 0 failed** |
| `python3 tests/golden.py check --v1` on the same build | **48 ok, 0 failed** (exercises the `?v1=1` save path) |
| `golden.py check` on the shared working tree (this `core.js` + E2's in-progress `ui.js`/`boot.js`/`shell.html`, also in the WIP commit 69f8380) | 47 ok, **`nest` fails** at step 850 (`m.chicks`, `m.feeds`), in both modes. **Not from core.js:** the same failure appears with the *original* `core.js` and E2's shell files, and `nest` passes with this `core.js` and the ac168f4 shell. Flagged for E2. |
| `tests/monkey.py` on all 48 legacy ids, seed 1, 390×780 | **43 of 48 reach the end card.** `mendel` and `fancier` time out; `cross`, `landscape` and `double` are stuck. That is exactly the §11 baseline. A baseline build (original `core.js`) run on 20 of the ids gave the same statuses. |

The monkey does not seed `R()`, so its step counts and stars vary between runs of the same build. A baseline build gives the same spread. The golden check is the exact comparison.
