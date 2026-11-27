// =============================================================================
// Chapter 6: Left Jaw, Right Jaw — Lifelike Museum Specimen 3D Plates
// Zero clunky boxes: real sculpted cichlids, side-blotched lizards & MHC trees
// floating over warm archival rag paper with soft natural-history shadows!
// =============================================================================

import * as THREE from 'three';
import {
  createArchivalLabel,
  createCichlidFish3D,
  createSculptedLizard3D,
  type CichlidHandle,
} from '../../3d/organisms';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import fishGlbUrl from '../../assets/smithsonian_fish.glb?url';
import type { LizardRpsState, TanganyikaSeason } from './jawsMath';

export type JawsPageId = 'ambush' | 'oscillation' | 'heritability' | 'lizards' | 'mhc' | 'check';

const COL_BRASS = 0xb88e42;

export class JawsScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private brassMat: THREE.MeshStandardMaterial;
  private pageGroups: Record<JawsPageId, THREE.Group>;
  private activePage: JawsPageId = 'ambush';

  private swimmingFish: CichlidHandle[] = [];

  // --- Page 1: Close-Up Flank Guard Ambush ---
  private p1Container = new THREE.Group();
  private p1PredatorHandle: CichlidHandle | null = null;
  private p1AmbushT = 1.0;
  private p1AmbushSide: 'left' | 'right' = 'left';

  // --- Page 2: Swimming Tanganyika School (5-Year Oscillation) ---
  private p2SchoolGroup = new THREE.Group();

  // --- Page 3: Anatomical Jaw-Bend Pair (Partial h² vs 0.90) ---
  private p3HeadPairGroup = new THREE.Group();

  // --- Page 4: California Side-Blotched Lizards (Uta stansburiana RPS) ---
  private p4LizardO!: THREE.Group;
  private p4LizardB!: THREE.Group;
  private p4LizardY!: THREE.Group;
  private p4TargetScales: [number, number, number] = [1.2, 0.95, 0.85];
  private p4CurScales: [number, number, number] = [1.2, 0.95, 0.85];
  private p4OrbitDot!: THREE.Mesh;
  private p4TargetDotPos = new THREE.Vector3(0, 0.25, -0.5);

  // --- Page 5: Sculptural 3D Trans-Species MHC Gene Tree ---
  private p5TreeGroup = new THREE.Group();

  // Camera orbit state
  private fitDist = 7.4;
  private targetAzimuth = 0.08;
  private targetPolar = 0.56;
  private curAzimuth = 0.08;
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

    // Bright, airy natural-history plate illumination casting soft paper shadows!
    this.scene.add(new THREE.HemisphereLight(0xfffcf4, 0xdfd3be, 1.08));
    const key = new THREE.DirectionalLight(0xfff5e4, 1.35);
    key.position.set(4.5, 9.5, 5.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    const d = 5.4;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xd2e8f2, 0.48);
    fill.position.set(-5.5, 4.5, -4);
    this.scene.add(fill);

    // Subtle soft shadow catcher directly on the rag-paper plate (no clunky walnut slab!)
    const paperShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.ShadowMaterial({ opacity: 0.13 })
    );
    paperShadow.rotation.x = -Math.PI / 2;
    paperShadow.position.y = 0;
    paperShadow.receiveShadow = true;
    this.scene.add(paperShadow);

    this.brassMat = new THREE.MeshStandardMaterial({
      color: COL_BRASS,
      roughness: 0.28,
      metalness: 0.72,
    });

    this.pageGroups = {
      ambush: new THREE.Group(),
      oscillation: new THREE.Group(),
      heritability: new THREE.Group(),
      lizards: new THREE.Group(),
      mhc: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((grp) => this.scene.add(grp));

    this.buildPage1Ambush();
    this.buildPage2Oscillation();
    this.buildPage3Heritability();
    this.buildPage4Lizards();
    this.buildPage5Mhc();

    this.setPage('ambush');
    this.bindPointerControls();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // =========================================================================
  // PAGE 1: CLOSE-UP ANATOMICAL FLANK AMBUSH (Perissodus microlepis)
  // =========================================================================

  private buildPage1Ambush(): void {
    const g = this.pageGroups.ambush;
    g.add(this.p1Container);

    const lblPrey = createArchivalLabel('Prey Cichlid', 'golden plate = guarded flank', 1.62, '#24636e');
    lblPrey.position.set(0.75, 0.01, 1.55);
    const lblPred = createArchivalLabel('Perissodus microlepis', 'visibly bent scale-eating jaw', 1.72, '#8a461e');
    lblPred.position.set(-1.15, 0.01, 1.55);
    g.add(lblPrey, lblPred);
  }

  public updateAmbushScene(guardSide: 'left' | 'right', attackerSide: 'left' | 'right', launchLunge = false): void {
    while (this.p1Container.children.length > 0) {
      this.p1Container.remove(this.p1Container.children[0]);
    }
    this.swimmingFish = [];

    // Large hero silver-coral prey cichlid swimming in front with movable golden flank guard!
    const prey = createCichlidFish3D({
      role: 'prey',
      scale: 2.05,
      guardSide,
    });
    prey.group.position.set(0.62, 0.72, -0.15);
    prey.group.rotation.y = Math.PI / 2 - 0.18;
    this.p1Container.add(prey.group);
    this.swimmingFish.push(prey);

    // Large sculpted Perissodus microlepis stalking from behind with UNMISTAKABLY BENT JAW!
    const twistRad = attackerSide === 'left' ? -0.44 : 0.44;
    const pred = createCichlidFish3D({
      role: 'predator',
      jawTwist: twistRad,
      scale: 1.88,
    });
    pred.group.position.set(-1.35, 0.68, attackerSide === 'left' ? -0.48 : 0.36);
    pred.group.rotation.y = Math.PI / 2 + (attackerSide === 'left' ? -0.22 : 0.22);
    this.p1Container.add(pred.group);
    this.swimmingFish.push(pred);
    this.p1PredatorHandle = pred;
    this.p1AmbushSide = attackerSide;
    if (launchLunge) this.p1AmbushT = 0;

    // Subtle delicate dotted lake-current swirl ring on the rag paper beneath the fish
    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(1.92, 1.98, 48),
      new THREE.MeshBasicMaterial({ color: 0x3b868e, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.y = 0.005;
    this.p1Container.add(ripple);
  }

  // =========================================================================
  // PAGE 2: TANGANYIKA SCHOOL — 5-YEAR OSCILLATION AROUND 50:50
  // =========================================================================

  private buildPage2Oscillation(): void {
    const g = this.pageGroups.oscillation;
    g.add(this.p2SchoolGroup);

    const lbl = createArchivalLabel('Lake Tanganyika School', 'cobalt jaw = left · coral jaw = right', 2.05, '#236f7a');
    lbl.position.set(0, 0.01, 1.65);
    g.add(lbl);
  }

  public updateOscillationSchool(st: TanganyikaSeason): void {
    while (this.p2SchoolGroup.children.length > 0) {
      this.p2SchoolGroup.remove(this.p2SchoolGroup.children[0]);
    }
    if (this.activePage === 'oscillation') this.swimmingFish = [];

    const total = 10;
    const nLeft = Math.round(st.pLeft * total);
    for (let i = 0; i < total; i++) {
      const isLeft = i < nLeft;
      const col = i % 5;
      const row = Math.floor(i / 5);
      const fish = createSmithsonianSpecimen(fishGlbUrl, {
        size: 0.78,
        palette: isLeft
          ? { base: '#4d8a9c', wash: '#a8d3e0', deep: '#1e4b59', ink: '#122c36' }
          : { base: '#cf7457', wash: '#f2b9a5', deep: '#7a311b', ink: '#42190c' },
        rotation: [0, Math.PI * 0.45 + (isLeft ? -0.18 : 0.18), 0],
        position: [-1.95 + col * 0.98, 0.52 + (i % 2) * 0.22, -0.58 + row * 1.15],
        grainScale: 2.4,
        inkStrength: 0.88,
      });
      this.p2SchoolGroup.add(fish);
    }
  }

  // =========================================================================
  // PAGE 3: ANATOMICAL JAW ASYMMETRY PAIR (PARTIAL h² ≈ 0.25 vs 0.90)
  // =========================================================================

  private buildPage3Heritability(): void {
    const g = this.pageGroups.heritability;
    g.add(this.p3HeadPairGroup);

    const l1 = createArchivalLabel('Left-Bent Morph', 'strikes prey’s right flank', 1.55, '#2b62c9');
    l1.position.set(-1.32, 0.01, 1.52);
    const l2 = createArchivalLabel('Right-Bent Morph', 'strikes prey’s left flank', 1.55, '#c9542b');
    l2.position.set(1.32, 0.01, 1.52);
    g.add(l1, l2);
  }

  public updateHeritabilitySpecimen(h2: number): void {
    while (this.p3HeadPairGroup.children.length > 0) {
      this.p3HeadPairGroup.remove(this.p3HeadPairGroup.children[0]);
    }
    if (this.activePage === 'heritability') this.swimmingFish = [];

    // Show two large anatomical Perissodus specimens side-by-side angled toward the camera so the twisted jaws read clearly!
    const bend = 0.26 + h2 * 0.24;
    const fL = createCichlidFish3D({ role: 'predator', jawTwist: -bend, scale: 2.05 });
    fL.group.position.set(-1.28, 0.72, 0.0);
    fL.group.rotation.y = 0.32;
    this.p3HeadPairGroup.add(fL.group);

    const fR = createCichlidFish3D({ role: 'predator', jawTwist: +bend, scale: 2.05 });
    fR.group.position.set(1.28, 0.72, 0.0);
    fR.group.rotation.y = -0.32;
    this.p3HeadPairGroup.add(fR.group);

    this.swimmingFish.push(fL, fR);
  }

  // =========================================================================
  // PAGE 4: CALIFORNIA SIDE-BLOTCHED LIZARDS (Uta stansburiana RPS ORBIT)
  // =========================================================================

  private buildPage4Lizards(): void {
    const g = this.pageGroups.lizards;

    // Delicate brass RPS dominance ring floating cleanly on the rag paper!
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.032, 10, 48), this.brassMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.06;
    g.add(ring);

    // 3 directional brass arrowheads along the ring: Orange -> Blue -> Yellow -> Orange!
    const arrowGeo = new THREE.ConeGeometry(0.085, 0.22, 8);
    [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2].forEach((ang) => {
      const a = new THREE.Mesh(arrowGeo, this.brassMat);
      a.position.set(Math.cos(ang) * 1.52, 0.08, Math.sin(ang) * 1.52);
      a.rotation.order = 'YXZ';
      a.rotation.y = -ang;
      a.rotation.x = Math.PI / 2;
      g.add(a);
    });

    // Three lifelike sculpted Side-Blotched Lizards (Uta stansburiana) facing inward!
    this.p4LizardO = createSculptedLizard3D({
      throatHex: '#e65c1e',
      dorsalHex: '#c49d72',
      spotHex: '#7a4522',
      scale: 1.55,
      tailCurveSign: 1,
    });
    this.p4LizardO.position.set(0, 0.02, -1.45);
    this.p4LizardO.rotation.y = 0;

    this.p4LizardB = createSculptedLizard3D({
      throatHex: '#2864d4',
      dorsalHex: '#9ba6a8',
      spotHex: '#35495c',
      scale: 1.45,
      tailCurveSign: -1,
    });
    this.p4LizardB.position.set(1.42, 0.02, 0.92);
    this.p4LizardB.rotation.y = -2.18;

    this.p4LizardY = createSculptedLizard3D({
      throatHex: '#e6be26',
      dorsalHex: '#c9ba8a',
      spotHex: '#7a6938',
      scale: 1.38,
      tailCurveSign: 1,
    });
    this.p4LizardY.position.set(-1.42, 0.02, 0.92);
    this.p4LizardY.rotation.y = 2.18;

    // Live ternary population bead orbiting inside the brass RPS ring!
    this.p4OrbitDot = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 16, 12),
      new THREE.MeshPhysicalMaterial({ color: 0x2b241d, roughness: 0.22, clearcoat: 0.8 })
    );
    this.p4OrbitDot.position.set(0, 0.18, -0.35);
    this.p4OrbitDot.castShadow = true;

    g.add(this.p4LizardO, this.p4LizardB, this.p4LizardY, this.p4OrbitDot);

    const lO = createArchivalLabel('Orange Usurper', 'beats Blue · loses to Yellow', 1.52, '#b84214');
    lO.position.set(1.65, 0.01, -1.65);
    const lB = createArchivalLabel('Blue Guarder', 'beats Yellow · loses to Orange', 1.5, '#2252b0');
    lB.position.set(1.75, 0.01, 1.72);
    const lY = createArchivalLabel('Yellow Sneaker', 'beats Orange · loses to Blue', 1.5, '#9c7b10');
    lY.position.set(-1.75, 0.01, 1.72);
    g.add(lO, lB, lY);
  }

  public updateLizardRpsScene(st: LizardRpsState): void {
    const [fO, fB, fY] = st.freqs;
    this.p4TargetScales = [0.9 + fO * 1.45, 0.9 + fB * 1.45, 0.9 + fY * 1.45];
    // Map ternary composition cleanly into the interior of the brass ring
    const vxO = [0, -1.05];
    const vxB = [0.95, 0.65];
    const vxY = [-0.95, 0.65];
    this.p4TargetDotPos.set(
      fO * vxO[0] + fB * vxB[0] + fY * vxY[0],
      0.18,
      fO * vxO[1] + fB * vxB[1] + fY * vxY[1]
    );
  }

  // =========================================================================
  // PAGE 5: SCULPTURAL 3D TRANS-SPECIES MHC BALANCING TREE
  // =========================================================================

  private buildPage5Mhc(): void {
    const g = this.pageGroups.mhc;
    g.add(this.p5TreeGroup);

    const lbl = createArchivalLabel('Genealogy vs. Speciation Split (~6 Ma)', 'blue = Human · amber = Chimp', 2.25, '#236f7a');
    lbl.position.set(0, 0.01, 1.48);
    g.add(lbl);
  }

  public updateMhcTreeScene(mode: 'neutral' | 'mhc_balancing'): void {
    while (this.p5TreeGroup.children.length > 0) {
      this.p5TreeGroup.remove(this.p5TreeGroup.children[0]);
    }
    const branchMat = new THREE.MeshStandardMaterial({ color: 0xbda886, roughness: 0.38, metalness: 0.25 });
    const humMat = new THREE.MeshPhysicalMaterial({ color: 0x2b62c9, roughness: 0.22, clearcoat: 0.7 });
    const chimpMat = new THREE.MeshPhysicalMaterial({ color: 0xd99226, roughness: 0.22, clearcoat: 0.7 });

    // Translucent horizontal speciation plane at y = 1.05 representing Human–Chimp split (~6 Ma)!
    const splitPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 1.25),
      new THREE.MeshBasicMaterial({ color: 0x3b868e, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
    );
    splitPlane.rotation.x = -Math.PI / 2;
    splitPlane.position.set(0, 1.05, 0);
    this.p5TreeGroup.add(splitPlane);

    const addBranch = (x1: number, y1: number, x2: number, y2: number, mat: THREE.Material) => {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x1, y1 + (y2 - y1) * 0.72, 0),
        new THREE.Vector3(x2, y2, 0)
      );
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.045, 8, false), mat);
      tube.castShadow = true;
      this.p5TreeGroup.add(tube);
    };

    const addOrb = (x: number, y: number, r: number, mat: THREE.Material) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), mat);
      m.position.set(x, y, 0);
      m.castShadow = true;
      this.p5TreeGroup.add(m);
    };

    if (mode === 'neutral') {
      // Shallow within-species coalescence (~0.45) well below the 6 Ma speciation plane (y=1.05), then deep join at 1.45!
      const xs = [-1.6, -0.95, -0.35, 0.35, 0.95, 1.6];
      xs.forEach((x, i) => addOrb(x, 0.18, 0.11, i < 3 ? humMat : chimpMat));
      addBranch(-1.6, 0.18, -1.28, 0.48, humMat);
      addBranch(-0.95, 0.18, -1.28, 0.48, humMat);
      addBranch(-1.28, 0.48, -0.82, 0.72, humMat);
      addBranch(-0.35, 0.18, -0.82, 0.72, humMat);

      addBranch(0.35, 0.18, 0.65, 0.48, chimpMat);
      addBranch(0.95, 0.18, 0.65, 0.48, chimpMat);
      addBranch(0.65, 0.48, 1.12, 0.72, chimpMat);
      addBranch(1.6, 0.18, 1.12, 0.72, chimpMat);

      addBranch(-0.82, 0.72, 0.15, 1.48, branchMat);
      addBranch(1.12, 0.72, 0.15, 1.48, branchMat);
      addOrb(0.15, 1.48, 0.14, this.brassMat);
    } else {
      // Trans-species MHC balancing tree: Human & Chimp alleles pair ACROSS species ABOVE the 6 Ma plane (y=1.55) and merge at ~22 Ma (y=2.45)!
      const pairs: [number, number, number][] = [
        [-1.65, -1.05, 1.42],
        [-0.3, 0.3, 1.56],
        [1.05, 1.65, 1.48],
      ];
      pairs.forEach(([xH, xC, yJoin]) => {
        addOrb(xH, 0.18, 0.11, humMat);
        addOrb(xC, 0.18, 0.11, chimpMat);
        const mid = (xH + xC) / 2;
        addBranch(xH, 0.18, mid, yJoin, humMat);
        addBranch(xC, 0.18, mid, yJoin, chimpMat);
        addOrb(mid, yJoin, 0.10, this.brassMat);
      });
      addBranch(-1.35, 1.42, -0.68, 2.08, branchMat);
      addBranch(0.0, 1.56, -0.68, 2.08, branchMat);
      addBranch(-0.68, 2.08, 0.32, 2.52, branchMat);
      addBranch(1.35, 1.48, 0.32, 2.52, branchMat);
      addOrb(0.32, 2.52, 0.15, this.brassMat);
    }
  }

  // =========================================================================
  // PAGE 6: CHECK BACKDROPS
  // =========================================================================

  public setCheckCaseBackdrop(caseIdx: number): void {
    this.pageGroups.ambush.visible = caseIdx === 0;
    this.pageGroups.lizards.visible = caseIdx === 1;
    this.pageGroups.mhc.visible = caseIdx === 2;
    this.pageGroups.oscillation.visible = false;
    this.pageGroups.heritability.visible = false;
  }

  // =========================================================================
  // LIFECYCLE, CAMERA & LIVING ANIMATIONS
  // =========================================================================

  public setPage(page: JawsPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as JawsPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });

    if (page === 'ambush') {
      this.targetAzimuth = 0.14;
      this.targetPolar = 0.56;
      this.fitDist = 7.2;
    } else if (page === 'oscillation') {
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.54;
      this.fitDist = 7.8;
    } else if (page === 'heritability') {
      this.targetAzimuth = 0.0;
      this.targetPolar = 0.44;
      this.fitDist = 7.0;
    } else if (page === 'lizards') {
      this.targetAzimuth = 0.04;
      this.targetPolar = 0.68;
      this.fitDist = 8.4;
    } else if (page === 'mhc') {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.32;
      this.fitDist = 7.6;
    } else {
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.54;
      this.fitDist = 7.8;
    }
    this.zoomFactor = 1.0;
    this.resize();
  }

  public resetView(): void {
    this.setPage(this.activePage);
  }

  public resize(): void {
    const w = Math.max(100, this.host.clientWidth);
    const h = Math.max(100, this.host.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private bindPointerControls(): void {
    const el = this.renderer.domElement;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.targetAzimuth -= dx * 0.0065;
      this.targetPolar = Math.max(0.16, Math.min(1.22, this.targetPolar + dy * 0.0055));
    });
    window.addEventListener('pointerup', () => {
      this.dragging = false;
      el.style.cursor = 'grab';
    });
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomFactor = Math.max(0.68, Math.min(1.42, this.zoomFactor + e.deltaY * 0.0006));
      },
      { passive: false }
    );
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    const dt = Math.min(0.05, this.clock.getDelta());
    const t = this.clock.elapsedTime;

    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.11;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.11;
    const aspectPad = this.camera.aspect < 1.12 ? 1.12 / Math.max(0.6, this.camera.aspect) : 1.0;
    const r = this.fitDist * this.zoomFactor * aspectPad;
    const lookY = this.activePage === 'mhc' ? 1.25 : 0.45;
    this.camera.position.set(
      Math.sin(this.curAzimuth) * Math.cos(this.curPolar) * r,
      lookY + Math.sin(this.curPolar) * r,
      Math.cos(this.curAzimuth) * Math.cos(this.curPolar) * r
    );
    this.camera.lookAt(0, lookY, 0);

    // Lifelike tail-swish swimming animation on all sculpted cichlids!
    for (const fh of this.swimmingFish) {
      fh.tailPivot.rotation.y = Math.sin(t * 5.4 + fh.phase) * 0.34;
    }

    // Page 1 ambush lunge animation
    if (this.pageGroups.ambush.visible && this.p1PredatorHandle && this.p1AmbushT < 1) {
      this.p1AmbushT = Math.min(1, this.p1AmbushT + dt * 1.4);
      const lunge = Math.sin(this.p1AmbushT * Math.PI);
      this.p1PredatorHandle.group.position.x = -1.35 + lunge * 1.05;
      this.p1PredatorHandle.group.position.z =
        (this.p1AmbushSide === 'left' ? -0.48 : 0.36) * (1 - lunge * 0.3);
    }

    // Page 4 lizard morph abundance scaling & RPS orbit bead glide
    if (this.pageGroups.lizards.visible) {
      for (let i = 0; i < 3; i++) {
        this.p4CurScales[i] += (this.p4TargetScales[i] - this.p4CurScales[i]) * 0.12;
      }
      this.p4LizardO.scale.setScalar(this.p4CurScales[0]);
      this.p4LizardB.scale.setScalar(this.p4CurScales[1]);
      this.p4LizardY.scale.setScalar(this.p4CurScales[2]);
      this.p4OrbitDot.position.lerp(this.p4TargetDotPos, 0.12);
    }

    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
