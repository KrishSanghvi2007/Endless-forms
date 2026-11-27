// =============================================================================
// Chapter 12: Tree Thinking & Molecular Clocks — Node Swiveling, Parsimony,
// Neutral Molecular Clock (K = mu), dN/dS Selection & Incomplete Lineage Sorting
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  computeIls,
  computeMolecularClock,
  evaluateDnDs,
  evaluateParsimony,
  type GeneMode,
  type SwivelState,
} from './treesMath';
import { TreesScene3D, type TreesPageId } from './TreesScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'trees')!;

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
    id: 'tr1-swivel',
    prompt:
      'On a cladogram ((Fish, (Mouse, (Lizard, Bird)))), a student rotates the Sauropsid node so Bird appears next to Mouse on the page. Who is Bird MORE closely related to?',
    options: [
      { id: 'a', label: 'Mouse, because Bird and Mouse are now drawn right next to each other at the tips.', correct: false },
      { id: 'b', label: 'Lizard, because Bird and Lizard still share the most recent common ancestor (MRCA)—tip order changes nothing!', correct: true },
      { id: 'c', label: 'Fish, because Fish sits at the far left.', correct: false },
    ],
    explanation:
      'Correct! Rotating any internal node leaves every MRCA intact. Reading tip adjacency ("ladder thinking") is the #1 undergraduate phylogeny misconception—always trace back to nodes!',
  },
  {
    id: 'tr2-clock-dnds',
    prompt:
      'Why does Kimura’s neutral molecular clock tick at rate K = μ regardless of population size N_e, and what does a gene with dN/dS = 0.02 indicate?',
    options: [
      { id: 'a', label: 'Larger populations produce 2N_e times more new neutral mutations per generation, which cancels exact 1/(2N_e) fixation probability; dN/dS = 0.02 indicates strong purifying selection.', correct: true },
      { id: 'b', label: 'Larger populations fix neutral alleles faster; dN/dS = 0.02 indicates intense positive selection.', correct: false },
      { id: 'c', label: 'Neutral alleles never fix in large populations; dN/dS = 0.02 indicates a pseudogene.', correct: false },
    ],
    explanation:
      'Correct! K = (2N_e μ) × (1 / 2N_e) = μ! And ω = dN/dS ≪ 1 means non-synonymous amino-acid substitutions are strongly purged by purifying selection (e.g. Histone H4).',
  },
  {
    id: 'tr3-ils',
    prompt:
      'Across the human, chimpanzee, and gorilla genomes, ~30% of loci yield gene trees grouping Human with Gorilla or Chimp with Gorilla, even though the species tree is ((Human, Chimp), Gorilla). What explains this without invoking hybridization?',
    options: [
      { id: 'a', label: 'Incomplete Lineage Sorting (ILS): the ancestral Human–Chimp internal branch was short relative to ancestral N_e, so polymorphic alleles failed to coalesce before the Gorilla split.', correct: true },
      { id: 'b', label: 'Humans are actually more closely related to gorillas than chimpanzees.', correct: false },
      { id: 'c', label: 'All three primates evolved independently from different fishes.', correct: false },
    ],
    explanation:
      'Correct! When speciation intervals are short relative to 2N_e, ancestral polymorphisms persist across splits (deep coalescence / ILS), producing ~exp(−t/2N_e)/3 of each discordant gene topology (Scally et al. 2012).',
  },
];

const PAGE_IDS: TreesPageId[] = ['swivel', 'parsimony', 'clock', 'dnds', 'ils', 'check'];

