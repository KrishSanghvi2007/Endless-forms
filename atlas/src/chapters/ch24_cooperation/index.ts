// =============================================================================
// Chapter 24: Reciprocity, Eusociality & Mutualisms
// Reviving Tangled Bank "Blood Debts" & "The Guest"!
// 1. Vampire Bat Reciprocal Altruism & Iterated Prisoner's Dilemma (TFT / GTFT)
// 2. Indirect Reciprocity & Reputation Image Scoring (Nowak & Sigmund 1998)
// 3. Eusociality: Boomsma Monogamy Hypothesis & Fortress Defense
// 4. Legume-Rhizobium Host Sanctions (Kiers et al. 2003)
// 5. Vertical vs Horizontal Symbiont Transmission (Buchnera in Aphids)
// 6. Capstone Check
// =============================================================================

import { ATLAS_DIRECTORY } from '../../data/curriculum';
import type { AtlasChapter, AtlasContext, ChapterInstance } from '../../types/atlas';
import { CooperationScene3D, type CooperationPageId } from './CooperationScene3D';
import {
  evaluateEusociality,
  evaluateHostSanctions,
  evaluateIndirectReciprocity,
  evaluateIpd,
  evaluateTransmission,
} from './cooperationMath';

const meta = ATLAS_DIRECTORY.find((c) => c.id === 'cooperation')!;

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
    id: 'co1-bats',
    prompt:
      'In Axelrod & Hamilton’s (1981) Iterated Prisoner’s Dilemma (illustrated by roosting vampire bats sharing blood meals), when can reciprocal strategies like Tit-for-Tat resist Always-Defect (ALLD) cheaters?',
    options: [
      {
        id: 'a',
        label: 'When the probability of future re-encounter (shadow of the future, w) exceeds the cost-to-benefit ratio (w > c/b), and rare mistakes are forgiven via Generous TFT.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Only in single one-shot encounters where individuals never meet again.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Only when the donor suffers a larger fitness cost than the recipient’s benefit (c > b).',
        correct: false,
      },
    ],
    explanation:
      'Direct reciprocity requires repeated interaction (w > c/b) and individual recognition; in noisy environments, Generous TFT prevents accidental retaliation spirals.',
  },
  {
    id: 'co2-boomsma',
    prompt:
      'Why does modern social-evolution theory (Boomsma 2009 Monogamy Hypothesis) emphasize strict lifetime monogamy over haplodiploidy alone to explain the origin of sterile eusocial worker castes?',
    options: [
      {
        id: 'a',
        label: 'Under strict monogamy, siblings share r = 0.50 on average (= own offspring!) in BOTH diploid (naked mole-rats, termites) and haplodiploid (bees, ants) species — opening the monogamy window whenever ecological fortress defense gives B/C > 1.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Because diploid animals can never evolve eusociality.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Because haplodiploid queens always mate with 20 unrelated males before eusociality evolves.',
        correct: false,
      },
    ],
    explanation:
      'Polyandry drops average sibling relatedness below 0.50; phylogenetic reconstructions show EVERY obligate eusocial lineage evolved from strictly monogamous ancestors!',
  },
  {
    id: 'co3-rhizobium',
    prompt:
      'In legume–Rhizobium root mutualisms, cheater bacteria that fix zero nitrogen save ATP and multiply faster inside a nodule — so why don’t cheaters drive mutualism extinct (Kiers et al. 2003)?',
    options: [
      {
        id: 'a',
        label: 'Host sanctions: the legume plant selectively cuts off oxygen and carbon supplies to non-fixing pale nodules while rewarding pink nitrogen-fixing nodules.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Soil bacteria are incapable of mutating to lose nitrogenase genes.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Cheater rhizobia die instantly upon touching clover roots.',
        correct: false,
      },
    ],
    explanation:
      'Partner choice and host sanctions align symbiont incentives by making cheating unprofitable inside the host!',
  },
  {
    id: 'co4-vert',
    prompt:
      'Why do strictly vertically transmitted endosymbionts (such as Buchnera passed directly from mother aphid to egg) almost universally evolve into benign or obligate mutualists, whereas horizontally transmitted symbionts often evolve higher virulence?',
    options: [
      {
        id: 'a',
        label: 'Vertical transmission ties the symbiont’s reproductive fate completely to host survival and fecundity, whereas horizontal transmission allows exploitative strains to jump to new hosts.',
        correct: true,
      },
      {
        id: 'b',
        label: 'Vertically transmitted bacteria have zero mutation rate.',
        correct: false,
      },
      {
        id: 'c',
        label: 'Horizontal transmission only occurs among unrelated plant species.',
        correct: false,
      },
    ],
    explanation:
      'Partner fidelity feedback under strict vertical inheritance eliminates conflict over host exploitation.',
  },
];

