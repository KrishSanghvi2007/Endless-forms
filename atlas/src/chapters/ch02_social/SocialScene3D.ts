import * as THREE from 'three';
import { createSeededRng } from '../../sim/adapter';
import {
  PEDIGREE_RELATIONS,
  warOfAttritionEssPdf,
  type ContestStrategy,
  type PedigreeRelationId,
} from './socialMath';

export type SocialPageId =
  | 'shore'
  | 'bourgeois'
  | 'attrition'
  | 'pedigree'
  | 'hamilton'
  | 'check';

const COL_HAWK = 0x2e61d1;   // D4 cobalt blue (raised claws)
const COL_DOVE = 0xe5ae1e;   // D4 warm amber (lowered claws)
const COL_BOURG = 0x2a8a7b;  // Emerald-teal (ownership pennant)
const COL_BRASS = 0xb88b3b;

// =============================================================================
// SHARED PROCEDURAL TEXTURES & ENGRAVED 3D PLAQUES
// =============================================================================

function createEngravedPlaque(
  text: string,
  subtext?: string,
  width = 1.15,
  accentHex = '#29211b'
): THREE.Mesh {
  const cw = 320;
  const ch = subtext ? 110 : 74;
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const ctx = c.getContext('2d')!;

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

function createWalnutTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#5c3f27';
  ctx.fillRect(0, 0, 256, 256);
  const rng = createSeededRng(212);
  for (let i = 0; i < 85; i++) {
    const y = rng.range(0, 256);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(38,22,10,0.24)' : 'rgba(130,92,56,0.18)';
    ctx.lineWidth = rng.range(1, 3.6);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + rng.range(-7, 7), 170, y + rng.range(-7, 7), 256, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createShoreTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;

  // Gradient from turquoise tidepool shallows (top) -> wet dark sand -> dry warm beach sand (bottom)
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.0, '#78b0b3');
  grad.addColorStop(0.22, '#99c4bf');
  grad.addColorStop(0.32, '#d5c199');
  grad.addColorStop(0.55, '#e5d3ad');
  grad.addColorStop(1.0, '#eddcc0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Foam shoreline ripple
  ctx.strokeStyle = 'rgba(255, 252, 245, 0.55)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(0, 68);
  ctx.bezierCurveTo(64, 58, 128, 76, 192, 64);
  ctx.bezierCurveTo(224, 58, 244, 68, 256, 65);
  ctx.stroke();

  const rng = createSeededRng(314);
  for (let i = 0; i < 650; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#fbf5e6' : '#a98e62';
    ctx.globalAlpha = 0.08 + rng.next() * 0.09;
    ctx.beginPath();
    ctx.arc(rng.range(0, 256), rng.range(72, 256), rng.range(0.7, 2.5), 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createAlpineMeadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#97ab6e';
  ctx.fillRect(0, 0, 256, 256);

  const rng = createSeededRng(818);
  for (let i = 0; i < 60; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#b2be7e' : '#748a50';
    ctx.globalAlpha = 0.14;
    ctx.beginPath();
    ctx.ellipse(
      rng.range(0, 256),
      rng.range(0, 256),
      rng.range(16, 48),
      rng.range(12, 34),
      rng.range(0, Math.PI),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }
  // Alpine wildflowers (tiny cream & pale-ochre specks)
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = i % 4 === 0 ? '#f8f0d0' : '#d9c678';
    ctx.globalAlpha = 0.45;
    ctx.beginPath();
    ctx.arc(rng.range(0, 256), rng.range(0, 256), rng.range(0.8, 1.9), 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// =============================================================================
// SCULPTED 3D NATURAL-HISTORY ORGANISMS
// =============================================================================

/** Gleaming pearlescent spiralled gastropod shell (the contested shoreline resource!) */
function createSpiralShell3D(scale = 1, mat?: THREE.Material): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);
  const shellMat =
    mat ??
    new THREE.MeshPhysicalMaterial({
      color: 0xf1dec2,
      roughness: 0.25,
      metalness: 0.08,
      clearcoat: 0.72,
    });
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xb38052, roughness: 0.48 });

  // Stacked tapered whorls forming an unmistakable conical sea snail shell
  const whorls = [
    { r: 0.16, y: 0.0, z: 0.0 },
    { r: 0.125, y: 0.03, z: -0.11 },
    { r: 0.09, y: 0.05, z: -0.20 },
    { r: 0.056, y: 0.065, z: -0.27 },
    { r: 0.03, y: 0.075, z: -0.32 },
  ];
  whorls.forEach((w, idx) => {
    const sph = new THREE.Mesh(
      new THREE.SphereGeometry(w.r, 14, 12),
      idx % 2 === 1 ? bandMat : shellMat
    );
    sph.scale.set(1.05, 0.88, 0.92);
    sph.position.set(0, w.r * 0.72 + w.y, w.z);
    sph.castShadow = true;
    g.add(sph);
  });
  return g;
}

/** Sculpted 3D Hermit Crab: natural shell + Hawk raised claws / Dove lowered claws / Bourgeois pennant */
function createHermitCrab3D(
  strategy: ContestStrategy,
  mats: {
    hawk: THREE.Material;
    dove: THREE.Material;
    bourg: THREE.Material;
    shell: THREE.Material;
    eye: THREE.Material;
    brass: THREE.Material;
  },
  scale = 1,
  showOwnerFlag = false
): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  const stratMat =
    strategy === 'hawk' ? mats.hawk : strategy === 'dove' ? mats.dove : mats.bourg;

  // Natural gastropod shell carried on back
  const shell = createSpiralShell3D(0.95, mats.shell);
  shell.position.set(0, 0.04, 0.08);
  shell.rotation.y = Math.PI; // spire pointing back
  g.add(shell);

  // Carapace front body (coloured in strategy ink)
  const front = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), stratMat);
  front.scale.set(1.1, 0.72, 0.95);
  front.position.set(0, 0.09, -0.10);
  front.castShadow = true;
  g.add(front);

  // Stalked eyes
  const stalkGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.075, 6);
  const eyeGeo = new THREE.SphereGeometry(0.018, 8, 8);
  for (const s of [-1, 1]) {
    const st = new THREE.Mesh(stalkGeo, stratMat);
    st.position.set(s * 0.042, 0.145, -0.18);
    st.rotation.z = s * -0.22;
    const eye = new THREE.Mesh(eyeGeo, mats.eye);
    eye.position.set(s * 0.052, 0.18, -0.185);
    g.add(st, eye);
  }

  // Walking legs
  const legGeo = new THREE.CylinderGeometry(0.014, 0.009, 0.17, 6);
  for (const s of [-1, 1]) {
    for (let l = 0; l < 2; l++) {
      const leg = new THREE.Mesh(legGeo, stratMat);
      leg.position.set(s * 0.14, 0.055, -0.09 + l * 0.085);
      leg.rotation.z = s * 1.1;
      g.add(leg);
    }
  }

  // Claws — SHAPE CARRIES STRATEGY TOO (D4 rule 4!):
  // Hawks raise oversized crusher claws high; Doves tuck smaller claws low!
  const isHawkPosture = strategy === 'hawk' || (strategy === 'bourgeois' && showOwnerFlag);
  const clawScale = isHawkPosture ? 1.38 : 0.92;
  const clawGeo = new THREE.SphereGeometry(0.068, 12, 10);
  clawGeo.scale(0.85, 0.72, 1.45);

  for (const s of [-1, 1]) {
    const claw = new THREE.Mesh(clawGeo, stratMat);
    claw.scale.setScalar(clawScale * (s === 1 ? 1.12 : 0.92));
    if (isHawkPosture) {
      // Aggressive raised threat posture!
      claw.position.set(s * 0.14, 0.21, -0.22);
      claw.rotation.set(-0.62, s * -0.35, s * -0.25);
    } else {
      // Calm lowered Dove posture
      claw.position.set(s * 0.12, 0.075, -0.22);
      claw.rotation.set(0.18, s * 0.25, 0);
    }
    claw.castShadow = true;
    g.add(claw);
  }

  // Bourgeois ownership brass pin flag when holding a shell
  if (strategy === 'bourgeois' && showOwnerFlag) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.34, 6), mats.brass);
    pole.position.set(0, 0.36, 0.05);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.085, 0.016), mats.bourg);
    flag.position.set(0.075, 0.48, 0.05);
    g.add(pole, flag);
  }

  return g;
}

