# Science sweep G3: Sex and families (part 1)

Files: `games/endless-forms/source/ch3.js` (The Forager L1–3, Two Sizes, The Raffle L1), `ch7.js` (Mendel's Garden L2, Fisher's Brood, Alarm Call v2), `ch9.js` (Forager L4–5, Raffle L2), `ch10.js` (Hawks and Doves L4–5, Sieve missions 4–5), `ch11.js` (The Nest), `ch12.js` (The Selfish Spindle).

**Sources.** I used the reviews `docs/reviews/R2` (sections V–VII) and `R1` (Mendel, Sieve and Hawks), and the fact-check `R7_factcheck_R1`. No fact-check of R2 existed when I worked, so I checked every R2 claim against the code and the literature myself.

**Model checks.** I re-ran parts of the models in Node, following the game's own rules:
- Raffle L2: the male and female optimal doses for all five females.
- Hawks L4: the assessor trajectory.
- Hawks L5: the war-of-attrition dynamics.
- Spindle L1: the power of the exact binomial test.
- Brood: Hamilton's ESS and the haplodiploid ESS.
- Alarm L2: the payoffs for each spring.

Scripts are in `scratchpad/sweep/g3/`.

**Kinds of change.** Most changes are text. One is a model fix: the Alarm Call hawk/coyote costs were inverted. One is a code bug fix: Hawks lost its whole "In nature" text during play.

## Changes

