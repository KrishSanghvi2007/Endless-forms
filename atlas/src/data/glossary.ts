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
};
