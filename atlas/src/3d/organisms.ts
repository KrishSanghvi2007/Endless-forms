// =============================================================================
// Endless Forms — Museum-Grade Naturalist Watercolour 3D Organism Library
// Upgraded to match Plates 11 & 13–16:
// - Continuous organic lofted geometry (createOrganicLoftGeometry), NOT glued spheres/cones
// - Hand-tinted 512x512 watercolour + stipple PBR textures (createNaturalistMaterial, cached!)
// - Fresnel sepia-ink silhouette rim darkening & matte paper finish (zero plastic glare!)
// - Zero floating 3D floor-plane HTML caption cards (clean specimen-only rag paper plates)
// =============================================================================

import * as THREE from 'three';
import {
  createNaturalistMaterial,
  createOrganicLoftGeometry,
  type WatercolourPalette,
} from './naturalistCraft';

/** Derives a cohesive 4-stop watercolour palette from any single hex colour. */
function paletteFromHex(hex: string): WatercolourPalette {
  const base = new THREE.Color(hex);
  const wash = base.clone().multiplyScalar(0.76);
  const deep = base.clone().multiplyScalar(0.45);
  const highlight = base.clone().lerp(new THREE.Color('#faf4e6'), 0.48);
  const ink = base.clone().multiplyScalar(0.32);
  return {
    base: `#${base.getHexString()}`,
    wash: `#${wash.getHexString()}`,
    deep: `#${deep.getHexString()}`,
    highlight: `#${highlight.getHexString()}`,
    ink: `#${ink.getHexString()}`,
  };
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
  jawTwist?: number;
  scale?: number;
  guardSide?: 'left' | 'right' | null;
}): CichlidHandle {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);
  const isPred = options.role === 'predator';

  const bodyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, -0.56),
    new THREE.Vector3(0, 0.01, -0.22),
    new THREE.Vector3(0, 0.02, 0.14),
    new THREE.Vector3(0, 0.0, 0.44),
    new THREE.Vector3(0, -0.01, 0.56),
  ]);
  const bodyGeo = createOrganicLoftGeometry(
    bodyCurve,
    (t) => 0.24 * Math.sin(Math.pow(t, 0.78) * Math.PI) + 0.015,
    {
      tubularSegs: 30,
      radialSegs: 20,
      aspectAt: () => [0.54, isPred ? 0.94 : 1.12],
      noiseAmp: 0.012,
    }
  );

  const bodyMat = createNaturalistMaterial(
    isPred
      ? { base: '#9e8860', wash: '#786342', deep: '#453620', highlight: '#dfd0ad', ink: '#302414' }
      : { base: '#7baeb2', wash: '#52878c', deep: '#2b5157', highlight: '#c5e2e4', ink: '#1d393d' },
    'scale',
    { roughness: 0.74, bumpScale: 0.025, inkStrength: 0.55, seed: isPred ? 601 : 602 }
  );

  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const finMat = createNaturalistMaterial(
    isPred
      ? { base: '#c48d4e', wash: '#9e682e', deep: '#5e3b14', highlight: '#ebca9b' }
      : { base: '#d68262', wash: '#ad5a3d', deep: '#6b321e', highlight: '#f2beaa' },
    'tissue',
    { roughness: 0.78, transparent: true, opacity: 0.84, side: THREE.DoubleSide, inkStrength: 0.42, seed: 603 }
  );

  // Swept dorsal fin crest along spine
  const dorsalShape = new THREE.Shape();
  dorsalShape.moveTo(-0.32, 0);
  dorsalShape.quadraticCurveTo(-0.08, 0.24, 0.24, 0.14);
  dorsalShape.lineTo(0.3, 0);
  dorsalShape.closePath();
  const dorsalGeo = new THREE.ExtrudeGeometry(dorsalShape, { depth: 0.012, bevelEnabled: false });
  dorsalGeo.rotateY(Math.PI / 2);
  const dorsal = new THREE.Mesh(dorsalGeo, finMat);
  dorsal.position.set(-0.006, isPred ? 0.17 : 0.21, -0.02);
  dorsal.castShadow = true;
  g.add(dorsal);

  // Anal fin underneath
  const analShape = new THREE.Shape();
  analShape.moveTo(-0.34, 0);
  analShape.quadraticCurveTo(-0.18, -0.15, -0.02, -0.08);
  analShape.lineTo(0.02, 0);
  analShape.closePath();
  const analGeo = new THREE.ExtrudeGeometry(analShape, { depth: 0.01, bevelEnabled: false });
  analGeo.rotateY(Math.PI / 2);
  const anal = new THREE.Mesh(analGeo, finMat);
  anal.position.set(-0.005, isPred ? -0.14 : -0.18, 0);
  g.add(anal);

  // Paired pectoral fins
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

  // Warm naturalist golden-ringed vertebrate eyes
  const irisMat = new THREE.MeshStandardMaterial({ color: 0xdec06b, roughness: 0.45 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 0.22 });
  for (const s of [-1, 1]) {
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.046, 12, 10), irisMat);
    iris.position.set(s * 0.086, 0.065, 0.34);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), pupilMat);
    pupil.position.set(s * 0.11, 0.065, 0.355);
    g.add(iris, pupil);
  }

  // Articulated Jaw Group — VISIBLY BENT LEFT OR RIGHT on Perissodus scale-eaters!
  const jawGroup = new THREE.Group();
  jawGroup.position.set(0, -0.025, 0.46);
  const twist = options.jawTwist ?? 0;
  jawGroup.rotation.y = twist;

  const jawHex = isPred ? (twist < -0.04 ? '#3c6ca8' : twist > 0.04 ? '#b85438' : '#7d6c52') : '#7ea6a8';
  const jawMat = createNaturalistMaterial(paletteFromHex(jawHex), 'keratin', {
    roughness: 0.72,
    inkStrength: 0.52,
    seed: 604,
  });
  const jawCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.02, -0.02),
    new THREE.Vector3(0, -0.02, 0.11),
    new THREE.Vector3(0, -0.01, 0.21),
  ]);
  const lowerJaw = new THREE.Mesh(
    createOrganicLoftGeometry(jawCurve, (t) => 0.08 * (1 - t * 0.42), {
      tubularSegs: 14,
      radialSegs: 12,
      aspectAt: () => [0.95, 0.68],
    }),
    jawMat
  );
  lowerJaw.castShadow = true;
  jawGroup.add(lowerJaw);

  if (isPred && Math.abs(twist) > 0.04) {
    const lip = new THREE.Mesh(
      new THREE.TorusGeometry(0.058, 0.014, 8, 14, Math.PI),
      createNaturalistMaterial(
        { base: '#f2ead6', wash: '#d6c9ab', deep: '#948668', highlight: '#fffdf5' },
        'bone',
        { roughness: 0.72, inkStrength: 0.4, seed: 605 }
      )
    );
    lip.rotation.x = Math.PI / 2;
    lip.position.set(0, 0.005, 0.14);
    jawGroup.add(lip);
  }
  g.add(jawGroup);

  if (options.guardSide) {
    const s = options.guardSide === 'left' ? 1 : -1;
    const shield = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.42, 18, 1, true, -0.65, 1.3),
      createNaturalistMaterial(
        { base: '#e0b248', wash: '#ba8922', deep: '#75530d', highlight: '#fae098' },
        'tissue',
        { roughness: 0.65, transparent: true, opacity: 0.56, side: THREE.DoubleSide, inkStrength: 0.3, seed: 606 }
      )
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
  const sw = options.tailCurveSign ?? 1;

  const skinMat = createNaturalistMaterial(
    paletteFromHex(options.dorsalHex ?? '#b39a76'),
    'scale',
    { roughness: 0.84, bumpScale: 0.028, inkStrength: 0.52, seed: 610 }
  );
  const throatMat = createNaturalistMaterial(
    paletteFromHex(options.throatHex),
    'tissue',
    { roughness: 0.72, inkStrength: 0.48, seed: 611 }
  );

  // Continuous single-piece lofted reptilian body from snout -> neck -> torso -> sinuous S-tail!
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.145, 0.52),
    new THREE.Vector3(0, 0.145, 0.34),
    new THREE.Vector3(0, 0.125, 0.18),
    new THREE.Vector3(0, 0.115, -0.02),
    new THREE.Vector3(0, 0.10, -0.24),
    new THREE.Vector3(sw * 0.09, 0.075, -0.52),
    new THREE.Vector3(sw * -0.05, 0.06, -0.78),
    new THREE.Vector3(sw * 0.07, 0.05, -1.04),
  ]);
  const bodyGeo = createOrganicLoftGeometry(
    spine,
    (t) => {
      // Snout tapers sharply (t=0), head swells (t~0.11), slight neck (t~0.19), full torso (t~0.34), long tapered tail
      if (t < 0.18) return 0.025 + 0.082 * Math.sin((t / 0.18) * Math.PI * 0.72);
      if (t < 0.48) return 0.08 + 0.055 * Math.sin(((t - 0.18) / 0.3) * Math.PI);
      return 0.075 * Math.pow(1 - (t - 0.48) / 0.52, 1.35) + 0.008;
    },
    {
      tubularSegs: 42,
      radialSegs: 16,
      aspectAt: (t) => (t < 0.48 ? [1.08, 0.72] : [0.95, 0.92]),
      noiseAmp: 0.015,
    }
  );
  const body = new THREE.Mesh(bodyGeo, skinMat);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Sculpted throat dewlap badge (Orange / Blue / Yellow — or 12 Anole morph hues!)
  const dewlap = new THREE.Mesh(new THREE.SphereGeometry(0.088, 14, 10), throatMat);
  dewlap.scale.set(0.88, 0.85, 1.35);
  dewlap.position.set(0, 0.095, 0.31);
  dewlap.castShadow = true;
  g.add(dewlap);

  // Eyes
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x181410, roughness: 0.18 });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), eyeMat);
    eye.position.set(s * 0.068, 0.17, 0.36);
    g.add(eye);
  }

  // Four curved jointed sprawling reptilian legs
  for (const s of [-1, 1]) {
    for (const [zPos, dzFoot] of [
      [0.16, 0.09],
      [-0.17, -0.07],
    ] as [number, number][]) {
      const legCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(s * 0.08, 0.10, zPos),
        new THREE.Vector3(s * 0.18, 0.09, zPos + dzFoot * 0.35),
        new THREE.Vector3(s * 0.24, 0.025, zPos + dzFoot),
      ]);
      const leg = new THREE.Mesh(
        createOrganicLoftGeometry(legCurve, (t) => 0.028 * (1 - t * 0.35), { tubularSegs: 10, radialSegs: 7 }),
        skinMat
      );
      leg.castShadow = true;
      g.add(leg);
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

  const coatMat = createNaturalistMaterial(
    isBull
      ? { base: '#596675', wash: '#3f4b59', deep: '#242d38', highlight: '#9caab8', ink: '#1a2129' }
      : { base: '#9e8d7a', wash: '#7a6a58', deep: '#4a3e32', highlight: '#d4c6b6', ink: '#30271e' },
    'fur',
    { roughness: 0.85, inkStrength: 0.52, seed: isBull ? 621 : 622 }
  );

  // Continuous single-piece lofted pinniped silhouette (arched head -> thick chest -> tapered hind)
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.22, 0.28),
    new THREE.Vector3(0, 0.19, 0.14),
    new THREE.Vector3(0, 0.125, -0.04),
    new THREE.Vector3(0, 0.085, -0.24),
    new THREE.Vector3(0, 0.06, -0.34),
  ]);
  const body = new THREE.Mesh(
    createOrganicLoftGeometry(
      spine,
      (t) => 0.03 + 0.125 * Math.sin(Math.pow(t, 0.72) * Math.PI),
      { tubularSegs: 28, radialSegs: 18, aspectAt: () => [0.95, 0.84] }
    ),
    coatMat
  );
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Characteristic inflatable proboscis on bull elephant seals!
  if (isBull) {
    const snoutCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.22, 0.26),
      new THREE.Vector3(0, 0.20, 0.35),
      new THREE.Vector3(0, 0.14, 0.38),
    ]);
    const snout = new THREE.Mesh(
      createOrganicLoftGeometry(snoutCurve, (t) => 0.042 * (1 - t * 0.28), { tubularSegs: 12, radialSegs: 10 }),
      coatMat
    );
    snout.castShadow = true;
    g.add(snout);
  }

  // Sculpted organic swept fore-flippers & paired hind-flippers
  for (const s of [-1, 1]) {
    const foreCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.10, 0.08, 0.10),
      new THREE.Vector3(s * 0.19, 0.04, 0.05),
      new THREE.Vector3(s * 0.24, 0.025, -0.03),
    ]);
    const fore = new THREE.Mesh(
      createOrganicLoftGeometry(foreCurve, (t) => 0.045 * (1 - t * 0.35), {
        tubularSegs: 10,
        radialSegs: 8,
        aspectAt: () => [1.3, 0.32],
      }),
      coatMat
    );
    fore.castShadow = true;

    const hindCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.04, 0.06, -0.28),
      new THREE.Vector3(s * 0.09, 0.04, -0.38),
      new THREE.Vector3(s * 0.12, 0.03, -0.45),
    ]);
    const hind = new THREE.Mesh(
      createOrganicLoftGeometry(hindCurve, (t) => 0.04 * (1 - t * 0.3), {
        tubularSegs: 10,
        radialSegs: 8,
        aspectAt: () => [1.2, 0.35],
      }),
      coatMat
    );
    g.add(fore, hind);
  }

  return g;
}

