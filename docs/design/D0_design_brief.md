# D0. Design brief: from critique to design

*Coordinator A (critique-to-design liaison). Binding on D1 (favourites redesign), D2 (structure and roadmap), D3 (new games) and D4 (art direction and UX).*

**Sources and precedence.** Condensed from `docs/reviews/` (R1–R8, R7 fact-checks), `docs/ORIGINAL_README.md`, `docs/design-history/03` and `docs/changes/science_sweep_G1–G4.md`.
- R7 beats the review it checks. A sweep log beats R7 only with a primary source (so far one case, G3 on Visser 1998).
- No sweep logs yet for sections VIII–XI, `ch99.js`, Equilibrium or Tangled Bank: re-check `docs/changes/` before finalising.

**Every design document must contain:**
1. A table showing how it removes RC1–RC7.
2. A statement that it respects section 3.
3. Answers to your questions in section 8.

---

## 1. Verdict and root causes

**Verdict.** The reviews confirm the designer's judgement and say exactly where it holds. The models are mostly correct (R7 confirmed 71 of 103 R1 claims; every R2 number reproduced), but in most chapters the player stands outside them: read 110–140 words, move a slider or pick one of three options, read a number. Half the chapters are a small icon on an empty field with the concept in 8–11 px captions (R5a), and of 101 undergraduate concepts the games cover 15 well, 37 thinly, 24 with problems and miss 25 (R8). The favourites work because the player's own behaviour is the selective force and the result shows the next morning; they are also the best-looking (Bitter Wings 9.0, Lichen and Black Country 8.5), though Jaws (6.5), Alarm Call (5.5), Hawks (5.0) and the Raffle (4.5) are visually under-built.

| # | Root cause | Evidence |
|---|---|---|
| RC1 | **The player calculates; the population does not respond.** Optimisation worksheets with corner solutions. | "Set a slider, earn % of best" appears 13 times (R8). Brood: 10,10,10,0,0,0 wins in 198 of 200 runs. Two Sizes: holding "tiny" gives 49%. Live Fast foxes: 100% effort at every age. Nest eggs are free. Hawks' `evolve()` and Lock L1 ignore the player's choice. Notes print the optimum in at least 12 chapters. |
| RC2 | **The player is the evolving organism**, setting its own heritable trait, which is misconception 1 (need-driven evolution). | Two Sizes, Meadow, Lock L2, Pathogen, Archipelago L1, Live Fast L1–2 (R8 §3). The behaviour chapters never show the player's rule competing as an allele. |
| RC3 | **Text and quizzes come before play, or replace it.** | Intros: median 109 words (I–VI), mean 143 (VII–XI); end cards 200–260. Up to three text cards precede the first action (R7-R3 LL3). Level 2 is a quiz in Archipelago, Food Web, Islands, Fire, Two Fruits, Guest, Switches. Equilibrium is ~80% panels and MCQs; its Case Files state their answers. |
| RC4 | **The concept is in the caption, not the picture.** | Actors 20–30 px on a 390 px canvas; 31 of 43 sized labels in ch20–29 are 10–11 px. Islands' sea stays empty; no Archipelago beak, Fire flame or Food Web web; Graphs empty (`charts: []`, ch18–29). Nothing fledges or dies. No particle system; feedback is sound plus text. |
| RC5 | **No escalation, no stakes, a dominant strategy.** | Mendel: test-cross everything with W. Clinic: one optimal course (high, high, low, low). Spindle L3: the answer is given away. Jaws: 60 identical taps. Meadow L2: always tongue + 4.5 cm. Equilibrium: L13's score is `const ok = true`, and L8/L15 use each label once. |
| RC6 | **Model, text and evidence disagree**; contested ideas are scored as settled. | Inverted Alarm costs; no twofold cost in Why Sex?; Lock and Key collapsing to 10⁻¹⁶; Crowd weight 40 not 32; Hawks' score overwriting its science text (fixed in G1–G4). Still open: Equilibrium's backwards migration text and genotype-seeing bird; the Switches abd-A grid (text hedged, mechanic wrong). Clock dates, Pathogen mosquitoes and Fire oaks are being fixed (unlogged). "Hit hard", Ewald and the intermediate disturbance hypothesis are rewarded as rules. Unrealistic parameters carry no label. |
| RC7 | **Three games, no spine.** | Three engines, three visual languages. HW, drift, founders, the Commons, life history and sexual selection each taught twice in different notation. No recurring organism. 48 menu rows, "Start anywhere". Coalescent before Drift Casino; Tree Thinking is chapter 45. A 560 px column on desktop. No level select, projector mode, shared seed or export. |

