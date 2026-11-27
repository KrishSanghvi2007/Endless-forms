// =============================================================================
// Chapter 5: Bitter Wings — Batesian & Müllerian Mimicry, Predator Learning
// & Origin of Aposematism (6-Page Interactive 3D Plate)
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  computeImperfectCurve,
  createClearingInsects,
  createMullerianState,
  evaluateBatesianSystem,
  simulateAposematismOrigin,
  stepMullerianAdvergence,
  type RainforestInsect,
} from './bitterMath';
import { BitterScene3D, type BitterPageId } from './BitterScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'bitter')!;

function gloss(id: string, label: string): string {
  return `<span class="gloss-term" data-term="${id}">${label}</span>`;
}

interface CheckCase {
  id: string;
  prompt: string;
  options: { id: string; label: string; correct: boolean }[];
  explanation: string;
}

const CHECK_CASES: CheckCase[] = [
  {
    id: 'bw1-bates-muller',
    prompt:
      'Compare how frequency dependence acts on a harmless Batesian mimic versus a defended Müllerian co-mimic sharing the same warning signal.',
    options: [
      { id: 'a', label: 'Batesian mimicry shows negative frequency dependence (best when rare relative to models), whereas Müllerian mimicry shows positive frequency dependence (both species gain as total abundance rises).', correct: true },
      { id: 'b', label: 'Both Batesian and Müllerian mimics lose protection whenever their pattern becomes common.', correct: false },
      { id: 'c', label: 'Batesian mimics always share the cost of predator education equally with models.', correct: false },
    ],
    explanation:
      'Correct! Palatable Batesian mimics dilute the warning signal (parasitizing protection), whereas defended Müllerian co-mimics share the fixed learning quota L, lowering per-capita mortality from L/N₁ to L/(N₁ + N₂).',
  },
  {
    id: 'bw2-imperfect',
    prompt:
      'Why can rough, imperfect hoverfly mimics of stinging wasps persist for millions of years instead of being eaten immediately by birds?',
    options: [
      { id: 'a', label: 'Because when the defended model is highly noxious, the cost of a mistake is so steep that predators avoid broad lookalikes (flattened generalization).', correct: true },
      { id: 'b', label: 'Because birds cannot distinguish yellow-and-black stripes from green leaves.', correct: false },
      { id: 'c', label: 'Because Batesian mimics can never outnumber models under any toxin cost.', correct: false },
    ],
    explanation:
      'Correct! Signal-detection theory (Sherratt 2002) shows that high model unpalatability shifts the predator’s avoidance threshold downward, shielding imperfect mimics—and even permitting mimics to outnumber very noxious models.',
  },
  {
    id: 'bw3-aposematism',
    prompt:
      'A single bright orange toxic mutant caterpillar hatches in a cryptic green population. Why does kin aggregation (sibling clusters) help solve the paradox of how warning colouration first evolved?',
    options: [
      { id: 'a', label: 'Because tasting one conspicuous sibling teaches the predator to avoid the remaining clustered kin carrying the same warning allele.', correct: true },
      { id: 'b', label: 'Because clustering causes individual caterpillars to turn brighter during their lives.', correct: false },
      { id: 'c', label: 'Because naive birds innately prefer cryptic prey over novel bright forms.', correct: false },
    ],
    explanation:
      'Correct! Solitary novel warning morphs suffer anti-apostatic mortality (Langham 2004). Kin aggregation (Sillén-Tullberg 1988) turns one sacrificed relative into inclusive-fitness protection for clustered siblings (alongside non-lethal taste-rejection).',
  },
];

const PAGE_IDS: BitterPageId[] = ['forage', 'ratio', 'imperfect', 'mullerian', 'aposematic', 'check'];

