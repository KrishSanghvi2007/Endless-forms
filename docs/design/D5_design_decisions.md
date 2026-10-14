# D5. Design decisions: the hand-over from design to implementation

*Coordinator B (design integrator), round 3. Records what D1–D4 settled after the round-2 cross-review, plus a final consistency pass over D0–D4, sweep logs G1–G7 and the code. Wave 2 agents build from it. It overrides D1–D4 where they differ; where it is silent the owning document rules, and D0 rules on science. "Wave 2" means everything built as plain-JS `v2/` plug-ins: Phase 0 plug-ins, the Phase 1 slice and Wave A.*

---

## 1. Binding decisions

| # | Decision | Why | Detail |
|---|---|---|---|
| 1 | One product, *Endless Forms*, on one world, the Tangled Bank field station. Equilibrium becomes Act 3; Tangled Bank becomes the world and sandbox. | RC7 | D2 §0–2 |
| 2 | Twelve acts plus a capstone sandbox, as a hub; a 22-unit spine (~6 h). Acts 1–2 open after Act 0; unit exceptions per D2 §3 (Clinic after Act 4; Tap, Swamping, Malaria after the Black Country). | R8 §5 order | D2 §3 |
| 3 | Level-2 quizzes cut; Equilibrium L10–L11 replaced by the Leaky Tap and Gene Swamping; Food Web, Islands and After the Fire to the appendix. A unit with no per-second verb, or failing the five-student boring flag twice, becomes scenario cards. | RC3, RC5 | D2 §4 |
| 4 | Fix before adding: slice, favourites and spine, then P0 games; P1/P2 frozen until tiers 1–3 are approved. | Boredom first | D2 §16.1 |
| 5 | Heterozygote advantage only in Malaria Coast; Census boss = Wahlund deficit; Invisible Carriers boss = inbreeding; F named once, in the Pedigree. D2's notation table binds everything. | R8 sequencing bug; one notation | D2 §5, §15 |
| 6 | Template G1–G12 binds every unit; D1 reviews each spec. Four roles: selective environment, behaving animal whose rule competes as an allele, investigator with a budget, experimenter releasing a variant. Never the organism dialling its own heritable trait. | RC1, RC2 | D1 §2 |
| 7 | The player pursues the agent's goal and is scored in that currency. No "% of best"; the knowable optimum appears only in the debrief beside your call and the outcome. | RC1 | D1 §0; D2 §11 |
| 8 | Stars: Discover, Predict, Transfer, scored against the expectation for the parameters in force. No star for a click or for a side on contested science; none lost to accessibility or Realistic mode. | Stars mean understanding | D1 G10 |
| 9 | Predictions are gestures on the live graph, scored by distance; never a two-option choice. | RC3 | D1 G5 |
| 10 | One live graph per chapter that never pauses; the Notes sheet UI is retired for v2 and `notes()` feeds the graph. Reveal: world, sprites into graph, number, name, equation behind "Why?". | RC4 | D1 G6; D4 §4.2 |
| 11 | Felt cost grows as the population adapts; in null-model and investigator units (Mixer, Census, Pedigree, Invisible Carriers, Tree Thinking, Coalescent, Dig, Mendel) it grows with the level. The per-second verb is required everywhere. | Nothing adapts in a null model | D2 §18.1 |
| 12 | What if? thaws a frozen generation and changes one thing; failure is an "Interesting result" of ≤25 words. Field mode (default, ×N tagged) and Realistic mode (Hunt units scaled to cited s, with a chip). | Explain by intervention; scale | D1 G9; D2 §11 |
| 13 | One look, "Field Plate": 16 places, the Lab, the Expeditions map. Fixed data inks (blue A, amber a, four forces); organisms in natural paint; no red/green; hue never in a star; three or more types carry pattern plus letter. | R5b; colour vision | D4 §1–2 |
| 14 | Read entities ≥0.07u, heroes ≥0.12u (u = min(w, 1.2h)), hit areas ≥44 px, canvas text ≥12 px and ≤3 words through `Lbl.put` only. | RC4 | D4 §3–4 |
| 15 | D4's text budget: ≤40 words before the first action, HUD ≤15, whisper ≤8, panel 35–60, Interesting result ≤25, TAKE ≤20, end-card body ≤60, ≤70 words per phone screen. | RC3 | D4 §3 |
| 16 | Three juice tiers; D4 §5.3 timings are acceptance criteria; every sound has a visual twin; Calm mode; shake only for costs the player pays. | "Clunky, not visual" | D4 §5 |
| 17 | No human shown dying; pictogram tallies. Malaria Coast, Out of Africa, Human Variation and the Manhattan Hunt need sensitive-content sign-off before build and release. | Ethics | D4 rule 10; D2 §16.5 |
| 18 | Begin goes straight into the live Wood: ghost hand within 3 s, a first action that cannot fail, no card. Each later unit adds at most one verb. | Onboarding by demonstration | D2 §9; D4 §7 |
| 19 | WCAG 2.2 AA per unit (§3, item 11). | No keyboard paths today | D4 §8 |
| 20 | Anchor organisms per act; the beetle in every Hardy–Weinberg unit. | RC7 | D2 §2 |
| 21 | Wave 2 is plain JS and Canvas2D, one `v2/` file per chapter, no 3D, no CDN. TypeScript/Pixi is decided by R6's Stage 1 spike porting the v2 Wood. No Godot or Unity. | Offline single file | D0 §6 |
| 22 | `Gen` is the only diploid engine (opt-in extensions, no extra `R()` when absent); `WF` the only haploid helper; `Hunt` wrapped, never forked. | Golden trajectories | D3 §9.1 |
| 23 | Code shape: `sim` (`step`, `act`, `snapshot`, `restore`) with plain-JSON state; seeded `R()` only; a run is (seed, actions); one content object; `P` as `{v, tag, min, max}`. | Replays, port | D1 G12.7 |
| 24 | **New.** Any v2 value between an `R()` draw and a scored or encoded outcome uses `Det` math (§5.2), never `Math.exp/log/pow/sin/cos`. | `Gen` draws noise through `gauss()` (Math.log, Math.cos) and `Hunt.match` uses Math.exp, so D2's determinism rule fails even in the Wood | §5.2 |
| 25 | **New.** A resident snapshot is sufficient statistics plus a regeneration seed, ≤96 bytes. | D2's 512 bytes × 16 places is 8 KB, twice SCORM 1.2's 4,096 characters | §5.2 |
| 26 | v1 stays at `?v1=1`; golden trajectories of the ten favourite ids are recorded before any replacement lands. | Safety net | D1 G12.9 |
| 27 | Every claim carries a `refs` id and passes Coordinator A before its unit's text freezes; a MODEL card per level tags every parameter realistic, designed or ×N. | RC6 | D0 §7; D1 G8 |

