export const meta = {
  name: 'evolution-games-critique',
  description: 'Multi-agent critique, redesign and game bible for the Endless Forms / Equilibrium / Tangled Bank evolution games',
  phases: [
    { title: 'Review', detail: 'critics, visual reviewers, platform + curriculum analysts, science fact-checkers' },
    { title: 'Liaison', detail: 'coordinator A turns the critique into a binding design brief (D0)' },
    { title: 'Design', detail: 'round 1 drafts: favourites, structure, new games, art direction' },
    { title: 'Integrate', detail: 'coordinator B cross-reviews drafts against the critique and each other' },
    { title: 'Revise', detail: 'designers revise using the integrator feedback and each other\'s drafts' },
    { title: 'Decide', detail: 'coordinator B writes the design decision record (D5) for implementation' },
    { title: 'Synthesis', detail: 'coordinator writes CRITIQUE.md; supervisors verify; revise' },
    { title: 'Bible', detail: 'GAME_BIBLE.md, README, CLAUDE.md' },
  ],
}

const ROOT = '/home/user/Endless-forms'
const SCRATCH = '/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad'
const CTX = `
PROJECT CONTEXT. Repo: ${ROOT}. A designer (evolutionary biologist, Oxford) built three browser games teaching undergraduate evolution:
- games/endless-forms/ : "Endless Forms", 48 chapter-minigames in 11 sections (Heredity; Chance; Selection; Games Animals Play; Sex; Families & Societies; Lives & Behaviour; Coevolution & Disease; Genomes & Development; Species; Deep Time & Ecology). Built single file: games/endless-forms/Endless_Forms_v1.html. Source in games/endless-forms/source/ (core.js, hunt.js, ui.js, ch1..ch29.js, ch99.js learning layer, boot.js, shell.html, build.py; tests/ has Playwright scripts, tests/monkey.js auto-plays chapters, vclock.js is a virtual clock exposing window.__advance(ms)). Chapter registry: PLAN/reg() in core.js and ALL list in boot.js; one ch file can hold several chapters.
- games/equilibrium-hw/ : "Equilibrium", a 17-level Hardy–Weinberg course + Case Files (Equilibrium_HW_v2.html; source engine.js, lv_a..lv_d.js).
- games/tangled-bank/ : "Tangled Bank", earliest prototype (Steward mode: player is the environment; hunt mode).
- docs/ORIGINAL_README.md (designer's overview & principles), docs/design-history/ (01 100 ideas, 02 24 more ideas, 03 earlier reviewer feedback, 04 HW design brief), docs/reviews/ (expert reviews so far: R1 sections I–IV, R3 sections VIII–XI + learning layer/UI).
THE DESIGNER'S VERDICT: overall the game is poor — concepts not always correct or fully fleshed out, many games BORING, many not visually interesting, clunky. Favourites: The Lichen Wood / The Black Country, Bitter Wings, Left Jaw Right Jaw, Hawks and Doves, The Raffle, Alarm Call, The Forager, The Clinic, Switches (these too should improve). GOAL: over many sessions, build one combined, genuinely enjoyable, non-clunky game/tool where an undergraduate understands ALL concepts (Endless Forms + Tangled Bank + HW combined) through play and visuals alone, scientifically correct, published as an app professors and teachers use. Open to other tech (Unity, Godot, Blender, JS frameworks...).
RULES: Do not modify game source files. Write only the output file(s) you are told to, plus scratch files under ${SCRATCH}. Playwright (python) is installed; launch with p.chromium.launch(executable_path='/opt/pw-browsers/chromium'). Write in plain, direct English; be concrete and specific (name chapters, mechanics, numbers, references); no filler.`

const reviewFile = r => `${ROOT}/docs/reviews/${r}`

function critic(slice, outName, extra) {
  return agent(`${CTX}

ROLE: You are a senior evolutionary biologist AND an experienced commercial game designer, acting as a harsh but constructive critic.
SLICE: ${slice}
${extra || ''}
For EACH chapter/level in your slice, read the code enough to understand the real player interaction and the model (and screenshot it if useful), then write:
1. What the player actually does (core verb, number of decisions, length).
2. Scientific accuracy: specific wrong or misleading claims (quote the game text and give file:line), oversimplifications that would mislead an undergraduate, key concepts missing. Cite real literature where relevant. Be careful: only claim an error you are confident of.
3. Why it is boring/clunky, or why it works (be honest; favourites included).
4. Visual assessment.
5. A concrete redesign that would make it genuinely fun: core verb, moment-to-moment loop, escalation across levels, a final "boss"/twist, the visual hook, and what the player should understand at the end.
Then: a section "Missing concepts in this area" (undergrad-level concepts absent from the whole game, each with a one-paragraph game pitch), and "Cross-cutting observations".
OUTPUT: write the report as markdown to ${reviewFile(outName)} (start with a title line and a one-line italic note saying it is raw reviewer output; 2500–4500 words). Return a 10-line summary of your most important findings.`, { label: `critic:${outName}`, phase: 'Review', model: 'opus' })
}