export const CH12_TREES: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'swivel',
      shortLabel: '1 Swivel',
      eyebrow: 'TREE THINKING · CONQUERING LADDER THINKING',
      heading: 'Rotate the nodes, keep the ancestry',
      bodyHtml: `A phylogenetic tree is a hanging mobile, not a ladder of progress! Spin the three brass MRCA hinges on this 3D vertebrate ${gloss('phylogeny', 'phylogeny')}—notice how tip order scrambles while every evolutionary relationship stays 100% identical!`,
      promptHint: 'Spin all three brass nodes and verify who shares the newest MRCA with Bird.',
    },
    {
      id: 'parsimony',
      shortLabel: '2 Parsimony',
      eyebrow: 'SYNAPOMORPHIES VS HOMOPLASY',
      heading: 'Whales, hippos & the aquatic trap',
      bodyHtml: `Grouping whales with sharks because both have fins creates a ${gloss('homoplasy', 'homoplasy')} nightmare! Compare ${gloss('parsimony', 'maximum parsimony')} step counts: grouping Whale with Hippo requires just <strong>4</strong> transitions instead of <strong>7</strong>!`,
      promptHint: 'Switch between True Cetartiodactyla (4 steps) and the Aquatic Convergence Trap (7 steps).',
    },
    {
      id: 'clock',
      shortLabel: '3 Clock',
      eyebrow: 'KIMURA (1968) · NEUTRAL MOLECULAR CLOCK',
      heading: 'Why K = μ cancels population size',
      bodyHtml: `One of biology’s cleanest miracles: a population of size <em>N_e</em> generates <strong>2N_e μ</strong> neutral mutations per generation, each fixing with probability <strong>1/(2N_e)</strong>—so the ${gloss('molecular_clock', 'molecular clock')} ticks at <strong>K = μ</strong>, independent of <em>N_e</em>!`,
      promptHint: 'Slide N_e from 20 to 2,000 and watch substitution rate K remain rock-steady.',
    },
    {
      id: 'dnds',
      shortLabel: '4 dN/dS',
      eyebrow: 'MOLECULAR SELECTION SCANNER · ω = dN / dS',
      heading: 'Reading selection straight from codons',
      bodyHtml: `By comparing amino-acid-changing substitutions (<em>d_N</em>) against silent synonymous substitutions (<em>d_S</em>), the ${gloss('dnds', 'd_N / d_S (ω) ratio')} reveals purifying selection (<strong>ω &lt; 1</strong>), neutrality (<strong>ω ≈ 1</strong>), and positive selection (<strong>ω &gt; 1</strong>)!`,
      promptHint: 'Scan Histone H4, an Olfactory Pseudogene, and the MHC Immune Cleft.',
    },
    {
      id: 'ils',
      shortLabel: '5 ILS',
      eyebrow: 'GENE TREES VS SPECIES TREES · DEEP COALESCENCE',
      heading: 'Why 30% of our genome disagrees',
      bodyHtml: `A gene tree lives <em>inside</em> a species tree! When the ancestral Human–Chimp branch is short relative to <em>2N_e</em>, ${gloss('ils', 'Incomplete Lineage Sorting (ILS)')} causes ancestral alleles to coalesce deeper—yielding discordant gene trees without hybridization!`,
      promptHint: 'Shorten the Human–Chimp internal branch (τ = T/2N_e) to trigger deep coalescence.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'PHYLOGENETICS & MOLECULAR EVOLUTION MASTERY',
      heading: 'Reading trees & genomes',
      bodyHtml: `Test your mastery of node rotation, neutral clock invariance, dN/dS regimes, and Incomplete Lineage Sorting across three diagnostic cases.`,
      promptHint: 'Answer all three cases to stamp Plate 12.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Phylogenetics & Molecular Evolution)',
    learningObjectives: [
      'Interpret phylogenies strictly via MRCAs and monophyletic clades rather than tip proximity.',
      'Distinguish shared derived synapomorphies from convergent homoplasies using maximum parsimony.',
      'Derive Kimura’s neutral substitution rate K = (2N_e μ)(1/2N_e) = μ and explain fossil calibration.',
      'Diagnose purifying (ω < 1), neutral (ω = 1), and positive selection (ω > 1) from dN/dS ratios.',
      'Explain how Incomplete Lineage Sorting (ILS) generates discordant gene trees along short species branches.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Taxa positioned next to each other along the tips of a tree are closest relatives.',
        correction:
          'Any internal node can be rotated 180° without altering topology; relatedness is determined solely by how recently two lineages share a common ancestral node.',
      },
      {
        misconception: 'Any gene tree that differs from the species tree proves interspecies hybridization.',
        correction:
          'Incomplete Lineage Sorting (deep coalescence) naturally produces discordant gene trees whenever internal branch length T/(2N_e) is small—explaining ~30% of the Human–Chimp–Gorilla genome.',
      },
    ],
    discussionPrompts: [
      'Why does the neutral molecular clock tick per generation while fossil calibrations measure years—how does generation-time variation create rate differences between mice and elephants?',
      'How do genomicists use the ABBA–BABA (Patterson’s D) test to separate true introgression from symmetric ILS?',
    ],
    activityTip:
      'On Page 1, spin all three nodes and ask students to prove which two animals form a monophyletic clade.',
  },
  scienceCard: {
    coreTakeaway:
      'Phylogenies encode nested monophyletic ancestry independent of tip order, parsimony separates synapomorphy from convergence, neutral substitutions accumulate at rate K = μ independent of N_e, dN/dS diagnoses molecular selection, and Incomplete Lineage Sorting explains gene-tree/species-tree discordance.',
    assumptions: [
      {
        label: 'Cetartiodactyla Phylogeny',
        status: 'realistic',
        tag: 'Spaulding et al. 2009',
        detail: 'Both SINE retroposons and ankle astragalus fossils place whales deeply nested inside Artiodactyla as sister to hippos.',
      },
      {
        label: 'Great Ape ILS (~30% Discordance)',
        status: 'realistic',
        tag: 'Scally et al. 2012',
        detail: 'Gorilla genome sequencing confirmed ~30% of the genome exhibits ILS across the short Human–Chimp–Gorilla split.',
      },
    ],
    citations: [
      {
        authors: 'Baum, D. A., Smith, S. D. & Donovan, S. S.',
        year: 2005,
        title: 'The tree-thinking challenge',
        journal: 'Science 310:979–980',
      },
      {
        authors: 'Kimura, M.',
        year: 1968,
        title: 'Evolutionary rate at the molecular level',
        journal: 'Nature 217:624–626',
      },
      {
        authors: 'Scally, A. et al.',
        year: 2012,
        title: 'Insights into hominid evolution from the gorilla genome sequence',
        journal: 'Nature 483:169–175',
      },
    ],
    standards: {
      undergrad: [
        'Phylogenetics Core: Tree Thinking, Monophyly, Parsimony & Homoplasy',
        'Molecular Evolution: Kimura Clock (K = μ), dN/dS & Incomplete Lineage Sorting',
      ],
      apOrALevel: ['AP Bio 7.9 (Phylogeny & Cladograms)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="tr-caption">Plate XII · Interactive 3D Swivel-Node Phylogeny</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="tr-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="tr-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="tr-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="tr-canvas-host"></div>
      <div class="hwe-plate-legend" id="tr-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D phylogenies &amp; gene tubes</div>
    `;

    const canvasHost = plateStageEl.querySelector('#tr-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#tr-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#tr-legend') as HTMLElement;

    const scene = new TreesScene3D(canvasHost);
    (plateStageEl.querySelector('#tr-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#tr-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#tr-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    const swivel: SwivelState = { rotRoot: false, rotAmniote: false, rotSauropsid: false };
    let parsTopo: 'true_mammals' | 'aquatic_trap' = 'true_mammals';
    let clockNe = 500;
    let clockMa = 6;
    let geneMode: GeneMode = 'histone';
    let ilsTau = 0.45;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'swivel';
      scene.setPage(pageId);

      if (pageId === 'swivel') {
        scene.updateSwivel(swivel);
        captionEl.textContent = 'Plate XII.1 · Swivel-Node Vertebrate Cladogram';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#b88e42"></i>Rotatable Brass MRCA Hinge</span>
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Sauropsida (Lizard + Bird)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Rotate Any Internal MRCA Node 180°</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${swivel.rotSauropsid ? 'active' : ''}" id="tr-sw-saur">Swivel Sauropsid Node (Lizard ↔ Bird)</button>
                <button class="lic-pill-btn ${swivel.rotAmniote ? 'active' : ''}" id="tr-sw-amn">Swivel Amniote Node (Mouse ↔ Sauropsids)</button>
                <button class="lic-pill-btn ${swivel.rotRoot ? 'active' : ''}" id="tr-sw-root">Swivel Vertebrate Root (Fish ↔ Amniotes)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Tree Thinking Rule:</strong> Never read left-to-right across the tips! Notice Mouse is always equally related to Lizard and Bird, no matter which node you spin.</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#tr-sw-saur')?.addEventListener('click', () => {
          swivel.rotSauropsid = !swivel.rotSauropsid;
          renderPage();
        });
        leftPanelEl.querySelector('#tr-sw-amn')?.addEventListener('click', () => {
          swivel.rotAmniote = !swivel.rotAmniote;
          renderPage();
        });
        leftPanelEl.querySelector('#tr-sw-root')?.addEventListener('click', () => {
          swivel.rotRoot = !swivel.rotRoot;
          renderPage();
        });
      } else if (pageId === 'parsimony') {
        const res = evaluateParsimony(parsTopo);
        scene.updateParsimony(res);
        captionEl.textContent = 'Plate XII.2 · Maximum Parsimony vs Homoplasy';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Parsimonious Steps (4)</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Homoplasy Penalty (7)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Candidate Evolutionary Hypothesis</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${parsTopo === 'true_mammals' ? 'active' : ''}" data-pt="true_mammals">(Shark, (Hippo, Whale)) — 4 Steps</button>
                <button class="lic-pill-btn ${parsTopo === 'aquatic_trap' ? 'active' : ''}" data-pt="aquatic_trap">(Hippo, (Shark, Whale)) — 7 Steps</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Synapomorphy Beats Convergence:</strong> ${res.synapomorphies[0]}. ${res.homoplasies[0]}.</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-pt]').forEach((b) =>
          b.addEventListener('click', () => {
            parsTopo = (b as HTMLElement).dataset.pt as 'true_mammals' | 'aquatic_trap';
            renderPage();
          })
        );
      } else if (pageId === 'clock') {
        const res = computeMolecularClock(clockNe, 0.0011, clockMa);
        scene.updateClock(res);
        captionEl.textContent = 'Plate XII.3 · Kimura Neutral Molecular Clock (K = μ)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d69a2d"></i>Fixed Neutral Substitutions</span>
          <span><i class="hwe-dot" style="background:#b88e42"></i>Population Ring (N_e)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Test Population Size Invariance</div>
              <label style="display:block;font-size:0.84rem;">
                Population Size N_e = <strong>${clockNe}</strong>
                <input type="range" id="tr-ne" min="20" max="2000" step="20" value="${clockNe}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Divergence Time T = <strong>${clockMa} Ma</strong>
                <input type="range" id="tr-ma" min="2" max="25" step="1" value="${clockMa}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">K = ${(res.substitutionRateK * 1000).toFixed(2)}/Ga</span>
                <span class="hwe-stat-badge">DNA Diff: ${res.expectedSequenceDiffPct.toFixed(1)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Exact Cancellation:</strong> New neutral mutations = 2N_eμ; fixation probability = 1/(2N_e). Multiply them and <strong>N_e cancels out</strong>—giving K = μ!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#tr-ne')?.addEventListener('input', (e) => {
          clockNe = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#tr-ma')?.addEventListener('input', (e) => {
          clockMa = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'dnds') {
        const res = evaluateDnDs(geneMode);
        scene.updateDnDs(res);
        captionEl.textContent = 'Plate XII.4 · dN / dS Codon Selection Helix';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f658e"></i>Synonymous (dS)</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Non-Synonymous (dN)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Select Locus to Scan</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${geneMode === 'histone' ? 'active' : ''}" data-gm="histone">Histone H4 (Purifying, ω = 0.01)</button>
                <button class="lic-pill-btn ${geneMode === 'pseudogene' ? 'active' : ''}" data-gm="pseudogene">Olfactory Pseudogene (Neutral, ω = 1.0)</button>
                <button class="lic-pill-btn ${geneMode === 'mhc_positive' ? 'active' : ''}" data-gm="mhc_positive">MHC Immune Cleft (Positive, ω = 3.2)</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">dN = ${res.dN.toFixed(3)}</span>
                <span class="hwe-stat-badge">dS = ${res.dS.toFixed(3)}</span>
                <span class="hwe-stat-badge">ω = ${res.omega.toFixed(2)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.regime}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-gm]').forEach((b) =>
          b.addEventListener('click', () => {
            geneMode = (b as HTMLElement).dataset.gm as GeneMode;
            renderPage();
          })
        );
      } else if (pageId === 'ils') {
        const res = computeIls(ilsTau);
        scene.updateIls(res);
        captionEl.textContent = 'Plate XII.5 · Incomplete Lineage Sorting (Human–Chimp–Gorilla)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Concordant Gene Tree</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Discordant ILS Gene Tree</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Human–Chimp Ancestral Branch Length (τ = T / 2N_e)</div>
              <label style="display:block;font-size:0.84rem;">
                Coalescent Units τ = <strong>${ilsTau.toFixed(2)}</strong>
                <input type="range" id="tr-tau" min="0.10" max="2.50" step="0.05" value="${ilsTau}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">((H,C),G): ${(res.concordantProb * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">ILS Discordant: ${((1 - res.concordantProb) * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Pamilo–Nei Formula:</strong> P(concordant) = 1 − (2/3)e^(−τ). At real great-ape τ ≈ 0.8, ~30% of loci coalesce deeply into discordant gene trees!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#tr-tau')?.addEventListener('input', (e) => {
          ilsTau = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate XII.6 · Tree Thinking & Molecular Evolution Diagnostic';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#366858"></i>Cladistics</span>
          <span><i class="hwe-dot" style="background:#d69a2d"></i>Molecular Clock</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>ILS</span>
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
          ctx.completeChapter('trees', correctCount, CHECK_CASES.length);
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
                      ? `<div class="check-feedback ${opt.correct ? 'ok' : 'bad'}">${opt.correct ? c.explanation : 'Re-check the phylogenetic logic on the preceding 3D plate and try again.'}</div>`
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
