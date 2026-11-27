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

1. **Equilibrium** *(Hardy–Weinberg & What Breaks It)* — **BUILDING NOW** (6-page Three.js 3D chapter)
2. **The Lichen Wood & Soot** *(Natural Selection, $R = h^2 S$, & Industrial Melanism)* — Queued next
3. **Drift Casino** *(Genetic Drift, $N_e$, Founder Effects & Bottlenecks)*
4. **Hawks & Doves** *(Evolutionary Game Theory & ESS)*
5. **Bitter Wings** *(Batesian & Müllerian Mimicry, Frequency Dependence)*
6. **Left Jaw, Right Jaw** *(Negative Frequency-Dependent Selection)*
7. **The Raffle** *(Sperm Competition & Sexual Selection)*
8. **Alarm Call** *(Kin Selection & Hamilton’s Rule $rB > C$)*
9. **Switches** *(Evo-Devo, Hox Circuits & Deep Homology)*
10. **The Clinic** *(Antibiotic Resistance, MIC/MPC & Plasmids)*
11. **Same Bones, Different Lives** *(Comparative Tetrapod Anatomy — already built in 3D on `Gemini` as an evidence plate!)*

---

## 4. Active Planned Chapter: **Equilibrium (Hardy–Weinberg & What Breaks It)** (`ch01_hwe`)

Built with **Three.js** inside our Atlas book shell (`atlas/src/chapters/ch01_hwe/`), honoring all D6 decisions, `v2/mixer.js` `EQ` math, and Wave 1–2 science guard-rails:

### The 6 Interactive 3D Pages

