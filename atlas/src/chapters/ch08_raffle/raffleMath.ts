// =============================================================================
// Chapter 8: Sex, Choice & Slow Islands — Sexual Selection & Life History Math
// =============================================================================

export interface BatemanResult {
  osr: number; // Operational Sex Ratio (receptive males per receptive female, 0.3..4.0)
  maleSlope: number; // Bateman gradient (offspring gained per additional mate)
  femaleSlope: number;
  maleVarRatio: number; // Variance in male mating success / female variance
  roleReversal: boolean;
}

/**
 * Models anisogamy, Operational Sex Ratio (OSR), and Bateman gradients.
 * When OSR > 1 (classic male-biased), males compete steeply; when OSR < 1 (e.g. pipefish / seahorses
 * where paternal brooding limits male availability), sexual selection reverses!
 */
export function computeBateman(osr: number): BatemanResult {
  const roleReversal = osr < 0.85;
  const maleSlope = Math.min(2.4, Math.max(0.25, 0.85 * Math.pow(osr, 0.65)));
  const femaleSlope = Math.min(2.2, Math.max(0.18, 0.85 * Math.pow(1 / osr, 0.65)));
  const maleVarRatio = Math.pow(osr, 1.35);
  return { osr, maleSlope, femaleSlope, maleVarRatio, roleReversal };
}

export interface GuppySelectionResult {
  predation: number; // 0 (low-predation headwater) .. 1 (high-predation pike-cichlid pool)
  femalePreference: number; // 0.2 .. 1.0
  eqOrange: number; // Equilibrium male orange score (0.1 .. 0.95)
  eqTail: number; // Equilibrium tail length multiplier
  survivalRate: number;
  matingAdvantage: number;
}

/**
 * Endler (1980) Trinidadian Aripo guppy trade-off:
 * Female choice selects FOR bright orange carotenoid spots & long tails,
 * while predatory pike-cichlids (Crenicichla alta) select AGAINST conspicuous males.
 */
export function computeGuppyBalance(
  predation: number,
  femalePreference: number
): GuppySelectionResult {
  const netForce = femalePreference * 0.95 - predation * 0.82;
  const eqOrange = Math.max(0.12, Math.min(0.95, 0.52 + netForce * 0.65));
  const eqTail = 0.82 + eqOrange * 0.85;
  const survivalRate = Math.max(0.18, 0.94 - predation * (0.25 + eqOrange * 0.52));
  const matingAdvantage = 1 + femalePreference * eqOrange * 1.4;
  return { predation, femalePreference, eqOrange, eqTail, survivalRate, matingAdvantage };
}

export interface SpermRaffleResult {
  copulationMinutes: number; // 10 .. 70 min (Parker 1970 yellow dung fly)
  p2Paternity: number; // Fraction of eggs fertilized by 2nd male (0 .. 0.96)
  marginalRate: number; // Eggs gained per minute including search time (156 min)
  optimalMinutes: number; // Parker's MVT optimum (~41 min!)
}

/**
 * Parker (1970) Marginal Value Theorem & Sperm Competition Raffle in Scathophaga stercoraria:
 * Fertilization gain follows P2(t) = 1 - exp(-t / 24), with mean inter-patch search time S = 156 min.
 */
export function computeSpermRaffle(copulationMinutes: number): SpermRaffleResult {
  const t = Math.max(5, Math.min(80, copulationMinutes));
  const p2Paternity = 1 - Math.exp(-t / 22.5);
  const searchTime = 156;
  const marginalRate = (p2Paternity * 100) / (t + searchTime);
  return { copulationMinutes: t, p2Paternity, marginalRate, optimalMinutes: 41 };
}

export interface FisherRatioResult {
  maleFraction: number; // Current population fraction of sons (0.1 .. 0.9)
  sonPayoff: number; // Expected grand-offspring per son (proportional to N_f / N_m)
  daughterPayoff: number; // Expected grand-offspring per daughter
  nextGenMaleFraction: number;
}

/**
 * Fisher (1930) Frequency-Dependent Sex-Ratio Equilibrium:
 * Because every diploid offspring has one father and one mother, the rarer sex enjoys
 * strictly higher per-capita reproductive value, driving parental investment back to 50:50.
 */
export function computeFisherSexRatio(maleFraction: number): FisherRatioResult {
  const m = Math.max(0.1, Math.min(0.9, maleFraction));
  const f = 1 - m;
  const sonPayoff = 0.5 / m;
  const daughterPayoff = 0.5 / f;
  // Selection pulls next generation sharply back toward 0.50
  const nextGenMaleFraction = m + (0.5 - m) * 0.55;
  return { maleFraction: m, sonPayoff, daughterPayoff, nextGenMaleFraction };
}