function factcheck(r) {
  return agent(`${CTX}

ROLE: Adversarial science fact-checker (PhD evolutionary biologist; population genetics, behavioural ecology, evo-devo, phylogenetics). Read ${reviewFile(r)} (an expert review of part of the game).
Task: extract EVERY scientific claim the review makes — both (a) claims that the GAME is wrong/misleading (verify by reading the cited game code/text: does the game really say/do that?) and (b) the reviewer's own scientific statements, formulas and literature citations (are they correct? e.g. check numbers like fixation probabilities, coalescent times, cline widths, HW df, citation years/authors). Try to REFUTE each one. Classify each as CONFIRMED, PARTLY RIGHT (explain the correction), or WRONG (explain). Also note important game science errors in that slice the reviewer MISSED (check the game code text yourself, especially end-card 'real'/'maths' text).
OUTPUT: write markdown to ${ROOT}/docs/reviews/R7_factcheck_${r.replace('.md','')}.md with a table (claim | verdict | correction/source) and a short list "Corrections future agents must apply" (game text fixes, with file references). Return a 6-line summary.`, { label: `factcheck:${r.slice(0, 2)}`, phase: 'Review', model: 'opus' })
}

phase('Review')
const reviewResults = await parallel([
  () => factcheck('R1_endless_forms_sections_I-IV.md'),
  () => factcheck('R3_endless_forms_sections_VIII-XI_and_UI.md'),
  () => critic('Endless Forms sections V–VII: Fisher\'s Brood, Two Sizes, The Lek, The Raffle (favourite), The Selfish Spindle, The Meadow; Alarm Call (favourite), The Nest, The Commons, Many Become One; Live Fast, The Forager (favourite), The Crowd, Shape-shifters.', 'R2_endless_forms_sections_V-VII.md')
      .then(s => factcheck('R2_endless_forms_sections_V-VII.md').then(f => s + '\n[factcheck] ' + f)),
  () => critic('The Equilibrium Hardy–Weinberg game (games/equilibrium-hw, every level + Case Files; compare with design brief docs/design-history/04) AND the Tangled Bank prototype (games/tangled-bank: Steward + hunt modes).', 'R4_equilibrium_hw_and_tangled_bank.md',
      `Extra for HW: check HW assumptions, chi-square df (genotype test with 2 alleles has 1 df), inbreeding F (heterozygote deficit 2pqF), Wahlund effect, selection against recessives (Δq ≈ -spq²/(1-sq²)), mutation–selection balance, drift and Ne, migration. Note what is missing (multiple alleles, X-linkage, linkage disequilibrium, F-statistics, Ne, heterozygote advantage equilibrium, etc.). Judge overlap/conflict with Endless Forms "The Census" chapter (ch13.js) and how HW should be integrated into the combined game. For Tangled Bank: what is worth salvaging (e.g. Steward mode as a sandbox/capstone) and how.`)
      .then(s => factcheck('R4_equilibrium_hw_and_tangled_bank.md').then(f => s + '\n[factcheck] ' + f)),
  () => agent(`${CTX}

ROLE: Art director and UI/UX game-feel reviewer (mobile + desktop educational games; think Monument Valley, Mini Metro, Alto, Cell to Singularity, Plague Inc., Kurzgesagt, Explorable Explanations / Nicky Case).
TASK: Actually LOOK at the games. Write a Playwright python script (in ${SCRATCH}/visual_a/) that opens games/endless-forms/Endless_Forms_v1.html (inject vclock.js via add_init_script if helpful; study ui.js/core.js/boot.js and tests/*.py, tests/monkey.js to learn how to open a chapter programmatically and advance it) and captures, at phone (390x780) and desktop (1280x800) sizes, the home/notebook screen, and for EVERY chapter in sections I–VI: the intro card, a mid-play frame, and (if reachable) the end card. Save PNGs under ${SCRATCH}/visual_a/. View the images (Read tool shows PNGs). NOTE: an earlier interrupted run may already have saved screenshots in that folder; check first and reuse them, capturing only what is missing.
Then critique: overall visual identity and coherence; typography and text density; colour and contrast/accessibility (colour-blind safety!); layout on phone vs desktop; animation, juice and feedback; readability of charts; whether visuals CARRY the concept or are decoration; onboarding clarity; per-chapter visual notes (best and worst, with specific fixes). Rank chapters by visual quality.
OUTPUT: markdown to ${reviewFile('R5a_visual_review_sections_I-VI.md')} (2000–3500 words; reference screenshot filenames). Return a 10-line summary.`, { label: 'visual:I-VI', phase: 'Review', model: 'sonnet' }),
  () => agent(`${CTX}

ROLE: Art director and UI/UX game-feel reviewer (mobile + desktop educational games; think Monument Valley, Mini Metro, Alto, Plague Inc., Kurzgesagt, Nicky Case's explorables).
TASK: Actually LOOK at the games. Write a Playwright python script (in ${SCRATCH}/visual_b/) that captures, at phone (390x780) and desktop (1280x800): for Endless Forms (games/endless-forms/Endless_Forms_v1.html) EVERY chapter in sections VII–XI (intro card, a mid-play frame, end card if reachable — study ui.js/core.js/boot.js, tests/*.py and tests/monkey.js to learn how to open/advance chapters; vclock.js gives window.__advance); for Equilibrium (games/equilibrium-hw/Equilibrium_HW_v2.html) the menu and a frame from each chapter/level group incl. the de Finetti triangle and allele jars; for Tangled Bank (games/tangled-bank/Tangled_Bank_v1.html) menu, Steward mode and hunt mode. Save PNGs under ${SCRATCH}/visual_b/ and view them. NOTE: an earlier interrupted run may already have saved screenshots in that folder; check first and reuse them, capturing only what is missing.
Then critique: visual identity and coherence across the three games (could they be one product?), typography/text density, colour & accessibility (colour-blind safety), phone vs desktop layout, animation/juice/feedback, chart readability, whether visuals carry the concept, onboarding; per-chapter notes with specific fixes; rank by visual quality; what Equilibrium does visually that Endless Forms should adopt (or vice versa).
OUTPUT: markdown to ${reviewFile('R5b_visual_review_sections_VII-XI_HW_TB.md')} (2000–3500 words; reference screenshot filenames). Return a 10-line summary.`, { label: 'visual:VII-XI+HW+TB', phase: 'Review', model: 'sonnet' }),
  () => agent(`${CTX}

ROLE: Technical director with experience shipping educational games and apps to schools/universities.
TASK: Briefly inspect the current architecture (plain JS + canvas, single-file HTML built by build.py, Playwright tests, localStorage saves; ~800KB Endless Forms). Then write a recommendation on technology for the final product: an app professors/teachers use to teach evolution (classroom projection, student phones/Chromebooks/laptops, offline, institutional IT constraints, accessibility/WCAG, LMS integration via LTI 1.3 / SCORM / xAPI, teacher dashboard & analytics, privacy (FERPA/GDPR, minors), app stores vs web/PWA, localisation, long-term maintainability by AI agents + one designer). Compare concretely: stay vanilla JS/canvas; TypeScript + Vite + PixiJS/Phaser (+ a sim core in TS or Rust/WASM); Svelte/React UI shell + canvas/WebGL scenes; Three.js/Babylon for 3D moments (fitness landscapes, embryos); Godot 4 (web export size/issues); Unity (WebGL build size, mobile, licensing/runtime-fee history, overkill?); Blender (asset pipeline only, not an engine); Rive/Lottie/Spine for animation; Capacitor/Tauri for store packaging. Address: how to keep each mini-game a module with shared simulation, art and UI libraries; deterministic seeded sims for testing; how to migrate incrementally from the current code without a rewrite freeze; agent-friendly repo conventions. Give a clear recommendation, a migration path in stages, and a short "do not do" list.
OUTPUT: markdown to ${reviewFile('R6_technology_and_platform.md')} (1500–2500 words). Return a 6-line summary.`, { label: 'tech:platform', phase: 'Review', model: 'sonnet' }),
  () => agent(`${CTX}

ROLE: University evolution lecturer and learning scientist (curriculum design, assessment, active learning, misconception research e.g. Gregory, Nehm, Bishop & Anderson; the Conceptual Inventory of Natural Selection (Anderson et al. 2002), ACORNS).
TASK: (1) Build a concept map of a full undergraduate evolution curriculum (use the scope of Futuyma & Kirkpatrick 'Evolution', Barton et al. 'Evolution', Bergstrom & Dugatkin, Herron & Freeman, plus standard population/quantitative genetics, behavioural ecology, macroevolution, human evolution, evo-devo, genomics, applied evolution (medicine, conservation, agriculture), and nature of science). (2) Map every Endless Forms chapter, Equilibrium level and Tangled Bank mode onto it (read core.js PLAN/ch*.js headers and the HW levels). Produce a coverage matrix: covered well / covered thinly / covered with problems / MISSING. Identify duplicates/overlaps (e.g. Census vs Equilibrium). (3) List the top documented student misconceptions about evolution and say which games currently confront each, which don't, and how a game could. (4) Teacher-facing product needs: what professors need to adopt it (syllabus alignment, 10–20 min class activities, projector mode, assignable sequences, pre/post assessment, data export, discussion prompts, instructor notes, citations/'In nature' evidence, accessibility, ability to turn levels on/off, custom parameters/sandbox for lectures). (5) A recommended learning progression (what order, prerequisites graph) for the combined game, and a proposed restructure of sections. Also judge the existing learning layer (ch99.js predict/recall).
OUTPUT: markdown to ${reviewFile('R8_curriculum_coverage_and_teacher_needs.md')} (3000–4500 words, tables welcome). Return a 10-line summary.`, { label: 'curriculum', phase: 'Review', model: 'opus' }),
])
log('Review phase done: ' + reviewResults.filter(Boolean).length + '/8 reviewers returned')

