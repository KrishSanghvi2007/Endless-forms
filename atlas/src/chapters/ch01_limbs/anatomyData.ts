export type BoneRegionId = 'stylopod' | 'zeugopod' | 'autopod';
export type TetrapodSpeciesId = 'human' | 'bat' | 'whale' | 'horse';
export type AnalogySpecimenId = 'bat' | 'bird' | 'insect';

export interface BoneRegionMeta {
  id: BoneRegionId;
  name: string;
  anatomicalTerm: string;
  hoxDomain: string;
  hoxNote: string;
  colorHex: string;
  swatchLight: string;
  swatchMid: string;
  swatchDark: string;
}

export const BONE_REGIONS: BoneRegionMeta[] = [
  {
    id: 'stylopod',
    name: 'Humerus',
    anatomicalTerm: 'Stylopod · 1 upper bone',
    hoxDomain: 'Hoxa9 / Hoxa10',
    hoxNote: 'Early proximal wave (Meis1/2 + Hox9–10) builds the single upper-arm bone.',
    colorHex: '#d4942a',
    swatchLight: '#f0c464',
    swatchMid: '#d69529',
    swatchDark: '#9e6811',
  },
  {
    id: 'zeugopod',
    name: 'Radius and ulna',
    anatomicalTerm: 'Zeugopod · 2 forearm bones',
    hoxDomain: 'Hoxa11 / Hoxd11',
    hoxNote: 'Middle domain builds two parallel shafts—pivoting in humans, locked in whales and horses.',
    colorHex: '#2d8a7e',
    swatchLight: '#5ec0b2',
    swatchMid: '#2d8a7e',
    swatchDark: '#195c53',
  },
  {
    id: 'autopod',
    name: 'Wrist and hand',
    anatomicalTerm: 'Autopod · carpals & digits',
    hoxDomain: 'Hoxa13 / Hoxd10–13',
    hoxNote: 'Late distal wave + Shh patterns the wrist and fingers—the most evolutionarily flexible zone.',
    colorHex: '#c74b5b',
    swatchLight: '#e97e8c',
    swatchMid: '#c74b5b',
    swatchDark: '#8b2937',
  },
];

export interface SpeciesLimbData {
  id: TetrapodSpeciesId;
  commonName: string;
  latinName: string;
  plateCaption: string;
  scaleLabel: string;
  totalCm: number;
  cm: Record<BoneRegionId, number>;
  /** Percentages summing to 100 */
  pct: Record<BoneRegionId, number>;
  regionNotes: Record<BoneRegionId, string>;
  evoDevoNote: string;
}

export const TETRAPOD_SPECIES: Record<TetrapodSpeciesId, SpeciesLimbData> = {
  human: {
    id: 'human',
    commonName: 'Human',
    latinName: 'Homo sapiens',
    plateCaption: 'Homo sapiens — right arm, dorsal view',
    scaleLabel: '5 cm',
    totalCm: 73,
    cm: { stylopod: 31, zeugopod: 24, autopod: 18 },
    pct: { stylopod: 42, zeugopod: 33, autopod: 25 },
    regionNotes: {
      stylopod:
        'Long, mobile humerus with a hemispherical head for wide shoulder rotation.',
      zeugopod:
        'Slender radius pivots around the ulna, letting the hand rotate palm-up or palm-down.',
      autopod:
        'Eight wrist carpals, five metacarpals, and an opposable thumb built for precision grip.',
    },
    evoDevoNote:
      'Preserves the ancestral five-digit (pentadactyl) tetrapod plan closely.',
  },
  bat: {
    id: 'bat',
    commonName: 'Bat',
    latinName: 'Pteropus vampyrus',
    plateCaption: 'Pteropus vampyrus — right wing, dorsal view',
    scaleLabel: '5 cm',
    totalCm: 72,
    cm: { stylopod: 13, zeugopod: 17, autopod: 42 },
    pct: { stylopod: 18, zeugopod: 24, autopod: 58 },
    regionNotes: {
      stylopod:
        'Short, lightweight humerus anchors strong pectoral flight muscles at the shoulder.',
      zeugopod:
        'Curved radius carries wing torsion; the ulna is greatly reduced to a thin proximal splint.',
      autopod:
        'Digits II–V stretch to 58% of limb length, forming flexible spars for the patagium membrane. Digit I remains a short climbing thumb.',
    },
    evoDevoNote:
      'Up-regulated Bmp2 speeds finger-bone growth (Sears et al. 2006), while Fgf8 + Gremlin block interdigital cell death to retain wing webbing.',
  },
  whale: {
    id: 'whale',
    commonName: 'Whale',
    latinName: 'Tursiops truncatus',
    plateCaption: 'Tursiops truncatus — right flipper, dorsal view',
    scaleLabel: '5 cm',
    totalCm: 48,
    cm: { stylopod: 10, zeugopod: 9, autopod: 29 },
    pct: { stylopod: 21, zeugopod: 19, autopod: 60 },
    regionNotes: {
      stylopod:
        'Short, stout humerus gives high leverage for steering rather than walking.',
      zeugopod:
        'Radius and ulna flatten into broad, non-rotating blades locked at the elbow.',
      autopod:
        'All five digits persist inside the flipper; digits II & III gain extra phalanges (hyperphalangy) to stiffen the hydrofoil.',
    },
    evoDevoNote:
      'Prolonged Fgf8 signalling at the embryonic limb tip drives hyperphalangy—extra finger segments built onto the same mammalian hand.',
  },
  horse: {
    id: 'horse',
    commonName: 'Horse',
    latinName: 'Equus caballus',
    plateCaption: 'Equus caballus — right forelimb, dorsal view',
    scaleLabel: '10 cm',
    totalCm: 108,
    cm: { stylopod: 30, zeugopod: 36, autopod: 42 },
    pct: { stylopod: 28, zeugopod: 33, autopod: 39 },
    regionNotes: {
      stylopod:
        'Stout humerus sits close to the ribcage; most stride length comes from below the elbow.',
      zeugopod:
        'Ulna fuses to the robust radius, leaving a prominent olecranon lever at the elbow.',
      autopod:
        'The horse runs on a single middle finger (digit III: cannon bone + hoof). Digits II & IV shrink to vestigial splint bones; I & V are lost.',
    },
    evoDevoNote:
      'A 55-million-year fossil sequence documents digit reduction from four-toed Hyracotherium to single-toed Equus.',
  },
};

