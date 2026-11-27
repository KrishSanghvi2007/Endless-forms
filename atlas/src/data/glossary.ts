import type { GlossaryEntry } from '../types/atlas';

export const GLOSSARY: Record<string, GlossaryEntry> = {
  // --- Hardy–Weinberg & Population Genetics (Chapter 1: Equilibrium) ---
  allele_freq: {
    id: 'allele_freq',
    term: 'Allele Frequency (p, q)',
    pronunciation: 'ə-LEEL FREE-kwən-see',
    shortDef:
      'The proportion of all gene copies in a population that are a given allele. For two alleles A and a, p + q = 1.',
    deepNote:
      'Count copies, not individuals: in a diploid population of N beetles there are 2N allele copies, so p = (2·AA + Aa) / (2N).',
    relatedChapterId: 'hwe',
  },
  genotype_freq: {
    id: 'genotype_freq',
    term: 'Genotype Frequency',
    pronunciation: 'JEE-nə-type FREE-kwən-see',
    shortDef:
      'The proportion of individuals in a population carrying each diploid combination of alleles (AA, Aa, or aa).',
    deepNote:
      'Different genotype mixes can share the exact same allele frequency p—for example, 50% AA + 50% aa and 100% Aa both have p = 0.5.',
    relatedChapterId: 'hwe',
  },
  dominance: {
    id: 'dominance',
    term: 'Dominance (Yule’s Error)',
    pronunciation: 'DOM-ə-nəns',
    shortDef:
      'A property of how alleles interact to produce a phenotype (Aa looks like AA)—NOT a force that makes an allele more common over time.',
    deepNote:
      'In 1908 Udny Yule mistakenly wondered why dominant brachydactyly didn’t climb to 75%. G. H. Hardy and Wilhelm Weinberg independently proved that random mating leaves allele frequencies unchanged.',
    relatedChapterId: 'hwe',
  },
  hardy_weinberg: {
    id: 'hardy_weinberg',
    term: 'Hardy–Weinberg Equilibrium',
    pronunciation: 'HAR-dee WINE-berg',
    shortDef:
      'The null model of population genetics: under random mating with no selection, drift, mutation, or migration, genotype frequencies settle at p², 2pq, and q² in one generation and stay constant.',
    deepNote:
      'Its power lies in being a baseline yardstick. Departures point toward specific evolutionary or sampling forces—yet fitting HW does not prove zero evolution (drift and migration can move p while genotype proportions still fit).',
    relatedChapterId: 'hwe',
  },
  de_finetti: {
    id: 'de_finetti',
    term: 'de Finetti Triangle',
    pronunciation: 'də fin-ET-ee',
    shortDef:
      'A ternary plot mapping every possible diploid genotype mix (AA, Aa, aa) as one point inside an equilateral triangle, with the Hardy–Weinberg parabola curving across its centre.',
    deepNote:
      'Horizontal position equals allele frequency q (or p); height equals heterozygote share Aa. Points below the curve show heterozygote deficit (inbreeding or Wahlund); points above show heterozygote excess.',
    relatedChapterId: 'hwe',
  },
  chi_square: {
    id: 'chi_square',
    term: 'Chi-Square (χ²) Test (1 df)',
    pronunciation: 'KY skwair',
    shortDef:
      'A statistical test comparing observed genotype counts against Hardy–Weinberg expectations: χ² = Σ (O − E)² / E. For two alleles it has 1 degree of freedom, with 3.84 marking the 5% significance line.',
    deepNote:
      'Why 1 df? Three genotype classes minus 1 for fixed sample size N, minus 1 because p is estimated from the same sample. Small samples have low statistical power—failing to exceed 3.84 never proves equilibrium.',
    relatedChapterId: 'hwe',
  },
  inbreeding_f: {
    id: 'inbreeding_f',
    term: 'Inbreeding Coefficient (F)',
    pronunciation: 'in-BREE-ding koh-ə-FISH-ənt',
    shortDef:
      'The fractional shortfall of heterozygotes relative to Hardy–Weinberg expectation, Aa = 2pq(1 − F), caused by mating between relatives who share alleles identical by descent.',
    deepNote:
      'Inbreeding redistributes genotypes across the ENTIRE genome without changing allele frequency p by itself. One generation of random mating restores 2pq.',
    relatedChapterId: 'hwe',
  },
  wahlund: {
    id: 'wahlund',
    term: 'Wahlund Effect',
    pronunciation: 'VAH-loond',
    shortDef:
      'An apparent heterozygote deficit equal to 2·Var(p) created simply by pooling samples from two or more subpopulations (demes) that have different allele frequencies, even when each deme is in Hardy–Weinberg equilibrium.',
    deepNote:
      'First derived by Sten Wahlund (1928). Splitting the pooled sample along the true geographic or habitat boundary makes the deficit vanish in each subpopulation.',
    relatedChapterId: 'hwe',
  },
  heterozygote_advantage: {
    id: 'heterozygote_advantage',
    term: 'Heterozygote Advantage (Overdominance)',
    pronunciation: 'het-ər-oh-ZY-goht',
    shortDef:
      'Balancing selection in which heterozygotes (Aa) have higher fitness than either homozygote (AA or aa), maintaining both alleles at a stable internal equilibrium q̂ = s₁ / (s₁ + s₂).',
    deepNote:
      'In warfarin-baited Norway rats (VKORC1), susceptible AA rats die from poison while resistant aa homozygotes suffer severe vitamin-K deficiency—giving Aa heterozygotes the highest adult survival.',
    relatedChapterId: 'hwe',
  },
  carrier: {
    id: 'carrier',
    term: 'Recessive Carrier (2pq)',
    pronunciation: 'KAIR-ee-ər',
    shortDef:
      'A heterozygote (Aa) who carries one copy of a recessive allele without showing the recessive phenotype. Under HW, if recessive homozygotes occur at frequency aa, then q = √aa and carriers occur at 2pq.',
    deepNote:
      'When a recessive allele is rare (say aa = 1 in 2,500, so q = 1/50), carriers (2pq ≈ 1 in 25) vastly outnumber affected homozygotes—which is why selection removes rare recessives very slowly.',
    relatedChapterId: 'hwe',
  },

  // --- Evolutionary Game Theory & Kin Selection (Chapter 2: Conflict & Kinship) ---
  ess: {
    id: 'ess',
    term: 'Evolutionarily Stable Strategy (ESS)',
    pronunciation: 'E-S-S',
    shortDef:
      'A strategy (or mix of strategies) such that, if adopted by almost everyone in a population, no rare mutant strategy can invade and achieve higher fitness.',
    deepNote:
      'Formalised by Maynard Smith & Price (1973). Crucially, an ESS need NOT maximise the group’s average payoff—at the Hawk–Dove mixed ESS p* = V/C, average payoff is lower than in an all-Dove population, yet pure Doves are always invaded by Hawks.',
    relatedChapterId: 'social',
  },
  frequency_dependence: {
    id: 'frequency_dependence',
    term: 'Frequency-Dependent Selection',
    pronunciation: 'FREE-kwən-see dee-PEN-dənt',
    shortDef:
      'Selection in which the fitness of a phenotype or behavioural strategy depends on how common it is in the population.',
    deepNote:
      'In the Hawk–Dove game when V < C, negative frequency dependence favours whichever strategy is rare, locking the population into a stable polymorphism at p* = V/C.',
    relatedChapterId: 'social',
  },
  bourgeois: {
    id: 'bourgeois',
    term: 'Bourgeois Strategy',
    pronunciation: 'BOOR-zhwah',
    shortDef:
      'A conditional contest strategy based on an uncorrelated asymmetry: “play Hawk if you already hold the resource (owner); play Dove if you are the intruder.”',
    deepNote:
      'Maynard Smith (1982) showed that when V < C, Bourgeois is an ESS that resists invasion by both Hawks and Doves, settling territory contests peacefully with zero fights—seen in speckled wood butterflies, hermit crabs, and territorial birds.',
    relatedChapterId: 'social',
  },
  war_of_attrition: {
    id: 'war_of_attrition',
    term: 'War of Attrition',
    pronunciation: 'wor ov ə-TRISH-ən',
    shortDef:
      'A continuous-time contest without physical injury where both rivals pay escalating time/energy costs until one retreats and the other wins value V.',
    deepNote:
      'No single fixed persistence time t is an ESS (a rival waiting t + ε always wins cheaply). The unique ESS is an exponential distribution of display times f(t) = (1/V)·e^(−t/V) with mean persistence equal to V.',
    relatedChapterId: 'social',
  },
  relatedness: {
    id: 'relatedness',
    term: 'Coefficient of Relatedness (r)',
    pronunciation: 'ree-LAY-tid-nis',
    shortDef:
      'A statistical measure of the genetic similarity between an actor and recipient relative to the population average—in non-inbred pedigrees, the probability that an allele is shared identical by descent.',
    deepNote:
      'Computed via Wright’s path formula r = Σ (1/2)^L over all connecting paths of length L: parent–offspring = 0.5, full siblings = 0.5, half-siblings = 0.25, first cousins = 0.125.',
    relatedChapterId: 'social',
  },
  hamiltons_rule: {
    id: 'hamiltons_rule',
    term: 'Hamilton’s Rule (rB > C)',
    pronunciation: 'HAM-il-tənz rool',
    shortDef:
      'An altruistic allele spreads by natural selection if and only if rB > C, where r is relatedness to recipients, B is the reproductive benefit to recipients, and C is the reproductive cost to the actor.',
    deepNote:
      'Formulated by W. D. Hamilton (1964). It explains apparent self-sacrifice (such as ground-squirrel alarm calls) at the gene level without invoking “for the good of the species”.',
    relatedChapterId: 'social',
  },
  inclusive_fitness: {
    id: 'inclusive_fitness',
    term: 'Inclusive Fitness',
    pronunciation: 'in-KLOO-siv FIT-nis',
    shortDef:
      'The sum of an individual’s direct fitness (its own offspring) plus its indirect fitness (extra offspring produced by relatives due to the actor’s help, weighted by relatedness r).',
    deepNote:
      'Natural selection acts as if organisms maximise inclusive fitness—uniting selfish competition (r = 0) and kin altruism (r > 0) inside one framework.',
    relatedChapterId: 'social',
  },
  haplodiploidy: {
    id: 'haplodiploidy',
    term: 'Haplodiploidy (3/4 Relatedness Caveat)',
    pronunciation: 'hap-loh-DIP-loy-dee',
    shortDef:
      'A sex-determination system (bees, wasps, ants) where unfertilised eggs become haploid males and fertilised eggs become diploid females, making full sisters share r = 0.75.',
    deepNote:
      'Caution: full sisters share 0.50 via their haploid father plus 0.25 via their mother (= 0.75), BUT a female’s relatedness to her brothers is only 0.25 (average 0.50 across an equal sex ratio). Modern research (Boomsma 2009; West et al. 2007) shows strict lifetime monogamy and ecological B/C ratios matter far more than haplodiploidy alone.',
    relatedChapterId: 'social',
  },

  // --- Natural Selection, Quantitative Genetics & Landscapes (Chapter 3: The Lichen Wood & Soot) ---
  natural_selection: {
    id: 'natural_selection',
    term: 'Natural Selection',
    pronunciation: 'NACH-ər-əl si-LEK-shən',
    shortDef:
      'Differential survival and reproduction of individuals due to heritable differences in phenotype—shifting population trait frequencies across generations.',
    deepNote:
      'Crucial distinction: selection acts on individuals (who survive or die), yet individuals do not evolve during their lives; populations evolve across generations.',
    relatedChapterId: 'lichen',
  },
  heritability: {
    id: 'heritability',
    term: 'Narrow-Sense Heritability (h²)',
    pronunciation: 'her-i-tə-BIL-i-tee',
    shortDef:
      'The fraction of phenotypic variance in a population caused by additive genetic differences (h² = V_A / V_P), equal to the slope of offspring on mid-parent trait value.',
    deepNote:
      'h² is a property of a specific population in a specific environment, not a fixed destiny of a trait. If h² = 0, even intense selection produces zero evolutionary response (R = 0).',
    relatedChapterId: 'lichen',
  },
  breeders_equation: {
    id: 'breeders_equation',
    term: 'Breeder’s Equation (R = h²S)',
    pronunciation: 'BREE-dərz i-KWAY-zhən',
    shortDef:
      'Predicts the single-generation evolutionary shift in a quantitative trait mean (Response R) as the product of narrow-sense heritability (h²) and the selection differential (S).',
    deepNote:
      'S = μ_survivors − μ_population measures selection within one generation; h² determines how much of S is faithfully transmitted to offspring.',
    relatedChapterId: 'lichen',
  },
  industrial_melanism: {
    id: 'industrial_melanism',
    term: 'Industrial Melanism',
    pronunciation: 'in-DUS-tree-əl MEL-ə-niz-əm',
    shortDef:
      'The rapid rise of dark-pigmented morphs in soot-darkened industrial habitats—famously documented in the British peppered moth (Biston betularia).',
    deepNote:
      'Genomic mapping (Van’t Hof et al. 2016) showed British carbonaria arose from a single transposable-element insertion into the cortex gene around 1819; Majerus’s 6-year study (Cook et al. 2012) confirmed strong selective bird predation.',
    relatedChapterId: 'lichen',
  },
  dominance_asymmetry: {
    id: 'dominance_asymmetry',
    term: 'Dominance Asymmetry in Selection',
    pronunciation: 'DOM-i-nəns ay-SIM-ə-tree',
    shortDef:
      'A favoured dominant allele spreads rapidly from rarity because heterozygotes express the trait immediately, whereas a rare recessive allele is sheltered inside heterozygotes (2pq ≫ q²).',
    deepNote:
      'This asymmetry explains why dominant carbonaria surged rapidly under 19th-century soot AND plunged quickly once the 1956 Clean Air Act cleaned birch bark, while pale recessive c alleles survived hidden in Cc heterozygotes.',
    relatedChapterId: 'lichen',
  },
  stabilizing_selection: {
    id: 'stabilizing_selection',
    term: 'Stabilizing Selection',
    pronunciation: 'STAY-bi-ly-zing si-LEK-shən',
    shortDef:
      'Selection favouring intermediate phenotypes over both extremes, holding the population mean steady while shrinking phenotypic variance (Δσ² < 0).',
    deepNote:
      'Classic empirical examples include avian clutch size (Lack’s clutch) and mammalian neonatal birth weight.',
    relatedChapterId: 'lichen',
  },
  disruptive_selection: {
    id: 'disruptive_selection',
    term: 'Disruptive (Diversifying) Selection',
    pronunciation: 'dis-RUP-tiv si-LEK-shən',
    shortDef:
      'Selection favouring both phenotypic extremes over intermediate forms, increasing variance (Δσ² > 0) and generating bimodal polymorphism.',
    deepNote:
      'Seen in African black-bellied seedcrackers (Pyrenestes ostrinus), where small-beaked and large-beaked birds specialize on soft vs. hard sedge seeds while intermediates forage less efficiently.',
    relatedChapterId: 'lichen',
  },
  fitness_landscape: {
    id: 'fitness_landscape',
    term: 'Fitness Landscape (Adaptive Topography)',
    pronunciation: 'FIT-nis LAND-skayp',
    shortDef:
      'Sewall Wright’s (1932) map plotting mean fitness W as elevation over trait or genotype space, showing peaks (optima) separated by maladaptive valleys.',
    deepNote:
      'Pure selection is myopic hill-climbing and can trap populations on local peaks. However, environmental change deforms the landscape over time, and high-dimensional genotype spaces often contain neutral ridges (“holey landscapes”, Gavrilets 2004).',
    relatedChapterId: 'lichen',
  },

  // --- Genetic Drift, Ne & Coalescent (Chapter 4: Drift Casino) ---
  genetic_drift: {
    id: 'genetic_drift',
    term: 'Genetic Drift',
    pronunciation: 'jə-NET-ik DRIFT',
    shortDef:
      'Random fluctuations in allele frequencies from generation to generation due to finite sampling of gametes—strongest in small populations (Var(Δp) = p(1−p)/(2Ne)).',
    deepNote:
      'For strictly neutral alleles (s = 0), drift has no preferred direction (E[p_t] = p₀) and the probability of eventual fixation equals starting frequency p₀.',
    relatedChapterId: 'casino',
  },
  effective_population_size: {
    id: 'effective_population_size',
    term: 'Effective Population Size (Ne)',
    pronunciation: 'i-FEK-tiv pop-yoo-LAY-shən SYZ',
    shortDef:
      'The size of an ideal Wright–Fisher population that would experience the same rate of genetic drift (variance in Δp or heterozygosity loss) as the actual population.',
    deepNote:
      'Ne is almost always smaller than census count N due to unequal family sizes (Buri 1956: N = 16 behaved like Ne ≈ 11.5), skewed sex ratios (Ne = 4NmNf/(Nm+Nf)), and population crashes (harmonic mean).',
    relatedChapterId: 'casino',
  },
  bottleneck_founder: {
    id: 'bottleneck_founder',
    term: 'Bottleneck & Founder Effect',
    pronunciation: 'BOT-əl-nek',
    shortDef:
      'A sharp, temporary drop in population size (or colonization by a few founders) that causes severe sampling error and immediate loss of rare alleles.',
    deepNote:
      'Critical distinction (Nei et al. 1975): a single brief bottleneck destroys allelic richness immediately (rare alleles vanish), whereas expected heterozygosity drops more slowly (by 1/(2Ne) per generation).',
    relatedChapterId: 'casino',
  },
  nearly_neutral: {
    id: 'nearly_neutral',
    term: 'Effectively Neutral Regime (|4Ne·s| ≲ 1)',
    pronunciation: 'NEER-lee NOO-trəl',
    shortDef:
      'The threshold where random genetic drift overpowers weak natural selection—allowing mildly deleterious alleles to fix and beneficial alleles to be lost by chance.',
    deepNote:
      'Follows from Kimura’s (1962) diffusion fixation probability P(fix) = (1 − e^(−4Ne·s·p₀)) / (1 − e^(−4Ne·s)). Selection acts reliably only when |4Ne·s| ≫ 1.',
    relatedChapterId: 'casino',
  },
  coalescent: {
    id: 'coalescent',
    term: 'Kingman’s Coalescent',
    pronunciation: 'koh-ə-LES-ənt',
    shortDef:
      'A backward-in-time stochastic process tracing sampled gene copies back through ancestral generations until pairs merge (coalesce) into their Most Recent Common Ancestor (MRCA).',
    deepNote:
      'With k active lineages in a diploid population of size Ne, the instantaneous coalescence rate is k(k−1)/(4Ne), giving expected tree height E[T_MRCA] = 4Ne(1 − 1/n).',
    relatedChapterId: 'casino',
  },
  tajimas_d: {
    id: 'tajimas_d',
    term: 'Tajima’s D',
    pronunciation: 'tə-JEE-məz DEE',
    shortDef:
      'A population-genomic test statistic comparing pairwise nucleotide diversity (π) against the number of segregating sites (S) to detect departures from constant-size neutrality.',
    deepNote:
      'D < 0 indicates an excess of rare singletons (rapid population expansion genome-wide, OR a hard selective sweep at one locus). D > 0 indicates excess intermediate-frequency variants (recent bottleneck or balancing selection).',
    relatedChapterId: 'casino',
  },

  // --- Mimicry & Aposematism (Chapter 5: Bitter Wings) ---
  batesian_mimicry: {
    id: 'batesian_mimicry',
    term: 'Batesian Mimicry',
    pronunciation: 'BAYT-see-ən MIM-ik-ree',
    shortDef:
      'Evolution of a warning signal in a palatable (harmless) species that resembles a chemically or physically defended model, borrowing protection from educated predators.',
    deepNote:
      'Works best while mimics are rare relative to models (negative frequency-dependent selection), though the critical breakdown threshold p* = C/(B+C) rises when models are strongly noxious (Lindström et al. 1997; Sherratt 2002).',
    relatedChapterId: 'bitter',
  },
  mullerian_mimicry: {
    id: 'mullerian_mimicry',
    term: 'Müllerian Mimicry',
    pronunciation: 'myoo-LAIR-ee-ən MIM-ik-ree',
    shortDef:
      'Convergence of two or more genuinely defended species onto a shared warning signal so they share the fixed cost L of teaching naive predators.',
    deepNote:
      'Creates positive frequency-dependent selection: per-capita learning mortality drops from L/N₁ to L/(N₁ + N₂) (Müller 1879).',
    relatedChapterId: 'bitter',
  },
  imperfect_mimicry: {
    id: 'imperfect_mimicry',
    term: 'Imperfect Mimicry',
    pronunciation: 'im-PER-fikt MIM-ik-ree',
    shortDef:
      'Persistence of palatable mimics that only roughly resemble their toxic models, explained largely by steep mistake costs widening predator avoidance generalization (Sherratt 2002).',
    relatedChapterId: 'bitter',
  },
  advergence: {
    id: 'advergence',
    term: 'Asymmetric Advergence',
    pronunciation: 'ad-VER-jəns',
    shortDef:
      'One-sided evolutionary convergence in which a rarer defended species shifts its warning pattern onto an abundant co-mimic (e.g. Heliconius melpomene onto H. erato via unlinked large-effect loci optix/WntA).',
    relatedChapterId: 'bitter',
  },
  aposematism: {
    id: 'aposematism',
    term: 'Aposematism (Warning Colouration)',
    pronunciation: 'ap-ə-SEM-ə-tiz-əm',
    shortDef:
      'Conspicuous colours, patterns, or signals advertising genuine chemical or physical defence to potential predators.',
    deepNote:
      'Rare novel warning mutants suffer anti-apostatic mortality (Langham 2004); kin aggregation (Sillén-Tullberg 1988) and non-lethal taste-rejection (Chai 1986) are major routes enabling aposematism to invade from rarity.',
    relatedChapterId: 'bitter',
  },

  // --- Balancing Selection & NFDS (Chapter 6: Left Jaw, Right Jaw) ---
  nfds: {
    id: 'nfds',
    term: 'Negative Frequency-Dependent Selection (NFDS)',
    pronunciation: 'NEG-ə-tiv FREE-kwən-see di-PEN-dənt',
    shortDef:
      'Selection in which a phenotype’s relative fitness increases as it becomes rarer and decreases as it becomes common—actively preserving polymorphism.',
    deepNote:
      'Classic examples include Perissodus scale-eating cichlids (Hori 1993), rare-allele MHC immunity, and Batesian mimicry.',
    relatedChapterId: 'jaws',
  },
  balancing_selection: {
    id: 'balancing_selection',
    term: 'Balancing Selection',
    pronunciation: 'BAL-ən-sing si-LEK-shən',
    shortDef:
      'Any selective mechanism—such as heterozygote advantage, negative frequency dependence, or fluctuating niches—that actively maintains multiple alleles in a population.',
    deepNote:
      'In DNA sequences, long-term balancing selection creates deep internal coalescent branches and an excess of intermediate-frequency alleles (Tajima’s D > 0).',
    relatedChapterId: 'jaws',
  },
  rock_paper_scissors: {
    id: 'rock_paper_scissors',
    term: 'Intransitive Rock–Paper–Scissors Dynamics',
    pronunciation: 'in-TRAN-si-tiv',
    shortDef:
      'A non-transitive 3-strategy evolutionary cycle (A beats B, B beats C, C beats A) in which no single strategy dominates, producing perpetual morph oscillations.',
    deepNote:
      'Documented in California side-blotched lizards (Uta stansburiana; Sinervo & Lively 1996) and colicin-producing E. coli bacteria.',
    relatedChapterId: 'jaws',
  },
  trans_species_polymorphism: {
    id: 'trans_species_polymorphism',
    term: 'Trans-Species Polymorphism',
    pronunciation: 'tranz-SPEE-sheez pol-ee-MOR-fiz-əm',
    shortDef:
      'Persistence of ancient ancestral alleles across speciation events so that an allele in one species (e.g. human MHC) is more closely related to an allele in another species (chimpanzee) than to other alleles in its own species.',
    relatedChapterId: 'jaws',
  },

  // --- Mutation, Linkage & Gene Flow (Chapter 7: The Genetic Engine) ---
  luria_delbruck: {
    id: 'luria_delbruck',
    term: 'Luria–Delbrück Fluctuation Test',
    pronunciation: 'LOOR-ee-ə del-BRIK',
    shortDef:
      'Classic 1943 experiment proving bacterial phage-resistance mutations arise spontaneously and randomly before exposure to selection, revealed by massive jackpot variance (Var / Mean ≫ 1) across parallel cultures.',
    relatedChapterId: 'engine',
  },
  dfe: {
    id: 'dfe',
    term: 'Distribution of Fitness Effects (DFE)',
    pronunciation: 'dis-tri-BYOO-shən',
    shortDef:
      'The probability distribution of selection coefficients (s) among newly arising mutations—overwhelmingly neutral or deleterious, with only a tiny tail of beneficial mutations.',
    relatedChapterId: 'engine',
  },
  mutation_selection_balance: {
    id: 'mutation_selection_balance',
    term: 'Mutation–Selection Balance',
    pronunciation: 'myoo-TAY-shən si-LEK-shən',
    shortDef:
      'Equilibrium frequency of a deleterious allele where recurrent mutation (μ) equals purifying selection (s): q* = √(μ/s) for completely recessive alleles versus q* = μ/s for dominant alleles.',
    relatedChapterId: 'engine',
  },
  linkage_disequilibrium: {
    id: 'linkage_disequilibrium',
    term: 'Linkage Disequilibrium (LD)',
    pronunciation: 'LING-kij dis-ee-kwə-LIB-ree-əm',
    shortDef:
      'Non-random statistical association of alleles at two or more loci (D = P_AB − p_A p_B), decaying geometrically each generation under recombination as D_t = D₀(1 − r)^t.',
    relatedChapterId: 'engine',
  },
  selective_sweep: {
    id: 'selective_sweep',
    term: 'Selective Sweep (Genetic Hitchhiking)',
    pronunciation: 'si-LEK-tiv SWEEP',
    shortDef:
      'Rapid fixation of a strongly beneficial mutation that drags physically linked neutral alleles along, creating a localized genomic valley of reduced diversity (π) and negative Tajima’s D.',
    relatedChapterId: 'engine',
  },
  fst: {
    id: 'fst',
    term: 'Fixation Index (F_ST)',
    pronunciation: 'EF ess TEE',
    shortDef:
      'Proportion of total genetic variance partitioned among subpopulations rather than within them; in Wright’s Island Model at equilibrium, F_ST = 1 / (4N_e m + 1).',
    relatedChapterId: 'engine',
  },
  gene_flow: {
    id: 'gene_flow',
    term: 'Gene Flow (Migration)',
    pronunciation: 'JEEN FLOH',
    shortDef:
      'Movement of alleles among populations via dispersing individuals or gametes—homogenizing neutral allele frequencies and capable of swamping local adaptation when migration exceeds selection (m > s).',
    relatedChapterId: 'engine',
  },

  // --- Sexual Selection & Life History (Chapter 8: Sex, Choice & Slow Islands) ---
  anisogamy: {
    id: 'anisogamy',
    term: 'Anisogamy',
    pronunciation: 'an-eye-SOG-ə-mee',
    shortDef:
      'Fusion of gametes of starkly unequal sizes—large, resource-rich eggs and tiny, abundant sperm—which typically drives asymmetric parental investment and sexual selection.',
    relatedChapterId: 'raffle',
  },
  osr: {
    id: 'osr',
    term: 'Operational Sex Ratio (OSR)',
    pronunciation: 'op-ə-RAY-shən-əl',
    shortDef:
      'The ratio of sexually receptive males to sexually receptive females in a population at a given moment; dictates which sex competes more intensely for mates.',
    relatedChapterId: 'raffle',
  },
  bateman_gradient: {
    id: 'bateman_gradient',
    term: 'Bateman Gradient',
    pronunciation: 'BAYT-mən GRAY-dee-ənt',
    shortDef:
      'The slope of reproductive success (offspring produced) regressed on number of mates—steeper in the sex limited by mate access rather than gamete/brooding capacity.',
    relatedChapterId: 'raffle',
  },
  fisher_runaway: {
    id: 'fisher_runaway',
    term: 'Fisherian Runaway Selection',
    pronunciation: 'FISH-er-ee-ən',
    shortDef:
      'Self-reinforcing coevolution of female mate preference and an elaborate male ornament via linkage disequilibrium between preference and trait alleles (“sexy sons”).',
    relatedChapterId: 'raffle',
  },
  sperm_competition: {
    id: 'sperm_competition',
    term: 'Sperm Competition',
    pronunciation: 'SPURM kom-pi-TISH-ən',
    shortDef:
      'Post-copulatory sexual selection in which ejaculates from two or more males compete inside a female’s reproductive tract to fertilize a given set of ova (Parker 1970).',
    relatedChapterId: 'raffle',
  },
  fisher_sex_ratio: {
    id: 'fisher_sex_ratio',
    term: 'Fisher’s Sex-Ratio Principle',
    pronunciation: 'FISH-erz SEKS RAY-shee-oh',
    shortDef:
      'Negative frequency-dependent selection stabilizing equal 50:50 parental investment in sons and daughters, because individuals of the rarer sex have higher expected reproductive success.',
    relatedChapterId: 'raffle',
  },
  senescence: {
    id: 'senescence',
    term: 'Evolutionary Senescence (Ageing)',
    pronunciation: 'si-NES-əns',
    shortDef:
      'Age-related decline in survival and fertility evolving because extrinsic mortality weakens Hamilton’s force of natural selection at older ages (Medawar 1952; Williams 1957).',
    relatedChapterId: 'raffle',
  },

  // --- Why Sex? & Red Queen (Chapter 9) ---
  twofold_cost: {
    id: 'twofold_cost',
    term: 'Twofold Cost of Males',
    pronunciation: 'TOO-fohld KOST',
    shortDef:
      'Maynard Smith’s (1978) paradox: an asexual parthenogenetic female produces twice as many egg-laying daughters per generation as a sexual female who invests half her offspring in males.',
    relatedChapterId: 'sex',
  },
  mullers_ratchet: {
    id: 'mullers_ratchet',
    term: 'Muller’s Ratchet',
    pronunciation: 'MUL-erz RACH-it',
    shortDef:
      'Irreversible stochastic loss of the least-mutated genome class (k = 0) in finite asexual populations due to genetic drift, causing deleterious mutation load to click upward.',
    relatedChapterId: 'sex',
  },
  red_queen: {
    id: 'red_queen',
    term: 'Red Queen Hypothesis',
    pronunciation: 'RED KWEEN',
    shortDef:
      'Continuous antagonistic coevolution where hosts must constantly shuffle resistance alleles via sexual recombination just to stay ahead of fast-evolving parasites (Van Valen 1973; Lively 1987).',
    relatedChapterId: 'sex',
  },
  partner_sanctions: {
    id: 'partner_sanctions',
    term: 'Partner Choice & Sanctions',
    pronunciation: 'PAHRT-ner SANGK-shənz',
    shortDef:
      'Mechanisms (punishment, withholding rewards, or switching partners) that penalize cheating symbionts and stabilize mutualisms against evolutionary collapse.',
    relatedChapterId: 'sex',
  },
  virulence_tradeoff: {
    id: 'virulence_tradeoff',
    term: 'Virulence–Transmission Trade-Off',
    pronunciation: 'VIR-yoo-ləns TRAYD-of',
    shortDef:
      'Evolutionary balance in which higher pathogen replication boosts transmission β(α) but shortens host survival (1/(μ+α+γ)), selecting for whichever strain maximizes R₀.',
    relatedChapterId: 'sex',
  },

  // --- Evo-Devo, Plasticity & Major Transitions (Chapter 10) ---
  cis_regulatory: {
    id: 'cis_regulatory',
    term: 'Cis-Regulatory Element (Enhancer)',
    pronunciation: 'sis REG-yoo-lə-tor-ee',
    shortDef:
      'A non-coding DNA switch near a gene that controls where and when that gene is transcribed in specific tissues—allowing modular morphological evolution without pleiotropic side effects.',
    relatedChapterId: 'switch',
  },
  phenotypic_plasticity: {
    id: 'phenotypic_plasticity',
    term: 'Phenotypic Plasticity',
    pronunciation: 'fee-nə-TIP-ik plas-TIS-i-tee',
    shortDef:
      'The capacity of a single genotype to produce distinct phenotypes in response to environmental cues (e.g. Daphnia growing defensive helmets when smelling predator kairomones).',
    relatedChapterId: 'switch',
  },
  reaction_norm: {
    id: 'reaction_norm',
    term: 'Reaction Norm (G×E Interaction)',
    pronunciation: 'ree-AK-shən NORM',
    shortDef:
      'The curve plotting the phenotypes expressed by one genotype across a range of environments; crossing reaction norms indicate Genotype × Environment (G×E) interaction.',
    relatedChapterId: 'switch',
  },
  major_transition: {
    id: 'major_transition',
    term: 'Major Evolutionary Transition',
    pronunciation: 'MAY-jer tran-ZISH-ən',
    shortDef:
      'An evolutionary shift in which formerly independent replicators (e.g. solitary cells) unite into a higher-level individual with division of labour, typically stabilized by a single-cell bottleneck (r = 1).',
    relatedChapterId: 'switch',
  },

  // --- Phylogenetics & Molecular Evolution (Chapter 12) ---
  phylogeny: {
    id: 'phylogeny',
    term: 'Phylogenetic Tree (Cladogram)',
    pronunciation: 'fy-loh-jə-NET-ik',
    shortDef:
      'A branching hypothesis of shared evolutionary ancestry; relatedness is defined strictly by Most Recent Common Ancestors (MRCAs), never by tip order.',
    relatedChapterId: 'trees',
  },
  homoplasy: {
    id: 'homoplasy',
    term: 'Homoplasy',
    pronunciation: 'hə-MOP-lə-see',
    shortDef:
      'Shared similarity not inherited from a common ancestor—arising via convergent evolution or evolutionary reversal (e.g. streamlined aquatic fins in sharks and whales).',
    relatedChapterId: 'trees',
  },
  parsimony: {
    id: 'parsimony',
    term: 'Maximum Parsimony',
    pronunciation: 'PAHR-si-moh-nee',
    shortDef:
      'A phylogenetic criterion preferring the tree topology that explains observed character states with the fewest total evolutionary changes.',
    relatedChapterId: 'trees',
  },
  molecular_clock: {
    id: 'molecular_clock',
    term: 'Neutral Molecular Clock (K = μ)',
    pronunciation: 'mə-LEK-yoo-lər KLOK',
    shortDef:
      'Kimura’s (1968) result that strictly neutral alleles substitute at rate K = (2N_e μ)(1/2N_e) = μ, independent of population size N_e, allowing DNA divergence to date splits once fossil-calibrated.',
    relatedChapterId: 'trees',
  },
  dnds: {
    id: 'dnds',
    term: 'dN / dS Ratio (ω)',
    pronunciation: 'dee-EN over dee-ES',
    shortDef:
      'Ratio of non-synonymous to synonymous substitution rates per site: ω < 1 indicates purifying selection, ω ≈ 1 neutral evolution, and ω > 1 positive diversifying selection.',
    relatedChapterId: 'trees',
  },
  ils: {
    id: 'ils',
    term: 'Incomplete Lineage Sorting (ILS)',
    pronunciation: 'in-kəm-PLEET LIN-ee-ij',
    shortDef:
      'Persistence of ancestral gene polymorphism across closely spaced speciation events (deep coalescence), generating gene trees that disagree with the species tree without hybridization.',
    relatedChapterId: 'trees',
  },

  // --- Speciation & Hybridization (Chapter 13: Splitting Branches) ---
  ring_species: {
    id: 'ring_species',
    term: 'Ring Species',
    pronunciation: 'RING SPEE-sheez',
    shortDef:
      'A connected geographic chain of interbreeding populations encircling a barrier (e.g. Greenish Warblers around the Tibetan Plateau) whose terminal ends overlap without interbreeding.',
    relatedChapterId: 'species',
  },
  bdm_incompatibility: {
    id: 'bdm_incompatibility',
    term: 'Dobzhansky–Muller Incompatibility (BDM)',
    pronunciation: 'dohb-ZHAN-skee MUL-er',
    shortDef:
      'Intrinsic hybrid inviability or sterility caused by negative epistatic interactions between derived alleles at two or more loci that evolved independently without crossing a fitness valley.',
    relatedChapterId: 'species',
  },
  sympatric_speciation: {
    id: 'sympatric_speciation',
    term: 'Sympatric Speciation',
    pronunciation: 'sim-PAT-rik spee-shee-AY-shən',
    shortDef:
      'Divergence into reproductively isolated lineages within the same geographic range without physical barriers, driven by strong disruptive ecological selection + assortative mating or polyploidy.',
    relatedChapterId: 'species',
  },
  reinforcement: {
    id: 'reinforcement',
    term: 'Reinforcement',
    pronunciation: 'ree-in-FORS-mənt',
    shortDef:
      'Natural selection directly strengthening prezygotic mate discrimination in sympatry to avoid wasting reproductive effort on low-fitness hybrids.',
    relatedChapterId: 'species',
  },
  allopolyploidy: {
    id: 'allopolyploidy',
    term: 'Allopolyploidy',
    pronunciation: 'al-oh-POL-ee-ploy-dee',
    shortDef:
      'Whole-genome doubling following interspecific hybridization, restoring fertile homologous chromosome pairing while instantly isolating the new polyploid from both parent species.',
    relatedChapterId: 'species',
  },

  // --- Deep Time, Fossils & Mass Extinctions (Chapter 14) ---
  deep_time: {
    id: 'deep_time',
    term: 'Deep Geological Time',
    pronunciation: 'DEEP TYM',
    shortDef:
      'The 4.54-billion-year span of Earth history (~3.8 Ga of life), during which microbial life dominated for >85% of time before animal radiations in the Phanerozoic.',
    relatedChapterId: 'deeptime',
  },
  radiometric_dating: {
    id: 'radiometric_dating',
    term: 'Radiometric Dating',
    pronunciation: 'ray-dee-oh-MET-rik DAY-ting',
    shortDef:
      'Absolute age determination measuring radioactive parent-to-daughter isotope ratios via exponential decay N(t) = N₀(½)^n (e.g. ¹⁴C for <50 ka organics; ⁴⁰K/⁴⁰Ar & U–Pb for volcanic ash beds).',
    relatedChapterId: 'deeptime',
  },
  transitional_fossil: {
    id: 'transitional_fossil',
    term: 'Transitional Fossil',
    pronunciation: 'tran-ZISH-ən-əl FOS-əl',
    shortDef:
      'A fossilized organism exhibiting a predicted mosaic of ancestral and derived homologous traits bridging major clades (e.g. Tiktaalik roseae, Archaeopteryx, Ambulocetus).',
    relatedChapterId: 'deeptime',
  },
  adaptive_radiation: {
    id: 'adaptive_radiation',
    term: 'Adaptive Radiation',
    pronunciation: 'ə-DAP-tiv ray-dee-AY-shən',
    shortDef:
      'Rapid evolutionary diversification of a single ancestral lineage into an array of ecologically distinct species following ecological opportunity (such as mass extinctions or island colonization).',
    relatedChapterId: 'deeptime',
  },

  // --- Ecology & Eco-Evo Dynamics (Chapter 15: Ecology in Motion) ---
  character_displacement: {
    id: 'character_displacement',
    term: 'Ecological Character Displacement',
    pronunciation: 'KAR-ik-ter dis-PLAYS-mənt',
    shortDef:
      'Evolutionary divergence of resource-use traits (such as Galápagos finch beak depth) between competing species where they co-occur in sympatry (Grant & Grant 2006).',
    relatedChapterId: 'ecology',
  },
  trophic_cascade: {
    id: 'trophic_cascade',
    term: 'Trophic Cascade',
    pronunciation: 'TROH-fik kas-KAYD',
    shortDef:
      'Top-down ecological chain reaction in which predators suppress herbivores, indirectly boosting primary producers (e.g. sea otters suppressing sea urchins so giant kelp forests thrive).',
    relatedChapterId: 'ecology',
  },
  keystone_species: {
    id: 'keystone_species',
    term: 'Keystone Species',
    pronunciation: 'KEE-stohn SPEE-sheez',
    shortDef:
      'A species exerting a disproportionately large structuring effect on community diversity and ecosystem state relative to its total biomass or abundance.',
    relatedChapterId: 'ecology',
  },
  island_biogeography: {
    id: 'island_biogeography',
    term: 'Island Biogeography Equilibrium (S*)',
    pronunciation: 'by-oh-jee-OG-rə-fee',
    shortDef:
      'MacArthur & Wilson’s (1967) dynamic balance between island colonization (decreasing with distance) and local extinction (decreasing with area), maintaining equilibrium richness S* with ongoing species turnover.',
    relatedChapterId: 'ecology',
  },
  ifd: {
    id: 'ifd',
    term: 'Ideal Free Distribution (IFD)',
    pronunciation: 'eye-DEEL FREE',
    shortDef:
      'Fretwell & Lucas (1970) foraging equilibrium in which mobile individuals settle across patches in direct proportion to food supply (input matching), equalizing per-capita intake everywhere.',
    relatedChapterId: 'ecology',
  },
  extinction_vortex: {
    id: 'extinction_vortex',
    term: 'Extinction Vortex',
    pronunciation: 'ik-STINGK-shən VOR-teks',
    shortDef:
      'Positive feedback spiral in tiny isolated populations where genetic drift, inbreeding depression, and demographic stochasticity reinforce one another toward extinction unless broken by genetic rescue.',
    relatedChapterId: 'ecology',
  },

  // --- Comparative Anatomy & Evo-Devo (Chapter 11: Same bones, different lives) ---
  homology: {
    id: 'homology',
    term: 'Homology',
    pronunciation: 'hə-MOL-ə-jee',
    shortDef:
      'Similarity between traits in different species because they were inherited from a shared common ancestor, even if their functions have diverged.',
    deepNote:
      'Coined by Richard Owen (1843) before Darwin explained the mechanism as descent with modification. Always specify the hierarchical level: bat and bird wings are homologous as tetrapod forelimbs, yet analogous as wings.',
    relatedChapterId: 'limbs',
  },
  analogy: {
    id: 'analogy',
    term: 'Analogy (Convergent Evolution)',
    pronunciation: 'ə-NAL-ə-jee',
    shortDef:
      'Similarity in function or form that evolved independently in separate lineages facing similar selective pressures, rather than from a shared ancestor with that trait.',
    deepNote:
      'Also called homoplasy. Examples include the flight surfaces of bats, birds, and insects, or the streamlined bodies of sharks (fishes) and dolphins (mammals).',
    relatedChapterId: 'limbs',
  },
  pentadactyl: {
    id: 'pentadactyl',
    term: 'Pentadactyl Limb',
    pronunciation: 'pen-tə-DAK-til',
    shortDef:
      'The ancestral five-digit tetrapod limb plan: one proximal bone (stylopod), two middle bones (zeugopod), and a wrist/ankle with five digits (autopod).',
    deepNote:
      'Earliest Devonian tetrapods such as Acanthostega (8 digits) and Ichthyostega (7 digits) were polydactyl; five digits stabilized in crown-group tetrapods by the Carboniferous (~340 Ma).',
    relatedChapterId: 'limbs',
  },
  tetrapod: {
    id: 'tetrapod',
    term: 'Tetrapod',
    pronunciation: 'TET-rə-pod',
    shortDef:
      'Any four-limbed vertebrate (amphibians, reptiles, birds, and mammals) and their limbless descendants (such as snakes and whales), descended from lobe-finned fish ancestors.',
    deepNote:
      'The three-part forelimb blueprint (humerus, radius/ulna, distal radials) originated in sarcopterygian fishes like Tiktaalik (~375 Ma) before vertebrates walked on land.',
    relatedChapterId: 'limbs',
  },
  stylopod: {
    id: 'stylopod',
    term: 'Stylopod',
    pronunciation: 'STY-lə-pod',
    shortDef: 'The single proximal segment of a tetrapod limb: the humerus in the forelimb.',
    deepNote: 'Specified during embryonic limb-bud outgrowth largely by Hox9/10 and Meis1/2.',
    relatedChapterId: 'limbs',
  },
  zeugopod: {
    id: 'zeugopod',
    term: 'Zeugopod',
    pronunciation: 'ZOO-gə-pod',
    shortDef: 'The paired middle bones of a tetrapod limb: the radius and ulna in the forelimb.',
    deepNote: 'Specified by Hox11 paralogs (Hoxa11, Hoxd11).',
    relatedChapterId: 'limbs',
  },
  autopod: {
    id: 'autopod',
    term: 'Autopod',
    pronunciation: 'AW-tə-pod',
    shortDef: 'The distal region of the limb comprising carpals, metacarpals, and digits.',
    deepNote: 'Patterned by late HoxA13/HoxD10–13 expression and Shh signalling.',
    relatedChapterId: 'limbs',
  },
  hyperphalangy: {
    id: 'hyperphalangy',
    term: 'Hyperphalangy',
    pronunciation: 'hy-per-fə-LAN-jee',
    shortDef:
      'An evolutionary increase in the number of phalangeal bones per digit beyond the typical mammalian count, seen prominently in whales and dolphins.',
    deepNote: 'Driven by prolonged Fgf8 signalling at the embryonic limb tip.',
    relatedChapterId: 'limbs',
  },
  vestigial: {
    id: 'vestigial',
    term: 'Vestigial Structure',
    pronunciation: 'ves-TIJ-ee-əl',
    shortDef:
      'An anatomical feature reduced in size and stripped of its ancestral primary function, retained as a historical signature of ancestry.',
    deepNote: 'In modern horses (Equus), metacarpals II and IV persist as slender splint bones.',
    relatedChapterId: 'limbs',
  },
  deep_homology: {
    id: 'deep_homology',
    term: 'Deep Homology',
    pronunciation: 'deep hə-MOL-ə-jee',
    shortDef:
      'The reuse of ancient, shared developmental gene-regulatory circuits (such as Hox, Tbx5, or Pax6) to build diverse structures across distant lineages.',
    deepNote: 'Coined by Shubin, Tabin & Carroll (1997, 2009).',
    relatedChapterId: 'limbs',
  },
  hox: {
    id: 'hox',
    term: 'Hox Genes',
    pronunciation: 'hoks jeenz',
    shortDef:
      'Master regulatory homeobox genes arranged along chromosomes in the same order as the body regions and limb segments they pattern.',
    deepNote: 'Nested HoxA/HoxD domains divide limbs into stylopod, zeugopod, and autopod.',
    relatedChapterId: 'limbs',
  },
  patagium: {
    id: 'patagium',
    term: 'Patagium',
    pronunciation: 'pə-TAY-jee-əm',
    shortDef:
      'The thin, elastic skin membrane stretched across a bat’s elongated metacarpals and phalanges to form its wing surface.',
    deepNote: 'Retained because Gremlin and Fgf8 suppress interdigital apoptosis in bat embryos.',
    relatedChapterId: 'limbs',
  },
  mutant_selection_window: {
    id: 'mutant_selection_window',
    term: 'Mutant-Selection Window (MSW)',
    pronunciation: 'MYOO-tənt si-LEK-shən',
    shortDef:
      'The antibiotic concentration range between the wild-type MIC and the Mutant Prevention Concentration (MPC) where drug-sensitive cells are killed while single-step resistant mutants survive and rapidly expand.',
    relatedChapterId: 'clinic',
  },
  conjugation: {
    id: 'conjugation',
    term: 'Bacterial Conjugation',
    pronunciation: 'kon-joo-GAY-shən',
    shortDef:
      'Direct cell-to-cell horizontal gene transfer in which a donor bacterium extends a sex pilus and transfers a circular R-plasmid (often carrying multi-drug resistance genes) into a recipient cell.',
    relatedChapterId: 'clinic',
  },
  competitive_release: {
    id: 'competitive_release',
    term: 'Competitive Release',
    pronunciation: 'kəm-PET-i-tiv ri-LEES',
    shortDef:
      'Rapid expansion of a previously suppressed resistant subpopulation (such as resistant cancer clones or pathogens) after aggressive therapy eliminates its drug-sensitive ecological competitors.',
    relatedChapterId: 'clinic',
  },
  adaptive_therapy: {
    id: 'adaptive_therapy',
    term: 'Adaptive Therapy',
    pronunciation: 'ə-DAP-tiv THER-ə-pee',
    shortDef:
      'An evolutionary oncology strategy (Gatenby et al. 2009) that pulses drug dosing on and off to preserve drug-sensitive tumour cells so they competitively suppress costly drug-resistant clones.',
    relatedChapterId: 'clinic',
  },
  serial_founder_effect: {
    id: 'serial_founder_effect',
    term: 'Serial Founder Effect',
    pronunciation: 'SEER-ee-əl FOWN-der',
    shortDef:
      'Sequential sampling bottlenecks during range expansion out of Africa that produce a smooth geographic cline of declining neutral heterozygosity with increasing overland distance from East Africa.',
    relatedChapterId: 'clinic',
  },
  archaic_admixture: {
    id: 'archaic_admixture',
    term: 'Archaic Admixture (Introgression)',
    pronunciation: 'ahr-KAY-ik ad-MIKS-chər',
    shortDef:
      'Interbreeding between dispersing modern Homo sapiens and coexisting sister hominin lineages such as Neanderthals (~2% ancestry outside Africa) and Denisovans (~3–5% in Melanesia/Oceania).',
    relatedChapterId: 'clinic',
  },
  price_equation: {
    id: 'price_equation',
    term: 'Price Equation',
    pronunciation: 'PRYS i-KWAY-zhən',
    shortDef:
      'Exact covariance identity (W̄·Δz̄ = Cov(w, z) + E(w·Δz)) partitioning evolutionary change into selection (covariance between fitness and trait) plus transmission bias — unifying multilevel selection, kin selection, and Fisher’s FTNS.',
    relatedChapterId: 'price',
  },
  fishers_fundamental_theorem: {
    id: 'fishers_fundamental_theorem',
    term: 'Fisher’s Fundamental Theorem (FTNS)',
    pronunciation: 'FISH-erz fun-də-MEN-təl',
    shortDef:
      'The partial rate of increase in mean fitness attributable to natural selection equals the additive genetic variance in fitness divided by mean fitness (Δw̄_NS = V_A(w)/w̄ ≥ 0), distinct from environmental deterioration (Price 1972).',
    relatedChapterId: 'price',
  },
  marginal_value_theorem: {
    id: 'marginal_value_theorem',
    term: 'Marginal Value Theorem (MVT)',
    pronunciation: 'MAR-ji-nəl VAL-yoo',
    shortDef:
      'Charnov’s (1976) foraging theorem: to maximize long-term energy intake across depleting patches, leave a patch the moment its instantaneous marginal intake rate drops to the habitat’s overall average rate (including travel time T_t).',
    relatedChapterId: 'forager',
  },
  risk_sensitive_foraging: {
    id: 'risk_sensitive_foraging',
    term: 'Risk-Sensitive Foraging',
    pronunciation: 'risk SEN-si-tiv',
    shortDef:
      'Preference for variance in food reward driven by non-linear survival thresholds (Jensen’s inequality): well-fed animals prefer steady rewards (risk-averse), whereas starving animals below threshold prefer high-variance patches (risk-prone).',
    relatedChapterId: 'forager',
  },
  antagonistic_pleiotropy: {
    id: 'antagonistic_pleiotropy',
    term: 'Antagonistic Pleiotropy',
    pronunciation: 'an-tag-ə-NIS-tik ply-OT-rə-pee',
    shortDef:
      'Williams’s (1957) evolutionary theory of senescence: a single gene that enhances early-life reproduction is positively selected even if it causes harmful cellular ageing late in life when selection is weak.',
    relatedChapterId: 'senescence',
  },
  disposable_soma: {
    id: 'disposable_soma',
    term: 'Disposable Soma Theory',
    pronunciation: 'di-SPOH-zə-bəl SOH-mə',
    shortDef:
      'Kirkwood’s (1977) physiological Y-model trade-off: under finite metabolic budgets and extrinsic mortality, organisms allocate less energy to permanent somatic DNA repair than needed for immortality, favouring earlier reproduction.',
    relatedChapterId: 'senescence',
  },
  developmental_hourglass: {
    id: 'developmental_hourglass',
    term: 'Developmental Hourglass',
    pronunciation: 'di-vel-əp-MEN-təl OWR-glas',
    shortDef:
      'Pattern of evolutionary conservation across embryogenesis: early cleavage and late organogenesis diverge widely, whereas the mid-embryonic phylotypic stage (pharyngula, Hox patterning) is maximally conserved.',
    relatedChapterId: 'embryos',
  },
  heterochrony: {
    id: 'heterochrony',
    term: 'Heterochrony (Paedomorphosis)',
    pronunciation: 'het-ə-ROK-rə-nee',
    shortDef:
      'An evolutionary shift in the timing or rate of developmental events relative to ancestors — e.g., axolotl paedomorphosis (neoteny), where sexual maturity occurs while retaining larval gills.',
    relatedChapterId: 'embryos',
  },
  exaptation: {
    id: 'exaptation',
    term: 'Exaptation (Co-option)',
    pronunciation: 'ek-sap-TAY-shən',
    shortDef:
      'A trait originally shaped by selection for one function (or arising as a by-product) that is subsequently co-opted for a new role — such as insulating dinosaur proto-feathers co-opted for bird flight (Gould & Vrba 1982).',
    relatedChapterId: 'embryos',
  },
  canalization: {
    id: 'canalization',
    term: 'Canalization (Waddington Landscape)',
    pronunciation: 'kan-ə-ly-ZAY-shən',
    shortDef:
      'Developmental buffering (e.g., via chaperone Hsp90) that channels diverse genotypes into a consistent wild-type phenotype despite minor mutations or noise, storing cryptic variation until stress releases it.',
    relatedChapterId: 'embryos',
  },
  cytochrome_c: {
    id: 'cytochrome_c',
    term: 'Cytochrome c',
    pronunciation: 'SY-toh-krohm SEE',
    shortDef:
      'A 104-residue mitochondrial electron-transport protein found across eukaryotes whose conserved CXXCH heme pocket and diverging surface sites cleanly trace molecular common descent (Margoliash 1963).',
    relatedChapterId: 'cytochrome',
  },
  felsenstein_pic: {
    id: 'felsenstein_pic',
    term: 'Phylogenetic Independent Contrasts (PIC)',
    pronunciation: 'FEL-zən-styn PEE-EYE-SEE',
    shortDef:
      'Felsenstein’s (1985) comparative method replacing non-independent species tips with standardized differences between sister lineages, preventing false-positive trait correlations from shared ancestry.',
    relatedChapterId: 'cytochrome',
  },
  ancestral_state: {
    id: 'ancestral_state',
    term: 'Ancestral State Reconstruction',
    pronunciation: 'an-SES-trəl STAYT',
    shortDef:
      'Inferring probable phenotypes or DNA states at internal nodes of a phylogeny via parsimony or maximum-likelihood Markov models — noting that fast transition rates saturate deep nodes toward uncertainty.',
    relatedChapterId: 'cytochrome',
  },
  pseudogene: {
    id: 'pseudogene',
    term: 'Pseudogene & Orthologous ERV',
    pronunciation: 'SOO-doh-jeen',
    shortDef:
      'A non-functional genomic remnant (such as the primate GULO Exon-10 Vitamin-C deletion) or shared endogenous retrovirus at identical chromosomal coordinates providing decisive evidence of common ancestry.',
    relatedChapterId: 'cytochrome',
  },
};
