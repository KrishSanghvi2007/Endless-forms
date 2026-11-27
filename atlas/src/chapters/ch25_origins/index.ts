// =============================================================================
// Chapter 25: Origin of Life, Endosymbiosis & Coevolution
// 1. RNA World Ribozymes & Lipid Protocell Vesicles
// 2. Serial Endosymbiosis (Lynn Margulis 1967)
// 3. Major Evolutionary Transitions (Maynard Smith & Szathmáry 1995)
// 4. Geographic Mosaic of Coevolution (Taricha Newt vs Thamnophis Snake)
// 5. Darwin's Star Orchid (Angraecum sesquipedale) & Hawk Moth Arms Race
// 6. Capstone Check
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import { OriginsScene3D, type OriginsPageId } from './OriginsScene3D';
import {
  ENDO_STAGES,
  MAJOR_TRANSITIONS,
  RNA_STAGES,
  evaluateGeographicMosaic,
  evaluateOrchidMoth,
  type EndoStageId,
  type RnaStageId,
} from './originsMath';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'origins')!;

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
    id: 'or1-rna',
    prompt:
      'How does the RNA World hypothesis solve the origin-of-life "chicken-and-egg" paradox between DNA (which stores information but cannot catalyze reactions) and proteins (which catalyze reactions but cannot self-replicate)?',
    options: [
      {
        id: 'a',
        label: 'RNA molecules (ribozymes) perform BOTH roles simultaneously — encoding genetic sequences AND folding into 3D catalysts (still preserved in the ribosome’s RNA catalytic core today!).',
        correct: true,
      },
      {
        id: 'b',
        label: 'Because DNA spontaneously transforms into lipid bilayers without catalysis.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Because proteins store heritable nucleotide triplets inside mitochondria.',
        correct: false,
      },
    ],
    explanation:
      'Discovery of catalytic RNAs (Cech & Altman) and the RNA peptidyl-transferase active site of the ribosome strongly support an early RNA World.',
  },
  {
    id: 'or2-endo',
    prompt:
      'Which combination of evidence decisively supports Lynn Margulis’s Serial Endosymbiosis Theory for the origin of mitochondria and chloroplasts?',
    options: [
      {
        id: 'a',
        label: 'Double membranes, circular bacterial-type chromosomes, 70S ribosomes, binary fission, and phylogenetic nesting inside α-proteobacteria and cyanobacteria.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Linear eukaryotic chromosomes with histones identical to host nuclei.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Complete absence of DNA or ribosomes inside either organelle.',
        correct: false,
      },
    ],
    explanation:
      'Every independent molecular, structural, and phylogenetic signature identifies mitochondria as engulfed α-proteobacteria and chloroplasts as engulfed cyanobacteria.',
  },
  {
    id: 'or3-mosaic',
    prompt:
      'In John Thompson’s Geographic Mosaic of Coevolution, why are Vancouver Island garter snakes NOT resistant to tetrodotoxin (TTX) even though Willamette Valley snakes of the exact same species survive lethal doses?',
    options: [
      {
        id: 'a',
        label: 'Coevolutionary Coldspot: TTX resistance mutations in Nav1.4 sodium channels carry a crawling-speed cost, so where toxic newts are absent, selection removes resistance.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Vancouver Island snakes lack sodium channels in their muscles.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Coevolution always produces uniform traits across an entire continent.',
        correct: false,
      },
    ],
    explanation:
      'Selection intensity varies across space (hotspots vs. coldspots) and is linked by gene flow (trait remixing) — creating a geographic mosaic.',
  },
  {
    id: 'or4-orchid',
    prompt:
      'In 1862, Charles Darwin examined the 30 cm nectar spur of the Madagascar Star Orchid (Angraecum sesquipedale) and famously predicted an undiscovered hawk moth with a 30 cm proboscis. What reciprocal selection drove this extreme escalation?',
    options: [
      {
        id: 'a',
        label: 'Moths with longer tongues reach deeper nectar, while orchids with spurs slightly longer than the moth’s tongue force the moth’s head snugly against the anthers for pollen transfer.',
        correct: true,
      },
      {
        id: 'b',
        label: 'The orchid intentionally grew a long spur to starve every pollinator in Madagascar.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Genetic drift alone stretched both the flower and moth tongue to exactly 30 cm independently.',
        correct: false,
      },
    ],
    explanation:
      'Forty-one years later (1903), Xanthopan morganii praedicta was discovered in Madagascar — a textbook triumph of predictive coevolutionary theory!',
  },
];