phase('Liaison')
const SWEEP_NOTE = `A separate 'science sweep' workflow (Wave 1 of implementation) is concurrently correcting game text and models file by file; its change logs appear in ${ROOT}/docs/changes/science_sweep_G*.md (some may not exist yet). The engine now supports redesign plug-ins: games/endless-forms/source/v2/*.js files can push a chapter to V2 (replacing an old chapter with the same id) or add new chapters/sections via PLAN_ADD (see ui.js and boot.js) — Wave 2 will build the redesigned chapters this way, in the existing plain JS + canvas codebase.`
const brief = await agent(`${CTX}

ROLE: Coordinator A — the liaison between the CRITIQUE team and the DESIGN team. The designers will build on your brief, so it must carry the critique's knowledge faithfully.
Read every file in ${ROOT}/docs/reviews/ (R7_factcheck_* override reviewers), docs/ORIGINAL_README.md, docs/design-history/03 (earlier reviewer feedback), and whatever exists in docs/changes/. ${SWEEP_NOTE}
TASK: write ${ROOT}/docs/design/D0_design_brief.md — the binding brief for four designers (D1 favourites redesign, D2 game structure & roadmap, D3 new games catalogue, D4 art direction & UX). Include:
1. The verdict in one paragraph and the 5–7 ROOT CAUSES of 'boring / incorrect / not visual / clunky' with evidence (chapter examples) — every design must show how it removes them.
2. What must be PROTECTED (what makes the favourites work; strongest mechanics/art e.g. the hunt engine; best science) — with specifics.
3. VERIFIED science constraints: a list of corrections and 'never say this' items that designs must respect (only fact-check-confirmed items; mark contested topics as 'present as contested').
4. Curriculum gaps (from R8 and the reviews) ranked P0/P1/P2, and which designer owns each (D3 for new games; D1/D2 when an existing chapter should absorb it).
5. Visual/UX findings designers must solve (from R5a/R5b and R3's UI section), and the text-budget problem.
6. Technical constraints and the platform recommendation from R6, and what that means for designs now (designs must be buildable in the current JS canvas engine via v2 plug-ins for Wave 2, while not blocking a later migration).
7. Cross-team interfaces — decisions that MUST be consistent across D1–D4 (e.g. chapter triage owned by D2; the gold-standard chapter template owned by D1 but used by all; colour/allele conventions owned by D4; which new concepts are new games vs absorbed). Assign an owner for each.
8. Open questions each designer must answer.
9. A per-designer 'read these sections of the reviews' pointer list so designers can go deep efficiently.
Length 2500–4000 words. Return a 10-line summary.`, { label: 'coordinatorA:brief', phase: 'Liaison', model: 'opus' })

