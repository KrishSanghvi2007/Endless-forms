// =============================================================================
// Chapter 3: The Lichen Wood & Soot — Natural Selection, R = h²S & Landscapes
// Pure, zero-DOM evolutionary biology simulation & mathematical core
// =============================================================================

import { createSeededRng } from '../../sim/adapter';

// -----------------------------------------------------------------------------
// PAGE 1: LICHEN BARK FORAGING, OVERPRODUCTION & THE PINNED MOTH
// -----------------------------------------------------------------------------

export interface MothSpecimen {
  id: number;
  /** Wing lightness from 0.08 (charcoal) to 0.92 (pale lichen-speckled) */
  shade: number;
  /** True for Pinned Moth #7 — tracked across life to prove individuals don't transform */
  pinned: boolean;
  alive: boolean;
  /** Bark surface local coordinates */
  x: number;
  z: number;
  rot: number;
}

export interface WoodGenerationSummary {
  gen: number;
  barkShade: number;
  popMean: number;
  survivorMean: number;
  selectionDiffS: number;
  responseR: number;
  pinnedShade: number;
  eatenCount: number;
  eggsLaid: number;
  adultsRecruited: number;
}

export const WOOD_POP_SIZE = 18;
export const PINNED_MOTH_SHADE = 0.26; // conspicuously darker than pale 0.80 lichen bark
export const EGGS_PER_GEN = 120;

export function createInitialWood(seed = 301): MothSpecimen[] {
  const rng = createSeededRng(seed);
  const moths: MothSpecimen[] = [];
  // Distribute 18 moths cleanly across the bark slab without overlapping
  const cols = 6;
  const rows = 3;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isPinned = idx === 7;
      // Wide initial variation centered around 0.48 (charcoal to pale lichen)
      const baseShade = isPinned
        ? PINNED_MOTH_SHADE
        : Math.max(0.1, Math.min(0.9, 0.14 + (idx / (WOOD_POP_SIZE - 1)) * 0.72 + rng.range(-0.07, 0.07)));
      moths.push({
        id: idx,
        shade: baseShade,
        pinned: isPinned,
        alive: true,
        x: -2.0 + c * 0.8 + rng.range(-0.14, 0.14),
        z: -0.92 + r * 0.92 + rng.range(-0.16, 0.16),
        rot: rng.range(-0.45, 0.45),
      });
      idx++;
    }
  }
  return moths;
}

export function meanShade(moths: MothSpecimen[], aliveOnly = false): number {
  const list = aliveOnly ? moths.filter((m) => m.alive) : moths;
  if (list.length === 0) return 0.5;
  return list.reduce((acc, m) => acc + m.shade, 0) / list.length;
}

/**
 * Simulated visual bird predator: removes `count` living non-pinned moths weighted
 * strongly by contrast |moth.shade - barkShade| so conspicuous moths suffer higher predation.
 */
export function runBirdForage(
  moths: MothSpecimen[],
  barkShade: number,
  count = 6,
  seed = 404
): { updated: MothSpecimen[]; eatenIds: number[] } {
  const rng = createSeededRng(seed);
  const updated = moths.map((m) => ({ ...m }));
  const eatenIds: number[] = [];

  for (let k = 0; k < count; k++) {
    const candidates = updated.filter((m) => m.alive && !m.pinned);
    if (candidates.length <= 5) break;
    // Conspicuousness score: squared contrast + small baseline detection chance
    const weights = candidates.map((m) => {
      const contrast = Math.abs(m.shade - barkShade);
      return 0.03 + contrast * contrast * 3.4;
    });
    const totalW = weights.reduce((a, b) => a + b, 0);
    let draw = rng.next() * totalW;
    let chosen = candidates[0];
    for (let i = 0; i < candidates.length; i++) {
      draw -= weights[i];
      if (draw <= 0) {
        chosen = candidates[i];
        break;
      }
    }
    chosen.alive = false;
    eatenIds.push(chosen.id);
  }
  return { updated, eatenIds };
}

/**
 * Overproduction + inheritance: surviving moths lay 120 eggs; winter cull recruits 18 adults.
 * Expected next-generation mean shifts by R = h² · S, while Pinned Moth #7 keeps its EXACT shade.
 */
