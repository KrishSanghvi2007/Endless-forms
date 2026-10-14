# R7: Fact-check of R1 (Endless Forms, Sections I–IV)

*Adversarial science check of `R1_endless_forms_sections_I-IV.md`. Where this file and R1 disagree, this file wins. Note: R1's header points to `R7_science_factcheck.md`. That file does not exist. This is the file it means.*

**Method.**
- Read R1 line by line and pulled out every claim, of two kinds: (a) what the game says or does, and (b) the reviewer's own science, formulas and citations.
- Checked each (a) claim against the current source: `ch1, ch2, ch4, ch5, ch7` (Mendel L2), `ch10` (Hawks L4–5 and Sieve moving-optimum missions), `ch13, ch15, ch16, ch17, ch25, hunt.js, boot.js, ui.js` and `ch99.js`, which holds the learning layer: the LESSON, RECALL, MODEL and prediction cards.
- Re-ran the Drift Casino jars from the game's own rules (20,000 runs per jar), the Hawks population updates and the Sieve genetic model, and counted synonymous changes per codon position across the whole code.
- Checked citations against the literature.

**Headline.**
- R1 describes the core mechanics accurately, and its design critique holds up.
- But R1 read an older or partial picture of the code. It calls about 15 things "missing" that the game already has: Mendel L2 (two genes, linkage, χ²), Haldane's mapping function, the one-migrant rule, the neutral fixation rule, Potamopyrgus, the neural-crest hypothesis, sign epistasis, Weinreich 2006, Black Country dominance asymmetry and migration, Hawks L4–L5, the Sieve moving-optimum missions, and the MODEL caveat panel.
- R1 also missed several real errors. The worst:
  - Hawks puts **fiddler crabs** in shells.
  - The Census end card says Hardy–Weinberg means "nothing interesting is happening".
  - The Scribe says "mutations are simply copying errors".
  - Why Sex? charges **no actual twofold cost**.
  - The Drift Casino's Notes say fixation probability equals current frequency even in jars with selection.

Verdict totals across the 103 rows below: 71 CONFIRMED, 21 PARTLY RIGHT, 11 WRONG. All 11 WRONG verdicts are "missing" claims about features the game already has. Plus 21 errors R1 missed.

---

## A. R1's claims about the game

