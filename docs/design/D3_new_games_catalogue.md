# D3. Rebuild specs and new games

*Designer D3, round 2, revised after Coordinator B's cross-review of D1–D4. Binding inputs: D0 (the brief), the integrator's cross-cutting decisions, D1's template G1–G12 as amended, D2's triage, acts, prerequisites and notation table (D2 §15), and D4's look rules. D3 owns every non-favourite unit: all REBUILD and MERGE hosts, the non-favourite KEEP & POLISH units (Mendel's Garden, Spindle L1, Guest L1, Sweep L1, Doubling L1) and the new games. D2 places them, D4 sets their look, and D1 reviews each spec against G1–G12 before build. Sources: R1–R8 and the four R7 fact-checks (R7 wins over the review it checks), sweep logs G1–G7 and their reviews, design history 01–02, and the code (`core.js` `Gen`, `hunt.js`, the chapter files, `tangled-bank/source/steward.js`, `equilibrium-hw/source/lv_*.js`). Section 13 lists disagreements; section 14 holds the revision notes.*

---

## 0. Decisions in brief

1. **Fix the boring games before adding new ones.** Round 1 specified 33 new games and left every rebuild as a one-line row. This round specifies 45 units in D2's tier order (D2 §16.1):
   - **tier 1**, the Phase 1 slice: The Mixer and the Drift Casino (§3);
   - **tier 2**, the other eight spine rebuilds: Tree Thinking, Mendel's Garden, The Census, Why Sex?, The Commons, The Coalescent, The River, The Archipelago (§4);
   - **tier 3**, the eight P0 games plus the four P0 hosts: The Scribe, The Royal Line, The Leaky Tap, Malaria Coast, Gene Swamping, The Dig, Extinction Roulette, Out of Africa; The Breeder, Seed Rain, Invisible Carriers, The Pedigree (§5);
   - **tier 4**, the 23 other rebuilds and merges (§6).

   Tiers 1–3 are written at full D1 §3 depth. Tier 4 uses the same fields in compact form and gets deepened during Wave A, as D2's timetable allows.
