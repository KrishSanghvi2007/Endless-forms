// =============================================================================
// Chapter 16: The Clinic & Human Origins — Quantitative Applied & Human Evo Math
// 1. Antibiotic MIC / MPC Mutant-Selection Window (Drlica 2003; Read et al. 2011)
// 2. Conjugative R-Plasmid Horizontal Gene Transfer
// 3. Clonal Cancer Evolution & Competitive Release vs Adaptive Therapy (Gatenby 2009)
// 4. Hominin Cranial Morphometrics (Branching Bush, NOT Linear March)
// 5. Out-of-Africa Serial Founder Decay, Archaic Admixture & AMOVA (~85% Within-Pop)
// =============================================================================

export interface MicResult {
  dose: number;
  mic: number;
  mpc: number;
  zone: 'below_mic' | 'msw' | 'above_mpc';
  wtGrowth: number;
  mutGrowth: number;
  resistantFractionEnd: number;
  wtSeries: number[];
  mutSeries: number[];
  stewardshipNote: string;
}

export function simulateMicMpc(dose: number): MicResult {
  const mic = 2.0; // ug/mL wild-type MIC
  const mpc = 12.0; // ug/mL first-step mutant prevention concentration
  const zone: MicResult['zone'] =
    dose < mic ? 'below_mic' : dose <= mpc ? 'msw' : 'above_mpc';

  // Hill-function pharmacodynamics (net growth rate per hour)
  const hill = (c: number, ec50: number, maxR: number) =>
    maxR - (maxR + 0.55) * (Math.pow(c, 2.2) / (Math.pow(c, 2.2) + Math.pow(ec50, 2.2)));

  const wtGrowth = hill(dose, mic * 0.85, 0.52);
  // Single-step resistant mutant pays an 8% fitness cost at C=0, but resists up to MPC!
  const mutGrowth = hill(dose, mpc * 0.85, 0.46);

  const wtSeries: number[] = [];
  const mutSeries: number[] = [];
  let wt = 0.985;
  let mut = 0.015;
  for (let t = 0; t <= 24; t++) {
    wtSeries.push(wt);
    mutSeries.push(mut);
    const total = wt + mut;
    const crowding = Math.max(0, 1 - total * 0.85);
    const dWt = wt * (wtGrowth > 0 ? wtGrowth * crowding : wtGrowth) * 0.35;
    const dMut = mut * (mutGrowth > 0 ? mutGrowth * crowding : mutGrowth) * 0.35;
    wt = Math.max(0.0005, Math.min(1.0, wt + dWt));
    mut = Math.max(0.0005, Math.min(1.0, mut + dMut));
  }

  const endTot = wtSeries[wtSeries.length - 1]! + mutSeries[mutSeries.length - 1]!;
  const resistantFractionEnd = mutSeries[mutSeries.length - 1]! / Math.max(1e-6, endTot);

  const stewardshipNote =
    zone === 'below_mic'
      ? 'Below MIC: wild-type grows faster than the costly resistant mutant, so resistance stays rare — yet infection is untreated.'
      : zone === 'msw'
        ? 'Inside the Mutant-Selection Window (MIC < C < MPC): drug kills wild-type competitors while single-step mutants thrive — maximally selecting for resistance!'
        : 'Above MPC: suppresses single-step mutants too — BUT real stewardship must also weigh host toxicity, dormant persister cells, microbiome collateral damage, and pre-existing multi-drug clones (Day & Read 2016).';

  return {
    dose,
    mic,
    mpc,
    zone,
    wtGrowth,
    mutGrowth,
    resistantFractionEnd,
    wtSeries,
    mutSeries,
    stewardshipNote,
  };
}

// -----------------------------------------------------------------------------
// 2. Conjugative R-Plasmid Horizontal Gene Transfer (HGT)
// -----------------------------------------------------------------------------

export interface HgtResult {
  conjugationRate: number;
  antibioticPressure: number;
  plasmidCost: number;
  plasmidSeries: number[];
  finalPlasmidFreq: number;
  transferProgress: number; // 0..1 visual indicator
}

