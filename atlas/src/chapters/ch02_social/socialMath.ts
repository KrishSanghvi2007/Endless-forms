export type ContestStrategy = 'hawk' | 'dove' | 'bourgeois';

/**
 * Hawk–Dove payoff matrix (Maynard Smith & Price 1973; Maynard Smith 1982).
 * V = resource value, C = injury cost.
 */
export function hawkDovePayoff(a: 'hawk' | 'dove', b: 'hawk' | 'dove', V: number, C: number): number {
  if (a === 'hawk' && b === 'hawk') return (V - C) / 2;
  if (a === 'hawk' && b === 'dove') return V;
  if (a === 'dove' && b === 'hawk') return 0;
  return V / 2;
}

/** 3-strategy payoff including Bourgeois (play Hawk if owner [50%], Dove if intruder [50%]) */
export function threeWayPayoff(a: ContestStrategy, b: ContestStrategy, V: number, C: number): number {
  if (a !== 'bourgeois' && b !== 'bourgeois') {
    return hawkDovePayoff(a, b, V, C);
  }
  if (a === 'bourgeois' && b === 'bourgeois') {
    // One is always owner (plays Hawk) and the other intruder (plays Dove) -> zero fights!
    return V / 2;
  }
  if (a === 'bourgeois' && b === 'hawk') {
    // 50% owner -> H vs H = (V-C)/2; 50% intruder -> D vs H = 0
    return 0.5 * ((V - C) / 2);
  }
  if (a === 'hawk' && b === 'bourgeois') {
    // 50% B is owner -> H vs H = (V-C)/2; 50% B is intruder -> H vs D = V
    return 0.5 * ((V - C) / 2) + 0.5 * V;
  }
  if (a === 'bourgeois' && b === 'dove') {
    // 50% owner -> H vs D = V; 50% intruder -> D vs D = V/2
    return 0.75 * V;
  }
  // a === 'dove' && b === 'bourgeois'
  // 50% B is owner -> D vs H = 0; 50% B is intruder -> D vs D = V/2
  return 0.25 * V;
}

/** Mixed ESS equilibrium Hawk fraction p* = min(1, V / C) */
export function hawkDoveEss(V: number, C: number): number {
  if (C <= 0) return 1;
  return Math.min(1, Math.max(0, V / C));
}

/** Expected fitnesses and mean population payoff in a 2-strategy Hawk–Dove population */
export function hawkDoveFitnesses(
  pHawk: number,
  V: number,
  C: number,
  baselineW0 = 10
): { wH: number; wD: number; wBar: number; allDovePayoff: number; essP: number } {
  const p = Math.max(0, Math.min(1, pHawk));
  const q = 1 - p;
  const eH = p * ((V - C) / 2) + q * V;
  const eD = q * (V / 2);
  const wH = Math.max(0.1, baselineW0 + eH);
  const wD = Math.max(0.1, baselineW0 + eD);
  const wBar = p * wH + q * wD;
  return {
    wH,
    wD,
    wBar,
    allDovePayoff: baselineW0 + V / 2,
    essP: hawkDoveEss(V, C),
  };
}

/** Discrete replicator step for 2-strategy Hawk–Dove */
export function stepHawkDove(pHawk: number, V: number, C: number, steps = 1): number {
  let p = Math.max(0.01, Math.min(0.99, pHawk));
  const w0 = Math.max(12, C * 0.75);
  for (let i = 0; i < steps; i++) {
    const { wH, wD, wBar } = hawkDoveFitnesses(p, V, C, w0);
    p = Math.max(0.005, Math.min(0.995, (p * wH) / wBar));
    if (Math.abs(wH - wD) < 1e-6) break;
  }
  return p;
}

