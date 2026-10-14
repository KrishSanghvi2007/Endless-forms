# R5b. Visual and UX review: Endless Forms sections VII–XI, Equilibrium, Tangled Bank

Reviewer role: art director and game-feel reviewer. Method: I opened every chapter in sections VII–XI of Endless Forms (21 chapters) at phone (390×780) and desktop (1280×800) and captured the intro card, the start state, three mid-play frames, a result card and the end card (about 300 PNGs). I did the same for Equilibrium (20 scenes: title, level map, 17 levels, Case Files; phone, desktop and phone-dark) and Tangled Bank (title, notebook, all six chapters, intro and play). I added scripted play for chapters the auto-player ends in under 60 steps (Archipelago, Islands, Fire, Food Web, Guest and others), opened the Notes drawer in seven chapters, and ran colour-vision-deficiency simulations on key frames.

All files are in `/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/visual_b/`. Filenames below are relative to that folder: `ef/` (Endless Forms), `ef2/` (scripted play and Notes), `hw/` (Equilibrium), `tb/` (Tangled Bank). The EF naming pattern is `ef/<id>_<phone|desktop>_<1intro|2start|3mid1-3|4card1|5end>.png`; contact sheets are `ef/sheet_<id>_phone.png` and `ef/dsheet_<id>_desktop.png`.

A capture caveat. About 50 frames from the first run showed a black canvas. These were capture artefacts: the canvas is cleared when the HUD resizes and my virtual clock had not yet redrawn it. In real time the same screens render fine. I re-captured with a retry-until-drawn step, and none of the black frames below are claimed as bugs.

## Verdict

The three games have good ideas about how to show evolution, but each shows them in a different way. Tangled Bank's hunt mode is the best-looking thing in the repo. Equilibrium is the most coherent teacher. Endless Forms sections VII–XI are the weakest visually: sparse canvases, abstract blobs, walls of small text under the scene, and an empty Graphs tab. The designer's "boring and clunky" verdict is mostly a visual verdict: in most of these chapters the screen shows a slider and a paragraph, and the concept lives in the paragraph.

## 1. Could the three games be one product?

Closer than they look, but not yet.

- **Endless Forms and Tangled Bank share a shell.** Dark cabinet green (`#152120`), paper cards (`#e8dfc9`), carmine and ochre accents, Fraunces headings, Spectral body, IBM Plex Mono for numbers, and the same "Field notebook" tree menu with stars (`ef/t0_menu.png`, `tb/tree_phone.png`). Tangled Bank is visually the same product at a higher art level.
- **Equilibrium is a different product.** It uses a warm paper ground (`#ece6d6`) in light mode, system fonts only, a floating rounded panel, and a blue/yellow allele code. Its title is set in the platform fallback serif; on Linux that is Times (`hw/title_desktop.png`). Only the magenta accent and the paper tone are shared.
- **Inside Endless Forms the chapters do not match each other.** Each chapter defines its own `theme` object, so the canvas changes identity per chapter: cream (Live Fast, Forager), pale blue-grey (Clinic, Lock, Crowd), near-black purple (Pathogen), black-green (River), parchment (Guest, Switches, Fire). The notebook and cards are consistent, but the play surface is not. A student moving from The Clinic to The Pathogen to The Guest sees three apps (compare `ef/sheet_clinic_phone.png`, `ef/sheet_virulence_phone.png`, `ef/sheet_guest_phone.png`).
- **No recurring character.** Equilibrium has the beetle that wears its genotype, and it carries meaning in all 17 levels. Endless Forms has no equivalent. A vole, a flea, a rabbit and a finch are each drawn once, in a different style.
- **Fonts are a deployment risk.** EF and TB load Fraunces, Spectral and Plex from Google Fonts (confirmed: the font faces are fetched at load). The README promises "no internet, no dependencies". Offline, the whole identity falls back to Georgia. Embed WOFF2 subsets.