phase('Design')
const READ_ALL = `FIRST read ${ROOT}/docs/design/D0_design_brief.md — the binding brief from the critique-team coordinator; follow it, and respect its cross-team ownership rules. ${SWEEP_NOTE} Then read ALL files in ${ROOT}/docs/reviews/ (R1–R8 including the R7_factcheck_* files, which override reviewers where they disagree) and ${ROOT}/docs/ORIGINAL_README.md and skim docs/design-history/. Inspect game code where you need detail.`
const designs = await parallel([
  () => agent(`${CTX}

ROLE: Lead game designer (systems + feel; has shipped hit casual/strategy games) paired with an evolutionary biologist.
${READ_ALL}
TASK: Write full redesign specs for the designer's NINE favourites, keeping what they love about each while making it deeper, more fun and scientifically tighter: The Lichen Wood + The Black Country (as one arc), Bitter Wings, Left Jaw Right Jaw, Hawks and Doves, The Raffle, Alarm Call, The Forager, The Clinic, Switches. For each: why it currently works (protect this); what's wrong (science + feel); the redesigned core loop (second-to-second, minute-to-minute, level-to-level); 3–6 levels with escalation and a final twist/boss; what the player predicts/does/observes; the concept(s) learned and the exact "aha" moment; visuals and juice (what's on screen, animation, sound); the live graph/representation and how it is revealed; difficulty/stars scored on understanding, not speed; teacher hooks (projector mode, discussion question); "In this model / In nature" honesty notes; implementation notes referencing existing code to reuse (file names). Also define the reusable "gold standard chapter template" that these exemplify, so the other ~40 chapters can be rebuilt to the same bar.
OUTPUT: markdown to ${ROOT}/docs/design/D1_favourites_redesign.md (5000–8000 words). Return a 10-line summary.`, { label: 'design:favourites', phase: 'Design', model: 'opus' }),
  () => agent(`${CTX}

ROLE: Creative director / game director responsible for the whole product's structure.
${READ_ALL}
TASK: Design the overall structure of the combined game (Endless Forms + Equilibrium + Tangled Bank) so it feels like ONE delightful game rather than 48 worksheets. Cover: a unifying fantasy/frame and world (e.g. a living archipelago/field station the player tends, with creatures that persist across chapters; or alternatives — compare 2–3 options and pick one); progression and meta-game (unlocks, collections, a field notebook/bestiary, a 'Tangled Bank' sandbox that grows as concepts are learned — salvage Tangled Bank's Steward mode as the capstone); chapter triage: for every existing chapter decide KEEP & POLISH / REBUILD / MERGE / CUT / DEMOTE-TO-SIDEQUEST with a one-line reason (table); integrate Equilibrium into the Heredity/Population Genetics arc (resolve Census overlap); the learning loop embedded in play (predict→act→observe→explain→transfer without text walls; how 'Notes', end cards, and ch99 recall/transfer should change); onboarding and the first 10 minutes; session length (classroom 10–20 min); difficulty and scoring philosophy (understanding, not speed; Bayes/optimum comparisons); teacher mode (projector, assign, dashboards, sandbox parameters, discussion prompts) and student mode; accessibility; narrative voice and tone. End with a phased production roadmap (Phase 0 foundations → vertical slice → content waves → teacher features → pilot with real students → publish), with what each phase must deliver and how to measure success (playtests, pre/post concept inventory).
OUTPUT: markdown to ${ROOT}/docs/design/D2_game_structure_and_roadmap.md (4000–7000 words). Return a 10-line summary.`, { label: 'design:structure', phase: 'Design', model: 'opus' }),
  () => agent(`${CTX}

ROLE: Game designer + evolutionary biologist generating NEW games for concepts the game lacks.
${READ_ALL}
TASK: From the 'missing concepts' in R1–R4 and the coverage matrix in R8 (and the unused ideas in docs/design-history/01 and 02), produce a prioritised catalogue of NEW mini-games (aim ~25–35), grouped by curriculum area (pop gen, quant gen, molecular evolution & genomics, behaviour, sexual selection, social evolution, life history, coevolution & disease, evo-devo, speciation, macroevolution & phylogenetics, biogeography, human evolution, applied evolution, origin of life/major transitions, nature of science/misconceptions). For each: title; concept(s) and the misconception it confronts; the player's role and core verb (prefer 'the player IS the selective force / environment / gene'); one-paragraph loop with escalation and twist; the visual hook; the key graph/representation; real case study and data; model sketch (equations/agent rules); estimated build size (S/M/L); priority (P0 must-have for an undergrad course, P1, P2). Include specific must-haves: mutation–selection balance, heterozygote advantage (sickle cell/malaria), Ne, population structure/Fst & gene flow vs selection (clines), quantitative genetics (breeder's equation/G-matrix/correlated response), linkage disequilibrium, neutral theory & molecular evolution (dN/dS), GWAS/polygenic, phylogenetic comparative methods, mass extinction & diversification, adaptive radiation, human evolution (out of Africa, introgression, lactase), senescence, experimental evolution (Lenski), HGT, origin of life/major transitions, rock-paper-scissors lizards, evolution of cooperation beyond kin/reciprocity, sexual conflict, speciation genomics, macroevolutionary trends/contingency, and 'evolution is not progress/ladder' and 'individuals don't evolve'. Avoid duplicating existing chapters (say when a new game should instead extend an existing chapter).
OUTPUT: markdown to ${ROOT}/docs/design/D3_new_games_catalogue.md (5000–8000 words). Return a 10-line summary.`, { label: 'design:new-games', phase: 'Design', model: 'opus' }),
  () => agent(`${CTX}

ROLE: Art director and motion/UX designer.
${READ_ALL} Especially R5a and R5b (visual reviews) and look at some screenshots they saved under ${SCRATCH}/visual_a and ${SCRATCH}/visual_b (Read tool shows PNGs).
TASK: Write a visual & interaction style guide for the combined game: art direction options (2–3 moodboard-in-words options, e.g. naturalist-field-notebook watercolour, flat Mini-Metro diagrammatic, warm Kurzgesagt-like vector; pick one with reasons that fit teaching, phones and AI-agent-produced procedural art); palette system (colour-blind safe; genotype/allele colour conventions consistent across all games: e.g. allele A/a colours, selection = one colour, drift = another; dark/light; projector contrast); typography and text budget per screen (max words for intro/HUD/end card); creature design rules (procedural, readable traits, genotype→phenotype legibility); charts that live inside the scene (data-as-diegesis), consistent chart grammar; motion and juice principles (tweening, particles, screen shake rules, number pop-ups, sound design palette, haptics) with concrete examples applied to 6 specific chapters; UI layout system for phone/tablet/desktop/projector; onboarding by demonstration (ghost hands, highlighted first action); accessibility (WCAG 2.2 AA, reduced motion, screen-reader descriptions of sims, dyslexia-friendly text); a concrete 'before → after' list of the 15 highest-impact visual fixes in the current build.
OUTPUT: markdown to ${ROOT}/docs/design/D4_art_direction_and_ux.md (3000–5000 words). Return a 10-line summary.`, { label: 'design:art', phase: 'Design', model: 'sonnet' }),
])
log('Design round 1 done: ' + designs.filter(Boolean).length + '/4 designers returned')