export const CH05_BITTER: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'forage',
      shortLabel: '1 Forage',
      eyebrow: 'PREDATOR LEARNING · CHAI (1986) & BATES (1862)',
      heading: 'Forage as a rufous-tailed jacamar',
      bodyHtml: `Click fluttering butterflies directly in the 3D clearing as a rufous-tailed jacamar (<em>Galbula ruficauda</em>). Toxic red-banded <em>Heliconius</em> models taste foul and flutter away alive, teaching avoidance—which harmless ${gloss('batesian_mimicry', 'Batesian mimics')} borrow.`,
      promptHint: 'Click butterflies & dragonflies in 3D (or click “Auto-Sample Clearing”) and toggle Reveal Toxins.',
    },
    {
      id: 'ratio',
      shortLabel: '2 Ratio',
      eyebrow: 'SIGNAL DETECTION · MODEL RATIO & NOXIOUSNESS',
      heading: 'When the avoidance shield breaks',
      bodyHtml: `Harmless Batesian mimics work <em>best while rare relative to models</em>—yet the breaking point depends on <strong>both</strong> mimic share and model noxiousness (Lindström et al. 1997). Watch the 3D shield ring hold or shatter.`,
      promptHint: 'Push Mimic Share high under Mild Bitterness (shield cracks!), then switch to Highly Noxious.',
    },
    {
      id: 'imperfect',
      shortLabel: '3 Imperfect',
      eyebrow: 'DEADLY DAYS · PREDATOR GENERALIZATION',
      heading: 'Why “good enough” mimics survive',
      bodyHtml: `Nature is full of rough, ${gloss('imperfect_mimicry', 'imperfect mimics')}. Raise model noxiousness from Mild to Deadly and watch the golden 3D survival curve lift across even 40–60% lookalikes—mistake costs make predators cautious.`,
      promptHint: 'Switch between Mild, Strong, and Deadly model toxins and watch survival climb for middle specimens.',
    },
    {
      id: 'mullerian',
      shortLabel: '4 Müllerian',
      eyebrow: 'SHARED EDUCATION COST · TURNER’S TWO-STEP MODEL',
      heading: 'Müllerian advergence in Heliconius',
      bodyHtml: `Unlike Batesian parasites, ${gloss('mullerian_mimicry', 'Müllerian co-mimics')} are <strong>both defended</strong> and share the fixed cost <em>L</em> of educating naive birds. Evolve rarer <em>H. melpomene</em> as an unlinked large-effect locus (<em>optix/WntA</em>) drives ${gloss('advergence', 'advergence')} onto abundant <em>H. erato</em>.`,
      promptHint: 'Step generations to watch the rarer yellow-spot species adverge onto the abundant red-band signal.',
    },
    {
      id: 'aposematic',
      shortLabel: '5 Origin',
      eyebrow: 'ORIGIN OF WARNING COLOUR · KIN AGGREGATION',
      heading: 'How the first bright mutant survives',
      bodyHtml: `A rare solitary mutant with bright ${gloss('aposematism', 'warning colour')} is attacked anti-apostatically before birds learn (Langham 2004). Switch from <strong>Solitary</strong> to <strong>Kin-Clustered Broods</strong> (Sillén-Tullberg 1988) to see one major route past the rare-mutant trap.`,
      promptHint: 'Toggle Solitary vs. Kin-Clustered Broods and watch whether the bright warning allele spreads.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'MIMICRY & APOSEMATISM MASTERY',
      heading: 'Unify signals, learning & frequency',
      bodyHtml: `Distinguish Batesian vs. Müllerian dynamics, explain imperfect mimicry via mistake cost, and resolve the rare-aposematic-mutant paradox.`,
      promptHint: 'Complete all three challenges to stamp Plate 5 in your Atlas progress map.',
    },
  ],

  teacherGuide: {
    estimatedMinutes: 25,
    level: 'Undergraduate Biology (Years 1–3) · Behavioural Ecology & Coevolution',
    learningObjectives: [
      'Demonstrate associative avoidance learning in avian predators (Chai 1986 jacamar taste-rejection loop) and how harmless Batesian mimics exploit it.',
      'Calculate the signal-detection threshold p*_mimic = C_toxin / (B_meal + C_toxin), correcting the oversimplification that Batesian mimics can never outnumber models.',
      'Explain imperfect mimicry via mistake-cost asymmetry and broadened predator generalization gradients (Sherratt 2002).',
      'Contrast negative frequency-dependent Batesian mimicry against positive frequency-dependent Müllerian mimicry and asymmetric advergence via unlinked large-effect loci (optix, WntA, cortex).',
      'Explain how kin aggregation (Sillén-Tullberg 1988) and taste-rejection (Wiklund & Järvi 1982) allow novel rare warning colours to overcome anti-apostatic predation (Langham 2004).',
    ],
    commonMisconceptions: [
      {
        misconception: 'Batesian mimics can ONLY work when they are rarer than their models.',
        correction: 'Mimics work best while rare relative to models, but when models are very noxious (C_toxin > B_meal), mimics can outnumber models and still enjoy avoidance (Lindström et al. 1997).',
      },
      {
        misconception: 'Heliconius erato and H. melpomene Müllerian races are controlled by a single supergene.',
        correction: 'Their geographic races are governed by unlinked large-effect colour loci (optix, WntA, cortex; Turner’s two-step model). Supergenes govern polymorphic mimicry in H. numata (Joron et al. 2011).',
      },
      {
        misconception: 'All bright butterflies are harmless mimics borrowing protection.',
        correction: 'Müllerian co-mimics are BOTH chemically defended and mutually share the cost of predator education (L/(N₁ + N₂)).',
      },
    ],
    discussionPrompts: [
      'Why does a rufous-tailed jacamar release a bitter Heliconius alive rather than swallowing it, and how does that make aposematism easier to evolve?',
      'In a Müllerian pair where N₁ = 80 and N₂ = 20, why does the rarer species adverge toward the commoner species rather than meeting halfway?',
      'How does kin aggregation on Page 5 connect directly back to Hamilton’s rule (rB > C) from Plate 2?',
    ],
    activityTip:
      'On Page 1, keep “Reveal Toxins” OFF first so students experience the genuine jacamar dilemma—discovering for themselves that some red-banded butterflies are delicious while others are bitter!',
  },

  scienceCard: {
    coreTakeaway:
      'Predator learning links signal honesty and frequency dependence: harmless Batesian mimics exploit avoidance best while rare relative to models (scaled by noxiousness), whereas defended Müllerian co-mimics share education costs and adverge.',
    assumptions: [
      {
        label: 'Signal-detection Batesian payoff rule',
        status: 'realistic',
        tag: 'Sherratt 2002',
        detail: 'Pages 2–3 compute expected attack payoff E = p_mimic·B − p_model·C with logistic predator attack probability.',
      },
      {
        label: 'Müller’s fixed learning-quota model (L)',
        status: 'realistic',
        tag: 'Müller 1879',
        detail: 'Page 4 assumes naive predators sample L individuals per distinct warning pattern, yielding per-capita mortality L/N.',
      },
      {
        label: 'Unlinked large-effect colour loci (not supergene)',
        status: 'realistic',
        tag: 'H. erato/melpomene',
        detail: 'Müllerian advergence proceeds via large-effect mutations (optix, WntA, cortex; Turner’s two-step model) rather than a single locked supergene.',
      },
      {
        label: 'Kin aggregation as one route to aposematism',
        status: 'contested',
        tag: 'Multiple routes',
        detail: 'Page 5 models sibling clustering (Sillén-Tullberg 1988), which operates alongside non-lethal taste-rejection (Wiklund & Järvi 1982; Chai 1986) and dietary conservatism.',
      },
    ],
    citations: [
      { authors: 'Bates, H. W.', year: 1862, title: 'Contributions to an insect fauna of the Amazon valley', journal: 'Trans. Linn. Soc. Lond. 23: 495–566' },
      { authors: 'Müller, F.', year: 1879, title: 'Ituna and Thyridia; a remarkable case of mimicry in butterflies', journal: 'Proc. Entomol. Soc. Lond. 1879: xx–xxix' },
      { authors: 'Chai, P.', year: 1986, title: 'Field observations and feeding experiments on rufous-tailed jacamars', journal: 'Biol. J. Linn. Soc. 29: 161–189' },
      { authors: 'Sillén-Tullberg, B.', year: 1988, title: 'Evolution of gregariousness in aposematic butterfly larvae', journal: 'Evolution 42: 293–305' },
      { authors: 'Lindström, L., Alatalo, R. V. & Mappes, J.', year: 1997, title: 'Imperfect Batesian mimicry—the effects of the frequency and the distastefulness of the model', journal: 'Proc. R. Soc. B 264: 149–153' },
      { authors: 'Sherratt, T. N.', year: 2002, title: 'The evolution of imperfect mimicry', journal: 'Behavioral Ecology 13: 821–826' },
      { authors: 'Langham, G. M.', year: 2004, title: 'Specialized avian predators repeatedly attack novel color morphs of Heliconius butterflies', journal: 'Evolution 58: 2783–2787' },
    ],
    standards: {
      undergrad: [
        'Batesian vs. Müllerian mimicry: negative vs. positive frequency-dependent selection',
        'Predator signal detection, noxiousness thresholds & imperfect mimicry',
        'Asymmetric Müllerian advergence & origin of aposematism via kin aggregation',
      ],
      apOrALevel: [
        'AP Biology EVO-1.E / ENE-3.D: Coevolution, mimicry & predator-prey behavioural ecology',
        'UK A-Level / Undergraduate Bridge: Frequency-dependent selection & chemical defence',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <div class="plate-caption-pill">
          <span class="plate-caption-text" data-bit-caption>Neotropical Clearing — forage as a jacamar</span>
          <span class="plate-scale-bar">
            <span data-bit-tag>Avoidance 0% · Meals 0</span>
          </span>
        </div>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" type="button" data-bit-reset>Reset 3D</button>
        </div>
      </div>
      <div class="plate-canvas-host" data-bit-canvas></div>
      <div class="hwe-plate-legend" data-bit-legend></div>
      <div class="plate-orbit-hint" style="bottom:18px;">Drag to orbit 3D · Scroll to zoom</div>
    `;

    const captionEl = plateStageEl.querySelector<HTMLElement>('[data-bit-caption]')!;
    const tagEl = plateStageEl.querySelector<HTMLElement>('[data-bit-tag]')!;
    const legendEl = plateStageEl.querySelector<HTMLElement>('[data-bit-legend]')!;
    const canvasHost = plateStageEl.querySelector<HTMLElement>('[data-bit-canvas]')!;

    // -------------------------------------------------------------------------
    // CHAPTER STATE
    // -------------------------------------------------------------------------
    let activeStep = 0;

    // Page 1 state
    let p1Insects: RainforestInsect[] = createClearingInsects(501);
    let p1Meals = 0;
    let p1BitterHits = 0;
    let p1Avoid = 0;
    let p1RevealToxins = false;
    let p1Log = 'Click any fluttering butterfly or dragonfly in the 3D clearing to sample it.';

    // Page 2 state
    let p2Models = 5;
    let p2Mimics = 11;
    let p2ToxinCost = 6.0; // Strongly noxious -> shield STILL holds at 5:11!

    // Page 3 state
    let p3ToxinCost = 8.0; // Strong/Deadly days protect imperfect mimics

    // Page 4 state
    let p4State = createMullerianState();

    // Page 5 state
    let p5Clustered = true;

    // Page 6 state
    let p6Idx = 0;
    let p6Done = false;
    const p6Answered: Record<string, { choice: string; correct: boolean }> = {};

    const handleInsectClick = (id: number) => {
      if (activeStep !== 0) return;
      const ins = p1Insects.find((i) => i.id === id);
      if (!ins || !ins.alive) return;
      scene3d.triggerJacamarSwoop();
      if (ins.kind === 'model') {
        p1BitterHits += 1;
        p1Avoid = Math.min(1, p1Avoid + 0.35);
        ins.released = true;
        p1Log = 'BITTER MOUTHFUL! Toxic Heliconius model released alive (Chai 1986) — red-band avoidance jumped +35%!';
      } else if (ins.kind === 'mimic') {
        ins.alive = false;
        p1Meals += 1;
        p1Avoid = Math.max(0, p1Avoid - 0.18);
        p1Log = 'Tasty Batesian mimic! Eating a palatable red-band weakens predator avoidance (−18%).';
      } else if (ins.kind === 'nonmimic') {
        ins.alive = false;
        p1Meals += 1;
        p1Log = 'Palatable cream butterfly eaten! Unprotected non-mimics offer easy meals.';
      } else {
        ins.alive = false;
        p1Meals += 1;
        p1Log = 'Turquoise dragonfly caught! Safe aerial prey for a rufous-tailed jacamar.';
      }
      scene3d.updateForageClearing(p1Insects, p1RevealToxins);
      renderLeftControls();
      updateHeaderAndLegend();
    };

    const scene3d = new BitterScene3D(canvasHost, handleInsectClick);
    plateStageEl.querySelector('[data-bit-reset]')!.addEventListener('click', () => scene3d.resetView());

    const updateHeaderAndLegend = () => {
      if (activeStep === 0) {
        captionEl.textContent = 'Neotropical Clearing';
        tagEl.textContent = `Avoid ${(p1Avoid * 100).toFixed(0)}% · Meals ${p1Meals} · Bitter ${p1BitterHits}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#e23e2a"></i>Red-band (model / mimic)</span>
          <span><i class="hwe-dot" style="background:#efe6cf"></i>Cream non-mimic</span>
          <span><i class="hwe-dot" style="background:#1d96a6"></i>Dragonfly</span>
        `;
      } else if (activeStep === 1) {
        const dec = evaluateBatesianSystem(p2Models, p2Mimics, p2ToxinCost);
        captionEl.textContent = 'Batesian Ratio & Model Noxiousness';
        tagEl.textContent = `${p2Models}M : ${p2Mimics}m · ${dec.shieldHolds ? 'Shield Holds ✓' : 'Shield Cracked!'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#9de655"></i>Toxin dot = model</span>
          <span><i class="hwe-dot" style="background:#35b878"></i>Green = avoided</span>
          <span><i class="hwe-dot" style="background:#c93a2b"></i>Red = attacked</span>
        `;
      } else if (activeStep === 2) {
        captionEl.textContent = 'Imperfect Mimicry — Resemblance Spectrum';
        tagEl.textContent = `Toxin Cost C = ${p3ToxinCost.toFixed(1)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d99b26"></i>Survival curve</span>
          <span><i class="hwe-dot" style="background:#e23e2a"></i>Exact mimic (100%)</span>
        `;
      } else if (activeStep === 3) {
        captionEl.textContent = 'Müllerian Advergence';
        tagEl.textContent = `Gen ${p4State.gen} · Sp.2 Red-Band ${(p4State.pAdverged * 100).toFixed(0)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#e23e2a"></i>Abundant Red-Band</span>
          <span><i class="hwe-dot" style="background:#f2d030"></i>Rarer Yellow-Spot</span>
        `;
      } else if (activeStep === 4) {
        captionEl.textContent = 'Origin of Aposematism';
        tagEl.textContent = p5Clustered ? 'Kin-Clustered (spreads ✓)' : 'Solitary (anti-apostatic loss)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#e85a1c"></i>Warning mutant</span>
          <span><i class="hwe-dot" style="background:#5c8c54"></i>Cryptic green</span>
          <span><i class="hwe-dot" style="background:#35b878"></i>Kin halo</span>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        captionEl.textContent = `Mimicry & Aposematism Check — Case ${p6Idx + 1} of 3`;
        tagEl.textContent = `Score ${score}/3`;
        legendEl.innerHTML = `<span><i class="hwe-dot" style="background:#e23e2a"></i>Warning signal</span><span><i class="hwe-dot" style="background:#35b878"></i>Avoidance shield</span>`;
      }
    };

    const sync3D = () => {
      if (activeStep === 0) {
        scene3d.updateForageClearing(p1Insects, p1RevealToxins);
      } else if (activeStep === 1) {
        scene3d.updateRatioScene(evaluateBatesianSystem(p2Models, p2Mimics, p2ToxinCost));
      } else if (activeStep === 2) {
        scene3d.updateImperfectScene(computeImperfectCurve(p3ToxinCost));
      } else if (activeStep === 3) {
        scene3d.updateMullerianScene(p4State);
      } else if (activeStep === 4) {
        scene3d.updateAposematicScene(p5Clustered);
      } else {
        scene3d.setCheckCaseBackdrop(p6Idx);
      }
      updateHeaderAndLegend();
    };

    const renderLeftControls = () => {
      let html = '';

      if (activeStep === 0) {
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">JACAMAR TASTE LEDGER</span>
              <span class="hwe-stat-badge">Red-Band Avoidance ${(p1Avoid * 100).toFixed(0)}%</span>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Tasty Meals</span>
                <span class="lic-stat-val is-accent">${p1Meals}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Bitter Hits</span>
                <span class="lic-stat-val is-crimson">${p1BitterHits}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Avoidance</span>
                <span class="lic-stat-val">${(p1Avoid * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p1-sample>Auto-Sample Clearing</button>
              <button class="lic-btn" type="button" data-p1-reveal>Reveal Toxins: ${p1RevealToxins ? 'ON' : 'OFF'}</button>
              <button class="lic-btn" type="button" data-p1-reset>Reset</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Taste → Retch → Release alive → Reject red-band on sight</div>
            <p class="lic-formula-note">${p1Log}</p>
          </div>
        `;
      } else if (activeStep === 1) {
        const dec = evaluateBatesianSystem(p2Models, p2Mimics, p2ToxinCost);
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">MODEL : MIMIC RATIO & NOXIOUSNESS</span>
              <span class="lic-badge ${dec.shieldHolds ? '' : 'is-warn'}">${dec.shieldHolds ? 'Avoided ✓' : 'Attacked!'}</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p2Models === 12 ? 'is-active' : ''}" type="button" data-p2-ratio="12,4">12M : 4m</button>
              <button class="lic-pill-btn ${p2Models === 5 ? 'is-active' : ''}" type="button" data-p2-ratio="5,11">5M : 11m</button>
              <button class="lic-pill-btn ${p2Models === 2 ? 'is-active' : ''}" type="button" data-p2-ratio="2,14">2M : 14m</button>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p2ToxinCost === 1.5 ? 'is-active' : ''}" type="button" data-p2-cost="1.5">Mild (C=1.5)</button>
              <button class="lic-pill-btn ${p2ToxinCost === 6.0 ? 'is-active' : ''}" type="button" data-p2-cost="6">Noxious (C=6)</button>
              <button class="lic-pill-btn ${p2ToxinCost === 14.0 ? 'is-active' : ''}" type="button" data-p2-cost="14">Deadly (C=14)</button>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Mimic Share</span>
                <span class="lic-stat-val">${(dec.mimicShare * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Threshold p*</span>
                <span class="lic-stat-val">${(dec.criticalMimicShare * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Mimic Surv.</span>
                <span class="lic-stat-val is-accent">${(dec.mimicSurvival * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">p*_mimic = C / (B + C) = ${(dec.criticalMimicShare * 100).toFixed(0)}% · E[attack] = ${dec.expectedPayoff >= 0 ? '+' : ''}${dec.expectedPayoff.toFixed(2)}</div>
            <p class="lic-formula-note">Batesian mimics work best while rare relative to models—but when toxin cost C exceeds meal value B, mimics can even outnumber models and stay protected!</p>
          </div>
        `;
      } else if (activeStep === 2) {
        const pts = computeImperfectCurve(p3ToxinCost);
        const midSurv = pts[3].survivalProb * 100; // 60% resemblance specimen
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">MODEL UNPALATABILITY (DEADLY DAYS)</span>
              <span class="hwe-stat-badge">60% Mimic Surv: ${midSurv.toFixed(0)}%</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p3ToxinCost === 1.5 ? 'is-active' : ''}" type="button" data-p3-cost="1.5">Mild (C = 1.5)</button>
              <button class="lic-pill-btn ${p3ToxinCost === 8.0 ? 'is-active' : ''}" type="button" data-p3-cost="8">Strong (C = 8)</button>
              <button class="lic-pill-btn ${p3ToxinCost === 18.0 ? 'is-active' : ''}" type="button" data-p3-cost="18">Deadly (C = 18)</button>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">20% Lookalike</span>
                <span class="lic-stat-val">${(pts[1].survivalProb * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">60% Imperfect</span>
                <span class="lic-stat-val is-accent">${midSurv.toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">100% Exact</span>
                <span class="lic-stat-val">${(pts[5].survivalProb * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Mistake-cost asymmetry widens predator avoidance generalization</div>
            <p class="lic-formula-note">On Deadly Days (C = 18), risking a toxic mouthful is so costly that birds spare even rough 40–60% mimics—explaining widespread imperfect mimicry (Sherratt 2002).</p>
          </div>
        `;
      } else if (activeStep === 3) {
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">MÜLLERIAN CO-MIMICS (N₁ = 80, N₂ = 20)</span>
              <span class="hwe-stat-badge">Gen ${p4State.gen}</span>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Solo Risk L/N₂</span>
                <span class="lic-stat-val is-crimson">${(p4State.riskSoloRare * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Joined L/(N₁+N₂)</span>
                <span class="lic-stat-val is-accent">${(p4State.riskJoined * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Sp.2 Red-Band</span>
                <span class="lic-stat-val">${(p4State.pAdverged * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p4-step>Evolve +4 Generations →</button>
              <button class="lic-btn" type="button" data-p4-reset>Reset (12% Red)</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Per-capita mortality drops from L/N₂ (60%) → L/(N₁ + N₂) (12%)</div>
            <p class="lic-formula-note">Because both species are defended, joining the abundant Red-Band pattern via a large-effect allele (optix/WntA) slashes learning losses—positive frequency-dependent advergence!</p>
          </div>
        `;
      } else if (activeStep === 4) {
        const res = simulateAposematismOrigin(p5Clustered, 6);
        const pts = res.trajectory
          .map((v, i) => `${(10 + (i / (res.trajectory.length - 1)) * 270).toFixed(1)},${(58 - v * 48).toFixed(1)}`)
          .join(' ');
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">BROOD STRUCTURE (START 12% BRIGHT)</span>
              <span class="lic-badge ${res.spreads ? '' : 'is-warn'}">${res.spreads ? 'Warning Spreads ✓' : 'Mutant Lost ✗'}</span>
            </div>
            <div class="lic-mode-grid">
              <button class="lic-pill-btn ${!p5Clustered ? 'is-active' : ''}" type="button" data-p5-mode="solitary">Solitary Larvae</button>
              <button class="lic-pill-btn ${p5Clustered ? 'is-active' : ''}" type="button" data-p5-mode="clustered">Kin-Clustered (6 sibs)</button>
            </div>
            <div class="lic-spark-box">
              <svg viewBox="0 0 290 64" aria-label="Warning allele trajectory">
                <line x1="10" y1="58" x2="280" y2="58" stroke="#cbbda7" stroke-width="1" />
                <polyline fill="none" stroke="${res.spreads ? '#2a8c66' : '#c93a2b'}" stroke-width="2.4" points="${pts}" />
                <text x="12" y="10" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="#5c4b3b">Warning allele: 12% → ${(res.finalFreq * 100).toFixed(0)}% over 18 gens</text>
              </svg>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Kin aggregation (one route) + taste-rejection overcome rare-morph risk</div>
            <p class="lic-formula-note">${res.note}</p>
          </div>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        if (p6Done) {
          html = `
            <div class="hwe-card">
              <div class="hwe-card-head">
                <span class="hwe-kicker">PLATE 5 COMPLETE</span>
                <span class="hwe-stat-badge">${score}/${CHECK_CASES.length}</span>
              </div>
              <p style="margin:0;font-size:13.5px;line-height:1.5;color:var(--ink);">
                <strong>Stamped!</strong> You’ve mastered Batesian vs. Müllerian mimicry, mistake-cost imperfect mimicry, and the kin-aggregation route to aposematism.
              </p>
              <button class="lic-btn" type="button" data-check-retry>Review Cases Again</button>
            </div>
          `;
        } else {
          const c = CHECK_CASES[p6Idx];
          const ans = p6Answered[c.id];
          html = `
            <div class="hwe-card">
              <div class="hwe-card-head">
                <span class="hwe-kicker">CASE ${p6Idx + 1} OF ${CHECK_CASES.length}</span>
                <span class="hwe-stat-badge">SCORE ${score}/${CHECK_CASES.length}</span>
              </div>
              <p style="margin:0;font-size:13.5px;line-height:1.45;color:var(--ink);font-weight:600">${c.prompt}</p>
              <div class="lic-quiz-options">
                ${c.options
                  .map((opt) => {
                    const cls = ans
                      ? opt.correct
                        ? 'is-correct'
                        : ans.choice === opt.id
                          ? 'is-wrong'
                          : ''
                      : '';
                    return `<button class="lic-quiz-opt ${cls}" type="button" data-check-opt="${opt.id}" ${ans ? 'disabled' : ''}>${opt.label}</button>`;
                  })
                  .join('')}
              </div>
              ${ans ? `<div class="check-feedback ${ans.correct ? 'good' : ''}">${c.explanation}</div>` : ''}
              ${
                ans
                  ? `<button class="lic-btn is-primary" type="button" data-check-next>${
                      p6Idx + 1 < CHECK_CASES.length ? 'Next Case →' : 'Stamp Plate Complete ✓'
                    }</button>`
                  : ''
              }
            </div>
          `;
        }
      }

      leftPanelEl.innerHTML = `<div class="lic-controls-wrap">${html}</div>`;

      // Bind Page 1
      leftPanelEl.querySelector('[data-p1-sample]')?.addEventListener('click', () => {
        // Sample 1 toxic model + 2 tasty non-mimics so student immediately sees taste-rejection & avoidance jump
        const model = p1Insects.find((i) => i.alive && i.kind === 'model' && !i.released);
        if (model) handleInsectClick(model.id);
        const tasty = p1Insects.find((i) => i.alive && (i.kind === 'nonmimic' || i.kind === 'dragonfly'));
        if (tasty) handleInsectClick(tasty.id);
      });
      leftPanelEl.querySelector('[data-p1-reveal]')?.addEventListener('click', () => {
        p1RevealToxins = !p1RevealToxins;
        sync3D();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p1-reset]')?.addEventListener('click', () => {
        p1Insects = createClearingInsects(501);
        p1Meals = 0;
        p1BitterHits = 0;
        p1Avoid = 0;
        p1Log = 'Clearing reset! Sample butterflies to build jacamar avoidance.';
        sync3D();
        renderLeftControls();
      });

      // Bind Page 2
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p2-ratio]').forEach((b) => {
        b.addEventListener('click', () => {
          const [m, mi] = b.dataset.p2Ratio!.split(',').map(Number);
          p2Models = m;
          p2Mimics = mi;
          sync3D();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p2-cost]').forEach((b) => {
        b.addEventListener('click', () => {
          p2ToxinCost = Number(b.dataset.p2Cost);
          sync3D();
          renderLeftControls();
        });
      });

      // Bind Page 3
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p3-cost]').forEach((b) => {
        b.addEventListener('click', () => {
          p3ToxinCost = Number(b.dataset.p3Cost);
          sync3D();
          renderLeftControls();
        });
      });

      // Bind Page 4
      leftPanelEl.querySelector('[data-p4-step]')?.addEventListener('click', () => {
        p4State = stepMullerianAdvergence(p4State, 4);
        sync3D();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p4-reset]')?.addEventListener('click', () => {
        p4State = createMullerianState();
        sync3D();
        renderLeftControls();
      });

      // Bind Page 5
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p5-mode]').forEach((b) => {
        b.addEventListener('click', () => {
          p5Clustered = b.dataset.p5Mode === 'clustered';
          sync3D();
          renderLeftControls();
        });
      });

      // Bind Page 6
      leftPanelEl.querySelectorAll<HTMLElement>('[data-check-opt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const c = CHECK_CASES[p6Idx];
          const chosen = btn.dataset.checkOpt!;
          const opt = c.options.find((o) => o.id === chosen)!;
          p6Answered[c.id] = { choice: chosen, correct: opt.correct };
          updateHeaderAndLegend();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector('[data-check-next]')?.addEventListener('click', () => {
        if (p6Idx + 1 < CHECK_CASES.length) {
          p6Idx++;
          scene3d.setCheckCaseBackdrop(p6Idx);
          updateHeaderAndLegend();
          renderLeftControls();
        } else {
          p6Done = true;
          const score = Object.values(p6Answered).filter((a) => a.correct).length;
          ctx.completeChapter('bitter', score, CHECK_CASES.length);
          renderLeftControls();
        }
      });
      leftPanelEl.querySelector('[data-check-retry]')?.addEventListener('click', () => {
        p6Idx = 0;
        p6Done = false;
        Object.keys(p6Answered).forEach((k) => delete p6Answered[k]);
        scene3d.setCheckCaseBackdrop(0);
        updateHeaderAndLegend();
        renderLeftControls();
      });
    };

    const onStepChange = (stepIndex: number) => {
      activeStep = Math.max(0, Math.min(CH05_BITTER.steps.length - 1, stepIndex));
      scene3d.setPage(PAGE_IDS[activeStep]);
      sync3D();
      renderLeftControls();
    };

    return {
      onStepChange,
      onResize: () => scene3d.resize(),
      destroy: () => scene3d.dispose(),
    };
  },
};
