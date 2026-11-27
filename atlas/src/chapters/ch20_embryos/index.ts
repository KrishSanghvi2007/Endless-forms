// =============================================================================
// Chapter 20: Embryos, Heterochrony & Evo-Devo — Closing Techartist Gap #1!
// Comparative Vertebrate Embryos, Developmental Hourglass (Richardson 1997),
// Axolotl Heterochrony, Exaptation & Waddington Canalization
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  EMBRYO_TAXA,
  evaluateCanalization,
  evaluateHeterochrony,
  evaluateHourglass,
  type EmbryoStageId,
} from './embryoMath';
import { EmbryoScene3D, type EmbryoPageId } from './EmbryoScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'embryos')!;

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
    id: 'em1-hourglass',
    prompt:
      'Why does modern Evo-Devo describe vertebrate embryonic conservation as a “Developmental Hourglass” rather than Haeckel’s 19th-century “ontogeny recapitulates phylogeny”?',
    options: [
      {
        id: 'a',
        label: 'Early cleavage is actually VERY diverse (yolk-rich fish/chick vs. yolk-free mammal); vertebrate embryos converge most strongly at the mid-embryonic phylotypic stage (Hox/pharyngeal arches), and still show real heterochronic differences (Richardson et al. 1997)!',
        correct: true,
      },
      {
        id: 'b',
        label: 'Human embryos literally pass through adult fish and adult reptile stages.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Vertebrate embryos share zero homologous developmental structures.',
        correct: false,
      },
    ],
    explanation:
      'Correct! The phylotypic waist reflects deep pleiotropic constraints on conserved body-plan gene networks — never adult recapitulation!',
  },
  {
    id: 'em2-hetero',
    prompt:
      'The Mexican axolotl (Ambystoma mexicanum) reaches sexual maturity while retaining feathery larval gills and an aquatic tail fin due to reduced thyroid signalling. What Evo-Devo process is this?',
    options: [
      {
        id: 'a',
        label: 'Paedomorphosis (neoteny) — a form of heterochrony (change in the timing or rate of developmental events relative to ancestors).',
        correct: true,
      },
      {
        id: 'b',
        label: 'Horizontal gene transfer from fishes.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Pure genetic drift without any developmental pathway change.',
        correct: false,
      },
    ],
    explanation:
      'Correct! A simple shift in endocrine timing (heterochrony) produces a dramatic adult lifestyle shift — proving small developmental tweaks can yield big macroevolutionary leaps.',
  },
  {
    id: 'em3-exapt',
    prompt:
      'Fossil non-avian theropod dinosaurs possessed symmetrical downy proto-feathers long before powered bird flight evolved. What evolutionary concept explains how feathers later became aerodynamic wings?',
    options: [
      {
        id: 'a',
        label: 'Exaptation (co-option): a trait originally favoured for one function (insulation or display) is subsequently co-opted and modified for a new function (flight)!',
        correct: true,
      },
      {
        id: 'b',
        label: 'Dinosaurs planned ahead millions of years in advance for future flight.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Acquired traits learned during jumping were inherited directly.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Exaptation (Gould & Vrba 1982) solves the classic “what good is half a wing?” puzzle cleanly without teleology.',
  },
];

const PAGE_IDS: EmbryoPageId[] = ['embryos', 'hourglass', 'heterochrony', 'exaptation', 'canalization', 'check'];

export const CH20_EMBRYOS: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'embryos',
      shortLabel: '1 Embryos',
      eyebrow: 'COMPARATIVE EMBRYOLOGY · ZEBRAFISH · SALAMANDER · CHICK · HUMAN',
      heading: 'Matching four vertebrate embryos across time',
      bodyHtml: `Compare translucent 3D embryos of <strong>Zebrafish, Salamander, Chick, and Human</strong> across Early Cleavage, the conserved <strong>Phylotypic Pharyngula Stage</strong> (pharyngeal arches, somites, post-anal tail), and Late Organogenesis!`,
      promptHint: 'Step through Early → Phylotypic → Late stages to see where embryos converge — and where they genuinely differ!',
    },
    {
      id: 'hourglass',
      shortLabel: '2 Hourglass',
      eyebrow: 'RICHARDSON ET AL. (1997) · KALINKA ET AL. (2010)',
      heading: 'The developmental hourglass & honest Haeckel history',
      bodyHtml: `Ernst Haeckel’s famous 1874 drawings exaggerated early similarity to argue “ontogeny recapitulates phylogeny.” Modern Evo-Devo reveals a ${gloss('developmental_hourglass', 'developmental hourglass')}: diverse early cleavage narrows to a deeply conserved <em>Hox</em>/pharyngula waist before fanning out into adult bodies!`,
      promptHint: 'Slide the golden collar across Early, Phylotypic Waist, and Late stages to inspect transcriptome conservation!',
    },
    {
      id: 'heterochrony',
      shortLabel: '3 Axolotl',
      eyebrow: 'HETEROCHRONY · PAEDOMORPHOSIS (NEOTENY)',
      heading: 'Changing developmental clocks: the eternal larva',
      bodyHtml: `Shift one hormonal switch (thyroid signalling) and the Mexican axolotl either reproduces forever as a gilled aquatic larva (${gloss('heterochrony', 'paedomorphosis')}) or metamorphoses into a terrestrial salamander!`,
      promptHint: 'Slide Thyroid Metamorphosis Signal from 0% (Axolotl with pink feathery gills) to 100% (Terrestrial Salamander)!',
    },
    {
      id: 'exaptation',
      shortLabel: '4 Exaptation',
      eyebrow: 'GOULD & VRBA (1982) · CO-OPTION',
      heading: 'What good is half a wing? Exaptation!',
      bodyHtml: `Symmetrical downy proto-feathers evolved in non-avian dinosaurs for insulation and display — then were co-opted into asymmetric interlocking flight feathers (${gloss('exaptation', 'exaptation')}), just as reptilian jaw-joint bones became mammalian middle-ear ossicles!`,
      promptHint: 'Toggle Downy Theropod Proto-Feather vs. Asymmetric Avian Flight Feather!',
    },
    {
      id: 'canalization',
      shortLabel: '5 Waddington',
      eyebrow: 'WADDINGTON (1942) · CANALIZATION & CRYPTIC VARIATION',
      heading: 'Epigenetic valleys & Hsp90 developmental buffering',
      bodyHtml: `Chaperone networks like <strong>Hsp90</strong> carve deep valleys in ${gloss('canalization', 'Waddington’s epigenetic landscape')}, hiding cryptic genetic mutations under normal conditions — until severe stress flattens the valleys and exposes hidden heritable variation!`,
      promptHint: 'Lower Hsp90 Buffering or raise Environmental Stress to flatten the 3D valleys and unveil cryptic phenotypes!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'SYNTHESIS · PLATE 20',
      heading: 'Comparative embryology & Evo-Devo check',
      bodyHtml: `Apply the developmental hourglass, heterochrony, and exaptation to three undergraduate cases.`,
      promptHint: 'Complete all three cases to stamp Plate 20.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Evo-Devo & Comparative Embryology)',
    learningObjectives: [
      'Identify conserved vertebrate phylotypic traits (pharyngeal arches, notochord, somites, post-anal tail) while accurately critiquing Haeckel’s 1874 exaggerations (Richardson et al. 1997).',
      'Explain why the Developmental Hourglass peaks in conservation at mid-embryogenesis rather than at fertilization.',
      'Explain heterochrony and paedomorphosis using the thyroid-controlled axolotl vs. tiger salamander contrast.',
      'Explain exaptation (co-option) and Waddington’s canalization / Hsp90 cryptic genetic variation.',
    ],
    commonMisconceptions: [
      {
        misconception: '“Human embryos have fish gills and repeat adult evolutionary ancestors (ontogeny recapitulates phylogeny).”',
        correction:
          'Human embryos share homologous pharyngeal arches with fish embryos (which develop into jaws, ear bones, and throat structures — never functional fish gills); evolution modifies embryonic trajectories, not adult stages.',
      },
    ],
    discussionPrompts: [
      'Why does Hsp90 buffering let neutral “cryptic” variation accumulate silently until an environmental stress suddenly exposes new phenotypes to selection (Rutherford & Lindquist 1998)?',
    ],
    activityTip:
      'On Page 1, start at Early Cleavage first so students immediately notice how DIFFERENT yolk-rich fish/chick blastodiscs are from yolk-free human blastocysts — BEFORE stepping into the convergent Phylotypic Waist!',
  },
  scienceCard: {
    coreTakeaway:
      'Evolution builds animal diversity by modifying conserved embryonic toolkits through shifts in timing (heterochrony), co-option of old structures (exaptation), and selective release of buffered developmental variation.',
    assumptions: [
      {
        label: 'Developmental Hourglass & Richardson Critique',
        status: 'realistic',
        tag: 'Richardson et al. 1997; Kalinka et al. 2010',
        detail: 'Explicitly pairs real embryonic differences in yolk size and cleavage with transcriptomic conservation at the phylotypic waist.',
      },
      {
        label: 'Axolotl Thyroid-Triggered Metamorphosis',
        status: 'realistic',
        tag: 'Ambystoma mexicanum endocrine Evo-Devo',
        detail: 'Administering exogenous thyroxine experimentally induces adult metamorphosis in paedomorphic axolotls.',
      },
    ],
    citations: [
      {
        authors: 'Richardson, M. K. et al.',
        year: 1997,
        title: 'There is no highly conserved embryonic stage in the vertebrates: implications for current theories of evolution and development',
        journal: 'Anatomy and Embryology 196:91–106',
      },
      {
        authors: 'Kalinka, A. T. et al.',
        year: 2010,
        title: 'Gene expression divergence recapitulates the developmental hourglass model',
        journal: 'Nature 468:811–814',
      },
      {
        authors: 'Gould, S. J. & Vrba, E. S.',
        year: 1982,
        title: 'Exaptation — a missing term in the science of form',
        journal: 'Paleobiology 8:4–15',
      },
      {
        authors: 'Rutherford, S. L. & Lindquist, S.',
        year: 1998,
        title: 'Hsp90 as a capacitor for morphological evolution',
        journal: 'Nature 396:336–342',
      },
    ],
    standards: {
      undergrad: [
        'Comparative Embryology: Developmental Hourglass, Pharyngeal Arches & Critique of Recapitulation',
        'Evo-Devo Mechanisms: Heterochrony, Exaptation, Canalization & Cryptic Variation',
      ],
      apOrALevel: ['AP Bio 7.6 (Evidence of Evolution: Embryology & Developmental Homology)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="em-caption">Comparative Vertebrate Embryos — Phylotypic Stage</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="em-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="em-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="em-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="em-canvas-host"></div>
      <div class="hwe-plate-legend" id="em-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D developmental models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#em-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#em-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#em-legend') as HTMLElement;

    const scene = new EmbryoScene3D(canvasHost);
    (plateStageEl.querySelector('#em-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#em-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#em-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let stage: EmbryoStageId = 'phylotypic';
    let thyroid = 0.05;
    let flightFeather = false;
    let hsp90 = 0.85;
    let stress = 0.25;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'embryos';
      scene.setPage(pageId);

      if (pageId === 'embryos') {
        scene.updateEmbryos(EMBRYO_TAXA, stage);
        const stageTitle =
          stage === 'early'
            ? 'Early Cleavage (Yolk & Geometry Diverge!)'
            : stage === 'phylotypic'
              ? 'Phylotypic Pharyngula Stage (Conserved Hox & Arches)'
              : 'Late Organogenesis (Fins, Wings & Hands Diverge)';
        captionEl.textContent = `Zebrafish · Salamander · Chick · Human — ${stageTitle}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f0dfd1"></i>Somite Spine &amp; Tail</span>
          <span><i class="hwe-dot" style="background:#cf827a"></i>Pharyngeal Arches</span>
          <span><i class="hwe-dot" style="background:#e8c468"></i>Yolk Sac</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Embryonic Developmental Stage (Left → Right: Fish, Salamander, Chick, Human)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${stage === 'early' ? 'active' : ''}" data-es="early">1 Early</button>
                <button class="lic-pill-btn ${stage === 'phylotypic' ? 'active' : ''}" data-es="phylotypic">2 Phylotypic</button>
                <button class="lic-pill-btn ${stage === 'late' ? 'active' : ''}" data-es="late">3 Late</button>
              </div>
              <ul style="font-size:11.5px;margin:8px 0 0;padding-left:16px;color:#4a4033;line-height:1.45;">
                ${EMBRYO_TAXA.map(
                  (t) =>
                    `<li><strong>${t.name}:</strong> ${stage === 'early' ? t.earlyNote : stage === 'phylotypic' ? t.phylotypicNote : t.lateNote}</li>`
                ).join('')}
              </ul>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-es]').forEach((b) =>
          b.addEventListener('click', () => {
            stage = b.dataset.es as EmbryoStageId;
            renderPage();
          })
        );
      } else if (pageId === 'hourglass') {
        const res = evaluateHourglass(stage);
        scene.updateHourglass(stage);
        captionEl.textContent = `Hourglass Conservation = ${res.transcriptomeConservation}% · Divergence = ${res.morphDivergence}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6f9c99"></i>Morphological Divergence Width</span>
          <span><i class="hwe-dot" style="background:#d99f36"></i>Selected Embryonic Stage</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Developmental Hourglass Cross-Section</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${stage === 'early' ? 'active' : ''}" data-es2="early">Early Cleavage</button>
                <button class="lic-pill-btn ${stage === 'phylotypic' ? 'active' : ''}" data-es2="phylotypic">Phylotypic Waist</button>
                <button class="lic-pill-btn ${stage === 'late' ? 'active' : ''}" data-es2="late">Late Adult</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Gene Conservation: ${res.transcriptomeConservation}%</span>
                <span class="hwe-stat-badge">Form Divergence: ${res.morphDivergence}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.honestNote}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-es2]').forEach((b) =>
          b.addEventListener('click', () => {
            stage = b.dataset.es2 as EmbryoStageId;
            renderPage();
          })
        );
      } else if (pageId === 'heterochrony') {
        const res = evaluateHeterochrony(thyroid);
        scene.updateHeterochrony(res);
        captionEl.textContent = `Thyroid Signal = ${Math.round(thyroid * 100)}% · ${thyroid < 0.35 ? 'Paedomorphic Axolotl' : 'Metamorphosed Salamander'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d96272"></i>External Feathery Larval Gills</span>
          <span><i class="hwe-dot" style="background:#6e7a48"></i>Adult Metamorphosed Skin</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Ambystoma Developmental Timing Switch</div>
              <label class="lic-slider-label">
                <span>Thyroid Hormone Signal = <strong>${Math.round(thyroid * 100)}%</strong></span>
                <input type="range" id="em-th" min="0" max="1" step="0.05" value="${thyroid}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${thyroid < 0.3 ? 'active' : ''}" data-th="0.05">Axolotl (Paedomorph)</button>
                <button class="lic-pill-btn ${thyroid > 0.7 ? 'active' : ''}" data-th="0.95">Tiger Salamander</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>${res.stateLabel}</strong></p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#em-th') as HTMLInputElement).addEventListener('input', (e) => {
          thyroid = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-th]').forEach((b) =>
          b.addEventListener('click', () => {
            thyroid = Number(b.dataset.th);
            renderPage();
          })
        );
      } else if (pageId === 'exaptation') {
        scene.updateExaptation(flightFeather);
        captionEl.textContent = flightFeather
          ? 'Co-Opted Asymmetric Avian Flight Feather (Aerodynamic Lift)'
          : 'Ancestral Symmetrical Theropod Proto-Feather (Insulation & Display)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f0e6d2"></i>Central Rachis Quill</span>
          <span><i class="hwe-dot" style="background:${flightFeather ? '#4c7594' : '#c47243'}"></i>${flightFeather ? 'Asymmetric Interlocking Vane' : 'Symmetrical Downy Barbs'}</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Exaptation &amp; Functional Co-Option</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${!flightFeather ? 'active' : ''}" data-ff="0">Downy Proto-Feather</button>
                <button class="lic-pill-btn ${flightFeather ? 'active' : ''}" data-ff="1">Flight Feather (Co-Opted)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  flightFeather
                    ? '<strong>Asymmetric Vane (Flight):</strong> Once hooked barbules locked barbs into an asymmetric aerofoil, ancient insulating feathers were exapted for gliding and powered flight!'
                    : '<strong>Symmetrical Filament Tuft (Thermoregulation/Display):</strong> Fossil non-avian dinosaurs (e.g., <em>Sinosauropteryx</em>) evolved downy feathers for warmth &amp; signalling millions of years before birds flew!'
                }
              </p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-ff]').forEach((b) =>
          b.addEventListener('click', () => {
            flightFeather = b.dataset.ff === '1';
            renderPage();
          })
        );
      } else if (pageId === 'canalization') {
        const res = evaluateCanalization(hsp90, stress);
        scene.updateCanalization(res);
        captionEl.textContent = res.crypticRevealed
          ? 'Buffering Compromised → Cryptic Genetic Variation Exposed!'
          : 'Deep Canalization Valleys → Uniform Buffered Phenotype';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#4d8a6a"></i>Canalized Fate</span>
          <span><i class="hwe-dot" style="background:#c95244"></i>Exposed Cryptic Variants</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Waddington’s Epigenetic Landscape</div>
              <label class="lic-slider-label">
                <span>Hsp90 Buffering Strength = <strong>${Math.round(hsp90 * 100)}%</strong></span>
                <input type="range" id="em-hsp" min="0.1" max="1.0" step="0.05" value="${hsp90}" />
              </label>
              <label class="lic-slider-label">
                <span>Environmental Stress = <strong>${Math.round(stress * 100)}%</strong></span>
                <input type="range" id="em-str" min="0.0" max="1.0" step="0.05" value="${stress}" />
              </label>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  res.crypticRevealed
                    ? '<strong>Evolutionary Capacitor Released!</strong> Compromised Hsp90 flattens the developmental valleys, revealing hidden cryptic mutations that selection can now assimilate permanently!'
                    : '<strong>Canalized Development:</strong> Deep valleys buffer mild mutations so diverse genotypes still roll into the same wild-type adult phenotype.'
                }
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#em-hsp') as HTMLInputElement).addEventListener('input', (e) => {
          hsp90 = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#em-str') as HTMLInputElement).addEventListener('input', (e) => {
          stress = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate 20 — Comparative Embryology & Evo-Devo Check';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f0dfd1"></i>Pharyngula</span>
          <span><i class="hwe-dot" style="background:#6f9c99"></i>Hourglass</span>
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
          ctx.completeChapter('embryos', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the developmental evidence on the preceding 3D plate.'
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
