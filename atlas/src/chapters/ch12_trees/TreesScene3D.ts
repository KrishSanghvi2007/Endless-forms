// =============================================================================
// Chapter 12: Tree Thinking & Molecular Clocks — Zero-Box 3D Phylogenetic Plates
// 1. Interactive 3D Swivel-Node Cladogram with real sculpted 3D tip organisms
// 2. Maximum Parsimony vs Homoplasy (Whale + Hippo vs Shark)
// 3. Kimura Neutral Molecular Clock (K = mu independent of Ne!)
// 4. dN/dS Codon Selection Scanner (3D helix + synonymous vs non-synonymous orbs)
// 5. Gene Trees vs Species Trees (Translucent Human-Chimp-Gorilla ILS Tube)
// =============================================================================

import * as THREE from 'three';
import { createSculptedSongbird3D } from '../../3d/naturalistSpecimens';
import {
  createArchivalLabel,
  createCichlidFish3D,
  createRockPocketMouse3D,
  createSculptedLizard3D,
} from '../../3d/organisms';
import type {
  ClockResult,
  DnDsResult,
  IlsResult,
  ParsimonyResult,
  SwivelState,
} from './treesMath';
import { getTipOrder } from './treesMath';

export type TreesPageId = 'swivel' | 'parsimony' | 'clock' | 'dnds' | 'ils' | 'check';

const COL_BRASS = 0xb88e42;
const COL_COBALT = 0x2f658e;
const COL_CORAL = 0xc4483a;
const COL_TEAL = 0x2f7d6e;
const COL_GOLD = 0xd69a2d;

