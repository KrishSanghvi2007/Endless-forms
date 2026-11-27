// =============================================================================
// Chapter 24: Reciprocity, Eusociality & Mutualisms — Naturalist Watercolour 3D
// 1. Roosting Vampire Bats (Desmodus rotundus) & Reciprocal Blood Sharing
// 2. Indirect Reciprocity & Reputation Halo Ring (Nowak & Sigmund 1998)
// 3. Sculpted Hexagonal Honeybee Comb & Royal Cell (Boomsma Monogamy Window)
// 4. Sculpted Clover Plant Roots with Pink N-Fixing vs Pale Cheater Nodules
// 5. Sculpted Pea Aphids — Vertical Buchnera Inheritance vs Horizontal Spread
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
  type NaturalistPattern,
} from '../../3d/naturalistCraft';
import type {
  EusocialResult,
  IndirectRecipResult,
  IpdResult,
  SanctionResult,
  TransmissionResult,
} from './cooperationMath';

export type CooperationPageId = 'bats' | 'reputation' | 'eusociality' | 'rhizobium' | 'transmission' | 'check';

function wcMat(
  base: string,
  wash: string,
  deep: string,
  highlight: string,
  pattern: NaturalistPattern,
  roughness = 0.7,
  transparent = false,
  opacity = 1.0,
): THREE.MeshStandardMaterial {
  return createNaturalistMaterial({ base, wash, deep, highlight }, pattern, {
    roughness,
    transparent,
    opacity,
  });
}