| file:line | chapter | before (short quote) | after | why | source / check |
|---|---|---|---|---|---|
| ch7.js:180 (`genRound`) | Alarm Call | **MODEL.** `c: pred === 'hawk' ? 0.22 : 0.08` | `c: pred === 'hawk' ? 0.08 : 0.22` | The chapter's own `real` text says hawk whistles let "callers themselves usually escape" and that coyote trills warn kin "at a cost to the caller". The model charged the hawk call the highest cost, so the game taught the opposite of its citation. Swapping the costs keeps both thresholds (0.20 and 0.55) and the balance. | Sherman 1977, *Science* 197:1246; Sherman 1985, *Behav Ecol Sociobiol* 17:313; R2 Alarm. |
| ch7.js:175 (idea L1) | Alarm Call | "Against a hawk, calling exposes you badly (cost 0.22). Against a coyote you can call from a burrow mouth (cost 0.08)." | "Against a coyote, a trill keeps you upright and in view while it stalks you (cost 0.22). Against a hawk, you whistle as you dash for cover, so calling costs little (cost 0.08): Sherman found whistlers were caught less often than silent squirrels, so these calls may protect the caller as much as kin." **Revised in the review round (R-3).** | Matches the corrected model and Sherman's result. | Sherman 1985. |
| ch7.js:175 (idea L1) | Alarm Call | "mother, sister or daughter, r = ½" | adds "(Real litters often have several fathers, so some sisters are half-sisters, r = ¼; the game counts them all as ½.)" | Belding's litters are often sired by several males, and females treat full and half sisters differently. | Hanken & Sherman 1981, *Science* 212:351; Holmes & Sherman 1982; R2. |
| ch7.js:204 (L1 card) | Alarm Call | "The same neighbours can justify a trill at a coyote but not a whistle at a hawk: … above 0.55 for hawks and 0.20 for coyotes" | "… a cheap whistle at a hawk but not a costly trill at a coyote: … above 0.20 for hawks and 0.55 for coyotes" | Follows the cost swap. | Code. |
| ch7.js:204 (L2 card) | Alarm Call | "Helping won with no good territory and full siblings in the nest; breeding won with a good territory, or when the nestlings were only half-siblings." | "Helping won when the only territory on offer was poor and there were siblings to raise; breeding won with a decent territory, or with no nest to help at. Half-siblings (r = ¼) are worth half as much as full siblings, which tipped some springs toward breeding." | The old summary was false for the fixed spring list. In spring 3 (a poor patch, half-siblings) helping wins, 0.30 against 0.225. In spring 5 (a free but poor territory, q = 0.3, full siblings) helping also wins, 0.60 against 0.45. | `yearVals()` computed for all 8 `YEARS`. |
| ch7.js:174 (real) | Alarm Call | "(Sherman 1985)"; Komdeur only | "(Sherman 1977, 1985)"; adds "Helping is not only about kin, though: female helpers in that species often lay eggs in the nest they help at, and produce about 15% of all young (Richardson et al. 2001)." | The costly trill is the 1977 result. Level 2 counts only indirect fitness, while Seychelles warbler helpers also gain directly (44% of female helpers bred). | Richardson et al. 2001, *Mol Ecol* 10:2263; R2. |
| ch10.js:8, 29, 41 | Hawks and Doves | **BUG.** `ch5.js` (levels 1–3) and `ch10.js` (level 4) used `this.real` as the running score. That overwrote the chapter's `real` text, so after the first contest the Notes "In nature" panel and the end card's "The real thing" showed a number (I saw "-12"). The Maynard Smith & Price, Davies, Clutton-Brock and war-of-attrition text never reached players. | ch10 now copies the text to `H.intro.real`, which both readers (`ui.js` L46, `ch99.js` L163) check first. ch10's own tally is renamed `this.tally4`. | The science text of the whole chapter was invisible in play. Checked in a browser: the original build shows "In nature: -12" after four contests; the new build shows the text. | Playwright probe (`scratchpad/sweep/g3/probe4.py`). **ch5.js still writes `this.real` (L20, L33, L41); its owner should rename it, e.g. to `this.total`.** |
| ch10.js:114 (Sieve real) | The Sieve | "Great tits in the Netherlands now breed earlier than they did decades ago, but not as fast as the peak of the caterpillars … (Visser et al. 1998)" | "… though in the wild much of the tracking is done by plasticity rather than evolution. In a Dutch great tit population, laying dates did not advance over 23 years of warming springs, while the caterpillar peak that feeds their chicks moved earlier and selection for early laying grew stronger (Visser et al. 1998)." | The cited paper's central result is that laying date did **not** advance from 1973 to 1995. R7-R1 lists this citation as "checked and correct"; I overrule it after reading the abstract. | Visser et al. 1998, *Proc R Soc B* 265:1867 (abstract: "Date of egg laying … has not advanced over a 23-year period, but selection for early laying has intensified"); Charmantier et al. 2008 (tracking by plasticity). |
| ch10.js:113 (Sieve maths) | The Sieve | "the population falls ever further behind — the critical rate of environmental change (Lynch and Lande 1993)" | "… falls ever further behind. In nature the limit usually bites sooner: a population that lags too far behind loses so many young that it shrinks, which sets a critical rate of environmental change beyond which it dies out (Lynch and Lande 1993)." | In Lynch & Lande the critical rate is demographic: the rate at which a steady lag's fitness load drives population growth below replacement. It is not the point where the lag grows without bound. | Lynch & Lande 1993; Bürger & Lynch 1995. |
| ch10.js:6 | Hawks L4 | "(Clutton-Brock and Albon 1979)" for roaring, parallel walks and matched fights | "(Clutton-Brock and Albon 1979; Clutton-Brock et al. 1979)" | The parallel walk and matched-fight results are in "The logical stag". | Clutton-Brock, Albon, Gibson & Guinness 1979, *Anim Behav* 27:211. |
| ch10.js:49 (L4 card) | Hawks L4 | "which is why real contests begin with sizing up" | "which helps explain why so many real contests begin with sizing up" | Overstated a single cause. | — |
| ch10.js:9 (idea L4) | Hawks L4 | "Some crabs have evolved a rule" | "Some crabs follow an evolved rule" | Individuals do not evolve. | — |
| ch10.js:101 (Notes L5) | Hawks L5 | "The stable answer: an exponential spread with mean prize ÷ cost = 10 s." | adds "Here no rival can hold on past 20 s, so some of the population piles up at 20 s." | Strategies are capped at 20 s (`NB5 × DT5`). Simulated, the population becomes a declining exponential with an atom at 20 s (mean 9.1). That is the bounded war-of-attrition ESS, not a pure exponential. | `scratchpad/sweep/g3/woa.js`. |
| ch7.js:89 (hook) | Fisher's Brood | "first the open population, where a disease has just killed most males" | "first an open population that starts out short of males" | A one-off demographic shock is not sex-ratio evolution. If mothers' strategy is genetically 1 : 1, the adult sex ratio rebounds in one generation with no selection. | Shaw & Mohler 1953; R2 Brood. |
| ch7.js:95 (idea), 138 (end card), 133 (fig card) | Fisher's Brood | "Everyone else is evolving too: when sons pay, more mothers make sons."; "as every mother cashed in"; "The other mothers have had a long time to evolve" | "The population is evolving too: when sons pay, mothers whose genes make more sons leave more grandchildren, and those genes spread."; "as son-making lineages spread"; "The other mothers come from lineages that have had a long time to evolve" | The old wording said individuals evolve and mothers choose. Fisher's argument is about a heritable strategy spreading. | Fisher 1930. |
| ch7.js:93 (real) | Fisher's Brood | "and fewer so as more mothers share a fig. Allen Herre (1985) found exactly that … the more sons each lays." | "and less so as …"; "found the predicted pattern … the larger the share of sons each lays." | Garbled wording. "Exactly" overstates the fit, and later manipulations question how precisely fig wasps adjust. | Herre 1985, *Science* 228:896; Wang et al. 2015, *Sci Rep*; R2. |
| ch7.js:93 (real) | Fisher's Brood | "R. A. Fisher (1930) explained why …" | adds "(Carl Düsing had made the same argument in 1884)" | Priority. | Edwards 1998, *Am Nat* 151:564. |
| ch7.js:94 (maths) | Fisher's Brood | (Hamilton's (n − 1) ÷ 2n given for wasps without comment) | adds "This is Hamilton's simplest model. Real fig wasps are haplodiploid and their sons mate with their sisters, which tilts the stable share a little further toward daughters: (n − 1)(2n − 1) ÷ n(4n − 1), about 21% rather than 25% with two mothers (Taylor and Bulmer 1980)." | Discloses a model assumption. The game keeps the simpler diploid ESS. | Hamilton 1979; Taylor & Bulmer 1980, *J Theor Biol* 86:409; R2. |
| ch7.js:160 (Notes) | Fisher's Brood | "Each lays the evolutionarily stable brood, (n − 1) ÷ 2n sons." | "…: a share of (n − 1) ÷ 2n sons." | The formula is a proportion, not a count. | — |
| ch7.js:6 (Mendel maths) | Mendel L2 | "If the genes sit on different chromosomes they come out 1 : 1 : 1 : 1." | "… on different chromosomes (or far apart on the same one) …" | Genes far apart on one chromosome also assort independently. "Unlinked = different chromosomes" is a common misconception. | Standard. |
| ch7.js:6, 80 (maths, Notes) | Mendel L2 | χ² on 16 seeds with no caveat | "With sixteen seeds, four expected in each class, the test is only rough." Notes: "(only roughly, with four expected per class)" | Expected counts below 5 make the χ² p-value approximate. I chose text over more seeds to keep the puzzle's balance. | R7-R1 D21 / correction 16. |
| ch7.js:81 (idea L2) | Mendel L2 | "Equal numbers mean the genes are inherited independently." | "Roughly equal numbers mean …" | With 16 seeds, sampling noise means exactly equal classes are rare even for independent genes. | — |
| ch7.js:7 (real) | Mendel L2 | (nothing on the real genes) | adds "(In real peas, flower colour and seed shape sit on different chromosomes; level 2 sometimes links them so you can learn to spot linkage.)" | The linked case is a fiction about real genes: A is on linkage group I and R on V. | Blixt 1975, *Nature* 256:206; Reid & Ross 2011, *Genetics*. |
| ch3.js:10 (real) | Forager | "when large ones were common the birds ignored the small ones" | "… mostly ignored the small ones … (Mostly, not always: the tits still took some small pieces, a "partial preference" the simple model does not predict.)" | Krebs et al. found partial preferences, not the zero–one rule. | Krebs et al. 1977, *Anim Behav* 25:30; R2. |
| ch9.js:6 (real) | Forager L5 | energy-budget rule stated without qualification | adds "Later tests have been mixed: most animals tested avoid variable amounts of food, and many do not switch when their reserves run short (Kacelnik and Bateson 1996)." | A contested claim was stated as settled. | Kacelnik & Bateson 1996, *Am Zool* 36:402; R2. |
| ch3.js:156 (Notes) | Forager L1/L3 | "allowing a quarter-second to react to each item" | "allowing about a third of a second …" | The code uses `RX: 0.35` s. | Code. |
| ch3.js:155 (Notes) | Forager | "Level 1 of 3" | "Level 1 of 5" | The chapter has five levels. | Code. |
| ch3.js:259 (real) | Raffle | "Males across the animal kingdom adjust as predicted: Drosophila males … mate for longer and transfer more sperm and seminal fluid proteins (Bretman, Fricke and Chapman 2009)" | "(Dung flies themselves are not a fair raffle: the last male to mate fertilises about 80% of the eggs. The raffle is the simplest case.) Many males adjust as the models predict: Drosophila males … mate for longer and win a larger share of paternity (Bretman, Fricke and Chapman 2009) and transfer more seminal fluid proteins (Wigby et al. 2009)" | Bretman et al. showed longer matings and higher paternity. The seminal-fluid-protein result is Wigby et al. Citing dung flies for a fair raffle misleads, because *Scathophaga* shows last-male precedence (P2 ≈ 0.8). "Across the animal kingdom" overstated. | Bretman et al. 2009, *Proc R Soc B* 276:1705; Wigby et al. 2009, *Curr Biol* 19:751; Parker 1970; R2. |
| ch3.js:260 (maths), 261 (idea), ch9.js:110 (L1 card) | Raffle | "With no rivals … any sperm at all wins every egg, so spend the minimum."; "A virgin female is a raffle with only your tickets in it."; "with no rivals, one ticket wins everything" | Each now says this holds because no male mates after you in this game. The maths adds: "If a virgin may mate again later, even she is worth some sperm: Parker's 'risk' models." | "Spend nothing on virgins" is an artefact of forbidding later remating. In Parker's risk models a first male still invests. | Parker 1990; Parker et al. 1997; Wedell, Gage & Parker 2002; R2. |
| ch3.js:295 (ch3 end card) | Raffle | "That hump … is Parker's prediction, and males of many species track it." | "… The rise is well supported: males of many species spend more when a rival is present. The fall is much harder to find in real animals (Kelly and Jennions 2011)." | Meta-analysis found strong support for the risk response, but no general support for reduced ejaculates at high intensity. Note: ch9's `Q.end` overrides this end card, so the text is not shown at present. I fixed it so it is correct if reused. | Kelly & Jennions 2011, *Biol Rev* 86:863; del Barco-Trillo 2011. |
| ch9.js:103 (maths L2) | Raffle L2 | (female best dose > 0, unexplained) | adds "(Here she cannot speed up her own laying, so even she gains from a small dose; that is a simplification of the model.)" | "Best for her" is dose 1 for young females and 4–5 for old ones. Without the note, players would infer that females lay suboptimally unless males manipulate them. | Own run: young 0.10 / male 0.65–0.90; old 0.45 / male 0.45–0.90; R2. |
| ch9.js:127 (end card L2) | Raffle L2 | "it drives an arms race" | "it can drive an arms race" | An arms race is a well-supported possibility, not a demonstrated law. | Holland & Rice 1998; Rice 1996. |
| ch3.js:172 (real) | Two Sizes | (PBS presented as the only route) | adds "This is not the only route: when sex cells struggle to find each other at all, the same split can be favoured (Lehtonen and Kokko 2011)." | Gamete limitation is a competing explanation. | Lehtonen & Kokko 2011, *Behav Ecol Sociobiol* 65:445; Levitan 1996; R2. |
| ch3.js:173 (maths) | Two Sizes | "once big cells exist, small ones do best by fusing with them" | "… small ones do well because most of their partners bring food. (Fusion here is random: no cell chooses its partner.)" **Wrong; corrected in the review round (R-2).** | The old wording implied partner choice, which the model does not have. | Code (`pool()` is random fusion). |
| ch3.js:174 (idea) | Two Sizes | "If the sea is full of small cells, somebody has to provision the zygote." | "… a lineage that provisions the zygote does well." | Teleological ("has to"). | — |
| ch11.js:12 (idea L2) | The Nest | "You share half your genes with each full sibling." | "A full sibling shares, on average, half of your genes by descent." | Relatedness is identity by descent, not "half your genes". | Standard. |
| ch11.js:35 (L1 card) | The Nest | "When effort costs your own future, the best clutch is smaller than the most you could raise." | adds "(Here spare eggs cost nothing, because you choose who eats; in a real nest eggs cost the mother and every chick begs, which is what makes too large a clutch raise fewer young.)" and "… it pays to raise fewer young than you could." | In the model a larger clutch never lowers the score (`bestVal1`): only the number of feeds matters, so "best clutch" was not what the model rewarded. | Code; Lack 1947; R2 Nest. |
| ch11.js:10 (real) | The Nest | hatching asynchrony presented as brood reduction only | adds "Lack's idea that staggered hatching is an adaptation for trimming the brood is only one of several explanations, and tests of it are mixed (Magrath 1990)." | A contested hypothesis was stated as settled. | Magrath 1990, *Biol Rev* 65:587; Stoleson & Beissinger 1995. |
| ch12.js:11 (real) | Spindle | "because it poisons sperm that lack it" | "because its genes damage all of a male's sperm but rescue only those that carry it" | The t-haplotype works by distorters acting on all sperm and a responder that rescues t-bearing sperm. It is not a targeted poison. | Herrmann et al. 1999; Lyon 2003; R2. |
| ch12.js:12 (maths) | Spindle | "Eight pups cannot tell 75% from 50% with confidence; twenty-four usually can." | "… twenty-four can about three times in five, and forty-eight more than nine times in ten." | Exact two-sided binomial power at α = 0.05: n = 24 gives 0.61 ("usually" is too strong); n = 48 gives 0.93. | Own computation (`checks.js`). |
| ch12.js:19 (end card) | Spindle | "the rest of the genome evolves to suppress them — an arms race inside every body" | "… often evolves to suppress them — an arms race inside the genome" | Hyperbole. Suppression is common but not universal. | — |

