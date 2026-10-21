# Wave 2: Drift Casino (`casino`, absorbs Castaways L1)

Unit agent: senior game developer and evolutionary biologist. Files: `games/endless-forms/source/v2/casino.js` (`CH_CASINO_V2`, about 1,470 lines), `tests/oracle_casino.js`, `tests/casino_shots.py`. No engine file, legacy file or other unit's file was edited. Nothing was committed. The legacy chapter (`CH_CASINO` in `ch1.js`, plus `ch99.js`'s `newTable` card) is untouched and still plays under `?v1=1`.

Specs followed: D6 (binding), D5 §4 item 5 and the §3 checklist, D3 §3.2, D2 §4 rows 6–7, §8, §11, §15, D4 §2–§8, API_v2 with §13, `engine_integration.md`.

## What I built

**Role:** the environment that shapes N (D1 G1), framed as a gambler at the croupier's table. **Place:** the Lab plate (jars, Buri's bottles), Beetle Isle (the castaways, the volcano, the zoo). **The second:** tap a bin on the felt to drop a chip (hold to take one back, drag to move one; ←/→ and ↑/↓ on the keyboard). Each chip clacks into its stack with a ring within one frame (20 ms virtual). In play: tap a jar to pin it (its trace goes bold), buy a **volcano** on a jar (L2), hold the beach to size the **storm** (L4), tap the **volcano** (boss), pull three keeper levers in the **zoo** (boss). **The minute:** one table. Ten chips go down, Spin, and twelve jars run at six generations a second. Every finished jar corks, lifts and flies into its bin, coloured by how it ended (blue, amber, or both if still mixed), and pays its chips there. The felt bins *are* the histogram, so the U builds from the jars themselves (D4 rung 0). **The level:** one new variable. **The boss** inverts the lesson.

**Chips are a calibrated prediction.** Your ten chips are your probability distribution over the bins. The croupier posts naive odds as a dashed ghost stack in every bin. Each outcome pays 6 × (your quadratic score − his), so the best bet is your honest belief, and you profit only where your distribution beats his (D3 §9.3). Stars read your chips against the **expectation** for the parameters in force (exact Wright–Fisher chains, binomials, or a fixed private replicate run), never the realised jars. The level card shows both: "You won +14 chips. Expected for your bets: +20."

**The house adapts (felt cost).** Each level the croupier reprices the rule you just beat ("The croupier changes his odds"), so the next profit needs the next concept: coin toss → right about shares but "every jar settles alike" → "sixteen ideal flies" → "exactly half" → "count heads" (side tables) → "variety halves" (boss). The volcano doubles in price after each use (3, 6, 12 … chips). The zoo runs on a 24-token budget.

| Level | Adds | What happens | Marker on the live graph | Stars it can give |
|---|---|---|---|---|
| L1 The croupier's coin (3 tables) | the starting share | Jars of 10 beads at 80%, 30% and 60% blue, 30 generations; bins All blue / All amber / Still mixed. He pays as if each jar were a coin toss. | Before the first table runs: where will the **average jar** sit at generation 30? (expect 0.80, ±0.08) | D, P |
| L2 Small jars (3 racks) | jar size | Racks of 6, 20 and 200 beads from half; bins settled by generation 5, 10, 20, 40, or not by 40. He prices every rack like a jar of 20. In play, **Volcano** holds a jar at 4 beads for 4 generations. | By which generation will **half the 6-bead jars** have settled? (expect 5.1, ±2) | D, P |
| L3 Buri's bottles | effective size | 107 bottles of 8 ♂ + 8 ♀, all bw75/bw, 19 generations, with unequal families (Ne ≈ 11.3 in the model). Bins Lost / Still mixed / Fixed; the full 0–32 histogram builds above them, beside his dashed 16-fly ghost. A pinned bottle shows its 16 flies (eye colour by genotype). Then **three Ne side tables**: 36 ♀ + 4 ♂; 50 flies crashing to 5 every fifth generation; 16 flies where every pair raises exactly two. | H at generation 19 (expect 0.211, ±0.03; his 16-fly answer 0.28 misses). Side tables: drag the **Ne marker** on a ruler (±20%), then 100 cages drift and their heterozygosity is fitted. | D, P, T |
| L4 The castaways (3 storms) | founders | A large mainland at 50% amber; each storm rafts founders to 12 islets, which land in share bins and pay. Table 1 is five founders (the old `TRANSFER.castaways` card, now the opening gesture); tables 2–3: **hold the beach** to size the storm (2–12). He prices "exactly half". | How far from half will the **average islet** start? (5 founders: expect 12.3 points, ±4) | D, P |
| Boss: Volcano and zoo | many alleles | 12 equally common alleles, lettered A–L by 4 fills × 3 patterns (D4 rule 7), in a richness row. Two markers, then tap the volcano: lava, ash, 4 survivors with lettered genotype badges; lost letters go hollow one by one while the H gauge barely moves. Then keepers' 60 beetles (45 ♀ : 15 ♂) for 20 generations: **Balance** (6 tokens), **Families** (equal family sizes, 1 token a generation), **Migrant** (4 then 8, one a decade). Letters vanish from the row as they are lost; a migrant flies in on a migration-ink arrow. | H kept after the crash (expect 0.875, ±0.08); letters left (expect 6.02, ±2) | D (zoo ≥ 9 letters in expectation over 200 replays of your plan), T (both crash markers) |

