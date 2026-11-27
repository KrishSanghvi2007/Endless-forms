// =============================================================================
// Chapter 8: Sex, Choice & Slow Islands — Anisogamy, Bateman Gradients,
// Aripo Guppies, Sperm Competition Raffle, Fisher Sex Ratio & Island Senescence
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  computeBateman,
  computeFisherSexRatio,
  computeGuppyBalance,
  computeSenescence,
  computeSpermRaffle,
} from './raffleMath';
import { RaffleScene3D, type RafflePageId } from './RaffleScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'raffle')!;

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
    id: 'rf1-guppy',
    prompt:
      'John Endler transplanted Trinidadian guppies from a high-predation stream (with pike-cichlids) into a predator-free upstream pool. Within ~15 generations, what evolved?',
    options: [
      { id: 'a', label: 'Males evolved far brighter orange spots and longer tails because female mate preference was no longer opposed by visual predators.', correct: true },
      { id: 'b', label: 'Males became even drabber because they no longer needed to outrun predators.', correct: false },
      { id: 'c', label: 'Females stopped choosing mates altogether.', correct: false },
    ],
    explanation:
      'Correct! Endler (1980) demonstrated rapid opposing sexual vs. natural selection: once pike-cichlid predation was relaxed, female preference for carotenoid orange drove dramatic male ornamentation within ~15 generations.',
  },
  {
    id: 'rf2-fisher',
    prompt:
      'A freak storm leaves an island bird population with 80% females and only 20% males. According to Fisher’s sex-ratio principle, parents carrying a gene that produces mostly SONS will:',
    options: [
      { id: 'a', label: 'Have LOWER fitness because sons are always costlier than daughters.', correct: false },
      { id: 'b', label: 'Have 4× HIGHER expected grand-offspring per child, rapidly pulling the population sex ratio back toward 50:50.', correct: true },
      { id: 'c', label: 'Cause the population to stabilize permanently at 20% males.', correct: false },
    ],
    explanation:
      'Correct! Because every diploid chick has exactly one father and one mother, the rarer sex (males at 20%) gets 4× more mates per individual on average, driving negative frequency-dependent recovery to 50:50 investment (Fisher 1930).',
  },
  {
    id: 'rf3-senescence',
    prompt:
      'Why do predator-free Sapelo Island Virginia opossums age more slowly, start reproducing later, and live longer than mainland opossums (Austad 1993)?',
    options: [
      { id: 'a', label: 'Mainland opossums intentionally die young to leave food for the species.', correct: false },
      { id: 'b', label: 'Lower extrinsic mortality on the island keeps survivorship high into old age, strengthening Hamilton’s force of selection against late-acting deleterious mutations and favoring somatic repair.', correct: true },
      { id: 'c', label: 'Islands have higher mutation rates that repair DNA.', correct: false },
    ],
    explanation:
      'Correct! Evolutionary theories of ageing (Medawar mutation accumulation & Williams antagonistic pleiotropy) predict that lower extrinsic predation keeps late-life selection strong, evolving slower senescence and smaller, later litters.',
  },
];

const PAGE_IDS: RafflePageId[] = ['bateman', 'guppies', 'raffle', 'fisher', 'opossums', 'check'];

