// =============================================================================
// Chapter 3: The Lichen Wood & Soot — 3D Museum Naturalist Dioramas (Three.js)
// =============================================================================

import * as THREE from 'three';
import { createSeededRng } from '../../sim/adapter';
import {
  fitnessSurfaceHeight,
  type LandscapePop,
  type MelanismEra,
  type MothSpecimen,
  type DominanceMode,
  eraFitnesses,
} from './lichenMath';

export type LichenPageId = 'wood' | 'breeder' | 'soot' | 'modes' | 'landscape' | 'check';

const COL_BRASS = 0xb88e42;
const COL_C_ALLELE = 0x263959; // dark slate-indigo (C = carbonaria)
const COL_c_ALLELE = 0xe8b948; // warm amber-ivory (c = typica)

// =============================================================================
// PROCEDURAL NATURAL-HISTORY PBR TEXTURES
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

/** Procedural Silver Birch bark + foliose lichen texture blended with industrial soot */
function createBirchBarkTexture(sootLevel: number): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const rng = createSeededRng(1848);

  // Base bark colour interpolates from chalky pale silver-birch to charcoal soot
  const rBase = Math.round(230 * (1 - sootLevel) + 46 * sootLevel);
  const gBase = Math.round(224 * (1 - sootLevel) + 43 * sootLevel);
  const bBase = Math.round(210 * (1 - sootLevel) + 40 * sootLevel);
  ctx.fillStyle = `rgb(${rBase},${gBase},${bBase})`;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle papery bark bands
  for (let i = 0; i < 70; i++) {
    const y = rng.range(0, 512);
    const h = rng.range(4, 18);
    const shade = rng.range(-14, 12);
    ctx.fillStyle = `rgba(${Math.max(0, rBase + shade)},${Math.max(0, gBase + shade)},${Math.max(0, bBase + shade)},0.35)`;
    ctx.fillRect(0, y, 512, h);
  }

  // Horizontal birch lenticels (dark papery dashes)
  for (let i = 0; i < 160; i++) {
    const x = rng.range(0, 512);
    const y = rng.range(0, 512);
    const w = rng.range(18, 72);
    const h = rng.range(1.6, 4.2);
    ctx.fillStyle = sootLevel > 0.6 ? 'rgba(18,16,15,0.55)' : 'rgba(66,56,48,0.42)';
    ctx.fillRect(x, y, w, h);
  }

  // Pale sage-green foliose lichen patches (vanish as soot kills sensitive lichens!)
  const lichenAlpha = Math.max(0, 1 - sootLevel * 1.15);
  if (lichenAlpha > 0.05) {
    for (let i = 0; i < 42; i++) {
      const cx = rng.range(24, 488);
      const cy = rng.range(24, 488);
      const rad = rng.range(14, 38);
      const g = ctx.createRadialGradient(cx, cy, rad * 0.15, cx, cy, rad);
      g.addColorStop(0, `rgba(176, 194, 152, ${(0.72 * lichenAlpha).toFixed(2)})`);
      g.addColorStop(0.65, `rgba(196, 208, 174, ${(0.45 * lichenAlpha).toFixed(2)})`);
      g.addColorStop(1, 'rgba(196, 208, 174, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Soot mottling when sootLevel > 0.2
  if (sootLevel > 0.15) {
    for (let i = 0; i < 90; i++) {
      const cx = rng.range(0, 512);
      const cy = rng.range(0, 512);
      const rad = rng.range(12, 46);
      ctx.fillStyle = `rgba(22, 20, 19, ${(0.28 * sootLevel).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Procedural speckled peppered-moth wing texture keyed to quantized shade */
const wingTexCache = new Map<number, THREE.CanvasTexture>();
function getMothWingTexture(shade: number): THREE.CanvasTexture {
  const q = Math.round(Math.max(0.08, Math.min(0.92, shade)) * 16);
  const existing = wingTexCache.get(q);
  if (existing) return existing;

  const s = q / 16;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const rng = createSeededRng(900 + q * 19);

  // Wing ground tone (charcoal #202022 -> creamy lichen-ivory #ebe7dc)
  const v = Math.round(32 + s * 204);
  const vWarm = Math.round(30 + s * 192);
  ctx.fillStyle = `rgb(${v},${Math.round(v * 0.98)},${vWarm})`;
  ctx.fillRect(0, 0, 128, 128);

  // Subtle wavy geometrid wing bands
  ctx.strokeStyle = s > 0.45 ? 'rgba(54,48,42,0.34)' : 'rgba(215,210,198,0.18)';
  ctx.lineWidth = 2.4;
  for (let b = 0; b < 3; b++) {
    ctx.beginPath();
    const y0 = 28 + b * 32;
    ctx.moveTo(0, y0);
    ctx.bezierCurveTo(42, y0 - 10, 84, y0 + 10, 128, y0 - 4);
    ctx.stroke();
  }

  // Classic "peppered" salt-and-pepper stippling
  const speckCount = Math.round(90 + (1 - Math.abs(s - 0.5) * 1.4) * 90);
  for (let i = 0; i < speckCount; i++) {
    const x = rng.range(4, 124);
    const y = rng.range(4, 124);
    const r = rng.range(1.2, 3.3);
    ctx.fillStyle =
      s > 0.38
        ? `rgba(34, 30, 28, ${rng.range(0.28, 0.72).toFixed(2)})`
        : `rgba(215, 212, 204, ${rng.range(0.14, 0.36).toFixed(2)})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  wingTexCache.set(q, tex);
  return tex;
}

/** Crisp engraved archival museum plaque laid flat on tabletop */
function createEngravedPlaque(
  title: string,
  subtitle?: string,
  width = 1.45,
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
// SCULPTED 3D PEPPERED MOTH (Biston betularia)
// =============================================================================

let sharedWingGeo: THREE.BufferGeometry | null = null;
function getMothWingGeometry(): THREE.BufferGeometry {
  if (sharedWingGeo) return sharedWingGeo;
  // Classic delta resting silhouette of Biston betularia
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.16);
  shape.bezierCurveTo(0.14, 0.15, 0.30, 0.04, 0.32, -0.05);
  shape.bezierCurveTo(0.28, -0.14, 0.17, -0.17, 0.11, -0.15);
  shape.bezierCurveTo(0.08, -0.19, 0.03, -0.20, 0, -0.14);
  shape.bezierCurveTo(-0.03, -0.20, -0.08, -0.19, -0.11, -0.15);
  shape.bezierCurveTo(-0.17, -0.17, -0.28, -0.14, -0.32, -0.05);
  shape.bezierCurveTo(-0.30, 0.04, -0.14, 0.15, 0, 0.16);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2 });
  geo.rotateX(-Math.PI / 2);
  // Normalize UVs cleanly to [0, 1]
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + 0.34) / 0.68, (pos.getZ(i) + 0.22) / 0.42);
  }
  sharedWingGeo = geo;
  return geo;
}

