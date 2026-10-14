# R6. Technology and platform recommendation

Reviewer role: technical director (educational games and apps shipped to schools and universities). Method: read the core, UI, hunt, boot, build, shell, `ch99.js`, Equilibrium engine and test files; counted coupling with grep; gzipped the shipped file; searched for engine, standards and regulation facts. Unconfirmed items are in section 9.

## 1. Recommendation

Build the final product as a **web-first, offline-capable TypeScript app**: a Vite monorepo; a **pure-TypeScript seeded simulation core** (no DOM, no globals); **PixiJS v8** for scene rendering; a thin **Svelte 5 DOM shell** for menus, cards, notes, quizzes, HUD controls and charts; **Three.js, lazy-loaded**, for the two or three scenes where 3D carries the concept. Ship a PWA (phones, Chromebooks) plus a single-file build (USB stick, email). Use **LTI 1.3 Advantage** for LMS integration, SCORM as fallback, and **xAPI-shaped events** as the one internal analytics format. Do not adopt Godot or Unity; use Blender offline only, for art. Migrate by strangler pattern: the old game runs inside the new shell while chapters are ported one at a time, favourites first. No rewrite freeze.

## 2. What the code is today

- **Size is not the problem.** `Endless_Forms_v1.html` is 800 KB, **251 KB gzipped**, for 48 chapters, less than any engine runtime.
- **One scope, no modules, no types.** `build.py` concatenates all sources into one IIFE. No `package.json`, linter, type check, lockfile or CI.
- **A chapter contract already exists.** Each chapter is a singleton with `start`, `update(dt)`, `draw(c,w,h)`, `notes`, pointer handlers, `theme`, `intro`; `boot.js` throws if one is missing. `build.py` globs an empty `v2/*.js` and `ui.js` has `V2`/`PLAN_ADD`: a replacement seam already exists.
- **Sim and view are entangled.** `update` and `draw` are split, but the same objects hold state, DOM calls (394 `$()` lookups, 26 `innerHTML` HUD strings) and 290 canvas text draws.
- **The sim is nearly seedable.** `core.js` has mulberry32 behind a global `R()` (184 chapter calls) and `seed(n)`. `Math.random` appears only for the first seed and audio noise. Equilibrium uses unseedable `Math.random` and its own `rng`; Tangled Bank holds a copy of Endless Forms' `core.js`. Three forks of one core.
- **Tests are clever but browser-bound.** 51 Python Playwright scripts reach into `window.TB`; `vclock.js` fakes timers; `monkey.js` fuzzes chapters. Nothing tests the sim without a browser or asserts the science.
- **Platform defects.** `frame()` uses `setTimeout(…,16)`, not `requestAnimationFrame`. All three shells load Google Fonts, so "no internet" is false and each load sends the student's IP address to Google (a 2022 Munich court found that unlawful without consent).
- **Accessibility is near zero.** Input is pointer events on one `<canvas>`; zero keyboard handlers; 6 `aria-` attributes; text drawn in the canvas (R5a: 8–11 px); reduced-motion covers toasts and meters only.
- **Text is English strings in code**, with inline HTML; `ch99.js` (TAKE, MODEL, predictions, retrieval) is already content keyed by chapter id. Saves are stars and a sound flag in `localStorage`, no export.

## 3. Options compared

