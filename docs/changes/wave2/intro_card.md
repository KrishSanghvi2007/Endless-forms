# Wave 2: the opening description card, chapter accents and the Batch 1 retrofit (21 October 2026)

Engine agent (owner of `v2/00_entry.js`) for the designer's addendum to D6 (decisions 7 and 8, binding). Nothing was committed. The contract is API_v2 §15.

## 1. What the designer asked for

- **Decision 8.** Every chapter opens with a short card in three labelled parts (The game, The biology, How to play), each 1–2 sentences of at most about 35 words. It has a big Play button, and a "?" in the dock reopens it during play. Chapters supply `content.intro = {game, biology, how}`; `00_entry.js` draws the card for every v2 chapter. This overrides D5 decision 18 ("no card before the first action"). The ghost hand still demonstrates the first action once play starts.
- **Decision 7.** Every chapter has its own world: organism, place and palette. Blue A and amber a appear only inside genotype or allele read-outs. Beetles belong to Equilibrium only. The chrome may share a layout, but each chapter tints it with its own accent colour.

## 2. Engine (`v2/00_entry.js`, `Intro`; additive, inert under `?v1=1`)

| Piece | What it does |
|---|---|
| `App.playLevel` wrap | Opens the card when a v2 chapter is **entered from outside it**: menu (with resume), Begin into the Wood, Next unit, Levels from the menu, `?unit=` links. It opens after `startLevel`, so the level is set up and drawn once behind the dimmed card (`Intro.peek`). A card already pauses the stage (`stageLive`), so the sim, the soft Predict timers, `Fx.after` and the ghost hand wait. It is not shown on Next level, Replay level, Levels inside the chapter, thaws, replays, `?intro=0` or `Intro.off`. |
| The card | Header band in the accent with the act ("Act 4 · Forces"), the title and subtitle. Three parts with a small line icon and an accent rule. "Starts at level n of N: name". Buttons are **Notebook** and a big **Play**. Reopened, the buttons are **Keys** (fine pointers only) and **Resume**. |
| Keys | Enter, Space or Escape play or resume. A focused card button acts on its own. Tab cycles inside the card. In v2 play the **?** key reopens the card; in legacy chapters it still opens the keys list, which the reopened card offers as Keys. |
| Ghost hand | Input on the card or on "?" is stopped in a window capture listener registered before `00_fx.js`'s. `Ghost._input` and `Fx._input` never see it, so the level's demo plays once the card closes and the unit's `Ghost.show` handle stays valid. |
| Dock "?" | One `button.ef-q` (`data-id="ef-intro"`, `aria-label="About this chapter"`, `aria-haspopup="dialog"`, `aria-keyshortcuts="?"`). A `Dock.set` wrap puts it first in the dock after every call, outside `Dock.items`, so dock keys, `Dock.update` and the four-button rule are untouched. Focus returns to it after Resume. |
| Accent | `ch.accent` (`#rrggbb`), else the shell carmine. `Intro.tint` darkens or lightens the band until its text keeps ≥ 4.5:1, darkens the part labels to ≥ 4.5:1 on the paper, and washes the card body with 7% of the accent. `Intro.chrome` (on `Hooks.play`) gives `#scr-play` the class `ef-tint`, a 3 px accent rule under the bar and over the dock, and `--ef-surf`: the dusk surface with 8–16% of the accent, kept at ≥ 7:1 for `--v-text` and ≥ 4.5:1 for `--v-text2`. The strip, dock and HUD use it. |
| Layout | Phone first: at 390 × 780 the ~110-word card fits without scrolling (618–688 px tall). On desktop it is at most 480 px wide. Under 700 px of height it uses a compact variant. The Play button is 56 px tall. |
| Export | `EXPORT.Intro`: `open`, `go`, `on`, `tint`, `box`, `off`. |

CSS is appended to the existing `#ef-entry` style element. No `ui.js`, `shell.html` or `core.js` edit was needed.

## 3. Retrofit of the five Batch 1 units

Each part is checked by `tests/lint_text.js`: ≤ 35 words, sentences ≤ 18 words, British spelling, D0 agency rules. Accents were checked with `CVD.gamut` (≥ ΔE 8 from every data ink in both themes). The first Black Country choice, `#B4572E`, sat ΔE 5.5 from Paper's selection ink, so it became `#A0623E`.

| Unit | Accent | The game / The biology / How to play (summary) |
|---|---|---|
| The Lichen Wood (`lichen`) | `#6F8A45` lichen green | A bird feeding four chicks; selection needs variation and inheritance, and the population evolves towards the bark; tap moths, then drag the diamond to predict the young. |
| The Black Country (`soot`) | `#A0623E` rust brick | A jay near the mills as soot falls, then a field test; carbonaria is dominant and spreads fast, and hidden pale copies return slowly at first; peck, predict when black passes half, then mark–release–recapture. |
| Hawks and Doves (`hawks`) | `#23998B` sea turquoise | A hermit crab contesting shells, whose young carry its rule from level 2; payoffs depend on what the others do, and when fights cost more than the shell neither pure Hawk nor pure Dove is stable; Hawk or Dove, predict, hold to rap. |
| Equilibrium (`census`) | `#7D5BA6` plum | A field geneticist with beetles, then rats; HW as the null model (p², 2pq, q²): inbreeding, structure and selection leave departures, while drift can shift p and the fit still holds (D6 L8); tap, crank, drag, predict, Lock in. |
| Drift Casino (`casino`) | `#8C2438` burgundy | A gambler at a riverboat casino, with jars of glass beads, bottles of flies and island lizards; drift is chance in sampling, a neutral allele fixes with a chance equal to its share, and crashes strip rare alleles; bet chips, Spin, predict. |

