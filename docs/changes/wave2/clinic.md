# Wave 2: The Clinic (`clinic`)

*Unit builder, 21 October 2026. Spec: D1 §3.8, D5 §4 item 11, D6 (with its 21 October addendum). File `games/endless-forms/source/v2/clinic.js` (`CH_CLINIC_V2`, `V2.push`); the legacy chapter stays playable at `?v1=1`. Tests: `tests/oracle_clinic.js`, `tests/clinic_paths.py`, `tests/clinic_shots.py`. Nothing else was edited. Not committed.*

The designer loved the old Clinic's clear dose decisions. They stay: two doses (tap the dish for a low dose, hold it for a high one), a visible budget, and a dish you can read. What changed is that the doses are now live and strategic: the drug level draws itself on a bedside monitor against the MIC and the MPC, with the mutant selection window hatched, and every dose can be seen fading through that window on its way down.

## What I built

**The world (D6 decision 7).** A hospital ward at night, seen two ways. The microscope view is a dark-field eyepiece of glowing rods: susceptible cells pale teal, resistant cells neon magenta and a size larger (spiked for a chromosomal mutation, ringed for a plasmid, double-walled for the high-level strain, half lime when resisting both drugs). The drug arrives as a cyan tide that rises with log concentration. The eyepiece rim lights up by concentration zone: hatched magenta inside the window, cyan above the MPC. The ward map shows beds from above with patients under sheets, drips, isolation glass, a nurse walking the corridor (her hand-dots tint magenta as unwashed carriage builds), a hand-rub dispenser with its compliance arc, staff-time pips, and an intensive-care box that fills with pictograms. The palette is clinical teal and white with neon magenta for resistance and coral for fevers and intensive care. There is no blue or amber anywhere (no genotype read-out is needed). Each chapter tints its chrome: this one draws its own night-ward ground over the Lab plate.

**The description card (D6 decision 8).** `content.intro = {game, biology, how}`, each under 35 words; `00_entry.js` draws it.

| L | Name | Adds (one variable) | Verb | Prediction gesture (on the live graph) | Stars it can give |
|---|---|---|---|---|---|
| 1 | The course | drug concentration over time | Opening: a lab dish of 10⁹ TB bacteria with a Luria–Delbrück handful already resistant; drag the resistant share after two days in the window. Then one patient: tap the dish for a low dose (2× MIC, inside the window), hold for a high dose (24×, above the MPC); 60 dose points (low 1, high 12) | log₁₀ resistant share of the dish on day 2 (±0.5 decade), revealed when the dish has run | Discover: clear the infection within the budget. Predict: the dish call |
| 2 | Weekends at home | missed doses | Same drug; on days 3–4 and 10–11 the patient is home and no dose is taken (taps show crossed pills) | Friday's ask: resistant cells on Monday (log₁₀, ±0.5) | Discover: clear despite the weekends. Predict: Monday |
| 3 | Two drugs | a second drug | Tap pump A, pump B, or the dish for both (low doses) | Before treatment: how many of the 10⁹ resist both? (log₁₀, ±1 decade; ~10⁻³ expected) | Discover: clear. Predict: the both-drug count |
| 4 | Already there | resistance already present | Two beds; bed 2 arrived with 3% high-level resistant TB that no safe dose touches; tap or hold either dish | Practice: bed 2's resistant share on day 3 if hit hard daily (no star) | Discover: clear bed 1. Transfer: keep bed 2 out of intensive care for six days |
| 5 | The bay | plasmids moving between beds | Six beds, KPC *Klebsiella pneumoniae* in the gut; tap a fever to treat it (one dose covers a day), hold a bed to isolate it (2 rooms), tap the dispenser for a hand-rub round; 6 staff units a day (dose 1, isolate 1, rub 2) | Day 1: the index patient's plasmid share in five days with no more drug (±0.07) | Discover: plasmid in four patients or fewer, two ICU moves at most. Predict: the index bed |
| 6 | The long winter (boss) | a compensated plasmid cost | Twelve beds; you arrive on day 30 after an autumn of colleagues treating every fever (pre-run from the seed), the plasmid's cost compensated from 0.45 towards 0.28; the drug is restricted; fevers now get an older drug | The restriction call: ward share on day 90 if nothing else changes (±0.06); after the commit two ghosts appear: "restriction alone" and "no compensation" | Predict: the restriction call. Transfer: ward share under 8% by day 90 with two ICU moves at most |

