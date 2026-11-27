// =============================================================================
// Chapter 21: Cytochrome c & Comparative Methods — Closing Techartist Gap #2!
// Folded 3D Cytochrome c + Heme Alignment, Distance Phylogram, Felsenstein PIC,
// ML Ancestral State Pies & Shared Primate GULO Pseudogenes / ERVs
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import { CytochromeScene3D, type CytochromePageId } from './CytochromeScene3D';
import {
  CYTC_TAXA,
  compareCytc,
  evaluateAncestralState,
  evaluateFelsensteinPic,
  type CytcTaxon,
} from './cytochromeMath';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'cytochrome')!;

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
    id: 'cy1-motif',
    prompt:
      'Human and Rhesus Macaque Cytochrome c differ at only 1 of 104 amino acids, whereas Human and Yeast differ at 44 — yet ALL FIVE species retain the exact C-X-X-C-H heme-binding motif. Why?',
    options: [
      {
        id: 'a',
        label: 'Strong purifying selection locks the catalytic heme pocket while tolerant/neutral sites diverge with evolutionary time.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Yeast cannot undergo point mutations in its mitochondrial proteins.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Humans and macaques independently converged on 103 identical residues by coincidence.',
        correct: false,
      },
    ],
    explanation:
      'Purifying selection purges lethal mutations in the heme-binding pocket while neutral surface residues accumulate substitutions proportionally to divergence time.',
  },
  {
    id: 'cy2-pic',
    prompt:
      'In Felsenstein’s (1985) worst-case clade split, naive regression across 10 species gives R² = 0.89 (p < 0.0001) even though traits X and Y evolved independently. What statistical fallacy occurred?',
    options: [
      {
        id: 'a',
        label: 'Phylogenetic pseudoreplication: one ancient ancestral shift on a deep stem was counted five times across descendant species.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Ordinary regression cannot be calculated on continuous traits.',
        correct: false,
      },
      {
        id: 'c',
        label: 'DNA mutates faster in clades with more species.',
        correct: false,
      },
    ],
    explanation:
      'Species share evolutionary history along shared branches; Felsenstein’s Phylogenetic Independent Contrasts (PIC) compares standardized sister-lineage differences to restore independence (R² = 0.04, NS).',
  },
  {
    id: 'cy3-anc',
    prompt:
      'In maximum-likelihood ancestral state reconstruction, what happens at the deep root node when the trait transition rate λ becomes very high?',
    options: [
      {
        id: 'a',
        label: 'Repeated hidden gains and losses saturate deep branches, driving root posterior probabilities toward ~50/50 uncertainty.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Deep ancestral inference becomes 100% certain because more changes provide more signal.',
        correct: false,
      },
      {
        id: 'c',
        label: 'High λ guarantees the ancestor was always winged.',
        correct: false,
      },
    ],
    explanation:
      'Fast back-and-forth transitions overwrite ancestral memory (saturation), which honest ML models report as balanced uncertainty.',
  },
  {
    id: 'cy4-gulo',
    prompt:
      'Humans, chimpanzees, and gorillas all share the EXACT SAME frameshift deletion in Exon 10 of the non-functional GULO Vitamin-C pseudogene (plus orthologous ERV-K insertions), while guinea pigs broke GULO at a different site. What does this demonstrate?',
    options: [
      {
        id: 'a',
        label: 'Shared non-functional genomic "typos" inherited from a single common primate ancestor — decisive evidence of common descent.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Guinea pigs are more closely related to humans than gorillas are.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Natural selection forced all primates to delete the exact same base pair independently.',
        correct: false,
      },
    ],
    explanation:
      'Because broken pseudogenes and neutral ERV integration coordinates are unconstrained by adaptive convergence, identical shared scars clinch shared ancestry.',
  },
];

const PAGE_IDS: CytochromePageId[] = ['cytc', 'tree', 'pic', 'ancestral', 'pseudogenes', 'check'];

