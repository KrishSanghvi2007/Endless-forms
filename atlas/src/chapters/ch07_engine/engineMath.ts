// =============================================================================
// Chapter 7: Mutation, Linkage & Gene Flow — Pure Mathematical Models
// =============================================================================

export interface FluctuationPlate {
  id: number;
  colonies: number;
  jackpot: boolean;
}

export interface FluctuationResult {
  mode: 'spontaneous' | 'induced';
  plates: FluctuationPlate[];
  mean: number;
  variance: number;
  fanoFactor: number; // Variance / Mean (~1 for Poisson induced; >>1 for Luria-Delbrück)
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function samplePoisson(lambda: number, rng: () => number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng();
  } while (p > L && k < 100);
  return k - 1;
}

/**
 * Simulates 6 parallel E. coli cultures plated onto T1 phage agar.
 * - 'induced' (Directed hypothesis): each cell mutates independently upon plating -> Poisson (Var/Mean ~ 1)
 * - 'spontaneous' (Luria-Delbrück 1943): mutations occur randomly during exponential growth -> heavy-tailed jackpot variance (Var/Mean >> 1)
 */
export function runFluctuationTest(
  mode: 'spontaneous' | 'induced',
  seed: number
): FluctuationResult {
  const rng = mulberry32(seed * 97 + (mode === 'spontaneous' ? 17 : 53));
  const plates: FluctuationPlate[] = [];

  if (mode === 'induced') {
    for (let i = 0; i < 6; i++) {
      const c = Math.max(2, samplePoisson(8.5, rng));
      plates.push({ id: i + 1, colonies: c, jackpot: false });
    }
  } else {
    // True exponential growth Luria-Delbrück simulation (7 generations of doubling)
    const jackpotIdx = Math.floor(rng() * 6);
    for (let i = 0; i < 6; i++) {
      let mutants = 0;
      for (let gen = 0; gen < 7; gen++) {
        mutants *= 2;
        const nCells = Math.pow(2, gen + 2);
        const expectedNew = nCells * 0.0045;
        mutants += samplePoisson(expectedNew, rng);
      }
      // Guarantee realistic pedagogical jackpot clarity across seeds
      if (i === jackpotIdx && mutants < 22) {
        mutants = 24 + Math.floor(rng() * 14);
      } else if (i !== jackpotIdx && mutants > 8) {
        mutants = Math.floor(rng() * 3);
      }
      plates.push({ id: i + 1, colonies: mutants, jackpot: mutants >= 16 });
    }
  }

  const mean = plates.reduce((s, p) => s + p.colonies, 0) / plates.length;
  const variance =
    plates.reduce((s, p) => s + Math.pow(p.colonies - mean, 2), 0) / (plates.length - 1);
  const fanoFactor = mean > 0.001 ? variance / mean : 0;

  return { mode, plates, mean, variance, fanoFactor };
}

export interface MutationSelectionResult {
  dominance: 'recessive' | 'dominant';
  mu: number; // e.g., 1e-5 to 1e-3
  s: number; // 0.05 to 1.0
  qHat: number;
  affectedFreq: number;
  carrierFreq: number;
}

/**
 * Computes mutation-selection equilibrium allele frequency q*:
 * - Completely recessive deleterious allele (h = 0): q* = sqrt(mu / s), affected = q*^2 = mu/s, carriers = 2pq*
 * - Dominant deleterious allele (h = 1): q* ≈ mu / s, affected ≈ 2q*
 */
export function computeMutationSelection(
  dominance: 'recessive' | 'dominant',
  mu: number,
  s: number
): MutationSelectionResult {
  const safeS = Math.max(0.02, s);
  const qHat =
    dominance === 'recessive'
      ? Math.min(0.49, Math.sqrt(mu / safeS))
      : Math.min(0.49, mu / safeS);
  const pHat = 1 - qHat;
  const affectedFreq = dominance === 'recessive' ? qHat * qHat : Math.min(1, 2 * pHat * qHat + qHat * qHat);
  const carrierFreq = dominance === 'recessive' ? 2 * pHat * qHat : 0;
  return { dominance, mu, s: safeS, qHat, affectedFreq, carrierFreq };
}

export interface XLinkedResult {
  q: number;
  maleAffected: number; // q
  femaleAffected: number; // q^2
  femaleCarrier: number; // 2pq
  maleToFemaleRatio: number; // 1/q
}

export function computeXLinked(q: number): XLinkedResult {
  const clamped = Math.max(0.02, Math.min(0.6, q));
  return {
    q: clamped,
    maleAffected: clamped,
    femaleAffected: clamped * clamped,
    femaleCarrier: 2 * (1 - clamped) * clamped,
    maleToFemaleRatio: 1 / clamped,
  };
}

export interface LinkageSweepResult {
  r: number; // Recombination rate (0 to 0.5)
  generations: number;
  d0: number;
  dt: number; // D_t = D_0 * (1 - r)^t
  halfLifeGens: number;
  diversityProfile: number[]; // 15 spatial windows across chromosome (-7..+7)
}

/**
 * Computes Linkage Disequilibrium decay D_t = D_0 (1 - r)^t and
 * Maynard Smith & Haigh (1974) hitchhiking nucleotide diversity valley across a chromosome.
 */
export function computeLinkageSweep(
  r: number,
  generations: number,
  sweepStrength = 0.08
): LinkageSweepResult {
  const d0 = 0.25;
  const dt = d0 * Math.pow(1 - r, generations);
  const halfLifeGens = r > 0.001 ? Math.log(0.5) / Math.log(1 - r) : Infinity;

  // Spatial nucleotide diversity pi(x) / pi_0 around focal selected locus at center (idx 7)
  // Using Maynard Smith & Haigh scaling: pi(x)/pi_0 ≈ 1 - exp(-c * |x| * r / s)
  const diversityProfile: number[] = [];
  for (let i = -7; i <= 7; i++) {
    if (i === 0) {
      diversityProfile.push(0.05);
    } else {
      const distRecomb = Math.abs(i) * Math.max(0.004, r * 0.45);
      const recovery = 1 - Math.exp((-distRecomb * 0.85) / Math.max(0.01, sweepStrength));
      diversityProfile.push(Math.max(0.06, Math.min(1, 0.06 + 0.94 * recovery)));
    }
  }

  return { r, generations, d0, dt, halfLifeGens, diversityProfile };
}

export interface GeneFlowResult {
  m: number; // Migration rate per generation
  s: number; // Local selection coefficient on dark lava favoring melanic Mc1r allele
  ne: number;
  fst: number; // Wright's Island Model F_ST = 1 / (4 Ne m + 1)
  nem: number;
  lavaDarkFreq: number; // Equilibrium melanic frequency on lava under migration-selection balance
  swamped: boolean; // True when m >= s (gene flow overwhelms local selection!)
}

/**
 * Models Wright's F_ST and continent-island migration-selection balance on
 * desert sand (pale) -> volcanic lava (dark Mc1r) rock pocket mouse habitats.
 */
export function computeGeneFlow(m: number, s: number, ne: number): GeneFlowResult {
  const nem = ne * m;
  const fst = 1 / (4 * nem + 1);
  // Continent-island haploid/additive approximation: local allele survives iff s > m, eq p* = 1 - m/s
  const swamped = m >= s;
  const lavaDarkFreq = swamped ? 0.05 : Math.max(0.08, Math.min(0.98, 1 - m / s));
  return { m, s, ne, fst, nem, lavaDarkFreq, swamped };
}
