# Wave 2: The Scribe (`scribe`)

*Unit builder, 21 October 2026. File `games/endless-forms/source/v2/scribe.js` (`CH_SCRIBE_V2`, replaces the legacy Scribe in `ch2.js` through `V2.push`; `?v1=1` keeps the legacy chapter). Tests: `tests/oracle_scribe.js`, `tests/scribe_paths.py`, `tests/scribe_shots.py`. Spec: D3 §5.1, D5 §4 item 13, D6 (incl. the 21 Oct addendum), lessons_batch1. Nothing outside these files was edited.*

## What I built

**World (D6 addendum 7).** A microbiology bench at night: dark wood planks, a warm pool of lamp light, glass dishes of amber-cream agar, coral colonies, and violet for every lineage the player tags. A replication fork runs across the top of the dish levels as a glowing zipper: the parent duplex on the right, two daughter duplexes behind the fork, and a gold "polymerase" glow that flares each time a division sparks. The velvet is a wooden block faced with deep violet pile. The new-sugar plate is violet-tinted agar. Chrome accent `#8F5CC2` (colony violet). The allele inks (blue A, amber a) are not used: this chapter has no genotype read-out.

**Role:** experimenter with a bench (D1 role 4). The player never places a mutation: sparks happen; the player tags, pours, stamps and picks.

| L | Name | Adds (one variable) | Per-second verb | Prediction gesture (live graph) | Stars offered |
|---|---|---|---|---|---|
| 1 | Sparks | mutation effects (the DFE) | tap a spark within 1.2 s of its flash to tag it; the tagged lineage grows as a wedge that widens, keeps pace, pinches off or stops dead | drag a diamond in a *do harm / no effect / help* triangle (tri, start at the *help* corner, `needMove`) | Discover (≥ 30 fates), Predict |
| 2 | Jackpots | when mutations arise (before the phage) | tap a tube to pour it on a phage plate (colonies bloom; jackpots shake); then tap to flag plates the "phage caused it" idea cannot produce | (a) number of empty plates, a `y` ghost on the counts chart at bin 0 (start 20); (b) μ on a log axis 10⁻¹⁰–10⁻⁵ (start 10⁻⁵), with the p₀ ruler in the scene | Discover (all 20 plated, flags right), Predict (both) |
| 3 | Velvet | replica plating | drag the velvet from the master plate to a drug plate (or tap); then pick the master colony at the spot where drug colonies grew | share of your pick's offspring that will grow on the drug (`y` ghost over bar C, start 50%) | Discover (a resistant line from a colony that never met the drug), Predict |
| 4 | New sugar (boss) | a new environment | tag sparks on glucose (faster sparks: the felt cost); the living lineages are patched onto a new sugar, where some former neutrals bloom | (a) share of your living lineages that will win on the new sugar (`x`, start 100%); (b) Transfer: of 10 patients with 10⁸ bacteria, how many already carry a resistant cell before the first dose (`x`, start 0) | Discover (≥ 16 lineages tagged and moved), Transfer (both) |

`boss.inverts`: "Same sparks, new food: some that did nothing now win, and none came faster." L1 teaches "a mutation is good or bad, and most are bad or nothing"; the boss shows that its effect depends on the environment while its rate does not respond to need.

**Unit stars** (`unitStars`): Discover in two of four levels; Predict in two of L1–L3 (D5: "two of three"); Transfer = the boss. No level offers all three.

**What if?** one lever per level, each re-running the frozen level by itself and reporting its own run: *Triple the rate* (L1: more sparks, same shape), *Phage causes it* (L2: the same plates under a Poisson process: no empty plates, no jackpots), *Drug causes it* (L3: each drug plate gets its own random spots), *Effects fixed* (L4: only lineages that already helped can win).

**Engineering.** Headless `sim` (plain JSON; `R()`, `Det`, `WF` only; a run is (seed, level, actions)). Every random outcome is drawn when it happens: a spark's effect when it flashes, a plate's count when it is poured, the new-sugar fates at the move, the patients at the reveal. So nothing in the state foretells an outcome. Settings enter as logged actions (`unt`). Juice only from `Sim.run`'s events. One custom chart type `sc_xy` (category bars, model ticks, dashed lines, vertical marks, a log x axis), registered behind a guard. 99 KB raw, 31 KB gzip.