export const SPECIES_ORDER: TetrapodSpeciesId[] = ['human', 'bat', 'whale', 'horse'];

export interface AnalogyInfo {
  id: AnalogySpecimenId;
  name: string;
  latin: string;
  caption: string;
  verdict: string;
  detail: string;
  homologyBadge: string;
}

export const ANALOGY_SPECIMENS: Record<AnalogySpecimenId, AnalogyInfo> = {
  bat: {
    id: 'bat',
    name: 'Bat Wing',
    latin: 'Pteropus · Mammalia',
    caption: 'Bat wing — patagium over elongated digits II–V',
    homologyBadge: 'Tetrapod forelimb · Flight evolved independently',
    verdict: 'Homologous to bird wing as a forelimb; analogous as a wing.',
    detail:
      'A mammal’s aerodynamic surface is elastic skin supported by dramatically lengthened fingers II–V.',
  },
  bird: {
    id: 'bird',
    name: 'Bird Wing',
    latin: 'Columba livia · Aves',
    caption: 'Columba livia — fused carpometacarpus & flight feathers',
    homologyBadge: 'Tetrapod forelimb · Flight evolved independently',
    verdict: 'Homologous to bat wing as a forelimb; analogous as a wing.',
    detail:
      'Birds share the humerus, radius, and ulna from a common amniote ancestor, but fuse their wrist/hand into a rigid carpometacarpus and build lift with feathers—not stretched skin.',
  },
  insect: {
    id: 'insect',
    name: 'Insect Wing',
    latin: 'Anax imperator · Insecta',
    caption: 'Anax imperator — chitinous wing with hollow veins',
    homologyBadge: 'Non-homologous structure (Pure Analogy)',
    verdict: 'Analogous to both bat and bird wings — zero bone blueprint.',
    detail:
      'Insect wings are outgrowths of the thoracic exoskeleton made of chitin, sharing no limb-skeleton ancestry with vertebrates. Powered flight evolved at least four times independently (insects, pterosaurs, birds, bats).',
  },
};

export interface CheckQuestion {
  id: string;
  prompt: string;
  mode: 'click-bone' | 'choice';
  species: TetrapodSpeciesId | AnalogySpecimenId;
  /** For click-bone questions: which bone region the user should tap on the 3D limb */
  targetRegion?: BoneRegionId;
  options?: { id: string; label: string; correct: boolean }[];
  explanation: string;
}

export const CHECK_QUESTIONS: CheckQuestion[] = [
  {
    id: 'q1-bat-spar',
    prompt: 'Tap directly on the 3D bat wing: which homologous region stretches to form the main wing spars?',
    mode: 'click-bone',
    species: 'bat',
    targetRegion: 'autopod',
    explanation:
      'Spot on! The bat’s wing membrane (patagium) is supported primarily by its elongated wrist & hand (autopod)—specifically metacarpals and phalanges II–V, which make up 58% of the limb.',
  },
  {
    id: 'q2-analogy',
    prompt: 'A bat’s wing and a bird’s wing both power flight using tetrapod forelimbs. How should an evolutionary biologist classify them?',
    mode: 'choice',
    species: 'bird',
    options: [
      {
        id: 'a',
        label: 'Strictly homologous in every respect, because both ancestors could fly.',
        correct: false,
      },
      {
        id: 'b',
        label: 'Homologous as tetrapod forelimbs, but analogous (convergent) as wings.',
        correct: true,
      },
      {
        id: 'c',
        label: 'Purely analogous, because birds have feathers and bats have skin.',
        correct: false,
      },
    ],
    explanation:
      'Exactly right. Homology always depends on the hierarchical level: their last common amniote ancestor (~315 Ma) had walking forelimbs, not wings—so the skeletal blueprint is homologous while powered flight evolved convergently.',
  },
  {
    id: 'q3-whale-elbow',
    prompt: 'Inspect the whale flipper in 3D and tap the region where the two forearm bones flatten into rigid blades.',
    mode: 'click-bone',
    species: 'whale',
    targetRegion: 'zeugopod',
    explanation:
      'Correct! The radius and ulna (zeugopod, Hoxa11 domain) shorten and flatten side-by-side inside the flipper, preventing wrist rotation so the whole paddle acts as a rigid hydrofoil.',
  },
];