export function breedNextWoodGeneration(
  moths: MothSpecimen[],
  gen: number,
  barkShade: number,
  h2 = 0.78,
  seed = 707
): { nextMoths: MothSpecimen[]; summary: WoodGenerationSummary } {
  const rng = createSeededRng(seed + gen * 31);
  const popMean = meanShade(moths, false);
  const survivors = moths.filter((m) => m.alive);
  const survMean = meanShade(moths, true);
  const S = survMean - popMean;
  const R = h2 * S;
  const targetMean = Math.max(0.12, Math.min(0.88, popMean + R));

  const nextMoths: MothSpecimen[] = [];
  const cols = 6;
  const rows = 3;
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const isPinned = idx === 7;
      // Box-Muller approximate normal around targetMean with sd ~ 0.14
      const u1 = Math.max(1e-4, rng.next());
      const u2 = rng.next();
      const zNorm = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const shade = isPinned
        ? PINNED_MOTH_SHADE
        : Math.max(0.08, Math.min(0.92, targetMean + zNorm * 0.13));
      nextMoths.push({
        id: idx,
        shade,
        pinned: isPinned,
        alive: true,
        x: -2.0 + c * 0.8 + rng.range(-0.14, 0.14),
        z: -0.92 + r * 0.92 + rng.range(-0.16, 0.16),
        rot: rng.range(-0.45, 0.45),
      });
      idx++;
    }
  }

  return {
    nextMoths,
    summary: {
      gen: gen + 1,
      barkShade,
      popMean,
      survivorMean: survMean,
      selectionDiffS: S,
      responseR: R,
      pinnedShade: PINNED_MOTH_SHADE,
      eatenCount: moths.length - survivors.length,
      eggsLaid: EGGS_PER_GEN,
      adultsRecruited: WOOD_POP_SIZE,
    },
  };
}

// -----------------------------------------------------------------------------
// PAGE 2: THE BREEDER'S EQUATION (R = h²S) & DARWIN'S THREE COUNTERFACTUALS
// -----------------------------------------------------------------------------

export type BreederScenarioId = 'standard' | 'no_var' | 'no_herit' | 'random';

export interface BreederResult {
  scenario: BreederScenarioId;
  h2: number;
  cutoffShade: number;
  parentMean: number;
  survivorMean: number;
  S: number;
  R: number;
  offspringMean: number;
  parentBins: number[];
  survivorBins: number[];
  offspringBins: number[];
  headline: string;
}

const BREEDER_BINS = 12;

export function computeBreederEquation(
  scenario: BreederScenarioId,
  h2Input: number,
  cutoffShade = 55
): BreederResult {
  const effectiveH2 = scenario === 'no_herit' ? 0 : h2Input;
  const binCenters = Array.from({ length: BREEDER_BINS }, (_, i) => ((i + 0.5) / BREEDER_BINS) * 100);

  // Parent distribution
  const parentMean0 = 46;
  const sd = scenario === 'no_var' ? 2.2 : 17.5;
  const rawParent = binCenters.map((x) => {
    if (scenario === 'no_var') return Math.abs(x - parentMean0) < 4.5 ? 1 : 0;
    return Math.exp(-0.5 * ((x - parentMean0) / sd) ** 2);
  });
  const sumP = rawParent.reduce((a, b) => a + b, 0) || 1;
  const parentBins = rawParent.map((v) => v / sumP);
  const parentMean = binCenters.reduce((acc, x, i) => acc + x * parentBins[i], 0);

  // Survivor distribution after visual predation
  const rawSurv = parentBins.map((p, i) => {
    const x = binCenters[i];
    if (scenario === 'random') return p * 0.55; // uniform random survival!
    if (scenario === 'no_var') return p * 0.55;
    // Smooth truncation survival above cutoffShade
    const survProb = 1 / (1 + Math.exp(-(x - cutoffShade) / 6.5));
    return p * (0.04 + 0.96 * survProb);
  });
  const sumS = rawSurv.reduce((a, b) => a + b, 0) || 1;
  const survivorBins = rawSurv.map((v) => v / sumS);
  const survivorMean = binCenters.reduce((acc, x, i) => acc + x * survivorBins[i], 0);

  const S = survivorMean - parentMean;
  const R = effectiveH2 * S;
  const offspringMean = parentMean + R;

  // Offspring distribution centered at parentMean + R
  const rawOff = binCenters.map((x) => {
    if (scenario === 'no_var') return Math.abs(x - offspringMean) < 4.5 ? 1 : 0;
    return Math.exp(-0.5 * ((x - offspringMean) / sd) ** 2);
  });
  const sumO = rawOff.reduce((a, b) => a + b, 0) || 1;
  const offspringBins = rawOff.map((v) => v / sumO);

  const headline =
    scenario === 'no_var'
      ? 'Zero variation → S = 0 → R = 0. Without phenotypic variance, selection has nothing to sort.'
      : scenario === 'no_herit'
        ? 'Acquired soot/diet stain (h² = 0) → survivors are pale, yet offspring snap straight back to the old mean!'
        : scenario === 'random'
          ? 'Random mortality → survivors mirror parents (S = 0) → no directional response.'
          : `Heritable variation + directional predation → offspring mean shifts by R = h²·S = +${R.toFixed(1)} shade units.`;

  return {
    scenario,
    h2: effectiveH2,
    cutoffShade,
    parentMean,
    survivorMean,
    S,
    R,
    offspringMean,
    parentBins,
    survivorBins,
    offspringBins,
    headline,
  };
}