// =============================================================================
// 4. SCULPTED 3D BOTANICAL LEAF (Arched Veined Passiflora Leaf)
// =============================================================================

export function createBotanicalLeaf3D(scale = 1.0, hex = '#4a8052'): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  const leafMat = createNaturalistMaterial(paletteFromHex(hex), 'botanical', {
    roughness: 0.82,
    bumpScale: 0.024,
    inkStrength: 0.5,
    seed: 630,
  });

  const shape = new THREE.Shape();
  shape.moveTo(0, -0.68);
  shape.bezierCurveTo(0.48, -0.58, 0.62, -0.05, 0.42, 0.38);
  shape.bezierCurveTo(0.24, 0.68, 0.06, 0.78, 0, 0.85);
  shape.bezierCurveTo(-0.06, 0.78, -0.24, 0.68, -0.42, 0.38);
  shape.bezierCurveTo(-0.62, -0.05, -0.48, -0.58, 0, -0.68);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    pos.setY(i, pos.getY(i) + Math.cos(z * 1.4) * 0.055 - Math.abs(x) * 0.04);
  }
  geo.computeVertexNormals();

  const leaf = new THREE.Mesh(geo, leafMat);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  g.add(leaf);

  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.02, 0.64),
    new THREE.Vector3(0.02, 0.01, 0.82),
    new THREE.Vector3(0.05, 0.0, 0.94),
  ]);
  const stem = new THREE.Mesh(
    createOrganicLoftGeometry(stemCurve, () => 0.02, { tubularSegs: 10, radialSegs: 7 }),
    leafMat
  );
  g.add(stem);

  return g;
}