export function simulatePlasmidHgt(
  conjugationRate: number,
  antibioticPressure: number,
  plasmidCost: number
): HgtResult {
  const plasmidSeries: number[] = [];
  let p = 0.06; // Initial 6% plasmid-bearing donors (F+ / R-plasmid)
  for (let gen = 0; gen <= 30; gen++) {
    plasmidSeries.push(p);
    // Horizontal transfer + vertical selection advantage minus carriage cost
    const hgtGain = conjugationRate * 0.38 * p * (1 - p);
    const selNet = (antibioticPressure * 0.45 - plasmidCost) * p * (1 - p);
    p = Math.max(0.005, Math.min(0.995, p + hgtGain + selNet));
  }
  return {
    conjugationRate,
    antibioticPressure,
    plasmidCost,
    plasmidSeries,
    finalPlasmidFreq: plasmidSeries[plasmidSeries.length - 1]!,
    transferProgress: Math.min(1, conjugationRate * 0.7 + antibioticPressure * 0.35),
  };
}

// -----------------------------------------------------------------------------
// 3. Clonal Evolution of Cancer & Adaptive Therapy
// -----------------------------------------------------------------------------

export type TherapyMode = 'mtd' | 'adaptive' | 'untreated';

export interface CancerResult {
  mode: TherapyMode;
  sensitiveSeries: number[];
  resistantSeries: number[];
  totalSeries: number[];
  drugOnSeries: boolean[];
  relapseStep: number | null;
  finalResistantShare: number;
  finalBurden: number;
}

export function simulateCancerClones(mode: TherapyMode, initResistant = 0.04): CancerResult {
  const sensitiveSeries: number[] = [];
  const resistantSeries: number[] = [];
  const totalSeries: number[] = [];
  const drugOnSeries: boolean[] = [];

  let s = 0.62;
  let r = initResistant;
  let drugOn = mode === 'mtd' || mode === 'adaptive';
  let relapseStep: number | null = null;

  for (let step = 0; step <= 48; step++) {
    const tot = s + r;
    sensitiveSeries.push(s);
    resistantSeries.push(r);
    totalSeries.push(tot);
    drugOnSeries.push(drugOn);

    if (relapseStep === null && step > 4 && tot > 0.88) {
      relapseStep = step;
    }

    if (mode === 'untreated') {
      drugOn = false;
    } else if (mode === 'mtd') {
      drugOn = true;
    } else {
      // Evolutionary Adaptive Therapy (Gatenby et al. 2009):
      // Pulse OFF below 0.36 to let drug-sensitive cells rebound and suppress R!
      if (tot < 0.36) drugOn = false;
      else if (tot > 0.68) drugOn = true;
    }

    const crowding = Math.max(-0.2, 1 - (s + 1.05 * r));
    // Sensitive clone grows faster (0.36) when untreated, killed strongly (-0.52) when drugOn
    const dS = drugOn ? -0.52 * s : 0.38 * s * crowding;
    // Resistant clone pays efflux/metabolic cost (0.20) and is strongly suppressed by S competition!
    const dR = 0.21 * r * (1 - (1.28 * s + r));

    s = Math.max(0.001, Math.min(1.0, s + dS * 0.45));
    r = Math.max(0.001, Math.min(1.0, r + dR * 0.45));
  }

  const lastS = sensitiveSeries[sensitiveSeries.length - 1]!;
  const lastR = resistantSeries[resistantSeries.length - 1]!;
  return {
    mode,
    sensitiveSeries,
    resistantSeries,
    totalSeries,
    drugOnSeries,
    relapseStep,
    finalResistantShare: lastR / Math.max(1e-6, lastS + lastR),
    finalBurden: lastS + lastR,
  };
}

// -----------------------------------------------------------------------------
// 4. Hominin Cranial Evolution (Branching Bush — 4 Key Fossil Taxa)
// -----------------------------------------------------------------------------

export interface HomininTaxon {
  id: 'afarensis' | 'erectus' | 'neanderthal' | 'sapiens';
  stage: number; // 0..1 morph driver
  species: string;
  ageLabel: string;
  cranialCc: number;
  eq: number; // Encephalization Quotient
  browLabel: string;
  chinLabel: string;
  bushNote: string;
}