function createPepperedMoth3D(
  shade: number,
  options: {
    scale?: number;
    pinned?: boolean;
    genotype?: 'CC' | 'Cc' | 'cc';
    showAlleles?: boolean;
    mothId?: number;
    brassMat: THREE.Material;
    cDarkMat: THREE.Material;
    cPaleMat: THREE.Material;
  }
): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);
  if (options.mothId !== undefined) g.userData.mothId = options.mothId;

  const wingTex = getMothWingTexture(shade);
  const wingMat = new THREE.MeshStandardMaterial({
    map: wingTex,
    roughness: 0.82,
    metalness: 0.04,
  });

  const wings = new THREE.Mesh(getMothWingGeometry(), wingMat);
  wings.position.y = 0.02;
  wings.castShadow = true;
  if (options.mothId !== undefined) wings.userData.mothId = options.mothId;
  g.add(wings);

  // Fuzzy thorax + abdomen
  const bodyTone = Math.round(40 + shade * 175);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(`rgb(${bodyTone},${bodyTone},${Math.round(bodyTone * 0.94)})`),
    roughness: 0.88,
  });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.17, 6, 10), bodyMat);
  body.rotation.x = Math.PI / 2;
  body.position.set(0, 0.045, 0.01);
  body.castShadow = true;
  if (options.mothId !== undefined) body.userData.mothId = options.mothId;
  g.add(body);

  // Feathered antennae
  const antMat = new THREE.MeshStandardMaterial({ color: 0x3b332c, roughness: 0.7 });
  for (const s of [-1, 1]) {
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.007, 0.095, 5), antMat);
    ant.position.set(s * 0.04, 0.055, -0.13);
    ant.rotation.set(1.15, 0, s * -0.45);
    g.add(ant);
  }

  // Pinned Moth #7 museum pin + crimson tracking halo!
  if (options.pinned) {
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.39, 32),
      new THREE.MeshBasicMaterial({ color: 0xb83428, side: THREE.DoubleSide })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = 0.012;
    g.add(halo);

    const pinShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.34, 8), options.brassMat);
    pinShaft.position.set(0, 0.21, -0.02);
    const pinHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xb83428, roughness: 0.32, metalness: 0.15 })
    );
    pinHead.position.set(0, 0.39, -0.02);
    g.add(pinShaft, pinHead);
  }

  // Optional Gene-Pool Lens: two glowing allele pearls on thorax (C vs c)
  if (options.showAlleles && options.genotype) {
    const a1 = options.genotype[0] === 'C' ? options.cDarkMat : options.cPaleMat;
    const a2 = options.genotype[1] === 'C' ? options.cDarkMat : options.cPaleMat;
    const pGeo = new THREE.SphereGeometry(0.042, 12, 10);
    const p1 = new THREE.Mesh(pGeo, a1);
    p1.position.set(-0.052, 0.105, -0.01);
    const p2 = new THREE.Mesh(pGeo, a2);
    p2.position.set(0.052, 0.105, -0.01);
    g.add(p1, p2);
  }

  return g;
}

// =============================================================================
// MAIN 3D ENGINE FOR CHAPTER 3 (THE LICHEN WOOD & SOOT)
// =============================================================================

