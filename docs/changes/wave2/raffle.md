# Wave 2: The Raffle (`raffle`)

*Unit builder, 21 October 2026. Spec: D1 §3.5 and D5 §4 item 9, as overridden by D6 (including the 21 October addendum: own world, own palette, `content.intro`). File: `games/endless-forms/source/v2/raffle.js` (`CH_RAFFLE_V2`, replaces the legacy chapter through `V2.push`; `?v1=1` keeps `ch3.js`/`ch9.js`). Tests: `tests/oracle_raffle.js`, `tests/raffle_paths.py`, `tests/raffle_shots.py`. Nothing else was edited. Not committed.*

## What I built

**World (D6 addendum 7).** A sunny cow pasture: a distant Friesian, hedge, daisies, a crusted cowpat, carnival bunting. You are a male yellow dung fly (*Scathophaga stercoraria*, `Rig 'dungfly'`); females arrive on the pat one at a time. Each female's sperm store is **the Drum**: a brass fairground raffle drum with chasing marquee bulbs and a crank, fed by a brass tube from the mating pair. Palette: meadow green, warm cowpat brown, brass gold, carnival red and cream. Chrome accent `#A8821F` (brass). Tickets carry identity by luminance and pattern, never hue alone: yours cream with red diagonal stripes and a gold halo; rivals solid umber or dotted sage. The blue and amber allele inks are not used (there is no genotype read-out in this unit).

**The verb (the designer loved it, so it stays tactile).** Hold anywhere to pour: one unit lands at once (a tap pours exactly the smallest ejaculate), then 14 units a second rattle up the tube and drop into the drum, mixed in at random; the brass supply gauge drains; letting go closes her drum after a 0.45 s grace (press again to keep pouring). Tap alternatives: the dock's **Pour** latches (tap to start, tap to stop), **Done** closes at once, ArrowUp adds one unit, Space is a true hold. On the dung pat the same hold is the mating time (10 minutes a second, tagged ×600 on screen). Then the drum spins, the bulbs chase, and each of her 20 eggs pulls a ticket on a thread and takes its father's pattern; yours fill the egg row from the first egg, rivals' from the last, and a dashed "expected" mark shows where the boundary should fall.

| L | Name | Adds (one variable) | Verb and scene | Prediction gesture (scored against) | Stars offered |
|---|---|---|---|---|---|
| 1 | The fair raffle | rival tickets already in her | Six females, supply 100; rivals 0–5 ejaculates of 20 units (female 4 always 5 rivals, female 5 or 6 three); no male after you | Before a draw: drag her eggs on the "Eggs won" chart (the expectation 20·s/(s + R) for what you poured; asked at the first mated female from female 4 on whose answer is neither near-certain nor "half") | D: within 1 egg of the Lagrange best; P |
| 2 | Who comes next? | the chance of a male after you | Eight females, three cards visible, the rest face down; each card shows rivals before and a pie for the chance (1 or 9 in 10) of a later male; a later male lands and adds 20 units, or looks and flies on | At the risky virgin, after your pour and before he comes or not: her average eggs, 20·[(1 − q) + q·s/(s + 20)] | D: ≥ 96% of the planner and the risky virgin got ≥ 3 units more than the safe one; P (counted only when "no male after her" would miss) |
| 3 | The loaded raffle | last-male sperm displacement | Each female arrives holding an earlier male's 40 tickets (4 out of reach). Hold to mate: your tickets enter, random tickets flush out of the gate (yours too, later); let go to guard and search (156 min, a stopwatch time-lapse). After three females, the afternoon: search 40 min | On the "Your share" chart (your own copulas as points, the search time to the left of zero): drag the best mating time (tangent point 41.4 min). The fitted curve and the tangent draw themselves after the call | P (±6 min); T: your last two afternoon matings average within ±6 min of 26.1 and at least 6 min shorter than your mornings |
| 4 | Her drum (boss) | her control of which tickets count | Five females; each keeps a share of every male's tickets in the drum and moves the rest to her pocket, which these eggs never draw from. Her card shows both shares; the pocket fills visibly as you pour | After the five: "She keeps half your tickets and all 30 of his: units to win half?" (60; the fair-raffle answer 30 misses) | D: ≥ 97% of the best plan given her cards (the fair-raffle rule wins 93%); T (±8) |

