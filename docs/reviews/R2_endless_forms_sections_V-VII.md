# Review R2: Endless Forms, Sections V–VII (Sex; Families and Societies; Lives and Behaviour)

*This is raw reviewer output: an evolutionary biologist and game-design critic read the code and took screenshots of every level at 390×780. Fact-check it before acting on it. Line numbers refer to `games/endless-forms/source/` as of 2026-10-14.*

**Code map.** Registry `ui.js` L2–14; learning layer `ch99.js`. Brood and Alarm (v2) `ch7.js` (Alarm v1 `ch5.js`); Two Sizes, Raffle L1, Forager L1–3 `ch3.js`; Raffle L2, Forager L4–5 `ch9.js`; Lek `ch6.js`; Meadow `ch8.js`; Nest `ch11.js`; Spindle `ch12.js`; Live Fast, Shape-shifters `ch18.js`; Crowd `ch19.js`; Commons `ch22.js`; Many `ch24.js`.

**The main pattern.** Almost every chapter here is an *optimisation worksheet*: the player is one animal choosing a number, scored as "% of the best possible".
- Most decisions collapse to one threshold or corner, usually printed in the Notes tab.
- The population rarely responds to the player, so evolution is narrated, not seen.
- The adaptationist step (*selection* making animals behave as if they optimise) is never shown, which reinforces the undergraduate belief that animals "choose what's best for their genes".

The favourites (Raffle, Alarm Call, Forager) differ in feel, not structure: each has a real-time or visual moment (sperm race, hawk closing, pecking while returns diminish) where the concept is felt before it is computed.

---

## V. SEX

### Fisher's Brood
1. **Play.** Twelve seasons. Each season you set sons out of 10 egg slots with − and +, then press Lay. Three acts: open population (3 seasons), sons cost two slots (3), fig with 1–4 foundresses (6). About 3 minutes.
2. **Science.**
   - The open-population payoff is linear in sons (`value()`, L108–113), so the best brood is always all-sons or all-daughters.
   - The population's male share `m` relaxes 45% toward a scripted target each season, whatever anyone does (L130). Starting at 20% males, acts 1–2 are solved by "10 sons ×3, then 0 sons ×3".
   - "A disease has just killed most males" (L89) muddles a demographic shock with sex-ratio *evolution*. If mothers' strategy is genetically 1:1, the adult sex ratio rebounds in one generation with no selection. Fisher's argument is about a heritable strategy invading (Shaw & Mohler 1953).
   - Fig wasps are haplodiploid. The ESS used is Hamilton's diploid (n−1)/2n (L94). Herre (1985) tested the haplodiploid, inbreeding-corrected prediction, (n−1)(2n−1)/[n(4n−1)] (Taylor & Bulmer 1980). "Found exactly that" (L93) overstates the fit.
   - Missing: haplodiploidy as the *mechanism*. A mother controls sex by fertilising an egg or not. That is the most game-able fact in sex allocation.
3. **Fun.** Boring. It is a two-button calculator with a one-number readout. Nothing is at stake within a season, and the population ignores you.
4. **Visual.** Scattered dots on a dark field, then a pink gradient disc for the fig. There is no wasp anywhere in the chapter (screenshot `brood`).
5. **Redesign: "The Fig".**
   - *Core verb:* in a cross-sectioned fig (the visual hook, a lit cathedral of florets), drag each egg into a flower and choose whether to fertilise it (fertilised = daughter).
   - *Loop:* AI foundresses lay; wingless males fight and mate inside; females exit with pollen; you score dispersing granddaughters.
   - *Escalation:* alone ("how few sons can mate everyone?"), then rivals arriving mid-lay, then arriving second to a parasitised host (*Nasonia*, Werren 1980). Zoom out to a population where your sex-ratio allele invades or fails.
   - *Boss:* a sex-ratio driver or *Wolbachia* feminises the population; find the suppressor.
   - *Takeaway:* rarer-sex advantage, equal investment, local mate competition.

