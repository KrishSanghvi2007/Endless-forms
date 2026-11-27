import * as THREE from 'three';
import { createSeededRng } from '../../sim/adapter';
import {
  hwExpected,
  inbredExpected,
  type BeachBeetle,
  type Genotype,
  type GenotypeTriple,
} from './hweMath';

export type HwePageId =
  | 'copies'
  | 'square'
  | 'definetti'
  | 'census'
  | 'forces'
  | 'check';

export type ForceMode = 'inbreeding' | 'wahlund' | 'warfarin';

export interface HweSceneCallbacks {
  onBeetleOpened?: (id: number, genotype: Genotype) => void;
  onTrianglePick?: (aa: number, het: number, rec: number) => void;
  onQuadratDrop?: (x: number, z: number) => void;
}

interface InteractiveBeetle {
  id: number;
  genotype: Genotype;
  opened: boolean;
  openProgress: number;
  group: THREE.Group;
  leftElytron: THREE.Group;
  rightElytron: THREE.Group;
  leftPearl: THREE.Mesh;
  rightPearl: THREE.Mesh;
  hitMesh: THREE.Mesh;
}

interface FlyingPearl {
  mesh: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
  t: number;
  duration: number;
  isA: boolean;
}

interface FlyingGamete {
  mesh: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
  t: number;
  duration: number;
}

const COL_A = 0x2e61d1;      // D4 fixed cobalt blue for Allele A
const COL_a = 0xe5ae1e;      // D4 fixed warm amber for Allele a
const COL_INK = 0x29211b;
const COL_BRASS = 0xb88b3b;
const COL_PAPER_IVORY = 0xf4ecda;

// =============================================================================
// PROCEDURAL NATURALIST PBR TEXTURES & ENGRAVED 3D PLAQUES
// =============================================================================

/** Engraved museum-ivory & ink 3D label plaque sitting cleanly inside the diorama */
function createEngravedPlaque(
  text: string,
  subtext?: string,
  width = 1.15,
  accentHex = '#29211b'
): THREE.Mesh {
  const cw = 320;
  const ch = subtext ? 112 : 76;
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d')!;

  // Parchment card fill with delicate brass double border
  ctx.fillStyle = '#faf5e8';
  ctx.beginPath();
  ctx.roundRect(4, 4, cw - 8, ch - 8, 12);
  ctx.fill();

  ctx.strokeStyle = 'rgba(92, 68, 42, 0.45)';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.strokeStyle = 'rgba(184, 139, 59, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(10, 10, cw - 20, ch - 20, 8);
  ctx.stroke();

  ctx.fillStyle = accentHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 28px Georgia, serif';
  ctx.fillText(text, cw / 2, subtext ? ch * 0.38 : ch * 0.52);

  if (subtext) {
    ctx.fillStyle = '#685b4e';
    ctx.font = '500 20px ui-monospace, Menlo, monospace';
    ctx.fillText(subtext, cw / 2, ch * 0.72);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const h = width * (ch / cw);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, h),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

/** Rich organic wood-grain texture for carved walnut specimen trays */
function createWalnutTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5c3f27';
  ctx.fillRect(0, 0, 256, 256);

  const rng = createSeededRng(202);
  for (let i = 0; i < 90; i++) {
    const y = rng.range(0, 256);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(40, 24, 12, 0.25)' : 'rgba(130, 92, 56, 0.18)';
    ctx.lineWidth = rng.range(1, 3.8);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + rng.range(-8, 8), 170, y + rng.range(-8, 8), 256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Watercolour sandy shore or dune/meadow texture with soft organic ripples & mottling */
function createTerrainTexture(
  baseHex: string,
  warmHex: string,
  speckHex: string,
  seed: number,
  ripples = true
): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 256, 256);

  const rng = createSeededRng(seed);
  // Soft watercolour wash patches
  for (let i = 0; i < 45; i++) {
    ctx.fillStyle = i % 2 === 0 ? warmHex : speckHex;
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.ellipse(
      rng.range(0, 256),
      rng.range(0, 256),
      rng.range(18, 52),
      rng.range(12, 36),
      rng.range(0, Math.PI),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  // Subtle wind-sand ripples
  if (ripples) {
    ctx.strokeStyle = speckHex;
    ctx.globalAlpha = 0.09;
    for (let y = 10; y < 256; y += 22) {
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(85, y - 6, 170, y + 6, 256, y);
      ctx.stroke();
    }
  }
  // Mineral & organic grain flecks
  for (let i = 0; i < 650; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#faf4e6' : speckHex;
    ctx.globalAlpha = 0.07 + rng.next() * 0.1;
    ctx.beginPath();
    ctx.arc(rng.range(0, 256), rng.range(0, 256), rng.range(0.7, 2.6), 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Cobblestone & timber-yard texture for the twilight Norway rat farmyard */
function createFarmyardTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#4f463b';
  ctx.fillRect(0, 0, 256, 256);

  const rng = createSeededRng(707);
  // Subtle worn flagstones & straw flecks
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 6; col++) {
      const x = col * 44 + (row % 2) * 20 - 8;
      const y = row * 32 + 2;
      const shade = Math.round(82 + rng.range(-12, 14));
      ctx.fillStyle = `rgb(${shade + 8}, ${shade}, ${shade - 10})`;
      ctx.beginPath();
      ctx.roundRect(x, y, 39, 27, 5);
      ctx.fill();
      ctx.strokeStyle = 'rgba(30, 22, 16, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  // Scattered golden hay straws
  ctx.strokeStyle = '#c8aa68';
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 60; i++) {
    const x = rng.range(0, 256);
    const y = rng.range(0, 256);
    const a = rng.range(0, Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 14);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.2);
  return tex;
}

/** Iridescent grooved elytra texture for sculpted beetles */
function createElytraTexture(baseHex: string, lightHex: string, darkHex: string): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const grad = ctx.createLinearGradient(0, 0, 128, 128);
  grad.addColorStop(0, lightHex);
  grad.addColorStop(0.5, baseHex);
  grad.addColorStop(1, darkHex);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);

  // Delicate longitudinal wing-case striae (beetle elytron grooves)
  ctx.strokeStyle = darkHex;
  ctx.globalAlpha = 0.24;
  ctx.lineWidth = 1.5;
  for (let x = 10; x < 128; x += 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 128);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Woven canvas burlap texture for grain sacks */
function createBurlapTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#d7be89';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(110, 84, 46, 0.24)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 128; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 128);
    ctx.moveTo(0, i);
    ctx.lineTo(128, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Build a sculpted glossy 3D beetle with hinged left/right grooved wing cases */
function createSculptedBeetle3D(
  genotype: Genotype,
  mats: {
    shellA: THREE.Material;
    shella: THREE.Material;
    darkBody: THREE.Material;
    pearlA: THREE.Material;
    pearla: THREE.Material;
  },
  scale = 1
): {
  group: THREE.Group;
  leftElytron: THREE.Group;
  rightElytron: THREE.Group;
  leftPearl: THREE.Mesh;
  rightPearl: THREE.Mesh;
  hitMesh: THREE.Mesh;
} {
  const group = new THREE.Group();
  group.scale.setScalar(scale);

  const phenoMat = genotype === 'aa' ? mats.shella : mats.shellA;

  // Abdomen base
  const abGeo = new THREE.SphereGeometry(0.16, 16, 12);
  abGeo.scale(0.85, 0.42, 1.15);
  const abdomen = new THREE.Mesh(abGeo, mats.darkBody);
  abdomen.position.set(0, 0.075, 0.03);
  abdomen.castShadow = true;
  group.add(abdomen);

  // Pronotum (thorax shield)
  const proGeo = new THREE.SphereGeometry(0.115, 14, 10);
  proGeo.scale(1.02, 0.62, 0.8);
  const pronotum = new THREE.Mesh(proGeo, phenoMat);
  pronotum.position.set(0, 0.10, -0.15);
  pronotum.castShadow = true;
  group.add(pronotum);

  // Head + eyes + articulated antennae & legs
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), mats.darkBody);
  head.position.set(0, 0.09, -0.25);
  head.castShadow = true;
  group.add(head);

  const legGeo = new THREE.CylinderGeometry(0.011, 0.008, 0.145, 5);
  for (const side of [-1, 1]) {
    const ant = new THREE.Mesh(legGeo, mats.darkBody);
    ant.scale.set(0.7, 0.88, 0.7);
    ant.position.set(side * 0.05, 0.10, -0.31);
    ant.rotation.set(1.12, 0, side * -0.45);
    group.add(ant);

    for (let l = 0; l < 3; l++) {
      const leg = new THREE.Mesh(legGeo, mats.darkBody);
      leg.position.set(side * 0.148, 0.045, -0.11 + l * 0.115);
      leg.rotation.z = side * 1.12;
      leg.rotation.y = (l - 1) * 0.25 * side;
      group.add(leg);
    }
  }

  // Hinged left & right grooved wing cases
  const elyGeo = new THREE.SphereGeometry(0.175, 16, 12, 0, Math.PI, 0, Math.PI * 0.62);
  elyGeo.scale(0.49, 0.56, 1.24);

  const leftElytron = new THREE.Group();
  leftElytron.position.set(-0.015, 0.105, -0.10);
  const lMesh = new THREE.Mesh(elyGeo, phenoMat);
  lMesh.position.set(-0.048, 0.0, 0.14);
  lMesh.rotation.y = Math.PI / 2;
  lMesh.castShadow = true;
  leftElytron.add(lMesh);
  group.add(leftElytron);

  const rightElytron = new THREE.Group();
  rightElytron.position.set(0.015, 0.105, -0.10);
  const rMesh = new THREE.Mesh(elyGeo, phenoMat);
  rMesh.position.set(0.048, 0.0, 0.14);
  rMesh.rotation.y = -Math.PI / 2;
  rMesh.castShadow = true;
  rightElytron.add(rMesh);
  group.add(rightElytron);

  // Two glowing allele pearls tucked inside
  const pGeo = new THREE.SphereGeometry(0.058, 14, 12);
  const leftIsA = genotype === 'AA' || genotype === 'Aa';
  const rightIsA = genotype === 'AA';

  const leftPearl = new THREE.Mesh(pGeo, leftIsA ? mats.pearlA : mats.pearla);
  leftPearl.position.set(-0.062, 0.115, 0.04);
  leftPearl.scale.setScalar(0.01);
  group.add(leftPearl);

  const rightPearl = new THREE.Mesh(pGeo, rightIsA ? mats.pearlA : mats.pearla);
  rightPearl.position.set(0.062, 0.115, 0.04);
  rightPearl.scale.setScalar(0.01);
  group.add(rightPearl);

  const hitMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 8, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hitMesh.position.set(0, 0.12, 0);
  group.add(hitMesh);

  return { group, leftElytron, rightElytron, leftPearl, rightPearl, hitMesh };
}

/** Upgraded sculpted 3D Norway rat (rounded body, snout, eyes, whiskers, paws, brass allele collar) */
function createRat3D(
  genotype: Genotype,
  mats: {
    bodyAA: THREE.Material;
    bodyAa: THREE.Material;
    bodyaa: THREE.Material;
    ear: THREE.Material;
    eye: THREE.Material;
    brass: THREE.Material;
    pearlA: THREE.Material;
    pearla: THREE.Material;
  }
): THREE.Group {
  const g = new THREE.Group();
  const bodyMat =
    genotype === 'AA' ? mats.bodyAA : genotype === 'Aa' ? mats.bodyAa : mats.bodyaa;

  // Haunch + torso (organic pear-shaped rodent silhouette)
  const haunch = new THREE.Mesh(new THREE.SphereGeometry(0.145, 16, 12), bodyMat);
  haunch.scale.set(1.28, 0.88, 0.96);
  haunch.position.set(-0.04, 0.115, 0);
  haunch.castShadow = true;
  g.add(haunch);

  const chest = new THREE.Mesh(new THREE.SphereGeometry(0.112, 14, 10), bodyMat);
  chest.scale.set(1.1, 0.85, 0.88);
  chest.position.set(0.11, 0.108, 0);
  chest.castShadow = true;
  g.add(chest);

  // Rounded snout + pink button nose + dark bead eyes
  const snout = new THREE.Mesh(new THREE.SphereGeometry(0.072, 12, 10), bodyMat);
  snout.scale.set(1.48, 0.74, 0.78);
  snout.position.set(0.23, 0.105, 0);
  snout.castShadow = true;
  g.add(snout);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), mats.ear);
  nose.position.set(0.325, 0.105, 0);
  g.add(nose);

  const earGeo = new THREE.SphereGeometry(0.046, 12, 10);
  earGeo.scale(0.45, 1.0, 0.92);
  const eyeGeo = new THREE.SphereGeometry(0.017, 8, 8);
  const pawGeo = new THREE.SphereGeometry(0.028, 8, 8);
  pawGeo.scale(1.3, 0.55, 0.8);

  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, mats.ear);
    ear.position.set(0.16, 0.195, s * 0.068);
    ear.rotation.z = -0.25;
    g.add(ear);

    const eye = new THREE.Mesh(eyeGeo, mats.eye);
    eye.position.set(0.24, 0.135, s * 0.048);
    g.add(eye);

    // Front & hind paws
    const fp = new THREE.Mesh(pawGeo, mats.ear);
    fp.position.set(0.12, 0.02, s * 0.065);
    const hp = new THREE.Mesh(pawGeo, mats.ear);
    hp.position.set(-0.08, 0.02, s * 0.08);
    g.add(fp, hp);
  }

  // Sinuous tapered tail
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.19, 0.08, 0),
    new THREE.Vector3(-0.34, 0.055, 0.055),
    new THREE.Vector3(-0.48, 0.04, -0.025),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 14, 0.014, 6, false), mats.ear);
  g.add(tail);

  // Brass saddle collar holding the two genotype allele pearls clearly
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.018, 12), mats.brass);
  collar.position.set(0.01, 0.21, 0);
  g.add(collar);

  const bGeo = new THREE.SphereGeometry(0.036, 12, 10);
  const p1 = new THREE.Mesh(bGeo, genotype === 'aa' ? mats.pearla : mats.pearlA);
  p1.position.set(0.01, 0.232, -0.038);
  const p2 = new THREE.Mesh(bGeo, genotype === 'AA' ? mats.pearlA : mats.pearla);
  p2.position.set(0.01, 0.232, 0.038);
  g.add(p1, p2);

  return g;
}

