// =============================================================================
// Chapter 7: Mutation, Linkage & Gene Flow — Luria–Delbrück, DFE,
// Mutation–Selection Balance, X-Linked Hemizygosity, LD Sweeps & F_ST Clines
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  computeGeneFlow,
  computeLinkageSweep,
  computeMutationSelection,
  computeXLinked,
  runFluctuationTest,
} from './engineMath';
import { EngineScene3D, type EnginePageId } from './EngineScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'engine')!;

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
    id: 'en1-luria',
    prompt:
      'In a Luria–Delbrück fluctuation test on 6 parallel E. coli cultures plated with lethal T1 phage, four plates show 0–1 colonies while one jackpot plate bursts with 34 colonies (Variance / Mean = 29.4). What does this prove?',
    options: [
      { id: 'a', label: 'Phage exposure directly instructed bacteria to evolve resistance on the agar plate.', correct: false },
      { id: 'b', label: 'Resistance mutations arose spontaneously and randomly BEFORE phage exposure; an early mutation in one tube multiplied into a jackpot clone.', correct: true },
      { id: 'c', label: 'Most random mutations in bacteria are beneficial.', correct: false },
    ],
    explanation:
      'Correct! Directed induction would yield a Poisson distribution (Variance / Mean ≈ 1) across parallel plates. Huge jackpot variance (Variance ≫ Mean) proves mutations occur randomly with respect to need before selection acts (Luria & Delbrück 1943).',
  },
  {
    id: 'en2-balance-x',
    prompt:
      'A recessive deleterious allele has mutation rate μ = 10⁻⁴ and selection coefficient s = 1 (lethal in homozygotes). Roughly how common is its equilibrium allele frequency q* on an autosome, and why are X-linked recessive traits far rarer in females than males?',
    options: [
      { id: 'a', label: 'q* = √(μ/s) = 0.01 (100× higher than a dominant lethal μ/s = 10⁻⁴) because heterozygotes shelter recessive alleles; X-linked males express q while females need q².', correct: true },
      { id: 'b', label: 'q* = μ/s = 0.0001 for both recessive and dominant lethals; males and females show equal rates.', correct: false },
      { id: 'c', label: 'Natural selection eliminates all deleterious alleles completely within 2 generations.', correct: false },
    ],
    explanation:
      'Correct! Recessive deleterious alleles hide in heterozygous carriers (2pq ≫ q²), giving q* = √(μ/s) = 0.01. On the X chromosome, hemizygous XY males express any recessive allele immediately (frequency q) whereas XX females must inherit two copies (q²), a 1/q-fold excess in males.',
  },
  {
    id: 'en3-sweep-flow',
    prompt:
      'Across a dark volcanic lava flow surrounded by pale desert sand, dark rock pocket mice suffer heavy immigration (m = 0.25) that exceeds local owl selection (s = 0.15). Meanwhile, genomicists find a sharp, localized valley of low nucleotide diversity (π) and Tajima’s D = −2.1 around ONE gene (Mc1r), while the rest of the genome has D ≈ 0. What are the two phenomena?',
    options: [
      { id: 'a', label: 'Complete speciation on the lava flow and a genome-wide population bottleneck.', correct: false },
      { id: 'b', label: 'Gene swamping (m > s erodes local adaptation) and a localized hard selective sweep via genetic hitchhiking around Mc1r.', correct: true },
      { id: 'c', label: 'Neutral genetic drift alone with zero migration.', correct: false },
    ],
    explanation:
      'Correct! When immigration m exceeds local selection s, gene flow swamps local adaptation (and F_ST = 1/(4Nem+1) collapses). A sharp local valley in π and negative Tajima’s D at a single locus—while genome-wide D ≈ 0—is the classic signature of a selective sweep dragging linked DNA via genetic hitchhiking.',
  },
];

const PAGE_IDS: EnginePageId[] = ['fluctuation', 'balance', 'xlinked', 'linkage', 'geneflow', 'check'];

