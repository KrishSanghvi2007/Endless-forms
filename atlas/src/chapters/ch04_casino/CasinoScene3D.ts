// =============================================================================
// Chapter 4: Drift Casino — 3D Museum Naturalist Dioramas (Three.js)
// Wright–Fisher Jars · Buri's Drosophila Vials & Ne · 12-Allele Volcano
// Drift vs. Selection (4Nes) · 3D Kingman Coalescent Genealogy Tower
// =============================================================================

import * as THREE from 'three';
import {
  JEWEL_ALLELES,
  type BottleneckResult,
  type CoalescentTreeData,
  type EffectiveSizeSummary,
  type JarState,
  type TugRun,
} from './casinoMath';

export type CasinoPageId = 'jars' | 'buri' | 'volcano' | 'tug' | 'coalescent' | 'check';

const COL_A = 0x2f5fd0; // D4 cobalt blue allele A
const COL_a = 0xe8b416; // D4 golden amber allele a
const COL_BRASS = 0xb88e42;

// =============================================================================
// PROCEDURAL MUSEUM TEXTURES & ENGRAVED PLAQUES
// =============================================================================

function createWalnutTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5c3e26';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(34,20,10,0.22)' : 'rgba(135,95,58,0.14)';
    ctx.lineWidth = 1 + (i % 4);
    ctx.beginPath();
    const y = (i / 60) * 256;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + Math.sin(i) * 5, 170, y - Math.cos(i) * 5, 256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function createLagoonTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createRadialGradient(256, 256, 40, 256, 256, 280);
  grad.addColorStop(0, '#72b8b6');
  grad.addColorStop(0.55, '#4c969b');
  grad.addColorStop(1, '#316b75');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = 'rgba(255,255,255,0.16)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    ctx.beginPath();
    const y = 20 + i * 21;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(170, y + Math.sin(i) * 8, 340, y - Math.cos(i) * 8, 512, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createEngravedPlaque(
  title: string,
  subtitle?: string,
  width = 1.5,
  accentHex = '#29211b'
): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = subtitle ? 168 : 112;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = '#f8f2e4';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#9c8669';
  ctx.lineWidth = 7;
  ctx.strokeRect(10, 10, c.width - 20, c.height - 20);

  ctx.fillStyle = accentHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = subtitle ? '700 42px Georgia, serif' : '700 46px Georgia, serif';
  ctx.fillText(title, c.width / 2, subtitle ? 64 : c.height / 2, c.width - 56);

  if (subtitle) {
    ctx.fillStyle = '#6c5c4b';
    ctx.font = '500 27px "IBM Plex Mono", monospace';
    ctx.fillText(subtitle, c.width / 2, 122, c.width - 56);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const height = width * (c.height / c.width);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

// =============================================================================
// MAIN 3D ENGINE FOR CHAPTER 4 (DRIFT CASINO)
// =============================================================================

export class CasinoScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private walnutMat: THREE.MeshStandardMaterial;
  private brassMat: THREE.MeshStandardMaterial;
  private glassMat: THREE.MeshPhysicalMaterial;
  private matA: THREE.MeshPhysicalMaterial;
  private mat_a: THREE.MeshPhysicalMaterial;

  private pageGroups: Record<CasinoPageId, THREE.Group>;
  private activePage: CasinoPageId = 'jars';

  // --- Page 1: 6 Crystal Wright–Fisher Jars ---
  private p1JarContents: THREE.Group[] = [];
  private p1JarHalos: THREE.Mesh[] = [];

  // --- Page 2: Buri's Drosophila Vials + Harem Sex-Ratio Plinth ---
  private p2VialBars: THREE.Mesh[] = [];
  private p2HaremGroup = new THREE.Group();
  private p2NePillar!: THREE.Mesh;
  private p2TargetNeH = 1.6;

  // --- Page 3: 3D Volcanic Archipelago + 12-Allele Jewel Bowls ---
  private p3IslandJewelGroup = new THREE.Group();
  private p3LavaLight!: THREE.Mesh;
  private p3EruptT = 0;

  // --- Page 4: Drift vs Selection 3D Ribbons + Kimura P(fix) Pillar ---
  private p4TrackGroup = new THREE.Group();
  private p4KimuraBar!: THREE.Mesh;
  private p4TargetKimH = 0.8;

  // --- Page 5: 3D Kingman Coalescent Genealogy Tower ---
  private p5TreeGroup = new THREE.Group();
  private p5PinchRing!: THREE.Mesh;

  // Camera orbit state
  private fitDist = 8.8;
  private targetAzimuth = 0.06;
  private targetPolar = 0.56;
  private curAzimuth = 0.06;
  private curPolar = 0.56;
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
    this.renderer.toneMappingExposure = 1.08;
    this.host.appendChild(this.renderer.domElement);

    // Warm museum lighting
    this.scene.add(new THREE.HemisphereLight(0xfff9ee, 0xd8cdb8, 1.0));
    const key = new THREE.DirectionalLight(0xfff4df, 1.38);
    key.position.set(5.5, 9.5, 6.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 26;
    const d = 5.8;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xd9e9f5, 0.44);
    fill.position.set(-6, 4.5, -4);
    this.scene.add(fill);

    const shadowFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.ShadowMaterial({ opacity: 0.13 })
    );
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = -0.01;
    shadowFloor.receiveShadow = true;
    this.scene.add(shadowFloor);

    this.walnutMat = new THREE.MeshStandardMaterial({
      map: createWalnutTexture(),
      roughness: 0.56,
      metalness: 0.08,
    });
    this.brassMat = new THREE.MeshStandardMaterial({
      color: COL_BRASS,
      roughness: 0.3,
      metalness: 0.72,
    });
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.12,
      transmission: 0.52,
      transparent: true,
      opacity: 0.34,
      clearcoat: 0.85,
    });
    this.matA = new THREE.MeshPhysicalMaterial({
      color: COL_A,
      roughness: 0.22,
      clearcoat: 0.75,
    });
    this.mat_a = new THREE.MeshPhysicalMaterial({
      color: COL_a,
      roughness: 0.22,
      clearcoat: 0.75,
    });

    this.pageGroups = {
      jars: new THREE.Group(),
      buri: new THREE.Group(),
      volcano: new THREE.Group(),
      tug: new THREE.Group(),
      coalescent: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((grp) => this.scene.add(grp));

    this.buildPage1Jars();
    this.buildPage2Buri();
    this.buildPage3Volcano();
    this.buildPage4Tug();
    this.buildPage5Coalescent();

    this.setPage('jars');
    this.bindPointerControls();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // =========================================================================
  // PAGE 1: 6 PARALLEL WRIGHT–FISHER CRYSTAL SPECIMEN JARS
  // =========================================================================

  private buildPage1Jars(): void {
    const g = this.pageGroups.jars;

    const tray = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.16, 2.95), this.walnutMat);
    tray.position.set(0, 0.08, 0);
    tray.castShadow = true;
    g.add(tray);

    const felt = new THREE.Mesh(
      new THREE.BoxGeometry(5.34, 0.175, 2.7),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    felt.position.set(0, 0.085, 0);
    felt.receiveShadow = true;
    g.add(felt);

    const corkMat = new THREE.MeshStandardMaterial({ color: 0xa47a4c, roughness: 0.88 });
    this.p1JarContents = [];
    this.p1JarHalos = [];

    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = -1.65 + col * 1.65;
      const z = -0.62 + row * 1.24;

      // Brass fixation halo ring on felt (lights up when jar hits fixation/loss!)
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.45, 0.54, 28),
        new THREE.MeshBasicMaterial({ color: COL_BRASS, side: THREE.DoubleSide, transparent: true, opacity: 0.0 })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(x, 0.18, z);
      this.p1JarHalos.push(halo);
      g.add(halo);

      // Crystal jar cylinder + brass collar + cork stopper
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.40, 0.42, 1.05, 22), this.glassMat);
      jar.position.set(x, 0.70, z);
      g.add(jar);

      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.032, 10, 24), this.brassMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.set(x, 1.22, z);
      g.add(rim);

      const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.25, 0.18, 16), corkMat);
      cork.position.set(x, 1.29, z);
      cork.castShadow = true;
      g.add(cork);

      const content = new THREE.Group();
      content.position.set(x, 0.22, z);
      this.p1JarContents.push(content);
      g.add(content);
    }

    const pTitle = createEngravedPlaque('6 Wright–Fisher Jars', 'parallel neutral drift runs', 1.85, '#7a3552');
    pTitle.position.set(0, 0.03, 1.88);
    g.add(pTitle);
  }

  public updateJarsScene(jars: JarState[]): void {
    const pearlGeo = new THREE.SphereGeometry(0.085, 10, 8);
    jars.forEach((jar, idx) => {
      const grp = this.p1JarContents[idx];
      if (!grp) return;
      while (grp.children.length > 0) grp.remove(grp.children[0]);

      const totalPearls = 20;
      const nBlue = Math.round(jar.p * totalPearls);
      for (let k = 0; k < totalPearls; k++) {
        const layer = Math.floor(k / 5);
        const slot = k % 5;
        const ang = (slot / 5) * Math.PI * 2 + layer * 0.6;
        const rad = slot === 0 && layer % 2 === 0 ? 0.04 : 0.21;
        const mesh = new THREE.Mesh(pearlGeo, k < nBlue ? this.matA : this.mat_a);
        mesh.position.set(Math.cos(ang) * rad, 0.08 + layer * 0.19, Math.sin(ang) * rad);
        mesh.castShadow = true;
        grp.add(mesh);
      }

      const halo = this.p1JarHalos[idx];
      const hMat = halo.material as THREE.MeshBasicMaterial;
      if (jar.status === 'fixedA') {
        hMat.color.setHex(COL_A);
        hMat.opacity = 0.85;
      } else if (jar.status === 'lostA') {
        hMat.color.setHex(COL_a);
        hMat.opacity = 0.85;
      } else {
        hMat.opacity = 0.0;
      }
    });
  }

  // =========================================================================
  // PAGE 2: BURI'S 107 DROSOPHILA BOTTLES + HAREM SEX-RATIO Ne PLINTH
  // =========================================================================

  private buildPage2Buri(): void {
    const g = this.pageGroups.buri;

    // Left rack: 12 glass Drosophila culture vials (Buri 1956!)
    const rack = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 2.55), this.walnutMat);
    rack.position.set(-1.35, 0.08, 0);
    rack.castShadow = true;
    g.add(rack);

    const cottonMat = new THREE.MeshStandardMaterial({ color: 0xf6f1e6, roughness: 0.95 });
    this.p2VialBars = [];

    for (let i = 0; i < 12; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = -2.42 + col * 0.72;
      const z = -0.75 + row * 0.75;

      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.95, 16), this.glassMat);
      glass.position.set(x, 0.64, z);
      g.add(glass);

      const plug = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), cottonMat);
      plug.scale.set(1, 0.72, 1);
      plug.position.set(x, 1.14, z);
      g.add(plug);

      // Amber base + blue allele fill bar inside vial
      const baseFill = new THREE.Mesh(
        new THREE.CylinderGeometry(0.165, 0.165, 0.72, 14),
        new THREE.MeshStandardMaterial({ color: COL_a, roughness: 0.45 })
      );
      baseFill.position.set(x, 0.52, z);
      g.add(baseFill);

      const blueBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.175, 0.175, 0.72, 14),
        this.matA
      );
      blueBar.position.set(x, 0.52, z);
      this.p2VialBars.push(blueBar);
      g.add(blueBar);
    }

    // Right plinth: Sex-Ratio Harem + Census N vs Effective Ne comparison column
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.65, 0.16, 2.55), this.walnutMat);
    plinth.position.set(2.05, 0.08, 0);
    plinth.castShadow = true;
    g.add(plinth);

    const pad = new THREE.Mesh(
      new THREE.BoxGeometry(2.42, 0.175, 2.32),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    pad.position.set(2.05, 0.085, 0);
    g.add(pad);

    g.add(this.p2HaremGroup);

    // Translucent Ghost Census N=20 cylinder on right edge + live emerald Ne pillar inside!
    const censusGhost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 1.8, 20),
      new THREE.MeshPhysicalMaterial({
        color: 0x8f8270,
        transparent: true,
        opacity: 0.22,
        roughness: 0.4,
      })
    );
    censusGhost.position.set(2.82, 1.07, 0);
    g.add(censusGhost);

    this.p2NePillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 1.0, 20),
      new THREE.MeshPhysicalMaterial({ color: 0x9a4768, roughness: 0.25, clearcoat: 0.65 })
    );
    this.p2NePillar.position.set(2.82, 0.67, 0);
    this.p2NePillar.castShadow = true;
    g.add(this.p2NePillar);

    const pBuri = createEngravedPlaque('Buri’s Fly Vials', 'N = 16 · Ne ≈ 11.5', 1.62, '#2f5fd0');
    pBuri.position.set(-1.35, 0.03, 1.68);
    const pSex = createEngravedPlaque('Sex-Ratio Ne', '4·Nm·Nf / (Nm + Nf)', 1.68, '#8a3558');
    pSex.position.set(2.05, 0.03, 1.68);
    g.add(pBuri, pSex);
    g.position.x = -0.3;
  }

  public updateBuriScene(summary: EffectiveSizeSummary): void {
    // Update Buri vials
    summary.vialsBuri.forEach((p, idx) => {
      const bar = this.p2VialBars[idx];
      if (!bar) return;
      const h = Math.max(0.04, p);
      bar.scale.y = h;
      bar.position.y = 0.16 + h * 0.36;
    });

    // Update Harem pawns (20 total: Nm cobalt males on left, Nf rose-amber females on right)
    while (this.p2HaremGroup.children.length > 0) {
      this.p2HaremGroup.remove(this.p2HaremGroup.children[0]);
    }
    const maleMat = this.matA;
    const femMat = new THREE.MeshPhysicalMaterial({ color: 0xc9524b, roughness: 0.28, clearcoat: 0.55 });
    const pawnGeo = new THREE.CapsuleGeometry(0.068, 0.16, 6, 10);

    for (let i = 0; i < summary.censusN; i++) {
      const isMale = i < summary.nm;
      const col = i % 4;
      const row = Math.floor(i / 4);
      const pawn = new THREE.Mesh(pawnGeo, isMale ? maleMat : femMat);
      pawn.position.set(1.12 + col * 0.34, 0.34, -0.82 + row * 0.41);
      pawn.castShadow = true;
      this.p2HaremGroup.add(pawn);
    }

    this.p2TargetNeH = Math.max(0.12, (summary.neSexRatio / summary.censusN) * 1.8);
  }

  // =========================================================================
  // PAGE 3: 3D VOLCANIC ISLAND ARCHIPELAGO + 12-ALLELE JEWEL BOWLS
  // =========================================================================

  private buildPage3Volcano(): void {
    const g = this.pageGroups.volcano;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.16, 3.35), this.walnutMat);
    frame.position.set(0, 0.08, 0);
    frame.castShadow = true;
    g.add(frame);

    const sea = new THREE.Mesh(
      new THREE.BoxGeometry(5.36, 0.175, 3.1),
      new THREE.MeshStandardMaterial({ map: createLagoonTexture(), roughness: 0.32, metalness: 0.12 })
    );
    sea.position.set(0, 0.085, 0);
    sea.receiveShadow = true;
    g.add(sea);

    // Left: Mainland Lush Island with all 12 jewel alleles intact!
    const mainland = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.24, 0.24, 28),
      new THREE.MeshStandardMaterial({ color: 0x7da166, roughness: 0.88 })
    );
    mainland.position.set(-1.42, 0.22, 0.05);
    mainland.receiveShadow = true;
    g.add(mainland);

    const jewelGeo = new THREE.OctahedronGeometry(0.115, 0);
    JEWEL_ALLELES.forEach((al, idx) => {
      const ang = (idx / 12) * Math.PI * 2;
      const rad = idx < 4 ? 0.36 : 0.78;
      const jewel = new THREE.Mesh(
        jewelGeo,
        new THREE.MeshPhysicalMaterial({ color: al.hex, roughness: 0.18, clearcoat: 0.85 })
      );
      jewel.position.set(-1.42 + Math.cos(ang) * rad, 0.44, 0.05 + Math.sin(ang) * rad);
      jewel.castShadow = true;
      g.add(jewel);
    });

    // Center-back: Dark Basalt Volcano Cone with glowing amber lava crater!
    const volcano = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.76, 1.22, 18),
      new THREE.MeshStandardMaterial({ color: 0x3b3532, roughness: 0.92 })
    );
    volcano.position.set(0.15, 0.74, -0.78);
    volcano.castShadow = true;
    g.add(volcano);

    this.p3LavaLight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.20, 0.18, 0.06, 16),
      new THREE.MeshBasicMaterial({ color: 0xf06b22 })
    );
    this.p3LavaLight.position.set(0.15, 1.34, -0.78);
    g.add(this.p3LavaLight);

    // Right: Post-Bottleneck Island where vanished jewel alleles become hollow ghost rings!
    const postIsle = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.24, 0.24, 28),
      new THREE.MeshStandardMaterial({ color: 0xc2b28f, roughness: 0.9 })
    );
    postIsle.position.set(1.42, 0.22, 0.05);
    postIsle.receiveShadow = true;
    g.add(postIsle);

    g.add(this.p3IslandJewelGroup);

    const pMain = createEngravedPlaque('Mainland (12 Alleles)', 'H₀ = 0.88 · K = 12', 1.65, '#2a6b54');
    pMain.position.set(-1.42, 0.03, 2.02);
    const pPost = createEngravedPlaque('Post-Bottleneck', 'rare jewels vanish first', 1.68, '#a63826');
    pPost.position.set(1.42, 0.03, 2.02);
    g.add(pMain, pPost);
  }

  public updateVolcanoScene(res: BottleneckResult, triggerFlash = false): void {
    if (triggerFlash) this.p3EruptT = 1.0;
    while (this.p3IslandJewelGroup.children.length > 0) {
      this.p3IslandJewelGroup.remove(this.p3IslandJewelGroup.children[0]);
    }
    const jewelGeo = new THREE.OctahedronGeometry(0.115, 0);
    const ringGeo = new THREE.RingGeometry(0.08, 0.12, 18);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0x6e6254, side: THREE.DoubleSide, transparent: true, opacity: 0.45 });

    JEWEL_ALLELES.forEach((al, idx) => {
      const ang = (idx / 12) * Math.PI * 2;
      const rad = idx < 4 ? 0.36 : 0.78;
      const x = 1.42 + Math.cos(ang) * rad;
      const z = 0.05 + Math.sin(ang) * rad;

      if (res.counts[idx] > 0) {
        const s = Math.min(1.55, 0.85 + res.freqs[idx] * 2.2);
        const jewel = new THREE.Mesh(
          jewelGeo,
          new THREE.MeshPhysicalMaterial({ color: al.hex, roughness: 0.18, clearcoat: 0.85 })
        );
        jewel.scale.setScalar(s);
        jewel.position.set(x, 0.42 + s * 0.06, z);
        jewel.castShadow = true;
        this.p3IslandJewelGroup.add(jewel);
      } else {
        // Empty ghost socket showing a lost allele!
        const ring = new THREE.Mesh(ringGeo, ghostMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.35, z);
        this.p3IslandJewelGroup.add(ring);
      }
    });
  }

  // =========================================================================
  // PAGE 4: DRIFT VS. SELECTION (4Nes) — 3D TRAJECTORY RIBBONS + KIMURA BAR
  // =========================================================================

  private buildPage4Tug(): void {
    const g = this.pageGroups.tug;

    const board = new THREE.Mesh(new THREE.BoxGeometry(4.35, 0.16, 2.8), this.walnutMat);
    board.position.set(-0.72, 0.08, 0);
    board.castShadow = true;
    g.add(board);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(4.12, 0.175, 2.55),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    floor.position.set(-0.72, 0.085, 0);
    floor.receiveShadow = true;
    g.add(floor);

    g.add(this.p4TrackGroup);

    // Right plinth: Kimura P(fix) emerald pillar vs neutral p0 = 0.15 brass collar!
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.55, 0.16, 2.2), this.walnutMat);
    plinth.position.set(2.48, 0.08, 0);
    plinth.castShadow = true;
    g.add(plinth);

    const ghostMax = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 2.0, 0.68),
      new THREE.MeshPhysicalMaterial({ color: 0x9c8e7c, transparent: true, opacity: 0.16 })
    );
    ghostMax.position.set(2.48, 1.16, 0);
    g.add(ghostMax);

    // Neutral reference ring at p0 = 0.15 -> y = 0.16 + 0.15 * 2.0 = 0.46
    const refRing = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.04, 0.78), this.brassMat);
    refRing.position.set(2.48, 0.46, 0);
    g.add(refRing);

    this.p4KimuraBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 1.0, 0.58),
      new THREE.MeshPhysicalMaterial({ color: 0x2a8a6d, roughness: 0.22, clearcoat: 0.7 })
    );
    this.p4KimuraBar.position.set(2.48, 0.66, 0);
    this.p4KimuraBar.castShadow = true;
    g.add(this.p4KimuraBar);

    const pRuns = createEngravedPlaque('6 Drift + Selection Runs', 'start p₀ = 15%', 1.65, '#2f5fd0');
    pRuns.position.set(-0.72, 0.03, 1.78);
    const pKim = createEngravedPlaque('Kimura P(fix)', 'brass ring = neutral p₀', 1.48, '#1f6a54');
    pKim.position.set(2.48, 0.03, 1.52);
    g.add(pRuns, pKim);
    g.position.x = -0.35;
  }

  public updateTugScene(runs: TugRun[], kimuraP: number): void {
    while (this.p4TrackGroup.children.length > 0) {
      this.p4TrackGroup.remove(this.p4TrackGroup.children[0]);
    }
    runs.forEach((run, idx) => {
      const z = -0.95 + idx * 0.38;
      const pts = run.history.map((p, t) => {
        const x = -2.55 + (t / (run.history.length - 1)) * 3.65;
        return new THREE.Vector3(x, 0.24 + p * 1.65, z);
      });
      const col = run.fixed ? 0x268566 : run.lost ? 0xb8382c : 0x3564c9;
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 36, 0.042, 8, false),
        new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.28, clearcoat: 0.5 })
      );
      tube.castShadow = true;
      this.p4TrackGroup.add(tube);

      const endBall = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 12, 10),
        new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.2, clearcoat: 0.7 })
      );
      endBall.position.copy(pts[pts.length - 1]);
      this.p4TrackGroup.add(endBall);
    });

    this.p4TargetKimH = Math.max(0.06, kimuraP * 2.0);
  }

  // =========================================================================
  // PAGE 5: SCULPTED 3D KINGMAN COALESCENT GENEALOGY TOWER
  // =========================================================================

  private buildPage5Coalescent(): void {
    const g = this.pageGroups.coalescent;

    const base = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.18, 2.25), this.walnutMat);
    base.position.set(0, 0.09, 0);
    base.castShadow = true;
    g.add(base);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(4.86, 0.195, 2.0),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    floor.position.set(0, 0.095, 0);
    floor.receiveShadow = true;
    g.add(floor);

    // Translucent coral Bottleneck Pinch Ring (shown only in bottleneck regime!)
    this.p5PinchRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.55, 0.05, 10, 40),
      new THREE.MeshBasicMaterial({ color: 0xc24234, transparent: true, opacity: 0.55 })
    );
    this.p5PinchRing.rotation.x = Math.PI / 2;
    this.p5PinchRing.position.set(0, 0.82, 0);
    this.p5PinchRing.visible = false;
    g.add(this.p5PinchRing);

    g.add(this.p5TreeGroup);

    const pTree = createEngravedPlaque('Kingman Coalescent (n = 8)', 'present (base) → MRCA (top)', 1.95, '#6e3456');
    pTree.position.set(0, 0.03, 1.56);
    g.add(pTree);
  }

  public updateCoalescentScene(tree: CoalescentTreeData): void {
    while (this.p5TreeGroup.children.length > 0) {
      this.p5TreeGroup.remove(this.p5TreeGroup.children[0]);
    }
    this.p5PinchRing.visible = tree.regime === 'bottleneck';

    const branchMat = new THREE.MeshStandardMaterial({ color: 0xcab897, roughness: 0.42, metalness: 0.22 });
    const leafMat = this.matA;
    const mutMat = new THREE.MeshPhysicalMaterial({ color: 0xc43228, roughness: 0.2, clearcoat: 0.8 });
    const mrcaMat = new THREE.MeshPhysicalMaterial({
      color: 0xe6b432,
      emissive: 0x705008,
      emissiveIntensity: 0.35,
      roughness: 0.22,
      metalness: 0.65,
    });

    // Draw smooth curved 3D coalescent branches + crimson mutation pearls
    tree.edges.forEach((ed) => {
      const yBase = 0.26;
      const p0 = new THREE.Vector3(ed.x1, yBase + ed.y1, 0);
      const pMid = new THREE.Vector3(ed.x1, yBase + ed.y1 + (ed.y2 - ed.y1) * 0.72, 0);
      const p1 = new THREE.Vector3(ed.x2, yBase + ed.y2, 0);
      const curve = new THREE.QuadraticBezierCurve3(p0, pMid, p1);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 14, 0.038, 8, false), branchMat);
      tube.castShadow = true;
      this.p5TreeGroup.add(tube);

      // Ruby mutation pearls (segregating sites S) sitting right on the genealogy branches!
      ed.mutations.forEach((mt) => {
        const mp = curve.getPoint(mt);
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), mutMat);
        pearl.position.copy(mp);
        this.p5TreeGroup.add(pearl);
      });
    });

    // Nodes: 8 cobalt sampled alleles at base, brass coalescent nodes, golden MRCA crown!
    tree.nodes.forEach((nd) => {
      const isLeaf = nd.y < 0.01;
      const rad = nd.isMrca ? 0.145 : isLeaf ? 0.105 : 0.088;
      const mat = nd.isMrca ? mrcaMat : isLeaf ? leafMat : this.brassMat;
      const orb = new THREE.Mesh(new THREE.SphereGeometry(rad, 14, 12), mat);
      orb.position.set(nd.x, 0.26 + nd.y, 0);
      orb.castShadow = true;
      this.p5TreeGroup.add(orb);
    });
  }

  // =========================================================================
  // PAGE 6: CHECK BACKDROPS
  // =========================================================================

  public setCheckCaseBackdrop(caseIdx: number): void {
    this.pageGroups.jars.visible = caseIdx === 0;
    this.pageGroups.buri.visible = caseIdx === 1;
    this.pageGroups.coalescent.visible = caseIdx === 2;
    this.pageGroups.volcano.visible = false;
    this.pageGroups.tug.visible = false;
  }

  // =========================================================================
  // PAGE SWITCHING, CAMERA & ANIMATION
  // =========================================================================

  public setPage(page: CasinoPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as CasinoPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });

    if (page === 'jars') {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.62;
      this.fitDist = 8.9;
    } else if (page === 'buri') {
      this.targetAzimuth = 0.07;
      this.targetPolar = 0.56;
      this.fitDist = 10.2;
    } else if (page === 'volcano') {
      this.targetAzimuth = 0.04;
      this.targetPolar = 0.64;
      this.fitDist = 9.2;
    } else if (page === 'tug') {
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.54;
      this.fitDist = 9.6;
    } else if (page === 'coalescent') {
      this.targetAzimuth = 0.06;
      this.targetPolar = 0.34;
      this.fitDist = 8.6;
    } else {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.54;
      this.fitDist = 9.2;
    }
    this.zoomFactor = 1.0;
    this.resize();
  }

  public resetView(): void {
    this.setPage(this.activePage);
  }

  public resize(): void {
    const w = Math.max(100, this.host.clientWidth);
    const h = Math.max(100, this.host.clientHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private bindPointerControls(): void {
    const el = this.renderer.domElement;
    el.style.cursor = 'grab';
    el.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.targetAzimuth -= dx * 0.0065;
      this.targetPolar = Math.max(0.18, Math.min(1.22, this.targetPolar + dy * 0.0055));
    });
    window.addEventListener('pointerup', () => {
      this.dragging = false;
      el.style.cursor = 'grab';
    });
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomFactor = Math.max(0.68, Math.min(1.42, this.zoomFactor + e.deltaY * 0.0006));
      },
      { passive: false }
    );
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    const dt = Math.min(0.05, this.clock.getDelta());
    const t = this.clock.elapsedTime;

    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.11;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.11;
    const aspectPad = this.camera.aspect < 1.12 ? 1.12 / Math.max(0.6, this.camera.aspect) : 1.0;
    const r = this.fitDist * this.zoomFactor * aspectPad;
    const lookY = this.activePage === 'coalescent' ? 1.32 : 0.62;
    this.camera.position.set(
      Math.sin(this.curAzimuth) * Math.cos(this.curPolar) * r,
      lookY + Math.sin(this.curPolar) * r,
      Math.cos(this.curAzimuth) * Math.cos(this.curPolar) * r
    );
    this.camera.lookAt(0, lookY, 0);

    // Page 2: smooth Ne pillar height
    if (this.pageGroups.buri.visible) {
      const h = this.p2NePillar.scale.y + (this.p2TargetNeH - this.p2NePillar.scale.y) * 0.14;
      this.p2NePillar.scale.y = h;
      this.p2NePillar.position.y = 0.17 + h / 2;
    }

    // Page 3: subtle volcano lava glow + jewel rotation
    if (this.pageGroups.volcano.visible) {
      if (this.p3EruptT > 0) this.p3EruptT = Math.max(0, this.p3EruptT - dt * 1.5);
      const glow = 1 + Math.sin(t * 3.5) * 0.06 + this.p3EruptT * 0.35;
      this.p3LavaLight.scale.set(glow, 1, glow);
    }

    // Page 4: smooth Kimura P(fix) pillar
    if (this.pageGroups.tug.visible) {
      const h = this.p4KimuraBar.scale.y + (this.p4TargetKimH - this.p4KimuraBar.scale.y) * 0.14;
      this.p4KimuraBar.scale.y = h;
      this.p4KimuraBar.position.y = 0.16 + h / 2;
    }

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