**Total: 39 rows, about 50 individual edits.** These are one model fix (Alarm costs), one code bug fix (the Hawks text clobbering, three lines) and text.

## Considered but NOT changed

**Reviewer claims rejected or already handled**
- **R2 Nest:** "the cold-spring surprise arrives after laying, but scoring assumes foreknowledge". Rejected as a fairness bug. Spare eggs cost nothing, so a clutch laid for an ordinary spring can still reach 100% in the cold one. The real problem is that eggs are free, now disclosed (see the table).
- **R7-R1 D1** (fiddler crabs fight over burrows, not shells; ch10 L8, L18, L36 mention shells). No change needed in ch10: ch5's owner has already changed the species to hermit crabs, so ch10's shells are now correct.
- **R7-R1 "Visser et al. 1998 checked and correct".** Overruled; see the table.
- **R2 "Two Sizes: Hurst & Hamilton cytoplasmic conflict missing".** Not added. That idea mainly explains mating types and uniparental inheritance, not gamete size. Lehtonen & Kokko covers the main alternative.

**Claims I checked and found correct**
- **Raffle L2:** all citations correct (Chapman et al. 1995; Wigby & Chapman 2005; Rice 1996, 41 generations). The end-card claims hold: young females suffer the largest conflict (cost to her 43–92 eggs), and with an old female and few rivals both optima are 0.45.
- **Raffle:** "Pizzari et al. 2003 … more fecund females": kept. Males favour large-combed females, and comb size signals reproductive investment.
- **Hawks L4:** "Assessors rose from 20%" is always true. The update is deterministic and the assessor share goes 20% → 90% in 10 contests whatever the player does.
- **Hawks L5:** "its spread widened" is true (SD 1.3 → 6.7 s).
- **Hawks L5:** speckled woods as a war of attrition: kept. Davies (1978) found spirals last far longer when both butterflies behave as residents.
- **Hawks:** Bishop & Cannings 1978, Maynard Smith 1974 and Parker's resource-holding potential (1974) are correct.
- **Spindle:**
  - "t-haplotype transmitted to over 90%": kept (typically 90–99% from heterozygous males; Lyon 2003).
  - Chmátal et al. 2014 "larger centromeres": kept. Stronger centromeres carry expanded minor-satellite arrays (Iwata-Otsubo et al. 2017).
  - Kyrou et al. 2018 "about ten generations": the paper reports 7–11.
