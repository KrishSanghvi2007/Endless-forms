// =============================================================================
// Chapter 22: Genomic Conflict & Selfish Elements — Naturalist Watercolour 3D
// 1. Selfish Spindle (Meiotic Drive: Driving Centromere vs Polar Body Waste)
// 2. CRISPR Homing Gene Drive & NHEJ Resistance Escape (D / W / R Fractions)
// 3. Transposons & C-Value Paradox (5 Taxa DNA Spools + TE Fraction Ribbons)
// 4. Gene Duplication Fates (Pseudogenization / Neofunctionalization / DDC Sub)
// 5. Genomic Imprinting Tug-of-War (Paternal Igf2 vs Maternal Igf2r Placenta)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
  type NaturalistPattern,
} from '../../3d/naturalistCraft';
import type {
  CrisprDriveResult,
  DuplicationFate,
  GenomeTaxon,
  ImprintingResult,
  MeioticDriveResult,
} from './conflictMath';
import { CVALUE_TAXA } from './conflictMath';

export type ConflictPageId = 'drive' | 'crispr' | 'transposons' | 'duplication' | 'imprinting' | 'check';

function wcMat(
  base: string,
  wash: string,
  deep: string,
  highlight: string,
  pattern: NaturalistPattern,
  roughness = 0.72,
  transparent = false,
  opacity = 1.0,
): THREE.MeshStandardMaterial {
  return createNaturalistMaterial({ base, wash, deep, highlight }, pattern, {
    roughness,
    transparent,
    opacity,
  });
}