## D5 §3 checklist (as amended by D6)

| # | Line | Status |
|---|---|---|
| 1 | Core verb | `role: 'experimenter'`; tap/pour/stamp each second; act-to-juice latency 40 ms in `scribe_paths.py`. No control sets an organism's heritable trait. |
| 2 | First 10 s | D6 card first (`content.intro`, three parts ≤ 35 words); firstWords 15 words; ghost hand after the 1.2 s banner; the first spark waits for its tag, so the first action cannot fail (oracle). |
| 3 | Predict inside play | ≥ 1 `Predict.ask` per level (6 in all), scored against the model's expectation, band shown after commit; tri, `y` and `x` gestures; never two options. |
| 4 | Escalation | 4 levels, one `adds` each; bot sweep 40 seeds × 7 bots, timed and untimed: no bot earns three stars; no bot's unit union reaches three (oracle). |
| 5 | Boss | The new sugar inverts "good or bad"; `boss.inverts` 14 words. |
| 6 | Live graph | `notes()` returns LiveGraph specs; realised solid, expected dashed, you a diamond; expectations and model ticks appear only after the commit (reveal ladder). |
| 7 | Juice | T1 ring on tag, T2 on the full dish and the move, T3 on a raced-ahead lineage, a jackpot plate, a resistant line, a new-sugar winner; every `Snd2` call paired with a visual; Calm through `Fx`. |
| 8 | Text budget | `lint_text.js`: 0 errors, 0 warnings. Canvas words only through `Lbl.put`. |
| 9 | Science honesty | MODEL card per level with tagged params; on-screen chips "sparks ×N", "odds ×N", "resistance ×N"; refs below; the oracle checks the claims. **Coordinator A has not signed off.** |
| 10 | Teacher hook | projector via the engine; seed links; `resultBits` (bit map in the file); `teacher.pool: 'dots'` (class 20-tube counts, D3); three prompts, the last a model critique; CSV through `Events`; instructor note below. |
| 11 | Accessibility | Keys: Space tags / pours / stamps, arrows + Space flag plates, arrows + Enter pick a colony, P for predictions; every drag has a tap alternative (tap master, velvet or plate to stamp); untimed mode (sparks wait; "Let go" releases them); live-region lines; data-table twins (`rows`); CVD and hue lints pass; mono and deut screenshots. axe-core not run (not available offline). |
| 12 | Learning layer | TAKE, MODEL, RECALL, BRIDGE rewritten outside `?v1=1`; legacy `ch2.js` untouched; there was no TRANSFER or ch99 patch for the Scribe to port. |
| 13 | Monkey | 3 seeds × 390×780, 1024×768, 1280×720: every run reaches the end card (numbers below). |
| 14 | Playtest | replaced by the designer-and-colleagues script below (D6 decision 4). |

## Science claims, with references (for Coordinator A)