- **Mendel L2:** "They could not explain it" (Bateson, Saunders and Punnett 1905): kept. Their later "reduplication" hypothesis (1911) was wrong. `chi3p` is the correct closed form for 3 df.
- **Brood:**
  - "Hamilton (1967) … as in fig wasps": kept as an illustration. Hamilton himself discussed fig wasps in 1979.
  - The fig ESS numbers (0, ¼, ⅓, ⅜) are correct for (n − 1) ÷ 2n.
  - The season-4 "sons twice as large" is a thought experiment. It is fine as a story event.
- **Two Sizes:** "Gonium and Pandorina" as same-sized gametes: kept (Pandorina ranges from isogamous to slightly anisogamous).
- **Nest:**
  - The 71% break-even is correct: 1.4p = 1.
  - The level-2 inclusive-fitness accounting is correct for full sisters.
  - Mock 1984 and Anderson 1990 (Nazca booby, then *Sula dactylatra granti*) are correct.
- **Forager:**
  - Kacelnik 1984, Charnov 1976, Lima & Dill 1990, Caraco et al. 1980 and Stephens 1981 are all correct.
  - The level-5 recursion matches the code.
  - λE ÷ (1 + λh) is correct, and so are the thresholds (0.63 against 2.60 per s, both compared with 1.67).