## 4. Visual diversity (decision 7)

**Drift Casino gets its own world** (view code only; every sim, star, oracle and bot path is unchanged):
- **Room.** A riverboat saloon: burgundy damask wallpaper, a mahogany dado under a brass rail, lamplight from above (a cached `Layer`) and a little drifting cigar smoke (cosmetic, `Det.sin`). It replaces the Lab plate and its graph-paper grid.
- **Table.** Green baize, brighter under the lamp, with a brass rim, a mahogany rail and a brass pinstripe. The chips are burgundy with cream edge spots. The croupier's card is cream with a brass edge. Jar counts sit on brass-tinted pills.
- **Jars.** Clear glass with brass collars on mahogany shelves with brass rails. The beads are **glass marbles**: the allele token (blue A, amber a, with letters) plus a highlight. The marbles stay blue and amber because they *are* gene copies (decision 7 allows inks in allele read-outs).
- **Buri's bottles and the Ne side tables** sit on a parchment bench board with brass edges, so the vials (gene pools) and the fruit flies read on the dark room.
- **The castaways (L4) and the volcano and zoo (boss) are brown anoles, not beetles.** The anole is drawn top-down in `casino.js` (`lizard()`), on sandy islets with scrub in a dark teal sea. Males are bigger and plain; females carry pale dorsal diamonds, as in *Anolis sagrei*. Zoo pens are sand in brass frames on a mahogany bench, keeper tokens are brass, and a migrant is a lizard.
- **Words.** Seven strings changed from beetles to lizards (HUD `bet3a`, `run3`, `crash`, `zooIntro`; whisper `migrant`; label `storm`; MODEL L4/boss text; the legacy `MODEL.casino` override).
- `DC_LOOK` holds the palette. Every paint passes `CVD.gamut` (ΔE ≥ 8 from the data inks).

**Checks on the other four:**
- **Lichen Wood.** Lichen bark, moths, nest: no blue or amber. Unchanged.
- **The Black Country.** The skyline strip is now industrial: a sulphur-brown sky that darkens with soot, saw-tooth brick mills, brick stacks with sooty caps, a few lit windows. The morning timer was amber (`#D9A441`); it is now cream, turning rust (`#D27A4C`) in the last quarter. The bark is still the Wood's lichen bark at the start of L1, because soot falls on it during the level (the story of the unit).
- **Hawks and Doves.** The Hawk and Dove dock buttons were filled blue and amber, which turned chrome into an ink scheme. They are now neutral dock buttons. Each carries its rule's ink only as a 7 px side bar and on its claw glyph, as a key to the beach read-out (the crabs' claw inks and the hawk-share bar stay, since they are read-outs of the heritable rule).
- **Equilibrium.** The beetles wearing their genotypes are the anchor (D6 1b). They are the only beetles left in v2 Batch 1.

## 5. Science changes (log, CLAUDE.md rule)

| Where | Change | Why / reference |
|---|---|---|
| `casino` L4 and boss (organism) | The castaways and the zoo are island lizards (brown anoles), not beetles. The model is unchanged (the same founders, alleles, eruption and zoo numbers). | D6 decision 7 (beetles only in Equilibrium). Rafting lizards found island populations: Censky, Hodge & Dudley 1998, *Nature* 395: 556 (green iguanas carried to Anguilla on hurricane debris, 1995). |
| `casino` MODEL L4 `nature` | Now reads: "Island populations founded by a few castaways often differ from their source. Brown anoles released on small Bahamian islands kept their founders’ differences for years." Refs `kolbe2012` and `censky1998` were added beside `mayr1942`. | Kolbe, Leal, Schoener, Spiller & Losos 2012, *Science* 335: 1086–1089, "Founder effects persist despite adaptive differentiation: a field experiment with lizards". |
| `casino` zoo drawing | Males are drawn larger than females. The beetle version drew females larger. | Male-biased size dimorphism in *Anolis sagrei*. This is cosmetic only; the zoo's sex ratio and levers are unchanged. |
| Intro texts | New player-facing claims, each restating the unit's existing taught content. One is worded with care: Equilibrium's "drift can shift p while the fit holds" follows D6's L8 ("Fit is not stasis"), so it does not say every force breaks HW. | D6 spec; unit change logs. |

## 6. Tests

- `tests/monkey.js`: fails a v2 run that does not open on the card (`no-intro`), checks the card text, presses Play (or Enter), now and then presses "?" mid-level and resumes, and reports `intros`.
- `tests/lint_text.js`: `content.intro.{game, biology, how}` is required, with budget 35 (`BUDGET.intro`). More than two sentences is a warning.
- `tests/selftest_e4.js`: its old checks said "no intro card for a v2 unit" and "Begin … with no card". They now expect the description card and press Play. Its dock clicks use `Dock.items[0]` (the "?" sits first in `#dock`). Result: 162 passed.
- The results of the gate run are in the hand-off report: monkey, lint, oracles, golden check and screenshots for lichen, soot, hawks, census and casino.
