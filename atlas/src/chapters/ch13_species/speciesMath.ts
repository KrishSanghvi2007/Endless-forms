// =============================================================================
// Chapter 13: Splitting Branches — Speciation & Hybridization Pure Math Models
// =============================================================================

export interface RingSpeciesResult {
  positionAlongRing: number; // 0 (Himalayan origin) .. 1 (Siberian secondary contact)
  westSongFreqKHz: number;
  eastSongFreqKHz: number;
  songDivergence: number; // 0 .. 1
  interbreedingCompatible: boolean;
}

/**
 * Irwin et al. (2001) Greenish Warbler (Phylloscopus trochiloides) Ring Species:
 * Gradual divergence westward (viridanus, 1 wing bar) & eastward (plumbeitarsus, 2 wing bars)
 * around the Tibetan Plateau until terminal populations meet in central Siberia and no longer recognize each other's songs!
 */
export function evaluateRingSpecies(pos: number): RingSpeciesResult {
  const p = Math.max(0, Math.min(1, pos));
  const westSongFreqKHz = 4.2 + p * 1.1;
  const eastSongFreqKHz = 4.2 - p * 0.95;
  const songDivergence = p;
  return {
    positionAlongRing: p,
    westSongFreqKHz,
    eastSongFreqKHz,
    songDivergence,
    interbreedingCompatible: p < 0.78,
  };
}

export type DmiGenotype = 'aabb' | 'AAbb' | 'aaBB' | 'AaBb';

export interface DmiResult {
  genotype: DmiGenotype;
  fitness: number;
  proteinClash: boolean;
  explanation: string;
}

/**
 * Bateson-Dobzhansky-Muller (BDM) Two-Locus Genetic Incompatibility:
 * Ancestral aabb evolves along high-fitness ridge to AAbb (Island 1) and aaBB (Island 2).
 * Neither lineage EVER crosses a fitness valley—yet their F1 hybrid AaBb brings derived A & B together for the first time, crashing fitness!
 */
export function evaluateDmi(genotype: DmiGenotype): DmiResult {
  if (genotype === 'aabb') {
    return {
      genotype,
      fitness: 1.0,
      proteinClash: false,
      explanation: 'Ancestral aabb: Proteins a and b have coevolved for millions of years and dock smoothly.',
    };
  }
  if (genotype === 'AAbb') {
    return {
      genotype,
      fitness: 1.05,
      proteinClash: false,
      explanation: 'Population 1 (AAbb): Derived allele A functions cleanly alongside ancestral b — zero fitness valley!',
    };
  }
  if (genotype === 'aaBB') {
    return {
      genotype,
      fitness: 1.05,
      proteinClash: false,
      explanation: 'Population 2 (aaBB): Derived allele B functions cleanly alongside ancestral a — zero fitness valley!',
    };
  }
  return {
    genotype,
    fitness: 0.14,
    proteinClash: true,
    explanation: 'Hybrid AaBb: Derived alleles A and B meet for the first time in history and sterically clash — intrinsic postzygotic isolation!',
  };
}

export interface HostShiftResult {
  seasonalGapWeeks: number; // 0 .. 5 weeks between Apple (Aug) & Hawthorn (Oct) fruiting
  assortativeMating: number; // 0.50 .. 0.96
  geneFlowRate: number; // Drops steeply as host fruiting phenology separates!
  regime: string;
}

/**
 * Feder et al. (1988) Rhagoletis pomonella Sympatric Host-Race Formation:
 * Apple trees introduced to North America ~1850 fruit 3-4 weeks earlier than native hawthorns,
 * creating strong temporal & olfactory premating isolation in sympatry.
 */
export function evaluateHostShift(seasonalGapWeeks: number): HostShiftResult {
  const gap = Math.max(0, Math.min(5, seasonalGapWeeks));
  const assortativeMating = Math.min(0.96, 0.5 + gap * 0.095);
  const geneFlowRate = Math.max(0.03, 0.5 * Math.exp(-gap * 0.62));
  const regime =
    gap >= 3.0
      ? 'Sympatric Host Races Formed (~4–6% gene flow; Feder et al. 1988)!'
      : gap >= 1.5
        ? 'Partial Temporal Isolation — disruptive host selection building linkage disequilibrium.'
        : 'Panmictic Population — single fruiting season keeps flies freely interbreeding.';
  return { seasonalGapWeeks: gap, assortativeMating, geneFlowRate, regime };
}

export interface ReinforcementResult {
  hybridFitness: number; // 0.05 (sterile/inviable) .. 1.0 (healthy hybrids)
  sympatricOverlap: boolean;
  signalDivergence: number; // 0.1 .. 1.0
  prematingIsolation: number;
}

export function evaluateReinforcement(
  hybridFitness: number,
  sympatricOverlap: boolean
): ReinforcementResult {
  const wf = Math.max(0.05, Math.min(1.0, hybridFitness));
  const signalDivergence = sympatricOverlap ? Math.max(0.15, 1.02 - wf * 0.85) : 0.22;
  const prematingIsolation = Math.min(0.97, signalDivergence * 0.95);
  return { hybridFitness: wf, sympatricOverlap, signalDivergence, prematingIsolation };
}

export type PloidyStep = 'parents' | 'f1_sterile' | 'allopolyploid_4n';

export interface PolyploidyResult {
  step: PloidyStep;
  chromosomes: string;
  fertile: boolean;
  reproductivelyIsolated: boolean;
  summary: string;
}

export function evaluatePolyploidy(step: PloidyStep): PolyploidyResult {
  if (step === 'parents') {
    return {
      step,
      chromosomes: 'T. dubius (2n = 12, AA) × T. pratensis (2n = 12, BB)',
      fertile: true,
      reproductivelyIsolated: false,
      summary: 'Two diploid Eurasian goatsbeards introduced to Washington State in the early 1900s.',
    };
  }
  if (step === 'f1_sterile') {
    return {
      step,
      chromosomes: 'F₁ Hybrid (2n = 12, AB — Unpaired Homologs!)',
      fertile: false,
      reproductivelyIsolated: false,
      summary: 'A and B chromosomes cannot pair cleanly at meiosis I → sterile diploid hybrid.',
    };
  }
  return {
    step,
    chromosomes: 'Tragopogon miscellus (4n = 24, AABB — Instant New Species!)',
    fertile: true,
    reproductivelyIsolated: true,
    summary: 'Whole-genome doubling restores bivalent pairing (AA + BB) while triploid backcrosses (3n) fail — instant sympatric speciation documented by Ownbey (1950)!',
  };
}