export class CooperationScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<CooperationPageId, THREE.Group>;
  private activePage: CooperationPageId = 'bats';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 9.0;
  private targetAzimuth = 0.2;
  private targetPolar = 0.3;
  private curAzimuth = 0.2;
  private curPolar = 0.3;
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
      bats: new THREE.Group(),
      reputation: new THREE.Group(),
      eusociality: new THREE.Group(),
      rhizobium: new THREE.Group(),
      transmission: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.bats.add(this.p1Group);
    this.pageGroups.reputation.add(this.p2Group);
    this.pageGroups.eusociality.add(this.p3Group);
    this.pageGroups.rhizobium.add(this.p4Group);
    this.pageGroups.transmission.add(this.p5Group);

    this.buildCapstoneSpecimen();

    this.attachPointerControls();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.setPage('bats');
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

  /** Sculpted roosting vampire bat (Desmodus rotundus) hanging upside-down */
  private buildVampireBat(fed: boolean): THREE.Group {
    const g = new THREE.Group();
    const furMat = fed
      ? wcMat('#6a5547', '#534034', '#36271e', '#998272', 'fur', 0.74)
      : wcMat('#8b7d70', '#706357', '#4d4238', '#b8aba0', 'fur', 0.78);
    const wingMat = wcMat('#493c36', '#372c27', '#221a16', '#726158', 'tissue', 0.68);
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#1b1410', roughness: 0.25 });

    // Claws gripping overhead branch
    const footGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.24, 8);
    const fL = new THREE.Mesh(footGeo, wingMat);
    fL.position.set(-0.1, 0.82, 0);
    const fR = new THREE.Mesh(footGeo, wingMat);
    fR.position.set(0.1, 0.82, 0);
    g.add(fL, fR);

    // Sculpted pear-shaped furred torso hanging downward
    const bodyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.72, 0),
      new THREE.Vector3(0, 0.28, 0.04),
      new THREE.Vector3(0, -0.25, 0.06),
      new THREE.Vector3(0, -0.68, 0.04),
    ]);
    const bodyGeo = createOrganicLoftGeometry(
      bodyCurve,
      (t) => (t < 0.2 ? 0.14 + t * 0.9 : t < 0.7 ? (fed ? 0.42 : 0.31) : 0.26 * (1 - (t - 0.7) * 1.4)),
      { tubularSegs: 20, radialSegs: 16, closedCaps: true },
    );
    const body = new THREE.Mesh(bodyGeo, furMat);
    body.castShadow = true;
    g.add(body);

    // Folded leathery patagium wings wrapping the shoulders
    [-1, 1].forEach((side) => {
      const wCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 0.18, 0.55, 0.02),
        new THREE.Vector3(side * 0.46, 0.1, 0.12),
        new THREE.Vector3(side * 0.36, -0.42, 0.08),
      ]);
      const wGeo = createOrganicLoftGeometry(wCurve, (t) => 0.14 * Math.sin(t * Math.PI) + 0.05, {
        tubularSegs: 16,
        radialSegs: 10,
        aspectAt: () => [0.55, 1.3],
      });
      const wing = new THREE.Mesh(wGeo, wingMat);
      wing.castShadow = true;
      g.add(wing);
    });

    // Upside-down head with pointed ears & tiny nose-leaf
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), furMat);
    head.position.set(0, -0.78, 0.08);
    head.scale.set(0.95, 0.88, 1.05);
    head.castShadow = true;
    g.add(head);

    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.22, 10), wingMat);
      ear.position.set(side * 0.16, -0.96, 0.06);
      ear.rotation.z = side * 0.45 + Math.PI;
      g.add(ear);

      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.042, 10, 8), eyeMat);
      eye.position.set(side * 0.1, -0.82, 0.27);
      g.add(eye);
    });

    return g;
  }

  // ---------------------------------------------------------------------------
  // PAGE 1: Roosting Vampire Bats & Reciprocal Blood Sharing
  // ---------------------------------------------------------------------------
  public updateBatsScene(res: IpdResult): void {
    this.clearGroup(this.p1Group);
    this.addShadowFloor(this.p1Group, -1.85);

    const branchMat = wcMat('#6d523c', '#563e2b', '#382618', '#9c7e65', 'strata', 0.82);
    const branchCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.6, 1.15, -0.1),
      new THREE.Vector3(-0.7, 1.32, 0.05),
      new THREE.Vector3(0.9, 1.24, -0.05),
      new THREE.Vector3(2.6, 1.12, 0.1),
    ]);
    const branch = new THREE.Mesh(
      createOrganicLoftGeometry(branchCurve, (t) => 0.16 - Math.abs(t - 0.5) * 0.08, {
        tubularSegs: 24,
        radialSegs: 12,
      }),
      branchMat,
    );
    branch.castShadow = true;
    this.p1Group.add(branch);

    const coopWins = res.winner !== 'ALLD';
    const batL = this.buildVampireBat(true);
    batL.position.set(-0.95, 0.35, 0);
    batL.rotation.y = 0.28;
    const batR = this.buildVampireBat(coopWins);
    batR.position.set(0.95, 0.35, 0);
    batR.rotation.y = -0.28;
    this.p1Group.add(batL, batR);

    if (coopWins) {
      // Glowing crimson regurgitated blood-sharing arc between roostmates!
      const bloodMat = wcMat('#b82e35', '#961f26', '#620e13', '#e5767c', 'fruit', 0.42);
      const shareCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.72, -0.45, 0.24),
        new THREE.Vector3(0, -0.78, 0.42),
        new THREE.Vector3(0.72, -0.45, 0.24),
      );
      const arc = new THREE.Mesh(new THREE.TubeGeometry(shareCurve, 24, 0.045, 10, false), bloodMat);
      arc.castShadow = true;
      this.p1Group.add(arc);
      for (let i = 0; i < 3; i++) {
        const drop = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), bloodMat);
        drop.position.copy(shareCurve.getPointAt(0.25 + i * 0.25));
        this.p1Group.add(drop);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 2: Indirect Reciprocity & Reputation Halo Ring
  // ---------------------------------------------------------------------------
  public updateReputationScene(res: IndirectRecipResult): void {
    this.clearGroup(this.p2Group);
    this.addShadowFloor(this.p2Group, -1.75);

    const coopMat = wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'feather', 0.56);
    const defMat = wcMat('#8c6b5a', '#705243', '#4d362a', '#b89a8a', 'fur', 0.72);
    const goldMat = wcMat('#dfa33d', '#c18521', '#83540d', '#f5d188', 'keratin', 0.42);

    const count = 6;
    const radius = 1.65;
    const positions: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const pos = new THREE.Vector3(Math.cos(a) * radius, -0.3, Math.sin(a) * radius);
      positions.push(pos);
      const isCoop = res.coopStable ? i < 5 : i < 1;

      const bird = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), isCoop ? coopMat : defMat);
      bird.scale.set(1.0, 1.15, 0.9);
      bird.position.copy(pos);
      bird.castShadow = true;
      this.p2Group.add(bird);

      if (isCoop) {
        const halo = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.045, 10, 24), goldMat);
        halo.rotation.x = Math.PI / 2;
        halo.position.copy(pos).add(new THREE.Vector3(0, 0.52, 0));
        this.p2Group.add(halo);
      }
    }

    if (res.coopStable) {
      // Helping ribbons flowing around the image-scoring community
      for (let i = 0; i < 4; i++) {
        const pA = positions[i]!;
        const pB = positions[i + 1]!;
        const mid = pA.clone().add(pB).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.65, 0));
        const arc = new THREE.Mesh(
          new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(pA, mid, pB), 20, 0.038, 8, false),
          goldMat,
        );
        this.p2Group.add(arc);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 3: Sculpted Hexagonal Honeybee Comb & Monogamy Fortress
  // ---------------------------------------------------------------------------
  public updateEusocialScene(res: EusocialResult): void {
    this.clearGroup(this.p3Group);
    this.addShadowFloor(this.p3Group, -1.75);

    const waxMat = wcMat('#dfb048', '#c4932c', '#8a6012', '#f7da8c', 'keratin', 0.62);
    const royalMat = wcMat('#c45b38', '#a34424', '#6e2811', '#ea9b80', 'fruit', 0.52);
    const beeGold = wcMat('#d89c32', '#b87e1d', '#7d500a', '#f2ca78', 'fur', 0.6);
    const beeDark = wcMat('#382b22', '#281e17', '#17100c', '#635143', 'keratin', 0.65);

    // 7 sculpted hexagonal beeswax comb cells arranged as a fortress rosette
    const hexOffsets: [number, number][] = [
      [0, 0],
      [1.02, 0],
      [-1.02, 0],
      [0.51, 0.88],
      [-0.51, 0.88],
      [0.51, -0.88],
      [-0.51, -0.88],
    ];
    hexOffsets.forEach(([x, y], idx) => {
      const cell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.54, 0.54, idx === 0 ? 0.62 : 0.45, 6),
        idx === 0 ? royalMat : waxMat,
      );
      cell.rotation.x = Math.PI / 2;
      cell.position.set(x, y, 0);
      cell.castShadow = true;
      this.p3Group.add(cell);
    });

    // Sculpted honeybee workers orbiting/tending the brood comb (more workers when eusocialFavoured!)
    const workerCount = res.eusocialFavoured ? 6 : 2;
    for (let i = 0; i < workerCount; i++) {
      const a = (i / workerCount) * Math.PI * 2 + 0.35;
      const bee = new THREE.Group();
      const abd = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), beeGold);
      abd.scale.set(1.4, 0.85, 0.85);
      const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.032, 8, 16), beeDark);
      stripe.rotation.y = Math.PI / 2;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), beeDark);
      head.position.x = 0.24;
      bee.add(abd, stripe, head);
      bee.position.set(Math.cos(a) * 1.45, Math.sin(a) * 1.25, 0.42);
      bee.rotation.z = a + Math.PI / 2;
      bee.castShadow = true;
      this.p3Group.add(bee);
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 4: Sculpted Clover Roots & Legume-Rhizobium Host Sanctions
  // ---------------------------------------------------------------------------
  public updateRhizobiumScene(res: SanctionResult): void {
    this.clearGroup(this.p4Group);
    this.addShadowFloor(this.p4Group, -1.95);

    const leafMat =
      res.plantGrowth > 0.65
        ? wcMat('#3f7d52', '#2d623d', '#1c4227', '#82be94', 'botanical', 0.64)
        : wcMat('#9e9a4e', '#827e38', '#595620', '#ccc984', 'botanical', 0.72);
    const rootMat = wcMat('#cbb896', '#b39e7a', '#84704f', '#e7dac0', 'bone', 0.76);
    const soilMat = wcMat('#6a533e', '#523e2c', '#36271a', '#967c64', 'strata', 0.88, true, 0.36);
    const pinkNodMat = wcMat('#d66772', '#b84b56', '#822832', '#f2a4ac', 'fruit', 0.52);
    const paleNodMat = wcMat('#cfc7b4', '#b5ac98', '#867d6a', '#ebe5d8', 'bone', 0.78);

    // Archival soil horizon slice
    const soil = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.14, 2.2), soilMat);
    soil.position.set(0, 0.05, 0);
    this.p4Group.add(soil);

    // Above-ground sculpted trifoliate clover stem & 3 lush leaves (scale with plantGrowth!)
    const s = 0.65 + res.plantGrowth * 0.55;
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 0),
      new THREE.Vector3(-0.08, 0.65 * s, 0.05),
      new THREE.Vector3(0.02, 1.25 * s, 0),
    ]);
    const stem = new THREE.Mesh(
      createOrganicLoftGeometry(stemCurve, () => 0.055 * s, { tubularSegs: 16, radialSegs: 10 }),
      leafMat,
    );
    stem.castShadow = true;
    this.p4Group.add(stem);

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.3;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.36 * s, 16, 12), leafMat);
      leaf.scale.set(1.15, 0.22, 0.92);
      leaf.position.set(Math.cos(a) * 0.38 * s, 1.32 * s, Math.sin(a) * 0.38 * s);
      leaf.rotation.y = -a;
      leaf.castShadow = true;
      this.p4Group.add(leaf);
    }

    // Below-ground branching legume roots studded with 8 nodules (pink cooperators vs pale cheaters!)
    const pinkCount = Math.round(res.cooperatorShare * 8);
    const branches = [-1.1, -0.45, 0.45, 1.1];
    let nodIdx = 0;
    branches.forEach((bx, bi) => {
      const rCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(bx * 0.65, -0.75, (bi % 2 === 0 ? 1 : -1) * 0.22),
        new THREE.Vector3(bx * 1.15, -1.62, (bi % 2 === 0 ? -1 : 1) * 0.16),
      ]);
      const rMesh = new THREE.Mesh(
        createOrganicLoftGeometry(rCurve, (t) => 0.075 * (1 - t * 0.65), { tubularSegs: 16, radialSegs: 10 }),
        rootMat,
      );
      rMesh.castShadow = true;
      this.p4Group.add(rMesh);

      [0.42, 0.78].forEach((u) => {
        const isPink = nodIdx < pinkCount;
        nodIdx++;
        const pt = rCurve.getPointAt(u);
        const rad = isPink ? 0.17 : 0.11; // Host starves cheater nodules so they stay small & pale!
        const nod = new THREE.Mesh(
          new THREE.SphereGeometry(rad, 14, 12),
          isPink ? pinkNodMat : paleNodMat,
        );
        nod.position.copy(pt).add(new THREE.Vector3(0.08 * (nodIdx % 2 === 0 ? 1 : -1), 0, 0.08));
        nod.castShadow = true;
        this.p4Group.add(nod);
      });
    });
  }

  // ---------------------------------------------------------------------------
  // PAGE 5: Vertical vs Horizontal Symbiont Transmission (Pea Aphids)
  // ---------------------------------------------------------------------------
  public updateTransmissionScene(res: TransmissionResult): void {
    this.clearGroup(this.p5Group);
    this.addShadowFloor(this.p5Group, -1.75);

    const hostMat = wcMat('#6ba674', '#508758', '#315c38', '#a8d9af', 'botanical', 0.6);
    const legMat = wcMat('#3b5c40', '#2b452f', '#192b1c', '#6a8f70', 'keratin', 0.65);
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#1b1410', roughness: 0.25 });
    const symMat =
      res.verticalFrac > 0.55
        ? wcMat('#2f7854', '#225e40', '#133d28', '#70b892', 'botanical', 0.48)
        : wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.48);

    const makeAphid = (scale: number): THREE.Group => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.55 * scale, 18, 14), hostMat);
      body.scale.set(1.25, 0.85, 0.92);
      body.castShadow = true;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.26 * scale, 14, 12), hostMat);
      head.position.set(0.62 * scale, -0.04 * scale, 0);
      head.castShadow = true;
      g.add(body, head);
      // Eyes, antennae & tiny legs for lively naturalist organism silhouette
      [-1, 1].forEach((side) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06 * scale, 10, 8), eyeMat);
        eye.position.set(0.76 * scale, 0.04 * scale, side * 0.17 * scale);
        const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.015 * scale, 0.02 * scale, 0.55 * scale, 6), legMat);
        ant.position.set(0.92 * scale, 0.22 * scale, side * 0.16 * scale);
        ant.rotation.z = -0.85;
        ant.rotation.x = side * 0.35;
        g.add(eye, ant);
        [-0.25, 0.05, 0.32].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * scale, 0.025 * scale, 0.45 * scale, 6), legMat);
          leg.position.set(lx * scale, -0.42 * scale, side * 0.32 * scale);
          leg.rotation.x = side * 0.45;
          g.add(leg);
        });
      });
      return g;
    };

    const mother = makeAphid(1.0);
    mother.position.set(-1.35, 0.45, 0);
    this.p5Group.add(mother);

    if (res.verticalFrac > 0.5) {
      // Mother-to-daughter vertical transmission inside developing egg!
      const daughter = makeAphid(0.68);
      daughter.position.set(1.15, -0.55, 0);
      this.p5Group.add(daughter);

      const vCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-1.15, 0.35, 0.1),
        new THREE.Vector3(-0.05, 0.15, 0.25),
        new THREE.Vector3(0.95, -0.52, 0.1),
      );
      const path = new THREE.Mesh(new THREE.TubeGeometry(vCurve, 24, 0.055, 10, false), symMat);
      this.p5Group.add(path);
      for (let i = 0; i < 4; i++) {
        const b = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), symMat);
        b.position.copy(vCurve.getPointAt(0.15 + i * 0.23));
        this.p5Group.add(b);
      }
    } else {
      // Horizontal jump across unrelated adult hosts (higher virulence!)
      const stranger = makeAphid(1.0);
      stranger.position.set(1.45, 0.45, 0);
      this.p5Group.add(stranger);

      const hCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-0.9, 0.65, 0.15),
        new THREE.Vector3(0.05, 1.38, 0.3),
        new THREE.Vector3(1.0, 0.65, 0.15),
      );
      const path = new THREE.Mesh(new THREE.TubeGeometry(hCurve, 24, 0.06, 10, false), symMat);
      this.p5Group.add(path);
      for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), symMat);
        p.position.copy(hCurve.getPointAt(0.15 + i * 0.23));
        this.p5Group.add(p);
      }
    }
  }

  private buildCapstoneSpecimen(): void {
    this.addShadowFloor(this.pageGroups.check, -1.75);
    const bat = this.buildVampireBat(true);
    bat.scale.setScalar(1.25);
    this.pageGroups.check.add(bat);
  }

  public setPage(page: CooperationPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as CooperationPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    if (page === 'bats') {
      this.fitDist = 9.0;
      this.targetAzimuth = 0.14;
      this.targetPolar = 0.22;
    } else if (page === 'reputation') {
      this.fitDist = 9.6;
      this.targetAzimuth = 0.28;
      this.targetPolar = 0.56;
    } else if (page === 'eusociality') {
      this.fitDist = 8.8;
      this.targetAzimuth = 0.18;
      this.targetPolar = 0.24;
    } else if (page === 'rhizobium') {
      this.fitDist = 9.4;
      this.targetAzimuth = 0.16;
      this.targetPolar = 0.22;
    } else if (page === 'transmission') {
      this.fitDist = 9.4;
      this.targetAzimuth = 0.12;
      this.targetPolar = 0.22;
    } else {
      this.fitDist = 7.4;
      this.targetAzimuth = 0.24;
      this.targetPolar = 0.24;
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
      this.pageGroups.check.rotation.y = t * 0.32;
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
