export const meta = {
  name: 'science-sweep-wave1',
  description: 'Wave 1 of the redesign: sweep all game text and models for scientific errors, fix them, and adversarially verify each fix',
  phases: [
    { title: 'Sweep', detail: 'one expert per disjoint file group finds and fixes science errors' },
    { title: 'Verify', detail: 'adversarial reviewer checks each group diff' },
    { title: 'Fix', detail: 'apply verifier findings' },
  ],
}
const ROOT = '/home/user/Endless-forms'
const EF = ROOT + '/games/endless-forms/source'
const SCRATCH = '/tmp/claude-0/-home-user-Endless-forms/a94d7c95-1dea-5618-8308-812bf3aed5b0/scratchpad/sweep'
const CTX = `PROJECT: ${ROOT} holds three browser games that teach undergraduate evolutionary biology (designer: Oxford evolutionary biologist). The goal is a scientifically CORRECT, fun app that professors use. Endless Forms (games/endless-forms/source: core.js, hunt.js, ui.js, ch1..ch29.js, ch99.js, boot.js; chapters are objects CH_* registered in boot.js; each chapter has intro {hook,how,goal}, levels, 'idea', 'maths', 'real'/'nature' text, end-card text and notes). Equilibrium (games/equilibrium-hw/source: engine.js, lv_a..lv_d.js) is a Hardy–Weinberg course. Expert reviews are in ${ROOT}/docs/reviews/ (R1 sections I–IV, R2 sections V–VII, R3 VIII–XI, R4 Equilibrium + Tangled Bank; R7_factcheck_* files are adversarial fact-checks that OVERRIDE the reviews where they disagree; some fact-check files may still be being written, so use what exists and verify everything yourself). Another workflow is concurrently writing docs (docs/design, docs/CRITIQUE.md): do not touch those.
YOU MAY EDIT ONLY the files in your group (listed below) plus your own change log. Other agents are editing other files at the same time.`

const GROUPS = [
  { key: 'G1', name: 'Heredity & Chance', files: 'ch1.js (Mendel, Drift Casino, CH_BROOD_V1), ch4.js (Crossing Over, Castaways), ch16.js (Fancier, Coalescent), ch17.js (Why Sex?), ch13.js (Census, Clinic)', game: 'ef' },
  { key: 'G2', name: 'Selection & Games', files: 'hunt.js (Lichen Wood, Black Country, Bitter Wings + Hunt engine), boot.js (ONLY the CH_*.idea / .maths / .noteExtra text lines for lichen/soot/bitter near the top; do not touch registration/boot code), ch2.js (Scribe, Sieve, Left Jaw Right Jaw), ch25.js (Landscape, Switches), ch5.js (Hawks and Doves, CH_ALARM_V1), ch15.js (Blood Debts)', game: 'ef' },
  { key: 'G3', name: 'Sex, families (part 1)', files: 'ch3.js (Forager, Two Sizes, Raffle), ch7.js (Fisher\'s Brood, Alarm Call), ch9.js, ch10.js, ch11.js (Nest), ch12.js (Selfish Spindle)', game: 'ef' },
  { key: 'G4', name: 'Sex, societies, lives (part 2)', files: 'ch6.js (River, Lek), ch8.js (Meadow), ch18.js (Live Fast, Shape-shifters), ch19.js (Crowd), ch22.js (Commons, Lock and Key), ch24.js (Many Become One)', game: 'ef' },
  { key: 'G5', name: 'Disease, genomes, species, deep time', files: 'ch14.js (Pathogen), ch20.js (Ring, Doubling), ch21.js (Two Fruits), ch23.js (Guest), ch26.js (Sweep, Clock), ch27.js (Copy and Paste, Archipelago), ch28.js (Tree Thinking, Food Web), ch29.js (Islands, After the Fire)', game: 'ef' },
  { key: 'G6', name: 'Learning layer', files: 'ch99.js (bridges, TRANSFER predict cards, RECALL "Remember?" cards, TAKE lines — every question, answer and explanation)', game: 'ef' },
  { key: 'G7', name: 'Equilibrium (Hardy–Weinberg)', files: 'games/equilibrium-hw/source/engine.js, lv_a.js, lv_b.js, lv_c.js, lv_d.js (all paths relative to the repo, NOT the Endless Forms folder)', game: 'hw' },
]