export class TreesScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<TreesPageId, THREE.Group>;
  private activePage: TreesPageId = 'swivel';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 10.6;
  private targetAzimuth = 0.04;
  private targetPolar = 0.56;
  private curAzimuth = 0.04;
  private curPolar = 0.56;
  private zoomFactor = 1.0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private clock = new THREE.Clock();

  constructor(host: HTMLElement) {
    this.host = host;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(34, 1.4, 0.1, 60);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.host.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.HemisphereLight(0xfffcf4, 0xdfd3be, 1.08));
    const key = new THREE.DirectionalLight(0xfff5e4, 1.35);
    key.position.set(4.5, 9.5, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    const d = 5.6;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xd2e8f2, 0.48);
    fill.position.set(-5.5, 4.5, -4);
    this.scene.add(fill);

    const paperShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(26, 26),
      new THREE.ShadowMaterial({ opacity: 0.13 })
    );
    paperShadow.rotation.x = -Math.PI / 2;
    paperShadow.receiveShadow = true;
    this.scene.add(paperShadow);

    this.pageGroups = {
      swivel: new THREE.Group(),
      parsimony: new THREE.Group(),
      clock: new THREE.Group(),
      dnds: new THREE.Group(),
      ils: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.swivel.add(this.p1Group);
    this.pageGroups.parsimony.add(this.p2Group);
    this.pageGroups.clock.add(this.p3Group);
    this.pageGroups.dnds.add(this.p4Group);
    this.pageGroups.ils.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('swivel');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  private addBranch(parent: THREE.Group, a: THREE.Vector3, b: THREE.Vector3, col: number, radius = 0.045): void {
    const curve = new THREE.LineCurve3(a, b);
    const mesh = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 6, radius, 8, false),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
    );
    mesh.castShadow = true;
    parent.add(mesh);
  }

  private createTinyBird3D(scale = 1.0): THREE.Group {
    return createSculptedSongbird3D({
      dorsalPalette: {
        base: '#4a80a3',
        wash: '#2d5c7a',
        deep: '#16354a',
        highlight: '#96c2de',
        ink: '#0f2533',
      },
      wingBars: 0,
      beakDepth: 0.78,
      scale: scale * 0.56,
      seed: 1201,
    });
  }

  // ===========================================================================
  // PAGE 1: INTERACTIVE 3D SWIVEL-NODE PHYLOGENETIC TREE
  // ===========================================================================

  public updateSwivel(state: SwivelState): void {
    this.p1Group.clear();
    const g = this.p1Group;
    const order = getTipOrder(state);

    const tipX: Record<string, number> = {};
    order.forEach((name, idx) => {
      tipX[name] = -2.1 + idx * 1.4;
    });

    const pFish = new THREE.Vector3(tipX['Fish'], 0.25, -1.0);
    const pMouse = new THREE.Vector3(tipX['Mouse'], 0.25, -1.0);
    const pLizard = new THREE.Vector3(tipX['Lizard'], 0.25, -1.0);
    const pBird = new THREE.Vector3(tipX['Bird'], 0.25, -1.0);

    // Sauropsid MRCA (Lizard + Bird)
    const nSaur = new THREE.Vector3((pLizard.x + pBird.x) / 2, 0.25, -0.2);
    // Amniote MRCA (Mouse + Sauropsids)
    const nAmn = new THREE.Vector3((pMouse.x + nSaur.x) / 2, 0.25, 0.5);
    // Vertebrate Root (Fish + Amniotes)
    const nRoot = new THREE.Vector3((pFish.x + nAmn.x) / 2, 0.25, 1.15);

    this.addBranch(g, nSaur, pLizard, COL_TEAL);
    this.addBranch(g, nSaur, pBird, COL_TEAL);
    this.addBranch(g, nAmn, pMouse, COL_COBALT);
    this.addBranch(g, nAmn, nSaur, COL_COBALT);
    this.addBranch(g, nRoot, pFish, COL_BRASS);
    this.addBranch(g, nRoot, nAmn, COL_BRASS);

    // Brass swivel joint spheres at the 3 rotatable MRCAs
    const brassMat = new THREE.MeshStandardMaterial({ color: COL_BRASS, roughness: 0.25, metalness: 0.75 });
    [nSaur, nAmn, nRoot].forEach((pt) => {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 12), brassMat);
      joint.position.copy(pt);
      joint.castShadow = true;
      g.add(joint);
    });

    // Real sculpted 3D organisms perched at the 4 tips!
    const fish = createCichlidFish3D({ role: 'prey', jawTwist: 0, scale: 0.75 }).group;
    fish.position.set(pFish.x, 0.35, pFish.z - 0.15);
    fish.rotation.y = Math.PI / 2;
    g.add(fish);

    const mouse = createRockPocketMouse3D(false, 1.05);
    mouse.position.set(pMouse.x, 0.25, pMouse.z - 0.15);
    g.add(mouse);

    const lizard = createSculptedLizard3D({ throatHex: '#e07a24', dorsalHex: '#7d8a68', scale: 0.95 });
    lizard.position.set(pLizard.x, 0.25, pLizard.z - 0.15);
    g.add(lizard);

    const bird = this.createTinyBird3D(1.1);
    bird.position.set(pBird.x, 0.22, pBird.z - 0.15);
    g.add(bird);

    const slip = createArchivalLabel(
      `Tips: ${order.join(' · ')}`,
      'Same exact phylogeny! Lizard & Bird ALWAYS share the newest MRCA (Sauropsida).',
      3.85,
      '#366858'
    );
    slip.position.set(0, 0.015, 1.72);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 2: MAXIMUM PARSIMONY VS HOMOPLASY (Whale + Hippo vs Shark)
  // ===========================================================================

  public updateParsimony(res: ParsimonyResult): void {
    this.p2Group.clear();
    const g = this.p2Group;

    const pLeft = new THREE.Vector3(-1.85, 0.25, -0.95);
    const pMid = new THREE.Vector3(0.15, 0.25, -0.95);
    const pRight = new THREE.Vector3(1.85, 0.25, -0.95);

    const nSister = new THREE.Vector3(1.0, 0.25, 0.05);
    const nRoot = new THREE.Vector3(-0.3, 0.25, 1.0);

    const isTrue = res.topology === 'true_mammals';
    this.addBranch(g, nRoot, pLeft, COL_COBALT);
    this.addBranch(g, nRoot, nSister, COL_COBALT);
    this.addBranch(g, nSister, pMid, isTrue ? COL_TEAL : COL_CORAL);
    this.addBranch(g, nSister, pRight, isTrue ? COL_TEAL : COL_CORAL);

    // Character transition tick-beads along the branches (4 clean steps vs 7 homoplasious steps!)
    const tickMat = new THREE.MeshStandardMaterial({ color: isTrue ? COL_TEAL : COL_CORAL, roughness: 0.25 });
    const stepCoords: THREE.Vector3[] = isTrue
      ? [
          new THREE.Vector3(0.35, 0.34, 0.52), // Lungs + Milk + Ankle synapomorphy
          new THREE.Vector3(0.55, 0.34, 0.36),
          new THREE.Vector3(0.75, 0.34, 0.2),
          new THREE.Vector3(1.45, 0.34, -0.48), // 1 aquatic transition in Whale
        ]
      : [
          new THREE.Vector3(-1.05, 0.34, 0.05),
          new THREE.Vector3(-0.75, 0.34, -0.25),
          new THREE.Vector3(0.35, 0.34, 0.52),
          new THREE.Vector3(0.6, 0.34, -0.45),
          new THREE.Vector3(0.8, 0.34, -0.2),
          new THREE.Vector3(1.4, 0.34, -0.45),
          new THREE.Vector3(1.6, 0.34, -0.68),
        ];
    stepCoords.forEach((pt) => {
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), tickMat);
      bead.position.copy(pt);
      g.add(bead);
    });

    const labels = isTrue ? ['Shark', 'Hippo', 'Whale'] : ['Hippo', 'Shark', 'Whale'];
    [pLeft, pMid, pRight].forEach((pt, idx) => {
      const name = labels[idx];
      const lbl = createArchivalLabel(
        name,
        name === 'Shark' ? 'Cartilaginous Fish' : name === 'Hippo' ? 'Artiodactyl Mammal' : 'Cetacean Mammal',
        1.45,
        name === 'Shark' ? '#586875' : '#24587c'
      );
      lbl.position.set(pt.x, 0.02, pt.z - 0.65);
      g.add(lbl);
    });

    const slip = createArchivalLabel(
      isTrue ? 'Most Parsimonious: (Shark, (Hippo, Whale)) = 4 Steps' : 'Aquatic Trap: (Hippo, (Shark, Whale)) = 7 Steps!',
      isTrue
        ? 'Whale & Hippo share milk, lungs & artiodactyl ankle; fins are convergent homoplasy.'
        : 'Grouping by fins forces lungs, milk & warm blood to evolve twice!',
      3.85,
      isTrue ? '#2f7d6e' : '#a83424'
    );
    slip.position.set(0, 0.015, 1.72);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 3: KIMURA NEUTRAL MOLECULAR CLOCK (K = μ INDEPENDENT OF Ne)
  // ===========================================================================

  public updateClock(res: ClockResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    // 3D Brass Divergence Clock Dial + Molecular Divergence V-Branches!
    const root = new THREE.Vector3(0, 0.25, 0.55);
    const tipA = new THREE.Vector3(-1.75, 0.25, -1.25);
    const tipB = new THREE.Vector3(1.75, 0.25, -1.25);
    this.addBranch(g, root, tipA, COL_COBALT, 0.06);
    this.addBranch(g, root, tipB, COL_TEAL, 0.06);

    // Substitution pearls ticking at steady rate K = mu along both branches!
    const nTicks = Math.max(2, Math.min(12, Math.round(res.expectedSequenceDiffPct * 0.55)));
    const pearlMat = new THREE.MeshStandardMaterial({ color: COL_GOLD, roughness: 0.25, metalness: 0.55 });
    for (let i = 1; i <= nTicks; i++) {
      const f = i / (nTicks + 1);
      const p1 = new THREE.Vector3().lerpVectors(root, tipA, f);
      const p2 = new THREE.Vector3().lerpVectors(root, tipB, f);
      const m1 = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), pearlMat);
      m1.position.set(p1.x, 0.34, p1.z);
      const m2 = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), pearlMat);
      m2.position.set(p2.x, 0.34, p2.z);
      g.add(m1, m2);
    }

    // Visual population-size ring at base showing Ne changes while K stays constant!
    const neRadius = 0.22 + Math.min(0.65, Math.log10(res.ne) * 0.16);
    const neRing = new THREE.Mesh(
      new THREE.TorusGeometry(neRadius, 0.038, 10, 28),
      new THREE.MeshStandardMaterial({ color: COL_BRASS, roughness: 0.3, metalness: 0.65 })
    );
    neRing.rotation.x = Math.PI / 2;
    neRing.position.set(0, 0.12, 0.55);
    g.add(neRing);

    const slip = createArchivalLabel(
      `N_e = ${res.ne} · Neutral Rate K = (2N_eμ)(1/2N_e) = μ`,
      `Divergence at ${res.divergenceMa} Ma = ${res.expectedSequenceDiffPct.toFixed(1)}% DNA diff (Ne cancels out!)`,
      3.85,
      '#24587c'
    );
    slip.position.set(0, 0.015, 1.75);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 4: dN / dS CODON SELECTION SCANNER
  // ===========================================================================

  public updateDnDs(res: DnDsResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    // 3D Sculpted DNA Helix Backbone + 12 Codon Beads (Cobalt = Synonymous dS, Coral = Non-synonymous dN)
    const nCodons = 12;
    const nNonSyn = Math.max(0, Math.min(10, Math.round(res.dN * 7)));
    const nSyn = Math.max(2, Math.min(6, Math.round(res.dS * 8)));

    const strandA: THREE.Vector3[] = [];
    const strandB: THREE.Vector3[] = [];
    for (let i = 0; i < nCodons; i++) {
      const x = -2.3 + i * 0.42;
      const ang = i * 0.58;
      strandA.push(new THREE.Vector3(x, 0.72 + Math.sin(ang) * 0.32, Math.cos(ang) * 0.35 - 0.1));
      strandB.push(new THREE.Vector3(x, 0.72 - Math.sin(ang) * 0.32, -Math.cos(ang) * 0.35 - 0.1));

      const isNonSyn = i < nNonSyn;
      const isSyn = !isNonSyn && i < nNonSyn + nSyn;
      const col = isNonSyn ? COL_CORAL : isSyn ? COL_COBALT : 0xc4bcae;
      const rung = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.065, 0.55, 6, 10),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
      );
      rung.position.set(x, 0.72, -0.1);
      rung.rotation.x = ang;
      rung.castShadow = true;
      g.add(rung);
    }

    const railMat = new THREE.MeshStandardMaterial({ color: COL_BRASS, roughness: 0.3, metalness: 0.65 });
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandA), 36, 0.042, 8, false), railMat));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(strandB), 36, 0.042, 8, false), railMat));

    const slip = createArchivalLabel(
      `${res.geneName} · ω = dN / dS = ${res.omega.toFixed(2)}`,
      res.regime,
      3.85,
      res.omega > 1.2 ? '#a83424' : res.omega < 0.5 ? '#2f7d6e' : '#24587c'
    );
    slip.position.set(0, 0.015, 1.65);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 5: GENE TREES VS SPECIES TREES (INCOMPLETE LINEAGE SORTING TUBE)
  // ===========================================================================

  public updateIls(res: IlsResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    // Translucent 3D Species Tree Tube: ((Human, Chimp), Gorilla)
    const tubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xdce8ee,
      roughness: 0.15,
      transparent: true,
      opacity: 0.42,
    });
    const internalLen = Math.min(1.05, 0.18 + res.internalBranchCoalUnits * 0.42);
    const yRoot = 0.25;
    const yHC = 0.25 + internalLen;
    const yTip = 2.05;

    const ptRoot = new THREE.Vector3(0, yRoot, 0);
    const ptHC = new THREE.Vector3(-0.65, yHC, 0);
    const ptHuman = new THREE.Vector3(-1.45, yTip, 0);
    const ptChimp = new THREE.Vector3(-0.05, yTip, 0);
    const ptGorilla = new THREE.Vector3(1.45, yTip, 0);

    const addSpeciesTube = (a: THREE.Vector3, b: THREE.Vector3) => {
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 6, 0.28, 12, false), tubeMat);
      g.add(m);
    };
    addSpeciesTube(ptRoot, ptHC);
    addSpeciesTube(ptHC, ptHuman);
    addSpeciesTube(ptHC, ptChimp);
    addSpeciesTube(ptRoot, ptGorilla);

    // Inside the translucent species tube: Gene Tree Lineage!
    // If internal branch is short (tau < 0.8), show DISCORDANT ((Human, Gorilla), Chimp) deep coalescence!
    const discordant = res.internalBranchCoalUnits < 0.85;
    const geneCol = discordant ? COL_CORAL : COL_TEAL;
    if (!discordant) {
      // Concordant: Human & Chimp coalesce INSIDE the HC ancestral branch!
      const coalHC = new THREE.Vector3(-0.48, (yHC + yRoot) / 2, 0.04);
      this.addBranch(g, ptHuman, coalHC, geneCol, 0.042);
      this.addBranch(g, ptChimp, coalHC, geneCol, 0.042);
      this.addBranch(g, coalHC, ptRoot, geneCol, 0.042);
      this.addBranch(g, ptGorilla, ptRoot, geneCol, 0.042);
    } else {
      // Incomplete Lineage Sorting: Human & Chimp fail to coalesce in short HC branch -> Human coalesces with Gorilla first!
      const deepHG = new THREE.Vector3(0.18, yRoot + 0.08, 0.04);
      const deeperAll = new THREE.Vector3(0, yRoot - 0.16, 0.04);
      this.addBranch(g, ptHuman, deepHG, geneCol, 0.042);
      this.addBranch(g, ptGorilla, deepHG, geneCol, 0.042);
      this.addBranch(g, deepHG, deeperAll, geneCol, 0.042);
      this.addBranch(g, ptChimp, deeperAll, geneCol, 0.042);
    }

    const slip = createArchivalLabel(
      `Species Tree: ((Human, Chimp), Gorilla) · Concordant = ${(res.concordantProb * 100).toFixed(0)}%`,
      discordant
        ? `Short internal branch (τ = ${res.internalBranchCoalUnits.toFixed(2)}): ILS creates discordant ((Human, Gorilla), Chimp) gene trees!`
        : `Long internal branch (τ = ${res.internalBranchCoalUnits.toFixed(2)}): Lineages coalesce cleanly inside Human–Chimp ancestor.`,
      3.85,
      discordant ? '#a83424' : '#2f7d6e'
    );
    slip.position.set(0, 0.015, 1.65);
    g.add(slip);
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const fish = createCichlidFish3D({ role: 'prey', jawTwist: 0, scale: 0.95 }).group;
    fish.position.set(-1.6, 0.25, 0);
    fish.rotation.y = Math.PI / 2;
    g.add(fish);

    const liz = createSculptedLizard3D({ throatHex: '#e07a24', dorsalHex: '#7d8a68', scale: 1.25 });
    liz.position.set(0, 0.12, 0.05);
    g.add(liz);

    const bird = this.createTinyBird3D(1.45);
    bird.position.set(1.55, 0.1, 0.05);
    bird.rotation.y = -0.35;
    g.add(bird);

    const slip = createArchivalLabel(
      'Tree Thinking & Molecular Clocks',
      'MRCA Swivels · Parsimony · dN/dS · Incomplete Lineage Sorting',
      3.65,
      '#366858'
    );
    slip.position.set(0, 0.015, 1.48);
    g.add(slip);
  }

  public setPage(page: TreesPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as TreesPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'check' ? 9.6 : page === 'ils' ? 10.2 : 10.8;
    this.targetAzimuth = page === 'ils' ? 0.06 : 0.03;
    this.targetPolar = page === 'ils' ? 0.32 : 0.58;
    this.zoomFactor = 1.0;
  }

  public resetView(): void {
    this.setPage(this.activePage);
  }

  public zoom(delta: number): void {
    this.zoomFactor = Math.max(0.65, Math.min(1.55, this.zoomFactor + delta));
  }

  public resize(): void {
    if (this.disposed) return;
    const w = Math.max(10, this.host.clientWidth);
    const h = Math.max(10, this.host.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private bindInput(): void {
    const el = this.renderer.domElement;
    const onDown = (e: PointerEvent) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!this.dragging) return;
      this.targetAzimuth -= (e.clientX - this.lastX) * 0.008;
      this.targetPolar = Math.max(0.18, Math.min(1.25, this.targetPolar - (e.clientY - this.lastY) * 0.006));
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    };
    const onUp = () => {
      this.dragging = false;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    const t = this.clock.getElapsedTime();

    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.1;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.1;

    const r = this.fitDist * this.zoomFactor;
    this.camera.position.set(
      r * Math.sin(this.curAzimuth) * Math.cos(this.curPolar),
      r * Math.sin(this.curPolar) + (this.activePage === 'ils' ? 0.9 : 0.55),
      r * Math.cos(this.curAzimuth) * Math.cos(this.curPolar)
    );
    this.camera.lookAt(0, this.activePage === 'ils' ? 0.85 : 0.28, 0);

    if (this.activePage === 'check') {
      this.pageGroups.check.rotation.y = Math.sin(t * 0.5) * 0.14;
    }

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    if (this.renderer.domElement.parentNode === this.host) {
      this.host.removeChild(this.renderer.domElement);
    }
  }
}
