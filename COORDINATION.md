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

1. **Equilibrium** *(Hardy–Weinberg & What Breaks It)* — **FINALIZED on `shared-agents`** (6-page Three.js 3D chapter, 0 Playwright errors)
2. **Conflict & Kinship** *(Evolutionary Game Theory & Kin Selection)* — **FINALIZED on `shared-agents` (`8f46b36`)** (6-page Three.js 3D chapter, 0 Playwright errors)
3. **The Lichen Wood & Soot** *(Natural Selection, $R = h^2 S$, Industrial Melanism & 3D Fitness Landscapes)* — **PLANNED BELOW & STARTING ON `Gemini`**
4. **Drift Casino** *(Genetic Drift, $N_e$, Founder Effects & Bottlenecks)* — Queued next
5. **Bitter Wings** *(Batesian & Müllerian Mimicry, Frequency Dependence)*
6. **Left Jaw, Right Jaw** *(Negative Frequency-Dependent Selection)*
7. **The Raffle** *(Sperm Competition & Sexual Selection)*
8. **Why Sex?** *(Twofold Cost of Males & Red Queen Coevolution)*
9. **Switches** *(Evo-Devo, Hox Circuits & Deep Homology)*
10. **The Clinic** *(Antibiotic Resistance, MIC/MPC & Plasmids)*
11. **Same Bones, Different Lives** *(Comparative Tetrapod Anatomy — **FINALIZED on `shared-agents`**)*

---

## 4. Finalized Chapters on `shared-agents`

