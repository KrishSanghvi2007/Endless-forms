// =============================================================================
// Chapter 17: The Price Equation, Fisher's Theorem & The Commons
// Exact Quantitative Population & Multilevel Selection Math
// =============================================================================

export interface HaystackGroup {
  id: number;
  coopCount: number;
  cheatCount: number;
  startFreq: number;
  endFreq: number;
  groupFitness: number;
}

export interface CommonsResult {
  foundersK: number;
  floodGens: number;
  groups: HaystackGroup[];
  globalStartP: number;
  globalEndP: number;
  deltaP: number;
  betweenTerm: number; // Cov(W_g, p_g) / W_bar
  withinTerm: number;  // E(W_g * delta_p_g) / W_bar
  simpsonParadox: boolean;
}

/**
 * Maynard Smith (1964) Haystack Model + Exact Price (1970) Multilevel Decomposition:
 *   W_bar * delta_p = Cov(W_g, p_g) + E(W_g * delta_p_g)
 */
export function simulateHaystackCommons(
  foundersK: number,
  floodGens: number,
  globalStartP = 0.5
): CommonsResult {
  const k = Math.max(1, Math.min(8, Math.round(foundersK)));
  const gens = Math.max(1, Math.min(12, Math.round(floodGens)));

  // Create 6 deterministic binomial-representative haystacks whose average matches globalStartP
  const nGroups = 6;
  const startFracs: number[] = [];
  if (k === 1) {
    // Pure clonal haystacks! Maximal between-group variance -> cooperators thrive!
    startFracs.push(1, 1, 1, 0, 0, 0);
  } else if (k === 2) {
    startFracs.push(1, 1, 0.5, 0.5, 0, 0);
  } else if (k <= 4) {
    startFracs.push(1, 0.75, 0.5, 0.5, 0.25, 0);
  } else {
    // Large founder groups -> little between-group variance (approaches well-mixed pool)
    startFracs.push(0.67, 0.58, 0.5, 0.5, 0.42, 0.33);
  }

  // Scale slightly if user shifts globalStartP
  const shift = globalStartP - 0.5;
  const groups: HaystackGroup[] = startFracs.map((rawF, idx) => {
    const p0 = Math.max(0, Math.min(1, rawF + shift));
    let coop = p0 * k;
    let cheat = (1 - p0) * k;

    for (let g = 0; g < gens; g++) {
      const tot = coop + cheat;
      if (tot <= 0) break;
      const fCoop = coop / tot;
      // Cooperators produce a public good (+1.45 * fCoop) at personal cost c = 0.14!
      // Inside every mixed group, cheaters grow faster than cooperators by +0.14 per gen.
      const rCoop = 1.0 + 1.45 * fCoop - 0.14;
      const rCheat = 1.0 + 1.45 * fCoop;
      // Soft carrying capacity per haystack so groups don't explode numerically
      const capFactor = 1 / (1 + tot / 140);
      coop *= 1 + (rCoop - 1) * capFactor;
      cheat *= 1 + (rCheat - 1) * capFactor;
    }

    const endTot = coop + cheat;
    const p1 = endTot > 0 ? coop / endTot : p0;
    const Wg = endTot / k; // Per-founder relative reproductive output of haystack g!

    return {
      id: idx,
      coopCount: coop,
      cheatCount: cheat,
      startFreq: p0,
      endFreq: p1,
      groupFitness: Wg,
    };
  });

  const Wbar = groups.reduce((s, g) => s + g.groupFitness, 0) / nGroups;
  const pBar0 = groups.reduce((s, g) => s + g.startFreq, 0) / nGroups;
  const pBar1 = groups.reduce((s, g) => s + g.groupFitness * g.endFreq, 0) / (nGroups * Wbar);

  // Exact Price Equation components:
  // Between-group = Cov(W_g, p_g) / W_bar
  const cov =
    groups.reduce((s, g) => s + (g.groupFitness - Wbar) * (g.startFreq - pBar0), 0) / nGroups;
  const betweenTerm = cov / Math.max(1e-6, Wbar);

  // Within-group = E(W_g * delta_p_g) / W_bar
  const expWithin =
    groups.reduce((s, g) => s + g.groupFitness * (g.endFreq - g.startFreq), 0) / nGroups;
  const withinTerm = expWithin / Math.max(1e-6, Wbar);

  const deltaP = pBar1 - pBar0;
  const anyMixedDeclined = groups.some((g) => g.startFreq > 0 && g.startFreq < 1 && g.endFreq < g.startFreq);
  const simpsonParadox = deltaP > 0.005 && anyMixedDeclined;

  return {
    foundersK: k,
    floodGens: gens,
    groups,
    globalStartP: pBar0,
    globalEndP: pBar1,
    deltaP,
    betweenTerm,
    withinTerm,
    simpsonParadox,
  };
}