phase('Integrate')
const DOCS = [
  { key: 'D1', file: 'D1_favourites_redesign.md', who: 'lead game designer (favourites)', model: 'opus' },
  { key: 'D2', file: 'D2_game_structure_and_roadmap.md', who: 'creative director (structure, triage, roadmap)', model: 'opus' },
  { key: 'D3', file: 'D3_new_games_catalogue.md', who: 'new-games designer', model: 'opus' },
  { key: 'D4', file: 'D4_art_direction_and_ux.md', who: 'art director / UX designer', model: 'sonnet' },
]
const FEEDBACK = { type: 'object', properties: {
  perDoc: { type: 'array', items: { type: 'object', properties: {
    key: { type: 'string', enum: ['D1', 'D2', 'D3', 'D4'] },
    mustFix: { type: 'array', items: { type: 'string' } },
    conflictsWithOtherDocs: { type: 'array', items: { type: 'string' } },
    critiqueNotAddressed: { type: 'array', items: { type: 'string' } },
    scienceProblems: { type: 'array', items: { type: 'string' } },
    ideasToBorrowFromOtherDocs: { type: 'array', items: { type: 'string' } },
  }, required: ['key', 'mustFix', 'conflictsWithOtherDocs', 'critiqueNotAddressed', 'scienceProblems', 'ideasToBorrowFromOtherDocs'] } },
  crossCuttingDecisions: { type: 'array', items: { type: 'string' } },
}, required: ['perDoc', 'crossCuttingDecisions'] }
const fb = await agent(`${CTX}

ROLE: Coordinator B — the design integrator who makes the critique team and the four designers talk to each other. You are a senior game director AND an evolutionary biologist.
Read ${ROOT}/docs/design/D0_design_brief.md, all four drafts in ${ROOT}/docs/design/ (D1–D4), and the critique sources in ${ROOT}/docs/reviews/ (R7_factcheck_* override reviewers) plus docs/changes/ if present.
Cross-review the drafts: (a) does each design actually remove the critique's root causes and respect the verified science constraints? (b) are the drafts consistent with each other (D2's triage vs D1's favourites vs D3's new games — no duplicates or orphans; D4's conventions applied in D1/D3 examples; D1's gold-standard template used by D2's roadmap)? (c) is every design buildable in the current JS canvas engine via v2 plug-ins for Wave 2 (per D0)? (d) is it genuinely FUN — strong core verb, escalation, juice — not a worksheet in disguise? (e) what good idea in one doc should another adopt? Decide cross-cutting conflicts yourself (state the decision). Return structured feedback per document.`, { label: 'coordinatorB:cross-review', phase: 'Integrate', model: 'opus', schema: FEEDBACK })

