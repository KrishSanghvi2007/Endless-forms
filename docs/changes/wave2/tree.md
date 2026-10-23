# Tree Thinking (`tree`): the Wave 2 rebuild

*Session 4, 23 October 2026. File: `games/endless-forms/source/v2/tree.js` (`CH_TREE_V2`, replaces legacy `ch28.js` `CH_TREE`; `?v1=1` still plays the legacy quiz). Tests: `tests/oracle_tree.js`, `tests/tree_shots.py`. Built to D3 §4.1 and D2 §4, cut down by D6 decisions 9 and 10.*

## What it is

**World (D6 decision 7).** A Victorian natural-history museum gallery at night: panelled mahogany, tall back cabinets with faint jars, two gas sconces throwing gas-light green, a parquet floor. The tree of life is a **brass tree** (rods, riveted joints, a mahogany plinth) whose tips are **real specimens**: spirit jars in amber fluid (salmon, frog, lizards, crocodile, octopus, lancelet, lamprey, gecko, monitor, snake) and dry mounts on parchment (house sparrow, ostrich, mouse, a human skull, a pinned bat, whale, hippo, cow, pig, a limpet on rock). Chalk on slate for the curator's notes. Accent `#4F8F78` (gas-light green); place `warren` (the darkest ground).

**Real biology (D6 decision 10).** Every tip is a drawn organism with the traits visible on it (the bat's wing is skin on long fingers, the sparrow's feathers and beak, the octopus's big camera eye, the monitor's forked tongue, the mouse's hair). Abstract read-outs sit beside them: the chalk ledger (traits × specimens), chalk ticks on branches, the step plaque and the strip chart.

**One verb (D6 decision 9): tap the brass tree.** L1: tap a joint and its two arms swap sides. L2–L4: tap a specimen (to hang the newcomer beside it, or to put the root on its branch). L2–L3 have one dock button, **Mount**. No sliders, no drag markers, no side panels.

| L | Name | One idea | What you do | Key number on screen |
|---|---|---|---|---|
| 1 | Same tree, redrawn | Swinging a joint changes the picture, not the tree; read relatedness from joints, not tip order | Swing joints until each specimen sits under its chalk silhouette (3 plates, par 1, 2, 3). The last plate is the "ladder of progress". **The one prediction** (the aha, Baum et al. 2005): "Here the frog stands by the salmon. Tap the frog's closer relative." The reveal runs gas-light from the frog to its joints with the human (younger) and the salmon (older, the root). | "2⁵ = 32 · drawings, one tree"; par |
| 2 | Count the changes | Parsimony: the tree that needs the fewest trait changes is the best guess | Hang the sparrow (by the ostrich: 3 steps vs 5), then the whale (by the hippo: 7 vs 10, three shared SINE insertions). Each change is a chalk tick on its branch; a trait shared by three costs 1 everywhere. | "Steps n · fewest wins"; per-trait steps in the ledger |
| 3 | Look-alikes | Convergence vs homology: one look-alike trait is outvoted by many independent ones | The bat with only the **wings** drawer open (by the sparrow: 1 step). Mount, and the other drawers open (hair, milk, three ear bones, feathers): the bat-by-sparrow tree now needs 8, by the mouse 6; wings need two ticks (amber). Then the octopus: its camera eye says "salmon", radula, mantle, notochord and nerve cord say "limpet" (6 vs 9). | Steps; the convergent row turns amber with "2" |
| 4 | Find the root (boss) | Steps cannot choose a root; an outgroup does, and gains turn into losses | Each tree starts rooted on the wrong tip (the mouse; the snake). Tap specimens to move the root: the plaque says "Steps 4 · on every root" and the chalk labels flip from "− skull, − jaws…" to "+ skull, + jaws…". Root on the outgroup (lancelet; frog). Snakes rooted on the frog: legs lost once. | "Steps 4 / 3 · on every root"; the strip's flat bars |

`content.boss.inverts`: "Steps chose every tree. They cannot choose the root: only an outgroup can."

## Model and science

- **Fitch parsimony** (`TT.fitch`) on rooted binary trees, with a top-down state assignment that records where each change falls (`{clade key, new state}`), so the view can draw one tick per step. L2–L3 four-specimen trees are unrooted: drawn as two forks joined by a bar with no trunk, scored rooted on the bar with the root state preferring "absent". L4 reroots the same unrooted tree on the tapped tip (`TT.reroot`), and the root takes that tip's state when ambiguous (outgroup logic).
- **Data** (all present/absent textbook characters; no rates, so no ×N tags):
  - L1 tree: (salmon, (frog, ((lizard, sparrow), (mouse, human)))) — clade chalk labels bony vertebrates, tetrapods, amniotes, reptiles, mammals; "Birds are reptiles too."
  - Sparrow, ostrich, crocodile, lizard: feathers, toothless beak, four-chambered heart (birds + crocodiles: uninformative in a four-taxon tree, shown on purpose).
  - Whale, hippo, cow, pig: the legacy data as corrected in Wave 1 (`science_sweep_G5.md` rows ch28.js:26 and :33): SINEs 1–3 whale + hippo (three separate sites, shown as one ledger row ×3), SINE 4 whale + hippo + cow, hair and hooves (not whale), chews the cud (cow). "Lives in water" stays out (G5; Springer et al. 2021).
  - Bat, sparrow, mouse, lizard: wings, hair, milk, three middle-ear bones, feathers (legacy set 1 minus "warm-blooded", which is itself convergent).
  - Octopus, limpet, salmon, lancelet: camera eye with a lens (octopus, salmon), radula and mantle (molluscs), notochord and dorsal nerve cord (chordates; the salmon's notochord is embryonic, said in the MODEL card). A **limpet**, not a garden snail, because many snails have small lensed eyes; *Patella* has open pigment-cup eyes.
  - L4 vertebrates: lancelet (outgroup; Delsuc et al. 2006), lamprey, salmon, frog, mouse; skull, jaws, four limbs, hair. Bone and lungs were avoided because their state in sharks and the gnathostome ancestor is debated.
  - L4 snakes: frog (outgroup), gecko, monitor lizard, snake; legs, scaly skin, deeply forked tongue. Snake + monitor closer than gecko under both molecular (Toxicofera; Vidal and Hedges 2005; Pyron et al. 2013) and morphological trees. Fossil *Najash* kept hind legs (Apesteguía and Zaher 2006).
- **Refs ids used in MODEL cards:** baum2005, gregory2008, meir2007, fitch1971, nikaido1999, springer2021, land2012, ogura2004, felsenstein1978, delsuc2006, az2006, pyron2013.
- **Wave 1 corrections kept:** G5 (no "lives in water"; three insertions really whale + hippo; whales coded hairless as a secondary loss), G6 BRIDGE text.
- **Agency (D0 §3):** no individual evolves, chooses or needs; traits "arose", populations and lineages are what change.

## Cut from the D3 spec (D6 decision 9 overrides it)

- The Wood map, "cut the wood" and the player's own Act 0 moths (L1); persistence through `Save.res`. Replaced by a fixed six-vertebrate tree: one verb, no save dependence, and a world of its own (D6 decision 7: no moths).
- Pair-dragging, buying characters, the step-counter-as-matrix-plate, the root-pin drag and the ancestral-state drag (L4 Predict). Three of D3's four predictions are cut; the one kept is the L1 frog question, the chapter's aha.
- The long-branch-attraction boss (Felsenstein 1978) and the likelihood toggle: a fifth idea and a fifth level. It is named in the L3 MODEL card under "cannot". The whale/manatee transfer case is folded into L2 (whale by hippo) without the manatee.
- What if? levers (none; nothing to rerun with one thing changed).

## Stars

| Level | Offers | Rule |
|---|---|---|
| L1 | Discover, Predict | D: all three plates within par + 3 swings and no plate solved by the curator. P: the human picked as the frog's closer relative |
| L2 | Discover | both newcomers mounted on the fewest-step tree |
| L3 | Discover, Transfer | D: both cases end on the fewest-step tree (all traits in view). T: the octopus's **first** hang is beside the limpet |
| L4 | Discover | each tree rooted on its outgroup within two taps |

`unitStars`: Discover on three of four levels; Predict from L1; Transfer from L3. Safety valves so a stuck player (or bot) always finishes, none earning Discover: L1 the brass swings itself after par + 12 swings; L2–L3 the curator mounts after 14 hangs; L4 the curator roots after 8 taps.

Bot sweep, `python3 tests/bots.py BUILD tree --seeds 1-40 --bots alwaysA,alwaysB,random,greedy,threshold,ladder,lookalike` (best mask, mean stars): no bot earns three stars in any level, and the oracle checks that no fixed bot's union across the four levels reaches three. L4 actions are listed left to right as drawn, so "first" and "last" bots are screen-position strategies (about 20% Discover by chance). `greedy` (hang where most visible traits are shared) earns L2 Discover: that is parsimony's own heuristic, and it fails L3's wing trap. `ladder` (pick the neighbour) never earns Predict; `lookalike` never earns L3 Discover or Transfer.

## Tests run (all on `V2_ONLY='0*,zz_*,tree.js'` builds in the scratchpad)

- `node tests/oracle.js BUILD tree`: **49 passed, 0 failed**. Fitch equals a brute-force minimum on 4,440 tree × character pairs (4–6 taxa); the step counts on show; 32 distinct drawings with identical clades; plates exactly 1, 2, 3 swings apart on 200 seeds and the last is the ladder; steps identical on every root; rooted on the outgroup the stories are "+skull, +jaws, +limbs, +hair" and "−legs, +scales, +fork"; the root decides sisters; determinism and snapshot replay per level; every bot finishes every level; expert earns every offered star on 20/20 seeds; no star outside a level's offer; Interesting texts match their runs.
- `node tests/lint_text.js BUILD tree`: 0 errors, 0 warnings.
- `sh tests/dup_globals.sh`: ok (all top-level names prefixed `TT`/`CH_TREE_V2`).
- `GAME_HTML=BUILD python3 tests/monkey.py tree 1,2,3 --vp 390x780,1280x720`: 6/6 reach the end card; also seed 4 at 1024×768, seed 5 with `--calm`, and seed 1 with `?v1=1` (the legacy quiz).
- `GAME_HTML=BUILD python3 tests/tree_shots.py OUT`: every level and phase at 390×780 and 1280×720, no page errors and no Lbl/Whisper/HUD/Dock warnings.

## Fixes made after looking at the screenshots

1. The HUD wraps to three or four lines on a phone and the layout read a fixed 56 px: the slates were hidden. `hudH()` now measures the HUD's real bottom (the most this level has needed), and `firstWords` was shortened.
2. The whisper always sits just under the HUD and covered the slate row: the layout keeps a 40 px whisper lane.
3. The engine calls `down()` before `tap()`; empty `down`/`up` stubs swallowed every tap. Removed.
4. Level names over three words broke the banner's `Lbl` budget: "Same tree, redrawn", "Find the root".
5. Tick glyphs on the right half of the bar fell into the ledger: glyphs on a level bar now always sit above it.
6. Plinth and plaque overlapped in L1 and L4; specimens were small in their cabinets; the desktop tree was short. All re-spaced.
7. The L4 "rooted" line said every trait is then gained, which is false for the snakes (legs are lost): now "gains and losses now read the right way."

## Engine requests

- The level card shows **unit** stars, so after L1 an earned L1 Discover shows as unearned (Discover needs three levels) and the "still to earn" line names it. Same as the known request in START_HERE §4 item 4.
- A whisper position option (below the HUD is where this unit's chalk plate lives); worked round with a lane.
- `Stage.zones.hud.h` is capped at 56 px; a unit laying out under a wrapped HUD has to measure the DOM.

## Needs sign-off (science)

- Coding the salmon as having a notochord (embryonic) in the octopus case.
- The limpet's eye as "no camera eye" (open pigment cup in *Patella*).
- "Deeply forked tongue" for monitor + snake only (geckos have a notched, not forked, tongue).

## Playtest script (designer and colleagues, D6 decision 4; about 6 minutes)

1. Open Tree Thinking from the menu. Read the card; press Play. **Watch for:** do you know what to tap before the hand shows you?
2. L1: match the three chalk plates. Try to beat par. Before the last plate, look at the drawing: does it look like a "ladder"? When asked, tap the frog's closer relative. **Ask yourself:** did the reveal (gas-light to the two joints) change how you read the drawing? Did 2⁵ = 32 mean anything?
3. L2: hang the sparrow, then the whale. Try all three places before mounting. **Watch for:** can you say what one chalk tick means? Is "a trait shared by three costs one step everywhere" visible without reading the card?
4. L3: hang the bat with only the wings drawer open, mount, and watch the drawers open. **Ask yourself:** was the moment the steps jumped from 1 to 8 a surprise? Then hang the octopus on your first try.
5. L4: move the root to two wrong places before the outgroup. **Watch for:** do you notice the steps never change while the + and − labels flip? Is "the root decides who is whose sister" clear from the card?
6. Feedback form: boring moments (where?), confusing controls (which?), anything that looked like a symbol rather than an animal, 1–5 enjoyment, and one thing you would cut.

## Review round (23 October 2026: playtester, art director, adversarial biologist)

Played every level at 390×780 and 1280×720 (`tests/tree_shots.py`, seed 7) and looked at every phase. The world is distinct (no beetles, no allele inks outside read-outs), the specimens are real organisms with their traits drawn on, one verb holds across four levels, the one prediction is the L1 aha, and each level shows its key number on the brass plaque. What was wrong, and what changed:

1. **L4 gave its answer away.** The HUD named the outgroup from the first frame ("The lancelet lies outside this group: tap it"), so the boss needed no thought and its Discover star (root on the outgroup within two taps) was free. Now the HUD asks for "the specimen outside this group", asks again after one wrong root ("Which specimen lies outside the rest?"), and names the outgroup only after two wrong roots (`hud.rootHint`), when Discover is already lost. The aha survives a first-tap success: the level opens on a wrong root, so the player still sees "Steps 4" stay put while every "−" label flips to "+".
2. **The L1 reveal cut across the tree.** The gas-light ran in straight lines from each tip to the shared joint, through empty air. Now it runs along the brass (`chain()` in `revealPaths`), tip → joint → joint, so the player traces the real path down to the younger and the older common ancestor.
3. **The L1 card said Discover was still to earn when the player had earned it.** The engine shows unit stars, and Discover needs three of four levels. When the level earns Discover, the "still to earn" line now reads "Earned here. The unit's Discover star lights once three of four levels earn it." (`levelStars[0].here`). The engine request for per-level star display stands.
4. **The L3 strip went blank after the drawers opened.** Bars are keyed by the traits in view, and the current hang was never recorded at five traits. The sim now records it as each drawer opens, so the bar for the bat by the sparrow shows 8 at once.
5. **The lizard read as a stick** in its jar and as a chalk line on the slate. It has a fuller body, head, eye and back legs now.
6. **Science wording.**
   - The intro said "the best tree needs the fewest trait changes". Parsimony is a criterion, not the truth, so it now reads "Parsimony picks the tree needing the fewest trait changes".
   - The whale case coded whales as lacking "hair". Many whales keep a few bristles, and embryos have hair follicles. The row is now "coat of hair", which whales lack.
   - The L3 MODEL card now says that bat and bird wing bones are homologous forelimbs and only flight arose twice. This is the classic homology-versus-convergence nuance, and without it "wings arose twice" overclaims.
   - The octopus line said "the retina faces the light". It now says what removes the blind spot: the optic nerves leave behind the retina (Land and Nilsson 2012).
   - The whale Interesting text now names the SINEs as the deciding evidence, not only why hair and hooves say nothing.

Checked and kept: every step count on show (sparrow 3 vs 5, whale 7 vs 10, bat 6 vs 8, octopus 6 vs 9, roots 4 and 3), and 2⁵ = 32 for six tips. The clade labels are right, and so are Cetruminantia for SINE 4, toxicoferan snake + monitor with the gecko outside, the craniate skull on the lamprey, and the open pigment-cup eye in *Patella*. Colour-blind safety holds. Ticks needing two changes are amber and also print "2" on their ledger row. Trait identity is a shape glyph. Ledger states are filled or hollow. The reveal paths carry the text labels "younger joint" and "older joint".

Not changed (judged fine under decision 9): the one extra control, **Mount**, explained in the HUD ("Try others, then Mount"); it commits the choice and opens L3's drawers.

Tests after the fixes (all on `V2_ONLY='0*,zz_*,tree.js'` scratch builds): oracle **49 passed, 0 failed**; `lint_text` 0 errors, 0 warnings; `dup_globals` ok; bots (7 bots × 40 seeds) PASS, with no bot reaching three unit stars (the best is `lookalike`, with D + P); monkey `tree 1,2,3` at 390×780 and 1280×720, 6/6 reach the end card; `tree_shots.py` 0 page errors.