export const HOMININ_TAXA: HomininTaxon[] = [
  {
    id: 'afarensis',
    stage: 0.0,
    species: 'Australopithecus afarensis',
    ageLabel: '3.9 – 2.9 Ma (East Africa)',
    cranialCc: 430,
    eq: 2.5,
    browLabel: 'Pronounced supraorbital ridge, post-orbital constriction',
    chinLabel: 'Prognathic lower face, receding symphysis (no chin)',
    bushNote: 'Habitual biped ("Lucy" & Laetoli footprints) long BEFORE large brains evolved — mosaic evolution!',
  },
  {
    id: 'erectus',
    stage: 0.36,
    species: 'Homo erectus',
    ageLabel: '1.9 Ma – 110 ka (Africa → Eurasia)',
    cranialCc: 950,
    eq: 4.1,
    browLabel: 'Thick projecting supraorbital torus & low cranial vault',
    chinLabel: 'Reduced jaw prognathism; still lacks modern mental eminence',
    bushNote: 'First hominin to disperse widely beyond Africa (Dmanisi, Java, Zhoukoudian); persisted over 1.7 Myr alongside younger lineages.',
  },
  {
    id: 'neanderthal',
    stage: 0.68,
    species: 'Homo neanderthalensis',
    ageLabel: '400 – 40 ka (Europe & W. Asia)',
    cranialCc: 1500,
    eq: 5.2,
    browLabel: 'Double-arched brow ridge, mid-facial projection & occipital bun',
    chinLabel: 'Large robust mandible without a projecting chin',
    bushNote: 'A SISTER lineage — NOT our ancestor! Coexisted and interbred with early Homo sapiens in Eurasia (~2% archaic ancestry today).',
  },
  {
    id: 'sapiens',
    stage: 1.0,
    species: 'Homo sapiens',
    ageLabel: '315 ka (Jebel Irhoud) – Present',
    cranialCc: 1350,
    eq: 5.8,
    browLabel: 'High globular braincase, vertical forehead, minimal brow ridge',
    chinLabel: 'Retracted orthognathic face tucked under braincase + true chin',
    bushNote: 'Evolved across a pan-African braided network, later dispersing globally and admixing with Neanderthals & Denisovans.',
  },
];

// -----------------------------------------------------------------------------
// 5. Out of Africa, Archaic Admixture & Clinal Human Genetic Variation
// -----------------------------------------------------------------------------

export interface OoaRegion {
  name: string;
  distKm: number; // Waypoint overland distance from East Africa (Ramachandran et al. 2005)
  heterozygosity: number;
  neanderthalPct: number;
  denisovanPct: number;
}

export const OOA_REGIONS: OoaRegion[] = [
  { name: 'East & Southern Africa', distKm: 0, heterozygosity: 0.775, neanderthalPct: 0.3, denisovanPct: 0.0 },
  { name: 'Levant & Middle East', distKm: 4200, heterozygosity: 0.735, neanderthalPct: 1.9, denisovanPct: 0.1 },
  { name: 'Europe', distKm: 6800, heterozygosity: 0.718, neanderthalPct: 2.1, denisovanPct: 0.1 },
  { name: 'East Asia', distKm: 11200, heterozygosity: 0.692, neanderthalPct: 2.4, denisovanPct: 0.2 },
  { name: 'Oceania / Melanesia', distKm: 14500, heterozygosity: 0.664, neanderthalPct: 2.1, denisovanPct: 4.2 },
  { name: 'The Americas', distKm: 22400, heterozygosity: 0.618, neanderthalPct: 2.2, denisovanPct: 0.2 },
];

export interface OoaResult {
  distanceKm: number;
  expectedHe: number;
  withinPopPct: number;
  betweenLocalPct: number;
  betweenContinentPct: number;
  neanderthalPct: number;
  denisovanPct: number;
}

export function computeOoaClinal(distanceKm: number, includeAdmixture: boolean): OoaResult {
  // Serial founder linear decay (Ramachandran et al. 2005, PNAS: r = -0.87)
  const expectedHe = Math.max(0.58, 0.775 - 0.000007 * distanceKm);
  const neanderthalPct = includeAdmixture ? (distanceKm < 1500 ? 0.3 : 2.1) : 0;
  const denisovanPct = includeAdmixture ? (distanceKm > 12500 && distanceKm < 16500 ? 4.2 : distanceKm < 1500 ? 0.0 : 0.2) : 0;

  return {
    distanceKm,
    expectedHe,
    // Lewontin (1972) / Rosenberg et al. (2002) AMOVA partitioning across global loci:
    withinPopPct: 86.2,
    betweenLocalPct: 6.4,
    betweenContinentPct: 7.4,
    neanderthalPct,
    denisovanPct,
  };
}
