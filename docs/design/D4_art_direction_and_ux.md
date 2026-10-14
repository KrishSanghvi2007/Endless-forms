# D4. Art direction and UX style guide

*Art director and motion/UX designer. **Round 2**, revised after Coordinator B's cross-review of D1–D4. Follows D0 (binding) and the integrator's cross-cutting decisions. D4 owns look, palette, lenses, size and type minimums, chart grammar, juice, layout, onboarding look and accessibility. "Measured" numbers come from scripts run for this document (`scratchpad/d4/` for round 1, `scratchpad/d4r2/` for round 2): a colour-vision checker (Machado 2009, severity 1.0, distances in OKLab ×100); a bake timer; a canvas draw timer (headless Chromium, software canvas, DPR 2, with and without a 4× CPU throttle); and font subsets fetched from the Google Fonts API, base64-encoded and gzipped. All ran on the review container's CPU, not a Chromebook. R5a's Soot "undefined" and "-100%" bugs are already fixed (G2, G6).*

## 0. Decisions in brief

1. **One look, "Field Plate".** A painted ground that varies by *place* (16 places, a paper Lab plate and a flat Expeditions map). Actors, inks, plates and chrome never vary by chapter. This retires 39 chapter themes (39 grounds, 36 accents).
2. **Two kinds of colour.** *Data inks* (blue A, amber a, four force colours) have fixed meanings. *Entity paint* (bark, wings, throats) is natural, and any distinction that matters in it also rides on shape, pattern or luminance. No red/green anywhere. Allele colours dress an organism only when it has exactly two heritable types (rule 4) or no natural colour (rule 3).
3. **Entities the player reads are ≥ 7% of the stage unit (27 px on a phone); canvas text is ≥ 12 px and ≤ 3 words.** A crowd is a cached layer: up to 2,000 static dots, at most 150 moving at once (measured, §1.4).
4. **The graph never pauses.** A live strip replaces the Notes sheet UI. Eight chart types share one grammar (round 1's six plus the scatter and the GenomeStrip). There is an X-linked HUD variant, and Petri and Strata are defined as rung-0 scenes.
5. **Three juice tiers**, every sound mirrored visually, a Calm mode for every effect. Juice is specified for all nine favourites and for the Hunt-like games.
6. **Five layout classes** on one Stage contract, nine meta-game and teacher screens, and twelve framework change requests (FCRs), of which five ship now as plug-ins.
7. **No human is shown dying.** Outcomes are tallies on pictograms (rule 10).
8. **Onboarding is a 3-second ghost-hand demonstration**; **WCAG 2.2 AA** is a per-chapter deliverable.

---

## 1. Art direction

### 1.1 Three options

**A. Naturalist field-notebook watercolour.** Paper grain, ink outlines, washes pooling at edges. *For:* matches the shell, `barkTex`, `leafTex`. *Against:* soft edges fight "read the trait at 28 px"; hard for an agent to test.

**B. Flat diagrammatic (Mini Metro, Monument Valley).** Solid shapes, one stroke weight, four to six flat colours. *For:* phone legibility, colour-vision safety, pure geometry. *Against:* sterile; it would delete the bark and leaf litter behind the best-scoring chapters (R5a: Bitter Wings 9.0, Lichen Wood 8.5).

**C. Warm vector (Kurzgesagt-like).** Rounded characters, gradients, rim light, glow. *For:* appeal. *Against:* gradients carry meaning badly where tone is the variable, glow invites decoration (README principle 3), and agents drift in character proportions.

### 1.2 Pick: Field Plate (A for the ground, B for actors and diagrams, C's warmth only in motion)

- **Camouflage is the best mechanic and needs a textured ground** whose tone is the variable.
- **Elsewhere texture hurts.** Actors are flat shapes with a 1.5 px ink outline, one highlight and one shadow, like a figure on a naturalist's plate. They clear 3:1 against any ground (WCAG 1.4.11).
- **An agent can build and test it.** An actor is a pure function of (species rig, phenotype, seed) onto about 12 path commands; a ground is noise baked once per place. Both screenshot-diff and port to Pixi unchanged.
- **Figure/ground contract.** Outside camouflage chapters the ground sits at OKLab L 0.38–0.81, texture within ±0.06 L, and never blue (hue 235–295°) or amber (hue 60–120°) at chroma above 0.10. Themes (Dusk, Paper) change chrome and chart plates; the painted ground changes only by place, dimmed ×0.88 in Dusk. Where the ground's tone is the variable (Wood bark, Beetle Isle's lava, Strata's layers) the texture limit is lifted and the actor outline is chosen for contrast (paper outline on dark ground).

### 1.3 Ruling on D0 §8 Q1: one look, sixteen places

R5a defends per-chapter worlds, R5b calls them three apps. Worlds become **places**; everything else is global. Round 1 listed D2's twelve Bank places. D3's catalogue adds settings and species that none of them holds (a reef, a malaria coast, a farm, a fossil cliff, plates and flasks, world maps). D4 proposes four more places and two layers; D2 approves them with the anchors.

| Place | Ground | Anchor rig | Units set here |
|---|---|---|---|
| Wood | #8F9A7E | moth | Lichen Wood, Black Country |
| Beetle Isle | #B7A57A sand; lava #4A423C | beetle | Mixer, Census, Pedigree, Invisible Carriers, Leaky Tap, Gene Swamping |
| Streams | #3E6B6A | guppy | Strutting Ground (Aripo) |
| Shore | #D2BE96 | hermit crab | Hawks and Doves, Warm Nest |
| Lake | #2E6F86 | cichlid | Left Jaw Right Jaw, Archipelago boss, Harvest (school) |
| Meadow | #7C9A55 | ground squirrel, bee | Alarm Call, Meadow, Hive, Red Fire, Bitter Wings, Tangled Pairs |
| Hedge | #7A6E4E | **great tit** | Forager, Song School, Nest (cuckoo boss), Race boss |
| Pond | #2F5A4E | water flea | Pond, Skaters |
| Fig Grove | #6F7F3F | fig wasp | The Fig |
| Valley | #A38B6B | salamander | Ring, Islands of Divergence |
| Outer Islands | #4E6A7A | finch | Seed Rain, Ellipse, Archipelago, Slow Island (opossum) |
| Warren | #4A3F36 | rabbit | Pathogen (myxoma) |
| **Reef** (new) | #5A9A88 | cleaner wrasse | Cleaning Station |
| **Coast** (new) | #9B7A78 | mosquito | Malaria Coast |
| **Farm** (new) | #94755C | bollworm moth | Refuge |
| **Cliff** (new) | #A7A296 | ammonite silhouette | Dig, Extinction Roulette (Strata scene) |
| **Lab** (layer) | paper plate #F4EEDD | fruit fly | Mendel, Scribe, Royal Line, Twelve Flasks, Tumour, Toolkit, First Pond, Placenta, Clock, Coalescent |
| **Expeditions** (layer) | flat ink map on paper | none | Out of Africa, Human Variation, Drifting Continents, Gorongosa (Harvest) |

Measured: every ground clears 4.0:1 against ink or paper outline (new grounds: Reef 5.5, Coast 4.7, Farm 4.2, Cliff 7.1) and none exceeds OKLCH chroma 0.10 (Meadow 0.101 at hue 128°, outside both windows). Grounds name a place only together with its name pill and anchor silhouette: the nearest pairs are Lake and Outer Islands (ΔE 3.4) and Streams and Outer Islands (3.5), so the ground is never the only cue. Legacy chapters keep their `theme` until rebuilt; an adapter maps it to the nearest place (FCR-6).

### 1.4 The rig (D0 §8 Q2): genotype to look in Canvas2D, portable to Pixi

`develop(genome)` gives a phenotype (sim, no DOM). `recipe(phenotype, species)` gives JSON parts, colours and sizes. `bake(recipe)` rasterises once into a cache keyed on the recipe quantised (8 bins for tone, 4 for each other trait: 128 variants cover 2,000 moths). Each frame is a `drawImage` with a transform (position, rotation, flip, ±8% scale seeded by individual id). In Pixi the same recipe becomes a `RenderTexture` through the same path vocabulary (ellipse, bezier, polygon, fill, stroke, clip). Suggested plug-in files: `01_rig.js` (rigs and bake cache) and `01_scenes.js` (Petri, Strata, DemeMap, TreeView).

**Measured, bake (round 1).** `mothSprite` bakes 100 sprites at DPR 2 in 24 ms. `barkTex` at 390×585 takes 78 ms at DPR 1, 265 ms at DPR 2, 531 ms at DPR 3; `leafTex` 10 ms. The cost is the ground: cap its DPR at 2, bake in a Worker (OffscreenCanvas) behind a 1× preview, cache per place, never bake in the frame loop. Re-measure on a Chromebook in Phase 0.

**Measured, draw (round 2).** 2,000 egg-sized sprites (12 px, DPR 2) on a 390×548 canvas, per frame, flushed:

| Method | 1× CPU | 4× CPU throttle |
|---|---|---|
| 2,000 sprites redrawn every frame (`drawImage`) | 15.0 ms | 83.4 ms |
| 2,000 flat dots, one path, one fill | 13.8 ms | 66.1 ms |
| 2,000 dots, naive fill and stroke each | 24.4 ms | 145.8 ms |
| 300 sprites redrawn every frame | 2.0 ms | 9.5 ms |
| **2,000 dots cached in a layer, one blit** | **0.3 ms** | **1.3 ms** |
| cached layer + 150 moving sprites | 1.4 ms | 5.9 ms |
| cached layer + 300 moving sprites | 2.2 ms | 12.9 ms |

So Canvas2D cannot redraw 2,000 sprites per frame (R6's "60 fps with 2,000 sprites" is a Pixi target). **Rule: a crowd of up to 2,000 is a cached layer, redrawn only when its membership changes; at most 150 items move at once (300 on desktop).** Animate groups, not members: an arc per survivor, a batch of 45 culled eggs per redraw. A software canvas is the slow case; a GPU canvas should be faster, which Phase 0 confirms on a Chromebook.

---

## 2. Colour

### 2.1 Data inks

| Role | Dusk | Paper / Projector fill | Paper line | Icon | Line marker |
|---|---|---|---|---|---|
| Allele A (dominant, or first-named) | #6B97FF | #2F5FD0 | #2F5FD0 | letter A | circle |
| Allele a (the other) | #F2C94C | #E8B416 | #AD7B00 | letter a | square |
| Selection | #F46034 | #C4430A | #C4430A | sieve | triangle |
| Drift | #CF81A2 | #B5588C | #B5588C | scattered dots | hollow circle |
| Mutation | #5AE2B5 | #38B07A | #0A9662 | spark | plus |
| Migration | #7CC4F0 | #7CC4F0 | #438BB4 | arrow | arrowhead |

A and a are Equilibrium's values (dark A nudged from #5B8CFF). Non-random mating and recombination are ink with an icon (linked rings, crossing X): they repackage genotypes first, and D0 §3 forbids saying they never move p.

**Measured** over all 15 pairs (normal, deuteranopia, protanopia, tritanopia): Paper fills ≥ 14.3, 10.2, 11.0, 9.1. Dusk ≥ 13.2, 11.3, 11.6, 5.4; the weak pair, mutation/migration under tritanopia, never relies on colour. Dusk inks are ≥ 5.2:1 on the cabinet. Paper fills fail 3:1 on paper (amber 1.65, sky 1.65, green 2.37), so every filled mark has a 1.5 px ink outline. Thin lines use the darker line column (≥ 3.2:1), which separates worse (a/selection 5.3, drift/mutation 5.7 under deuteranopia), so **a chart draws at most three hued lines or series, each with marker and end label.** In greyscale A and a differ by 0.28 L, but neighbouring forces differ by under 0.12 and migration equals a (0.79 against 0.80), so forces always carry icon and marker.

### 2.2 Conventions, identical in every game

1. **Token:** a disc ≥ 14 px, allele fill, 1.5 px ink outline, bold serif letter (white or ink, whichever clears 4.5:1). Under 14 px, no letter; halves carry the allele.
2. **Genotype.**
   - *Diploid:* AA both halves blue, Aa blue left and amber right (never blended), aa both amber. Halves sit on wing cases (beetle), forewings (moth), flank (fish); other creatures wear a pill badge of two tokens. Dominance maps to one phenotype look; codominance shows both.
   - *One copy (hemizygous or haploid):* an XY male, a ZW female, a haplodiploid male and a haploid lineage are **one token with a 3 px ink "one-copy bar" under it**, never AA and never "A–". The bar carries a letter once the token is ≥ 20 px: Y on XY males, W on ZW females, none on haplodiploid males (they have no Y). In jar and count views an X-linked locus counts X copies: a female gives two, a male one, and the jar says "X copies".
3. **Organisms keep natural paint; tokens, jars, lines and badges carry allele colour.** Exceptions are organisms with no natural colour: bacteria and plasmids, RNA, flask lineages, tissue clones, and Equilibrium's abstract beetle. They wear the inks. **Natural paint stays away from the inks:** if a natural colour would sit within ΔE 8 of a data ink it is shifted or muted, and when a lens that uses allele inks is on (GENES, JARS), hued natural paint that collides with an ink is drawn in luminance-matched grey so the tokens read. Measured on the lizards' throats (rule 4 below): orange #D98E4A, blue #4F78A8 and yellow #B8AE66 are at least 10.0, 10.7 and 8.9 from the nearest data ink in either theme (yellow against amber is the tight pair). Orange and yellow are only 3.6 apart under deuteranopia, which is why colour never carries the morph.
4. **An inherited rule wears allele colours only when exactly two heritable types compete:** Hawk blue and Dove amber (Hawks and Doves), caller blue and silent amber (Alarm Call L4), cooperator blue and cheater amber (Commons). The ink goes on the animal's body, the shape carries it too (hawks raise claws, doves lower them), the resource keeps natural paint (hermit-crab shells stay shell-coloured), and the player's lineage wears the you-halo (rule 8). **With three or more types the animals keep natural paint** and the type rides on a pattern plus a letter: the Jaws L5 lizards wear their real orange, blue and yellow throats (muted as in rule 3) *and* a throat pattern (O solid bib, B barred, Y striped); the strategy simplex has neutral ink corners lettered O, B, Y and no hue, because the real orange, blue and yellow collide with the selection, A and a inks. The same holds for D1's Invasion widget with three rules (Raffle, Forager L4): lineages are patterned lettered discs, your lineage haloed. The test is whether the types are alleles or strategies of one population: two species (Bitter Wings' bitterwing and sourwing) keep natural paint.
5. **Continuous traits** use luminance or size, never hue. Histograms are neutral ink: eaten hollow, spared solid, offspring hatched; S arrow in selection colour, R arrow ink. **Hue never enters a star, a score or a prediction scoring.** Measured on `t2rgb`: a hue-only difference across the whole moth hue range (0.1 against 0.9 at the same tone) is ΔE 3.9–5.6 for normal vision and 2.3–4.1 under deuteranopia or protanopia, while one 0.1 step of tone is 6.4 for everyone. Hue is therefore a weak cue, about 28% weaker under deuteranopia and 40% under protanopia, which together affect about 8% of men. Lint (§2.4): hue is locked per level, and a trait that appears in a star predicate must have a luminance, size, shape or pattern channel. D1 already fixes hue in the Wood (round 2); this rule makes it a check.
6. **Frequency** is a 100% stacked p|q bar, numerals ≥ 14 px. Pies are banned (Castaways' five-hue pies). A system with three or more alleles uses a segmented bar of lettered chips.
7. **Three or more alleles.** Up to four alleles: blue, amber, paper-white, ink-black (letters A–D; first-named takes blue, second amber). Blood groups: A blue, B amber, O paper-white (the allele that makes no antigen), so q_O reads as the white segment. **Five to twelve alleles** (Out of Africa, the Casino's 12-allele boss): the same four fills times three overlays, plain, stripe, dots, with a letter A–L on every token ≥ 16 px. The overlay colour is whichever of ink and paper contrasts more with the fill (Paper theme blue takes paper stripes, 4.9:1 against ink's 3.1; black takes paper). A 12-allele token is never drawn under 16 px: a crowd of them is shown as the **richness row**, 12 letter chips where filled = present and hollow = lost, so "alleles kept" reads straight off the chips and the frequency bar beneath. **More than 12 alleles** (S-alleles, about 45 in *Oenothera*): no per-allele hue; the population is a ranked frequency bar and the allele id (S07) appears only on the pinned plant. Measured: the four base fills are at least 15.8 (normal), 15.4 (deut), 17.7 (prot) and 12.3 (trit) apart on Dusk and at least 21.9 on Paper; the weakest pair is amber/white, and the overlays and letters carry the other eight allele identities.
8. **Expected** is a dashed ink ghost, **realised** solid colour, **you** a diamond with the word "you" (ink on Paper, paper on Dusk). The **you-halo** is a 3 px paper ring around a token or actor, plus a diamond on charts. Ochre (#CF9A33) is chrome only (stars, section names); D1/D3's "gold" for "yours" means the you-halo, and D1 now says so.
9. **State without red/green:** filled versus hollow disc, solid versus hatched bar, filled versus outline star (locked stars ≥ 4.5:1). Stars and arrows are drawn as inline vector icons, not font glyphs: none of the four fonts carries ★ ▲ ▼ ◆ → (measured, §3).
10. **Humans** are paper-cut pictograms in one ink, never skin tone or faces, and **no human is ever shown dying.** Outcomes appear as tallies:
    - *Format:* rows of figures, one figure = N people (a chip states N, default 10). A filled figure means reached adulthood, cured or still well; a hollow outline means did not, or still in care. Counts update by bar fill and a 600 ms count-up at the end of a period, never one figure at a time; no figure falls, fades or gets a ghost ring (that mark is for animals); no loss sound, only the neutral count tick.
    - *Where:* Malaria Coast (children by genotype, per village), Out of Africa (founders are camp-fire groups; loss shows as alleles on the richness row, not people), the Clinic ward (a deteriorating patient moves to a labelled intensive-care box as a count), Human Variation, Royal Line.
    - *Pedigrees of people* show phenotype only: open = unaffected, half amber = carrier, amber = affected. A member absent from the sample is a dashed outline with no cause or date; there is no slash or cross.
    - *Pigmentation* is a luminance ramp on the map (allele frequency), never figures coloured by skin tone.
    - The pictogram set and the Malaria Coast depiction go to the sensitive-content panel (D2 §16.5) before build.
11. **Memory marks** (the Ledger look, D1's widget, standard wherever a predator or client learns: Bitter Wings, the Cleaning Station, Tangled Pairs): 28 px tiles with a glyph and a tick. Age is shown in three steps, not by transparency: solid (fresh), hatched (about two mornings old), dashed outline (older), so every step keeps its 3:1 outline. Round 1's "fading 60% to 20%" would have failed 1.4.11.
12. **Microscope views are dark-field.** The Clinic dish, tissue and any cell-scale scene use the cabinet colour as ground and the Dusk fills in every theme, so blue (5.9:1) and amber (10.4:1) both clear 3:1 without leaning on the outline. On the Paper theme amber against agar is only 1.5:1, which is why plate views (§4.3) use outlines and shapes, not fills.

### 2.3 Themes

```css
:root{ /* Dusk, default */
 --ground:#152120; --surface:#1C2A28; --text:#E8DFC9; --text2:#B9B29F;
 --A:#6B97FF; --a:#F2C94C; --sel:#F46034; --drift:#CF81A2; --mut:#5AE2B5; --mig:#7CC4F0;
 --ink:#1B1612; --accent:#A8263F; }
[data-theme=paper],[data-theme=projector]{ --ground:#F4EEDD; --surface:#E8DFC9; --text:#29211B; --text2:#5C4F44;
 --A:#2F5FD0; --a:#E8B416; --sel:#C4430A; --drift:#B5588C; --mut:#38B07A; }
[data-theme=projector]{ --ground:#FFFDF6; --text:#1B1612; --text2:#3D342C; }
```

Text is 12.5:1 (text-2 7.8:1) on Dusk and 13.7:1 (6.8:1) on Paper; no text uses alpha. **Projector** adds strokes ×1.5, type ×1.4, ΔL ≥ 0.25 between regions that must be told apart (lamp washout erases small steps), muted sound, hidden answers. Themes follow `prefers-color-scheme` with a `data-theme` override. `?projector=1` (D2-1) selects the Projector theme and layout class.

### 2.4 Colour-vision preview and lints

`?cvd=deut|prot|trit|mono` applies an SVG `feColorMatrix` (Machado matrices) over stage and charts. Each v2 chapter declares its categorical encodings (colour, shape, pattern, marker, letter). CI fails any pair that shares a channel and sits under ΔE 8 in any simulation. Round 2 adds three lints:
- **Hue lint:** every trait named in a star, score or prediction predicate must declare a non-hue channel. Camouflage tasks also need agreement between vision types: for each moth–bark pair, ΔE under deuteranopia divided by ΔE under normal vision ≥ 0.9.
- **Natural-paint gamut:** no natural paint within ΔE 8 of a data ink unless a lens rule (2.2 rule 3) greys it.
- **Label lint:** canvas text only through `Lbl.put` (§3), ≥ 12 px, ≤ 3 words.

---

## 3. Type and text budget

**Fonts (measured).** Fraunces 600–800 (one variable file; titles, TAKE, big numbers), Spectral 400/600 (body), IBM Plex Mono 400 (numerals, ticks; weight 500 is dropped, emphasis comes from size), and Atkinson Hyperlegible 400/700 (Readable mode). Subset to Basic Latin plus the symbols the games use, WOFF2, embedded. No third-party link: today's `<link>` breaks offline play and sends each student's IP to Google (R6). Metric-matched fallbacks mean a missing font never reflows.

| Pack | WOFF2 | gzip of base64 |
|---|---|---|
| Core: Fraunces variable 34 KB, Spectral 400 + 600 42 KB, Plex Mono 400 13 KB | 89.0 KB | 89.8 KB |
| Greek and symbols: Noto Serif 400 + 600, Noto Sans Mono 400 (37 Greek letters, ⅛, ▲ ▼ ◆ → ← ↑ ↓ †) | 13.3 KB | 13.3 KB |
| Readable: Atkinson 400 + 700 | 32.6 KB | 32.9 KB |
| **Total** | **134.9 KB** | **135.9 KB** |

Base64 gzips back to within 1% of the binary size, so embedding costs what the files weigh. Round 1's "120 KB for three families" was unmeasured; today's `<link>` serves at least 142 KB of Latin subsets for three families.

**Why a Greek pack.** None of Fraunces, Spectral, Plex Mono (as Google serves it) or Atkinson has σ, λ, δ, ρ, ν, Δ, β, π, χ or θ (only Spectral and Atkinson have μ), and D2's notation table needs μ, ν, σ, λ, δ, ρ and Δ, plus β, π, χ and θ in MODEL cards. Without the pack the browser falls back to a different system font on every device. **No font carries ★.** Stars are inline vector icons, and ▲ ▼ ◆ come from the pack only as text fallbacks. The ear-flag fraction ⅛ exists in Plex Mono, Spectral and the pack, not in Fraunces or Atkinson, so flags are set in Plex Mono.

**Budget against R6 §4 rule 7 (shell ≤ 300 KB gzip).** In the PWA, Core plus Greek is 103 KB (34% of the shell budget) at first load, 136 KB (45%) when Readable is on; Readable loads on demand. That leaves 164–197 KB for code. The single-file offline build embeds all four packs: +136 KB over today's 251 KB gzip, 387 KB before any v2 content. The 300 KB limit is a PWA-shell budget, and D2 should word the single-file budget separately. Latin Extended (for the pilot translation) is a language pack, not measured.

**Scale (px; phone / desktop / projector at 1280×720):** tick 12 / 12 / 20; label 14 / 14 / 22; HUD and body 16 / 16 / 28; TAKE 28 / 28 / 40; big number 44 / 48 / 64. All rem; 200% zoom and 320 px reflow must work. The projector floor of 20 px is a rule of thumb to confirm in a lecture theatre in Phase 1.

**Readable mode:** Atkinson Hyperlegible for HUD, body and labels; no italic sentences; line height 1.6; tracking +0.04em; left-aligned; 60-character lines. The British Dyslexia Association asks for plain sans-serif, 1.5 spacing, no italics or capitals; evidence for special "dyslexia fonts" is weak (Wery & Diliberto 2017), so none ships.

**Text budget** (D0 §5 binding; D4's stricter limits win over D1's and D3's):
- **Before the first action:** 40 words in the HUD strip over a ghost hand, no card: about 10 s at the 238 wpm adults read non-fiction (Brysbaert 2019).
- **HUD line:** 15 words and one live number. **Whisper (toast):** 8 words, 2.4 s. **Canvas label:** 3 words, ≥ 12 px, on a paper pill over texture.
- **Teaching panel:** 35–60 words, one idea, picture already changed. **Interesting result:** ≤ 25 words plus a What if? button.
- **End card:** TAKE ≤ 20 words; body ≤ 60; one chart; "Why?" holds real, maths and MODEL in 60-word chunks.
- **Whole screen:** ≤ 70 words on a phone, ≤ 120 on desktop, excluding ticks and legend chips. Sentences ≤ 18 words.
- **A chip caption** (opened from a "?" chip, not the HUD line) may run to 25 words. The Clinic's window caption is one: "between the MIC and the MPC: susceptible cells are held back, first-step resistant mutants still grow" (16 words).

**Text in canvas (R6 §4 rule 2, not addressed in round 1).** R6 forbids canvas text; D4 allows ≤ 3-word labels. Decision: allowed in Wave 2 plain JS, because a paper pill over texture is the only readable label on a bark. All canvas text goes through one call, `Lbl.put(id, text, x, y, opts)`. Wave 2 draws it on the canvas. FCR-8 re-routes the same calls to DOM spans (zoom, translation, screen readers), so the TypeScript port needs no re-authoring. Direct `fillText` in a v2 file fails the lint.

---

## 4. Creatures, charts, scenes and disclosure

### 4.1 Creature rules

1. **Squint test:** a solid black silhouette identifies the species at 28 px. The trait the player must read is a silhouette feature where biology allows (beak, crest, claw, jaw, tusk, proboscis).
2. **One trait, one channel:** continuous gives size, length or luminance; categorical gives shape, pattern or letter; hue is a bonus. At most three channels vary in a population.
3. **One rig per species,** reused by every chapter; chapters change parameters, never style. Eyes are a dot with a ≥ 2 px specular; gaze points at what the animal reacts to.
4. **Identity:** each individual has an id, seeded size and pose jitter, and one micro-mark (a notch), so a pinned individual is recognisable across generations; a thin thread links it to its young.
5. **States:** idle (0.6–1.2 Hz, seeded phase), alert (150 ms, ×1.1, head turn), gone (a dashed ghost ring for 2 s; no gore, no cross). Rule 10 overrides this for people.
6. **Lenses** on any population: LOOK, GENES (two tokens per actor, one token with a bar for one-copy genotypes, split halves for a crowd), JARS (tokens fly to jars, ≤ 1.2 s). Crowds of 100 or more draw as simplified 12 px silhouettes, batched into a cached layer (§1.4).
7. **No decoration and no thought bubbles:** nothing "needs" or "wants" (D0 §3 agency).

| Tier | Size, u = min(width, 1.2×height) | Count | Use |
|---|---|---|---|
| Hero | ≥ 0.12u (47 px at 390) | 1–3 | the duel, the pinned individual, your lineage, the Forager's tit |
| Actor | ≥ 0.07u (27 px) | ≤ 40 | anything read, tapped or compared |
| Crowd | 0.03–0.07u | ≤ 2,000 in a cached layer; ≤ 150 moving | a distribution only; no letters |

Particles below 0.03u are dust. Hit area ≥ 44 px (invisible padding; nearest centre wins). Hunt prey keep today's ≈ 8%; difficulty is tuned by tone, not size.

**Anchor rigs.** D4 confirms D2's anchors (D2 §2). Moth: tone, hue (locked), mottle, banding stencil, C/c badge on the thorax. Beetle: wing-case halves. Hermit crab: claw up or down plus carapace luminance. **Ground squirrel: kin is read from ear-flag tags and a father's face blaze (4.1a), not collars.** Finch: beak depth in silhouette. **Great tit (Act 6 anchor and the Hedge's resident, replacing the starling):** black cap and white cheek, yellow breast with a black median stripe (stripe width is a continuous trait on the size channel), round body, short conical bill, notched tail. It is a Hero (≥ 0.12u) in the Forager and an Actor in the Hedge; a caterpillar dangles from the bill when it carries. Kacelnik 1984 stays a starling citation in "In nature" and the starling gets no rig.

**4.1a Ear-flag tags and face blaze (Alarm Call).** D1's tags replace round 1's collars.
- *Tag:* a 26×22 px paper pill on a 6 px thread above the squirrel's ear, text 16 px Plex Mono: ½, ¼, ⅛, 0. A second channel is the border: solid, dashed, dotted, none. An untagged squirrel wears a hatched pill with "?". The tags are **the player's inferences, not the truth**; after the attack the debrief draws the true r under each flag and rings any mismatch in selection colour with a "≠".
- *Blaze:* in untimed peace time the litters leave the natal burrow at Hero size (47 px), and each pup wears its father's face blaze, a pale mark (ΔL ≥ 0.2 on the fur): stripe, chevron or spot, one per sire. Two blazes in a litter mean half-sisters (r = ¼). The blaze is a **designed cue** (a dashed "designed" pill says real squirrels carry no marker; biologists used genetic paternity tests, Hanken & Sherman 1981). It also appears as a glyph beside the node in `PedigreeView`. In the 2 s attack the blaze is not needed; the tags are.
- *Why tags:* at 27 px a squirrel is too small for a 14 px label on its body, and a flag on a thread keeps the label readable and moves with the animal.

### 4.2 Charts in the scene

**Diegesis ladder (use the highest rung available):** 0, the world is the chart; 1, organisms fall into the plot (D1 G6); 2, a plate in the strip; 3, a HUD number. Every chapter's main variable needs rung 0 or 1. Rung-0 examples now in the catalogue:

| Rung-0 object | Unit | What it shows |
|---|---|---|
| Bark with moths | Lichen Wood | tone against the ground |
| Jar beads | HW lens, Casino | allele frequency |
| Drum tickets | Raffle | paternity share |
| Dish turbidity | Clinic | infection load |
| Velvet prints | Scribe | resistance pre-exists: identical colony patterns on replica plates |
| Carrier tank | Leaky Tap | recessive carriers filling a submerged tank |
| Spiral dots | Royal Line | male and female frequencies leapfrogging into p̄ |
| Rising sparks | Lottery of the New | each new copy, most fizzling |
| Zircon clocks | Dig | parent atoms turning hollow |
| Log-time ruler | Dig, Extinction Roulette | deep time, with ≈ joins |

These are the Phase 0 screenshot gallery: each is a visual-regression baseline at three sizes.

**Live strip.** Phone: full width, 112 px, drag up to 60% of height, never pauses. Desktop: right column. Anatomy: tick labels inside the plot (12 px mono); playhead at the latest generation; realised solid 3 px with marker; expected dashed ink 2 px, no marker; you diamond; target as hatched band; direct end labels; `<table>` twin behind "Show data". Bars start at zero; no dual axes, no 3D; ≤ 4 series; colour follows the entity, never its rank. **Reveal:** organisms lift (120 ms), slide to bins staggered 8 ms (≤ 600 ms total), land with a 10% squash. Calm: 150 ms crossfade.

**The eight charts (D1 behaviour, D4 look).**
1. *Dot-histogram:* dots stack by trait.
2. *Allele bar p|q* with the GenePoolLens (segmented LOOK/GENES/JARS, 44 px segments, key `L`). Multi-allele: a segmented bar of lettered chips (rule 7).
3. *Trace with ghost:* a fan of thin lines, a bold you-line, a dashed expectation.
4. *Triangle HUD* (120 px, tap to expand to 240 px) in three variants:
   - *Autosomal:* dashed HW curve, dawn dot hollow, dusk dot filled.
   - *Simplex:* the same triangle with no HW curve, for morphs and strategies (Jaws L5). Corners are neutral ink lettered O, B, Y; the trail is ink; no hue.
   - **X-linked / haplodiploid (XHud, new):** the HW triangle cannot show hemizygous males (Royal Line, Hive, the Fig). XHud is 120×150 px: the **female triangle** on top (AA, Aa, aa); below it the **male p bar** (A|a split at p_m, 120×14 px) carrying a circle marker at p_f and a tick at p̄ = (2p_f + p_m)/3, which stays put; a 14 px chip "p_f − p_m = 0.30" for the gap. The dashed ghost on the triangle is a **single hollow point**, the female genotypes expected after random mating from (p_f, p_m): AA = p_f p_m, Aa = p_f q_m + q_f p_m, aa = q_f q_m. It is not a curve, because the HW parabola applies only once p_f = p_m. Tapping expands it to 240 px with the leapfrog trail: the male marker jumps to where the female marker was, the female marker moves halfway, and the gap halves and flips. Male tokens are one token with a bar (rule 2); in haplodiploid units the bar has no letter.
5. *PriceBars:* between-group solid selection colour, within-group hatched, total ink: one force at two levels.
6. *Tree and deme map:* branches ink 2 px with a time axis; demes as 40–56 px discs with a p|q bar and migration arrows weighted by m (1–6 px).
7. **Scatter (new).** Needed by D1 (Lichen diet against availability; Bitter Wings mimics per model against survival), D3 (Ellipse trait plane, Pseudoreplication contrasts, Extinction trait–survival).
   - *Marks:* 8 px discs with a 1.5 px ink outline. Categories ride on marker shape and fill (disc solid, square barred, triangle dotted); hue only where the entity already owns an ink. **At most three hued series**, each with marker, end label and table row.
   - *Reference line (mandatory, dashed ink):* y = x for the Lichen diet scatter, where points above the line are morphs eaten more than their share; your fitted curve is solid ink. y = 0 for Bitter Wings (the crossing is the collapse threshold; your prediction is a hollow diamond on the x axis, the tolerance band hatches in after commit). Through the origin for Pseudoreplication, with raw species and contrasts as two panels on the same axes. The overall mean for Extinction: survivors solid, extinct hollow, background and mass as two panels.
   - *Ellipse trait plane:* a 95% G ellipse in ink 2 px, the β arrow in selection colour, the response arrow ink, your predicted response a dashed arrow ending in a you-diamond.
   - *Crowding:* seeded jitter ≤ 3 px; an "n" badge on stacks of 5 or more; at most 500 individual points, beyond that hatched density cells. Tap a point to see the organism and to pin it. Keys: arrows walk the points in x order; a live region reads x, y and category.
8. **GenomeStrip (new).** A position-axis skyline for D3's Manhattan Hunt, Islands of Divergence and the merged `clock`.
   - *Axes:* x is genome position; chromosomes alternate light and dark on the axis rail (ΔL ≥ 0.12, luminance only), labelled every other one. y is the statistic: −log₁₀ p, F_ST, d_xy or dN/dS (log, dashed line at 1).
   - *Marks:* points of 4 px, binned to the maximum per 2 px column, so a million-SNP scan draws ≤ 2,000 marks, in a cached layer. A dashed threshold line carries a 12 px label ("5×10⁻⁸"). Hits above it wear a selection-colour ring and a triangle marker. Truth appears only after commit: ink ticks under the axis at the selected loci. The previous skyline stays as a dashed outline when samples are added.
   - *Tracks:* up to three stacked tracks on one x axis (F_ST above d_xy for Islands of Divergence). A recombination cold spot is a hatched band on the rail, not a hue.
   - *Other uses:* per-site dN/dS along a gene (bars above 1 solid with a triangle, below 1 hollow); Out of Africa's archaic tracts as hatched segments on a haplotype ribbon with a tract-length histogram beside it.
   - *Phone:* the 112 px strip is a 28 px overview row with a 44 px draggable window above an 84 px zoom row. Keys: left/right step peak to peak; the live region reads "Peak, chromosome 6, 12 Mb, 7.2". The data twin lists the top 20 peaks and the threshold.

**Interaction widgets (look).**
- *Predict:* a hollow diamond with a 44 px halo; the tolerance band hatches in after commit.
- *Ledger:* rule 11.
- *Invasion:* 200 tokens in four rows, your lineage haloed; two types in blue and amber, three or more as lettered patterned discs (rule 4).
- *Pin:* a 450 ms hold fills a ring; the pinned individual gets a 3 px paper halo and a thread to its young.
- ***Evidence* (D1):** an instrument shelf of 56×56 px tiles (icon, name in ≤ 2 words, cost chip such as "2 days"); a budget row of field-day tokens (20 discs of 16 px, spent ones hollow); a **power meter**, a 220×20 px gauge with a dashed line at 80%, a diamond needle and the hatched region below the line, labelled "power" and "n = 40"; and a conclusion card with hypothesis cards (≥ 88×64 px, icon plus 3 words) and a five-detent confidence control (50, 60, 70, 80, 90+%, 44 px each). The Brier score appears as a bar of calibration pips, with the posterior given the evidence you bought drawn as a dashed ghost.
- ***PedigreeView* (D1):** 28 px nodes, circle for female, square for male, hexagon if sex is unknown (never a diamond, which means "you"); ink lines 2 px; a double line for a mating. Fill is phenotype (rule 10 for people). Path counting traces a 4 px ink path with one tick per step and a fraction chip; multiple paternity draws two sire lines into one sibship bracket with different blaze glyphs. A tap opens a radial menu of four tags (½, ¼, ⅛, 0) with 44 px targets. Animals absent from the sample are ghost rings; people are dashed outlines (rule 10). One-copy males are one token with a bar.
- ***Freeze and ask* (D2 §12):** the presenter presses `F`. The simulation stops and the stage becomes a prediction gesture: the Predict diamond at projector size (88 px with a 120 px halo), the live graph at 60% width in the projector scale (ticks 20 px, labels 22 px), the question in the 28 px HUD line (≤ 15 words). Students answer on their devices with result codes or by show of hands; `R` reveals, the tolerance band hatches in and play resumes. This is the one sanctioned pause of the graph.

**Disclosure marks.** ×N chip (ink-outline pill) on any unrealistic parameter; a "≈" break in the time ruler for compressed history (also the join in Strata's log-time ruler); designed data in a dashed plate frame, real data in a solid frame with a source line; contested ideas get a dashed pill, never a star; a "1 dot = N" chip wherever a crowd stands for more than it draws; a Realistic-mode chip (D2 §11) as an ink-outline pill with an R glyph and the time-lapse shown by a ≈ on the generation counter ("Realistic: strength scaled to s ≈ 0.25; 4 generations a morning").

### 4.3 Rung-0 scenes: Petri and Strata (D3's widgets)

**Petri (plates, flasks, tissue).** Used by the Scribe, Twelve Flasks, the Race boss, the Tumour, the First Pond and the Clinic dish.
- *Plate view (top down):* an agar disc (#EDE3C8) on the paper plate, 0.5u as a hero or 0.15u in a grid of up to 20 (20 plates: 5×4 at 56 px, each with a ≥ 14 px count pill). Colonies are 8–12 px ink-outlined discs in a cached layer. A variant colony is amber-filled with a second ring (shape carries it; amber against agar is 1.5:1). A jackpot plate (Luria–Delbrück) gets a dashed ring and a bold count. The **velvet print:** a 56 px block lowers over the master plate (250 ms), lifts, and stamps the replica plates with the same dot pattern; a tap links the same colony across plates with a 1 px thread. Mutation beads on a cell "necklace" are sorted by source with patterns in the mutation ink: plain ring (copying error), stripe (damage), dots (faulty repair).
- *Flask view:* an Erlenmeyer silhouette at 0.12u (47 px). Turbidity is a six-step luminance ramp with matching hatch density, so it reads in mono; the label is the generation, "g 31,000". Twelve flasks are a 4×3 rack (188 px wide); beside it a row of freezer vials (the same vial as the drawer, §6.2). The flask that evolves citrate use jumps to the top step in one transfer.
- *Dark-field view* (cells, tissue; rule 12): cabinet ground, Dusk fills. Tissue hexagons are 16–20 px; clones take the rule 7 ladder (blue, amber, white, black, then patterns) with a letter on cells ≥ 16 px.

**Strata (layers, decay clocks, log time).** Used by the Dig and Extinction Roulette.
- *Section:* a cliff 0.9u tall; each layer is a band whose thickness follows deposit. Layers differ by a luminance step ≥ 0.06 L *and* a sediment pattern (silt dots, sand speckle, shale lines, limestone bricks, ash stars), never by hue. Fossils are silhouettes ≥ 27 px placed by gesture. Uplift and erosion cut the bands with a torn edge, so the gappy record the player made is the picture.
- *Zircon clock:* 20 atoms in a 5×4 grid. Parent atoms are solid, daughters hollow; each half-life turns half the remaining parents hollow, staggered 40 ms, then holds 600 ms. The label is "½ left", "¼ left". Calm: no stagger.
- *Log-time ruler:* decade panels of equal width, each a linear 10-part scale, joined by the same "≈" mark as the compressed-history ruler. Reading rule: each ≈ means ×10. Labels "4 Gyr", "1 Gyr", "100 Myr", … at ≥ 12 px; the zoom window is a bracket; the player's placements are you-diamonds.
- *Range chart:* a bar per taxon; the found part solid, the inferred part hatched, so the Signor–Lipps smear is visible as a hatched tail.
- *Clade spindle (Extinction Roulette):* width follows diversity, clades by pattern; a ring of eight equal sectors with an ink ball marks the boundary. The sectors never size by frequency, so they are not a pie.

### 4.4 Rigs for D3's units and rebuilds

**New species.** Each needs a row here before its unit leaves spec (scene, squint feature, trait channels, tier).

| Species | Scene | Squint feature | Trait channels | Tier |
|---|---|---|---|---|
| Fruit fly | Lab (Royal Line, Toolkit) | big compound eye, two wings | eye wild-type dark with facet hatch against white pale and plain (luminance and hatch, not hue); wing shape | Actor |
| Water strider | Pond (Skaters) | six long legs on dimpled water | clasper hook and abdominal spine length (size) | Actor |
| Cleaner wrasse and client | Reef | slim fish with a dark lateral stripe against a round client | client parasite dots (tallies, ≥ 6 px); mucus bite mark | Actor |
| Honeybee, fire ant | Meadow (Hive, Red Fire) | waisted worker, larger queen with crown mark | patriline letter on the abdomen (A–D bands); comb cells 28 px | Actor |
| Mosquito (*Anopheles*) | Coast | long diagonal proboscis, abdomen raised | none; a red-cell inset sickles (shape) | Actor |
| Elephant | Expeditions (Gorongosa, Harvest) | trunk and tusk | tusk present or absent: a pale curved bar, shape; the X as a handed-down rod | Hero |
| Hatchling and jacky dragon | Shore (Warm Nest) | hatchling in sand | sex as a glyph (circle or square) above the animal; nests by a luminance ramp with temperature ticks, not red to blue | Actor |
| Pink bollworm moth | Farm (Refuge) | small moth, wings folded | genotype token badge; Bt fields hatched, refuges dotted | Actor |
| Crow | Valley (Islands of Divergence) | stout bill, long wings | plumage tone: all-dark against grey saddle (luminance plus pattern) | Actor |
| Fish (school) | Lake (Harvest) | generic fish rig | body length (size); the net's mesh is a visible grid | Crowd, Actor for the pinned fish |
| *Heliconius* butterfly | Meadow (Tangled Pairs) | broad wings | forewing band (dark band, pale spots) and hindwing ray (stripes), both patterns | Actor |
| Yeast flask | Petri (Race, Twelve Flasks) | Erlenmeyer | turbidity ramp | Actor |

**Provisional rig specs for rebuilds (D0 §5.2, not addressed in round 1).** D3's tier 3–4 specs confirm or change them.
- **Fancier → The Breeder (pigeons).** A loft of up to 24 birds at Actor size 0.10u (39 px), four rows of six. Crest height is the continuous trait, a silhouette feature on the head (0.2 to 1.0 of head height); tail fan width is a second silhouette trait; plumage bars are a pattern. Round 1's complaint was 24 identical pigeons at 3.0; here no two silhouettes in the loft are alike. The gym level's trained parents wear a dumbbell mark; their young are drawn without it, so "acquired traits are not inherited" is visible in one frame.
- **Landscape → Twelve Flasks (the hidden fitness landscape).** A Canvas2D contour plate: iso-lines every 0.1 w (1 px) and every 0.5 (2 px solid), hill-shaded in luminance from the upper left, peaks lettered P1–P3, no hue. The population is a crowd cloud (10, 100 or 1,000 dots for the three N regimes) whose centroid is a you-diamond ball with a trail; unexplored ground is hatched and clears as the cloud visits it. A 112 px side strip shows the profile along the path, so the valley the cloud must cross is visible in the strip. The flasks' rack sits beside the plate.
- **Meadow pollinators.** Pollinators at ≥ 0.10u (39 px; round 1 had 8 px): bee (short tongue), hoverfly, hawkmoth (long tongue), with proboscis length as the silhouette feature; flowers drawn as a cut-away corolla tube whose depth is the matching trait. S-allele self-incompatibility uses the more-than-12-allele rule (a ranked bar plus an id on the pinned plant). Pollinators evolve too (D2 §18 condition), shown as a second lineage strip.

---

## 5. Motion and juice

### 5.1 Principles

1. **Every effect carries information:** what changed, how much, whose doing.
2. **Three beats:** telegraph (30–90 ms: the beak shadow grows), act, settle (150–250 ms, overshoot ≤ 12%). Response ≤ 100 ms, payoff ≤ 400 ms, population change ≤ 2 s.
3. **Tween everything numeric,** frame-rate independent (dt capped at 50 ms). Arrivals ease-out-cubic, travel ease-in-out-cubic, UI pops spring (stiffness 170, damping 22), timers linear.
4. **Three tiers:** T1 per action 120–200 ms; T2 per generation 400–800 ms; T3 per level or star 0.8–1.5 s, at most one per 3 s. A repeated result plays its 300 ms version; the full sequence plays once per level, and a tap skips it.
5. **Particles:** five kinds, each tied to a concept: dust, feather or scale, spark (mutation), droplet (dose, flood), egg or seed dot. Pooled sprites, ≤ 150 live on phones, ≤ 300 on desktop (§1.4 measured why). Crowds are cached layers, not particles.
6. **Shake only for costs the player pays** (bitter mouthful, injury, flood, a scale-eater's bite): 5 px at 390 px, two cycles in 180 ms, at most one per 600 ms; never for success and never for a human outcome.
7. **Number pop-ups:** ≥ 16 px mono bold in ink with ▲/▼ icons and a sign, never red or green; rise 24 px over 700 ms, fade from 400 ms; bursts within 150 ms merge; anchored to the thing that changed.
8. **Hit-stop** 50 ms on costly events only. Count-ups 600 ms ease-out; stars land 180 ms apart on rising notes.
9. **Juice governor:** frame time above 20 ms for 30 frames halves particles, then drops squash, then enters Calm. No more than two bright flashes per second across the whole screen (WCAG 2.3.1).

### 5.2 Sound and haptics

Two families: *field* (diegetic, synthesised noise) and *notebook* (soft pencil and glass). Pitch rises with gain and falls with loss (a falling minor third, never a buzzer); reward notes from C major pentatonic; ≤ 3 voices; muted by default in class and projector modes; every sound has a visual twin and an optional caption chip. Human outcomes get the neutral count tick only (rule 10). Existing voices stay. New: selection sieve (band-pass noise 800 to 2,400 Hz, 220 ms), mutation tick (sine 2.4 kHz, 40 ms), dusk pad (110 and 165 Hz, 1.2 s fade), wingbeat and scuttle (noise, 4 Hz tremolo), count tick (880 Hz, 20 ms, +1 semitone per tick), Interesting result (triangle 392 to 330 Hz). Round 2 adds: guard block (wood tock, 600 Hz, 60 ms), scale burst (noise 4 to 8 kHz, 120 ms), chick peep (sine 2.6 kHz gliding down, 120 ms, twice), pupal crack (noise click, 25 ms), net swish (band noise 400 to 1,200 Hz, 250 ms), pour stream (330 Hz sliding to 262 Hz as the budget drains).

**Haptics.** The Vibration API works on Android Chrome and not in iOS Safari at the time of writing, so it is a bonus: tick 8 ms, hit 18 ms, cost 2×25 ms, star 10-20-30 ms. Opt-in, off in Calm, never the only cue.

### 5.3 The nine favourites, applied

Timings are acceptance criteria (D1 uses them as gates). Each effect has a Calm equivalent.

**The Lichen Wood / Black Country**
- *Peck:* a bird shadow grows over the tapped moth in 90 ms, then three dust puffs (300 ms); the moth lifts 6 px and leaves a ghost ring; crunch. "+1" pops on the chick row, which pops (220 ms). A miss gets one puff and a 4 px timer flinch.
- *Dusk, eggs at the true ratio.* Round 1's "6–10 egg dots per survivor" drew about 4:1; D1 needs 300 eggs and a cull to 30, **10:1**. Now:
  - Survivors lay into an **egg tray**: a grid of 12 px ovals at a 14 px pitch, 25 columns wide (350 px), at the foot of the canvas. L0 morning 1 is 4 survivors, 75 eggs each, 300 dots; later mornings 15 survivors, 20 each. One dot is one egg.
  - The tray is a cached layer (§1.4). Each survivor sends one dashed arc (300 ms, 20 ms stagger) and its batch of eggs appears in the tray as the arc lands: 15 animated arcs, not 300 sprites.
  - The winter cull removes 270 eggs at random in 6 batches of 45 over 600 ms, each batch one layer redraw (2 ms at 1×, about 10 ms at 4× throttle). The 30 survivors slide to the 30 places on the trunk (500 ms). Total about 1.7 s.
  - If eggs exceed 600 (the L3 wood: K = 120, 1,200 eggs) the tray shows 600 dots and a "1 dot = 2 eggs" chip. Realistic mode with real fecundity uses the same chip.
  - The S arrow draws in selection colour, the R arrow in ink; survivors slide into the histogram. Calm: 150 ms crossfades, no arcs.
- *Soot and pin:* a haze rises over 4 s with ≤ 40 flecks as `barkTex` crossfades. A 450 ms hold fills a ring; the pinned moth gets a paper halo and a thread to its young.

**Bitter Wings**
- *Bitter mouthful:* the moth staggers off alive; shake 5 px; corners darken 20% for 250 ms (luminance, not hue); sawtooth drop; a ledger tile flips in.
- *Taste ledger* in rule 11's look: a tile per tasted warning insect (glyph plus tick), solid then hatched then a dashed outline as it ages.
- *Memory cue:* a warning-wing icon in the HUD thickens its outline 1 to 4 px per bitter taste; at three, models gain a dashed avoid-ring that fades over two mornings. When mimics outnumber models the ring cracks into dashes.

**Left Jaw, Right Jaw**
- *Guard raise (T1):* the tap shows a ring under the finger (30 ms); a pale crescent plate with an ink outline slides onto the flank (120 ms, ≤ 8% overshoot). An arc around the fish drains linearly over the 1.2 s guard. Two guard pips in the HUD; a third tap slides the oldest plate off (120 ms). Buttons are never greyed.
- *Guard flash (block):* the plate brightens by ΔL +0.25 for 90 ms, a 14 px ring ripples out (200 ms), the scale-eater recoils 6 px (60 ms) and its twisted mouth shows; "tock" 600 Hz. No shake: this is a success.
- *Scale burst (bite lands):* the cost the player pays. Hit-stop 50 ms, one 5 px shake, six scale flakes (10 px, rotating) burst from the flank, travel 24 px over 300 ms and sink 40 px over 1 s with a ΔL +0.3 glint; "−1" in the scales row; a scar arc stays on that flank for the season, so left and right bites are visible as scars. At season end the twist histogram on the lake floor redraws as dots sliding in from the scars.
- *Calm:* no shake; flakes are six static stamps fading in over 150 ms; the flash is the plate outline thickening 1 to 3 px for 200 ms.
- *Lizard wheel (L5):* the morph triangle's trail is ink; a throat flash is not used, because the patterns do the work.

**Hawks and Doves**
- *Crowd:* 150 crabs, the resting ones in a cached layer and the contesting pair animated; hawks wear blue and hold claws up, doves amber and low (rule 4: blue/amber plus shape; shells keep natural paint). Your lineage wears the you-halo. Background contests spark or scuttle (120 ms dash); the foreground duel is a hero at ×3.
- *No greyed buttons:* the next rival walks in while the last fight resolves; the pressed button shows a progress sweep. "+4" pops above your crab; an injury "−10" falls. A 1.2 s luminance wipe is the tide and generation; the simplex dot moves along its trail.

**The Raffle**
- *Drum:* a glass drum fills 40% of the canvas; its contents are a cached layer with ≤ 150 tickets moving. Yours are striped and haloed, rivals dotted or solid. A "1 ticket = N sperm" chip appears when the drum holds more than it draws.
- *Hold to pour:* while held, 24 tickets a second stream from the spout and the shared budget meter drains linearly; the stream tone slides from 330 to 262 Hz as the budget empties (visual twin: the stream thins). Release: the pile settles in 600 ms.
- *Egg:* the gate opens, one ticket rises on a thread (350 ms) and twirls; the egg takes the father's pattern in a 300 ms dye bloom, after the dashed expected share has appeared. From L3 a later male's tickets enter at the top and flush earlier ones out near the gate.

**Alarm Call**
- *Threat:* a hawk shadow grows over the meadow for the 1.8–3 s window; two call buttons ≥ 64 px, never greyed. Calm: a static band with a countdown arc.
- *Tags (4.1a):* squirrels wear the player's ear-flag tags; peace time shows face blazes at Hero size.
- *Call:* three ink rings ripple out (600 ms). A whistle is a thin straight ring and the caller bolts; a trill is a wavy ring and the caller freezes, so the calls differ in shape for deaf players. Listeners dash to burrows (700 ms).
- *Cost:* a killed squirrel fades to a ghost ring (animals only) and its pedigree node hollows; the debrief reveals true r under each flag and rings mismatches.

**The Forager** (the great tit, one day on one map)
- *Chick row:* four chicks at Actor size in the HUD row. When the tit crosses the last quarter of its way home the chicks gape: beaks open from closed to 70° over 160 ms, staggered 40 ms, with three tick marks above each (the peep's visual twin). Delivery: the prey travels an arc from bill to the nearest gape (350 ms, ease-in-out); the chick squashes 10% (180 ms), swallows, and fattens by 6% (to +30% at quota); five pips above it fill. A chick that gets nothing stays gaping and thin (narrower body, a shape change, not a colour change). At the end of the day fed chicks hop to the rim (180 ms), open their wings (240 ms) and fly off (600 ms); an unfed chick becomes a ghost ring in an empty nest cup.
- *Gain curve draws itself:* in a patch, the live strip extends the cumulative-gain curve (ink 3 px, with a marker) at the playhead; each prey adds a step that eases into the line (120 ms). When the bird leaves, the **tangent draws** from the travel-time origin (a vertical hairline left of zero) as a dashed ink line over 500 ms, ease-out, ending in a hollow circle at the tangent point; your leaving point is a you-diamond with a distance bracket and a mono value "0.8 g/s". Nothing is drawn before you leave (no optimum during play, RC1). Over visits each tree type's curve family builds up as hatched ghosts.
- *Costs:* a hawk strike or a flight from the hawk shakes 5 px. Calm: chicks swap sprites with no animation, the prey path is a 120 ms crossfade, and the tangent fades in over 150 ms.

**The Clinic**
- *Dish (dark-field, rule 12):* susceptible cells are **blue and smooth**, resistant cells **amber with two spikes** (one at each pole, 3 px ink ticks that survive at the 12 px crowd tier), plasmids ink loops inside cells; no cell is red. Infection is dish turbidity plus a heart-trace strip. Patients are pictograms and outcomes are tallies (rule 10); a deteriorating patient moves to a labelled intensive-care box.
- *Dose:* a liquid fills from the rim in selection hatch; susceptible cells shrink and fade over 400 ms, staggered by distance from the drug.
- *Mutant selection window:* on the live concentration curve the **MIC and the MPC** are two dashed ink lines and the band between them is hatched, labelled "mutant window" (2 words). Its chip caption reads: "between the MIC and the MPC: susceptible cells are held back, first-step resistant mutants still grow." Round 1's "the band where only resistant cells survive" oversimplified it: inside the window susceptible cells are held back rather than killed, and what grows are first-step mutants; above the MPC even those are stopped, so only cells with two resistance changes can grow (Drlica & Zhao 2007). The MODEL card defines the MPC as the concentration that stops even the least susceptible single-step mutant.
- *Plasmid:* an ink loop arcs 300 ms between neighbours; a mutation spark is green, random in place and blind to need.

**Switches** (hatching)
- *Order of events,* total ≤ 1.4 s, tap to skip, and 300 ms on repeats: the larva's denticle belts crossfade to the new identities (200 ms) while the larva shortens into a pupal case (ribbed capsule); three ink cracks draw head to tail (90 ms each, with a click each); the case halves part ±12° and 10 px (200 ms); the adult unfolds, limbs scaling from zero along their axis with a 40 ms stagger per segment (≤ 12% overshoot, 450 ms in all) and the wings opening on a bezier; the body settles with an 8% squash (120 ms).
- *Identity row:* leg, wing, haltere or none glyphs light segment by segment from head to tail (60 ms stagger), the reading order of colinearity. A match with the **target** rings both and plays one star.
- *Target:* drawn as a dashed-outline specimen plate pinned in the corner at the same scale, so it no longer looks like the result (R5a).
- *Calm:* a 150 ms crossfade from pupa to adult, one static crack stamp, a plain identity row.

**Hunt-like games (D3)**
- *Tangled Pairs (the bird hunts butterflies with a forewing band and a hindwing ray).* The peck is Lichen's. A **recombinant** eaten sheds two wing halves that drift apart (the two patterns, 250 ms). A 2×2 haplotype grid fills as tiles drop in (120 ms each, counts tick up); the LD measure D is its gap. A neutral marker is a pip on the wing edge; its link to the selected locus is an ink thread on the chromosome strips whose thickness follows r² and thins as recombination breaks it. An inversion draws as a bracket closing over the strip (200 ms) with the crossover arrows struck out. The bird's learned models sit in the Ledger (rule 11).
- *The Harvest net (the verb is a swept net).* The net is a rectangle with a visible mesh whose spacing is the mesh size; the swipe shows its shadow growing (40 ms); fish larger than the mesh lift (120 ms) into the catch tally and leave a ghost ring; fish smaller than the mesh flick 40 px away with a ripple (150 ms). The size histogram redraws with the standard reveal; the yield falls as a ▼ pop-up. The pinned fish never changes while the school does. Net width ≥ 44 px; keyboard: arrows move the net, Enter sweeps. Elephants in the Gorongosa boss are shown with tusk present or absent as shape, never as a death count.
- *Human outcomes,* wherever they occur (Malaria Coast, Clinic ward): the 600 ms count-up of rule 10, the neutral tick, no shake, no ghost rings.

---

## 6. UI layout system

### 6.1 Classes, Stage, buttons and cards

**Classes.**
- **Phone portrait (< 600 px):** 48 px bar, canvas, strip 112, dock 72; at 780 px high the canvas is 548 px (70%, never under 52%). Actions in the bottom 35%, with a left-hand mirror. The whisper sits inside the canvas, top left.
- **Phone landscape:** canvas 62% left; rail 38% (strip above dock). **Tablet (600–1023):** portrait as phone with a 200 px strip; landscape as desktop.
- **Desktop (≥ 1024):** canvas 7/12, strip and dock 5/12, max width 1600, canvas aspect 4:3 to 16:10, optional 48 px teacher strip.
- **Projector (toggle, 16:9, for 1280×720 and 1920×1080):** canvas 60%, strip 40%, 64 px presenter bar, Projector theme.

Grid 4 px; gutters 16, 24, 32; targets 44 px with 8 px gaps; no actions in the top 56 px of a phone canvas. **Stage contract:** `Stage.u = min(w, 1.2h)`; `Stage.zones` (hud, thumb, graph); `Stage.hit(x, y)` with snapping.

**Interim desktop layout (D0 §8 Q3).** At ≥ 1024 px `#app` becomes a grid up to 1280 px: canvas left, `#panel` right. The Notes sheet UI is retired in the same change; **`notes()` stays as the data provider** (`{idea, stats, charts}`, required by `boot.js`). The panel polls `notes()` at 2 Hz while the stage runs, creates one canvas per `charts[i]` and calls `charts[i].draw(canvas, 'paper')` (the legacy charts draw on a paper plate), redrawing only when the chart signature changes. It never sets `App.paused`. Chapters without charts show their `stats` table until rebuilt. The monkey pass in Phase 0 measures the poll cost per chapter.

**Buttons.** Primary carmine, secondary outline, ghost. States: rest, pressed, focus, busy (progress sweep), locked (hatched with a padlock; tap shows the reason). Choice buttons are never disabled together. **Whisper (toast):** one slot, same key replaces, polite live region, hidden while an end card is open.

**End card, 390×780.** TAKE three lines (84 px), stars (40), one chart (200), body (132), sticky action bar (64), padding 32: 552 px. Stars count up (700 ms). Actions: Next (primary), What if?, Why?, Notebook. In class mode (an assignment link) a 36 px chip row adds the **six-character result code** in 20 px mono, grouped 3+3 ("K7M 2QX"), with a copy button (the card still fits: 588 of 780 px).

**Teacher strip:** play, step, speed 1×/4×/16×, seed chip, reveal, pen, freeze and ask. Keys: Space play/pause, → step, `[` `]` speed, `S` seed, `R` reveal, `N` pen (notes), `F` freeze and ask. `P` stays "predict" in every mode.

### 6.2 Meta-game and teacher screens (D2 §6, §7, §12)

D2 specified these screens and asked D4 for layouts. All obey the text budget (labels ≤ 3 words, helper lines ≤ 15 words, no card before an action) and have a keyboard path.

**Station hub map, three layers.** A segmented control (key `1`/`2`/`3`) switches layers.
- *Bank:* a patchwork coast; each of the 16 places is a region on its own ground (soft 6 px bleed at the edges), with its anchor silhouette on a 72 px disc.
- *Lab:* the paper plate with benches drawn in 2 px ink line: Mendel's garden, the Mixer's hoppers, the twelve flasks, plates, the sequencer.
- *Expeditions:* a flat ink world map with pins (≥ 44 px) for the Black Country, Aripo, Daphne Major, Isle Royale, Australia (myxoma), the malaria belt, the fossil cliffs, Out of Africa, Gorongosa. Each pin opens the **Archive** card (real data, solid frame with a source line).
- *Unit nodes:* 44 px discs with the unit's glyph. States: locked (hatched with a padlock; the tap shows the reason, "Needs Act 3"), open, done (three stars, outline or filled, below), **suggested** (a thick ring and a "next" chip; it pulses at 1.2 s unless Calm, so it never depends on motion). Prerequisite edges are solid ink 2 px; callback edges (D2's echoes) are dashed 1.5 px with an arrowhead and an "echo" tag on tap. A locked unit offers "Jump ahead", which turns into "Jump anyway" on first use and logs it (no modal). Each act carries the previous keeper's margin question on a 14 px paper tab, ≤ 15 words, never a card.
- *Phone (390×780):* bar 48, layer control 44 (+8), map 608, bottom "Next unit" bar 72. A tap on a place opens a sheet at 62% height (483 px): a 56 px header (place name, anchor silhouette, "214 generations" chip) and 56 px unit rows (title, three stars, minutes, lock reason). *Desktop:* map 7/12, the place sheet permanent in the 5/12 column. *Projector:* the map only, nodes ×1.4.

**Bestiary page** (one per species). Header: the rig at Hero size, name, place, generation chip. Below: the player's own tone histograms, one 28 px row per generation hunted, as a stacked ridgeline with the mean as a tick (a dashed plate frame: designed data); then the Archive's real frequencies in a solid frame with a source line and a "real" tag; a MODEL chip; the pinned individuals strip. Phone: one scrolling column of about 680 px. Desktop: histograms left, Archive right.

**Specimen drawer and freezer** (one drawer, two tabs: Specimens | Freezer). Phone: a pull-up sheet from the dock to 60% height. Desktop: a 360 px right-edge drawer.
- *Specimens:* 96×128 px cards with the individual's silhouette at Actor size in its fixed phenotype, its id and notch, a generation stamp, and a thread. Opening one shows the original unchanged beside a dot-histogram of its descendants at later generations ("It never changed. Its population did.", misconception 3).
- *Freezer (D2's freezer as visible UI):* a row of 44×88 px vials, each labelled with its generation ("g4") and a 40×16 px mini-histogram. A frozen vial is hatched at 45°. The unit freezes a sample every few generations and a vial drops in (250 ms, with a tick). **What if?** opens the drawer on the Freezer tab; tapping a vial selects it, the hatch clears (300 ms) and a tray of 2–4 single-lever chips appears (no variation, no inheritance, no migration…). A thawed run wears a "from g4" chip; the original run stays on the graph as a dashed ghost.

**Laws of the Bank.** A card wall by act: 2 columns on phone (168×104 px cards), 4 on desktop. A card shows a ≤ 4-word title, the unit glyph and a star. Earned (a Transfer star) is a solid paper card with an outline star filled; unearned is hatched with a padlock and the unit name. Tapping opens the full law at TAKE size (28 px, ≤ 20 words) with a "Copy" button.

**Field Review card** (the Leitner deck, ≤ 5 items a visit, at the station). Phone budget: bar 48, five progress pips 24, stem ≤ 25 words in 4 lines (96), a mini-simulation slot 358×220, confidence control 60, action bar 64, padding 32: 544 of 780 px. The concept-code chip ("C7") and Leitner box pips sit in the bar. Confidence is a three-detent control: guess, think so, sure (keys `1`–`3`). After "Check" the mini-sim draws the expectation ghost over the player's answer, a calibration pip fills or stays hollow, and a ≤ 25-word explanation appears. No timer, streak or coin (D2 refuses them).

**Scenario-card face.** 358×501 px (5:7) on phone, 320×448 on desktop.
- Top to bottom: the kind tag (Challenge | Experiment | Lecture demo | Assessment, each with a distinct notched corner as well as the word); the title (Fraunces 22 px, ≤ 6 words); one sentence (≤ 18 words); a row of tool icons (36 px with 44 px hit areas, a ≤ 2-word label); the goal pill (a measurable predicate, ≤ 12 words); a seed chip.
- *QR:* payload ≤ 100 bytes at error-correction level M (a short id plus seed and lock bits) is QR version 6, 41×41 modules: 3 px per module on a phone (123 px plus a 4-module quiet zone, 147 px), 4 px on desktop (196 px), 8 px on a projector (392 px). Below it the **six-character code** in 20 px mono, and "Copy link". A custom card whose payload is larger shares by link only, with no QR.

**Level select.** From a unit node ("Levels") or `?level=n`. A row of 44 px chips: L1 to L5, then the boss as a double-outlined chip; 6 chips plus gaps fit in 304 of 358 px. States: locked (hatched), open, starred. Under the row, one line (≤ 8 words) names the level's concept and a minutes chip. Teacher mode shows "Unlock all".

**Assignment builder** (teacher mode; everything rides in the URL).
- *Desktop:* three columns: the unit tree (act, unit), the assignment list (unit, level range, parameter locks with ×N or realistic tags, seed, Field or Realistic, untimed on/off, projector), and a preview. Reordering uses drag or Alt+arrows.
- *Phone:* a four-step flow (Units, Levels and locks, Seed and mode, Share) with a sticky bar.
- *Output:* a link plus a QR (as above) and "Copy".

**Teacher's result-code aggregator** (the pre-server substitute for the live pool, D2 §12).
- *Student side:* the end card shows the code (above).
- *Teacher side, projector layout:* the left 28% is the entry field, six boxes of 56×72 px (96×120 projector), uppercase Crockford base32 (30 bits, no I, L, O, U), and a roster count ("23 codes"). The right 72% is the unit's own live graph with one dot or line per code, drawn in the chart type the unit uses; the expected ghost is hidden until `R` reveals it. At most 200 marks are drawn individually, beyond that hatched density cells. An invalid code shows "Not a code" in text with an icon (no red, no shake); a duplicate shows "Already in". Buttons: Export CSV, and Clear, which needs an 800 ms hold. A data table twin lists every code.

### 6.3 Framework change requests

D4 lists, D2 schedules (D2 §16.3). "Plug-in" means a `v2/00_*` file with no shell edit. Every `v2` file uses new identifiers and sorts by name, so a top-level reference to another file's `const` is a temporal-dead-zone error: wraps at top level touch only `core.js`, `ui.js` and `ch99.js` objects; anything else is referenced inside functions.

| FCR | What | Route | Ships |
|---|---|---|---|
| FCR-1 | Stage layout classes, live strip, dock; replaces the 560 px cap; retires the Notes sheet UI (`notes()` stays) | `shell.html`, `ui.js` | shell edit; the long pole |
| FCR-2 | `requestAnimationFrame` loop (`ui.js:151`) | `ui.js` | shell edit |
| FCR-3 | Embedded WOFF2 fonts (the 136 KB packs of §3), metric-matched fallbacks | `shell.html:8–10` | shell edit |
| FCR-4 | One-slot whisper replaces toasts (`core.js:107`) | `core.js` | shell edit. `toast` is a function declaration, so a plug-in can rebind it for the 8-word, one-slot rule early; the in-canvas position waits for FCR-1 |
| FCR-5 | Button and star states (stars as vector icons), focus ring; choice buttons never greyed together | `ui.js`, shell CSS | shell edit |
| FCR-6 | `tokens.css`, a `Pal` mirror, a legacy theme adapter | plug-in `00_tokens.js` (injected style) | **now** |
| FCR-7 | `fx.js`: tween, particles, pop-ups, shake, governor, cached-layer helper, `Snd` v2 | plug-in `00_fx.js` | **now** |
| FCR-8 | DOM label layer behind `Lbl.put`, virtual cursor, live region | shell (a layer inside the Stage) | shell edit. 8a, the live region, can ship as a plug-in |
| FCR-9 | Ghost-hand layer | plug-in `00_fx.js` | **now** |
| FCR-10 | Teacher strip, projector layout (the Projector theme tokens ship with FCR-6) | shell, `ui.js` | shell edit |
| FCR-11 | Colour-vision preview, hue, gamut and label lints, visual-regression harness | plug-in `00_cvd.js` plus tests | **now** |
| FCR-12 | **v2 entry without the intro card, and the v2 end card.** An outermost `App.open` wrap (v2 files load after `ch99.js`, so it wraps ch99's wrap) sends any chapter with `ch.v2` to `App.play`, skipping the intro card *and* ch99's TRANSFER and RECALL cards, after migrating `Save.d.stars[id]` to `v1stars`. An `End.show` wrap draws the v2 end card (TAKE ≤ 20 words, body ≤ 60, one chart, stars counting up; What if?, Why?, Notebook, Next) and sets `Save.d.done[id] = 1` itself, since it bypasses ch99's end wrap | plug-in `00_entry.js` | **now** |

**D2's items that D4 depends on.**
- *D2-1 URL parameters* (`boot.js`): `unit`, `level`, `seed`, `teacher`, `projector`, `locks`, `cvd`, `lab`. D4 uses `projector=1` (theme and layout), `cvd` (FCR-11), `teacher=1` (strip), `lab` (scene lab). D4 asks D2 to add two dev-build-only parameters, `theme=dusk|paper` and `calm=1`, so the screenshot harness is deterministic; they are ignored in release builds, like `lab`.
- *D2-4 versioned save key:* a changed star scheme moves the old best to `v1stars`. Display settings live in their own object, `Save.d.ui = {th, calm, read, snd, hap, lh, verbs}` (theme, Calm, Readable, sound, haptics, left-hand mirror, a 6-bit mask of demonstrated verbs; under 80 bytes), written through D2-5's storage adapter, so a star migration never resets accessibility settings and the SCORM 4,096-character budget is untouched.
- *D2-2 `startLevel(n)`:* the level-select chips call it.

**What ships first.** The five plug-ins (FCR-6, 7, 9, 11, 12) take days and give D1's Wood pilot a ghost hand, particles, tokens and the v2 entry. FCR-1 is the long pole, so D1's pilot gates that need a layout (median first action under 10 s on a phone, 60 fps with the tray and particles) are judged only after FCR-1, 7 and 9 exist.

---

## 7. Onboarding by demonstration

Title, "Begin", then the live scene: no menu, no card (D2 §9), via FCR-12.

**Ghost hand.** A paper-coloured hand glyph (72 px, 60% opacity), 3 s loop: enter from the bottom edge (600 ms), travel on a bezier (400 ms), pause 150 ms, press (scale 0.85, ring ripple 200 ms), show the consequence (the moth pops, 250 ms), fade. It replays every 4 s until the first real input; a pulsing ring (1.2 s) marks the target. Calm: a static arrow and ring.

**The first action cannot fail.** The demo targets the most conspicuous actor. D1's L0 now has it: **morning 1 has 8 conspicuous moths and a clock at ×0.6 (a 12 s morning lasts 20 s)**; the HUD says "You are a bird. Tap a moth."

**Verb library:** tap, drag, hold, draw a curve, slide, toggle, and now sweep (the Harvest net) and hold-to-pour (the Raffle). Each is shown once per profile (bit in `Save.d.ui.verbs`, `localStorage` in try/catch), replays on `?`, and is off in teacher mode. A keyboard user (first keydown) sees a key-cap animation; a live region reads the demo as text. Each later unit adds at most one new verb.

---

## 8. Accessibility (WCAG 2.2 AA)

- **Keyboard (2.1.1, 2.1.2, 2.4.7, 2.4.11):** a virtual cursor over canvas actors (roving tabindex on hidden DOM mirrors; arrows move, Enter or Space acts). `1`–`9` choose, `L` lens, `P` predict (arrows move the ghost, Enter commits), `G` graph, `M` mute, `?` help. The focus ring is `--text` with a `--ground` gap, not ochre (2.2:1 on paper); the strip never covers a focused actor. New widgets: the scatter and GenomeStrip walk their points with arrows; `Evidence` instruments are a tab-ordered shelf; `PedigreeView` nodes are a roving set with a tag menu on Enter; the drawer's vials and the Laws wall are lists; the station map is a list per layer with the same unit order as the sheet.
- **Dragging (2.5.7), targets (2.5.8):** every drag has a tap alternative; targets are 44 px (AA minimum 24). The Harvest net and the Raffle pour have key equivalents (Enter sweeps; hold Space pours).
- **Timing (2.2.1):** every reflex unit has an untimed mode with an attention budget; camouflage hunts get the detection-rule path (D2 §13).
- **Colour (1.4.1, 1.4.3, 1.4.11):** section 2, plus CI `mono` and `deut` screenshots and the hue, gamut and label lints (§2.4). Memory tiles keep a 3:1 outline at every age (rule 11). **Text (1.4.4, 1.4.10, 1.4.12):** DOM labels survive 200% zoom, 320 px reflow and user text spacing. **Flashing (2.3.1):** nothing flashes more than twice a second, counted over the whole screen.
- **Sims for screen readers (4.1.3):** one polite line per generation, at most one per 3 s ("Generation 12. Dark moths 62%, up 7. You ate 15 of 30."); key `D` reads a 60-word scene description; every chart has a data-table twin. Pictogram tallies read as sentences ("38 of 50 children reached adulthood").
- **Result codes and QR:** the code is always typeable and read aloud in groups of three; the QR is never the only route.
- **Calm mode** (OS `prefers-reduced-motion` or a setting, since managed school devices hide the OS switch): no shake or parallax; particles become static stamps; tweens become 120 ms crossfades; the ghost hand becomes a static arrow; the suggested-unit pulse and the hatching sequences become static states; pop-ups fade in place. Stars never depend on it.
- **Help and entry (3.2.6, 3.3.7):** help in the same place on every screen; class join by code.

---

## 9. The fifteen highest-impact fixes

Each line is *before* (evidence) → *after*, then the owner.

1. `#app{max-width:560px}` leaves 720 of 1280 px dead, cuts the title tree at x=920, pushes the Steward chart below the fold → one Stage, five layout classes (FCR-1).
2. Notes pauses play, covers 72%, and its Graphs tab is empty in ch18–29 and 10 chapters of I–VI → a live strip that never pauses (FCR-1; each v2 `graph` spec); `notes()` feeds it.
3. Bats 25 px, squirrels about 30, sperm 12, pollinators 8, brood dots 4, Commons dots 3, on 390 px → Hero ≥ 12%, Actor ≥ 7% of `u` (27 px), Crowd read as shape in a cached layer (each v2).
4. 31 of 43 sized labels in ch20–29 are 10–11 px ("tap: guard left", "her 20 eggs") → 12 px floor, 3 words, `Lbl.put`, paper pill, DOM labels at FCR-8.
5. Red/green carries meaning in Crossing Over L3, Many L2, Commons, Raffle chart, Clinic, Lock, Eq L12, Fancier chart and every pass/fail bar → section 2 inks plus a second channel: resistant amber and spiked, susceptible blue and smooth, cheaters spiked, pass filled versus fail hollow (FCR-6; each v2).
6. 39 themes, 39 grounds, 36 accents; Equilibrium on its own palette and fonts → 16 places, a Lab plate and an Expeditions map; global chrome and inks (FCR-6).
7. 48 text rows, then 109–143 words on an artless cream card, Mendel's first action in sentence four → Begin, live scene, ≤ 40 words, ghost hand in 3 s (FCR-9, FCR-12).
8. End cards of 200–260 words, chart below the fold, primary button clipped at 390×780 → TAKE ≤ 20 words, body ≤ 60, one chart, sticky actions (FCR-1, FCR-12).
9. Up to 3 stacked toasts, not de-duplicated, over plants, chromosomes and end cards → one 8-word whisper, never on an end card (FCR-4).
10. Locked stars about 1.7:1, disabled buttons about 1.9:1, both choices greyed in Hawks, Alarm, Lek → outline stars ≥ 4.5:1 as vector icons, a busy sweep, locked shows its reason (FCR-5).
11. About 300 `Snd.*` calls, no particle system; a correct answer is a toast and a number → three-tier juice, 200 ms pop and ripple, star count-up, a visual twin per sound, Calm (FCR-7).
12. VII–XI: empty Islands sea, the same finch at 5.2 and 14.8 mm, no flame, no web, Switches' target drawn like the result → arrivals as dots on an island and a drawn beak cracking seeds (Archipelago and Seed Rain rebuilds, D3), the mismatched segment lit on the fly and a dashed target plate (Switches, §5.3). Islands, the Food Web and After the Fire sit in D2's appendix and keep their own look until rebuilt.
13. I–VI: Fancier 24 identical pigeons (3.0), Landscape circles (3.5), Raffle (4.5), Hawks two crabs (5.0), Meadow pollinators → rig specs now exist: varied crests (Breeder), a contour plate with a rolling cloud (Twelve Flasks), the Drum, 150 crabs, pollinators ≥ 39 px (§4.4, §5.3).
14. Clipped ticks (".4 mm", "i5 cm"), 8–9 px ticks, Coalescent zigzags, Lock chart in a 60 px corner, Casino's blank frame → the eight charts: padded axes, 12 px ticks, a drawn tree, full width, live from frame 1 (FCR-1).
15. Google Fonts `<link>` breaks offline play and leaks IPs; fallbacks are Georgia and Times; Greek and ★ fall to random system fonts → embedded WOFF2 with a Greek and symbols pack, metric-matched fallbacks, vector stars, the type scale, Readable mode (FCR-3).

**Testing the look.** Screenshots at 390×780, 1024×768, 1280×720 with seed and clock fixed (R5b's capture scripts and the rung-0 gallery of §4.2 become the baselines), plus `mono` and `deut`; axe-core with zero serious violations; the lints of §2.4 and a lint for hit areas under 44 px; 60 fps with a 2,000-dot cached layer and 150 moving sprites under 4× CPU throttle (measured: 5.9 ms of a 16.7 ms frame); the QR scan test on a projector capture.

---

## 10. Compliance with D0

**How D4 removes the root causes.**

| RC | D4's fix |
|---|---|
| RC1 The player calculates | The graph never pauses and shows what the population did; no optimum appears during play (the Forager's tangent draws after the player leaves; the Evidence widget shows power, not the answer). |
| RC2 The player is the organism | The player is drawn as a shadow, a hand, a net, a pour or a dose, never a body that changes; the pinned individual stays fixed and the specimen drawer proves it. |
| RC3 Text before play | A 40-word budget, ghost hand, one-slot whisper, no card before the first action (FCR-12), no card on opening a drawer or a Field Review. |
| RC4 Concept in the caption | Actor tiers, a 12 px floor, the diegesis ladder with ten rung-0 objects, eight charts, Petri and Strata scenes, an X-linked HUD. |
| RC5 No escalation | T3 juice is reserved for level and boss; each level adds one visual variable; the hatching sequence plays in full once per level. |
| RC6 Model, text and evidence disagree | ×N chips, ≈ compression marks, designed versus real frames, expected versus realised, a Realistic chip, the corrected mutant-selection-window caption. |
| RC7 No spine | One look, 16 places, anchor and species rigs, one palette, one chart grammar, shared widget looks (Ledger, Evidence, PedigreeView, Pin), one set of conventions for tokens. |

**Section 3 is respected.** D4 adds no scientific claim of its own beyond depiction. The triangle HUDs mark dawn and dusk, so a good fit at dawn is never read as "nothing is happening"; XHud shows that HW holds for females only once p_f = p_m. Mutation sparks are random in place and identical for harmful and neutral changes, never an arrow toward a need. Selection is a sieve, not a hand choosing. No creature wears a thought bubble. Mating system and recombination get no force colour, so nothing says they never move p. Contested ideas wear a pill and no star. Humans are pictograms, and the Clinic's window caption now states the mutant selection window correctly.

**Depiction claims for Coordinator A.** The great tit's plumage (yellow breast with a black median stripe, black cap, white cheek); side-blotched lizard throats are orange, blue and yellow (Sinervo & Lively 1996, via D1); the clinic window's definitions of MIC and MPC (Drlica & Zhao 2007, *Clin Infect Dis* 44:681); the X-linked recurrences behind XHud, p_m′ = p_f, p_f′ = (p_f + p_m)/2 and p̄ = (2p_f + p_m)/3 invariant (D3's Royal Line); *Anopheles* resting with the abdomen raised; the face blaze is a designed cue, labelled so.

**Answers to D0 §8 for D4.** (1) One look; worlds become 16 places (1.3). (2) Recipe, cache, transform, with the ground baked off-thread and crowds cached (1.4). (3) A two-column grid at ≥ 1024 px with `notes()` as the live strip's provider (6). (4) Live graph (4.2), projector theme (2.3), colour-vision palette (2.1, 2.4), type scale and font budget (3), whisper (6), ghost-hand demo (7).

---

## 11. Disagreements with integrator

No feedback item is refused. Two are done in a modified way, with reasons.

1. **"Crowd-tier batched dots (2,000 budget)" holds only as a cached layer.** I measured Canvas2D (software canvas, DPR 2): redrawing 2,000 sprites every frame costs 15 ms at 1× and 83 ms at 4× throttle, so it cannot hold 60 fps on a Chromebook-class CPU. A 2,000-dot cached layer costs 0.3 ms (1.3 ms throttled) and 150 moving sprites on top 5.9 ms. The eggs are therefore crowd-tier dots in a cached tray at the true 10:1 ratio, as the feedback asks, but they are not animated one by one. D2's Phase 1 gate should read "a 2,000-dot cached layer plus ≤ 150 moving sprites at 60 fps under 4× throttle". "2,000 live sprites" is a Pixi-port target (R6).
2. **FCR-8 can be split.** D2 routes FCR-8 (DOM labels, virtual cursor, live region) to a shell edit. The live region is a hidden `aria-live` div, which a plug-in can add today, so I propose 8a (live region) as a plug-in and 8b (label layer positioned by the Stage) with FCR-1. Likewise `toast` is a function declaration that a plug-in can rebind, so the one-slot, 8-word whisper can ship early (FCR-4). If D2 prefers one shell change, nothing else here depends on it.

---

## 12. Revision notes (round 2)

- **Charts and scenes:** added the scatter (reference line, at most three hued series, Lichen, Bitter, Ellipse, Pseudoreplication and Extinction uses) and the GenomeStrip (Manhattan Hunt, Islands of Divergence, `clock`, Out of Africa tracts) for eight chart types; the XHud (female triangle plus male p bar) for Royal Line, Hive and the Fig; Petri and Strata as rung-0 scenes with a log-time ruler that reuses the ≈ mark; looks for `Evidence`, `PedigreeView`, `Pin` and the freeze-and-ask prompt (§4.2, §4.3).
- **Colour conventions:** rule 4 restricted to exactly-two-type systems (Hawk/Dove, caller/silent, cooperator/cheater); three-morph lizards keep natural paint (muted to stay ≥ 8.9 from the inks), with throat patterns and neutral O/B/Y simplex letters; rule 2 adds one-copy genotypes (a bar under a single token); rule 7 adds 4 fills × 3 overlays and a richness row for 12 alleles, and a ranked bar above 12; rule 10 bans on-screen human death with a pictogram-tally format; rules 11 (memory marks as hatch steps, replacing sub-3:1 transparency) and 12 (dark-field microscope views) are new; rule 5 gains a hue lint with the measured hue ΔE (§2.2).
- **Specific rulings applied:** Alarm Call uses D1's ear-flag tags and the father's face blaze, no collars (4.1a); the Clinic is blue-smooth against amber-spiked with the corrected mutant-selection-window caption; Lichen dusk draws 300 eggs to 30 in a cached tray at 10:1 with a "1 dot = N eggs" chip beyond 600; the Hedge and Act 6 anchor are the great tit; D1's 8-moth ×0.6 morning is acknowledged as now in D1's L0.
- **Juice:** added Jaws (guard flash, scale burst), Forager (chick gape, the gain curve and tangent drawing themselves), Switches (hatching), Tangled Pairs and the Harvest net; Hawks, Raffle (hold to pour), Alarm and Clinic updated; sounds added; human outcomes get the neutral tick only.
- **Layouts:** nine screens added: station hub map (three layers), bestiary page, specimen drawer with the freezer, Laws of the Bank, Field Review card, scenario-card face with QR, level select, assignment builder, result-code aggregator (§6.2). The interim desktop layout now says `notes()` is a provider and the Notes sheet UI is retired.
- **FCRs:** FCR-12 and D2's URL parameters and versioned save key added; each FCR marked plug-in or shell edit; file names aligned with D2's numbered prefixes (§6.3).
- **Resolved from the critique:** canvas text routed through `Lbl.put` (R6 rule 2); fonts re-budgeted with measured subsets, a Greek and symbols pack, vector stars and a note on the PWA shell budget (R6 rule 7); rig specs for Fancier, Landscape and the Meadow pollinators, plus 12 rig rows for the species in D3's units and four new places.
- **Borrowed:** D1's Ledger as the memory look; D2's freezer as a drawer and the freeze-and-ask prompt; D3's rung-0 objects for the gallery, and D3's Petri, Strata, GenomeStrip and widget list; D1's `Evidence`, `PedigreeView` and `Pin`.
- **Flag to D1:** stars never depend on hue. D1's round-2 Wood already fixes hue and selects on tone, so this is now a CI lint.
- **Open for others:** D2 to approve the four new places and the single-file font budget; D3 to confirm the provisional rigs in its tier 3–4 specs; Coordinator A to check the depiction claims in section 10.
