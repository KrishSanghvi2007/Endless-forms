// =============================================================================
// Chapter 6: Left Jaw, Right Jaw — Negative Frequency-Dependent Selection,
// Partial Heritability, Side-Blotched Lizard RPS & Trans-Species MHC Balancing
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  createInitialLizardRps,
  createInitialTanganyika,
  getBalancingTreeMetrics,
  simulateHeritabilityComparison,
  stepLizardRps,
  stepTanganyikaSeason,
} from './jawsMath';
import { JawsScene3D, type JawsPageId } from './JawsScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'jaws')!;

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
    id: 'jw1-nfds',
    prompt:
      'In Lake Tanganyika, Left-bent Perissodus microlepis currently make up 72% of scale-eaters, so prey fish vigilantly guard their right flanks. What happens next?',
    options: [
      { id: 'a', label: 'Left-bent predators wipe out Right-bent predators because 72% is already a majority.', correct: false },
      { id: 'b', label: 'The rarer Right-bent morph has the feeding edge on unguarded left flanks, pulling the ratio back across 50:50 so BOTH morphs persist.', correct: true },
      { id: 'c', label: 'Left-bent fish twist their jaws the other way overnight to match the unguarded flank.', correct: false },
    ],
    explanation:
      'Correct! Under negative frequency-dependent selection, the rarer morph has higher fitness—neither morph “wins” permanently; instead, both persist in an oscillation around 50:50 (Hori 1993).',
  },
  {
    id: 'jw2-rps',
    prompt:
      'In California side-blotched lizards (Uta stansburiana), Orange usurps Blue, Blue guards against Yellow, and Yellow sneaks into Orange’s large territories. Why does no single morph sweep to 100%?',
    options: [
      { id: 'a', label: 'Because fitness dominance is intransitive (Rock–Paper–Scissors): whichever morph becomes common creates the exact ecological opening for its nemesis to surge.', correct: true },
      { id: 'b', label: 'Because all three throat colours are selectively neutral.', correct: false },
      { id: 'c', label: 'Because females mate exclusively with Orange males.', correct: false },
    ],
    explanation:
      'Correct! Intransitive dominance (O > B > Y > O; Sinervo & Lively 1996) drives perpetual 3-morph evolutionary cycling with no single stable pure strategy.',
  },
  {
    id: 'jw3-mhc',
    prompt:
      'When you build a gene tree of human and chimpanzee MHC immune alleles, several human alleles cluster more closely with chimpanzee alleles than with other human alleles, and Tajima’s D = +2.3. What process explains this?',
    options: [
      { id: 'a', label: 'A recent hard selective sweep in humans.', correct: false },
      { id: 'b', label: 'Long-term balancing selection maintaining ancient polymorphic alleles across the ~6 Ma speciation split (trans-species polymorphism).', correct: true },
      { id: 'c', label: 'Severe neutral genetic drift in tiny populations.', correct: false },
    ],
    explanation:
      'Correct! Long-term balancing selection (rare-allele immune advantage & heterozygote advantage at MHC) prevents ancient alleles from fixing for tens of millions of years, leaving deep trans-species branches and Tajima’s D ≫ 0.',
  },
];

const PAGE_IDS: JawsPageId[] = ['ambush', 'oscillation', 'heritability', 'lizards', 'mhc', 'check'];

