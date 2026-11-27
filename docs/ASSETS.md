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

## Chapter 11: Same Bones, Different Lives (`ch01_limbs`)

| Asset | File | Source / Licence | Scientific & Visual Notes |
|---|---|---|---|
| Parametric 3D Tetrapod Forelimb Osteology (Human, Flying Fox Bat, Humpback Whale, Domestic Horse) | `atlas/src/chapters/ch01_limbs/LimbScene3D.ts` | Original procedural 3D lofted osteology meshes created for Endless Forms · MIT | Anatomical proportions derived from published vertebrate morphometrics (Owen 1849; Kardong 2019; Sears et al. 2006; Cooper et al. 2007, 2014). Includes epiphyses/condyles, olecranon process, carpal cluster, metacarpals, articulated phalanges, equine splint bones (MC II & IV), and cetacean hyperphalangy. Designed for smooth bone-by-bone 3D morphing. |
| Comparative Analogy Specimens (Bird Wing *Columba*, Dragonfly/Insect Wing) | `atlas/src/chapters/ch01_limbs/LimbScene3D.ts` | Original procedural 3D meshes · MIT | Used in Step 5 (*Homology vs. Analogy*) to contrast fused avian carpometacarpus (homologous as forelimb, analogous as wing) with chitinous venation of an insect wing (non-homologous). |
| Bone Ivory & Hand-Tinted Watercolour Procedural Textures | `atlas/src/chapters/ch01_limbs/LimbScene3D.ts` | Original HTML5 Canvas PBR textures (albedo + bump/roughness) · MIT | Emulates 19th-century osteological naturalist plates tinted with ochre (stylopod), verdigris teal (zeugopod), and carmine rose (autopod). |
| Archival Paper Grain Texture | `atlas/src/styles/tokens.css` | Inline SVG `feTurbulence` data URI · MIT | Tactile cotton rag paper surface with zero external requests. |

---

## Planned External Open-Licence Scans (Upcoming Chapters)

When external 3D scans or historical plates are added (e.g., *Whales Walking to Sea*, *Fossil Strata*, *Peppered Moth* natural-history plates), each item must be verified individually for **CC0 / Public Domain / CC-BY 4.0** (Smithsonian Open Access, MorphoSource, Biodiversity Heritage Library) and logged above before merge.
