# The Commons (`commons`), Wave 2 rebuild — log

*Built 23 October 2026 (session 4). File: `games/endless-forms/source/v2/commons.js` (`CH_COMMONS_V2`). Replaces the legacy chapter of the same id (`ch22.js`); `?v1=1` still plays the legacy chapter. Tests: `tests/oracle_commons.js`, `tests/commons_shots.py`.*

Spec: D3 §4.5 and D2 §4 (MERGE with TB Commons, gains the siderophore boss), **cut down by D6 decision 9 (simple beats clever) and decision 10 (real biology)**, which override the spec's floods, rain cloud, fermenter yield, self-benefit dial and three predictions.

## 1. The world (D6 decision 7)

A glowing microfluidic droplet chip under a fluorescence microscope: deep indigo dark field, golden pyoverdine glow, cyan droplet rims, rust-orange iron. The organisms are *Pseudomonas aeruginosa* rods with a polar flagellum. **Producers** are filled gold with a glow (pyoverdine is a yellow-green fluorescent siderophore). **Cheats** (non-producers) are hollow cyan outlines. Inside each droplet the player watches the real process (decision 10): golden siderophore molecules leave producers, pick up iron specks, and are taken in by *any* cell, cheats included. A droplet of cheats alone has no siderophore, so its iron sits unused and it stays dark and small. The culture flask is a glass channel at the bottom whose gold/hatched fill is the producer share. Accent: `#2C9DB0` (cyan-teal). Place: `pond`. CVD: producers versus cheats are filled versus hollow (checked in `?cvd=mono`).

## 2. One verb, four levels (D6 decision 9)

**Verb: tap (or swipe through) a droplet to split it in two.** The cells are shared at random between two equal halves. Then press **Grow** (dock, Enter). The droplets grow for four generations and drain back into the flask, and the next round's sample leaves the flask. Keyboard: arrows select a droplet, Space splits it, Enter grows, and M or F answers the one prediction. There is no timer (`untimed: true`).

| L | Name | Adds (one variable) | Setup | Idea and aha | Key number shown plainly | Star |
|---|---|---|---|---|---|---|
| 1 | Cheats inside | cheats sharing a public good | 32 cells, 60% producers, chip holds 2 droplets, 3 rounds | In any shared droplet cheats win: they skip the cost and still take the iron. Each droplet shows ▼ 75→68%. | `cost c = 0.15`, `benefit b = 1.2`, and "cheats pay nothing" | Discover: split in all three rounds |
| 2 | Small droplets | many small droplets | 16 cells, 50%, up to 8 droplets, 1 round | **Simpson's paradox.** Producers fall in every mixed droplet, yet producer clones bloom ×18, so the flask *rises*. | Price's equation as three numbers that add up, with bars: `between +17.4 + within −6.1 = total +11.3` (points) | **Predict** (the chapter's only prediction, and its aha): "Producers lost ground in every mixed droplet. After pooling: more or fewer?" (two dock buttons) |
| 3 | Clones | founders per droplet | 32 cells, 10%, up to 32 droplets, 3 rounds; goal 75% | Few founders make clone droplets. Relatedness r ≈ 1 ÷ founders. Producers spread when r × b > c. | Live as you split: the relatedness `r` measured from the droplets (review round), an r × b bar against a hatched c bar, and "spreads / break-even / falls" | Discover: 10% → 75% in three rounds |
| 4 (boss) | Equal shares | local competition | 32 cells, 50%, up to 32 droplets, 3 rounds | Each droplet sends back only as many cells as it started with (they visibly shrink back before draining). Clones now only *hold* producers level; mixed droplets lose them. | `between +0.0` every round | Transfer: end within 2 points of 50% |

`boss.inverts`: "Clone droplets stop helping when each droplet returns only what it started with." Unit stars: Discover needs L1 and L3; Predict is L2; Transfer is L4. Each level offers one star, so none offers all three.

**What if?** (every level, from a forced snapshot of the finished run). An automatic experimenter reruns the level with one lever: L1 *Single cells*; L2 *Two droplets*, *Single cells*; L3 *Equal shares*, *Four founders*; L4 *Pool by growth*. The card text quotes the rerun's own numbers.

**Cut from the spec (D6 decision 9):** the L1 drag-the-arrows predictions, the L2 "never flood" prediction and the boss's shaken/viscous predictions (one prediction remains, in L2); floods, the rain cloud, the founder-count hold gesture and the fermenter-yield meter; the self-benefit dial (the model now has no self-benefit at all, which removes the weak-altruism error outright; see §3); and the shaking/viscosity boss controls (the boss keeps Griffin's local-versus-global competition, the part that inverts the lesson).