| Option | For | Against | Verdict |
|---|---|---|---|
| **Stay vanilla JS/canvas** | No toolchain; 251 KB; runs from `file://` | i18n, a11y, LMS, science tests and three forks all hand-built in global scope; agents err across files without types | Legacy host only. Fixes only. |
| **TS + Vite + PixiJS, TS sim, WASM later if profiled** | Types and modules suit agents; GPU sprites, filters, particles; renderer stays thin | Toolchain; designer reads TS | **Chosen.** |
| **Phaser instead of Pixi** | Scenes, tweens, input, audio included | Mostly unused (no arcade physics) or already written; heavier | Acceptable. Never both. |
| **Svelte 5 or React shell** | Accessible DOM for text-heavy cards and dashboard; browser translate, zoom, find | DOM and canvas must stay in sync | **Svelte 5**: small compiled output per lazy scene; sliders bind to sim params. React is equal. Never mixed. |
| **Three.js** (Babylon) | Small tree-shaken core; fits fitness-landscape surface and embryo axis | Easy to overuse; 3D is harder to make accessible | **Lazy chunk, at most 3 scenes** (Landscape, Switches, maybe Tree Thinking). Babylon is heavier for no gain. |
| **Godot 4** | MIT, no fees, diffable text scenes; single-threaded web export default since 4.3, so LMS iframes work without COOP/COEP headers | Web runtime commonly reported at 8–10 MB compressed; canvas-only, so no DOM text, translation, find, text zoom or screen-reader tree; GDScript slower than JIT JS | **No.** At most a throwaway 3D spike. |
| **Unity** | Strong 3D and mobile | WebGL payload and load time far above this game; same opaque canvas; editor-bound YAML scenes hurt agents; runtime-fee episode (2023, cancelled Sept 2024 for games customers) is a vendor-trust lesson | **No.** Overkill. |
| **Blender** | Batch-render organisms to sprite sheets or glTF; headless `bpy` scripts agents can run | Not an engine | **Yes, offline asset pipeline only.** |
| **Rive / Lottie / Spine** | Rive: a sim number can drive a creature's state machine | Authored clips do not parametrise over thousands of individuals; Spine needs paid licences; all need an animator | Default: Pixi sprites with a **parametric rig** (genotype to wing size, tone, pattern). Rive for a few hero creatures if an animator is hired. Skip Spine. |
| **Capacitor / Tauri** | Capacitor: mature plugins for a store listing | Not needed for classrooms; Tauri adds Rust | **Only if asked.** Capacitor first. |

The visual weakness R5a found (wireframe chapters beside painted ones, actors at 5% of the canvas, 11-px captions) is a shared-art and game-feel problem, not an engine problem. Translation, screen readers, LMS embedding, offline and small payload favour DOM plus canvas.

## 4. Target architecture

```
packages/
  sim/       pure TS: rng, genetics (Gen successor), population, payoff models
  render/    Pixi helpers: atlas, organism rig (genotype -> look), palette, particles
  ui/        Svelte: menu, cards, notes, quizzes, sliders, SVG charts
  content/   <chapter-id>/en.json: intro, notes, takeaway, caveat, quiz, refs
  platform/  storage, xAPI-shaped events, i18n, lti/scorm adapters
  scenes/<id>/  manifest, sim binding, view, hud, science.test.ts
apps/  play (PWA) · teach (dashboard) · server
```

```ts
interface Scene<P, S> {
  manifest: { id: string; section: string; concepts: string[]; minutes: number }
  create(o: { seed: number; params: P }): {
    sim: Sim<S>                       // step(), act(action), snapshot(), restore()
    mount(stage: Container, hud: HudApi): () => void
  }
}
```

**Rules**

1. **Sim is a library.** Injected seeded generator, never global; no `Math.random` or `Date.now`. Fixed timestep or generation-stepped; state is plain JSON. Player input is an **action log**, so a run is `(seed, actions)` and replays in Node without a browser.
2. **View is a function of sim state.** Words go through `t('key', vars)` (ICU MessageFormat catalogs via FormatJS or Paraglide; CSS logical properties for RTL; one pilot language before the 48 chapters are final), numbers through `Intl`. Labels are DOM overlays, not canvas text, which fixes tiny type, browser translation and CJK fallback together.
3. **Every scene ships a science test with analytic oracles:** Hardy–Weinberg proportions after one generation of random mating; neutral drift variance p(1−p)/2N and fixation probability equal to initial frequency; breeder's equation R = h²S; Hamilton's rB > C; Hawks and Doves ESS at V/C; the Price equation exact. Fixed seeds make these deterministic; a weekly many-seed run checks distributions. This answers "concepts not always correct".
4. **Determinism caveat.** `+ − × ÷ √` are bit-exact; `Math.exp/log/pow/sin` may differ across browsers. A seed reproduces a run within one engine. Where cross-device sameness matters (a class sharing one island), keep transcendentals out of the draw-to-outcome path; elsewhere test with tolerances.
5. **Performance target is a low-end Chromebook:** 60 fps with 2,000 sprites under Playwright 4x CPU throttle. Heavy sims go in a Web Worker. Rust/WASM only on profile evidence (candidates: coalescent, many-locus sweep); typed-array state is the boundary WASM would use anyway, so waiting costs nothing.
6. **Accessibility is a scene deliverable** (WCAG 2.2 AA): every action reachable by keyboard, and a single-pointer alternative to dragging (2.5.7; Crossing Over level 2 needs it); 24-px targets (2.5.8); a live region ("Generation 12: 62% of moths are dark"); a data-table twin of each chart; mute-safe and reduced-motion play; a colour-vision-safe palette tested in CI (R5a found red/green pairs carrying key distinctions); a high-contrast **projector theme**, since dark themes with 60%-alpha grey text vanish on classroom projectors. PixiJS's accessibility plugin mirrors interactive objects as hidden DOM elements: a start only.
7. **CI budgets:** shell at most 300 KB gzip, scene chunk at most 150 KB, axe-core zero serious violations, screenshots at 390×780, 1024×768, 1280×720 with seed and clock fixed.

