// =============================================================================
// Chapter 4: Drift Casino — Genetic Drift, Effective Size (Ne), Bottlenecks,
// Drift vs. Selection (4Nes) & Kingman's Coalescent (Pure Math & Simulation)
// =============================================================================

import { createSeededRng } from '../../sim/adapter';

// -----------------------------------------------------------------------------
// PAGE 1: WRIGHT-FISHER CRYSTAL JARS (SAMPLING ERROR & P(FIX) = p0)
// -----------------------------------------------------------------------------

export interface JarState {
  id: number;
  p: number;
  history: number[];
  status: 'poly' | 'fixedA' | 'lostA';
}

export function createInitialJars(p0: number, count = 6): JarState[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    p: p0,
    history: [p0],
    status: p0 >= 1 ? 'fixedA' : p0 <= 0 ? 'lostA' : 'poly',
  }));
}

/** Exact binomial Wright–Fisher sampling of 2N allele copies */
export function sampleBinomialFreq(p: number, twoN: number, rng: { next: () => number }): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (twoN <= 160) {
    let k = 0;
    for (let i = 0; i < twoN; i++) {
      if (rng.next() < p) k++;
    }
    return k / twoN;
  }
  // Normal approximation for large 2N > 160
  const sd = Math.sqrt((p * (1 - p)) / twoN);
  const u1 = Math.max(1e-5, rng.next());
  const u2 = rng.next();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.max(0, Math.min(1, p + z * sd));
}

export function stepJarsWrightFisher(
  jars: JarState[],
  N: number,
  gens: number,
  seed: number
): JarState[] {
  const rng = createSeededRng(seed);
  const twoN = Math.max(4, Math.round(2 * N));
  return jars.map((jar) => {
    let p = jar.p;
    const history = [...jar.history];
    for (let g = 0; g < gens; g++) {
      if (p > 0 && p < 1) {
        p = sampleBinomialFreq(p, twoN, rng);
      }
      history.push(p);
    }
    const trimmed = history.length > 48 ? history.slice(history.length - 48) : history;
    const status: JarState['status'] = p >= 1 ? 'fixedA' : p <= 0 ? 'lostA' : 'poly';
    return { ...jar, p, history: trimmed, status };
  });
}

export function expectedHeterozygosity(p0: number, N: number, gen: number): number {
  const h0 = 2 * p0 * (1 - p0);
  return h0 * Math.pow(1 - 1 / (2 * N), gen);
}

// -----------------------------------------------------------------------------
// PAGE 2: BURI'S 107 BOTTLES & EFFECTIVE POPULATION SIZE (Ne)
// -----------------------------------------------------------------------------

export interface EffectiveSizeSummary {
  censusN: number;
  nm: number;
  nf: number;
  neSexRatio: number;
  ratioPct: number;
  buriCensus: number;
  buriNe: number;
  vialsIdeal: number[];
  vialsBuri: number[];
}

export function sexRatioNe(nm: number, nf: number): number {
  if (nm <= 0 || nf <= 0) return 0;
  return (4 * nm * nf) / (nm + nf);
}

export function computeBuriAndNe(nm: number, censusN = 20, gen = 12, seed = 1956): EffectiveSizeSummary {
  const clampedNm = Math.max(1, Math.min(censusN - 1, Math.round(nm)));
  const nf = censusN - clampedNm;
  const neSex = sexRatioNe(clampedNm, nf);

  // Simulate 12 representative Drosophila vials under ideal N=16 vs Buri's empirical Ne=11.5
  const rng1 = createSeededRng(seed);
  const rng2 = createSeededRng(seed + 99);
  const vialsIdeal: number[] = [];
  const vialsBuri: number[] = [];

  for (let i = 0; i < 12; i++) {
    let p1 = 0.5;
    let p2 = 0.5;
    for (let g = 0; g < gen; g++) {
      p1 = sampleBinomialFreq(p1, 32, rng1); // Ideal N = 16 -> 2N = 32
      p2 = sampleBinomialFreq(p2, 23, rng2); // Buri empirical Ne ≈ 11.5 -> 2Ne = 23
    }
    vialsIdeal.push(p1);
    vialsBuri.push(p2);
  }

  return {
    censusN,
    nm: clampedNm,
    nf,
    neSexRatio: neSex,
    ratioPct: (neSex / censusN) * 100,
    buriCensus: 16,
    buriNe: 11.5,
    vialsIdeal,
    vialsBuri,
  };
}

// -----------------------------------------------------------------------------
// PAGE 3: 12-ALLELE VOLCANO BOTTLENECK (ALLELIC RICHNESS vs HETEROZYGOSITY)
// -----------------------------------------------------------------------------

