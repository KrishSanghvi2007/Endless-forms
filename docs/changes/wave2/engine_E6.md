# Wave 2, work package E6: Hunt extensions, rigs and scenes

Files (owned): `games/endless-forms/source/v2/02_hunt_ext.js` (622 lines), `v2/01_rig.js` (510), `v2/01_scenes.js` (215).
Tests (new, E6's own, as API_v2 §2 asks): `tests/selftest_e6.js` (Node vm, with a private fixture chapter) and `tests/selftest_e6.py` (Chromium). Nothing else was edited.

Contract: `docs/design/API_v2.md` §8 (with §1 ground rules and §9.1 for Hunt-mode chapters), D1 §2.2 and §3.1, D5 decisions 13, 14, 16, 19, 22, 24 and §4, D4 §1.2, §1.4, §2.2, §4.1–4.4, §5.3, §7, §8. D6 changes nothing in this package. Everything in §8 is in, including the Batch 2 items (`species`, the D5 §4 rigs) and the Batch 3 scenes. `net` is still a reserved name. Deviations are listed at the end.

## What I built

### `02_hunt_ext.js`: Hunt, wrapped

`Hunt` is wrapped, never forked. `start`, `mk`, `morning`, `tap`, `update`, `endRound`, `interlude`, `nextGen`, `finish`, `draw`, `panel`, `updPanel`, `notes` and `ensureBg` each call the legacy function unless `isV2(this.ch)`. The wraps load after `ch99.js`, so they are outermost, and a v2 chapter never reaches ch99's Lichen predict card. `down`, `move`, `up` and `onKey` are non-enumerable getters that read `undefined` for a legacy chapter, so `Stage` still calls legacy `Hunt.tap` on pointerdown exactly as before. `Hunt.barkAt` is also non-enumerable, so `Object.keys(Hunt)` is unchanged.

Under `ch.v2`:
- every trait spec gets `det: true` (Det maths in `Gen`, same draws); `quick` is off; `_pAsked` is set;
- `ch.startLevel(n, o, Hn)` runs before the population is built, so a chapter sets `N`, `cap`, `roundTime`, `traits`, `maxGen` and the extension fields per level;
- the HUD is one `HUD.say` line (`firstWords` before the first action, then "{n} of {m} eaten." with seconds or looks as the live number); a thin timer bar sits under the HUD band and flinches 4 px on a miss;
- dawn is a 0.5 s fade, and a tap at dawn starts the morning and counts (D4 §7: the first action cannot fail);
- the peck follows D4 §5.3: an `Fx.tier(1)` at once, a beak shadow growing for 90 ms, then three dust puffs and a dashed 2 s ghost ring; the moth lifts 6 px as it fades; "+1" pops on the chick that was fed and the chick squashes (220 ms); a miss is one puff and the timer flinch;
- a bitter mouthful (a model or a toxic species): the insect staggers off alive, `Fx.shake`, an edge flash (luminance, not hue) and a 50 ms hit-stop;
- the dusk card is replaced by an in-canvas dusk: eggs and cull (with `overproduce`), the survivors slide into chart 0 over 600 ms, then a `Predict` gesture on prediction generations, then `nextGen`. `ch.dusk(Hn, rec, done)` replaces all of it. "Lock in" (Enter) sits on the dock while the gesture is open; the soft timer commits it in timed mode;
- a level ends on E4's v2 level or end card: `End.show(ch, {level, mask, final, interesting?, chart?, ...ch.result(Hn, o)})`, with Discover, Predict and Transfer bits from `ch.stars.{discover, predict, transfer}(Hn, level, o)` (a legacy `stars(Hn, o)` count n gives the lowest n bits);
- taps, bird-rule catches and rule changes are logged through `Sim.act` (`Sim.start` resets the log per level);
- `notes()` falls back to a dot-histogram of this morning (eaten hollow, spared solid, young hatched) with S and R arrows and a bark marker; `ch.notes(Hn)` replaces it.

The fields, all opt-in on the chapter:

| Field | What it does now |
|---|---|
| `bag: {need, chicks}` | catches feed a canvas row of `chicks` nestlings (the `chick` rig) round-robin; each fattens as it is fed and gapes while hungry. At dusk a shortfall starves ⌈short ÷ (need/chicks)⌉ chicks, shown as dashed ghost rings. `Hn.bag = {need, chicks, fed, starved, total}`. |
| `barks: [{tex, seed?, mask: {scale, cut, seed?}}]` | each bark texture is composited over the first through a `makeNoise` mask (soft 2.5% edge, built at quarter resolution). `Hn.barkAt(x, y)` reads the same noise, so the bark index under a moth always matches the picture; `ch.match(ph, barkIndex)`. The masks are made at `start` in stage fractions, so the index never depends on the canvas size. |
| `searchImage: {streak, switchCost, glintAfter}` | the same `ch.morph(ph)` again refunds `streak` s (never above the round time); a switch costs `switchCost` s and draws a 300 ms refocus veil; after `glintAfter` s without a catch the most conspicuous moth (lowest `ch.match`) glints. Untimed: a switch costs a look. |
| `trunks: {n, hunted, ghost: {jays, bmin, bmax, d, catch}}` | each night the moths are shuffled onto n trunks in equal shares; you see and hunt one (`hunted`, a number or a function). At dusk, before the record is made, the ghost jays take each other trunk's catch one moth at a time with morph share ∝ dᵢ·aᵢ^b (`Det.pow`), where b is the maximum-likelihood fit to your catches over the last three mornings (each catch drawn from what was left on the trunk; Det maths on a 0.01 grid; clamped to [bmin, bmax]; a flat likelihood gives 1). `Hn.ghostB`. Dusk shows a thumbnail of each other trunk: what was left and what was taken, by morph shape. |
| `modelCount(Hn)`, `toxicity(Hn, item)` | replace `ch.models` and `ch.bitterCost`. `toxicity` returns seconds or `{s, starve}` (a deadly day starves chicks). |
| `lens: {k, blocksTaps, letters, names}` | a `GenePoolLens` over the focal moths, reading allele copies of locus `k` (a `dom` locus: the dominant copy is A, ink index 0); its control goes on the dock; key L (E5). While not LOOK, taps are ignored when `blocksTaps`. |
| `overproduce: {eggs, K}` | at dusk the survivors lay `eggs` young (random pairs, mother first, `Gen.mate` or `ch.mate`), and a random winter cull keeps K. All the R() draws happen at this one point. The egg tray is a cached `Layer` at the foot of the canvas: one dot per egg up to 600, else "Dot = 2 eggs"; each mother sends one dashed arc (300 ms, a 20 ms stagger, the whole flight ≤ 0.9 s) and her batch lands as it arrives; the cull removes the doomed dots in six batches over 600 ms. Calm: no arcs, one cull step. |
| `predict: {kind, tol, from, axis?, chart?, start?, soft?, at?, every?, until?}` | a `Predict.ask` at dusk on `chart` (default 0) from generation `from` (a number or a function). `ch.expect(Hn, rec)` is computed when the mark is committed and kept out of `Hn` until breeding is done; then `Predict.reveal` moves the band to the expectation, and `Hn.preds` gets `{gen, id, kind, v, expect, err, tol, hit}` for the Predict star. |
| `untimed: {looks, bitterLooks}` | when `Save.d.ui.unt`: no clock; each tap or miss spends a look (default 4/3 × cap, rounded: 20 for a cap of 15, as D1 says for the Wood); a bitter mouthful spends `bitterLooks` more (default 2, so three in all, as D1 says for Bitter Wings). The morning ends when the looks run out. |
| `detectRule: {label, min, max, step, v, pick?}` | the non-visual path (D2 §13): a "Bird rule" toggle (key B) and a labelled range slider on the dock. When on, the bird takes, every 0.6 s (0.35 s untimed), the most conspicuous item whose conspicuousness (1 − `ch.match`) is at least the threshold, or `pick(Hn, items, v)`. Untimed, the morning ends when nothing qualifies. Catches go through the same path (juice, logging, bag). |
| `migrants: {m, from(Hn) → genome, mark}` | at dawn (from generation 2) round(m·N) residents, chosen with `R()`, are replaced by migrants (`ind.mig = true`); `mark: true` puts a small migration-ink arrow over them. |
| `species: [{key, N, traits, toxic, cost, kills, phen, sprite, rig, init}]` | further populations, each with its own `det` layout, bred from its own survivors. A toxic species costs `cost` s (or `toxicity`); a tasted insect staggers off alive unless `kills`. A non-toxic species is food and counts toward the cap. |

Also: a long press (450 ms) on a moth pins it through E5's `Pin` instead of eating it; a pinned moth wears the halo while it is on the bark and, once gone, stays as a specimen card at the right edge (its stored look), with threads to its young (`ind.pa` holds both parents' ids). Arrows move a keyboard focus between moths, Enter or Space eats the focused one, Shift+Enter pins it. Individual ids are unique for the session. `HuntX.camo(ph, T, o)` is the legacy Lichen match with `Det.exp`, for chapters (D5 decision 24).