export class HweScene3D {
  private host: HTMLElement;
  private callbacks: HweSceneCallbacks;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  // Shared materials
  private shellAMat!: THREE.MeshPhysicalMaterial;
  private shellaMat!: THREE.MeshPhysicalMaterial;
  private darkBodyMat!: THREE.MeshStandardMaterial;
  private pearlAMat!: THREE.MeshStandardMaterial;
  private pearlaMat!: THREE.MeshStandardMaterial;
  private glassMat!: THREE.MeshPhysicalMaterial;
  private walnutMat!: THREE.MeshStandardMaterial;
  private brassMat!: THREE.MeshStandardMaterial;

  // Page root groups
  private pageGroups: Record<HwePageId, THREE.Group>;
  private activePage: HwePageId = 'copies';

  // --- Page 1: Beetle Tray + Glass Allele Jars ---
  private p1Beetles: InteractiveBeetle[] = [];
  private p1JarAFill!: THREE.Mesh;
  private p1JaraFill!: THREE.Mesh;
  private p1JarACount = 0;
  private p1JaraCount = 0;
  private flyingPearls: FlyingPearl[] = [];
  private p1JarAPos = new THREE.Vector3(2.15, 0.55, -0.46);
  private p1JaraPos = new THREE.Vector3(2.15, 0.55, 0.62);

  // --- Page 2: 3D p × q Gamete Square + Merging Columns ---
  private p2P = 0.3;
  private p2Merged = false;
  private p2MergeT = 0;
  private p2TileAA!: THREE.Mesh;
  private p2TileAa!: THREE.Mesh;
  private p2TileaA!: THREE.Mesh;
  private p2Tileaa!: THREE.Mesh;
  private p2ColAA!: THREE.Mesh;
  private p2ColAa!: THREE.Mesh;
  private p2ColaA!: THREE.Mesh;
  private p2Colaa!: THREE.Mesh;
  private p2ColHeights = [0.05, 0.05, 0.05, 0.05];
  private p2TargetHeights = [0.18, 0.42, 0.42, 0.98];
  private p2EggSpheres: THREE.Mesh[] = [];
  private p2SpermHeads: THREE.Mesh[] = [];
  private flyingGametes: FlyingGamete[] = [];

  // --- Page 3: 3D de Finetti Triangle Sculpture ---
  private p3TriHitMesh!: THREE.Mesh;
  private p3ParentBeacon!: THREE.Mesh;
  private p3OffspringBeacon!: THREE.Mesh;
  private p3Gen2Beacon!: THREE.Mesh;
  private p3JumpArc!: THREE.Line;
  private p3ParentTarget = new THREE.Vector3(0, 0.16, 0);
  private p3OffspringTarget = new THREE.Vector3(0, 0.16, 0);
  private p3ShowGen2 = false;
  private p3Gen2Target = new THREE.Vector3(0, 0.16, 0);

  // --- Page 4: 300-Beetle Beach + Movable Quadrat ---
  private p4BeachHit!: THREE.Mesh;
  private p4Quadrat!: THREE.Group;
  private p4QuadratTarget = new THREE.Vector3(0, 0.08, 0);
  private p4LeftInst!: THREE.InstancedMesh;
  private p4RightInst!: THREE.InstancedMesh;

  // --- Page 5: Force Lab (Inbreeding · Wahlund · Warfarin Rats) ---
  private p5ForceMode: ForceMode = 'inbreeding';
  private p5InbGroup = new THREE.Group();
  private p5WahlGroup = new THREE.Group();
  private p5WarfGroup = new THREE.Group();
  private p5InbBeetles: THREE.Group[] = [];
  private p5InbJarAFill!: THREE.Mesh;
  private p5InbJaraFill!: THREE.Mesh;
  private p5WahlRope!: THREE.Group;
  private p5WahlRopeY = 1.6;
  private p5WahlLeftInst!: THREE.InstancedMesh;
  private p5WahlRightInst!: THREE.InstancedMesh;
  private p5RatGroup = new THREE.Group();
  private p5TrayGroups: THREE.Group[] = [];
  private p5RatEntries: { group: THREE.Group; laneZ: number; phase: number; speed: number }[] = [];

  // --- Page 6: Check Specimens ---
  private p6Container = new THREE.Group();

  // Camera orbit state
  private fitDist = 7.4;
  private targetAzimuth = 0.08;
  private targetPolar = 0.68;
  private targetDist = 7.4;
  private curAzimuth = 0.08;
  private curPolar = 0.68;
  private curDist = 7.4;
  private dragging = false;
  private pointerDown = { x: 0, y: 0 };
  private lastPointer = { x: 0, y: 0 };
  private raycaster = new THREE.Raycaster();
  private pointerNdc = new THREE.Vector2(-99, -99);
  private clock = new THREE.Clock();

  constructor(host: HTMLElement, callbacks: HweSceneCallbacks) {
    this.host = host;
    this.callbacks = callbacks;

    this.scene = new THREE.Scene();
    const w = Math.max(host.clientWidth, 320);
    const h = Math.max(host.clientHeight, 320);
    this.camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 60);
    this.fitDist = this.computeFitDistance(w / h);
    this.targetDist = this.fitDist;
    this.curDist = this.fitDist;

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;
    this.renderer.setClearColor(0x000000, 0);
    host.appendChild(this.renderer.domElement);