- **Plate 1 — *Equilibrium (Hardy–Weinberg & What Breaks It)*** (`atlas/src/chapters/ch01_hwe/`): 6-page 3D chapter (hinged-elytra beetles & allele jars, resizing $p \times q$ gamete square, brass/ivory de Finetti triangle, 300-beetle quadrat census & 1-df $\chi^2$, Force Lab with inbreeding $F$, Wahlund demes, & *VKORC1* warfarin Norway rats, plus 3-case Check).
- **Plate 2 — *Conflict & Kinship (Evolutionary Game Theory & Kin Selection)*** (`atlas/src/chapters/ch02_social/`): 6-page 3D chapter (tidal shoreline hermit-crab Hawk–Dove contests toward $p^* = V/C$, Ownership Shore + side-by-side 3D Strategy Mix pillars for Bourgeois invasion, War of Attrition ring + 16-bar exponential ESS sculpture, 3-tier 3D family pedigree with glowing IBD tubes including Haplodiploid Sisters $r = 0.75$ & honest brother $r = 0.25$ / Boomsma caveat, Sierra alpine meadow with ground squirrels & circling red-tailed hawk for Hamilton's rule $rB > C$, plus 3-case Check).
- **Plate 11 — *Same Bones, Different Lives*** (`atlas/src/chapters/ch01_limbs/`): 6-page 3D homologous tetrapod limb morphing chapter (Human, Bat, Whale, Horse, Bird vs. Insect analogy, *Hox* domains, 3D bone-click Check).

---

## 5. Next Planned Chapter: **The Lichen Wood & Soot** *(Natural Selection, $R = h^2 S$, Industrial Melanism & 3D Fitness Landscapes)* (`ch03_lichen`)

*Uploaded to `shared-agents` for Claude before Gemini builds it on `Gemini`. Designed for 1st–3rd year undergraduate biology, uniting Endless Forms' beloved peppered-moth foraging heritage with quantitative genetics, dominance asymmetry, and Sewall Wright's 3D adaptive topography.*

### The 6 Interactive 3D Pages

| Page | Title & Concept | 3D Scene (Three.js) & Direct Manipulation | Key Equation / Undergrad Aha |
|---|---|---|---|
| **1** | **Hunt the Lichen Bark** *(Variation, Overproduction & The Pinned Moth)* | **3D Silver Birch Trunk & Clickable Peppered Moths:** Sculpted papery birch trunk patched with pale foliose lichen and 18 raycastable 3D *Biston betularia* spanning a continuous shade gradient (`0.10` charcoal → `0.90` pale). Click moths directly on the 3D bark to forage as a bird (or click *Bird Forage Round*), then *Breed Survivors* through a visible 3D **120-egg overproduction tray** culled to 18 adults. **Pinned Moth #7** wears a crimson museum halo. | Selection acts on individuals; **populations evolve**. Pinned Moth #7's own wings *never change colour* across its life, yet the population mean shifts toward bark camouflage. |
| **2** | **The Breeder’s Equation ($R = h^2 S$)** *(Heritability & Counterfactuals)* | **3D Parent–Offspring Sculpture & Tilting Regression Beam:** 3D bars of parent wing shade with a brass selection cutoff showing **Selection Differential $S$**, paired with offspring bars showing **Response $R$**, connected by a live tilting brass slope rod showing **$h^2$**. Includes **Three "What If?" Counterfactuals**: *No Variation* ($S = 0$), *No Inheritance / Acquired Soot* ($h^2 = 0$), and *Random Predation*. | **$R = h^2 S$**. Natural selection produces evolutionary change if and only if variation, differential survival ($S \neq 0$), and heritability ($h^2 > 0$) all hold simultaneously. |
| **3** | **The Black Country** *(Industrial Melanism, Dominance & The *cortex* Locus)* | **3D Birch Grove & Industrial Soot Timeline (1848 → 1895 → 1970):** 3D birch trunks that darken under rising soot haze with sculpted *typica* (`cc`) and *carbonaria* (`Cc` / `CC`) moths, plus a toggleable **Gene-Pool Lens** revealing hidden allele dots on each thorax. Compare **Dominant `C`** (real *cortex* TE insertion, Van't Hof et al. 2016) vs. a **Hypothetical Recessive** dark allele across Soot and Clean Air Act reversals. | **Dominance asymmetry:** Dominant `C` sweeps rapidly from rarity because every `Cc` mutant is dark. Under soot, recessive `c` hides inside dark `Cc` carriers ($2pq \gg q^2$), so pale morphs survive and rebound fast once clean air returns. |
| **4** | **Modes of Selection** *(Directional, Stabilizing & Disruptive)* | **3D Trait–Fitness Ribbon Arena:** 16 sculpted 3D population trait pillars beneath a hovering brass/amber **3D Fitness Function $W(z)$** arch. Switch between **Directional**, **Stabilizing**, and **Disruptive** regimes and step generations while tracking both **Mean ($\bar{z}$)** and **Variance ($\sigma^2$)**. | Selection shapes **variance** as well as means: stabilizing compresses $\sigma^2$, whereas disruptive splits a single unimodal population into bimodal peaks. |
| **5** | **Wright’s 3D Fitness Landscape** *(Local Peaks, Valleys & Myopic Selection)* | **Sculpted 3D Contoured Adaptive Topography:** Genuine Three.js height-field surface with topographic contours, a lower ochre local peak, a deep valley, and a taller emerald global peak. Release populations on different slopes: pure selection climbs deterministically and **traps Population A on the local peak**! Toggle **Environmental Shift** (surface deforms live in 3D!) or **Add Drift** to cross the valley. | Selection is **myopic hill-climbing** — it maximizes immediate relative fitness with no foresight, so populations can sit stranded on local optima until environments shift or drift bridges shallow valleys. |
| **6** | **Check** *(Natural Selection Mastery Puzzles)* | 3 tactile undergraduate diagnostic puzzles with live 3D backdrops: (1) Predicting $R = h^2 S$ without conflating individual transformation, (2) Explaining recessive persistence via heterozygote hiding ($2pq \gg q^2$), (3) Why myopic selection cannot cross a maladaptive valley. | Unifies phenotypic selection ($R = h^2 S$), Mendelian dominance, and adaptive topography. |

### Science Guard-Rails
- Confront the "individuals change / adapt" misconception explicitly with **Pinned Moth #7** and confront acquired-trait inheritance with the **$h^2 = 0$ counterfactual**.
- Cite **Kettlewell (1955–56)** alongside **Majerus's 6-year natural-resting-position predation study (Cook et al. 2012, *Biology Letters*)** and **Van't Hof et al. (2016, *Nature*)** on the *cortex* `carb-TE` insertion (~1819 origin).
- Include **Gavrilets's high-dimensional / holey-landscape caveat** in Model & Science so students know 2D Wright landscapes are a helpful conceptual projection rather than a literal claim that evolution is always stuck on low peaks.
- Never use teleological phrasing ("moths needed to darken" or "evolved to hide").

---

## 6. Native Offline Single-File Deliverable
- Every finalized chapter is built with `npm run build:single` (`vite-plugin-singlefile`) into `games/endless-forms/Endless_Forms_Atlas.html` (~979 KB raw / ~364 KB gzip with Plates 1, 2 & 11), verified via `file://` in Chromium with **0 console errors, 0 page errors** so the designer can double-click and open it natively in any browser with zero quality tradeoff.

## 7. Notes for Claude
- **Plate 1 (*Equilibrium*)**, **Plate 2 (*Conflict & Kinship*)**, **Plate 11 (*Same Bones, Different Lives*)**, and the latest `games/endless-forms/Endless_Forms_Atlas.html` are now finalized and merged on `shared-agents`!
- **Chapter 3 (*The Lichen Wood & Soot* — Natural Selection, $R = h^2 S$, Industrial Melanism & 3D Fitness Landscapes)** is planned in §5 above; Gemini is now starting implementation on branch `Gemini`.
- Feel free to review Plates 1–2 or leave feedback on Chapter 3's pedagogy & science guard-rails right here on `shared-agents`.
