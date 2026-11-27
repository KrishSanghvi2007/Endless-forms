import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  hawkDoveEss,
  hawkDoveFitnesses,
  hawkDovePayoff,
  PEDIGREE_RELATIONS,
  simulateHamiltonTrajectory,
  stepHawkDove,
  stepThreeWay,
  warOfAttritionPayoff,
  type PedigreeRelationId,
} from './socialMath';
import { SocialScene3D, type SocialPageId } from './SocialScene3D';
import './social.css';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'social')!;

function gloss(id: string, label: string): string {
  return `<span class="gloss-term" tabindex="0" role="button" data-term="${id}">${label}</span>`;
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}

interface SocialCheckQ {
  id: string;
  prompt: string;
  options: { id: string; label: string; correct: boolean }[];
  explanation: string;
}

const SOCIAL_CHECKS: SocialCheckQ[] = [
  {
    id: 'sc1-vc',
    prompt:
      'On a shoreline where a spiral shell is worth V = 40 and a serious fight injury costs C = 80, the mixed Hawk–Dove ESS sits at 50% Hawks. If predators make injuries twice as deadly (C = 160), where does the ESS move?',
    options: [
      { id: 'a', label: '0% Hawks — all crabs evolve into Doves for the good of the species.', correct: false },
      { id: 'b', label: '25% Hawks — because p* = V / C = 40 / 160 = 0.25.', correct: true },
      { id: 'c', label: '50% Hawks — injury cost cancels out when everyone fights.', correct: false },
    ],
    explanation:
      'Spot on! Even when fighting is catastrophic (C = 160), pure Doves can still be invaded by a rare Hawk who always wins V = 40 uncontested. Selection settles exactly where W(Hawk) = W(Dove): p* = V/C = 25%.',
  },
  {
    id: 'sc2-bourgeois',
    prompt:
      'Why can the Bourgeois strategy (“Hawk when shell owner, Dove when intruder”) invade and replace a Hawk–Dove mixed population when V < C?',
    options: [
      { id: 'a', label: 'Because Bourgeois uses an uncorrelated asymmetry (ownership) so two Bourgeois crabs never fight each other, earning V/2 with zero injury cost.', correct: true },
      { id: 'b', label: 'Because Bourgeois crabs are physically stronger than Hawks.', correct: false },
      { id: 'c', label: 'Because Bourgeois crabs recognise their siblings by smell.', correct: false },
    ],
    explanation:
      'Exactly right. When V < C, Bourgeois beats Doves (3V/4 vs V/4), resists rare Hawks (who suffer costly fights half the time), and enjoys peaceful V/2 payoffs against other Bourgeois individuals.',
  },
  {
    id: 'sc3-hamilton',
    prompt:
      'A ground squirrel’s alarm call puts the caller at personal mortality cost C = 0.20, while saving a nearby relative’s expected survival benefit B = 0.60. Under Hamilton’s rule (rB > C), which neighbour relationship allows the Caller allele to spread?',
    options: [
      { id: 'a', label: 'First cousins (r = 0.125), because rB = 0.075.', correct: false },
      { id: 'b', label: 'Half-siblings (r = 0.25), because rB = 0.15.', correct: false },
      { id: 'c', label: 'Full siblings (r = 0.50), because rB = 0.30 > C = 0.20.', correct: true },
    ],
    explanation:
      'Correct! Only full siblings satisfy rB > C (0.50 × 0.60 = 0.30 > 0.20). Half-sibs (0.15) and cousins (0.075) fall short of the 0.20 cost, so Silent alleles outcompete Callers unless more kin are within earshot.',
  },
];

const PAGE_IDS: SocialPageId[] = [
  'shore',
  'bourgeois',
  'attrition',
  'pedigree',
  'hamilton',
  'check',
];

