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

### Active Milestone Status (Updated 2026-11-27)
- **Phase 0 (Atlas Shell) + Plate 1 (*Same bones, different lives*): BUILT & VERIFIED on `Gemini` (`1915da3`)**
  - Vite + TypeScript + Three.js (`atlas/`), 100% offline with embedded WOFF2 fonts (~311 KB gzip single-file build).
  - Full open-book Atlas Shell: archival rag paper, crimson silk ribbon, die-cut chapter tabs, inline tap-to-define glossary, Atlas Progress Map, printable Teacher's Guide, Model & Science/Standards card, Readable font toggle, and printable Naturalist Certificate.
  - Plate 1 (`atlas/src/chapters/ch01_limbs/`): sculpted 3D tetrapod osteology morphing smoothly across Human, Flying Fox Bat, Bottlenose Dolphin/Whale, and Horse; continuous morph scrubber; live 4-species proportion bars; curved translucent Soft Tissue envelopes (*patagium*, flipper, hoof); Step 5 undergraduate depth (Bat vs. Bird vs. Insect wing Homology/Analogy + *HoxA/HoxD* deep homology); Step 6 interactive 3D bone-clicking mastery check.
  - Playwright verified across all 6 steps + modals + mobile: 0 console errors, 0 page errors. Awaiting designer side-by-side review before proceeding to Plate 2.

---

## 5. Next Planned Chapter: Plate 2 — *The Lichen Wood* (Natural Selection)
*(Planned now so Claude can review/comment on science or sim-bridge details before Gemini builds it on `Gemini`.)*

- **Goal:** Rebuild our flagship selection chapter (*Biston betularia* peppered moths) to full Atlas quality — retiring the old dark dashed-chart sidebar and code-blob moths while keeping our real undergraduate quantitative genetics model ($R = h^2 S$).
- **Visual Craft (2D Naturalist Plate):**
  - High-detail procedural watercolour birch bark + foliose *Parmelia* lichen / industrial soot crossfade plate rendered inside the right-hand Atlas frame (no dark dashboard chrome).
  - Anatomically detailed speckled peppered moth illustrations (forewings, hindwings, dark carbonaria vs. pale typica / continuous wing-tone morphs) with realistic cast shadows on bark.
  - **Inked live distribution figure** drawn directly onto the left rag-paper page (hollow = eaten, solid = spared, hatched = next-morning offspring) with the Breeder's Equation ($R = h^2 S$) printed in prose the moment the player's own hunting produces a measurable shift.
- **Steps (1–5):**
  1. **1 Hunt (Pale Lichen)** — You are a hungry bird feeding four chicks on lichen-covered birch. Tap the moths you spot; watch overproduction (eggs → spring hatch) and selective survival shift wing camouflage by next morning.
  2. **2 Heredity ($R = h^2 S$)** — Compare a high-heritability population ($h^2 \approx 0.85$) vs. environmental-luck coloration ($h^2 = 0$): see why selection without heritable variation produces $R = 0$.
  3. **3 Industrial Soot (*carbonaria*)** — Soot darkens the birch trunks (19th-century Britain, Majerus 2009 / Cook et al. 2012). Watch the rare dominant *carbonaria* allele surge, then reverse after the Clean Air Act—with realistic heterozygous lag.
  4. **4 Frequency-Dependent / Apostatic Twist** — Three morphs on mixed bark: hunting the commonest morph creates negative frequency-dependent selection that maintains polymorphism.
  5. **5 Check** — Visual interpretation challenge on real selection differentials & heritability.
- **Sim Core:** Deterministic seeded simulation adapted via `atlas/src/sim/adapter.ts` from `games/endless-forms/source/v2/lichen.js` and `soot.js`, preserving all Wave 1–2 science guard-rails (no "individuals evolve", honest realised heritability handling when $R/S < 0$, real Majerus/Cook citations).

### Subsequent Queue (One Chapter at a Time)
3. **Plate 3:** Vertebrate Embryos (*Echoes in the embryo* — comparative embryology + honest Haeckel/Richardson 1997 history).
4. **Plate 4:** Cytochrome *c* & Molecular Trees (*Letters of descent*).
5. **Plate 5:** The Dig & Half-Lives (Stratigraphy + zircon radiometric decay).
6. **Plate 6:** Walking to Sea (3D *Pakicetus* → *Ambulocetus* → *Rodhocetus* → *Dorudon* → modern whale morph).
7. **Plate 7–10 & v2 Ports:** Galápagos Finches, The Clinic, 3.8 Billion Years Deep Time, Equilibrium & the remaining 23 v2 chapters.

---

## 6. Notes for Claude
- `atlas/src/types/atlas.ts` (on `Gemini`) locks the `AtlasChapter` contract. Once the designer signs off on Plate 1, we can sync `atlas/` core types/shell into `shared-agents` if you want to build or review plates in parallel.
- Please review the **Plate 2 (*The Lichen Wood*)** science plan above (and Plate 1's citations in `atlas/src/chapters/ch01_limbs/index.ts` on `Gemini`) and leave any suggestions in a `## Claude Notes` section below on `shared-agents`.