2. **Frozen.** The P1/P2 new games (tier 5: 8 core units, 12 side quests and one scenario-card set) stay as short entries until tiers 1–3 are approved (§7). Their round-2 fixes to verbs, merges, notation and science are already in those entries.
3. **Every spec names its three loops:** a per-second verb with feedback within 200 ms, a minute that ends in a visible population change, and a level that adds one variable. Every spec also names a felt cost, Discover/Predict/Transfer stars scored against the expectation, an untimed and keyboard path, a teacher hook, and a MODEL card that tags every parameter as realistic, designed or ×N.
4. **No "set a dial and watch".** The nine weak-verb games named by the integrator either get a real-time verb (the Leaky Tap's dive-and-drain, Lottery's chip table, Extinction Roulette's shields, the Warm Nest's nesting female, Song School's echo, the Race's laying clock, Drifting Continents' plate puzzle, `clock`'s constraint brush) or become cards (the Drunkard's Walk).
5. **Merges applied** (integrator's binding list): the Ellipse becomes Seed Rain L4 and its boss; Silent Letters and the Clock become `clock`; Twelve Flasks absorbs Valley Crossing; the Skaters absorb Raffle L4; the siderophore boss moves to the Commons and the Cleaning Station gets a new boss (audience removed, reputation collapses); "The Selection Shadow" is The Slow Island; the Tumour is a side quest that reuses the Clinic's pharmacokinetic module; Tangled Pairs moves to Act 9 after Bitter Wings and uses its insects.
6. **Hardy–Weinberg order:** the Census boss is a Wahlund deficit and the Invisible Carriers boss is inbreeding. Heterozygote advantage appears only in Malaria Coast, so the cystic fibrosis puzzle moves there from the Leaky Tap.
7. **Engine:**
   - The `Gen` extensions are opt-in and leave `_gam` byte-identical, so the 48 legacy golden trajectories do not change.
   - One shared Wright–Fisher helper serves every haploid or lineage model.
   - D3 proposes three widgets: `Chips`, `DemeMap` and `TreeView`. D1 owns their behaviour.
   - D4's GenomeStrip, Petri and Strata carry the rest.
   - Fourteen rigs beyond the anchors are named (§10): five already have D4 rows, and nine need new ones.

---

## 1. Rules every spec follows

### 1.1 The template, as amended (binding)

- **G1 Role.** One of four:
  - the selective environment;
  - a behaving animal whose rule then competes as an allele (the invasion view);
  - an investigator with a budget;
  - an experimenter who releases a variant.

  The data come from a visible simulated population. The player never picks winners and never dials an organism's own heritable trait.
- **G2 Felt cost.** The player's job gets harder as the population adapts: better-hidden prey, purged meals, keys that no longer fit. Null-model and investigator units (Mixer, Census, Pedigree, Invisible Carriers, Tree Thinking, Coalescent, Dig, Mendel) follow D2 §18.1: a cost that grows as the level gets harder, such as field days, sample budget, lens battery or seasons. §13 records why D3 agrees.
- **G3 Three loops** in every spec, each with a decision that can go wrong.
- **G4–G6.** No card before the first action; at most 40 words over a ghost hand; prediction as a gesture scored by distance, never a two-option choice (D1's revised G5: where the lesson is a direction, the gesture places a magnitude whose sign carries it); one live graph that never pauses, revealed in this order: world, sprites into the graph, number, name, then the equation behind "Why?".
- **G8 MODEL card.** Every parameter is tagged *realistic*, *designed* or *×N* (with the real value), plus the key simplification and what the model cannot show.
- **G9 Failure.** "Interesting result" in at most 25 words, plus a What if? button.
- **G10 Stars.** Discover (the in-world goal met and the phenomenon witnessed), Predict (at least two of three gestures within tolerance), Transfer (the boss or a new-situation gesture). They are scored against the expectation for the parameters in force, never the realised run, so Realistic mode never costs a star.
- **G11 Teacher hook.** At least one class-pool or projector moment per unit. Each unit's instructor notes carry three prompts rising in Bloom level, one of them a model critique; specs below list only the unit-specific prompt.
- **G12 Build.** A `v2/<id>.js` plug-in with a `sim` object (step, act, snapshot), seeded `R()` only, an action log, one content object, tunables in `P` as `{v, tag, min, max}` (D1 G12); a Node oracle; a bot sweep in which no fixed strategy earns three stars; a keyboard map; an untimed mode for reflex verbs.

### 1.2 Conventions that hold unless a spec says otherwise

- **Notation:** D2 §15. Examples: q_O, never r, for the O allele; H_o = 2pq(1 − F); ρ for recombination; r_m for growth rate; λ and δ for speciation and extinction; R₀; the 2s rule is owned by Lottery of the New; the Drift Casino carries the neutral rule, Ne and allelic richness.
- **Text:** D4's limits (TAKE ≤ 20 words, end-card body ≤ 60, Interesting result ≤ 25, HUD ≤ 15, canvas labels ≤ 3 words at ≥ 12 px).
- **Colour:** D4's data inks. Organisms keep natural paint. "Yours" is the you-halo, never gold. More than three alleles use the four hues (blue, amber, paper-white, ink-black), then lettered patterns. No red/green meaning anywhere.
- **Keyboard:** D4's map (arrows move the cursor or a ghost, Enter or Space acts, 1–9 choose, P predict, L lens, G graph, ? help). Specs name only their extra keys.
- **Untimed mode:** every reflex verb gets D1's attention-budget pattern. The world pauses on a "tell"; the player spends tokens; the selective logic is unchanged.
- **Realistic mode (D2 §11):** it applies fully to model-driven units (Drift Casino, Lottery, Leaky Tap, Gene Swamping, Malaria Coast). In Hunt-like units the player still sets the direction of selection, scaled to the cited s and time-lapsed, with a chip that says so.
- **Places:** every unit lives in one of D2's 12 places, the Lab or an Expedition, and reuses anchor rigs (§10).
- **Learning layer (D0 §6.2, D2 §8):** each spec overwrites TAKE, MODEL, RECALL and BRIDGE; deletes `TRANSFER[id]` where one exists and turns it into the first gesture; re-implements or drops each `ch99.js` patch on purpose; moves the old best to `v1stars` (D2-4).
- **Ids:** where a rebuild absorbs a legacy chapter it keeps the legacy id, retitled through D2's `v2/00` PLAN patch, so saves and concept codes carry over. New units take new ids through `PLAN_ADD`. Identifiers inside v2 files are new (for example `CH_CASINO_V2`), because `ch*.js` and `v2/*.js` share one strict IIFE.
- **Size key** (D2 §16.5): S = 0.6, M = 1, L = 1.8 M-equivalents.

### 1.3 How a spec reads

Header line: tier · act · place (rigs) · size · wave · minutes · prerequisites. Then:
- **Keep / Fix** (what survives from the legacy unit and what the critique says is wrong);
- **Role and felt cost** (G1, G2);
- **Loops** (G3: second, minute, level);
- **Levels**: Predict → do → observe | Concept, and the aha;
- **Picture and live graph**: the rung-0 object (the world as the chart, D4 §4.2) first;
- **Stars** (G10);
- **Access** (untimed and keyboard);
- **Teacher hook**;
- **MODEL** (tagged parameters, key simplification, what it cannot show) and **In nature**;
- **Build and oracle**.

---

## 2. Spec index

"Verb" is the per-second action. Sizes revise D2's provisional estimates where marked (†).

| # | Unit (id) | Tier | Act | Place | Role | Verb | Size | Wave |
|---|---|---|---|---|---|---|---|---|
| 1 | The Mixer (`mixer`, new) | 1 | 3★ | Beetle Isle, Lab | experimenter | lens-tag beetles; crank the tumbler | M | slice |
| 2 | Drift Casino (`casino`) | 1 | 4★ | Lab, Beetle Isle | environment that shapes N | place chips; buy events in play | L | slice |
| 3 | Tree Thinking (`tree`) | 2 | 1★ | Wood, Archive | environment, then investigator | cut the wood; spin nodes | M | A |
| 4 | Mendel's Garden (`mendel`) | 2 | 2★ | Lab | investigator | sow, watch seeds pop, stop and call | M† | A |
| 5 | The Census (`census`) | 2 | 3★ | Beetle Isle | investigator | sweep the quadrat; buy instruments | M | A |
| 6 | Why Sex? (`sex`) | 2 | 7★ | Lake | behaving animal (parasite) | infect a matching snail | M | A |
| 7 | The Commons (`commons`) | 2 | 8★ | Pond, Lab | environment | reseed a pond; steer the rain | M | A |
| 8 | The Coalescent (`coal`) | 2 | 9★ | Beetle Isle, Archive | investigator | drag a lineage back | M | A |
| 9 | The River (`river`) | 2 | 10★ | Streams | environment, then behaving animal | hold the ford; hop to a caller | M | A |
| 10 | The Archipelago (`arch`) | 2 | 10★ | Outer Islands, Lake | environment | drag a storm; clear blooms | L | A |
| 11 | The Scribe (`scribe`) | 3 | 2★ | Lab | experimenter | tag sparks; plate tubes; stamp velvet | M | A |
| 12 | The Royal Line (`royal`, new) | 3 | 3 | Lab, Archive | investigator, then environment | cross and hatch; sweep the lamp | M | A |
| 13 | The Leaky Tap (`tap`, new) | 3 | 4 | Beetle Isle | selective agent (gull) | dive on slow beetles | S | A |
| 14 | Malaria Coast (`malaria`, new) | 3 | 4 | Expedition (malaria belt) | environment | paint and drain swamps | M | A |
| 15 | Gene Swamping (`swamp`, new) | 3 | 4 | Beetle Isle | selective agent, then environment | peck; lay ferry routes | M | A |
| 16 | The Dig (`dig`, new) | 3 | 1 | Expedition (fossil cliffs) | environment, then investigator | pour mud; tap decays; brush | M | A |
| 17 | Extinction Roulette (`extinct`, new) | 3 | 10 | Archive | reserve manager | drag shields onto lineages | M | A |
| 18 | Out of Africa (`ooa`, new) | 3 | 11★ | Expedition | environment | open corridors | L | A |
| 19 | The Breeder (`fancier`) | 3 | 2 | Lab | breeder (selective agent) | drag breeders into the pen | M | A |
| 20 | Seed Rain (`sieve`) | 3 | 5 | Outer Islands, Expedition | environment | sow seeds; drop food | M (+0.6† Ellipse) | A (Ellipse: B) |
| 21 | Invisible Carriers (`carriers`, new) | 3 | 3 | Lab | investigator (counsellor) | lens sweep; route donor bags | S | A |
| 22 | The Pedigree (`pedigree`, new) | 3 | 3 | Lab, Beetle Isle, Meadow | investigator | drag tokens down paths; pollinate | S | A |
| 23 | Crossing Over (`cross`) | 4 | 2 | Lab | breeder | probe seedlings with markers | M | B |
| 24 | Lock and Key (`lock`) | 4 | 5 | Lake, Valley | behaving animal (larva, snake) | infect; strike a newt | M | B |
| 25 | Twelve Flasks (`landscape`) | 4 | 5 | Lab | experimenter | transfer, freeze, thaw | L† | B |
| 26 | The Crowd (`crowd`) | 4 | 6 | Streams | behaving animal (fish) | swim between feeders | M | B |
| 27 | The Slow Island (`livefast`) | 4 | 6 | Outer Islands | selective agent (fox) | catch by age | M | B |
| 28 | The Pond (`plastic`) | 4 | 6 | Pond | selective agent (fish) | hunt water fleas | M | B |
| 29 | Two Sizes (`gametes`) | 4 | 7 | Shore | experimenter | release mutant gametes | M | B |
| 30 | The Strutting Ground (`lek`) | 4 | 7 | Meadow, Streams | behaving animal; predator | walk the hen; hold to strut; hunt males | L | B |
| 31 | The Fig (`brood`) | 4 | 7 | Fig Grove | behaving animal (foundress) | lay: fertilise or not | M | B |
| 32 | The Selfish Spindle (`spindle`) | 4 | 7 | Lab, Expedition | investigator; chooser; releaser | breed; choose a mate; release | M | B |
| 33 | The Meadow (`meadow`) | 4 | 7 | Meadow | behaving animal (pollinator) | fly, probe, carry pollen | M | B |
| 34 | The Nest (`nest`) | 4 | 8 | Hedge | behaving animal | feed; beg; eject | M | B |
| 35 | Blood Debts (`bats`) | 4 | 8 | Expedition (roost) | behaving animal | share, groom, refuse | M | B |
| 36 | Many Become One (`many`) | 4 | 8 | Lab, Pond | experimenter | transfer; split propagules | M | B |
| 37 | The Guest (`guest`) | 4 | 8 | Meadow | host as environment; releaser | ration oxygen; release a strain | M | B |
| 38 | Copy and Paste (`copy`) | 4 | 9 | Lab | environment (host defence) | place silencers; bet fates | M | C |
| 39 | The Sweep (`sweep`) | 4 | 9 | Lab | investigator | sequence windows; call peaks | M | C |
| 40 | The Clock (`clock`) | 4 | 9 | Archive, Lab | environment, then investigator | paint constraint; place calibrations | M | C |
| 41 | Two Fruits (`fruits`) | 4 | 10 | Expedition (orchard) | selective agent (grower) | pick infested fruit | M | C |
| 42 | The Ring (`ring`) | 4 | 10 | Valley | behaving animal (salamander) | walk and court | M | C |
| 43 | Doubling (`double`) | 4 | 10 | Meadow | experimenter | plant; pair chromosomes; screen pollen | M | C |
| 44 | The Pathogen (`virulence`) | 4 | 11 | Warren | environment (vet) | vaccinate rabbits | M | C |
| 45 | Genetic Rescue (`castaways`) | 4 | 11 | Expedition (Isle Royale) | conservation manager | carry a migrant across the ice | M | C |

Changes to D2's budget:
- **Mendel** rises from S to M (+0.4 M-eq in Wave A), because it now has five levels.
- **Seed Rain** ships in Wave A with L1–L3, and its cave-fish level stands in as boss. The Ellipse levels (L4 and the final boss, +0.6 M-eq) come out of Wave A, as the integrator ruled, and ship in Wave B.
- **Twelve Flasks** rises from M to L because it absorbs Valley Crossing (+0.8 M-eq in Wave B).

---

## 3. Tier 1: the Phase 1 slice

### 3.1 The Mixer (`mixer`, new; absorbs Equilibrium L1–L7)

*Tier 1 · Act 3★ · Beetle Isle (beetle rig) and the Lab (a glass tumbler between two hoppers) · M · Phase 1 slice · about 12 minutes · needs Mendel's Garden (in the slice, which has no Act 2, it opens from the map).*

**Keep.** From Equilibrium:
- the beetle with one allele on each wing case, and the genotype lens;
- alleles flying into jars ("the best animation in the game", R4);
- the area square with sides p and q;
- the 2pq tile collapse ("the best 'equation appears from a picture' moment in the repo", R4);
- Yule's failed 3:1 prediction;
- the unequal-sex twist (R4; R7-R4 B8 confirms 0.27/0.66/0.07);
- L7's spatial prediction on the triangle, which "works" (R4).

**Fix.**
- Equilibrium is about 80% panels and multiple-choice questions.
- L1's "can't tell" answer is right 6 times in 8.
- L4 is a clicker; L5 is guess-and-check with a slider.
- L7's rounding moves p while the text says "exactly" (R7-R4 C1).
- The one-generation conditions are small print (R7-R4 C14).
- The field is a static beige grid, and expected and realised values are mixed without labels (G7 #10).

**Role and felt cost.** The player is an experimenter who samples a population and mates it in the Lab. Nothing adapts in a null model, so D2's ruling applies: the cost grows with the level. The lens battery shrinks from 8 s to 5 s, beetles run faster, and the season's crank count falls from 400 to 40 while the targets get subtler.

**Loops.**
- *Second:*
  - L1: drag the lens over the beach. A beetle under it for 0.3 s flips its wing cases to show two tokens; tapping it sends both tokens into the A and a jars (a 200 ms flight and a clink).
  - L2–L3: crank the tumbler (circular drag, or hold → on a keyboard). Each half-turn draws one egg token and one sperm token; they fuse in the chute, and the zygote lands in its cell of the p × q square within 200 ms.
- *Minute:* one round. Predict with a gesture, sample or crank 40–400 pairs, the bars or the triangle dot settle, then the reveal.
- *Level:* one new variable each time: copies against looks; sample size and the square; unequal sexes; the triangle and X-linkage.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Two copies each (Eq L1–L3) | 300 beetles roam Beetle Isle; blue (A_) and amber (aa); p_A = 0.3; 8 s of lens | From looks alone, drag the p marker on the jar scale (most put it near 0.5, since half the beetles look blue). Lens-tag beetles until the jars read about 30:70. Then Yule's bet: drag where the blue share will be in 30 generations; a 4 s time-lapse runs flat at 51%. | p counts copies, not beetles, and dominant is not the same as common. "Half of them look blue, yet blue is the minority copy." |
| L2 The hoppers (Eq L4–L6) | Egg and sperm hoppers both at p = 0.7; 40 pairs, then 400 | Drag three bar tops for AA, Aa and aa. Crank. At 40 pairs the bars scatter; at 400 they settle on the dashed ghost (0.49, 0.42, 0.09). The two off-diagonal cells slide together into one Aa bar. | p² is two independent draws; 2pq is two routes to a heterozygote; expected (dashed) against realised (solid). |
| L2 twist: unequal sexes | p_f = 0.9, p_m = 0.3 | Tap the triangle where the offspring will land. They land at 0.27/0.66/0.07, off the curve. Crank again with the offspring as parents: the next generation lands on the curve at p = 0.6. | One generation is enough only when the sexes start with equal allele frequencies. "It took two goes, not one." |
| L3 One generation (boss; Eq L7) | Three populations far off the curve: 32/0/8 (p = 0.8), 0/40/0 (p = 0.5), 10/0/30 (p = 0.25). Then a fourth, X-linked: females all AA, males all a | Tap where each next generation lands; crank to check. The realised dot is a sample of 400 that scatters around the exact ghost, and no text says "exactly". The X-linked population is the inversion. Only females are placed on the triangle (D4's X-linked HUD). Beneath it, p_f and p_m swap and halve their gap each generation (1, 0 → 0.5, 1 → 0.75, 0.5 …). The female dot reaches the curve only after several generations. | Hardy–Weinberg is a null model with conditions: an autosomal locus, equal sexes, discrete generations. This inverts L2: the rule that always worked fails for a gene on the X. The next unit is the Royal Line. |

**What if? buttons:**
- *"No stirring."* The tumbler stops mixing, so eggs pair with sperm from their own side of a layered chamber. Heterozygotes fall short: the deficit is the Census's subject.
- *"A hatch of 10."* Sampling noise swamps the square.

**Teaching panels.** At most three, each 35–60 words and shown after the picture has changed:
1. after the jars fill: copies, not beetles;
2. after the tiles collapse: why 2pq;
3. after the zigzag: the three conditions.

**Picture and live graph.**
- *Rung 0:* in L1 the beach is the chart: wing-case halves under the lens, beads in jars. In L2 the square fills with zygote dots in cells of width p and q.
- *Strip:* L1 shows a p|q stacked bar beside the looks bar. L2 shows the three genotype bars against dashed p², 2pq, q². L3 shows the triangle HUD, expanded to 240 px. The X-linked round adds the zigzag strip; males are one token with a Y bar and have no triangle point.

**Stars.**
- *Discover:* jars filled from at least 40 beetles; tiles collapsed; the unequal-sex population reached the curve in its second generation; the X-linked population missed the one-step landing.
- *Predict*, two of three:
  - p after the lens, within ±0.05 (the looks-only estimate is a commit gesture and is not scored);
  - the 400-pair bars, within ±0.04 each;
  - the three autosomal triangle taps, within 0.05 triangle units.
- *Transfer:*
  - "Hidden hoppers": from a new offspring tally (0.32/0.56/0.12), drag both hopper levels to 0.8 and 0.4, within ±0.08, in either order;
  - tap where the X-linked population will be in two generations.

**Access.** No reflex; untimed throughout. Extra keys: L lens, Tab cycles the beetles under the lens, Enter tags, ←/→ crank (hold).

**Teacher hook.** A class pool: each student's 40-pair square becomes one dot on the projected triangle. The cloud is wide at 40 pairs and tight at 400, so sampling noise becomes a class picture. Unit prompt: "A population sits on the curve. Is it evolving? What would you need to measure?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Beach swarm | N = 300, p = 0.3 | designed |
| Hoppers | infinite, drawn with replacement | designed (a real population of 40 draws without replacement) |
| Pairs per season | 40, 400 | designed |
| Unequal-sex values | 0.9, 0.3 | designed (R4) |
| X-linked males | hemizygous | realistic |

- *Key simplification:* the lens shows genotypes directly.
- *Cannot show:* overlapping generations, or how often real populations break the assumptions (that is the Census).

**In nature.** Hardy (1908, *Science* 28:49) answered Yule's 1908 remark that a dominant trait should rise to 3:1 (Edwards 2008, *Genetics* 179:1143). Yule's own 1902 paper had found the 1:2:1 equilibrium (R7-R4 B7). Weinberg derived the rule independently in 1908.

**Build and oracle.**
- *Code:* `v2/mixer.js`, a new id through `PLAN_ADD` in Act 3.
- *Ports from `equilibrium-hw/source/`:* `hwExp`, the jar effect (into D1's `GenePoolLens`) and the tile collapse.
- *Genetics:* a Gen `dom` locus seeds the swarm (`Gen.genome` with `over.p`). The sampled X-linked round uses Gen extension 3 (ploidy), and its ghost is the deterministic recursion.
- *Risk control:* if the crank fails the five-student boring flag in the Phase 1 scene lab (D2-7), swap in D2's alternative verb (sweep a net through a gamete cloud, a limited number of sweeps a season) on the same model.
- *Oracles:*
  - with p_f = p_m = p and 10⁵ pairs, shares fall within 0.005 of p², 2pq and q²;
  - 0.9/0.3 gives 0.27/0.66/0.07, then HW proportions at p = 0.6;
  - the X-linked gap ratio is −½ per generation, and p̄ = (2p_f + p_m)/3 is invariant.
- *Bot sweep:* "always tap the current HW point" passes the autosomal taps but cannot solve the hidden hoppers, so it stays below three stars.

### 3.2 Drift Casino (`casino`, host; absorbs Equilibrium L12–L13 and Castaways L1)

*Tier 1 · Act 4★ · the Lab table (bead jars, Buri's fly bottles: fruit-fly rig) and Beetle Isle (the volcano, the offshore islets: beetle rig) · L · Phase 1 slice · about 18 minutes · needs The Census (in the slice it opens after the Mixer).*

**Keep.**
- The casino frame, and the croupier's two wrong beliefs (every jar is a coin toss; every jar settles at one speed).
- The fan of traces.
- The predict-before-bet idea from `ch99.js`, now a gesture.
- Equilibrium L12's spreading lines ("the best visual in Equilibrium", R4) and L13's volcano.
- Castaways L1's storm and founding.
- R8's lecture insert, in which a class fan becomes a U-histogram.

**Fix.**
- Nothing happens between bets (R1).
- The three outcome buttons are a multiple-choice question in disguise.
- Fixation time is absent (G1).
- Ne is never played (G7 #3).
- L13 shows heterozygosity loss instead of allele loss, and its castaway choice is a free point (G7 #2; R7-R4 C6).
- L12's challenge rewards any N.
- The selection jars move to Lottery of the New, which owns the 2s rule (D2 §15).

**Role and felt cost.** The player is a gambler at the croupier's table and also the environment that shapes N: they can buy a volcano, a storm that kills males, a ferry. The felt cost is that **the house adapts**. When the player profits from a mispriced rule, the croupier reprices it, so the next profit needs the next concept. Each event card also doubles in price after use.

**Loops.**
- *Second:* drag chips from the stack onto outcome bins on the felt, either a histogram of final p or a "fixed by generation" timeline. Each chip lands with a clack and the payout line redraws within 200 ms. In play, tap an event card and then the jars it hits: beads vanish or arrive within 200 ms.
- *Minute:* one table. Place chips (this is the prediction). The rack runs 20–40 generations at about six a second, with a scrubber. Finished bottles lift and slide into the live histogram's bins (G6 step 2), and the chips pay out.
- *Level:* one new variable: the starting share; jar size and time; hidden Ne; founders; many alleles.

**Chips as calibrated prediction (D3's `Chips` widget, §9).** The chips are the player's probability distribution over the bins, paid by a quadratic proper-scoring rule, so the best play is to bet your true belief. The croupier posts naive odds, and you profit where your distribution beats his. Chips pay on the realised run, for fun. Stars score the chip distribution against the expectation (D2 §11).

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The croupier's coin (neutral rule) | 12 jars of 10 beads at 80% blue; 30 generations | Spread chips over blue, red and still mixed; the croupier pays evens on blue. About 80% of the bottles slide into "blue". | A neutral variant's chance of fixing equals its current share. "He priced 80% blue as a coin toss." |
| L2 Big jars, small jars (size and time) | Racks of 6, 20 and 200 beads at 50%; bins "fixed by generation 5, 10, 20, 40, or not by 40". The croupier now prices the neutral rule correctly | Chip the timeline for each rack and drag a "half fixed by" ghost. Six-bead jars settle within a few generations; 200-bead jars barely move. In play you may buy a volcano (a crash to 4) to make a long-odds bet on a big rack come true; the croupier then doubles its price. | Drift is fast when N is small: from 50:50 the mean time to fixation or loss is about 1.4N generations for N gene copies (−2N[p ln p + q ln q]), and H falls by a factor (1 − 1/N) a generation. "Big jars don't settle in my lifetime." |
| L3 Buri's bottles (Ne) | 107 bottles, each holding 8 male and 8 female fruit flies, eye-colour alleles at 50%; 19 generations. The croupier prices by 16 flies | Chip the generation-19 histogram. The real spread is wider and the U fills faster. Then the H line falls below the dashed 16-fly ghost and fits Ne ≈ 11.5. Three side tables follow, each opened by dragging an Ne marker on a size ruler: 36 females and 4 males (Ne = 14.4 of 40); a crash every fifth year (the harmonic mean); equalised families (Ne ≈ 2N). Event card: "a storm kills males". | Ne, not N, sets the pace of drift. "Sixteen flies drifted like eleven." |
| L4 The castaways (founders) | A beetle swarm on Beetle Isle at 50% amber; storms raft beetles to three empty islets | The first gesture, which is the old TRANSFER.castaways card: chip the starting share of a five-founder islet (0, 20 … 100%). Then hold to grow the storm (hold length sets the number rafted), release it over the swarm and found three islets. Bet which islets' commonest colour will differ from the mainland's. | A founding group is a sample, so the founder effect is drift in one step. "Five beetles can't be exactly half amber." |
| Boss: The volcano and the zoo (allelic richness) | A Beetle Isle population with 12 equally common alleles, drawn as 4 hues × solid, striped and dotted fills, lettered A–L (D4 rule 7). The volcano leaves 4 survivors. Then a zoo of 40 for 50 generations on a budget | Chip two quantities: heterozygosity after the crash, and alleles left. H keeps about 87% (1 − 1/8), while about 6 of the 12 alleles vanish. Then manage the zoo: drag pairs into breeding pens to equalise families, set the sex ratio, buy one migrant a decade. Scored on alleles kept. | Bottlenecks mainly strip allelic richness, and lost alleles return only by mutation or migration, slowly (Nei, Maruyama & Chakraborty 1975). This inverts L2–L3, where heterozygosity looked like the casualty. |

**Picture and live graph.**
- *Rung 0:* the rack is the chart. Beads sit in glass jars, and each finished bottle slides into its histogram bin, so the U-shape builds from the bottles themselves. Buri's flies show eye colour (his bw/bw⁷⁵ alleles), so genotype is readable. The volcano and the storm act on visible beetles.
- *Strip:* a fan of traces with a bold, pinned "you" jar and the dashed expectation; H against generations with the dashed (1 − 1/N)^t ghost. In the boss, two bars side by side: H (falls a little) and allele count (halves).

**Stars.**
- *Discover:* the U forms in Buri's rack; the volcano costs at least half the alleles while H stays above 80%; the zoo keeps at least 9 of 12 alleles in expectation under the player's policy (200 background replicates, so luck is removed).
- *Predict:* chip distributions beat a threshold quadratic score on at least two of the three scored tables (L1–L3). The threshold is set so that the croupier's odds fail.
- *Transfer:*
  - Ne markers within ±20% on two of the three side tables;
  - the boss's crash chips: H within ±0.08 and alleles within ±2.

**Access.** Untimed by default: a scrubber, and an optional pause after each generation. Extra keys: ←/→ select a bin, 1–5 place chips, E opens the event cards, Space runs or pauses.

**Teacher hook.** R8's lecture insert 1. Every student runs a jar of 10 on a shared seed range, and the lines pool into one fan, then a U-histogram (result codes until the Phase 3 server). "Freeze and ask" at generation 10. Unit prompt: "Buri kept 16 flies per bottle. Why did they drift like 11.5? Name two reasons."

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Jars | Wright–Fisher; beads are gene copies sampled with replacement | designed |
| Jar sizes; run length | 6–300 beads; 30–40 generations | designed |
| Buri's bottles | 107 bottles of 8 ♂ + 8 ♀, 19 generations; extra drift from unequal family sizes, with V_k tuned so Ne ≈ 11.5 | realistic (Buri 1956) |
| Ne formulas | 4NmNf/(Nm + Nf); harmonic mean; (4N − 2)/(V_k + 2) | exact |
| Boss | 12 equally common alleles; crash to 4 survivors | designed |

- *No selection:* that belongs to Lottery of the New.
- *No mutation:* a What if? adds a 10⁻⁴ floor (×N; real per-locus rates are 10⁻⁵ or lower) and shows lost alleles creeping back over thousands of generations.
- *Key simplification:* discrete generations; a bead is a copy, not an animal.
- *Cannot show:* selection and drift together (the next table is Lottery of the New).

**In nature.**
- Buri 1956 (*Evolution* 10:367).
- Kimura & Ohta 1969 (*Genetics* 61:763) on time to fixation.
- Frankham 1995: Ne/N ≈ 0.1 in wild populations.
- Northern elephant seals (Hoelzel et al. 1993) and cheetahs (O'Brien et al. 1985) as bottleneck cases.
- Nei, Maruyama & Chakraborty 1975.

**Build and oracle.**
- *Code:* `v2/casino.js` replaces `casino` (`CH_CASINO_V2` with `V2.push`).
- *Engine:* `v2/00_wf.js` (binomial and multinomial draws by inversion, D2's determinism rule); the `Chips` widget; Gen `dom` loci for Buri's flies; Gen extension 2 (multi-allele) for the boss.
- *Learning layer:* drop the `CH_CASINO.newTable` predict cards (re-implemented as chips); `delete TRANSFER.castaways` (now L4's first gesture); rewrite TAKE and MODEL; the `castaways` id passes to Genetic Rescue (§6.23).
- *Oracles:*
  - neutral fixation probability equals the starting share within 1% over 10⁴ seeds;
  - the mean absorption time from 0.5 is 1.39N ± 5%;
  - H decays as (1 − 1/N)^t;
  - with family-size variance V_k, realised Ne matches (4N − 2)/(V_k + 2) ± 5%;
  - a crash to 8 copies keeps 87.5% of H and 6.0 of 12 alleles in expectation.
- *Bot sweep:* "copy the croupier's odds", "uniform", "all on mixed", "all on the starting share" (right for L1 only) and "always buy the volcano" each stay below three stars.

---

## 4. Tier 2: the other spine rebuilds

### 4.1 Tree Thinking (`tree`, REBUILD, moved to Act 1)

*Tier 2 · Act 1★ · the Wood (moth rig: the player's own Act 0 population) and the Archive (silhouettes of whale, hippo, cow, pig, manatee, elephant) · M · Wave A · about 14 minutes · needs Act 0.*

**Keep.**
- Fitch parsimony on four-taxon trees: `steps()` is correct (R7-R3 TR1).
- The corrected "two SINEs" text (R7-R3 M14).

**Fix.**
- It is chapter 45 of 48 and a quiz (R8 L1).
- L1 is five questions, and L2 picks pairs from a list.
- Removing "lives in water" also removed the only convergence trap (G5).
- Rooting, outgroups and long-branch attraction are absent (R7-R3 TR2).

**Role and felt cost.** In L1 the player is the environment: they split the Wood's moth population by cutting clearings. After that they are an investigator with a budget for buying characters. The cost grows with the level (D2's ruling): more tips, fewer characters on offer, a rotation timer (a move counter in untimed mode).

**Loops.**
- *Second:*
  - drag a cut across the Wood map: a clearing opens, each side's moths take their own lineage colour, and a node appears on the growing tree within 200 ms;
  - tap a node to spin it (a 200 ms rotation);
  - drag a tip onto another to pair them; the parsimony step counter ticks.
- *Minute:* one tree. Grow or read it, make the gesture (tap the node you think is the most recent common ancestor, or drag the root pin), then the reveal.
- *Level:* a new trap each time: rotation, node counting, convergence, rooting, long branches.

The persistence idea is borrowed from the integrator's review: the tips are the player's resident Act 0 moths, so the first tree they read is one they made.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Your moths split | The resident Act 0 moths (canonical seed in teacher mode); five cuts over "2 Myr" (history compressed); lineages drift in wing band, antenna shape and a DNA marker | Cut the wood five times; the tree grows down the strip as you cut, with branch lengths in time. Before the reveal, tap the node you think joins the closest pair. | A tree records the order of splits, not resemblance, and every tip is equally modern. "My last cut made the closest pair." |
| L2 Same tree, new look | Pairs of drawings with spun nodes; a "ladder" drawing with one tip at the far right | Spin nodes until two drawings match (fewest moves scores). Tap the common ancestor of two tips that sit far apart on the page but are sisters. A node-counting trap: the tip with more nodes above it is not "more evolved". | Spinning a node changes nothing; reading across the tips is the ladder misconception (misconception 7). |
| L3 The convergence trap | Soot falls on two lineages that are not sisters (the player places it); both turn dark | From traits alone, drag tips into pairs; the live counter favours pairing the two dark lineages. Predict the tree, then buy up to four more characters (antenna, genital shape, an insertion marker). The reveal shows that your own soot made the resemblance. | Resemblance is not relatedness. Homoplasy misleads, and more independent characters recover the history. "I made them look alike." |
| L4 Where is the root? | An unrooted network of your lineages plus a distant outgroup moth | Drag the root pin onto a branch; the tree redraws and the ancestral states flip. Root it on the outgroup and drag the wing-band width you expect at the root. | Rooting sets the direction of time; an outgroup roots the tree. |
| Boss: Long branches | Two lineages evolving fast (long branches); a budget to sample extra tips | Parsimony pairs the long branches, and grows more confident as you add characters. Sample a tip that splits a long branch, or switch on the likelihood toggle, and the true tree returns. | This inverts "more characters always help": with long branches they can make parsimony more confidently wrong (Felsenstein 1978). |

**Transfer case** (inside the boss): whale, hippo, cow, pig, manatee, elephant.
- "Fully aquatic" and "flippers, no external hind limbs" pair the whale with the manatee.
- The double-pulley astragalus (present in fossil whales) and two SINE insertions pair the whale with the hippo.
- The player builds the tree. A real convergence supports the wrong pairing, and shared insertions decide (Nikaido, Rooney & Okada 1999; Thewissen et al. 2001). No character says "lives in water" (D0 §3).

**Picture and live graph.**
- *Rung 0:* the Wood map, where the player's cuts make the lineages; each lineage's moths stay visible in their patch and slide onto the tips (rung 1).
- *Strip:* the step counter and a characters × tips matrix (a table plate) that lights the characters each tree explains.

**Stars.**
- *Discover:* grew a tree from your own cuts; saw convergence mislead parsimony; recovered the long-branch tree.
- *Predict:* at least two of three: the L1 node tap, the L3 tree before buying characters, the L4 ancestral state.
- *Transfer:* the whale tree, and the boss solved within budget.

**Access.** Untimed. Extra keys: arrows walk nodes, Space spins, Enter pairs, R places the root pin.

**Teacher hook.** Projector "freeze and ask" on the ladder drawing: "Is the frog closer to the fish or to the human?" Unit prompt: "Your soot made two lineages look alike. In a real dataset, how would you find out?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Splits | the player's cuts | designed |
| Characters | two-state Markov changes at designed rates | ×10⁶ (history compressed) |
| Convergence | imposed by the soot | designed |
| Likelihood toggle | uses the true model | designed |

- *Cannot show:* incomplete lineage sorting (the Coalescent's boss) or hybridisation.

**In nature.**
- Baum, Smith & Donovan 2005 (the tree-thinking challenge); Gregory 2008; Meir et al. 2007.
- Felsenstein 1978 (long-branch attraction).
- Nikaido et al. 1999 (the SINE insertions); Thewissen et al. 2001 (the astragalus).

**Build and oracle.**
- *Code:* `v2/tree.js` replaces `tree`; D3's `TreeView` (spin, root, step count); Fitch parsimony from `ch28.js` `steps()`.
- *Persistence:* reads the Wood's resident snapshot, with pinned moths via Gen extension 5 (lineage tracking).
- *Oracles:*
  - Fitch counts are right for every topology of 4–6 taxa;
  - with the boss's branch lengths, parsimony picks the wrong tree in more than 50% of 1,000 seeds with 200 characters, and the likelihood toggle in under 10%.

### 4.2 Mendel's Garden (`mendel`, KEEP & POLISH)

*Tier 2 · Act 2★ · the Lab: Mendel's garden (pea rig; a sweet-pea flower variant) · M (D2 had S) · Wave A · about 14 minutes · needs Act 0.*

**Keep.**
- L1's carrier hunt, the best inference verb (D0 §2).
- L2's two genes and linkage, with a three-degree-of-freedom χ² (`ch7.js`).
- The evidence notes, and seeds growing in rows below.

**Fix.**
- A dominant strategy: test-cross everything with W, plus one purple × purple cross, for three stars (G1; R1).
- Ten seeds per cross hide sampling error.
- L2's sixteen seeds make the χ² only approximate (R7-R1 #16).
- `confNote` equates P(data | carrier) with confidence that a plant is pure (R7-R3 M30).
- No noise around 3:1, and no epistasis.

**Role and felt cost.** An investigator with a budget of seasons and scarce tester pollen: the white tester W has three flowers a season. The cost rises as genes are added, because more classes need more seeds.

**Loops.**
- *Second:* seeds sprout one at a time from a cross, about three a second. Each pop updates the likelihood meter for the plants involved within 200 ms, and the player can stop at any seed.
- *Minute:* one cross. Tap two plants, watch seeds pop, and stop when the meter is high enough; every further seed costs garden time.
- *Level:* a new rule each time: dominance, noise around 3:1, two genes and linkage, epistasis, an audit.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Pure or carrier | Six purple plants, 2–4 of them carriers (the prior is shown); W has three flowers a season; four seasons | Cross, watch the meter, stop; call each plant with a confidence slider (Brier-scored). A selfed carrier gives purple ¾ of the time per seed; purple × purple clears two plants at once when a white seed appears. | Hidden copies show only when two meet, and evidence builds seed by seed. Calls should be calibrated, not certain. |
| L2 Three to one, and its noise | Mendel's F₁ hybrids, selfed; n = 10, 50, 500 | Drag a band where the white share will land for each n. At n = 10 the band must be wide; at 500, narrow (Mendel's own 5,474 round to 1,850 wrinkled is 2.96 : 1). | 3 : 1 is an expectation, and small samples scatter around it. |
| L3 Two genes (legacy L2) | Four plants and tester T (white, wrinkled); 20 seeds per cross, raised from 16; in half the cases the genes are linked 8 cM apart | Cross and stop; call each gene and "linked or independent", each with a confidence (Brier-scored). Predict the four classes before the double-recessive test cross. | Independent assortment gives 1 : 1 : 1 : 1; linkage makes the two parental classes dominate. |
| L4 Two whites make purple | Sweet peas: two white lines whose F₁ is all purple | Drag the F₂ ratio bars, then grow 9 purple : 7 white. | Complementary gene action, an epistasis (Bateson, Saunders & Punnett 1905–06). |
| Boss: The tidy gardener | F₂ counts from ten gardeners | Drag each gardener's χ² dot onto the χ² histogram of many honest gardens. One gardener's counts sit far too close to 3 : 1. | This inverts "closer to 3 : 1 is better": real samples scatter, and too little scatter is suspicious. Whether Mendel's own data were "too good" (Fisher 1936) is Contested (Franklin et al. 2008). The star is for placing the dots, not for the accusation. |

**Picture and live graph.**
- *Rung 0:* the garden plot, where seeds grow into flowering plants in rows by class, so the plot is the tally.
- *Strip:* the likelihood meter for each plant (the posterior, with the prior stated) and the class bars against a dashed expected ratio.

**Stars.**
- *Discover:* all six L1 plants called with a Brier score of 0.10 or better; a 9 : 7 grown.
- *Predict:* at least two of three: the L2 bands (two of the three n values), the L3 classes, the L4 ratio.
- *Transfer:* the audit, plus a new prediction: snapdragon flower colour, an incomplete-dominance 1 : 2 : 1 cross the player has not seen.

**Access.** Untimed. Extra keys: Space stops sowing, 1–6 select plants, ←/→ set confidence.

**Teacher hook.** A class pool: everyone's n = 10 white share becomes one dot on a projected histogram centred on 0.25. Unit prompt: "Your carrier call reached 99%. Is that proof? What prior did you assume?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Carriers per set | 2–4, with the prior shown | designed |
| Seeds per cross | open; 20 in L3 | designed |
| Linkage distance | 8 cM | designed |
| Tester flowers | 3 a season | designed constraint |
| Sweet-pea epistasis | 9 : 7 | realistic (Bateson, Saunders & Punnett) |

- *Key simplification:* a plant gives as many seeds as you ask for.
- *Cannot show:* sex linkage (the Royal Line).

**In nature.** Mendel's 1866 counts; Bateson, Saunders & Punnett 1905–06; Fisher 1936; Franklin et al. 2008; Hartl & Fairbanks 2007.

**Build and oracle.**
- *Code:* `v2/mendel.js`, a new object replacing `mendel`, reusing `drawPea` and the `ch7.js` cross logic.
- *Learning layer:* the meter re-implements `CH_MENDEL.confNote` with an explicit prior.
- *Oracles:*
  - after k purple seeds from a W test cross, the posterior is π·0.5^k / (π·0.5^k + 1 − π);
  - the χ² values of honest gardens follow χ² with one degree of freedom.
- *Bot sweep:* "test-cross everything with W" runs out of tester flowers; "always sow 30 seeds" runs out of seasons. Neither earns three stars.

### 4.3 The Census (`census`, MERGE host; absorbs Equilibrium L8, L15, L17 and the Case Files)

*Tier 2 · Act 3★ · Beetle Isle (beetle rig, with codominant bands on the wing cases) · M · Wave A · about 15 minutes · needs The Mixer.*

**Keep.**
- Codominant counts, sampling by stratum, a correct p-value, the Wahlund deficit as 2Var(p), and F defined (R4 §4).
- D2 §5.2's design: one detective with an evidence budget, built on D1's `Evidence` widget.

**Fix.**
- The play is clicking buttons and reading a stats line (R1).
- It diagnosed heterozygote advantage before selection had been taught (R8's sequencing bug).
- Power is never felt (R7-R4 B31).
- Real-data causes such as null alleles and genotyping error are missing (G1).
- The Case Files state their own answers (R4), and each label is used once (G7 #4).
- There is no dominant-trait dataset (G7 #8).
- "A good fit means nothing is happening" must go (R7-R1 #2).

**Role and felt cost.** An investigator with a field-day budget. The cost grows with the level: smaller budgets, subtler effects, and more hidden causes that look alike.

**Loops.**
- *Second:* drag the quadrat across the beach. Each beetle inside is genotyped in turn, about eight a second; its token drops into the observed AA, Aa and aa bars against the dashed expectation, and the power meter rises, all within 200 ms. The field-day clock ticks.
- *Minute:* one case. Choose instruments (split by region, split by age, a second marker, re-genotyping, counting arrivals), sample, then diagnose with a confidence slider. The diagnosis is Brier-scored against the posterior given the evidence bought.
- *Level:* new hidden causes and new instruments.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Read the census | A true fit at n = 40 and at n = 3,000; an inbred colony (F = 0.2); a low-power trap (F = 0.2 at n = 40, power about 0.20) | Before sampling, drag the expected Aa bar from the colony's p. Sample, then call "fits" or "deficit" with a confidence. A year-split shows one fitting colony whose p moved between years. | Hardy–Weinberg is a null model, and power depends on n. A fit does not mean nothing changed: "something moved p, and HW cannot say what". |
| L2 Find the cause | One hidden cause per case, drawn at random at realistic strength: none; relatives mating (a deficit at every locus, stratum and age); pooled demes (each deme fits, the pool shows 2Var(p)); a null allele or allelic dropout (a deficit at one marker only) | Within 10 field days, buy instruments: split by region, by age, genotype a second unlinked marker, re-genotype a sample. Diagnose with a confidence. | Each cause leaves a fingerprint: everywhere (relatives), only when pooled (Wahlund), one marker only (an artefact). The Pedigree names F next. |
| L3 Looks only | A dominant trait (blue A_ against amber aa); only phenotypes can be counted | Estimate q from the amber share (q = √aa), then try to test Hardy–Weinberg: it cannot be done, because no degrees of freedom are left. | Some estimates must assume Hardy–Weinberg. Hands over to Invisible Carriers. |
| Boss: Two hidden demes | A deficit at both markers and in every age class, so it looks like inbreeding; the deme boundary follows a hidden line, not north–south | Draw the boundary with the boundary tool; each redraw costs a day. On each side of the right line the samples fit, and the deficit vanishes (2Var(p) = 0.125 for demes at 0.25 and 0.75). | This inverts L2's rule that "everywhere means relatives": structure mimics inbreeding until you find the line (Wahlund 1928). |

**Picture and live graph.**
- *Rung 0:* the beach. Genotyped beetles keep their wing-case halves showing (AA dark on both halves, Aa split, aa pale), so the sample is a visible patch on the map, and the boss's boundary is drawn on the sand.
- *Strip:* observed bars against dashed Hardy–Weinberg proportions; F with a confidence band; the power meter. In the boss, one triangle dot for each side of the player's line.

**Stars.**
- *Discover:* at least four of five L2 cases right, with a Brier score of 0.15 or better; the boss boundary found within two days.
- *Predict:* the Aa bar from p (two of three cases within ±0.05); the boss deficit predicted from the two sides' frequencies (±0.03).
- *Transfer:* the L3 looks-only estimate within ±0.03, and the boss.

**Access.** Untimed: the quadrat samples at the player's pace. Extra keys: arrows move the quadrat, Enter samples, I opens the instruments, ←/→ set confidence.

**Teacher hook.** R8's lecture insert 2: half the room samples 40 beetles and half 4,000 from one mildly inbred population, and they compare p-values. Unit prompt: "Your sample fits Hardy–Weinberg perfectly. Name two forces that could still be acting."

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Population | 30,000 | designed |
| F | 0.05–0.3 | realistic range |
| Deme frequencies | 0.25 and 0.75 | designed |
| Null alleles; dropout | 0.05–0.15; 5% | realistic orders for microsatellites (verify) |
| Costs | in field days | designed |

- *Key simplification:* genotypes are read without error unless the dropout cause is drawn.
- *Excluded:* selection waits for Malaria Coast, and drift leaves no lasting departure (D2 §5).

**In nature.**
- Hardy and Weinberg 1908; Wahlund 1928.
- Sheppard 1952 (scarlet tiger moth; the counts are pooled across years, R7-R4 C13).
- Lewontin & Cockerham 1959 (Hardy–Weinberg tests detect only strong viability selection).
- Dakin & Avise 2004 (null alleles).

**Build and oracle.**
- *Code:* `v2/census.js` replaces `census`; D1's `Evidence`; D3's `DemeMap` for the boss; two Gen `dom` loci read codominantly; Gen extension 2 for the null allele (a third allele that reads as "missing").
- *Oracles:*
  - F̂ = 1 − H_o/H_e;
  - the pooled deficit equals 2Var(p) within 0.005 over 10⁴ draws;
  - the power table matches R7-R4 B31 (n = 40, F = 0.2 gives 0.20; n = 30,000, F = 0.02 gives 0.92).
- *Bot sweep:* "always call a deficit", "buy every instrument" (runs out of days) and "always blame relatives" each stay below three stars.

### 4.4 Why Sex? (`sex`, REBUILD, moved to Act 7)

*Tier 2 · Act 7★ · the Lake shallows (new mud-snail rig; trematode larvae as cursor tokens) · M · Wave A · about 15 minutes · needs Act 5 (D2); Lock and Key, whose parasite model it reuses, is the suggested prior unit (a callback edge).*

**Keep.**
- The Muller's-ratchet histogram with its left-edge marker.
- The Fisher–Muller combination of two beneficial alleles.
- *Potamopyrgus* in the text.

**Fix.**
- The player switches the whole pond's mode, so the twofold cost and every benefit become group choices (R1; G1).
- The twofold cost is not real while mean fitness is above 0.4, because of the `slice(0, K)` ceiling (R7-R1 #5).
- L2 is called a parasite level but models Fisher–Muller (R1).
- There is no coevolving parasite (G1).
- The verb is a two-button toggle.

**Role and felt cost.** The player is a trematode larva: a behaving animal whose goal is infection, and a selective agent. Each tap uses the next larva in the queue, whose key is drawn from the parasite population; the player chooses which snail to try, never which key. The felt cost grows as the snails adapt: as they shift away from the common keys, matches get harder to find, and after the clone feast the target keeps moving.

**Loops.**
- *Second:* the current larva's key letter shows at the cursor; tap a snail. A match clouds its shell and a ring blooms: the snail is infected and castrated. A mismatch bounces off: the larva is lost and half a second passes. Both happen within 200 ms.
- *Minute:* one season of about 25 s. Then the snails breed (sexual mothers make half sons, drawn with a pointed shell tip; clone mothers make only daughters), and the keys that infected multiply.
- *Level:* one new force each time: the clone, key evolution, mutation load, beneficial mutations, geography.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Twice the daughters | A sexual pond of 200; one clone female appears; keys drawn at random (a naive parasite strain) | Drag the clone share after 15 generations. Infect as you like: random keys cannot slow the clone, which roughly doubles its share each generation at first. | The twofold cost of sex: a clone wastes nothing on sons. "Sex should lose." |
| L2 The tracking parasite | Keys now evolve: keys that infect multiply (Lock and Key's model, as a callback) | Tap the generation when the clone will peak. As the clone grows common, its single lock becomes your easiest target, your keys pile onto it, and it crashes; the sexual snails reshuffle their locks and persist. | The Red Queen: rare genotypes escape, and sex makes rare genotypes every generation (Hamilton 1980). |
| L3 The ratchet | A small spring pond (N = 40); harmful mutations at U = 0.5 per birth (shells brown with load); random keys again | Drag where the clone line's histogram edge will be after 60 generations. The edge clicks to the right; the sexual line keeps rebuilding lightly loaded snails. | Muller's ratchet: in a small population an asexual line cannot rebuild its best class. |
| L4 Two good mutations | Heat-tolerance alleles H1 and H2 arise, at a ×N rate, in different snails | Drag the predicted wait for the first H1H2 snail in the sexual line and in the clone line. Sex brings them together early; the clone waits for both in one line. | Fisher–Muller: recombination assembles beneficial mutations. |
| Boss: The lakes | A map of six lakes with different larva densities | Drag the predicted share of sexual snails in each lake. Then play the densest and the emptiest: where larvae are rare, clones win. | This inverts "sex always wins": where the Red Queen sleeps, clones take over (Lively 1987). |

**Picture and live graph.**
- *Rung 0:* the shallows full of snails. Locks are four hues with letters on the shell (D4 rule 7); clones share one exact pattern; sons have pointed tips; load is shell browning (luminance, not hue).
- *Strip:* two lines, the clone share and the share of keys that fit the clone's lock, against a dashed "no parasites" ghost; a stacked bar of the four lock frequencies; in L3, the load histogram with the ratchet marker.

**Stars.**
- *Discover:* the clone took over in L1 and crashed in L2; the ratchet clicked.
- *Predict:* at least two of three: the clone share at 15 generations (±15 points), the peak generation (±4), the ratchet edge (±2 classes).
- *Transfer:* the lake map within ±15 points in four of six lakes, and infections above the line in the boss's dense lake.

**Access.** Untimed mode: each season freezes and the player places 15 larva tokens without a clock; matching is unchanged. Extra keys: arrows move between the nearest snails, Enter infects.

**Teacher hook.** Half the room plays a lake with tracking keys and half without; the class pool shows the clone's fate side by side. Unit prompt: "A clone loses nothing to sons. Give two reasons it can still lose."

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Locks and keys | matching alleles, 4 of each | designed |
| Mutation/migration floor | 1% a season | designed (D0 guardrail for matching-allele cycles) |
| Infection | castrates the snail | realistic for *Microphallus* |
| Pond size | 200 (40 in L3) | designed |
| Load | U = 0.5, s = 0.06 a mutation | designed (legacy values) |
| Beneficial mutation rate | — | ×N |
| Sons from sexual mothers | 50% | realistic |
| Density regulation | lottery for space, so the twofold cost bites | designed (fixes R7-R1 #5) |

- *Cannot show:* why some ancient asexual lineages persist (bdelloid rotifers; Contested).

**In nature.**
- Lively 1987 (*Nature* 328:519).
- Jokela, Dybdahl & Lively 2009: common clones declined as parasites tracked them.
- Morran et al. 2011: in *C. elegans*, outcrossing persisted only with a coevolving parasite.
- Muller 1964; Felsenstein 1974; Kondrashov's deterministic hypothesis (Contested).

**Build and oracle.**
- *Code:* `v2/sex.js` replaces `sex`; it shares a parasite module with Lock and Key (`v2/03_redqueen.js`).
- *Genetics:* Gen extension 2 for the lock locus; a new `Gen.clone(lay, g)`, a plain copy called only by v2 code; count loci for load.
- *Oracles:*
  - without parasites, the clone share follows the twofold logistic within 5%;
  - with tracking keys at high infectivity, sexual snails persist in at least 80% of 200 seeds;
  - the ratchet's click rate at N = 40, U = 0.5, s = 0.06 matches the legacy model.
- *Bot sweep:* "tap the nearest snail" and "tap only clones" both fail the predictions.

### 4.5 The Commons (`commons`, MERGE with TB Commons; gains the siderophore boss)

*Tier 2 · Act 8★ · the Pond (microbe mats; the microbe-cell rig shared with the Clinic) and the Lab (broth flasks, D4's Petri scene) · M · Wave A · about 15 minutes · needs Acts 6 and 7 (D2); Alarm Call is the suggested prior unit.*

**Keep.**
- EF L1's four jars: Simpson's paradox and the Price partition (R7-R2 A46).
- TB's haystack model and its live Price bars ("the single best piece of conceptual visualisation", R4).
- Floods as a real timing decision.

**Fix.**
- EF L2 teaches weak altruism as altruism (R7-R2 A47).
- The Notes print b/k > c.
- There is no self-benefit dial (G4).
- Chuang et al.'s public good is mis-described (R7-R2 A51).
- The bridge card implies that random grouping can stand in for kinship (R7-R2 #6).

**Role and felt cost.** The player is the environment that sets population structure: founders per pond, mixing by rain, floods that pool and reseed. They never set the strategy. The in-world goal is the fermenter's yield, because the producers' enzyme feeds everyone. The felt cost is that cheats re-invade every pond from within. As producers rise, the player must reseed more often, and each reseed costs a generation of yield.

**Loops.**
- *Second:*
  - tap and hold a pond to flood and reseed it; hold length sets the number of founders, from 2 to 12;
  - drag the rain cloud over ponds: cells drift between ponds where it passes.

  The Price bars tick within 200 ms.
- *Minute:* one generation. Ponds grow, the good spreads as glow, cheats gain within each pond, and ponds export in proportion to their size. The yield meter fills.
- *Level:* one new structural variable.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Four jars (EF L1) | Four hand-assorted jars (90, 60, 35, 10% producers) | Drag the within-jar arrows and the overall arrow before growth. Drag each jar into the pooled flask: producers fall in every jar yet rise overall (48.75% to 53.7%), and the two Price bars build from the jars. | Simpson's paradox: selection between groups can beat selection within them. |
| L2 The fermenter ponds (TB model) | 12 ponds; rain 30%; self-benefit on (the good returns to its maker with weight 1/k) | Keep yield above the line for 60 generations by timing floods and setting founders. First drag where producers will end if you never flood. | Few founders mean large differences between ponds, and rain erases them. With self-benefit this is weak altruism: the good partly repays its maker. |
| L3 No gift to yourself | The self-benefit dial at zero | Drag the producer share you expect after 40 generations of random founding. Run it: producers always fall. Switch to "kin pods", where each pond's founders come from one parent pond: producers spread once relatedness is high enough. | Strong altruism needs assortment beyond chance (West, Griffin & Gardner 2007), and relatives are its usual source. |
| Boss: Iron (siderophores, moved here from the Cleaning Station) | *Pseudomonas* producers and cheats in broth; the player sets the shaking and whether cells compete locally or across the whole flask | Predict the producer share in shaken and in viscous broth. Shaken: cheats win. Viscous with flask-wide competition: producers win. Viscous with local competition: relatives compete with relatives and the benefit cancels. | This inverts "more structure always helps cooperation": local competition among kin can cancel the kin benefit (Taylor 1992; Griffin, West & Buckling 2004). |

**Picture and live graph.**
- *Rung 0:* ponds and flasks where producers glow and the spreading good is a visible halo. Cheats are hollow (D4's filled-versus-hollow rule; no red/green).
- *Strip:* the Price bars (between groups solid, within hatched, total in ink) and the producer share against a dashed "no floods" ghost.

**Stars.**
- *Discover:* yield held for 60 generations; with zero self-benefit, producers spread only under kin pods.
- *Predict:* at least two of three: the L1 arrows, the L2 "never flood" endpoint, the boss's shaken and viscous outcomes.
- *Transfer:* the local-competition case in the boss.

**Access.** Untimed: Space steps a generation, Enter floods the selected pond. Extra keys: arrows select ponds, F floods, R moves the rain.

**Teacher hook.** A class pool of yield curves under different flood policies on one shared seed. Unit prompt: "Your producers spread. Was that altruism? What would you change to find out?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Ponds | 12 | designed |
| Producer cost and benefit | c = 0.05, b = 0.8 | designed |
| Self-benefit | 1/k, or 0 | designed switch |
| Rain | 0–40% | designed |
| Founders | 2–12 | designed |
| Broth | shaking and competition scale | designed, qualitative fit to Griffin et al. 2004 and Kümmerli et al. 2009 |

- *Key simplification:* one public good and clonal cells.
- *Cannot show:* policing or privatisation (named in "In nature").

**In nature.**
- Maynard Smith 1964 (the haystack model); Price 1970, 1972.
- Griffin, West & Buckling 2004 (*Nature* 430:1024); Kümmerli et al. 2009, who raised viscosity with agar.
- Chuang, Rivoire & Leibler 2009: a quorum signal that switches on antibiotic resistance in every cell, producer or not.
- Gore, Youk & van Oudenaarden 2009 (invertase as a snowdrift game).

**Build and oracle.**
- *Code:* `v2/commons.js` replaces `commons`. It ports the Commons model from `tangled-bank/source/steward.js`, uses D1's `PriceBars`, and keeps EF L1 from `ch22.js`.
- *Learning layer:* the bridge card becomes "In Alarm Call, relatedness made helping pay. What if a helper's good also comes back to itself?" (R7-R2 #6).
- *Oracles:*
  - the Price terms sum exactly to Δp̄;
  - with zero self-benefit and binomial founding, producers never spread across 1,000 seeds;
  - with kin pods they spread when rb > c.
- *Bot sweep:* "flood every generation" (wrecks yield), "never flood" and "always 2 founders" each stay below three stars.

### 4.6 The Coalescent (`coal`, REBUILD, moved to Act 9)

*Tier 2 · Act 9★ · Beetle Isle (the player's resident beetles, whose parentage the game has logged since Act 3) and the Archive (human, chimpanzee, gorilla) · M · Wave A · about 15 minutes · needs Drift Casino.*

**Keep.**
- The numbers: a pair merges after about N generations, a sample of n after about 2N(1 − 1/n).
- Three demographic histories.
- The caveat that a sweep can mimic an expansion.

**Fix.**
- It came before drift (R8).
- Play is guess with a slider, then watch (R1).
- No mutations on branches (G1).
- L3 is a labelling quiz (R1; R3).

**Role and felt cost.** An investigator tracing genealogies and reading alignments. The cost grows with the level: more lineages to trace, a tracing-ink budget, and finally alignments with no tree.

**Loops.**
- *Second:* drag a present-day beetle's lineage upward. At each generation its parent lights up and the line snaps to it within 200 ms; when two lineages pick the same parent they merge with a click.
- *Minute:* one genealogy. Predict (a ghost line for the merge depth, or a needle for a statistic), trace or drop mutations, reveal.
- *Level:* one new observable.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Two lineages | Two of your beetles, in a population of N = 30 gene copies | Drag the ghost line where they will meet, then trace. Five pairs make a spread of merge times, exponential with a mean near N. | Coalescence, and a wide spread is normal. |
| L2 The whole sample | Ten lineages | Predict the depth of the whole tree. Most merges come fast; the last pair takes about half the depth (2N(1 − 1/n) ≈ 54 for N = 30, n = 10). | Half of every tree is the wait for its last merge. |
| L3 Mutations on branches | Mutations fall on the traced branches as sparks; an alignment builds beside the tree | Predict the number of segregating sites, S. Then the site frequency spectrum (SFS) forms from the tree: long outer branches make singletons. | We never see the tree; we read the mutations on it. |
| L4 Read the history | Three alignments with no tree (steady, recent expansion, recent bottleneck) plus one sweep decoy near a gene | Drag a Tajima's D needle for each, then reveal the trees. Expansion gives excess singletons (D below 0); a recent bottleneck gives D above 0; the sweep gives D below 0 only near its gene. | History shapes trees, and a local signal is not a genome-wide history (a callback to The Sweep). |
| Boss: Gene trees and species trees | Human, chimp and gorilla as three "pipes" whose widths are ancestral population sizes | Drag lineages back through the pipes. In a wide ancestral pipe they fail to merge before the next split. Predict the share of gene trees that disagree with the species tree. | This inverts "every gene tells the species story": in about 30% of the genome, gorilla is closer to human or to chimp than those two are to each other (Scally et al. 2012). |

**Picture and live graph.**
- *Rung 0:* the beetles themselves at the bottom of the screen, with their logged ancestors in faded rows above, a Wright–Fisher grid made of past beetles. A counter reads "214 generations since you arrived" (D2's persistence rule).
- *Strip:* merge times against the dashed N; S against θΣ1/i; the SFS against the neutral ghost; the Tajima's D needle.

**Stars.**
- *Discover:* traced a full sample; saw the SFS form; saw discordant gene trees.
- *Predict:* at least two of three: L1 merges (geometric mean within ×1.5), S (±30%), the three D signs.
- *Transfer:* the boss's discordant share within ±10 points.

**Access.** Untimed. Extra keys: ↑ traces the selected lineage one generation, Tab cycles lineages.

**Teacher hook.** Each student's five pair-merge times join one projected histogram, which comes out exponential. Unit prompt: "Your D came out negative. Name two histories that could do that, and a test that tells them apart."

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Lineage tracing | Wright–Fisher, haploid, N = 30 copies | designed (real analyses use Ne and many loci) |
| θ | — | designed |
| Histories | expansion ×10; bottleneck to 3 | designed |
| Sites | infinite-sites model | designed |
| Species pipes | widths tuned to about 30% discordance | designed, matched to Scally et al. 2012 |

- *Cannot show:* recombination within a locus (each locus is one tree).

**In nature.** Kingman 1982; Tajima 1989; Hudson 1983; Scally et al. 2012 (*Nature* 483:169).

**Build and oracle.**
- *Code:* `v2/coal.js` replaces `coal`. It uses `v2/00_wf.js`, Gen extension 5 (lineage tracking, which logs the resident beetles' parents), `TreeView`, and an alignment plate drawn in GenomeStrip's track style (D4 to confirm).
- *Oracles:*
  - the expected pair merge time is N ± 5%;
  - the expected sample depth is 2N(1 − 1/n);
  - E[S] = θΣ1/i;
  - mean D is within ±0.1 of zero over 1,000 seeds at constant N;
  - discordance is ⅔e^(−T) ± 2 points.

### 4.7 The River (`river`, REBUILD)

*Tier 2 · Act 10★ · the Streams (guppy rig for the river populations; a new frog rig for the contact zone) · M · Wave A · about 15 minutes · needs Acts 1, 4 and 5.*

**Keep.**
- The Orr snowball: incompatibilities grow roughly as k² (R7-R3 RV2). It stays Contested.
- The frog's choice by call.

**Fix.**
- L1 is an optimal-stopping problem with little to see (R3).
- L2's call divergence is scripted (`d = 3 × overlap`) and ignores the player's choices (G4).
- Reinforcement has to come from heritable preference.
- "Six generations" was implausibly fast (G4 review).

**Role and felt cost.** In L1 and the boss the player is the environment: the river's level at the ford. In L2–L3 the player is a female frog, a behaving animal, and then her preference rule becomes an allele (the invasion view). The felt cost:
- in L1, a contact made too early fuses the banks;
- in L2, a mating with the wrong species gives a clutch that visibly fails, and the nights grow noisier.

**Loops.**
- *Second:*
  - L1: hold to keep the ford flooded, release to let migrants wade. Hybrid fry hatch mid-river, and wherever a west–east glyph pair clashes they flash and fade within 200 ms.
  - L2: males call around you (pitch shown by the spacing of rings from the vocal sac). Hop toward one within 2 s; the clutch hatches or fails.
- *Minute:*
  - L1: one epoch. Each bank fixes new glyph mutations (sparks), the clash grid lights up, then you choose whether to allow contact.
  - L2: one night. Choose a mate; then the night jumps many generations ahead.
- *Level:* one new variable.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The snowball (Contested) | Two banks; each epoch each bank fixes a new glyph; each new glyph clashes with each glyph on the other bank with probability 0.15 | Drag a curve through your predicted clash counts for epochs 1–8 (straight, or bending upward?) and mark the epoch when hybrid survival will fall below 20%. Release the ford when you judge it safe; too early and the banks fuse (Interesting result). | Dobzhansky–Muller incompatibilities snowball roughly with k² (Orr 1995; how strongly is Contested). |
| L2 The frog's ear | A contact zone where the two species' call pitches overlap; hybrid clutches fail | Choose mates by call over six nights; each failed clutch costs you. | Mating with the wrong species has a cost. |
| L3 Your ear as a gene | Invasion view: your fitted preference rule seeds a lineage among AI females; call pitch and preference both inherited; an allopatric control population | Drag the call-pitch gap you expect, after many generations, in the contact zone and in allopatry (two markers). It grows larger in the contact zone, because preference and call become associated. | Reinforcement: selection against hybrids strengthens preference and drives reproductive character displacement (Hoskin et al. 2005). |
| Boss: Haldane's rule | An incompatibility pair on the X | Predict which hybrid sex fails first by dragging two viability bars. Males (XY) fail first: recessive X-linked clash partners are exposed in the sex with one X. | This inverts "hybrids are uniformly unfit": isolation shows first in the heterogametic sex (Haldane 1922; a callback to the Royal Line). |

**Picture and live graph.**
- *Rung 0:* the two banks, with guppies wearing glyph badges and hybrid fry as a visible zone in the river that flashes and greys. The clash grid (west glyphs × east glyphs) is drawn as the riverbed. Frogs sit at the pond edge with their call rings.
- *Strip:* clash count against dashed straight-line and k² ghosts; hybrid survival; call-pitch distributions in sympatry and allopatry.

**Stars.**
- *Discover:* the banks speciated without fusing; calls diverged more in sympatry.
- *Predict:* at least two of three: the curve's shape, the threshold epoch (±2), the L3 gaps (±25%).
- *Transfer:* the boss, plus a birds case: in ZW species, drag which sex fails first (females).

**Access.** Untimed: each night waits for your choice. Extra keys: ←/→ select a caller, Enter hops, hold Space for the ford.

**Teacher hook.** A class pool of everyone's preference-allele trajectories, and a projector "freeze and ask" before the release. Unit prompt: "Why might reinforcement fail if migrants keep arriving from allopatric populations?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Clash probability | 0.15 per pair | designed (legacy) |
| Hybrid survival | 0.55^clashes | designed (legacy) |
| Species threshold | survival below 20% | designed |
| Call and preference heritability | — | designed |
| Generations per night | many | ×N |
| X-linked clash | one pair | designed |

- *Cannot show:* ecological speciation (Two Fruits) or polyploid speciation (Doubling).

**In nature.**
- Orr 1995; Matute, Butler & Coyne 2010 (the snowball in *Drosophila*); Moyle & Nakazato 2010 (in *Solanum*).
- Hoskin et al. 2005 (*Litoria* tree frogs).
- Haldane 1922; Coyne & Orr 2004.

**Build and oracle.**
- *Code:* `v2/river.js` replaces `river`, keeping `ch6.js`'s incompatibility test. New frog rig. The invasion view runs on `v2/00_wf.js`; the X-linked clash uses Gen extension 3.
- *Oracles:*
  - expected clashes after k glyphs per bank are 0.15k² ± 10%;
  - the preference allele rises only in sympatry with unfit hybrids, and drifts when hybrids are fertile;
  - hemizygous hybrids fail first in at least 90% of seeds.

### 4.8 The Archipelago (`arch`, REBUILD)

*Tier 2 · Act 10★ · the Outer Islands (finch rig) and the Lake (cichlid rig) · L · Wave A · about 18 minutes · needs Acts 1, 4 and 5.*

**Keep.**
- Gaussian utilisation (width 1.5 mm) against island seed curves.
- Character displacement in 2004–05 (Grant & Grant 2006).
- The Big Bird lineage (Lamichhaney et al. 2018).

**Fix.**
- It is a radiation without radiating (R3).
- The player sets the beak, which is RC2 (R8).
- L2 is a quiz.
- It overlapped Seed Rain (integrator). The split is now clean: Seed Rain is one population and the shapes of selection; the Archipelago is many islands, with colonisation, displacement, hybridisation and collapse. Its verb is the wind, not the seeds.

**Role and felt cost.** The player is the environment: the storms that carry finches. The in-world currency is the share of the archipelago's seed crop that finches eat (niches filled). The felt cost:
- the storms that seeded the radiation later bring migrants that blur it;
- each storm comes from a seasonal budget;
- in the boss, runoff keeps rising.

**Loops.**
- *Second:*
  - drag a storm path from one island to another; finches lift along it within 200 ms, more for a stronger path;
  - in the boss, tap algal blooms to clear them, at a cost.
- *Minute:* one epoch (history compressed). Finches feed (beaks visibly crack seeds) and breed with mating assortative by beak and song; the beak histograms move.
- *Level:* one new process.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 First landfall | One island whose seed curve peaks at 9 mm | Storm in a founding flock and drag the mean beak expected after 20 epochs. | Adaptation to a seed curve. |
| L2 Two islands, two foods | A second island peaking at 13 mm | Colonise it and predict the divergence; too many storms swamp it (Interesting result). | Divergence needs isolation stronger than gene flow (a callback to Gene Swamping). |
| L3 Neighbours | A large-beaked competitor arrives on island 2 during a drought | Drag the residents' mean beak depth after the drought. They shift to smaller beaks. | Character displacement (Grant & Grant 2006). |
| L4 Big Bird | One large immigrant male of hybrid ancestry lands on Daphne | Drag the size you expect his lineage to reach in six generations (zero would mean it merged). It mates within itself by song and beak, and persists. | Hybridisation can found a lineage (Lamichhaney et al. 2018). |
| Boss: Turbid water | Lake cichlids: eight colour species kept apart by female choice; farm runoff rises | Clear blooms from a budget to keep the water clear. As turbidity rises, females cannot see colour and the species merge into hybrid swarms. Predict the species count at three turbidity levels. | This inverts "radiations only grow": speciation is reversible when the isolating signal fails (Seehausen, van Alphen & Witte 1997). |

**Picture and live graph.**
- *Rung 0:* islands with finches whose beaks are drawn to scale cracking visible seeds; each island's beak histogram is the crowd of birds on its beach. In the lake, cichlid colours carry a pattern as a second channel.
- *Strip:* beak histograms per island against the seed curves; the share of the seed crop eaten; the species count.

**Stars.**
- *Discover:* at least four beak types persisting; the Big Bird lineage persisting; the boss's collapse witnessed.
- *Predict:* at least two of three: the L1 mean (±0.5 mm), the L3 mean (±0.5 mm), the L4 lineage size (±30%).
- *Transfer:* the boss's species counts within ±1 at two of the three turbidities.

**Access.** Untimed. Storms are drawn with the arrow keys between islands and confirmed with Enter; blooms are selected and cleared the same way.

**Teacher hook.** A class pool of radiations from one seed set under different storm policies: the number of beak types against storms per epoch. Unit prompt: "Your archipelago made six beak types. Are they six species? What evidence would you want?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Utilisation width | 1.5 mm | designed (legacy) |
| Seed curves | — | designed |
| Assortative mating | by beak and song | designed |
| Epoch length | about 40,000 years | history compressed |
| Turbidity and choice | — | designed, qualitative |

- *Cannot show:* genomic islands (the Islands of Divergence side quest).

**In nature.** Grant & Grant 2006 (*Science* 313:224); Lamichhaney et al. 2018 (*Science* 359:224); Seehausen, van Alphen & Witte 1997 (*Science* 277:1808); Schluter 2000.

**Build and oracle.**
- *Code:* `v2/arch.js` replaces `arch`. It uses Gen additive beak loci, `DemeMap`, and a mate-choice function (no Gen change).
- *Oracles:*
  - the one-island response matches R = h²S;
  - swamping sets in above m ≈ s;
  - displacement emerges with shared seeds in at least 80% of seeds;
  - the turbidity threshold is reproducible.

---

## 5. Tier 3: the P0 games and the P0 hosts

### 5.1 The Scribe (`scribe`, REBUILD)

*Tier 3 · Act 2★ · the Lab (D4's Petri scene; microbe-cell rig; phage drawn as small hexagonal heads) · M · Wave A · about 15 minutes · needs Act 0.*

**Keep.**
- The point that mutations have several sources: copying errors, DNA damage and faulty repair (the G1 text fix).
- A codon inset (silent, missense, nonsense, frameshift) as a zoom bubble in L1.

**Fix.**
- It is a typing test whose success means making no mutations (R1; G2 #7).
- "Slipping when slow" misrepresents polymerase slippage, which depends on sequence, not speed.
- "Works if ≤1 missense" is arbitrary.
- No distribution of fitness effects (DFE), and nothing shows that mutation is random with respect to need (R8 B3; misconceptions 5 and 16).

**Role and felt cost.** An experimenter with a bench budget (tags, tubes, plates) who never places a mutation. The cost grows: sparks come faster as colonies grow, and later levels give fewer plates.

**Loops.**
- *Second:*
  - L1: tap a mutation spark within 1 s of its flash to tag it; the ring locks with a tick within 200 ms.
  - L2: drag a tube onto a phage plate; its colonies bloom within 200 ms.
  - L3: hold the velvet on the master plate, then drag it onto a drug plate; identical spots appear.
- *Minute:* one plate's growth (about 40 s), one set of 20 tubes, or one stamping round.
- *Level:* one new instrument.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The necklace (the DFE) | Cells divide on a plate. Any division may drop a spark at a random bead of the cell's gene "necklace", and sparks look the same whatever their effect (D4) | First drag the shape of the DFE (bars for lethal, harmful, neutral, beneficial). Tag 30 sparks. Each tagged lineage shows its fate over the next seconds: it stops and greys, slows, keeps pace, or races ahead. The histogram fills from your tags. | Mutations are blind to need. Most are neutral or harmful, and winners are rare. "Most of my sparks did nothing, or harm." |
| L2 Jackpots (Luria–Delbrück) | 20 tubes, each grown from a few cells, then plated on phage | Before plating, drag where the counts would fall if phage *induced* resistance (a Poisson ghost), then drag the spread you expect across the 20 plates. Plate each tube: a few plates are jackpots. Then estimate μ from the share of empty plates, on a p₀ ruler. | Resistant mutants existed before the phage arrived (Luria & Delbrück 1943). μ̂ = −ln p₀ / N_t. |
| L3 Velvet (replica plating) | A master plate never exposed to the drug; velvet; drug plates | Stamp: resistant colonies appear at the same spots on every drug plate. Pick the master-plate colony at that spot, which has never met the drug, and stamp its offspring again. Sib selection builds a resistant line whose ancestors never met the drug. | Resistance is selected, not induced (Lederberg & Lederberg 1952). |
| Boss: New food | The L1 lineages move onto a medium with a new sugar | Drag the share of your tagged lineages you expect to gain on the new sugar. A few that were neutral in L1 now win, and the mutation rate has not changed. | This inverts "a mutation is simply good or bad": its effect depends on the environment, and its rate does not respond to need. |

**Picture and live graph.**
- *Rung 0:* D4's Petri scene. Colonies grow on the dish; necklace beads are patterned by source (copying error, damage, faulty repair; D4 §4.3) but never by effect; jackpot plates carry a dashed ring; velvet prints stamp identical dot patterns.
- *Strip:* the player's DFE histogram with two ghosts (disclosed below); colony counts against a Poisson ghost; the μ̂ ruler.

**Stars.**
- *Discover:* a DFE built from at least 30 fates; a jackpot seen; a resistant line built from ancestors that never met the drug.
- *Predict:* at least two of three: the DFE bars (two of four within ±0.1), the plate spread (variance-to-mean ratio within a factor of 2), μ̂ within a factor of 2.
- *Transfer:* the boss, plus a gesture on a patient's timeline: drag when the resistant bacteria arose (before the drug).

**Access.** Untimed mode: each spark holds for 2 s, so there is no reflex test. Extra keys: Space tags the newest spark, arrows choose tubes and plates, Enter plates or stamps.

**Teacher hook.** A class pool of 20-tube counts that builds one class-wide distribution with a long tail. Unit prompt: "If bacteria became resistant because they met the phage, what would the counts look like?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Mutation probability per division, U | 0.01 | ×3 (about 0.003 per genome per replication in DNA microbes, Drake 1991) |
| DFE shares | lethal 35%, harmful 30%, neutral 34%, beneficial 1% | designed |
| Phage-resistance mutation rate | about 10⁻⁷ per division | realistic order |
| Tubes; final size | 20 tubes; 10⁷ cells each | designed, on the scale Luria & Delbrück used |

- *DFE disclosure* (the integrator's science fix). The game's 1% beneficial share sits at the top of the genome-wide range for random new mutations, 10⁻² to 10⁻⁵ (Eyre-Walker & Keightley 2007; Gao et al. 2019). The strip shows that range as one ghost. The second ghost is a different kind of measurement: single-nucleotide mutants of the RNA virus VSV made one at a time by site-directed mutagenesis, of which about 40% were lethal, 30% deleterious, 27% neutral and about 4% beneficial (Sanjuán, Moya & Elena 2004; verify). The card says which is which.
- *Key simplification:* haploid asexual cells; DNA repair is not modelled.
- *Cannot show:* mutation rates evolving (mutators appear in Twelve Flasks).

**In nature.** Luria & Delbrück 1943; Lederberg & Lederberg 1952; Sanjuán, Moya & Elena 2004 (*PNAS* 101:8396); Eyre-Walker & Keightley 2007; Drake 1991.

**Build and oracle.**
- *Code:* `v2/scribe.js` replaces `scribe`. It uses D4's Petri scene, an asexual lineage model with a fitness value per cell, and `v2/00_wf.js` for plating draws.
- *Learning layer:* new TAKE: "Mutations arise at random with respect to need; selection decides which ones spread."
- *Oracles:*
  - over 10⁴ seeds, variance/mean of plate counts ≈ 1 under the induced model and ≫ 1 under the pre-existing model;
  - the p₀ estimator is unbiased within 10%;
  - DFE tallies match the designed shares.

### 5.2 The Royal Line (`royal`, new)

*Tier 3 · Act 3, placed after the Mixer (integrator) · the Lab fly room (fruit-fly rig) and the Archive (Victoria's pedigree on D1's `PedigreeView`, human pictograms) · M · Wave A · about 15 minutes · needs The Mixer.*

**Fix (integrator).** Round 1 put a "male dot" on the triangle. Hemizygous males have no point on the de Finetti triangle. Now only females are plotted on the triangle, p_f and p_m run as a damped zigzag on D4's X-linked HUD, and a male is one token with a Y bar (D2 §15).

**Role and felt cost.** The player is an investigator in L1, L2 and the boss (Morgan's breeder, then a counsellor), and the environment in L3 (the fly-room lamp). The cost grows: fewer vials a season, a smaller lamp battery, pedigrees with less information.

**Loops.**
- *Second:*
  - L1: drag a female onto a male to cross them. Pupae crack one at a time and each fly drops into its sex-by-eye-colour bin within 200 ms.
  - L2: tap the predicted next p_f and p_m on the zigzag strip; the hatch confirms.
  - L3: sweep the lamp beam over six courtship dishes. Under the beam, white-eyed males stumble and lose the female (200 ms).
  - Boss: drag each woman's carrier-probability slider; sons appear on the pedigree.
- *Minute:* one cross, one generation, one season of courtship, or one branch of the pedigree.
- *Level:* one new thing.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Reciprocal crosses | Morgan's white-eyed male with red-eyed females, then the reverse cross | Before each hatch, drag four bars (red or white, female or male). The F₁ are all red, the F₂ white only in males, and the reverse cross gives white sons straight away. | The gene rides on the X, and males have one copy (Morgan 1910). |
| L2 The zigzag | Females AA and males a (the Mixer's X-linked round, extended), beside an autosomal control | Tap the next p_f and p_m for five generations. The gap halves and flips sign each time; the female dot creeps to the curve; the control population jumps in one step. | p_m′ = p_f and p_f′ = (p_f + p_m)/2, while the average (2p_f + p_m)/3 never moves. |
| L3 The lamp | A white-eyed mutation arises at a ×N rate; in bright light, white-eyed males court poorly (selection on males only) | Sweep the lamp; drag the male incidence you expect at balance. It settles near 3μ/s, and the allele lingers because two of every three copies sit in females, where the lamp cannot see them. | X-linked mutation–selection balance: male incidence ≈ 3μ/s, Haldane's 1935 route to the first human mutation rate. |
| Boss: The Queen's carriers | Queen Victoria's pedigree (haemophilia B; Rogaev et al. 2009) | Set a carrier probability for each woman. Affected and unaffected sons appear as the pedigree unfolds, and the Brier score updates. A mother of three unaffected sons falls in probability. | Bayesian carrier risk from a pedigree. This inverts "a carrier is a carrier": evidence changes the odds. |

**Transfer gesture.** About 8% of men of northern European ancestry have red–green colour-vision deficiency. Drag the share of women expected (q² ≈ 0.6%; observed about 0.5%).

**Picture and live graph.**
- *Rung 0:* the vials of flies sorted by eye colour; the X as a glowing rod handed down the pedigree, drawn in D4's pictogram style.
- *Strip:* the triangle with females only; the p_f/p_m zigzag; a male-incidence bar; the Brier score in the boss.

**Stars.**
- *Discover:* the reciprocal crosses differed; the zigzag converged; the white allele lingered under selection on males only.
- *Predict:* at least two of three: L1 bars (three of four crosses within ±0.1), zigzag taps (four of five within 0.05), the L3 incidence (within a factor of 1.5).
- *Transfer:* a Brier score of 0.15 or better on Victoria's pedigree, plus the colour-vision gesture within ±0.3 percentage points.

**Access.** The lamp has an untimed mode: battery tokens, one beam position per token per round. Extra keys: 1–6 select dishes, Space fires the beam, arrows move sliders.

**Teacher hook.** On the projector, the class sets carrier probabilities for Alice and Beatrice together before the sons are revealed. Unit prompt: "Why do X-linked recessive conditions appear far more often in men, and when would that not hold?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Flies | N = 200 | designed |
| μ | 10⁻³ | ×100 (per-locus rates are near 10⁻⁵) |
| s on white males in light | 0.5 | designed |
| Generations | discrete | designed |
| Victoria's pedigree | — | realistic (Rogaev et al. 2009) |

- *Cannot show:* X inactivation and mosaic carrier women (named in "In nature").

**In nature.** Morgan 1910 (*Science* 32:120); Haldane 1935; Rogaev et al. 2009 (*Science* 326:817); Birch 2012 on colour-vision frequencies.

**Build and oracle.**
- *Code:* `v2/royal.js`, a new id placed after `mixer`. It uses Gen extension 3 (ploidy: X-linked), D1's `PedigreeView` and D4's X-linked HUD.
- *Oracles:*
  - the gap ratio is −½;
  - p̄ is invariant;
  - incidence at balance is 3μ/s ± 10%;
  - carrier posteriors are exact.

### 5.3 The Leaky Tap (`tap`, new; replaces Equilibrium L10)

*Tier 3 · Act 4 · Beetle Isle: the resident beetles from the Mixer (D2's persistence idea); the player is the dusk gull, drawn as a shadow and a beak (D4 RC2 rule) · S · Wave A · about 13 minutes · needs The Black Country.*

**Fix (integrator).** In round 1 the environment set two dials and watched. Now there is a live drain: the player removes affected beetles from a limited budget while a load meter fills, and the carrier tank fills as the allele hides (D1's G2 arms race, borrowed).

**Role and felt cost.** The dusk gull, a selective agent whose goal is chicks fed. Its dives pick off slow, soft-shelled beetles before they burrow. As the allele is purged, meals become scarce; when it is recessive, the meals hide in carriers the gull cannot see, and using the lens costs dive time.

**Loops.**
- *Second:* at dusk the beetles scurry for their burrows, and affected ones (soft, yellow-flecked wing cases) are slower. Tap to dive. A hit lifts the beetle (a ghost ring) and sends a drop of the harmful allele into the drain jar within 200 ms; a miss costs a dive. There are 10 dives a dusk (a stamina bar).
- *Minute:* one dusk (12 s), then dawn. Survivors breed, the tap drips new mutant copies (sparks on hatchlings), and the q gauge and load meter update.
- *Level:* one new genetic fact.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Drips (dominant) | The tap drips at μ (×N); the allele is dominant, so every carrier is visibly soft | Drag where q will settle. Hunt: your catch rate sets s. q settles at μ/(hs), and your catches settle at the drip rate. | Mutation–selection balance. "My meals settled at the drip." |
| L2 Hidden copies (recessive) | The same allele, now recessive: only aa beetles are soft. The lens shows carriers but blocks dives while it is on (R4's fix for Equilibrium L9) | Predict q again. It settles about 12–20 times higher at the game's μ, depending on your catch rate (√(μ/s) against μ/s), and about 300 times higher at a real μ of 10⁻⁵ with s = 1. The carrier tank under the lens fills. | Recessive harm hides in carriers. |
| L3 The net | A conservation net closes the beach and excludes the gull, so s ≈ 0 | Drag on the years ruler when q will double. In time-lapse it rises by about μ a generation, so the counter reads millennia. Then the net lifts: a feast of soft beetles, then a purge. | Relaxed selection acts slowly; it does not wreck a gene pool in a few generations. |
| Boss: The load | The island keeper's goal, not the gull's: halve the colony's load (the share of each hatch lost to the allele) within 30 generations | Hunt harder: the load spikes, q falls, and then the load meter returns to the same line, μ for a recessive and 2μ for a dominant, whatever s is. Only finding and shutting the leaking drum on the shore (tap it) halves the load. | This inverts "harder selection reduces the harm": at balance each new copy is removed once, so load depends on mutation, not on selection strength (Haldane 1937; Muller 1950). |

**Transfer gesture.** Achondroplasia is dominant, and affected adults have about a fifth of the average number of children. Drag the share of affected children whose parents are both unaffected: about s, so about 80%. Most cases are indeed new FGFR3 mutations (Bellus et al. 1995). Shown as pictogram tallies in neutral words ("number of children", never a person's "fitness"), and routed through the sensitive-content panel. The cystic fibrosis puzzle moved to Malaria Coast, because its candidate explanation is heterozygote advantage.

**Picture and live graph.**
- *Rung 0:* the beach at dusk with burrows; the tap and the leaking drum on the shore; the carrier tank under the lens as a glowing pool beneath the sand.
- *Strip:* q against the dashed equilibrium; log bars for μ/s and √(μ/s); the load meter with its μ line.

**Stars.**
- *Discover:* chicks fed in L1–L2; the load returned to μ despite harder hunting; the drum shut.
- *Predict:* at least two of three: q̂ in L1 (±30%), q̂ in L2 (±30%), the doubling time (±30%).
- *Transfer:* the boss, plus the achondroplasia gesture (±0.1).

**Access.** Untimed: each dusk the beetles pause at their burrow mouths and the player spends 10 dive tokens. Extra keys: arrows cycle beetles, Space dives, L lens.

**Teacher hook.** Realistic mode on the projector: at μ = 10⁻⁵, q sits near 0.003 while the years counter runs. Unit prompt: "Medicine lets people with a recessive condition have children. How fast does that raise the allele's frequency?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| μ | 2 × 10⁻³ per copy per generation | ×200 (gene-level rates are 10⁻⁴–10⁻⁶, R7-R4 B12) |
| s | the player's catch rate, 0.3–0.9 | designed by play |
| h | 1 in L1, 0 in L2 | designed |
| Colony | N = 400 | designed |

- *Key simplification:* one locus and one predator.
- *Cannot show:* heterozygote advantage (Malaria Coast).

**In nature.** Haldane 1935, 1937; Muller 1950 ("Our load of mutations"); Bellus et al. 1995 (FGFR3 G380R).

**Build and oracle.**
- *Code:* `v2/tap.js`, a new id, in Hunt mode with D1's extensions: `lens` (which blocks pecks), `bag`, `predict`, `untimed`.
- *Genetics:* a Gen `dom` locus. The dominant harmful allele is allele 1 with forward `mu`; the recessive harmful allele is allele 0 with a `back` rate. Both fields already exist and are opt-in, so Gen needs no change.
- *Oracles:*
  - q̂ is within 10% of μ/(hs) and √(μ/s);
  - load is within 15% of μ or 2μ at equilibrium;
  - Realistic mode reproduces the textbook values.
- *Bot sweep:* "dive on everything" (wastes dives), "never dive" (no chicks) and "lens always on" each stay below three stars.

### 5.4 Malaria Coast (`malaria`, new)

*Tier 3 · Act 4 · an Expedition to the malaria belt (human pictograms in one ink, D4 rule 10; a new crowd-tier mosquito) · M · Wave A · about 15 minutes · needs The Black Country · sensitive-content gate.*

**Fix (integrator).**
- No on-screen human deaths: outcomes are survival tallies under the genotype lens, consistent with D1's Clinic and D4.
- The unit goes through the Human Variation review panel, because it concerns a regionally associated human trait.
- It uses D1's dawn/dusk triangle.
- It is the only home of heterozygote advantage (the Hardy–Weinberg sequencing ruling); the Census instruments return in L3 as a callback, not a duplicate.

**Role and felt cost.** The player is the environment: the coast's water. They paint and drain swamps, and so malaria. The felt cost comes from two sides:
- as HbS rises in a malarial village, the sickle-cell disease tally rises with it (the cost of a balanced polymorphism);
- migration blurs every edge, and each brushstroke takes generations to show.

**Loops.**
- *Second:* drag the swamp brush over the coast; mosquito clouds rise from painted cells within 200 ms. The drain tool erases. Toggle the genotype lens on a village to see its newborn tally (pictograms with genotype badges).
- *Minute:* one generation (about 25 years, compressed). Births at Hardy–Weinberg proportions (the hollow dawn dot sits on the curve); malaria and sickle-cell disease shape the survival tallies to adulthood per 100 births by genotype; the adults' filled dusk dot sits above the curve.
- *Level:* one new variable.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 One village | Malaria at a fixed level; s against AA = 0.15, t against SS = 0.8 (designed) | Drag the q̂ marker, then paint malaria. Dawn newborns sit on the curve and dusk adults above it; q settles at s/(s + t) ≈ 0.16. | Heterozygote advantage. Hardy–Weinberg as a null model: newborns fit, adults do not. Misconception 11: p is still, yet selection acts every generation. |
| L2 The coast | Ten villages, with migration m between neighbours | Paint malaria so that the evolved HbS map matches a target map (a designed Archive pattern). Migration blurs the edges, and each stroke takes generations to show. | The allele tracks the selective agent, blurred by gene flow. |
| L3 The instruments (Census callback) | The Census's sampling tools: newborns and adults | Buy samples and diagnose the adults' heterozygote excess with a confidence: selection, not a sampling artefact. | The age-class fingerprint of balancing selection. |
| Twist: HbC | A third allele, C: AC mildly protected, CC strongly (Modiano et al. 2001) | Drag C's frequency after 50 generations. While rare, C sits almost only in AC and is nearly invisible to selection, so HbS holds the coast. | A rare recessive advantage is nearly invisible to selection (Haldane's sieve, previewed for Lottery of the New). |
| Boss: Drain the swamp | Malaria eliminated | Draw the expected HbS decline. It falls ever more slowly (Δq ≈ −tq²), and SS tallies continue for generations. | This inverts "remove the cause and the allele vanishes". |

**Transfer: cystic fibrosis** (moved from the Leaky Tap). The ΔF508 allele is about 70% of cystic fibrosis alleles in Europeans, and the disease allele class is far commoner (q ≈ 0.02) than mutation–selection balance predicts at realistic μ with s ≈ 1. Drag the balance prediction (√(μ/s) ≈ 0.003). The Archive card then lists the candidate explanations, past heterozygote advantage and founder drift, as Contested; there is no star for picking a side.

**Picture and live graph.**
- *Rung 0:* the coast map with painted swamps; villages as pictogram clusters; mosquitoes as crowd-tier dots; a red-cell inset that sickles in low oxygen (shape carries the meaning).
- *Strip:* the q map over the malaria map; the triangle HUD with hollow dawn and filled dusk dots; q(t) against an s/(s + t) ghost.
- Survival is shown only as tallies: no deaths on screen.

**Stars.**
- *Discover:* adults sat above the curve while q held; the HbS map matched within tolerance; C stayed rare.
- *Predict:* at least two of three: q̂ (±0.03), the boss's decline curve (±20% at generation 20), C's frequency (±0.02).
- *Transfer:* the boss, plus the cystic fibrosis balance gesture.

**Access.** Untimed. Extra keys: arrows move the brush cell by cell, Space paints, D drains, L lens.

**Teacher hook.** A projector "freeze and ask" on the dusk dot: "p has not moved for 50 generations. Is selection acting?" Unit prompt: "Why does HbS fall so slowly once malaria is gone?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| s against AA | 0.1–0.2 | designed, realistic order |
| t against SS | 0.8 | designed, for a historical setting without treatment; stated, never depicted |
| HbC protection | relative risks from Modiano et al. 2001 | realistic |
| Migration m | — | designed |
| Generation | about 25 years | realistic order |
| Villages | no regional or ethnic labels | designed |

- *Cannot show:* modern treatment and its effect on t (named on the card).

**In nature.**
- Allison 1954 (*BMJ*): malaria parasite rates in children with and without the trait.
- Piel et al. 2010: HbS is frequent in parts of Africa, the Mediterranean, the Middle East and India.
- Williams et al. 2005: about 90% protection against severe malaria (verify).
- Modiano et al. 2001.

**Build and oracle.**
- *Code:* `v2/malaria.js`, a new id. It uses Gen extension 2 (alleles A, S, C), `DemeMap`, the dawn/dusk triangle HUD, and the Census's `Evidence` tools.
- *Oracles:*
  - q̂ = s/(s + t) ± 0.01;
  - newborns pass a χ² test at n = 2,000 in 95% of seeds;
  - the decline follows the recursion;
  - C's spread matches the deterministic threshold.
- *Sensitive-content gate:* panel sign-off before build and before release (D2 §16.5).

### 5.5 Gene Swamping (`swamp`, new; replaces Equilibrium L11)

*Tier 3 · Act 4 · Beetle Isle: a lava isle, a sand isle and a coastline (beetle rig; ferries as props) · M · Wave A · about 15 minutes · needs The Black Country.*

**Fix.** In round 1 the environment set ferries, lava and wind and watched. Now the player hunts in L1 (D1's template role) and lays ferry routes in L3 and the boss (D2's sandbox lever), all with Beetle Isle's beetles (integrator).

**Role and felt cost.**
- L1: a bird hunting conspicuous beetles on the lava isle (a selective agent; the goal is chicks fed). As the isle turns dark, meals get harder, unless the ferry keeps bringing pale migrants: an endless feast that is swamping.
- L2: the bird colony, whose roosts the player places along the coast.
- L3 and boss: the island keeper, laying ferry routes from a budget.

**Loops.**
- *Second:*
  - L1: tap pale beetles on dark lava; peck feedback.
  - L2: drag a roost marker along the coast; birds fly out and eat mismatched beetles within reach (200 ms).
  - L3: drag a ferry route between two isles; the ferry shuttles with visible passengers.
- *Minute:* one generation. Migrants land at dawn, then the hunt, then survivors breed; each isle's colour bar updates.
- *Level:* one new variable.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Two isles, one ferry | You hunt on the lava isle; each dawn the ferry brings a share m of pale migrants from the sand isle. Three rounds, at m = 0.02, 0.1 and 0.3 | Before each round, drag the dark share expected after 10 generations. At low m the isle turns dark and breakfasts get hard; once m reaches about s, pale migrants keep coming and the isle never adapts. | Gene flow swamps local adaptation once m is about s or more (Haldane 1930). |
| L2 The cline | A continuous coast from lava to sand; the wind sets dispersal, σ | Place four roosts (selection acts where they are) and measure the cline's width with a two-handled caliper. Predict the width after doubling the roosts or halving the wind. Twist: a steady wind pushes the cline downwind. | Cline width scales as σ/√s; one-way gene flow shifts it. |
| L3 Five isles | Five small isles (two lava, three sand), N = 100 each; a ferry budget | Lay and remove ferry routes, watching the F_ST bar and each isle's allele dot. Isolated isles lose alleles by drift. | F_ST ≈ 1/(1 + 4Nm); about one migrant a generation limits drift divergence. |
| Boss: Two ferries | Keep all five isles polymorphic and locally adapted for 100 generations with only two ferry routes | The winning plan links lava to lava and sand to sand. | This inverts both "gene flow helps" and "gene flow hurts": it depends on whom you connect. Nm ≈ 1 limits drift but does not protect adaptation (R7-R4 B16). |

**Picture and live graph.**
- *Rung 0:* beetles on black lava and pale sand, so the background is the selective agent's view; laden ferries; wind streaks.
- *Strip:* each isle's dark share against a dashed "no ferry" ghost; the cline against a σ/√s ghost; F_ST against 1/(1 + 4Nm).

**Stars.**
- *Discover:* saw swamping at high m; held all five isles in the boss.
- *Predict:* at least two of three: L1 dark shares (two of three rounds within ±0.1), the cline width (±25%), F_ST (±0.05).
- *Transfer:* the boss, plus a real case. In Lake Erie, banded water snakes are commoner on islands near the mainland, because mainland gene flow keeps banding alive against selection on bare limestone (King & Lawson 1995): drag the expected banded share against distance from the mainland.

**Access.** The L1 hunt has D1's untimed mode (a tell, then tokens). Extra keys: arrows and Enter lay ferry routes and roosts.

**Teacher hook.** On the projector the class votes m each round. Unit prompt: "Is gene flow good or bad for a population? Give a case where each is true."

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| m | 0.02–0.3 | designed |
| s | the player's catch rate on the conspicuous morph, 0.2–0.6 | designed by play |
| N per isle | 100–400 | designed |
| Colour locus for the cline | additive | designed |
| σ | — | designed |

- *Key simplification:* one locus, and birds see colour only.

**In nature.** King & Lawson 1995 (Lake Erie water snakes); Antonovics & Bradshaw 1970 and McNeilly 1968 (metal tolerance at mine edges); Slatkin 1973; Wright 1931.

**Build and oracle.**
- *Code:* `v2/swamp.js`, a new id. Hunt with `barks` (lava and sand) and migrant injection (a D1 Hunt extension); `DemeMap`; `v2/00_wf.js` for the five isles.
- *Oracles:*
  - the swamping threshold sits at m ≈ s ± 20% (continent–island case);
  - cline width scales as σ/√s within 15%;
  - F_ST ≈ 1/(1 + 4Nm).

### 5.6 The Dig (`dig`, new)

*Tier 3 · Act 1 · an Expedition to the fossil cliffs (D4's Strata scene; a new fossil set shared with Extinction Roulette) · M · Wave A · about 15 minutes · needs Act 0.*

**Fix (integrator).** "Only fast-buried, hard-bodied animals fossilise" was too absolute. Such animals fossilise far more often, and Lagerstätten preserve soft bodies (L1's twist).

**Role and felt cost.** In L1 the player is the environment that makes the record (floods and erosion). From L2 on they are a palaeontologist with five field seasons (an investigator). The cost grows: a sediment budget, fewer seasons, deeper rock.

**Loops.**
- *Second:*
  - L1: hold to pour mud over the lake bed; animals in its path are buried within 200 ms. Drag to erode layers.
  - L2: tap atoms in a zircon as they flash; each flash is a decay, and the counter and half-life curve update within 200 ms.
  - L3: drag the brush over a dig square; bone emerges stroke by stroke.
- *Minute:* one epoch of life and burial, one ash bed dated, or one field season.
- *Level:* one new instrument.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Make a record | A living lakeside: clams, fish, a beetle, a bird, worms; species turn over each epoch | Pour floods for six epochs; then uplift and erosion strip layers. Drag the share of species you expect to be preserved. Hard parts buried fast in low-oxygen mud fossilise far more often than soft bodies, and whole epochs go missing to erosion. Twist: one oxygen-free flood preserves soft bodies too (a Lagerstätte). | The record is a biased, gappy sample, and a gap is not an absence. |
| L2 Clocks in ash | Two volcanic ash beds bracket a fossil; their zircons hold uranium decaying to lead | Tap decays for 20 s in each zircon, read the age off the decay curve, and drag the fossil's age between the two beds. | Radiometric dating, half-life, bracketing. |
| L3 Where to dig | A geological map; fish fossils at about 385 Myr and tetrapods at about 365 Myr; five seasons | Drag one dig site per season onto the map. Choosing 375-Myr river deposits finds an intermediate. | Evolutionary theory predicts where to look: the logic that found *Tiktaalik* (Daeschler, Shubin & Jenkins 2006). |
| Boss: Deep time | A log-time ruler from 4.0 Gyr to 300 kyr | Pinch and drag whale and hominin fossils into place. Your Act 0 generation count appears as a tick, to show scale. *Homo naledi* (about 335–236 kyr) overlaps early *H. sapiens* (about 300 kyr), so the ladder becomes a bush. | This inverts the ladder: many hominins lived at once, and deep time is vast. |

**Picture and live graph.**
- *Rung 0:* the cliff whose layers the player builds (Strata); the zircon inset with flashing atoms; the geological map with dig squares; the log-time ruler.
- *Strip:* a range chart filled by the player's finds; the decay curve.

**Stars.**
- *Discover:* made a gappy record that includes a Lagerstätte; found the intermediate.
- *Predict:* at least two of three: the preserved share (±0.15), the zircon age (±10%), the bracket.
- *Transfer:* boss placements within half a log unit.

**Access.** Untimed: decays can be counted in a stepped, paused mode. Extra keys: arrows choose dig squares, Space pours or brushes.

**Teacher hook.** On the projector's log ruler: "Where does the first animal go?" Unit prompt: "Why is a gap in the fossil record not evidence against evolution?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Burial probability | a function of sedimentation, oxygen and hardness | designed |
| U-238 half-life | 4.47 Gyr | realistic |
| Species turnover | — | designed |
| Map ages | — | realistic orders |

- *Cannot show:* molecular dating (that is `clock`).

**In nature.** Daeschler, Shubin & Jenkins 2006 (*Nature* 440:757); Gingerich et al. 2001 (whale ankles); Dirks et al. 2017 (dating *H. naledi*); Hublin et al. 2017 (Jebel Irhoud).

**Build and oracle.**
- *Code:* `v2/dig.js`, a new id, with D4's Strata scene and the fossil-set rig.
- *Oracles:*
  - preserved shares match the burial probabilities over 1,000 runs;
  - the age estimate is unbiased;
  - decay counts are Poisson.

### 5.7 Extinction Roulette (`extinct`, new)

*Tier 3 · Act 10 · the Archive (D4's tree chart drawn as a clade spindle; the fossil-set silhouettes shared with the Dig) · M · Wave A · about 15 minutes · needs Acts 1, 4 and 5.*

**Fix (integrator).**
- The environment used to set a killer and watch. Now the player triages: shields from a conservation budget protect lineages, chosen by background-extinction traits, and those predictors then fail at the impact (Jablonski 1986).
- L2 no longer says "wanted: luck". It says that background predictors stop working and different traits decide.
- Extinction rate is δ, not μ (D2 §15).

**Role and felt cost.** The manager of a reserve network spread across deep time. The shields are refuges, a game device disclosed on the MODEL card; history is compressed. A shield halves a lineage's background extinction risk. The felt cost: as clades diversify, more lineages compete for the same shields, and the budget never grows.

**Loops.**
- *Second:* background extinction strikes arrive about once a second as sparks on lineage tips. Each strike picks a lineage with probability proportional to its δ. Drag a shield onto a lineage before the strike lands: a shielded lineage deflects it within 200 ms; an unshielded one ends, its branch greying to a dashed ghost.
- *Minute:* one epoch (about 1 Myr): strikes, speciation, and an update of the trait–survival scatter.
- *Level:* one new regime.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Background | 40 lineages with visible traits: range size, diet breadth, body size, burrowing | Shield five lineages per epoch. Drag a risk slope for each trait on the risk axis. The scatter for unshielded lineages slopes: narrow-range specialists go first. | Background extinction is selective. |
| L2 The impact | An asteroid ends the epoch; your shields stand where your background model put them | Before the impact, drag the survival shares you expect for shielded and unshielded lineages. The shields do little: background predictors stop working, and small size, burrowing and broad geographic range at the clade level decide. | Mass extinction changes the rules: traits that protected in normal times stop mattering (Jablonski 1986). |
| L3 Recovery | Diversity-dependent speciation, λ = λ₀(1 − D/K) | Drag the recovery time on the timeline. The lineage-through-time slope jumps, then slows as niches fill: about 10 Myr. Twist: dig fossil ranges on a sampling budget; recorded ranges stop short of the true end (Signor–Lipps), so the sudden extinction looks gradual. | Recovery lags, and sampling smears sudden events. |
| Boss: The sixth | A modern clade set with real-pattern traits (body size, range, island endemism) and a habitat-loss driver | Shield with the modern budget. Now the predictors work again: large body and small range predict loss (Cardillo et al. 2005), at about 100 extinctions per million species-years against a background of about 0.1 (Pimm et al. 2014). | This inverts L2: not every mass extinction is indiscriminate. Today's is strongly selective, which is what makes triage possible. |

**Picture and live graph.**
- *Rung 0:* the clade spindle, where each lineage is a living branch with a silhouette; strikes are sparks; the impact is a sweep across every branch.
- *Strip:*
  - diversity through time;
  - the trait–survival scatter, drawn from unshielded lineages only. Shielded lineages carry a shield glyph and are left out of the fit, so the player's protection never contaminates the measure of selectivity. Survivors are solid and extinct lineages hollow, following D4's scatter rule.
  - the lineage-through-time plot.

**Stars.**
- *Discover:* background selectivity seen; shields failed at the impact; recovery seen.
- *Predict:* at least two of three: the L1 slopes (right sign for three of four traits), the L2 survival shares (±15 points), the L3 recovery time (±3 Myr).
- *Transfer:* the boss, plus a new trait axis from Jablonski's molluscs. Planktotrophic larvae (long-lived, widely dispersed larvae) helped in normal times; drag their effect at the impact (none).

**Access.** Untimed: strikes queue, and each waits for a shield decision (tokens). Extra keys: arrows select lineages, Space shields.

**Teacher hook.** On the projector the class places shields by vote before the impact. Unit prompt: "Was the end-Cretaceous extinction 'survival of the fittest'? Use your own scatter to argue."

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Background extinction | birth–death model with trait-dependent δ | designed |
| Speciation | λ = λ₀(1 − D/K), with K counted in species | designed |
| Impact survival rule | follows Jablonski's patterns | designed, qualitative |
| Shields | refuges | designed game device (no one protected Cretaceous clades) |
| Time | — | ×10⁶ (history compressed) |

- *Cannot show:* what caused the impact winter.

**In nature.** Raup 1991; Jablonski 1986 (*Science* 231:129); Signor & Lipps 1982; Kirchner & Weil 2000; Pimm et al. 2014; Cardillo et al. 2005.

**Build and oracle.**
- *Code:* `v2/extinct.js`, a new id, using `TreeView` in spindle mode and the fossil-set rig.
- *Oracles:*
  - the lineage-through-time slope is λ − δ ± 5%;
  - with a trait-independent impact, survivors' traits match the pre-impact distribution;
  - the Signor–Lipps smear reproduces under sampling.

### 5.8 Out of Africa (`ooa`, new)

*Tier 3 · Act 11★ · an Expedition (a world map; human pictograms in one ink; campfire band icons) · L · Wave A · about 18 minutes · needs Acts 9 and 10 · sensitive-content gate.*

**Fix (integrator).**
- Lactase persistence arose several times through different alleles: at least three in East Africa (Tishkoff et al. 2007) and −13910T in Europe (Enattah et al. 2002), not "twice".
- Twelve allele colours become D4 rule 7: four hues × three fills, each lettered.
- Humans are pictograms.
- The unit goes through the sensitive-content panel.

**Role and felt cost.** The player is the environment: corridors (sea level, ice, desert) open and close with climate, and the player chooses where the frontier band goes next. The felt cost:
- corridors are open only during climate windows, on a ticking cycle;
- a band that pushes into a closing corridor is stranded, and its campfire fades ("no descendants"; no deaths are shown);
- later levels add altitude and herding routes.

**Loops.**
- *Second:* tap an open corridor beside the frontier. The next band buds off and walks through it (it starts within 200 ms and walks for a few seconds). As it founds its camp, its allele jar pops: the alleles it did not carry vanish with a soft pop.
- *Minute:* one climate window (about 5,000 years, compressed). Bands bud and grow to K, and the heterozygosity-against-distance plot gains points.
- *Level:* one new process.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The founder chain | Bands carry 20 loci, each with 12 alleles (4 hues × 3 fills, lettered); N_f = 30 founders per band | Before starting, drag the expected line of heterozygosity against distance from Africa. Open corridors all the way to the Americas. Alleles vanish faster than H falls, and the H line comes out nearly straight. | Serial founder effects (Ramachandran et al. 2005); a callback to the Drift Casino's allelic richness. |
| L2 Encounters | Neanderthal bands in Eurasia; contact pulses where corridors meet | Drag a time marker until the expected tract-length histogram matches the observed one; recombination chops tracts shorter every generation. About 2% of non-African genomes are Neanderthal. | Archaic admixture, dated by tract length (mean ≈ 1/t Morgans after t generations). |
| L3 Purge and gift | Neanderthal segments near genes; a highland plateau | Watch segments near genes thin out, because alleles from a small-Ne population carry a load. Lead bands onto the plateau, and the Denisovan EPAS1 haplotype sweeps. | Introgression is mostly purged, yet it can supply adaptations (Harris & Nielsen 2016; Huerta-Sánchez et al. 2014). |
| Boss: Milk | Herding spreads along the routes you open | From the haplotype backgrounds shown in the GenomeStrip, drag how many independent origins lactase persistence will have. Several: at least three in East Africa and one (−13910T) in Europe. | This inverts "one trait, one origin" and "humans stopped evolving": recent, convergent selection. Why it was favoured is Contested (Evershed et al. 2022), so no star rests on a cause. |

**Picture and live graph.**
- *Rung 0:* the map with walking bands and campfires, each band's allele jar beside it, and Neanderthal segments as patterned bars on a chromosome strip under the map.
- *Strip:* H and allele count against distance, with Ramachandran's ghost; the tract-length histogram; the boss's haplotype GenomeStrip.

**Stars.**
- *Discover:* reached the Americas with an H gradient; dated the tracts; saw EPAS1 sweep.
- *Predict:* at least two of three: the H line's slope (±20%), the contact date (±20%), the number of origins (±1).
- *Transfer:* the boss, plus a gesture predicting allelic richness in a far population from its distance.

**Access.** Untimed: climate windows wait for the player. Extra keys: arrows choose corridors, Space opens one.

**Teacher hook.** The class chooses corridors by vote, and a class pool overlays H-distance lines from many seeds. Unit prompt, worded with the panel: "Populations far from Africa carry fewer alleles. Does that say anything about their biology? Why not?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Founders and growth | N_f = 30; growth to K = 1,000 per band | designed |
| Loci | 20 loci × 12 alleles | designed (real studies use hundreds of microsatellites) |
| Admixture | 2% | realistic (1.5–2.1%, Prüfer et al. 2014) |
| Recombination | per Morgan | realistic |
| EPAS1 selection, s | — | designed |
| Time | 60,000 years in 18 minutes | history compressed |

- *Cannot show:* structure within Africa in detail, or why lactase persistence was favoured (Contested).
- *Framing rules* (D3 round 1 §6 Q3, now D2's gate):
  - variation is continuous and clinal;
  - ancestry is not race;
  - no ethnic markers;
  - pictograms in one ink;
  - no group ranking;
  - no on-screen death.

**In nature.** Ramachandran et al. 2005; Prüfer et al. 2014; Sankararaman et al. 2012, 2014; Harris & Nielsen 2016; Juric, Aeschbacher & Coop 2016; Huerta-Sánchez et al. 2014; Tishkoff et al. 2007; Enattah et al. 2002; Evershed et al. 2022.

**Build and oracle.**
- *Code:* `v2/ooa.js`, a new id. It uses Gen extension 1 (linked loci, for tracts) and extension 2 (multi-allele), D4's GenomeStrip, and `DemeMap` as a world map.
- *Oracles:*
  - H falls by 1/(2N_f) per founding step in expectation (±10%);
  - tract lengths are exponential with mean 1/t Morgans;
  - allele counts fall proportionally faster than H.

### 5.9 The Breeder (`fancier`, REBUILD of The Fancier; P0 host for the gym level)

*Tier 3 · Act 2 · the Lab's breeding pens (a new pigeon rig; a new fox rig shared with The Slow Island) · M · Wave A · about 15 minutes · needs Act 0.*

**Keep.**
- R = h²S.
- Belyaev's foxes and the correlated response, now with the corrected CR₂ = h₁h₂r_G(S/σ₁)σ₂ (R7-R1 #8).
- The neural-crest hypothesis named, as Contested.

**Fix.**
- The visuals score 3.0: 24 identical pigeons.
- "Pick the biggest" has no tension.
- No selection plateau, inbreeding depression or pleiotropic costs (G1).
- The "name what changed" quiz.
- The P0 gym level is missing (misconception 2), and so is h² × environment (misconception 15).

**Role and felt cost.** The breeder, a selective agent (artificial selection). The felt cost grows as the population responds: variance gets used up (the plateau), F climbs and clutches shrink (inbreeding depression), and pleiotropic health costs appear.

**Loops.**
- *Second:* birds parade past the pen gate one at a time. Drag one into the pen or let it pass; the S arrow on the live histogram updates within 200 ms.
- *Minute:* one generation. Six breeders are chosen, eggs hatch (visibly smaller clutches as F rises), and the next parade forms.
- *Level:* one new variable.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 The show ring | Pigeons with variable crests; the judge's brief changes each round, crest first and then tail | Before breeding, drag the offspring histogram's ghost (R = h²S). When the brief switches to tails, crests move with them. | R = h²S; correlated response. |
| L2 The gym (P0) | Half the birds are flight-trained, with bigger breast muscles | Drag where the trained birds' chicks will sit: back at the untrained mean. Only selection moves it. What if? "A mark that fades": a small-RNA effect that halves each generation (after Rechavi et al. 2014). | Acquired traits are not inherited (misconception 2); some non-genetic effects exist, and they fade. |
| L3 Better feed | One flock on rich feed, one on poor | Predict both means, and drag the regression line through a parent–offspring scatter. Rich feed raises the mean far more than selection did, and changes h² by shrinking V_E. | High h² does not mean fixed (misconception 15); h² belongs to a population in an environment; the parent–offspring slope is h². |
| L4 Six breeders | Choose 2, 6 or 12 breeders a generation, for 15 generations | Predict each response curve. Two breeders: fast, then fertility crashes as F climbs by about 1/(2Ne) a generation, and the response plateaus. Twelve: slow and steady. | The selection plateau; inbreeding depression; the cost of small breeding groups. |
| Boss: Belyaev's foxes | Foxes selected for tameness only | Drag the predicted change for ears, coat and tail, each with a direction and size. They change along with tameness. | This inverts "select one trait, get one trait": correlated responses (Trut 1999). The domestication-syndrome and neural-crest explanation is Contested (Wilkins, Wrangham & Fitch 2014). |

**Picture and live graph.**
- *Rung 0:* the parade, in which crest size is a silhouette feature (D4); the pen; nests in which empty eggs appear as F rises; foxes with visibly changing ears and coats.
- *Strip:* the histogram with S and R arrows; the F meter; the response curve; the parent–offspring scatter.

**Stars.**
- *Discover:* in L4 the response plateaued and fertility fell; in the boss, the correlated traits changed.
- *Predict:* at least two of three: the L1 ghost (±0.3 SD), the L3 slope (±0.15), the L4 curve (±20%).
- *Transfer:* the boss's trait predictions (three of four directions right), plus the gym gesture.

**Access.** Untimed: the parade waits. Extra keys: Space admits a bird, → lets it pass.

**Teacher hook.** A class pool of everyone's realised h² from L1. Unit prompt: "A breeder says, 'This line is 80% heritable, so feed won't matter.' What is wrong?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Crest | polygenic, h² ≈ 0.5 | designed |
| Breeders per generation | 2–12 | designed |
| Inbreeding-depression slope | — | designed (realistic sign) |
| Belyaev genetic correlations | — | designed, qualitative fit to Trut 1999 |
| Gym effect | — | designed |
| Small-RNA mark | halves each generation | designed (Rechavi et al. saw effects for about 3–5 generations; verify) |

- *Cannot show:* why the correlations exist mechanistically (Contested).

**In nature.** Darwin 1859, 1868; Trut 1999; Wilkins, Wrangham & Fitch 2014 (Contested); Rechavi et al. 2014; Visscher, Hill & Wray 2008.

**Build and oracle.**
- *Code:* `v2/breeder.js` replaces `fancier`. It uses Gen additive loci with extension 4 (pleiotropy: `fx` weights) for the crest–tail and tameness–ear correlations, and extension 5 (lineage tracking) for F.
- *Oracles:*
  - R = h²S ± 10% over 500 seeds;
  - the F increment is about 1/(2Ne);
  - the correlated response matches CR₂.

### 5.10 Seed Rain (`sieve`, REBUILD of The Sieve; P0 host for cave fish; absorbs the Ellipse)

*Tier 3 · Act 5 · the Outer Islands (Daphne Major: finch rig) and an Expedition to a cave (a new cave-fish rig) · M, plus 0.6 for the Ellipse levels · Wave A for L1–L3, with the cave-fish level as interim boss; the Ellipse levels (L4 and the final boss) ship in Wave B, as the integrator ruled · about 18 minutes · needs Act 4.*

**Keep.**
- The dot-histogram (one of D0 §2's charts to build on).
- The three modes of selection.
- The "split" challenge as productive failure.
- The continuum-of-alleles caveat.

**Fix.**
- The player draws the fitness function, which is the answer (R1; G2 #8).
- The split challenge can only fail, because mating is always random (G6 #5).
- No Lande–Arnold gradients.
- The P0 trait-loss level (cave fish) is missing.
- The Ellipse merges in here (integrator).

**Role and felt cost.** The player is the environment: they sow seeds of chosen size and hardness and call rain or drought; in the cave, they drop food. The felt cost: as beaks adapt to the seed mix, each new target needs a bigger change, from a fixed seed budget per season.

**Loops.**
- *Second:* drag the seed brush (small soft or large hard seeds) over the island. Finches forage visibly: a beak cracks a seed or fails, within 200 ms. Tap a cloud for rain.
- *Minute:* one season: feeding, winter survival from the realised diet, breeding. The birds slide into the live histogram (G6).
- *Level:* one new shape or trait.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Drought and plenty | A drought leaves only large hard seeds; then a wet year | Before each season, drag the next generation's mean (R = h²S). Then narrow the spread with a seed mix that favours middle-sized beaks. | Directional, then stabilising selection emerge from ecology (Boag & Grant 1981). How common stabilising selection is in nature is Contested. |
| L2 Split the flock | Only small soft and large hard seeds | Try to split the flock in two. Variance grows, but no lasting gap forms under random mating. What if? buttons: "mates match by beak and song", or "one locus of large effect": now the gap lasts. | Disruptive selection rarely makes two lasting peaks without assortative mating or a large-effect locus (D0 guardrail). The black-bellied seedcracker's bill polymorphism rests on a single locus (Smith 1993). Leads to Two Fruits. |
| L3 Lights off (P0 trait loss) | A river carries fish into a dark cave; the player controls food drops | Predict eye size after 60 generations. With few food drops, the energy cost of eyes shrinks them fast; with many, loss is slow. What if? buttons remove the energy cost, or the pleiotropy (a gene that shrinks eyes also enlarges jaws and taste buds), to show each route alone. | Trait loss by selection, not disuse. Eyes cost about 5–15% of resting metabolism in young fish (Moran et al. 2015; verify); pleiotropy (Yamamoto et al. 2004), and relaxed selection plus drift, also act. Which matters most is Contested. Confronts use-and-disuse thinking (Nehm & Ha 2011). |
| L4 The Ellipse (Δz̄ = Gβ) | A trait plane (beak depth × width); seeds that select on depth; a tilted G ellipse | Draw the response arrow before breeding: width moves with depth. Then hit a target off the long axis by aiming selection away from it. Twist: with an antagonistic correlation, a large S yields almost nothing (Etterson & Shaw 2001). | Selection gradients and the G matrix (Lande & Arnold 1983). |
| Boss: Lines of least resistance | Many generations; the cloud and its G both evolve | Draw the path you expect the mean to take. It bends along g_max, the direction of most genetic variance, not straight to the optimum (Schluter 1996). | This inverts "selection takes the shortest path": the genetics steer. |

**Picture and live graph.**
- *Rung 0:* beaks drawn to scale crack visible seeds, and the birds walk onto the histogram (rung 1). In the cave, fish whose eyes shrink. On the trait plane, each bird stands at its own beak depth and width.
- *Strip:* the dot-histogram with S and R arrows; in L4, the G ellipse, β and the response arrow, predicted against realised.

**Stars.**
- *Discover:* three shapes of selection produced from seeds alone; a lasting split only with a What if?; eyes regressed.
- *Predict:* at least two of three: the L1 mean (±0.3 SD), the L3 eye size (±20%), the L4 arrow (angle within ±15°).
- *Transfer:* the boss's path, plus the cave fish (a new organism and trait loss: D2's transfer move).

**Access.** Untimed. Extra keys: 1/2 choose the seed type, arrows move the brush, Space sows, R calls rain.

**Teacher hook.** A class challenge on a shared seed: make a target selection shape using only seeds, then plot the class's fitness curves. Unit prompt: "Cave fish lost their eyes. Write the explanation a student would give using 'use and disuse', then rewrite it correctly."

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Beak depth | polygenic, h² ≈ 0.7 | realistic order for Darwin's finches |
| Seed sizes and hardness | — | designed |
| Utilisation | Gaussian | designed |
| Cave food; eye cost | — | designed, scaled to Moran et al. 2015 |
| G matrix | emerges from pleiotropic loci | designed |
| Variance | capped | designed (the continuum-of-alleles caveat, R7) |

- *Cannot show:* speciation (Two Fruits, Archipelago).

**In nature.** Boag & Grant 1981; Grant & Grant 1995; Smith 1993; Lande & Arnold 1983; Etterson & Shaw 2001; Schluter 1996; Moran, Softley & Warrant 2015; Yamamoto, Stock & Jeffery 2004.

**Build and oracle.**
- *Code:* `v2/seedrain.js` replaces `sieve`, keeping `CH_SIEVE.stats`'s bimodality coefficient.
- *Genetics:* Gen additive loci with extension 4 (pleiotropy), so G emerges; a mate-choice function for the What if? (no Gen change); a `dom` locus for the large-effect case.
- *Learning layer:* `ch99.js`'s secret challenge is re-implemented as L2.
- *Oracles:*
  - the one-generation response matches Gβ ± 10%;
  - a split persists only with assortment or a large-effect locus;
  - eye regression proceeds at the designed rate.

### 5.11 Invisible Carriers (`carriers`, new; from Equilibrium L16; P0 host for the Blood Bank)

*Tier 3 · Act 3 · L1 on Beetle Isle (D4's placement, with beetles), then the Lab's clinic room and blood bank, where people are the point (D2's exception; human pictograms; `PedigreeView`) · S · Wave A · about 12 minutes · needs The Pedigree · sensitive-content gate (genetic counselling and consanguinity).*

**Keep.**
- The carrier crowd beside the rare affected person ("a strong visual", R4).
- Cystic fibrosis numbers: about 1 in 2,500 affected, about 1 in 25 carriers.
- The q = √aa logic.

**Fix.**
- Two multiple-choice questions and a slider (R4).
- No caveat that consanguinity or population structure inflates aa (R7-R4 B25).
- The counselling risks need exact values (R7-R4 B26).
- The P0 ABO level (the Blood Bank) is missing.
- The boss becomes inbreeding (integrator; it no longer overlaps the Census boss).

**Role and felt cost.** An investigator: a genetic counsellor. The cost grows: the lens battery shrinks, queues speed up, pedigrees get loops.

**Loops.**
- *Second:*
  - L1: sweep the lens over the beetle crowd; beetles under it show their wing-case halves within 200 ms.
  - L3: drag each donor bag to a waiting patient as donors arrive; a compatible match glows, an incompatible one is refused within 200 ms.
- *Minute:* one estimate, one consultation, or one shift at the blood bank.
- *Level:* a new case.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Count what you can't see | A Beetle Isle colony of 2,500 in which one hatchling is affected (amber, aa) | From the affected share, predict the carriers (q = √aa, so 2pq ≈ 1 in 25, about 100 in the colony). Sweep the lens to check: about 100 carriers for every affected beetle at this q (2p/q). The same numbers then describe cystic fibrosis in the clinic room. | Recessive alleles hide in carriers, and q = √aa assumes Hardy–Weinberg. |
| L2 The couple | A couple from a population with q = 0.02, then a couple who are first cousins | Drag each risk on a log ruler. Unrelated: about 1 in 2,500. Cousins: drag the shared ancestor's token down the `PedigreeView` paths (F = 1/16); the population-level risk rises to about 1 in 615 (q² + Fpq). Framing: for first cousins, the added risk of any serious condition is about 2–3 percentage points (Bennett et al. 2002; verify). | F raises homozygosity, and counsellors use it. |
| L3 The Blood Bank (P0) | ABO donors arrive in a queue while patients wait | Route bags by the compatibility rules. Between shifts, predict tomorrow's donor mix: q_O = √(share of type O), then the AB share, 2p_Ap_B. The 3×3 tiling (p_A + p_B + q_O)² fills from donors seen under the lens. | Hardy–Weinberg extends to multiple alleles (D2 notation: q_O, never r). |
| Boss: The valley | A valley population where cousin marriage is common; aa sits above q² | Estimate q from the affected share, then correct it with F from a pedigree sample (drag the corrected q). √aa overestimates q, because aa = q² + Fpq. | This inverts L1: the q = √aa rule fails when mating is not random. |

**Picture and live graph.**
- *Rung 0:* the beetle crowd under the lens (L1); the clinic's pedigree; the blood bank's shelves emptying; the 3×3 tile wall.
- *Strip:* carriers against affected; the risk ruler; the corrected-q ghost.

**Stars.**
- *Discover:* carriers counted; a full shift with no refused patient; the boss corrected.
- *Predict:* at least two of three: the carrier count (±20%), the couple risks (within a factor of 1.5 on the log ruler), the donor mix (±0.05).
- *Transfer:* the boss.

**Access.** Untimed shifts: the queue pauses. Extra keys: arrows choose donors and patients, Enter routes, L lens.

**Teacher hook.** Projector: "How many carriers are in this lecture hall of 300 if q = 0.02?" (about 12). Unit prompt: "A clinic estimates q from affected births. When would that estimate be too high?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| q | 0.02 | realistic for cystic fibrosis in Europeans; one lumped allele class, since CFTR has more than 2,000 variants (R7-R4 B25) |
| F for first cousins | 1/16 | exact |
| ABO frequencies | — | designed, realistic orders |
| Valley F | 0.03 | designed |

- No ethnic labels.
- *Cannot show:* how allelic heterogeneity changes real risks.

**In nature.** Bernstein 1925 (ABO as three alleles); Bennett et al. 2002 (*J. Genet. Couns.*); Hardy–Weinberg in clinical genetics.

**Build and oracle.**
- *Code:* `v2/carriers.js`, a new id, using D1's `PedigreeView` and Gen extension 2 (ABO).
- *Oracles:*
  - carriers per affected person = 2p/q;
  - risks are exact (p²q² ≈ 1/2,600; q² + Fpq);
  - the ABO tiling sums to 1.

### 5.12 The Pedigree (`pedigree`, new; from Equilibrium L14; P0 host because Invisible Carriers needs its F)

*Tier 3 · Act 3 · the Lab (`PedigreeView`), Beetle Isle (two-locus beetles) and the Meadow (primroses, on the flower rig shared with The Meadow) · S · Wave A · about 12 minutes · needs The Census (its boss reuses a Census instrument).*

**Keep.**
- Equilibrium L14's matchmaker idea.
- H_o = 2pq(1 − F) and aa = q² + Fpq (R7-R4 B22).
- The Habsburg case (Alvarez, Ceballos & Quinteiro 2009).
- Colour assortment against inbreeding (R7-R4 B24).

**Fix.**
- "Non-random mating never changes allele frequencies" is false (R4 #2; R7-R4 D2).
- Three different mating models hide under one label (G7 #1; R7-R4 C5).
- F is never named.
- The pairing step is busywork.

**Role and felt cost.** An investigator counting paths, then a bee (a pollinator) in L3. The cost grows: pedigrees grow loops, and the bee has a nectar budget.

**Loops.**
- *Second:* drag an allele token from a shared ancestor down one path to the child. Each step halves it (a 200 ms tick), and F gains that path's (½)^n(1 + F_A).
- *Minute:* one pedigree, or one population generation.
- *Level:* one new structure.

| # | Change | Predict → do → observe | Concept, and the aha |
|---|---|---|---|
| L1 Paths | Offspring of half-sibs, first cousins, double first cousins, uncle and niece; then Charles II of Spain | Before counting, drag F on a ruler; then count paths. Charles II comes out near 0.25 (Alvarez, Ceballos & Quinteiro 2009). | F is the chance that two copies are identical by descent; H_o = 2pq(1 − F). F is named here, once, and used everywhere after. |
| L2 Every locus, or one? | Beetles with a colour locus and an unlinked marker; two mating rules, each with its own label: inbreeding, and colour-assortative mating | Tap where each locus's triangle dot will go under each rule. Inbreeding lowers heterozygosity at both loci; colour assortment only at the colour locus. | Inbreeding acts on the whole genome; assortment acts on the trait's loci. One model per label (G7 #1). |
| L3 Opposites | Primroses with pin and thrum flowers; only pin × thrum crosses set seed | You are the bee: carry pollen between flowers for nectar; incompatible deliveries wilt. Predict where the thrum allele's frequency settles from a start of 0.8: it falls to 0.25 (1 Ss : 1 ss). | Disassortative mating moves p, because the rare type gets more matings (Wright 1939; D0 §3). |
| Boss: Inbreeding or assortment? | A population with a heterozygote deficit at the colour locus | Buy a second-marker sample (a Census instrument) and diagnose with a confidence. The marker fits Hardy–Weinberg, so it is assortment, not inbreeding. | This inverts "a deficit means inbreeding". |

**Picture and live graph.**
- *Rung 0:* the family tree with glowing paths (`PedigreeView`); beetles with wing-case halves; primroses whose pin and thrum forms differ in shape.
- *Strip:* the F ruler; two triangle HUDs (colour locus and marker); the thrum frequency over time.

**Stars.**
- *Discover:* Charles II's F computed; p moved under disassortative mating.
- *Predict:* at least two of three: F values (three of four within ±0.02), triangle taps (±0.05), the thrum endpoint (±0.05).
- *Transfer:* the boss.

**Access.** Untimed. Extra keys: Tab cycles paths, Enter steps the token, arrows and Space fly the bee.

**Teacher hook.** Before counting, the class votes: is F higher for offspring of half-sibs or of first cousins? Unit prompt: "Why doesn't inbreeding change allele frequencies, when disassortative mating can?"

**MODEL.**

| Parameter | Value | Tag |
|---|---|---|
| Pedigrees | — | exact (Habsburgs realistic) |
| Beetle populations | N = 500 | designed |
| Primrose start | thrum at 0.8 | designed (real heterostyly sits at the 1 : 1 balance) |

- *Cannot show:* purging.

**In nature.** Wright 1922 (path coefficients); Alvarez, Ceballos & Quinteiro 2009 (*PLoS ONE* 4:e5174); Darwin 1877 (heterostyly); Wright 1939.

**Build and oracle.**
- *Code:* `v2/pedigree.js`, a new id, using `PedigreeView`, Gen `dom` loci and a mating-rule function (no Gen change).
- *Oracles:*
  - F by path counting matches the recursive kinship computation;
  - under assortative mating the marker stays at Hardy–Weinberg proportions;
  - the disassortative run from 0.8 settles at 0.25.

---

## 6. Tier 4: the other rebuilds and merges

These 23 specs use the same fields in compact form. Keep/Fix, Picture/graph, Access/teacher and MODEL/nature are merged into single entries. They fix each unit's verb, loops, levels, stars and model now, so D2 can size Waves B and C. They are deepened during Wave A (D2 §16.1). The units that D2 §4 flagged as lacking a per-second verb (The Crowd, The Pond, Two Fruits, The Ring, Copy and Paste, Genetic Rescue, Guest L2, Doubling L2) each name one below. If a five-student test still flags one as boring twice, it is demoted to scenario cards under D2's rule.

### 6.1 Crossing Over (`cross`)

*Tier 4 · Act 2 · the Lab's field plots (pea rig as the crop, with a chromosome bar beneath each seedling) · M · Wave B · about 12 minutes · needs Mendel's Garden.*

- **Keep / Fix.**
  - *Keep:* L1–L2's diagrams; the existing Haldane-mapping and interference text; L3's linkage-drag idea ("the best idea", R1).
  - *Fix:* the player places crossovers (R1; G1); L2 is a paper exercise, and the monkey test sticks there.
  - *Learning layer:* TRANSFER.cross becomes the opening gesture.
- **Role and felt cost.** A plant breeder screening with markers (a selective agent). Each backcross shrinks the wild segment less than the last, and marker tests cost budget.
- **Loops.**
  - *Second:* seedlings sprout with a chromosome bar under each. Crossovers fall at random, with an obligate crossover per bivalent and interference. Tap a marker probe on a seedling to reveal its segment at that position (200 ms), and drag keepers to the cross bench.
  - *Minute:* one backcross generation.
  - *Level:* one new mapping or breeding problem.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| Opening | Two genes side by side: drag how often they will stay together in 20 gametes. | Linked genes travel together. |
| L1 Patchwork | Watch 20 meioses and predict crossovers per chromosome (one or two, never zero); hotspots glow. | Crossovers are random, with hotspots, an obligate crossover and interference (D0 §3). |
| L2 Map from recombinants | Cross, count recombinants for three genes, and drag the genes into order. Distances past 50 cM saturate. | Recombination fractions map a chromosome, and they never exceed 50% (Haldane 1919). |
| L3 Backcross | Introgress a wild resistance gene R into an elite line, screening flanking markers to shrink the wild DNA around R. | Marker-assisted selection; linkage drag. |
| Boss: Tight linkage | A harmful wild gene sits 1 cM from R. A useful recombinant turns up in about 1 seedling in 100, and the budget forces choices. | Inverts "a few more backcrosses fix everything": long wild segments survived many backcrosses in tomato (Young & Tanksley 1989). |

- **Picture and graph.** *Rung 0:* the field of seedlings with their bars (wild segments patterned, elite plain). *Strip:* wild-DNA share by generation against a dashed "no screening" ghost; map distance against recombination fraction, on Haldane's curve.
- **Stars.**
  - *Discover:* R introgressed with less than 10 cM of wild DNA around it.
  - *Predict:* at least two of three: crossovers per chromosome, gene order, wild share at generation 5.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed; arrows move over seedlings, M probes, Enter keeps. A class pool of introgressed segments. Prompt: "Why can't you breed away a gene that sits right next to the one you want?"
- **MODEL and nature.**
  - *MODEL:* one or two crossovers per bivalent with an obligate one and interference (realistic order); hotspots (designed); centimorgan map (realistic convention); marker costs (designed).
  - *In nature:* Sturtevant 1913; Haldane 1919; Tanksley et al. 1989; Young & Tanksley 1989.
- **Build and oracle.** `v2/cross.js` replaces `cross`, using Gen extension 1 (linked loci with an obligate crossover and interference). Oracles: recombination fraction follows the mapping function; the obligate-crossover rate holds; recombinants appear at 1 in 100 at 1 cM.

### 6.2 Lock and Key (`lock`)

*Tier 4 · Act 5 · the Lake shallows (mud-snail rig and larvae, shared with Why Sex?) and the Valley (a newt on the salamander rig; a new garter-snake rig) · M · Wave B · about 14 minutes · needs Act 4.*

- **Keep / Fix.**
  - *Keep:* the matching-alleles model with its 4% mutation/migration floor (G4 review); Brodie's speed cost of resistance; the Red Queen thread to Why Sex?.
  - *Fix:* the player is a forecaster, not a parasite lineage (G4; G6 #6); in L2 the player sets snake resistance, which is RC2 (R8); no geographic mosaic.
  - *Learning layer:* TRANSFER.lock becomes the opening gesture; MODEL.lock still says "deterministic updates" and must name the 4% input (G4 review).
- **Role and felt cost.**
  - *L1:* a parasite larva (Why Sex?'s verb, introduced here).
  - *L2 to boss:* a garter snake hunting newts, which makes it the selective agent on newt toxicity. Each generation the player's snake is drawn from the evolving snake population, as in Alarm Call's "continue as your daughter".
  - *Felt cost:* edible newts get rarer as toxicity escalates, and paralysis comes more often (a 3 s freeze, like Bitter Wings' retch).
- **Loops.**
  - *Second:* in L1, infect a matching snail. From L2, strike a newt: if its toxin exceeds your resistance you freeze for 3 s (shake and darkened corners, D4); otherwise it is a meal (200 ms).
  - *Minute:* one season of snail, newt and snake generations.
  - *Level:* one new variable.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| Opening | A parasite key and four host locks: drag next season's lock shares on the stacked bar. | Hosts are pushed toward whatever parasites cannot open. |
| L1 Keys and locks | Asexual snails; keys evolve through your infections; locks cycle as rare locks rise. Drag next season's lock shares. | Negative frequency-dependent coevolution cycles, given a mutation floor (D0 guardrail). |
| L2 The newt | Hunt newts. The less toxic ones die (you eat them), so toxicity rises, while your resistance is drawn from a snake population evolving alongside. Predict mean toxicity after 20 generations. | Escalation: your hunting selects the newts. |
| L3 The cost | Resistant snakes crawl slower (Brodie & Brodie 1999), so a resistant you misses fast prey. Predict where resistance settles when newts are mild. | Trade-offs keep adaptation imperfect. |
| Boss: The mosaic | Five ponds linked by gene flow. Hunt in each: hotspots have escalated, coldspots have mild newts and unresistant snakes, and gene flow carries mismatches between them. | Inverts "arms races escalate everywhere": the geographic mosaic (Brodie et al. 2002; Hanifin, Brodie & Brodie 2008). |

- **Picture and graph.** *Rung 0:* snails in the shallows; newts whose skin luminance shows their toxin, and snakes whose band pattern shows resistance. *Strip:* the lock-frequency stacked bar; mean toxicity and resistance (two lines); a boss map of matched and mismatched ponds.
- **Stars.**
  - *Discover:* cycles, escalation and a coldspot seen.
  - *Predict:* at least two of three: next season's lock shares (within ±0.1 in two of three seasons), toxicity at generation 20 (±20%), settling resistance (±20%).
  - *Transfer:* which ponds will be hotspots.
- **Access and teacher.** Untimed modes for both hunts. Prompt: "Why doesn't the snake simply evolve perfect resistance?"
- **MODEL and nature.**
  - *MODEL:* 4 matching alleles with a 4% floor (designed, G4); polygenic toxicity and resistance (designed); speed cost 0.06 per unit (legacy, designed); gene flow between ponds (designed).
  - *In nature:* Brodie & Brodie 1999; Brodie et al. 2002; Hanifin, Brodie & Brodie 2008; Thompson 2005; Dybdahl & Lively 1998 (snail–trematode cycles).
- **Build and oracle.** `v2/lock.js` replaces `lock`, sharing `v2/03_redqueen.js` with Why Sex?, plus the new snake rig and Gen additive loci. Oracles: the cycle's floor stays at or above 1%; escalation stops where the cost slope equals the benefit; the mosaic emerges at intermediate gene flow.

### 6.3 Twelve Flasks (`landscape`, retitled; absorbs The Landscape and Valley Crossing)

*Tier 4 · Act 5 · the Lab (twelve flasks and the freezer; microbe-cell rig) · L (D2 had M) · Wave B · about 18 minutes · needs The Scribe and Drift Casino.*

- **Keep / Fix.**
  - *Keep:* the Landscape's NK landscape (now hidden inside the flasks), sign epistasis, and the existing citations of Weinreich 2006 and Blount's citrate line (R7-R1).
  - *Fix:* uphill picks with foresight (G2 #6: walks should be stochastic, with fixation in proportion to s); L2 is a quiz; visuals 3.5; peak crossing is absent.
  - *Merge (integrator):* Valley Crossing becomes this unit's L3.
- **Role and felt cost.** The technician, an experimenter who transfers, freezes, thaws and plates, and never chooses mutations. The felt cost is diminishing returns: each further gain is smaller and needs a bigger competition assay to detect, while bench time per day is fixed.
- **Loops.**
  - *Second:* drag the pipette from yesterday's flask into fresh medium. The 1 : 100 transfer visibly samples cells within 200 ms. Tap the freezer to store a sample (a reminder every 500 generations), and plate competition assays in which red and white colonies bloom.
  - *Minute:* one day (6.6 generations), with runs of days time-lapsed.
  - *Level:* one new question.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Daily transfers | Twelve flasks from one ancestor; clones (lineage colours) rise and interfere. Draw the fitness curve you expect over 10,000 generations: it slows but never stops. | Diminishing returns and clonal interference; a new beneficial mutation fixes with probability roughly in proportion to s (a callback to Lottery of the New). |
| L2 Parallel and mutators | The same genes are hit in many flasks (GenomeStrip). A ×100 mutator clone appears and hitchhikes; predict how many flasks will carry one by 20,000 generations. | Parallel evolution; mutators hitchhike (Sniegowski, Gerrish & Lenski 1997). |
| L3 Valley crossing | The hidden landscape, drawn as D4's contour plate with a population cloud whose size follows N, has a valley between two peaks. Set the transfer volume for three flasks (small, intermediate, huge N) and place chips on which crosses first. Small N drifts across, huge N tunnels by double mutants, intermediate N gets stuck (Weissman et al. 2009). Then Weinreich's five-mutation β-lactamase: predict the share of the 120 mutation orders that are accessible. | Peaks, valleys and three N regimes; the order of mutations matters (Weinreich et al. 2006). |
| Boss: Citrate | Near 31,000 generations one flask goes cloudy (Blount et al. 2008). Thaw frozen vials from different times (a replay budget) to find when the potentiating change happened: citrate use re-evolves only from clones after about 20,000 generations. | Inverts "evolution would repeat itself": history matters. |

- **Picture and graph.** *Rung 0:* twelve shaken flasks whose turbidity is fitness; the freezer drawers (the freezer's in-world origin, D2 §1); colonies on assay plates. *Strip:* twelve fitness lines against a power-law ghost; chips on the valley table.
- **Stars.**
  - *Discover:* diminishing returns seen; a valley crossed; the potentiation found.
  - *Predict:* at least two of three: the fitness curve (±15% at 10,000), mutator flasks (±2), the valley chips (beating the threshold score).
  - *Transfer:* the potentiation window placed within 5,000 generations.
- **Access and teacher.** Untimed: days advance on Space. A class pool of replay results. Prompt: "If you replayed life's tape, would it come out the same? Use your citrate replays."
- **MODEL and nature.**
  - *MODEL:* asexual Wright–Fisher on `v2/00_wf.js` with N scaled down (designed); beneficial effects with diminishing returns (designed); ×100 mutator (realistic order); citrate gated on a potentiating mutation (designed after Blount); NK landscape (designed); Weinreich's landscape (realistic).
  - *In nature:* Lenski et al. 1991; Gerrish & Lenski 1998; Sniegowski, Gerrish & Lenski 1997; Blount et al. 2008; Wiser et al. 2013; Tenaillon et al. 2016; Weinreich et al. 2006; Weissman et al. 2009.
- **Build and oracle.** `v2/flasks.js` replaces `landscape` (id kept, retitled), using `v2/00_wf.js`, Gen extension 5 (lineages) and `Chips`. Oracles: a new beneficial mutation fixes with probability about 2s (×Ne/N); intermediate N is slowest to cross in the three-regime test over 500 seeds; the fitness curve fits a power law.

### 6.4 The Crowd (`crowd`)

*Tier 4 · Act 6 · the Streams (guppy rig) · M · Wave B · about 12 minutes · needs The Forager.*

- **Keep / Fix.**
  - *Keep:* the ideal-free-distribution (IFD) maths (R7-R2 A67) and the corrected total weight of 32.
  - *Fix:*
    - the crowd is scripted to the IFD (G4);
    - only 16 small fish moved, so the IFD could not be reached; the G4 review asked for big fish to move too;
    - the player is a calculator.
  - *Moved:* the information-cascade puzzles (old L3) become a Field Review mini-simulation.
- **Role and felt cost.** A fish among 24 (a behaving animal), whose rule then competes in the invasion view. The rich feeder crowds, and interference and shoving grow as more fish find the food.
- **Loops.**
  - *Second:* swim your fish between two feeders (drag or arrows). Pellets fall, and each one eaten fills your intake bar within 200 ms; crowding slows intake.
  - *Minute:* one 30 s feeding bout. Every AI fish follows one local rule: leave if my recent intake is below what I sense at the other patch, with a travel cost and noisy perception.
  - *Level:* one new variable.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Two feeders | Rates 2 : 1: drag the divider where the crowd will split. It nears the IFD but undermatches, and intakes equalise only roughly. | The IFD emerges from a local rule; undermatching is the norm (Kennedy & Gray 1993). |
| L2 Shovers | 8 big fish (weight 2) and 16 small (weight 1), all following the rule: predict the split in weight units (total 32). | The IFD counts competitive weight, not heads (Sutherland & Parker 1985). |
| L3 Your rule as a gene | Invasion view: your fitted leaving rule against "always rich" and "random"; drag each rule's share after 30 generations. | Selection makes fish behave as if they computed the IFD. |
| Boss: The despot | A territorial fish holds the rich feeder: predict the new split. | Inverts "everyone gets equal intake": the ideal despotic distribution (Fretwell & Lucas 1970). |

- **Picture and graph.** *Rung 0:* two feeders under pellet showers, with the fish themselves forming the split. *Strip:* the share at the rich feeder against the dashed IFD; your intake against the mean.
- **Stars.**
  - *Discover:* undermatching and the despot seen.
  - *Predict:* at least two of three: the L1 split (±0.07), the L2 weight split (±0.07), the L3 shares (±0.15).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed: each bout pauses every 5 s for a move. A shared class tank in Phase 3. Prompt: "Why do real animals undermatch?"
- **MODEL and nature.**
  - *MODEL:* 24 fish (designed); the local rule with noise and travel cost (designed); weights 1 and 2 (designed).
  - *In nature:* Fretwell & Lucas 1970; Milinski 1979; Harper 1982; Kennedy & Gray 1993; Sutherland & Parker 1985.
- **Build and oracle.** `v2/crowd.js` replaces `crowd`, with an agent rule and `Invasion`. Oracles: with no noise and no travel cost, the split converges to the IFD in weight; with noise it undermatches; the despot split matches theory.

### 6.5 The Slow Island (`livefast`, retitled; absorbs Live Fast and round 1's "Selection Shadow")

*Tier 4 · Act 6 · the Outer Islands (opossum rig ported from TB's `drawBeast`; fox rig shared with The Breeder) · M · Wave B · about 15 minutes · needs Act 5.*

- **Keep / Fix.**
  - *Keep:* TB Slow Island's trade-off model and mutation accumulation (correct, R4); grey fur marking the old; Austad's result of about 25% longer life (R7-R4 B37).
  - *Fix:*
    - Live Fast's corner optima and imposed ageing (R7-R2 A57);
    - TB's mostly watching (R4) and its 1.5× objective (R7-R4 C3);
    - senescence theory never named (R8 G6);
    - growth rate is r_m, never r (integrator).
- **Role and felt cost.** The fox, a selective agent whose goal is kits fed. Old opossums (grey) are slower and easier to catch, so the fox's age-targeting shapes the force of selection. The felt cost: hunting adults hard selects for earlier breeding, so the prey population shifts toward quick young animals.
- **Loops.**
  - *Second:* opossums cross the clearing; pounce on one (tap), and a catch lands within 200 ms. Meanwhile mutation cards land at random on the age conveyor.
  - *Minute:* one year: births, and the age pyramid updates.
  - *Level:* one new hazard.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 The shadow | Mainland: you hunt every age, and late-acting mutation cards pile up beyond the age most animals reach. Draw the force-of-selection curve before it is computed from survivorship. | Selection weakens with age (Medawar 1952; Hamilton 1966). |
| L2 Free youth, pay later | "Early benefit, late cost" cards arrive: drag each card type's frequency after 50 years. | Antagonistic pleiotropy (Williams 1957). |
| L3 The island | No foxes. The 1,500-year run has a scrubber, as in TB. Ageing slows and island animals live about 25% longer (Austad 1993); predict the lifespan ratio. Twist: you return as a hawk that takes only juveniles; in this model ageing need not speed up (Abrams 1993; marked model-dependent). | Lower extrinsic adult mortality favours slower ageing, under conditions. |
| Boss: Guppies | High-predation guppies did not age faster (Reznick et al. 2004): predict, then read the conditions. | Inverts the simple Williams prediction; Contested. |

- **Picture and graph.** *Rung 0:* island and mainland opossums whose fur greys with age; the age conveyor with its cards. *Strip:* Hamilton's force of selection beside mutation load by age; survivorship curves; the lifespan ratio against a 1.25 line.
- **Stars.**
  - *Discover:* late-acting load piled up; slower ageing evolved on the island.
  - *Predict:* at least two of three: the force curve's shape, the card frequencies (±0.15), the lifespan ratio (±0.1).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed hunts. Prompt: "Why don't animals simply evolve not to age?"
- **MODEL and nature.**
  - *MODEL:* TB's trade-off and age-specific count loci (legacy, designed); fox mortality (designed); s(x) ∝ Σ_{y≥x} e^(−r_m y) l(y) m(y) (theory); about 25% longer life (realistic target).
  - *In nature:* Medawar 1952; Williams 1957; Hamilton 1966; Austad 1993; Abrams 1993; Reznick et al. 2004; Jones et al. 2014.
- **Build and oracle.** `v2/slow.js` replaces `livefast` (retitled), porting the `steward.js` model. Oracles: the island lifespan ratio is about 1.25 at the designed parameters; mutation load rises with age at the predicted slope.

### 6.6 The Pond (`plastic`, retitled; from Shape-shifters)

*Tier 4 · Act 6 · the Pond (water-flea rig; the player is a fish, drawn as a shadow) and a desert annual (flower rig) · M · Wave B · about 14 minutes · needs Act 5.*

- **Keep / Fix.**
  - *Keep:* induced defences (Tollrian; Agrawal et al.); Cohen's bet-hedging.
  - *Fix:*
    - a worksheet, then a quiz (R2);
    - the twenty-season geometric mean is computed but never shown (G4);
    - "draw your clone's reaction norm" would be RC2 (R2), so the player releases a variant instead (amended G1).
- **Role and felt cost.** The fish predator, a selective agent whose goal is meals. In L4 the player is an experimenter who releases a mutant seed-bank strategy. The felt cost: as helmets spread, more bites fail (a helmeted flea takes a 1 s chew and often escapes), so meals shrink.
- **Loops.**
  - *Second:* swim and snap at water fleas (tap). Helmeted fleas slip away within 200 ms, and your presence leaves a cloud of kairomone around you.
  - *Minute:* one week. Clones reproduce, and helmets cost births.
  - *Level:* one new variable.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Helmets | Your hunting induces helmets in clones that sense your kairomone, and in their young (maternal induction). Predict the helmet share after 10 weeks where you hunt and where you don't. | An inducible defence is an evolved reaction norm (Agrawal, Laforsch & Tollrian 1999). |
| L2 Your habits as climate | Hunt constantly, patchily, or never; constitutive, plastic and undefended clones compete. Drag each clone type's share after 20 weeks. | Plasticity pays when the environment varies and the cue is reliable. |
| L3 False alarms | Kairomone drifts without you, an unreliable cue; plastic clones now pay for nothing. Drag each clone type's share. | Cue reliability decides. |
| L4 Seed bank | A desert annual. Release a mutant with a chosen germination fraction and run 50 years of random rain. A lineage that always germinates crashes in a run of dry years. Drag the winning fraction. | Bet-hedging and geometric-mean fitness (Cohen 1966): the crash is shown, not computed. |
| Boss: Assimilation | Constant predation for many generations: helmets become constitutive even without cues. | Inverts "plasticity is a fixed property": genetic assimilation (Waddington 1953). |

- **Picture and graph.** *Rung 0:* the pond, with the helmet as a silhouette feature and kairomone clouds; the desert, with dormant and germinating seeds in the soil. *Strip:* helmet share; competing reaction norms; lineage sizes on a log axis in L4, so the crash is visible.
- **Stars.**
  - *Discover:* induced helmets, the specialist crash and assimilation seen.
  - *Predict:* at least two of three: L1 shares, the L2 shares (±0.15), the L4 fraction (±0.1).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed hunting. Prompt: "Is a constant trait always genetic, and a variable one always plastic?"
- **MODEL and nature.**
  - *MODEL:* clone types with designed reaction norms; helmet cost, cue reliability, rain probability and the assimilation threshold (all designed).
  - *In nature:* Tollrian 1995; Agrawal, Laforsch & Tollrian 1999; Cohen 1966; Philippi & Seger 1989; Waddington 1953.
- **Build and oracle.** `v2/pond.js` replaces `plastic`, with clones on `v2/00_wf.js` and a Hunt-like fish. Oracles: in Cohen's simple model the optimal germination fraction equals the rain probability; plastic clones win only above the designed cue reliability.

### 6.7 Two Sizes (`gametes`)

*Tier 4 · Act 7 · the Shore (rock pools as a plankton sea; gametes as particles in a Petri-style scene) · M · Wave B · about 12 minutes · needs Act 5.*

- **Keep / Fix.**
  - *Keep:* the Parker–Baker–Smith model (a fair implementation, R2) and the bimodal sea histogram (D0 §2).
  - *Fix:* holding "tiny" wins (49% of the sea in five of five runs, R2); the player only ever plays the parasite (G3); the Notes print five sizes' fitness; RC2 (R8: set a *mutant's* size and watch it invade).
- **Role and felt cost.** An experimenter releasing mutant gametes into a resident sea that evolves after each generation. As the sea nears its stable point, fewer mutants invade, and finding the ones that do needs finer probing.
- **Loops.**
  - *Second:* set a size on the wheel and tap the sea to release one mutant gamete. It swims and fuses within 1–2 s, and the zygote grows or dies (200 ms feedback at fusion). The invasion meter ticks.
  - *Minute:* one generation; mutant sizes that succeeded join the residents.
  - *Level:* one new constraint.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 One size for all | An isogamous sea. Probe sizes and draw the invasion-fitness curve first: tiny mutants invade, living off their partners' provisions. | Invasion fitness. |
| L2 Provisioners appear | Zygote survival now rises steeply with size, so big mutants also invade. | Two ways to succeed. |
| L3 Branching | The sea splits into tiny and big; tiny–tiny fusions starve. Predict where the two peaks settle. | Disruptive selection from the size–number trade-off: anisogamy. |
| Boss: Mating types | Only cross-type fusions are allowed: drag the mating-type allele's frequency after 40 generations. | Inverts "sexes are about bodies": sexes are defined by gamete size. Competing hypotheses (gamete limitation, Lehtonen & Kokko 2011; cytoplasmic conflict, Hurst & Hamilton 1992) are Contested. |

- **Picture and graph.** *Rung 0:* the sea, with gametes drawn to scale, fusions as flashes, zygotes swelling or fading. *Strip:* the size histogram and the invasion-fitness curve.
- **Stars.**
  - *Discover:* branching occurred.
  - *Predict:* the invasion curve's shape and the peak positions (±20%).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed; ←/→ turn the size wheel, Space releases. Prompt: "Why are eggs big and sperm small? Which assumption matters most?"
- **MODEL and nature.**
  - *MODEL:* PBS fitness constants (designed); the residents evolve by adaptive dynamics (designed).
  - *In nature:* Parker, Baker & Smith 1972; Levitan 1996; Lehtonen & Kokko 2011; Hurst & Hamilton 1992.
- **Build and oracle.** `v2/gametes.js` replaces `gametes`, with `Invasion` and `v2/00_wf.js`. Oracles: the branching point matches the PBS analysis; a "hold tiny" bot cannot earn Predict or Transfer.

### 6.8 The Strutting Ground (`lek`, MERGE with TB Streams of Aripo)

*Tier 4 · Act 7 · the Meadow at dawn (the sage-grouse rig from the legacy Lek) and the Streams (Aripo guppies; the player as a pike cichlid, drawn as a shadow) · L · Wave B · about 18 minutes · needs Act 5.*

- **Keep / Fix.**
  - *Keep:* the hold-to-strut handicap level (Grafen 1990); TB Aripo's painted streams; Endler 1980; Rodd et al. 2002.
  - *Fix:*
    - no runaway despite the subtitle (R2);
    - level 1's no-recall sequential search is unlike real leks (R2);
    - the Aripo card's "drifted" and its claim that choosy females themselves carry the colour genes (R7-R4 C11);
    - no Bateman gradient, operational sex ratio (OSR) or lek paradox.
- **Role and felt cost.** A hen walking the lek, and a strutting male (both behaving animals); a predator in the Aripo streams (a selective agent whose goal is meals); then the invasion view. The felt cost:
  - getting close enough to judge a male exposes the hen to the eagle's shadow;
  - in Aripo, as males evolve drabber under your hunting, meals get harder.
- **Loops.**
  - *Second:* walk the hen among the males (drag; closer means a clearer display and a fuller exposure meter); hold to strut as the male (the condition meter drains); tap conspicuous male guppies as the predator.
  - *Minute:* one dawn or one season of matings and offspring.
  - *Level:* one new mechanism.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Who gets mated? | Watch a dawn lek, where a few males get most matings. Drag the mating-success histograms for males and for females. | The Bateman gradient and the OSR. The card covers role reversal in pipefish (Jones et al. 2000) and the OSR's limits as a driver (Kokko & Jennions 2008). |
| L2 The hen's walk | Choose a male within your exposure budget, with the option of copying other hens. | Costly choice; mate-choice copying (Gibson, Bradbury & Vehrencamp 1991). |
| L3 Hold to strut (legacy L2) | Strut on your condition meter. | Honest, condition-dependent signals. |
| L4 Runaway | Aripo plus the invasion view. Preference and ornament alleles appear as linked tokens in offspring (linkage disequilibrium). Predict where colour settles in a stream without you, and in yours. | Fisher–Lande–Kirkpatrick runaway through preference–ornament LD, held in check by predation (Endler 1980). |
| Boss: The lek paradox | Strong choice erodes variation in male quality until choosiness is worthless; condition that depends on many loci restores it. | Inverts "choice uses up variation" (Rowe & Houle 1996). |

- **Subtitle.** Once L4 ships, the subtitle becomes "Mate choice and runaway" (D2 §3).
- **Picture and graph.** *Rung 0:* the lek with displaying males and hens; streams with guppies whose colour patterns also carry spot shapes. *Strip:* mating-success histograms; ornament and preference means (two lines); an LD meter.
- **Stars.**
  - *Discover:* runaway seen, restrained by predation; the lek paradox seen.
  - *Predict:* at least two of three: the L1 distributions, the L4 settling colour (±15%), the boss's variance trend.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed modes for the hen and the predator; strutting has a token mode. Prompt: "Why would a female prefer a costly ornament that does her no good?"
- **MODEL and nature.**
  - *MODEL:* preference and ornament as additive loci (designed); viability cost of ornament (designed); predation pressure (designed by play); condition on many loci (designed).
  - *In nature:* Bateman 1948; Trivers 1972; Andersson 1982; Lande 1981; Kirkpatrick 1982; Endler 1980; Rodd et al. 2002; Kirkpatrick & Ryan 1991; Rowe & Houle 1996; Gibson, Bradbury & Vehrencamp 1991; Jones et al. 2000; Kokko & Jennions 2008.
- **Build and oracle.** `v2/lek.js` replaces `lek`. It ports the Aripo streams from `steward.js`, uses `Invasion`, and tracks preference–ornament LD with Gen extension 1. Oracles: LD builds under choice; the runaway threshold matches the Lande model.

### 6.9 The Fig (`brood`, retitled; from Fisher's Brood)

*Tier 4 · Act 7 · the Fig Grove (fig-wasp anchor rig; a cross-sectioned fig) · M · Wave B · about 14 minutes · needs Act 5.*

- **Keep / Fix.**
  - *Keep:* Hamilton's local mate competition (LMC) and Herre's fig wasps.
  - *Fix:* a linear payoff and a scripted population (G3); the diploid ESS used for haplodiploid wasps (R2); a male die-off presented as evolution; haplodiploid sex control is absent.
- **Role and felt cost.** A foundress (a behaving animal), whose sex-ratio rule then competes in the invasion view. Your sons compete with each other for mates inside the fig, and with rivals present each extra son is worth less; eggs are limited.
- **Loops.**
  - *Second:* drag each egg into a floret and flick it left (fertilised: a daughter) or right (unfertilised: a son) within 1 s; the floret shows the egg's sex badge within 200 ms.
  - *Minute:* one fig. Wingless males fight and mate, then females leave carrying pollen. You score dispersing granddaughters.
  - *Level:* a new number of foundresses, or a new rule.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Alone in the fig | How few sons can mate all your daughters? Drag the best son share first. | Local mate competition. |
| L2 Rivals | 2–4 foundresses; your rule is fitted from your laying. Predict the shift. | The haplodiploid ESS, (n − 1)(2n − 1)/[n(4n − 1)] (Taylor & Bulmer 1980; Herre 1985). |
| L3 Arriving second | Lay in a host that another female has already laid in (*Nasonia*): predict your son share. | Make more sons when your sons will mate others' daughters (Werren 1980). |
| L4 Your rule as an allele | Invasion view: your fitted rule against "1 : 1" and "all daughters". | Fisher's rarer-sex logic, played as invasion. |
| Boss: A feminiser | *Wolbachia* (or an X driver) biases the population, and a suppressor arises: drag its frequency after 30 generations. | Inverts "mothers set the sex ratio": selfish elements do too. |

- **Picture and graph.** *Rung 0:* the lit florets with eggs; males fighting inside; females leaving. *Strip:* son share against foundress number, with the haplodiploid ESS ghost; the invasion line; D4's XHud in its haplodiploid variant for the suppressor locus.
- **Stars.**
  - *Discover:* granddaughters above the line; the suppressor spread.
  - *Predict:* at least two of three: the L1 share, the L2 ESS (±0.05), the L3 share (±0.05).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed laying; ←/→ fertilise or not. A class pool of son shares against foundress number. Prompt: "Why do fig wasps make few sons, when most animals make half?"
- **MODEL and nature.**
  - *MODEL:* haplodiploid genetics; LMC; the ESS formula (exact); egg number (designed); *Wolbachia* transmission (designed).
  - *In nature:* Hamilton 1967; Taylor & Bulmer 1980; Herre 1985; Werren 1980; Fisher 1930.
- **Build and oracle.** `v2/fig.js` replaces `brood`, using Gen extension 3 (haplodiploidy through `Gen.hap`) and `Invasion`. Oracles: the invasion-optimal son share equals the haplodiploid ESS; a large panmictic population goes to 1 : 1.

### 6.10 The Selfish Spindle (`spindle`; KEEP L1, REBUILD L2–3)

*Tier 4 · Act 7 · the Lab (the legacy mouse rig), an Expedition to a stalk-eyed-fly forest (fruit-fly rig with long eyestalks) and an island map (mosquito rig shared with Malaria Coast) · M · Wave B · about 15 minutes · needs Act 5.*

- **Keep / Fix.**
  - *Keep:* L1's binomial detective (non-favourite KEEP & POLISH: a real verb with an exact test) and the references (t-haplotype, Akera, Kyrou).
  - *Fix:* L2 is mostly luck (G3); L3 has one obvious choice; suppressors are never played; sex-ratio drive is absent (G3).
- **Role and felt cost.** An investigator in L1; a female stalk-eyed fly choosing mates in L2 (a behaving animal), then the invasion view; an experimenter releasing gene-drive mosquitoes in L3. The felt cost: in L2, driven males sire broods of daughters; in L3, resistance alleles rise as the drive spreads.
- **Loops.**
  - *Second:* pups appear one at a time from a litter (200 ms each); hop toward a displaying male with visible eyespan; drag a release vial onto a village and watch the mosquitoes spread.
  - *Minute:* one litter, one season, or one generation of the drive.
  - *Level:* one new element.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Who cheats? (kept) | Breed litters; name the cheating allele and its transmission rate with an exact binomial test. | Meiotic drive, detected statistically. |
| L2 Long eyes | A driver on the X makes males sire mostly daughters, and long-eyespan males rarely carry it (Wilkinson, Presgraves & Crymes 1998; verify whether eyespan tracks the driver or a suppressor). Choose mates by eyespan, and predict the population's sex ratio with and without your choosiness. | Drive and suppression; female choice as the genome's defence; a callback to The Fig's sex ratio. |
| L3 The drive | Release a doublesex-targeting drive on an island map; resistance appears at other targets. Predict the spread time. | Gene drive, and why its target matters (Kyrou et al. 2018). |
| Boss: Resistance | Choose between a multiplexed drive and an X-shredder. An ethics card follows, Contested, with no star for a side. | Inverts "a drive always spreads". |

- **Picture and graph.** *Rung 0:* the litter on the bench; flies with eyestalks; the island map of villages. *Strip:* transmission rate with an exact confidence interval; sex ratio; drive and resistance frequencies.
- **Stars.**
  - *Discover:* the cheater identified; the suppressor spread; the drive spread.
  - *Predict:* the L2 sex ratio and the L3 spread time (±20%).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed. Prompt: "Why doesn't the genome let selfish elements win?"
- **MODEL and nature.**
  - *MODEL:* transmission rates (realistic for the t-haplotype, near 0.9; designed elsewhere); drive efficiency and resistance rate (designed, on Kyrou's orders of magnitude).
  - *In nature:* Lyon 2003; Wilkinson, Presgraves & Crymes 1998; Akera et al. 2017; Kyrou et al. 2018; Burt & Trivers 2006.
- **Build and oracle.** `v2/spindle.js` replaces `spindle`, keeping L1's code and using Gen extension 3 for the X driver. Oracles: exact binomial; the drive's spread curve; the suppressor invades when daughters-only broods are costly.

### 6.11 The Meadow (`meadow`)

*Tier 4 · Act 7 · the Meadow (bee anchor rig; a new hawkmoth rig; the flower rig) · M · Wave B · about 15 minutes · needs Act 5.*

- **Keep / Fix.**
  - *Keep:* pollination syndromes as tendencies; Darwin, Nilsson 1988, and the Wasserthal 1997 debate; *Xanthopan praedicta*.
  - *Fix:*
    - the player designs flowers (misconception 1; R8);
    - L2's best spur is a constant offset (G4);
    - the subtitle promises fertilisation;
    - the pollinators must evolve too (D2 §18.2's condition for "Pollination and coevolution").
- **Role and felt cost.** A pollinator (a behaving animal): a bee, then a hawkmoth, then a carrier of pollen. In the invasion view, the moth population's tongue lengths evolve. As spurs lengthen, your tongue reaches nectar less often, until the moths catch up.
- **Loops.**
  - *Second:* fly to a flower (drag) and probe (hold). Nectar fills your bar if you reach it, and pollen sticks within 200 ms.
  - *Minute:* one day of visits; seeds set; flower variants breed.
  - *Level:* one new pollinator or rule.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Bee eyes | Toggle bee vision (UV). Bees choose by colour, so colour variants rise or fall; a hummingbird day flips it. Predict the colour shift. | Pollinators select flowers (the *Mimulus* YUP swap; Bradshaw & Schemske 2003). |
| L2 The long spur | As a hawkmoth: flowers whose nectar you barely reach get your pollen best, so deeper spurs are selected, while the moth population's tongue length evolves too. Predict both distributions after 30 generations. | Coevolution: two evolving distributions. This meets D2's subtitle condition. |
| L3 The style | S-alleles: pollen tubes carrying a matching S allele stop. Rare S alleles sire more seed. Predict how many S alleles the population will hold. | Negative frequency dependence moves allele frequencies (a callback to The Pedigree; Wright 1939; about 45 alleles in *Oenothera organensis*, Emerson 1939). |
| Boss: The empty summer | Pollinators vanish: selfing variants give reproductive assurance, then inbreeding depression bites the next year. Predict the selfing share. | Inverts "outcrossing always wins". |

- **Picture and graph.** *Rung 0:* the meadow, with spur length and UV pattern visible on each flower and the moth's tongue drawn to scale; pollen tubes in a cross-section of the style. *Strip:* spur and tongue distributions; the S-allele count.
- **Stars.**
  - *Discover:* coevolution seen; S alleles multiplied; selfing rose, then fell.
  - *Predict:* at least two of three: the colour shift, the two distributions (±15%), the S count (±5).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed flight with tokens. Prompt: "Darwin predicted a moth with a 30-cm tongue. What did he assume about the orchid and the moth?"
- **MODEL and nature.**
  - *MODEL:* polygenic spur and tongue (designed); a many-allele S locus (designed; Emerson's count realistic); inbreeding depression (designed).
  - *In nature:* Darwin 1862; Nilsson 1988; Wasserthal 1997; Minet et al. 2021; Bradshaw & Schemske 2003; Emerson 1939; Wright 1939.
- **Build and oracle.** `v2/meadow.js` replaces `meadow`, using Gen extension 2 (S alleles) and `Invasion` for tongue lineages; the subtitle patch ships with L2. Oracles: the equilibrium S-allele count scales with N; spur–tongue escalation occurs.

### 6.12 The Nest (`nest`)

*Tier 4 · Act 8 · the Hedge (great-tit anchor; a dunnock as a variant of the bird rig; a cuckoo egg and chick) · M · Wave B · about 15 minutes · needs Acts 6 and 7.*

- **Keep / Fix.**
  - *Keep:* L1's frantic chick feeding ("fun for one spring", R2) and L3's sibling rivalry (Mock 1984).
  - *Fix:* eggs are free (G3; R2); the parent is a passive lottery, so honest begging cannot arise; the cuckoo becomes the boss (D2).
  - *Moved:* imprinting goes to the Placenta side quest.
- **Role and felt cost.** A parent bird (a behaving animal) feeding chicks; a chick begging against an evolving parental rule (a behaving animal, then the invasion view); a host parent ejecting eggs. The felt cost: eggs cost energy carried into next year, and as cuckoo eggs evolve to match, rejection errors rise.
- **Loops.**
  - *Second:* tap a gaping chick to feed it (food in the beak, 200 ms); hold to beg as the chick (louder begging draws food and predators); flick an egg out as the host.
  - *Minute:* one day or one brood; next year's condition.
  - *Level:* one new conflict.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Costly eggs | Lay a clutch egg by egg, each costing energy shown on next spring's condition bar, then feed the chicks. Predict the clutch that fledges most over two springs. | Lack's clutch size with real costs: the best clutch is smaller than one season's maximum. |
| L2 Begging | You are a chick, and the parent's response rule evolves (an invasion of parental rules). Drag the begging–hunger correlation you expect after 30 generations. | Honest signalling of need can evolve (Godfray 1991). |
| L3 Hatching order | Hatching is staggered: drag each chick's chance of surviving a lean week. | Brood reduction; Lack's hypothesis is Contested (D0). |
| Boss: The cuckoo | As a dunnock-like host, eject or accept. Cuckoo eggs evolve mimicry, and your acceptance threshold trades one error against the other (Reeve 1989). Twist: real dunnocks accept non-mimetic eggs (Davies & Brooke 1989). Is that lag or cost? | Inverts "hosts always reject". |

- **Picture and graph.** *Rung 0:* the nest with gaping chicks, whose size and fullness are visible, and patterned eggs. *Strip:* fledglings against clutch size; begging against hunger; acceptance errors.
- **Stars.**
  - *Discover:* fledglings above the line over two springs; honest begging emerged.
  - *Predict:* at least two of three: the clutch (±1), the begging–hunger correlation (±0.2), the lean-week chances (±0.15).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed feeding tokens. Prompt: "Why might a parent lay more eggs than it can feed?"
- **MODEL and nature.**
  - *MODEL:* food rates and egg cost (designed); parental-rule alleles (designed); evolution of cuckoo mimicry (designed).
  - *In nature:* Lack 1947; Perrins 1965; Godfray 1991; Parker, Royle & Hartley 2002; Mock 1984; Reeve 1989; Davies & Brooke 1989; Davies 2000.
- **Build and oracle.** `v2/nest.js` replaces `nest`, using `Invasion`. Oracles: the clutch-size ESS under costs; the signalling equilibrium.

### 6.13 Blood Debts (`bats`)

*Tier 4 · Act 8 · an Expedition to a roost (the legacy bat rig, upgraded to actor size) · M · Wave B · about 14 minutes · needs Acts 6 and 7; Alarm Call is the suggested prior unit.*

- **Keep / Fix.**
  - *Keep:* Wilkinson's blood sharing; the corrected failure rates (juveniles about 35%, adults about 7%; R7-R1 #7).
  - *Fix:* fixed opponent strategies; no kin, bonds or partner choice (G2 #10); Carter's later work missing.
- **Role and felt cost.** A bat returning to the roost (a behaving animal); its rule then competes in a tournament. Hungry nights come in runs, refusing costs partners, and grooming takes time from rest.
- **Loops.**
  - *Second:* as bats return, a hungry roostmate begs. Share (tap: a regurgitation animation, 200 ms) or refuse; hold to groom, and a bond thread thickens.
  - *Minute:* one night.
  - *Level:* one new mechanism.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 The roost | Kin and non-kin roost together; share or refuse. Drag how many roostmates will be alive in 10 nights. | Sharing pays through kin and through return. |
| L2 Bonds | Grooming builds threads, and partners who share back are insurance. A partner-removal test shows who replaces whom. | Social bonds as insurance networks (Carter & Wilkinson 2015; Carter, Farine & Wilkinson 2017). |
| L3 Partner choice | Refusers lose partners, and cheats starve. | Partner choice enforces reciprocity. |
| L4 Write your rule | Compose a rule from blocks; it enters an Axelrod-style tournament and the invasion view. Drag each rule's final share. | Strategies that cooperate first and retaliate do well when encounters repeat (Axelrod & Hamilton 1981). |
| Boss: Rare meetings | A roost where pairs rarely meet again: reciprocity collapses. | Inverts "reciprocity always works": the shadow of the future must be long. |

- **Picture and graph.** *Rung 0:* the roost, with bats and bond threads. *Strip:* survival; the bond network; tournament scores.
- **Stars.**
  - *Discover:* an insurance network formed.
  - *Predict:* survivors (±2) and the tournament shares (±0.15).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed. A class tournament, as in R8. Prompt: "Why is reciprocity rare in nature?"
- **MODEL and nature.**
  - *MODEL:* hunger probabilities (realistic, R7); bond dynamics (designed).
  - *In nature:* Trivers 1971; Wilkinson 1984 (who also found kinship effects); Axelrod & Hamilton 1981; Carter & Wilkinson 2015; Carter, Farine & Wilkinson 2017.
- **Build and oracle.** `v2/bats.js` replaces `bats`, using `Invasion`. Oracle: rules like tit-for-tat are stable only when the chance of meeting again exceeds c/b.

### 6.14 Many Become One (`many`)

*Tier 4 · Act 8 · the Lab and the Pond (microbe-cell rig: snowflake-yeast clusters, *Volvox* colonies, slime-mould amoebae) · M · Wave B · about 14 minutes · needs Acts 6 and 7.*

- **Keep / Fix.**
  - *Keep:* L1's settle-then-transfer tension (Ratcliff et al. 2012) and the Stokes scaling of settling with N^(2/3).
  - *Fix:* L2 is whack-a-mole with cheaters at 6% per division (R2; G4), now tagged ×N; the single-cell bottleneck is stated, not played (G4); *Volvox* and *Dictyostelium* are missing.
- **Role and felt cost.** An experimenter: transfers that select for settling, a life-cycle designer choosing propagule size, and a releaser of mutant colonies. Bigger clusters settle faster but break more easily, and cheaters rise inside propagules of many cells.
- **Loops.**
  - *Second:* tap Transfer as clusters settle (kept); a mistimed transfer loses the fast settlers (the pipette visibly catches whatever is at the bottom, 200 ms). Drag the split slider to set propagule size.
  - *Minute:* one day, or one life cycle.
  - *Level:* one new transition.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Snowflakes (kept) | Settle and transfer; clusters grow. Predict cluster size after 10 days. | Selection on settling makes multicellular clusters (Ratcliff et al. 2012). |
| L2 The bottleneck | Cheater cells arise inside bodies (×N rate). Choose propagule size, single cell or fragments, and predict the cheater share under each. | A single-cell bottleneck makes every body a clone and purges cheaters. |
| L3 *Volvox* | Release mutant colonies with different germ–soma splits: the flagellation constraint emerges, so large colonies need dedicated swimmers. | Division of labour (Kirk 2005; Michod 2007). |
| Boss: *Dictyostelium* | Aggregating amoebae; cheaters dodge the stalk; kin discrimination evolves. | Inverts "multicellular bodies are always clones" (Strassmann, Zhu & Queller 2000). |

- **Picture and graph.** *Rung 0:* the tube with settling clusters; bodies with cheater cells drawn hollow; slime mould aggregating. *Strip:* cluster size; cheater share against propagule size.
- **Stars.**
  - *Discover:* clusters evolved; cheaters purged by the bottleneck.
  - *Predict:* cluster size (±20%) and the cheater shares.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed transfer timing on a scrubber. Prompt: "Why do most animals start life as a single cell?"
- **MODEL and nature.**
  - *MODEL:* settling scaling (realistic); cheater rate per division (×N; real rates are far lower); allocation (designed).
  - *In nature:* Ratcliff et al. 2012; Kirk 2005; Michod 2007; Strassmann, Zhu & Queller 2000; Maynard Smith & Szathmáry 1995.
- **Build and oracle.** `v2/many.js` replaces `many`, using D4's Petri scene. Oracle: propagule size against relatedness within bodies, and the resulting cheater share.

### 6.15 The Guest (`guest`; KEEP L1, REBUILD L2)

*Tier 4 · Act 8 · the Meadow (clover roots with nodules: a new root-and-nodule rig on D4's Petri scene) · M · Wave B · about 13 minutes · needs Acts 6 and 7.*

- **Keep / Fix.**
  - *Keep:* L1's sanctions puzzle (non-favourite KEEP & POLISH): allocate 12 oxygen units to nodules on noisy nitrogen readings (Kiers et al. 2003). It is now drawn as a growing root whose nodules swell or wither.
  - *Fix:* L2 is a quiz (R3); the *Wolbachia* exception is missing (R7-R3 M26); no partner choice against sanctions (G5); no mutualism breakdown.
- **Role and felt cost.** The host plant as environment in L1 (sanctions); an experimenter releasing a symbiont strain in L2; a host choosing partners in L3; the environment again in the boss (fertiliser). Cheating rhizobia mimic good readings, and the noise rises.
- **Loops.**
  - *Second:* drag oxygen tokens onto nodules; they swell or wither within 200 ms. In L2, tap to release a mutant strain into hosts.
  - *Minute:* one season.
  - *Level:* one new mechanism.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Sanctions (kept, polished) | Ration oxygen; predict the cheater share next season. | Hosts police partners after infection (Kiers et al. 2003). |
| L2 Transmission | Release a more virulent or a more mutualistic mutant under vertical and under horizontal transmission; drag each strain's frequency after 30 generations. Twist: *Wolbachia* passes vertically yet is a reproductive parasite (cytoplasmic incompatibility). | Shared fates favour mutualism, with exceptions. |
| L3 Choose or punish | Partner choice (signals before infection) against sanctions (after), with cheats that fake signals. | Two enforcement routes, each with weaknesses (Simms & Taylor 2002). |
| Boss: Fertiliser | Nitrogen-rich soil makes sanctions pointless, and the rhizobia evolve to be less mutualistic. | Inverts "mutualisms are stable" (Weese et al. 2015). |

- **Picture and graph.** *Rung 0:* the root with nodules, filled or hollow by health (no colour-only meaning). *Strip:* cheater share; host growth.
- **Stars.**
  - *Discover:* cheaters held below the line; breakdown seen.
  - *Predict:* the cheater share and the strain frequencies (±0.15).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed. Prompt: "Why don't plants just pick the best partners?"
- **MODEL and nature.**
  - *MODEL:* noisy readings, transmission modes and the fertiliser effect (designed; the last a qualitative fit to Weese et al. 2015).
  - *In nature:* Kiers et al. 2003; Simms & Taylor 2002; Weese et al. 2015; Werren, Baldo & Clark 2008.
- **Build and oracle.** `v2/guest.js` replaces `guest`, keeping L1's logic. Oracles: the sanction threshold; vertical transmission favours mutualism except under cytoplasmic incompatibility.

### 6.16 Copy and Paste (`copy`)

*Tier 4 · Act 9 · the Lab (the sequencer; D4's GenomeStrip drawn as a city street) · M · Wave C · about 14 minutes · needs Acts 1 and 4.*

- **Keep / Fix.**
  - *Keep:* P × M hybrid dysgenesis with maternal piRNA; the duplication–degeneration–complementation (DDC) model.
  - *Fix:* two quizzes in disguise (R3); pseudogenisation, the commonest fate, is underplayed; missing are the share of genomes made of transposable elements (TEs; about 45% of the human genome), TE domestication (RAG1/2, syncytin) and whole-genome duplication (G5).
- **Role and felt cost.** The host genome's defence (the environment inside the genome): place piRNA silencers that pass only through eggs, then bet on the fates of duplicate genes with chips. TEs mutate to escape the silencers: an arms race.
- **Loops.**
  - *Second:* TE copies hop along the chromosome street (a 200 ms jump); tap a TE family to start silencer production in a germ line; drag chips onto duplicate fates.
  - *Minute:* one generation, or one duplicate's history.
  - *Level:* one new event.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Invasion | A P element invades a naive (M) genome. Drag the fertility you expect from each reciprocal cross: M mother × P father is sterile; the reverse is fertile. | Silencing passes through the egg as maternal piRNA (Kidwell, Kidwell & Sved 1977; Brennecke et al. 2008). |
| L2 Silencers | piRNA clusters capture TEs and silencing spreads through mothers; TEs escape by mutation. Predict the TE share at balance. | A genomic arms race (Jacobs et al. 2014). |
| L3 Duplicates | A gene duplicates, and mutations hit both copies. Chip the fates: pseudogene (commonest), subfunctionalisation (DDC; Force et al. 1999), neofunctionalisation. | Most duplicates die young (Lynch & Conery 2000). |
| Boss: Domestication | A TE gene becomes a host gene: syncytin in the placenta (Mi et al. 2000), RAG1/2 in immunity (Huang et al. 2016). | Inverts "TEs are only parasites". |

- **Picture and graph.** *Rung 0:* the chromosome as a street of houses (genes) with TE graffiti spreading. *Strip:* TE share; duplicate fate shares against your chips.
- **Stars.**
  - *Discover:* silencing established; a domestication seen.
  - *Predict:* at least two of three: the cross fertilities, the TE share, the chip score.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed. Prompt: "Almost half your genome comes from transposons. Is it junk?"
- **MODEL and nature.**
  - *MODEL:* transposition rate (×N); silencer capture (designed); duplicate-fate rates (designed on Lynch & Conery's orders of magnitude).
  - *In nature:* Kidwell, Kidwell & Sved 1977; Brennecke et al. 2008; Lander et al. 2001; Force et al. 1999; Lynch & Conery 2000; Mi et al. 2000; Huang et al. 2016.
- **Build and oracle.** `v2/copy.js` replaces `copy`, using GenomeStrip and `Chips`. Oracles: TE copy number reaches equilibrium; the DDC preservation probability rises with the number of subfunctions.

### 6.17 The Sweep (`sweep`; KEEP L1, REBUILD L2)

*Tier 4 · Act 9 · the Lab (D4's GenomeStrip; haplotype bars) · M · Wave C · about 13 minutes · needs Acts 1 and 4; Tangled Pairs comes before it once built (D2).*

- **Keep / Fix.**
  - *Keep:* L1's Battleship-style search (sequence 7 of 40 windows), now on D1's `Evidence` widget.
  - *Fix:* L2 is a labelling quiz; decoys, the SFS and Tajima's D are absent (G5).
- **Role and felt cost.** An investigator with a sequencing budget, where false positives cost. Decoy valleys multiply in later scans.
- **Loops.**
  - *Second:* tap a window to sequence it; its diversity bar rises within 200 ms. In L2, watch haplotype bars hitchhike while recombination chops them.
  - *Minute:* one scan.
  - *Level:* one new confound.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 The valley (kept) | Find the diversity valley with seven windows. | A sweep leaves a valley of diversity. |
| L2 Watch a sweep | A forward simulation: drag the two edges of the valley you expect before it forms. | Valley width scales with s/ρ (Maynard Smith & Haigh 1974). |
| L3 Soft or hard | Selection on standing variation: drag the number of distinct haplotypes you expect at the selected site. | Soft sweeps leave several haplotypes (Hermisson & Pennings 2005). |
| Boss: Decoys | Genome scans with a population bottleneck (valleys everywhere) and background-selection cold spots. Buy the SFS and a second population, then call peaks with confidence; false positives cost. | Inverts "every valley is a sweep" (Charlesworth, Morgan & Charlesworth 1993). |

- **Picture and graph.** *Rung 0:* haplotype bars stacking in a population strip. *Strip:* diversity along the chromosome; Tajima's D along the chromosome.
- **Stars.**
  - *Discover:* the valley found; the decoys rejected.
  - *Predict:* the width (±25%) and the haplotype count (±1).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed. Prompt: "A valley in diversity: name three causes, and how you would tell them apart."
- **MODEL and nature.**
  - *MODEL:* s and ρ (designed); the background-selection model (designed).
  - *In nature:* Maynard Smith & Haigh 1974; Kaplan, Hudson & Langley 1989; Charlesworth, Morgan & Charlesworth 1993; Hermisson & Pennings 2005; Bersaglieri et al. 2004.
- **Build and oracle.** `v2/sweep.js` replaces `sweep`, keeping L1 and using Gen extension 1 (linked loci). Oracles: valley width scales with s/ρ; background selection lowers diversity without an excess of high-frequency derived alleles.

### 6.18 The Clock (`clock`, REBUILD; merged with Silent Letters)

*Tier 4 · Act 9 · the Archive (`TreeView` with real taxa) and the Lab (a protein ribbon and codon tiles on GenomeStrip) · M · Wave C · about 15 minutes · needs Acts 1 and 4; Lottery of the New is the suggested prior unit.*

- **Keep / Fix.**
  - *Keep:* the Jukes–Cantor correction (the legacy L2 toggle); fixed real pairs (human–chimp about 7 Myr; plants–animals about 1.5 Gyr; R7-R3 #1).
  - *Fix:*
    - arithmetic with a slider, "the dullest chapter in this slice" (R3);
    - no rate variation, relative-rate test or calibration uncertainty (G5);
    - merges Silent Letters' content (integrator);
    - Silent Letters set a dial and watched (integrator), so the verb is now a constraint brush with live substitution rain.
- **Role and felt cost.** In L1–L3 the player is the environment, here the protein's job: they paint constraint onto regions. In L4 and the boss they are an investigator who places calibrations and tests rates. The rain speeds up, calibrations are uncertain, and sequencing has a budget.
- **Loops.**
  - *Second:* drag the constraint brush along the protein ribbon (active site, surface, switched off). Substitutions rain down as codon tiles that pop pale (synonymous) or bold (nonsynonymous) within 200 ms, and the dN/dS meter moves.
  - *Minute:* one million years of rain, compressed.
  - *Level:* one new question.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Big and small | A big and a small population race substitution counters; drag both counts after one million years. They tie: more mutations arise in the big one, but fewer fix. | The neutral substitution rate equals μ, whatever N (Kimura 1968). |
| L2 The protein's job | Paint regions; predict dN/dS for each: about 0.01 at the active site, 0.3 at the surface, 1 in a switched-off copy. | dN/dS separates purifying selection from neutrality. |
| L3 The arms race | A virus arrives, and a few contact sites exceed 1. Find them on a sequencing budget across species. Twist: the gene-wide average stays below 1. | Positive selection at a few sites (Sawyer et al. 2005, TRIM5α). |
| L4 The clock on a tree | Place fossil calibrations as uncertain bars and date a split. A rodent lineage runs fast; catch it with a relative-rate test (drag an outgroup comparison). | The clock ticks more per generation than per year (Wu & Li 1985). |
| Boss: Small populations | A small-Ne lineage shows a higher dN/dS: slightly harmful changes fix there. | Inverts "a raised dN/dS means positive selection": the nearly neutral theory (Ohta 1973; Popadin et al. 2007). |

- **Picture and graph.** *Rung 0:* codon tiles on the ribbon; branches with ticks popping. *Strip:* cumulative dN and dS; per-site dN/dS; date estimates with their calibration bars.
- **Stars.**
  - *Discover:* the tie, the positive sites and the fast lineage found.
  - *Predict:* at least two of three: the two counts (a tie, ±20%), the dN/dS bands, the date (±15%).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed. Prompt: "Why does the neutral substitution rate not depend on population size?"
- **MODEL and nature.**
  - *MODEL:* a codon model with κ = 2 (designed); Kimura fixation (theory); calibrations (realistic pairs); a rodent rate about twice the primate rate (realistic order).
  - *In nature:* Kimura 1968; Ohta 1973; Li, Gojobori & Nei 1981; Hughes & Nei 1988; Sawyer et al. 2005; Wu & Li 1985; Popadin et al. 2007; Margoliash 1963.
- **Build and oracle.** `v2/clock.js` replaces `clock`, using GenomeStrip and `TreeView`. Oracles: the neutral rate equals μ across N; dN/dS falls under purifying selection; the relative-rate test detects the fast lineage.

### 6.19 Two Fruits (`fruits`)

*Tier 4 · Act 10 · an Expedition to a Hudson Valley orchard (fruit-fly rig variant: the apple maggot fly; apple and hawthorn trees as props) · M · Wave C · about 14 minutes · needs Acts 1, 4 and 5; Seed Rain's split level is the suggested prior unit.*

- **Keep / Fix.**
  - *Keep:* the *Rhagoletis* story, including the inversion's Mexican origin (already in the text, R7-R3 FR4).
  - *Fix:* it is entirely a prediction quiz (R3); in the model, selection acts on timing, not preference (R7-R3 FR3); D2 flagged it as having no per-second verb.
  - *Learning layer:* TRANSFER.fruits becomes the opening gesture (D2 §8).
- **Role and felt cost.** The grower, a selective agent: pick infested apples before the larvae drop. The felt cost: as the apple race's emergence timing comes to match apple ripening, more apples are infested and the job gets harder (G2).
- **Loops.**
  - *Second:* tap a fruit with a puncture mark to pick it; the larvae inside are removed (200 ms). Missed fruit drop larvae into the soil.
  - *Minute:* one season. Flies emerge on their own schedules, mate on their host fruit and lay; the timing histogram updates.
  - *Level:* one new factor.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| Opening (the old TRANSFER.fruits card) | Callback to Seed Rain: drag the beak histogram you expect after 20 winters that kill the middle-sized birds. It widens but keeps one peak, because mating refills the middle. | Splitting needs mating to follow the ecological divide. |
| L1 New fruit (the 1860s) | Apples are planted beside hawthorns and some flies shift host. Predict the apple race's share after 20 seasons. | A new host is a new environment. |
| L2 Clocks | Apples ripen earlier, and emergence time diverges. Drag the two peaks you expect. | Divergent selection on timing. Mating on the host makes host choice double as mate choice. |
| L3 The inversion | Migrants carrying an inversion with diapause alleles arrive, by introgression from Mexico (Feder et al. 2003); recombination is suppressed, and linkage disequilibrium becomes visible. | Inversions hold co-adapted alleles together. |
| Boss: Gene flow | Without the inversion, recombination shreds the link between timing and host: drag the timing gap you expect after 50 seasons. | Inverts "divergent selection always makes species". |

- **Picture and graph.** *Rung 0:* the orchard, with apple and hawthorn trees and flies on fruit. *Strip:* emergence histograms for the two races; an LD meter.
- **Stars.**
  - *Discover:* the races diverged in timing.
  - *Predict:* at least two of three: the share, the gap (±5 days), the LD.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed picking tokens. Prompt: "Can a species split without a mountain or a river between its halves?"
- **MODEL and nature.**
  - *MODEL:* emergence-time loci inside an inversion (designed); ripening dates (realistic order: apples about three weeks earlier); your picking rate (play).
  - *In nature:* Bush 1969; Feder et al. 1994, 2003; Filchak, Roethele & Feder 2000; Servedio et al. 2011.
- **Build and oracle.** `v2/fruits.js` replaces `fruits`, using Gen extension 1 (an inversion flag). Oracles: the gene-flow threshold for divergence; the inversion maintains LD.

### 6.20 The Ring (`ring`)

*Tier 4 · Act 10 · the Valley (salamander anchor rig) · M · Wave C · about 13 minutes · needs Acts 1, 4 and 5.*

- **Keep / Fix.**
  - *Keep:* *Ensatina*; the existing "messier than the textbook" caveat (Pereira & Wake 2009; Alcaide et al. 2014); the interbreeding values (R7-R3 RG1).
  - *Fix:* a clean 12-site ring with one break (G5); the warbler-song error (R7-R3 #3); D2 flagged no per-second verb.
- **Role and felt cost.** A dispersing salamander (a behaving animal) that walks round the valley courting neighbours, so its lineage carries genes round the ring. Courtship succeeds less often as you go further, and each failure costs a season.
- **Loops.**
  - *Second:* walk (drag). At each neighbour, a courtship rhythm: tap on the partner's beat. Success depends on genetic distance (200 ms feedback).
  - *Minute:* one season's walk.
  - *Level:* one new structure.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 Neighbours | Courtship succeeds with neighbours: predict success two valleys over. | Gene flow between neighbours. |
| L2 Around the valley | The two ends overlap and fail to interbreed: predict where courtship will fail. | A ring of gradual change. |
| L3 The hidden break | An internal break sits between two neighbours: find it with a limited number of courtships (an investigator). | Rings are not clean. |
| Boss: Messier rings | A historical gap (the greenish warbler; Alcaide et al. 2014), and songs simple in the south but complex at both northern ends, in different ways (Irwin, Bensch & Price 2001; verify). | Inverts "a clean ring of species". |

- **Picture and graph.** *Rung 0:* the valley ring, its salamander populations' patterns grading round. *Strip:* interbreeding against distance.
- **Stars.**
  - *Discover:* the break found.
  - *Predict:* the success rates.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed courtship. Prompt: "Where would you draw the species line in a ring?"
- **MODEL and nature.**
  - *MODEL:* interbreeding exp(−(d/3)²) (legacy); the break's location (designed).
  - *In nature:* Wake 1997; Irwin, Bensch & Price 2001; Pereira & Wake 2009; Alcaide et al. 2014.
- **Build and oracle.** `v2/ring.js` replaces `ring`. Oracles: the interbreeding values; the break is found by binary search.

### 6.21 Doubling (`double`; KEEP L1, REBUILD L2)

*Tier 4 · Act 10 · the Meadow (flower rig; pollen grains; wheat as a crop variant) · M · Wave C · about 13 minutes · needs Acts 1, 4 and 5.*

- **Keep / Fix.**
  - *Keep:* L1's minority cytotype exclusion (non-favourite KEEP & POLISH), with its 1.8× vigour boost disclosed (R7-R3 #16).
  - *Fix:* L2's "Double the chromosomes" button implies somatic doubling (G5; R7-R3 DB2); autopolyploidy and allopolyploidy are not named (DB3); unreduced gametes and the triploid bridge are absent.
- **Role and felt cost.** An experimenter who plants, pairs chromosomes and screens pollen. Unreduced gametes are rare (about 0.5%), and screening costs time.
- **Loops.**
  - *Second:* in L1, drag tetraploids onto the grid and watch pollen fly. In L2, drag homologues together in a meiosis panel against a timer; unpaired chromosomes scatter (200 ms); tap to screen pollen for large, unreduced grains.
  - *Minute:* one generation.
  - *Level:* one new route.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 The lonely tetraploid (kept) | Drag the survival chance of a lone tetraploid and of a clump. | Minority cytotype exclusion (Levin 1975). |
| L2 Unreduced gametes | Meiosis fails now and then (about 0.5% of gametes; Ramsey & Schemske 1998). Screen pollen for big grains and cross them: the triploid bridge produces tetraploids. | Autopolyploidy, by the usual real route. |
| L3 Bread wheat | Hybridise species carrying the A, B and D genomes. | Allopolyploidy builds AABBDD. |
| Boss: Instant species | *Tragopogon miscellus* arose several times in the last century (Ownbey 1950; Soltis et al. 2004). | Inverts "speciation takes millions of years". |

- **Picture and graph.** *Rung 0:* the grid of plants; the meiosis panel. *Strip:* cytotype frequencies.
- **Stars.**
  - *Discover:* a tetraploid founded through the triploid bridge.
  - *Predict:* survival in L1 and tetraploid yield in L2.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed pairing. Prompt: "How can a new species arise in one generation?"
- **MODEL and nature.**
  - *MODEL:* vigour 1.8× (designed, disclosed); unreduced-gamete rate 0.5% (realistic).
  - *In nature:* Levin 1975; Ramsey & Schemske 1998; Ownbey 1950; Soltis et al. 2004.
- **Build and oracle.** `v2/double.js` replaces `double`, keeping L1 and using Gen extension 3 (tetraploidy through an opt-in field). Oracles: the minority-exclusion threshold; the rate of the triploid bridge.

### 6.22 The Pathogen (`virulence`)

*Tier 4 · Act 11 · the Warren (rabbit anchor rig; virus particles) · M · Wave C · about 14 minutes · needs Acts 9 and 10.*

- **Keep / Fix.**
  - *Keep:* the trade-off model; myxoma as the anchor (already in the text, R7-R3); Ewald's hypothesis as Contested.
  - *Fix:* the player sets virulence, which is RC2 (G5); the co-infection optimum is a best response, not an ESS (R7-R3 M29); no vaccine level.
- **Role and felt cost.** The warren's vet (the environment), vaccinating rabbits from a budget. With leaky vaccines, hotter strains spread through vaccinated rabbits, so each season more vaccinated rabbits still transmit.
- **Loops.**
  - *Second:* tap a rabbit to vaccinate it; a shield appears within 200 ms. Strains, whose replication rate is inherited and shown by luminance plus a spot pattern, spread visibly along contact lines.
  - *Minute:* one season.
  - *Level:* one new factor.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 The trade-off | Strains compete across the warren, and a host that dies fast is a dead end. Drag the replication rate you expect to win. | The transmission–virulence trade-off; Contested outside myxoma and HIV (Alizon et al. 2009). |
| L2 Co-infection | Two strains share hosts; predict the shift. | Competition within hosts raises the ESS virulence. |
| L3 Leaky vaccine | Vaccinate: hosts now survive hotter strains, and virulence climbs. Drag the mean replication rate you expect after 30 seasons. | Imperfect vaccines can select for virulence (Read et al. 2015, Marek's disease). |
| Boss: Myxoma | In Australia, virulence fell to intermediate levels; then rabbits evolved resistance and virulence rose again. | Inverts "virulence always declines" (Kerr et al. 2017). |

- **Picture and graph.** *Rung 0:* the warren map, with rabbits and contact lines. *Strip:* the histogram of strain replication rates.
- **Stars.**
  - *Discover:* an intermediate strain won; virulence climbed under leaky vaccines.
  - *Predict:* at least two of three: the winning rate, the co-infection shift, the vaccine-era mean (±20%).
  - *Transfer:* the boss.
- **Access and teacher.** Untimed vaccination tokens. Prompt: "Can a vaccine make a pathogen more dangerous?"
- **MODEL and nature.**
  - *MODEL:* the trade-off curve, vaccine leakiness and host resistance evolution (all designed).
  - *In nature:* Fenner & Ratcliffe 1965; Anderson & May 1982; Alizon et al. 2009; Read et al. 2015; Kerr et al. 2017.
- **Build and oracle.** `v2/virulence.js` replaces `virulence`, with strain lineages on `v2/00_wf.js`. Oracles: without co-infection, the ESS virulence matches the analytical value that maximises R₀; with co-infection it rises.

### 6.23 Genetic Rescue (`castaways`, retitled; absorbs Castaways L2 and Islands' reserve-design idea)

*Tier 4 · Act 11 · an Expedition to Isle Royale (the wolf rig ported from the legacy Castaways) · M · Wave C · about 14 minutes · needs Acts 9 and 10 (Drift Casino and The Pedigree are its callbacks).*

- **Keep / Fix.**
  - *Keep:* Castaways L2 ("good", R8); the one-migrant rule; inbreeding depression from recessive load, with the corrected wording "most strongly harmful mutations are at least partly recessive" (R7-R1 #15).
  - *Fix:* the four-migrant star is never explained (G1); outbreeding depression, purging and rescue overshoot are missing (R1).
  - *Absorbed:* the SLOSS reserve question from Islands (D2).
- **Role and felt cost.** A conservation manager (the environment), carrying migrants across the ice from a budget, with a disease risk, and designing reserves. As F climbs, litters shrink, and a rescuer's genes can sweep and erode diversity again.
- **Loops.**
  - *Second:* drag a migrant across the ice; it walks over and joins the pack (200 ms). Pups are born visibly healthy or inbred, with fertility bars.
  - *Minute:* one year.
  - *Level:* one new risk.

| # | Predict → do → observe | Concept, and the aha |
|---|---|---|
| L1 The pack | F climbs and inbreeding depression shows. Predict F after 20 years. | Small, isolated populations become inbred. |
| L2 One migrant | Time migrants to the one-per-generation rule; predict F under it. | Nm ≈ 1 limits drift and inbreeding (Mills & Allendorf 1996). |
| L3 The wrong migrant | A migrant from a distant, differently adapted population: weigh the outbreeding risk with a decision tree. | Outbreeding depression is a real but predictable risk (Frankham et al. 2011). |
| L4 Reserves | Design reserves (one large, or several small with corridors) on a budget, with occupancy shown live. | The SLOSS debate (the former Islands content). |
| Boss: The Old Grey Guy | One immigrant arrives in 1997, and within a few generations most wolves descend from him; then inbreeding returns. | Inverts "one migrant always rescues" (Adams et al. 2011; Hedrick et al. 2014). The Florida panther success is on the card (Johnson et al. 2010). |

- **Picture and graph.** *Rung 0:* the island with its wolves. *Strip:* F and litter size; the migrant's share of the pack's ancestry.
- **Stars.**
  - *Discover:* inbreeding depression reversed, and the sweep seen.
  - *Predict:* at least two of three: F at 20 years, F under the rule, the boss's ancestry share.
  - *Transfer:* the boss.
- **Access and teacher.** Untimed. Prompt: "When is moving animals between populations a bad idea?"
- **MODEL and nature.**
  - *MODEL:* recessive load (designed); migrant timing (play); disease risk (designed).
  - *In nature:* Mills & Allendorf 1996; Adams et al. 2011; Hedrick et al. 2014; Johnson et al. 2010; Frankham et al. 2011.
- **Build and oracle.** `v2/rescue.js` replaces `castaways` (retitled), using Gen count loci for recessive load and extension 5 for lineages. Oracles: F increments match pedigree F; the probability of an ancestry sweep matches the model.

---

## 7. Tier 5: frozen new games (P1/P2)

Frozen until tiers 1–3 are approved (integrator; D2 §16.1). Each entry already carries its round-2 fixes: a real-time verb, a felt cost, a place and rig, merges, notation and science corrections. The full specs will be written to the tier 1–3 standard when the freeze lifts. Sizes and waves follow D2 §4.1.

### 7.1 Core units

**Lottery of the New** (`lottery`) · Act 4 · Beetle Isle (beetle rig) · S · Wave B · needs Drift Casino.
- *Verb:* the Drift Casino's chip table, now the high-stakes table (D2). Bet chips on which sparks (new beneficial copies) will fix, pin a spark to follow it, and buy Ne changes in play.
- *Role and cost:* an experimenter who releases copies and a gambler; the house adapts, as in the Casino.
- *Levels:*
  - L1: 100 copies with s = 0.02; chip how many fix (about four, 2s).
  - L2: dominant copies (h = 0.9) establish about nine times as often as recessive ones (h = 0.1), which is Haldane's sieve (Turner's 1977 term). Twist: from standing variation the sieve weakens (Orr & Betancourt 2001).
  - L3: at s = −0.002, Ne = 50 fixes the allele about as often as a neutral one, Ne = 5,000 almost never; place the |Ne·s| ≈ 1 boundary (Ohta 1973).
  - Boss: which island accumulates more slightly harmful substitutions? The small one (a callback chain to `clock`).
- *Realistic mode* (D2 §11) applies fully: most beneficial copies are lost, and the ×Ne/N scaling is disclosed.
- *Ownership:* this unit owns the 2s rule (D2 §15).
- *Model:* Kimura's u = (1 − e^(−4Nₑsp))/(1 − e^(−4Nₑs)), drawn only as a ghost, per D2's determinism rule.
- *Oracle:* 2s over 10⁴ seeds.

**The Skaters** (`skaters`) · Act 7 · the Pond (D4's water-strider rig) · M · Wave B · absorbs Raffle L4 with its life-bar plot (D1).
- *Verb:* a female strider skates to food (drag) and shakes off lunging males (tap within 200 ms); struggling and accepting both cost time.
- *Cost:* as male persistence evolves, lunges come more often.
- *Levels:*
  - L1: skate and resist.
  - L2: invasion view (D1): clasper and anti-clasper alleles escalate while the mating rate stays flat (Arnqvist & Rowe 2002).
  - L3, from the Raffle: seminal-fluid alleles raise a female's egg output now and shorten her life, run with and without female counter-evolution (Chapman et al. 1995; Rice 1996).
  - L4, intralocus conflict, stated conditionally (science fix): X-linkage favours sexually antagonistic alleles that are recessive and male-beneficial, or dominant and female-beneficial (Rice 1984).
  - Boss: enforced monogamy (Holland & Rice 1999): harm and resistance fall, and the population grows.

**The Cleaning Station** (`cleaners`) · Act 8 · the Shore (new cleaner-wrasse and client rigs) · M · Wave B.
- *Verb:* a client fish swims to a cleaner. A cheating bite jolts and adds a tile to D1's `Ledger`; old tiles fade (the client's memory of cheats, an idea borrowed from D1). The next visit is the client's choice.
- *Cost:* cheats evolve to cheat only when unobserved.
- *Levels:*
  - L1: partner choice; predict mean cheating ten generations on.
  - L2: an audience of clients watching; "cheat when unwatched" spreads.
  - L3: male cleaners punish cheating female partners, and punishment spreads because it raises the punisher's own income (Raihani, Grutter & Bshary 2010).
- *New boss:* the audience is removed and reputation collapses: cheating rises when nobody watches (Pinto et al. 2011). This inverts "cooperation, once established, is stable".
- *Moved:* the siderophore boss now belongs to the Commons (§4.5).

**The Hive** (`hive`) · Act 8 · the Meadow (bee anchor rig) · M · Wave B.
- *Verb:* the worker force rears or removes eggs (tap); each egg carries a patriline letter and pattern. Relatedness is read on D1's `PedigreeView`, by descent and on average.
- *Cost:* as the queen's mating number rises, policing work grows.
- *Levels:*
  - L1: with a single-mated queen, nephews (0.375) beat brothers (0.25).
  - L2: with ten matings, nephews fall to 0.15, and a policing allele invades in the invasion view above two matings (Ratnieks 1988; Wenseleers & Ratnieks 2006).
  - L3: workers favour 3 : 1 investment, the queen 1 : 1 (Trivers & Hare 1976; Boomsma & Grafen 1991).
  - Boss: termites are diploid and eusocial; lifetime monogamy is the common origin (Hughes et al. 2008).

**Tangled Pairs** (`pairs`) · Act 9, after Bitter Wings and before the Sweep (integrator) · the Meadow: Bitter Wings' insects, with palewings given two pattern loci, so no second insect rig is needed (D4's *Heliconius* row is not built; its band-and-ray patterns go onto the palewing rig) · M · Wave C · needs Bitter Wings, whose L4 makes the supergene's first jump (D1); this unit dissects it.
- *Verb:* Bitter Wings' hunt, with D1's `species` extension.
- *Levels:*
  - L1: a band and a spot at two loci; your learned avoidance makes recombinants look edible; a ferry brings the other mimicry race and linkage disequilibrium jumps; predict D five generations after you stop hunting.
  - L2: your eating holds combinations together at ρ = 0.01, but not at ρ = 0.5.
  - L3: a neutral marker hitchhikes.
  - Boss: an inversion spreads because it keeps the good pair together (Kirkpatrick & Barton 2006), a supergene; *Heliconius numata* P (Joron et al. 2011) is the "In nature" case.
- *Notation:* ρ.

**Pseudoreplication Trap** (`pseudo`) · Act 10 · the Archive (`TreeView` with drawn animals) · M · Wave C.
- *Verb:* drag a line between sister tips; the contrast drops into the contrast scatter within 200 ms. Then buy evidence with D1's `Evidence`.
- *Levels:*
  - L1: independent traits evolve on a two-clade tree to r ≈ 0.8, a false result you generated.
  - L2: contrasts dissolve it (Felsenstein 1985).
  - L3: primate testis size against mating system survives contrasts (Harcourt et al. 1981).
  - L4: plant-feeding insect clades are richer than their sister groups in 11 of 13 pairs (Mitter, Farrell & Wiegmann 1988).
  - Boss: a Brier-scored conclusion on an evidence budget.

**Human Variation** (`humvar`) · Act 11, gated · an Expedition (map; pictograms) · M · Wave C · sensitive-content gate.
- *Verb:* drag a survey transect; samples pop allele bars within 200 ms; a border pen.
- *Levels:*
  - L1: UV drives pigmentation alleles; light skin arose more than once through different loci, and both dark and light alleles are old in Africa (Crawford et al. 2017).
  - L2: every border you draw misclassifies most people near it.
  - L3: most variation lies within populations (Lewontin 1972), yet many loci together can identify ancestry (Rosenberg et al. 2002; Edwards 2003). Neither fact implies races.
- *Framing:* the rules of §5.8.

**The Refuge** (`refuge`) · Act 11, opens after Act 4 · an Expedition to cotton fields (pink bollworm on the moth rig, per the integrator) · M · Wave C.
- *Verb:* paint Bt fields and refuges, marked by pattern as well as colour; moths emerge from the fields within 200 ms.
- *Cost (borrowed from D1's G2):* yield falls as R rises.
- *Levels:*
  - L1: with every field Bt, rare recessive R takes over; predict when.
  - L2: refuge moths mate with RR survivors, and their RS offspring die on high-dose Bt (shown on the triangle).
  - L3: a low dose lets RS survive and the refuges fail. Twist: refuges placed too far away also fail.
  - Boss: Bt plus sterile releases eradicated pink bollworm from the US cotton belt (Tabashnik et al. 2021).
- *Model:* fitness on Bt SS 0, RS h, RR 1, with a refuge cost.

### 7.2 Side quests (after the pilot)

- **Song School** (`song`) · the Hedge (great tit) · S.
  - *Verb fix:* you are a young great tit. Hear a tutor's phrase and tap it back in rhythm; your copying errors become cultural mutations, and other birds copy you and each other, so the dialect moves across the map.
  - *Levels:* city noise masks low notes, so higher songs are copied more (Slabbekoorn & Peet 2003); a conformity bias.
  - *Boss:* a song variant crosses a continent in about 20 years (Otter et al. 2020), where a gene with the same advantage would take millennia.
- **The Warm Nest** (`warmnest`) · the Shore (D4's hatchling and jacky-dragon rig) · M.
  - *Verb fix:* a nesting female chooses nest sites along the beach in a timed night: temperature probes flash under the sand, and she digs within 2 s.
  - *Levels:* her nest-site rule becomes an allele under Fisherian frequency dependence (the rarer sex is worth more); Charnov–Bull conditions (Warner & Shine 2008).
  - *Boss:* warming makes about 99% of hatchlings female in a northern Great Barrier Reef population (Jensen et al. 2018); heat feminises ZZ dragons (Holleley et al. 2015).
  - *Contested:* the heritability of pivotal temperature.
- **Red Fire** (`redfire`) · the Meadow (new ant rig) · S.
  - *Verb:* a worker sniffs queens and attacks those lacking the b allele's odour (tap).
  - *Boss:* recombination separates the beard from the behaviour, and falsebeards dissolve the greenbeard unless both sit in a supergene (Keller & Ross 1998; Wang et al. 2013).
- **The Placenta** (`placenta`) · the Lab (mouse rig) · S.
  - *Role and verb:* an experimenter releasing paternal-copy and maternal-copy growth mutants into litters (tap), shown in D1's invasion view; each litter's tug-of-war is visible, and polyandry rises by level.
  - *Boss:* knock out either side: without Igf2 a pup reaches about 60% of normal size (DeChiara et al. 1990); without Igf2r it overgrows (verify).
  - *Contested:* the kinship theory fits Igf2, not every imprinted gene (Haig & Westoby 1989).
- **The First Pond** (`firstpond`) · the Lab (molecules on clay, then vesicles; D4's Petri scene) · M.
  - *Verb:* drag waves that split vesicles, and set transfer volumes.
  - *Levels:* the error threshold; parasitic RNAs; protocells beating parasites on Price bars.
  - *Boss:* uniparental inheritance tames selfish symbionts.
  - *Contested:* RNA world against metabolism-first.
- **The Toolkit** (`toolkit`) · the Lab (the Switches grid) · M.
  - *Verb:* drag mouse Pax6 into a fly disc, and eyes sprout within 200 ms (Halder, Callaerts & Gehring 1995).
  - *Levels:* Distal-less marks legs, tube feet and fins (Panganiban et al. 1997); co-option has pleiotropic costs.
  - *Boss:* octopus and vertebrate eyes share genes but are convergent organs.
- **The Manhattan Hunt** (`gwas`) · the Lab (`Evidence`) · M · sensitive-content gate.
  - *Verb:* drag a sample bag into the sequencer, and the skyline rises within 200 ms.
  - *Levels:* one Mendelian peak; a trait of 2,000 tiny effects that stays flat until samples grow; a false peak from stratification, removed with principal components.
  - *Boss:* a score built in sample A fails in sample B (Martin et al. 2019).
- **Islands of Divergence** (`islands2`) · the Valley (crows, a variant of the bird rig) · M.
  - *Verb:* buy genome-scan windows with `Evidence`.
  - *Boss:* a decoy peak from background selection in a recombination cold spot; check d_xy before calling it (Cruickshank & Hahn 2014).
- **Drifting Continents** (`plates`) · the Expeditions layer (D4's ink world map) · M.
  - *Verb fix:* an inverse puzzle. Drag plates and sea level so that the splits of a given dated tree come out right; lineages split apart or disperse live as you drag, and wrong timings misfit (scored).
  - *Boss:* the ratite tree is too young for vicariance, and the kiwi's sister is the elephant bird (Mitchell et al. 2014).
  - *Fallback:* if it fails the boring flag, it becomes Experiment cards.
- **The Harvest** (`harvest`) · the Lake (cichlid rig) · M.
  - *Verb:* the fleet sweeps a net (D1's net verb).
  - *Cost (borrowed from D1's G2):* the catch shrinks as the population adapts, maturing smaller and earlier (Conover & Munch 2002); a pinned fish never changes, but the school does.
  - *Levels:* reserves and slot limits.
  - *Boss:* in Gorongosa, X-linked, male-lethal tusklessness rose from about 18% to about 51% of females under wartime poaching (Campbell-Staton et al. 2021). It uses the Royal Line's X, and needs a new elephant silhouette.
- **The Race** (`race`) · the Hedge (great tit) · M.
  - *Verb fix:* each spring is 20 s of ticking days. A female great tit taps "lay" when she judges the time is right, and her chicks need the caterpillar peak. Her laying rule competes as an allele while warming moves the peak earlier.
  - *Cost:* the mismatch grows.
  - *Boss:* laying did not advance in 23 years, while selection for early laying grew (Visser et al. 1998).
  - *Moved:* the yeast rescue curve (Bell & Gonzalez 2009) becomes an Experiment card on D4's Petri flask; the Race itself is set at the Hedge.
- **The Tumour** (`tumour`) · the Lab (tissue on the Petri scene) · M · opens after Clinic L3.
  - *Engine:* reuses the Clinic's pharmacokinetic module and live dosing (tap days as they tick).
  - *Levels:* clones branch within one body and a biopsy misses some; at maximum dose the tumour shrinks, then resistant clones regrow; threshold dosing echoes Clinic L3's containment (Contested: small pilots, Zhang et al. 2017).
  - *Boss:* Peto's paradox: elephants carry about 20 copies of TP53 (Abegglen et al. 2015).
  - *Model:* Lotka–Volterra competition with a cost of resistance.

### 7.3 Merged away (round-1 entries that no longer exist as units)

- **The Ellipse** → Seed Rain L4 and its boss (§5.10).
- **Silent Letters** → `clock` L1–L3 and its boss (§6.18).
- **The Selection Shadow** → The Slow Island (§6.5).
- **Valley Crossing** → Twelve Flasks L3 (§6.3).

---

## 8. Scenario cards and the appendix

### 8.1 The Drunkard's Walk: an Experiment card set (D2 §7)

It has no per-second verb, so under D2 §4's rule it ships as cards.

| Card | Kind | Prompt (≤ 40 words) | Gesture and goal |
|---|---|---|---|
| Passive or driven? | Experiment | "Lineages start at the smallest possible size and wander. Sketch the size histogram after 500 steps, then run twenty replicates." | Drag the histogram's mode and maximum. The maximum climbs while the mode stays small (Gould 1996; McShea 1994). |
| The subclade test | Experiment | "Is there a push toward big size, or just a wall at small size? Compare subclades that start far from the wall." | Drag the mean change of subclades that start far from the wall; it is above zero only if there is a drive. |
| Cope's rule | Challenge | "Mammal descendants are about 9% larger than their ancestors on average (Alroy 1998). Make that happen without a wall." | Add a weak drive; the goal predicate checks the mean step. |
| Not a ladder | Lecture demo | Teacher-stepped: all tips are equally old, and bacteria have run the most generations. | Answer hidden until "reveal". |

### 8.2 Demotion fallbacks

If a five-student test flags a tier-4 unit as boring twice, the unit becomes a card set (D2 §4). Its model runs as Experiment cards, its best What if? runs become Experiments, and its boss becomes a Challenge. The likeliest candidates, by verb strength, are The Ring, Doubling L2 and the Crowd's cascade remnant.

### 8.3 After the Fire (appendix, gated; answers the integrator's open critique)

It ships only once it is rescored (G5; R7-R3 FI2):
- each run draws its landscape at random from three diversity–disturbance shapes: humped, monotonic or flat (Fox 2013);
- the player runs a few burn experiments and predicts the shape;
- the star is for naming the shape from the data, never for finding a hump;
- the climax species is shade-tolerant maple or beech, not oak (D0 §3).

Islands and the Food Web stay in the appendix as D2 ruled. Islands' SLOSS idea now lives in Genetic Rescue L4.

---

## 9. Shared engine and widget requests

D2 schedules this work, D1 owns widget behaviour and D4 owns the look. Everything extends `Gen`, `Hunt` or the shared helpers, and nothing forks them (D0 §6.4).

### 9.1 `Gen` extensions: opt-in, so the legacy golden trajectories do not change

**Mechanism** (integrator's ruling; checked against `core.js`):
- `Gen.layout(specs)` sets `lay.x = true` only when some spec carries an extension field (`link`, `alleles`, `ploidy`, `fx` or `track`). No legacy spec carries one.
- `Gen.mate` gains one first line: `if (lay.x) return this._mateX(lay, a, b, opt);`. When `lay.x` is false, `_gam` runs byte for byte as today, drawing the same `R()` calls in the same order. Today those are one call per locus for the parental copy, one per `dom` locus for forward mutation (and one for back mutation only when `s.back` is set), one per additive locus for `mu`, and Poisson draws for `count` loci.
- `_gam` is not rewritten. Every extension lives in the separate `_mateX` path, selected by the trait's fields.
- **Gate:** after the extension file lands, the golden trajectories of all 48 legacy chapters re-run unchanged in Chromium, Firefox and WebKit (D2 §16.3).

**The five extensions:**

| # | Field | What it does | `R()` cost | Used by |
|---|---|---|---|---|
| 1 | `link: {chr, cM}` | Crossovers per chromosome with an obligate crossover and interference (a counting model); a hotspot weight map; an `inv` bracket that suppresses crossing over in heterokaryotypes | only on linked chromosomes | Crossing Over, Out of Africa, The Sweep, Tangled Pairs, Two Fruits, The Strutting Ground (LD), Red Fire, Islands of Divergence |
| 2 | `kind: 'multi', alleles: k` | Allele index stored as an integer-valued float; a phenotype map (dominance hierarchy, codominance, "null" reads); per-class mutation | only for multi loci | Census (null allele), Malaria Coast (A/S/C), Invisible Carriers (ABO), the Casino boss (12 alleles), Why Sex? and Lock and Key (locks), The Meadow (S alleles), Out of Africa |
| 3 | `ploidy: 'X' \| 'hap' \| 4` | X-linked males carry slot 2 = −1 (absent), with `Gen.mateX(lay, mom, dad, sex)`; haplodiploid males via `Gen.hap(lay, mom)`; an opt-in tetraploid | only for those traits | Mixer X round, Royal Line, River boss, The Fig, Spindle L2, The Hive, Doubling, Harvest boss, Skaters L4 |
| 4 | `fx: [{k, w}]` | One additive locus feeds several traits with weights; correlated mutation effects are drawn only when `fx` is present | only when `fx` is present | The Breeder, Seed Rain (the G matrix) |
| 5 | `track: true` | A parallel `Uint32Array` of parent and lineage ids per copy | none | Tree Thinking (persistence), Coalescent, Breeder (F), Twelve Flasks, Genetic Rescue, D1's `Pin` |

**New functions** that legacy code never calls: `Gen.clone(lay, g)` (an asexual copy, used by Why Sex?) and `Gen.hap` (above).

### 9.2 Shared helpers

- **`WF`** (D1 §2.1 lists it among the shared widgets; D2-6 schedules it as `v2/00_wf.js`, the name used in this document): binomial and multinomial draws by inversion, a haploid Wright–Fisher step, and D2's determinism rule (no transcendental function between an `R()` draw and an outcome; exp-based curves only as ghosts). Users: Drift Casino, Lottery, Coalescent, Twelve Flasks, Scribe plating, Pond clones, Pathogen strains, and D1's `Invasion`, as the integrator requires.
- **`v2/03_redqueen.js`** (new; numbered after D1's `00`–`02` files to avoid temporal-dead-zone errors): the matching-alleles host–parasite module with its 1% floor. Users: Lock and Key, Why Sex?.

### 9.3 Widgets

**Proposed by D3** (D1 owns behaviour, D4 owns the look):

| Widget | Behaviour | Used by |
|---|---|---|
| `Chips` | A distribution bet over bins, paid by a quadratic proper-scoring rule; posted naive odds; event cards in play. Stars read the distribution against the expectation | Drift Casino, Lottery, Twelve Flasks L3, Copy L3 |
| `DemeMap` | Demes as discs with a p\|q bar, migration arrows weighted by m, a triangle dot per deme, and a world-map mode | Census boss, Malaria Coast, Gene Swamping, Archipelago, Out of Africa |
| `TreeView` | Spin, root, step count, spindle mode for clades, calibration bars | Tree Thinking, Coalescent, Extinction Roulette, `clock`, Pseudoreplication Trap |

**D1's widgets used:** `LiveGraph` (fed by each chapter's `notes()`), `Predict`, `GenePoolLens`, `Invasion`, `Ledger`, `PriceBars`, `Evidence`, `PedigreeView`, `Pin`.

**D4's components used** (integrator: D4 adds these): the GenomeStrip and scatter charts, the Petri and Strata rung-0 scenes, and the X-linked HUD variant.

**Hunt extensions used (D1):** `lens` (blocks pecks while on), `bag`, `species`, `barks`, `predict`, `untimed`, the net verb (Harvest).
- *New request:* migrant injection, a `migrants:{m, from}` field that adds individuals at dawn. Gene Swamping L1 needs it.

### 9.4 Plug-in engineering every spec follows (integrator; D2 §16.2)

- New identifiers (`CH_<ID>_V2`) and `V2.push`.
- Numbered prefixes only on shared files (`00_fx`, `01_widgets`, `02_hunt_ext`, then D3's `03_redqueen`); chapter files take letter names (`v2/<name>.js`, as given in each spec), so they sort after every shared file (D1 G12.2).
- `notes()` kept as the `LiveGraph` data provider, and a one-line `intro.goal`, because `boot.js` throws without them.
- FCR-12's outermost `v2/00` wrap sends `ch.v2` chapters straight to `App.play` and replaces `End.show`.
- Every `ch99.js` patch on a rebuilt chapter is re-implemented or dropped on purpose: Casino `newTable`, Mendel `confNote`, the Sieve's secret challenge, `TRANSFER.castaways/cross/lock/fruits`, the Commons bridge card.

---

## 10. Places and rigs

### 10.1 Where each unit lives (D2's 12 places, the Lab, Expeditions and the Archive)

The integrator asked for every game to be mapped to D2's 12 places, the Lab or an Expedition, and named the Shore for the Cleaning Station. D4's round 2 proposes four more places, pending D2's approval: Reef, Coast, Farm and Cliff. The table follows the integrator. If D2 approves D4's places, four units move:
- the Cleaning Station to the Reef;
- Malaria Coast to the Coast;
- the Refuge to the Farm;
- the Dig and Extinction Roulette to the Cliff.

No spec changes beyond its ground.

| Place | Units (tiers 1–5) |
|---|---|
| The Wood | Tree Thinking (the player's moths) |
| Beetle Isle | Mixer L1, Census, Casino (volcano, castaways), Coalescent (beetles traced in the Lab), Leaky Tap, Gene Swamping, Pedigree L2, Invisible Carriers L1, Lottery. The resident beetles persist across Mixer → Census → Leaky Tap → Gene Swamping → Lottery (D2's idea) |
| The Streams | River, Crowd, Strutting Ground (Aripo) |
| The Shore | Two Sizes, Cleaning Station (Reef if approved), Warm Nest |
| The Lake | Why Sex?, Lock and Key L1, Archipelago boss, Harvest |
| The Meadow | Pedigree L3, Meadow, Guest, Doubling, Strutting Ground lek, Hive, Red Fire, Tangled Pairs (Bitter Wings' insects), Pond L4 (an annual on the dry slope) |
| The Hedge | Nest, Song School, Race |
| The Pond | Commons, Pond, Many L3, Skaters |
| The Fig Grove | Fig |
| The Valley | Ring, Lock and Key L2–boss, Islands of Divergence |
| The Outer Islands | Archipelago, Seed Rain, Slow Island |
| The Warren | Pathogen |
| The Lab | Mixer tumbler, Casino table and Buri's bottles, Mendel, Scribe, Royal Line fly room, Breeder, Invisible Carriers L2–boss, Pedigree, Crossing Over, Twelve Flasks, Commons boss, Many, Copy and Paste, Sweep, `clock`, Spindle L1, Placenta, Toolkit, Manhattan Hunt, Tumour, First Pond |
| Expeditions | Malaria Coast (the malaria belt; Coast if approved), Dig (fossil cliffs; Cliff if approved), Out of Africa, Genetic Rescue (Isle Royale), Seed Rain L3 (caves), Two Fruits (orchard), Blood Debts (roost), Spindle L2–3, Refuge (cotton fields; Farm if approved), Human Variation, Drifting Continents, Harvest boss (Gorongosa) |
| The Archive | Tree Thinking transfer, Royal Line boss, Coalescent boss, Extinction Roulette (Cliff if approved), `clock`, Pseudoreplication Trap |

### 10.2 Rigs

**Anchor rigs reused:** moth, beetle, fruit fly, finch, cichlid, guppy, great tit, bee, water flea, fig wasp, salamander, rabbit. Also the legacy pea, mouse and sage-grouse rigs, D1's microbe cells (the Clinic's), and D4's human pictograms.

**Variants of existing rigs** (no new rig needed):
- on the bird rig: dunnock;
- on the fruit-fly rig: stalk-eyed fly, apple maggot fly;
- on the salamander rig: newt;
- on the pea rig: sweet pea;
- on Bitter Wings' palewing: the two pattern loci of Tangled Pairs. This replaces D4's proposed *Heliconius* row, because the integrator ruled that Tangled Pairs uses Bitter Wings' insects.

**Fourteen rigs beyond the anchors** (tiers 1–4). Five already have D4 rows (D4 §4.3–4.4):
- pigeon (Breeder);
- mosquito, crowd tier (Malaria Coast, Spindle);
- hawkmoth with bee and hoverfly (Meadow);
- flower as a cut-away corolla with spur, UV pattern and pin or thrum form (Meadow, Pedigree, Doubling, Pond L4);
- fossil silhouettes (Dig, Extinction Roulette, Tree Thinking's Archive).

Nine need new rows:
1. mud snail, plus a trematode-larva token (Why Sex?, Lock and Key);
2. frog (River);
3. fox (Breeder, Slow Island; port TB's `drawFox`);
4. opossum (Slow Island; port TB's `drawBeast`);
5. cave fish (Seed Rain);
6. garter snake (Lock and Key);
7. root and nodule (Guest);
8. wolf (Genetic Rescue; port from Castaways);
9. vampire bat (Blood Debts; an upgrade of the legacy rig).

**D4's provisional rigs confirmed** (D4 asked D3 to confirm them):
- the Breeder's pigeons: crest height and tail fan as silhouette traits, and the gym's dumbbell mark absent on the young, exactly as in L2;
- Twelve Flasks' contour plate, with a population cloud of 10, 100 or 1,000 dots for the three N regimes, as in L3;
- the Meadow's pollinators at 39 px or more, with proboscis length as the silhouette trait, and the pollinators' own lineage strip, which meets D2's subtitle condition (L2).

**Frozen tier 5 uses D4's existing rows:** water strider, cleaner wrasse and client, honeybee and fire ant, elephant, hatchling and jacky dragon, pink bollworm on the moth rig, crow, and a fish school.

D4 may substitute where a rig is too costly. The likeliest swap is the pigeon: The Breeder could use the great tit or the beetle, at some loss of Darwin's story.

---

## 11. Compliance with D0

### 11.1 How this document removes RC1–RC7

| RC | Removed by |
|---|---|
| RC1 The player calculates | Every spec names a per-second verb and a population that visibly answers. Optima appear only in the debrief. Chips are scored as calibrated distributions, not right answers. Every spec has a bot sweep. |
| RC2 The player is the organism | Every unit uses one of G1's four roles. The six offending chapters are reframed: Two Sizes (release mutants), Meadow (pollinator), Lock and Key L2 (the snake hunts; newts evolve), Pathogen (vet; strains compete), Archipelago (storms; beaks evolve), Live Fast (now The Slow Island; the fox's hunting shapes ageing). The Pond's "draw your reaction norm" became a released variant. |
| RC3 Text before play | No card before the first action. Every TRANSFER card on a D3 unit becomes a first gesture (castaways, cross, lock, fruits); soot and clinic belong to D1. Every quiz level is rebuilt as play (§11.3, Q4). |
| RC4 The concept is in the caption | Each spec names its rung-0 object first: the beach under the lens, the bottle rack, the cut wood, the snail shells, the painted coast, the strata. |
| RC5 No escalation | Every unit escalates over its levels to an inverting boss. G2's arms race or D2's escalating cost is in every spec, and no bot earns three stars. |
| RC6 Model, text and evidence disagree | Every spec has a MODEL table with tags, Contested badges with no star for a side, *verify* flags, and the claims in §12 for Coordinator A. No unsourced Equilibrium data is reused. |
| RC7 No spine | One `Gen` with opt-in extensions, `Hunt`, one Wright–Fisher helper, shared widgets, D2's places, persistence across Beetle Isle and from the Wood to Tree Thinking, and callback chains: Scribe → Twelve Flasks; Lottery → `clock` → Out of Africa; Gene Swamping → Malaria Coast → Refuge; Royal Line → River boss → Harvest boss; Lock and Key → Why Sex?; Drift Casino → Coalescent; Mixer → Royal Line. |

### 11.2 Section 3 is respected

Every model and text here obeys D0 §3:
- **Mutation:** several sources, blind to need; a beneficial share of 10⁻²–10⁻⁵, with the VSV figure disclosed as a different kind of measurement (§5.1).
- **Hardy–Weinberg:** a null model whose one-generation conditions are tested (Mixer, Royal Line). A fit is not "no evolution" (Census L1). Disassortative mating moves p (Pedigree L3; Meadow L3).
- **Drift:** the neutral rule in the Casino and 2s in Lottery; Ne thresholds; nearly neutral means |Ne·s| ≈ 1.
- **Bottlenecks:** scored on alleles kept.
- **Agency:** variants are selected and populations evolve; no thought bubbles.
- **Kin:** identity by descent, on average (Hive, Invisible Carriers, Pedigree).
- **Cooperation:** weak altruism is not strong altruism, and strong altruism needs assortment (Commons L3).
- **Ring species:** messy (Ring boss).
- **Virulence:** myxoma virulence fell, then rose; Ewald's hypothesis is Contested (Pathogen).
- **Ecology:** maple or beech as the climax, never oak, and the intermediate disturbance hypothesis is not rewarded (§8.3).
- **Phylogeny:** no "lives in water" character; two SINEs (Tree Thinking).
- **Crossing over:** stochastic, with hotspots, an obligate crossover and interference (Crossing Over).
- **Sex ratio:** the haplodiploid ESS, and Fisher's argument as an invading strategy (Fig).
- **Life history:** Williams 1957 and about 25% longer life (Slow Island).
- **Climate tracking:** laying did not advance (Race).
- **Data:** no Equilibrium sickle-cell counts; Paine's other removals stay in the appendix.

**Model guardrails:** disruptive selection makes no lasting peaks without assortment or a large-effect locus (Seed Rain L2); valley crossing uses three N regimes, the intermediate hardest (Twelve Flasks L3); matching-allele cycles have a mutation floor (Lock and Key, Why Sex?).

**Disclosure:** ×N tags, "history compressed", designed against real data, expected (ghost) against realised (solid). Contested topics in this document carry a badge and no star: the Orr snowball, how common stabilising selection is, domestication and the neural crest, Lack's brood reduction, Fisher on Mendel, the causes of lactase persistence and of cystic fibrosis's frequency, adaptive therapy, the virulence trade-off, the gene-drive ethics card, bdelloid asexuality and Kondrashov.

### 11.3 Answers to D0's questions for D3

1. **Game or level?**
   - *Standalone 10–20-minute units:* Scribe, Royal Line, Leaky Tap, Malaria Coast, Gene Swamping, Dig, Extinction Roulette, Out of Africa.
   - *Levels in hosts:* Ne (Casino L3), ABO (Invisible Carriers L3), the gym (Breeder L2), cave fish (Seed Rain L3), tree reading (Tree Thinking), F (Pedigree L1), and D1's horizontal gene transfer (Clinic) and overproduction (Wood).
2. **Deep time without quizzes.** The player makes the record (Dig L1); triage with shields meets the impact (Extinction Roulette); budgets decide where to dig and what to sample; every placement in time is a gesture on a log ruler or timeline, scored by distance. No multiple-choice question anywhere.
3. **Human variation.** Round 1's panel rule is now D2's sensitive-content gate: Coordinator A, a human population geneticist and a scholar of race and science, working from the ASHG 2018 statement and the NASEM 2023 report. It covers Malaria Coast, Out of Africa, Human Variation, the Manhattan Hunt, Invisible Carriers (consanguinity framing) and the Leaky Tap's achondroplasia gesture. The rules are listed in §5.8.
4. **Which quiz chapters become simulations?**

| Quiz level | Becomes | Where |
|---|---|---|
| Archipelago L2 | radiation by storms, with displacement, Big Bird and a turbidity collapse | §4.8 |
| Two Fruits | the grower picks infested fruit; timing diverges; an inversion arrives | §6.19 |
| Guest L2 | release a symbiont strain under two transmission modes; *Wolbachia* exception | §6.15 |
| Clock | the constraint brush with substitution rain; a relative-rate trap | §6.18 |
| Copy and Paste | genome as city: silencers through eggs; chips on duplicate fates | §6.16 |
| Coalescent L3 | reading alignments: SFS and Tajima's D with a sweep decoy | §4.6 |
| Landscape L2 | Twelve Flasks' hidden landscape and three N regimes | §6.3 |
| Shape-shifters L2 | The Pond's hunting patterns and seed-bank crash | §6.6 |
| Live Fast L3 | The Slow Island | §6.5 |
| Census L2 and Equilibrium's Case Files | an evidence-budget detective with randomised causes | §4.3 |
| Tree Thinking L1 | cut, spin, root, the convergence and long-branch traps | §4.1 |
| Islands, Food Web | appendix (D2) | §8.3 |
| After the Fire | appendix, rescored on three landscape shapes | §8.3 |

5. **Engine reuse.**
   - *`Hunt`:* Leaky Tap, Gene Swamping L1, Tangled Pairs, Harvest, and the hunting loops of Lock and Key L2, the Pond and the Slow Island.
   - *`Gen` with extensions:* every population unit.
   - *Triangle HUD:* Mixer, Royal Line (X variant), Census, Pedigree, Leaky Tap, Malaria Coast (dawn/dusk), Gene Swamping, Refuge.
   - *`PriceBars`:* Commons, First Pond.
   - *`Evidence`:* Census, Malaria Coast L3, Pedigree boss, Sweep, Pseudoreplication Trap, Manhattan Hunt, Islands of Divergence.
   - *`Chips`:* Casino, Lottery, Twelve Flasks, Copy.
   - *`Invasion`:* River, Crowd, Two Sizes, Strutting Ground, Fig, Spindle, Meadow, Nest, Blood Debts, Skaters, Hive, Placenta, Warm Nest, Race.
   - *Slow Island model:* Slow Island. *Switches grid:* Toolkit. *Clinic PK module:* Tumour.

---

## 12. Claims for Coordinator A before build

New or changed claims in this round; *verify* marks a figure not yet checked against the primary source.

| Claim | Source to check |
|---|---|
| VSV single mutants: about 40% lethal, 30% deleterious, 27% neutral, about 4% beneficial (site-directed); the game's 1% sits within the genome-wide 10⁻²–10⁻⁵ range | Sanjuán, Moya & Elena 2004; Eyre-Walker & Keightley 2007 |
| Lactase persistence: at least three East African alleles, plus −13910T in Europe | Tishkoff et al. 2007; Enattah et al. 2002 |
| X-linkage favours antagonistic alleles that are recessive and male-beneficial, or dominant and female-beneficial | Rice 1984 |
| SINE insertions unite whales and hippos; the double-pulley astragalus in fossil whales | Nikaido, Rooney & Okada 1999; Thewissen et al. 2001 |
| About 30% of the genome shows human–chimp–gorilla discordance | Scally et al. 2012 |
| Viscosity raised with agar (not "still broth") favours siderophore producers; local competition can cancel kin benefits | Kümmerli et al. 2009; Griffin, West & Buckling 2004; Taylor 1992 |
| Clones declined as parasites tracked them; outcrossing persisted only with coevolving parasites | Jokela, Dybdahl & Lively 2009; Morran et al. 2011 |
| Sexual snails commoner where parasites are common | Lively 1987 |
| Eyes cost about 5–15% of resting metabolism in young cave fish | Moran, Softley & Warrant 2015 |
| Small-RNA inheritance lasts about 3–5 generations in *C. elegans* | Rechavi et al. 2014 |
| First-cousin couples' added risk about 1.7–2.8% | Bennett et al. 2002 |
| About 80% of achondroplasia cases are new mutations; at balance the share of new cases ≈ s for a dominant | Bellus et al. 1995; standard theory |
| HbAS about 90% protective against severe malaria; global HbS distribution | Williams et al. 2005; Piel et al. 2010 |
| Black-bellied seedcracker bill polymorphism is single-locus | Smith 1993 |
| Rhizobia evolved to be less mutualistic under long-term nitrogen fertilisation | Weese et al. 2015 |
| Myxoma virulence rose again after rabbits evolved resistance | Kerr et al. 2017 |
| The "Old Grey Guy" swept Isle Royale ancestry | Adams et al. 2011; Hedrick et al. 2014 |
| Cleaner wrasse cooperate more with an audience | Pinto et al. 2011 |
| Female preference for long eyespan in stalk-eyed flies avoids X-linked drive (driver or suppressor, to verify) | Wilkinson, Presgraves & Crymes 1998 |
| Large body and small range predict modern mammal extinction risk; about 100 against 0.1 extinctions per million species-years | Cardillo et al. 2005; Pimm et al. 2014 |
| Planktotrophy predicted background but not mass-extinction survival in Cretaceous molluscs | Jablonski 1986 |
| X-linked male incidence ≈ 3μ/s at balance | Haldane 1935 |
| Reinforcement of call preference in *Litoria* | Hoskin et al. 2005 |
| The snowball in *Drosophila* | Matute, Butler & Coyne 2010 |
| Greenish-warbler song simple in the south, complex at both northern ends | Irwin, Bensch & Price 2001 (*verify*) |
| Null alleles as a cause of apparent deficits | Dakin & Avise 2004 |
| Long wild segments persist around Tm-2 after backcrossing | Young & Tanksley 1989 |
| Igf2 knockout pups about 60% size; Igf2r knockouts overgrow | DeChiara et al. 1990 (*verify* the Igf2r case) |
| Unreduced gametes about 0.5% on average | Ramsey & Schemske 1998 |
| Mammal descendants about 9% larger | Alroy 1998 |
| Song variants spread across Canada in about 20 years | Otter et al. 2020 |

---

## 13. Disagreements with integrator

1. **Tier 4 is delivered in compact form, not full D1 §3 prose.** The mustFix asks for all rebuilds at D1 §3 depth. Every tier-4 spec has every required field: keep and fix, role and felt cost, the three loops, a level table with the aha, picture, live graph, stars, access, teacher hook, a tagged MODEL, build and oracle. But each runs at about half the length of a tier 1–3 spec.
   - *Reason:* D2 §16.1 schedules tier 4 for Wave A, and D1 must review tiers 1–3 first, so writing tier 4 at full length now would delay that review.
   - *Commitment:* each tier-4 spec gets deepened before its wave's gate.
2. **Extinction Roulette's shields: one change to the triage design.** Shields protect only against background extinction, and shielded lineages are excluded from the trait–survival scatter.
   - *Reason:* if the player's own protection fed the selectivity measure, the lesson "background predictors fail at the impact" would be confounded with "my shields stopped working". The anachronism (no one protected Cretaceous clades) is disclosed on the MODEL card as a game device.
3. **The felt-cost clause for null-model and investigator units.** D3 concurs with D2 §18.1 and applies its ruling ("a cost that grows as the level gets harder") to the Mixer, Census, Pedigree, Invisible Carriers, Tree Thinking, Coalescent, Dig and Mendel.
   - *Reason:* read literally, the clause would demote two slice units and most of Act 3, where nothing adapts by design.

---

## 14. Revision notes (round 2)

- **Structure.** The round-1 catalogue of 33 new games is replaced by specs in D2's tier order: 22 full specs (tiers 1–3), 23 compact specs (tier 4), and frozen short entries for tier 5 (§7). Every spec names:
  - G3's three loops;
  - a felt cost;
  - Discover/Predict/Transfer stars scored against the expectation;
  - an untimed and keyboard path;
  - a teacher hook;
  - a MODEL table tagged realistic/designed/×N.
- **Weak verbs fixed:**
  - the Leaky Tap is a live drain with a load meter, and its boss shows load = μ whatever s;
  - Lottery uses the Casino's chips;
  - Extinction Roulette is shield triage that fails at the impact;
  - Song School, the Warm Nest, the Race, Drifting Continents and `clock` have real-time verbs;
  - the Drunkard's Walk is a card set.
- **Merges and placement** follow the binding list:
  - the Ellipse becomes Seed Rain L4 and boss; `clock` absorbs Silent Letters; Twelve Flasks absorbs Valley Crossing; the Skaters absorb Raffle L4;
  - the siderophore boss moves to the Commons, and the Cleaning Station gets a new audience boss;
  - the Selection Shadow is The Slow Island; the Tumour is a side quest;
  - the Royal Line goes to Act 3 and Tangled Pairs to Act 9.
- **Waves:** Tangled Pairs, the Ellipse and Twelve Flasks are out of Wave A. Mendel is re-sized S → M and Twelve Flasks M → L.
- **Science:**
  - Royal Line: females only on the triangle;
  - Malaria Coast: survival tallies only, and panel review;
  - four hues × fills for 12 alleles;
  - lactase persistence arose several times;
  - Skaters: conditional X-linkage;
  - Scribe: the VSV DFE disclosed against the genome-wide range;
  - δ for extinction and r_m for growth rate;
  - the Dig: "far more often";
  - heterozygote advantage, and now cystic fibrosis, only in Malaria Coast.
- **Critique closed:** every G1–G7 item listed by the integrator, D0 Q4 in full (§11.3), and specs for D0 §4's P1 rows: Strutting Ground, Archipelago, Meadow S alleles, Coalescent.
- **Engine and places:**
  - opt-in `Gen` extensions that leave `_gam` and the legacy `R()` sequence unchanged;
  - shared `v2/00_wf.js` and `v2/03_redqueen.js`;
  - `Chips`, `DemeMap` and `TreeView` proposed;
  - every unit mapped to a D2 place, the Lab, an Expedition or the Archive, using the anchor rigs the integrator named;
  - fourteen rigs beyond the anchors, nine of them new to D4.
- **Aligned with D1 and D4 round 2:**
  - chapter files take letter names, and `P` carries min and max (D1 G12);
  - no two-option prediction anywhere (D1's revised G5);
  - D4's XHud, Petri, Strata, scatter and GenomeStrip used as specified;
  - D4's four proposed places adopted conditionally (§10.1), and its provisional rigs confirmed.
- **Borrowed, with credit:**
  - from D1: G2's arms race, the `Ledger`, the `Invasion` view and the dawn/dusk triangle;
  - from D2: scenario cards, Beetle Isle persistence, Realistic mode, the freezer's origin in Twelve Flasks, chips for Lottery, and the Mixer's net-sweep fallback;
  - from D4: rung-0 objects and human pictograms;
  - from the integrator: Tree Thinking grown from the player's own moths.