export const CH02_SOCIAL: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'shore',
      shortLabel: '1 Hawks',
      eyebrow: 'FREQUENCY-DEPENDENT CONTESTS · MAYNARD SMITH',
      heading: 'The shoreline contest (V vs. C)',
      bodyHtml: `When hermit crabs contest a shell of value <strong>V</strong> at injury risk <strong>C</strong>, the best move depends on what everyone else does (${gloss('frequency_dependence', 'frequency-dependent selection')}). Stage live 3D contests and evolve the shoreline to find the ${gloss('ess', 'Evolutionarily Stable Strategy (ESS)')}.`,
      promptHint: 'Adjust V and C, stage live 3D crab duels, or evolve the shoreline toward p* = V / C.',
    },
    {
      id: 'bourgeois',
      shortLabel: '2 Bourgeois',
      eyebrow: 'OWNERSHIP CONVENTIONS & ESS ≠ GROUP OPTIMUM',
      heading: 'How property resolves conflict',
      bodyHtml: `Notice a paradox: at the Hawk–Dove ESS, average payoff is <em>lower</em> than in an all-Dove world, yet pure Doves cannot resist a Hawk mutant. Now introduce ${gloss('bourgeois', 'Bourgeois')} (“play Hawk if you own the shell, Dove if intruder”) and watch injuries vanish.`,
      promptHint: 'Click “Introduce 5% Bourgeois” and step generations to watch the ownership convention sweep the shore.',
    },
    {
      id: 'attrition',
      shortLabel: '3 Attrition',
      eyebrow: 'CONTINUOUS DISPLAY CONTESTS',
      heading: 'The war of attrition',
      bodyHtml: `Many animal contests involve stamina displays rather than bloodshed—a ${gloss('war_of_attrition', 'War of Attrition')}. Any fixed waiting time <em>t</em> can be beaten by a rival who waits <em>t + ε</em>, so selection yields an unpredictable exponential distribution of persistence times.`,
      promptHint: 'Switch between a fixed persistence strategy (invadable!) and the smooth exponential ESS curve.',
    },
    {
      id: 'pedigree',
      shortLabel: '4 Pedigree',
      eyebrow: 'WRIGHT’S RELATEDNESS · PATH COUNTING',
      heading: 'Tracing genes across family trees',
      bodyHtml: `Now flip from conflict to cooperation. Evolution cares about gene copies shared identical by descent—measured by ${gloss('relatedness', 'relatedness (r)')}. Tap any relationship below to light up every genealogical path in 3D, including ${gloss('haplodiploidy', 'haplodiploid sisters')}.`,
      promptHint: 'Compare Full Sibs (0.50), Half-Sibs (0.25), Cousins (0.125), and Haplodiploid Sisters (0.75) vs. Brothers (0.25).',
    },
    {
      id: 'hamilton',
      shortLabel: '5 Hamilton',
      eyebrow: 'INCLUSIVE FITNESS · rB > C',
      heading: 'Alarm calls under a circling hawk',
      bodyHtml: `On a Sierra meadow, a Belding’s ground squirrel whistling at a hawk draws predator attention (cost <strong>C</strong>) while warning burrow neighbours (benefit <strong>B</strong>). Test ${gloss('hamiltons_rule', 'Hamilton’s rule (rB > C)')} under kin-clustered burrows versus random dispersal (${gloss('inclusive_fitness', 'inclusive fitness')}).`,
      promptHint: 'Click “Hawk Strike!” to hear alarm ripples, then toggle Kin Clusters vs. Dispersed Burrows.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'GAME THEORY & INCLUSIVE FITNESS CHECK',
      heading: 'Unify conflict and kinship',
      bodyHtml: `Test your command of ESS invasion conditions, ownership asymmetries, and Hamilton’s rule on three core undergraduate scenarios.`,
      promptHint: 'Complete all three challenges to stamp Plate 2 in your Atlas progress map.',
    },
  ],

  teacherGuide: {
    estimatedMinutes: 20,
    level: 'Undergraduate Evolutionary Biology & Behavioural Ecology (Years 1–3)',
    learningObjectives: [
      'Compute expected payoffs in the Hawk–Dove matrix and derive the mixed ESS p* = V/C when V < C.',
      'Explain why an ESS need not maximise mean population fitness (contrasting the Hawk–Dove equilibrium against all-Dove).',
      'Demonstrate how an uncorrelated asymmetry (Bourgeois ownership convention) becomes a peaceful ESS without invoking group selection.',
      'Derive Wright’s coefficient of relatedness r = Σ(½)^L across diploid and haplodiploid pedigrees, including the 3/4 relatedness caveat (sister–brother r = 0.25).',
      'Apply Hamilton’s rule (rB > C) to predict when altruistic alleles spread under kin viscosity versus dispersal.',
    ],
    commonMisconceptions: [
      {
        misconception: '“Animals restrain fighting in Dove displays to avoid hurting the species.”',
        correction:
          'Selection acts on individual/gene-level payoffs. Restraint evolves either when injury costs outweigh V (making rare Doves fitter than Hawks at high Hawk density) or via ownership conventions like Bourgeois.',
      },
      {
        misconception: '“Haplodiploidy alone explains eusociality in ants, bees, and wasps because sisters share r = 0.75.”',
        correction:
          'Females share r = 0.75 with full sisters but only r = 0.25 with brothers, giving an average r = 0.50 across equal-sex broods. Lifetime strict monogamy (ensuring siblings are full sibs rather than half-sibs) and high ecological B/C are essential (Boomsma 2009; West et al. 2007).',
      },
      {
        misconception: '“Hamilton’s rule requires animals to consciously calculate r or recognise kin.”',
        correction:
          'Limited dispersal (population viscosity, as in female-philopatric ground squirrels) creates positive relatedness r among burrow neighbours automatically, even with simple behavioural rules.',
      },
    ],
    discussionPrompts: [
      'In Page 2, all-Dove has a higher average payoff than the Hawk–Dove ESS. Why does natural selection fail to hold the shoreline at all-Dove?',
      'In Belding’s ground squirrels (Sherman 1977, 1985), females remain near their natal burrows while males disperse. Predict which sex gives alarm calls far more often, and explain why using rB > C.',
      'Why does the “Anti-Bourgeois” convention (intruder plays Hawk, owner plays Dove) also form a mathematical ESS in the simple game, and what real-world asymmetry usually favours Bourgeois?',
    ],
    activityTip:
      'On Page 1, set V = 40, C = 100 and start at 90% Doves; ask students to predict whether Hawks or Doves will increase first before clicking “Evolve +8 Generations”. Then flip to Page 5 and switch from Kin Clusters to Dispersed Burrows to watch the Caller curve flip sign immediately.',
  },

  scienceCard: {
    coreTakeaway:
      'Both ritualised restraint in conflict (ESS) and biological altruism among relatives (rB > C) emerge from gene-level natural selection without invoking “the good of the species”.',
    assumptions: [
      {
        label: 'Symmetric Hawk–Dove & Bourgeois',
        status: 'realistic',
        tag: 'Exact ESS',
        detail:
          'Uses Maynard Smith’s (1982) exact payoff matrix and discrete replicator dynamics. Assumes pairwise random encounters, large population, and no prior resource-holding power (RHP) differences.',
      },
      {
        label: 'War of Attrition',
        status: 'simplified',
        tag: 'Linear cost',
        detail:
          'Assumes linear display cost (1 unit per unit time) and symmetric valuation V, yielding the classic exponential ESS PDF f(t) = (1/V)e^(−t/V) (Bishop & Cannings 1978).',
      },
      {
        label: 'Belding’s Ground Squirrels & Relatedness',
        status: 'realistic',
        tag: 'Field basis',
        detail:
          'Sherman (1977, 1985) showed female Belding’s ground squirrels (philopatric, living near close female kin) call far more frequently than dispersing males, and that callers suffer higher predator-attack rates.',
      },
      {
        label: 'Haplodiploidy Hypothesis',
        status: 'contested',
        tag: 'Nuance',
        detail:
          'The classic “3/4 relatedness” explanation for Hymenoptera eusociality is no longer accepted as sufficient on its own because of the 0.25 relatedness to brothers; strict ancestral monogamy and ecological B/C ratios are key (Boomsma 2009; West et al. 2007).',
      },
    ],
    contestedNotes: [
      'Inclusive fitness vs. multilevel (group) selection are mathematically equivalent accountings of the Price equation under standard assumptions (Queller 1992; West et al. 2007), though inclusive fitness (rB > C) is typically more transparent for behavioural ecology.',
    ],
    citations: [
      {
        authors: 'Maynard Smith, J. & Price, G. R.',
        year: 1973,
        title: 'The logic of animal conflict',
        journal: 'Nature 246: 15–18',
      },
      {
        authors: 'Maynard Smith, J.',
        year: 1982,
        title: 'Evolution and the Theory of Games',
        journal: 'Cambridge University Press',
      },
      {
        authors: 'Hamilton, W. D.',
        year: 1964,
        title: 'The genetical evolution of social behaviour I & II',
        journal: 'Journal of Theoretical Biology 7: 1–52',
      },
      {
        authors: 'Sherman, P. W.',
        year: 1977,
        title: 'Nepotism and the evolution of alarm calls',
        journal: 'Science 197: 1246–1253',
      },
      {
        authors: 'West, S. A., Griffin, A. S. & Gardner, A.',
        year: 2007,
        title: 'Evolutionary explanations for cooperation',
        journal: 'Current Biology 17: R661–R672',
      },
      {
        authors: 'Boomsma, J. J.',
        year: 2009,
        title: 'Lifetime monogamy and the evolution of eusociality',
        journal: 'Phil. Trans. R. Soc. B 364: 3191–3207',
      },
    ],
    standards: {
      undergrad: [
        'Evolutionary game theory: frequency-dependent selection, ESS (V/C), Bourgeois & War of Attrition',
        'Kin selection: Wright’s relatedness (r), inclusive fitness, Hamilton’s rule (rB > C)',
        'Social evolution: philopatry, haplodiploidy caveat, gene-level vs. group-level reasoning',
      ],
      apOrALevel: [
        'AP Biology ENE-3.D / IST-5.A: Altruism, kin selection & behavioural responses',
        'UK A-Level / Undergraduate Bridge: Behavioural ecology & natural selection on social traits',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <div class="plate-caption-pill">
          <span class="plate-caption-text" data-soc-caption>Tidal Shoreline — hermit crab shell contests</span>
          <span class="plate-scale-bar">
            <span data-soc-tag>ESS p* = 0.40</span>
          </span>
        </div>
        <div class="plate-view-tools">
          <button type="button" class="plate-tool-btn" data-soc-reset>Reset 3D</button>
        </div>
      </div>

      <div class="plate-canvas-host" data-soc-canvas></div>

      <div class="hwe-plate-legend" data-soc-legend>
        <span><i class="hwe-dot soc-dot-hawk"></i>Hawk (raised claws)</span>
        <span><i class="hwe-dot soc-dot-dove"></i>Dove (lowered claws)</span>
      </div>

      <div class="plate-orbit-hint" style="bottom:18px;">Drag to orbit 3D · Scroll to zoom</div>
    `;

    const captionEl = plateStageEl.querySelector<HTMLElement>('[data-soc-caption]')!;
    const tagEl = plateStageEl.querySelector<HTMLElement>('[data-soc-tag]')!;
    const legendEl = plateStageEl.querySelector<HTMLElement>('[data-soc-legend]')!;
    const canvasHost = plateStageEl.querySelector<HTMLElement>('[data-soc-canvas]')!;
    const resetBtn = plateStageEl.querySelector<HTMLButtonElement>('[data-soc-reset]')!;

    const scene3d = new SocialScene3D(canvasHost);
    resetBtn.addEventListener('click', () => scene3d.resetView());

    // Page 1 state (Hawk–Dove shoreline)
    let p1V = 40;
    let p1C = 100;
    let p1HawkFreq = 0.15;
    let p1Gen = 0;

    // Page 2 state (Bourgeois invasion)
    let p2Freqs: [number, number, number] = [0.4, 0.6, 0.0];
    let p2Gen = 0;
    let p2Injury = 0.16;
    let p2MeanPay = 12;

    // Page 3 state (War of Attrition)
    let p3Mode: 'pure' | 'ess' = 'pure';
    let p3V = 4;
    let p3FixedT = 4;

    // Page 4 state (3D Pedigree)
    let p4Rel: PedigreeRelationId = 'full_sibs';

    // Page 5 state (Hamilton's Rule Meadow)
    let p5Clustered = true;
    let p5B = 0.8;
    let p5C = 0.22;

    // Page 6 state (Check)
    let checkIdx = 0;
    let checkScore = 0;
    let checkAnswered = false;
    let checkFeedback: { good: boolean; text: string } | null = null;
    let checkDone = ctx.isChapterComplete('social');

    // =========================================================================
    // PAGE 1: HAWK–DOVE SHORELINE CONTEST
    // =========================================================================

    function renderPage1Left(): void {
      const essP = hawkDoveEss(p1V, p1C);
      const fit = hawkDoveFitnesses(p1HawkFreq, p1V, p1C);
      const hh = hawkDovePayoff('hawk', 'hawk', p1V, p1C);
      const dd = hawkDovePayoff('dove', 'dove', p1V, p1C);

      scene3d.updateShorelinePopulation(p1HawkFreq);
      captionEl.textContent = 'Tidal Shoreline — hermit crabs contesting spiral shells';
      tagEl.textContent = `Gen ${p1Gen} · ESS p* = ${pct(essP)}`;
      legendEl.innerHTML = `
        <span><i class="hwe-dot soc-dot-hawk"></i>Hawk (raised claws)</span>
        <span><i class="hwe-dot soc-dot-dove"></i>Dove (lowered claws)</span>
      `;

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Shell Value (V) &amp; Injury Cost (C)</span>
            <span class="hwe-stat-badge">V/C = ${p1V}/${p1C} = ${essP.toFixed(2)}</span>
          </div>
          <div class="soc-slider-grid">
            <div class="hwe-slider-row">
              <span class="hwe-kicker">Shell V = ${p1V}</span>
              <input type="range" class="hwe-slider" min="20" max="100" step="10" value="${p1V}" data-p1-v aria-label="Resource value V"/>
            </div>
            <div class="hwe-slider-row">
              <span class="hwe-kicker">Injury C = ${p1C}</span>
              <input type="range" class="hwe-slider" min="40" max="160" step="10" value="${p1C}" data-p1-c aria-label="Injury cost C"/>
            </div>
          </div>

          <table class="soc-payoff-table" aria-label="Hawk Dove payoff matrix">
            <thead>
              <tr><th>Row vs. Col</th><th>vs. Hawk</th><th>vs. Dove</th></tr>
            </thead>
            <tbody>
              <tr>
                <th>Hawk</th>
                <td class="${hh < 0 ? 'soc-payoff-neg' : 'soc-payoff-pos'}">${hh >= 0 ? '+' : ''}${hh.toFixed(0)}</td>
                <td class="soc-payoff-pos">+${p1V}</td>
              </tr>
              <tr>
                <th>Dove</th>
                <td>0</td>
                <td class="soc-payoff-pos">+${dd.toFixed(0)}</td>
              </tr>
            </tbody>
          </table>

          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn" data-duel="HH">Duel H vs H</button>
            <button type="button" class="hwe-action-btn" data-duel="HD">Duel H vs D</button>
            <button type="button" class="hwe-action-btn" data-duel="DD">Duel D vs D</button>
          </div>
        </div>

        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Shoreline Population (Gen ${p1Gen})</span>
            <span class="hwe-stat-badge">W(H)=${fit.wH.toFixed(1)} · W(D)=${fit.wD.toFixed(1)}</span>
          </div>
          <div class="soc-strat-bar">
            <div class="soc-bar-hawk" style="width:${pct(p1HawkFreq)};">${pct(p1HawkFreq)} Hawk</div>
            <div class="soc-bar-dove" style="width:${pct(1 - p1HawkFreq)};">${pct(1 - p1HawkFreq)} Dove</div>
          </div>
          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn primary" data-p1-step>Evolve +6 Generations →</button>
            <button type="button" class="hwe-action-btn" data-p1-reset>Reset (15% Hawk)</button>
          </div>
        </div>

        <div class="hwe-eq-box">
          ESS Hawk share: p* = min(1, V / C) = <strong>${pct(essP)}</strong>
          <div class="hwe-eq-sub">
            ${
              p1V < p1C
                ? `Mean payoff at ESS (+${(fit.wBar - 10).toFixed(1)}) is LOWER than all-Dove (+${dd.toFixed(0)}) — ESS ≠ group optimum!`
                : `When V ≥ C, fighting pays even against Hawks: pure Hawk (100%) is the sole ESS.`
            }
          </div>
        </div>
      `;

      leftPanelEl.querySelector<HTMLInputElement>('[data-p1-v]')?.addEventListener('input', (e) => {
        p1V = Number((e.target as HTMLInputElement).value);
        renderPage1Left();
      });
      leftPanelEl.querySelector<HTMLInputElement>('[data-p1-c]')?.addEventListener('input', (e) => {
        p1C = Number((e.target as HTMLInputElement).value);
        renderPage1Left();
      });
      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-duel]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const d = btn.dataset.duel;
          if (d === 'HH') scene3d.stageShoreContest('hawk', 'hawk');
          else if (d === 'HD') scene3d.stageShoreContest('hawk', 'dove');
          else scene3d.stageShoreContest('dove', 'dove');
        });
      });
      leftPanelEl.querySelector('[data-p1-step]')?.addEventListener('click', () => {
        p1HawkFreq = stepHawkDove(p1HawkFreq, p1V, p1C, 6);
        p1Gen += 6;
        renderPage1Left();
      });
      leftPanelEl.querySelector('[data-p1-reset]')?.addEventListener('click', () => {
        p1HawkFreq = 0.15;
        p1Gen = 0;
        renderPage1Left();
      });
    }

    // =========================================================================
    // PAGE 2: BOURGEOIS OWNERSHIP CONVENTION
    // =========================================================================

    function renderPage2Left(): void {
      const V = 40;
      const C = 100;
      scene3d.updateBourgeoisScene(p2Freqs);
      captionEl.textContent = 'Ownership Shore — Bourgeois crabs respect shell possession';
      tagEl.textContent = `Injuries ${pct(p2Injury)} · Mean +${p2MeanPay.toFixed(1)}`;
      legendEl.innerHTML = `
        <span><i class="hwe-dot soc-dot-hawk"></i>Hawk</span>
        <span><i class="hwe-dot soc-dot-dove"></i>Dove</span>
        <span><i class="hwe-dot soc-dot-bourg"></i>Bourgeois (flag = owner)</span>
      `;

      const hasB = p2Freqs[2] > 0.001;

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">3-Strategy Replicator (V = 40, C = 100)</span>
            <span class="hwe-stat-badge">Gen ${p2Gen}</span>
          </div>
          <div class="soc-strat-bar">
            <div class="soc-bar-hawk" style="width:${pct(p2Freqs[0])};">${p2Freqs[0] > 0.12 ? `H ${pct(p2Freqs[0])}` : ''}</div>
            <div class="soc-bar-dove" style="width:${pct(p2Freqs[1])};">${p2Freqs[1] > 0.12 ? `D ${pct(p2Freqs[1])}` : ''}</div>
            <div class="soc-bar-bourg" style="width:${pct(p2Freqs[2])};">${p2Freqs[2] > 0.12 ? `B ${pct(p2Freqs[2])}` : ''}</div>
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-family:var(--font-mono); font-size:11.5px;">
            <div style="padding:7px 9px; border-radius:6px; background:rgba(184,56,40,0.08);">
              Injury rate: <strong style="color:${p2Injury > 0.05 ? '#b53428' : '#1f6b5e'};">${pct(p2Injury)}</strong>
            </div>
            <div style="padding:7px 9px; border-radius:6px; background:rgba(45,138,126,0.1);">
              Mean payoff: <strong>+${p2MeanPay.toFixed(1)}</strong> <span style="opacity:.65;">(max +20)</span>
            </div>
          </div>

          <div class="hwe-btn-row">
            ${
              !hasB
                ? `<button type="button" class="hwe-action-btn primary" data-intro-b>Introduce 5% Bourgeois →</button>`
                : `<button type="button" class="hwe-action-btn primary" data-step-b>Evolve +10 Generations →</button>`
            }
            <button type="button" class="hwe-action-btn" data-reset-b>Reset to H–D ESS</button>
          </div>
        </div>

        <div class="hwe-eq-box">
          E(B, B) = V / 2 = <strong>+20</strong> (zero fights!) &nbsp;·&nbsp; E(H, B) = (3V − C)/4 = <strong>+5</strong>
          <div class="hwe-eq-sub">Because E(B, B) &gt; E(H, B) and E(B, D) = 3V/4 &gt; V/2, Bourgeois invades and locks out both Hawks and Doves.</div>
        </div>
      `;

      leftPanelEl.querySelector('[data-intro-b]')?.addEventListener('click', () => {
        p2Freqs = [0.38, 0.57, 0.05];
        const res = stepThreeWay(p2Freqs, V, C, 4);
        p2Freqs = res.freqs;
        p2Injury = res.injuryRate;
        p2MeanPay = res.meanPayoff;
        p2Gen += 4;
        renderPage2Left();
      });

      leftPanelEl.querySelector('[data-step-b]')?.addEventListener('click', () => {
        const res = stepThreeWay(p2Freqs, V, C, 10);
        p2Freqs = res.freqs;
        p2Injury = res.injuryRate;
        p2MeanPay = res.meanPayoff;
        p2Gen += 10;
        renderPage2Left();
      });

      leftPanelEl.querySelector('[data-reset-b]')?.addEventListener('click', () => {
        p2Freqs = [0.4, 0.6, 0.0];
        p2Gen = 0;
        p2Injury = 0.16;
        p2MeanPay = 12;
        renderPage2Left();
      });
    }

    // =========================================================================
    // PAGE 3: WAR OF ATTRITION
    // =========================================================================

    function renderPage3Left(): void {
      scene3d.setAttritionDistribution(p3Mode, p3V, p3FixedT);
      captionEl.textContent = 'War of Attrition — continuous display stamina arena';
      tagEl.textContent = p3Mode === 'ess' ? `ESS mean t = ${p3V}` : `Pure fixed t = ${p3FixedT}`;
      legendEl.innerHTML = `
        <span><i class="hwe-dot soc-dot-dove"></i>Rival A (displaying)</span>
        <span><i class="hwe-dot soc-dot-hawk"></i>Rival B (displaying)</span>
      `;

      const residentPay = warOfAttritionPayoff(p3FixedT, p3FixedT, p3V);
      const mutantT = p3FixedT + 0.5;
      const mutantPay = warOfAttritionPayoff(mutantT, p3FixedT, p3V);

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Compare Pure Persistence vs. ESS</span>
            <span class="hwe-stat-badge">Value V = ${p3V}</span>
          </div>
          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn ${p3Mode === 'pure' ? 'primary' : ''}" data-attr-mode="pure">Fixed Time (Pure)</button>
            <button type="button" class="hwe-action-btn ${p3Mode === 'ess' ? 'primary' : ''}" data-attr-mode="ess">Exponential ESS Curve</button>
          </div>

          <div class="soc-slider-grid">
            <div class="hwe-slider-row">
              <span class="hwe-kicker">Prize V = ${p3V}</span>
              <input type="range" class="hwe-slider" min="2" max="8" step="1" value="${p3V}" data-p3-v aria-label="Prize value V"/>
            </div>
            ${
              p3Mode === 'pure'
                ? `<div class="hwe-slider-row">
                     <span class="hwe-kicker">Fixed t = ${p3FixedT}</span>
                     <input type="range" class="hwe-slider" min="1" max="10" step="1" value="${p3FixedT}" data-p3-t aria-label="Fixed persistence time"/>
                   </div>`
                : `<div style="font-family:var(--font-mono); font-size:11px; color:var(--ink-muted); align-self:center;">
                     Mean wait = <strong>${p3V}.0</strong> units
                   </div>`
            }
          </div>
        </div>

        <div class="hwe-eq-box">
          ${
            p3Mode === 'pure'
              ? `Resident (t=${p3FixedT}) earns <strong>${residentPay.toFixed(1)}</strong> · Mutant waiting t+0.5 earns <strong>${mutantPay.toFixed(1)}</strong>!
                 <div class="hwe-eq-sub">Any fixed persistence time can be invaded by waiting slightly longer (if t &lt; V) or quitting immediately at t = 0 (if t &gt; V/2).</div>`
              : `ESS distribution: p(t) = (1 / V)·e^(−t / V) &nbsp;·&nbsp; Mean = <strong>V = ${p3V}</strong>
                 <div class="hwe-eq-sub">Under this exponential curve, every waiting time earns exactly 0 expected net payoff—so no mutant timing can invade!</div>`
          }
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-attr-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p3Mode = btn.dataset.attrMode as 'pure' | 'ess';
          renderPage3Left();
        });
      });
      leftPanelEl.querySelector<HTMLInputElement>('[data-p3-v]')?.addEventListener('input', (e) => {
        p3V = Number((e.target as HTMLInputElement).value);
        renderPage3Left();
      });
      leftPanelEl.querySelector<HTMLInputElement>('[data-p3-t]')?.addEventListener('input', (e) => {
        p3FixedT = Number((e.target as HTMLInputElement).value);
        renderPage3Left();
      });
    }

    // =========================================================================
    // PAGE 4: 3D PEDIGREE & WRIGHT'S RELATEDNESS (r)
    // =========================================================================

    function renderPage4Left(): void {
      const rel = PEDIGREE_RELATIONS[p4Rel];
      scene3d.setPedigreeRelation(p4Rel);
      captionEl.textContent = `3D Family Pedigree — ${rel.label}`;
      tagEl.textContent = `r = ${rel.r}`;
      legendEl.innerHTML = `
        <span><i class="hwe-dot" style="background:#d6534b;"></i>Maternal path</span>
        <span><i class="hwe-dot soc-dot-hawk"></i>Paternal path</span>
        <span><i class="hwe-dot soc-dot-dove"></i>Haploid father (0.50)</span>
      `;

      const order: PedigreeRelationId[] = [
        'parent_offspring',
        'full_sibs',
        'half_sibs',
        'grandparent',
        'first_cousins',
        'haplodiploid_sisters',
        'haplodiploid_brother',
      ];

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Select Relative Pair to Trace in 3D</span>
            <span class="hwe-stat-badge">r = ${rel.r}</span>
          </div>
          <div class="soc-rel-grid">
            ${order
              .map((id) => {
                const item = PEDIGREE_RELATIONS[id];
                return `
                  <button type="button" class="soc-rel-btn ${id === p4Rel ? 'is-active' : ''}" data-rel="${id}">
                    <span>${item.label}</span>
                    <span class="r-chip">${item.r}</span>
                  </button>
                `;
              })
              .join('')}
          </div>
        </div>

        <div class="hwe-eq-box">
          ${rel.formulaText}
          <div class="hwe-eq-sub">${rel.explanation}</div>
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-rel]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p4Rel = btn.dataset.rel as PedigreeRelationId;
          renderPage4Left();
        });
      });
    }

    // =========================================================================
    // PAGE 5: HAMILTON'S RULE (rB > C) — SIERRA ALARM MEADOW
    // =========================================================================

    function renderPage5Left(): void {
      const r = p5Clustered ? 0.45 : 0.06;
      const rB = r * p5B;
      const spreads = rB > p5C;
      const series = simulateHamiltonTrajectory(0.25, r, p5B, p5C, 24);
      const endP = series[series.length - 1].pCaller;

      scene3d.updateHamiltonMeadow(endP, p5Clustered);
      captionEl.textContent = p5Clustered
        ? 'Sierra Meadow — kin-clustered burrows (high r)'
        : 'Sierra Meadow — randomly dispersed burrows (low r)';
      tagEl.textContent = `rB = ${rB.toFixed(2)} ${spreads ? '>' : '≤'} C = ${p5C.toFixed(2)}`;
      legendEl.innerHTML = `
        <span><i class="hwe-dot soc-dot-hawk"></i>Caller allele (alarm whistle)</span>
        <span><i class="hwe-dot soc-dot-dove"></i>Silent allele</span>
      `;

      const pts = series
        .map((d, i) => {
          const x = 24 + (i / 24) * 255;
          const y = 84 - d.pCaller * 72;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');

      leftPanelEl.innerHTML = `
        <div class="hwe-card">
          <div class="hwe-card-head">
            <span class="hwe-kicker">Meadow Structure &amp; Parameters</span>
            <span class="soc-hamilton-badge ${spreads ? 'spread' : 'lost'}">
              ${spreads ? 'rB > C · Spreads ✓' : 'rB ≤ C · Lost ✕'}
            </span>
          </div>
          <div class="hwe-btn-row">
            <button type="button" class="hwe-action-btn ${p5Clustered ? 'is-on' : ''}" data-kin="1">Kin Clusters (r ≈ 0.45)</button>
            <button type="button" class="hwe-action-btn ${!p5Clustered ? 'is-on' : ''}" data-kin="0">Dispersed (r ≈ 0.06)</button>
            <button type="button" class="hwe-action-btn primary" data-hawk-strike>Hawk Strike! ✦</button>
          </div>
          <div class="soc-slider-grid">
            <div class="hwe-slider-row">
              <span class="hwe-kicker">Kin Benefit B = ${p5B.toFixed(2)}</span>
              <input type="range" class="hwe-slider" min="0.2" max="1.6" step="0.1" value="${p5B}" data-p5-b aria-label="Kin benefit B"/>
            </div>
            <div class="hwe-slider-row">
              <span class="hwe-kicker">Caller Cost C = ${p5C.toFixed(2)}</span>
              <input type="range" class="hwe-slider" min="0.05" max="0.50" step="0.05" value="${p5C}" data-p5-c aria-label="Caller cost C"/>
            </div>
          </div>

          <svg class="hwe-svg-plot" style="height:92px;" viewBox="0 0 290 94" aria-label="Caller allele frequency trajectory">
            <line x1="24" y1="10" x2="24" y2="84" stroke="#8c7e6e" stroke-width="1"/>
            <line x1="24" y1="84" x2="280" y2="84" stroke="#8c7e6e" stroke-width="1"/>
            <polyline fill="none" stroke="${spreads ? '#2a8a7b' : '#b53428'}" stroke-width="2.5" points="${pts}"/>
            <text x="28" y="20" font-family="IBM Plex Mono" font-size="9.5" fill="${spreads ? '#1f6b5e' : '#8f2419'}">
              Caller allele: 25% → ${pct(endP)} over 24 gens
            </text>
            <text x="24" y="93" font-family="IBM Plex Mono" font-size="8.5" fill="#685b4e">Gen 0</text>
            <text x="280" y="93" text-anchor="end" font-family="IBM Plex Mono" font-size="8.5" fill="#685b4e">Gen 24</text>
          </svg>
        </div>

        <div class="hwe-eq-box">
          r · B − C = (${r.toFixed(2)})(${p5B.toFixed(2)}) − ${p5C.toFixed(2)} = <strong>${(rB - p5C >= 0 ? '+' : '') + (rB - p5C).toFixed(2)}</strong>
          <div class="hwe-eq-sub">Philopatric female ground squirrels live beside close kin (high r), explaining why females call far more often than dispersing males (Sherman 1977).</div>
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-kin]').forEach((btn) => {
        btn.addEventListener('click', () => {
          p5Clustered = btn.dataset.kin === '1';
          renderPage5Left();
        });
      });
      leftPanelEl.querySelector('[data-hawk-strike]')?.addEventListener('click', () => {
        scene3d.triggerHawkStrike();
      });
      leftPanelEl.querySelector<HTMLInputElement>('[data-p5-b]')?.addEventListener('input', (e) => {
        p5B = parseFloat((e.target as HTMLInputElement).value);
        renderPage5Left();
      });
      leftPanelEl.querySelector<HTMLInputElement>('[data-p5-c]')?.addEventListener('input', (e) => {
        p5C = parseFloat((e.target as HTMLInputElement).value);
        renderPage5Left();
      });
    }

    // =========================================================================
    // PAGE 6: CHECK
    // =========================================================================

    function renderPage6Left(): void {
      scene3d.setCheckSpecimen(checkIdx);
      captionEl.textContent = `Social Evolution Check — Case ${checkIdx + 1} of ${SOCIAL_CHECKS.length}`;
      tagEl.textContent = `Score ${checkScore}/${SOCIAL_CHECKS.length}`;

      if (checkDone) {
        leftPanelEl.innerHTML = `
          <div class="check-card" style="border-left:4px solid #2d8a7e;">
            <div class="check-progress">
              <span>PLATE 2 COMPLETE</span>
              <span>✓ STAMPED IN ATLAS</span>
            </div>
            <h3 class="check-question">Conflict &amp; Kinship mastered!</h3>
            <p style="margin:0; font-size:14px; color:var(--ink-body);">
              You derived the mixed ESS <strong>p* = V/C</strong>, saw Bourgeois ownership conventions eliminate injuries, traced Wright’s relatedness in 3D, and tested Hamilton’s rule (<strong>rB &gt; C</strong>).
            </p>
            <div class="hwe-btn-row">
              <button type="button" class="hwe-action-btn" data-redo-soc>Retake Check</button>
              <button type="button" class="hwe-action-btn primary" data-back-shore>Back to Shoreline</button>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('[data-redo-soc]')?.addEventListener('click', () => {
          checkIdx = 0;
          checkScore = 0;
          checkAnswered = false;
          checkFeedback = null;
          checkDone = false;
          renderPage6Left();
        });
        leftPanelEl.querySelector('[data-back-shore]')?.addEventListener('click', () => {
          ctx.goToStep(0);
        });
        return;
      }

      const q = SOCIAL_CHECKS[checkIdx];
      leftPanelEl.innerHTML = `
        <div class="check-card">
          <div class="check-progress">
            <span>CASE ${checkIdx + 1} OF ${SOCIAL_CHECKS.length}</span>
            <span>SCORE ${checkScore}/${SOCIAL_CHECKS.length}</span>
          </div>
          <h3 class="check-question">${q.prompt}</h3>
          <div class="check-options">
            ${q.options
              .map(
                (o) => `
                  <button
                    type="button"
                    class="check-opt-btn ${checkAnswered && o.correct ? 'is-correct' : ''}"
                    data-soc-opt="${o.id}"
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
                   <button type="button" class="btn-step-next" data-soc-next>
                     ${checkIdx + 1 < SOCIAL_CHECKS.length ? 'Next Case →' : 'Stamp Plate Complete ✓'}
                   </button>
                 </div>`
              : ''
          }
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-soc-opt]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (checkAnswered) return;
          const opt = q.options.find((o) => o.id === btn.dataset.socOpt);
          if (!opt) return;
          checkAnswered = true;
          if (opt.correct) checkScore += 1;
          else btn.classList.add('is-wrong');
          checkFeedback = { good: opt.correct, text: q.explanation };
          renderPage6Left();
        });
      });

      leftPanelEl.querySelector('[data-soc-next]')?.addEventListener('click', () => {
        if (checkIdx + 1 < SOCIAL_CHECKS.length) {
          checkIdx += 1;
          checkAnswered = false;
          checkFeedback = null;
          renderPage6Left();
        } else {
          checkDone = true;
          ctx.completeChapter('social', checkScore, SOCIAL_CHECKS.length);
          renderPage6Left();
        }
      });
    }

    // =========================================================================
    // STEP LIFECYCLE
    // =========================================================================

    const onStepChange = (stepIndex: number) => {
      const pageId = PAGE_IDS[stepIndex] ?? 'shore';
      scene3d.setPage(pageId);

      if (stepIndex === 0) renderPage1Left();
      else if (stepIndex === 1) renderPage2Left();
      else if (stepIndex === 2) renderPage3Left();
      else if (stepIndex === 3) renderPage4Left();
      else if (stepIndex === 4) renderPage5Left();
      else renderPage6Left();
    };

    return {
      onStepChange,
      onResize: () => scene3d.resize(),
      destroy: () => scene3d.destroy(),
    };
  },
};