`content.boss.inverts`: "Before, heterozygosity was the casualty. Here it barely moves while half the alleles vanish."

**What if? (the freezer).** The last table of each level is frozen at Spin (the boss at the eruption). The level card offers two levers that thaw it, change one thing and run it out to an Interesting result:

| Level | Levers |
|---|---|
| L1 | Jars of 100 (11 of 12 still mixed at 30); Start at half |
| L2 | Volcano everywhere (a 4-generation crash at 10 settles more than half the 200-bead jars); Jars of 20 (the croupier was right about these) |
| L3 | Equal families (H falls more slowly than the 16-fly line); Unequal families (drift like about seven flies) |
| L4 | Forty founders; Two founders |
| Boss | Add mutation (2,000 generations at 10⁻⁴ ×N from the survivors: letters flicker back and are lost again); Zoo of 300 (keeps all 12 with no help) |

**Juice (D4 §5).**
- *T1, per action:* a chip arcs from your stack and clacks on its bin (ring at once, stack squash on landing, `tock`); taking one back flies it home; holding a bin fills a ring for 450 ms. Pinning rings the jar. Volcano: dust, a ring, a 5 px shake and a "−3" at the purse (a cost you pay).
- *Per generation:* beads trade places so drift looks local; a tick every third generation; vials pulse; zoo pens hatch egg bursts.
- *Per jar:* a cork pops on fixation, the jar lifts and flies (450 ms, ease-in-out, 40 px arc) into its bin, lands coloured by outcome, and pays "+3 ▲" or "−5 ▼" with a rising count tick. 107 Buri vials stream into their histogram columns over 1.3 s.
- *T2, per table:* the croupier's pill flips to "House pays!" or "House wins!", a big "+12" at the purse, a T2 tier; tables refill with a bead pour.
- *T3, per level:* the level-name banner; the eruption (flash, ash, ochre lava, lost letters ringed in turn).
- *Calm:* flights become 150 ms slides with no arc; Fx handles particles, shake and banners.

**Live graph.** In the scene: the felt histogram (jars, islets, Buri's 0–32 columns with the croupier's dashed ghost), the richness row and H gauge (boss). In the strip: L1 blue-share fan with the average (solid), your pinned jar (diamond) and, after the first table, the dashed expected mean; purse. L2 jars-settled curves per rack with dashed expectations, and the current rack's fan. L3 heterozygosity (drift ink) against the 16-fly ghost, then the expected line; the Ne ruler with each side table's fit. L4 gap from half against founders, with the dashed expectation. Boss: H kept and letters left, then letters kept and H across the zoo, with "your plan" (the 200-replay expectation) dashed at the end. Level cards: realised solid, expected dashed, your call a diamond.

**Accessibility.** Keys: ←/→ bin (or pinned jar in play), ↑/↓ add or take a chip, Space spins or pauses, Enter locks a marker, V volcano on the pinned jar, S grows the storm, B, E, M zoo levers, P focuses a marker. Every drag and hold has a tap or dock alternative (Smaller/Bigger storm; long press or drag to remove a chip). Untimed mode: markers never auto-commit, runs slow to 2 generations a second (zoo 1.2 s), and Pause/Step work in every run. One live-region line per table, every five generations and per crash; "Show data" tables for every chart. CVD and hue lints pass; Rig and scene paints pass the ΔE 8 gamut lint. Deuteranopia and greyscale screenshots read (blue/amber differ in luminance, and big tokens carry letters).

