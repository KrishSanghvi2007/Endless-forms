# Wave 2: Bitter Wings (`bitter`)

Unit agent: senior game developer and evolutionary biologist. Files: `games/endless-forms/source/v2/bitter.js` (`CH_BITTER_V2`, about 1,130 lines), `tests/oracle_bitter.js`, `tests/bitter_shots.py`, `tests/bitter_paths.py`. No engine file, legacy file or other unit's file was edited. Nothing was committed. The legacy Hunt chapter (`CH_BITTER` in `hunt.js`, text in `boot.js`) is untouched and still plays under `?v1=1`.

Specs followed: D6 (binding), D5 §4 item 6 and the §3 checklist, D1 §3.2 (and G1–G12), D2 §15 notation, D4 §1–§8 (Meadow place, Ledger look rule 11, §5.3 Bitter Wings juice), API_v2 with §13–§14, `engine_integration.md`, `lessons_batch1.md`.

## What I built

**Role:** the selective environment (D1 G1). You are a great tit feeding four chicks on a meadow leaf. **Place:** Meadow (D4 §1). **The second:** tap an insect to eat it. A tasty one feeds a chick ("+1", chick pop, scale and dust burst after a 90 ms beak-shadow telegraph, crunch). A bitter one is a retch: a 5 px shake, corners darken 20% for 250 ms, a sawtooth drop, a 50 ms hit-stop, the clock loses the retch seconds (a chunk of the timer bar falls off with a "−3 s" pop), the model staggers off alive (D4 §5.3), and a tile flips into the **taste ledger**. **The minute:** one 12-second morning (12 meals; the clock has a tick per meal-second), then dusk: the insects you spared lay eggs tinted by their look, the eggs fly into the next column of the in-scene graph, and the young hatch. **The level:** one new variable.

**The taste ledger is the bird's memory** (D1 Ledger, D4 rule 11), and it is sim state: the last ten tastes of warning-coloured insects, solid when fresh, hatched after a morning or two, dashed, then gone (weights 1, 0.6, 0.3, 0). The memory cue (D4 §5.3): a warning-wing icon whose outline thickens 1–4 px per fresh bitter taste; at about three, warning looks gain a dashed avoid-ring; when tasty tastes outnumber bitter ones the ring cracks into sparse dashes. Rings go round every warning look (models and good mimics alike), so they never betray which is which.