// =============================================================================
// 5. ARCHIVAL LABEL STUB (Clean Specimen-Only Rag Paper — Zero Clunky Floor Cards!)
// Every plate already has crisp editorial top caption pills & bottom legends.
// =============================================================================

export function createArchivalLabel(
  _title: string,
  _subtitle?: string,
  _width = 1.5,
  _accentHex = '#29211b'
): THREE.Mesh {
  const dummy = new THREE.Mesh();
  dummy.visible = false;
  return dummy;
}

// =============================================================================
// 6. SCULPTED 3D DROSOPHILA MELANOGASTER (Red vs. White X-Linked Eye Morphs)
// =============================================================================

export function createDrosophila3D(options: {
  eyeHex: string;
  isMale: boolean;
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);

  const thoraxMat = createNaturalistMaterial(
    { base: '#cc9a4e', wash: '#a6742e', deep: '#634112', highlight: '#f2d39b', ink: '#422a0a' },
    'keratin',
    { roughness: 0.78, inkStrength: 0.52, seed: 641 }
  );
  const stripeMat = createNaturalistMaterial(
    { base: '#403020', wash: '#2b1f14', deep: '#17100a', highlight: '#6e5740' },
    'keratin',
    { roughness: 0.82, inkStrength: 0.45, seed: 642 }
  );
  const eyeMat = createNaturalistMaterial(paletteFromHex(options.eyeHex), 'fruit', {
    roughness: 0.45,
    inkStrength: 0.48,
    seed: 643,
  });
  const wingMat = createNaturalistMaterial(
    { base: '#eef2f5', wash: '#d5dfe6', deep: '#97a7b3', highlight: '#ffffff' },
    'tissue',
    { roughness: 0.65, transparent: true, opacity: 0.56, side: THREE.DoubleSide, inkStrength: 0.35, seed: 644 }
  );

  // Continuous lofted Dipteran body (head -> arched thorax -> tapered abdomen)
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.155, 0.25),
    new THREE.Vector3(0, 0.155, 0.16),
    new THREE.Vector3(0, 0.15, 0.05),
    new THREE.Vector3(0, 0.135, -0.10),
    new THREE.Vector3(0, 0.115, options.isMale ? -0.32 : -0.38),
  ]);
  const body = new THREE.Mesh(
    createOrganicLoftGeometry(
      spine,
      (t) => {
        const head = 0.072 * Math.exp(-Math.pow((t - 0.1) / 0.12, 2));
        const thor = 0.108 * Math.exp(-Math.pow((t - 0.34) / 0.18, 2));
        const abd = 0.105 * Math.sin(Math.max(0, (t - 0.42) / 0.58) * Math.PI);
        return Math.max(0.02, head, thor, abd);
      },
      { tubularSegs: 28, radialSegs: 16, aspectAt: () => [0.92, 0.86] }
    ),
    thoraxMat
  );
  body.castShadow = true;
  g.add(body);

  // Dark abdominal tergite bands
  const bandZs = options.isMale ? [-0.12, -0.20, -0.27] : [-0.10, -0.18, -0.26];
  bandZs.forEach((bz, idx) => {
    const r = idx === 2 && options.isMale ? 0.08 : 0.09;
    const band = new THREE.Mesh(new THREE.TorusGeometry(r, 0.016, 6, 16), stripeMat);
    band.position.set(0, 0.13, bz);
    g.add(band);
  });

  // Prominent compound eyes (Red w+ vs White w!)
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.054, 12, 10), eyeMat);
    eye.scale.set(0.82, 1.08, 1.0);
    eye.position.set(s * 0.068, 0.16, 0.21);
    eye.castShadow = true;
    g.add(eye);
  }

  // Translucent swept Dipteran wings
  const wShape = new THREE.Shape();
  wShape.moveTo(0, 0);
  wShape.bezierCurveTo(0.12, 0.06, 0.34, 0.04, 0.42, -0.06);
  wShape.bezierCurveTo(0.36, -0.16, 0.16, -0.14, 0, -0.04);
  const wGeo = new THREE.ExtrudeGeometry(wShape, { depth: 0.005, bevelEnabled: false });
  wGeo.rotateX(-Math.PI / 2);
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(wGeo, wingMat);
    wing.position.set(s * 0.05, 0.22, 0.06);
    wing.rotation.y = s * -0.52;
    wing.rotation.z = s * 0.12;
    if (s === -1) wing.scale.x = -1;
    g.add(wing);
  }

  const legGeo = new THREE.CylinderGeometry(0.007, 0.005, 0.16, 5);
  for (const s of [-1, 1]) {
    for (const lz of [0.11, 0.02, -0.07]) {
      const leg = new THREE.Mesh(legGeo, stripeMat);
      leg.position.set(s * 0.11, 0.06, lz);
      leg.rotation.z = s * 0.55;
      g.add(leg);
    }
  }

  return g;
}

