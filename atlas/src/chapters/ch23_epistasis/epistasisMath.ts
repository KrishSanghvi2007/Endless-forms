// =============================================================================
// Chapter 23: Sign Epistasis & Quantitative G-Matrices — Exact Models
// 1. Magnitude vs Sign vs Reciprocal Sign Epistasis (2-Locus Fitness Cube)
// 2. Weinreich et al. (2006) 5-Mutation Beta-Lactamase Accessible Paths (18/120)
// 3. Multivariate Selection (Lande 1979: Delta z_bar = G * beta) & G-Ellipse
// 4. Polygenic Architecture & GWAS Manhattan Plot (Single Locus vs Infinitesimal)
// 5. Genetic Constraints & Antagonistic Pleiotropy (Schluter 1996 Line of Least Resistance)
// =============================================================================

export type EpistasisMode = 'additive' | 'magnitude' | 'sign' | 'reciprocal';

export interface EpistasisLandscape {
  mode: EpistasisMode;
  title: string;
  w_ab: number;
  w_Ab: number;
  w_aB: number;
  w_AB: number;
  accessiblePaths: number; // out of 2 (ab->Ab->AB and ab->aB->AB)
  peaks: string[];
  explain: string;
}

export const EPISTASIS_MODES: Record<EpistasisMode, EpistasisLandscape> = {
  additive: {
    mode: 'additive',
    title: 'Additive (No Epistasis)',
    w_ab: 1.0,
    w_Ab: 1.35,
    w_aB: 1.35,
    w_AB: 1.7,
    accessiblePaths: 2,
    peaks: ['AB'],
    explain:
      'Mutations A and B act independently (+0.35 each). Both paths (ab→Ab→AB and ab→aB→AB) climb monotonically to the single peak AB.',
  },
  magnitude: {
    mode: 'magnitude',
    title: 'Magnitude Epistasis (Synergistic)',
    w_ab: 1.0,
    w_Ab: 1.2,
    w_aB: 1.25,
    w_AB: 2.05,
    accessiblePaths: 2,
    peaks: ['AB'],
    explain:
      'A and B amplify each other strongly (+0.20 + 0.25 vs +1.05 together!), changing the SIZE of mutational effects without reversing their sign — both paths remain accessible.',
  },
  sign: {
    mode: 'sign',
    title: 'Sign Epistasis (One Path Blocked!)',
    w_ab: 1.0,
    w_Ab: 1.45,
    w_aB: 0.72,
    w_AB: 2.0,
    accessiblePaths: 1,
    peaks: ['AB'],
    explain:
      'Mutation B is HARMFUL alone (0.72) yet BENEFICIAL after A occurs (1.45 → 2.00)! Selection can only climb ab→Ab→AB; order of mutations now matters!',
  },
  reciprocal: {
    mode: 'reciprocal',
    title: 'Reciprocal Sign Epistasis (Two Isolated Peaks!)',
    w_ab: 1.25,
    w_Ab: 0.65,
    w_aB: 0.68,
    w_AB: 2.05,
    accessiblePaths: 0,
    peaks: ['ab (local)', 'AB (global)'],
    explain:
      'BOTH single steps go downhill! Reciprocal sign epistasis carves a true fitness valley between local peak ab and global peak AB — blocking pure hill-climbing selection!',
  },
};

// -----------------------------------------------------------------------------
// 2. Weinreich et al. (2006) Beta-Lactamase 5-Mutation Accessibility
// -----------------------------------------------------------------------------

export interface WeinreichPath {
  id: string;
  label: string;
  accessible: boolean;
  stepFitness: number[]; // 6 points: 0..5 mutations
  note: string;
}

export const WEINREICH_PATHS: WeinreichPath[] = [
  {
    id: 'optimal',
    label: 'Accessible Path #1 (g4205a → M182T → G238S → E104K → A42G)',
    accessible: true,
    stepFitness: [1.0, 1.18, 1.45, 2.35, 3.1, 3.85],
    note: 'Monotonically uphill at every single step! One of only 18 accessible paths out of 5! = 120 possible orders (Weinreich et al. 2006, Science).',
  },
  {
    id: 'alt_acc',
    label: 'Accessible Path #2 (G238S → E104K → g4205a → M182T → A42G)',
    accessible: true,
    stepFitness: [1.0, 1.55, 2.15, 2.6, 3.25, 3.85],
    note: 'Starts with the big catalytic leap G238S, then stabilizes protein folding via M182T — completely uphill and selectable!',
  },
  {
    id: 'blocked',
    label: 'Inaccessible Path (A42G → M182T → E104K → g4205a → G238S)',
    accessible: false,
    stepFitness: [1.0, 0.72, 0.85, 1.12, 1.4, 3.85],
    note: 'BLOCKED by sign epistasis! Taking A42G first lowers resistance below wild-type (0.72), so purifying selection eliminates it before G238S can arrive.',
  },
];

