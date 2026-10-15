export const meta = {
  name: 'redesign-wave2',
  description: 'Wave 2: build the shared v2 engine and UX layer, then rebuild the favourites and add the first P0 games as v2 plug-ins, each reviewed through three lenses, fixed and gated',
  phases: [
    { title: 'Prepare', detail: 'architect: golden trajectories + API contract + act plan' },
    { title: 'Engine 1', detail: 'core.js, ui.js/shell, tokens/fx/wf plug-ins, test tooling' },
    { title: 'Engine 2', detail: 'entry/onboarding, widgets, hunt extensions, rigs and scenes' },
    { title: 'Engine integration', detail: 'assemble, legacy regression, commit' },
    { title: 'Batch 1', detail: 'Lichen Wood, Black Country, Hawks, Mixer, Drift Casino' },
    { title: 'Lessons', detail: 'coordinator reviews batch 1, fixes engine, writes lessons' },
    { title: 'Batch 2+3', detail: 'other favourites and first P0 new games' },
    { title: 'Final integration', detail: 'ship Endless_Forms_v2.html, regression, bible update, commit' },
  ],
}

const ROOT = '/home/user/Endless-forms'
const EF = ROOT + '/games/endless-forms/source'
const SCR = '/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/wave2'

const CTX = `PROJECT: ${ROOT} — "Endless Forms", a browser game teaching undergraduate evolutionary biology through play (designer: Oxford evolutionary biologist; audience: professors and their students). Read ${ROOT}/GAME_BIBLE.md first (orientation). BINDING design record: ${ROOT}/docs/design/D5_design_decisions.md (it overrides D1–D4; D0 rules on science). Detail lives in docs/design/D1_favourites_redesign.md (gold-standard template §2, favourites §3), D2_game_structure_and_roadmap.md (acts §3, triage §4, onboarding §9, scoring §11, notation §15), D3_new_games_catalogue.md (new games), D4_art_direction_and_ux.md (palette, text budgets, juice timings, accessibility). The Wave 1 science corrections are already in the legacy code (logs: docs/changes/science_sweep_G*.md) — v2 must keep every correction.
CODE: games/endless-forms/source — legacy core.js, hunt.js, ui.js, ch1..ch29.js, ch99.js, boot.js, shell.html; build.py concatenates everything into one strict-mode IIFE. Redesign plug-ins live in source/v2/*.js (sorted by name, loaded after ch99.js, before boot.js): V2.push(CH_X) registers/replaces a chapter by id; PLAN_ADD adds menu entries (see ui.js, boot.js). Load rule: top-level code in a v2 file may only touch legacy objects and LOWER-numbered v2 files.
BUILD & TEST (many agents work at once — never build to the shared default output):
- cd ${EF} && V2_ONLY='<patterns>' python3 build.py ${SCR}/<yourname>.html   (V2_ONLY e.g. '0*,zz_*,lichen.js' = engine files + your file only; omit V2_ONLY to include all v2 files)
- GAME_HTML=${SCR}/<yourname>.html python3 tests/monkey.py <ids> <seeds>   (auto-player; 'end' = reached the end card)
- Playwright python: p.chromium.launch(executable_path='/opt/pw-browsers/chromium'); tests/vclock.js gives window.__advance(ms) for fast virtual time; window.TB exposes App, REG, Save, etc.
- Known auto-player limits on legacy chapters: mendel/fancier timeout, cross/landscape/double stuck (pre-existing).
RULES: Edit ONLY the files you are assigned (others are editing other files right now). Do not git commit unless told to. British spelling, plain short sentences, D4 text budgets. Never break legacy chapters or ?v1=1. Keep the science honest (MODEL cards, ×N tags, contested = say so).`

const ISSUES = { type: 'object', properties: {
  issues: { type: 'array', items: { type: 'object', properties: {
    where: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' },
    severity: { type: 'string', enum: ['blocker', 'high', 'medium', 'low'] } }, required: ['where', 'problem', 'fix', 'severity'] } },
  verdict: { type: 'string' } }, required: ['issues', 'verdict'] }
const GATE = { type: 'object', properties: { pass: { type: 'boolean' }, failures: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } }, required: ['pass', 'failures', 'summary'] }

