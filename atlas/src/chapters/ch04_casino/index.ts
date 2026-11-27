// =============================================================================
// Chapter 4: Drift Casino — Genetic Drift, Effective Size (Ne), Bottlenecks,
// Drift vs. Selection (4Nes) & 3D Kingman Coalescent Trees
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  buildCoalescentTree,
  computeBuriAndNe,
  createInitialJars,
  expectedHeterozygosity,
  runVolcanoBottleneck,
  simulateDriftVsSelection,
  stepJarsWrightFisher,
  type CoalescentRegime,
  type JarState,
} from './casinoMath';
import { CasinoScene3D, type CasinoPageId } from './CasinoScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'casino')!;

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
    id: 'dc1-fixprob',
    prompt:
      'In a neutral Wright–Fisher population of N = 25 diploids, allele A begins at frequency p₀ = 0.20 (s = 0). What is the probability that allele A eventually fixes purely by genetic drift?',
    options: [
      { id: 'a', label: '0.20 — for a strictly neutral allele, P(fix) equals its starting frequency p₀.', correct: true },
      { id: 'b', label: '0.50 — drift gives both alleles an equal 50/50 coin flip regardless of p₀.', correct: false },
      { id: 'c', label: '0.20 even when selection strongly favours A (s = +0.10).', correct: false },
    ],
    explanation:
      'Correct! Under pure neutrality (s = 0), every gene copy is equally likely to be the eventual ancestor of the future population, so P(fix) = p₀. Under selection, Kimura’s formula replaces p₀.',
  },
  {
    id: 'dc2-ne',
    prompt:
      'An island seal colony has census size N = 20 breeding adults: 1 dominant harem bull and 19 females. Using Ne = 4·Nm·Nf / (Nm + Nf), what is the effective population size Ne?',
    options: [
      { id: 'a', label: 'Ne = 20 — census size always equals effective size.', correct: false },
      { id: 'b', label: 'Ne = 10 — halfway between 1 and 19.', correct: false },
      { id: 'c', label: 'Ne = 3.8 — the rare sex acts as a severe genetic bottleneck every generation.', correct: true },
    ],
    explanation:
      'Correct! 4 × 1 × 19 / 20 = 3.8. Because half of all autosomal alleles in the next generation must pass through that single bull, the colony drifts like an ideal population of fewer than 4 seals!',
  },
  {
    id: 'dc3-coalescent',
    prompt:
      'Sequencing 8 gene copies across many unlinked neutral loci reveals star-like coalescent trees with long external branches, an excess of rare singleton mutations, and genome-wide Tajima’s D = −1.5. Which demographic history best explains this?',
    options: [
      { id: 'a', label: 'Recent rapid population expansion (exponential growth).', correct: true },
      { id: 'b', label: 'A severe recent bottleneck that pruned rare alleles.', correct: false },
      { id: 'c', label: 'A single-locus selective sweep (which affects only one linked chromosomal region).', correct: false },
    ],
    explanation:
      'Correct! Rapid expansion leaves long external branches packed with rare singletons (Tajima’s D < 0) across the entire genome—whereas a hard selective sweep creates that signature only around the selected locus.',
  },
];

const PAGE_IDS: CasinoPageId[] = ['jars', 'buri', 'volcano', 'tug', 'coalescent', 'check'];

