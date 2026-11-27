# Endless Forms — Multi-Agent Coordination & Atlas Plan

*Updated: 2026-11-27 | Maintained on `shared-agents` so Gemini and Claude stay synced without colliding on each other's branches.*

---

## 1. Branch & Ownership Rules (Binding)

| Branch | Owner | Purpose |
|---|---|---|
| `Gemini` | Gemini | Gemini's primary build branch for the Atlas (`atlas/`) and related docs. |
| `claude/evolution-game-critique-9m7vmx` | Claude | Claude's working branch. **Gemini never writes, commits, or pushes here.** |
| `shared-agents` | Shared | Shared planning, contracts, API specs, and agreed milestone syncs. |
| `main` | Designer | Protected / merged by designer via PR. |

- Whenever a new phase or chapter is planned, the plan is committed and pushed here on `shared-agents` before building on `Gemini`.
- Legacy `games/endless-forms/` (v1 & v2) stays untouched as reference and sim-core source. All Atlas code lives in `atlas/`.

---

## 2. Strategic Goal (D6 Decision 11 + D7)

Build **Endless Forms: An Interactive Atlas of Evolution** — surpassing the Techartist *Evolution* atlas on visual craft, direct physical manipulation, and instant clarity while delivering Oxford-level undergraduate evolutionary biology depth and real simulation models.

Five core improvement pillars from the designer:
1. **Visuals, interactiveness & enjoyability:** Tactile open naturalist's atlas spread, warm archival paper, real 3D/illustrated specimens with soft cast shadows, zero "programmer art" or dark dashed dashboards.
2. **Clunkiness & mechanisms:** One clear physical verb per plate, progressive sub-step tabs (`1 … 6`), no unnecessary timers/star gates/fiddly prediction dialogs.
3. **Concepts (new + improved):** Add the 6 missing benchmark lessons (homologous limbs, vertebrate embryos, cytochrome *c*, whale transition, 3.8 Ga deep time, radiometric half-lives) at undergraduate depth; simplify and visually elevate existing v2 concepts.
4. **Overall feel & integration:** One cohesive book with shared shell — chapter index tabs, Atlas progress map, tap-to-define inline glossary, printable Teacher's Guide, Model & Science/Standards drawer, visual Check per chapter, and Completion Certificate.
5. **Correctness & communicability:** Sourced primary literature, explicit MODEL cards (`×N`, simplifications, contested badges), honest biology (no teleology, no "individuals evolve"), verified via automated checks + visual screenshot review.

---

## 3. Technical Architecture (`atlas/`)

- **Stack:** Vite + TypeScript + Three.js + Vanilla CSS (design-token driven, zero Tailwind bloat).
- **Fonts (100% offline):** Reuse the embedded WOFF2 base64 packs from `games/endless-forms/source/shell.html` (`Fraunces`, `Spectral`, `IBM Plex Mono`, `EF Symbols Serif/Mono`, `Atkinson Hyperlegible`) in `atlas/src/styles/fonts.css`. Zero external CDN calls.
- **Packaging:** `base: './'` static offline-capable production build (`npm run build` → `atlas/dist/`).
- **Asset Ledger:** `docs/ASSETS.md` tracks every procedural mesh, 3D scan, and 2D illustration with licence, attribution, and scientific notes.

### Directory Layout
```text
atlas/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.ts                  # Bootstraps AtlasApp
    ├── types/
    │   └── atlas.ts             # Shared AtlasChapter, Step, Glossary, ModelCard, Check types
    ├── styles/
    │   ├── fonts.css            # Embedded offline WOFF2 fonts (from v2 shell.html)
    │   ├── tokens.css           # Paper, ink, watercolour washes, D4 data inks, spacing
    │   └── shell.css            # Two-page book spread, spine ribbon, tabs, modals, print CSS
    ├── data/
    │   ├── glossary.ts          # Central tap-to-define evolutionary biology glossary
    │   └── curriculum.ts        # Full Atlas chapter directory (10 core + upcoming v2 acts)
    ├── shell/
    │   ├── AtlasShell.ts        # Open-book frame, chapter switcher, progress persistence
    │   ├── GlossaryPopover.ts   # Inline term highlighting + field-note definition popover
    │   ├── AtlasMapModal.ts     # Interactive Atlas Table of Contents & Progress Map
    │   ├── TeacherGuideModal.ts # Printable chapter Teacher's Guide + curriculum tags
    │   ├── ScienceCardModal.ts  # MODEL card, citations, simplifications, standards
    │   └── CertificateModal.ts  # Printable/downloadable Atlas Completion Certificate
    ├── sim/
    │   └── adapter.ts           # Clean TypeScript wrapper interface for reusing v2 sim cores
    └── chapters/
        └── ch01_limbs/          # Lesson 1: Same bones, different lives (Three.js 3D morph)
            ├── index.ts         # Chapter definition implementing AtlasChapter
            ├── anatomyData.ts   # Real morphometric measurements, Hox domains, citations
            ├── LimbScene3D.ts   # Parametric sculpted 3D osteology + smooth bone morphing
            └── CheckWidget.ts   # Interactive visual/3D mastery check
```

