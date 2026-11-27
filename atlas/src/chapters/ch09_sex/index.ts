// =============================================================================
// Chapter 9: Why Sex? & Red Queen — Twofold Cost, Muller's Ratchet,
// Lively Mud Snails & Trematodes, Mutualism Sanctions & Virulence Trade-Off
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  computeMullersRatchet,
  computeMutualismStability,
  computeTwofoldCost,
  computeVirulenceTradeoff,
  simulateRedQueen,
} from './sexMath';
import { SexScene3D, type SexPageId } from './SexScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'sex')!;

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
    id: 'sx1-redqueen',
    prompt:
      'In New Zealand lakes, sexual mud snails (Potamopyrgus antipodarum) pay a twofold cost of males compared to parthenogenetic clones. Yet sexual snails are MOST abundant in shallow lakes teeming with Microphallus trematode parasites (Lively 1987). Why?',
    options: [
      { id: 'a', label: 'Fast-evolving parasites adapt specifically to the most common clonal genotype, driving negative frequency-dependent crashes of clones while sexual recombination generates rare resistant offspring.', correct: true },
      { id: 'b', label: 'Sexual snails decide to switch to sexual reproduction only after seeing a parasite.', correct: false },
      { id: 'c', label: 'Trematodes cannot infect asexual snails.', correct: false },
    ],
    explanation:
      'Correct! Under the Red Queen hypothesis, parasites track whichever host genotype is common. Asexual clones get hammered once common, whereas sexual recombination continually generates rare genotypes that evade matching parasites (Lively 1987; Morran et al. 2011).',
  },
  {
    id: 'sx2-ratchet',
    prompt:
      'In a small strictly asexual population (N_e = 40), the mutation-free class (k = 0 deleterious mutations) is lost by random genetic drift. Why is this called Muller’s Ratchet?',
    options: [
      { id: 'a', label: 'Because without recombination (and ignoring rare back-mutation), the population cannot regenerate k = 0 genomes from parents carrying mutations at different loci—so mutational load clicks irreversibly upward.', correct: true },
      { id: 'b', label: 'Because asexual organisms have zero mutation rate.', correct: false },
      { id: 'c', label: 'Because sexual species lose k = 0 faster than asexuals.', correct: false },
    ],
    explanation:
      'Correct! Recombination allows two parents with deleterious mutations at different sites (A*B × AB*) to produce a clean AB recombinant offspring, reversing the ratchet—something strictly asexual lineages cannot do.',
  },
  {
    id: 'sx3-virulence',
    prompt:
      'Older textbooks claimed all pathogens inevitably evolve to become harmless so they won’t kill their hosts. Why does modern evolutionary medicine reject this?',
    options: [
      { id: 'a', label: 'Selection favors whichever pathogen strain maximizes R₀ = β(α)/(μ + α + γ); when higher replication raises transmission β(α) (or wins within-host coinfection), intermediate or high virulence beats benign strains!', correct: true },
      { id: 'b', label: 'Pathogens intentionally plan to keep their hosts alive for future generations.', correct: false },
      { id: 'c', label: 'Transmission rate is always completely unrelated to pathogen replication rate.', correct: false },
    ],
    explanation:
      'Correct! Pathogens have no foresight. Between-host competition maximizes R₀ at an intermediate (or high, e.g. vector-borne or waterborne) virulence optimum α*, and within-host coinfection often pushes virulence even higher (Anderson & May 1982).',
  },
];

const PAGE_IDS: SexPageId[] = ['twofold', 'ratchet', 'redqueen', 'mutualism', 'virulence', 'check'];