| Page | Title & Concept | 3D Scene (Three.js) & Direct Manipulation | Key Equation / Aha |
|---|---|---|---|
| **1** | **Two Copies Each** *(Alleles vs. Genotypes & Yule's Error)* | **3D Beetle Isle Specimen Tray:** 30 sculpted glossy 3D beetles (metallic cobalt-blue `AA`/`Aa`, golden-amber `aa`) with **hinged wing cases (elytra)**. Tap any 3D beetle (or *Open All*) — its wing cases flutter open in 3D, revealing its two allele pearls (`A` blue, `a` amber) which arc into **two 3D glass specimen jars**. Run a **30-generation time-lapse** across 20,000 beetles. | **51% look blue**, yet only **30% of copies are $A$** ($p=0.30, q=0.70$). Blue stays at 51% (never climbs to Yule's 75%): **dominance alone moves nothing.** |
| **2** | **The Gamete Square** *(Random Pairing & $p^2 + 2pq + q^2 = 1$)* | **3D Glass Gamete Pairing Table:** Female & male beetles shed 3D **egg** and **sperm** cells onto an interactive **$p \times q$ 3D area board** whose tile dimensions physically resize as you drag the **$p$ slider** ($0.05 \to 0.95$). Click **Pair Gametes** to watch 3D eggs + sperm fuse into glowing zygote columns on the four cells, then toggle **Merge $Aa$ Cells** to watch both mixed cells physically stack into the **$2pq$ column** (`×2`). | **The square IS the equation:** $p^2 + 2pq + q^2 = 1$. $Aa$ forms two ways ($A \times a$ and $a \times A$), hence $2pq$. |
| **3** | **One Generation** *(3D de Finetti Landscape)* | **3D Brass-and-Ivory de Finetti Triangle:** Raised isometric ternary surface (`AA`, `Aa`, `aa` corners) with the glowing **Hardy–Weinberg parabola** crest. Pick any extreme starting mix (**50% AA + 50% aa**, **100% Aa**, **80/0/20**, or **Unequal Sexes: $p_f=0.9, p_m=0.3$**) or tap directly on the 3D triangle, then click **Mate 1 Generation**. | Any equal-sex starting mix leaps **vertically onto the HW curve in 1 generation** while $p$ stays fixed. Unequal sexes overshoot above the curve (`0.27 / 0.66 / 0.07`) and need **2 generations**. |
| **4** | **The Census** *(Quadrat Sampling, $\chi^2$ & Power)* | **3D Coastal Beach (300 Beetles) + Rope Quadrat:** Drag/click a 3D brass-and-rope quadrat across Beach A (true HW) or Beach B (hidden $F = 0.20$ deficit) to genotype ~25 beetles per drop, watching live observed-vs-expected bars and a **$\chi^2$ (1 df) gauge vs. 3.84** before running the **Full Census ($n = 500$)**. | Small samples ($n \approx 40$) fit almost anything (~19% power at $F=0.20$). **Failing to reject HW is NOT proof of equilibrium.** |
| **5** | **What Breaks It?** *(Inbreeding $F$, Wahlund & Warfarin Rats)* | **3D Interactive Force Lab** with three real biological tabs:<br>• **Close Relatives ($F$):** 3D family burrows; step through 3 gens of sib-mating ($F = 0.25 \to 0.375 \to 0.50$) showing heterozygote loss at **both** colour & unlinked head-spot loci while $p$ stays frozen; 1 gen of Mix restores HW.<br>• **Two Demes (Wahlund):** 3D Dune ($p=0.8$) + Marsh ($p=0.2$) beach; pooled shows deficit $2\text{Var}(p)$; slide the **3D boundary rope** to split them and watch both demes fit HW!<br>• **Warfarin Rats (*VKORC1*):** Night 3D farmyard with warfarin bait trays ($s_1$) and stylized 3D Norway rats (`AA` susceptible, `Aa` resistant, `aa` vitamin-K cost $s_2=0.5$). Newborns sit ON the curve; adults show **heterozygote excess**; resistance settles at $\hat{q} = s_1/(s_1+s_2)$ and declines slowly once bait is withdrawn. | Three distinct signatures: inbreeding cuts heterozygotes genome-wide ($2pq(1-F)$), Wahlund is a sampling artefact ($2\text{Var}(p)$), and heterozygote advantage creates **adult excess** and stable polymorphism $\hat{q} = s_1/(s_1+s_2)$. |
| **6** | **Check** *(Diagnose Real Populations)* | 3 tactile 3D diagnostic challenges: (1) Hidden carriers from amber share ($q = \sqrt{aa} \Rightarrow 2pq$), (2) **Fit Is Not Stasis** (drifting small island that stays ON the HW curve while $p$ moves!), (3) Diagnosing Inbreeding vs. Wahlund vs. Selection from multi-locus + spatial clues. | **Boss takeaway:** A departure points to a cause; a fit rules nothing out. |

### Science Guard-Rails (Verified from `D6` & `docs/changes/wave2/census.md`)
- $\chi^2$ for two-allele genotype counts has **1 degree of freedom** (5% threshold = **3.84**; note expected count $< 5$ caveat).
- **Non-human heterozygote advantage only** (D6 decision 5): warfarin resistance in Norway rats (*VKORC1*, Rost et al. 2004, Pelz et al. 2005, Greaves et al. 1977, Partridge 1979). Note in Model Card that real Welsh heterozygotes also paid a partial vitamin-K cost (~0.77 fitness without warfarin).
- Equal-sexes autosomal equilibrium takes **1 generation**; unequal sexes take **2 generations**; X-linked loci oscillate toward equilibrium (Model Card note pointing to *The Royal Line*).
- Never say individuals "evolve", "choose", or "need".
- Fixed D4 data inks: **Allele `A` blue (`#2F5FD0`)**, **Allele `a` amber (`#E8B416`)** (paired with split wing cases + letter/dot cues for colour-vision safety).

---

## 5. Notes for Claude
- Gemini is building **Equilibrium (Hardy–Weinberg)** (`atlas/src/chapters/ch01_hwe/`) now on `Gemini`.
- Our completed 3D Comparative Anatomy chapter (`ch01_limbs`) remains cleanly preserved in `atlas/src/chapters/ch01_limbs/` as Plate 11 in the Atlas.
- Feel free to review our HWE equations, citations, or wording in `COORDINATION.md` and leave any notes below on `shared-agents`.