---

## 2. Resolved disagreements

| Issue | Positions | Ruling |
|---|---|---|
| Wood L3 mechanism | Integrator: migrant floor or one hunted trunk. D1 measured both failing and proposed ghost jays replaying the player's fitted rule (98% of seeds pass). | Ghost jays; the player stays the cause. MODEL card: "designed: your rule stands in for every jay". |
| Clinic dosing | D2 §4 row 33: live from L2. D1: live from L1. | L1. A planned L1 against a previewed curve is the worksheet being removed. |
| Forager beakful level | D1 cut it (tits carry single prey; duplicated the tangent). | Cut, pending Coordinator A; fallback is round 1's L1 labelled as a starling result. |
| Felt cost in null models | D2 §18.1 and D3 §13: the literal clause demotes half of Act 3. | Decision 11. The Mixer's crank must pass the Lab boring check or become D2's net sweep. |
| Meadow subtitle | D2: "coevolution" only if pollinators evolve. | "Pollinators and plant mating" until the spec has an evolving pollinator lineage. |
| Tier-4 depth | D3 wrote tier 4 at half length. | Accepted; deepened and D1-reviewed before each wave gate. |
| Extinction shields | D3: shields act on background extinction only and leave the scatter. | Accepted, to avoid confounding the impact lesson. |
| 2,000 sprites | R6: 2,000 sprites at 60 fps. D4 measured Canvas2D at 15 ms (1×) and 83 ms (4× throttle). | Wave 2 gate: a 2,000-dot cached layer plus ≤150 moving sprites at 60 fps under 4× throttle. 2,000 live sprites is the Pixi target. |
| FCR-4, FCR-8 | D2: shell edits. D4: whisper and live region can be plug-ins. | FCR-4 and FCR-8a ship in Batch 0 as plug-ins; FCR-8b with FCR-1. |
| Wood L1 h² | D2 §9: 0.9. D1: 0.8 (oracles run at 0.8). | 0.8. |
| Wood L3 prediction | D2 §9: name the commonest morph. D1: tap the morph triangle. | Triangle tap (decision 9). |
| Raffle echo | D1: Forager L2. D2 §3: Forager L3. | Forager L2, the orchard tangent. |
| Entry wrap file | D1: `00_fx.js`. D2, D4: `00_entry.js`. | `00_entry.js`. |
| Map caption | D1: `intro.goal`. D2: BRIDGE. | `intro.goal` (≤15 words) is the unit-row subtitle; BRIDGE (≤25) shows only on the suggested next unit. |
| Favourite sizes | D2: Forager and Alarm L. D1: M. | D1's M (spec owner); Wave A falls 1.6 M-eq. |
| Hunt extensions | D3 needs `migrants` and a tap-blocking lens; Soot L4 needs `migrants`; D1 §2.2 lacks both. | Added to `02_hunt_ext.js`, D1 owning behaviour. |
| D3's widgets | `Chips`, `DemeMap`, `TreeView` not in D1 §2.1. | Added to `01_widgets.js`; `Chips` is Batch 0 because the Casino needs it. |
| Untimed gaps | None specified for the Clinic's day clock, the Raffle hold or Hawks L6. | Clinic days advance on Space or "Next day"; holds get tap-to-start, tap-to-stop. |
| Single-file size | R6: shell ≤300 KB gzip. Today 251 KB plus 136 KB of fonts. | 300 KB applies to the Phase 3 PWA shell. The offline file may reach 700 KB gzip by the end of Wave A, 1.2 MB in full. |

