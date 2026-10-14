# Science sweep G2: Selection and Games

**Scope.** These files:
- `hunt.js`: Lichen Wood, Black Country, Bitter Wings and the Hunt engine.
- `boot.js`: only the idea, maths and noteExtra lines for lichen, soot and bitter.
- `ch2.js`: Scribe, Sieve, Left Jaw Right Jaw.
- `ch25.js`: Landscape, Switches.
- `ch5.js`: Hawks and Doves, and `CH_ALARM_V1`. The live Alarm Call chapter (`ch7.js`) inherits `maths`, `ideas[1]` and all of Level 2 from it.
- `ch15.js`: Blood Debts.

**Sources.** R1, R7_factcheck_R1, R3 and R7_factcheck_R3 (Switches), R4 (hunt chapters), and my own reading of all text and model code. Where R7 disagrees with R1, R7 wins.

**Line numbers** are for the edited files.

## Changes

| file:line | chapter | before (short quote) | after | why | source |
|---|---|---|---|---|---|
| hunt.js:341 | Black Country | intro key `part:` … | renamed to `how:`, keeping the text | **Visible bug.** `ch99.js` L187 does `CH_SOOT.intro.how += …`, so "How to play" read "undefined History is compressed…" and the real instructions disappeared. Confirmed in the original build. **Owner of ch99: keep `.how`.** | — |
| hunt.js:345, 356–360, 366–371, 341 | Black Country | carbonaria `mu: 0.01` (recurrent typica→carbonaria mutation in every gamete) | `mu: 0`. Setup guarantees at least one carbonaria copy. If carbonaria is lost before goal 1, that generation's migrant is a black heterozygote "from the sootier woods near the city", with a one-time toast. The how-to-play text says so. | A 1% rate is about 10⁵ times too high and gave carbonaria many origins, contradicting the chapter's "single dominant mutation… dated to around 1819". Migration from industrial centres is how carbonaria actually spread. I simulated balance with the game's Gen engine over 1,000 runs: 3-star rate 87% (was 83%); median finish generation 16 (was 17). | R7 D16; R4 #5; van't Hof et al. 2011, 2016 |
| hunt.js:390 | Black Country | "Carbonaria is now X% of gene copies — more than the black moths alone suggest would be hidden, because heterozygotes are black too." | "This generation, carbonaria made up X% of gene copies — less than the share of black moths, because one copy makes a moth black, so many black moths hide a pale copy." Shown only when it is true. | The old sentence was garbled and pointed the wrong way: the copy share is *below* the black share. | Standard: 1 − (1 − q)² > q |
| hunt.js:402 | Black Country end card | "that hidden reserve is what let the pale form return" | "…hidden reserve, topped up by pale migrants from cleaner woods, is what let…" | The model also adds a pale migrant every generation. | code |
| boot.js:8 | Black Country maths | "the share of black moths is 1 − (1 − q)² … typica is never quite eliminated" | adds "and random mating"; "selection removes typica ever more slowly"; mentions migrants | Makes the HW assumption explicit. "Never" is a deterministic statement, and the model also has migration. | Haldane 1924 |
| hunt.js:212–213 | Hunt Notes (all three) | R row: "Some of what you selected was luck of development… so R is usually smaller than S" | Soot: "Black survivors can carry a hidden pale copy and pass it on…" Others: "on average R is a little smaller than S. Chance in who bred with whom makes any one morning noisy." Soot h² row adds "this share is not fixed: it changes as carbonaria spreads". | In Soot the phenotype is deterministic, so R < S is caused by dominance, not development. In Lichen and Bitter, heritability is about 0.95, so "usually smaller" overstated it. | Falconer & Mackay |
| hunt.js:211 | Hunt Notes | "the moths you spared" | "the ones you spared" | Bitter Wings has no moths. | — |
| hunt.js:324–330 | Lichen end card | "So about X% … was passed on … The rest was developmental luck" | Three branches: above 100% is explained as sampling noise; 75–105% is "almost entirely genetic (heritability about 0.95)"; low values are explained as noise. The direction word (paler or darker) follows S. | **Simulated over 400 runs: the realised h² exceeds 1 in about 43% of runs**, so the old card told nearly half of players "120% was passed on… the rest was developmental luck". The model's true V_G/V_P stays at 0.95 across generations. | own simulation |
| hunt.js:294 | Lichen real | "…Here, you were the jay." | adds "though with one kind of bark and a short season this game tracks only the average moth, not the spread of looks" | Bond & Kamil's key result (apostatic selection producing a polymorphism) is not modelled. | R7 A29; Bond & Kamil 2002 |
| boot.js:4 | Lichen idea | "the population **drifts** toward…"; "moves less … than the difference between survivors **and the rest**" | "evolves toward"; "a little less than the survivors differed from their whole generation" | "Drift" is the technical term for chance, and this is selection. S is survivors versus the whole generation, not versus the eaten moths (which would be about 2S here). | R7 D14 |
| boot.js:5 | Lichen maths | "share … that was genetic"; "Selection also uses up variation, which is why the response slows" | "…that their offspring inherited; … about 0.95"; "slows… mainly because fewer of them stand out, so S shrinks; selection also uses up some of the variation"; adds "You eat half of every generation, far stronger selection than is typical in the wild." | Narrow-sense h² is the share that is passed on. The response slows mainly because S shrinks. The unrealistic selection intensity is now disclosed. | R7 D15, A30; Kingsolver et al. 2001 |
| hunt.js:410 | Bitter intro | "Nothing stops a palewing from dressing like a bitterwing." | "Nothing stops palewings from evolving to look like bitterwings." | It read as individual, intentional change. | — |
| hunt.js:413 | Bitter real | "butterflies **copying** toxic ones"; "mimics **only work** while they are rare" | "butterflies that look like distasteful ones"; "mimics do best while they are rare compared with their models"; "may be a bluff" | "Copying" is teleological. Rarity matters relative to models, and mimics can be common when the model is very noxious. | R7 D13; R4; Lindström et al. 1997 |
| hunt.js:442 | Bitter end card | "is what they evolved against"; "the signal is only worth copying while it stays honest" | "did the selecting"; "the signal protects mimics only while it stays mostly honest" | Fixes muddled and teleological wording. | — |
| boot.js:12 | Bitter maths | (frequency dependence as if modelled) | adds "Here there are always eight unchanging bitterwings, so any frequency dependence lives in your own memory." | The model-to-mimic ratio never changes in code. | R7 A42 |
| ch2.js:10–11 | Scribe intro | "copies genes"; "if you run out of time, the enzyme slips and skips a base" | "copies DNA"; "you skip a base, which is a deletion" | Polymerase copies the whole genome. Real slippage depends on sequence, not time. | R7 A5; Streisinger et al. 1966 |
| ch2.js:15 | Scribe maths | (no slippage note) | adds "In real cells, single-base slips happen mostly where a short sequence repeats … rather than because the enzyme is rushed." | Honest about the timer mechanic. | Streisinger et al. 1966; Levinson & Gutman 1987 |
| ch2.js:14 | Scribe real | "…especially the father's, **because** sperm-making cells keep dividing" | "The classic explanation is that… but DNA damage that builds up with age may matter as much (Gao et al. 2019)." | Replication-driven paternal-age effects are now contested. | Gao et al. 2019 PNAS |
| ch2.js:30, 32–33, 40–42, 76 | Scribe model and text | stop-codon loss: `stopLost` never affected `works`, and the verdict fell through to "Every mistake was silent: same amino acids, same protein" or "A perfect copy". A skipped base inside the stop codon was "A perfect copy". | `stopLost` is also set by a deletion in the stop codon. Such a protein is not working: "The stop codon was lost: the cell reads on past the end of the gene and adds a tail, and such proteins are often destroyed." Counted as broken on the end card, chart and Notes. | **False feedback**: the game told players a read-through mutation was silent. | R7 A6; nonstop decay |
| ch2.js:41 | Scribe end card | "Mutations are simply copying errors" | "Copying errors are one source of mutation, alongside DNA damage and faulty repair, and all of them happen without regard to whether they would help." | Contradicted the chapter's own real text. | R7 D3; Gao et al. 2019 |
| ch2.js:92 | Sieve real | "only large, hard seeds remained"; "Stabilising selection is everywhere once you look" | "the small, soft seeds ran out, leaving mostly large, hard ones"; "thought to be common, although field studies detect it less often than textbooks suggest (Kingsolver et al. 2001); a classic case is…" | The prevalence of stabilising selection is contested. | Kingsolver et al. 2001 Am Nat; Boag & Grant 1981 |
| ch2.js:93, 156 | Sieve maths and end card | "two extreme parents have middling offspring … without splitting it into two peaks"; "it never split the finches"; "the seedcrackers' trick" | "a big-beaked parent and a small-beaked parent…"; "rarely splits it into two lasting peaks"; "didn't easily do: split…"; "as in the seedcrackers" | Same-end parents have extreme young. The secret "split" challenge (ch99) can briefly succeed, so "never" contradicted it. | R7 D11 |
| ch2.js:180 | Sieve Notes | "About two-thirds of birds lie within one SD"; "The genetic share…" | "In a bell-shaped spread, about two-thirds…"; "The share of the survivors' difference that their chicks inherited." | The two-thirds rule holds only for a normal distribution, and disruptive missions make the spread non-normal. | — |
| ch2.js:190 | Jaws hook | "jaw is bent to one side, so it can **only ever** strike one flank … The trait is inherited." | "mouth is twisted a little to one side, so it mostly strikes one flank … The twist is partly inherited." | Laterality is largely continuous, with low heritability, and attacks are mostly but not absolutely one-sided. | R7 D7, B31; Raffini & Meyer 2019 |
| ch2.js:194 | Jaws real | "The genetics … more complicated than Hori first assumed" | "Jaw direction turned out to be only partly inherited, with a large role for development (Raffini and Meyer 2019), but the frequency-dependent explanation of the swings still stands." | Says plainly what changed. | Raffini & Meyer 2019 Hydrobiologia 832:65 |
| ch2.js:195 | Jaws maths | "It has a **stable** point at 50:50, but … overshoots and oscillates" | "balance point" | The point is not necessarily stable once the delay is included (the text itself says it oscillates). | — |
| ch2.js:259 | Jaws Notes | "Heritable jaw direction. This is the gene frequency that evolves." | "Share of fish striking your right flank. Here jaw direction is fully inherited, so this share evolves like a gene frequency; in the real fish it is only partly inherited." | A phenotype share is not a gene frequency. | R7 D7 |
| ch25.js:12 | Landscape idea | "The steepest step is not always the best one." | adds "A real population cannot plan ahead: which fitter mutation turns up and spreads first is partly luck, though bigger improvements are likelier to win." | The player gets foresight and choice that evolution lacks. | Gillespie 1984; Orr 2002 |
| ch25.js:42, 45 | Landscape | "Mutations happen one at a time"; "early **choices** close off later options" | "usually arrive one at a time"; "early steps" | Double mutants and stochastic tunnelling exist. "Choices" implies agency. | Weissman et al. 2009 |
| ch25.js:70 | Switches hook | "**Most** of evolution's big changes in form…"; "take the spines off a stickleback" | "Many…"; "take the pelvic spines off" | The share is contested (coding changes and duplications matter too). The deletion removes pelvic spines, not dorsal ones. | R7_R3 M11, SW2; Hoekstra & Coyne 2007; Chan et al. 2010 |
| ch25.js:74 | Switches real | "The deleted region sits in a fragile stretch of DNA, which may explain…" | adds "the deletions bear signatures of positive selection (Chan et al. 2010)"; "is rich in repeats that may make it fragile, which could explain…" | The selection step was missing, and the fragile-site idea is a hypothesis. | R7_R3 M13; Chan et al. 2010 Science 327:302 |
| ch25.js:75–76 | Switches maths and idea | (grid presented as the rule) | adds "The grid is simplified: real Hox domains overlap, and Ubx also acts in the first abdominal segment, where, as abd-A does further back, it stops legs from forming." Adds colinearity: "The rows are in the same order as the genes sit on the chromosome…" | The simplification was unlabelled. Colinearity was never pointed out in play. | R7_R3 SW3, SW4; Vachon et al. 1992; Lewis 1978 |
| ch25.js:87 | Switches task 4 and L1 card | "Without abd-A … the abdomen becomes thorax-like, with legs."; "Hox genes sit at the top of the developmental hierarchy" | "…in this simple grid that makes it thorax-like, with legs. Real flies are subtler: Ubx alone gives legless segments like the first abdominal one. Real legs on the abdomen come from mutations that turn the first abdominal segment into a copy of T3 (Lewis 1978)."; "selector genes: each controls a whole programme of segment identity" | **Wrong biology** (losing abd-A gives A1-like, legless segments). This needs an A1 column to fix properly (see the redesign list). In flies, Hox genes act downstream of the maternal, gap and pair-rule genes. | R7_R3 M2, M12; Sánchez-Herrero et al. 1985 |
| ch25.js:91, 93 | Switches L2 | "freshwater populations lost their spines"; answer: "it sits in fragile DNA that breaks often"; end: "harmless elsewhere and, sitting in fragile DNA, arise often" | "many … lost their pelvic spines"; "it may sit in fragile DNA"; end: "losing the pelvis is favoured in some lakes, the deletions do no harm elsewhere, and repeat-rich DNA may make them arise often" | Hedges the hypothesis and adds positive selection. | R7_R3 M13 |
| ch5.js:6 | Hawks hook | "Two **fiddler** crabs, one empty shell." | "Two hermit crabs…" | Fiddler crabs fight over burrows; hermit crabs fight over shells. Now consistent with ch10's shells. | R7 D1; Elwood & Briffa 2001 |
| ch5.js:10 | Hawks real | "settles where hawks make up V ÷ C of contests" | adds "either as a mix of pure hawks and doves, or with every animal playing hawk with that probability" | Distinguishes a mixed ESS from a polymorphism. | R7 A52, B32; Maynard Smith 1982 |
| ch5.js:11 | Hawks maths | "If V > C, hawk always wins." | "…hawk always pays better and takes over." | Hawk–hawk fights are still lost half the time, so "always wins" was ambiguous. | — |
| ch5.js:13 | Hawks idea L1 | "A fight with another hawk **usually** means a costly injury." | "is a gamble: half the time you win the shell, half the time you are injured." | The code uses 50/50. | code |
| ch5.js:102 | Alarm Call maths (live through `CH_ALARM`) | "calling adds 0.18 … more than 0.18 ÷ 0.4 = 0.45 … A full sibling carries half your genes" | Cost-general: "pays when the neighbours' relatedness, added up, is more than your cost ÷ 0.4. The same neighbours can justify a cheap call but not a costly one…"; "shares half your genes by descent, on average" | The live chapter charges 0.22 (hawk) and 0.08 (coyote), so the 0.18 and 0.45 figures contradicted it. Siblings share r = ½ by descent; "carries half your genes" is a misconception. | code (ch7.js); Hamilton 1964 |
| ch15.js:7 | Blood Debts hook | "miss two nights" | "miss two or three nights" | Starvation comes after about 48–70 h. | Wilkinson 1984 |
| ch15.js:11 | Blood Debts real | Wilkinson 1984 without kin; partner-removal result credited to Carter & Wilkinson 2013; "resist exploitation in repeated interactions" | adds "mostly relatives and close associates"; credits 2013 (past help beats relatedness) and 2015 (more non-kin partners mean more donors when a usual donor is removed); "Real bats seem to build lasting bonds rather than keep strict tallies"; "when the same partners are likely to meet again" | Corrects the citation and adds kinship and the shadow of the future. | R7 D8, A56–58; Carter & Wilkinson 2013, 2015; Carter et al. 2017 |
| ch15.js:12 | Blood Debts maths | "a hunt fails 35% of the time"; "In level 2, a bat that intends to help fails 20% of the time when its own reserves are low" | adds "about the rate for young bats (adults fail far less often; Wilkinson 1984)"; "a reciprocator that means to help you refuses half the time when its own reserves are below 40 hours" | Adults fail about 7% of nights. **The text contradicted the code**: `noise() * 2.5` = 0.5 when h < 40, and only for reciprocators. | R7 D9; code |

