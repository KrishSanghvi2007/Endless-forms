// =============================================================================
// Chapter 23: Sign Epistasis & Quantitative G-Matrices — Naturalist Watercolour 3D
// 1. 2-Locus Fitness Cube (Additive / Magnitude / Sign / Reciprocal Sign Epistasis)
// 2. Weinreich (2006) 5-Mutation Beta-Lactamase Accessible vs Blocked Pathways
// 3. Multivariate Selection (Lande 1979: Delta z_bar = G * beta) & 3D G-Ellipse
// 4. Polygenic Architecture & 3D GWAS Manhattan Skyline
// 5. Antagonistic Pleiotropy & Genetic Trade-Off Constraints
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  setupNaturalistLighting,
  type NaturalistPattern,
} from '../../3d/naturalistCraft';
import type {
  EpistasisLandscape,
  GMatrixResult,
  GwasPreset,
  WeinreichPath,
} from './epistasisMath';

export type EpistasisPageId = 'epistasis' | 'weinreich' | 'gmatrix' | 'gwas' | 'constraints' | 'check';

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

export class EpistasisScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<EpistasisPageId, THREE.Group>;
  private activePage: EpistasisPageId = 'epistasis';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 9.4;
  private targetAzimuth = 0.42;
  private targetPolar = 0.46;
  private curAzimuth = 0.42;
  private curPolar = 0.46;
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
      epistasis: new THREE.Group(),
      weinreich: new THREE.Group(),
      gmatrix: new THREE.Group(),
      gwas: new THREE.Group(),
      constraints: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.epistasis.add(this.p1Group);
    this.pageGroups.weinreich.add(this.p2Group);
    this.pageGroups.gmatrix.add(this.p3Group);
    this.pageGroups.gwas.add(this.p4Group);
    this.pageGroups.constraints.add(this.p5Group);

    this.buildCapstoneSpecimen();

    this.attachPointerControls();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.setPage('epistasis');
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

  private addArrow(
    parent: THREE.Group,
    from: THREE.Vector3,
    to: THREE.Vector3,
    mat: THREE.Material,
    rad = 0.055,
  ): void {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    if (len < 0.05) return;
    const shaftEnd = from.clone().addScaledVector(dir.clone().normalize(), Math.max(0.05, len - 0.28));
    const shaft = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.LineCurve3(from, shaftEnd), 8, rad, 10, false),
      mat,
    );
    shaft.castShadow = true;
    parent.add(shaft);

    const head = new THREE.Mesh(new THREE.ConeGeometry(rad * 2.5, 0.34, 12), mat);
    head.position.copy(shaftEnd).addScaledVector(dir.clone().normalize(), 0.14);
    head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    head.castShadow = true;
    parent.add(head);
  }

  // ---------------------------------------------------------------------------
  // PAGE 1: 2-Locus Fitness Cube (Additive / Magnitude / Sign / Reciprocal Sign)
  // ---------------------------------------------------------------------------
  public updateEpistasisScene(land: EpistasisLandscape): void {
    this.clearGroup(this.p1Group);
    this.addShadowFloor(this.p1Group, -1.75);

    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.12, 3.8),
      wcMat('#ebe2cf', '#ddd0b6', '#bda988', '#f8f3e8', 'bone', 0.86),
    );
    basePlate.position.set(0, -1.65, 0);
    basePlate.receiveShadow = true;
    this.p1Group.add(basePlate);

    const peakMat = wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.56);
    const midMat = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.58);
    const valleyMat = wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.56);
    const upMat = wcMat('#3f7b58', '#2e6143', '#1c422c', '#82b898', 'botanical', 0.48);
    const blockMat = wcMat('#bd372a', '#992219', '#66110b', '#e37b72', 'fruit', 0.48);

    const nodes = [
      { key: 'ab', x: -1.25, z: 1.25, w: land.w_ab },
      { key: 'Ab', x: 1.25, z: 1.25, w: land.w_Ab },
      { key: 'aB', x: -1.25, z: -1.25, w: land.w_aB },
      { key: 'AB', x: 1.25, z: -1.25, w: land.w_AB },
    ];

    const tops: Record<string, THREE.Vector3> = {};
    nodes.forEach((n) => {
      const h = Math.max(0.35, n.w * 1.15);
      const isValley = n.w < land.w_ab - 0.05;
      const isPeak = n.key === 'AB' || (land.mode === 'reciprocal' && n.key === 'ab');
      const mat = isValley ? valleyMat : isPeak ? peakMat : midMat;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.42, h, 20), mat);
      col.position.set(n.x, -1.59 + h / 2, n.z);
      col.castShadow = true;
      this.p1Group.add(col);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), mat);
      const topPos = new THREE.Vector3(n.x, -1.59 + h + 0.14, n.z);
      cap.position.copy(topPos);
      cap.castShadow = true;
      this.p1Group.add(cap);
      tops[n.key] = topPos;
    });

    const edges: [string, string, number, number][] = [
      ['ab', 'Ab', land.w_ab, land.w_Ab],
      ['ab', 'aB', land.w_ab, land.w_aB],
      ['Ab', 'AB', land.w_Ab, land.w_AB],
      ['aB', 'AB', land.w_aB, land.w_AB],
    ];
    edges.forEach(([a, b, wa, wb]) => {
      const uphill = wb > wa + 0.01;
      const pa = tops[a]!;
      const pb = tops[b]!;
      this.addArrow(this.p1Group, pa, pb, uphill ? upMat : blockMat, 0.048);
    });
  }

  // ---------------------------------------------------------------------------
  // PAGE 2: Weinreich (2006) 5-Mutation Beta-Lactamase Stepping Stones
  // ---------------------------------------------------------------------------
  public updateWeinreichScene(path: WeinreichPath): void {
    this.clearGroup(this.p2Group);
    this.addShadowFloor(this.p2Group, -1.75);

    const stepMat = path.accessible
      ? wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.56)
      : wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.56);
    const neutralMat = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.58);
    const goldMat = wcMat('#dda23e', '#be8422', '#82540d', '#f4ce86', 'keratin', 0.48);

    const pts: THREE.Vector3[] = [];
    path.stepFitness.forEach((f, idx) => {
      const x = (idx - 2.5) * 1.05;
      const h = Math.max(0.32, f * 0.76);
      const isDrop = idx > 0 && f < path.stepFitness[idx - 1]!;
      const mat = idx === 5 ? goldMat : isDrop ? stepMat : idx === 0 ? neutralMat : path.accessible ? stepMat : neutralMat;

      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.33, h, 18), mat);
      pillar.position.set(x, -1.65 + h / 2, 0);
      pillar.castShadow = true;
      this.p2Group.add(pillar);

      const top = new THREE.Vector3(x, -1.65 + h + 0.16, 0);
      pts.push(top);
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 12), mat);
      orb.position.copy(top);
      orb.castShadow = true;
      this.p2Group.add(orb);
    });

    for (let i = 0; i < pts.length - 1; i++) {
      const uphill = path.stepFitness[i + 1]! > path.stepFitness[i]!;
      this.addArrow(
        this.p2Group,
        pts[i]!,
        pts[i + 1]!,
        uphill
          ? wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.5)
          : wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.5),
        0.045,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 3: Multivariate Selection (Delta z_bar = G * beta) & 3D G-Ellipse
  // ---------------------------------------------------------------------------
  public updateGMatrixScene(res: GMatrixResult): void {
    this.clearGroup(this.p3Group);
    this.addShadowFloor(this.p3Group, -1.65);

    const plateMat = wcMat('#ece3d0', '#dfd2b8', '#bfa988', '#faf5ea', 'bone', 0.86);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 4.6), plateMat);
    plate.position.set(0, -1.55, 0);
    plate.receiveShadow = true;
    this.p3Group.add(plate);

    // Genetic Covariance Ellipse (stretched along diagonal according to r_G!)
    const ellipseMat = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'tissue', 0.55, true, 0.38);
    const semiMajor = 1.1 + Math.abs(res.rG) * 0.72;
    const semiMinor = Math.max(0.32, 1.05 - Math.abs(res.rG) * 0.65);
    const angle = res.rG >= 0 ? -Math.PI / 4 : Math.PI / 4;

    const ellipse = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.14, 36), ellipseMat);
    ellipse.scale.set(semiMajor, 1, semiMinor);
    ellipse.rotation.y = angle;
    ellipse.position.set(0, -1.38, 0);
    this.p3Group.add(ellipse);

    // Scattered breeding-value pearls inside the G-matrix ellipse
    const pearlMat = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.52);
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2 + (i % 3) * 0.4;
      const rad = 0.25 + ((i * 37) % 100) / 135;
      const lx = Math.cos(a) * rad * semiMajor;
      const lz = Math.sin(a) * rad * semiMinor;
      const rx = lx * Math.cos(-angle) - lz * Math.sin(-angle);
      const rz = lx * Math.sin(-angle) + lz * Math.cos(-angle);
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 10), pearlMat);
      dot.position.set(rx, -1.28, rz);
      dot.castShadow = true;
      this.p3Group.add(dot);
    }

    // Selection Gradient Vector beta (crimson)
    const origin = new THREE.Vector3(0, -1.08, 0);
    const betaTip = new THREE.Vector3(res.betaX * 1.95, -1.08, -res.betaY * 1.95);
    const betaMat = wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.46);
    this.addArrow(this.p3Group, origin, betaTip, betaMat, 0.068);

    // Evolutionary Response Vector Delta z_bar = G * beta (emerald/gold!)
    const respTip = new THREE.Vector3(res.respX * 1.75, -0.92, -res.respY * 1.75);
    const respMat = wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.46);
    this.addArrow(this.p3Group, new THREE.Vector3(0, -0.92, 0), respTip, respMat, 0.072);
  }

  // ---------------------------------------------------------------------------
  // PAGE 4: Polygenic Architecture & 3D GWAS Manhattan Skyline
  // ---------------------------------------------------------------------------
  public updateGwasScene(preset: GwasPreset): void {
    this.clearGroup(this.p4Group);
    this.addShadowFloor(this.p4Group, -1.75);

    const sigMat = wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.5);
    const bgA = wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.62);
    const bgB = wcMat('#7e684e', '#65513a', '#443524', '#ae977c', 'strata', 0.68);
    const polyMat = wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.56);

    const n = preset.heights.length;
    preset.heights.forEach((h, i) => {
      const x = (i - (n - 1) / 2) * 0.34;
      const isSig = h > 1.1;
      const mat = isSig ? sigMat : preset.id === 'polygenic' ? polyMat : i % 2 === 0 ? bgA : bgB;
      const barH = Math.max(0.14, h * 1.15);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.125, barH, 12), mat);
      col.position.set(x, -1.65 + barH / 2, 0);
      col.castShadow = true;
      this.p4Group.add(col);
    });

    // Translucent Genome-Wide Significance Threshold plane (p = 5e-8)
    const thresh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.4, 1.0),
      new THREE.MeshStandardMaterial({
        color: '#c44536',
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      }),
    );
    thresh.rotation.x = Math.PI / 2;
    thresh.position.set(0, -1.65 + 1.25, 0);
    this.p4Group.add(thresh);
  }

  // ---------------------------------------------------------------------------
  // PAGE 5: Antagonistic Pleiotropy & Trade-Off Constraint Ridge
  // ---------------------------------------------------------------------------
  public updateConstraintsScene(antagonistic: boolean): void {
    this.clearGroup(this.p5Group);
    this.addShadowFloor(this.p5Group, -1.75);

    const ridgeMat = wcMat('#d8ccb2', '#c1b294', '#948365', '#efe6d5', 'strata', 0.78);
    const goldMat = wcMat('#dda23e', '#be8422', '#82540d', '#f4ce86', 'keratin', 0.48);
    const popMat = antagonistic
      ? wcMat('#c44536', '#a43124', '#6f1b12', '#e88b80', 'fruit', 0.52)
      : wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.52);

    // Base trade-off board
    const board = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.12, 4.4), ridgeMat);
    board.position.set(0, -1.6, 0);
    board.receiveShadow = true;
    this.p5Group.add(board);

    // Ideal joint fitness optimum corner (high trait 1 + high trait 2) in upper-right
    const peak = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.35, 20), goldMat);
    peak.position.set(1.45, -0.88, -1.45);
    peak.castShadow = true;
    this.p5Group.add(peak);

    // Population cloud: either pinched along negative-slope trade-off wall or free to climb!
    for (let i = 0; i < 20; i++) {
      const t = (i / 19) * 2 - 1;
      const x = antagonistic ? t * 1.45 : 0.45 + t * 0.75;
      const z = antagonistic ? t * 1.45 : -0.45 - t * 0.75 + Math.sin(i * 2.1) * 0.45;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), popMat);
      orb.position.set(x, -1.35 + (antagonistic ? 0 : Math.max(0, 0.45 * (x - z) * 0.2)), z);
      orb.castShadow = true;
      this.p5Group.add(orb);
    }

    if (antagonistic) {
      // Physical genetic-trade-off barrier ridge blocking northeast climb
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 0.52, 0.16),
        wcMat('#8c6b4d', '#705338', '#4c3622', '#b89b7e', 'strata', 0.8),
      );
      wall.rotation.y = -Math.PI / 4;
      wall.position.set(0.42, -1.28, -0.42);
      wall.castShadow = true;
      this.p5Group.add(wall);
    } else {
      this.addArrow(
        this.p5Group,
        new THREE.Vector3(-0.35, -1.15, 0.35),
        new THREE.Vector3(1.22, -0.85, -1.22),
        popMat,
        0.07,
      );
    }
  }

  private buildCapstoneSpecimen(): void {
    this.addShadowFloor(this.pageGroups.check, -1.75);
    const mat = wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.55);
    const torus = new THREE.Mesh(new THREE.TorusKnotGeometry(0.75, 0.16, 72, 14), mat);
    torus.castShadow = true;
    this.pageGroups.check.add(torus);
  }

  public setPage(page: EpistasisPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as EpistasisPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    if (page === 'epistasis') {
      this.fitDist = 9.6;
      this.targetAzimuth = 0.52;
      this.targetPolar = 0.48;
    } else if (page === 'weinreich') {
      this.fitDist = 11.4;
      this.targetAzimuth = 0.12;
      this.targetPolar = 0.24;
    } else if (page === 'gmatrix') {
      this.fitDist = 9.8;
      this.targetAzimuth = 0.25;
      this.targetPolar = 0.72;
    } else if (page === 'gwas') {
      this.fitDist = 11.4;
      this.targetAzimuth = 0.15;
      this.targetPolar = 0.26;
    } else if (page === 'constraints') {
      this.fitDist = 9.8;
      this.targetAzimuth = 0.45;
      this.targetPolar = 0.62;
    } else {
      this.fitDist = 7.6;
      this.targetAzimuth = 0.25;
      this.targetPolar = 0.3;
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
      this.targetPolar = Math.max(-0.3, Math.min(1.2, this.targetPolar + dy * 0.006));
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