export const CH06_JAWS: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'ambush',
      shortLabel: '1 Ambush',
      eyebrow: 'LAKE TANGANYIKA · HORI (1993)',
      heading: 'Guard the prey’s flanks',
      bodyHtml: `The Lake Tanganyika scale-eating cichlid <em>Perissodus microlepis</em> ambushes prey from behind with a visibly bent jaw: Left-bent mouths strike a prey’s right flank, Right-bent mouths strike the left. Slide the golden guard plate to experience ${gloss('nfds', 'negative frequency-dependent selection')}.`,
      promptHint: 'Guard Left vs. Right flank and stage live 3D scale-eater ambushes.',
    },
    {
      id: 'oscillation',
      shortLabel: '2 Cycle',
      eyebrow: 'VIGILANCE LAG · BALANCING POLYMORPHISM',
      heading: 'The 5-year Tanganyika oscillation',
      bodyHtml: `Because prey vigilance lags behind predator ratios, whichever jaw morph is common faces guarded flanks while the rarer morph feeds freely. Step seasons to watch the school oscillate around 50:50—under ${gloss('balancing_selection', 'balancing selection')}, neither morph takes over.`,
      promptHint: 'Step seasons to trace the classic Hori (1993) 5-year oscillation around 50:50.',
    },
    {
      id: 'heritability',
      shortLabel: '3 Partial h²',
      eyebrow: 'GENES & EXPERIENCE · TAKEUCHI ET AL. (2012)',
      heading: 'What partial heritability changes',
      bodyHtml: `Early textbooks treated <em>Perissodus</em> jaw twist as a simple Mendelian trait (<strong>h² ≈ 0.90</strong>). Newer morphometrics show partial heritability (<strong>h² ≈ 0.25</strong>) plus feeding plasticity! Compare how heritability shapes cycle amplitude.`,
      promptHint: 'Toggle High h² (0.90) vs. Empirical Partial h² (0.25) to compare oscillation swings.',
    },
    {
      id: 'lizards',
      shortLabel: '4 RPS Lizards',
      eyebrow: 'INTRANSITIVE GAMES · SINERVO & LIVELY (1996)',
      heading: 'Rock–Paper–Scissors in the wild',
      bodyHtml: `On California sage hillsides, male side-blotched lizards (<em>Uta stansburiana</em>) play literal ${gloss('rock_paper_scissors', 'Rock–Paper–Scissors')}: <strong>Orange</strong> usurps <strong>Blue</strong>, <strong>Blue</strong> guards against <strong>Yellow</strong>, and <strong>Yellow</strong> sneaks past <strong>Orange</strong>.`,
      promptHint: 'Evolve generations to watch the 3 sculpted lizards grow, shrink, and orbit the brass ring!',
    },
    {
      id: 'mhc',
      shortLabel: '5 MHC Trees',
      eyebrow: 'GENOMIC FOOTPRINT · TRANS-SPECIES POLYMORPHISM',
      heading: 'Ancient alleles that outlive species',
      bodyHtml: `How do genomicists spot long-term balancing selection in DNA? Compare a neutral locus against vertebrate immune genes (<strong>MHC</strong>), where ${gloss('trans_species_polymorphism', 'trans-species polymorphism')} preserves ancient alleles across the human–chimp split (~6 Ma) with <strong>Tajima’s D ≫ 0</strong>.`,
      promptHint: 'Switch between Neutral Locus and MHC Balancing Selection across the 6 Ma speciation plane.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'BALANCING SELECTION MASTERY',
      heading: 'Why polymorphism endures',
      bodyHtml: `Unite ecological vigilance lags, intransitive 3-morph lizard orbits, and trans-species genomic trees across three undergraduate diagnostic scenarios.`,
      promptHint: 'Complete all three challenges to stamp Plate 6 in your Atlas progress map.',
    },
  ],

  teacherGuide: {
    estimatedMinutes: 25,
    level: 'Undergraduate Biology (Years 1–3) · Evolutionary Ecology & Population Genomics',
    learningObjectives: [
      'Explain why negative frequency-dependent selection (NFDS) gives the rarer morph an advantage so both forms persist rather than one “winning”.',
      'Show how a 1-season vigilance lag generates damped or sustained oscillations around 50:50 (Hori 1993).',
      'Contrast Mendelian (h² ≈ 0.90) vs. empirical partial heritability (h² ≈ 0.25; Takeuchi et al. 2012) in Perissodus microlepis jaw asymmetry.',
      'Analyze intransitive Rock–Paper–Scissors dynamics in California side-blotched lizards (Uta stansburiana; Sinervo & Lively 1996).',
      'Recognize trans-species polymorphism and positive Tajima’s D (> 0) as genomic hallmarks of long-term balancing selection at MHC and plant self-incompatibility loci.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Under frequency dependence, the rare type eventually “wins” and replaces the common type.',
        correction: 'The rare type only has the edge WHILE rare; as it rises past 50%, it becomes the common guarded target, preserving both morphs.',
      },
      {
        misconception: 'Perissodus jaw bend is 100% determined by a single Mendelian gene.',
        correction: 'Later breeding & developmental studies (Stewart & Albertson 2010; Takeuchi et al. 2012) revealed continuous jaw asymmetry with modest heritability (h² ≈ 0.20–0.30) plus lateralized feeding plasticity.',
      },
      {
        misconception: 'Every human allele is always more closely related to every other human allele than to any chimpanzee allele.',
        correction: 'Under long-term balancing selection (MHC), ancient allelic lineages have persisted for >20 Myr—older than the ~6 Ma human–chimp split!',
      },
    ],
    discussionPrompts: [
      'Why do real Perissodus cycles take ~5 years in Lake Tanganyika rather than flipping every single season?',
      'What happens to the side-blotched lizard cycle if a drought wipes out all Yellow sneakers on an island?',
      'Why does Tajima’s D turn strongly POSITIVE (+2.3) under long-term balancing selection, opposite to a selective sweep (−1.8)?',
    ],
    activityTip:
      'Orbit Page 1 and Page 3 closely in 3D so students can inspect the visibly twisted scale-scraping jaws of Perissodus microlepis from above!',
  },

  scienceCard: {
    coreTakeaway:
      'Balancing selection actively maintains genetic diversity—whether through rare-morph foraging advantage (Perissodus), intransitive 3-way cycles (Uta), or ancient pathogen-driven MHC polymorphisms that outlast speciation events.',
    assumptions: [
      {
        label: '1-season vigilance lag in Perissodus NFDS',
        status: 'simplified',
        tag: 'Hori 1993',
        detail: 'Real Tanganyika scale-eaters have overlapping generations stretching cycles to ~5 years; discrete seasons illustrate the core lag-overshoot mechanism clearly.',
      },
      {
        label: 'Empirical partial heritability (h² ≈ 0.25)',
        status: 'realistic',
        tag: 'Takeuchi 2012',
        detail: 'Page 3 explicitly contrasts Hori’s original simple-Mendelian hypothesis against newer partial-heritability + developmental plasticity findings.',
      },
      {
        label: 'Intransitive RPS replicator matrix',
        status: 'realistic',
        tag: 'Sinervo & Lively 1996',
        detail: 'Page 4 models Orange > Blue > Yellow > Orange fitnesses with a tiny mutation floor preventing numerical absorption.',
      },
    ],
    citations: [
      { authors: 'Hori, M.', year: 1993, title: 'Frequency-dependent natural selection in the handedness of scale-eating cichlid fish', journal: 'Science 260: 216–219' },
      { authors: 'Takeuchi, Y., Hori, M. & Oda, Y.', year: 2012, title: 'Lateralized kinematics of predation behavior in a Lake Tanganyika scale-eating cichlid fish', journal: 'PLoS ONE 7: e29272' },
      { authors: 'Stewart, T. A. & Albertson, R. C.', year: 2010, title: 'Evolution of a unique predatory feeding apparatus: functional anatomy, development and a genetic locus for jaw laterality in Lake Tanganyika scale-eating cichlids', journal: 'BMC Biology 8: 8' },
      { authors: 'Sinervo, B. & Lively, C. M.', year: 1996, title: 'The rock–paper–scissors game and the evolution of alternative male strategies', journal: 'Nature 380: 240–243' },
      { authors: 'Klein, J., Sato, A., Nagl, S. & O’hUigin, C.', year: 1998, title: 'Molecular trans-species polymorphism', journal: 'Annual Review of Ecology and Systematics 29: 1–21' },
    ],
    standards: {
      undergrad: [
        'Negative frequency-dependent selection & balancing polymorphism (Hori 1993)',
        'Partial heritability + phenotypic plasticity in quantitative morphology',
        'Intransitive Rock–Paper–Scissors dynamics (Sinervo & Lively 1996)',
        'Trans-species polymorphism & Tajima’s D > 0 at MHC loci',
      ],
      apOrALevel: [
        'AP Biology EVO-1.E / SYI-3.D: Balancing selection & maintenance of phenotypic diversity',
        'UK A-Level / Undergraduate Bridge: Frequency-dependent selection & molecular evolution',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <div class="plate-caption-pill">
          <span class="plate-caption-text" data-jaw-caption>Lake Tanganyika — Perissodus ambush</span>
          <span class="plate-scale-bar">
            <span data-jaw-tag>Guard: Right Flank</span>
          </span>
        </div>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" type="button" data-jaw-reset>Reset 3D</button>
        </div>
      </div>
      <div class="plate-canvas-host" data-jaw-canvas></div>
      <div class="hwe-plate-legend" data-jaw-legend></div>
      <div class="plate-orbit-hint" style="bottom:18px;">Drag to orbit 3D · Scroll to zoom</div>
    `;

    const captionEl = plateStageEl.querySelector<HTMLElement>('[data-jaw-caption]')!;
    const tagEl = plateStageEl.querySelector<HTMLElement>('[data-jaw-tag]')!;
    const legendEl = plateStageEl.querySelector<HTMLElement>('[data-jaw-legend]')!;
    const canvasHost = plateStageEl.querySelector<HTMLElement>('[data-jaw-canvas]')!;

    const scene3d = new JawsScene3D(canvasHost);
    plateStageEl.querySelector('[data-jaw-reset]')!.addEventListener('click', () => scene3d.resetView());

    let activeStep = 0;

    // Page 1 state
    let p1Guard: 'left' | 'right' = 'right';
    let p1Attacker: 'left' | 'right' = 'left'; // Left-bent attacks prey's RIGHT flank!
    let p1Outcome = 'Guard the flank most predators target—and watch an unguarded opposite-jaw morph slip through!';

    // Page 2 state
    let p2State = createInitialTanganyika(0.76);

    // Page 3 state
    let p3H2 = 0.25;

    // Page 4 state
    let p4Rps = createInitialLizardRps();

    // Page 5 state
    let p5Mode: 'neutral' | 'mhc_balancing' = 'mhc_balancing';

    // Page 6 state
    let p6Idx = 0;
    let p6Done = false;
    const p6Answered: Record<string, { choice: string; correct: boolean }> = {};

    const updateHeaderAndLegend = () => {
      if (activeStep === 0) {
        captionEl.textContent = 'Lake Tanganyika — Perissodus ambush';
        tagEl.textContent = `Guard: ${p1Guard === 'right' ? 'Right' : 'Left'} Flank`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2b62c9"></i>Left-bent jaw</span>
          <span><i class="hwe-dot" style="background:#c9542b"></i>Right-bent jaw</span>
          <span><i class="hwe-dot" style="background:#e6b432"></i>Golden flank guard</span>
        `;
      } else if (activeStep === 1) {
        captionEl.textContent = 'Tanganyika School — 5-Year Cycle';
        tagEl.textContent = `Season ${p2State.season} · Left ${(p2State.pLeft * 100).toFixed(0)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2b62c9"></i>Left-bent morph</span>
          <span><i class="hwe-dot" style="background:#c9542b"></i>Right-bent morph</span>
        `;
      } else if (activeStep === 2) {
        captionEl.textContent = 'Partial Heritability — Jaw Anatomy';
        tagEl.textContent = `h² = ${p3H2.toFixed(2)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2b62c9"></i>Left-bent jaw</span>
          <span><i class="hwe-dot" style="background:#c9542b"></i>Right-bent jaw</span>
        `;
      } else if (activeStep === 3) {
        captionEl.textContent = 'Side-Blotched Lizards — RPS Cycle';
        tagEl.textContent = `Gen ${p4Rps.gen} · O ${(p4Rps.freqs[0] * 100).toFixed(0)}% B ${(p4Rps.freqs[1] * 100).toFixed(0)}% Y ${(p4Rps.freqs[2] * 100).toFixed(0)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#e65c1e"></i>Orange</span>
          <span><i class="hwe-dot" style="background:#2864d4"></i>Blue</span>
          <span><i class="hwe-dot" style="background:#e6be26"></i>Yellow</span>
        `;
      } else if (activeStep === 4) {
        const m = getBalancingTreeMetrics(p5Mode);
        captionEl.textContent = p5Mode === 'mhc_balancing' ? 'Trans-Species MHC Balancing Tree' : 'Neutral Human–Chimp Gene Tree';
        tagEl.textContent = `TMRCA ~${m.tmrcaMyr} Ma · D = ${m.tajimasD > 0 ? '+' : ''}${m.tajimasD.toFixed(2)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2b62c9"></i>Human alleles</span>
          <span><i class="hwe-dot" style="background:#d99226"></i>Chimp alleles</span>
          <span><i class="hwe-dot" style="background:#3b868e"></i>6 Ma split plane</span>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        captionEl.textContent = `Balancing Selection Check — Case ${p6Idx + 1} of 3`;
        tagEl.textContent = `Score ${score}/3`;
        legendEl.innerHTML = `<span><i class="hwe-dot" style="background:#236f7a"></i>Balancing polymorphism</span>`;
      }
    };

    const sync3D = (lunge = false) => {
      if (activeStep === 0) scene3d.updateAmbushScene(p1Guard, p1Attacker, lunge);
      else if (activeStep === 1) scene3d.updateOscillationSchool(p2State);
      else if (activeStep === 2) scene3d.updateHeritabilitySpecimen(p3H2);
      else if (activeStep === 3) scene3d.updateLizardRpsScene(p4Rps);
      else if (activeStep === 4) scene3d.updateMhcTreeScene(p5Mode);
      else scene3d.setCheckCaseBackdrop(p6Idx);
      updateHeaderAndLegend();
    };

    const renderLeftControls = () => {
      let html = '';

      if (activeStep === 0) {
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">PREY FLANK GUARD & AMBUSH</span>
              <span class="hwe-stat-badge">Guarding ${p1Guard.toUpperCase()}</span>
            </div>
            <div class="lic-mode-grid">
              <button class="lic-pill-btn ${p1Guard === 'right' ? 'is-active' : ''}" type="button" data-guard="right">Guard Right Flank</button>
              <button class="lic-pill-btn ${p1Guard === 'left' ? 'is-active' : ''}" type="button" data-guard="left">Guard Left Flank</button>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-ambush="left">Ambush: Left-Bent Jaw</button>
              <button class="lic-btn" type="button" data-ambush="right">Ambush: Right-Bent Jaw</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Left-bent jaw strikes RIGHT flank · Right-bent jaw strikes LEFT flank</div>
            <p class="lic-formula-note">${p1Outcome}</p>
          </div>
        `;
      } else if (activeStep === 1) {
        const toPoly = (arr: number[]) =>
          arr.map((v, i) => `${(10 + (i / Math.max(1, arr.length - 1)) * 270).toFixed(1)},${(58 - v * 48).toFixed(1)}`).join(' ');
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">HORI (1993) OSCILLATION</span>
              <span class="hwe-stat-badge">Season ${p2State.season}</span>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Left-Bent</span>
                <span class="lic-stat-val">${(p2State.pLeft * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Right-Bent</span>
                <span class="lic-stat-val">${((1 - p2State.pLeft) * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Guard Lag</span>
                <span class="lic-stat-val is-accent">${(p2State.guardLeft * 100).toFixed(0)}% R</span>
              </div>
            </div>
            <div class="lic-spark-box">
              <svg viewBox="0 0 290 64" aria-label="Left-bent frequency oscillation">
                <line x1="10" y1="34" x2="280" y2="34" stroke="#cbbda7" stroke-dasharray="3 3" stroke-width="1" />
                <polyline fill="none" stroke="#2b62c9" stroke-width="2.3" points="${toPoly(p2State.historyLeft)}" />
                <polyline fill="none" stroke="#e6a824" stroke-width="1.7" stroke-dasharray="4 3" points="${toPoly(p2State.historyGuard)}" />
                <text x="12" y="10" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="#2b62c9">Solid: Left-Bent % · Dashed: Prey Guard Lag</text>
              </svg>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p2-step>Advance +3 Seasons →</button>
              <button class="lic-btn" type="button" data-p2-reset>Reset (76% Left)</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">W(Left) = ${p2State.fitnessLeft.toFixed(2)} · W(Right) = ${p2State.fitnessRight.toFixed(2)}</div>
            <p class="lic-formula-note">Neither morph “wins”: whenever one rises past 50%, prey guard that flank, giving the rarer morph the feeding edge!</p>
          </div>
        `;
      } else if (activeStep === 2) {
        const trajHi = simulateHeritabilityComparison(0.90, 20);
        const trajEmp = simulateHeritabilityComparison(0.25, 20);
        const toPoly = (arr: number[]) =>
          arr.map((v, i) => `${(10 + (i / (arr.length - 1)) * 270).toFixed(1)},${(58 - v * 48).toFixed(1)}`).join(' ');
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">HERITABILITY OF JAW ASYMMETRY</span>
              <span class="hwe-stat-badge">h² = ${p3H2.toFixed(2)}</span>
            </div>
            <div class="lic-mode-grid">
              <button class="lic-pill-btn ${p3H2 === 0.9 ? 'is-active' : ''}" type="button" data-p3-h2="0.9">Classic Mendelian (h² = 0.90)</button>
              <button class="lic-pill-btn ${p3H2 === 0.25 ? 'is-active' : ''}" type="button" data-p3-h2="0.25">Empirical Partial (h² = 0.25)</button>
            </div>
            <div class="lic-spark-box">
              <svg viewBox="0 0 290 64" aria-label="Heritability damping comparison">
                <line x1="10" y1="34" x2="280" y2="34" stroke="#cbbda7" stroke-dasharray="3 3" stroke-width="1" />
                <polyline fill="none" stroke="#c9542b" stroke-width="2" stroke-dasharray="4 3" points="${toPoly(trajHi)}" />
                <polyline fill="none" stroke="#236f7a" stroke-width="2.4" points="${toPoly(trajEmp)}" />
                <text x="12" y="10" font-family="IBM Plex Mono, monospace" font-size="8.5" fill="#236f7a">Solid: h²=0.25 (damped) · Dashed: h²=0.90</text>
              </svg>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Takeuchi et al. (2012): genes + lateralized feeding plasticity</div>
            <p class="lic-formula-note">Lower empirical heritability (h² ≈ 0.25) damps wild overshoots via R = h²S while still preserving both jaw morphs in Lake Tanganyika.</p>
          </div>
        `;
      } else if (activeStep === 3) {
        const [fO, fB, fY] = p4Rps.freqs;
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">UTA STANSBURIANA · RPS ORBIT</span>
              <span class="hwe-stat-badge">Gen ${p4Rps.gen}</span>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Orange (O)</span>
                <span class="lic-stat-val" style="color:#c24614">${(fO * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Blue (B)</span>
                <span class="lic-stat-val" style="color:#2252b0">${(fB * 100).toFixed(0)}%</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Yellow (Y)</span>
                <span class="lic-stat-val" style="color:#9e7d12">${(fY * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-btn-row">
              <button class="lic-btn is-primary" type="button" data-p4-step>Evolve +2 Generations →</button>
              <button class="lic-btn" type="button" data-p4-reset>Reset Orbit</button>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Orange &gt; Blue &gt; Yellow &gt; Orange (intransitive cycle)</div>
            <p class="lic-formula-note">Watch the three sculpted lizards wax and wane as the black population bead orbits perpetually inside the brass dominance ring (Sinervo & Lively 1996)!</p>
          </div>
        `;
      } else if (activeStep === 4) {
        const m = getBalancingTreeMetrics(p5Mode);
        html = `
          <div class="hwe-card">
            <div class="hwe-card-head">
              <span class="hwe-kicker">GENOMIC TREE FOOTPRINT</span>
              <span class="hwe-stat-badge">Tajima’s D = ${m.tajimasD > 0 ? '+' : ''}${m.tajimasD.toFixed(2)}</span>
            </div>
            <div class="lic-mode-grid">
              <button class="lic-pill-btn ${p5Mode === 'neutral' ? 'is-active' : ''}" type="button" data-p5-mode="neutral">Neutral Locus (~1.2 Ma)</button>
              <button class="lic-pill-btn ${p5Mode === 'mhc_balancing' ? 'is-active' : ''}" type="button" data-p5-mode="mhc_balancing">MHC Balancing (~22 Ma)</button>
            </div>
            <div class="lic-stat-row">
              <div class="lic-stat-box">
                <span class="lic-stat-label">Allele Age</span>
                <span class="lic-stat-val is-accent">${m.tmrcaMyr} Ma</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Tajima’s D</span>
                <span class="lic-stat-val">${m.tajimasD > 0 ? '+' : ''}${m.tajimasD.toFixed(2)}</span>
              </div>
              <div class="lic-stat-box">
                <span class="lic-stat-label">Trans-Species</span>
                <span class="lic-stat-val">${m.transSpecies ? 'YES ✓' : 'No'}</span>
              </div>
            </div>
          </div>

          <div class="lic-formula-card">
            <div class="lic-formula-line">Balancing selection preserves polymorphism longer than species last</div>
            <p class="lic-formula-note">${m.note}</p>
          </div>
        `;
      } else {
        const score = Object.values(p6Answered).filter((a) => a.correct).length;
        if (p6Done) {
          html = `
            <div class="hwe-card">
              <div class="hwe-card-head">
                <span class="hwe-kicker">PLATE 6 COMPLETE</span>
                <span class="hwe-stat-badge">${score}/${CHECK_CASES.length}</span>
              </div>
              <p style="margin:0;font-size:13.5px;line-height:1.5;color:var(--ink);">
                <strong>Stamped!</strong> You’ve mastered negative frequency-dependent selection, partial heritability, Rock–Paper–Scissors lizard orbits, and trans-species MHC balancing trees.
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
      leftPanelEl.querySelectorAll<HTMLElement>('[data-guard]').forEach((b) => {
        b.addEventListener('click', () => {
          p1Guard = b.dataset.guard as 'left' | 'right';
          sync3D(false);
          renderLeftControls();
        });
      });
      leftPanelEl.querySelectorAll<HTMLElement>('[data-ambush]').forEach((b) => {
        b.addEventListener('click', () => {
          p1Attacker = b.dataset.ambush as 'left' | 'right';
          const attackedFlank = p1Attacker === 'left' ? 'right' : 'left';
          const blocked = attackedFlank === p1Guard;
          p1Outcome = blocked
            ? `BLOCKED! The ${p1Attacker}-bent predator lunged at the guarded ${attackedFlank} flank and went hungry.`
            : `SCALE BITE LANDED! The ${p1Attacker}-bent predator struck the unguarded ${attackedFlank} flank — rare morphs eat well!`;
          sync3D(true);
          renderLeftControls();
        });
      });

      // Bind Page 2
      leftPanelEl.querySelector('[data-p2-step]')?.addEventListener('click', () => {
        p2State = stepTanganyikaSeason(p2State, 0.85, 3);
        sync3D();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p2-reset]')?.addEventListener('click', () => {
        p2State = createInitialTanganyika(0.76);
        sync3D();
        renderLeftControls();
      });

      // Bind Page 3
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p3-h2]').forEach((b) => {
        b.addEventListener('click', () => {
          p3H2 = Number(b.dataset.p3H2);
          sync3D();
          renderLeftControls();
        });
      });

      // Bind Page 4
      leftPanelEl.querySelector('[data-p4-step]')?.addEventListener('click', () => {
        p4Rps = stepLizardRps(p4Rps, 2);
        sync3D();
        renderLeftControls();
      });
      leftPanelEl.querySelector('[data-p4-reset]')?.addEventListener('click', () => {
        p4Rps = createInitialLizardRps();
        sync3D();
        renderLeftControls();
      });

      // Bind Page 5
      leftPanelEl.querySelectorAll<HTMLElement>('[data-p5-mode]').forEach((b) => {
        b.addEventListener('click', () => {
          p5Mode = b.dataset.p5Mode as 'neutral' | 'mhc_balancing';
          sync3D();
          renderLeftControls();
        });
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
          ctx.completeChapter('jaws', score, CHECK_CASES.length);
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
      activeStep = Math.max(0, Math.min(CH06_JAWS.steps.length - 1, stepIndex));
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
