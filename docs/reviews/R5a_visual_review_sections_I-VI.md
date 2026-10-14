# R5a. Visual and UI/UX review: Endless Forms, sections I–VI (chapters 1–27)

Reviewer role: art director and game-feel reviewer. Method: I opened `games/endless-forms/Endless_Forms_v1.html` in headless Chromium at phone (390×780) and desktop (1280×800), with a virtual clock, and captured the title, the notebook, and for all 27 chapters in sections I–VI an intro card, a mid-play frame, a second mid frame, the Notes graph tab and the end card. I looked at the images, plus deuteranopia simulations of the key frames.

## 0. What I captured, and caveats

Screenshots are in `/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/visual_a/` (scratch, not committed).

- Naming: `phone_<id>_1intro|2mid|3mid2|4notes|5end.png` and `desk_<id>_…`; title and notebook are `*_00_*`. Five-frame phone contact sheets are `sheets/phone_<id>.png`.
- The first pass used a random-tapping "monkey" (`capture.py`, `stepper.js`): it reaches every end card but plays badly, so some mid frames are empty states and most end cards say "0 of N". Scripted correct play (`extra.py`, `extra2.py`) fills the gaps: files `*_x_*` (Mendel, Crossing Over, Fancier, Many Become One, Commons, Census, Coalescent). The Cross, Fancier and desktop Mendel end cards come from these runs.
- Colour-blind checks are Machado et al. 2009 deuteranopia, severity 1.0: `sheets/cvd_*.png`. Contrast ratios are computed from the CSS tokens in `source/shell.html`; canvas-text sizes are my visual estimates.
- I judged stills plus the source. The juice section rests on code and sound/tween counts, not felt timing.

## 1. Verdict in one paragraph

The shell has a real identity (field notebook: dark teal cabinet, cream paper, carmine and ochre, Fraunces/Spectral). The best three or four games are beautiful because the picture is the game. Roughly half the games are a small icon on an empty field, with the information carried by 11-px captions and numbers. Several chapters carry a key distinction in red/green or orange/green, which vanishes for about 1 in 12 men. On desktop the game is a 560-px phone column in a 1280-px window. A favourite chapter (The Black Country) has a visible text bug. The designer's "clunky, not visually interesting" verdict is accurate for the bottom half of the ranking in section 11 and wrong for the top.

## 2. Visual identity and coherence

**What works.**
- The title screen (`phone_00_title.png`) is the strongest single frame: heavy Fraunces, a generated tree with ochre fruit, a Darwin epigraph. The tone lands in two seconds.
- The notebook (`phone_00_home_progress.png`) is a good metaphor: a phylogeny spine, hollow dot per unplayed chapter, filled ochre dot per played one.
- Procedural painting is the house style at its best: lichen bark (`phone_lichen_2mid.png`), leaf litter (`phone_bitter_2mid.png`), sooted bark (`phone_soot_2mid.png`), the lit sea (`phone_gametes_2mid.png`), the alpine meadow (`phone_meadow_2mid.png`).
- Per-chapter theming (cream for Mendel, black-green for Casino, deep teal for Jaws, plum for Brood) gives each chapter a "world" while buttons, Notes pill and card stay constant. Right architecture.

**What does not.**
- Quality swings from painted to wireframe. Compare Bitter Wings with The Landscape (`phone_landscape_2mid.png`: grey circles and hairlines) or The Scribe (`phone_scribe_2mid.png`). Moving from chapter 13 to 14 feels like changing apps.
- There is no shared sprite scale. Entities that matter are 20–30 px on a 390-px canvas: Hawks crabs, Blood Debts bats, Alarm Call squirrels, Raffle sperm, Meadow pollinators, Lek grouse. The painted backdrops are 100% of the canvas, the actors are 5%.
- Every intro is the same cream paper card with no art (`phone_*_1intro.png`): all 48 chapters look identical when a player decides to start.

## 3. Typography and text density