/** Discrete replicator step for 3-strategy Hawk–Dove–Bourgeois */
export function stepThreeWay(
  freqs: [number, number, number], // [Hawk, Dove, Bourgeois]
  V: number,
  C: number,
  steps = 1
): { freqs: [number, number, number]; injuryRate: number; meanPayoff: number } {
  const strats: ContestStrategy[] = ['hawk', 'dove', 'bourgeois'];
  let f: [number, number, number] = [...freqs];
  const w0 = Math.max(14, C * 0.85);

  let meanPayoff = 0;
  for (let s = 0; s < steps; s++) {
    const pay = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      let e = 0;
      for (let j = 0; j < 3; j++) {
        e += f[j] * threeWayPayoff(strats[i], strats[j], V, C);
      }
      pay[i] = e;
    }
    const w = pay.map((e) => Math.max(0.1, w0 + e));
    const wBar = f[0] * w[0] + f[1] * w[1] + f[2] * w[2];
    meanPayoff = f[0] * pay[0] + f[1] * pay[1] + f[2] * pay[2];
    f = [
      (f[0] * w[0]) / wBar,
      (f[1] * w[1]) / wBar,
      (f[2] * w[2]) / wBar,
    ];
  }

  // Injury occurs on H-vs-H (pH^2) and 50% of H-vs-B / B-vs-H (pH*pB)
  const injuryRate = f[0] * f[0] + f[0] * f[2];
  return { freqs: f, injuryRate, meanPayoff };
}

/**
 * War of Attrition (Bishop & Cannings 1978; Maynard Smith 1982).
 * Payoff to choosing persistence t1 against t2 for resource value V (cost = 1 per time unit).
 */
export function warOfAttritionPayoff(t1: number, t2: number, V: number): number {
  if (Math.abs(t1 - t2) < 1e-6) return V / 2 - t1;
  if (t1 > t2) return V - t2;
  return -t1;
}

/** Analytical ESS exponential PDF p(t) = (1/V) exp(-t/V) */
export function warOfAttritionEssPdf(t: number, V: number): number {
  if (t < 0 || V <= 0) return 0;
  return (1 / V) * Math.exp(-t / V);
}

// =============================================================================
// KIN SELECTION: WRIGHT'S RELATEDNESS (r) & HAMILTON'S RULE (rB > C)
// =============================================================================

export type PedigreeRelationId =
  | 'parent_offspring'
  | 'full_sibs'
  | 'half_sibs'
  | 'grandparent'
  | 'first_cousins'
  | 'haplodiploid_sisters'
  | 'haplodiploid_brother';

export interface PedigreeRelationInfo {
  id: PedigreeRelationId;
  label: string;
  r: number;
  formulaText: string;
  explanation: string;
  haplodiploid?: boolean;
  /** Node indices in the 3D pedigree that are highlighted (actor, recipient, and shared ancestors) */
  actorNode: string;
  recipientNode: string;
  paths: { nodes: string[]; contribution: number; via: 'maternal' | 'paternal' | 'haploid_father' }[];
}

