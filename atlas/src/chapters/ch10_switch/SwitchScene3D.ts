// =============================================================================
// Chapter 10: Switches & Deep Homology — Zero-Box Real-Organism 3D Scenes
// 1. Threespine Stickleback Pitx1 Cis-Regulatory Enhancer vs Coding Knockout
// 2. Drosophila Hox Colinearity & Homeotic Transformations (Antp / Ubx)
// 3. Deep Homology (Mouse Camera Eye & Fly Compound Eye bridged by Pax6)
// 4. Daphnia Inducible Helmet G×E Reaction Norms
// 5. Major Transition to Multicellularity (Volvox Spheroids & Bottleneck)
// =============================================================================

import * as THREE from 'three';
import {
  createArchivalLabel,
  createDaphnia3D,
  createDrosophila3D,
  createStickleback3D,
} from '../../3d/organisms';
import type { Pitx1Result, PlasticityResult, TransitionResult } from './switchMath';

export type SwitchPageId = 'pitx1' | 'hox' | 'deephom' | 'plasticity' | 'transitions' | 'check';

const COL_GOLD = 0xd69a2d;
const COL_CORAL = 0xc4483a;
const COL_TEAL = 0x2f7d6e;
const COL_PURPLE = 0x6c4982;

export class SwitchScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<SwitchPageId, THREE.Group>;
  private activePage: SwitchPageId = 'pitx1';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 10.4;
  private targetAzimuth = 0.04;
  private targetPolar = 0.58;
  private curAzimuth = 0.04;
  private curPolar = 0.58;
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
      pitx1: new THREE.Group(),
      hox: new THREE.Group(),
      deephom: new THREE.Group(),
      plasticity: new THREE.Group(),
      transitions: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.pitx1.add(this.p1Group);
    this.pageGroups.hox.add(this.p2Group);
    this.pageGroups.deephom.add(this.p3Group);
    this.pageGroups.plasticity.add(this.p4Group);
    this.pageGroups.transitions.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('pitx1');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // ===========================================================================
  // PAGE 1: THREESPINE STICKLEBACK PITX1 CIS-REGULATORY ENHANCER
  // ===========================================================================

  public updatePitx1(res: Pitx1Result): void {
    this.p1Group.clear();
    const g = this.p1Group;

    // Large hero sculpted 3D Stickleback in profile showing dorsal spines + ventral pelvic spines
    const fish = createStickleback3D({
      hasPelvicSpines: res.pelvicSpines,
      jawIntact: res.jawIntact,
      scale: 3.1,
    });
    fish.position.set(0, 0.25, -0.35);
    fish.rotation.y = Math.PI / 2;
    g.add(fish);

    // 3D DNA Regulatory Strand in front of the fish: [Jaw Enhancer] [Pituitary Enhancer] [Pelvic Enhancer] -> [Pitx1 Coding Exon]
    const strand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 4.4, 10),
      new THREE.MeshStandardMaterial({ color: 0x8b7e6b, roughness: 0.5 })
    );
    strand.rotation.z = Math.PI / 2;
    strand.position.set(0, 0.22, 0.95);
    g.add(strand);

    const blocks: { x: number; on: boolean; col: number }[] = [
      { x: -1.65, on: res.jawIntact, col: COL_TEAL }, // Jaw enhancer
      { x: -0.65, on: res.pituitaryIntact, col: 0x3b729c }, // Pituitary enhancer
      { x: 0.35, on: res.pelvicSpines, col: 0xd96b2b }, // Pelvic enhancer (deleted in freshwater!)
      { x: 1.55, on: res.mode !== 'coding_ko', col: COL_PURPLE }, // Pitx1 Coding Region
    ];
    blocks.forEach((b) => {
      const mesh = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.11, 0.42, 8, 12),
        new THREE.MeshStandardMaterial({
          color: b.on ? b.col : 0xc4bcae,
          roughness: 0.35,
          transparent: !b.on,
          opacity: b.on ? 1 : 0.45,
        })
      );
      mesh.rotation.z = Math.PI / 2;
      mesh.position.set(b.x, 0.22, 0.95);
      mesh.castShadow = true;
      g.add(mesh);
    });

    const slip = createArchivalLabel(
      res.mode === 'enhancer_del'
        ? 'Pelvic Enhancer Deleted · Jaw & Pituitary Intact!'
        : res.mode === 'coding_ko'
          ? 'Pitx1 Coding Knockout · Pleiotropic Lethal!'
          : 'Marine Ancestor · All 3 Enhancers Active',
      'Jaw [Teal] · Pituitary [Blue] · Pelvic [Orange] → Pitx1 Protein [Purple]',
      3.85,
      res.mode === 'coding_ko' ? '#a83424' : res.mode === 'enhancer_del' ? '#2f7d6e' : '#24587c'
    );
    slip.position.set(0, 0.015, 1.75);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 2: DROSOPHILA HOX COLINEARITY & HOMEOTIC MUTANTS
  // ===========================================================================

  public updateHox(mutant: 'wildtype' | 'antp' | 'ubx'): void {
    this.p2Group.clear();
    const g = this.p2Group;

    // 7 Colour-coded Hox chromosome modules aligned 3' -> 5' directly behind the 7 body segments!
    const hoxColors = [0x36689e, 0x3f888f, 0x4b9968, 0xc9a336, 0xd9762b, 0xc4483a, 0x7b438c];
    hoxColors.forEach((col, i) => {
      const bx = -2.1 + i * 0.7;
      // Chromosome Hox gene block (back row)
      const gene = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.13, 0.36, 8, 12),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
      );
      gene.rotation.z = Math.PI / 2;
      gene.position.set(bx, 0.25, -1.05);
      gene.castShadow = true;
      g.add(gene);

      // Matching embryonic body segment (front row) showing 1-to-1 spatial colinearity!
      const segColor =
        mutant === 'antp' && i === 0
          ? hoxColors[3]
          : mutant === 'ubx' && i === 4
            ? hoxColors[3]
            : col;
      const seg = new THREE.Mesh(
        new THREE.SphereGeometry(0.28 + (i === 3 ? 0.05 : 0), 14, 12),
        new THREE.MeshStandardMaterial({ color: segColor, roughness: 0.45 })
      );
      seg.scale.set(0.92, 0.85, 1.05);
      seg.position.set(bx, 0.32, 0.35);
      seg.castShadow = true;
      g.add(seg);

      // Wing or ectopic leg indicator!
      if (i === 3 || (mutant === 'ubx' && i === 4)) {
        const wing = new THREE.Mesh(
          new THREE.BoxGeometry(0.32, 0.02, 0.72),
          new THREE.MeshPhysicalMaterial({ color: 0xf4f8fc, transparent: true, opacity: 0.65 })
        );
        wing.position.set(bx, 0.58, 0.35);
        g.add(wing);
      }
      if (mutant === 'antp' && i === 0) {
        const leg = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.02, 0.65, 8),
          new THREE.MeshStandardMaterial({ color: hoxColors[3], roughness: 0.4 })
        );
        leg.position.set(bx - 0.18, 0.52, 0.68);
        leg.rotation.x = 0.75;
        g.add(leg);
      }
    });

    const slip = createArchivalLabel(
      mutant === 'wildtype'
        ? 'Wild-Type 3′ → 5′ Hox Colinearity (Head to Tail)'
        : mutant === 'antp'
          ? 'Antennapedia Misexpression: Thoracic Leg Grows on Head!'
          : 'Ultrabithorax (Ubx) Loss: Four-Winged Drosophila!',
      'Chromosome gene order mirrors anterior-to-posterior body plan across bilaterians',
      3.85,
      '#6c4982'
    );
    slip.position.set(0, 0.015, 1.65);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 3: DEEP HOMOLOGY (Mouse Camera Eye & Fly Compound Eye + Pax6)
  // ===========================================================================

  public updateDeepHomology(ectopic: boolean): void {
    this.p3Group.clear();
    const g = this.p3Group;

    // Left: Sculpted Vertebrate Camera Eye (sclera, iris, crystal lens)
    const camGroup = new THREE.Group();
    camGroup.position.set(-1.65, 0.58, -0.1);
    const sclera = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 22, 18),
      new THREE.MeshStandardMaterial({ color: 0xf6f2e8, roughness: 0.32 })
    );
    sclera.castShadow = true;
    camGroup.add(sclera);
    const iris = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.08, 22),
      new THREE.MeshStandardMaterial({ color: 0x3b729c, roughness: 0.25 })
    );
    iris.rotation.x = Math.PI / 2;
    iris.position.z = 0.52;
    camGroup.add(iris);
    const pupil = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.14, 0.1, 18),
      new THREE.MeshStandardMaterial({ color: 0x0f1216, roughness: 0.1 })
    );
    pupil.rotation.x = Math.PI / 2;
    pupil.position.z = 0.53;
    camGroup.add(pupil);
    g.add(camGroup);

    // Right: Sculpted Insect Compound Eye (faceted ruby ommatidia cluster!)
    const flyEyeGroup = new THREE.Group();
    flyEyeGroup.position.set(1.65, 0.58, -0.1);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.52, 18, 16),
      new THREE.MeshStandardMaterial({ color: 0x8f1e18, roughness: 0.35 })
    );
    dome.castShadow = true;
    flyEyeGroup.add(dome);
    const facetMat = new THREE.MeshPhysicalMaterial({ color: 0xd93228, roughness: 0.18, clearcoat: 0.85 });
    for (let i = 0; i < 28; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 28);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const f = new THREE.Mesh(new THREE.SphereGeometry(0.082, 6, 6), facetMat);
      f.position.set(
        0.48 * Math.sin(phi) * Math.cos(theta),
        0.48 * Math.cos(phi),
        0.48 * Math.sin(phi) * Math.sin(theta)
      );
      flyEyeGroup.add(f);
    }
    g.add(flyEyeGroup);

    // Glowing golden Pax6 / eyeless regulatory bridge connecting the two!
    const bridgeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.0, 0.58, -0.1),
      new THREE.Vector3(0, 1.15, -0.1),
      new THREE.Vector3(1.0, 0.58, -0.1),
    ]);
    const bridge = new THREE.Mesh(
      new THREE.TubeGeometry(bridgeCurve, 24, ectopic ? 0.075 : 0.048, 10, false),
      new THREE.MeshStandardMaterial({
        color: COL_GOLD,
        emissive: 0x8a5e08,
        emissiveIntensity: ectopic ? 0.55 : 0.25,
        roughness: 0.25,
      })
    );
    bridge.castShadow = true;
    g.add(bridge);

    // If ectopic Mouse Pax6 expressed in Drosophila, show sculpted fly with glowing red ectopic eye!
    if (ectopic) {
      const fly = createDrosophila3D({ eyeHex: '#d93228', isMale: true, scale: 1.35 });
      fly.position.set(0, 0.12, 0.65);
      g.add(fly);
    }

    const slip = createArchivalLabel(
      ectopic
        ? 'Mouse Pax6 in Fly → Builds a FLY Compound Eye!'
        : 'Deep Homology: Ancient Shared Pax6 Master Switch',
      ectopic
        ? 'The switch is homologous (Halder 1995), while downstream eye-building genes diverged!'
        : 'Camera eye & compound eye evolved separately using the SAME ancestral Pax6 circuit!',
      3.85,
      '#8a5e08'
    );
    slip.position.set(0, 0.015, 1.65);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 4: DAPHNIA INDUCIBLE HELMET G×E REACTION NORMS
  // ===========================================================================

  public updatePlasticity(res: PlasticityResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    // 4 Sculpted Translucent Daphnia: Left 2 = Plastic Genotype (grows helmet with kairomones!), Right 2 = Unarmoured Genotype
    for (let i = 0; i < 2; i++) {
      const dPlastic = createDaphnia3D({ helmetSize: res.plasticHelmet, scale: 1.75 });
      dPlastic.position.set(-1.95 + i * 1.1, 0.12, -0.15 + i * 0.45);
      dPlastic.rotation.y = 0.45;
      g.add(dPlastic);

      const dFixed = createDaphnia3D({ helmetSize: 0.04, scale: 1.75 });
      dFixed.position.set(0.85 + i * 1.1, 0.12, -0.15 + i * 0.45);
      dFixed.rotation.y = -0.45;
      g.add(dFixed);
    }

    const slip = createArchivalLabel(
      `Predator Cue = ${(res.kairomone * 100).toFixed(0)}% · Plastic Helmet = ${(res.plasticHelmet * 100).toFixed(0)}%`,
      `Plastic Fitness: ${res.plasticFit.toFixed(2)} vs Unarmoured: ${res.unarmoredFit.toFixed(2)} (Crossing G×E Reaction Norm!)`,
      3.85,
      '#2f7d6e'
    );
    slip.position.set(0, 0.015, 1.65);
    g.add(slip);
  }

  // ===========================================================================
  // PAGE 5: MAJOR TRANSITION TO MULTICELLULARITY (Volvox & Bottleneck)
  // ===========================================================================

  public updateTransition(res: TransitionResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    // Sculpted 3D Volvox multicellular spheroid with outer flagellated soma & inner germline gonidia!
    const matrix = new THREE.Mesh(
      new THREE.SphereGeometry(1.18, 24, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0xdff2e4,
        roughness: 0.15,
        transparent: true,
        opacity: 0.38,
      })
    );
    matrix.position.set(0, 1.25, -0.1);
    matrix.castShadow = true;
    g.add(matrix);

    const somaMat = new THREE.MeshStandardMaterial({ color: 0x3b8c58, roughness: 0.35 });
    const cheatMat = new THREE.MeshStandardMaterial({ color: COL_CORAL, roughness: 0.3 });
    const germMat = new THREE.MeshStandardMaterial({ color: COL_GOLD, roughness: 0.25 });

    const totalSoma = 42;
    const nCheaters = Math.round(res.cheaterFreq * totalSoma);
    for (let i = 0; i < totalSoma; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalSoma);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const cell = new THREE.Mesh(
        new THREE.SphereGeometry(0.09, 10, 8),
        i < nCheaters ? cheatMat : somaMat
      );
      cell.position.set(
        1.15 * Math.sin(phi) * Math.cos(theta),
        1.25 + 1.15 * Math.cos(phi),
        -0.1 + 1.15 * Math.sin(phi) * Math.sin(theta)
      );
      g.add(cell);
    }

    // Protected internal golden germline gonidia!
    if (res.somaDivisionStable) {
      for (let k = 0; k < 5; k++) {
        const ang = (k / 5) * Math.PI * 2;
        const germ = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), germMat);
        germ.position.set(Math.cos(ang) * 0.48, 1.25 + (k % 2 === 0 ? 0.12 : -0.12), -0.1 + Math.sin(ang) * 0.48);
        g.add(germ);
      }
    }

    const slip = createArchivalLabel(
      res.bottleneck
        ? 'Single-Cell Bottleneck (r = 1.0): Stable Volvox Soma & Germline!'
        : 'Chimeric Aggregation (r = 0.22): Somatic Cheaters Overrun Colony!',
      res.bottleneck
        ? 'Clonal relatedness aligns cell fitness — enabling sterile somatic altruism!'
        : 'Low relatedness lets non-swimming cheaters divide faster & collapse cooperation!',
      3.85,
      res.bottleneck ? '#2f7d6e' : '#a83424'
    );
    slip.position.set(0, 0.015, 1.72);
    g.add(slip);
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const fish = createStickleback3D({ hasPelvicSpines: false, jawIntact: true, scale: 1.9 });
    fish.position.set(-1.55, 0.15, 0);
    fish.rotation.y = Math.PI / 2 - 0.25;
    g.add(fish);

    const daph = createDaphnia3D({ helmetSize: 0.9, scale: 1.65 });
    daph.position.set(0.15, 0.12, 0.1);
    daph.rotation.y = 0.25;
    g.add(daph);

    const fly = createDrosophila3D({ eyeHex: '#c82420', isMale: false, scale: 1.55 });
    fly.position.set(1.65, 0.12, 0.05);
    fly.rotation.y = -0.35;
    g.add(fly);

    const slip = createArchivalLabel(
      'Evo-Devo, Plasticity & Transitions',
      'Pitx1 Enhancers · Hox & Pax6 · G×E Reaction Norms',
      3.55,
      '#6c4982'
    );
    slip.position.set(0, 0.015, 1.48);
    g.add(slip);
  }

  public setPage(page: SwitchPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as SwitchPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'check' ? 9.5 : 10.6;
    this.targetAzimuth = 0.04;
    this.targetPolar = 0.58;
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
      this.targetPolar = Math.max(0.25, Math.min(1.25, this.targetPolar - (e.clientY - this.lastY) * 0.006));
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
      r * Math.sin(this.curPolar) + 0.55,
      r * Math.cos(this.curAzimuth) * Math.cos(this.curPolar)
    );
    this.camera.lookAt(0, 0.35, 0);

    if (this.activePage === 'transitions') {
      this.p5Group.rotation.y = Math.sin(t * 0.45) * 0.2;
    } else if (this.activePage === 'check') {
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
