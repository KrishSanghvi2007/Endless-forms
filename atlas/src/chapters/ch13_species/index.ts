// =============================================================================
// Chapter 13: Splitting Branches — Ring Species, Dobzhansky–Muller
// Incompatibilities, Sympatric Host Shifts, Reinforcement & Polyploidy
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  evaluateDmi,
  evaluateHostShift,
  evaluatePolyploidy,
  evaluateReinforcement,
  evaluateRingSpecies,
  type DmiGenotype,
  type PloidyStep,
} from './speciesMath';
import { SpeciesScene3D, type SpeciesPageId } from './SpeciesScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'species')!;

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
    id: 'sp1-dmi',
    prompt:
      'Two isolated populations evolve from ancestor aabb to AAbb and aaBB without either lineage ever experiencing reduced fitness. Yet when they meet, their AaBb hybrids are inviable. Why?',
    options: [
      { id: 'a', label: 'A Bateson–Dobzhansky–Muller incompatibility: derived alleles A and B were never tested together by selection and clash epistatically inside the hybrid.', correct: true },
      { id: 'b', label: 'Both populations had to cross a lethal fitness valley during allopatry.', correct: false },
      { id: 'c', label: 'Natural selection deliberately created hybrid sterility so the two groups could become new species.', correct: false },
    ],
    explanation:
      'Correct! The BDM model solves Darwin’s puzzle of hybrid sterility: each derived allele works smoothly in its own genetic background (A with b; B with a), and intrinsic postzygotic isolation emerges as an incidental epistatic clash when A meets B.',
  },
  {
    id: 'sp2-reinforce',
    prompt:
      'Where should you observe the STRONGEST divergence in mating calls or flower colour between two closely related sister species if reinforcement has occurred?',
    options: [
      { id: 'a', label: 'In allopatric zones where the two species never encounter each other.', correct: false },
      { id: 'b', label: 'In sympatric contact zones where hybrids have low fitness, creating direct selection against wasted heterospecific matings (reproductive character displacement).', correct: true },
      { id: 'c', label: 'Only when hybrids are MORE fertile than both parent species.', correct: false },
    ],
    explanation:
      'Correct! Reinforcement strengthens prezygotic mate discrimination specifically in sympatry whenever hybrid offspring suffer reduced fitness (Coyne & Orr 2004).',
  },
  {
    id: 'sp3-polyploid',
    prompt:
      'In Washington State during the 1940s, two introduced diploid goatsbeards (Tragopogon dubius and T. pratensis, 2n = 12) hybridized and doubled their chromosomes to form Tragopogon miscellus (4n = 24). Why is this instant sympatric speciation?',
    options: [
      { id: 'a', label: 'The 4n tetraploid has homologous pairs (AABB) for fertile meiosis, yet backcrosses with either 2n parent yield sterile 3n triploids—creating immediate reproductive isolation in one generation!', correct: true },
      { id: 'b', label: 'The tetraploid plants migrated to a separate continent before becoming isolated.', correct: false },
      { id: 'c', label: 'Tetraploid plants can freely interbreed with diploid parents to produce fertile 3n offspring.', correct: false },
    ],
    explanation:
      'Correct! Allopolyploidy (Ownbey 1950) restores normal bivalent pairing inside the new tetraploid while triploid block isolates it immediately from both diploid ancestors in sympatry.',
  },
];

const PAGE_IDS: SpeciesPageId[] = ['ring', 'dmi', 'hostshift', 'reinforcement', 'polyploidy', 'check'];