- Type pairing is good: Fraunces for titles, Spectral for body, IBM Plex Mono for numbers. The mono top-right "level 1 of 3" is neat but small, and it forces title truncation: "Left Jaw, Right …" (`phone_jaws_2mid.png`), "The Selfish Spin…" (`phone_spindle_2mid.png`).
- Fonts load from a Google Fonts `<link>` (`source/shell.html` line 10), so the single file is not self-contained; a blocked network falls back to Georgia (not rendered offline by me).
- Density is the main problem. I counted the intro text per chapter: median 109 words, range 64 (Lichen) to 130 (Meadow), as three paragraphs plus a goal plus a hint, on a 390-px screen (`phone_meadow_1intro.png` fills the whole card). The "real thing" notes run 52–181 words and "the numbers behind it" 43–233 (Hawks). Mendel's first action (tap a plant, then another) is buried in sentence four.
- End cards are worse. `phone_spindle_5end.png`, `phone_hawks_5end.png`, `phone_sieve_5end.png` and `phone_raffle_5end.png` are 200–260 words of insight, with the chart below the fold. On phone the primary button ("Next: …") is clipped by the bottom edge in `phone_mendel_5end.png`, `phone_scribe_5end.png` and `phone_sex_5end.png`; you have to scroll to find the way forward.
- Canvas micro-type is 8–11 px: "template strand" (Scribe), "your flowers are the large ones" (Meadow), "her 20 eggs" and "no rival sperm" (Raffle), the 8-px mono fitness numbers inside Landscape's circles, "tap: guard left" (Jaws). Several are 60%-alpha grey on a mid-tone.
- **Bug (text):** The Black Country's intro reads "How to play. undefined History is compressed…" (`phone_soot_1intro.png`). Cause: `ch99.js:187` does `CH_SOOT.intro.how += …`, but the chapter's intro (`hunt.js:331`) uses `part`, not `how`. `introHTML` prints `i.how || i.part`, so the new sentence displaces the real how-to-play paragraph and is prefixed with "undefined". A favourite chapter is losing its instructions.
- **Bug (text):** the Lichen Wood end card prints "about -100% of what you selected was passed on" (`desk_lichen_5end.png`) when the response is negative. A guard is missing; students will see nonsense in a failed run.

## 4. Colour, contrast and colour-blind safety

Computed from the CSS tokens: body text `--paper` on `--cab` is 12.5:1, `--paper-dim` is 6.1:1, ochre on cabinet is 6.6:1, `--ink2` on the card is 6.0:1, white on carmine buttons is 6.1:1. The shell passes.

Where it fails:
- **Locked stars.** Unearned stars on the notebook are ochre at 30% opacity: about 1.7:1 (`phone_00_home_fresh.png`). A new player's first view is 144 faint stars. On the end card, empty stars are 18%-alpha ink on paper: about 1.4:1.
- **Disabled primary buttons** are 38% opacity: about 1.9:1. In Hawks, Alarm Call and Lek both choice buttons are greyed during animation, so the screen looks broken (`phone_hawks_2mid.png`, `phone_alarm_2mid.png`, `phone_lek_2mid.png`).
- **Red/green and orange/green carry the concept** (deuteranopia simulation, `sheets/cvd_montage1.png`):
  - Crossing Over level 3: orange "wild" and green "crop" chromosome segments collapse to two olives (`sheets/cvd_cross3.png`). The level is "find the plant whose crossover removed D", read by colour only.
  - Many Become One level 2: red cheater cells and green healthy cells become one olive blob (`sheets/cvd_many2.png`).
  - The Commons: green producers and red cheaters become one population, and the green "between groups" / red "within groups" Price bars turn into two olive bars (`sheets/cvd_commons.png`).
  - The Raffle end chart: red "best for you" against green "best for her" (`phone_raffle_5end.png`).
  - The Castaways colour pies use five hues (red, orange, yellow, teal, blue), which are confusable (`phone_castaways_2mid.png`).
  - Fancier end chart: brown "tameness" against green "patchy coat" (`phone_x_fancier_5end.png`).