| Claim (where) | Model / wording | Ref id |
|---|---|---|
| Mutations arise from copying errors, DNA damage, faulty repair and jumping genes, whether or not they would help (intro, sources on the zipper beads) | source drawn independently of effect; patterns by source, never by effect | luria1943; lederberg1952; D0 §3 |
| Genome mutation rate in DNA microbes ≈ 0.003 per replication (L1 MODEL; P.U tagged ×N at 0.01) | | drake1991 |
| DFE: most new mutations neutral or harmful, few helpful; the game's 1% helpful sits at the top of the genome-wide range 10⁻⁵–10⁻² (L1 MODEL; fates chart note "real genomes: under 1%") | designed 35/30/34/1 | eyrewalker2007; gao2019 (range, per D3) |
| Single-nucleotide VSV mutants made one at a time: about 40% lethal, 29% harmful, 27% neutral, 4% helpful (second ghost on the fates chart) | **approximate; please verify the split against the paper** — D3 already flagged "verify"; my web check was blocked | sanjuan2004 |
| Sectors in expanding colonies widen with an advantage and pinch off with a cost (L1 wedges; MODEL cannot: neutral wedges wander by drift) | half-width w₀ ± k·ln(r/r₀), k ∝ √(2|s|) | hallatschek2007; korolev2012 |
| Fluctuation test: counts far more spread than Poisson; mutants arose before the phage (L2) | 100 cells × 2¹⁷, μ = 10⁻⁷, binomial mutants per generation; oracle: VMR ≈ 1.00 induced, median 13 pre-existing (10⁴ seeds) | luria1943 |
| p₀ method: m = −ln p₀, μ = m ÷ N_t (L2 Why?, the ruler) | oracle: bias +4.6% over 10⁴ racks of 20 | luria1943; rosche2000 |
| Replica plating: identical spots on every drug plate; resistant lines from cells that never met the drug (L3) | pure colonies; enrichment rounds skipped and disclosed | lederberg1952 |
| Gene effects depend on conditions (boss MODEL): nearly every yeast deletion matters in some condition; a mutation helpful on one sugar can be neutral or costly on another | designed win odds 10/35/50% (×N) | hillenmeyer2008; ostrowski2005; cooper2000 |
| Stress can raise bacterial mutation rates, but the extra mutations are not aimed at what would help (boss MODEL cannot) | spark rate unchanged on the new sugar | foster2007 |
| Before treatment, with m resistance mutations expected per patient, P(carrying one) = 1 − e^(−m) ≈ 78% at m = 1.5 (boss Transfer) | designed 10⁸ cells, m = 1.5 | luria1943 (logic); rosche2000 |
| Humans: about 60–70 de novo mutations per child, mostly paternal, rising by about 1.5 per year of the father's age; why is debated (sperm-cell divisions vs damage) (L1 Why?) | wording follows sweep G2 (Gao et al. 2019 replaced the "because sperm cells keep dividing" claim) | jonsson2017; gao2019 |

## Deviations from the spec, and why

1. **DFE prediction is a triangle (harm / no effect / help), not four bars.** `Predict` takes one value or a simplex point per ask; the triangle captures the whole shape in one gesture. Lethal and harmful are separated on the fates chart, where both ghosts are drawn.
2. **The plate-spread prediction (variance/mean) became "how many plates stay empty?"** The VMR of 20 plates is wildly variable and abstract on a phone; the empty-plate count has an exact expectation (20e^(−m) = 5.39), separates the hypotheses (Poisson gives 0), and leads straight into the p₀ estimator. D5's "plate spread" survives as the flagging task, the spread stat and the oracle.
3. **μ̂ is scored against the true μ within a factor of 2** (D5), not against the player's own reading. The oracle shows an honest reader lands inside on 97.5% of racks.
4. **L3 sib selection in one round**: master colonies are pure clones, so the matched pick is all-resistant at once; the Lederbergs' multi-round enrichment is disclosed in the MODEL card.
5. **The boss uses its own glucose tagging round**, not a resident from L1, so every level replays alone (lessons §1.6). The patient Transfer is a count prediction (how many of 10 already carry resistance) rather than a timeline drag: it has an exact expectation and the same lesson (resistance was there before the drug).
6. **Untimed:** sparks wait (D3 said "hold for 2 s"); a "Let go" button releases them, so nothing is a reflex test.
7. **No codon inset.** The D3 "keep" item (silent/missense/nonsense/frameshift bubble) was cut for the zipper with sources by pattern; codon classes would bring back the typing-test feel and the file budget. Candidate for a later pass if the designer wants it.

## Engine requests (nothing was edited)

- The level card's "still to earn" line names the first star the *unit* lacks, so after L1 the card can ask for a Discover the player just earned in that level (the unit rule needs two levels). A per-level "earned here" mark would read better.
- `Petri` draws allele-amber variant colonies; I drew my own plates in the chapter palette (D6 addendum 7). A palette option on `Petri.plate` would let units reuse it.
- Card buttons arm after a real-time delay; scripted tests must wait in real time (noted in `scribe_paths.py`).

