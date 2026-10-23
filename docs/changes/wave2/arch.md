# The Archipelago (`arch`): Wave 2 rebuild log

*Session 4, 23 October 2026. File: `games/endless-forms/source/v2/arch.js` (id `arch`; this replaces the legacy `ch27.js` chapter, and `?v1=1` still plays the legacy version). Tests: `tests/oracle_arch.js` and `tests/arch_shots.py`. Spec: D3 §4.8 and D2 §4, cut down under D6 decisions 9 and 10.*

## 1. What it is

**The world (D6 decision 7):** the Galápagos seen from above at golden hour. It has a cobalt sea with sun glints, black lava islands with rust and tuff patches, a pale beach and surf, prickly-pear cacti with red fruit, and low caltrop (*Tribulus*) mats with yellow flowers. The palette is lava black, sea cobalt, cactus green and sunset orange, and the chrome accent is sunset rust `#B5562C`. Rain clouds carry a sunset rim. Rain turns an island green with small seeds. A drought browns it.

**Real biology, not symbols (decision 10):** the scene always shows Darwin's finches.
- Medium ground finches are charcoal, side-on, and hop about.
- Each bird's beak is drawn to scale (exaggerated) from its own beak depth.
- Large ground finches are chestnut, with big pale beaks.
- Big Bird family members carry a pale halo and a cream song note.
- Chicks hatch as small brown fledglings.
- The dead fall over and fade during the feed.

The read-outs sit beside the birds:
- a portrait of the average finch's head, with the starting beak dashed in rust;
- the R = h² × S plate;
- a dot histogram of beak depths with S and R arrows;
- a trend line.

**One verb (decision 9):** *hold on an island to rain on it*. If you let a season end dry, it is a drought.
- Rain grows small soft seeds. Over 50 mm, the finches breed: 2 chicks a pair, or 4 a pair over 150 mm.
- A drought leaves only the island's lasting seeds, so the beaks that handle those seeds survive.

