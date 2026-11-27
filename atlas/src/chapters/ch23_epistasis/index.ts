// =============================================================================
// Chapter 23: Sign Epistasis & Quantitative G-Matrices
// Reviving Tangled Bank "Landscape" (ch25.js) + Graduate/Undergrad Quant Genetics!
// 1. Magnitude vs Sign vs Reciprocal Sign Epistasis (2-Locus 3D Fitness Cube)
// 2. Weinreich et al. (2006) 5-Mutation Beta-Lactamase Accessible Paths (18/120)
// 3. Multivariate Selection (Lande 1979: Delta z_bar = G * beta) & G-Ellipse
// 4. Polygenic Architecture & 3D GWAS Manhattan Skyline
// 5. Antagonistic Pleiotropy & Genetic Trade-Off Constraints
// 6. Capstone Check
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import { EpistasisScene3D, type EpistasisPageId } from './EpistasisScene3D';
import {
  EPISTASIS_MODES,
  GWAS_PRESETS,
  WEINREICH_PATHS,
  evaluateGMatrix,
  type EpistasisMode,
  type GwasPreset,
} from './epistasisMath';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'epistasis')!;

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
    id: 'ep1-recip',
    prompt:
      'What specific type of gene–gene interaction is REQUIRED to carve two distinct fitness peaks separated by a maladaptive valley on a 2-locus landscape?',
    options: [
      {
        id: 'a',
        label: 'Reciprocal sign epistasis: BOTH single mutations lower fitness from the starting peak, yet combining them reaches a higher peak.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Pure additive fitness effects across loci.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Simple synergistic magnitude epistasis where every single step still increases fitness.',
        correct: false,
      },
    ],
    explanation:
      'Poelwijk et al. (2007) proved reciprocal sign epistasis is a necessary condition for multi-peaked ruggedness on a 2-locus landscape.',
  },
  {
    id: 'ep2-weinreich',
    prompt:
      'In Weinreich et al.’s (2006) classic β-lactamase antibiotic-resistance study, 5 mutations convert wild-type TEM-1 into a 100,000× more resistant enzyme, yielding 5! = 120 possible mutational orders — yet ONLY 18 paths are evolutionarily accessible. Why?',
    options: [
      {
        id: 'a',
        label: 'Pervasive sign epistasis: 102 of the 120 paths pass through at least one downhill intermediate that purifying selection purges before the next mutation arrives.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Point mutations can only ever occur in alphabetical order of amino acids.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Natural selection foresees the final 5-mutant enzyme and skips deleterious steps.',
        correct: false,
      },
    ],
    explanation:
      'Selection is myopic — it cannot climb downhill to reach a future peak. Sign epistasis severely constrains evolutionary pathways and makes adaptation historically contingent!',
  },
  {
    id: 'ep3-gmat',
    prompt:
      'Under Lande’s (1979) multivariate breeder’s equation Δz̄ = Gβ, why can a population evolve at an oblique angle AWAY from the direction of direct selection β?',
    options: [
      {
        id: 'a',
        label: 'Off-diagonal genetic covariances (G₁₂ ≠ 0, caused by pleiotropy or linkage) pull correlated traits along the genetic line of least resistance.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Because selection gradients never affect heritable traits.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Because genetic drift always pushes traits perpendicular to selection.',
        correct: false,
      },
    ],
    explanation:
      'Matrix multiplication Δz̄ = Gβ rotates the response vector toward the major axis of genetic variance (g_max; Schluter 1996).',
  },
  {
    id: 'ep4-gwas',
    prompt:
      'How does a highly polygenic quantitative trait (such as human height) respond rapidly to directional selection even without producing a classic single-locus hard selective sweep?',
    options: [
      {
        id: 'a',
        label: 'Subtle, coordinated frequency shifts across hundreds of small-effect standing alleles add up to a large shift in the trait mean without fixing any single locus.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Polygenic traits cannot respond to natural selection at all.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Every polygenic trait is secretly controlled by one hidden Mendelian allele.',
        correct: false,
      },
    ],
    explanation:
      'Polygenic adaptation shifts trait means swiftly via small allele-frequency nudges across hundreds of loci (Pritchard & Di Rienzo 2010).',
  },
];

const PAGE_IDS: EpistasisPageId[] = ['epistasis', 'weinreich', 'gmatrix', 'gwas', 'constraints', 'check'];

