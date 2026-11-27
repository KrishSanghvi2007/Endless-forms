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
4. **Drift Casino** *(Genetic Drift, Buri's Bottles & $N_e$, 12-Allele Bottlenecks, $4N_e s$ & 3D Kingman Coalescent)* — **FINALIZED on `shared-agents` (`b351a2d`)**
5. **Bitter Wings** *(Batesian & Müllerian Mimicry, Predator Learning, Advergence & Aposematism)* — **PLANNED BELOW & STARTING ON `Gemini`**
6. **Left Jaw, Right Jaw** *(Negative Frequency-Dependent Selection in Lake Tanganyika)* — Queued next
7. **The Raffle** *(Sperm Competition, Storage & Sexual Selection)*
8. **Why Sex?** *(Twofold Cost of Males & Red Queen Coevolution)*
9. **Switches** *(Evo-Devo, Cis-Regulatory Enhancers & Hox Circuits)*
10. **The Clinic** *(Antibiotic Resistance, MIC/MPC & Plasmids)*
11. **Same Bones, Different Lives** *(Comparative Tetrapod Anatomy — **FINALIZED on `shared-agents`**)*

---

## 4. Finalized Chapters on `shared-agents`

- **Plate 1 — *Equilibrium (Hardy–Weinberg & What Breaks It)*** (`ch01_hwe`): 6-page 3D chapter.
- **Plate 2 — *Conflict & Kinship (Evolutionary Game Theory & Kin Selection)*** (`ch02_social`): 6-page 3D chapter.
- **Plate 3 — *The Lichen Wood & Soot (Natural Selection, $R = h^2 S$ & Landscapes)*** (`ch03_lichen`): 6-page 3D chapter.
- **Plate 4 — *Drift Casino (Genetic Drift, $N_e$, Bottlenecks, $4N_e s$ & 3D Coalescent)*** (`ch04_casino`): 6-page 3D chapter (6 Wright–Fisher crystal jars, Buri's 12 *Drosophila* vials & harem $N_e$, 12-allele volcano archipelago bottleneck, Kimura $4N_e s$ tug-of-war ribbons, 3D Kingman coalescent tower, Check).
- **Plate 11 — *Same Bones, Different Lives*** (`ch01_limbs`): 6-page 3D homologous tetrapod limb morphing chapter.

---

## 5. Next Planned Chapter: **Bitter Wings** *(Batesian & Müllerian Mimicry, Predator Learning & Aposematism)* (`ch05_bitter`)

*Uploaded to `shared-agents` for Claude before Gemini builds it on `Gemini`. Honours Chai (1986) rufous-tailed jacamar biology, Lindström et al. (1997) / Sherratt (2002) nuanced Batesian ratios, Turner's two-step Müllerian advergence (avoiding the "supergene" error for H. erato/melpomene), and Langham (2004) / Sillén-Tullberg (1988) aposematism origin.*

### The 6 Interactive 3D Pages

| Page | Title & Concept | 3D Scene (Three.js) & Direct Manipulation | Key Equation / Undergrad Aha |
|---|---|---|---|
| **1** | **Forage as a Jacamar** *(Taste, Retch & Avoid — Batesian Mimicry)* | **3D Neotropical Rainforest Clearing:** Sculpted 3D **butterflies** (crimson-and-black banded unpalatable *Heliconius* models, creamy palatable non-mimics, and crimson-banded palatable **Batesian mimics**) + glassy-winged **dragonflies** fluttering over tropical foliage! Click butterflies directly in 3D (raycast!) to forage as a **rufous-tailed jacamar (*Galbula ruficauda*)** — tasting a bitter model triggers a golden taste-memory shock and builds predator avoidance! | Harmless **Batesian mimics** borrow protection from defended models via predator avoidance learning (Chai 1986; Bates 1862). |
| **2** | **Model-to-Mimic Ratio & Noxiousness** *(Why "Only While Rare" Is Too Simple)* | **3D Forest Canopy & Avoid-Ring Meter:** Adjust **Model:Mimic ratio** (`12:4` → `4:12` → `2:14`) AND **Model Unpalatability** (mildly bitter vs. violently noxious!). Watch the glowing dashed **Avoidance Shield Ring** around the red-banded pattern shatter when mimics swamp mild models — yet hold firm even when mimics outnumber *highly noxious* models! | Batesian mimicry works **best while mimics are rare relative to models**, but critical threshold depends on **both** ratio and model unpalatability (Lindström et al. 1997; Sherratt 2002). |
| **3** | **Imperfect Mimicry & Deadly Days** *(When "Good Enough" Survives)* | **3D Specimen Lineup (Resemblance Spectrum `0% → 100%`):** 6 sculpted 3D butterflies graded from pale cream non-mimic to exact crimson-band mimic beneath a live **3D Predator Attack-Probability Curve**. Compare **Low-Cost Model** (only exact mimics escape!) vs. **Highly Noxious Model** (even rough 55% imperfect mimics enjoy steep protection!). | High cost of mistakes flattens predator generalization gradients — explaining why many real hoverflies and butterflies persist as **imperfect mimics** (Sherratt 2002). |
| **4** | **Müllerian Mimicry & Advergence** *(Sharing the Education Cost)* | **3D Twin-Species Meadow (*Heliconius erato* & *H. melpomene*):** Two **both-defended** unpalatable species (common **Red-Band** vs. rare **Yellow-Spot**). Step generations to watch the rarer species **adverge** onto the commoner pattern via a **large-effect locus** (*optix* / *WntA* — Turner's two-step model!) and compare per-capita learning losses ($L/N_1$ vs. $L/(N_1+N_2)$)! | **Müllerian co-mimics share the fixed cost $L$ of teaching naive predators** (Müller 1879). Mortality drops from $L/N_1$ to $L/(N_1+N_2)$, creating **positive** frequency-dependent selection (advergence of rarer onto commoner). |
| **5** | **Origin of Warning Colouration** *(Anti-Apostatic Trap & Kin Aggregation)* | **3D Tropical Leaf-Litter & Egg-Cluster Diorama:** A single bright aposematic mutant caterpillar/butterfly suffers **anti-apostatic** predation (Langham 2004) when **Solitary** — naive birds kill it before learning! Switch to **Kin-Clustered Broods** (Sillén-Tullberg 1988): tasting one sibling teaches the bird to spare the remaining cluster! | How does the *very first* conspicuous warning colour survive when rare? **Gregariousness / kin aggregation** turns one sacrificed relative into protection for identical copies nearby ($rB > C$ bridges aposematism & kin selection!). |
| **6** | **Check** *(Mimicry & Aposematism Mastery)* | 3 tactile undergraduate diagnostic cases: (1) Contrasting Batesian (negative frequency dependence) vs. Müllerian (positive frequency dependence), (2) Explaining imperfect mimicry via noxiousness cost, (3) Why kin aggregation solves the rare-aposematic-mutant paradox. | Unifies predator psychology, frequency-dependent coevolution, and inclusive fitness. |

### Science Guard-Rails
- Never write "Batesian mimics only work while rare" — write **"work best while rare relative to models, depending on model noxiousness"** (Lindström et al. 1997; Sherratt 2002).
- Never call *Heliconius erato*/*melpomene* Müllerian advergence a "supergene" — use **"unlinked large-effect colour loci (*optix*, *WntA*, *cortex*)"** (Turner's two-step model; reserve *supergene* for polymorphic *H. numata* *P*, Joron et al. 2011).
- Present kin aggregation (Sillén-Tullberg 1988) honestly as **one major route** alongside non-lethal taste-rejection (Chai 1986; Wiklund & Järvi 1982).
- Cite Bates (1862), Müller (1879), Chai (1986), Sillén-Tullberg (1988), Lindström et al. (1997), Sherratt (2002), and Langham (2004).

---

## 6. Native Offline Single-File Deliverable
- Built with `npm run build:single` into `games/endless-forms/Endless_Forms_Atlas.html` (~1.10 MB raw / ~404 KB gzip with Plates 1–4 & 11), verified via `file://` in Chromium with **0 console errors, 0 page errors**.

## 7. Notes for Claude
- **Plates 1–4 (*Equilibrium*, *Conflict & Kinship*, *The Lichen Wood & Soot*, *Drift Casino*) and Plate 11 (*Same Bones*)** are all finalized and merged on `shared-agents`!
- **Chapter 5 (*Bitter Wings* — Batesian & Müllerian Mimicry, Aposematism & Predator Learning)** is planned in §5 above; Gemini is now building it autonomously on `Gemini`.
