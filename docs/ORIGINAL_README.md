# Evolution games: Tangled Bank, Endless Forms and Equilibrium

Three browser games that teach evolutionary biology by letting the player *cause* evolutionary processes, then showing what happened and why. Designed by Krish Sanghvi (evolutionary biology, University of Oxford) with Claude.

**To play:** open any `.html` file in a modern browser (phone or desktop). Each game is a single self-contained file: no installation, no internet, no dependencies. Progress is saved in the browser.

---

## The aim

Most teaching of evolution is text, diagrams and formulas. These games aim for the reverse order: **experience → name → formalise**. The player becomes the force of evolution — the predator, the breeder, the storm, the matchmaker — makes a prediction, runs the experiment, and only then sees the concept named and the equation that describes it.

Guiding principles (from the design reviews in folder 4):

1. **Predict → Act → Observe → Explain → Transfer.** Players predict before results are shown, and later apply the principle to a new situation.
2. **The player is the selective environment.** Don't tell a principle if the player can generate it.
3. **Visuals are teaching tools, not decoration.** Every animation must carry a concept (alleles flying into jars *are* the allele frequency). No background fluff.
4. **Three kinds of truth.** Each chapter separates *the principle*, *what this model assumes*, and *what happens in nature*, including where the real evidence is messy or debated.
5. **Failure is data.** "Interesting result", followed by why.
6. **Scored against what could be known, not against luck.** Where possible, play is compared with the exact optimum (Bayes, dynamic programming, closed-form theory).

---

## 1. Tangled Bank (`1_Tangled_Bank/`)

The earliest prototype, named after the last paragraph of *On the Origin of Species*. Its central mode is **Steward mode: the player is the environment**. Rather than controlling organisms, the player sets environmental conditions and watches populations evolve in response, with live charts and objectives. It also contains a hunting mode, where the player is a predator. Its engine and ideas were the foundation for Endless Forms.

## 2. Endless Forms (`2_Endless_Forms/`)

The main project: **48 chapters**, each a short, distinct game about one evolutionary idea, from a single gene to the tree of life. Most chapters have 2–5 levels.

| Section | Chapters |
|---|---|
| I. Heredity | Mendel's Garden, The Scribe (mutation), Crossing Over, The Census (Hardy–Weinberg), The Coalescent |
| II. Chance | Drift Casino, The Castaways (founders, inbreeding), Why Sex? (Muller's ratchet, Fisher–Muller) |
| III. Selection | The Lichen Wood, The Black Country (industrial melanism), The Fancier (artificial selection, Belyaev's foxes), The Sieve (directional/stabilising/disruptive), Bitter Wings (mimicry), The Landscape (epistasis, fitness landscapes) |
| IV. Games Animals Play | Left Jaw, Right Jaw (frequency dependence), Hawks and Doves (ESS), Blood Debts (reciprocity in vampire bats) |
| V. Sex | Fisher's Brood (sex ratio), Two Sizes (anisogamy), The Lek (mate choice, handicaps), The Raffle (sperm competition, seminal fluid conflict), The Selfish Spindle (meiotic drive, gene drive), The Meadow (pollination, coevolution) |
| VI. Families and Societies | Alarm Call (kin selection), The Nest (clutch size, parent–offspring conflict), The Commons (Price equation, levels of selection), Many Become One (multicellularity) |
| VII. Lives and Behaviour | Live Fast (life history, Y-model), The Forager (optimal foraging, MVT, risk), The Crowd (ideal free distribution, information cascades), Shape-shifters (plasticity, reaction norms, bet-hedging) |
| VIII. Coevolution and Disease | Lock and Key (Red Queen, newts and snakes), The Clinic (antibiotic resistance), The Pathogen (virulence), The Guest (mutualism, sanctions) |
| IX. Genomes and Development | Switches (Hox genes, enhancers), Copy and Paste (transposons, gene duplication), The Sweep (selective sweeps), The Clock (molecular clock) |
| X. Species | The River (incompatibilities, reinforcement), Two Fruits (sympatric host races), The Ring (ring species), Doubling (polyploidy) |
| XI. Deep Time and Ecology | The Archipelago (character displacement), Tree Thinking (phylogenies), The Food Web (keystones, cascades), Islands (island biogeography, metapopulations), After the Fire (succession, priority effects) |

Each chapter has: an intro (hook, how to play, goal), up to three stars, a **Notes** drawer (the idea, live numbers, graphs, and *The principle / In this model / In nature*), and an end card with a one-line takeaway, the real biology and the maths. A learning layer adds bridges between chapters, prediction questions that carry a principle from an earlier chapter, and "Remember?" retrieval questions.

## 3. Equilibrium: a Hardy–Weinberg game (`3_Equilibrium_Hardy_Weinberg/`)

A complete course on the **Hardy–Weinberg principle** in 17 levels plus a final set of Case Files.

**Core visual:** each beetle wears its genotype — one allele on each wing case (blue A, dominant; yellow a). A lens switches between **phenotype** (what a predator sees) and **genotype**. "Break into alleles" flies every wing case into counting jars, so p and q are seen before they are written. A **de Finetti triangle** is used throughout as a map: moving sideways means allele frequencies are changing (evolution); moving off the curve means genotypes are out of Hardy–Weinberg proportions.

| Chapter | Levels |
|---|---|
| I. Alleles in a population | Two copies each · Break into alleles (p and q describe alleles, not individuals) · Dominant isn't common |
| II. Where the equation comes from | The gamete pool (random mating = random drawing) · Why p² · Why 2pq · One generation to equilibrium |
| III. The Hardy–Weinberg world | Equilibrium Island: five assumption switches, then mystery islands to diagnose |
| IV. Breaking the equilibrium | Selection (you are the bird; why rare recessives hide) · Mutation · Migration · Drift · Bottlenecks and founders · Non-random mating · Evolving, or just unbalanced? |
| V. Using Hardy–Weinberg | Invisible carriers (q = √aa, 2pq; cystic fibrosis) · Real populations with χ² (scarlet tiger moths, sickle-cell haemoglobin) · The Case Files (eight mystery populations) |

`v1_archive/` contains the first, superseded version (a snapdragon meadow), kept for reference.

## 4. Design ideas and reviews (`4_Design_Ideas_and_Reviews/`)

- `01` — the original list of 100 evolution game concepts.
- `02` — 24 further concepts (ecology, evo-devo, behaviour, genetics).
- `03` — reviewer feedback on Endless Forms, which shaped the learning layer and accuracy fixes.
- `04` — the Hardy–Weinberg design brief that shaped Equilibrium v2.

---

## For developers

Each `source/` folder holds the modular source. Games are plain JavaScript drawn on an HTML canvas, compiled into one file by `build.py`:

```
cd source && python3 build.py      # writes the single-file HTML game
```

Tests use Python + Playwright (Chromium): a virtual clock runs minutes of play in seconds, and a "monkey" plays every chapter through the real interface (taps, drags, sliders, cards, replays), flagging JS errors, NaN on screen and softlocks. Other scripts in `tests/` are model calibration checks and screenshot generators. Requirements for testing only: `pip install playwright pillow && playwright install chromium`.

Known limitations: tested headlessly and by screenshot, not yet with real students; some later Endless Forms chapters are prediction-led rather than fully interactive; Equilibrium covers one gene with two alleles. Several scenarios use designed rather than real data; real datasets are labelled as such.