### Two Sizes
1. **Play.** Twelve presses of Spawn, with a size slider. Then an 80-generation animation.
2. **Science.**
   - The model is a fair implementation of Parker, Baker & Smith (1972).
   - But the player only ever plays the parasite. In a simulation of the game's own code, holding the slider at "tiny" for all twelve spawnings gave 49% of the sea in five of five runs. Three stars need 40%.
   - The player never needs to understand why large gametes exist.
   - Missing: competing hypotheses (gamete limitation, Levitan 1996, Lehtonen & Kokko 2011; cytoplasmic conflict, Hurst & Hamilton 1992), and the links to mating types and to Bateman's principle.
3. **Fun.** It is solved by one gesture. The Notes probe table (L243–245) also prints the fitness of five sizes.
4. **Visual.** A pleasant dark sea with particles plus a histogram. The histogram is the real content.
5. **Redesign: "First Sex".**
   - *Core verb:* steer your lineage's gamete size in a live plankton sea; fusions happen on contact and zygotes visibly grow or die.
   - *Escalation:* a sea of tiny cells (you must provision), then big cells appear (tiny pays), then your tiny lineage succeeds until tiny-meets-tiny fusions starve it.
   - *Boss:* split your lineage into two mating types that fuse only with each other.
   - *Takeaway:* disruptive selection from the size–number trade-off; sexes defined by gamete size.

### The Lek
1. **Play.** Level 1: five mornings, each with up to eight males seen in sequence; press Next or Choose. Level 2: six seasons of press-and-hold to strut, then release.
2. **Science.**
   - The chapter's subtitle is "Mate choice and runaway" (`ui.js` L6). There is no runaway anywhere. "Runaway" appears only in that string.
   - Level 1's "there is no going back" (`ch6.js` L133) is an odd model for a lek. Lek females compare displaying males simultaneously, revisit over days and copy other females (Gibson, Bradbury & Vehrencamp 1991; Gibson 1996).
   - The handicap level is fine (Grafen 1990). Its optima (display 2.1 poor, 3.75 average, 6.6 prime) are stated in the maths text (L137) and drawn as payoff curves in Notes (L221).
   - Missing: Fisher–Lande–Kirkpatrick runaway; the lek paradox and genic capture (Kirkpatrick & Ryan 1991; Rowe & Houle 1996); direct versus indirect benefits; Andersson's (1982) widowbird tail experiment.
3. **Fun.** Level 1 is a secretary problem in feathers: abstract, with numbers floating over identical birds. Level 2's hold-to-strut is the right instinct, but there is no rhythm, no rival and no audience reaction beyond a percentage.
4. **Visual.** Soft dawn palette and cute grouse. But the birds are static, and females are grey lozenges.
5. **Redesign: "The Strutting Ground".**
   - *Female side:* walk a hen across a living lek; closer means clearer display but more exposure; other hens' choices are visible.
   - *Male side:* a rhythm game inflating air sacs on the beat, limited by a condition meter.
   - *Population act:* preference and ornament coevolve via genetic correlation until viability selection stops the runaway. Interlude: cut and glue widowbird tails (Andersson).
   - *Boss:* the lek paradox. Variation is gone and choosiness worthless; condition dependence restores it.

### The Raffle (favourite)
1. **Play.** Level 1: split 100 sperm units across six females with known rival sperm. Level 2: choose a seminal-fluid dose for five females, with a day-by-day plot of her eggs. About 4 minutes.
2. **Science.**
   - The core maths is right (s/(s+R), equalise marginal gain, L260).
   - "A virgin female is a raffle with only your tickets in it" (L261) and "the best plan spends almost nothing on virgins" (L295) hold only because the model forbids remating after you. In Parker's sperm-competition *risk* models, a first male still invests in proportion to the chance of later rivals (Parker 1990; Parker et al. 1997). Real males sometimes give virgins more (Wedell, Gage & Parker 2002).
   - Citing dung flies (L259) for a fair raffle is incongruous: *Scathophaga* is the classic case of last-male *displacement* (P2 ≈ 0.8), and Parker's copulation-duration result is a marginal-value prediction (Parker & Stuart 1976), an unmade bridge to The Forager.
   - The rival sequence is fixed and unseen, yet scored against an omniscient plan.
   - Level 2: Chapman et al. 1995, Wigby & Chapman 2005 and Rice 1996 are correctly cited. But "best for her" is above zero (dose 1 for young females, 4–5 for old). That implies female egg-laying is suboptimal without male manipulation, which the text never acknowledges.
   - No MODEL caveat exists for this chapter in `ch99.js`.