## Tests (build: `V2_ONLY='0*,zz_*,scribe.js' python3 build.py <scratch>/scribe.html`)

- `node --check v2/scribe.js`: clean. `node tests/lint_text.js <build> scribe`: 0 errors, 0 warnings.
- `node tests/oracle.js <build> scribe`: **58 passed, 0 failed** (full mode, 10⁴ seeds for the fluctuation test; `SC_FAST=1` ≈ 4 s). Highlights: P(empty) 0.274 against e^(−m) 0.270; induced VMR 1.004; pre-existing VMR median 13.0, mean 136; 92.7% of pre-existing racks above VMR 3 against 0.00% induced; p₀ estimator bias +4.6%; DFE tallies 35.2/30.2/33.7/0.95%; sources identical across effect classes; new-sugar winners 0.258 against the expectation 0.239; patients 7.92 against 7.77; determinism, replay and snapshot round trips on all four levels; expert earns D+P, D+P, D+P, D+T on every seed; no bot three stars in a level or across the unit; every What if? finishes and earns nothing; untimed and random runs finish.
- `python3 tests/bots.py <build> scribe --seeds 1-40` (7 bots) and `--untimed`: PASS.
- `python3 tests/scribe_paths.py`: 20 checks pass (real taps on sparks, tubes, plates, colonies; a real velvet drag; Space; untimed wait and let-go; What if?; teacher; `?v1=1`; latency 40 ms).
- Monkey (`GAME_HTML=<build> python3 tests/monkey.py scribe 1,2,3 --vp 390x780,1024x768,1280x720`): **9 of 9 runs reach the end card**, no errors, no NaN/undefined text, no Lbl/Whisper/HUD/Dock warnings (≈ 1,330–1,410 steps a run). Rerun after the untimed fix at 390×780 and 1280×720: 6 of 6.
- Frame time (`draw` alone, 390×780 at DPR 2, 4× CPU throttle): L1 full dish median 3.9 ms (p90 27 ms, first-frame bakes), L2 grid 4.1 ms, boss 0.3–9 ms. Background, agar, colony texture and each plate's colonies are baked once into `Layer`s.
- `python3 tests/golden.py check <build>`: 47 ok, 0 failed, 1 skipped (`scribe`, replaced).

## Review round (playtester and art director, adversarial scientist, D5 §3)

| Issue | Verdict | Action |
|---|---|---|
| Level banner sat on the zipper | right | moved onto the dish |
| Lethal lineages each drew a glyph disc: the full dish was a field of × | right | small grey speck with a thin ×; discs only for living fates |
| Wedges too thin to read the fate without the glyph | right | w₀ 0.09 → 0.16 rad; harmful wedges taper over a longer run |
| Triangle labels collided in the folded phone strip; the virus point sat on the expectation | right | labels dropped when folded; virus ghost kept on the fates chart only |
| Boss card's chart was one vertical line | right | winners by glucose class against the model's designed odds |
| No ×N on screen | right (D5 §3.9) | chips "sparks ×N", "odds ×N", "resistance ×N" |
| A "flag every plate" bot earned L2 Discover on 1 of 10 seeds | right | no flag allowed on a plate inside the Poisson central 99% |
| Untimed: a player (or bot) who never tags is stuck on a waiting spark | right | "Let go" (untimed only) releases lit sparks, the first included; sweep has no caps |
| Unit Discover needing three of four levels left the card asking for stars already earned | partly | unit rule now two of four; engine request logged for the card line |
| Intro omitted transposons from the sources | right | "copying errors, DNA damage, faulty repair and jumping genes" |
| Neutral wedges keep a constant angle; real neutral sectors wander by drift and often vanish | right, kept as a simplification | disclosed in the L1 MODEL "cannot" |
| "Mutations that help on one sugar often cost on another" overstated Ostrowski et al. 2005 (mostly positive pleiotropy) | right | "can be neutral or costly"; Cooper & Lenski 2000 added |
| New-sugar win odds (35% for neutrals) are far above reality | right, kept for the lesson | tagged ×N on screen and in MODEL |
| Stress-induced mutagenesis contradicts "the rate does not respond"? | rejected | the model claim is about need, not stress; MODEL card says stress can raise rates without aiming them (Foster 2007) |
| Jackpot rings give the flagging answer away | accepted as Discover | Discover is "notice what the null cannot make"; the empty plates, unringed, carry the harder half |
| Sanjuán et al. 2004 split unverified | open | flagged for Coordinator A |