| # | R1 claim | Verdict | Correction / source |
|---|---|---|---|
| A0 | Registry is in `ui.js`; `ALL` list in `boot.js`; file map (Mendel/Casino ch1, Scribe/Sieve/Jaws ch2, …) | CONFIRMED | `PLAN`/`reg()` are at `ui.js` L2–19 (the project brief's "core.js" is wrong). R1's map leaves out the extension files: `ch7.js` (Mendel L2), `ch10.js` (Hawks L4–5, Sieve missions 4–5), `ch99.js` (learning layer). |
| A1 | Mendel: tap two of six plants, ten seeds, ≤8 crosses, mark pure or carrier | CONFIRMED | ch1.js L18–49. Describes Level 1 only. |
| A2 | Mendel covers one locus, complete dominance only; no 3:1, no independent assortment | WRONG (mostly) | `ch7.js` adds Level 2: two genes, a pp rr tester, 16 seeds per cross, linked (r = 0.08) or independent, a 1:1:1:1 χ² with 3 df, and Bateson–Saunders–Punnett 1905. 3:1 is in the maths text (ch1.js L23). Still missing, as R1 says: incomplete dominance, codominance, epistasis (9:7), sex linkage, and a 9:3:3:1 F₂. |
| A3 | Mendel never makes sampling error explicit | WRONG | (½)¹⁰ ≈ 1/1024 appears in the maths (ch1.js L23) and Notes (L99). Toasts give ½¹⁰ and ¾¹⁰ ≈ 1/18 (ch99.js L190–195). L2 Notes print χ² and p. |
| A4 | Mendel has one optimal answer: test-cross everything with W | PARTLY RIGHT | Testing all six against W uses six crosses, which caps the score at 2 stars. Three stars need ≤5, so the player must use purple × purple crosses that throw white (ch1.js L93). There is still a dominant strategy, so the "form-filling" critique stands. |
| A5 | Scribe: running out of time = "the enzyme slips" misrepresents polymerase slippage | CONFIRMED | ch2.js L11, L27: a timeout becomes a deletion. Real slippage depends on sequence: repeats and homopolymer runs (Streisinger et al. 1966). |
| A6 | Scribe: "works if ≤1 missense" is arbitrary | CONFIRMED | ch2.js L32: `r.missense <= 1`. Also, losing the stop codon never marks a protein broken. |
| A7 | Scribe never conveys randomness relative to need, per-genome rates, DFE, speed–accuracy, Ts/Tv | PARTLY RIGHT | Randomness relative to need is stated (idea ch2.js L16, end card L41, LESSON). Per-genome rates are in the real text (Kong et al. 2012: about 2 extra mutations per year of paternal age; several dozen new mutations per child). A crude DFE is in the end card. Genuinely missing: the proofreading speed–accuracy trade-off, transitions vs transversions, and any quantitative DFE. |
| A8 | Cross L1 implies the cell chooses where crossovers fall | CONFIRMED | The player places them, and no text says the positions are random (ch4.js L8, L14). |
| A9 | Cross is missing Haldane's mapping function and interference | WRONG | The maths gives r = ½(1 − e^(−2d)) (ch4.js L12). The L2 end card shows non-additivity (L54). Notes mention interference (L125). |
| A10 | Cross is missing chiasmata-for-segregation and population LD | CONFIRMED | Absent. |
| A11 | Census L1/L2 described correctly (sample 20; stratify; inbreeding / Wahlund / heterozygote advantage) | CONFIRMED | ch13.js L7–13. |
| A12 | Census does not offer drift, migration or assortative mating as causes | CONFIRMED (absent); PARTLY RIGHT as science | Drift does not by itself create a lasting HW departure: one round of random mating restores the proportions, and finite N gives only a tiny heterozygote excess. Recent migrants mixed in a sample are a Wahlund effect, which the game already has. Assortative mating affects only loci linked to the trait. |
| A13 | Census never states that allele frequencies can change while HW holds | CONFIRMED, and worse | The end card says HW "is what genotypes look like when nothing interesting is happening" (ch13.js L48). That actively teaches the misconception. See D2. |
| A14 | Census has no sense of statistical power | WRONG | The maths says that with twenty snails, even large departures are often not significant (L12). The idea says small samples mislead and every snail costs (L13). The third star caps sampling at ≤400. Notes give χ². Power is the core trade-off of the level. |
| A15 | Coalescent: slider prediction, watch trace; L3 labels tree shapes | CONFIRMED | ch16.js L66–80. |
| A16 | Coalescent is missing mutations, segregating sites, SFS, Tajima's D, and the sweep confound | CONFIRMED | Not in ch16.js. |
| A17 | Casino science is good, including the croupier's two misconceptions | CONFIRMED | ch1.js L110–116, L177. |
| A18 | Casino is missing "fixation probability = starting frequency" | WRONG | Stated in the maths (L115), the Notes (L201), the end card (L177) and prediction card CQ1 (ch99.js). |
| A19 | Casino is missing fixation time, the 2s rule, and Ne vs N | PARTLY RIGHT | Ne appears: "effective size … is the harmonic mean" (L201). Fixation time is given only qualitatively. 2s is absent. |
| A20 | Castaways is missing heterozygosity loss of 1/(2N) | CONFIRMED | Absent here. The Casino gives the haploid 1/N. |
| A21 | Castaways is missing the one-migrant-per-generation rule | WRONG | ch4.js L144 cites Mills & Allendorf 1996. |
| A22 | Castaways is missing purging | PARTLY RIGHT | Named in the end card ("purging cannot remove what everyone carries", L217) but not shown as a mechanic. |
| A23 | Castaways is missing outbreeding depression and the founder-speciation debate | CONFIRMED | Absent. |
| A24 | Why Sex?: the player switches the whole population's mode | CONFIRMED | ch17.js L8, L24. |
| A25 | Why Sex?: the cost of sex is reduced to "half the births" | PARTLY RIGHT | The hook does frame it as the cost of sons (L7). The real flaw is that halving births costs nothing at all (see D5). |
| A26 | Why Sex? L2 is labelled as a parasite level but is Fisher–Muller, not the Red Queen | CONFIRMED | The parasite is a one-time filter at generation 40 that kills everything lacking both A and B (L27). Nothing coevolves. |
| A27 | Why Sex? is missing Hill–Robertson, Kondrashov, *Potamopyrgus* and young asexual twigs | PARTLY RIGHT | *Potamopyrgus* is present (Lively 1987, New Zealand mud snail, L11): WRONG. Hill–Robertson is present in substance (Felsenstein 1974; end card L45) but not named. Kondrashov and twigs are absent: CONFIRMED. |
| A28 | Lichen teaches R = h²S, realised heritability and environmental variance | CONFIRMED | hunt.js L211–213, L323; boot.js L5. |
| A29 | Lichen cites Bond & Kamil's apostatic selection, but the single-target model just converges, so the result is not reproduced | PARTLY RIGHT | The code has one background optimum (`match()`, hunt.js L302) and no search-image mechanic. But the predator is a human, who can form search images, so apostatic selection *can* happen. The game neither encourages it nor measures variance, so "Here, you were the jay" over-promises. |
| A30 | Lichen selection is unrealistically intense: about half eaten per generation | CONFIRMED | `N: 30, cap: 15` (hunt.js L297). Soot is 15/30; Bitter is 12/24. |
| A31 | Black Country is accurate (cortex TE around 1819; van't Hof 2016; Cook 2012) | CONFIRMED | hunt.js L337. |
| A32 | Black Country is missing the dominant/recessive asymmetry | WRONG | Explained in the maths (boot.js L8) and end card (hunt.js L388). |
| A33 | Black Country is missing migration from cleaner woods | WRONG | One pure-typica migrant every generation (hunt.js L335, `onBred`). |
| A34 | Black Country is missing the lag in the decline | PARTLY RIGHT | The MODEL panel and the how-to say history is compressed (ch99.js L187). The bark cleans at 40% per generation, so no real lag is shown. |
| A35 | Fancier: 6 of 24 breeders; L2 foxes with a shared genetic factor | CONFIRMED | ch16.js L7, L11. |
| A36 | Fancier is missing the plateau, inbreeding from 6 breeders, and trade-offs | CONFIRMED | Absent. |
| A37 | Fancier doesn't name the neural-crest hypothesis | WRONG | The real text cites Wilkins et al. 2014 and Lord et al. 2020 (ch16.js L10). |
| A38 | Sieve has three missions: directional, stabilising, disruptive | PARTLY RIGHT | There are five, plus a secret sixth: moving optimum, slow and fast (ch10.js L105–113, citing Lynch & Lande 1993 and Visser et al. 1998), and "split the flock" (ch99.js L210). |
| A39 | Sieve should say that disruptive selection widens variance only with high h² or assortative mating, and under random mating the gain mostly collapses | PARTLY RIGHT / WRONG for this game | The game already says random mating refills the middle and no two peaks form (ch2.js L93, L156; the split card). The "collapse" claim fails in the game's own model. Simulated with the Gen engine (10 loci, h² ≈ 0.74, outer 30% survive), SD grows ×1.20, 1.41, 1.63, 1.86 over winters 1–4. In theory, free recombination halves the linkage-disequilibrium part of the gain each generation, but sustained disruptive selection raises genic variance. |
| A40 | Sieve is missing Lande–Arnold gradients | CONFIRMED | Absent. |
| A41 | Bitter Wings: 8 bitterwings; a bitter mouthful costs 3 s | CONFIRMED | hunt.js L402. |
| A42 | Bitter Wings' negative frequency dependence isn't enforced: models are fixed and the player's memory never fades | PARTLY RIGHT | Models are fixed (8, with fixed looks), and there is no predator-memory variable. The 8:24 model-to-mimic ratio never changes, so "rare relative to models" is never tested. "Memory never fades" describes the human player, not the code. |
| A43 | Bitter Wings is missing Müllerian mimicry, imperfect mimicry and the origin of aposematism | CONFIRMED | Absent. |
| A44 | Landscape: the player chooses uphill steps, and reveals give foresight | CONFIRMED | ch25.js L7. |
| A45 | Landscape is missing sign and reciprocal sign epistasis | WRONG | Covered in the maths (ch25.js L11), L2 and the end card (L51). |
| A46 | Landscape is missing empirical landscapes (Weinreich 2006) | WRONG | Cited in the real text (ch25.js L10). |
| A47 | Landscape is missing peak crossing (drift, double mutants, neutral networks) | CONFIRMED | Absent. |
| A48 | Jaws: good negative-frequency-dependent loop; jaw genetics doubtful | CONFIRMED | The real text already hedges (ch2.js L194). The hook ("The trait is inherited") and Notes ("the gene frequency") do not (D7). |
| A49 | Jaws: 60 identical taps with no build-up | PARTLY RIGHT | Strike time shrinks each season, from 0.61 to 0.36 s (ch2.js L214). It is a speed ramp, not a new mechanic. |
| A50 | Hawks: payoffs, V/C and Bourgeois are all correct | CONFIRMED | ch5.js L11. |
| A51 | Hawks: the player's choices have no effect on the population | CONFIRMED | `evolve()` ignores the player's action (ch5.js L41–45). |
| A52 | Hawks doesn't distinguish a mixed ESS from a polymorphism of pure strategies | CONFIRMED | "hawks make up V ÷ C of contests" (L10) is ambiguous. |
| A53 | Hawks has no invasion test | PARTLY RIGHT | The invasion definition is stated (L10). No mechanic tests it. |
| A54 | Hawks: L2 has V > C; L3 adds Bourgeois | CONFIRMED but incomplete | L4 (size assessment, RHP, Clutton-Brock & Albon 1979) and L5 (war of attrition, exponential persistence; Maynard Smith 1974; Bishop & Cannings 1978) exist in `ch10.js`. R1's redesign is partly built already. |
| A55 | Blood Debts: roost of 8, fixed strategies with memory, L2 adds noise | CONFIRMED | ch15.js L7–13. |
| A56 | Blood Debts: Wilkinson 1984 also found kinship effects | CONFIRMED | The game's text on 1984 omits kinship. MODEL.bats mentions kinship. |
| A57 | Blood Debts: Carter's later work favours bonds and insurance networks over strict TFT | CONFIRMED | The game already reports the insurance result, under the wrong citation (D8). |
| A58 | Blood Debts is missing the IPD structure, Axelrod's tournament, partner choice and the rarity of reciprocity | PARTLY RIGHT | Axelrod & Hamilton 1981 and Nowak & Sigmund 1992 are cited. The shadow of the future, partner choice and rarity are absent. |

## B. R1's own science, formulas and citations

| # | R1 statement | Verdict | Correction / source |
|---|---|---|---|
| B1 | Polymerase slippage depends on sequence (repeats, homopolymers) | CONFIRMED | Streisinger et al. 1966; Levinson & Gutman 1987. |
| B2 | "Roughly one in a thousand [mutations] wins" | PARTLY RIGHT | The beneficial fraction ranges over orders of magnitude, roughly 10⁻² to 10⁻⁵ of new mutations, depending on organism and how well adapted it is (Perfeito et al. 2007; Eyre-Walker & Keightley 2007). Use it only as illustration. |
| B3 | Under stress, mutator strains hitchhike with beneficial mutations | CONFIRMED | Sniegowski, Gerrish & Lenski 1997; Taddei et al. 1997. |
| B4 | Crossovers "fall at random" | PARTLY RIGHT | They are stochastic, but not uniform: they cluster in hotspots (PRDM9 in mammals), there is an obligate crossover, and interference spaces them out. Better: "the cell does not place them to build good gametes". |
| B5 | Chiasmata are required for segregation | CONFIRMED | Obligate crossover. Exceptions exist (achiasmate meiosis in *Drosophila* males). |
| B6 | Allele frequencies can change while HW proportions hold | CONFIRMED | Standard. Selection on fecundity or zygotes, and drift, leave HW intact at the zygote stage. |
| B7 | Drift is a cause of HW departure | PARTLY RIGHT | See A12. Drift changes p but not genotype proportions, beyond a heterozygote excess of order 1/N. |
| B8 | A pair coalesces in about N generations (haploid); the whole sample in about 2N(1−1/n) | CONFIRMED | Kingman 1982. Diploid equivalents: 2N and 4N(1−1/n). The game's 38 for n = N = 20 matches the formula. With n = N, the Kingman approximation is rough. |
| B9 | Sweeps also produce star-like trees | CONFIRMED | Only near the selected site. Expansion leaves a star genome-wide, which is how the two are told apart. |
| B10 | Neutral fixation probability = starting frequency | CONFIRMED | Standard. |
| B11 | Mean time to fixation ≈ 4Ne generations | PARTLY RIGHT | 4Ne is the time for a *new* neutral mutation, *conditional on fixing*, in a *diploid* population (Kimura & Ohta 1969). In the Casino's haploid jars it is ≈2N, and from 50:50 the mean time to absorption is ≈ −2N(p ln p + q ln q) ≈ 1.39N. Simulated jar of 6 at 50%: 7.1–7.2 generations; 80% are settled within 10. |
| B12 | A beneficial allele fixes with probability ≈ 2s | CONFIRMED (with conditions) | Haldane 1927. Holds for a single new copy, small s, large N and Poisson offspring. In general 2s·Ne/N; 2hs for a diploid with dominance h. |
| B13 | Heterozygosity is lost at ≈ 1/(2N) per generation | CONFIRMED | For diploids, using Ne. |
| B14 | One Isle Royale migrant's genes swept the pack | CONFIRMED | M93 ("Old Grey Guy") arrived in 1997 and supplied about 56% of ancestry within about 2.5 generations (Adams et al. 2011). |
| B15 | The cost of sex should be the cost of males or of meiosis | CONFIRMED | Maynard Smith 1978; Williams 1975. Assumes anisogamy and no paternal care. |
| B16 | Kondrashov's deterministic mutation hypothesis | CONFIRMED | Kondrashov 1988. Needs U ≳ 1 and synergistic epistasis; empirical support is weak, so present it as a contested hypothesis. |
| B17 | *Potamopyrgus* evidence | CONFIRMED | Lively 1987; Jokela et al. 2009. Already in the game. |
| B18 | Asexual lineages are young twigs on the tree | CONFIRMED | Bdelloid rotifers and darwinulid ostracods are the famous exceptions. |
| B19 | Bond & Kamil's apostatic selection | CONFIRMED | Bond & Kamil 1998 (*Nature*, apostatic selection gives balanced polymorphism); 2002 (*Nature*, crypticity and polymorphism). The game's 2002 citation is correct. |
| B20 | cortex TE around 1819; van't Hof et al. 2016; Cook et al. 2012 | CONFIRMED | Majerus's experiment: 4,864 moths over six years, so the game's "six-year" is right. |
| B21 | A dominant allele rises fast when rare and slows near fixation; a recessive one starts slowly | CONFIRMED | Haldane 1924. |
| B22 | Kettlewell's 1950s mark–release–recapture was disputed, then vindicated by Majerus | CONFIRMED | Kettlewell 1955/56; critiques by Coyne 1998 and Hooper 2002; Cook et al. 2012. |
| B23 | Two breeders: fast response, fertility crash; twelve: slow but sustainable | CONFIRMED (conceptually) | Robertson 1960: the selection limit is about 2Ne × the first-generation response; ΔF = 1/(2Ne) per generation. |
| B24 | Disruptive selection gains mostly collapse under random mating | PARTLY RIGHT | See A39. |
| B25 | Lande–Arnold gradients | CONFIRMED | Lande & Arnold 1983. |
| B26 | Müllerian mimicry, imperfect mimicry, the origin of rare aposematism | CONFIRMED | All are real gaps. |
| B27 | Real adaptive walks are stochastic, with fixation roughly proportional to effect size | CONFIRMED | Gillespie 1984 (strong selection, weak mutation); Orr 2002: P(step) ∝ 2s. |
| B28 | Peaks are crossed by drift, double mutants and neutral networks | CONFIRMED | Wright 1932; Weinreich & Chao 2005; Weissman et al. 2009. |
| B29 | A large population gets stuck on a local peak; a small one drifts across valleys | PARTLY RIGHT | Very large populations also cross by stochastic tunnelling once Nμ is large. The hardest regime is *intermediate* N (Weissman et al. 2009). Small populations cross only shallow valleys. Build the "Valley Crossing" redesign with three N regimes, not two. |
| B30 | Weinreich's five-mutation β-lactamase landscape | CONFIRMED | 18 of 120 paths are accessible (Weinreich et al. 2006). One of the five is a promoter mutation. |
| B31 | Raffini & Meyer 2019: a large plastic or behavioural component in jaw laterality | CONFIRMED | Hydrobiologia 832:65–84. Measured heritability is about 0.18–0.22 (Lee, Heim & Meyer 2015) and the distribution is unimodal (Kusche et al. 2012). So "doubtful" means *low*, not *absent*. |
| B32 | A mixed ESS differs from a polymorphism of pure strategies | CONFIRMED | Maynard Smith 1982. Dynamically equivalent in a two-strategy infinite population, but conceptually distinct. |
| B33 | The invasion test is the definition of an ESS | CONFIRMED | Maynard Smith & Price 1973 conditions. |
| B34 | Wilkinson 1984 found kinship effects | CONFIRMED | Both relatedness and association predicted sharing. |
| B35 | Carter: bonds and insurance networks | CONFIRMED | Carter & Wilkinson 2013, 2015; Carter, Farine & Wilkinson 2017; Carter et al. 2020. |
| B36 | Reciprocity is rare in nature | CONFIRMED | A legitimate topic (Hammerstein 2003; Clutton-Brock 2009). |
| B37 | q̂ ≈ u/s for a dominant deleterious allele; √(u/s) for a recessive one | CONFIRMED | In general u/(hs) for a partially dominant allele. |
| B38 | Cline width ∝ σ/√s; local adaptation swamped above a threshold | CONFIRMED | Slatkin 1973; Nagylaki 1975. Width = σ/√s times a model-dependent constant. In the island model, swamping comes when m ≳ s (Haldane 1930). |
| B39 | Price equation; Fisher's fundamental theorem | CONFIRMED | Real gaps. The Commons RECALL already invokes Price. |
| B40 | Sinervo's side-blotched lizards play rock–paper–scissors | CONFIRMED | Sinervo & Lively 1996. |
| B41 | Clonal interference and diminishing returns (Lenski) | CONFIRMED | Gerrish & Lenski 1998; Wiser, Ribeck & Lenski 2013. |
| B42 | HbS tracks malaria | CONFIRMED | Allison 1954 (already in Census); Piel et al. 2010 map. |
| B43 | Meiotic drive is covered by The Selfish Spindle | CONFIRMED | ch12.js. |
| B44 | Ne is lowered by skewed sex ratios, fluctuating N and variance in reproductive success | CONFIRMED | Ne = 4NₘN_f/(Nₘ+N_f); harmonic mean over generations; Ne = (4N−2)/(V_k+2). |

## C. Game science errors in this slice that R1 missed

| # | Error (file:line) | Severity | Why it is wrong / fix |
|---|---|---|---|
| D1 | Hawks: "Two **fiddler crabs**, one empty **shell**" (ch5.js L6). Shells also appear at L13 and L15, and in L4's text (ch10.js L8, L18, L36). | High (factual) | Fiddler crabs (*Uca*) fight over **burrows**. **Hermit crabs** fight over shells (Elwood & Briffa 2001). Either change the species to hermit crabs or the resource to burrows. |
| D2 | Census end card: "Hardy–Weinberg is dull on purpose: it is what genotypes look like when nothing interesting is happening" (ch13.js L48). The intro (L7) implies the same converse. | High (misconception) | HW proportions survive drift and genic selection. Passing an HW test does not mean no evolution. Rewrite: "Departures tell you *something* is going on. Passing the test does not mean nothing is: allele frequencies can change under drift or selection while genotypes stay in HW proportions." |
| D3 | Scribe end card: "Mutations are simply copying errors" (ch2.js L41) | High | Contradicts the chapter's own real text (L14). DNA damage (UV, deamination, oxidation) and faulty repair are major sources; in the human germline much mutation appears damage-driven rather than replication-driven (Gao et al. 2019). Fix: "Copying errors are one source of mutation, alongside DNA damage and faulty repair. All of them happen without regard to whether they would help." |
| D4 | Casino Notes row "Blue share now … Its chance of eventually taking over the jar is exactly this share" appears in **every** jar, including the two selection jars (ch1.js L201) | High | False when s > 0. Show the row only when `this.s === 0`. With selection, say "higher than its share: selection tilts the odds". |
| D5 | Why Sex?: "The twofold cost is built in: sexual blocks produce half the births" (ch17.js L12; L9 hook). Code: `poisson(F·w·0.5)` then `kids.slice(0, K)` (L24–26). | High (model contradicts text) | With F = 5 and mean fitness ≈ 0.6, a sexual block still makes about 40 × 5 × 0.6 × 0.5 = 60 young for 40 places (500 for 200 in L2). The cap discards the surplus, so sex costs **nothing** unless mean fitness drops below 0.4. The only "cost" is the star rule. Fix: make asexual and sexual lineages compete in one population, as R1's "Invasion" proposes, or remove the ceiling. Until then, delete "built in". |
| D6 | Casino end card: "a 15% edge nearly guarantees victory in a jar of 40, but in a jar of 6 it barely beats a coin toss" (ch1.js L177) | Medium | Both jars start at 30% blue. In 20,000 runs per jar following the game's rules: **jar of 40**, blue takes over within the 30-generation bet 63% of the time (34% still mixed), though 97% eventually; **jar of 6**, 52% against a neutral 33%. So selection did matter a lot in the small jar. Fix: "a 15% edge makes blue the near-certain eventual winner in a jar of 40, though it can take more than thirty generations; in a jar of 6 it lifts blue's chance from about one in three to about one in two, and chance still decides half the time." |
| D7 | Jaws: hook "Each scale-eater's jaw is bent to one side, so it can only ever strike one flank … The trait is inherited" (ch2.js L190). Notes: "Heritable jaw direction. This is the gene frequency that evolves" (L259). | Medium | Laterality is continuous and unimodal, with h² ≈ 0.2 (Lee et al. 2015; Raffini & Meyer 2019). Attacks are strongly but not absolutely one-sided (Takeuchi et al. 2012). The share of a phenotype is not a gene frequency. Fix: "mostly strikes one flank … partly inherited"; Notes: "Share of right-striking fish (heritable in this model)". |
| D8 | Blood Debts real text credits "bats with more sharing partners coped better when one was removed" to Carter & Wilkinson **2013** (ch15.js L11) | Medium (citation) | The 2013 paper (*Proc R Soc B*) showed that past help predicted donations better than relatedness. The partner-removal ("social bet-hedging") result is Carter & Wilkinson 2015 (*Proc R Soc B*) and Carter, Farine & Wilkinson 2017 (*Biol Lett*). Split the citation. |
| D9 | Blood Debts: "a hunt fails 35% of the time"; "miss two nights … can starve" (ch15.js L7, L12) | Low | Wilkinson 1984: about 7% of adults and about 33% of under-two-year-olds fail on a given night, and bats starve after about 2.5–3 nights (60–70 h). Say "a young bat's hunt fails about a third of the time" and "two or three nights". |
| D10 | Fancier maths: "correlated response is h₁ h₂ r_G S ÷ σ₁" (ch16.js L11) | Medium (formula) | It is missing σ_P2. Correct (Falconer): CR₂ = h₁ h₂ r_G (S/σ_P1) σ_P2, or "in standard deviations of trait 2: h₁ h₂ r_G S/σ_P1". |
| D11 | Sieve: "two extreme parents have middling offspring" (ch2.js L93, L156) | Low | Only parents from **opposite** extremes do. Two same-end parents have extreme young, regressed by h². Fix: "a big-beaked parent and a small-beaked parent have middling chicks". |
| D12 | Sieve model: a continuum of allele values at 10 loci lets disruptive selection inflate variance without limit until the clamp at 0–1 (see A39) | Low (model) | Note it on the MODEL panel. A biallelic polygenic model caps variance at p = ½. |
| D13 | Bitter Wings real text: "mimics only work while they are rare" (hunt.js L399) | Low | Overstated. Batesian mimics do best when rare *relative to models*. They can be common when the model is very noxious or other prey is plentiful (Lindström et al. 1997). Fix: "work best while they are rare compared with their models". |
| D14 | Lichen idea: "the population **drifts** toward whatever you fail to notice" (boot.js L4) | Low | "Drift" is the technical term the Casino teaches for chance. This is selection. Use "moves" or "evolves". |
| D15 | Lichen maths: "Selection also uses up variation, which is why the response slows" (boot.js L5) | Low | The main reason the response slows is that S shrinks as moths approach the bark colour (fewer conspicuous moths). Variance loss (the Bulmer effect, plus drift in N = 30) is secondary. Mention both. |
| D16 | Black Country model: `mu: 0.01` turns typica into carbonaria every gamete (hunt.js L339), against a story of "a single dominant mutation", "dated to around 1819" (L334, L337) | Low (model) | Recurrent mutation at 1% per gamete is about 10⁵ times too high and gives carbonaria many origins. Set `mu` to 0 after a single seeding, or note it on the MODEL panel. Separately, the chapter is called "The Black Country" (West Midlands) but set in Lancashire/Manchester; harmless, but say so or set it in Birmingham, where Kettlewell's 1953 experiment ran. |
| D17 | Casino end card: "a jar of 200 squeezed through 2 beads — a single founding pair" (ch1.js L177) | Low | The game treats beads as gene copies (it uses 2pq). Two copies are one diploid founder, not a pair. Say "two gene copies". |
| D18 | Mendel toast: "you can call it pure with about 99.9% confidence" (ch99.js L194) | Low (stats wording) | Swaps P(data \| carrier) = 1/1024 for P(pure \| data). The number is about right only because the prior is ~50% (2–4 carriers in 6). Say "a carrier would do this only 1 time in 1,024, so 'pure' is a very safe call". |
| D19 | Cross L2 is titled "Sturtevant's map" but uses modern map positions y 0, w 1.5, v 33, m 36.1, r 54.5 (ch4.js L20) | Low (attribution) | Sturtevant's 1913 values were 0, 1.0, 30.7, 33.7, 57.6. Either use them or say "a modern version of Sturtevant's map". |
| D20 | Lichen prediction toast: "Survivors were X points better **camouflaged**" (ch99.js L62) | Low | S is computed on `focus` (tone, dark to pale), not on camouflage match. Say "paler", or compute S on `match()`. |
| D21 | Castaways: "Most harmful mutations are recessive" (ch4.js L144); χ² on 16 seeds, expecting 4 per class (ch7.js notes2) | Low | Say "most strongly harmful mutations are at least partly recessive" (mild ones have h ≈ 0.25). Expected counts below 5 make the χ² p-value approximate: say so, or use 20+ seeds. |

**Checked and correct in the game text (leave alone):**
- Synonymous at third positions "about 70%": 126/183 = 68.9% under uniform substitution.
- Kong et al. 2012 (~2 per year of paternal age); Jónsson et al. 2017.
- Haldane's mapping function; the "1 in 40" and "≈40% of generations" in Cross L3.
- Mendel's χ²₃ closed form, `chi3p`.
- HW χ² with df = 1; Wahlund deficit = 2·Var(p); Hardy and Weinberg 1908; Wahlund 1928; Allison 1954.
- N·e^(−U/s) ≈ 0.01 and e^(−U) ≈ 0.61 in Why Sex?; Muller 1964; Felsenstein 1974; Lively 1987.
- Selection intensity for the top 25% = 1.27; Belyaev 1959, Trut 1999, Wilkins 2014, Lord 2020.
- Coalescent: mean N; 38; P(T > N) ≈ e⁻¹; Kingman 1982; Cann et al. 1987; PSMC (Li & Durbin 2011).
- Hawks: payoffs; p* = V/C (Level 1 reaches 43% in 10 updates); Bourgeois; war of attrition with exponential persistence of mean V/c; Maynard Smith & Price 1973; Davies 1978.
- Weinreich 2006 (18 of 120 paths); Blount et al. 2008.
- Black Country: 1848, ~98% by 1895, van't Hof 2016, Cook 2012 (six years).
- Bates 1862; Bond & Kamil 2002; Boag & Grant 1981; Karn & Penrose 1951; Smith 1993; Lynch & Lande 1993; Visser et al. 1998.
- Hori 1993 (~5-year period); Johnson et al. 2010 (Florida panthers); Mills & Allendorf 1996; Isle Royale 1997.
- Axelrod & Hamilton 1981; Nowak & Sigmund 1992.

---

## Corrections future agents must apply

Game-text fixes, highest priority first:

1. **ch5.js L6, L13, L15; ch10.js L8, L18, L36.** Replace "fiddler crabs … shell" with "hermit crabs … shell" throughout Hawks and Doves (or keep fiddler crabs and change the shell to a burrow).
2. **ch13.js L48 (and the L7 intro).** Remove "what genotypes look like when nothing interesting is happening". Add: "Passing Hardy–Weinberg does not mean no evolution: drift or selection can change allele frequencies while genotypes stay in HW proportions."
3. **ch2.js L41.** Change "Mutations are simply copying errors" to "Copying errors are one source of mutation; DNA damage and faulty repair are others."
4. **ch1.js L201.** Show the "exactly this share" Notes row only in neutral jars. In selection jars, say selection raises the chance above the current share.
5. **ch17.js L12 and L24–26.** Either make the twofold cost real (asexual and sexual types competing in one population, or no `slice(0, K)` ceiling), or delete "The twofold cost is built in". As coded, sex costs nothing while mean fitness is above 0.4.
6. **ch1.js L177.** Rewrite the selection sentence with the simulated numbers: jar of 40, 63% take over within 30 generations and 97% eventually; jar of 6, 52% against a neutral 33%. Replace "a single founding pair" with "two gene copies".
7. **ch15.js L11.** Credit the partner-removal (insurance) result to Carter & Wilkinson 2015 and Carter, Farine & Wilkinson 2017, not 2013. Mention that Wilkinson 1984 also found kinship effects. **L7/L12:** 35% failure is the juvenile rate (adults ~7%), and starvation comes after 2–3 nights.
8. **ch16.js L11.** Fix the correlated response to CR₂ = h₁h₂r_G(S/σ₁)σ₂.
9. **ch2.js L190, L259.** Jaws: "mostly strikes one flank", "partly inherited (heritability about 0.2)". Notes: "share of right-striking fish", not "gene frequency".
10. **ch2.js L93, L156.** Change "two extreme parents" to "parents from opposite extremes".
11. **hunt.js L399.** Change "only work while they are rare" to "work best while rare compared with their models".
12. **boot.js L4.** Change "drifts toward" to "evolves toward". **boot.js L5:** add that the response slows mainly because fewer moths stand out (S shrinks).
13. **hunt.js L339.** Set carbonaria `mu` to 0 after the initial seeding, or disclose recurrent mutation on MODEL.soot (ch99.js).
14. **ch99.js L194.** Rephrase "99.9% confidence" as a likelihood statement. **ch99.js L62:** "paler", not "better camouflaged".
15. **ch4.js L20/L48.** Use Sturtevant's 1913 positions or relabel as a modern map. **ch4.js L144:** "most strongly harmful mutations are at least partly recessive".
16. **ch7.js.** Raise L2 seed counts to 20 or more, or add "(approximate with small counts)" to the χ² note.
17. **docs/reviews/R1 header.** Change its pointer from `R7_science_factcheck.md` to this file.

Before redesigning, note what already exists. R1's "missing" lists are stale for:
- Mendel L2 (ch7.js): two genes, linkage, χ²₃.
- Hawks L4–L5 (ch10.js): assessment and war of attrition.
- Sieve missions 4–6 (ch10.js, ch99.js): moving optimum and split.
- The ch99.js learning layer: MODEL caveats, RECALL, TRANSFER and prediction cards.
- Cross: Haldane's mapping function and interference.
- Castaways: the one-migrant rule.
- Black Country: dominance asymmetry and migration.
- Fancier: neural crest.
- Landscape: sign epistasis and Weinreich 2006.
- Why Sex?: *Potamopyrgus*.

Build on these; do not re-add them.
