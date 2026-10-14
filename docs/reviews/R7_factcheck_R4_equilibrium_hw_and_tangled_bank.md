# R7: Fact-check of R4 (Equilibrium HW and Tangled Bank)

*Adversarial science check of `R4_equilibrium_hw_and_tangled_bank.md`. Where this file and R4 disagree, this file wins. File and line references are to `games/equilibrium-hw/source/` and `games/tangled-bank/source/` unless stated.*

**Method.**
- Pulled every scientific claim out of R4: (a) what the game says or does, and (b) the reviewer's own formulas, numbers and citations.
- Read all of `engine.js`, `lv_a.js`–`lv_d.js`, `core.js`, `hunt.js`, `steward.js`, `app.js`, plus `endless-forms/source/ch13.js` (The Census) for R4's cross-references. Checked every line number R4 gives. All 15 are correct.
- Re-ran the game's own functions in Node, copied verbatim: `matingDist`, `phenAssort`, `islandStep`, `hwCounts` and the L9 recursion. Simulated the L12 drift challenge (4,000 runs per N) and HW χ² power (20,000 runs). Recomputed the χ² for every L17 dataset.
- Checked citations against the literature, with web searches for Buri (1956), Austad (1993), Hardy/Yule (1908) and the L17 sickle-cell counts.

**Headline.**
- R4 is accurate. All six of its "confirmed errors" are real.
- R4 overreaches in two places:
  - **"Like with like" is not inconsistent** (row A9).
  - **The L17 data are already codominant** (row A39).
- R4 also has small slips: Yule's 3:1 claim was 1908, not 1902; Buri used 107 lines, not 100; Allison 1954 is the wrong source for the adult sickle-cell census; the Lichen Wood morning is 12 s, not 11.
- R4 **missed** five errors worth fixing:
  - L7's integer rounding moves p sideways, while the text says it "stayed".
  - The Black Country summary card gets dominance backwards.
  - The Slow Island objective misstates Austad's result (1.5× instead of about 1.25×).
  - The false "non-random mating never changes p" line appears in two more places.
  - L14's "Opposites attract" uses a genotype rule, not a colour rule.

Verdict totals across the 101 judged rows below: **84 CONFIRMED, 15 PARTLY RIGHT, 2 WRONG** (1 row not checked: the technology section). There are also 14 errors that R4 missed (section C).

---

## A. R4's claims about the game

