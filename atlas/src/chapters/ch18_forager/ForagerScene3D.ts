// =============================================================================
// Chapter 18: Optimal Foraging & MVT — Museum-Grade Naturalist Watercolour 3D
// 1. Playable 3D Hummingbird Nectar-Patch Foraging Game (depleting blossoms!)
// 2. Charnov MVT Travel-Time Gap & Patch Depletion
// 3. Optimal Diet Breadth (Zero-One Rule: Rich Grubs vs Abundant Low-Value Seeds)
// 4. Risk-Sensitive Foraging (Safe Steady Patch vs High-Variance Lottery Patch)
// 5. Central-Place Foraging (Nest <-> Distant Meadow + Beak Load Size)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import orchidGlbUrl from '../../assets/smithsonian_orchid.glb?url';
import { createSculptedSongbird3D } from '../../3d/naturalistSpecimens';
import type {
  CentralPlaceResult,
  DietResult,
  MvtOptimum,
  RiskResult,
} from './foragerMath';

export type ForagerPageId = 'mvt_game' | 'mvt_tangent' | 'diet' | 'risk' | 'central' | 'check';

export class ForagerScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<ForagerPageId, THREE.Group>;
  private activePage: ForagerPageId = 'mvt_game';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();
  private hoverBird: THREE.Group | null = null;

  private fitDist = 9.0;
  private targetAzimuth = 0.22;
  private targetPolar = 0.48;
  private curAzimuth = 0.22;
  private curPolar = 0.48;
  private zoomFactor = 1.0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private clock = new THREE.Clock();

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
      mvt_game: new THREE.Group(),
      mvt_tangent: new THREE.Group(),
      diet: new THREE.Group(),
      risk: new THREE.Group(),
      central: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.mvt_game.add(this.p1Group);
    this.pageGroups.mvt_tangent.add(this.p2Group);
    this.pageGroups.diet.add(this.p3Group);
    this.pageGroups.risk.add(this.p4Group);
    this.pageGroups.central.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('mvt_game');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  private createNectarBlossom(remainingFrac: number, seed: number): THREE.Group {
    const f = new THREE.Group();
    const stemMat = createNaturalistMaterial(
      { base: '#4d7d47', wash: '#31592c', deep: '#1a3617', highlight: '#8ec288' },
      'botanical',
      { roughness: 0.86, inkStrength: 0.45, seed: 1801 }
    );
    const nectarMat = createNaturalistMaterial(
      { base: '#f0bc3c', wash: '#c79218', deep: '#7d5908', highlight: '#fce59d' },
      'fruit',
      { roughness: 0.55, inkStrength: 0.35, seed: 1804 }
    );

    const h = 0.55 + (seed % 3) * 0.14;
    const droop = (1 - remainingFrac) * 0.25;
    const stemCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, h * 0.55, 0.03),
      new THREE.Vector3(0.08 + droop, h - droop * 0.4, 0.05),
    ]);
    const stem = new THREE.Mesh(
      createOrganicLoftGeometry(stemCurve, () => 0.024, { tubularSegs: 12, radialSegs: 7 }),
      stemMat
    );
    stem.castShadow = true;
    f.add(stem);

    const tip = stemCurve.getPointAt(1);
    const head = new THREE.Group();
    head.position.copy(tip);
    head.rotation.z = -0.35 - droop * 1.4;
    const isFull = remainingFrac > 0.22;
    const scaleP = 0.65 + remainingFrac * 0.45;
    const bloom = createSmithsonianSpecimen(orchidGlbUrl, {
      size: 0.42 * scaleP,
      palette: isFull
        ? { base: '#d95343', wash: '#f5a89d', deep: '#7a1f14', ink: '#4a120a' }
        : { base: '#baa590', wash: '#e0d3c3', deep: '#6b5847', ink: '#3d3126' },
      rotation: [0.35, seed * 1.1, 0],
      grainScale: 3.2,
      inkStrength: 0.78,
    });
    head.add(bloom);
    if (isFull) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.05 * remainingFrac + 0.018, 10, 8), nectarMat);
      drop.position.y = 0.04;
      head.add(drop);
    }
    f.add(head);
    return f;
  }

  private createHummingbird(scale = 1.0): THREE.Group {
    return createSculptedSongbird3D({
      dorsalPalette: {
        base: '#3b8c6e',
        wash: '#21664c',
        deep: '#0e3d2b',
        highlight: '#8ad4b8',
        ink: '#09291d',
      },
      bellyPalette: {
        base: '#d95343',
        wash: '#ad3224',
        deep: '#69170d',
        highlight: '#f7a599',
      },
      wingBars: 0,
      beakDepth: 0.42,
      beakLength: 0.56,
      scale,
      seed: 1810,
    });
  }

  // ===========================================================================
  // PAGE 1: PLAYABLE 3D HUMMINGBIRD NECTAR-PATCH FORAGING GAME
  // ===========================================================================

  public updateMvtGame(sipsInPatch: number, travelTime: number, patchIndex: number): void {
    this.p1Group.clear();
    const g = this.p1Group;

    const meadowMat = createNaturalistMaterial(
      { base: '#6f9156', wash: '#4d6e36', deep: '#29401a', highlight: '#b0cf97' },
      'botanical',
      { roughness: 0.9, inkStrength: 0.45, seed: 1815 }
    );
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.82, 0.18, 36), meadowMat);
    pad.position.y = 0.09;
    pad.receiveShadow = true;
    pad.castShadow = true;
    g.add(pad);

    // 8 nectar blossoms that visibly deplete & droop with every sip!
    const fracRemaining = Math.exp(-0.42 * sipsInPatch);
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2 + patchIndex * 0.4;
      const rad = i % 2 === 0 ? 1.05 : 0.62;
      // Individual flowers wilt sequentially as sips accumulate!
      const flowerFrac = Math.max(0.08, Math.min(1, fracRemaining * 1.35 - (i / 8) * (1 - fracRemaining) * 0.7));
      const fl = this.createNectarBlossom(flowerFrac, i + patchIndex);
      fl.position.set(Math.cos(ang) * rad, 0.16, Math.sin(ang) * rad);
      fl.rotation.y = ang;
      g.add(fl);
    }

    // Hovering emerald-throated nectar bird sipping over the patch!
    const bird = this.createHummingbird(1.25);
    bird.position.set(-0.25, 0.72, 0.15);
    bird.rotation.y = 0.85 + sipsInPatch * 0.55;
    bird.rotation.x = 0.24;
    g.add(bird);
    this.hoverBird = bird;

    // Distant next patch silhouette hinting at travel time T_t!
    const nextPatch = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.14, 24), meadowMat);
    nextPatch.position.set(1.55 + travelTime * 0.16, 0.07, -1.25);
    nextPatch.castShadow = true;
    g.add(nextPatch);
  }

  // ===========================================================================
  // PAGE 2: CHARNOV MVT TRAVEL-TIME EXPLORER
  // ===========================================================================

  public updateMvtTangent(opt: MvtOptimum): void {
    this.p2Group.clear();
    const g = this.p2Group;

    const meadowMat = createNaturalistMaterial(
      { base: '#6f9156', wash: '#4d6e36', deep: '#29401a', highlight: '#b0cf97' },
      'botanical',
      { roughness: 0.9, inkStrength: 0.45, seed: 1821 }
    );
    const gap = 0.75 + opt.travelTime * 0.16;

    for (const sx of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.16, 28), meadowMat);
      m.position.set(sx * gap, 0.08, 0);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        const frac = sx === -1 ? Math.exp(-0.42 * opt.optStayTime) : 1.0;
        const fl = this.createNectarBlossom(Math.max(0.15, frac), i + (sx === 1 ? 3 : 0));
        fl.position.set(sx * gap + Math.cos(ang) * 0.48, 0.15, Math.sin(ang) * 0.48);
        g.add(fl);
      }
    }

    // Arched flight trajectory connecting left depleted patch to right fresh patch!
    const flightCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-gap, 0.85, 0),
      new THREE.Vector3(0, 1.25 + opt.travelTime * 0.06, 0),
      new THREE.Vector3(gap, 0.85, 0),
    ]);
    const pathMat = createNaturalistMaterial(
      { base: '#d49d35', wash: '#ab7415', deep: '#664106', highlight: '#f7d88b' },
      'keratin',
      { roughness: 0.72, inkStrength: 0.4, seed: 1822 }
    );
    g.add(
      new THREE.Mesh(
        createOrganicLoftGeometry(flightCurve, () => 0.036, { tubularSegs: 28, radialSegs: 8 }),
        pathMat
      )
    );

    const bird = this.createHummingbird(1.15);
    bird.position.set(0, 1.28 + opt.travelTime * 0.06, 0);
    bird.rotation.y = Math.PI / 2;
    g.add(bird);
  }

  // ===========================================================================
  // PAGE 3: OPTIMAL DIET BREADTH (Zero-One Rule: Beetle Grubs vs Grass Seeds)
  // ===========================================================================

  public updateDiet(res: DietResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    const bird = createSculptedSongbird3D({
      dorsalPalette: { base: '#8c6b4a', wash: '#664a2e', deep: '#3b2816', highlight: '#c9aa89' },
      wingBars: 0,
      beakDepth: 1.05,
      scale: 1.48,
      seed: 1830,
    });
    bird.position.set(0, 0.02, -0.35);
    bird.rotation.y = 0.25;
    g.add(bird);

    const grubMat = createNaturalistMaterial(
      { base: '#e0b443', wash: '#b88a1f', deep: '#705008', highlight: '#fae196' },
      'fruit',
      { roughness: 0.72, inkStrength: 0.48, seed: 1831 }
    );
    const seedMat = createNaturalistMaterial(
      { base: '#b09c7b', wash: '#8a7658', deep: '#524430', highlight: '#ded0b6' },
      'strata',
      { roughness: 0.9, inkStrength: 0.42, seed: 1832 }
    );

    const nGrubs = Math.max(1, Math.round(res.richEncounter * 14));
    for (let i = 0; i < nGrubs; i++) {
      const ang = (i / nGrubs) * Math.PI - Math.PI * 0.5;
      const grub = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 0.18, 6, 10), grubMat);
      grub.rotation.z = Math.PI / 2;
      grub.position.set(Math.sin(ang) * 1.45 - 0.15, 0.09, 0.65 + Math.cos(ang) * 0.45);
      grub.rotation.y = ang;
      grub.castShadow = true;
      g.add(grub);
    }

    const nSeeds = Math.max(2, Math.round(res.poorEncounter * 14));
    for (let i = 0; i < nSeeds; i++) {
      const sd = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), seedMat);
      sd.position.set(-1.65 + (i / Math.max(1, nSeeds - 1)) * 3.3, 0.055, 1.25 + (i % 2) * 0.28);
      sd.castShadow = true;
      g.add(sd);
    }
  }

  // ===========================================================================
  // PAGE 4: RISK-SENSITIVE FORAGING (Safe Steady Pile vs Lottery Pile)
  // ===========================================================================

  public updateRisk(res: RiskResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    const safeMat = createNaturalistMaterial(
      { base: '#5f8f72', wash: '#3f6e52', deep: '#1f422d', highlight: '#a5cfb5' },
      'botanical',
      { roughness: 0.88, inkStrength: 0.46, seed: 1841 }
    );
    const riskyMat = createNaturalistMaterial(
      { base: '#c45b42', wash: '#963923', deep: '#571a0c', highlight: '#f2a896' },
      'fruit',
      { roughness: 0.86, inkStrength: 0.48, seed: 1842 }
    );

    const safePad = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.16, 28), safeMat);
    safePad.position.set(-1.45, 0.08, 0);
    safePad.receiveShadow = true;
    safePad.castShadow = true;

    const riskyPad = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.16, 28), riskyMat);
    riskyPad.position.set(1.45, 0.08, 0);
    riskyPad.receiveShadow = true;
    riskyPad.castShadow = true;
    g.add(safePad, riskyPad);

    // Sculpted winter junco/songbird choosing Safe (above threshold) vs Risky (starving below threshold!)
    const bird = createSculptedSongbird3D({
      dorsalPalette: { base: '#596b7d', wash: '#3a4a5c', deep: '#1e2833', highlight: '#9fb2c4' },
      wingBars: 0,
      scale: 1.45,
      seed: 1843,
    });
    bird.position.set(res.optimalChoice === 'safe' ? -1.45 : 1.45, 0.16, 0.05);
    bird.rotation.y = res.optimalChoice === 'safe' ? 0.65 : -0.65;
    g.add(bird);
  }

  // ===========================================================================
  // PAGE 5: CENTRAL-PLACE FORAGING (Nest <-> Meadow + Beak Grub Load)
  // ===========================================================================

  public updateCentral(res: CentralPlaceResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    const nestMat = createNaturalistMaterial(
      { base: '#8c6c4a', wash: '#664b2e', deep: '#3b2916', highlight: '#c7a987' },
      'strata',
      { roughness: 0.92, inkStrength: 0.52, seed: 1851 }
    );
    const grubMat = createNaturalistMaterial(
      { base: '#e0b443', wash: '#b88a1f', deep: '#705008', highlight: '#fae196' },
      'fruit',
      { roughness: 0.72, inkStrength: 0.45, seed: 1852 }
    );

    // Left: Woven twig nest
    const nest = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.22, 12, 26), nestMat);
    nest.rotation.x = Math.PI / 2;
    nest.position.set(-1.72, 0.2, 0);
    nest.castShadow = true;
    g.add(nest);

    // Right: Starling holding exact `optimalLoad` golden grubs in its bill!
    const starling = createSculptedSongbird3D({
      dorsalPalette: { base: '#3d454d', wash: '#252b30', deep: '#101417', highlight: '#7a8896' },
      wingBars: 0,
      beakDepth: 0.82,
      beakLength: 0.36,
      scale: 1.55,
      seed: 1853,
    });
    starling.position.set(1.15, 0.02, 0);
    starling.rotation.y = -Math.PI / 2;
    g.add(starling);

    for (let i = 0; i < res.optimalLoad; i++) {
      const grub = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.14, 5, 8), grubMat);
      grub.position.set(0.22, 1.02 + (i % 3 - 1) * 0.06, (i - res.optimalLoad / 2) * 0.08);
      grub.rotation.x = Math.PI / 2 + 0.2;
      grub.castShadow = true;
      g.add(grub);
    }
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const fl = this.createNectarBlossom(1.0, 1);
    fl.position.set(-1.15, 0.02, 0.1);
    fl.scale.setScalar(1.45);
    g.add(fl);
    const bird = this.createHummingbird(1.45);
    bird.position.set(0.35, 0.55, 0.1);
    bird.rotation.y = -0.85;
    g.add(bird);
  }

  public setPage(page: ForagerPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as ForagerPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'mvt_tangent' || page === 'risk' ? 9.8 : 9.0;
    this.targetAzimuth = 0.2;
    this.targetPolar = page === 'mvt_game' || page === 'diet' ? 0.52 : 0.44;
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
    const t = this.clock.getElapsedTime();

    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.1;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.1;

    const r = this.fitDist * this.zoomFactor;
    this.camera.position.set(
      r * Math.sin(this.curAzimuth) * Math.cos(this.curPolar),
      r * Math.sin(this.curPolar) + 0.55,
      r * Math.cos(this.curAzimuth) * Math.cos(this.curPolar)
    );
    this.camera.lookAt(0, 0.55, 0);

    if (this.activePage === 'mvt_game' && this.hoverBird) {
      this.hoverBird.position.y = 0.72 + Math.sin(t * 4.2) * 0.05;
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