- **Alarm:**
  - "most altruism in nature is aimed at kin": kept, as a broadly accepted generalisation.
  - Komdeur 1992: kept. I added the direct-benefit caveat rather than rewriting it.
- **Sieve:** "this is near the limit of what selection can do" is fine in the context of the game.

**Minor wording left alone**
- Hawks real: "persist for a random … time, so that no opponent can predict when you will quit". Slightly teleological, but this is the standard ESS explanation.
- Spindle L2 card: "the rest of the genome evolves to suppress them". Standard shorthand.
- Raffle L2: "females evolve resistance, males evolve more potent proteins". Sex-level shorthand.

**Cross-file notes for other owners**
- **ch5.js L20, L33, L41** (Hawks L1–3) still uses `this.real` as the score. My ch10 fix makes the text immune to it, but the property should be renamed.
- **ch99.js** has no MODEL caveats for Raffle (no remating), Alarm (fixed costs), Nest (free eggs) or Brood (diploid ESS, scripted population). I put brief caveats in the chapters' own maths and notes instead.
- Running `build.py` also rewrites the shared `source/game.js`.

## Needs a gameplay redesign to fix properly

- **Fisher's Brood.**
  - The open-population payoff is linear in sons, so the best brood is always all sons or all daughters.
  - The population's male share relaxes 45% toward a scripted target each season, whatever anyone does.
  - Fixing this needs a real invasion model, in which the player's sex-ratio allele spreads or fails.
  - Haplodiploid sex control (fertilise an egg or not) is the most game-able fact here, and it is absent.
