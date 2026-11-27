// =============================================================================
// Chapter 10: Switches & Deep Homology — Pitx1 Cis-Enhancers, Hox Colinearity,
// Pax6 Deep Homology, Daphnia G×E Plasticity & Major Transitions
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import { computeMulticellularity, computePlasticity, evaluatePitx1, type Pitx1Mode } from './switchMath';
import { SwitchScene3D, type SwitchPageId } from './SwitchScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'switch')!;

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
    id: 'sw1-pitx1',
    prompt:
      'Freshwater threespine sticklebacks repeatedly lost their ventral pelvic spines via deletions in a pelvic-specific Pitx1 cis-regulatory enhancer rather than mutations in the Pitx1 protein itself (Chan et al. 2010). Why?',
    options: [
      { id: 'a', label: 'Because Pitx1 is pleiotropic (essential for jaw & pituitary development); deleting one tissue-specific enhancer removes pelvic spines without lethal side effects elsewhere.', correct: true },
      { id: 'b', label: 'Because coding DNA never mutates in vertebrates.', correct: false },
      { id: 'c', label: 'Because freshwater lakes contain mutagenic chemicals that target only pelvic enhancers.', correct: false },
    ],
    explanation:
      'Correct! Modular cis-regulatory enhancers bypass pleiotropic constraints—allowing evolution to reshape one body part without breaking vital functions of the same transcription factor in other organs (Carroll 2008; Chan et al. 2010).',
  },
  {
    id: 'sw2-pax6',
    prompt:
      'When researchers express the MOUSE Pax6 gene on the developing leg of a fruit fly (Drosophila), an ectopic FLY compound eye (not a mouse camera eye) grows on the fly’s leg (Halder et al. 1995). What does this demonstrate?',
    options: [
      { id: 'a', label: 'Mouse and fly eyes are strictly homologous organs inherited intact from a common ancestor with camera eyes.', correct: false },
      { id: 'b', label: 'Deep homology: the ancestral Pax6 master switch is conserved across bilaterians, while each lineage wired different downstream eye-building networks beneath it.', correct: true },
      { id: 'c', label: 'Pax6 alone encodes every protein needed to build a retina.', correct: false },
    ],
    explanation:
      'Correct! Deep homology (Shubin, Tabin & Carroll 2009): Pax6 acts as a conserved “build eye here” switch, activating whichever species-specific downstream developmental cascade sits in the host genome.',
  },
  {
    id: 'sw3-volvox',
    prompt:
      'Why is a single-cell unicellular bottleneck (zygote or spore) so crucial in major evolutionary transitions to complex multicellularity (like Volvox or animals)?',
    options: [
      { id: 'a', label: 'It resets within-organism relatedness to r = 1.0 (clonality), aligning cell fitness so sterile somatic cells can evolve without being overrun by selfish cheater lineages.', correct: true },
      { id: 'b', label: 'It prevents mutations from ever occurring during adulthood.', correct: false },
      { id: 'c', label: 'It forces unrelated cells to compete inside every embryo.', correct: false },
    ],
    explanation:
      'Correct! Passing through a single-cell bottleneck maximizes genetic relatedness (r = 1.0) among cells in a body, aligning Hamilton’s rule and suppressing cheater cells (Maynard Smith & Szathmáry 1995).',
  },
];

const PAGE_IDS: SwitchPageId[] = ['pitx1', 'hox', 'deephom', 'plasticity', 'transitions', 'check'];