The player is the climate (role: environment) and never sets a beak (bible §3; this fixes R8's point that the old L1 had the player choose the beak).

## 2. Levels (four, one idea each)

| L | Name | Idea | Goal (star) | Key number on screen |
|---|---|---|---|---|
| 1 | The drought | Selection plus inheritance: droughts select, wet years let survivors breed | Average beak +0.5 mm, 20 finches left (Discover) | **R = h² × S**, with this run's values (for example +0.83 = 0.8 × +1.04, "chicks" and "survivors") |
| 2 | Three islands | Adaptive radiation: one founding flock, three seed niches (grass, cactus, caltrops) | Island averages 2 mm apart, each island ≥ 10 finches (Discover) | Each island's average beak, with a small head; the HUD shows the spread |
| 3 | Neighbours | Character displacement: with large ground finches, a drought **slims** beaks (inverts L1) | Beaks −0.2 mm through a drought with chicks after it, 15 left (Discover); the one prediction (Predict) | R = h² × S, now negative |
| 4 | Big Bird | An immigrant male founds a family that pairs within itself by learned song | Family reaches generation 5 with ≥ 10 birds (Transfer) | Family size and generation; resident and family beaks side by side |

**The one prediction** (the aha, decision 9). It comes at the first drought in L3, and it is three dock buttons: *Deep beaks / No change / Slim beaks*. It is scored against the expected selection differential for that drought, computed from the survival chances before any draw, never against the realised draw. Players coming from L1 expect "deep", so the call needs a decision.

**Stars** (no level offers three):
- Discover needs two of L1–L3.
- Predict comes from L3.
- Transfer comes from L4.

**What if?** replays *the player's own weather* from the frozen level start, with one lever changed:
- L1: no inheritance; every year wet.
- L2: many migrants; no inheritance.
- L3: no big finches; no inheritance.
- L4: mate at random.

Each text quotes the rerun's number against the player's.

## 3. The model (MODEL card summary)

Every finch has a breeding value *a* and a beak depth *z* = *a* + noise, with V_P = 0.81 mm² and h² = 0.8.
- **Inheritance:** a chick's *a* is the mid-parent value plus segregation noise (V_A/2).
- **Seeds:** seed sizes are binned 5–17 mm, each expressed as the beak depth that handles it best. Each island has lasting seeds (amounts in bird-years). Rain adds 2 bird-years of small seed (peak 7 mm) per mm.
- **Feeding:** utilisation is Gaussian with width 1.5 mm, kept from the legacy chapter. Each seed size is shared among all beaks in proportion to use × need. Need falls with beak size, because smaller birds need less food (Grant & Grant 2006).
- **Survival:** a bird survives with probability s0·(1 − e^(−q²)), where q = food ÷ (0.7 · need) and s0 = 0.92.
- **Breeding:** only over 50 mm of rain. Chicks fill the island's room (cap) by lottery.
- **Determinism:** all of this uses Det maths and R() draws, so a run is (seed, level, actions).

| Parameter | Value | Tag | Source or note |
|---|---|---|---|
| h² of beak depth | 0.8 | realistic | Boag 1983 (about 0.7–0.9) |
| Utilisation width | 1.5 mm | designed | legacy `ch27.js` |
| Finches on Daphne | 100 (cap 120) | ×N | about 1,200 real; each drawn finch stands for about 10 |
| Drought mortality | about 84% (oracle) | emergent | about 85% in 1977 (Boag & Grant 1981) |
| Drought S | about +0.8 mm | emergent | +0.54 mm in 1977 (9.42 → 9.96 mm); a model drought has 0 mm of rain, so it is harsher |
| L2 years | 8 | ×N | the real radiation took about 2 Myr (Lamichhaney et al. 2015) |
| L3 large ground finches | 60, fixed, ×2 food need | designed | a few hundred by 2003 against about 1,000 medium; tagged designed |
| L3 island | more small-seed plants than 1977 | designed | as after the 1983 El Niño |
| L4 years per round | 3 | ×N | |
| L4 pairing by song | 95% | designed | Lamichhaney et al. 2018 (song and beak isolation) |
| L4 family niche cap | 30 birds | designed | the lineage was about 30 birds in recent counts |
| L4 founder | 12 mm beak; survives three rounds; pairs with medium ground finch females in the first two wet rounds | designed and history | "he bred with resident G. fortis females" |
| L4 forced drought | 2002 round, 30 mm (no breeding) | history, compressed | the 2003–05 drought left one F3 brother–sister pair |

**Science checks the oracle verifies** (48 assertions, all pass):
- A wet year selects nothing (expected S ≈ 0).
- A 1977-style drought gives expected S of about +0.84 mm, with 84% mortality and realised S positive in 40 of 40 runs.
- Every 2004 drought with large ground finches gives expected S < −0.1 (mean −0.48).
- **Removing the competitor removes the push** (0.00 against −0.48 mm), so the competitor is the cause and not the island.
- Breeder's equation: realised R/S ≈ 0.8. With no inheritance, the same weather leaves the beak unmoved.
- Pairing by song keeps the family's beaks about 0.9 mm deeper than the residents'. With random mating the gap falls to about 0.26 mm.
- With eight migrants a year, the island spread falls from 2.6 to 1.5 mm.

**Wording:** the agency rules hold throughout ("populations evolve"; no finch chooses or needs anything; the player is the weather, never the beak). The Wave 1 G5 corrections are kept in spirit:
- survival is graded, not all-or-nothing (the model's survival curve);
- no level claims the ground finches are alone on Daphne;
- the old "about 4% deeper" offspring is now given as survivors 9.42 → 9.96 mm with about 80% inherited.

The 1985 reversal (Gibbs & Grant 1987) is not a level. Wet years in the model select almost nothing, so the old quiz's reversal question was dropped rather than mis-modelled.

The G6 TAKE wording ("Competition can push similar species apart") is matched by the take line.

**Refs:** boag1981 (Science 214:82), boag1983 (Evolution 37:877), grant2002 (Science 296:707), grant2006 (Science 313:224), lam2016 (HMGA2 and displacement, Science 352:470), lam2015 (Nature 518:371), lack1947, grant2008 (*How and Why Species Multiply*), lam2018 (Science 359:224), grant2009 (PNAS 106:20141).

## 4. Tuning, and the honest limit

The population levels are stochastic, so the expert bot earns each level's stars on **≥ 90%** of seeds rather than 100%. The oracle asserts at least 90% and states why. On 30 seeds:
- L1: 28/30
- L2: 28/30
- L3: 29/30
- L4: 30/30 (60/60 in tuning)

Each failure is a run where an unlucky drought left too few or too similar survivors. The level card's Interesting text names what happened (crash, lost island, family gone), and Replay gives a fresh seed.

**Bot sweep** (30 seeds): no level gives three stars, and no bot's union across the unit reaches three.

| Bot | Unit stars at most |
|---|---|
| alwaysA (always wet) | 1 (Transfer) |
| alwaysB (never rain) | 1 (Predict) |
| greedy (alternate) | 2 |
| threshold | 2 |
| random | 2; it once reached 3 before Transfer was raised to ≥ 10 birds and generation 5 |

Fixed "always wet" and "never rain" never earn Discover in L1–L3. L3 Discover also needs chicks after a drought, so a non-inherited change is not counted.

L4's design note: family growth was fragile under a single shared room cap, with neutral drift, and only about 50% of seeds succeeded. Giving the family its own niche room of 30 birds, the "niche of its own" argued by Lamichhaney et al. 2018 (designed), made heavy-rain play reliable. Normal 100 mm rain succeeds about 40% of the time, and alternating rain and drought about 50%.

## 5. Tests run

All on a scratch build made with `V2_ONLY='0*,zz_*,arch.js'`.

| Test | Result |
|---|---|
| `node tests/oracle.js BUILD arch` | 48 passed, 0 failed (about 20 s) |
| `node tests/lint_text.js BUILD arch` | clean (0 errors, 0 warnings) |
| `sh tests/dup_globals.sh` | ok; every top-level name is prefixed `ARC_`, plus `CH_ARCH_V2` |
| `GAME_HTML=BUILD python3 tests/monkey.py arch 1,2,3,4 --vp 390x780,1280x720` | 8 of 8 reach the end card, with no console errors or Lbl/HUD/Whisper/Dock warnings |
| `GAME_HTML=BUILD python3 tests/arch_shots.py OUT [--whatif] [--calm]` | every level and phase at both sizes, about 160 PNGs, looked at. Fixes made from the shots are in §6 |

## 6. Fixes made after looking at the screenshots

- The HUD wraps to three lines on a phone, so the scene now reserves 84 px for it.
- The R = h² × S plate moved to the bottom left. It is split into one label per symbol (the 3-word label rule) and shows values only for meaningful selection (|S| ≥ 0.15).
- A drawn sample of at most 46 birds, larger, replaces 120 tiny birds; the read-outs still count every bird.
- Large ground finches were indistinguishable. They are now chestnut with pale beaks, 1.55× size, and one carries a label.
- Big Bird family members were lost in the crowd. They now get a halo and a song note. The L4 portrait shows resident and family heads side by side.
- The cloud shows only while it rains, so no ghost circles remain.
- L2 islands are larger, in a zig-zag down the stage, with tags and gauges on opposite sides. This fixed the overlap on both phone and desktop.
- The dot histogram hides its arrows during the ask, so the answer is not shown.

## 7. Needs sign-off (science)

- **Numbers:** the 1977 means (9.42 → 9.96 mm) come from Boag & Grant 1981 via a secondary source (Weiner). "Most died" is about 85%.
- **Big Bird history:** the immigrant is a *G. conirostris* male from Española (Lamichhaney et al. 2018 genetics), and the "two fortis females" are reported in the press summaries. Check against the paper.
- **L3 parameters:** the 60 large ground finches and the small-seed-rich 2004 island are designed so that the competitor's effect is clean (0.00 against −0.48 mm). Real 2004 counts are worth a check.

## 8. Engine notes

None needed. A three-way prediction as dock buttons worked without a Predict "set" kind. This is a second vote for that engine request: `Predict.ask` could offer a choice kind.

## 9. Playtest script (designer and colleagues; about 8 minutes)

1. **Open The Archipelago from the menu.** Read the card; can you say in one sentence what you will do? Press Play.
2. **L1.** Watch the hand, then hold on the island. Does the cloud rain and the gauge fill? End a season dry. Do you see finches die and the survivors' average beak deepen in the portrait? After the next wet season, look at the R = h² × S plate: does "chicks inherit 80% of the survivors' edge" make sense? Aim for +0.5 mm while keeping 20 finches.
3. **L2.** Rain on one island at a time and let the others dry out. Do the three islands' beaks pull apart? Is the goal (a 2 mm spread) clear from the HUD?
4. **L3.** Before the first drought you are asked which beaks will survive. What did you pick, and were you surprised? Did the large ground finches read as a different species?
5. **L4.** Keep the Big Bird family going through the 2002 drought you cannot stop. Could you tell family birds from the rest? On the final card, open **What if? → Mate at random**: does it show why song matters?
6. **Feedback:**
   - Which level was most fun, and which was confusing?
   - Was anything on screen unexplained?
   - Did any number feel wrong?
   - Should L4 stay, or should Big Bird be a note only?

## Review round (23 October 2026)

*Reviewer: playtester, art director and adversarial biologist. I played every level at 390 × 780 and 1280 × 720 with `tests/arch_shots.py` (seed 7, about 160 PNGs each round, saved in the scratchpad, not the repo) and looked at every phase.*

**Verdict before fixes.** The chapter is simple and clear:
- it has one verb (hold to rain), four levels and one three-button prediction, the aha that inverts L1;
- R = h² × S is shown with this run's values;
- there are no unexplained controls.

The world is distinct. The main faults were the art (finches hard to see), one dishonest number, and some small wording problems.

**What changed.**
1. **Finches were invisible on a phone.** Charcoal birds on a near-black island had a contrast of about 1.1:1.
   - Daphne Major is in fact a **tuff cone** (brown, with a crater), not black lava. Its islands (L1, L3, L4) now have brown tuff ground with the crater drawn in. The L2 islands stay black lava, so the world keeps both looks.
   - Every finch now has a low-sun rim light on its back and head. Birds read on any ground (tuff about 3.9:1), and this fits the golden-hour world.
2. **Science: drought selection was understated.** The model's 1977-style drought gives S ≈ +1.0 mm against the real +0.54 mm (about twice as strong), but the MODEL card called it "a little stronger".
   - The card now says "about twice that of 1977 (×2)".
   - It also has a param row: drought selection S ≈ +1 mm, tag ×N, real +0.54 mm in 1977.
   - Mortality (about 84%) still matches the real 1977 figure.
3. **Island name.** "Lava isle" was the *caltrop* island (every island is volcanic). It is now **Caltrop isle**, and the L2 result text says "(caltrops)", so the three names match the three seed niches.
4. **Large ground finch colour.** Adult male *G. magnirostris* are black, like *G. fortis* males. The chestnut was toned to the grey-brown of females and young, and the change is noted in the code. They still read apart by size (1.55×) and their pale, massive beak.
5. **Big Bird family marker.** The filled pale disc looked like a saucer under each bird. It is now a cream ring. The song note stays (pattern, not hue).
6. **Wording.**
   - Agency: the take line "Weather picks the seeds, seeds pick the beaks…" became "Weather sets the seeds, the seeds set which beaks survive…".
   - The L3 result line "small seeds decided who lived" became "finches that handle small seeds survived".
   - The param "their food need" became "food each one eats ×2 (they weigh about twice as much)".
7. **First 5 seconds.** "End a season dry" was unclear about the control. The intro card's How to play and the first HUD line now say "Press End season with no rain for a drought."
8. **History.** The L4 MODEL card said the bottleneck drought was "in 2002". Sources give the early 2000s (2003–05 in the log). The card now says "in the early 2000s". The forced round is still labelled 2002, because one round stands for three years (×3).

**Kept, with reasons.**
- **The L3 ask has no timeout.** It waits on three always-visible dock buttons. No softlock was found by the monkey (8 of 8 runs) or by the shots.
- **The L2 trend lines are all one ink**, labelled at their ends. A semantic ink (sel, drift, mig) would misstate meaning, and the allele inks are reserved for allele read-outs (D6 decision 7).
- **Expert reliability stays about 90% per level.** On seed 7 the L2 expert ended at a 1.45 mm spread, a true failure, and the card names it.
- **Always wet earns L4 Transfer.** That is honest: the family survives if it can breed, and the lesson lives in What if? → Mate at random. The playtest script already asks whether L4 should stay.

**Tests after the fixes** (scratch build `V2_ONLY='0*,zz_*,arch.js'`):

| Test | Result |
|---|---|
| Oracle | 48 passed, 0 failed |
| `lint_text` | 0 errors, 0 warnings |
| `dup_globals` | ok |
| Bot sweep, seeds 1–20 | pass: no level gives 3 stars; best unions are 2 |
| Monkey, seeds 1–4 at 390 × 780 and 1280 × 720 | 8 of 8 reach the end card, no console errors |
| Shots | re-taken at both sizes and looked at |