/** Sculpted 3D Belding's Ground Squirrel (upright alert sentinel posture + allele collar) */
function createSquirrel3D(
  isCaller: boolean,
  mats: {
    fur: THREE.Material;
    belly: THREE.Material;
    eye: THREE.Material;
    caller: THREE.Material;
    silent: THREE.Material;
  },
  scale = 1
): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  // Upright seated russet body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 12), mats.fur);
  body.scale.set(0.85, 1.42, 0.88);
  body.position.set(0, 0.16, 0);
  body.castShadow = true;
  g.add(body);

  // Pale buff belly
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 10), mats.belly);
  belly.scale.set(0.8, 1.25, 0.6);
  belly.position.set(0, 0.15, 0.062);
  g.add(belly);

  // Alert rounded head + ears + eyes
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.082, 12, 10), mats.fur);
  head.scale.set(0.95, 0.92, 1.12);
  head.position.set(0, 0.33, 0.02);
  head.castShadow = true;
  g.add(head);

  const earGeo = new THREE.SphereGeometry(0.026, 8, 8);
  const eyeGeo = new THREE.SphereGeometry(0.016, 8, 8);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, mats.fur);
    ear.position.set(s * 0.056, 0.39, -0.01);
    const eye = new THREE.Mesh(eyeGeo, mats.eye);
    eye.position.set(s * 0.048, 0.345, 0.082);
    g.add(ear, eye);
  }

  // Fluffy arched squirrel tail
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.07, -0.07),
    new THREE.Vector3(0, 0.18, -0.17),
    new THREE.Vector3(0, 0.34, -0.15),
  ]);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(tailCurve, 12, 0.036, 8, false), mats.fur);
  tail.castShadow = true;
  g.add(tail);

  // Clear D4 allele collar ring (Cobalt Blue = Caller, Warm Amber = Silent)
  const collar = new THREE.Mesh(
    new THREE.TorusGeometry(0.076, 0.024, 10, 20),
    isCaller ? mats.caller : mats.silent
  );
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.255, 0.01);
  g.add(collar);

  return g;
}

/** Sculpted 3D Red-Tailed Hawk circling overhead in the Sierra meadow */
function createGlidingHawk3D(): THREE.Group {
  const g = new THREE.Group();
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x563c28, roughness: 0.75 });
  const tailMat = new THREE.MeshStandardMaterial({ color: 0x9c4527, roughness: 0.72 });
  const beakMat = new THREE.MeshStandardMaterial({ color: 0xd9a832, roughness: 0.45 });

  // Streamlined raptor fuselage
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 10), wingMat);
  body.scale.set(0.85, 0.75, 2.3);
  body.castShadow = true;
  g.add(body);

  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.09, 6), beakMat);
  beak.rotation.x = Math.PI / 2;
  beak.position.set(0, -0.01, 0.27);
  g.add(beak);

  // Swept glider wings (ShapeGeometry extruded thinly)
  const wShape = new THREE.Shape();
  wShape.moveTo(0, 0.14);
  wShape.quadraticCurveTo(0.45, 0.22, 1.05, 0.02);
  wShape.quadraticCurveTo(0.85, -0.22, 0.0, -0.16);
  wShape.quadraticCurveTo(-0.85, -0.22, -1.05, 0.02);
  wShape.quadraticCurveTo(-0.45, 0.22, 0, 0.14);
  const wGeo = new THREE.ExtrudeGeometry(wShape, { depth: 0.025, bevelEnabled: false });
  wGeo.rotateX(Math.PI / 2);
  const wings = new THREE.Mesh(wGeo, wingMat);
  wings.position.y = 0.02;
  wings.castShadow = true;
  g.add(wings);

  // Fanned russet tail
  const tShape = new THREE.Shape();
  tShape.moveTo(0, 0);
  tShape.lineTo(0.22, -0.34);
  tShape.quadraticCurveTo(0, -0.42, -0.22, -0.34);
  tShape.closePath();
  const tGeo = new THREE.ShapeGeometry(tShape);
  tGeo.rotateX(-Math.PI / 2);
  const tail = new THREE.Mesh(tGeo, tailMat);
  tail.position.set(0, 0.01, -0.18);
  tail.castShadow = true;
  g.add(tail);

  return g;
}

