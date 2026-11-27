// =============================================================================
// Chapter 14: Strata, Fossils & Mass Extinctions — Naturalist 3D Museum Plates
// 1. Sculpted Logarithmic Ammonite Deep-Time Spiral (3.8 Ga -> Present)
// 2. Volcanic Zircon/Feldspar Crystal Cluster (Radiometric Half-Lives)
// 3. Ellesmere Island Devonian Sandstone Slab & Tiktaalik roseae Fossil (375 Ma)
// 4. Live Morphing Cetacean Skeleton (Pakicetus -> Ambulocetus -> Dorudon -> Whale)
// 5. Stratified K-Pg Boundary Cliff (Ammonites -> Iridium Clay -> Mammal Radiation)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  setupNaturalistLighting,
} from '../../3d/naturalistCraft';
import {
  createAmmoniteSpiral3D,
  createMineralCrystalCluster3D,
  createTiktaalikFossil3D,
  createWhaleTransitionSkeleton3D,
} from '../../3d/naturalistSpecimens';
import type { ExtinctionInfo, RadiometricResult } from './deeptimeMath';

export type DeepTimePageId = 'spiral' | 'radio' | 'tiktaalik' | 'whales' | 'extinction' | 'check';

export class DeepTimeScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private pageGroups: Record<DeepTimePageId, THREE.Group>;
  private activePage: DeepTimePageId = 'spiral';

  private p1Group = new THREE.Group();
  private p2Group = new THREE.Group();
  private p3Group = new THREE.Group();
  private p4Group = new THREE.Group();
  private p5Group = new THREE.Group();

  private fitDist = 8.4;
  private targetAzimuth = 0.22;
  private targetPolar = 0.56;
  private curAzimuth = 0.22;
  private curPolar = 0.56;
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
      spiral: new THREE.Group(),
      radio: new THREE.Group(),
      tiktaalik: new THREE.Group(),
      whales: new THREE.Group(),
      extinction: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.pageGroups.spiral.add(this.p1Group);
    this.pageGroups.radio.add(this.p2Group);
    this.pageGroups.tiktaalik.add(this.p3Group);
    this.pageGroups.whales.add(this.p4Group);
    this.pageGroups.extinction.add(this.p5Group);
    this.buildPage6Check();

    this.setPage('spiral');
    this.bindInput();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  public updateSpiral(spiralFrac: number): void {
    this.p1Group.clear();
    const ammonite = createAmmoniteSpiral3D(spiralFrac, 1.32);
    ammonite.position.set(0, 0.05, 0);
    this.p1Group.add(ammonite);
  }

  public updateRadiometric(res: RadiometricResult): void {
    this.p2Group.clear();
    const cluster = createMineralCrystalCluster3D(res.parentFraction, 1.55);
    cluster.position.set(0, 0.02, 0);
    this.p2Group.add(cluster);
  }

  public updateTiktaalik(strataStage: 'older_385' | 'tiktaalik_375' | 'younger_365'): void {
    this.p3Group.clear();
    const slab = createTiktaalikFossil3D(strataStage, 1.18);
    slab.position.set(0, 0.04, 0);
    this.p3Group.add(slab);
  }

  public updateWhale(stage: number): void {
    this.p4Group.clear();
    const whale = createWhaleTransitionSkeleton3D(stage, 0.92);
    whale.position.set(-0.38, 0.14, 0);
    this.p4Group.add(whale);
  }

  public updateExtinction(info: ExtinctionInfo): void {
    this.p5Group.clear();
    const g = this.p5Group;

    // Sculpted 3-layer geological cliff core with thin glowing Iridium / Ash boundary seam!
    const strataSpecs: { y: number; h: number; pal: { base: string; wash: string; deep: string; highlight: string } }[] = [
      { y: 0.35, h: 0.68, pal: { base: '#b59d78', wash: '#8c7552', deep: '#54442b', highlight: '#dfd0b4' } },
      {
        y: 0.76,
        h: 0.12,
        pal:
          info.id === 'kpg'
            ? { base: '#c94c38', wash: '#9c2d1e', deep: '#5e140c', highlight: '#eb9a88' }
            : { base: '#6e5248', wash: '#4d362e', deep: '#2b1b16', highlight: '#9e8278' },
      },
      { y: 1.16, h: 0.66, pal: { base: '#8ba38e', wash: '#647d67', deep: '#3b4f3d', highlight: '#c2d6c4' } },
    ];

    strataSpecs.forEach((st) => {
      const geo = new THREE.CylinderGeometry(1.55, 1.62, st.h, 36, 4);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const n = 1 + 0.04 * Math.sin(x * 3.5 + z * 2.9);
        pos.setX(i, x * n);
        pos.setZ(i, z * n);
      }
      geo.computeVertexNormals();
      const mesh = new THREE.Mesh(
        geo,
        createNaturalistMaterial(st.pal, 'strata', { roughness: 0.9, bumpScale: 0.03, inkStrength: 0.5 })
      );
      mesh.position.y = st.y;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      g.add(mesh);
    });

    // Ammonite fossil resting cleanly beside the lower Cretaceous stratum (extinct at boundary!)
    const preAmmonite = createAmmoniteSpiral3D(0.95, 0.55);
    preAmmonite.position.set(-1.55, 0.02, 0.92);
    g.add(preAmmonite);

    // Post-extinction vertebrate survivor crown atop the upper Paleogene stratum!
    const survivorWhale = createWhaleTransitionSkeleton3D(0.08, 0.48);
    survivorWhale.position.set(0, 1.52, 0);
    g.add(survivorWhale);
  }

  private buildPage6Check(): void {
    const g = this.pageGroups.check;
    const amm = createAmmoniteSpiral3D(0.9, 0.72);
    amm.position.set(-1.45, 0.04, 0.1);
    g.add(amm);

    const whale = createWhaleTransitionSkeleton3D(0.66, 0.58);
    whale.position.set(0.65, 0.14, 0.0);
    g.add(whale);
  }

  public setPage(page: DeepTimePageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as DeepTimePageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });
    this.fitDist = page === 'whales' ? 10.6 : page === 'check' ? 10.2 : page === 'tiktaalik' ? 8.6 : page === 'extinction' ? 9.4 : 8.8;
    this.targetAzimuth = page === 'whales' ? 0.14 : 0.24;
    this.targetPolar = page === 'tiktaalik' ? 0.85 : page === 'whales' ? 0.28 : 0.56;
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
      this.targetPolar = Math.max(0.14, Math.min(1.32, this.targetPolar - (e.clientY - this.lastY) * 0.006));
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
    this.camera.lookAt(0, this.activePage === 'extinction' ? 0.72 : 0.45, 0);

    if (this.activePage === 'spiral') {
      this.p1Group.rotation.y = Math.sin(t * 0.25) * 0.12;
    } else if (this.activePage === 'radio') {
      this.p2Group.rotation.y = t * 0.18;
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
