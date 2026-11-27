// =============================================================================
// Chapter 22: Genomic Conflict & Selfish Elements — Quantitative Models
// 1. Meiotic Drive / Centromere Drive (Segregation Distortion k vs Cost s)
// 2. CRISPR Homing Gene Drive & NHEJ Resistance Escape (D, W, R trajectories)
// 3. Transposon Copy-Paste Load & C-Value Paradox (Charlesworth & Langley)
// 4. Gene Duplication Fates (Ohno 1970 & Force et al. 1999 DDC Subfunctionalization)
// 5. Parent-Offspring Conflict (Trivers 1974) & Genomic Imprinting (Haig 1993)
// =============================================================================

export interface MeioticDriveResult {
  k: number; // heterozygote transmission rate (0.5 = fair Mendel, 0.95 = strong drive)
  s: number; // homozygote DD viability cost (0..1, where 1 = recessive lethal like mouse t-haplotype)
  invades: boolean;
  equilibriumP: number;
  traj: number[]; // 30-generation trajectory starting from p0 = 0.05
  summary: string;
}

export function simulateMeioticDrive(k: number, s: number): MeioticDriveResult {
  const traj: number[] = [];
  let p = 0.05;
  const wDD = Math.max(0, 1 - s);
  const wDd = 1.0; // recessive homozygote cost
  const wdd = 1.0;

  for (let g = 0; g < 30; g++) {
    traj.push(p);
    const q = 1 - p;
    const fDD = p * p * wDD;
    const fDd = 2 * p * q * wDd;
    const fdd = q * q * wdd;
    const wBar = fDD + fDd + fdd;
    if (wBar <= 1e-9) break;
    // Gametes produced by survivors: DD -> 100% D; Dd -> k fraction D!
    p = Math.min(1, Math.max(0, (fDD + k * fDd) / wBar));
  }

  const eq = traj[traj.length - 1] ?? 0;
  const invades = 2 * k > 1.001;
  let summary = '';
  if (k <= 0.505) {
    summary =
      s > 0.05
        ? 'Fair Mendelian meiosis (k = 0.50): natural selection purges the costly D allele!'
        : 'Fair Mendelian meiosis (k = 0.50) & neutral fitness: allele frequency stays near starting p₀.';
  } else if (s >= 0.95) {
    summary = `Even though DD is LETHAL (s = ${s.toFixed(2)}), drive (k = ${k.toFixed(2)}) pushes D to a stable polymorphism p* ≈ ${eq.toFixed(2)} — just like the mouse t-haplotype!`;
  } else if (eq > 0.96) {
    summary = `Selfish drive (k = ${k.toFixed(2)}) OVERPOWERS viability cost (s = ${s.toFixed(2)}) and fixes D at p* ≈ ${eq.toFixed(2)} — dragging population fitness down!`;
  } else {
    summary = `Tug-of-war balance: meiotic drive pushes D up while homozygote cost holds it at stable equilibrium p* ≈ ${eq.toFixed(2)}.`;
  }

  return { k, s, invades, equilibriumP: eq, traj, summary };
}

// -----------------------------------------------------------------------------
// 2. CRISPR Homing Gene Drive & NHEJ Resistance Escape
// -----------------------------------------------------------------------------

export interface CrisprDriveResult {
  homingRate: number; // c: fraction of W alleles converted to D in D/W heterozygotes
  nhejRate: number; // r: fraction converted into cleavage-resistant allele R
  driveCost: number; // sD: fitness penalty on D carriers
  finalD: number;
  finalW: number;
  finalR: number;
  outcome: string;
}

