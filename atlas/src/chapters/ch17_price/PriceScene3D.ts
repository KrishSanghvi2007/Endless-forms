// =============================================================================
// Chapter 17: The Price Equation, Fisher's Theorem & The Commons — 3D Plates
// Museum-Grade Naturalist Watercolour & Sepia-Ink 3D Craft
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import { createRockPocketMouse3D } from '../../3d/organisms';
import type {
  CommonsResult,
  FtnsResult,
  HamiltonPriceResult,
  WeakStrongResult,
} from './priceMath';

export type PricePageId = 'commons' | 'price' | 'ftns' | 'hamilton_price' | 'weak_strong' | 'check';

export class PriceScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<PricePageId, THREE.Group>;
  private activePage: PricePageId = 'commons';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 9.4;
  private targetAzimuth = 0.22;
  private targetPolar = 0.5;
  private curAzimuth = 0.22;
  private curPolar = 0.5;
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
      commons: new THREE.Group(),
      price: new THREE.Group(),
      ftns: new THREE.Group(),
      hamilton_price: new THREE.Group(),
      weak_strong: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.commons.add(this.p1Group);
    this.pageGroups.price.add(this.p2Group);
    this.pageGroups.ftns.add(this.p3Group);
    this.pageGroups.hamilton_price.add(this.p4Group);
    this.pageGroups.weak_strong.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('commons');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  private buildHaystackMound(radius: number, coopShare: number): THREE.Group {
    const m = new THREE.Group();
    const hayMat = createNaturalistMaterial(
      { base: '#d6b66f', wash: '#b08e45', deep: '#6e541f', highlight: '#f5e2ad', ink: '#4a3610' },
      'strata',
      { roughness: 0.92, inkStrength: 0.48, seed: 1701 }
    );
    const coopMat = createNaturalistMaterial(
      { base: '#4d8a6a', wash: '#2f664a', deep: '#163d29', highlight: '#99cfb1', ink: '#0e291b' },
      'botanical',
      { roughness: 0.78, inkStrength: 0.52, seed: 1702 }
    );
    const cheatMat = createNaturalistMaterial(
      { base: '#c2463d', wash: '#962921', deep: '#57110c', highlight: '#f09992', ink: '#3b0906' },
      'fruit',
      { roughness: 0.76, inkStrength: 0.52, seed: 1703 }
    );

    // Sculpted domed straw haystack mound
    const domeGeo = new THREE.SphereGeometry(radius, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.56);
    domeGeo.scale(1.0, 0.74, 1.0);
    const dome = new THREE.Mesh(domeGeo, hayMat);
    dome.castShadow = true;
    dome.receiveShadow = true;
    m.add(dome);

    // Populate sculpted cooperator (emerald) vs selfish cheater (crimson) colonists around the haystack!
    const nCol = Math.max(4, Math.min(12, Math.round(radius * 12)));
    const nCoop = Math.round(nCol * coopShare);
    for (let i = 0; i < nCol; i++) {
      const ang = (i / nCol) * Math.PI * 2;
      const isCoop = i < nCoop;
      const rRing = radius * 0.68;
      const cell = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 8),
        isCoop ? coopMat : cheatMat
      );
      cell.scale.set(1.0, 0.85, 1.35);
      cell.position.set(Math.cos(ang) * rRing, radius * 0.44 + (i % 2) * 0.08, Math.sin(ang) * rRing);
      cell.rotation.y = -ang;
      cell.castShadow = true;
      m.add(cell);
    }

    return m;
  }

  // ===========================================================================
  // PAGE 1: THE COMMONS — 6 MEADOW HAYSTACKS & FLOOD DISPERSAL
  // ===========================================================================

  public updateCommons(res: CommonsResult): void {
    this.p1Group.clear();
    const g = this.p1Group;

    const coords: [number, number][] = [
      [-1.75, -0.78],
      [0.0, -0.92],
      [1.75, -0.78],
      [-1.65, 0.78],
      [0.0, 0.92],
      [1.65, 0.78],
    ];
    const maxW = Math.max(1, ...res.groups.map((gr) => gr.groupFitness));

    res.groups.forEach((gr, idx) => {
      const [x, z] = coords[idx]!;
      const normSize = 0.44 + (gr.groupFitness / maxW) * 0.46;
      const mound = this.buildHaystackMound(normSize, gr.endFreq);
      mound.position.set(x, 0.02, z);
      g.add(mound);
    });
  }

  // ===========================================================================
  // PAGE 2: LIVE PRICE EQUATION DECOMPOSITION (Between vs Within + Net Change)
  // ===========================================================================

  public updatePrice(res: CommonsResult): void {
    this.p2Group.clear();
    const g = this.p2Group;

    const baseMat = createNaturalistMaterial(
      { base: '#e0d3b8', wash: '#c2b18f', deep: '#827152', highlight: '#f7f1e3' },
      'strata',
      { roughness: 0.9, transparent: true, opacity: 0.36, inkStrength: 0.42, seed: 1720 }
    );
    const betweenMat = createNaturalistMaterial(
      { base: '#498c6b', wash: '#2b6649', deep: '#133d28', highlight: '#94cfb2' },
      'botanical',
      { roughness: 0.78, inkStrength: 0.5, seed: 1721 }
    );
    const withinMat = createNaturalistMaterial(
      { base: '#c44b42', wash: '#962b23', deep: '#57120d', highlight: '#f29e97' },
      'fruit',
      { roughness: 0.78, inkStrength: 0.5, seed: 1722 }
    );
    const netMat = createNaturalistMaterial(
      { base: '#d49d35', wash: '#ab7415', deep: '#664106', highlight: '#f7d88b' },
      'keratin',
      { roughness: 0.68, inkStrength: 0.5, seed: 1723 }
    );

    // Zero-line horizontal brass datum plane
    const datum = new THREE.Mesh(new THREE.CylinderGeometry(2.15, 2.22, 0.06, 36), baseMat);
    datum.position.y = 0.85;
    datum.receiveShadow = true;
    g.add(datum);

    const buildPillar = (x: number, val: number, mat: THREE.Material) => {
      const h = Math.max(0.08, Math.min(1.45, Math.abs(val) * 3.8));
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, h, 24), mat);
      cyl.position.set(x, val >= 0 ? 0.88 + h / 2 : 0.82 - h / 2, 0);
      cyl.castShadow = true;
      cyl.receiveShadow = true;
      g.add(cyl);
    };

    // Left: Between-Group Cov(W, p)/W_bar (positive!), Middle: Within-Group E(W*dp)/W_bar (negative!), Right: Net delta_p!
    buildPillar(-1.25, res.betweenTerm, betweenMat);
    buildPillar(0.0, res.withinTerm, withinMat);
    buildPillar(1.25, res.deltaP, netMat);
  }

  // ===========================================================================
  // PAGE 3: FISHER'S FUNDAMENTAL THEOREM (V_A Consumption & Fitness Climb)
  // ===========================================================================

  public updateFtns(res: FtnsResult): void {
    this.p3Group.clear();
    const g = this.p3Group;

    const vaMat = createNaturalistMaterial(
      { base: '#4c7ea1', wash: '#2d5c7d', deep: '#16354d', highlight: '#96c2e0' },
      'scale',
      { roughness: 0.78, inkStrength: 0.5, seed: 1731 }
    );
    const partialMat = createNaturalistMaterial(
      { base: '#4f8c66', wash: '#306644', deep: '#163d25', highlight: '#9ad1af' },
      'botanical',
      { roughness: 0.78, inkStrength: 0.48, seed: 1732 }
    );
    const totalMat = createNaturalistMaterial(
      { base: '#c45b42', wash: '#963923', deep: '#571a0c', highlight: '#f2a896' },
      'keratin',
      { roughness: 0.78, inkStrength: 0.48, seed: 1733 }
    );

    // 3D Sculpted Ribbons across 16 generations:
    // Back ribbon: Partial Fitness Climb (Fisher FTNS: always non-decreasing!)
    // Front ribbon: Realized Mean Fitness (can dip if environmental decay > V_A/w!)
    const partialPts: THREE.Vector3[] = [];
    const totalPts: THREE.Vector3[] = [];
    for (let i = 0; i < res.partialFitnessSeries.length; i++) {
      const x = -2.0 + (i / 16) * 4.0;
      partialPts.push(new THREE.Vector3(x, 0.25 + (res.partialFitnessSeries[i]! - 0.5) * 0.72, -0.55));
      totalPts.push(new THREE.Vector3(x, 0.25 + (res.totalFitnessSeries[i]! - 0.5) * 0.72, 0.45));
    }

    const partialRibbon = new THREE.Mesh(
      createOrganicLoftGeometry(new THREE.CatmullRomCurve3(partialPts), () => 0.085, {
        tubularSegs: 40,
        radialSegs: 12,
      }),
      partialMat
    );
    partialRibbon.castShadow = true;
    g.add(partialRibbon);

    const totalRibbon = new THREE.Mesh(
      createOrganicLoftGeometry(new THREE.CatmullRomCurve3(totalPts), () => 0.085, {
        tubularSegs: 40,
        radialSegs: 12,
      }),
      totalMat
    );
    totalRibbon.castShadow = true;
    g.add(totalRibbon);

    // Additive Genetic Variance (V_A) pillars shrinking as selection consumes variance!
    for (let i = 0; i <= 16; i += 2) {
      const x = -2.0 + (i / 16) * 4.0;
      const h = Math.max(0.05, res.vaSeries[i]! * 3.8);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, h, 14), vaMat);
      col.position.set(x, h / 2, -0.05);
      col.castShadow = true;
      g.add(col);
    }
  }

  // ===========================================================================
  // PAGE 4: HAMILTON'S RULE VIA PRICE EQUATION (Relatedness Slope r)
  // ===========================================================================

  public updateHamiltonPrice(res: HamiltonPriceResult): void {
    this.p4Group.clear();
    const g = this.p4Group;

    const lineMat = createNaturalistMaterial(
      res.spreads
        ? { base: '#4d8a6a', wash: '#2f664a', deep: '#163d29', highlight: '#99cfb1' }
        : { base: '#b84840', wash: '#8c2a23', deep: '#52120d', highlight: '#eb9791' },
      'keratin',
      { roughness: 0.7, inkStrength: 0.5, seed: 1741 }
    );

    // Tilted 3D regression beam whose vertical tilt equals relatedness slope r = Cov(G', G) / Var(G)!
    const slopeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.75, 0.9 - res.r * 0.72, 0),
      new THREE.Vector3(0, 0.9, 0),
      new THREE.Vector3(1.75, 0.9 + res.r * 0.72, 0),
    ]);
    const beam = new THREE.Mesh(
      createOrganicLoftGeometry(slopeCurve, () => 0.065, { tubularSegs: 24, radialSegs: 12 }),
      lineMat
    );
    beam.castShadow = true;
    g.add(beam);

    // Sculpted watercolour rodent/squirrel pairs perched along the genotype regression slope!
    for (let i = -2; i <= 2; i++) {
      const frac = (i + 2) / 4;
      const pt = slopeCurve.getPointAt(frac);
      const m = createRockPocketMouse3D(i < 0, 1.05);
      m.position.set(pt.x, pt.y + 0.05, 0);
      m.rotation.y = 0.65;
      g.add(m);
    }
  }

  // ===========================================================================
  // PAGE 5: WEAK ALTRUISM vs STRONG ALTRUISM (Random Group Size k & Assortment)
  // ===========================================================================

  public updateWeakStrong(res: WeakStrongResult): void {
    this.p5Group.clear();
    const g = this.p5Group;

    // Single focal group of size k perched on a mossy meadow stone!
    const padMat = createNaturalistMaterial(
      { base: '#799962', wash: '#557340', deep: '#2f4520', highlight: '#b8d4a3' },
      'botanical',
      { roughness: 0.9, inkStrength: 0.45, seed: 1751 }
    );
    const padR = 0.85 + res.groupSizeK * 0.14;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(padR, padR * 1.08, 0.18, 32), padMat);
    pad.position.y = 0.09;
    pad.receiveShadow = true;
    pad.castShadow = true;
    g.add(pad);

    const nAltruist = Math.max(1, Math.round(1 + res.assortmentR * (res.groupSizeK - 1)));
    for (let i = 0; i < res.groupSizeK; i++) {
      const ang = (i / res.groupSizeK) * Math.PI * 2;
      const r = res.groupSizeK <= 2 ? 0.42 : padR * 0.56;
      const isAlt = i < nAltruist;
      const mouse = createRockPocketMouse3D(!isAlt, 1.15);
      mouse.position.set(Math.cos(ang) * r, 0.18, Math.sin(ang) * r);
      mouse.rotation.y = -ang + Math.PI / 2;
      g.add(mouse);
    }
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const m1 = this.buildHaystackMound(0.68, 0.88);
    m1.position.set(-1.35, 0.02, 0.1);
    g.add(m1);
    const m2 = this.buildHaystackMound(0.45, 0.15);
    m2.position.set(1.35, 0.02, 0.1);
    g.add(m2);
    const hero = createRockPocketMouse3D(false, 1.55);
    hero.position.set(0, 0.02, 0.35);
    hero.rotation.y = 0.55;
    g.add(hero);
  }

  public setPage(page: PricePageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as PricePageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'commons' ? 10.2 : page === 'ftns' ? 9.6 : 8.8;
    this.targetAzimuth = page === 'ftns' ? 0.28 : 0.2;
    this.targetPolar = page === 'commons' || page === 'weak_strong' ? 0.56 : 0.42;
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

    if (this.activePage === 'price') {
      this.p2Group.rotation.y = Math.sin(t * 0.3) * 0.08;
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
