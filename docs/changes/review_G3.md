# Review of science sweep G3: fixes applied by the reviewer

These edits sit on top of the sweep in `science_sweep_G3.md`. All files are in `games/endless-forms/source/`.

| file | chapter | change | why |
|---|---|---|---|
| ch3.js (Two Sizes `maths`) | Two Sizes | "small ones do well because most of their partners bring food" → "small ones profit from them: a small cell that happens to fuse with a big one makes a zygote that survives, and small cells are so numerous that many do" | `pool()` weights partners by gamete number. Once tiny cells are common, most of a tiny cell's partners are other tiny cells, so the sweep's sentence was false for the model. |
| ch7.js (Alarm `ideas[0]`) | Alarm Call | After the Sherman 1985 sentence, adds that the game still gives the whistle a small cost | Sherman found whistlers were killed less often than non-callers (about 2% against 28%), which makes the cost negative. Yet the game scores silence as correct below r = 0.20. The text now discloses the simplification. |
| ch7.js (Brood `finish`) | Fisher's Brood | "the population settled near X% males" → "the share of males fell toward one in three, reaching X% by season 6: the population was heading for equal investment" | m falls 0.45 → 0.40 → 0.37 in act 2 and never reaches 1/3 (R7-R2 C8, still open). |
| ch11.js (Nest `maths`) | The Nest | floor(F ÷ 6) well-fed chicks "plus one part-fed chick (worth 0.4) if 4 or 5 feeds are left over" | Matches `fl()` and `bestVal1`. An ordinary spring's best is 3.4 fledglings from 4 eggs (R7-R2 C7, still open). |
| ch7.js (Mendel `notes2`) | Mendel L2 | Shows χ² whenever both traits segregate, even with an empty class. When only one diagonal pair of classes appears, adds "no recombinants among sixteen seeds, a strong sign of linkage". Otherwise says that a parent has only one version of the gene. | Before this fix, an empty class always produced "at least one parent carries no hidden copy". A linked double heterozygote (8 cM) test-crossed with 16 seeds shows no recombinants 26% of the time (0.92^16), so the Notes misdiagnosed the clearest evidence of linkage. |

**Tests.** I rebuilt to `scratchpad/sweep/ef_G3.html` and ran monkey on seeds 1–3 for gametes, brood, alarm, nest and mendel.
- Every chapter reached `end` on all three seeds, except mendel.
- Mendel timed out on seeds 1 and 2 (the known pre-existing timeout) and reached `end` on seed 3.
- There were no JS errors and no `NaN` or `undefined` on screen.
- A browser probe of `notes2` with synthetic crosses (8:0:0:8, 5:3:4:4, 9:0:7:0, 6:4:6:0) gives the intended messages.
