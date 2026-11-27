// =============================================================================
// Chapter 19: Ageing, Senescence & Life Histories — Naturalist Watercolour 3D
// 1. Medawar Mutation Accumulation vs Williams Antagonistic Pleiotropy (Opossums)
// 2. Kirkwood Disposable Soma (Y-Model Metabolic Conduit: Repair vs Offspring)
// 3. Survivorship Curves (Type I Opossum, Type II Songbird, Type III Kelp/Oyster)
// 4. Lack's Clutch Size (Woven Twig Nest + 2-10 Robin's-Egg Blue Eggs)
// 5. Semelparity (Pacific Salmon) vs Iteroparity (Galápagos Tortoise)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import tortoiseGlbUrl from '../../assets/smithsonian_tortoise.glb?url';
import fishGlbUrl from '../../assets/smithsonian_fish.glb?url';
import { createGiantKelpFrond3D, createSculptedSongbird3D } from '../../3d/naturalistSpecimens';
import { createOpossum3D } from '../../3d/organisms';
import type {
  LackClutchResult,
  LifeTableResult,
  ParityResult,
  SenescenceResult,
  SomaResult,
} from './senescenceMath';

export type SenescencePageId = 'ma_ap' | 'disposable' | 'lifetable' | 'lack' | 'continuum' | 'check';

