// =============================================================================
// Endless Forms — Museum-Grade Procedural 3D Organism & Botanical Library
// Hand-tinted natural-history textures + anatomically lofted Three.js forms.
// Zero clunky primitives: real fish, lizards, seals, flies, leaves & branches!
// =============================================================================

import * as THREE from 'three';
import { createSeededRng } from '../sim/adapter';

// =============================================================================
// SHARED PROCEDURAL WATERCOLOUR & SCALE TEXTURES
// =============================================================================

const scaleTexCache = new Map<string, THREE.CanvasTexture>();

/** Hand-tinted natural-history fish scale & barred body texture */
function getFishScaleTexture(baseHex: string, barHex: string, barred: boolean): THREE.CanvasTexture {
  const key = `${baseHex}_${barHex}_${barred}`;
  const hit = scaleTexCache.get(key);
  if (hit) return hit;

  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, barHex);
  grad.addColorStop(0.32, baseHex);
  grad.addColorStop(0.75, baseHex);
  grad.addColorStop(1, '#f4efe2'); // silvery pale belly
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);

  // Subtle vertical Tanganyika flank bars
  if (barred) {
    ctx.fillStyle = 'rgba(34, 38, 42, 0.34)';
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.ellipse(42 + i * 28, 48, 7.5, 42, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Fine imbricated iridescent fish scales
  ctx.strokeStyle = 'rgba(255, 252, 240, 0.24)';
  ctx.lineWidth = 1.1;
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 22; col++) {
      const x = col * 12 + (row % 2) * 6;
      const y = row * 12 + 8;
      ctx.beginPath();
      ctx.arc(x, y, 6.2, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  scaleTexCache.set(key, tex);
  return tex;
}

function getLizardSkinTexture(dorsalHex: string, spotHex: string): THREE.CanvasTexture {
  const key = `liz_${dorsalHex}_${spotHex}`;
  const hit = scaleTexCache.get(key);
  if (hit) return hit;

  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const rng = createSeededRng(777);

  ctx.fillStyle = dorsalHex;
  ctx.fillRect(0, 0, 256, 128);

  // Organic dorsal chevrons & pebble scales
  for (let i = 0; i < 160; i++) {
    ctx.fillStyle = i % 3 === 0 ? spotHex : 'rgba(255,248,232,0.22)';
    ctx.beginPath();
    ctx.arc(rng.range(0, 256), rng.range(0, 128), rng.range(2.2, 5.2), 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  scaleTexCache.set(key, tex);
  return tex;
}

// =============================================================================
// 1. SCULPTED 3D LAKE TANGANYIKA CICHLID (Perissodus microlepis & Prey)
// =============================================================================

export interface CichlidHandle {
  group: THREE.Group;
  tailPivot: THREE.Group;
  jawGroup: THREE.Group;
  phase: number;
}

export function createCichlidFish3D(options: {
  role: 'predator' | 'prey';
  /** Jaw twist in radians: negative = bends LEFT (attacks prey's right flank), positive = bends RIGHT */
  jawTwist?: number;
  scale?: number;
  guardSide?: 'left' | 'right' | null;
}): CichlidHandle {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);
  const isPred = options.role === 'predator';

  // Lofted fusiform fish torso via LatheGeometry (axis along +Y -> rotated to +Z forward)
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0.01, -0.58), // caudal peduncle
    new THREE.Vector2(0.085, -0.45),
    new THREE.Vector2(0.18, -0.22),
    new THREE.Vector2(0.24, 0.04),
    new THREE.Vector2(0.21, 0.28),
    new THREE.Vector2(0.14, 0.44),
    new THREE.Vector2(0.055, 0.54), // snout tip
    new THREE.Vector2(0.005, 0.56),
  ];
  const bodyGeo = new THREE.LatheGeometry(profile, 22);
  bodyGeo.rotateX(Math.PI / 2);
  // Laterally compress fish body cleanly (cichlids are deep-bodied & sleek!)
  bodyGeo.scale(0.54, isPred ? 0.92 : 1.12, 1.0);

  const skinTex = isPred
    ? getFishScaleTexture('#9c865e', '#4f4432', true)
    : getFishScaleTexture('#88b8ba', '#3e6f78', false);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    map: skinTex,
    roughness: 0.34,
    metalness: 0.16,
    clearcoat: 0.55,
    clearcoatRoughness: 0.28,
  });

  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Translucent watercolour fin material
  const finMat = new THREE.MeshPhysicalMaterial({
    color: isPred ? 0xc48b48 : 0xd97c5b,
    roughness: 0.35,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
  });

  // Swept dorsal fin crest along spine
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(-0.32, 0);
  dorsalShape.quadraticCurveTo(-0.08, 0.24, 0.24, 0.14);
  dorsalShape.lineTo(0.30, 0);
  dorsalShape.closePath();
  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, { depth: 0.014, bevelEnabled: false });
  dorsalGeo.rotateY(Math.PI / 2);
  const dorsal = new THREE.Mesh(dorsalGeo, finMat);
  dorsal.position.set(-0.007, isPred ? 0.17 : 0.21, -0.02);
  dorsal.castShadow = true;
  g.add(dorsal);

  // Anal fin underneath
  const analShape = new THREE.Shape();
  analShape.moveTo(-0.34, 0);
  analShape.quadraticCurveTo(-0.18, -0.15, -0.02, -0.08);
  analShape.lineTo(0.02, 0);
  analShape.closePath();
  const analGeo = new THREE.ExtrudeGeometry(analShape, { depth: 0.012, bevelEnabled: false });
  analGeo.rotateY(Math.PI / 2);
  const anal = new THREE.Mesh(analGeo, finMat);
  anal.position.set(-0.006, isPred ? -0.14 : -0.18, 0);
  g.add(anal);

  // Paired pectoral fins flaring softly from flanks
  const pecShape = new THREE.Shape();
  pecShape.moveTo(0, 0);
  pecShape.quadraticCurveTo(0.18, 0.08, 0.26, -0.04);
  pecShape.quadraticCurveTo(0.16, -0.13, 0, -0.05);
  pecShape.closePath();
  const pecGeo = new THREE.ExtrudeGeometry(pecShape, { depth: 0.008, bevelEnabled: false });
  for (const s of [-1, 1]) {
    const pf = new THREE.Mesh(pecGeo, finMat);
    pf.position.set(s * 0.11, -0.04, 0.16);
    pf.rotation.y = s * -0.95;
    pf.rotation.z = s * -0.25;
    if (s === -1) pf.scale.x = -1;
    g.add(pf);
  }

  // Animated forked caudal tail fin
  const tailPivot = new THREE.Group();
  tailPivot.position.set(0, 0, -0.54);
  const tailShape = new THREE.Shape();
  tailShape.moveTo(0, 0.05);
  tailShape.quadraticCurveTo(-0.24, 0.24, -0.34, 0.22);
  tailShape.quadraticCurveTo(-0.22, 0.0, -0.34, -0.22);
  tailShape.quadraticCurveTo(-0.24, -0.24, 0, -0.05);
  tailShape.closePath();
  const tailGeo = new THREE.ExtrudeGeometry(tailShape, { depth: 0.012, bevelEnabled: false });
  tailGeo.rotateY(-Math.PI / 2);
  const tailMesh = new THREE.Mesh(tailGeo, finMat);
  tailMesh.position.x = 0.006;
  tailMesh.castShadow = true;
  tailPivot.add(tailMesh);
  g.add(tailPivot);

  // Glossy golden-ringed vertebrate eyes
  const irisMat = new THREE.MeshStandardMaterial({ color: 0xe6be56, roughness: 0.25 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x161412, roughness: 0.12 });
  for (const s of [-1, 1]) {
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), irisMat);
    iris.position.set(s * 0.088, 0.065, 0.34);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.030, 10, 8), pupilMat);
    pupil.position.set(s * 0.112, 0.065, 0.355);
    g.add(iris, pupil);
  }

  // Articulated Jaw Group — VISIBLY BENT LEFT OR RIGHT on Perissodus scale-eaters!
  const jawGroup = new THREE.Group();
  jawGroup.position.set(0, -0.025, 0.46);
  const twist = options.jawTwist ?? 0;
  jawGroup.rotation.y = twist;

  const jawMat = new THREE.MeshPhysicalMaterial({
    color: isPred ? (twist < -0.04 ? 0x2b62c9 : twist > 0.04 ? 0xc9542b : 0x7d6c52) : 0x7ea6a8,
    roughness: 0.32,
    clearcoat: 0.5,
  });
  const lowerJaw = new THREE.Mesh(new THREE.SphereGeometry(0.088, 12, 10), jawMat);
  lowerJaw.scale.set(0.82, 0.64, 1.55);
  lowerJaw.position.set(0, -0.02, 0.09);
  lowerJaw.castShadow = true;
  jawGroup.add(lowerJaw);

  // Subtle curved tooth lip arc so the bent scale-scraping jaw reads unmistakably in 3D!
  if (isPred && Math.abs(twist) > 0.04) {
    const lip = new THREE.Mesh(
      new THREE.TorusGeometry(0.062, 0.015, 8, 14, Math.PI),
      new THREE.MeshStandardMaterial({ color: 0xf7f1e1, roughness: 0.3 })
    );
    lip.rotation.x = Math.PI / 2;
    lip.position.set(0, 0.005, 0.14);
    jawGroup.add(lip);
  }
  g.add(jawGroup);

  // Optional translucent golden Flank Guard crescent shield on prey fish
  if (options.guardSide) {
    const s = options.guardSide === 'left' ? 1 : -1;
    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.42, 18, 1, true, -0.65, 1.3),
      new THREE.MeshPhysicalMaterial({
        color: 0xe6b432,
        emissive: 0x7a5408,
        emissiveIntensity: 0.35,
        transparent: true,
        opacity: 0.58,
        side: THREE.DoubleSide,
        roughness: 0.2,
      })
    );
    shield.rotation.x = Math.PI / 2;
    shield.rotation.z = s === 1 ? Math.PI / 2 : -Math.PI / 2;
    shield.position.set(s * 0.14, 0, -0.02);
    g.add(shield);
  }

  return { group: g, tailPivot, jawGroup, phase: Math.random() * Math.PI * 2 };
}

