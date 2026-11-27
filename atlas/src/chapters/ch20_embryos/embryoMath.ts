// =============================================================================
// Chapter 20: Embryos, Heterochrony & Evo-Devo — Quantitative & Comparative Data
// 1. Comparative Vertebrate Embryos (Fish, Salamander, Chick, Human — Phylotypic Stage)
// 2. Developmental Hourglass & Honest Haeckel / Richardson (1997) Comparison
// 3. Heterochrony (Axolotl Paedomorphosis vs Tiger Salamander Metamorphosis)
// 4. Exaptation & Co-option (Proto-feathers -> Flight; Jaw Joint -> Ear Ossicles)
// 5. Waddington's Epigenetic Landscape (Canalization & Genetic Assimilation)
// =============================================================================

export type EmbryoTaxonId = 'fish' | 'salamander' | 'chick' | 'human';
export type EmbryoStageId = 'early' | 'phylotypic' | 'late';

export interface EmbryoProfile {
  id: EmbryoTaxonId;
  name: string;
  latin: string;
  earlyNote: string;
  phylotypicNote: string;
  lateNote: string;
  limbBud: boolean;
  tailRatioLate: number;
  yolkSacSize: number;
}

export const EMBRYO_TAXA: EmbryoProfile[] = [
  {
    id: 'fish',
    name: 'Zebrafish',
    latin: 'Danio rerio',
    earlyNote: 'Discoidal meroblastic cleavage atop a huge golden yolk sphere.',
    phylotypicNote: 'Pharyngula stage: dorsal notochord, segmented somites, pharyngeal arches & post-anal tail.',
    lateNote: 'Pharyngeal arches form gills & jaws; pectoral fin buds flatten into fin rays.',
    limbBud: false,
    tailRatioLate: 1.0,
    yolkSacSize: 0.42,
  },
  {
    id: 'salamander',
    name: 'Salamander',
    latin: 'Ambystoma',
    earlyNote: 'Holoblastic (complete) unequal cleavage across the vegetal hemisphere.',
    phylotypicNote: 'Pharyngula stage: conserved Hox expression along somites & gill-slit pharyngeal pouches.',
    lateNote: 'External feathery larval gills sprout; paired tetrapod limb buds emerge.',
    limbBud: true,
    tailRatioLate: 0.92,
    yolkSacSize: 0.24,
  },
  {
    id: 'chick',
    name: 'Chick',
    latin: 'Gallus gallus',
    earlyNote: 'Flat blastodisc spreading over a massive nutrient-rich avian yolk.',
    phylotypicNote: 'Pharyngula stage: prominent eye cup, pharyngeal arches & curved somite spine.',
    lateNote: 'Beak keratinizes, anterior limb buds elongate into wings, pharyngeal pouches reshape into neck/ear.',
    limbBud: true,
    tailRatioLate: 0.35,
    yolkSacSize: 0.36,
  },
  {
    id: 'human',
    name: 'Human',
    latin: 'Homo sapiens',
    earlyNote: 'Tiny yolk-free holoblastic blastocyst implanting in uterine wall — VERY different early cleavage from chick/fish!',
    phylotypicNote: 'Pharyngula stage (Carnegie 13): pharyngeal arches, segmented somites, post-anal tail & conserved Hox cascade.',
    lateNote: 'Forebrain domes rapidly, pentadactyl hand plates sculpt via apoptosis, tail regresses into coccyx.',
    limbBud: true,
    tailRatioLate: 0.12,
    yolkSacSize: 0.12,
  },
];

export interface HourglassMetrics {
  stage: EmbryoStageId;
  transcriptomeConservation: number; // 0..100 (peaks at phylotypic waist!)
  morphDivergence: number;           // 0..100 (wide early cleavage & wide late specialization!)
  honestNote: string;
}

export function evaluateHourglass(stage: EmbryoStageId): HourglassMetrics {
  if (stage === 'early') {
    return {
      stage,
      transcriptomeConservation: 42,
      morphDivergence: 78,
      honestNote:
        'Early cleavage is SURPRISINGLY diverse (massive yolk in fish/chick vs. yolk-free mammalian blastocyst) — disproving Haeckel’s myth of an identical early start!',
    };
  }
  if (stage === 'phylotypic') {
    return {
      stage,
      transcriptomeConservation: 94,
      morphDivergence: 26,
      honestNote:
        'The Phylotypic Hourglass Waist (Kalinka et al. 2010): vertebrates converge strongly on ancient Hox/Pax/Shh gene networks — yet real embryos STILL differ in somite count, size & heterochrony (Richardson et al. 1997)!',
    };
  }
  return {
    stage,
    transcriptomeConservation: 38,
    morphDivergence: 92,
    honestNote:
      'Late organogenesis diverges dramatically as species-specific limbs, jaws, wings, fins, and brain vaults take shape.',
  };
}

export interface HeterochronyResult {
  thyroidSignal: number; // 0 = paedomorphic Axolotl (keeps gills!), 1 = metamorphosed Tiger Salamander
  gillFluff: number;
  finCrest: number;
  stateLabel: string;
}

export function evaluateHeterochrony(thyroidSignal: number): HeterochronyResult {
  const t = Math.max(0, Math.min(1, thyroidSignal));
  return {
    thyroidSignal: t,
    gillFluff: 1 - t,
    finCrest: 1 - t * 0.85,
    stateLabel:
      t < 0.35
        ? 'Paedomorphic Axolotl (Neoteny — reproduces while retaining larval feathery gills!)'
        : t < 0.72
          ? 'Transitional Metamorphosis (Gills resorbing, lungs & eyelids forming)'
          : 'Metamorphosed Terrestrial Salamander (Adult morphology via ancestral timing)',
  };
}

export interface CanalizationResult {
  bufferingHsp90: number; // 0..1 developmental canalization strength
  stressLevel: number;    // 0..1 environmental perturbation
  phenotypicSpread: number;
  crypticRevealed: boolean;
}

export function evaluateCanalization(bufferingHsp90: number, stressLevel: number): CanalizationResult {
  const effectiveBuffer = Math.max(0.05, bufferingHsp90 - stressLevel * 0.65);
  const phenotypicSpread = Math.min(1.0, 0.12 + (1 - effectiveBuffer) * 0.88);
  return {
    bufferingHsp90,
    stressLevel,
    phenotypicSpread,
    crypticRevealed: effectiveBuffer < 0.32,
  };
}
