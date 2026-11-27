// =============================================================================
// Chapter 25: Origin of Life, Endosymbiosis & Coevolution — Exact Models
// 1. RNA World Ribozymes & Lipid Protocell Vesicles
// 2. Serial Endosymbiosis (Margulis 1967): Alpha-Proteobacterium & Cyanobacterium
// 3. Major Evolutionary Transitions (Maynard Smith & Szathmáry 1995)
// 4. Geographic Mosaic of Coevolution (Taricha Newt TTX vs Thamnophis Snake)
// 5. Darwin's Star Orchid (Angraecum sesquipedale) & Hawk Moth Arms Race
// =============================================================================

export type RnaStageId = 'monomers' | 'ribozyme' | 'protocell';

export interface RnaStage {
  id: RnaStageId;
  title: string;
  note: string;
}

export const RNA_STAGES: Record<RnaStageId, RnaStage> = {
  monomers: {
    id: 'monomers',
    title: '1. Prebiotic Nucleotides & Fatty-Acid Bilayers',
    note: 'Hydrothermal vents and wet–dry mineral cycles concentrate ribonucleotides and amphiphilic lipids that spontaneously self-assemble into hollow vesicles.',
  },
  ribozyme: {
    id: 'ribozyme',
    title: '2. RNA World Ribozymes (Dual Genotype + Catalyst!)',
    note: 'Solves the DNA–protein chicken-and-egg paradox: folded RNA hairpins BOTH store heritable sequence information AND catalyze chemical reactions (like the ribosome’s peptidyl-transferase core today!).',
  },
  protocell: {
    id: 'protocell',
    title: '3. Encapsulated Protocell (Darwinian Selection Begins!)',
    note: 'Once replicating ribozymes are compartmentalized inside lipid membranes, faster-copying ribozymes keep their catalytic products private — launching cellular natural selection!',
  },
};

// -----------------------------------------------------------------------------
// 2. Serial Endosymbiosis (Margulis 1967)
// -----------------------------------------------------------------------------

export type EndoStageId = 'archaeon' | 'mito' | 'plastid';

export interface EndoStage {
  id: EndoStageId;
  title: string;
  evidence: string[];
}

export const ENDO_STAGES: Record<EndoStageId, EndoStage> = {
  archaeon: {
    id: 'archaeon',
    title: '1. Asgard Archaeal Host + Free-Living α-Proteobacterium',
    evidence: [
      'Host belongs to Asgard Archaea (e.g., Lokiarchaeota) with primitive actin cytoskeleton',
      'Free-living aerobic α-proteobacterium respires O₂ via oxidative phosphorylation',
    ],
  },
  mito: {
    id: 'mito',
    title: '2. Primary Endosymbiosis → Mitochondria (~1.8–2.0 Ga)',
    evidence: [
      'Double membrane: inner bacterial plasma membrane + outer host phagocytic vesicle',
      'Circular bacterial chromosome, 70S ribosomes & binary fission (FtsZ/Drp1)',
      'Mass Endosymbiotic Gene Transfer (EGT) moved most genes to the host nucleus!',
    ],
  },
  plastid: {
    id: 'plastid',
    title: '3. Secondary Capture of Cyanobacterium → Chloroplasts (~1.5 Ga)',
    evidence: [
      'A mitochondriate eukaryote engulfed a photosynthetic cyanobacterium → Archaeplastida (plants & algae)',
      'Retains thylakoid stacks, circular plastid genome & bacterial-type 70S ribosomes!',
    ],
  },
};

// -----------------------------------------------------------------------------
// 3. Major Evolutionary Transitions (Maynard Smith & Szathmáry 1995)
// -----------------------------------------------------------------------------

export interface TransitionStage {
  step: number;
  name: string;
  lowerUnit: string;
  higherUnit: string;
  keyMechanism: string;
}

