# D6. The designer's decisions (14 October 2026)

*Binding. Recorded from the designer's answers to the open questions in D5 §7 and CRITIQUE §1. **D6 overrides D0–D5 and API_v2 wherever they differ.** Every agent building or reviewing Endless Forms follows it.*

## The decisions

| # | Question (D5 §7) | Designer's answer | What it means for the build |
|---|---|---|---|
| 1 | Product name and frame | **The game is just called *Endless Forms*.** | Use only "Endless Forms" on screen, in titles and in docs. Do not brand the hub as "the Tangled Bank field station". The act/hub structure from D2 stays as the menu, unnamed beyond "Endless Forms". A sandbox or capstone may still use "Tangled Bank" as its own level name, because the phrase comes from Darwin. |
| 1b | Equilibrium (the separate Hardy–Weinberg game) | **Fold Hardy–Weinberg in as a single chapter**, with multiple levels that rise in conceptual complexity. Much of the old Equilibrium game should be revised to suit undergraduate teaching. | There is **one** Hardy–Weinberg chapter, not a 3–6 unit act. It replaces the legacy *Census* chapter and keeps its id `census`, so saves and `reg()` keep working. Title: **"Equilibrium"**; subtitle "Hardy–Weinberg and what breaks it". The `mixer` id is withdrawn. The Mixer's tumbler, jars and tiles become this chapter's opening levels. The spec is below. *The Royal Line* (X-linkage, pedigrees) and *The Leaky Tap* (mutation–selection balance) stay as separate chapters. |
| 2 | The cuts | **Accepted.** | Food Web, Islands and After the Fire move to the appendix. Every level-2 quiz is cut. |
| 3 | Platform | **Accepted.** | Plain JavaScript and Canvas2D through Wave 2. TypeScript/PixiJS will be decided later by the Wood spike. No Unity or Godot. |
| 4 | Playtesters | **No student recruitment for now.** The designer and some colleagues will playtest. | Replace every "five-student boring check" and "10–12 undergraduates" gate with a **designer-and-colleagues playtest**: `docs/PLAYTEST_GUIDE.md` gives a short script per unit and a feedback form. No ethics process is needed at this stage. Automated checks (oracles, bot sweep, monkey, lints, screenshots) still apply in full. |
| 5 | Sensitive-content panel | **No controversial topics.** | **Remove from all plans:** Malaria Coast, Out of Africa, Human Variation, the Manhattan Hunt (human GWAS), and anything on human population differences, ancestry or race. Teach heterozygote advantage with a **non-human example**: warfarin resistance in Norway rats (VKORC1; resistant homozygotes need much more vitamin K, so heterozygotes do best where warfarin is used; Bishop 1977, Pelz et al. 2005). Human examples stay only for uncontroversial medical genetics: haemophilia in a historical pedigree, cystic fibrosis carriers. Act 11 is renamed "Applied evolution". |
| 6 | Licence and hosting | **MIT licence for now.** | The repo `LICENSE` is already MIT (© 2026 KrishSanghvi2007). Show "MIT licence" in the README and the in-game credits. Hosting is undecided, so keep the single offline HTML file. |

## Spec: the "Equilibrium" chapter (id `census`, file `v2/mixer.js` in Wave 2)

**Why one chapter.** The old Equilibrium game took 17 levels and about 80% panels to teach what an undergraduate needs in one tight chapter. That is one idea, built up in layers: Hardy–Weinberg is the *null model* of population genetics, and every force shows itself as a specific departure from it.

**Role.** Investigator with a budget, plus experimenter (D1 §2). The beetle is the anchor organism (D2 decision 20). Each beetle wears its genotype as one allele per wing case, using D4's fixed data inks: blue A, amber a.

**Levels.** Each level adds exactly one idea. The per-second verb is always physical: tag, crank, sample or drag.

