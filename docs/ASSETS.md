# Endless Forms Atlas — Asset & Licence Ledger

*Per D7 §2.3: every 3D geometry, texture, illustration, font, and sound asset used in the Atlas is recorded here with its origin, licence, and scientific notes.*

---

## Typography (Embedded Offline WOFF2)

| Asset | File | Source / Licence | Notes |
|---|---|---|---|
| Fraunces (400–800 variable) | `atlas/src/styles/fonts.css` | Undercase Type · SIL Open Font License 1.1 (extracted from v2 `shell.html`) | Display headings, plate titles, numerals |
| Spectral (400, 600, italic) | `atlas/src/styles/fonts.css` | Production Type · SIL OFL 1.1 | Editorial body copy, Latin binomials |
| IBM Plex Mono (400) | `atlas/src/styles/fonts.css` | IBM · SIL OFL 1.1 | Scale bars, measurements, equations, UI metadata |
| EF Symbols Serif / Mono | `atlas/src/styles/fonts.css` | Noto Serif / Noto Sans Mono subset · SIL OFL 1.1 | Greek letters & mathematical symbols |
| Atkinson Hyperlegible (400, 700) | `atlas/src/styles/fonts.css` | Braille Institute · SIL OFL 1.1 | Accessible Readable-mode toggle |

---

## Chapter 1: Equilibrium — Hardy–Weinberg (`ch01_hwe`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| 3D Hinged-Elytra Beetles & Glass Allele Jars | `atlas/src/chapters/ch01_hwe/HweScene3D.ts` | Original procedural Three.js meshes · MIT | Glossy cobalt (`A`) and golden-amber (`a`) beetles whose wing cases swing open to reveal two allele pearls that arc into glass jars. |
| 3D Resizing $p \times q$ Gamete Square & Merging $2pq$ Pillars | `atlas/src/chapters/ch01_hwe/HweScene3D.ts` | Original procedural Three.js meshes · MIT | Egg/sperm cells and translucent zygote columns whose areas and heights dynamically track $p^2, 2pq, q^2$. |
| 3D Brass & Ivory de Finetti Triangle Sculpture | `atlas/src/chapters/ch01_hwe/HweScene3D.ts` | Original procedural Three.js meshes · MIT | Raised ternary plinth with glowing golden HW parabola arch and animated parent→offspring jump beacon. |
| 300-Beetle Instanced Beach, Brass Quadrat, Family Burrows & Stylized 3D Norway Rats (*VKORC1*) | `atlas/src/chapters/ch01_hwe/HweScene3D.ts` | Original procedural Three.js meshes · MIT | Supports 60 fps quadrat sampling, Wahlund deme boundary rope, and non-human warfarin heterozygote advantage per D6 decision 5. |

---

## Chapter 2: Conflict & Kinship — Game Theory & Kin Selection (`ch02_social`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| 3D Tidal Shoreline, Spiral Gastropod Shells & Sculpted Hermit Crabs (Hawk/Dove/Bourgeois) | `atlas/src/chapters/ch02_social/SocialScene3D.ts` | Original procedural Three.js meshes · MIT | Posture + D4 colour dual coding: Hawks raise oversized cobalt pincers, Doves lower amber claws, Bourgeois owners carry emerald-teal brass pennants. |
| 3D War of Attrition Ring & Exponential ESS Bar Sculpture | `atlas/src/chapters/ch02_social/SocialScene3D.ts` | Original procedural Three.js meshes · MIT | Visualises invadability of pure persistence strategies vs. Bishop & Cannings (1978) exponential ESS $p(t) = (1/V)e^{-t/V}$. |
| 3D Family Pedigree Medallions & Glowing Identical-by-Descent Path Tubes | `atlas/src/chapters/ch02_social/SocialScene3D.ts` | Original procedural Three.js meshes · MIT | Traces Wright’s path-counting formula $r = \sum (1/2)^L$ across diploid and haplodiploid relatives. |
| 3D Sierra Alpine Meadow, Belding’s Ground Squirrels & Circling Red-Tailed Hawk | `atlas/src/chapters/ch02_social/SocialScene3D.ts` | Original procedural Three.js meshes · MIT | Live circling raptor casting real moving shadows + acoustic alarm-call ripples illustrating Hamilton’s rule ($rB > C$). |

---

