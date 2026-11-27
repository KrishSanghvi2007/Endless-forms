// =============================================================================
// Chapter 25: Origin of Life, Endosymbiosis & Coevolution — Naturalist 3D
// 1. RNA World Ribozyme Hairpin inside Translucent Lipid Protocell Vesicle
// 2. Serial Endosymbiosis (Margulis): Engulfed Mitochondrion & Chloroplast
// 3. Major Evolutionary Transitions (Nested Individuality Rings)
// 4. Sculpted Taricha Rough-Skinned Newt vs Thamnophis Garter Snake Mosaic
// 5. Sculpted Madagascar Star Orchid (Angraecum) & Hawk Moth (Xanthopan)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
  type NaturalistPattern,
} from '../../3d/naturalistCraft';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import orchidGlbUrl from '../../assets/smithsonian_orchid.glb?url';
import type {
  EndoStageId,
  MosaicResult,
  OrchidMothResult,
  RnaStageId,
} from './originsMath';

export type OriginsPageId = 'rna' | 'endosymbiosis' | 'transitions' | 'mosaic' | 'orchid' | 'check';

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
  const mat = createNaturalistMaterial({ base, wash, deep, highlight }, pattern, {
    roughness,
    transparent,
    opacity,
  });
  if (transparent) {
    mat.depthWrite = false;
  }
  return mat;
}