## 3. Science

**Model.** Each round a sample of n cells leaves the flask with exactly round(n·p) producers (no sampling noise; the randomness is in how splits share cells). In a droplet with producer share f, each generation a producer grows by 1 + b·f − c and a cheat by 1 + b·f (b = 1.2, c = 0.15, 4 generations; designed). Pooled **by growth** (global competition), each droplet contributes all its cells. Under **equal shares** (local competition), each contributes as many cells as it was founded with, with its grown composition. The Price partition (Price 1972) is computed with founder weights: Δp̄ = Cov(w, p) ÷ w̄ + E(w·Δp) ÷ w̄. It is an identity, and the oracle checks it to 1e−12.

**No weak-altruism error (G4 sweep; West, Griffin & Gardner 2007).** The legacy L2 rewarded b ÷ k > c in a one-shot model where a founder got back its own 1/k share. That is self-benefit, so it is weak altruism. Here a cell's own siderophore is a vanishing share of a droplet holding many cells: f is the droplet's share, and the MODEL card says so. Inside every mixed droplet producers lose share every generation (oracle: all mixes). A lone producer among cheats grows less than each cheat beside it. The only route to spread is clone-mates: few founders mean that two cells in a droplet share a founder with chance about 1 ÷ founders, which is the relatedness r. Hamilton's rule r × b > c gives founders < b ÷ c = 8. The sim's strong-selection break-even is near 8 (measured: −0.024 to −0.028 at 8 founders; positive at 4, negative at 16). The MODEL card says Hamilton's rule is exact only for weak selection.

**Boss.** Equal shares make every w = 1, so the between term is exactly 0 and clones can only hold producers level. This is the logic of Taylor 1992 and the qualitative result of Griffin, West & Buckling 2004: the benefit of relatedness falls when subpopulations contribute equally. "In nature" adds that thicker media can still favour producers (Kümmerli et al. 2009), so local structure is not simply bad.

**Corrections carried from Wave 1 (G4, G6):** Chuang, Rivoire & Leibler 2009 is described as a shared signal in engineered *E. coli* (Why? real 2; MODEL L2). Price is cited as 1970 and 1972. The bridge no longer implies that random grouping stands in for kinship: "In Alarm Call, relatives paid for each other's safety. Here microbes share a costly good. Can kinship save it?" RECALL now asks the Hamilton-rule question with founders. MODEL, TAKE, RECALL and BRIDGE are overwritten; `TRANSFER.commons` is deleted.