**Total:** 41 table rows covering 49 separate edits in 6 files. Two are mechanics changes:
- Black Country: carbonaria mutation and the migrant rescue.
- Scribe: stop-loss classification.

Everything else is text.

## Considered but NOT changed

- **Fixed only in my files.** These issues live in files outside my group:
  - "The Black Country" title for a Lancashire/Manchester setting is in `ui.js` PLAN. Manchester was historically in Lancashire, and the title is harmless. Not mine to change.
  - The ch99 prediction toast "Survivors were X points better camouflaged" (R7 D20) is in ch99.js. S is measured on tone, so it should say "paler".
  - The Alarm Call hawk/coyote cost inversion (R2: Sherman 1985 says hawk whistles are largely self-preserving) is in `ch7.js`.
  - The live ch7 Level 2 note says "breeding won … when the nestlings were only half-siblings". That is false for spring 3 (no territory, half-sibs: help 0.30 beats breed 0.225). The same sentence in `CH_ALARM_V1.endLevel` is dead code, so I left it.
- **Dead code in my files, left alone.** These are overwritten elsewhere:
  - `CH_HAWKS.intro.how` and `.goal` are replaced by ch10.js.
  - `CH_ALARM_V1.intro`, `.real`, `.endLevel`, `.ROUNDS` and `.C` are overridden by `CH_ALARM`.
