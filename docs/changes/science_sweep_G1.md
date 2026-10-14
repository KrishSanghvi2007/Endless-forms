# Science sweep G1: Heredity and Chance

Files: `games/endless-forms/source/ch1.js` (Mendel's Garden L1, Drift Casino, `CH_BROOD_V1`), `ch4.js` (Crossing Over, The Castaways), `ch16.js` (The Fancier, The Coalescent), `ch17.js` (Why Sex?), `ch13.js` (The Census, The Clinic).

Sources: `docs/reviews/R1`, `R3`, `R4`, and the fact-checks `R7_factcheck_R1` and `R7_factcheck_R3`, which win where they disagree with a review. I checked every claim again. I re-ran the Drift Casino, Clinic, Coalescent and Why Sex? models in Node using the game's own rules; the numbers below come from those runs.

The edits are to text, except one model fix (Why Sex? fathers) and two display fixes (the Casino Notes share, and the Why Sex? Notes row for the level being played).

## Changes

| file:line | chapter | before (short quote) | after | why | source / check |
|---|---|---|---|---|---|
| ch17.js:24–26 (`gen1`) | Why Sex? | **MODEL.** Sexual young got a father picked at random: `const d = P[(R() * P.length) \| 0]` | Fathers are now picked in proportion to fitness (cumulative weights with a binary search, so it stays fast for 200 individuals) | Harmful mutations cost only the mother's side, so the sexual load was e^(−2U) ≈ 37%, not the e^(−U) ≈ 60% the maths text promises. Simulation, 300–400 runs per strategy. **L1, before:** all-sex ended at a median fitness of 0.38 and **went extinct in 31% of runs**. Sex looked like the cause of meltdown. **L1, after:** all-sex ends at 0.60, matching e^(−U). **L2, before:** all-asexual put A and B together *better* than sex (AB carriers at gen 40: 37% asexual, 15% all-sex, 14% "sex then clone"). That contradicts the level's own lesson. **L2, after:** 35% asexual, 66% all-sex, 69% sex-then-clone. | Haldane–Muller load principle; Kimura & Maruyama 1966. Own simulations (`scratchpad/sweep/sex2.js`, `sex3.js`). |
| ch17.js:12 | Why Sex? | "The twofold cost is built in: sexual blocks produce half the births." | Births are halved, but there are usually more young than places, so here the cost shows mainly in the third star. In nature the twofold cost bites when clones and sexual females compete in one population (a clone out-breeds its neighbours two to one). Choosing for the whole pond sidesteps that harder puzzle. | The model contradicted the text: the `slice(0, K)` ceiling discards the surplus. The text also hid the group-level framing. | R7-R1 D5, A24; Maynard Smith 1978. |
| ch17.js:47 (end card) | Why Sex? | "Sex halves your births, and still it wins where it matters." | "Sex halved your births, but the pond usually refilled either way … The real puzzle is why a clone arising inside a sexual population, out-breeding its neighbours two to one, does not take over before benefits like these can count." | The same problem as the row above. Benefits that accrue to the group do not explain why sex is kept. | R1 "Why Sex?"; R7-R1 A24, D5; Williams 1975. |
| ch17.js:11 | Why Sex? | "can never rebuild it"; "selection is less effective when genes cannot be recombined." | "short of rare back-mutations, can never rebuild it"; "(the Hill–Robertson effect)" | Back-mutation is the only way back. The idea is now named. | Muller 1964; Hill & Robertson 1966; Felsenstein 1974; R7-R1 A27. |
| ch17.js:13 (idea 1) | Why Sex? | "every birth adds a few" | "about one for every two births" | U = 0.5 per birth. | Model constant `U: 0.5`. |
| ch17.js:13 (idea 2) | Why Sex? | "a new parasite arrives that only individuals carrying both can survive" | "kills most individuals not carrying both" + "This is the Fisher–Muller idea. The parasite here is a one-off change, not an enemy that keeps evolving, as in the Red Queen idea of Lock and Key." | In the code, 15% and then 10% of non-carriers survive. The level models Fisher–Muller, not the Red Queen. | Code L27; R1, R7-R1 A26. |
| ch17.js:45 (L2 note) | Why Sex? | "The steadiest strategy here was to mix … much as aphids and water fleas switch modes." | "A good strategy here was to mix … Many real organisms, such as aphids and water fleas, also mix the two modes." | Mixing is not the steadiest (all-sex survives just as often after the model fix). Aphids and water fleas do not switch for this reason: they switch to sex with seasonal cues. | Simulation; Simon et al. 2002. |
| ch17.js:16, 57 (Notes) | Why Sex? | "Room for 40." and "Fitness is 94% per harmful mutation" in both levels | Shows 200 and "No harmful mutations in this level. A and B each add 30% to births." in L2, keyed to the level actually being played (`plv`) | Wrong in L2 (K2 = 200, no harmful mutations). | Code. |
| ch1.js:22 | Mendel | "he inferred that each plant carries two copies of each hereditary factor …"; the test cross "is still how breeders and geneticists unmask carriers" | "he inferred what we would now put this way: each plant carries two copies …"; "is still a standard way for breeders to unmask carriers" | Mendel wrote pure lines as A, not AA. "Two copies" is the later reading. Carriers are now often found with DNA tests. | Olby 1979, "Mendel no Mendelian?" |
| ch1.js:99 (Notes) | Mendel | A selfed purple plant with no white got "No white: at least one parent is probably pure. This cross can't say which."; white seeds from crosses with W "handed over a hidden white copy" | Selfed rows: "No white in ten from selfing: probably pure. A selfed carrier gives no white about 1 time in 18 (¾¹⁰) …"; a selfed carrier gets its own line; crosses with W say "a white copy" | The text was nonsense for a plant crossed with itself. W's white copy is not hidden. | (3/4)¹⁰ = 0.056. |
| ch1.js:115 (maths) | Drift Casino | "drift's speed scales with population size"; "A jar of 300 barely changes in thirty generations" | "drift is fast only when the population is small"; 2pq shrinks "on average"; "A jar of 300 keeps about 90% of its variation over thirty generations and almost never settles" | Drift speed scales *inversely* with N. A 300-bead jar does move: 20,000 runs give an SD of 0.14 in blue's share after 30 generations, a mean shift of 11 points, and 0.2% settled. | (1 − 1/300)³⁰ = 0.905; own simulation. |
| ch1.js:177 (end card) | Drift Casino | "a 15% edge nearly guarantees victory in a jar of 40, but in a jar of 6 it barely beats a coin toss"; "a jar of 6 settles within a few generations, while a jar of 300 hardly moves"; "a single founding pair" | "a near-certain eventual winner in a jar of 40, though it often needs more than thirty generations; in a jar of 6 it lifts blue's chance from about one in three to about one in two"; "usually settles within ten generations … almost never settled after thirty"; "just two gene copies" | Simulated with the game's rules. Jar of 40: 62% fixed within 30 generations, 97% eventually. Jar of 6: 53% against 33% neutral. Jar of 6: 80% settled by generation 10. Beads are gene copies, so 2 beads are one diploid, not a pair. | R7-R1 D6, D17, B11; own simulation; Kimura 1962 formula gives 0.97 and 0.50. |
| ch1.js:201 (Notes) | Drift Casino | "Its chance of eventually taking over the jar is exactly this share" in every jar; share computed as n/N | In selection jars: "With selection, blue's chance of eventually taking over is higher than this share: the advantage tilts the odds." Share is now n/cur. | False when s > 0. During the bottleneck generation the jar holds 2 beads, not 200, so n/N gave the wrong share. | R7-R1 D4. |
| ch4.js:7 | Crossing Over | "They are why you are not a copy of either parent's chromosomes" | "They are why each chromosome you inherit is a patchwork of a parent's two copies" | You differ from each parent because you inherit half from each, with or without crossing over. What crossovers do is make each inherited chromosome a mosaic of the parent's two copies. | Standard. |
| ch4.js:11 | Crossing Over | "In 1913 his undergraduate Alfred Sturtevant turned that into the first genetic map" | "In 1911 Alfred Sturtevant, still an undergraduate in the lab, turned that into the first genetic map (published in 1913)" | He made the map one night in late 1911. He graduated in 1912 and published in 1913. | Sturtevant 1913, *J Exp Zool* 14:43; Sturtevant 1965, *A History of Genetics*. |
| ch4.js:14 (idea L1) | Crossing Over | (nothing on where crossovers fall) | "In a real cell nothing chooses where they fall: their positions are a matter of chance, with some hotspots. Here you place them yourself, to see what the best luck could do." | Level 1 implied that cells place crossovers to build good gametes. | R1; R7-R1 A8, B4 (hotspots, PRDM9). |
| ch4.js:48 (L2 HUD) | Crossing Over | "recombination between each pair of fruit-fly genes, from test crosses" | "… between each pair of five fly genes Sturtevant mapped, as test crosses would measure it (from modern map positions)" | The positions (0, 1.5, 33, 36.1, 54.5) are modern, not Sturtevant's 1913 values (0, 1.0, 30.7, 33.7, 57.6). The rates are computed with Haldane's function, not measured. | R7-R1 D19. |
| ch4.js:143 | Castaways | "written into island faunas everywhere"; Isle Royale "rescued the pack for a time" | "written into many island populations"; "rescued the island's wolves for a time" | "Everywhere" overstates the case. Isle Royale held several packs, and M93's genes spread through the whole population. | Adams et al. 2011; Hedrick et al. 2014. |
| ch4.js:144 | Castaways | "Most harmful mutations are recessive and hidden in carriers"; "about one migrant per generation to keep a small population from drifting apart (Mills and Allendorf 1996)" | "at least partly recessive, so carriers hide much of their harm"; "at least one migrant per generation to stop a small population drifting away from the rest of its species; Mills and Allendorf (1996) suggested between one and ten" | Mildly harmful mutations average h ≈ 0.25, and the model uses h = 0.2. Mills & Allendorf recommended 1–10 migrants per generation. | R7-R1 D21; Agrawal & Whitlock 2011; Mills & Allendorf 1996. |
| ch4.js:147 (idea L2) | Castaways | "usually hidden … one good copy covers for one bad one" | "mostly hidden … one good copy largely covers for one bad one" | Partial recessivity (`HD: 0.2`). | Code. |
| ch4.js:217 (end card) | Castaways | "it has saved real populations, from Florida panthers to Isle Royale's wolves" | "it has helped real populations, from Florida panthers to — for a while — Isle Royale's wolves" | The rescue on Isle Royale was temporary. The population fell to two wolves by 2016, as the chapter's own `real` text says. | Hedrick et al. 2014, 2019. |
| ch16.js:10 | Fancier | "Within about ten generations some foxes wagged their tails …"; "The same 'domestication syndrome' appears in dogs, pigs, cattle and rabbits" | "Within six generations …"; "Similar traits are reported in … a pattern called the 'domestication syndrome' … debated, as do how consistent the syndrome really is and …" | The first tail-waggers appeared in generation 4 and the "elite" class in generation 6. The syndrome's existence as a coherent package is itself contested. | Trut 1999; Lord et al. 2020; Sánchez-Villagra et al. 2016. |
| ch16.js:11 | Fancier | "the correlated response is h₁ h₂ r_G S ÷ σ₁" | "h₁ h₂ r_G (S ÷ σ₁) σ₂, where σ₁ and σ₂ are the two traits' standard deviations" + a sentence: six breeders raise F by about 1/12 a generation, and the model leaves out the health cost | The formula was missing σ_P2. Inbreeding with Ne ≈ 6 is large and was not mentioned. | Falconer & Mackay 1996; R7-R1 D10, A36. ΔF = 1/(2Ne). |
| ch16.js:43 (end card) | Fancier | "Artificial selection is natural selection with a human choosing the survivors"; "drags the others with it, as in Belyaev's farm" | "works like natural selection, except that a human chooses who breeds"; "Something similar may have happened on Belyaev's farm, though the causes there are still debated." | The first phrase is self-contradictory. The second states a contested cause as fact. | Lord et al. 2020. |
| ch16.js:71, 91 | Coalescent | "Most of the depth of a tree is the wait for its final merge"; "most of the time is spent waiting for the last two lineages" | "Over half …" | E[T₂]/E[T_MRCA] = 1/(2(1 − 1/n)) ≈ 53% for n = 20 (simulated: 20 of 37.3 generations). "Most" invites a belief in about 90%. | Kingman 1982; own simulation. |
| ch16.js:97 (end card) | Coalescent | (nothing on sweeps) | "(A selective sweep can also leave a star, but only near the selected gene; an expansion leaves stars across the whole genome.)" | This is the standard confound when reading trees. | R1; R7-R1 B9. |
| ch13.js:7 | Census | "When a census departs from it, something is happening." | adds "— though a good fit does not prove that nothing is." | Fit to HW is not evidence of no evolution. | R7-R1 D2, B6. |
| ch13.js:11 | Census | Allison: carriers "survived malaria better than either homozygote" | "had fewer and milder malaria infections than people with none, while people with two copies had sickle-cell disease: heterozygotes did best" | SS homozygotes do worse because of sickle-cell disease, not malaria. Allison measured parasitaemia and infection rates. | Allison 1954, *BMJ* 1:290. |
| ch13.js:12 | Census | (χ² with twenty snails) | adds "and the test is only rough when any expected count is below five" | With p = 0.85 strata the expected aa count is about 0.45, so the p-value in Notes is unreliable. | Standard χ² rule of thumb; R4. |
| ch13.js:13 (idea L2) | Census | "Heterozygote advantage adds heterozygotes by selection" | "With heterozygote advantage, homozygotes die more often before adulthood" | Selection removes homozygotes; it does not add heterozygotes. | Standard. |
| ch13.js:48 (end card) | Census | "Hardy–Weinberg is dull on purpose: it is what genotypes look like when nothing interesting is happening"; "the same pooled numbers could come from any of these causes" | "Hardy–Weinberg is a null model: a departure tells you something is going on, but a good fit does not mean nothing is …"; "a pooled deficit could come from inbreeding or from pooling, and only the right subsets tell them apart" | The old card actively taught the misconception. A heterozygote excess cannot come from inbreeding or pooling. | R7-R1 D2 (priority 2), A13. |
| ch13.js:75, 80, 108, 113, 126 | Clinic | "The immune system can mop up a small infection on its own"; "The immune system can finish off a small infection"; HUD "(the immune system can handle this)"; "then letting the immune system finish"; "immune system copes below here" | "helps, though on its own it is too slow to finish within ten days"; "joins in and gentler doses can finish it off"; "small enough for the immune system to help"; "In this model, hitting hard early, then finishing with low doses while the immune system helps … in real patients the best dose and course length are still debated"; "helps below here" | In the model, 8-fold growth against 90% clearance nets ×0.8 a day. 5,000 cells take 39 drug-free days to clear, and 6,400 cells left after high, high take 40. Every toxicity-6 cure needs two late low doses. | R7-R3 M8, CL2; own brute force (`clinic.js`). |
| ch13.js:79 | Clinic | "the immune system removes 90% a day." | adds "against 8-fold growth that shrinks an untreated infection by only a fifth a day" | Makes the model honest. | Code. |
| ch13.js:76 | Clinic | "a third for finding the gentlest cure in both (toxicity 6 and 9)" | "a third for gentle cures in both (toxicity 6 or less in level 1, 9 or less in level 2)" | The gentlest L2 cure is toxicity 8 (A, then A+B twice). The code's threshold is ≤ 9, so the text now states it as a threshold. | R7-R3 M9; own brute force (48 tox-8 sequences). |
| ch13.js:78, 116 | Clinic | "Resistance is not caused by antibiotics"; "Mutants resistant to most single drugs" | "mostly selected by antibiotics, not caused by them"; "many single drugs"; end card "mostly not caused" | Sub-inhibitory doses can induce SOS mutagenesis and spread resistance genes. Not every drug has single-step resistance. | Cirz et al. 2005; Beaber et al. 2004; R7-R3 M10. |
| ch13.js:78 | Clinic | (only course length was flagged as debated) | adds "Even 'hit hard' is questioned: when resistant cells are already present, killing all their competitors can speed their takeover (Read, Day and Huijben 2011)." | The chapter preached aggressive treatment as settled. | Read, Day & Huijben 2011, *PNAS* 108 S2:10871; R3, R7-R3 CL2, CL3. |
| ch13.js:112 | Clinic | "the treatment selected the mutants that were there from the start" | "the treatment selected resistant mutants, which arise by chance with or without the drug" | In the model about 70 new resistant mutants arise each day at 10⁹ cells. By day 1 they are about half of all resistant cells, so not all were "there from the start". | Code (`newR = S·7·10⁻⁸`). |

**Total: 37 rows, about 45 individual edits** (one model fix, two display fixes, the rest text).

## Considered but NOT changed

**Rejected or stale reviewer claims**
- **R1: Mendel lacks 3:1, χ² and two genes.** Rejected. Mendel L2 (ch7.js) and the maths text cover them (R7-R1 A2, A3).
- **R1: Casino lacks the neutral fixation rule.** Rejected. It is in the maths, Notes, end card and CQ1 (R7-R1 A18).
- **R1: Castaways lacks the one-migrant rule.** Rejected. It is present; I only corrected its wording.
- **R1: Cross lacks Haldane's mapping function and interference.** Rejected. Both are present (A9).
- **R1: Fancier doesn't name neural crest.** Rejected. It cites Wilkins et al. 2014 (A37).
- **R1: Census has no sense of power.** Rejected (A14). I added only the small-expected-count caveat.
- **R1: Census should offer drift, migration and assortative mating as causes.** Rejected as science (R7-R1 A12, B7):
  - drift does not create a lasting HW departure;
  - mixed-in migrants are a Wahlund effect;
  - assortative mating affects only loci linked to the trait.
- **R7-R1 D5's figure "sex costs nothing unless mean fitness drops below 0.4".** Correct arithmetic, but the old model *did* drop below 0.4 under all-sex, because of the unselected-father bug. After the model fix, its point holds, and the text now says so.

**Fixes that belong to other files (passed on, not edited)**
- **ch99.js `CH_MENDEL.confNote`:** "call it pure with about 99.9% confidence" confuses P(data | carrier) with P(pure | data) (R7-R1 D18, R7-R3 M30). Suggest "a carrier would do this only 1 time in 1,024".
- **ch99.js `TAKE.clinic`:** "Antibiotics do not create resistance; they select it" should say "mostly", to match ch13 (M10).
- **ch99.js `MODEL.sex`:** could add "you choose for the whole population; the twofold cost is a cost relative to competing clones".
- **ch7.js Mendel L2:** χ² on 16 seeds with expected counts of 4 (R7-R1 D21).
- **ch7.js Brood (live version):** checked by another group. `CH_BROOD_V1` in ch1.js is dead code: it is defined but not in `ALL`, and the live chapter is `CH_BROOD` in ch7.js. I left it untouched. If it is ever revived, fix "Other mothers are evolving too" (individuals do not evolve) and the bang-bang linear payoff (R2).

**Kept on purpose**
- **Mendel hook "carry the instructions for white".** A common shorthand. White is in fact a broken pigment regulator (Hellens et al. 2010), which could be a nice later addition.
- **Coalescent "mitochondrial Eve … perhaps 150,000–200,000 years ago".** Estimates range from about 100 to 230 kya (Cann et al. 1987; Soares et al. 2009; Poznik et al. 2013). "Perhaps" hedges this adequately.
- **Coalescent idea "Every individual has one parent".** The parenthesis ("think of a mitochondrial or Y-chromosome line") and MODEL.coal make the haploid assumption explicit.
- **Coalescent "about 38" for the whole sample.** The Kingman formula is rough when n = N, but simulation of the game's own model gives 37.3.
- **Cross: "swaps segments" at the two-strand level; "usually one to three per chromosome".** Acceptable simplifications. Crossing over really happens between non-sister chromatids, and human bivalents average about 2–3 crossovers.
- **Castaways: "Small populations are ruled by accident".** A slogan for the chapter.
- **Castaways model: pack q = 0.2 at all 80 loci against mainland q = 0.03.** A stylised starting load. The text does not claim it is realistic.
- **Fancier: "Darwin opened the Origin … with pigeons".** Chapter I covers domestic variation broadly, but pigeons are its centrepiece.
- **Clinic: immune clearance.** I did not raise it to 99% a day (R7-R3's alternative fix). That would change the optimal sequences and the star thresholds, so I made the text match the model instead.
- **Clinic L2: "a cell would need both mutations at once".** In the model, double mutants can also arise from single mutants, but with the drugs keeping single mutants low that path is minor.
- **Casino Notes "Expected loss per generation 1/N".** Uses the nominal N during the one bottleneck generation. Minor.
- **Why Sex? `real`: "Many organisms hedge" and the mud-snail sentence.** Both are accurate (Lively 1987). They read slightly teleologically, but are within the game's voice.

## Needs a gameplay redesign to fix properly
- **Why Sex?**
  - The player switches the whole population's mode, so the twofold cost (a cost relative to competing clones) can never be felt, and every benefit is a group benefit.
  - An "Invasion" design is needed: a clone arising in a sexual pond, ratchet and parasites acting on it.
  - A truly coevolving parasite is needed for a Red Queen level. Without one, Level 2 can only be Fisher–Muller.
  - After the model fix, L1 is easier (alternating blocks pass about 98% of the time, against about 70% before). *Addressed in the review round below: the third star now allows sex in at most a quarter of the blocks.*
- **Clinic.** Each level has a single optimal sequence: high, high, (rest), low, low; and A, A+B, A+B. A redesign should add:
  - pharmacokinetics and adherence;
  - a horizontal gene transfer or plasmid strain, separate from the TB story (R7-R3 CL4);
  - immune dynamics that make "let the immune system finish" true if that is the lesson;
  - a level where aggressive treatment loses to containment (Read et al. 2011).
- **Mendel L1.** It has a dominant strategy: test-cross with W, plus one purple × purple cross for 3 stars.
- **Crossing Over.**
  - L1 has the player place crossovers. Crossovers should land at random, with the player screening the results.
  - L2 is a paper exercise.
  - The monkey test always sticks at L2's drag task (pre-existing).
- **Coalescent.** No mutations on branches (segregating sites, SFS, Tajima's D), and no sweep-versus-expansion level.
- **Census.** Real-data causes are absent (null alleles and genotyping error). HW should be shown holding while allele frequencies change.
- **Fancier.**
  - Missing: the selection plateau, inbreeding depression from six breeders, and hidden pleiotropic costs.
  - The "name what changed" quiz should become a system.
- **Castaways.**
  - The ≤4-migrant star rewards far fewer migrants than the one-migrant-per-generation rule. That is fine as an economy, but should be explained.
  - Missing: outbreeding depression, the founder-speciation debate, and 1/(2N) heterozygosity loss.
- **Drift Casino.** Missing: fixation time (≈ −2N(p ln p + q ln q)), the 2s rule for a new beneficial mutation, and player-shaped odds.

## Tests

Build: `python3 build.py …/scratchpad/sweep/ef_G1.html`. All five files pass `node --check`.

Monkey (`tests/monkey.py <ids> 1,2`), original build `games/endless-forms/Endless_Forms_v1.html` against mine:

| chapter | original (seeds 1, 2) | G1 build (seeds 1, 2) |
|---|---|---|
| mendel | timeout, timeout (known) | timeout, timeout (same) |
| casino | end 0★, end 0★ | end 0★, end 0★ |
| cross | stuck at L2 drag, stuck | stuck at L2 drag, stuck (same, pre-existing) |
| castaways | end 2★, end 2★ | end 1★, end 1★ (random outcomes; model untouched) |
| fancier | timeout, end 0★ | timeout, end 0★ (same; the timeout is pre-existing) |
| coal | end 0★, end 0★ | end 1★, end 1★ |
| sex | end 1★, end 2★ | end 2★, end 2★; rerun on the final build with seeds 1–3: 2★, 1★, 3★ |
| census | end 0★, end 0★ | end 0★, end 0★ |
| clinic | end 2★, end 2★ | end 2★, end 2★ |

No JS errors, no NaN/undefined in HUD or Notes, and no new failures. After the last ch17.js change (the Notes keyed to `plv`) I rebuilt and re-ran sex, clinic, census and coal (seeds 1, 2) and casino and mendel (seeds 1–3). Results were the same.

I also ran a targeted Playwright check (`scratchpad/sweep/target.py`) against the G1 build:
- Mendel Notes after a self, a W self and B × W show the new rows.
- Casino Notes in the selection jar show the "higher than this share" row. At generation 3 of the bottleneck jar the share reads 50% of 2 beads.
- Why Sex? L1 played all-sexual ends at a mean fitness of 0.58 (the old model gave about 0.38).
- Why Sex? Notes in L2 read "Room for 200".
- The Clinic HUD shows the new immune wording.
- Census Notes show χ².
- No errors were captured.

## Review round

A reviewer checked the sweep (10 issues). I verified each one against the code and, where it involved numbers, re-ran the game's own `CH_SEX` model headless in Node: `core.js` helpers plus `ch17.js`, loaded unchanged (`scratchpad/g1rev/sexsim.js`, `l2grid.js`, `l2final.js`, `adaptive.js`). The reviewer had already written 9 of the 10 fixes into the files. I confirmed them and kept them all. For the one marked "needs a design decision" (Why Sex? L2), I made the decision and applied it.

| # | file:line | issue | verdict | what is in the file now | check |
|---|---|---|---|---|---|
| 1 | ch17.js:9, 44 | After the father fix, L1 alternation passes about 98% of the time, so the third star (sex in no more than half the blocks) costs nothing | **Accepted** | `fac = … this.sexBlocks <= this.NB / 4`; the goal text says "a quarter" | 400 runs per strategy: all-sex passes 100% (median w 0.602, which is e^(−U)); alternating 98.5%; sex in every 4th block 73% (offset 82%); every 5th block 66%; all-asexual 1%. So a third star takes 4 well-spaced sexual blocks out of 16 and is won about 66–82% of the time. That is close to the pre-sweep difficulty (about 75%), and the maths line "the cost of sex shows mainly in the third star" is true again. Side finding: 4 sexual blocks left to the end cause extinction 20% of the time. Once w < 0.4, sex's halved births (2.5w < 1) shrink the pond. That is the twofold cost biting, and it fits "usually refilled". |
| 2 | ch17.js:44 (L2 pass rule) | L2 hardly separates strategies: survival 88–98% under every strategy | **Accepted; fixed (design decision taken)** | **(a) Scoring:** L2 now passes if, when the parasite arrives, at least half the population carries both A and B (`pass = alive && ab >= 0.5`). The share is measured at generation 40, after reproduction and before the parasite's cull (`this.parasite.ab`). **(b) Mutation rate:** the beneficial mutation rate `UB` is raised from 0.001 to 0.0015 per birth. The text never quotes it. **(c) Display:** in L2 the HUD bar shows the share carrying both, with a 50% mark. The meaningless "Average fitness 100%" readout is gone from the L2 HUD. The goal, the card between levels, the HUD hint and the Notes row all state the target. **(d) Note text:** the L2 note now reports the share at arrival, says luck matters (sex can only combine A and B once both have arisen), and explains why cloning keeps the pair once it is common. `this.parasite` is reset each level. | Before (survival rule, UB 0.001, 300 runs): all-asexual 90%, all-sex 93%, sex-then-clone 98%. **With the new rule only, at UB 0.001:** all-sex 66%, all-asexual 36%; an adaptive player 71%. The right strategy fails too often, because which runs pass depends mostly on when the mutations arise. **Grid over UB** (0.0005, 0.001, 0.0015, 0.002, 0.004; 200 runs each): at 0.002 and above, clones also assemble AB; at 0.0005, mutations rarely arise in time. **Final, UB 0.0015, game rule, 300 runs each:** sex-then-clone passes 92%, an adaptive player 89%, all-sex 86%, alternating 85%; all-asexual passes 56% and clone-then-sex 54%. Survival is about 99% for all. Sex now helps clearly. Clones still assemble AB by sequential mutation about half the time, as Fisher–Muller predicts for this population size, and the note says luck counts. Rejected options: a parasite that kills every non-carrier would make survival depend on whether AB exists at all, and clones often have a few. Moving the parasite earlier would change "generation 40" in six places and shrink sex's window too. |
| 3 | ch17.js:13, 47 | "killing anyone without both" and "only carriers of both can survive" contradict the 15%/10% survivors in the code | **Accepted** | "killing most of those without both"; "a parasite arrives that kills most individuals not carrying both" | Code: `R() < 0.15`, then `R() < 0.1`. |
| 4 | ch13.js:48 | "drift or selection can change allele frequencies while genotypes stay in HW" is contradicted by L2 (viability selection gives extra heterozygotes among adults) | **Accepted** | "…from one generation to the next while each generation's newborns still fit Hardy–Weinberg proportions" | Under random mating, zygotes are in HW at the parents' allele frequencies whatever happened to the parents (up to sampling error). This matches the `real` text ("too many heterozygotes among adults, but not among newborns"). |
| 5 | ch4.js:7 | "each chromosome you inherit is a patchwork" overstates | **Accepted** | "most chromosomes you inherit are patchworks of a parent's two copies" | Without chromatid interference, a chromatid escapes exchange with probability (½)ⁿ for n chiasmata. A human bivalent averages about 2–3 chiasmata (sex-averaged autosomal map about 35 M over 22 chromosomes), so roughly 10–25% of inherited chromosomes are non-recombinant overall, and about 50% of those from one-chiasma bivalents. "Most" is right. |
| 6 | ch17.js:57 | Notes mixed level 1 stats with the level 2 idea and chart between levels | **Accepted** | idea `this.ideas[Math.min(1, L)]`; chart title and series keyed to `L` (`plv`) | Playwright: between levels, Notes show the L1 idea, L1 stats and the L1 chart. |
| 7 | ch17.js:47 | "Sex halved your births" is false for a player with no sexual blocks | **Accepted** | "Sex halves births, but the pond usually refilled either way…" | — |
| 8 | ch16.js:11 | h₁, h₂ undefined next to h² for heritability | **Accepted** | "where h₁ and h₂ are the square roots of the two traits' heritabilities and σ₁ and σ₂ their standard deviations" | Falconer & Mackay: CR_Y = i h_X h_Y r_A σ_PY, with i = S/σ_PX. |
| 9 | ch16.js:10 | "soon after came piebald coats…" compresses the Belyaev timeline | **Accepted** | "in later generations came piebald coats, floppy ears, curled tails and shortened snouts" | Trut 1999: depigmentation around generations 8–10, floppy ears and curled tails later, and skull, tail and leg changes around 15–20. |
| 10 | ch1.js:115 | "a jar of 300 … almost never settles" reads as contradicting eventual fixation | **Accepted** | "…and almost never settles in that time" | The sweep's simulation found 0.2% of runs settled within 30 generations; the reviewer found 0.08%. Both are rare. |

**Still open (other files, passed on):** nothing new. ch99.js `MODEL.sex` and `TAKE.sex` do not mention the L2 pass rule, so they stay consistent.

### Review-round tests

Build: `python3 build.py …/scratchpad/sweep/ef_G1.html`. All five files pass `node --check`.

Targeted Playwright run (`scratchpad/g1rev/sex_target.py`) on the G1 build. The L1 run used sex every 4th block: level passed, third star awarded, 49% fitness. The card between levels shows the new target, and Notes stay on L1. The L2 run used sex then clone: the HUD reads "both: 0% (the bar) … aim for half carrying both"; at generation 40 the bar reads 98% and Notes read "When the parasite arrived: 82%. The goal was at least half."; the note and the end card read correctly; 3 stars. No page errors, and no NaN or undefined.

Monkey (`tests/monkey.py <ids> 1,2`), compared with the original build and the first sweep:

| chapter | original (seeds 1, 2) | first sweep (seeds 1, 2) | review round (seeds 1, 2) |
|---|---|---|---|
| mendel | timeout, timeout (known) | timeout, timeout | timeout, timeout (same, known) |
| casino | end 0★, end 0★ | end 0★, end 0★ | end 0★, end 0★ |
| cross | stuck at L2 drag, stuck | same | same (pre-existing) |
| castaways | end 2★, end 2★ | end 1★, end 1★ | end 2★, end 2★ |
| fancier | timeout, end 0★ | timeout, end 0★ | timeout, end 0★ (same, pre-existing) |
| coal | end 0★, end 0★ | end 1★, end 1★ | end 1★, end 0★ |
| sex | end 1★, end 2★ | end 2★, end 2★ | end 2★, end 2★; extra seeds 3–5: 2★, 1★, 2★ |
| census | end 0★, end 0★ | end 0★, end 0★ | end 0★, end 0★ |
| clinic | end 2★, end 2★ | end 2★, end 2★ | end 2★, end 2★ |

No JS errors, no NaN or undefined, and no new failures. The star differences are random monkey play. In this round only ch17.js changed in code: the L2 pass rule, `UB`, the HUD bar and the Notes row.