- **Alarm Call.**
  - No consequences: no squirrel dies.
  - Kinship should be inferred from a family tree with multiply sired litters, not read off collars.
  - The player could test which call is nepotistic, rather than being told.
  - Level 2 should include direct benefits (co-breeding by helpers).
- **The Nest.**
  - Eggs are free, and the parent allocates food perfectly, so Lack's trade-off appears only if the player chooses to spread food.
  - A proper fix gives eggs an energy cost and lets chicks compete by begging, so the parent cannot fully triage.
  - Level 2's parent is a passive lottery, so honest signalling of need (Godfray 1991) never arises.
- **The Raffle.**
  - The rival sequence is fixed and unseen, yet scored against an omniscient plan.
  - No later remating exists, which forces the "nothing on virgins" result.
  - Sperm precedence (dung flies, P2 ≈ 0.8) is not modelled.
- **Two Sizes.**
  - Holding the slider at "tiny" wins three stars, so the player only plays the parasite and never needs to understand why large gametes exist.
- **The Forager.**
  - Level 2's belt shows each worm for 3.2 s, so encounters are simultaneous, not sequential. A player who looks ahead can beat the computed "best", and the 100% cap hides it.
  - The Notes tab prints the optimal load during play.
- **The Selfish Spindle.**
  - The genome's suppressors, which the end card names as the crux, are never played.
  - Level 2 is mostly luck.
  - Sex-ratio drive, a natural tie-back to Fisher's Brood, is absent.