3. **Why it works.**
   - One clear equation and a budget that creates tension across females.
   - The reveal (eggs colouring blue or grey) is legible at a glance.
   - Level 2's life-bar plot is the best explanatory graphic in the slice.
   - Weaknesses: no planning horizon, no replay value (same rivals every run), and the "race" is decorative.
4. **Visual.** Swimming sperm and an egg cluster: simple but readable, the most "biological" scene in section V.
5. **Redesign.**
   - Keep the core, but show the queue of upcoming females (uncertain rival counts) so planning is a skill, and make the race physical (thousands of particles, storage organs, precedence).
   - *Levels:* dung-fly pat (real-time copulation duration under last-male displacement, guard versus search); horns versus testes (Simmons & Emlen 2006); seminal fluid, as now.
   - *Boss:* cryptic female choice. The hen ejects subordinate males' sperm (Pizzari & Birkhead 2000).

### The Selfish Spindle
1. **Play.** L1: breed up to six litters of eight, then name who cheats and how often. L2: ten eggs; press Reorient against a hidden division timer. L3: two cages; choose a gene-drive target, release, watch 20 generations.
2. **Science.**
   - The text is accurate and well referenced: t-haplotype (Lyon 2003), Chmátal et al. 2014, Akera et al. 2017, Malik & Henikoff 2001, Kyrou et al. 2018.
   - L1 doubles as a good statistics lesson (exact binomial test).
   - Simplifications: the t-haplotype's distorter/responder system is described as a sperm "poison"; and the genome's suppressors, which the end card names as the crux (L19), are never played.
   - Missing: sex-ratio drive (X-drive in *Drosophila* and stalk-eyed flies), an obvious tie-back to Fisher's Brood.
3. **Fun.** L1 is a decent detective task. L2 reduces to "reorient when facing the polar body, otherwise wait", with luck deciding. L3 has one obvious choice (doublesex, after being told conserved targets resist), then watching.
4. **Visual.** Mice are charming. The spindle is the most striking cell-biology image in the game. The cage is a noisy dot field over a line chart.
5. **Redesign.**
   - *L2:* an arms race over generations. Buy centromere repeats; the host evolves CENP-A and spindle changes that cancel them (a Red Queen inside one genome).
   - *L3:* drive releases on a map of villages and islands, choosing target, release size and timing.
   - *Boss:* resistance appears; build a multiplexed drive or an X-shredder. End with an ethics card.

### The Meadow
1. **Play.** L1: three meadows × three blooms. Cycle through colour (4), shape (3), day or night, and nectar, then read the visit log. L2: eight generations of a spur-length slider against moth tongue length.
2. **Science.**
   - The subtitle is "Pollination and fertilisation" (`ui.js` L6). There is no fertilisation content: no self-incompatibility, no selfing versus outcrossing, no pollen competition.
   - The syndrome text sensibly says syndromes are tendencies (L24).
   - Darwin, Nilsson (1988) and the Wasserthal (1997) debate are good.
   - Minor: the moth is now usually treated as a full species, *Xanthopan praedicta* (Minet et al. 2021).
   - L2's best spur is always mean tongue + 4–4.5 cm (computed 22.5 / 29.4 / 39.2 cm for tongues of 18 / 25 / 35 cm). After one generation it is a constant offset.
3. **Fun.** L1 is a 48-combination lock with three guesses. You learn the lock, not the pollinators. L2 is a slider repeated eight times.
4. **Visual.** The alpine meadow is one of the prettier scenes, with bees arriving and ✓/✗ marks. The orchid and moth in L2 are a schematic ruler.
5. **Redesign.**
   - *L1:* your plant *population* varies and pollinators visibly shift its trait distribution, with a "bee vision" toggle (UV on, red greyed). Base it on the *Mimulus* YUP swap (Bradshaw & Schemske 2003).
   - *L2:* orchid and moth as two coevolving distributions.
   - *L3 "The Style":* a pollen-tube race; S-alleles reject self pollen and rare S-alleles sire more seeds (Wright 1939).
   - *Boss:* a pollinator-collapse year. Selfing gives assurance; inbreeding depression bites next year.

---

## VI. FAMILIES AND SOCIETIES

