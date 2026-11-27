// =============================================================================
// Chapter 14: Strata, Fossils & Mass Extinctions — Deep Time, Radiometric Dating,
// Tiktaalik Transitional Stratigraphy, Whales Walking to Sea & Big Five Extinctions
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  computeRadiometric,
  DEEP_TIME_MILESTONES,
  evaluateWhaleStage,
  EXTINCTION_EVENTS,
} from './deeptimeMath';
import { DeepTimeScene3D, type DeepTimePageId } from './DeepTimeScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'deeptime')!;

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
    id: 'dt1-tiktaalik',
    prompt:
      'Neil Shubin’s team wanted to find a transitional fossil bridging lobe-finned fish (~385 Ma) and limbed tetrapods (~365 Ma). How did evolutionary theory guide where they dug?',
    options: [
      { id: 'a', label: 'They searched exposed freshwater Devonian rock strata specifically dated to ~375 Ma on Ellesmere Island—and discovered Tiktaalik roseae!', correct: true },
      { id: 'b', label: 'They randomly dug in Precambrian bedrock hoping to stumble on a mammal.', correct: false },
      { id: 'c', label: 'They used Carbon-14 dating directly on 375 Ma sandstone.', correct: false },
    ],
    explanation:
      'Correct! Predictive paleontology: Shubin, Daeschler & Jenkins (2006) targeted ~375 Ma freshwater Devonian strata in Arctic Canada and uncovered Tiktaalik with its flat skull, mobile neck, and load-bearing proto-wrist!',
  },
  {
    id: 'dt2-radio',
    prompt:
      'A paleontologist wants to date a 66-million-year-old K–Pg volcanic ash bed above a Triceratops fossil. Why CANNOT they use Carbon-14 (t½ = 5,730 yrs), and what do they use instead?',
    options: [
      { id: 'a', label: 'After ~50,000 years (<10 half-lives), virtually zero ¹⁴C remains; geologists date bracketing volcanic crystals using long-lived isotopes like ⁴⁰K/⁴⁰Ar or ²³⁸U/²⁰⁶Pb.', correct: true },
      { id: 'b', label: 'Carbon-14 only decays in ocean water, never on land.', correct: false },
      { id: 'c', label: 'Dinosaur bones contain too much Carbon-14 to measure.', correct: false },
    ],
    explanation:
      'Correct! Radiocarbon (t½ = 5,730 yr) drops below detection past ~50 ka. Deep-time strata are dated via long-lived isotopes (⁴⁰K/⁴⁰Ar, ⁴⁰Ar/³⁹Ar, U–Pb in volcanic zircons) bracketing sedimentary fossil beds.',
  },
  {
    id: 'dt3-whales',
    prompt:
      'Which combination of fossil & anatomical traits proves whales evolved from terrestrial artiodactyl (even-toed hoofed) mammals rather than fishes?',
    options: [
      { id: 'a', label: 'A continuous 12-Myr Eocene sequence (Pakicetus → Ambulocetus → Dorudon) showing the double-pulley artiodactyl ankle, migrating dorsal blowhole, and vestigial pelvic/hindlimb bones.', correct: true },
      { id: 'b', label: 'Gills, vertical tail fins, and absence of mammalian ear bones.', correct: false },
      { id: 'c', label: 'Whales appeared abruptly in the Cambrian before any land vertebrates.', correct: false },
    ],
    explanation:
      'Correct! From Pakicetus (50 Ma) to Dorudon (38 Ma) to modern whales, fossils document every step of aquatic transition—confirming molecular phylogenies placing whales sister to hippos!',
  },
];

const PAGE_IDS: DeepTimePageId[] = ['spiral', 'radio', 'tiktaalik', 'whales', 'extinction', 'check'];