- **Alarm Call** encodes relatedness as ochre, striped or grey collars: 2-px rings on 30-px squirrels (`phone_alarm_2mid.png`, `sheets/zoom1.png`). Hard to read even with normal vision on a phone.
- Survives well: Bitter Wings (cream versus black-and-red; luminance carries it, `sheets/cvd_bitter.png`), Lichen and Black Country (luminance), Casino (red/blue beads), Census (dark blue / half-tone / cream with dashed expectation).

Rule for the combined game: never use hue alone for a categorical distinction that matters. Use the Okabe–Ito palette plus a second channel (shape, pattern, luminance, label), and build a one-switch CVD preview into the dev build.

## 5. Layout: phone versus desktop

- **Phone is the native target and mostly good.** HUD and buttons sit in the thumb zone, buttons are 42–44 px, and the contextual status line (`phone_cross_2mid.png`: "Tap a gap between two genes to place a crossover…") is excellent just-in-time instruction.
- **Desktop is the same phone column.** `#app{max-width:560px}` leaves about 720 px (56%) of a 1280-px window as dark dead space (`desk_00_home_fresh.png`, `desk_lichen_2mid.png`, `desk_hawks_2mid.png`). Sprites are no bigger than on a phone.
- The desktop title tree is cut by a hard vertical edge at the column boundary (right side at x≈920, `desk_00_title.png`). It looks like a rendering bug; the phone crop on both sides reads as intentional.
- **Notes pauses the game and hides the best teaching material.** The Graphs tab is the clearest explanatory device in the game (`phone_lichen_4notes.png`). But it sits in a bottom sheet that pauses play, and in 10 chapters I checked (Mendel, Scribe, Crossing Over, Landscape, Hawks, Blood Debts, Spindle, Meadow, Alarm Call, Nest) it just says "Graphs appear once there is some history" (`phone_mendel_4notes.png`, `phone_hawks_4notes.png`). On desktop the free 700 px should hold a live graph panel beside the canvas.
- Empty canvas: Casino shows a blank 260-px chart frame before the first run (`phone_casino_2mid.png`); Mendel's seed tray is a 220-px empty box (`phone_mendel_2mid.png`); Commons leaves its lower half empty (`phone_commons_2mid.png`).
- **Toasts** (`core.js:107`) cap at three, are not de-duplicated, last 3.2 s and sit at the top of the playfield. They cover Mendel's plants (`phone_x_mendel_L1_seeds.png`) and Crossing Over's chromosomes (`phone_x_cross_L1_done.png`), and render on top of end cards: "Label all three trees first." three times over the Coalescent title (`phone_coal_5end.png`), "Dee/Fay/Gus starved." over Blood Debts (`phone_bats_5end.png`), likewise Castaways and Census. The monkey exaggerates the duplicates; the overlap is structural.

## 6. Animation, juice and feedback

- Feedback is mainly **sound and text**: about 300 `Snd.*` calls (click 81, star 70, miss 52, chime 41), all synthesised in WebAudio, versus no particle system I could find (the word never appears), 8 "shake" and 2 "burst" mentions, and some tween helpers. In a classroom with sound off, a correct answer is a toast and a number change.
- Missing: the moment of payoff. When a moth is eaten, a mimic survives or a crossover lands, nothing flashes or settles in the stills I saw. A scale-pop, a ring ripple on the tapped target and a star count-up would help.
- `prefers-reduced-motion` is handled once in the CSS; give every new effect a reduced-motion path.
- Input is pointer events on a single canvas. I did not test keyboard or screen-reader play; the HUD is DOM, the games are not. A university-adopted tool needs a plan for this.

## 7. Chart readability

**Best:**
- The Census: sampled snails as dots coloured by genotype, observed bars against a dashed Hardy–Weinberg ghost (`phone_x_census_L1_sampled.png`). Show expectation as a ghost of the same shape: the right device.
- Two Sizes: the sea's cell-size distribution going bimodal, "you" marked (`phone_gametes_2mid.png`).
- Why Sex?: ratchet histogram, bars turning sage to rust as load grows (`phone_sex_3mid2.png`).
- The Commons: Price bars, between-group positive, within-group negative (`phone_x_commons_L1_run1.png`), apart from red/green.
- The Sieve: a dot-histogram cut by a drawn survival curve (`phone_sieve_2mid.png`).