export const CH04_CASINO: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'jars',
      shortLabel: '1 Jars',
      eyebrow: 'WRIGHT–FISHER SAMPLING · NEUTRAL DRIFT',
      heading: 'Six crystal jars of chance',
      bodyHtml: `Even with zero selection, finite populations suffer random sampling error each generation—${gloss('genetic_drift', 'genetic drift')}. Evolve six parallel jars side-by-side at <strong>N = 10</strong> versus <strong>N = 200</strong> and test why neutral fixation probability equals starting frequency (<strong>P(fix) = p₀</strong>).`,
      promptHint: 'Compare Small N = 10 vs. Large N = 200 and evolve generations to watch jars fix (blue/gold halo).',
    },
    {
      id: 'buri',
      shortLabel: '2 Buri & Ne',
      eyebrow: 'EFFECTIVE POPULATION SIZE · BURI (1956)',
      heading: 'Why census N fools you',
      bodyHtml: `In Peter Buri’s classic 107 <em>Drosophila</em> bottles, 16 flies bred per vial—yet unequal reproductive success made them drift as if only <strong>Ne ≈ 11.5</strong> bred! Adjust the harem sex ratio to watch ${gloss('effective_population_size', 'effective size (Ne)')} plunge below census count <strong>N</strong>.`,
      promptHint: 'Slide the number of breeding males (out of N = 20) from 10 down to 1 to watch the 3D Ne pillar collapse.',
    },
    {
      id: 'volcano',
      shortLabel: '3 Volcano',
      eyebrow: 'BOTTLENECKS · ALLELIC RICHNESS VS. HETEROZYGOSITY',
      heading: 'Rare jewels vanish first',
      bodyHtml: `When a volcanic eruption or island ${gloss('bottleneck_founder', 'bottleneck')} squeezes a 12-allele population down to <strong>Nb</strong> survivors, rare jewel alleles disappear in a single generation while heterozygosity falls much more slowly—and long-term <strong>Ne</strong> obeys the harmonic mean.`,
      promptHint: 'Choose bottleneck size (Nb = 4, 10, or 40) and click “Trigger Bottleneck!” to count surviving jewel alleles.',
    },
    {
      id: 'tug',
      shortLabel: '4 4Ne·s',
      eyebrow: 'DRIFT VS. SELECTION · KIMURA (1962)',
      heading: 'When chance beats adaptation',
      bodyHtml: `Does natural selection always save a beneficial mutation? Only when ${gloss('nearly_neutral', '|4Ne·s| ≫ 1')}! Test a beneficial allele (<strong>s = +0.04</strong>) on a tiny island versus a large mainland and watch Kimura’s exact fixation pillar rise.`,
      promptHint: 'Toggle Island (Ne = 12) vs. Mainland (Ne = 250) and adjust selection s to watch beneficial runs get lost by drift.',
    },
    {
      id: 'coalescent',
      shortLabel: '5 Coalescent',
      eyebrow: 'KINGMAN’S COALESCENT · READING GENEALOGIES',
      heading: 'Running time backwards in 3D',
      bodyHtml: `Forward-time drift has a backward-time mirror: ${gloss('coalescent', 'Kingman’s coalescent')}. Trace 8 sampled gene copies upwards until they fuse at the <strong>MRCA</strong>, studded with crimson mutations, and read demographic history from ${gloss('tajimas_d', 'Tajima’s D')}.`,
      promptHint: 'Switch between Constant Size, Rapid Expansion (star tree), and Recent Bottleneck (pinch ring).',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'DRIFT, Ne & COALESCENT MASTERY',
      heading: 'Diagnose stochastic evolution',
      bodyHtml: `Test your command of neutral fixation probability, effective population size, and coalescent demographic signatures across three undergraduate problems.`,
      promptHint: 'Complete all three challenges to stamp Plate 4 in your Atlas progress map.',
    },
  ],

  teacherGuide: {
    estimatedMinutes: 25,
    level: 'Undergraduate Biology (Years 1–3) · Population Genetics & Coalescent Theory',
    learningObjectives: [
      'Quantify how sampling variance Var(Δp) = p(1−p)/(2N) drives faster fixation/loss and heterozygosity decay in small populations.',
      'Distinguish neutral fixation probability P(fix) = p₀ (s = 0 only!) from Kimura’s fixation probability under selection.',
      'Calculate effective population size Ne under skewed sex ratios (4NmNf/(Nm+Nf)) and fluctuating population sizes (harmonic mean), and cite Buri (1956).',
      'Explain why bottlenecks slash allelic richness far more severely than heterozygosity (Nei et al. 1975).',
      'Use the |4Ne·s| threshold to identify effectively neutral alleles and read population growth vs. bottlenecks from coalescent tree shapes and Tajima’s D.',
    ],
    commonMisconceptions: [
      {
        misconception: 'P(fix) = p₀ applies even when selection is acting.',
        correction: 'P(fix) = p₀ holds ONLY for strictly neutral alleles (s = 0). Under selection, Kimura’s formula P(fix) = (1 − e^(−4Ne·s·p₀)) / (1 − e^(−4Ne·s)) governs fixation.',
      },
      {
        misconception: 'A bottleneck removes most heterozygosity immediately.',
        correction: 'A single generation of Nb = 4 still retains 1 − 1/(2×4) = 87.5% of heterozygosity, yet destroys ~60% of rare alleles (allelic richness)!',
      },
      {
        misconception: 'Beneficial alleles always spread to 100% once they arise.',
        correction: 'In small populations (4Ne·s ~ 1), random sampling frequently wipes out beneficial mutations (and occasionally fixes mildly deleterious ones).',
      },
      {
        misconception: 'A star-like tree with Tajima’s D < 0 always means population expansion.',
        correction: 'A hard selective sweep produces the same star-like tree at ONE linked locus; demographic expansion creates it genome-wide across unlinked loci.',
      },
    ],
    discussionPrompts: [
      'Why did Buri’s 107 Drosophila vials with N = 16 flies drift faster than a theoretical Wright–Fisher N = 16 jar?',
      'If a conservation reserve maintains 500 individuals for four years and crashes to 4 individuals for one drought year, why is its 5-year Ne only 19.4 instead of ~400?',
      'How can genomicists distinguish a recent human population expansion from a selective sweep around a single gene like LCT?',
    ],
    activityTip:
      'On Page 2, drag males from 10 down to 1 while pointing out that census N stays 20 the entire time—students immediately grasp why Ne governs drift, not headcount.',
  },

  scienceCard: {
    coreTakeaway:
      'Genetic drift is sampling variance scaled by effective size Ne (not census N): it strips rare alleles during bottlenecks, overpowers selection when |4Ne·s| ≲ 1, and leaves readable demographic footprints in coalescent gene trees.',
    assumptions: [
      {
        label: 'Discrete-generation binomial Wright–Fisher sampling',
        status: 'realistic',
        tag: 'Wright 1931',
        detail: 'Pages 1 & 4 sample 2N alleles binomially each generation assuming non-overlapping generations and random mating.',
      },
      {
        label: 'Buri (1956) Drosophila empirical drift variance',
        status: 'realistic',
        tag: 'Real experiment',
        detail: 'Page 2 compares ideal N = 16 (2N = 32) against Buri’s measured Ne ≈ 11.5 across 107 replicate bw75/bw populations.',
      },
      {
        label: 'Kimura (1962) diffusion fixation probability',
        status: 'realistic',
        tag: '4Ne·s rule',
        detail: 'Page 4 computes exact diffusion P(fix) for additive alleles with fitnesses 1 + s, 1 + s/2, 1.',
      },
      {
        label: 'Adjacent-pair 3D coalescent layout',
        status: 'simplified',
        tag: 'Visual topology',
        detail: 'Page 5 samples true Kingman waiting-time scaling under constant, expanding, and bottlenecked Ne while coalescing adjacent lineages so 3D branches never cross.',
      },
    ],
    contestedNotes: [
      'Selective sweeps vs. demographic growth: both yield excess rare alleles (Tajima’s D < 0), so real population-genomic inference compares thousands of unlinked loci against focal candidate regions.',
    ],
    citations: [
      {
        authors: 'Wright, S.',
        year: 1931,
        title: 'Evolution in Mendelian populations',
        journal: 'Genetics 16: 97–159',
      },
      {
        authors: 'Buri, P.',
        year: 1956,
        title: 'Gene frequency in small populations of mutant Drosophila',
        journal: 'Evolution 10: 367–402',
      },
      {
        authors: 'Kimura, M.',
        year: 1962,
        title: 'On the probability of fixation of mutant genes in a population',
        journal: 'Genetics 47: 713–719',
      },
      {
        authors: 'Nei, M., Maruyama, T. & Chakraborty, R.',
        year: 1975,
        title: 'The bottleneck effect and genetic variability in populations',
        journal: 'Evolution 29: 1–10',
      },
      {
        authors: 'Kingman, J. F. C.',
        year: 1982,
        title: 'The coalescent',
        journal: 'Stochastic Processes and their Applications 13: 235–248',
      },
      {
        authors: 'Tajima, F.',
        year: 1989,
        title: 'Statistical method for testing the neutral mutation hypothesis by DNA polymorphism',
        journal: 'Genetics 123: 585–595',
      },
    ],
    standards: {
      undergrad: [
        'Wright–Fisher genetic drift, neutral fixation probability P(fix) = p₀, and heterozygosity decay',
        'Effective population size Ne (sex ratio, family-size variance, Buri 1956, harmonic mean)',
        'Bottlenecks & founder effects: allelic richness loss vs. heterozygosity retention',
        'Drift–selection balance (4Ne·s, Kimura 1962) & Kingman’s coalescent / Tajima’s D',
      ],
      apOrALevel: [
        'AP Biology EVO-1.H: Genetic drift, bottleneck effect & founder effect',
        'UK A-Level / Undergraduate Bridge: Random sampling in finite populations & molecular phylogenetics',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <div class="plate-caption-pill">
          <span class="plate-caption-text" data-cas-caption>6 Wright–Fisher Jars — neutral drift</span>
          <span class="plate-scale-bar">
            <span data-cas-tag>N = 10 · Gen 0</span>
          </span>
        </div>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" type="button" data-cas-reset>Reset 3D</button>
        </div>
      </div>
      <div class="plate-canvas-host" data-cas-canvas></div>
      <div class="hwe-plate-legend" data-cas-legend></div>
      <div class="plate-orbit-hint" style="bottom:18px;">Drag to orbit 3D · Scroll to zoom</div>
    `;

    const captionEl = plateStageEl.querySelector<HTMLElement>('[data-cas-caption]')!;
    const tagEl = plateStageEl.querySelector<HTMLElement>('[data-cas-tag]')!;
    const legendEl = plateStageEl.querySelector<HTMLElement>('[data-cas-legend]')!;
    const canvasHost = plateStageEl.querySelector<HTMLElement>('[data-cas-canvas]')!;

    const scene3d = new CasinoScene3D(canvasHost);
    plateStageEl.querySelector('[data-cas-reset]')!.addEventListener('click', () => scene3d.resetView());

    // -------------------------------------------------------------------------
    // CHAPTER STATE
    // -------------------------------------------------------------------------
    let activeStep = 0;

    // Page 1 state
    let p1N = 10;
    let p1P0 = 0.5;
    let p1Gen = 0;
    let p1Seed = 100;
    let p1Jars: JarState[] = createInitialJars(p1P0, 6);

    // Page 2 state
    let p2Nm = 2; // Dramatic default: 2 males + 18 females -> Ne = 7.2 out of N = 20!
    let p2Seed = 1956;

    // Page 3 state
    let p3Nb = 4;
    let p3Seed = 330;
    let p3Res = runVolcanoBottleneck(p3Nb, p3Seed);

    // Page 4 state
    let p4Ne = 15;
    let p4S = 0.04;
    let p4Seed = 440;
    let p4Out = simulateDriftVsSelection(p4Ne, p4S, 0.15, 36, 6, p4Seed);

    // Page 5 state
    let p5Regime: CoalescentRegime = 'expansion';
    let p5Seed = 880;
    let p5Tree = buildCoalescentTree(p5Regime, p5Seed);

    // Page 6 state
    let p6Idx = 0;
    let p6Done = false;
    const p6Answered: Record<string, { choice: string; correct: boolean }> = {};

    const updateHeaderAndLegend = () => {
      if (activeStep === 0) {
        const fixed = p1Jars.filter((j) => j.status !== 'poly').length;
        captionEl.textContent = '6 Wright–Fisher Jars — neutral drift';
        tagEl.textContent = `N = ${p1N} · Gen ${p1Gen} · ${fixed}/6 fixed`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f5fd0"></i>Allele A</span>
          <span><i class="hwe-dot" style="background:#e8b416"></i>Allele a</span>
          <span><i class="hwe-dot" style="background:#b88e42"></i>Halo = fixed/lost</span>
        `;
      } else if (activeStep === 1) {
        const sum = computeBuriAndNe(p2Nm, 20, 12, p2Seed);
        captionEl.textContent = 'Buri’s Fly Vials & Harem Sex-Ratio Ne';
        tagEl.textContent = `Census N = 20 · Ne = ${sum.neSexRatio.toFixed(1)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f5fd0"></i>Males (Nm)</span>
          <span><i class="hwe-dot" style="background:#c9524b"></i>Females (Nf)</span>
          <span><i class="hwe-dot" style="background:#9a4768"></i>Effective Ne pillar</span>
        `;
      } else if (activeStep === 2) {
        captionEl.textContent = '12-Allele Volcanic Bottleneck';
        tagEl.textContent = `Nb = ${p3Nb} · ${p3Res.richnessAfter}/12 alleles kept`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2a8c6c"></i>Surviving jewels</span>
          <span><i class="hwe-dot" style="background:#6e6254"></i>Ghost ring = lost allele</span>
        `;
      } else if (activeStep === 3) {
        captionEl.textContent = 'Drift vs. Selection — 4Ne·s Tug-of-War';
        tagEl.textContent = `4Ne·s = ${p4Out.fourNes.toFixed(1)} · P(fix) = ${(p4Out.kimuraP * 100).toFixed(0)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#268566"></i>Fixed A</span>
          <span><i class="hwe-dot" style="background:#b8382c"></i>Lost by drift</span>
          <span><i class="hwe-dot" style="background:#3564c9"></i>Polymorphic</span>
        `;
      } else if (activeStep === 4) {
        captionEl.textContent = `3D Kingman Coalescent — ${p5Regime === 'expansion' ? 'Rapid Expansion' : p5Regime === 'bottleneck' ? 'Recent Bottleneck' : 'Constant Ne'}`;
        tagEl.textContent = `S = ${p5Tree.segregatingSites} muts · D ≈ ${p5Tree.tajimasD > 0 ? '+' : ''}${p5Tree.tajimasD.toFixed(2)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f5fd0"></i>Sampled alleles</span>
          <span><i class="hwe-dot" style="background:#c43228"></i>Mutations (S)</span>
          <span><i class="hwe-dot" style="background:#e6b432"></i>MRCA</span>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        captionEl.textContent = `Drift & Coalescent Check — Case ${p6Idx + 1} of 3`;
        tagEl.textContent = `Score ${score}/3`;
        legendEl.innerHTML =
          p6Idx === 0
            ? `<span><i class="hwe-dot" style="background:#2f5fd0"></i>Allele A</span><span><i class="hwe-dot" style="background:#e8b416"></i>Allele a</span>`
            : p6Idx === 1
              ? `<span><i class="hwe-dot" style="background:#9a4768"></i>Effective size Ne</span>`
              : `<span><i class="hwe-dot" style="background:#c43228"></i>Mutations</span><span><i class="hwe-dot" style="background:#e6b432"></i>MRCA</span>`;
      }
    };

    const sync3D = (flashVolcano = false) => {
      if (activeStep === 0) {
        scene3d.updateJarsScene(p1Jars);
      } else if (activeStep === 1) {
        scene3d.updateBuriScene(computeBuriAndNe(p2Nm, 20, 12, p2Seed));
      } else if (activeStep === 2) {
        scene3d.updateVolcanoScene(p3Res, flashVolcano);
      } else if (activeStep === 3) {
        scene3d.updateTugScene(p4Out.runs, p4Out.kimuraP);
      } else if (activeStep === 4) {
        scene3d.updateCoalescentScene(p5Tree);
      } else {
        scene3d.setCheckCaseBackdrop(p6Idx);
      }
      updateHeaderAndLegend();
    };

    const renderLeftControls = () => {
      let html = '';

      if (activeStep === 0) {
        const meanP = p1Jars.reduce((a, j) => a + j.p, 0) / p1Jars.length;
        const obsH = p1Jars.reduce((a, j) => a + 2 * j.p * (1 - j.p), 0) / p1Jars.length;
        const expH = expectedHeterozygosity(p1P0, p1N, p1Gen);
        const polys = p1Jars
          .map((j, idx) => {
            const pts = j.history
              .map((p, t) => `${(10 + (t / Math.max(1, j.history.length - 1)) * 270).toFixed(1)},${(58 - p * 48).toFixed(1)}`)
              .join(' ');
            const stroke = j.status === 'fixedA' ? '#2f5fd0' : j.status === 'lostA' ? '#c98816' : ['#3564c9', '#9a4768', '#2a8c6c', '#b85a28', '#5c4b8a', '#2b7a8a'][idx % 6];
            return `<polyline fill="none" stroke="${stroke}" stroke-width="1.9" points="${pts}" />`;
          })
          .join('');

        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">POPULATION SIZE & START p₀</span>
              <span class="hwe-stat-badge">Gen ${p1Gen}</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p1N === 10 ? 'is-active' : ''}" type="button" data-p1-n="10">Small N = 10</button>
              <button class="lic-pill-btn ${p1N === 40 ? 'is-active' : ''}" type="button" data-p1-n="40">Medium N = 40</button>
              <button class="lic-pill-btn ${p1N === 200 ? 'is-active' : ''}" type="button" data-p1-n="200">Large N = 200</button>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p1P0 === 0.2 ? 'is-active' : ''}" type="button" data-p1-p0="0.2">p₀ = 0.20</button>
              <button class="lic-pill-btn ${p1P0 === 0.5 ? 'is-active' : ''}" type="button" data-p1-p0="0.5">p₀ = 0.50</button>
              <button class="lic-pill-btn ${p1P0 === 0.8 ? 'is-active' : ''}" type="button" data-p1-p0="0.8">p₀ = 0.80</button>
            </div>
            <div class="lic-spark-box">
              <svg viewBox="0 0 290 64" aria-label="6 parallel Wright-Fisher drift walks">
                <line x1="10" y1="58" x2="280" y2="58" stroke="#cbbda7" stroke-width="1" />
                <line x1="10" y1="10" x2="280" y2="10" stroke="#cbbda7" stroke-dasharray="3 3" stroke-width="1" />
                ${polys}
              </svg>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p1-step>Drift +8 Generations →</button>
              <button class="lic-btn" type="button" data-p1-reset>Reset Jars</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Mean p = ${meanP.toFixed(2)} · Obs H = ${obsH.toFixed(2)} (Exp H_t = ${expH.toFixed(2)})</div>
            <p class="lic-formula-note">Neutral P(fix) = p₀ = ${(p1P0 * 100).toFixed(0)}%. Notice small jars (N=10) scatter wildly and lose heterozygosity rapidly while large jars (N=200) hover near p₀.</p>
          </div>
        `;
      } else if (activeStep === 1) {
        const sum = computeBuriAndNe(p2Nm, 20, 12, p2Seed);
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">HAREM SEX RATIO (CENSUS N = 20)</span>
              <span class="hwe-stat-badge">Ne / N = ${sum.ratioPct.toFixed(0)}%</span>
            </div>
            <div class="lic-slider-wrap">
              <div class="lic-slider-head">
                <span>MALES Nm = ${sum.nm}</span>
                <span>FEMALES Nf = ${sum.nf}</span>
              </div>
              <input class="lic-range" type="range" min="1" max="10" step="1" value="${p2Nm}" data-p2-nm />
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Census N</span>
                <span class="lic-stat-val">20</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Sex-Ratio Ne</span>
                <span class="lic-stat-val is-crimson">${sum.neSexRatio.toFixed(1)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Buri (N=16)</span>
                <span class="lic-stat-val is-accent">Ne ≈ 11.5</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p2-reroll>Re-run Buri’s 12 Vials</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Ne = 4·(${sum.nm})·(${sum.nf}) / (${sum.nm} + ${sum.nf}) = ${sum.neSexRatio.toFixed(1)}</div>
            <p class="lic-formula-note">In Buri’s (1956) Drosophila bottles, N = 16 flies drifted like Ne ≈ 11.5 due to uneven offspring numbers; skewed sex ratios crush Ne even harder.</p>
          </div>
        `;
      } else if (activeStep === 2) {
        const richPct = (p3Res.richnessAfter / p3Res.richnessBefore) * 100;
        const hetPct = (p3Res.hetAfter / p3Res.hetBefore) * 100;
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">VOLCANO BOTTLENECK SIZE (Nb)</span>
              <span class="hwe-stat-badge">5-Gen Harmonic Ne = ${p3Res.harmonicNe5Gen.toFixed(1)}</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p3Nb === 4 ? 'is-active' : ''}" type="button" data-p3-nb="4">Severe Nb = 4</button>
              <button class="lic-pill-btn ${p3Nb === 10 ? 'is-active' : ''}" type="button" data-p3-nb="10">Moderate Nb = 10</button>
              <button class="lic-pill-btn ${p3Nb === 40 ? 'is-active' : ''}" type="button" data-p3-nb="40">Mild Nb = 40</button>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Alleles Kept</span>
                <span class="lic-stat-val is-crimson">${p3Res.richnessAfter}/12 (${richPct.toFixed(0)}%)</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Het Retained</span>
                <span class="lic-stat-val is-accent">${hetPct.toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">5-Gen Ne</span>
                <span class="lic-stat-val">${p3Res.harmonicNe5Gen.toFixed(1)}</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p3-erupt>Trigger Bottleneck! 🌋</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">1/Ne = (1/5)·(4/500 + 1/${p3Nb}) → Ne = ${p3Res.harmonicNe5Gen.toFixed(1)}</div>
            <p class="lic-formula-note">One crash to Nb = ${p3Nb} shatters allelic richness (${richPct.toFixed(0)}% left) while keeping ${hetPct.toFixed(0)}% of heterozygosity—and drags 5-gen Ne down to ${p3Res.harmonicNe5Gen.toFixed(1)}!</p>
          </div>
        `;
      } else if (activeStep === 3) {
        const fixedCnt = p4Out.runs.filter((r) => r.fixed).length;
        const lostCnt = p4Out.runs.filter((r) => r.lost).length;
        const regimeLabel = Math.abs(p4Out.fourNes) <= 2.5 ? 'Drift-dominated (nearly neutral)' : 'Selection-dominated';
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">ISLAND VS. MAINLAND (START p₀ = 15%)</span>
              <span class="lic-badge ${Math.abs(p4Out.fourNes) <= 2.5 ? 'is-warn' : ''}">${regimeLabel}</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p4Ne === 15 ? 'is-active' : ''}" type="button" data-p4-ne="15">Island Ne = 15</button>
              <button class="lic-pill-btn ${p4Ne === 50 ? 'is-active' : ''}" type="button" data-p4-ne="50">Bay Ne = 50</button>
              <button class="lic-pill-btn ${p4Ne === 250 ? 'is-active' : ''}" type="button" data-p4-ne="250">Mainland Ne = 250</button>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p4S === -0.02 ? 'is-active' : ''}" type="button" data-p4-s="-0.02">Mildly bad (−0.02)</button>
              <button class="lic-pill-btn ${p4S === 0 ? 'is-active' : ''}" type="button" data-p4-s="0">Neutral (0)</button>
              <button class="lic-pill-btn ${p4S === 0.04 ? 'is-active' : ''}" type="button" data-p4-s="0.04">Beneficial (+0.04)</button>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">4·Ne·s</span>
                <span class="lic-stat-val">${p4Out.fourNes.toFixed(1)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Kimura P(fix)</span>
                <span class="lic-stat-val is-accent">${(p4Out.kimuraP * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">6 Runs</span>
                <span class="lic-stat-val">${fixedCnt} fix · ${lostCnt} lost</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p4-rerun>Run 6 New Replicates</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">P(fix) = (1 − e^(−4Ne·s·p₀)) / (1 − e^(−4Ne·s)) = ${(p4Out.kimuraP * 100).toFixed(1)}%</div>
            <p class="lic-formula-note">Notice that P(fix) ≠ p₀ whenever s ≠ 0! In tiny populations (|4Ne·s| ≲ 1), drift swamps weak selection.</p>
          </div>
        `;
      } else if (activeStep === 4) {
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">DEMOGRAPHIC HISTORY (n = 8 ALLELES)</span>
              <span class="hwe-stat-badge">Tajima’s D ≈ ${p5Tree.tajimasD > 0 ? '+' : ''}${p5Tree.tajimasD.toFixed(2)}</span>
            </div>
            <div class="lic-mode-grid is-three">
              <button class="lic-pill-btn ${p5Regime === 'constant' ? 'is-active' : ''}" type="button" data-p5-reg="constant">Constant Ne</button>
              <button class="lic-pill-btn ${p5Regime === 'expansion' ? 'is-active' : ''}" type="button" data-p5-reg="expansion">Rapid Expansion</button>
              <button class="lic-pill-btn ${p5Regime === 'bottleneck' ? 'is-active' : ''}" type="button" data-p5-reg="bottleneck">Bottleneck</button>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">MRCA Depth</span>
                <span class="lic-stat-val">${p5Tree.mrcaHeight.toFixed(0)} gen</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Mutations (S)</span>
                <span class="lic-stat-val is-crimson">${p5Tree.segregatingSites}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Tajima’s D</span>
                <span class="lic-stat-val is-accent">${p5Tree.tajimasD > 0 ? '+' : ''}${p5Tree.tajimasD.toFixed(2)}</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p5-resamp>Sample New Genealogy</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">E[T_MRCA] = 4·Ne·(1 − 1/n) · Rate of k→k−1 is k(k−1)/(4Ne)</div>
            <p class="lic-formula-note">${p5Tree.summary}</p>
          </div>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        if (p6Done) {
          html = `
            <div class="hwe-card">
              <div class="hwe-card-head">
                <span class="hwe-kicker">PLATE 4 COMPLETE</span>
                <span class="hwe-stat-badge">${score}/${CHECK_CASES.length}</span>
              </div>
              <p style="margin:0;font-size:13.5px;line-height:1.5;color:var(--ink);">
                <strong>Stamped!</strong> You’ve mastered Wright–Fisher drift, effective population size Ne, bottleneck allelic loss, 4Ne·s, and 3D Kingman coalescent genealogies.
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
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p1-n]').forEach((b) => {
        b.addEventListener('click', () => {
          p1N = Number(b.dataset.p1N);
          p1Gen = 0;
          p1Jars = createInitialJars(p1P0, 6);
          sync3D();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p1-p0]').forEach((b) => {
        b.addEventListener('click', () => {
          p1P0 = Number(b.dataset.p1P0);
          p1Gen = 0;
          p1Jars = createInitialJars(p1P0, 6);
          sync3D();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector('[data-p1-step]')?.addEventListener('click', () => {
        p1Seed += 23;
        p1Gen += 8;
        p1Jars = stepJarsWrightFisher(p1Jars, p1N, 8, p1Seed);
        sync3D();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p1-reset]')?.addEventListener('click', () => {
        p1Gen = 0;
        p1Jars = createInitialJars(p1P0, 6);
        sync3D();
        renderLeftControls();
      });

      // Bind Page 2
      leftPanelEl.querySelector<HTMLInputElement>('[data-p2-nm]')?.addEventListener('input', (e) => {
        p2Nm = Number((e.target as HTMLInputElement).value);
        sync3D();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p2-reroll]')?.addEventListener('click', () => {
        p2Seed += 37;
        sync3D();
        renderLeftControls();
      });

      // Bind Page 3
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p3-nb]').forEach((b) => {
        b.addEventListener('click', () => {
          p3Nb = Number(b.dataset.p3Nb);
          p3Seed += 19;
          p3Res = runVolcanoBottleneck(p3Nb, p3Seed);
          sync3D(true);
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector('[data-p3-erupt]')?.addEventListener('click', () => {
        p3Seed += 41;
        p3Res = runVolcanoBottleneck(p3Nb, p3Seed);
        sync3D(true);
        renderLeftControls();
      });

      // Bind Page 4
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p4-ne]').forEach((b) => {
        b.addEventListener('click', () => {
          p4Ne = Number(b.dataset.p4Ne);
          p4Out = simulateDriftVsSelection(p4Ne, p4S, 0.15, 36, 6, p4Seed);
          sync3D();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p4-s]').forEach((b) => {
        b.addEventListener('click', () => {
          p4S = Number(b.dataset.p4S);
          p4Out = simulateDriftVsSelection(p4Ne, p4S, 0.15, 36, 6, p4Seed);
          sync3D();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector('[data-p4-rerun]')?.addEventListener('click', () => {
        p4Seed += 29;
        p4Out = simulateDriftVsSelection(p4Ne, p4S, 0.15, 36, 6, p4Seed);
        sync3D();
        renderLeftControls();
      });

      // Bind Page 5
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p5-reg]').forEach((b) => {
        b.addEventListener('click', () => {
          p5Regime = b.dataset.p5Reg as CoalescentRegime;
          p5Tree = buildCoalescentTree(p5Regime, p5Seed);
          sync3D();
          renderLeftControls();
        });
      });
      leftPanelEl.querySelector('[data-p5-resamp]')?.addEventListener('click', () => {
        p5Seed += 53;
        p5Tree = buildCoalescentTree(p5Regime, p5Seed);
        sync3D();
        renderLeftControls();
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
          ctx.completeChapter('casino', score, CHECK_CASES.length);
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
      activeStep = Math.max(0, Math.min(CH04_CASINO.steps.length - 1, stepIndex));
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
