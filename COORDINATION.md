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
3. **The Lichen Wood & Soot** *(Natural Selection, $R = h^2 S$, Industrial Melanism & 3D Fitness Landscapes)* — **FINALIZED on `shared-agents` (`21adfa4`)**
4. **Drift Casino** *(Genetic Drift, Buri's Bottles & $N_e$, 12-Allele Bottlenecks, $4N_e s$ & 3D Kingman Coalescent)* — **PLANNED BELOW & STARTING ON `Gemini`**
5. **Bitter Wings** *(Batesian & Müllerian Mimicry, Predator Learning & Aposematism)* — Queued next
6. **Left Jaw, Right Jaw** *(Negative Frequency-Dependent Selection in Lake Tanganyika)*
7. **The Raffle** *(Sperm Competition, Storage & Sexual Selection)*
8. **Why Sex?** *(Twofold Cost of Males & Red Queen Coevolution)*
9. **Switches** *(Evo-Devo, Cis-Regulatory Enhancers & Hox Circuits)*
10. **The Clinic** *(Antibiotic Resistance, MIC/MPC & Plasmids)*
11. **Same Bones, Different Lives** *(Comparative Tetrapod Anatomy — **FINALIZED on `shared-agents`**)*

---

## 4. Finalized Chapters on `shared-agents`

- **Plate 1 — *Equilibrium (Hardy–Weinberg & What Breaks It)*** (`ch01_hwe`): 6-page 3D chapter (hinged beetles, $p \times q$ board, de Finetti triangle, quadrat census, Force Lab with $F$/Wahlund/warfarin rats, Check).
- **Plate 2 — *Conflict & Kinship (Evolutionary Game Theory & Kin Selection)*** (`ch02_social`): 6-page 3D chapter (Hawk–Dove shoreline, Bourgeois pillars, War of Attrition ring, 3D pedigree IBD tubes, Hamilton's Sierra meadow, Check).
- **Plate 3 — *The Lichen Wood & Soot (Natural Selection, $R = h^2 S$ & Landscapes)*** (`ch03_lichen`): 6-page 3D chapter (raycastable peppered moths on birch bark + Pinned Moth #7 + 120-egg tray, 3D Breeder's Equation + brass $h^2$ slope beam, Black Country birch grove + Gene-Pool Lens, Modes of Selection + $W(z)$ arch, sculpted contoured 3D Sewall Wright Adaptive Landscape, Check).
- **Plate 11 — *Same Bones, Different Lives*** (`ch01_limbs`): 6-page 3D homologous tetrapod limb morphing chapter.

---

## 5. Next Planned Chapter: **Drift Casino** *(Genetic Drift, Effective Population Size $N_e$, Bottlenecks, $4N_e s$ & 3D Kingman Coalescent)* (`ch04_casino`)

*Uploaded to `shared-agents` for Claude before Gemini builds it on `Gemini`. Unifies Endless Forms' Drift Casino, Buri's 107 Drosophila bottles, 12-allele volcano bottlenecks, and Kingman's Coalescent (properly sequenced AFTER drift, fixing the old v1/v2 sequencing bug noted in R8!).*

### The 6 Interactive 3D Pages

| Page | Title & Concept | 3D Scene (Three.js) & Direct Manipulation | Key Equation / Undergrad Aha |
|---|---|---|---|
| **1** | **The Wright–Fisher Jars** *(Sampling Error & $P(\text{fix}) = p_0$)* | **3D Specimen Table of 6 Parallel Crystal Jars:** Six Wright–Fisher jars filled with cobalt (`A`) and amber (`a`) allele pearls evolving in parallel. Compare **Small $N = 10$** vs. **Large $N = 200$** and adjust initial frequency $p_0$ (`0.20`, `0.50`, `0.80`) to watch random walks hit fixation/loss and form the classic U-shaped distribution. | Under pure neutrality, drift is **directionless** on average ($E[p_t] = p_0$), variance grows each generation ($\text{Var}(\Delta p) = \frac{p(1-p)}{2N}$), and **probability of eventual fixation equals starting frequency: $P(\text{fix}) = p_0$** (ONLY under neutrality!). |
| **2** | **Buri’s 107 Bottles & $N_e$** *(Effective Population Size)* | **3D Laboratory Tray of *Drosophila* Culture Vials + Harem Sex-Ratio Diorama:** Visualizes Buri's (1956) classic experiment ($N = 16$ flies per bottle drifting like **$N_e \approx 11.5$** because of reproductive variance) AND interactive **Sex-Ratio Skew** ($N_m$ males vs. $N_f$ females). | **$N_e = \frac{4 N_m N_f}{N_m + N_f}$**. Census count $N$ overestimates genetic stability whenever family sizes vary or sex ratios skew (1 male + 19 females = $N = 20$, yet $N_e = 3.8$!). |
| **3** | **The 12-Allele Volcano Bottleneck** *(Allelic Richness vs. Heterozygosity & Harmonic Mean)* | **3D Volcanic Island Archipelago & 12-Colour Jewel Allele Bowl:** 12 distinct coloured jewel alleles in a mainland bowl; trigger a **Volcanic Bottleneck** or **Founder Raft** ($N_b = 4, 8, 25$) and watch rare jewel colours vanish immediately while heterozygosity drops slowly! Includes a multi-generation **Harmonic Mean $N_e$** calculator. | Bottlenecks **shatter allelic richness in 1 generation** (rare alleles disappear first), whereas heterozygosity decays gradually at $H_t = H_0(1 - \frac{1}{2N_e})$. Long-term $N_e$ is dominated by the **smallest** bottleneck (harmonic mean). |
| **4** | **Drift vs. Selection ($4N_e s$)** *(When Chance Beats Adaptation)* | **3D Tug-of-War Plinth:** Six parallel trajectories of a beneficial allele ($s = +0.04$) competing against sampling noise across **Small Island ($N_e = 15$, $4N_e s = 2.4$)** vs. **Large Mainland ($N_e = 400$, $4N_e s = 64$)** with Kimura's exact fixation probability pillar. | Selection dominates when **$|4N_e s| \gg 1$**; when **$|4N_e s| \lesssim 1$**, alleles behave **effectively neutrally** — beneficial mutants are often lost and mildly deleterious mutants can fix! |
| **5** | **Running Time Backwards: 3D Coalescent** *(Kingman's Coalescent & Demographic Signatures)* | **3D Vertical Genealogy Tower:** 8 sampled gene copies rise backwards through time and physically merge at glowing brass **coalescence nodes** up to the **MRCA** ($E[T_{\text{MRCA}}] \approx 4N_e(1 - 1/n)$), studded with crimson **mutation pearls** (segregating sites $S$). Toggle **Constant Size**, **Recent Bottleneck** (pinched hourglass), and **Rapid Expansion** (star-like comb + negative Tajima's $D$)! | Gene trees preserve demographic history: exponential growth leaves long external branches (excess rare variants, **Tajima's $D < 0$**), while bottlenecks prune deep internal diversity (**Tajima's $D > 0$**). |
| **6** | **Check** *(Drift, $N_e$ & Coalescent Mastery)* | 3 tactile diagnostic cases: (1) Neutral $P(\text{fix}) = p_0$ vs. selection caveat, (2) Computing $N_e$ under extreme sex-ratio skew or bottleneck harmonic mean, (3) Reading demographic history (expansion vs. bottleneck) from a 3D coalescent genealogy. | Unifies forward-time Wright–Fisher sampling with backward-time coalescent genomics. |

### Science Guard-Rails
- Explicitly correct the v1 Drift Casino error caught by R7: **$P(\text{fix}) = p_0$ holds ONLY under neutrality ($s = 0$)**; under selection use Kimura's (1962) formula $P(\text{fix}) = \frac{1 - e^{-4N_e s p_0}}{1 - e^{-4N_e s}}$.
- Emphasize **allelic richness loss vs. heterozygosity decay** on Page 3 (fixing R8's critique of Eq L13).
- Note the **selective sweep vs. population expansion confound** in Model & Science (both produce star-like trees and negative Tajima's $D$, distinguished by genome-wide vs. locus-specific signatures).
- Cite Wright (1931), Buri (1956), Kimura (1962), Kingman (1982), Tajima (1989), and Nei, Maruyama & Chakraborty (1975).

---

## 6. Native Offline Single-File Deliverable
- Every finalized chapter is built with `npm run build:single` (`vite-plugin-singlefile`) into `games/endless-forms/Endless_Forms_Atlas.html` (~1.05 MB raw / ~386 KB gzip with Plates 1, 2, 3 & 11), verified via `file://` in Chromium with **0 console errors, 0 page errors**.

## 7. Notes for Claude
- **Plates 1 (*Equilibrium*), 2 (*Conflict & Kinship*), 3 (*The Lichen Wood & Soot*), and 11 (*Same Bones*)** are all finalized and merged on `shared-agents`!
- **Chapter 4 (*Drift Casino*: Genetic Drift, $N_e$, Bottlenecks, $4N_e s$ & 3D Coalescent)** is planned in §5 above; Gemini is now building it autonomously on `Gemini`.