export const CH13_SPECIES: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'ring',
      shortLabel: '1 Ring',
      eyebrow: 'IRWIN ET AL. (2001) · TIBETAN PLATEAU',
      heading: 'A chain of neighbours that closes into two species',
      bodyHtml: `Around the arid Tibetan Plateau, Greenish Warblers (<em>Phylloscopus trochiloides</em>) spread westward and eastward in a continuous ${gloss('ring_species', 'ring species')}. Neighbouring populations interbreed seamlessly—yet where western <em>viridanus</em> (1 wing bar) meets eastern <em>plumbeitarsus</em> (2 wing bars) in Siberia, their songs have diverged so far they behave as two distinct species!`,
      promptHint: 'Slide from the Himalayan origin (0%) northward to Siberian secondary contact (100%).',
    },
    {
      id: 'dmi',
      shortLabel: '2 BDM Clash',
      eyebrow: 'DOBZHANSKY–MULLER INCOMPATIBILITIES',
      heading: 'How hybrid sterility evolves without crossing a valley',
      bodyHtml: `How can natural selection produce sterile hybrids if it never favours sterility? Inspect these sculpted 3D interacting proteins: in a ${gloss('bdm_incompatibility', 'Dobzhansky–Muller incompatibility')}, <em>AAbb</em> and <em>aaBB</em> evolve smoothly along high-fitness ridges—only crashing when derived <em>A</em> and <em>B</em> meet for the first time in <em>AaBb</em> hybrids!`,
      promptHint: 'Inspect ancestral aabb, derived AAbb & aaBB, and the clashing hybrid AaBb.',
    },
    {
      id: 'hostshift',
      shortLabel: '3 Host Shift',
      eyebrow: 'FEDER ET AL. (1988) · SYMPATRIC SPECIATION',
      heading: 'Splitting without a mountain range',
      bodyHtml: `When domesticated apples were introduced to North America ~1850, some native hawthorn flies (<em>Rhagoletis pomonella</em>) shifted onto apples that fruit 3–4 weeks earlier. Slide the fruiting gap to see how temporal host fidelity drives ${gloss('sympatric_speciation', 'sympatric divergence')} even without a geographic barrier!`,
      promptHint: 'Widen the seasonal fruiting gap between Apple (Aug) and Hawthorn (Oct).',
    },
    {
      id: 'reinforcement',
      shortLabel: '4 Reinforce',
      eyebrow: 'REPRODUCTIVE CHARACTER DISPLACEMENT',
      heading: 'Sharpening courtship signals in sympatry',
      bodyHtml: `When diverged lineages reconnect and hybrids have low fitness, individuals that mate with the wrong species waste reproductive effort. ${gloss('reinforcement', 'Reinforcement')} drives plumage and song signals dramatically farther apart in sympatry than in allopatry!`,
      promptHint: 'Toggle Allopatry vs. Sympatry and lower hybrid fitness to watch plumage diverge.',
    },
    {
      id: 'polyploidy',
      shortLabel: '5 Polyploidy',
      eyebrow: 'OWNBEY (1950) · TRAGOPOGON MISCELLUS',
      heading: 'Instant speciation in a single generation',
      bodyHtml: `In flowering plants, speciation need not take millennia! Watch diploid <em>Tragopogon dubius</em> (2n = 12) and <em>T. pratensis</em> (2n = 12) form a sterile F₁ hybrid whose whole-genome doubling yields the giant fertile ${gloss('allopolyploidy', 'allopolyploid')} <em>T. miscellus</em> (4n = 24)—reproductively isolated overnight!`,
      promptHint: 'Step from Diploid Parents → Sterile F₁ → Giant Tetraploid T. miscellus (4n = 24).',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'SPECIATION & HYBRIDIZATION MASTERY',
      heading: 'How one lineage becomes two',
      bodyHtml: `Diagnose Dobzhansky–Muller epistasis, sympatric reinforcement, and instant allopolyploid isolation across three undergraduate exam cases.`,
      promptHint: 'Answer all three cases to stamp Plate 13.',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Evolutionary Biology & Speciation)',
    learningObjectives: [
      'Explain how ring species illustrate the continuous spectrum from geographic clines to biological species.',
      'Diagram a two-locus Bateson–Dobzhansky–Muller incompatibility without crossing any fitness valley.',
      'Contrast allopatric isolation with sympatric ecological host-race divergence (Rhagoletis pomonella).',
      'Predict the signature of reinforcement (greater prezygotic divergence in sympatry than allopatry).',
      'Explain how allopolyploidy creates instant fertile, reproductively isolated plant species (Tragopogon).',
    ],
    commonMisconceptions: [
      {
        misconception: 'Evolution deliberately evolves hybrid sterility so two populations can become neat separate species.',
        correction:
          'Postzygotic isolation (BDM incompatibilities) evolves as an accidental epistatic by-product of independent divergence; only prezygotic reinforcement is directly favoured by selection against costly hybrids.',
      },
      {
        misconception: 'Speciation always takes millions of years of geographic separation.',
        correction:
          'Allopolyploid speciation in plants (such as Tragopogon miscellus in the 1940s) creates reproductively isolated species in a single generation!',
      },
    ],
    discussionPrompts: [
      'Why does Haldane’s Rule predict that in XY or ZW animals, the heterogametic sex suffers hybrid sterility/inviability first?',
      'Why do genomic studies show that the Greenish Warbler ring actually experienced brief Pleistocene breaks—and what does that tell us about speciation with gene flow?',
    ],
    activityTip:
      'On Page 2, ask students to count the minimum number of loci needed for a fitness-valley-free incompatibility (answer: 2 interacting loci!).',
  },
  scienceCard: {
    coreTakeaway:
      'Speciation is the accumulation of reproductive barriers—whether via gradual geographic divergence and epistatic Dobzhansky–Muller clashes, ecological host shifts, sympatric reinforcement against maladaptive hybrids, or instant whole-genome doubling (allopolyploidy).',
    assumptions: [
      {
        label: 'Greenish Warbler Ring Species',
        status: 'realistic',
        tag: 'Irwin et al. 2001, 2005',
        detail: 'Morphology, song complexity, and mitochondrial/nuclear clines diverge smoothly around the Tibetan Plateau before meeting without interbreeding in central Siberia.',
      },
      {
        label: 'Rhagoletis Apple Maggot Host Shift',
        status: 'realistic',
        tag: 'Feder et al. 1988, 2003',
        detail: 'Timing of adult eclosion shifted in sympatry to match introduced apples fruiting weeks earlier than native hawthorns.',
      },
      {
        label: 'Tragopogon Allopolyploid Speciation',
        status: 'realistic',
        tag: 'Ownbey 1950; Soltis et al. 2004',
        detail: 'Multiple independent origins of fertile tetraploid T. miscellus (4n=24) occurred in the US Pacific Northwest during the 20th century.',
      },
    ],
    citations: [
      {
        authors: 'Irwin, D. E., Bensch, S. & Price, T. D.',
        year: 2001,
        title: 'Speciation in a ring',
        journal: 'Nature 409:333–337',
      },
      {
        authors: 'Feder, J. L., Chilcote, C. A. & Bush, G. L.',
        year: 1988,
        title: 'Genetic differentiation between sympatric host races of the apple maggot fly Rhagoletis pomonella',
        journal: 'Nature 336:61–64',
      },
      {
        authors: 'Ownbey, M.',
        year: 1950,
        title: 'Natural hybridization and amphiploidy in the genus Tragopogon',
        journal: 'American Journal of Botany 37:487–499',
      },
    ],
    standards: {
      undergrad: [
        'Speciation Core: Biological Species Concept, Ring Species & BDM Incompatibilities',
        'Allopatric vs. Sympatric Host Shifts, Reinforcement & Polyploidy',
      ],
      apOrALevel: ['AP Bio 7.10 (Speciation & Reproductive Isolation)'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="sp-caption">Phylloscopus trochiloides — Tibetan Plateau Ring Species</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="sp-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="sp-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="sp-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="sp-canvas-host"></div>
      <div class="hwe-plate-legend" id="sp-legend"></div>
      <div class="plate-orbit-hint">Drag to rotate 3D specimen · Scroll to inspect hand-tinted details</div>
    `;

    const canvasHost = plateStageEl.querySelector('#sp-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#sp-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#sp-legend') as HTMLElement;

    const scene = new SpeciesScene3D(canvasHost);
    (plateStageEl.querySelector('#sp-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#sp-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#sp-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let ringPos = 0.85;
    let dmiGeno: DmiGenotype = 'AaBb';
    let hostGap = 3.5;
    let reinfSympatry = true;
    let reinfHybFit = 0.2;
    let ploidyStep: PloidyStep = 'allopolyploid_4n';

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'ring';
      scene.setPage(pageId);

      if (pageId === 'ring') {
        const res = evaluateRingSpecies(ringPos);
        scene.updateRingSpecies(res);
        captionEl.textContent = `Phylloscopus trochiloides — Ring Expansion ${(ringPos * 100).toFixed(0)}% North`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#7c995c"></i>West: P. t. viridanus (1 wing bar)</span>
          <span><i class="hwe-dot" style="background:#5a8a78"></i>East: P. t. plumbeitarsus (2 wing bars)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Northward Expansion Around Tibetan Plateau</div>
              <label style="display:block;font-size:0.84rem;">
                Latitude Along Ring = <strong>${(ringPos * 100).toFixed(0)}%</strong>
                <input type="range" id="sp-ring" min="0.05" max="1.0" step="0.05" value="${ringPos}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">West Song: ${res.westSongFreqKHz.toFixed(1)} kHz</span>
                <span class="hwe-stat-badge">East Song: ${res.eastSongFreqKHz.toFixed(1)} kHz</span>
              </div>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge" style="color:${res.interbreedingCompatible ? '#2f6d4f' : '#a83424'}">
                  ${res.interbreedingCompatible ? 'Recognize Songs (Interbreeding)' : 'Siberian Overlap: Reproductively Isolated!'}
                </span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Speciation in Space:</strong> Step-by-step divergence along each arm stays seamless between adjacent neighbours, yet accumulates past the mate-recognition threshold where the two ends meet in Siberia!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#sp-ring')?.addEventListener('input', (e) => {
          ringPos = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'dmi') {
        const res = evaluateDmi(dmiGeno);
        scene.updateDmi(res);
        captionEl.textContent = `Two-Locus Interacting Protein Complex — Genotype ${res.genotype}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#549e96"></i>Locus A Subunit</span>
          <span><i class="hwe-dot" style="background:${res.proteinClash ? '#cc5247' : '#dfa449'}"></i>Locus B Subunit (${res.proteinClash ? 'Steric Clash!' : 'Compatible Fit'})</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Inspect Genotype Along Evolutionary Path</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${dmiGeno === 'aabb' ? 'active' : ''}" data-dg="aabb">Ancestor (aabb)</button>
                <button class="lic-pill-btn ${dmiGeno === 'AAbb' ? 'active' : ''}" data-dg="AAbb">Island 1 (AAbb)</button>
                <button class="lic-pill-btn ${dmiGeno === 'aaBB' ? 'active' : ''}" data-dg="aaBB">Island 2 (aaBB)</button>
                <button class="lic-pill-btn ${dmiGeno === 'AaBb' ? 'active' : ''}" data-dg="AaBb">F₁ Hybrid (AaBb)</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Relative Fitness W = ${res.fitness.toFixed(2)}</span>
                <span class="hwe-stat-badge" style="color:${res.proteinClash ? '#a83424' : '#2f6d4f'}">${res.proteinClash ? 'INCOMPATIBLE' : 'COMPATIBLE'}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.explanation}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-dg]').forEach((b) =>
          b.addEventListener('click', () => {
            dmiGeno = (b as HTMLElement).dataset.dg as DmiGenotype;
            renderPage();
          })
        );
      } else if (pageId === 'hostshift') {
        const res = evaluateHostShift(hostGap);
        scene.updateHostShift(res);
        captionEl.textContent = 'Malus domestica (Aug) vs Crataegus Hawthorn (Oct) — Host-Race Divergence';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c9543e"></i>Introduced Apple Race</span>
          <span><i class="hwe-dot" style="background:#b82c2c"></i>Native Hawthorn Race</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Fruiting Phenology Separation</div>
              <label style="display:block;font-size:0.84rem;">
                Fruiting Season Gap = <strong>${hostGap.toFixed(1)} weeks</strong>
                <input type="range" id="sp-gap" min="0" max="5" step="0.5" value="${hostGap}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Assortative Mating: ${(res.assortativeMating * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Gene Flow m: ${(res.geneFlowRate * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.regime}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelector('#sp-gap')?.addEventListener('input', (e) => {
          hostGap = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'reinforcement') {
        const res = evaluateReinforcement(reinfHybFit, reinfSympatry);
        scene.updateReinforcement(res);
        captionEl.textContent = `Courtship Plumage Divergence — ${reinfSympatry ? 'Sympatric Contact Zone' : 'Allopatric Isolation'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#5a839e"></i>Lineage I Signal</span>
          <span><i class="hwe-dot" style="background:${res.signalDivergence > 0.5 ? '#c7523a' : '#63879c'}"></i>Lineage II Signal</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Geographic Context &amp; Hybrid Cost</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${reinfSympatry ? 'active' : ''}" data-rs="1">Sympatry (Overlap)</button>
                <button class="lic-pill-btn ${!reinfSympatry ? 'active' : ''}" data-rs="0">Allopatry (Separate)</button>
              </div>
              <label style="display:block;margin-top:8px;font-size:0.84rem;">
                Hybrid Fitness W_hyb = <strong>${reinfHybFit.toFixed(2)}</strong>
                <input type="range" id="sp-hf" min="0.05" max="1.0" step="0.05" value="${reinfHybFit}" style="width:100%;" />
              </label>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Signal Divergence: ${(res.signalDivergence * 100).toFixed(0)}%</span>
                <span class="hwe-stat-badge">Premating Isolation: ${(res.prematingIsolation * 100).toFixed(0)}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Reinforcement Signature:</strong> Selection directly sharpens prezygotic mate discrimination ONLY where lineages overlap AND hybrids suffer low fitness!</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-rs]').forEach((b) =>
          b.addEventListener('click', () => {
            reinfSympatry = (b as HTMLElement).dataset.rs === '1';
            renderPage();
          })
        );
        leftPanelEl.querySelector('#sp-hf')?.addEventListener('input', (e) => {
          reinfHybFit = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'polyploidy') {
        const res = evaluatePolyploidy(ploidyStep);
        scene.updatePolyploidy(res);
        captionEl.textContent = res.chromosomes;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#f0df78"></i>T. dubius (2n=12)</span>
          <span><i class="hwe-dot" style="background:#eba734"></i>T. pratensis (2n=12)</span>
          <span><i class="hwe-dot" style="background:#f2c138"></i>T. miscellus (4n=24 Giant)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Ownbey (1950) Allopolyploid Sequence</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr;">
                <button class="lic-pill-btn ${ploidyStep === 'parents' ? 'active' : ''}" data-ps="parents">1. Diploid Parents (2n=12 × 2n=12)</button>
                <button class="lic-pill-btn ${ploidyStep === 'f1_sterile' ? 'active' : ''}" data-ps="f1_sterile">2. Sterile F₁ Hybrid (AB, 2n=12)</button>
                <button class="lic-pill-btn ${ploidyStep === 'allopolyploid_4n' ? 'active' : ''}" data-ps="allopolyploid_4n">3. Giant Fertile T. miscellus (AABB, 4n=24)</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Fertile: ${res.fertile ? 'YES' : 'NO'}</span>
                <span class="hwe-stat-badge">Isolated from Parents: ${res.reproductivelyIsolated ? 'YES (3n block)' : 'NO'}</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll('[data-ps]').forEach((b) =>
          b.addEventListener('click', () => {
            ploidyStep = (b as HTMLElement).dataset.ps as PloidyStep;
            renderPage();
          })
        );
      } else {
        captionEl.textContent = 'Plate XIII · Speciation & Hybridization Museum Specimens';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#7c995c"></i>Phylloscopus</span>
          <span><i class="hwe-dot" style="background:#c9543e"></i>Malus Host Race</span>
          <span><i class="hwe-dot" style="background:#f2c138"></i>Tragopogon 4n</span>
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
          ctx.completeChapter('species', correctCount, CHECK_CASES.length);
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
                      ? `<div class="check-feedback ${opt.correct ? 'ok' : 'bad'}">${opt.correct ? c.explanation : 'Re-check the speciation mechanism on the preceding 3D plate and try again.'}</div>`
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