// ---------------- Prepare ----------------
phase('Prepare')
await agent(`${CTX}
ROLE: Lead engineer / architect for Wave 2.
TASKS:
1. GOLDEN TRAJECTORIES (before anyone touches core.js): make legacy behaviour checkable. Write ${EF}/tests/golden.py (+ any JS helper in tests/) that, for each of the 48 legacy chapter ids and a fixed seed, deterministically drives the chapter (seed the game's R() via window.TB.seed or equivalent — study core.js; use vclock.js; drive through the real UI or chapter API) for a fixed number of steps and records a compact fingerprint (e.g. hash of chapter state / HUD text / population stats per step). 'python3 tests/golden.py record' writes ${EF}/tests/golden/*.json; 'python3 tests/golden.py check [GAME_HTML]' compares. Prove it is deterministic (two records identical). Record the goldens now from the current build.
2. API CONTRACT: write ${ROOT}/docs/design/API_v2.md — the exact, implementable JavaScript contract for every Batch 0 module in D5 §5 (Det, Gen extensions, Save v2 + adapter, Events, frame/Stage zones/App.playLevel/Notes no-op/Teacher/URL in ui.js; Pal tokens, CVD, Fx/Layer/Ghost/Lbl/Live/Snd2, WF; Entry/end card/onboarding/PLAN rewrite/Freezer/Replay, zz_v1switch; widgets: LiveGraph (chart types), Predict.ask, GenePoolLens, Invasion.run, Ledger, PriceBars, Pin, Evidence, PedigreeView, Chips, DemeMap, TreeView, SceneLab; Hunt extensions (D1 §2.2 + migrants, lens) ; rigs (Rig API + the creatures D5 §4 lists) and scenes (Petri, Strata)). For each: signatures, semantics, defaults, which file, and how a chapter uses it. Keep it lean enough to build in one wave: mark anything that can be a simple first version. Include the full v2 chapter contract (D5 §5.4) with a worked minimal skeleton, saved also as ${ROOT}/docs/design/v2_chapter_skeleton.js (NOT inside source/v2/). Include the ACT PLAN: the exact new PLAN (D2 §3 acts, retitles/subtitles) listing every id, including the new ids mixer, tap, royal, swamp, dig, so 00_entry.js can rewrite PLAN and new units only need V2.push. Include the testing recipe for unit agents (V2_ONLY builds, monkey, oracle tests in Node via vm on game.js or a built html, bots sweep, screenshots at 390x780/1024x768/1280x720, lint_text).
3. Assign ENGINE WORK PACKAGES with strict file ownership: E1 core.js; E2 ui.js + shell.html (+ boot.js if needed); E3 v2/00_tokens.js, v2/00_cvd.js, v2/00_fx.js, v2/00_wf.js; E7 tests tooling (tests/lint_text.js, tests/monkey.js v2 support incl. data-stars/#hud/dock buttons and skipping Notes for v2, tests/bots.py five-bot sweep harness, tests/oracle runner, fix the mendel monkey timeout if simple); E4 v2/00_entry.js + v2/zz_v1switch.js; E5 v2/01_widgets.js; E6 v2/02_hunt_ext.js + v2/01_rig.js + v2/01_scenes.js. Put the package list in API_v2.md.
Return a 10-line summary.`, { label: 'architect', phase: 'Prepare', model: 'opus' })