// -----------------------------------------------------------------------------
// 3. Multivariate Breeder's Equation: Delta z_bar = G * beta (Lande 1979)
// -----------------------------------------------------------------------------

export interface GMatrixResult {
  rG: number; // genetic correlation between trait 1 (beak depth) and trait 2 (beak length)
  betaDeg: number; // direction of selection gradient beta (degrees)
  betaX: number;
  betaY: number;
  respX: number;
  respY: number;
  deflectionDeg: number;
  explain: string;
}

export function evaluateGMatrix(rG: number, betaDeg: number): GMatrixResult {
  const rad = (betaDeg * Math.PI) / 180;
  const betaX = Math.cos(rad);
  const betaY = Math.sin(rad);

  // Genetic variance-covariance matrix G with G11 = 1.0, G22 = 0.85, G12 = rG * sqrt(G11*G22)
  const g11 = 1.0;
  const g22 = 0.85;
  const g12 = rG * Math.sqrt(g11 * g22);

  const respX = g11 * betaX + g12 * betaY;
  const respY = g12 * betaX + g22 * betaY;

  const dot = betaX * respX + betaY * respY;
  const normB = Math.hypot(betaX, betaY);
  const normR = Math.hypot(respX, respY);
  const cosAng = Math.max(-1, Math.min(1, dot / Math.max(1e-6, normB * normR)));
  const deflectionDeg = (Math.acos(cosAng) * 180) / Math.PI;

  const explain =
    deflectionDeg < 8
      ? `Minimal Deflection (${deflectionDeg.toFixed(0)}°): Selection aligns closely with genetic variance (or r_G ≈ 0), so traits evolve straight up the fitness gradient.`
      : `Genetic Deflection (${deflectionDeg.toFixed(0)}°!): Genetic covariance (r_G = ${rG.toFixed(2)}) pulls the evolutionary response Δz̄ = Gβ sideways along the genetic line of least resistance (Schluter 1996)!`;

  return { rG, betaDeg, betaX, betaY, respX, respY, deflectionDeg, explain };
}

// -----------------------------------------------------------------------------
// 4. Polygenic Architecture & GWAS Signal Distribution
// -----------------------------------------------------------------------------

export interface GwasPreset {
  id: 'mendelian' | 'oligogenic' | 'polygenic';
  title: string;
  lociCount: number;
  heights: number[]; // 18 chromosomal markers (-log10 p heights)
  explain: string;
}

export const GWAS_PRESETS: Record<GwasPreset['id'], GwasPreset> = {
  mendelian: {
    id: 'mendelian',
    title: 'Single-Locus Mendelian (e.g. Peppered Moth cortex)',
    lociCount: 1,
    heights: [0.18, 0.22, 0.15, 0.24, 0.2, 2.55, 0.21, 0.19, 0.16, 0.22, 0.25, 0.18, 0.14, 0.2, 0.17, 0.23, 0.19, 0.15],
    explain:
      'One massive genome-wide significant skyscraper (e.g. cortex in peppered moths or Pitx1 in sticklebacks) explains >80% of phenotypic variance!',
  },
  oligogenic: {
    id: 'oligogenic',
    title: 'Oligogenic (e.g. Galápagos Finch Beak: ALX1 + HMGA2)',
    lociCount: 4,
    heights: [0.22, 1.75, 0.26, 0.2, 0.28, 1.48, 0.24, 0.3, 0.22, 1.32, 0.26, 0.22, 0.25, 1.18, 0.24, 0.21, 0.28, 0.2],
    explain:
      'A handful of moderate-to-large effect developmental regulators (such as ALX1 & HMGA2) act together with background modifiers.',
  },
  polygenic: {
    id: 'polygenic',
    title: 'Highly Polygenic / Infinitesimal (e.g. Human Height)',
    lociCount: 18,
    heights: [0.68, 0.92, 0.58, 0.85, 0.74, 0.98, 0.62, 0.88, 0.79, 0.94, 0.65, 0.82, 0.71, 0.91, 0.64, 0.86, 0.76, 0.69],
    explain:
      'Hundreds to thousands of small-effect alleles spread across every chromosome combine additively to produce a smooth bell curve — shifting rapidly via subtle allele-frequency nudges without hard sweeps!',
  },
};
