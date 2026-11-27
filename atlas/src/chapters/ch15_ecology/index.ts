// =============================================================================
// Chapter 15: Ecology in Motion — Character Displacement, Kelp Trophic Cascade,
// MacArthur–Wilson Island Biogeography, Ideal Free Distribution & Genetic Rescue
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  evaluateCharacterDisplacement,
  evaluateConservationVortex,
  evaluateIfd,
  evaluateIslandBiogeography,
  evaluateTrophicCascade,
} from './ecologyMath';
import { EcologyScene3D, type EcologyPageId } from './EcologyScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'ecology')!;

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
    id: 'ec1-disp',
    prompt:
      'On Daphne Major during the 1977 drought (alone), Geospiza fortis evolved LARGER beaks. During the 2004 drought—after large-beaked G. magnirostris colonized the island—G. fortis evolved SMALLER beaks (Grant & Grant 2006). What process caused the reversal?',
    options: [
      { id: 'a', label: 'Ecological character displacement: competition from G. magnirostris depleted hard large seeds, shifting selection on G. fortis toward smaller beaks!', correct: true },
      { id: 'b', label: 'Pure neutral genetic drift with zero ecological selection.', correct: false },
      { id: 'c', label: 'G. fortis intentionally shrunk its beak to be polite to the newcomers.', correct: false },
    ],
    explanation:
      'Correct! Character displacement is evolutionary divergence driven by interspecific resource competition in sympatry—one of the best real-time demonstrations of eco-evolutionary dynamics.',
  },
  {
    id: 'ec2-cascade',
    prompt:
      'When fur trappers removed sea otters from Aleutian kelp forests, purple sea urchin populations exploded and cleared giant kelp beds into barren rock (Estes & Palmisano 1974). What ecological role do sea otters play?',
    options: [
      { id: 'a', label: 'A keystone predator driving a top-down trophic cascade—disproportionately structuring the entire ecosystem relative to their biomass.', correct: true },
      { id: 'b', label: 'A primary producer that photosynthesizes kelp.', correct: false },
      { id: 'c', label: 'A neutral commuter with zero indirect effect on kelp.', correct: false },
    ],
    explanation:
      'Correct! Sea otters exert an indirect positive effect on giant kelp (+ = − × −) by suppressing herbivorous sea urchins—a textbook top-down keystone trophic cascade.',
  },
  {
    id: 'ec3-island',
    prompt:
      'According to MacArthur & Wilson’s Equilibrium Theory of Island Biogeography, which island holds the HIGHEST equilibrium species richness S*, and why does species composition still change over time?',
    options: [
      { id: 'a', label: 'A LARGE island NEAR the mainland (high immigration I, low extinction E); even at equilibrium S*, continual colonization and local extinction drive species turnover!', correct: true },
      { id: 'b', label: 'A tiny remote island; once S* is reached, the exact same species stay forever with zero turnover.', correct: false },
      { id: 'c', label: 'Island size has no effect on extinction probability.', correct: false },
    ],
    explanation:
      'Correct! Large area supports larger populations (lowering extinction E), while proximity to the mainland boosts immigration I—yet equilibrium S* is dynamic, with ongoing turnover.',
  },
];

const PAGE_IDS: EcologyPageId[] = ['displacement', 'cascade', 'biogeography', 'ifd', 'vortex', 'check'];

