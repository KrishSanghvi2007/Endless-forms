# R9. External reviewer's notes (received late November 2026; recorded for later work)

*The reviewer inspected an uploaded HTML build of the 25-chapter "Interactive Atlas" version (about 2.4 MB, with embedded Three.js). They read the code; they did not run a usability test or audit all the science. These are their notes, condensed faithfully. Nothing here has been acted on yet.*

## Overall
- **Strengths:** the breadth (25 chapters, 3D interactions, maths simulations, quizzes, case studies) is a major strength.
- **Priority:** do **not** add more content yet. Make what exists easier to navigate, more effective for learning, and scientifically verifiable.
- **First change:** redesign three representative chapters around measurable learning objectives, then use them as the template for the rest.

## Priorities (reviewer's illustrative scores, out of 10)
1. Scientific validation and numerical tests: 10
2. A Predict → Experiment → Explain → Apply flow in every chapter: 10
3. Guided navigation and pathways: 9
4. Performance and mobile optimisation: 9
5. Accessibility: 9
6. Field notebook and experiment export: 8
7. Exam mode and mastery tracking: 8
8. More chapters and simulations: 4

## Details
- **Learning flow.** Use Predict → Experiment → Explain → Apply in every chapter. Add diagnostic questions, feedback aimed at specific misconceptions, and a final transfer question on a *different* organism. Students should reason before the reveal.
  - **Hardy–Weinberg example:** first, predict 2pq at p = 0.6 (48%); next, slide p and watch AA/Aa/aa; then, explain why heterozygosity peaks at p = 0.5; finally, test observed beetle counts for a departure and diagnose its cause.
- **Pathways.** Offer guided routes: *Foundations of Evolution*, *Evolutionary Genetics*, *Adaptation & Behaviour*, *Deep Time & Evidence*. Keep the full atlas open for free exploration. Add a connected concept map across chapters (for example drift → Ne → fixation → bottlenecks → molecular evolution).
- **Scientific validation.**
  - Document every simulation: model, assumptions, parameters, limitations, expected results.
  - Add automated numerical tests for HW boundary conditions, conservation of allele frequency, and degrees of freedom.
  - **Chi-squared:** with three genotype classes and p estimated from the data, there is **1 df**. Say this explicitly, and handle small expected counts.
  - Separate idealised models from empirical findings on screen.
  - Link citations to the specific claims, equations and case studies they support.
- **Reproducibility.** Expose the experiment seed, so students can re-run or share an identical experiment.
- **Progress.** Add mastery scores, learning history, and progress export and import.
- **Performance.**
  - Lazy-load chapters and render only visible scenes, with graphics quality matched to the device.
  - Audit how WebGL scenes and renderers are cleaned up (several renderers and animation loops were found).
  - Pause off-screen rendering and check GPU memory.
- **Accessibility.** Support `prefers-reduced-motion` (the reviewer found none). Add keyboard equivalents for 3D manipulation, chart data screen readers can read, and a full screen-reader route.
- **Architecture.** Keep the standalone HTML export, but keep a modular source project with automated tests.
- **New features.**
  - **Field notebook:** saves hypotheses, parameters, observations and screenshots, exportable as a lab report.
  - **Evidence explorer:** follows a simulated result to a real organism, the original study, its dataset and its limitations.
  - **Exam mode:** undergraduate data-interpretation, maths and experimental-design questions.

## Reviewer's roadmap
1. **Reliability:** audit the models, add unit tests, mobile, accessibility, performance baselines.
2. **Learning design:** pilot the new structure in **Equilibrium, Drift Casino and Tree Thinking**, plus pathways and feedback.
3. **Learning tools:** notebook, reproducible experiments, progress, assessment mode.
4. **Academic validation:** tests with students and educators (understanding, completion, misconceptions, usability) before expanding.

## How it maps onto our plans (for the next session)
- **Already ours:**
  - Seeded runs and oracle tests exist in v2 (`tests/oracle_*.js`).
  - MODEL cards and refs exist.
  - Calm mode exists, but check that the Atlas build honours `prefers-reduced-motion`.
  - Predict-first was in D1/D5, but D6 decision 9 reduced prediction interludes. **Reconcile:** keep one prediction step, but make it a quick question in the text, not a drag interlude.
- **New to schedule:** pathways and concept map; field notebook; evidence explorer; exam mode; mastery and export; lazy-loading and WebGL disposal audit; the three pilot chapters (Equilibrium, Drift Casino, Tree Thinking) as the template.
- **Designer decision pending:** whether to adopt the reviewer's "no new content yet" priority over D7 step 3 (adding the benchmark's missing lessons).