| L | Idea added | Verb and scene | Aha moment | Prediction gesture |
|---|---|---|---|---|
| 1 | Alleles vs genotypes: p and q count **copies**, not beetles. Dominant does not mean common (Yule's error). | Tap beetles to flip the phenotype/genotype lens and flick each wing case into an A or a jar. The jars *are* p and q. | A population of mostly blue beetles holds mostly amber copies. | Drag p on a 0–1 bar before the jars fill |
| 2 | Random mating means random drawing from the gamete pool. | Crank the tumbler: gametes pair onto a p × q square. Tiles collapse into p², 2pq and q² bars. | The square *is* the equation. | Draw the three genotype bars |
| 3 | One generation of random mating restores Hardy–Weinberg proportions from *any* starting genotype mix; allele frequencies do not change. | Start from a lopsided mix (all AA plus all aa) and crank one generation. | The heterozygotes appear at once; p stays put. | Tap the de Finetti triangle where next generation lands |
| 4 | Hardy–Weinberg is a null model you test. A χ² test has 1 df for two alleles; sample size matters. | Drag a quadrat over a living field to collect beetles, at a cost in time per sample (the Census mechanic). Observed vs expected bars fill live. | Small samples "fit" almost anything, so failing to reject is not the same as proving HW. | Set the χ² verdict before the last 20 samples |
| 5 | Non-random mating. Inbreeding gives a heterozygote deficit of 2pqF and leaves p unchanged. Contrast assortative mating at one locus. | Toggle a "close relatives mate" valve. Watch the 2pq bar shrink while the jars stay level. | Genotypes change; alleles don't. Inbreeding alone is not evolution. | Drag the expected heterozygote bar |
| 6 | The Wahlund effect. Pooling two demes with different p shows a heterozygote deficit even when each deme is in HW. A teaser for F_ST. | Draw a boundary on the field map to split the sample. | The "deficit" was in your sampling, not the beetles. | Split the field where you think the demes are |
| 7 | Selection. Genotypes at birth are in HW, but adults depart from it. A rare recessive hides in heterozygotes and is lost slowly (Δq ≈ −spq²/(1 − sq²)). Heterozygote advantage keeps both alleles, via warfarin-resistant rats: the rat is the boss organism for this level only. | You are the bait-layer. Lay warfarin and watch the rats; resistant homozygotes suffer vitamin-K deficiency. Compare newborn and adult censuses. | Adults show *excess* heterozygotes. The polymorphism is stable at q̂ = s₁/(s₁ + s₂). | Drag q̂ on the trajectory chart |
| 8 | Boss: "Fit is not stasis". Drift and migration change p every generation while genotype proportions *still* fit HW. Then a case file of mystery populations: diagnose inbreeding, Wahlund, selection, drift or migration from cheap tests (strata, ages, repeat samples). Includes carrier estimation (q = √(aa frequency); carriers = 2pq) on a CF-style recessive. | Investigator with a sampling budget. | Passing an HW test does not mean "no evolution". | Commit a diagnosis per population, with confidence |

**Science guard-rails.** These come from R4, R7-R4 and sweep G7.
- χ² for genotype counts with two alleles has **1 df**.
- Drift does not by itself create HW departures in a large sample.
- F is introduced here only as "the heterozygote deficit" (D5 decision 5 names F formally in the Pedigree; for now say "F, the inbreeding coefficient", once).
- Hardy–Weinberg proportions are reached in **one** generation for an autosomal locus with equal allele frequencies in the two sexes. If allele frequencies differ between the sexes, it takes two generations. X-linked loci approach equilibrium slowly, with an oscillation; say so in the MODEL card and point to *The Royal Line*.
- The Census sweep corrections (G1) stand: a good HW fit does not mean nothing is happening, and Allison's carriers had fewer, milder malaria infections. Keep that last point only as a short, neutral "In nature" note, or drop it under decision 5.

**What to reuse.**
- Equilibrium `engine.js`: `hwExp`, the jar effect, tile collapse and the de Finetti triangle drawing.
- Legacy `ch13.js`: Census sampling, the strata and the newborns vs adults contrast.
- Equilibrium L12–L17 visuals where they help.
- `Gen` extension 3 and `XHud` only if the X-linked note needs them.

**Teacher hook.** Projector mode with the triangle. Three discussion prompts, the last of them a model critique ("Which HW assumption is least true for your study species?").

## Effects on documents and the build list

- **Wave 2 Batch 1** builds "Equilibrium" (id `census`) in `v2/mixer.js` instead of "The Mixer".
- **API_v2 §10 act plan:** Act 3 is "The gene pool": `census` (Equilibrium) plus `royal`. Act 11 is "Applied evolution". The `mixer` id is gone.
- **D3:** Malaria Coast, Out of Africa, Human Variation and the Manhattan Hunt are withdrawn. Heterozygote advantage lives in Equilibrium L7 (warfarin rats).
- **D2 §5 and the Act 3 plan:** superseded by the single chapter above.
- **Playtesting:** see decision 4.
- **GAME_BIBLE and CRITIQUE:** decisions log updated, and the open questions are marked answered.

---

## Addendum, 21 October 2026: the designer's feedback after playing Batch 1 (binding)

**7. Every chapter looks too similar** (beetles, blue and yellow, the same scene). From now on **each chapter has its own world**: its own organism, its own place and its own palette, with an art style that fits the place. Examples: dark-field fluorescence for embryos, sepia portraits for the royal pedigree, turquoise lake water for the cichlids, sunset coast for the gulls. The fixed allele inks (blue A, amber a) are used **only inside genotype or allele read-outs** (jars, genotype lenses, allele-frequency graphs), never as a chapter's overall colour scheme. Beetles belong to Equilibrium only. Chrome (HUD, dock, cards) may share a layout, but each chapter tints it with its own accent colour. Colour-blind safety rules still apply.

**8. Every chapter opens with a short description card.** This overrides D5 decision 18 and the "no card before the first action" rule. The card has three labelled parts:
- **The game:** what you are and what is happening.
- **The biology:** the idea the chapter teaches, in plain words.
- **How to play:** the controls and the goal.

Each part is 1–2 sentences, at most about 35 words, so about 100 words in total. The card has a big Play button, and a "?" button in the dock reopens it during play. The ghost hand still demonstrates the first action once play starts. Chapters supply the text as `content.intro = {game, biology, how}`, and `00_entry.js` draws the card for every v2 chapter.
