// =============================================================================
// Chapter 12: Tree Thinking & Molecular Clocks — Pure Phylogenetics Math
// =============================================================================

export interface SwivelState {
  rotRoot: boolean; // Swivels Fish vs Tetrapods
  rotAmniote: boolean; // Swivels Lizard vs (Bird, Mouse) -- wait: true amniote tree is (Fish, (Mouse, (Lizard, Bird)))!
  rotSauropsid: boolean; // Swivels Lizard vs Bird
}

/**
 * Correct vertebrate cladogram: (Fish, (Mouse, (Lizard, Bird)))!
 * Regardless of how the 3 internal nodes swivel, Lizard & Bird ALWAYS share the most recent MRCA,
 * and Mouse is equally related to Lizard and Bird!
 */
export function getTipOrder(s: SwivelState): string[] {
  const sauropsids = s.rotSauropsid ? ['Bird', 'Lizard'] : ['Lizard', 'Bird'];
  const amniotes = s.rotAmniote ? [...sauropsids, 'Mouse'] : ['Mouse', ...sauropsids];
  return s.rotRoot ? [...amniotes, 'Fish'] : ['Fish', ...amniotes];
}

export interface ParsimonyResult {
  topology: 'true_mammals' | 'aquatic_trap';
  steps: number;
  synapomorphies: string[];
  homoplasies: string[];
}

export function evaluateParsimony(topology: 'true_mammals' | 'aquatic_trap'): ParsimonyResult {
  if (topology === 'true_mammals') {
    return {
      topology,
      steps: 4,
      synapomorphies: ['Lungs + Warm-Blooded + Milk + Artiodactyl Ankle (shared by Hippo & Whale)'],
      homoplasies: ['Streamlined Aquatic Fins (1 convergent gain in Whale)'],
    };
  }
  return {
    topology,
    steps: 7,
    synapomorphies: ['Streamlined Fins (grouped Shark & Whale falsely)'],
    homoplasies: ['Lungs, Milk, Hair & Endothermy must evolve TWICE or be lost in Shark!'],
  };
}

export interface ClockResult {
  ne: number;
  muPerMyr: number; // Neutral substitution rate per Myr (e.g. 0.001..0.005)
  divergenceMa: number;
  newMutationsPerGen: number; // 2 Ne mu
  fixProb: number; // 1 / (2 Ne)
  substitutionRateK: number; // K = (2 Ne mu) * (1 / 2 Ne) = mu (INDEPENDENT of Ne!)
  expectedSequenceDiffPct: number; // 2 * K * T * 100
}

export function computeMolecularClock(ne: number, muPerMyr: number, divergenceMa: number): ClockResult {
  const newMutationsPerGen = 2 * ne * muPerMyr;
  const fixProb = 1 / (2 * ne);
  const substitutionRateK = newMutationsPerGen * fixProb; // Exact cancellation to muPerMyr!
  const expectedSequenceDiffPct = Math.min(45, 2 * substitutionRateK * divergenceMa * 100);
  return {
    ne,
    muPerMyr,
    divergenceMa,
    newMutationsPerGen,
    fixProb,
    substitutionRateK,
    expectedSequenceDiffPct,
  };
}

export type GeneMode = 'histone' | 'pseudogene' | 'mhc_positive';

export interface DnDsResult {
  mode: GeneMode;
  geneName: string;
  dN: number;
  dS: number;
  omega: number;
  regime: string;
}

export function evaluateDnDs(mode: GeneMode): DnDsResult {
  if (mode === 'histone') {
    return {
      mode,
      geneName: 'Histone H4 (DNA Packaging)',
      dN: 0.004,
      dS: 0.38,
      omega: 0.011,
      regime: 'Strong Purifying Selection (ω ≪ 1): Almost every amino-acid change is purged!',
    };
  }
  if (mode === 'pseudogene') {
    return {
      mode,
      geneName: 'Olfactory Pseudogene (ψOR)',
      dN: 0.36,
      dS: 0.36,
      omega: 1.0,
      regime: 'Neutral Evolution (ω ≈ 1): Synonymous and non-synonymous changes fix at equal rates.',
    };
  }
  return {
    mode,
    geneName: 'MHC Antigen-Binding Cleft / Viral Spike',
    dN: 1.18,
    dS: 0.37,
    omega: 3.19,
    regime: 'Positive Diversifying Selection (ω > 1): Amino-acid changes are actively favoured!',
  };
}

export interface IlsResult {
  internalBranchCoalUnits: number; // T / (2 Ne), e.g., 0.1 .. 2.5
  concordantProb: number; // 1 - (2/3) * exp(-T / 2Ne)
  discordantHumanGorillaProb: number; // (1/3) * exp(-T / 2Ne)
  discordantChimpGorillaProb: number; // (1/3) * exp(-T / 2Ne)
}

/**
 * Classic Hudson (1983) / Pamilo & Nei (1988) Incomplete Lineage Sorting (ILS) probabilities
 * for a 3-taxon species tree ((Human, Chimp), Gorilla):
 * P(deep coalescence) = exp(-t / 2Ne), splitting 1/3 each among the 3 gene topologies!
 */
export function computeIls(internalBranchCoalUnits: number): IlsResult {
  const tau = Math.max(0.05, Math.min(3.0, internalBranchCoalUnits));
  const deepCoal = Math.exp(-tau);
  const concordantProb = 1 - (2 / 3) * deepCoal;
  const discordantEach = deepCoal / 3;
  return {
    internalBranchCoalUnits: tau,
    concordantProb,
    discordantHumanGorillaProb: discordantEach,
    discordantChimpGorillaProb: discordantEach,
  };
}