---

## 3. The gold-standard chapter, as an acceptance checklist

A chapter ships when every line passes. "Lab" means the `?lab=<id>` scene lab; "CI" means an automated test.

1. **Core verb.** Contract field `role` is one of the four roles. One per-second verb with visible feedback within 200 ms (CI: `Events` time from `act` to the first `Fx` call). No control sets an organism's own heritable trait.
2. **First 10 seconds.** No card before the first action; ≤40 words visible; ghost hand within 3 s; the first action cannot fail (CI: a random tapper completes round 1). Playtest median first action <10 s.
3. **Predict inside play.** At least one `Predict.ask` per level on the live graph, scored by distance against the expectation; tolerance band shown after commit. No two-option gesture.
4. **Escalation.** 3–6 levels; each `levels[i].adds` names exactly one new variable. Bot sweep (always-A, always-B, random, greedy-now, fixed threshold): no bot earns three stars in any level (CI).
5. **Boss or twist.** The last level inverts the unit's lesson; `content.boss.inverts` states how in ≤15 words.
6. **Live graph.** `notes()` returns LiveGraph specs; the strip never sets `App.paused`; realised solid, expected dashed, "you" diamond; reveal ladder in order; no number appears before the first visible population change (Lab check).
7. **Juice.** T1 120–200 ms, T2 400–800 ms, T3 0.8–1.5 s at most once per 3 s; D4 §5.3 timings for favourites; every `Snd` call paired with a visual; Calm path; 60 fps under the §2 cached-layer gate.
8. **Text budget.** `tests/lint_text.js` passes (decision 15); no direct `fillText`.
9. **Science honesty panel.** MODEL card per level (simulated, key simplification, tagged parameters, cannot show, "In nature"); ×N chips and "≈" on screen; Contested pill, no star; `refs` ids; oracles pass; Coordinator A has signed the claims.
10. **Teacher hook.** Projector mode, seed link and result code work; class-pool chart declared; three prompts rising in Bloom level, one a model critique; CSV export; a one-page instructor note.
11. **Accessibility.** Every action on the keyboard map; tap alternative to every drag and hold; untimed mode for any timed verb; live-region line ≤1 per 3 s; data-table twin; CVD, hue, gamut and label lints; `mono` and `deut` screenshots; axe-core zero serious violations.
12. **Learning layer.** TAKE, MODEL, RECALL and BRIDGE overwritten; `TRANSFER[id]` deleted and rebuilt as the opening gesture where one existed; each `ch99.js` patch on the old object re-implemented or dropped on purpose; star migration; `Save.d.done[id]` set.
13. **Monkey pass.** Three seeds at 390×780, 1024×768 and 1280×720 reach the end card with no error, no NaN/undefined text and no stuck state; all 48 legacy golden trajectories unchanged within each browser.
14. **Playtest.** Five students, no boring flag (most idle or ask how long is left); wave gate ≥3.5/5 enjoyment.