export function simulateCrisprDrive(
  homingRate: number,
  nhejRate: number,
  driveCost: number,
): CrisprDriveResult {
  let pD = 0.05;
  let pR = 0.0;
  let pW = 0.95;

  const cEff = Math.min(1 - nhejRate, homingRate);

  for (let g = 0; g < 24; g++) {
    // Diploid genotype frequencies
    const gDD = pD * pD;
    const gDW = 2 * pD * pW;
    const gDR = 2 * pD * pR;
    const gWW = pW * pW;
    const gWR = 2 * pW * pR;
    const gRR = pR * pR;

    // Fitnesses (D carries payload cost; W and R have fitness 1)
    const wD = Math.max(0.15, 1 - driveCost);
    const wHet = Math.max(0.25, 1 - 0.5 * driveCost);

    const sDD = gDD * wD;
    const sDW = gDW * wHet;
    const sDR = gDR * wHet;
    const sWW = gWW;
    const sWR = gWR;
    const sRR = gRR;
    const wBar = sDD + sDW + sDR + sWW + sWR + sRR;

    // Gamete pool: in D/W germline, the W chromosome is cut: cEff -> D, nhejRate -> R, rest stays W
    const gamD = sDD + 0.5 * sDW * (1 + cEff) + 0.5 * sDR;
    const gamR = sRR + 0.5 * sWR + 0.5 * sDR + 0.5 * sDW * nhejRate;
    const gamW = sWW + 0.5 * sWR + 0.5 * sDW * Math.max(0, 1 - cEff - nhejRate);

    pD = gamD / wBar;
    pR = gamR / wBar;
    pW = gamW / wBar;
  }

  let outcome = '';
  if (pD > 0.85) {
    outcome = 'Clean Drive Sweep! With negligible NHEJ resistance, the CRISPR homing drive fixes rapidly across the population.';
  } else if (pR > 0.5) {
    outcome = 'Resistance Escape! NHEJ mutations blocked Cas9 cutting and outcompeted the costly drive allele — replacing it with resistant R alleles!';
  } else {
    outcome = 'Incomplete / Transient Drive: resistance alleles and payload cost stall the drive before fixation.';
  }

  return {
    homingRate,
    nhejRate,
    driveCost,
    finalD: pD,
    finalW: pW,
    finalR: pR,
    outcome,
  };
}

// -----------------------------------------------------------------------------
// 3. Transposable Elements & C-Value Paradox
// -----------------------------------------------------------------------------

export interface GenomeTaxon {
  id: 'ecoli' | 'pufferfish' | 'human' | 'maize' | 'lungfish';
  name: string;
  genomeMb: number;
  codingGenes: number;
  tePercent: number;
  note: string;
}

export const CVALUE_TAXA: GenomeTaxon[] = [
  {
    id: 'ecoli',
    name: 'E. coli',
    genomeMb: 4.6,
    codingGenes: 4300,
    tePercent: 2,
    note: 'Compact prokaryotic genome: huge Ne purges non-coding junk efficiently.',
  },
  {
    id: 'pufferfish',
    name: 'Pufferfish (Fugu)',
    genomeMb: 390,
    codingGenes: 20500,
    tePercent: 11,
    note: 'Same ~20,000 vertebrate protein genes as humans, packed into 1/8th the DNA!',
  },
  {
    id: 'human',
    name: 'Human',
    genomeMb: 3100,
    codingGenes: 20000,
    tePercent: 45,
    note: 'Only ~1.5% encodes proteins; ~45% is retrotransposons (LINE-1, Alu) & ERVs!',
  },
  {
    id: 'maize',
    name: 'Maize (Corn)',
    genomeMb: 2300,
    codingGenes: 39000,
    tePercent: 85,
    note: 'Barbara McClintock’s jumping genes: 85% of the maize genome is mobile LTR transposons!',
  },
  {
    id: 'lungfish',
    name: 'Australian Lungfish',
    genomeMb: 43000,
    codingGenes: 22000,
    tePercent: 90,
    note: '14× larger genome than humans — yet nearly the SAME gene count! Classic C-value enigma solved by selfish TEs.',
  },
];

// -----------------------------------------------------------------------------
// 4. Gene Duplication Fates (Ohno 1970 & Force et al. 1999 DDC)
// -----------------------------------------------------------------------------

export type DuplicationFateId = 'pseudo' | 'neo' | 'sub';