export const CH08_RAFFLE: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'bateman',
      shortLabel: '1 Bateman',
      eyebrow: 'ANISOGAMY & OPERATIONAL SEX RATIO',
      heading: 'Why gamete asymmetry sparks competition',
      bodyHtml: `Sexual selection begins with ${gloss('anisogamy', 'anisogamy')}—large, nutrient-rich eggs versus tiny, abundant sperm—shifting the ${gloss('osr', 'Operational Sex Ratio (OSR)')} and tilting the ${gloss('bateman_gradient', 'Bateman gradient')}. Slide OSR below 1.0 to see sex-role reversal (pipefish &amp; seahorses)!`,
      promptHint: 'Slide OSR from 0.3 (sex-role reversal) to 4.0 (intense male competition).',
    },
    {
      id: 'guppies',
      shortLabel: '2 Guppies',
      eyebrow: 'ENDLER (1980) · TRINIDADIAN ARIPO STREAMS',
      heading: 'Female choice meets the pike-cichlid',
      bodyHtml: `In Trinidad’s Aripo rivers, female guppies prefer bright carotenoid-orange males (via sensory bias, honest foraging signals, and ${gloss('fisher_runaway', 'Fisherian runaway')}), while predatory pike-cichlids pick off flashy males first.`,
      promptHint: 'Balance pike-cichlid predation against female preference to morph male guppies live.',
    },
    {
      id: 'raffle',
      shortLabel: '3 Raffle',
      eyebrow: 'PARKER (1970) · YELLOW DUNG FLIES',
      heading: 'Post-copulatory sperm competition',
      bodyHtml: `Sexual selection doesn’t stop at mating! In yellow dung flies (<em>Scathophaga stercoraria</em>), males flush rival sperm in a ${gloss('sperm_competition', 'sperm competition raffle')}—facing a Marginal Value trade-off between gaining extra paternity (P₂) and searching for fresh females.`,
      promptHint: 'Adjust copulation duration to find Parker’s empirical 41-minute optimum.',
    },
    {
      id: 'fisher',
      shortLabel: '4 Sex Ratio',
      eyebrow: 'FISHER (1930) · FREQUENCY-DEPENDENT ALLOCATION',
      heading: 'Why nature balances near 50:50',
      bodyHtml: `Why don’t species evolve 90% females to double population growth? Because selection acts on individuals, not the group! Under ${gloss('fisher_sex_ratio', 'Fisher’s sex-ratio principle')}, whichever sex is rarer enjoys higher per-capita reproductive payoff—restoring 1:1 investment.`,
      promptHint: 'Skew the son fraction to 20% or 80% and watch the brass payoff beam tilt toward the rarer sex.',
    },
    {
      id: 'opossums',
      shortLabel: '5 Slow Islands',
      eyebrow: 'AUSTAD (1993) · EVOLUTION OF SENESCENCE',
      heading: 'Why low predation slows ageing',
      bodyHtml: `Ageing is not a program "for the good of the species"—it is the shadow of declining selection with age! Lower extrinsic predation on Georgia’s Sapelo Island keeps Hamilton’s force of selection strong into old age, delaying ${gloss('senescence', 'senescence')} via slower reproduction and better somatic repair.`,
      promptHint: 'Slide predation mortality from Sapelo Island (0.08) to Mainland (0.60) to watch lifespan & selection pillars shift.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'SEXUAL SELECTION & LIFE HISTORY MASTERY',
      heading: 'Choice, conflict & longevity',
      bodyHtml: `Synthesize Endler’s guppy transplants, Fisher’s 1:1 sex-ratio equilibrium, and evolutionary ageing across three undergraduate exam cases.`,
      promptHint: 'Complete all three cases to stamp Plate 8.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Behavioural Ecology & Life-History Evolution)',
    learningObjectives: [
      'Relate anisogamy and Operational Sex Ratio (OSR) to Bateman gradients—including sex-role reversal when OSR < 1.',
      'Explain how female choice and visual predation create opposing selection pressures in Trinidadian guppies (Endler 1980).',
      'Apply Parker’s (1970) Marginal Value Theorem to post-copulatory sperm competition in yellow dung flies.',
      'Derive Fisher’s 1:1 sex-ratio equilibrium via negative frequency-dependent individual selection.',
      'Contrast Medawar’s mutation accumulation and Williams’s antagonistic pleiotropy in explaining island vs. mainland senescence.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Animals age and die to make room for younger members of their species.',
        correction:
          'Group-benefit senescence fails against individual selection. Ageing evolves because extrinsic mortality weakens Hamilton’s force of selection at late ages (Medawar 1952; Williams 1957; Hamilton 1966).',
      },
      {
        misconception: 'Males are always the competitive sex in all animals.',
        correction:
          'When paternal care limits male availability (OSR < 1, e.g. pipefish, seahorses, jacanas), females compete intensely and Bateman gradients reverse.',
      },
    ],
    discussionPrompts: [
      'Why does Hamilton’s Local Mate Competition (siblings mating inside figs) break Fisher’s 50:50 rule in favour of female-biased clutches?',
      'How can researchers separate Medawar’s mutation accumulation from Williams’s antagonistic pleiotropy experimentally?',
    ],
    activityTip:
      'On Page 3, challenge students to find the copulation duration maximizing eggs/min and compare it to Parker’s actual field mean (35.5–41 min).',
  },
  scienceCard: {
    coreTakeaway:
      'Gamete and parental-care asymmetries drive pre- and post-copulatory sexual selection, individual frequency-dependent payoffs stabilize 1:1 sex investment, and extrinsic mortality sets the pace of ageing by controlling Hamilton’s force of selection across age classes.',
    assumptions: [
      {
        label: 'Aripo Guppy Transplant Experiment',
        status: 'realistic',
        tag: 'Endler 1980',
        detail: 'Natural & experimental pools confirm rapid shift in male spot colouration and life history when pike-cichlids are absent.',
      },
      {
        label: 'Dung Fly Sperm Displacement Curve',
        status: 'realistic',
        tag: 'Parker 1970',
        detail: 'Diminishing-returns displacement curve predicts ~41 min copulation; empirical field mean is 35.5 min.',
      },
      {
        label: 'Sapelo Island Opossum Longevity',
        status: 'realistic',
        tag: 'Austad 1993',
        detail: 'Predator-free island opossums show ~25–50% longer lifespan, smaller litters, and slower tail-tendon collagen cross-linking.',
      },
    ],
    citations: [
      {
        authors: 'Endler, J. A.',
        year: 1980,
        title: 'Natural selection on color patterns in Poecilia reticulata',
        journal: 'Evolution 34:76–91',
      },
      {
        authors: 'Parker, G. A.',
        year: 1970,
        title: 'Sperm competition and its evolutionary effect on copula duration in the fly Scatophaga stercoraria',
        journal: 'J. Insect Physiology 16:1301–1328',
      },
      {
        authors: 'Austad, S. N.',
        year: 1993,
        title: 'Retarded senescence in an insular population of Virginia opossums (Didelphis virginiana)',
        journal: 'Journal of Zoology 229:695–708',
      },
    ],
    standards: {
      undergrad: [
        'Sexual Selection: Anisogamy, OSR, Bateman Gradients & Sperm Competition',
        'Fisher’s Frequency-Dependent Sex Ratio Theory',
        'Life-History Trade-offs & Evolutionary Theories of Ageing (Senescence)',
      ],
      apOrALevel: ['AP Bio 7.2 / A-Level Sexual Selection & Life-History Strategies'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="rf-caption">Plate VIII · Anisogamy & Bateman Gradients</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="rf-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="rf-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="rf-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="rf-canvas-host"></div>
      <div class="hwe-plate-legend" id="rf-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D organisms</div>
    `;

    const canvasHost = plateStageEl.querySelector('#rf-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#rf-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#rf-legend') as HTMLElement;

    const scene = new RaffleScene3D(canvasHost);
    (plateStageEl.querySelector('#rf-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#rf-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#rf-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let osr = 2.2;
    let predation = 0.2;
    let femPref = 0.85;
    let copMin = 41;
    let maleFrac = 0.25;
    let extMort = 0.12;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'bateman';
      scene.setPage(pageId);

      if (pageId === 'bateman') {
        const res = computeBateman(osr);
        scene.updateBateman(res);
        captionEl.textContent = 'Plate VIII.1 · Anisogamy & Bateman Gradients';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f4c752"></i>Nutrient-Rich Ovum</span>
          <span><i class="hwe-dot" style="background:#2f658e"></i>Male Gradient / Sperm</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Female Gradient</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Operational Sex Ratio (Receptive ♂ : ♀)</div>
              <label style="display:block;font-size:0.84rem;">
                OSR = <strong>${osr.toFixed(1)} : 1</strong>
                <input type="range" id="rf-osr" min="0.3" max="4.0" step="0.1" value="${osr}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">♂ Slope: ${res.maleSlope.toFixed(2)}</span>
                <span class="hwe-stat-badge">♀ Slope: ${res.femaleSlope.toFixed(2)}</span>
              </div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:8px;">
                <button class="lic-pill-btn ${osr < 0.8 ? 'active' : ''}" id="rf-pipefish">Pipefish (0.4)</button>
                <button class="lic-pill-btn ${osr > 2.5 ? 'active' : ''}" id="rf-seal">Elephant Seal (3.5)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Bateman’s Principle:</strong> The sex that invests less per offspring re-enters the mating pool faster (higher OSR), creating steeper variance in mating success—and reversing completely when males brood young!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#rf-osr')?.addEventListener('input', (e) => {
          osr = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#rf-pipefish')?.addEventListener('click', () => {
          osr = 0.4;
          renderPage();
        });
        leftPanelEl.querySelector('#rf-seal')?.addEventListener('click', () => {
          osr = 3.5;
          renderPage();
        });
      } else if (pageId === 'guppies') {
        const res = computeGuppyBalance(predation, femPref);
        scene.updateGuppies(res);
        captionEl.textContent = 'Plate VIII.2 · Trinidadian Aripo Guppies & Pike-Cichlid';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f05a1e"></i>Carotenoid Orange Male</span>
          <span><i class="hwe-dot" style="background:#9aa392"></i>Choosing Female</span>
          <span><i class="hwe-dot" style="background:#4f624c"></i>Pike-Cichlid Predator</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Aripo River Selection Balance</div>
              <label style="display:block;font-size:0.84rem;">
                Pike-Cichlid Predation = <strong>${(predation * 100).toFixed(0)}%</strong>
                <input type="range" id="rf-pred" min="0" max="1" step="0.05" value="${predation}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Female Orange Preference = <strong>${(femPref * 100).toFixed(0)}%</strong>
                <input type="range" id="rf-pref" min="0.1" max="1" step="0.05" value="${femPref}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Orange: ${(res.eqOrange * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Survival: ${(res.survivalRate * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Opposing Selection:</strong> Bright carotenoid spots win mates (mating edge ${res.matingAdvantage.toFixed(2)}×) via sensory bias &amp; good-genes foraging vigour, yet draw visual predators in downstream pools.</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#rf-pred')?.addEventListener('input', (e) => {
          predation = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#rf-pref')?.addEventListener('input', (e) => {
          femPref = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'raffle') {
        const res = computeSpermRaffle(copMin);
        scene.updateSpermRaffle(res);
        captionEl.textContent = 'Plate VIII.3 · Yellow Dung Fly Sperm Competition Raffle';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d69a2d"></i>2nd Male Paternity (P₂)</span>
          <span><i class="hwe-dot" style="background:#2f658e"></i>1st Male Remaining Sperm</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Parker (1970) Copulation Duration</div>
              <label style="display:block;font-size:0.84rem;">
                Copulation Time t = <strong>${copMin} min</strong>
                <input type="range" id="rf-cop" min="10" max="75" step="1" value="${copMin}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">P₂ = ${(res.p2Paternity * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Rate = ${res.marginalRate.toFixed(3)} /min</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Marginal Value Theorem:</strong> Displacing rival sperm obeys diminishing returns (P₂ = 1 − e^(−t/22.5)). Leaving at ~<strong>41 min</strong> maximizes lifetime fertilization rate given 156 min search time!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#rf-cop')?.addEventListener('input', (e) => {
          copMin = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'fisher') {
        const res = computeFisherSexRatio(maleFrac);
        scene.updateFisher(res);
        captionEl.textContent = 'Plate VIII.4 · Fisher’s 1:1 Sex-Ratio Balance';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f05a1e"></i>Sons (♂)</span>
          <span><i class="hwe-dot" style="background:#9aa392"></i>Daughters (♀)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Population Offspring Sex Ratio</div>
              <label style="display:block;font-size:0.84rem;">
                Fraction Sons = <strong>${(maleFrac * 100).toFixed(0)}%</strong>
                <input type="range" id="rf-mf" min="0.10" max="0.90" step="0.05" value="${maleFrac}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Son Payoff: ${res.sonPayoff.toFixed(2)}×</span>
                <span class="hwe-stat-badge">Daughter: ${res.daughterPayoff.toFixed(2)}×</span>
              </div>
              <button class="lic-btn primary" id="rf-step-fisher" style="width:100%;margin-top:8px;">Evolve 1 Generation →</button>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Fisher (1930):</strong> Because total male reproductive output must equal total female output, a rare sex yields strictly higher per-capita grand-offspring—pulling parental investment back to <strong>1:1</strong>.</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#rf-mf')?.addEventListener('input', (e) => {
          maleFrac = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#rf-step-fisher')?.addEventListener('click', () => {
          maleFrac = Number(res.nextGenMaleFraction.toFixed(2));
          renderPage();
        });
      } else if (pageId === 'opossums') {
        const res = computeSenescence(extMort);
        scene.updateOpossums(res);
        captionEl.textContent = 'Plate VIII.5 · Slow Island Opossums & Evolution of Ageing';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Strong Early Selection</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Selection Shadow (Late Age)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Extrinsic Predation Mortality</div>
              <label style="display:block;font-size:0.84rem;">
                Annual Predation Risk = <strong>${(extMort * 100).toFixed(0)}%</strong>
                <input type="range" id="rf-mort" min="0.08" max="0.65" step="0.03" value="${extMort}" style="width:100%;" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:8px;">
                <button class="lic-pill-btn ${extMort < 0.2 ? 'active' : ''}" id="rf-island">Sapelo Island (11%)</button>
                <button class="lic-pill-btn ${extMort > 0.45 ? 'active' : ''}" id="rf-mainland">Mainland (56%)</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Lifespan: ${res.evolvedLifespanYrs.toFixed(1)} yr</span>
                <span class="hwe-stat-badge">1st Litter: ${res.ageFirstReproductionMo} mo</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Medawar &amp; Williams:</strong> High predation casts a "selection shadow" over old age—late-acting mutations accumulate and early reproduction beats somatic repair.</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#rf-mort')?.addEventListener('input', (e) => {
          extMort = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#rf-island')?.addEventListener('click', () => {
          extMort = 0.11;
          renderPage();
        });
        leftPanelEl.querySelector('#rf-mainland')?.addEventListener('click', () => {
          extMort = 0.56;
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate VIII.6 · Sexual Selection & Life History Diagnostic';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f05a1e"></i>Aripo Guppy</span>
          <span><i class="hwe-dot" style="background:#dca024"></i>Dung Fly</span>
          <span><i class="hwe-dot" style="background:#9a938a"></i>Island Opossum</span>
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
          ctx.completeChapter('raffle', correctCount, CHECK_CASES.length);
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