// ---------------- Engine ----------------
const ENG = `Read ${ROOT}/docs/design/API_v2.md (the contract — implement it exactly; if you must deviate, document it in your log) and the D5/D1/D4 sections it cites.`
function engine(key, files, extra, label, phase) {
  return agent(`${CTX}
ROLE: Senior game engineer, work package ${key}. ${ENG}
YOU OWN: ${files}. ${extra}
Requirements: legacy chapters must behave identically (run python3 tests/golden.py check with GAME_HTML pointing to your build, and the monkey on a spread of legacy ids); everything must work offline in the single file; strict mode; no CDNs; respect Calm/reduced-motion and accessibility rules from D4; small, readable code in the existing style. Write a self-test where sensible (Node vm or Playwright). Log what you built, deviations, and test results to ${ROOT}/docs/changes/wave2/engine_${key}.md.
Return a 6-line summary incl. test status.`, { label, phase, model: 'opus' })
}
phase('Engine 1')
await parallel([
  () => engine('E1', 'games/endless-forms/source/core.js', 'Det math (bit-exact, +−×÷ and sqrt only), Gen.layout/Gen.mate extensions (opt-in; legacy draws unchanged), Save v2 (schema, key migration, star2, adapter chain, res snapshots ≤96 bytes), Events (emit, csv).', 'E1:core', 'Engine 1'),
  () => engine('E2', 'games/endless-forms/source/ui.js, shell.html (and boot.js only if unavoidable)', 'frame()/requestAnimationFrame compatible with tests/vclock.js, Stage.u/zones/hit, App.playLevel + level select/replay, Notes.open no-op for ch.v2 with the live strip polling notes(), Teacher strip + projector class, URL params (unit, level, seed, teacher, projector, cvd, lab, v1). CSS for the v2 layout zones, dock, whisper, live region, v2 end card hooks.', 'E2:ui', 'Engine 1'),
  () => engine('E3', 'games/endless-forms/source/v2/00_tokens.js, v2/00_cvd.js, v2/00_fx.js, v2/00_wf.js', 'Pal tokens and theme mapping (D4 §2), CVD simulation filters/lints, Fx (tween, burst, pop, ring, shake, hitstop, tiers, governor, Calm), Layer cache, Ghost hand, Lbl.put, Live.say, Snd2 (WebAudio, each sound with a visual twin), whisper toast; WF haploid Wright–Fisher helper. These files must not reference each other at top level except lower-numbered/same-file rules.', 'E3:fx', 'Engine 1'),
  () => engine('E7', 'games/endless-forms/source/tests/ (new files + tests/monkey.js and tests/monkey.py; do not touch golden.py except to fix bugs)', 'lint_text.js (D4 text budgets over v2 content objects), monkey v2 support, bots.py five-bot sweep harness (always-A, always-B, random, greedy-now, fixed threshold — via a per-chapter bot hook declared in API_v2.md), oracle test runner (tests/oracle_<id>.js convention), screenshot helper (3 sizes + mono/deut CVD), and fix the mendel monkey timeout if simple.', 'E7:tests', 'Engine 1'),
])
phase('Engine 2')
await parallel([
  () => engine('E4', 'games/endless-forms/source/v2/00_entry.js, v2/zz_v1switch.js', 'Entry wraps (App.open for ch.v2, star migration, End.show v2 end card with data-stars + aria-label, Save.d.done), Begin → live Wood onboarding (falls back to menu if lichen v2 absent), PLAN rewrite into D2 acts with retitles (ids unchanged; include new ids so V2.push works; unregistered ids show "still being written"), Freezer, Replay.encode. ?v1=1 switch empties V2/PLAN_ADD and skips the rewrite.', 'E4:entry', 'Engine 2'),
  () => engine('E5', 'games/endless-forms/source/v2/01_widgets.js', 'All widgets in API_v2.md: LiveGraph (all chart types; realised solid, expected dashed, you-diamond; never pauses), Predict.ask (gesture on the live graph, scored by distance, tolerance band after commit), GenePoolLens, Invasion.run, Ledger, PriceBars, Pin, Evidence, PedigreeView, Chips, DemeMap, TreeView, SceneLab (dev). Build simple, robust first versions; D4 look; keyboard + tap alternatives.', 'E5:widgets', 'Engine 2'),
  () => engine('E6', 'games/endless-forms/source/v2/02_hunt_ext.js, v2/01_rig.js, v2/01_scenes.js', 'Hunt extensions (D1 §2.2: bag, overproduce, searchImage, trunks, predict, untimed, detectRule, species, modelCount, toxicity, migrants, lens; Det.exp in match under ch.v2) by WRAPPING Hunt, never forking; Rig API and procedural creature rigs (hermit crab, stickleback, side-blotched lizard + ground, Seychelles warbler, dung fly, feral fowl, ground squirrel, great tit, beetle, crustaceans, fossil set) in D4 style with readable traits; Petri and Strata scenes.', 'E6:hunt+rigs', 'Engine 2'),
])
phase('Engine integration')
await agent(`${CTX}
ROLE: Integration engineer for the Wave 2 engine. Read API_v2.md and the logs docs/changes/wave2/engine_*.md.
TASK: build the full game (all v2 files) and make the engine whole: fix any cross-file breakage (you may edit any engine file and core.js/ui.js/shell.html/boot.js/tests), run python3 tests/golden.py check (legacy must match), the monkey on ALL 48 legacy ids (seed 1; compare with the pre-wave build games/endless-forms/Endless_Forms_v1.html — no new failures), ?v1=1 check, tests/lint_text.js, and a Playwright smoke test that loads the title, presses Begin and checks no console errors at 390x780 and 1280x720. Write a tiny throwaway test chapter in ${SCR} (NOT in source/v2) to prove a v2 chapter can register, play a level with LiveGraph + Predict + Fx + end card, and save stars. Update API_v2.md where reality differs. Log to docs/changes/wave2/engine_integration.md.
Then commit and push: cd ${ROOT} && git add -A games docs && git commit -m "Wave 2 engine: v2 plug-in engine and UX layer (Det, Save v2, Events, Fx, widgets, entry, hunt extensions, rigs, tests)" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_017YW5C9vGiX7i3imRcBkBu7" && git push origin claude/evolution-game-critique-9m7vmx.
Return a 10-line summary incl. what is solid and what is weak in the engine.`, { label: 'engine-integrator', phase: 'Engine integration', model: 'opus' })

