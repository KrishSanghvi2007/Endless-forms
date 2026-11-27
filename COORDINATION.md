# Endless Forms — Multi-Agent Coordination & Atlas Plan

*Updated: 2026-11-27 | Maintained on `shared-agents` so Gemini and Claude stay synced without colliding on each other's branches.*

---

## 1. Branch & Ownership Rules (Binding)

| Branch | Owner | Purpose |
|---|---|---|
| `Gemini` | Gemini | Gemini's primary build branch for the Endless Forms Atlas (`atlas/`) and docs. |
| `claude/evolution-game-critique-9m7vmx` | Claude | Claude's working branch. **Gemini never writes, commits, or pushes here.** |
| `shared-agents` | Shared | Shared planning, contracts, API specs, and milestone syncs. |
| `main` | Designer | Protected / merged by designer via PR. |

- Whenever a chapter is planned, the plan is committed and pushed here on `shared-agents` for Claude to see before building on `Gemini`.
- Legacy `games/endless-forms/` (v1 & v2) stays untouched as reference and math/sim source.

---

## 2. Designer Clarification (27 Nov 2026 — Binding)

- **Do NOT copy Techartist's website or school syllabus.**
- **Use Techartist ONLY as inspiration** for design craft, visual polish, tactile aesthetics, clean UI, and effortless communicability (archival rag paper, open-book layout, soft 3D shadows, clear editorial typography, direct manipulation, zero clunky dark dashboards).
- **Build OUR OWN app with OUR OWN Endless Forms concepts**, starting with the chapters **already in Endless Forms** — beginning right now with **Equilibrium (Hardy–Weinberg & What Breaks It)** as a **multi-page interactive Three.js 3D chapter**.

---

## 3. Atlas Curriculum Order (Our Own Endless Forms Spine)

The Atlas Table of Contents (`atlas/src/data/curriculum.ts`) is organized around **Endless Forms' actual undergraduate evolutionary biology curriculum** (D2 / D6):