// =============================================================================
// 2. SCULPTED 3D SIDE-BLOTCHED LIZARD (Uta stansburiana) & ISLAND ANOLES
// =============================================================================

export function createSculptedLizard3D(options: {
  throatHex: string;
  dorsalHex?: string;
  spotHex?: string;
  scale?: number;
  tailCurveSign?: number;
}): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);

  const skinTex = getLizardSkinTexture(options.dorsalHex ?? '#b69c78', options.spotHex ?? '#6b533b');
  const skinMat = new THREE.MeshStandardMaterial({ map: skinTex, roughness: 0.68 });
  const throatMat = new THREE.MeshPhysicalMaterial({
    color: options.throatHex,
    emissive: new THREE.Color(options.throatHex).multiplyScalar(0.28),
    roughness: 0.35,
    clearcoat: 0.45,
  });

  // Organic tapered torso + head
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), skinMat);
  torso.scale.set(0.92, 0.65, 2.25);
  torso.position.set(0, 0.11, 0);
  torso.castShadow = true;
  g.add(torso);

  // Sculpted angular lizard head
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.105, 0.28, 10), skinMat);
  head.rotation.x = Math.PI / 2;
  head.scale.set(1.0, 1.0, 0.62);
  head.position.set(0, 0.145, 0.40);
  head.castShadow = true;
  g.add(head);

  // Vivid throat dewlap badge (Orange / Blue / Yellow — or 12 Anole morph hues!)
  const dewlap = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), throatMat);
  dewlap.scale.set(0.85, 0.85, 1.35);
  dewlap.position.set(0, 0.095, 0.34);
  dewlap.castShadow = true;
  g.add(dewlap);

  // Tiny glossy eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x161412, roughness: 0.15 });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
    eye.position.set(s * 0.068, 0.175, 0.37);
    g.add(eye);
  }

  // Sinuous S-curved reptilian tail via tapered TubeGeometry
  const sw = options.tailCurveSign ?? 1;
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.09, -0.26),
    new THREE.Vector3(sw * 0.09, 0.075, -0.52),
    new THREE.Vector3(sw * -0.05, 0.06, -0.78),
    new THREE.Vector3(sw * 0.07, 0.05, -1.02),
  ]);
  const tailGeo = new THREE.TubeGeometry(tailCurve, 18, 0.048, 8, false);
  // Taper tail radius smoothly toward the tip
  const tPos = tailGeo.attributes.position;
  for (let i = 0; i < tPos.count; i++) {
    const z = tPos.getZ(i);
    const frac = Math.max(0.15, Math.min(1, (z + 1.06) / 0.82));
    const center = tailCurve.getPoint(Math.max(0, Math.min(1, (-0.26 - z) / 0.78)));
    tPos.setX(i, center.x + (tPos.getX(i) - center.x) * frac);
    tPos.setY(i, center.y + (tPos.getY(i) - center.y) * frac);
  }
  tailGeo.computeVertexNormals();
  const tail = new THREE.Mesh(tailGeo, skinMat);
  tail.castShadow = true;
  g.add(tail);

  // Four articulated sprawling lizard legs
  const legGeo = new THREE.CylinderGeometry(0.024, 0.018, 0.22, 7);
  const footGeo = new THREE.SphereGeometry(0.032, 8, 6);
  footGeo.scale(1.2, 0.4, 1.5);
  for (const s of [-1, 1]) {
    for (const [zPos, rotY] of [
      [0.16, 0.45],
      [-0.17, -0.52],
    ] as [number, number][]) {
      const leg = new THREE.Mesh(legGeo, skinMat);
      leg.position.set(s * 0.16, 0.075, zPos);
      leg.rotation.z = s * 1.08;
      leg.rotation.y = s * rotY;
      leg.castShadow = true;

      const foot = new THREE.Mesh(footGeo, skinMat);
      foot.position.set(s * 0.24, 0.025, zPos + (zPos > 0 ? 0.05 : -0.04));
      g.add(leg, foot);
    }
  }

  return g;
}