// =============================================================================
// MAIN 3D SCENE ENGINE FOR CHAPTER 2 (CONFLICT & KINSHIP)
// =============================================================================

export class SocialScene3D {
  private host: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private resizeObserver: ResizeObserver;
  private rafId = 0;
  private disposed = false;

  // Shared materials
  private hawkMat!: THREE.MeshStandardMaterial;
  private doveMat!: THREE.MeshStandardMaterial;
  private bourgMat!: THREE.MeshStandardMaterial;
  private shellMat!: THREE.MeshPhysicalMaterial;
  private walnutMat!: THREE.MeshStandardMaterial;
  private brassMat!: THREE.MeshStandardMaterial;
  private eyeMat!: THREE.MeshStandardMaterial;

  // Page root groups
  private pageGroups: Record<SocialPageId, THREE.Group>;
  private activePage: SocialPageId = 'shore';

  // --- Page 1: Shoreline Crabs + Live Contest ---
  private p1CrabGroup = new THREE.Group();
  private p1DuelLeft!: THREE.Group;
  private p1DuelRight!: THREE.Group;
  private p1DuelGroup = new THREE.Group();
  private p1ShockRing!: THREE.Mesh;
  private p1ContestT = 1;
  private p1ContestType: 'HH' | 'HD' | 'DD' = 'HD';

  // --- Page 2: Bourgeois Invasion Shoreline + 3D Pillars ---
  private p2CrabGroup = new THREE.Group();
  private p2ColH!: THREE.Mesh;
  private p2ColD!: THREE.Mesh;
  private p2ColB!: THREE.Mesh;
  private p2TargetFreqs: [number, number, number] = [0.5, 0.5, 0.0];
  private p2CurFreqs: [number, number, number] = [0.5, 0.5, 0.0];

  // --- Page 3: War of Attrition Ring + 3D Exponential Histogram ---
  private p3CrabA!: THREE.Group;
  private p3CrabB!: THREE.Group;
  private p3Bars: THREE.Mesh[] = [];
  private p3TargetBarH: number[] = [];

  // --- Page 4: 3D Pedigree Tree & Glowing IBD Paths ---
  private p4Nodes: Record<string, { pos: THREE.Vector3; mesh: THREE.Mesh; ring: THREE.Mesh }> = {};
  private p4PathGroup = new THREE.Group();
  private p4FatherRing!: THREE.Mesh;

  // --- Page 5: Sierra Alpine Meadow, Ground Squirrels & Circling Hawk ---
  private p5SquirrelGroup = new THREE.Group();
  private p5Squirrels: { group: THREE.Group; isCaller: boolean; baseY: number; divePhase: number }[] = [];
  private p5Hawk!: THREE.Group;
  private p5AlarmRings: { mesh: THREE.Mesh; t: number }[] = [];
  private p5StrikeTimer = 0;

  // --- Page 6: Check Specimens ---
  private p6Container = new THREE.Group();

  // Camera orbit state
  private fitDist = 7.4;
  private targetAzimuth = 0.06;
  private targetPolar = 0.66;
  private targetDist = 7.4;
  private curAzimuth = 0.06;
  private curPolar = 0.66;
  private curDist = 7.4;
  private dragging = false;
  private lastPointer = { x: 0, y: 0 };
  private clock = new THREE.Clock();

