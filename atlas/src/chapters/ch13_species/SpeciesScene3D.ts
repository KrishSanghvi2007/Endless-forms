// =============================================================================
// Chapter 13: Splitting Branches — Museum-Grade Natural-History 3D Plates
// Zero clunky floor cards, zero plastic spheres:
// - Continuous-lofted watercolour & sepia-ink sculpted Greenish Warblers
// - Organic sculpted Tibetan Plateau relief & 3D interlocking protein complexes
// - True LatheGeometry Apple & Hawthorn botanical twigs
// - Sculpted Tragopogon allopolyploid botanical blossoms (2n=12 -> 4n=24)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import {
  createBotanicalFruitTwig3D,
  createInterlockingProteins3D,
  createSculptedSongbird3D,
  createTragopogonBlossom3D,
} from '../../3d/naturalistSpecimens';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import beetleGlbUrl from '../../assets/smithsonian_beetle.glb?url';
import orchidGlbUrl from '../../assets/smithsonian_orchid.glb?url';
import crabGlbUrl from '../../assets/smithsonian_crab.glb?url';
import type {
  DmiResult,
  HostShiftResult,
  PolyploidyResult,
  ReinforcementResult,
  RingSpeciesResult,
} from './speciesMath';

export type SpeciesPageId = 'ring' | 'dmi' | 'hostshift' | 'reinforcement' | 'polyploidy' | 'check';

