// =============================================================================
// Chapter 3: The Lichen Wood & Soot — Natural Selection, R = h²S & Landscapes
// 6-Page Interactive 3D Undergraduate Evolutionary Biology Plate
// =============================================================================

import './lichen.css';
import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  breedNextWoodGeneration,
  computeBreederEquation,
  createInitialModeState,
  createInitialWood,
  eraFitnesses,
  meanShade,
  PINNED_MOTH_SHADE,
  runBirdForage,
  simulateMelanismTrajectory,
  stepLandscapePopulation,
  stepMelanismOneGen,
  stepSelectionMode,
  type BreederScenarioId,
  type DominanceMode,
  type LandscapePop,
  type MelanismEra,
  type MothSpecimen,
  type SelectionModeId,
} from './lichenMath';
import { LichenScene3D, type LichenPageId } from './LichenScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'lichen')!;

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
    id: 'lc1-breeders',
    prompt:
      'On lichen-covered birch bark, surviving peppered moths average +20 shade units paler than the full population (S = +20). If wing shade has narrow-sense heritability h² = 0.40, what happens in the next generation?',
    options: [
      { id: 'a', label: 'Each surviving moth lightens its own wings by +8 units before laying eggs.', correct: false },
      { id: 'b', label: 'The offspring population mean shifts paler by R = h²S = +8 units, while individuals keep their own fixed colour.', correct: true },
      { id: 'c', label: 'The offspring population shifts by the full +20 units regardless of heritability.', correct: false },
    ],
    explanation:
      'Correct! R = h²S = 0.40 × 20 = +8 units. Only the heritable fraction of the selection differential passes to offspring—and individual moths never change their own wings.',
  },
  {
    id: 'lc2-dominance',
    prompt:
      'Under clean air, pale bark favours typica (cc) and birds prey heavily on dark moths. Why does a rare deleterious RECESSIVE allele persist far longer in a population than a rare deleterious DOMINANT allele of equal selection coefficient?',
    options: [
      { id: 'a', label: 'Because when rare, almost all copies of a recessive allele hide inside unaffected heterozygotes (2pq ≫ q²) invisible to predators.', correct: true },
      { id: 'b', label: 'Because recessive alleles mutate backwards into dominant alleles every generation.', correct: false },
      { id: 'c', label: 'Because dominant alleles violate Hardy–Weinberg segregation.', correct: false },
    ],
    explanation:
      'Correct! At q = 0.05, 95% of recessive copies sit inside heterozygous carriers (2pq = 0.095 vs. q² = 0.0025), shielding them from selection—creating the classic slow recessive tail.',
  },
  {
    id: 'lc3-landscape',
    prompt:
      'On Sewall Wright’s 3D fitness landscape, Population A has climbed to a lower local fitness peak separated by a deep maladaptive valley from a taller global peak. Under pure natural selection in a static environment, why does Population A stay trapped?',
    options: [
      { id: 'a', label: 'Because natural selection is myopic: it favours only immediate uphill fitness gains and cannot walk downhill for a distant future reward.', correct: true },
      { id: 'b', label: 'Because mutation stops completely once any peak is reached.', correct: false },
      { id: 'c', label: 'Because populations evolve for the good of the species only on global peaks.', correct: false },
    ],
    explanation:
      'Correct! Selection has no foresight. Crossing a maladaptive valley requires either an environmental shift that reshapes the surface or genetic drift/gene flow bridging a shallow saddle.',
  },
];

const PAGE_IDS: LichenPageId[] = ['wood', 'breeder', 'soot', 'modes', 'landscape', 'check'];