To make one product: one token file (the notebook tokens plus Equilibrium's allele blue and yellow), one type system, one shell, and a rule that every chapter canvas uses the same illustration style (see section 8).

## 2. Cross-cutting findings

### Phone versus desktop

- **Endless Forms and Tangled Bank are a 560 px column on every screen** (`#app{max-width:560px}`). At 1280×800, 720 px is empty dark space and the play canvas is 560×635. Compare `ef/forager_desktop_3mid1.png` with `hw/l7_desktop.png`, which uses the full width: beetles left, triangle right, panel centred. The title tree is also cropped by the column edge at x=920 (`ef/t0_title_d.png`, `tb/title_desktop.png`).
- **Tangled Bank's Steward mode hides its answer on desktop.** In Streams of Aripo the scene is 340 px high, then three goal lines, buttons and toggles. The chart that shows whether the player's action worked starts at y≈730 and runs off the bottom (`tb/stew4_desktop.png`). On phone it is further down (`tb/stew4_phone.png`). The player acts above the fold and sees consequences below it.
- **Equilibrium holds up on phone.** The panel takes about 35–40% of the height; the beetles sit above and the chart below (`hw/pm0.png`). Weak points: the page-top subtitle is truncated ("Genotype, phenotype, dom…"), and on L8 the triangle overlaps the beetle field (`hw/l8_phone.png`).
- **Endless Forms phone layout is reasonable but spends the bottom third on small text.** The scene gets about 60%, and the HUD is two or three lines of 13 px grey text plus buttons.

### Typography and text density

- Intro cards average **143 words** (range 125–173; River 173, Ring 168, Sweep 163, Clock 162) before the player can touch anything. The cards also run "premise, how to play, goal, basis" in one block (`ef/clock_phone_1intro.png`).
- End cards carry a 110–140-word insight paragraph plus a chart plus two collapsed sections (`ef/river_phone_5end.png`).
- Of the 43 canvas `ink()` calls in ch20–ch29 that give a literal size, 31 are 10–11 px. These are the axis labels and legends ("solid: host locks, dashed: parasite keys", "immune system copes below here"). On a phone they are unreadable.
- Equilibrium keeps one idea per panel, about 35–60 words, 15.5 px, and the panel text changes as the player acts. This is the better pattern.

### Colour and accessibility

I ran deuteranopia and protanopia simulations (`cvd_clinic.png`, `cvd_lock.png`, `cvd_hw12.png`).

- **The Clinic, level 1:** susceptible = green, resistant = red. Under deutan simulation both become dark olive. The whole selection story (resistant cells taking over) disappears. Level 2 uses purple for one drug, which survives, but green/orange/crimson do not.
- **Lock and Key:** hosts A (red) and D (green) are one colour under deutan; the key buttons and the chart lines merge (`cvd_lock.png`).
- **Equilibrium L12 (five islands):** the green, crimson and dark-grey lines collapse into three similar dark lines (`cvd_hw12.png`). Elsewhere Equilibrium is safe. Blue and yellow are the best pair for deutan and protan viewers, and the allele letter is printed on every wing, so colour is never the only code (`hw/l2_desktop.png`).
- **End-card bars use green "passed" and red "not passed"** in every chapter (`ef/livefast_desktop_5end.png`).
- The River uses blue and orange for the two banks, which is the right choice.
- Equilibrium has light and dark modes and both work (`hw/dark_row.png`). EF and TB have a dark shell only, with light canvases inside many chapters.
- Tap targets are fine: EF buttons are 44 px minimum and HW 42 px.

### Animation, juice and feedback

- **Equilibrium has a purpose-built effects layer** ("only ones that carry meaning"): alleles fly from wing cases into jars, rings pulse, numbers float. This is the right idea.
- **Most Endless Forms chapters in VII–XI act with no visible consequence.**
  - Islands: after "Let species arrive" (frames at 0.7 s, 2.5 s, 6 s, `ef2/s_islands_phone.png`) the sea is still empty; only the readout changed.
  - Archipelago: beak depth is not drawn on the bird (5.2 mm and 14.8 mm give the same blob, `ef2/s_arch_phone.png`), and no seeds are cracked.
  - Fire: no flame or ash; "burnt" is a row of brown dashes (`ef2/s_fire_phone.png`).
  - Switches: in fly 4 of 4 ("Legs on the abdomen", 0 changes made) the target fly and your fly are drawn identically, although the text says they differ (`ef/switch_phone_3mid3.png`).
- **Toasts stack instead of replacing.** Sweep shows "Label all three panels first." three times (`ef/sweep_phone_3mid1.png`); Doubling shows "Some chromosomes are still unpaired." three times (`ef/double_phone_3mid1.png`).
- Sound exists in all three (WebAudio tones). I could not judge it from stills.

### Chart readability

- **The Notes drawer's Graphs tab is empty.** In all seven chapters I opened (Clinic, Forager, Crowd, Lock, River, Pathogen, Fruits) it reads "Graphs appear once there is some history", even after six turns (`ef2/s_notes2_graphs_phone.png`). The cause is in the source: `notes()` in ch18–ch29 returns `charts: []` everywhere. The Notes sheet also covers 72% of the screen, so chart and world could never be seen together anyway.
- **Charts that do work are the ones drawn on the canvas:**
  - Two Fruits: a race-index line with "two races" and "partial" thresholds (`ef/fruits_phone_3mid2.png`). This is the clearest chart in sections VII–XI.
  - The Pathogen: a fitness curve with a "you" marker, revealed after release.
  - The Clinic: log bacteria against an immune threshold. The line is thin and grey and the threshold label is about 9 px.
- **Lock and Key's chart is squeezed into the top-left 25% of the canvas** (`ef2/s_lock_phone.png`), roughly 60 px wide, with a huge empty gap beside it.
- Equilibrium's charts are cleaner (white plate, 2–3 lines, one caption), but small on phone (`hw/l9_phone.png`).

### Do the visuals carry the concept?

- **Yes, in Equilibrium:** a wing case is an allele; the jar fill is p and q; the area square is p²; the bar is p², 2pq, q²; the triangle dot moving off the curve is non-random mating. A student can pass without reading.
- **Yes, in the Tangled Bank hunt chapters:** you are the predator, and camouflage is visible on the bark.
- **In sections VII–XI, only a minority do.** The concept lives in the text for the Forager, Live Fast, Islands, Food Web, Guest, Tree Thinking and Archipelago.

### Onboarding

- **EF:** title, then the notebook of 48 chapters ("Start anywhere"), then a 143-word card, then play. There is no first-run hint layer, no highlighted control, and "Notes" is introduced only in grey card text.
- **HW:** title, then a level map where each level has one line of subtitle. Levels typically open with one or two sentences and one control ("tap a wing case"). There is also a Guide button. This is what onboarding should look like.
- **TB:** the intro card is shorter (about 70 words) and the first chapter is the gentlest.

## 3. Equilibrium (what I saw)

- **Title** (`hw/title_desktop.png`): the equation p² + 2pq + q² = 1 above three beetles is a perfect title screen. It states the whole game.
- **L2, allele jars** (`hw/l2_desktop.png`): the beetles fade and the jars fill with A and a tokens. The "A alleles" jar background reads as grey rather than blue, and the jars are tall and mostly empty at small counts.
- **L3** shows 20 A against 80 a (`hw/l3_desktop.png`): the dominant allele is the rare one, visible in the jars at a glance.
- **L5 and L6:** the 36% area square and the 36/48/16 bar (`hw/pm0.png`). Excellent.
- **De Finetti triangle** (L7, L8, L11, L14, L15, L17; `hw/l7_desktop.png`): one shared map, with a green HW curve and a dot. The labels collide in L7 ("your guess" overlaps the dot and "HW curve") and the triangle is small on phone. The apex is labelled "all Aa", which is non-standard but readable. The dot's dashed trail in L15 is a good way to show change.
- **L9 lens** (`hw/l9_desktop.png`): the Phenotype/Genotype toggle circles the hidden carriers. This is the best interaction in the portfolio for showing a hidden concept.
- **L12** (five islands) has the best drift chart, apart from the colour problem.
- **Weak spots:** L10 (mutation) is a flat blue line by design, which is honest but dull. The five-island lines (L12) and the small phone triangle are covered above.

## 4. Tangled Bank (what I saw)

- **Hunt chapters** (`tb/hunt1_phone.png`, `tb/hunt3_phone.png`): procedurally textured bark and leaf litter, moths and butterflies with real colour logic (black-and-red bitterwings, cream palewings). The progress meter uses a tick for the goal. This is the quality bar for the whole project.
- **Steward chapters** (`tb/pm1.png`): a top-down pond scene (Aripo), mainland and island (Slow Island), and a grid of ponds (Commons). The scenes are attractive, but each is followed by 3–4 lines of goals, then toggles, then a chart: the "text under the picture" layout again.
- **Notebook** (`tb/tree_phone.png`): the best menu in the repo, with the Darwin tree line, two groups ("You are the predator", "You are the environment") and stars.
- Title tree is cropped at the right on desktop (see section 2).

## 5. Per-chapter notes, sections VII–XI (Endless Forms)

For each: what the screen shows, then the fix.

**VII. Lives and Behaviour**
- **28 Live Fast** (`ef/sheet_livefast_phone.png`). A brown blob on a gradient; "foxes" are three orange fish shapes (ellipse plus triangle tail). Level 3 is a green field of dots ("every place taken"). *Fix:* draw a vole and recognisable foxes; show the life as a row of years with offspring dots accumulating; show the survive/breed trade-off as a two-bar energy split.
- **29 The Forager** (`ef/forager_desktop_3mid1.png`). The nest-pole text is crossed by the trunk ("nest: 0 delivered"); the patch is a low-contrast green disc on green. *Fix:* draw the marginal-value curve live with a tangent; outline the patch; put the delivered count on the nest as chicks fed.
- **30 The Crowd** (`ef/sheet_crowd_phone.png`). Olive fish on blue, with a clear orange "you". The best-looking VII chapter. *Fix:* overlay the ideal-free target (bar per feeder) so the crowd's settling is checkable; make big fish visibly big.
- **31 Shape-shifters** (`ef/sheet_plastic_phone.png`). A pale flea on teal. A predator is a small dark oval and the helmet is a ghost outline. *Fix:* show helmeted against plain fleas side by side, and make the predator a dramatic shadow.

**VIII. Coevolution and Disease**
- **32 Lock and Key** (`ef2/s_lock_phone.png`). Hosts are neat two-ring tokens, but the chart is in the top-left corner and the A/D colours collide for colour-blind viewers. *Fix:* chart across the full width; add letter or pattern coding; show the parasite key physically fitting the lock.
- **33 The Clinic** (`ef/sheet_clinic_phone.png`). The petri dish is a strong centrepiece. Red/green and a 9 px threshold label are the faults. *Fix:* resistant cells blue with a ring, a larger log chart, and the dose drawn as a fill in the dish.
- **34 The Pathogen** (`ef2/s_virulence_phone.png`). A dark meadow with rabbits; a fitness curve appears after release with a "you" tick. A good screen. *Fix:* label the rabbit colours (blue and red are never explained on canvas); show deaths as fading rabbits.
- **35 The Guest** (`ef2/s_guest_phone.png`). Nodules as beige circles on a vertical root; oxygen dots and green bars. Abstract and text-heavy. *Fix:* draw a soybean root with visible nodule glow; make cheaters visibly shrivel.

**IX. Genomes and Development**
- **36 Switches** (`ef/sheet_switch_phone.png`). A gene-by-segment grid with two small flies above. The grid is clear. The flies are about 100 px wide and the target is not visibly different from a wrong result. *Fix:* enlarge the flies, animate the segment change on "Hatch", and highlight the mismatched segment on the fly itself.
- **37 Copy and Paste** (`ef/sheet_copy_phone.png`). Level 1 is four cross buttons and an "Answer" button; the canvas holds six tiny icons. Level 2 (gene blocks "eye", "wing", "coding") is clean. *Fix:* give level 1 a visible cross (parent flies, egg tray, offspring).
- **38 The Sweep** (`ef/sheet_sweep_phone.png`). The haplotype barcode panels are honest but dense, and the toasts stack. *Fix:* colour the haplotypes by lineage, with the sweep valley as a highlighted band.
- **39 The Clock** (`ef/sheet_clock_phone.png`). Coloured DNA letters over a timeline; the "you" and "fossil" markers overlap at the start. *Fix:* use shapes as well as colours for bases, and show a counted-difference bar for the pair.

**X. Species**
- **40 The River** (`ef/sheet_river_phone.png`). The map is good: blue river, blue and orange dots for the two banks. The lower 45% of the canvas is near-empty dark green with two tiny bars. Level 2's frog and call waveform is charming. *Fix:* fill the lower half with a mutation-by-mutation tally of each bank.
- **41 Two Fruits** (`ef/sheet_fruits_phone.png`). Two trees with gold and dark flies, and a clean race-index chart. The best chapter in this block.
- **42 The Ring** (`ef/sheet_ring_phone.png`). Twelve salamander icons in a circle around a flat "valley" disc. Clear but static. *Fix:* morph the salamander's colour or pattern gradually around the ring.
- **43 Doubling** (`ef/sheet_double_phone.png`). Level 2 (chromosome rods, dashed pairing lines) works; level 1 is a grid of yellow flowers. *Fix:* draw the meadow with visible tetraploid clumps.

**XI. Deep Time and Ecology**
- **44 The Archipelago** (`ef2/s_arch_phone.png`). Clean curves, but the finch is the same blob at every beak depth. *Fix:* draw the beak, and show seeds being cracked or failing.
- **45 Tree Thinking** (`ef/sheet_tree_phone.png`). A clean cladogram in one green line with plain text labels and no animals. *Fix:* silhouettes at the tips, highlighted clades as the question is asked, and a draggable node.
- **46 The Food Web** (`ef2/s_web_a_phone.png`, `ef2/s_web_b_phone.png`). No web is drawn. Fifteen species are unlabelled coloured blobs on brown rock; removal is shown only as a change in dot colours. *Fix:* a node-and-link web, with removal as a collapsing cascade.
- **47 Islands** (`ef2/s_islands_phone.png`). Empty pale-blue sea, a green strip and one small dot island; changing distance moves it about 25 px. The arrival-and-extinction crossing chart is the only content. *Fix:* animate colonists arriving as dots against extinctions leaving, with the island scaled by area.
- **48 After the Fire** (`ef2/s_fire_phone.png`). The tree grid and diversity curve work. *Fix:* draw flames and ash, and label grass, shrub and oak with silhouettes.

## 6. Ranking by visual quality

1. Tangled Bank hunt chapters (Lichen Wood, Black Country, Bitter Wings)
2. Equilibrium, whole game (title, jars, area model, triangle, lens)
3. Tangled Bank Steward chapters and notebook
4. Two Fruits
5. The Pathogen
6. The Clinic
7. The Crowd
8. After the Fire
9. Lock and Key
10. Switches
11. The Archipelago
12. The Clock
13. The Forager
14. Doubling
15. Copy and Paste
16. The River
17. The Ring
18. Shape-shifters
19. The Sweep
20. Tree Thinking
21. The Guest
22. Live Fast
23. Islands
24. The Food Web

## 7. What each game should borrow

**Endless Forms should adopt from Equilibrium:**
1. One recurring visual object that carries the concept.
2. Visual proof before text: the picture changes when the concept changes.
3. A lens toggle for hidden state (phenotype/genotype maps to "what the player sees / what is really happening").
4. One shared diagram reused across chapters (the triangle's equivalent, such as a fitness-landscape or time-series panel).
5. Say, do, say pacing: one idea per panel, 35–60 words.
6. Effects only where they carry meaning.
7. Redundant colour coding (letters, shapes, outlines).
8. A full-width desktop layout.
9. System-font fallback that does not look broken.

**Equilibrium should adopt from Endless Forms and Tangled Bank:**
1. The painterly texture and illustration level of the hunt chapters.
2. Fraunces-class typography for headings.
3. The notebook tree with star progress.
4. Direct manipulation (tap the prey) in place of buttons, where it fits.

## 8. Priority fixes

1. **Fix the layout first.** Drop the 560 px cap and give desktop a two-column layout (canvas left, controls and chart right). Move TB Steward charts above the fold.
2. **Put the concept on the canvas in every VII–XI chapter.** Draw the beak, the web, the flame, the arrival of species and the fox. Treat Islands, Food Web, Live Fast and Archipelago first.
3. **Fill the Graphs tab** (`charts: []` in ch18–ch29), or remove it.
4. **Replace red/green** in Clinic, Lock and Key, HW L12 and the end-card bars. Add letter or pattern coding.
5. **Cut intro cards to 60 words** and move "how to play" into first-step hints in the HUD, as Equilibrium does.
6. **Raise canvas labels to at least 12 px** (31 of 43 are 10–11 px).
7. **Dedupe toasts** (Sweep, Doubling).
8. **Embed the fonts** and make the shell tokens shared across all three games.
9. **Adopt one illustration style** for sections VII–XI, in the register of Tangled Bank's hunt, and a recurring set of organisms across chapters.
10. **Add a visual regression harness.** The capture scripts in `visual_b/` (`cap_ef.py`, `cap_hw.py`, `cap_tb.py`, `play2.py`) can be turned into a per-chapter gallery that runs on every build.
