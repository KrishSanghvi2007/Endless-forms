// =============================================================================
// Chapter 20: Embryos, Heterochrony & Evo-Devo — Naturalist Watercolour 3D
// 1. Comparative Translucent Vertebrate Embryos (Zebrafish, Salamander, Chick, Human)
// 2. Developmental Hourglass 3D Sculpted Profile (Wide Early -> Conserved Waist -> Wide Late)
// 3. Live-Morphing Axolotl Paedomorphosis (Feathery External Gills -> Metamorphosis)
// 4. Exaptation & Co-option (Contour Flight Feather vs Downy Proto-Feather Plume)
// 5. Waddington's 3D Epigenetic Landscape (Canalization Valleys & Rolling Cells)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import archaeopteryxGlbUrl from '../../assets/smithsonian_archaeopteryx.glb?url';
import type {
  CanalizationResult,
  EmbryoProfile,
  EmbryoStageId,
  HeterochronyResult,
} from './embryoMath';

export type EmbryoPageId = 'embryos' | 'hourglass' | 'heterochrony' | 'exaptation' | 'canalization' | 'check';

export class EmbryoScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<EmbryoPageId, THREE.Group>;
  private activePage: EmbryoPageId = 'embryos';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 9.0;
  private targetAzimuth = 0.22;
  private targetPolar = 0.36;
  private curAzimuth = 0.22;
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
      embryos: new THREE.Group(),
      hourglass: new THREE.Group(),
      heterochrony: new THREE.Group(),
      exaptation: new THREE.Group(),
      canalization: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.embryos.add(this.p1Group);
    this.pageGroups.hourglass.add(this.p2Group);
    this.pageGroups.heterochrony.add(this.p3Group);
    this.pageGroups.exaptation.add(this.p4Group);
    this.pageGroups.canalization.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('embryos');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  /** Sculpted translucent watercolour C-curved vertebrate embryo (Pharyngula / Early / Late) */
  private createEmbryo3D(prof: EmbryoProfile, stage: EmbryoStageId, scale = 1.0): THREE.Group {
    const g = new THREE.Group();
    g.scale.setScalar(scale);

    const tissueMat = createNaturalistMaterial(
      { base: '#f0dfd1', wash: '#d6baa5', deep: '#96765f', highlight: '#fff7f0', ink: '#6e5240' },
      'tissue',
      { roughness: 0.72, transparent: true, opacity: 0.9, inkStrength: 0.52, seed: 2001 }
    );
    const yolkMat = createNaturalistMaterial(
      { base: '#e8c468', wash: '#c49b39', deep: '#826015', highlight: '#fce8ad' },
      'fruit',
      { roughness: 0.78, inkStrength: 0.42, seed: 2002 }
    );
    const archMat = createNaturalistMaterial(
      { base: '#cf827a', wash: '#a65750', deep: '#662b26', highlight: '#f5bbb5' },
      'tissue',
      { roughness: 0.8, inkStrength: 0.48, seed: 2003 }
    );
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x262124, roughness: 0.22 });

    if (stage === 'early') {
      // Early cleavage/blastula: dramatically different yolk proportions across taxa!
      const yolk = new THREE.Mesh(new THREE.SphereGeometry(prof.yolkSacSize * 1.15, 22, 18), yolkMat);
      yolk.position.y = 0.55;
      yolk.castShadow = true;
      g.add(yolk);

      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(prof.id === 'human' ? 0.28 : prof.yolkSacSize * 0.78, 20, 14),
        tissueMat
      );
      cap.scale.set(1.0, prof.id === 'human' ? 1.0 : 0.45, 1.0);
      cap.position.y = prof.id === 'human' ? 0.65 : 0.55 + prof.yolkSacSize * 1.05;
      cap.castShadow = true;
      g.add(cap);
      return g;
    }

    // Phylotypic / Late C-curved vertebrate embryo body (forebrain -> curved somite spine -> post-anal tail!)
    const isLate = stage === 'late';
    const tailLen = isLate ? prof.tailRatioLate : 0.85;
    const headBulb = isLate && prof.id === 'human' ? 0.36 : 0.22;

    const spineCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.12, 0.24),                     // Forebrain / crown
      new THREE.Vector3(0, 1.18, -0.08),                    // Midbrain flex
      new THREE.Vector3(0, 0.92, -0.34),                    // Dorsal somite ridge
      new THREE.Vector3(0, 0.52, -0.28),                    // Lower trunk
      new THREE.Vector3(0, 0.24, 0.04 + tailLen * 0.28),    // Curled post-anal tail!
    ]);
    const body = new THREE.Mesh(
      createOrganicLoftGeometry(
        spineCurve,
        (t) => {
          if (t < 0.25) return headBulb * Math.sin(Math.min(1, t / 0.22) * Math.PI * 0.75) + 0.06;
          return (0.20 * (1 - t * 0.72)) * (0.85 + 0.15 * Math.sin(t * 28)); // Subtle dorsal somite ridges!
        },
        { tubularSegs: 42, radialSegs: 18, aspectAt: () => [0.78, 1.05] }
      ),
      tissueMat
    );
    body.castShadow = true;
    g.add(body);

    // Conserved Pharyngeal Arches (3 paired coral-rose ridges along the neck!)
    for (let a = 0; a < 3; a++) {
      const arch = new THREE.Mesh(new THREE.CapsuleGeometry(0.032, 0.14, 5, 8), archMat);
      arch.position.set(0, 0.92 - a * 0.075, 0.12 - a * 0.03);
      arch.rotation.z = Math.PI / 2;
      g.add(arch);
    }

    // Prominent optic eye cup
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.058, 10, 8), eyeMat);
      eye.position.set(s * 0.135, 1.08, 0.24);
      g.add(eye);
    }

    // Ventral yolk sac (prominent in fish/chick, tiny in human!)
    if (prof.yolkSacSize > 0.15 && (!isLate || prof.id === 'fish')) {
      const yolk = new THREE.Mesh(new THREE.SphereGeometry(prof.yolkSacSize * 0.65, 16, 12), yolkMat);
      yolk.position.set(0, 0.62, 0.18);
      g.add(yolk);
    }

    // Late-stage species-specific limb / wing / fin buds!
    if (isLate && prof.limbBud) {
      for (const s of [-1, 1]) {
        const bud = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.16, 6, 8), tissueMat);
        bud.position.set(s * 0.16, 0.72, 0.08);
        bud.rotation.x = 0.85;
        bud.rotation.z = s * 0.35;
        bud.castShadow = true;
        g.add(bud);
      }
    }

    return g;
  }

  // ===========================================================================
  // PAGE 1: COMPARATIVE VERTEBRATE EMBRYO GALLERY (4 Species Side-by-Side!)
  // ===========================================================================

  public updateEmbryos(taxa: EmbryoProfile[], stage: EmbryoStageId): void {
    this.p1Group.clear();
    const g = this.p1Group;
    taxa.forEach((prof, idx) => {
      const em = this.createEmbryo3D(prof, stage, 0.96);
      em.position.set(-1.8 + idx * 1.2, 0.05, 0);
      em.rotation.y = 0.72;
      g.add(em);
    });
  }

  // ===========================================================================
  // PAGE 2: DEVELOPMENTAL HOURGLASS SCULPTED 3D PROFILE
  // ===========================================================================

  public updateHourglass(stage: EmbryoStageId): void {
    this.p2Group.clear();
    const g = this.p2Group;

    const glassMat = createNaturalistMaterial(
      { base: '#6f9c99', wash: '#497875', deep: '#244745', highlight: '#b8dedb', ink: '#183331' },
      'tissue',
      { roughness: 0.72, transparent: true, opacity: 0.78, inkStrength: 0.55, seed: 2020 }
    );
    const ringMat = createNaturalistMaterial(
      { base: '#d99f36', wash: '#b07817', deep: '#6b4506', highlight: '#fae08e' },
      'keratin',
      { roughness: 0.62, inkStrength: 0.45, seed: 2021 }
    );

    // Sculpted hourglass lathe: wide early cleavage (bottom), narrow conserved Phylotypic Waist (middle), wide adult divergence (top)!
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const f = i / 24;
      const y = f * 2.1;
      const r = 0.34 + 0.68 * Math.pow(Math.abs(f - 0.5) * 2, 1.55);
      pts.push(new THREE.Vector2(r, y));
    }
    const hourglass = new THREE.Mesh(new THREE.LatheGeometry(pts, 32), glassMat);
    hourglass.castShadow = true;
    g.add(hourglass);

    // Glowing golden collar sliding to Early (0.2), Phylotypic Waist (1.05), or Late (1.85)!
    const ringY = stage === 'early' ? 0.28 : stage === 'phylotypic' ? 1.05 : 1.82;
    const ringR = stage === 'phylotypic' ? 0.40 : 0.86;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.055, 10, 36), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = ringY;
    g.add(ring);
  }

  // ===========================================================================
  // PAGE 3: HETEROCHRONY — LIVE-MORPHING AXOLOTL PAEDOMORPHOSIS
  // ===========================================================================

  public updateHeterochrony(res: HeterochronyResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    // Transitions from translucent rose-cream Axolotl -> mottled olive-gold Tiger Salamander!
    const isAxo = res.thyroidSignal < 0.5;
    const bodyMat = createNaturalistMaterial(
      isAxo
        ? { base: '#f0d8d8', wash: '#d9b4b4', deep: '#9e7575', highlight: '#fff5f5', ink: '#6e4a4a' }
        : { base: '#6e7a48', wash: '#4d572e', deep: '#293014', highlight: '#b0bd86', ink: '#1c210c' },
      'tissue',
      { roughness: 0.78, inkStrength: 0.54, seed: isAxo ? 2031 : 2032 }
    );
    const gillMat = createNaturalistMaterial(
      { base: '#d96272', wash: '#b03c4d', deep: '#6b1a26', highlight: '#faaeb8' },
      'feather',
      { roughness: 0.82, inkStrength: 0.48, seed: 2033 }
    );

    // Continuous lofted amphibian body (broad blunt snout -> torso -> long swimming tail!)
    const spine = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.26, 1.05),
      new THREE.Vector3(0, 0.25, 0.55),
      new THREE.Vector3(0, 0.22, -0.05),
      new THREE.Vector3(0.14, 0.20, -0.78),
      new THREE.Vector3(-0.12, 0.18, -1.55),
    ]);
    const body = new THREE.Mesh(
      createOrganicLoftGeometry(
        spine,
        (t) => (t < 0.22 ? 0.19 * Math.sin((t / 0.22) * Math.PI * 0.75) + 0.04 : 0.21 * (1 - t * 0.78)),
        { tubularSegs: 42, radialSegs: 18, aspectAt: (t) => (t > 0.62 ? [0.45, 1.35 + res.finCrest * 0.65] : [1.15, 0.85]) }
      ),
      bodyMat
    );
    body.castShadow = true;
    g.add(body);

    // 3 Paired Iconic Feathery Pink External Larval Gills (shrink away as thyroid signal triggers metamorphosis!)
    if (res.gillFluff > 0.08) {
      for (const s of [-1, 1]) {
        for (let b = 0; b < 3; b++) {
          const len = (0.34 + b * 0.06) * res.gillFluff;
          const gCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(s * 0.18, 0.28 + b * 0.04, 0.65 - b * 0.06),
            new THREE.Vector3(s * (0.28 + len * 0.6), 0.38 + b * 0.09, 0.55 - b * 0.08),
            new THREE.Vector3(s * (0.32 + len), 0.42 + b * 0.12, 0.42 - b * 0.1),
          ]);
          const plume = new THREE.Mesh(
            createOrganicLoftGeometry(gCurve, (t) => (0.042 * res.gillFluff) * (1 - t * 0.55), {
              tubularSegs: 14,
              radialSegs: 8,
            }),
            gillMat
          );
          plume.castShadow = true;
          g.add(plume);
        }
      }
    }

    // Four sprawling amphibian legs + tiny dark eyes
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x181414, roughness: 0.15 });
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 8), eyeMat);
      eye.position.set(s * 0.13, 0.34, 0.88);
      g.add(eye);
      for (const lz of [0.35, -0.38]) {
        const lCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(s * 0.14, 0.18, lz),
          new THREE.Vector3(s * 0.34, 0.14, lz + 0.06),
          new THREE.Vector3(s * 0.42, 0.03, lz + 0.12),
        ]);
        const leg = new THREE.Mesh(
          createOrganicLoftGeometry(lCurve, () => 0.042, { tubularSegs: 10, radialSegs: 8 }),
          bodyMat
        );
        leg.castShadow = true;
        g.add(leg);
      }
    }
  }

  // ===========================================================================
  // PAGE 4: EXAPTATION — DOWNY THEROPOD PROTO-FEATHER vs ASYMMETRIC FLIGHT FEATHER
  // ===========================================================================

  public updateExaptation(flightMode: boolean): void {
    this.p4Group.clear();
    const g = this.p4Group;

    const quillMat = createNaturalistMaterial(
      { base: '#f0e6d2', wash: '#d4c5a9', deep: '#8f8065', highlight: '#fffdf7' },
      'bone',
      { roughness: 0.72, inkStrength: 0.45, seed: 2040 }
    );
    const vaneMat = createNaturalistMaterial(
      flightMode
        ? { base: '#4c7594', wash: '#2d5370', deep: '#163045', highlight: '#96bedb' }
        : { base: '#c47243', wash: '#994e24', deep: '#59290e', highlight: '#f2b691' },
      'feather',
      { roughness: 0.84, side: THREE.DoubleSide, inkStrength: 0.52, seed: flightMode ? 2041 : 2042 }
    );

    // Central arched rachis shaft
    const rachisCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, 0.25, 0),
      new THREE.Vector3(-0.35, 0.52, 0.04),
      new THREE.Vector3(0.75, 0.65, 0.02),
      new THREE.Vector3(1.65, 0.58, -0.04),
    ]);
    const rachis = new THREE.Mesh(
      createOrganicLoftGeometry(rachisCurve, (t) => 0.048 * (1 - t * 0.65), { tubularSegs: 28, radialSegs: 10 }),
      quillMat
    );
    rachis.castShadow = true;
    g.add(rachis);

    if (flightMode) {
      // Aerodynamic ASYMMETRIC interlocking flight vane (narrow leading edge, wide trailing edge!)
      const vShape = new THREE.Shape();
      vShape.moveTo(-0.85, 0);
      vShape.bezierCurveTo(-0.2, 0.24, 0.9, 0.22, 1.68, 0.02); // Narrow leading vane
      vShape.bezierCurveTo(1.25, -0.45, 0.15, -0.62, -0.85, 0); // Wide trailing vane!
      const vGeo = new THREE.ExtrudeGeometry(vShape, { depth: 0.014, bevelEnabled: false });
      vGeo.rotateX(-Math.PI / 2);
      const vane = new THREE.Mesh(vGeo, vaneMat);
      vane.position.set(0, 0.56, 0);
      vane.castShadow = true;
      g.add(vane);
    } else {
      // Fluffy symmetrical downy dinosaur proto-feather tuft (insulation & display BEFORE flight!)
      for (let i = 0; i < 18; i++) {
        const f = 0.22 + (i / 18) * 0.72;
        const pt = rachisCurve.getPointAt(f);
        for (const s of [-1, 1]) {
          const barbCurve = new THREE.CatmullRomCurve3([
            pt.clone(),
            pt.clone().add(new THREE.Vector3(0.18, 0.18, s * 0.34)),
            pt.clone().add(new THREE.Vector3(0.32, 0.08, s * 0.62)),
          ]);
          const barb = new THREE.Mesh(
            createOrganicLoftGeometry(barbCurve, (t) => 0.026 * (1 - t * 0.6), { tubularSegs: 10, radialSegs: 6 }),
            vaneMat
          );
          barb.castShadow = true;
          g.add(barb);
        }
      }
    }
  }

  // ===========================================================================
  // PAGE 5: WADDINGTON'S 3D EPIGENETIC LANDSCAPE (Canalization Valleys!)
  // ===========================================================================

  public updateCanalization(res: CanalizationResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    const depth = Math.max(0.12, 1 - res.phenotypicSpread * 0.85);
    const surfGeo = new THREE.PlaneGeometry(3.8, 3.2, 36, 28);
    surfGeo.rotateX(-Math.PI / 2);
    const pos = surfGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      // Downhill slope from back (-z) to front (+z) branching into canalized developmental valleys!
      const downhill = (1.6 - z) * 0.28;
      const fork = Math.max(0, (z + 1.2) / 2.8);
      const valley = Math.cos(x * (1.8 + fork * 1.4)) * 0.42 * depth * (0.35 + fork * 0.65);
      pos.setY(i, Math.max(0.05, 0.25 + downhill + valley));
    }
    surfGeo.computeVertexNormals();

    const landMat = createNaturalistMaterial(
      { base: '#c4b89b', wash: '#9e9072', deep: '#61563f', highlight: '#ede6d3', ink: '#423929' },
      'strata',
      { roughness: 0.88, side: THREE.DoubleSide, inkStrength: 0.52, seed: 2050 }
    );
    const mesh = new THREE.Mesh(surfGeo, landMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);

    // Rolling developmental-fate marble cells scattering wider when Hsp90 buffering drops!
    const ballMat = createNaturalistMaterial(
      res.crypticRevealed
        ? { base: '#c95244', wash: '#9e3024', deep: '#5e160e', highlight: '#f5a59c' }
        : { base: '#4d8a6a', wash: '#2f664a', deep: '#163d29', highlight: '#99cfb1' },
      'fruit',
      { roughness: 0.55, inkStrength: 0.45, seed: 2051 }
    );
    for (let b = -2; b <= 2; b++) {
      const bx = b * (0.12 + res.phenotypicSpread * 0.52);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 12), ballMat);
      ball.position.set(bx, 0.52 + Math.abs(b) * 0.08 * depth, 0.95);
      ball.castShadow = true;
      g.add(ball);
    }
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const em = this.createEmbryo3D(
      {
        id: 'human',
        name: 'Human',
        latin: 'Homo sapiens',
        earlyNote: '',
        phylotypicNote: '',
        lateNote: '',
        limbBud: true,
        tailRatioLate: 0.12,
        yolkSacSize: 0.12,
      },
      'phylotypic',
      1.15
    );
    em.position.set(-1.1, 0.05, 0.1);
    em.rotation.y = 0.72;
    g.add(em);

    // Real Smithsonian Archaeopteryx siemensii fossil slab (PAL509743) — feather exaptation!
    const archSlab = createSmithsonianSpecimen(archaeopteryxGlbUrl, {
      size: 2.25,
      palette: {
        base: '#d4c39d',
        wash: '#efe6cf',
        deep: '#857350',
        ink: '#453822',
      },
      rotation: [-0.32, -0.22, 0],
      position: [1.05, 1.05, 0.05],
      grainScale: 1.6,
      inkStrength: 0.92,
    });
    g.add(archSlab);
  }

  public setPage(page: EmbryoPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as EmbryoPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'embryos' ? 9.8 : page === 'canalization' ? 9.6 : 8.6;
    this.targetAzimuth = page === 'heterochrony' ? 0.85 : 0.22;
    this.targetPolar = page === 'canalization' ? 0.58 : 0.36;
    this.zoomFactor = 1.0;
  }

  public resetView(): void {
    this.setPage(this.activePage);
  }

  public zoom(delta: number): void {
    this.zoomFactor = Math.max(0.62, Math.min(1.55, this.zoomFactor + delta));
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
      this.targetPolar = Math.max(0.14, Math.min(1.25, this.targetPolar - (e.clientY - this.lastY) * 0.006));
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

    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.1;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.1;

    const r = this.fitDist * this.zoomFactor;
    this.camera.position.set(
      r * Math.sin(this.curAzimuth) * Math.cos(this.curPolar),
      r * Math.sin(this.curPolar) + 0.55,
      r * Math.cos(this.curAzimuth) * Math.cos(this.curPolar)
    );
    this.camera.lookAt(0, 0.65, 0);
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
