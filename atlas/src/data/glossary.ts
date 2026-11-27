import type { GlossaryEntry } from '../types/atlas';

export const GLOSSARY: Record<string, GlossaryEntry> = {
  homology: {
    id: 'homology',
    term: 'Homology',
    pronunciation: 'hə-MOL-ə-jee',
    shortDef:
      'Similarity between traits in different species because they were inherited from a shared common ancestor, even if their functions have diverged.',
    deepNote:
      'Coined by Richard Owen (1843) before Darwin explained the mechanism as descent with modification. Always specify the hierarchical level: bat and bird wings are homologous as tetrapod forelimbs, yet analogous as wings.',
    relatedChapterId: 'limbs',
  },
  analogy: {
    id: 'analogy',
    term: 'Analogy (Convergent Evolution)',
    pronunciation: 'ə-NAL-ə-jee',
    shortDef:
      'Similarity in function or form that evolved independently in separate lineages facing similar selective pressures, rather than from a shared ancestor with that trait.',
    deepNote:
      'Also called homoplasy. Examples include the flight surfaces of bats, birds, and insects, or the streamlined bodies of sharks (fishes) and dolphins (mammals).',
    relatedChapterId: 'limbs',
  },
  pentadactyl: {
    id: 'pentadactyl',
    term: 'Pentadactyl Limb',
    pronunciation: 'pen-tə-DAK-til',
    shortDef:
      'The ancestral five-digit tetrapod limb plan: one proximal bone (stylopod), two middle bones (zeugopod), and a wrist/ankle with five digits (autopod).',
    deepNote:
      'Earliest Devonian tetrapods such as Acanthostega (8 digits) and Ichthyostega (7 digits) were polydactyl; five digits stabilized in crown-group tetrapods by the Carboniferous (~340 Ma).',
    relatedChapterId: 'limbs',
  },
  tetrapod: {
    id: 'tetrapod',
    term: 'Tetrapod',
    pronunciation: 'TET-rə-pod',
    shortDef:
      'Any four-limbed vertebrate (amphibians, reptiles, birds, and mammals) and their limbless descendants (such as snakes and whales), descended from lobe-finned fish ancestors.',
    deepNote:
      'The three-part forelimb blueprint (humerus, radius/ulna, distal radials) originated in sarcopterygian fishes like Tiktaalik (~375 Ma) before vertebrates walked on land.',
    relatedChapterId: 'limbs',
  },
  stylopod: {
    id: 'stylopod',
    term: 'Stylopod',
    pronunciation: 'STY-lə-pod',
    shortDef:
      'The single proximal segment of a tetrapod limb: the humerus in the forelimb (or femur in the hindlimb).',
    deepNote:
      'Specified during embryonic limb-bud outgrowth largely by early HoxA/HoxD paralog groups 9 and 10 alongside Meis1/2.',
    relatedChapterId: 'limbs',
  },
  zeugopod: {
    id: 'zeugopod',
    term: 'Zeugopod',
    pronunciation: 'ZOO-gə-pod',
    shortDef:
      'The paired middle bones of a tetrapod limb: the radius and ulna in the forelimb (or tibia and fibula in the hindlimb).',
    deepNote:
      'Specified by Hox11 paralogs (Hoxa11, Hoxd11). In humans, the radius pivots over the ulna to allow pronation and supination; in whales and horses they fuse or lock for rigidity.',
    relatedChapterId: 'limbs',
  },
  autopod: {
    id: 'autopod',
    term: 'Autopod',
    pronunciation: 'AW-tə-pod',
    shortDef:
      'The distal region of the limb comprising the wrist/ankle bones (carpals/tarsals), palm/sole (metacarpals/metatarsals), and digits (phalanges).',
    deepNote:
      'Patterned by a second late wave of HoxA13/HoxD10–13 expression and Sonic hedgehog (Shh) signalling along the anterior–posterior axis. It is the most evolutionarily labile region of the limb.',
    relatedChapterId: 'limbs',
  },
  hyperphalangy: {
    id: 'hyperphalangy',
    term: 'Hyperphalangy',
    pronunciation: 'hy-per-fə-LAN-jee',
    shortDef:
      'An evolutionary increase in the number of phalangeal bones per digit beyond the typical mammalian count (2-3-3-3-3), seen prominently in whales and dolphins.',
    deepNote:
      'Driven by prolonged apical ectodermal ridge (AER) / Fgf8 signalling at the tips of digits II and III during embryonic development, lengthening the flipper into a stiff hydrofoil.',
    relatedChapterId: 'limbs',
  },
  vestigial: {
    id: 'vestigial',
    term: 'Vestigial Structure',
    pronunciation: 'ves-TIJ-ee-əl',
    shortDef:
      'An anatomical feature reduced in size and stripped of its ancestral primary function, retained as a historical signature of ancestry.',
    deepNote:
      'In modern horses (Equus), metacarpals II and IV persist as slender "splint bones" flanking the central cannon bone (metacarpal III)—remnants of three-toed ancestors like Mesohippus.',
    relatedChapterId: 'limbs',
  },
  deep_homology: {
    id: 'deep_homology',
    term: 'Deep Homology',
    pronunciation: 'deep hə-MOL-ə-jee',
    shortDef:
      'The reuse of ancient, shared developmental gene-regulatory circuits (such as Hox, Tbx5, or Pax6) to build diverse or even independently evolved structures across distant lineages.',
    deepNote:
      'Coined by Shubin, Tabin & Carroll (1997, 2009). Even where adult wings differ dramatically, conserved transcription factors and enhancers (like Bmp2/Fgf8 timing in bats) explain how modest regulatory shifts produce dramatic morphological divergence.',
    relatedChapterId: 'limbs',
  },
  hox: {
    id: 'hox',
    term: 'Hox Genes',
    pronunciation: 'hoks jeenz',
    shortDef:
      'A family of master regulatory homeobox genes arranged along chromosomes in the same order as the body regions and limb segments they pattern during development.',
    deepNote:
      'In tetrapod limbs, nested expression of HoxA and HoxD clusters divides the growing limb bud into stylopod (Hox9/10), zeugopod (Hox11), and autopod (Hox13).',
    relatedChapterId: 'limbs',
  },
  patagium: {
    id: 'patagium',
    term: 'Patagium',
    pronunciation: 'pə-TAY-jee-əm',
    shortDef:
      'The thin, elastic, vascularised skin membrane stretched across a bat’s elongated metacarpals and phalanges to form its aerodynamic wing surface.',
    deepNote:
      'Unlike most mammals—where interdigital BMP signalling triggers programmed cell death (apoptosis) to separate fingers—bat embryos express Gremlin and Fgf8 to inhibit cell death and retain the webbing.',
    relatedChapterId: 'limbs',
  },
};
