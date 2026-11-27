// =============================================================================
// Chapter 5: Bitter Wings — 3D Neotropical Rainforest & Mimicry Dioramas
// =============================================================================

import * as THREE from 'three';
import { createSeededRng } from '../../sim/adapter';
import {
  type BatesianDecision,
  type ImperfectPoint,
  type MullerianState,
  type RainforestInsect,
} from './bitterMath';

export type BitterPageId = 'forage' | 'ratio' | 'imperfect' | 'mullerian' | 'aposematic' | 'check';

const COL_BRASS = 0xb88e42;

// =============================================================================
// PROCEDURAL NATURALIST TEXTURES & ENGRAVED PLAQUES
// =============================================================================

function createWalnutTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5a3b24';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) {
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(32,18,8,0.24)' : 'rgba(135,95,58,0.14)';
    ctx.lineWidth = 1 + (i % 4);
    ctx.beginPath();
    const y = (i / 60) * 256;
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + Math.sin(i) * 5, 170, y - Math.cos(i) * 5, 256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createRainforestFloorTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d')!;
  const rng = createSeededRng(1862);
  ctx.fillStyle = '#476b48';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 120; i++) {
    const x = rng.range(0, 512);
    const y = rng.range(0, 512);
    const r = rng.range(16, 56);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(122,160,92,0.28)' : 'rgba(34,62,38,0.24)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const bflyTexCache = new Map<string, THREE.CanvasTexture>();
function getButterflyWingTexture(pattern: 'red_band' | 'yellow_spot' | 'cream' | 'graded', grade = 1): THREE.CanvasTexture {
  const key = pattern === 'graded' ? `g_${Math.round(grade * 10)}` : pattern;
  const cached = bflyTexCache.get(key);
  if (cached) return cached;

  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;

  if (pattern === 'cream' || (pattern === 'graded' && grade <= 0.05)) {
    ctx.fillStyle = '#f2ead4';
    ctx.fillRect(0, 0, 128, 128);
    ctx.strokeStyle = '#6b5742';
    ctx.lineWidth = 10;
    ctx.strokeRect(4, 4, 120, 120);
  } else if (pattern === 'yellow_spot') {
    ctx.fillStyle = '#1d1b1d';
    ctx.fillRect(0, 0, 128, 128);
    // Twin lemon-yellow warning spots
    ctx.fillStyle = '#f2d030';
    ctx.beginPath();
    ctx.ellipse(54, 42, 24, 15, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(78, 86, 19, 13, 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Red-band (or graded imperfect mimic blending cream -> black + red slash!)
    const g = pattern === 'red_band' ? 1 : grade;
    const bg = Math.round(242 * (1 - g) + 24 * g);
    ctx.fillStyle = `rgb(${bg},${Math.round(bg * 0.96)},${Math.round(bg * 0.88)})`;
    ctx.fillRect(0, 0, 128, 128);

    // Dark margin grows with grade
    ctx.strokeStyle = '#241e1d';
    ctx.lineWidth = 8 + g * 12;
    ctx.strokeRect(4, 4, 120, 120);

    // Blazing crimson-scarlet Heliconius forewing band
    if (g > 0.12) {
      ctx.fillStyle = `rgba(226, 62, 42, ${Math.min(1, g * 1.15).toFixed(2)})`;
      ctx.save();
      ctx.translate(66, 56);
      ctx.rotate(-0.48);
      ctx.fillRect(-38 * g, -15 * g, 76 * g, 30 * g);
      ctx.restore();

      // Subtle warm amber hindwing rays at high resemblance
      if (g > 0.5) {
        ctx.fillStyle = `rgba(240, 168, 42, ${((g - 0.5) * 1.6).toFixed(2)})`;
        ctx.fillRect(26, 94, 42 * g, 11);
      }
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  bflyTexCache.set(key, tex);
  return tex;
}

function createEngravedPlaque(
  title: string,
  subtitle?: string,
  width = 1.55,
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
// SCULPTED 3D BUTTERFLIES, DRAGONFLY & RUFOUS-TAILED JACAMAR
// =============================================================================

let sharedRightWingGeo: THREE.BufferGeometry | null = null;
function getRightButterflyWingGeo(): THREE.BufferGeometry {
  if (sharedRightWingGeo) return sharedRightWingGeo;
  const shape = new THREE.Shape();
  // Graceful Heliconius forewing + scalloped hindwing silhouette
  shape.moveTo(0, 0.06);
  shape.bezierCurveTo(0.16, 0.22, 0.36, 0.24, 0.40, 0.08);
  shape.bezierCurveTo(0.41, -0.02, 0.28, -0.06, 0.20, -0.06);
  shape.bezierCurveTo(0.28, -0.14, 0.24, -0.24, 0.11, -0.22);
  shape.bezierCurveTo(0.04, -0.20, 0.01, -0.12, 0, -0.06);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.01, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, pos.getX(i) / 0.42, (pos.getZ(i) + 0.24) / 0.48);
  }
  sharedRightWingGeo = geo;
  return geo;
}

interface ButterflyHandle {
  group: THREE.Group;
  leftPivot: THREE.Group;
  rightPivot: THREE.Group;
  phase: number;
}

function createButterfly3D(
  pattern: 'red_band' | 'yellow_spot' | 'cream' | 'graded',
  opts: { grade?: number; scale?: number; insectId?: number; toxinDot?: boolean } = {}
): ButterflyHandle {
  const g = new THREE.Group();
  g.scale.setScalar(opts.scale ?? 1.0);
  if (opts.insectId !== undefined) g.userData.insectId = opts.insectId;

  const tex = getButterflyWingTexture(pattern, opts.grade ?? 1);
  const wingMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.72, side: THREE.DoubleSide });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x221d1a, roughness: 0.75 });

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.22, 5, 8), bodyMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  if (opts.insectId !== undefined) body.userData.insectId = opts.insectId;
  g.add(body);

  // Right wing pivot
  const rightPivot = new THREE.Group();
  const rw = new THREE.Mesh(getRightButterflyWingGeo(), wingMat);
  rw.castShadow = true;
  if (opts.insectId !== undefined) rw.userData.insectId = opts.insectId;
  rightPivot.add(rw);

  // Left wing pivot (mirrored on X)
  const leftPivot = new THREE.Group();
  const lw = new THREE.Mesh(getRightButterflyWingGeo(), wingMat);
  lw.scale.x = -1;
  lw.castShadow = true;
  if (opts.insectId !== undefined) lw.userData.insectId = opts.insectId;
  leftPivot.add(lw);

  g.add(leftPivot, rightPivot);

  // Optional tiny glowing toxin bead on thorax when revealing hidden defence
  if (opts.toxinDot) {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.042, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x9de655 })
    );
    dot.position.set(0, 0.06, -0.02);
    g.add(dot);
  }

  return { group: g, leftPivot, rightPivot, phase: Math.random() * Math.PI * 2 };
}

