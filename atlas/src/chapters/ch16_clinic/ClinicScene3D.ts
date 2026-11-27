// =============================================================================
// Chapter 16: The Clinic & Human Origins — Museum-Grade Naturalist Watercolour 3D
// 1. Antibiotic MIC/MPC Agar Plate (Wild-Type vs Single-Step Resistant Bacilli)
// 2. Conjugative R-Plasmid Horizontal Gene Transfer (Sex Pilus + Circular Plasmid)
// 3. Clonal Cancer Evolution (MTD Competitive Release vs Adaptive Therapy)
// 4. Live-Morphing Hominin Cranium Osteology (A. afarensis -> H. sapiens)
// 5. Out-of-Africa Serial Founder Relief Map & Archaic Admixture Arcs
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import {
  createConjugatingBacteria3D,
  createHomininCranium3D,
  createTumourClonalSphere3D,
} from '../../3d/naturalistSpecimens';
import { createSmithsonianSpecimen } from '../../3d/smithsonianLoader';
import deerSkullGlbUrl from '../../assets/smithsonian_deer_skull.glb?url';
import type {
  CancerResult,
  HgtResult,
  HomininTaxon,
  MicResult,
  OoaResult,
} from './clinicMath';

export type ClinicPageId = 'mic' | 'hgt' | 'cancer' | 'hominin' | 'ooa' | 'check';