**Worst:**
- Clipped axis labels: ".4 mm" and "7 mm" in `phone_sieve_4notes.png`; "i5 cm" and ".0 cm" in `phone_meadow_5end.png`.
- 8–9 px mono ticks and 12-px legends on paper (all `*_4notes.png`, many `*_5end.png`).
- The Coalescent is a tangle of 1-px zig-zags (`phone_coal_2mid.png`, `phone_x_coal_L3_trees.png`): lineages merge, but not when or why; level 3's three trees are three arbitrary hues.
- Many end-card charts sit below the fold, so the picture that justifies the 200-word insight is never scrolled to.

## 8. Do the visuals carry the concept, or decorate?

**They carry it:** Lichen, Black Country and Bitter Wings (the game is camouflage and mimicry; variation, inheritance and differential survival are in one frame); Two Sizes, Why Sex?, Census and Casino (the distribution or the beads are the model); Selfish Spindle level 2 (a real spindle with fibres, "egg side (kept)" and "polar body side (discarded)", `phone_spindle_3mid2.png`, the best diagram in I–VI); Crossing Over levels 1–2 (chromosomes, stars on good alleles, a heatmap table, `phone_x_cross_L1_p1_best.png`, `phone_x_cross_L2_partial.png`); Left Jaw (gold flank guard, `phone_jaws_2mid.png`, though the predator's bent jaw is invisible at that size).

**They decorate (a caption or number does the work):**
- **The Fancier.** 24 near-identical grey pigeons, crests differing by a 2–3-px arc; "crest 52" is the information (`phone_fancier_2mid.png`, `phone_x_fancier_L1_selected.png`). Level 2's foxes are grey blobs with 4-px ears (`phone_x_fancier_L2_gen4.png`). The idea, that selecting one trait drags visible others, cannot be seen.
- **The Landscape.** A lattice of circles with 8-px numbers: no height, peak or valley (`phone_landscape_2mid.png`).
- **The Meadow.** Lovely flowers, but pollinators are 8-px green dashes (`phone_meadow_3mid2.png`); who visits and carries pollen where cannot be read.
- **The Raffle.** Concentric rings and 12-px sperm: not a race or a raffle, and the palest screen in the game (`phone_raffle_2mid.png`).
- **Hawks and Doves.** Charming 60-px crabs on a 560-px beach (`desk_hawks_2mid.png`); the ESS, the point, is never seen.
- **Fisher's Brood.** 4-px dots above ten 10-px egg slots (`phone_brood_2mid.png`); the population sex ratio is a text line.
- **Mendel.** The evidence is ten identical purple flowers in a tray (`phone_x_mendel_L1_seeds.png`).

## 9. Onboarding clarity

- The path is title → "Open the notebook" → 48 text rows → intro card. No thumbnails, no "start here", no time cue; the only wayfinding is 15-px ochre italic section names (`phone_00_home_scrolled.png`). "Start anywhere" gives a first-time undergraduate no entry point.
- Each intro is ~110 words with no 3-second demonstration of the mechanic. Monument Valley and Mini Metro teach with the first level itself.
- Good: the HUD status line changes with state and says what to do next, and Crossing Over's toasts ("This sex cell carries 3. You can do better than 3.") give feedback with a numeric target.
- Weak first-frame affordances: Fancier (instruction in 14-px dim grey, `phone_fancier_2mid.png`), Hawks (both buttons greyed on entry), Mendel (nothing hints that plants are tappable).

## 10. Per-chapter notes (best and worst, with specific fixes)

- **1. Mendel's Garden.** Best: Clean seed tray; chart in end card. Worst: Tiny plants, empty tray, toast covers plants, L2 chips clipped (`phone_x_mendel_L2_marked.png`). Fix: Plants at 2× size; seeds fill the tray as they grow; move toasts below the board.
- **2. The Scribe.** Best: Base tiles colour-coded, pair buttons match. Worst: Strand in a 100-px band, 8-px labels, void above. Fix: Zoom to a double helix filling the canvas; ribosome/protein result animated.
- **3. Crossing Over.** Best: L1–L2 diagrams excellent. Worst: L3 orange/green fails CVD; thin R/D ticks. Fix: Wild = hatched dark blue, crop = plain light; label R and D with flags.
- **4. The Census.** Best: Dots + dashed expectation; best chart in the set. Worst: Level 2 region labels overlap dots ("north"). Fix: Keep; put labels in a margin strip.
- **5. The Coalescent.** Best: Prediction line against truth. Worst: Tangled zig-zags; hues arbitrary. Fix: Draw a real tree (branch lengths, merge nodes) with a time axis; one hue.
- **6. Drift Casino.** Best: Beads in a jar are instantly readable. Worst: Half the screen blank before the first run. Fix: Draw the trace live from the start; one-row bet picker.
- **7. The Castaways.** Best: Founder map and island pies; wolf level atmospheric. Worst: Birds form a visible rectangular ring; 5-hue pies. Fix: Scatter birds naturally; use patterned slices.
- **8. Why Sex?.** Best: Ratchet histogram colour shift. Worst: Pond creatures indistinct; disabled buttons at 38%. Fix: Make mutations visible as spots on each organism; keep the histogram.
- **9. The Lichen Wood.** Best: Best texture in the game; concept in one frame. Worst: -100% text, moth shapes are generic ovals. Fix: Wing patterns, a bird-beak tap effect, a "heard crunch" ripple.
- **10. The Black Country.** Best: Bark transition from pale to soot is the payoff. Worst: "undefined" bug; loses how-to-play. Fix: Fix `ch99.js:187`; add a smoke wash during soot onset.
- **11. The Fancier.** Best: Warm paper palette. Worst: Pigeons identical; foxes blobs. Fix: Draw crest and ear size big and variable; hide the numbers until tapped.
- **12. The Sieve.** Best: Dot-histogram, drawn curve. Worst: Axis clipped; long end card. Fix: Fix axis padding; end card to one chart + one sentence.
- **13. Bitter Wings.** Best: Best overall; CVD-safe. Worst: Nothing shows that the bird is learning. Fix: A wing-pattern "memory" icon that strengthens with each bitter mouthful; wing-flap animation.
- **14. The Landscape.** Best: The lattice logic is correct. Worst: Not a landscape; 8-px numbers. Fix: Render a real height-map with contours; the ball rolls.
- **15. Left Jaw, Right Jaw.** Best: Fish and flank guard. Worst: Predator tiny; title truncated. Fix: Scale predator ×2, bend its jaw visibly.
- **16. Hawks and Doves.** Best: Crab sprites charming. Worst: Tiny crabs on empty beach; both buttons greyed. Fix: Fill the beach with the population, hawks red, doves grey; animate the fight.
- **17. Blood Debts.** Best: Dark cave mood. Worst: 25-px bats, 11-px names, toast stack. Fix: Bigger bats, a visible blood-reserve bar, an arrow when sharing.
- **18. Fisher's Brood.** Best: Warm plum theme. Worst: 4-px dots; text carries sex ratio. Fix: Draw the population as a stacked row of icons.
- **19. Two Sizes.** Best: Sea histogram, light rays. Worst: "you" marker thin; small caption. Fix: Larger marker; keep everything else.
- **20. The Lek.** Best: Sunset palette, charming grouse. Worst: Tufts blur into birds; red mono caption on beige. Fix: Remove tufts under text; use dark captions.
- **21. The Raffle.** Best: Concept (tickets) is neat. Worst: Palest screen, tiny sperm, 3-colour end chart. Fix: Draw a literal raffle drum with coloured tickets; end chart CVD-safe.
- **22. The Selfish Spindle.** Best: Level 2 spindle: best diagram. Worst: L1 mice dim on dark; truncated title. Fix: Lighten the mice; give the bar chart a header.
- **23. The Meadow.** Best: Painted meadow. Worst: Pollinators are 8-px dashes; end chart clipped. Fix: Bees, birds and moths ≥40 px with pollen trails.
- **24. Alarm Call.** Best: Warm savannah; clear status. Worst: Squirrels read as small birds or seals; 2-px collars. Fix: Use large stripe patterns on the body and a ring of relatedness numbers.
- **25. The Nest.** Best: Eggs and chicks readable. Worst: Plain background; toast over scene. Fix: Add reeds, light and food-drop animation.
- **26. The Commons.** Best: Price bars. Worst: 3-px dots; red/green. Fix: Larger cells with shape (square versus circle) plus colour.
- **27. Many Become One.** Best: Yeast settling is appealing. Worst: Cells tiny in a 340-px dish; red/green. Fix: Larger cells, cheaters get spikes.

## 11. Ranking by visual quality (score out of 10)

1. Bitter Wings, 9.0
2. The Lichen Wood, 8.5
3. The Black Country, 8.5 (before the text bug is fixed)
4. Two Sizes, 8.0
5. The Selfish Spindle, 7.5
6. The Census, 7.5
7. Why Sex?, 7.0
8. The Meadow, 7.0
9. Drift Casino, 7.0
10. Left Jaw, Right Jaw, 6.5
11. Crossing Over, 6.5
12. The Sieve, 6.5
13. The Castaways, 6.0
14. Blood Debts, 6.0
15. The Nest, 5.5
16. Mendel's Garden, 5.5
17. Alarm Call, 5.5
18. The Lek, 5.5
19. Hawks and Doves, 5.0
20. Many Become One, 5.0
21. The Commons, 4.5
22. The Raffle, 4.5
23. Fisher's Brood, 4.0
24. The Coalescent, 4.0
25. The Landscape, 3.5
26. The Scribe, 3.5
27. The Fancier, 3.0

Against the designer's favourites: Lichen, Black Country and Bitter Wings are the top three, so those are earned. Left Jaw (10th), Alarm Call (17th), Hawks and Doves (19th) and The Raffle (22nd) are conceptually loved but visually under-built: the best candidates for an art pass, because the idea is already right.

## 12. What to carry into the combined game (priority order)

1. **A shared design system.** One CVD-safe palette (Okabe–Ito plus luminance steps), a minimum-size rule (any entity the player must read is at least 7% of canvas width and 44 px for touch), an 11-px text floor including canvas text.
2. **Replace intro paragraphs with a 3-second demonstration.** At most 40 words plus an animated ghost hand; "the real thing" and "the numbers" go behind a "Why?" chip.
3. **A live graph panel.** Persistent on desktop; a pull-up tab on phone that does not pause. Put the distribution, expectation ghost and trace in the main view (the Census pattern).
4. **A desktop layout that uses the width.** Canvas fills the window, graph beside it, teacher controls (seed, speed, reset, show answer) in a third strip.
5. **Fix the cheap bugs first:** Soot "undefined" (`ch99.js:187`), the -100% sentence, toast de-duplication and placement, a primary button that stays on screen on long end cards, clip-proof chart axes, and never disabling both choice buttons during animation.
6. **Payoff juice:** a 200-ms pop plus a ripple per correct event, a star count-up, a visible reason for every locked state; sound optional and always mirrored visually.
7. **Rebuild the five visuals that do not carry their concept** (Fancier, Landscape, Raffle, Hawks, Meadow pollinators). A Three.js height-map for the Landscape is the one justified use of 3D; everything else stays flat and painterly, as the best chapters already are.
8. **Technology.** Canvas2D procedural painting is the asset. For the combined app, add a retained-mode scene layer (for example PixiJS) for particles, tweens and sprite scaling, and bundle fonts and assets so it works offline on a school network.