export const PEDIGREE_RELATIONS: Record<PedigreeRelationId, PedigreeRelationInfo> = {
  parent_offspring: {
    id: 'parent_offspring',
    label: 'Parent – Offspring',
    r: 0.5,
    formulaText: 'r = (½)¹ = 0.50',
    explanation:
      'A diploid parent passes exactly half of its alleles directly to each offspring along one path of length L = 1.',
    actorNode: 'M1',
    recipientNode: 'S1',
    paths: [{ nodes: ['M1', 'S1'], contribution: 0.5, via: 'maternal' }],
  },
  full_sibs: {
    id: 'full_sibs',
    label: 'Full Siblings',
    r: 0.5,
    formulaText: 'r = (½)² + (½)² = 0.25 + 0.25 = 0.50',
    explanation:
      'Full siblings connect through TWO independent length-2 paths—one via their mother (0.25) and one via their father (0.25).',
    actorNode: 'S1',
    recipientNode: 'S2',
    paths: [
      { nodes: ['S1', 'M1', 'S2'], contribution: 0.25, via: 'maternal' },
      { nodes: ['S1', 'F1', 'S2'], contribution: 0.25, via: 'paternal' },
    ],
  },
  half_sibs: {
    id: 'half_sibs',
    label: 'Half-Siblings',
    r: 0.25,
    formulaText: 'r = (½)² = 0.25',
    explanation:
      'Belding’s ground squirrel litters are often multiply sired (~78%!). Half-sibs share only their mother: one path of length 2 gives r = 0.25.',
    actorNode: 'S2',
    recipientNode: 'H1',
    paths: [{ nodes: ['S2', 'M1', 'H1'], contribution: 0.25, via: 'maternal' }],
  },
  grandparent: {
    id: 'grandparent',
    label: 'Grandparent – Grandchild',
    r: 0.25,
    formulaText: 'r = (½)² = 0.25',
    explanation:
      'Two meiotic steps separate a grandmother from her grandchild: (½) × (½) = 0.25.',
    actorNode: 'GM',
    recipientNode: 'S1',
    paths: [{ nodes: ['GM', 'M1', 'S1'], contribution: 0.25, via: 'maternal' }],
  },
  first_cousins: {
    id: 'first_cousins',
    label: 'First Cousins',
    r: 0.125,
    formulaText: 'r = (½)⁴ + (½)⁴ = 0.0625 + 0.0625 = 0.125',
    explanation:
      'First cousins connect through both shared grandparents via two paths of length 4: 1/16 + 1/16 = 1/8 (0.125).',
    actorNode: 'S1',
    recipientNode: 'C1',
    paths: [
      { nodes: ['S1', 'M1', 'GM', 'A1', 'C1'], contribution: 0.0625, via: 'maternal' },
      { nodes: ['S1', 'M1', 'GF', 'A1', 'C1'], contribution: 0.0625, via: 'paternal' },
    ],
  },
  haplodiploid_sisters: {
    id: 'haplodiploid_sisters',
    label: 'Haplodiploid Full Sisters',
    r: 0.75,
    formulaText: 'r = 0.25 (diploid mother) + 0.50 (haploid father) = 0.75',
    explanation:
      'In bees, wasps & ants, a haploid father has only one genome—so all daughters receive 100% identical paternal genes (contributing 0.50) plus 0.25 via their mother = 0.75!',
    haplodiploid: true,
    actorNode: 'S1',
    recipientNode: 'S2',
    paths: [
      { nodes: ['S1', 'M1', 'S2'], contribution: 0.25, via: 'maternal' },
      { nodes: ['S1', 'F1', 'S2'], contribution: 0.5, via: 'haploid_father' },
    ],
  },
  haplodiploid_brother: {
    id: 'haplodiploid_brother',
    label: 'Haplodiploid Sister → Brother',
    r: 0.25,
    formulaText: 'r = 0.25 (mother only — males have no father) = 0.25',
    explanation:
      'Crucial caveat (Boomsma 2009): a female is related by 0.75 to sisters, yet ONLY 0.25 to brothers—so average r to an equal-sex brood is STILL 0.50! Monogamy & ecology matter more than haplodiploidy alone.',
    haplodiploid: true,
    actorNode: 'S1',
    recipientNode: 'H1',
    paths: [{ nodes: ['S1', 'M1', 'H1'], contribution: 0.25, via: 'maternal' }],
  },
};

/**
 * Hamilton's rule alarm-call allele trajectory (Page 5).
 * Caller allele (A) pays personal mortality cost C while granting survival benefit B
 * to nearby burrow neighbours whose mean relatedness is r.
 * Selection differential on inclusive fitness = rB - C.
 */
export function simulateHamiltonTrajectory(
  startP: number,
  r: number,
  B: number,
  C: number,
  gens = 24
): { gen: number; pCaller: number }[] {
  const out: { gen: number; pCaller: number }[] = [];
  let p = Math.max(0.02, Math.min(0.98, startP));
  const net = r * B - C;
  const w0 = 2.0;

  for (let g = 0; g <= gens; g++) {
    out.push({ gen: g, pCaller: p });
    // Price-equation / weak-selection inclusive-fitness recursion: Δp = p(1-p)(rB - C) / wBar
    const wCaller = Math.max(0.2, w0 + net);
    const wSilent = w0;
    const wBar = p * wCaller + (1 - p) * wSilent;
    p = Math.max(0.005, Math.min(0.995, (p * wCaller) / wBar));
  }
  return out;
}