## Chapter 3: The Lichen Wood & Soot — Natural Selection (`ch03_lichen`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| 3D Silver Birch Bark & Soot-Blackened Bark Textures + Sculpted Peppered Moths (*Biston betularia*) | `atlas/src/chapters/ch03_lichen/LichenScene3D.ts` | Original procedural Three.js meshes & HTML5 Canvas PBR textures · MIT | Delta resting-posture moths with quantized speckled wing textures, raycastable bark foraging, crimson-haloed Pinned Moth #7, 120-egg overproduction tray, and Gene-Pool Lens allele dots (*cortex* `C`/`c`). |
| 3D Breeder’s Equation Bar Sculpture & Brass Tilting $h^2$ Regression Beam | `atlas/src/chapters/ch03_lichen/LichenScene3D.ts` | Original procedural Three.js meshes · MIT | Visualizes parent distribution, brass selection cutoff ($S$), offspring response ($R$), and parent–offspring slope ($h^2$). |
| 3D Trait–Fitness Ribbon Arena & Sewall Wright Contoured Adaptive Landscape | `atlas/src/chapters/ch03_lichen/LichenScene3D.ts` | Original procedural 56×40 topographic Three.js surface · MIT | Real-time vertex-coloured elevation contours with live terrain deformation under Environmental Shift and gradient-climbing population beacons. |

---

## Chapter 4: Drift Casino — Genetic Drift, $N_e$ & Coalescent (`ch04_casino`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| 6 Crystal Wright–Fisher Specimen Jars & Buri’s 12 Glass *Drosophila* Vials | `atlas/src/chapters/ch04_casino/CasinoScene3D.ts` | Original procedural Three.js meshes · MIT | Parallel neutral drift jars with cobalt/amber allele pearls + fixation halos, alongside Buri (1956) culture vials and harem sex-ratio $N_e$ comparison plinth. |
| 3D Volcanic Archipelago, 12-Colour Jewel Alleles & 3D Kingman Coalescent Genealogy Tower | `atlas/src/chapters/ch04_casino/CasinoScene3D.ts` | Original procedural Three.js meshes · MIT | Visualizes rare-allele loss (ghost rings) vs. heterozygosity retention, Kimura $4N_e s$ trajectory tubes, and backward-in-time coalescent branches with ruby mutation pearls & MRCA crown. |

---

## Chapter 5: Bitter Wings — Mimicry & Aposematism (`ch05_bitter`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted 3D *Heliconius* Butterflies, Glassy-Winged Dragonflies & Rufous-Tailed Jacamar (*Galbula ruficauda*) | `atlas/src/chapters/ch05_bitter/BitterScene3D.ts` | Original procedural Three.js meshes & wing-pattern textures · MIT | Supports raycastable jacamar foraging (Chai 1986 taste-release), continuous 0–100% imperfect mimicry wing gradients, Müllerian Red-Band vs. Yellow-Spot advergence, arched veined *Passiflora* host leaves, and solitary vs. kin-clustered aposematic larvae. |

---

## Shared Sculpted 3D Organism Library & Chapter 6: Left Jaw, Right Jaw (`ch06_jaws`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Anatomically Lofted 3D Tanganyika Cichlids (*Perissodus microlepis*), Side-Blotched Lizards (*Uta stansburiana*), Island Anoles (*Anolis*), Elephant Seals & Veined *Passiflora* Leaves | `atlas/src/3d/organisms.ts` & `atlas/src/chapters/ch06_jaws/JawsScene3D.ts` | Original procedural Three.js `LatheGeometry` / tapered `TubeGeometry` / hand-tinted scale PBR textures · MIT | Zero-box museum specimen presentation casting soft drop shadows directly onto rag paper: visibly twisted left/right scale-scraping jaws, animated swishing caudal fins, Orange/Blue/Yellow lizard throat dewlaps, and trans-species MHC balancing trees. |

---

## Chapter 7: Mutation, Linkage & Gene Flow (`ch07_engine`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted 3D *E. coli* Bacterial Rods & Glass Petri Dishes, *Drosophila melanogaster* (Red `w+` vs White `w` Eyes), Paired Homologous Chromosomes Crossing Over & Pinacate Rock Pocket Mice (*Chaetodipus intermedius*) | `atlas/src/3d/organisms.ts` & `atlas/src/chapters/ch07_engine/EngineScene3D.ts` | Original procedural Three.js meshes · MIT | Zero-box museum plates: Luria–Delbrück jackpot variance dishes + 3D DFE, mutation–selection balance basin, hemizygous XY vs. XX *Drosophila*, 3D chiasma crossover + hitchhiking $\pi$ valley, and desert-sand vs. basalt-lava rock pocket mice. |

---