---

## 2. What must be protected

**The favourites' loop:** you cause the selection and the population visibly answers; the cost is felt (a bitter mouthful costs 3 s, a 12 s morning, the hawk closing in, grubs thinning, the infection turning red); manipulation is direct (tap the moth, guard the flank, toggle the Hox cell). Redesigns may add depth, never remove these.

| Favourite | Keep | Must improve |
|---|---|---|
| Lichen Wood / Black Country | Procedural bark (`barkTex`), moth sprites, soot crossfade; S, R, h² from the player's own hunting | Apostatic selection (decaying search image, two barks); h² varying by level; gene-pool lens with carrier tail; a real lag in the decline |
| Bitter Wings | The felt cost; luminance coding that is safe for colour-blind players | A variable model:mimic ratio so mimicry can collapse; a Müllerian level; a visible predator-memory cue |
| Left Jaw, Right Jaw | Adaptation emerging from a reflex | Attention as the scarce resource (several fish); a live oscillation plot; a rock–paper–scissors boss; a bigger predator |
| Hawks and Doves | Correct payoffs, V/C, Bourgeois, assessment (L4), war of attrition (L5) | The player's strategy invades the population and moves it; a full beach |
| The Raffle | s/(s+R) and budget tension; the L2 life-bar plot | A visible queue of females; remating and precedence; a real picture |
| Alarm Call | Time pressure plus reading kin | Consequences on screen; kin read from a family tree with multiple paternity; correct cost signs |
| The Forager | Felt diminishing returns; leaving under a clock; fear | One day on one map; gain curve and MVT tangent drawn from the player's data; sequential encounters |
| The Clinic | Clear doses, a real trade-off, failure you can read | A ward; plasmids as a separate non-TB pathogen; the mutant selection window; a level where containment wins |
| Switches | A construction toy with instant causation | An A1 column; colinearity as a mechanic; a drawn larva; a Pitx1 circuit |