export interface SenescenceResult {
  extrinsicMortality: number; // Annual predation mortality (0.05 Sapelo Island .. 0.65 Mainland)
  selectionForceByAge: number[]; // Hamilton's force of selection at ages 1..6
  evolvedLifespanYrs: number;
  ageFirstReproductionMo: number;
  litterSize: number;
}

/**
 * Austad (1993) Sapelo Island vs. Mainland Virginia Opossums & Hamilton (1966) Force of Selection:
 * Higher extrinsic mortality causes survivorship l(x) to plummet early, weakening selection against
 * late-acting deleterious mutations (Medawar) and favoring early reproduction at the expense of repair (Williams).
 */
export function computeSenescence(extrinsicMortality: number): SenescenceResult {
  const mu = Math.max(0.05, Math.min(0.75, extrinsicMortality));
  const selectionForceByAge: number[] = [];
  for (let age = 1; age <= 6; age++) {
    // Survival probability l(x) = exp(-mu * (age - 1))
    const l = Math.exp(-mu * 1.65 * (age - 1));
    selectionForceByAge.push(Math.max(0.03, l));
  }
  const evolvedLifespanYrs = 4.2 - mu * 3.1; // ~3.9 yr Sapelo Island vs ~1.9 yr Mainland
  const ageFirstReproductionMo = Math.round(13 - mu * 6.5);
  const litterSize = Number((5.2 + mu * 4.5).toFixed(1));
  return {
    extrinsicMortality: mu,
    selectionForceByAge,
    evolvedLifespanYrs,
    ageFirstReproductionMo,
    litterSize,
  };
}

export interface AnisogamyOriginResult {
  zygoteSteepness: number; // PBS exponent beta: <=1 favors isogamy, >1 triggers disruptive split into tiny sperm + huge eggs!
  isAnisogamous: boolean;
  summary: string;
}

/**
 * Parker, Baker & Smith (1972) Disruptive Selection Evolution of Anisogamy from Isogamy:
 * Under a fixed gamete resource budget M = n*m, when zygote survival scales steeply with
 * total volume S(v) ~ v^beta (beta > 1), intermediate gametes are outcompeted by both tiny
 * abundant microgametes (sperm) and huge well-provisioned macrogametes (eggs)!
 */
export function computeParkerAnisogamy(zygoteSteepness: number): AnisogamyOriginResult {
  const b = Math.max(0.5, Math.min(2.4, zygoteSteepness));
  const isAnisogamous = b > 1.15;
  return {
    zygoteSteepness: b,
    isAnisogamous,
    summary: isAnisogamous
      ? `Disruptive Selection Active (β = ${b.toFixed(1)} > 1): Intermediate isogametes lose to BOTH tiny abundant sperm AND large nutrient-rich eggs — splitting ancestral isogamy into two sexes (Parker–Baker–Smith 1972)!`
      : `Isogamy Stable (β = ${b.toFixed(1)} ≤ 1): Mild size-survival scaling keeps equal-sized gametes (e.g., unicellular green algae Chlamydomonas) stable.`,
  };
}

export interface LmcResult {
  foundressN: number; // Number of mother fig wasps laying eggs inside one syconium (1..20)
  optimalSonFrac: number; // Hamilton (1967): (n - 1) / (2n)
  summary: string;
}

/**
 * Hamilton (1967) Local Mate Competition (LMC) in Fig Wasps:
 * When brothers mate solely with sisters inside a closed fig, producing excess sons wastes
 * resources on brother–brother competition! Optimal son fraction = (n - 1) / (2n).
 */
export function computeHamiltonLmc(foundressN: number): LmcResult {
  const n = Math.max(1, Math.min(20, Math.round(foundressN)));
  const raw = (n - 1) / (2 * n);
  const optimalSonFrac = n === 1 ? 0.08 : raw; // 1 foundress still needs a few sons (~8%) to fertilize all sisters!
  return {
    foundressN: n,
    optimalSonFrac,
    summary:
      n === 1
        ? 'Single Fig-Wasp Foundress (n = 1): Brothers only compete against EACH OTHER! Selection favours ~92% daughters & just enough sons (~8%) to fertilize sisters (Hamilton 1967 LMC)!'
        : `Foundresses n = ${n}: Hamilton’s LMC optimal son fraction (n−1)/(2n) = ${(optimalSonFrac * 100).toFixed(1)}% — converging smoothly back to Fisher’s 50% as n → ∞!`,
  };
}
