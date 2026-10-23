# Wave 2: Why Sex? (`sex`)

*Unit builder, session 4, 23 October 2026. Spec: D3 §4.4 (Why Sex?) and D2 §4 triage, as overridden by D6 decisions 7–10 (own world, `content.intro`, simple beats clever, real biology). File: `games/endless-forms/source/v2/sex.js` (`CH_SEX_V2`, replaces the legacy chapter through `V2.push`; `?v1=1` keeps `ch17.js`). Tests: `tests/oracle_sex.js`, `tests/sex_paths.py`, `tests/sex_shots.py`. Nothing else was edited. Not committed.*

## What I built

**World (D6 decision 7).** A clear glacial lake in New Zealand's South Island, seen from above: pale glacial silt, charophyte-like weed, slate cobbles and a tussock shore, snow-topped slate peaks past the shore, caustic light drifting over the lakebed. Palette: glacier teal water, slate, snail ochre, parasite red. Chrome accent `#2E8C94` (glacier teal). No beetles; the blue and amber allele inks are not used (there is no allele read-out).

**The organisms (D6 decision 10).** Every snail is drawn as a New Zealand mud snail (*Potamopyrgus antipodarum*): a tall five-whorled spire with an aperture, a grey foot and two tentacles that wave. Sexual snails have warm ochre shells that vary a little; **males are drawn smaller and slimmer**. The **clone** is all-female and every one is identical: one pale slate colour. The resistance "lock" is drawn as the shell pattern, two genes: a dark spiral band on every whorl, and dark spots (plain, banded, spotted, banded + spotted). Infected snails are castrated by *Microphallus*: the body whorl glows red with pale cysts and the snail stops moving. During each breed, every uninfected mother releases a ring of six young (clone young pale and identical; sexual young half small sons); infected snails fade; the new generation grows in where it settles. Each tap shows the shadow of a New Zealand scaup (the duck that carries the adult worms) passing over, and a cloud of eggs settling inside the clutch radius.

**The verb (one, D6 decision 9).** You are the parasite. **Tap the weed to drop a clutch of eggs.** Every uninfected snail of the matching lock inside the radius (drawn as a dashed red circle) is infected; others are untouched. Snails your eggs fit glow softly, so the only decision is *where*: aim where they are thick. Press, slide and lift aims first (an aim ring shows the true radius); a quick tap drops at once. The tray under the lake shows which shell pattern the next clutch fits, then the rest of the season's clutches. A soft season clock (14 s; none in Untimed) lets leftover clutches sink at random. Keys: arrows move an aim ring, N jumps to a matching snail, Space drops; a tap or Space during the breed hurries it.