- **Hawks L5.** The 20 s cap stops the population from reaching the unbounded exponential ESS (now disclosed in Notes).
- **Mendel L2.** Sixteen seeds per cross keep the χ² approximate; 20 or more would need rebalancing the cross budget.

## Test results

- **Original build** (`games/endless-forms/Endless_Forms_v1.html`), seeds 1 and 2:
  - forager, gametes, raffle, brood, alarm, nest, spindle, hawks and sieve all reach `end`.
  - mendel times out on both seeds (the known pre-existing timeout).
- **My build** (`scratchpad/sweep/ef_G3.html`):
  - **Seeds 1, 2 and 3, on the build before the last ch10 edit:**
    - Every chapter reaches `end` on all three seeds, except mendel.
    - Mendel times out on seeds 1 and 2 (identical HUD state to the original), and on seed 3 it reaches `end` ("0 of 2 levels solved"). That run exercised the new L2 end card.
    - No JS errors, no `NaN`, `undefined` or `Infinity` in the page or Notes, and no stuck cards.
  - **After the last ch10 change:** hawks and sieve re-run on seeds 1–3, all `end`.
  - **Final build, seed 4:** see the addendum below.
- **Browser probe of the final build:**
  - HUD, Idea and Numbers text for all ten chapters render, with no page errors.
  - Alarm shows "A coyote is coming: calling costs you 0.22" and "Relatedness needed to call > 0.55".
  - Hawks "In nature" shows the Maynard Smith & Price text after play; the original build shows "-12".

**Addendum: final build, seed 4.** All ten chapters reach `end`, mendel included ("0 of 2 levels solved"). No errors or bad text.

## Review round

A reviewer raised five issues about the sweep's fixes and applied a fix for each. I checked each claim against the code, re-ran the numbers in Node (`scratchpad/sweep/g3/review_checks.js`) and probed the Mendel Notes in the browser with synthetic crosses (`scratchpad/sweep/g3/probe_review.py`). **All five are right, and I kept all five fixes unchanged.** I rejected none.