**×N and designed tags:** b, c, founder counts and levels are designed; "4 generations ×N" is shown on the chip during growth (a real day's growth is many more generations); the cells drawn stand for millions (MODEL, ×N).

**Agency (D0 §3):** no individual "evolves, chooses or needs"; the player sets structure, never a cell's strategy (bible §3).

### References (refs ids)
- `griffin2004`: Griffin AS, West SA, Buckling A (2004) Cooperation and competition in pathogenic bacteria. *Nature* 430:1024–1027.
- `west2006`: West SA, Griffin AS, Gardner A, Diggle SP (2006) Social evolution theory for microorganisms. *Nat Rev Microbiol* 4:597–607.
- `wgg2007`: West SA, Griffin AS, Gardner A (2007) Social semantics: altruism, cooperation, mutualism, strong reciprocity and group selection. *J Evol Biol* 20:415–432.
- `buckling2007`: Buckling A, Harrison F, Vos M, Brockhurst MA, Gardner A, West SA, Griffin A (2007) Siderophore-mediated cooperation and virulence in *Pseudomonas aeruginosa*. *FEMS Microbiol Ecol* 62:135–141.
- `price1970`: Price GR (1970) Selection and covariance. *Nature* 227:520–521. `price1972`: Price GR (1972) Extension of covariance selection mathematics. *Ann Hum Genet* 35:485–490.
- `chuang2009`: Chuang JS, Rivoire O, Leibler S (2009) Simpson's paradox in a synthetic microbial system. *Science* 323:272–275.
- `hamilton1964`: Hamilton WD (1964) The genetical evolution of social behaviour I, II. *J Theor Biol* 7:1–52.
- `fletcher2009`: Fletcher JA, Doebeli M (2009) A simple and general explanation for the evolution of altruism. *Proc R Soc B* 276:13–19.
- `taylor1992`: Taylor PD (1992) Altruism in viscous populations: an inclusive fitness model. *Evol Ecol* 6:352–356.
- `kummerli2009`: Kümmerli R, Griffin AS, West SA, Buckling A, Harrison F (2009) Viscous medium promotes cooperation in the pathogenic bacterium *Pseudomonas aeruginosa*. *Proc R Soc B* 276:3531–3538.

### Needs sign-off (science coordinator)
- The Griffin 2004 wording: "producers did better when each subpopulation was founded by a single clone; that advantage shrank when every subpopulation contributed equally". Please check it against the paper's two treatments and its exact founding design.
- The `buckling2007` citation details.
- Whether to show c as "15% slower" anywhere. It is kept as "cost c = 0.15" because the growth law is additive (1 + b·f − c).

## 4. Tests (all on `V2_ONLY='0*,zz_*,commons.js'` builds in the scratchpad, plus one full build)

- `node tests/oracle.js BUILD commons`: **54 passed, 0 failed.** It checks the within-droplet loss in every mix, no self-benefit, clone growth (1 + b − c)^4, the Price identity (global and local, 400 random droplet sets), between = 0 under equal shares, no change with all clones under equal shares, and the founder sweep (falls at 32 and 16, break-even at 8, rises at 4, faster at 2 and 1). It also checks exact sample counts, that the L2 call is scored against the model, determinism and snapshot replay for all four levels, that all six What if? levers run to an end, that the expert earns every offered star on 20/20 seeds, that the best union of the five standard bots is ≤ 2 stars, that just meeting Hamilton's rule (4 founders) misses L3 and L4, and that the Interesting texts quote their own runs.
- `python3 tests/bots.py BUILD commons --seeds 1-40` (and `--untimed`): PASS. No bot earns three stars in any level.
- `node tests/lint_text.js BUILD commons`: 0 errors, 0 warnings. `sh tests/dup_globals.sh`: ok (every top-level name is prefixed `CM`/`CH_COMMONS_V2`).
- Monkey at 390×780 and 1280×720, seeds 1–4: 8/8 reach the end card. Calm, seed 5: end. Full build, seed 1: end. No console errors, NaN or warnings.
- Screenshots of every level and phase at both sizes, plus What if?, `?cvd=mono` and Calm: `python3 tests/commons_shots.py OUT [--whatif] [--query ?cvd=mono] [--calm]`. **Fixed after looking:**
  - the key-number band hid under a wrapped HUD and clashed with whispers, so it moved down beside the flask, and the HUD height is now measured from the DOM;
  - the Price panel overflowed the phone width, so it became three labelled pills with bars;
  - the pooled droplets left empty rings behind, so the real droplets now drain into the flask (under equal shares they first shrink back to their founders);
  - L2's one-round trace had decimal x ticks, so L2 uses the Price chart in the strip and on the level card;
  - a duplicated banner and whisper on a big rise;
  - "1 producer-only droplets" grammar;
  - units mixed between 0.174 and 17%, so every Price figure is now in percentage points with one decimal;
  - the HUD's Hamilton line was over 15 tokens;
  - the keyboard selection ring now shows only after a key is used.

## 5. Playtest script (designer and colleagues; D6 decision 4)

About 6–8 minutes. Use a phone if you can.
1. Open *The Commons* from the menu (Act 8). Read the card, then press Play. **Check:** can you say what you will do before the hand shows you?
2. L1: tap the big droplet when the hand shows you, then press Grow. Watch the ▼ labels. **Ask:** why did producers fall inside both droplets? Is "cheats pay nothing" clear?
3. L2: split the sample into 8 small droplets and grow. Before pooling, answer More or Fewer. **Ask:** did the answer surprise you? After pooling, do the three numbers (between + within = total) make sense?
4. L3: watch the r × b and c bars change as you split. Try a round with big droplets, then one with single cells. **Ask:** could you predict from the bars whether producers would rise?
5. L4: split everything into single cells. Watch the clones shrink back before they drain. **Ask:** why didn't producers rise this time? Try the What if? "Pool by growth".
6. **Feedback form** (1–5 scale, plus a comment): fun; clarity of the verb; clarity of the key numbers; did any control confuse you; did anything look like a symbol rather than a cell; anything you would cut.

## 6. Open items and engine requests
- None blocking. Possible later: a class-pool chart of L3 end shares across a class on one seed (teacher hook; `teacher.pool: 'trace'` is declared).
- D3's Cleaning Station still needs its own new boss (the siderophore boss now lives here, as D2 and D3 planned).

## 7. Review round (23 October 2026, same session; playtester, art director and adversarial biologist)

Played every level with Playwright at 390×780 and 1280×720 (plus `?cvd=mono` and What if? on L2–L3), screenshots in the scratchpad (`s3/rv_commons`, `s3/rv_commons2`). The intro card reads well and the ghost hand on the one droplet makes the first five seconds obvious; one verb, four levels, one prediction (D6 decision 9) and real cells, siderophore and iron throughout (decision 10). Problems found and fixed:

**Science and model read-outs**
1. **L3's r was not the relatedness of the player's droplets.** It showed `1 ÷ mean founders` (`nd/n`), so a player who split only the mixed droplets (leaving one big all-cheat droplet) saw `r = 0.34` while every droplet was a clone, and two 16-cell droplets at 97% showed "r = 1/16". The band, HUD and data row now show **r measured from the droplets**: the between-droplet share of the variance in type, `Σ n(f − p)² ÷ (N p(1 − p))` (`CM.rel`). It is 1 for all-clone droplets, 0 for one droplet, and about 1 ÷ founders for random even splits (oracle: 0.485, 0.228, 0.095 at 2, 4, 8 founders against the exact (32/k − 1) ÷ 31). With it, r × b > c calls the sign of the change in 97.6% of 2,938 random uneven splits (oracle), against about 95% for 1 ÷ founders, and it also explains why 8 founders sit just below break-even (r ≈ 0.097 < c/b = 0.125). The MODEL card and Why? maths say how r is measured and that 1 ÷ k is its random-founder value. `CM.r` stays as that expectation.
2. **L3 "Interesting: producers moved only +3 points" at 97%.** The "slow" text blamed big droplets for a small change when producers had no room left to rise. It now needs the round to start at ≤ 80% (`slowRound`), and says "changed by" (the change can be negative). Oracle: never fires above 80% on 20 expert seeds.
3. **L2's card hid the aha.** The "pure" Interesting text replaced the paradox take on every good run. It is gone: a paradox run shows the take ("fell inside every mixed droplet yet rose overall"); runs without the paradox get a text chosen from the run (`flat` for one or two mixed droplets, new `fell` for an overall fall, new `sorted` when no droplet mixed both kinds), which the card shows instead of the take, so the take is never shown when false.
4. **L2's ask said "lost ground in every mixed droplet" even when no droplet was mixed.** The HUD now picks `askPure` ("No droplet mixed both kinds…") in that case.
5. **Boss wording.** "Clone droplets stop helping" was wrong for this model and for Griffin 2004 (the relatedness benefit is reduced, not removed): clone droplets still stop the loss. Now: "Under equal shares, clone droplets only stop the loss; they cannot raise producers." The unit take no longer says relatives "grow apart": "Cooperation spreads when clone-mates grow together and compete with other groups."
6. **Pyoverdine is yellow-green, not golden.** The intro now says the siderophore is "drawn gold"; the Why? text already says yellow-green fluorescent.
7. **Cheats alone do not grow at all here.** Now stated in the L1 MODEL simplification ("real ones grow a little"); the whisper says "no siderophore, iron locked away" rather than "no iron".

**Clarity (decision 9: show the key number plainly)**
8. L1's band showed "cost c = 0.15 · benefit b = 1.2" without saying who pays. It now shows the growth law itself, `producer ×(1+b·f−c)` and `cheat ×(1+b·f)`, with `f = producer share · b = 1.2 · c = 0.15` beneath ("cheats pay nothing" during growth).
9. The Price chart in the strip and on the L2 card said "17%" while the pills said "+17.4" points; the chart now formats in points too ("+17.4 pts").

**Colour-blind safety:** the c bar in L3 is hatched like the cheats (it was solid cyan beside a solid gold r × b bar). Checked in `?cvd=mono`.

**Kept, on purpose:** L1's Discover (split in all three rounds) is easy, because L1's job is to show the within-droplet loss three times; the boss's Transfer is earned by splitting to single cells, the same move that won L3, because the lesson is the different *result* (held, not raised). Both are recorded for the designer's playtest.

**Tests after the round** (`V2_ONLY='0*,zz_*,commons.js'` build in the scratchpad):
- `node tests/oracle.js BUILD commons`: **64 passed, 0 failed** (new: measured r at 0/1/null and for random splits of 2, 4, 8; Hamilton's sign agreement > 95%; L2 paradox take vs Interesting texts on 20 seeds; "slow" headroom; the old "pure" check replaced).
- `node tests/lint_text.js BUILD commons`: 0 errors, 0 warnings. `sh tests/dup_globals.sh`: ok.
- `python3 tests/bots.py BUILD commons --seeds 1-40` and `--untimed`: PASS (no bot earns three stars).
- Monkey `commons 1,2,3 --vp 390x780,1280x720`: 6/6 reach the end card, no console errors. Screenshot script: 0 errors at both sizes, in `?cvd=mono` and through What if?.
