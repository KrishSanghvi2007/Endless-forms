// =============================================================================
// Chapter 15: Ecology in Motion — Museum-Grade Naturalist Watercolour 3D Plates
// 1. Galápagos Character Displacement (Geospiza fortis morphing beak vs G. magnirostris)
// 2. Pacific Kelp Forest Trophic Cascade (Sea Otter + Purple Urchins + Giant Kelp)
// 3. MacArthur-Wilson Volcanic Island Biogeography (Island Size × Distance + Colonists)
// 4. Ideal Free Distribution (Input-Matching Foragers Across Two Botanical Patches)
// 5. Conservation Genetics & Genetic Rescue Corridor
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import {
  createGiantKelpFrond3D,
  createPurpleSeaUrchin3D,
  createSculptedSongbird3D,
  createSeaOtter3D,
} from '../../3d/naturalistSpecimens';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import crabGlbUrl from '../../assets/smithsonian_crab.glb?url';
import fishGlbUrl from '../../assets/smithsonian_fish.glb?url';
import tortoiseGlbUrl from '../../assets/smithsonian_tortoise.glb?url';
import type {
  BiogeographyResult,
  CascadeResult,
  DisplacementResult,
  IfdResult,
  VortexResult,
} from './ecologyMath';

export type EcologyPageId = 'displacement' | 'cascade' | 'biogeography' | 'ifd' | 'vortex' | 'check';