**Boss inversion** (`content.boss.inverts`): "Stopping the drug no longer removes resistance: its cost has been compensated." Restriction alone halves the ward share over 60 days (0.56–0.83 → about 0.32 on 16 seeds); the same plasmid with its cost intact would collapse under 2%. What gets the ward under 8% is stopping transfer (hands, isolation) while turnover replaces carriers.

**Unit stars** (`unitStars`, D1 §3.8): Discover in two levels, Predict in two levels, Transfer in one. No level offers three stars.

**Live graph.** A unit chart type `cl_trace` (registered from this file, guarded) draws in the clinic's own inks with a hatched band (the window) and labelled reference lines (MIC, MPC, the immune line, the ICU line, γ − δ). Charts: dish share (L1 opening); cells on a log scale with the immune line; the drug level; bed 2's resistant share; bed carriers and the ward share; the plasmid's cost. Realised solid, expectation dashed only after the commit or at the end, "your call" a diamond. The in-scene monitor is the live graph a player watches; the strip carries the data twin ("Show data").

**Pacing.** A day lasts 2.0 s (L1), 1.8 s (L2–L3), 2.0 s (L4), 1.5 s (L5), 1.2 s in the autumn pre-run and 0.8 s in the boss winter. A level ends on a cure. When nothing is left to decide (every bed under the immune line with the drug gone, or no dose affordable) days run ×3. Untimed mode (`?untimed=1` or Settings) waits at each dawn for Next day (dock, N).

**Exports.** `ClinicPK` (`decay`, `dose`, `kill`, `psi`, `window`) through `EXPORT`, for D3's Tumour side quest.

## The model (all in the sim; R() and Det only)

- **Within one patient (TB).** Strains S, M (single-step mutant; MIC = the MPC = 16× MIC), A/B/AB in L3, X (high-level, MIC 1000×) in L4. Net growth ψ = b(1 − N/K) − Σ_d (b − ψmin)·x²/(x² − ψmin/b) − immune, with x = C/MIC_strain (Regoes et al. 2004, κ = 2; ψ = 0 at the MIC). b = ln 8 (S), ln 7 (resistant), ln 6 (double); ψmin = −3 a day; K = 10¹⁰. Immune clearance: 99% a day under 10⁵ cells, nothing above (designed switch, D1). Mutants arise during treatment as Poisson draws at μ = 10⁻⁷ per division per drug; the starting mutants come from a Luria–Delbrück history (10⁴ founders doubling to 10⁹). Counts under 0.5 are removed.
- **Pharmacokinetics.** One compartment: a dose adds its peak at once; the level falls 8-fold a day (half-life 8 h). Ceiling 64× MIC. So every dose spends ln(MPC/MIC)/k = 32 h in the window whatever its size.
- **The ward (KPC).** Each bed is one number p, the share of that patient's gut *Klebsiella* carrying the plasmid: dp/dt = p(1 − p)(γ − c + 0.4·kill_S(C)) − δp + β(1 − h)(1 − p)·p̄_others, with γ 0.3, c 0.45 (falling towards 0.28 at 5% of the gap a day while carried, boss only), δ 0.02, β 0.12, h hand-hygiene compliance (baseline 0.4, a round sets 0.9, decaying a quarter of the gap a day). Isolation removes a bed from the sum both ways. Fevers (10% of beds a day; 12% in the autumn, 5% in the winter) are caused by a carrier strain with chance p at onset; the drug clears a fever in 0.8 drug-days unless the strain carries the plasmid; untreated or failing for 3 days the patient moves to intensive care and a new patient is admitted (8% arrive carrying KPC). Discharge 4% of beds a day in L5, 4.5% in the boss.

## Science claims, with references (for Coordinator A)

