// =============================================================================
// Chapter 10: Switches & Deep Homology — Evo-Devo, Plasticity & Transitions Math
// =============================================================================

export type Pitx1Mode = 'marine' | 'enhancer_del' | 'coding_ko';

export interface Pitx1Result {
  mode: Pitx1Mode;
  pelvicSpines: boolean;
  jawIntact: boolean;
  pituitaryIntact: boolean;
  freshwaterFitness: number; // Relative fitness in predatory-insect freshwater lake
  verdict: string;
}

export function evaluatePitx1(mode: Pitx1Mode): Pitx1Result {
  if (mode === 'marine') {
    return {
      mode,
      pelvicSpines: true,
      jawIntact: true,
      pituitaryIntact: true,
      freshwaterFitness: 0.62,
      verdict: 'Marine Ancestor: Pelvic spines deter fish predators in ocean, but dragonfly nymphs grab them in lakes.',
    };
  }
  if (mode === 'enhancer_del') {
    return {
      mode,
      pelvicSpines: false,
      jawIntact: true,
      pituitaryIntact: true,
      freshwaterFitness: 1.0,
      verdict: 'Cis-Regulatory Deletion: Turns off Pitx1 ONLY in the pelvis while jaw & pituitary stay 100% healthy!',
    };
  }
  return {
    mode,
    pelvicSpines: false,
    jawIntact: false,
    pituitaryIntact: false,
    freshwaterFitness: 0.0,
    verdict: 'Coding-Region Knockout: Breaks Pitx1 protein EVERYWHERE — catastrophic pleiotropy (lethal)!',
  };
}

export interface PlasticityResult {
  kairomone: number; // Predator chemical cue (0..1)
  plasticHelmet: number;
  specialistHelmet: number;
  plasticFit: number;
  unarmoredFit: number;
  geomMeanBetHedger: number;
  geomMeanSpecialist: number;
}

/**
 * Computes G×E reaction norms for Daphnia inducible helmets and illustrates why
 * geometric mean fitness governs survival across fluctuating environments.
 */
export function computePlasticity(kairomone: number): PlasticityResult {
  const k = Math.max(0, Math.min(1, kairomone));
  const plasticHelmet = 0.08 + k * 0.88;
  const specialistHelmet = 0.92;
  // In safe ponds, unarmoured reproduces fastest; under predators, plastic helmet wins!
  const unarmoredFit = 1.0 - k * 0.72;
  const plasticFit = 0.86 + k * 0.08 - Math.abs(plasticHelmet - k) * 0.1;

  // 4-year fluctuating fitness sequence: Specialist (1.8, 1.8, 0.15, 1.8) vs Bet-hedger (1.05, 1.05, 0.85, 1.05)
  const geomMeanSpecialist = Math.pow(1.8 * 1.8 * 0.15 * 1.8, 0.25); // 0.967
  const geomMeanBetHedger = Math.pow(1.05 * 1.05 * 0.85 * 1.05, 0.25); // 0.996

  return {
    kairomone: k,
    plasticHelmet,
    specialistHelmet,
    plasticFit,
    unarmoredFit,
    geomMeanBetHedger,
    geomMeanSpecialist,
  };
}

export interface TransitionResult {
  bottleneck: boolean; // True = single-cell zygote/spore bottleneck (r = 1.0 clonality!)
  relatedness: number;
  cheaterFreq: number;
  somaDivisionStable: boolean;
}

export function computeMulticellularity(bottleneck: boolean): TransitionResult {
  return bottleneck
    ? {
        bottleneck: true,
        relatedness: 1.0,
        cheaterFreq: 0.04,
        somaDivisionStable: true,
      }
    : {
        bottleneck: false,
        relatedness: 0.22,
        cheaterFreq: 0.78,
        somaDivisionStable: false,
      };
}
