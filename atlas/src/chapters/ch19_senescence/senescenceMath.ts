// =============================================================================
// Chapter 19: Ageing, Senescence & Life Histories — Quantitative Math
// 1. Medawar Mutation Accumulation vs Williams Antagonistic Pleiotropy
// 2. Kirkwood Disposable Soma (Y-Model Energy Allocation)
// 3. Life Tables (l_x, m_x, R_0, Generation Time T, Intrinsic r, Type I/II/III)
// 4. Lack's Clutch Size (1947) & Cost of Reproduction
// 5. Semelparity vs Iteroparity (Cole 1954 / Charnov & Schaffer 1973)
// =============================================================================

export type SenescenceModel = 'mutation_acc' | 'antag_pleio';

export interface SenescenceResult {
  model: SenescenceModel;
  extrinsicMort: number;
  earlyFertility: number;
  lateSurvival: number;
  maxLifespanYr: number;
  selectionShadow: number[]; // Hamilton force of selection s(age) across 6 age classes
  cohortSurvival: number[];  // l_x across 6 age classes
}

export function evaluateSenescenceModel(
  model: SenescenceModel,
  extrinsicMort: number
): SenescenceResult {
  const m = Math.max(0.05, Math.min(0.65, extrinsicMort));
  const selectionShadow: number[] = [];
  const cohortSurvival: number[] = [];
  let lx = 1.0;

  // Antagonistic pleiotropy actively boosts early fertility (+28%) while accelerating late ageing!
  const earlyFertility = model === 'antag_pleio' ? 1.28 + m * 0.45 : 1.0;
  const intrinsicSlope = model === 'antag_pleio' ? 0.16 + m * 0.35 : 0.08 + m * 0.25;

  for (let age = 0; age < 6; age++) {
    cohortSurvival.push(lx);
    const force = Math.exp(-(m * 1.45 + intrinsicSlope * 0.5) * age);
    selectionShadow.push(force);
    const ageHaz = m + intrinsicSlope * Math.pow(age / 5, 2.2);
    lx = Math.max(0.02, lx * Math.exp(-ageHaz));
  }

  const maxLifespanYr = Math.max(1.2, 6.2 - m * 6.5 - (model === 'antag_pleio' ? 0.65 : 0));
  return {
    model,
    extrinsicMort: m,
    earlyFertility,
    lateSurvival: cohortSurvival[5]!,
    maxLifespanYr,
    selectionShadow,
    cohortSurvival,
  };
}

// -----------------------------------------------------------------------------
// 2. Kirkwood Disposable Soma (Y-Model Allocation)
// -----------------------------------------------------------------------------

export interface SomaResult {
  repairShare: number;   // 0.1..0.9 energy invested in DNA/somatic maintenance
  predationRisk: number; // 0.05..0.60 extrinsic hazard
  expectedLifespan: number;
  lifetimeFitnessW: number;
  optimalRepair: number;
}

export function evaluateDisposableSoma(
  repairShare: number,
  predationRisk: number
): SomaResult {
  const calcW = (s: number) => {
    const intrinsicHazard = 0.04 + 0.52 * Math.pow(1 - s, 2.1);
    const totalHazard = predationRisk + intrinsicHazard;
    const lifespan = 1 / Math.max(0.05, totalHazard);
    const reproRate = 4.2 * Math.pow(1 - s, 0.85);
    return { lifespan, w: lifespan * reproRate };
  };

  let optS = 0.5;
  let bestW = 0;
  for (let s = 0.05; s <= 0.92; s += 0.02) {
    const res = calcW(s);
    if (res.w > bestW) {
      bestW = res.w;
      optS = s;
    }
  }
  const cur = calcW(repairShare);
  return {
    repairShare,
    predationRisk,
    expectedLifespan: cur.lifespan,
    lifetimeFitnessW: cur.w,
    optimalRepair: optS,
  };
}

// -----------------------------------------------------------------------------
// 3. Life Tables (Type I, II, III Survivorship + R_0 & Euler-Lotka r)
// -----------------------------------------------------------------------------

export type SurvivorshipType = 'type1' | 'type2' | 'type3';

export interface LifeTableResult {
  type: SurvivorshipType;
  speciesLabel: string;
  lx: number[];
  mx: number[];
  r0: number;
  genTimeT: number;
  intrinsicR: number;
}

