# Wave 2: Alarm Call (`alarm`)

*Unit builder, 21 October 2026. Spec: D1 §3.6, D5 §4 item 10, D6 (with the 21 Oct addendum: own world, intro card). File `games/endless-forms/source/v2/alarm.js` (`CH_ALARM_V2`); tests `tests/oracle_alarm.js`, `tests/alarm_paths.py`, `tests/alarm_shots.py`. The legacy chapter (`CH_ALARM`, ch5/ch7) still plays under `?v1=1`. Nothing else was edited. Not committed.*

## What I built

**World (D6 decision 7).** A high Sierra meadow at Tioga Pass (Sherman's site): alpine-blue sky, granite peaks with snow, lodgepole pines, a green meadow with lupins and white flowers, granite boulders and burrow mouths, baked once per size into a `Layer`. Belding's ground squirrels (`Rig 'squirrel'`, hero and actor size) stand sentinel on the rocks; a coyote slinks through the grass from the side; a red-tail's big shadow sweeps across the meadow while the hawk circles above. Peace time shows the family as a **burrow map**: a soil cross-section with tunnels running along the pedigree's own lines, the chambers being `PedigreeView` nodes. The colony map is a top-down meadow with six granite-ringed burrow clusters. The boss moves to **Cousin Island** (warm sky, turquoise sea, pink-grey Seychelles granite, scrub trees, `Rig 'warbler'`). Accent `#6E5AA8` (lupin purple) tints the intro card and chrome through `ch.accent`. The blue and amber allele inks appear only in the L4 genotype discs and its allele-frequency charts.

**Intro card (D6 decision 8).** `content.intro = {game, biology, how}`, 25–30 words each, two sentences each; drawn by `00_entry.js`'s `Intro`.

| L | Name | Adds (one variable) | Per-second verb | Prediction gesture | Stars it can give |
|---|---|---|---|---|---|
| 1 | Coyote at dusk | the cost of a call (trill C = 0.22, B = 0.4; tags are the truth) | 8 attacks: tap yourself to trill, your burrow to stay silent (or C/S, or the dock); 3.0 s clock, the first attack waits | after attack 3: drag the break-even Σr on the "Kin nearby" chart (start at 2, tol 0.1; expectation 0.55) | Discover (7 of 8 calls by Hamilton's rule, at least one good call and one good silence), Predict |
| 2 | Who's my sister? | fathers you cannot see (multiple paternity) | first the ask, then untimed tagging on the burrow map (tap a chamber, tap ½ ¼ ⅛ 0), Done; 8 attacks read **your** tags; the debrief rings each wrong tag in selection ink with "≠" and the true r | before tagging: drag your mean relatedness to your littermates (tol 0.05; expectation 0.375–0.44; "one father" ½ always misses) | Discover (≥ 80% of tags right and ≥ 6 good calls), Predict |
| 3 | The hawk | a second predator (whistle) | attack 1 coyote, attack 2 hawk; then two asks; then 8 attacks; the notebook (callers and silent squirrels caught, by predator) fills between attacks | drag the trill's cost (tol 0.08) and the whistle's cost (tol 0.2, so the sign decides) on two charts; the notebook's estimates appear after the commit | Discover (7 of the last 8 calls good, and one whistle with Σr·B ≤ 0.22), Predict |
| 4 | The colony map | sex-biased dispersal | 8 seasons each open with a vignette attack (odd: you are a daughter among kin; even: a son among strangers); winters animate sons leaving; 7 seasons fast; then the swapped meadow runs | at season 0: female and male calling shares at season 15 (two charts, starts at 0 and 1); after season 15: male calling in a meadow where daughters leave (start 0) | Predict (both shares, each a real change ≥ 0.15), Transfer (swapped meadow) |
| 5 | Help or breed (boss) | helpers that lay eggs (co-breeding) | 8 springs: tap home (help) or the far tree (breed), or H/B, or the dock; tokens fly into the gene jar (own young solid, kin raised hatched); the debrief shows both choices' gene copies | practice: your r to mum and dad's chick with 40% extra-group young (0.4), revealed at once with "off by" | Discover (≥ best − 0.07 gene copies), Transfer (help in ≥ 3 of the 4 springs where only co-breeding makes helping pay, and leave for every rich vacancy) |

`boss.inverts`: "Helpers here lay eggs too, so helping pays even for unrelated nestlings." `unitStars`: Discover and Predict each need two levels; Transfer one.

**Model.**
- *Attack:* you and 2–5 neighbours. Risk units: silent spotter 0.30, triller 0.52, whistler 0.04; warned neighbour 0.1, unwarned 0.5. One `R()` walks the cumulative catch chances k × risk (k = 0.3), so at most one squirrel is caught and each squirrel's marginal chance is exactly k × risk. The scored verdict is sign(Σr·0.4 − C) with true relatedness.
- *Your death:* you play on as a full sister, who has your relatedness to everyone else (checked by path counting), so tags stay valid. With no full sister left you are not caught (designed floor).
- *Plans:* L1 shuffles 4 call-worthy and 4 silence-worthy attacks, none within 0.02 of the boundary; L3 opens coyote then hawk, then 2+2 coyote and 2 low-kin + 2 any hawks.
- *L4:* two loci, each expressed in one sex, 400 copies each. A copy's fitness gain is σ(Σr·0.4 − 0.22)/4 (additive half, one sex half), σ = 2.6 (×N). Σr is set by dispersal: daughters 0.9, sons 0.05; swapped in the Transfer meadow. Then a binomial draw (`WF.binom` on `R()` live). The expectation is the mean of 200 replays on a private `rng(seed)`, so `R()` and the run are untouched. Starts are jittered (0.35–0.65) so no fixed answer passes.
- *L5:* gene copies help = q(0.6·r + 0.44 × 0.5), breed = 0.6·q_vacancy. r is 0.4 for mum × dad (EGP 40%), ¼ for mum × new male, 0.15 for new female × dad, 0 for a new pair. Eight fixed springs in a shuffled order: four where only co-breeding tips helping, one kin-only help, three breed.

## Science claims, with references (for Coordinator A)

| Claim on screen | Source | Status |
|---|---|---|
| Hamilton's rule rB > C | Hamilton 1964, *J Theor Biol* 7:1 (`ham1964`) | standard |
| Females with kin nearby trilled more; males (which disperse) rarely called; trillers were stalked and chased more than silent squirrels | Sherman 1977, *Science* 197:1246 (`sh1977`) | checked (abstract via secondary sources) |
| Fewer whistlers than silent squirrels were killed; 664 hawk encounters at Tioga Pass, most staged with trained raptors | Sherman 1985, *Behav Ecol Sociobiol* 17:313 (`sh1985`) | abstract confirmed by search; **the exact percentages (D1's "about 2% against 28%") are not on screen**, because I could not reach Table 1. The model's whistle cost (−0.26) is tagged *designed*, sign from Sherman. **Needs sign-off.** |
| 78% of 27 litters had two or more fathers | Hanken & Sherman 1981, *Science* 212:351 (`hs1981`) | number via a secondary citation (*Can Field-Nat*); needs sign-off |
| Full sisters fought less than half-sisters | Holmes & Sherman 1982, *Am Zool* 22:491 (`hol1982`) | standard citation |
| Males leave home before breeding; females settle near mothers | Holekamp 1984, *Behav Ecol Sociobiol* 16:21 (`hol1984`) | standard |
| When territories were freed, helpers left to breed | Komdeur 1992, *Nature* 358:493 (`kom1992`) | standard |
| 44% of female helpers bred, making 15% of young; 40% of young extra-group | Richardson, Jury, Blaakmeer, Komdeur & Burke 2001, *Mol Ecol* 10:2263 (`ric2001`) | abstract confirmed: "44% of helpers", "15% of all offspring", "40% extra-group paternity" |
| Direct benefits explain female-biased helping | Richardson, Burke & Komdeur 2002, *Evolution* 56:2313 (`ric2002`) | standard |
| Helpers fed more when the breeder was their mother | Richardson, Komdeur & Burke 2003, *Nature* 422:580 (`ric2003`) | standard |
| r: full sister ½, half-sister ¼, mother's full sister ¼, her daughter ⅛ | path counting; oracle checks `PedigreeView.r` on the true pedigree | exact |

Guard-rails kept:
- The Wave 1 G3 cost swap stands (trill costly, whistle cheap), now with the whistle's cost negative as D1 and the G3 review (R-3) asked.
- No "half your genes": relatedness is "by descent", and the teacher prompt asks the misconception as a question.
- No animal chooses, needs or wants; the face blaze is labelled "blaze: designed" on screen and on the MODEL card.
- ×N on L4's selection strength (on screen as "selection ×N").
- Every MODEL card says what is designed. L4's card says relatedness is set, not counted, and that real calling has no known single gene.

## Deviations from the spec, and why

1. **"If you die, you continue as your daughter" → "as a full sister".** A full sister keeps every relatedness the same, so the player's tags stay valid; a daughter would change them all. A designed floor applies when no full sister remains (MODEL card).
2. **L3's predict-then-test order.** The asks come after one coyote and one hawk, so the player has seen the whistler bolt (the hypothesis cue) but no data; the notebook (40 encounters an attack, `R()`) fills only after the commit and appears between attacks, when the sky is clear. The whistle's tolerance (±0.2) scores sign and rough size, as D1 asks.
3. **L4's relatedness is a parameter, not emergent.** An individual-based prototype (6–16 burrow clusters, survival lotteries, Mendelian litters) gave no reliable sex difference in 15 seasons against drift (SD 0.2). A two-locus model with Σr set by dispersal is honest about it and testable: the vignettes' neighbour tables average Σr 0.88 (daughter) and 0.04 (son), matching the model's 0.9 and 0.05.
4. **The player's L4 calls do not enter the gene model.** The vignettes keep the attack verb and let players see their own sex difference ("You, as daughter / as son" rows); saying so avoids a fake causal link.
5. **Predict on L2 and L5 (not in D1).** D5 §3 item 3 asks for a prediction on every level. L2's (mean r to littermates under multiple paternity) is the spec's own idea; L5's is a practice call (no star; a level cannot offer three).
6. **No What if?** D5 §3 does not require it, and every lever I tried duplicated a level or the Transfer. Freezer vials are therefore not written.
7. **Calls during the tell.** A call as the predator appears counts (the dock shows Call at once); otherwise a press 0.1 s early was silently lost.

## Engine requests (nothing was edited)

- The intro card's dock "?" sits beside my two choice buttons: three on a phone, within the budget.
- `PedigreeView`: an option to hide tag pills on untaggable nodes (founders, absent males, "you") and a larger blaze badge. Done locally: `untagged = false`, my own hatched "?" pills, a 9–10 px badge, and the tag menu drawn after them.
- `LiveGraph` trace with no x ticks: I pass `x.fmt: () => ''`.

## Tests (build `V2_ONLY='0*,zz_*,alarm.js'`, scratch `scratchpad/alarm/alarm.html`; also the full build with every v2 file)

- `node --check v2/alarm.js`: clean.
- `node tests/lint_text.js $OUT alarm`: **0 errors, 0 warnings** (scratch and full build).
- `node tests/oracle.js $OUT alarm`: **71 passed, 0 failed** (18 s; `AL_FAST=1` 8 s). It covers:
  - A: the boundary is exactly Σr = 0.55, and every recorded verdict equals sign(Σr·0.4 − 0.22) over 320 attacks.
  - B: the whistle bot calls at r = 0 (13 attacks), and every such call is good.
  - C: whistlers are caught 1.1% against 9.7% for silent squirrels; trillers 16.5% against 9.2%. The notebook recovers both costs within 0.05.
  - Catch chances are k × risk within 1.2 points, with one victim at most.
  - Path-counting r on the true pedigree with sires; the blaze rule.
  - L2: littermate r is 0.375–0.438, and "one father" never passes.
  - L4: 0.50 → 0.78 / 0.12 when daughters stay, and the reverse when swapped. The live end minus the expectation averages 0.006 and −0.001 over 80 seeds; every ask moves ≥ 0.15.
  - Boss: four co-breeding springs; kin-only play gains 2.50 of 2.93; always-help 1.97; no near ties.
  - Determinism, log replay and snapshot on all five levels.
  - Untimed decisions never time out; a timed one goes silent and is marked slow; the first attack waits.
  - An expert earns every offered star on 20/20 seeds per level.
  - No bot's unit union reaches three stars (best 1).
  - Interesting texts match the run.
- `node tests/bots.js $OUT alarm --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,whistler`: **PASS**. Best masks:

  | Level | alwaysA | alwaysB | random | greedy | threshold | whistler |
  |---|---|---|---|---|---|---|
  | 1 | — | — | P (0.1) | D | D (0.3) | D |
  | 2 | — | — | P (0.2) | D | — | — |
  | 3 | — | — | P (0.1) | — | D (0.3) | D |
  | 4 | — | — | PT (0.2) | — | — | — |
  | 5 | — | — | T (0.1) | — | — | — |

  The same table with `--untimed` (seeds 1–20) also passes. Always-help no longer earns the boss Transfer.
- `GAME_HTML=$OUT python3 tests/monkey.py alarm 1,2,3 --vp 390x780,1024x768,1280x720`: **9 of 9 reach the end card** (about 2,000 steps, 5 minutes virtual). With `--calm`, seeds 4 and 5 also reach it. On the full build, seed 1 at 390×780 and 1280×720 reaches it too. No errors, warnings or bad text.
- `GAME_HTML=$OUT python3 tests/alarm_paths.py`: **0 failed, 0 page errors**, at 390×780 and 1280×720. It covers:
  - real taps on yourself and on your burrow; the C and S keys; the dock buttons;
  - needMove (Lock in on an untouched ghost scores nothing), and P, arrows and Enter committing;
  - burrow-map taps (menu, tag, no self-tag), and Done;
  - boss H and dock Breed;
  - act-to-juice latency 20–40 ms;
  - `?untimed=1` waits 20 s; `?calm=1` and `?teacher=1` play; `?v1=1` registers the legacy chapter.
- `tests/golden.py check` (scratch build), and `--v1`: see the addendum at the end.

## Screenshots

`scratchpad/alarm/shots/`, `L<n>_<phase>_<w>x<h>.png` at 390×780 and 1280×720, plus `_mono`, `_deut` (L1, L4) and `_calm` (L1); 216 files. Fixes made from looking:

1. The squirrels were too small: hero is now 0.2u and actor 0.13u.
2. The coyote started off-screen and its label was clipped. It now enters on screen during the tell, and its label is clamped.
3. Burrow-map tunnels were curly spaghetti; they now follow the pedigree's orthogonal lines.
4. "?" pills appeared on the grandparents, the absent brother and you. Only taggable squirrels carry them now.
5. Blazes were too small to read. They now have 9–10 px badges, beside the chambers and on the surface pups.
6. My pills hid the tag menu, which is now drawn last.
7. The notebook sat over the hawk in the sky. It now shows between attacks, as "callers caught 4/15".
8. Colony discs overlapped. Daughters now sit on an inner ring and sons on an outer one.
9. In mono, caller and silent discs looked alike. Letters A/a are back, with an "A: calling copy / a: silent copy" key.
10. The island trees were tiny on desktop and the HUD wrapped to three lines on a phone. Both are scaled or shortened now, and quality reads "rich / fair / poor".
11. The L4 "model" ghost was a straight line. It is now the mean replay trajectory.
12. After a whistle, neighbours took 0.9 s to reappear, hiding the true-r reveal. They now return within 0.4 s.

## Instructor note (one page)

**What students do.** They are a ground squirrel deciding, in about 2.5 s, whether to warn neighbours of a predator. In L1 each neighbour's ear flag gives its relatedness. In L2 students infer relatedness themselves from a pedigree in which litters have several fathers (a designed face blaze marks each father). In L3 they test whether the hawk whistle is altruistic at all. L4 shows why females call and males do not: dispersal decides who has kin nearby. The boss is the Seychelles warbler, where helping pays partly because helpers lay their own eggs.

**Key ideas.**
- Hamilton's rule: call when Σr·B > C (here Σr > 0.55).
- Relatedness is identity by descent: half-sisters are r = ¼.
- A behaviour that benefits the actor (the whistle) needs no kin.
- Sex-biased dispersal produces sex-biased altruism.
- Direct benefits can masquerade as kin altruism (co-breeding).

**Misconceptions targeted.**
- "My sister has half my genes." (Ask it: she shares, on average, half of the genes that vary, by descent.)
- "Every alarm call is altruistic."
- "Helpers help only relatives."

**Discussion prompts** (`teacher.prompts`): what r = ½ means; whether the whistle is altruistic and what evidence would decide; which simplification most changes the result (model critique).

**Run it.** About 13 minutes. `?unit=alarm&seed=N` gives every student the same meadow; `?teacher=1` gives step and speed controls; result codes appear on assignment links (bit map in `resultBits`). The class-pool chart is a trace.

**Limits to say aloud.**
- Costs and benefits are fixed.
- Relatedness in L4 is set, not counted.
- The whistle's cost size is designed (only its sign is Sherman's).
- Real squirrels have no face blaze.
- Warbler helpers can also hinder on poor territories (Komdeur 1994), which the boss leaves out.

## Playtest script (designer and colleagues; D6 decision 4)

1. Open Alarm Call from the menu. Read the intro card (about 30 s) and press Play. Note how long until the first call.
2. L1: play 8 attacks. Is 3 s enough to add up the flags? Does the debrief ledger make the rule obvious by attack 3? Drag the break-even line.
3. L2: before tagging, guess the littermates' mean r. Then tag the burrow map. Is the blaze cue clear without being told? Does a wrong tag hurt (the ≠ ring)?
4. L3: commit the two cost markers. Did the whistler bolting suggest the sign? Watch the notebook for 8 attacks. Did it change your mind?
5. L4: call both shares, then play the 8 vignettes. Does "daughter among kin / son among strangers" land? Is the swapped meadow a fair test?
6. Boss: 8 springs. When did you notice that helping paid with unrelated nestlings? Did the gene jar make it visible?
7. Feedback: fun 1–5, clarity 1–5, the slowest moment, any wording that sounded wrong to a biologist, and whether it keeps what you loved about the old Alarm Call.

## Size

`v2/alarm.js` is 101 KB raw and 31 KB gzip, against the lessons' target of ≤ 90 KB raw (≈ 30 KB gzip): within the gzip target, 11 KB over raw. Most of it is `content` (five MODEL cards, why panels, per-level stars) and five distinct scenes.

## Addendum: legacy goldens

- `python3 tests/golden.py check scratchpad/alarm/alarm.html`: **47 ok, 0 failed, 1 skipped** (alarm, which this unit replaces).
- `python3 tests/golden.py check scratchpad/alarm/alarm.html --v1`: **48 ok, 0 failed**. `?v1=1` still plays the legacy Alarm Call.