1. **Equilibrium** *(Hardy–Weinberg & What Breaks It)* — **FINALIZED on `shared-agents`**
2. **Conflict & Kinship** *(Evolutionary Game Theory & Kin Selection)* — **FINALIZED on `shared-agents`**
3. **The Lichen Wood & Soot** *(Natural Selection, $R = h^2 S$, Industrial Melanism & 3D Fitness Landscapes)* — **FINALIZED on `shared-agents`**
4. **Drift Casino** *(Genetic Drift, Buri's Bottles & $N_e$, 12-Allele Bottlenecks, $4N_e s$ & 3D Kingman Coalescent)* — **FINALIZED on `shared-agents`**
5. **Bitter Wings** *(Batesian & Müllerian Mimicry, Predator Learning, Advergence & Aposematism)* — **FINALIZED on `shared-agents` (`d2bc5d9`)**
6. **Left Jaw, Right Jaw** *(Negative Frequency-Dependent Selection in Lake Tanganyika & Side-Blotched Lizard RPS)* — **PLANNED BELOW (NEXT UP ON `Gemini`)**
7. **The Raffle** *(Sperm Competition, Storage & Sexual Selection)* — Queued
8. **Why Sex?** *(Twofold Cost of Males & Red Queen Coevolution)*
9. **Switches** *(Evo-Devo, Cis-Regulatory Enhancers & Hox Circuits)*
10. **The Clinic** *(Antibiotic Resistance, MIC/MPC & Plasmids)*
11. **Same Bones, Different Lives** *(Comparative Tetrapod Anatomy — **FINALIZED on `shared-agents`**)*

---

## 4. Finalized Chapters on `shared-agents` (6 of 11 Plates Complete!)

- **Plate 1 — *Equilibrium (Hardy–Weinberg & What Breaks It)*** (`ch01_hwe`): 6-page 3D chapter.
- **Plate 2 — *Conflict & Kinship (Evolutionary Game Theory & Kin Selection)*** (`ch02_social`): 6-page 3D chapter.
- **Plate 3 — *The Lichen Wood & Soot (Natural Selection, $R = h^2 S$ & Landscapes)*** (`ch03_lichen`): 6-page 3D chapter.
- **Plate 4 — *Drift Casino (Genetic Drift, $N_e$, Bottlenecks, $4N_e s$ & 3D Coalescent)*** (`ch04_casino`): 6-page 3D chapter.
- **Plate 5 — *Bitter Wings (Batesian & Müllerian Mimicry, Imperfect Mimics & Aposematism)*** (`ch05_bitter`): 6-page 3D chapter (raycastable Neotropical clearing & jacamar, Batesian ratio × noxiousness shield ring, 0–100% imperfect mimicry tray, Müllerian *Heliconius* advergence, solitary vs. kin-clustered aposematic larvae, Check).
- **Plate 11 — *Same Bones, Different Lives*** (`ch01_limbs`): 6-page 3D homologous tetrapod limb morphing chapter.

---

## 5. Next Planned Chapter: **Left Jaw, Right Jaw** *(Negative Frequency-Dependent Selection & Balancing Polymorphism)* (`ch06_jaws`)

*Uploaded to `shared-agents` for Claude before Gemini builds it on `Gemini`. Features Lake Tanganyika scale-eating cichlids (Perissodus microlepis, Hori 1993) with visibly twisted 3D jaws, realistic partial heritability ($h^2 \approx 0.25$ vs. $0.90$, Takeuchi et al. 2012), and California side-blotched lizards (Uta stansburiana, Sinervo & Lively 1996) cycling Rock–Paper–Scissors.*

### The 6 Interactive 3D Pages

| Page | Title & Concept | 3D Scene (Three.js) & Direct Manipulation | Key Equation / Undergrad Aha |
|---|---|---|---|
| **1** | **Guard the Flanks** *(Scale-Eating Cichlids in Lake Tanganyika)* | **3D Lake Tanganyika Shallows:** Turquoise sunlit sand & shell bed with silver-coral prey cichlids wearing movable golden **Left/Right Flank Guard Plates** and a visibly bent-jawed **3D *Perissodus microlepis*** predator ambushing from behind! Guard the commoner flank and watch the rarer jaw morph slip through. | **Negative frequency-dependent selection (NFDS):** the rarer morph has the feeding edge, preventing either morph from fixing (Hori 1993). |
| **2** | **The 5-Year Oscillation** *(Lag & Overshoot Around 50:50)* | **3D Tanganyika Morph Pillars + Live Cycle Ribbon:** Step seasons as prey vigilance lags 1 season behind predator composition — watch Left-jawed and Right-jawed frequencies oscillate continuously around 50:50 with a ~5-year period! | Vigilance lag causes damped/sustained **oscillations** around equilibrium; under NFDS, neither type "wins" — **both morphs persist**. |
| **3** | **Partial Heritability ($h^2 \approx 0.25$ vs. $0.90$)** *(Continuous Jaw Asymmetry)* | **3D Continuous Jaw-Angle Histogram Sculpture:** Compare classic single-locus Mendelian expectations ($h^2 \approx 0.9$) against realistic empirical partial heritability ($h^2 \approx 0.25$, Takeuchi et al. 2012 / Stewart & Albertson 2010), where feeding experience also shapes jaw bend! | Lower heritability damps cycle amplitude and slows evolutionary response ($R = h^2 S$) while still maintaining balancing polymorphism. |
| **4** | **Rock–Paper–Scissors Lizards** *(Intransitive 3-Morph Cycling — Uta stansburiana)* | **3D California Coastal Sage Hillside:** Sculpted 3D **side-blotched lizards** with **Orange** (ultra-dominant), **Blue** (mate-guarder), and **Yellow** (sneaker) throat badges arranged around a **3D Ternary Simplex Ring** showing the non-transitive 3-way cycle! | **Intransitive dominance** (Orange beats Blue, Blue beats Yellow, Yellow beats Orange; Sinervo & Lively 1996) creates a perpetual 3-morph evolutionary orbit! |
| **5** | **Balancing Selection & Genomic Footprints** *(MHC, Self-Incompatibility & Tajima's $D > 0$)* | **3D Trans-Species Polymorphism Gene Tree:** Contrasts shallow neutral genealogies against ultra-deep **balancing-selection trees** (MHC immune loci / plant $S$-alleles) where alleles stay polymorphic for tens of millions of years (**Tajima's $D > 0$**)! | Long-term balancing selection maintains ancient allelic lineages across speciation events and leaves an excess of intermediate-frequency variants ($D > 0$). |
| **6** | **Check** *(NFDS & Balancing Selection Mastery)* | 3 diagnostic undergraduate puzzles uniting *Perissodus* vigilance lag, *Uta* Rock–Paper–Scissors intransitivity, and balancing-selection Tajima's $D > 0$ footprints. | Connects ecological interactions directly to genomic signatures of balancing selection. |

---

## 6. Native Offline Single-File Deliverable
- Built with `npm run build:single` into `games/endless-forms/Endless_Forms_Atlas.html` (~1.15 MB raw / ~420 KB gzip bundling **Plates 1, 2, 3, 4, 5 & 11**), verified directly via `file://` in Chromium with **0 console errors, 0 page errors**.

## 7. Notes for Claude
- **6 full 6-page 3D chapters (Plates 1, 2, 3, 4, 5 & 11)** are now finalized and merged on `shared-agents`!
- **Chapter 6 (*Left Jaw, Right Jaw*)** is planned in §5 above and queued next on `Gemini`.
