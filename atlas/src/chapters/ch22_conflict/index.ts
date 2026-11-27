// =============================================================================
// Chapter 22: Genomic Conflict & Selfish Elements
// Reviving Tangled Bank "Selfish Spindle", "Copy & Paste" & "Nest"!
// Meiotic Drive, CRISPR Homing Drives, Transposons & C-Value Paradox,
// Gene Duplication Fates (Ohno/DDC), Parent-Offspring Conflict & Imprinting
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import { ConflictScene3D, type ConflictPageId } from './ConflictScene3D';
import {
  CVALUE_TAXA,
  DUPLICATION_FATES,
  evaluateImprinting,
  simulateCrisprDrive,
  simulateMeioticDrive,
  type DuplicationFateId,
  type GenomeTaxon,
} from './conflictMath';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'conflict')!;

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
    id: 'cf1-drive',
    prompt:
      'How can a recessive-lethal meiotic driver like the mouse t-haplotype (s = 1.0 in homozygotes!) persist at high frequency in wild populations?',
    options: [
      {
        id: 'a',
        label: 'Its >50% transmission distortion (k ≫ 0.5) in heterozygotes creates intragenomic selection strong enough to counterbalance homozygous lethality.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Because homozygotes survive twice as long as wild-type mice.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Because natural selection always eliminates every allele that lowers organismal fitness.',
        correct: false,
      },
    ],
    explanation:
      'Whenever 2k > 1, selfish segregation distortion drives a deleterious allele upward from rarity until homozygous mortality balances transmission advantage.',
  },
  {
    id: 'cf2-crispr',
    prompt:
      'Why do engineered CRISPR homing gene drives frequently stall and collapse in cage populations if non-homologous end joining (NHEJ) occurs at even a modest rate?',
    options: [
      {
        id: 'a',
        label: 'NHEJ repairs the Cas9 cut with indels that destroy the guide-RNA target site without carrying the drive’s fitness cost — creating cleavage-resistant alleles (R) that rapidly outcompete the drive.',
        correct: true,
      },
      {
        id: 'b',
        label: 'NHEJ converts resistant chromosomes back into drive chromosomes.',
        correct: false,
      },
      {
        id: 'c',
        label: 'CRISPR drives cannot function in diploid organisms.',
        correct: false,
      },
    ],
    explanation:
      'Any cleavage-resistant allele R enjoys wild-type fitness without the drive payload cost and cannot be cut again, so natural selection rapidly sweeps R to fixation.',
  },
  {
    id: 'cf3-cvalue',
    prompt:
      'Why does the Australian lungfish have a 43,000 Mb genome (~14× larger than humans) despite carrying nearly the same ~20,000 protein-coding genes (the C-value enigma)?',
    options: [
      {
        id: 'a',
        label: 'Massive accumulation of self-replicating transposable elements (TEs) & non-coding repeats, which comprise ~90% of its DNA.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Lungfish require 14 times as many distinct proteins as humans to breathe.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Genome size strictly measures organismal complexity.',
        correct: false,
      },
    ],
    explanation:
      'Selfish mobile elements (retrotransposons and DNA transposons) copy themselves faster than weak purifying selection removes them, inflating genome size independently of gene count.',
  },
  {
    id: 'cf4-imprint',
    prompt:
      'Under David Haig’s (1993) Kinship Theory of Genomic Imprinting, why is the mammalian placental growth enhancer Igf2 expressed solely from the paternal allele while the growth-braking receptor Igf2r is expressed from the maternal allele?',
    options: [
      {
        id: 'a',
        label: 'Under multiple paternity, a father’s allele is less likely to be shared by the mother’s future offspring, favouring aggressive fetal resource extraction — whereas the mother’s allele values all her offspring equally and brakes over-extraction.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Mothers want every fetus to starve regardless of resource availability.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Imprinting only exists in strictly monogamous species where paternal and maternal relatedness are identical.',
        correct: false,
      },
    ],
    explanation:
      'Asymmetric relatedness across a mother’s lifetime litters pits paternally inherited growth promoters against maternally inherited growth suppressors.',
  },
];

const PAGE_IDS: ConflictPageId[] = ['drive', 'crispr', 'transposons', 'duplication', 'imprinting', 'check'];