### Alarm Call (favourite)
1. **Play.** L1: eight timed attacks (3.0 s shrinking to 1.8 s). Read collars and sex, sum r, then Call or Stay silent. L2: eight springs of Help versus Breed from two printed numbers.
2. **Science.**
   - **The hawk/coyote costs are inverted.** The chapter's own text says hawk whistles let "callers themselves usually escape", while trills at coyotes warn kin "at a cost to the caller" (`ch7.js` L174, citing Sherman 1985). The model charges hawk calls the *highest* cost (0.22) and coyote calls the lowest (0.08) (L175, L180). Sherman (1985) concluded whistles to hawks are largely self-preserving; nepotism belongs to the costly terrestrial-predator trill (Sherman 1977). The game teaches the opposite of its citation.
   - "Ochre collar … mother, sister or daughter, r = ½" (L175) ignores multiple paternity. Belding's litters are frequently multiply sired (Hanken & Sherman 1981), and females treat full and half sisters differently (Holmes & Sherman 1982). That is a ready-made inference puzzle the game skips.
   - L2's Seychelles-warbler payoff counts only indirect fitness. Subordinate helper females often gain maternity in the dominant's nest (Richardson et al. 2001).
   - No MODEL caveat.
3. **Why it works.** Time pressure, a predator closing in, and reading kinship from appearance make it the most game-like decision in section VI. But there are no consequences (no squirrel dies), and L2 is a worksheet.
4. **Visual.** Readable but crude. Squirrels are small blobs and the hawk is a dark sliver. L2 shows two lollipop trees.
5. **Redesign: a lineage game in a colony you know by face.**
   - Relatedness comes from a family tree you watch being built (multiply sired litters, natal burrows). Call wrongly and relatives die; recklessly and *you* die, continuing as your daughter.
   - *Escalation:* known kin, inferred kin, two predators with correctly signed costs (let the player *test* which call is nepotistic), helpers with direct benefits.
   - *Boss:* the caller-allele map across the meadow, where male dispersal explains silent males.

