// =============================================================================
// Chapter 18: Optimal Foraging & MVT — Playable 3D Foraging Game + Theory
// Charnov MVT Game, Diet Breadth Zero-One Rule, Risk Sensitivity & Central Place
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  evaluateCentralPlace,
  evaluateDietBreadth,
  evaluateRiskForaging,
  patchGain,
  solveMvtOptimum,
} from './foragerMath';
import { ForagerScene3D, type ForagerPageId } from './ForagerScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'forager')!;

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
    id: 'fg1-mvt',
    prompt:
      'According to Charnov’s (1976) Marginal Value Theorem, when the travel time T_t between flower patches DOUBLES, how should an optimal forager change the time it stays in each depleting patch?',
    options: [
      {
        id: 'a',
        label: 'Stay LONGER in each patch (draining it deeper) because switching patches now costs more wasted travel time!',
        correct: true,
      },
      {
        id: 'b',
        label: 'Leave each patch EARLIER to hurry across the meadow faster.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Stay the exact same time regardless of travel cost.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Shifting the tangent origin leftward to −T_t tilts the optimal tangent line flatter, moving the tangency point t* to the RIGHT (longer patch residence)!',
  },
  {
    id: 'fg2-diet',
    prompt:
      'A bird eats large grubs (profitability 5.0 J/s) and ignores tiny low-value grass seeds (1.2 J/s). Suddenly grass seeds become 10× more abundant while grub abundance stays unchanged. Under the Optimal Diet Zero–One Rule, what happens?',
    options: [
      {
        id: 'a',
        label: 'The bird STILL ignores grass seeds! Inclusion of low-value prey depends ONLY on the encounter rate of HIGH-value prey (λ₁), NEVER on the abundance of low-value prey (λ₂)!',
        correct: true,
      },
      {
        id: 'b',
        label: 'The bird immediately switches to eating mostly grass seeds because there are so many of them.',
        correct: false,
      },
      {
        id: 'c',
        label: 'The bird stops eating grubs altogether.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Taking a low-value seed wastes handling time h₂ during which you could have found a high-value grub — so λ₂ drops out of the inequality completely!',
  },
  {
    id: 'fg3-risk',
    prompt:
      'Two winter foraging patches have the EXACT SAME mean food (+2.5 J): Safe always pays +2.5 J, while Risky pays 0 J (50%) or +5.0 J (50%). A starving bird with only 3.0 J needs 6.5 J to survive the night. Which patch maximizes survival?',
    options: [
      {
        id: 'a',
        label: 'The RISKY patch (variance-prone): Safe leaves it at 5.5 J (certain starvation), whereas Risky gives a 50% chance of reaching 8.0 J and surviving!',
        correct: true,
      },
      {
        id: 'b',
        label: 'The SAFE patch, because animals are always risk-averse.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Both patches give identical survival because their mean intake is equal.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Because survival is a non-linear (convex below threshold) function of energy (Jensen’s inequality; Caraco et al. 1980), starving animals should be risk-prone while well-fed animals should be risk-averse!',
  },
];

const PAGE_IDS: ForagerPageId[] = ['mvt_game', 'mvt_tangent', 'diet', 'risk', 'central', 'check'];

export const CH18_FORAGER: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'mvt_game',
      shortLabel: '1 Play MVT',
      eyebrow: 'CHARNOV (1976) · PLAYABLE 3D FORAGING GAME',
      heading: 'Sip or fly? Play the nectar patch game!',
      bodyHtml: `Each meadow patch starts brimming with scarlet nectar blossoms — but every sip depletes it! Play as the hovering hummingbird: decide when to <strong>Sip Nectar</strong> vs. <strong>Fly to a Fresh Patch</strong> and race your real-time intake rate against ${gloss('marginal_value_theorem', 'Charnov’s Marginal Value Theorem')}!`,
      promptHint: 'Play a 30-second bout! Compare Close Meadow (T = 2s) vs. Distant Meadow (T = 6s) and watch your leave-time dot!',
    },
    {
      id: 'mvt_tangent',
      shortLabel: '2 Tangent',
      eyebrow: 'MARGINAL VALUE THEOREM · GEOMETRY',
      heading: 'Why distant patches demand longer stays',
      bodyHtml: `Draw a tangent line from <strong>−T_t</strong> (travel time) to the diminishing-returns gain curve <strong>g(t)</strong>: the exact touching point <strong>t*</strong> maximizes long-term intake rate! Leave the moment marginal gain drops to the habitat average.`,
      promptHint: 'Slide Travel Time T_t and Patch Richness to watch the Charnov tangent pivot and shift optimal stay time t*!',
    },
    {
      id: 'diet',
      shortLabel: '3 Diet Rule',
      eyebrow: 'STEPHENS & KREBS (1986) · ZERO–ONE RULE',
      heading: 'Why abundant junk food never enters a rich diet',
      bodyHtml: `Prey are ranked by <strong>profitability (e / h)</strong>. Remarkably, whether to include a low-profitability seed depends <em>only</em> on how often you encounter rich beetle grubs (λ₁) — <strong>never</strong> on how abundant the low-value seeds (λ₂) become!`,
      promptHint: 'Crank Grass Seed abundance λ₂ to maximum while Grubs λ₁ are common — notice the specialist verdict never budges!',
    },
    {
      id: 'risk',
      shortLabel: '4 Risk',
      eyebrow: 'CARACO ET AL. (1980) · JENSEN’S INEQUALITY',
      heading: 'Risk-sensitive foraging & starvation thresholds',
      bodyHtml: `When two patches have the exact same <em>mean</em> food, should a bird play it safe or gamble? Below the overnight survival threshold, the Safe patch guarantees starvation — so ${gloss('risk_sensitive_foraging', 'risk-sensitive foraging')} flips from risk-averse to <strong>risk-prone</strong>!`,
      promptHint: 'Slide winter energy reserves below vs. above 4.0 J to watch the bird switch between Safe and Lottery patches!',
    },
    {
      id: 'central',
      shortLabel: '5 Nest Load',
      eyebrow: 'ORIANS & PEARSON (1979) · CENTRAL-PLACE FORAGING',
      heading: 'Why starlings carry bigger loads from distant fields',
      bodyHtml: `Parents feeding nestlings must return to a fixed nest after every trip! Because stuffing extra grubs into a full bill slows down capture, longer round-trip flights select for carrying <strong>larger loads per trip</strong>.`,
      promptHint: 'Slide round-trip flight distance to see the starling load more golden grubs into its bill!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'SYNTHESIS · PLATE 18',
      heading: 'Optimal foraging ecology diagnostic check',
      bodyHtml: `Apply Charnov’s MVT, the Zero–One diet rule, and risk-sensitive foraging to three undergraduate cases.`,
      promptHint: 'Complete all three cases to stamp Plate 18.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Behavioural & Evolutionary Ecology)',
    learningObjectives: [
      'Experience and derive Charnov’s (1976) Marginal Value Theorem tangent rule g′(t*) = g(t*)/(T_t + t*).',
      'Prove why the Optimal Diet Breadth Zero–One Rule excludes low-value prey regardless of their abundance λ₂ whenever high-value prey encounter λ₁ is high.',
      'Explain risk-prone vs. risk-averse foraging switches via Jensen’s inequality around an energy-survival threshold (Caraco et al. 1980).',
      'Predict how central-place round-trip travel time scales optimal load size (Orians & Pearson 1979).',
    ],
    commonMisconceptions: [
      {
        misconception: '“An optimal forager should empty a flower patch 100% before leaving.”',
        correction:
          'Because intake slows as blossoms deplete, staying until the last drop wastes time you could spend harvesting fresh patches — leave as soon as marginal rate equals habitat average!',
      },
      {
        misconception: '“If low-value prey become super abundant, a predator should always add them to its diet.”',
        correction:
          'Handling low-value prey consumes time h₂ during which rich prey could be found; inclusion depends strictly on λ₁ (rich prey encounter), never λ₂.',
      },
    ],
    discussionPrompts: [
      'In Page 1’s playable game, how close did your average leave time come to Charnov’s theoretical t* under Close (2s) vs. Distant (6s) meadows?',
      'Remember our evolutionary framing: hummingbirds do not solve calculus — how can simple inherited “giving-up time” rules evolve by natural selection to approximate MVT?',
    ],
    activityTip:
      'Have students play two 30-second bouts on Page 1 — first in Close Meadow (T=2s), then Distant Meadow (T=6s) — and compare their realized J/s against the Charnov optimal benchmark!',
  },
  scienceCard: {
    coreTakeaway:
      'Natural selection shapes foraging decision rules (giving-up times, prey selectivity, risk sensitivity, load sizes) that maximize net energy gain or survival probability under time and ecological constraints.',
    assumptions: [
      {
        label: 'Charnov MVT Exponential Patch Depletion',
        status: 'realistic',
        tag: 'Charnov 1976',
        detail: 'Uses smooth diminishing-returns gain g(t) = G_max(1 − e^(−0.42t)) so optimal leave time t* increases monotonically with travel time T_t.',
      },
      {
        label: 'Zero–One Diet Breadth Model',
        status: 'simplified',
        tag: 'Stephens & Krebs 1986',
        detail: 'Assumes sequential Poisson encounter, fixed handling times, and zero recognition error; real predators show partial preferences under sensory uncertainty.',
      },
    ],
    citations: [
      {
        authors: 'Charnov, E. L.',
        year: 1976,
        title: 'Optimal foraging, the marginal value theorem',
        journal: 'Theoretical Population Biology 9:129–136',
      },
      {
        authors: 'Stephens, D. W. & Krebs, J. R.',
        year: 1986,
        title: 'Foraging Theory',
        journal: 'Princeton University Press',
      },
      {
        authors: 'Caraco, T., Martindale, S. & Whittam, T. S.',
        year: 1980,
        title: 'An empirical demonstration of risk-sensitive foraging preferences',
        journal: 'Animal Behaviour 28:820–830',
      },
      {
        authors: 'Orians, G. H. & Pearson, N. E.',
        year: 1979,
        title: 'On the theory of central place foraging',
        journal: 'Analysis of Ecological Systems, Ohio State Univ. Press',
      },
    ],
    standards: {
      undergrad: [
        'Behavioural Ecology: Marginal Value Theorem, Optimal Diet Breadth & Central-Place Foraging',
        'Decision Theory in Evolution: Risk-Sensitive Foraging & Jensen’s Inequality',
      ],
      apOrALevel: ['AP Bio 8.1 (Responses to the Environment & Energy Budgets)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="fg-caption">Playable MVT Foraging Game — Sip or Fly!</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="fg-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="fg-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="fg-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="fg-canvas-host"></div>
      <div class="hwe-plate-legend" id="fg-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D foraging ecology models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#fg-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#fg-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#fg-legend') as HTMLElement;

    const scene = new ForagerScene3D(canvasHost);
    (plateStageEl.querySelector('#fg-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#fg-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#fg-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;

    // Playable Page 1 MVT Game State!
    let gameTravelT = 4;
    let gameTimeUsed = 0;
    const gameTimeLimit = 30;
    let gameEnergy = 0;
    let sipsInPatch = 0;
    let patchIndex = 1;
    let stayHistory: number[] = [];

    // Pages 2-5 Interactive Parameters
    let travelT = 4.0;
    let patchRich = 12.0;
    let richLam = 0.45;
    let poorLam = 0.65;
    let reserveE = 3.2;
    let roundTrip = 6.0;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'mvt_game';
      scene.setPage(pageId);

      if (pageId === 'mvt_game') {
        const opt = solveMvtOptimum(gameTravelT, 12, 0.42);
        const curRate = gameTimeUsed > 0 ? gameEnergy / gameTimeUsed : 0;
        const pctOpt = opt.optIntakeRate > 0 ? Math.min(115, Math.round((curRate / opt.optIntakeRate) * 100)) : 0;
        const nextSipGain = patchGain(sipsInPatch + 1, 12, 0.42) - patchGain(sipsInPatch, 12, 0.42);
        const finished = gameTimeUsed >= gameTimeLimit;

        scene.updateMvtGame(sipsInPatch, gameTravelT, patchIndex);
        captionEl.textContent = finished
          ? `Bout Complete! Your Rate = ${curRate.toFixed(2)} J/s (${pctOpt}% of Charnov MVT!)`
          : `Patch #${patchIndex} · Sips = ${sipsInPatch} · Time Left = ${Math.max(0, gameTimeLimit - gameTimeUsed)}s`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3b8c6e"></i>Hovering Nectar Bird</span>
          <span><i class="hwe-dot" style="background:#d95343"></i>Full Nectar Blossom</span>
          <span><i class="hwe-dot" style="background:#baa590"></i>Depleted Blossom</span>
        `;

        const avgStay = stayHistory.length
          ? (stayHistory.reduce((a, b) => a + b, 0) / stayHistory.length).toFixed(1)
          : sipsInPatch.toFixed(1);

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Playable MVT Nectar Game (${Math.max(0, gameTimeLimit - gameTimeUsed)}s left)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-bottom:8px;">
                <button class="lic-pill-btn ${gameTravelT === 2 ? 'active' : ''}" data-gt="2">Close Meadow (2s fly)</button>
                <button class="lic-pill-btn ${gameTravelT === 6 ? 'active' : ''}" data-gt="6">Distant Meadow (6s fly)</button>
              </div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn active" id="fg-sip" ${finished ? 'disabled' : ''}>Sip Nectar (+${nextSipGain.toFixed(1)} J · 1s)</button>
                <button class="lic-pill-btn" id="fg-fly" ${finished ? 'disabled' : ''}>Fly to Fresh Patch (${gameTravelT}s)</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Energy: ${gameEnergy.toFixed(1)} J</span>
                <span class="hwe-stat-badge">Rate: ${curRate.toFixed(2)} J/s</span>
                <span class="hwe-stat-badge">MVT Opt: ${opt.optIntakeRate.toFixed(2)} J/s</span>
              </div>
              <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:#594d3f;">
                <span>Your Avg Stay: <strong>${avgStay}s</strong> (MVT t* = ${opt.optStayTime.toFixed(1)}s)</span>
                <button class="lic-pill-btn" id="fg-restart" style="padding:3px 9px;font-size:11px;">New Bout</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  finished
                    ? `<strong>Final Score (${pctOpt}% of Charnov Optimum):</strong> Your avg stay was ${avgStay}s vs optimal t* = ${opt.optStayTime.toFixed(1)}s! Try switching between Close (2s) and Distant (6s) meadows to feel how travel cost shifts optimal giving-up time!`
                    : `Next sip yields <strong>+${nextSipGain.toFixed(2)} J/s</strong> vs. Charnov habitat benchmark <strong>${opt.optIntakeRate.toFixed(2)} J/s</strong> — ${nextSipGain < opt.optIntakeRate ? '<strong>marginal gain is below average: time to FLY!</strong>' : 'still profitable: keep sipping!'}`
                }
              </p>
            </div>
          </div>
        `;

        leftPanelEl.querySelectorAll<HTMLElement>('[data-gt]').forEach((b) =>
          b.addEventListener('click', () => {
            gameTravelT = Number(b.dataset.gt);
            gameTimeUsed = 0;
            gameEnergy = 0;
            sipsInPatch = 0;
            patchIndex = 1;
            stayHistory = [];
            renderPage();
          })
        );
        leftPanelEl.querySelector('#fg-sip')?.addEventListener('click', () => {
          if (gameTimeUsed >= gameTimeLimit) return;
          const gain = patchGain(sipsInPatch + 1, 12, 0.42) - patchGain(sipsInPatch, 12, 0.42);
          sipsInPatch += 1;
          gameTimeUsed += 1;
          gameEnergy += gain;
          renderPage();
        });
        leftPanelEl.querySelector('#fg-fly')?.addEventListener('click', () => {
          if (gameTimeUsed >= gameTimeLimit) return;
          if (sipsInPatch > 0) stayHistory.push(sipsInPatch);
          gameTimeUsed = Math.min(gameTimeLimit, gameTimeUsed + gameTravelT);
          sipsInPatch = 0;
          patchIndex += 1;
          renderPage();
        });
        leftPanelEl.querySelector('#fg-restart')?.addEventListener('click', () => {
          gameTimeUsed = 0;
          gameEnergy = 0;
          sipsInPatch = 0;
          patchIndex = 1;
          stayHistory = [];
          renderPage();
        });
      } else if (pageId === 'mvt_tangent') {
        const opt = solveMvtOptimum(travelT, patchRich, 0.42);
        scene.updateMvtTangent(opt);
        captionEl.textContent = `Charnov MVT · Travel T = ${travelT.toFixed(1)}s → Optimal Stay t* = ${opt.optStayTime.toFixed(1)}s`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d95343"></i>Fresh Meadow Patch</span>
          <span><i class="hwe-dot" style="background:#d49d35"></i>Travel Flight Cost (T_t)</span>
        `;

        // Live SVG Charnov Tangent Curve!
        const w = 310;
        const h = 112;
        const tMin = -10;
        const tMax = 14;
        const mapX = (t: number) => 16 + ((t - tMin) / (tMax - tMin)) * (w - 26);
        const mapY = (g: number) => h - 18 - (g / 18) * (h - 26);
        const curvePts: string[] = [];
        for (let t = 0; t <= 14; t += 0.4) {
          curvePts.push(`${mapX(t).toFixed(1)},${mapY(patchGain(t, patchRich, 0.42)).toFixed(1)}`);
        }
        const x0 = mapX(0);
        const xTravel = mapX(-travelT);
        const xStar = mapX(opt.optStayTime);
        const yStar = mapY(opt.optGainAtLeave);

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Charnov Tangent Geometry</div>
              <label class="lic-slider-label">
                <span>Travel Time T_t = <strong>${travelT.toFixed(1)} s</strong></span>
                <input type="range" id="fg-tt" min="1" max="10" step="0.5" value="${travelT}" />
              </label>
              <label class="lic-slider-label">
                <span>Patch Richness G_max = <strong>${patchRich.toFixed(0)} J</strong></span>
                <input type="range" id="fg-gm" min="6" max="16" step="1" value="${patchRich}" />
              </label>
              <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;margin-top:6px;">
                <line x1="16" y1="${mapY(0)}" x2="${w - 10}" y2="${mapY(0)}" stroke="#9e927c" stroke-width="1" />
                <line x1="${x0}" y1="8" x2="${x0}" y2="${mapY(0)}" stroke="#9e927c" stroke-dasharray="3 3" stroke-width="1" />
                <polyline points="${curvePts.join(' ')}" fill="none" stroke="#3b8c6e" stroke-width="2.4" />
                <line x1="${xTravel}" y1="${mapY(0)}" x2="${xStar}" y2="${yStar}" stroke="#c97b1e" stroke-width="2" />
                <circle cx="${xStar}" cy="${yStar}" r="4.2" fill="#c44b42" />
                <text x="${xTravel}" y="${h - 4}" text-anchor="middle" font-size="8.2" fill="#8f5a12">−T_t</text>
                <text x="${xStar}" y="${yStar - 7}" text-anchor="middle" font-size="8.5" fill="#9c2a22" font-weight="600">t*=${opt.optStayTime.toFixed(1)}s</text>
              </svg>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Optimal Rate = ${opt.optIntakeRate.toFixed(2)} J/s:</strong> Longer travel time shifts −T_t left, pivoting the golden tangent flatter and pushing optimal leave time t* to <strong>${opt.optStayTime.toFixed(1)}s</strong>!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#fg-tt') as HTMLInputElement).addEventListener('input', (e) => {
          travelT = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#fg-gm') as HTMLInputElement).addEventListener('input', (e) => {
          patchRich = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'diet') {
        const res = evaluateDietBreadth(richLam, poorLam);
        scene.updateDiet(res);
        captionEl.textContent = res.shouldSpecialize
          ? `SPECIALIZE on Grubs (${res.specialistRate.toFixed(2)} J/s > Seed 1.2 J/s)`
          : `GENERALIZE on Both (${res.generalistRate.toFixed(2)} J/s > Specialist ${res.specialistRate.toFixed(2)})`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#e0b443"></i>Rich Grubs (5.0 J/s)</span>
          <span><i class="hwe-dot" style="background:#b09c7b"></i>Poor Seeds (1.2 J/s)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Optimal Diet Zero–One Rule</div>
              <label class="lic-slider-label">
                <span>Rich Grub Encounter λ₁ = <strong>${richLam.toFixed(2)}/s</strong></span>
                <input type="range" id="fg-l1" min="0.05" max="0.80" step="0.05" value="${richLam}" />
              </label>
              <label class="lic-slider-label">
                <span>Poor Seed Encounter λ₂ = <strong>${poorLam.toFixed(2)}/s</strong></span>
                <input type="range" id="fg-l2" min="0.05" max="1.20" step="0.05" value="${poorLam}" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Grubs Only: ${res.specialistRate.toFixed(2)} J/s</span>
                <span class="hwe-stat-badge">Both Prey: ${res.generalistRate.toFixed(2)} J/s</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>${res.shouldSpecialize ? 'Ignore Seeds (Specialize!)' : 'Eat Both (Generalize!)'}</strong>
                Whenever Grub encounter λ₁ &gt; 0.16/s, grub-only intake exceeds seed profitability (1.20 J/s) — so sliding λ₂ up to 1.20 NEVER changes the optimal decision!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#fg-l1') as HTMLInputElement).addEventListener('input', (e) => {
          richLam = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#fg-l2') as HTMLInputElement).addEventListener('input', (e) => {
          poorLam = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'risk') {
        const res = evaluateRiskForaging(reserveE);
        scene.updateRisk(res);
        captionEl.textContent =
          res.optimalChoice === 'risky'
            ? `Starving (${reserveE.toFixed(1)} J) → Choose RISKY Lottery Patch!`
            : `Well-Fed (${reserveE.toFixed(1)} J) → Choose SAFE Steady Patch!`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#5f8f72"></i>Safe (+2.5 J always)</span>
          <span><i class="hwe-dot" style="background:#c45b42"></i>Risky (0 or +5.0 J)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Overnight Survival Threshold = 6.5 J</div>
              <label class="lic-slider-label">
                <span>Current Energy Reserve = <strong>${reserveE.toFixed(1)} J</strong></span>
                <input type="range" id="fg-res" min="1.5" max="6.5" step="0.2" value="${reserveE}" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Safe Survival: ${Math.round(res.safeSurvivalProb * 100)}%</span>
                <span class="hwe-stat-badge">Risky Survival: ${Math.round(res.riskySurvivalProb * 100)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Jensen’s Inequality:</strong> Both patches average +2.5 J! Yet below 4.0 J, Safe leaves you below 6.5 J (certain starvation), while Risky offers a 50% jackpot rescue — flipping behaviour from risk-averse to <strong>risk-prone</strong>!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#fg-res') as HTMLInputElement).addEventListener('input', (e) => {
          reserveE = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'central') {
        const res = evaluateCentralPlace(roundTrip);
        scene.updateCentral(res);
        captionEl.textContent = `Round-Trip Flight = ${roundTrip.toFixed(1)}s → Optimal Beak Load = ${res.optimalLoad} Grubs`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#8c6c4a"></i>Central Twig Nest</span>
          <span><i class="hwe-dot" style="background:#e0b443"></i>Beak Load (${res.optimalLoad} Grubs)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Orians–Pearson Central-Place Foraging</div>
              <label class="lic-slider-label">
                <span>Round-Trip Flight Time = <strong>${roundTrip.toFixed(1)} s</strong></span>
                <input type="range" id="fg-rt" min="1" max="20" step="1" value="${roundTrip}" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Optimal Load: ${res.optimalLoad} grubs</span>
                <span class="hwe-stat-badge">Delivery: ${res.deliveryRate.toFixed(1)} grubs/min</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Load-Size Effect:</strong> Holding grubs in the bill slows each extra capture — yet when the nest is far away (${roundTrip.toFixed(0)}s flight), carrying <strong>${res.optimalLoad} grubs</strong> per trip beats making frequent tiny trips!
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#fg-rt') as HTMLInputElement).addEventListener('input', (e) => {
          roundTrip = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate 18 — Optimal Foraging & MVT Diagnostic Check';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3b8c6e"></i>Forager</span>
          <span><i class="hwe-dot" style="background:#d95343"></i>Nectar Patch</span>
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
          ctx.completeChapter('forager', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the foraging model on the preceding 3D plate.'
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