// =============================================================================
// 7. SCULPTED 3D ROCK POCKET MOUSE (Chaetodipus intermedius — Light vs Melanic)
// =============================================================================

export function createRockPocketMouse3D(isDark: boolean, scale = 1.0): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(scale);

  const furMat = createNaturalistMaterial(
    isDark
      ? { base: '#3d393d', wash: '#282529', deep: '#141214', highlight: '#736c73', ink: '#0d0b0d' }
      : { base: '#d4be96', wash: '#b0986f', deep: '#705d3f', highlight: '#f2e4c7', ink: '#4a3d27' },
    'fur',
    { roughness: 0.9, bumpScale: 0.026, inkStrength: 0.55, seed: isDark ? 651 : 652 }
  );
  const earMat = createNaturalistMaterial(
    isDark
      ? { base: '#575054', wash: '#3d373a', deep: '#242022', highlight: '#8a8086' }
      : { base: '#e0c8a8', wash: '#bfa380', deep: '#80684b', highlight: '#f7ead7' },
    'fur',
    { roughness: 0.86, inkStrength: 0.42, seed: 653 }
  );
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x141110, roughness: 0.18 });

  // Continuous single-piece lofted rodent silhouette (pointed muzzle -> head -> plump back -> rump)
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.145, 0.34),
    new THREE.Vector3(0, 0.165, 0.21),
    new THREE.Vector3(0, 0.155, 0.07),
    new THREE.Vector3(0, 0.135, -0.08),
    new THREE.Vector3(0, 0.095, -0.23),
  ]);
  const body = new THREE.Mesh(
    createOrganicLoftGeometry(
      spine,
      (t) => {
        const head = 0.092 * Math.sin(Math.min(1, t / 0.42) * Math.PI * 0.82);
        const torso = 0.142 * Math.sin(Math.max(0, (t - 0.15) / 0.85) * Math.PI);
        return Math.max(0.022, head, torso);
      },
      { tubularSegs: 28, radialSegs: 18, aspectAt: () => [0.94, 0.88] }
    ),
    furMat
  );
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  // Rounded pocket-mouse ears & dark bead eyes
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), earMat);
    ear.scale.set(0.42, 1.12, 0.95);
    ear.position.set(s * 0.072, 0.235, 0.17);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), eyeMat);
    eye.position.set(s * 0.06, 0.175, 0.26);
    g.add(ear, eye);
  }

  // Long graceful tapering desert-mouse tail
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.085, -0.20),
    new THREE.Vector3(0.08, 0.06, -0.46),
    new THREE.Vector3(-0.04, 0.04, -0.74),
  ]);
  const tail = new THREE.Mesh(
    createOrganicLoftGeometry(tailCurve, (t) => 0.022 * (1 - t * 0.58), { tubularSegs: 18, radialSegs: 8 }),
    earMat
  );
  tail.castShadow = true;
  g.add(tail);

  return g;
}

// =============================================================================
// 8. SCULPTED 3D BACTERIAL ROD & CONJUGATIVE PLASMID (E. coli / Resistance)
// =============================================================================