| Claim (on screen or in a card) | Where | Reference / check |
|---|---|---|
| Mutants resistant to one drug already exist in large TB populations | L1 MODEL, why | David 1970, *Appl Microbiol* 20:810; Luria & Delbrück 1943, *Genetics* 28:491; oracle: LD mean = expectation, variance ÷ mean ≈ 6000 |
| The mutant selection window lies between the MIC and the MPC; doses there enrich mutants | intro, L1, why, law | Drlica & Zhao 2007, *Clin Infect Dis* 44:681; oracle PD checks |
| Net growth as a function of concentration | why.maths | Regoes et al. 2004, *Antimicrob Agents Chemother* 48:3670 |
| Streptomycin alone failed within months | L1 MODEL | Crofton & Mitchison 1948, *BMJ* 2:1009 |
| Best course length debated | L1 MODEL | Llewelyn et al. 2017, *BMJ* 358:j3418 |
| Drugs mostly select rather than create; sub-inhibitory doses raise mutation and gene transfer | why.real, TAKE ("mostly") | Cirz et al. 2005, *PLoS Biol* 3:e176; Beaber et al. 2004, *Nature* 427:72; sweep G1 #47 |
| Adherence and PK variability matter | L2 MODEL | Srivastava, Pasipanodya & Gumbo 2011, *J Infect Dis* 204:1951 |
| Combination therapy standard after the streptomycin–PAS trial; double resistance ≈ product of rates | L3 MODEL, oracle B | MRC 1950, *BMJ* 2:1073; oracle: f_AB ÷ f_A·f_B = 0.72 |
| One plasmid can carry several resistance genes | L3 MODEL | general (multi-resistance plasmids; no number claimed) |
| Whether to hit hard is contested; aggressive treatment releases resistant cells; containment may delay failure | L4 MODEL (contested: true), levelTake, why | Read, Day & Huijben 2011, *PNAS* 108 S2:10871; Hansen, Woods & Read 2017, *PLoS Biol* 15:e2001110; Day & Read 2016, *PLoS Comput Biol* 12:e1004689 |
| Containment helps only when the illness line sits near capacity (in this model) | L4 MODEL | Hansen et al. 2017 discuss the threshold; oracle L4 lines |
| A plasmid persists only if transfer outpaces its cost plus loss | L5 MODEL, why.maths | Stewart & Levin 1977, *Genetics* 87:209; oracle: costly 0.50 → 0.29 in 5 days, compensated 0.50 → 0.48 |
| KPC plasmids spread between Enterobacterales and patients | L5 MODEL, why | Munoz-Price et al. 2013, *Lancet Infect Dis* 13:785 |
| Genomes trace hospital outbreaks | L5 MODEL | Snitkin et al. 2012, *Sci Transl Med* 4:148ra116 |
| Baseline hand-hygiene compliance about 40–50% | L5 MODEL (tagged realistic) | Pittet et al. 2000, *Lancet* 356:1307 (48% at baseline) |
| Costs of resistance are often compensated | L6 MODEL, why | Andersson & Hughes 2010, *Nat Rev Microbiol* 8:260; Bouma & Lenski 1988, *Nature* 335:351; Dahlberg & Chao 2003, *Genetics* 165:1641 |
| Resistance persisted after prescribing fell | L6 MODEL | Enne et al. 2001, *Lancet* 357:1325; Sundqvist et al. 2010, *J Antimicrob Chemother* 65:350 |

Tagged ×N on screen and in the cards: mutation rate (10⁻⁷, real ≈ 3 × 10⁻⁸ for isoniazid; chip "mutation ×3" under the gauge), drug half-life (8 h, real 2–4 h), immune clearance (designed switch; real TB is contained, not cleared), plasmid transfer (chip "transfer ×N"), compensation speed (chip "compensation ×N"). Everything else is tagged designed.

Agency and wording: the drug "selects", plasmids "move", populations of bacteria change; no individual "evolves", "chooses" or "needs". "Fevers need the drug" is about patients. No patient is shown dying (D5 decision 17): patients "move to intensive care" as pictograms.

## Deviations from the spec, and why

