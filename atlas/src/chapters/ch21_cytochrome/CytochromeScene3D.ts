// =============================================================================
// Chapter 21: Cytochrome c & Comparative Methods — Naturalist Watercolour 3D
// 1. Folded 3D Cytochrome c Ribbon + Crimson Heme Porphyrin Ring + Substitutions
// 2. Empirical Molecular Distance Phylogram (Human, Rhesus, Horse, Tuna, Yeast)
// 3. Felsenstein (1985) Worst-Case Clade Split vs Independent Contrasts (PIC)
// 4. Ancestral State Reconstruction — 3D Phylogeny with Pie-Chart Node Discs
// 5. Shared Molecular Footprints — Primate GULO Pseudogene & ERV Synteny Bars
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
  type NaturalistPattern,
} from '../../3d/naturalistCraft';
import type { AncestralResult, CytcComparison, PicResult } from './cytochromeMath';
import { CYTC_TAXA } from './cytochromeMath';

export type CytochromePageId = 'cytc' | 'tree' | 'pic' | 'ancestral' | 'pseudogenes' | 'check';

function wcMat(
  base: string,
  wash: string,
  deep: string,
  highlight: string,
  pattern: NaturalistPattern,
  roughness = 0.72,
): THREE.MeshStandardMaterial {
  return createNaturalistMaterial({ base, wash, deep, highlight }, pattern, { roughness });
}