export class SenescenceScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<SenescencePageId, THREE.Group>;
  private activePage: SenescencePageId = 'ma_ap';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 9.4;
  private targetAzimuth = 0.22;
  private targetPolar = 0.44;
  private curAzimuth = 0.22;
  private curPolar = 0.44;
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
      ma_ap: new THREE.Group(),
      disposable: new THREE.Group(),
      lifetable: new THREE.Group(),
      lack: new THREE.Group(),
      continuum: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.ma_ap.add(this.p1Group);
    this.pageGroups.disposable.add(this.p2Group);
    this.pageGroups.lifetable.add(this.p3Group);
    this.pageGroups.lack.add(this.p4Group);
    this.pageGroups.continuum.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('ma_ap');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  private createTortoise3D(scale = 1.0): THREE.Group {
    return createSmithsonianSpecimen(tortoiseGlbUrl, {
      size: 1.55 * scale,
      palette: {
        base: '#8c7e58',
        wash: '#cdc09c',
        deep: '#4e4429',
        ink: '#2b2415',
      },
      rotation: [-Math.PI / 2, 0, Math.PI],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
  }

  // ===========================================================================
  // PAGE 1: MEDAWAR MUTATION ACCUMULATION vs WILLIAMS ANTAGONISTIC PLEIOTROPY
  // ===========================================================================

  public updateMaAp(res: SenescenceResult): void {
    this.p1Group.clear();
    const g = this.p1Group;

    // 5 age-cohorts of sculpted opossums progressing from young russet -> silver-grey elder!
    for (let i = 0; i < 5; i++) {
      const x = -1.8 + i * 0.9;
      const surv = res.cohortSurvival[i]!;
      const op = createOpossum3D({ greyness: i / 4, scale: 0.72 + surv * 0.35 });
      op.position.set(x, 0.02, 0.45);
      op.rotation.y = 0.28;
      g.add(op);

      // Hamilton's declining Force of Selection shadow pillar behind each age cohort!
      const h = Math.max(0.08, res.selectionShadow[i]! * 1.45);
      const pMat = createNaturalistMaterial(
        i < 2
          ? { base: '#4d8a6a', wash: '#2f664a', deep: '#163d29', highlight: '#99cfb1' }
          : { base: '#b84b42', wash: '#8c2d25', deep: '#52130e', highlight: '#eb9d96' },
        'strata',
        { roughness: 0.82, inkStrength: 0.48, seed: 1910 + i }
      );
      const pil = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, h, 16), pMat);
      pil.position.set(x, h / 2, -0.65);
      pil.castShadow = true;
      g.add(pil);
    }
  }

  // ===========================================================================
  // PAGE 2: KIRKWOOD DISPOSABLE SOMA (Y-Model Energy Conduit)
  // ===========================================================================

  public updateDisposableSoma(res: SomaResult): void {
    this.p2Group.clear();
    const g = this.p2Group;

    const goldMat = createNaturalistMaterial(
      { base: '#d9a43b', wash: '#b07b1c', deep: '#6b470a', highlight: '#f7dc8d' },
      'keratin',
      { roughness: 0.68, inkStrength: 0.45, seed: 1920 }
    );
    const shieldMat = createNaturalistMaterial(
      { base: '#57967e', wash: '#36705a', deep: '#1a4233', highlight: '#a3d9c4' },
      'tissue',
      { roughness: 0.65, transparent: true, opacity: 0.38, inkStrength: 0.4, seed: 1921 }
    );

    // Y-Model metabolic conduit splitting into Left (Somatic Repair) & Right (Reproduction)!
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.12, 1.45),
      new THREE.Vector3(0, 0.14, 0.35),
    ]);
    g.add(
      new THREE.Mesh(
        createOrganicLoftGeometry(stemCurve, () => 0.11, { tubularSegs: 12, radialSegs: 10 }),
        goldMat
      )
    );

    const leftCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.14, 0.35),
      new THREE.Vector3(-0.75, 0.16, -0.15),
      new THREE.Vector3(-1.35, 0.16, -0.45),
    ]);
    g.add(
      new THREE.Mesh(
        createOrganicLoftGeometry(leftCurve, () => 0.04 + res.repairShare * 0.12, { tubularSegs: 18, radialSegs: 10 }),
        goldMat
      )
    );

    const rightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.14, 0.35),
      new THREE.Vector3(0.75, 0.16, -0.15),
      new THREE.Vector3(1.35, 0.16, -0.45),
    ]);
    g.add(
      new THREE.Mesh(
        createOrganicLoftGeometry(rightCurve, () => 0.04 + (1 - res.repairShare) * 0.12, { tubularSegs: 18, radialSegs: 10 }),
        goldMat
      )
    );

    // Left: Adult Opossum protected by Somatic Repair bubble scaled by repairShare!
    const adult = createOpossum3D({ greyness: 1 - res.repairShare, scale: 1.25 });
    adult.position.set(-1.35, 0.02, -0.45);
    adult.rotation.y = 0.65;
    g.add(adult);
    const shield = new THREE.Mesh(new THREE.SphereGeometry(0.45 + res.repairShare * 0.42, 20, 16), shieldMat);
    shield.position.set(-1.35, 0.45, -0.45);
    g.add(shield);

    // Right: Offspring litter count scaled by (1 - repairShare)!
    const nPups = Math.max(1, Math.min(7, Math.round((1 - res.repairShare) * 8)));
    for (let i = 0; i < nPups; i++) {
      const ang = (i / nPups) * Math.PI * 2;
      const rad = nPups === 1 ? 0 : 0.48;
      const pup = createOpossum3D({ greyness: 0.05, scale: 0.56 });
      pup.position.set(1.35 + Math.cos(ang) * rad, 0.02, -0.45 + Math.sin(ang) * rad);
      pup.rotation.y = -ang;
      g.add(pup);
    }
  }

  // ===========================================================================
  // PAGE 3: TYPE I / II / III SURVIVORSHIP RIBBON + REPRESENTATIVE ORGANISM
  // ===========================================================================

  public updateLifeTable(res: LifeTableResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    const col =
      res.type === 'type1'
        ? { base: '#4d8a6a', wash: '#2f664a', deep: '#163d29', highlight: '#99cfb1' }
        : res.type === 'type2'
          ? { base: '#5a839e', wash: '#385f7a', deep: '#1e394d', highlight: '#a0c4db' }
          : { base: '#c45b42', wash: '#963923', deep: '#571a0c', highlight: '#f2a896' };
    const ribMat = createNaturalistMaterial(col, 'keratin', { roughness: 0.72, inkStrength: 0.48, seed: 1930 });

    // Log-scale survivorship curve ribbon!
    const pts: THREE.Vector3[] = res.lx.map((l, idx) => {
      const x = -1.9 + (idx / 5) * 3.8;
      const logY = (Math.log10(Math.max(0.015, l)) + 1.85) / 1.85; // 0..1
      return new THREE.Vector3(x, 0.18 + logY * 1.35, -0.35);
    });
    const rib = new THREE.Mesh(
      createOrganicLoftGeometry(new THREE.CatmullRomCurve3(pts), () => 0.085, { tubularSegs: 36, radialSegs: 12 }),
      ribMat
    );
    rib.castShadow = true;
    g.add(rib);

    // Representative focal organism perched in front!
    if (res.type === 'type1') {
      const op = createOpossum3D({ greyness: 0.3, scale: 1.35 });
      op.position.set(0, 0.02, 0.65);
      op.rotation.y = 0.55;
      g.add(op);
    } else if (res.type === 'type2') {
      const bird = createSculptedSongbird3D({
        dorsalPalette: { base: '#5a839e', wash: '#385f7a', deep: '#1e394d', highlight: '#a0c4db' },
        wingBars: 0,
        scale: 1.4,
        seed: 1932,
      });
      bird.position.set(0, 0.02, 0.65);
      bird.rotation.y = 0.75;
      g.add(bird);
    } else {
      const kelp = createGiantKelpFrond3D(0.95, 0.95);
      kelp.position.set(0, 0.02, 0.55);
      g.add(kelp);
    }
  }

  // ===========================================================================
  // PAGE 4: LACK'S CLUTCH SIZE (Woven Nest + 2..10 Robin's-Egg Blue Eggs)
  // ===========================================================================

  public updateLackClutch(res: LackClutchResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    const nestMat = createNaturalistMaterial(
      { base: '#8c6c4a', wash: '#664b2e', deep: '#3b2916', highlight: '#c7a987' },
      'strata',
      { roughness: 0.92, inkStrength: 0.54, seed: 1940 }
    );
    const nestBase = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.72, 0.34, 28), nestMat);
    nestBase.position.y = 0.17;
    nestBase.castShadow = true;
    nestBase.receiveShadow = true;
    const nestRim = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.18, 12, 32), nestMat);
    nestRim.rotation.x = Math.PI / 2;
    nestRim.position.y = 0.34;
    nestRim.castShadow = true;
    g.add(nestBase, nestRim);

    const healthy = res.chickSurvival > 0.62;
    const eggMat = createNaturalistMaterial(
      healthy
        ? { base: '#78b3c2', wash: '#518c9c', deep: '#285763', highlight: '#c2e8f2' }
        : { base: '#a6a9ab', wash: '#7e8285', deep: '#4a4d4f', highlight: '#dadfe3' },
      'bone',
      { roughness: 0.68, inkStrength: 0.45, seed: healthy ? 1941 : 1942 }
    );

    const eggScale = 0.72 + res.chickSurvival * 0.42;
    for (let i = 0; i < res.clutchSize; i++) {
      const ang = i * 2.39996;
      const rad = i === 0 ? 0 : Math.min(0.56, 0.24 + Math.sqrt(i) * 0.14);
      const egg = new THREE.Mesh(new THREE.SphereGeometry(0.14 * eggScale, 14, 12), eggMat);
      egg.scale.set(0.85, 1.2, 0.85);
      egg.position.set(Math.cos(ang) * rad, 0.36, Math.sin(ang) * rad);
      egg.rotation.z = Math.cos(ang) * 0.35;
      egg.castShadow = true;
      g.add(egg);
    }

    const parent = createSculptedSongbird3D({
      dorsalPalette: { base: '#7d634a', wash: '#59432e', deep: '#302215', highlight: '#bda288' },
      wingBars: 0,
      scale: 1.25,
      seed: 1945,
    });
    parent.position.set(1.22, 0.02, 0.18);
    parent.rotation.y = -1.25;
    g.add(parent);
  }

  // ===========================================================================
  // PAGE 5: SEMELPARITY (Pacific Salmon) vs ITEROPARITY (Galápagos Tortoise)
  // ===========================================================================

  public updateParity(res: ParityResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    const semScale = res.favoured === 'semelparous' ? 1.52 : 1.05;
    const iterScale = res.favoured === 'iteroparous' ? 1.28 : 0.88;

    const salmon = createSmithsonianSpecimen(fishGlbUrl, {
      size: 1.45 * semScale,
      palette: { base: '#5f8f99', wash: '#b6d9e0', deep: '#295059', ink: '#172e33' },
      rotation: [0, 0.85, 0],
      position: [-1.35, 0.25, 0],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
    g.add(salmon);

    const tortoise = this.createTortoise3D(iterScale);
    tortoise.position.set(1.15, 0.02, 0);
    tortoise.rotation.y = -0.65;
    g.add(tortoise);
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const op = createOpossum3D({ greyness: 0.6, scale: 1.1 });
    op.position.set(-1.35, 0.02, 0.15);
    op.rotation.y = 0.65;
    g.add(op);
    const tort = this.createTortoise3D(1.05);
    tort.position.set(1.05, 0.02, 0.1);
    tort.rotation.y = -0.55;
    g.add(tort);
  }

  public setPage(page: SenescencePageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as SenescencePageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'ma_ap' || page === 'disposable' ? 9.6 : 8.8;
    this.targetAzimuth = 0.22;
    this.targetPolar = page === 'lack' ? 0.58 : 0.42;
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
    this.camera.lookAt(0, 0.52, 0);
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