| D1 / D5 said | Built | Why |
|---|---|---|
| L2 "Two drugs, a forgetful patient" | Split: L2 missed doses, L3 a second drug (6 levels) | D5 §3.4: one new variable per level; the pair teaches better in sequence (one drug fails over a weekend, two hold) |
| 15% missed doses, scattered | Weekends at home (fixed, visible days) | Scattered misses made the level luck; fixed gaps can be planned for, and the MODEL card says real misses are scattered |
| "Tap a bed or hold for a high dose" with a staff meter in L1–L4 | Dose points (cumulative exposure) per patient in L1–L4; staff time only on the ward | "Clear dose decisions" (designer): one visible budget per patient; staff time matters where several patients compete |
| Immune clearance "saturates above 10⁵" | A switch: 99% a day under 10⁵, none above | One line players can read; "untreated loads under 10⁵ clear within 5 days" holds exactly (oracle C) |
| L4 bay tools include screening swabs | No swabs; plasmid shares are visible on each bed | Phone dock limit (4 buttons) and clarity; swabbing is the obvious next tool (noted for a later round) |
| Boss: 90 compressed days played | Days 1–30 pre-run from the seed (colleagues treat every fever); you play days 30–90 | The inversion happens at the restriction; 30 days of watching would be dead time. The autumn is on the chart and its cost trace is visible |
| Boss: "resistance barely falls" | It halves over 60 days, far less than the costly ghost (→ under 2%) | A call must move at least two bands to count (lessons §0.4); a literal "barely" would reward "no change" |
| Ward fevers caused by a carrier fail | In the boss autumn colleagues use a reserve drug for KPC fevers | Otherwise intensive-care turnover flushed the plasmid during the autumn and the restriction had nothing to act on |
| Contested ideas get no star (D5) | L4's stars reward each bed's outcome *in this model*, worded so, with a Contested pill | D1 asks for "scored on showing when each wins"; no star rewards believing a side |
| ≤ 90 KB raw per unit (lessons §4) | 115 KB raw, 35 KB gzip | A large unit (6 levels, two worlds, a ward simulation); flagged for the coordinator |

## Engine requests (nothing was edited)

1. `End.show`: fill `{placeholders}` in `content.interesting[key]` from `o.vars` (the Interesting texts here carry no numbers; numbers went into the body instead).
2. A LiveGraph trace option for custom inks and labelled reference lines (this unit registers `cl_trace` meanwhile).
3. The Predict ghost stays active (and the phone strip open) when a sim closes its own ask; units must call `Predict.cancel(id)` and `Predict.fold()` themselves (done here). An engine-side hook would save every unit the same bug.
4. A tint for the chapter chrome (D6 decision 7 "each chapter tints it with its own accent colour"): no API yet; this unit draws its own ground.

## Tests (build `V2_ONLY='0*,zz_*,clinic.js' python3 build.py <scratch>/clinic.html`)

| Command | Result |
|---|---|
| `node --check v2/clinic.js` | clean |
| `node tests/lint_text.js BUILD clinic` | 0 errors, 0 warnings |
| `node tests/oracle.js BUILD clinic` | **154 passed, 0 failed** (5.6 s; `CL_FAST=1` 106 checks in 2.8 s) |
| `python3 tests/bots.py BUILD clinic --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,noChange` | PASS: no bot earns three stars in a level; best cells D or DP or T |
| same `--seeds 1-20 --untimed` | PASS |
| full build (every v2 file): lint, oracle, paths | clean; 154 passed; 28 ok |
| `GAME_HTML=BUILD python3 tests/monkey.py clinic 1,2,3 --vp 390x780,1280x720` | **6 of 6 runs reach the end card**, no errors, warnings or NaN |
| `GAME_HTML=BUILD python3 tests/clinic_paths.py` | **28 ok, 0 failed** (latency 20–40 ms act → juice) |
| `GAME_HTML=BUILD python3 tests/clinic_shots.py OUT --vp 390x780,1280x720 [--cvd]` | every level and phase, 0 page errors |