// ---------------- Units ----------------
function unitPipeline(units, phaseName, lessons) {
  const L = lessons ? ` Also read ${ROOT}/docs/changes/wave2/lessons_batch1.md (patterns and pitfalls from the first five units — follow it).` : ''
  return pipeline(units,
    u => agent(`${CTX}
ROLE: Senior game developer + evolutionary biologist building ONE v2 unit to the gold standard. FIRST read ${ROOT}/docs/design/D6_designer_decisions.md — the designer's binding decisions (they override D5, D1–D4 and API_v2: name is just 'Endless Forms'; ONE Hardy–Weinberg chapter; no controversial/human-population topics; playtests by the designer and colleagues; MIT licence). Read API_v2.md and docs/changes/wave2/engine_integration.md.${L}
UNIT: ${u.title} — id '${u.id}', file games/endless-forms/source/v2/${u.file}, object ${u.obj}. ${u.newId ? 'NEW chapter id (already placed in the act PLAN by 00_entry.js; if not, use PLAN_ADD).' : 'Replaces the legacy chapter with the same id (legacy stays reachable via ?v1=1).'}
SPEC: ${u.spec} — and the D5 §4 build brief for this unit, D5 §3 acceptance checklist (all 14 items, as far as automation allows), D4 for look/juice/text, D2 for its place in the acts and notation.
YOU OWN: v2/${u.file}, tests/oracle_${u.id}.js, any tests/${u.id}_*.py you write. If the engine lacks something, implement a local helper inside your own file and record an 'Engine requests' note in your log — do NOT edit engine files.
Make it genuinely FUN and VISUAL: a per-second verb, animated organisms, juice on every action, the live graph growing in the scene, escalation to a boss that inverts the lesson. No text walls. Then: oracle tests for the science (the spec's numbers), bot sweep, monkey 3 seeds at 390x780 and 1280x720 (build with V2_ONLY='0*,zz_*,${u.file}'), screenshots of every level into ${SCR}/${u.id}/ and LOOK at them (Read shows PNGs) and fix what looks bad.
Log to ${ROOT}/docs/changes/wave2/${u.id}.md: what you built (levels, verbs, boss), science claims with refs, deviations from spec, engine requests, test results, screenshot paths. Return an 8-line summary.`, { label: `build:${u.id}`, phase: phaseName, model: 'opus' }),
    (built, u) => parallel([
      () => agent(`${CTX}
ROLE: Playtester and art director (think of a demanding indie-game reviewer). FIRST read ${ROOT}/docs/design/D6_designer_decisions.md — the designer's binding decisions (they override D5, D1–D4 and API_v2: name is just 'Endless Forms'; ONE Hardy–Weinberg chapter; no controversial/human-population topics; playtests by the designer and colleagues; MIT licence).  Unit '${u.id}' (${u.title}) was just built in games/endless-forms/source/v2/${u.file}; its log is docs/changes/wave2/${u.id}.md.
Build: V2_ONLY='0*,zz_*,${u.file}' python3 build.py ${SCR}/pt_${u.id}.html. PLAY IT with Playwright: drive it deliberately through every level (read the code to find the controls), screenshot each level and key moments at 390x780 and 1280x720 into ${SCR}/pt_${u.id}/ and look at them. Judge against D5 §3 items 1, 2, 6, 7, 8, 11, 13 and D4: first 10 seconds, visual readability, juice, text budget, layout on phone, colour-blind safety, bugs, console errors, softlocks. Above all: is it FUN or a worksheet in disguise? What is clunky? Return issues (only real ones, with concrete fixes).`, { label: `playtest:${u.id}`, phase: phaseName, model: 'sonnet', schema: ISSUES }),
      () => agent(`${CTX}
ROLE: Adversarial science reviewer (PhD evolutionary biologist). FIRST read ${ROOT}/docs/design/D6_designer_decisions.md — the designer's binding decisions (they override D5, D1–D4 and API_v2: name is just 'Endless Forms'; ONE Hardy–Weinberg chapter; no controversial/human-population topics; playtests by the designer and colleagues; MIT licence).  Unit '${u.id}' (${u.title}) in games/endless-forms/source/v2/${u.file}; spec ${u.spec}; log docs/changes/wave2/${u.id}.md.
Check every player-facing claim, number, equation, MODEL card, 'In nature' text, refs, and the model code itself against the literature and the spec's oracles; run the oracle tests. Look for errors, overclaims, contested science presented as settled, teleology, misconception-reinforcing wording, and model behaviour that teaches the wrong lesson. Return issues (only real ones).`, { label: `science:${u.id}`, phase: phaseName, model: 'opus', schema: ISSUES }),
      () => agent(`${CTX}
ROLE: Lead game designer (owner of the D1 gold-standard template). FIRST read ${ROOT}/docs/design/D6_designer_decisions.md — the designer's binding decisions (they override D5, D1–D4 and API_v2: name is just 'Endless Forms'; ONE Hardy–Weinberg chapter; no controversial/human-population topics; playtests by the designer and colleagues; MIT licence).  Unit '${u.id}' (${u.title}) in games/endless-forms/source/v2/${u.file}; spec ${u.spec}; log docs/changes/wave2/${u.id}.md.
Compare the build with its spec and D5 §3 items 3, 4, 5, 9, 10, 12: predictions as gestures on the live graph, one new variable per level, the boss inverts the lesson, bots cannot three-star, MODEL card honesty, teacher hook, learning-layer overrides (TAKE/RECALL/BRIDGE, TRANSFER). Did it lose what the designer loved about the original (if a favourite)? Is the core loop compelling? Return issues (only real ones).`, { label: `design:${u.id}`, phase: phaseName, model: 'opus', schema: ISSUES }),
    ]).then(rs => ({ built, issues: rs.filter(Boolean).flatMap(r => r.issues) })),
    (r, u) => agent(`${CTX}
FIRST read ${ROOT}/docs/design/D6_designer_decisions.md — the designer's binding decisions (they override D5, D1–D4 and API_v2: name is just 'Endless Forms'; ONE Hardy–Weinberg chapter; no controversial/human-population topics; playtests by the designer and colleagues; MIT licence). 
ROLE: The developer of unit '${u.id}' (${u.title}), file games/endless-forms/source/v2/${u.file} (you own only it, its oracle and its tests). Three reviewers (playtest/art, science, design) raised these issues. Verify each, fix the real ones (blockers and highs first), reject wrong ones with a reason. Re-run oracle, bots, monkey (3 seeds, two sizes) and re-screenshot. Append a 'Review round' section to docs/changes/wave2/${u.id}.md (issue → action).
Issues: ${JSON.stringify((r && r.issues) || [])}
Return a 6-line summary.`, { label: `fix:${u.id}`, phase: phaseName, model: 'opus' }),
    (fixed, u) => agent(`${CTX}
ROLE: Release gate for unit '${u.id}'. Build V2_ONLY='0*,zz_*,${u.file}' to ${SCR}/gate_${u.id}.html; run: node --check on the v2 file, tests/lint_text.js, the oracle test, the monkey (3 seeds at 390x780 and 1280x720), a Playwright load with console-error capture, and the legacy golden check on that build. Pass only if all are clean (the unit reaches its end card; no errors/NaN/undefined on screen; no softlock). Return pass/fail with failures.`, { label: `gate:${u.id}`, phase: phaseName, model: 'sonnet', schema: GATE })
      .then(g => (g && g.pass) ? { id: u.id, pass: true, summary: g.summary } :
        agent(`${CTX}
ROLE: Developer of unit '${u.id}' (file v2/${u.file}). The release gate FAILED: ${JSON.stringify(g)}. Fix every failure, re-run the same checks until clean (build with V2_ONLY='0*,zz_*,${u.file}'), and note it in docs/changes/wave2/${u.id}.md. If something cannot be fixed, make the unit fail safe (e.g. not registered) and explain. Return a short summary with final status.`, { label: `refix:${u.id}`, phase: phaseName, model: 'opus' }).then(s => ({ id: u.id, pass: 'after-refix', summary: s }))),
  )
}

