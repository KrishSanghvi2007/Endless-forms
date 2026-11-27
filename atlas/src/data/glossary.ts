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