Oracle highlights: untreated ×7.99 a day (×8 less 0.02% crowding), resistant ×6.99; untreated loads of 99,999, 50,000 and 1,000 clear in 5, 5 and 4 days; every dose spends 1.333 days (32 h) in the window at peaks of 24, 48 and 64; LD mean 1,106 against an expectation of 1,114; double-mutant frequency 8.9 × 10⁻¹³ against the product 1.24 × 10⁻¹²; low doses lose to resistance on ≥ 95% of seeds while one spaced high dose a day cures every seed; weekends break the daily plan on ≥ 90%; both drugs cure with no double mutant on ≥ 95%, drug A alone loses; hitting bed 2 hard sends it to intensive care by day 4.5 at the latest, containment keeps it out until day 6.8 or later, no drug by day 2.1; a costly plasmid falls 0.50 → 0.29 in 5 days, a compensated one 0.50 → 0.48; hands at 40% carry orders of magnitude more plasmid between beds than at 90%; an isolated carrier seeds no one; the boss's cost after the autumn averages 0.32; restriction alone ends at least 0.15 above the costly ghost on every seed and the call counts on 16 of 16; determinism, replay from (seed, actions) and snapshot continuation on five levels; an expert earns every offered star on 11–12 of 12 seeds per level; "no change" never earns Predict; the practice call never scores; no bot's union across the unit reaches three stars; every What if? ends, scores nothing and says what happened.

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/clinic/final_shots/` (every level: start, intro, ask, moved, committed, day 2/5/9/40, card, why, at 390 × 780 and 1280 × 720) and `.../clinic/cvd/` (`?cvd=mono`, `?cvd=deut` for L1, L3, L5). Fixes found by looking: gauge labels clipped at the right edge (moved, shortened); "10⁸" shown for 10⁹ (a floating floor); the phone strip stayed open over the dish run (folds on commit now); the strip stayed open when the sim timed an ask out, hiding the pumps (Predict cancelled and folded); two-bed gauges collided (horizontal bars under each dish); HUD lines wrapped to three lines (all cut to two); droplet particles read as eggs (sparks); a hold on a bed was swallowed (isolation fires while pressed); resistant rods hard to tell in monochrome (a size larger with a dark core); the index patient was discharged on day 4 in some runs, emptying the bay (eight calm days); the debrief chart kept the wrong title; the engine's sound twins for "pour" and "scale" drew cream eggs and scales in the dish (this unit now twins those sounds with its own ripple and ring); the lab dish showed an immune line it does not have.

## Self-review (playtester and art director, adversarial scientist, D5 §3)

| Issue | Verdict | Action |
|---|---|---|
| Players may spend the L1 budget on four highs in the first day and lose | Real, and the lesson | The budget pill turns coral under 12; the card says how many points were used; one spare high (60 points) forgives one mistake |
| Waiting while the immune system finishes is dead time | Real | ×3 fast-forward once nothing is left to decide |
| The dish call's answer sat near the top of its axis (a "predict the maximum" bot won it) | Real | The dish runs two days, not three: the answer is near 10⁻¹·⁵, mid-axis |
| "Hit hard" would read as settled after L1 | Science | No line says it; L1's win is "in this model"; L4 shows the counter-case with a Contested pill; why.real names Read et al. |
| Containment winning only near capacity could mislead | Science | Disclosed in L4's simplification and in the oracle |
| A plasmid model with p only hides gut ecology | Science | Disclosed ("Each bed is one number"); "cannot" lists gut ecology and other species |
| Compensation at 5% of the gap a day is far too fast | Science | Tagged ×N on screen and in the card |
| Boss restriction "barely" vs halving | Wording | Texts now say "fell far less than a costly plasmid would"; the final body is chosen from the run (control vs restriction alone) |
| D5 §3 item 2 (no card before the first action) | Overridden by D6 decision 8 | The description card, then the ghost drag on the strip |
| D5 §3 item 11 axe-core | Not available offline | As Batch 1 |
| D5 §3 item 14 (students) | Replaced by D6 decision 4 | Playtest script below |

D5 §3 lines 1–13: role environment; tap/hold with juice in 20–40 ms; no control sets a heritable trait (1). Description card then a ghost drag; first action cannot fail (2). A Predict per level on the strip, scored against the expectation, band after the commit (3). Six levels, one variable each; bots pass (4). Boss inverts (5). Live graph realised solid, expectation dashed after the commit (6). Fx tiers, sound twinned with visuals, Calm path (7). Lint clean (8). MODEL per level with ×N, Contested pill, refs; oracle (9). Projector, seed link, `resultBits` (30-bit map in the code), three prompts, CSV via Events, `teacherStep` (10). Keys L H A B N R I →, tap alternatives (dock High dose, Isolate), untimed, live region, data twin, CVD lint and screenshots (11). TAKE, MODEL, RECALL, BRIDGE written, TRANSFER deleted (12). Monkey 6/6 (13).

## Instructor note (one page)

**What students do.** They are the doctor. In TB they dose a patient live and watch the drug fall through the mutant selection window on a bedside monitor; then they handle missed doses, a second drug, and a patient who arrived already resistant. On a ward of *Klebsiella pneumoniae* they treat fevers while a resistance plasmid moves between bacteria and between beds, and in the boss they restrict the drug and discover that a compensated plasmid does not simply vanish.

**Ideas, in order.** (1) Drugs select resistance that already exists; low doses in the window enrich it. (2) Every gap lets the drug fade through the window. (3) Combinations: double resistance is about as rare as the product of the two rates. (4) Contested: when resistance is already there, hitting hard can release it. (5) Plasmids: transfer against cost plus loss (Stewart–Levin); the drug selects, hands spread. (6) Compensation: resistance can outlast the drug.

**Misconception to target.** "My body became resistant." The patient is not resistant; their bacteria are. The ward levels make this visible (the plasmid moves between patients on hands).

**Discussion prompts.** (1) Why did low doses select resistant cells faster than no drug at all? (2) When might hitting hard backfire? Use bed 2. (3) "My body became resistant": what is actually resistant, and which model simplification hides that most?

**Model critique.** The immune system here clears an infection under 10⁵ cells; in TB it contains rather than clears, and treatment lasts months. The ward collapses each patient's gut to one number. Compensation is far faster than in nature. All are tagged on screen.

**Teacher tools.** `?teacher=1` (step one day at a time), a seed link for a shared ward, result codes on assignment links, CSV of events.

## Playtest script (designer and colleagues; D6 decision 4)

1. Open The Clinic from the notebook. Read the description card (does it say what you are, the idea and the controls?). Press Play.
2. L1: drag the diamond on the dish chart, lock in. Watch the magenta cells take over the dish. Treat the patient: try a few low doses first, then high doses spaced a day apart. Note whether the window on the monitor and the rim made the choice obvious.
3. L2: plan for the weekend (shaded on the monitor). Did the gap feel fair?
4. L3: use the A and B pumps, then the dish for both. Did the both-drug call surprise you?
5. L4: hit bed 1 hard; for bed 2 try both strategies (Replay level). Did the contested framing come across?
6. L5: treat fevers, rub hands, isolate the carriers. Did you see the plasmid move on the nurse's hands?
7. Boss: make the restriction call before you act, then try to beat the "restriction alone" line.
8. Feedback form: enjoyment 1–5; the most and least clear moment; anything that felt like a worksheet; any science that looked wrong; time spent per level.

## Simplification (D6 decision 9), 23 October 2026

I played all six levels at 390 × 780 first (screenshots in the session scratchpad: `s3/simp_clinic_scribe/before/clinic/`, then `after/clinic/` and `after/clinic_desk/`). The night ward, the glowing eyepiece, the cyan drug tide, the bedside monitor with its hatched window and the ward map all stayed. What made the chapter heavy: a log-axis prediction on every level (six asks, starting with a lab-dish call before the player had done anything), a two-bed contested level with a practice ask, and a 90-day boss with twelve beds, a pre-run autumn, restriction, compensation, isolation by a hidden hold and a staff-time budget. The one verb is now **dose**: tap or hold the dish, tap a pump, tap a fever.

### What was removed or merged, and why

| Removed or changed | Where | Why |
|---|---|---|
| The lab-dish opening and its "resistant share after two days" ask | L1 | A prediction on a log axis before the first action; the aha (low doses let the magenta cells take over) is visible in play. L1 now opens straight on the patient. The key number is shown after the first dose: "Window = MIC to MPC (1× to 16×): only resistant cells grow there." |
| The Monday ask ("resistant cells after the weekend?") | L2 | Shown instead: "A fading dose spends ln 16 ÷ ln 8 = 32 h in the window." The weekend shading and the "at home" banner stay. |
| **Kept: the both-drugs call** | L3 | **The chapter's one prediction**: "About {a} cells resist A and {b} resist B. Drag: how many resist both?" The aha is that the answer is about 0.001, not hundreds, which is why combinations work. The ghost starts on the single-drug count, the call needs a move, and it is scored against the Luria–Delbrück expectation (±1 decade). After the first dose the HUD gives the key number from the player's own counts: "Both ≈ a × b ÷ 10⁹ cells ≈ 0.001: almost surely none." |
| Level "Already there" (two beds, contested hit-hard vs contain, practice ask) | — | A second idea with a second bed, a second budget and an ICU line; and a contested topic carrying a star. Its point survives in Why? (Read, Day and Huijben 2011). Its MODEL card, the high-level strain (tb3), the two-bed layout and the swap lever were removed. |
| Level "The long winter" (boss: 12 beds, 90 days, restriction, compensated cost, reserve drug, pre-run autumn, two ghost projections) | — | Too many moving parts for one idea. Compensation survives as a line in the bay's MODEL card ("Costs are often compensated, so resistance can outlast the drug"; Andersson and Hughes 2010) and in Why?. |
| The index-bed ask ("plasmid share in five days with no more drug") | The bay | Shown instead, once a treated bed's drug has worn off: "No drug: cost 0.45 + loss 0.02 beats transfer 0.3, so carriers fall." (Stewart and Levin's condition, with the card's numbers.) |
| Isolation (hold a bed), staff time (6 a day, pips) | The bay | A hidden hold gesture and a side panel. The bay now has two controls, both on screen: tap a fever (or Treat fever) and tap the hand rub. A whisper names what a dose does in the gut the first time: "The drug selects carriers in this gut." |

The levels are now **L1 The course, L2 Weekends at home, L3 Two drugs, L4 The bay** (`CL_LV`, 1235 → about 1000 lines). The intro card's "How to play" reads "Tap the dish for a low dose; hold it for a high one. Push the infection under the immune line; later, tap fevers and the hand rub." The bay's KPC fevers (chance = the bed's plasmid share at onset) do not respond to the carbapenem, so spreading the plasmid now shows up as untreatable fevers and moves to intensive care; with no reserve drug in the model, this is the honest outcome.

### Stars, re-balanced

| Level | Discover | Predict | Transfer |
|---|---|---|---|
| L1 The course | clear within the 60-point budget | — (was the dish call) | — |
| L2 Weekends at home | — | — (was the Monday call) | **clear despite the weekends** (L1's lesson carried across the gaps) |
| L3 Two drugs | clear within the budget | **the one prediction**, inside ±1 decade of the expectation | — |
| L4 The bay | plasmid in five patients or fewer, three ICU moves at most | — | — |

Unit stars: Discover in two of L1, L3 and L4; Predict = L3; Transfer = L2. No level offers all three. Bay thresholds were set from the sim (80 seeds): treating each fever at once plus a morning hand-rub round earns Discover on 75%; treating without hand rubs on 10%; hand rubs without treatment on 2%. An expert who treats fevers immediately earns it on 11 of 12 oracle seeds.

### Science
No model equation changed; the bay simply has no compensation, isolation or reserve drug, and its MODEL card says so ("The plasmid's cost stays fixed"; "cannot: … compensation of the cost"). Removed with their levels: the contested containment claim (Read et al. 2011; Hansen et al. 2017 still cited in Why?), the boss's restriction projections, Sundqvist et al. 2010 and Snitkin et al. 2012 (no longer on screen). The HUD key numbers are checked in the oracle against the model (32 h window time, 1× to 16×, 0.45 + 0.02 vs 0.3, a × b ÷ 10⁹ within the call's band of the expectation).

### Real biology (D6 decision 10)
Already met: real TB cells (rods) in the eyepiece, real patients in beds, Klebsiella with their plasmid rings in each bed's dish, a nurse's hands carrying them. The monitor and strip charts are read-outs beside them.

### Tests
- `tests/oracle_clinic.js` rewritten for four levels: PK/PD, Luria–Delbrück and product rule unchanged; L1–L3 lessons; Stewart–Levin, gut selection and hands; new: the bay's lesson (treating without hand rubs spreads the plasmid to more patients; untreated fevers fill the ICU), the HUD key numbers, one prediction in the chapter (L3 only), a call more than a decade off never earns Predict, the no-rub What if? text matches its run. **119 passed, 0 failed.**
- `tests/clinic_paths.py`: L1 opens with no interlude; the L3 call by a real drag and Enter; the bay's fever tap and hand rub; a two-button dock. **28 ok.** `tests/clinic_shots.py` shoots four levels.
- Lint 0/0; `dup_globals` ok; bot sweep seeds 1–40 PASS (best cells D, T, DP for random's lucky calls, D); monkey seeds 1–3 at 390 × 780 and 1280 × 720 reach the end card.

### Playtest script (replaces the one above)
1. Read the card; press Play. L1: dose the patient; does the window line after your first dose explain why low doses failed?
2. L2: plan for the shaded weekends. Did the 32 h line help?
3. L3: make the both-drugs call before treating. Were you surprised by 0.001?
4. L4: treat fevers and keep hands clean. Did you see a treated bed's carriers rise, then fall once the drug wore off?