export function createBacteriumRod3D(options: {
  resistant: boolean;
  hasPlasmid?: boolean;
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);

  const cellMat = createNaturalistMaterial(
    options.resistant
      ? { base: '#c44b3d', wash: '#992e22', deep: '#59160f', highlight: '#f09c92', ink: '#3d0e09' }
      : { base: '#579480', wash: '#38705e', deep: '#1c4236', highlight: '#a3d4c3', ink: '#122e25' },
    'tissue',
    { roughness: 0.74, transparent: true, opacity: 0.88, inkStrength: 0.52, seed: options.resistant ? 661 : 662 }
  );

  const rodCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.26, 0.13, 0.015),
    new THREE.Vector3(0, 0.14, -0.01),
    new THREE.Vector3(0.26, 0.13, 0.015),
  ]);
  const rod = new THREE.Mesh(
    createOrganicLoftGeometry(rodCurve, (t) => 0.108 * Math.pow(Math.sin(t * Math.PI), 0.35), {
      tubularSegs: 20,
      radialSegs: 14,
    }),
    cellMat
  );
  rod.castShadow = true;
  g.add(rod);

  if (options.hasPlasmid) {
    const plasmid = new THREE.Mesh(
      new THREE.TorusGeometry(0.065, 0.016, 8, 18),
      createNaturalistMaterial(
        { base: '#e6b235', wash: '#bd8917', deep: '#755208', highlight: '#fce08b' },
        'keratin',
        { roughness: 0.55, inkStrength: 0.4, seed: 663 }
      )
    );
    plasmid.rotation.x = Math.PI / 2;
    plasmid.position.set(0.06, 0.14, 0);
    g.add(plasmid);
  }

  return g;
}

// =============================================================================
// 9. SCULPTED 3D TRINIDADIAN GUPPY (Poecilia reticulata — Sexual Selection)
// =============================================================================

export function createGuppy3D(options: {
  isMale: boolean;
  orangeScore?: number;
  tailLength?: number;
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);
  const orange = options.orangeScore ?? (options.isMale ? 0.85 : 0);
  const tailScale = options.tailLength ?? (options.isMale ? 1.25 : 0.85);

  const bodyMat = createNaturalistMaterial(
    options.isMale
      ? { base: '#6f96ab', wash: '#4a7187', deep: '#274454', highlight: '#b8d6e6', ink: '#1a2f3b' }
      : { base: '#9ca391', wash: '#78806e', deep: '#494f42', highlight: '#d4dbca', ink: '#31362c' },
    'scale',
    { roughness: 0.74, inkStrength: 0.52, seed: options.isMale ? 671 : 672 }
  );

  // Continuous fusiform guppy torso loft
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.16, -0.22),
    new THREE.Vector3(0, 0.165, 0.04),
    new THREE.Vector3(0, 0.16, 0.28),
  ]);
  const body = new THREE.Mesh(
    createOrganicLoftGeometry(
      spine,
      (t) => 0.11 * Math.sin(Math.pow(t, 0.78) * Math.PI) + 0.012,
      { tubularSegs: 22, radialSegs: 16, aspectAt: () => [0.56, 0.86] }
    ),
    bodyMat
  );
  body.castShadow = true;
  g.add(body);

  // Vibrant hand-tinted carotenoid orange flank spots on ornamented males!
  if (options.isMale && orange > 0.08) {
    const spotMat = createNaturalistMaterial(
      { base: '#e8682c', wash: '#bd4511', deep: '#752504', highlight: '#fcb186' },
      'scale',
      { roughness: 0.68, inkStrength: 0.4, seed: 673 }
    );
    const spotCount = Math.max(1, Math.round(orange * 4));
    for (let i = 0; i < spotCount; i++) {
      for (const s of [-1, 1]) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.03 + orange * 0.013, 10, 8), spotMat);
        spot.scale.set(0.32, 0.88, 1.25);
        spot.position.set(s * 0.054, 0.16 + (i % 2 === 0 ? 0.02 : -0.02), 0.11 - i * 0.068);
        g.add(spot);
      }
    }
  }

  // Fan-shaped watercolour caudal tail fin
  const tShape = new THREE.Shape();
  tShape.moveTo(0, 0);
  tShape.quadraticCurveTo(0.11 * tailScale, 0.13 * tailScale, 0.24 * tailScale, 0.12 * tailScale);
  tShape.quadraticCurveTo(0.19 * tailScale, 0, 0.24 * tailScale, -0.12 * tailScale);
  tShape.quadraticCurveTo(0.11 * tailScale, -0.13 * tailScale, 0, 0);
  const tGeo = new THREE.ExtrudeGeometry(tShape, { depth: 0.01, bevelEnabled: false });
  tGeo.rotateY(Math.PI / 2);
  const tailMat = createNaturalistMaterial(
    options.isMale && orange > 0.25
      ? { base: '#eb8334', wash: '#bf5d17', deep: '#753306', highlight: '#fcc492' }
      : { base: '#b8c0b4', wash: '#929c8e', deep: '#5c6359', highlight: '#e3e8e1' },
    'tissue',
    { roughness: 0.78, transparent: true, opacity: 0.86, side: THREE.DoubleSide, inkStrength: 0.42, seed: 674 }
  );
  const tail = new THREE.Mesh(tGeo, tailMat);
  tail.position.set(-0.005, 0.16, -0.19);
  tail.castShadow = true;
  g.add(tail);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.16 });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.021, 8, 8), eyeMat);
    eye.position.set(s * 0.042, 0.18, 0.21);
    g.add(eye);
  }

  return g;
}

// =============================================================================
// 10. SCULPTED 3D YELLOW DUNG FLY (Scathophaga stercoraria — Sperm Raffle)
// =============================================================================