function createDragonfly3D(insectId?: number): THREE.Group {
  const g = new THREE.Group();
  if (insectId !== undefined) g.userData.insectId = insectId;
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1d96a6, roughness: 0.3, metalness: 0.35 });
  const wingMat = new THREE.MeshPhysicalMaterial({
    color: 0xdff5f7,
    transparent: true,
    opacity: 0.65,
    roughness: 0.15,
  });

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.014, 0.44, 8), bodyMat);
  body.rotation.x = Math.PI / 2;
  body.castShadow = true;
  if (insectId !== undefined) body.userData.insectId = insectId;
  g.add(body);

  for (const s of [-1, 1]) {
    for (const zOff of [-0.06, 0.04]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.008, 0.075), wingMat);
      w.position.set(s * 0.2, 0.02, zOff);
      if (insectId !== undefined) w.userData.insectId = insectId;
      g.add(w);
    }
  }
  return g;
}

/** Sculpted 3D Rufous-Tailed Jacamar (Galbula ruficauda) perched on rainforest twig */
function createJacamar3D(): THREE.Group {
  const g = new THREE.Group();
  const greenMat = new THREE.MeshStandardMaterial({ color: 0x206c48, roughness: 0.36, metalness: 0.35 });
  const rufousMat = new THREE.MeshStandardMaterial({ color: 0xb04e26, roughness: 0.72 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf7f3ea, roughness: 0.8 });
  const billMat = new THREE.MeshStandardMaterial({ color: 0x1e1a18, roughness: 0.35 });

  // Emerald back & rufous breast
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 12), greenMat);
  body.scale.set(0.88, 1.0, 1.48);
  body.position.set(0, 0.36, 0);
  body.castShadow = true;
  g.add(body);

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), rufousMat);
  belly.scale.set(0.86, 0.9, 1.25);
  belly.position.set(0, 0.28, 0.08);
  g.add(belly);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 12, 10), greenMat);
  head.position.set(0, 0.56, 0.22);
  head.castShadow = true;
  g.add(head);

  const throat = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8), whiteMat);
  throat.position.set(0, 0.47, 0.27);
  g.add(throat);

  // Characteristic long needle-like jacamar bill!
  const bill = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.46, 8), billMat);
  bill.rotation.x = Math.PI / 2 + 0.14;
  bill.position.set(0, 0.54, 0.52);
  bill.castShadow = true;
  g.add(bill);

  // Long rufous tail feathers
  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.025, 0.58), rufousMat);
  tail.rotation.x = 0.26;
  tail.position.set(0, 0.28, -0.46);
  tail.castShadow = true;
  g.add(tail);

  return g;
}

