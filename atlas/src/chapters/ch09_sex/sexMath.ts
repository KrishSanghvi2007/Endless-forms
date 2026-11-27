// =============================================================================
// Chapter 9: Why Sex? & Red Queen — Pure Coevolution & Sex Models
// =============================================================================

export interface TwofoldCostResult {
  generation: number;
  asexualFreq: number; // Starts at 10% clonal invader; doubles relative share each gen if no parasites!
  sexualFreq: number;
  asexualDaughtersPerParent: number;
  sexualDaughtersPerParent: number;
}

export function computeTwofoldCost(generation: number): TwofoldCostResult {
  const g = Math.max(0, Math.min(8, generation));
  const a0 = 0.1;
  const s0 = 0.9;
  const aVal = a0 * Math.pow(2, g);
  const sVal = s0 * Math.pow(1, g);
  const total = aVal + sVal;
  return {
    generation: g,
    asexualFreq: aVal / total,
    sexualFreq: sVal / total,
    asexualDaughtersPerParent: 2,
    sexualDaughtersPerParent: 1,
  };
}

export interface RatchetState {
  mode: 'asexual' | 'sexual';
  generation: number;
  clicks: number; // Minimum deleterious mutations k_min in population
  meanMutations: number;
  bins: number[]; // Fractions in k = 0, 1, 2, 3, 4, 5+ deleterious mutation classes
}

export function computeMullersRatchet(
  mode: 'asexual' | 'sexual',
  generation: number,
  popSize: number
): RatchetState {
  const g = Math.max(0, Math.min(20, generation));
  const smallFactor = Math.max(0.25, 1.35 - popSize / 120);
  const clicks = mode === 'asexual' ? Math.min(4, Math.floor(g * 0.22 * smallFactor)) : 0;

  const mean = mode === 'asexual' ? 0.8 + clicks * 1.05 + g * 0.04 : 0.85;
  const bins = [0, 0, 0, 0, 0, 0];
  let sum = 0;
  for (let k = 0; k < 6; k++) {
    if (k < clicks) {
      bins[k] = 0;
    } else {
      const dist = k - mean;
      bins[k] = Math.exp(-0.55 * dist * dist);
      sum += bins[k];
    }
  }
  return {
    mode,
    generation: g,
    clicks,
    meanMutations: mean,
    bins: bins.map((v) => (sum > 0 ? v / sum : 0)),
  };
}

export interface RedQueenState {
  season: number;
  parasitePressure: number; // 0 (no trematodes) .. 1 (intense Lake Alexandrina Microphallus)
  sexualFreq: number;
  cloneAFreq: number;
  cloneBFreq: number;
  parasiteMatchA: number; // Fraction of trematodes adapted to Clone A
}

/**
 * Lively (1987) New Zealand Mud Snail (Potamopyrgus antipodarum) & Microphallus trematode:
 * Without parasites, asexual clones sweep via the 2x cost of males.
 * With fast-evolving parasites, parasites track whichever clone is common, causing clones to crash
 * while genetically diverse sexual snails maintain high frequency!
 */
export function simulateRedQueen(season: number, parasitePressure: number): RedQueenState {
  let sex = 0.5;
  let cA = 0.3;
  let cB = 0.2;
  let pA = 0.55;

  for (let t = 0; t < season; t++) {
    // Parasites track the more common clone with lag
    const cloneTotal = Math.max(0.01, cA + cB);
    const targetPA = cA / cloneTotal;
    pA += (targetPA - pA) * 0.42;

    // Infection risks: common clone suffers intense matching parasite mortality; sexuals produce rare genotypes!
    const riskA = parasitePressure * (0.25 + 1.35 * pA * (cA / cloneTotal + 0.35));
    const riskB = parasitePressure * (0.25 + 1.35 * (1 - pA) * (cB / cloneTotal + 0.35));
    const riskSex = parasitePressure * 0.22; // Diverse recombinant offspring evade matching parasites!

    const wSex = 1.0 * Math.max(0.15, 1 - riskSex);
    const wA = 2.0 * Math.max(0.08, 1 - riskA); // 2x demographic edge of asexuals!
    const wB = 2.0 * Math.max(0.08, 1 - riskB);

    const nSex = Math.max(0.02, sex * wSex);
    const nA = Math.max(0.02, cA * wA);
    const nB = Math.max(0.02, cB * wB);
    const tot = nSex + nA + nB;
    sex = nSex / tot;
    cA = nA / tot;
    cB = nB / tot;
  }

  return {
    season,
    parasitePressure,
    sexualFreq: sex,
    cloneAFreq: cA,
    cloneBFreq: cB,
    parasiteMatchA: pA,
  };
}

export interface MutualismResult {
  partnerSanctions: number; // 0 (no client flight/punishment) .. 1 (strict client sanctions)
  honestCleanerFreq: number;
  cheaterMucusBiterFreq: number;
  stableMutualism: boolean;
}

export function computeMutualismStability(partnerSanctions: number): MutualismResult {
  const s = Math.max(0, Math.min(1, partnerSanctions));
  const honest = Math.max(0.08, Math.min(0.95, 0.12 + s * 0.88));
  return {
    partnerSanctions: s,
    honestCleanerFreq: honest,
    cheaterMucusBiterFreq: 1 - honest,
    stableMutualism: honest >= 0.55,
  };
}

export interface VirulenceResult {
  alpha: number; // Pathogen-induced host mortality rate (0.05 .. 1.6)
  transmissionBeta: number; // Saturating transmission beta(alpha) = 3.2 * alpha / (alpha + 0.4)
  r0: number; // Basic reproductive number R0 = beta(alpha) / (mu + gamma + alpha)
  optimalAlpha: number;
  winningRegime: 'too_mild' | 'optimal' | 'too_lethal';
}

/**
 * Anderson & May (1982) Virulence-Transmission Trade-Off:
 * R0(alpha) = beta(alpha) / (mu + gamma + alpha), with saturating beta(alpha).
 * Purely driven by between-host strain competition — NOT pathogen "foresight"!
 */
export function computeVirulenceTradeoff(alpha: number, coinfectionBonus = 0): VirulenceResult {
  const a = Math.max(0.05, Math.min(1.6, alpha));
  const mu = 0.15;
  const gamma = 0.25;
  // Within-host coinfection selects for faster-replicating (higher alpha) strains!
  const kHalf = 0.38 + coinfectionBonus * 0.45;
  const beta = (3.4 * a) / (a + kHalf);
  const r0 = beta / (mu + gamma + a);
  const optimalAlpha = Math.sqrt((mu + gamma) * kHalf);
  const winningRegime =
    Math.abs(a - optimalAlpha) < 0.14
      ? 'optimal'
      : a < optimalAlpha
        ? 'too_mild'
        : 'too_lethal';
  return { alpha: a, transmissionBeta: beta, r0, optimalAlpha, winningRegime };
}