export const CH07_ENGINE: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'fluctuation',
      shortLabel: '1 Mutation',
      eyebrow: 'LURIA–DELBRÜCK (1943) · RANDOMNESS & DFE',
      heading: 'Mutation is random with respect to need',
      bodyHtml: `Do organisms mutate <em>because</em> they need resistance, or do random mutations arise beforehand? Run the classic ${gloss('luria_delbruck', 'Luria–Delbrück fluctuation test')} across six glass <em>E. coli</em> plates and inspect the 3D ${gloss('dfe', 'Distribution of Fitness Effects (DFE)')} behind them.`,
      promptHint: 'Compare Spontaneous Jackpots (Var/Mean ≫ 1) vs. Induced Hypothesis (Var/Mean ≈ 1).',
    },
    {
      id: 'balance',
      shortLabel: '2 μ–s Balance',
      eyebrow: 'MUTATION–SELECTION EQUILIBRIUM',
      heading: 'Why harmful alleles never vanish',
      bodyHtml: `If selection relentlessly removes deleterious alleles, why do genetic diseases persist? Recurring mutation (<strong>μ</strong>) refills the gene pool while selection (<strong>s</strong>) drains it—reaching ${gloss('mutation_selection_balance', 'mutation–selection balance')}. Notice how recessive alleles hide in carriers (<strong>q* = √(μ/s)</strong>), making them orders of magnitude more common than dominant lethals (<strong>q* = μ/s</strong>)!`,
      promptHint: 'Toggle Recessive vs. Dominant and tune μ and s to watch carriers vs. affected flies shift.',
    },
    {
      id: 'xlinked',
      shortLabel: '3 X-Linked',
      eyebrow: 'THOMAS HUNT MORGAN · DROSOPHILA WHITE EYES',
      heading: 'Hemizygosity exposes recessive alleles',
      bodyHtml: `In fruit flies (<em>Drosophila</em>) and humans, XY males carry only a single X chromosome. Any recessive X-linked allele (like Morgan’s ivory-white eye allele <em>w</em>) is expressed immediately in males (frequency <strong>q</strong>), whereas XX females must inherit two copies (<strong>q²</strong>).`,
      promptHint: 'Slide allele frequency q to see the 1/q-fold excess of white-eyed males over females.',
    },
    {
      id: 'linkage',
      shortLabel: '4 Sweeps & LD',
      eyebrow: 'CROSSING OVER · GENETIC HITCHHIKING',
      heading: 'Recombination, LD decay & selective sweeps',
      bodyHtml: `Genes riding on the same chromosome are physically linked—creating ${gloss('linkage_disequilibrium', 'linkage disequilibrium (LD)')} that decays as <strong>D_t = D₀(1 − r)^t</strong>. When a beneficial mutation rockets to fixation, it drags linked neutral DNA along in a ${gloss('selective_sweep', 'selective sweep')}, carving a localized valley of low diversity (π)!`,
      promptHint: 'Adjust recombination rate r and step generations to watch chromosomes cross over and widen or narrow the sweep valley.',
    },
    {
      id: 'geneflow',
      shortLabel: '5 Gene Flow',
      eyebrow: 'ROCK POCKET MICE · F_ST & GENE SWAMPING',
      heading: 'Migration, F_ST & local adaptation',
      bodyHtml: `On Arizona’s Pinacate volcanic lava flows, dark melanic rock pocket mice (<em>Chaetodipus intermedius</em>) hide from owls while pale desert neighbours immigrate across the boundary. Compare ${gloss('fst', 'Wright’s F_ST = 1/(4N_e m + 1)')} and test when heavy ${gloss('gene_flow', 'gene flow')} (<strong>m &gt; s</strong>) swamps local adaptation!`,
      promptHint: 'Raise migration m past local selection s to trigger gene swamping on the dark lava flow.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'MICROEVOLUTIONARY FORCES MASTERY',
      heading: 'Diagnosing mutation, linkage & flow',
      bodyHtml: `Synthesize Luria–Delbrück variance, recessive vs. dominant equilibria, X-linked ratios, selective sweep valleys, and gene swamping across three diagnostic exam questions.`,
      promptHint: 'Answer all three cases to stamp Plate 7 complete.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Population & Evolutionary Genetics)',
    learningObjectives: [
      'Explain why high jackpot variance (Var/Mean ≫ 1) in the Luria–Delbrück experiment refutes directed mutation.',
      'Calculate recessive (q* = √(μ/s)) and dominant (q* = μ/s) mutation–selection equilibria and explain heterozygote sheltering.',
      'Predict male (q) vs. female (q²) incidence of X-linked recessive traits and explain the 1/q male excess.',
      'Distinguish a locus-specific selective sweep (genetic hitchhiking valley, local Tajima’s D < 0) from genome-wide demographic growth.',
      'Compute Wright’s F_ST = 1/(4N_e m + 1) and identify the migration–selection threshold (m > s) for gene swamping.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Stress or antibiotics cause bacteria to intentionally mutate toward resistance.',
        correction:
          'Luria & Delbrück (1943) proved mutations arise spontaneously before selection; stress-induced mutagenesis may raise overall mutation rate μ, but it remains undirected with respect to adaptive need.',
      },
      {
        misconception: 'A single migrant per generation is too small to affect allele divergence between islands.',
        correction:
          'In Wright’s Island Model F_ST = 1/(4N_e m + 1), just N_e m = 1 migrant per generation caps neutral F_ST at 0.20, regardless of total population size N_e!',
      },
    ],
    discussionPrompts: [
      'Why does even a slight heterozygote effect (h > 0, giving q* ≈ μ/(hs)) drastically lower the equilibrium frequency of a recessive lethal compared to strictly h = 0?',
      'How can a population geneticist distinguish a recent hard selective sweep from a recent population expansion using whole-genome sequencing?',
    ],
    activityTip:
      'On Page 5, ask students to find the exact migration rate m at which pale desert mice swamp the black Pinacate lava flow when owl selection is s = 0.15.',
  },
  scienceCard: {
    coreTakeaway:
      'Mutation supplies random raw variation (mostly neutral or deleterious), recombination shuffles linked haplotypes (breaking LD at rate r and setting the width of selective sweeps), and gene flow homogenizes populations (F_ST = 1/(4N_e m + 1)) unless countered by stronger local selection (s > m).',
    assumptions: [
      {
        label: 'Luria–Delbrück Fluctuation Test',
        status: 'realistic',
        tag: 'Luria & Delbrück 1943',
        detail: 'Parallel exponential cultures reveal heavy-tailed jackpot variance (Fano factor ≫ 1), refuting adaptive induction.',
      },
      {
        label: 'Hitchhiking Sweep Scaling',
        status: 'simplified',
        tag: 'Maynard Smith & Haigh 1974',
        detail: 'Valley width scales inversely with r/s; strong rapid sweeps leave wide genomic footprints of depleted π.',
      },
      {
        label: 'Rock Pocket Mouse Mc1r Clines',
        status: 'realistic',
        tag: 'Nachman et al. 2003',
        detail: 'Independent melanic adaptations evolved on isolated basalt flows across the American Southwest; migration–selection balance governs cline width.',
      },
    ],
    citations: [
      {
        authors: 'Luria, S. E. & Delbrück, M.',
        year: 1943,
        title: 'Mutations of bacteria from virus sensitivity to virus resistance',
        journal: 'Genetics 28:491–511',
      },
      {
        authors: 'Maynard Smith, J. & Haigh, J.',
        year: 1974,
        title: 'The hitch-hiking effect of a favourable gene',
        journal: 'Genetical Research 23:23–35',
      },
      {
        authors: 'Nachman, M. W., Hoekstra, H. E. & D’Agostino, S. L.',
        year: 2003,
        title: 'The genetic basis of adaptive melanism in pocket mice',
        journal: 'PNAS 100:5268–5273',
      },
    ],
    standards: {
      undergrad: [
        'Population Genetics Core: Mutation–Selection Balance & X-Linked Equilibrium',
        'Linkage Disequilibrium, Recombination & Hitchhiking Sweeps',
        'Wright’s Island Model (F_ST) & Migration–Selection Balance',
      ],
      apOrALevel: ['AP Bio 7.4–7.5 (Mutation, Gene Flow & Non-Random Evolution)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="eng-caption">Plate VII · Luria–Delbrück Fluctuation Assay</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="eng-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="eng-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="eng-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="eng-canvas-host"></div>
      <div class="hwe-plate-legend" id="eng-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D anatomy &amp; dynamics</div>
    `;

    const canvasHost = plateStageEl.querySelector('#eng-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#eng-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#eng-legend') as HTMLElement;

    const scene = new EngineScene3D(canvasHost);
    (plateStageEl.querySelector('#eng-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#eng-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#eng-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    // Local interactive state
    let currentStep = 0;
    let flucMode: 'spontaneous' | 'induced' = 'spontaneous';
    let flucSeed = 42;

    let balDom: 'recessive' | 'dominant' = 'recessive';
    let balMuExp = 4; // 10^-4
    let balS = 0.5;

    let xFreqQ = 0.1;

    let linkR = 0.1;
    let linkGen = 6;

    let gfMig = 0.04;
    let gfSel = 0.18;
    let gfNe = 50;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'fluctuation';
      scene.setPage(pageId);

      if (pageId === 'fluctuation') {
        const res = runFluctuationTest(flucMode, flucSeed);
        scene.updateFluctuation(res);
        captionEl.textContent = 'Plate VII.1 · Luria–Delbrück Glass Dishes & 3D DFE';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c44234"></i>Phage-Resistant Rod</span>
          <span><i class="hwe-dot" style="background:#8b959e"></i>Neutral DFE Peak</span>
          <span><i class="hwe-dot" style="background:#3b8c6e"></i>Rare Beneficial Tail</span>
        `;

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Hypothesis Mode</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${flucMode === 'spontaneous' ? 'active' : ''}" data-fm="spontaneous">Spontaneous (Random)</button>
                <button class="lic-pill-btn ${flucMode === 'induced' ? 'active' : ''}" data-fm="induced">Induced (Directed)</button>
              </div>
              <div class="lic-stat-row" style="margin-top:10px;">
                <span class="hwe-stat-badge">Mean = ${res.mean.toFixed(1)}</span>
                <span class="hwe-stat-badge">Var = ${res.variance.toFixed(1)}</span>
                <span class="hwe-stat-badge" style="color:${res.fanoFactor > 3 ? '#a83424' : '#24587c'}">Var/Mean = ${res.fanoFactor.toFixed(1)}</span>
              </div>
              <button class="lic-btn primary" id="eng-fluc-reroll" style="width:100%;margin-top:8px;">Plate 6 Fresh Parallel Cultures</button>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Diagnostic Fano Factor (Var / Mean):</strong> ${
                flucMode === 'spontaneous'
                  ? 'Early mutations replicate exponentially before phage arrives → massive jackpot variance (<strong>Var/Mean ≫ 1</strong>), proving mutation is random with respect to need.'
                  : 'Under directed induction, every plate draws independent Poisson hits (<strong>Var/Mean ≈ 1</strong>)—refuted by Luria &amp; Delbrück (1943)!'
              }</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-fm]').forEach((b) =>
          b.addEventListener('click', () => {
            flucMode = (b as HTMLElement).dataset.fm as 'spontaneous' | 'induced';
            renderPage();
          })
        );
        leftPanelEl.querySelector('#eng-fluc-reroll')?.addEventListener('click', () => {
          flucSeed += 1;
          renderPage();
        });
      } else if (pageId === 'balance') {
        const mu = Math.pow(10, -balMuExp);
        const res = computeMutationSelection(balDom, mu, balS);
        scene.updateMutationSelection(res);
        captionEl.textContent = 'Plate VII.2 · Mutation–Selection Equilibrium Basin';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#b82824"></i>Wild-type (AA)</span>
          <span><i class="hwe-dot" style="background:#e08b38"></i>Sheltered Carrier (Aa)</span>
          <span><i class="hwe-dot" style="background:#e8e2d8;border:1px solid #999"></i>Affected</span>
        `;

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Dominance of Deleterious Allele</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${balDom === 'recessive' ? 'active' : ''}" data-bd="recessive">Recessive (q* = √μ/s)</button>
                <button class="lic-pill-btn ${balDom === 'dominant' ? 'active' : ''}" data-bd="dominant">Dominant (q* = μ/s)</button>
              </div>
              <label style="display:block;margin-top:10px;font-size:0.84rem;">
                Mutation Rate μ = <strong>10⁻${balMuExp}</strong>
                <input type="range" id="eng-mu" min="2" max="6" step="1" value="${balMuExp}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Selection Against Affected s = <strong>${balS.toFixed(2)}</strong>
                <input type="range" id="eng-s" min="0.05" max="1" step="0.05" value="${balS}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">q* = ${(res.qHat * 100).toFixed(3)}%</span>
                <span class="hwe-stat-badge">Carriers = ${(res.carrierFreq * 100).toFixed(2)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${
                balDom === 'recessive'
                  ? '<strong>Heterozygote Sheltering:</strong> Because rare recessive alleles sit overwhelmingly in healthy carriers (2pq ≫ q²), selection can barely touch them—leaving q* = √(μ/s) orders of magnitude higher!'
                  : '<strong>Immediate Exposure:</strong> Every dominant deleterious copy is visible to selection immediately, holding q* = μ/s tiny.'
              }</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-bd]').forEach((b) =>
          b.addEventListener('click', () => {
            balDom = (b as HTMLElement).dataset.bd as 'recessive' | 'dominant';
            renderPage();
          })
        );
        leftPanelEl.querySelector('#eng-mu')?.addEventListener('input', (e) => {
          balMuExp = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#eng-s')?.addEventListener('input', (e) => {
          balS = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'xlinked') {
        const res = computeXLinked(xFreqQ);
        scene.updateXLinked(res);
        captionEl.textContent = 'Plate VII.3 · Morgan’s X-Linked Drosophila (XY vs XX)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c82420"></i>Red-Eyed Wild Type (w⁺)</span>
          <span><i class="hwe-dot" style="background:#f2ece0;border:1px solid #999"></i>White-Eyed Recessive (w)</span>
        `;

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">X-Linked Recessive Allele Frequency (q)</div>
              <label style="display:block;font-size:0.84rem;">
                White-eye allele q = <strong>${(res.q * 100).toFixed(0)}%</strong>
                <input type="range" id="eng-xq" min="0.05" max="0.50" step="0.05" value="${res.q}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:10px;">
                <span class="hwe-stat-badge" style="color:#a83424;">Males (q): ${(res.maleAffected * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge" style="color:#24587c;">Females (q²): ${(res.femaleAffected * 100).toFixed(1)}%</span>
              </div>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">Male : Female Ratio = ${res.maleToFemaleRatio.toFixed(1)}×</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Why X-linked recessive traits skew male:</strong> P(affected XY male) = <strong>q</strong>; P(affected XX female) = <strong>q²</strong>. The rarer the allele (smaller q), the steeper the male-to-female ratio (<strong>1 / q</strong>)!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#eng-xq')?.addEventListener('input', (e) => {
          xFreqQ = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'linkage') {
        const res = computeLinkageSweep(linkR, linkGen);
        scene.updateLinkageSweep(res);
        captionEl.textContent = 'Plate VII.4 · 3D Crossing Over & Selective Sweep Valley';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f658e"></i>Maternal Chromatid</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Paternal / Sweep Locus</span>
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Flanking Diversity π</span>
        `;

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Recombination &amp; Generations</div>
              <label style="display:block;font-size:0.84rem;">
                Recombination Rate r = <strong>${linkR.toFixed(2)}</strong>
                <input type="range" id="eng-r" min="0.00" max="0.50" step="0.02" value="${linkR}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Generations Since Coupling t = <strong>${linkGen}</strong>
                <input type="range" id="eng-gen" min="0" max="25" step="1" value="${linkGen}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">D₀ = 0.250</span>
                <span class="hwe-stat-badge">D_t = ${res.dt.toFixed(3)}</span>
                <span class="hwe-stat-badge">t½ = ${Number.isFinite(res.halfLifeGens) ? res.halfLifeGens.toFixed(1) + 'g' : '∞'}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>LD Decay:</strong> D_t = D₀(1 − r)^t. Tighter linkage (smaller <em>r</em>) slows LD decay AND widens the hitchhiking valley of depleted π around a sweeping beneficial allele!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#eng-r')?.addEventListener('input', (e) => {
          linkR = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#eng-gen')?.addEventListener('input', (e) => {
          linkGen = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'geneflow') {
        const res = computeGeneFlow(gfMig, gfSel, gfNe);
        scene.updateGeneFlow(res);
        captionEl.textContent = 'Plate VII.5 · Pinacate Rock Pocket Mice (F_ST & Gene Swamping)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d4be96"></i>Pale Desert Morph</span>
          <span><i class="hwe-dot" style="background:#2d2b2e"></i>Melanic Lava Morph (Mc1r)</span>
          <span><i class="hwe-dot" style="background:#d69a2d"></i>Migration Flux (m)</span>
        `;

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Migration–Selection Balance</div>
              <label style="display:block;font-size:0.84rem;">
                Immigration Rate m = <strong>${gfMig.toFixed(2)}</strong>
                <input type="range" id="eng-m" min="0.00" max="0.35" step="0.01" value="${gfMig}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Local Owl Selection on Lava s = <strong>${gfSel.toFixed(2)}</strong>
                <input type="range" id="eng-gfs" min="0.05" max="0.35" step="0.01" value="${gfSel}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Effective Size N_e = <strong>${gfNe}</strong>
                <input type="range" id="eng-ne" min="10" max="200" step="10" value="${gfNe}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">F_ST = ${res.fst.toFixed(3)}</span>
                <span class="hwe-stat-badge">N_e m = ${res.nem.toFixed(1)}</span>
                <span class="hwe-stat-badge" style="color:${res.swamped ? '#a83424' : '#2f6d4f'}">${res.swamped ? 'SWAMPED!' : 'ADAPTED'}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Wright’s Island Model:</strong> F_ST = 1 / (4N_e m + 1). Even <strong>1 migrant per generation</strong> (N_e m = 1) keeps neutral F_ST ≤ 0.20, while <strong>m ≥ s</strong> swamps local lava camouflage!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#eng-m')?.addEventListener('input', (e) => {
          gfMig = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#eng-gfs')?.addEventListener('input', (e) => {
          gfSel = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#eng-ne')?.addEventListener('input', (e) => {
          gfNe = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate VII.6 · Microevolutionary Forces Diagnostic';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c44234"></i>Luria–Delbrück</span>
          <span><i class="hwe-dot" style="background:#4d5d94"></i>Balance &amp; Linkage</span>
          <span><i class="hwe-dot" style="background:#2d2b2e"></i>Gene Flow</span>
        `;

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
          ctx.completeChapter('engine', correctCount, CHECK_CASES.length);
        }

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            ${CHECK_CASES.map((c, idx) => {
              const picked = answers[c.id];
              const opt = c.options.find((o) => o.id === picked);
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
                      return `<button class="${cls}" data-qid="${c.id}" data-oid="${o.id}">${o.label}</button>`;
                    })
                    .join('')}
                  ${
                    opt
                      ? `<div class="check-feedback ${opt.correct ? 'ok' : 'bad'}">${opt.correct ? c.explanation : 'Re-check the quantitative prediction on the preceding 3D plate and try again.'}</div>`
                      : ''
                  }
                </div>
              `;
            }).join('')}
          </div>
        `;
        leftPanelEl.querySelectorAll('.lic-quiz-opt').forEach((btn) =>
          btn.addEventListener('click', () => {
            const qid = (btn as HTMLElement).dataset.qid!;
            const oid = (btn as HTMLElement).dataset.oid!;
            answers[qid] = oid;
            renderPage();
          })
        );
      }
    };

    renderPage();

    return {
      onStepChange(idx: number) {
        currentStep = idx;
        renderPage();
      },
      onResize() {
        scene.resize();
      },
      destroy() {
        scene.destroy();
      },
    };
  },
};