export const CH21_CYTOCHROME: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'cytc',
      shortLabel: '1 Cyt c',
      eyebrow: 'MOLECULAR HOMOLOGY · CYTOCHROME C (104 AMINO ACIDS)',
      heading: 'Cytochrome c & Comparative Methods',
      bodyHtml: `Compare authentic eukaryotic ${gloss('cytochrome_c', 'Cytochrome c')} sequences against Human on a 3D folded heme protein. Purifying selection locks the golden <strong>CXXCH</strong> heme-binding pocket across 1.1 billion years while neutral surface residues accumulate substitutions!`,
      promptHint: 'Switch species below to light up substituted amino acids on the 3D protein ribbon!',
    },
    {
      id: 'tree',
      shortLabel: '2 Tree',
      eyebrow: 'DISTANCE MATRICES · MOLECULAR PHYLOGRAM',
      heading: 'Cytochrome c & Comparative Methods',
      bodyHtml: `Converting pairwise amino-acid differences into branch lengths independently recovers the exact ${gloss('phylogeny', 'evolutionary branching order')} known from fossils and osteology — Primates ⊂ Mammals ⊂ Vertebrates ⊂ Eukaryotes — without using a single bone!`,
      promptHint: 'Inspect the 3D proportional branch lengths built directly from the 104-residue difference matrix.',
    },
    {
      id: 'pic',
      shortLabel: '3 Felsenstein PIC',
      eyebrow: 'FELSENSTEIN (1985) · COMPARATIVE METHODS',
      heading: 'Cytochrome c & Comparative Methods',
      bodyHtml: `Species are <strong>not</strong> independent statistical data points — they share evolutionary history! Naive cross-species regression creates massive false correlations unless corrected with ${gloss('felsenstein_pic', 'Phylogenetic Independent Contrasts (PIC)')}.`,
      promptHint: 'Toggle Naive Tip Regression vs. Felsenstein PIC on the exact same 10 species!',
    },
    {
      id: 'ancestral',
      shortLabel: '4 Ancestors',
      eyebrow: 'MAXIMUM LIKELIHOOD · ANCESTRAL STATE RECONSTRUCTION',
      heading: 'Cytochrome c & Comparative Methods',
      bodyHtml: `Biologists infer extinct traits via ${gloss('ancestral_state', 'ancestral state reconstruction')}, computing posterior probabilities at every internal node — and honestly showing how fast transition rates saturate deep branches toward uncertainty!`,
      promptHint: 'Slide transition rate λ from Slow (0.15) to Fast Saturation (1.65) and watch the 3D root pie disc!',
    },
    {
      id: 'pseudogenes',
      shortLabel: '5 Pseudogenes',
      eyebrow: 'GENOMIC FOSSILS · GULO PSEUDOGENE & ORTHOLOGOUS ERVS',
      heading: 'Cytochrome c & Comparative Methods',
      bodyHtml: `Even more decisive than working proteins are shared broken “typos”: humans, chimps, and gorillas share the exact same Exon-10 deletion in the Vitamin-C ${gloss('pseudogene', 'GULO pseudogene')} plus orthologous ERV-K insertions at identical chromosomal coordinates!`,
      promptHint: 'Compare the aligned 3D primate chromosomes (top 3) against guinea pig (bottom) with its independent scar.',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'CAPSTONE SYNTHESIS · COMPARATIVE PHYLOGENETICS',
      heading: 'Cytochrome c & Comparative Methods',
      bodyHtml: `Apply purifying selection, Felsenstein’s PIC, ancestral-state saturation, and shared pseudogene markers across four undergraduate comparative-methods cases.`,
    },
  ],
  teacherGuide: {
    estimatedMinutes: 30,
    level: 'Undergraduate Molecular Evolution & Comparative Phylogenetics',
    learningObjectives: [
      'Contrast strong purifying selection at catalytic motifs (CXXCH heme pocket) against neutral divergence across surface residues in Cytochrome c.',
      'Explain phylogenetic pseudoreplication (Felsenstein 1985) and apply Phylogenetic Independent Contrasts (PIC) to test correlated trait evolution.',
      'Interpret maximum-likelihood ancestral state pies under low vs. saturating evolutionary transition rates.',
      'Use shared broken pseudogene deletions (GULO Exon 10) and orthologous endogenous retroviruses (ERVs) as rigorous tests of common descent.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Each species in a cross-species scatter plot is an independent statistical sample.',
        correction:
          'Related species inherit trait values along shared branches. One deep ancestral shift gets replicated across every descendant tip unless corrected by PIC or PGLS.',
      },
      {
        misconception: 'Molecular similarity just reflects similar lifestyles rather than common ancestry.',
        correction:
          'Cytochrome c performs the exact same respiratory role in yeast, tuna, horses, and humans, yet tracks branching ancestry — and non-functional GULO pseudogene deletions cannot be explained by functional convergence.',
      },
    ],
    discussionPrompts: [
      'Why do humans and Rhesus macaques share 103 of 104 Cytochrome c amino acids while Yeast differs at 44?',
      'In Felsenstein’s two-clade example, why does a huge p < 0.0001 vanish completely once sister contrasts are computed?',
      'Why is an identical broken typo in a pseudogene stronger phylogenetic evidence than a shared functional enzyme?',
    ],
    activityTip:
      'Have students toggle Naive Regression vs. Felsenstein PIC on Page 3 and watch the exact same 10 species drop from R² = 0.89 to R² = 0.04!',
  },
  scienceCard: {
    coreTakeaway:
      'Homologous proteins like Cytochrome c preserve catalytic motifs under purifying selection while recording branching ancestry in neutral sites; rigorous comparative tests require phylogenetic independent contrasts (Felsenstein 1985) and explicit ancestral-state models, corroborated by shared genomic fossils like GULO pseudogenes and orthologous ERVs.',
    assumptions: [
      {
        label: 'Authentic UniProt Cytochrome c sequences (positions 1–18 + 104-aa totals)',
        status: 'realistic',
        tag: 'Empirical data',
        detail:
          'Matches mature eukaryotic Cytochrome c for Homo sapiens, Macaca mulatta, Equus caballus, Thunnus alalunga, and Saccharomyces cerevisiae.',
      },
      {
        label: 'Felsenstein (1985) worst-case two-clade split',
        status: 'realistic',
        tag: 'Exact phenomenon',
        detail:
          'Reproduces Felsenstein’s classic Am. Nat. Fig. 6 showing spurious tip correlation from one ancient divergence versus zero within-clade correlated evolution.',
      },
      {
        label: 'Symmetric Mk continuous-time Markov ancestral model',
        status: 'simplified',
        tag: '1-param Mk',
        detail:
          'Uses a single symmetric gain/loss rate λ to illustrate deep-branch saturation; empirical studies also evaluate asymmetric ARD models.',
      },
    ],
    citations: [
      {
        authors: 'Margoliash, E.',
        year: 1963,
        title: 'Primary structure and evolution of cytochrome c',
        journal: 'PNAS 50(4): 672–679',
      },
      {
        authors: 'Felsenstein, J.',
        year: 1985,
        title: 'Phylogenies and the comparative method',
        journal: 'The American Naturalist 125(1): 1–15',
      },
      {
        authors: 'Nishikimi, M. et al.',
        year: 1994,
        title: 'Cloning and chromosomal mapping of the human nonfunctional gene for L-gulono-γ-lactone oxidase',
        journal: 'J. Biol. Chem. 269: 13685–13688',
      },
    ],
    standards: {
      undergrad: [
        'Molecular Homology & Purifying Selection',
        'Phylogenetic Comparative Methods (PIC / PGLS)',
        'Ancestral State Reconstruction & Genomic Fossils',
      ],
      apOrALevel: [
        'AP Bio 7.6 — Evidence of Evolution (Molecular Homology)',
        'AP Bio 7.9 — Phylogeny & Shared Derived Characters',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-topbar">
        <div class="plate-caption-pill" id="cy-caption">Human vs Horse Cytochrome c</div>
        <div class="plate-tools">
          <button class="plate-tool-btn" id="cy-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="cy-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="cy-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="cy-canvas-host"></div>
      <div class="hwe-plate-legend" id="cy-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D molecular &amp; comparative models</div>
    `;

    const canvasHost = plateStageEl.querySelector('#cy-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#cy-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#cy-legend') as HTMLElement;

    const scene = new CytochromeScene3D(canvasHost);
    (plateStageEl.querySelector('#cy-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoomIn());
    (plateStageEl.querySelector('#cy-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoomOut());
    (plateStageEl.querySelector('#cy-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let selectedTaxon: CytcTaxon['id'] = 'horse';
    let usePic = false;
    let transRate = 0.35;
    const answers: Record<string, string> = {};
    let stamped = false;

    const renderAlignmentHtml = (cmp: ReturnType<typeof compareCytc>): string => {
      const hChars = cmp.human.seqWindow.split('');
      const tChars = cmp.target.seqWindow.split('');
      const rowH = hChars
        .map(
          (ch, i) =>
            `<span style="display:inline-block;width:13px;text-align:center;font-weight:${i >= 13 ? '700' : '500'};color:${i >= 13 ? '#8f5811' : '#3a2d21'}">${ch}</span>`,
        )
        .join('');
      const rowT = tChars
        .map((ch, i) => {
          const diff = ch !== hChars[i];
          return `<span style="display:inline-block;width:13px;text-align:center;border-radius:2px;font-weight:${diff ? '700' : '500'};background:${diff ? '#c84b36' : 'transparent'};color:${diff ? '#fff' : i >= 13 ? '#8f5811' : '#3a2d21'}">${ch}</span>`;
        })
        .join('');
      return `
        <div style="font-family:var(--font-mono,monospace);font-size:11px;line-height:1.75;background:#f7f2e7;border:1px solid #d9ccb6;border-radius:6px;padding:7px 9px;margin-top:8px;">
          <div><strong style="display:inline-block;width:48px;">Human</strong>${rowH}</div>
          <div><strong style="display:inline-block;width:48px;">${cmp.target.name.split(' ')[0]}</strong>${rowT}</div>
          <div style="font-size:10px;color:#6f5b44;margin-top:3px;">Pos 1–18 · Gold = invariant CXXCH heme pocket · Red = substitution</div>
        </div>
      `;
    };

    const renderPage = (): void => {
      const pageId = PAGE_IDS[currentStep] ?? 'cytc';
      scene.setPage(pageId);

      if (pageId === 'cytc') {
        const cmp = compareCytc(selectedTaxon);
        scene.updateCytcModel(cmp);
        captionEl.textContent = `Human vs ${cmp.target.name}: ${cmp.fullDiffs}/104 aa diffs (${cmp.percentIdentity.toFixed(1)}% identical)`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#a32a37"></i>Heme Porphyrin &amp; Fe²⁺</span>
          <span><i class="hwe-dot" style="background:#dea23d"></i>Conserved CXXCH Motif</span>
          <span><i class="hwe-dot" style="background:#ca4c37"></i>Substituted Residues</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Compare Human Cytochrome c Against:</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                ${CYTC_TAXA.filter((t) => t.id !== 'human')
                  .map(
                    (t) =>
                      `<button class="lic-pill-btn ${selectedTaxon === t.id ? 'active' : ''}" data-tax="${t.id}">${t.name}</button>`,
                  )
                  .join('')}
              </div>
              ${renderAlignmentHtml(cmp)}
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>${cmp.target.name} (<em>${cmp.target.latin}</em>):</strong> ${cmp.fullDiffs} amino-acid differences across 104 residues (${cmp.percentIdentity.toFixed(1)}% identity; ~${cmp.target.divergenceMa} Ma divergence).
              </p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-tax]').forEach((b) =>
          b.addEventListener('click', () => {
            selectedTaxon = b.dataset.tax as CytcTaxon['id'];
            renderPage();
          }),
        );
      } else if (pageId === 'tree') {
        captionEl.textContent = 'Empirical Cytochrome c Distance Phylogram (104-aa Matrix)';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#8e3f4b"></i>Human / Rhesus</span>
          <span><i class="hwe-dot" style="background:#a27e55"></i>Horse (12)</span>
          <span><i class="hwe-dot" style="background:#4a7992"></i>Tuna (21)</span>
          <span><i class="hwe-dot" style="background:#cca956"></i>Yeast (44)</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Empirical Pairwise Amino-Acid Differences vs Human</div>
              <table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:4px;">
                <thead><tr style="border-bottom:1px solid #d7cab4;text-align:left;">
                  <th style="padding:3px 0;">Species</th><th>Diffs</th><th>Identity</th><th>Split</th>
                </tr></thead>
                <tbody>
                  ${CYTC_TAXA.map(
                    (t) => `<tr style="border-bottom:1px solid #eee5d4;">
                      <td style="padding:3px 0;"><strong>${t.name}</strong></td>
                      <td>${t.diffsVsHuman}/104</td>
                      <td>${(((104 - t.diffsVsHuman) / 104) * 100).toFixed(1)}%</td>
                      <td>${t.divergenceMa === 0 ? 'Ref' : `~${t.divergenceMa} Ma`}</td>
                    </tr>`,
                  ).join('')}
                </tbody>
              </table>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Independent Consilience:</strong> One 104-aa mitochondrial protein recovers the exact nested clades known from fossil strata &amp; anatomy!
              </p>
            </div>
          </div>
        `;
      } else if (pageId === 'pic') {
        const res = evaluateFelsensteinPic(usePic);
        scene.updatePicScene(res);
        captionEl.textContent = usePic
          ? `Felsenstein PIC: R² = ${res.picR2.toFixed(2)} (${res.picP})`
          : `Naive Tip Regression: R² = ${res.naiveR2.toFixed(2)} (${res.naiveP})`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#42798a"></i>Clade A (5 spp.)</span>
          <span><i class="hwe-dot" style="background:#c46143"></i>Clade B (5 spp.)</span>
          <span><i class="hwe-dot" style="background:${usePic ? '#417d5a' : '#bc3429'}"></i>${usePic ? 'True PIC Contrasts' : 'Spurious Clade Line'}</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Comparative Statistical Method (Same 10 Species!)</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${!usePic ? 'active' : ''}" data-pic="0">Naive Tip Regression</button>
                <button class="lic-pill-btn ${usePic ? 'active' : ''}" data-pic="1">Felsenstein PIC</button>
              </div>
              <div class="lic-stat-row" style="margin-top:8px;">
                <span class="hwe-stat-badge">Naive R² = ${res.naiveR2.toFixed(2)} (Spurious!)</span>
                <span class="hwe-stat-badge">PIC R² = ${res.picR2.toFixed(2)} (True NS)</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                ${
                  usePic
                    ? '<strong>Phylogenetic Independent Contrasts (PIC):</strong> By differencing sister pairs along independent branches, the false clade-split artifact vanishes (p = 0.58)!'
                    : '<strong>Felsenstein’s Worst-Case Split:</strong> One ancient divergence between Clade A and Clade B creates a fake p &lt; 0.0001 correlation across 10 non-independent tips!'
                }
              </p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-pic]').forEach((b) =>
          b.addEventListener('click', () => {
            usePic = b.dataset.pic === '1';
            renderPage();
          }),
        );
      } else if (pageId === 'ancestral') {
        const res = evaluateAncestralState(transRate);
        scene.updateAncestralScene(res);
        captionEl.textContent = `Transition Rate λ = ${res.transitionRate.toFixed(2)} · Root P(Wingless) = ${Math.round((1 - res.rootWingProb) * 100)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#3f775a"></i>Wingless State</span>
          <span><i class="hwe-dot" style="background:#db9e3e"></i>Winged State</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Maximum-Likelihood Mk Transition Rate</div>
              <label class="lic-slider-label">
                <span>Transition Rate λ = <strong>${res.transitionRate.toFixed(2)}</strong></span>
                <input type="range" id="cy-rate" min="0.1" max="1.8" step="0.05" value="${transRate}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${transRate < 0.3 ? 'active' : ''}" data-preset="0.15">Slow (0.15)</button>
                <button class="lic-pill-btn ${transRate >= 0.3 && transRate < 1.1 ? 'active' : ''}" data-preset="0.65">Moderate</button>
                <button class="lic-pill-btn ${transRate >= 1.1 ? 'active' : ''}" data-preset="1.65">Saturated</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Root Pie:</strong> ${Math.round((1 - res.rootWingProb) * 100)}% Wingless · ${Math.round(res.rootWingProb * 100)}% Winged.<br/>
                ${res.uncertaintyLabel}
              </p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#cy-rate') as HTMLInputElement).addEventListener('input', (e) => {
          transRate = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-preset]').forEach((b) =>
          b.addEventListener('click', () => {
            transRate = Number(b.dataset.preset);
            renderPage();
          }),
        );
      } else if (pageId === 'pseudogenes') {
        captionEl.textContent = 'Shared Primate GULO Exon-10 Deletion & Orthologous ERV-K Loci';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#c74738"></i>Shared Primate GULO Scar</span>
          <span><i class="hwe-dot" style="background:#48778d"></i>Orthologous ERV-K</span>
          <span><i class="hwe-dot" style="background:#cc9538"></i>Independent Guinea-Pig Scar</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Aligned 3D Chromosomes (Top → Bottom)</div>
              <ul style="font-size:11.5px;margin:6px 0 0;padding-left:16px;color:#4a4033;line-height:1.45;">
                <li><strong>1. Human:</strong> Broken Exon-10 GULO deletion (red) + orthologous ERV-K (blue)</li>
                <li><strong>2. Chimpanzee:</strong> Exact same Exon-10 scar + identical ERV-K locus</li>
                <li><strong>3. Gorilla:</strong> Exact same Exon-10 scar + identical ERV-K locus</li>
                <li><strong>4. Guinea Pig:</strong> Independent Vitamin-C mutation at a different exon (gold) — zero primate ERV-K!</li>
              </ul>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">
                <strong>Smoking Gun of Ancestry:</strong> Identical non-functional typos and quasi-random viral insertions at identical base-pair coordinates clinch common descent!
              </p>
            </div>
          </div>
        `;
      } else {
        captionEl.textContent = 'Plate 21 Capstone · Cytochrome c & Comparative Phylogenetics';
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#a32a37"></i>Heme</span>
          <span><i class="hwe-dot" style="background:#4a7b91"></i>Cytochrome c</span>
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
          ctx.completeChapter('cytochrome', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the molecular & comparative plate above.'
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
