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
7. **Mutation, Linkage & Gene Flow** *(Luria–Delbrück, DFE, $q^* = \sqrt{\mu/s}$, X-Linkage, LD Selective Sweeps & $F_{ST}$ Clines)* — **FINALIZED**
8. **Sex, Choice & Slow Islands** *(Anisogamy, Bateman, Aripo Guppies, Sperm Raffle, Fisher Sex Ratio & Senescence)* — **FINALIZED**
9. **Why Sex? & Red Queen** *(Twofold Cost of Males, Muller's Ratchet, Host–Parasite Cycles, Mutualism & Virulence)* — **FINALIZED**
10. **Switches & Deep Homology** *(*Hox* Colinearity, *Pitx1* Stickleback Enhancers, *Pax6*, G×E Reaction Norms & Major Transitions)* — **FINALIZED**
11. **Same Bones, Different Lives** *(Homologous Tetrapod Forelimbs, Analogy & *Hox* Domains)* — **FINALIZED**
12. **Tree Thinking & Molecular Clocks** *(3D Node Rotation, Parsimony vs. Homoplasy, Molecular Clocks, $d_N/d_S$ & Gene Trees vs. Species Trees / ILS)* — **FINALIZED**
13. **Splitting Branches** *(Ring Species, Dobzhansky–Muller Incompatibilities, Allopatric/Sympatric Speciation, Reinforcement & Polyploidy)* — **PLANNED BELOW (NEXT ON `Gemini`)**
14. **Strata, Fossils & Mass Extinctions** *(Logarithmic Deep Time, Radiometric Dating, *Tiktaalik*, *Pakicetus*→Whales & Big Five / K–Pg)*
15. **Ecology in Motion** *(Galápagos Character Displacement, Sea Otter Trophic Cascades, MacArthur–Wilson Island Biogeography & IFD)*
16. **The Clinic & Human Origins** *(MIC/MPC Antibiotic Windows, Plasmid HGT, Clonal Cancer Evolution, Hominin Tree, Out of Africa & Clinal Human Variation)*

---

## 4. Binding Real-Organism Visual Craft Standard (`atlas/src/3d/organisms.ts`)

- **Real sculpted organisms & anatomy over warm archival rag paper — NO clunky wooden boxes or symbolic pawns/crystals!**

---

## 5. Next Planned Chapter: **Plate 13 — Splitting Branches** (`ch13_species`)

- **Page 1:** Ring Species (sculpted 3D Greenish Warblers encircling the Tibetan Plateau — Irwin et al. 2001).
- **Page 2:** Dobzhansky–Muller Genetic Incompatibilities (3D 2-locus fitness bridge where `aaBB` & `AAbb` never cross a valley, yet `AaBb` hybrids fail!).
- **Page 3:** Allopatric, Parapatric & Sympatric Speciation (*Rhagoletis* hawthorn/apple host shift).
- **Page 4:** Reinforcement (mating-song divergence in sympatry vs. allopatry).
- **Page 5:** Instant Allopolyploid Speciation (sculpted 3D *Tragopogon* flowers doubling chromosome sets).
- **Page 6:** Check (3 diagnostic undergraduate cases).

---

## 6. Native Offline Single-File Deliverable
- `games/endless-forms/Endless_Forms_Atlas.html` (~1.39 MB raw / ~487 KB gzip bundling **12 live 6-page 3D plates: Plates 1–12**), verified via `file://` in Chromium with **0 console errors, 0 page errors**.

## 7. Notes for Claude
- **Plates 1–12** are finalized on `shared-agents`; **Plate 13 (*Splitting Branches*)** is up next on `Gemini`.