- **Scribe "works if ≤1 missense"** (R7 A6) is arbitrary but hedged with "probably" in both verdicts. Left until the redesign.
- **Lichen heritability of about 0.95** (`ve` 0.03 against genetic SD 0.13) is high but not wrong for a colour trait. I made the text match the model rather than slowing evolution, which would hurt balance. Varying h² by level belongs to the redesign.
- **Selection intensity** (half of each generation eaten) is disclosed in the maths text rather than changed.
- **Jaws heritability figure** ("about 0.2", Lee, Heim & Meyer 2015, per R7 B31): I could not verify the number myself, so I cited Raffini & Meyer 2019 (verified by R7) without a figure.
- **Switches L2 "Across Canada, Alaska and Iceland".** I could not reach the full text of Chan et al. 2010. The author list (Schluter in BC, Bell in Alaska, Jónsson in Iceland) makes it plausible, so I left it and added "many".
- **Switches "none = head" ground state.** Defensible: loss of Antp turns legs into antennae (Struhl 1981). I left it and labelled the grid simplified.
- **Switches "Delete a Pitx1 exon: the fish dies".** Consistent with Pitx1-null lethality in lab animals (cited in Chan et al. 2010). Left.
- **Weinreich "only about 18" of 120 paths.** The exact figure is 18, so "about" is harmless. Left.
- **Bats 6 h cost against 24 h gain** is illustrative. Wilkinson's own estimate of the asymmetry differs in magnitude but not direction. Left.
- **Reviewer claims I rejected:**
  - R1 says disruptive-selection gains "mostly collapse" under random mating. Rejected per R7 A39, which simulated the game's model: SD keeps growing.
  - R1 says the Black Country lacks the dominance asymmetry and migration, the Landscape lacks sign epistasis and Weinreich 2006, and the Fancier lacks neural crest. All are present (R7 A32, A33, A45, A46).
  - R1's Bitter claim that "memory never fades" describes the human player, not code (R7 A42). I handled it by disclosure.
  - R3 UI1 says the Switches target fly is not drawn. Wrong: it is drawn (R7_R3 UI1).
