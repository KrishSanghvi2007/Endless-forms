// =============================================================================
// Chapter 17: The Price Equation, Fisher's Theorem & The Commons
// Revives Tangled Bank Ch. VI (Haystack + Price Decomposition) + Fisher FTNS!
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  evaluateHamiltonFromPrice,
  evaluateWeakVsStrong,
  simulateFisherFtns,
  simulateHaystackCommons,
} from './priceMath';
import { PriceScene3D, type PricePageId } from './PriceScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'price')!;

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
    id: 'pr1-simpson',
    prompt:
      'In Maynard Smith’s Haystack Commons, selfish cheaters outgrow cooperators inside EVERY mixed haystack — yet global cooperator frequency RISES after dispersal! How does the Price Equation explain this Simpson’s paradox?',
    options: [
      {
        id: 'a',
        label: 'Positive between-group selection Cov(W_g, p_g)/W̄ (cooperative haystacks grow much larger) outweighs negative within-group selection E(W_g Δp_g)/W̄!',
        correct: true,
      },
      {
        id: 'b',
        label: 'Cheaters voluntarily stop reproducing to protect the species.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Within-group selection must always be positive for cooperation to evolve.',
        correct: false,
      },
    ],
    explanation:
      'Correct! The Price Equation decomposes evolutionary change exactly into Between-Group + Within-Group selection — showing how multilevel selection resolves Simpson’s paradox.',
  },
  {
    id: 'pr2-ftns',
    prompt:
      'Fisher’s Fundamental Theorem states Δw̄_NS = V_A(w) / w̄. Why can a wild population’s REALIZED mean fitness stay flat or even drop despite positive additive genetic variance V_A(w) > 0?',
    options: [
      {
        id: 'a',
        label: 'FTNS measures the PARTIAL increase from natural selection alone (always ≥ 0); environmental deterioration (crowding, Red Queen parasites, shifting climate) can simultaneously pull realized mean fitness down!',
        correct: true,
      },
      {
        id: 'b',
        label: 'Because natural selection only uses environmental variance V_E, not additive genetic variance V_A.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Because Fisher’s theorem only applies to asexual clones.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Price (1972) and Ewens (1989) clarified that Fisher’s theorem is an exact identity for the partial natural-selection term, separate from environmental deterioration.',
  },
  {
    id: 'pr3-weak',
    prompt:
      'In randomly formed groups of size k = 3 (zero relatedness, r = 0), a public-good producer pays cost c = 0.35 to create benefit b = 1.20 shared equally by all 3 members (including itself: 1.20/3 = 0.40 > 0.35). Is this strong altruism?',
    options: [
      {
        id: 'a',
        label: 'No — it is WEAK altruism (net direct benefit b/k > c to the actor itself); TRUE/STRONG altruism (c > b/k) strictly requires positive assortment (r > 0) to spread!',
        correct: true,
      },
      {
        id: 'b',
        label: 'Yes — any trait that helps neighbours is always strong altruism regardless of direct return.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Weak altruism can never spread without r > 0.5.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Distinguishing weak altruism (direct return b/k > c) from strong altruism (requires r > 0) is a cornerstone of modern social evolution theory.',
  },
];

const PAGE_IDS: PricePageId[] = ['commons', 'price', 'ftns', 'hamilton_price', 'weak_strong', 'check'];

export const CH17_PRICE: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'commons',
      shortLabel: '1 Commons',
      eyebrow: 'MAYNARD SMITH (1964) · TANGLED BANK CH. VI',
      heading: 'The Commons: haystacks & flood timing',
      bodyHtml: `Inside every mixed meadow haystack, selfish cheaters outbreed cooperators — yet haystacks rich in cooperators grow far larger! Tune founder group size <em>k</em> and flood dispersal timing to discover when cooperative haystacks swamp the global pool!`,
      promptHint: 'Shrink founder size k (raising between-group variance) or flood early before cheaters take over mixed patches!',
    },
    {
      id: 'price',
      shortLabel: '2 Price Eq',
      eyebrow: 'PRICE (1970) · MULTILEVEL SELECTION',
      heading: 'The Price Equation & Simpson’s paradox',
      bodyHtml: `George Price proved one universal exact equation for ALL evolutionary change: ${gloss('price_equation', 'W̄·Δp̄ = Cov(W_g, p_g) + E(W_g·Δp_g)')}. Watch emerald <strong>Between-Group selection</strong> battle crimson <strong>Within-Group cheating</strong> live!`,
      promptHint: 'Slide founders k & flood delay to watch Simpson’s paradox flip net Δp̄ from positive to negative!',
    },
    {
      id: 'ftns',
      shortLabel: '3 Fisher FTNS',
      eyebrow: 'FISHER (1930) · PRICE (1972) CLARIFICATION',
      heading: 'Fisher’s Fundamental Theorem of Natural Selection',
      bodyHtml: `${gloss('fishers_fundamental_theorem', 'Fisher’s Fundamental Theorem')} proves the rate of mean fitness increase from natural selection equals additive genetic fitness variance divided by mean fitness: <strong>Δw̄_NS = V_A(w) / w̄</strong> — while selection itself consumes V_A and environmental decay pulls realized fitness back!`,
      promptHint: 'Tune initial additive genetic variance V_A and environmental deterioration to compare partial vs. realized fitness!',
    },
    {
      id: 'hamilton_price',
      shortLabel: '4 Hamilton',
      eyebrow: 'UNIFYING SOCIAL EVOLUTION',
      heading: 'Deriving Hamilton’s Rule directly from Price',
      bodyHtml: `Substitute a social fitness function (w = w₀ − C·G + B·G′) directly into the Price Equation and ${gloss('relatedness', 'relatedness r')} drops right out as the regression slope <strong>r = Cov(G′, G) / Var(G)</strong>, yielding <strong>rB &gt; C</strong>!`,
      promptHint: 'Tilt the relatedness slope r and adjust B and C to see when the Price covariance turns positive!',
    },
    {
      id: 'weak_strong',
      shortLabel: '5 Weak/Strong',
      eyebrow: 'WILSON (1975) · PUBLIC GOODS',
      heading: 'Weak altruism vs. strong altruism',
      bodyHtml: `In tiny random groups (r = 0), a producer gets back <strong>b / k</strong> of its own public good — so cooperation can spread via direct benefit alone (<strong>weak altruism</strong>). Once group size k grows large (b/k &lt; c), <strong>strong altruism</strong> strictly requires positive assortment (r &gt; 0)!`,
      promptHint: 'Increase group size k past b/c, then raise assortment r to rescue strong altruism!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'SYNTHESIS · PLATE 17',
      heading: 'Price, Fisher & multilevel selection check',
      bodyHtml: `Test your mastery of Simpson’s paradox, Fisher’s Fundamental Theorem, and weak vs. strong altruism.`,
      promptHint: 'Complete all three cases to stamp Plate 17.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '2nd–3rd Year Undergraduate (Evolutionary Theory & Social Evolution)',
    learningObjectives: [
      'Apply the Price Equation W̄·Δp̄ = Cov(W_g, p_g) + E(W_g·Δp_g) to explain Simpson’s paradox in multilevel selection.',
      'State Fisher’s Fundamental Theorem (Δw̄_NS = V_A/w̄) accurately as the partial change due to natural selection (Price 1972; Ewens 1989).',
      'Derive Hamilton’s Rule rB > C directly from the Price Equation using regression relatedness r = Cov(G′,G)/Var(G).',
      'Distinguish weak altruism (direct self-return b/k > c) from strong altruism (strictly requires positive assortment r > 0).',
    ],
    commonMisconceptions: [
      {
        misconception: '“Fisher’s Fundamental Theorem says populations always get fitter over time.”',
        correction:
          'FTNS governs the partial change from natural selection alone (always ≥ 0); realized mean fitness can remain flat or decline if environmental deterioration (competition, co-evolving pathogens) offsets it.',
      },
      {
        misconception: '“Kin selection and multilevel (group) selection are rival contradictory theories.”',
        correction:
          'The Price Equation proves they are mathematically equivalent accounting frameworks — both require positive genetic assortment (high between-group variance ↔ high relatedness r) for strong altruism to evolve.',
      },
    ],
    discussionPrompts: [
      'Why does reducing founder size k from 6 to 1 in the Haystack Commons dramatically boost the between-group covariance Cov(W_g, p_g)?',
      'Why does strong directional selection quickly slow down unless mutation, recombination, or fluctuating environments replenish V_A?',
    ],
    activityTip:
      'On Page 2, set Founders k = 2 and Flood Timing = 4 generations: point out that EVERY mixed haystack lost cooperators internally, yet the global gold net-change pillar rises sharply above zero (Simpson’s paradox)!',
  },
  scienceCard: {
    coreTakeaway:
      'The Price Equation is the exact mathematical backbone of evolutionary theory: it partitions change into selection vs. transmission, unifies kin and multilevel selection, and contains Fisher’s Fundamental Theorem as a special case.',
    assumptions: [
      {
        label: 'Maynard Smith Haystack Public Good',
        status: 'simplified',
        tag: 'Maynard Smith 1964; Tangled Bank Ch. VI',
        detail: 'Deterministic 6-patch binomial representation captures exact between-group vs within-group Price partitioning without random seed noise obscuring Simpson’s paradox.',
      },
      {
        label: 'Fisher’s FTNS Partial-Change Identity',
        status: 'realistic',
        tag: 'Fisher 1930; Price 1972; Ewens 1989',
        detail: 'Explicitly separates partial selection gain V_A(w)/w̄ from environmental deterioration so students avoid the textbook "mean fitness always rises" myth.',
      },
    ],
    citations: [
      {
        authors: 'Price, G. R.',
        year: 1970,
        title: 'Selection and covariance',
        journal: 'Nature 227:520–521',
      },
      {
        authors: 'Price, G. R.',
        year: 1972,
        title: 'Fisher’s “fundamental theorem” made clear',
        journal: 'Annals of Human Genetics 36:129–140',
      },
      {
        authors: 'Maynard Smith, J.',
        year: 1964,
        title: 'Group selection and kin selection',
        journal: 'Nature 201:1145–1147',
      },
      {
        authors: 'Frank, S. A.',
        year: 2012,
        title: 'Natural selection. IV. The Price equation',
        journal: 'Journal of Evolutionary Biology 25:1002–1019',
      },
    ],
    standards: {
      undergrad: [
        'Evolutionary Theory: Price Equation, Fisher’s Fundamental Theorem & Additive Genetic Variance',
        'Social Evolution: Multilevel Selection, Simpson’s Paradox, Hamilton’s Rule & Weak vs. Strong Altruism',
      ],
      apOrALevel: ['Advanced Evolutionary Biology & Quantitative Population Genetics'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="pr-caption">The Commons — Haystack Multilevel Selection</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="pr-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="pr-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="pr-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="pr-canvas-host"></div>
      <div class="hwe-plate-legend" id="pr-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D multilevel selection models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#pr-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#pr-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#pr-legend') as HTMLElement;

    const scene = new PriceScene3D(canvasHost);
    (plateStageEl.querySelector('#pr-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#pr-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#pr-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let foundersK = 2;
    let floodGens = 4;
    let initVA = 0.28;
    let envDecay = 0.08;
    let hamR = 0.5;
    let hamB = 1.0;
    let hamC = 0.35;
    let wsK = 5;
    let wsR = 0.25;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'commons';
      scene.setPage(pageId);

      if (pageId === 'commons') {
        const res = simulateHaystackCommons(foundersK, floodGens);
        scene.updateCommons(res);
        captionEl.textContent = `Haystacks (k = ${foundersK}, Flood @ Gen ${floodGens}) · Global Cooperators: ${Math.round(res.globalStartP * 100)}% → ${Math.round(res.globalEndP * 100)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#4d8a6a"></i>Cooperators (grow patch)</span>
          <span><i class="hwe-dot" style="background:#c2463d"></i>Selfish Cheaters (win inside patch)</span>
          <span><i class="hwe-dot" style="background:#d6b66f"></i>Haystack Patch Size = W_g</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Haystack Commons Parameters</div>
              <label class="lic-slider-label">
                <span>Founders per Haystack k = <strong>${foundersK}</strong></span>
                <input type="range" id="pr-k" min="1" max="8" step="1" value="${foundersK}" />
              </label>
              <label class="lic-slider-label">
                <span>Generations Before Flood = <strong>${floodGens}</strong></span>
                <input type="range" id="pr-g" min="1" max="12" step="1" value="${floodGens}" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Global Δp̄ = ${(res.deltaP >= 0 ? '+' : '') + (res.deltaP * 100).toFixed(1)}%</span>
                <span class="hwe-stat-badge">${res.simpsonParadox ? 'Simpson’s Paradox!' : res.deltaP > 0 ? 'Cooperators Win' : 'Cheaters Win'}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>${res.deltaP >= 0 ? 'Cooperators Spread Globally!' : 'Cheaters Take Over!'}</strong>
                Small founder groups (k ≤ 3) create high between-group variance so pure-cooperator haystacks grow massive before the flood — whereas large mixed haystacks or delayed floods let internal cheaters win!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#pr-k') as HTMLInputElement).addEventListener('input', (e) => {
          foundersK = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#pr-g') as HTMLInputElement).addEventListener('input', (e) => {
          floodGens = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'price') {
        const res = simulateHaystackCommons(foundersK, floodGens);
        scene.updatePrice(res);
        captionEl.textContent = `Price Decomposition: Between (${(res.betweenTerm >= 0 ? '+' : '') + (res.betweenTerm * 100).toFixed(1)}%) + Within (${(res.withinTerm * 100).toFixed(1)}%) = Net (${(res.deltaP >= 0 ? '+' : '') + (res.deltaP * 100).toFixed(1)}%)`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#498c6b"></i>Between-Group Cov(W,p)/W̄</span>
          <span><i class="hwe-dot" style="background:#c44b42"></i>Within-Group E(W·Δp)/W̄</span>
          <span><i class="hwe-dot" style="background:#d49d35"></i>Total Net Δp̄</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Exact Price Equation Partitioning</div>
              <label class="lic-slider-label">
                <span>Founders per Patch k = <strong>${foundersK}</strong></span>
                <input type="range" id="pr-k2" min="1" max="8" step="1" value="${foundersK}" />
              </label>
              <label class="lic-slider-label">
                <span>Generations Inside Patch = <strong>${floodGens}</strong></span>
                <input type="range" id="pr-g2" min="1" max="12" step="1" value="${floodGens}" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Between: ${(res.betweenTerm >= 0 ? '+' : '') + (res.betweenTerm * 100).toFixed(1)}%</span>
                <span class="hwe-stat-badge">Within: ${(res.withinTerm * 100).toFixed(1)}%</span>
                <span class="hwe-stat-badge">Net Δp̄: ${(res.deltaP >= 0 ? '+' : '') + (res.deltaP * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Exact Identity:</strong> Δp̄ = Cov(W_g, p_g)/W̄ + E(W_g·Δp_g)/W̄.
                ${res.simpsonParadox ? 'Notice <strong>Simpson’s Paradox</strong> right now: cooperators lose inside every mixed patch (crimson pillar points DOWN), yet the emerald between-group pillar is even taller so net Δp̄ rises!' : 'Adjust k and generations to watch between-group covariance battle within-group decline.'}
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#pr-k2') as HTMLInputElement).addEventListener('input', (e) => {
          foundersK = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#pr-g2') as HTMLInputElement).addEventListener('input', (e) => {
          floodGens = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'ftns') {
        const res = simulateFisherFtns(initVA, envDecay);
        scene.updateFtns(res);
        captionEl.textContent = `Fisher FTNS · Initial Δw̄_NS = +${res.deltaW0.toFixed(2)} (V_A Erodes Over Time!)`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#4c7ea1"></i>Additive Variance V_A(w)</span>
          <span><i class="hwe-dot" style="background:#4f8c66"></i>Partial Fitness Climb (NS Only)</span>
          <span><i class="hwe-dot" style="background:#c45b42"></i>Realized Fitness (w/ Env. Decay)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Additive Variance vs. Environmental Decay</div>
              <label class="lic-slider-label">
                <span>Initial Additive Fitness Variance V_A = <strong>${initVA.toFixed(2)}</strong></span>
                <input type="range" id="pr-va" min="0.02" max="0.50" step="0.02" value="${initVA}" />
              </label>
              <label class="lic-slider-label">
                <span>Environmental Deterioration / Gen = <strong>${envDecay.toFixed(2)}</strong></span>
                <input type="range" id="pr-env" min="0.0" max="0.18" step="0.01" value="${envDecay}" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Gen 0 Δw̄_NS = +${res.deltaW0.toFixed(2)}</span>
                <span class="hwe-stat-badge">Gen 16 V_A = ${res.vaSeries[16]!.toFixed(3)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Two Deep Insights:</strong> (1) Natural selection consumes additive variance V_A (blue pillars shrink), flattening the green fitness climb. (2) Red Queen environmental decay can pull realized fitness (crimson) down even while FTNS partial change (green) is strictly ≥ 0!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#pr-va') as HTMLInputElement).addEventListener('input', (e) => {
          initVA = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#pr-env') as HTMLInputElement).addEventListener('input', (e) => {
          envDecay = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'hamilton_price') {
        const res = evaluateHamiltonFromPrice(hamR, hamB, hamC);
        scene.updateHamiltonPrice(res);
        captionEl.textContent = `Price → Hamilton: r·B − C = ${res.inclusivePayoff >= 0 ? '+' : ''}${res.inclusivePayoff.toFixed(2)} (${res.spreads ? 'Spreads!' : 'Lost'})`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:${res.spreads ? '#4d8a6a' : '#b84840'}"></i>Regression Slope r = ${hamR.toFixed(2)}</span>
          <span><i class="hwe-dot" style="background:#d4be96"></i>Actor–Partner Genotype Pairs</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Hamilton’s Rule Derived from Price</div>
              <label class="lic-slider-label">
                <span>Regression Relatedness r = <strong>${hamR.toFixed(2)}</strong></span>
                <input type="range" id="pr-hr" min="0" max="1" step="0.05" value="${hamR}" />
              </label>
              <label class="lic-slider-label">
                <span>Recipient Benefit B = <strong>${hamB.toFixed(2)}</strong></span>
                <input type="range" id="pr-hb" min="0.2" max="1.6" step="0.1" value="${hamB}" />
              </label>
              <label class="lic-slider-label">
                <span>Actor Cost C = <strong>${hamC.toFixed(2)}</strong></span>
                <input type="range" id="pr-hc" min="0.05" max="0.8" step="0.05" value="${hamC}" />
              </label>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Cov(w, G) = B·Cov(G′,G) − C·Var(G) &gt; 0 ⇔ rB &gt; C.</strong>
                Here r·B = ${(hamR * hamB).toFixed(2)} vs. C = ${hamC.toFixed(2)} →
                <strong>${res.spreads ? 'Altruism allele spreads!' : 'Altruism is selected against.'}</strong>
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#pr-hr') as HTMLInputElement).addEventListener('input', (e) => {
          hamR = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#pr-hb') as HTMLInputElement).addEventListener('input', (e) => {
          hamB = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#pr-hc') as HTMLInputElement).addEventListener('input', (e) => {
          hamC = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'weak_strong') {
        const res = evaluateWeakVsStrong(wsK, wsR);
        scene.updateWeakStrong(res);
        captionEl.textContent =
          res.category === 'weak_spreads'
            ? `Weak Altruism Spreads (Direct Return b/k = ${res.selfReturn.toFixed(2)} > c)`
            : res.category === 'strong_spreads'
              ? `Strong Altruism Rescued by Assortment (r = ${wsR.toFixed(2)})`
              : `Altruism Fails (b/k = ${res.selfReturn.toFixed(2)} < c & r too low)`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d4be96"></i>Public-Good Producer</span>
          <span><i class="hwe-dot" style="background:#3d393d"></i>Non-Producer</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Public Good Group Size &amp; Assortment (b = 1.20, c = 0.35)</div>
              <label class="lic-slider-label">
                <span>Group Size k = <strong>${wsK}</strong> (Self-Return b/k = ${res.selfReturn.toFixed(2)})</span>
                <input type="range" id="pr-wsk" min="2" max="10" step="1" value="${wsK}" />
              </label>
              <label class="lic-slider-label">
                <span>Positive Assortment r = <strong>${wsR.toFixed(2)}</strong></span>
                <input type="range" id="pr-wsr" min="0" max="0.8" step="0.05" value="${wsR}" />
              </label>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  res.category === 'weak_spreads'
                    ? `<strong>Weak Altruism:</strong> Because k = ${wsK} is small, the actor’s own share (b/k = ${res.selfReturn.toFixed(2)}) already beats cost c = 0.35 — it spreads even in random groups (r = 0)!`
                    : res.category === 'strong_spreads'
                      ? `<strong>Strong Altruism:</strong> Direct return (${res.selfReturn.toFixed(2)}) is below cost (0.35), so ONLY positive assortment (r = ${wsR.toFixed(2)}) lets cooperation evolve!`
                      : `<strong>Fails to Evolve:</strong> In groups of k = ${wsK}, self-return (${res.selfReturn.toFixed(2)}) is below c = 0.35 and r = ${wsR.toFixed(2)} is too low. Raise assortment r!`
                }
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#pr-wsk') as HTMLInputElement).addEventListener('input', (e) => {
          wsK = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#pr-wsr') as HTMLInputElement).addEventListener('input', (e) => {
          wsR = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate 17 — Price Equation & Fisher FTNS Check';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#4d8a6a"></i>Between-Group</span>
          <span><i class="hwe-dot" style="background:#c2463d"></i>Within-Group</span>
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
          ctx.completeChapter('price', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the Price Equation terms on the preceding 3D plate.'
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
