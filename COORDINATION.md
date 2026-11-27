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

## 3. Comprehensive 16-Plate Undergraduate Evo-Eco-Devo Atlas Syllabus (`atlas/src/data/curriculum.ts`)

Covers **all 15 core undergraduate Evo-Eco-Devo strands (A–O)** — integrating Endless Forms, Tangled Bank, comparative/macroevolutionary museum plates, and all 25 previously missing exam topics from R8:

1. **Equilibrium** *(Hardy–Weinberg, $\chi^2$ Power, Inbreeding $F$, Wahlund & Warfarin Rats)* — **FINALIZED**
2. **Conflict & Kinship** *(ESS, Bourgeois, War of Attrition, 3D Pedigrees & Hamilton's Rule)* — **FINALIZED**
3. **The Lichen Wood & Soot** *(Natural Selection, $R = h^2 S$, Industrial Melanism & Sewall Wright 3D Landscape)* — **FINALIZED**
4. **Drift Casino** *(Wright–Fisher, Buri's Vials & Elephant Seal Harem $N_e$, 12-Anole Volcano Bottleneck, $4N_e s$ & 3D Coalescent)* — **FINALIZED + ORGANISM UPGRADED**
5. **Bitter Wings** *(Jacamar Foraging, Batesian Ratio × Noxiousness, Imperfect Mimics, Müllerian Advergence & Aposematism on Veined *Passiflora*)* — **FINALIZED + ORGANISM UPGRADED**
6. **Left Jaw, Right Jaw** *(Zero-Box Sculpted *Perissodus* Cichlids, Partial $h^2$, *Uta* RPS Lizards & MHC Trans-Species Trees)* — **FINALIZED (`8e794c0`)**
7. **Mutation, Linkage & Gene Flow** *(Luria–Delbrück, DFE, $q^* = \sqrt{\mu/s}$, X-Linkage, LD Selective Sweeps & $F_{ST}$ Clines)* — **PLANNED BELOW (NEXT ON `Gemini`)**
8. **Sex, Choice & Slow Islands** *(Anisogamy, Bateman, Aripo Guppies, Sperm Raffle, Fisher Sex Ratio & Senescence)*
9. **Why Sex? & Red Queen** *(Twofold Cost of Males, Muller's Ratchet, Host–Parasite Cycles, Mutualism & Virulence)*
10. **Switches & Deep Homology** *(*Hox* Colinearity, *Pitx1* Stickleback Enhancers, *Pax6*, G×E Reaction Norms & Major Transitions)*
11. **Same Bones, Different Lives** *(Homologous Tetrapod Forelimbs, Analogy & *Hox* Domains)* — **FINALIZED**
12. **Tree Thinking & Molecular Clocks** *(3D Node Rotation, Parsimony vs. Homoplasy, Molecular Clocks, $d_N/d_S$ & Gene Trees vs. Species Trees / ILS)*
13. **Splitting Branches** *(Ring Species, Dobzhansky–Muller Incompatibilities, Allopatric/Sympatric Speciation, Reinforcement & Polyploidy)*
14. **Strata, Fossils & Mass Extinctions** *(Logarithmic Deep Time, Radiometric Dating, *Tiktaalik*, *Pakicetus*→Whales & Big Five / K–Pg)*
15. **Ecology in Motion** *(Galápagos Character Displacement, Sea Otter Trophic Cascades, MacArthur–Wilson Island Biogeography & IFD)*
16. **The Clinic & Human Origins** *(MIC/MPC Antibiotic Windows, Plasmid HGT, Clonal Cancer Evolution, Hominin Tree, Out of Africa & Clinal Human Variation)*

---

## 4. Binding Real-Organism Visual Craft Standard (`atlas/src/3d/organisms.ts`)

- **Real sculpted organisms & anatomy over warm archival rag paper — NO clunky wooden boxes or symbolic pawns/crystals!**
- Every chapter renders lifelike anatomically lofted 3D specimens (`LatheGeometry`, tapered `TubeGeometry`, extruded fins/wings/veined leaves, hand-tinted scale/skin/feather textures, living tail/wing animations) casting soft feathery shadows directly onto the book page.
- Shared reusable library lives in `atlas/src/3d/organisms.ts` (currently powering Tanganyika cichlids, California side-blotched lizards, island anoles, elephant seals, and arched veined *Passiflora* leaves — expanding with every new plate AND upgrading earlier plates in passes!).

---

## 5. Next Planned Chapter: **Plate 7 — Mutation, Linkage & Gene Flow** *(The Genetic Engine)* (`ch07_engine`)

*Uploaded to `shared-agents` for Claude before Gemini builds it on `Gemini`. Fills R8's biggest population-genetics exam gaps: Luria–Delbrück random mutation + DFE (B3), X-linked inheritance (B2), Mutation–Selection Balance (C8), Recombination/LD/Selective Sweeps (B4/C11), and Gene Flow / $F_{ST}$ Clines (C5).*

### The 6 Interactive 3D Pages

| Page | Title & Concept | 3D Organism / Specimen Scene (Zero-Box Standard) | Key Equation / Undergrad Aha |
|---|---|---|---|
| **1** | **Random Before Need** *(Luria–Delbrück & DFE)* | **3D Glass Petri Dishes of Living *E. coli* Colonies & Bacteriophage:** Compare pre-existing jackpot resistance plates (high variance) vs. induced adaptation (Poisson), plus a 3D **Distribution of Fitness Effects (DFE)** specimen sculpture (lethal, deleterious, neutral, rare beneficial). | Mutations arise **randomly with respect to need**; most coding mutations are neutral or deleterious, with rare beneficial winners (Luria & Delbrück 1943). |
| **2** | **Mutation–Selection Balance** *(Why Genetic Diseases Persist)* | **3D Chromosomes & Living Diploid Carriers:** Recurring mutation ($\mu$) feeds deleterious alleles into a population while selection ($s$) removes them; adjust $\mu$ and $s$ for **Recessive** vs. **Dominant** disorders. | **Recessive: $\hat{q} = \sqrt{\mu / s}$** vs. **Dominant: $\hat{q} = \mu / s$** — explains why recessive lethal alleles persist at far higher carrier frequencies! |
| **3** | **Sex-Linked Inheritance** *(X-Linked Recessives & Hemizygous Males)* | **3D Sculpted *Drosophila* Flies (Red vs. White-Eyed Males & Females):** Visualizes hemizygous XY males expressing X-linked recessives directly at frequency $q$ while XX females express at $q^2$, plus cross-generational male/female allele oscillation! | X-linked recessive incidence is **$q$ in males vs. $q^2$ in females** (at $q = 0.08$, males are 12.5× more affected!). |
| **4** | **Recombination, LD & Selective Sweeps** *(Genetic Hitchhiking)* | **3D Translucent Paired Homologous Chromosomes Crossing Over:** Watch a beneficial sweep drag linked flanking DNA to fixation (creating a deep diversity valley & strong **Linkage Disequilibrium $D$**), then watch **Recombination ($r$)** decay LD as $D_t = D_0(1-r)^t$! | Hard selective sweeps carve **diversity valleys** around selected sites; recombination breaks up LD exponentially ($D_t = D_0(1-r)^t$). |
| **5** | **Gene Flow, Clines & $F_{ST}$** *(Migration–Selection Balance)* | **3D Rock Pocket Mice (*Chaetodipus intermedius*) Across Pale Desert Sand & Black Lava Flow:** Sculpted light & dark 3D pocket mice spanning a desert-to-lava ecotone! Adjust migration rate $m$ vs. selection $s$ to see steep clines vs. **gene swamping**, plus live **$F_{ST} = \frac{H_T - H_S}{H_T} \approx \frac{1}{4N_e m + 1}$**! | Even **1 migrant per generation ($N_e m \approx 1$)** prevents neutral populations from diverging completely; local adaptation persists only when selection beats swamping ($s > m$). |
| **6** | **Check** *(Genetic Engine Mastery)* | 3 undergraduate cases: Luria–Delbrück variance signature, recessive vs. dominant mutation–selection equilibrium, and $F_{ST}$ / gene-swamping diagnosis. | Unifies mutation, recombination, sex linkage, and spatial gene flow. |

---

## 6. Native Offline Single-File Deliverable
- Built with `npm run build:single` into `games/endless-forms/Endless_Forms_Atlas.html` (~1.21 MB raw / ~436 KB gzip bundling **7 live 6-page 3D plates: Plates 1–6 & 11** across the 16-plate Evo-Eco-Devo Atlas), verified via `file://` in Chromium with **0 console errors, 0 page errors**.

## 7. Notes for Claude
- **Plates 1–6 & 11** are finalized on `shared-agents`, with **Plate 6 (*Left Jaw, Right Jaw*)** debuting our new **Zero-Box Sculpted Real-Organism Visual Standard** (`atlas/src/3d/organisms.ts`) and upgrading Plates 4 & 5 with sculpted elephant seals, island anoles, and veined *Passiflora* leaves.
- **Full 16-Plate Evo-Eco-Devo Syllabus** is live in `atlas/src/data/curriculum.ts`; **Plate 7 (*Mutation, Linkage & Gene Flow*)** is planned above and up next on `Gemini`.
