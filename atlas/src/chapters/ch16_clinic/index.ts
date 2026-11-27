// =============================================================================
// Chapter 16: The Clinic & Human Origins — Complete Interactive Module
// Strand O: Applied Evolutionary Medicine & Human Evolution
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import {
  computeOoaClinal,
  HOMININ_TAXA,
  OOA_REGIONS,
  simulateCancerClones,
  simulateMicMpc,
  simulatePlasmidHgt,
  type TherapyMode,
} from './clinicMath';
import { ClinicScene3D, type ClinicPageId } from './ClinicScene3D';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'clinic')!;

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
    id: 'cl1-cancer',
    prompt:
      'Why can continuous Maximum Tolerated Dose (MTD) chemotherapy sometimes lead to faster treatment-resistant relapse than Evolutionary Adaptive Therapy (Gatenby et al. 2009)?',
    options: [
      {
        id: 'a',
        label: 'MTD eliminates drug-sensitive tumour cells that were competitively suppressing slower-growing resistant clones (“competitive release”).',
        correct: true,
      },
      {
        id: 'b',
        label: 'MTD forces tumour cells to consciously design efflux pumps on demand.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Drug-resistant cancer cells can only survive when drug-sensitive cells feed them.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Because resistant clones often pay a metabolic cost to express efflux pumps, preserving a controlled population of drug-sensitive competitors suppresses resistant expansion.',
  },
  {
    id: 'cl2-bush',
    prompt:
      'Why is the classic “March of Progress” illustration (chimp → Australopithecus → H. erectus → Neanderthal → H. sapiens in a straight line) scientifically inaccurate?',
    options: [
      {
        id: 'a',
        label: 'Hominin evolution was a branching bush with multiple coexisting lineages; Neanderthals were a big-brained sister lineage who interbred with H. sapiens, not our direct ancestor.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Modern humans evolved before Australopithecus.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Bipedalism and brain size always changed together at one fixed rate.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Bipedalism evolved millions of years before large brains (mosaic evolution), and multiple hominin species overlapped and occasionally interbred across Africa and Eurasia.',
  },
  {
    id: 'cl3-amova',
    prompt:
      'What does global human genomic partitioning (Lewontin 1972; Rosenberg et al. 2002; Ramachandran et al. 2005) reveal about human genetic diversity?',
    options: [
      {
        id: 'a',
        label: 'Over 85% of human genetic variation lies WITHIN any single local population, diversity is highest inside Africa, and allele frequencies vary clinally rather than in discrete biological “races.”',
        correct: true,
      },
      {
        id: 'b',
        label: 'Over 90% of human genetic variation separates discrete continental racial groups.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Populations farthest from Africa hold far higher ancestral genetic diversity than African populations.',
        correct: false,
      },
    ],
    explanation:
      'Correct! Serial founder steps out of Africa leave African populations with the deepest genetic diversity, and >85% of global human variation is shared within local populations.',
  },
];

const PAGE_IDS: ClinicPageId[] = ['mic', 'hgt', 'cancer', 'hominin', 'ooa', 'check'];

export const CH16_CLINIC: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'mic',
      shortLabel: '1 MIC/MPC',
      eyebrow: 'DRLICA (2003) · PHARMACODYNAMICS',
      heading: 'The Mutant-Selection Window',
      bodyHtml: `Antibiotics do not invent resistance mutations — they <em>filter</em> pre-existing variants! Between the wild-type MIC (2 µg/mL) and the Mutant Prevention Concentration (MPC = 12 µg/mL) sits the ${gloss('mutant_selection_window', 'mutant-selection window')}: lethal to drug-sensitive competitors yet permissive to single-step mutants!`,
      promptHint: 'Slide antibiotic concentration into vs. above the Mutant-Selection Window to watch the bacterial agar lawn respond!',
    },
    {
      id: 'hgt',
      shortLabel: '2 Plasmids',
      eyebrow: 'HORIZONTAL GENE TRANSFER · R-PLASMIDS',
      heading: 'Conjugative plasmid highways',
      bodyHtml: `Pathogens need not wait for rare chromosomal mutations! Through ${gloss('conjugation', 'bacterial conjugation')}, a donor cell extends a hollow sex pilus and transfers a circular R-plasmid bearing multi-drug resistance genes directly across species boundaries!`,
      promptHint: 'Tune conjugation rate, antibiotic selection, and plasmid carriage cost to drive transfer along the 3D sex pilus!',
    },
    {
      id: 'cancer',
      shortLabel: '3 Cancer',
      eyebrow: 'GREAVES & MALEY (2012) · GATENBY ET AL. (2009)',
      heading: 'Clonal oncology & adaptive therapy',
      bodyHtml: `A tumour is a rapidly evolving ecosystem of competing cell clones! Continuous Maximum Tolerated Dose wipes out sensitive cells and triggers ${gloss('competitive_release', 'competitive release')} of resistant clones — whereas ${gloss('adaptive_therapy', 'adaptive therapy')} pulses dosing so sensitive cells suppress resistant cells!`,
      promptHint: 'Compare Max Tolerated Dose vs. Adaptive Therapy to reshape the sculpted 3D clonal tumour!',
    },
    {
      id: 'hominin',
      shortLabel: '4 Hominins',
      eyebrow: 'PALEOANTHROPOLOGY · A BRANCHING BUSH',
      heading: 'Mosaic evolution of the hominin cranium',
      bodyHtml: `Human evolution was <strong>never a linear “March of Progress”</strong> — it was a branching bush of overlapping species! Bipedalism preceded big brains in <em>Australopithecus</em>, and big-brained <em>Homo neanderthalensis</em> was a <em>sister lineage</em> who coexisted and interbred with early <em>Homo sapiens</em>.`,
      promptHint: 'Switch fossil taxa to morph cranial vault, brow torus, occipital bun, facial prognathism & chin live!',
    },
    {
      id: 'ooa',
      shortLabel: '5 Origins',
      eyebrow: 'OUT OF AFRICA · CLINAL VARIATION',
      heading: 'Serial founders, admixture & >85% shared diversity',
      bodyHtml: `As modern <em>Homo sapiens</em> dispersed out of Africa via ${gloss('serial_founder_effect', 'serial founder steps')}, genetic diversity declined smoothly with overland distance, punctuated by minor ${gloss('archaic_admixture', 'archaic admixture')} (~2% Neanderthal, ~4% Denisovan in Oceania) — while &gt;85% of human variation remains within local populations!`,
      promptHint: 'Slide overland distance from East Africa and toggle Archaic Admixture to inspect clinal variation & AMOVA!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'SYNTHESIS · PLATE 16 OF 16',
      heading: 'Applied & human evolution capstone',
      bodyHtml: `Synthesize evolutionary medicine and human genomics across three undergraduate diagnostic scenarios to complete all 16 plates of the Atlas!`,
      promptHint: 'Answer all three capstone cases to earn your Plate 16 mastery stamp!',
    },
  ],
  teacherGuide: {
    estimatedMinutes: 25,
    level: '1st–3rd Year Undergraduate (Evolutionary Medicine & Human Evolution)',
    learningObjectives: [
      'Explain why antibiotic concentrations inside the MIC–MPC Mutant-Selection Window maximally enrich resistant mutants, and identify clinical caveats to “hit maximally hard” (Day & Read 2016).',
      'Distinguish vertical mutation inheritance from conjugative R-plasmid horizontal gene transfer across species.',
      'Contrast MTD competitive release with Evolutionary Adaptive Therapy in clonal cancer ecosystems (Gatenby et al. 2009).',
      'Interpret hominin paleoanthropology as a branching bush with mosaic evolution, and explain why >85% within-population genetic variance and serial-founder clines refute typological human “races.”',
    ],
    commonMisconceptions: [
      {
        misconception: '“Always hitting pathogens or tumours with the highest possible dose always prevents resistance.”',
        correction:
          'While doses above MPC suppress single-step mutants, real stewardship must also account for host toxicity, dormant persisters, collateral microbiome selection, and competitive release of pre-existing resistant clones (Day & Read 2016; Gatenby et al. 2009).',
      },
      {
        misconception: '“Humans evolved in a neat straight line from chimpanzees through Neanderthals to modern humans.”',
        correction:
          'Chimpanzees are our living sister species (sharing a ~6–7 Ma common ancestor), and Neanderthals were a coexisting sister hominin lineage who interbred with dispersing H. sapiens.',
      },
      {
        misconception: '“Continental human populations represent genetically discrete biological races.”',
        correction:
          'Over 85% of human genetic variation occurs within any single local population; human genetic diversity peaks inside Africa and shifts smoothly along geographic clines.',
      },
    ],
    discussionPrompts: [
      'Compare competitive release in Page 1 (MIC/MPC bacterial lawns) and Page 3 (MTD vs. Adaptive cancer therapy): what ecological principle unites both clinical dilemmas?',
      'Why does the fossil record show habitual bipedalism in Australopithecus afarensis nearly 2 million years before major cranial expansion in Homo?',
    ],
    activityTip:
      'On Page 4, have students compare Homo neanderthalensis (1500 cc, double brow ridge, occipital bun, no chin) directly with Homo sapiens (1350 cc, high globular dome, true chin) to shatter the myth that larger brain volume alone defines a linear “progress” ladder!',
  },
  scienceCard: {
    coreTakeaway:
      'Evolutionary dynamics directly govern antimicrobial resistance, plasmid spread, and clonal cancer progression in the clinic — while ancient DNA and population genomics reveal Homo sapiens as the surviving branch of a hominin bush whose genetic variation is clinal and >85% shared within local populations.',
    assumptions: [
      {
        label: 'MIC / MPC & Clinical Stewardship Nuance',
        status: 'simplified',
        tag: 'Drlica 2003; Day & Read 2016',
        detail: 'Single-step mutant selection window illustrates pharmacodynamic filtering; clinical regimens must also weigh toxicity, dormant persisters, and collateral microbiome resistance.',
      },
      {
        label: 'Clonal Cancer Adaptive Therapy',
        status: 'realistic',
        tag: 'Gatenby et al. 2009',
        detail: 'Assumes resistant tumour cells pay an energetic/efflux fitness cost when drug is paused, enabling surviving sensitive clones to suppress resistant outgrowth.',
      },
      {
        label: 'Out-of-Africa Serial Founder & AMOVA',
        status: 'realistic',
        tag: 'Rosenberg et al. 2002; Ramachandran et al. 2005',
        detail: 'Neutral heterozygosity decreases linearly with waypoint overland distance from East Africa (r ≈ −0.87), with ~85–90% of global genetic variance partitioned within local populations.',
      },
    ],
    citations: [
      {
        authors: 'Drlica, K.',
        year: 2003,
        title: 'The mutant selection window and antimicrobial resistance',
        journal: 'J. Antimicrob. Chemother. 52:11–17',
      },
      {
        authors: 'Day, T. & Read, A. F.',
        year: 2016,
        title: 'Does high-dose antimicrobial chemotherapy prevent the evolution of resistance?',
        journal: 'PLoS Comput. Biol. 12(1):e1004689',
      },
      {
        authors: 'Gatenby, R. A., Silva, A. S., Gillies, R. J. & Frieden, B. R.',
        year: 2009,
        title: 'Adaptive therapy',
        journal: 'Cancer Research 69(11):4894–4903',
      },
      {
        authors: 'Ramachandran, S. et al.',
        year: 2005,
        title: 'Support from the relationship of genetic and geographic distance in human populations for a serial founder effect originating in Africa',
        journal: 'PNAS 102(44):15942–15947',
      },
      {
        authors: 'Rosenberg, N. A. et al.',
        year: 2002,
        title: 'Genetic structure of human populations',
        journal: 'Science 298(5602):2381–2385',
      },
    ],
    standards: {
      undergrad: [
        'Evolutionary Medicine: Antibiotic MIC/MPC Windows, Plasmid HGT & Clonal Oncology',
        'Human Evolutionary Genomics: Branching Hominin Phylogeny, Archaic Admixture & Clinal Variation',
      ],
      apOrALevel: ['AP Bio 7.1–7.2 (Natural Selection in Pathogens) & Human Evolutionary Genetics'],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-header-bar">
        <span class="plate-caption-pill" id="cl-caption">Mutant-Selection Window (MIC &lt; C &lt; MPC)</span>
        <div class="plate-view-tools">
          <button class="plate-tool-btn" id="cl-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="cl-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="cl-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="cl-canvas-host"></div>
      <div class="hwe-plate-legend" id="cl-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D clinical &amp; osteology models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#cl-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#cl-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#cl-legend') as HTMLElement;

    const scene = new ClinicScene3D(canvasHost);
    (plateStageEl.querySelector('#cl-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoom(-0.15));
    (plateStageEl.querySelector('#cl-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoom(0.15));
    (plateStageEl.querySelector('#cl-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let dose = 6.5;
    let conjRate = 0.65;
    let abxPressure = 0.55;
    let plasmidCost = 0.08;
    let therapyMode: TherapyMode = 'mtd';
    let homininIdx = 3;
    let distanceKm = 6800;
    let includeAdmixture = true;

    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = () => {
      const pageId = PAGE_IDS[currentStep] ?? 'mic';
      scene.setPage(pageId);

      if (pageId === 'mic') {
        const res = simulateMicMpc(dose);
        scene.updateMic(res);
        const zoneLabel =
          res.zone === 'below_mic'
            ? 'Sub-MIC (WT Dominates)'
            : res.zone === 'msw'
              ? 'INSIDE Mutant-Selection Window!'
              : 'Above MPC (Mutants Suppressed)';
        captionEl.textContent = `Dose = ${dose.toFixed(1)} µg/mL · ${zoneLabel}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6f9c7a"></i>Wild-Type Bacilli</span>
          <span><i class="hwe-dot" style="background:#c44b45"></i>Resistant Mutants (${Math.round(res.resistantFractionEnd * 100)}%)</span>
          <span><i class="hwe-dot" style="background:#e0b354"></i>Antibiotic Halo</span>
        `;

        const w = 310;
        const h = 108;
        const xMap = (c: number) => 20 + (c / 24) * (w - 32);
        const yMap = (r: number) => h - 18 - ((r + 0.6) / 1.2) * (h - 26);
        const wtPts: string[] = [];
        const mutPts: string[] = [];
        for (let c = 0; c <= 24; c += 1) {
          const s = simulateMicMpc(c);
          wtPts.push(`${xMap(c).toFixed(1)},${yMap(s.wtGrowth).toFixed(1)}`);
          mutPts.push(`${xMap(c).toFixed(1)},${yMap(s.mutGrowth).toFixed(1)}`);
        }
        const mswX1 = xMap(res.mic);
        const mswX2 = xMap(res.mpc);
        const curX = xMap(dose);

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Antibiotic Concentration (MIC = 2 · MPC = 12 µg/mL)</div>
              <label class="lic-slider-label">
                <span>Dose C = <strong>${dose.toFixed(1)} µg/mL</strong></span>
                <input type="range" id="cl-dose" min="0" max="24" step="0.5" value="${dose}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${res.zone === 'below_mic' ? 'active' : ''}" data-dose="1.0">Sub-MIC</button>
                <button class="lic-pill-btn ${res.zone === 'msw' ? 'active' : ''}" data-dose="6.5">Inside MSW</button>
                <button class="lic-pill-btn ${res.zone === 'above_mpc' ? 'active' : ''}" data-dose="18.0">Above MPC</button>
              </div>
              <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;margin-top:8px;">
                <rect x="${mswX1}" y="6" width="${mswX2 - mswX1}" height="${h - 22}" fill="#e0b354" fill-opacity="0.22" />
                <line x1="20" y1="${yMap(0)}" x2="${w - 10}" y2="${yMap(0)}" stroke="#a89f8d" stroke-dasharray="3 3" stroke-width="1" />
                <polyline points="${wtPts.join(' ')}" fill="none" stroke="#4d7857" stroke-width="2.2" />
                <polyline points="${mutPts.join(' ')}" fill="none" stroke="#b83c48" stroke-width="2.2" />
                <line x1="${curX}" y1="4" x2="${curX}" y2="${h - 16}" stroke="#3d3228" stroke-width="1.8" />
                <text x="${(mswX1 + mswX2) / 2}" y="17" text-anchor="middle" font-size="8.5" fill="#7d5916" font-weight="600">MSW (MIC → MPC)</text>
                <text x="20" y="${h - 4}" font-size="8.5" fill="#6b6254">0 µg/mL</text>
                <text x="${w - 12}" y="${h - 4}" text-anchor="end" font-size="8.5" fill="#6b6254">24 µg/mL</text>
              </svg>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.stewardshipNote}</p>
            </div>
          </div>
        `;

        (leftPanelEl.querySelector('#cl-dose') as HTMLInputElement).addEventListener('input', (e) => {
          dose = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-dose]').forEach((b) => {
          b.addEventListener('click', () => {
            dose = Number(b.dataset.dose);
            renderPage();
          });
        });
      } else if (pageId === 'hgt') {
        const res = simulatePlasmidHgt(conjRate, abxPressure, plasmidCost);
        scene.updateHgt(res);
        captionEl.textContent = `Conjugative R-Plasmid Frequency → ${Math.round(res.finalPlasmidFreq * 100)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c98a5b"></i>Donor Bacterium (F+)</span>
          <span><i class="hwe-dot" style="background:#e0a838"></i>Circular R-Plasmid</span>
          <span><i class="hwe-dot" style="background:#85a68e"></i>Recipient (F−)</span>
        `;

        const w = 310;
        const h = 98;
        const pts = res.plasmidSeries
          .map((p, i) => `${(16 + (i / 30) * (w - 28)).toFixed(1)},${(h - 14 - p * (h - 24)).toFixed(1)}`)
          .join(' ');

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Conjugative Plasmid Parameters</div>
              <label class="lic-slider-label">
                <span>Conjugation Rate γ = <strong>${conjRate.toFixed(2)}</strong></span>
                <input type="range" id="cl-conj" min="0" max="1" step="0.05" value="${conjRate}" />
              </label>
              <label class="lic-slider-label">
                <span>Antibiotic Selection = <strong>${Math.round(abxPressure * 100)}%</strong></span>
                <input type="range" id="cl-abx" min="0" max="1" step="0.05" value="${abxPressure}" />
              </label>
              <label class="lic-slider-label">
                <span>Plasmid Carriage Cost c = <strong>${plasmidCost.toFixed(2)}</strong></span>
                <input type="range" id="cl-cost" min="0" max="0.3" step="0.02" value="${plasmidCost}" />
              </label>
              <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;margin-top:6px;">
                <line x1="16" y1="${h - 14}" x2="${w - 12}" y2="${h - 14}" stroke="#c2b8a3" stroke-width="1" />
                <polyline points="${pts}" fill="none" stroke="#c98a2b" stroke-width="2.5" />
                <text x="18" y="13" font-size="8.5" fill="#754b06">R-Plasmid Frequency (30 gen): ${Math.round(res.finalPlasmidFreq * 100)}%</text>
              </svg>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Horizontal Highway:</strong> Conjugative R-plasmids let multi-drug resistance jump rapidly between distantly related gut and hospital bacteria in a single transfer event!
              </p>
            </div>
          </div>
        `;

        (leftPanelEl.querySelector('#cl-conj') as HTMLInputElement).addEventListener('input', (e) => {
          conjRate = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#cl-abx') as HTMLInputElement).addEventListener('input', (e) => {
          abxPressure = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#cl-cost') as HTMLInputElement).addEventListener('input', (e) => {
          plasmidCost = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'cancer') {
        const res = simulateCancerClones(therapyMode, 0.04);
        scene.updateCancer(res);
        captionEl.textContent =
          therapyMode === 'mtd'
            ? 'Max Tolerated Dose → Competitive Release!'
            : therapyMode === 'adaptive'
              ? 'Evolutionary Adaptive Therapy → Contained!'
              : 'Untreated Clonal Tumour Growth';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#5f8f96"></i>Sensitive Clone (${Math.round((1 - res.finalResistantShare) * 100)}%)</span>
          <span><i class="hwe-dot" style="background:#b83c48"></i>Resistant Clone (${Math.round(res.finalResistantShare * 100)}%)</span>
        `;

        const w = 310;
        const h = 108;
        const mapX = (i: number) => 16 + (i / 48) * (w - 28);
        const mapY = (v: number) => h - 16 - Math.min(1.05, v) * (h - 26);
        const sPts = res.sensitiveSeries.map((v, i) => `${mapX(i).toFixed(1)},${mapY(v).toFixed(1)}`).join(' ');
        const rPts = res.resistantSeries.map((v, i) => `${mapX(i).toFixed(1)},${mapY(v).toFixed(1)}`).join(' ');
        const tPts = res.totalSeries.map((v, i) => `${mapX(i).toFixed(1)},${mapY(v).toFixed(1)}`).join(' ');

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Oncology Dosing Strategy</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${therapyMode === 'mtd' ? 'active' : ''}" data-mode="mtd">Max Dose (MTD)</button>
                <button class="lic-pill-btn ${therapyMode === 'adaptive' ? 'active' : ''}" data-mode="adaptive">Adaptive Therapy</button>
                <button class="lic-pill-btn ${therapyMode === 'untreated' ? 'active' : ''}" data-mode="untreated">Untreated</button>
              </div>
              <svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto;margin-top:8px;">
                <line x1="16" y1="${mapY(0.88)}" x2="${w - 12}" y2="${mapY(0.88)}" stroke="#b83c48" stroke-dasharray="3 3" stroke-width="1" />
                <polyline points="${tPts}" fill="none" stroke="#3d3228" stroke-width="1.4" stroke-dasharray="2 2" />
                <polyline points="${sPts}" fill="none" stroke="#3f6e75" stroke-width="2.3" />
                <polyline points="${rPts}" fill="none" stroke="#b83c48" stroke-width="2.4" />
                <text x="18" y="13" font-size="8.2" fill="#b83c48">Relapse threshold (0.88)</text>
                <text x="18" y="${h - 3}" font-size="8.2" fill="#3f6e75">Teal = Sensitive S · Crimson = Resistant R</text>
              </svg>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  therapyMode === 'mtd'
                    ? `<strong>Competitive Release:</strong> MTD eliminates S quickly, allowing resistant R to surge to ${Math.round(res.finalResistantShare * 100)}% of the tumour (${res.relapseStep ? `relapse at cycle ${res.relapseStep}` : 'relapsing'}).`
                    : therapyMode === 'adaptive'
                      ? `<strong>Evolutionary Containment:</strong> Pulsing therapy keeps drug-sensitive S cells (${Math.round((1 - res.finalResistantShare) * 100)}%) alive to competitively suppress R — maintaining burden at ${res.finalBurden.toFixed(2)} with no resistant takeover!`
                      : `<strong>Untreated Growth:</strong> Fast-dividing sensitive clones rapidly expand to carrying capacity (${res.finalBurden.toFixed(2)}).`
                }
              </p>
            </div>
          </div>
        `;

        leftPanelEl.querySelectorAll<HTMLElement>('[data-mode]').forEach((b) => {
          b.addEventListener('click', () => {
            therapyMode = b.dataset.mode as TherapyMode;
            renderPage();
          });
        });
      } else if (pageId === 'hominin') {
        const taxon = HOMININ_TAXA[homininIdx]!;
        scene.updateHominin(taxon);
        captionEl.textContent = `${taxon.species} · ${taxon.cranialCc} cc (${taxon.ageLabel})`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d9c49e"></i>Cranial Capacity: ${taxon.cranialCc} cc</span>
          <span><i class="hwe-dot" style="background:#8a7b5d"></i>EQ ≈ ${taxon.eq.toFixed(1)}</span>
        `;

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Select Hominin Fossil Specimen (Branching Bush)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                ${HOMININ_TAXA.map(
                  (t, idx) =>
                    `<button class="lic-pill-btn ${idx === homininIdx ? 'active' : ''}" data-hom="${idx}">${t.species.replace('Australopithecus ', 'A. ').replace('Homo ', 'H. ')}</button>`
                ).join('')}
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Vault: ${taxon.cranialCc} cc</span>
                <span class="hwe-stat-badge">EQ: ${taxon.eq.toFixed(1)}</span>
              </div>
              <p style="font-size:12px;margin:8px 0 0;color:#4a4033;line-height:1.4;">
                <strong>Brow &amp; Vault:</strong> ${taxon.browLabel}.<br/>
                <strong>Jaw &amp; Chin:</strong> ${taxon.chinLabel}.
              </p>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>Bush Note:</strong> ${taxon.bushNote}</p>
            </div>
          </div>
        `;

        leftPanelEl.querySelectorAll<HTMLElement>('[data-hom]').forEach((b) => {
          b.addEventListener('click', () => {
            homininIdx = Number(b.dataset.hom);
            renderPage();
          });
        });
      } else if (pageId === 'ooa') {
        const res = computeOoaClinal(distanceKm, includeAdmixture);
        scene.updateOoa(res, includeAdmixture);
        const nearest = OOA_REGIONS.reduce((best, r) =>
          Math.abs(r.distKm - distanceKm) < Math.abs(best.distKm - distanceKm) ? r : best
        );
        captionEl.textContent = `${nearest.name} · Expected H_e = ${res.expectedHe.toFixed(3)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#b58d59"></i>African Cradle</span>
          <span><i class="hwe-dot" style="background:#b84239"></i>Serial Founder Cline</span>
          <span><i class="hwe-dot" style="background:#4c7594"></i>Neanderthal (${res.neanderthalPct.toFixed(1)}%)</span>
          <span><i class="hwe-dot" style="background:#7d5c8f"></i>Denisovan (${res.denisovanPct.toFixed(1)}%)</span>
        `;

        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Dispersal Distance &amp; Archaic Admixture</div>
              <label class="lic-slider-label">
                <span>Distance from East Africa: <strong>${distanceKm.toLocaleString()} km</strong></span>
                <input type="range" id="cl-dist" min="0" max="22400" step="400" value="${distanceKm}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${includeAdmixture ? 'active' : ''}" data-admix="1">Archaic Admixture ON</button>
                <button class="lic-pill-btn ${!includeAdmixture ? 'active' : ''}" data-admix="0">Strict Replacement</button>
              </div>
              <div style="margin-top:10px;">
                <div style="font-size:11px;font-weight:600;color:#4a4033;margin-bottom:4px;">
                  Global Human Genetic Variance (AMOVA · Rosenberg et al. 2002):
                </div>
                <div style="display:flex;height:13px;border-radius:7px;overflow:hidden;border:1px solid #c2b8a3;">
                  <div style="width:${res.withinPopPct}%;background:#4d7857;"></div>
                  <div style="width:${res.betweenLocalPct}%;background:#c99a42;"></div>
                  <div style="width:${res.betweenContinentPct}%;background:#8c4a42;"></div>
                </div>
                <div style="font-size:11px;color:#5c5142;margin-top:4px;">
                  <strong>${res.withinPopPct}% within local populations</strong> · ${res.betweenLocalPct}% between local · ${res.betweenContinentPct}% between continents
                </div>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Anti-Typological Science:</strong> Human genetic diversity peaks inside Africa, shifts smoothly in geographic <em>clines</em>, and &gt;85% resides within any local population — refuting discrete biological “races.”
              </p>
            </div>
          </div>
        `;

        (leftPanelEl.querySelector('#cl-dist') as HTMLInputElement).addEventListener('input', (e) => {
          distanceKm = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-admix]').forEach((b) => {
          b.addEventListener('click', () => {
            includeAdmixture = b.dataset.admix === '1';
            renderPage();
          });
        });
      } else {
        captionEl.textContent = 'Plate 16 — Applied & Human Evolution Capstone';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c98a5b"></i>Conjugation</span>
          <span><i class="hwe-dot" style="background:#e8dec8"></i>Hominin Bush</span>
          <span><i class="hwe-dot" style="background:#b83c48"></i>Clonal Oncology</span>
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
          ctx.completeChapter('clinic', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Not quite — re-examine the evolutionary mechanism on the preceding 3D plate.'
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