const PAGE_IDS: OriginsPageId[] = ['rna', 'endosymbiosis', 'transitions', 'mosaic', 'orchid', 'check'];

export const CH25_ORIGINS: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'rna',
      shortLabel: '1 RNA World',
      eyebrow: 'ORIGIN OF LIFE · RIBOZYMES & LIPID PROTOCELLS',
      heading: 'Origin of Life, Endosymbiosis & Coevolution',
      bodyHtml: `How did Darwinian evolution ignite before DNA and enzymes existed? In the ${gloss('rna_world', 'RNA World')}, folded catalytic RNAs (<strong>ribozymes</strong>) acted as BOTH blueprint and enzyme — and fatty-acid lipid vesicles compartmentalized them into self-reproducing protocells!`,
      promptHint: 'Step through Monomers → Ribozyme Hairpin → Encapsulated Protocell below!',
    },
    {
      id: 'endosymbiosis',
      shortLabel: '2 Endosymbiosis',
      eyebrow: 'LYNN MARGULIS (1967) · SERIAL ENDOSYMBIOSIS',
      heading: 'Origin of Life, Endosymbiosis & Coevolution',
      bodyHtml: `Complex eukaryotic life was forged by symbiosis! An Asgard archaeon engulfed an aerobic α-proteobacterium (${gloss('endosymbiosis', 'mitochondria')}), and a descendant later captured a photosynthetic cyanobacterium (<strong>chloroplasts</strong>) — both retaining double membranes, 70S ribosomes &amp; circular DNA!`,
      promptHint: 'Step through Asgard Archaeon → Mitochondria → Chloroplasts to trace eukaryotic origins!',
    },
    {
      id: 'transitions',
      shortLabel: '3 Transitions',
      eyebrow: 'MAYNARD SMITH & SZATHMÁRY (1995) · MAJOR TRANSITIONS',
      heading: 'Origin of Life, Endosymbiosis & Coevolution',
      bodyHtml: `Across 3.8 billion years, formerly independent replicators united into nested higher-level ${gloss('major_transition', 'evolutionary individuals')} — from genes → chromosomes → cells → multicellular organisms → eusocial superorganisms — whenever conflict was suppressed!`,
      promptHint: 'Select each nested individuality ring below to inspect the conflict-suppression mechanism that unlocked it.',
    },
    {
      id: 'mosaic',
      shortLabel: '4 Newt & Snake',
      eyebrow: 'THOMPSON (2005) · GEOGRAPHIC MOSAIC OF COEVOLUTION',
      heading: 'Origin of Life, Endosymbiosis & Coevolution',
      bodyHtml: `Coevolution isn’t uniform across maps! In Oregon’s Willamette Valley (a <strong>hotspot</strong>), rough-skinned newts (<em>Taricha</em>) pack lethal tetrodotoxin (TTX) against resistant garter snakes (<em>Thamnophis</em>) — whereas on Vancouver Island (a <strong>coldspot</strong>), both species drop their costly arms!`,
      promptHint: 'Toggle Oregon Hotspot vs. Vancouver Island Coldspot to inspect the rough-skinned newt & garter snake!',
    },
    {
      id: 'orchid',
      shortLabel: '5 Darwin’s Orchid',
      eyebrow: 'DARWIN (1862) · COEVOLUTIONARY ARMS RACE',
      heading: 'Origin of Life, Endosymbiosis & Coevolution',
      bodyHtml: `Seeing the 30 cm nectar spur of Madagascar’s Star Orchid (<em>Angraecum sesquipedale</em>), Darwin predicted a giant hawk moth with a 30 cm tongue — discovered 41 years later! Watch reciprocal ${gloss('coevolution', 'pollinator coevolution')} lock spur length and proboscis length together!`,
      promptHint: 'Slide Orchid Spur Length and Moth Proboscis Length independently to test nectar access vs. pollen transfer!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'GRAND FINALE CAPSTONE · ORIGINS & COEVOLUTION',
      heading: 'Origin of Life, Endosymbiosis & Coevolution',
      bodyHtml: `Complete the final capstone of the 25-Plate Endless Forms Atlas across the RNA World, Serial Endosymbiosis, Geographic Mosaics, and Darwin’s Star Orchid!`,
    },
  ],
  teacherGuide: {
    estimatedMinutes: 30,
    level: 'Undergraduate Origins of Life, Symbiosis & Coevolution',
    learningObjectives: [
      'Explain how ribozymes and lipid vesicles resolve the DNA–protein paradox and initiate Darwinian selection in protocells.',
      'List the five independent lines of evidence proving serial endosymbiotic origins of mitochondria and chloroplasts.',
      'Identify the shared logic of Major Evolutionary Transitions: alignment of fitness, conflict suppression, and division of labour.',
      'Apply Thompson’s Geographic Mosaic Theory (hotspots vs. coldspots) and Darwin’s pollinator-spur arms race to empirical coevolutionary systems.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Mitochondria and chloroplasts evolved by pinching inward from the eukaryotic cell membrane.',
        correction:
          'Phylogenomics, circular bacterial genomes, 70S ribosomes, cardiolipin inner membranes, and binary fission prove they originated via engulfment of free-living α-proteobacteria and cyanobacteria.',
      },
      {
        misconception: 'Coevolutionary arms races escalate endlessly everywhere a predator and prey live.',
        correction:
          'Physiological costs (such as Nav1.4 slowing snake crawl speed) halt escalation in coldspots where one partner is benign or absent, creating a geographic mosaic.',
      },
    ],
    discussionPrompts: [
      'Why does the fact that the ribosome’s peptide-bond active site is made of RNA — not protein — act as a molecular fossil of the RNA World?',
      'Why did endosymbiotic gene transfer (EGT) from mitochondria to the host nucleus stabilize eukaryotic individuality?',
      'Why does a moth with a proboscis MUCH longer than the orchid’s spur actually reduce the orchid’s reproductive success?',
    ],
    activityTip:
      'On Page 5, have students set Spur = 15 cm and Proboscis = 32 cm to see why a too-long tongue drinks nectar without pressing the moth’s head onto the orchid’s pollen — driving selection for longer spurs!',
  },
  scienceCard: {
    coreTakeaway:
      'From self-replicating RNA ribozymes inside lipid protocells to endosymbiotic eukaryotes, major transitions in individuality, and reciprocal coevolutionary mosaics between predators, prey, flowers, and pollinators, life’s grandest innovations emerge from variation, selection, and symbiosis.',
    assumptions: [
      {
        label: 'Empirical Taricha granulosa TTX & Thamnophis sirtalis Nav1.4 mosaic',
        status: 'realistic',
        tag: 'Brodie et al. 2002',
        detail:
          'Contrasts high-TTX Willamette Valley hotspots against low-toxicity Vancouver Island coldspots documented by Brodie, Ridenhour & Brodie.',
      },
      {
        label: 'Angraecum sesquipedale / Xanthopan morganii biomechanical match model',
        status: 'simplified',
        tag: 'Nilsson 1988',
        detail:
          'Models reciprocal pollen-transfer vs. nectar-intake asymmetry (Nilsson’s spur-shortening experiments confirmed longer spurs boost pollen receipt).',
      },
    ],
    citations: [
      {
        authors: 'Margulis, L. (Sagan, L.)',
        year: 1967,
        title: 'On the origin of mitosing cells',
        journal: 'Journal of Theoretical Biology 14(3): 225–274',
      },
      {
        authors: 'Maynard Smith, J. & Szathmáry, E.',
        year: 1995,
        title: 'The Major Transitions in Evolution',
        journal: 'Oxford University Press',
      },
      {
        authors: 'Brodie, E. D. Jr., Ridenhour, B. J. & Brodie, E. D. III',
        year: 2002,
        title: 'The evolutionary response of predators to dangerous prey: hotspots and coldspots in the geographic mosaic of coevolution between garter snakes and newts',
        journal: 'Evolution 56(10): 2067–2082',
      },
      {
        authors: 'Darwin, C.',
        year: 1862,
        title: 'On the Various Contrivances by Which British and Foreign Orchids Are Fertilised by Insects',
        journal: 'John Murray, London',
      },
    ],
    standards: {
      undergrad: [
        'Origin of Life (RNA World & Protocells)',
        'Serial Endosymbiosis & Major Evolutionary Transitions',
        'Geographic Mosaic of Coevolution & Pollinator Arms Races',
      ],
      apOrALevel: [
        'AP Bio 7.13 — Origins of Life on Earth',
        'AP Bio 2.11 — Origins of Cell Compartmentalization (Endosymbiosis)',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-topbar">
        <div class="plate-caption-pill" id="or-caption">RNA World · Ribozymes &amp; Protocells</div>
        <div class="plate-tools">
          <button class="plate-tool-btn" id="or-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="or-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="or-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="or-canvas-host"></div>
      <div class="hwe-plate-legend" id="or-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D origins &amp; coevolution models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#or-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#or-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#or-legend') as HTMLElement;

    const scene = new OriginsScene3D(canvasHost);
    (plateStageEl.querySelector('#or-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoomIn());
    (plateStageEl.querySelector('#or-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoomOut());
    (plateStageEl.querySelector('#or-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let rnaStage: RnaStageId = 'protocell';
    let endoStage: EndoStageId = 'plastid';
    let transStep = 2;
    let isHotspot = true;
    let spurCm = 30;
    let proboscisCm = 30;
    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = (): void => {
      const pageId = PAGE_IDS[currentStep] ?? 'rna';
      scene.setPage(pageId);

      if (pageId === 'rna') {
        const st = RNA_STAGES[rnaStage];
        scene.updateRnaScene(rnaStage);
        captionEl.textContent = st.title;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c84d3a"></i>Catalytic Ribozyme RNA</span>
          <span><i class="hwe-dot" style="background:#dda23e"></i>Base-Pair Rungs</span>
          <span><i class="hwe-dot" style="background:#4f8699"></i>Lipid Bilayer Vesicle</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Abiogenesis &amp; RNA World Stage</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${rnaStage === 'monomers' ? 'active' : ''}" data-rn="monomers">1 Monomers</button>
                <button class="lic-pill-btn ${rnaStage === 'ribozyme' ? 'active' : ''}" data-rn="ribozyme">2 Ribozyme</button>
                <button class="lic-pill-btn ${rnaStage === 'protocell' ? 'active' : ''}" data-rn="protocell">3 Protocell</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${st.note}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-rn]').forEach((b) =>
          b.addEventListener('click', () => {
            rnaStage = b.dataset.rn as RnaStageId;
            renderPage();
          }),
        );
      } else if (pageId === 'endosymbiosis') {
        const st = ENDO_STAGES[endoStage];
        scene.updateEndosymbiosisScene(endoStage);
        captionEl.textContent = st.title;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6a557c"></i>Host Nucleus</span>
          <span><i class="hwe-dot" style="background:#c44e3a"></i>Mitochondrion (α-Proteobact.)</span>
          <span><i class="hwe-dot" style="background:#3e7d54"></i>Chloroplast (Cyanobact.)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Serial Endosymbiosis Timeline (Margulis 1967)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${endoStage === 'archaeon' ? 'active' : ''}" data-en="archaeon">1 Host</button>
                <button class="lic-pill-btn ${endoStage === 'mito' ? 'active' : ''}" data-en="mito">2 +Mito</button>
                <button class="lic-pill-btn ${endoStage === 'plastid' ? 'active' : ''}" data-en="plastid">3 +Plastid</button>
              </div>
              <ul style="font-size:11.5px;margin:8px 0 0;padding-left:16px;color:#4a4033;line-height:1.45;">
                ${st.evidence.map((e) => `<li>${e}</li>`).join('')}
              </ul>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-en]').forEach((b) =>
          b.addEventListener('click', () => {
            endoStage = b.dataset.en as EndoStageId;
            renderPage();
          }),
        );
      } else if (pageId === 'transitions') {
        const tr = MAJOR_TRANSITIONS.find((m) => m.step === transStep) ?? MAJOR_TRANSITIONS[1]!;
        scene.updateTransitionsScene(transStep);
        captionEl.textContent = `Transition ${tr.step}: ${tr.name}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#dda23e"></i>Selected Transition Level</span>
          <span><i class="hwe-dot" style="background:#49798e"></i>Nested Individuality Hierarchy</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Select Nested Individuality Transition</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                ${MAJOR_TRANSITIONS.map(
                  (m) =>
                    `<button class="lic-pill-btn ${transStep === m.step ? 'active' : ''}" data-tr="${m.step}">${m.step}. ${m.name.split('→')[1]?.trim()}</button>`,
                ).join('')}
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">${tr.lowerUnit} → ${tr.higherUnit}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Conflict Suppression:</strong> ${tr.keyMechanism}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-tr]').forEach((b) =>
          b.addEventListener('click', () => {
            transStep = Number(b.dataset.tr);
            renderPage();
          }),
        );
      } else if (pageId === 'mosaic') {
        const res = evaluateGeographicMosaic(isHotspot);
        scene.updateMosaicScene(res);
        captionEl.textContent = `${res.matchStatus} · Newt TTX = ${res.newtTtxMg} mg · Snake Resist = ${res.snakeResistance}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#e86a24"></i>Taricha Newt (TTX Warning)</span>
          <span><i class="hwe-dot" style="background:#3e6b4c"></i>Thamnophis Garter Snake</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Pacific Northwest Geographic Mosaic (Brodie et al. 2002)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${isHotspot ? 'active' : ''}" data-hs="1">Oregon Hotspot (Toxic!)</button>
                <button class="lic-pill-btn ${!isHotspot ? 'active' : ''}" data-hs="0">Vancouver Coldspot</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Newt TTX: ${res.newtTtxMg} mg</span>
                <span class="hwe-stat-badge">Snake Nav1.4 Resist: ${res.snakeResistance}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.explain}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-hs]').forEach((b) =>
          b.addEventListener('click', () => {
            isHotspot = b.dataset.hs === '1';
            renderPage();
          }),
        );
      } else if (pageId === 'orchid') {
        const res = evaluateOrchidMoth(spurCm, proboscisCm);
        scene.updateOrchidScene(res);
        captionEl.textContent = `Spur = ${spurCm} cm · Proboscis = ${proboscisCm} cm · Pollen Transfer = ${res.pollenTransfer}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f2ead8"></i>Madagascar Star Orchid</span>
          <span><i class="hwe-dot" style="background:#876c52"></i>Xanthopan Hawk Moth</span>
          <span><i class="hwe-dot" style="background:#e4b03e"></i>Pollen &amp; Deep Nectar</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Darwin’s 1862 Reciprocal Pollinator Arms Race</div>
              <label class="lic-slider-label">
                <span>Orchid Nectar Spur = <strong>${spurCm} cm</strong></span>
                <input type="range" id="or-sp" min="10" max="35" step="1" value="${spurCm}" />
              </label>
              <label class="lic-slider-label" style="margin-top:6px;">
                <span>Hawk Moth Proboscis = <strong>${proboscisCm} cm</strong></span>
                <input type="range" id="or-pr" min="10" max="35" step="1" value="${proboscisCm}" />
              </label>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">Moth Nectar: ${res.mothNectar}%</span>
                <span class="hwe-stat-badge">Orchid Pollen: ${res.pollenTransfer}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.selectionNote}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#or-sp') as HTMLInputElement).addEventListener('input', (e) => {
          spurCm = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#or-pr') as HTMLInputElement).addEventListener('input', (e) => {
          proboscisCm = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else {
        captionEl.textContent = 'Plate 25 Grand Finale · Origin of Life, Endosymbiosis & Coevolution';
        legendEl.innerHTML = `<span><i class="hwe-dot" style="background:#4f8699"></i>Endless Forms Most Beautiful</span>`;

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
          ctx.completeChapter('origins', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the origins & coevolution plates above.'
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
        scene.dispose();
      },
    };
  },
};