| # | file:line | chapter | problem (verified) | fix kept | check |
|---|---|---|---|---|---|
| R-1 | ch7.js:80 (`notes2`) | Mendel L2 | This bug was already there before the sweep, which missed it. If any seed class was empty, the Notes said "at least one parent carries no hidden copy" and hid the χ². With linkage 8 map units apart, a double-heterozygote test cross gives no recombinants 26% of the time (0.92¹⁶ = 0.263), e.g. 8 : 0 : 0 : 8. That is exactly when the evidence for linkage is strongest (χ² = 16.0, p = 0.001). Independent genes also leave a class empty 4.0% of the time. | The χ² is now shown whenever both colours and both shapes appear. If only one diagonal pair appears, a line adds: "no recombinants among sixteen seeds, a strong sign of linkage". Independent genes give that pattern with p ≈ 3 × 10⁻⁵. Otherwise the Notes say "Only one flower colour or only one seed shape appeared: at least one parent has only one version of that gene (or, rarely, chance hid the other)." That statement is true for every cross the game allows. | Browser probe of 9 class patterns: 8:0:0:8 and 0:8:8:0 show χ² 16.0 plus the linkage line; 7:1:0:8 shows χ² 12.5 with p = 0.006; 5:4:7:0 shows 6.5 with p = 0.090; 16:0:0:0, 8:8:0:0 and 0:0:0:16 show the one-version line. The p-values match the χ²(3) tail. No errors. |
| R-2 | ch3.js:173 (maths) | Two Sizes | **The sweep introduced this error.** It said "most of their partners bring food". `pool()` weights partners by gamete number. When half the population makes 0.02-sized cells and half makes 2.0-sized cells, only 1% of a tiny cell's partners are big. At the start of the game, a tiny-celled player's partners are mostly 0.5-sized cells (66%), and their zygotes survive only 7% of the time. Tiny cells win on numbers: 500 cells × 1% × 0.94 ≈ 4.7 survivors, against 4.7 for a big-cell individual. | "…once big cells exist, small ones profit from them: a small cell that happens to fuse with a big one makes a zygote that survives, and small cells are so numerous that many do. (Fusion here is random: no cell chooses its partner.)" | `review_checks.js`. |
| R-3 | ch7.js:175 (idea L1) | Alarm Call | The cost swap stays. But "whistlers were caught less often than silent squirrels" implies the whistle's net cost is negative, which would mean "always whistle". The game still charges 0.08, and says "your genes lost out" when relatedness is below 0.20. "As much as kin" also understated Sherman's conclusion that whistles mainly protect the caller (R7-R2 B22). | "…so real hawk whistles may mainly protect the caller; the game still gives the whistle a small cost, to show that a cheap call needs fewer relatives nearby." | Sherman 1985, *BES* 17:313; the threshold 0.08 ÷ 0.4 = 0.20 matches the L1 card. |
| R-4 | ch7.js:138 (end card) | Fisher's Brood | "settled near X%": the logged m runs 0.450 → 0.398 → 0.369 over seasons 4–6 (deterministic part; the noise SD is 0.01). It never reaches ⅓. This was R7-R2 C8. | "the share of males fell toward one in three, reaching X% by season 6: the population was heading for equal investment, not equal numbers…" `last(big).m` is logged before the update, so "by season 6" is accurate. | `review_checks.js`. |
| R-5 | ch11.js:11 (maths) | The Nest | "floor(F ÷ 6) well-fed chicks" ignored the 0.4 credit that `fl()` and `bestVal1` give a chick fed 4–5 times. In an ordinary spring F = 22, so the best is 3.4 fledglings from 4 eggs, and the toast says so. In the cold spring F = 16, so the best is 2.4. This was R7-R2 C7. | Adds "…plus one part-fed chick (worth 0.4) if 4 or 5 feeds are left over". | `review_checks.js`. |

**Re-test (my own build, `scratchpad/sweep/ef_G3.html`, seeds 1 and 2):**
- gametes, brood, alarm and nest all reach `end`.
- mendel times out on both seeds. The HUD state is identical to the original build's (`Endless_Forms_v1.html`, re-run now): seed 1 at "0 of 8" in level 1, seed 2 at "5 crosses left" in level 2.
- No JS errors, and no `NaN`, `undefined` or `Infinity` in the page or the Notes.
- `node --check` passes for ch3, ch7, ch9, ch10, ch11 and ch12.