export class CytochromeScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<CytochromePageId, THREE.Group>;
  private activePage: CytochromePageId = 'cytc';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 9.0;
  private targetAzimuth = 0.24;
  private targetPolar = 0.36;
  private curAzimuth = 0.24;
  private curPolar = 0.36;
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
      cytc: new THREE.Group(),
      tree: new THREE.Group(),
      pic: new THREE.Group(),
      ancestral: new THREE.Group(),
      pseudogenes: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.cytc.add(this.p1Group);
    this.pageGroups.tree.add(this.p2Group);
    this.pageGroups.pic.add(this.p3Group);
    this.pageGroups.ancestral.add(this.p4Group);
    this.pageGroups.pseudogenes.add(this.p5Group);

    this.buildStaticTreePage();
    this.buildStaticPseudogenePage();
    this.buildCapstoneSpecimen();

    this.attachPointerControls();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.setPage('cytc');
    this.animate();
  }

  private clearGroup(g: THREE.Group): void {
    while (g.children.length > 0) {
      g.remove(g.children[0]!);
    }
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

  // ---------------------------------------------------------------------------
  // PAGE 1: 3D Folded Cytochrome c Polypeptide + Heme Porphyrin + Substitutions
  // ---------------------------------------------------------------------------
  public updateCytcModel(cmp: CytcComparison): void {
    this.clearGroup(this.p1Group);
    this.addShadowFloor(this.p1Group, -1.95);

    const ribbonMat = wcMat('#4a7b91', '#386377', '#21404f', '#8db5c7', 'tissue', 0.64);
    const conservedBeadMat = wcMat('#e2d6be', '#cfc0a2', '#9d8c70', '#f5efe1', 'bone', 0.62);
    const diffBeadMat = wcMat('#ca4c37', '#aa3622', '#751e12', '#e88b79', 'fruit', 0.54);
    const activeMotifMat = wcMat('#dea23d', '#c28522', '#82510f', '#f4cf84', 'keratin', 0.52);

    // Folded globular Cytochrome c backbone wrapping a central heme cleft
    const pts: THREE.Vector3[] = [];
    const totalPts = 42;
    for (let i = 0; i <= totalPts; i++) {
      const t = i / totalPts;
      const angle = t * Math.PI * 3.85 - Math.PI * 0.4;
      const helixR = 1.12 + 0.34 * Math.sin(t * Math.PI * 3.0) + 0.16 * Math.cos(t * Math.PI * 7.0);
      const y = (t - 0.5) * 2.55 + 0.24 * Math.sin(t * Math.PI * 6.0);
      pts.push(new THREE.Vector3(Math.cos(angle) * helixR, y, Math.sin(angle) * helixR));
    }
    const backboneCurve = new THREE.CatmullRomCurve3(pts);
    const ribbonGeo = new THREE.TubeGeometry(backboneCurve, 120, 0.115, 14, false);
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.castShadow = true;
    this.p1Group.add(ribbonMesh);

    // Highlight 18 diagnostic residues (positions 1-18, including conserved CXXCH motif 14-18)
    const diffSet = new Set(cmp.windowDiffIndices);
    for (let i = 0; i < 18; i++) {
      const u = 0.04 + (i / 17) * 0.44;
      const p = backboneCurve.getPointAt(u);
      const isMotif = i >= 13;
      const isDiff = diffSet.has(i);

      const beadRadius = isDiff ? 0.22 : isMotif ? 0.19 : 0.155;
      const beadMat = isDiff ? diffBeadMat : isMotif ? activeMotifMat : conservedBeadMat;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(beadRadius, 18, 14), beadMat);
      bead.position.copy(p);
      bead.castShadow = true;
      this.p1Group.add(bead);
    }

    // Scattered distal substitutions across positions 19-104 proportional to fullDiffs
    const extraDiffs = Math.max(0, cmp.fullDiffs - cmp.windowDiffIndices.length);
    const showExtra = Math.min(24, extraDiffs);
    for (let k = 0; k < showExtra; k++) {
      const u = 0.51 + ((k + 0.5) / Math.max(1, showExtra)) * 0.45;
      const p = backboneCurve.getPointAt(u);
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), diffBeadMat);
      bead.position.copy(p);
      bead.castShadow = true;
      this.p1Group.add(bead);
    }

    // Central Crimson Heme-c Porphyrin Prosthetic Group + Fe2+ Core
    const hemeGroup = new THREE.Group();
    const hemeRingMat = wcMat('#a32a37', '#821c27', '#540d15', '#d96c78', 'fruit', 0.48);
    const porphyrin = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.075, 16, 36), hemeRingMat);
    porphyrin.rotation.x = Math.PI * 0.38;
    porphyrin.rotation.y = 0.3;
    porphyrin.castShadow = true;
    hemeGroup.add(porphyrin);

    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 1.08, 10), hemeRingMat);
      spoke.rotation.z = a;
      porphyrin.add(spoke);
    }

    const ironMat = wcMat('#e4ab3e', '#c6891f', '#87530d', '#f8d68a', 'keratin', 0.44);
    const ironAtom = new THREE.Mesh(new THREE.SphereGeometry(0.21, 20, 16), ironMat);
    ironAtom.castShadow = true;
    hemeGroup.add(ironAtom);

    this.p1Group.add(hemeGroup);
  }

  // ---------------------------------------------------------------------------
  // PAGE 2: Empirical Cytochrome c Distance Phylogram (5 Real Taxa)
  // ---------------------------------------------------------------------------
  private buildStaticTreePage(): void {
    this.clearGroup(this.p2Group);
    this.addShadowFloor(this.p2Group, -1.65);

    const branchMat = wcMat('#6d503a', '#573d2a', '#3a2618', '#9c7c62', 'strata', 0.78);

    const addBranch = (a: THREE.Vector3, b: THREE.Vector3, r0: number, r1: number): void => {
      const curve = new THREE.LineCurve3(a, b);
      const geo = createOrganicLoftGeometry(
        curve,
        (t) => THREE.MathUtils.lerp(r0, r1, t),
        { tubularSegs: 12, radialSegs: 12, closedCaps: false },
      );
      const mesh = new THREE.Mesh(geo, branchMat);
      mesh.castShadow = true;
      this.p2Group.add(mesh);
      const capA = new THREE.Mesh(new THREE.SphereGeometry(r0 * 1.02, 10, 8), branchMat);
      capA.position.copy(a);
      const capB = new THREE.Mesh(new THREE.SphereGeometry(r1 * 1.02, 10, 8), branchMat);
      capB.position.copy(b);
      this.p2Group.add(capA, capB);
    };

    const root = new THREE.Vector3(-2.6, -0.35, 0);
    const nEuk = new THREE.Vector3(-2.1, -0.35, 0);
    const nVert = new THREE.Vector3(-0.7, 0.25, 0);
    const nMam = new THREE.Vector3(0.95, 0.72, 0);
    const nPrim = new THREE.Vector3(2.15, 1.02, 0);

    const tipYeast = new THREE.Vector3(2.6, -1.25, 0);
    const tipTuna = new THREE.Vector3(2.6, -0.42, 0);
    const tipHorse = new THREE.Vector3(2.6, 0.28, 0);
    const tipRhesus = new THREE.Vector3(2.6, 0.85, 0);
    const tipHuman = new THREE.Vector3(2.6, 1.32, 0);

    addBranch(root, nEuk, 0.11, 0.1);
    addBranch(nEuk, new THREE.Vector3(-2.1, -1.25, 0), 0.08, 0.075);
    addBranch(new THREE.Vector3(-2.1, -1.25, 0), tipYeast, 0.075, 0.055);
    addBranch(nEuk, new THREE.Vector3(-2.1, 0.25, 0), 0.095, 0.085);
    addBranch(new THREE.Vector3(-2.1, 0.25, 0), nVert, 0.085, 0.08);
    addBranch(nVert, new THREE.Vector3(-0.7, -0.42, 0), 0.075, 0.07);
    addBranch(new THREE.Vector3(-0.7, -0.42, 0), tipTuna, 0.07, 0.055);
    addBranch(nVert, new THREE.Vector3(-0.7, 0.72, 0), 0.08, 0.075);
    addBranch(new THREE.Vector3(-0.7, 0.72, 0), nMam, 0.075, 0.07);
    addBranch(nMam, new THREE.Vector3(0.95, 0.28, 0), 0.068, 0.064);
    addBranch(new THREE.Vector3(0.95, 0.28, 0), tipHorse, 0.064, 0.052);
    addBranch(nMam, new THREE.Vector3(0.95, 1.02, 0), 0.07, 0.066);
    addBranch(new THREE.Vector3(0.95, 1.02, 0), nPrim, 0.066, 0.062);
    addBranch(nPrim, new THREE.Vector3(2.15, 0.85, 0), 0.055, 0.052);
    addBranch(new THREE.Vector3(2.15, 0.85, 0), tipRhesus, 0.052, 0.048);
    addBranch(nPrim, new THREE.Vector3(2.15, 1.32, 0), 0.055, 0.052);
    addBranch(new THREE.Vector3(2.15, 1.32, 0), tipHuman, 0.052, 0.048);

    const tipSpecs: {
      pos: THREE.Vector3;
      base: string;
      wash: string;
      deep: string;
      hi: string;
      pat: NaturalistPattern;
      scale: number;
    }[] = [
      { pos: tipHuman, base: '#8e3f4b', wash: '#732e39', deep: '#4f1b24', hi: '#c27a85', pat: 'fur', scale: 0.23 },
      { pos: tipRhesus, base: '#b86844', wash: '#985030', deep: '#6c341b', hi: '#dfa080', pat: 'fur', scale: 0.21 },
      { pos: tipHorse, base: '#a27e55', wash: '#876640', deep: '#5c4124', hi: '#cfb28d', pat: 'fur', scale: 0.22 },
      { pos: tipTuna, base: '#4a7992', wash: '#366077', deep: '#204154', hi: '#8ab4c9', pat: 'scale', scale: 0.22 },
      { pos: tipYeast, base: '#cca956', wash: '#b08e3d', deep: '#7a5f21', hi: '#e8d090', pat: 'fruit', scale: 0.21 },
    ];
    tipSpecs.forEach((s, idx) => {
      const m = wcMat(s.base, s.wash, s.deep, s.hi, s.pat, 0.62);
      const badge = new THREE.Mesh(new THREE.SphereGeometry(s.scale, 18, 14), m);
      badge.position.copy(s.pos).add(new THREE.Vector3(0.24, 0, 0));
      badge.castShadow = true;
      this.p2Group.add(badge);

      if (idx === 4) {
        const bud = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), m);
        bud.position.copy(badge.position).add(new THREE.Vector3(0.18, 0.14, 0.04));
        this.p2Group.add(bud);
      } else if (idx === 3) {
        badge.scale.set(1.35, 0.72, 0.65);
        const fin = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 6), m);
        fin.rotation.z = Math.PI / 2;
        fin.position.copy(badge.position).add(new THREE.Vector3(0.32, 0, 0));
        this.p2Group.add(fin);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // PAGE 3: Felsenstein (1985) Worst-Case Clade Split vs PIC
  // ---------------------------------------------------------------------------
  public updatePicScene(res: PicResult): void {
    this.clearGroup(this.p3Group);
    this.addShadowFloor(this.p3Group, -1.65);

    const plateMat = wcMat('#ece3d0', '#dfd2b8', '#bfa988', '#faf5ea', 'bone', 0.88);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 3.6), plateMat);
    plate.position.set(0, -1.55, 0);
    plate.receiveShadow = true;
    this.p3Group.add(plate);

    const axisMat = new THREE.MeshStandardMaterial({ color: '#544637', roughness: 0.8 });
    const xAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 4.1, 8), axisMat);
    xAxis.rotation.z = Math.PI / 2;
    xAxis.position.set(0, -1.48, 1.55);
    this.p3Group.add(xAxis);
    const zAxis = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 3.3, 8), axisMat);
    zAxis.rotation.x = Math.PI / 2;
    zAxis.position.set(-1.95, -1.48, 0);
    this.p3Group.add(zAxis);

    const cladeAMat = wcMat('#42798a', '#306170', '#1d424e', '#86b5c4', 'scale', 0.58);
    const cladeBMat = wcMat('#c46143', '#a64a2f', '#752e19', '#e59d85', 'fur', 0.58);
    const stemMat = wcMat('#7e644a', '#654d36', '#453322', '#ad9276', 'strata', 0.78);

    const deepRoot = new THREE.Vector3(0, 1.65, 0);
    const ancA = new THREE.Vector3(-1.12, 0.65, 0.92);
    const ancB = new THREE.Vector3(1.12, 0.65, -0.92);

    const addEdge = (a: THREE.Vector3, b: THREE.Vector3, mat: THREE.Material, rad = 0.045): void => {
      const geo = new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 8, rad, 8, false);
      const m = new THREE.Mesh(geo, mat);
      m.castShadow = true;
      this.p3Group.add(m);
    };
    addEdge(deepRoot, ancA, stemMat, 0.065);
    addEdge(deepRoot, ancB, stemMat, 0.065);

    const mapPt = (pt: { x: number; y: number }): THREE.Vector3 =>
      new THREE.Vector3(pt.x * 1.15, -1.32, -pt.y * 0.95);

    const ptsA = res.cladeASpecies.map(mapPt);
    const ptsB = res.cladeBSpecies.map(mapPt);

    ptsA.forEach((p) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 12), cladeAMat);
      dot.position.copy(p);
      dot.castShadow = true;
      this.p3Group.add(dot);
      addEdge(ancA, p, stemMat, 0.026);
    });

    ptsB.forEach((p) => {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 12), cladeBMat);
      dot.position.copy(p);
      dot.castShadow = true;
      this.p3Group.add(dot);
      addEdge(ancB, p, stemMat, 0.026);
    });

    if (!res.usePic) {
      const badMat = wcMat('#bc3429', '#992219', '#66110b', '#e37b72', 'fruit', 0.5);
      addEdge(
        new THREE.Vector3(-1.82, -1.32, 1.48),
        new THREE.Vector3(1.82, -1.32, -1.48),
        badMat,
        0.055,
      );
    } else {
      const picMat = wcMat('#417d5a', '#2e6143', '#1c422c', '#82b898', 'botanical', 0.52);
      addEdge(ptsA[0]!, ptsA[1]!, picMat, 0.036);
      addEdge(ptsA[2]!, ptsA[3]!, picMat, 0.036);
      addEdge(ptsB[0]!, ptsB[1]!, picMat, 0.036);
      addEdge(ptsB[2]!, ptsB[3]!, picMat, 0.036);
      addEdge(
        new THREE.Vector3(-1.75, -1.32, 0.08),
        new THREE.Vector3(1.75, -1.32, -0.08),
        picMat,
        0.05,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 4: Ancestral State Reconstruction — 3D Pie-Chart Node Phylogeny
  // ---------------------------------------------------------------------------
  public updateAncestralScene(res: AncestralResult): void {
    this.clearGroup(this.p4Group);
    this.addShadowFloor(this.p4Group, -1.65);

    const branchMat = wcMat('#71563f', '#59422e', '#3c2b1c', '#a1856c', 'strata', 0.78);
    const winglessMat = wcMat('#3f775a', '#2d5e44', '#1b402c', '#82b69a', 'botanical', 0.56);
    const wingedMat = wcMat('#db9e3e', '#be8223', '#85530e', '#f4ce88', 'keratin', 0.56);

    const addBranch = (a: THREE.Vector3, b: THREE.Vector3, r = 0.055): void => {
      const geo = new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 8, r, 10, false);
      const m = new THREE.Mesh(geo, branchMat);
      m.castShadow = true;
      this.p4Group.add(m);
    };

    const addPieNode = (pos: THREE.Vector3, probWinged: number, radius = 0.36): void => {
      const group = new THREE.Group();
      group.position.copy(pos);
      const clamped = Math.max(0.02, Math.min(0.98, probWinged));
      const thetaWing = clamped * Math.PI * 2;
      const thetaWingless = Math.PI * 2 - thetaWing;

      const wingedSlice = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 0.14, 24, 1, false, 0, thetaWing),
        wingedMat,
      );
      wingedSlice.rotation.x = Math.PI / 2;
      wingedSlice.castShadow = true;
      group.add(wingedSlice);

      const winglessSlice = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 0.14, 24, 1, false, thetaWing, thetaWingless),
        winglessMat,
      );
      winglessSlice.rotation.x = Math.PI / 2;
      winglessSlice.castShadow = true;
      group.add(winglessSlice);

      this.p4Group.add(group);
    };

    const root = new THREE.Vector3(0, -1.25, 0);
    const leftMid = new THREE.Vector3(-1.35, -0.15, 0);
    const rightMid = new THREE.Vector3(1.35, -0.15, 0);
    const t1 = new THREE.Vector3(-2.15, 1.15, 0);
    const t2 = new THREE.Vector3(-0.62, 1.15, 0);
    const t3 = new THREE.Vector3(0.62, 1.15, 0);
    const t4 = new THREE.Vector3(2.15, 1.15, 0);

    addBranch(root, leftMid, 0.075);
    addBranch(root, rightMid, 0.075);
    addBranch(leftMid, t1, 0.055);
    addBranch(leftMid, t2, 0.055);
    addBranch(rightMid, t3, 0.055);
    addBranch(rightMid, t4, 0.055);

    addPieNode(root, res.rootWingProb, 0.44);
    addPieNode(leftMid, Math.min(0.45, res.rootWingProb * 0.72), 0.34);
    addPieNode(rightMid, Math.max(0.55, 0.82 - res.transitionRate * 0.16), 0.34);

    const tipStates = [
      { pos: t1, winged: false },
      { pos: t2, winged: false },
      { pos: t3, winged: true },
      { pos: t4, winged: true },
    ];
    tipStates.forEach((tip) => {
      const badge = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 18, 14),
        tip.winged ? wingedMat : winglessMat,
      );
      badge.position.copy(tip.pos);
      badge.castShadow = true;
      this.p4Group.add(badge);
      if (tip.winged) {
        const wingGeo = new THREE.BoxGeometry(0.42, 0.04, 0.18);
        const wL = new THREE.Mesh(wingGeo, wingedMat);
        wL.position.copy(tip.pos).add(new THREE.Vector3(-0.28, 0.12, 0.05));
        wL.rotation.z = 0.38;
        const wR = new THREE.Mesh(wingGeo, wingedMat);
        wR.position.copy(tip.pos).add(new THREE.Vector3(0.28, 0.12, 0.05));
        wR.rotation.z = -0.38;
        this.p4Group.add(wL, wR);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // PAGE 5: Shared Molecular Footprints (GULO Pseudogene & Primate ERVs)
  // ---------------------------------------------------------------------------
  private buildStaticPseudogenePage(): void {
    this.clearGroup(this.p5Group);
    this.addShadowFloor(this.p5Group, -1.65);

    const chrMat = wcMat('#d8ccb2', '#c3b497', '#968568', '#efe6d5', 'bone', 0.72);
    const sharedDelMat = wcMat('#c74738', '#a63326', '#721d14', '#e88b80', 'fruit', 0.52);
    const independentDelMat = wcMat('#cc9538', '#ad7920', '#78500f', '#ebc57d', 'keratin', 0.54);
    const ervMat = wcMat('#48778d', '#345e73', '#1f3e4e', '#8bb4c7', 'scale', 0.54);

    const rows = [
      { y: 1.05, sharedScar: true, sharedErv: true },
      { y: 0.35, sharedScar: true, sharedErv: true },
      { y: -0.35, sharedScar: true, sharedErv: true },
      { y: -1.05, sharedScar: false, sharedErv: false },
    ];

    rows.forEach((row) => {
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 5.0, 18), chrMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, row.y, 0);
      bar.castShadow = true;
      this.p5Group.add(bar);

      if (row.sharedScar) {
        const scar = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.195, 0.36, 18), sharedDelMat);
        scar.rotation.z = Math.PI / 2;
        scar.position.set(-0.65, row.y, 0);
        scar.castShadow = true;
        this.p5Group.add(scar);
      } else {
        const indScar = new THREE.Mesh(new THREE.CylinderGeometry(0.195, 0.195, 0.36, 18), independentDelMat);
        indScar.rotation.z = Math.PI / 2;
        indScar.position.set(1.35, row.y, 0);
        indScar.castShadow = true;
        this.p5Group.add(indScar);
      }

      if (row.sharedErv) {
        const erv = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), ervMat);
        erv.position.set(0.85, row.y, 0.04);
        erv.castShadow = true;
        this.p5Group.add(erv);
      }
    });

    const guideMat = new THREE.MeshStandardMaterial({
      color: '#c44536',
      transparent: true,
      opacity: 0.14,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const guloGuide = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 2.05), guideMat);
    guloGuide.position.set(-0.65, 0.35, -0.22);
    this.p5Group.add(guloGuide);

    const ervGuideMat = new THREE.MeshStandardMaterial({
      color: '#46748a',
      transparent: true,
      opacity: 0.14,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const ervGuide = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 2.05), ervGuideMat);
    ervGuide.position.set(0.85, 0.35, -0.22);
    this.p5Group.add(ervGuide);
  }

  private buildCapstoneSpecimen(): void {
    this.addShadowFloor(this.pageGroups.check, -1.65);
    const ringMat = wcMat('#a32a37', '#821c27', '#540d15', '#d96c78', 'fruit', 0.48);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 16, 40), ringMat);
    ring.castShadow = true;
    this.pageGroups.check.add(ring);

    const ribbonMat = wcMat('#4a7b91', '#386377', '#21404f', '#8db5c7', 'tissue', 0.6);
    const core = new THREE.Mesh(new THREE.TorusKnotGeometry(0.55, 0.1, 72, 12), ribbonMat);
    core.castShadow = true;
    this.pageGroups.check.add(core);
  }

  public setPage(page: CytochromePageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as CytochromePageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    if (page === 'cytc') {
      this.fitDist = 8.4;
      this.targetAzimuth = 0.25;
      this.targetPolar = 0.28;
    } else if (page === 'tree') {
      this.fitDist = 12.2;
      this.targetAzimuth = 0.06;
      this.targetPolar = 0.18;
    } else if (page === 'pic') {
      this.fitDist = 9.8;
      this.targetAzimuth = 0.42;
      this.targetPolar = 0.54;
    } else if (page === 'ancestral') {
      this.fitDist = 10.6;
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.24;
    } else if (page === 'pseudogenes') {
      this.fitDist = 10.6;
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.22;
    } else {
      this.fitDist = 7.8;
      this.targetAzimuth = 0.28;
      this.targetPolar = 0.32;
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

    if (!this.dragging) {
      if (this.activePage === 'cytc') {
        this.p1Group.rotation.y = Math.sin(t * 0.35) * 0.32;
      } else if (this.activePage === 'check') {
        this.pageGroups.check.rotation.y = t * 0.25;
      }
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

export { CYTC_TAXA };
