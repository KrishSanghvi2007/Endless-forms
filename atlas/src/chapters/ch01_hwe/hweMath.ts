import { createSeededRng } from '../../sim/adapter';

export type Genotype = 'AA' | 'Aa' | 'aa';
export type GenotypeTriple = [number, number, number]; // [AA, Aa, aa]

/** Exact Hardy–Weinberg expected proportions [p², 2pq, q²] */
export function hwExpected(p: number): GenotypeTriple {
  const pc = Math.max(0, Math.min(1, p));
  const q = 1 - pc;
  return [pc * pc, 2 * pc * q, q * q];
}

/** Inbred genotype proportions given allele frequency p and inbreeding coefficient F */
export function inbredExpected(p: number, F: number): GenotypeTriple {
  const pc = Math.max(0, Math.min(1, p));
  const q = 1 - pc;
  const fc = Math.max(0, Math.min(1, F));
  return [
    pc * pc + fc * pc * q,
    2 * pc * q * (1 - fc),
    q * q + fc * pc * q,
  ];
}

/** Allele frequency p from genotype counts [AA, Aa, aa] */
export function pFromCounts(c: GenotypeTriple): number {
  const n = c[0] + c[1] + c[2];
  return n > 0 ? (2 * c[0] + c[1]) / (2 * n) : 0.5;
}

/** Observed genotype proportions from counts */
export function fracsFromCounts(c: GenotypeTriple): GenotypeTriple {
  const n = c[0] + c[1] + c[2];
  return n > 0 ? [c[0] / n, c[1] / n, c[2] / n] : [0, 0, 0];
}

/**
 * Chi-square goodness-of-fit to Hardy–Weinberg with p estimated from the sample.
 * Degrees of freedom = 1 (3 genotype classes - 1 total - 1 estimated p).
 * 5% significance threshold = 3.841.
 */
export function chiSquare1df(c: GenotypeTriple): number {
  const n = c[0] + c[1] + c[2];
  if (n < 1) return 0;
  const p = pFromCounts(c);
  const exp = hwExpected(p).map((f) => f * n);
  let chi = 0;
  for (let i = 0; i < 3; i++) {
    if (exp[i] > 1e-9) {
      const diff = c[i] - exp[i];
      chi += (diff * diff) / exp[i];
    }
  }
  return chi;
}

/** Sample inbreeding / deficit index F_hat = 1 - H_obs / H_exp */
export function fHatFromCounts(c: GenotypeTriple): number {
  const n = c[0] + c[1] + c[2];
  if (n < 1) return 0;
  const p = pFromCounts(c);
  const he = 2 * p * (1 - p);
  if (he < 1e-9) return 0;
  return 1 - (c[1] / n) / he;
}

/**
 * Random mating for 1 generation given female allele frequency pF and male pM.
 * If pF === pM, lands directly on HW in 1 generation.
 * If pF !== pM (unequal sexes), overshoots ABOVE the HW curve (excess heterozygotes)
 * and reaches HW at pBar = (pF + pM)/2 on generation 2.
 */
export function mateOneGeneration(pFemale: number, pMale: number): GenotypeTriple {
  const qF = 1 - pFemale;
  const qM = 1 - pMale;
  return [
    pFemale * pMale,
    pFemale * qM + qF * pMale,
    qF * qM,
  ];
}

/**
 * Wahlund pooling of two demes in local HW equilibrium with weights w1 and (1 - w1).
 * Pooled heterozygote deficit equals 2 * Var(p) = 2 * w1 * (1 - w1) * (p1 - p2)².
 */
export function wahlundPool(
  p1: number,
  p2: number,
  w1 = 0.5
): {
  pooled: GenotypeTriple;
  pBar: number;
  expectedHW: GenotypeTriple;
  deficit: number;
} {
  const w2 = 1 - w1;
  const d1 = hwExpected(p1);
  const d2 = hwExpected(p2);
  const pooled: GenotypeTriple = [
    w1 * d1[0] + w2 * d2[0],
    w1 * d1[1] + w2 * d2[1],
    w1 * d1[2] + w2 * d2[2],
  ];
  const pBar = w1 * p1 + w2 * p2;
  const expectedHW = hwExpected(pBar);
  const deficit = expectedHW[1] - pooled[1];
  return { pooled, pBar, expectedHW, deficit };
}