const PAGE_IDS: CooperationPageId[] = ['bats', 'reputation', 'eusociality', 'rhizobium', 'transmission', 'check'];

export const CH24_COOPERATION: AtlasChapter = {
  ...meta,
  steps: [
    {
      id: 'bats',
      shortLabel: '1 Blood Debts',
      eyebrow: 'WILKINSON (1984) & AXELROD (1981) · RECIPROCAL ALTRUISM',
      heading: 'Reciprocity, Eusociality & Mutualisms',
      bodyHtml: `A vampire bat (<em>Desmodus rotundus</em>) that fails to feed starves in 60 hours — yet roostmates regurgitate life-saving blood meals even to non-relatives! ${gloss('reciprocal_altruism', 'Reciprocal altruism')} evolves whenever the shadow of the future exceeds the cost-to-benefit ratio (<strong>w &gt; c/b</strong>)!`,
      promptHint: 'Adjust Re-encounter Probability (w) and Noise Error Rate to pit ALLD, Tit-for-Tat, and Generous TFT!',
    },
    {
      id: 'reputation',
      shortLabel: '2 Reputation',
      eyebrow: 'NOWAK & SIGMUND (1998) · INDIRECT RECIPROCITY',
      heading: 'Reciprocity, Eusociality & Mutualisms',
      bodyHtml: `What if two individuals never meet a second time? <strong>Indirect reciprocity</strong> (“I help you, and someone watching helps me”) sustains cooperation whenever reputation visibility exceeds the cost-to-benefit ratio (<strong>q &gt; c/b</strong>)!`,
      promptHint: 'Slide Reputation Visibility (q) across the c/b = 0.35 threshold to light up golden reputation halos!',
    },
    {
      id: 'eusociality',
      shortLabel: '3 Eusociality',
      eyebrow: 'BOOMSMA (2009) · MONOGAMY HYPOTHESIS & FORTRESS DEFENSE',
      heading: 'Reciprocity, Eusociality & Mutualisms',
      bodyHtml: `Why did sterile worker castes evolve in honeybees, ants, termites, AND diploid naked mole-rats? ${gloss('eusociality', 'Eusociality')} hinges on <strong>strict ancestral monogamy</strong> (making full siblings r = 0.50, equal to your own offspring!) paired with high ecological fortress defense (B/C &gt; 1)!`,
      promptHint: 'Compare Strict Monogamy (1 mate) against Polyandry (4 mates) and adjust Nest Fortress Benefit B/C!',
    },
    {
      id: 'rhizobium',
      shortLabel: '4 Host Sanctions',
      eyebrow: 'KIERS ET AL. (2003) · LEGUME–RHIZOBIUM POLICING',
      heading: 'Reciprocity, Eusociality & Mutualisms',
      bodyHtml: `Mutualisms are vulnerable to cheaters: soil <em>Rhizobium</em> strains that fix zero nitrogen save ATP and multiply faster! Legumes defeat cheaters via ${gloss('partner_sanctions', 'host sanctions')} — starving pale non-fixing nodules of oxygen &amp; sugars while nourishing pink N-fixing nodules!`,
      promptHint: 'Slide Host Sanction Strength from 0% (Cheater Collapse) to 100% (Lush Pink-Nodule Clover)!',
    },
    {
      id: 'transmission',
      shortLabel: '5 Symbionts',
      eyebrow: 'PARTNER FIDELITY · VERTICAL VS HORIZONTAL TRANSMISSION',
      heading: 'Reciprocity, Eusociality & Mutualisms',
      bodyHtml: `When a symbiont is passed strictly from mother to egg (<strong>vertical transmission</strong>, like <em>Buchnera</em> inside aphids), its fitness is locked to host survival — evolving obligate mutualism. Horizontal jumps decouple fates and favour exploitation!`,
      promptHint: 'Slide Vertical Transmission from 0% (Horizontal Pathogen) to 100% (Vertical Obligate Mutualist)!',
    },
    {
      id: 'check',
      shortLabel: '6 Check',
      eyebrow: 'CAPSTONE SYNTHESIS · COOPERATION & MUTUALISM',
      heading: 'Reciprocity, Eusociality & Mutualisms',
      bodyHtml: `Apply Axelrod’s w &gt; c/b, Boomsma’s monogamy hypothesis, legume host sanctions, and symbiont transmission alignment across four cases.`,
    },
  ],
  teacherGuide: {
    estimatedMinutes: 30,
    level: 'Undergraduate Behavioural Ecology & Social Evolution',
    learningObjectives: [
      'Derive and test Axelrod & Hamilton’s (1981) condition w > c/b for direct reciprocity and explain why Generous TFT outperforms strict TFT under execution noise.',
      'Explain how Nowak & Sigmund’s (1998) image-scoring condition q > c/b stabilizes indirect reciprocity among non-relatives.',
      'Contrast the outdated haplodiploidy-only hypothesis against Boomsma’s (2009) Monogamy Hypothesis + ecological fortress defense across bees and diploid naked mole-rats.',
      'Demonstrate how host sanctions (Kiers et al. 2003) and vertical symbiont transmission stabilize cross-species mutualisms against cheaters.',
    ],
    commonMisconceptions: [
      {
        misconception: 'Haplodiploidy alone explains why eusociality evolved.',
        correction:
          'While haplodiploid full sisters share r = 0.75, sisters share only r = 0.25 with brothers (average 0.50 across an equal sex ratio). Strict ancestral monogamy (r = 0.50 in both diploids and haplodiploids) plus ecological fortress defense explains eusociality across bees, ants, termites, and naked mole-rats.',
      },
      {
        misconception: 'Mutualisms persist simply because both species "want to help each other."',
        correction:
          'Mutualisms are reciprocal exploitations stabilized by partner choice, active host sanctions (starving cheater root nodules), or vertical transmission.',
      },
    ],
    discussionPrompts: [
      'Why does a small amount of noise (mistaken defection) ruin strict Tit-for-Tat yet favour Generous Tit-for-Tat?',
      'What happens to a clover plant if you experimentally block its ability to cut off oxygen to non-fixing Rhizobium nodules?',
      'Why do vertically transmitted endosymbionts like Buchnera lose hundreds of free-living genes over evolutionary time?',
    ],
    activityTip:
      'On Page 1, keep w = 0.85 and slide Noise Error Rate up to 10% to show students how Generous TFT overtakes strict TFT!',
  },
  scienceCard: {
    coreTakeaway:
      'Cooperation among non-relatives and across species is not an evolutionary paradox: it is rigorously stabilized by repeated-interaction reciprocity (w > c/b), reputation visibility (q > c/b), ancestral monogamy + fortress defense in eusociality, active host sanctions against cheaters, and vertical symbiont transmission.',
    assumptions: [
      {
        label: 'Iterated Prisoner’s Dilemma with execution noise (TFT vs GTFT vs ALLD)',
        status: 'realistic',
        tag: 'Axelrod & Nowak',
        detail:
          'Evaluates expected payoffs over geometric interaction horizon 1/(1−w) including error-cascade penalties for strict TFT.',
      },
      {
        label: 'Boomsma (2009) Monogamy Window relatedness equation',
        status: 'realistic',
        tag: 'Exact relatedness',
        detail:
          'Computes average sibling relatedness r = 0.25 + 0.25/M across mate count M for equal brood sex ratios.',
      },
      {
        label: 'Empirical soybean/clover Rhizobium oxygen-sanction response',
        status: 'simplified',
        tag: 'Kiers et al. 2003',
        detail:
          'Maps host sanction strength monotonically to cooperator nodule share and vegetative plant vigour.',
      },
    ],
    citations: [
      {
        authors: 'Wilkinson, G. S.',
        year: 1984,
        title: 'Reciprocal food sharing in the vampire bat',
        journal: 'Nature 308: 181–184',
      },
      {
        authors: 'Boomsma, J. J.',
        year: 2009,
        title: 'Lifetime monogamy and the evolution of eusociality',
        journal: 'Phil. Trans. R. Soc. B 364: 3191–3207',
      },
      {
        authors: 'Kiers, E. T., Rousseau, R. A., West, S. A. & Denison, R. F.',
        year: 2003,
        title: 'Host sanctions and the legume–rhizobium mutualism',
        journal: 'Nature 425: 78–81',
      },
    ],
    standards: {
      undergrad: [
        'Direct & Indirect Reciprocity (Game Theory)',
        'Eusociality & Inclusive Fitness (Monogamy Hypothesis)',
        'Mutualism Stability, Host Sanctions & Symbiosis',
      ],
      apOrALevel: [
        'AP Bio 8.1 — Responses to Environment & Cooperative Behaviour',
        'AP Bio 8.5 — Community Ecology & Symbiotic Mutualisms',
      ],
    },
  },

  mount(plateStageEl: HTMLElement, leftPanelEl: HTMLElement, ctx: AtlasContext): ChapterInstance {
    plateStageEl.innerHTML = `
      <div class="plate-topbar">
        <div class="plate-caption-pill" id="co-caption">Vampire Bat Reciprocity · Blood Debts</div>
        <div class="plate-tools">
          <button class="plate-tool-btn" id="co-zoom-in" title="Zoom in">＋</button>
          <button class="plate-tool-btn" id="co-zoom-out" title="Zoom out">－</button>
          <button class="plate-tool-btn" id="co-reset" title="Reset camera">Reset</button>
        </div>
      </div>
      <div class="plate-canvas-host" id="co-canvas-host"></div>
      <div class="hwe-plate-legend" id="co-legend"></div>
      <div class="plate-orbit-hint">Drag specimen plate to inspect 3D social &amp; mutualistic organisms</div>
    `;

    const canvasHost = plateStageEl.querySelector('#co-canvas-host') as HTMLElement;
    const captionEl = plateStageEl.querySelector('#co-caption') as HTMLElement;
    const legendEl = plateStageEl.querySelector('#co-legend') as HTMLElement;

    const scene = new CooperationScene3D(canvasHost);
    (plateStageEl.querySelector('#co-zoom-in') as HTMLElement).addEventListener('click', () => scene.zoomIn());
    (plateStageEl.querySelector('#co-zoom-out') as HTMLElement).addEventListener('click', () => scene.zoomOut());
    (plateStageEl.querySelector('#co-reset') as HTMLElement).addEventListener('click', () => scene.resetView());

    let currentStep = 0;
    let wFuture = 0.84;
    let noiseRate = 0.02;
    let repQ = 0.65;
    let matesCount = 1;
    let fortressBC = 1.6;
    let sanctionStr = 0.85;
    let verticalFrac = 0.9;
    const answers: Record<string, string> = {};
    let stamped = false;

    const renderPage = (): void => {
      const pageId = PAGE_IDS[currentStep] ?? 'bats';
      scene.setPage(pageId);

      if (pageId === 'bats') {
        const res = evaluateIpd(wFuture, 0.35, noiseRate);
        scene.updateBatsScene(res);
        captionEl.textContent = `Shadow of Future w = ${wFuture.toFixed(2)} (c/b = 0.35) · Winner: ${res.winner}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#6a5547"></i>Roosting Vampire Bats</span>
          <span><i class="hwe-dot" style="background:#b82e35"></i>Reciprocal Blood Sharing</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Iterated Prisoner’s Dilemma (c/b = 0.35)</div>
              <label class="lic-slider-label">
                <span>Future Re-encounter Prob w = <strong>${wFuture.toFixed(2)}</strong></span>
                <input type="range" id="co-w" min="0.1" max="0.95" step="0.05" value="${wFuture}" />
              </label>
              <label class="lic-slider-label" style="margin-top:6px;">
                <span>Execution Noise Error = <strong>${Math.round(noiseRate * 100)}%</strong></span>
                <input type="range" id="co-n" min="0" max="0.14" step="0.02" value="${noiseRate}" />
              </label>
              <div class="lic-stat-row" style="margin-top:6px;">
                <span class="hwe-stat-badge">Winner: ${res.winner}</span>
                <span class="hwe-stat-badge">w ${wFuture > 0.35 ? '>' : '≤'} c/b</span>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#co-w') as HTMLInputElement).addEventListener('input', (e) => {
          wFuture = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        (leftPanelEl.querySelector('#co-n') as HTMLInputElement).addEventListener('input', (e) => {
          noiseRate = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'reputation') {
        const res = evaluateIndirectReciprocity(repQ, 0.35);
        scene.updateReputationScene(res);
        captionEl.textContent = `Reputation Visibility q = ${repQ.toFixed(2)} vs c/b = 0.35 · ${res.coopStable ? 'Image Scoring Stable!' : 'Anonymity Collapse!'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#dfa33d"></i>Good Image-Score Halo</span>
          <span><i class="hwe-dot" style="background:#3e7858"></i>Cooperators</span>
          <span><i class="hwe-dot" style="background:#8c6b5a"></i>Defectors</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Nowak &amp; Sigmund (1998) Indirect Reciprocity</div>
              <label class="lic-slider-label">
                <span>Reputation Visibility q = <strong>${repQ.toFixed(2)}</strong></span>
                <input type="range" id="co-q" min="0.05" max="0.95" step="0.05" value="${repQ}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${repQ < 0.35 ? 'active' : ''}" data-qp="0.15">Anonymous (q=0.15)</button>
                <button class="lic-pill-btn ${repQ >= 0.35 ? 'active' : ''}" data-qp="0.75">Public Gossip (q=0.75)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#co-q') as HTMLInputElement).addEventListener('input', (e) => {
          repQ = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-qp]').forEach((b) =>
          b.addEventListener('click', () => {
            repQ = Number(b.dataset.qp);
            renderPage();
          }),
        );
      } else if (pageId === 'eusociality') {
        const res = evaluateEusociality(matesCount, true, fortressBC);
        scene.updateEusocialScene(res);
        captionEl.textContent = `Queen Mates = ${matesCount} (Sibling r = ${res.sibR.toFixed(2)}) · ${res.eusocialFavoured ? 'Eusocial Workers Favoured!' : 'Solitary Breeding Favoured'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#dfb048"></i>Hexagonal Brood Comb</span>
          <span><i class="hwe-dot" style="background:#c45b38"></i>Royal Queen Cell</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Boomsma’s Monogamy Hypothesis &amp; Nest Fortress</div>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;">
                <button class="lic-pill-btn ${matesCount === 1 ? 'active' : ''}" data-m="1">Strict Monogamy (r=0.50)</button>
                <button class="lic-pill-btn ${matesCount === 4 ? 'active' : ''}" data-m="4">Polyandry 4× (r=0.31)</button>
              </div>
              <label class="lic-slider-label" style="margin-top:8px;">
                <span>Ecological Fortress Advantage B/C = <strong>${fortressBC.toFixed(1)}</strong></span>
                <input type="range" id="co-bc" min="0.8" max="2.6" step="0.1" value="${fortressBC}" />
              </label>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        leftPanelEl.querySelectorAll<HTMLElement>('[data-m]').forEach((b) =>
          b.addEventListener('click', () => {
            matesCount = Number(b.dataset.m);
            renderPage();
          }),
        );
        (leftPanelEl.querySelector('#co-bc') as HTMLInputElement).addEventListener('input', (e) => {
          fortressBC = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
      } else if (pageId === 'rhizobium') {
        const res = evaluateHostSanctions(sanctionStr);
        scene.updateRhizobiumScene(res);
        captionEl.textContent = `Host Sanctions = ${Math.round(sanctionStr * 100)}% · Pink N-Fixing Nodules = ${Math.round(res.cooperatorShare * 100)}%`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#d66772"></i>Pink N-Fixing Nodules</span>
          <span><i class="hwe-dot" style="background:#cfc7b4"></i>Pale Sanctioned Cheaters</span>
          <span><i class="hwe-dot" style="background:#3f7d52"></i>Clover Shoot Vigour</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Legume O₂ / Carbon Sanctions Against Cheater Rhizobia</div>
              <label class="lic-slider-label">
                <span>Host Sanction Strength = <strong>${Math.round(sanctionStr * 100)}%</strong></span>
                <input type="range" id="co-sanc" min="0" max="1" step="0.05" value="${sanctionStr}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${sanctionStr < 0.2 ? 'active' : ''}" data-sp="0.05">No Policing (Cheaters Win)</button>
                <button class="lic-pill-btn ${sanctionStr > 0.7 ? 'active' : ''}" data-sp="0.95">Strict Sanctions</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#co-sanc') as HTMLInputElement).addEventListener('input', (e) => {
          sanctionStr = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-sp]').forEach((b) =>
          b.addEventListener('click', () => {
            sanctionStr = Number(b.dataset.sp);
            renderPage();
          }),
        );
      } else if (pageId === 'transmission') {
        const res = evaluateTransmission(verticalFrac);
        scene.updateTransmissionScene(res);
        captionEl.textContent = `Vertical Transmission = ${Math.round(verticalFrac * 100)}% · ${verticalFrac > 0.5 ? 'Obligate Mutualist (Buchnera)' : 'Horizontal Exploiter'}`;
        legendEl.innerHTML = `
          <span><i class="hwe-dot" style="background:#5e9668"></i>Pea Aphid Host</span>
          <span><i class="hwe-dot" style="background:${verticalFrac > 0.5 ? '#3e7858' : '#c44536'}"></i>${verticalFrac > 0.5 ? 'Vertical Mutualist' : 'Horizontal Pathogen'}</span>
        `;
        leftPanelEl.innerHTML = `
          <div class="lic-controls-wrap">
            <div class="hwe-card">
              <div class="hwe-kicker">Symbiont Transmission Route</div>
              <label class="lic-slider-label">
                <span>Vertical (Mother → Egg) = <strong>${Math.round(verticalFrac * 100)}%</strong></span>
                <input type="range" id="co-vt" min="0" max="1" step="0.05" value="${verticalFrac}" />
              </label>
              <div class="lic-mode-grid" style="grid-template-columns:1fr 1fr;margin-top:6px;">
                <button class="lic-pill-btn ${verticalFrac < 0.25 ? 'active' : ''}" data-vp="0.1">Horizontal (Pathogen)</button>
                <button class="lic-pill-btn ${verticalFrac > 0.75 ? 'active' : ''}" data-vp="0.95">Vertical (Buchnera)</button>
              </div>
            </div>
            <div class="lic-formula-card">
              <p style="margin:0;line-height:1.45;">${res.summary}</p>
            </div>
          </div>
        `;
        (leftPanelEl.querySelector('#co-vt') as HTMLInputElement).addEventListener('input', (e) => {
          verticalFrac = Number((e.target as HTMLInputElement).value);
          renderPage();
        });
        leftPanelEl.querySelectorAll<HTMLElement>('[data-vp]').forEach((b) =>
          b.addEventListener('click', () => {
            verticalFrac = Number(b.dataset.vp);
            renderPage();
          }),
        );
      } else {
        captionEl.textContent = 'Plate 24 Capstone · Reciprocity, Eusociality & Mutualisms';
        legendEl.innerHTML = `<span><i class="hwe-dot" style="background:#6a5547"></i>Social Evolution &amp; Mutualisms</span>`;

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
          ctx.completeChapter('cooperation', correctCount, CHECK_CASES.length);
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
                          pickedOpt.correct ? c.explanation : 'Re-check the cooperation & mutualism plates above.'
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