export const JEWEL_ALLELES = [
  { id: 0, name: 'Cobalt', hex: '#2e62d1', initFreq: 0.21 },
  { id: 1, name: 'Amber', hex: '#e2a824', initFreq: 0.19 },
  { id: 2, name: 'Emerald', hex: '#2a8c6c', initFreq: 0.16 },
  { id: 3, name: 'Crimson', hex: '#c73a2e', initFreq: 0.10 },
  { id: 4, name: 'Amethyst', hex: '#7f4ca5', initFreq: 0.08 },
  { id: 5, name: 'Teal', hex: '#238294', initFreq: 0.06 },
  { id: 6, name: 'Coral', hex: '#e06e4d', initFreq: 0.05 },
  { id: 7, name: 'Ochre', hex: '#b37b2c', initFreq: 0.04 },
  { id: 8, name: 'Indigo', hex: '#39438f', initFreq: 0.035 },
  { id: 9, name: 'Rose', hex: '#c75b88', initFreq: 0.03 },
  { id: 10, name: 'Jade', hex: '#639e46', initFreq: 0.025 },
  { id: 11, name: 'Slate', hex: '#5f6f7f', initFreq: 0.02 },
];

export interface BottleneckResult {
  nb: number;
  counts: number[];
  freqs: number[];
  richnessBefore: number;
  richnessAfter: number;
  hetBefore: number;
  hetAfter: number;
  harmonicNe5Gen: number;
}

export function heterozygosityFromFreqs(freqs: number[]): number {
  const sumSq = freqs.reduce((a, f) => a + f * f, 0);
  return Math.max(0, 1 - sumSq);
}

export function harmonicMeanNe(sizes: number[]): number {
  const sumInv = sizes.reduce((acc, n) => acc + 1 / Math.max(1, n), 0);
  return sizes.length / sumInv;
}

export function runVolcanoBottleneck(nb: number, seed: number): BottleneckResult {
  const rng = createSeededRng(seed);
  const twoNb = Math.max(2, Math.round(2 * nb));
  const counts = new Array<number>(JEWEL_ALLELES.length).fill(0);

  // Build cumulative distribution from mainland frequencies
  const cdf: number[] = [];
  let acc = 0;
  for (const al of JEWEL_ALLELES) {
    acc += al.initFreq;
    cdf.push(acc);
  }
  cdf[cdf.length - 1] = 1.0;

  for (let i = 0; i < twoNb; i++) {
    const u = rng.next();
    const idx = cdf.findIndex((c) => u <= c);
    counts[idx >= 0 ? idx : 0]++;
  }

  const freqs = counts.map((c) => c / twoNb);
  const initFreqs = JEWEL_ALLELES.map((a) => a.initFreq);
  const richnessAfter = counts.filter((c) => c > 0).length;

  return {
    nb,
    counts,
    freqs,
    richnessBefore: JEWEL_ALLELES.length,
    richnessAfter,
    hetBefore: heterozygosityFromFreqs(initFreqs),
    hetAfter: heterozygosityFromFreqs(freqs),
    harmonicNe5Gen: harmonicMeanNe([500, 500, nb, 500, 500]),
  };
}

// -----------------------------------------------------------------------------
// PAGE 4: DRIFT VS. SELECTION (4Nes & KIMURA'S FIXATION PROBABILITY)
// -----------------------------------------------------------------------------

/** Kimura (1962) exact fixation probability for additive allele starting at p0 */
export function kimuraFixProb(p0: number, Ne: number, s: number): number {
  const fourNes = 4 * Ne * s;
  if (Math.abs(fourNes) < 1e-4) return p0;
  const num = 1 - Math.exp(-fourNes * p0);
  const den = 1 - Math.exp(-fourNes);
  return Math.max(0, Math.min(1, num / den));
}

export interface TugRun {
  history: number[];
  finalP: number;
  fixed: boolean;
  lost: boolean;
}

export function simulateDriftVsSelection(
  Ne: number,
  s: number,
  p0 = 0.15,
  gens = 36,
  replicates = 6,
  seed = 440
): { runs: TugRun[]; kimuraP: number; fourNes: number } {
  const rng = createSeededRng(seed);
  const twoN = Math.max(6, Math.round(2 * Ne));
  const runs: TugRun[] = [];

  for (let r = 0; r < replicates; r++) {
    let p = p0;
    const history = [p];
    for (let g = 0; g < gens; g++) {
      if (p > 0 && p < 1) {
        // Viability selection (additive: wAA = 1+s, wAa = 1+s/2, waa = 1)
        const q = 1 - p;
        const wAA = 1 + s;
        const wAa = 1 + s * 0.5;
        const waa = 1;
        const wBar = p * p * wAA + 2 * p * q * wAa + q * q * waa;
        const pSel = (p * p * wAA + p * q * wAa) / Math.max(1e-6, wBar);
        p = sampleBinomialFreq(pSel, twoN, rng);
      }
      history.push(p);
    }
    runs.push({
      history,
      finalP: p,
      fixed: p >= 0.999,
      lost: p <= 0.001,
    });
  }

  return {
    runs,
    kimuraP: kimuraFixProb(p0, Ne, s),
    fourNes: 4 * Ne * s,
  };
}

// -----------------------------------------------------------------------------
// PAGE 5: 3D KINGMAN COALESCENT TREES & DEMOGRAPHIC SIGNATURES
// -----------------------------------------------------------------------------