export const CH09_SEX: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'twofold',
      shortLabel: '1 2× Cost',
      eyebrow: 'MAYNARD SMITH (1978) · PARADOX OF SEX',
      heading: 'The twofold cost of males',
      bodyHtml: `If an asexual female produces two reproducing daughters while a sexual female produces one daughter and one son, an invading clone doubles its share every generation! Step generations to witness the ${gloss('twofold_cost', 'twofold cost of males')}—the central puzzle of evolutionary biology.`,
      promptHint: 'Step generations 0 → 6 to watch a 10% clonal invader overtake sexual snails.',
    },
    {
      id: 'ratchet',
      shortLabel: '2 Ratchet',
      eyebrow: 'MULLER (1964) · DELETERIOUS MUTATION LOAD',
      heading: 'Muller’s ratchet in small genomes',
      bodyHtml: `In finite asexual populations, random drift can extinguish the healthiest (<em>k = 0</em>) genome class. Without recombination, ${gloss('mullers_ratchet', 'Muller’s ratchet')} clicks irreversibly upward—whereas sexual crossing over regenerates clean <em>k = 0</em> chromosomes!`,
      promptHint: 'Toggle Asexual vs. Sexual and shrink population size to watch k = 0 vanish.',
    },
    {
      id: 'redqueen',
      shortLabel: '3 Red Queen',
      eyebrow: 'LIVELY (1987) · LAKE ALEXANDRINA MUD SNAILS',
      heading: 'Running just to stay in place',
      bodyHtml: `In New Zealand lakes, fast-evolving <em>Microphallus</em> trematodes lock onto whichever snail clone becomes common. Under the ${gloss('red_queen', 'Red Queen hypothesis')}, sexual recombination constantly shuffles resistance genotypes—defeating the 2× cost of males!`,
      promptHint: 'Raise parasite pressure and step seasons to watch clones crash while sexual snails endure.',
    },
    {
      id: 'mutualism',
      shortLabel: '4 Mutualism',
      eyebrow: 'PARTNER CHOICE & SANCTIONS · CLEANER WRASSE',
      heading: 'Keeping mutualisms cheat-proof',
      bodyHtml: `Mutualisms are not cosy altruism—they are reciprocally exploitative markets vulnerable to cheaters (like cleaner fish biting client mucus instead of parasites). Adjust ${gloss('partner_sanctions', 'client sanctions & partner choice')} to see what stabilizes honest cleaning!`,
      promptHint: 'Slide client sanctions down to watch mucus-biting cheaters invade.',
    },
    {
      id: 'virulence',
      shortLabel: '5 Virulence',
      eyebrow: 'ANDERSON & MAY (1982) · STRAIN COMPETITION',
      heading: 'The virulence–transmission trade-off',
      bodyHtml: `Pathogens do not "try" to spare their hosts—evolution maximizes ${gloss('virulence_tradeoff', 'R₀ = β(α) / (μ + α + γ)')} via blind competition among strains. Too mild transmits poorly; too lethal kills hosts before spreading; intermediate (or higher under coinfection!) virulence wins.`,
      promptHint: 'Slide virulence α along the 3D R₀ ridge to locate the non-teleological strain optimum.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'COEVOLUTION & SEX MASTERY',
      heading: 'Paradoxes of sex & conflict',
      bodyHtml: `Synthesize Red Queen host–parasite cycles, Muller’s ratchet, and evolutionary virulence trade-offs across three undergraduate diagnostic scenarios.`,
      promptHint: 'Complete all three cases to stamp Plate 9.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Evolutionary Ecology & Host–Parasite Coevolution)',
    learningObjectives: [
      'Quantify Maynard Smith’s twofold demographic cost of males in anisogamous sexual populations.',
      'Explain why small asexual genomes suffer irreversible deleterious accumulation (Muller’s ratchet).',
      'Demonstrate how fast-evolving parasites create Red Queen dynamics that rescue sexual lineages (Lively 1987).',
      'Identify partner choice and sanctions as mechanisms stabilizing mutualisms against cheaters.',
      'Derive optimal pathogen virulence from the R₀ = β(α)/(μ + α + γ) trade-off without teleology.',
    ],
    commonMisconceptions: [
      {
        misconception: 'All parasites evolve toward harmlessness over time so they do not kill their hosts.',
        correction:
          'Group-level prudence does not evolve. Between-host selection maximizes R₀ (often at intermediate or high virulence), and within-host coinfection selects for even faster, more virulent strains.',
      },
      {
        misconception: 'Mutualism means both species evolved to selflessly help each other.',
        correction:
          'Mutualisms are maintained by individual self-interest, partner fidelity, and active sanctions against cheaters (e.g. reef clients chasing or abandoning biting cleaner wrasses).',
      },
    ],
    discussionPrompts: [
      'Why do vector-borne pathogens (malaria, dengue) and waterborne pathogens (cholera) often evolve much higher virulence than directly transmitted respiratory pathogens?',
      'How do bdelloid rotifers survive tens of millions of years without conventional sex—what horizontal gene transfer & desiccation mechanisms offset Muller’s ratchet?',
    ],
    activityTip:
      'On Page 3, ask students to find the minimum parasite intensity at which sexual mud snails remain above 40% after 12 seasons.',
  },
  scienceCard: {
    coreTakeaway:
      'Sex overcomes its twofold demographic cost by purging deleterious mutations (halting Muller’s ratchet) and generating rare recombinant genotypes that outrun fast-evolving parasites (Red Queen); meanwhile, mutualisms require sanctions against cheaters and pathogens evolve virulence that maximizes R₀ rather than host survival.',
    assumptions: [
      {
        label: 'Lake Alexandrina Mud Snail Clines',
        status: 'realistic',
        tag: 'Lively 1987',
        detail: 'Field surveys across New Zealand lakes show sexual snail frequency strongly correlates with Microphallus trematode infection rates.',
      },
      {
        label: 'Cleaner Wrasse Partner Sanctions',
        status: 'realistic',
        tag: 'Bshary & Grutter 2002',
        detail: 'Reef fish clients punish cheating cleaners by chasing them or switching stations, enforcing honest ectoparasite removal.',
      },
      {
        label: 'Virulence–Transmission R₀ Model',
        status: 'simplified',
        tag: 'Anderson & May 1982',
        detail: 'Single-infection saturating β(α) yields a clean intermediate optimum; within-host coinfection shifts α* higher.',
      },
    ],
    citations: [
      {
        authors: 'Lively, C. M.',
        year: 1987,
        title: 'Evidence from a New Zealand snail for the maintenance of sex by parasitism',
        journal: 'Nature 328:519–521',
      },
      {
        authors: 'Bshary, R. & Grutter, A. S.',
        year: 2002,
        title: 'Asymmetric cheating opportunities and partner control in a cleaner fish mutualism',
        journal: 'Animal Behaviour 63:547–555',
      },
      {
        authors: 'Anderson, R. M. & May, R. M.',
        year: 1982,
        title: 'Coevolution of hosts and parasites',
        journal: 'Parasitology 85:411–426',
      },
    ],
    standards: {
      undergrad: [
        'Evolution of Sex: Twofold Cost, Muller’s Ratchet & Red Queen Hypothesis',
        'Coevolution of Mutualisms & Evolutionary Medicine (Virulence Trade-Off)',
      ],
      apOrALevel: ['AP Bio 7.11 / Undergrad Coevolution & Host–Parasite Dynamics'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="sx-caption">Plate IX · The Twofold Cost of Males</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="sx-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="sx-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="sx-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="sx-canvas-host"></div>
      <div class="hwe-plate-legend" id="sx-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D coevolutionary specimens</div>
    `;

    const canvasHost = plateStageEl.querySelector('#sx-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#sx-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#sx-legend') as HTMLElement;

    const scene = new SexScene3D(canvasHost);
    (plateStageEl.querySelector('#sx-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#sx-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#sx-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let tfGen = 3;
    let ratchMode: 'asexual' | 'sexual' = 'asexual';
    let ratchGen = 12;
    let ratchN = 35;
    let rqSeason = 8;
    let rqParasite = 0.72;
    let mutSanctions = 0.78;
    let virAlpha = 0.4;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'twofold';
      scene.setPage(pageId);

      if (pageId === 'twofold') {
        const res = computeTwofoldCost(tfGen);
        scene.updateTwofold(res);
        captionEl.textContent = 'Plate IX.1 · Twofold Cost of Males (10% Clonal Invader)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f658e"></i>Sexual Snails (50% ♂)</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Asexual Clones (100% ♀)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Generations Since Clonal Mutant Appeared</div>
              <label style="display:block;font-size:0.84rem;">
                Generation t = <strong>${tfGen}</strong>
                <input type="range" id="sx-tf" min="0" max="8" step="1" value="${tfGen}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge" style="color:#a83424;">Clones: ${(res.asexualFreq * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge" style="color:#24587c;">Sexuals: ${(res.sexualFreq * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Maynard Smith (1978):</strong> All else equal, an asexual female passes 100% of her genome to 2 daughters, doubling relative share every generation unless sex brings a huge ecological or genetic advantage!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#sx-tf')?.addEventListener('input', (e) => {
          tfGen = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'ratchet') {
        const res = computeMullersRatchet(ratchMode, ratchGen, ratchN);
        scene.updateRatchet(res);
        captionEl.textContent = 'Plate IX.2 · Muller’s Ratchet (Mutation-Load Classes k = 0..5+)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Clean k=0 Genomes</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Heavy Deleterious Load</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Reproductive Mode</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${ratchMode === 'asexual' ? 'active' : ''}" data-rm="asexual">Asexual (No Recomb)</button>
                <button class="lic-pill-btn ${ratchMode === 'sexual' ? 'active' : ''}" data-rm="sexual">Sexual (Recombining)</button>
              </div>
              <label style="display:block;margin-top:8px;font-size:0.84rem;">
                Generations = <strong>${ratchGen}</strong>
                <input type="range" id="sx-rg" min="0" max="20" step="1" value="${ratchGen}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Population Size N_e = <strong>${ratchN}</strong>
                <input type="range" id="sx-rn" min="15" max="120" step="5" value="${ratchN}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Ratchet Clicks: ${res.clicks}</span>
                <span class="hwe-stat-badge">Mean Load: ${res.meanMutations.toFixed(1)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Irreversible Click:</strong> Ghost rings show extinct mutation classes. Only sexual crossing over can recombine clean halves from two mutated parents to regenerate <em>k = 0</em>!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-rm]').forEach((b) =>
          b.addEventListener('click', () => {
            ratchMode = (b as HTMLElement).dataset.rm as 'asexual' | 'sexual';
            renderPage();
          })
        );
        leftPanelEl.querySelector('#sx-rg')?.addEventListener('input', (e) => {
          ratchGen = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#sx-rn')?.addEventListener('input', (e) => {
          ratchN = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'redqueen') {
        const res = simulateRedQueen(rqSeason, rqParasite);
        scene.updateRedQueen(res);
        captionEl.textContent = 'Plate IX.3 · Lake Alexandrina Mud Snails & Trematodes';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Sexual Snails</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Clone A / Match Worms</span>
          <span><i class="hwe-dot" style="background:#d69a2d"></i>Clone B / Match Worms</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Microphallus Trematode Coevolution</div>
              <label style="display:block;font-size:0.84rem;">
                Parasite Intensity = <strong>${(rqParasite * 100).toFixed(0)}%</strong>
                <input type="range" id="sx-rqp" min="0" max="1" step="0.05" value="${rqParasite}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Coevolution Season = <strong>${rqSeason}</strong>
                <input type="range" id="sx-rqs" min="0" max="20" step="1" value="${rqSeason}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge" style="color:#2f7d6e;">Sexual: ${(res.sexualFreq * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Clone A: ${(res.cloneAFreq * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Clone B: ${(res.cloneBFreq * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Lively (1987):</strong> Parasites lock onto whichever clone is common—driving Red Queen oscillations where recombinant sexual snails outlast clonal crashes!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#sx-rqp')?.addEventListener('input', (e) => {
          rqParasite = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#sx-rqs')?.addEventListener('input', (e) => {
          rqSeason = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'mutualism') {
        const res = computeMutualismStability(mutSanctions);
        scene.updateMutualism(res);
        captionEl.textContent = 'Plate IX.4 · Cleaner Wrasse Mutualism & Partner Sanctions';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#9aa392"></i>Honest Cleaner</span>
          <span><i class="hwe-dot" style="background:#f05a1e"></i>Mucus-Biting Cheater</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Client Reef Fish Sanctions</div>
              <label style="display:block;font-size:0.84rem;">
                Punishment / Switching Rate = <strong>${(mutSanctions * 100).toFixed(0)}%</strong>
                <input type="range" id="sx-ms" min="0" max="1" step="0.05" value="${mutSanctions}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Honest: ${(res.honestCleanerFreq * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Cheaters: ${(res.cheaterMucusBiterFreq * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Reciprocal Exploitation:</strong> Cleaners prefer tasty client mucus over ectoparasites. Only active client sanctions (chasing cheaters &amp; switching stations) keep the mutualism stable!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#sx-ms')?.addEventListener('input', (e) => {
          mutSanctions = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'virulence') {
        const res = computeVirulenceTradeoff(virAlpha);
        scene.updateVirulence(res);
        captionEl.textContent = 'Plate IX.5 · Pathogen Virulence–Transmission R₀ Ridge';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c4483a"></i>Focal Strain α</span>
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>R₀ Peak Region</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Pathogen Strain Virulence (α)</div>
              <label style="display:block;font-size:0.84rem;">
                Host Mortality Rate α = <strong>${virAlpha.toFixed(2)}</strong>
                <input type="range" id="sx-va" min="0.10" max="1.55" step="0.05" value="${virAlpha}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">β(α) = ${res.transmissionBeta.toFixed(2)}</span>
                <span class="hwe-stat-badge">R₀ = ${res.r0.toFixed(2)}</span>
                <span class="hwe-stat-badge">α* = ${res.optimalAlpha.toFixed(2)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>No Pathogen Foresight:</strong> Blind strain competition maximizes <strong>R₀ = β(α)/(μ + α + γ)</strong>. Strains replicate aggressively enough to transmit rapidly—stopping only where killing the host cuts total onward infections.</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#sx-va')?.addEventListener('input', (e) => {
          virAlpha = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate IX.6 · Sex, Parasites & Coevolution Diagnostic';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Mud Snail</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Trematode</span>
          <span><i class="hwe-dot" style="background:#d69a2d"></i>Pathogen R₀</span>
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
          ctx.completeChapter('sex', correctCount, CHECK_CASES.length);
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
                      ? `<div class="check-feedback ${opt.correct ? 'ok' : 'bad'}">${opt.correct ? c.explanation : 'Re-check the coevolutionary mechanism on the preceding 3D plate and try again.'}</div>`
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