**Learning layer.** Outside `?v1=1`: `TAKE.casino`, `MODEL.casino`, `RECALL.casino` and a new `BRIDGE.casino` (from the Black Country) are rewritten; `TRANSFER.castaways` is deleted (it is L4's opening gesture, D3 §3.2). `ch99.js`'s `CH_CASINO.newTable` predict cards patch only the legacy object; v2 drops them on purpose (they are the chips now). Star migration and `Save.d.done` come from `00_entry.js`.

## Science claims, with references (for Coordinator A)

| Claim on screen or in a card | Where | Reference |
|---|---|---|
| A neutral allele fixes with probability equal to its current share | L1 take, Why? maths, oracle | Kimura 1962; Wright 1931 *Genetics* 16: 97 |
| Heterozygosity falls by (1 − 1/N) a generation for N copies | Why? maths, oracle | Wright 1931; Fisher 1930 |
| From one half, fixation or loss takes about 2N ln 2 ≈ 1.39N generations | L2 take ("about 1.4N"), Why? maths, oracle (exact 1.366N at N = 100) | Kimura & Ohta 1969 *Genetics* 61: 763 |
| Buri's 107 lines of 16 flies drifted like Ne ≈ 11.5 | L3 MODEL, take, Why? real | Buri 1956 *Evolution* 10: 367; Hartl & Clark *Principles of Population Genetics* |
| Ne = 4NmNf/(Nm + Nf); harmonic mean over changing size; (4N − 2)/(Vk + 2) | Why? maths, side tables, oracle | Wright 1938; Crow & Kimura 1970 |
| Wild Ne is often near a tenth of census N | Why? real | Frankham 1995 *Genet Res* 66: 95 |
| A founding group is a sample (founder effect) | L4 take, MODEL | Mayr 1954 |
| A crash to n copies keeps (1 − 1/n) of H on average; 12 equal alleles keep 12(1 − (11/12)^8) ≈ 6 | Boss, Why? maths, oracle | Nei, Maruyama & Chakraborty 1975 *Evolution* 29: 1 |
| Northern elephant seals fell to perhaps a few tens in the 1890s, now number over 100,000 and carry little variation; cheetahs carry little variation | Why? real, boss MODEL | Hoelzel et al. 1993 *J Hered* 84: 443 (to check); O'Brien et al. 1985 *Science* 227: 1428 |
| Zoo studbooks equalise family sizes and balance the sexes to raise Ne; a migrant now and then restores alleles | Why? real, the zoo | standard captive-management practice (e.g. Ballou & Lacy 1995) |

Designed model results (not field data): Buri's model gives Vk = 3.64 and Ne = 11.3 (fertility weights 0.15, 1, 1.85); the zoo keeps 6.4 letters with no plan, 6.7 with equal families alone, 9.6 with balanced sexes plus equal families for 18 generations.

Nothing on screen is contested; every MODEL card has `contested: false`, refs ids (`wright1931, fisher1930, kimura1969, buri1956, crow1970, mayr1954, nei1975, hoelzel1993, obrien1985, frankham1995`) and tags every parameter realistic or designed. No parameter is ×N except the What if? mutation rate (10⁻⁴; real per-locus rates 10⁻⁵ or lower). **Coordinator A has not yet signed these claims off.** Check: the elephant-seal minimum (20–100 in the literature) and Buri's eye-colour description (the rig shows white, pale orange and orange eyes by bw75 copies; I believe this matches Buri's cn bw stock but have not verified it).

## Deviations from the spec, and why

1. **The zoo is 60 beetles for 20 generations, not 40 for 50.** I computed D3's numbers: a zoo of 40 for 50 generations keeps about 2.5 of 12 alleles with no plan and at most 5.3 with every lever, so "keep 9 of 12" was impossible. With 60 beetles (45 ♀ : 15 ♂) for 20 generations, only balancing the sexes *and* equalising families reaches 9; the 24-token budget makes it a real trade-off.
2. **Buri's chips have 3 bins (lost, still mixed, fixed), not a 5-bin histogram.** At generation 19 the five-bin distribution is nearly flat, so an even spread would score almost as well as understanding. The full 0–32 histogram still builds in the scene.
3. **The volcano holds a jar at 4 beads for 4 generations.** A one-generation crash to 4 fixes only 12.5% of jars from half, so it could not "make a long-odds bet come true". Four generations at 4 beads fix about 62%.
4. **Stars are per level** (Lichen and Hawks did the same; unit stars are an OR of level masks). Predict needs 3 of the level's 4 gestures (3 chip tables plus its marker; L3: both); Discover needs your bets to beat the croupier's expected score by at least a quarter of what was there to win (the zoo: 9 letters); Transfer lives in L3 (2 of 3 side tables) and the boss (both crash markers).
5. **L1 has three tables (80%, 30%, 60%)** so "2 of 3 tables" can be scored inside the level; red became amber (D4: no red).
6. **L4's marker asks the average gap from half**, not "the share of islets near half": with few copies "near half" jumps up and down with the number of founders (discreteness), while the gap shrinks smoothly. The storm is capped at 12 founders, where the croupier's spike is still wrong.
7. **Side-table founders are drawn at random.** All-heterozygote founders make the first generation drift as if Ne were 40, which inflated the fitted Ne by 10%. Buri's bottles keep his historical heterozygous founders.
8. **Level names shortened** to "Small jars" and "Volcano and zoo": canvas words (the level banner) are limited to 3 words.
9. **No result code** (`resultBits` is [later]); the instructor note is not written yet.
10. `TRANSFER.castaways` is deleted outside `?v1=1`, as D3 asks, so the legacy Castaways chapter no longer opens with that card. Golden runs are unaffected (they use `App.play`).

## Engine requests (nothing edited; local workarounds instead)

1. **`Predict.clear(chart)`**: a committed marker's overlay stays on its chart index for the whole level, so it showed on the next table's chart. I call the internal `Predict._exit()` at each table change and at the zoo.
2. **A banner widget** allowing level names up to 5 words (D3's "Big jars, small jars", "The volcano and the zoo"); `Lbl.put` warns above 3.
3. **Unit-level star functions** (as Hawks and Lichen asked), for D3's cross-level rules.
4. **`firstWords` (40) vs `HUD.say` (15)**: the monkey fails on the HUD warning, so `firstWords` is 15 words.
5. **Dock labels ≤ 2 words**: prices moved onto the canvas ("Balance 6", "Families 1/gen", "Migrant 4"); "Balance" and "Families" carry aria labels.
6. **Empty dock** during storm flights, crashes and the zoo's replay pass leaves a blank bar on phones (Hawks' request 7).
7. **The ghost hand cannot point at the dock** (Hawks' request 3): Spin is taught by the HUD line instead.
8. **The lint's exemption regex** (Hawks' request 5): I used `Det.sin/cos` in the view rather than `// cosmetic` maths.