phase('Revise')
const revised = await parallel(DOCS.map(d => () => {
  const mine = fb && fb.perDoc.find(p => p.key === d.key)
  return agent(`${CTX}

ROLE: You are the ${d.who}. You wrote ${ROOT}/docs/design/${d.file} (round 1). Coordinator B (the design integrator) has cross-reviewed all four design docs against the critique and against each other.
Read: D0_design_brief.md, your own draft, and the OTHER three design docs in ${ROOT}/docs/design/ (so your doc agrees with your colleagues'), plus any review in docs/reviews/ you need.
Integrator's feedback for you: ${JSON.stringify(mine || {})}
Cross-cutting decisions (binding): ${JSON.stringify((fb && fb.crossCuttingDecisions) || [])}
TASK: revise your document in place: fix every mustFix item, resolve conflicts in line with the binding decisions, address unaddressed critique points, correct science problems, and adopt good ideas from the other docs (credit them). If you disagree with a feedback item, keep your text and add a short 'Disagreements with integrator' section explaining why. Add a short 'Revision notes (round 2)' section at the end. Return a 6-line summary of what changed.`, { label: `revise:${d.key}`, phase: 'Revise', model: d.model })
}))

phase('Decide')
await agent(`${CTX}

ROLE: Coordinator B — design integrator. The four design docs in ${ROOT}/docs/design/ have been revised after your cross-review. Read D0–D4 (incl. their 'Disagreements with integrator' and 'Revision notes' sections), the science-sweep logs in docs/changes/ if present, and check consistency once more.
TASK: write ${ROOT}/docs/design/D5_design_decisions.md — the decision record that hands over from DESIGN to IMPLEMENTATION (Wave 2 agents will build from it). Include: (1) a numbered list of binding design decisions with the reason and the doc that owns the detail; (2) resolved disagreements (who argued what, the ruling); (3) the gold-standard chapter template as an implementation checklist (acceptance criteria a chapter must pass: core verb, predict step embedded in play, escalation, boss/twist, live in-scene graph, juice, text budgets, science honesty panel, teacher hook, accessibility, monkey-test pass); (4) Wave 2 build list: the chapters to rebuild first (the favourites) and the first P0 new games, each with a one-paragraph build brief, the v2 file name, the existing code to reuse, and acceptance criteria; (5) shared engine/UX work that must land before or alongside Wave 2 (juice library, onboarding-by-demonstration, text-budget enforcement, palette tokens, level replay), specified as concrete APIs to add to ui.js/core.js; (6) items deferred to later waves; (7) remaining open questions for the human designer. 2500–4500 words. Return a 10-line summary.`, { label: 'coordinatorB:decisions', phase: 'Decide', model: 'opus' })