---

## 4. Wave 2 build list

Batches run in order; units within a batch run in parallel, one agent per file. "Accept" adds to section 3.

**Batch 0: engine and UX (§5).** Lands before Batch 1; FCR-1, 8b and 10 may follow but precede the Wood pilot gates.

### Batch 1: the Phase 1 slice

**1. The Lichen Wood** — `v2/lichen.js`, `CH_LICHEN_V2`, M. L0–L3 in 15 minutes (3/5/4/6 generations). L0: eight conspicuous moths, clock ×0.6, quota 4; 300 eggs culled at random to 30; pin a moth. L1: one pale bark, h² 0.8 via `ve`; What if? no variation, no inheritance, eat at random. L2: h² ≈ 0.3. L3 boss: 120 moths on four trunks, aabb 80%, dominant A_ and aaB_ 10% each, search image, three ghost jays replaying fitted *b*. *Reuse:* `barkTex`, `mothSprite`, `Hunt.match` (via `Det.exp`), `Gen`; Hunt `bag`, `overproduce`, `searchImage`, `trunks`, `predict`, `untimed`, `detectRule`; `Pin`; disarm ch99's Lichen interlude. *Accept:* D1 §3.1 oracles 1, 2, 4; D1 §5 Wood gates; a ≤96-byte snapshot written after L3.

**2. The Black Country** — `v2/soot.js`, `CH_SOOT_V2`, M. Starts from the saved wood. L4 opens with TRANSFER.soot as a histogram gesture; one tagged carbonaria copy at q = 0.05; gene-pool lens; one pale migrant a generation. L5: clean air and the epistatic lag. L6: `Evidence` on the player's own population. What if? recessive carbonaria absorbs Equilibrium L9. *Reuse:* soot crossfade; ch99's compression note moves to MODEL; `GenePoolLens`, `Evidence`, `migrants`. *Accept:* dawn black share = 1 − (1 − q)²; the L5 decline tracks the dominant-allele recursion within sampling error, and the MODEL card's example trajectory comes from the oracle.

**3. Hawks and Doves** — `v2/hawks.js`, `CH_HAWKS_V2`, M. The duel is the camera; 150 hermit crabs are the stage. P(Hawk | context) over the last eight duels seeds a haloed lineage; a tide every four duels resizes lineages via `WF`. Levels as D1 §3.4. *Reuse:* ch10 `crab()`, `pay()`, `pay4()`, `pw()`; bypass ch10's wrappers. *Accept:* with no player the beach reaches V/C; a rare pure invader into the mixed-ESS beach has negative mean fitness over 200 seeds; choice buttons never both disabled.