| L | Name | Adds (one idea) | What happens | The key number, shown plainly | Prediction | Stars offered |
|---|---|---|---|---|---|---|
| 1 | Twice the daughters | an all-female clone in a sexual lake | Clones start at 5%. Four clutches a season, keys at random (a naive strain). Whatever you hit, the clone races up and the males vanish | At every breed, a card: "clone mother → 6 daughters; sexual mother → 3 daughters + 3 sons; 2× the daughters". Pills: clones %, males % | **The one call (the chapter's aha):** before the first season, drag the clone's share at generation 6 on the strip (marker starts at 0%). Scored against the twofold rule from 5%: 2c ÷ (1 + c) six times = 77% (± 12). Revealed when generation 6 arrives | D: infect 45 snails and still see the clone pass half; P |
| 2 | The Red Queen | keys that track common locks | Clones start at 30%; ten clutches a season; next season's keys are weighted by this season's infections. As the clone grows, more and more eggs fit its lock; aimed clutches castrate whole patches of identical clones and it crashes; sexual locks, shuffled every generation, escape. Often the clone climbs back as the keys move on: cycles | Pills: clones %, "fit clone %" (the share of eggs whose key fits the clone). Breed card: clone icon "clones 64%", egg icon "fit clone 70%", "eggs track clones" | none | D: crash the clone below 10% by generation 6 |
| 3 | Shallows and deep (boss) | parasites only in the shallows | The lake has two zones; scaup feed only in the shallows, so eggs dropped in deep water are refused ("Too deep: scaup feed in the shallows"). 4% of young move between zones. The deep turns clonal; the shallows stay sexual if you keep hitting the clone | Zone pills: "shallows: males 38%", "deep: males 9%"; the same at each breed | none | T: end with the shallows under 15% clone while the deep turns clonal |

`content.boss.inverts`: "Sex is not always the winner: where parasites are rare, clones take over." Unit stars (`unitStars`): Discover in both L1 and L2; Predict from L1; Transfer from L3.

**Muller's ratchet** is the second reason sex can win, and it is told rather than played (D6 decision 9: it does not fit the one verb; a ratchet level would have needed a second mechanic). It appears on the final card's body, in Why? (real, third chunk: Muller 1964; Neiman et al. 2010 on asexual mud snails' extra mitochondrial mutations) and as the L3 MODEL card's "cannot show".

**Live graph (strip).** One chart a level (`sx_lines`, registered guarded in the unit with a data twin): L1 the clone share 0–100% (the prediction lives here); L2 clones (solid) and eggs fitting the clone (dashed), so the lag of the keys behind the clone is visible; L3 clones in the shallows (solid) and deep (dashed). A dashed half-way line. The level card repeats it.

**What if?** (Freezer vial at the level's start; the aim policy plays): L1 *No sons* (sexual mothers make only daughters and outcross, as hermaphrodites can: the clone stays near 5%; this isolates the twofold cost) and *Keys track*; L2 *Keys stay random* (the clone takes the lake) and *Fewer eggs* (three clutches); L3 *Ducks dive deep* and *No mixing*. Each card text is chosen from the rerun's result and carries its numbers.

**Juice** (from `Sim.run` events only, 30 ms act-to-juice): the clutch ring and egg cloud, a pulse ring on every snail infected, "+n" pop, `Snd2` count/tick; "A whole cluster!" whisper and a T2 for five or more; T2 and a swish at each breed; whispers when most eggs first fit the clone and when the clone starts to crash; the call's reveal with a chime; T3 level banners. Calm: no caustics, no crawling, no tentacle wave.

## The model (headless sim; R() and plain arithmetic)

- Each zone of the lake is a set of class shares: sexual females and males by lock (4 + 4) and the clone. The **patch of 40 snails** you see (20 per zone in L3) is drawn from those shares by largest remainder, at random spaced positions. The share of each lock you infect in the patch is the share castrated lake-wide (the clone's own share when clones are in the patch). This keeps the twofold arithmetic exact while every tap still matters.
- **Breeding:** each uninfected mother has 6 young (cancels in the shares). Clone young are all daughters with the clone's lock. Sexual young are half sons; each of the two lock genes comes from mother or father with ½ (free recombination); fathers are uninfected males in proportion. 1% lock mutation. Young compete for a fixed number of places (a lottery), so the twofold cost bites: with no infection the clone's share goes **2c ÷ (1 + c)** exactly (oracle).
- **Matching alleles:** a key infects only its own lock. Castrating a fraction x of clones scales the clone's young by 1 − x, so the clone falls once x passes one half (Why? maths).
- **The parasite's keys:** L1 at random. L2 and L3 track: next season's weight for a key = 0.3 × this season's + its infections + 0.4 (a floor of rare keys); a season's keys are dealt in proportion to the weights (largest remainder) in a random order. L3's shallows start with the clone's key a little favoured (weights 1, 1, 1, 2: parasites already met it) and ten clutches; clutch radius 18 lake units (13 in L3's narrower zones).
- **Migrants:** in L2 and L3, 1% of young each generation come from nearby lakes with the level's starting mix (D3's floor; D0's guard-rail for matching-allele cycles); in L3, 4% move between the zones.
- **Dynamics found while tuning** (`scratchpad/s3/sex/proto*.js`, then the real sim): a fully stochastic 40-snail lake was far too noisy to tell the story (sex often went extinct before the keys caught up; a hard-hit lake emptied). Treating the zone as shares and the patch as its sample, dealing keys in proportion and adding the 1% floor made the boom–crash reliable for good aim (crash below 10% by generation 6 in 40 of 40 expert seeds) while random tapping rarely gets there.

## Science claims, with references (for Coordinator A)

| Claim (where) | Source |
|---|---|
| The twofold cost of males: a clone mother makes twice the daughters; share → 2c ÷ (1 + c) (intro, L1, Why? maths) | Maynard Smith 1978 *The Evolution of Sex* (`msmith1978`); Williams 1975 *Sex and Evolution* (`williams1975`) |
| Asexual *Potamopyrgus* are all-female clones, usually triploid; sexual snails are diploid with males; both live in the same lakes (L1 MODEL) | Lively 1987 *Nature* 328:519 (`lively1987`); Jokela, Dybdahl & Lively 2009 *Am Nat* 174:S43 (`jokela2009`) |
| *Microphallus* castrates the snails it infects; adults live in waterfowl such as scaup; snails are infected by eating eggs (L2 MODEL, world) | Lively 1987; King et al. 2009 (`king2009`) — **sign-off: add a primary source for the *Microphallus* life cycle and confirm the New Zealand scaup as a main definitive host** |
| Parasites infect locally common clones best, with a time lag (L2 MODEL) | Dybdahl & Lively 1998 *Evolution* 52:1057 (`dl1998`); Lively & Dybdahl 2000 *Nature* 405:679 (`ld2000`) |
| Common clones in Lake Alexandrina became overinfected and declined; rare clones rose (Why? real, L2 MODEL) | Jokela, Dybdahl & Lively 2009 |
| The Red Queen hypothesis for sex: parasites that track common genotypes favour recombination (Why?, take) | Hamilton 1980 *Oikos* 35:282 (`hamilton1980`); Jaenike 1978 |
| More males (so more sex) in lakes with more trematode infection (Why? real, L3) | Lively 1987 |
| Sex is commoner in habitats where infection is higher; infection highest in shallow water (L3 MODEL, boss) | King, Delph, Jokela & Lively 2009 *Curr Biol* 19:1438 (`king2009`); Jokela & Lively 1995 *Oecologia* 103:509 (`jl1995`) — **sign-off: page numbers** |
| Muller's ratchet: a small clone line cannot rebuild its least-mutated class (final card, Why?) | Muller 1964 *Mutat Res* 1:2 (`muller1964`); Felsenstein 1974 *Genetics* 78:737 (`felsenstein1974`) |
| Asexual mud-snail lineages carry more harmful mitochondrial mutations (Why?, L3 MODEL) | Neiman et al. 2010 *Mol Biol Evol* 27:954 (`neiman2010`) |

**Designed and tagged on the MODEL cards:** 6 young per mother (real broods are tens of embryos), 4 locks of 2 genes (real resistance genes are invisible; the pattern stands for them), clutches a season (4, 10, 10), clutch radius, the keys' 0.3 memory and 0.4 floor, 1% migrants, 4% mixing, deep water with no parasites at all (real deep water has few), 1% lock mutation (×N), one season a generation (×N). **Simplifications stated:** the patch stands for the lake; males are drawn smaller to tell them apart; no other benefit of sex is modelled. Agency: the player is the parasite; snails never "choose" to be sexual; populations, not individuals, change.

**Wave 1 corrections carried over** (science_sweep_G1, G6): the legacy chapter let the player switch the whole pond's mode, which hid the twofold cost (R7-R1 D5, A24); here a clone competes inside a sexual population and the cost bites through the lottery for space. G6's "Selection removes it" for the ratchet is kept correct: the best class is lost by chance, without recombination it cannot be rebuilt. The legacy TAKE, MODEL, RECALL and BRIDGE for `sex` are rewritten only outside `?v1=1`.

## Deviations from the spec, and why

1. **Three levels, not five** (D6 decision 9). D3's L3 *ratchet* and L4 *two good mutations* need a second mechanic each; they are told on the cards. The boss keeps D3's inversion ("where the Red Queen sleeps, clones win") as one lake with shallows and deep (King et al. 2009) instead of a six-lake map with six predictions.
2. **One prediction** (D6 decision 9), at L1: the twofold doubling is the aha that sets up the question. D3's peak-generation and lake-map predictions are cut.
3. **The player chooses where to drop a clutch, not which snail to try with a larva.** With a key at the cursor and a free choice of snail, a player who searches for matches removes the encounter-rate effect that makes common locks the target; tracking then never emerged in tests. A clutch infects every match in a radius, so the number infected grows with the lock's frequency, which is the matching-alleles logic.
4. **The patch stands for the lake** (see the model). A fully stochastic 40-snail lake failed: sex went extinct in about half of the runs before the parasite tracked the clone.
5. **No shared `v2/03_redqueen.js` parasite module** (D3): Lock and Key is not rebuilt yet; the model is small and lives in this file (`SX`).
6. **Males are drawn smaller.** Real male and female *Potamopyrgus* are told apart by the penis, not the shell; the size cue is a drawing convention, stated on the card.

## Engine requests (nothing was edited)

- `End.show` takes an Interesting key only; the unit fills `content.interesting.now` with `Txt.f` first (as the Raffle does).
- `Pal.place` has no glacial lake; `lake` (the cichlid lake) is used for the chrome ground.
- On a phone the Predict strip covers the scene while it lingers; this unit passes `linger: 0` so the first taps after the call land on the lake.

## Tests (scratch build `V2_ONLY='0*,zz_*,sex.js'`)

- `node --check v2/sex.js`: clean. `sh tests/dup_globals.sh`: ok (every top-level name starts `SX`/`CH_SEX_V2`; the legacy `binom` in ch17.js is untouched).
- `node tests/lint_text.js <build> sex`: 0 errors, 0 warnings.
- `node tests/oracle.js <build> sex`: **42 passed, 0 failed** (about 3 minutes; `SX_FAST=1` for a quarter of the seeds). Covers D3's lines (A: twofold rule exact for 8 generations; B: males ≥ 20% at the end in 37 of 40 expert seeds; C: the nearest/only-clones/no-change calls miss), largest-remainder patch, free recombination (25.0% each lock), matching alleles (x castrated → 1 − x), key weights and proportional dealing, L2 crash by generation 6 in 40 of 40, L3 pattern in 35 of 40, deep water refused, determinism and snapshot replay on every level, the expert earning every offered star (17, 20, 19 of 20), no bot union of three, every Interesting text and three What if? directions.
- `python3 tests/bots.py <build> sex --seeds 1-40`: PASS. Best masks: alwaysA none in L1–L2, T sometimes in L3; alwaysB D in L1 rarely; random D+P in L1 occasionally, D in L2 rarely; greedy (the first matching snail) D in L1, T in L3; threshold (only clone shells) D in L2 every time (that is the lesson). No bot earns three stars in a level, and no bot's unit union reaches three (oracle).
- `tests/sex_paths.py`: 28 ok (the call needs a move and the strip folds on commit; a real tap drops a clutch where tapped and infects only matching snails inside the radius; press–slide–lift; latency 30 ms; arrows, N and Space; the season clock; tap to hurry the breed; the reveal and the twofold number on the card; What if? *No sons* with the run's own number; L3 deep water refused; untimed logged with no clock; Calm; deep link; teacher mode; `?v1=1` legacy; 3 v2 levels).
- `GAME_HTML=<build> python3 tests/monkey.py sex 1,2,3 --vp 390x780,1280x720`: **6 of 6 runs reach the end card**, no errors, NaN or stuck states (about 2,000–2,300 steps; 28–38 intro reopenings survived).
- `python3 tests/golden.py check <build>`: 47 ok, 0 failed, 1 skipped (`sex`).
- `tests/sex_shots.py` at 390 × 780, 1280 × 720 and 1920 × 1080, plus `?cvd=deut` on L3: 0 page errors, no Lbl/Whisper/HUD warnings.
- Size: 72 KB raw, 24 KB gzip (under lessons §4's 90 KB / 30 KB).

## Screenshots

`scratchpad/s3/sex/shots*/` (not in the repo): every level at 390 × 780 and 1280 × 720 (intro, start, the ask before and after the drag, committed, aim and drop at generations 0, 2, 4 and 6, the breed at two moments, the level card). Fixes found by looking:
1. The first snail drawing read as bees or wasps (thick dark stripes on an oval). Redrawn as a five-whorl spire with an aperture, a foot and tentacles; the band became a thin spiral line on each whorl.
2. Slate cobbles were darker and bigger than the snails and competed with them: fewer, smaller, lighter.
3. The L1 chart's y axis read "10000%" (the `pct` format on a 0–100 axis) and my "50%" label sat on a tick: a percent formatter, and a plain half-way line.
4. The ghost hand demonstrated a tap on the lake during the prediction: it now starts with the first season.
5. On a phone the first two taps after Lock in hit the still-open strip: `linger: 0`.
6. The final card printed "Males in the shallows: 4%" from the clone share: fixed.
7. L3's two "males" pills did not say which zone was which: they now read "shallows: males 38%" and "deep: males 9%" and sit in their zones.
8. The L2 breed card ("fit clone 70% clones 64%") was cryptic: a clone icon and an egg-cluster icon now label the two numbers, with "eggs track clones".
9. The scaup shadow and the egg particles made a brown "caterpillar" at the drop: a larger, fainter scaup shadow and only the settling egg cloud.
10. HUD lines in the breed ran to three lines at 390 px: shortened.
11. At 1920 × 1080 the snails were capped too small for the big lake: the size cap rose from 38 to 46 px. Under `?cvd=deut` clones (pale) and sexual snails (ochre) stay distinct by lightness; infection reads by the cysts and outline.

## Self-review (playtester and art director, adversarial biologist, D5 §3)

| Issue | Verdict | Action |
|---|---|---|
| Matching snails glow: is aiming too easy? | Kept | The lesson is which lock is common, not pattern-spotting; the glow makes a whole patch of identical clones light up, which *is* the Red Queen. Aim still separates bots (expert 57–78 infections in L1, random about 33) |
| "Only target clones" earns L2 Discover every time | Right, and intended | Hitting the common clone is the lesson; it is still the player's aim that does it |
| The clone often climbs back late in L2 | Kept | Time-lagged cycles are the Red Queen; the Interesting text says so when it happens ("cycle"), and Discover reads the crash by generation 6, not the end |
| A random tapper sometimes keeps the L3 shallows sexual | Accepted | Tracking keys do much of the work; the T threshold (under 15% clone) still needs aim most of the time (random 8 of 40) |
| "Infect" could imply the snail decides anything | Checked | No snail "chooses", "needs" or "evolves"; the player is the parasite; populations change |
| Patch-as-lake hides drift | Stated | MODEL L1: the 40 snails stand for the lake |
| Ratchet not played | Accepted (D6 decision 9) | Told on the final card, Why? and MODEL |
| D5 §3 1–13 | Pass | 1 latency 30 ms, `role: 'environment'`, the player never dials a snail's own heritable trait; 2 D6 card, firstWords 23 words, ghost tap at the best spot; 3 one ask, scored against the twofold rule, needMove, starts off the answer; 4 three levels, one idea each, bots pass; 5 boss inverts; 6 one strip chart per level, solid/dashed, reveal at generation 6; 7 T1–T3, `Snd2` twins, Calm; 8 lint clean; 9 MODEL cards, ×N tags, refs; 10 prompts, result bits, this note; 11 keys, tap alternatives, untimed, data twins; 12 TAKE, MODEL, RECALL, BRIDGE rewritten under `!Url.v1`; 13 monkey |

## Instructor note (one page)

**What it teaches.** Why sex persists despite its twofold cost. A clone wastes nothing on sons, so it doubles its share each generation at first (2c ÷ (1 + c)). Parasites whose keys must match a host's lock attack whatever lock is common; a clone is one lock, so once it is common it becomes the easiest target and crashes, while sexual snails keep making rare locks (the Red Queen; Hamilton 1980; Lively's New Zealand mud snails). Where parasites are rare, clones win: in real lakes males are commoner where infection is high (Lively 1987; King et al. 2009). Muller's ratchet is the second, slower cost of clonality.

**Fifteen minutes in class.** Project L1 (`?unit=sex&level=0&seed=1&teacher=1`). Before playing, ask the room for the clone's share at generation 6 (most say 15–30%; the rule says 77%). Play together; open What if? *No sons* to show the cost comes from sons. Students play L2 and L3 alone (about 6 minutes). Compare cards: who crashed the clone, and how fast?

**Discussion prompts** (rising): (1) Why does a clone outbreed sexual snails two to one? (2) Why did the clone become the parasite's easiest target once it was common? (3) This model has four locks and no other benefit of sex. What would change the result most?

**Misconceptions to watch.** "Sex is for the good of the species" (here a clone competes inside the population). "Snails choose sex when parasites appear" (no; the share of sexual snails changes by selection). "Clones always lose" (L3's deep water). "Parasites are trying to kill snails" (they castrate, and they are selected to infect whatever is common).

**Assignment link.** `?unit=sex&level=N&seed=S` gives a result code (mask, final clone share, the L1 call, snails infected).

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open Why Sex? from the Notebook; read the card (under 30 s?). *Could you say what to do before the hand showed you?*
2. L1: make the call without thinking hard, then play. *When generation 6 arrived, did the gap between your call and 77% surprise you? Did the breed card ("6 daughters" against "3 daughters + 3 sons") explain why?*
3. L1: open What if? *No sons*. *Did it make clear that sons are the cost?*
4. L2: aim at the glowing patches. *Did you notice the eggs coming to fit the clone (the dashed line, the tray, the glow)? Was the crash satisfying? If the clone came back, did the card's "cycles" line make sense?*
5. L3: try tapping in deep water once. *Was "too deep: scaup feed in the shallows" clear? Did the two zone pills make the Lively pattern obvious?*
6. Rate fun 1–5. Note any waiting with nothing to do, any control you could not explain, and any word that sounded like a snail choosing.

## Review round (23 October 2026: playtester, art director, adversarial biologist)

Played every level with Playwright at 390 × 780 and 1280 × 720 (plus `?cvd=deut` on L2) and swept the bots headless (`scratchpad/s3/rv_sex/`, `scratchpad/s3/rvsx/probe.js`). The world is distinct (glacial lake, slate, ochre and grey snails, red parasite) and the snails read as real *Potamopyrgus*, so decisions 7 and 10 hold. The problems found, and the fixes:

| # | Problem (found by) | Fix |
|---|---|---|
| 1 | **L1 could wipe the clone out for good** (bot sweep). The patch holds only 2 clones, and the clone's infected share was read from clones alone, so one clutch over both castrated "every clone in the lake". A player aiming only at clones did this in 16 of 30 runs, and even the aim policy in 2 of 30. The twofold lesson then vanished, yet the card still said "Random keys cannot stop a doubling". | **Infection is pooled by lock** (`SX.fracs`): clones and sexual snails of one lock share one infected fraction. This is the matching-alleles assumption itself (a key fits a lock, not a way of breeding), and the larger sample stops a 2-snail artefact. Wipe-outs: 0 of 30 for every bot. L2's crash and L3's pattern are unchanged (oracle). |
| 2 | **The first thing L1 asked was a chart drag**, before the player had tapped anything or seen a breed (decision 9: no unexplained controls; the intro's "How to play" said "tap"). | **L1 opens on the verb** and the ghost hand. The one call comes **after the first breed**: "Clones: 5% → 10% in one generation. What share at generation 6?" It is scored against the twofold rule from the share then shown, 2c ÷ (1 + c) five more times (about 78%, ± 12). A linear guess (about 35%) or "no change" still misses. In 2 of 40 seeds the first clutches castrate many clones and the target falls to 32–49%; the rule is still the honest target. |
| 3 | **The key equation was never on screen** (decision 9). | L1's breed card now ends with "clone share → 2c÷(1+c)" under "2× the daughters"; the level card names it with the numbers. |
| 4 | **MODEL card numbers did not match the sim**: L3 said 10% mixing (sim 4%) and 8 clutches (sim 10), and omitted the 13-unit clutch radius. | Corrected to 4%, 10 and a 13% radius. |
| 5 | **Why? maths was wrong in general**: "the clone grows by 2(1 − x), so it falls once x passes one half" ignores infection of sexual snails. | "If a share x of clones and y of sexual snails are castrated, the clone still gains only while 2(1 − x) > 1 − y." |
| 6 | **"Scaup feed only in the shallows"** was a stronger host claim than the sources carry (the log already asked for sign-off; New Zealand scaup are diving ducks). | All player-facing text now says **ducks** ("Ducks feed in the shallows"; MODEL: "its adults live in waterfowl, mainly ducks"). The shadow stays a generic duck. |
| 7 | **Result texts written in advance** (lessons rule 6): L1's "Random keys cannot stop a doubling" when the clone was held; L2's "it fell to 99%" when it never crashed; the final card's "the clone ... crashed" when it held the shallows. | `content.levelBody` is now keyed: `0`, `1`, plus `held` (L1, clone < 50%), `nocrash` (L2, no fall below 10% after the peak; the take line is dropped too) and `final` (L3, shallows ≥ 50% clone). |
| 8 | **The matching snails' glow was hue only** (pink on ochre): under deuteranopia it nearly vanished on the pale silt. | A pale rim around each glow, so the match reads by lightness too (checked with `?cvd=deut`). |
| 9 | **The whisper covered the key-number pills** (both sat at the top-left of the lake on a phone). | Pills moved to the bottom of each zone. "fit clone 61%" read as cryptic: now "clone-fit eggs 61%". |
| 10 | **Phone HUD ran to four lines** at the start and three in the ask, over the shore. | firstWords: "Tap near glowing snails: only they catch your eggs. Grey shells are the clone." Ask line shortened. |
| 11 | Unstated simplifications. | MODEL L1: "Males are drawn smaller only to tell them apart." MODEL L2: each snail carries one form of each lock gene, as in Hamilton's haploid models, and a key fits clones and sexual snails alike. |

**Science re-checked and kept:** twofold arithmetic (5% → 77% in six generations; closed form 2ⁿc ÷ (1 + (2ⁿ − 1)c)); RECALL (20% → 33%); Lively 1987, Dybdahl & Lively 1998, Lively & Dybdahl 2000, Jokela, Dybdahl & Lively 2009 (Lake Alexandrina), Jokela & Lively 1995 (infection highest in the shallows), King et al. 2009, Neiman et al. 2010, Hamilton 1980, Muller 1964, Felsenstein 1974: each claim matches what the paper reports. Asexual *Potamopyrgus* are mostly triploid all-female clones; *Microphallus* castrates both sexes (the model removes infected males from the fathers too). No snail "chooses", "needs" or "evolves".

**Still open for sign-off:** page numbers for Jokela & Lively 1995 and King et al. 2009; a primary source for the *Microphallus* life cycle (eggs in duck faeces eaten by snails).

**Tests after the round** (`V2_ONLY='0*,zz_*,sex.js'`): `node tests/oracle.js` **47 passed, 0 failed** (new: pooled infection; no L1 wipe-out for a clone-only player; the call after the first breed, scored from the share then shown); `tests/lint_text.js` 0 errors, 0 warnings; `tests/bots.py --seeds 1-40` PASS (no bot earns three stars); `tests/sex_paths.py` **30 ok** (rewritten for the verb-first opening: the call follows the first breed and names the share just seen); `tests/monkey.py sex 1,2,3 --vp 390x780,1280x720` **6 of 6 reach the end card**, no errors; `sh tests/dup_globals.sh` ok; `tests/golden.py check` 47 ok, 1 skipped; `tests/sex_shots.py` 0 page errors at both sizes and under `?cvd=deut`.
