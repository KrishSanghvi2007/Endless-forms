# Gene Swamping (`swamp`): build log

*Wave 2, Batch 3 unit. New id `swamp` (already in `ACT_PLAN`, Act 4 "Forces", needs `soot`). File `games/endless-forms/source/v2/swamp.js`, chapter `CH_SWAMP_V2`. Spec: D3 §5.5, D5 §4 item 16, D6 addendum (21 Oct 2026). Built 21 October 2026. Not yet reviewed by the three reviewers (playtest/art, science, design) and not committed: the coordinator does both.*

## 1. What was built

**World (D6 addendum 7).** Volcanic islands at night: black pahoehoe basalt, pale ochre dunes, owl-night indigo sky and sea. Rock pocket mice in natural paint (dark coat with a moonlit eye-shine; pale coat with a white belly), a barn owl and three owlets, a little ferry with a lamp, owl roosts on dead snags, a brass caliper, ferry boats shuttling dashed routes. No beetles; blue and amber appear only in allele read-outs (the neutral marker's p|q bars on each isle and the `deme` chart). Chrome accent `#7A6FC0` (owl-night indigo). `content.intro` supplies the three-part opening card.

**Role.** Selective agent (the owl, L1), then the environment (owl roosts, L2), then the island keeper with a ferry budget (L3, boss). The player never sets a mouse's coat.

| L | Name | Adds | Per-second verb | Prediction gesture (strip) | Stars offered |
|---|---|---|---|---|---|
| 1 | One ferry | migration rate | tap a mouse crossing the rock: the owl swoops (0.85 s climb back) | drag the dark share at night 10 (`y` at x = 10), once per round | Discover, Predict |
| 2 | The cline | dispersal distance | drag four owl roosts; owls swoop on mismatched mice in reach | drag the new cline width after a second owl per roost, then after halving dispersal (`x` on the width chart); drag the cline centre once a longshore current runs (`x` on the cline) | Discover, Predict |
| 3 | Five isles | drift between isles | drag ferry routes from the harbour or between isles (tap-tap alternative; tap a route to lift it) | drag F_ST after 100 generations with no ferries; drag where F_ST settles with your ferries (`y`) | Discover, Predict |
| 4 | Two ferries (boss) | whom gene flow links | tap isles to set each ferry's stops (two ferries, three stops each) | drag F_ST at the colour gene after 100 generations (`y`) | Discover, Transfer |

**L1 loop.** Each round is ten nights on a young lava isle (200 mice, 20% dark at the start). Dawn: the ferry lands `binom(200, m)` pale migrants (they hop off at the dock). Hands-on nights (round 1: nights 1, 2 and 10; rounds 2–3: nights 1 and 10): mice emerge from cracks at random and dash across the rock; a strike catches a pale mouse 95% of the time and a dark one 55% (it blends in at the last instant); four mice a night feed the owlets. The island's survivors are the clearing's catch rates applied island-wide; the other nights time-lapse at your measured s. Your first two nights set **s = 1 − (1 − c_pale)/(1 − c_dark)**, clamped to 0.1–0.5 (shown as a banner and as the m-versus-s bar chart). Rounds run at m = 0.02, 0.1 and then max(0.3, 1.3 s rounded up to 0.05), so the third round always crosses the threshold. Felt cost: as the isle darkens, pale mice vanish and dark ones are hard to see, so night 10 of round 1 starves the owlets; the big ferry's night 10 is a feast. A census strip of 20 mice (5% each) shows the isle's dark share.

**L2 loop.** A 60 km coast, lava on 0–30 km, dunes on 30–60 km, 60 patches. Haploid additive colour gene; each roost adds selection 0.05 (×N) against the mismatched coat within 12 km (soft edges); dispersal is a discrete Gaussian with σ = 3 km; a floor of 0.001 stands for a trickle of mutation. Roosts start on the dunes, so dark coats vanish until the player brings owls onto the lava. Measure (or 45 s) runs the cline to equilibrium and clamps the caliper at the 80% and 20% points (no cline: "hunt both sides"). Then: a second owl per roost (s doubles), a wet year (σ halves), and the twist: a longshore current rafts 40% of each patch's mice 2 km towards the lava each generation, dragging the cline downstream.

**L3 loop.** Five isles of N = 50 (two lava, three sand), a neutral two-allele marker at p = 0.5, a huge mainland that never drifts. Each generation: binomial drift, then migration. Each ferry route carries 1/N each way (about one mouse a generation). Phase 1: no ferries for 100 generations (isles lose the marker; "lost" pills). Phase 2: up to five routes, then 150 more generations. Realised F_ST uses s²/(p̄q̄ + s²/n) with an n − 1 variance, whose ratio of expectations equals the identity-by-descent F_ST; the expectation is the exact identity recursion for the routes laid.

**Boss loop.** The same five isles with owls on every isle (s = 0.25 ×N against the mismatched coat; dark D dominant) and the marker. Two ferries, each swapping a fifth of each stop's mice with its other stops. Plan, predict the colour-gene F_ST, then 100 generations run. "Held" means expected dark share ≥ 75% on lava (≤ 25% on sand) and expected marker heterozygosity ≥ half its start. Of 221 legal plans only lava–lava with sand–sand–sand holds all five (oracle). The lava isles sit far apart, so the nearest-neighbour plan is wrong.

**Stars** (pure functions of the final state, against expectations):
- L1 Discover: three rounds played and the owlets fed (≥ 4 mice) on at least 5 of 7 hands-on nights. Predict: at least two counted asks within ±0.1 (an ask counts only when "no change" would miss).
- L2 Discover: at Measure, centre within 3 km of the lava edge, width ≤ 20 km, lava patch 8 ≥ 80% dark, dune patch 52 ≤ 20% dark. Predict: two of three counted asks (width ±25% of the expectation, D3; centre ±2 km).
- L3 Discover: ferries whose expected F_ST at generation 250 is ≤ 0.3. Predict: both asks (±0.1 for 100 generations of drift; ±0.05 for the settled value, D3).
- Boss Discover: the plan is expected to hold all five isles. Transfer: the colour-gene F_ST within ±0.1, counted only when a ferry was laid.
- `unitStars`: Discover needs two levels including the boss; Predict two of L1–L3; Transfer the boss.

**Juice** (all from `Sim.run` events): emerge ring and tick; strike swoop with wingbeats, a catch burst, a "+1" pop, 40 ms hit-stop, a crack, an owlet bob; miss dust and swish; escape whisper; dawn rose band and ferry with disembarking mice; Night 10 banner (T2); s banner (T3); roost dust; owl swoops in L2; caliper ring (T2) and scale sound; route droplets and pour sound; stop rings; final ring (T3). Calm keeps the static rafts and ferries.

**What if?** L1: round two again with no ferry, or with owls at half s. L2: roosts on the lava only, or mice roaming twice as far. L3: no ferries for the last 150 generations, or isles four times bigger with the same ferries (F_ST barely moves: Nm sets it). Boss: mixed ferries, or none. Each card body is filled from its own run.

## 2. Science claims and references (for Coordinator A)

| Claim (where) | Model check | Reference |
|---|---|---|
| Dark rock pocket mice on lava owe their colour to Mc1r variants; dark is dominant (L1 MODEL, intro) | — | Nachman, Hoekstra & D'Agostino 2003 PNAS 100:5268 (`nachman2003`) |
| Owls catch mice that mismatch the ground more often, shown in trials with oldfield mice, *Peromyscus polionotus* (L1 MODEL "cannot"; corrected 22 Oct, see below) | — | Kaufman 1974 J. Mammal. 55:271 (`kaufman1974`) |
| Dark coats on New Mexico lava do not trace to Mc1r (L1 MODEL "In nature"; added 22 Oct) | — | Hoekstra & Nachman 2003 Mol. Ecol. 12:1185 (`hoekstra2003`) |
| Migration swamps a locally favoured allele once m ≥ s (L1 TAKE, why) | for a favoured dominant allele with pale (dd) migrants, the polymorphism holds iff m < s exactly; equilibrium q² = m(1 − s)/(s(1 − m)) (oracle 1, 0.8–1.2 s) | Haldane 1930 Proc Camb Phil Soc 26:220 (`haldane1930`); Lenormand 2002 TREE 17:183 (`lenormand2002`) |
| Pocket mice exchange migrants between lava and pale rock, yet colour matches the rock; neutral F_ST low, Mc1r F_ST high (L1/L3 why, boss why) | — | Hoekstra, Drumm & Nachman 2004 Evolution 58:1329 (`hoekstra2004`) |
| Cline width scales as σ/√s (L2 TAKE, why) | doubling s narrows by 1.46 (√2 within 15%); halving σ by 2.07 (oracle 4) | Slatkin 1973 Genetics 75:733 (`slatkin1973`); Endler 1977 (`endler1977`) |
| One-way gene flow shifts a cline downstream (L2 twist) | centre 30 → 26.2 km with the current (oracle 4) | Lenormand 2002 |
| Beach mouse coat colour forms a cline from pale coastal sand to darker inland soil (L2 "In nature") | — | Mullen & Hoekstra 2008 Evolution 62:1555 (`mullen2008`) |
| F_ST ≈ 1/(1 + 4Nm); about one migrant a generation limits divergence, whatever N (L3) | exact recursion 0.1952 at Nm = 1 (0.2); 0.1988 with N × 4 and Nm = 1; no ferries 1 − (1 − 1/2N)^100 (oracle 5) | Wright 1931 Genetics 16:97 (`wright1931`); Whitlock & McCauley 1999 Heredity 82:117 (`whitlock1999`, for the caveats) |
| Corridors rescue small populations from drift but links between unlike habitats can swamp adaptation (boss MODEL) | the plan enumeration (oracle 6) | Frankham 2015 Mol Ecol 24:2610 (`frankham2015`); Lenormand 2002 |

Every unrealistic number carries a tag: s in L1 is ×N (real: unknown, strong enough to beat local gene flow); selection per owl in L2 and owl selection in the boss are ×N; m, N, σ, generations and the current are *designed*. Agency: mice and owlets never "choose", "need" or "evolve" (the lint passes); "Four mice feed the owlets".

## 3. Deviations from the spec, and why

1. **Beetles → pocket mice, birds → a barn owl, Beetle Isle → volcanic islands** (D6 addendum 7 overrides D3's place and rig). The lava flows of the real mice are inland "islands" of rock; the MODEL card says the real flows are in Arizona.
2. **L1 round three's m is max(0.3, 1.3 s)**, not a fixed 0.3. s is measured from the player's hunt (D3: "designed by play") and can reach 0.5; a fixed 0.3 would then never show swamping, which Discover requires. Rounds one and two keep D3's 0.02 and 0.1.
3. **s is measured on the first two hands-on nights and then fixed** for the time-lapse, so each ask has a known expectation; later hands-on nights use their own catch rates (the felt cost).
4. **L1 colour gene is dominant (Mc1r biology); the L2 cline gene is additive** (D3 MODEL already says additive for the cline). Both MODEL cards say so.
5. **L2 roosts rather than a wind dial; the wind becomes a wet year (σ halves) and the twist becomes a longshore current rafting mice** (mice walk; rafting fits the ferry world). Both are *designed*.
6. **L3 adds a mainland harbour** so the hub routes form Wright's island model with a fixed migrant pool, making 1/(1 + 4Nm) exact for the ask; isle-to-isle routes are allowed and their expectation comes from the full identity recursion.
7. **Boss "two ferries" = two ferry lines of up to three stops** (D3's "two ferry routes" cannot link three sand isles). Stars read the plan's expectation, never the luck of the 100 generations.
8. **Transfer is the colour-gene F_ST under your plan**, not D3's Lake Erie water-snake gesture: the snake case needs numbers we could not source exactly, and the F_ST contrast is the real pocket-mouse finding (Hoekstra et al. 2004). The snakes can return as an "In nature" line once Coordinator A supplies sourced figures.
9. **Realistic mode** (D2 §11) is not built; the ×N tags say what is exaggerated.

## 4. Engine requests

- None blocking. `DemeMap`/`deme` chart is reused for the strip map; the custom XY chart `sw_xy` lives in this file (like Forager's `fg_xy`). A shared XY chart type in `01_widgets.js` would save ~3 KB per unit.
- Lbl's 3-word cap forced the L1 level name "One ferry" for the banner.

## 5. Tests

Build: `V2_ONLY='0*,zz_*,swamp.js' python3 build.py $SP/swamp.html`.

| Check | Result |
|---|---|
| `node --check v2/swamp.js` | clean |
| `node tests/lint_text.js $OUT swamp` | 0 errors, 0 warnings |
| `node tests/oracle.js $OUT swamp` (`tests/oracle_swamp.js`) | 32 passed, 0 failed (full seeds; `SW_FAST=1` for a quick run) |
| `python3 tests/bots.py $OUT swamp --seeds 1-20 --bots alwaysA,alwaysB,random,greedy,threshold,lazy,chain` | PASS; best masks L1 DP- (random, luck), L2 DP- (random), L3 D--, boss D-- / --T; no three-star level |
| same, `--untimed --levels 0 --seeds 1-10` | PASS |
| `GAME_HTML=$OUT python3 tests/monkey.py swamp 1,2,3` (390 × 780) | 3 of 3 reach "Unit complete" (1,505–1,911 steps, 20–28 intro cards opened and resumed) |
| same `--vp 1280x720` | 3 of 3 reach the end card |
| `GAME_HTML=$OUT python3 tests/swamp_paths.py` | 16 checks pass (tap strike, Space strike, untimed waiting mouse and Let go, roost drag and Measure, route drag, tap-tap and lift, ferry stops, dock switch and Clear, key toggle, `?v1=1`) |
| `GAME_HTML=$OUT python3 tests/swamp_shots.py OUT --vp 390x780,1280x720` (+ `?cvd=mono`, `?cvd=deut`) | every level and phase; 0 page errors; no Lbl, Whisper, HUD or LiveGraph warnings |
| `python3 tests/golden.py check $OUT` | 48 ok, 0 failed (121 s) |

### 5.1 Oracle numbers (full run)
- Threshold: the dark allele is kept at m = 0.8 s and 0.95 s and lost at 1.05 s and 1.2 s, for s = 0.15, 0.25, 0.4; the iterated equilibrium matches q² = m(1 − s)/(s(1 − m)).
- Stochastic isle (200 seeds, s = 0.3): night-10 dark share 0.702 vs 0.709 (m = 0.02), 0.477 vs 0.485 (m = 0.1), 0.025 vs 0.025 (m = 0.4).
- Cline: doubling s narrows the width by 1.463 (√2); halving σ by 2.067 (2); the current moves the centre from 30.0 to 26.2 km; roosts on the lava only lose the cline.
- F_ST: 0.1952 at Nm = 1 (1/(1 + 4Nm) = 0.2), 0.1988 with isles four times bigger and Nm = 1; no ferries 0.6340 at generation 100 (exact); realised 0.618 vs 0.634 and 0.205 vs 0.195 (300 seeds).
- Boss: of 221 legal plans only {Lava 1, Lava 2} + {Sand 1, Sand 2, Sand 3} holds all five; colour-gene F_ST realised 0.974 vs expected 0.935 (drift pushes the lava isles to fixation a little faster).
- Determinism, replay of the action log on all four levels, exact snapshot round trip (3,313 characters).
- The expert earns every offered star on 15/15 seeds per level; no level ever awards three; the best sweep bot reaches one unit star; all eight What if? levers finish with no stars; untimed L1 finishes.

**Size.** 113 KB raw, 35 KB gzip: above the 90 KB / 30 KB aim in lessons §4, below Batch 1's 120–150 KB. The text object is about a third of it.

## 6. Screenshots, looked at, and what changed

Saved in the session scratchpad (`…/scratchpad/swamp/L<n>_<phase>_<w>x<h>.png`). Fixes made after looking:
1. A signed shift in the mouse-path hash gave a negative index and froze L1 at the first emergence (no screenshot after "start"): unsigned shifts throughout.
2. A drawing helper named `stars` overwrote the chapter's `stars` object (duplicate key): renamed `starfield`.
3. L1 census strip of 40 mice read as a line on a phone: 20 bigger mice, 5% each.
4. L1 mice and owlets too small on a phone: mice 8% of u; downy owlets with heart faces.
5. Basalt blobs looked like bubbles: smaller, lower-contrast blobs, ropy rims kept.
6. L2 on a phone: a thin coast and 9 px mice under a huge sky. The land band now fills 44–80% of the canvas with four or five rows of 12–22 px mice; posts and caliper moved down to match. The owls' reach wash read as a grey box on the lava at 1280 × 720: it now shows only while roosts are being placed, at 8%.
7. L2 width chart end labels truncated ("one o…"): short labels "1 owl", "2 owls", "short hops".
8. L3/L4 F_ST gauge and its label overlapped Lava 2 on a phone: moved to a low-left panel; the generation tick's visual twin moved with it.
9. Level name "Two isles, one ferry" broke the 3-word banner cap: "One ferry".
10. HUD ask line over 15 words: shortened; "Lay ferry routes" line wrapped to three lines: shortened.
11. Boss isles had no owls although owls hunt there: a small barn owl perches on each isle.

## 7. Instructor note (one page)

**What students do.** Hunt pocket mice as an owl while a ferry lands pale migrants; build a cline with owl roosts and measure it; lay ferries between drifting isles; then plan two ferries to save five isles at once.

**What they should leave with.**
1. Local adaptation survives gene flow only while selection outpaces migration (m < s). Above that, migrants swamp it.
2. Where habitats meet, the transition is a cline whose width is dispersal over the square root of selection.
3. Drift splits isolated populations; about one migrant a generation holds them together, whatever their size (F_ST ≈ 1/(1 + 4Nm)).
4. Gene flow is neither good nor bad: linking like habitats spreads variation; linking unlike habitats swamps adaptation. Selected genes can stay differentiated while the rest of the genome mixes.

**Prompts (rising Bloom level).** (1) Why are lava mice dark when pale migrants keep arriving? (2) Is gene flow good or bad for a population? Give a case for each. (3) Model critique: owls here see only colour. What would mice that pick matching rock change?

**Projector moment.** L1 round three: ask the class to vote on the night-10 dark share before the ferry runs.

**Seeds and codes.** Every run is (seed, level, actions); the teacher seed link and result code work as in other v2 units (`resultBits`).

## 8. Playtest script (designer and colleagues, D6 decision 4)

1. Open Act 4 → Gene Swamping. Read the card (about 100 words). Play.
2. L1: hunt two nights. Do the strikes feel responsive? Is it clear that dark mice are harder to catch, and why? Predict three times. Did the big ferry's feast make swamping obvious?
3. L2: move the roosts. Did you understand why owls on the dunes alone make the lava pale? Did the caliper make the width concrete? Were the √2 and ½ predictions guessable?
4. L3: watch drift for 100 generations. Did "lost" isles surprise you? Lay ferries. Did 1/(1 + 4Nm) feel earned?
5. Boss: did you find the winning plan, and did it feel like an inversion?
6. Score 1–5: fun, clarity, science trust, look (does the world feel unlike the other chapters?). Note any moment you waited with nothing to do.


## Simplification (D6 decision 9), 22 October 2026

I played all four levels at 390 × 780 first (`s3/simp_swamp_dig/before_swamp/`), then again after the changes (`after_swamp/`, `after_swamp2/` at 390 × 780 and 1280 × 720). The volcanic isles, the pocket mice, the owl and owlets, the ferries, the coast and the caliper all stayed. What made it heavy was the asking and the second control scheme: eight predictions on three gestures (dark share at night 10 three times, cline width twice, cline centre, F_ST twice, colour-gene F_ST), a longshore-current twist that added a second idea to L2, and a boss with its own ferry/stop/toggle/Clear controls.

### What was removed or merged, and why

| Removed or changed | Where | Why |
|---|---|---|
| Three "drag night 10's dark share" asks | L1 | Replaced by **the chapter's one prediction**, asked once before round three: "Owls s = 0.50. Drag the ferry bar to the size that swamps the lava." The player drags the *m* bar on the ferry-against-owls chart. The answer is the measured s (m = s exactly for this model, Haldane 1930), so the gesture *is* the aha. Round three (m ≥ s) then swamps the lava, and the reveal comes at its night 10. ±0.05; it counts only when "no change" (round two's m) would miss. The strip's note no longer gives the answer away ("The ferry lands pale coats; owls remove them."). |
| Hands-on nights 7 → 4 | L1 | Round one nights 1, 2 (they set s) and 10 (the starving dark night: the felt cost); round three night 10 (the feast after swamping). Round two is a 3-second time-lapse. The level is about half as long. |
| Key number shown | L1 | Every time-lapse names m against s with its meaning: "m = 0.10 < s = 0.50: owls outpace the ferry, so dark coats win." / "m = 0.65 ≥ s = 0.50: the ferry outpaces owls; pale coats swamp." The dark-share chart labels each round's curve with its m. |
| Width and centre asks; the longshore current | L2 | After Measure, the two changes (a second owl per roost; a wet year that halves dispersal) play by themselves, each with a banner and the key line "Width ∝ σ ÷ √s, so it shrinks by √2" / "so it halves". The current was a second idea (asymmetric gene flow shifts a cline), so it went, with its rafts, label and MODEL row. |
| Both F_ST asks | L3 | The flow phase shows "F_ST ≈ 1 ÷ (1 + 4Nm): one migrant a generation gives about 0.2", and the model's expectation is drawn on the chart once each phase is over. |
| Two ferries of three stops, Ferry 1/2 toggle, Clear; the colour-gene F_ST ask | Boss | The boss now uses **L3's verb**: drag up to three ferry routes between isles (tap-tap and keys 1–5 work too; tap a route to lift it). Each ferry swaps m = 0.3, above the owls' s = 0.25, so a lava–sand link swamps by L1's own rule; the HUD says so while the 100 generations run. Of all 176 plans of up to three ferries, only Lava 1–Lava 2 plus two sand–sand links hold all five isles (oracle). The dock holds only Sail. |
| "swamped" for every failed isle | Boss | Science fix: a lone isle whose coat stays matched but whose marker drifts away is now labelled **drifted**, not "swamped". |

Levels are unchanged in number (4): **One ferry, The cline, Five isles, Three ferries**. The intro card's "How to play" now reads "Tap mice crossing the rock to strike; later, drag owl roosts and ferry routes between isles. Once, you drag a bar to predict."

### Stars, re-balanced

| Level | Discover | Predict | Transfer |
|---|---|---|---|
| L1 One ferry | owlets fed on 3 of 4 hands-on nights (was 5 of 7), three rounds played | **the one prediction** within ±0.05 of s (was 2 of 3 dark-share asks) | — |
| L2 The cline | sharp cline on the lava edge (unchanged) | — (was 2 of 3 asks) | — |
| L3 Five isles | ferries expected to hold F_ST ≤ 0.3 (unchanged) | — (was both asks) | — |
| L4 Three ferries | — | — | **hold all five isles** (was the colour-gene F_ST ask) |

Unit stars: Discover = Discover in two of L1–L3; Predict = L1; Transfer = the boss. No level offers three. The bot sweep's best unit union is two stars (alwaysA: D from L2/L3 and T from the hard-coded winning plan).

### Review as playtester and biologist (no external review yet)

- **Swamping when m ≳ s.** Exact for this model: a favoured dominant allele with dd migrants is kept iff m < s, with q² = m(1 − s)/(s(1 − m)) (oracle 1, ±5%). The HUD never claims the threshold for the boss's two-way links; it says only "m > s" there, which is true (0.3 > 0.25), and the oracle checks that every lava–sand link fails.
- **Cline width ∝ σ/√s.** Doubling s narrows the width by 1.46 (√2 within 15%); halving σ by 2.07. The key line now states the scaling, not an exact factor of the realised run; the card shows the realised ratio next to √2 = 1.41.
- **F_ST ≈ 1/(1 + 4Nm).** 0.1952 at Nm = 1 by the identity recursion; Whitlock & McCauley's caveats stay cited on the MODEL card.
- **Mc1r and pocket mice.** Nachman et al. 2003 is the Pinacate lava in Arizona, so the card now names it, and adds that on New Mexico lava other genes make the dark coats (Hoekstra & Nachman 2003): Mc1r is not the only route to melanism.
- **Owl predation trials.** Kaufman 1974 tested owls on *oldfield mice* (*Peromyscus polionotus*), not pocket mice, and the paper is in *J. Mammal.* 55:271, not *Ecology*. The L1 card had implied pocket-mouse trials; it now says "in owl trials with oldfield mice, mismatched mice were caught more often". Logged in the table above.
- Agency lint passes: mice and owls never "choose", "need" or "evolve".

### Tests

- `tests/oracle_swamp.js` updated: one prediction in L1 whose answer is the measured s; no asks in L2–L4; round three leaves the lava pale on night 10 (10/10); L2 plays both changes after Measure; the boss enumeration over three-ferry plans, m > s, and "drifted" vs "swamped"; stars offered [D+P, D, D, T]. **37/37** (full seeds).
- `tests/swamp_paths.py`: the boss checks now drag a route, tap-tap and keys, the three-ferry budget and a Sail-only dock. 16 checks, 0 failed.
- `tests/swamp_shots.py` also shoots the gap before round three, L2's hold phases and the boss with three ferries.
- Lint 0/0; `dup_globals` ok; bot sweep PASS (seeds 1–20, and untimed L1); monkey seeds 1–3 at 390 × 780 and 1280 × 720 reach the end card with no page errors.