## Tests (build: `V2_ONLY='0*,zz_*,casino.js'`, scratch `wave2/casino.html`; also a full build with every v2 file)

- `node --check v2/casino.js`, `tests/oracle_casino.js`: **clean.**
- `node tests/lint_text.js … casino`: **0 errors, 0 warnings** (budgets, sentences, spelling, agency, CVD and hue lints, no `fillText`, no `Math.exp/log/pow/sin/cos`, no `R()` outside the sim). Full build: clean.
- `node tests/oracle.js … casino`: **279 passed, 0 failed.** Highlights: neutral rule 80.2% and 30.1% fixed from 0.8 and 0.3 (10⁴ runs, ±1%); absorption 1.366N exact at N = 100 (1.344N simulated at 60); H decays as (1 − 1/N)^t within 1%; Buri Vk = 3.64, formula Ne 10.99 vs decay Ne 11.32 (±5%), the private expectation run matches 20,000 `R()` bottles; side tables realised Ne 14.6 / 18.3 / 30.3 vs formulas 14.4 / 17.9 / 31.0; eruptions keep 87.5% of H and 6.02 of 12 alleles; zoo 6.38 (no plan) vs 9.64 (plan); every scored expectation matches the sim's own stochastic runs; the croupier's odds and an even spread fail every mispriced table while the expectation rounded to ten chips passes; D3's five named bots never earn three stars in a level, and none of the four fixed bots earns more than one unit star over 8 seeds; a skilled policy earns D+P (L1, L2, L4), D+P+T (L3), D+T (boss) on every seed; determinism, snapshot restore and log replay are exact; all ten What if? levers end in their Interesting result.
- `python3 tests/bots.py … casino --seeds 1-20`: **PASS** (and `--untimed`, seeds 1–10: PASS). Best masks: random `D--` in L2–L4 and `--T` in the boss; threshold (balance plus equal families) `D--` in the boss; every other cell `---`.
- `tests/monkey.py casino 1,2,3 --vp 390x780,1280x720`: **6 of 6 reach the end card**; also 1024×768 seeds 1 and 4: 2 of 2; full build seed 2: 1 of 1. No errors, no bad text, no Lbl/Whisper/HUD/Dock warnings, ≤ 25 words on screen, What if? exercised.
- `tests/golden.py check`: **47 ok, 1 skipped** (casino replaced). `--v1`: **48 ok.**
- `tests/casino_shots.py`: 0 page errors at both viewports; chip tap to first Fx 20 ms (virtual).
- Rig gamut lint (`CVD.gamut` on `Rig.paints()`, including the new `fruitfly` rig) and the scene paints (felt, wood, lava ochre, pens): all ≥ ΔE 8 from the data inks.

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/casino/`
- `final/`: 128 shots, every level and phase at 390×780 and 1280×720 (start, half-bet, ready, markers, runs, settles, side tables, storms, eruption, zoo, level cards, What if? runs and cards).
- `cvd/`: deuteranopia (L1, L3, boss) and greyscale (L2, L4) at 390×780.
- Earlier passes `s1/`, `s2/`, `s3/`, `d1/`, `w1/` show what was fixed: flies all drawn on one spot (an operator-precedence bug); the expanded strip hiding the run; labels under the whisper; empty bins with tiny glass icons (now outcome-coloured jars); islets cut off at the right; the zoo's richness row under the whisper; dock labels clipped; raw `{h}` placeholders on the What if? end card; the "near half" curve zig-zagging.

## Review round (15 October 2026: playtest/art, science and design reviewers)

Files touched: `v2/casino.js`, `tests/oracle_casino.js`, `tests/casino_shots.py`, this log. No engine, legacy or other unit file was edited. Nothing was committed. Where this section and the sections above disagree, this one is current.

### What changed in play

| L | Before | Now |
|---|---|---|
| 1 | Three tables (80%, 30%, 60%), ten taps each; Predict 3 of 4 gestures. | Two tables (80%, 30%). **Pay pills** on every bin show what one jar landing there pays you now ("+3 ▲", "−5 ▼"), recomputed on every chip. **Clear** (X) beside Spin once all ten chips are down; **Same bets** (A) on table 2. Predict = the marker **and** 1 of 2 tables. |
| 2 | Volcano bought during the run (3, 6, 12 … chips), outside the expectation; "Try Volcano" steered players to the 200-bead rack, where it always lost. | **Crashes are part of the bet.** Before Spin, tap up to four jars to crash them (free; a cone marks each; V on the keyboard). A crashed jar holds four beads in generations 1–4. The croupier ignores crashes; the stars, the level card's "Expected" line and the half-settled marker all read the crash-aware expectation (exact chain). On the 20-bead rack, where he is right, four crashes move "by gen 5" from 3% to 23%, so understanding a crash is now how you beat him. Bins read "By gen 5, 6–10, 11–20, 21–40, Not by 40". Predict = marker and 2 of 3 racks. |
| 3 | Fertility weights unseen before the bet; side tables timed, 100 cages, fit with no spread. | The hero bottle shows each fly's young as dots before you bet ("dots: young"), on a jittered 4 × 4 grid; HUD "Families vary beyond chance". Side tables: Ne defined once ("Ne: ideal population size that drifts as fast"), a cue pill per cage ("only 4 males", "crash to 5", "two per pair"), 300 cages, "fit 16 ±1", and the formula pill ("4×36×4÷40 = 14") at the reveal; the live line says the stars read the formula. |
| 4 | Tables 2 and 3 inherited 5 founders, so a fixed 5-founder bet earned D+P without sizing a storm. | Tables 2 and 3 start at 2 and 12 founders (hold the beach or U/D to change). The fixed bet now fails Predict. Predict = marker and 2 of 3 storms. |
| Boss | Equal families tied offspring sex to the mother's slot (inherited family size); migrants 4 then 8, one a decade (dominated); M key muted the game. | Equal families shuffle mothers, fathers and offspring sex every generation. Migrants: 3 tokens, at most one a generation (key I) — useful late (8.7 letters with balance) but families are the cheaper route (9.6). Each beetle wears its two letters; the price tags are buttons; "mutation ×N" pill on the What if? run. The unit card's take is the inversion with your numbers ("The crash kept 95% of H but lost 4 of 12 letters"). |

### Issue → action

**Playtest and art**

| Issue | Sev. | Action |
|---|---|---|
| Phone strip stays open 1.5 s after Lock in and hides the run | high | Fixed. On the `predicted` event the unit folds the strip at once if the marker opened it and no second ask follows (the boss's two markers stay open together). `casino_shots.py` now checks every ask at 390 × 780: the strip is folded 350 ms after Lock in (0 notes). |
| Scoring opaque: dashed boxes unexplained; a backed bin can pay −3 | high | Fixed with the picture, not a rule of thumb: pay pills on every bin (both reviewers asked for visible stakes), a first-bet whisper "Dashed boxes: his bets. Beat them.", "Each pill shows what one jar pays." with the first chip, and after a table where a backed bin paid less than zero, once: "He backed this bin harder than you." or "Piling chips elsewhere costs you here." (said at the settle, not over the jars). **Rejected:** the level-card line "Chips above his boxes win; chips below lose": under the quadratic rule it is false (a bin above his box can still lose if your other chips are piled up), so the pills carry the exact number instead. |
| What if? card drew all three tables (36 traces) under "barely moved" | high | Fixed: with a thawed table the card and strip use only that table (one fan, one dashed line, no stale "you" marker). L2's thawed rack is labelled by its lever ("volcano", "jars of 20"). |
| Volcano loses chips in every plan; HUD steers to it; expectation ignores it | high | Fixed by redesign (with the design reviewer's option a; see L2 above). Exact numbers: on the 200-bead rack crashing can only lower what can be won (best edge 64 chips with no crash, 44 with four), and the game no longer suggests it there; "Tap jars to crash them. He ignores crashes." appears on the 6-bead rack with your first chip. |
| No visible undo; hold-to-remove untaught; slow tap removes | med | Fixed: a Clear button (X) beside Spin once all ten chips are down, which is the reviewer's case (a mis-tap with a full bet); before that a hold or a drag off takes a chip back, and "Hold a bin to take a chip back." is said once, at the tenth chip. (A Clear button from the first chip let the random monkey wipe every bet, 0 of 6 runs finished, so it waits for a full bet.) a hold now needs 0.55 s (the ring shows it filling). **Rejected:** hold-to-pour; tap stays the only way to add, so a slow tap never adds by surprise. |
| Level cards name a star the level cannot award | med | Fixed: each card's "still to earn" line comes from that level's own stars (L1, L2, L4: Discover, Predict; L3: all three; boss: Discover, Transfer) with level-specific words. |
| Boss card: unconditional "You beat the croupier"; generic take; inversion missing | med | Fixed: the take is the inversion with your numbers; the body opens "After a brief crash, alleles vanish faster than heterozygosity", adds "Your zoo plan kept 9.5 of 12 letters" only when Discover was earned, then a 22-word recap. No "you beat" line. |
| Why? shows all nine chunks from L1; "11. 5" | med | Fixed: each level passes its own `o.why` (L1 neutral fixation; L2 the 2N ln 2 time; L3 Buri, Frankham and Ne; L4 Mayr's founder principle; boss the crash maths, the seals and the zoo). No decimals remain in Why? or MODEL text (oracle check). Engine request below for the splitter. |
| L3 side tables are three formula quizzes | med | Partly fixed: Ne defined once; a cue in each cage; untimed markers; the rule shown at each reveal, so the second and third tables build on the first; spread on the fit. **Deferred:** a hands-on cage verb or a sixth level for Ne. Either is a new mechanic for the designer's playtest to judge; the side tables are kept as the Transfer test, now with the help the reviewer asked for. |
| L1 repetitive (30+ taps) | med | Fixed: two tables, Same bets. **Rejected:** a "His odds" button: copying the croupier earns exactly nothing by construction and would offer a no-thought path. |
| HUD ask lines wrap to 3 lines | med | Fixed: every ask is 7–11 words with no "Drag the marker:" (the ring and Lock in say it). L3's bet line also shortened. |
| Desktop felt sparse | med | Fixed: on wide screens chips grow to r 18 and jar icons to 32 px, with the stack step scaled. |
| Boss whisper "The croupier changes his odds"; stale whispers; clipped halo | med | Fixed: no reprice whisper in the boss (none in L1 either); whispers are cleared at Spin and at the run start; the boss markers' axis runs to 1.2, labelled "before" and "after", so the halo is inside. |
| Phone strip legends truncated and overlapping | low | Fixed: the folded strip draws one chart with short labels ("avg", "exp", "jar"); the pinned-jar trace is "your jar" (not a second "you"); L1 and L3 axes run two generations past the marker so its diamond clears the legend. Hiding y labels in the folded strip is an engine matter (request). |
| Hero bottle flies on two diagonals | low | Fixed: jittered 4 × 4 grid, smaller flies. **Rejected:** a digit per fly: 16 more 12 px labels would crowd a 110 px bottle; eye colour, the vial and the "% bw75" pill carry the count. |
| "1 chips", "1 tokens" | low | Fixed: a plural helper for every chip count; the zoo HUD line no longer repeats the token count. |
| Small overlaps | low | Fixed: landing pops sit above the bin's stack; the zoo's tags are one row under the tokens and the H gauge; the side-table fit pop is gone (the fit pill remains); one purse display (the HUD; the felt's "Purse" label is gone). |
| Side-table fit outside the band 20% of the time | low | Fixed: 300 cages, "fit N ±e" (delta-method spread over the cages), the formula pill, and a live line ending "Stars read the formula". Oracle: the formula lies within ± 2 spreads in 18 of 18 runs. |
| P toggles focus off when the marker opens focused | low | Worked around: when the last input was a key, the ask says "Arrows move the marker. Enter locks it in." The idempotent-P fix is the engine's (request). |
| Small beads: blue/amber by luminance only; B and I reuse data inks | low | Fixed for beads: amber beads under 6 px carry a dark stroke. The 12-allele fills are the engine's `Pal.allele` scheme (4 fills × 3 patterns, D4 rule 7); request below. |
| 12 s first marker; dead taps | low | Fixed: no marker ever auto-commits (`soft: null`; the sim's ask timeout is gone). Tapping a jar or bottle while betting pins it (L2: crashes it); the zoo's price tags work as buttons. |
| Landscape phones | low | Partly: the felt's top labels hide when the felt is under 110 px tall. The 3-line HUD cap is the engine's. Landscape phones stay best-effort. |
| Two "Castaways" entries; legacy card deleted | low | Partly: `TRANSFER.castaways` is no longer deleted, so the legacy chapter opens as before. The menu title is in `00_entry.js`'s plan (request). |

**Science**

| Issue | Sev. | Action |
|---|---|---|
| "Jars of 200 barely move", "barely moved" (undoes Wave 1 G1) | high | Fixed: lost1 "Jars of 200 spread out but almost never settle in forty"; big "Jars of 100 beads spread out, but most were still mixed after thirty generations". Oracle: no "barely mov" anywhere in content. **For the D3 owner:** D3 §3.2 L2 still says "barely move"; I did not edit D3. |
| No visible stakes | high | Fixed (pay pills, above). |
| Equal families made family size inherited | med | Confirmed and fixed (mothers, fathers and offspring sex shuffled). New oracle: daughters of two-young mothers raise two young 33.6% of the time vs 33.0% for others (was 100% vs 0%). Zoo now: no plan 6.4, balance 7.5, families 7.8, both 9.6. The oracle line reads "the 15 males still limit Ne", and equal families alone now clearly help. |
| Mutation rate not shown ×N | med | Fixed: boss MODEL param "mutation (What if?) 1 in 10,000 copies a generation", tag ×N, real "1 in 100,000 or fewer for most genes"; a "mutation ×N" pill during that run. The unused label is gone. |
| "Unequal families make Ne smaller than N" implies ideal = equal | med | Fixed: "families more unequal than chance" in the body, take, MODEL, HUD; Why? adds "In an ideal population family sizes vary by chance (Vk about 2), so Ne = N". |
| Crash keeps H only for a brief crash; seals contradiction | med | Fixed: MODEL "for one generation; the island regrows at once"; maths "That holds for one generation followed by fast regrowth. A population of N that stays small loses a 1/(2N) share of H each generation"; seals "stayed few for decades". |
| "Most letters were lost" never true | med | Fixed: lost4 "About half the letters were lost …" when the plan keeps under 7.5; lost4b "A few letters too many were lost …" otherwise. |
| "About 1.4N" without "on average" | low | Fixed in the take and maths ("on average", "when N is large"). |
| "Nearly every islet started close to half" | low | Fixed: "most islets started near half amber, and none far from it". |
| "They rarely carry exactly the mainland share" | low | Fixed: "They often miss the mainland share; five hit exactly half only one time in four." |
| L2 bins read as running totals | low | Fixed: "By gen 5, 6–10, 11–20, 21–40, Not by 40". |
| H definitions mixed (32/31 vs 2pq) | low | Fixed: every copy in a bottle is counted, so `buriH` is the bottle's own 2pq; realised and 16-fly lines both start at 0.5; axis to 0.55. The H19 expectation is now 0.204 (his 0.274 still misses). Ne fits are ratios, unchanged. |
| Mutation re-creates lost letters | low | Fixed: "mutation made letters now and then"; MODEL "Mutation can only remake one of the 12 letters". |
| Mayr 1954 cited for the founder principle | low | Fixed: `mayr1942` (MODEL L4 and Why? "Mayr (1942) called this the founder principle"). |

**Design**

| Issue | Sev. | Action |
|---|---|---|
| Volcano after the bet breaks the proper score | med | Fixed with option (a), above. Oracle: the crash chain matches 20,000 simulated jars (by gen 5 and by 40, within 1.2 points); the crash-aware bins sum to 1; four crashes at most; the record keeps them. |
| Nothing happens between bets; role "environment" | med | **Rejected for now, with reason:** any event bought after the bet changes the outcome but not the bet, which is exactly the flaw fixed in L2. The environment role is now carried before the bet (L2 crashes, L4 storm size) and in the boss (the eruption, the zoo). L1 and L3 keep the pin as their in-run verb. Flagged for the designer's playtest. |
| Zoo is a one-decision puzzle; migrants dominated; no letters on beetles | med | Partly fixed: letters on every beetle; migrants every generation at 3 tokens (balance + migrants from 14: 8.7 letters, from 0: 7.6, so timing matters); tags as buttons. **Rejected:** a responsive "rescue a rare letter" verb tuned so only responsive play reaches 9. I prototyped it: the luck-free score replays your action timeline 200 times (D2 §11), and a reaction to one run's rare letter is worth little in the other 199 (live 9.9 letters, replayed 7.7). Scoring responsiveness would need the realised run, which D2 §11 forbids. The threshold bot (balance + families) earns Discover because its rule *is* the concept; it earns no other star. |
| L3 stacks four mechanisms; hidden weights | med | Partly fixed: the run's family line moved into the bet line; brood dots in the hero before betting; side-table cues and formula reveals. A separate Ne level is deferred to the designer (above). |
| Markers auto-commit at 12 s | med | Fixed: never (also for untimed mode). Logged here as the decision. |
| Teacher hook incomplete | med | Fixed: `resultBits(s, level)` (30 bits; L1 = the twelve jar outcomes of table 1 for the class U; bit map in the code); `freezeAsk()` opens an unscored "where will it end?" marker on the live graph during an L1–L3 run; the instructor note and playtest script are below. `docs/PLAYTEST_GUIDE.md` is not mine: its owner can paste the script. |
| MODEL honesty; "falls by a factor" | med | Fixed (×N param and pill; "falls on average by a factor"). |
| Purse resets each level | low | **Rejected:** each level must replay from (seed, level, log) for result codes and the Freezer; a bankroll carried from earlier levels would break that. Chips no longer buy anything (crashes are free), so the purse is the table's score, shown once in the HUD. |
| Empty felt every table | low | Fixed with Same bets (one tap, on purpose, rather than leaving chips on the felt). L4 leaves the button out (key A still works): there the bet should follow the storm, and the phone dock had no room beside Smaller, Bigger and Release. |
| M mutes; S copies the seed | low | Fixed: Migrant is I; the storm is U (bigger) and D (smaller). |
| Marker never required; fixed L4 bet earns everything | low | Fixed (Predict = marker + tables; L4 defaults 2 and 12). Oracle checks both. |
| `TRANSFER.castaways` deleted too early | low | Fixed (kept). |

### Engine requests (new)

1. `Entry.split`: break on `/[.!?]+(?=\s|$)/` so decimals survive in Why? pages (I removed every decimal meanwhile).
2. `Predict._key`: make P set focus on (not toggle) when the ask opened focused.
3. `Pal.allele`: B (amber plain) and I (blue dots) reuse the two data inks for other alleles; D4 rule 7 suggests natural paints plus pattern.
4. LiveGraph: hide y-axis labels in the folded 112 px phone strip.
5. `00_entry.js` plan: retitle the legacy Castaways entry (for example "Castaways: rescue") until Genetic Rescue replaces it.
6. `Whisper.clear(true)` is used at Spin and run start; a documented `Whisper.drop()` for "clear the current line" would be clearer.

### Instructor note (one page)

- **What it teaches (about 18 minutes):** a neutral allele fixes with its share (L1); small populations settle fast, and a crash speeds drift (L2); Ne, not N, sets the pace, and families more unequal than chance shrink it (L3); a founding group is a sample (L4); a brief crash keeps most heterozygosity but strips alleles, so keeping alleles needs balanced sexes and equal families (boss).
- **Lecture insert (R8):** send an assignment link (`?unit=casino&seed=…&level=0`). Each student's L1 result code holds their twelve table-1 jars (blue, amber, mixed); pool them on the board to build the class U. During a projected run, press F (teacher strip) for an unscored "where will the average jar end?" marker, then R to resume.
- **Misconceptions it targets:** "fixation is a coin toss"; "big populations do not drift" (they spread, they just rarely settle); "an ideal population has equal families"; "a bottleneck destroys heterozygosity" (only a long or repeated one does).
- **Model caveats to say aloud:** jar sizes, crash length, fertility weights and the zoo are designed; the What if? mutation rate is ×N; the zoo's migrants come from a neighbouring island the eruption missed.
- **Discussion prompts:** the three in `teacher.prompts` (80% jar; Buri's 11.5; the least true assumption for a species you know).

### Designer-and-colleagues playtest script (D6 decision 4)

1. L1, table 1: before tapping, say what the dashed boxes mean. Bet, then read one pay pill aloud and say why it is that sign.
2. Lock in the marker and watch the run on a phone: is any of the run hidden?
3. L2: crash some 20-bead jars, then bet. Did you change your chips because of the crashes?
4. L3: before betting, what do the dots in the bottle tell you? On the side tables, did the cue and the formula at the reveal help on the next table?
5. L4: did you size the storm on tables 2 and 3? Did your bet follow it?
6. Boss: after the eruption, which surprised you more, the H gauge or the letters? In the zoo, did you try migrants, and when?
7. Feedback form: one thing that felt like a worksheet; one moment you wanted to replay; any sentence you did not believe.

### Tests after the review round (build `V2_ONLY='0*,zz_*,casino.js'`, scratch `wave2/casino.html`; also a full build with every v2 file)

- `node --check` on `v2/casino.js` and `tests/oracle_casino.js`: clean. `node tests/lint_text.js … casino`: **0 errors, 0 warnings** (single and full build).
- `node tests/oracle.js … casino`: **301 passed, 0 failed** (full build, `DC_FAST=1`: 151 passed). New checks: the crash chain against 20,000 simulated jars; crash-aware bins, the four-crash cap, call-off and the record; the half-settled marker with crashes; Predict refused without the marker (L1, L2, L4) and for a five-founder bet on every storm; equal families not inherited (33.6% vs 33.0%); zoo levels (none 6.42, balance 7.49, families 7.84, both 9.63, balance + migrants from 14 8.72, from 0 7.55); side-table formula within ± 2 spreads (18 of 18); result codes fit 30 bits and repeat; Clear and Same bets; no "barely mov"; no decimals in Why? or MODEL text; bottles and his line on one H scale. Skilled play still earns D+P (L1, L2, L4), D+P+T (L3), D+T (boss) on every seed.
- `python3 tests/bots.py … casino --seeds 1-20`: **PASS**; `--untimed --seeds 1-10`: **PASS**. Best masks: random `-P-` (L1), `D--` (L2, L4), `DP-` (L3), `--T` (boss); threshold `D--` in the boss only (its rule is balance + families); every other cell `---`.
- `tests/monkey.py casino 1,2,3 --vp 390x780,1280x720`: **6 of 6 reach the end card**, no errors, bad text or Lbl/Whisper/HUD/Dock warnings, What if? exercised in 3 runs. Most words on screen at once: 26 (HUD + dock + whisper; was 25). A first version with Clear shown from the first chip finished 0 of 6: the monkey wiped its bets, which is why Clear now waits for a full bet.
- `tests/golden.py check` on this build: **47 ok, 1 skipped** (casino replaced); `--v1`: **48 ok**.
- `tests/casino_shots.py --whatif` (390 × 780 and 1280 × 720): 0 page errors; chip tap to first juice 20 ms (virtual); after every Lock in on the phone the strip is folded within 350 ms. Greyscale (`?cvd=mono`) L2 and boss read.

### Screenshots (review round)

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/casino/review/` (126 shots, every level and phase at both sizes, with What if? runs and cards) and `…/casino/r4cvd/` (greyscale). Worth a look: `L1_bet5_t1` and `L1_run_t1` (pay pills, folded strip), `L2_crashes_t2` (cones), `L3_bet5_t1` (brood dots), `L3_settle_t1_side2` (cue, formula pill, fit ± spread), `L5_zoo_t1` (letters on beetles, tag row), `L5_card` (the inversion take), `L1_whatif_card` and `L2_whatif_card` (one table only).

## 21 October 2026: its own world (D6 decisions 7 and 8)

After playing Batch 1 the designer found every chapter too alike: beetles, blue and yellow. The casino is now a riverboat saloon. It has burgundy damask walls, mahogany and brass, a green baize table with brass rims, burgundy chips, and glass-marble beads in brass-collared jars. Buri's bottles and the Ne side tables sit on a parchment bench board. **The castaways and the volcano and zoo are brown anoles on sandy, scrubby islets in a teal sea**, so beetles now belong to Equilibrium alone. Blue and amber stay only on gene copies: marbles, founders' badges, vials and outcome icons. The opening description card (`content.intro`) and the accent `#8C2438` were added. The model, stars, oracle (301 checks) and bots are unchanged. Details, references (Kolbe et al. 2012; Censky et al. 1998) and the word changes are in `intro_card.md` §4–5.

