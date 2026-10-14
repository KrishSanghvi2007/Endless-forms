# R7: Fact-check of R2 (Endless Forms, Sections V–VII)

*Adversarial science check of `R2_endless_forms_sections_V-VII.md`. Where this file and R2 disagree, this file wins.*

**Which code was checked.** R2 reviewed the committed source (commit `b07d786`). All verdicts below are against that version, and line numbers refer to it. While this check ran, an uncommitted "science sweep" was editing the same files (ch3, ch6–ch9, ch11, ch12, ch18, ch19, ch22, ch24) and has already applied many of R2's fixes. The correction list at the end gives each item's status in that working tree as of 2026-10-14. Re-check before acting, because the sweep may still be running.

**Method.**
- Read R2 line by line and extracted every claim of two kinds: (a) what the game says or does, and (b) R2's own science, formulas and citations.
- Read the committed source for all 14 chapters in the slice: `ch3, ch5` (Alarm v1, which v2 inherits from), `ch6, ch7, ch8, ch9, ch11, ch12, ch18, ch19, ch22, ch24`, `ui.js` and `ch99.js`.
- Ran the game's own chapter code in Node (a harness loaded `core.js` and the chapter files) to check every number R2 quotes. That covered:
  - the Two Sizes run (20 seeds);
  - the Brood best-brood sequence (200 seeds) and the fig best responses;
  - the Raffle optimum and the Level 2 doses;
  - the Meadow spur optima and the Lek display optima;
  - the Live Fast dynamic programme;
  - the Nest best value for each clutch size;
  - the Commons jars and a random-grouping counterfactual;
  - the Spindle test power;
  - the Crowd Level 2 crowd target.
- Simulated the Forager conveyor (2,000 rounds per condition) with a simple "biggest item on the belt first" policy.
- Checked citations against the literature. Web checks for Chuang et al. 2009, Herre 1985 and Richardson et al. 2001 are listed at the end.

**Headline.**
- R2 is accurate. Every number it quotes reproduced: 49% from "tiny" in Two Sizes, the 10-10-10-0-0-0 Brood solution, the 22.5 / 29.4 / 39.2 cm spurs, the 23% helmet threshold, the female doses of 1 and 4–5 in Raffle Level 2, 100% fox effort, and free eggs in the Nest. Its citations are all real and correctly attributed.
- Nothing R2 says is flatly wrong. Its weaker points are overstatements:
  - Suppressors are "never played": Spindle Level 3 does play target-site resistance.
  - The generalist line is "the opposite of plastic": a flat *yield* norm can come from plasticity in other traits.
  - The Notes "spoil" eight chapters: they spoil at least twelve.
  - The missing concepts are "absent from the whole game": selfing appears in three places.
- R2 missed some real errors. The worst:
  1. The live Alarm Call shows a **maths text inherited from v1** (cost 0.18, threshold 0.45). That contradicts its own costs (0.22 and 0.08).
  2. **The Alarm Level 2 end card states a rule its own data break.** It says half-siblings meant breeding won, but in spring 3 helping half-siblings beats a poor patch (0.30 vs 0.225).
  3. **Crowd Level 2 aims the crowd at the wrong distribution.** It uses a total weight of 40 instead of 32, so the poorer feeder pays better in 71% of rounds, while the card says the crowd "balances competitive weight".
  4. **The Live Fast egg-size end card states the Smith–Fretwell condition wrongly.**
  5. **Live Fast credits the senescence prediction to Williams 1966** instead of Williams 1957.

**Verdict totals.** Section A has 77 rows: 64 CONFIRMED, 13 PARTLY RIGHT, 0 WRONG. Section B has 49 rows: 47 CONFIRMED, 2 PARTLY RIGHT, 0 WRONG. Section C lists 22 errors R2 missed.

---

## A. R2's claims about the game