export function createDungFly3D(options: { isMale: boolean; scale?: number }): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar((options.scale ?? 1.0) * (options.isMale ? 1.15 : 0.92));

  const coatMat = createNaturalistMaterial(
    options.isMale
      ? { base: '#d9a22e', wash: '#b07b15', deep: '#6b4706', highlight: '#f7d888', ink: '#472e03' }
      : { base: '#8f8862', wash: '#6b6543', deep: '#3f3b24', highlight: '#c9c3a1', ink: '#292616' },
    'fur',
    { roughness: 0.86, inkStrength: 0.52, seed: options.isMale ? 681 : 682 }
  );
  const eyeMat = createNaturalistMaterial(
    { base: '#9e3226', wash: '#751f16', deep: '#450e09', highlight: '#d97a70' },
    'fruit',
    { roughness: 0.45, inkStrength: 0.45, seed: 683 }
  );
  const wingMat = createNaturalistMaterial(
    { base: '#f5efe0', wash: '#ded4bc', deep: '#a3977c', highlight: '#fffdf7' },
    'tissue',
    { roughness: 0.68, transparent: true, opacity: 0.56, side: THREE.DoubleSide, inkStrength: 0.35, seed: 684 }
  );

  // Continuous lofted Dipteran body
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.17, 0.26),
    new THREE.Vector3(0, 0.165, 0.08),
    new THREE.Vector3(0, 0.15, -0.14),
    new THREE.Vector3(0, 0.13, -0.38),
  ]);
  const body = new THREE.Mesh(
    createOrganicLoftGeometry(
      spine,
      (t) => {
        const head = 0.072 * Math.exp(-Math.pow((t - 0.1) / 0.12, 2));
        const thor = 0.11 * Math.exp(-Math.pow((t - 0.34) / 0.18, 2));
        const abd = 0.102 * Math.sin(Math.max(0, (t - 0.42) / 0.58) * Math.PI);
        return Math.max(0.02, head, thor, abd);
      },
      { tubularSegs: 26, radialSegs: 14, aspectAt: () => [0.88, 0.86] }
    ),
    coatMat
  );
  body.castShadow = true;
  g.add(body);

  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.046, 10, 8), eyeMat);
    eye.position.set(s * 0.06, 0.185, 0.235);
    g.add(eye);
  }

  const wShape = new THREE.Shape();
  wShape.moveTo(0, 0);
  wShape.bezierCurveTo(0.12, 0.06, 0.36, 0.03, 0.45, -0.07);
  wShape.bezierCurveTo(0.38, -0.17, 0.16, -0.14, 0, -0.04);
  const wGeo = new THREE.ExtrudeGeometry(wShape, { depth: 0.005, bevelEnabled: false });
  wGeo.rotateX(-Math.PI / 2);
  for (const s of [-1, 1]) {
    const wing = new THREE.Mesh(wGeo, wingMat);
    wing.position.set(s * 0.05, 0.24, 0.08);
    wing.rotation.y = s * -0.42;
    if (s === -1) wing.scale.x = -1;
    g.add(wing);
  }

  return g;
}

// =============================================================================
// 11. SCULPTED 3D VIRGINIA OPOSSUM (Didelphis virginiana — Slow Island Ageing)
// =============================================================================

export function createOpossum3D(options: { greyness?: number; scale?: number }): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);
  const grey = options.greyness ?? 0.3;

  const furCol = new THREE.Color(0x9a938a).lerp(new THREE.Color(0xc8c3bc), grey);
  const furMat = createNaturalistMaterial(paletteFromHex(`#${furCol.getHexString()}`), 'fur', {
    roughness: 0.9,
    bumpScale: 0.026,
    inkStrength: 0.54,
    seed: 691 + Math.round(grey * 10),
  });
  const earMat = createNaturalistMaterial(
    { base: '#453c3d', wash: '#2e2728', deep: '#171314', highlight: '#786c6e' },
    'fur',
    { roughness: 0.85, inkStrength: 0.45, seed: 692 }
  );
  const pinkMat = createNaturalistMaterial(
    { base: '#d99e9c', wash: '#b57674', deep: '#754442', highlight: '#f5cecd' },
    'tissue',
    { roughness: 0.78, inkStrength: 0.42, seed: 693 }
  );

  // Continuous single-piece lofted marsupial body (pointed snout -> neck -> arched furred back -> rump)
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.195, 0.46),
    new THREE.Vector3(0, 0.21, 0.28),
    new THREE.Vector3(0, 0.20, 0.08),
    new THREE.Vector3(0, 0.17, -0.14),
    new THREE.Vector3(0, 0.13, -0.28),
  ]);
  const body = new THREE.Mesh(
    createOrganicLoftGeometry(
      spine,
      (t) => {
        if (t < 0.32) return 0.025 + 0.095 * (t / 0.32);
        return 0.17 * Math.sin(Math.max(0.05, (t - 0.14) / 0.86) * Math.PI);
      },
      { tubularSegs: 32, radialSegs: 18, aspectAt: () => [0.92, 0.88] }
    ),
    furMat
  );
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.028, 8, 8), pinkMat);
  nose.position.set(0, 0.195, 0.47);
  g.add(nose);

  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), earMat);
    ear.scale.set(0.35, 1.05, 0.95);
    ear.position.set(s * 0.082, 0.29, 0.22);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x151212, roughness: 0.18 })
    );
    eye.position.set(s * 0.058, 0.22, 0.32);
    g.add(ear, eye);
  }

  // Hairless pink tapering prehensile marsupial tail
  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.135, -0.25),
    new THREE.Vector3(0.09, 0.09, -0.52),
    new THREE.Vector3(0.02, 0.07, -0.78),
  ]);
  const tail = new THREE.Mesh(
    createOrganicLoftGeometry(tailCurve, (t) => 0.028 * (1 - t * 0.55), { tubularSegs: 16, radialSegs: 8 }),
    pinkMat
  );
  tail.castShadow = true;
  g.add(tail);

  return g;
}

// =============================================================================
// 12. SCULPTED 3D NEW ZEALAND MUD SNAIL (Potamopyrgus antipodarum — Red Queen)
// =============================================================================