export const CH10_SWITCH: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'pitx1',
      shortLabel: '1 Pitx1',
      eyebrow: 'CHAN ET AL. (2010) · MODULAR ENHANCERS',
      heading: 'How to edit a body without breaking it',
      bodyHtml: `Freshwater sticklebacks shed their ocean pelvic spines repeatedly across post-glacial lakes—not by mutating the <em>Pitx1</em> protein, which would shatter jaw &amp; pituitary development, but by deleting a modular ${gloss('cis_regulatory', 'cis-regulatory enhancer')}!`,
      promptHint: 'Compare Marine Ancestor, Freshwater Enhancer Deletion, and Coding Knockout.',
    },
    {
      id: 'hox',
      shortLabel: '2 Hox',
      eyebrow: 'HOMEOTIC GENES · 3′ → 5′ COLINEARITY',
      heading: 'The chromosomal map of a body',
      bodyHtml: `Across insects and vertebrates alike, ${gloss('hox', 'Hox genes')} line up along the chromosome in the exact head-to-tail order of the body segments they specify. Misexpressing a single switch transforms antennae into legs (<em>Antp</em>) or halteres into a second pair of wings (<em>Ubx</em>)!`,
      promptHint: 'Toggle Wild-Type, Antennapedia, and Ultrabithorax homeotic shifts.',
    },
    {
      id: 'deephom',
      shortLabel: '3 Pax6',
      eyebrow: 'HALDER ET AL. (1995) · DEEP HOMOLOGY',
      heading: 'Same ancient switch, different eyes',
      bodyHtml: `Vertebrate camera eyes and insect compound eyes look utterly different—yet both are triggered by the same ancestral transcription factor, <em>Pax6 / eyeless</em>! Test ${gloss('deep_homology', 'deep homology')} by expressing mouse <em>Pax6</em> inside a fruit fly.`,
      promptHint: 'Trigger Mouse Pax6 expression in Drosophila to see which kind of eye develops.',
    },
    {
      id: 'plasticity',
      shortLabel: '4 G×E',
      eyebrow: 'PHENOTYPIC PLASTICITY & BET-HEDGING',
      heading: 'Reaction norms & geometric means',
      bodyHtml: `A single genotype isn’t locked to one shape! Water fleas (<em>Daphnia</em>) sense predator kairomones and grow tall defensive helmets via ${gloss('phenotypic_plasticity', 'phenotypic plasticity')}—creating crossing ${gloss('reaction_norm', 'G×E reaction norms')}.`,
      promptHint: 'Slide predator kairomones from 0% to 100% to watch plastic Daphnia helmets grow live.',
    },
    {
      id: 'transitions',
      shortLabel: '5 Multicellular',
      eyebrow: 'MAYNARD SMITH & SZATHMÁRY · MAJOR TRANSITIONS',
      heading: 'From solitary cells to integrated bodies',
      bodyHtml: `How did independent cells surrender reproduction to become sterile soma? Explore a 3D <em>Volvox</em> spheroid and test how a ${gloss('major_transition', 'single-cell bottleneck')} enforces clonal relatedness (<em>r = 1.0</em>) to suppress cheater cells.`,
      promptHint: 'Toggle Single-Cell Bottleneck ON vs. Chimeric Aggregation to see cheater invasion.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'EVO-DEVO & PLASTICITY MASTERY',
      heading: 'Switches, homology & transitions',
      bodyHtml: `Synthesize Pitx1 enhancers, Pax6 deep homology, and unicellular bottlenecks across three diagnostic exam cases.`,
      promptHint: 'Answer all three cases to stamp Plate 10.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Evo-Devo & Evolutionary Ecology)',
    learningObjectives: [
      'Explain why cis-regulatory enhancer evolution circumvents pleiotropy compared to coding knockouts (Pitx1 sticklebacks).',
      'Describe Hox 3′→5′ spatial colinearity and classic homeotic transformations (Antp, Ubx).',
      'Distinguish deep homology of ancient regulatory switches (Pax6) from structural analogy of adult eyes.',
      'Interpret crossing G×E reaction norms and explain why geometric mean fitness favors bet-hedging in variable environments.',
      'Explain how single-cell bottlenecks align cellular relatedness (r = 1) during major evolutionary transitions.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Expressing mouse Pax6 in a fly creates a miniature mouse camera eye.',
        correction:
          'It creates a fly compound eye! Pax6 is a homologous upstream master switch that activates whichever downstream eye-development genes exist in the host genome.',
      },
      {
        misconception: 'Phenotypic plasticity means organisms rewrite their DNA within their lifetime.',
        correction:
          'Plasticity is an evolved genetic programme (a reaction norm) allowing ONE unchanged genotype to produce different phenotypes in response to environmental cues.',
      },
    ],
    discussionPrompts: [
      'Why do major morphological novelties often evolve via cis-regulatory shifts, while physiological adaptations (like haemoglobin oxygen affinity or Mc1r coat colour) frequently involve coding changes?',
      'How does geometric mean fitness explain why a specialist with arithmetic mean 1.39 loses to a bet-hedger with arithmetic mean 1.00 across fluctuating drought years?',
    ],
    activityTip:
      'On Page 1, ask students why freshwater lakes without fish predators but WITH grasping dragonfly nymphs select specifically for pelvic-spine loss.',
  },
  scienceCard: {
    coreTakeaway:
      'Evolution builds animal diversity largely by rewiring conserved developmental switches (Hox, Pitx1 enhancers, Pax6) without breaking pleiotropic proteins, while plasticity (G×E reaction norms) and single-cell bottlenecks unlock adaptive responsiveness and complex multicellularity.',
    assumptions: [
      {
        label: 'Stickleback Pitx1 Pel Enhancer',
        status: 'realistic',
        tag: 'Chan et al. 2010',
        detail: 'Independent recurrent deletions of the fragile Pel enhancer occurred across dozens of post-glacial freshwater stickleback lakes.',
      },
      {
        label: 'Pax6 Cross-Phylum Rescue',
        status: 'realistic',
        tag: 'Halder et al. 1995',
        detail: 'Mouse Pax6 triggers ectopic compound eyes in Drosophila, establishing the paradigm of deep homology.',
      },
      {
        label: 'Daphnia Inducible Helmets',
        status: 'realistic',
        tag: 'Tollrian & Harvell 1999',
        detail: 'Chemical kairomones from Chaoborus midges and fish induce protective helmets and tail spines within a single clonal lineage.',
      },
    ],
    citations: [
      {
        authors: 'Chan, Y. F. et al.',
        year: 2010,
        title: 'Adaptive evolution of pelvic reduction in sticklebacks by recurrent deletion of a Pitx1 enhancer',
        journal: 'Science 327:302–305',
      },
      {
        authors: 'Halder, G., Callaerts, P. & Gehring, W. J.',
        year: 1995,
        title: 'Induction of ectopic eyes by targeted expression of the eyeless gene in Drosophila',
        journal: 'Science 267:1788–1792',
      },
      {
        authors: 'Maynard Smith, J. & Szathmáry, E.',
        year: 1995,
        title: 'The Major Transitions in Evolution',
        journal: 'Oxford University Press',
      },
    ],
    standards: {
      undergrad: [
        'Evo-Devo Core: Cis-Regulatory Evolution, Hox Colinearity & Deep Homology',
        'Phenotypic Plasticity (G×E), Bet-Hedging & Major Transitions in Individuality',
      ],
      apOrALevel: ['AP Bio 6.5–6.6 / Undergrad Evo-Devo & Gene Regulation'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="sw-caption">Plate X · Stickleback Pitx1 Cis-Regulatory Enhancer</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="sw-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="sw-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="sw-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="sw-canvas-host"></div>
      <div class="hwe-plate-legend" id="sw-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D Evo-Devo models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#sw-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#sw-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#sw-legend') as HTMLElement;

    const scene = new SwitchScene3D(canvasHost);
    (plateStageEl.querySelector('#sw-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#sw-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#sw-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let pitxMode: Pitx1Mode = 'enhancer_del';
    let hoxMode: 'wildtype' | 'antp' | 'ubx' = 'wildtype';
    let ectopicPax6 = true;
    let kairomone = 0.75;
    let bottleneck = true;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'pitx1';
      scene.setPage(pageId);

      if (pageId === 'pitx1') {
        const res = evaluatePitx1(pitxMode);
        scene.updatePitx1(res);
        captionEl.textContent = 'Plate X.1 · Threespine Stickleback Pitx1 Modular Enhancers';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d96b2b"></i>Pelvic Enhancer / Spines</span>
          <span><i class="hwe-dot" style="background:#2f7d6e"></i>Jaw Enhancer</span>
          <span><i class="hwe-dot" style="background:#6c4982"></i>Pitx1 Coding Exon</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Pitx1 Genetic Perturbation</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${pitxMode === 'marine' ? 'active' : ''}" data-pm="marine">Marine Ancestor (All Enhancers ON)</button>
                <button class="lic-pill-btn ${pitxMode === 'enhancer_del' ? 'active' : ''}" data-pm="enhancer_del">Freshwater Pelvic Enhancer Deletion</button>
                <button class="lic-pill-btn ${pitxMode === 'coding_ko' ? 'active' : ''}" data-pm="coding_ko">Pitx1 Protein Coding Knockout</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Lake Fitness: ${(res.freshwaterFitness * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Jaw/Pituitary: ${res.jawIntact ? 'Intact' : 'BROKEN'}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.verdict}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-pm]').forEach((b) =>
          b.addEventListener('click', () => {
            pitxMode = (b as HTMLElement).dataset.pm as Pitx1Mode;
            renderPage();
          })
        );
      } else if (pageId === 'hox') {
        scene.updateHox(hoxMode);
        captionEl.textContent = 'Plate X.2 · Drosophila 3′ → 5′ Hox Colinearity';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#36689e"></i>Anterior Head (lab/pb)</span>
          <span><i class="hwe-dot" style="background:#c9a336"></i>Thorax (Antp/Ubx)</span>
          <span><i class="hwe-dot" style="background:#7b438c"></i>Posterior Abdomen (Abd-B)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Homeotic Switch State</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${hoxMode === 'wildtype' ? 'active' : ''}" data-hm="wildtype">Wild-Type Colinearity (3′ → 5′)</button>
                <button class="lic-pill-btn ${hoxMode === 'antp' ? 'active' : ''}" data-hm="antp">Antennapedia Ectopic (Leg on Head!)</button>
                <button class="lic-pill-btn ${hoxMode === 'ubx' ? 'active' : ''}" data-hm="ubx">Ultrabithorax Loss (4-Winged Fly!)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Hox Colinearity:</strong> The physical order of Hox genes on the chromosome (back row) maps directly onto the anterior-to-posterior body segments (front row) they pattern!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-hm]').forEach((b) =>
          b.addEventListener('click', () => {
            hoxMode = (b as HTMLElement).dataset.hm as 'wildtype' | 'antp' | 'ubx';
            renderPage();
          })
        );
      } else if (pageId === 'deephom') {
        scene.updateDeepHomology(ectopicPax6);
        captionEl.textContent = 'Plate X.3 · Deep Homology (Camera Eye vs Compound Eye via Pax6)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3b729c"></i>Mouse Camera Eye</span>
          <span><i class="hwe-dot" style="background:#d93228"></i>Fly Compound Eye</span>
          <span><i class="hwe-dot" style="background:#d69a2d"></i>Conserved Pax6 Switch</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Cross-Phylum Pax6 Experiment (Halder 1995)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${!ectopicPax6 ? 'active' : ''}" data-ep="0">Native Eyes</button>
                <button class="lic-pill-btn ${ectopicPax6 ? 'active' : ''}" data-ep="1">Mouse Pax6 → Fly</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Deep Homology:</strong> Mouse <em>Pax6</em> and fly <em>eyeless</em> are 94% identical in their DNA-binding domain—triggering a <strong>compound</strong> eye inside fly cells because downstream eye networks diverged over 550 Ma!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-ep]').forEach((b) =>
          b.addEventListener('click', () => {
            ectopicPax6 = (b as HTMLElement).dataset.ep === '1';
            renderPage();
          })
        );
      } else if (pageId === 'plasticity') {
        const res = computePlasticity(kairomone);
        scene.updatePlasticity(res);
        captionEl.textContent = 'Plate X.4 · Daphnia Inducible Helmets (G×E Reaction Norms)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#8ad0cc"></i>Plastic Defender (Left)</span>
          <span><i class="hwe-dot" style="background:#d8ebe8;border:1px solid #999"></i>Unarmoured Genotype (Right)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Predator Kairomone Concentration</div>
              <label style="display:block;font-size:0.84rem;">
                Predator Cue = <strong>${(kairomone * 100).toFixed(0)}%</strong>
                <input type="range" id="sw-k" min="0" max="1" step="0.05" value="${kairomone}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Plastic W: ${res.plasticFit.toFixed(2)}</span>
                <span class="hwe-stat-badge">Unarmoured W: ${res.unarmoredFit.toFixed(2)}</span>
              </div>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">Geom Mean Bet-Hedger: ${res.geomMeanBetHedger.toFixed(3)} &gt; Spec ${res.geomMeanSpecialist.toFixed(3)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>G×E &amp; Bet-Hedging:</strong> When environments fluctuate unpredictably, long-term success depends on <strong>geometric mean</strong> fitness—a single catastrophic year (0.15) sinks a specialist!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#sw-k')?.addEventListener('input', (e) => {
          kairomone = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'transitions') {
        const res = computeMulticellularity(bottleneck);
        scene.updateTransition(res);
        captionEl.textContent = 'Plate X.5 · Volvox Multicellular Transition & Bottleneck';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3b8c58"></i>Cooperative Soma</span>
          <span><i class="hwe-dot" style="background:#d69a2d"></i>Protected Germline</span>
          <span><i class="hwe-dot" style="background:#c4483a"></i>Selfish Cheater Cell</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Developmental Mode</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${bottleneck ? 'active' : ''}" data-bn="1">Single-Cell Bottleneck</button>
                <button class="lic-pill-btn ${!bottleneck ? 'active' : ''}" data-bn="0">Chimeric Clumping</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Cell Relatedness r = ${res.relatedness.toFixed(2)}</span>
                <span class="hwe-stat-badge">Cheaters: ${(res.cheaterFreq * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Major Transition:</strong> A unicellular bottleneck makes every cell in a <em>Volvox</em> spheroid clonal (<strong>r = 1.0</strong>), resolving cell-level conflict so sterile somatic flagella can serve the germline!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-bn]').forEach((b) =>
          b.addEventListener('click', () => {
            bottleneck = (b as HTMLElement).dataset.bn === '1';
            renderPage();
          })
        );
      } else {
        captionEl.textContent = 'Plate X.6 · Evo-Devo & Plasticity Diagnostic';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#5c7c85"></i>Stickleback</span>
          <span><i class="hwe-dot" style="background:#8ad0cc"></i>Daphnia</span>
          <span><i class="hwe-dot" style="background:#c82420"></i>Drosophila</span>
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
          ctx.completeChapter('switch', correctCount, CHECK_CASES.length);
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
                      ? `<div class="check-feedback ${opt.correct ? 'ok' : 'bad'}">${opt.correct ? c.explanation : 'Re-check the Evo-Devo mechanism on the preceding 3D plate and try again.'}</div>`
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