export const CH15_ECOLOGY: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'displacement',
      shortLabel: '1 Finches',
      eyebrow: 'GRANT & GRANT (2006) · DAPHNE MAJOR',
      heading: 'Character displacement in real time',
      bodyHtml: `Evolution and ecology lock together on the Galápagos island of Daphne Major! Alone during drought, <em>Geospiza fortis</em> evolves a deeper beak—but once giant-beaked <em>G. magnirostris</em> arrives and monopolizes hard seeds, ${gloss('character_displacement', 'ecological character displacement')} drives <em>G. fortis</em> toward smaller beaks!`,
      promptHint: 'Toggle G. magnirostris Competitor & Drought to morph the sculpted finch beak live!',
    },
    {
      id: 'cascade',
      shortLabel: '2 Kelp',
      eyebrow: 'ESTES & PALMISANO (1974) · KEYSTONE PREDATORS',
      heading: 'Sea otters, urchins & kelp cascades',
      bodyHtml: `Not all species carry equal ecological weight! Slide Pacific sea otter abundance down to zero to witness a dramatic top-down ${gloss('trophic_cascade', 'trophic cascade')}: without their ${gloss('keystone_species', 'keystone predator')}, spiny purple sea urchins multiply and mow the giant kelp forest down into an urchin barren!`,
      promptHint: 'Slide sea otter density from 100% down to 0% to trigger an urchin barren.',
    },
    {
      id: 'biogeography',
      shortLabel: '3 Islands',
      eyebrow: 'MACARTHUR & WILSON (1967) · DYNAMIC TURNOVER',
      heading: 'Island biogeography & equilibrium S*',
      bodyHtml: `Why do large islands near continents host far more species than tiny remote atolls? Tune island size (lowering extinction <em>E</em>) and distance from mainland (lowering immigration <em>I</em>) to watch ${gloss('island_biogeography', 'MacArthur–Wilson equilibrium')} richness <em>S*</em> balance dynamically!`,
      promptHint: 'Resize and move the volcanic island to see colonizing songbird richness S* shift.',
    },
    {
      id: 'ifd',
      shortLabel: '4 IFD',
      eyebrow: 'FRETWELL & LUCAS (1970) · OPTIMAL FORAGING',
      heading: 'Ideal free distribution & input matching',
      bodyHtml: `When free-moving foragers choose between a rich patch and a poor patch, crowding lowers per-capita intake—so individuals distribute themselves via the ${gloss('ifd', 'Ideal Free Distribution (IFD)')} in exact proportion to food input rates!`,
      promptHint: 'Shift food share toward the Rich Patch and watch foragers rebalance to equalize intake.',
    },
    {
      id: 'vortex',
      shortLabel: '5 Rescue',
      eyebrow: 'CONSERVATION GENETICS · EXTINCTION VORTEX',
      heading: 'Breaking the extinction vortex',
      bodyHtml: `When habitat fragmentation traps a population at tiny <em>N_e</em>, inbreeding depression and genetic drift feed a downward ${gloss('extinction_vortex', 'extinction vortex')}. Open a wildlife corridor to trigger <strong>genetic rescue</strong>—just a few outbred migrants mask recessive load and rebound growth!`,
      promptHint: 'Toggle Isolated Fragment vs. Genetic Rescue Corridor.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'EVOLUTIONARY ECOLOGY MASTERY',
      heading: 'Eco-evo dynamics in the wild',
      bodyHtml: `Synthesize Galápagos character displacement, keystone trophic cascades, and MacArthur–Wilson island biogeography across three exam cases.`,
      promptHint: 'Complete all three cases to stamp Plate 15.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Evolutionary & Community Ecology)',
    learningObjectives: [
      'Distinguish directional selection in allopatry from ecological character displacement in sympatry (Grant & Grant 2006).',
      'Trace indirect positive effects in a 3-level top-down keystone trophic cascade (Otters → Urchins → Kelp).',
      'Predict equilibrium richness S* and continual species turnover from island area and isolation (MacArthur & Wilson 1967).',
      'Derive input-matching equilibrium under the Ideal Free Distribution.',
      'Explain how genetic rescue corridors reverse inbreeding depression in an extinction vortex.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Equilibrium richness S* on an island means the exact same species remain fixed forever.',
        correction:
          'MacArthur–Wilson equilibrium is dynamic: immigration rate equals extinction rate at S*, so species composition continually turns over!',
      },
      {
        misconception: 'Evolution always happens too slowly to matter for ecological dynamics.',
        correction:
          'Eco-evolutionary feedbacks (like Daphne Major finch beak displacement within 1–2 years) occur right on ecological timescales!',
      },
    ],
    discussionPrompts: [
      'Why did Killer Whale (Orca) predation shifts in the 1990s add a FOURTH trophic level above sea otters—and what sign did that produce on giant kelp?',
      'When can genetic rescue backfire via outbreeding depression (disrupting local coadapted gene complexes)?',
    ],
    activityTip:
      'On Page 1, have students compare Drought Alone vs. Drought + Competitor to see why the exact same drought drove OPPOSITE directions of beak evolution!',
  },
  scienceCard: {
    coreTakeaway:
      'Ecological interactions—competition, keystone predation, colonization–extinction balance, foraging competition, and habitat connectivity—actively steer evolutionary trajectories on real-time ecological scales.',
    assumptions: [
      {
        label: 'Daphne Major Character Displacement',
        status: 'realistic',
        tag: 'Grant & Grant 2006',
        detail: 'Four-decade longitudinal banding study recorded rapid heritable beak divergence following G. magnirostris colonization and the 2003–2004 drought.',
      },
      {
        label: 'Aleutian Kelp Forest Cascade',
        status: 'realistic',
        tag: 'Estes & Palmisano 1974',
        detail: 'Natural contrasts between otter-present and otter-absent Aleutian islands revealed complete regime shifts between kelp forests and urchin barrens.',
      },
    ],
    citations: [
      {
        authors: 'Grant, P. R. & Grant, B. R.',
        year: 2006,
        title: 'Evolution of character displacement in Darwin’s finches',
        journal: 'Science 313:224–226',
      },
      {
        authors: 'Estes, J. A. & Palmisano, J. F.',
        year: 1974,
        title: 'Sea otters: their role in structuring nearshore communities',
        journal: 'Science 185:1058–1060',
      },
      {
        authors: 'MacArthur, R. H. & Wilson, E. O.',
        year: 1967,
        title: 'The Theory of Island Biogeography',
        journal: 'Princeton University Press',
      },
    ],
    standards: {
      undergrad: [
        'Evolutionary Ecology: Character Displacement, Trophic Cascades & Island Biogeography',
        'Behavioural & Conservation Ecology: Ideal Free Distribution & Extinction Vortex',
      ],
      apOrALevel: ['AP Bio 8.5–8.7 (Community Ecology, Trophic Cascades & Biodiversity)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="ec-caption">Geospiza fortis — Daphne Major Beak Morphology</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="ec-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="ec-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="ec-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="ec-canvas-host"></div>
      <div class="hwe-plate-legend" id="ec-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D ecological models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#ec-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#ec-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#ec-legend') as HTMLElement;

    const scene = new EcologyScene3D(canvasHost);
    (plateStageEl.querySelector('#ec-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#ec-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#ec-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let competitor = true;
    let drought = true;
    let otterDens = 0.85;
    let islSize = 0.8;
    let islDist = 0.3;
    let richShare = 0.75;
    let corridor = true;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'displacement';
      scene.setPage(pageId);

      if (pageId === 'displacement') {
        const res = evaluateCharacterDisplacement(competitor, drought);
        scene.updateDisplacement(res);
        captionEl.textContent = `Geospiza fortis Beak Depth = ${res.fortisBeakMm.toFixed(1)} mm`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6b5e50"></i>G. fortis (${res.fortisBeakMm.toFixed(1)} mm)</span>
          <span><i class="hwe-dot" style="background:#3d3733"></i>G. magnirostris (${res.competitorPresent ? '15.8 mm Present' : 'Absent'})</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Daphne Major Ecological Regime</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${!competitor ? 'active' : ''}" data-cp="0">Alone (Allopatry)</button>
                <button class="lic-pill-btn ${competitor ? 'active' : ''}" data-cp="1">+ G. magnirostris</button>
                <button class="lic-pill-btn ${!drought ? 'active' : ''}" data-dr="0">Wet Season</button>
                <button class="lic-pill-btn ${drought ? 'active' : ''}" data-dr="1">Severe Drought</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">G. fortis Beak: ${res.fortisBeakMm.toFixed(1)} mm</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-cp]').forEach((b) =>
          b.addEventListener('click', () => {
            competitor = (b as HTMLElement).dataset.cp === '1';
            renderPage();
          })
        );
        leftPanelEl.querySelectorAll('[data-dr]').forEach((b) =>
          b.addEventListener('click', () => {
            drought = (b as HTMLElement).dataset.dr === '1';
            renderPage();
          })
        );
      } else if (pageId === 'cascade') {
        const res = evaluateTrophicCascade(otterDens);
        scene.updateCascade(res);
        captionEl.textContent = `Pacific Kelp Forest — Otters ${(otterDens * 100).toFixed(0)}% · Canopy ${(res.kelpCanopyHeight * 100).toFixed(0)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6e523c"></i>Keystone Sea Otter</span>
          <span><i class="hwe-dot" style="background:#6e4782"></i>Purple Sea Urchins</span>
          <span><i class="hwe-dot" style="background:#6e8c45"></i>Giant Kelp Canopy</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Keystone Sea Otter Abundance</div>
              <label style="display:block;font-size:0.84rem;">
                Sea Otters = <strong>${(otterDens * 100).toFixed(0)}%</strong>
                <input type="range" id="ec-ot" min="0" max="1" step="0.05" value="${otterDens}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Urchins: ${(res.urchinDensity * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Kelp: ${(res.kelpCanopyHeight * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.ecosystemState}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#ec-ot')?.addEventListener('input', (e) => {
          otterDens = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'biogeography') {
        const res = evaluateIslandBiogeography(islSize, islDist);
        scene.updateBiogeography(res);
        captionEl.textContent = `MacArthur–Wilson Equilibrium Richness S* = ${res.eqSpeciesS} Species`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6f8f5c"></i>Mainland Pool → Volcanic Island</span>
          <span><i class="hwe-dot" style="background:#c95c44"></i>Dynamic Colonists (S* = ${res.eqSpeciesS})</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Island Geometry &amp; Isolation</div>
              <label style="display:block;font-size:0.84rem;">
                Island Area = <strong>${(islSize * 100).toFixed(0)}%</strong> (lowers Extinction E)
                <input type="range" id="ec-sz" min="0.25" max="1.0" step="0.05" value="${islSize}" style="width:100%;" />
              </label>
              <label style="display:block;margin-top:6px;font-size:0.84rem;">
                Distance from Mainland = <strong>${(islDist * 100).toFixed(0)}%</strong> (lowers Immigration I)
                <input type="range" id="ec-di" min="0.15" max="1.0" step="0.05" value="${islDist}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Equilibrium S* = ${res.eqSpeciesS} spp.</span>
                <span class="hwe-stat-badge">Turnover: ${res.immigrationRate}/yr</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Dynamic Equilibrium:</strong> Richness balances where Immigration <em>I(S)</em> = Extinction <em>E(S)</em>, while individual species continually turn over!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#ec-sz')?.addEventListener('input', (e) => {
          islSize = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelector('#ec-di')?.addEventListener('input', (e) => {
          islDist = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'ifd') {
        const res = evaluateIfd(richShare);
        scene.updateIfd(res);
        captionEl.textContent = `Ideal Free Distribution — ${res.richForagers} Rich vs ${res.poorForagers} Poor Foragers`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#799c58"></i>Rich Patch (${(richShare * 100).toFixed(0)}% Food)</span>
          <span><i class="hwe-dot" style="background:#c2b386"></i>Poor Patch (${((1 - richShare) * 100).toFixed(0)}% Food)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Resource Input Ratio Across Patches</div>
              <label style="display:block;font-size:0.84rem;">
                Rich Patch Share = <strong>${(richShare * 100).toFixed(0)}%</strong>
                <input type="range" id="ec-rs" min="0.50" max="0.85" step="0.05" value="${richShare}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Rich Intake: ${res.intakePerForagerRich.toFixed(1)}</span>
                <span class="hwe-stat-badge">Poor Intake: ${res.intakePerForagerPoor.toFixed(1)}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Input Matching ESS:</strong> At equilibrium, per-capita intake is equalized in BOTH patches—no individual can gain by switching!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#ec-rs')?.addEventListener('input', (e) => {
          richShare = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'vortex') {
        const res = evaluateConservationVortex(corridor);
        scene.updateVortex(res);
        captionEl.textContent = corridor ? 'Wildlife Corridor Open — Genetic Rescue Active' : 'Fragmented Isolate — Extinction Vortex';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6f8f5c"></i>Habitat Patches &amp; Corridor</span>
          <span><i class="hwe-dot" style="background:#6e523c"></i>Effective Size N_e = ${res.effectiveSizeNe}</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Conservation Connectivity</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${!corridor ? 'active' : ''}" data-co="0">Isolated Fragment</button>
                <button class="lic-pill-btn ${corridor ? 'active' : ''}" data-co="1">Genetic Rescue Corridor</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Heterozygosity: ${res.heterozygosityPct}%</span>
                <span class="hwe-stat-badge">Inbreeding Load: ${(res.inbreedingLoad * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.trajectory}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-co]').forEach((b) =>
          b.addEventListener('click', () => {
            corridor = (b as HTMLElement).dataset.co === '1';
            renderPage();
          })
        );
      } else {
        captionEl.textContent = 'Plate XV · Evolutionary Ecology Museum Specimens';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#594e42"></i>Geospiza</span>
          <span><i class="hwe-dot" style="background:#6e523c"></i>Enhydra Otter</span>
          <span><i class="hwe-dot" style="background:#6e4782"></i>Purple Urchin &amp; Kelp</span>
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
          ctx.completeChapter('ecology', correctCount, CHECK_CASES.length);
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
                      ? `<div class="check-feedback ${opt.correct ? 'ok' : 'bad'}">${opt.correct ? c.explanation : 'Re-check the ecological dynamic on the preceding 3D plate.'}</div>`
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