export class ClinicScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<ClinicPageId, THREE.Group>;
  private activePage: ClinicPageId = 'mic';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 8.6;
  private targetAzimuth = 0.22;
  private targetPolar = 0.44;
  private curAzimuth = 0.22;
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
      mic: new THREE.Group(),
      hgt: new THREE.Group(),
      cancer: new THREE.Group(),
      hominin: new THREE.Group(),
      ooa: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.mic.add(this.p1Group);
    this.pageGroups.hgt.add(this.p2Group);
    this.pageGroups.cancer.add(this.p3Group);
    this.pageGroups.hominin.add(this.p4Group);
    this.pageGroups.ooa.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('mic');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // ===========================================================================
  // PAGE 1: ANTIBIOTIC MIC / MPC AGAR PETRI SPECIMEN
  // ===========================================================================

  public updateMic(res: MicResult): void {
    this.p1Group.clear();
    const g = this.p1Group;

    const dishMat = createNaturalistMaterial(
      { base: '#f0e7cf', wash: '#dfd0ad', deep: '#a3926d', highlight: '#faf6eb' },
      'tissue',
      { roughness: 0.72, transparent: true, opacity: 0.92, inkStrength: 0.45, seed: 1601 }
    );
    const rimMat = createNaturalistMaterial(
      { base: '#d9d3c5', wash: '#b8b0a0', deep: '#7a7263', highlight: '#f2eee4' },
      'keratin',
      { roughness: 0.42, transparent: true, opacity: 0.65, inkStrength: 0.5, seed: 1602 }
    );
    const wtMat = createNaturalistMaterial(
      { base: '#6f9c7a', wash: '#4d7857', deep: '#294730', highlight: '#b0d4b8' },
      'tissue',
      { roughness: 0.78, inkStrength: 0.52, seed: 1603 }
    );
    const mutMat = createNaturalistMaterial(
      { base: '#c44b45', wash: '#962b26', deep: '#57120f', highlight: '#f09c97' },
      'tissue',
      { roughness: 0.75, inkStrength: 0.55, seed: 1604 }
    );
    const haloMat = createNaturalistMaterial(
      { base: '#e0b354', wash: '#c49131', deep: '#7d5916', highlight: '#f7de9c' },
      'tissue',
      { roughness: 0.85, transparent: true, opacity: 0.34, inkStrength: 0.25, seed: 1605 }
    );

    // Nutrient agar disc + raised glass petri rim
    const agar = new THREE.Mesh(new THREE.CylinderGeometry(1.88, 1.92, 0.16, 40), dishMat);
    agar.position.y = 0.08;
    agar.receiveShadow = true;
    agar.castShadow = true;
    g.add(agar);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.9, 0.055, 10, 48), rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.20;
    g.add(rim);

    // Central antibiotic-infused filter paper disc + concentration diffusion halo!
    const filterMat = new THREE.MeshStandardMaterial({ color: 0xfbf8f0, roughness: 0.92 });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 24), filterMat);
    disc.position.y = 0.18;
    disc.castShadow = true;
    g.add(disc);

    if (res.dose > 0.2) {
      const haloR = Math.min(1.82, 0.36 + (res.dose / 24) * 1.48);
      const halo = new THREE.Mesh(new THREE.CylinderGeometry(haloR, haloR, 0.015, 36), haloMat);
      halo.position.y = 0.165;
      g.add(halo);
    }

    // Populate sculpted bacterial rods according to end-of-simulation WT & Mutant survival!
    const wtEnd = res.wtSeries[res.wtSeries.length - 1]!;
    const mutEnd = res.mutSeries[res.mutSeries.length - 1]!;
    const nWt = wtEnd > 0.015 ? Math.round(Math.pow(wtEnd, 0.45) * 28) : 0;
    const nMut = mutEnd > 0.015 ? Math.round(Math.pow(mutEnd, 0.45) * 28) : 0;
    const rodGeo = new THREE.CapsuleGeometry(0.055, 0.16, 6, 10);
    rodGeo.rotateZ(Math.PI / 2);

    const placeColonies = (count: number, mat: THREE.Material, seedOffset: number, minR: number) => {
      for (let i = 0; i < count; i++) {
        const ang = (i * 2.39996 + seedOffset) % (Math.PI * 2);
        const rad = minR + ((i * 37 + seedOffset * 13) % 100) / 100 * (1.65 - minR);
        const bac = new THREE.Mesh(rodGeo, mat);
        bac.position.set(Math.cos(ang) * rad, 0.21, Math.sin(ang) * rad);
        bac.rotation.y = ang + 0.7;
        bac.castShadow = true;
        g.add(bac);
      }
    };

    placeColonies(nWt, wtMat, 1, res.dose > 2 ? 0.85 : 0.36);
    placeColonies(nMut, mutMat, 19, res.dose > 12 ? 1.15 : 0.36);

    // If above MPC, show 2 tiny dormant persister cells surviving near the rim (nuance!)
    if (res.zone === 'above_mpc' && nWt + nMut < 3) {
      for (let p = 0; p < 2; p++) {
        const pers = new THREE.Mesh(rodGeo, wtMat);
        pers.scale.setScalar(0.75);
        pers.position.set(p === 0 ? -1.35 : 1.25, 0.20, p === 0 ? 0.55 : -0.75);
        pers.rotation.y = p * 1.4;
        g.add(pers);
      }
    }
  }

  // ===========================================================================
  // PAGE 2: CONJUGATIVE R-PLASMID HORIZONTAL GENE TRANSFER
  // ===========================================================================

  public updateHgt(res: HgtResult): void {
    this.p2Group.clear();
    const pair = createConjugatingBacteria3D(res.transferProgress, res.finalPlasmidFreq, 1.15);
    this.p2Group.add(pair);
  }

  // ===========================================================================
  // PAGE 3: CLONAL EVOLUTION OF CANCER & ADAPTIVE THERAPY
  // ===========================================================================

  public updateCancer(res: CancerResult): void {
    this.p3Group.clear();
    const tumour = createTumourClonalSphere3D(
      1 - res.finalResistantShare,
      res.finalResistantShare,
      res.finalBurden,
      1.15
    );
    this.p3Group.add(tumour);
  }

  // ===========================================================================
  // PAGE 4: MORPHING HOMININ CRANIUM OSTEOLOGY (Branching Bush)
  // ===========================================================================

  public updateHominin(taxon: HomininTaxon): void {
    this.p4Group.clear();
    const cranium = createHomininCranium3D(
      taxon.stage,
      taxon.id === 'neanderthal',
      1.26
    );
    cranium.rotation.y = 0.78; // Classic 3/4 lateral naturalist osteology profile showing vault, brow, prognathism & chin!
    this.p4Group.add(cranium);
  }

  // ===========================================================================
  // PAGE 5: OUT OF AFRICA SERIAL FOUNDER RELIEF MAP & ARCHAIC ADMIXTURE
  // ===========================================================================

  public updateOoa(res: OoaResult, includeAdmixture: boolean): void {
    this.p5Group.clear();
    const g = this.p5Group;

    const landMat = createNaturalistMaterial(
      { base: '#c9b896', wash: '#a8946f', deep: '#6b5b3e', highlight: '#ede2c7' },
      'strata',
      { roughness: 0.9, inkStrength: 0.48, seed: 1651 }
    );
    const africaMat = createNaturalistMaterial(
      { base: '#b58d59', wash: '#8f6938', deep: '#573c1a', highlight: '#e3c496' },
      'strata',
      { roughness: 0.88, inkStrength: 0.5, seed: 1652 }
    );
    const ribbonMat = createNaturalistMaterial(
      { base: '#b84239', wash: '#8c2820', deep: '#52110c', highlight: '#eb8d86' },
      'keratin',
      { roughness: 0.72, inkStrength: 0.45, seed: 1653 }
    );
    const neandMat = createNaturalistMaterial(
      { base: '#4c7594', wash: '#315470', deep: '#183045', highlight: '#93bad6' },
      'keratin',
      { roughness: 0.75, inkStrength: 0.42, seed: 1654 }
    );
    const denisMat = createNaturalistMaterial(
      { base: '#7d5c8f', wash: '#5a3c6b', deep: '#351f42', highlight: '#bd9fd1' },
      'keratin',
      { roughness: 0.75, inkStrength: 0.42, seed: 1655 }
    );
    const jewelMat = createNaturalistMaterial(
      { base: '#d9a43b', wash: '#b07b1c', deep: '#6b470a', highlight: '#f7dc8d' },
      'fruit',
      { roughness: 0.55, inkStrength: 0.4, seed: 1656 }
    );

    // Sculpted relief continental stepping-stone plateaus (Africa -> Eurasia -> Oceania -> Americas)
    const regions: { x: number; z: number; rx: number; rz: number; h: number; isAfrica?: boolean }[] = [
      { x: -1.65, z: 0.45, rx: 0.82, rz: 0.92, h: 0.24, isAfrica: true }, // Africa (ancestral cradle)
      { x: -0.75, z: -0.58, rx: 0.72, rz: 0.55, h: 0.20 },                // Europe / Levant
      { x: 0.45, z: -0.45, rx: 0.92, rz: 0.65, h: 0.22 },                 // Asia
      { x: 1.05, z: 0.72, rx: 0.52, rz: 0.42, h: 0.18 },                  // Melanesia / Oceania
      { x: 2.02, z: 0.05, rx: 0.55, rz: 1.05, h: 0.20 },                  // The Americas
    ];
    regions.forEach((rg) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(rg.rx * 0.9, rg.rx, rg.h, 24),
        rg.isAfrica ? africaMat : landMat
      );
      m.scale.set(1, 1, rg.rz / rg.rx);
      m.position.set(rg.x, rg.h * 0.5, rg.z);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    });

    // Main Out-of-Africa dispersal ribbon narrowing gradually with serial founder bottlenecks!
    const ooaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.62, 0.32, 0.42),
      new THREE.Vector3(-1.02, 0.34, -0.22),
      new THREE.Vector3(0.15, 0.34, -0.45),
      new THREE.Vector3(1.18, 0.32, -0.35),
      new THREE.Vector3(1.98, 0.30, 0.22),
    ]);
    const ooaRibbon = new THREE.Mesh(
      createOrganicLoftGeometry(ooaCurve, (t) => 0.115 * (1 - t * 0.55), {
        tubularSegs: 42,
        radialSegs: 12,
        aspectAt: () => [1.3, 0.5],
      }),
      ribbonMat
    );
    ooaRibbon.castShadow = true;
    g.add(ooaRibbon);

    // Southern branch into Oceania / Melanesia
    const ocCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.32, 0.32, -0.38),
      new THREE.Vector3(0.75, 0.30, 0.18),
      new THREE.Vector3(1.05, 0.28, 0.72),
    ]);
    const ocRibbon = new THREE.Mesh(
      createOrganicLoftGeometry(ocCurve, (t) => 0.075 * (1 - t * 0.35), {
        tubularSegs: 20,
        radialSegs: 10,
      }),
      ribbonMat
    );
    ocRibbon.castShadow = true;
    g.add(ocRibbon);

    // Archaic introgression ribbons (Neanderthal ~2% in Levant/Eurasia, Denisovan ~4% in Melanesia!)
    if (includeAdmixture) {
      const nCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1.12, 0.30, -0.82),
        new THREE.Vector3(-0.88, 0.36, -0.52),
        new THREE.Vector3(-0.55, 0.35, -0.32),
      ]);
      g.add(
        new THREE.Mesh(
          createOrganicLoftGeometry(nCurve, () => 0.042, { tubularSegs: 16, radialSegs: 8 }),
          neandMat
        )
      );

      const dCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.68, 0.30, -0.85),
        new THREE.Vector3(0.88, 0.36, -0.05),
        new THREE.Vector3(1.05, 0.30, 0.65),
      ]);
      g.add(
        new THREE.Mesh(
          createOrganicLoftGeometry(dCurve, () => 0.042, { tubularSegs: 18, radialSegs: 8 }),
          denisMat
        )
      );
    }

    // Golden genetic-diversity allele jewels — richest inside Africa (highest heterozygosity!)
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const bead = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), jewelMat);
      bead.position.set(-1.65 + Math.cos(ang) * 0.42, 0.31, 0.45 + Math.sin(ang) * 0.48);
      bead.castShadow = true;
      g.add(bead);
    }

    // Active focal marker along the serial-founder transect corresponding to distanceKm!
    const frac = Math.max(0.01, Math.min(0.99, res.distanceKm / 22400));
    const pt = ooaCurve.getPointAt(frac);
    const pin = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 14), jewelMat);
    pin.position.set(pt.x, pt.y + 0.16, pt.z);
    pin.castShadow = true;
    g.add(pin);
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const bac = createConjugatingBacteria3D(0.55, 0.5, 0.48);
    bac.position.set(-1.52, 0.0, 0.22);
    g.add(bac);

    const skull = createSmithsonianSpecimen(deerSkullGlbUrl, {
      size: 1.55,
      palette: { base: '#dcd0b4', wash: '#f6efe0', deep: '#8a7958', ink: '#423622' },
      rotation: [0, 0.68, 0],
      position: [0.08, 0.04, -0.05],
      groundOnY0: true,
      grainScale: 2.0,
      inkStrength: 0.9,
    });
    g.add(skull);

    const tumour = createTumourClonalSphere3D(0.5, 0.5, 0.65, 0.58);
    tumour.position.set(1.52, 0.0, 0.18);
    g.add(tumour);
  }

  public setPage(page: ClinicPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as ClinicPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist =
      page === 'hominin' ? 7.4 : page === 'ooa' || page === 'check' ? 10.6 : page === 'hgt' ? 9.4 : 8.6;
    this.targetAzimuth = page === 'hominin' ? 0.18 : 0.22;
    this.targetPolar = page === 'mic' || page === 'ooa' ? 0.64 : page === 'hominin' ? 0.26 : 0.44;
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
      this.targetPolar = Math.max(0.12, Math.min(1.28, this.targetPolar - (e.clientY - this.lastY) * 0.006));
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
    this.camera.lookAt(0, this.activePage === 'hominin' ? 0.92 : 0.45, 0);

    if (this.activePage === 'hgt') {
      this.p2Group.position.y = Math.sin(t * 1.1) * 0.04;
    } else if (this.activePage === 'hominin') {
      this.p4Group.rotation.y = Math.sin(t * 0.35) * 0.18;
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