## 5. Classroom and institution

**Delivery modes** (play never needs a server):
- **Anonymous play:** PWA, service-worker precache, no login, local saves. Default and offline.
- **Single-file build** (`build:single`, inlined, no service worker): double-click from a USB stick, email or LMS upload. Today's file does this and teachers will miss it. ES-module chunks fail on `file://`, so it needs its own build target.
- **Class mode:** teacher creates a class; students join by code with a nickname, or via LTI. Events queue in IndexedDB and sync when online.

**LMS**
- **LTI 1.3 Advantage is the primary route.** Canvas, Moodle and Blackboard support it. Deep Linking lets a teacher pick chapters as assignments; Assignment and Grade Services returns completion and score; skip Names and Roles by default. It needs a small server (OIDC launch, JWT verification, JWKS). Use a maintained library (such as `ltijs` or `pylti1p3`), test on free Moodle and Canvas sandboxes, and seek 1EdTech certification.
- **SCORM 1.2/2004 zip** for LMSs without LTI: static, no server, status and score only. LMS iframes block or partition `localStorage`, so **all saves go through a storage adapter** (SCORM `suspend_data`, IndexedDB, or server).
- **xAPI** is the internal event vocabulary: pseudonymous actor, verb, object (chapter/level), result, plus extensions for prediction chosen/correct and misconception tag. Forward to an LRS on request. cmi5 has thin LMS support; revisit later.

**Dashboard.** Predict-before-observe is the core loop, so the best signals are per-concept prediction accuracy, the wrong option chosen (a misconception report), stuck points and time. Two features justify the server: **assign with a shared seed**, so a class compares the same world; and a **projected live pool**, where each student's Drift Casino run becomes one line on the lecture screen.

**Privacy by design.** Opaque IDs (the LMS `sub`); no names, emails or ages by default. No third-party runtime requests: self-hosted fonts, no analytics SDKs, no CDNs. Region-pinned hosting, default retention, delete-by-class. Check with counsel: FERPA, COPPA (under 13), GDPR Art. 8 (consent age 13–16 by country), UK Children's Code.

**Compliance.** Publish a VPAT/ACR against WCAG 2.2 AA after an external audit with screen-reader users. US public universities fall under the ADA Title II rule (WCAG 2.1 AA); reported deadlines are 26 April 2027 (large entities) and 2028 (small).

**Stores.** Managed Chromebook fleets can force-install a web app, so the PWA suffices. iPad Safari can evict site storage after inactivity unless installed to the home screen, so saves need an export code or server sync. A bare web wrapper risks App Store rejection; defer stores.

## 6. Migration path (no freeze)

**Stage 0: hygiene (1–2 sessions).** Add `package.json`, Vite, TypeScript (`allowJs`), Vitest, ESLint, and CI running today's Python tests and monkey on the built file. Self-host fonts. Move the loop to `requestAnimationFrame`. Record **golden seeded trajectories** for the favourites (ten chapters) as a refactoring reference. Swap `vclock.js` for Playwright's `page.clock` when convenient.