`content.boss.inverts`: "Until now more tickets meant more eggs. Here her storage sets which tickets count." Unit stars (`unitStars`, D1 G10): Discover in two of L1, L2, L4; Predict in two of L1–L3; Transfer in both L3 (the held gesture for a new profile) and L4 (the boss).

**Live graph (strip).** L1, L2: "Eggs won" per female (realised solid, expectation dashed after the level) and "Units poured" (yours solid, the best plan or the planner dashed only on the card). L3: "Your share" (`rf_gain`: your points; after the call the dashed fitted curve and the tangent; on the card both tangents) and "Eggs per female". L4: "Eggs won" and "Half her eggs" (axes until the call, then her curve and the 50% line). Two chart types are registered guarded in the unit file (`rf_rows`, `rf_gain`), each with a data twin.

**What if?** (Freezer vial at the level's start; the best plan with every card visible pours, ×3 draws): L1 *Males follow* (q = 0.5 everywhere) and *Triple rivals*; L2 *No later males*, *Males always follow*; L3 *Scarce females* (search 400 min → about 54 min) and *Quick search* (20 min → about 20 min); L4 *She keeps all*, *Very choosy*. Each card text takes the rerun's own numbers.

**Juice** (from `Sim.run` events only): press ring at the hatch, tickets up the tube and into the drum, `Snd2 'pour'` pitched by the supply left; the drum closes (ring, tock); spin, chasing bulbs and the crank during draws; each egg's ticket on a thread (`count`/`tick`), a spark on yours; "+n" pop and T2 per female; a T3 **Jackpot!** banner with red sparks when all 20 eggs are yours; the later male's flight; dust as tickets flush in L3; T3 banners for each level and the afternoon. Calm: no spin, no bob, steady bulbs; Fx handles the rest.

## Science claims, with references (for Coordinator A)

| Claim (where) | Source |
|---|---|
| Parker's work on yellow dung flies founded sperm competition; the last male fertilises about 80% of the eggs (why.real, L3 MODEL, curve fit) | Parker 1970 *Biol Rev* 45:525 (`parker1970`); Parker 1970 *J Insect Physiol* 16:1301 (`parker1970b`) |
| Raffle models of how a male shares a limited supply; share = s/(s + R); the best plan equalises marginal gain, s = √(R/λ) − R (L1, why.maths) | Parker 1990 *Proc R Soc B* 242:120 (`parker1990`); legacy `optimum()` (R7 A19 confirmed the numbers) |
| Males spend more as the risk of later rivals rises; well supported across species (L2) | Parker 1990; Parker, Ball, Stockley & Gage 1997 *Proc R Soc B* 264:1793 (`pbsg1997`); Kelly & Jennions 2011 *Biol Rev* 86:863 (`kj2011`) |
| Spending less when competition is very intense is predicted but weakly supported (L1 card, levelBody 0, why.real) | Kelly & Jennions 2011 (R7 C10's split of the claim) |
| Prudent males can leave females sperm-limited (L2 nature) | Wedell, Gage & Parker 2002 *TREE* 17:313 (`wgp2002`) |
| Copulations last about 36 min; the marginal-value prediction was about 41 min with about 156 min of search and guarding (L3) | Parker 1978 in Krebs & Davies, *Behavioural Ecology* 214–244 (`parker1978`); Parker & Stuart 1976 *Am Nat* 110:1055 (`ps1976`); Charnov 1976 *Theor Popul Biol* 9:129 (`charnov1976`) |
| Constant random displacement fits the dung fly P2 data (L3) | Parker & Simmons 1991 *Proc R Soc B* 246:107 (`psim1991`) |
| Later work asked how much displacement females control (L3) | Simmons, Parker & Stockley 1999 *Am Nat* 153:302 (`sps1999`) |
| Female yellow dung flies influence sperm storage and use (L4) | Ward 1993 *Behav Ecol Sociobiol* 32:313 (`ward1993`); Ward 2000 *Evolution* 54:1680 (`ward2000`); Hellriegel & Ward 1998 *J Theor Biol* 190:179 (`hw1998`); Hellriegel & Bernasconi 2000 *Anim Behav* 59:311 (`hb2000`) |
| Female feral fowl eject the sperm of subdominant males (L4 nature) | Pizzari & Birkhead 2000 *Nature* 405:787 (`pb2000`) |
| How common cryptic female choice is remains debated (L4, Contested pill) | Birkhead 1998 *Evolution* 52:1212 (`birkhead1998`); Eberhard 1996 *Female Control* (`eberhard1996`) |
| Drosophila males that meet rivals mate longer (why.real) | Bretman, Fricke & Chapman 2009 *Proc R Soc B* 276:1705 |

Model numbers checked in the oracle: share(36 min) = 0.800; eggs per minute peak at 41.4 min (T = 156.5) and 26.1 min (T = 40); d(share)/dt = k(a − share) (random displacement, yours flushed too); the L1 plan 1, 30.5, 29.8, 11.4, 1, 26.3 → 68.8 eggs, even split 90%. **Designed and tagged:** 20 eggs per female, 20-unit ejaculates, supply 100, risk 1 or 9 in 10, three visible cards, afternoon search 40 min, one earlier sperm in nine out of reach (the asymptote a = 0.893 of the two-number fit), her shares (5–100%), ×600 time. **Simplifications stated on cards:** a fair raffle; rivals fixed (one male's best plan, not an ESS); no sperm limitation; risk known exactly; in dung flies female control works through her several sperm stores, not a pocket. L4's MODEL card carries the Contested pill: the stars test the model's arithmetic (rivals count as z·R ÷ y), not the contested claim that such control is common.

## Deviations from the spec, and why

1. **L4 is dung flies, not feral fowl** (D6 addendum 7: one world per chapter; the coordinator's brief). Cryptic female choice is documented in *Scathophaga* (Ward); the fowl result stays in "In nature".
2. **L4 shows her shares on her card.** With hidden shares the information-limited best play could fall below an even split on some orders (an expert who probed scored 0.90–0.99 of the omniscient plan; even split 0.93 fixed), so no Discover threshold separated understanding from luck. Visible shares make the benchmark what you could see; the pocket still fills as you pour.
3. **L1's call is not at female 4.** With the best plan, five rivals' drum gives 2 of 20 eggs, so "zero" nearly always passed (the alwaysB bot earned Predict on every seed). The call comes at the first mated female from female 4 on whose answer is neither near-certain (outside 3–17 eggs) nor within 2 of "half"; female 5 or 6 always holds three rivals so one is due.
4. **L2's virgin numbers.** At the multiplier where a 20-rival, half-risk female gets 15 units, the planner gives a 9-in-10 virgin 14.9 units and a 1-in-10 virgin 1 (D1 quoted about 22 and 1 for its own parameters). The ordering is what the star reads.
5. **L3's afternoon.** D1's L3 has no Transfer; the held gesture for a new profile (D1 Stars: Transfer "plus an allocation gesture… for a new female profile") is the busy afternoon (search 40 min). L3 offers P + T, never D.
6. **The invasion view after L2 is dropped.** A fair invasion of "your rule" needs rivals' ejaculates to follow the population's rule (an ESS model); with fixed rivals it would mislead. Noted for a later unit.
7. **The legacy seminal-fluid level (ch9.js) is not rebuilt** (D1: it leaves for D3's Skaters).
8. **What if? reruns from the level's start with the best plan pouring**, rather than thawing mid-level: allocation across a season has no natural mid-point.

## Engine requests (nothing was edited)

- `End.show`'s Interesting result takes a key only; the unit fills `content.interesting.now` with `Txt.f` before the card (a `{vars}` option on `End.show` would be cleaner).
- A bars-with-expectation chart type (`rf_rows`) and a gain-curve-with-tangent type (`rf_gain`) are registered locally; Forager's tangent could share `rf_gain` if it moved to `01_widgets.js`.
- `Pal.place` has no pasture; `meadow` is used.

## Tests (scratch build `V2_ONLY='0*,zz_*,raffle.js'`; also the full build with every v2 file)

- `node --check v2/raffle.js`: clean. `node tests/lint_text.js <build> raffle`: 0 errors, 0 warnings (single-unit and full build).
- `node tests/oracle.js <build> raffle`: **60 passed, 0 failed** (about 27 s; `RF_FAST=1` about 8 s). Covers D5's two acceptance lines (greedy within 1% of Lagrange on four queues; the L2 planner within 97.8% of omniscient on 200 queues and spending exactly the supply), the maths above, unbiased egg draws (−0.02 eggs per female over 800 runs), later-male frequencies (88.8%, 9.0%), determinism and snapshot replay on every level, the expert earning every offered star on 20 of 20 seeds per level and all three unit stars, no bot union reaching three, fixed strategies never earning Discover, every Interesting text matching its run, What if? numbers, result bits.
- `node tests/bots.js <build> raffle --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,even,noChange,expert`: PASS; best masks: alwaysA, alwaysB, threshold none; random P or T occasionally; greedy (the fair-raffle rule) D+P in L1 only; even (perfect calls) P/T only; noChange D in L1 only; expert D+P, D+P, P+T, D+T.
- `GAME_HTML=<build> python3 tests/monkey.py raffle 1,2,3 --vp 390x780,1280x720` (and 1024x768 on the full build): every run reaches the end card, no errors, NaN or stuck states; 7–23 intro reopenings and What if? runs survived.
- `tests/raffle_paths.py`: 27 ok (tap = one unit, hold pours more, grace resumes, dock latch, ArrowUp, Space hold, Enter, latency 40 ms, needMove, What if? text, dung-pat hold = minutes, untimed logged and slower with asks that wait a minute, Calm stops the spin, deep link, teacher mode, `?v1=1` legacy, 4 v2 levels).
- Frame time (Chromium, 4× CPU throttle, DPR 2, 390 × 780): draw median 3.2 ms, p95 6.8 ms with 160 tickets; L4 with a full pocket 2.2 / 5.9 ms. The background is one cached `Layer`, tickets are three baked sprites.
- Size: 98 KB raw, 30.9 KB gzip (lessons §4 aims for ≈ 90 KB raw / 30 KB gzip; the words are 14 KB).
- `python3 tests/golden.py check <full build>`: 37 ok, 0 failed, 11 skipped (the ids replaced by v2 units in that build, `raffle` among them).

## Screenshots

`scratchpad/raffle/shots/` (not in the repo): every level at 390 × 780 and 1280 × 720 (intro, start, hold, draw, later, search, afternoon, each ask before and after the drag, committed, level card), plus `?cvd=deut` (L1, L4) and `?cvd=mono` (L2). Fixes found by looking: the intro card was not armed when clicked (script); flies too small and hidden by the tube (S 0.5 → 0.74 Rd, tube from the male); tickets too small for the drum (0.12 → 0.14 Rd) and a warm inner shadow so the glass reads as a drum; the drum counts collided with the pocket (moved to a scoreboard at the top of the drum); counts showed "0 / 0" in the afternoon banner; the guarding male sat off-screen (now above her); the later male's fly-by crossed the drum (now inspects the eggs and leaves); the y-axis numbers hid under the first bar (left padding); the boss chart's axis stopped at 120 while the ask ran to 150; the Interesting text printed "{m}"; the afternoon banner was too brief; the pocket's tickets were too small to read.

## Self-review (playtester and art director, adversarial biologist, D5 §3)

| Issue | Verdict | Action |
|---|---|---|
| A fixed "pour the minimum, call zero" strategy earned L1 Predict | Right | Call moved to a non-trivial female; near-certain and "half" answers never count |
| A fixed 30-minute mating earned the L3 Transfer | Right | Transfer also needs the afternoon to be ≥ 6 min shorter than your mornings |
| The boss Transfer's answer (60) was the axis midpoint (0–120) | Right | Axis 0–150 |
| Hidden female shares made Discover luck-driven | Right | Shares on her card (deviation 2) |
| "She decides" and "decided" give a fly agency (D0 §3) | Right | "Her storage sets which tickets count" throughout |
| "One ticket wins a virgin's eggs" hides sperm limitation | Partly | The L1 card says "no sperm limitation" in its cannot-show line |
| The raffle is one male's best reply, not Parker's ESS | Right | Said on the L1 card |
| "Crowded afternoon" contradicts a male-biased pat | Right | "Females arrive fast" |
| Contested pill on a starred level | Explained | The stars test the model's arithmetic; the pill marks the claim about nature |
| D5 §3 1–13 | Pass | 1 latency 40 ms, `role: 'animal'`, no heritable-trait dial; 2 D6 card, firstWords 17 words, ghost `pour`, a tap cannot fail; 3 one ask per level, scored against the expectation, needMove, start off the answer; 4 four levels, one variable each, bots pass; 5 boss inverts; 6 LiveGraph specs, solid/dashed/diamond, reveal after the call; 7 T1–T3, `Snd2` twins, Calm; 8 lint clean; 9 MODEL cards, ×600 chip, "≈ fitted curve", Contested pill, refs; 10 prompts, result bits, CSV via Events, this note; 11 keys, tap alternatives, untimed, data twins, CVD shots (axe-core unavailable offline); 12 TAKE, MODEL, RECALL, BRIDGE rewritten, TRANSFER deleted, legacy ch9 wrap untouched; 13 monkey above |

## Instructor note (one page)

**What it teaches.** Sperm competition as a raffle (Parker): with a fixed supply, a male's share of a female's eggs is his tickets ÷ all tickets, so returns diminish in crowded drums and a virgin with no later rival is worth one ticket. Then three corrections, one per level: the *risk* of a later male makes virgins worth sperm (Parker's risk models); yellow dung flies are a *loaded* raffle, where the last male's sperm displace earlier sperm and mating time becomes a marginal-value problem; and the drum may be *hers* (cryptic female choice).

**Twenty minutes in class.** Play L1 together on the projector (`?unit=raffle&level=0&seed=1`, add `&teacher=1`). Ask the class to call female 4's eggs before the draw, then compare their allocation bars with the best plan on the card. Run What if? *Males follow* to see virgins get sperm. Students play L2–L4 alone (about 8 minutes).

**Discussion prompts** (rising): (1) Why might a virgin get more sperm than a mated female, and when should she get less? (2) In dung flies, who controls paternity: the last male, the female, or both? (3) This model makes every rival equal and every risk known. Which missing piece would most change the best plan?

**Misconceptions to watch.** "More sperm always wins" (L1's crowded drum, L4's pocket). "Males choose" (the language here is of rules and allocation; real males respond to cues). "Dung flies are a fair raffle" (L3 says not). "Female control is proven common" (contested; L4's pill).

**Assignment link.** `?unit=raffle&level=N&seed=S` gives a result code (mask, expected eggs ×4, the call, the best plan ×4).

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open the Raffle from the Notebook; read the card (under 30 s?). Play L1 without help. *Did the hold feel like pouring? Did the first draw make "tickets ÷ tickets" obvious?*
2. In L1, pour a lot into the five-rival female once. *Did the egg row and the dashed "expected" mark show diminishing returns?*
3. L2: watch the face-down cards. *Did the 9-in-10 virgin feel worth sperm before the card said so?* Try What if? *No later males*.
4. L3: vary your first three matings on purpose; call the best time. *Did the tangent drawing itself land as an aha? Did the afternoon change what you did?*
5. L4: *Did the pocket filling make "her storage decides" clear? Is the card's two-bar legend readable on a phone?*
6. Rate fun 1–5; note any moment of waiting with nothing to do; note any word that sounded like a fly choosing.