export class EcologyScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<EcologyPageId, THREE.Group>;
  private activePage: EcologyPageId = 'displacement';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 8.8;
  private targetAzimuth = 0.2;
  private targetPolar = 0.44;
  private curAzimuth = 0.2;
  private curPolar = 0.44;
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
      displacement: new THREE.Group(),
      cascade: new THREE.Group(),
      biogeography: new THREE.Group(),
      ifd: new THREE.Group(),
      vortex: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.displacement.add(this.p1Group);
    this.pageGroups.cascade.add(this.p2Group);
    this.pageGroups.biogeography.add(this.p3Group);
    this.pageGroups.ifd.add(this.p4Group);
    this.pageGroups.vortex.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('displacement');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // ===========================================================================
  // PAGE 1: GALÁPAGOS CHARACTER DISPLACEMENT (Geospiza fortis vs G. magnirostris)
  // ===========================================================================

  public updateDisplacement(res: DisplacementResult): void {
    this.p1Group.clear();
    const g = this.p1Group;

    // Focal Medium Ground Finch (Geospiza fortis) with LIVE morphing beak depth!
    const fortis = createSculptedSongbird3D({
      dorsalPalette: {
        base: '#6b5e50',
        wash: '#4d4136',
        deep: '#29211b',
        highlight: '#a69684',
        ink: '#1f1813',
      },
      beakDepth: res.fortisBeakScale,
      beakLength: 0.25 + res.fortisBeakScale * 0.04,
      wingBars: 0,
      scale: 1.75,
      seed: 151,
    });
    fortis.position.set(res.competitorPresent ? -1.15 : 0.0, 0.02, 0.05);
    fortis.rotation.y = res.competitorPresent ? 1.15 : 0.9;
    g.add(fortis);

    // Colonizing Large Ground Finch (Geospiza magnirostris) with massive nut-cracking beak!
    if (res.competitorPresent) {
      const magni = createSculptedSongbird3D({
        dorsalPalette: {
          base: '#3d3733',
          wash: '#292421',
          deep: '#141110',
          highlight: '#786e67',
          ink: '#0d0b0a',
        },
        beakDepth: 2.25,
        beakLength: 0.33,
        wingBars: 0,
        scale: 2.02,
        seed: 155,
      });
      magni.position.set(1.22, 0.02, 0.05);
      magni.rotation.y = -1.15;
      g.add(magni);
    }

    // Scattered hand-painted woody Tribulus cistoides spiny seeds on the rag paper!
    const seedMat = createNaturalistMaterial(
      { base: '#b08f5c', wash: '#87683a', deep: '#4f3a1c', highlight: '#dec597' },
      'strata',
      { roughness: 0.9, inkStrength: 0.48 }
    );
    const seedCount = res.drought ? 4 : 9;
    for (let i = 0; i < seedCount; i++) {
      const sMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(res.drought ? 0.11 : 0.07, 0),
        seedMat
      );
      sMesh.position.set(-1.1 + i * (2.2 / Math.max(1, seedCount - 1)), 0.07, 0.92 + (i % 2) * 0.25);
      sMesh.castShadow = true;
      g.add(sMesh);
    }
  }

  // ===========================================================================
  // PAGE 2: PACIFIC KELP FOREST TROPHIC CASCADE (Otter -> Urchins -> Kelp!)
  // ===========================================================================

  public updateCascade(res: CascadeResult): void {
    this.p2Group.clear();
    const g = this.p2Group;

    // Lush (or grazed-down!) Giant Kelp Fronds rising gracefully in the background
    const kelpCoords: [number, number][] = [
      [-1.55, -0.75],
      [-0.65, -0.95],
      [0.35, -0.88],
      [1.35, -0.72],
      [0.95, -0.25],
    ];
    kelpCoords.forEach(([kx, kz], idx) => {
      const frond = createGiantKelpFrond3D(res.kelpCanopyHeight, 1.05 + (idx % 2) * 0.15);
      frond.position.set(kx, 0.02, kz);
      frond.rotation.y = idx * 1.1;
      g.add(frond);
    });

    // Spiny Purple Sea Urchins multiplying as sea otters disappear!
    const nUrchins = Math.max(1, Math.min(8, Math.round(res.urchinDensity * 8)));
    for (let i = 0; i < nUrchins; i++) {
      const ang = (i / nUrchins) * Math.PI * 1.4 - 0.7;
      const ux = -1.65 + (i % 4) * 1.08;
      const uz = 0.55 + Math.floor(i / 4) * 0.68;
      const urchin = createPurpleSeaUrchin3D(0.75 + (i % 2) * 0.14);
      urchin.position.set(ux, 0.02, uz);
      urchin.rotation.y = ang;
      g.add(urchin);
    }

    // Keystone Pacific Sea Otter floating serenely above when otterDensity > 0.15!
    if (res.otterDensity > 0.15) {
      const otter = createSeaOtter3D(1.05 + res.otterDensity * 0.35);
      otter.position.set(-0.25, 0.52, -0.05);
      otter.rotation.y = 1.25;
      g.add(otter);
    }
  }

  // ===========================================================================
  // PAGE 3: MACARTHUR-WILSON VOLCANIC ISLAND BIOGEOGRAPHY
  // ===========================================================================

  public updateBiogeography(res: BiogeographyResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    // Left: Mainland Source Coastline
    const mainGeo = new THREE.CylinderGeometry(1.15, 1.35, 0.38, 28);
    const mainMat = createNaturalistMaterial(
      { base: '#6f8f5c', wash: '#4e6e3e', deep: '#2b4220', highlight: '#b0cc99' },
      'strata',
      { roughness: 0.9, inkStrength: 0.48 }
    );
    const mainland = new THREE.Mesh(mainGeo, mainMat);
    mainland.position.set(-2.15, 0.19, 0);
    mainland.castShadow = true;
    mainland.receiveShadow = true;
    g.add(mainland);

    // Right: Target Volcanic Island scaled live by islandSize & shifted by distance!
    const islX = -0.35 + res.distance * 2.15;
    const islR = 0.55 + res.islandSize * 0.92;
    const islGeo = new THREE.CylinderGeometry(islR * 0.82, islR * 1.08, 0.35 + res.islandSize * 0.25, 32);
    const isl = new THREE.Mesh(islGeo, mainMat);
    isl.position.set(islX, 0.18, 0);
    isl.castShadow = true;
    isl.receiveShadow = true;
    g.add(isl);

    // Sculpted colonizing songbirds perched atop the island proportional to equilibrium S*!
    const nBirds = Math.max(1, Math.min(6, Math.round(res.eqSpeciesS / 4.2)));
    const palettes = [
      { base: '#c95c44', wash: '#9e3824', deep: '#5e1c10', highlight: '#eda491' },
      { base: '#5a839e', wash: '#385f7a', deep: '#1e394d', highlight: '#a0c4db' },
      { base: '#d9a43b', wash: '#b07b1c', deep: '#6b470a', highlight: '#f5d88e' },
      { base: '#6d9460', wash: '#4c7041', deep: '#294222', highlight: '#a8cc99' },
    ];
    for (let i = 0; i < nBirds; i++) {
      const ang = (i / nBirds) * Math.PI * 2;
      const rad = nBirds === 1 ? 0 : islR * 0.44;
      const bird = createSculptedSongbird3D({
        dorsalPalette: palettes[i % palettes.length]!,
        scale: 0.65,
        seed: 200 + i * 17,
      });
      bird.position.set(islX + Math.cos(ang) * rad, 0.35 + res.islandSize * 0.22, Math.sin(ang) * rad);
      bird.rotation.y = ang + 0.5;
      g.add(bird);
    }
  }

  // ===========================================================================
  // PAGE 4: IDEAL FREE DISTRIBUTION (Input Matching Across Two Patches)
  // ===========================================================================

  public updateIfd(res: IfdResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    const patchMatRich = createNaturalistMaterial(
      { base: '#799c58', wash: '#567839', deep: '#314a1e', highlight: '#b8d694' },
      'botanical',
      { roughness: 0.88, inkStrength: 0.45 }
    );
    const patchMatPoor = createNaturalistMaterial(
      { base: '#c2b386', wash: '#9c8c5e', deep: '#615534', highlight: '#e6dbb8' },
      'strata',
      { roughness: 0.9, inkStrength: 0.45 }
    );

    // Rich patch (left) & Poor patch (right)
    const rich = new THREE.Mesh(new THREE.CylinderGeometry(1.38, 1.48, 0.16, 32), patchMatRich);
    rich.position.set(-1.45, 0.08, 0);
    rich.receiveShadow = true;
    rich.castShadow = true;
    const poor = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.18, 0.16, 32), patchMatPoor);
    poor.position.set(1.55, 0.08, 0);
    poor.receiveShadow = true;
    poor.castShadow = true;
    g.add(rich, poor);

    // Sculpted foragers matching resource supply!
    const birdPal = { base: '#5a839e', wash: '#385f7a', deep: '#1e394d', highlight: '#a0c4db' };
    for (let i = 0; i < res.richForagers; i++) {
      const ang = (i / Math.max(1, res.richForagers)) * Math.PI * 2;
      const rad = i === 0 ? 0 : 0.72;
      const b = createSculptedSongbird3D({ dorsalPalette: birdPal, scale: 0.62, seed: 300 + i });
      b.position.set(-1.45 + Math.cos(ang) * rad, 0.16, Math.sin(ang) * rad);
      b.rotation.y = ang + 1.2;
      g.add(b);
    }
    for (let i = 0; i < res.poorForagers; i++) {
      const ang = (i / Math.max(1, res.poorForagers)) * Math.PI * 2;
      const rad = res.poorForagers <= 2 ? (i - 0.5) * 0.55 : 0.55;
      const b = createSculptedSongbird3D({ dorsalPalette: birdPal, scale: 0.62, seed: 340 + i });
      b.position.set(1.55 + Math.cos(ang) * rad, 0.16, Math.sin(ang) * rad);
      b.rotation.y = ang - 0.8;
      g.add(b);
    }
  }

  // ===========================================================================
  // PAGE 5: CONSERVATION GENETICS & GENETIC RESCUE CORRIDOR
  // ===========================================================================

  public updateVortex(res: VortexResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    const patchMat = createNaturalistMaterial(
      { base: '#6f8f5c', wash: '#4e6e3e', deep: '#2b4220', highlight: '#b0cc99' },
      'strata',
      { roughness: 0.9, inkStrength: 0.48 }
    );
    const leftHab = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.28, 0.2, 28), patchMat);
    leftHab.position.set(-1.62, 0.1, 0);
    leftHab.receiveShadow = true;
    leftHab.castShadow = true;
    const rightHab = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.28, 0.2, 28), patchMat);
    rightHab.position.set(1.62, 0.1, 0);
    rightHab.receiveShadow = true;
    rightHab.castShadow = true;
    g.add(leftHab, rightHab);

    // Living green habitat corridor bridge when Genetic Rescue is OPEN!
    if (res.corridorOpen) {
      const bridgeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.75, 0.14, 0),
        new THREE.Vector3(0, 0.24, 0),
        new THREE.Vector3(0.75, 0.14, 0),
      ]);
      const bridge = new THREE.Mesh(
        createOrganicLoftGeometry(bridgeCurve, () => 0.22, {
          tubularSegs: 20,
          radialSegs: 12,
          aspectAt: () => [0.35, 1.65],
        }),
        patchMat
      );
      bridge.castShadow = true;
      g.add(bridge);
    }

    // Sea otters thriving with high genetic diversity vs tiny inbred bottleneck!
    const count = res.corridorOpen ? 4 : 1;
    for (let i = 0; i < count; i++) {
      const otter = createSeaOtter3D(0.72);
      otter.position.set(i < 2 ? -1.62 + (i - 0.5) * 0.72 : 1.62 + (i - 2.5) * 0.72, 0.2, (i % 2) * 0.45 - 0.2);
      otter.rotation.y = i % 2 === 0 ? 0.6 : -0.6;
      g.add(otter);
    }
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    // Real Smithsonian Blue Crab (Callinectes sapidus)
    const crab = createSmithsonianSpecimen(crabGlbUrl, {
      size: 1.65,
      palette: { base: '#5f8ea1', wash: '#b0d1de', deep: '#295061', ink: '#18303b' },
      rotation: [-Math.PI / 2, 0.35, 0],
      position: [-1.6, 0.02, 0.15],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
    g.add(crab);

    // Real Smithsonian Spotted Trunkfish (Lactophrys bicaudalis)
    const fish = createSmithsonianSpecimen(fishGlbUrl, {
      size: 1.55,
      palette: { base: '#789e8c', wash: '#c0dcd0', deep: '#355748', ink: '#1c3329' },
      rotation: [0, Math.PI * 0.45, 0],
      position: [0.1, 0.18, 0.1],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
    g.add(fish);

    // Real Smithsonian Red-footed Tortoise (Geochelone carbonaria)
    const tortoise = createSmithsonianSpecimen(tortoiseGlbUrl, {
      size: 1.5,
      palette: { base: '#8c7e58', wash: '#cdc09c', deep: '#4e4429', ink: '#2b2415' },
      rotation: [-Math.PI / 2, -0.5, Math.PI],
      position: [1.65, 0.02, 0.2],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
    g.add(tortoise);

    const kelp = createGiantKelpFrond3D(0.85, 0.9);
    kelp.position.set(1.45, 0.02, -0.75);
    g.add(kelp);
  }

  public setPage(page: EcologyPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as EcologyPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'cascade' ? 9.6 : page === 'biogeography' ? 11.2 : page === 'ifd' ? 9.8 : 8.8;
    this.targetAzimuth = page === 'cascade' ? 0.16 : 0.2;
    this.targetPolar = page === 'ifd' || page === 'biogeography' ? 0.56 : 0.42;
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
      this.targetPolar = Math.max(0.16, Math.min(1.25, this.targetPolar - (e.clientY - this.lastY) * 0.006));
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
    this.camera.lookAt(0, 0.52, 0);

    if (this.activePage === 'cascade') {
      this.p2Group.rotation.y = Math.sin(t * 0.35) * 0.08;
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