| # | R4 claim | Verdict | Correction / source |
|---|---|---|---|
| A1 | Island migration: `p = 0.85p + 0.15×0.1` (lv_b.js:104); p falls 0.60 → 0.17 in 12 generations; dot moves right | CONFIRMED | Re-run: p₁₂ = 0.171. Migrants carry 90% **a**. |
| A2 | Explanation "Migrants with **few a alleles**…" (lv_b.js:126) is backwards | CONFIRMED | The migrants carry mostly a. |
| A3 | l14 end card and quiz say non-random mating never changes allele frequencies (lv_d.js:18) | CONFIRMED | Quotes are exact. |
| A4 | l14 always starts at p = 0.5, which hides the exception | CONFIRMED | `runMode` starts from `hwExp(0.5)` (lv_d.js:17). |
| A5 | `matingDist(f,'dis')` from p = 0.8 drops p to 0.70, then 0.71 | CONFIRMED | Re-run: 0.697, 0.711, then settles at 0.710. From p = 0.2 it goes to 0.303, then settles at 0.290. At p = 0.5 it is symmetric, so p stays put. |
| A6 | l9 says "Try the genotype lens: the bird can't" (lv_c.js:12), but `tap()` ignores the lens (lv_c.js:14) | CONFIRMED | Under the genotype lens the beetles draw with their alleles, and taps still eat them. |
| A7 | Players "beat the q ≤ 0.30 target by cheating" | PARTLY RIGHT | The bug is real, but cheating is not needed. Eat all 10 yellow (q = 0.333). The survivors breed to [18, 18, 4]. Eat the 4 yellow: q = 0.25, goal met in generation 2 by phenotype alone. The lens helps very little, because eating an Aa removes one a while an aa removes two. The harm is to the concept, not the score. |
| A8 | Case "The vanishing yellow" (lv_d.js:87): 70% vs 40% survival gives s = 0.43, which predicts 0.56, 0.61, 0.65 … 0.80, but the trace reads 0.53 … 0.74 | CONFIRMED | Prediction from p₀ = 0.5: 0.50, 0.56, 0.61, 0.65, 0.69, 0.72, 0.74, 0.77, 0.78, 0.80. The trace fits s ≈ 0.25–0.30, i.e. about 70% vs 50% survival. |
| A9 | Case "Like with like" (lv_d.js:90) is symmetric, but colour assortment under complete dominance (`phenAssort`) is asymmetric | **WRONG** | At p = 0.5, `phenAssort` keeps AA = aa exactly. With AA = aa = x, both become 0.25/(1 − x). Re-run gives [⅓, ⅓, ⅓], [0.375, 0.25, 0.375], [0.40, 0.20, 0.40]. The case trace (Aa 0.50 → 0.38 → 0.32 → 0.28) matches about 75% colour assortment, which is what "almost only" says. Asymmetry appears only away from p = 0.5 (from p = 0.8: [0.667, 0.267, 0.067]). No fix needed. |
| A10 | Island mating switch = `matingDist 'assort'` = selfing; l14 uses phenotypic assortment, so one label hides two models | CONFIRMED | `assort` and `self` both map [0.3, 0.4, 0.3] to [0.4, 0.2, 0.4]. The L8 switch also mixes 60% of this with 40% random mating (lv_b.js:106). L15 uses a third variant: 70% `phenAssort` (lv_d.js:29). |
| A11 | Black Country carbonaria `mu: 0.01` (hunt.js:332) contradicts the real text's single cortex insertion around 1819 (hunt.js:330) | CONFIRMED | — |
| A12 | "creates new black moths every generation" | PARTLY RIGHT | Expected new carbonaria alleles = 2N(1 − q)μ ≈ 60 × 0.95 × 0.01 ≈ 0.57 per generation. That is about one new black heterozygote every second generation. Still orders of magnitude above a single origin. |
| A13 | Aripo: "choosy females end up carrying the genes of the colourful males" (steward.js:218) is wrong. The *offspring* carry both, and that LD is Fisher's mechanism | CONFIRMED | — |
| A14 | Model code mostly correct: χ² with 1 df, Δq under complete selection, 2pq/q² carrier ratios | CONFIRMED | engine.js:28, lv_c.js:24, lv_d.js:50. |
| A15 | L1 never says the beetle is diploid or that the locus is autosomal | PARTLY RIGHT | L1 says "Every beetle carries **two copies** of the colour gene, **one from each parent**" (lv_a.js:54). That is diploidy, minus the word. "Autosomal" is never said. |
| A16 | L1: "can't tell" is correct 6 times out of 8 | CONFIRMED | The pool is 2 AA, 4 Aa, 2 aa (lv_a.js:56). |
| A17 | L2: "31 carriers but A is the minority allele" is correct | CONFIRMED | [9, 22, 19] gives p = 0.40. |
| A18 | L4 draws with replacement from 40 tokens | CONFIRMED | 28 A, 12 a (lv_a.js:137, 147). |
| A19 | L6 distractor "forgot the second route" (79%) | CONFIRMED | 0.09 + 0.21 + 0.49 = 0.79. |
| A20 | L7 "exactly p², 2pq, q²" is just deterministic rounding (`hwCounts`) | PARTLY RIGHT | It is rounding, and R4 misses the consequence: the rounding is **not exact and moves p**. See C1. |
| A21 | L8 mutation is 3% per generation and is left out of the mysteries | CONFIRMED | `p *= 0.97` (lv_b.js:104). The mystery order is `['sel','mig','big','mate']` (lv_b.js:124). |
| A22 | L8 viability selection after mating puts adults off the curve, so "slides along the curve" (lv_b.js:123) is approximate | CONFIRMED | At p = 0.6, adults have Aa = 0.517 against an HW value of 0.457. They sit *above* the curve. |
| A23 | L8: each force has one fixed, exaggerated strength and direction | CONFIRMED | w = [1, 1, 0.55], m = 0.15, p_m = 0.1, N = 16. |
| A24 | L9: q_t = q₀/(1 + tq₀) (lv_c.js:24); share of a copies in heterozygotes = p | CONFIRMED | 2pq/(2pq + 2q²) = p. |
| A25 | L9 never shows Δq = −spq²/(1 − sq²) and never contrasts a dominant allele | CONFIRMED | True of Equilibrium. The Tangled Bank Black Country end card does contrast dominance in words (hunt.js:381). |
| A26 | L10: p_t = p₀(1 − μ)^t is correct; no back mutation, and no mutation–selection balance anywhere | CONFIRMED | A string search of all three games' source finds no mutation–selection balance. |
| A27 | L11: 0.375 is correct; convergence to 0.55 needs equal island sizes, which the game never states | CONFIRMED | Symmetric proportional exchange at constant size implies equal sizes. |
| A28 | L12 uses Wright–Fisher binomial sampling and 1/2N; Ne is never introduced | CONFIRMED | lv_c.js:87, 95. No "effective" anywhere in Equilibrium. |
| A29 | L12 challenge: N = 200 passes, and it is "pure luck" | PARTLY RIGHT | Any N passes, so small N is not rewarded. Simulated P(pass) by N: 10: 0.03; 20: 0.45; 30: 0.83; 40: 0.96; 60+: ≈1.00. Luck matters only near N = 20–30. |
| A30 | L13 castaway choice has no consequence: `const ok = true; this.score++` (lv_c.js:123) | CONFIRMED | — |
| A31 | L13's single biallelic locus at p = 0.5 is the worst case: a bottleneck of 4 keeps 87.5% of H and almost never loses an allele | CONFIRMED | 1 − 1/8 = 0.875. P(all 8 copies the same allele) = 2 × 0.5⁸ ≈ 0.8%. Expected H kept through the game's whole 4→8→16→32→60 recovery: 0.77. |
| A32 | L14 treats inbreeding and assortative mating as the same thing | PARTLY RIGHT | They are separate buttons with different dynamics (lv_d.js:13). The end card lumps them together, and never says assortment affects only trait-linked loci. |
| A33 | L14 never names F | CONFIRMED | — |
| A34 | L15: 4 cases with 4 labels used once each, so the last is free | CONFIRMED | lv_d.js:34. The same flaw is in L8's four mystery islands, each force used once (lv_b.js:124). R4 missed that one. |
| A35 | L16: CF 1 in 2,500, carriers 1 in 25, 198 carriers per affected at q = 0.01 | CONFIRMED | 2p/q = 1.98/0.01 = 198. |
| A36 | L17: χ² with 1 df, threshold 3.84 | CONFIRMED | — |
| A37 | L17 includes a fictional third case; two samples have N > 17,000 | CONFIRMED | N = 17,033 and 30,923 (lv_d.js:62–64). |
| A38 | L17 sickle-cell data show heterozygote excess and an SS deficit | CONFIRMED | p(S) = 0.091. O/E: AA 0.99, AS 1.07, SS 0.26. χ² = 168. For the citation, see B29. |
| A39 | "Codominant data (e.g. MN blood groups) would let the player count genotypes directly" | **WRONG** | All three L17 datasets are already codominant counts. Scarlet tiger wing forms *are* the genotypes, and AS/SS are scored by electrophoresis. What L17 lacks is a dominant-trait dataset where the player must assume HW, plus a low-n sample. |
| A40 | Case Files' Wahlund case is consistent with p₁ = 0.9, p₂ = 0.1 | CONFIRMED | 81/18/1 + 1/18/81 = 82/36/82. |
| A41 | Case prompts state their answers; in the final case the correct option is the only long one; 8 cases, 10 MCQs | CONFIRMED | lv_d.js:84–91. |
| A42 | Lichen Wood: "11-second mornings", up to 15 moths, 10–16 generations | PARTLY RIGHT | Lichen Wood is **12 s** (hunt.js:290; the intro says "twelve seconds"). 11 s is the Black Country (hunt.js:333). The rest is right. |
| A43 | Black Country "misses the HW payoff" of dominance | PARTLY RIGHT | The end card says it outright: "Dominance makes the two directions unequal… recessive copies hid inside black heterozygotes" (hunt.js:381). What is missing is a genotype/allele view, and the point that the rise slows. The per-generation card gets dominance backwards (C2). |
| A44 | Bitter Wings: "mimics only work while they are rare" is too strong | CONFIRMED | The same overstatement is repeated in the end card: "only worth copying while it stays honest" (hunt.js:421). |
| A45 | Aripo: one transplant button, two predator toggles, up to 160 generations | CONFIRMED | `maxGen: 160` (steward.js:111); levers at steward.js:143–146. |
| A46 | Slow Island: Austad, Medawar/Williams, Y-model trade-off and mutation accumulation all correct and well implemented | CONFIRMED | The model is sound, including the Abrams (1993) caveat. But the objective misstates Austad's result (C3). |
| A47 | Commons: haystack model and Price split (between = Cov(w, x)/w̄, within = E(wΔx)/w̄) implemented correctly | CONFIRMED | steward.js:404–405. Mutation sits in the within term, as the text says. |
| A48 | `Gen` is diploid, with additive, dominant and mutation-count loci and free recombination | CONFIRMED | core.js:24–57. Each locus picks a parental copy independently. |
| A49 | `hwCounts` gives perfect proportions in L7, L9, L11 and L13; L4 and L12 are noisy | PARTLY RIGHT | L13 is stochastic (`wfNext`, lv_c.js:114, 122). `hwCounts` is not perfect either: see C1. |
| A50 | Exaggerated parameters are unlabelled; L10 labels its speed-up | CONFIRMED | lv_b.js:104; hunt.js:332; lv_c.js:42 ("a fantasy rate, a thousand times faster"). |
| A51 | The Census uses codominant snails, sampling costs, strata, p = 2(1 − Φ(√χ²)); it states the Wahlund deficit as 2 × variance and defines F | CONFIRMED | ch13.js:12, 36. For 1 df, P(χ² > x) = 2(1 − Φ(√x)). |
| A52 | Equilibrium background is "a quiet field, nothing moves" (engine.js:124); Tangled Bank renders a phone-width column | CONFIRMED | `#app{max-width:560px}` (tangled-bank shell.html:23). |
| A53 | Diploidy, sexual reproduction, non-overlapping generations, autosomal locus and equal sex frequencies are never named | PARTLY RIGHT | Diploidy (L1) and sex (L4: egg + sperm) are stated in plain words. The other three are never stated. |