**4. The Mixer** — `v2/mixer.js`, `CH_MIXER_V2`, M, new id via `PLAN_ADD`. Lens-tag beetles into jars (Yule's flat 51%); crank the tumbler to fill the p × q square and collapse the 2pq tiles; unequal sexes 0.9/0.3; boss: triangle taps, then the X-linked inversion. *Reuse:* Equilibrium `engine.js` `hwExp`, jar effect, tile collapse; `Gen` ext 3; `XHud`. *Accept:* D3 §3.1 oracles; the crank passes the Lab boring check or becomes the net sweep; hidden hoppers defeat the "tap the HW point" bot.

**5. Drift Casino** — `v2/casino.js`, `CH_CASINO_V2`, L. Chips are a distribution paid by a quadratic score against the croupier's naive odds; the house reprices. L1 neutral rule; L2 size and time; L3 Buri's bottles (Ne ≈ 11.5) and Ne side tables; L4 castaways (TRANSFER.castaways as first gesture); boss: 12 alleles crash to 4 survivors, then a zoo scored on alleles kept. *Reuse:* legacy jars and fan, Equilibrium L12–L13 visuals; `WF`, `Chips`, `Gen` ext 2. *Accept:* D3 §3.2 oracles (fixation = start share ±1%; absorption 1.39N ±5%; 87.5% of H and 6.0 of 12 alleles kept); "copy the croupier" below three stars.

### Batch 2: the other favourites (D1 order)

**6. Bitter Wings** — `v2/bitter.js`, `CH_BITTER_V2`, M. Taste `Ledger` as memory; models fall 8 → 2 → 12 (collapse, recovery); deadly days; Müllerian advergence with a supergene first jump; aggregation boss. *Reuse:* `leafTex`, `flySprite`; Hunt `species`, `modelCount`, `toxicity`, `bag`. *Accept:* a Bayesian bot's mimic advantage falls with fewer models; the rarer pattern moves ≥3× farther in 8 generations with the large-effect allele and stalls without it.

**7. Left Jaw, Right Jaw** — `v2/jaws.js`, `CH_JAWS_V2`, M. 3–5 prey fish, at most two 1.2 s guards; twist as a `Gen` additive locus (h² 0.9 ×N, then 0.25); two scale-eater species; lizard boss with a 3-per-morph floor and `Det.exp` fitness. *Reuse:* `CH_JAWS.draw` fish and guard. *Accept:* selection opposes p − ½ against a commoner-side bot; period 5 ± 1 seasons with the floor, a morph lost without it.

**8. The Forager** — `v2/forager.js`, `CH_FORAGER_V2`, M. One great tit's day: sequential hedgerow prey, an orchard tangent from the player's own data, hawk risk, invasion of the leaving rule, a dynamic-programming night boss. *Reuse:* ch3/ch9 `delay()`, `optRate()`, the diet rule, V(e, t); drop the `Math.min` cap. *Accept:* best stay 3.4 s at T = 2 and 6.5 s at T = 10 (τ = 4); a look-ahead bot cannot beat the scored rule.

**9. The Raffle** — `v2/raffle.js`, `CH_RAFFLE_V2`, M. The Drum; hold to pour against one budget across six visible females; later-male risk; *Scathophaga* precedence and tangent; cryptic-choice boss; invasion of the allocation rule. *Reuse:* `optimum()`, `opt()`. *Accept:* greedy within 1% of the Lagrange optimum; L2 benchmark is an expectation over the hidden queue.

**10. Alarm Call** — `v2/alarm.js`, `CH_ALARM_V2`, M. Untimed tagging on `PedigreeView` with fathers' face blazes; 2 s attacks read the player's tags; trill-only L1 (C = 0.22, B = 0.4); hidden negative whistle cost in L3; sex-limited calling invasion; Seychelles warbler boss. *Reuse:* `squirrel()`, corrected `genRound` costs. *Accept:* trill boundary exactly ΣrB = C; whistle bot calls at r = 0; Sherman 1985 figures signed off.

**11. The Clinic** — `v2/clinic.js`, `CH_CLINIC_V2`, L. Live dosing from L1 against MIC and MPC with the window hatched; designed immune clearance below 10⁵; adherence; standing resistance; 6-bed KPC bay; 12-bed compensated-cost boss; exports `ClinicPK`. *Reuse:* TB `step()`. *Accept:* untreated ×8 a day; double mutants ≈ product of single rates; untreated loads <10⁵ clear within 5 days; a fixed-schedule bot cannot three-star L3.

**12. Switches** — `v2/switch.js`, `CH_SWITCH_V2`, M. A1 column, two-level Ubx, abd-A trap, colinearity fan, crustacean boundaries, Pitx1 circuit, stickleback boss. *Reuse:* `SEG`, `HOX`, `ident()`, Pitx1 options; `fly()` rebuilt from segment templates. *Accept:* identity table correct for every grid state; larva drawn before adult.

### Batch 3: the first P0 new games

**13. The Scribe** — `v2/scribe.js`, `CH_SCRIBE_V2`, M. Tag sparks to build a DFE; Luria–Delbrück jackpots and μ̂ from p₀; replica plating; new-sugar boss. *Reuse:* Petri scene, `WF`. *Accept:* plate variance/mean ≈1 if induced, ≫1 if pre-existing (10⁴ seeds); p₀ estimator unbiased within 10%; both DFE ghosts disclosed.

**14. The Leaky Tap** — `v2/tap.js`, `CH_TAP_V2`, S, Hunt mode. The dusk gull: dominant balance μ/(hs); recessive √(μ/s) with a dive-blocking lens; relaxed selection; boss: load returns to μ or 2μ whatever s. *Reuse:* `Gen` `mu`/`back` (already opt-in); Hunt `lens`, `bag`, `predict`, `untimed`. *Accept:* q̂ within 10%, load within 15%; three named bots below three stars.

**15. The Royal Line** — `v2/royal.js`, `CH_ROYAL_V2`, M. Morgan's reciprocal crosses; the p_f/p_m zigzag; the lamp (incidence 3μ/s); Victoria's pedigree, Brier-scored. *Reuse:* `Gen` ext 3, `PedigreeView`, `XHud`. *Accept:* gap ratio −½; p̄ invariant; incidence ±10%; exact posteriors.

**16. Gene Swamping** — `v2/swamp.js`, `CH_SWAMP_V2`, M. Hunt on lava with ferry migrants (m = 0.02, 0.1, 0.3); a cline and caliper; five isles and F_ST; two-ferry boss. *Reuse:* Hunt `barks`, `migrants`; `DemeMap`; `WF`. *Accept:* swamping at m ≈ s ±20%; width ∝ σ/√s within 15%; F_ST ≈ 1/(1 + 4Nm).

**17. The Dig** — `v2/dig.js`, `CH_DIG_V2`, M. Pour mud and erode (gappy record, Lagerstätte); count zircon decays; choose dig sites; log-time boss with the player's Act 0 generation tick. *Reuse:* Strata scene. *Accept:* preserved shares match burial probabilities over 1,000 runs; Poisson decays; unbiased ages.

**Next:** Extinction Roulette (needs `TreeView`); Malaria Coast and Out of Africa after panel sign-off. Wave A's tier-2 spine rebuilds and P0 hosts (D2 §16.5) start as D1 approves each spec.

**Rigs D4 adds before the unit starts:** stickleback, side-blotched lizard and its ground, Seychelles warbler, dung fly, feral fowl, four crustaceans, the fossil set.

---

## 5. Shared engine and UX work

### 5.1 File manifest and load rule

`build.py` joins everything in one strict IIFE, `v2/*.js` sorted after `ch99.js`. **Rule:** top-level code in a v2 file may touch only legacy objects and v2 files with a *lower* number; same-number files reference each other only inside functions.

`00_tokens.js` (Pal) · `00_wf.js` (WF) · `00_fx.js` (Fx, Layer, Ghost, Lbl, Live, Snd2) · `00_entry.js` (Entry, wraps, end card, PLAN rewrite) · `00_cvd.js` · `01_widgets.js` · `01_rig.js`, `01_scenes.js` (Petri, Strata) · `02_hunt_ext.js` · `03_redqueen.js` · chapter files (letters) · `zz_v1switch.js` (with `?v1=1`, empties `V2` and `PLAN_ADD` and skips the PLAN rewrite).

### 5.2 Additions to `core.js` (shell edits, additive)

```
Det.exp(x) Det.log(x) Det.cos(x) Det.gauss()   // +−×÷ and Math.sqrt only; fixed range reduction and polynomials; bit-exact
Gen.layout(specs)  // sets lay.x for link|alleles|ploidy|fx|track; sets lay.det when any spec has det:true
Gen.mate(...)      // first line: if (lay.x) return this._mateX(...); legacy _gam untouched
                   // when lay.det, gauss() calls become Det.gauss(): same two R() draws, bit-exact values
Save               // key 'ef_v2'; first load imports 'endlessforms_v1'; ?v1=1 keeps the old key
Save.d = {schema:2, stars:{}, s2:{id:mask}, lv:{id:[mask…]}, v1stars:{}, done:{}, res:{place:b64},
          ui:{th, calm, read, snd, hap, lh, verbs}, rev:{item:box}}
Save.star2(id, level, mask)   // OR-accumulates Discover=1, Predict=2, Transfer=4; writes popcount to stars[id]
Save.adapter                  // SCORM suspend_data → IndexedDB → localStorage (try/catch) → memory + save code
Save.res.put(place, {N, gen, freqs:Uint8[], tone:[mean, sd], pins:[≤4 genomes], seed})  // ≤96 bytes
Events.emit(type, data)       // 'open','act','predict','outcome','star','level','whatif'; {t, unit, level, seed}
Events.csv()                  // export for students and teachers
```

Whole save ≤3,500 characters (16 places × 128, masks, review boxes, ui), under SCORM's 4,096. Within a session, units hand over full state in memory; the snapshot is only for saves.

### 5.3 Additions to `ui.js` (shell edits)

```
frame()          // requestAnimationFrame; vclock.js shims requestAnimationFrame through its setTimeout queue
Stage.u, Stage.zones {hud, thumb, graph}, Stage.hit(x, y)       // FCR-1 layout classes, strip, dock
App.playLevel(ch, n, {seed, thaw})  // calls ch.startLevel(n, o); used by level select, replay, ?level=
Notes.open()     // no-op for ch.v2; the strip polls notes() at 2 Hz and never sets App.paused
Teacher          // strip: play, step, speed 1×/4×/16×, seed, reveal, pen, freeze-and-ask (F); projector class
URL              // unit, level, seed, teacher, projector, locks, cvd, lab; dev-only theme, calm
```

### 5.4 Plug-ins

**Palette tokens (`00_tokens.js`, FCR-6).** Injects D4 §2.3's CSS. `Pal.A`, `Pal.a`, the force inks, `Pal.ink` and `Pal.paper` follow the theme; `Pal.line(role)` gives Paper's darker line ink; `Pal.place(id)` the ground. Wraps `applyTheme` so legacy themes map to the nearest place; v2 chapters declare `place`.

**Juice library (`00_fx.js`, FCR-7, FCR-9, FCR-8a).**
```
Fx.tween(obj, props, ms, ease, done)   Fx.burst(kind, x, y, n)  // dust|scale|spark|droplet|egg
Fx.pop(text, x, y, sign)  Fx.ring(x, y, r)  Fx.shake(px, ms)  Fx.hitstop(ms)
Fx.tier(1|2|3, fn)  Fx.update(dt)  Fx.draw(c)   // governor halves particles above 20 ms/frame; Calm swaps crossfades
Layer(w, h).redraw(fn).blit(c)                  // cached crowd layer, ≤2,000 dots
Ghost.show({verb, at:()=>[x, y], until:()=>bool})  // 3 s loop, replays every 4 s; Calm: static arrow
Lbl.put(id, text, x, y, opts)                   // ≥12 px, ≤3 words, paper pill; DOM-routed at FCR-8b
Live.say(text)                                  // polite region, ≤1 line per 3 s
toast = whisper                                 // one slot, ≤8 words, 2.4 s, hidden under end cards
```

**Entry, end card and onboarding (`00_entry.js`, FCR-12, D2-8).** Outermost `App.open` wrap: for `ch.v2`, migrate stars, then `App.play`. `End.show` wrap: D4's v2 end card, sets `Save.d.done[id]`, and carries `data-stars` and an aria-label because stars are vector icons. A capture listener on `#btn-begin` sets `Entry.begin`; an `App.go` wrap consumes it and plays `lichen` while the Wood is unfinished (so exiting the Wood still reaches the menu). Rewrites `PLAN` into D2's acts with ids unchanged, and applies the retitles and subtitles. `Freezer.put(id, gen, snap)`, `Freezer.thaw(id, gen, lever)`, `Replay.encode(seed, actions)`.

**Widgets (`01_widgets.js`).** `LiveGraph.draw(cv, spec, theme)` for the eight chart types plus `xhud`; `Predict.ask({kind, axis, tol})`; `GenePoolLens`; `Invasion.run({rules, you, gens, payoff})`; `Ledger`; `PriceBars`; `Pin`; `Evidence`; `PedigreeView`; `Chips`; `DemeMap`; `TreeView`; `SceneLab` (dev only).

**Hunt extensions (`02_hunt_ext.js`).** D1 §2.2 plus `migrants:{m, from}` and `lens:{blocksTaps}`; under `ch.v2`, `Hunt.match` uses `Det.exp` and `setup()` forces `quick = false`.

**Chapter contract.**
```
{id, v2:true, role, place, mode?, intro:{goal}, content, P, levels:[{name, adds, codes, minutes}],
 startLevel(n, o), sim:{step, act, snapshot, restore}, start, update, draw, notes()→{stats, charts:[spec]},
 keys, untimed, stars:{discover, predict, transfer}}
content = {hud, firstWords, panels[], interesting{}, whispers{}, labels{}, take, body, law:{title}, boss:{inverts}, model[], why:{real, maths}}
```

### 5.5 Text-budget enforcement and tests

- `tests/lint_text.js` (Node, runs on `game.js` in a `vm` sandbox) checks every v2 content object against decision 15 and fails CI; `Lbl.put` and the whisper warn in dev builds.
- `tests/monkey.js` reads `data-stars`, clicks `#hud` and dock buttons, and skips Notes for v2. Mendel's pre-existing monkey timeout (G3 review) is fixed or waived before the Phase 0 gate.
- `tests/oracle_<id>.js`, `tests/bots.js` (five-bot sweep), per-browser golden trajectories, screenshots, and D4's lints.
- Cross-browser identity is required only for v2 units that issue result codes; legacy golden trajectories are compared within each browser.

---

## 6. Deferred to later waves

- **Wave B/C:** the 23 tier-4 rebuilds (including Twelve Flasks); Seed Rain's Ellipse levels; the eight P1/P2 core games, from Lottery of the New to the Refuge; the full station map and capstone sandbox; 35 more scenario cards.
- **After the pilot:** the 12 side quests; the appendix rebuilds (After the Fire only once rescored on flat and monotonic landscapes).
- **Phase 3:** TypeScript/Pixi port, LTI 1.3, SCORM packaging, xAPI, the class-pool server, dashboard, scenario editor, translation, Three.js scenes.
- **Phase 4–5:** the pre/post-test pilot (n ≈ 200) and publication.
- **Not deferred, but outstanding:** no science sweep exists for Tangled Bank; one (G8) must pass before the Commons or Slow Island is built.

---

## 7. Open questions for the designer

1. **Frame and name.** Do you accept one product called *Endless Forms*, set on a Tangled Bank field station, with Equilibrium absorbed as Act 3 and kept only as a downloadable "classic" until Act 3 ships?
2. **The favourites.** Jaws gains several fish and scarce attention, Hawks plays out on a beach of 150 crabs, the Clinic doses live instead of planning, the Forager becomes one day on one map, Alarm Call adds untimed tagging. Do these keep what you loved? Play the Wood pilot before Batch 2.
3. **Ghost jays.** Wood L3 keeps three morphs alive only because designed jays copy your own rule on the trunks you are not hunting. Is that honest enough for a flagship level?
4. **Sensitive-content panel.** Malaria Coast and Out of Africa are blocked until a human population geneticist and a scholar of race and science are named. Can you nominate them?
5. **Playtesters.** Every unit needs a five-student boring check, and the slice needs 10–12 new undergraduates. Can you recruit at Oxford, and is ethics approval needed at this stage?
6. **Cuts.** Food Web, Islands and After the Fire leave the core path and every level-2 quiz goes. Should any survive as play?
7. **Platform.** Stay in plain JavaScript through Wave 2 and decide on TypeScript/Pixi after the Lichen Wood spike? And what licence and hosting do you want for the published app?
