import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  ANALOGY_SPECIMENS,
  BONE_REGIONS,
  CHECK_QUESTIONS,
  SPECIES_ORDER,
  TETRAPOD_SPECIES,
  type AnalogySpecimenId,
  type BoneRegionId,
  type TetrapodSpeciesId,
} from './anatomyData';
import { LimbScene3D } from './LimbScene3D';
import './limbs.css';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'limbs')!;

const SPECIES_ICONS: Record<TetrapodSpeciesId, string> = {
  human: `<svg viewBox="0 0 28 20"><path d="M5 15 L12 10 L18 7 L24 4 M18 7 L25 7 M18 7 L24 10 M18 7 L22 13 M17 7 L19 3"/></svg>`,
  bat: `<svg viewBox="0 0 28 20"><path d="M3 13 L9 10 L14 4 L25 5 M14 4 L26 9 M14 4 L22 14 M14 4 L17 17 M3 13 Q10 15 17 17"/></svg>`,
  whale: `<svg viewBox="0 0 28 20"><path d="M3 11 Q12 4 25 9 Q15 17 3 13 Z M7 11 L19 9 M11 12 L20 11"/></svg>`,
  horse: `<svg viewBox="0 0 28 20"><path d="M3 8 L10 10 L17 10 L23 11 L26 13 L25 15 L22 14 M16 10 L19 8 M16 10 L19 12"/></svg>`,
};

function gloss(id: string, label: string): string {
  return `<span class="gloss-term" tabindex="0" role="button" data-term="${id}">${label}</span>`;
}