export function evaluateLifeTable(type: SurvivorshipType): LifeTableResult {
  const lx =
    type === 'type1'
      ? [1.0, 0.96, 0.91, 0.82, 0.56, 0.14]
      : type === 'type2'
        ? [1.0, 0.62, 0.38, 0.24, 0.15, 0.09]
        : [1.0, 0.08, 0.04, 0.03, 0.025, 0.02];

  const mx =
    type === 'type1'
      ? [0, 0.2, 0.7, 0.85, 0.45, 0.05]
      : type === 'type2'
        ? [0, 0.9, 1.35, 1.4, 1.2, 1.0]
        : [0, 0, 12, 24, 32, 36];

  let r0 = 0;
  let sumXLxMx = 0;
  for (let x = 0; x < lx.length; x++) {
    const prod = lx[x]! * mx[x]!;
    r0 += prod;
    sumXLxMx += (x + 1) * prod;
  }
  const genTimeT = sumXLxMx / Math.max(1e-6, r0);
  const intrinsicR = Math.log(Math.max(0.05, r0)) / Math.max(0.5, genTimeT);

  const speciesLabel =
    type === 'type1'
      ? 'Type I · Mammals / Opossums (Low juvenile loss, late senescence)'
      : type === 'type2'
        ? 'Type II · Songbirds / Lizards (Constant age-independent hazard)'
        : 'Type III · Oysters / Giant Kelp (Huge larval loss, resilient adults)';

  return { type, speciesLabel, lx, mx, r0, genTimeT, intrinsicR };
}

// -----------------------------------------------------------------------------
// 4. Lack's Clutch Size (1947) & Cost of Reproduction
// -----------------------------------------------------------------------------

export interface LackClutchResult {
  clutchSize: number;
  chickSurvival: number;
  fledglings: number;       // Single-season Lack payoff
  parentSurvival: number;   // Cost of reproduction lowers parent's next-year survival!
  lifetimeOutput: number;
  lackOptimum: number;
  lifetimeOptimum: number;
}

export function evaluateLackClutch(clutchSize: number): LackClutchResult {
  const calc = (n: number) => {
    const chickSurv = Math.max(0.08, 0.96 - 0.0115 * Math.pow(Math.max(0, n - 1), 1.95));
    const fledglings = n * chickSurv;
    const parentSurv = Math.max(0.12, 0.92 - 0.068 * n);
    // Lifetime expected fledglings includes expected future seasons if parent survives!
    const lifetime = fledglings * (1 + parentSurv * 2.1);
    return { chickSurv, fledglings, parentSurv, lifetime };
  };

  let lackOpt = 2;
  let maxF = 0;
  let lifeOpt = 2;
  let maxL = 0;
  for (let n = 2; n <= 10; n++) {
    const r = calc(n);
    if (r.fledglings > maxF) {
      maxF = r.fledglings;
      lackOpt = n;
    }
    if (r.lifetime > maxL) {
      maxL = r.lifetime;
      lifeOpt = n;
    }
  }

  const cur = calc(clutchSize);
  return {
    clutchSize,
    chickSurvival: cur.chickSurv,
    fledglings: cur.fledglings,
    parentSurvival: cur.parentSurv,
    lifetimeOutput: cur.lifetime,
    lackOptimum: lackOpt,
    lifetimeOptimum: lifeOpt,
  };
}

// -----------------------------------------------------------------------------
// 5. Semelparity vs Iteroparity (Charnov & Schaffer 1973 Resolution of Cole)
// -----------------------------------------------------------------------------

export interface ParityResult {
  adultSurvPa: number;
  juvSurvPj: number;
  extraEggsNeeded: number; // P_a / P_j extra offspring semelparous breeder needs to match iteroparity!
  favoured: 'semelparous' | 'iteroparous';
}

export function evaluateParity(adultSurvPa: number, juvSurvPj: number): ParityResult {
  // Charnov & Schaffer (1973): Semelparity beats iteroparity only if B_sem > B_iter + P_a / P_j!
  const extraEggsNeeded = adultSurvPa / Math.max(0.05, juvSurvPj);
  const semBonus = 4.5; // Realistic physiological bonus from big-bang fatal reproductive burst
  return {
    adultSurvPa,
    juvSurvPj,
    extraEggsNeeded,
    favoured: semBonus > extraEggsNeeded ? 'semelparous' : 'iteroparous',
  };
}