// =============================================================================
// MAIN 3D ENGINE FOR CHAPTER 5 (BITTER WINGS)
// =============================================================================

export class BitterScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  private walnutMat: THREE.MeshStandardMaterial;
  private brassMat: THREE.MeshStandardMaterial;
  private floorMat: THREE.MeshStandardMaterial;

  private pageGroups: Record<BitterPageId, THREE.Group>;
  private activePage: BitterPageId = 'forage';

  // Animated butterfly handles across pages
  private animHandles: ButterflyHandle[] = [];

  // --- Page 1: Rainforest Clearing + Clickable Insects + Perched Jacamar ---
  private p1InsectGroup = new THREE.Group();
  private p1Jacamar!: THREE.Group;
  private p1SwoopT = 0;
  private onInsectClick?: (id: number) => void;

  // --- Page 2: Batesian Ratio & Glowing Shield Ring ---
  private p2BflyGroup = new THREE.Group();
  private p2ShieldRing!: THREE.Mesh;
  private p2SurvBar!: THREE.Mesh;
  private p2TargetSurvH = 1.4;

  // --- Page 3: Imperfect Mimicry Lineup + 3D Survival Curve ---
  private p3CurveGroup = new THREE.Group();

  // --- Page 4: Müllerian Advergence Twin Meadow + Mortality Pillars ---
  private p4Sp2Group = new THREE.Group();
  private p4RiskSoloBar!: THREE.Mesh;
  private p4RiskJoinBar!: THREE.Mesh;
  private p4TargetRisks: [number, number] = [1.2, 0.3];

  // --- Page 5: Origin of Aposematism (Solitary vs Kin-Clustered Larvae) ---
  private p5LarvaGroup = new THREE.Group();

  // Camera orbit state
  private fitDist = 9.0;
  private targetAzimuth = 0.05;
  private targetPolar = 0.62;
  private curAzimuth = 0.05;
  private curPolar = 0.62;
  private zoomFactor = 1.0;
  private dragging = false;
  private downXY = { x: 0, y: 0 };
  private lastX = 0;
  private lastY = 0;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private clock = new THREE.Clock();

  constructor(host: HTMLElement, onInsectClick?: (id: number) => void) {
    this.host = host;
    this.onInsectClick = onInsectClick;

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

    this.scene.add(new THREE.HemisphereLight(0xfff9ee, 0xcad6c2, 1.02));
    const key = new THREE.DirectionalLight(0xfff4df, 1.38);
    key.position.set(5.5, 9.5, 6.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
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

    this.walnutMat = new THREE.MeshStandardMaterial({ map: createWalnutTexture(), roughness: 0.56 });
    this.brassMat = new THREE.MeshStandardMaterial({ color: COL_BRASS, roughness: 0.3, metalness: 0.72 });
    this.floorMat = new THREE.MeshStandardMaterial({ map: createRainforestFloorTexture(), roughness: 0.9 });

    this.pageGroups = {
      forage: new THREE.Group(),
      ratio: new THREE.Group(),
      imperfect: new THREE.Group(),
      mullerian: new THREE.Group(),
      aposematic: new THREE.Group(),
      check: new THREE.Group(),
    };
    Object.values(this.pageGroups).forEach((grp) => this.scene.add(grp));

    this.buildPage1Forage();
    this.buildPage2Ratio();
    this.buildPage3Imperfect();
    this.buildPage4Mullerian();
    this.buildPage5Aposematic();

    this.setPage('forage');
    this.bindPointerControls();
    this.resize();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.animate();
  }

  // =========================================================================
  // PAGE 1: RAINFOREST CLEARING + CLICKABLE INSECTS + JACAMAR
  // =========================================================================

  private buildPage1Forage(): void {
    const g = this.pageGroups.forage;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.45, 0.16, 3.2), this.walnutMat);
    frame.position.set(0, 0.08, 0);
    frame.castShadow = true;
    g.add(frame);

    const turf = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.175, 2.95), this.floorMat);
    turf.position.set(0, 0.085, 0);
    turf.receiveShadow = true;
    g.add(turf);

    // Perched branch + Sculpted 3D Rufous-Tailed Jacamar in back-left corner
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.085, 1.35, 10),
      new THREE.MeshStandardMaterial({ color: 0x5c422c, roughness: 0.88 })
    );
    branch.rotation.z = Math.PI / 2 - 0.18;
    branch.position.set(-2.05, 0.52, -1.15);
    g.add(branch);

    this.p1Jacamar = createJacamar3D();
    this.p1Jacamar.position.set(-1.95, 0.56, -1.12);
    this.p1Jacamar.rotation.y = 0.72;
    g.add(this.p1Jacamar);

    g.add(this.p1InsectGroup);

    const pClear = createEngravedPlaque('Neotropical Clearing', 'click butterflies to forage', 1.85, '#8f3620');
    pClear.position.set(0, 0.03, 1.98);
    g.add(pClear);
  }

  public updateForageClearing(insects: RainforestInsect[], revealToxins = false): void {
    while (this.p1InsectGroup.children.length > 0) {
      this.p1InsectGroup.remove(this.p1InsectGroup.children[0]);
    }
    this.animHandles = [];

    for (const ins of insects) {
      if (!ins.alive) continue;
      if (ins.kind === 'dragonfly') {
        const df = createDragonfly3D(ins.id);
        df.position.set(ins.x, ins.y, ins.z);
        df.rotation.y = ins.rot;
        this.p1InsectGroup.add(df);
      } else {
        const pat = ins.kind === 'nonmimic' ? 'cream' : 'red_band';
        const h = createButterfly3D(pat, {
          scale: 1.05,
          insectId: ins.id,
          toxinDot: revealToxins && ins.kind === 'model',
        });
        h.group.position.set(ins.x, ins.y, ins.z);
        h.group.rotation.y = ins.rot;
        this.p1InsectGroup.add(h.group);
        this.animHandles.push(h);
      }
    }
  }

  public triggerJacamarSwoop(): void {
    this.p1SwoopT = 1.0;
  }

  // =========================================================================
  // PAGE 2: MODEL:MIMIC RATIO & GLOWING AVOIDANCE SHIELD RING
  // =========================================================================

  private buildPage2Ratio(): void {
    const g = this.pageGroups.ratio;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.16, 3.05), this.walnutMat);
    frame.position.set(-0.78, 0.08, 0);
    frame.castShadow = true;
    g.add(frame);

    const turf = new THREE.Mesh(new THREE.BoxGeometry(3.86, 0.175, 2.8), this.floorMat);
    turf.position.set(-0.78, 0.085, 0);
    turf.receiveShadow = true;
    g.add(turf);

    // Glowing Avoidance Shield Ring enclosing the red-banded clearing!
    this.p2ShieldRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.32, 0.055, 10, 44),
      new THREE.MeshBasicMaterial({ color: 0x35b878, transparent: true, opacity: 0.85 })
    );
    this.p2ShieldRing.rotation.x = Math.PI / 2;
    this.p2ShieldRing.position.set(-0.78, 0.24, 0);
    g.add(this.p2ShieldRing);

    g.add(this.p2BflyGroup);

    // Right plinth: Mimic Survival Probability Pillar
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.16, 2.15), this.walnutMat);
    plinth.position.set(2.38, 0.08, 0);
    plinth.castShadow = true;
    g.add(plinth);

    const ghost = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 2.0, 0.68),
      new THREE.MeshPhysicalMaterial({ color: 0x9c8e7c, transparent: true, opacity: 0.16 })
    );
    ghost.position.set(2.38, 1.16, 0);
    g.add(ghost);

    this.p2SurvBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 1.0, 0.58),
      new THREE.MeshPhysicalMaterial({ color: 0x2a8c66, roughness: 0.22, clearcoat: 0.7 })
    );
    this.p2SurvBar.position.set(2.38, 0.66, 0);
    this.p2SurvBar.castShadow = true;
    g.add(this.p2SurvBar);

    const pClear = createEngravedPlaque('Red-Band Canopy', 'green dot = toxic model', 1.68, '#285e40');
    pClear.position.set(-0.78, 0.03, 1.88);
    const pSurv = createEngravedPlaque('Mimic Survival', 'shield vs. collapse', 1.48, '#9e3e22');
    pSurv.position.set(2.38, 0.03, 1.48);
    g.add(pClear, pSurv);
    g.position.x = -0.32;
  }

  public updateRatioScene(dec: BatesianDecision): void {
    while (this.p2BflyGroup.children.length > 0) {
      this.p2BflyGroup.remove(this.p2BflyGroup.children[0]);
    }
    const total = dec.nModels + dec.nMimics;
    for (let i = 0; i < total; i++) {
      const isModel = i < dec.nModels;
      const ang = (i / Math.max(1, total)) * Math.PI * 2;
      const rad = i % 2 === 0 ? 0.55 : 0.98;
      const h = createButterfly3D('red_band', { scale: 0.88, toxinDot: isModel });
      h.group.position.set(-0.78 + Math.cos(ang) * rad, 0.36 + (i % 3) * 0.08, Math.sin(ang) * rad);
      h.group.rotation.y = ang + Math.PI / 2;
      this.p2BflyGroup.add(h.group);
    }

    const rMat = this.p2ShieldRing.material as THREE.MeshBasicMaterial;
    rMat.color.setHex(dec.shieldHolds ? 0x35b878 : 0xc93a2b);
    (this.p2SurvBar.material as THREE.MeshPhysicalMaterial).color.setHex(dec.shieldHolds ? 0x2a8c66 : 0xc93a2b);
    this.p2TargetSurvH = Math.max(0.12, dec.mimicSurvival * 2.0);
  }

  // =========================================================================
  // PAGE 3: IMPERFECT MIMICRY SPECTRUM (0% -> 100%) + 3D SURVIVAL ARCH
  // =========================================================================

  private buildPage3Imperfect(): void {
    const g = this.pageGroups.imperfect;

    const tray = new THREE.Mesh(new THREE.BoxGeometry(5.55, 0.16, 2.5), this.walnutMat);
    tray.position.set(0, 0.08, 0);
    tray.castShadow = true;
    g.add(tray);

    const ivory = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 0.175, 2.25),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    ivory.position.set(0, 0.085, 0);
    ivory.receiveShadow = true;
    g.add(ivory);

    // 6 pinned specimen butterflies graded from 0% cream -> 100% crimson-band!
    for (let i = 0; i < 6; i++) {
      const grade = i / 5;
      const x = -2.15 + i * 0.86;
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.34, 8), this.brassMat);
      pin.position.set(x, 0.34, 0.35);
      g.add(pin);

      const h = createButterfly3D('graded', { grade, scale: 1.05 });
      h.group.position.set(x, 0.44, 0.35);
      g.add(h.group);
    }

    g.add(this.p3CurveGroup);

    const pSpec = createEngravedPlaque('Resemblance Spectrum (0% → 100%)', 'gold curve = survival probability', 2.08, '#8f3620');
    pSpec.position.set(0, 0.03, 1.66);
    g.add(pSpec);
  }

  public updateImperfectScene(pts: ImperfectPoint[]): void {
    while (this.p3CurveGroup.children.length > 0) {
      this.p3CurveGroup.remove(this.p3CurveGroup.children[0]);
    }
    const vecs = pts.map((pt, i) => new THREE.Vector3(-2.15 + i * 0.86, 0.35 + pt.survivalProb * 1.75, -0.52));
    const curve = new THREE.CatmullRomCurve3(vecs);
    const tube = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 36, 0.052, 10, false),
      new THREE.MeshStandardMaterial({ color: 0xd99b26, roughness: 0.25, metalness: 0.55 })
    );
    tube.castShadow = true;
    this.p3CurveGroup.add(tube);

    vecs.forEach((v) => {
      const orb = new THREE.Mesh(
        new THREE.SphereGeometry(0.085, 10, 8),
        new THREE.MeshPhysicalMaterial({ color: 0x2a8c66, roughness: 0.25, clearcoat: 0.65 })
      );
      orb.position.copy(v);
      this.p3CurveGroup.add(orb);
    });
  }

  // =========================================================================
  // PAGE 4: MÜLLERIAN ADVERGENCE (H. erato & H. melpomene) + MORTALITY BARS
  // =========================================================================

  private buildPage4Mullerian(): void {
    const g = this.pageGroups.mullerian;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.16, 2.9), this.walnutMat);
    frame.position.set(-0.78, 0.08, 0);
    frame.castShadow = true;
    g.add(frame);

    const turf = new THREE.Mesh(new THREE.BoxGeometry(3.96, 0.175, 2.66), this.floorMat);
    turf.position.set(-0.78, 0.085, 0);
    turf.receiveShadow = true;
    g.add(turf);

    // Left half: Abundant Species 1 (8 toxic Red-Band butterflies)
    for (let i = 0; i < 8; i++) {
      const h = createButterfly3D('red_band', { scale: 0.84, toxinDot: true });
      const col = i % 2;
      const row = Math.floor(i / 2);
      h.group.position.set(-2.22 + col * 0.72, 0.36 + (i % 2) * 0.07, -0.82 + row * 0.55);
      h.group.rotation.y = 0.25;
      g.add(h.group);
    }

    // Right half: Rarer Species 2 (8 butterflies adverging from Yellow-Spot -> Red-Band!)
    g.add(this.p4Sp2Group);

    // Right Plinth: Two Per-Capita Risk Pillars (Solo Yellow-Spot vs Joined Red-Band)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.16, 2.1), this.walnutMat);
    plinth.position.set(2.42, 0.08, 0);
    plinth.castShadow = true;
    g.add(plinth);

    this.p4RiskSoloBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 1.0, 0.56),
      new THREE.MeshPhysicalMaterial({ color: 0xe6b828, roughness: 0.25, clearcoat: 0.6 })
    );
    this.p4RiskSoloBar.position.set(2.08, 0.66, 0);
    this.p4RiskSoloBar.castShadow = true;

    this.p4RiskJoinBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 1.0, 0.56),
      new THREE.MeshPhysicalMaterial({ color: 0xc93a2b, roughness: 0.25, clearcoat: 0.6 })
    );
    this.p4RiskJoinBar.position.set(2.76, 0.66, 0);
    this.p4RiskJoinBar.castShadow = true;
    g.add(this.p4RiskSoloBar, this.p4RiskJoinBar);

    const pMead = createEngravedPlaque('Müllerian Co-Mimics', 'H. erato (left) & H. melpomene', 1.78, '#8f3620');
    pMead.position.set(-0.78, 0.03, 1.82);
    const pRisk = createEngravedPlaque('Per-Capita Risk', 'Solo (yellow) vs Joined (red)', 1.62, '#6b4214');
    pRisk.position.set(2.42, 0.03, 1.48);
    g.add(pMead, pRisk);
    g.position.x = -0.32;
  }

  public updateMullerianScene(st: MullerianState): void {
    while (this.p4Sp2Group.children.length > 0) {
      this.p4Sp2Group.remove(this.p4Sp2Group.children[0]);
    }
    const nRed = Math.round(st.pAdverged * 8);
    for (let i = 0; i < 8; i++) {
      const pat = i < nRed ? 'red_band' : 'yellow_spot';
      const h = createButterfly3D(pat, { scale: 0.84, toxinDot: true });
      const col = i % 2;
      const row = Math.floor(i / 2);
      h.group.position.set(-0.22 + col * 0.72, 0.36 + (i % 2) * 0.07, -0.82 + row * 0.55);
      h.group.rotation.y = -0.25;
      this.p4Sp2Group.add(h.group);
    }
    this.p4TargetRisks = [
      Math.max(0.12, st.riskSoloRare * 1.9),
      Math.max(0.12, st.riskJoined * 1.9),
    ];
  }

  // =========================================================================
  // PAGE 5: ORIGIN OF APOSEMATISM (SOLITARY vs KIN-CLUSTERED BROODS)
  // =========================================================================

  private buildPage5Aposematic(): void {
    const g = this.pageGroups.aposematic;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 3.1), this.walnutMat);
    frame.position.set(0, 0.08, 0);
    frame.castShadow = true;
    g.add(frame);

    const floor = new THREE.Mesh(new THREE.BoxGeometry(4.96, 0.175, 2.86), this.floorMat);
    floor.position.set(0, 0.085, 0);
    floor.receiveShadow = true;
    g.add(floor);

    // 4 sculpted broad waxy rainforest leaves!
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x3b7a46, roughness: 0.52 });
    const leafCoords: [number, number][] = [
      [-1.35, -0.68],
      [1.35, -0.68],
      [-1.35, 0.68],
      [1.35, 0.68],
    ];
    leafCoords.forEach(([x, z]) => {
      const leaf = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.78, 0.04, 24), leafMat);
      leaf.scale.set(1.22, 1, 0.82);
      leaf.position.set(x, 0.19, z);
      leaf.receiveShadow = true;
      g.add(leaf);
    });

    g.add(this.p5LarvaGroup);

    const pLeaf = createEngravedPlaque('Host-Plant Leaves', 'solitary vs. kin-clustered brood', 1.88, '#9e3b1c');
    pLeaf.position.set(0, 0.03, 1.92);
    g.add(pLeaf);
  }

  public updateAposematicScene(clustered: boolean): void {
    while (this.p5LarvaGroup.children.length > 0) {
      this.p5LarvaGroup.remove(this.p5LarvaGroup.children[0]);
    }
    const orangeMat = new THREE.MeshPhysicalMaterial({ color: 0xe85a1c, roughness: 0.28, clearcoat: 0.6 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x1e1a18, roughness: 0.65 });
    const crypticMat = new THREE.MeshStandardMaterial({ color: 0x5c8c54, roughness: 0.82 });

    const makeLarva = (bright: boolean) => {
      const lg = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 6, 10), bright ? orangeMat : crypticMat);
      body.rotation.z = Math.PI / 2;
      body.castShadow = true;
      lg.add(body);
      if (bright) {
        for (const ox of [-0.07, 0, 0.07]) {
          const band = new THREE.Mesh(new THREE.TorusGeometry(0.056, 0.015, 6, 14), stripeMat);
          band.rotation.y = Math.PI / 2;
          band.position.x = ox;
          lg.add(band);
        }
      }
      return lg;
    };

    const leafCoords: [number, number][] = [
      [-1.35, -0.68],
      [1.35, -0.68],
      [-1.35, 0.68],
      [1.35, 0.68],
    ];

    if (clustered) {
      // One tight glowing kin-cluster of 6 bright orange-banded siblings on Front-Left leaf + cryptic broods on other leaves!
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(0.46, 0.56, 28),
        new THREE.MeshBasicMaterial({ color: 0x35b878, side: THREE.DoubleSide })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(-1.35, 0.225, 0.68);
      this.p5LarvaGroup.add(halo);

      for (let i = 0; i < 6; i++) {
        const ang = (i / 6) * Math.PI * 2;
        const lv = makeLarva(true);
        lv.position.set(-1.35 + Math.cos(ang) * 0.26, 0.27, 0.68 + Math.sin(ang) * 0.2);
        lv.rotation.y = ang;
        this.p5LarvaGroup.add(lv);
      }
      [leafCoords[0], leafCoords[1], leafCoords[3]].forEach(([lx, lz]) => {
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2 + 0.4;
          const lv = makeLarva(false);
          lv.position.set(lx + Math.cos(ang) * 0.3, 0.27, lz + Math.sin(ang) * 0.22);
          lv.rotation.y = ang;
          this.p5LarvaGroup.add(lv);
        }
      });
    } else {
      // Solitary: bright rare mutants scattered one per leaf surrounded by cryptic larvae (no protective kin halo!)
      const rng = createSeededRng(1988);
      leafCoords.forEach(([lx, lz], idx) => {
        const lv = makeLarva(idx < 2);
        lv.position.set(lx + rng.range(-0.35, 0.35), 0.27, lz + rng.range(-0.22, 0.22));
        lv.rotation.y = rng.range(0, Math.PI);
        this.p5LarvaGroup.add(lv);
        for (let k = 0; k < 3; k++) {
          const cr = makeLarva(false);
          cr.position.set(lx + rng.range(-0.45, 0.45), 0.27, lz + rng.range(-0.28, 0.28));
          cr.rotation.y = rng.range(0, Math.PI);
          this.p5LarvaGroup.add(cr);
        }
      });
    }
  }

  // =========================================================================
  // PAGE 6: CHECK BACKDROPS
  // =========================================================================

  public setCheckCaseBackdrop(caseIdx: number): void {
    this.pageGroups.ratio.visible = caseIdx === 0;
    this.pageGroups.imperfect.visible = caseIdx === 1;
    this.pageGroups.aposematic.visible = caseIdx === 2;
    this.pageGroups.forage.visible = false;
    this.pageGroups.mullerian.visible = false;
  }

  // =========================================================================
  // LIFECYCLE, CAMERA & RAYCAST
  // =========================================================================

  public setPage(page: BitterPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as BitterPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });

    if (page === 'forage') {
      this.targetAzimuth = 0.04;
      this.targetPolar = 0.64;
      this.fitDist = 9.0;
    } else if (page === 'ratio') {
      this.targetAzimuth = 0.06;
      this.targetPolar = 0.56;
      this.fitDist = 9.6;
    } else if (page === 'imperfect') {
      this.targetAzimuth = 0.04;
      this.targetPolar = 0.50;
      this.fitDist = 8.9;
    } else if (page === 'mullerian') {
      this.targetAzimuth = 0.06;
      this.targetPolar = 0.56;
      this.fitDist = 9.8;
    } else if (page === 'aposematic') {
      this.targetAzimuth = 0.04;
      this.targetPolar = 0.68;
      this.fitDist = 8.8;
    } else {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.56;
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
      this.downXY = { x: e.clientX, y: e.clientY };
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
      this.targetPolar = Math.max(0.22, Math.min(1.22, this.targetPolar + dy * 0.0055));
    });
    window.addEventListener('pointerup', (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      el.style.cursor = 'grab';
      const moved = Math.hypot(e.clientX - this.downXY.x, e.clientY - this.downXY.y);
      if (moved < 6 && this.activePage === 'forage' && this.onInsectClick) {
        const rect = el.getBoundingClientRect();
        this.ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.ndc, this.camera);
        const hits = this.raycaster.intersectObjects(this.p1InsectGroup.children, true);
        if (hits.length > 0) {
          let obj: THREE.Object3D | null = hits[0].object;
          while (obj && obj.userData.insectId === undefined) obj = obj.parent;
          if (obj && typeof obj.userData.insectId === 'number') {
            this.onInsectClick(obj.userData.insectId);
          }
        }
      }
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
    const lookY = 0.56;
    this.camera.position.set(
      Math.sin(this.curAzimuth) * Math.cos(this.curPolar) * r,
      lookY + Math.sin(this.curPolar) * r,
      Math.cos(this.curAzimuth) * Math.cos(this.curPolar) * r
    );
    this.camera.lookAt(0, lookY, 0);

    // Gentle wing flutter on clearing butterflies + jacamar swoop bob
    for (const h of this.animHandles) {
      const flap = 0.25 + Math.sin(t * 5.2 + h.phase) * 0.38;
      h.rightPivot.rotation.z = flap;
      h.leftPivot.rotation.z = -flap;
    }
    if (this.p1SwoopT > 0) {
      this.p1SwoopT = Math.max(0, this.p1SwoopT - dt * 2.2);
      this.p1Jacamar.rotation.x = Math.sin(this.p1SwoopT * Math.PI) * 0.42;
    }

    // Page 2 survival bar lerp
    if (this.pageGroups.ratio.visible) {
      const h = this.p2SurvBar.scale.y + (this.p2TargetSurvH - this.p2SurvBar.scale.y) * 0.14;
      this.p2SurvBar.scale.y = h;
      this.p2SurvBar.position.y = 0.16 + h / 2;
    }

    // Page 4 Müllerian risk pillars lerp
    if (this.pageGroups.mullerian.visible) {
      const h1 = this.p4RiskSoloBar.scale.y + (this.p4TargetRisks[0] - this.p4RiskSoloBar.scale.y) * 0.14;
      this.p4RiskSoloBar.scale.y = h1;
      this.p4RiskSoloBar.position.y = 0.16 + h1 / 2;

      const h2 = this.p4RiskJoinBar.scale.y + (this.p4TargetRisks[1] - this.p4RiskJoinBar.scale.y) * 0.14;
      this.p4RiskJoinBar.scale.y = h2;
      this.p4RiskJoinBar.position.y = 0.16 + h2 / 2;
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