// =============================================================================
// 3. SCULPTED 3D NORTHERN ELEPHANT SEAL (Bull vs. Cow — Harem Ne)
// =============================================================================

export function createElephantSeal3D(isBull: boolean, scale = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale * (isBull ? 1.28 : 0.86));

  const coatMat = new THREE.MeshStandardMaterial({
    color: isBull ? 0x4d5a6b : 0x9c8b78,
    roughness: 0.62,
  });
  const bellyMat = new THREE.MeshStandardMaterial({
    color: isBull ? 0x6e7884 : 0xc4b5a2,
    roughness: 0.7,
  });

  // Streamlined pinniped body
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.14, 14, 12), coatMat);
  body.scale.set(0.95, 0.78, 1.95);
  body.position.set(0, 0.11, 0);
  body.castShadow = true;
  g.add(body);

  // Raised neck & head
  const neck = new THREE.Mesh(new THREE.SphereGeometry(0.105, 12, 10), isBull ? coatMat : bellyMat);
  neck.scale.set(0.95, 1.15, 1.0);
  neck.position.set(0, 0.19, 0.21);
  neck.castShadow = true;
  g.add(neck);

  // Characteristic inflatable proboscis on bull elephant seals!
  if (isBull) {
    const snout = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.08, 6, 8), coatMat);
    snout.rotation.x = 0.75;
    snout.position.set(0, 0.18, 0.31);
    g.add(snout);
  }

  // Swept fore-flippers & paired hind-flippers
  const flipGeo = new THREE.BoxGeometry(0.18, 0.025, 0.09);
  for (const s of [-1, 1]) {
    const fore = new THREE.Mesh(flipGeo, coatMat);
    fore.position.set(s * 0.14, 0.04, 0.10);
    fore.rotation.y = s * -0.45;
    const hind = new THREE.Mesh(flipGeo, coatMat);
    hind.scale.set(0.75, 1, 1.2);
    hind.position.set(s * 0.06, 0.04, -0.28);
    hind.rotation.y = s * 0.35;
    g.add(fore, hind);
  }

  return g;
}