  constructor(host: HTMLElement) {
    this.host = host;
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
    this.renderer.toneMappingExposure = 1.07;
    this.renderer.setClearColor(0x000000, 0);
    host.appendChild(this.renderer.domElement);

    // Warm outdoor museum lighting
    this.scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd8c8a8, 1.18));

    const key = new THREE.DirectionalLight(0xfff6e2, 1.6);
    key.position.set(-2.6, 8.6, 3.2);
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

    const rim = new THREE.DirectionalLight(0xd9ecf7, 0.55);
    rim.position.set(4.0, 3.4, -3.5);
    this.scene.add(rim);

    // Soft cast shadow catcher on paper
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
      shore: new THREE.Group(),
      bourgeois: new THREE.Group(),
      attrition: new THREE.Group(),
      pedigree: new THREE.Group(),
      hamilton: new THREE.Group(),
      check: new THREE.Group(),
    };
    (Object.values(this.pageGroups) as THREE.Group[]).forEach((g) => {
      g.visible = false;
      this.scene.add(g);
    });

    this.buildPage1Shore();
    this.buildPage2Bourgeois();
    this.buildPage3Attrition();
    this.buildPage4Pedigree();
    this.buildPage5Hamilton();
    this.pageGroups.check.add(this.p6Container);

    this.setPage('shore');
    this.updateCamera();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(host);

    this.bindPointerEvents();
    this.animate();
  }

  private initSharedMaterials(): void {
    this.hawkMat = new THREE.MeshStandardMaterial({
      color: COL_HAWK,
      roughness: 0.34,
      metalness: 0.12,
    });
    this.doveMat = new THREE.MeshStandardMaterial({
      color: COL_DOVE,
      roughness: 0.36,
      metalness: 0.1,
    });
    this.bourgMat = new THREE.MeshStandardMaterial({
      color: COL_BOURG,
      roughness: 0.34,
      metalness: 0.12,
    });
    this.shellMat = new THREE.MeshPhysicalMaterial({
      color: 0xf1dec2,
      roughness: 0.28,
      metalness: 0.06,
      clearcoat: 0.65,
    });
    this.walnutMat = new THREE.MeshStandardMaterial({
      map: createWalnutTexture(),
      roughness: 0.62,
      metalness: 0.05,
    });
    this.brassMat = new THREE.MeshStandardMaterial({
      color: COL_BRASS,
      roughness: 0.32,
      metalness: 0.66,
    });
    this.eyeMat = new THREE.MeshStandardMaterial({ color: 0x161210, roughness: 0.2 });
  }

  private computeFitDistance(aspect: number): number {
    const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const neededW = 6.35;
    const neededH = 3.75;
    const dW = neededW / (2 * tanHalfFov * Math.max(aspect, 0.58));
    const dH = neededH / (2 * tanHalfFov);
    return Math.max(7.1, dW, dH);
  }

  private crabMats() {
    return {
      hawk: this.hawkMat,
      dove: this.doveMat,
      bourg: this.bourgMat,
      shell: this.shellMat,
      eye: this.eyeMat,
      brass: this.brassMat,
    };
  }

  // =========================================================================
  // PAGE 1: 3D TIDAL SHORELINE & HERMIT CRABS (HAWKS VS. DOVES)
  // =========================================================================

  private buildPage1Shore(): void {
    const g = this.pageGroups.shore;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.55, 0.15, 3.24), this.walnutMat);
    frame.position.set(0, 0.075, 0);
    frame.castShadow = true;
    g.add(frame);

    const shore = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 0.165, 3.0),
      new THREE.MeshStandardMaterial({ map: createShoreTexture(), roughness: 0.84 })
    );
    shore.position.set(0, 0.08, 0);
    shore.receiveShadow = true;
    g.add(shore);

    // Translucent tidepool water sheen along the top edge
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(5.26, 0.72),
      new THREE.MeshPhysicalMaterial({
        color: 0x5caeb5,
        roughness: 0.12,
        transparent: true,
        opacity: 0.35,
      })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, 0.172, -1.12);
    g.add(water);

    // Weathered driftwood & river pebbles
    const driftMat = new THREE.MeshStandardMaterial({ color: 0x998872, roughness: 0.92 });
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.095, 1.35, 8), driftMat);
    log.rotation.z = Math.PI / 2;
    log.rotation.y = 0.24;
    log.position.set(-1.75, 0.21, -0.78);
    log.castShadow = true;
    g.add(log);

    // Central gleaming prize shell on the contest stage
    const prizeShell = createSpiralShell3D(1.35);
    prizeShell.position.set(0, 0.17, 0.1);
    g.add(prizeShell);

    // Impact / display shockwave ring around central shell
    this.p1ShockRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.38, 28),
      new THREE.MeshBasicMaterial({
        color: 0xc23c2b,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      })
    );
    this.p1ShockRing.rotation.x = -Math.PI / 2;
    this.p1ShockRing.position.set(0, 0.175, 0.1);
    g.add(this.p1ShockRing);

    g.add(this.p1CrabGroup, this.p1DuelGroup);

    const pShore = createEngravedPlaque('Tidal Shoreline', '60-crab population', 1.35, '#2b557a');
    pShore.position.set(-1.65, 0.03, 1.9);
    const pShell = createEngravedPlaque('Spiral Shell (V)', 'contested prize', 1.32, '#9e531c');
    pShell.position.set(1.65, 0.03, 1.9);
    g.add(pShore, pShell);

    this.updateShorelinePopulation(0.5);
    this.stageShoreContest('hawk', 'dove');
  }

  public updateShorelinePopulation(pHawk: number): void {
    while (this.p1CrabGroup.children.length > 0) {
      this.p1CrabGroup.remove(this.p1CrabGroup.children[0]);
    }
    const total = 22;
    const nHawk = Math.round(pHawk * total);
    const rng = createSeededRng(411);
    const mats = this.crabMats();

    for (let i = 0; i < total; i++) {
      const strat: ContestStrategy = i < nHawk ? 'hawk' : 'dove';
      const crab = createHermitCrab3D(strat, mats, 0.72);
      // Place crabs around the perimeter of the central contest stage
      let x = rng.range(-2.35, 2.35);
      let z = rng.range(-0.62, 1.25);
      if (Math.hypot(x, z - 0.1) < 1.05) {
        x = x < 0 ? -1.45 - rng.range(0, 0.8) : 1.45 + rng.range(0, 0.8);
      }
      crab.position.set(x, 0.165, z);
      crab.rotation.y = Math.atan2(-x, 0.1 - z) + rng.range(-0.7, 0.7);
      this.p1CrabGroup.add(crab);
    }
  }

  public stageShoreContest(left: 'hawk' | 'dove', right: 'hawk' | 'dove'): void {
    while (this.p1DuelGroup.children.length > 0) {
      this.p1DuelGroup.remove(this.p1DuelGroup.children[0]);
    }
    const mats = this.crabMats();
    this.p1DuelLeft = createHermitCrab3D(left, mats, 1.15);
    this.p1DuelLeft.position.set(-0.92, 0.165, 0.1);
    this.p1DuelLeft.rotation.y = -Math.PI / 2;

    this.p1DuelRight = createHermitCrab3D(right, mats, 1.15);
    this.p1DuelRight.position.set(0.92, 0.165, 0.1);
    this.p1DuelRight.rotation.y = Math.PI / 2;

    this.p1DuelGroup.add(this.p1DuelLeft, this.p1DuelRight);

    this.p1ContestType =
      left === 'hawk' && right === 'hawk'
        ? 'HH'
        : left === 'dove' && right === 'dove'
          ? 'DD'
          : 'HD';
    this.p1ContestT = 0;
  }

  // =========================================================================
  // PAGE 2: BOURGEOIS INVASION SHORELINE + 3D STRATEGY PILLARS
  // =========================================================================

  private buildPage2Bourgeois(): void {
    const g = this.pageGroups.bourgeois;

    // Left: Shoreline patch with ownership crabs
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.85, 0.15, 3.05), this.walnutMat);
    frame.position.set(-0.82, 0.075, 0);
    frame.castShadow = true;
    g.add(frame);

    const sand = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.165, 2.8),
      new THREE.MeshStandardMaterial({ map: createShoreTexture(), roughness: 0.86 })
    );
    sand.position.set(-0.82, 0.08, 0);
    sand.receiveShadow = true;
    g.add(sand);
    g.add(this.p2CrabGroup);

    // Right: Brass plinth with 3 rising translucent 3D frequency pillars (Hawk / Dove / Bourgeois)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.12, 3.05), this.walnutMat);
    plinth.position.set(2.08, 0.06, 0);
    plinth.castShadow = true;
    g.add(plinth);

    const makeCol = (col: number, z: number) => {
      const m = new THREE.Mesh(
        new THREE.BoxGeometry(0.68, 1.0, 0.62),
        new THREE.MeshPhysicalMaterial({
          color: col,
          roughness: 0.22,
          clearcoat: 0.65,
          transparent: true,
          opacity: 0.92,
        })
      );
      m.position.set(2.08, 0.2, z);
      m.castShadow = true;
      g.add(m);
      return m;
    };

    this.p2ColH = makeCol(COL_HAWK, -0.92);
    this.p2ColD = makeCol(COL_DOVE, 0.0);
    this.p2ColB = makeCol(COL_BOURG, 0.92);

    const pl1 = createEngravedPlaque('Ownership Shore', 'flag = shell owner', 1.38, '#1f6a60');
    pl1.position.set(-0.82, 0.03, 1.82);
    const pl2 = createEngravedPlaque('Strategy Mix', 'H · D · Bourgeois', 1.35, '#29211b');
    pl2.position.set(2.08, 0.03, 1.82);
    g.add(pl1, pl2);

    this.updateBourgeoisScene([0.5, 0.5, 0]);
  }

  public updateBourgeoisScene(freqs: [number, number, number]): void {
    this.p2TargetFreqs = freqs;
    while (this.p2CrabGroup.children.length > 0) {
      this.p2CrabGroup.remove(this.p2CrabGroup.children[0]);
    }
    const total = 18;
    const nH = Math.round(freqs[0] * total);
    const nB = Math.round(freqs[2] * total);
    const rng = createSeededRng(520);
    const mats = this.crabMats();

    for (let i = 0; i < total; i++) {
      const strat: ContestStrategy = i < nH ? 'hawk' : i < nH + nB ? 'bourgeois' : 'dove';
      const crab = createHermitCrab3D(strat, mats, 0.78, i % 2 === 0);
      const col = i % 3;
      const row = Math.floor(i / 3);
      crab.position.set(
        -2.02 + col * 1.18 + rng.range(-0.18, 0.18),
        0.165,
        -0.98 + row * 0.41 + rng.range(-0.08, 0.08)
      );
      crab.rotation.y = rng.range(0, Math.PI * 2);
      this.p2CrabGroup.add(crab);
    }
  }

  // =========================================================================
  // PAGE 3: 3D WAR OF ATTRITION RING & EXPONENTIAL ESS CURVE
  // =========================================================================

  private buildPage3Attrition(): void {
    const g = this.pageGroups.attrition;

    // Circular sandy contest ring in front
    const ringRim = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.66, 0.14, 36), this.walnutMat);
    ringRim.position.set(0, 0.07, 0.68);
    ringRim.castShadow = true;
    g.add(ringRim);

    const ringSand = new THREE.Mesh(
      new THREE.CylinderGeometry(1.46, 1.48, 0.155, 36),
      new THREE.MeshStandardMaterial({ map: createShoreTexture(), roughness: 0.88 })
    );
    ringSand.position.set(0, 0.078, 0.68);
    ringSand.receiveShadow = true;
    g.add(ringSand);

    const shell = createSpiralShell3D(1.3);
    shell.position.set(0, 0.16, 0.68);
    g.add(shell);

    const mats = this.crabMats();
    this.p3CrabA = createHermitCrab3D('dove', mats, 1.05);
    this.p3CrabA.position.set(-0.78, 0.16, 0.68);
    this.p3CrabA.rotation.y = -Math.PI / 2;

    this.p3CrabB = createHermitCrab3D('hawk', mats, 1.05);
    this.p3CrabB.position.set(0.78, 0.16, 0.68);
    this.p3CrabB.rotation.y = Math.PI / 2;
    g.add(this.p3CrabA, this.p3CrabB);

    // Back stage: 3D Bar-Sculpture of display-time distribution p(t)
    const chartBase = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.72), this.walnutMat);
    chartBase.position.set(0, 0.06, -1.28);
    chartBase.castShadow = true;
    g.add(chartBase);

    const barCount = 16;
    for (let i = 0; i < barCount; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.21, 1.0, 0.36),
        new THREE.MeshPhysicalMaterial({
          color: i < 5 ? 0xd48e24 : i < 10 ? 0xb55d2c : 0x5c4a78,
          roughness: 0.28,
          clearcoat: 0.5,
        })
      );
      bar.position.set(-2.02 + i * 0.27, 0.12, -1.28);
      bar.castShadow = true;
      this.p3Bars.push(bar);
      this.p3TargetBarH.push(0.2);
      g.add(bar);
    }

    const pTitle = createEngravedPlaque('Display Time p(t)', 'ESS = (1/V)·e^(−t/V)', 1.55, '#6e3a16');
    pTitle.position.set(0, 0.03, -1.94);
    g.add(pTitle);

    this.setAttritionDistribution('ess', 4);
  }

  public setAttritionDistribution(mode: 'pure' | 'ess', V: number, fixedT = 4): void {
    const n = this.p3Bars.length;
    for (let i = 0; i < n; i++) {
      const tVal = (i + 0.5) * 0.8; // spans 0..12.8 time units
      if (mode === 'ess') {
        const pdf = warOfAttritionEssPdf(tVal, V);
        this.p3TargetBarH[i] = Math.max(0.05, Math.min(2.1, pdf * V * 1.9));
      } else {
        const dist = Math.abs(tVal - fixedT);
        this.p3TargetBarH[i] = dist < 0.55 ? 2.0 : 0.04;
      }
    }
  }

  // =========================================================================
  // PAGE 4: 3D ALPINE FAMILY PEDIGREE & GLOWING IBD PATH TUBES
  // =========================================================================

  private buildPage4Pedigree(): void {
    const g = this.pageGroups.pedigree;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.14, 3.4), this.walnutMat);
    frame.position.set(0, 0.07, 0);
    frame.castShadow = true;
    g.add(frame);

    const board = new THREE.Mesh(
      new THREE.BoxGeometry(5.26, 0.155, 3.16),
      new THREE.MeshStandardMaterial({ color: 0xf4ecda, roughness: 0.88 })
    );
    board.position.set(0, 0.075, 0);
    board.receiveShadow = true;
    g.add(board);

    // 3-generation node coordinates
    const defs: { id: string; label: string; x: number; z: number; col: number }[] = [
      { id: 'GM', label: 'Grandmother', x: -0.75, z: -1.08, col: 0x8f6b47 },
      { id: 'GF', label: 'Grandfather', x: 0.75, z: -1.08, col: 0x6b7c8f },
      { id: 'M1', label: 'Mother', x: -0.95, z: -0.05, col: 0xb85b4c },
      { id: 'F1', label: 'Father', x: -2.02, z: -0.05, col: 0x3a6ed8 },
      { id: 'A1', label: 'Aunt', x: 1.38, z: -0.05, col: 0x8f6b47 },
      { id: 'S1', label: 'You (Actor)', x: -1.85, z: 0.98, col: 0x2a8a7b },
      { id: 'S2', label: 'Full Sib', x: -0.82, z: 0.98, col: 0x2e61d1 },
      { id: 'H1', label: 'Half Sib', x: 0.22, z: 0.98, col: 0xd99b26 },
      { id: 'C1', label: 'Cousin', x: 1.52, z: 0.98, col: 0x7c5a8a },
    ];

    // Base faint genealogy edges
    const baseEdges: [string, string][] = [
      ['GM', 'M1'],
      ['GF', 'M1'],
      ['GM', 'A1'],
      ['GF', 'A1'],
      ['M1', 'S1'],
      ['F1', 'S1'],
      ['M1', 'S2'],
      ['F1', 'S2'],
      ['M1', 'H1'],
      ['A1', 'C1'],
    ];

    const posMap: Record<string, THREE.Vector3> = {};
    defs.forEach((d) => {
      posMap[d.id] = new THREE.Vector3(d.x, 0.24, d.z);
    });

    const rodMat = new THREE.MeshStandardMaterial({ color: 0xbca98e, roughness: 0.7 });
    baseEdges.forEach(([a, b]) => {
      const curve = new THREE.LineCurve3(posMap[a], posMap[b]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 6, 0.022, 6, false), rodMat);
      g.add(tube);
    });

    // Brass-rimmed 3D pedigree medallions + engraved micro-labels
    defs.forEach((d) => {
      const p = posMap[d.id];
      const cyl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.24, 0.16, 20),
        new THREE.MeshStandardMaterial({ color: d.col, roughness: 0.35, metalness: 0.18 })
      );
      cyl.position.set(p.x, 0.23, p.z);
      cyl.castShadow = true;
      g.add(cyl);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.032, 10, 24), this.brassMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(p.x, 0.31, p.z);
      g.add(ring);

      const lbl = createEngravedPlaque(d.label, undefined, 0.86, '#29211b');
      lbl.position.set(p.x, 0.162, p.z + 0.36);
      g.add(lbl);

      this.p4Nodes[d.id] = { pos: p, mesh: cyl, ring };
      if (d.id === 'F1') this.p4FatherRing = ring;
    });

    g.add(this.p4PathGroup);
    this.setPedigreeRelation('full_sibs');
  }

  public setPedigreeRelation(relId: PedigreeRelationId): void {
    const rel = PEDIGREE_RELATIONS[relId];
    while (this.p4PathGroup.children.length > 0) {
      this.p4PathGroup.remove(this.p4PathGroup.children[0]);
    }

    // Highlight actor & recipient rings
    Object.entries(this.p4Nodes).forEach(([id, entry]) => {
      const isEnd = id === rel.actorNode || id === rel.recipientNode;
      entry.mesh.scale.setScalar(isEnd ? 1.24 : 0.94);
      entry.ring.scale.setScalar(isEnd ? 1.24 : 0.94);
    });

    // Highlight haploid father ring in bright gold when viewing haplodiploid sisters
    (this.p4FatherRing.material as THREE.MeshStandardMaterial).emissive.setHex(
      rel.haplodiploid ? 0x8f5b06 : 0x000000
    );

    // Draw elevated glowing 3D IBD path tubes!
    rel.paths.forEach((path, pIdx) => {
      const pts: THREE.Vector3[] = [];
      for (const nid of path.nodes) {
        const p = this.p4Nodes[nid].pos;
        pts.push(new THREE.Vector3(p.x, 0.42 + pIdx * 0.14, p.z));
      }
      const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.25);
      const col =
        path.via === 'haploid_father'
          ? 0xf0b422
          : path.via === 'maternal'
            ? 0xd6534b
            : 0x346de0;
      const radius = path.via === 'haploid_father' ? 0.068 : 0.046;
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 32, radius, 10, false),
        new THREE.MeshStandardMaterial({
          color: col,
          roughness: 0.25,
          metalness: 0.2,
          emissive: col,
          emissiveIntensity: 0.28,
        })
      );
      tube.castShadow = true;
      this.p4PathGroup.add(tube);
    });
  }

  // =========================================================================
  // PAGE 5: SIERRA ALPINE MEADOW, GROUND SQUIRRELS & CIRCLING 3D HAWK
  // =========================================================================

  private buildPage5Hamilton(): void {
    const g = this.pageGroups.hamilton;

    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.55, 0.15, 3.24), this.walnutMat);
    frame.position.set(0, 0.075, 0);
    frame.castShadow = true;
    g.add(frame);

    const meadow = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 0.165, 3.0),
      new THREE.MeshStandardMaterial({ map: createAlpineMeadowTexture(), roughness: 0.92 })
    );
    meadow.position.set(0, 0.08, 0);
    meadow.receiveShadow = true;
    g.add(meadow);

    // 6 Earthen Alpine Burrows + Granite Boulders
    const moundMat = new THREE.MeshStandardMaterial({ color: 0x806344, roughness: 0.94 });
    const holeMat = new THREE.MeshStandardMaterial({ color: 0x1f1710, roughness: 1.0 });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x9c988e, roughness: 0.88 });

    const burrowPositions: [number, number][] = [
      [-1.75, -0.78],
      [0.0, -0.88],
      [1.75, -0.76],
      [-1.65, 0.72],
      [0.05, 0.82],
      [1.72, 0.68],
    ];
    burrowPositions.forEach(([bx, bz], i) => {
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        moundMat
      );
      m.scale.set(1.18, 0.48, 1.08);
      m.position.set(bx, 0.155, bz);
      m.castShadow = true;
      g.add(m);

      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 12), holeMat);
      h.position.set(bx, 0.285, bz);
      g.add(h);

      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), rockMat);
      rock.scale.set(1.3, 0.72, 0.95);
      rock.position.set(bx + (i % 2 === 0 ? -0.48 : 0.48), 0.21, bz - 0.18);
      rock.castShadow = true;
      g.add(rock);
    });

    g.add(this.p5SquirrelGroup);

    // Gliding 3D Red-Tailed Hawk circling overhead!
    this.p5Hawk = createGlidingHawk3D();
    this.p5Hawk.position.set(0, 1.85, 0);
    g.add(this.p5Hawk);

    const pMeadow = createEngravedPlaque('Sierra Alpine Meadow', 'Belding’s ground squirrels', 1.55, '#465e2d');
    pMeadow.position.set(0, 0.03, 1.9);
    g.add(pMeadow);

    this.updateHamiltonMeadow(0.45, true);
  }

  public updateHamiltonMeadow(pCaller: number, kinClustered: boolean): void {
    while (this.p5SquirrelGroup.children.length > 0) {
      this.p5SquirrelGroup.remove(this.p5SquirrelGroup.children[0]);
    }
    this.p5Squirrels = [];

    const mats = {
      fur: new THREE.MeshStandardMaterial({ color: 0xa6835c, roughness: 0.85 }),
      belly: new THREE.MeshStandardMaterial({ color: 0xe3d2b4, roughness: 0.88 }),
      eye: this.eyeMat,
      caller: this.hawkMat,
      silent: this.doveMat,
    };

    const burrows: [number, number][] = [
      [-1.75, -0.78],
      [0.0, -0.88],
      [1.75, -0.76],
      [-1.65, 0.72],
      [0.05, 0.82],
      [1.72, 0.68],
    ];
    const total = 18;
    const nCaller = Math.round(pCaller * total);
    const rng = createSeededRng(733);

    for (let i = 0; i < total; i++) {
      // Kin clustering groups Callers into whole family burrows (high r!);
      // Random dispersal scatters Callers across burrows (low r!)
      const bIdx = i % 6;
      const slot = Math.floor(i / 6);
      const isCaller = kinClustered ? bIdx * 3 + slot < nCaller : i < nCaller;

      const sq = createSquirrel3D(isCaller, mats, 0.92);
      const [bx, bz] = burrows[bIdx];
      const ang = slot * 2.1 + bIdx * 0.6;
      sq.position.set(bx + Math.cos(ang) * 0.44, 0.165, bz + Math.sin(ang) * 0.40);
      sq.rotation.y = rng.range(0, Math.PI * 2);
      this.p5SquirrelGroup.add(sq);
      this.p5Squirrels.push({ group: sq, isCaller, baseY: 0.165, divePhase: rng.range(0, 1) });
    }
  }

  public triggerHawkStrike(): void {
    this.p5StrikeTimer = 1.6;
    // Emit expanding 3D acoustic alarm-call rings from Caller squirrels!
    this.p5Squirrels.forEach((sq, idx) => {
      if (!sq.isCaller || idx % 2 !== 0) return;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.14, 0.2, 24),
        new THREE.MeshBasicMaterial({
          color: COL_HAWK,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
        })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(sq.group.position.x, 0.24, sq.group.position.z);
      this.pageGroups.hamilton.add(ring);
      this.p5AlarmRings.push({ mesh: ring, t: 0 });
    });
  }

  // =========================================================================
  // PAGE 6: CHECK SPECIMEN SWITCHER
  // =========================================================================

  public setCheckSpecimen(qIdx: number): void {
    while (this.p6Container.children.length > 0) {
      this.p6Container.remove(this.p6Container.children[0]);
    }
    if (qIdx === 0) {
      const c = this.pageGroups.shore.clone();
      c.visible = true;
      this.p6Container.add(c);
    } else if (qIdx === 1) {
      const c = this.pageGroups.bourgeois.clone();
      c.visible = true;
      this.p6Container.add(c);
    } else {
      const c = this.pageGroups.pedigree.clone();
      c.visible = true;
      this.p6Container.add(c);
    }
  }

  // =========================================================================
  // PAGE SWITCHING, CAMERA & ANIMATION LOOP
  // =========================================================================

  public setPage(page: SocialPageId): void {
    this.activePage = page;
    (Object.keys(this.pageGroups) as SocialPageId[]).forEach((k) => {
      this.pageGroups[k].visible = k === page;
    });

    if (page === 'shore') {
      this.targetAzimuth = 0.04;
      this.targetPolar = 0.64;
    } else if (page === 'bourgeois') {
      this.targetAzimuth = 0.2;
      this.targetPolar = 0.72;
    } else if (page === 'attrition') {
      this.targetAzimuth = 0.08;
      this.targetPolar = 0.78;
    } else if (page === 'pedigree') {
      this.targetAzimuth = 0.0;
      this.targetPolar = 0.56;
    } else if (page === 'hamilton') {
      this.targetAzimuth = 0.06;
      this.targetPolar = 0.66;
    } else {
      this.targetAzimuth = 0.04;
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
    this.camera.lookAt(0, 0.22, 0.08);
  }

  private bindPointerEvents(): void {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => {
      this.dragging = true;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    });
    el.addEventListener('pointermove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastPointer.x;
      const dy = e.clientY - this.lastPointer.y;
      this.lastPointer = { x: e.clientX, y: e.clientY };
      this.targetAzimuth -= dx * 0.0065;
      this.targetPolar = Math.max(0.2, Math.min(1.24, this.targetPolar - dy * 0.0055));
    });
    el.addEventListener('pointerup', (e) => {
      this.dragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
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

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = window.requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;
    const ease = 1 - Math.exp(-8.5 * dt);

    // Page 1: animate live contest crabs
    if (this.activePage === 'shore' && this.p1DuelLeft && this.p1DuelRight) {
      if (this.p1ContestT < 1) {
        this.p1ContestT = Math.min(1, this.p1ContestT + dt * 1.15);
      }
      const t = this.p1ContestT;
      if (t < 0.45) {
        const p = t / 0.45;
        this.p1DuelLeft.position.x = THREE.MathUtils.lerp(-0.98, -0.36, p);
        this.p1DuelRight.position.x = THREE.MathUtils.lerp(0.98, 0.36, p);
      } else {
        const p = (t - 0.45) / 0.55;
        if (this.p1ContestType === 'HH') {
          this.p1DuelLeft.position.x = THREE.MathUtils.lerp(-0.36, -0.82, p);
          this.p1DuelRight.position.x = THREE.MathUtils.lerp(0.36, 0.82, p);
          const ringMat = this.p1ShockRing.material as THREE.MeshBasicMaterial;
          ringMat.opacity = Math.max(0, 0.8 * (1 - p));
          this.p1ShockRing.scale.setScalar(1 + p * 2.2);
        } else if (this.p1ContestType === 'HD') {
          this.p1DuelLeft.position.x = THREE.MathUtils.lerp(-0.36, -0.26, p);
          this.p1DuelRight.position.x = THREE.MathUtils.lerp(0.36, 1.12, p);
          (this.p1ShockRing.material as THREE.MeshBasicMaterial).opacity = 0;
        } else {
          this.p1DuelLeft.position.x = -0.44 - Math.sin(elapsed * 4) * 0.04;
          this.p1DuelRight.position.x = 0.44 + Math.sin(elapsed * 4) * 0.04;
          (this.p1ShockRing.material as THREE.MeshBasicMaterial).opacity = 0;
        }
      }
    }

    // Page 2: smooth 3D strategy pillar heights
    if (this.activePage === 'bourgeois') {
      for (let i = 0; i < 3; i++) {
        this.p2CurFreqs[i] += (this.p2TargetFreqs[i] - this.p2CurFreqs[i]) * ease;
      }
      const cols = [this.p2ColH, this.p2ColD, this.p2ColB];
      cols.forEach((col, i) => {
        const h = Math.max(0.05, this.p2CurFreqs[i] * 2.05);
        col.scale.y = h;
        col.position.y = 0.12 + h / 2;
      });
    }

    // Page 3: animate War of Attrition rivals & histogram morph
    if (this.activePage === 'attrition') {
      const sway = Math.sin(elapsed * 3.2) * 0.07;
      this.p3CrabA.position.x = -0.68 + sway;
      this.p3CrabB.position.x = 0.68 - sway;
      for (let i = 0; i < this.p3Bars.length; i++) {
        const b = this.p3Bars[i];
        const curH = b.scale.y;
        const nextH = curH + (this.p3TargetBarH[i] - curH) * ease;
        b.scale.y = nextH;
        b.position.y = 0.12 + nextH / 2;
      }
    }

    // Page 5: circling 3D hawk casting shadow + alarm rings & ducking kin
    if (this.activePage === 'hamilton') {
      const ang = elapsed * 0.55;
      const rx = 1.65;
      const rz = 0.95;
      this.p5Hawk.position.set(Math.cos(ang) * rx, 1.82 + Math.sin(elapsed * 1.4) * 0.06, Math.sin(ang) * rz);
      this.p5Hawk.rotation.y = -ang;
      this.p5Hawk.rotation.z = 0.24; // graceful banked turn!

      if (this.p5StrikeTimer > 0) {
        this.p5StrikeTimer = Math.max(0, this.p5StrikeTimer - dt);
      }
      for (const sq of this.p5Squirrels) {
        const ducking = this.p5StrikeTimer > 0 && !sq.isCaller;
        const targetY = ducking ? sq.baseY - 0.14 : sq.baseY;
        sq.group.position.y += (targetY - sq.group.position.y) * ease;
      }

      for (let i = this.p5AlarmRings.length - 1; i >= 0; i--) {
        const ar = this.p5AlarmRings[i];
        ar.t += dt * 0.85;
        if (ar.t >= 1) {
          this.pageGroups.hamilton.remove(ar.mesh);
          this.p5AlarmRings.splice(i, 1);
          continue;
        }
        ar.mesh.scale.setScalar(1 + ar.t * 4.5);
        (ar.mesh.material as THREE.MeshBasicMaterial).opacity = 0.82 * (1 - ar.t);
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