- **Bitter "Bates … 1862, three years after the Origin".** Correct; the paper was read in 1861 and published in 1862.
- **Soot history facts** checked and correct: 1848, about 98% by 1895, van't Hof 2016, Cook et al. 2012 (six years).
- **Hori 1993 period of about five years and Karn & Penrose 1951.** Correct.

## Needs a gameplay redesign to fix properly

1. **Switches target 4.** Real "legs on the abdomen" needs an A1 column, so the target can be the bithoraxoid transformation (A1 to T3), and Ubx must not mean "T3" everywhere. Until then the text admits the grid's answer is wrong for real flies. Colinearity could become a mechanic (expression boundaries ordered along the chromosome).
2. **Black Country.** The black-migrant rescue is a convenience for a population of 30. A larger or metapopulation model would let carbonaria persist and spread by migration naturally, and could show the real lag in the decline.
3. **Lichen Wood.** Add a decaying search image and two bark types, so apostatic selection and polymorphism *emerge* (Bond & Kamil 2002). Make heritability vary by level.
4. **Bitter Wings.** The model-to-mimic ratio is fixed, so negative frequency dependence is never tested. It needs a variable model count or signal decay, so mimicry can collapse, plus a Müllerian level.
5. **Hawks and Doves.** The player's choices do not affect the population, and there is no invasion test. The player should design an invading strategy.
6. **Landscape.** The player chooses among uphill steps with foresight. A real adaptive walk should be stochastic, with P ∝ s. Peak crossing by drift, double mutants or tunnelling is absent, and L2 is a quiz.
7. **Scribe.** Deletions are caused by a timer, success means making no mutations, and "works ≤1 missense" is arbitrary. A speed–proofreading trade-off and a DFE-driven cell lineage would teach the real points.
8. **Sieve.** The player draws fitness directly. The continuum-of-alleles model can inflate variance without limit (R7 D12; a caveat belongs on the ch99 MODEL panel).
9. **Left Jaw, Right Jaw.** Laterality is modelled as discrete and fully heritable. A continuous, partly plastic trait would be more honest.
10. **Blood Debts.** Fixed strategies, no kin in the roost, no partner choice, no bonds. Carter's work suggests real bats build bonds.