const BATCH1 = [
  { id: 'lichen', file: 'lichen.js', obj: 'CH_LICHEN_V2', title: 'The Lichen Wood (template pilot)', spec: 'D1 §3.1 (Wood arc) and §5 pilot gates; D2 §9 onboarding' },
  { id: 'soot', file: 'soot.js', obj: 'CH_SOOT_V2', title: 'The Black Country', spec: 'D1 §3.1 (Wood arc, L4–L6); starts from the saved Wood (Save.res) with a sensible default if absent' },
  { id: 'hawks', file: 'hawks.js', obj: 'CH_HAWKS_V2', title: 'Hawks and Doves', spec: 'D1 §3.4' },
  { id: 'census', file: 'mixer.js', obj: 'CH_HWE_V2', title: 'Equilibrium — the ONE Hardy–Weinberg chapter (8 levels of rising conceptual complexity; replaces the legacy Census, keeps id census)', spec: 'D6 "Spec: the Equilibrium chapter" (binding), then D3 Mixer §3.1 and D2 §5 for reusable detail, the old Equilibrium game (games/equilibrium-hw/source) and legacy ch13.js Census for code to reuse; heterozygote advantage via warfarin-resistant rats (no human-population content)' },
  { id: 'casino', file: 'casino.js', obj: 'CH_CASINO_V2', title: 'Drift Casino (absorbs Castaways)', spec: 'D3 (search "Casino", §3.2), D2 §4' },
]
const BATCH23 = [
  { id: 'bitter', file: 'bitter.js', obj: 'CH_BITTER_V2', title: 'Bitter Wings', spec: 'D1 §3.2' },
  { id: 'jaws', file: 'jaws.js', obj: 'CH_JAWS_V2', title: 'Left Jaw, Right Jaw', spec: 'D1 §3.3' },
  { id: 'forager', file: 'forager.js', obj: 'CH_FORAGER_V2', title: 'The Forager', spec: 'D1 §3.7' },
  { id: 'raffle', file: 'raffle.js', obj: 'CH_RAFFLE_V2', title: 'The Raffle', spec: 'D1 §3.5' },
  { id: 'alarm', file: 'alarm.js', obj: 'CH_ALARM_V2', title: 'Alarm Call', spec: 'D1 §3.6' },
  { id: 'clinic', file: 'clinic.js', obj: 'CH_CLINIC_V2', title: 'The Clinic', spec: 'D1 §3.8' },
  { id: 'switch', file: 'switch.js', obj: 'CH_SWITCH_V2', title: 'Switches', spec: 'D1 §3.9' },
  { id: 'scribe', file: 'scribe.js', obj: 'CH_SCRIBE_V2', title: 'The Scribe (mutation: DFE, Luria–Delbrück)', spec: 'D3 (search "Scribe")' },
  { id: 'tap', file: 'tap.js', obj: 'CH_TAP_V2', title: 'The Leaky Tap (mutation–selection balance)', spec: 'D3 (search "Leaky Tap")', newId: true },
  { id: 'royal', file: 'royal.js', obj: 'CH_ROYAL_V2', title: 'The Royal Line (X-linkage)', spec: 'D3 (search "Royal Line")', newId: true },
  { id: 'swamp', file: 'swamp.js', obj: 'CH_SWAMP_V2', title: 'Gene Swamping (migration vs selection, clines, F_ST)', spec: 'D3 (search "Gene Swamping")', newId: true },
  { id: 'dig', file: 'dig.js', obj: 'CH_DIG_V2', title: 'The Dig (fossil record and deep time)', spec: 'D3 (search "The Dig")', newId: true },
]