### `01_rig.js`: `Rig` and the rigs

`Rig.def(species, {recipe(ph, o) | paint(c, ph, o), develop?, quant, tier, row, paints, pose})`, `Rig.bake(species, ph, d, o)` → canvas (`cv.cw`, `cv.ch` = CSS size, `cv.anchors`), `Rig.draw(c, species, ph, x, y, o)` → `{x, y, r, anchors}` with `o = {size, rot, flip, id, halo, notch, state, t, alert, genes, letters, alpha}`, `Rig.size(tier)` (hero 0.12u, actor 0.07u, crowd 0.03u; 390 px before layout), `Rig.species()`. Extras: `has`, `row` (the D4 row), `paints` (natural paint, for the gamut lint), `recipe`, `develop`, `clear`, `cached`, `pixels`, and `Rig.ground(name, w, h, d, seed)` with `defGround`.

- A recipe is JSON parts with the origin at the centre of a w × h box: `ellipse`, `circle`, `poly`, `line`, `bezier`, `path` (M L Q C A E Z), `rect`, `dots`, `g` (a transformed group), `glyph` (stroked letters O, B, Y, C, c, A, a), `token` and `geno` (allele tokens through `Pal`). A part's `kids` are drawn clipped to it (highlight, shadow, pattern). Line widths are in CSS px, so the 1.5 px ink outline stays 1.5 px at any size.
- The cache key is the quantised phenotype (default 8 bins for tone and 4 for other numbers, integers and strings exact), the size, the device scale, the GENES flag and the theme. It holds at most 900 canvases and 12 M pixels, oldest out first.
- `id` gives a seeded ±8% scale and a pose jitter (a hash, never `R()`); `state: 'idle'` bobs at 0.6–1.2 Hz with a seeded phase (none in Calm), `'alert'` scales up to ×1.1, `'gone'` draws the dashed ghost ring; `halo` is the 3 px paper you-halo; `notch` is the D4 §4.1 micro-mark at an id-seeded angle (off by default, because on bark it would betray camouflage).
- Nothing calls `R()` or `Math.random`; angles use `Det.sin` and `Det.cos`, so the lint needs no exemption.