**Build on these.**
- **Engines.** Hunt is config-driven (`phen`, `sprite`, `makeBg`, `objective`, `stars`, `onBred`). `Gen`, a seeded diploid engine with additive, dominant and count loci, is the single genetics engine (R4, R6).
- **Equilibrium.** Phenotype/genotype lens, allele jars, p² square, 2pq tile collapse, the de Finetti triangle as a map, one-idea panels of 35–60 words.
- **Tangled Bank.** Live Price bars ("the single best piece of conceptual visualisation", R4); Slow Island's evolved senescence; Steward mode as sandbox.
- **Charts.** Census dots against a dashed HW ghost; the Two Sizes bimodal sea; the Why Sex? ratchet histogram; the Sieve dot-histogram; the Two Fruits race index; the Spindle diagram.
- **Real verbs.** Mendel inference with likelihood; Census sampling cost and power; Spindle L1 binomial detective; Sieve drawing; Doubling L1; Guest L1; Sweep L1; Many L1 timing; Commons L1 (Simpson's paradox); the Sieve "split" challenge; the Casino's predict-before-bet.
- **Best-modelled science** (keep the models, rebuild the play): Census (codominant counts, correct p-value, Wahlund = 2Var(p)); Two Sizes (Parker–Baker–Smith); Spindle references; Raffle maths; River's Orr snowball; Doubling's cytotype exclusion; the Coalescent numbers; TB Commons and Slow Island.
- **Learning content and identity.** The 48 TAKE lines, BRIDGE, the three kinds of truth; the field-notebook shell, title tree, phylogeny menu and procedural painting.

---

## 3. Verified science constraints

Confirmed by R7 or a sweep's literature check. Binding on new text **and** new models.

| Topic | Never | Instead |
|---|---|---|
| Mutation | "Mutations are copying errors"; mutation only as an error to avoid | Copying errors, DNA damage and faulty repair, all blind to need; beneficial fraction ~10⁻² to 10⁻⁵ (Gao 2019; Eyre-Walker & Keightley 2007) |
| Hardy–Weinberg | A good fit means nothing is happening | A null model: drift or selection can move p while genotypes stay in HW proportions. One generation suffices only for an autosomal locus, equal sex frequencies, discrete generations |
| Non-random mating | It "never changes allele frequencies" | True for inbreeding and for assortment with equal fertility; disassortative mating moves p (S-alleles; Wright 1939) |
| Drift | Fixation chance = current share when s > 0 | Neutral rule only; a new beneficial copy fixes with ≈ 2s (2hs, ×Ne/N); thresholds use Ne; "nearly neutral" is \|Ne·s\| ≈ 1 |
| Bottlenecks | Mainly heterozygosity is lost, for ever | Mainly allelic richness (Nei 1975); alleles return slowly by mutation or migration |
| Agency | Individuals evolve, choose, copy or need; "drift" used for selection | Variants and lineages are selected; populations "evolve" or "move" |
| Kin and alarm calls | "Half your genes"; a costly hawk whistle and a cheap coyote trill | Identity by descent, on average; litters are often multiply sired. Whistle cheap and self-preserving; trill costly and nepotistic (Sherman 1977, 1985) |
| Cooperation | Random groups act like kin; b/k > c is altruism | That is weak altruism (the good repays its maker). Strong altruism needs assortment beyond random (West et al. 2007) |
| Hawks and Doves | Fiddler crabs fighting over shells | Hermit crabs and shells, or fiddlers and burrows. Distinguish a mixed ESS from a polymorphism |
| Mimicry | Mimics "only work while rare" | Mimics do best while rare relative to their models (Lindström 1997) |
| Melanism | Recurrent carbonaria mutation; carbonaria "hidden" in heterozygotes | One origin, around 1819 (van't Hof 2016). The carbonaria copy share is below the share of black moths |
| Laterality | Jaw side is fixed and fully heritable | Mostly one flank; low h²; a continuous trait |
| Evo-devo | abd-A loss gives abdominal legs; Hox "atop the hierarchy"; "most" change regulatory; dorsal spines | abd-A loss gives legless A1-like segments; Ubx loss in A1 gives legs (Lewis 1978). Selector genes. "Many". Pitx1 loss removes pelvic spines |
| Clock | Dates shuffled against species | Fixed real pairs: human–chimp ≈7 Myr; plants–animals ≈1.5 Gyr |
| Ring species | Clean rings; song complexity rising round the ring | Messier (Alcaide 2014); warbler song simple in the south, complex at both northern ends in different ways (Irwin 2000; verify) |
| Virulence | Mosquitoes raised myxoma virulence | Myxoma is mosquito-borne, and its virulence fell. Ewald's hypothesis has mixed support |
| Ecology | Oaks as the fire-sensitive climax; threshold = debt | The climax is shade-tolerant maple or beech. The extinction threshold (h = e/c) is not the extinction debt (a time lag) |
| Phylogeny | "Lives in water" unites whales and hippos | Convergent (Springer 2021); two informative SINEs |
| Crossing over | The cell places crossovers | Stochastic, with hotspots, an obligate crossover, interference |
| Sex ratio | Fig wasps match the diploid ESS "exactly"; a male die-off counts as evolution | The haplodiploid ESS is (n−1)(2n−1)/[n(4n−1)]. Fisher's argument is about a heritable strategy spreading |
| Life history | Smith–Fretwell as "a whole extra egg"; Austad "1.5×" | Compare with the same unit spent on more eggs; Austad found ~25% longer life; senescence prediction is Williams 1957 |
| Climate tracking | Great tits advanced laying to track caterpillars | Laying did not advance in 23 years; selection for early laying grew (Visser 1998) |
| Data | Equilibrium's sickle-cell counts; Paine's non-*Pisaster* removals | Unsourced: do not reuse; label the removals "illustrative" |

**Disclose on screen:** a "×N" tag on unrealistic parameters (half the moths eaten per generation; 6% cheaters per division, 10⁴–10⁵ too high; Equilibrium's 3% mutation); "history compressed"; designed versus real data; expected (ghost) versus realised (solid); each model's key simplification (no remating, free eggs, a scripted population, imposed ageing).

**Present as contested** (no star for picking a side):
- *Disease:* "hit hard early" (Read, Day & Huijben 2011); the virulence trade-off (firm only for myxoma and HIV); Ewald's hypothesis.
- *Ecology:* the intermediate disturbance hypothesis (Fox 2013); the Yellowstone cascade.
- *Genomes and domestication:* the domestication syndrome and neural crest; Kondrashov; Pitx1 "fragile DNA"; replication-driven paternal-age effects.
- *Behaviour:* smaller ejaculates at high competition (Kelly & Jennions 2011); the energy-budget rule; Lack's brood reduction; snowflake-yeast apoptosis; handicap waste; the OSR as sole driver; MHC-disassortative mating.
- *Selection and speciation:* how common stabilising selection is; the Orr snowball; founder speciation.

**Model guardrails:** disruptive selection rarely gives two lasting peaks under random mating, but variance can still grow (never "collapses"); valley crossing needs three N regimes, intermediate hardest (Weissman 2009); matching-allele cycles need a mutation or migration floor.

---

## 4. Curriculum gaps, ranked and owned

**Rule:** D2 triages every existing unit; absorption into a favourite is designed by D1; rebuilds and new games are designed by D3 and placed by D2. Codes are R8's.

| Rank | Code: gap | Vehicle | Owner |
|---|---|---|---|
| P0 | D2 overproduction, carrying capacity; misconception 3 | Lichen Wood Act 0 hook; pin-an-individual lens | D1 |
| P0 | B3 mutation blind to need, DFE; misconceptions 5, 16 | Scribe rebuilt as a DFE lineage; Luria–Delbrück plates | D3 |
| P0 | C8 mutation–selection balance | "Leaky Tap" (replaces Equilibrium L10) | D3 |
| P0 | C3 effective population size | Buri's bottles in a merged drift unit (Casino + Eq L12 + Castaways) | D2 merge, D3 levels |
| P0 | C5 F_ST, clines, migration–selection | "Gene Swamping" (replaces Equilibrium L11) | D3 |
| P0 | C9 heterozygote advantage | "Malaria Coast": adults sit above the Hardy–Weinberg curve | D3 |
| P0 | B2 sex linkage, multiple alleles | "Royal Line" (an X-linked spiral) and "Blood Bank" (ABO) | D3 |
| P0 | A4/L4 deep time, fossils | A stratigraphy dig and a log-time zoom | D3 |
| P0 | L1 tree reading too late (misconception 7) | Act 1; drag-and-rotate trees | D2 move, D3 rebuild |
| P0 | M2–M3 Out of Africa, admixture | Serial founder effects and introgression | D3 |
| P0 | L6 mass extinction | "Extinction Roulette" | D3 |
| P0 | I5 horizontal gene transfer | A plasmid ward level in the Clinic | D1 |
| P0 | Misconception 2: acquired traits are inherited | A "gym" level, plus cave-fish eye loss | D3 |
| P1 | C7 2s, Haldane's sieve, Ne·s | "Lottery of the New" | D3 |
| P1 | E2–E3 Bateman/OSR, runaway, lek paradox | Lek and Aripo merged | D2 merge, D3 design |
| P1 | H1 Müllerian mimicry; apostatic selection | Bitter Wings and Lichen Wood levels | D1 |
| P1 | G6 senescence theory | The Slow Island model absorbs Live Fast | D2, D3 |
| P1 | L3 comparative method; D8 testing adaptive hypotheses | "Pseudoreplication Trap"; an evidence budget | D3 |
| P1 | F5 eusociality; brood parasitism | "The Hive"; "The Cuckoo" (Hunt-like) | D3 |
| P1 | K6/L5 hybridisation, real radiation | A multi-island Archipelago or cichlid lake | D3 |
| P1 | E8 self-incompatibility; I7 gene trees, SFS; A6 Lenski | Meadow L3; Coalescent rebuild (moved after drift); Landscape rebuild | D3 |
| P1 | E7 sex determination; M5 human variation (dedicated fact-check); N6 evolutionary medicine | New games | D3 |
| P2 | GWAS; deep homology; biogeography; origin of life; non-genetic inheritance; cultural evolution; greenbeards; imprinting (Nest); RPS lizards (Jaws boss); TE domestication; diversification rates | — | D3 (D1: Jaws) |

**D2 also decides:**
- whether the Food Web and After the Fire leave the core path (R8: they contain no evolutionary process);
- every RC7 duplicate merge;
- the misleading subtitles "Mate choice and runaway" and "Pollination and fertilisation".

---

## 5. Visual and UX findings to solve

D4 owns the solutions; all screens must comply.

1. **Layout.** `#app{max-width:560px}` leaves 56% of a 1280 px screen empty and crops the title tree; Tangled Bank's Steward chart starts below the fold. Target: canvas, live graph and teacher strip side by side; a 16:9 high-contrast projector theme.
2. **Entity size.** Anything the player must read is ≥7% of canvas width; touch targets ≥44 px. Rebuild visuals that do not carry their concept: Fancier (3.0), Landscape (3.5), Raffle, Hawks, the Meadow's 8 px pollinators.
3. **Type.** No canvas text below 12 px; long labels go in DOM overlays.
4. **Colour-vision safety.** Red/green or orange/green carries meaning in Crossing Over L3, Many L2, the Commons cells and Price bars, the Raffle and Fancier charts, the Clinic, Lock A/D, Equilibrium L12 and every pass/fail bar. Use Okabe–Ito plus a second channel (shape, pattern, letter, luminance) and a built-in colour-vision preview.
5. **Graphs.** Notes pauses play, covers 72% of the screen, and its Graphs tab is empty in all 10 I–VI chapters checked and all of ch18–29. Replace it with a live, never-pausing graph in the main view (Census pattern: distribution plus expected ghost); optima move to the debrief.
6. **Shell defects.** Locked stars (~1.7:1) and disabled buttons (~1.9:1); both choice buttons greyed (Hawks, Alarm, Lek); toasts stacking over board and end cards; end-card charts below the fold, primary button clipped on phones.
7. **Payoff.** A 200 ms pop and ripple per correct event; stars that count up; every sound mirrored visually; a reduced-motion path for every effect.
8. **Coherence.** Per-chapter canvas themes read as "three apps" (R5b) but R5a defends them: **D4 must rule.** Equilibrium is a separate product; no organism recurs; Google-hosted fonts break offline play and leak student IPs (embed WOFF2).
9. **Onboarding.** Replace "48 rows, then a text card" with a start-here route and a 3-second ghost-hand demonstration.
10. **Accessibility.** Zero keyboard handlers today. Every action needs a keyboard path, every drag a single-pointer alternative, every reflex chapter an untimed mode.

**Text budget** (binding; enforced by D1's template):
- No text card between opening a chapter and the first action.
- At most 40 words before that action, which must come within 10 s.
- A live HUD line of at most 15 words.
- Teaching panels of 35–60 words, one idea each.
- End card: TAKE line, at most 60 words and one chart, above the fold; "real" and "maths" behind a "Why?" chip.
- The picture changes before any number appears.
- No star for a multiple-choice click.
- Predictions are gestures inside the simulation, scored by distance.
- RECALL moves into a spaced review deck.

---

## 6. Technical constraints and platform

**End state (R6):** a web-first, offline TypeScript/Vite monorepo; a pure seeded simulation core; PixiJS v8 plus a Svelte 5 DOM shell; Three.js lazy-loaded for at most three scenes (Landscape, Switches, perhaps Tree Thinking); PWA plus single-file build; LTI 1.3, SCORM, xAPI events. No Godot or Unity; Blender for offline art only. Strangler migration; the go/no-go spike ports Lichen Wood / Black Country.

**For Wave 2 designs (plain JS and canvas):**
1. **Plug-in route.** One `games/endless-forms/source/v2/*.js` file per chapter. `V2.push(CH_X)` replaces the same id; `PLAN_ADD.push({sec, entry, after})` adds chapters or sections. The registry is in `ui.js`, not `core.js`. Contract: `start`, `update(dt)`, `draw(c,w,h)`, `notes`, `intro` (`goal`, `real`), `theme`; Hunt chapters use `mode: 'hunt'` configs.
2. **Learning-layer traps.** `v2` files load after `ch99.js`.
   - The id-keyed `TAKE`, `MODEL`, `RECALL`, `TRANSFER` and `BRIDGE` entries still attach to a replacement: overwrite any the new mechanic makes false.
   - `ch99`'s patches to old objects are lost (`CH_SOOT.intro.how`, `CH_MENDEL.confNote`, `CH_CASINO.newTable`, Sieve missions), while the Lichen predict hook (`Hunt.interlude`, keyed on `'lichen'`) still fires if the replacement uses Hunt. Re-implement or drop each on purpose.
   - `Save.d.stars[id]` keeps the old best: a changed star scheme needs a new key or a migration.
3. **Outside the plug-ins.** Shell width, fonts, toasts, the `setTimeout` loop (should be `requestAnimationFrame`) and button disabling are framework change requests (section 7).
4. **Migration-ready code, now:** a `sim` object (step, act, snapshot) with plain JSON state and no DOM; only the seeded `R()` (no `Math.random`, `Date.now`); player actions logged, so a run is (seed, actions); all words in one content object per chapter; tunables in a params object tagged "realistic" or "×N"; reuse `Gen` and `Hunt`, never fork them.
5. **Tests.** The R6 oracles that apply (HW after one generation; p(1−p)/2N and neutral fixation; R = h²S; rB > C; Hawk–Dove at V/C; Price exact), a monkey pass, and screenshots at 390×780, 1024×768, 1280×720.
6. **Budgets.** 60 fps with 2,000 sprites on a low-end Chromebook; the single offline file keeps working (no CDNs); no 3D in Wave 2 (a Canvas2D height map is fine for the Landscape).

---

## 7. Cross-team interfaces

| Decision | Owner | Rule |
|---|---|---|
| Triage of 48 EF chapters, 17 Equilibrium levels + Case Files, 6 TB chapters (keep / upgrade / merge / rebuild / appendix / cut) | **D2** | No redesign of a unit marked merge or cut without D2 |
| Acts, prerequisites, entry route, course routes | **D2** | Start from R8 §5 (Acts 0–11 plus the sandbox) |
| Whether a concept gets a new game or is absorbed | **D2** | Per the section 4 rule |
| **Gold-standard chapter template** | **D1**; all designers use it | Minimum spec below; D4 owns its layout |
| Palette, allele colours, lenses, size and type minimums, chart grammar, juice | **D4** | Default: blue A, yellow a, letter on every token; expected = dashed ghost, realised = solid, plus a "you" marker |
| Recurring organisms per act | **D4** proposes, **D2** approves | |
| One notation table (p, q, F, Ne, s, h, h², S, R, V/C, r, B, C) | **D2** | Used by all three games |
| Shared widgets: Hardy–Weinberg lens and triangle HUD, Price bars, live graph, prediction gesture | **D1** behaviour, **D4** look | D1 breaks ties |
| Stars and scoring | **D1** | Discover, Predict, Transfer; speed only where efficiency is the concept; in-world currencies, not "% of best" |
| Concept codes on every level; misconception-coded item bank; spaced recall | **D2** | Distractors from CINS/ACORNS |
| Teacher features (level select, projector mode, shared seeds, sandbox parameters, export) | **D2** roadmap, **D4** layout | |
| Framework change requests | **D4** lists, **D2** schedules | They touch `shell.html` and `ui.js` |
| Hunt extensions (search-image decay, multiple barks, model ratio, gene-pool overlay) | **D1** | D3's Hunt-like games use them |
| `Gen` as the only genetics engine | **D2** | Equilibrium's maths becomes a special case |
| Science constraints; a `refs` id on every claim | **Coordinator A** | New claims fact-checked before build |

**Template minimum spec:**
- **Role.** The selective environment, or a behaving animal whose rule then competes as an allele in a visible population (invasion view). Never the organism dialling its own trait.
- **Text.** The section 5 text budget.
- **Prediction.** A gesture inside the simulation.
- **Results.** Outcomes animated on the canvas, as distributions.
- **Structure.** Three to five escalating levels, ending in a boss that inverts the lesson.
- **Failure.** Shown as "Interesting result", with the reason.
- **Model disclosure.** A MODEL panel with realism tags; the three kinds of truth.
- **Extras.** A "What if?" rerun and a sandbox.
- **Engineering.** An oracle test and a keyboard path.

---

## 8. Open questions

**D1:**
1. Does Lichen Wood / Black Country pilot the template, as R6's spike assumes?
2. How does Hawks play move the population without losing the duel?
3. How is Alarm Call kin read from a family tree within a 1.8–3 s decision, and what do deaths look like?
4. Does a one-day Forager blur the MVT lesson? How do encounters become sequential?
5. Clinic: how big a ward, and which plasmid pathogen?
6. What is the Raffle's picture? What does collapsing mimicry feel like?
7. Is Jaws fun with attention scarcity, and what is its untimed mode?
8. Is Canvas2D enough for Switches before Three.js?

**D2:**
1. How large is the core path; what goes to an appendix?
2. HW merge (Equilibrium L1–7 in ~12 minutes plus the Census detective): does Equilibrium survive standalone?
3. One continuous game, or a hub of campaigns (R2: Sex, Kin, Foraging, Uncertain lives)?
4. Where does the sandbox sit, and what format do scenario cards take?
5. What does the 15-minute Act 0 hook teach?
6. Wave 2 build order against R6's migration stages?
7. Which teacher features need shell changes now?

**D3:**
1. Is each P0 gap a standalone 10–20-minute game or a level?
2. How do deep-time games avoid becoming quizzes?
3. Who fact-checks human variation, and with what framing?
4. Which quiz chapters (Archipelago, Islands, Food Web, Fire, Two Fruits, Guest L2, Clock, Copy) become simulations, and which are cut?
5. Which games reuse Hunt, `Gen`, the triangle, the Price bars?

**D4:**
1. Per-chapter themes or one canvas look?
2. How is one painterly style built in Canvas2D through a genotype-to-look rig that ports to Pixi?
3. What is the interim desktop layout under the 560 px shell?
4. Specs for the live graph, projector theme, colour-vision palette, type scale, toasts and ghost-hand demo?

---

## 9. Where to read deeper

| Reader | Read |
|---|---|
| Everyone | §3 above; the closing correction lists of the four R7 files; G1–G4 "Needs a gameplay redesign"; README principles 1–6 |
| D1 | R1 §§III–IV; R7-R1 A28–A54, D1, D7, D13–D16; R2 Raffle, Alarm, Forager, cross-cutting 1–4; R7-R2 A19–A24, A37–A41, A61–A66, C1–C2; R3 Clinic, Switches; R7-R3 CL1–CL7, SW1–SW7, M2, M8–M13; R4 TB hunts, Eq L9; R7-R4 A42–A44, C2, C7–C10; R5a §§8, 10–11; G2; G1/G3 rows for your chapters; R6 §6 Stage 1; design-history 03 items 1, 5, 6, 11–14 |
| D2 | R8 (all; esp. §2 matrix, duplicates, §§4–5); R4 cross-cutting and "What to salvage from TB"; R7-R4 §D; R2 cross-cutting 7; R3 "pattern behind boring" and learning layer; R7-R3 LL1–LL5, UI1–UI5; R6 §§5–6; R1 cross-chapter recommendations; design-history 03 items 1, 12, 15, 17–18 |
| D3 | R8 M rows and §3; missing-concept sections of R1–R4; verified formulas in R7-R1 B37–B44, R7-R2 B46–B49, R7-R3 MC1–MC13, R7-R4 B13–B48; R3's quiz-level replacements; R6 §4 rule 3; design-history 01–02 |
| D4 | R5a and R5b (all); R3 "Shared UI and engine" with R7-R3 UI1–UI5; R6 §2, §3 rig row, §4 rules 2 and 6–7; R8 §4 projector and accessibility rows; R4 cross-cutting 5–6; `equilibrium-hw/source/engine.js` effects layer; `hunt.js` `barkTex`, `mothSprite`, `leafTex` |