phase('Batch 1')
const b1 = await unitPipeline(BATCH1, 'Batch 1', false)
log('Batch 1: ' + JSON.stringify(b1.map(x => x && [x.id, x.pass])))

phase('Lessons')
await agent(`${CTX}
ROLE: Coordinator — technical design lead between batches. FIRST read ${ROOT}/docs/design/D6_designer_decisions.md — the designer's binding decisions (they override D5, D1–D4 and API_v2: name is just 'Endless Forms'; ONE Hardy–Weinberg chapter; no controversial/human-population topics; playtests by the designer and colleagues; MIT licence).  Read docs/changes/wave2/*.md (engine logs and the five Batch 1 unit logs incl. review rounds), and the five v2 unit files (lichen, soot, hawks, mixer.js = Equilibrium/census, casino).
TASK: (1) Fix engine bugs and implement engine requests that several units needed (you may edit engine files v2/0*.js, v2/zz_*, core.js, ui.js, shell.html, tests), keeping legacy goldens and the five units passing (rebuild all, monkey them + legacy spread). Move duplicated helpers from unit files into the engine only if safe, and update API_v2.md. (2) Write ${ROOT}/docs/changes/wave2/lessons_batch1.md for the next 12 unit builders: patterns that worked (with code references), pitfalls reviewers caught repeatedly, engine API changes, performance notes, the definition of done, and how the units connect (Save.res hand-offs, act placement). (3) Commit and push: cd ${ROOT} && git add -A games docs && git commit -m "Wave 2 batch 1: Lichen Wood, Black Country, Hawks and Doves, Equilibrium (Hardy–Weinberg), Drift Casino rebuilt as v2 units" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_017YW5C9vGiX7i3imRcBkBu7" && git push origin claude/evolution-game-critique-9m7vmx
Return a 10-line summary.`, { label: 'coordinator:lessons', phase: 'Lessons', model: 'opus' })