export class OriginsScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<OriginsPageId, THREE.Group>;
  private activePage: OriginsPageId = 'rna';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 9.4;
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
      rna: new THREE.Group(),
      endosymbiosis: new THREE.Group(),
      transitions: new THREE.Group(),
      mosaic: new THREE.Group(),
      orchid: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.rna.add(this.p1Group);
    this.pageGroups.endosymbiosis.add(this.p2Group);
    this.pageGroups.transitions.add(this.p3Group);
    this.pageGroups.mosaic.add(this.p4Group);
    this.pageGroups.orchid.add(this.p5Group);

    this.buildCapstoneSpecimen();

    this.attachPointerControls();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
    this.setPage('rna');
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

  // ---------------------------------------------------------------------------
  // PAGE 1: RNA World Ribozymes & Lipid Protocell Vesicle
  // ---------------------------------------------------------------------------
  public updateRnaScene(stage: RnaStageId): void {
    this.clearGroup(this.p1Group);
    this.addShadowFloor(this.p1Group, -1.9);

    const rnaMat = wcMat('#c84d3a', '#a63826', '#721e11', '#ea9082', 'fruit', 0.52);
    const baseMat = wcMat('#dda23e', '#be8422', '#82540d', '#f4ce86', 'keratin', 0.5);
    const lipidMat = wcMat('#4f8699', '#396b7d', '#224957', '#94c4d4', 'tissue', 0.48, true, 0.28);

    if (stage === 'monomers') {
      // Scattered floating nucleotides & forming amphiphilic micelle arc
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const r = 0.65 + (i % 3) * 0.48;
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 10), i % 2 === 0 ? rnaMat : baseMat);
        m.position.set(Math.cos(a) * r, ((i % 5) - 2) * 0.36, Math.sin(a) * r);
        m.castShadow = true;
        this.p1Group.add(m);
      }
      const arc = new THREE.Mesh(new THREE.TorusGeometry(1.75, 0.12, 14, 32, Math.PI * 1.15), lipidMat);
      arc.rotation.z = -0.35;
      this.p1Group.add(arc);
      return;
    }

    // Folded catalytic hammerhead ribozyme hairpin ribbon
    const riboCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.45, -1.15, 0),
      new THREE.Vector3(-0.38, -0.35, 0.15),
      new THREE.Vector3(-0.78, 0.25, 0.25),
      new THREE.Vector3(-0.25, 0.98, 0.08),
      new THREE.Vector3(0.32, 0.92, -0.08),
      new THREE.Vector3(0.75, 0.22, -0.22),
      new THREE.Vector3(0.38, -0.38, -0.12),
      new THREE.Vector3(0.45, -1.15, 0),
    ]);
    const ribo = new THREE.Mesh(new THREE.TubeGeometry(riboCurve, 72, 0.11, 14, false), rnaMat);
    ribo.castShadow = true;
    this.p1Group.add(ribo);

    // Hydrogen-bonded base-pair rungs stabilizing the catalytic stem
    for (let i = 0; i < 6; i++) {
      const y = -0.95 + i * 0.28;
      const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.72, 10), baseMat);
      rung.rotation.z = Math.PI / 2;
      rung.position.set(0, y, 0);
      this.p1Group.add(rung);
    }

    if (stage === 'protocell') {
      // Translucent double-ring lipid bilayer vesicle encapsulating the replicating ribozyme!
      const outer = new THREE.Mesh(new THREE.SphereGeometry(1.72, 30, 22), lipidMat);
      const inner = new THREE.Mesh(
        new THREE.SphereGeometry(1.52, 26, 20),
        wcMat('#70a8b8', '#548b9c', '#366575', '#b4dde8', 'tissue', 0.5, true, 0.16),
      );
      this.p1Group.add(outer, inner);
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 2: Serial Endosymbiosis (Margulis 1967)
  // ---------------------------------------------------------------------------
  public updateEndosymbiosisScene(stage: EndoStageId): void {
    this.clearGroup(this.p2Group);
    this.addShadowFloor(this.p2Group, -1.85);

    const hostMat = wcMat('#e8dcc6', '#d6c6aa', '#ad9978', '#f8f2e6', 'tissue', 0.52, true, 0.34);
    const nucMat = wcMat('#6a557c', '#534063', '#362742', '#9f8cb0', 'tissue', 0.62);
    const mitoOuterMat = wcMat('#c44e3a', '#a33927', '#6e1f12', '#e89082', 'fruit', 0.52, true, 0.55);
    const mitoInnerMat = wcMat('#d8883c', '#b86d22', '#7e440d', '#f3be82', 'keratin', 0.5);
    const chloroMat = wcMat('#3e7d54', '#2c623f', '#1a4228', '#80be96', 'botanical', 0.54, true, 0.58);
    const dnaRingMat = wcMat('#e4b242', '#c69324', '#865e0d', '#f8da8c', 'keratin', 0.42);

    // Asgard archaeon / Eukaryotic host cytoplasm
    const host = new THREE.Mesh(new THREE.SphereGeometry(1.65, 28, 22), hostMat);
    host.position.set(stage === 'archaeon' ? -0.55 : 0, 0, 0);
    this.p2Group.add(host);

    // Host nucleus
    const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.54, 20, 16), nucMat);
    nuc.position.set(stage === 'archaeon' ? -0.75 : -0.45, 0.32, 0);
    nuc.castShadow = true;
    this.p2Group.add(nuc);

    // Alpha-proteobacterium / Double-membraned Mitochondrion + circular bacterial DNA ring!
    const mito = new THREE.Group();
    const mOut = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.65, 10, 16), mitoOuterMat);
    mOut.rotation.z = Math.PI / 2;
    mOut.castShadow = true;
    const mIn = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.5, 8, 14), mitoInnerMat);
    mIn.rotation.z = Math.PI / 2;
    const mtDna = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.028, 8, 20), dnaRingMat);
    mtDna.position.set(0.12, 0, 0.22);
    mito.add(mOut, mIn, mtDna);

    if (stage === 'archaeon') {
      mito.position.set(2.05, -0.25, 0.25); // Free-living outside host!
    } else {
      mito.position.set(0.62, -0.45, 0.35); // Engulfed inside cytoplasm!
    }
    this.p2Group.add(mito);

    if (stage === 'plastid') {
      // Engulfed photosynthetic cyanobacterium -> Chloroplast with stacked green thylakoids!
      const chloro = new THREE.Group();
      const cShell = new THREE.Mesh(new THREE.SphereGeometry(0.52, 20, 16), chloroMat);
      cShell.scale.set(1.35, 0.72, 0.85);
      cShell.castShadow = true;
      chloro.add(cShell);
      const thylMat = wcMat('#2a5c3b', '#1e462b', '#112c1a', '#5f9972', 'botanical', 0.55);
      for (let i = -1; i <= 1; i++) {
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 12), thylMat);
        stack.position.set(i * 0.26, 0, 0.14);
        chloro.add(stack);
      }
      const cpDna = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.025, 8, 18), dnaRingMat);
      cpDna.position.set(0, 0.14, 0.28);
      chloro.add(cpDna);
      chloro.position.set(0.45, 0.65, -0.25);
      this.p2Group.add(chloro);
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 3: Major Evolutionary Transitions (Nested Individuality Rings)
  // ---------------------------------------------------------------------------
  public updateTransitionsScene(activeStep: number): void {
    this.clearGroup(this.p3Group);
    this.addShadowFloor(this.p3Group, -1.75);

    const activeMat = wcMat('#dda23e', '#be8422', '#82540d', '#f4ce86', 'keratin', 0.46);
    const passiveMats = [
      wcMat('#c44e3a', '#a33927', '#6e1f12', '#e89082', 'fruit', 0.62),
      wcMat('#49798e', '#355f73', '#204050', '#8bb4c7', 'scale', 0.62),
      wcMat('#3e7858', '#2d5f43', '#1c422c', '#7eb896', 'botanical', 0.62),
      wcMat('#7a5b82', '#604568', '#3f2a45', '#b093b8', 'tissue', 0.62),
    ];

    for (let i = 0; i < 4; i++) {
      const r = 0.52 + i * 0.54;
      const isSel = i + 1 === activeStep;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, isSel ? 0.14 : 0.085, 16, 40),
        isSel ? activeMat : passiveMats[i]!,
      );
      ring.rotation.x = Math.PI * 0.36;
      ring.position.y = (i - 1.5) * 0.26;
      ring.castShadow = true;
      this.p3Group.add(ring);

      // Orbiting lower-level units united inside each higher-level ring
      const dots = 4 + i * 2;
      for (let k = 0; k < dots; k++) {
        const a = (k / dots) * Math.PI * 2;
        const unit = new THREE.Mesh(
          new THREE.SphereGeometry(isSel ? 0.12 : 0.08, 12, 10),
          isSel ? activeMat : passiveMats[i]!,
        );
        unit.position.set(
          Math.cos(a) * r,
          ring.position.y + Math.sin(a) * r * Math.sin(Math.PI * 0.36) * 0.1,
          Math.sin(a) * r * Math.cos(Math.PI * 0.36),
        );
        this.p3Group.add(unit);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // PAGE 4: Geographic Mosaic — Taricha Newt vs Thamnophis Garter Snake
  // ---------------------------------------------------------------------------
  public updateMosaicScene(res: MosaicResult): void {
    this.clearGroup(this.p4Group);
    this.addShadowFloor(this.p4Group, -1.65);

    // Mossy Pacific Northwest stone slab
    const rock = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 2.75, 0.34, 24),
      wcMat('#847b6c', '#6b6355', '#494238', '#b5ada0', 'strata', 0.88),
    );
    rock.position.set(0, -1.45, 0);
    rock.receiveShadow = true;
    this.p4Group.add(rock);

    // 1. Sculpted Rough-Skinned Newt (Taricha granulosa) on the left — vivid orange TTX warning belly in Hotspot!
    const newtBack = wcMat('#5c402c', '#473020', '#2e1d12', '#8c6e58', 'scale', 0.72);
    const newtBelly = res.isHotspot
      ? wcMat('#e86a24', '#cc5212', '#8f3204', '#ffb07a', 'fruit', 0.46)
      : wcMat('#b89b6e', '#9c8056', '#6d5737', '#dec8a2', 'bone', 0.72);

    const newtCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.75, -0.95, 0.45), // head lifted in unken reflex!
      new THREE.Vector3(-1.25, -1.12, 0.25),
      new THREE.Vector3(-0.65, -1.16, 0.1),
      new THREE.Vector3(-0.15, -1.08, 0.35), // curved tail
      new THREE.Vector3(0.22, -0.92, 0.62),
    ]);
    const newtBody = new THREE.Mesh(
      createOrganicLoftGeometry(
        newtCurve,
        (t) => (t < 0.18 ? 0.2 : t < 0.55 ? 0.23 : 0.2 * (1 - (t - 0.55) * 1.9)),
        { tubularSegs: 28, radialSegs: 16, closedCaps: true },
      ),
      newtBack,
    );
    newtBody.castShadow = true;
    this.p4Group.add(newtBody);

    // Warning orange throat/belly flash (Unken posture)
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), newtBelly);
    belly.scale.set(1.65, 0.72, 0.95);
    belly.position.set(-1.32, -1.18, 0.32);
    this.p4Group.add(belly);

    // 4 splayed amphibian legs
    [
      [-1.4, -1.24, 0.55],
      [-1.4, -1.24, 0.05],
      [-0.78, -1.24, 0.38],
      [-0.78, -1.24, -0.12],
    ].forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.24, 6, 8), newtBack);
      leg.position.set(lx!, ly!, lz!);
      leg.rotation.z = 0.65;
      this.p4Group.add(leg);
    });

    // 2. Sculpted Common Garter Snake (Thamnophis sirtalis) coiled on the right!
    const snakeMat = res.isHotspot
      ? wcMat('#3e6b4c', '#2c5238', '#193622', '#7cb08b', 'scale', 0.58)
      : wcMat('#6a7b58', '#526242', '#344028', '#9eb08c', 'scale', 0.64);
    const stripeMat = wcMat('#dfae42', '#c29024', '#855d0d', '#f7d88a', 'keratin', 0.52);

    const snakeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.42, -0.82, -0.15), // head facing newt!
      new THREE.Vector3(0.88, -1.08, -0.45),
      new THREE.Vector3(1.55, -1.12, -0.12),
      new THREE.Vector3(1.42, -1.14, 0.65),
      new THREE.Vector3(0.68, -1.16, 0.88),
      new THREE.Vector3(1.12, -1.18, 1.22),
      new THREE.Vector3(1.88, -1.2, 0.95),
    ]);
    const snakeBody = new THREE.Mesh(
      createOrganicLoftGeometry(
        snakeCurve,
        (t) => (t < 0.08 ? 0.16 : 0.17 * (1 - t * 0.65)),
        { tubularSegs: 42, radialSegs: 14, closedCaps: true },
      ),
      snakeMat,
    );
    snakeBody.castShadow = true;
    this.p4Group.add(snakeBody);

    // Signature golden dorsal stripe along the garter snake's spine
    const stripe = new THREE.Mesh(new THREE.TubeGeometry(snakeCurve, 40, 0.045, 8, false), stripeMat);
    stripe.position.y = 0.1;
    this.p4Group.add(stripe);
  }

  // ---------------------------------------------------------------------------
  // PAGE 5: Darwin's Madagascar Star Orchid & Giant Hawk Moth Arms Race
  // ---------------------------------------------------------------------------
  public updateOrchidScene(res: OrchidMothResult): void {
    this.clearGroup(this.p5Group);
    this.addShadowFloor(this.p5Group, -2.05);

    const spurMat = wcMat('#8aa86e', '#6e8c53', '#496333', '#bed9a5', 'botanical', 0.66);
    const nectarMat = wcMat('#e4b03e', '#c69222', '#875d0c', '#f8d88a', 'fruit', 0.42);
    const mothMat = wcMat('#876c52', '#6d543c', '#493522', '#b89d83', 'feather', 0.68);
    const probMat = wcMat('#3b2c20', '#2b1f16', '#19110b', '#695342', 'keratin', 0.56);

    // 1. Real Smithsonian 3D-scanned Orchid Bloom (Lycaste virginalis) paired with Madagascar nectar spur
    const orchidGroup = new THREE.Group();
    orchidGroup.position.set(1.25, 0.55, 0);

    const orchidBloom = createSmithsonianSpecimen(orchidGlbUrl, {
      size: 1.95,
      palette: {
        base: '#efe5ce',
        wash: '#fcf8ee',
        deep: '#a69370',
        ink: '#4d3e28',
      },
      rotation: [0.18, -Math.PI * 0.45, 0.12],
      grainScale: 2.0,
      inkStrength: 0.85,
    });
    orchidGroup.add(orchidBloom);

    // Golden pollen mass (pollinium) at the flower throat
    const pollen = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), nectarMat);
    pollen.position.set(-0.12, 0.02, 0);
    orchidGroup.add(pollen);

    // Pendulous tubular nectar spur scaling directly with spurCm (10..35 cm -> 1.0..2.75 units)!
    const spurLen = 0.75 + (res.spurCm / 35) * 1.95;
    const spurCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.08, -0.05, 0),
      new THREE.Vector3(0.28, -spurLen * 0.48, 0),
      new THREE.Vector3(0.16, -spurLen, 0),
    ]);
    const spur = new THREE.Mesh(
      createOrganicLoftGeometry(spurCurve, (t) => 0.12 * (1 - t * 0.45), { tubularSegs: 20, radialSegs: 12 }),
      spurMat,
    );
    spur.castShadow = true;
    orchidGroup.add(spur);

    // Nectar droplet pool glowing at the very bottom tip of the spur!
    const nectar = new THREE.Mesh(new THREE.SphereGeometry(0.13, 14, 10), nectarMat);
    nectar.position.set(0.16, -spurLen, 0);
    orchidGroup.add(nectar);

    this.p5Group.add(orchidGroup);

    // 2. Giant Madagascar Hawk Moth (Xanthopan morganii praedicta) hovering on the left!
    const mothGroup = new THREE.Group();
    // Moth moves closer when proboscis is matched/shorter, hangs back when proboscis is too long!
    const gap = Math.max(0.28, (res.proboscisCm - res.spurCm) * 0.045 + 0.85);
    mothGroup.position.set(1.25 - gap - 0.95, 0.58, 0);

    const thorax = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.65, 10, 14), mothMat);
    thorax.rotation.z = Math.PI / 2 - 0.22;
    thorax.castShadow = true;
    mothGroup.add(thorax);

    // Swept hawkmoth forewings
    [-1, 1].forEach((side) => {
      const wCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.1, 0.08, side * 0.15),
        new THREE.Vector3(-0.22, 0.42, side * 0.78),
        new THREE.Vector3(-0.68, 0.25, side * 1.22),
      ]);
      const wing = new THREE.Mesh(
        createOrganicLoftGeometry(wCurve, (t) => 0.34 * Math.sin(t * Math.PI) + 0.04, {
          tubularSegs: 16,
          radialSegs: 10,
          aspectAt: () => [0.16, 1.3],
        }),
        mothMat,
      );
      wing.castShadow = true;
      mothGroup.add(wing);
    });

    this.p5Group.add(mothGroup);

    // 3. Long curved proboscis scaling directly with proboscisCm reaching down into the orchid spur!
    const reachFrac = Math.min(1.05, res.proboscisCm / Math.max(10, res.spurCm));
    const headPos = mothGroup.position.clone().add(new THREE.Vector3(0.45, 0.02, 0));
    const throatPos = new THREE.Vector3(1.22, 0.55, 0);
    const tipPos = new THREE.Vector3(
      1.25 + 0.16 * reachFrac,
      0.55 - spurLen * Math.min(1.0, reachFrac),
      0,
    );
    const probCurve = new THREE.CatmullRomCurve3([headPos, throatPos, tipPos]);
    const prob = new THREE.Mesh(new THREE.TubeGeometry(probCurve, 28, 0.032, 8, false), probMat);
    prob.castShadow = true;
    this.p5Group.add(prob);
  }

  private buildCapstoneSpecimen(): void {
    this.addShadowFloor(this.pageGroups.check, -1.75);
    const bloom = createSmithsonianSpecimen(orchidGlbUrl, {
      size: 2.35,
      palette: {
        base: '#d9c8a2',
        wash: '#faf4e6',
        deep: '#8a7248',
        ink: '#45351e',
      },
      rotation: [0.22, -0.35, 0],
      position: [0, -0.1, 0],
      grainScale: 1.8,
      inkStrength: 0.88,
    });
    this.pageGroups.check.add(bloom);
  }

  public setPage(page: OriginsPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as OriginsPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    if (page === 'rna') {
      this.fitDist = 8.8;
      this.targetAzimuth = 0.22;
      this.targetPolar = 0.24;
    } else if (page === 'endosymbiosis') {
      this.fitDist = 9.4;
      this.targetAzimuth = 0.2;
      this.targetPolar = 0.24;
    } else if (page === 'transitions') {
      this.fitDist = 10.6;
      this.targetAzimuth = 0.22;
      this.targetPolar = 0.44;
    } else if (page === 'mosaic') {
      this.fitDist = 10.4;
      this.targetAzimuth = 0.26;
      this.targetPolar = 0.42;
    } else if (page === 'orchid') {
      this.fitDist = 11.4;
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
    if (!this.dragging && (this.activePage === 'rna' || this.activePage === 'check')) {
      this.pageGroups[this.activePage].rotation.y = Math.sin(t * 0.35) * 0.28;
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
