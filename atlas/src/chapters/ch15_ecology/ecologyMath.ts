// =============================================================================
// Chapter 15: Ecology in Motion — Pure Evolutionary Ecology Math Models
// =============================================================================

export interface DisplacementResult {
  competitorPresent: boolean;
  drought: boolean;
  fortisBeakMm: number; // 8.4 .. 10.6 mm
  magnirostrisBeakMm: number; // ~15.8 mm
  fortisBeakScale: number; // For 3D sculpted beak depth morph!
  summary: string;
}

/**
 * Grant & Grant (2006) Daphne Major Character Displacement:
 * Alone on Daphne Major during drought, G. fortis evolved larger beaks to crack Tribulus seeds.
 * After large-beaked G. magnirostris colonized and depleted large seeds during the 2003-2004 drought,
 * G. fortis rapidly evolved SMALLER beaks — classic ecological character displacement!
 */
export function evaluateCharacterDisplacement(
  competitorPresent: boolean,
  drought: boolean
): DisplacementResult {
  if (!competitorPresent && !drought) {
    return {
      competitorPresent,
      drought,
      fortisBeakMm: 9.5,
      magnirostrisBeakMm: 15.8,
      fortisBeakScale: 1.25,
      summary: 'Allopatric Baseline: Medium ground finch (G. fortis) uses both medium and large seeds comfortably.',
    };
  }
  if (!competitorPresent && drought) {
    return {
      competitorPresent,
      drought,
      fortisBeakMm: 10.3,
      magnirostrisBeakMm: 15.8,
      fortisBeakScale: 1.55,
      summary: '1977 Drought (No Competitor): Only tough large seeds remain → G. fortis evolves a deeper, heavier beak (+4% in 1 generation)!',
    };
  }
  if (competitorPresent && !drought) {
    return {
      competitorPresent,
      drought,
      fortisBeakMm: 9.2,
      magnirostrisBeakMm: 15.8,
      fortisBeakScale: 1.15,
      summary: 'Sympatric Wet Year: Abundant small & medium seeds soften competition between the two finches.',
    };
  }
  return {
    competitorPresent,
    drought,
    fortisBeakMm: 8.4,
    magnirostrisBeakMm: 15.8,
    fortisBeakScale: 0.82,
    summary: '2004 Drought + G. magnirostris Competitor: Large finches monopolize Tribulus seeds → G. fortis rapidly evolves a SMALLER beak (Character Displacement; Grant & Grant 2006)!',
  };
}

export interface CascadeResult {
  otterDensity: number; // 0 .. 1
  urchinDensity: number; // 0.1 .. 1.0 (inversely controlled by keystone otters!)
  kelpCanopyHeight: number; // 0.18 .. 1.0 (crashes into urchin barren when otters vanish!)
  ecosystemState: string;
}

/**
 * Estes & Palmisano (1974) Aleutian Kelp Forest Keystone Trophic Cascade:
 * Sea otters (predator) suppress purple sea urchins (herbivore), allowing lush giant kelp forests to thrive.
 */
export function evaluateTrophicCascade(otterDensity: number): CascadeResult {
  const o = Math.max(0, Math.min(1, otterDensity));
  const urchinDensity = Math.max(0.1, 1.0 - o * 0.88);
  const kelpCanopyHeight = Math.max(0.2, Math.min(1.0, 1.05 - urchinDensity * 0.86));
  const ecosystemState =
    o >= 0.55
      ? 'Lush Giant Kelp Forest (Keystone sea otters keep urchins in check!)'
      : o >= 0.25
        ? 'Thinning Canopy — rising sea urchin grazing cuts kelp stipes.'
        : 'Urchin Barren! Without keystone sea otters, urchins devour the entire kelp forest.';
  return { otterDensity: o, urchinDensity, kelpCanopyHeight, ecosystemState };
}

export interface BiogeographyResult {
  islandSize: number; // 0.3 (small) .. 1.0 (large)
  distance: number; // 0.2 (near) .. 1.0 (far)
  immigrationRate: number;
  extinctionRate: number;
  eqSpeciesS: number; // Equilibrium richness S* (2 .. 28)
}

/**
 * MacArthur & Wilson (1967) Equilibrium Theory of Island Biogeography:
 * Larger islands lower extinction E(S); nearer islands raise immigration I(S).
 * Species richness settles dynamically at S* where I(S*) = E(S*), with continual turnover!
 */
export function evaluateIslandBiogeography(
  islandSize: number,
  distance: number
): BiogeographyResult {
  const sz = Math.max(0.25, Math.min(1.0, islandSize));
  const dist = Math.max(0.15, Math.min(1.0, distance));
  const poolP = 32;
  const immSlope = 1.25 - dist * 0.88; // Near = high immigration
  const extSlope = 1.15 - sz * 0.78; // Large = low extinction
  const eqSpeciesS = Math.max(2, Math.round((poolP * immSlope) / (immSlope + extSlope)));
  return {
    islandSize: sz,
    distance: dist,
    immigrationRate: Number((immSlope * (1 - eqSpeciesS / poolP) * 10).toFixed(1)),
    extinctionRate: Number((extSlope * (eqSpeciesS / poolP) * 10).toFixed(1)),
    eqSpeciesS,
  };
}

export interface IfdResult {
  richPatchShare: number; // Fraction of total food in Rich Patch (0.50 .. 0.85)
  totalForagers: number; // 12
  richForagers: number;
  poorForagers: number;
  intakePerForagerRich: number;
  intakePerForagerPoor: number;
}

/**
 * Fretwell & Lucas (1970) Ideal Free Distribution (Input Matching):
 * Free-moving competitors settle across patches in direct proportion to resource input rates
 * so that per-capita intake is equalized across both rich and poor habitats!
 */
export function evaluateIfd(richPatchShare: number): IfdResult {
  const share = Math.max(0.5, Math.min(0.85, richPatchShare));
  const totalForagers = 12;
  const richForagers = Math.round(totalForagers * share);
  const poorForagers = totalForagers - richForagers;
  const totalFood = 120;
  const intakePerForagerRich = (totalFood * share) / Math.max(1, richForagers);
  const intakePerForagerPoor = (totalFood * (1 - share)) / Math.max(1, poorForagers);
  return {
    richPatchShare: share,
    totalForagers,
    richForagers,
    poorForagers,
    intakePerForagerRich,
    intakePerForagerPoor,
  };
}

export interface VortexResult {
  corridorOpen: boolean;
  effectiveSizeNe: number;
  heterozygosityPct: number;
  inbreedingLoad: number;
  trajectory: string;
}

export function evaluateConservationVortex(corridorOpen: boolean): VortexResult {
  return corridorOpen
    ? {
        corridorOpen: true,
        effectiveSizeNe: 95,
        heterozygosityPct: 84,
        inbreedingLoad: 0.08,
        trajectory: 'Genetic Rescue! Just 2 outbred migrants mask recessive load, restoring fitness & population growth.',
      }
    : {
        corridorOpen: false,
        effectiveSizeNe: 14,
        heterozygosityPct: 26,
        inbreedingLoad: 0.62,
        trajectory: 'Extinction Vortex: Tiny N_e → rapid inbreeding & drift → lower survival → even smaller N_e!',
      };
}
