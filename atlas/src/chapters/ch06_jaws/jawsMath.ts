// =============================================================================
// Chapter 6: Left Jaw, Right Jaw — Negative Frequency-Dependent Selection,
// Partial Heritability, Side-Blotched Lizard RPS & Trans-Species MHC Balancing
// =============================================================================

// -----------------------------------------------------------------------------
// PAGE 1 & 2: LAKE TANGANYIKA SCALE-EATERS (Perissodus microlepis, Hori 1993)
// -----------------------------------------------------------------------------

export interface TanganyikaSeason {
  season: number;
  /** Fraction of Left-bent (dextral-attacking) predators */
  pLeft: number;
  /** Prey vigilance share guarding the flank attacked by Left-bent predators (1-season lag!) */
  guardLeft: number;
  fitnessLeft: number;
  fitnessRight: number;
  historyLeft: number[];
  historyGuard: number[];
}

export function createInitialTanganyika(startLeft = 0.76): TanganyikaSeason {
  const guardLeft = 0.50;
  return {
    season: 0,
    pLeft: startLeft,
    guardLeft,
    fitnessLeft: 1 - 0.65 * guardLeft,
    fitnessRight: 1 - 0.65 * (1 - guardLeft),
    historyLeft: [startLeft],
    historyGuard: [guardLeft],
  };
}

/**
 * Steps Perissodus microlepis negative frequency-dependent dynamics with 1-season vigilance lag
 * and configurable heritability h² (classic 0.90 vs empirical ~0.25 per Takeuchi et al. 2012).
 */
export function stepTanganyikaSeason(
  st: TanganyikaSeason,
  h2 = 0.85,
  seasons = 1,
  overrideGuard?: number
): TanganyikaSeason {
  let pL = st.pLeft;
  let gL = st.guardLeft;
  const hLeft = [...st.historyLeft];
  const hGuard = [...st.historyGuard];

  for (let k = 0; k < seasons; k++) {
    // Prey vigilance updates with a 1-season memory lag toward the previously common predator!
    const nextGuard = overrideGuard !== undefined ? overrideGuard : gL + 0.78 * (pL - gL);

    // Feeding success: guarding a flank sharply cuts successful scale bites on that flank
    const wL = 0.32 + 0.68 * (1 - nextGuard);
    const wR = 0.32 + 0.68 * nextGuard;
    const wBar = pL * wL + (1 - pL) * wR;
    const pSelected = (pL * wL) / Math.max(1e-5, wBar);

    // Partial heritability response: R = h² · S!
    const nextP = Math.max(0.08, Math.min(0.92, pL + h2 * (pSelected - pL)));

    pL = nextP;
    gL = nextGuard;
    hLeft.push(pL);
    hGuard.push(gL);
  }

  return {
    season: st.season + seasons,
    pLeft: pL,
    guardLeft: gL,
    fitnessLeft: 0.32 + 0.68 * (1 - gL),
    fitnessRight: 0.32 + 0.68 * gL,
    historyLeft: hLeft.slice(-28),
    historyGuard: hGuard.slice(-28),
  };
}

// -----------------------------------------------------------------------------
// PAGE 3: PARTIAL HERITABILITY COMPARISON (h² = 0.90 vs. Empirical h² = 0.25)
// -----------------------------------------------------------------------------

export function simulateHeritabilityComparison(h2: number, seasons = 20): number[] {
  let st = createInitialTanganyika(0.80);
  st = stepTanganyikaSeason(st, h2, seasons);
  return st.historyLeft;
}

// -----------------------------------------------------------------------------
// PAGE 4: CALIFORNIA SIDE-BLOTCHED LIZARDS (Uta stansburiana, Sinervo & Lively 1996)
// Rock–Paper–Scissors Intransitive 3-Morph Replicator Dynamics
// Orange (usurper) beats Blue (guarder), Blue beats Yellow (sneaker), Yellow beats Orange!
// -----------------------------------------------------------------------------

export interface LizardRpsState {
  gen: number;
  /** Frequencies [Orange, Blue, Yellow] summing to 1 */
  freqs: [number, number, number];
  fitnesses: [number, number, number];
  history: [number, number, number][];
}

// Classic non-transitive RPS payoff matrix (Sinervo & Lively 1996)
const RPS_MATRIX: number[][] = [
  // vs O,   B,    Y
  [1.0, 2.05, 0.55], // Orange: crushes Blue, gets cuckolded by Yellow
  [0.55, 1.0, 2.05], // Blue: guards against Yellow, loses territory to Orange
  [2.05, 0.55, 1.0], // Yellow: sneaks into Orange's huge harem, caught by Blue
];

export function createInitialLizardRps(): LizardRpsState {
  const f: [number, number, number] = [0.62, 0.24, 0.14];
  return {
    gen: 0,
    freqs: f,
    fitnesses: computeRpsFitness(f),
    history: [f],
  };
}

function computeRpsFitness(f: [number, number, number]): [number, number, number] {
  const out: [number, number, number] = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    out[i] = RPS_MATRIX[i][0] * f[0] + RPS_MATRIX[i][1] * f[1] + RPS_MATRIX[i][2] * f[2];
  }
  return out;
}

export function stepLizardRps(st: LizardRpsState, gens = 1): LizardRpsState {
  let f: [number, number, number] = [...st.freqs];
  const history = [...st.history];

  for (let g = 0; g < gens; g++) {
    const w = computeRpsFitness(f);
    const wBar = f[0] * w[0] + f[1] * w[1] + f[2] * w[2];
    // Mild mutation floor keeps the perpetual orbit alive
    const raw: [number, number, number] = [
      Math.max(0.03, (f[0] * w[0]) / wBar),
      Math.max(0.03, (f[1] * w[1]) / wBar),
      Math.max(0.03, (f[2] * w[2]) / wBar),
    ];
    const sum = raw[0] + raw[1] + raw[2];
    f = [raw[0] / sum, raw[1] / sum, raw[2] / sum];
    history.push(f);
  }

  return {
    gen: st.gen + gens,
    freqs: f,
    fitnesses: computeRpsFitness(f),
    history: history.slice(-30),
  };
}

// -----------------------------------------------------------------------------
// PAGE 5: BALANCING SELECTION GENOMIC FOOTPRINT (Trans-Species MHC Tree)
// -----------------------------------------------------------------------------

export interface BalancingTreeMetrics {
  mode: 'neutral' | 'mhc_balancing';
  tmrcaMyr: number;
  tajimasD: number;
  transSpecies: boolean;
  note: string;
}

export function getBalancingTreeMetrics(mode: 'neutral' | 'mhc_balancing'): BalancingTreeMetrics {
  if (mode === 'mhc_balancing') {
    return {
      mode,
      tmrcaMyr: 22.0,
      tajimasD: +2.35,
      transSpecies: true,
      note: 'Long-term balancing selection (rare-allele immune advantage + overdominance at MHC) maintains ancient allelic lineages across human–chimp speciation (~6 Ma), leaving Tajima’s D ≫ 0!',
    };
  }
  return {
    mode,
    tmrcaMyr: 1.2,
    tajimasD: +0.05,
    transSpecies: false,
    note: 'At a typical neutral locus, lineages within humans coalesce (~1.2 Ma) long after the human–chimpanzee split (~6 Ma), producing reciprocal monophyly and Tajima’s D ≈ 0.',
  };
}
