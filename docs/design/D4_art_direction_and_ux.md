# D4. Art direction and UX style guide

*Art director and motion/UX designer. Follows D0 (binding). D4 owns look, palette, lenses, size and type minimums, chart grammar, juice, layout, onboarding look and accessibility. "Measured" numbers come from scripts run for this document (`scratchpad/d4/`): a colour-vision checker (Machado 2009, severity 1.0, distances in OKLab ×100) and a bake timer on the review container's CPU, not a Chromebook. R5a's Soot "undefined" and "-100%" bugs are already fixed (G2, G6).*

## 0. Decisions in brief

1. **One look, "Field Plate".** A painted ground that varies by *place*; actors, inks, plates and chrome never vary by chapter. This retires 39 chapter themes (39 grounds, 36 accents).
2. **Two kinds of colour.** *Data inks* (blue A, amber a, four force colours) have fixed meanings. *Entity paint* (bark, wings) is natural, and any distinction that matters in it is also carried by shape, pattern or luminance. No red/green anywhere.
3. **Entities the player must read are ≥ 7% of the stage unit (27 px on a phone); canvas text is ≥ 12 px and ≤ 3 words.**
4. **The graph never pauses.** A live strip replaces the Notes sheet; six chart types share one grammar.
5. **Three juice tiers**, every sound mirrored visually, a Calm mode for every effect.
6. **Five layout classes** on one Stage contract; eleven framework change requests.
7. **Onboarding is a 3-second ghost-hand demonstration**; **WCAG 2.2 AA** is a per-chapter deliverable.

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
- **Figure/ground contract.** Outside camouflage chapters the ground sits at OKLab L 0.38–0.81, texture within ±0.06 L, never blue or amber at chroma above 0.10. Themes (Dusk, Paper) change chrome and chart plates; the painted ground changes only by place, dimmed ×0.88 in Dusk.

### 1.3 Ruling on D0 §8 Q1: one look

R5a defends per-chapter worlds, R5b calls them three apps. Worlds become **places**; everything else is global. Grounds (anchor species), each ≥ 4.0:1 against ink or paper outline (measured): Wood #8F9A7E (moth; exempt, bark is the variable), Beetle Isle #B7A57A (beetle), Streams #3E6B6A (guppy), Shore #D2BE96 (hermit crab), Lake #2E6F86 (cichlid), Meadow #7C9A55 (squirrel, bee), Hedge #7A6E4E (starling), Pond #2F5A4E (water flea), Fig Grove #6F7F3F (fig wasp), Valley #A38B6B (salamander), Outer Islands #4E6A7A (finch), Warren #4A3F36 (rabbit). Lab is the paper plate (#F4EEDD). Legacy chapters keep their `theme` until rebuilt; an adapter maps it to the nearest place (FCR-6).

### 1.4 The rig (D0 §8 Q2): genotype to look in Canvas2D, portable to Pixi

`develop(genome)` gives a phenotype (sim, no DOM). `recipe(phenotype, species)` gives JSON parts, colours and sizes. `bake(recipe)` rasterises once into a cache keyed on the recipe quantised (8 bins for tone, 4 for each other trait: 128 variants cover 2,000 moths). Each frame is a `drawImage` with a transform (position, rotation, flip, ±8% scale seeded by individual id). In Pixi the same recipe becomes a `RenderTexture` through the same path vocabulary (ellipse, bezier, polygon, fill, stroke, clip).

Measured: `mothSprite` bakes 100 sprites at DPR 2 in 24 ms, so actors are cheap. `barkTex` at 390×585 takes 78 ms at DPR 1, 265 ms at DPR 2, 531 ms at DPR 3; `leafTex` 10 ms. The cost is the ground: cap its DPR at 2, bake in a Worker (OffscreenCanvas) behind a 1× preview, cache per place, never bake in the frame loop. Re-measure on a Chromebook in Phase 0.

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