/**
 * Warfarin-resistant Norway rat heterozygote advantage model (VKORC1, D6 decision 5).
 * A = susceptible wild-type (p), a = resistant copy (q).
 * Fitnesses: AA = 1 - s1 (warfarin mortality), Aa = 1, aa = 1 - s2 (vitamin-K cost).
 * Stable equilibrium when s1 > 0 and s2 > 0: qHat = s1 / (s1 + s2).
 */
export function warfarinSeason(
  q: number,
  s1: number,
  s2: number
): {
  newborns: GenotypeTriple;
  adults: GenotypeTriple;
  nextQ: number;
  qHat: number;
} {
  const qc = Math.max(0, Math.min(1, q));
  const p = 1 - qc;
  const newborns: GenotypeTriple = [p * p, 2 * p * qc, qc * qc];
  const wAA = newborns[0] * (1 - s1);
  const wAa = newborns[1] * 1.0;
  const waa = newborns[2] * (1 - s2);
  const wBar = wAA + wAa + waa;
  const adults: GenotypeTriple =
    wBar > 1e-9 ? [wAA / wBar, wAa / wBar, waa / wBar] : newborns;
  const nextQ = adults[2] + 0.5 * adults[1];
  const qHat = s1 + s2 > 1e-9 ? s1 / (s1 + s2) : 0;
  return { newborns, adults, nextQ, qHat };
}

/** Deterministic 30-generation binomial/multinomial random mating simulation in N = 20,000 beetles */
export function simulateYule30(seed: number, startP = 0.3, N = 20000): {
  gen: number;
  p: number;
  blueFrac: number;
}[] {
  const rng = createSeededRng(seed);
  const out: { gen: number; p: number; blueFrac: number }[] = [];
  let p = startP;
  for (let g = 0; g <= 30; g++) {
    const [aa0, het] = hwExpected(p);
    const blueFrac = aa0 + het; // 1 - q²
    out.push({ gen: g, p, blueFrac });
    // Tiny realistic finite-N binomial sampling noise (SD = sqrt(p*q/(2N)) ≈ 0.0023)
    const sd = Math.sqrt((p * (1 - p)) / (2 * N));
    p = Math.max(0.01, Math.min(0.99, p + rng.gaussian() * sd));
  }
  return out;
}

export interface BeachBeetle {
  id: number;
  x: number; // local beach X in [-2.6, 2.6]
  z: number; // local beach Z in [-1.45, 1.45]
  rot: number;
  genotype: Genotype;
  sampled: boolean;
}

/** Generate a deterministic beach population of N beetles with specified p and inbreeding deficit F */
export function generateBeachPopulation(
  seed: number,
  N: number,
  p: number,
  F: number
): BeachBeetle[] {
  const rng = createSeededRng(seed);
  const probs = inbredExpected(p, F);
  const beetles: BeachBeetle[] = [];
  for (let i = 0; i < N; i++) {
    const u = rng.next();
    const genotype: Genotype =
      u < probs[0] ? 'AA' : u < probs[0] + probs[1] ? 'Aa' : 'aa';
    beetles.push({
      id: i,
      x: rng.range(-2.45, 2.45),
      z: rng.range(-1.32, 1.32),
      rot: rng.range(0, Math.PI * 2),
      genotype,
      sampled: false,
    });
  }
  return beetles;
}

/** Generate a two-deme beach (Dune left p=0.80, Marsh right p=0.20) for the Wahlund effect */
export function generateWahlundBeach(seed: number, N = 240): BeachBeetle[] {
  const rng = createSeededRng(seed);
  const beetles: BeachBeetle[] = [];
  const half = Math.floor(N / 2);
  for (let i = 0; i < N; i++) {
    const isLeft = i < half;
    const p = isLeft ? 0.8 : 0.2;
    const probs = hwExpected(p);
    const u = rng.next();
    const genotype: Genotype =
      u < probs[0] ? 'AA' : u < probs[0] + probs[1] ? 'Aa' : 'aa';
    beetles.push({
      id: i,
      x: isLeft ? rng.range(-2.42, -0.06) : rng.range(0.06, 2.42),
      z: rng.range(-1.26, 1.26),
      rot: rng.range(0, Math.PI * 2),
      genotype,
      sampled: true,
    });
  }
  return beetles;
}