### The Nest
1. **Play.** L1: choose a clutch size, then tap chicks for 20 s while food arrives (three springs). L2: twelve visits, each Quiet, Call or Scream. L3: five binary hatch-order choices against a printed 71% break-even.
2. **Science.**
   - **Eggs are free in L1.** Unfed chicks cost nothing and the food rate is fixed, so a larger clutch never lowers the score (`bestVal1`, L30). Lack's trade-off ("lay too many and they may all starve together", L12) appears only if the player spreads food evenly.
   - The "cold spring" surprise arrives after laying, but scoring assumes the clutch was chosen with foreknowledge.
   - L2's inclusive-fitness accounting (self + ½ × each sibling) is correct. But the parent is a passive lottery weighted by begging, so honest signalling of need (Godfray 1991) versus scramble competition (Parker, Royle & Hartley 2002) never arises.
   - L3 is fine, after Mock 1984 and Anderson 1990.
   - Missing: genomic imprinting (Haig's kinship theory) and brood parasites.
3. **Fun.** L1's frantic chick-tapping is fun for one spring. L2 and L3 are comparisons of printed numbers.
4. **Visual.** A big brown nest ellipse with small chicks and fullness bars. Nothing fledges and nothing dies on screen, except a fade in L3.
5. **Redesign.**
   - *L1:* eggs cost energy, chicks beg audibly, and a cost-of-reproduction meter carries into next year.
   - *L2:* begging against a parent whose response rule *evolves*, so honest begging emerges. *L3:* egret siblicide. *L4 "The Placenta":* paternal versus maternal alleles (Igf2/Igf2r).
   - *Boss:* the cuckoo chick, a signal-detection accept-or-reject problem (Davies 2000).

### The Commons
1. **Play.** L1: two toggles predicting rise or fall, then one animation. L2: three microbes; pick a group size with − and + and run. About 2 minutes.
2. **Science.**
   - Level 1 (Simpson's paradox, Price partition) is correct and well shown.
   - **Level 2 teaches weak altruism as if it were altruism.** Producer fitness 1 + bp − c includes the producer's own good (L12). So "producers spread when b/k > c" is the condition for a *net direct benefit to the actor*. That is individual selection: weak altruism in Wilson's sense (West, Griffin & Gardner 2007).
   - "In groups founded at random, the relatedness r is … 1 in the group size" (L11) is defensible only in Pepper's whole-group accounting. To an undergraduate it says that random grouping substitutes for kinship.
   - The bridge card in `ch99.js` L62 says the same: "What if helpers are simply grouped together?". With zero self-benefit, randomly founded groups never favour producers.
   - Level 1's jars (90/60/35/10%) are hand-made with high between-group variance. That variance is exactly the assortment the player is never told is needed.
   - To verify: I believe the Chuang, Rivoire & Leibler (2009) public good was a quorum signal inducing resistance, not an "antibiotic-degrading" product (L11).
3. **Fun.** It is a quiz, then three applications of b/k > c, which the Notes print (L58).
4. **Visual.** Jars of dots plus Price bars. That is good data visualisation and nothing more.
5. **Redesign: "The Biofilm".**
   - Producers emit a glowing diffusing good; the player controls *population structure* (bottleneck size, dispersal radius, shaking), never the strategy. A self-benefit dial makes strong versus weak altruism visible.
   - *Levels:* kin competition with siderophores (Griffin, West & Buckling 2004); invertase snowdrift coexistence (Gore et al. 2009).
   - *Boss:* cheaters exploit your structure; policing or privatisation must evolve.

### Many Become One
1. **Play.** L1: ten days of Start settling, then a well-timed Transfer. L2: a 40-second whack-a-mole on red cheater cells.
2. **Science.**
   - L1 matches Ratcliff et al. (2012). Settling ∝ N^(2/3) is a correct Stokes scaling.
   - L2's cheater mutation rate is 6% *per division* (`MU2`, L3), orders of magnitude off. It teaches that cheaters are everywhere.
   - The end card's key idea, a single-cell bottleneck that makes every body a clone (L54), is stated, not played.
   - Missing:
     - germ–soma division of labour (*Volvox*);
     - aggregative multicellularity and its cheaters (*Dictyostelium*: Strassmann, Zhu & Queller 2000);
     - the major-transitions framing (Maynard Smith & Szathmáry 1995).
3. **Fun.** L1 has a genuine risk/reward tension: transfer early for strong selection or late for safety. L2 is a reflex test unconnected to evolution.
4. **Visual.** A beige tube with brown specks. The cheater clump is legible but static.
5. **Redesign.**
   - *L1:* a physical tube, ending when apoptosis evolves. *L2 "Volvox":* allocate cells to swimming or reproduction and hit the flagellation constraint.
   - *L3:* design the life cycle (bottleneck, germline timing, apoptosis) and watch cheaters across *generations*.
   - *Boss:* *Dictyostelium*, where mixed clones aggregate and cheaters dodge the stalk; evolve kin discrimination.

---

## VII. LIVES AND BEHAVIOUR

### Live Fast
1. **Play.** L1: two lives of up to 8 years, setting a breeding-effort slider. L2: three egg sizes from six options. L3: four binary r-or-K choices.
2. **Science.**
   - Among foxes, the dynamic-programming optimum is 100% effort at every age. L1 is solved by slider-right, eight presses.
   - Ageing is imposed (×(1 − 0.06·age) in both lives, L18). Yet the text cites Austad's (1993) slower-ageing island opossums (L10), a result about the *evolution of senescence* that the model cannot produce.
   - Missing: Medawar–Williams–Hamilton senescence theory (with Abrams' 1993 caveat), Reznick's guppies, semelparity, and why trade-offs can be invisible across individuals (van Noordwijk & de Jong 1986).
   - L3 reduces density-dependent selection to "empty: 8 > 3; crowded: 12 > 8" (L42).
3. **Fun.** It is the weakest chapter in the slice: three calculators in a row.
4. **Visual.** The "foxes" are orange ellipses with tail fins; they read as fish (screenshot `live1`). L3 is a green rectangle with specks.
5. **Redesign: "One Life".**
   - A short roguelite life (forage, flee, breed), then zoom out to evolving allocation genomes. Smith–Fretwell as a continuous drag where the tangent draws itself.
   - *Boss: Trinidad.* Move guppies above a waterfall and watch maturity and brood size evolve (Reznick et al. 1997).
   - *Twist:* age-specific mutations pile up in the "selection shadow" until ageing itself evolves.

### The Forager (favourite)
1. **Play.** Five levels, about 8–10 minutes:
   - starling central-place loads (tap grubs, press Fly);
   - great-tit conveyor;
   - berry bushes (MVT);
   - meadow versus hedge under a hawk (head up or down, Dive);
   - junco risk-sensitivity (steady versus lucky feeder over ten visits).
2. **Science.**
   - Mostly sound: Kacelnik 1984, Charnov 1976, Lima & Dill 1990, Caraco et al. 1980, Stephens 1981.
   - "When large ones were common the birds ignored the small ones" (L10) overstates Krebs et al. (1977). Their tits showed *partial* preferences.
   - The belt shows prey for 3.2 s, so encounters are simultaneous rather than sequential. A look-ahead player can beat the "best", and the score's 100% cap hides it.
   - Support for the energy-budget rule is mixed: animals are usually risk-averse over amounts (Kacelnik & Bateson 1996).
   - Notes print the optimal load per trip (L156).
3. **Why it works.**
   - Embodied: you *feel* diminishing returns as the gaps between grubs stretch.
   - The leave decision is made under a ticking clock.
   - L4 adds fear.
   - Weaknesses: items appear one at a time (tap–wait–tap), L1 and L3 are the same mechanic, and the bird is tiny.
4. **Visual.** Clean pastel scenes and an evocative conveyor. Sparse otherwise.
5. **Redesign.**
   - Merge the five levels into one day of one bird's life on a map (nest, patches, hedge, hawk, sunset), with levels as stacking modifiers.
   - After each trip, draw the gain curve and MVT tangent from *your* data. Add producer–scrounger flockmates (Barnard & Sibly 1981).
   - *Boss:* the winter night, with variance, predation and reserves at once.

### The Crowd
1. **Play.** L1–2: ten rounds each of Left versus Right feeder, comparing rate ÷ (fish + 1). L3: eight cascade puzzles (count Ls and Rs, then add your clue).
2. **Science.**
   - The ideal-free-distribution (IFD) maths is right, and the cascade logic follows Bikhchandani et al. (1992) correctly.
   - "So each got about the same intake" (L10) is an inference, not Milinski's finding. Later work found unequal individual intakes (Milinski 1984; Harper 1982), and undermatching is the norm (Kennedy & Gray 1993).
   - The crowd converges on the IFD regardless of the player (L34). The player is a calculator outside the process that the chapter is about.
3. **Fun.** L1–2 are long-division drills. L3 is a neat logic puzzle with no world attached.
4. **Visual.** Identical fish blobs in two static clusters. Pellets fall but nobody eats them. L3 shows two bushes and a line of chevrons.
5. **Redesign.**
   - Swim one fish among 24 animated fish that move by a simple rule ("leave if my intake is below average"). The IFD then *emerges*, and you feel interference and travel costs produce undermatching.
   - Add big shovers, and a despotic territory-holder as the boss.
   - L3: animated birds streaming to bushes. The player learns to discount the herd's tail.

### Shape-shifters
1. **Play.** L1: twelve Helmet or No choices given a clue and a stated reliability. L2: three multiple-choice questions from a reaction-norm chart.
2. **Science.**
   - The Bayesian threshold (q > 0.15/0.65 ≈ 23%) is correct. Tollrian 1995, Agrawal et al. 1999, Clausen–Keck–Hiesey and Cohen 1966 are well chosen.
   - The "Generalist" line (6 → 6, L77) has a *flat* reaction norm. It is canalised, the opposite of plastic. The chapter about plasticity makes its winning answer the non-plastic line without saying so.
   - The twenty-season geometric-mean scenario (L78, L89) is computed analytically and never shown. That throws away the most dramatic image available: a specialist lineage crashing in a run of bad years.
   - Missing: genetic assimilation (Waddington 1953), polyphenisms, costs and lags of plasticity, and diversified bet-hedging (seed dormancy fraction).
3. **Fun.** A probability worksheet followed by a quiz.
4. **Visual.** A single white Daphnia ellipse; then a three-line chart.
5. **Redesign: "Pond".**
   - Kairomone clouds drift through a pond; draw your clone's reaction norm as a curve and watch it compete over seasons.
   - *Levels:* maternal transmission versus lag; Waddington's assimilation; a desert seed bank with a germination dial and an animated 50-year run.
   - *Boss:* the climate regime changes; choose plasticity, bet-hedging or genetic tracking.

---

## Missing concepts in this area

All of these are absent from the whole game (checked by grep).

- **Bateman's principle and the operational sex ratio.** *"Who Cares?"* In a pipefish-like species, the player toggles which sex broods. The OSR flips, and the dimorphism and choosiness meters migrate to the other sex (Trivers 1972; Kokko & Jennions 2008; jacanas, phalaropes). This is the missing bridge from Two Sizes to The Lek.
- **Fisherian runaway and the lek paradox.** Folded into The Lek redesign above.
- **Alternative reproductive tactics.** *"Rock, Paper, Lizard"*: place territories as side-blotched lizard morphs (orange, blue, yellow sneakers) and watch the colour wheel cycle (Sinervo & Lively 1996).
- **Sex determination.** *"The Warm Nest"*: dig turtle nests in sun or shade; temperature sets sex, warming feminises the beach, and Charnov–Bull logic says when that pays. Trivers–Willard as a follow-up.
- **Eusociality and worker policing.** *"The Hive"*: workers versus queen over the sex ratio (3:1 versus 1:1; Trivers & Hare 1976). When the queen mates multiply, workers eat each other's eggs (Ratnieks 1988); monogamy as the origin of eusociality (Hughes et al. 2008).
- **Brood parasitism and recognition errors.** *"The Cuckoo"*: as a reed-warbler host, eject eggs. Mimicry improves, and your acceptance threshold trades rejection errors against acceptance errors (Reeve 1989; Davies 2000). It plays like Bitter Wings, a favourite.
- **Evolution of senescence.** *"The Selection Shadow"*: drag mutations onto an age axis, with late-acting harm invisible to selection. Antagonistic pleiotropy is a "free youth, pay later" card.
- **Genomic imprinting and kin conflict within the genome.** In The Nest redesign.
- **Self-incompatibility and mating systems in plants.** In The Meadow redesign.
- **Greenbeards.** *"Red Fire"*: fire-ant workers kill queens lacking Gp-9 b (Keller & Ross 1998); falsebeards show why greenbeards are rare.
- **Cultural evolution.** *"Song School"*: young birds copy tutors, dialects drift, and copying error is cultural mutation.

---

## Cross-cutting observations

1. **Show selection, not choice.** Every chapter in VI–VII makes the player *an animal deciding*. Add a standard second act where the player's strategy becomes an allele competing in a visible population (an invasion view), and make existing populations (Brood, Crowd) respond to selection, not a script. This is the biggest conceptual fix.
2. **Kill bang-bang decisions.** Brood (acts 1–2), Live Fast (foxes), Two Sizes, the Nest hatch order, Crowd and Plastic L2 each collapse to a corner or a printed threshold. Good game decisions are continuous, uncertain, and change because of what the player did last time.
3. **The Notes tab is a spoiler.** Forager, Lek, Two Sizes, Live Fast, Plastic, Commons, Nest and Crowd print the optimum. Move optima to the post-round debrief; during play, show only raw observations.
4. **One currency, no consequences.** "% of the best possible" is the score in 9 of 14 chapters. Use in-world currencies (granddaughters dispersing, chicks fledging, a lineage surviving), and make failure visible: dead squirrels, empty nests, crashed lineages.
5. **Mislabels and caveats.** Fix "Mate choice and runaway" and "Pollination and fertilisation", or build what they promise. `ch99.js` MODEL caveats cover only Many and Crowd here; Raffle (no remating), Alarm (cost signs), Nest (free eggs) and Commons (self-benefit) need them most.
6. **Visual standard.** The art is placeholder geometry with large empty areas, and outcomes are announced in text (no fledging, no predation, no wasps). Adopt one illustrated field-notebook style and make every result an animation before any number appears.
7. **Consolidate.** Fourteen thin chapters could become four deep campaigns:
   - *Sex:* Two Sizes → Bateman → Lek → Raffle → Spindle, with one species throughout.
   - *Kin:* Alarm → Nest → Hive → Commons → Many.
   - *Foraging:* Forager + Crowd, as one map.
   - *Uncertain lives:* Live Fast + Shape-shifters.
