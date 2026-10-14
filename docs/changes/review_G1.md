# Review of science sweep G1, with follow-up fixes

I reviewed `science_sweep_G1.md` against the actual `git diff` of ch1, ch4, ch13, ch16 and ch17. I re-ran the models in Node using the game's own code:
- Why Sex?, old and new father rules, 200–300 runs for each strategy
- Drift Casino, 20,000 runs per jar
- Clinic, brute force over every treatment sequence

Every number the sweep quotes checks out: the e^(−U) load, the Casino fixation and settling rates, the Clinic minimum toxicities of 6 and 8, and the coalescent share of 53%. The father-selection fix in ch17 is correct, and it is needed.

## Edits made in this review

| file | line | change | why |
|---|---|---|---|
| ch17.js | 9, 44 | Third star now needs sex in at most a quarter of the blocks (`NB / 4`). It used to be half. | After the model fix, alternating sex and cloning passes 98–99% of the time, so the third star had become automatic. With 4 well-spaced sexual blocks out of 16, players pass about 73–75% of the time, which is about where alternating stood before the fix (75%). |
| ch17.js | 13, 47 | Level 2 idea, paragraph 2, and the card between levels now say the parasite kills **most** individuals without both. | Matches the corrected idea text and the code: 15% of non-carriers survive the first generation and 10% each generation after. |
| ch17.js | 47 | End card: "Sex halved your births" → "Sex halves births". | The old wording was false for a player who never chose sex. |
| ch17.js | 57 | Notes: the idea and chart are now keyed to `L` (the level being played), as the stats already were. | Between levels, the Notes showed level-1 stats beside the level-2 idea and an empty "Beneficial mutations" chart. |
| ch4.js | 7 | "each chromosome you inherit is a patchwork" → "most chromosomes you inherit are patchworks". | A chromatid escapes exchange with probability about (½)ⁿ for n chiasmata, so non-recombinant chromosomes are common, especially small ones. |
| ch16.js | 11 | States that h₁ and h₂ are the square roots of the heritabilities. | The text uses h² for heritability one sentence earlier, so h₁ invites misreading. |
| ch16.js | 10 | "soon after came piebald coats … shortened snouts" → "in later generations came …". | Trut 1999 gives about generations 8–10 for depigmentation and 15–20 for skull, tail and leg changes, against generations 4–6 for tameness. |
| ch13.js | 48 | Census end card: HW now holds for "each generation's newborns", not for "genotypes" in general. | Viability selection does distort adult genotypes, which is the chapter's own level-2 lesson. Random mating restores HW proportions among newborns. |
| ch1.js | 115 | Casino maths: "almost never settles" → "almost never settles in that time". | Every finite neutral jar eventually settles, and that is the Casino's own first rule. |

## Not changed (needs design)

- **Why Sex? level 2 hardly separates strategies.**
  - Under the new model, survival is: all-asexual 88–91%, all-sex 92–95%, sex then clone 97%.
  - The pass rule (`n ≥ 5` at the end) is almost unloseable.
  - The share carrying both A and B at generation 40 does differ: 35% asexual against 62–64% with sex. Score on that, or make the parasite remove every non-carrier.

## Tests

- `node --check`: all five files pass.
- Monkey tests, my build against `Endless_Forms_v1.html`: the same outcome classes for every touched chapter, seeds 1–3. The known timeouts (mendel, fancier seed 1) and stalls (the cross L2 drag, coal L3 seed 3) are pre-existing.
- No JS errors and no NaN.
- Targeted Playwright check of Why Sex?: L1 → between-levels Notes → L2 → end card. All correct.