export type CoalescentRegime = 'constant' | 'expansion' | 'bottleneck';

export interface CoalEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mutations: number[]; // fractional positions t ∈ [0.15, 0.85] along the branch
}

export interface CoalNode {
  id: number;
  x: number;
  y: number;
  isMrca: boolean;
}

export interface CoalescentTreeData {
  regime: CoalescentRegime;
  nodes: CoalNode[];
  edges: CoalEdge[];
  mrcaHeight: number;
  segregatingSites: number;
  tajimasD: number;
  summary: string;
}

/**
 * Generates a clean, non-crossing 3D Kingman coalescent genealogy for n = 8 sampled alleles.
 * Uses adjacent-lineage coalescence so branches form a sculptural museum tree with realistic
 * branch-length distributions for Constant Ne, Exponential Expansion, and Recent Bottleneck.
 */
export function buildCoalescentTree(regime: CoalescentRegime, seed = 880): CoalescentTreeData {
  const rng = createSeededRng(seed);
  const n = 8;

  // Initialize 8 present-day leaf alleles along X ∈ [-2.1, 2.1] at y = 0
  let active = Array.from({ length: n }, (_, i) => ({
    id: i,
    x: -2.1 + (i / (n - 1)) * 4.2,
    y: 0,
  }));

  const nodes: CoalNode[] = active.map((a) => ({ ...a, isMrca: false }));
  const edges: CoalEdge[] = [];
  let nextId = n;
  let curT = 0;

  // Step backwards through n - 1 = 7 coalescence events
  for (let step = 0; step < n - 1; step++) {
    const k = active.length;
    const rate = (k * (k - 1)) / 2;
    const rawExp = -Math.log(Math.max(0.08, rng.next())) / rate;

    // Warp waiting time according to demographic history!
    let dt = rawExp * 1.45;
    if (regime === 'expansion') {
      // Recent large Ne -> very long external branches, then sudden rapid burst near the root!
      dt = step === 0 ? 1.15 + rng.range(0.05, 0.25) : 0.14 + rawExp * 0.42;
    } else if (regime === 'bottleneck') {
      // Rapid mid-tree pinch (k=8..3 coalesce fast in narrow bottleneck), leaving 2 deep lineages
      if (step < 5) dt = 0.16 + rawExp * 0.35;
      else if (step === 5) dt = 0.55 + rng.range(0.1, 0.25);
      else dt = 1.05 + rng.range(0.15, 0.3);
    } else {
      dt = Math.max(0.16, Math.min(0.95, rawExp * 1.6));
    }

    curT += dt;

    // Choose an adjacent pair to coalesce cleanly without visual crossing
    const idx = Math.floor(rng.next() * (k - 1));
    const left = active[idx];
    const right = active[idx + 1];
    const parentX = (left.x + right.x) / 2;
    const parentNode: CoalNode = {
      id: nextId++,
      x: parentX,
      y: curT,
      isMrca: k === 2,
    };
    nodes.push(parentNode);

    const placeMuts = (len: number): number[] => {
      const expected = len * 1.45;
      const count = Math.min(4, Math.floor(expected + rng.next() * 0.85));
      return Array.from({ length: count }, (_, m) => 0.18 + ((m + 0.5) / Math.max(1, count)) * 0.64);
    };

    edges.push({
      x1: left.x,
      y1: left.y,
      x2: parentNode.x,
      y2: parentNode.y,
      mutations: placeMuts(parentNode.y - left.y),
    });
    edges.push({
      x1: right.x,
      y1: right.y,
      x2: parentNode.x,
      y2: parentNode.y,
      mutations: placeMuts(parentNode.y - right.y),
    });

    active = [...active.slice(0, idx), parentNode, ...active.slice(idx + 2)];
  }

  // Normalize vertical height smoothly to [0, 2.55] for sculptural 3D framing
  const maxY = Math.max(0.8, curT);
  const scaleY = 2.45 / maxY;
  nodes.forEach((nd) => {
    nd.y *= scaleY;
  });
  edges.forEach((ed) => {
    ed.y1 *= scaleY;
    ed.y2 *= scaleY;
  });

  const segSites = edges.reduce((a, e) => a + e.mutations.length, 0);
  const tajimasD =
    regime === 'expansion' ? -1.48 : regime === 'bottleneck' ? +1.36 : +0.08;
  const summary =
    regime === 'expansion'
      ? 'Star-like tree: long external branches accumulate many rare singleton mutations → Tajima’s D < 0 (caution: a hard selective sweep mimics this at one locus!).'
      : regime === 'bottleneck'
        ? 'Pinched bottleneck: lineages coalesce rapidly during the crash, leaving deep basal splits & intermediate-frequency alleles → Tajima’s D > 0.'
        : 'Constant Ne: balanced Kingman coalescent where E[T_MRCA] = 4Ne(1 − 1/n) and Tajima’s D ≈ 0.';

  return {
    regime,
    nodes,
    edges,
    mrcaHeight: maxY * 22, // scaled illustrative generations
    segregatingSites: segSites,
    tajimasD,
    summary,
  };
}