## Chapter 8: Sex, Choice & Slow Islands (`ch08_raffle`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted 3D Trinidadian Aripo Guppies (*Poecilia reticulata*), Yellow Dung Flies (*Scathophaga stercoraria*) & Virginia Opossums (*Didelphis virginiana*) | `atlas/src/3d/organisms.ts` & `atlas/src/chapters/ch08_raffle/RaffleScene3D.ts` | Original procedural Three.js meshes · MIT | Zero-box plates: anisogamy ovum/sperm + Bateman slope beams, carotenoid-spotted male guppies vs. pike-cichlids, Parker sperm-competition raffle disk, Fisher brass sex-ratio seesaw, and Sapelo Island vs. mainland opossums with Hamilton age-selection pillars. |

---

## Chapter 9: Why Sex? & Red Queen (`ch09_sex`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted 3D New Zealand Mud Snails (*Potamopyrgus antipodarum*), *Microphallus* Trematodes, Cleaner Wrasse & Client Reef Fish | `atlas/src/3d/organisms.ts` & `atlas/src/chapters/ch09_sex/SexScene3D.ts` | Original procedural Three.js meshes · MIT | Zero-box plates: twofold cost clonal array, Muller’s ratchet mutation-load towers + ghost rings, Lake Alexandrina Red Queen snail/trematode coevolution ring, cleaner wrasse partner sanctions, and pathogen virulence $R_0(\alpha)$ ridge. |

---

## Chapter 10: Switches & Deep Homology (`ch10_switch`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted 3D Threespine Sticklebacks (*Gasterosteus aculeatus*), Translucent *Daphnia* Water Fleas, Camera vs. Compound Eye Anatomy & *Volvox* Spheroids | `atlas/src/3d/organisms.ts` & `atlas/src/chapters/ch10_switch/SwitchScene3D.ts` | Original procedural Three.js meshes · MIT | Zero-box Evo-Devo plates: *Pitx1* modular enhancer bar & toggleable pelvic spines, 3′→5′ *Hox* colinearity & *Antp*/*Ubx* homeotic shifts, *Pax6* deep-homology bridge, inducible *Daphnia* helmets, and *Volvox* soma–germline spheroids. |

---

## Chapter 11: Same Bones, Different Lives (`ch01_limbs`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Parametric 3D Tetrapod Forelimb Osteology (Human, Flying Fox Bat, Humpback Whale, Domestic Horse) | `atlas/src/chapters/ch01_limbs/LimbScene3D.ts` | Original procedural 3D lofted osteology meshes created for Endless Forms · MIT | Anatomical proportions derived from published vertebrate morphometrics (Owen 1849; Kardong 2019; Sears et al. 2006; Cooper et al. 2007, 2014). Includes epiphyses/condyles, olecranon process, carpal cluster, metacarpals, articulated phalanges, equine splint bones (MC II & IV), and cetacean hyperphalangy. Designed for smooth bone-by-bone 3D morphing. |
| Comparative Analogy Specimens (Bird Wing *Columba*, Dragonfly/Insect Wing) | `atlas/src/chapters/ch01_limbs/LimbScene3D.ts` | Original procedural 3D meshes · MIT | Used in Step 5 (*Homology vs. Analogy*) to contrast fused avian carpometacarpus (homologous as forelimb, analogous as wing) with chitinous venation of an insect wing (non-homologous). |
| Bone Ivory & Hand-Tinted Watercolour Procedural Textures | `atlas/src/chapters/ch01_limbs/LimbScene3D.ts` | Original HTML5 Canvas PBR textures (albedo + bump/roughness) · MIT | Emulates 19th-century osteological naturalist plates tinted with ochre (stylopod), verdigris teal (zeugopod), and carmine rose (autopod). |
| Archival Paper Grain Texture | `atlas/src/styles/tokens.css` | Inline SVG `feTurbulence` data URI · MIT | Tactile cotton rag paper surface with zero external requests. |

---

## Chapter 12: Tree Thinking & Molecular Clocks (`ch12_trees`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| 3D Swivel-Node Vertebrate Cladogram, Parsimony Trees, Neutral Clock Dial, Codon $d_N/d_S$ Helix & Translucent Human–Chimp–Gorilla ILS Species Tube | `atlas/src/chapters/ch12_trees/TreesScene3D.ts` | Original procedural Three.js meshes · MIT | Zero-box phylogenetic plates with real sculpted tip organisms (fish, mouse, lizard, bird), rotatable brass MRCA hinges, character-transition beads, and glowing deep-coalescence gene trees inside a translucent species tube. |

---

