// =============================================================================
// Chapter 18: Optimal Foraging & Marginal Value Theorem — Quantitative Math
// 1. Charnov (1976) Marginal Value Theorem (Playable Patch-Foraging & Tangent)
// 2. Optimal Diet Breadth & Zero-One Profitability Rule (Stephens & Krebs 1986)
// 3. Risk-Sensitive Foraging & Jensen's Inequality (Caraco et al. 1980)
// 4. Orians-Pearson (1979) Central-Place Load-Size Effect
// =============================================================================

/** Diminishing-returns cumulative nectar gain g(t) in a patch */
export function patchGain(t: number, gMax = 12, k = 0.42): number {
  return gMax * (1 - Math.exp(-k * Math.max(0, t)));
}

/** Instantaneous marginal intake rate g'(t) */
export function patchMarginalRate(t: number, gMax = 12, k = 0.42): number {
  return gMax * k * Math.exp(-k * Math.max(0, t));
}

export interface MvtOptimum {
  travelTime: number;
  gMax: number;
  optStayTime: number;   // t* where g'(t*) == g(t*) / (T_t + t*)
  optIntakeRate: number; // Maximum long-term rate E_max = g(t*) / (T_t + t*)
  optGainAtLeave: number;
}

/** Solves Charnov's MVT equation g'(t*) = g(t*) / (T_t + t*) numerically to high precision */
export function solveMvtOptimum(travelTime: number, gMax = 12, k = 0.42): MvtOptimum {
  let bestT = 1.0;
  let bestRate = 0;
  for (let t = 0.1; t <= 22; t += 0.05) {
    const rate = patchGain(t, gMax, k) / (travelTime + t);
    if (rate > bestRate) {
      bestRate = rate;
      bestT = t;
    }
  }
  return {
    travelTime,
    gMax,
    optStayTime: bestT,
    optIntakeRate: bestRate,
    optGainAtLeave: patchGain(bestT, gMax, k),
  };
}

// -----------------------------------------------------------------------------
// 2. Optimal Diet Breadth (Zero-One Rule, Stephens & Krebs 1986)
// -----------------------------------------------------------------------------

export interface DietResult {
  richEncounter: number; // lambda_1 (high-value prey/sec)
  poorEncounter: number; // lambda_2 (low-value prey/sec)
  richProfit: number;    // e1 / h1
  poorProfit: number;    // e2 / h2
  specialistRate: number;
  generalistRate: number;
  shouldSpecialize: boolean;
}

export function evaluateDietBreadth(richEncounter: number, poorEncounter: number): DietResult {
  const e1 = 10;
  const h1 = 2.0; // Profitability e1/h1 = 5.0 J/s
  const e2 = 3.0;
  const h2 = 2.5; // Profitability e2/h2 = 1.2 J/s

  const specialistRate = (richEncounter * e1) / (1 + richEncounter * h1);
  const generalistRate =
    (richEncounter * e1 + poorEncounter * e2) / (1 + richEncounter * h1 + poorEncounter * h2);

  // Zero-One Rule: include prey 2 iff e2/h2 > specialistRate (independent of lambda_2!)
  const shouldSpecialize = specialistRate > e2 / h2;

  return {
    richEncounter,
    poorEncounter,
    richProfit: e1 / h1,
    poorProfit: e2 / h2,
    specialistRate,
    generalistRate,
    shouldSpecialize,
  };
}

// -----------------------------------------------------------------------------
// 3. Risk-Sensitive Foraging (Caraco et al. 1980 — Jensen's Inequality)
// -----------------------------------------------------------------------------

export interface RiskResult {
  energyReserve: number; // 0..10 (survival threshold at 5.0!)
  threshold: number;
  safeSurvivalProb: number;
  riskySurvivalProb: number;
  optimalChoice: 'safe' | 'risky';
}

export function evaluateRiskForaging(energyReserve: number): RiskResult {
  // Both patches have IDENTICAL mean intake = +2.5!
  // Safe patch always pays +2.5. Risky patch pays 0 (50%) or +5.0 (50%).
  // Overnight survival threshold = 6.5 units!
  const threshold = 6.5;
  const safeEnd = energyReserve + 2.5;
  const riskyLow = energyReserve + 0.0;
  const riskyHigh = energyReserve + 5.0;

  // Smooth sigmoid survival curve centered on threshold
  const surv = (e: number) => 1 / (1 + Math.exp(-(e - threshold) * 2.4));
  const safeSurvivalProb = surv(safeEnd);
  const riskySurvivalProb = 0.5 * surv(riskyLow) + 0.5 * surv(riskyHigh);

  return {
    energyReserve,
    threshold,
    safeSurvivalProb,
    riskySurvivalProb,
    optimalChoice: riskySurvivalProb > safeSurvivalProb ? 'risky' : 'safe',
  };
}

// -----------------------------------------------------------------------------
// 4. Central-Place Foraging (Orians & Pearson 1979 — Load Size Effect)
// -----------------------------------------------------------------------------

export interface CentralPlaceResult {
  roundTripTime: number;
  optimalLoad: number;      // 1..7 grubs carried in beak!
  deliveryRate: number;     // grubs/min delivered to nestlings
}

export function evaluateCentralPlace(roundTripTime: number): CentralPlaceResult {
  // Loading curve has diminishing returns as beak fills up (handling each extra grub takes longer!)
  const loadingTime = (n: number) => 0.55 * Math.pow(n, 1.65);
  let bestN = 1;
  let bestRate = 0;
  for (let n = 1; n <= 7; n++) {
    const rate = n / (roundTripTime + loadingTime(n));
    if (rate > bestRate) {
      bestRate = rate;
      bestN = n;
    }
  }
  return {
    roundTripTime,
    optimalLoad: bestN,
    deliveryRate: bestRate * 60,
  };
}