// -----------------------------------------------------------------------------
// 3. Fisher's Fundamental Theorem of Natural Selection (FTNS)
// -----------------------------------------------------------------------------

export interface FtnsResult {
  initVA: number;
  envDecay: number;
  vaSeries: number[];
  partialFitnessSeries: number[]; // Partial change due to NS alone (always >= 0!)
  totalFitnessSeries: number[];   // Realized mean fitness including environmental deterioration
  deltaW0: number;                // Exact initial FTNS step: V_A / w_bar
}

export function simulateFisherFtns(initVA: number, envDecay: number): FtnsResult {
  const vaSeries: number[] = [];
  const partialFitnessSeries: number[] = [];
  const totalFitnessSeries: number[] = [];

  let va = initVA;
  let wPartial = 1.0;
  let wTotal = 1.0;

  for (let gen = 0; gen <= 16; gen++) {
    vaSeries.push(va);
    partialFitnessSeries.push(wPartial);
    totalFitnessSeries.push(wTotal);

    const dWns = va / Math.max(0.2, wPartial); // Exact Fisher FTNS: V_A(w) / w_bar
    wPartial += dWns;
    wTotal = Math.max(0.35, wTotal + dWns - envDecay);
    // Directional selection consumes additive genetic variance V_A each generation!
    va *= 0.80;
  }

  return {
    initVA,
    envDecay,
    vaSeries,
    partialFitnessSeries,
    totalFitnessSeries,
    deltaW0: initVA / 1.0,
  };
}

// -----------------------------------------------------------------------------
// 4. Hamilton's Rule Derived from the Price Equation (rB - C > 0)
// -----------------------------------------------------------------------------

export interface HamiltonPriceResult {
  r: number; // Regression slope Cov(G', G) / Var(G)
  B: number;
  C: number;
  inclusivePayoff: number; // r*B - C
  spreads: boolean;
}

export function evaluateHamiltonFromPrice(r: number, B: number, C: number): HamiltonPriceResult {
  const inclusivePayoff = r * B - C;
  return {
    r,
    B,
    C,
    inclusivePayoff,
    spreads: inclusivePayoff > 0,
  };
}

// -----------------------------------------------------------------------------
// 5. Weak Altruism vs Strong Altruism (Group Size k & Assortment r)
// -----------------------------------------------------------------------------

export interface WeakStrongResult {
  groupSizeK: number;
  assortmentR: number;
  benefitB: number;
  costC: number;
  selfReturn: number;      // b / k
  netSelfPayoff: number;   // b/k - c  (>0 => Weak Altruism / Self-benefiting!)
  totalRule: number;       // (b/k) + r * b * (k-1)/k - c
  category: 'weak_spreads' | 'strong_spreads' | 'fails';
}

export function evaluateWeakVsStrong(
  groupSizeK: number,
  assortmentR: number,
  benefitB = 1.2,
  costC = 0.35
): WeakStrongResult {
  const k = Math.max(2, Math.round(groupSizeK));
  const selfReturn = benefitB / k;
  const netSelfPayoff = selfReturn - costC;
  const totalRule = selfReturn + assortmentR * benefitB * ((k - 1) / k) - costC;

  let category: WeakStrongResult['category'] = 'fails';
  if (totalRule > 0) {
    category = netSelfPayoff > 0 ? 'weak_spreads' : 'strong_spreads';
  }

  return {
    groupSizeK: k,
    assortmentR,
    benefitB,
    costC,
    selfReturn,
    netSelfPayoff,
    totalRule,
    category,
  };
}