// -----------------------------------------------------------------------------
// PAGE 3: THE BLACK COUNTRY — INDUSTRIAL MELANISM & DOMINANCE ASYMMETRY
// -----------------------------------------------------------------------------

export type MelanismEra = 'lichen_1848' | 'soot_1895' | 'clean_1970';
export type DominanceMode = 'dominant' | 'recessive';

export interface MelanismState {
  gen: number;
  /** Frequency of the dark (carbonaria) allele */
  pDark: number;
  /** Genotype frequencies [DD, Dd, dd] where D = dark allele, d = pale allele */
  geno: [number, number, number];
  /** Share of adults with dark phenotype */
  darkPheno: number;
  era: MelanismEra;
  dominance: DominanceMode;
}

export function eraFitnesses(era: MelanismEra): { wDark: number; wPale: number; label: string; sootLevel: number } {
  if (era === 'soot_1895') {
    return { wDark: 1.0, wPale: 0.48, label: '1895 Black Country (sooty bark)', sootLevel: 0.92 };
  }
  if (era === 'clean_1970') {
    return { wDark: 0.50, wPale: 1.0, label: '1970 Clean Air Recovery (pale lichen returns)', sootLevel: 0.14 };
  }
  return { wDark: 0.58, wPale: 1.0, label: '1848 Lichen Wood (clean pale birch)', sootLevel: 0.05 };
}

export function stepMelanismOneGen(
  pDark: number,
  era: MelanismEra,
  dominance: DominanceMode
): { nextP: number; geno: [number, number, number]; darkPheno: number } {
  const { wDark, wPale } = eraFitnesses(era);
  const p = Math.max(0.001, Math.min(0.999, pDark));
  const q = 1 - p;
  const fDD = p * p;
  const fDd = 2 * p * q;
  const fdd = q * q;

  const wDD = wDark;
  const wDd = dominance === 'dominant' ? wDark : wPale;
  const wdd = wPale;

  const wBar = fDD * wDD + fDd * wDd + fdd * wdd;
  const nextP = Math.max(0.001, Math.min(0.999, (fDD * wDD + 0.5 * fDd * wDd) / wBar));
  const nq = 1 - nextP;
  const nextGeno: [number, number, number] = [nextP * nextP, 2 * nextP * nq, nq * nq];
  const darkPheno = dominance === 'dominant' ? nextGeno[0] + nextGeno[1] : nextGeno[0];

  return { nextP, geno: nextGeno, darkPheno };
}

export function simulateMelanismTrajectory(
  startP: number,
  era: MelanismEra,
  dominance: DominanceMode,
  gens = 30
): number[] {
  const pts: number[] = [];
  let p = startP;
  for (let t = 0; t <= gens; t++) {
    const q = 1 - p;
    const darkPheno = dominance === 'dominant' ? p * p + 2 * p * q : p * p;
    pts.push(darkPheno);
    p = stepMelanismOneGen(p, era, dominance).nextP;
  }
  return pts;
}

// -----------------------------------------------------------------------------
// PAGE 4: MODES OF SELECTION — DIRECTIONAL, STABILIZING & DISRUPTIVE
// -----------------------------------------------------------------------------

export type SelectionModeId = 'directional' | 'stabilizing' | 'disruptive';

export interface SelectionModeState {
  mode: SelectionModeId;
  gen: number;
  bins: number[];
  fitness: number[];
  mean: number;
  variance: number;
}

const MODE_BINS = 16;

export function fitnessForMode(mode: SelectionModeId, z: number): number {
  if (mode === 'directional') {
    return 0.25 + 0.75 * z;
  }
  if (mode === 'stabilizing') {
    return 0.15 + 0.85 * Math.exp(-0.5 * ((z - 0.5) / 0.145) ** 2);
  }
  // Disruptive: deep fitness trough at intermediate z = 0.50, high peaks at both extremes
  return 0.14 + 0.86 * (1 - Math.exp(-0.5 * ((z - 0.5) / 0.19) ** 2));
}

export function createInitialModeState(mode: SelectionModeId): SelectionModeState {
  const centers = Array.from({ length: MODE_BINS }, (_, i) => (i + 0.5) / MODE_BINS);
  const startMean = mode === 'directional' ? 0.34 : 0.50;
  const raw = centers.map((z) => Math.exp(-0.5 * ((z - startMean) / 0.165) ** 2));
  const sum = raw.reduce((a, b) => a + b, 0);
  const bins = raw.map((v) => v / sum);
  const fitness = centers.map((z) => fitnessForMode(mode, z));
  return summarizeModeState(mode, 0, bins, fitness);
}

