// =============================================================================
// Chapter 19: Ageing, Senescence & Life Histories — Dedicated Standalone Plate
// Medawar MA vs Williams AP, Kirkwood Disposable Soma, Life Tables, Lack Clutch & Parity
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  evaluateDisposableSoma,
  evaluateLackClutch,
  evaluateLifeTable,
  evaluateParity,
  evaluateSenescenceModel,
  type SenescenceModel,
  type SurvivorshipType,
} from './senescenceMath';
import { SenescenceScene3D, type SenescencePageId } from './SenescenceScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'senescence')!;

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
    id: 'sn1-ap',
    prompt:
      'How does Williams’s (1957) Antagonistic Pleiotropy theory of ageing differ from Medawar’s (1952) Mutation Accumulation theory?',
    options: [
      {
        id: 'a',
        label: 'Antagonistic Pleiotropy alleles are ACTIVELY FAVOURED by selection because they boost early reproduction at the expense of late-life decay — whereas Mutation Accumulation alleles are neutral early and drift in the selection shadow.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Antagonistic Pleiotropy says animals age on purpose to clear space for younger generations.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Neither theory depends on Hamilton’s declining force of selection with age.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Both theories rest on the declining force of selection with age, but Antagonistic Pleiotropy involves an active early-life vs. late-life genetic trade-off!',
  },
  {
    id: 'sn2-lack',
    prompt:
      'David Lack (1947) showed a bird can produce the most surviving fledglings in a single season by laying 6 eggs — yet wild birds of that species typically lay only 5 eggs! Why?',
    options: [
      {
        id: 'a',
        label: 'Cost of reproduction: raising 6 chicks exhausts the parent, lowering its survival to next year so LIFETIME reproductive success peaks at a slightly smaller clutch (5 eggs)!',
        correct: true,
      },
      {
        id: 'b',
        label: 'Birds cannot count past five.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Laying 10 eggs always produces the most fledglings.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Natural selection maximizes LIFETIME fitness across seasons, not just a single year’s brood — so parental survival costs pull optimal clutch size slightly below Lack’s single-season peak.',
  },
  {
    id: 'sn3-parity',
    prompt:
      'Charnov & Schaffer (1973) solved Cole’s Paradox by showing big-bang semelparity (reproducing once then dying, like Pacific salmon) beats iteroparity only when semelparous fecundity exceeds iteroparous fecundity by P_a / P_j. When is iteroparity strongly favoured?',
    options: [
      {
        id: 'a',
        label: 'When adult survival P_a is HIGH and juvenile survival P_j is LOW (e.g., tortoises, albatrosses, oaks) — making surviving adults precious!',
        correct: true,
      },
      {
        id: 'b',
        label: 'When adult survival P_a is nearly zero and juvenile survival P_j is 100%.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Adult and juvenile survival rates have no effect on parity evolution.',
        correct: false,
      },
    ],
    explanation:
      'Correct! High P_a / P_j makes surviving to breed again enormously valuable, favouring long-lived iteroparous life histories.',
  },
];

const PAGE_IDS: SenescencePageId[] = ['ma_ap', 'disposable', 'lifetable', 'lack', 'continuum', 'check'];

export const CH19_SENESCENCE: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'ma_ap',
      shortLabel: '1 MA vs AP',
      eyebrow: 'MEDAWAR (1952) · WILLIAMS (1957)',
      heading: 'Mutation accumulation vs. antagonistic pleiotropy',
      bodyHtml: `Why do bodies decay with age? Because extrinsic hazards shrink Hamilton’s force of selection in old age! Compare ${gloss('antagonistic_pleiotropy', 'antagonistic pleiotropy')} (early fertility boost paid for by late senescence) against passive late-acting mutation accumulation!`,
      promptHint: 'Toggle Mutation Accumulation vs. Antagonistic Pleiotropy and slide extrinsic mortality to reshape the selection shadow!',
    },
    {
      id: 'disposable',
      shortLabel: '2 Soma',
      eyebrow: 'KIRKWOOD (1977) · DISPOSABLE SOMA THEORY',
      heading: 'The Y-model: DNA repair vs. early reproduction',
      bodyHtml: `Metabolic energy is finite! Under ${gloss('disposable_soma', 'Kirkwood’s Disposable Soma Theory')}, organisms split energy between somatic DNA repair and reproduction. When predators kill most animals young, investing in a 100-year body is wasted!`,
      promptHint: 'Slide Energy to Somatic Repair under High vs. Low predation to find the lifetime fitness optimum!',
    },
    {
      id: 'lifetable',
      shortLabel: '3 Life Table',
      eyebrow: 'DEMOGRAPHY · EULER–LOTKA',
      heading: 'Survivorship curves (Type I, II, III) & R₀',
      bodyHtml: `Demographic life tables pair age-specific survival <strong>l_x</strong> with fecundity <strong>m_x</strong> to compute net reproductive rate <strong>R₀ = Σ l_x m_x</strong> and intrinsic growth rate <strong>r ≈ ln(R₀) / T</strong>!`,
      promptHint: 'Switch between Type I (Opossum), Type II (Songbird), and Type III (Kelp/Oyster) survivorship regimes!',
    },
    {
      id: 'lack',
      shortLabel: '4 Clutch',
      eyebrow: 'LACK (1947) · QUALITY–QUANTITY TRADE-OFF',
      heading: 'Lack’s clutch size & the cost of reproduction',
      bodyHtml: `Why don’t robins lay 10 eggs instead of 5? Overcrowding starves chicks (lowering survival per egg), AND raising an oversized brood drains parental survival for next spring — pulling the <strong>lifetime optimum</strong> below the single-season peak!`,
      promptHint: 'Adjust clutch size from 2 to 10 eggs in the woven twig nest and compare single-season vs. lifetime fledglings!',
    },
    {
      id: 'continuum',
      shortLabel: '5 Parity',
      eyebrow: 'CHARNOV & SCHAFFER (1973) · COLE’S PARADOX',
      heading: 'Big-bang semelparity vs. long-lived iteroparity',
      bodyHtml: `Pacific salmon spawn once in a suicidal burst (<strong>semelparity</strong>), whereas Galápagos tortoises breed for a century (<strong>iteroparity</strong>). The threshold hinges on the adult-to-juvenile survival ratio <strong>P_a / P_j</strong>!`,
      promptHint: 'Slide Adult Survival P_a and Juvenile Survival P_j to tip selection between Salmon and Tortoise!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'SYNTHESIS · PLATE 19',
      heading: 'Ageing & life-history diagnostic check',
      bodyHtml: `Synthesize evolutionary theories of senescence, Lack’s clutch size, and semelparity vs. iteroparity.`,
      promptHint: 'Complete all three cases to stamp Plate 19.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '2nd–3rd Year Undergraduate (Life-History Evolution & Demography)',
    learningObjectives: [
      'Contrast Medawar’s Mutation Accumulation, Williams’s Antagonistic Pleiotropy, and Kirkwood’s Disposable Soma theories of senescence.',
      'Calculate and interpret Type I, II, and III survivorship curves, R₀, generation time T, and intrinsic growth rate r.',
      'Explain why observed wild clutch sizes typically sit below David Lack’s single-season maximum due to parental cost of reproduction.',
      'Use Charnov & Schaffer’s P_a / P_j criterion to predict when semelparity vs. iteroparity evolves.',
    ],
    commonMisconceptions: [
      {
        misconception: '“Organisms evolved ageing to die off and make room for the good of the species.”',
        correction:
          'Ageing is a non-adaptive by-product of declining selection strength with age (or trade-offs favouring early reproduction), NOT group-altruistic self-destruction.',
      },
    ],
    discussionPrompts: [
      'Why do bats, naked mole-rats, and tortoises live far longer than similarly sized terrestrial rodents?',
    ],
    activityTip:
      'On Page 4, ask students to find the egg count maximizing single-season fledglings (6) vs. lifetime fledglings (5) to visualize the cost of reproduction directly!',
  },
  scienceCard: {
    coreTakeaway:
      'Life-history schedules — ageing rate, somatic repair, clutch size, and semelparity vs. iteroparity — evolve through resource trade-offs shaped by age-specific extrinsic mortality.',
    assumptions: [
      {
        label: 'Three Canonical Senescence Theories',
        status: 'realistic',
        tag: 'Medawar 1952; Williams 1957; Kirkwood 1977',
        detail: 'All three models operate simultaneously in real genomes; their relative weights remain active empirical research in evolutionary gerontology.',
      },
      {
        label: 'Lack Clutch & Charnov-Schaffer Parity',
        status: 'realistic',
        tag: 'Lack 1947; Charnov & Schaffer 1973',
        detail: 'Captures both within-brood sibling competition and inter-seasonal parental survival trade-off.',
      },
    ],
    citations: [
      {
        authors: 'Williams, G. C.',
        year: 1957,
        title: 'Pleiotropy, natural selection, and the evolution of senescence',
        journal: 'Evolution 11:398–411',
      },
      {
        authors: 'Kirkwood, T. B. L.',
        year: 1977,
        title: 'Evolution of ageing',
        journal: 'Nature 270:301–304',
      },
      {
        authors: 'Lack, D.',
        year: 1947,
        title: 'The significance of clutch-size',
        journal: 'Ibis 89:302–352',
      },
      {
        authors: 'Charnov, E. L. & Schaffer, W. M.',
        year: 1973,
        title: 'Life-history consequences of natural selection: Cole’s result revisited',
        journal: 'American Naturalist 107:791–793',
      },
    ],
    standards: {
      undergrad: [
        'Life-History Theory: Evolution of Senescence, Disposable Soma & Clutch-Size Trade-Offs',
        'Evolutionary Demography: Life Tables (l_x, m_x, R_0, r) & Semelparity vs. Iteroparity',
      ],
      apOrALevel: ['AP Bio 8.3–8.4 (Population Ecology & Survivorship Curves)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="sn-caption">Ageing &amp; Life Histories — Selection Shadow</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="sn-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="sn-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="sn-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="sn-canvas-host"></div>
      <div class="hwe-plate-legend" id="sn-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D life-history models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#sn-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#sn-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#sn-legend') as HTMLElement;

    const scene = new SenescenceScene3D(canvasHost);
    (plateStageEl.querySelector('#sn-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#sn-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#sn-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let senModel: SenescenceModel = 'antag_pleio';
    let extMort = 0.25;
    let repairShare = 0.55;
    let somaPred = 0.15;
    let survType: SurvivorshipType = 'type1';
    let clutchSize = 5;
    let adultPa = 0.72;
    let juvPj = 0.18;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'ma_ap';
      scene.setPage(pageId);

      if (pageId === 'ma_ap') {
        const res = evaluateSenescenceModel(senModel, extMort);
        scene.updateMaAp(res);
        captionEl.textContent = `${senModel === 'antag_pleio' ? 'Williams Antagonistic Pleiotropy' : 'Medawar Mutation Accumulation'} · Lifespan ≈ ${res.maxLifespanYr.toFixed(1)} yr`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#4d8a6a"></i>Strong Early Selection</span>
          <span><i class="hwe-dot" style="background:#b84b42"></i>Late Selection Shadow</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Evolutionary Mechanism of Senescence</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${senModel === 'mutation_acc' ? 'active' : ''}" data-sm="mutation_acc">Mutation Accumulation</button>
                <button class="lic-pill-btn ${senModel === 'antag_pleio' ? 'active' : ''}" data-sm="antag_pleio">Antagonistic Pleiotropy</button>
              </div>
              <label class="lic-slider-label" style="margin-top:8px;">
                <span>Extrinsic Mortality = <strong>${Math.round(extMort * 100)}%/yr</strong></span>
                <input type="range" id="sn-em" min="0.06" max="0.60" step="0.02" value="${extMort}" />
              </label>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">Early Fertility: ${(res.earlyFertility * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Lifespan: ${res.maxLifespanYr.toFixed(1)} yr</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  senModel === 'antag_pleio'
                    ? '<strong>Antagonistic Pleiotropy (Williams):</strong> An allele boosting early fertility (+28%) is actively selected FOR even though it accelerates cellular decay later in the selection shadow!'
                    : '<strong>Mutation Accumulation (Medawar):</strong> Purely late-acting deleterious mutations have zero early benefit — they simply drift up because too few elders remain for selection to purge them!'
                }
              </p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-sm]').forEach((b) =>
          b.addEventListener('click', () => {
            senModel = b.dataset.sm as SenescenceModel;
            renderPage();
          })
        );
        (leftPanelEl.querySelector('#sn-em') as HTMLInputElement).addEventListener('input', (e) => {
          extMort = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'disposable') {
        const res = evaluateDisposableSoma(repairShare, somaPred);
        scene.updateDisposableSoma(res);
        captionEl.textContent = `Repair = ${Math.round(repairShare * 100)}% · Lifetime Fitness W = ${res.lifetimeFitnessW.toFixed(1)} (Opt Repair = ${Math.round(res.optimalRepair * 100)}%)`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#57967e"></i>Somatic DNA Repair</span>
          <span><i class="hwe-dot" style="background:#d9a43b"></i>Y-Model Energy Conduit</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Kirkwood Y-Model Energy Budget</div>
              <label class="lic-slider-label">
                <span>Energy to Somatic Repair = <strong>${Math.round(repairShare * 100)}%</strong></span>
                <input type="range" id="sn-rep" min="0.10" max="0.90" step="0.05" value="${repairShare}" />
              </label>
              <label class="lic-slider-label">
                <span>Extrinsic Predation Hazard = <strong>${Math.round(somaPred * 100)}%/yr</strong></span>
                <input type="range" id="sn-sp" min="0.05" max="0.55" step="0.05" value="${somaPred}" />
              </label>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">Lifespan: ${res.expectedLifespan.toFixed(1)} yr</span>
                <span class="hwe-stat-badge">Fitness W: ${res.lifetimeFitnessW.toFixed(1)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Optimal Somatic Repair = ${Math.round(res.optimalRepair * 100)}%:</strong>
                Under ${somaPred > 0.3 ? 'HIGH predation, investing heavily in DNA repair is wasted before predators strike — favour early reproduction!' : 'LOW predation (safe islands/flight), investing deeply in somatic repair multiplies lifetime breeding seasons!'}
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#sn-rep') as HTMLInputElement).addEventListener('input', (e) => {
          repairShare = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#sn-sp') as HTMLInputElement).addEventListener('input', (e) => {
          somaPred = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'lifetable') {
        const res = evaluateLifeTable(survType);
        scene.updateLifeTable(res);
        captionEl.textContent = `R₀ = ${res.r0.toFixed(2)} · Gen Time T = ${res.genTimeT.toFixed(1)} yr · r = ${res.intrinsicR >= 0 ? '+' : ''}${res.intrinsicR.toFixed(2)}/yr`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#4d8a6a"></i>Log Survivorship l_x</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Survivorship Regime</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${survType === 'type1' ? 'active' : ''}" data-st="type1">Type I</button>
                <button class="lic-pill-btn ${survType === 'type2' ? 'active' : ''}" data-st="type2">Type II</button>
                <button class="lic-pill-btn ${survType === 'type3' ? 'active' : ''}" data-st="type3">Type III</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">R₀ = ${res.r0.toFixed(2)}</span>
                <span class="hwe-stat-badge">T = ${res.genTimeT.toFixed(1)} yr</span>
                <span class="hwe-stat-badge">r = ${res.intrinsicR.toFixed(2)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>${res.speciesLabel}.</strong> Notice R₀ &gt; 1 implies population growth (r &gt; 0) across completely different survivorship shapes!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-st]').forEach((b) =>
          b.addEventListener('click', () => {
            survType = b.dataset.st as SurvivorshipType;
            renderPage();
          })
        );
      } else if (pageId === 'lack') {
        const res = evaluateLackClutch(clutchSize);
        scene.updateLackClutch(res);
        captionEl.textContent = `Clutch = ${clutchSize} Eggs · Season Fledglings = ${res.fledglings.toFixed(2)} · Lifetime = ${res.lifetimeOutput.toFixed(2)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#78b3c2"></i>Well-Fed Eggs</span>
          <span><i class="hwe-dot" style="background:#8c6c4a"></i>Woven Nest</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Lack’s Clutch Size &amp; Cost of Reproduction</div>
              <label class="lic-slider-label">
                <span>Eggs Laid in Nest = <strong>${clutchSize} eggs</strong></span>
                <input type="range" id="sn-cl" min="2" max="10" step="1" value="${clutchSize}" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Chick Surv: ${Math.round(res.chickSurvival * 100)}%</span>
                <span class="hwe-stat-badge">Parent Surv: ${Math.round(res.parentSurvival * 100)}%</span>
              </div>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">1-Season: ${res.fledglings.toFixed(2)} (Opt ${res.lackOptimum})</span>
                <span class="hwe-stat-badge">Lifetime: ${res.lifetimeOutput.toFixed(2)} (Opt ${res.lifetimeOptimum})</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Why Wild Clutches Sit Below Lack’s Peak:</strong> Single-season fledglings peak at <strong>${res.lackOptimum} eggs</strong>, yet parental exhaustion lowers survival to next spring — pulling <strong>lifetime fitness</strong> peak down to <strong>${res.lifetimeOptimum} eggs</strong>!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#sn-cl') as HTMLInputElement).addEventListener('input', (e) => {
          clutchSize = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'continuum') {
        const res = evaluateParity(adultPa, juvPj);
        scene.updateParity(res);
        captionEl.textContent = `P_a / P_j = ${res.extraEggsNeeded.toFixed(1)} → ${res.favoured === 'semelparous' ? 'Semelparity (Salmon) Favoured!' : 'Iteroparity (Tortoise) Favoured!'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#7baeb2"></i>Semelparous Salmon</span>
          <span><i class="hwe-dot" style="background:#6e6548"></i>Iteroparous Tortoise</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Charnov &amp; Schaffer (1973) Parity Criterion</div>
              <label class="lic-slider-label">
                <span>Adult Annual Survival P_a = <strong>${Math.round(adultPa * 100)}%</strong></span>
                <input type="range" id="sn-pa" min="0.10" max="0.95" step="0.05" value="${adultPa}" />
              </label>
              <label class="lic-slider-label">
                <span>Juvenile Survival P_j = <strong>${Math.round(juvPj * 100)}%</strong></span>
                <input type="range" id="sn-pj" min="0.05" max="0.65" step="0.05" value="${juvPj}" />
              </label>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">Threshold P_a/P_j = ${res.extraEggsNeeded.toFixed(1)}</span>
                <span class="hwe-stat-badge">Winner: ${res.favoured === 'semelparous' ? 'Semelparity' : 'Iteroparity'}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Solving Cole’s Paradox:</strong> When adult survival P_a is high relative to juvenile survival P_j, surviving adults are too valuable to sacrifice in one fatal burst — favouring long-lived <strong>iteroparity</strong>!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#sn-pa') as HTMLInputElement).addEventListener('input', (e) => {
          adultPa = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#sn-pj') as HTMLInputElement).addEventListener('input', (e) => {
          juvPj = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate 19 — Ageing & Life-History Diagnostic Check';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#9a938a"></i>Senescence</span>
          <span><i class="hwe-dot" style="background:#6e6548"></i>Life History</span>
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
          ctx.completeChapter('senescence', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the life-history trade-off on the preceding 3D plate.'
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
        scene.destroy();
      },
    };
  },
};