phase('Synthesis')
const SYN_READ = `Read every file in ${ROOT}/docs/reviews/ and ${ROOT}/docs/design/ (fact-check files R7_* override reviewers where they disagree; D5_design_decisions.md is the binding design record), plus docs/ORIGINAL_README.md and the science-sweep change logs in ${ROOT}/docs/changes/ (corrections already applied to the game — say so in the corrections table rather than listing them as still to do).`
await agent(`${CTX}

ROLE: Supervising coordinator / editor-in-chief. You turn many specialist reports into ONE master critique the designer will read first.
${SYN_READ}
TASK: Write ${ROOT}/docs/CRITIQUE.md — the master critique and improvement plan, addressed to the designer. It must stand alone (link to the detailed reports for depth). Structure:
1. Executive summary (one page): the honest verdict; the 5–7 root causes of 'boring / incorrect / not visual / clunky'; the 10 highest-impact changes.
2. What already works (protect it) — incl. why the favourites work, the shared pattern.
3. Root-cause critique: game design & fun; learning design; scientific accuracy (a consolidated, fact-checked corrections table: chapter | problem | fix | source — include only verified items); visuals & feel; UX/onboarding/clunkiness; structure & curriculum coverage.
4. Chapter-by-chapter verdicts for ALL Endless Forms chapters + Equilibrium + Tangled Bank: a table (chapter | current core verb | biggest problem | verdict KEEP/REBUILD/MERGE/CUT | one-line redesign) — consistent with D2's triage.
5. The nine favourites: short summary of each redesign (point to D1).
6. New concepts to add: prioritised list (P0/P1/P2) with one-line pitches (point to D3), grouped by area.
7. Making it a product for professors: teacher needs (from R8/D2).
8. Technology: a brief, clear recommendation (from R6) — a short paragraph plus a comparison table of options (vanilla JS, TS+PixiJS/Phaser, Godot, Unity, Three.js moments, Blender-as-pipeline), and the migration path.
9. Roadmap: phased plan over many sessions with concrete next 3 sessions' tasks.
10. Index of detailed reports.
Use tables where they help, plain direct English, no hype. Be honest and specific. Length ~7000–11000 words. Return a 10-line summary.`, { label: 'coordinator:critique', phase: 'Synthesis', model: 'opus' })