### Shared Chapter Contract (`AtlasChapter`)
Every chapter exports an object matching `AtlasChapter`:
- `id: string`, `number: number`, `section: string`, `title: string`, `subtitle: string`
- `accent: string`, `organism: string`, `available: boolean`
- `steps: ChapterStep[]` (each step configures the left-page narrative, interactive prompt, data readout/controls, and right-page specimen state)
- `teacherGuide: TeacherGuide` (objectives, time, misconceptions, discussion prompts, module tags)
- `scienceCard: ScienceCard` (model assumptions, parameter tags, contested notes, primary references, curriculum standards)
- `mount(stageEl, leftDynamicEl, ctx): ChapterInstance` (mounts the interactive 3D/2D plate and syncs bidirectional events between left-page controls and right-page specimen)

---

## 4. Current Build Plan — One Chapter at a Time

### Active Milestone: Phase 0 (Atlas Shell) + Chapter 1 (*Same bones, different lives*)
- **Lead:** Gemini (building on `Gemini` branch)
- **Scope:**
  1. Stand up `atlas/` Vite + TypeScript + Three.js project + offline font pack + `docs/ASSETS.md`.
  2. Build the full **Atlas Book Shell** matching and elevating the natural-history plate aesthetic:
     - Tactile desk mat, textured archival rag paper, spine shadow & crimson silk ribbon, die-cut right-edge chapter tabs.
     - Top pills: `Atlas X/10`, `Teacher's Guide` (printable), `Model & Science`, plus inline tap-to-define `Glossary` terms and `Certificate` view.
     - Full responsive layout (open spread on desktop/landscape, clean stacked folio on tablet/phone).
  3. Build **Chapter 1: Same bones, different lives** (*Evidence from Anatomy*):
     - **Custom sculpted 3D skeletal morphing engine (`LimbScene3D`):** Realistic lofted osteological geometry (humeral head/condyles, radius, ulna with olecranon, sculpted carpals, metacarpals, articulated phalanges) with warm bone-ivory + hand-tinted watercolour washes (ochre Stylopod/Humerus, verdigris-teal Zeugopod/Radius & Ulna, carmine Autopod/Wrist & Hand) and real soft shadow onto the paper page.
     - **6 Steps:**
       1. **Human Arm** — tap any bone in 3D or on the legend to inspect the 1–2–cluster–5 pentadactyl tetrapod blueprint (31 cm / 24 cm / 18 cm = 73 cm).
       2. **Bat Wing** (*Pteropus* / flying fox) — smooth live 3D morph watching metacarpals & digits II–V elongate into wing struts; toggle translucent wing membrane (*patagium*) ghost.
       3. **Whale Flipper** (*Megaptera* / odontocete-mysticete comparison) — watch humerus/radius/ulna shorten & broaden into a rigid hydrodynamic paddle with hyperphalangy; toggle flipper silhouette ghost.
       4. **Horse Leg** (*Equus caballus*) — watch central digit III elongate into the cannon bone & hoof while digits II & IV shrink to vestigial splint bones and digits I & V vanish.
       5. **Deep Homology & Analogy** (Undergraduate depth) — (a) Toggle *HoxA/HoxD* + *Tbx5* / *Fgf8* / *Shh* developmental expression zones directly on the 3D limb; (b) Interactive **Homology vs. Analogy** specimen switcher comparing **Bat Wing**, **Bird Wing** (fused carpometacarpus, digits II–IV — homologous *as forelimbs*, analogous *as wings*), and **Insect Wing** (chitinous cuticular outgrowth — neither homologous as limb nor wing).
       6. **Visual Check** — 3 interactive anatomy challenges (including clicking directly on the 3D specimen to identify homologous bones!) that record completion in the Atlas progress map.
     - **Continuous Morph Scrubber + Live Proportion Bars:** Smoothly scrub between species and watch both the 3D skeleton, dynamic scale bar (`cm`), and proportional length stacked bars animate simultaneously.
  4. **Verification & Visual Report:** Build production bundle, run Playwright headless capture across all steps + modals + mobile viewport, inspect screenshots critically against `docs/benchmark/techartist_evolution_lesson1.png`, iterate until museum-grade, commit & push to `Gemini`, and report back to designer with screenshots.

---

## 5. Up Next (Queued — Not Started Yet)
1. **Chapter 2: The Lichen Wood** *(Natural Selection — 2D Naturalist Plate + ported v2 `lichen.js` deterministic sim + inked live selection-response graph $R = h^2 S$)*.
2. **Chapter 3: Vertebrate Embryos** *(Comparative Embryology + honest Haeckel/Richardson 1997 history + phylotypic stage + link to Hox/Switches)*.
3. **Chapter 4: Cytochrome *c* & Molecular Trees** *(Real sequence alignment, distance matrix, tree building)*.
4. **Chapter 5: Whales Walking to Sea** *(3D transitional skeleton morph: Pakicetus → Ambulocetus → Rodhocetus → Dorudon → Mysticeti)*.
5. **Chapter 6: Deep Time (3.8 Billion Years)** *(Draggable geological ribbon + mass extinctions)*.
6. **Chapter 7: Radiometric Half-Lives & Strata** *(Expanding The Dig's zircon clock & fossil excavation)*.
7. **Porting remaining 23 v2 chapters** in batches with science sign-offs cleared.

---

## 6. Notes for Claude
- Feel free to read `COORDINATION.md` and `atlas/src/types/atlas.ts` (once synced to `shared-agents`) for the locked `AtlasChapter` contract.
- If you want to review Chapter 1's science claims/citations or propose edits to the contract or upcoming Chapter 2 (*The Lichen Wood*) sim-adapter interface, leave notes in a `## Claude Notes` section below on `shared-agents`.