**Stage 1: spike (about a week), the go/no-go gate.** Port The Lichen Wood / Black Country (one Hunt module) as a full vertical slice: TS sim, oracle test, Pixi view, Svelte HUD, content file, keyboard play. Pass if it holds 60 fps at 4x throttle, meets budget and axe-core, and the designer says it feels better. If Pixi fails, put Canvas 2D behind the same view interface.

**Stage 2: shell around the legacy game.** Build the new menu, cards, notes, settings, storage, event log and PWA. Host legacy chapters in a same-origin iframe: the shell calls `TB.App.play(TB.REG[id])` (already exported on `window.TB`) and wraps `TB.Save.star` to emit events. The dashboard sees all 48 chapters from day one; richer events come as chapters are ported.

**Stage 3: extract and port.** Move `Gen`, `rng`, `poisson`, `gauss` into `packages/sim` with an injected generator, binding legacy `R()` to a default instance; merge Equilibrium's `hwExp`, `wfNext`, `chi2`. Port the favourites first; then sim-sharing families (Hunt chapters; payoff-matrix chapters of IV–VI; the 17 Hardy–Weinberg levels with a shared de Finetti triangle widget); then the rest. Flip `engine: 'legacy' | 'v3'` per chapter in the manifest. A port is done when it has an oracle test, replay test, keyboard path, content file and three screenshots.

**Stage 4: institutions.** LTI launch and grades, SCORM package, class mode, accessibility audit, pilot translation.

**Stage 5: polish.** Three.js scenes, Blender art pass, optional Capacitor listing; delete the legacy bundle when the last chapter flips.

## 7. Agent-friendly repository conventions

- Root `AGENTS.md` (the rules above), a README per package, `docs/adr/`.
- Single verbs: `pnpm check` (types, lint, unit), `pnpm test:sci`, `pnpm test:e2e`, `pnpm build:single`, `pnpm new-scene <id>` (scaffolds the folder with failing TODO tests).
- Strict TypeScript, no `any`, files under about 400 lines (`ch3.js` is 43 KB). ESLint `no-restricted-imports` stops `sim` importing `render` or `ui`. Lockfile, `.nvmrc`, pinned Playwright browsers.
- **The designer reviews content and parameters, not code.** Notes, quizzes and the principle / in this model / in nature triples live in `content/`; tunable numbers sit in named, commented `params.ts`. A dev **"scene lab" route** exposes sliders for sim parameters, the seed and a replay box, so a boring game can be tuned by feel; a classroom bug report is a pasted replay code.
- Each content claim carries a `refs` id; the R7 fact-checks become `docs/science/<id>.md`, linked to the tests that enforce them.

## 8. Do not do

1. Do not start a big-bang rewrite or freeze content work.
2. Do not use Unity or Godot for the shipped product: opaque canvas, huge payload.
3. Do not write your own LTI, JWT or auth code, or build the dashboard before the event schema and shell exist.
4. Do not use `Math.random`, `Date.now` or global state in `sim`; no text in canvas, no logic in views.
5. Do not load fonts, scripts or analytics from third-party hosts at runtime.
6. Do not require student accounts or collect names, emails or ages by default.
7. Do not start with Rust/WASM, SvelteKit/Next, microservices, a state-library zoo, or two UI frameworks or renderers.
8. Do not make `localStorage` the only save.
9. Do not ship a chapter without its science oracle test and keyboard path, or use 3D as decoration.

## 9. Not confirmed in this session

- Godot and Unity web payload sizes are as commonly reported, not measured: do a hello-world export of each before anyone reopens this decision. Searches confirmed Godot's single-threaded web default from 4.3 and Unity's fee cancellation (12 Sept 2024, games customers). Unverified: Godot C# web support, Unity 6 mobile-browser limits, Unity education licence terms.
- ADA Title II dates are secondary reporting; check the Federal Register. The 2022 Munich Google Fonts ruling and 2025 COPPA amendments are from memory. Phaser 4's release date is unconfirmed; PixiJS v8 is current (v8.20 reported August 2026).
- LTI Advantage support rests on vendor pages plus Canvas documentation; confirm Moodle and Blackboard against their docs or the 1EdTech register.