## Screenshots

`tests/scribe_shots.py` at 390×780 and 1280×720 (plus `?cvd=mono`, `?cvd=deut`), in the scratchpad `scribe/shots*/`. Fixes found by looking: the level banner covered the zipper (moved onto the dish); lethal lineages drew a paper glyph disc each and cluttered the full dish (now a small grey speck with a thin ×); wedges were too thin to read (w₀ doubled, harmful wedges taper over a longer run); the triangle's point labels collided in the folded phone strip (dropped there; the virus point moved to the fates chart only); the "real genomes" note sat on the neutral bar; the boss card's single vertical line said little (now winners by glucose class against the model's odds); ruler labels ran off the edge; L2 dishes were small on a phone.

## Instructor note (one page)

**What students do.** Tag mutations on a growing colony and watch each lineage's fate; plate 20 cultures on phage and see empty plates and jackpots; copy a plate with velvet onto drug plates and pick a resistant colony that never met the drug; move tagged lineages to a new sugar; predict at every step.

**What they should leave with.** (1) Mutations arise from several sources and are blind to need: their effects are drawn from a distribution in which most are neutral or harmful and few help. (2) The fluctuation test: if exposure caused resistance, counts would be Poisson; instead many plates are empty and a few are jackpots, so mutants arose before the phage. μ ≈ −ln p₀ ÷ cells per tube. (3) Replica plating shows resistance is selected, not induced. (4) An effect depends on the environment; the rate does not respond to need; most patients with large infections already carry resistant cells before treatment.

**Exaggerations to name** (all tagged ×N in-game): the mutation rate per division and sparks a second; the helpful share at the top of the real range; resistant colonies on the master plate; the share of neutral mutations that win on a new sugar.

**Discussion prompts.** (1) What does the mix of fates tell you about how mutations arise? (2) If bacteria became resistant because they met the phage, what would the 20 counts look like? (3) This model gives every neutral mutation the same chance on a new sugar. What would make that unrealistic?

**Class pool.** Collect each student's 20 L2 counts (Show data) into one histogram: the long tail appears at class scale.

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open The Scribe from the menu; read the card; press Play. Note how long until your first tag.
2. L1: tag as many sparks as you can. Do the fates (widen, keep pace, pinch, stop) read without words? Does the triangle prediction feel like a decision?
3. L2: pour all 20 tubes. Did a jackpot feel like a jackpot? Was it clear why the empty plates also count against "the phage caused it"? Could you estimate μ from the ruler?
4. L3: stamp both drug plates and pick the matching colony. Was matching spots fun or fiddly on your device?
5. Boss: did the new-sugar winners surprise you? Did the patients question connect to the jackpots?
6. Rate enjoyment 1–5, mark any moment you were bored or lost, and note any science wording you would challenge.

## Simplification (D6 decision 9), 23 October 2026

I played all four levels at 390 × 780 first (screenshots in the session scratchpad: `s3/simp_clinic_scribe/before/scribe/`, then `after/scribe/`). The night bench, the lamp, the replication-fork zipper, the colony with its violet wedges, the phage plates, the velvet block and the new-sugar dish all stayed. What made the chapter heavy was the asking: six predictions on four gestures (a harm/none/help triangle, an empty-plate count, a log μ ruler, a velvet share, a new-sugar share, a patient count), plus a flag-every-plate step in Jackpots and a rack of ten patients bolted onto the boss. The session-3 partial edit (`v2_wip/scribe_simplify_partial.js.txt`) had already cut most of this but left the oracle on the old design; I started from it, fixed what it missed and brought the oracle, paths and shots tests into line.

### What was removed or merged, and why

| Removed or changed | Where | Why |
|---|---|---|
| The harm / no effect / help triangle ask | L1 Sparks | A simplex gesture that did not make the aha. The key number is now shown when the dish fills: "Dish full. Your fates so far: 72% harm, 26% no effect, 2% help." The model and virus ghosts appear on the fates chart only then. |
| **Kept: "how many plates stay empty?"** | L2 Jackpots | **The chapter's one prediction**, asked after the tubes grow and before pouring. Under "the phage caused it" almost no plate is empty; the model expects 20e^(−m) ≈ 5.4. It carries the Predict star (±2.5 plates). |
| The flag-every-plate step and the μ ruler ask | L2 | Fiddly, and a second idea (estimating μ). After the last pour the HUD gives the key number: "Spread: 10.9× the mean. A phage-caused process would give about 1." m = −ln p₀ stays in Why? maths and is checked in the oracle. |
| The velvet share ask | L3 Velvet | Its answer (all or nothing) is the reveal itself; the stamp onto plate C now follows the pick directly. |
| The new-sugar share ask, the patient ask and the ten patients | L4 New sugar | Two asks and a second idea (the Luria–Delbrück transfer to patients). The key line is shown after the move: "6 of 23 living lineages win on the new sugar; 5 did nothing on glucose." The patient maths stays as one line in Why? maths. |
| A miscount | L4 | The boss body and key line said "{w} of {n} living ones won" with n = all fates (lethal included); they now use the living lineages moved (`np`). |

The levels stay **L1 Sparks, L2 Jackpots, L3 Velvet, L4 New sugar**, one experiment each (tag, pour, stamp and pick). The intro card's "How to play" ends "Once, predict how many plates stay empty."

### Stars, re-balanced

| Level | Discover | Predict | Transfer |
|---|---|---|---|
| L1 Sparks | follow at least 30 tagged sparks to their fates | — (was the triangle) | — |
| L2 Jackpots | — (was "flag every plate"; pouring all 20 is no discovery) | **the one prediction**, empty plates ±2.5 | — |
| L3 Velvet | build a resistant line from the matching master colony | — (was the share call) | — |
| L4 New sugar | — | — | tag at least 16 sparks and move their lineages (was both boss calls) |

Unit stars: Discover in Sparks and Velvet; Predict = Jackpots; Transfer = New sugar. No level offers more than one star now, so no bot can reach three in a level; the oracle checks every bot's union across the unit stays under three.

### Science
No model change. The DFE, the fluctuation test (variance ÷ mean ≈ 1 if induced, ≫ 1 if pre-existing, over 10⁴ racks), the p₀ estimator, the velvet prints and the new-sugar odds are all still checked. The patient parameters left the boss MODEL card with the patients; the card now lists the harmful-turned-winner odds (10%, ×N).

### Real biology (D6 decision 10)
Already met: a real colony growing across agar with mutant sectors, real phage plates with colonies, real replica plating with velvet. The strip charts sit beside them.

### Tests
- `tests/oracle_scribe.js`: the old triangle, μ, velvet-share and patient checks replaced by: the ghosts stay hidden until the dish is full; the only ask is z1 in Jackpots; the spread key number and empty count are the run's own; the new-sugar key line counts the run; expert earns D, P, D, T on every seed. **60 passed, 0 failed.**
- `tests/scribe_paths.py`: the ask opens after growth; all 20 poured winds up with the spread key number in the HUD; no flagging. **0 failed.** `tests/scribe_shots.py` drops the flag, ruler and patient shots.
- Lint 0/0; `dup_globals` ok; bot sweep seeds 1–40 PASS; monkey seeds 1–3 at 390 × 780 and 1280 × 720 reach the end card.

### Playtest script (replaces the one above)
1. L1: tag sparks. When the dish fills, does the harm / no effect / help line surprise you?
2. L2: make the empty-plate call, then pour. Did the empty plates and the jackpot convince you the mutants came first?
3. L3: stamp both drug plates and pick the matching colony. Fun or fiddly?
4. L4: did lineages that did nothing on glucose winning on the new sugar land?