## Chapter 13: Splitting Branches (`ch13_species`) — Naturalist Watercolour Engine

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Naturalist Watercolour + Sepia-Ink 3D Craft Engine, Continuous-Lofted Greenish Warblers (*Phylloscopus trochiloides*), *Malus* Apple & *Crataegus* Hawthorn Botanical Twigs, *Tragopogon* Goatsbeard Blossoms & Interlocking Biopolymer Proteins | `atlas/src/3d/naturalistCraft.ts`, `atlas/src/3d/naturalistSpecimens.ts`, `atlas/src/chapters/ch13_species/SpeciesScene3D.ts` | Original continuous-lofted Three.js meshes & 512×512 watercolour/ink Canvas PBR textures · MIT | Full museum-plate craft inspired by Plate 11 & natural-history lithographs: continuous `createOrganicLoftGeometry` forms, Fresnel sepia-ink silhouette contours, matte watercolour pigment washes, and zero floating 3D floor-card clutter. |

---

## Chapter 14: Strata, Fossils & Mass Extinctions (`ch14_deeptime`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted Logarithmic Ammonite Deep-Time Spiral, Volcanic Zircon/Feldspar Crystal Cluster, Ellesmere Island *Tiktaalik roseae* Devonian Sandstone Slab, Morphing *Pakicetus*→*Balaenoptera* Cetacean Skeleton & K–Pg Stratified Cliff | `atlas/src/3d/naturalistSpecimens.ts` & `atlas/src/chapters/ch14_deeptime/DeepTimeScene3D.ts` | Original continuous-lofted osteology & watercolour/sepia-ink Canvas PBR textures · MIT | Natural-history paleontological plates featuring live nostril→blowhole & hindlimb→vestigial-pelvis 3D morphing and high-relief Devonian fossil osteology. |

---

## Chapter 15: Ecology in Motion (`ch15_ecology`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted Galápagos Ground Finches (*Geospiza fortis* & *G. magnirostris* with live morphing beaks), Pacific Sea Otters (*Enhydra lutris*), Purple Sea Urchins (*Strongylocentrotus purpuratus*) & Pacific Giant Kelp Fronds (*Macrocystis pyrifera*) | `atlas/src/3d/naturalistSpecimens.ts` & `atlas/src/chapters/ch15_ecology/EcologyScene3D.ts` | Original continuous-lofted meshes & 512×512 watercolour/sepia-ink Canvas PBR textures · MIT | Naturalist ecological plates illustrating Grant & Grant character displacement, Estes & Palmisano kelp trophic cascades, MacArthur–Wilson volcanic island biogeography, Ideal Free Distribution, and genetic rescue corridors. |

---

## Chapter 16: The Clinic & Human Origins (`ch16_clinic`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Antibiotic MIC/MPC Agar Petri Lawn, Sculpted Conjugating Bacilli + Arched Sex Pilus + Circular R-Plasmid, Clonal Cancer Tumour Mass with Micro-Capillaries, Live-Morphing Hominin Cranium Osteology (*A. afarensis* → *H. erectus* → *H. neanderthalensis* → *H. sapiens*), and Out-of-Africa Serial Founder Relief Map | `atlas/src/3d/naturalistSpecimens.ts` & `atlas/src/chapters/ch16_clinic/ClinicScene3D.ts` | Original continuous-lofted osteology/microbiology meshes & 512×512 watercolour/sepia-ink Canvas PBR textures · MIT | Natural-history applied-evolution & paleoanthropology plates demonstrating the Mutant-Selection Window + stewardship caveats, conjugative HGT, MTD competitive release vs. Adaptive Therapy, branching hominin bush morphometrics (vault, brow torus, occipital bun, prognathism, true chin), archaic admixture, and >85% within-population clinal variation. |

---

## Chapter 17: The Price Equation & The Commons (`ch17_price`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Sculpted Meadow Haystacks (Cooperator vs. Cheater Colonies), 3D Price Decomposition Pillars, Fisher FTNS Variance/Fitness Ribbons & Regression-Slope Rodent Pairs | `atlas/src/chapters/ch17_price/PriceScene3D.ts` | Original continuous-lofted watercolour Three.js meshes · MIT | Revives Tangled Bank Ch. VI (*The Commons* Haystack Model) with exact live Price Equation between-group vs. within-group partitioning, Simpson's paradox, Fisher's FTNS partial-change identity, Hamilton's Rule derivation, and weak vs. strong altruism. |

---

## Planned External Open-Licence Scans (Future Additions)

When external 3D scans or historical plates are added (e.g., *Whales Walking to Sea*, *Fossil Strata*, *Peppered Moth* natural-history plates), each item must be verified individually for **CC0 / Public Domain / CC-BY 4.0** (Smithsonian Open Access, MorphoSource, Biodiversity Heritage Library) and logged above before merge.