export class LichenScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  // Shared materials
  private walnutMat: THREE.MeshStandardMaterial;
  private brassMat: THREE.MeshStandardMaterial;
  private cDarkMat: THREE.MeshStandardMaterial;
  private cPaleMat: THREE.MeshStandardMaterial;

  // Page root groups
  private pageGroups: Record<LichenPageId, THREE.Group>;
  private activePage: LichenPageId = 'wood';

  // --- Page 1: Lichen Birch Bark + Raycastable Moths + Egg Tray ---
  private p1MothGroup = new THREE.Group();
  private p1MothMeshes: Map<number, THREE.Group> = new Map();
  private p1BarkMat!: THREE.MeshStandardMaterial;
  private p1EggGroup = new THREE.Group();
  private p1EggPulseT = 0;
  private p1Puffs: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];
  private onMothClick?: (id: number) => void;

  // --- Page 2: 3D Breeder's Equation Sculpture + Tilting h² Beam ---
  private p2ParentBars: THREE.Mesh[] = [];
  private p2OffspringBars: THREE.Mesh[] = [];
  private p2TargetParentH: number[] = [];
  private p2TargetOffH: number[] = [];
  private p2CutoffPlane!: THREE.Mesh;
  private p2CutoffTargetX = 0;
  private p2RegBeam!: THREE.Group;
  private p2TargetSlopeRad = 0.55;

  // --- Page 3: 3D Black Country Birch Grove + Gene-Pool Lens ---
  private p3BarkMats: THREE.MeshStandardMaterial[] = [];
  private p3MothGroup = new THREE.Group();
  private p3SootMotes!: THREE.Points;
  private p3SootOpacity = 0.05;

  // --- Page 4: 3D Modes of Selection Ribbon Arena ---
  private p4Bars: THREE.Mesh[] = [];
  private p4TargetH: number[] = [];
  private p4FitnessGroup = new THREE.Group();

  // --- Page 5: 3D Sewall Wright Contoured Adaptive Landscape ---
  private p5TerrainMesh!: THREE.Mesh;
  private p5TerrainGeo!: THREE.PlaneGeometry;
  private p5Shifted = false;
  private p5ShiftBlend = 0;
  private p5PopAMesh!: THREE.Mesh;
  private p5PopBMesh!: THREE.Mesh;
  private p5TrailGroup = new THREE.Group();
  private p5PopAPos: [number, number] = [-1.68, 0.66];
  private p5PopBPos: [number, number] = [0.56, 0.72];

  // --- Page 6: Check Specimen Container ---
  private p6Container = new THREE.Group();

  // Camera orbit state
  private fitDist = 7.4;
  private targetAzimuth = 0.05;
  private targetPolar = 0.66;
  private curAzimuth = 0.05;
  private curPolar = 0.66;
  private zoomFactor = 1.0;
  private dragging = false;
  private pointerDownXY = { x: 0, y: 0 };
  private lastX = 0;
  private lastY = 0;
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2();
  private clock = new THREE.Clock();

  constructor(host: HTMLElement, onMothClick?: (id: number) => void) {
    this.host = host;
    this.onMothClick = onMothClick;

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

    // Warm museum illumination
    this.scene.add(new THREE.HemisphereLight(0xfff9ee, 0xd8cdb8, 1.0));
    const key = new THREE.DirectionalLight(0xfff4df, 1.38);
    key.position.set(5.5, 9.5, 6.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 26;
    const d = 5.6;
    key.shadow.camera.left = -d;
    key.shadow.camera.right = d;
    key.shadow.camera.top = d;
    key.shadow.camera.bottom = -d;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xd9e9f5, 0.42);
    fill.position.set(-6, 4.5, -4);
    this.scene.add(fill);

    // Subtle ground shadow receiver
    const shadowFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.ShadowMaterial({ opacity: 0.14 })
    );
    shadowFloor.rotation.x = -Math.PI / 2;
    shadowFloor.position.y = -0.01;
    shadowFloor.receiveShadow = true;
    this.scene.add(shadowFloor);

    // Shared materials
    this.walnutMat = new THREE.MeshStandardMaterial({
      map: createWalnutTexture(),
      color: 0xffffff,
      roughness: 0.56,
      metalness: 0.08,
    });
    this.brassMat = new THREE.MeshStandardMaterial({
      color: COL_BRASS,
      roughness: 0.34,
      metalness: 0.68,
    });
    this.cDarkMat = new THREE.MeshStandardMaterial({
      color: COL_C_ALLELE,
      roughness: 0.25,
      emissive: 0x101c30,
      emissiveIntensity: 0.35,
    });
    this.cPaleMat = new THREE.MeshStandardMaterial({
      color: COL_c_ALLELE,
      roughness: 0.25,
      emissive: 0x5c4208,
      emissiveIntensity: 0.3,
    });

    this.pageGroups = {
      wood: new THREE.Group(),
      breeder: new THREE.Group(),
      soot: new THREE.Group(),
      modes: new THREE.Group(),
      landscape: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((grp) => this.scene.add(grp));

    this.buildPage1Wood();
    this.buildPage2Breeder();
    this.buildPage3Soot();
    this.buildPage4Modes();
    this.buildPage5Landscape();
    this.pageGroups.check.add(this.p6Container);

    this.setPage('wood');
    this.bindPointerControls();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // =========================================================================
  // PAGE 1: 3D LICHEN BIRCH BARK + CLICKABLE MOTHS + OVERPRODUCTION EGG TRAY
  // =========================================================================

  private buildPage1Wood(): void {
    const g = this.pageGroups.wood;

    // Main birch bark specimen board
    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.15, 0.16, 3.15), this.walnutMat);
    frame.position.set(-0.48, 0.08, 0);
    frame.castShadow = true;
    g.add(frame);

    this.p1BarkMat = new THREE.MeshStandardMaterial({
      map: createBirchBarkTexture(0.04),
      roughness: 0.88,
    });
    const bark = new THREE.Mesh(new THREE.BoxGeometry(4.88, 0.175, 2.88), this.p1BarkMat);
    bark.position.set(-0.48, 0.085, 0);
    bark.receiveShadow = true;
    g.add(bark);

    // Subtle 3D pale foliose lichen moss cushions along bark edges
    const lichenMat = new THREE.MeshStandardMaterial({ color: 0xbacaa4, roughness: 0.92 });
    const lichenCoords: [number, number, number][] = [
      [-2.52, -1.1, 0.24],
      [-1.18, 1.15, 0.22],
      [0.45, -1.14, 0.26],
      [1.55, 1.08, 0.21],
      [-2.35, 0.85, 0.19],
    ];
    lichenCoords.forEach(([x, z, r]) => {
      const tuft = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), lichenMat);
      tuft.scale.set(1.2, 0.22, 0.95);
      tuft.position.set(x, 0.17, z);
      g.add(tuft);
    });

    // Right side: Miniature 3D Overproduction Egg Tray (120 eggs → culled to 18 adults!)
    const trayFrame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.14, 2.25), this.walnutMat);
    trayFrame.position.set(2.85, 0.07, -0.05);
    trayFrame.castShadow = true;
    g.add(trayFrame);

    const trayVelvet = new THREE.Mesh(
      new THREE.BoxGeometry(1.02, 0.152, 2.08),
      new THREE.MeshStandardMaterial({ color: 0x2c3c36, roughness: 0.92 })
    );
    trayVelvet.position.set(2.85, 0.075, -0.05);
    g.add(trayVelvet);

    // 120 miniature ivory eggs packed inside the tray via InstancedMesh
    const eggGeo = new THREE.SphereGeometry(0.026, 8, 6);
    const eggMat = new THREE.MeshStandardMaterial({ color: 0xf4ecd6, roughness: 0.35 });
    const eggInst = new THREE.InstancedMesh(eggGeo, eggMat, 120);
    const dummy = new THREE.Object3D();
    let ei = 0;
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 8; c++) {
        dummy.position.set(2.46 + c * 0.112, 0.172, -0.96 + r * 0.13);
        dummy.scale.set(1, 0.85, 1.2);
        dummy.updateMatrix();
        eggInst.setMatrixAt(ei++, dummy.matrix);
      }
    }
    this.p1EggGroup.add(eggInst);
    g.add(this.p1EggGroup);

    g.add(this.p1MothGroup);

    const pBark = createEngravedPlaque('Silver Birch Bark', 'click moths to forage', 1.48, '#3f5d47');
    pBark.position.set(-0.48, 0.03, 1.9);
    const pEggs = createEngravedPlaque('120 Eggs', 'culled to 18 adults', 1.24, '#7a5228');
    pEggs.position.set(2.85, 0.03, 1.48);
    g.add(pBark, pEggs);
    g.position.x = -0.35;
  }

  public updateWoodMoths(moths: MothSpecimen[]): void {
    while (this.p1MothGroup.children.length > 0) {
      this.p1MothGroup.remove(this.p1MothGroup.children[0]);
    }
    this.p1MothMeshes.clear();

    for (const m of moths) {
      if (!m.alive) continue;
      const mesh = createPepperedMoth3D(m.shade, {
        scale: 1.05,
        pinned: m.pinned,
        mothId: m.id,
        brassMat: this.brassMat,
        cDarkMat: this.cDarkMat,
        cPaleMat: this.cPaleMat,
      });
      mesh.position.set(m.x - 0.48, 0.178, m.z);
      mesh.rotation.y = m.rot;
      this.p1MothGroup.add(mesh);
      this.p1MothMeshes.set(m.id, mesh);
    }
  }

  public spawnPeckPuff(mothId: number): void {
    const target = this.p1MothMeshes.get(mothId);
    if (!target) return;
    const basePos = target.position.clone();
    const puffMat = new THREE.MeshBasicMaterial({ color: 0xf6efdf, transparent: true, opacity: 0.9 });
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), puffMat.clone());
      p.position.copy(basePos).add(new THREE.Vector3(0, 0.08, 0));
      const ang = (i / 6) * Math.PI * 2;
      this.pageGroups.wood.add(p);
      this.p1Puffs.push({
        mesh: p,
        vel: new THREE.Vector3(Math.cos(ang) * 0.9, 1.2 + Math.random() * 0.5, Math.sin(ang) * 0.9),
        life: 0.45,
      });
    }
  }

  public pulseEggTray(): void {
    this.p1EggPulseT = 1.0;
  }

  // =========================================================================
  // PAGE 2: 3D BREEDER'S EQUATION SCULPTURE + TILTING h² REGRESSION BEAM
  // =========================================================================

  private buildPage2Breeder(): void {
    const g = this.pageGroups.breeder;

    // Left main bar sculpture base
    const base = new THREE.Mesh(new THREE.BoxGeometry(4.45, 0.14, 2.7), this.walnutMat);
    base.position.set(-0.78, 0.07, 0);
    base.castShadow = true;
    g.add(base);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(4.22, 0.155, 2.46),
      new THREE.MeshStandardMaterial({ color: 0xf3ecdc, roughness: 0.88 })
    );
    floor.position.set(-0.78, 0.075, 0);
    floor.receiveShadow = true;
    g.add(floor);

    const n = 12;
    for (let i = 0; i < n; i++) {
      const shade = (i + 0.5) / n;
      const x = -2.62 + i * 0.335;

      // Rear row: Parent generation distribution
      const pCol = new THREE.Color().setHSL(0.11, 0.18, 0.22 + shade * 0.62);
      const pBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 1.0, 0.44),
        new THREE.MeshPhysicalMaterial({ color: pCol, roughness: 0.35, clearcoat: 0.4 })
      );
      pBar.position.set(x, 0.16, -0.58);
      pBar.castShadow = true;
      this.p2ParentBars.push(pBar);
      this.p2TargetParentH.push(0.2);
      g.add(pBar);

      // Front row: Offspring generation distribution (emerald-sage tint)
      const oBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 1.0, 0.44),
        new THREE.MeshPhysicalMaterial({ color: 0x3b7b63, roughness: 0.28, clearcoat: 0.55 })
      );
      oBar.position.set(x, 0.16, 0.52);
      oBar.castShadow = true;
      this.p2OffspringBars.push(oBar);
      this.p2TargetOffH.push(0.2);
      g.add(oBar);
    }

    // Translucent brass Selection Cutoff Gate on the Parent row
    this.p2CutoffPlane = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 1.85, 0.88),
      new THREE.MeshPhysicalMaterial({
        color: 0xc97828,
        roughness: 0.2,
        transparent: true,
        opacity: 0.72,
      })
    );
    this.p2CutoffPlane.position.set(-0.6, 1.08, -0.58);
    g.add(this.p2CutoffPlane);

    // Right Plinth: 3D Tilting Brass Regression Slope Beam visualizing h²!
    const slopeBase = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.14, 1.92), this.walnutMat);
    slopeBase.position.set(2.58, 0.07, 0);
    slopeBase.castShadow = true;
    g.add(slopeBase);

    const dialBack = new THREE.Mesh(
      new THREE.BoxGeometry(1.52, 1.48, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    dialBack.position.set(2.58, 0.88, -0.45);
    g.add(dialBack);

    // Horizontal reference dashed axis on dial
    const refBar = new THREE.Mesh(
      new THREE.BoxGeometry(1.32, 0.025, 0.03),
      new THREE.MeshStandardMaterial({ color: 0x9b8b78, roughness: 0.8 })
    );
    refBar.position.set(2.58, 0.88, -0.39);
    g.add(refBar);

    this.p2RegBeam = new THREE.Group();
    this.p2RegBeam.position.set(2.58, 0.88, -0.36);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.085, 0.08), this.brassMat);
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 16), this.brassMat);
    pivot.rotation.x = Math.PI / 2;
    this.p2RegBeam.add(beam, pivot);
    g.add(this.p2RegBeam);

    const pDist = createEngravedPlaque('Parents (back) → Offspring (front)', 'R = h² · S', 1.88, '#2d5c49');
    pDist.position.set(-0.78, 0.03, 1.72);
    const pSlope = createEngravedPlaque('Slope = h²', 'parent–offspring', 1.38, '#7a5228');
    pSlope.position.set(2.58, 0.03, 1.38);
    g.add(pDist, pSlope);
    g.position.x = -0.32;
  }

  public updateBreederScene(
    parentBins: number[],
    offspringBins: number[],
    cutoffShade: number,
    h2: number,
    showCutoff: boolean
  ): void {
    const maxP = Math.max(...parentBins, 0.15);
    const maxO = Math.max(...offspringBins, 0.15);
    const norm = Math.max(maxP, maxO);
    for (let i = 0; i < this.p2ParentBars.length; i++) {
      this.p2TargetParentH[i] = Math.max(0.05, (parentBins[i] / norm) * 1.75);
      this.p2TargetOffH[i] = Math.max(0.05, (offspringBins[i] / norm) * 1.75);
    }
    this.p2CutoffPlane.visible = showCutoff;
    this.p2CutoffTargetX = -2.62 + (cutoffShade / 100) * 11 * 0.335;
    this.p2TargetSlopeRad = Math.atan(h2);
  }

  // =========================================================================
  // PAGE 3: 3D BLACK COUNTRY BIRCH GROVE & INDUSTRIAL MELANISM
  // =========================================================================

  private buildPage3Soot(): void {
    const g = this.pageGroups.soot;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 3.0), this.walnutMat);
    frame.position.set(0, 0.08, 0);
    frame.castShadow = true;
    g.add(frame);

    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(4.94, 0.175, 2.74),
      new THREE.MeshStandardMaterial({ color: 0x5d6e4c, roughness: 0.94 })
    );
    ground.position.set(0, 0.085, 0);
    ground.receiveShadow = true;
    g.add(ground);

    // 3 sculpted 3D birch trunks rising from the woodland plinth
    const trunkSpecs: [number, number, number, number][] = [
      [-1.55, -0.15, 0.44, 2.35],
      [0.0, -0.32, 0.50, 2.55],
      [1.55, -0.1, 0.44, 2.30],
    ];
    this.p3BarkMats = [];
    trunkSpecs.forEach(([x, z, r, h]) => {
      const mat = new THREE.MeshStandardMaterial({
        map: createBirchBarkTexture(0.05),
        roughness: 0.88,
      });
      this.p3BarkMats.push(mat);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.88, r, h, 24), mat);
      trunk.position.set(x, 0.16 + h / 2, z);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      g.add(trunk);
    });

    // Floating industrial soot motes (visible in 1895 soot peak)
    const moteCount = 90;
    const motePos = new Float32Array(moteCount * 3);
    const rng = createSeededRng(1895);
    for (let i = 0; i < moteCount; i++) {
      motePos[i * 3] = rng.range(-2.3, 2.3);
      motePos[i * 3 + 1] = rng.range(0.35, 2.65);
      motePos[i * 3 + 2] = rng.range(-1.1, 1.2);
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));
    const moteMat = new THREE.PointsMaterial({
      color: 0x262422,
      size: 0.065,
      transparent: true,
      opacity: 0.04,
    });
    this.p3SootMotes = new THREE.Points(moteGeo, moteMat);
    g.add(this.p3SootMotes);

    g.add(this.p3MothGroup);

    const pGrove = createEngravedPlaque('Lancashire Birch Grove', 'Biston betularia (cortex locus)', 1.92, '#2d3a34');
    pGrove.position.set(0, 0.03, 1.88);
    g.add(pGrove);
  }

  public updateSootGrove(
    era: MelanismEra,
    geno: [number, number, number],
    dominance: DominanceMode,
    showGeneLens: boolean
  ): void {
    const { sootLevel } = eraFitnesses(era);
    const tex = createBirchBarkTexture(sootLevel);
    this.p3BarkMats.forEach((m) => {
      m.map = tex;
      m.needsUpdate = true;
    });
    this.p3SootOpacity = sootLevel > 0.5 ? 0.55 : sootLevel > 0.1 ? 0.12 : 0.0;

    while (this.p3MothGroup.children.length > 0) {
      this.p3MothGroup.remove(this.p3MothGroup.children[0]);
    }

    const total = 18;
    const nDD = Math.round(geno[0] * total);
    const nDd = Math.round(geno[1] * total);
    const trunks = [
      { x: -1.55, z: -0.15, r: 0.44 },
      { x: 0.0, z: -0.32, r: 0.50 },
      { x: 1.55, z: -0.10, r: 0.44 },
    ];
    const rng = createSeededRng(1956);

    for (let i = 0; i < total; i++) {
      const gt: 'CC' | 'Cc' | 'cc' = i < nDD ? 'CC' : i < nDD + nDd ? 'Cc' : 'cc';
      const isDark = dominance === 'dominant' ? gt === 'CC' || gt === 'Cc' : gt === 'CC';
      const shade = isDark ? 0.14 : 0.84;

      const moth = createPepperedMoth3D(shade, {
        scale: 0.92,
        genotype: gt,
        showAlleles: showGeneLens,
        brassMat: this.brassMat,
        cDarkMat: this.cDarkMat,
        cPaleMat: this.cPaleMat,
      });

      const t = trunks[i % 3];
      const slot = Math.floor(i / 3);
      const angle = -0.68 + ((slot % 3) / 2) * 1.36 + rng.range(-0.14, 0.14);
      const y = 0.56 + slot * 0.31 + rng.range(-0.04, 0.04);
      const rad = t.r * (1 - (y / 2.6) * 0.1) + 0.025;

      // Mount flat against the curved front face of the birch trunk!
      moth.position.set(t.x + Math.sin(angle) * rad, y, t.z + Math.cos(angle) * rad);
      moth.rotation.order = 'YXZ';
      moth.rotation.y = angle;
      moth.rotation.x = Math.PI / 2;
      this.p3MothGroup.add(moth);
    }
  }

  // =========================================================================
  // PAGE 4: 3D MODES OF SELECTION (DIRECTIONAL / STABILIZING / DISRUPTIVE)
  // =========================================================================

  private buildPage4Modes(): void {
    const g = this.pageGroups.modes;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.15, 2.55), this.walnutMat);
    frame.position.set(0, 0.075, 0);
    frame.castShadow = true;
    g.add(frame);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(4.96, 0.165, 2.3),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    floor.position.set(0, 0.08, 0);
    floor.receiveShadow = true;
    g.add(floor);

    const n = 16;
    for (let i = 0; i < n; i++) {
      const frac = i / (n - 1);
      const col = new THREE.Color().setHSL(0.41 - frac * 0.28, 0.42, 0.36 + frac * 0.22);
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.23, 1.0, 0.62),
        new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.28, clearcoat: 0.5 })
      );
      bar.position.set(-2.1 + i * 0.28, 0.16, 0.22);
      bar.castShadow = true;
      this.p4Bars.push(bar);
      this.p4TargetH.push(0.25);
      g.add(bar);
    }

    g.add(this.p4FitnessGroup);

    const pMode = createEngravedPlaque('Trait Distribution & Fitness W(z)', 'gold arch = relative fitness', 1.98, '#5c4218');
    pMode.position.set(0, 0.03, 1.72);
    g.add(pMode);
  }

  public updateModesScene(bins: number[], fitness: number[]): void {
    const maxB = Math.max(...bins, 0.14);
    for (let i = 0; i < this.p4Bars.length; i++) {
      this.p4TargetH[i] = Math.max(0.06, (bins[i] / maxB) * 1.85);
    }

    // Rebuild glowing golden 3D Fitness Function arch W(z) behind the bars
    while (this.p4FitnessGroup.children.length > 0) {
      this.p4FitnessGroup.remove(this.p4FitnessGroup.children[0]);
    }
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < fitness.length; i++) {
      pts.push(new THREE.Vector3(-2.1 + i * 0.28, 0.32 + fitness[i] * 1.75, -0.52));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 48, 0.055, 10, false),
      new THREE.MeshStandardMaterial({
        color: 0xd99b26,
        emissive: 0x6b4508,
        emissiveIntensity: 0.35,
        roughness: 0.24,
        metalness: 0.55,
      })
    );
    tube.castShadow = true;
    this.p4FitnessGroup.add(tube);

    // Subtle brass stanchions at endpoints and center
    [0, 7, 15].forEach((idx) => {
      const h = pts[idx].y - 0.16;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, h, 8), this.brassMat);
      post.position.set(pts[idx].x, 0.16 + h / 2, -0.52);
      this.p4FitnessGroup.add(post);
    });
  }

  // =========================================================================
  // PAGE 5: SCULPTED 3D SEWALL WRIGHT CONTOURED ADAPTIVE LANDSCAPE
  // =========================================================================

  private buildPage5Landscape(): void {
    const g = this.pageGroups.landscape;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.05, 0.22, 3.65), this.walnutMat);
    frame.position.set(0, 0.11, 0);
    frame.castShadow = true;
    g.add(frame);

    // High-resolution vertex-coloured topographic mesh
    this.p5TerrainGeo = new THREE.PlaneGeometry(4.65, 3.25, 56, 40);
    this.p5TerrainGeo.rotateX(-Math.PI / 2);
    const count = this.p5TerrainGeo.attributes.position.count;
    this.p5TerrainGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3), 3));

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.62,
      metalness: 0.05,
    });
    this.p5TerrainMesh = new THREE.Mesh(this.p5TerrainGeo, terrainMat);
    this.p5TerrainMesh.position.y = 0.22;
    this.p5TerrainMesh.castShadow = true;
    this.p5TerrainMesh.receiveShadow = true;
    g.add(this.p5TerrainMesh);

    this.applyLandscapeGeometry(0);

    // Population A (Crimson — starts on left slope heading toward Local Peak)
    this.p5PopAMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 14),
      new THREE.MeshPhysicalMaterial({ color: 0xc2382b, roughness: 0.2, clearcoat: 0.8 })
    );
    this.p5PopAMesh.castShadow = true;

    // Population B (Cobalt — starts on right slope climbing Global Peak)
    this.p5PopBMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 14),
      new THREE.MeshPhysicalMaterial({ color: 0x2b5fd1, roughness: 0.2, clearcoat: 0.8 })
    );
    this.p5PopBMesh.castShadow = true;

    g.add(this.p5PopAMesh, this.p5PopBMesh, this.p5TrailGroup);

    const pLoc = createEngravedPlaque('Local Peak', 'traps myopic climbers', 1.44, '#945b18');
    pLoc.position.set(-1.35, 0.03, 2.22);
    const pGlob = createEngravedPlaque('Global Peak', 'highest fitness summit', 1.48, '#1e6b58');
    pGlob.position.set(1.35, 0.03, 2.22);
    g.add(pLoc, pGlob);
  }

  private applyLandscapeGeometry(shiftBlend: number): void {
    const pos = this.p5TerrainGeo.attributes.position;
    const col = this.p5TerrainGeo.attributes.color;
    const cLow = new THREE.Color(0xefe6d0);
    const cMid = new THREE.Color(0xdca756);
    const cHigh = new THREE.Color(0x2a866f);
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h0 = fitnessSurfaceHeight(x, z, false);
      const h1 = fitnessSurfaceHeight(x, z, true);
      const h = h0 + (h1 - h0) * shiftBlend;
      pos.setY(i, h);

      // Elevation colour ramp + crisp topographic contour bands every 0.22 units!
      const t = Math.max(0, Math.min(1, (h - 0.14) / 1.55));
      if (t < 0.52) {
        tmp.copy(cLow).lerp(cMid, t / 0.52);
      } else {
        tmp.copy(cMid).lerp(cHigh, (t - 0.52) / 0.48);
      }
      const contourFrac = (h * 4.5) % 1;
      if (contourFrac < 0.075) {
        tmp.multiplyScalar(0.76);
      }
      col.setXYZ(i, tmp.r, tmp.g, tmp.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    this.p5TerrainGeo.computeVertexNormals();
  }

  public updateLandscapeScene(popA: LandscapePop, popB: LandscapePop, shifted: boolean): void {
    this.p5Shifted = shifted;
    this.p5PopAPos = [popA.x, popA.z];
    this.p5PopBPos = [popB.x, popB.z];

    while (this.p5TrailGroup.children.length > 0) {
      this.p5TrailGroup.remove(this.p5TrailGroup.children[0]);
    }

    const drawTrail = (trail: [number, number][], colorHex: number) => {
      if (trail.length < 2) return;
      const pts = trail.map(([tx, tz]) => {
        const h0 = fitnessSurfaceHeight(tx, tz, false);
        const h1 = fitnessSurfaceHeight(tx, tz, true);
        const h = h0 + (h1 - h0) * this.p5ShiftBlend;
        return new THREE.Vector3(tx, 0.27 + h, tz);
      });
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 3), 0.026, 6, false),
        new THREE.MeshBasicMaterial({ color: colorHex })
      );
      this.p5TrailGroup.add(tube);
    };
    drawTrail(popA.trail, 0xc2382b);
    drawTrail(popB.trail, 0x2b5fd1);
  }

  // =========================================================================
  // PAGE 6: CHECK SPECIMEN BACKDROP
  // =========================================================================

  public setCheckCaseBackdrop(caseIdx: number): void {
    while (this.p6Container.children.length > 0) {
      this.p6Container.remove(this.p6Container.children[0]);
    }
    if (caseIdx === 0) {
      this.pageGroups.wood.visible = true;
      this.pageGroups.soot.visible = false;
      this.pageGroups.landscape.visible = false;
    } else if (caseIdx === 1) {
      this.pageGroups.wood.visible = false;
      this.pageGroups.soot.visible = true;
      this.pageGroups.landscape.visible = false;
      this.updateSootGrove('clean_1970', [0.09, 0.42, 0.49], 'dominant', true);
    } else {
      this.pageGroups.wood.visible = false;
      this.pageGroups.soot.visible = false;
      this.pageGroups.landscape.visible = true;
    }
  }

  // =========================================================================
  // PAGE SWITCHING, CAMERA & LOOP
  // =========================================================================

  public setPage(page: LichenPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as LichenPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });

    if (page === 'wood') {
      this.targetAzimuth = 0.04;
      this.targetPolar = 0.72;
      this.fitDist = 9.5;
    } else if (page === 'breeder') {
      this.targetAzimuth = 0.07;
      this.targetPolar = 0.54;
      this.fitDist = 10.2;
    } else if (page === 'soot') {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.44;
      this.fitDist = 8.4;
    } else if (page === 'modes') {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.52;
      this.fitDist = 8.4;
    } else if (page === 'landscape') {
      this.targetAzimuth = -0.22;
      this.targetPolar = 0.62;
      this.fitDist = 8.8;
    } else {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.64;
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

    const onDown = (e: PointerEvent) => {
      this.dragging = true;
      this.pointerDownXY = { x: e.clientX, y: e.clientY };
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      el.style.cursor = 'grabbing';
    };

    const onMove = (e: PointerEvent) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.targetAzimuth -= dx * 0.0065;
      this.targetPolar = Math.max(0.24, Math.min(1.22, this.targetPolar + dy * 0.0055));
    };

    const onUp = (e: PointerEvent) => {
      if (!this.dragging) return;
      this.dragging = false;
      el.style.cursor = 'grab';
      const moved = Math.hypot(e.clientX - this.pointerDownXY.x, e.clientY - this.pointerDownXY.y);
      if (moved < 6 && this.activePage === 'wood' && this.onMothClick) {
        const rect = el.getBoundingClientRect();
        this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.pointerNdc, this.camera);
        const hits = this.raycaster.intersectObjects(this.p1MothGroup.children, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && obj.userData.mothId === undefined) obj = obj.parent;
          if (obj && typeof obj.userData.mothId === 'number') {
            this.onMothClick(obj.userData.mothId);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.zoomFactor = Math.max(0.68, Math.min(1.42, this.zoomFactor + e.deltaY * 0.0006));
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('wheel', onWheel, { passive: false });
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);
    const dt = Math.min(0.05, this.clock.getDelta());
    const t = this.clock.elapsedTime;

    // Smooth camera orbit
    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * 0.11;
    this.curPolar += (this.targetPolar - this.curPolar) * 0.11;
    const aspectPad = this.camera.aspect < 1.12 ? 1.12 / Math.max(0.6, this.camera.aspect) : 1.0;
    const r = this.fitDist * this.zoomFactor * aspectPad;
    const lookY = this.activePage === 'soot' ? 1.1 : this.activePage === 'landscape' ? 0.65 : 0.42;
    this.camera.position.set(
      Math.sin(this.curAzimuth) * Math.cos(this.curPolar) * r,
      lookY + Math.sin(this.curPolar) * r,
      Math.cos(this.curAzimuth) * Math.cos(this.curPolar) * r
    );
    this.camera.lookAt(0, lookY, 0);

    // Page 1: gentle moth breathing + feather peck puffs + egg tray pulse
    if (this.pageGroups.wood.visible) {
      if (this.p1EggPulseT > 0) {
        this.p1EggPulseT = Math.max(0, this.p1EggPulseT - dt * 1.4);
        const s = 1 + Math.sin(this.p1EggPulseT * Math.PI) * 0.14;
        this.p1EggGroup.scale.set(1, s, 1);
      }
      for (let i = this.p1Puffs.length - 1; i >= 0; i--) {
        const pf = this.p1Puffs[i];
        pf.life -= dt;
        pf.mesh.position.addScaledVector(pf.vel, dt);
        pf.vel.y -= 2.2 * dt;
        (pf.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, pf.life * 2);
        if (pf.life <= 0) {
          this.pageGroups.wood.remove(pf.mesh);
          this.p1Puffs.splice(i, 1);
        }
      }
    }

    // Page 2: smooth Breeder bars + cutoff plane + tilting h² beam
    if (this.pageGroups.breeder.visible) {
      for (let i = 0; i < this.p2ParentBars.length; i++) {
        const pb = this.p2ParentBars[i];
        const ph = pb.scale.y + (this.p2TargetParentH[i] - pb.scale.y) * 0.14;
        pb.scale.y = ph;
        pb.position.y = 0.16 + ph / 2;

        const ob = this.p2OffspringBars[i];
        const oh = ob.scale.y + (this.p2TargetOffH[i] - ob.scale.y) * 0.14;
        ob.scale.y = oh;
        ob.position.y = 0.16 + oh / 2;
      }
      this.p2CutoffPlane.position.x += (this.p2CutoffTargetX - this.p2CutoffPlane.position.x) * 0.15;
      this.p2RegBeam.rotation.z += (this.p2TargetSlopeRad - this.p2RegBeam.rotation.z) * 0.14;
    }

    // Page 3: drifting soot motes
    if (this.pageGroups.soot.visible) {
      const mMat = this.p3SootMotes.material as THREE.PointsMaterial;
      mMat.opacity += (this.p3SootOpacity - mMat.opacity) * 0.1;
      this.p3SootMotes.position.y = Math.sin(t * 0.8) * 0.08;
      this.p3SootMotes.rotation.y = t * 0.04;
    }

    // Page 4: smooth trait bars
    if (this.pageGroups.modes.visible) {
      for (let i = 0; i < this.p4Bars.length; i++) {
        const b = this.p4Bars[i];
        const h = b.scale.y + (this.p4TargetH[i] - b.scale.y) * 0.14;
        b.scale.y = h;
        b.position.y = 0.16 + h / 2;
      }
    }

    // Page 5: smooth terrain morphing when Environmental Shift toggles + population marble placement
    if (this.pageGroups.landscape.visible) {
      const targetBlend = this.p5Shifted ? 1 : 0;
      if (Math.abs(this.p5ShiftBlend - targetBlend) > 0.002) {
        this.p5ShiftBlend += (targetBlend - this.p5ShiftBlend) * 0.12;
        this.applyLandscapeGeometry(this.p5ShiftBlend);
      }
      const placeMarble = (mesh: THREE.Mesh, [mx, mz]: [number, number]) => {
        const h0 = fitnessSurfaceHeight(mx, mz, false);
        const h1 = fitnessSurfaceHeight(mx, mz, true);
        const h = h0 + (h1 - h0) * this.p5ShiftBlend;
        mesh.position.set(mx, 0.34 + h, mz);
      };
      placeMarble(this.p5PopAMesh, this.p5PopAPos);
      placeMarble(this.p5PopBMesh, this.p5PopBPos);
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