export const CH14_DEEPTIME: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'spiral',
      shortLabel: '1 Deep Time',
      eyebrow: '3.8 BILLION YEARS · GEOLOGICAL SCALE',
      heading: 'Unfolding 3.8 billion years of life',
      bodyHtml: `Human intuition struggles with ${gloss('deep_time', 'deep time')}. Trace life’s milestones along this sculpted logarithmic ammonite whorl: for over <strong>85%</strong> of Earth’s biological history, life remained microscopic—and <em>Homo sapiens</em> occupies only the final hairline of the rim!`,
      promptHint: 'Select milestones from 3,800 Ma microbial origins to 0.3 Ma Homo sapiens.',
    },
    {
      id: 'radio',
      shortLabel: '2 Dating',
      eyebrow: 'RADIOMETRIC CLOCKS · ZIRCON & FELDSPAR CRYSTALS',
      heading: 'How volcanic crystals tell geologic time',
      bodyHtml: `Radioactive isotopes decay exponentially with constant half-life: <strong>N(t) = N₀ (½)^n</strong>. Compare short-range ${gloss('radiometric_dating', 'radiometric dating')} (¹⁴C for Ice-Age organics &lt; 50 ka) against deep-time volcanic ash clocks (⁴⁰K → ⁴⁰Ar in zircon/feldspar)!`,
      promptHint: 'Step half-lives 0 → 6 to watch violet parent crystals transform into amber daughters.',
    },
    {
      id: 'tiktaalik',
      shortLabel: '3 Tiktaalik',
      eyebrow: 'SHUBIN ET AL. (2006) · PREDICTIVE STRATIGRAPHY',
      heading: 'Predicting where a transitional fossil lies',
      bodyHtml: `Evolution makes falsifiable geological predictions! Knowing lobe-finned fish lived at <strong>385 Ma</strong> and limbed tetrapods at <strong>365 Ma</strong>, paleontologists searched <strong>375 Ma</strong> Devonian sandstone in Arctic Canada—and uncovered ${gloss('transitional_fossil', 'Tiktaalik roseae')} with its mobile neck and proto-wrist!`,
      promptHint: 'Excavate 385 Ma (fish) → 375 Ma (Tiktaalik proto-wrist!) → 365 Ma (polydactyl tetrapod).',
    },
    {
      id: 'whales',
      shortLabel: '4 Whales',
      eyebrow: 'EOCENE TRANSITION · PAKICETUS → BALAENOPTERA',
      heading: 'Walking back into the sea',
      bodyHtml: `Drag the live 3D osteological morph from 50 Ma terrestrial <em>Pakicetus</em> through amphibious <em>Ambulocetus</em> and pelagic <em>Dorudon</em> to a modern whale! Watch the teal nostril migrate back into a dorsal blowhole while carmine hindlimbs shrink into ${gloss('vestigial', 'vestigial')} pelvic spurs!`,
      promptHint: 'Scrub 50 Ma → 0 Ma to watch nostrils migrate and hindlimbs shrink live in 3D!',
    },
    {
      id: 'extinction',
      shortLabel: '5 Big Five',
      eyebrow: 'MASS EXTINCTIONS & ADAPTIVE RADIATIONS',
      heading: 'Global filters & ecological resets',
      bodyHtml: `Five times in the Phanerozoic, sudden planetary shocks erased &gt;75% of species in a geological instant—resetting the evolutionary chessboard! Inspect the crimson K–Pg iridium boundary seam separating extinct Mesozoic ammonites from the Paleogene ${gloss('adaptive_radiation', 'adaptive radiation')} of mammals.`,
      promptHint: 'Compare End-Permian (252 Ma), K–Pg Impact (66 Ma), and the modern crisis.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'DEEP TIME & MACROEVOLUTION MASTERY',
      heading: 'Reading the fossil archive',
      bodyHtml: `Synthesize predictive stratigraphy, radiometric half-lives, and the cetacean land-to-sea fossil sequence across three undergraduate exam cases.`,
      promptHint: 'Answer all three cases to stamp Plate 14.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Macroevolution & Paleobiology)',
    learningObjectives: [
      'Quantify the logarithmic scale of 3.8 Ga Earth history and the dominance of the microbial Precambrian.',
      'Calculate isotope parent/daughter ratios using N(t) = N₀(1/2)^n and select appropriate clocks (¹⁴C vs. K–Ar / U–Pb).',
      'Explain how evolutionary phylogenies predict the stratigraphic age and mosaic anatomy of transitional fossils (Tiktaalik).',
      'Trace the mosaic osteological steps from terrestrial Pakicetus to modern whales (nostril migration, flippers, vestigial pelvis).',
      'Distinguish background extinction from mass extinctions and explain how mass extinctions trigger adaptive radiations.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Carbon-14 is used to date dinosaur fossils.',
        correction:
          '¹⁴C (t½ = 5,730 yr) only works on organic material younger than ~50,000 years. Older fossils are bracketed by dating volcanic ash beds using ⁴⁰K/⁴⁰Ar, ⁴⁰Ar/³⁹Ar, or U–Pb.',
      },
      {
        misconception: 'Transitional fossils are mythical "half-croc, half-duck" chimeras.',
        correction:
          'Transitional fossils (like Tiktaalik or Dorudon) exhibit mosaic combinations of ancestral and derived homologous features predicted by branching phylogenies.',
      },
    ],
    discussionPrompts: [
      'Why does the fossil record show mosaic evolution—some traits (ear bones, ankle) changing before others (blowhole, fluke)—rather than all organs shifting simultaneously?',
      'Why do clades that are impeccably adapted to normal background conditions often perish during mass extinctions (non-random selectivity)?',
    ],
    activityTip:
      'On Page 4, have students pause at Dorudon (38 Ma) and explain why tiny 15 cm hind legs detached from the vertebral column are powerful evidence of terrestrial ancestry.',
  },
  scienceCard: {
    coreTakeaway:
      'Radiometrically calibrated rock strata record 3.8 billion years of branching descent, preserving predictive transitional mosaics like Tiktaalik and Eocene whales alongside rare planetary mass-extinction resets that reshape global biodiversity.',
    assumptions: [
      {
        label: 'Tiktaalik Devonian Stratigraphy',
        status: 'realistic',
        tag: 'Shubin et al. 2006',
        detail: 'Discovered in 375 Ma Fram Formation fluvial sandstones on Ellesmere Island, Nunavut, Canada.',
      },
      {
        label: 'Cetacean Eocene Sequence',
        status: 'realistic',
        tag: 'Thewissen et al. 2001; Gingerich 2001',
        detail: 'Continuous Pakistani & Egyptian fossil record documents Pakicetus, Ambulocetus, Rodhocetus, and Dorudon across ~12 Myr.',
      },
    ],
    citations: [
      {
        authors: 'Shubin, N. H., Daeschler, E. B. & Jenkins, F. A.',
        year: 2006,
        title: 'The pectoral fin of Tiktaalik roseae and the origin of the tetrapod limb',
        journal: 'Nature 440:764–771',
      },
      {
        authors: 'Thewissen, J. G. M. et al.',
        year: 2001,
        title: 'Skeletons of terrestrial cetaceans and the relationship of whales to artiodactyls',
        journal: 'Nature 413:277–281',
      },
      {
        authors: 'Alvarez, L. W. et al.',
        year: 1980,
        title: 'Extraterrestrial cause for the Cretaceous–Tertiary extinction',
        journal: 'Science 208:1095–1108',
      },
    ],
    standards: {
      undergrad: [
        'Macroevolution: Deep Time, Radiometric Stratigraphy & Transitional Fossils',
        'Mass Extinctions & Post-Extinction Adaptive Radiations',
      ],
      apOrALevel: ['AP Bio 7.6 & 7.11 (Fossil Evidence & Extinction)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="dt-caption">Ammonite Deep-Time Spiral — 3,800 Ma to Present</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="dt-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="dt-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="dt-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="dt-canvas-host"></div>
      <div class="hwe-plate-legend" id="dt-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to rotate 3D fossil &amp; osteology models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#dt-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#dt-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#dt-legend') as HTMLElement;

    const scene = new DeepTimeScene3D(canvasHost);
    (plateStageEl.querySelector('#dt-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#dt-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#dt-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let milestoneIdx = 2;
    let isotope: 'c14' | 'k40' = 'k40';
    let halfLives = 1.5;
    let tikStage: 'older_385' | 'tiktaalik_375' | 'younger_365' = 'tiktaalik_375';
    let whaleStage = 0.68;
    let extId: 'end_permian' | 'kpg' | 'anthropocene' = 'kpg';

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'spiral';
      scene.setPage(pageId);

      if (pageId === 'spiral') {
        const m = DEEP_TIME_MILESTONES[milestoneIdx]!;
        scene.updateSpiral(m.spiralFrac);
        captionEl.textContent = m.label;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c9a66b"></i>3.8 Ga Logarithmic Whorl</span>
          <span><i class="hwe-dot" style="background:#cf523e"></i>Selected Milestone (${m.maAgo} Ma)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Jump Across Earth’s 3.8 Ga Archive</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                ${DEEP_TIME_MILESTONES.map(
                  (ms, i) =>
                    `<button class="lic-pill-btn ${i === milestoneIdx ? 'active' : ''}" data-mi="${i}">${ms.maAgo} Ma</button>`
                ).join('')}
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>${m.label}:</strong> ${m.note}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-mi]').forEach((b) =>
          b.addEventListener('click', () => {
            milestoneIdx = Number((b as HTMLElement).dataset.mi);
            renderPage();
          })
        );
      } else if (pageId === 'radio') {
        const res = computeRadiometric(isotope, halfLives);
        scene.updateRadiometric(res);
        captionEl.textContent = `Volcanic Mineral Crystal Clock — ${res.ageDisplay}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#8a5ea8"></i>Parent Isotope (${(res.parentFraction * 100).toFixed(1)}%)</span>
          <span><i class="hwe-dot" style="background:#e0ad48"></i>Daughter Product (${(res.daughterFraction * 100).toFixed(1)}%)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Isotope System &amp; Half-Lives</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${isotope === 'k40' ? 'active' : ''}" data-iso="k40">⁴⁰K → ⁴⁰Ar (1.25 Ga)</button>
                <button class="lic-pill-btn ${isotope === 'c14' ? 'active' : ''}" data-iso="c14">¹⁴C → ¹⁴N (5,730 yr)</button>
              </div>
              <label style="display:block;margin-top:8px;font-size:0.84rem;">
                Half-Lives Elapsed n = <strong>${halfLives.toFixed(1)}</strong>
                <input type="range" id="dt-hl" min="0" max="5" step="0.25" value="${halfLives}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Age: ${res.ageDisplay}</span>
                <span class="hwe-stat-badge">Parent: ${(res.parentFraction * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Decay Law:</strong> N(t) = N₀(½)^n. ${res.validRange}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-iso]').forEach((b) =>
          b.addEventListener('click', () => {
            isotope = (b as HTMLElement).dataset.iso as 'c14' | 'k40';
            renderPage();
          })
        );
        leftPanelEl.querySelector('#dt-hl')?.addEventListener('input', (e) => {
          halfLives = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'tiktaalik') {
        scene.updateTiktaalik(tikStage);
        captionEl.textContent =
          tikStage === 'older_385'
            ? 'Eusthenopteron — 385 Ma Lobe-Finned Fish Stratum'
            : tikStage === 'tiktaalik_375'
              ? 'Tiktaalik roseae — 375 Ma Ellesmere Island Devonian Sandstone'
              : 'Acanthostega — 365 Ma Early Polydactyl Tetrapod Stratum';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#ebdcb9"></i>Fossilized Skeleton</span>
          <span><i class="hwe-dot" style="background:#61b8ac"></i>Pectoral Fin → Proto-Wrist → Digits</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Excavate Devonian Rock Horizon</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${tikStage === 'older_385' ? 'active' : ''}" data-tk="older_385">385 Ma — Lobe-Finned Fish (Fins, No Neck)</button>
                <button class="lic-pill-btn ${tikStage === 'tiktaalik_375' ? 'active' : ''}" data-tk="tiktaalik_375">375 Ma — Tiktaalik roseae (Flat Skull + Proto-Wrist!)</button>
                <button class="lic-pill-btn ${tikStage === 'younger_365' ? 'active' : ''}" data-tk="younger_365">365 Ma — Acanthostega (7–8 True Digits)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Predictive Paleontology:</strong> Shubin et al. (2006) predicted that a fish-to-tetrapod mosaic MUST lie in ~375 Ma freshwater Devonian strata—and found <em>Tiktaalik</em> exactly there!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-tk]').forEach((b) =>
          b.addEventListener('click', () => {
            tikStage = (b as HTMLElement).dataset.tk as 'older_385' | 'tiktaalik_375' | 'younger_365';
            renderPage();
          })
        );
      } else if (pageId === 'whales') {
        const info = evaluateWhaleStage(whaleStage);
        scene.updateWhale(whaleStage);
        captionEl.textContent = `${info.name} — ${info.maAgo}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#5eb4a8"></i>Migrating Nostril → Blowhole</span>
          <span><i class="hwe-dot" style="background:#df7d87"></i>Hindlimb → Vestigial Pelvis</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Eocene Land-to-Sea Osteology Morph</div>
              <label style="display:block;font-size:0.84rem;">
                Stage: <strong>${info.name}</strong>
                <input type="range" id="dt-wh" min="0" max="1" step="0.02" value="${whaleStage}" style="width:100%;" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:8px;">
                <button class="lic-pill-btn" data-ws="0.0">Pakicetus (50 Ma)</button>
                <button class="lic-pill-btn" data-ws="0.35">Ambulocetus (48 Ma)</button>
                <button class="lic-pill-btn" data-ws="0.68">Dorudon (38 Ma)</button>
                <button class="lic-pill-btn" data-ws="1.0">Whale (0 Ma)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Nostril:</strong> ${info.nostrilPos}. <strong>Hindlimb:</strong> ${info.hindLimbState}. ${info.note}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#dt-wh')?.addEventListener('input', (e) => {
          whaleStage = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll('[data-ws]').forEach((b) =>
          b.addEventListener('click', () => {
            whaleStage = Number((b as HTMLElement).dataset.ws);
            renderPage();
          })
        );
      } else if (pageId === 'extinction') {
        const info = EXTINCTION_EVENTS[extId];
        scene.updateExtinction(info);
        captionEl.textContent = `${info.title} (${info.maAgo}) — ~${info.marineLossPct}% Marine Species Lost`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#b59d78"></i>Pre-Impact Strata (Ammonites)</span>
          <span><i class="hwe-dot" style="background:#c94c38"></i>Iridium Boundary Seam</span>
          <span><i class="hwe-dot" style="background:#8ba38e"></i>Post-Impact Radiation</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Inspect Mass Extinction Filter</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${extId === 'end_permian' ? 'active' : ''}" data-ex="end_permian">End-Permian (252 Ma · ~90% loss)</button>
                <button class="lic-pill-btn ${extId === 'kpg' ? 'active' : ''}" data-ex="kpg">K–Pg Chicxulub (66 Ma · ~76% loss)</button>
                <button class="lic-pill-btn ${extId === 'anthropocene' ? 'active' : ''}" data-ex="anthropocene">Modern Crisis (100–1,000× rate)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Trigger:</strong> ${info.driver} <strong>Aftermath:</strong> ${info.recovery}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-ex]').forEach((b) =>
          b.addEventListener('click', () => {
            extId = (b as HTMLElement).dataset.ex as 'end_permian' | 'kpg' | 'anthropocene';
            renderPage();
          })
        );
      } else {
        captionEl.textContent = 'Plate XIV · Deep Time & Macroevolution Archive';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c9a66b"></i>Ammonite Spiral</span>
          <span><i class="hwe-dot" style="background:#ecdcb8"></i>Dorudon Skeleton</span>
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
          ctx.completeChapter('deeptime', correctCount, CHECK_CASES.length);
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
                      ? `<div class="check-feedback ${opt.correct ? 'ok' : 'bad'}">${opt.correct ? c.explanation : 'Re-check the fossil & radiometric evidence on the preceding 3D plate.'}</div>`
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
