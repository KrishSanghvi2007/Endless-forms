# Review of science sweep G4, with follow-up fixes

I reviewed `science_sweep_G4.md` against the actual `git diff` of ch6, ch8, ch18, ch19, ch22 and ch24. I also checked it against `R7_factcheck_R2`, which did not exist when the sweep ran. I re-ran two models in Node using the game's own code:
- Lock and Key level 1, old (strength 6, no input) and new (strength 4, 4% mix)
- Crowd level 2, with total weight 40 and 32, 2,000 games per policy

The sweep's numbers check out:
- **Lock and Key:** hosts fell to 1.1 × 10⁻⁷ under the old model and never go below 1.04% under the new one. Picking the commonest host scores 85.5%; picking the largest h − q scores 99%.
- **Crowd:** "always right" scores 20%, and counting heads scores 69%.

Every edit in the sweep is correct, and none of them removed anything correct. Its two model fixes (Lock and Key's mutation/migration input, and the Crowd's weight of 32) are right and needed.

## Edits made in this review

| file | line | change | why |
|---|---|---|---|
| ch22.js | 11, 44 | Commons `real` and end card: "an act that never repays its maker needs relatives to spread" now says such an act needs producers to end up with other producers more often than chance gives. Relatives do that, and so did the hand-made jars of level 1. | The old sentence contradicted the chapter's own level 1. There b/k = 0.8/20 = 0.04 < c = 0.2, so producing costs its maker more than it gets back, yet producers rise overall because the jars were assorted by hand. What strong altruism needs is assortment, and kinship is only the commonest source of it. |
| ch18.js | 75, 89 | Shape-shifters: "not plastic at all" now says the generalist's yield does not change with climate. The idea text adds that, in real plants, such steadiness often comes from plasticity in other traits. | R7-R2 A71 (it overrides R2): a flat yield norm can come from plasticity in other traits (fitness homeostasis). |
| ch18.js | 10 | Live Fast: Williams 1957 is now cited for the ageing prediction and Williams 1966 for reproductive effort. A clause adds that the ageing prediction holds only under some conditions (Abrams 1993). | R7-R2 C5. Austad's slower ageing tests the 1957 prediction. Citing 1957 without Abrams' caveat would state a prediction that is not general. |
| ch6.js | 8, 15, 82 | River level 2: "each night stands for a new generation" now says each night jumps many generations ahead. The end note says "Over many generations", not "Over six generations". | The sweep rightly removed "evolution within one female's life", but "six generations" claims the calls moved about 1 SD per species (gap 5 → 14 pulses/s) in six generations. That is implausibly fast for reinforcement, which works through indirect selection on male calls. |
| ch24.js | 10 | "as in slime moulds" → "as in cellular slime moulds such as Dictyostelium". | Plasmodial slime moulds (*Physarum*) are syncytial and do not aggregate. |
| ch8.js | 85 | End card adds that the moth was not seen visiting the orchid until the 1990s (Wasserthal 1997). | R7-R2 C15 (marked "not yet"). |

## Not changed (outside my files, or needs design)

- **`ch99.js` `MODEL.lock`** still describes plain "deterministic updates". It should mention the new 4% mutation/migration input each season.
- **Crowd level 2 balance:**
  - "Always pick the rich feeder" averages 80% and passes 32% of games. Before the fix, "always right" passed 31%.
  - The cause is that only 16 small fish exist. When few big fish sit at the rich feeder, the crowd cannot reach the ideal free distribution, so the rich feeder is best in about 68% of rounds.
  - A design fix would let the big fish move toward the target too.

## Tests

- `node --check` passes on all six files. Build: `scratchpad/sweep/ef_G4.html`.
- Monkey tests, seeds 1–3, for river, lek, meadow, livefast, plastic, crowd, commons, lock and many: all 27 runs reached the end card. There were no JS errors, no NaN and no stuck runs.
- Direct Notes check of Crowd L1/L2, Lock L1 (before and after picks), Commons L2, Many L2, Live Fast, Shape-shifters L2, Lek, Meadow and River: all clean, with no page errors. Lock's minimum type frequency was 1.1%.