## Test results

**Build:** `python3 build.py …/scratchpad/sweep/ef_G2.html` succeeded (807,800 bytes).

**Monkey tests.** Seeds 1, 2 and 3 for all eleven touched chapters; seeds 4 and 5 for soot, lichen, bitter, switch and landscape.

| chapter | original build (seeds 1, 2) | my build | notes |
|---|---|---|---|
| lichen, soot, bitter | end, end | end on all seeds | — |
| scribe, sieve, jaws | end, end | end on all seeds | — |
| switch | end, end | end on all seeds | — |
| hawks, bats, alarm | end, end | end on all seeds | — |
| landscape | **stuck**, **stuck** (also stuck on seed 3) | stuck on 1–4, end on 5 | Pre-existing: the monkey fails to finish Level 1. Not caused by these edits. |

No JS errors, no NaN, undefined or Infinity text, and no bad canvas in any run.

**Targeted browser checks** (`scratchpad/sweep/paths.py`, `notes.py`, `introtext.py`), all with no page errors:
- Lichen end card in all h² branches.
- A full sync-mode Black Country run (finished with 3 stars, 2–3 migrant rescues), plus its interlude summaries and Notes.
- Lichen and Bitter sync runs, with Notes.
- Scribe classification: stop lost by substitution, stop lost by deletion, and a silent change.
- Landscape L2 end card.
- Switches task 4 message, L2 question and end card.
- The Notes idea, numbers and graphs tabs for all eleven chapters.
- The Black Country intro now shows the real instructions followed by ch99's "History is compressed" sentence.