// =============================================================================
// 4. SCULPTED 3D BOTANICAL LEAF (Arched Veined Passiflora Leaf)
// =============================================================================

export function createBotanicalLeaf3D(scale = 1.0, hex = '#3f7d4a'): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  // Create delicate veined leaf texture
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(182, 224, 152, 0.55)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(64, 12);
  ctx.lineTo(64, 118);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) {
    const y = 28 + i * 18;
    ctx.beginPath();
    ctx.moveTo(64, y);
    ctx.quadraticCurveTo(36, y - 8, 16, y - 16);
    ctx.moveTo(64, y);
    ctx.quadraticCurveTo(92, y - 8, 112, y - 16);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;

  const shape = new THREE.Shape();
  shape.moveTo(0, -0.68);
  shape.bezierCurveTo(0.48, -0.58, 0.62, -0.05, 0.42, 0.38);
  shape.bezierCurveTo(0.24, 0.68, 0.06, 0.78, 0, 0.85);
  shape.bezierCurveTo(-0.06, 0.78, -0.24, 0.68, -0.42, 0.38);
  shape.bezierCurveTo(-0.62, -0.05, -0.48, -0.58, 0, -0.68);

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 1 });
  geo.rotateX(-Math.PI / 2);
  // Subtle organic arch along the leaf blade
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, pos.getY(i) + Math.cos(z * 1.4) * 0.055 - Math.abs(x) * 0.04);
  }
  geo.computeVertexNormals();

  const leaf = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }));
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  g.add(leaf);

  // Petiole stem
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.024, 0.28, 7),
    new THREE.MeshStandardMaterial({ color: 0x356138, roughness: 0.75 })
  );
  stem.rotation.x = Math.PI / 2;
  stem.position.set(0, 0.02, 0.78);
  g.add(stem);

  return g;
}

// =============================================================================
// 5. REFINED ARCHIVAL PAPER CAPTION SLIP (Lightweight, No Clunky Box!)
// =============================================================================

export function createArchivalLabel(
  title: string,
  subtitle?: string,
  width = 1.5,
  accentHex = '#29211b'
): THREE.Mesh {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = subtitle ? 152 : 96;
  const ctx = c.getContext('2d')!;

  ctx.fillStyle = 'rgba(250, 245, 234, 0.94)';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = 'rgba(140, 120, 92, 0.55)';
  ctx.lineWidth = 4;
  ctx.strokeRect(6, 6, c.width - 12, c.height - 12);

  ctx.fillStyle = accentHex;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = subtitle ? '700 40px Georgia, serif' : '700 44px Georgia, serif';
  ctx.fillText(title, c.width / 2, subtitle ? 56 : c.height / 2, c.width - 48);

  if (subtitle) {
    ctx.fillStyle = '#685948';
    ctx.font = '500 26px "IBM Plex Mono", monospace';
    ctx.fillText(subtitle, c.width / 2, 112, c.width - 48);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const height = width * (c.height / c.width);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true })
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}