export class ConflictScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<ConflictPageId, THREE.Group>;
  private activePage: ConflictPageId = 'drive';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 8.8;
  private targetAzimuth = 0.22;
  private targetPolar = 0.34;
  private curAzimuth = 0.22;
  private curPolar = 0.34;
  private zoomFactor = 1.0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(host: HTMLElement) {
    this.host = host;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(32, 1.4, 0.1, 60);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.08;
    this.host.appendChild(this.renderer.domElement);

    setupNaturalistLighting(this.scene);

    this.pageGroups = {
      drive: new THREE.Group(),
      crispr: new THREE.Group(),
      transposons: new THREE.Group(),
      duplication: new THREE.Group(),
      imprinting: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.drive.add(this.p1Group);
    this.pageGroups.crispr.add(this.p2Group);
    this.pageGroups.transposons.add(this.p3Group);
    this.pageGroups.duplication.add(this.p4Group);
    this.pageGroups.imprinting.add(this.p5Group);

    this.buildCapstoneSpecimen();

    this.attachPointerControls();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.setPage('drive');
    this.animate();
  }

  private clearGroup(g: THREE.Group): void {
    while (g.children.length > 0) g.remove(g.children[0]!);
  }

  private addShadowFloor(parent: THREE.Group, y: number): void {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.ShadowMaterial({ opacity: 0.12 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = y;
    floor.receiveShadow = true;
    parent.add(floor);
  }

  private makeChromosome(mat: THREE.MeshStandardMaterial, kinetochoreScale: number, kMat: THREE.MeshStandardMaterial): THREE.Group {
    const g = new THREE.Group();
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.72, 8, 12), mat);
    armL.position.x = -0.1;
    armL.rotation.z = 0.24;
    armL.castShadow = true;
    const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.72, 8, 12), mat);
    armR.position.x = 0.1;
    armR.rotation.z = -0.24;
    armR.castShadow = true;
    const cen = new THREE.Mesh(new THREE.SphereGeometry(0.14 * kinetochoreScale, 16, 12), kMat);
    cen.castShadow = true;
    g.add(armL, armR, cen);
    return g;
  }

  // ---------------------------------------------------------------------------
  // PAGE 1: Meiotic Drive / Selfish Spindle
  // ---------------------------------------------------------------------------
  public updateDriveScene(res: MeioticDriveResult): void {
    this.clearGroup(this.p1Group);
    this.addShadowFloor(this.p1Group, -1.95);

    const oocyteMat = wcMat('#efe3cc', '#dfd0b3', '#b8a27e', '#fbf6ec', 'tissue', 0.55, true, 0.24);
    const fiberMat = wcMat('#8f7a62', '#735f48', '#4f3f2d', '#bfa990', 'strata', 0.8);
    const driveMat = wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.54);
    const wildMat = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.56);
    const goldMat = wcMat('#dda23e', '#be8422', '#82540d', '#f4ce86', 'keratin', 0.45);

    // Translucent asymmetric oocyte shell (shifted left so eq column sits on right)
    const spindleGroup = new THREE.Group();
    spindleGroup.position.set(-0.65, 0, 0);

    const eggShell = new THREE.Mesh(new THREE.SphereGeometry(1.55, 28, 22), oocyteMat);
    eggShell.scale.set(1.05, 1.15, 0.92);
    spindleGroup.add(eggShell);

    // Discarded tiny polar body pole on top vs viable egg pole on bottom
    const polarPole = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), fiberMat);
    polarPole.position.set(0, 1.55, 0);
    spindleGroup.add(polarPole);

    const eggPole = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), goldMat);
    eggPole.position.set(0, -1.42, 0);
    spindleGroup.add(eggPole);

    // Arched spindle microtubules
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const midR = 0.88;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 1.5, 0),
        new THREE.Vector3(Math.cos(a) * midR, 0.05, Math.sin(a) * midR),
        new THREE.Vector3(0, -1.38, 0),
      );
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.018, 6, false), fiberMat);
      spindleGroup.add(tube);
    }

    // Driving chromosome D pulls strongly toward the viable egg pole proportionally to k!
    const bias = (res.k - 0.5) * 2; // 0 .. 1
    const chrD = this.makeChromosome(driveMat, 1.0 + bias * 0.95, goldMat);
    chrD.position.set(-0.32, -0.22 - bias * 0.65, 0.08);
    chrD.rotation.z = 0.12;
    spindleGroup.add(chrD);

    // Wild-type chromosome d gets shunted up toward the discarded polar body!
    const chrW = this.makeChromosome(wildMat, 0.85, wildMat);
    chrW.position.set(0.32, 0.22 + bias * 0.65, -0.08);
    chrW.rotation.z = -0.12;
    spindleGroup.add(chrW);

    this.p1Group.add(spindleGroup);

    // Equilibrium p* population column on the right
    const barH = Math.max(0.18, res.equilibriumP * 2.55);
    const barW = Math.max(0.18, (1 - res.equilibriumP) * 2.55);
    const baseY = -1.65;

    const dBar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, barH, 18), driveMat);
    dBar.position.set(1.85, baseY + barH / 2, 0);
    dBar.castShadow = true;
    const wBar = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, barW, 18), wildMat);
    wBar.position.set(2.65, baseY + barW / 2, 0);
    wBar.castShadow = true;
    this.p1Group.add(dBar, wBar);
  }

  // ---------------------------------------------------------------------------
  // PAGE 2: CRISPR Homing Gene Drive & NHEJ Resistance Escape
  // ---------------------------------------------------------------------------
  public updateCrisprScene(res: CrisprDriveResult): void {
    this.clearGroup(this.p2Group);
    this.addShadowFloor(this.p2Group, -1.75);

    const driveMat = wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.54);
    const wildMat = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.56);
    const resMat = wcMat('#d89c3b', '#ba8022', '#80520d', '#f3ce84', 'keratin', 0.52);
    const casMat = wcMat('#6a557c', '#534063', '#362742', '#9f8cb0', 'tissue', 0.56);

    // Top-left homologous chromosome pair with Cas9 homing enzyme clamp
    const dnaGroup = new THREE.Group();
    dnaGroup.position.set(-1.1, 0.45, 0);

    const chrTop = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.0, 16), driveMat);
    chrTop.rotation.z = Math.PI / 2;
    chrTop.position.set(0, 0.55, 0);
    chrTop.castShadow = true;

    const chrBotL = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.32, 16), wildMat);
    chrBotL.rotation.z = Math.PI / 2;
    chrBotL.position.set(-0.84, -0.55, 0);
    chrBotL.castShadow = true;

    const chrBotR = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.32, 16), wildMat);
    chrBotR.rotation.z = Math.PI / 2;
    chrBotR.position.set(0.84, -0.55, 0);
    chrBotR.castShadow = true;

    // Cut repair patch: crimson if homing wins, gold if NHEJ resistance wins!
    const patchMat = res.finalR > res.finalD ? resMat : driveMat;
    const patch = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.48, 16), patchMat);
    patch.rotation.z = Math.PI / 2;
    patch.position.set(0, -0.55, 0);
    patch.castShadow = true;

    // Sculpted Cas9 ribonucleoprotein clamp hovering over the double-strand break
    const cas = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.14, 14, 24, Math.PI * 1.45), casMat);
    cas.position.set(0, -0.12, 0.1);
    cas.rotation.z = -Math.PI * 0.22;
    cas.castShadow = true;

    dnaGroup.add(chrTop, chrBotL, chrBotR, patch, cas);
    this.p2Group.add(dnaGroup);

    // 3 Final Generation Population Columns (D, W, R) on the right
    const cols: { x: number; frac: number; mat: THREE.MeshStandardMaterial }[] = [
      { x: 1.15, frac: res.finalD, mat: driveMat },
      { x: 1.95, frac: res.finalW, mat: wildMat },
      { x: 2.75, frac: res.finalR, mat: resMat },
    ];
    cols.forEach((c) => {
      const h = Math.max(0.14, c.frac * 2.65);
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.31, h, 18), c.mat);
      mesh.position.set(c.x, -1.65 + h / 2, 0);
      mesh.castShadow = true;
      this.p2Group.add(mesh);
    });
  }

  // ---------------------------------------------------------------------------
  // PAGE 3: Transposable Elements & C-Value Paradox (5 Taxa DNA Spools)
  // ---------------------------------------------------------------------------
  public updateTransposonScene(selectedId: GenomeTaxon['id']): void {
    this.clearGroup(this.p3Group);
    this.addShadowFloor(this.p3Group, -1.75);

    const codingMat = wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.56);
    const teMat = wcMat('#c85a3a', '#a84326', '#722611', '#ea9b83', 'fruit', 0.58);
    const otherMat = wcMat('#d8ccb2', '#c1b294', '#948365', '#efe6d5', 'bone', 0.68);
    const hiRingMat = wcMat('#dfa33d', '#c18521', '#83540d', '#f5d188', 'keratin', 0.44);

    CVALUE_TAXA.forEach((t, idx) => {
      const x = (idx - 2) * 1.25;
      // Log-scaled genome height (4.6 Mb -> 0.55 .. 43,000 Mb -> 3.0)
      const totalH = 0.45 + Math.log10(t.genomeMb) * 0.56;
      const teH = totalH * (t.tePercent / 100);
      const codingH = Math.max(0.16, Math.min(0.42, (t.codingGenes / 40000) * 0.42));
      const nonCodingH = Math.max(0.08, totalH - teH - codingH);

      const baseY = -1.65;
      const g = new THREE.Group();
      g.position.set(x, 0, 0);

      // Coding gene core at bottom (remarkably constant across vertebrates!)
      const cMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, codingH, 18), codingMat);
      cMesh.position.y = baseY + codingH / 2;
      cMesh.castShadow = true;
      g.add(cMesh);

      // Other non-coding / introns in middle
      const oMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.32, nonCodingH, 18), otherMat);
      oMesh.position.y = baseY + codingH + nonCodingH / 2;
      oMesh.castShadow = true;
      g.add(oMesh);

      // Selfish transposable elements stacked on top!
      if (teH > 0.04) {
        const teMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.31, teH, 18), teMat);
        teMesh.position.y = baseY + codingH + nonCodingH + teH / 2;
        teMesh.castShadow = true;
        g.add(teMesh);
      }

      if (t.id === selectedId) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.055, 12, 28), hiRingMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = baseY + 0.06;
        g.add(ring);
      }

      this.p3Group.add(g);
    });
  }

  // ---------------------------------------------------------------------------
  // PAGE 4: Gene Duplication Fates (Pseudogenization / Neo / Subfunctionalization)
  // ---------------------------------------------------------------------------
  public updateDuplicationScene(fate: DuplicationFate): void {
    this.clearGroup(this.p4Group);
    this.addShadowFloor(this.p4Group, -1.75);

    const activeDna = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.58);
    const deadDna = wcMat('#b8ae9c', '#9e937f', '#726755', '#dcd4c5', 'bone', 0.82);
    const enh1Mat = wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.5);
    const enh2Mat = wcMat('#d89c3b', '#ba8022', '#80520d', '#f3ce84', 'keratin', 0.5);
    const neoMat = wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.5);

    const buildGeneCopy = (
      y: number,
      e1: boolean,
      e2: boolean,
      isDead: boolean,
      isNeo: boolean,
    ): void => {
      // Regulatory DNA bar + coding exon
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 4.4, 16),
        isDead ? deadDna : activeDna,
      );
      bar.rotation.z = Math.PI / 2;
      bar.position.set(-0.35, y, 0);
      bar.castShadow = true;
      this.p4Group.add(bar);

      // Enhancer 1 (Tissue 1)
      const m1 = new THREE.Mesh(
        new THREE.SphereGeometry(e1 ? 0.24 : 0.15, 16, 12),
        e1 ? enh1Mat : deadDna,
      );
      m1.position.set(-1.95, y, 0.12);
      m1.castShadow = true;
      this.p4Group.add(m1);

      // Enhancer 2 (Tissue 2)
      const m2 = new THREE.Mesh(
        new THREE.SphereGeometry(e2 ? 0.24 : 0.15, 16, 12),
        e2 ? enh2Mat : deadDna,
      );
      m2.position.set(-1.15, y, 0.12);
      m2.castShadow = true;
      this.p4Group.add(m2);

      // Folded protein output on right
      const protGeo = isNeo
        ? new THREE.TorusKnotGeometry(0.42, 0.11, 64, 10)
        : new THREE.SphereGeometry(isDead ? 0.22 : 0.44, 18, 14);
      const protMat = isDead ? deadDna : isNeo ? neoMat : e1 && !e2 ? enh1Mat : !e1 && e2 ? enh2Mat : activeDna;
      const prot = new THREE.Mesh(protGeo, protMat);
      prot.position.set(2.35, y, 0);
      prot.castShadow = true;
      this.p4Group.add(prot);
    };

    buildGeneCopy(0.75, fate.enhancerA1, fate.enhancerA2, false, false);
    buildGeneCopy(
      -0.75,
      fate.enhancerB1,
      fate.enhancerB2,
      fate.id === 'pseudo',
      fate.id === 'neo',
    );
  }

  // ---------------------------------------------------------------------------
  // PAGE 5: Parent-Offspring Conflict & Genomic Imprinting (Placental Tug-of-War)
  // ---------------------------------------------------------------------------
  public updateImprintingScene(res: ImprintingResult): void {
    this.clearGroup(this.p5Group);
    this.addShadowFloor(this.p5Group, -1.75);

    const patMat = wcMat('#c44e3a', '#a33927', '#6e1f12', '#e89082', 'fruit', 0.56);
    const matMat = wcMat('#447864', '#315f4e', '#1e4033', '#84b8a4', 'botanical', 0.58);
    const embryoMat = wcMat('#ead6c4', '#d8beaa', '#b0917a', '#f8ece1', 'tissue', 0.62);
    const placentaMat = wcMat('#9e4a52', '#7e353d', '#541e24', '#cf868e', 'tissue', 0.66);

    // Sculpted discoid placenta cradle on left
    const placenta = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 0.36, 28), placentaMat);
    placenta.rotation.z = Math.PI / 2;
    placenta.position.set(-1.65, 0, 0);
    placenta.castShadow = true;
    this.p5Group.add(placenta);

    // Sculpted C-curved mammalian fetus on right (scales with net paternal demand vs maternal brake!)
    const netSize = 0.85 + (res.paternalDemand - res.maternalBrake * 0.72) * 0.55;
    const embCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.55, 0.75, 0),
      new THREE.Vector3(1.95, 0.25, 0),
      new THREE.Vector3(1.92, -0.45, 0),
      new THREE.Vector3(1.42, -0.82, 0),
    ]);
    const embGeo = createOrganicLoftGeometry(
      embCurve,
      (t) => (t < 0.28 ? 0.44 : 0.34 - t * 0.14) * netSize,
      { tubularSegs: 28, radialSegs: 18, closedCaps: true },
    );
    const emb = new THREE.Mesh(embGeo, embryoMat);
    emb.castShadow = true;
    this.p5Group.add(emb);

    // Paternal Igf2 growth-demand umbilical vessels (thicken as multiple paternity increases!)
    const patRadius = 0.08 + res.paternalDemand * 0.16;
    const patCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 0.42, 0.1),
      new THREE.Vector3(-0.1, 0.72, 0.25),
      new THREE.Vector3(1.38, 0.25, 0.05),
    ]);
    const patVessel = new THREE.Mesh(new THREE.TubeGeometry(patCurve, 32, patRadius, 14, false), patMat);
    patVessel.castShadow = true;
    this.p5Group.add(patVessel);

    // Maternal Igf2r nutrient-brake receptor rings clamping along the lower vessel!
    const matRadius = 0.07 + res.maternalBrake * 0.12;
    const matCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, -0.42, -0.1),
      new THREE.Vector3(-0.1, -0.68, -0.2),
      new THREE.Vector3(1.38, -0.35, -0.05),
    ]);
    const matVessel = new THREE.Mesh(new THREE.TubeGeometry(matCurve, 32, matRadius, 14, false), matMat);
    matVessel.castShadow = true;
    this.p5Group.add(matVessel);

    // Maternal decoy receptor clamps tightening on paternal Igf2 conduit
    for (let i = 0; i < 3; i++) {
      const u = 0.28 + i * 0.22;
      const pt = patCurve.getPointAt(u);
      const clamp = new THREE.Mesh(
        new THREE.TorusGeometry(patRadius + 0.09, 0.045 + res.maternalBrake * 0.03, 10, 22),
        matMat,
      );
      clamp.position.copy(pt);
      clamp.rotation.y = Math.PI / 2;
      clamp.castShadow = true;
      this.p5Group.add(clamp);
    }
  }

  private buildCapstoneSpecimen(): void {
    this.addShadowFloor(this.pageGroups.check, -1.75);
    const driveMat = wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.54);
    const goldMat = wcMat('#dda23e', '#be8422', '#82540d', '#f4ce86', 'keratin', 0.45);
    const c1 = this.makeChromosome(driveMat, 1.4, goldMat);
    c1.scale.setScalar(1.45);
    this.pageGroups.check.add(c1);
  }

  public setPage(page: ConflictPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as ConflictPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    if (page === 'drive') {
      this.fitDist = 11.4;
      this.targetAzimuth = 0.14;
      this.targetPolar = 0.24;
    } else if (page === 'crispr') {
      this.fitDist = 12.2;
      this.targetAzimuth = 0.14;
      this.targetPolar = 0.24;
    } else if (page === 'transposons') {
      this.fitDist = 12.0;
      this.targetAzimuth = 0.16;
      this.targetPolar = 0.3;
    } else if (page === 'duplication') {
      this.fitDist = 11.8;
      this.targetAzimuth = 0.1;
      this.targetPolar = 0.2;
    } else if (page === 'imprinting') {
      this.fitDist = 10.0;
      this.targetAzimuth = 0.14;
      this.targetPolar = 0.22;
    } else {
      this.fitDist = 7.6;
      this.targetAzimuth = 0.24;
      this.targetPolar = 0.28;
    }
    this.zoomFactor = 1.0;
  }

  public zoomIn(): void {
    this.zoomFactor = Math.max(0.55, this.zoomFactor * 0.85);
  }

  public zoomOut(): void {
    this.zoomFactor = Math.min(1.65, this.zoomFactor * 1.18);
  }

  public resetView(): void {
    this.setPage(this.activePage);
  }

  private attachPointerControls(): void {
    const dom = this.renderer.domElement;
    dom.style.cursor = 'grab';
    dom.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      dom.style.cursor = 'grabbing';
      dom.setPointerCapture(e.pointerId);
    });
    dom.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.targetAzimuth -= dx * 0.008;
      this.targetPolar = Math.max(-0.3, Math.min(1.15, this.targetPolar + dy * 0.006));
    });
    const endDrag = (): void => {
      this.dragging = false;
      dom.style.cursor = 'grab';
    };
    dom.addEventListener('pointerup', endDrag);
    dom.addEventListener('pointercancel', endDrag);
  }

  public resize(): void {
    const w = Math.max(100, this.host.clientWidth);
    const h = Math.max(100, this.host.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    const t = performance.now() * 0.001;
    if (!this.dragging && this.activePage === 'check') {
      this.pageGroups.check.rotation.y = t * 0.35;
    }

    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.1;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.1;
    const dist = this.fitDist * this.zoomFactor;
    const r = dist * Math.cos(this.curPolar);
    this.camera.position.set(
      Math.sin(this.curAzimuth) * r,
      Math.sin(this.curPolar) * dist,
      Math.cos(this.curAzimuth) * r,
    );
    this.camera.lookAt(0, 0, 0);
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