| Level | Adds | What happens | Prediction on the live graph | Stars it can give |
|---|---|---|---|---|
| L1 Bitter lessons | a warning-coloured model | 24 palewings start cream; 8 black-and-red models; retch 3 s. Sparing what looks bitter makes palewings look bitter. 4, 6 or 9 generations by seed. | After two mornings, on the palewing-look dot histogram: where will the average look be by the last generation? Expected from 200 replays of **your own fitted rule** (β by maximum likelihood from your catches), private PRNG; tolerance ±0.07; counts only if "no change" misses by ≥ 0.12. Ghost starts at cream. | D, P |
| L2 Too many liars | falling model numbers | The models' food plant wilts (a drooping plant in the scene): models 12, 8, 5, 3, 1, 1, 3, 8, 12. Grubs (6) are safe food from here on. The scatter plots each day's **mimic edge** (survival of the better-looking half minus the poorer half) against mimics per model. Retch 1–6 s by seed, in half-second steps. | On day 2–4 (whenever today's mix is not already the answer): drag the line on the mimics-per-model axis where tasting starts to pay. Expected: the break-even k = C (retch cost in meals at a meal a second); ±0.45 (one snap step either side of the stated cost). Ghost starts at the far right. | D, P |
| L3 Deadly models | model toxicity | Mild days (1.5 s) alternate with deadly days (6 s, and one chick misses its 3 meals). Models 2, 3, 4 or 6 by seed. The look histogram shows rough mimics persisting (a **Contested** pill). | "One warning look in n is bitter. What retch cost protects the mimics?" on a scatter of edge against retch cost. Expected: mimics per model now (the inverse of L2); ±0.9 on a 0–20 axis. | D, P |
| L4 Two poisons | a second defended species | Bitterwings (red band) and sourwings (ochre spots), 24 : 8, both defended; tasting kills. Which is commoner, and where the pair sits on the spots–band line (0.36–0.48 apart, never within 0.08 of an end), vary by seed. Grubs are the food. At dusk four **young birds** each taste one of every look they have not learned (generalisation fades as e^(−(d/0.12)²)); you watch them swoop. A large-effect allele (2 copies in each species) moves a pattern 92% of the way to the other; small genes refine it. | After the first dusk, on the pattern traces: drag where the two looks will meet. Expected: the commoner's typical look (advergence); ±0.06. Ghost starts halfway between the two looks (the "meet halfway" misconception, at least 0.18 from the answer) and must be moved. | D, P |
| L5 The first warning (boss) | clustered siblings | Two islands of 40 defended green bugs, 8 carrying a dominant bright allele. Island A lays eggs scattered; island B in sibling clusters. Eight young birds per island each learn for themselves: they find bright bugs far more often (95% against 42%), and after one bright taste spare bright bugs for the rest of their dusk. Spared siblings get a paper ring and a "spared" label. A third island, C, lays in pairs or eights (by seed), runs hidden, and is revealed at the end. | Gen 3: "Island C lays its eggs in pairs/eights. Bright share at generation 6?" Expected from 300 replays of island C's own first dawn (private PRNG); ±0.07. Ghost starts at 100%. | D, T |

`content.boss.inverts`: "Rare mimics thrive among common models; a rare new warning colour dies unless siblings cluster."

**Unit stars** (`unitStars`, D1 §3.2): Discover = L2's (chicks fed and the bluff called while models were scarce); Predict = the break-even (L2, or its inverse in L3) **and** the L4 meeting point; Transfer = island C. No level offers all three. A level card's "still to earn" line names the unit-level requirement when the level already earned that star (otherwise a player who earned L5's Discover would be told to earn it again).

**What if? (the freezer).** The earliest vial of each level thaws with one lever; the bird then hunts by the model's rule, fast:

| Level | Levers |
|---|---|
| L1 | No models; No inheritance |
| L2 | Models stay (12 all season); Cheap retch (1 s) |
| L3 | All days mild; All days deadly |
| L4 | No big jump (small steps stall); Start closer (the rarer pattern starts within the commoner's generalisation, and creeps towards it: Balogh & Leimar 2005) |
| L5 | Scatter B; Cluster A |

Every What if? text is checked against its own rerun (the frozen value against the end); when a rerun goes against the trend, an honest "chance" text replaces it (`w_chance`), and "Cluster A" says when bright was already gone (`w_gone`).

**Juice (D4 §5).** T1 per peck and per retch as above (feedback measured at 40 ms after the act through `Events.lat()`); T2 per dusk (tint, eggs flying into the graph, the young birds' swoops, a dusk pad); T3 per level (banner) and for island C's reveal. Insects twitch their wings at random (two baked frames), grubs inch along. Calm: Fx handles it (no shake, short tiers, no flicks).

**Live graph.** In the scene: the bottom band holds the ledger row, then the chicks and an in-scene graph (L1 columns of the average look painted in that look; L2–L3 the daily edge above or below zero, with model counts as bars in L2; L4 each species' pattern; L5 bright share on A and B, then C). In the strip: L1 the look histogram (spared solid, eaten hollow) and the average-look trace with the dashed expectation after the commit; L2 the edge scatter with the dashed expected curve (a smooth step through the break-even) after the commit; L3 the same against retch cost, and the look histogram; L4 pattern traces and mouthfuls per dusk; L5 bright share on each island. Nothing expected is drawn until the commit.

**Accessibility.** Arrows move a beak cursor, Space pecks (or skips a dusk), A toggles the auto bird (the non-visual path: it hunts by the model's rule), Enter locks a marker or skips, P focuses a marker. Untimed mode: a morning is 18 looks; a tap spends one, a retch spends its cost in looks; markers never time out; a **Rest** button (E) ends a morning when you choose not to eat, and the auto bird rests when nothing is worth eating (without them an untimed morning could never end). The setting enters the run as a logged `{k: 'unt'}` action, so a replay is the same on any machine. Data-table twin through the strip's "Show data".

**Learning layer.** Outside `?v1=1`: `TAKE.bitter`, `MODEL.bitter`, `RECALL.bitter` and a new `BRIDGE.bitter` (from the Black Country) are rewritten; there was no `TRANSFER.bitter`. `plan` retitles the subtitle to "Mimicry and warning colours". Star migration and `Save.d.done` come from `00_entry.js`.

**Teacher hook.** `teacherStep()` runs to the next dawn or prediction; a 30-bit `resultBits` (level, mask, meals %, the level's key number, the prediction, the retch cost or brood) gives a result code on assignment links; three prompts rising in Bloom level, the last a model critique.

## Science claims, with references (for Coordinator A)

| Claim (as on screen or card) | Reference | refs id |
|---|---|---|
| Tasty insects that look like defended ones are spared by birds that have learned the warning (Batesian mimicry). | Bates HW (1862) Trans Linn Soc Lond 23:495–566 | bates1862 |
| A bitter mouthful makes a bird retch; birds vomit toxic prey. | Brower LP (1969) Ecological chemistry. Sci Am 220(2):22–29 | brower1969 |
| Mimics are protected best when models are common and very distasteful; "mimics do best when rare relative to models" (D0 §3 wording). | Lindström L, Alatalo RV, Mappes J (1997) Proc R Soc B 264:149–153 | lindstrom1997 |
| Break-even: tasting a warning look pays when mimics per model exceed the cost of a retch in meals (signal-detection / expected-value argument; the model's rule, not a field number). | Oaten A, Pearce CEM, Smyth MEB (1975) Bull Math Biol 37:367–387; Ruxton GD, Sherratt TN, Speed MP (2004) *Avoiding Attack*, OUP | ruxton2004 |
| Imperfect mimics are common; relaxed selection under very noxious models is **one** explanation (Contested pill, no star). Predators generalise more widely when the model is more noxious. | Sherratt TN (2002) Behav Ecol 13:821–826; Duncan CJ, Sheppard PM (1965) Behaviour 24:269–282 | sherratt2002, duncan1965 |
| Two defended species sharing a look share the cost of teaching predators (Müllerian mimicry). | Müller F (1879) Proc Entomol Soc Lond 1879:xx–xxix | muller1879 |
| The rarer species converges on the commoner (advergence). | Mallet J (1999) Evol Ecol 13:777–806 | mallet1999 |
| A large-effect step first, then refinement by small genes (Turner's two steps); patterns that start within the generalisation range can converge gradually. | Turner JRG (1977) Evol Biol 10:163–206; Balogh ACV, Leimar O (2005) Proc R Soc B 272:2269–2275 | turner1977, balogh2005 |
| Mimicry loci often have large effects ("a large-effect allele" on screen; "supergene" is kept for Tangled Pairs, GAME_BIBLE §6). | Joron M et al. (2011) Nature 477:203–206 | joron2011 |
| Selection measured in a warning-colour hybrid zone is strong. | Mallet J, Barton NH (1989) Evolution 43:421–431 | mallet1989 |
| Novel, rare warning-coloured prey suffer more (anti-apostatic selection). | Lindström L, Alatalo RV, Lyytinen A, Mappes J (2001) PNAS 98:9181–9184 | lindstrom2001 |
| Aggregated novel prey were learned faster by great tits; aggregation is one route to warning colour. | Alatalo RV, Mappes J (1996) Nature 382:708–710 | alatalo1996 |
| Phylogenies suggest warning colours often came before grouping (so aggregation is one route, not the rule). | Sillén-Tullberg B (1988) Evolution 42:293–305 | sillentullberg1988 |
| Distasteful prey benefit from being conspicuous (learned faster than cryptic). | Gittleman JL, Harvey PH (1980) Nature 286:149–150 | gittleman1980 |

Model numbers that are designed, not measured, and wear a "selection ×N" chip or a MODEL tag: half the palewings eaten each morning (xN), heritability of look about 0.85, the retch costs, one meal a second, 4–9 generations (xN), the young birds' encounter and generalisation, 95% / 42% detection (xN), brood sizes, and the large-effect allele's standing copies ("history compressed" label in L4).

## Deviations from the spec, and why

1. **A headless sim, not Hunt mode** (lessons rule 1): Hunt has no replay, Freezer or bot sweep. The look is reused: legacy `flySprite` for palewings and models, legacy `leafTex` for the leaf; bitterwings, sourwings, grubs and island bugs are painted locally (`bwPaint`).
2. **Young birds in L4–L5.** Müller's argument and the aggregation boss both need many naive predators; one human who never forgets cannot show them. Four (L4) or eight (L5, per island) designed young birds each learn for themselves; the player is one more bird. In L1–L3 the player is the only predator, as D1 has it. The MODEL cards say "designed".
3. **L1 horizon varies (4, 6 or 9 generations)** instead of a fixed "in 4 generations": a fixed horizon let "today plus 0.2" earn Predict on most seeds.
4. **L2: models 12 → 1 → 12** (D1: 8 → 2 → 12), so the scatter spans mimics per model 1–13 and the crash is clear; **the retch cost varies (1–6 s in half-second steps, 11 values)** so the break-even differs by seed (with three costs, a fixed guess of 3.5 fitted a third of the seeds; now the best fixed guess fits 22%, and the tolerance is one snap step either side of the stated cost); **grubs** are safe food from L2, so a skipped warning look is not a lost meal (without them the break-even argument fails: a bird with nothing else to eat should always gamble). The prediction is scored against the analytic break-even (k = C), and the ask is placed on the first day 2–4 whose mix is at least 1.2 from it.
5. **L3 Predict is the break-even's inverse** (what cost protects mimics at today's mix) rather than D1's "predict whether rough mimics survive": that idea is contested (D0 §3), so it gets a Contested pill and no star.
6. **L4:** which species is commoner and where the pair sits vary by seed (otherwise "always the band end" scores: with the first, narrower placement and ±0.08, a fixed 0.8 fitted about a third of the seeds; the pair now sits 0.36–0.48 apart, never within 0.08 of an end, and the best fixed guess fits 21% at ±0.06); the large-effect allele moves 92% of the gap (D1 "most of the way"; at 85% the carriers sat at the edge of the commoner's generalisation and the allele was lost in 5 of 12 runs), with 2 standing copies per species (with D1's 5%, one copy among 8 sourwings, drift lost it in about 45% of runs). It is still lost in about a quarter of runs; the card then says so (`lost4`).
7. **L5:** "partly clustered" island C is broods of pairs or eights; island B's founders are one sibling brood. B still loses bright by chance in about 15% of runs; the card then says so (`b_lost`) and the Discover star still stands if the young birds were seen sparing siblings.
8. **The ledger sits in the bottom band**, not the HUD: the whisper slot covers the canvas just under the HUD.
9. **Size:** 100 KB raw, 33 KB gzip, a little over the lessons' 90 KB target.
10. **A known limit of the Transfer ask (L5).** Island C's expected bright share is set almost wholly by its brood size (pairs about 0.10, eights about 0.42, ±0.02 across seeds), so one fixed number fits about half the seeds. I tried varying the founder count (6–14) and the brood size (2, 3, 4, 8) by seed: the best fixed guess still fitted 25–40% at ±0.05–0.07, because a rare colour in small broods always sinks to a floor near 0.1. I kept the clear pairs-or-eights contrast. What protects the unit: Transfer is only one of three unit stars, and the L2 and L4 asks are now hard to guess. A "memoriser" bot that plays like the Bayesian bird and answers every ask with the best fixed number (fitted on seeds 101–140, tested on 1–40) hit L2 5, L3 4 and L4 2 times and Transfer 17 times, and earned three unit stars on 0 of 40 seeds. A designer could make C's founders differ from A's and B's, or ask for C's share relative to B's.
11. **The unit-wide bot check allows one lucky seed for the two guessing bots** (lessons rule 5 says none). Rule-following bots (always-A, always-B, greedy, threshold, Bayesian, copy-now) never reach three unit stars. The two guessers, random and `edge` (which reads a number off the screen: the look plus 0.2, mimics per model plus 2, the odds shown, a fixed 0.8, island B now), make three separate guesses, each right on at most about a quarter of seeds. `edge` hits all three on seed 28 (L2, L4 and island C), 1 of 40 seeds; the oracle names it and fails if either guesser does it on more than 1 seed in 30. While fixing this I found that the greedy bot's "no change" for island C read island B's share; it now reads island C's first-dawn share (C is hidden, so that is the honest "no change"), and greedy and copy-now no longer earn Transfer.

## Engine requests (nothing edited; local workarounds instead)

1. **Insect rigs** (palewing, shield bug, grub) for `01_rig.js`, so Tangled Pairs can reuse them; painted locally in `bwPaint`.
2. **Level cards under `unitStars`:** the card shows unit stars only, so a level's own earned stars are invisible; I steer the "still to earn" line with `End.show({stars})`. A row of the level's own bits would help.
3. **`Ledger.draw`:** a flip-in animation for the newest tile and a glyph size hint (done here with a ring and a scaled sprite).
4. **Whisper placement:** a `whisperAt: 'bottom'` slot; the top slot covers the top of the leaf and the timer pills.
5. **LiveGraph:** the dots chart's `marker` label clips at the right edge (marker dropped); the Predict "you" label collides with trace end labels at `at = x.hi` (asked at `gens − 0.4`).

## Tests (build: `V2_ONLY='0*,zz_*,bitter.js'`, scratch `wave2/bitter_final9.html`)

The sim runs are on `bitter_final8.html`; `bitter_final9.html` differs only in the L2 MODEL card text (it had stale numbers: models 12 → 2 and a 2–5 s retch; now 12 → 1 and 1–6 s), and lint, the fast oracle (32 of 32), the browser paths (8 of 8) and the monkey were rerun on it. Scratch outputs are in the screenshot folder (`oracle_final8.txt`, `bots_final8.json`, `bots_final8_unt.txt`, `memo8.txt`, `monkey_final9.txt`, `paths8.txt`, `golden8.txt`, `golden8_v1.txt`).

**Oracle** (`node tests/oracle.js BUILD bitter`): **34 passed, 0 failed**, with one reported note. Highlights:

- Determinism, snapshot (11.8k characters) and replay from the action log.
- L1: a bird that spares warning looks raises the palewing look by 0.37 (≥ 0.2); random eating moves it 0.019. The p1 expectation 0.468 matches the realised 0.494. The β fit recovers 4 (got 3.4).
- L2: the mimic edge is 0.35 at ≤ 2 mimics per model and 0.01 at ≥ 8. The scored break-even equals the cost (k = C). 11 costs (1–6 s); the best fixed guess fits 43 of 200 seeds (22%). The dashed expected edge crosses zero at the break-even.
- L3: edge 0.18 on deadly days against −0.01 on mild days.
- L4: with the big-jump allele the rarer moves 0.221, 7.6× the commoner's 0.029; without it 0.041 (stalls). Starting inside the commoner's generalisation closes 40% of the gap; from far, 3% (Balogh & Leimar). The best fixed guess fits 41 of 200 seeds (21%).
- L5: island A falls from 0.20 to 0.04; island B rises to 0.37; island C's expectation is 0.10 with pairs and 0.41 with eights; realised 0.061 and 0.491 (within 0.12 over 100 seeds). Note: the best fixed island C guess fits 50 of 100 seeds (deviation 10).
- What if?: 60 of 60 reruns end with no stars and a text chosen from the rerun (14 honest "chance" texts).
- An expert earns every star each level offers on 11, 12, 12, 10 and 10 of 12 seeds. No level offers all three.
- No rule-following bot's union reaches three unit stars over 30 seeds (best 2). Guessers: `edge` seed 28 only; random none (deviation 11).

**Bot sweep** (`tests/bots.js … --seeds 1-40`, 8 bots): no bot earns three stars in any level; no capped runs, no errors. Best mask and mean stars:

| Level | alwaysA | alwaysB | random | greedy | threshold | bayes | copynow | edge |
|---|---|---|---|---|---|---|---|---|
| 1 Bitter lessons | D-- 0.0 | --- 0.0 | --- 0.0 | D-- 1.0 | D-- 0.1 | DP- 1.4 | D-- 1.0 | DP- 1.3 |
| 2 Too many liars | D-- 1.0 | D-- 0.9 | DP- 1.1 | D-- 1.0 | --- 0.0 | D-- 1.0 | D-- 1.0 | DP- 1.3 |
| 3 Deadly models | --- 0.0 | D-- 0.0 | -P- 0.1 | -P- 0.1 | --- 0.0 | DP- 1.1 | -P- 0.1 | DP- 1.2 |
| 4 Two poisons | --- 0.0 | D-- 0.8 | -P- 0.2 | D-- 0.8 | D-- 0.8 | D-- 0.8 | D-- 0.8 | DP- 0.8 |
| 5 The first warning | --- 0.0 | D-- 0.9 | --T 0.1 | D-- 0.9 | D-T 1.1 | D-T 1.1 | D-- 0.9 | D-T 1.1 |

Unit stars per seed (count of seeds with 0, 1, 2, 3 unit stars): alwaysA 1/39/0/0, alwaysB 3/37/0/0, random 2/30/8/0, greedy 0/40/0/0, threshold 35/5/0/0, bayes 0/35/5/0, copynow 0/40/0/0, edge 0/31/8/1 (seed 28).

**Untimed sweep** (20 seeds, 6 bots): PASS, no bot earns three stars, no capped runs (the Rest action ends untimed mornings).

**Memoriser** (an extra adversary, scratch script): plays like the Bayesian bird and answers every ask with the best fixed number from seeds 101–140. On seeds 1–40 it hit Predict on L1 8, L2 5, L3 4, L4 2 and Transfer 17 times; three unit stars on 0 of 40.

**Monkey** (`GAME_HTML=… tests/monkey.py bitter 1,2,3 --vp 390x780,1280x720`): **6 of 6 runs reached the end card**, no errors. An earlier build also passed 9 of 9 at 390×780, 1024×768 and 1280×720.

**Browser paths** (`tests/bitter_paths.py`): **8 of 8** (a real tap eats and its juice lands 40 ms after the act; a bitter mouthful loses 2.4 s and flips a ledger tile; keyboard play; a real drag on the strip commits through the sim; untimed + Calm; teacher step; What if? "Scatter B" reruns with no stars and a chosen text; `?v1=1` plays the legacy Hunt chapter under the same id).

**Golden** (`tests/golden.py check`): 47 ok, 0 failed, 1 skipped (bitter, replaced by v2). With `--v1`: 48 ok, 0 failed.

**Text lint** (`tests/lint_text.js`): 0 errors, 0 warnings for the unit; also 0 and 0 over the full build of all eight v2 chapters (scratch `bitter_full3.html`), where Bitter's fast oracle also passes (32 of 32).

**Performance** (earlier build, same drawing code; Chromium, 4× CPU throttle, DPR 2): draw time median 0.5–0.8 ms, p95 3.9–5.2 ms per frame across the levels.

**Size:** `v2/bitter.js` 101 KB raw, 33 KB gzip.

**Housekeeping note:** a shell slip earlier in the session wrote five tiny error files at the filesystem root (`/batch2.done`, `/golden3.txt`, `/golden3_v1.txt`, `/monkey_final3.txt`, `/paths3.txt`, each about 100 bytes). My delete was blocked by a safety check, so they are still there; they are not part of the project and can be removed.

## Screenshots

`/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2/bitter/` (seed 3; 118 shots from `tests/bitter_shots.py` on `bitter_final7.html`, whose drawing code is the same as the final build's; `paths_*.png` from the final build): `bitter_390x780_L{1..5}_*.png` and `bitter_1280x720_L{1..5}_*.png` (open, peck, bitter, hunt, dusk, ask, reveal, crash, deadly, young birds, islands, island C revealed, level and unit cards), `bitter_390x780_{mono,deut}_L{1,4,5}_*.png`, and `paths_*.png` (peck at 40 and 150 ms, bitter mouthful, keyboard, strip drag, untimed, What if?).

Fixes found by looking: the whisper covered the ledger (moved to the bottom band); the "+1" pop landed on the ledger; dusk was dead time in L1–L3 (eggs now fly into the graph); grubs were too small; spots and band were hard to tell apart (paler, bigger spots; brighter band); the dots chart's "model" marker label clipped; island labels sat on the water line; spared-sibling rings stacked into a blob (smaller rings); the jittered L4 patterns could start too alike (jitter narrowed); the "Bitter mouthfuls" axis label crossed the line; the L2 question read "1 meals" for the new 1-second retch (now "1 meal"); the L4 ghost started at 0.5, which the new placement can put near the answer (it now starts halfway between the two looks).

## Instructor note (one page)

**What students do.** They are a great tit feeding chicks. They eat insects; some are bitter. Over five levels they discover, by their own choices, that (1) sparing what looks bitter makes harmless palewings come to look bitter; (2) the protection lasts only while mimics are rare relative to models, and collapses past a break-even they can compute (mimics per model > the cost of a retch in meals); (3) a deadlier model holds protection up; (4) two defended species converge, the rarer doing the moving, by a big jump then small steps; (5) a brand-new warning colour is lost while rare and scattered, and spreads where siblings cluster. **Time:** 15–20 minutes. **Before:** natural selection (the Lichen Wood). **Discussion prompts:** "Why did palewings come to look bitter, when no palewing chose to?" "Why does the rarer of two defended species do the moving?" "This bird weighs each taste perfectly. What would a real, forgetful bird change?" **Model limits to raise:** one predator species; selection many times stronger than in nature; the break-even assumes a meal a second; young birds are designed. **Contested:** why imperfect mimics persist (L3).

## Designer-and-colleagues playtest script (D6 decision 4)

1. Open Bitter Wings from the menu (or `?unit=bitter&seed=3`). Do not read anything first. Note the time to your first tap.
2. L1: eat for two mornings, then place the marker. Did the palewings visibly change colour by the end? Did the bitter mouthful feel costly?
3. L2: watch the plant wilt. When did you start eating warning-coloured insects again? Did the edge dots fall below zero when you did?
4. L3: did you treat deadly days differently? Was the Contested pill clear?
5. L4: did the young birds' dusk make the cost of learning visible? Did the rarer pattern move as you predicted?
6. L5: did "spared" siblings make sense? Was island C's question fair?
7. Rate 1–5: fun, clarity, felt cost, would you set it for a class. Flag any moment you were bored, or wanted to know how long was left.

---

## Session 2 (21 October 2026): finished, moved into `v2/`, re-worlded for D6 addendum 7–8

Unit agent: senior game developer, art director and evolutionary biologist. `git mv source/v2_wip/bitter.js source/v2/bitter.js` (staged rename, not committed). Files edited: `v2/bitter.js`, `tests/bitter_shots.py` and `tests/bitter_paths.py` (both now load with `&intro=0`), this log. No engine, legacy or other unit file was touched. **The sim is unchanged**, so session 1's numbers and test design still hold (rerun below).

### What changed

**A world of its own (D6 addendum 7).** The meadow and great tit are gone. The world is now a **Neotropical forest edge**:
- **Ground.** Deep greens with light falling through canopy gaps. Two layers of big rainforest leaves (pointed blades with veins), dappled sun, and heliconia-like blades framing the sides. A passion vine runs along the top, with Passiflora flowers (ten petals and a banded purple–white–violet corona) placed at the edges, never where butterflies sit. Everything is baked once per size from a private PRNG.
- **The player is a rufous-tailed jacamar** (*Galbula ruficauda*) with four downy white chicks in an earth-bank burrow. Jacamars nest in burrows in banks, and their chicks wear long white down. Chai (1986) watched this species taste Heliconius, release them and then reject them on sight. That is the game's "taste, retch, spare" loop, so the old "a model staggers off alive" beat is now true to the bird.
- **Insects.**
  - Palewings are Dismorphia-like whites: cream with dark wing tips. They are Bates's own Amazon mimics.
  - As the look rises, a palewing darkens towards the model: black, a red forewing band, a yellow hindwing bar and thorax dots, in Heliconius "postman" style.
  - L4 bitterwings and sourwings sit on a Müllerian pattern line on black, from two yellow spots to one red band, with rays at the band end.
  - Safe food is now **dragonflies** (glassy wings, turquoise abdomen), not grubs, because jacamars take flying insects. Grubs never made sense for this bird.
  - L5's defended prey are **shield bugs** (green and cryptic, or black with pale yellow bars) on two islands in a café-au-lait Amazon river. Shield-bug nymphs really do cluster as siblings.
  - The L2 "models' food plant" is now a **passion vine** that browns, droops and wilts its flower. Heliconius caterpillars eat only Passiflora.
- **Colour-blind safety** still rests on luminance and pattern, not hue: cream against black for the Batesian line; spots against band, and light against darker, for the Müllerian pair; green against bright-barred bugs; and a different shape for dragonflies. Checked in the `mono` and `deut` screenshots.
- **Accent.** `accent: '#E2483A'` (Heliconius red) tints the intro card and the chrome. `place: 'pond'` is the nearest deep-green backdrop; see engine request 6.

**Juice (fun first).**
- Butterflies at rest fan their wings in short bursts and breathe in between, and each casts a shadow on the leaf. Dragonflies hover. Calm mode turns all this motion off.
- **You are visible.** A jacamar head (metallic green, white throat, rufous breast, long black bill) swings in over the 90 ms telegraph and snaps. A tasty catch is pulled into the bill with a happy squint.
- A **bitter** mouthful keeps D4 §5.3 (5 px shake, corners darken for 250 ms, 50 ms hit-stop, a chunk off the timer) and adds:
  - the head recoils and swells by 25%;
  - its eyes screw shut and its gape opens with a pink tongue;
  - it shudders for about 0.6 s while green stink lines rise;
  - green droplets burst from the bill;
  - the model flutters away alive, as jacamars release tasted Heliconius.

  The whole grimace lasts 0.8 s (T2). The whisper reads "Bleugh! Bitter. You retch."
- The head comes from below, or from above near the nest band, so it is never hidden under the HUD.
- In L4–L5 the young birds are young jacamars in flight (long tail, long bill), replacing `Rig 'tit'`. The chicks are painted locally (`bwChick`, white down and a yellow gape) instead of `Rig 'chick'`.
- Actors are larger: a butterfly's wingspan is `0.1 × min(w, 1.2h)`, clamped to 34–64 px (it was 0.085, clamped to 30–60). L5 bugs went from 0.8 S to 0.9 S.

**Opening card (D6 addendum 8).** `content.intro = {game, biology, how}`, two sentences each, 25, 31 and 29 words. `00_entry.js` (the engine agent's card) draws it in the accent; screenshot checked.

**Words.** Everything was rewritten for the new world: HUD, whispers, Interesting texts, the five MODEL cards, `why`, the teacher prompts, BRIDGE and MODEL. The new science on screen:

| Claim (card) | Reference | refs id |
|---|---|---|
| Rufous-tailed jacamars taste and release Heliconius-like models, then reject them on sight (L1 "In nature"). | Chai P (1986) Field observations and feeding experiments on the responses of rufous-tailed jacamars (*Galbula ruficauda*) to free-flying butterflies in a tropical rainforest. Biol J Linn Soc 29:161–189 | chai1986 |
| *Heliconius erato* and *H. melpomene* match each other race by race across the Amazon (a Müllerian pair) (L4). | Müller 1879; Mallet 1999 (already cited) | muller1879, mallet1999 |
| One gene, *optix*, switches the red pattern elements of these butterflies (L4). | Reed RD et al. (2011) *optix* drives the repeated convergent evolution of butterfly wing pattern mimicry. Science 333:1137–1141 | reed2011 |
| In *H. numata* one supergene switches whole wing patterns (`why.real`, L4 refs). | Joron M et al. (2011) Nature 477:203–206 (already cited) | joron2011 |
| Jacamars attack novel colour forms of Heliconius more often (L5: rare warning colours are attacked). | Langham GM (2004) Specialized avian predators repeatedly attack novel color morphs of *Heliconius* butterflies. Evolution 58:2783–2787 | langham2004 |
| In the model a tasted L4 butterfly dies; real Heliconius often survive a taste (L4 simplification, an honesty note). | Chai 1986 | chai1986 |

### Adversarial biologist review (results)

1. **Batesian versus Müllerian.** L1–L3 are Batesian: palatable palewings with fixed models. L4 is Müllerian: both species defended, and they share the cost of predator learning. The two are kept apart in words and in art: the Batesian line runs from cream to model, the Müllerian line from spots to band.
2. **Frequency dependence relative to models (Lindström et al. 1997).** The L2 axis is *mimics per model*, not mimic frequency, and the break-even k = C is the expected-value threshold. One check: with abundant safe food, tasting never pays. Here safe food (cream palewings and 6 dragonflies) cannot fill the quota of 12, so the marginal choice is "taste a warning look or go short", and k = C holds at that margin. Kept as is; the MODEL card already says "the model's rule".
3. **Supergenes (Joron et al. 2011).** On screen it says "large-effect allele", while `why` and the L4 MODEL card now name *optix* and the *H. numata* supergene as the real cases. "Supergene" as a mechanism stays with Tangled Pairs (GAME_BIBLE §6).
4. **Heliconius rings.** The L4 "In nature" line now names the *erato*/*melpomene* co-mimicry across the Amazon. Advergence (the rarer converges) is right for 24 : 8 (Mallet 1999); the oracle confirms the rarer moves 7.6× farther.
5. **L5 origin of warning colour.** Anti-apostatic selection on rare new colours now cites the jacamar field result (Langham 2004) alongside Alatalo & Mappes (1996). Sillén-Tullberg (1988) keeps aggregation as "one route", and the card says so.
6. **Agency words.** The lint is clean: no "evolve", "choose" or "need" for individuals.

### Playtester and art-director review (results)

Looked at 118 screenshots (`tests/bitter_shots.py`, seed 3, 390×780 and 1280×720 plus `mono`/`deut`) and a frame sequence of the grimace (`grim_*.png`). Fixed in this session:
- the head was too small to read on a phone (it is now 1.25 S, swelling to 1.56 S in the grimace);
- the head could vanish under the HUD for butterflies near the top (it now comes from below);
- the bill was too thin (it is thicker now, with a pale rim);
- the mid-layer leaf veins competed with intermediate looks (toned down);
- L5's cryptic bugs were too small;
- the intro text broke the lint at 20 words a sentence and 3 sentences a part (rewritten).

Still open and acceptable:
- spared-sibling rings overlap in tight clusters (session 1 note);
- the shell's level-card button is the shell's carmine, not the accent (engine).

### Island C Transfer: tried again, kept

Session 1 noted that a fixed guess fits about 50% of seeds. This session measured the expectation by brood size (2 → 0.10, 3 → 0.21, 4 → 0.31, 6 → 0.38, 8 → 0.42) and over a founders × brood grid (4–16 founders). "More founders in pairs" lands on "fewer founders in eights" (for example 12 founders in pairs gives 0.22, and 4 founders in eights gives 0.21). So at ±0.07 a fixed guess still fits at least 37% of seeds in any design that stays fair to a human, and only ±0.05 brings it to 25%, which is too tight for an estimate. The pairs-or-eights contrast is kept. The protection is unchanged: the unit stars need L2 Discover, the L2/L3 and L4 Predicts, and Transfer together, and the memoriser earns three unit stars on 0 of 40 seeds. A designer decision could swap this ask for something else.

### Engine requests (new; nothing edited)

6. A `forest` place in `00_tokens.js` (for example `['forest', 'Forest Edge', '#16351F', 'jacamar']`). Bitter Wings uses `pond` as the nearest deep green until then.
7. Level and unit cards could take `ch.accent` for their primary button, as the intro card does.

### Tests (build `V2_ONLY='0*,zz_*,bitter.js'`, scratch `scratchpad/bitter/bitter.html`)
- **Text lint:** 0 errors, 0 warnings (unit and source).
- **Oracle:** 34 passed, 0 failed. The numbers are identical to session 1 because the sim is unchanged; the note on island C stands.
- **Browser paths:** 8 of 8 (tap and juice within 40 ms, bitter mouthful and ledger, keyboard, strip drag, untimed with Calm, teacher step, What if? "Scatter B", `?v1=1` legacy Hunt).
- **Bot sweep** (8 bots, seeds 1–40): PASS. No bot earns three stars in any level, and the table is identical to session 1's.
- **Untimed sweep** (6 bots, 20 seeds): PASS.
- **Monkey** (`GAME_HTML=… tests/monkey.py bitter 1,2,3 --vp 390x780,1280x720`): 6 of 6 runs reach "Unit complete", with no errors, NaN or stuck states.
- **Screenshots** (118, including `mono`/`deut`): no JavaScript errors, label warnings or network requests.
- **Not rerun:** legacy goldens. No legacy file was touched.
- **Size:** `v2/bitter.js` is 120 KB raw and 39 KB gzip (it was 101 KB and 33 KB) because of the painters.

Screenshots: `/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/bitter/s3/` (118 shots plus per-level contact sheets `sheet390_L*.png` and `cvd.png`), `grim/` (grimace sequence), `paths/`.

---

## Simplification (D6 decision 9), 22 October 2026

I played all five levels at 390 × 780 first (screenshots in the session scratchpad, `s3/simp_bitter_jaws_forager/before/bitter/`, and after, `after_bitter/`). The forest, the jacamar, the butterflies, the ledger and the juice stayed. What did not help was the asking. There were five drag-the-marker predictions on five different axes: the average look, the break-even, the "protecting cost", the meeting point and island C. There was also a hidden third island and a level, Deadly models, whose idea was the break-even again with a bigger C, plus a Contested pill. The one verb is now **tap a butterfly to eat it**.

### What was removed or merged, and why

| Removed or changed | Where | Why |
|---|---|---|
| p1, "where will the average look be by generation n?" (and its 4/6/9-generation horizon and the fitted-β replay) | L1 | It was not the aha. L1 is now just played and watched. Its key number comes at every dusk: "Spared palewings average n% warning look. Their young inherit it." The horizon is a fixed 6 generations, and the β fit and `replay1` code are gone. |
| p2, "how many mimics per model before tasting pays?" | L2 | The break-even is the chapter's **key equation**, so it is now **shown** rather than asked. Every day the HUD says "Today k = 8 mimics per model, C = 3: k > C, tasting pays" (or "k ≤ C, sparing pays"), and a pill in the scene reads "k=8, C=3", gold once tasting pays. The strip's scatter is titled "break-even k = C" and draws the expected edge curve from the start. The retch cost now varies only between 2 and 4 s, so the protected phase and the collapse both happen. It used to be 1–6 s, so that a guess could not fit. |
| Level "Deadly models" (old L3), its p3 inverse prediction, mild/deadly days, the lost chick, the Contested pill | — | Same equation, bigger C, and its contested part could not carry a star. The idea survives as one line in L2's MODEL card and the Why? maths: "A deadlier model raises C, so protection lasts longer" (Lindström et al. 1997, unchanged ref). Its What if? levers went with it. |
| Island C, its hidden run, the reveal phase and t5, "bright share at generation 6?" | Boss | It was a guessable number (its own log said a fixed guess fitted about half the seeds), and the designer asked about it. The boss now shows two islands only, A (scattered) and B (sibling clusters). At each dusk the HUD gives the key number: "Bright: island A n%, island B m%. After one taste, a bird spares the siblings." |
| The "Bitter mouthfuls" second chart | L3 (Two poisons) | It was a side panel that did not serve the ask. The pattern trace stays. |
| **Kept: the one prediction**, p4, "where will the two patterns meet?" | L3 (Two poisons) | This one makes the aha: the ghost starts at "meet halfway" (the misconception), and the answer is the commoner's look. Before the ask, the dusk shows the key number: "Young birds ate 3 of 8 bitterwings, 5 of 24 sourwings: n ÷ N". The ask says "The rarer pays more per head. Where will the two patterns meet? Drag the marker." |

The levels are now **L1 Bitter lessons, L2 Too many liars, L3 Two poisons, L4 The first warning**. Internally each level runs a model kind (`BWK.KIND = [0, 1, 3, 4]`, `s.kd`), so the science code of the kept levels is unchanged. The intro card's "How to play" now reads "Tap butterflies to feed the chicks in time; a bitter one costs seconds. Once, you drag a marker to predict."

### Stars, re-balanced

| Level | Discover | Predict | Transfer |
|---|---|---|---|
| L1 Bitter lessons | fed, palewing look +0.15 | — (was p1) | — |
| L2 Too many liars | fed, and you tasted warning looks at least twice while k > C | — (was p2) | — |
| L3 Two poisons | fed, and the rarer pattern crossed a quarter of the gap | the meeting point inside ±0.06 | — |
| L4 The first warning | fed, young birds spared ≥ 3 siblings on B, bright fell on A | — | **new:** taste exactly one bright bug (learn it as a young bird does), and bright ends commoner on clustered B than on scattered A (was island C's number) |

Unit stars: Discover = L2's, Predict = L3's, Transfer = L4's. No level offers all three. A new `learner` bot plays the boss's Transfer path.

### Science
No claim was added. Removed with the cut level: its MODEL card (Sherratt 2002 and Duncan & Sheppard 1965 were cited only there). The teacher prompt "when no palewing chose to" became "though no palewing changed its own look" (D0 §3: never "choose").

### Real biology (D6 decision 10)
Already met: jacamars, Heliconius-style models, Dismorphia-like palewings, dragonflies and shield bugs are the picture. Dot charts and ledger tiles are read-outs beside them.

### Tests
- `tests/oracle_bitter.js` rewritten for four levels: L1 rise, L2 edge collapse and the key line ("tasting pays" exactly when k > C), L3 advergence, Turner's two steps, Balogh–Leimar and the dusk line's counts (rarer loses 50% per dusk against 33%), L4 two islands, A falls, B rises, and the learner's Transfer path. Also: only L3 asks, exactly once. **31/31.**
- `tests/bitter_shots.py` and `tests/bitter_paths.py` updated for four levels (paths 8/8).
- Lint 0/0, `dup_globals` ok, bot sweep PASS (5 generic bots × 20 seeds; no bot earns three stars in a level; best masks D or -P-), monkey seeds 1–3 at 390 × 780 and 1280 × 720: 6/6 reach the end card with no errors. Screenshots were rerun and checked; fixes found by looking: "1 models" became "1 model", and the L3 ask lost its second chart.