export const CH23_EPISTASIS: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'epistasis',
      shortLabel: '1 Epistasis',
      eyebrow: 'NON-ADDITIVE INTERACTIONS · 2-LOCUS FITNESS CUBE',
      heading: 'Sign Epistasis & Quantitative G-Matrices',
      bodyHtml: `Genes rarely act in isolation! When a mutation’s benefit flips sign depending on genetic background (${gloss('sign_epistasis', 'sign epistasis')}), evolutionary order suddenly matters — and <strong>reciprocal sign epistasis</strong> carves multi-peaked valleys that trap hill-climbing selection!`,
      promptHint: 'Switch between Additive, Magnitude, Sign, and Reciprocal Sign Epistasis to watch pathways open or seal shut!',
    },
    {
      id: 'weinreich',
      shortLabel: '2 β-Lactamase',
      eyebrow: 'WEINREICH ET AL. (2006) · HISTORICAL CONTINGENCY',
      heading: 'Sign Epistasis & Quantitative G-Matrices',
      bodyHtml: `Five mutations turn bacterial TEM-1 β-lactamase into a 100,000× super-resistant enzyme — yet out of 5! = 120 possible mutation orders, <strong>only 18 paths</strong> climb uphill at every step! The other 102 paths hit epistatic valleys and stall.`,
      promptHint: 'Compare accessible uphill mutational orders (#1 & #2) against an epistatically blocked order below!',
    },
    {
      id: 'gmatrix',
      shortLabel: '3 G-Matrix',
      eyebrow: 'LANDE (1979) · MULTIVARIATE BREEDER’S EQUATION (Δz̄ = Gβ)',
      heading: 'Sign Epistasis & Quantitative G-Matrices',
      bodyHtml: `Traits are woven together by shared genes (pleiotropy &amp; linkage) captured in the ${gloss('g_matrix', 'genetic covariance matrix (G)')}. Multiply <strong>G</strong> by selection gradient <strong>β</strong> and watch genetic correlation bend evolution sideways along the <em>genetic line of least resistance</em>!`,
      promptHint: 'Adjust Genetic Correlation (r_G) and Selection Angle (β) to watch the emerald response arrow deflect away from crimson β!',
    },
    {
      id: 'gwas',
      shortLabel: '4 GWAS',
      eyebrow: 'QUANTITATIVE ARCHITECTURE · POLYGENIC ADAPTATION',
      heading: 'Sign Epistasis & Quantitative G-Matrices',
      bodyHtml: `Some adaptations hinge on a single huge-effect switch (peppered moth <em>cortex</em>), while quantitative traits like human height rely on ${gloss('polygenic_adaptation', 'polygenic architecture')} — hundreds of small-effect loci spread across every chromosome!`,
      promptHint: 'Toggle Mendelian, Oligogenic (Finch Beaks), and Highly Polygenic GWAS Manhattan skylines below!',
    },
    {
      id: 'constraints',
      shortLabel: '5 Constraints',
      eyebrow: 'EVOLUTIONARY TRADE-OFFS · ANTAGONISTIC PLEIOTROPY',
      heading: 'Sign Epistasis & Quantitative G-Matrices',
      bodyHtml: `Why aren’t organisms infinitely fast, long-lived, and fecund all at once? Negative genetic covariance (<strong>antagonistic pleiotropy</strong>) erects a genetic trade-off ridge perpendicular to joint selection — stalling simultaneous improvement!`,
      promptHint: 'Toggle Free Genetic Variance vs. Antagonistic Pleiotropy Trade-Off Wall to inspect evolutionary constraint!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'CAPSTONE SYNTHESIS · EPISTASIS & QUANTITATIVE GENETICS',
      heading: 'Sign Epistasis & Quantitative G-Matrices',
      bodyHtml: `Apply reciprocal sign epistasis, Weinreich’s accessible pathways, Lande’s Δz̄ = Gβ, and polygenic adaptation across four quantitative genetics cases.`,
    },
  ],
  teacherGuide: {
    estimatedMinutes: 30,
    level: 'Undergraduate Quantitative & Evolutionary Genetics',
    learningObjectives: [
      'Distinguish additive, magnitude, sign, and reciprocal sign epistasis and explain why reciprocal sign epistasis generates multi-peaked fitness landscapes.',
      'Explain historical contingency in protein evolution using Weinreich et al.’s (2006) 18/120 accessible TEM-1 β-lactamase trajectories.',
      'Apply Lande’s (1979) multivariate breeder’s equation (Δz̄ = Gβ) to predict correlated responses and evolutionary deflection along genetic lines of least resistance.',
      'Contrast single-locus hard sweeps with polygenic adaptation across hundreds of small-effect GWAS variants.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Populations always evolve directly in the direction favoured by natural selection.',
        correction:
          'Only if traits are genetically uncorrelated (diagonal G)! Strong off-diagonal genetic covariance G₁₂ deflects Δz̄ = Gβ sideways, sometimes even temporarily decreasing one selected trait.',
      },
      {
        misconception: 'Any mutation that belongs to an optimal 5-mutation allele must be beneficial whenever it arises.',
        correction:
          'Sign epistasis means a mutation that is hugely beneficial late in an adaptive walk can be deleterious if it occurs too early (e.g. A42G in TEM-1 β-lactamase).',
      },
    ],
    discussionPrompts: [
      'Why does reciprocal sign epistasis require genetic drift, recombination, or environmental change to cross a valley?',
      'In Lande’s Δz̄ = Gβ, what happens if selection pushes perpendicular to a strongly correlated G-ellipse (r_G = +0.85, β = 135°)?',
      'Why do polygenic traits like height evolve smoothly without leaving classic hard-sweep valleys in DNA diversity?',
    ],
    activityTip:
      'On Page 3, have students set r_G = +0.85 and β = 120° to see an extreme ~50° deflection between the crimson selection arrow and the emerald evolutionary response!',
  },
  scienceCard: {
    coreTakeaway:
      'Evolutionary trajectories are shaped not only by selection gradients, but by epistasis between mutations (which blocks most multi-step paths) and multivariate genetic covariance matrices G (which deflect correlated responses along genetic lines of least resistance).',
    assumptions: [
      {
        label: 'Exact 2-locus fitness cube & Poelwijk epistasis classification',
        status: 'realistic',
        tag: 'Exact topology',
        detail:
          'Classifies additive, magnitude, sign, and reciprocal sign epistasis and counts exact monotonic uphill pathways from ab to AB.',
      },
      {
        label: 'Exact Lande (1979) 2×2 matrix equation Δz̄ = Gβ',
        status: 'realistic',
        tag: 'Exact linear algebra',
        detail:
          'Computes true response vector and angular deflection θ between selection gradient β and evolutionary response Δz̄.',
      },
      {
        label: 'Stylized TEM-1 β-lactamase fitness profiles (Weinreich 2006)',
        status: 'scaled',
        tag: 'Log-scaled MIC',
        detail:
          'Log-scales the empirical 100,000× cefotaxime resistance range while preserving exact accessibility ordering of 18/120 paths.',
      },
    ],
    citations: [
      {
        authors: 'Weinreich, D. M., Delaney, N. F., DePristo, M. A. & Hartl, D. L.',
        year: 2006,
        title: 'Darwinian evolution can follow only very few mutational paths to fitter proteins',
        journal: 'Science 312(5770): 111–114',
      },
      {
        authors: 'Lande, R.',
        year: 1979,
        title: 'Quantitative genetic analysis of multivariate evolution, applied to brain:body size allometry',
        journal: 'Evolution 33(1): 402–416',
      },
      {
        authors: 'Schluter, D.',
        year: 1996,
        title: 'Adaptive radiation along genetic lines of least resistance',
        journal: 'Evolution 50(5): 1766–1774',
      },
    ],
    standards: {
      undergrad: [
        'Epistasis & Fitness Landscape Ruggedness',
        'Multivariate Quantitative Genetics (G-Matrix & Lande Equation)',
        'Polygenic Architecture & GWAS',
      ],
      apOrALevel: [
        'AP Bio 5.4 — Non-Mendelian & Polygenic Inheritance',
        'AP Bio 7.2 — Natural Selection & Phenotypic Constraints',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-topbar">
        <div class="plate-caption-pill" id="ep-caption">2-Locus Fitness Cube · Epistasis</div>
        <div class="plate-tools">
          <button class="plate-tool-btn" id="ep-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="ep-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="ep-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="ep-canvas-host"></div>
      <div class="hwe-plate-legend" id="ep-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to rotate 3D fitness landscapes &amp; G-matrices</div>
    `;

    const canvasHost = plateStageEl.querySelector('#ep-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#ep-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#ep-legend') as HTMLElement;

    const scene = new EpistasisScene3D(canvasHost);
    (plateStageEl.querySelector('#ep-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoomIn());
    (plateStageEl.querySelector('#ep-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoomOut());
    (plateStageEl.querySelector('#ep-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let epiMode: EpistasisMode = 'reciprocal';
    let pathIdx = 0;
    let rG = 0.8;
    let betaDeg = 110;
    let gwasMode: GwasPreset['id'] = 'oligogenic';
    let antagonistic = true;
    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = (): void => {
      const pageId = PAGE_IDS[currentStep] ?? 'epistasis';
      scene.setPage(pageId);

      if (pageId === 'epistasis') {
        const land = EPISTASIS_MODES[epiMode];
        scene.updateEpistasisScene(land);
        captionEl.textContent = `${land.title} · Accessible Uphill Paths: ${land.accessiblePaths}/2`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3e7858"></i>Fitness Peak / Uphill Path</span>
          <span><i class="hwe-dot" style="background:#c44536"></i>Epistatic Valley / Blocked Step</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">2-Locus Epistasis Regime (ab → Ab / aB → AB)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${epiMode === 'additive' ? 'active' : ''}" data-ep="additive">Additive</button>
                <button class="lic-pill-btn ${epiMode === 'magnitude' ? 'active' : ''}" data-ep="magnitude">Magnitude</button>
                <button class="lic-pill-btn ${epiMode === 'sign' ? 'active' : ''}" data-ep="sign">Sign Epistasis</button>
                <button class="lic-pill-btn ${epiMode === 'reciprocal' ? 'active' : ''}" data-ep="reciprocal">Reciprocal Sign</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">ab=${land.w_ab.toFixed(2)} · Ab=${land.w_Ab.toFixed(2)}</span>
                <span class="hwe-stat-badge">aB=${land.w_aB.toFixed(2)} · AB=${land.w_AB.toFixed(2)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${land.explain}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-ep]').forEach((b) =>
          b.addEventListener('click', () => {
            epiMode = b.dataset.ep as EpistasisMode;
            renderPage();
          }),
        );
      } else if (pageId === 'weinreich') {
        const path = WEINREICH_PATHS[pathIdx]!;
        scene.updateWeinreichScene(path);
        captionEl.textContent = `TEM-1 β-Lactamase (Weinreich 2006) · ${path.accessible ? 'ACCESSIBLE (1 of 18/120)' : 'BLOCKED VALLEY (1 of 102/120)'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3e7858"></i>Selectable Uphill Step</span>
          <span><i class="hwe-dot" style="background:#c44536"></i>Deleterious Epistatic Dip</span>
          <span><i class="hwe-dot" style="background:#dda23e"></i>5-Mutant Peak</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Inspect Mutational Orderings (5! = 120 Total Orders)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                ${WEINREICH_PATHS.map(
                  (p, i) =>
                    `<button class="lic-pill-btn ${pathIdx === i ? 'active' : ''}" data-wp="${i}">${p.label}</button>`,
                ).join('')}
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${path.note}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-wp]').forEach((b) =>
          b.addEventListener('click', () => {
            pathIdx = Number(b.dataset.wp);
            renderPage();
          }),
        );
      } else if (pageId === 'gmatrix') {
        const res = evaluateGMatrix(rG, betaDeg);
        scene.updateGMatrixScene(res);
        captionEl.textContent = `Δz̄ = Gβ · Genetic Corr r_G = ${rG.toFixed(2)} · Deflection = ${res.deflectionDeg.toFixed(0)}°`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#49798e"></i>G-Matrix Genetic Cloud</span>
          <span><i class="hwe-dot" style="background:#c44536"></i>Selection Gradient β</span>
          <span><i class="hwe-dot" style="background:#3e7858"></i>Response Δz̄ = Gβ</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Multivariate Lande Equation (Δz̄ = Gβ)</div>
              <label class="lic-slider-label">
                <span>Genetic Correlation r_G = <strong>${rG.toFixed(2)}</strong></span>
                <input type="range" id="ep-rg" min="-0.85" max="0.85" step="0.05" value="${rG}" />
              </label>
              <label class="lic-slider-label" style="margin-top:6px;">
                <span>Selection Angle β = <strong>${betaDeg}°</strong></span>
                <input type="range" id="ep-ang" min="0" max="180" step="5" value="${betaDeg}" />
              </label>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.explain}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#ep-rg') as HTMLInputElement).addEventListener('input', (e) => {
          rG = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#ep-ang') as HTMLInputElement).addEventListener('input', (e) => {
          betaDeg = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'gwas') {
        const preset = GWAS_PRESETS[gwasMode];
        scene.updateGwasScene(preset);
        captionEl.textContent = preset.title;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c44536"></i>Major-Effect GWAS Hits (p &lt; 5×10⁻⁸)</span>
          <span><i class="hwe-dot" style="background:#3e7858"></i>Polygenic Small-Effect Loci</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Trait Genetic Architecture (GWAS Manhattan Skyline)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${gwasMode === 'mendelian' ? 'active' : ''}" data-gw="mendelian">1-Locus</button>
                <button class="lic-pill-btn ${gwasMode === 'oligogenic' ? 'active' : ''}" data-gw="oligogenic">Oligogenic</button>
                <button class="lic-pill-btn ${gwasMode === 'polygenic' ? 'active' : ''}" data-gw="polygenic">Polygenic</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${preset.explain}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-gw]').forEach((b) =>
          b.addEventListener('click', () => {
            gwasMode = b.dataset.gw as GwasPreset['id'];
            renderPage();
          }),
        );
      } else if (pageId === 'constraints') {
        scene.updateConstraintsScene(antagonistic);
        captionEl.textContent = antagonistic
          ? 'Antagonistic Pleiotropy (r_G = −0.82) → Trapped Along Trade-Off Wall!'
          : 'Unconstrained Genetic Variance (r_G = 0) → Free Climb to Joint Optimum!';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#dda23e"></i>Joint Fitness Peak</span>
          <span><i class="hwe-dot" style="background:${antagonistic ? '#c44536' : '#3e7858'}"></i>${antagonistic ? 'Trade-Off Constrained Cloud' : 'Free Evolving Cloud'}</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Genetic Trade-Off Architecture</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${antagonistic ? 'active' : ''}" data-con="1">Antagonistic Trade-Off</button>
                <button class="lic-pill-btn ${!antagonistic ? 'active' : ''}" data-con="0">Unconstrained (r_G = 0)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  antagonistic
                    ? '<strong>Evolutionary Constraint:</strong> Because alleles that raise Trait 1 simultaneously lower Trait 2, zero genetic variance exists toward the joint peak — trapping evolution on the trade-off ridge!'
                    : '<strong>Free Adaptation:</strong> Without antagonistic pleiotropy, standing variation fills trait space and selection climbs directly to the golden joint optimum!'
                }
              </p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-con]').forEach((b) =>
          b.addEventListener('click', () => {
            antagonistic = b.dataset.con === '1';
            renderPage();
          }),
        );
      } else {
        captionEl.textContent = 'Plate 23 Capstone · Sign Epistasis & Quantitative G-Matrices';
        legendEl.innerHTML = `<span><i class="hwe-dot" style="background:#3e7858"></i>Epistasis &amp; Multivariate Selection</span>`;

        let correctCount = 0;
        let answeredCount = 0;
        CHECK_CASES.forEach((c) => {
          const picked = answers[c.id];
          if (picked) {
            answeredCount++;
            if (c.options.find((o) => o.id === picked)?.correct) correctCount++;
          }
        });
        if (answeredCount === CHECK_CASES.length && !stamped) {
          stamped = true;
          ctx.completeChapter('epistasis', correctCount, CHECK_CASES.length);
        }

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            ${CHECK_CASES.map((c, idx) => {
              const picked = answers[c.id];
              const pickedOpt = c.options.find((o) => o.id === picked);
              return `
                <div class="hwe-card" style="margin-bottom:8px;">
                  <div class="hwe-kicker">Case ${idx + 1} of ${CHECK_CASES.length}</div>
                  <p style="font-size:0.84rem;margin:4px 0 8px;">${c.prompt}</p>
                  ${c.options
                    .map((o) => {
                      const cls =
                        picked === o.id
                          ? o.correct
                            ? 'lic-quiz-opt correct'
                            : 'lic-quiz-opt wrong'
                          : 'lic-quiz-opt';
                      return `<button class="${cls}" data-case="${c.id}" data-opt="${o.id}">${o.label}</button>`;
                    })
                    .join('')}
                  ${
                    pickedOpt
                      ? `<div class="check-feedback ${pickedOpt.correct ? 'ok' : 'bad'}">${
                          pickedOpt.correct ? c.explanation : 'Re-check the epistasis & G-matrix plates above.'
                        }</div>`
                      : ''
                  }
                </div>
              `;
            }).join('')}
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('.lic-quiz-opt').forEach((btn) => {
          btn.addEventListener('click', () => {
            answers[btn.dataset.case!] = btn.dataset.opt!;
            renderPage();
          });
        });
      }
    };

    renderPage();

    return {
      onStepChange(stepIdx: number) {
        currentStep = stepIdx;
        renderPage();
      },
      onResize() {
        scene.resize();
      },
      destroy() {
        scene.dispose();
      },
    };
  },
};