    // Warm museum sunlight + sky bounce
    this.scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd8c9aa, 1.18));

    const key = new THREE.DirectionalLight(0xfff6e3, 1.58);
    key.position.set(-2.5, 8.2, 3.4);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 22;
    key.shadow.camera.left = -4.6;
    key.shadow.camera.right = 4.6;
    key.shadow.camera.top = 3.8;
    key.shadow.camera.bottom = -3.8;
    key.shadow.radius = 5;
    key.shadow.bias = -0.0005;
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0xd9eaf6, 0.56);
    rim.position.set(4.0, 3.2, -3.6);
    this.scene.add(rim);

    // Soft cast shadow catcher directly onto book paper
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 14),
      new THREE.ShadowMaterial({ color: 0x3a2b1d, opacity: 0.18 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.02;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    this.initSharedMaterials();

    this.pageGroups = {
      copies: new THREE.Group(),
      square: new THREE.Group(),
      definetti: new THREE.Group(),
      census: new THREE.Group(),
      forces: new THREE.Group(),
      check: new THREE.Group(),
    };
    (Object.values(this.pageGroups) as THREE.Group[]).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.buildPage1Copies();
    this.buildPage2Square();
    this.buildPage3DeFinetti();
    this.buildPage4Census();
    this.buildPage5Forces();
    this.pageGroups.check.add(this.p6Container);

    this.setPage('copies');
    this.updateCamera();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.bindPointerEvents();
    this.animate();
  }

  private initSharedMaterials(): void {
    this.shellAMat = new THREE.MeshPhysicalMaterial({
      map: createElytraTexture('#2e61d1', '#5a8bf0', '#1c3e91'),
      roughness: 0.22,
      metalness: 0.16,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });
    this.shellaMat = new THREE.MeshPhysicalMaterial({
      map: createElytraTexture('#e5ae1e', '#f8d568', '#a67208'),
      roughness: 0.24,
      metalness: 0.14,
      clearcoat: 0.76,
      clearcoatRoughness: 0.18,
    });
    this.darkBodyMat = new THREE.MeshStandardMaterial({
      color: 0x241d17,
      roughness: 0.52,
      metalness: 0.12,
    });
    this.pearlAMat = new THREE.MeshStandardMaterial({
      color: 0x457cf0,
      roughness: 0.24,
      metalness: 0.1,
      emissive: 0x163175,
      emissiveIntensity: 0.22,
    });
    this.pearlaMat = new THREE.MeshStandardMaterial({
      color: 0xf2c138,
      roughness: 0.24,
      metalness: 0.1,
      emissive: 0x6e4a06,
      emissiveIntensity: 0.18,
    });
    this.glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xf6fbff,
      roughness: 0.08,
      metalness: 0.0,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.walnutMat = new THREE.MeshStandardMaterial({
      map: createWalnutTexture(),
      roughness: 0.62,
      metalness: 0.05,
    });
    this.brassMat = new THREE.MeshStandardMaterial({
      color: COL_BRASS,
      roughness: 0.32,
      metalness: 0.68,
    });
  }

  private computeFitDistance(aspect: number): number {
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const neededW = 6.35;
    const neededH = 3.75;
    const dW = neededW / (2 * tanHalfFov * Math.max(aspect, 0.58));
    const dH = neededH / (2 * tanHalfFov);
    return Math.max(7.0, dW, dH);
  }

  // =========================================================================
  // PAGE 1: BEETLE ISLE SPECIMEN TRAY + GLASS ALLELE JARS
  // =========================================================================

  private buildPage1Copies(): void {
    const g = this.pageGroups.copies;

    const trayFrame = new THREE.Mesh(new THREE.BoxGeometry(4.32, 0.15, 3.16), this.walnutMat);
    trayFrame.position.set(-0.62, 0.075, 0.05);
    trayFrame.castShadow = true;
    trayFrame.receiveShadow = true;
    g.add(trayFrame);

    const sandMat = new THREE.MeshStandardMaterial({
      map: createTerrainTexture('#eadcc0', '#dcc59a', '#b59a6e', 42, true),
      roughness: 0.92,
    });
    const sandBed = new THREE.Mesh(new THREE.BoxGeometry(4.06, 0.16, 2.92), sandMat);
    sandBed.position.set(-0.62, 0.08, 0.05);
    sandBed.receiveShadow = true;
    g.add(sandBed);

    const genotypes: Genotype[] = [
      'AA', 'Aa', 'aa', 'Aa', 'aa',
      'aa', 'Aa', 'aa', 'AA', 'Aa',
      'Aa', 'aa', 'Aa', 'aa', 'aa',
      'aa', 'Aa', 'aa', 'Aa', 'aa',
    ];
    const rng = createSeededRng(101);
    const mats = {
      shellA: this.shellAMat,
      shella: this.shellaMat,
      darkBody: this.darkBodyMat,
      pearlA: this.pearlAMat,
      pearla: this.pearlaMat,
    };

    genotypes.forEach((geno, idx) => {
      const col = idx % 5;
      const row = Math.floor(idx / 5);
      const x = -2.18 + col * 0.78 + rng.range(-0.11, 0.11);
      const z = -0.94 + row * 0.66 + rng.range(-0.08, 0.08);
      const b = createSculptedBeetle3D(geno, mats, 0.96);
      b.group.position.set(x, 0.165, z);
      b.group.rotation.y = rng.range(-0.7, 0.7);
      b.hitMesh.userData.beetleId = idx;
      g.add(b.group);

      this.p1Beetles.push({
        id: idx,
        genotype: geno,
        opened: false,
        openProgress: 0,
        ...b,
      });
    });

    // Carved walnut jar coaster + two labelled glass allele jars
    const coaster = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.09, 2.65), this.walnutMat);
    coaster.position.set(2.15, 0.045, 0.08);
    coaster.castShadow = true;
    coaster.receiveShadow = true;
    g.add(coaster);

    const makeJar = (pos: THREE.Vector3, fillMat: THREE.Material, collarColor: number): THREE.Mesh => {
      const jarG = new THREE.Group();
      jarG.position.set(pos.x, 0.09, pos.z);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.42, 0.07, 24), this.brassMat);
      base.position.y = 0.035;
      base.castShadow = true;
      jarG.add(base);

      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 1.0, 24), fillMat);
      fill.position.y = 0.08;
      fill.scale.set(1, 0.02, 1);
      jarG.add(fill);

      const wall = new THREE.Mesh(
        new THREE.CylinderGeometry(0.39, 0.39, 1.08, 24, 1, true),
        this.glassMat
      );
      wall.position.y = 0.59;
      jarG.add(wall);

      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.036, 10, 28),
        new THREE.MeshStandardMaterial({ color: collarColor, roughness: 0.32, metalness: 0.28 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 1.13;
      jarG.add(rim);

      g.add(jarG);
      return fill;
    };

    this.p1JarAFill = makeJar(this.p1JarAPos, this.pearlAMat, COL_A);
    this.p1JaraFill = makeJar(this.p1JaraPos, this.pearlaMat, COL_a);

    // Engraved museum plaques right beside the glass jars!
    const plaqueA = createEngravedPlaque('A Jar', 'blue copies (p)', 1.05, '#2653b8');
    plaqueA.position.set(2.15, 0.098, -1.08);
    g.add(plaqueA);

    const plaquea = createEngravedPlaque('a Jar', 'amber copies (q)', 1.05, '#9e6e0a');
    plaquea.position.set(2.15, 0.098, 1.24);
    g.add(plaquea);
  }

  public openBeetleById(id: number, emitPearl = true): void {
    const b = this.p1Beetles[id];
    if (!b || b.opened) return;
    b.opened = true;

    const aCopies = b.genotype === 'AA' ? 2 : b.genotype === 'Aa' ? 1 : 0;
    const qCopies = 2 - aCopies;
    this.p1JarACount += aCopies;
    this.p1JaraCount += qCopies;

    if (emitPearl) {
      const origin = b.group.position.clone().add(new THREE.Vector3(0, 0.2, 0));
      const copies: boolean[] =
        b.genotype === 'AA' ? [true, true] : b.genotype === 'Aa' ? [true, false] : [false, false];
      copies.forEach((isA, idx) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.072, 12, 10),
          isA ? this.pearlAMat : this.pearlaMat
        );
        mesh.position.copy(origin);
        this.pageGroups.copies.add(mesh);
        this.flyingPearls.push({
          mesh,
          start: origin.clone().add(new THREE.Vector3(idx * 0.08 - 0.04, 0, 0)),
          end: (isA ? this.p1JarAPos : this.p1JaraPos).clone(),
          t: -idx * 0.14,
          duration: 0.56,
          isA,
        });
      });
    }

    this.callbacks.onBeetleOpened?.(id, b.genotype);
  }

  public openAllBeetles(): void {
    this.p1Beetles.forEach((b, idx) => {
      if (!b.opened) {
        this.openBeetleById(idx, idx % 2 === 0);
      }
    });
  }

  public resetPage1Beetles(): void {
    this.p1JarACount = 0;
    this.p1JaraCount = 0;
    this.p1Beetles.forEach((b) => {
      b.opened = false;
      b.openProgress = 0;
    });
  }

  public getPage1Counts(): {
    opened: number;
    total: number;
    aCount: number;
    qCount: number;
    aa: number;
    het: number;
    rec: number;
  } {
    let opened = 0;
    let aa = 0;
    let het = 0;
    let rec = 0;
    for (const b of this.p1Beetles) {
      if (b.opened) {
        opened += 1;
        if (b.genotype === 'AA') aa += 1;
        else if (b.genotype === 'Aa') het += 1;
        else rec += 1;
      }
    }
    return {
      opened,
      total: this.p1Beetles.length,
      aCount: this.p1JarACount,
      qCount: this.p1JaraCount,
      aa,
      het,
      rec,
    };
  }

  // =========================================================================
  // PAGE 2: 3D p × q GAMETE PAIRING BOARD & MERGING 2pq PILLARS
  // =========================================================================

  private buildPage2Square(): void {
    const g = this.pageGroups.square;

    const boardBase = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.15, 3.42), this.walnutMat);
    boardBase.position.set(0.15, 0.075, 0.15);
    boardBase.castShadow = true;
    boardBase.receiveShadow = true;
    g.add(boardBase);

    const innerPaper = new THREE.Mesh(
      new THREE.BoxGeometry(3.12, 0.16, 3.12),
      new THREE.MeshStandardMaterial({ color: COL_PAPER_IVORY, roughness: 0.88 })
    );
    innerPaper.position.set(0.15, 0.08, 0.15);
    innerPaper.receiveShadow = true;
    g.add(innerPaper);

    const makeTileAndCol = (tileCol: number, colCol: number) => {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.05, 1),
        new THREE.MeshStandardMaterial({ color: tileCol, roughness: 0.42, metalness: 0.08 })
      );
      tile.receiveShadow = true;
      g.add(tile);

      const col = new THREE.Mesh(
        new THREE.BoxGeometry(0.54, 1, 0.54),
        new THREE.MeshPhysicalMaterial({
          color: colCol,
          roughness: 0.2,
          metalness: 0.08,
          clearcoat: 0.7,
          transparent: true,
          opacity: 0.92,
        })
      );
      col.castShadow = true;
      col.receiveShadow = true;
      g.add(col);
      return { tile, col };
    };

    const qAA = makeTileAndCol(0x3a6ed8, 0x2e61d1);
    const qAa = makeTileAndCol(0x4b948b, 0x2f857b);
    const qaA = makeTileAndCol(0x4b948b, 0x2f857b);
    const qaa = makeTileAndCol(0xe7b630, 0xe0a518);

    this.p2TileAA = qAA.tile;
    this.p2ColAA = qAA.col;
    this.p2TileAa = qAa.tile;
    this.p2ColAa = qAa.col;
    this.p2TileaA = qaA.tile;
    this.p2ColaA = qaA.col;
    this.p2Tileaa = qaa.tile;
    this.p2Colaa = qaa.col;

    // Engraved edge plaques: Eggs (top) & Sperm (left)
    const eggPlaque = createEngravedPlaque('Eggs (p · q)', undefined, 1.35, '#29211b');
    eggPlaque.position.set(0.15, 0.04, -2.18);
    g.add(eggPlaque);

    const spermPlaque = createEngravedPlaque('Sperm (p · q)', undefined, 1.35, '#29211b');
    spermPlaque.position.set(-2.32, 0.04, 0.15);
    spermPlaque.rotation.z = Math.PI / 2;
    g.add(spermPlaque);

    // Egg row (top) & Sperm row (left)
    const eggGeo = new THREE.SphereGeometry(0.085, 12, 10);
    for (let i = 0; i < 10; i++) {
      const egg = new THREE.Mesh(eggGeo, this.pearlAMat);
      egg.position.set(-1.15 + i * 0.285, 0.2, -1.78);
      egg.castShadow = true;
      this.p2EggSpheres.push(egg);
      g.add(egg);

      const spGroup = new THREE.Group();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), this.pearlAMat);
      head.scale.set(1.25, 0.9, 0.9);
      const tail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.005, 0.22, 6),
        this.darkBodyMat
      );
      tail.rotation.z = Math.PI / 2;
      tail.position.x = -0.15;
      spGroup.add(head, tail);
      spGroup.position.set(-1.82, 0.2, -1.15 + i * 0.285);
      this.p2SpermHeads.push(head);
      g.add(spGroup);
    }

    this.updateSquareGeometry();
  }

  public setSquareState(p: number, merged: boolean, spawnBurst = false): void {
    this.p2P = Math.max(0.05, Math.min(0.95, p));
    this.p2Merged = merged;
    const q = 1 - this.p2P;
    const scaleH = 2.15;
    this.p2TargetHeights = [
      Math.max(0.05, this.p2P * this.p2P * scaleH),
      Math.max(0.05, this.p2P * q * scaleH),
      Math.max(0.05, q * this.p2P * scaleH),
      Math.max(0.05, q * q * scaleH),
    ];

    const aCount = Math.round(this.p2P * 10);
    for (let i = 0; i < 10; i++) {
      const isA = i < aCount;
      this.p2EggSpheres[i].material = isA ? this.pearlAMat : this.pearlaMat;
      this.p2SpermHeads[i].material = isA ? this.pearlAMat : this.pearlaMat;
    }

    if (spawnBurst) {
      for (let k = 0; k < 10; k++) {
        const isEggA = Math.random() < this.p2P;
        const isSpermA = Math.random() < this.p2P;
        const dest =
          isEggA && isSpermA
            ? this.p2TileAA.position
            : isEggA
              ? this.p2TileAa.position
              : isSpermA
                ? this.p2TileaA.position
                : this.p2Tileaa.position;

        const m = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 10, 8),
          isEggA ? this.pearlAMat : this.pearlaMat
        );
        const start = new THREE.Vector3(-1.3 + Math.random() * 2.6, 0.24, -1.75);
        m.position.copy(start);
        this.pageGroups.square.add(m);
        this.flyingGametes.push({
          mesh: m,
          start,
          end: dest.clone().add(new THREE.Vector3(0, 0.25, 0)),
          t: -k * 0.04,
          duration: 0.42,
        });
      }
    }

    this.updateSquareGeometry();
  }

  private updateSquareGeometry(): void {
    const p = this.p2P;
    const q = 1 - p;
    const S = 2.86;
    const gap = 0.06;
    const leftEdge = 0.15 - S / 2;
    const topEdge = 0.15 - S / 2;

    const wP = Math.max(0.18, p * (S - gap));
    const wQ = Math.max(0.18, q * (S - gap));

    const xP = leftEdge + wP / 2;
    const xQ = leftEdge + wP + gap + wQ / 2;
    const zP = topEdge + wP / 2;
    const zQ = topEdge + wP + gap + wQ / 2;

    this.p2TileAA.scale.set(wP, 1, wP);
    this.p2TileAA.position.set(xP, 0.18, zP);

    this.p2TileAa.scale.set(wQ, 1, wP);
    this.p2TileAa.position.set(xQ, 0.18, zP);

    this.p2TileaA.scale.set(wP, 1, wQ);
    this.p2TileaA.position.set(xP, 0.18, zQ);

    this.p2Tileaa.scale.set(wQ, 1, wQ);
    this.p2Tileaa.position.set(xQ, 0.18, zQ);
  }

  // =========================================================================
  // PAGE 3: 3D BRASS & IVORY DE FINETTI TRIANGLE SCULPTURE
  // =========================================================================

  private triToXZ(aa: number, het: number, rec: number): [number, number] {
    const x = (rec - aa) * 2.1;
    const z = 1.25 - het * 2.9;
    return [x, z];
  }

  private buildPage3DeFinetti(): void {
    const g = this.pageGroups.definetti;

    const shape = new THREE.Shape();
    shape.moveTo(-2.35, -1.42);
    shape.lineTo(2.35, -1.42);
    shape.lineTo(0, 1.9);
    shape.closePath();

    const plinthGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
    });
    plinthGeo.rotateX(-Math.PI / 2);
    const plinth = new THREE.Mesh(
      plinthGeo,
      new THREE.MeshStandardMaterial({ color: COL_PAPER_IVORY, roughness: 0.82 })
    );
    plinth.position.y = 0.02;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    g.add(plinth);

    const hitGeo = new THREE.ShapeGeometry(shape);
    hitGeo.rotateX(-Math.PI / 2);
    this.p3TriHitMesh = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false }));
    this.p3TriHitMesh.position.y = 0.22;
    g.add(this.p3TriHitMesh);

    const corners = [
      new THREE.Vector3(-2.1, 0.22, 1.25),
      new THREE.Vector3(2.1, 0.22, 1.25),
      new THREE.Vector3(0, 0.22, -1.65),
      new THREE.Vector3(-2.1, 0.22, 1.25),
    ];
    for (let i = 0; i < 3; i++) {
      const curve = new THREE.LineCurve3(corners[i], corners[i + 1]);
      const rail = new THREE.Mesh(new THREE.TubeGeometry(curve, 8, 0.028, 8, false), this.brassMat);
      rail.castShadow = true;
      g.add(rail);
    }

    const addCornerPost = (pos: THREE.Vector3, col: number) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 16, 12),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.28, metalness: 0.18 })
      );
      m.position.copy(pos).add(new THREE.Vector3(0, 0.06, 0));
      m.castShadow = true;
      g.add(m);
    };
    addCornerPost(corners[0], COL_A);
    addCornerPost(corners[1], COL_a);
    addCornerPost(corners[2], 0x2f857b);

    // Engraved vertex plaques (AA, Aa, aa)
    const pAA = createEngravedPlaque('100% AA', 'p = 1.0', 0.96, '#2653b8');
    pAA.position.set(-2.35, 0.03, 1.72);
    g.add(pAA);

    const paa = createEngravedPlaque('100% aa', 'p = 0.0', 0.96, '#9e6e0a');
    paa.position.set(2.35, 0.03, 1.72);
    g.add(paa);

    const pAa = createEngravedPlaque('100% Aa', 'all het', 0.96, '#1f6a60');
    pAa.position.set(0, 0.03, -2.14);
    g.add(pAa);

    const gridMat = new THREE.LineBasicMaterial({ color: 0x8c7b65, transparent: true, opacity: 0.32 });
    for (const pTick of [0.2, 0.4, 0.5, 0.6, 0.8]) {
      const x = (1 - 2 * pTick) * 2.1;
      const maxHet = 1 - Math.abs(1 - 2 * pTick);
      const zTop = 1.25 - maxHet * 2.9;
      const lg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x, 0.22, 1.25),
        new THREE.Vector3(x, 0.22, zTop),
      ]);
      g.add(new THREE.Line(lg, gridMat));
    }

    // Raised golden 3D Hardy–Weinberg Parabola Arch
    const hwPts: THREE.Vector3[] = [];
    for (let i = 0; i <= 48; i++) {
      const p = i / 48;
      const [aa, het, rec] = hwExpected(p);
      const [x, z] = this.triToXZ(aa, het, rec);
      hwPts.push(new THREE.Vector3(x, 0.25, z));
    }
    const hwCurve = new THREE.CatmullRomCurve3(hwPts);
    const hwTube = new THREE.Mesh(
      new THREE.TubeGeometry(hwCurve, 64, 0.044, 10, false),
      new THREE.MeshStandardMaterial({
        color: 0xd4942a,
        roughness: 0.26,
        metalness: 0.56,
        emissive: 0x6e4306,
        emissiveIntensity: 0.2,
      })
    );
    hwTube.castShadow = true;
    g.add(hwTube);

    this.p3ParentBeacon = new THREE.Mesh(
      new THREE.TorusGeometry(0.15, 0.036, 12, 24),
      new THREE.MeshStandardMaterial({ color: COL_INK, roughness: 0.4 })
    );
    this.p3ParentBeacon.rotation.x = Math.PI / 2;
    this.p3ParentBeacon.position.set(0, 0.25, 1.25);
    g.add(this.p3ParentBeacon);

    this.p3OffspringBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 18, 14),
      new THREE.MeshStandardMaterial({
        color: 0xc24432,
        roughness: 0.25,
        metalness: 0.18,
        emissive: 0x5c140b,
        emissiveIntensity: 0.25,
      })
    );
    this.p3OffspringBeacon.castShadow = true;
    g.add(this.p3OffspringBeacon);

    this.p3Gen2Beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.115, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x2d8a7e, roughness: 0.25, metalness: 0.2 })
    );
    this.p3Gen2Beacon.visible = false;
    g.add(this.p3Gen2Beacon);

    const arcGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(),
    ]);
    this.p3JumpArc = new THREE.Line(
      arcGeo,
      new THREE.LineBasicMaterial({ color: 0xb84a27 })
    );
    g.add(this.p3JumpArc);

    this.setDeFinettiPoints([0.5, 0, 0.5], [0.25, 0.5, 0.25], null);
  }

  public setDeFinettiPoints(
    parents: GenotypeTriple,
    gen1: GenotypeTriple,
    gen2: GenotypeTriple | null
  ): void {
    const [px, pz] = this.triToXZ(parents[0], parents[1], parents[2]);
    const [ox, oz] = this.triToXZ(gen1[0], gen1[1], gen1[2]);
    this.p3ParentTarget.set(px, 0.25, pz);
    this.p3OffspringTarget.set(ox, 0.32, oz);

    const mid = new THREE.Vector3(
      (px + ox) / 2,
      0.78 + Math.hypot(ox - px, oz - pz) * 0.16,
      (pz + oz) / 2
    );
    const arcCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(px, 0.26, pz),
      mid,
      new THREE.Vector3(ox, 0.32, oz)
    );
    this.p3JumpArc.geometry.dispose();
    this.p3JumpArc.geometry = new THREE.BufferGeometry().setFromPoints(arcCurve.getPoints(28));

    if (gen2) {
      const [g2x, g2z] = this.triToXZ(gen2[0], gen2[1], gen2[2]);
      this.p3ShowGen2 = true;
      this.p3Gen2Target.set(g2x, 0.32, g2z);
      this.p3Gen2Beacon.visible = true;
    } else {
      this.p3ShowGen2 = false;
      this.p3Gen2Beacon.visible = false;
    }
  }

  // =========================================================================
  // PAGE 4: 300-BEETLE BEACH + MOVABLE 3D BRASS & ROPE QUADRAT
  // =========================================================================

  private buildPage4Census(): void {
    const g = this.pageGroups.census;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.56, 0.15, 3.26), this.walnutMat);
    frame.position.set(0, 0.075, 0);
    frame.castShadow = true;
    frame.receiveShadow = true;
    g.add(frame);

    const sandMat = new THREE.MeshStandardMaterial({
      map: createTerrainTexture('#ebdcb9', '#dbc496', '#b39567', 99, true),
      roughness: 0.92,
    });
    this.p4BeachHit = new THREE.Mesh(new THREE.BoxGeometry(5.32, 0.165, 3.02), sandMat);
    this.p4BeachHit.position.set(0, 0.08, 0);
    this.p4BeachHit.receiveShadow = true;
    g.add(this.p4BeachHit);

    const halfGeo = new THREE.SphereGeometry(0.068, 10, 8);
    halfGeo.scale(0.62, 0.55, 1.28);
    const instMat = new THREE.MeshStandardMaterial({ roughness: 0.34, metalness: 0.12 });

    this.p4LeftInst = new THREE.InstancedMesh(halfGeo, instMat, 300);
    this.p4RightInst = new THREE.InstancedMesh(halfGeo, instMat, 300);
    this.p4LeftInst.castShadow = true;
    this.p4RightInst.castShadow = true;
    g.add(this.p4LeftInst, this.p4RightInst);

    this.p4Quadrat = new THREE.Group();
    const qs = 0.66;
    const ropeMat = new THREE.MeshStandardMaterial({ color: 0xb84a27, roughness: 0.58 });
    const barGeoX = new THREE.CylinderGeometry(0.022, 0.022, qs * 2, 8);
    barGeoX.rotateZ(Math.PI / 2);
    const barGeoZ = new THREE.CylinderGeometry(0.022, 0.022, qs * 2, 8);
    barGeoZ.rotateX(Math.PI / 2);

    for (const s of [-1, 1]) {
      const bx = new THREE.Mesh(barGeoX, ropeMat);
      bx.position.set(0, 0.24, s * qs);
      bx.castShadow = true;
      this.p4Quadrat.add(bx);

      const bz = new THREE.Mesh(barGeoZ, ropeMat);
      bz.position.set(s * qs, 0.24, 0);
      bz.castShadow = true;
      this.p4Quadrat.add(bz);

      for (const s2 of [-1, 1]) {
        const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.024, 0.34, 10), this.brassMat);
        stake.position.set(s * qs, 0.21, s2 * qs);
        stake.castShadow = true;
        this.p4Quadrat.add(stake);
      }
    }
    this.p4Quadrat.position.set(0, 0.08, 0);
    g.add(this.p4Quadrat);
  }

  public setBeachPopulation(beetles: BeachBeetle[], quadratX?: number, quadratZ?: number): void {
    if (quadratX !== undefined && quadratZ !== undefined) {
      this.p4QuadratTarget.set(quadratX, 0.08, quadratZ);
    }

    const dummy = new THREE.Object3D();
    const colA = new THREE.Color(COL_A);
    const cola = new THREE.Color(COL_a);
    const colMuted = new THREE.Color(0x8a7d68);

    const count = Math.min(beetles.length, 300);
    for (let i = 0; i < count; i++) {
      const b = beetles[i];
      const cos = Math.cos(b.rot);
      const sin = Math.sin(b.rot);
      const off = 0.034;

      dummy.position.set(b.x - cos * off, 0.195, b.z + sin * off);
      dummy.rotation.set(0, b.rot, 0);
      dummy.scale.setScalar(b.sampled ? 1.15 : 0.92);
      dummy.updateMatrix();
      this.p4LeftInst.setMatrixAt(i, dummy.matrix);

      dummy.position.set(b.x + cos * off, 0.195, b.z - sin * off);
      dummy.updateMatrix();
      this.p4RightInst.setMatrixAt(i, dummy.matrix);

      if (!b.sampled) {
        this.p4LeftInst.setColorAt(i, colMuted);
        this.p4RightInst.setColorAt(i, colMuted);
      } else {
        this.p4LeftInst.setColorAt(i, b.genotype === 'aa' ? cola : colA);
        this.p4RightInst.setColorAt(i, b.genotype === 'AA' ? colA : cola);
      }
    }

    this.p4LeftInst.count = count;
    this.p4RightInst.count = count;
    this.p4LeftInst.instanceMatrix.needsUpdate = true;
    this.p4RightInst.instanceMatrix.needsUpdate = true;
    if (this.p4LeftInst.instanceColor) this.p4LeftInst.instanceColor.needsUpdate = true;
    if (this.p4RightInst.instanceColor) this.p4RightInst.instanceColor.needsUpdate = true;
  }

  // =========================================================================
  // PAGE 5: UPGRADED 3D FORCE LAB (INBREEDING · WAHLUND · WARFARIN RATS)
  // =========================================================================

  private buildPage5Forces(): void {
    const g = this.pageGroups.forces;
    g.add(this.p5InbGroup, this.p5WahlGroup, this.p5WarfGroup);

    // --- 5A: Inbreeding Textured Meadow + Earthy Burrows + Grass Tufts + Labelled Jars ---
    const rimRing = new THREE.Mesh(new THREE.CylinderGeometry(2.38, 2.44, 0.13, 40), this.walnutMat);
    rimRing.position.set(-0.62, 0.065, 0);
    rimRing.castShadow = true;
    this.p5InbGroup.add(rimRing);

    const meadow = new THREE.Mesh(
      new THREE.CylinderGeometry(2.26, 2.28, 0.15, 40),
      new THREE.MeshStandardMaterial({
        map: createTerrainTexture('#b4be8e', '#99aa72', '#7a8a58', 303, false),
        roughness: 0.92,
      })
    );
    meadow.position.set(-0.62, 0.075, 0);
    meadow.receiveShadow = true;
    this.p5InbGroup.add(meadow);

    const moundMat = new THREE.MeshStandardMaterial({
      map: createTerrainTexture('#8f6f4c', '#765738', '#523b24', 309, false),
      roughness: 0.94,
    });
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x221912, roughness: 1.0 });
    const tuftMat = new THREE.MeshStandardMaterial({ color: 0x627c44, roughness: 0.85 });
    const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xa69d8c, roughness: 0.88 });

    const rng5 = createSeededRng(505);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const bx = -0.62 + Math.cos(a) * 1.46;
      const bz = Math.sin(a) * 1.40;
      const mound = new THREE.Mesh(
        new THREE.SphereGeometry(0.33, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        moundMat
      );
      mound.scale.set(1.16, 0.54, 1.12);
      mound.position.set(bx, 0.145, bz);
      mound.castShadow = true;
      this.p5InbGroup.add(mound);

      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.115, 0.055, 14), holeMat);
      hole.position.set(bx, 0.295, bz);
      this.p5InbGroup.add(hole);

      // Tiny 3D grass blades & pebbles around burrows
      for (let t = 0; t < 3; t++) {
        const ta = a + rng5.range(-0.6, 0.6);
        const blade = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.13, 5), tuftMat);
        blade.position.set(bx + Math.cos(ta) * 0.34, 0.19, bz + Math.sin(ta) * 0.34);
        blade.rotation.z = rng5.range(-0.35, 0.35);
        this.p5InbGroup.add(blade);
      }
      const peb = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 0), pebbleMat);
      peb.position.set(bx * 0.7 - 0.15, 0.16, bz * 0.7);
      peb.scale.set(1.2, 0.6, 0.9);
      this.p5InbGroup.add(peb);
    }

    // Center engraved plaque on meadow
    const medPlaque = createEngravedPlaque('8 Family Burrows', '2 loci tracked', 1.28, '#3f4f2b');
    medPlaque.position.set(-0.62, 0.158, 0);
    this.p5InbGroup.add(medPlaque);

    // Steady A & a glass jars on carved walnut stand
    const jarStand = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.08, 2.38), this.walnutMat);
    jarStand.position.set(2.26, 0.04, 0);
    jarStand.castShadow = true;
    this.p5InbGroup.add(jarStand);

    const makeSmallJar = (zPos: number, fillMat: THREE.Material, collarCol: number): THREE.Mesh => {
      const jg = new THREE.Group();
      jg.position.set(2.26, 0.08, zPos);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.36, 0.05, 22), this.brassMat);
      base.position.y = 0.025;
      jg.add(base);
      const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.0, 20), fillMat);
      fill.position.y = 0.28;
      fill.scale.set(1, 0.5, 1);
      jg.add(fill);
      const wall = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 1.0, 20, 1, true), this.glassMat);
      wall.position.y = 0.53;
      jg.add(wall);
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.03, 10, 24),
        new THREE.MeshStandardMaterial({ color: collarCol, roughness: 0.35, metalness: 0.25 })
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 1.03;
      jg.add(rim);
      this.p5InbGroup.add(jg);
      return fill;
    };
    this.p5InbJarAFill = makeSmallJar(-0.56, this.pearlAMat, COL_A);
    this.p5InbJaraFill = makeSmallJar(0.56, this.pearlaMat, COL_a);

    const inbLabel = createEngravedPlaque('p = 0.50 fixed', 'jars stay level', 1.15, '#285e82');
    inbLabel.position.set(2.26, 0.04, 1.48);
    this.p5InbGroup.add(inbLabel);

    // --- 5B: Two Demes (Wahlund Beach: Dune Sand vs. Marsh Reeds) ---
    const wFrame = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.15, 3.08), this.walnutMat);
    wFrame.position.set(0, 0.075, 0);
    wFrame.castShadow = true;
    this.p5WahlGroup.add(wFrame);

    const duneBed = new THREE.Mesh(
      new THREE.BoxGeometry(2.62, 0.165, 2.84),
      new THREE.MeshStandardMaterial({
        map: createTerrainTexture('#eddcb8', '#dfc798', '#ba9b6a', 611, true),
        roughness: 0.92,
      })
    );
    duneBed.position.set(-1.31, 0.08, 0);
    duneBed.receiveShadow = true;
    this.p5WahlGroup.add(duneBed);

    const marshBed = new THREE.Mesh(
      new THREE.BoxGeometry(2.62, 0.165, 2.84),
      new THREE.MeshStandardMaterial({
        map: createTerrainTexture('#96a382', '#7e8f6b', '#5e6e4d', 612, false),
        roughness: 0.92,
      })
    );
    marshBed.position.set(1.31, 0.08, 0);
    marshBed.receiveShadow = true;
    this.p5WahlGroup.add(marshBed);

    // Decorative 3D marsh reeds along the far-right marsh border
    for (let r = 0; r < 10; r++) {
      const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.02, 0.34, 6), tuftMat);
      reed.position.set(2.48, 0.28, -1.1 + r * 0.24);
      reed.rotation.z = -0.15 + (r % 3) * 0.12;
      this.p5WahlGroup.add(reed);
    }

    const dunePlaque = createEngravedPlaque('Dune Deme', 'p = 0.80', 1.15, '#2653b8');
    dunePlaque.position.set(-1.32, 0.03, 1.84);
    this.p5WahlGroup.add(dunePlaque);

    const marshPlaque = createEngravedPlaque('Marsh Deme', 'p = 0.20', 1.15, '#9e6e0a');
    marshPlaque.position.set(1.32, 0.03, 1.84);
    this.p5WahlGroup.add(marshPlaque);

    const halfGeo = new THREE.SphereGeometry(0.07, 10, 8);
    halfGeo.scale(0.62, 0.55, 1.28);
    const instMat = new THREE.MeshStandardMaterial({ roughness: 0.34, metalness: 0.12 });
    this.p5WahlLeftInst = new THREE.InstancedMesh(halfGeo, instMat, 240);
    this.p5WahlRightInst = new THREE.InstancedMesh(halfGeo, instMat, 240);
    this.p5WahlGroup.add(this.p5WahlLeftInst, this.p5WahlRightInst);

    this.p5WahlRope = new THREE.Group();
    const ropeBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.032, 2.86, 10),
      new THREE.MeshStandardMaterial({ color: 0xb83828, roughness: 0.45 })
    );
    ropeBar.rotation.x = Math.PI / 2;
    ropeBar.position.y = 0.3;
    ropeBar.castShadow = true;
    this.p5WahlRope.add(ropeBar);
    for (const zEnd of [-1.42, 1.42]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.44, 10), this.brassMat);
      post.position.set(0, 0.22, zEnd);
      this.p5WahlRope.add(post);
    }
    this.p5WahlRope.position.y = 1.6;
    this.p5WahlGroup.add(this.p5WahlRope);

    // --- 5C: Upgraded Cobblestone Farmyard, Burlap Grain Sacks & Brass Bait Trays ---
    const yardFrame = new THREE.Mesh(new THREE.BoxGeometry(5.58, 0.15, 3.16), this.walnutMat);
    yardFrame.position.set(0, 0.075, 0);
    yardFrame.castShadow = true;
    this.p5WarfGroup.add(yardFrame);

    const yard = new THREE.Mesh(
      new THREE.BoxGeometry(5.32, 0.165, 2.92),
      new THREE.MeshStandardMaterial({ map: createFarmyardTexture(), roughness: 0.92 })
    );
    yard.position.set(0, 0.08, 0);
    yard.receiveShadow = true;
    this.p5WarfGroup.add(yard);

    const burlapMat = new THREE.MeshStandardMaterial({ map: createBurlapTexture(), roughness: 0.9 });
    const pelletMat = new THREE.MeshStandardMaterial({ color: 0x36a394, roughness: 0.6 });
    const trayRimMat = new THREE.MeshStandardMaterial({ color: 0xb53c2e, roughness: 0.4, metalness: 0.3 });

    for (let i = 0; i < 4; i++) {
      const z = -1.02 + i * 0.68;

      // Earth & timber burrow tunnel entrance on the left
      const arch = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.065, 10, 18, Math.PI), moundMat);
      arch.rotation.y = Math.PI / 2;
      arch.position.set(-2.36, 0.16, z);
      arch.castShadow = true;
      this.p5WarfGroup.add(arch);

      const darkMouth = new THREE.Mesh(new THREE.CircleGeometry(0.18, 12, 0, Math.PI), holeMat);
      darkMouth.rotation.y = Math.PI / 2;
      darkMouth.position.set(-2.35, 0.16, z);
      this.p5WarfGroup.add(darkMouth);

      // Sculpted burlap grain sack with cinched rope neck on the right
      const sackG = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), burlapMat);
      body.scale.set(0.9, 1.15, 0.95);
      body.position.y = 0.23;
      body.castShadow = true;
      const tie = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.022, 8, 16), this.walnutMat);
      tie.rotation.x = Math.PI / 2;
      tie.position.y = 0.44;
      const top = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.14, 10), burlapMat);
      top.rotation.x = Math.PI;
      top.position.y = 0.49;
      sackG.add(body, tie, top);
      sackG.position.set(2.26, 0.14, z);
      this.p5WarfGroup.add(sackG);

      // Realistic metallic warfarin bait tray filled with teal-green bait pellets
      const trayG = new THREE.Group();
      const dish = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.06, 0.36), trayRimMat);
      dish.position.y = 0.03;
      dish.castShadow = true;
      trayG.add(dish);
      for (let p = 0; p < 7; p++) {
        const pel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6), pelletMat);
        pel.rotation.z = Math.PI / 2;
        pel.rotation.y = p * 0.9;
        pel.position.set(-0.12 + (p % 3) * 0.11, 0.072, -0.08 + Math.floor(p / 3) * 0.07);
        trayG.add(pel);
      }
      trayG.position.set(0.05 + (i % 2) * 0.34 - 0.17, 0.16, z);
      this.p5TrayGroups.push(trayG);
      this.p5WarfGroup.add(trayG);
    }

    // Engraved farmyard labels
    const lBur = createEngravedPlaque('Burrows', undefined, 0.92, '#4f3a25');
    lBur.position.set(-2.15, 0.03, 1.85);
    const lBait = createEngravedPlaque('Warfarin Bait', undefined, 1.24, '#9c2d20');
    lBait.position.set(0.0, 0.03, 1.85);
    const lGrain = createEngravedPlaque('Grain Sacks', undefined, 1.12, '#7d5f24');
    lGrain.position.set(2.12, 0.03, 1.85);
    this.p5WarfGroup.add(lBur, lBait, lGrain);

    this.p5WarfGroup.add(this.p5RatGroup);
    this.setForceMode('inbreeding');
  }

  public setForceMode(mode: ForceMode): void {
    this.p5ForceMode = mode;
    this.p5InbGroup.visible = mode === 'inbreeding';
    this.p5WahlGroup.visible = mode === 'wahlund';
    this.p5WarfGroup.visible = mode === 'warfarin';
  }

  public updateInbreedingScene(p: number, F: number): void {
    this.p5InbBeetles.forEach((b) => this.p5InbGroup.remove(b));
    this.p5InbBeetles = [];

    const probs = inbredExpected(p, F);
    const total = 24;
    const nAA = Math.round(probs[0] * total);
    const nAa = Math.round(probs[1] * total);
    const naa = Math.max(0, total - nAA - nAa);

    const list: Genotype[] = [
      ...Array<Genotype>(nAA).fill('AA'),
      ...Array<Genotype>(nAa).fill('Aa'),
      ...Array<Genotype>(naa).fill('aa'),
    ];
    const rng = createSeededRng(77 + Math.round(F * 100));

    const halfGeo = new THREE.SphereGeometry(0.095, 12, 10);
    halfGeo.scale(0.62, 0.55, 1.28);
    const spotGeo = new THREE.SphereGeometry(0.042, 10, 8);
    const creamMat = new THREE.MeshStandardMaterial({ color: 0xf7f1e3 });

    list.forEach((geno, idx) => {
      const burrowIdx = idx % 8;
      const slot = Math.floor(idx / 8);
      const a = (burrowIdx / 8) * Math.PI * 2;
      const bx = -0.62 + Math.cos(a) * 1.46;
      const bz = Math.sin(a) * 1.40;
      const sa = a + (slot - 1) * 0.85;

      const bg = new THREE.Group();
      const left = new THREE.Mesh(halfGeo, geno === 'aa' ? this.shellaMat : this.shellAMat);
      left.position.x = -0.046;
      left.castShadow = true;
      const right = new THREE.Mesh(halfGeo, geno === 'AA' ? this.shellAMat : this.shellaMat);
      right.position.x = 0.046;
      right.castShadow = true;

      const spot = new THREE.Mesh(spotGeo, rng.next() < 0.5 ? this.darkBodyMat : creamMat);
      spot.position.set(0, 0.04, -0.11);

      bg.add(left, right, spot);
      bg.position.set(bx + Math.cos(sa) * 0.44, 0.195, bz + Math.sin(sa) * 0.44);
      bg.rotation.y = rng.range(0, Math.PI * 2);
      this.p5InbGroup.add(bg);
      this.p5InbBeetles.push(bg);
    });

    this.p5InbJarAFill.scale.set(1, Math.max(0.05, p * 0.9), 1);
    this.p5InbJarAFill.position.y = 0.06 + (p * 0.9) / 2;
    this.p5InbJaraFill.scale.set(1, Math.max(0.05, (1 - p) * 0.9), 1);
    this.p5InbJaraFill.position.y = 0.06 + ((1 - p) * 0.9) / 2;
  }

  public updateWahlundScene(beetles: BeachBeetle[], split: boolean): void {
    this.p5WahlRopeY = split ? 0.04 : 1.85;
    const dummy = new THREE.Object3D();
    const colA = new THREE.Color(COL_A);
    const cola = new THREE.Color(COL_a);
    const count = Math.min(beetles.length, 240);

    for (let i = 0; i < count; i++) {
      const b = beetles[i];
      const cos = Math.cos(b.rot);
      const sin = Math.sin(b.rot);
      const off = 0.036;

      dummy.position.set(b.x - cos * off, 0.2, b.z + sin * off);
      dummy.rotation.set(0, b.rot, 0);
      dummy.scale.setScalar(1.08);
      dummy.updateMatrix();
      this.p5WahlLeftInst.setMatrixAt(i, dummy.matrix);

      dummy.position.set(b.x + cos * off, 0.2, b.z - sin * off);
      dummy.updateMatrix();
      this.p5WahlRightInst.setMatrixAt(i, dummy.matrix);

      this.p5WahlLeftInst.setColorAt(i, b.genotype === 'aa' ? cola : colA);
      this.p5WahlRightInst.setColorAt(i, b.genotype === 'AA' ? colA : cola);
    }
    this.p5WahlLeftInst.count = count;
    this.p5WahlRightInst.count = count;
    this.p5WahlLeftInst.instanceMatrix.needsUpdate = true;
    this.p5WahlRightInst.instanceMatrix.needsUpdate = true;
    if (this.p5WahlLeftInst.instanceColor) this.p5WahlLeftInst.instanceColor.needsUpdate = true;
    if (this.p5WahlRightInst.instanceColor) this.p5WahlRightInst.instanceColor.needsUpdate = true;
  }

  public updateWarfarinScene(adults: GenotypeTriple, traysCount: number): void {
    this.p5TrayGroups.forEach((m, idx) => {
      m.visible = idx < traysCount;
    });

    while (this.p5RatGroup.children.length > 0) {
      this.p5RatGroup.remove(this.p5RatGroup.children[0]);
    }
    this.p5RatEntries = [];

    const mats = {
      bodyAA: new THREE.MeshStandardMaterial({ color: 0x7a899c, roughness: 0.78 }),
      bodyAa: new THREE.MeshStandardMaterial({ color: 0x8f8170, roughness: 0.78 }),
      bodyaa: new THREE.MeshStandardMaterial({ color: 0xb49464, roughness: 0.78 }),
      ear: new THREE.MeshStandardMaterial({ color: 0xdba0a4, roughness: 0.58 }),
      eye: new THREE.MeshStandardMaterial({ color: 0x161210, roughness: 0.2 }),
      brass: this.brassMat,
      pearlA: this.pearlAMat,
      pearla: this.pearlaMat,
    };

    const total = 16;
    const nAA = Math.round(adults[0] * total);
    const nAa = Math.round(adults[1] * total);
    const naa = Math.max(0, total - nAA - nAa);
    const list: Genotype[] = [
      ...Array<Genotype>(nAA).fill('AA'),
      ...Array<Genotype>(nAa).fill('Aa'),
      ...Array<Genotype>(naa).fill('aa'),
    ];

    list.forEach((geno, idx) => {
      const rat = createRat3D(geno, mats);
      const laneZ = -1.02 + (idx % 4) * 0.68 + ((idx % 3) - 1) * 0.08;
      const phase = (idx / total) * Math.PI * 2;
      rat.position.set(-0.15 + Math.sin(phase) * 1.7, 0.16, laneZ);
      this.p5RatGroup.add(rat);
      this.p5RatEntries.push({
        group: rat,
        laneZ,
        phase,
        speed: 0.62 + (idx % 3) * 0.16,
      });
    });
  }

  // =========================================================================
  // PAGE 6: CHECK SPECIMEN SWITCHER
  // =========================================================================

  public setCheckSpecimen(questionIndex: number): void {
    while (this.p6Container.children.length > 0) {
      this.p6Container.remove(this.p6Container.children[0]);
    }

    if (questionIndex === 0) {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.15, 3.2), this.walnutMat);
      frame.position.y = 0.075;
      frame.castShadow = true;
      this.p6Container.add(frame);

      const sand = new THREE.Mesh(
        new THREE.BoxGeometry(4.56, 0.165, 2.96),
        new THREE.MeshStandardMaterial({
          map: createTerrainTexture('#eadcc0', '#dbc496', '#b39567', 81, true),
          roughness: 0.92,
        })
      );
      sand.position.y = 0.08;
      sand.receiveShadow = true;
      this.p6Container.add(sand);

      const mats = {
        shellA: this.shellAMat,
        shella: this.shellaMat,
        darkBody: this.darkBodyMat,
        pearlA: this.pearlAMat,
        pearla: this.pearlaMat,
      };
      for (let i = 0; i < 25; i++) {
        const geno: Genotype = i === 12 ? 'aa' : i < 16 ? 'AA' : 'Aa';
        const b = createSculptedBeetle3D(geno, mats, 0.85);
        const col = i % 5;
        const row = Math.floor(i / 5);
        b.group.position.set(-1.72 + col * 0.86, 0.165, -1.04 + row * 0.52);
        b.group.rotation.y = (i % 4) * 0.35 - 0.4;
        this.p6Container.add(b.group);
      }
    } else if (questionIndex === 1) {
      const clone = this.pageGroups.definetti.clone();
      clone.visible = true;
      this.p6Container.add(clone);
      [0.5, 0.58, 0.66, 0.74].forEach((p, i) => {
        const [aa, het, rec] = hwExpected(p);
        const [x, z] = this.triToXZ(aa, het, rec);
        const dot = new THREE.Mesh(
          new THREE.SphereGeometry(0.11 + i * 0.015, 14, 12),
          new THREE.MeshStandardMaterial({
            color: i === 3 ? 0xc24432 : 0x285e82,
            roughness: 0.3,
          })
        );
        dot.position.set(x, 0.35, z);
        this.p6Container.add(dot);
      });
    } else {
      const clone = this.p5InbGroup.clone();
      clone.visible = true;
      this.p6Container.add(clone);
    }
  }

  // =========================================================================
  // PAGE SWITCHING, CAMERA & ANIMATION LOOP
  // =========================================================================

  public setPage(page: HwePageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as HwePageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });

    if (page === 'copies') {
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.66;
    } else if (page === 'square') {
      this.targetAzimuth = 0.42;
      this.targetPolar = 0.82;
    } else if (page === 'definetti') {
      this.targetAzimuth = 0.02;
      this.targetPolar = 0.62;
    } else if (page === 'census') {
      this.targetAzimuth = 0.0;
      this.targetPolar = 0.52;
    } else if (page === 'forces') {
      this.targetAzimuth = 0.1;
      this.targetPolar = 0.68;
    } else {
      this.targetAzimuth = 0.05;
      this.targetPolar = 0.62;
    }
    this.targetDist = this.fitDist;
  }

  public resetView(): void {
    this.setPage(this.activePage);
  }

  public resize(): void {
    if (this.disposed) return;
    const w = Math.max(this.host.clientWidth, 240);
    const h = Math.max(this.host.clientHeight, 240);
    const aspect = w / h;
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);

    const prev = this.fitDist;
    this.fitDist = this.computeFitDistance(aspect);
    if (Math.abs(this.targetDist - prev) < 0.6) {
      this.targetDist = this.fitDist;
      this.curDist = this.fitDist;
    }
  }

  private updateCamera(): void {
    const x = Math.sin(this.curAzimuth) * Math.sin(this.curPolar) * this.curDist;
    const y = Math.cos(this.curPolar) * this.curDist;
    const z = Math.cos(this.curAzimuth) * Math.sin(this.curPolar) * this.curDist;
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0.2, 0.08);
  }

  private bindPointerEvents(): void {
    const el = this.renderer.domElement;

    const updateNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      this.pointerNdc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      this.pointerNdc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };

    el.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.pointerDown = { x: e.clientX, y: e.clientY };
      this.lastPointer = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      updateNdc(e);
      if (this.dragging) {
        const dx = e.clientX - this.lastPointer.x;
        const dy = e.clientY - this.lastPointer.y;
        this.lastPointer = { x: e.clientX, y: e.clientY };
        this.targetAzimuth -= dx * 0.0065;
        this.targetPolar = Math.max(0.2, Math.min(1.25, this.targetPolar - dy * 0.0055));
      } else {
        this.raycaster.setFromCamera(this.pointerNdc, this.camera);
        let hitSomething = false;
        if (this.activePage === 'copies') {
          hitSomething =
            this.raycaster.intersectObjects(this.p1Beetles.map((b) => b.hitMesh), false).length > 0;
        } else if (this.activePage === 'definetti') {
          hitSomething = this.raycaster.intersectObject(this.p3TriHitMesh, false).length > 0;
        } else if (this.activePage === 'census') {
          hitSomething = this.raycaster.intersectObject(this.p4BeachHit, false).length > 0;
        }
        el.style.cursor = hitSomething ? 'pointer' : 'grab';
      }
    });

    el.addEventListener('pointerup', (e) => {
      if (!this.dragging) return;
      this.dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      const dist = Math.hypot(e.clientX - this.pointerDown.x, e.clientY - this.pointerDown.y);
      if (dist < 6) {
        updateNdc(e);
        this.handlePlateClick();
      }
    });

    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.targetDist = Math.max(
          this.fitDist * 0.58,
          Math.min(this.fitDist * 1.4, this.targetDist + e.deltaY * 0.004)
        );
      },
      { passive: false }
    );
  }

  private handlePlateClick(): void {
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);

    if (this.activePage === 'copies') {
      const hits = this.raycaster.intersectObjects(
        this.p1Beetles.map((b) => b.hitMesh),
        false
      );
      if (hits.length > 0) {
        const id = hits[0].object.userData.beetleId as number;
        this.openBeetleById(id, true);
      }
    } else if (this.activePage === 'definetti') {
      const hits = this.raycaster.intersectObject(this.p3TriHitMesh, false);
      if (hits.length > 0) {
        const pt = hits[0].point;
        const het = Math.max(0, Math.min(1, (1.25 - pt.z) / 2.9));
        const diff = Math.max(-1 + het, Math.min(1 - het, pt.x / 2.1));
        const rec = Math.max(0, (1 - het + diff) / 2);
        const aa = Math.max(0, 1 - het - rec);
        this.callbacks.onTrianglePick?.(aa, het, rec);
      }
    } else if (this.activePage === 'census') {
      const hits = this.raycaster.intersectObject(this.p4BeachHit, false);
      if (hits.length > 0) {
        const pt = hits[0].point;
        const qx = Math.max(-1.95, Math.min(1.95, pt.x));
        const qz = Math.max(-0.82, Math.min(0.82, pt.z));
        this.p4QuadratTarget.set(qx, 0.08, qz);
        this.callbacks.onQuadratDrop?.(qx, qz);
      }
    }
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = window.requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;
    const ease = 1 - Math.exp(-9 * dt);

    if (this.activePage === 'copies') {
      for (const b of this.p1Beetles) {
        const target = b.opened ? 1 : 0;
        b.openProgress += (target - b.openProgress) * ease;
        const angle = b.openProgress * 0.96;
        b.leftElytron.rotation.y = -angle;
        b.leftElytron.rotation.z = angle * 0.35;
        b.rightElytron.rotation.y = angle;
        b.rightElytron.rotation.z = -angle * 0.35;

        const pScale = Math.max(0.01, b.openProgress);
        b.leftPearl.scale.setScalar(pScale);
        b.rightPearl.scale.setScalar(pScale);
      }

      const maxCopies = 30;
      const targetAH = Math.max(0.02, Math.min(0.95, this.p1JarACount / maxCopies));
      const targetaH = Math.max(0.02, Math.min(0.95, this.p1JaraCount / maxCopies));
      this.p1JarAFill.scale.y += (targetAH - this.p1JarAFill.scale.y) * ease;
      this.p1JarAFill.position.y = 0.08 + this.p1JarAFill.scale.y * 0.5;
      this.p1JaraFill.scale.y += (targetaH - this.p1JaraFill.scale.y) * ease;
      this.p1JaraFill.position.y = 0.08 + this.p1JaraFill.scale.y * 0.5;

      for (let i = this.flyingPearls.length - 1; i >= 0; i--) {
        const fp = this.flyingPearls[i];
        fp.t += dt / fp.duration;
        if (fp.t < 0) continue;
        if (fp.t >= 1) {
          this.pageGroups.copies.remove(fp.mesh);
          this.flyingPearls.splice(i, 1);
          continue;
        }
        fp.mesh.position.lerpVectors(fp.start, fp.end, fp.t);
        fp.mesh.position.y += Math.sin(fp.t * Math.PI) * 1.15;
      }
    }

    if (this.activePage === 'square') {
      this.p2MergeT += ((this.p2Merged ? 1 : 0) - this.p2MergeT) * (1 - Math.exp(-6.5 * dt));
      for (let i = 0; i < 4; i++) {
        this.p2ColHeights[i] += (this.p2TargetHeights[i] - this.p2ColHeights[i]) * ease;
      }

      const hAA = this.p2ColHeights[0];
      const hAa = this.p2ColHeights[1];
      const haA = this.p2ColHeights[2];
      const haa = this.p2ColHeights[3];

      this.p2ColAA.scale.y = hAA;
      this.p2ColAA.position.set(this.p2TileAA.position.x, 0.2 + hAA / 2, this.p2TileAA.position.z);

      this.p2ColAa.scale.y = hAa;
      this.p2ColAa.position.set(this.p2TileAa.position.x, 0.2 + hAa / 2, this.p2TileAa.position.z);

      const mx = THREE.MathUtils.lerp(this.p2TileaA.position.x, this.p2TileAa.position.x, this.p2MergeT);
      const mz = THREE.MathUtils.lerp(this.p2TileaA.position.z, this.p2TileAa.position.z, this.p2MergeT);
      const my = THREE.MathUtils.lerp(0.2 + haA / 2, 0.2 + hAa + haA / 2 + 0.02, this.p2MergeT);
      this.p2ColaA.scale.y = haA;
      this.p2ColaA.position.set(mx, my, mz);

      this.p2Colaa.scale.y = haa;
      this.p2Colaa.position.set(this.p2Tileaa.position.x, 0.2 + haa / 2, this.p2Tileaa.position.z);

      for (let i = this.flyingGametes.length - 1; i >= 0; i--) {
        const fg = this.flyingGametes[i];
        fg.t += dt / fg.duration;
        if (fg.t < 0) continue;
        if (fg.t >= 1) {
          this.pageGroups.square.remove(fg.mesh);
          this.flyingGametes.splice(i, 1);
          continue;
        }
        fg.mesh.position.lerpVectors(fg.start, fg.end, fg.t);
        fg.mesh.position.y += Math.sin(fg.t * Math.PI) * 0.72;
      }
    }

    if (this.activePage === 'definetti') {
      this.p3ParentBeacon.position.lerp(this.p3ParentTarget, ease);
      this.p3OffspringBeacon.position.lerp(this.p3OffspringTarget, ease);
      if (this.p3ShowGen2) {
        this.p3Gen2Beacon.position.lerp(this.p3Gen2Target, ease);
      }
    }

    if (this.activePage === 'census') {
      this.p4Quadrat.position.lerp(this.p4QuadratTarget, ease);
    }

    if (this.activePage === 'forces') {
      if (this.p5ForceMode === 'wahlund') {
        this.p5WahlRope.position.y += (this.p5WahlRopeY - this.p5WahlRope.position.y) * ease;
      } else if (this.p5ForceMode === 'warfarin') {
        for (const r of this.p5RatEntries) {
          const cycle = (elapsed * r.speed + r.phase) % (Math.PI * 2);
          const x = -0.15 + Math.sin(cycle) * 1.82;
          const prevX = -0.15 + Math.sin(cycle - 0.05) * 1.82;
          r.group.position.x = x;
          r.group.rotation.y = x >= prevX ? 0 : Math.PI;
          r.group.position.y = 0.16 + Math.abs(Math.sin(elapsed * 8 + r.phase)) * 0.02;
        }
      }
    }

    const camEase = 1 - Math.exp(-9 * dt);
    this.curAzimuth += (this.targetAzimuth - this.curAzimuth) * camEase;
    this.curPolar += (this.targetPolar - this.curPolar) * camEase;
    this.curDist += (this.targetDist - this.curDist) * camEase;
    this.updateCamera();

    this.renderer.render(this.scene, this.camera);
  };

  public destroy(): void {
    this.disposed = true;
    window.cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