const VERDICT = { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { location: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] } }, required: ['location', 'problem', 'fix', 'severity'] } }, overall: { type: 'string' } }, required: ['issues', 'overall'] }
const checks = await parallel([
  () => agent(`${CTX}

ROLE: Supervisor — scientific correctness. Read ${ROOT}/docs/CRITIQUE.md and check every scientific statement, formula, citation and 'correction' it recommends against your own expertise, the R7_factcheck_* files and the game code. Flag anything wrong, overstated, or a 'fix' that would itself introduce an error. Also flag claims about what the game does that are not true of the code. Return issues (only real ones).`, { label: 'verify:science', phase: 'Synthesis', model: 'opus', schema: VERDICT }),
  () => agent(`${CTX}

ROLE: Supervisor — completeness and usefulness. The designer asked for: a FULL critique of how the game can be improved and what's lacking; what concepts to add and how; improvements to their favourites; making it more enjoyable and game-like and less clunky, more visual; a brief comment on other languages/renderers (Unity, Blender, JS etc.); the aim of publishing as an app for professors. Read ${ROOT}/docs/CRITIQUE.md and the files in docs/reviews and docs/design. Check: is every part of the request answered well? Is anything important from the specialist reports missing or contradicted (e.g. triage inconsistent with D2, missing chapters in the chapter table — compare against the chapter list in games/endless-forms/source/core.js and boot.js and the HW levels)? Is it actionable, prioritised and readable? Return issues (only real ones).`, { label: 'verify:completeness', phase: 'Synthesis', model: 'opus', schema: VERDICT }),
])
const issues = checks.filter(Boolean).flatMap(c => c.issues)
log(`Supervisors raised ${issues.length} issues`)
if (issues.length) {
  await agent(`${CTX}

ROLE: Editor-in-chief. Revise ${ROOT}/docs/CRITIQUE.md to resolve these supervisor findings (verify each against the sources before changing; if you disagree with one, leave the text and skip it). Edit the file in place; keep its structure. Findings:
${JSON.stringify(issues, null, 1)}
Return a short list of what you changed and what you rejected and why.`, { label: 'coordinator:revise', phase: 'Synthesis', model: 'opus' })
}

phase('Bible')
const bible = await agent(`${CTX}

ROLE: Technical writer for AI agents and humans.
Read ${ROOT}/docs/CRITIQUE.md, docs/design/* (D5_design_decisions.md is the binding implementation hand-over), docs/changes/* (science fixes already applied by Wave 1), docs/reviews/* (skim), docs/ORIGINAL_README.md, and inspect the repo layout (games/*, source files, build.py, tests) to make every path you mention accurate.
TASK — write three files:
(A) ${ROOT}/GAME_BIBLE.md: the single reference a future agent reads INSTEAD of everything else. Sections: Purpose & audience; the vision (one combined game for undergrad evolution, for professors/teachers; fun + correct); design pillars & principles (incl. predict→act→observe→explain→transfer, player-as-selective-force, visuals carry concepts, three kinds of truth, scored on understanding); what exists now (each game; full Endless Forms chapter list with section, id, source file, one-line description, current verdict; Equilibrium levels; Tangled Bank modes) — tables; the designer's favourites and why; known science corrections still to apply (checklist with file refs); art & UX rules (condensed from D4: palette conventions, text budgets, juice); architecture & how to build/test (exact commands, Playwright executable_path note, vclock/monkey usage, gotchas such as build outputs being gitignored); technology decision status (recommendation + 'not yet decided by designer' where applicable); roadmap with phases and a 'NEXT SESSION: start here' checklist; repo map; doc index (what each doc is for, when to read it); a decisions log (dated 2026-10-14: repo reorganised, critique produced) and an 'open questions for the designer' list; conventions for agents (where to put new chapters — the v2/ plug-in folder with V2 and PLAN_ADD registries in ui.js/boot.js, GAME_HTML env var for testing a specific build, how to update this bible, keep it under ~6000 words, update the decisions log every session).
(B) ${ROOT}/README.md: concise human README (what this is, how to play — open the HTML files, repo layout, where the critique and bible are, how to build/test).
(C) ${ROOT}/CLAUDE.md: short (≤40 lines) instructions for coding agents: read GAME_BIBLE.md first; key commands; rules (don't hand-edit built HTML — edit source and run build.py; keep science honest; update bible decisions log; tests).
Return a list of the files written.`, { label: 'bible', phase: 'Bible', model: 'opus' })

return { reviewResults, designs, issues: issues.length, bible }