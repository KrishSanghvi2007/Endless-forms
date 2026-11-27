import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  chiSquare1df,
  fHatFromCounts,
  fracsFromCounts,
  generateBeachPopulation,
  generateWahlundBeach,
  hwExpected,
  inbredExpected,
  mateOneGeneration,
  pFromCounts,
  simulateYule30,
  wahlundPool,
  warfarinSeason,
  type BeachBeetle,
  type GenotypeTriple,
} from './hweMath';
import { HweScene3D, type ForceMode, type HwePageId } from './HweScene3D';
import './hwe.css';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'hwe')!;

function gloss(id: string, label: string): string {
  return `<span class="gloss-term" tabindex="0" role="button" data-term="${id}">${label}</span>`;
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

/** Render a clean inked genotype bar chart with dashed Hardy–Weinberg expectations */
function renderGenoBarsHtml(
  obs: GenotypeTriple,
  exp: GenotypeTriple,
  labels: [string, string, string] = ['AA', 'Aa', 'aa']
): string {
  const maxVal = Math.max(0.65, ...obs, ...exp);
  const cols = [
    { name: labels[0], cls: 'aa-dom', o: obs[0], e: exp[0] },
    { name: labels[1], cls: 'aa-het', o: obs[1], e: exp[1] },
    { name: labels[2], cls: 'aa-rec', o: obs[2], e: exp[2] },
  ];
  return `
    <div class="hwe-geno-bars">
      ${cols
        .map((c) => {
          const hObs = Math.max(2, Math.round((c.o / maxVal) * 100));
          const hExp = Math.min(96, Math.round((c.e / maxVal) * 100));
          return `
            <div class="hwe-geno-col">
              <div class="hwe-bar-track" title="Observed ${pct(c.o)} · Expected HW ${pct(c.e)}">
                <div class="hwe-bar-fill ${c.cls}" style="height:${hObs}%;"></div>
                <div class="hwe-bar-exp-line" style="bottom:${hExp}%;"></div>
              </div>
              <div class="hwe-geno-meta">
                <span class="hwe-geno-name">${c.name}</span>
                <span class="hwe-geno-pct">${pct(c.o)} <span style="opacity:.65;">(${pct(c.e)})</span></span>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
  `;
}

interface HweCheckQ {
  id: string;
  prompt: string;
  options: { id: string; label: string; correct: boolean }[];
  explanation: string;
}

const HWE_CHECKS: HweCheckQ[] = [
  {
    id: 'c1-carriers',
    prompt:
      'On this island in Hardy–Weinberg equilibrium, 4% of beetles (1 in 25) are amber (aa). Roughly what share of the population are blue-looking carriers (Aa)?',
    options: [
      { id: 'a', label: 'About 4% — the same as the amber beetles.', correct: false },
      { id: 'b', label: 'About 32% — because q = √0.04 = 0.20, so 2pq = 2(0.80)(0.20) = 0.32.', correct: true },
      { id: 'c', label: 'About 8% — twice the recessive frequency.', correct: false },
    ],
    explanation:
      'Exactly right! Taking q = √(aa) = √0.04 = 0.20 gives p = 0.80 and carriers 2pq = 32%. Most copies of a rare recessive allele hide inside heterozygotes.',
  },
  {
    id: 'c2-drift',
    prompt:
      'Look at the 3D de Finetti triangle: this tiny island’s allele frequency p drifted from 0.50 to 0.74 over four generations, yet every single generation sits RIGHT ON the golden Hardy–Weinberg curve. What does that show?',
    options: [
      { id: 'a', label: 'No evolution occurred, because every generation fitted Hardy–Weinberg.', correct: false },
      { id: 'b', label: 'A population can fit Hardy–Weinberg proportions every generation and still evolve (e.g. by drift or post-mating migration).', correct: true },
      { id: 'c', label: 'The χ² test must have been miscalculated.', correct: false },
    ],
    explanation:
      'Spot on — this is the key inversion of Hardy–Weinberg! A departure points to a cause, but a fit rules nothing out: random mating puts each generation onto p², 2pq, q² even as drift moves p.',
  },
  {
    id: 'c3-inb',
    prompt:
      'A field geneticist samples one continuous beetle meadow and finds a 25% shortfall of heterozygotes at BOTH the wing-colour gene AND an unrelated head-spot gene, while p never changes. Which cause fits best?',
    options: [
      { id: 'a', label: 'Close-relative mating (inbreeding, F = 0.25), which reduces heterozygotes across the entire genome without moving p.', correct: true },
      { id: 'b', label: 'Assortative mating purely by wing colour.', correct: false },
      { id: 'c', label: 'Heterozygote advantage favouring Aa beetles.', correct: false },
    ],
    explanation:
      'Correct! Inbreeding lowers heterozygosity genome-wide (2pq(1 − F)) without shifting p. Mating by colour affects only colour genes, and heterozygote advantage creates an EXCESS of heterozygotes.',
  },
];

const PAGE_IDS: HwePageId[] = [
  'copies',
  'square',
  'definetti',
  'census',
  'forces',
  'check',
];

export const CH01_HWE: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'copies',
      shortLabel: '1 Copies',
      eyebrow: 'ALLELES VS. GENOTYPES · YULE’S ERROR',
      heading: 'Count copies, not beetles',
      bodyHtml: `Each beetle carries <strong>two copies</strong> of a wing-colour gene, one tucked under each wing case. Blue (<strong>A</strong>) is ${gloss('dominance', 'dominant')} over amber (<strong>a</strong>), so <em>Aa</em> looks blue. Tap 3D beetles to swing open their wing cases and pour their copies into the jars—then test whether dominant blue takes over.`,
      promptHint: 'Click any 3D beetle on the tray (or click Open All) to watch its two allele pearls fly into the jars.',
    },
    {
      id: 'square',
      shortLabel: '2 Square',
      eyebrow: 'RANDOM PAIRING OF GAMETES',
      heading: 'The square is the equation',
      bodyHtml: `Under ${gloss('hardy_weinberg', 'Hardy–Weinberg equilibrium')}, mating draws one egg and one sperm independently from the gene pool (${gloss('allele_freq', 'p and q')}). Slide <em>p</em> below and watch the 3D area tiles resize—then merge both mixed <em>Aa</em> pillars to see why the heterozygote term is <strong>2pq</strong>.`,
      promptHint: 'Drag the p slider, fire a burst of gametes, and toggle “Merge Aa Pillars” to stack both mixed cells.',
    },
    {
      id: 'definetti',
      shortLabel: '3 One Gen',
      eyebrow: 'THE 3D DE FINETTI LANDSCAPE',
      heading: 'One generation from any starting mix',
      bodyHtml: `Every possible ${gloss('genotype_freq', 'genotype mix')} sits at one point on the 3D ${gloss('de_finetti', 'de Finetti triangle')}. Choose a bizarre starting mix—or click directly on the 3D ivory triangle—and mate one generation. Watch the population leap vertically straight onto the golden curve while <em>p</em> stays put.`,
      promptHint: 'Try “Unequal Sexes (pf=0.9, pm=0.3)” to see Gen 1 overshoot ABOVE the curve before settling in Gen 2!',
    },
    {
      id: 'census',
      shortLabel: '4 Census',
      eyebrow: 'TESTING THE NULL MODEL · χ² (1 DF)',
      heading: 'Small samples fit almost anything',
      bodyHtml: `Field geneticists test real beaches with a ${gloss('chi_square', 'χ² test (1 df)')}; values above <strong>3.84</strong> flag a 5% departure. Click anywhere on the 3D sand to drop your brass quadrat and sample ~25 beetles at a time—then compare your small sample against the full beach census.`,
      promptHint: 'Click around the 3D beach to sample North Beach (hidden deficit) vs. South Beach (true HW).',
    },
    {
      id: 'forces',
      shortLabel: '5 Forces',
      eyebrow: 'WHAT BREAKS HARDY–WEINBERG?',
      heading: 'Inbreeding, demes & warfarin rats',
      bodyHtml: `Hardy–Weinberg is a diagnostic yardstick. Switch between three living 3D worlds below: ${gloss('inbreeding_f', 'close-relative mating (F)')}, pooled subpopulations (${gloss('wahlund', 'Wahlund effect')}), and ${gloss('heterozygote_advantage', 'heterozygote advantage')} in warfarin-resistant Norway rats (<em>VKORC1</em>).`,
      promptHint: 'Switch the 3 force tabs below to inspect how each mechanism leaves a distinct signature.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'DIAGNOSTIC MASTERY CHECK',
      heading: 'A fit rules nothing out',
      bodyHtml: `Apply your Hardy–Weinberg toolkit to three real population-genetics puzzles—including estimating hidden ${gloss('carrier', 'recessive carriers')} and spotting evolution hidden inside a fitting population.`,
      promptHint: 'Complete all three diagnoses to stamp Equilibrium complete in your Atlas.',
    },
  ],

  teacherGuide: {
    estimatedMinutes: 18,
    level: 'Undergraduate Population Genetics (Year 1–2)',
    learningObjectives: [
      'Distinguish allele frequencies (p, q) from genotype and phenotype frequencies, and refute Yule’s misconception that dominant alleles naturally increase.',
      'Derive p², 2pq, q² geometrically from independent gamete draws and explain why autosomal equilibrium is reached in 1 generation (2 generations if allele frequencies differ between sexes).',
      'Apply a 1-df χ² goodness-of-fit test and explain why small samples have low statistical power—failing to reject HW never proves equilibrium.',
      'Contrast three distinct departures: genome-wide heterozygote deficit from inbreeding (2pq(1 − F)), sampling deficit from pooled demes (Wahlund, 2Var(p)), and adult heterozygote excess from overdominance (q̂ = s₁/(s₁ + s₂)) in warfarin-resistant rats.',
      'Recognise that populations undergoing drift or post-mating migration can still fit Hardy–Weinberg proportions every generation.',
    ],
    commonMisconceptions: [
      {
        misconception: '“A dominant allele automatically spreads until 75% of the population shows it.”',
        correction:
          'Dominance describes phenotype expression inside heterozygotes, not transmission advantage. With p = 0.30 and random mating, blue stays at 51% forever.',
      },
      {
        misconception: '“If χ² < 3.84, the population is in Hardy–Weinberg equilibrium and not evolving.”',
        correction:
          'Two separate errors: (1) small samples have low power (~19% at n=40, F=0.20), and (2) drift and selection after birth can move p while newborns still fit HW.',
      },
      {
        misconception: '“Inbreeding decreases allele frequency p.”',
        correction:
          'Inbreeding changes genotype proportions (converting Aa into AA and aa across all loci) while leaving p completely unchanged.',
      },
    ],
    discussionPrompts: [
      'In Page 1, half the beetles look blue yet only 30% of gene copies are A. Where are the missing A alleles—or rather, why are there so many hidden a copies?',
      'In Page 5, both inbreeding and the Wahlund effect produce fewer heterozygotes than 2pq. What single field measurement distinguishes them?',
      'A population fits Hardy–Weinberg proportions at a neutral SNP. Name two evolutionary forces that could still be actively changing allele frequencies.',
    ],
    activityTip:
      'Have students compare North Beach at n ≈ 25 (one quadrat drop) versus n = 300 (full census) in Page 4, then poll the room on how many got a false “fits HW” on their first quadrat.',
  },

  scienceCard: {
    coreTakeaway:
      'Hardy–Weinberg (p² + 2pq + q² = 1) is the null model of diploid population genetics: departures diagnose specific forces or structure, while a fit alone rules out neither drift nor migration.',
    assumptions: [
      {
        label: 'Two-Allele Autosomal Locus',
        status: 'realistic',
        tag: 'Exact math',
        detail:
          'Allele counts, 1-df χ² (3.84 at α = 0.05), inbreeding recursion Aa = 2pq(1 − F), Wahlund 2Var(p), and overdominance equilibrium q̂ = s₁/(s₁ + s₂) use exact analytical equations.',
      },
      {
        label: 'Unequal Sexes & X-Linkage',
        status: 'simplified',
        tag: 'Note',
        detail:
          'Autosomal loci with unequal male/female allele frequencies reach HW in 2 generations (shown in Page 3). X-linked loci approach equilibrium gradually via damped oscillation (covered in The Royal Line).',
      },
      {
        label: 'Warfarin-Resistant Norway Rats (VKORC1)',
        status: 'scaled',
        tag: '×N seasons',
        detail:
          'We model pure recessive vitamin-K cost (s₂ = 0.5 for aa, 0 for Aa) so the classic q̂ = s₁/(s₁ + s₂) overdominance equilibrium reads transparently. In real Welsh farms (Partridge 1979), heterozygotes also paid a partial cost (~0.77 fitness without warfarin), so resistance declined faster after withdrawal.',
      },
    ],
    citations: [
      {
        authors: 'Hardy, G. H.',
        year: 1908,
        title: 'Mendelian proportions in a mixed population',
        journal: 'Science 28: 49–50',
      },
      {
        authors: 'Weinberg, W.',
        year: 1908,
        title: 'Über den Nachweis der Vererbung beim Menschen',
        journal: 'Jahreshefte des Vereins für vaterländische Naturkunde in Württemberg 64: 368–382',
      },
      {
        authors: 'Wright, S.',
        year: 1921,
        title: 'Systems of mating',
        journal: 'Genetics 6: 111–178',
      },
      {
        authors: 'Wahlund, S.',
        year: 1928,
        title: 'Zusammensetzung von Populationen und Korrelationserscheinungen vom Standpunkt der Vererbungslehre aus betrachtet',
        journal: 'Hereditas 11: 65–106',
      },
      {
        authors: 'Lewontin, R. C. & Cockerham, C. C.',
        year: 1959,
        title: 'The goodness-of-fit test for detecting natural selection in random mating populations',
        journal: 'Evolution 13: 561–564',
      },
      {
        authors: 'Pelz, H.-J., Rost, S., Hünerberg, M. et al.',
        year: 2005,
        title: 'The genetic basis of resistance to anticoagulants in rodents',
        journal: 'Genetics 170: 1839–1847',
      },
      {
        authors: 'Partridge, G. G.',
        year: 1979,
        title: 'Relative fitness of genotypes in a population of Rattus norvegicus polymorphic for warfarin resistance',
        journal: 'Heredity 43: 239–246',
      },
    ],
    standards: {
      undergrad: [
        'Population genetics: allele/genotype frequencies, HW null model, de Finetti representation',
        'Statistical genetics: 1-df χ² goodness-of-fit, statistical power, carrier frequency estimation',
        'Non-random mating (F), population structure (Wahlund), and balancing selection (overdominance)',
      ],
      apOrALevel: [
        'AP Biology EVO-1.K / EVO-1.L: Hardy–Weinberg equilibrium & allele frequency calculations',
        'UK A-Level Biology: p² + 2pq + q² = 1 and factors disrupting genetic equilibrium',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <div class="plate-caption-pill">
          <span class="plate-caption-text" data-hwe-caption>Beetle Isle — 20 beetles &amp; glass allele jars</span>
          <span class="plate-scale-bar">
            <span data-hwe-tag>p = 0.30</span>
          </span>
        </div>
        <div class="plate-view-tools">
          <button type="button" class="plate-tool-btn" data-hwe-reset>Reset 3D</button>
        </div>
      </div>

      <div class="plate-canvas-host" data-hwe-canvas></div>

      <div class="hwe-plate-legend" data-hwe-legend>
        <span><i class="hwe-dot blue"></i>AA (blue)</span>
        <span><i class="hwe-dot split"></i>Aa (looks blue)</span>
        <span><i class="hwe-dot amber"></i>aa (amber)</span>
      </div>

      <div class="plate-orbit-hint" style="bottom:18px;">Drag to orbit 3D · Scroll to zoom</div>
    `;

    const captionEl = plateStageEl.querySelector<HTMLElement>('[data-hwe-caption]')!;
    const tagEl = plateStageEl.querySelector<HTMLElement>('[data-hwe-tag]')!;
    const legendEl = plateStageEl.querySelector<HTMLElement>('[data-hwe-legend]')!;
    const canvasHost = plateStageEl.querySelector<HTMLElement>('[data-hwe-canvas]')!;
    const resetBtn = plateStageEl.querySelector<HTMLButtonElement>('[data-hwe-reset]')!;

    // State per page
    let currentStep = 0;

    // Page 1 state
    let yuleRan = false;
    const yuleSeries = simulateYule30(17, 0.3, 20000);

    // Page 2 state
    let p2Value = 0.3;
    let p2Merged = false;

    // Page 3 state
    let p3Mode: 'all-homo' | 'all-het' | 'lopsided' | 'unequal' | 'custom' = 'all-homo';
    let p3Parents: GenotypeTriple = [0.5, 0.0, 0.5];
    let p3Gen1: GenotypeTriple = [0.25, 0.5, 0.25];
    let p3Gen2: GenotypeTriple | null = null;
    let p3Mated = false;

    // Page 4 state
    let p4Beach: 'north' | 'south' = 'north'; // North departs (F=0.20), South fits (F=0)
    let p4Beetles: BeachBeetle[] = generateBeachPopulation(401, 300, 0.5, 0.22);

    // Page 5 state
    let p5Mode: ForceMode = 'inbreeding';
    let p5InbGen = 0; // 0 = HW, 1 = F=0.25, 2 = F=0.375, 3 = F=0.50, 4 = Mix restored!
    let p5WahlSplit = false;
    const p5WahlBeetles = generateWahlundBeach(55, 240);
    let p5WarfTrays = 3;
    let p5WarfSeason = 0;
    let p5WarfQ = 0.08;
    let p5WarfHistory: { s: number; q: number; baitOn: boolean }[] = [{ s: 0, q: 0.08, baitOn: true }];
    let p5WarfAdults: GenotypeTriple = hwExpected(1 - 0.08);

    // Page 6 Check state
    let checkIdx = 0;
    let checkScore = 0;
    let checkAnswered = false;
    let checkFeedback: { good: boolean; text: string } | null = null;
    let checkDone = ctx.isChapterComplete('hwe');

    const scene3d = new HweScene3D(canvasHost, {
      onBeetleOpened: () => {
        if (currentStep === 0) renderPage1Left();
      },
      onTrianglePick: (aa, het, rec) => {
        if (currentStep !== 2) return;
        p3Mode = 'custom';
        p3Parents = [aa, het, rec];
        const p = aa + 0.5 * het;
        p3Gen1 = hwExpected(p);
        p3Gen2 = null;
        p3Mated = true;
        scene3d.setDeFinettiPoints(p3Parents, p3Gen1, null);
        renderPage3Left();
      },
      onQuadratDrop: (qx, qz) => {
        if (currentStep !== 3) return;
        const half = 0.66;
        for (const b of p4Beetles) {
          if (Math.abs(b.x - qx) <= half && Math.abs(b.z - qz) <= half) {
            b.sampled = true;
          }
        }
        scene3d.setBeachPopulation(p4Beetles, qx, qz);
        renderPage4Left();
      },
    });

    resetBtn.addEventListener('click', () => scene3d.resetView());

    // =========================================================================
    // PAGE 1: TWO COPIES EACH & YULE'S ERROR
    // =========================================================================

    function renderPage1Left(): void {
      const c = scene3d.getPage1Counts();
      const totalCopies = c.aCount + c.qCount;
      const pObs = totalCopies > 0 ? c.aCount / totalCopies : 0.3;
      const qObs = 1 - pObs;

      captionEl.textContent = 'Beetle Isle specimen tray — tap beetles to open wing cases';
      tagEl.textContent = `${c.opened}/${c.total} opened`;

      // Inked Yule 30-generation SVG chart (when toggled on)
      const yuleSvg = yuleRan
        ? (() => {
            const pts = yuleSeries
              .map((d, i) => {
                const x = 28 + (i / 30) * 252;
                const y = 92 - d.blueFrac * 80;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              })
              .join(' ');
            const yuleY = (92 - 0.75 * 80).toFixed(1);
            const pY = (92 - 0.30 * 80).toFixed(1);
            return `
              <div class="hwe-card">
                <div class="hwe-card-head">
                  <span class="hwe-kicker">30 Generations (N = 20,000)</span>
                  <span class="hwe-stat-badge" style="color:#2e61d1;">Blue stays ~51%</span>
                </div>
                <svg class="hwe-svg-plot" viewBox="0 0 295 104" aria-label="30-generation random mating chart">
                  <line x1="28" y1="12" x2="28" y2="92" stroke="#8c7e6e" stroke-width="1"/>
                  <line x1="28" y1="92" x2="284" y2="92" stroke="#8c7e6e" stroke-width="1"/>
                  <!-- Yule's mistaken 75% line -->
                  <line x1="28" y1="${yuleY}" x2="284" y2="${yuleY}" stroke="#b84a27" stroke-width="1.4" stroke-dasharray="4 3"/>
                  <text x="282" y="${Number(yuleY) - 4}" text-anchor="end" font-family="IBM Plex Mono" font-size="9" fill="#b84a27">Yule’s bet: 75%</text>
                  <!-- Allele p = 30% line -->
                  <line x1="28" y1="${pY}" x2="284" y2="${pY}" stroke="#685b4e" stroke-width="1" stroke-dasharray="2 3"/>
                  <text x="282" y="${Number(pY) + 10}" text-anchor="end" font-family="IBM Plex Mono" font-size="9" fill="#685b4e">A copies: p = 30%</text>
                  <!-- Observed 51% blue phenotype curve -->
                  <polyline fill="none" stroke="#2e61d1" stroke-width="2.4" points="${pts}"/>
                  <text x="34" y="47" font-family="IBM Plex Mono" font-size="9.5" font-weight="600" fill="#2e61d1">Blue beetles (AA + Aa): 51%</text>
                  <text x="28" y="102" font-family="IBM Plex Mono" font-size="8.5" fill="#685b4e">Gen 0</text>
                  <text x="284" y="102" text-anchor="end" font-family="IBM Plex Mono" font-size="8.5" fill="#685b4e">Gen 30</text>
                </svg>
              </div>
            `;
          })()
        : '';

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Allele Copy Jars (Not Beetle Counts)</span>
            <span class="hwe-stat-badge">${totalCopies} copies sorted</span>
          </div>
          <div class="hwe-pq-bar">
            <div class="hwe-pq-a" style="width:${totalCopies ? Math.round(pObs * 100) : 50}%;">
              ${totalCopies ? `p = ${pObs.toFixed(2)} (${c.aCount} A)` : 'Open beetles →'}
            </div>
            <div class="hwe-pq-q" style="width:${totalCopies ? Math.round(qObs * 100) : 50}%;">
              ${totalCopies ? `q = ${qObs.toFixed(2)} (${c.qCount} a)` : ''}
            </div>
          </div>
          <div style="font-size:12.5px; color:var(--ink-muted);">
            On the tray: <strong>50%</strong> of beetles look blue (10 of 20), yet 8 of those 10 are <em>Aa</em> carriers hiding an amber <strong>a</strong> copy!
          </div>
          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn primary" data-open-all>
              ${c.opened < c.total ? 'Open All 20 Wing Cases' : 'All 20 Opened ✓'}
            </button>
            <button type="button" class="hwe-action-btn ${yuleRan ? 'is-on' : ''}" data-run-yule>
              ${yuleRan ? '30 Gens Complete ✓' : 'Run 30 Generations →'}
            </button>
            ${c.opened > 0 ? `<button type="button" class="hwe-action-btn" data-reset-p1>Close</button>` : ''}
          </div>
        </div>

        ${yuleSvg}

        <div class="hwe-eq-box">
          p = (2·AA + Aa) / 2N = 12 / 40 = <strong>0.30</strong> &nbsp;·&nbsp; Blue = 1 − q² = <strong>51%</strong>
          <div class="hwe-eq-sub">Dominant does not mean common — Hardy’s 1908 answer to Yule.</div>
        </div>
      `;

      leftPanelEl.querySelector('[data-open-all]')?.addEventListener('click', () => {
        scene3d.openAllBeetles();
        renderPage1Left();
      });
      leftPanelEl.querySelector('[data-run-yule]')?.addEventListener('click', () => {
        yuleRan = true;
        scene3d.openAllBeetles();
        renderPage1Left();
      });
      leftPanelEl.querySelector('[data-reset-p1]')?.addEventListener('click', () => {
        yuleRan = false;
        scene3d.resetPage1Beetles();
        renderPage1Left();
      });
    }

    // =========================================================================
    // PAGE 2: 3D p × q GAMETE PAIRING BOARD
    // =========================================================================

    function renderPage2Left(): void {
      const p = p2Value;
      const q = 1 - p;
      const exp = hwExpected(p);
      captionEl.textContent = '3D Gamete Pairing Board — eggs (top) × sperm (left)';
      tagEl.textContent = `p = ${p.toFixed(2)}, q = ${q.toFixed(2)}`;

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Set Gamete Pool Frequency</span>
            <span class="hwe-stat-badge">p = ${p.toFixed(2)} · q = ${q.toFixed(2)}</span>
          </div>
          <div class="hwe-slider-row">
            <input type="range" class="hwe-slider" min="0.08" max="0.92" step="0.02" value="${p}" data-p2-slider aria-label="Allele frequency p"/>
          </div>
          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn primary" data-p2-burst>Pair Gametes ✦</button>
            <button type="button" class="hwe-action-btn ${p2Merged ? 'is-on' : ''}" data-p2-merge>
              ${p2Merged ? 'Split Aa Cells' : 'Merge Both Aa Pillars (×2)'}
            </button>
          </div>
        </div>

        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Offspring Proportions</span>
            <span class="hwe-stat-badge">Aa forms 2 ways: A×a &amp; a×A</span>
          </div>
          ${renderGenoBarsHtml(exp, exp)}
        </div>

        <div class="hwe-eq-box">
          p² + 2pq + q² = <strong>${pct(exp[0])}</strong> + <strong>${pct(exp[1])}</strong> + <strong>${pct(exp[2])}</strong> = 100%
          <div class="hwe-eq-sub">Notice that heterozygotes peak at 50% when p = q = 0.50.</div>
        </div>
      `;

      leftPanelEl.querySelector<HTMLInputElement>('[data-p2-slider]')?.addEventListener('input', (e) => {
        p2Value = parseFloat((e.target as HTMLInputElement).value);
        scene3d.setSquareState(p2Value, p2Merged, false);
        renderPage2Left();
      });
      leftPanelEl.querySelector('[data-p2-burst]')?.addEventListener('click', () => {
        scene3d.setSquareState(p2Value, p2Merged, true);
      });
      leftPanelEl.querySelector('[data-p2-merge]')?.addEventListener('click', () => {
        p2Merged = !p2Merged;
        scene3d.setSquareState(p2Value, p2Merged, false);
        renderPage2Left();
      });
    }

    // =========================================================================
    // PAGE 3: 3D DE FINETTI TRIANGLE & ONE GENERATION
    // =========================================================================

    function applyDeFinettiPreset(mode: typeof p3Mode, mateNow = false): void {
      p3Mode = mode;
      if (mode === 'all-homo') {
        p3Parents = [0.5, 0, 0.5];
        p3Gen1 = hwExpected(0.5);
        p3Gen2 = null;
      } else if (mode === 'all-het') {
        p3Parents = [0, 1, 0];
        p3Gen1 = hwExpected(0.5);
        p3Gen2 = null;
      } else if (mode === 'lopsided') {
        p3Parents = [0.8, 0, 0.2];
        p3Gen1 = hwExpected(0.8);
        p3Gen2 = null;
      } else if (mode === 'unequal') {
        // Females pF=0.9, Males pM=0.3 -> average p=0.60
        // Gen 1 overshoots ABOVE the curve: [0.27, 0.66, 0.07] (excess heterozygotes!)
        // Gen 2 lands on HW at p=0.60: [0.36, 0.48, 0.16]
        p3Parents = [0.6, 0, 0.4];
        p3Gen1 = mateOneGeneration(0.9, 0.3);
        p3Gen2 = hwExpected(0.6);
      }
      p3Mated = mateNow;
      if (mateNow) {
        scene3d.setDeFinettiPoints(p3Parents, p3Gen1, p3Gen2);
      } else {
        scene3d.setDeFinettiPoints(p3Parents, p3Parents, null);
      }
    }

    function renderPage3Left(): void {
      const p = p3Parents[0] + 0.5 * p3Parents[1];
      captionEl.textContent = '3D de Finetti Triangle — tap ivory surface or pick a parent mix';
      tagEl.textContent = `p = ${p.toFixed(2)}`;

      const shown = p3Mated ? p3Gen1 : p3Parents;
      const exp = hwExpected(p);

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Starting Parent Mix</span>
            <span class="hwe-stat-badge">p = ${p.toFixed(2)} (fixed)</span>
          </div>
          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn ${p3Mode === 'all-homo' ? 'is-on' : ''}" data-p3-pre="all-homo">50% AA + 50% aa</button>
            <button type="button" class="hwe-action-btn ${p3Mode === 'all-het' ? 'is-on' : ''}" data-p3-pre="all-het">100% Aa</button>
            <button type="button" class="hwe-action-btn ${p3Mode === 'lopsided' ? 'is-on' : ''}" data-p3-pre="lopsided">80% AA + 20% aa</button>
            <button type="button" class="hwe-action-btn ${p3Mode === 'unequal' ? 'is-on' : ''}" data-p3-pre="unequal">Unequal Sexes (pf 0.9, pm 0.3)</button>
          </div>
          <div class="hwe-btn-row" style="margin-top:2px;">
            <button type="button" class="hwe-action-btn primary" data-p3-mate>
              ${p3Mated ? 'Mated ✓ (Re-animate)' : 'Mate 1 Generation →'}
            </button>
          </div>
        </div>

        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">${p3Mated ? 'Gen 1 Offspring (vs. dashed HW)' : 'Parents (before mating)'}</span>
            <span class="hwe-stat-badge">${p3Mode === 'unequal' && p3Mated ? 'Overshoots HW!' : p3Mated ? 'On HW Curve ✓' : 'Off HW Curve'}</span>
          </div>
          ${renderGenoBarsHtml(shown, exp)}
        </div>

        <div class="hwe-eq-box">
          ${
            p3Mode === 'unequal' && p3Mated
              ? `Gen 1: <strong>27% AA · 66% Aa · 7% aa</strong> (excess het!) → Gen 2 teal bead lands on HW (36/48/16).`
              : `One generation of random mating moves any autosomal mix vertically onto the golden HW curve while <strong>p stays constant</strong>.`
          }
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-p3-pre]').forEach((btn) => {
        btn.addEventListener('click', () => {
          applyDeFinettiPreset(btn.dataset.p3Pre as typeof p3Mode, false);
          renderPage3Left();
        });
      });

      leftPanelEl.querySelector('[data-p3-mate]')?.addEventListener('click', () => {
        applyDeFinettiPreset(p3Mode, true);
        renderPage3Left();
      });
    }

    // =========================================================================
    // PAGE 4: 300-BEETLE CENSUS, QUADRAT & χ² (1 DF)
    // =========================================================================

    function countSampledBeach(): GenotypeTriple {
      let aa = 0;
      let het = 0;
      let rec = 0;
      for (const b of p4Beetles) {
        if (!b.sampled) continue;
        if (b.genotype === 'AA') aa += 1;
        else if (b.genotype === 'Aa') het += 1;
        else rec += 1;
      }
      return [aa, het, rec];
    }

    function renderPage4Left(): void {
      const counts = countSampledBeach();
      const n = counts[0] + counts[1] + counts[2];
      const obsFrac = fracsFromCounts(counts);
      const pEst = pFromCounts(counts);
      const expFrac = hwExpected(pEst);
      const chi = chiSquare1df(counts);
      const fhat = fHatFromCounts(counts);
      const sig = n >= 10 && chi >= 3.84;

      captionEl.textContent = `${p4Beach === 'north' ? 'North Beach' : 'South Beach'} — click sand to drop 3D brass quadrat`;
      tagEl.textContent = `n = ${n} / ${p4Beetles.length}`;

      const chiPct = Math.min(100, (chi / 10) * 100);

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Choose Study Beach</span>
            <span class="hwe-stat-badge">n = ${n} genotyped</span>
          </div>
          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn ${p4Beach === 'north' ? 'is-on' : ''}" data-beach="north">North Beach</button>
            <button type="button" class="hwe-action-btn ${p4Beach === 'south' ? 'is-on' : ''}" data-beach="south">South Beach</button>
            <button type="button" class="hwe-action-btn primary" data-full-census>Full Census (n = 300)</button>
          </div>
        </div>

        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">χ² Goodness-of-Fit (1 df · 5% = 3.84)</span>
            <span class="hwe-stat-badge" style="color:${sig ? '#b83828' : '#247366'};">
              χ² = ${chi.toFixed(2)} ${n < 10 ? '(sample more)' : sig ? '· Departs' : '· Fits HW'}
            </span>
          </div>
          <div class="hwe-chi-track">
            <div class="hwe-chi-fill" style="width:${chiPct}%; background:${sig ? '#c24432' : '#2d8a7e'};"></div>
            <div class="hwe-chi-mark" style="left:38.4%;" title="3.84 (p = 0.05 threshold)"></div>
          </div>
          <div style="display:flex; justify-content:space-between; font-family:var(--font-mono); font-size:10px; color:var(--ink-muted);">
            <span>0</span>
            <span style="margin-left:16%;">↑ 3.84 (p = 0.05)</span>
            <span>10+</span>
          </div>
          ${n > 0 ? renderGenoBarsHtml(obsFrac, expFrac) : `<div style="font-size:13px; color:var(--ink-muted);">Click anywhere on the 3D sandy beach to drop your brass quadrat and genotype beetles.</div>`}
        </div>

        <div class="hwe-eq-box">
          ${
            n === p4Beetles.length
              ? p4Beach === 'north'
                ? `Full North Beach: heterozygotes are <strong>${Math.round(fhat * 100)}% short</strong> of 2pq (χ² = ${chi.toFixed(1)}). Notice how easy it was to miss with just 1–2 small quadrats!`
                : `Full South Beach: matches Hardy–Weinberg (χ² = ${chi.toFixed(2)}).`
              : `χ² = Σ(O − E)² / E (1 df). At n ≈ 40, a true 20% shortfall is caught only ~1 in 5 times.`
          }
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-beach]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p4Beach = btn.dataset.beach as 'north' | 'south';
          p4Beetles = generateBeachPopulation(
            p4Beach === 'north' ? 401 : 402,
            300,
            p4Beach === 'north' ? 0.5 : 0.42,
            p4Beach === 'north' ? 0.22 : 0.0
          );
          scene3d.setBeachPopulation(p4Beetles, 0, 0);
          renderPage4Left();
        });
      });

      leftPanelEl.querySelector('[data-full-census]')?.addEventListener('click', () => {
        p4Beetles.forEach((b) => {
          b.sampled = true;
        });
        scene3d.setBeachPopulation(p4Beetles);
        renderPage4Left();
      });
    }

    // =========================================================================
    // PAGE 5: 3D FORCE LAB (INBREEDING · WAHLUND · WARFARIN RATS)
    // =========================================================================

    function renderPage5Left(): void {
      scene3d.setForceMode(p5Mode);

      const forceTabsHtml = `
        <div class="hwe-force-tabs">
          <button type="button" class="hwe-force-tab ${p5Mode === 'inbreeding' ? 'is-active' : ''}" data-force="inbreeding">Inbreeding (F)</button>
          <button type="button" class="hwe-force-tab ${p5Mode === 'wahlund' ? 'is-active' : ''}" data-force="wahlund">Wahlund Demes</button>
          <button type="button" class="hwe-force-tab ${p5Mode === 'warfarin' ? 'is-active' : ''}" data-force="warfarin">Warfarin Rats</button>
        </div>
      `;

      if (p5Mode === 'inbreeding') {
        const fSeries = [0, 0.25, 0.375, 0.5, 0];
        const F = fSeries[p5InbGen];
        const obs = inbredExpected(0.5, F);
        const exp = hwExpected(0.5);
        scene3d.updateInbreedingScene(0.5, F);
        captionEl.textContent = '3D Family Burrows — sib mating cuts heterozygotes while p jars hold level';
        tagEl.textContent = `F = ${F.toFixed(3)} · p = 0.50`;

        leftPanelEl.innerHTML = `
          ${forceTabsHtml}
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">Full-Sib Mating vs. Random Mix</span>
              <span class="hwe-stat-badge">F = ${F.toFixed(3)} · p = 0.50</span>
            </div>
            <div class="hwe-btn-row">
              <button type="button" class="hwe-action-btn primary" data-inb-sib ${p5InbGen >= 3 && p5InbGen < 4 ? 'disabled' : ''}>
                +1 Gen Sib Mating
              </button>
              <button type="button" class="hwe-action-btn" data-inb-mix>
                Flip Valve → Mix (1 Gen)
              </button>
            </div>
            ${renderGenoBarsHtml(obs, exp)}
          </div>
          <div class="hwe-eq-box">
            Aa = 2pq(1 − F) = <strong>${pct(obs[1])}</strong> &nbsp;·&nbsp; Jars unchanged: <strong>p = 0.50</strong>
            <div class="hwe-eq-sub">Inbreeding reduces heterozygotes across ALL genes (wing colour &amp; head spots); 1 gen of mixing restores 2pq.</div>
          </div>
        `;

        leftPanelEl.querySelector('[data-inb-sib]')?.addEventListener('click', () => {
          p5InbGen = p5InbGen === 4 ? 1 : Math.min(3, p5InbGen + 1);
          renderPage5Left();
        });
        leftPanelEl.querySelector('[data-inb-mix]')?.addEventListener('click', () => {
          p5InbGen = 4;
          renderPage5Left();
        });
      } else if (p5Mode === 'wahlund') {
        scene3d.updateWahlundScene(p5WahlBeetles, p5WahlSplit);
        const pool = wahlundPool(0.8, 0.2, 0.5);
        const d1 = hwExpected(0.8);
        const d2 = hwExpected(0.2);

        captionEl.textContent = p5WahlSplit
          ? 'Split Beach — Dune (p = 0.80) & Marsh (p = 0.20) each fit HW!'
          : 'Pooled Beach — combining two demes creates a huge heterozygote deficit';
        tagEl.textContent = p5WahlSplit ? 'Split · Both fit' : 'Pooled · Deficit 18%';

        leftPanelEl.innerHTML = `
          ${forceTabsHtml}
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">Dune (p = 0.80) + Marsh (p = 0.20)</span>
              <span class="hwe-stat-badge">${p5WahlSplit ? 'Survey Rope Down ✓' : 'Pooled Sample'}</span>
            </div>
            <div class="hwe-btn-row">
              <button type="button" class="hwe-action-btn primary" data-wahl-toggle>
                ${p5WahlSplit ? 'Remove Boundary (Pool Again)' : 'Drop 3D Survey Boundary Rope →'}
              </button>
            </div>
            ${
              p5WahlSplit
                ? `<div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-family:var(--font-mono); font-size:11px;">
                     <div style="padding:7px; border-radius:6px; background:rgba(230,214,181,0.45);">
                       <strong>Dune (p=0.80)</strong><br/>AA ${pct(d1[0])} · Aa ${pct(d1[1])} · aa ${pct(d1[2])}<br/><span style="color:#247366;">Fits HW ✓</span>
                     </div>
                     <div style="padding:7px; border-radius:6px; background:rgba(154,163,138,0.3);">
                       <strong>Marsh (p=0.20)</strong><br/>AA ${pct(d2[0])} · Aa ${pct(d2[1])} · aa ${pct(d2[2])}<br/><span style="color:#247366;">Fits HW ✓</span>
                     </div>
                   </div>`
                : renderGenoBarsHtml(pool.pooled, pool.expectedHW)
            }
          </div>
          <div class="hwe-eq-box">
            Wahlund deficit = 2·Var(p) = <strong>18%</strong> (observed Aa 32% vs. expected 50%)
            <div class="hwe-eq-sub">The deficit lived in your pooled sampling—not inside either beetle deme.</div>
          </div>
        `;

        leftPanelEl.querySelector('[data-wahl-toggle]')?.addEventListener('click', () => {
          p5WahlSplit = !p5WahlSplit;
          renderPage5Left();
        });
      } else {
        // Warfarin Norway Rats (VKORC1, Heterozygote Advantage)
        const s1 = p5WarfTrays * 0.16; // 0..0.64 mortality on susceptible AA
        const s2 = 0.5;                // vitamin-K deficiency cost on resistant aa
        const qHat = s1 + s2 > 0 ? s1 / (s1 + s2) : 0;
        const newborns = hwExpected(1 - p5WarfQ);
        scene3d.updateWarfarinScene(p5WarfAdults, p5WarfTrays);

        captionEl.textContent = '3D Farmyard — warfarin kills AA, vitamin-K shortage hurts aa, Aa thrives';
        tagEl.textContent = `Season ${p5WarfSeason} · q = ${p5WarfQ.toFixed(2)}`;

        const trajPts = p5WarfHistory
          .map((d, i) => {
            const x = 24 + (i / Math.max(12, p5WarfHistory.length - 1)) * 255;
            const y = 86 - d.q * 74;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(' ');
        const qHatY = (86 - qHat * 74).toFixed(1);

        leftPanelEl.innerHTML = `
          ${forceTabsHtml}
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">Warfarin Trays (s₁ = ${s1.toFixed(2)} · aa cost s₂ = 0.50)</span>
              <span class="hwe-stat-badge">q = ${p5WarfQ.toFixed(2)} · q̂ = ${qHat.toFixed(2)}</span>
            </div>
            <div class="hwe-btn-row">
              <button type="button" class="hwe-action-btn ${p5WarfTrays === 3 ? 'is-on' : ''}" data-trays="3">3 Bait Trays</button>
              <button type="button" class="hwe-action-btn ${p5WarfTrays === 0 ? 'is-on' : ''}" data-trays="0">Withdraw Bait</button>
              <button type="button" class="hwe-action-btn primary" data-warf-step>+2 Seasons →</button>
              <button type="button" class="hwe-action-btn" data-warf-reset>Reset</button>
            </div>
            <svg class="hwe-svg-plot" style="height:92px;" viewBox="0 0 290 96" aria-label="Warfarin resistance trajectory">
              <line x1="24" y1="10" x2="24" y2="86" stroke="#8c7e6e" stroke-width="1"/>
              <line x1="24" y1="86" x2="280" y2="86" stroke="#8c7e6e" stroke-width="1"/>
              ${
                qHat > 0
                  ? `<line x1="24" y1="${qHatY}" x2="280" y2="${qHatY}" stroke="#b84a27" stroke-width="1.2" stroke-dasharray="4 3"/>
                     <text x="278" y="${Number(qHatY) - 4}" text-anchor="end" font-family="IBM Plex Mono" font-size="9" fill="#b84a27">q̂ = s₁/(s₁+s₂) = ${qHat.toFixed(2)}</text>`
                  : ''
              }
              <polyline fill="none" stroke="#285e82" stroke-width="2.4" points="${trajPts}"/>
              <text x="28" y="20" font-family="IBM Plex Mono" font-size="9" fill="#285e82">Adults Aa: ${pct(p5WarfAdults[1])} (Newborns: ${pct(newborns[1])})</text>
            </svg>
          </div>
          <div class="hwe-eq-box">
            q̂ = s₁ / (s₁ + s₂) = <strong>${qHat.toFixed(2)}</strong>
            <div class="hwe-eq-sub">Selection acts after birth: newborns sit ON the HW curve, while surviving adults show <strong>heterozygote excess</strong>!</div>
          </div>
        `;

        leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-trays]').forEach((btn) => {
          btn.addEventListener('click', () => {
            p5WarfTrays = Number(btn.dataset.trays);
            renderPage5Left();
          });
        });

        leftPanelEl.querySelector('[data-warf-step]')?.addEventListener('click', () => {
          for (let k = 0; k < 2; k++) {
            const res = warfarinSeason(p5WarfQ, p5WarfTrays * 0.16, 0.5);
            p5WarfAdults = res.adults;
            p5WarfQ = res.nextQ;
            p5WarfSeason += 1;
            p5WarfHistory.push({ s: p5WarfSeason, q: p5WarfQ, baitOn: p5WarfTrays > 0 });
          }
          renderPage5Left();
        });

        leftPanelEl.querySelector('[data-warf-reset]')?.addEventListener('click', () => {
          p5WarfSeason = 0;
          p5WarfQ = 0.08;
          p5WarfTrays = 3;
          p5WarfAdults = hwExpected(1 - 0.08);
          p5WarfHistory = [{ s: 0, q: 0.08, baitOn: true }];
          renderPage5Left();
        });
      }

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-force]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p5Mode = btn.dataset.force as ForceMode;
          renderPage5Left();
        });
      });
    }

    // =========================================================================
    // PAGE 6: DIAGNOSTIC MASTERY CHECK
    // =========================================================================

    function renderPage6Left(): void {
      scene3d.setCheckSpecimen(checkIdx);
      captionEl.textContent =
        checkIdx === 0
          ? 'Diagnostic Case 1 — 4% amber beetles in Hardy–Weinberg'
          : checkIdx === 1
            ? 'Diagnostic Case 2 — Small drifting island over 4 generations'
            : 'Diagnostic Case 3 — Multi-locus heterozygote deficit';
      tagEl.textContent = `Case ${checkIdx + 1} / ${HWE_CHECKS.length}`;

      if (checkDone) {
        leftPanelEl.innerHTML = `
          <div class="check-card" style="border-left:4px solid #2d8a7e;">
            <div class="check-progress">
              <span>PLATE 1 COMPLETE</span>
              <span>✓ STAMPED IN ATLAS</span>
            </div>
            <h3 class="check-question">Equilibrium mastered!</h3>
            <p style="margin:0; font-size:14px; color:var(--ink-body);">
              You counted allele copies, derived <strong>p² + 2pq + q² = 1</strong> in 3D, tested sampling power with χ², and diagnosed inbreeding, Wahlund structure, and warfarin heterozygote advantage.
            </p>
            <div class="hwe-btn-row">
              <button type="button" class="hwe-action-btn" data-redo-hwe>Retake Check</button>
              <button type="button" class="hwe-action-btn primary" data-back-p1>Back to 3D Beetles</button>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('[data-redo-hwe]')?.addEventListener('click', () => {
          checkIdx = 0;
          checkScore = 0;
          checkAnswered = false;
          checkFeedback = null;
          checkDone = false;
          renderPage6Left();
        });
        leftPanelEl.querySelector('[data-back-p1]')?.addEventListener('click', () => {
          ctx.goToStep(0);
        });
        return;
      }

      const q = HWE_CHECKS[checkIdx];
      leftPanelEl.innerHTML = `
        <div class="check-card">
          <div class="check-progress">
            <span>CASE ${checkIdx + 1} OF ${HWE_CHECKS.length}</span>
            <span>SCORE ${checkScore}/${HWE_CHECKS.length}</span>
          </div>
          <h3 class="check-question">${q.prompt}</h3>
          <div class="check-options">
            ${q.options
              .map(
                (o) => `
                  <button
                    type="button"
                    class="check-opt-btn ${checkAnswered && o.correct ? 'is-correct' : ''}"
                    data-hwe-opt="${o.id}"
                    ${checkAnswered ? 'disabled' : ''}
                  >
                    ${o.label}
                  </button>
                `
              )
              .join('')}
          </div>
          ${
            checkFeedback
              ? `<div class="check-feedback ${checkFeedback.good ? 'good' : ''}">${checkFeedback.text}</div>`
              : ''
          }
          ${
            checkAnswered
              ? `<div style="display:flex; justify-content:flex-end;">
                   <button type="button" class="btn-step-next" data-hwe-next-q>
                     ${checkIdx + 1 < HWE_CHECKS.length ? 'Next Case →' : 'Stamp Plate Complete ✓'}
                   </button>
                 </div>`
              : ''
          }
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-hwe-opt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (checkAnswered) return;
          const opt = q.options.find((o) => o.id === btn.dataset.hweOpt);
          if (!opt) return;
          checkAnswered = true;
          if (opt.correct) checkScore += 1;
          else btn.classList.add('is-wrong');
          checkFeedback = { good: opt.correct, text: q.explanation };
          renderPage6Left();
        });
      });

      leftPanelEl.querySelector('[data-hwe-next-q]')?.addEventListener('click', () => {
        if (checkIdx + 1 < HWE_CHECKS.length) {
          checkIdx += 1;
          checkAnswered = false;
          checkFeedback = null;
          renderPage6Left();
        } else {
          checkDone = true;
          ctx.completeChapter('hwe', checkScore, HWE_CHECKS.length);
          renderPage6Left();
        }
      });
    }

    // =========================================================================
    // STEP LIFECYCLE
    // =========================================================================

    const onStepChange = (stepIndex: number) => {
      currentStep = stepIndex;
      const pageId = PAGE_IDS[stepIndex] ?? 'copies';
      scene3d.setPage(pageId);

      // Update legend badge for Warfarin rats vs Beetles
      legendEl.innerHTML =
        stepIndex === 4 && p5Mode === 'warfarin'
          ? `<span><i class="hwe-dot blue"></i>AA (susceptible)</span><span><i class="hwe-dot split"></i>Aa (resistant)</span><span><i class="hwe-dot amber"></i>aa (vit-K cost)</span>`
          : `<span><i class="hwe-dot blue"></i>AA (A+A)</span><span><i class="hwe-dot split"></i>Aa (A+a)</span><span><i class="hwe-dot amber"></i>aa (a+a)</span>`;

      if (stepIndex === 0) {
        renderPage1Left();
      } else if (stepIndex === 1) {
        scene3d.setSquareState(p2Value, p2Merged, false);
        renderPage2Left();
      } else if (stepIndex === 2) {
        applyDeFinettiPreset(p3Mode, p3Mated);
        renderPage3Left();
      } else if (stepIndex === 3) {
        scene3d.setBeachPopulation(p4Beetles);
        renderPage4Left();
      } else if (stepIndex === 4) {
        renderPage5Left();
      } else {
        renderPage6Left();
      }
    };

    return {
      onStepChange,
      onResize: () => scene3d.resize(),
      destroy: () => scene3d.destroy(),
    };
  },
};