function summarizeModeState(
  mode: SelectionModeId,
  gen: number,
  bins: number[],
  fitness: number[]
): SelectionModeState {
  const centers = Array.from({ length: MODE_BINS }, (_, i) => (i + 0.5) / MODE_BINS);
  const mean = centers.reduce((a, z, i) => a + z * bins[i], 0);
  const variance = centers.reduce((a, z, i) => a + (z - mean) ** 2 * bins[i], 0);
  return { mode, gen, bins, fitness, mean, variance };
}

export function stepSelectionMode(state: SelectionModeState, steps = 1): SelectionModeState {
  const centers = Array.from({ length: MODE_BINS }, (_, i) => (i + 0.5) / MODE_BINS);
  const fitness = centers.map((z) => fitnessForMode(state.mode, z));
  let bins = [...state.bins];

  for (let s = 0; s < steps; s++) {
    // 1. Viability selection weighting
    const weighted = bins.map((p, i) => p * fitness[i]);
    const wSum = weighted.reduce((a, b) => a + b, 0) || 1;
    const survivors = weighted.map((v) => v / wSum);

    // 2. Mild segregating/recombination Gaussian blur so populations stay biologically smooth
    const sigma = 0.042;
    const next = centers.map((zc) => {
      let acc = 0;
      for (let j = 0; j < MODE_BINS; j++) {
        const dz = zc - centers[j];
        acc += survivors[j] * Math.exp(-0.5 * (dz / sigma) ** 2);
      }
      return acc;
    });
    const nSum = next.reduce((a, b) => a + b, 0) || 1;
    bins = next.map((v) => v / nSum);
  }

  return summarizeModeState(state.mode, state.gen + steps, bins, fitness);
}

// -----------------------------------------------------------------------------
// PAGE 5: SEWALL WRIGHT'S 3D FITNESS LANDSCAPE (LOCAL PEAKS & VALLEYS)
// -----------------------------------------------------------------------------

export interface LandscapePop {
  x: number;
  z: number;
  trail: [number, number][];
}

/**
 * Analytic 3D Adaptive Topography W(x, z) on x ∈ [-2.2, 2.2], z ∈ [-1.5, 1.5].
 * Standard environment: lower Local Peak at (-1.12, 0.24) [height ~0.92]
 * separated by a deep maladaptive valley from taller Global Peak at (1.16, -0.22) [height ~1.62].
 * Shifted environment: tilts and raises a saddle ridge so the old local peak slopes uphill into the global peak!
 */
export function fitnessSurfaceHeight(x: number, z: number, shifted: boolean): number {
  const localPeak = (shifted ? 0.42 : 0.96) * Math.exp(-(((x + 1.12) ** 2) / 0.52 + ((z - 0.24) ** 2) / 0.48));
  const globalPeak = (shifted ? 1.72 : 1.58) * Math.exp(-(((x - 1.16) ** 2) / 0.68 + ((z + 0.22) ** 2) / 0.58));
  const bridgeRidge = shifted
    ? 0.88 * Math.exp(-(((z - 0.04 + x * 0.18) ** 2) / 0.24)) * (0.55 + 0.45 * Math.tanh((x + 0.7) * 1.1))
    : 0;
  const valleyDip = shifted
    ? 0
    : -0.22 * Math.exp(-((x ** 2) / 0.28 + (z ** 2) / 1.2));
  return Math.max(0.05, 0.16 + localPeak + globalPeak + bridgeRidge + valleyDip);
}

export function fitnessGradient(x: number, z: number, shifted: boolean): [number, number] {
  const eps = 0.025;
  const gx = (fitnessSurfaceHeight(x + eps, z, shifted) - fitnessSurfaceHeight(x - eps, z, shifted)) / (2 * eps);
  const gz = (fitnessSurfaceHeight(x, z + eps, shifted) - fitnessSurfaceHeight(x, z - eps, shifted)) / (2 * eps);
  return [gx, gz];
}

export function stepLandscapePopulation(
  pop: LandscapePop,
  shifted: boolean,
  driftStrength: number,
  seed: number
): LandscapePop {
  const rng = createSeededRng(seed);
  let x = pop.x;
  let z = pop.z;
  const trail: [number, number][] = [...pop.trail];

  for (let sub = 0; sub < 5; sub++) {
    const [gx, gz] = fitnessGradient(x, z, shifted);
    const stepScale = 0.11;
    const dx = gx * stepScale + (driftStrength > 0 ? rng.range(-1, 1) * driftStrength * 0.24 : 0);
    const dz = gz * stepScale + (driftStrength > 0 ? rng.range(-1, 1) * driftStrength * 0.20 : 0);
    x = Math.max(-2.05, Math.min(2.05, x + dx));
    z = Math.max(-1.35, Math.min(1.35, z + dz));
  }
  trail.push([x, z]);
  if (trail.length > 26) trail.shift();
  return { x, z, trail };
}