phase('Batch 2+3')
const b23 = await unitPipeline(BATCH23, 'Batch 2+3', true)
log('Batch 2+3: ' + JSON.stringify(b23.map(x => x && [x.id, x.pass])))

phase('Final integration')
const fin = await agent(`${CTX}
ROLE: Release integrator for Wave 2. FIRST read ${ROOT}/docs/design/D6_designer_decisions.md — the designer's binding decisions (they override D5, D1–D4 and API_v2: name is just 'Endless Forms'; ONE Hardy–Weinberg chapter; no controversial/human-population topics; playtests by the designer and colleagues; MIT licence). Read docs/changes/wave2/*.md.
TASKS: (1) Build the full game with all v2 files; fix cross-unit conflicts (you may edit any v2/engine/test file; keep unit behaviour). (2) Run: golden check (legacy), monkey on every id in the PLAN (legacy + v2) seed 1 at 390x780 and 1280x720, ?v1=1 smoke, lint_text, all oracle tests, Playwright console-error sweep. (3) Ship: write the built file to ${ROOT}/games/endless-forms/Endless_Forms_v2.html (keep Endless_Forms_v1.html as the archived classic; make build.py's default output name Endless_Forms_v2.html; update .gitignore if needed). (4) Update ${ROOT}/GAME_BIBLE.md: status of every unit (v2 built / legacy), the v2 engine and conventions (point to API_v2.md), decisions-log entries for 2026-10-14 (Wave 1 science sweep, Wave 2 engine + units), and a fresh 'NEXT SESSION: start here' checklist (D5 deferred items, open designer questions, units not yet passing). Update README.md (play Endless_Forms_v2.html; ?v1=1 for the classic). Write docs/changes/wave2/SUMMARY.md (what was built, test matrix, known issues, what the designer should playtest first). Write ${ROOT}/docs/PLAYTEST_GUIDE.md for the designer and colleagues (D6 decision 4): how to open the game, a 5–10 minute script per v2 unit (what to try, what 'working' looks like, what to watch for), and a short feedback form (fun 1–5, clarity 1–5, 'boring moment?', 'what did you learn?', science doubts, bugs). Make sure the in-game title/credits say just 'Endless Forms' and mention the MIT licence; make sure no withdrawn/controversial topic appears anywhere in the v2 build or PLAN (D6 decision 5); make sure the legacy Equilibrium game remains available as games/equilibrium-hw/ (classic) and README says the HW content now lives in the 'Equilibrium' chapter.
(5) Commit and push: cd ${ROOT} && git add -A && git commit -m "Wave 2: favourites and first P0 games rebuilt as v2 units; ship Endless_Forms_v2.html; update game bible" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" -m "Claude-Session: https://claude.ai/code/session_017YW5C9vGiX7i3imRcBkBu7" && git push origin claude/evolution-game-critique-9m7vmx
Return a 12-line summary incl. the test matrix.`, { label: 'release-integrator', phase: 'Final integration', model: 'opus' })

return { batch1: b1, batch23: b23, final: fin }