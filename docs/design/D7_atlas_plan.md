# D7. The Atlas plan: beating the benchmark

*Written 27 November 2026 from the designer's notes (D6 decision 11). Binding for the next phase. Read START_HERE.md, then this file.*

## 1. The benchmark and why it beats us
**Benchmark:** Techartist, *Evolution* (https://iamtechartist.com/evolution/, app at `/Apps/evolution/`). It has ten lessons for ages 11–16, framed as a natural-history field atlas. Screenshots: `docs/benchmark/techartist_evolution_lesson1.png` against ours, `ours_lichen_2026-11-27.png` and `ours_raffle_2026-11-27.png`.

| | Benchmark | Endless Forms today |
|---|---|---|
| Art | Real 3D scans and illustration, soft light and shadow, textured paper, a naturalist-plate look | Code-drawn shapes ("programmer art"): moths are grey blobs |
| Layout | One designed object: an open atlas spread with text page, figure page and chapter tabs | Scene plus a dark dashboard of empty dashed charts covering half the screen |
| Interaction | Direct manipulation of the object (morph a 3D arm into a wing, dig strata, scrub deep time); the concept is visible within a second | Game machinery on top (timers, stars, supply meters, levels, predictions) |
| Explaining | Short serif prose beside the figure; labels and colours tie text to image; numbers shown in place | Text squeezed into a HUD; numbers in side charts |
| Cohesion | Ten pages of one book | 23 separate worlds, no common frame |
| Product shell | Atlas progress, tap-to-define glossary, chapter test, certificate, teacher's guide, curriculum standards | None of these yet |
| Science depth | Fixed demonstrations, school level | **Our advantage:** real models (selection, drift, Hardy–Weinberg, kin selection, ESS, sex, conflict, genomes, speciation), undergraduate depth |

**Goal:** their presentation and clarity, our depth and breadth, and more beautiful than theirs.

## 2. Principles for the Atlas phase
1. **The figure is the lesson.** Every concept is explained by a beautiful, real-looking object the learner manipulates directly: bones, moths, embryos, genomes, populations. Text sits beside the figure and points into it with matching colours and labels.
2. **One book.** Endless Forms becomes a naturalist's atlas with one shared frame: paper, typography, chapter tabs, plate style. Each chapter still has its own place and organism (decision 7), drawn as a plate in the same book.
3. **Real assets, not code shapes.**
   - Use open-licence 3D scans (for example Smithsonian Open Access, Morphosource and Sketchfab CC0/CC-BY, checked one by one).
   - Use public-domain natural-history illustration (Biodiversity Heritage Library, Haeckel, Gould).
   - Commission AI-generated illustration where needed, in one consistent style.
   - Keep a licence ledger (`docs/ASSETS.md`).
4. **Three.js where depth teaches:** homologous limbs, embryos, fitness landscapes, protein and DNA, strata, whale skeletons. Use 2D illustration elsewhere.
5. **Simulation lives inside the figure.** Graphs are inked figures on the page that draw themselves as you play, never a dark dashboard. The key number or equation is printed in the text page at the moment it becomes true.
6. **Simple first** (decisions 9 and 10 still bind): one gesture per page, real biology, no game machinery unless it teaches. Stars and bots are optional, never the frame.
7. **The product shell:**
   - atlas progress map
   - tap-to-define glossary
   - a short visual test per chapter
   - a certificate
   - a printable teacher's guide per chapter
   - curriculum tags (undergraduate modules; also A-level and AP where relevant)

## 3. Their lessons we lack (add them in our style)
| Benchmark lesson | Our status | Plan |
|---|---|---|
| Homologous limbs: morph a 3D human arm into bat wing, whale flipper, horse leg | **Missing** | New chapter "Same bones, different lives". 3D morph, then extend to undergraduate depth: homology vs analogy, serial homology, deep homology (Hox/Tbx), digit loss in horses |
| Peppered moths on pale vs sooty birch | Have it (Lichen Wood / Black Country) | Re-render to atlas quality; keep our real selection model |
| Matching vertebrate embryos | **Missing** | New chapter on comparative embryology. Include the honest history (Haeckel's exaggerations; Richardson et al. 1997) and link to Switches (Hox) |
| Cytochrome c sequence comparison | **Missing** (The Clock is related) | New "molecular evidence" chapter: align real sequences, count differences, build a tree. Bridges to The Clock and Tree Thinking |
| Excavating fossil strata | Have it (The Dig) | Re-render to atlas quality |
| Counting radiometric half-lives | Partly (The Dig's zircon clock) | Make it a clear, beautiful half-life page |
| Galápagos finch beak selection | Have it (The Archipelago) | Re-render |
| Whales walking from land to sea | **Missing** | New chapter: *Pakicetus* → *Ambulocetus* → *Rodhocetus* → *Dorudon* → modern whales, as a 3D skeleton morph along a timeline. Teach transitional forms, mosaic evolution and the astragalus evidence |
| Antibiotic resistance from incomplete treatment | Have it (The Clinic) | Re-render; keep our ward and plasmid depth |
| Scrubbing 3.8 billion years of deep time | **Missing** as a page | New "deep time" scrubber: the whole history of life on one draggable ribbon, mass extinctions marked. Bridges to the planned Extinction Roulette |

## 4. Order of work (next sessions)
1. **Foundations:**
   - Choose the stack. Recommended: Vite + TypeScript + Three.js, with a 2D illustration layer, kept as a static offline-capable build.
   - Build the atlas shell: two-page spread, tabs, typography, paper, glossary, progress, teacher's guide, test and certificate.
   - Write the asset pipeline and `docs/ASSETS.md` licence ledger.
   - Port the existing sim cores (`sim` objects are plain JS and can be reused).
2. **Vertical slice:**
   - **The Lichen Wood** rebuilt as an atlas page, plus the new **"Same bones, different lives"**.
   - The designer judges both against the benchmark side by side. Do not continue until the designer says they beat it.
3. **Their missing lessons:** embryos, cytochrome c, whales to sea, deep time, half-lives.
4. **Port our 23 v2 units** to the atlas, re-rendering each with real assets and keeping its model and science.
5. **The remaining legacy chapters** (D2 §4 triage), in the same style.

## 5. Notes
- Their app is closed source. Do not copy their code, art or text. Use it only as a quality bar and a list of topics.
- Their audience is ages 11–16; ours is undergraduates. Our pages can go deeper, but each should open as clearly as theirs, then deepen.