export function createMudSnail3D(options: {
  shellHex?: string;
  infected?: boolean;
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);

  const shellMat = createNaturalistMaterial(
    paletteFromHex(options.shellHex ?? '#755b42'),
    'bone',
    { roughness: 0.78, bumpScale: 0.024, inkStrength: 0.55, seed: 701 }
  );
  const footMat = createNaturalistMaterial(
    options.infected
      ? { base: '#c27e76', wash: '#99554d', deep: '#5c2c26', highlight: '#ebbbb5' }
      : { base: '#bdb2a0', wash: '#968a77', deep: '#5e5546', highlight: '#e6dfd3' },
    'tissue',
    { roughness: 0.85, inkStrength: 0.45, seed: 702 }
  );

  // Soft muscular organic gastropod foot
  const footCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.04, -0.10),
    new THREE.Vector3(0, 0.045, 0.08),
    new THREE.Vector3(0, 0.04, 0.24),
  ]);
  const foot = new THREE.Mesh(
    createOrganicLoftGeometry(footCurve, (t) => 0.072 * Math.sin(Math.pow(t, 0.7) * Math.PI) + 0.012, {
      tubularSegs: 16,
      radialSegs: 12,
      aspectAt: () => [1.05, 0.55],
    }),
    footMat
  );
  foot.castShadow = true;
  g.add(foot);

  for (const s of [-1, 1]) {
    const tCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.025, 0.055, 0.19),
      new THREE.Vector3(s * 0.055, 0.095, 0.29),
    ]);
    g.add(
      new THREE.Mesh(
        createOrganicLoftGeometry(tCurve, (t) => 0.011 * (1 - t * 0.45), { tubularSegs: 8, radialSegs: 6 }),
        footMat
      )
    );
  }

  // Genuine continuous tapering helical turreted gastropod shell!
  const helixPts: THREE.Vector3[] = [];
  const turns = 3.2;
  for (let i = 0; i <= 38; i++) {
    const f = i / 38;
    const ang = f * turns * Math.PI * 2;
    const rad = 0.085 * (1 - f * 0.84);
    helixPts.push(new THREE.Vector3(Math.cos(ang) * rad, f * 0.36, Math.sin(ang) * rad));
  }
  const shellMesh = new THREE.Mesh(
    createOrganicLoftGeometry(
      new THREE.CatmullRomCurve3(helixPts),
      (t) => 0.088 * (1 - t * 0.85) + 0.012,
      { tubularSegs: 42, radialSegs: 12 }
    ),
    shellMat
  );
  shellMesh.position.set(0, 0.10, -0.02);
  shellMesh.rotation.x = -0.62;
  shellMesh.castShadow = true;
  g.add(shellMesh);

  return g;
}

// =============================================================================
// 13. SCULPTED 3D TREMATODE PARASITE (Microphallus cercaria — Red Queen)
// =============================================================================

export function createTrematode3D(options: { colorHex?: string; scale?: number }): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);

  const mat = createNaturalistMaterial(
    paletteFromHex(options.colorHex ?? '#c4454b'),
    'tissue',
    { roughness: 0.72, transparent: true, opacity: 0.9, inkStrength: 0.52, seed: 711 }
  );

  // Continuous leaf-shaped cercaria body -> sinuous swimming tail!
  const spine = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.08, 0.19),
    new THREE.Vector3(0, 0.085, 0.05),
    new THREE.Vector3(0, 0.08, -0.08),
    new THREE.Vector3(0.06, 0.08, -0.22),
    new THREE.Vector3(-0.05, 0.08, -0.36),
  ]);
  const mesh = new THREE.Mesh(
    createOrganicLoftGeometry(
      spine,
      (t) => (t < 0.45 ? 0.082 * Math.sin((t / 0.45) * Math.PI) : 0.024 * (1 - (t - 0.45) / 0.55) + 0.006),
      { tubularSegs: 28, radialSegs: 12, aspectAt: (t) => (t < 0.45 ? [1.05, 0.52] : [1, 1]) }
    ),
    mat
  );
  mesh.castShadow = true;
  g.add(mesh);

  return g;
}

// =============================================================================
// 14. SCULPTED 3D THREESPINE STICKLEBACK (Gasterosteus aculeatus — Pitx1)
// =============================================================================