**Balance** (node simulations with the game's Gen engine):
- Black Country, 1,000 runs: 3-star rate 87% (was 83%); median finish generation 16 (was 17).
- Lichen: unchanged mechanics; true h² measured at 0.95 in every generation.

## Review round

A reviewer raised 11 issues about the sweep above. I checked each one against the code and, where it made a numerical claim, against my own simulation (`scratchpad/sweep/g2r/soot_var*.js`) or the reviewer's scripts (`rev_soot_h2.js`, `rev_soot_resc.js`), which I re-ran. **All 11 were right, and all are applied.** In two cases I changed the suggested fix (marked *modified*).

| # | file:line (after) | issue | verdict | what I did |
|---|---|---|---|---|
| 1 | hunt.js:209, 214–215 | Black Country Notes: "Realised heritability (sum of R ÷ sum of S)" adds up S and R across both phases. S changes sign after the Clean Air Act, so the sums cancel. The R text explained only the black-favoured phase. | **Right.** Re-run over 1,000 runs: 23% of end-of-run values were < 0 or > 1.5 (5th–95th percentile −1.37 to 3.00). | *Modified.* For soot, S and R are summed only within the current phase. The second phase starts at `cleanGen + 1`, not at `cleanGen`. At `cleanGen` the soot is still 0.6 and black is still favoured; I checked conspicuousness against the bark targets. For soot the row shows only when \|S\| > 0.25. In 1,000 runs, bad end-of-run values fell to 1.0% (5th–95th percentile 0.41 to 1.14). Bad values at any moment fell from 12% to 5.5%. Resetting at `cleanGen` with \|S\| > 0.15 gave 1.9% and 11%. In the second phase the label reads "…since the soot thinned", and the row explains why. The R row now uses the reviewer's text ("Dominance hides copies… R is usually smaller in size than S"), plus "With thirty moths, any one morning is noisy". I checked the second clause algebraically: removing some of the black moths leaves \|R\| < \|S\| under random mating. |
| 2 | ch25.js:87 | The Switches task-4 correction sat in a message shown for only 1.6 s before the Level-passed card covered it. | **Right.** | The task-4 message is now short: "Real flies differ: see the next card." The Level-passed card adds: "One correction. In real flies, losing abd-A gives legless segments like the first abdominal one, because Ubx there also stops legs from forming. Real legs on the abdomen come from bithoraxoid mutations, which turn the first abdominal segment into a copy of T3 (Lewis 1978)." Checked in the browser after the 1.6 s timeout. |
| 3 | ch2.js:155–157 | Sieve end card text: "of 3 missions"; card title: "of 5". | **Right.** The bug predates the sweep, which missed it. ch10 adds two missions. ch99 adds 'split' but filters it out of `got` before `end`. | Both strings now use `tot = MISSIONS.filter(m => m.k !== 'split').length`, which is 5. |
| 4 | hunt.js:327–330 | Lichen end card: realised h² of 1.01–1.05 printed "101–105% … The small remainder was developmental luck". | **Right.** | The branch now uses `pc = Math.round(h2*100)`. At 100 or more it shows the chance text ("Reaching 100% or more is partly chance…"). From 75 it shows "almost entirely genetic", and below that the low-value text. Checked at h² = 0.98, 0.996, 1.0, 1.004, 1.03, 0.76, 0.5 and −0.3. |
| 5 | hunt.js:214, 328, 330 | "Chance in who bred with whom" names the wrong noise source. | **Right.** The trait is additive (core.js Gen: "diploid, additive"), so the pairing pattern does not change the expected offspring mean. The noise comes from unequal numbers of offspring (parents drawn with replacement) and from Mendelian segregation. | Replaced in the Notes R row and in both Lichen end-card branches: "which survivors leave the most young, and which gene copies each passes on". |
| 6 | hunt.js:372 | The rescue toast blamed chance ("as rare genes easily do"). | **Right.** `rev_soot_resc.js` re-run: rescue at generation 2 in 998 of 1,000 runs. The black moths are eaten on clean bark in generation 1, which is selection. | *Modified.* The toast now depends on the cause. If black moths were eaten in the generation that lost carbonaria, and the soot was not yet full, it says: "Before the soot took hold, the black moths stood out and were eaten, and carbonaria has been lost from this wood." Otherwise it says: "…by chance, none of the young inherited it." I did not use the reviewer's single sentence because a human player who spares the black moths can still lose carbonaria by drift. Both branches checked in the browser. |
| 7 | ch2.js:42, 67, 71 | Scribe legends left out lost stops, and a substitution that lost the stop codon was drawn amber. | **Right.** | End-card legend: "early or lost stop, skip, or lost start". In-play legend: "early or lost stop, lost start, frameshift" (measured at 219 px, which fits a 320 px screen). The lost stop codon and a lost start codon (codon 1) are now drawn red. Draw checked with a stop-loss gene, with no errors. |
| 8 | ch2.js:196 | The Jaws idea text, "can only strike one side", contradicted the corrected hook. | **Right.** | "In this game each scale-eater strikes only one side (real ones mostly do)." |
| 9 | boot.js:5 | The Lichen maths sentence "You eat half of every generation" confused mortality with selection, and the cap of 15 of 30 means *up to* half. | **Right.** | "You can eat up to half of every generation, always the most visible, which is far stronger selection than is typical in the wild (most measured selection differentials are a fraction of a standard deviation; Kingsolver et al. 2001)." |
| 10 | hunt.js:296 | The Lichen text said the game "tracks only the average moth, not the spread of looks", but the histograms do show the spread. | **Right.** | "…this game scores only average camouflage, and there is little to keep several looks going at once." I hedged the reviewer's "nothing in it" because the human player may form a search image. |
| 11 | ch25.js:75 | "Real Hox domains overlap" was presented as a difference from the grid, but the grid overlaps too (Antp T2–T3, Ubx T3 and the abdomen). | **Right** (checked against `WT()`). | "The grid is simplified: it lumps the abdomen into one segment, and real Hox boundaries are graded and follow parasegments rather than whole segments. Ubx also acts in the first abdominal segment…" |

**Rejected:** none.

**Still open (redesign):** the Lichen card can print a negative percentage ("about −30% … was passed on") when h² < 0. This is rare, it predates the sweep, the value is clamped to [−1, 2], and the text that follows says the value is noise. It is best fixed when Lichen gets per-level heritability (redesign item 3).

### Review-round tests

- **Build:** `python3 build.py …/scratchpad/sweep/ef_G2.html` succeeded (824,490 bytes). Syntax check clean.
- **Monkey tests**, seeds 1 and 2 for lichen, soot, bitter, scribe, sieve, jaws, switch, landscape, hawks, alarm and bats: all 22 runs reached `end`. No JS errors or bad text. Landscape now also ends; it was `stuck` in the original build.
- **Targeted browser checks** (`scratchpad/sweep/g2r/check.py`), with no page errors:
  - The Lichen end card at eight h² values.
  - A sync-mode Black Country run with the Notes read every generation. The h² row is hidden at first, then shows 0.46–0.58 while black is favoured, is hidden again in generations 15–16, and shows "since the soot thinned" at 0.36–0.78. No NaN.
  - Both branches of the rescue toast.
  - Scribe stop-loss verdict and canvas draw.
  - Sieve end card: "2 of 5 missions … You completed 2 of 5".
  - The Jaws idea text.
  - The Switches task-4 message, the Level-passed card after the timeout, and the maths text.