export interface DuplicationFate {
  id: DuplicationFateId;
  title: string;
  copyAStatus: string;
  copyBStatus: string;
  enhancerA1: boolean;
  enhancerA2: boolean;
  enhancerB1: boolean;
  enhancerB2: boolean;
  explain: string;
}

export const DUPLICATION_FATES: Record<DuplicationFateId, DuplicationFate> = {
  pseudo: {
    id: 'pseudo',
    title: 'Pseudogenization (Most Common)',
    copyAStatus: 'Active ancestral gene (Tissue 1 + Tissue 2)',
    copyBStatus: 'Silenced pseudogene (frameshift / stop codon)',
    enhancerA1: true,
    enhancerA2: true,
    enhancerB1: false,
    enhancerB2: false,
    explain:
      'Because Copy A covers all essential functions, relaxed purifying selection lets Copy B accumulate disabling mutations and fade into a pseudogene.',
  },
  neo: {
    id: 'neo',
    title: 'Neofunctionalization (Ohno 1970)',
    copyAStatus: 'Active ancestral gene (preserved)',
    copyBStatus: 'Novel evolved function (e.g. Antarctic antifreeze / fetal globin)',
    enhancerA1: true,
    enhancerA2: true,
    enhancerB1: false,
    enhancerB2: true,
    explain:
      'Copy A maintains the original job under purifying selection while redundant Copy B explores new sequence space and acquires a novel beneficial function!',
  },
  sub: {
    id: 'sub',
    title: 'Subfunctionalization (DDC · Force et al. 1999)',
    copyAStatus: 'Specialized for Tissue 1 (lost Enhancer 2)',
    copyBStatus: 'Specialized for Tissue 2 (lost Enhancer 1)',
    enhancerA1: true,
    enhancerA2: false,
    enhancerB1: false,
    enhancerB2: true,
    explain:
      'Complementary loss-of-function mutations divide the ancestral enhancers between copies — now BOTH copies are indispensable and permanently preserved by purifying selection!',
  },
};

// -----------------------------------------------------------------------------
// 5. Parent-Offspring Conflict (Trivers 1974) & Genomic Imprinting (Haig 1993)
// -----------------------------------------------------------------------------

export interface ImprintingResult {
  paternityR: number; // relatedness of future siblings via father (0.5 = strict monogamy, 0 = multiple fathers)
  parentThreshold: number; // parent stops investing when B/C < 1
  offspringThreshold: number; // offspring wants investment until B/C < r_sib
  paternalDemand: number; // Igf2 growth drive (0..1)
  maternalBrake: number; // Igf2r growth receptor brake (0..1)
  conflictZoneLabel: string;
}

export function evaluateImprinting(multiplePaternity: number): ImprintingResult {
  // multiplePaternity in [0, 1]: 0 = strict monogamy (sib r = 0.5), 1 = different father every brood (sib r = 0.25)
  const m = Math.max(0, Math.min(1, multiplePaternity));
  const avgSibR = 0.5 * (1 - m) + 0.25 * m; // 0.5 -> 0.25
  const paternalSibR = 0.5 * (1 - m); // paternal allele's relatedness to mother's future offspring: 0.5 -> 0!
  const paternalDemand = 0.5 + 0.48 * m;
  const maternalBrake = 0.5 + 0.35 * m;

  return {
    paternityR: paternalSibR,
    parentThreshold: 1.0,
    offspringThreshold: avgSibR,
    paternalDemand,
    maternalBrake,
    conflictZoneLabel:
      m < 0.2
        ? 'Strict Monogamy: Siblings share r = 0.50 (both parents) → Trivers conflict zone B/C ∈ (0.5, 1.0); weak imprinting tug-of-war.'
        : `Multiple Paternity (${Math.round(m * 100)}%): Paternal allele has r = ${paternalSibR.toFixed(2)} to future sibs! Paternal Igf2 greedily extracts placental nutrients while maternal Igf2r brakes growth (Haig 1993)!`,
  };
}
