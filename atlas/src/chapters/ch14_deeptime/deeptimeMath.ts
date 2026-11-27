// =============================================================================
// Chapter 14: Strata, Fossils & Mass Extinctions — Deep Time & Macroevolution Math
// =============================================================================

export interface DeepTimeMilestone {
  id: string;
  label: string;
  maAgo: number; // Millions of years ago (3800 .. 0.3)
  spiralFrac: number; // Position along ammonite spiral (0.05 .. 0.99)
  note: string;
}

export const DEEP_TIME_MILESTONES: DeepTimeMilestone[] = [
  { id: 'origin', label: 'First Microbial Life (3,800 Ma)', maAgo: 3800, spiralFrac: 0.08, note: 'Prokaryotic cells arise soon after oceans cool — life stays strictly microbial for ~2 billion years!' },
  { id: 'oxygen', label: 'Great Oxidation Event (2,400 Ma)', maAgo: 2400, spiralFrac: 0.36, note: 'Cyanobacteria flood Earth’s atmosphere with O₂, paving the way for aerobic eukaryotes.' },
  { id: 'cambrian', label: 'Cambrian Explosion (541 Ma)', maAgo: 541, spiralFrac: 0.84, note: 'Rapid radiation of bilaterian animal body plans — already 86% of the way through life’s history!' },
  { id: 'tiktaalik', label: 'Tiktaalik & Tetrapods (375 Ma)', maAgo: 375, spiralFrac: 0.90, note: 'Lobe-finned sarcopterygians with proto-wrists move into Devonian shallows.' },
  { id: 'kpg', label: 'K–Pg Asteroid Impact (66 Ma)', maAgo: 66, spiralFrac: 0.97, note: 'Chicxulub bolide ends non-avian dinosaurs and opens global niches for placental mammals.' },
  { id: 'sapiens', label: 'Homo sapiens (0.3 Ma)', maAgo: 0.3, spiralFrac: 0.995, note: 'Our species occupies just 0.008% of life’s timeline — a hairline at the aperture rim!' },
];

export interface RadiometricResult {
  isotope: 'c14' | 'k40';
  halfLivesElapsed: number;
  parentFraction: number; // (1/2)^n
  daughterFraction: number; // 1 - (1/2)^n
  ageDisplay: string;
  validRange: string;
}

export function computeRadiometric(isotope: 'c14' | 'k40', halfLivesElapsed: number): RadiometricResult {
  const n = Math.max(0, Math.min(6, halfLivesElapsed));
  const parentFraction = Math.pow(0.5, n);
  const daughterFraction = 1 - parentFraction;
  if (isotope === 'c14') {
    const yrs = Math.round(n * 5730);
    return {
      isotope,
      halfLivesElapsed: n,
      parentFraction,
      daughterFraction,
      ageDisplay: `${yrs.toLocaleString()} years`,
      validRange: 'Organic fossils < ~50,000 yrs (t½ = 5,730 yrs) — NEVER used on dinosaur rocks!',
    };
  }
  const ma = n * 1250;
  return {
    isotope,
    halfLivesElapsed: n,
    parentFraction,
    daughterFraction,
    ageDisplay: `${ma.toFixed(0)} million years`,
    validRange: 'Volcanic ash strata bracketing fossils (t½ = 1.25 Ga; K–Ar / Ar–Ar & U–Pb).',
  };
}

export interface WhaleStageInfo {
  stage: number;
  name: string;
  maAgo: string;
  nostrilPos: string;
  hindLimbState: string;
  note: string;
}

export function evaluateWhaleStage(stage: number): WhaleStageInfo {
  if (stage < 0.22) {
    return {
      stage,
      name: 'Pakicetus inachus',
      maAgo: '50 Ma (Eocene Pakistan)',
      nostrilPos: 'Tip of snout',
      hindLimbState: 'Full running artiodactyl legs (double-pulley astragalus!)',
      note: 'Terrestrial wolf-sized artiodactyl with cetacean involucrum ear bone.',
    };
  }
  if (stage < 0.55) {
    return {
      stage,
      name: 'Ambulocetus natans',
      maAgo: '48 Ma ("Walking Whale")',
      nostrilPos: 'Mid-snout',
      hindLimbState: 'Large webbed paddling hind feet',
      note: 'Amphibious ambush predator swimming via spinal undulation + hind-foot kicks.',
    };
  }
  if (stage < 0.85) {
    return {
      stage,
      name: 'Dorudon atrox',
      maAgo: '38 Ma (Fully Marine Basilosaurid)',
      nostrilPos: 'Upper rostrum',
      hindLimbState: 'Tiny 15 cm hind legs with toes — detached from spine!',
      note: 'Fully pelagic tail-fluke swimmer retaining diminutive external hind legs.',
    };
  }
  return {
    stage,
    name: 'Balaenoptera (Modern Cetacean)',
    maAgo: '0 Ma (Present)',
    nostrilPos: 'Dorsal blowhole atop cranium',
    hindLimbState: 'Internal vestigial pelvic spurs only',
    note: 'Complete transformation from terrestrial artiodactyl to ocean giant in ~12 Myr!',
  };
}

export interface ExtinctionInfo {
  id: 'end_permian' | 'kpg' | 'anthropocene';
  title: string;
  maAgo: string;
  marineLossPct: number;
  driver: string;
  recovery: string;
}

export const EXTINCTION_EVENTS: Record<'end_permian' | 'kpg' | 'anthropocene', ExtinctionInfo> = {
  end_permian: {
    id: 'end_permian',
    title: 'End-Permian ("The Great Dying")',
    maAgo: '252 Ma',
    marineLossPct: 90,
    driver: 'Siberian Traps flood volcanism → runaway CO₂ warming, ocean anoxia & acidification.',
    recovery: 'Took ~10 Myr; wiped out trilobites and opened the Mesozoic era for archosaurs & dinosaurs.',
  },
  kpg: {
    id: 'kpg',
    title: 'Cretaceous–Paleogene (K–Pg)',
    maAgo: '66 Ma',
    marineLossPct: 76,
    driver: 'Chicxulub bolide impact (global iridium clay seam) + Deccan Traps stress → impact winter.',
    recovery: 'Non-avian dinosaurs & ammonites vanished; surviving birds & mammals radiated into empty niches.',
  },
  anthropocene: {
    id: 'anthropocene',
    title: 'Modern Biodiversity Crisis',
    maAgo: 'Present',
    marineLossPct: 30,
    driver: 'Habitat loss, rapid warming, overharvesting — extinction rates ~100–1,000× background!',
    recovery: 'Mass extinctions are non-random filters: traits adapted to calm eras fail abruptly during global shocks.',
  },
};