function testHow(g) {
  return g.game === 'hw'
    ? `Build: cd ${ROOT}/games/equilibrium-hw/source && python3 build.py (writes Equilibrium_HW_v2.html there; gitignored). Test: GAME_HTML=<that file> python3 tests/monkey.py (read it first for args) and/or tests/shots.py; also open it with Playwright (p.chromium.launch(executable_path='/opt/pw-browsers/chromium')) and check the console for errors.`
    : `Build your OWN copy (others build concurrently): cd ${EF} && python3 build.py ${SCRATCH}/ef_${g.key}.html . Test each chapter you touched: GAME_HTML=${SCRATCH}/ef_${g.key}.html python3 tests/monkey.py <chapterIds comma-separated> 1,2 (chapter ids are in ui.js PLAN, e.g. mendel, casino, lichen). A pre-existing 'timeout' for mendel is known; compare with the original build at games/endless-forms/Endless_Forms_v1.html (GAME_HTML=that path) to be sure you didn't cause a failure. Any JS error, NaN on screen or new failure must be fixed.`
}

const results = await pipeline(GROUPS,
  g => agent(`${CTX}
GROUP ${g.key} — ${g.name}. Files: ${g.files}.
ROLE: You are a senior evolutionary biologist (population/quantitative genetics, behavioural ecology, evo-devo, phylogenetics, disease ecology) doing a FULL SCIENCE SWEEP of these files.
1. Read every piece of player-facing text (intro hooks, how/goal, HUD lines, toasts, quiz questions/answers/explanations, idea/maths/real/'In nature' text, end cards, notes) AND the model code (equations, parameters, update rules) in your files.
2. Collect candidate problems from (a) the reviews and fact-checks in docs/reviews that concern your chapters, and (b) your own reading: factual errors, wrong numbers/citations/dates/authors, misleading oversimplifications presented as fact, contested claims stated as settled, model code that contradicts the text, teleological or 'for the good of the species' language, misconception-reinforcing phrasing (e.g. individuals evolving, evolution as progress/goal, 'survival of the fittest' as strongest), missing honesty about model assumptions.
3. Try to refute each candidate before acting. Only fix what you are confident is wrong or misleading. Keep fixes MINIMAL and in the game's existing voice and length (British spelling, short sentences); prefer rewording text over changing mechanics. Change model code only when it is genuinely wrong (and keep gameplay balance working). Where the science is contested, say so briefly rather than picking a side. Do not redesign gameplay (that is a later wave).
4. ${testHow(g)}
5. Write a change log to ${ROOT}/docs/changes/science_sweep_${g.key}.md: a table (file:line | chapter | before (short quote) | after | why | source/citation), then a list 'Considered but NOT changed' with reasons (incl. reviewer claims you rejected), then 'Needs a gameplay redesign to fix properly' (issues text can't solve), then test results.
Return a short summary: number of fixes, the 5 most important, test status.`, { label: `sweep:${g.key}`, phase: 'Sweep', model: 'opus' }),
  (sweepSummary, g) => agent(`${CTX}
GROUP ${g.key} — ${g.name}. Files: ${g.files}.
ROLE: Adversarial reviewer (PhD evolutionary biologist + careful JS engineer). Another agent just applied science fixes to these files; its log is ${ROOT}/docs/changes/science_sweep_${g.key}.md. Inspect the actual diff: cd ${ROOT} && git diff -- <your files> (the uncommitted changes are exactly this sweep's edits).
Check every change: (1) is the new text scientifically correct, not overstated, and not a new error? (2) did the fix lose something correct or important? (3) code changes: syntax, logic, balance, string quoting (apostrophes inside single-quoted JS strings!), HTML in strings; (4) consistency with the rest of the game. Also spot-check for important errors the sweep MISSED in these files. Build and quickly test: ${testHow(g)}
Return JSON: issues (each with file, line, problem, fix, severity) — only real problems.`, {
    label: `verify:${g.key}`, phase: 'Verify', model: 'opus',
    schema: { type: 'object', properties: { issues: { type: 'array', items: { type: 'object', properties: { file: { type: 'string' }, line: { type: 'string' }, problem: { type: 'string' }, fix: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] } }, required: ['file', 'problem', 'fix', 'severity'] } }, verdict: { type: 'string' } }, required: ['issues', 'verdict'] },
  }).then(v => ({ v, sweepSummary })),
  (r, g) => {
    if (!r || !r.v || !r.v.issues.length) return { key: g.key, summary: r && r.sweepSummary, issues: 0 }
    return agent(`${CTX}
GROUP ${g.key} — ${g.name}. Files: ${g.files}.
A reviewer raised these issues about the science fixes just applied to your files (see docs/changes/science_sweep_${g.key}.md and git diff). Verify each; apply the ones that are right; reject wrong ones with a reason. Update the change log (add a 'Review round' section). Rebuild and re-test: ${testHow(g)}
Issues: ${JSON.stringify(r.v.issues)}
Return a short summary.`, { label: `fix:${g.key}`, phase: 'Fix', model: 'opus' }).then(s => ({ key: g.key, summary: r.sweepSummary, issues: r.v.issues.length, fix: s }))
  })
return results