export class SpeciesScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<SpeciesPageId, THREE.Group>;
  private activePage: SpeciesPageId = 'ring';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 8.4;
  private targetAzimuth = 0.24;
  private targetPolar = 0.44;
  private curAzimuth = 0.24;
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
      ring: new THREE.Group(),
      dmi: new THREE.Group(),
      hostshift: new THREE.Group(),
      reinforcement: new THREE.Group(),
      polyploidy: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.ring.add(this.p1Group);
    this.pageGroups.dmi.add(this.p2Group);
    this.pageGroups.hostshift.add(this.p3Group);
    this.pageGroups.reinforcement.add(this.p4Group);
    this.pageGroups.polyploidy.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('ring');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // ===========================================================================
  // PAGE 1: RING SPECIES — SCULPTED GREENISH WARBLERS AROUND TIBETAN PLATEAU
  // ===========================================================================

  public updateRingSpecies(res: RingSpeciesResult): void {
    this.p1Group.clear();
    const g = this.p1Group;

    // Sculpted watercolor topographic Tibetan Plateau massif (central barrier!)
    const plateauGeo = new THREE.CylinderGeometry(1.15, 1.58, 0.42, 48, 8);
    const pos = plateauGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (y > -0.18) {
        const r = Math.hypot(x, z);
        const ridge =
          0.26 * Math.exp(-r * r * 0.65) +
          0.09 * Math.sin(x * 3.1 + z * 1.9) * Math.cos(z * 2.7 - x * 1.4);
        pos.setY(i, y + ridge);
      }
    }
    plateauGeo.computeVertexNormals();
    const plateauMat = createNaturalistMaterial(
      { base: '#d9ccb2', wash: '#baa682', deep: '#7d694b', highlight: '#f2ead8', ink: '#4d3d28' },
      'strata',
      { roughness: 0.92, bumpScale: 0.03, inkStrength: 0.48 }
    );
    const plateau = new THREE.Mesh(plateauGeo, plateauMat);
    plateau.position.set(0, 0.21, -0.1);
    plateau.castShadow = true;
    plateau.receiveShadow = true;
    g.add(plateau);

    // Delicate sepia-ink dispersal arcs encircling the plateau west & east
    const westArc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 1.65),
      new THREE.Vector3(-1.85, 0.05, 0.75),
      new THREE.Vector3(-1.95, 0.05, -0.65),
      new THREE.Vector3(-0.65, 0.05, -1.62),
    ]);
    const eastArc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.05, 1.65),
      new THREE.Vector3(1.85, 0.05, 0.75),
      new THREE.Vector3(1.95, 0.05, -0.65),
      new THREE.Vector3(0.65, 0.05, -1.62),
    ]);
    const westTrack = new THREE.Mesh(
      createOrganicLoftGeometry(westArc, () => 0.025, { tubularSegs: 28, radialSegs: 8 }),
      createNaturalistMaterial(
        { base: '#6b9462', wash: '#4a7043', deep: '#2b4727', highlight: '#a5c799' },
        'botanical',
        { inkStrength: 0.35 }
      )
    );
    const eastTrack = new THREE.Mesh(
      createOrganicLoftGeometry(eastArc, () => 0.025, { tubularSegs: 28, radialSegs: 8 }),
      createNaturalistMaterial(
        { base: '#5d8ca8', wash: '#3d6985', deep: '#214257', highlight: '#a0c5db' },
        'botanical',
        { inkStrength: 0.35 }
      )
    );
    g.add(westTrack, eastTrack);

    // Hero sculpted Western Warbler (viridanus, 1 wing bar) & Eastern Warbler (plumbeitarsus, 2 wing bars!)
    const p = res.positionAlongRing;
    const ptW = westArc.getPointAt(Math.max(0.06, p));
    const ptE = eastArc.getPointAt(Math.max(0.06, p));

    const birdWest = createSculptedSongbird3D({
      dorsalPalette: {
        base: '#7c995c',
        wash: '#59753d',
        deep: '#364a22',
        highlight: '#b4c98e',
        ink: '#29381a',
      },
      wingBars: 1,
      beakDepth: 0.65,
      scale: 1.38,
      seed: 12,
    });
    birdWest.position.set(ptW.x, 0.02, ptW.z);
    birdWest.rotation.y = Math.atan2(0 - ptW.x, -0.1 - ptW.z) + 0.55;
    g.add(birdWest);

    const birdEast = createSculptedSongbird3D({
      dorsalPalette: {
        base: '#5a8a78',
        wash: '#3b6959',
        deep: '#204237',
        highlight: '#96c2b0',
        ink: '#18332a',
      },
      wingBars: 2,
      beakDepth: 0.68,
      scale: 1.38,
      seed: 29,
    });
    birdEast.position.set(ptE.x, 0.02, ptE.z);
    birdEast.rotation.y = Math.atan2(0 - ptE.x, -0.1 - ptE.z) - 0.55;
    g.add(birdEast);
  }

  // ===========================================================================
  // PAGE 2: DOBZHANSKY-MULLER INCOMPATIBILITY (Interlocking Proteins & Ridge)
  // ===========================================================================

  public updateDmi(res: DmiResult): void {
    this.p2Group.clear();
    const g = this.p2Group;

    // Hero museum-scale interlocking 3D sculpted biopolymer complex floating cleanly over rag paper!
    const complex = createInterlockingProteins3D(res.proteinClash, 1.38);
    complex.position.set(0, 0.15, 0.05);
    g.add(complex);

    // Subtle watercolour ring beneath marking compatible docking (verdigris) vs steric clash (carmine)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.65, 0.026, 8, 48),
      createNaturalistMaterial(
        res.proteinClash
          ? { base: '#cc5247', wash: '#a12f26', deep: '#631712', highlight: '#eb9e96' }
          : { base: '#569c8e', wash: '#337568', deep: '#1b4a40', highlight: '#a3d9ce' },
        'bone',
        { inkStrength: 0.35 }
      )
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, 0.03, 0.05);
    g.add(ring);
  }

  // ===========================================================================
  // PAGE 3: SYMPATRIC HOST SHIFT (Botanical Apple & Hawthorn Twigs)
  // ===========================================================================

  public updateHostShift(res: HostShiftResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    // Physical separation subtly echoes temporal fruiting divergence (0..5 weeks)!
    const sep = 0.72 + res.seasonalGapWeeks * 0.16;

    const appleTwig = createBotanicalFruitTwig3D({ fruit: 'apple', scale: 1.38 });
    appleTwig.position.set(-sep, 0.06, 0.05);
    appleTwig.rotation.y = 0.28;
    g.add(appleTwig);

    const hawTwig = createBotanicalFruitTwig3D({ fruit: 'hawthorn', scale: 1.38 });
    hawTwig.position.set(sep, 0.06, 0.05);
    hawTwig.rotation.y = -0.35;
    g.add(hawTwig);
  }

  // ===========================================================================
  // PAGE 4: REINFORCEMENT (Sculpted Songbird Signal Divergence)
  // ===========================================================================

  public updateReinforcement(res: ReinforcementResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    // Left species stays warm sapphire-olive; right species shifts sharply toward crimson-ochre under reinforcement!
    const div = res.signalDivergence;
    const rightBase = new THREE.Color('#63879c').lerp(new THREE.Color('#c7523a'), div);
    const rightWash = new THREE.Color('#3f6278').lerp(new THREE.Color('#99301e'), div);
    const rightDeep = new THREE.Color('#223c4d').lerp(new THREE.Color('#5e180d'), div);
    const rightHi = new THREE.Color('#a8c7d9').lerp(new THREE.Color('#eba28a'), div);

    const birdA = createSculptedSongbird3D({
      dorsalPalette: {
        base: '#5a839e',
        wash: '#385f7a',
        deep: '#1e394d',
        highlight: '#a0c4db',
        ink: '#172d3d',
      },
      wingBars: 1,
      beakDepth: 0.78,
      scale: 1.62,
      seed: 41,
    });
    birdA.position.set(-1.35, 0.02, 0.0);
    birdA.rotation.y = 1.18;
    g.add(birdA);

    const birdB = createSculptedSongbird3D({
      dorsalPalette: {
        base: `#${rightBase.getHexString()}`,
        wash: `#${rightWash.getHexString()}`,
        deep: `#${rightDeep.getHexString()}`,
        highlight: `#${rightHi.getHexString()}`,
        ink: '#3b1d16',
      },
      wingBars: div > 0.5 ? 2 : 1,
      beakDepth: 0.78,
      scale: 1.62,
      seed: 73,
    });
    birdB.position.set(1.35, 0.02, 0.0);
    birdB.rotation.y = -1.18;
    g.add(birdB);
  }

  // ===========================================================================
  // PAGE 5: INSTANT ALLOPOLYPLOID SPECIATION (Sculpted Tragopogon Blossoms!)
  // ===========================================================================

  public updatePolyploidy(res: PolyploidyResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    if (res.step === 'parents') {
      const f1 = createTragopogonBlossom3D({ species: 'dubius', scale: 1.12 });
      f1.position.set(-1.15, 0.02, 0.0);
      f1.rotation.set(0.45, 0, 0.08);
      const f2 = createTragopogonBlossom3D({ species: 'pratensis', scale: 1.12 });
      f2.position.set(1.15, 0.02, 0.0);
      f2.rotation.set(0.45, 0, -0.08);
      g.add(f1, f2);
    } else if (res.step === 'f1_sterile') {
      const hybrid = createTragopogonBlossom3D({ species: 'dubius', scale: 1.05 });
      hybrid.position.set(0, 0.02, 0);
      hybrid.rotation.set(0.5, 0, 0.14);
      g.add(hybrid);
    } else {
      // Giant fertile tetraploid Tragopogon miscellus (4n = 24) flanked by smaller diploid parents!
      const p1 = createTragopogonBlossom3D({ species: 'dubius', scale: 0.84 });
      p1.position.set(-1.65, 0.02, 0.25);
      p1.rotation.set(0.48, 0, 0.12);
      const p2 = createTragopogonBlossom3D({ species: 'pratensis', scale: 0.84 });
      p2.position.set(1.65, 0.02, 0.25);
      p2.rotation.set(0.48, 0, -0.12);
      const giant = createTragopogonBlossom3D({ species: 'miscellus_4n', scale: 1.12 });
      giant.position.set(0, 0.02, -0.15);
      giant.rotation.set(0.48, 0, 0);
      g.add(p1, p2, giant);
    }
  }

  // ===========================================================================
  // PAGE 6: SPECIMEN GALLERY SHOWCASE
  // ===========================================================================

  private buildPage6Check(): void {
    const g = this.pageGroups.check;

    // Real Smithsonian Longhorn Beetle (Psalidognathus superbus) — terrestrial divergence
    const beetle = createSmithsonianSpecimen(beetleGlbUrl, {
      size: 1.55,
      palette: { base: '#5f8a70', wash: '#a9ccb7', deep: '#2b4a38', ink: '#182b20' },
      rotation: [0, 0.45, 0],
      position: [-1.55, 0.04, 0.15],
      groundOnY0: true,
      grainScale: 2.1,
      inkStrength: 0.9,
    });
    g.add(beetle);

    // Real Smithsonian Orchid Bloom (Lycaste virginalis) — botanical polyploid speciation
    const orchid = createSmithsonianSpecimen(orchidGlbUrl, {
      size: 1.65,
      palette: { base: '#e6c25a', wash: '#faecc0', deep: '#96711d', ink: '#4f3a0c' },
      rotation: [0.35, 0.15, 0],
      position: [0.05, 0.08, -0.05],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.86,
    });
    g.add(orchid);

    // Real Smithsonian Blue Crab (Callinectes sapidus) — marine allopatry
    const crab = createSmithsonianSpecimen(crabGlbUrl, {
      size: 1.55,
      palette: { base: '#5f8ea1', wash: '#b0d1de', deep: '#295061', ink: '#18303b' },
      rotation: [-Math.PI / 2, -0.45, 0],
      position: [1.65, 0.02, 0.12],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.88,
    });
    g.add(crab);
  }

  public setPage(page: SpeciesPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as SpeciesPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'ring' ? 9.2 : page === 'dmi' ? 9.8 : page === 'polyploidy' ? 9.6 : page === 'hostshift' ? 8.8 : 9.0;
    this.targetAzimuth = page === 'ring' ? 0.16 : 0.18;
    this.targetPolar = page === 'ring' ? 0.58 : page === 'polyploidy' ? 0.56 : 0.42;
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
      this.targetPolar = Math.max(0.14, Math.min(1.22, this.targetPolar - (e.clientY - this.lastY) * 0.006));
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
      r * Math.sin(this.curPolar) + 0.65,
      r * Math.cos(this.curAzimuth) * Math.cos(this.curPolar)
    );
    this.camera.lookAt(0, 0.58, 0);

    // Subtle organic breathing motion on hero specimens
    if (this.activePage === 'polyploidy') {
      this.p5Group.rotation.y = Math.sin(t * 0.35) * 0.12;
    } else if (this.activePage === 'dmi') {
      this.p2Group.rotation.y = Math.sin(t * 0.4) * 0.18;
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