| # | R2 claim | Verdict | Correction / source |
|---|---|---|---|
| A1 | Code map: Brood and Alarm v2 in `ch7.js`, Alarm v1 in `ch5.js`, Two Sizes / Raffle L1 / Forager L1–3 in `ch3.js`, and so on | CONFIRMED | Every file is right. Two line references are off by one: the Sex subtitles are at `ui.js` **L7**, not L6. The live chapter list is `ALL` in `boot.js`, which registers `CH_ALARM` (v2). |
| A2 | Almost every chapter is an optimisation worksheet scored as "% of the best possible" | CONFIRMED | Counted: Brood, Lek, Raffle, Meadow, Nest, Live Fast, Forager, Crowd and Shape-shifters L1. That is 9 of 14. |
| A3 | The population rarely responds; the adaptationist step is never shown | PARTLY RIGHT | Populations do change on screen in Two Sizes (80 generations), Meadow L2 (moth tongues), Spindle L3 (drive cage), Commons L2 and Many L1. What is never shown is the *player's* strategy competing as an allele. Brood and Crowd populations follow scripts. |
| A4 | Brood: 12 seasons; acts of 3, 3 and 6; 1–4 foundresses | CONFIRMED | `FIGN: [1,2,4,2,1,3]` (L96). |
| A5 | Brood: the open-population payoff is linear in sons, so the best brood is always a corner | CONFIRMED | `value()` L108–113 is B(d + s(1 − m)/m), linear in s, in both acts 1 and 2. |
| A6 | Brood: male share m relaxes 45% toward a scripted target whatever anyone does; from 20%, acts 1–2 are solved by 10 sons ×3, then 0 ×3 | CONFIRMED | L130. With noise removed, m runs 0.20 → 0.34 → 0.41 → 0.45 → 0.40 → 0.37. Over 200 seeded runs the best sequence was exactly 10,10,10,0,0,0 in 198. In the other 2, season 6 was a near-tie. |
| A7 | "A disease has just killed most males" (L89) muddles a demographic shock with sex-ratio evolution | CONFIRMED | The `ideas` text even explains m as "more mothers make sons" (a strategy change), which contradicts the shock story. |
| A8 | Brood uses Hamilton's diploid (n − 1)/2n (L94); "found exactly that" (L93) overstates Herre | CONFIRMED | The same maths text also relies on haplodiploidy ("unmated daughters could only lay sons") while using the diploid formula. The game's integer best responses are 3, 3 and 4 sons for n = 2, 3, 4. Hamilton's ESS gives 2.5, 3.3 and 3.75; the haplodiploid ESS gives 2.1, 3.0 and 3.5. |
| A9 | Haplodiploidy as the mechanism of sex control is missing | CONFIRMED | Only the one implicit maths sentence quoted in A8 touches it. |
| A10 | There is no wasp anywhere in the chapter | CONFIRMED | `draw()` L141–156 draws dots, eggs and a gradient disc. |
| A11 | Two Sizes is a fair implementation of Parker, Baker & Smith 1972 | CONFIRMED | Fitness is (M/m) × mean f(m + m′), with f(S) = S⁴/(S⁴ + 1) (L175) and random fusion. |
| A12 | Holding the slider at "tiny" for all 12 spawnings gave 49% in 5 of 5 runs; three stars need 40% | CONFIRMED | 20 of 20 seeded runs ended at 49.1–49.4%. Size 0.05 gives about 47%. "Large" gives 0%, because the starting sea of size-0.5 cells makes provisioning worthless. |
| A13 | The Two Sizes Notes probe table prints the fitness of five sizes (L243–245) | CONFIRMED | — |
| A14 | Two Sizes is missing the competing hypotheses (gamete limitation, cytoplasmic conflict) | CONFIRMED | True of the committed text. |
| A15 | Lek subtitle "Mate choice and runaway"; there is no runaway anywhere | CONFIRMED | `ui.js` L7 is the only occurrence in the source. |
| A16 | Lek L1's "There is no going back" (L133) is an odd model for a lek | CONFIRMED | — |
| A17 | Handicap optima of 2.1, 3.75 and 6.6 are stated in the maths text (L137) and drawn in Notes (L221) | PARTLY RIGHT | `bestD()` gives 2.10, 3.75 and 6.55. The maths text rounds them to "about 2, 4 and 7". The Notes chart (L221) does draw the payoff curves. |
| A18 | Lek L1 shows "numbers floating over identical birds" | PARTLY RIGHT | The birds are not identical: each displaying bird's air sacs and tail are drawn scaled to its reading (`bird(…, m.x)`, L204). Quality is still read from a printed number. |
| A19 | Raffle core maths is right: s/(s + R), equalise the marginal gain (L260) | CONFIRMED | `optimum()` uses s = √(R/λ) − R. For rivals R = 0, 40, 20, 100, 0, 60 the best plan is 1, 30.5, 29.8, 11.4, 1 and 26.3 units, for 68.8 eggs. An even split gets 90% of that. |
| A20 | "A virgin is a raffle with only your tickets" (L261) and "spends almost nothing on virgins" (L295) hold only because the model forbids later remating | CONFIRMED | Rivals are only ever *before* you. |
| A21 | Citing dung flies (L259) for a fair raffle is incongruous, because *Scathophaga* shows last-male displacement | PARTLY RIGHT | The text does not say dung flies are a fair raffle. It cites them as founding the field. Putting the two side by side invites that misreading, so adding the last-male caveat is right. |
| A22 | The rival sequence is fixed and unseen, yet scored against an omniscient plan | CONFIRMED | `RIV` is constant, and `optimum()` knows all six females. Each female's rivals are revealed only at her turn. That contradicts R2's own "known rival sperm" in its Play line. |
| A23 | Raffle L2: "best for her" is above zero (dose 1 for young females, 4–5 for old) | CONFIRMED | Female-best doses for the five females are 1, 1, 4.5, 4.5, 1. Male-best doses are 8.5, 6.5, 9, 4.5, 9. The old female with few rivals is the "no conflict" case (4.5 = 4.5). R2's inference, that her laying is suboptimal without male manipulation, is a correct reading of the model. |
| A24 | There is no MODEL caveat for the Raffle | CONFIRMED | `ch99.js` `MODEL` has no `raffle` key. |
| A25 | Spindle: six litters of eight; ten eggs; two cages watched for 20 generations | CONFIRMED | Detail: cage 1's target is fixed. The player chooses only in cage 2, and can release up to three times. |
| A26 | Spindle L1 is a good statistics lesson (exact binomial test) | CONFIRMED | `binomP` sums every outcome no more likely than the observed one. Power to tell 75% from 50% at α = 0.05: 10% with 8 pups, 61% with 24, 93% with 48. |
| A27 | The t-haplotype is simplified to a sperm "poison" | CONFIRMED | The real system is distorters plus a responder: all of a carrier male's sperm are impaired, and only t-bearing sperm are rescued. |
| A28 | The genome's suppressors, which the end card names as the crux (L19), are never played | PARTLY RIGHT | Level 3 cage 1 *does* play host resistance: R alleles from faulty repair spread and rescue the population. What is never played is unlinked suppressors of natural drive (t, centromere drive). |
| A29 | Spindle is missing sex-ratio drive | CONFIRMED | — |
| A30 | Spindle L2 reduces to "reorient when facing the polar body, otherwise wait" | CONFIRMED | Each reorientation faces the egg 72% of the time and risks an error 22% of the time, repaired after 0.9 s. The division timer is hidden, at 3.8–6.8 s. |
| A31 | Spindle L3 has one obvious choice (doublesex) | CONFIRMED | `rho` is 0.0008 against 0.35, and the real text gives the answer away. |
| A32 | Meadow subtitle "Pollination and fertilisation"; no fertilisation content | CONFIRMED | `ui.js` L7. |
| A33 | The syndrome text sensibly says syndromes are tendencies (L24) | CONFIRMED | — |
| A34 | The moth is now usually treated as a full species, *Xanthopan praedicta* | CONFIRMED | The committed text has *X. morganii praedicta*. |
| A35 | Meadow L2's best spur is always mean tongue + 4–4.5 cm (22.5 / 29.4 / 39.2 cm for tongues of 18 / 25 / 35 cm) | CONFIRMED | The offsets are 4.5, 4.4 and 4.2 cm. |
| A36 | Meadow L1 is a 48-combination lock | CONFIRMED | 4 colours × 3 shapes × day/night × 2 nectar levels. The optima are: blue short tube by day with rich nectar (alpine); red long tube with little nectar (cloud forest); white long tube at night with rich nectar (desert). |
| A37 | Alarm L1: eight attacks, with the timer shrinking from 3.0 s to 1.8 s | CONFIRMED | `lim()` = max(1.8, 3.0 − 0.18i). |
| A38 | **The hawk and coyote costs are inverted** relative to the chapter's own text and to Sherman | CONFIRMED | `genRound` L180 charges hawk 0.22 and coyote 0.08, and `ideas` L175 justifies that. The real text (L174) says the opposite. The resulting thresholds are relatedness 0.55 for a hawk and 0.20 for a coyote. |
| A39 | "Ochre collar … r = ½" (L175) ignores multiple paternity | CONFIRMED | — |
| A40 | Alarm L2 counts only indirect fitness for helping | CONFIRMED | `yearVals`: help = 1.2 × r(sibling). There is no co-breeding and no territory inheritance. |
| A41 | Alarm Call has no MODEL caveat | CONFIRMED | — |
| A42 | **Nest L1: eggs are free**, so a bigger clutch never lowers the score (`bestVal1`, L30) | CONFIRMED | Best achievable value for clutches of 1–7: ordinary spring 1, 2, 3, 3.4, 3.4, 3.4, 3.4; cold spring 1, 2, 2.4, 2.4, …; costly spring 4.4, then 4.79 for every larger clutch. It never falls. |
| A43 | The cold-spring surprise arrives after laying, but scoring assumes foreknowledge | PARTLY RIGHT | The toast appears at feeding, and `bestVal1` uses the cold rate. But the level title shown *while laying* already reads "A spring that turns cold". And because eggs are free, the clutch choice cannot lose points anyway. |
| A44 | Nest L2: the inclusive-fitness accounting is right, but the parent is a passive lottery weighted by begging | PARTLY RIGHT | The accounting (self + ½ × each sister) is right. The lottery weights need as well as begging: (5 − m)/5, with a floor of 0.15 (L46). R2's real point stands: the parent's rule never evolves. |
| A45 | Nest L3 is fine (71% break-even) | CONFIRMED | Break-even is 1/1.4 = 0.714. |
| A46 | Commons L1 (Simpson's paradox, Price partition) is correct and well shown | CONFIRMED | Producers fall in every jar, yet rise overall from 48.75% to 53.7%. The two Price terms sum exactly to the total. |
| A47 | **Commons L2 teaches weak altruism as if it were altruism** | CONFIRMED | With fitness 1 + bp − c, a producer's expected fitness minus a cheater's is exactly b/k − c, at every producer frequency p. So "b/k > c" is the condition for a net direct benefit to the actor. |
| A48 | "In randomly founded groups r is 1 in the group size" (L11) is defensible only in Pepper's whole-group accounting | CONFIRMED | Counting only others, relatedness in random groups is 0. |
| A49 | The `ch99.js` L62 bridge card implies that grouping can substitute for kinship | CONFIRMED | The card reads, verbatim: "What if helpers are simply grouped together?" With no self-benefit, a producer's fitness advantage is −c in every group. |
| A50 | The L1 jars are hand-made with high variance, and the player is never told that assortment is needed | PARTLY RIGHT | The L1 card *does* say "cooperation needs groups that differ". What it never says is that they must differ *more than random grouping gives*. Checked: with b = 0.8, c = 0.2 and random groups of 20 at p = 0.4875, producers fall to 0.457 in one round. |
| A51 | The Chuang et al. 2009 public good was a quorum signal inducing resistance, not an antibiotic-degrading product (L11) | CONFIRMED | Producers express the RhlI synthase. Its C4-HSL signal switches on a chloramphenicol-resistance gene in every cell, producer or not. |
| A52 | The Commons Notes print b/k > c (L58) | CONFIRMED | — |
| A53 | Many L1 matches Ratcliff et al. 2012; settling ∝ N^(2/3) is correct Stokes scaling | CONFIRMED | For compact clusters, radius ∝ N^(1/3) and terminal velocity ∝ radius², so velocity ∝ N^(2/3). |
| A54 | Many L2's cheater mutation rate is 6% per division (`MU2`, L3), orders of magnitude off | CONFIRMED | Applied at every birth. |
| A55 | The single-cell bottleneck is stated, not played (L54) | CONFIRMED | — |
| A56 | Many is missing germ–soma division, *Dictyostelium* and the major-transitions framing | CONFIRMED | True of the committed text. |
| A57 | Live Fast: among foxes the optimum is 100% effort at every age, so L1 is "solved by slider-right, eight presses" | PARTLY RIGHT | The dynamic programme gives r = 1.00 at every age from 1 to 8. But at full effort a fox survives each year with probability 0.5 × 0.3 × (1 − 0.06 × age) ≈ 14%, so its life usually ends after one or two presses, not eight. On the island the optimum starts at 60% and reaches 100% by age 6. |
| A58 | Ageing is imposed, ×(1 − 0.06 × age) (L18), yet the text cites Austad's slower-ageing opossums (L10) | CONFIRMED | The model cannot produce a difference in ageing rate. |
| A59 | Live Fast L3 reduces density dependence to "empty: 8 > 3; crowded: 12 > 8" (L42) | CONFIRMED | — |
| A60 | The "foxes" read as fish | CONFIRMED | Each is an orange ellipse with a triangular tail (L48). |
| A61 | The Forager has five levels, as R2 describes them | CONFIRMED | Level 5 has 10 visits (`T5`). |
| A62 | "When large ones were common the birds ignored the small ones" (L10) overstates Krebs et al. 1977 | CONFIRMED | The tits showed partial preferences. |
| A63 | The conveyor shows prey for 3.2 s, so encounters are simultaneous; a look-ahead player can beat the "best", and the 100% cap hides it | CONFIRMED | Simulated with a simple policy: take the big worm if one is on the belt, otherwise the oldest small one. It beat the scored best (`dietBest`, which is the better of strict generalist and strict specialist) in 38% of rounds when big worms were scarce and 60% when common, by 3–5% on average. `Math.min(1, eff)` hides this. Strictly, the edge comes from choosing among items already visible, not from look-ahead. |
| A64 | Support for the energy-budget rule is mixed | CONFIRMED | See B39. |
| A65 | The Forager Notes print the optimal load per trip (L156) | CONFIRMED | — |
| A66 | Forager L1 and L3 are the same mechanic | CONFIRMED | The maths text says so itself (L11). |
| A67 | The Crowd's IFD maths is right, and the cascade follows Bikhchandani et al. 1992 correctly | CONFIRMED | A cascade starts once revealed clues differ by 2 or more, and the player's own clue breaks ties (L47, L54). |
| A68 | "So each got about the same intake" (L10) is an inference, not Milinski's finding | CONFIRMED | — |
| A69 | The crowd converges on the IFD regardless of the player (L34) | CONFIRMED | In Level 2 it converges on the *wrong* point. See C3. |
| A70 | The Shape-shifters threshold (q > 0.15/0.65 ≈ 23%) is correct | CONFIRMED | 0.8q + 0.85(1 − q) = 0.3q + (1 − q) gives q = 0.231. |
| A71 | The "Generalist" line (6 → 6, L77) is canalised, the opposite of plastic, and the chapter makes it the winning answer "without saying so" | PARTLY RIGHT | Its *yield* norm is flat, so it is not plastic in yield. But flat fitness across environments is often *produced* by plasticity in other traits (fitness homeostasis), so "the opposite of plastic" is too strong. The end card does group the generalist under bet-hedging ("Plasticity and bet-hedging are two answers"), though it never says the line is not plastic. |
| A72 | The twenty-season geometric-mean scenario is computed analytically and never shown | CONFIRMED | `score2` uses √(cold × warm). |
| A73 | Shape-shifters is missing genetic assimilation, polyphenisms, costs and lags of plasticity, and diversified bet-hedging | PARTLY RIGHT | Diversified bet-hedging (seed dormancy) is *named* in the real text (Cohen 1966; Venable 2007) but not played. The rest are absent. |
| A74 | The Notes tab spoils the optimum in 8 chapters (Forager, Lek, Two Sizes, Live Fast, Plastic, Commons, Nest, Crowd) | PARTLY RIGHT | True for all 8, and understated. The Notes also print the best units per female in Raffle, the relatedness needed to call in Alarm, the best spur in Meadow L2, and the value of the next son in Brood. |
| A75 | "% of the best possible" is the score in 9 of 14 chapters | CONFIRMED | See A2. |
| A76 | `ch99.js` MODEL caveats cover only Many and Crowd in this slice | CONFIRMED | — |
| A77 | Every concept in the "missing concepts" list is "absent from the whole game (checked by grep)" | PARTLY RIGHT | Selfing appears in Equilibrium HW (a self-fertilising mode), in Doubling's model (50% selfing, `ch99.js` L121) and in Mendel (selfed plants). Ageing appears only as an imposed term. Confirmed absent from Endless Forms: Bateman/OSR, runaway, alternative tactics, TSD, eusociality, brood parasitism, senescence theory, imprinting, self-incompatibility, greenbeards and cultural evolution. |

---

## B. R2's own science, formulas and citations

| # | R2 statement | Verdict | Correction / source |
|---|---|---|---|
| B1 | Fisher's argument is about a heritable strategy invading (Shaw & Mohler 1953) | CONFIRMED | Shaw & Mohler 1953, *Am Nat* 87:337. Düsing (1884) made the argument before Fisher. |
| B2 | If mothers' strategy is genetically 1:1, the sex ratio rebounds in one generation after a male die-off, with no selection | CONFIRMED | Offspring sex ratio is set by mothers. Mortality after the period of parental investment does not move the ESS. |
| B3 | The haplodiploid, inbreeding-corrected ESS is (n − 1)(2n − 1)/[n(4n − 1)] (Taylor & Bulmer 1980) | CONFIRMED | 0, 0.214, 0.303 and 0.35 for n = 1–4, against the diploid 0, 0.25, 0.333 and 0.375. Hamilton (1979) is also a source for the formula. |
| B4 | Herre 1985 tested the haplodiploid, inbreeding-corrected prediction | CONFIRMED | Herre 1985, *Science* 228:896. His model used inbreeding F = 1/(4nₕ − 3) with haplodiploid weighting. |
| B5 | *Nasonia* females arriving second adjust their sex ratio (Werren 1980) | CONFIRMED | *Science* 208:1157. |
| B6 | A *Wolbachia* or sex-ratio driver as a boss, with suppressors | CONFIRMED | Sound biology. |
| B7 | Levitan 1996; Lehtonen & Kokko 2011; Hurst & Hamilton 1992 | CONFIRMED | *Nature* 382:153; *BES* 65:445; *PRSB* 247:189. |
| B8 | Lek females compare males simultaneously, revisit and copy (Gibson, Bradbury & Vehrencamp 1991; Gibson 1996) | CONFIRMED | *Behav Ecol* 2:165; *BES* 39:55. |
| B9 | The handicap level is fine (Grafen 1990) | CONFIRMED | Nuance: the game models only the sender. Female response, d/(d + 5), is fixed, so honesty is assumed rather than tested. |
| B10 | Kirkpatrick & Ryan 1991; Rowe & Houle 1996 (genic capture); Andersson 1982 (widowbirds) | CONFIRMED | — |
| B11 | In Parker's risk models a first male "invests in proportion to the chance of later rivals" (Parker 1990; Parker et al. 1997) | PARTLY RIGHT | The ESS ejaculate *rises* with risk, but not strictly in proportion. Say "rises with". |
| B12 | Real males sometimes give virgins more (Wedell, Gage & Parker 2002) | PARTLY RIGHT | The review exists (*TREE* 17:313–320) and the claim is plausible where first-male precedence holds. But a review is weak support for a specific behavioural claim, and I could not confirm it states this. Cite a primary study. |
| B13 | *Scathophaga* is the classic case of last-male displacement, P2 ≈ 0.8 | CONFIRMED | Parker 1970. |
| B14 | Parker's copulation-duration result is a marginal-value prediction (Parker & Stuart 1976) | CONFIRMED | *Am Nat* 110:1055. |
| B15 | Chapman et al. 1995, Wigby & Chapman 2005 and Rice 1996 are correctly cited | CONFIRMED | Rice's experiment ran 41 generations. |
| B16 | Horns versus testes (Simmons & Emlen 2006); hens eject subordinate males' sperm (Pizzari & Birkhead 2000) | CONFIRMED | *PNAS* 103:16346; *Nature* 405:787. |
| B17 | The Spindle references are accurate: Lyon 2003, Chmátal et al. 2014, Akera et al. 2017, Malik & Henikoff 2001, Kyrou et al. 2018 | CONFIRMED | The centromere-drive hypothesis paper is usually Henikoff, Ahmad & Malik 2001 (*Science*). Malik & Henikoff 2001 is the Cid adaptive-evolution paper; both fit. Kyrou's cages collapsed in roughly 7–11 generations. |
| B18 | The t-haplotype works by distorter/responder | CONFIRMED | — |
| B19 | X-drive occurs in *Drosophila* and stalk-eyed flies | CONFIRMED | — |
| B20 | Nilsson 1988; Wasserthal 1997; Minet et al. 2021 | CONFIRMED | — |
| B21 | The *Mimulus* YUP swap (Bradshaw & Schemske 2003); rare S-alleles sire more seeds (Wright 1939) | CONFIRMED | — |
| B22 | Whistles at hawks are largely self-preserving (Sherman 1985); nepotism belongs to the costly trill at terrestrial predators (Sherman 1977) | CONFIRMED | *BES* 17:313; *Science* 197:1246. |
| B23 | Belding's litters are often multiply sired (Hanken & Sherman 1981); females treat full and half sisters differently (Holmes & Sherman 1982) | CONFIRMED | *Science* 212:351; *Am Zool* 22:491. |
| B24 | Subordinate Seychelles warbler females often gain maternity (Richardson et al. 2001) | CONFIRMED | *Mol Ecol* 10:2263: 44% of helpers bred, producing 15% of all young. The direct-benefits analysis is Richardson, Burke & Komdeur 2002 (*Evolution*). |
| B25 | Honest signalling of need (Godfray 1991) versus scramble competition (Parker, Royle & Hartley 2002) | CONFIRMED | — |
| B26 | Mock 1984; Anderson 1990 | CONFIRMED | Anderson's birds were then called masked boobies; they are now Nazca boobies. |
| B27 | Haig's kinship theory of imprinting; Igf2 and Igf2r | CONFIRMED | Igf2 is paternally expressed and Igf2r maternally expressed. |
| B28 | Cuckoo-host recognition as a signal-detection problem (Davies 2000) | CONFIRMED | — |
| B29 | Weak altruism in Wilson's sense (West, Griffin & Gardner 2007); Pepper's whole-group accounting | CONFIRMED | Wilson coined "weak altruism" (1979, 1990). Pepper 2000, *J Theor Biol* 206:355. |
| B30 | With zero self-benefit, randomly founded groups never favour producers | CONFIRMED | The fitness difference is −c in every group. |
| B31 | Siderophores and kin competition (Griffin, West & Buckling 2004); invertase snowdrift (Gore et al. 2009) | CONFIRMED | — |
| B32 | Settling ∝ N^(2/3) is a correct Stokes scaling | CONFIRMED | See A53. |
| B33 | 6% per division is orders of magnitude too high | CONFIRMED | Per-gene somatic inactivation rates are around 10⁻⁶–10⁻⁷ per division. |
| B34 | Strassmann, Zhu & Queller 2000; Maynard Smith & Szathmáry 1995 | CONFIRMED | — |
| B35 | Austad 1993 is a result about the evolution of senescence | CONFIRMED | *J Zool* 229:695. |
| B36 | Abrams' (1993) caveat on extrinsic mortality and senescence | CONFIRMED | *Evolution* 47:877. |
| B37 | van Noordwijk & de Jong 1986; Reznick et al. 1997 | CONFIRMED | — |
| B38 | Krebs et al. 1977 found partial preferences | CONFIRMED | — |
| B39 | Animals are usually risk-averse over amounts (Kacelnik & Bateson 1996) | CONFIRMED | *Am Zool* 36:402. |
| B40 | Kacelnik 1984, Charnov 1976, Lima & Dill 1990, Caraco et al. 1980, Stephens 1981 | CONFIRMED | — |
| B41 | Producer–scrounger flockmates (Barnard & Sibly 1981) | CONFIRMED | — |
| B42 | Unequal intakes (Milinski 1984; Harper 1982); undermatching is the norm (Kennedy & Gray 1993) | CONFIRMED | — |
| B43 | Information cascades (Bikhchandani, Hirshleifer & Welch 1992) | CONFIRMED | — |
| B44 | Tollrian 1995, Agrawal et al. 1999, Clausen–Keck–Hiesey, Cohen 1966, Waddington 1953 | CONFIRMED | — |
| B45 | Bayesian threshold 0.15/0.65 | CONFIRMED | See A70. |
| B46 | Missing-concepts science: Trivers 1972; Kokko & Jennions 2008; Sinervo & Lively 1996; Charnov–Bull; Trivers & Hare 1976 (3:1 vs 1:1); Ratnieks 1988; Hughes et al. 2008; Reeve 1989; Keller & Ross 1998 | CONFIRMED | Nuance for "Who Cares?": Kokko & Jennions 2008 show that the OSR alone does not decide which sex competes (adult sex ratio and mortality matter too). Do not make the OSR the only driver. |
| B47 | Warming feminises turtle beaches | CONFIRMED | In most turtles, warm nests produce females. |
| B48 | Medawar–Williams–Hamilton senescence theory | CONFIRMED | — |
| B49 | Fire-ant workers kill queens lacking Gp-9 b (Keller & Ross 1998) | CONFIRMED | *Nature* 394:573. |

---

## C. Game science errors in this slice that R2 missed

Lines refer to the committed source.

| # | Where | Error | Severity | Fix |
|---|---|---|---|---|
| C1 | Alarm Call maths text (`ch5.js` L102, inherited by `CH_ALARM` in ch7) | The live chapter's maths tab says calling "adds 0.18 to your risk … more than 0.18 ÷ 0.4 = 0.45". The live code charges 0.22 or 0.08 (thresholds 0.55 and 0.20). The text also says a sibling "carries half your genes". | High | Make the text cost-general, and say "shares half your genes by descent, on average". |
| C2 | Alarm L2 end-of-level note (`ch7.js` L204; same wording in v1 `ch5.js` L139) | "Breeding won … when the nestlings were only half-siblings" is false in spring 3. With no territory free (q = 0.15) and half-siblings, helping gives 1.2 × ¼ = 0.30 and breeding gives 3 × 0.15 × ½ = 0.225, so helping wins. | Medium | State the real rule: compare 1.5q with 1.2r. |
| C3 | Crowd L2 crowd update (`ch19.js` L35) and Notes (L72) | The crowd targets 40 weight units × rate share, but the total competitive weight is 8 × 2 + 16 = **32**. Simulated: the rich feeder holds 72.5% of the weight against an IFD of 67%, and the poorer feeder pays better in 71% of rounds. The end card says "the crowd balances competitive weight". The Notes IFD split shows heads (16 : 8) labelled "in weight". | Medium | Use 32. Show the weighted split. |
| C4 | Live Fast egg-size end card (`ch18.js` L37) | "The best size is where one more unit of yolk per egg buys as much survival as a whole extra egg would" is not the Smith–Fretwell condition. | Medium | "…where a unit of yolk added to an egg buys as much survival as the same unit spent on more eggs (the tangent from the origin)." |
| C5 | Live Fast real text (`ch18.js` L10) | The prediction that high extrinsic mortality favours faster senescence, which Austad's opossums test, is Williams **1957**. Williams 1966 is about reproductive effort. | Low–Medium | Cite Williams 1957 for ageing and keep 1966 for effort. Add "ageing here is fixed". |
| C6 | Shape-shifters real text (`ch18.js` L73) | It conflates conservative bet-hedging (the steady generalist the game rewards) with diversified bet-hedging (desert seed dormancy, its only example). | Low–Medium | Name both kinds. |
| C7 | Nest maths text (`ch11.js` L11) | "The most fledglings come from floor(F ÷ 6) well-fed chicks" contradicts the code, which counts a 4-feed chick as 0.4. In an ordinary spring (22 feeds) the game's own best is **4** eggs (3.4 fledglings), not floor(22/6) = 3. | Low | Add "plus one part-fed chick if 4 or more feeds are left". |
| C8 | Brood end card (`ch7.js` L138) | "The population settled near X% males by number, equal investment": m enters act 2 at about 45% and reaches only about 37% by season 6. It never settles at 33%, and players only ever see it fall from above. | Low | Say "was heading toward one-third", or run more seasons, or start act 2 below one-third. |
| C9 | Brood lesson (`ch99.js` L20) | "Total investment in sons and daughters evens out" is contradicted by the chapter's own act 3 (local mate competition). | Low | Add "…unless brothers compete for mates". |
| C10 | Raffle end card (`ch3.js` L295) | "That hump … is Parker's prediction, and males of many species track it": the rise with risk is well supported, but the fall at high intensity is much weaker (Kelly & Jennions 2011, *Biol Rev* 86:863). | Low | Split the claim into the rise and the fall. |
| C11 | Spindle maths text (`ch12.js` L12) | "Twenty-four [pups] usually can [tell 75% from 50%]": the exact test's power is 61% at n = 24, 10% at n = 8 and 93% at n = 48. | Low | Give the numbers. |
| C12 | Spindle real text (`ch12.js` L11) | "Poisons sperm that lack it" (R2 noted this as a simplification). The game's own end card (L19) says the genome "evolves to suppress them", which is stated as universal. | Low | Say "damages all sperm, rescues only carriers"; "often evolves to suppress". |
| C13 | Forager Notes (`ch3.js` L155–156) | They say "Level x of 3" in a five-level chapter, and "allowing a quarter-second to react" when the code uses `RX` = 0.35 s. | Low | — |
| C14 | Alarm v2 real text (`ch7.js` L174) | It cites Sherman 1985 for the costly trill. The costly trill is Sherman 1977. | Low | "(Sherman 1977, 1985)". |
| C15 | Meadow end card (`ch8.js` L85) | "Predicted its moth forty years before anyone found it": the moth was described in 1903, but was first seen visiting *Angraecum* only in the 1990s (Wasserthal 1997). | Low | Add that. |
| C16 | Crowd MODEL caveat (`ch99.js` L128) | "The crowd drifts toward the IFD": "drift" is the technical term for chance, which the Drift Casino teaches. | Low | "moves toward". |
| C17 | Commons real text (`ch22.js` L11) | The group-level, two-term partition is credited to Price 1970. The hierarchical form is Price 1972 (applied to groups by Hamilton 1975). | Low | "Price (1970, 1972)". |
| C18 | Nest real text (`ch11.js` L10) | Staggered hatching is presented only as Lack's brood-reduction adaptation. Alternative explanations exist and tests are mixed (Magrath 1990; Stoleson & Beissinger 1995). | Low | One clause. |
| C19 | Many real text (`ch24.js` L10) | "Evolved higher rates of programmed cell death, which snaps off small propagules": later work attributes most fragmentation to mechanical strain from cell packing (Jacobeen et al. 2018). | Low | Hedge. |
| C20 | Many MODEL caveat (`ch99.js` L120) | It does not disclose that the cheater mutation rate (6% per division) is exaggerated by about 10⁴–10⁵ times. | Low | Add a sentence. |
| C21 | Shape-shifters real text (`ch18.js` L73) | Clausen, Keck and Hiesey's gardens are dated "in the 1940s". The transplants ran from the 1920s to the 1940s, and the monographs appeared in 1940–1948. | Low | "from the 1920s to the 1940s". |
| C22 | Live Fast real text (`ch18.js` L10) | "Parents given extra eggs to raise": brood-size experiments usually add chicks. | Trivial | "extra chicks". |

**Checked and correct in the game text (leave alone):**
- **Raffle:**
  - s/(s + R), the marginal gain R/(s + R)², s = √(R/λ) − R.
  - Bretman, Fricke & Chapman 2009; Pizzari et al. 2003.
  - Chapman et al. 1995; Wigby & Chapman 2005; Rice 1996 (41 generations).
- **Brood:**
  - Fisher 1930, Hamilton 1967, and the shares ¼, ⅓ and ⅜ for n = 2–4.
  - The diploid ESS correctly computed in-model (the game's best responses track (n − 1)/2n).
- **Two Sizes:** the PBS model; the *Volvox* series and its colony-size trend.
- **Lek:** Zahavi 1975; Grafen 1990; Vehrencamp et al. 1989; the shrinkage of a reading by reliability σq²/(σq² + σn²); the backward-induction search value.
- **Spindle:** Chmátal 2014; Akera 2017; Kyrou 2018 (crash within about 10 generations); a homing rate of 95%.
- **Meadow:**
  - Darwin 1862; *Angraecum* spur about 30 cm; the 1903 description.
  - Nilsson 1988; Wasserthal 1997.
  - Spur pollination Φ((L − μ)/2) and its optimum.
- **Alarm:** Hamilton's rule; Komdeur 1992; Sherman 1977 (female kin, dispersing males).
- **Nest:** Lack 1947; Williams 1966; Charnov & Krebs 1974; Trivers 1974; Mock 1984; Anderson 1990; the 71% break-even; the "factor of two" begging rule.
- **Commons:**
  - The Price equation as written.
  - Exact b/k > c in the model; `kBest` values 5, 2 and 8.
  - Gore, Youk & van Oudenaarden 2009.
- **Many:** Ratcliff et al. 2012 (about 60 days, all lines); Stokes N^(2/3); Michod 2007; Aktipis et al. 2015.
- **Live Fast:**
  - The dynamic programme V(age) = max[5r + survival × V(age + 1)].
  - Smith & Fretwell 1974 (the maths text is right); Fox et al. 1997.
  - The r/K caveat.
- **Forager:**
  - Kacelnik 1984; Charnov's MVT; the optimal-diet rule λE/(1 + λh) and the zero-one rule.
  - Lima & Dill 1990; Caraco et al. 1980; Stephens 1981.
  - The Level 5 dynamic programme V(e, t).
- **Crowd:** Fretwell & Lucas 1970; Sutherland & Parker 1985; Bikhchandani et al. 1992; Giraldeau et al. 2002; the cascade logic.
- **Shape-shifters:** Bayes and the 23% threshold; √(8 × 4) ≈ 5.7; Tollrian 1995; Agrawal et al. 1999; Cohen 1966; Venable 2007.

---

## Corrections future agents must apply

Highest priority first. The bracket after each item is its status in the uncommitted working tree as of 2026-10-14: [done], [partly] or [not yet]. Verify anything marked done after the sweep is committed.

1. **`ch7.js` L175, L180, L204 (Alarm v2).**
   - Swap the costs: hawk whistle cheap (0.08), coyote trill costly (0.22).
   - Rewrite the `ideas` justification to match Sherman 1985.
   - Update the end-card thresholds.
   - Add a multiple-paternity note to "r = ½".
   - [done]
2. **`ch5.js` L102 (maths inherited by Alarm v2).** Remove the 0.18 and 0.45 figures and make the text cost-general. Change "carries half your genes" to "shares half by descent, on average". [done]
3. **`ch7.js` L204 (Alarm L2 note).** Replace "breeding won … when the nestlings were only half-siblings" with the true comparison: breed if 1.5q > 1.2r. Spring 3 is a half-sibling year where helping wins. [done]
4. **`ch19.js` L35, L72 (Crowd L2).** Set the crowd target to 32 weight units (8 × 2 + 16), and show the IFD split in weight. [done]
5. **`ch22.js` L11–12 and the L2 end card (Commons).**
   - Call the b/k > c result "weak altruism": the good repays its maker.
   - Say that random groups contain no kin.
   - Describe Chuang et al.'s good as a signal that switches on antibiotic resistance in every cell.
   - Say that the L1 jars differ far more than random grouping would make them.
   - [done]
6. **`ch99.js` L62 (Commons bridge card).** Replace with: "In Alarm Call, relatedness made helping pay. What if a helper's good also comes back to itself?" [not yet]
7. **`ui.js` L7.** Rename "Mate choice and runaway" (for example to "Mate choice and honest signals") and "Pollination and fertilisation" (for example to "Pollination and coevolution"), or build the content the names promise. [not yet]
8. **`ch7.js` L89, L93, L94 (Brood).**
   - Remove the "disease killed most males" framing.
   - Change "found exactly that" to "found the predicted pattern".
   - Add the haplodiploid ESS (n − 1)(2n − 1)/[n(4n − 1)], about 21% with two mothers (Taylor & Bulmer 1980).
   - [done]
   - **L138:** "settled near X%" should say "was heading toward one-third". [not yet]
9. **`ch18.js` L37 (Live Fast egg-size end card).** State Smith–Fretwell correctly. [done]
   **L10:** cite Williams 1957 for senescence, keep "ageing here is fixed", and say "extra chicks". [partly: the ageing caveat and "chicks" are in; it still cites Williams 1966]
10. **`ch18.js` L73–75, L89 (Shape-shifters).** Distinguish conservative bet-hedging (the generalist) from diversified bet-hedging (seed dormancy). [done]
    The working tree now says the generalist "is not plastic at all". Soften this to "its yield does not change with climate", because flat fitness can come from plasticity in other traits (A71). [needs a tweak]
11. **`ch3.js` (Raffle and Forager).**
    - L259: add that dung flies are last-male, P2 ≈ 0.8. [done]
    - L260–261: add that no male mates after you, and Parker's risk models. [done]
    - L295: the rise is well supported; the fall is not (Kelly & Jennions 2011). [done]
    - L10: Krebs' partial preferences. [done]
    - L155–156: Notes say "of 5" and give the 0.35 s reaction allowance. [done]
12. **`ch9.js`.** Disclose the Raffle L2 simplification: she cannot raise her own laying rate. [done] Add Kacelnik & Bateson 1996 to the Forager L5 text. [done]
13. **Forager diet scoring (`ch3.js` L86–93).** Either score against the best policy for items visible at the same time, and remove the `Math.min(1, eff)` cap, or make encounters sequential (one item visible at a time). Otherwise the "optimal diet" lesson is beaten by the conveyor itself (A63). [not yet]
14. **`ch11.js` L11 (Nest maths).** Count the 0.4 part-fed chick so the text matches `bestVal1`. [not yet] **The end card should disclose that eggs are free.** [done]
15. **`ch12.js` L11–12 and L19 (Spindle).** "Damages all sperm, rescues carriers"; give the power numbers (61% at 24 pups); "often evolves to suppress". [done]
16. **`ch24.js` (Many).** Disclose the exaggerated `MU2` [done in ideas and Notes]. Hedge the apoptosis claim (Jacobeen et al. 2018) [done]. Add the mutation rate to `MODEL.many` in `ch99.js` L120 [not yet].
17. **`ch8.js` L24.** *Xanthopan praedicta* (Minet et al. 2021). [done]
    **L85:** add "first seen visiting the orchid in the 1990s (Wasserthal 1997)". [not yet]
18. **`ch19.js` L10 (Crowd).** Milinski's fish split at the equal-intake ratio, but individual intakes were unequal and undermatching is common. [done]
19. **`ch6.js` L136 (Lek).** Say that real hens compare side by side, revisit and copy. [done]
20. **`ch99.js` `MODEL` caveats.** [not yet] Add:
    - **raffle:** "No male mates after you; rival sperm is known exactly."
    - **alarm:** "Relatedness ignores multiple paternity; each predator has one fixed cost."
    - **nest:** "Eggs cost nothing; the parent's feeding rule is fixed."
    - **commons:** "A producer gets its own share of the good; with none, random groups never favour producers."
    - **brood:** "The population's sex ratio follows a script, not selection."
    - **livefast:** "Ageing is imposed, not evolved."
    - **crowd:** change "drifts" to "moves" (L128).
    - **L20, brood lesson:** add "unless brothers compete for mates".

Before redesigning, note that R2's "missing" lists are accurate for the committed code, with two exceptions. **Selfing** already exists, in Equilibrium HW's self-fertilising mode and in Doubling's model. **Target-site resistance** to a drive is already played in Spindle Level 3. Build on both.

**External checks used:**
- Chuang et al. 2009 public good: [PMC3697107 figure legend](https://pmc.ncbi.nlm.nih.gov/articles/PMC3697107/figure/F3) and the [Crossref record](https://api.crossref.org/works/10.1126%2FSCIENCE.1166739).
- Herre 1985 inbreeding correction: [PMC4543974](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4543974/).
- Richardson et al. 2001 (44% of helpers bred, 15% of young): [UEA eprint](https://ueaeprints.uea.ac.uk/id/eprint/856/).
- Wedell, Gage & Parker 2002 citation: [UEA eprint](https://ueaeprints.uea.ac.uk/id/eprint/543/).
- Kelly & Jennions 2011 citation: [ANU record](https://researchportalplus.anu.edu.au/en/publications/sexual-selection-and-sperm-quantity-meta-analyses-of-strategic-ej/).