## B. R4's own science, formulas and citations

| # | R4 statement | Verdict | Correction / source |
|---|---|---|---|
| B1 | Disassortative mating is negative frequency-dependent sexual selection: the rare type gets more matings | CONFIRMED | Also true of the game's `dis` model, which weights pairs by f_i·f_j. |
| B2 | That is "exactly why" self-incompatibility alleles and MHC diversity are maintained (Wright 1939) | PARTLY RIGHT | Correct for SI alleles: Wright (1939) *Genetics* 24:538 used Emerson's *Oenothera organensis* data. MHC diversity is mainly attributed to pathogen-mediated balancing selection. MHC-disassortative mate choice (Potts, Manning & Wakeland 1991, *Nature* 352:619) is a debated contributor, and Wright 1939 says nothing about MHC. |
| B3 | Narrower true statement: inbreeding and complete assortment with equal fertility change genotype, not allele, frequencies | CONFIRMED | General form: p is unchanged whenever every individual has the same expected gamete contribution. Unequal mating success is sexual selection and moves p. |
| B4 | s = 0.43 from 70%/40% | CONFIRMED | 1 − 0.4/0.7 = 0.429. |
| B5 | Carbonaria is a transposon insertion in *cortex*, about 1819 (van't Hof et al. 2016) | CONFIRMED | *Nature* 534:102–105. A single TE insertion haplotype. |
| B6 | Preference–colour linkage disequilibrium is the Fisherian mechanism | CONFIRMED | Fisher 1930; formalised by Lande 1981 and Kirkpatrick 1982. |
| B7 | "Yule (1902) argued a dominant should rise to 3:1"; Edwards 2008, *Genetics* 179:1143 | PARTLY RIGHT | The 3:1 remark was Yule's **1908** comment on Punnett's paper (*Proc. R. Soc. Med.*), which Hardy quotes (1908, *Science* 28:49). Yule's 1902 paper had actually found the 1:2:1 equilibrium. The Edwards citation is correct. The game's own line, "the puzzle Hardy was asked to solve in 1908" (lv_a.js:122), is right. |
| B8 | Mixer twist: p_f = 0.9, p_m = 0.3 gives AA = 0.27, not 0.36; one more round reaches HW; X-linkage never does it in one step | CONFIRMED | Offspring: 0.27 / 0.66 / 0.07 against HW 0.36 / 0.48 / 0.16. |
| B9 | An X-linked population "spirals in" on the triangle | CONFIRMED | The male–female difference in allele frequency halves and flips sign each generation, so the female point zigzags toward the curve. |
| B10 | Heterozygote advantage at equilibrium: p constant, adults above the curve | CONFIRMED | — |
| B11 | Haldane (1924) used the carbonaria rise to estimate s ≈ 0.33 | CONFIRMED | *Trans. Camb. Phil. Soc.* 23:19. Carbonaria about 1.5× as fit, so typica ≈ 0.67. Assumes 1% in 1848 and 99% in 1898, one generation a year. |
| B12 | 10⁻⁵ per locus per generation is a fair gene-level rate | CONFIRMED | Per-gene loss-of-function rates are about 10⁻⁴–10⁻⁶. The per-nucleotide rate is about 10⁻⁸. |
| B13 | Back mutation: p̂ = ν/(μ + ν) | CONFIRMED | Here μ is A→a and ν is a→A. |
| B14 | Mutation–selection balance: q̂ ≈ √(μ/s) for a recessive, ≈ μ/s for a dominant; at μ = 10⁻⁵, s = 1 that is 0.003 vs 0.00001 | CONFIRMED | √10⁻⁵ = 0.0032. With partial dominance h: μ/(hs). |
| B15 | Local adaptation survives roughly while m < s | CONFIRMED | Continent–island approximation (Haldane 1930). Two-deme symmetric models are more permissive. |
| B16 | "One migrant per generation" (Nm ≈ 1) | CONFIRMED | Wright's island model: F_ST ≈ 1/(1 + 4Nm) ≈ 0.2. The rule limits drift divergence; it does not guarantee local adaptation. |
| B17 | Buri (1956): "100 bottles of 16 flies" | PARTLY RIGHT | **107** lines of 8♂ + 8♀ *Drosophila*, bw/bw⁷⁵, 19 generations. The heterozygosity decay implies Ne ≈ 11.5, not 16, which is a ready-made Ne lesson. |
| B18 | 9:1 sex ratio from 40: Ne = 4NmNf/(Nm + Nf) = 14.4 | CONFIRMED | 4 × 36 × 4 / 40. |
| B19 | Fluctuating size uses the harmonic mean; equal family sizes give Ne ≈ 2N | CONFIRMED | Ne = (4N − 2)/(V_k + 2) with V_k = 0. |
| B20 | Bottlenecks strip allelic richness more than heterozygosity if recovery is fast (Nei, Maruyama & Chakraborty 1975) | CONFIRMED | *Evolution* 29:1–10. |
| B21 | Elephant seals and cheetahs as real anchors | CONFIRMED | Hoelzel et al. 1993; O'Brien et al. 1985. |
| B22 | H = 2pq(1 − F); aa = q² + pqF | CONFIRMED | — |
| B23 | Charles II F ≈ 0.25 (Alvarez, Ceballos & Quinteiro 2009, *PLoS ONE*) | CONFIRMED | F = 0.254; *PLoS ONE* 4:e5174. |
| B24 | Colour assortment leaves an unlinked locus on the curve; inbreeding lowers both | CONFIRMED | — |
| B25 | CFTR has > 2,000 variants; structure or consanguinity inflates aa, so √aa overestimates q | CONFIRMED | aa = q² + Fpq > q². |
| B26 | Counselling: 1/25 × 1/25 × 1/4 = 1/2,500; first cousins F = 1/16 | CONFIRMED | Exact value p²q² ≈ 1/2,600. With F = 1/16 the population-level risk is q² + Fpq ≈ 1/615. |
| B27 | HW χ² df = 3 classes − 1 − 1 estimated parameter | CONFIRMED | — |
| B28 | Sheppard (1952) reported non-random mating in the scarlet tiger colony | CONFIRMED | *Heredity* 6:239–241. He found a disassortative tendency. |
| B29 | Sickle-cell L17 data are "the classic adult survey… (Allison 1954)" | PARTLY RIGHT | The excess and deficit are real (A38). But Allison (1954, *BMJ* 1:290) measured malaria parasite rates in children with and without the trait; it is not a genotype census. The game gives no source ("a classic survey from the 1950s", lv_d.js:63), and these counts could not be traced to a source. |
| B30 | HW tests detect only very strong viability selection (Lewontin & Cockerham 1959) | CONFIRMED | *Evolution* 13:561–564. |
| B31 | n = 40: even F = 0.2 is often non-significant; n = 30,000: trivial deviations are significant | CONFIRMED | Simulated power: 0.20 at n = 40, F = 0.2; 0.92 at n = 30,000, F = 0.02. |
| B32 | Bond & Kamil (2002, *Nature*) is the right citation; add apostatic selection | CONFIRMED | 415:609–613. The apostatic-selection paper is Bond & Kamil 1998, *Nature* 395:594. |
| B33 | Black Country history: 1848, about 98% by 1895, Cook et al. 2012 | CONFIRMED | Majerus's experiment ran 2001–2007; Cook, Grant, Saccheri & Mallet 2012, *Biol. Lett.* 8:609. |
| B34 | Carbonaria is dominant, so its rise slows as typica hides; its post-1960 decline is fast | CONFIRMED | Decline-phase s against carbonaria ≈ 0.1–0.2 (Cook 2003; Saccheri et al. 2008). |
| B35 | Batesian mimicry is negative frequency-dependent and works best when rare | CONFIRMED | Mimics can stay protected when common if the model is very noxious or alternative prey are plentiful (Lindström et al. 1997; Ruxton, Sherratt & Speed 2004). |
| B36 | Endler (1980), Reznick follow-ups and Rodd et al. (2002) are correct | CONFIRMED | *Evolution* 34:76; Reznick, Bryga & Endler 1990, *Nature* 346:357; *Proc. R. Soc. B* 269:475. |
| B37 | Austad (1993) | CONFIRMED | *J. Zool.* 229:695. Island opossums: smaller litters, slower tendon-collagen ageing, about 25% longer life. |
| B38 | Price terms: between = Cov(w, x)/w̄, within = E(wΔx)/w̄ | CONFIRMED | — |
| B39 | HbS equilibrium q̂ = s/(s + t) | CONFIRMED | Fitnesses: AA 1 − s, AS 1, SS 1 − t. |
| B40 | ABO: r = √(share of type O) | CONFIRMED | — |
| B41 | X-linked recessive: affected males q, affected females q² | CONFIRMED | — |
| B42 | LD decays as D_t = D₀(1 − r)^t | CONFIRMED | — |
| B43 | F_ST = Var(p)/p̄q̄; pooled heterozygote deficit = 2Var(p) | CONFIRMED | — |
| B44 | Ne/N ≈ 0.1 in wild populations (Frankham 1995) | CONFIRMED | *Genet. Res.* 66:95–107. |
| B45 | Fixation probability ≈ 2s, so about 96 of 100 copies at s = 0.02 are lost | CONFIRMED | Haldane 1927. Assumes Ne = N; the general form is 2s·Ne/N. |
| B46 | Haldane's sieve: dominant beneficial mutations establish more often | CONFIRMED | The term is Turner's (1977). |
| B47 | "When Ns < 1, selection is invisible, which is the nearly neutral theory" | PARTLY RIGHT | The threshold is \|Ne·s\| ≲ 1 (some texts use 4Ne·s), with Ne, not census N. Ohta's nearly neutral theory (1973) is about the borderline class with \|Ne·s\| ≈ 1, whose fate depends on population size. It does not say selection is invisible. |
| B48 | Self-incompatibility alleles multiply to dozens | CONFIRMED | About 45 alleles in a small *O. organensis* population (Emerson 1939). |
| B49 | Technology section (Unity, PixiJS, Godot, Capacitor/Tauri) | NOT CHECKED | Not science; see R6. |

## C. Errors in this slice that R4 missed

1. **L7 rounding moves p, while the text says it did not** (lv_b.js:83, 89–90, 76). Population 2 starts at 32 AA, 0 Aa, 8 aa (p = 0.80).
   - `hwCounts(…, 40)` gives [26, 13, 1] (p = 0.8125), then [27, 12, 1] (p = 0.825). With N = 40, only p = 0.5 gives exact integer HW counts.
   - Yet the text says "exactly p², 2pq and q²". After the second generation it says "It did not move at all… p stayed 0.83 the whole time". The end card says "It never moves sideways".
   - The dot moves sideways twice, in the level that defines "sideways = evolution".
2. **The Black Country per-generation card gets dominance backwards** (hunt.js:369). It reads: "Carbonaria is now X% of gene copies — more than the black moths alone suggest would be hidden, because heterozygotes are black too."
   - Because heterozygotes are black, carbonaria's share of gene copies is *lower* than the share of black moths (75% black means q_C = 0.5).
   - The allele hiding in heterozygotes is the pale one. Carbonaria is never hidden.
3. **The Slow Island objective misstates Austad.** "Austad's result: island animals' protected lifespan reaches 1.5 × the mainland's" (steward.js:288). Austad reported about 25% longer life.
4. **The false "non-random mating never changes p" claim appears in two more places.** The Guide table ("Random mating: Genotype frequencies change; allele frequencies do not", lv_d.js:113) and the Case Files closing card ("non-random mating changes only the genotype frequencies", lv_d.js:96).
5. **L14 "Opposites attract" uses genotypes, not colours.** `matingDist 'dis'` pairs any unlike genotypes, so AA × Aa counts as "opposites" although both are blue (lv_b.js:3, lv_d.js:17). Meanwhile "Same colour" uses colour (`phenAssort`). This is the same "one label, two models" fault R4 found in L8.
6. **L13 overstates permanence.** The quiz says "lost alleles and lost heterozygosity cannot [come back]" (lv_c.js:109). They return by mutation or immigration, slowly: on the order of 1/μ, or Ne generations for H to re-equilibrate. Its "diversity" curve also mixes expected and realised H, `min(He, 2p(1−p))` (lv_c.js:114), while the label says "expected".
7. **The Lichen Wood heritability text cannot be right as written** (hunt.js:316–318).
   - R/S is clamped to [−1, 2], so the card can print "about 130% … passed on. The rest was developmental luck."
   - S and R are measured on tone alone, while the player selects on tone, hue and pattern. Correlated responses distort R/S.
   - With environmental SD 0.03 against genetic SD 0.13, the model's true h² for tone is about 0.95. Any low estimate is sampling noise, not "developmental luck".
8. **The Bitter Wings end card repeats R4's mimicry overstatement**: "only worth copying while it stays honest" (hunt.js:421). The mimic:model ratio is also fixed at 24:8 (hunt.js:395), so frequency dependence is never shown.
9. **The Black Country end card credits the pale comeback only to hidden heterozygote copies** (hunt.js:381). The code also injects one pure typica immigrant every generation (hunt.js:349), and the 1% forward mutation keeps adding carbonaria.
10. **The Black Country is in the wrong place.** The chapter is titled "The Black Country" (the West Midlands), but the premise is "Lancashire, 1848" (hunt.js:327). The 1848 specimen was from Manchester.
11. **The Aripo end card mislabels the process.** "Female preference drifted too" (steward.js:218). The change is mainly indirect selection through LD, not drift.
12. **The L8 "small population" row is imprecise.** The table says the dot "wanders at random along the curve" (lv_b.js:123). With 16 sampled offspring, the genotype frequencies scatter off the curve as well as along it.
13. **L17 sources and pooling.**
    - The sickle-cell counts have no source (lv_d.js:63).
    - The scarlet tiger counts are pooled over 1939–1964 while medionigra fell several-fold (lv_d.js:62). That temporal pooling slightly inflates bimacula (O/E 1.17). The note should say the data are pooled.
14. **Missing conditions on "equilibrium in one generation".** The Guide says genotypes "reach p², 2pq, q² after one generation" (lv_d.js:111), and the L7 end card agrees. Neither states the conditions: an autosomal locus, equal allele frequencies in the sexes, and non-overlapping generations.

## D. Corrections future agents must apply

Game text and code (Equilibrium = `games/equilibrium-hw/source/`, Tangled Bank = `games/tangled-bank/source/`):

1. **lv_b.js:126**: change the migration explanation to "Migrants carrying mostly **a** (p = 0.1) pulled the dot along the curve toward all-aa."
2. **lv_d.js:18, :96, :113**: replace "non-random mating never changes allele frequencies" with this: "Inbreeding, and assortative mating in which every type breeds equally, change genotype frequencies but not allele frequencies. Disassortative mating gives the rare type more matings and does change them (self-incompatibility alleles)." Add an "Opposites attract from p = 0.8" run that visibly moves p to 0.71.
3. **lv_d.js:13, :17**: make "Opposites attract" colour-based (blue × yellow only) to match "Same colour", or relabel it "unlike genotypes".
4. **lv_b.js:105–106**: label the L8 switch "inbreeding/selfing", or swap in `phenAssort`. Use one model per label across L8, L14 and L15.
5. **lv_c.js:12, :14**: block eating while the genotype lens is on, or delete "Try the genotype lens".
6. **lv_d.js:87**: change the survival figures to 70% vs 50% (s ≈ 0.29, which fits the existing trace), or replace the trace with the s = 0.43 path: 0.50, 0.56, 0.61, 0.65, 0.69, 0.72, 0.74, 0.77, 0.78, 0.80.
7. **lv_b.js:83, :89–90, :76 (L7)**: plot exact `hwExp(p)` frequencies with p held fixed, or use populations whose HW counts are integers (for example, 25 beetles at p = 0.8 gives 16/8/1). Drop "exactly" wherever it is not exact.
8. **lv_c.js:109**: change to "Numbers recover in a few generations; lost alleles come back only by mutation or immigration, over very many generations." **lv_c.js:123**: make the founder choice affect the score, or remove the free point.
9. **lv_d.js:111** and **lv_b.js:76**: add "for an autosomal gene, with the same allele frequencies in females and males".
10. **lv_d.js:62–63**: cite a real source for the sickle-cell counts or replace them. Say the moth counts are pooled across years.
11. **hunt.js:332**: set carbonaria `mu: 0` (p0 = 0.05 already seeds it). Mention the typica immigrant (hunt.js:349) in the end card (hunt.js:381).
12. **hunt.js:369**: rewrite as "Carbonaria is X% of gene copies, less than the Y% of moths that look black, because heterozygotes are black too: the pale allele hides in them."
13. **steward.js:218**: rewrite as "Choosy females' *offspring* inherit their mother's preference genes and their father's colour genes, so preference and colour alleles become associated (linkage disequilibrium). When colour is favoured, preference rises with it. That association is the engine of Fisher's runaway." Replace "drifted".
14. **hunt.js:392, :421**: change to "Mimics are protected best while rare; as they become common, predators sample more and protection weakens, unless the model is very noxious or other food is plentiful."
15. **steward.js:288**: change to "Beyond Austad's result (about 25% longer life): protected lifespan reaches 1.5×", or set the goal to 1.25×.
16. **hunt.js:316–318**: cap the realised heritability at 100%, or compute it on the composite camouflage score. Explain gaps as sampling noise, not "developmental luck".
17. **hunt.js:326–327**: make the title and setting agree. Either set the premise in the Black Country (Birmingham), or keep Manchester and rename the chapter.

Corrections to R4 itself (do not act on these R4 points as written):
- "Like with like" (lv_d.js:90) is consistent. Do not "fix" it (A9).
- L17 data are already codominant. The gap is a dominant-trait dataset and a low-power sample (A39).
- Yule's 3:1 argument was made in 1908, not 1902 (B7).
- Buri used 107 lines (B17).
- Allison 1954 is the malaria-protection paper, not the adult census (B29).
- Lichen Wood mornings last 12 s (A42).
- The Black Country end card already teaches dominance asymmetry in words (A43).
- The L9 target is reachable without the lens cheat (A7).
