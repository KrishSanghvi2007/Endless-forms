// =============================================================================
// Chapter 5: Bitter Wings — Batesian & Müllerian Mimicry, Predator Learning
// & Origin of Aposematism (Pure Mathematical & Ecological Core)
// =============================================================================

import { createSeededRng } from '../../sim/adapter';

// -----------------------------------------------------------------------------
// PAGE 1: JACAMAR FORAGING & TASTE MEMORY LEDGER (Chai 1986; Bates 1862)
// -----------------------------------------------------------------------------

export type InsectKind = 'model' | 'mimic' | 'nonmimic' | 'dragonfly';

export interface RainforestInsect {
  id: number;
  kind: InsectKind;
  alive: boolean;
  released: boolean; // models are tasted and released alive (Chai 1986)
  x: number;
  z: number;
  y: number;
  rot: number;
}

export function createClearingInsects(seed = 501): RainforestInsect[] {
  const rng = createSeededRng(seed);
  const kinds: InsectKind[] = [
    'model', 'model', 'model', 'model', 'model',
    'mimic', 'mimic', 'mimic', 'mimic',
    'nonmimic', 'nonmimic', 'nonmimic', 'nonmimic', 'nonmimic',
    'dragonfly', 'dragonfly',
  ];
  // Shuffle deterministically
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  return kinds.map((kind, id) => {
    const col = id % 4;
    const row = Math.floor(id / 4);
    return {
      id,
      kind,
      alive: true,
      released: false,
      x: -1.85 + col * 1.24 + rng.range(-0.2, 0.2),
      z: -1.02 + row * 0.68 + rng.range(-0.14, 0.14),
      y: rng.range(0.32, 0.62),
      rot: rng.range(-0.6, 0.6),
    };
  });
}

// -----------------------------------------------------------------------------
// PAGE 2: BATESIAN RATIO × MODEL NOXIOUSNESS (Lindström 1997; Sherratt 2002)
// -----------------------------------------------------------------------------

export interface BatesianDecision {
  nModels: number;
  nMimics: number;
  toxinCost: number;
  mealBenefit: number;
  mimicShare: number;
  criticalMimicShare: number;
  expectedPayoff: number;
  shieldHolds: boolean;
  mimicSurvival: number;
}

export function evaluateBatesianSystem(
  nModels: number,
  nMimics: number,
  toxinCost: number,
  mealBenefit = 2.0
): BatesianDecision {
  const total = Math.max(1, nModels + nMimics);
  const mimicShare = nMimics / total;
  const modelShare = nModels / total;
  // Expected payoff to a predator that attacks a red-banded butterfly
  const expectedPayoff = mimicShare * mealBenefit - modelShare * toxinCost;
  const criticalMimicShare = toxinCost / (mealBenefit + toxinCost);
  const shieldHolds = expectedPayoff < 0;
  // Smooth logistic survival probability for red-banded mimics
  const attackProb = 1 / (1 + Math.exp(-expectedPayoff * 1.45));
  const mimicSurvival = Math.max(0.08, Math.min(0.97, 1 - attackProb));

  return {
    nModels,
    nMimics,
    toxinCost,
    mealBenefit,
    mimicShare,
    criticalMimicShare,
    expectedPayoff,
    shieldHolds,
    mimicSurvival,
  };
}

// -----------------------------------------------------------------------------
// PAGE 3: IMPERFECT MIMICRY & DEADLY DAYS (Sherratt 2002)
// -----------------------------------------------------------------------------

export interface ImperfectPoint {
  resemblance: number; // 0 (cream non-mimic) -> 1 (exact crimson-band mimic)
  attackProb: number;
  survivalProb: number;
}

/**
 * Signal-detection generalization curve: as model noxiousness C grows,
 * predators avoid increasingly imperfect lookalikes rather than risk a toxic mistake.
 */
export function computeImperfectCurve(toxinCost: number, mealBenefit = 2.0): ImperfectPoint[] {
  const levels = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
  // Perceived probability that a butterfly of resemblance x is actually a toxic model
  return levels.map((x) => {
    const pModelGivenX = Math.pow(x, 1.85) * 0.88;
    const expectedPayoff = (1 - pModelGivenX) * mealBenefit - pModelGivenX * toxinCost;
    const attackProb = 1 / (1 + Math.exp(-expectedPayoff * 1.25));
    return {
      resemblance: x,
      attackProb,
      survivalProb: 1 - attackProb,
    };
  });
}