export const CH03_LICHEN: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'wood',
      shortLabel: '1 Lichen Wood',
      eyebrow: 'DARWIN’S POSTULATES · OVERPRODUCTION & PREDATION',
      heading: 'Hunt the lichen bark',
      bodyHtml: `Eighteen ${gloss('natural_selection', 'peppered moths')} rest on pale silver-birch bark. Click dark conspicuous moths directly on the 3D trunk (or let a bird forage), then breed the survivors through a 120-egg winter cull. Watch <strong>Pinned Moth #7</strong>.`,
      promptHint: 'Click moths directly on the 3D bark to forage, or click “Bird Forage Round”, then “Breed Survivors”.',
    },
    {
      id: 'breeder',
      shortLabel: '2 R = h²S',
      eyebrow: 'QUANTITATIVE GENETICS · THE BREEDER’S EQUATION',
      heading: 'Heritability & counterfactuals',
      bodyHtml: `Selection only produces evolutionary change when variation is heritable (${gloss('heritability', 'h² > 0')}). Use the 3D ${gloss('breeders_equation', 'Breeder’s equation (R = h²S)')} sculpture and brass slope beam to test Darwin’s three counterfactuals.`,
      promptHint: 'Adjust heritability h² or test “No Variation”, “Acquired Stain (h² = 0)”, and “Random Predation”.',
    },
    {
      id: 'soot',
      shortLabel: '3 Black Country',
      eyebrow: 'INDUSTRIAL MELANISM · DOMINANCE ASYMMETRY',
      heading: 'Soot, Clean Air & hidden alleles',
      bodyHtml: `In 1848 Manchester, a transposable element in the <em>cortex</em> gene produced dominant dark <em>carbonaria</em> (${gloss('industrial_melanism', 'industrial melanism')}). Flip on the <strong>Gene-Pool Lens</strong> to see why ${gloss('dominance_asymmetry', 'dominance controls sweep speed')} and carrier hiding.`,
      promptHint: 'Switch eras (1848 → 1895 → 1970), toggle the Gene-Pool Lens, and compare Dominant vs. Recessive curves.',
    },
    {
      id: 'modes',
      shortLabel: '4 Modes',
      eyebrow: 'SHAPING MEANS & VARIANCES',
      heading: 'Directional, stabilizing & disruptive',
      bodyHtml: `Natural selection does not only push traits in one direction. Watch the golden 3D fitness arch <strong>W(z)</strong> reshape both mean and variance under Directional, ${gloss('stabilizing_selection', 'Stabilizing')}, and ${gloss('disruptive_selection', 'Disruptive')} selection.`,
      promptHint: 'Switch selection regimes and evolve generations to watch variance shrink or split into two peaks.',
    },
    {
      id: 'landscape',
      shortLabel: '5 Landscape',
      eyebrow: 'SEWALL WRIGHT’S ADAPTIVE TOPOGRAPHY',
      heading: 'Peaks, valleys & myopic climbers',
      bodyHtml: `On a 3D ${gloss('fitness_landscape', 'fitness landscape')}, populations climb local fitness gradients without foresight. Watch <strong>Population A</strong> get stranded on the lower ochre peak—then deform the terrain with an <strong>Environmental Shift</strong>!`,
      promptHint: 'Step pure selection until Pop A stalls on the Local Peak, then toggle Environmental Shift or Add Drift.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'NATURAL SELECTION MASTERY CHECK',
      heading: 'Diagnose evolutionary change',
      bodyHtml: `Apply the Breeder’s equation, dominance asymmetry, and adaptive topography across three core undergraduate scenarios.`,
      promptHint: 'Complete all three challenges to stamp Plate 3 in your Atlas progress map.',
    },
  ],

  teacherGuide: {
    estimatedMinutes: 25,
    level: 'Undergraduate Biology (Years 1–3) · Quantitative Genetics & Natural Selection',
    learningObjectives: [
      'Distinguish individual stasis (Pinned Moth #7 never changes colour) from population-level evolutionary shifts across generations.',
      'Apply the Breeder’s equation (R = h²S) and prove why zero variation, zero heritability, or random mortality yield R = 0.',
      'Explain dominance asymmetry in industrial melanism (Biston betularia cortex locus): rapid sweep of rare dominant C vs. heterozygote sheltering (2pq ≫ q²) of rare recessive c.',
      'Contrast how directional, stabilizing, and disruptive selection reshape both trait mean and phenotypic variance.',
      'Interpret Sewall Wright’s adaptive landscape as myopic hill-climbing capable of trapping populations on local peaks unless environments shift or drift bridges valleys.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Individual moths darken during their lives to match sooty bark.',
        correction: 'Pinned Moth #7 keeps its exact shade (0.26) across generations while the population mean shifts; selection sorts individuals, populations evolve.',
      },
      {
        misconception: 'Acquired traits (like soot-stained wings) are inherited by offspring.',
        correction: 'Page 2’s Acquired Stain (h² = 0) counterfactual shows survivors look paler, yet offspring snap straight back to the parent mean.',
      },
      {
        misconception: 'Natural selection always finds the single best global adaptation.',
        correction: 'Page 5 shows Population A climbing deterministically onto a suboptimal local peak because selection has zero foresight.',
      },
      {
        misconception: 'Kettlewell’s peppered moth story was debunked.',
        correction: 'Michael Majerus’s 6-year Cambridge field study (4,864 naturally resting moths, Cook et al. 2012) and Van’t Hof et al. (2016) cortex TE mapping strongly confirm differential bird predation.',
      },
    ],
    discussionPrompts: [
      'Why does Page 1 show 120 eggs culled down to 18 adults every generation? What happens to Darwin’s mechanism if every egg survives?',
      'Under the 1956 Clean Air Act, why did dominant carbonaria drop rapidly right away instead of lingering for centuries?',
      'Why does Gavrilets argue that real high-dimensional genotype spaces may have “holey” neutral ridges rather than isolated 2D peaks?',
    ],
    activityTip:
      'Ask students to click 5 dark moths themselves on Page 1 before using “Bird Forage Round”, then click “Acquired Stain (h² = 0)” on Page 2 to see the regression beam drop flat!',
  },

  scienceCard: {
    coreTakeaway:
      'Natural selection acts on individuals with heritable variation (R = h²S), follows dominance asymmetry at Mendelian loci, reshapes trait variances, and climbs local fitness gradients without foresight.',
    assumptions: [
      {
        label: 'Breeder’s equation & narrow-sense heritability',
        status: 'realistic',
        tag: 'Falconer & Mackay',
        detail: 'Pages 1–2 apply R = h²S with additive heritability h² = V_A / V_P and Gaussian offspring breeding values around μ + R.',
      },
      {
        label: 'Single-locus cortex dominance (Biston betularia)',
        status: 'realistic',
        tag: 'Van’t Hof 2016',
        detail: 'Page 3 models exact diploid viability selection at the cortex transposable-element locus assuming random mating and large N.',
      },
      {
        label: 'Constant segregating-variance breeding kernel',
        status: 'simplified',
        tag: 'Continuous trait',
        detail: 'Page 4 combines viability selection with a fixed Gaussian recombination kernel so stabilizing & disruptive modes remain smooth.',
      },
      {
        label: '2D Sewall Wright adaptive surface',
        status: 'contested',
        tag: 'Dimensionality',
        detail: 'Real genotype-to-fitness maps span thousands of dimensions where neutral ridges (“holey landscapes”, Gavrilets 2004) can bypass 2D valleys.',
      },
    ],
    contestedNotes: [
      'Kettlewell’s 1950s experiments were criticized for placing moths on exposed lower trunks, but Majerus’s 2001–2007 natural resting study (4,864 moths, Cook et al. 2012) confirmed strong differential bird predation.',
      'Real British carbonaria frequencies also reflect migration/gene flow between industrial and rural woodlands (Haldane 1924; Cook 2003).',
    ],
    citations: [
      {
        authors: 'Falconer, D. S. & Mackay, T. F. C.',
        year: 1996,
        title: 'Introduction to Quantitative Genetics (4th ed.)',
        journal: 'Longman',
      },
      {
        authors: 'Kettlewell, H. B. D.',
        year: 1955,
        title: 'Selection experiments on industrial melanism in the Lepidoptera',
        journal: 'Heredity 9: 323–342',
      },
      {
        authors: 'Cook, L. M., Grant, B. S., Saccheri, I. J. & Mallet, J.',
        year: 2012,
        title: 'Selective bird predation on the peppered moth: the last experiment of Michael Majerus',
        journal: 'Biology Letters 8: 609–612',
      },
      {
        authors: 'Van’t Hof, A. E. et al.',
        year: 2016,
        title: 'The industrial melanism mutation in British peppered moths is a transposable element',
        journal: 'Nature 534: 102–105',
      },
      {
        authors: 'Wright, S.',
        year: 1932,
        title: 'The roles of mutation, inbreeding, crossbreeding and selection in evolution',
        journal: 'Proc. 6th Int. Congress of Genetics 1: 356–366',
      },
      {
        authors: 'Gavrilets, S.',
        year: 2004,
        title: 'Fitness Landscapes and the Origin of Species',
        journal: 'Princeton University Press',
      },
    ],
    standards: {
      undergrad: [
        'Darwinian natural selection: overproduction, heritable variation & differential survival',
        'Quantitative genetics: Breeder’s equation R = h²S, selection differential & heritability',
        'Single-locus dominance asymmetry (industrial melanism) & modes of selection on variance',
        'Adaptive topography: Sewall Wright’s fitness landscapes, local peaks & environmental shifts',
      ],
      apOrALevel: [
        'AP Biology EVO-1.C / EVO-1.E: Natural selection, phenotypic variation & industrial melanism',
        'UK A-Level Biology: Directional, stabilizing & disruptive selection; Hardy–Weinberg & selection',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <div class="plate-caption-pill">
          <span class="plate-caption-text" data-lic-caption>Silver Birch Bark — forage moths</span>
          <span class="plate-scale-bar">
            <span data-lic-tag>Gen 0 · Mean 0.48</span>
          </span>
        </div>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" type="button" data-lic-reset>Reset 3D</button>
        </div>
      </div>
      <div class="plate-canvas-host" data-lic-canvas></div>
      <div class="hwe-plate-legend" data-lic-legend></div>
      <div class="plate-orbit-hint" style="bottom:18px;">Drag to orbit 3D · Scroll to zoom</div>
    `;

    const captionEl = plateStageEl.querySelector<HTMLElement>('[data-lic-caption]')!;
    const tagEl = plateStageEl.querySelector<HTMLElement>('[data-lic-tag]')!;
    const legendEl = plateStageEl.querySelector<HTMLElement>('[data-lic-legend]')!;
    const canvasHost = plateStageEl.querySelector<HTMLElement>('[data-lic-canvas]')!;

    // -------------------------------------------------------------------------
    // CHAPTER STATE
    // -------------------------------------------------------------------------
    let activeStep = 0;

    // Page 1 state
    const barkShade = 0.82;
    let p1Gen = 0;
    let p1Moths: MothSpecimen[] = createInitialWood(301);
    let p1LastNote = 'Click dark moths on the 3D bark (or run a Bird Forage Round) to begin.';
    let p1Seed = 500;

    // Page 2 state
    let p2Scenario: BreederScenarioId = 'standard';
    let p2H2 = 0.75;
    const p2Cutoff = 54;

    // Page 3 state
    let p3Era: MelanismEra = 'soot_1895';
    let p3Dominance: DominanceMode = 'dominant';
    let p3GeneLens = true;
    let p3Gen = 0;
    let p3P = 0.08;
    let p3Geno: [number, number, number] = [0.0064, 0.1472, 0.8464];

    // Page 4 state
    let p4State = createInitialModeState('stabilizing');

    // Page 5 state
    let p5Shifted = false;
    let p5Drift = false;
    let p5Step = 0;
    let p5PopA: LandscapePop = { x: -1.68, z: 0.66, trail: [[-1.68, 0.66]] };
    let p5PopB: LandscapePop = { x: 0.56, z: 0.72, trail: [[0.56, 0.72]] };

    // Page 6 state
    let p6Idx = 0;
    let p6Done = false;
    const p6Answered: Record<string, { choice: string; correct: boolean }> = {};

    // Handle direct 3D moth clicks on Page 1
    const handleMothClick = (id: number) => {
      if (activeStep !== 0) return;
      const target = p1Moths.find((m) => m.id === id);
      if (!target || !target.alive) return;
      if (target.pinned) {
        p1LastNote =
          'Pinned Moth #7 is our tracked individual (shade 0.26) — we leave it alive to verify its wings never transform!';
        renderLeftControls();
        return;
      }
      scene3d.spawnPeckPuff(id);
      target.alive = false;
      p1LastNote = `Foraged moth #${id + 1} (shade ${target.shade.toFixed(2)}). ${p1Moths.filter((m) => m.alive).length}/18 remain on bark.`;
      scene3d.updateWoodMoths(p1Moths);
      renderLeftControls();
      updateHeaderAndLegend();
    };

    const scene3d = new LichenScene3D(canvasHost, handleMothClick);
    plateStageEl.querySelector('[data-lic-reset]')!.addEventListener('click', () => scene3d.resetView());

    // -------------------------------------------------------------------------
    // SYNC 3D & HEADER/LEGEND
    // -------------------------------------------------------------------------
    const updateHeaderAndLegend = () => {
      if (activeStep === 0) {
        const popM = meanShade(p1Moths, true);
        captionEl.textContent = 'Silver Birch Bark — forage moths';
        tagEl.textContent = `Gen ${p1Gen} · Mean ${popM.toFixed(2)} · Pinned 0.26`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f694e"></i>Population mean</span>
          <span><i class="hwe-dot" style="background:#b83428"></i>Pinned Moth #7 (fixed 0.26)</span>
        `;
      } else if (activeStep === 1) {
        const res = computeBreederEquation(p2Scenario, p2H2, p2Cutoff);
        captionEl.textContent = '3D Breeder’s Equation — R = h²S';
        tagEl.textContent = `h² = ${res.h2.toFixed(2)} · R = ${res.R >= 0 ? '+' : ''}${res.R.toFixed(1)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#8a7f6d"></i>Parents (back)</span>
          <span><i class="hwe-dot" style="background:#3b7b63"></i>Offspring (front)</span>
          <span><i class="hwe-dot" style="background:#c97828"></i>Cutoff / h² beam</span>
        `;
      } else if (activeStep === 2) {
        const info = eraFitnesses(p3Era);
        captionEl.textContent = info.label;
        tagEl.textContent = `Gen ${p3Gen} · p(C) = ${(p3P * 100).toFixed(0)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#263959"></i>Dark allele (C)</span>
          <span><i class="hwe-dot" style="background:#e8b948"></i>Pale allele (c)</span>
        `;
      } else if (activeStep === 3) {
        const modeTitle =
          p4State.mode === 'directional'
            ? 'Directional Selection'
            : p4State.mode === 'stabilizing'
              ? 'Stabilizing Selection'
              : 'Disruptive Selection';
        captionEl.textContent = `${modeTitle} — 3D Trait & Fitness Arch`;
        tagEl.textContent = `Gen ${p4State.gen} · σ² = ${p4State.variance.toFixed(3)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3d8a74"></i>Trait distribution</span>
          <span><i class="hwe-dot" style="background:#d99b26"></i>Fitness arch W(z)</span>
        `;
      } else if (activeStep === 4) {
        captionEl.textContent = p5Shifted
          ? 'Sewall Wright Landscape — Shifted Terrain'
          : 'Sewall Wright 3D Adaptive Landscape';
        tagEl.textContent = `Step ${p5Step} · ${p5Drift ? 'Selection + Drift' : 'Pure Selection'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c2382b"></i>Pop A (local climber)</span>
          <span><i class="hwe-dot" style="background:#2b5fd1"></i>Pop B (global climber)</span>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        captionEl.textContent = `Natural Selection Check — Case ${p6Idx + 1} of 3`;
        tagEl.textContent = `Score ${score}/3`;
        legendEl.innerHTML =
          p6Idx === 0
            ? `<span><i class="hwe-dot" style="background:#b83428"></i>Pinned Moth #7 (fixed 0.26)</span>`
            : p6Idx === 1
              ? `<span><i class="hwe-dot" style="background:#263959"></i>C allele</span><span><i class="hwe-dot" style="background:#e8b948"></i>c allele</span>`
              : `<span><i class="hwe-dot" style="background:#c2382b"></i>Pop A</span><span><i class="hwe-dot" style="background:#2b5fd1"></i>Pop B</span>`;
      }
    };

    const sync3DForActiveStep = () => {
      if (activeStep === 0) {
        scene3d.updateWoodMoths(p1Moths);
      } else if (activeStep === 1) {
        const res = computeBreederEquation(p2Scenario, p2H2, p2Cutoff);
        scene3d.updateBreederScene(
          res.parentBins,
          res.offspringBins,
          p2Cutoff,
          res.h2,
          p2Scenario !== 'random' && p2Scenario !== 'no_var'
        );
      } else if (activeStep === 2) {
        scene3d.updateSootGrove(p3Era, p3Geno, p3Dominance, p3GeneLens);
      } else if (activeStep === 3) {
        scene3d.updateModesScene(p4State.bins, p4State.fitness);
      } else if (activeStep === 4) {
        scene3d.updateLandscapeScene(p5PopA, p5PopB, p5Shifted);
      } else {
        scene3d.setCheckCaseBackdrop(p6Idx);
      }
      updateHeaderAndLegend();
    };

    // -------------------------------------------------------------------------
    // LEFT CONTROLS RENDERER (AtlasShell renders step header/body/rail)
    // -------------------------------------------------------------------------
    const renderLeftControls = () => {
      let controlsHtml = '';

      if (activeStep === 0) {
        const aliveList = p1Moths.filter((m) => m.alive);
        const popMean = meanShade(p1Moths, false);
        const survMean = meanShade(p1Moths, true);
        const eaten = p1Moths.length - aliveList.length;

        controlsHtml = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">LICHEN WOOD CENSUS (GEN ${p1Gen})</span>
              <span class="hwe-stat-badge">${aliveList.length}/18 alive · ${eaten} eaten</span>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Bark shade</span>
                <span class="lic-stat-val">${barkShade.toFixed(2)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Pop mean</span>
                <span class="lic-stat-val is-accent">${survMean.toFixed(2)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Pinned #7</span>
                <span class="lic-stat-val is-crimson">${PINNED_MOTH_SHADE.toFixed(2)}</span>
              </div>
            </div>
            <div class="lic-shade-bar" title="Wing shade scale (dark → pale)">
              <div class="lic-shade-marker is-pinned" style="left:${(PINNED_MOTH_SHADE * 100).toFixed(0)}%"></div>
              <div class="lic-shade-marker is-pop" style="left:${(survMean * 100).toFixed(0)}%"></div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p1-forage>Bird Forage Round</button>
              <button class="lic-btn" type="button" data-p1-breed>Breed Survivors (120→18)</button>
              <button class="lic-btn" type="button" data-p1-reset>Reset</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Selection diff S = ${(survMean - popMean) >= 0 ? '+' : ''}${(survMean - popMean).toFixed(2)} · Pinned #7 stays 0.26</div>
            <p class="lic-formula-note">${p1LastNote}</p>
          </div>
        `;
      } else if (activeStep === 1) {
        const res = computeBreederEquation(p2Scenario, p2H2, p2Cutoff);
        controlsHtml = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">DARWIN’S COUNTERFACTUALS</span>
              <span class="hwe-stat-badge">R = h² · S</span>
            </div>
            <div class="lic-mode-grid">
              <button class="lic-pill-btn ${p2Scenario === 'standard' ? 'is-active' : ''}" type="button" data-b-scen="standard">Heritable Selection</button>
              <button class="lic-pill-btn ${p2Scenario === 'no_var' ? 'is-active' : ''}" type="button" data-b-scen="no_var">No Variation (σ=0)</button>
              <button class="lic-pill-btn ${p2Scenario === 'no_herit' ? 'is-active' : ''}" type="button" data-b-scen="no_herit">Acquired Stain (h²=0)</button>
              <button class="lic-pill-btn ${p2Scenario === 'random' ? 'is-active' : ''}" type="button" data-b-scen="random">Random Predation</button>
            </div>
            <div class="lic-slider-wrap">
              <div class="lic-slider-head">
                <span>HERITABILITY h² = ${res.h2.toFixed(2)}</span>
                <span>CUTOFF = ${p2Cutoff}</span>
              </div>
              <input class="lic-range" type="range" min="0" max="0.95" step="0.05" value="${p2H2}" data-b-h2 ${p2Scenario === 'no_herit' ? 'disabled' : ''} />
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Diff (S)</span>
                <span class="lic-stat-val">${res.S >= 0 ? '+' : ''}${res.S.toFixed(1)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Slope (h²)</span>
                <span class="lic-stat-val">${res.h2.toFixed(2)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Response (R)</span>
                <span class="lic-stat-val is-accent">${res.R >= 0 ? '+' : ''}${res.R.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">R = (${res.h2.toFixed(2)}) × (${res.S.toFixed(1)}) = ${res.R >= 0 ? '+' : ''}${res.R.toFixed(1)} shade units</div>
            <p class="lic-formula-note">${res.headline}</p>
          </div>
        `;
      } else if (activeStep === 2) {
        const trajDom = simulateMelanismTrajectory(p3P, p3Era, 'dominant', 28);
        const trajRec = simulateMelanismTrajectory(p3P, p3Era, 'recessive', 28);
        const toPoly = (arr: number[]) =>
          arr.map((v, i) => `${((i / (arr.length - 1)) * 270 + 10).toFixed(1)},${(58 - v * 46).toFixed(1)}`).join(' ');
        const darkPheno = p3Dominance === 'dominant' ? p3Geno[0] + p3Geno[1] : p3Geno[0];

        controlsHtml = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">INDUSTRIAL ERA & DOMINANCE</span>
              <span class="hwe-stat-badge">Gen ${p3Gen}</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p3Era === 'lichen_1848' ? 'is-active' : ''}" type="button" data-era="lichen_1848">1848 Lichen</button>
              <button class="lic-pill-btn ${p3Era === 'soot_1895' ? 'is-active' : ''}" type="button" data-era="soot_1895">1895 Soot</button>
              <button class="lic-pill-btn ${p3Era === 'clean_1970' ? 'is-active' : ''}" type="button" data-era="clean_1970">1970 Clean Air</button>
            </div>
            <div class="lic-toggle-row">
              <div class="lic-btn-row">
                <button class="lic-pill-btn ${p3Dominance === 'dominant' ? 'is-active' : ''}" type="button" data-dom="dominant">Dominant C</button>
                <button class="lic-pill-btn ${p3Dominance === 'recessive' ? 'is-active' : ''}" type="button" data-dom="recessive">Recessive</button>
              </div>
              <button class="lic-pill-btn ${p3GeneLens ? 'is-active' : ''}" type="button" data-lens>Gene-Pool Lens: ${p3GeneLens ? 'ON' : 'OFF'}</button>
            </div>
            <div class="lic-spark-box">
              <svg viewBox="0 0 290 66" aria-label="Dominant vs recessive melanism trajectory">
                <line x1="10" y1="58" x2="280" y2="58" stroke="#cbbda7" stroke-width="1" />
                <polyline fill="none" stroke="#263959" stroke-width="2.4" points="${toPoly(trajDom)}" />
                <polyline fill="none" stroke="#c27a24" stroke-width="2" stroke-dasharray="4 3" points="${toPoly(trajRec)}" />
                <text x="12" y="10" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="#263959">Solid: Dominant C · Dashed: Recessive</text>
              </svg>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p3-step>Evolve +5 Generations →</button>
              <button class="lic-btn" type="button" data-p3-reset>Reset</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">CC ${(p3Geno[0] * 100).toFixed(0)}% · Cc ${(p3Geno[1] * 100).toFixed(0)}% · cc ${(p3Geno[2] * 100).toFixed(0)}% → ${(darkPheno * 100).toFixed(0)}% dark</div>
            <p class="lic-formula-note">Even under heavy soot, pale c alleles hide inside dark Cc heterozygotes—fuelling rapid recovery after the 1956 Clean Air Act.</p>
          </div>
        `;
      } else if (activeStep === 3) {
        controlsHtml = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">SELECTION REGIME</span>
              <span class="hwe-stat-badge">Gen ${p4State.gen}</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p4State.mode === 'directional' ? 'is-active' : ''}" type="button" data-smode="directional">Directional</button>
              <button class="lic-pill-btn ${p4State.mode === 'stabilizing' ? 'is-active' : ''}" type="button" data-smode="stabilizing">Stabilizing</button>
              <button class="lic-pill-btn ${p4State.mode === 'disruptive' ? 'is-active' : ''}" type="button" data-smode="disruptive">Disruptive</button>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Mean (z̄)</span>
                <span class="lic-stat-val">${p4State.mean.toFixed(2)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Variance (σ²)</span>
                <span class="lic-stat-val is-accent">${p4State.variance.toFixed(3)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Shape</span>
                <span class="lic-stat-val">${p4State.mode === 'disruptive' && p4State.gen >= 4 ? 'Bimodal' : p4State.mode === 'stabilizing' && p4State.gen >= 4 ? 'Narrow' : 'Unimodal'}</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p4-step>Evolve +4 Generations →</button>
              <button class="lic-btn" type="button" data-p4-reset>Reset Bell Curve</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">${
              p4State.mode === 'directional'
                ? 'Directional: mean shifts uphill (Δz̄ > 0)'
                : p4State.mode === 'stabilizing'
                  ? 'Stabilizing: mean holds steady, variance shrinks (Δσ² < 0)'
                  : 'Disruptive: fitness valley splits variance into 2 peaks (Δσ² > 0)'
            }</div>
            <p class="lic-formula-note">${
              p4State.mode === 'directional'
                ? 'One extreme has highest fitness (like industrial melanism or antibiotic resistance).'
                : p4State.mode === 'stabilizing'
                  ? 'Intermediate traits win (classic examples: avian clutch size, mammalian birth weight).'
                  : 'Both extremes outcompete intermediates (e.g. African black-bellied seedcrackers, Pyrenestes).'
            }</p>
          </div>
        `;
      } else if (activeStep === 4) {
        const popAOnGlobal = p5PopA.x > 0.45;
        controlsHtml = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">ADAPTIVE TOPOGRAPHY</span>
              <span class="lic-badge ${popAOnGlobal ? '' : 'is-warn'}">${popAOnGlobal ? 'Pop A reached Global Peak ✓' : 'Pop A on Local Slope'}</span>
            </div>
            <div class="lic-mode-grid">
              <button class="lic-pill-btn ${p5Shifted ? 'is-active' : ''}" type="button" data-p5-shift>Environmental Shift: ${p5Shifted ? 'ON' : 'OFF'}</button>
              <button class="lic-pill-btn ${p5Drift ? 'is-active' : ''}" type="button" data-p5-drift>Genetic Drift: ${p5Drift ? 'ON' : 'OFF'}</button>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p5-step>Climb +4 Steps →</button>
              <button class="lic-btn" type="button" data-p5-reset>Reset Climbers</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Δz̄ ∝ ∇W(z̄) — selection climbs local fitness gradients</div>
            <p class="lic-formula-note">${
              p5Shifted
                ? 'Shifting climate/ecology deforms the adaptive surface, opening an uphill ridge from the old local summit to the global peak!'
                : 'Notice Population A stalls on the lower ochre peak: pure selection has zero foresight to cross a maladaptive valley.'
            }</p>
          </div>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        if (p6Done) {
          controlsHtml = `
            <div class="hwe-card">
              <div class="hwe-card-head">
                <span class="hwe-kicker">PLATE 3 COMPLETE</span>
                <span class="hwe-stat-badge">${score}/${CHECK_CASES.length}</span>
              </div>
              <p style="margin:0;font-size:13.5px;line-height:1.5;color:var(--ink);">
                <strong>Stamped!</strong> You’ve mastered R = h²S, dominance asymmetry in industrial melanism, and myopic hill-climbing on Sewall Wright’s adaptive landscape.
              </p>
              <button class="lic-btn" type="button" data-check-retry>Review Cases Again</button>
            </div>
          `;
        } else {
          const c = CHECK_CASES[p6Idx];
          const ans = p6Answered[c.id];
          controlsHtml = `
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
              ${
                ans
                  ? `<div class="check-feedback ${ans.correct ? 'good' : ''}">${c.explanation}</div>`
                  : ''
              }
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

      leftPanelEl.innerHTML = `<div class="lic-controls-wrap">${controlsHtml}</div>`;

      // Bind Page 1 controls
      leftPanelEl.querySelector('[data-p1-forage]')?.addEventListener('click', () => {
        p1Seed += 17;
        const { updated, eatenIds } = runBirdForage(p1Moths, barkShade, 6, p1Seed);
        eatenIds.forEach((id) => scene3d.spawnPeckPuff(id));
        p1Moths = updated;
        p1LastNote = `Bird predator picked ${eatenIds.length} conspicuous dark moths! Notice Pinned Moth #7 stayed 0.26.`;
        scene3d.updateWoodMoths(p1Moths);
        renderLeftControls();
        updateHeaderAndLegend();
      });
      leftPanelEl.querySelector('[data-p1-breed]')?.addEventListener('click', () => {
        const res = breedNextWoodGeneration(p1Moths, p1Gen, barkShade, 0.78, 707);
        p1Moths = res.nextMoths;
        p1Gen = res.summary.gen;
        p1LastNote = `120 eggs culled to 18 adults! Population mean shifted by R = +${res.summary.responseR.toFixed(2)}, while Pinned #7 stayed 0.26.`;
        scene3d.pulseEggTray();
        scene3d.updateWoodMoths(p1Moths);
        renderLeftControls();
        updateHeaderAndLegend();
      });
      leftPanelEl.querySelector('[data-p1-reset]')?.addEventListener('click', () => {
        p1Gen = 0;
        p1Moths = createInitialWood(301);
        p1LastNote = 'Reset Lichen Wood to Gen 0.';
        scene3d.updateWoodMoths(p1Moths);
        renderLeftControls();
        updateHeaderAndLegend();
      });

      // Bind Page 2 controls
      leftPanelEl.querySelectorAll<HTMLElement>('[data-b-scen]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p2Scenario = btn.dataset.bScen as BreederScenarioId;
          sync3DForActiveStep();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector<HTMLInputElement>('[data-b-h2]')?.addEventListener('input', (e) => {
        p2H2 = Number((e.target as HTMLInputElement).value);
        sync3DForActiveStep();
        renderLeftControls();
      });

      // Bind Page 3 controls
      leftPanelEl.querySelectorAll<HTMLElement>('[data-era]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p3Era = btn.dataset.era as MelanismEra;
          sync3DForActiveStep();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelectorAll<HTMLElement>('[data-dom]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p3Dominance = btn.dataset.dom as DominanceMode;
          sync3DForActiveStep();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector('[data-lens]')?.addEventListener('click', () => {
        p3GeneLens = !p3GeneLens;
        sync3DForActiveStep();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p3-step]')?.addEventListener('click', () => {
        for (let k = 0; k < 5; k++) {
          const out = stepMelanismOneGen(p3P, p3Era, p3Dominance);
          p3P = out.nextP;
          p3Geno = out.geno;
          p3Gen += 1;
        }
        sync3DForActiveStep();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p3-reset]')?.addEventListener('click', () => {
        p3Gen = 0;
        p3P = p3Era === 'clean_1970' ? 0.85 : 0.08;
        const q = 1 - p3P;
        p3Geno = [p3P * p3P, 2 * p3P * q, q * q];
        sync3DForActiveStep();
        renderLeftControls();
      });

      // Bind Page 4 controls
      leftPanelEl.querySelectorAll<HTMLElement>('[data-smode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p4State = createInitialModeState(btn.dataset.smode as SelectionModeId);
          sync3DForActiveStep();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector('[data-p4-step]')?.addEventListener('click', () => {
        p4State = stepSelectionMode(p4State, 4);
        sync3DForActiveStep();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p4-reset]')?.addEventListener('click', () => {
        p4State = createInitialModeState(p4State.mode);
        sync3DForActiveStep();
        renderLeftControls();
      });

      // Bind Page 5 controls
      leftPanelEl.querySelector('[data-p5-shift]')?.addEventListener('click', () => {
        p5Shifted = !p5Shifted;
        sync3DForActiveStep();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p5-drift]')?.addEventListener('click', () => {
        p5Drift = !p5Drift;
        updateHeaderAndLegend();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p5-step]')?.addEventListener('click', () => {
        for (let k = 0; k < 4; k++) {
          p5Step += 1;
          p5PopA = stepLandscapePopulation(p5PopA, p5Shifted, p5Drift ? 1.0 : 0, 100 + p5Step * 13);
          p5PopB = stepLandscapePopulation(p5PopB, p5Shifted, p5Drift ? 0.45 : 0, 200 + p5Step * 17);
        }
        sync3DForActiveStep();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p5-reset]')?.addEventListener('click', () => {
        p5Step = 0;
        p5Shifted = false;
        p5PopA = { x: -1.68, z: 0.66, trail: [[-1.68, 0.66]] };
        p5PopB = { x: 0.56, z: 0.72, trail: [[0.56, 0.72]] };
        sync3DForActiveStep();
        renderLeftControls();
      });

      // Bind Page 6 Check
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
          ctx.completeChapter('lichen', score, CHECK_CASES.length);
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
      activeStep = Math.max(0, Math.min(CH03_LICHEN.steps.length - 1, stepIndex));
      scene3d.setPage(PAGE_IDS[activeStep]);
      sync3DForActiveStep();
      renderLeftControls();
    };

    return {
      onStepChange,
      onResize: () => scene3d.resize(),
      destroy: () => scene3d.dispose(),
    };
  },
};