export const CH01_LIMBS: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'human',
      shortLabel: '1 Arm',
      eyebrow: 'YOUR ARM IS A SECRET BLUEPRINT',
      heading: 'The ancestral tetrapod plan',
      bodyHtml: `Look at this 3D model of a human right arm: <strong>one</strong> upper bone (${gloss('stylopod', 'stylopod')}), <strong>two</strong> forearm bones (${gloss('zeugopod', 'zeugopod')}), a cluster of wrist bones, and <strong>five</strong> fingers (${gloss('autopod', 'autopod')}). That same ${gloss('pentadactyl', 'five-digit blueprint')} hides inside a bat’s wing, a whale’s flipper, and a horse’s leg.`,
      promptHint: 'Tap a colour row or click any bone in 3D to inspect the blueprint. Drag the plate to rotate.',
    },
    {
      id: 'bat',
      shortLabel: '2 Bat',
      eyebrow: 'STRETCHING FINGERS INTO A WING',
      heading: 'Pteropus — flight on elongated digits',
      bodyHtml: `A bat’s wing is literally a hand stretched across the sky. Digits II–V elongate dramatically to span the thin skin ${gloss('patagium', 'patagium')}, while the thumb stays free as a climbing hook. No new bones were invented—natural selection reshaped the existing ${gloss('homology', 'homologous')} parts.`,
      promptHint: 'Toggle “Soft Tissue” on the plate to see how the wing membrane stretches across fingers II–V.',
    },
    {
      id: 'whale',
      shortLabel: '3 Whale',
      eyebrow: 'FLATTENING A HAND INTO A HYDROFOIL',
      heading: 'Tursiops — locked elbow, extra finger bones',
      bodyHtml: `When ancestors of whales returned to the sea, their upper arm and forearm shrank and flattened into rigid blades. Inside the smooth flipper, all five mammalian digits persist—and digits II &amp; III add extra segments (${gloss('hyperphalangy', 'hyperphalangy')}) to stiffen the paddle.`,
      promptHint: 'Toggle “Soft Tissue” to see the five-digit mammalian hand hidden inside the streamlined flipper.',
    },
    {
      id: 'horse',
      shortLabel: '4 Horse',
      eyebrow: 'RUNNING ON A SINGLE MIDDLE FINGER',
      heading: 'Equus — digit reduction & vestigial splints',
      bodyHtml: `A horse gallops on the tip of its enlarged middle finger (digit III: the cannon bone and hoof). Digits I and V vanished over 55 million years of equid evolution, while digits II and IV remain tucked against the cannon bone as slender ${gloss('vestigial', 'vestigial')} “splint bones”.`,
      promptHint: 'Rotate the horse limb in 3D to spot the thin splint bones flanking the central cannon bone.',
    },
    {
      id: 'deep',
      shortLabel: '5 Why',
      eyebrow: 'UNDERGRADUATE DEPTH · EVO-DEVO & ANALOGY',
      heading: 'Homology vs. analogy & deep homology',
      bodyHtml: `Why do such different animals share one blueprint? Because they inherited the same embryonic ${gloss('hox', 'Hox gene')} limb-patterning circuit (${gloss('deep_homology', 'deep homology')}) from a shared ${gloss('tetrapod', 'tetrapod')} ancestor. Yet wings also show ${gloss('analogy', 'convergent evolution (analogy)')}—switch modes below to compare.`,
      promptHint: 'Compare Bat, Bird, and Insect wings—or switch on embryonic Hox expression zones.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'VISUAL MASTERY CHECK',
      heading: 'Read the bones yourself',
      bodyHtml: `Put the blueprint to the test on three real evolutionary comparisons—including clicking directly on the 3D specimens on the right page.`,
      promptHint: 'Complete all three challenges to stamp Plate 1 in your Atlas progress map.',
    },
  ],

  teacherGuide: {
    estimatedMinutes: 12,
    level: 'Undergraduate Evolution (Year 1–2) · Also accessible to AP / A-Level',
    learningObjectives: [
      'Identify the three conserved tetrapod limb segments (stylopod, zeugopod, autopod) across human, bat, cetacean, and equid forelimbs.',
      'Distinguish homology from analogy with hierarchical precision: bat and bird wings are homologous as tetrapod forelimbs, yet analogous as wings.',
      'Explain how conserved HoxA/HoxD regulatory zones and downstream enhancers (Bmp2, Fgf8, Gremlin) generate dramatic adult diversity without inventing new body plans.',
      'Recognise vestigial structures (equine splint bones MC II & IV) and hyperphalangy as historical signatures of descent with modification.',
    ],
    commonMisconceptions: [
      {
        misconception: '“Bat wings and bird wings are simply analogous (or simply homologous).”',
        correction:
          'Homology is always level-specific. As forelimbs derived from a common amniote ancestor (~315 Ma), they are homologous; as powered wings evolved independently in mammals and theropod dinosaurs, they are analogous.',
      },
      {
        misconception: '“Whales evolved flippers because they needed to swim, or horses lost toes because they didn’t use them.”',
        correction:
          'Individuals do not remodel their own heritable traits by need or disuse. Variation in limb-bud growth timing and digit patterning was differentially selected across millions of generations.',
      },
      {
        misconception: '“Vestigial means completely functionless.”',
        correction:
          'Vestigial means reduced and stripped of its ancestral primary function. Equine splint bones (MC II & IV) no longer bear ground weight via hooves, though they still help stabilise the carpus.',
      },
    ],
    discussionPrompts: [
      'If an engineer designed a human arm, bat wing, whale flipper, and horse leg from scratch, would they use the exact same 1–2–cluster–5 skeletal layout? Why does evolution work as a tinkerer rather than an engineer?',
      'Earlier Devonian tetrapods like Acanthostega had eight digits. Why do you think five digits became the upper constraint across almost all crown-group tetrapods?',
      'In Step 5, compare how a bat, bird, and dragonfly each solve lift. Which similarities trace to shared ancestry, and which to aerodynamics?',
    ],
    activityTip:
      'Project Step 1 on screen, then use the Continuous Morph Scrubber in real time while asking students to call out which colour (ochre, teal, or rose) stretches most in bats versus horses before revealing the proportion bars.',
  },

  scienceCard: {
    coreTakeaway:
      'Homologous tetrapod forelimbs preserve a shared 1–2–cluster–5 skeletal topology patterned by conserved HoxA/HoxD domains, modified by natural selection into wings, flippers, and hooves.',
    assumptions: [
      {
        label: 'Osteological Proportions',
        status: 'realistic',
        tag: 'Real data',
        detail:
          'Segment lengths and proportions match adult Homo sapiens (73 cm), Pteropus vampyrus (72 cm), Tursiops truncatus (48 cm), and Equus caballus (108 cm) from comparative vertebrate anatomy literature.',
      },
      {
        label: 'Continuous 3D Morphing',
        status: 'simplified',
        tag: 'Visual aid',
        detail:
          'Morphing directly from Human → Bat → Whale → Horse visually illustrates topological correspondence between homologous bones—it does NOT imply that bats evolved from humans or horses from whales; all four diverged from a common basal mammal (~100 Ma).',
      },
      {
        label: 'Soft-Tissue Silhouettes',
        status: 'simplified',
        tag: 'Schematic',
        detail:
          'Translucent patagium, flipper, and hoof envelopes are clean planar contours showing spatial context rather than full muscle/tendon dissections.',
      },
      {
        label: 'Avian Digit Identity',
        status: 'contested',
        tag: 'Nuance',
        detail:
          'Adult avian wing digits correspond positionally to II–III–IV in embryology, yet fossil theropod evidence aligns them with I–II–III (the “frameshift hypothesis”, Wagner & Gauthier 1999). We note this open evo-devo synthesis rather than oversimplifying.',
      },
    ],
    contestedNotes: [
      'Avian digit numbering (I–II–III from paleontology vs. II–III–IV from embryonic condensation position) is reconciled by the homeotic frameshift hypothesis (Wagner & Gauthier 1999; Tamura et al. 2011).',
    ],
    citations: [
      {
        authors: 'Owen, R.',
        year: 1849,
        title: 'On the Nature of Limbs',
        journal: 'John Van Voorst, London',
        note: 'Classic pre-Darwinian formulation of the vertebrate archetype and homology.',
      },
      {
        authors: 'Sears, K. E., Behringer, R. R., Rasweiler, J. J. & Niswander, L. A.',
        year: 2006,
        title: 'Development of bat flight: morphologic and molecular evolution of bat wing digits',
        journal: 'PNAS 103(17): 6581–6586',
        note: 'Demonstrates Bmp2 up-regulation driving bat metacarpal/phalangeal elongation.',
      },
      {
        authors: 'Cooper, L. N., Berta, A., Dawson, S. D. & Reidenberg, J. S.',
        year: 2007,
        title: 'Evolution of hyperphalangy and digit reduction in the cetacean manus',
        journal: 'Anatomical Record 290: 654–672',
      },
      {
        authors: 'Shubin, N., Tabin, C. & Carroll, S.',
        year: 2009,
        title: 'Deep homology and the origins of evolutionary novelty',
        journal: 'Nature 457: 818–823',
      },
      {
        authors: 'Kardong, K. V.',
        year: 2019,
        title: 'Vertebrates: Comparative Anatomy, Function, Evolution (8th ed.)',
        journal: 'McGraw-Hill',
      },
    ],
    standards: {
      undergrad: [
        'Comparative anatomy: homology, homoplasy/analogy, and vestigial traits',
        'Evo-devo: collinear HoxA/HoxD limb patterning and deep homology',
        'Phylogenetic interpretation: reading shared derived vs. ancestral traits',
      ],
      apOrALevel: [
        'AP Biology EVO-1.M / EVO-2.B: Morphological homologies & common ancestry',
        'UK A-Level Biology: Evidence for evolution & comparative anatomy',
        'NGSS MS-LS4-2 / HS-LS4-1: Anatomical similarities across species',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    // 1. Build the Right-Page Interactive 3D Plate chrome
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <div class="plate-caption-pill">
          <span class="plate-caption-text" data-plate-caption></span>
          <span class="plate-scale-bar">
            <span class="plate-scale-rule"></span>
            <span data-plate-scale>5 cm</span>
          </span>
        </div>

        <div class="plate-view-tools">
          <button type="button" class="plate-tool-btn" data-toggle-tissue title="Show translucent living limb outline">
            Soft Tissue
          </button>
          <button type="button" class="plate-tool-btn" data-toggle-hox title="Highlight embryonic Hox gene zones">
            Hox Zones
          </button>
          <button type="button" class="plate-tool-btn" data-reset-view title="Reset 3D camera angle">
            Reset 3D
          </button>
        </div>
      </div>

      <div class="plate-canvas-host" data-canvas-host></div>

      <div class="plate-bone-callout is-hidden" data-bone-callout>
        <div class="callout-top">
          <span class="callout-name" data-callout-name></span>
          <span class="callout-stat" data-callout-stat></span>
        </div>
        <div class="callout-desc" data-callout-desc></div>
      </div>

      <div class="plate-orbit-hint">Drag to rotate 3D · Scroll to zoom · Tap bones</div>

      <div class="plate-specimen-tray" data-specimen-tray>
        ${SPECIES_ORDER.map((id) => {
          const sp = TETRAPOD_SPECIES[id];
          return `
            <button type="button" class="specimen-chip" data-pick-species="${id}">
              ${SPECIES_ICONS[id]}
              <span class="specimen-chip-label">
                <span class="specimen-chip-name">${sp.commonName}</span>
                <span class="specimen-chip-sub">${sp.totalCm} cm</span>
              </span>
            </button>
          `;
        }).join('')}
      </div>
    `;

    const captionEl = plateStageEl.querySelector<HTMLElement>('[data-plate-caption]')!;
    const scaleEl = plateStageEl.querySelector<HTMLElement>('[data-plate-scale]')!;
    const canvasHost = plateStageEl.querySelector<HTMLElement>('[data-canvas-host]')!;
    const calloutEl = plateStageEl.querySelector<HTMLElement>('[data-bone-callout]')!;
    const calloutNameEl = plateStageEl.querySelector<HTMLElement>('[data-callout-name]')!;
    const calloutStatEl = plateStageEl.querySelector<HTMLElement>('[data-callout-stat]')!;
    const calloutDescEl = plateStageEl.querySelector<HTMLElement>('[data-callout-desc]')!;
    const tissueBtn = plateStageEl.querySelector<HTMLButtonElement>('[data-toggle-tissue]')!;
    const hoxBtn = plateStageEl.querySelector<HTMLButtonElement>('[data-toggle-hox]')!;
    const resetBtn = plateStageEl.querySelector<HTMLButtonElement>('[data-reset-view]')!;
    const specimenTrayEl = plateStageEl.querySelector<HTMLElement>('[data-specimen-tray]')!;

    // Local chapter UI state
    let activeSpecies: TetrapodSpeciesId = 'human';
    let selectedRegion: BoneRegionId | null = null;
    let showTissue = false;
    let showHox = false;
    let currentStep = 0;

    // Step 5 state
    let deepSubMode: 'analogy' | 'hox' = 'analogy';
    let analogySpecimen: AnalogySpecimenId = 'bat';

    // Step 6 check state
    let checkIndex = 0;
    let checkScore = 0;
    let checkAnswered = false;
    let checkFeedback: { good: boolean; text: string } | null = null;
    let checkFinished = ctx.isChapterComplete('limbs');

    // Mount Three.js 3D specimen scene
    const scene3d = new LimbScene3D(canvasHost, {
      onSelectRegion: (region) => {
        if (currentStep === 5 && !checkFinished) {
          handleCheckBoneClick(region);
          return;
        }
        selectedRegion = region;
        updateBoneCallout();
        if (currentStep <= 3) {
          renderSpeciesLeftPanel();
        }
      },
    });

    const updatePlateHeader = (caption: string, scaleLabel: string) => {
      captionEl.textContent = caption;
      scaleEl.textContent = scaleLabel;
    };

    const updateTrayActive = () => {
      specimenTrayEl.style.display = currentStep <= 3 ? 'flex' : 'none';
      specimenTrayEl.querySelectorAll<HTMLButtonElement>('[data-pick-species]').forEach((btn) => {
        btn.classList.toggle('is-active', btn.dataset.pickSpecies === activeSpecies);
      });
    };

    const updateBoneCallout = () => {
      if (!selectedRegion || currentStep >= 4) {
        calloutEl.classList.add('is-hidden');
        return;
      }
      const sp = TETRAPOD_SPECIES[activeSpecies];
      const reg = BONE_REGIONS.find((b) => b.id === selectedRegion)!;
      calloutEl.style.setProperty('--callout-color', reg.colorHex);
      calloutNameEl.textContent = showHox ? `${reg.name} · ${reg.hoxDomain}` : reg.name;
      calloutStatEl.textContent = `${sp.cm[selectedRegion]} cm (${sp.pct[selectedRegion]}%)`;
      calloutDescEl.textContent = showHox ? reg.hoxNote : sp.regionNotes[selectedRegion];
      calloutEl.classList.remove('is-hidden');
    };

    const setTissue = (on: boolean) => {
      showTissue = on;
      tissueBtn.classList.toggle('is-on', on);
      scene3d.setShowTissue(on);
    };

    const setHox = (on: boolean) => {
      showHox = on;
      hoxBtn.classList.toggle('is-on', on);
      scene3d.setShowHox(on);
      updateBoneCallout();
    };

    const selectSpecies = (species: TetrapodSpeciesId, syncStep = false) => {
      activeSpecies = species;
      const sp = TETRAPOD_SPECIES[species];
      scene3d.setSpecies(species);
      updatePlateHeader(sp.plateCaption, sp.scaleLabel);
      updateTrayActive();
      updateBoneCallout();
      if (syncStep) {
        const idx = SPECIES_ORDER.indexOf(species);
        if (idx >= 0 && idx !== currentStep) {
          ctx.goToStep(idx);
          return;
        }
      }
      if (currentStep <= 3) renderSpeciesLeftPanel();
    };

    // Wire plate top & bottom buttons
    tissueBtn.addEventListener('click', () => setTissue(!showTissue));
    hoxBtn.addEventListener('click', () => setHox(!showHox));
    resetBtn.addEventListener('click', () => scene3d.resetView());

    specimenTrayEl.querySelectorAll<HTMLButtonElement>('[data-pick-species]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sp = btn.dataset.pickSpecies as TetrapodSpeciesId;
        selectSpecies(sp, true);
      });
    });

    // =========================================================================
    // LEFT-PAGE DYNAMIC RENDERERS
    // =========================================================================

    function renderSpeciesLeftPanel(): void {
      const sp = TETRAPOD_SPECIES[activeSpecies];
      const morphVal = SPECIES_ORDER.indexOf(activeSpecies);

      const legendRows = BONE_REGIONS.map((reg) => {
        const isSel = selectedRegion === reg.id;
        return `
          <button
            type="button"
            class="bone-row ${isSel ? 'is-selected' : ''}"
            style="--row-color:${reg.colorHex};"
            data-select-region="${reg.id}"
          >
            <span
              class="bone-swatch"
              style="--swatch-light:${reg.swatchLight}; --swatch-mid:${reg.swatchMid}; --swatch-dark:${reg.swatchDark};"
            ></span>
            <span class="bone-row-label">
              <span class="bone-row-name">${reg.name}</span>
              <span class="bone-row-sub">${showHox ? reg.hoxDomain : reg.anatomicalTerm}</span>
            </span>
            <span class="bone-row-cm">${sp.cm[reg.id]} cm</span>
          </button>
        `;
      }).join('');

      const selectedInfo = selectedRegion
        ? (() => {
            const reg = BONE_REGIONS.find((b) => b.id === selectedRegion)!;
            return `
              <div class="bone-inspector-note" style="--note-color:${reg.colorHex};">
                <strong>${reg.name} in ${sp.commonName}:</strong> ${
                  showHox ? reg.hoxNote : sp.regionNotes[selectedRegion]
                }
              </div>
            `;
          })()
        : '';

      const compareRows = SPECIES_ORDER.map((id) => {
        const rowSp = TETRAPOD_SPECIES[id];
        return `
          <div class="prop-compare-row ${id === activeSpecies ? 'is-active' : ''}">
            <span>${rowSp.commonName}</span>
            <div class="prop-bar-mini" title="${rowSp.commonName}: ${rowSp.pct.stylopod}% / ${rowSp.pct.zeugopod}% / ${rowSp.pct.autopod}%">
              <span style="width:${rowSp.pct.stylopod}%; background:#d4942a;"></span>
              <span style="width:${rowSp.pct.zeugopod}%; background:#2d8a7e;"></span>
              <span style="width:${rowSp.pct.autopod}%; background:#c74b5b;"></span>
            </div>
          </div>
        `;
      }).join('');

      leftPanelEl.innerHTML = `
        <div class="bone-legend">${legendRows}</div>
        ${selectedInfo}

        <div class="proportion-card">
          <div class="proportion-title">Share of the limb’s length</div>
          <div class="prop-bar-primary">
            <div class="prop-seg stylopod" style="width:${sp.pct.stylopod}%;">${sp.pct.stylopod}%</div>
            <div class="prop-seg zeugopod" style="width:${sp.pct.zeugopod}%;">${sp.pct.zeugopod}%</div>
            <div class="prop-seg autopod" style="width:${sp.pct.autopod}%;">${sp.pct.autopod}%</div>
          </div>
          <div class="prop-compare-list">${compareRows}</div>
          <div class="prop-total-line">
            Shoulder to tip, real adult size: <strong>${sp.totalCm} cm</strong>
          </div>
        </div>

        <div class="morph-scrubber-box">
          <div class="morph-scrubber-head">
            <span>Live 3D Skeleton Morph</span>
            <span data-morph-label>${sp.commonName}</span>
          </div>
          <input
            type="range"
            class="morph-range"
            min="0"
            max="3"
            step="0.01"
            value="${morphVal}"
            data-morph-slider
            aria-label="Continuously morph 3D skeleton between human, bat, whale, and horse"
          />
          <div class="morph-ticks">
            <span>Human</span>
            <span>Bat</span>
            <span>Whale</span>
            <span>Horse</span>
          </div>
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-select-region]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const reg = btn.dataset.selectRegion as BoneRegionId;
          selectedRegion = selectedRegion === reg ? null : reg;
          scene3d.setSelectedRegion(selectedRegion);
          updateBoneCallout();
          renderSpeciesLeftPanel();
        });
      });

      const slider = leftPanelEl.querySelector<HTMLInputElement>('[data-morph-slider]')!;
      const morphLabel = leftPanelEl.querySelector<HTMLElement>('[data-morph-label]')!;
      slider.addEventListener('input', () => {
        const v = parseFloat(slider.value);
        scene3d.setContinuousMorph(v);
        const nearestIdx = Math.round(v);
        const nearest = SPECIES_ORDER[nearestIdx];
        if (Math.abs(v - nearestIdx) < 0.08) {
          morphLabel.textContent = TETRAPOD_SPECIES[nearest].commonName;
        } else {
          const lo = SPECIES_ORDER[Math.floor(v)];
          const hi = SPECIES_ORDER[Math.min(3, Math.floor(v) + 1)];
          morphLabel.textContent = `${TETRAPOD_SPECIES[lo].commonName} ↔ ${TETRAPOD_SPECIES[hi].commonName}`;
        }
      });
    }

    function renderDeepHomologyLeftPanel(): void {
      if (deepSubMode === 'analogy') {
        const info = ANALOGY_SPECIMENS[analogySpecimen];
        scene3d.setAnalogySpecimen(analogySpecimen);
        setHox(false);
        updatePlateHeader(info.caption, analogySpecimen === 'insect' ? '1 cm' : '5 cm');

        leftPanelEl.innerHTML = `
          <div class="deep-mode-tabs">
            <button type="button" class="deep-mode-btn is-active" data-deep-mode="analogy">
              Homology vs. Analogy
            </button>
            <button type="button" class="deep-mode-btn" data-deep-mode="hox">
              Deep Homology (Hox)
            </button>
          </div>

          <div class="analogy-grid">
            ${(['bat', 'bird', 'insect'] as AnalogySpecimenId[])
              .map((id) => {
                const a = ANALOGY_SPECIMENS[id];
                return `
                  <button type="button" class="analogy-card ${id === analogySpecimen ? 'is-active' : ''}" data-analogy-id="${id}">
                    <div class="analogy-card-title">${a.name}</div>
                    <div class="analogy-card-tag">${a.latin.split('·')[1].trim()}</div>
                  </button>
                `;
              })
              .join('')}
          </div>

          <div class="bone-inspector-note" style="--note-color: var(--accent);">
            <div style="font-family:var(--font-mono); font-size:10px; text-transform:uppercase; color:var(--accent); margin-bottom:3px;">
              ${info.homologyBadge}
            </div>
            <strong>${info.verdict}</strong>
            <div style="margin-top:4px;">${info.detail}</div>
          </div>
        `;
      } else {
        scene3d.setSpecies(activeSpecies);
        setHox(true);
        const sp = TETRAPOD_SPECIES[activeSpecies];
        updatePlateHeader(`${sp.commonName} forelimb — embryonic Hox expression domains`, sp.scaleLabel);

        leftPanelEl.innerHTML = `
          <div class="deep-mode-tabs">
            <button type="button" class="deep-mode-btn" data-deep-mode="analogy">
              Homology vs. Analogy
            </button>
            <button type="button" class="deep-mode-btn is-active" data-deep-mode="hox">
              Deep Homology (Hox)
            </button>
          </div>

          <div class="hox-table">
            ${BONE_REGIONS.map(
              (r) => `
                <div class="hox-row" style="--hox-col:${r.colorHex};">
                  <div class="hox-gene">${r.hoxDomain}</div>
                  <div><strong>${r.name}:</strong> ${r.hoxNote}</div>
                </div>
              `
            ).join('')}
          </div>

          <div class="bone-inspector-note" style="--note-color:#2d8a7e;">
            <strong>Evo-devo note (${sp.commonName}):</strong> ${sp.evoDevoNote}
          </div>
        `;
      }

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-deep-mode]').forEach((btn) => {
        btn.addEventListener('click', () => {
          deepSubMode = btn.dataset.deepMode as 'analogy' | 'hox';
          renderDeepHomologyLeftPanel();
        });
      });

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-analogy-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          analogySpecimen = btn.dataset.analogyId as AnalogySpecimenId;
          renderDeepHomologyLeftPanel();
        });
      });
    }

    function handleCheckBoneClick(region: BoneRegionId | null): void {
      if (checkAnswered || !region) return;
      const q = CHECK_QUESTIONS[checkIndex];
      if (q.mode !== 'click-bone') return;

      checkAnswered = true;
      const isRight = region === q.targetRegion;
      if (isRight) checkScore += 1;
      const tappedName = BONE_REGIONS.find((b) => b.id === region)?.name ?? region;
      checkFeedback = {
        good: isRight,
        text: isRight
          ? q.explanation
          : `You tapped ${tappedName}. ${q.explanation}`,
      };
      scene3d.setSelectedRegion(q.targetRegion ?? region);
      renderCheckLeftPanel();
    }

    function setupCheckQuestionScene(): void {
      const q = CHECK_QUESTIONS[checkIndex];
      scene3d.setSelectedRegion(null);
      setHox(false);
      if (q.species === 'bird' || q.species === 'insect') {
        scene3d.setAnalogySpecimen(q.species);
        updatePlateHeader(ANALOGY_SPECIMENS[q.species].caption, '5 cm');
      } else {
        scene3d.setSpecies(q.species);
        setTissue(q.species === 'bat' || q.species === 'whale');
        updatePlateHeader(
          TETRAPOD_SPECIES[q.species].plateCaption,
          TETRAPOD_SPECIES[q.species].scaleLabel
        );
      }
    }

    function renderCheckLeftPanel(): void {
      if (checkFinished) {
        leftPanelEl.innerHTML = `
          <div class="check-card" style="border-left: 4px solid #2d8a7e;">
            <div class="check-progress">
              <span>PLATE 1 COMPLETE</span>
              <span>✓ STAMPED IN ATLAS</span>
            </div>
            <h3 class="check-question">You traced the tetrapod blueprint!</h3>
            <p style="margin:0; font-size:14px; color:var(--ink-body);">
              Plate 1 (<em>Same bones, different lives</em>) is now marked complete in your Atlas progress map and Naturalist Certificate.
              Feel free to keep exploring any species in 3D or open the <strong>Model &amp; Science</strong> card for primary references.
            </p>
            <div style="display:flex; gap:8px; margin-top:4px;">
              <button type="button" class="util-pill" data-redo-check>Retake Check</button>
              <button type="button" class="util-pill" data-back-arm>Back to 3D Explorer</button>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('[data-redo-check]')?.addEventListener('click', () => {
          checkIndex = 0;
          checkScore = 0;
          checkAnswered = false;
          checkFeedback = null;
          checkFinished = false;
          setupCheckQuestionScene();
          renderCheckLeftPanel();
        });
        leftPanelEl.querySelector('[data-back-arm]')?.addEventListener('click', () => {
          ctx.goToStep(0);
        });
        return;
      }

      const q = CHECK_QUESTIONS[checkIndex];
      const interactionArea =
        q.mode === 'click-bone'
          ? `
            <div class="prompt-strip" style="margin-bottom:0;">
              <span class="prompt-strip-star">☞</span>
              <span>Click directly on the matching coloured bone region on the 3D specimen plate to the right.</span>
            </div>
          `
          : `
            <div class="check-options">
              ${(q.options ?? [])
                .map(
                  (opt) => `
                    <button
                      type="button"
                      class="check-opt-btn ${
                        checkAnswered
                          ? opt.correct
                            ? 'is-correct'
                            : ''
                          : ''
                      }"
                      data-opt-id="${opt.id}"
                      ${checkAnswered ? 'disabled' : ''}
                    >
                      ${opt.label}
                    </button>
                  `
                )
                .join('')}
            </div>
          `;

      leftPanelEl.innerHTML = `
        <div class="check-card">
          <div class="check-progress">
            <span>CHALLENGE ${checkIndex + 1} OF ${CHECK_QUESTIONS.length}</span>
            <span>SCORE ${checkScore}/${CHECK_QUESTIONS.length}</span>
          </div>
          <h3 class="check-question">${q.prompt}</h3>
          ${interactionArea}
          ${
            checkFeedback
              ? `<div class="check-feedback ${checkFeedback.good ? 'good' : ''}">${checkFeedback.text}</div>`
              : ''
          }
          ${
            checkAnswered
              ? `<div style="display:flex; justify-content:flex-end;">
                   <button type="button" class="btn-step-next" data-next-q>
                     ${checkIndex + 1 < CHECK_QUESTIONS.length ? 'Next Challenge →' : 'Stamp Plate Complete ✓'}
                   </button>
                 </div>`
              : ''
          }
        </div>
      `;

      leftPanelEl.querySelectorAll<HTMLButtonElement>('[data-opt-id]').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (checkAnswered) return;
          const opt = (q.options ?? []).find((o) => o.id === btn.dataset.optId);
          if (!opt) return;
          checkAnswered = true;
          if (opt.correct) checkScore += 1;
          else btn.classList.add('is-wrong');
          checkFeedback = {
            good: opt.correct,
            text: q.explanation,
          };
          renderCheckLeftPanel();
        });
      });

      leftPanelEl.querySelector('[data-next-q]')?.addEventListener('click', () => {
        if (checkIndex + 1 < CHECK_QUESTIONS.length) {
          checkIndex += 1;
          checkAnswered = false;
          checkFeedback = null;
          setupCheckQuestionScene();
          renderCheckLeftPanel();
        } else {
          checkFinished = true;
          ctx.completeChapter('limbs', checkScore, CHECK_QUESTIONS.length);
          renderCheckLeftPanel();
        }
      });
    }

    // =========================================================================
    // STEP LIFECYCLE
    // =========================================================================

    const onStepChange = (stepIndex: number) => {
      currentStep = stepIndex;
      selectedRegion = null;
      scene3d.setSelectedRegion(null);
      updateBoneCallout();

      if (stepIndex <= 3) {
        const sp = SPECIES_ORDER[stepIndex];
        setHox(false);
        // Subtle soft-tissue helper default: off for Human so pure osteology shines,
        // user can toggle on for Bat/Whale/Horse (or auto-enable on Bat/Whale? Let's keep bones crisp by default & make Soft Tissue one click away!)
        setTissue(false);
        selectSpecies(sp, false);
        tissueBtn.style.display = 'inline-flex';
        hoxBtn.style.display = 'inline-flex';
      } else if (stepIndex === 4) {
        updateTrayActive();
        tissueBtn.style.display = 'none';
        hoxBtn.style.display = 'none';
        renderDeepHomologyLeftPanel();
      } else if (stepIndex === 5) {
        updateTrayActive();
        tissueBtn.style.display = 'inline-flex';
        hoxBtn.style.display = 'none';
        if (!checkFinished) {
          setupCheckQuestionScene();
        }
        renderCheckLeftPanel();
      }
    };

    return {
      onStepChange,
      onResize: () => scene3d.resize(),
      destroy: () => scene3d.destroy(),
    };
  },
};