// -----------------------------------------------------------------------------
// PAGE 4: MÜLLERIAN MIMICRY & ADVERGENCE (Müller 1879; Turner's Two-Step)
// -----------------------------------------------------------------------------

export interface MullerianState {
  gen: number;
  nCommon: number; // Species 1: abundant Red-Band (H. erato)
  nRare: number;   // Species 2: rarer species (H. melpomene)
  pAdverged: number; // Fraction of Species 2 carrying the large-effect Red-Band allele
  learningQuotaL: number;
  riskSoloRare: number;
  riskJoined: number;
  history: number[];
}

export function createMullerianState(): MullerianState {
  const nCommon = 80;
  const nRare = 20;
  const L = 12;
  return {
    gen: 0,
    nCommon,
    nRare,
    pAdverged: 0.12, // Rare large-effect red-band variant in Species 2
    learningQuotaL: L,
    riskSoloRare: Math.min(1, L / nRare),
    riskJoined: Math.min(1, L / (nCommon + nRare)),
    history: [0.12],
  };
}

export function stepMullerianAdvergence(state: MullerianState, gens = 4): MullerianState {
  let p = state.pAdverged;
  const history = [...state.history];
  const { nCommon, nRare, learningQuotaL: L } = state;

  for (let g = 0; g < gens; g++) {
    const nRedTotal = nCommon + nRare * p;
    const nYellowTotal = Math.max(1, nRare * (1 - p));
    const survRed = Math.max(0.05, 1 - L / nRedTotal);
    const survYellow = Math.max(0.05, 1 - L / nYellowTotal);
    const wBar = p * survRed + (1 - p) * survYellow;
    p = Math.max(0.01, Math.min(0.995, (p * survRed) / Math.max(1e-6, wBar)));
    history.push(p);
  }

  return {
    ...state,
    gen: state.gen + gens,
    pAdverged: p,
    riskSoloRare: Math.min(1, L / Math.max(1, nRare * (1 - p))),
    riskJoined: Math.min(1, L / (nCommon + nRare * p)),
    history: history.slice(-32),
  };
}

// -----------------------------------------------------------------------------
// PAGE 5: ORIGIN OF APOSEMATISM (Anti-Apostatic Trap vs. Kin Aggregation)
// -----------------------------------------------------------------------------

export interface AposematismResult {
  clustered: boolean;
  clusterSize: number;
  initialMutantFreq: number;
  trajectory: number[];
  finalFreq: number;
  spreads: boolean;
  note: string;
}

/**
 * Simulates a rare conspicuous toxic mutant (p0 = 0.12) facing naive avian predators.
 * Solitary: novel conspicuous mutant suffers anti-apostatic mortality before birds learn (Langham 2004).
 * Kin-Clustered (clusterSize >= 4): tasting 1 sibling teaches the bird to spare the remaining siblings (Sillén-Tullberg 1988).
 */
export function simulateAposematismOrigin(clustered: boolean, clusterSize = 6): AposematismResult {
  const p0 = 0.12;
  let p = p0;
  const trajectory = [p];
  const gens = 18;

  for (let g = 0; g < gens; g++) {
    // Cryptic baseline survival
    const wCryptic = 0.72;
    let wBright: number;
    if (!clustered) {
      // Anti-apostatic penalty when rare (Langham 2004): solitary bright prey detected first & killed
      wBright = 0.42 + 0.50 * p;
    } else {
      // Kin aggregation: predator tastes 1 of `clusterSize` siblings and spares the rest!
      const familySurvival = (clusterSize - 1) / clusterSize;
      wBright = 0.66 + 0.28 * familySurvival + 0.08 * p;
    }
    const wBar = p * wBright + (1 - p) * wCryptic;
    p = Math.max(0.01, Math.min(0.99, (p * wBright) / wBar));
    trajectory.push(p);
  }

  const spreads = p > p0 + 0.05;
  return {
    clustered,
    clusterSize,
    initialMutantFreq: p0,
    trajectory,
    finalFreq: p,
    spreads,
    note: clustered
      ? `In clusters of ${clusterSize} siblings, tasting 1 larva teaches the predator to spare ${clusterSize - 1} kin—allowing bright warning colour to invade from rarity (Sillén-Tullberg 1988).`
      : 'Solitary rare warning mutants suffer anti-apostatic predation (Langham 2004): naive birds detect and kill them before associative avoidance spreads.',
  };
}