**Measured** over all 15 pairs (normal, deuteranopia, protanopia, tritanopia): Paper fills ≥ 14.3, 10.2, 11.0, 9.1. Dusk ≥ 13.2, 11.3, 11.6, 5.4; the weak pair, mutation/migration under tritanopia, never relies on colour. Dusk inks are ≥ 5.2:1 on the cabinet. Paper fills fail 3:1 on paper (amber 1.65, sky 1.65, green 2.37), so every filled mark has a 1.5 px ink outline. Thin lines use the darker line column (≥ 3.2:1), which separates worse (a/selection 5.3, drift/mutation 5.7 under deuteranopia), so **a chart draws at most three hued lines, each with marker and end label.** In greyscale A and a differ by 0.28 L, but neighbouring forces differ by under 0.12 and migration equals a (0.79 against 0.80), so forces always carry icon and marker.

### 2.2 Conventions, identical in every game

1. **Token:** a disc ≥ 14 px, allele fill, 1.5 px ink outline, bold serif letter (white or ink, whichever clears 4.5:1). Under 14 px, no letter; halves carry the allele.
2. **Genotype:** AA both halves blue, Aa blue left and amber right (never blended), aa both amber. Halves sit on wing cases (beetle), forewings (moth), flank (fish); other creatures wear a pill badge of two tokens. Dominance maps to one phenotype look; codominance shows both.
3. **Organisms keep natural paint; tokens, jars, lines and badges carry allele colour.** Equilibrium's abstract beetle is the one blue-and-amber body.
4. **A rule that becomes inherited** (Hawks' invasion view, Jaws' boss) wears allele colours: H blue, D amber.
5. **Continuous traits** use luminance or size, never hue. Histograms are neutral ink: eaten hollow, spared solid, offspring hatched; S arrow in selection colour, R arrow ink.
6. **Frequency** is a 100% stacked p|q bar, numerals ≥ 14 px. Pies are banned (Castaways' five-hue pies).
7. **Three or more alleles:** blue, amber, paper-white, ink-black, then lettered pattern discs (stripe, dots, check, ring).
8. **Expected** is a dashed ink ghost, **realised** solid colour, **you** a diamond with the word "you" (ink on Paper, paper on Dusk). Ochre (#CF9A33) is chrome only (stars, section names); D1/D3's "gold" for "yours" means this you-halo.
9. **State without red/green:** filled versus hollow disc, solid versus hatched bar, filled versus outline star (locked stars ≥ 4.5:1).
10. **Humans** are paper-cut pictograms in one ink, never skin tone or faces (D3's Human Variation, after its fact-check).

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

Text is 12.5:1 (text-2 7.8:1) on Dusk and 13.7:1 (6.8:1) on Paper; no text uses alpha. **Projector** adds strokes ×1.5, type ×1.4, ΔL ≥ 0.25 between regions that must be told apart (lamp washout erases small steps), muted sound, hidden answers. Themes follow `prefers-color-scheme` with a `data-theme` override.

### 2.4 Colour-vision preview

`?cvd=deut|prot|trit|mono` applies an SVG `feColorMatrix` (Machado matrices) over stage and charts. Each v2 chapter declares its categorical encodings (colour, shape, pattern, marker); CI fails any pair that shares a channel and sits under ΔE 8 in any simulation.

---

## 3. Type and text budget

**Fonts.** Fraunces 600/800 (titles, TAKE, big numbers), Spectral 400/600 (body), IBM Plex Mono 400/500 (numerals, ticks). Embedded WOFF2 subsets (Latin plus Latin Extended, 120 KB budget), metric-matched fallbacks so a missing font never reflows. No third-party link: today's `<link>` breaks offline play and sends each student's IP to Google (R6).

**Scale (px; phone / desktop / projector at 1280×720):** tick 12 / 12 / 20; label 14 / 14 / 22; HUD and body 16 / 16 / 28; TAKE 28 / 28 / 40; big number 44 / 48 / 64. All rem; 200% zoom and 320 px reflow must work. The projector floor of 20 px is a rule of thumb to confirm in a lecture theatre in Phase 1.

**Readable mode:** Atkinson Hyperlegible for HUD, body and labels; no italic sentences; line height 1.6; tracking +0.04em; left-aligned; 60-character lines. The British Dyslexia Association asks for plain sans-serif, 1.5 spacing, no italics or capitals; evidence for special "dyslexia fonts" is weak (Wery & Diliberto 2017), so none ships.

**Text budget** (D0 §5 binding; hard limits):

- **Before the first action:** 40 words in the HUD strip over a ghost hand, no card: about 10 s at the 238 wpm adults read non-fiction (Brysbaert 2019).
- **HUD line:** 15 words and one live number. **Whisper (toast):** 8 words, 2.4 s. **Canvas label:** 3 words, ≥ 12 px, on a paper pill over texture.
- **Teaching panel:** 35–60 words, one idea, picture already changed. **Interesting result:** ≤ 25 words plus a What if? button.
- **End card:** TAKE ≤ 20 words; body ≤ 60; one chart; "Why?" holds real, maths and MODEL in 60-word chunks.
- **Whole screen:** ≤ 70 words on a phone, ≤ 120 on desktop, excluding ticks and legend chips. Sentences ≤ 18 words.

---

## 4. Creatures, charts and disclosure

### 4.1 Creature rules

1. **Squint test:** a solid black silhouette identifies the species at 28 px. The trait the player must read is a silhouette feature where biology allows (beak, crest, claw, jaw).
2. **One trait, one channel:** continuous gives size, length or luminance; categorical gives shape, pattern or letter; hue is a bonus. At most three channels vary in a population.
3. **One rig per species,** reused by every chapter; chapters change parameters, never style. Eyes are a dot with a ≥ 2 px specular; gaze points at what the animal reacts to.
4. **Identity:** each individual has an id, seeded size and pose jitter, and one micro-mark (a notch), so a pinned individual is recognisable across generations; a thin thread links it to its young.
5. **States:** idle (0.6–1.2 Hz, seeded phase), alert (150 ms, ×1.1, head turn), gone (a dashed ghost ring for 2 s; no gore, no cross).
6. **Lenses** on any population: LOOK, GENES (two tokens per actor, split halves for a crowd), JARS (tokens fly to jars, ≤ 1.2 s). Crowds of 100 or more draw as simplified 12 px silhouettes, batched.
7. **No decoration and no thought bubbles:** nothing "needs" or "wants" (D0 §3 agency).

| Tier | Size, u = min(width, 1.2×height) | Count | Use |
|---|---|---|---|
| Hero | ≥ 0.12u (47 px at 390) | 1–3 | the duel, the pinned individual, your lineage |
| Actor | ≥ 0.07u (27 px) | ≤ 40 | anything read, tapped or compared |
| Crowd | 0.03–0.07u | ≤ 2,000 | a distribution only; no letters |

Particles below 0.03u are dust. Hit area ≥ 44 px (invisible padding; nearest centre wins). Hunt prey keep today's ≈ 8%; difficulty is tuned by tone, not size.

**Anchor rigs.** D4 confirms D2's provisional anchors (D2 §2). Moth: tone, hue, mottle, banding stencil, C/c badge on the thorax. Beetle: wing-case halves. Hermit crab: claw up or down plus carapace luminance. Ground squirrel: kin class as collar pattern (solid, dashed, dotted) plus a 14 px "r" label, not 2 px collars. Finch: beak depth in silhouette.

### 4.2 Charts in the scene

**Diegesis ladder (use the highest rung available):** 0, the world is the chart (bark with moths, jar beads, drum tickets, dish turbidity); 1, organisms fall into the plot (D1 G6); 2, a plate in the strip; 3, a HUD number. Every chapter's main variable needs rung 0 or 1.

**Live strip.** Phone: full width, 112 px, drag up to 60% of height, never pauses. Desktop: right column. Anatomy: tick labels inside the plot (12 px mono); playhead at the latest generation; realised solid 3 px with marker; expected dashed ink 2 px, no marker; you diamond; target as hatched band; direct end labels; `<table>` twin behind "Show data". Bars start at zero; no dual axes, no 3D; ≤ 4 series; colour follows the entity, never its rank. **Reveal:** organisms lift (120 ms), slide to bins staggered 8 ms (≤ 600 ms total), land with a 10% squash. Calm: 150 ms crossfade.

**The six charts (D1 behaviour, D4 look):** *dot-histogram* (dots stack by trait); *allele bar p|q* with the GenePoolLens (segmented LOOK/GENES/JARS, 44 px segments, key `L`); *trace with ghost* (a fan of thin lines, a bold you-line, a dashed expectation); *triangle HUD* (120 px, dashed HW curve, dawn dot hollow, dusk dot filled, tap to expand to 240 px); *PriceBars* (between-group solid selection colour, within-group hatched, total ink: one force at two levels); *tree and deme map* (branches ink 2 px with a time axis; demes as discs with a p|q bar and migration arrows weighted by m). **Interaction widgets:** *Predict* is a hollow diamond with a 44 px halo, and the tolerance band hatches in after commit; *Ledger* is 28 px tiles with a tongue or tick glyph, fading 60% to 20%; *Invasion* is 200 tokens in four rows, your lineage haloed.

**Disclosure marks.** ×N chip (ink-outline pill) on any unrealistic parameter; a "≈" break in the time ruler for compressed history; designed data in a dashed plate frame, real data in a solid frame with a source line; contested ideas get a dashed pill, never a star.

---

## 5. Motion and juice

### 5.1 Principles

1. **Every effect carries information:** what changed, how much, whose doing.
2. **Three beats:** telegraph (30–90 ms: the beak shadow grows), act, settle (150–250 ms, overshoot ≤ 12%). Response ≤ 100 ms, payoff ≤ 400 ms, population change ≤ 2 s.
3. **Tween everything numeric,** frame-rate independent (dt capped at 50 ms). Arrivals ease-out-cubic, travel ease-in-out-cubic, UI pops spring (stiffness 170, damping 22), timers linear.
4. **Three tiers:** T1 per action 120–200 ms; T2 per generation 400–800 ms; T3 per level or star 0.8–1.5 s, at most one per 3 s.
5. **Particles:** five kinds, each tied to a concept: dust, feather or scale, spark (mutation), droplet (dose, flood), egg or seed dot. Pooled sprites, ≤ 150 live on phones, ≤ 400 on desktop.
6. **Shake only for costs the player pays** (bitter mouthful, injury, flood): 5 px at 390 px, two cycles in 180 ms, at most one per 600 ms; never for success.
7. **Number pop-ups:** ≥ 16 px mono bold in ink with ▲/▼ and a sign, never red or green; rise 24 px over 700 ms, fade from 400 ms; bursts within 150 ms merge; anchored to the thing that changed.
8. **Hit-stop** 50 ms on costly events only. Count-ups 600 ms ease-out; stars land 180 ms apart on rising notes.
9. **Juice governor:** frame time above 20 ms for 30 frames halves particles, then drops squash, then enters Calm.

### 5.2 Sound and haptics

Two families: *field* (diegetic, synthesised noise) and *notebook* (soft pencil and glass). Pitch rises with gain and falls with loss (a falling minor third, never a buzzer); reward notes from C major pentatonic; ≤ 3 voices; muted by default in class and projector modes; every sound has a visual twin and an optional caption chip. Existing voices stay. New: selection sieve (band-pass noise 800 to 2,400 Hz, 220 ms), mutation tick (sine 2.4 kHz, 40 ms), dusk pad (110 and 165 Hz, 1.2 s fade), wingbeat and scuttle (noise, 4 Hz tremolo), count tick (880 Hz, 20 ms, +1 semitone per tick), Interesting result (triangle 392 to 330 Hz).

**Haptics.** The Vibration API works on Android Chrome and not in iOS Safari at the time of writing, so it is a bonus: tick 8 ms, hit 18 ms, cost 2×25 ms, star 10-20-30 ms. Opt-in, off in Calm, never the only cue.

### 5.3 Six chapters, applied

**The Lichen Wood / Black Country**
- *Peck:* a bird shadow grows over the tapped moth in 90 ms, then three dust puffs (300 ms); the moth lifts 6 px and leaves a ghost ring; crunch. "+1" pops on the chick row, which pops (220 ms). A miss gets one puff and a 4 px timer flinch.
- *Dusk:* survivors emit 6–10 egg dots (20 ms stagger); the winter wipe blinks losers out down to K; survivors slide into the histogram; the S arrow draws in selection colour, the R arrow in ink.
- *Soot and pin:* a haze rises over 4 s with ≤ 40 flecks as `barkTex` crossfades. A 450 ms hold fills a ring; the pinned moth gets a paper halo and a thread to its young.

**Bitter Wings**
- *Bitter mouthful:* the moth staggers off alive; shake 5 px; corners darken 20% for 250 ms (luminance, not hue); sawtooth drop; a ledger tile flips in.
- *Memory cue:* a warning-wing icon in the HUD thickens its outline 1 to 4 px per bitter taste; at three, models gain a dashed avoid-ring that fades over two mornings. When mimics outnumber models the ring cracks into dashes.

**Hawks and Doves**
- *Crowd:* 150 crabs; hawks hold claws up, doves low (shape, not red and grey). Background contests spark or scuttle (120 ms dash); the foreground duel is a hero at ×3.
- *No greyed buttons:* the next rival walks in while the last fight resolves; the pressed button shows a progress sweep. "+4" pops above your crab; an injury "−10" falls. A 1.2 s luminance wipe is the tide and generation; the simplex dot moves along its trail.

**The Raffle**
- *Drum:* a glass drum fills 40% of the canvas; a tap drops five tickets that tumble and settle (600 ms). Yours are striped, rivals dotted or solid.
- *Egg:* the gate opens, one ticket rises on a thread (350 ms) and twirls; the egg takes the father's pattern in a 300 ms dye bloom, after the dashed expected share has appeared.

**Alarm Call**
- *Threat:* a hawk shadow grows over the meadow for the 1.8–3 s window; two call buttons ≥ 64 px, never greyed. Calm: a static band with a countdown arc.
- *Call:* three ink rings ripple out (600 ms). A whistle is a thin straight ring and the caller bolts; a trill is a wavy ring and the caller freezes, so the calls differ in shape for deaf players. Listeners dash to burrows (700 ms).
- *Cost:* a killed squirrel fades to a ghost ring and its family-tree node hollows; relatedness labels (½, ¼, ⅛, 14 px) sit on 4 px rings, solid, dashed, dotted.

**The Clinic**
- *Dish:* resistant 12 px rods are ringed with two spikes, susceptible smooth and pale (ΔL ≥ 0.2). Infection is dish turbidity plus a heart-trace strip, not red.
- *Dose:* translucent liquid fills from the rim in selection hatch; susceptible cells shrink and fade over 400 ms, staggered by distance from the drug. The band where only resistant cells survive is the mutant selection window.
- *Plasmid:* an ink loop arcs 300 ms between neighbours; a mutation spark is green, random in place and blind to need.

---

## 6. UI layout system

**Classes.**
- **Phone portrait (< 600 px):** 48 px bar, canvas, strip 112, dock 72; at 780 px high the canvas is 548 px (70%, never under 52%). Actions in the bottom 35%, with a left-hand mirror. The whisper sits inside the canvas, top left.
- **Phone landscape:** canvas 62% left; rail 38% (strip above dock). **Tablet (600–1023):** portrait as phone with a 200 px strip; landscape as desktop.
- **Desktop (≥ 1024):** canvas 7/12, strip and dock 5/12, max width 1600, canvas aspect 4:3 to 16:10, optional 48 px teacher strip.
- **Projector (toggle, 16:9, for 1280×720 and 1920×1080):** canvas 60%, strip 40%, 64 px presenter bar, Projector theme.

Grid 4 px; gutters 16, 24, 32; targets 44 px with 8 px gaps; no actions in the top 56 px of a phone canvas. **Stage contract:** `Stage.u = min(w, 1.2h)`; `Stage.zones` (hud, thumb, graph); `Stage.hit(x, y)` with snapping.

**Interim desktop layout (D0 §8 Q3).** At ≥ 1024 px `#app` becomes a grid up to 1280 px: canvas left, `#panel` right. Chapters returning `notes().charts` mount them live there, without pausing; the rest show their stats table until rebuilt.

**Buttons.** Primary carmine, secondary outline, ghost. States: rest, pressed, focus, busy (progress sweep), locked (hatched with a padlock; tap shows the reason). Choice buttons are never disabled together. **Whisper (toast):** one slot, same key replaces, polite live region, hidden while an end card is open.

**End card, 390×780.** TAKE three lines (84 px), stars (40), one chart (200), body (132), sticky action bar (64), padding 32: 552 px. Stars count up (700 ms). Actions: Next (primary), What if?, Why?, Notebook.

**Teacher strip:** play, step, speed 1×/4×/16×, seed chip, reveal, pen, freeze and ask (D2 §12).

**Framework change requests (D4 lists, D2 schedules).** FCR-1 Stage layout classes, strip, dock (`shell.html`, `ui.js`). FCR-2 `requestAnimationFrame` loop (`ui.js:151`). FCR-3 embedded WOFF2 (`shell.html:8–10`). FCR-4 whisper replaces toast (`core.js:107`). FCR-5 button and star states, focus ring. FCR-6 `tokens.css`, a `Pal` mirror, a legacy theme adapter. FCR-7 `fx.js` (tween, particles, pop-ups, shake, governor) and `Snd` v2. FCR-8 DOM label layer, virtual cursor, live region. FCR-9 ghost-hand layer. FCR-10 teacher strip, projector theme. FCR-11 CVD preview and visual regression harness.

---

## 7. Onboarding by demonstration

Title, "Begin", then the live scene: no menu, no card (D2 §9).

**Ghost hand.** A paper-coloured hand glyph (72 px, 60% opacity), 3 s loop: enter from the bottom edge (600 ms), travel on a bezier (400 ms), pause 150 ms, press (scale 0.85, ring ripple 200 ms), show the consequence (the moth pops, 250 ms), fade. It replays every 4 s until the first real input; a pulsing ring (1.2 s) marks the target. Calm: a static arrow and ring.

**The first action cannot fail.** The demo targets the most conspicuous actor; D4 asks D1 for a first morning at ×0.6 with 8 actors; the HUD says "You are a bird. Tap a moth."

**Verb library:** tap, drag, hold, draw a curve, slide, toggle. Each is shown once per profile (`localStorage` in try/catch), replays on `?`, and is off in teacher mode. A keyboard user (first keydown) sees a key-cap animation; a live region reads the demo as text. Each later unit adds at most one new verb.

---

## 8. Accessibility (WCAG 2.2 AA)

- **Keyboard (2.1.1, 2.1.2, 2.4.7, 2.4.11):** a virtual cursor over canvas actors (roving tabindex on hidden DOM mirrors; arrows move, Enter or Space acts). `1`–`9` choose, `L` lens, `P` predict (arrows move the ghost, Enter commits), `G` graph, `M` mute, `?` help. The focus ring is `--text` with a `--ground` gap, not ochre (2.2:1 on paper); the strip never covers a focused actor.
- **Dragging (2.5.7), targets (2.5.8):** every drag has a tap alternative; targets are 44 px (AA minimum 24).
- **Timing (2.2.1):** every reflex unit has an untimed mode with an attention budget; camouflage hunts get the detection-rule path (D2 §13).
- **Colour (1.4.1, 1.4.3, 1.4.11):** section 2, plus CI `mono` and `deut` screenshots. **Text (1.4.4, 1.4.10, 1.4.12):** DOM labels survive 200% zoom, 320 px reflow and user text spacing. **Flashing (2.3.1):** nothing flashes more than twice a second.
- **Sims for screen readers (4.1.3):** one polite line per generation, at most one per 3 s ("Generation 12. Dark moths 62%, up 7. You ate 15 of 30."); key `D` reads a 60-word scene description; every chart has a data-table twin.
- **Calm mode** (OS `prefers-reduced-motion` or a setting, since managed school devices hide the OS switch): no shake or parallax; particles become static stamps; tweens become 120 ms crossfades; the ghost hand becomes a static arrow; pop-ups fade in place. Stars never depend on it.
- **Help and entry (3.2.6, 3.3.7):** help in the same place on every screen; class join by code.

---

## 9. The fifteen highest-impact fixes

Each line is *before* (evidence) → *after*, then the owner.

1. `#app{max-width:560px}` leaves 720 of 1280 px dead, cuts the title tree at x=920, pushes the Steward chart below the fold → one Stage, five layout classes (FCR-1).
2. Notes pauses play, covers 72%, and its Graphs tab is empty in ch18–29 and 10 chapters of I–VI → a live strip that never pauses (FCR-1; each v2 `graph` spec).
3. Bats 25 px, squirrels about 30, sperm 12, pollinators 8, brood dots 4, Commons dots 3, on 390 px → Hero ≥ 12%, Actor ≥ 7% of `u` (27 px), Crowd read as shape (each v2).
4. 31 of 43 sized labels in ch20–29 are 10–11 px ("tap: guard left", "her 20 eggs") → 12 px floor, 3 words, DOM sentences, paper pill (FCR-8).
5. Red/green carries meaning in Crossing Over L3, Many L2, Commons, Raffle chart, Clinic, Lock, Eq L12, Fancier chart and every pass/fail bar → section 2 inks plus a second channel: resistant ringed, wild hatched, cheaters spiked, pass filled versus fail hollow (FCR-6; each v2).
6. 39 themes, 39 grounds, 36 accents; Equilibrium on its own palette and fonts → 12 places plus Lab; global chrome and inks (FCR-6).
7. 48 text rows, then 109–143 words on an artless cream card, Mendel's first action in sentence four → Begin, live scene, ≤ 40 words, ghost hand in 3 s (FCR-9).
8. End cards of 200–260 words, chart below the fold, primary button clipped at 390×780 → TAKE ≤ 20 words, body ≤ 60, one chart, sticky actions (FCR-1).
9. Up to 3 stacked toasts, not de-duplicated, over plants, chromosomes and end cards → one 8-word whisper, never on an end card (FCR-4).
10. Locked stars about 1.7:1, disabled buttons about 1.9:1, both choices greyed in Hawks, Alarm, Lek → outline stars ≥ 4.5:1, a busy sweep, locked shows its reason (FCR-5).
11. About 300 `Snd.*` calls, no particle system; a correct answer is a toast and a number → three-tier juice, 200 ms pop and ripple, star count-up, a visual twin per sound, Calm (FCR-7).
12. VII–XI: empty Islands sea, the same finch at 5.2 and 14.8 mm, no flame, no web, Switches' target drawn like the result → arrivals as dots on an island, a drawn beak cracking seeds, a flame front, a node-link web, the mismatched segment lit on the fly, if D2 keeps them (D3).
13. I–VI: Fancier 24 identical pigeons (3.0), Landscape circles (3.5), Raffle (4.5), Hawks two crabs (5.0), Meadow pollinators → large variable crests, a height map with a rolling ball, the Drum, 150 crabs, pollinators ≥ 40 px (D1, D3).
14. Clipped ticks (".4 mm", "i5 cm"), 8–9 px ticks, Coalescent zigzags, Lock chart in a 60 px corner, Casino's blank frame → the six charts: padded axes, 12 px ticks, a drawn tree, full width, live from frame 1 (FCR-1).
15. Google Fonts `<link>` breaks offline play and leaks IPs; fallbacks are Georgia and Times → embedded WOFF2, metric-matched fallbacks, the type scale, Readable mode (FCR-3).

**Testing the look.** Screenshots at 390×780, 1024×768, 1280×720 with seed and clock fixed (R5b's capture scripts become the gallery), plus `mono` and `deut`; axe-core with zero serious violations; a lint for canvas text under 12 px and hit areas under 44 px; 60 fps with 2,000 sprites under 4× CPU throttle.

---

## 10. Compliance with D0

**How D4 removes the root causes.**
- **RC1 (the player calculates):** the graph never pauses and shows what the population did; no optimum appears during play.
- **RC2 (the player is the organism):** the player is drawn as a shadow, a hand or a dose, never a body that changes; the pinned individual stays fixed.
- **RC3 (text before play):** 40-word budget, ghost hand, one-slot whisper, no card before the first action.
- **RC4 (concept in the caption):** actor tiers, 12 px floor, diegesis ladder, six charts.
- **RC5 (no escalation):** T3 juice is reserved for level and boss; each level adds one visual variable.
- **RC6 (model, text, evidence disagree):** ×N chips, compression marks, designed versus real frames, expected versus realised.
- **RC7 (no spine):** one look, 12 places, anchor rigs, one palette, one chart grammar, shared widget looks.

**Section 3 is respected.** D4 adds no scientific claim. The triangle HUD marks dawn and dusk, so a good fit at dawn is never read as "nothing is happening". Mutation sparks are random in place and identical for harmful and neutral changes, never an arrow toward a need. Selection is a sieve, not a hand choosing. No creature wears a thought bubble. Mating system and recombination get no force colour, so nothing says they never move p. Contested ideas wear a pill and no star. Humans are pictograms.

**Answers to D0 §8 for D4.** (1) One look; worlds become places (1.3). (2) Recipe, cache, transform, with the ground baked off-thread (1.4). (3) A two-column grid at ≥ 1024 px with live charts from `notes().charts` (6). (4) Live graph (4.2), projector theme (2.3), colour-vision palette (2.1, 2.4), type scale (3), toasts (6), ghost hand (7).