export const CH22_CONFLICT: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'drive',
      shortLabel: '1 Drive',
      eyebrow: 'INTRAGENOMIC CONFLICT · SELFISH SPINDLE & MEIOTIC DRIVE',
      heading: 'Genomic Conflict & Selfish Elements',
      bodyHtml: `Mendel’s fair 50:50 coin flip is an evolutionary truce — and ${gloss('meiotic_drive', 'meiotic drivers')} break it! A selfish centromere or killer locus that grabs &gt;50% of viable gametes can invade and even persist when <strong>homozygous lethal</strong> (like the mouse <em>t</em>-haplotype)!`,
      promptHint: 'Slide Transmission Bias (k) and Homozygote Cost (s) to pit selfish drive against organismal selection!',
    },
    {
      id: 'crispr',
      shortLabel: '2 CRISPR Drive',
      eyebrow: 'SYNTHETIC EVOLUTION · HOMING GENE DRIVES & RESISTANCE',
      heading: 'Genomic Conflict & Selfish Elements',
      bodyHtml: `Engineered ${gloss('gene_drive', 'CRISPR homing gene drives')} copy themselves onto wild-type chromosomes in the germline to spread malaria resistance or suppress pests — until error-prone NHEJ repair generates cleavage-resistant alleles (R) that evolution rapidly selects!`,
      promptHint: 'Raise NHEJ Resistance Rate (r) and watch resistant golden alleles outcompete the costly drive!',
    },
    {
      id: 'transposons',
      shortLabel: '3 Transposons',
      eyebrow: 'COPY & PASTE · SELFISH DNA & THE C-VALUE PARADOX',
      heading: 'Genomic Conflict & Selfish Elements',
      bodyHtml: `Why is an onion or lungfish genome far larger than a human’s despite similar gene counts? ${gloss('transposon', 'Transposable elements')} (“jumping genes”) replicate faster than host DNA — making up ~45% of the human genome and ~85% of maize!`,
      promptHint: 'Inspect the 5 3D genome spools below: notice how green protein-coding cores stay constant while terracotta TEs explode!',
    },
    {
      id: 'duplication',
      shortLabel: '4 Duplication',
      eyebrow: 'OHNO (1970) & FORCE (1999) · FATES OF DUPLICATED GENES',
      heading: 'Genomic Conflict & Selfish Elements',
      bodyHtml: `When a gene duplicates, relaxed constraint opens three fates: <strong>Pseudogenization</strong> (most common), <strong>Neofunctionalization</strong> (a brand-new function), or <strong>Subfunctionalization (DDC)</strong> — where complementary enhancer losses split ancestral duties and permanently lock in both copies!`,
      promptHint: 'Switch between Pseudogenization, Neofunctionalization, and DDC Subfunctionalization below!',
    },
    {
      id: 'imprinting',
      shortLabel: '5 Imprinting',
      eyebrow: 'TRIVERS (1974) & HAIG (1993) · PARENT–OFFSPRING CONFLICT',
      heading: 'Genomic Conflict & Selfish Elements',
      bodyHtml: `Because you share 100% of your genes with yourself (r = 1) but only 50% with a full sibling (r = 0.5), you demand more maternal care than your mother wants to give! Under multiple paternity, this sparks a placental ${gloss('genomic_imprinting', 'genomic imprinting')} tug-of-war between paternal <em>Igf2</em> and maternal <em>Igf2r</em>!`,
      promptHint: 'Slide Multiple Paternity from 0% (Monogamy) to 100% and watch the paternal Igf2 vessel vs. maternal Igf2r brake!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'CAPSTONE SYNTHESIS · SELFISH GENES & GENOMIC CONFLICT',
      heading: 'Genomic Conflict & Selfish Elements',
      bodyHtml: `Synthesize meiotic drive equilibria, CRISPR resistance escape, the C-value enigma, and Haig’s kinship theory of genomic imprinting.`,
    },
  ],
  teacherGuide: {
    estimatedMinutes: 30,
    level: 'Undergraduate Evolutionary Genetics & Genomics',
    learningObjectives: [
      'Model how meiotic drive (k > 0.5) defeats purifying selection and maintains deleterious or even lethal alleles at polymorphism.',
      'Predict how NHEJ cleavage-resistant alleles evolve to defeat synthetic CRISPR homing gene drives.',
      'Resolve the C-value enigma using transposable element proliferation and contrast pseudogenization, neofunctionalization, and DDC subfunctionalization.',
      'Apply Trivers’s parent–offspring conflict and Haig’s kinship theory to explain parental-origin genomic imprinting (Igf2 / Igf2r).',
    ],
    commonMisconceptions: [
      {
        misconception: 'Natural selection always improves organismal survival and reproduction.',
        correction:
          'Selection acts at the level of replicating genetic elements too: selfish meiotic drivers and transposons can spread while actively reducing individual fertility or viability.',
      },
      {
        misconception: 'Larger genomes mean more complex organisms with more genes.',
        correction:
          'The C-value enigma shows lungfish (~43 Gb) and onions (~16 Gb) have vastly larger genomes than humans (~3.1 Gb) with similar gene counts, driven mostly by transposable elements.',
      },
    ],
    discussionPrompts: [
      'Why does the mouse t-haplotype persist in nature even though t/t embryos die before birth?',
      'How can bioengineers redesign CRISPR gene drives (e.g., multiplexed guide RNAs targeting essential conserved sites) to slow resistance escape?',
      'Why does David Haig’s kinship theory predict that loss of maternal Igf2r causes fetal overgrowth whereas loss of paternal Igf2 causes dwarfism?',
    ],
    activityTip:
      'On Page 1, have students set Homozygote Cost s = 1.00 (100% lethal!) and Drive k = 0.85, then watch the lethal selfish allele stabilize near p* ≈ 0.41!',
  },
  scienceCard: {
    coreTakeaway:
      'Genomes are not perfectly harmonious blueprints — they are arenas of intragenomic conflict where selfish meiotic drivers, CRISPR drives, mobile transposons, and parentally imprinted alleles follow gene-level inclusive-fitness incentives that can diverge sharply from organismal optima.',
    assumptions: [
      {
        label: 'Exact single-locus meiotic drive recursion (k vs recessive cost s)',
        status: 'realistic',
        tag: 'Exact recursion',
        detail:
          'Computes deterministic diploid survivor and gametic frequencies with heterozygote segregation distortion k.',
      },
      {
        label: 'Three-allele CRISPR drive model (D, W, R)',
        status: 'realistic',
        tag: 'Unckless et al. 2017',
        detail:
          'Captures germline homing conversion, NHEJ cleavage-resistant allele generation, and fitness cost of the drive payload.',
      },
      {
        label: 'Empirical genome size & TE percentages (NCBI / Ensembl)',
        status: 'realistic',
        tag: 'Empirical data',
        detail:
          'Uses benchmark genome assemblies for E. coli, Takifugu rubripes, Homo sapiens, Zea mays, and Neoceratodus forsteri.',
      },
    ],
    citations: [
      {
        authors: 'Burt, A. & Trivers, R.',
        year: 2006,
        title: 'Genes in Conflict: The Biology of Selfish Genetic Elements',
        journal: 'Harvard University Press',
      },
      {
        authors: 'Unckless, R. L., Clark, A. G. & Messer, P. W.',
        year: 2017,
        title: 'Evolution of resistance against CRISPR/Cas9 gene drive',
        journal: 'Genetics 205(2): 827–841',
      },
      {
        authors: 'Haig, D.',
        year: 1993,
        title: 'Genetic conflicts in human pregnancy',
        journal: 'Quarterly Review of Biology 68(4): 495–532',
      },
      {
        authors: 'Force, A. et al.',
        year: 1999,
        title: 'Preservation of duplicate genes by complementary, degenerative mutations',
        journal: 'Genetics 151(4): 1531–1545',
      },
    ],
    standards: {
      undergrad: [
        'Intragenomic Conflict & Selfish Genetic Elements',
        'Genome Architecture, Transposons & Gene Duplication',
        'Kin Selection, Parent–Offspring Conflict & Genomic Imprinting',
      ],
      apOrALevel: [
        'AP Bio 6.7 — Mutations & Genomic Structural Change',
        'AP Bio 7.4 — Population Genetics & Non-Mendelian Inheritance',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-topbar">
        <div class="plate-caption-pill" id="cf-caption">Selfish Spindle · Meiotic Drive</div>
        <div class="plate-tools">
          <button class="plate-tool-btn" id="cf-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="cf-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="cf-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="cf-canvas-host"></div>
      <div class="hwe-plate-legend" id="cf-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D genomic conflict models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#cf-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#cf-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#cf-legend') as HTMLElement;

    const scene = new ConflictScene3D(canvasHost);
    (plateStageEl.querySelector('#cf-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoomIn());
    (plateStageEl.querySelector('#cf-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoomOut());
    (plateStageEl.querySelector('#cf-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let driveK = 0.85;
    let driveS = 0.7;
    let homingC = 0.92;
    let nhejR = 0.08;
    let driveCost = 0.25;
    let selectedGenome: GenomeTaxon['id'] = 'human';
    let dupFate: DuplicationFateId = 'sub';
    let multiPat = 0.75;
    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = (): void => {
      const pageId = PAGE_IDS[currentStep] ?? 'drive';
      scene.setPage(pageId);

      if (pageId === 'drive') {
        const res = simulateMeioticDrive(driveK, driveS);
        scene.updateDriveScene(res);
        captionEl.textContent = `Drive k = ${driveK.toFixed(2)} · Cost s = ${driveS.toFixed(2)} → Equilibrium p*(D) = ${res.equilibriumP.toFixed(2)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c44536"></i>Driving Allele D</span>
          <span><i class="hwe-dot" style="background:#49798e"></i>Wild-Type Allele d</span>
          <span><i class="hwe-dot" style="background:#dda23e"></i>Egg Pole / Kinetochore</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Meiotic Drive vs Organismal Viability</div>
              <label class="lic-slider-label">
                <span>Heterozygote Transmission k = <strong>${driveK.toFixed(2)}</strong></span>
                <input type="range" id="cf-k" min="0.5" max="0.98" step="0.02" value="${driveK}" />
              </label>
              <label class="lic-slider-label" style="margin-top:6px;">
                <span>Homozygote DD Cost s = <strong>${driveS.toFixed(2)}</strong></span>
                <input type="range" id="cf-s" min="0" max="1" step="0.05" value="${driveS}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn" data-dpreset="0.85,1.0">Mouse t-Haplotype (Lethal!)</button>
                <button class="lic-pill-btn" data-dpreset="0.50,0.4">Fair Mendel (k=0.50)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#cf-k') as HTMLInputElement).addEventListener('input', (e) => {
          driveK = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#cf-s') as HTMLInputElement).addEventListener('input', (e) => {
          driveS = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-dpreset]').forEach((b) =>
          b.addEventListener('click', () => {
            const [kStr, sStr] = (b.dataset.dpreset || '0.85,0.7').split(',');
            driveK = Number(kStr);
            driveS = Number(sStr);
            renderPage();
          }),
        );
      } else if (pageId === 'crispr') {
        const res = simulateCrisprDrive(homingC, nhejR, driveCost);
        scene.updateCrisprScene(res);
        captionEl.textContent = `Gen 24: Drive ${Math.round(res.finalD * 100)}% · Wild ${Math.round(res.finalW * 100)}% · Resistant ${Math.round(res.finalR * 100)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c44536"></i>CRISPR Drive (D)</span>
          <span><i class="hwe-dot" style="background:#49798e"></i>Wild-Type (W)</span>
          <span><i class="hwe-dot" style="background:#d89c3b"></i>NHEJ Resistant (R)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">CRISPR Homing Conversion vs NHEJ Resistance</div>
              <label class="lic-slider-label">
                <span>NHEJ Resistance Rate r = <strong>${Math.round(nhejR * 100)}%</strong></span>
                <input type="range" id="cf-r" min="0" max="0.25" step="0.01" value="${nhejR}" />
              </label>
              <label class="lic-slider-label" style="margin-top:6px;">
                <span>Drive Fitness Cost s_D = <strong>${Math.round(driveCost * 100)}%</strong></span>
                <input type="range" id="cf-dc" min="0.05" max="0.55" step="0.05" value="${driveCost}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn" data-cpreset="0.00,0.20">Zero NHEJ (Clean Sweep)</button>
                <button class="lic-pill-btn" data-cpreset="0.12,0.30">Resistance Escape!</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.outcome}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#cf-r') as HTMLInputElement).addEventListener('input', (e) => {
          nhejR = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#cf-dc') as HTMLInputElement).addEventListener('input', (e) => {
          driveCost = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-cpreset]').forEach((b) =>
          b.addEventListener('click', () => {
            const [rStr, cStr] = (b.dataset.cpreset || '0.08,0.25').split(',');
            nhejR = Number(rStr);
            driveCost = Number(cStr);
            renderPage();
          }),
        );
      } else if (pageId === 'transposons') {
        const cur = CVALUE_TAXA.find((t) => t.id === selectedGenome) ?? CVALUE_TAXA[2]!;
        scene.updateTransposonScene(selectedGenome);
        captionEl.textContent = `${cur.name}: ${cur.genomeMb.toLocaleString()} Mb · ~${cur.codingGenes.toLocaleString()} genes · ${cur.tePercent}% Transposons`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3e7858"></i>Protein-Coding Core</span>
          <span><i class="hwe-dot" style="background:#c85a3a"></i>Selfish Transposons (TEs)</span>
          <span><i class="hwe-dot" style="background:#d8ccb2"></i>Other Non-Coding DNA</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">C-Value Paradox Spools (Left → Right: E. coli to Lungfish)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                ${CVALUE_TAXA.map((t) => {
                  const short =
                    t.id === 'ecoli'
                      ? 'E. coli'
                      : t.id === 'lungfish'
                        ? 'Lungfish'
                        : t.name.split(' ')[0];
                  return `<button class="lic-pill-btn ${selectedGenome === t.id ? 'active' : ''}" data-gen="${t.id}">${short}</button>`;
                }).join('')}
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Size: ${cur.genomeMb.toLocaleString()} Mb</span>
                <span class="hwe-stat-badge">Genes: ~${cur.codingGenes.toLocaleString()}</span>
                <span class="hwe-stat-badge">TEs: ${cur.tePercent}%</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;"><strong>${cur.name}:</strong> ${cur.note}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-gen]').forEach((b) =>
          b.addEventListener('click', () => {
            selectedGenome = b.dataset.gen as GenomeTaxon['id'];
            renderPage();
          }),
        );
      } else if (pageId === 'duplication') {
        const fate = DUPLICATION_FATES[dupFate];
        scene.updateDuplicationScene(fate);
        captionEl.textContent = fate.title;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3e7858"></i>Tissue-1 Enhancer</span>
          <span><i class="hwe-dot" style="background:#d89c3b"></i>Tissue-2 Enhancer</span>
          <span><i class="hwe-dot" style="background:#c44536"></i>Novel Evolved Protein</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Evolutionary Fate of Duplicated Gene Pair (Copy A &amp; Copy B)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;">
                <button class="lic-pill-btn ${dupFate === 'pseudo' ? 'active' : ''}" data-df="pseudo">Pseudogene</button>
                <button class="lic-pill-btn ${dupFate === 'neo' ? 'active' : ''}" data-df="neo">Neofunct.</button>
                <button class="lic-pill-btn ${dupFate === 'sub' ? 'active' : ''}" data-df="sub">DDC Subfunct.</button>
              </div>
              <ul style="font-size:11.5px;margin:8px 0 0;padding-left:16px;color:#4a4033;line-height:1.45;">
                <li><strong>Copy A (Top):</strong> ${fate.copyAStatus}</li>
                <li><strong>Copy B (Bottom):</strong> ${fate.copyBStatus}</li>
              </ul>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${fate.explain}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-df]').forEach((b) =>
          b.addEventListener('click', () => {
            dupFate = b.dataset.df as DuplicationFateId;
            renderPage();
          }),
        );
      } else if (pageId === 'imprinting') {
        const res = evaluateImprinting(multiPat);
        scene.updateImprintingScene(res);
        captionEl.textContent = `Multiple Paternity = ${Math.round(multiPat * 100)}% · Paternal Sibling r = ${res.paternityR.toFixed(2)}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c44e3a"></i>Paternal Igf2 (Growth Accelerator)</span>
          <span><i class="hwe-dot" style="background:#447864"></i>Maternal Igf2r (Growth Brake)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Haig’s Kinship Theory of Genomic Imprinting</div>
              <label class="lic-slider-label">
                <span>Multiple Paternity Across Litters = <strong>${Math.round(multiPat * 100)}%</strong></span>
                <input type="range" id="cf-mp" min="0" max="1" step="0.05" value="${multiPat}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${multiPat < 0.2 ? 'active' : ''}" data-mp="0.0">Monogamy (0%)</button>
                <button class="lic-pill-btn ${multiPat > 0.7 ? 'active' : ''}" data-mp="0.9">Polyandry (90%)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.conflictZoneLabel}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#cf-mp') as HTMLInputElement).addEventListener('input', (e) => {
          multiPat = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-mp]').forEach((b) =>
          b.addEventListener('click', () => {
            multiPat = Number(b.dataset.mp);
            renderPage();
          }),
        );
      } else {
        captionEl.textContent = 'Plate 22 Capstone · Genomic Conflict & Selfish Elements';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c44536"></i>Selfish Driver</span>
          <span><i class="hwe-dot" style="background:#dda23e"></i>Kinetochore</span>
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
          ctx.completeChapter('conflict', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the intragenomic conflict plate above.'
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