export function createStickleback3D(options: {
  hasPelvicSpines: boolean;
  jawIntact: boolean;
  scale?: number;
}): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);

  const bodyMat = createNaturalistMaterial(
    options.jawIntact
      ? { base: '#62838c', wash: '#3f5e66', deep: '#1f363d', highlight: '#adc8cf', ink: '#15272c' }
      : { base: '#916e6b', wash: '#6b4946', deep: '#3d2422', highlight: '#cfaead', ink: '#291716' },
    'scale',
    { roughness: 0.74, inkStrength: 0.54, seed: options.jawIntact ? 721 : 722 }
  );
  const spineMat = createNaturalistMaterial(
    { base: '#e8dec9', wash: '#c9bca0', deep: '#877a5f', highlight: '#faf6ec' },
    'bone',
    { roughness: 0.75, inkStrength: 0.48, seed: 723 }
  );
  const pelvicMat = createNaturalistMaterial(
    { base: '#d97236', wash: '#b04e19', deep: '#6b2a08', highlight: '#f7b88d' },
    'bone',
    { roughness: 0.7, inkStrength: 0.5, seed: 724 }
  );

  // Continuous streamlined stickleback fuselage
  const fuseCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.22, -0.34),
    new THREE.Vector3(0, 0.22, 0.0),
    new THREE.Vector3(0, 0.215, 0.34),
  ]);
  const body = new THREE.Mesh(
    createOrganicLoftGeometry(
      fuseCurve,
      (t) => 0.138 * Math.sin(Math.pow(t, 0.78) * Math.PI) + 0.012,
      { tubularSegs: 26, radialSegs: 16, aspectAt: () => [0.56, 0.86] }
    ),
    bodyMat
  );
  body.castShadow = true;
  g.add(body);

  // Three signature dorsal spines
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.14, 7), spineMat);
    sp.position.set(0, 0.36, 0.14 - i * 0.11);
    sp.rotation.x = -0.35;
    sp.castShadow = true;
    g.add(sp);
  }

  // Forked caudal tail fin
  const tShape = new THREE.Shape();
  tShape.moveTo(0, 0);
  tShape.lineTo(0.22, 0.13);
  tShape.lineTo(0.16, 0);
  tShape.lineTo(0.22, -0.13);
  tShape.closePath();
  const tGeo = new THREE.ExtrudeGeometry(tShape, { depth: 0.01, bevelEnabled: false });
  tGeo.rotateY(Math.PI / 2);
  const tail = new THREE.Mesh(tGeo, bodyMat);
  tail.position.set(-0.005, 0.22, -0.32);
  g.add(tail);

  // Ventral pelvic girdle & defensive spines (controlled by Pitx1 pelvic enhancer!)
  if (options.hasPelvicSpines) {
    const gCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.11, -0.05),
      new THREE.Vector3(0, 0.105, 0.08),
    ]);
    g.add(
      new THREE.Mesh(
        createOrganicLoftGeometry(gCurve, () => 0.036, {
          tubularSegs: 8,
          radialSegs: 8,
          aspectAt: () => [1.3, 0.55],
        }),
        pelvicMat
      )
    );
    for (const s of [-1, 1]) {
      const pSpine = new THREE.Mesh(new THREE.ConeGeometry(0.017, 0.18, 7), pelvicMat);
      pSpine.position.set(s * 0.055, 0.05, -0.02);
      pSpine.rotation.x = Math.PI + 0.45;
      pSpine.rotation.z = s * 0.35;
      pSpine.castShadow = true;
      g.add(pSpine);
    }
  }

  // Lower jaw (damaged if Pitx1 coding protein is knocked out!)
  const jaw = new THREE.Mesh(
    new THREE.SphereGeometry(options.jawIntact ? 0.056 : 0.028, 10, 8),
    options.jawIntact
      ? bodyMat
      : createNaturalistMaterial(paletteFromHex('#b83428'), 'tissue', { roughness: 0.78, seed: 725 })
  );
  jaw.scale.set(0.76, 0.68, 1.15);
  jaw.position.set(0, 0.198, 0.295);
  g.add(jaw);

  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x101418, roughness: 0.15 });
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 8), eyeMat);
    eye.position.set(s * 0.056, 0.25, 0.25);
    g.add(eye);
  }

  return g;
}

// =============================================================================
// 15. SCULPTED 3D DAPHNIA WATER FLEA (Inducible Predator Helmet — Plasticity)
// =============================================================================

export function createDaphnia3D(options: { helmetSize: number; scale?: number }): THREE.Group {
  const g = new THREE.Group();
  g.scale.setScalar(options.scale ?? 1.0);
  const h = Math.max(0, Math.min(1, options.helmetSize));

  const shellMat = createNaturalistMaterial(
    { base: '#cfe6e3', wash: '#9ec4bf', deep: '#5e8a84', highlight: '#f2faf9', ink: '#3d635e' },
    'tissue',
    { roughness: 0.65, transparent: true, opacity: 0.72, inkStrength: 0.48, seed: 731 }
  );
  const gutMat = createNaturalistMaterial(
    { base: '#62945e', wash: '#416e3d', deep: '#224220', highlight: '#a3cf9f' },
    'botanical',
    { roughness: 0.82, inkStrength: 0.4, seed: 732 }
  );

  // Continuous translucent carapace -> curved head -> inducible curved helmet crest!
  const bodyCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.14, -0.34 - h * 0.14), // Posterior tail spine tip
    new THREE.Vector3(0, 0.21, -0.14),
    new THREE.Vector3(0, 0.23, 0.04),
    new THREE.Vector3(0, 0.26, 0.20),
    new THREE.Vector3(0, 0.34 + h * 0.24, 0.24 + h * 0.10), // Curved helmet crest!
  ]);
  const carapace = new THREE.Mesh(
    createOrganicLoftGeometry(
      bodyCurve,
      (t) => {
        if (t < 0.2) return 0.008 + (t / 0.2) * 0.025; // slender tail spine
        if (t < 0.72) return 0.155 * Math.sin(((t - 0.18) / 0.56) * Math.PI); // oval bivalve carapace
        // Inducible helmet crest: tiny rounded brow at h=0, tall swept crest at h=1!
        const hf = (t - 0.72) / 0.28;
        return (0.092 * (1 - hf * (0.65 + h * 0.28))) * (0.65 + h * 0.45);
      },
      { tubularSegs: 34, radialSegs: 16, aspectAt: () => [0.62, 1.05] }
    ),
    shellMat
  );
  carapace.castShadow = true;
  g.add(carapace);

  // Visible curved green algae gut inside translucent body!
  const gutCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.20, -0.12),
    new THREE.Vector3(0, 0.23, 0.02),
    new THREE.Vector3(0, 0.23, 0.14),
  ]);
  g.add(
    new THREE.Mesh(
      createOrganicLoftGeometry(gutCurve, () => 0.038, { tubularSegs: 14, radialSegs: 8 }),
      gutMat
    )
  );

  // Prominent compound eye
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.15 })
  );
  eye.position.set(0, 0.26, 0.26);
  g.add(eye);

  // Paired curved branched swimming antennae
  for (const s of [-1, 1]) {
    const antCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(s * 0.05, 0.26, 0.18),
      new THREE.Vector3(s * 0.15, 0.30, 0.22),
      new THREE.Vector3(s * 0.24, 0.27, 0.12),
    ]);
    g.add(
      new THREE.Mesh(
        createOrganicLoftGeometry(antCurve, (t) => 0.013 * (1 - t * 0.45), { tubularSegs: 12, radialSegs: 6 }),
        shellMat
      )
    );
  }

  return g;
}