The rigs, with their D4 rows (`Rig.row(species)` returns the same):

| Rig | ph | Scene | Squint feature | Channels (≤ 3) | Tier |
|---|---|---|---|---|---|
| `moth` | `tone, hue, mot, morph ('band'·'mottle'·'speck', or band: true), carb, cg` | Wood | broad triangular wings, two antennae | tone and black carbonaria (luminance); morph stencil (pattern); C/c badge (letter, GENES only) | actor |
| `beetle` | `a: [a1, a2], dark` | Beetle Isle | oval wing cases split down the middle, six legs | allele halves on the wing cases (ink and letter, GENES); body tone (natural paint) | actor |
| `crab` (hermit) | `claw, lum, ink` | Shore | spiral shell with one big claw | claw up or down (shape); carapace luminance; Hawk blue or Dove amber body (two types only) | actor |
| `stickleback` | `pelvis, plates, red` | Lake | three dorsal spines on a slim fish | pelvic spine length (shape); lateral plates (pattern); breeding throat (bonus, never scored) | actor |
| `lizard` (side-blotched) | `morph: 'O'·'B'·'Y'` (+ `o.letters`) | rocks (`Rig.ground('rocks')`) | long-tailed lizard with a dark blotch behind the foreleg | throat pattern O solid, B barred, Y striped; O/B/Y letter; throat paint (natural, muted) | actor |
| `warbler` (Seychelles) | `carry, ring, chick, gape` | island scrub | slim warbler with a long thin bill and long legs | food in the bill (a helper feeding); leg rings (identity); chick or adult (size) | actor |
| `dungfly` (*Scathophaga*) | `sex, size` | dung pat | fuzzy-edged fly, wings folded over the back | body size (size); furry golden male or plain female | actor |
| `fowl` (feral) | `sex, comb` | farm | chicken with a comb and an arched tail | comb size (status); rooster or hen (comb and tail shape) | actor |
| `squirrel` (Belding's) | `pose, blaze, call, age` | Meadow | upright sentinel with small ears and a short tail | pose (shape); the father's face blaze, stripe, chevron or spot (designed); age (size). Anchors `ear` (for the D4 §4.1a tag) and `nose` | actor |
| `tit` (great tit) | `stripe, carry` | Hedge | round tit with black cap, white cheek, notched tail | breast stripe width (size); caterpillar in the bill | actor (hero in the Forager) |
| `chick` (nestling) | `fed, gape` | nest | round downy nestling with a wide bill | fatness (size); gape open or shut | actor |
| `artemia`, `isopod`, `lobster`, `mantis` | `maxi` (moves the boundary) | Lab plate | slender shrimp with leafy legs; flattened woodlouse; lobster with big claws; mantis shrimp with folded raptorial claws | feeding legs (pale, short, folded forward) against walking legs (dark, long, jointed), segment by segment | actor |
| `fossil` | `kind` (ammonite, trilobite, clam, brachiopod, fish, leaf, tooth, bone, worm, beetle, feather), `lum, wear` | Cliff | one silhouette per kind | kind (shape); preservation (detail, luminance); soft-bodied worm has a dashed edge | actor |

The crustacean presets use standard anatomy (brine shrimp 0 maxillipeds and 11 leafy limbs; isopod 1 and 7 walking legs; lobster 3 and 5, the first a big claw; mantis shrimp 5, the second raptorial, and 3). The link to Ubx/abd-A boundaries (Averof & Patel 1997) is the Switches unit's claim to cite. Every rig's natural paint passes E3's gamut lint (≥ ΔE 8 from every data ink in Dusk and Paper; `CVD.gamut(Rig.paints()[s])`).

### `01_scenes.js`: Petri and Strata

- `Petri.plate(c, x, y, r, {colonies: [{x, y, variant, r}], count, jackpot, drug, label})`: a glass dish and agar (#EDE3C8); colonies in plate units (−1…1) as ink-outlined discs, cached per plate in a `Layer`; a variant colony is amber with a second ring (the ring carries it); a jackpot gets a dashed ring and a bold count pill; `drug` hatches the rim.
- `Petri.grid(c, rect, plates)`: up to 20 plates, 5 × 4, ≥ 28 px across, count pills → `[{x, y, r}]`.
- `Petri.velvet(from, to, done)`: the stamp lowers over the master plate and each replica in turn (250 ms each; Calm: at once) → `{links: [[x1, y1, x2, y2]…], prints, stamped, done, draw(c)}`. A replica keeps the colonies its `keep(colony)` allows (default: variants, as on a drug plate).
- `Petri.flask(c, x, y, {turbidity: 0–5, label, ring, size})` (0.12u; a six-step luminance ramp with matching hatch density) and `Petri.rack(c, rect, flasks)` (4 × 3).
- `Strata.section(c, rect, {layers: [{thick, pattern, lum, fossils: [{x, kind, lum, wear}]}], erosion: [{layer, amp}]})`: layers bottom (oldest) up, thickness normalised, luminance plus pattern (silt dots, sand speckle, shale lines, limestone bricks, ash stars), fossils through the `fossil` rig, and a torn ink edge on the top of each eroded layer → `[{y0, y1}]`.
- `Strata.zircon(c, x, y, {n, parents, flash, label})`: 20 atoms, 5 × 4, parents solid, daughters hollow → hit points.
- `Strata.ruler(c, rect, {decades: [loExp, hiExp], marks: [{t, kind: 'you'·'truth'·'tick', label}], window})`: equal decade panels, each linear in 10 parts, oldest on the left, joined by "≈" marks; labels "10 Gyr … 1 kyr" → `{X(t), T(x), y}` for gestures.
- `Strata.range(c, rect, taxa)`: found range solid, inferred extension hatched (Signor–Lipps), labels at the left.

Words go through `Lbl.put` on the canvas being drawn. Nothing draws `R()`; colony and pattern jitter come from a hash.

## Tests

| Command | Result |
|---|---|
| `node tests/selftest_e6.js` (private build with the fixture `e6fix`: three levels that switch on every field) | **PASS: 386 passed, 0 failed.** Rigs: 16 species × several phenotypes × GENES bake, no `R()`, the cache shares quantised phenotypes and stays within 900 canvases and 12 M pixels, tier sizes, anchors, id jitter, `gone`, every D4 row (≤ 3 channels), the gamut lint, `Rig.ground`. Scenes: plate, grid cap, velvet links, flask, rack, section geometry, zircon, ruler monotone with T(X(t)) = t, range, no `R()`. Legacy: Lichen played 6 generations headless gives the same population and the same Hunt keys with and without `02_hunt_ext.js`; no handlers or v2 state on Hunt for a legacy chapter. Level 0: det layouts, ids, bag, firstWords, a dawn tap counts, Sim log, shadow then puffs, a 450 ms hold pins without eating, a miss costs time, starvation ⌈5 ÷ 3.75⌉ = 2, 300 eggs culled to 30 with a mother for every egg, Lock in on the dock, K = 30 young with parent ids, the prediction scored against `ch.expect` at commit, default notes with S and R, the v2 level card and `Save.star2`. Determinism: same seed and taps give the same young; committing the prediction late, or playing at 1280 × 720, changes nothing. Level 1: equal trunk shares, the lens blocks taps, search-image refund and switch cost, the glint, b clamped, three jays each taking your catch, two migrants. The b fit recovers 0.7, 1.6 and 2.4 within 0.35 over 450 simulated catches; one morph gives 1. Level 2: toxic species and models with `toxicity`, both barks cover the stage, the bird's rule takes moths (and none above every contrast), the second species breeds. Untimed: 20 looks, no clock, arrow focus, Shift+Enter pins, Enter eats, the morning ends with the looks. Default words within D4 budgets; no Lbl or Txt warnings; no errors. |
| `python3 tests/selftest_e6.py` (Chromium, virtual time, network blocked; 390 × 780, 1280 × 720 and Calm) | **PASS: 70 passed, 0 failed.** Real mouse clicks; act → fx latency ≤ 200 ms; a long press pins; eggs → slide → prediction; Lock in; trunks with GENES and JARS; jay thumbnails; two species on two barks; no page errors, no NaN or undefined on the canvas, no Lbl, Whisper, Txt, Snd2, Layer, HUD or Dock warnings, no external requests. Rig and scene galleries in Dusk and Paper (looked at by eye). |
| `python3 tests/golden.py check` (build `V2_ONLY='0*,zz_*'`) | **48 ok**; `--v1` **48 ok**. |
| `python3 tests/monkey.py legacy 1` | **46 of 48** reach the end card; known baseline: cross, landscape (E7's fixed monkey now takes mendel and fancier to the end). `lichen,soot,bitter` seeds 1–3: 9 of 9. |
| `python3 tests/monkey.py e6fix 1,2,3 --vp 390x780,1024x768,1280x720` (private build) | 9 of 9 reach the unit end card; `--calm` 2 of 2. |
| `node tests/lint_text.js BUILD` | 0 errors, 0 warnings over all v2 sources (my three files use no `Math.exp/log/pow/sin/cos`, no `R()` outside the sim paths of the Hunt, no direct `fillText`). The fixture's content lints clean (warnings only for having no `sim` and no encodings, as a Hunt fixture). |
| `node --check` | clean on all three files and the test. |
| Other packages on a build with my files | `selftest_e1` 114 ok, `selftest_e3` 156, `selftest_e4` 158, `selftest_e5` 282: all pass. `selftest_e2.py` shows the same 3 failures (menu stars, url theme) with and without my files. |
| Draw cost, Chromium, 4× CPU throttle, 390 × 780 | a Hunt frame 0.8 ms; with the 300-egg tray 0.75 ms; two barks and two species 0.5 ms. |

## Deviations from the contract, and why

| Contract or D4 says | What I did | Why |
|---|---|---|
| quantise tone to 8 bins (D4 §1.4) | the moth uses 32 tone bins (8 for hue) | on bark the tone is what is selected: 8 bins (ΔE ≈ 8 a step) would show the player a different moth from the one scored. |
| 1.5 px ink outline on every actor | no outline on the moth | D4 §1.2 lifts the outline rule where the ground's tone is the variable; an ink edge would make every moth easy to see. |
| `crab` wraps `CH_HAWKS.crab` | geometry ported (body, three legs, claw offsets, stalked eyes), shell added | the legacy claw is red (#d9482f) and the body a fixed orange; D4 needs blue/amber bodies for Hawk/Dove, natural shells and no red. |
| legacy `places()` reads the live canvas | v2 places moths in a fixed virtual 390 × 540 stage below the HUD band, in stage fractions | the R() draws, and so the run, are then the same on every viewport (a run is seed + actions). Tested. |
| `overproduce` "at nextGen" and dusk "slide, then done → nextGen" | dusk runs eggs and cull → slide into chart 0 → prediction → `nextGen`; the matings and the cull are drawn when the egg phase opens | D4 §5.3's order; the eggs are neutral dots, so they reveal nothing the prediction asks about. All draws still happen at one fixed point, so timing never moves `R()` (tested). |
| `Hn.bag = {fed, starved}` | adds `need`, `chicks`, `total` | the chapter's stars need the season's total. |
| `trunks.ghost.jays` | one jay per unhunted trunk; each takes as many moths as you ate that morning (`ghost.catch` overrides); `ghost.d` gives each morph's designed detectability | D1 §3.1: the jays replay *your* rule, including how hard you hunted. |
| `predict: {kind, tol, from}` | adds `axis, chart, start, soft, at, every, until`; `from` may be a function | `Predict.ask` needs an axis; chapters ask on different charts and generations. |
| `untimed: {looks}` "the world pauses on a tell" | no clock, looks instead | nothing moves in a Hunt morning, so there is nothing else to pause. |
| `ch.match` uses `Det.exp` | `HuntX.camo` is the legacy Lichen formula with `Det.exp`; the hunt extension calls `ch.match(ph, barkIndex)` for the glint and the bird's rule | a chapter writes its own `match`; the lint flags `Math.exp` in its file. |
| all player-facing words in `content` | `HuntX.WORDS` holds short defaults (HUD, whispers, labels, live lines), each overridden by the same key in `content` | an extension must not show an empty HUD; the defaults meet D4's budgets (tested). Chapters should override them. |
| `Rig.draw` options | adds `notch`, `alert`, `genes`, `letters`, `alpha`; `Rig` adds `row`, `paints`, `recipe`, `has`, `ground` | D4 §4.1 rule 4 (micro-mark), the GENES look, the lint. |
| Petri/Strata signatures | as specified; I chose the formats the contract leaves open: colony coordinates in plate units, `erosion: [{layer, amp}]`, `decades: [loExp, hiExp]`, `velvet` returns a handle with `draw(c)` | documented in the file header of each function. |
| Hunt replays and What if? | taps are logged through `Sim.act`; no Freezer or replay for Hunt chapters | API_v2 §9.1 defers Hunt replays ("B0-simple"); Hunt state is not a sim snapshot. |
| individual ids from `lay.nextId` | a session-wide counter (`HuntX.uid`) | a pin kept across levels of one unit must never land on a different moth; ids never reach the sim. |

## Notes for other packages and units

- **Hunt-mode units** (`lichen`, `soot`, `bitter`, `tap`, `swamp`): keep the legacy Hunt fields (`traits, N, cap, roundTime, phen, objective, focus, ...`), add `v2: true, mode: 'hunt'`, set per-level fields in `startLevel(n, o, Hn)`, use `rig: 'moth'` (or `sprite`), and give `stars` as `{discover, predict, transfer}(Hn, level)`. Read `Hn.preds`, `Hn.bag`, `Hn.ghostB`, `Hn.x.jays`, `Hn.hist` (each record carries `level, starved, ghostB, trunk, looks, migrants, jays`). Override the default words in `content.hud`, `content.whispers`, `content.labels`. Put Shift+Enter (pin) and B (bird rule) in your `keys` map if you use them. `tests/selftest_e6.js` holds a complete fixture (`e6fix`) to copy from.
- **E5:** I use `Pin.press/release/update/hold/HOLD/isPinned/draw`, `GenePoolLens.create/control`, `Predict.ask/commit/reveal/err`. Pins persist across levels of one unit (your `Pin._play`); the Hunt shows a gone pinned moth as a specimen card.
- **E4:** a Hunt level ends with `End.show(ch, {level, mask, final, ...})`.
- **E7:** the monkey plays v2 Hunt chapters as they are (canvas clicks and the "Lock in" dock button). Bots cannot sweep a Hunt chapter until Hunt replays exist.
- **Switches, Raffle, Alarm Call, Jaws, the Dig, the Scribe:** the D5 §4 rigs and both scenes are ready; check the crustacean counts and the warbler and squirrel roles against your specs before freezing text.