export const MAJOR_TRANSITIONS: TransitionStage[] = [
  {
    step: 1,
    name: 'Replicators → Chromosomes',
    lowerUnit: 'Independent RNA/DNA genes',
    higherUnit: 'Linked chromosomes',
    keyMechanism: 'Physical linkage aligns replication fates & reduces selfish hyper-replicators',
  },
  {
    step: 2,
    name: 'Prokaryotes → Eukaryotic Cell',
    lowerUnit: 'Asgard archaeon + α-proteobacterium',
    higherUnit: 'Compartmentalized eukaryote',
    keyMechanism: 'Endosymbiotic gene transfer & uniparental mitochondrial inheritance suppress conflict',
  },
  {
    step: 3,
    name: 'Single Cells → Multicellular Organism',
    lowerUnit: 'Solitary clonal cells',
    higherUnit: 'Differentiated soma + germline',
    keyMechanism: 'Single-cell zygote bottleneck enforces r = 1.0 across body cells + germline sequestration',
  },
  {
    step: 4,
    name: 'Solitary Individuals → Eusocial Colony',
    lowerUnit: 'Individual insects/mole-rats',
    higherUnit: 'Superorganism colony',
    keyMechanism: 'Ancestral strict monogamy (r = 0.50) + worker policing + ecological fortress defense',
  },
];

// -----------------------------------------------------------------------------
// 4. Geographic Mosaic of Coevolution (Taricha Newt vs Thamnophis Snake)
// -----------------------------------------------------------------------------

export interface MosaicResult {
  isHotspot: boolean;
  newtTtxMg: number;
  snakeResistance: number;
  matchStatus: string;
  explain: string;
}

export function evaluateGeographicMosaic(isHotspot: boolean): MosaicResult {
  if (isHotspot) {
    return {
      isHotspot: true,
      newtTtxMg: 14.5,
      snakeResistance: 92,
      matchStatus: 'Escalated Coevolutionary Hotspot (Willamette Valley, Oregon)',
      explain:
        'Reciprocal selection drives an arms race: rough-skinned newts pack enough tetrodotoxin (TTX) to kill dozens of humans, while garter snakes evolved Nav1.4 sodium-channel mutations granting extreme resistance (at a crawling-speed cost)!',
    };
  }
  return {
    isHotspot: false,
    newtTtxMg: 0.2,
    snakeResistance: 8,
    matchStatus: 'Coevolutionary Coldspot (Vancouver Island, BC)',
    explain:
      'Where toxic newts are absent or benign, costly Nav1.4 resistance mutations slow snakes down with zero payoff — so purifying selection removes resistance (Thompson 2005 Geographic Mosaic)!',
  };
}

// -----------------------------------------------------------------------------
// 5. Darwin's Star Orchid (Angraecum sesquipedale) & Hawk Moth Arms Race
// -----------------------------------------------------------------------------

export interface OrchidMothResult {
  spurCm: number;
  proboscisCm: number;
  pollenTransfer: number; // 0..100%
  mothNectar: number; // 0..100%
  selectionNote: string;
}

export function evaluateOrchidMoth(spurCm: number, proboscisCm: number): OrchidMothResult {
  const diff = proboscisCm - spurCm;
  // Moth gets full nectar only if proboscis >= spurCm - 1
  const mothNectar = Math.round(
    Math.max(5, Math.min(100, diff >= 0 ? 100 : 100 * Math.exp(-(diff * diff) / 18))),
  );
  // Orchid ONLY transfers pollen onto moth's face when spur is slightly LONGER than or closely matched to proboscis so moth presses its head tightly into the flower throat!
  const pollenTransfer = Math.round(
    Math.max(
      8,
      Math.min(
        100,
        diff > 4
          ? 28 * Math.exp(-((diff - 4) * (diff - 4)) / 40) // moth drinks from far away -> no face contact!
          : diff < -4
            ? 20 * Math.exp(-((diff + 4) * (diff + 4)) / 40) // moth can't reach nectar -> gives up!
            : 100 - Math.abs(diff + 1.2) * 14,
      ),
    ),
  );

  let selectionNote = '';
  if (proboscisCm > spurCm + 3) {
    selectionNote =
      'Proboscis Longer Than Spur! Moth drinks easily without touching the anthers — selecting for LONGER orchid spurs (Pollen transfer drops to ' +
      pollenTransfer +
      '%)!';
  } else if (spurCm > proboscisCm + 3) {
    selectionNote =
      'Spur Longer Than Proboscis! Moth cannot reach the deep nectar pool — selecting strongly for LONGER hawk-moth proboscises!';
  } else {
    selectionNote =
      'Tight Coevolutionary Match (~30 cm)! Just as Darwin predicted in 1862 — 41 years before Xanthopan morganii praedicta was discovered in Madagascar — pressing deep into the spur achieves ' +
      pollenTransfer +
      '% pollen transfer!';
  }

  return { spurCm, proboscisCm, pollenTransfer, mothNectar, selectionNote };
}
